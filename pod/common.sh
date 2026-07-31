#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="${CONFIG_FILE:-$KIT_DIR/config.env}"

if [[ -f "$CONFIG_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$CONFIG_FILE"
fi

log() {
  printf '[%s] %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"
}

detect_comfyui_dir() {
  if [[ -n "${COMFYUI_DIR:-}" ]]; then
    if [[ -f "$COMFYUI_DIR/main.py" ]]; then
      printf '%s\n' "$COMFYUI_DIR"
      return 0
    fi
    log "Configured COMFYUI_DIR does not contain main.py: $COMFYUI_DIR" >&2
    return 1
  fi

  local candidate
  for candidate in \
    /workspace/madapps/ComfyUI \
    /workspace/ComfyUI \
    /workspace/runpod-slim/ComfyUI \
    /comfyui; do
    if [[ -f "$candidate/main.py" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  log "Could not detect ComfyUI. Set COMFYUI_DIR in $CONFIG_FILE." >&2
  return 1
}

detect_comfy_python() {
  local comfy_dir="$1"
  if [[ -n "${COMFY_PYTHON:-}" ]]; then
    if [[ -x "$COMFY_PYTHON" ]]; then
      printf '%s\n' "$COMFY_PYTHON"
      return 0
    fi
    log "Configured COMFY_PYTHON is not executable: $COMFY_PYTHON" >&2
    return 1
  fi

  local candidate
  for candidate in \
    "$comfy_dir/venv/bin/python" \
    "$comfy_dir/.venv/bin/python" \
    "$comfy_dir/.venv-cu128/bin/python" \
    /workspace/ComfyUI/venv/bin/python \
    /workspace/venv/bin/python; do
    if [[ -x "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  if command -v python3 >/dev/null 2>&1; then
    command -v python3
    return 0
  fi

  log "Could not detect a Python executable for ComfyUI." >&2
  return 1
}

comfy_is_ready() {
  local port="${COMFY_PORT:-8188}"
  curl --fail --silent --show-error \
    --connect-timeout 2 --max-time 5 \
    "http://127.0.0.1:${port}/system_stats" >/dev/null 2>&1
}

pid_is_running() {
  local pid_file="$1"
  [[ -s "$pid_file" ]] || return 1
  local pid
  pid="$(<"$pid_file")"
  [[ "$pid" =~ ^[0-9]+$ ]] || return 1
  kill -0 "$pid" 2>/dev/null
}
