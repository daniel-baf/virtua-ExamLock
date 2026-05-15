#!/usr/bin/env bash
# build-iso.sh — construye el ISO de ExamLock con las vars de .env.examlock
#
# Uso:
#   ./scripts/build-iso.sh                 # build full
#   ./scripts/build-iso.sh --dev           # build dev
#   ./scripts/build-iso.sh --watch         # build + arranca VM al terminar
#   ./scripts/build-iso.sh --clean         # elimina caché de build antes
#
# Los ISOs quedan en iso/examlock-live.iso o iso/examlock-dev.iso

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/.env.examlock}"
LOG="$REPO_ROOT/iso/build.log"
ISO_PROFILE="full"
ISO_OUT="$REPO_ROOT/iso/examlock-live.iso"
WATCH=0
CLEAN=0

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

# ── Flags ─────────────────────────────────────────────────────────────────────

for arg in "$@"; do
  case "$arg" in
    --clean)
      CLEAN=1
      ;;
    --watch)
      WATCH=1
      ;;
    --dev)
      ISO_PROFILE="dev"
      ISO_OUT="$REPO_ROOT/iso/examlock-dev.iso"
      ;;
    --full)
      ISO_PROFILE="full"
      ISO_OUT="$REPO_ROOT/iso/examlock-live.iso"
      ;;
    *)
      err "Flag no soportada: $arg"
      exit 1
      ;;
  esac
done

# ── Limpieza opcional ─────────────────────────────────────────────────────────

if [[ "$CLEAN" == "1" ]]; then
  warn "Limpiando caché de build anterior..."
  rm -rf "$REPO_ROOT/iso/build"
  ok "Limpio"
fi

# ── Build ─────────────────────────────────────────────────────────────────────

log "Iniciando build del ISO"
log "  Perfil:        $ISO_PROFILE"
log "  SERVER_URL:    $SERVER_URL"
log "  PROJECT_ID:    $FIREBASE_PROJECT_ID"
log "  ISO salida:    $ISO_OUT"
log "  Log en:        $LOG"
echo ""

START=$SECONDS

cd "$REPO_ROOT/iso"
SERVER_URL="$SERVER_URL" \
FIREBASE_API_KEY="$FIREBASE_API_KEY" \
FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN" \
FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID" \
ISO_PROFILE="$ISO_PROFILE" \
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
    if [[ "$ISO_PROFILE" == "dev" ]]; then
      echo "  Probar en VM:  ./scripts/dev-vm.sh --dev"
    else
      echo "  Probar en VM:  ./scripts/dev-vm.sh"
    fi
    echo ""
    notify-send -u normal -i media-optical "ExamLock build OK" "ISO lista en ${ELAPSED}s — $ISO_OUT" 2>/dev/null || true
    break
  fi
  if grep -q "ERROR" "$LOG" 2>/dev/null; then
    kill $TAIL_PID 2>/dev/null; trap - EXIT
    echo ""
    err "Build falló. Revisa: $LOG"
    notify-send -u critical -i dialog-error "ExamLock build FALLÓ" "Revisa: $LOG" 2>/dev/null || true
    exit 1
  fi
done

# ── Arrancar VM si --watch ─────────────────────────────────────────────────────

if [[ "$WATCH" == "1" ]]; then
  echo ""
  log "Arrancando VM con hot-reload..."
  exec env ISO_PATH="$ISO_OUT" "$SCRIPT_DIR/dev-vm.sh"
fi
