#!/usr/bin/env bash
# ExamLock ISO builder
# Usage:
#   SERVER_URL=https://exam.tuuniversidad.com \
#   FIREBASE_API_KEY=... \
#   FIREBASE_AUTH_DOMAIN=... \
#   FIREBASE_PROJECT_ID=... \
#   ISO_PROFILE=dev|full \
#   ./build.sh
#
# Auto-detecta si live-build está disponible; si no, usa Docker (Debian bookworm).
# Siempre corre en segundo plano — sigue el progreso con:
#   tail -f iso/build.log

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG="$SCRIPT_DIR/build.log"
ISO_PROFILE="${ISO_PROFILE:-full}"

case "$ISO_PROFILE" in
  full|dev) ;;
  *)
    echo "[iso] ERROR: ISO_PROFILE debe ser 'full' o 'dev'" >&2
    exit 1
    ;;
esac

# ── Parámetros requeridos ─────────────────────────────────────────────────────

: "${SERVER_URL:?SERVER_URL must be set}"
: "${FIREBASE_API_KEY:?FIREBASE_API_KEY must be set}"
: "${FIREBASE_AUTH_DOMAIN:?FIREBASE_AUTH_DOMAIN must be set}"
: "${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID must be set}"

# ── Función de build (se llama desde el proceso hijo) ────────────────────────

_do_build() {
  local BUILD_DIR="$SCRIPT_DIR/build"
  local PROFILE_LIST_SRC="$SCRIPT_DIR/package-lists/examlock-${ISO_PROFILE}.list.chroot"
  local OUTPUT="$SCRIPT_DIR/examlock-live.iso"
  local CACHE_STASH=""

  if [[ "$ISO_PROFILE" == "dev" ]]; then
    OUTPUT="$SCRIPT_DIR/examlock-dev.iso"
  fi

  echo "[iso] Preparando directorio de build (perfil: $ISO_PROFILE)..."
  if [[ ! -f "$PROFILE_LIST_SRC" ]]; then
    echo "[iso] ERROR: package list no encontrada: $PROFILE_LIST_SRC"
    exit 1
  fi

  if [[ -d "$BUILD_DIR/cache" || -d "$BUILD_DIR/.agent-cache" ]]; then
    CACHE_STASH=$(mktemp -d)
    [[ -d "$BUILD_DIR/cache" ]] && mv "$BUILD_DIR/cache" "$CACHE_STASH/cache"
    [[ -d "$BUILD_DIR/.agent-cache" ]] && mv "$BUILD_DIR/.agent-cache" "$CACHE_STASH/.agent-cache"
  fi

  rm -rf "$BUILD_DIR"
  mkdir -p "$BUILD_DIR"

  if [[ -n "$CACHE_STASH" ]]; then
    [[ -d "$CACHE_STASH/cache" ]] && mv "$CACHE_STASH/cache" "$BUILD_DIR/cache"
    [[ -d "$CACHE_STASH/.agent-cache" ]] && mv "$CACHE_STASH/.agent-cache" "$BUILD_DIR/.agent-cache"
    rmdir "$CACHE_STASH" 2>/dev/null || true
  fi

  cp -r "$SCRIPT_DIR/config" "$BUILD_DIR/"
  mkdir -p "$BUILD_DIR/config/package-lists"
  cp "$PROFILE_LIST_SRC" "$BUILD_DIR/config/package-lists/examlock.list.chroot"

  mkdir -p "$BUILD_DIR/config/includes.chroot/etc"
  cat > "$BUILD_DIR/config/includes.chroot/etc/examlock.conf" <<EOF
SERVER_URL=${SERVER_URL}
FIREBASE_API_KEY=${FIREBASE_API_KEY}
FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
EOF
  echo "[iso] Wrote /etc/examlock.conf"

  local AGENT_DST="$BUILD_DIR/config/includes.chroot/opt/examlock"
  local AGENT_CACHE_ROOT="$BUILD_DIR/.agent-cache"
  local AGENT_CACHE_KEY_SRC="$REPO_ROOT/agent/package.json"
  local AGENT_CACHE_KEY
  local AGENT_CACHE_DIR
  mkdir -p "$AGENT_DST"
  cp -r "$REPO_ROOT/agent/daemon"       "$AGENT_DST/"
  cp -r "$REPO_ROOT/agent/ui"           "$AGENT_DST/"
  cp    "$REPO_ROOT/agent/package.json" "$AGENT_DST/"
  cp    "$REPO_ROOT/agent/package-lock.json" "$AGENT_DST/" 2>/dev/null || true

  if [[ -f "$REPO_ROOT/agent/package-lock.json" ]]; then
    AGENT_CACHE_KEY_SRC="$REPO_ROOT/agent/package-lock.json"
  fi
  AGENT_CACHE_KEY=$(sha256sum "$AGENT_CACHE_KEY_SRC" | cut -d' ' -f1)
  AGENT_CACHE_DIR="$AGENT_CACHE_ROOT/$AGENT_CACHE_KEY"

  if [[ -d "$AGENT_CACHE_DIR/node_modules" ]]; then
    echo "[iso] Reutilizando cache de node_modules..."
    cp -a "$AGENT_CACHE_DIR/node_modules" "$AGENT_DST/"
  else
    echo "[iso] Instalando dependencias del agente..."
    (cd "$AGENT_DST" && npm ci --omit=dev --silent)
    mkdir -p "$AGENT_CACHE_DIR"
    cp -a "$AGENT_DST/node_modules" "$AGENT_CACHE_DIR/"
  fi

  echo "[iso] Configurando live-build..."
  cd "$BUILD_DIR"
  lb config \
    --distribution bookworm \
    --archive-areas "main contrib non-free non-free-firmware" \
    --binary-images iso-hybrid \
    --bootappend-live "boot=live components quiet splash hostname=examlock live-config.noroot" \
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
    ISO_PROFILE="$ISO_PROFILE" \
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
    -e ISO_PROFILE="$ISO_PROFILE" \
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
