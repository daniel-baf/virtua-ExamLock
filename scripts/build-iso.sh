#!/usr/bin/env bash
# build-iso.sh — construye el ISO de ExamLock con las vars de .env.examlock
#
# Uso:
#   ./scripts/build-iso.sh           # build normal
#   ./scripts/build-iso.sh --watch   # build + arranca VM al terminar
#   ./scripts/build-iso.sh --clean   # elimina caché de build antes
#
# El ISO queda en iso/examlock-live.iso

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/.env.examlock}"
ISO_OUT="$REPO_ROOT/iso/examlock-live.iso"
LOG="$REPO_ROOT/iso/build.log"
MODE="${1:-}"

G='\033[0;32m'; Y='\033[0;33m'; R='\033[0;31m'; B='\033[0;34m'; N='\033[0m'
log()  { echo -e "${B}[build]${N} $*"; }
ok()   { echo -e "${G}[build]${N} $*"; }
warn() { echo -e "${Y}[build]${N} $*"; }
err()  { echo -e "${R}[build]${N} $*" >&2; }

# ── Cargar .env ───────────────────────────────────────────────────────────────

if [[ ! -f "$ENV_FILE" ]]; then
  err "Falta $ENV_FILE"
  echo ""
  echo "  Crea el archivo con estas variables:"
  echo "    SERVER_URL=https://tu-servidor.com"
  echo "    FIREBASE_API_KEY=..."
  echo "    FIREBASE_AUTH_DOMAIN=....firebaseapp.com"
  echo "    FIREBASE_PROJECT_ID=..."
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

: "${SERVER_URL:?SERVER_URL must be set}"
: "${FIREBASE_API_KEY:?FIREBASE_API_KEY must be set}"
: "${FIREBASE_AUTH_DOMAIN:?FIREBASE_AUTH_DOMAIN must be set}"
: "${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID must be set}"

# ── Limpieza opcional ─────────────────────────────────────────────────────────

if [[ "$MODE" == "--clean" ]]; then
  warn "Limpiando caché de build anterior..."
  rm -rf "$REPO_ROOT/iso/build"
  ok "Limpio"
  MODE=""
fi

# ── Build ─────────────────────────────────────────────────────────────────────

log "Iniciando build del ISO"
log "  SERVER_URL:    $SERVER_URL"
log "  PROJECT_ID:    $FIREBASE_PROJECT_ID"
log "  Log en:        $LOG"
echo ""

START=$SECONDS

cd "$REPO_ROOT/iso"
SERVER_URL="$SERVER_URL" \
FIREBASE_API_KEY="$FIREBASE_API_KEY" \
FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN" \
FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID" \
  bash build.sh

# build.sh corre en background — esperar hasta que el log diga "Listo" o "ERROR"
log "Build corriendo en background. Siguiendo progreso..."
echo ""

tail -f "$LOG" &
TAIL_PID=$!
trap "kill $TAIL_PID 2>/dev/null" EXIT

while true; do
  sleep 3
  if grep -q "Listo!" "$LOG" 2>/dev/null; then
    kill $TAIL_PID 2>/dev/null; trap - EXIT
    echo ""
    ELAPSED=$((SECONDS - START))
    ok "Build completado en ${ELAPSED}s"
    ok "ISO: $ISO_OUT"
    ls -lh "$ISO_OUT" 2>/dev/null || true
    echo ""
    echo "  Flashear USB:  sudo dd if=$ISO_OUT of=/dev/sdX bs=4M status=progress oflag=sync"
    echo "  Probar en VM:  ./scripts/dev-vm.sh"
    echo ""
    break
  fi
  if grep -q "ERROR" "$LOG" 2>/dev/null; then
    kill $TAIL_PID 2>/dev/null; trap - EXIT
    echo ""
    err "Build falló. Revisa: $LOG"
    exit 1
  fi
done

# ── Arrancar VM si --watch ─────────────────────────────────────────────────────

if [[ "$MODE" == "--watch" ]]; then
  echo ""
  log "Arrancando VM con hot-reload..."
  exec "$SCRIPT_DIR/dev-vm.sh"
fi
