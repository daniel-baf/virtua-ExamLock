#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/.env.examlock}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Falta $ENV_FILE"
  echo "Copia .env.examlock.example a .env.examlock y completa las variables."
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

SESSION_CODE="${1:-${SESSION_CODE:-}}"
if [[ -z "$SESSION_CODE" ]]; then
  echo "Uso: $0 <SESSION_CODE>"
  echo "O define SESSION_CODE en $ENV_FILE"
  exit 1
fi

IMAGE="${EXAMLOCK_IMAGE:-examlock/agent:dev}"

echo "[dev-lab] Construyendo imagen local $IMAGE"
docker build -t "$IMAGE" -f "$REPO_ROOT/container/Dockerfile" "$REPO_ROOT"

echo "[dev-lab] Lanzando launcher/lab.sh con SESSION_CODE=$SESSION_CODE"
EXAMLOCK_IMAGE="$IMAGE" \
EXAMLOCK_SERVER_URL="$SERVER_URL" \
"$REPO_ROOT/launcher/lab.sh" "$SESSION_CODE"
