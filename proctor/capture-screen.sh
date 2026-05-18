#!/bin/bash
# Captures one screenshot and POSTs it to the agent.
# Wayland: uses grim. X11: uses scrot. Fallback: import (ImageMagick).

set -euo pipefail

AGENT_URL="${1:-http://localhost:7878}"
TMP="/tmp/examlock_screen_$$.jpg"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# shellcheck source=./lib/capture.sh
source "$SCRIPT_DIR/lib/capture.sh"

capture() {
  if command -v grim &>/dev/null; then
    grim -t jpeg -q 60 "$TMP"
  elif command -v scrot &>/dev/null; then
    scrot -q 60 "$TMP"
  elif command -v import &>/dev/null; then
    import -window root -quality 60 "$TMP"
  else
    echo "[proctor:screen] no capture tool found (need grim, scrot, or imagemagick)" >&2
    return 1
  fi
}

if ! capture; then exit 1; fi

upload_capture "$AGENT_URL" "screen" "$TMP" "proctor:screen"
