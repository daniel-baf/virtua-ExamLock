#!/usr/bin/env bash
# check-local.sh — valida componentes locales antes de deploy, sin tocar ISO.
#
# Verifica:
# - server: sintaxis de archivos en src/
# - agent: sintaxis de archivos JS principales
# - dashboard: build de producción

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

G='\033[0;32m'; Y='\033[0;33m'; R='\033[0;31m'; B='\033[0;34m'; N='\033[0m'
log()  { echo -e "${B}[check]${N} $*"; }
ok()   { echo -e "${G}[check]${N} $*"; }
warn() { echo -e "${Y}[check]${N} $*"; }
err()  { echo -e "${R}[check]${N} $*" >&2; }

require_dir() {
  local dir="$1"
  if [[ ! -d "$dir" ]]; then
    err "No existe directorio requerido: $dir"
    exit 1
  fi
}

require_node_modules() {
  local dir="$1"
  if [[ ! -d "$dir/node_modules" ]]; then
    err "Faltan dependencias en $dir"
    echo "  Ejecuta: (cd $dir && npm ci)"
    exit 1
  fi
}

check_js_tree() {
  local root="$1"
  local label="$2"
  log "Validando sintaxis JS de $label..."

  while IFS= read -r file; do
    node --check "$file"
  done < <(find "$root" \
    -type d \( -name node_modules -o -name dist -o -name build \) -prune \
    -o -type f -name '*.js' -print | sort)

  ok "$label OK"
}

check_dashboard_build() {
  local dir="$REPO_ROOT/dashboard"
  require_dir "$dir"
  require_node_modules "$dir"

  log "Compilando dashboard..."
  (
    cd "$dir"
    npm run build
  )
  ok "dashboard OK"
}

main() {
  log "Iniciando preflight local (sin ISO)..."

  require_dir "$REPO_ROOT/server/src"
  require_dir "$REPO_ROOT/agent"
  require_dir "$REPO_ROOT/dashboard"

  check_js_tree "$REPO_ROOT/server/src" "server"
  check_js_tree "$REPO_ROOT/agent" "agent"
  check_dashboard_build

  warn "No se ejecuta eslint automáticamente porque hoy el entorno del dashboard tiene una falla de dependencias en minimatch/brace-expansion."
  ok "Preflight local completado"
}

main "$@"
