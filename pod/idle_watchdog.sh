#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

COMFY_PORT="${COMFY_PORT:-8188}"
IDLE_LIMIT="${IDLE_LIMIT:-900}"
CHECK_INTERVAL="${CHECK_INTERVAL:-60}"
STARTUP_GRACE="${STARTUP_GRACE:-300}"
API_FAILURE_RETRY="${API_FAILURE_RETRY:-30}"
RUNPOD_API_KEY_FILE="${RUNPOD_API_KEY_FILE:-/workspace/.runpod_api_key}"
RUNPOD_API_BASE="${RUNPOD_API_BASE:-https://rest.runpod.io/v1}"
COMFY_LOCAL_URL="http://127.0.0.1:${COMFY_PORT}"

require_positive_integer() {
  local name="$1"
  local value="$2"
  if [[ ! "$value" =~ ^[1-9][0-9]*$ ]]; then
    log "$name must be a positive integer, got: $value" >&2
    exit 1
  fi
}

hash_text() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum | awk '{print $1}'
  else
    shasum -a 256 | awk '{print $1}'
  fi
}

queue_counts() {
  python3 -c '
import json, sys
d = json.load(sys.stdin)
print(len(d.get("queue_running", [])), len(d.get("queue_pending", [])))
'
}

pod_has_network_volume() {
  local key="$1"
  local pod_json
  pod_json="$(curl --fail --silent --show-error \
    --connect-timeout 10 --max-time 30 \
    -H "Authorization: Bearer $key" \
    "$RUNPOD_API_BASE/pods/$RUNPOD_POD_ID")" || return 2

  POD_JSON="$pod_json" python3 -c '
import json, os, sys
d = json.loads(os.environ["POD_JSON"])
value = d.get("networkVolumeId")
sys.exit(0 if value else 1)
'
}

stop_pod() {
  local key="$1"

  if pod_has_network_volume "$key"; then
    log "REFUSING TO STOP: this Pod has a Network Volume."
    log "RunPod does not support stopping Network Volume Pods."
    log "This watchdog will never terminate a Pod automatically."
    return 3
  else
    local status=$?
    if [[ "$status" -eq 2 ]]; then
      log "Could not inspect Pod storage type; will not issue a stop request."
      return 2
    fi
  fi

  local response_file http_code
  response_file="$(mktemp)"
  http_code="$(curl --silent --show-error \
    --connect-timeout 10 --max-time 30 \
    --output "$response_file" --write-out '%{http_code}' \
    --request POST \
    -H "Authorization: Bearer $key" \
    "$RUNPOD_API_BASE/pods/$RUNPOD_POD_ID/stop")" || {
      local curl_status=$?
      log "RunPod stop request failed at the network layer (curl $curl_status)."
      rm -f "$response_file"
      return 2
    }

  if [[ "$http_code" == "200" || "$http_code" == "202" || "$http_code" == "204" ]]; then
    log "RunPod accepted the stop request (HTTP $http_code)."
    rm -f "$response_file"
    return 0
  fi

  log "RunPod rejected the stop request (HTTP $http_code)."
  sed -n '1,10p' "$response_file" >&2
  rm -f "$response_file"
  return 2
}

main() {
  require_positive_integer IDLE_LIMIT "$IDLE_LIMIT"
  require_positive_integer CHECK_INTERVAL "$CHECK_INTERVAL"
  require_positive_integer STARTUP_GRACE "$STARTUP_GRACE"
  require_positive_integer API_FAILURE_RETRY "$API_FAILURE_RETRY"

  if [[ -z "${RUNPOD_POD_ID:-}" ]]; then
    log "RUNPOD_POD_ID is not set." >&2
    exit 1
  fi
  if [[ ! -s "$RUNPOD_API_KEY_FILE" ]]; then
    log "RunPod key file is missing or empty: $RUNPOD_API_KEY_FILE" >&2
    exit 1
  fi

  local key
  key="$(<"$RUNPOD_API_KEY_FILE")"
  if [[ -z "$key" ]]; then
    log "RunPod key file is empty." >&2
    exit 1
  fi

  log "Watchdog active for Pod $RUNPOD_POD_ID."
  log "Startup grace: ${STARTUP_GRACE}s; idle limit: ${IDLE_LIMIT}s."
  sleep "$STARTUP_GRACE"

  local idle=0
  local last_history_hash=""
  local queue_json history_json running pending current_hash

  while true; do
    if ! queue_json="$(curl --fail --silent --show-error \
      --connect-timeout 3 --max-time 10 "$COMFY_LOCAL_URL/queue")"; then
      log "ComfyUI queue is unreachable; idle timer reset for safety."
      idle=0
      sleep "$API_FAILURE_RETRY"
      continue
    fi

    if ! read -r running pending < <(printf '%s' "$queue_json" | queue_counts); then
      log "ComfyUI returned invalid queue data; idle timer reset for safety."
      idle=0
      sleep "$API_FAILURE_RETRY"
      continue
    fi

    if ! history_json="$(curl --fail --silent --show-error \
      --connect-timeout 3 --max-time 15 \
      "$COMFY_LOCAL_URL/history?max_items=1")"; then
      log "ComfyUI history is unreachable; idle timer reset for safety."
      idle=0
      sleep "$API_FAILURE_RETRY"
      continue
    fi
    current_hash="$(printf '%s' "$history_json" | hash_text)"

    if [[ "$running" -gt 0 || "$pending" -gt 0 ]]; then
      idle=0
      log "Generation active (running=$running pending=$pending); timer reset."
    elif [[ -n "$last_history_hash" && "$current_hash" != "$last_history_hash" ]]; then
      idle=0
      log "New generation history detected; timer reset."
    else
      idle=$((idle + CHECK_INTERVAL))
      log "ComfyUI idle for ${idle}s of ${IDLE_LIMIT}s."
    fi
    last_history_hash="$current_hash"

    if [[ "$idle" -ge "$IDLE_LIMIT" ]]; then
      log "Idle limit reached; requesting non-destructive Pod stop."
      if stop_pod "$key"; then
        unset key
        exit 0
      fi
      log "Stop was not issued; resetting timer before retry."
      idle=0
    fi

    sleep "$CHECK_INTERVAL"
  done
}

main "$@"
