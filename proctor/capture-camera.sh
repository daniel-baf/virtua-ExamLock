#!/bin/bash
# Grabs one frame from /dev/video0 via ffmpeg and POSTs it to the agent.

AGENT_URL="${1:-http://localhost:3000}"
DEVICE="${CAMERA_DEVICE:-/dev/video0}"
TMP="/tmp/examlock_cam_$$.jpg"

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

B64=$(base64 -w 0 "$TMP")
rm -f "$TMP"

curl -sf -X POST "$AGENT_URL/proctor/upload" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"camera\",\"imageBase64\":\"$B64\"}" \
  > /dev/null || echo "[proctor:camera] upload failed" >&2
