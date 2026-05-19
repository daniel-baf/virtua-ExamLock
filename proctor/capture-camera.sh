#!/bin/bash
# Grabs one frame from /dev/video0 via ffmpeg and POSTs it to the agent.

set -euo pipefail

AGENT_URL="${1:-http://localhost:7878}"
DEVICE="${CAMERA_DEVICE:-/dev/video0}"
TMP="/tmp/examlock_cam_$$.jpg"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# shellcheck source=./lib/capture.sh
source "$SCRIPT_DIR/lib/capture.sh"

if ! command -v ffmpeg &>/dev/null; then
  echo "[proctor:camera] ffmpeg not found" >&2
  exit 1
fi

if [ ! -e "$DEVICE" ]; then
  echo "[proctor:camera] device $DEVICE not found — skipping" >&2
  exit 0
fi

ffmpeg -loglevel error -f v4l2 -i "$DEVICE" \
  -vframes 1 -q:v 5 "$TMP" 2>/dev/null

if [ ! -f "$TMP" ]; then
  echo "[proctor:camera] capture failed" >&2
  exit 1
fi

upload_capture "$AGENT_URL" "camera" "$TMP" "proctor:camera"
