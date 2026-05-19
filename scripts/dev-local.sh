#!/usr/bin/env bash
# dev-local.sh — levanta server/dashboard en Docker y arranca/configura la VM dev.
#
# Uso:
#   ./scripts/dev-local.sh              # docker compose up + VM full
#   ./scripts/dev-local.sh --dev        # docker compose up + VM dev
#   ./scripts/dev-local.sh --no-vm      # solo Docker
#   ./scripts/dev-local.sh --down       # detiene Docker compose
#   ./scripts/dev-local.sh --logs       # logs Docker compose

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/compose.dev.yml"

ISO_PROFILE_FLAG=""
START_VM=1
MODE=""

G='\033[0;32m'; Y='\033[0;33m'; R='\033[0;31m'; B='\033[0;34m'; N='\033[0m'
log()  { echo -e "${B}[local]${N} $*"; }
ok()   { echo -e "${G}[local]${N} $*"; }
warn() { echo -e "${Y}[local]${N} $*"; }
err()  { echo -e "${R}[local]${N} $*" >&2; }

for arg in "$@"; do
  case "$arg" in
    --dev)
      ISO_PROFILE_FLAG="--dev"
      ;;
    --no-vm)
      START_VM=0
      ;;
    --down|--logs)
      MODE="$arg"
      ;;
    *)
      err "Flag no soportada: $arg"
      exit 1
      ;;
  esac
done

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

require_file() {
  local file="$1"
  local example="$2"
  if [[ -f "$file" ]]; then
    return
  fi

  err "Falta $file"
  echo "  Crea uno desde: cp $example $file"
  exit 1
}

wait_server() {
  log "Esperando server local en http://localhost:8080/healthz..."
  local i=0
  until curl -fsS http://localhost:8080/healthz >/dev/null 2>&1; do
    sleep 2
    i=$((i+1))
    if [[ $i -gt 60 ]]; then
      err "El server local no respondió en 2 min."
      echo "  Revisa logs: ./scripts/dev-local.sh --logs"
      exit 1
    fi
    [[ $((i % 5)) -eq 0 ]] && log "  ...${i}s"
  done
  ok "Server local listo"
}

if [[ "$MODE" == "--down" ]]; then
  compose down
  exit 0
fi

if [[ "$MODE" == "--logs" ]]; then
  compose logs -f
  exit 0
fi

require_file "$REPO_ROOT/server/.env" "$REPO_ROOT/server/.env.example"
require_file "$REPO_ROOT/dashboard/.env" "$REPO_ROOT/dashboard/.env.example"

if [[ ! -d "${HOME}/.config/gcloud" ]]; then
  warn "No existe ${HOME}/.config/gcloud; el server Docker puede fallar si no tiene Application Default Credentials."
  warn "Ejecuta: gcloud auth application-default login"
fi

log "Levantando server y dashboard con Docker Compose..."
compose up -d server dashboard
wait_server

ok "Dashboard local: http://localhost:5173"
ok "Server local:    http://localhost:8080"

if [[ "$START_VM" == "0" ]]; then
  exit 0
fi

log "Arrancando/configurando VM para hablar con Docker local..."
LOCAL_SERVER_URL="${LOCAL_SERVER_URL:-http://10.0.2.2:8080}" \
  "$SCRIPT_DIR/dev-vm.sh" $ISO_PROFILE_FLAG --local
