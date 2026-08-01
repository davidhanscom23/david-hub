#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

COMFY_PORT="${COMFY_PORT:-8188}"
COMFY_LOG="${COMFY_LOG:-/workspace/comfy.log}"
COMFY_PID_FILE="${COMFY_PID_FILE:-/workspace/comfy.pid}"
WATCHDOG_LOG="${WATCHDOG_LOG:-/workspace/watchdog.log}"
WATCHDOG_PID_FILE="${WATCHDOG_PID_FILE:-/workspace/watchdog.pid}"
RUNPOD_API_KEY_FILE="${RUNPOD_API_KEY_FILE:-/workspace/.runpod_api_key}"
AUTO_STOP_ENABLED="${AUTO_STOP_ENABLED:-1}"

start_comfyui() {
  if comfy_is_ready; then
    log "ComfyUI is already responding on port $COMFY_PORT."
    return 0
  fi

  if pid_is_running "$COMFY_PID_FILE"; then
    log "ComfyUI process exists but is not ready yet (PID $(<"$COMFY_PID_FILE"))."
  else
    local comfy_dir comfy_python
    comfy_dir="$(detect_comfyui_dir)"
    comfy_python="$(detect_comfy_python "$comfy_dir")"
    log "Starting ComfyUI from $comfy_dir on 0.0.0.0:$COMFY_PORT."

    (
      cd "$comfy_dir"
      nohup "$comfy_python" main.py \
        --listen 0.0.0.0 \
        --port "$COMFY_PORT" \
        >>"$COMFY_LOG" 2>&1 &
      printf '%s\n' "$!" >"$COMFY_PID_FILE"
    )
  fi

  for _ in {1..120}; do
    if comfy_is_ready; then
      log "ComfyUI is ready."
      return 0
    fi
    sleep 1
  done

  log "ComfyUI did not become ready within 120 seconds." >&2
  log "Inspect $COMFY_LOG" >&2
  return 1
}

start_watchdog() {
  if [[ "$AUTO_STOP_ENABLED" != "1" ]]; then
    log "Idle watchdog is disabled in $CONFIG_FILE."
    return 0
  fi
  if [[ ! -s "$RUNPOD_API_KEY_FILE" ]]; then
    log "WARNING: idle watchdog not started; key file is missing." >&2
    log "Run: bash $SCRIPT_DIR/set_api_key.sh" >&2
    return 0
  fi
  if [[ -z "${RUNPOD_POD_ID:-}" ]]; then
    log "WARNING: RUNPOD_POD_ID is not set; watchdog cannot stop the Pod." >&2
    return 0
  fi
  if pid_is_running "$WATCHDOG_PID_FILE"; then
    log "Idle watchdog is already running (PID $(<"$WATCHDOG_PID_FILE"))."
    return 0
  fi

  nohup bash "$SCRIPT_DIR/idle_watchdog.sh" >>"$WATCHDOG_LOG" 2>&1 &
  printf '%s\n' "$!" >"$WATCHDOG_PID_FILE"
  log "Idle watchdog started (PID $!)."
}

main() {
  start_comfyui
  start_watchdog
  if [[ -n "${RUNPOD_POD_ID:-}" ]]; then
    log "ComfyUI URL: https://${RUNPOD_POD_ID}-${COMFY_PORT}.proxy.runpod.net"
  else
    log "ComfyUI local URL: http://127.0.0.1:${COMFY_PORT}"
  fi
}

main "$@"
