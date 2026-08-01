#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

for script in "$ROOT"/pod/*.sh "$ROOT"/tests/*.sh; do
  bash -n "$script"
done

if command -v shellcheck >/dev/null 2>&1; then
  shellcheck -x --source-path=SCRIPTDIR "$ROOT"/pod/*.sh "$ROOT"/tests/*.sh
else
  printf 'shellcheck not found; skipping lint (install it for full checks).\n'
fi

python3 -m json.tool "$ROOT/workflows/image_hires_api.json" >/dev/null
python3 -m json.tool "$ROOT/runpod-pod.example.json" >/dev/null
python3 -m py_compile \
  "$ROOT/client/generate.py" \
  "$ROOT/tests/test_generate.py" \
  "$ROOT/tests/test_integration.py" \
  "$ROOT/tests/mock_comfyui.py"
python3 -m unittest discover -s "$ROOT/tests" -p 'test_*.py' -v

printf 'Local verification passed.\n'
