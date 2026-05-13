#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/.env.examlock}"
CONFIG_FILE="/etc/examlock.conf"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Falta $ENV_FILE"
  echo "Copia .env.examlock.example a .env.examlock y completa las variables."
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

: "${SERVER_URL:?SERVER_URL must be set}"
: "${FIREBASE_API_KEY:?FIREBASE_API_KEY must be set}"
: "${FIREBASE_AUTH_DOMAIN:?FIREBASE_AUTH_DOMAIN must be set}"
: "${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID must be set}"

TMP_CONFIG="$(mktemp)"
trap 'rm -f "$TMP_CONFIG"' EXIT

cat > "$TMP_CONFIG" <<EOF
SERVER_URL=${SERVER_URL}
FIREBASE_API_KEY=${FIREBASE_API_KEY}
FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
EOF

echo "[dev-agent] Actualizando $CONFIG_FILE"
if [[ "${EUID}" -eq 0 ]]; then
  install -m 0644 "$TMP_CONFIG" "$CONFIG_FILE"
else
  sudo install -m 0644 "$TMP_CONFIG" "$CONFIG_FILE"
fi

echo "[dev-agent] Iniciando agente en http://localhost:7878"
cd "$REPO_ROOT/agent"
npm start
