#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

COMFY_PORT="${COMFY_PORT:-8188}"
MODEL_NAME="${MODEL_NAME:-RealVisXL_V5.0_fp16.safetensors}"
BASE_URL="http://127.0.0.1:${COMFY_PORT}"

main() {
  local comfy_dir checkpoint_path system_json models_json
  comfy_dir="$(detect_comfyui_dir)"
  checkpoint_path="$comfy_dir/models/checkpoints/$MODEL_NAME"

  log "ComfyUI directory: $comfy_dir"
  [[ -f "$checkpoint_path" ]] || {
    log "Checkpoint is missing: $checkpoint_path" >&2
    exit 1
  }
  log "Checkpoint file exists."

  system_json="$(curl --fail --silent --show-error \
    --connect-timeout 3 --max-time 15 "$BASE_URL/system_stats")"
  SYSTEM_JSON="$system_json" python3 -c '
import json, os
d = json.loads(os.environ["SYSTEM_JSON"])
devices = d.get("devices", [])
print("ComfyUI API: ready")
for device in devices:
    name = device.get("name", "unknown device")
    vram = device.get("vram_total")
    suffix = f", VRAM {vram / 1024**3:.1f} GiB" if isinstance(vram, (int, float)) else ""
    print(f"Device: {name}{suffix}")
'

  models_json="$(curl --fail --silent --show-error \
    --connect-timeout 3 --max-time 30 "$BASE_URL/models/checkpoints")"
  MODELS_JSON="$models_json" MODEL_NAME="$MODEL_NAME" python3 -c '
import json, os, sys
models = json.loads(os.environ["MODELS_JSON"])
name = os.environ["MODEL_NAME"]
if name not in models:
    print(f"Checkpoint is on disk but ComfyUI does not list it: {name}", file=sys.stderr)
    print("Restart ComfyUI and run this check again.", file=sys.stderr)
    sys.exit(1)
print(f"Checkpoint loaded in catalog: {name}")
'

  python3 -m json.tool "$KIT_DIR/workflows/image_hires_api.json" >/dev/null
  log "Workflow JSON is valid."
  log "Pod verification passed."
}

main "$@"
