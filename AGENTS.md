# AGENTS.md

## Cursor Cloud specific instructions

This repo is **David's RunPod + ComfyUI Kit**: Bash scripts that run on a RunPod GPU
Pod plus a dependency-free Python client that drives ComfyUI's REST API. See
`README.md` for the full product/deployment docs.

### Environment
- No package manager and no third-party dependencies. Only **Python 3.10+** (stdlib
  only) and **Bash** are required; both are preinstalled in the cloud VM. There is
  nothing to `pip`/`npm install`.

### Lint / test
- Run everything with `bash tests/verify_local.sh`. It performs the shell "lint"
  (`bash -n` plus `shellcheck -x --source-path=SCRIPTDIR` when `shellcheck` is
  installed — it skips with a notice otherwise), validates the workflow/pod JSON,
  `py_compile`s the client + tests, and runs the `unittest` suite. No GPU or model
  download needed.
- The suite includes `tests/test_generate.py` (function-level mocks) and
  `tests/test_integration.py`, which starts the in-process mock server from
  `tests/mock_comfyui.py` on an ephemeral port and drives the real client over
  loopback (check + prompt + history + image download).
- CI (`.github/workflows/ci.yml`) installs `shellcheck` and runs
  `bash tests/verify_local.sh` on every push/PR.

### Running the product
- The real product needs a **RunPod GPU Pod running ComfyUI + the RealVisXL
  checkpoint**, which cannot run in this VM (no GPU / no RunPod). The `pod/*.sh`
  scripts (`install.sh`, `start.sh`, `verify_pod.sh`, `idle_watchdog.sh`) target
  that Pod environment and are not meant to run locally.
- To exercise the client end-to-end here without a GPU, run the committed mock
  ComfyUI server and point the client at it:
  ```bash
  python3 tests/mock_comfyui.py --port 8188   # in one shell
  export COMFY_URL="http://127.0.0.1:8188"    # in another
  python3 client/generate.py --check
  python3 client/generate.py "a puppy in a sunlit kitchen" --seed 42
  ```
  Images are written to `generated_images/` (a runtime output dir — git-ignored,
  as are `__pycache__/`, `config.env`, and `.runpod_api_key`).
