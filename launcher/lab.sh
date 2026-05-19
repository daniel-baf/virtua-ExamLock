#!/bin/bash
# ExamLock — Modo Laboratorio (Linux)
# Uso: ./launcher/lab.sh <SESSION_CODE>
# Requiere: docker, cage, chromium-browser (o chromium), grim o scrot, ffmpeg
# Corre como el usuario del escritorio (no root).

set -euo pipefail

SESSION_CODE="${1:-}"
SERVER_URL="${EXAMLOCK_SERVER_URL:-https://exam-server-xxxx-uc.a.run.app}"
IMAGE="${EXAMLOCK_IMAGE:-examlock/agent:latest}"
AGENT_URL="http://localhost:7878"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROCTOR_DIR="$(cd "$SCRIPT_DIR/../proctor" && pwd)"

# shellcheck source=./lib/runtime.sh
source "$SCRIPT_DIR/lib/runtime.sh"

# ── Validaciones ─────────────────────────────────────────────────────────────

if [ -z "$SESSION_CODE" ]; then
  echo "Uso: $0 <SESSION_CODE>"
  exit 1
fi

require_command docker
require_command cage
CHROMIUM="$(find_chromium)"

# ── Docker: red aislada ───────────────────────────────────────────────────────

ensure_docker_network exam-net

# ── Descarga imagen ───────────────────────────────────────────────────────────

echo "Actualizando imagen…"
docker pull "$IMAGE"

# ── Limpia container previo si quedó colgado ─────────────────────────────────

docker rm -f examlock-student 2>/dev/null || true

# ── Lanza container ───────────────────────────────────────────────────────────

echo "Iniciando agente…"
docker run -d \
  --name examlock-student \
  --network exam-net \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --read-only \
  --tmpfs /tmp:noexec,size=64m \
  -p 127.0.0.1:7878:7878 \
  -e SESSION_CODE="$SESSION_CODE" \
  -e SERVER_URL="$SERVER_URL" \
  "$IMAGE"

# Espera a que el agente esté listo
echo "Esperando agente…"
for i in $(seq 1 20); do
  if curl -sf "$AGENT_URL/" &>/dev/null; then break; fi
  sleep 0.5
done

# ── Proctor (captura pantalla + cámara en background) ────────────────────────

if [ -x "$PROCTOR_DIR/start.sh" ]; then
  echo "Iniciando proctor…"
  "$PROCTOR_DIR/start.sh" "$AGENT_URL" &
  PROCTOR_PID=$!
else
  PROCTOR_PID=""
  echo "Advertencia: proctor/start.sh no encontrado. Sin capturas."
fi

# ── Función de limpieza ───────────────────────────────────────────────────────

cleanup() {
  echo ""
  echo "Finalizando ExamLock…"
  [ -n "$PROCTOR_PID" ] && kill "$PROCTOR_PID" 2>/dev/null || true
  cleanup_container examlock-student
  echo "Container eliminado. Sin rastros en el equipo."
}
trap cleanup EXIT INT TERM

# ── Cage + Chromium (kiosk) ───────────────────────────────────────────────────
# exec reemplaza este proceso; EXIT trap dispara al salir de Cage.

echo "Abriendo examen…"
exec cage -- "$CHROMIUM" \
  --kiosk \
  --no-sandbox \
  --disable-infobars \
  --disable-extensions \
  --disable-translate \
  --disable-features=TranslateUI \
  --disable-component-update \
  --noerrdialogs \
  "$AGENT_URL"
