#!/bin/bash
# Runs in background on host/VM. Captures screen + camera every 30s.
# Usage: ./proctor/start.sh [agent_url]

set -euo pipefail

AGENT_URL="${1:-http://localhost:7878}"
INTERVAL=30
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[proctor] starting — agent: $AGENT_URL, interval: ${INTERVAL}s"

while true; do
  "$SCRIPT_DIR/capture-screen.sh" "$AGENT_URL" &
  "$SCRIPT_DIR/capture-camera.sh" "$AGENT_URL" &
  wait
  sleep "$INTERVAL"
done
