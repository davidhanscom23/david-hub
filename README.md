# David's RunPod + ComfyUI Kit

This kit turns the handoff guide into a repeatable RunPod setup:

- RealVisXL V5.0 fp16 checkpoint download with SHA-256 verification
- two-pass SDXL hi-res API workflow
- idempotent ComfyUI start script
- idle watchdog that safely stops a Pod after inactivity
- dependency-free Python client that queues a prompt and downloads every result
- Pod and local verification scripts

No API key is included. The interactive key helper never echoes the key.

## Important corrections to the original handoff

The handoff's storage and port details no longer match current RunPod behavior:

1. **Use a Pod Volume for this stop/resume design.** A Pod Volume mounted at
   `/workspace` survives stops and restarts. A Pod with a Network Volume cannot be
   stopped; it must be terminated and redeployed. The watchdog deliberately uses
   the non-destructive `POST /pods/{id}/stop` action and refuses to substitute a
   terminate call.
2. **Expose the port ComfyUI actually listens on.** The current official RunPod
   ComfyUI template uses port `8188`. RunPod proxy URLs directly name the internal
   port: `https://<POD_ID>-8188.proxy.runpod.net`. There is no universal
   `3000 → 3001` mapping.
3. **RealVisXL is not a safety control.** The included negative prompt and this
   kit's intended use are SFW, but an open checkpoint cannot guarantee safe output.
   Review every generated image before publishing it.

## 1. Deploy the Pod (you do this in RunPod)

In the RunPod console:

1. Add credits and create an API key. Do not paste the key into chat.
2. Deploy the official **ComfyUI** template on an RTX 4090 or L40.
3. Choose **On-Demand**.
4. Allocate a **Pod Volume** of at least 50 GB, mounted at `/workspace`.
   Do not attach a Network Volume if you want the watchdog to stop/resume this Pod.
5. Confirm `8188/http` is exposed. `8080/http` is useful for the file browser and
   `22/tcp` is optional for SSH.
6. Wait for ComfyUI to open at
   `https://<POD_ID>-8188.proxy.runpod.net`.

The example API body RunPod documents for this shape is in
`runpod-pod.example.json`. It intentionally contains no account-specific values or
API key.

## 2. Upload and install the kit

Upload the entire `runpod-comfyui-kit` folder to `/workspace` using the template's
file browser or JupyterLab. In a Pod terminal:

```bash
cd /workspace/runpod-comfyui-kit
bash pod/install.sh
```

The installer:

- detects `/workspace/madapps/ComfyUI`, `/workspace/ComfyUI`, or `/comfyui`;
- downloads the official 6.94 GB fp16 checkpoint from Hugging Face;
- verifies its published SHA-256;
- installs this kit at `/workspace/david-comfyui`;
- writes `/workspace/image_hires_api.json`; and
- never invokes system `pip`.

The download resumes if interrupted. To use a nonstandard ComfyUI location:

```bash
COMFYUI_DIR=/your/ComfyUI/path bash pod/install.sh
```

## 3. Set the RunPod key privately

Run this yourself in the Pod terminal:

```bash
bash /workspace/david-comfyui/pod/set_api_key.sh
```

The prompt is hidden and the resulting file is mode `600`. The key is used only to
stop this Pod after it is idle.

## 4. Configure and start

The installer creates `/workspace/david-comfyui/config.env`. Defaults:

- ComfyUI port: `8188`
- idle limit: 15 minutes
- startup grace: 5 minutes
- default workflow batch: 1

Batch 1 is the reliable smoke-test setting for a 24 GB GPU. The client can request
up to four images once the basic test passes.

Start or verify the service:

```bash
bash /workspace/david-comfyui/pod/start.sh
bash /workspace/david-comfyui/pod/verify_pod.sh
```

The start script detects an already-running template-managed ComfyUI service and
does not launch a duplicate.

For templates that do not auto-start ComfyUI, set the Pod's **Docker Start
Command** after the first successful installation to:

```bash
bash -lc '/workspace/david-comfyui/pod/start.sh; sleep infinity'
```

Editing a running Pod resets its container. Confirm everything important is under
`/workspace` first.

## 5. Generate an image

On your Mac or any machine with Python 3.10+:

```bash
export COMFY_URL="https://<POD_ID>-8188.proxy.runpod.net"
python3 client/generate.py --check
python3 client/generate.py \
  "a golden retriever puppy in a sunlit kitchen, natural light, 35mm"
```

Images are saved under `generated_images/`. Useful controls:

```bash
python3 client/generate.py "your prompt" --batch 4
python3 client/generate.py "your prompt" --seed 42
python3 client/generate.py "your prompt" --hires-denoise 0.45 --cfg 4.5
python3 client/generate.py --help
```

The client applies the same seed to both KSamplers, reports ComfyUI validation
errors, times out cleanly, and downloads all images returned by the SaveImage node.

## 6. Idle-stop behavior

The watchdog watches both the queue and the latest history record. This catches
short jobs that start and finish between polling intervals. It resets the timer
when:

- a job is running or pending;
- the most recent history record changes; or
- ComfyUI cannot be reached.

It never treats a broken/unreachable ComfyUI service as safe-to-stop. When the idle
limit is reached it calls RunPod's non-destructive stop endpoint. GPU billing
stops, but Pod Volume storage billing continues.

The timer measures API generation activity, not mouse movement in the browser.
Disable it temporarily by setting this in `/workspace/david-comfyui/config.env`:

```bash
AUTO_STOP_ENABLED=0
```

Then restart the watchdog or Pod.

## Security and operating notes

- RunPod's HTTP proxy is publicly reachable. A Pod ID is not authentication. Do not
  put private inputs on an unauthenticated ComfyUI endpoint.
- Stop the Pod when it is not in use and keep the idle watchdog enabled.
- Do not install Impact Pack / FaceDetailer into this environment.
- Keep all Python dependencies inside the ComfyUI environment supplied by the
  template. This kit needs no extra Python package.
- Back up anything important. RunPod says its Pod storage is for active workloads,
  not long-term archival storage.
- Do not generate real identifiable people without permission, and do not create
  sexualized or exploitative depictions of minors.

## Troubleshooting

Inspect:

```bash
tail -n 100 /workspace/comfy.log
tail -n 100 /workspace/watchdog.log
bash /workspace/david-comfyui/pod/verify_pod.sh
```

Common fixes:

- **Bad Gateway / Not Ready:** wait a few minutes and confirm the service listens on
  `0.0.0.0:8188`.
- **Checkpoint not listed:** confirm the file is in the detected ComfyUI
  `models/checkpoints` directory and restart ComfyUI.
- **CUDA out of memory:** retry with `--batch 1`; then lower the base or hi-res
  dimensions in a copy of the workflow.
- **Watchdog does not stop:** confirm this is a Pod Volume Pod, not a Network Volume
  Pod, and inspect `watchdog.log`.
- **Zero GPU after resume:** the original GPU may have been rented by someone else.
  Your Pod Volume remains tied to that host; wait and retry or recover the data
  before terminating.

## Local verification

From the kit directory:

```bash
bash tests/verify_local.sh
```

This checks shell syntax, validates the workflow graph, and exercises the client
against a local mock ComfyUI server without downloading a model or requiring a GPU.
