#!/bin/bash

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: '$cmd' no está instalado." >&2
    exit 1
  fi
}

find_chromium() {
  local bin
  for bin in chromium chromium-browser google-chrome; do
    if command -v "$bin" &>/dev/null; then
      echo "$bin"
      return 0
    fi
  done

  echo "Error: no se encontró Chromium." >&2
  exit 1
}

ensure_docker_network() {
  local network_name="$1"
  if docker network inspect "$network_name" &>/dev/null; then
    return 0
  fi

  echo "Creando red $network_name…"
  docker network create \
    --driver bridge \
    --opt com.docker.network.bridge.enable_icc=false \
    "$network_name"
}

cleanup_container() {
  local container_name="$1"
  docker stop "$container_name" 2>/dev/null || true
  docker rm "$container_name" 2>/dev/null || true
}
