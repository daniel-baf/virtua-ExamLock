#!/bin/bash
# Captures one screenshot and POSTs it to the agent.
# Wayland: uses grim. X11: uses scrot. Fallback: import (ImageMagick).

AGENT_URL="${1:-http://localhost:7878}"
TMP="/tmp/examlock_screen_$$.jpg"

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

B64=$(base64 -w 0 "$TMP")
rm -f "$TMP"

curl -sf -X POST "$AGENT_URL/proctor/upload" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"screen\",\"imageBase64\":\"$B64\"}" \
  > /dev/null || echo "[proctor:screen] upload failed" >&2
