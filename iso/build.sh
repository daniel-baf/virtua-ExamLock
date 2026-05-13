#!/usr/bin/env bash
# ExamLock ISO builder — requires Debian/Ubuntu host with live-build installed
# Usage:
#   SERVER_URL=https://exam.tuuniversidad.com \
#   FIREBASE_API_KEY=... \
#   FIREBASE_AUTH_DOMAIN=... \
#   FIREBASE_PROJECT_ID=... \
#   ./build.sh

set -euo pipefail

: "${SERVER_URL:?SERVER_URL must be set}"
: "${FIREBASE_API_KEY:?FIREBASE_API_KEY must be set}"
: "${FIREBASE_AUTH_DOMAIN:?FIREBASE_AUTH_DOMAIN must be set}"
: "${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID must be set}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"

echo "[iso] Preparing build directory..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
cp -r "$SCRIPT_DIR/config" "$BUILD_DIR/"

# ── Inject /etc/examlock.conf ─────────────────────────────────────────────────
mkdir -p "$BUILD_DIR/config/includes.chroot/etc"
cat > "$BUILD_DIR/config/includes.chroot/etc/examlock.conf" <<EOF
SERVER_URL=${SERVER_URL}
FIREBASE_API_KEY=${FIREBASE_API_KEY}
FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
EOF
echo "[iso] Wrote /etc/examlock.conf"

# ── Bundle agent daemon ───────────────────────────────────────────────────────
AGENT_DST="$BUILD_DIR/config/includes.chroot/opt/examlock"
mkdir -p "$AGENT_DST"
cp -r "$REPO_ROOT/agent/daemon" "$AGENT_DST/"
cp -r "$REPO_ROOT/agent/ui"     "$AGENT_DST/"
cp    "$REPO_ROOT/agent/package.json" "$AGENT_DST/"
cp    "$REPO_ROOT/agent/package-lock.json" "$AGENT_DST/" 2>/dev/null || true

# Install node_modules inside the bundle (will be included in ISO)
echo "[iso] Installing agent dependencies..."
(cd "$AGENT_DST" && npm ci --omit=dev --silent)

# ── Run live-build ────────────────────────────────────────────────────────────
echo "[iso] Configuring live-build..."
cd "$BUILD_DIR"
lb config \
  --distribution bookworm \
  --archive-areas "main contrib non-free non-free-firmware" \
  --binary-images iso-hybrid \
  --bootappend-live "boot=live components quiet splash hostname=examlock username=examuser" \
  --debian-installer none \
  --memtest none

echo "[iso] Building ISO (this takes 10-30 minutes)..."
sudo lb build 2>&1 | tee "$SCRIPT_DIR/build.log"

ISO_FILE=$(ls "$BUILD_DIR"/live-image-*.hybrid.iso 2>/dev/null | head -1)
if [[ -z "$ISO_FILE" ]]; then
  echo "[iso] ERROR: ISO not found. Check $SCRIPT_DIR/build.log"
  exit 1
fi

OUTPUT="$SCRIPT_DIR/examlock-live.iso"
cp "$ISO_FILE" "$OUTPUT"
echo ""
echo "[iso] Done! ISO: $OUTPUT"
echo "[iso] Flash to USB: sudo dd if=$OUTPUT of=/dev/sdX bs=4M status=progress oflag=sync"
echo ""
echo "[iso] To override SERVER_URL without rebuilding:"
echo "       sudo mount -o remount,rw /run/live/medium"
echo "       sudo nano /etc/examlock.conf"
echo "       reboot"
