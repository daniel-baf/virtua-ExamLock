#!/usr/bin/env bash
# ExamLock ISO builder
# Usage:
#   SERVER_URL=https://exam.tuuniversidad.com \
#   FIREBASE_API_KEY=... \
#   FIREBASE_AUTH_DOMAIN=... \
#   FIREBASE_PROJECT_ID=... \
#   ./build.sh
#
# Auto-detecta si live-build está disponible; si no, usa Docker (Debian bookworm).
# Siempre corre en segundo plano — sigue el progreso con:
#   tail -f iso/build.log

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG="$SCRIPT_DIR/build.log"

# ── Parámetros requeridos ─────────────────────────────────────────────────────

: "${SERVER_URL:?SERVER_URL must be set}"
: "${FIREBASE_API_KEY:?FIREBASE_API_KEY must be set}"
: "${FIREBASE_AUTH_DOMAIN:?FIREBASE_AUTH_DOMAIN must be set}"
: "${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID must be set}"

# ── Función de build (se llama desde el proceso hijo) ────────────────────────

_do_build() {
  local BUILD_DIR="$SCRIPT_DIR/build"

  echo "[iso] Preparando directorio de build..."
  rm -rf "$BUILD_DIR"
  mkdir -p "$BUILD_DIR"
  cp -r "$SCRIPT_DIR/config" "$BUILD_DIR/"

  mkdir -p "$BUILD_DIR/config/includes.chroot/etc"
  cat > "$BUILD_DIR/config/includes.chroot/etc/examlock.conf" <<EOF
SERVER_URL=${SERVER_URL}
FIREBASE_API_KEY=${FIREBASE_API_KEY}
FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
EOF
  echo "[iso] Wrote /etc/examlock.conf"

  local AGENT_DST="$BUILD_DIR/config/includes.chroot/opt/examlock"
  mkdir -p "$AGENT_DST"
  cp -r "$REPO_ROOT/agent/daemon"       "$AGENT_DST/"
  cp -r "$REPO_ROOT/agent/ui"           "$AGENT_DST/"
  cp    "$REPO_ROOT/agent/package.json" "$AGENT_DST/"
  cp    "$REPO_ROOT/agent/package-lock.json" "$AGENT_DST/" 2>/dev/null || true

  echo "[iso] Instalando dependencias del agente..."
  (cd "$AGENT_DST" && npm ci --omit=dev --silent)

  echo "[iso] Configurando live-build..."
  cd "$BUILD_DIR"
  lb config \
    --distribution bookworm \
    --archive-areas "main contrib non-free non-free-firmware" \
    --binary-images iso-hybrid \
    --bootappend-live "boot=live components quiet splash hostname=examlock username=examuser" \
    --debian-installer none \
    --memtest none

  echo "[iso] Construyendo ISO (10-30 min)..."
  sudo lb build 2>&1

  local ISO_FILE
  ISO_FILE=$(ls "$BUILD_DIR"/live-image-*.hybrid.iso 2>/dev/null | head -1)
  if [[ -z "$ISO_FILE" ]]; then
    echo "[iso] ERROR: ISO no encontrada. Revisa $LOG"
    exit 1
  fi

  local OUTPUT="$SCRIPT_DIR/examlock-live.iso"
  cp "$ISO_FILE" "$OUTPUT"
  echo ""
  echo "[iso] Listo! ISO: $OUTPUT"
  echo "[iso] Flashear a USB: sudo dd if=$OUTPUT of=/dev/sdX bs=4M status=progress oflag=sync"
  echo ""
  echo "[iso] Para cambiar SERVER_URL sin reconstruir:"
  echo "       sudo mount -o remount,rw /run/live/medium"
  echo "       sudo nano /etc/examlock.conf && reboot"
  echo ""
  echo "[iso] Probar en QEMU:"
  echo "       qemu-system-x86_64 -m 2048 -cdrom $OUTPUT -boot d -enable-kvm -vga std"
}

# ── Si somos el proceso hijo, ejecutar build directamente ────────────────────

if [[ "${_EXAMLOCK_CHILD:-}" == "1" ]]; then
  _do_build
  exit $?
fi

# ── Detectar entorno de build ─────────────────────────────────────────────────

_launch_native() {
  echo "[iso] live-build detectado → build nativa en segundo plano"
  echo "[iso] Log: tail -f $LOG"
  _EXAMLOCK_CHILD=1 \
    SERVER_URL="$SERVER_URL" \
    FIREBASE_API_KEY="$FIREBASE_API_KEY" \
    FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN" \
    FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID" \
    nohup bash "$SCRIPT_DIR/build.sh" >> "$LOG" 2>&1 &
  echo "[iso] PID $! → tail -f $LOG"
}

_launch_docker() {
  echo "[iso] live-build no disponible → usando Docker (debian:bookworm)"
  echo "[iso] Log: tail -f $LOG"

  nohup docker run --rm --privileged \
    -v "$REPO_ROOT:/repo" \
    -w /repo \
    -e SERVER_URL="$SERVER_URL" \
    -e FIREBASE_API_KEY="$FIREBASE_API_KEY" \
    -e FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN" \
    -e FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID" \
    debian:bookworm bash -c "
      set -euo pipefail
      apt-get update -qq
      apt-get install -y --no-install-recommends live-build curl nodejs npm sudo 2>&1
      cd /repo/iso && _EXAMLOCK_CHILD=1 bash build.sh
    " >> "$LOG" 2>&1 &
  echo "[iso] PID $! → tail -f $LOG"
}

# ── Entry point ───────────────────────────────────────────────────────────────

> "$LOG"  # trunca log previo

if command -v lb &>/dev/null; then
  _launch_native
else
  if ! command -v docker &>/dev/null; then
    echo "[iso] ERROR: ni live-build ni docker encontrados. Instala uno de los dos." >&2
    exit 1
  fi
  _launch_docker
fi
