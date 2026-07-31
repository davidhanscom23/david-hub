#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'
umask 077

KEY_FILE="${RUNPOD_API_KEY_FILE:-/workspace/.runpod_api_key}"

if [[ ! -t 0 ]]; then
  printf 'Run this script interactively in your private Pod terminal.\n' >&2
  exit 1
fi

api_key=""
trap 'unset api_key' EXIT

printf 'Enter your RunPod API key (input is hidden): ' >&2
IFS= read -r -s api_key
printf '\n' >&2

if [[ ${#api_key} -lt 12 || "$api_key" =~ [[:space:]] ]]; then
  printf 'That does not look like a valid API key; nothing was written.\n' >&2
  exit 1
fi

printf '%s' "$api_key" >"$KEY_FILE"
chmod 600 "$KEY_FILE"
unset api_key

printf 'Saved the key privately to %s (mode 600).\n' "$KEY_FILE"
