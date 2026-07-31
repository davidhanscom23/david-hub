#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSTALL_DIR="${INSTALL_DIR:-/workspace/david-comfyui}"
MODEL_NAME="${MODEL_NAME:-RealVisXL_V5.0_fp16.safetensors}"
MODEL_URL="${MODEL_URL:-https://huggingface.co/SG161222/RealVisXL_V5.0/resolve/main/RealVisXL_V5.0_fp16.safetensors?download=true}"
MODEL_SHA256="${MODEL_SHA256:-6a35a7855770ae9820a3c931d4964c3817b6d9e3c6f9c4dabb5b3a94e5643b80}"

log() {
  printf '[%s] %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"
}

detect_comfyui_dir() {
  if [[ -n "${COMFYUI_DIR:-}" && -f "$COMFYUI_DIR/main.py" ]]; then
    printf '%s\n' "$COMFYUI_DIR"
    return 0
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

  log "ComfyUI was not found. Wait for the template to finish, or set COMFYUI_DIR." >&2
  return 1
}

verify_sha256() {
  local path="$1"
  local actual
  if command -v sha256sum >/dev/null 2>&1; then
    actual="$(sha256sum "$path" | awk '{print $1}')"
  elif command -v shasum >/dev/null 2>&1; then
    actual="$(shasum -a 256 "$path" | awk '{print $1}')"
  else
    log "Neither sha256sum nor shasum is available." >&2
    return 1
  fi
  [[ "$actual" == "$MODEL_SHA256" ]]
}

copy_kit() {
  mkdir -p "$INSTALL_DIR/pod" "$INSTALL_DIR/client" \
    "$INSTALL_DIR/workflows" "$INSTALL_DIR/tests"

  install -m 644 "$SOURCE_DIR/README.md" "$INSTALL_DIR/README.md"
  install -m 644 "$SOURCE_DIR/config.env.example" "$INSTALL_DIR/config.env.example"
  install -m 644 "$SOURCE_DIR/runpod-pod.example.json" "$INSTALL_DIR/runpod-pod.example.json"
  install -m 644 "$SOURCE_DIR/workflows/image_hires_api.json" \
    "$INSTALL_DIR/workflows/image_hires_api.json"
  install -m 644 "$SOURCE_DIR/client/generate.py" "$INSTALL_DIR/client/generate.py"
  install -m 644 "$SOURCE_DIR/tests/test_generate.py" "$INSTALL_DIR/tests/test_generate.py"
  install -m 755 "$SOURCE_DIR/tests/verify_local.sh" "$INSTALL_DIR/tests/verify_local.sh"

  local script
  for script in common.sh install.sh start.sh idle_watchdog.sh set_api_key.sh verify_pod.sh; do
    install -m 755 "$SOURCE_DIR/pod/$script" "$INSTALL_DIR/pod/$script"
  done

  if [[ ! -f "$INSTALL_DIR/config.env" ]]; then
    install -m 600 "$SOURCE_DIR/config.env.example" "$INSTALL_DIR/config.env"
  fi
}

main() {
  if [[ "$(id -u)" -ne 0 && ! -w /workspace ]]; then
    log "This script needs write access to /workspace." >&2
    exit 1
  fi

  local comfy_dir checkpoint_dir model_path partial_path
  comfy_dir="$(detect_comfyui_dir)"
  checkpoint_dir="$comfy_dir/models/checkpoints"
  model_path="$checkpoint_dir/$MODEL_NAME"
  partial_path="$model_path.part"

  mkdir -p "$checkpoint_dir"
  copy_kit

  if [[ -f "$model_path" ]]; then
    log "Verifying existing checkpoint: $model_path"
    if ! verify_sha256 "$model_path"; then
      log "Existing checkpoint failed SHA-256 verification. Move it aside and rerun." >&2
      exit 1
    fi
  else
    log "Downloading RealVisXL V5.0 fp16 (about 6.94 GB)."
    log "Destination: $model_path"
    curl --fail --location --show-error \
      --retry 5 --retry-delay 5 --continue-at - \
      --output "$partial_path" "$MODEL_URL"
    log "Verifying published SHA-256."
    if ! verify_sha256 "$partial_path"; then
      log "Downloaded checkpoint failed SHA-256 verification: $partial_path" >&2
      exit 1
    fi
    mv "$partial_path" "$model_path"
  fi

  install -m 644 "$INSTALL_DIR/workflows/image_hires_api.json" \
    /workspace/image_hires_api.json

  python3 -m json.tool /workspace/image_hires_api.json >/dev/null

  log "Installation complete."
  log "ComfyUI: $comfy_dir"
  log "Checkpoint: $model_path"
  log "Next: bash $INSTALL_DIR/pod/set_api_key.sh"
  log "Then: bash $INSTALL_DIR/pod/start.sh"
}

main "$@"
