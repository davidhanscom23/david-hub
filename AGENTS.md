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
  (`bash -n` syntax check of every `pod/*.sh` and `tests/*.sh`), validates the
  workflow/pod JSON, `py_compile`s the client + tests, and runs the `unittest`
  suite (client tested against mocked ComfyUI). No GPU or model download needed.

### Running the product
- The real product needs a **RunPod GPU Pod running ComfyUI + the RealVisXL
  checkpoint**, which cannot run in this VM (no GPU / no RunPod). The `pod/*.sh`
  scripts (`install.sh`, `start.sh`, `verify_pod.sh`, `idle_watchdog.sh`) target
  that Pod environment and are not meant to run locally.
- To exercise the client end-to-end here, point it at a **mock ComfyUI HTTP server**
  on `127.0.0.1:8188` that implements the endpoints the client calls:
  `GET /system_stats`, `GET /models/checkpoints`, `POST /prompt`,
  `GET /history/{prompt_id}`, and `GET /view?filename=...` (return real PNG bytes).
  Then run, e.g.:
  ```bash
  export COMFY_URL="http://127.0.0.1:8188"
  python3 client/generate.py --check
  python3 client/generate.py "a puppy in a sunlit kitchen" --seed 42
  ```
  Images are written to `generated_images/` (a runtime output dir — do not commit
  it; the same goes for `__pycache__/`).
