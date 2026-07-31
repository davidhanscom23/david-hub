#!/usr/bin/env python3
"""Queue a two-pass RealVisXL workflow and download its ComfyUI outputs."""

from __future__ import annotations

import argparse
import json
import os
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

DEFAULT_NEGATIVE = (
    "cartoon, illustration, 3d render, cgi, plastic skin, deformed, "
    "extra fingers, bad anatomy, blurry, low quality, watermark, nsfw, "
    "child, teenager"
)
QUALITY_SUFFIX = (
    "photorealistic, natural light, sharp focus, 35mm, detailed skin texture"
)
DEFAULT_WORKFLOW = (
    Path(__file__).resolve().parent.parent / "workflows" / "image_hires_api.json"
)


class ComfyError(RuntimeError):
    """A useful, user-facing ComfyUI API error."""


def normalize_url(value: str) -> str:
    value = value.strip().rstrip("/")
    if not value:
        raise ComfyError(
            "ComfyUI URL is required. Pass --url or set COMFY_URL."
        )
    parsed = urllib.parse.urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ComfyError(f"Invalid ComfyUI URL: {value!r}")
    return value


def request(
    base_url: str,
    path: str,
    *,
    method: str = "GET",
    payload: dict[str, Any] | None = None,
    timeout: float = 30,
) -> tuple[bytes, str]:
    data = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(
        f"{base_url}{path}", data=data, headers=headers, method=method
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.read(), response.headers.get_content_type()
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        detail = body[:2000] if body else exc.reason
        raise ComfyError(
            f"{method} {path} failed with HTTP {exc.code}: {detail}"
        ) from exc
    except urllib.error.URLError as exc:
        raise ComfyError(f"Could not reach {base_url}: {exc.reason}") from exc
    except TimeoutError as exc:
        raise ComfyError(f"Timed out calling {method} {path}") from exc


def request_json(
    base_url: str,
    path: str,
    *,
    method: str = "GET",
    payload: dict[str, Any] | None = None,
    timeout: float = 30,
) -> Any:
    raw, _ = request(
        base_url, path, method=method, payload=payload, timeout=timeout
    )
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        preview = raw[:500].decode("utf-8", errors="replace")
        raise ComfyError(
            f"{method} {path} returned invalid JSON: {preview}"
        ) from exc


def load_workflow(path: Path) -> dict[str, Any]:
    try:
        workflow = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ComfyError(f"Workflow not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise ComfyError(f"Workflow is not valid JSON: {path}: {exc}") from exc

    required = {
        "1": "CheckpointLoaderSimple",
        "2": "CLIPTextEncode",
        "3": "CLIPTextEncode",
        "4": "EmptyLatentImage",
        "5": "KSampler",
        "6": "LatentUpscale",
        "7": "KSampler",
        "8": "VAEDecode",
        "9": "SaveImage",
    }
    for node_id, class_type in required.items():
        actual = workflow.get(node_id, {}).get("class_type")
        if actual != class_type:
            raise ComfyError(
                f"Workflow node {node_id} must be {class_type}, got {actual!r}"
            )
    return workflow


def build_workflow(
    source: dict[str, Any],
    *,
    prompt: str,
    negative: str,
    seed: int,
    batch: int,
    cfg: float,
    base_steps: int,
    hires_steps: int,
    hires_denoise: float,
    filename_prefix: str,
) -> dict[str, Any]:
    # A JSON round-trip gives us a dependency-free deep copy.
    workflow = json.loads(json.dumps(source))
    prompt = prompt.strip().rstrip(",")
    if not prompt:
        raise ComfyError("Prompt cannot be empty.")
    workflow["2"]["inputs"]["text"] = f"{prompt}, {QUALITY_SUFFIX}"
    workflow["3"]["inputs"]["text"] = negative
    workflow["4"]["inputs"]["batch_size"] = batch
    for node_id, steps in (("5", base_steps), ("7", hires_steps)):
        workflow[node_id]["inputs"]["seed"] = seed
        workflow[node_id]["inputs"]["steps"] = steps
        workflow[node_id]["inputs"]["cfg"] = cfg
    workflow["5"]["inputs"]["denoise"] = 1.0
    workflow["7"]["inputs"]["denoise"] = hires_denoise
    workflow["9"]["inputs"]["filename_prefix"] = filename_prefix
    return workflow


def status_error(entry: dict[str, Any]) -> str | None:
    status = entry.get("status")
    if not isinstance(status, dict):
        return None
    status_str = str(status.get("status_str", "")).lower()
    completed = status.get("completed")
    if status_str in {"error", "failed"} or completed is False:
        messages = status.get("messages", [])
        return json.dumps(messages, ensure_ascii=False)[:4000]
    return None


def wait_for_history(
    base_url: str, prompt_id: str, *, poll_interval: float, timeout: float
) -> dict[str, Any]:
    deadline = time.monotonic() + timeout
    encoded_id = urllib.parse.quote(prompt_id, safe="")
    while time.monotonic() < deadline:
        history = request_json(
            base_url,
            f"/history/{encoded_id}",
            timeout=min(30, max(5, poll_interval * 2)),
        )
        if isinstance(history, dict) and prompt_id in history:
            entry = history[prompt_id]
            error = status_error(entry)
            if error:
                raise ComfyError(f"ComfyUI execution failed: {error}")
            return entry
        time.sleep(poll_interval)
    raise ComfyError(
        f"Generation did not finish within {timeout:.0f}s "
        f"(prompt_id={prompt_id})."
    )


def image_references(entry: dict[str, Any]) -> list[dict[str, str]]:
    references: list[dict[str, str]] = []
    outputs = entry.get("outputs", {})
    if not isinstance(outputs, dict):
        return references
    for output in outputs.values():
        if not isinstance(output, dict):
            continue
        images = output.get("images", [])
        if not isinstance(images, list):
            continue
        for image in images:
            if isinstance(image, dict) and image.get("filename"):
                references.append(
                    {
                        key: str(image[key])
                        for key in ("filename", "subfolder", "type")
                        if key in image
                    }
                )
    return references


def safe_name(value: str) -> str:
    name = Path(value).name
    cleaned = "".join(
        char if char.isalnum() or char in "._-" else "_" for char in name
    )
    return cleaned or "generated.png"


def save_images(
    base_url: str,
    prompt_id: str,
    references: list[dict[str, str]],
    output_dir: Path,
) -> list[Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    saved: list[Path] = []
    stamp = time.strftime("%Y%m%d-%H%M%S")
    for index, reference in enumerate(references, start=1):
        query = urllib.parse.urlencode(reference)
        raw, _ = request(base_url, f"/view?{query}", timeout=120)
        original = safe_name(reference["filename"])
        destination = output_dir / (
            f"{stamp}-{prompt_id[:8]}-{index:02d}-{original}"
        )
        temporary = destination.with_suffix(destination.suffix + ".part")
        temporary.write_bytes(raw)
        temporary.replace(destination)
        saved.append(destination)
    return saved


def check_server(base_url: str) -> int:
    stats = request_json(base_url, "/system_stats", timeout=20)
    models = request_json(base_url, "/models/checkpoints", timeout=30)
    print(f"ComfyUI API ready: {base_url}")
    devices = stats.get("devices", []) if isinstance(stats, dict) else []
    for device in devices:
        if not isinstance(device, dict):
            continue
        name = device.get("name", "unknown device")
        vram = device.get("vram_total")
        suffix = (
            f" ({vram / 1024**3:.1f} GiB VRAM)"
            if isinstance(vram, (int, float))
            else ""
        )
        print(f"Device: {name}{suffix}")
    if isinstance(models, list):
        print("Checkpoints:")
        for model in models:
            print(f"  - {model}")
        expected = "RealVisXL_V5.0_fp16.safetensors"
        if expected not in models:
            print(f"WARNING: expected checkpoint is not listed: {expected}")
            return 2
    return 0


def bounded_int(minimum: int, maximum: int):
    def parse(value: str) -> int:
        integer = int(value)
        if not minimum <= integer <= maximum:
            raise argparse.ArgumentTypeError(
                f"must be between {minimum} and {maximum}"
            )
        return integer

    return parse


def bounded_float(minimum: float, maximum: float):
    def parse(value: str) -> float:
        number = float(value)
        if not minimum <= number <= maximum:
            raise argparse.ArgumentTypeError(
                f"must be between {minimum} and {maximum}"
            )
        return number

    return parse


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(
        description="Generate images through David's RunPod ComfyUI workflow."
    )
    result.add_argument("prompt", nargs="?", help="the image prompt")
    result.add_argument(
        "--url",
        default=os.environ.get("COMFY_URL", ""),
        help="ComfyUI base URL (default: COMFY_URL)",
    )
    result.add_argument(
        "--workflow",
        type=Path,
        default=DEFAULT_WORKFLOW,
        help=f"API workflow JSON (default: {DEFAULT_WORKFLOW})",
    )
    result.add_argument(
        "--output-dir",
        type=Path,
        default=Path("generated_images"),
        help="download directory (default: generated_images)",
    )
    result.add_argument("--negative", default=DEFAULT_NEGATIVE)
    result.add_argument(
        "--seed",
        type=bounded_int(0, 2**63 - 1),
        help="fixed seed; default is random",
    )
    result.add_argument("--batch", type=bounded_int(1, 4), default=1)
    result.add_argument("--cfg", type=bounded_float(1, 30), default=5.0)
    result.add_argument(
        "--base-steps", type=bounded_int(1, 100), default=30
    )
    result.add_argument(
        "--hires-steps", type=bounded_int(1, 100), default=20
    )
    result.add_argument(
        "--hires-denoise", type=bounded_float(0, 1), default=0.5
    )
    result.add_argument("--poll-interval", type=bounded_float(0.1, 60), default=2)
    result.add_argument("--timeout", type=bounded_float(10, 7200), default=1800)
    result.add_argument("--filename-prefix", default="generated")
    result.add_argument(
        "--check",
        action="store_true",
        help="check the server and checkpoint without generating",
    )
    return result


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        base_url = normalize_url(args.url)
        if args.check:
            return check_server(base_url)
        if args.prompt is None:
            raise ComfyError("Prompt is required unless --check is used.")

        source = load_workflow(args.workflow)
        seed = args.seed if args.seed is not None else secrets.randbelow(2**63)
        workflow = build_workflow(
            source,
            prompt=args.prompt,
            negative=args.negative,
            seed=seed,
            batch=args.batch,
            cfg=args.cfg,
            base_steps=args.base_steps,
            hires_steps=args.hires_steps,
            hires_denoise=args.hires_denoise,
            filename_prefix=args.filename_prefix,
        )
        print(f"Queueing seed {seed}, batch {args.batch} at {base_url}")
        queued = request_json(
            base_url,
            "/prompt",
            method="POST",
            payload={"prompt": workflow},
            timeout=60,
        )
        prompt_id = queued.get("prompt_id") if isinstance(queued, dict) else None
        if not prompt_id:
            raise ComfyError(
                f"ComfyUI did not return a prompt_id: "
                f"{json.dumps(queued, ensure_ascii=False)[:2000]}"
            )
        print(f"Queued prompt_id={prompt_id}")
        entry = wait_for_history(
            base_url,
            str(prompt_id),
            poll_interval=args.poll_interval,
            timeout=args.timeout,
        )
        references = image_references(entry)
        if not references:
            raise ComfyError(
                "Generation finished but no image outputs were returned."
            )
        saved = save_images(
            base_url, str(prompt_id), references, args.output_dir
        )
        for path in saved:
            print(f"Saved {path.resolve()}")
        return 0
    except (ComfyError, OSError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
