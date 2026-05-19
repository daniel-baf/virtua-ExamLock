#!/bin/bash

upload_capture() {
  local agent_url="$1"
  local capture_type="$2"
  local source_file="$3"
  local log_prefix="$4"

  local base64_image
  base64_image=$(base64 -w 0 "$source_file")
  rm -f "$source_file"

  curl -sf -X POST "$agent_url/proctor/upload" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"$capture_type\",\"imageBase64\":\"$base64_image\"}" \
    > /dev/null || echo "[$log_prefix] upload failed" >&2
}
