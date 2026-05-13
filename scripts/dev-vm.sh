#!/usr/bin/env bash
# dev-vm.sh — arranca la VM con el ISO y hace hot-reload del agente al guardar
#
# Uso:
#   ./scripts/dev-vm.sh           # arranca VM + watcher
#   ./scripts/dev-vm.sh --dev     # arranca VM con iso/examlock-dev.iso
#   ./scripts/dev-vm.sh --push    # solo empuja archivos a VM ya corriendo
#   ./scripts/dev-vm.sh --logs    # solo muestra logs del agente en VM
#
# Requisitos: qemu-system-x86_64, openssh, entr (o inotify-tools)
#   Arch: sudo pacman -S qemu-full openssh entr

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

VM_PORT=2222
VM_MEM=2048
ISO_PROFILE="full"
MODE=""

DEV_KEY="$SCRIPT_DIR/dev-key"
SSH_OPTS="-p $VM_PORT -i $DEV_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR -o IdentitiesOnly=yes"
SCP_OPTS="-P $VM_PORT -i $DEV_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR -o IdentitiesOnly=yes"

# ── Colores ───────────────────────────────────────────────────────────────────

G='\033[0;32m'; Y='\033[0;33m'; R='\033[0;31m'; B='\033[0;34m'; N='\033[0m'
log()  { echo -e "${B}[vm]${N} $*"; }
ok()   { echo -e "${G}[vm]${N} $*"; }
warn() { echo -e "${Y}[vm]${N} $*"; }
err()  { echo -e "${R}[vm]${N} $*" >&2; }

for arg in "$@"; do
  case "$arg" in
    --dev)
      ISO_PROFILE="dev"
      ;;
    --push|--logs|--shell)
      MODE="$arg"
      ;;
    *)
      err "Flag no soportada: $arg"
      exit 1
      ;;
  esac
done

ISO_DEFAULT="$REPO_ROOT/iso/examlock-live.iso"
if [[ "$ISO_PROFILE" == "dev" ]]; then
  ISO_DEFAULT="$REPO_ROOT/iso/examlock-dev.iso"
fi
ISO="${ISO_PATH:-$ISO_DEFAULT}"

# ── Helpers ───────────────────────────────────────────────────────────────────

vm_up() {
  ssh $SSH_OPTS root@127.0.0.1 true 2>/dev/null
}

wait_ssh() {
  log "Esperando SSH en :$VM_PORT..."
  local i=0
  until vm_up; do
    sleep 2
    i=$((i+1))
    [[ $i -gt 60 ]] && { err "SSH no respondió en 2 min. ¿Arrancó la VM?"; exit 1; }
    [[ $((i % 5)) -eq 0 ]] && log "  ...${i}s"
  done
  ok "SSH disponible"
}

push_files() {
  log "Copiando archivos del agente..."
  scp $SCP_OPTS \
    "$REPO_ROOT"/agent/daemon/*.js \
    root@127.0.0.1:/opt/examlock/daemon/
  scp $SCP_OPTS \
    "$REPO_ROOT"/agent/ui/*.html \
    root@127.0.0.1:/opt/examlock/ui/

  # Reinstalar deps si package.json cambió
  if [[ "${PUSH_DEPS:-0}" == "1" ]]; then
    log "Instalando dependencias..."
    scp $SCP_OPTS "$REPO_ROOT/agent/package.json" root@127.0.0.1:/opt/examlock/
    ssh $SSH_OPTS root@127.0.0.1 "cd /opt/examlock && npm ci --omit=dev --silent"
  fi

  log "Reiniciando daemon..."
  ssh $SSH_OPTS root@127.0.0.1 systemctl restart examlock-daemon.service
  ok "Agente actualizado"
}

start_watcher() {
  # Prefiere entr, cae a inotifywait, cae a poll
  if command -v entr &>/dev/null; then
    ok "Watcher con entr — guardá cualquier archivo en agent/ para hot-reload"
    while true; do
      find "$REPO_ROOT/agent/daemon" "$REPO_ROOT/agent/ui" \
        -name "*.js" -o -name "*.html" | \
        entr -d bash -c "$(declare -f push_files); SSH_OPTS='$SSH_OPTS' SCP_OPTS='$SCP_OPTS' REPO_ROOT='$REPO_ROOT' push_files"
      # entr sale con código 2 cuando se agrega un archivo nuevo (-d), relanzar
    done

  elif command -v inotifywait &>/dev/null; then
    ok "Watcher con inotifywait"
    while inotifywait -r -e close_write \
        "$REPO_ROOT/agent/daemon" "$REPO_ROOT/agent/ui" 2>/dev/null; do
      push_files
    done

  else
    warn "Ni entr ni inotifywait encontrados — modo poll (5s)"
    warn "Instala entr: sudo pacman -S entr"
    local prev=""
    while true; do
      curr=$(find "$REPO_ROOT/agent/daemon" "$REPO_ROOT/agent/ui" \
        -name "*.js" -o -name "*.html" | xargs stat -c "%n %Y" 2>/dev/null | sort | md5sum)
      if [[ "$curr" != "$prev" ]] && [[ -n "$prev" ]]; then
        push_files
      fi
      prev="$curr"
      sleep 5
    done
  fi
}

# ── Modos ─────────────────────────────────────────────────────────────────────

if [[ "$MODE" == "--push" ]]; then
  vm_up || { err "VM no accesible en :$VM_PORT"; exit 1; }
  push_files
  exit 0
fi

if [[ "$MODE" == "--logs" ]]; then
  vm_up || { err "VM no accesible en :$VM_PORT"; exit 1; }
  ok "Logs del agente (Ctrl+C para salir):"
  ssh $SSH_OPTS root@127.0.0.1 "journalctl -u examlock-daemon.service -f & tail -f /var/log/examlock/agent.log"
  exit 0
fi

if [[ "$MODE" == "--shell" ]]; then
  vm_up || { err "VM no accesible en :$VM_PORT"; exit 1; }
  ssh $SSH_OPTS root@127.0.0.1
  exit 0
fi

# ── Modo principal: arrancar VM + watcher ────────────────────────────────────

if [[ ! -f "$ISO" ]]; then
  err "ISO no encontrada: $ISO"
  err "Construye primero con: ./scripts/build-iso.sh o ./scripts/build-iso.sh --dev"
  exit 1
fi

# Si la VM ya está corriendo, solo lanzar watcher
if vm_up 2>/dev/null; then
  warn "VM ya corriendo en :$VM_PORT"
  push_files
  start_watcher
  exit 0
fi

log "Arrancando VM con $ISO"
log "Puerto SSH: 127.0.0.1:$VM_PORT"
log "Cerrá la ventana de QEMU para detener la VM"
echo ""

# Arrancar QEMU en background
qemu-system-x86_64 \
  -m "$VM_MEM" \
  -cdrom "$ISO" \
  -boot d \
  -enable-kvm \
  -vga std \
  -net nic \
  -net "user,hostfwd=tcp::${VM_PORT}-:22" \
  -name "ExamLock Dev" &

QEMU_PID=$!
trap "kill $QEMU_PID 2>/dev/null; exit" INT TERM

wait_ssh
push_files

echo ""
ok "VM lista. Comandos útiles:"
echo "  Logs:  ./scripts/dev-vm.sh --logs"
echo "  Shell: ./scripts/dev-vm.sh --shell"
echo "  Push:  ./scripts/dev-vm.sh --push"
echo ""
ok "Watching agent/daemon/ y agent/ui/ — hot-reload al guardar..."
echo ""

start_watcher
