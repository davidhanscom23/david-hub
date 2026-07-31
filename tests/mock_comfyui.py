#!/usr/bin/env python3
"""A minimal, dependency-free mock ComfyUI server.

It implements exactly the HTTP endpoints that ``client/generate.py`` uses so the
client can be exercised end-to-end without a GPU, the RealVisXL checkpoint, or a
real RunPod Pod:

  GET  /system_stats          -> device info
  GET  /models/checkpoints    -> list containing the RealVisXL checkpoint
  POST /prompt                 -> returns a prompt_id
  GET  /history/{prompt_id}    -> a success entry referencing one output image
  GET  /view?filename=...      -> real PNG bytes

Use it two ways:

  * Programmatically in tests via :func:`serve`, which returns a running server
    bound to an ephemeral port plus its background thread.
  * As a standalone process: ``python3 tests/mock_comfyui.py [--port 8188]``.
"""
from __future__ import annotations

import argparse
import json
import struct
import threading
import zlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

CHECKPOINT = "RealVisXL_V5.0_fp16.safetensors"


def make_png(width: int = 64, height: int = 64, rgb: tuple[int, int, int] = (70, 130, 180)) -> bytes:
    """Build a valid solid-color PNG using only the standard library."""

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = bytearray()
    row = bytes(rgb) * width
    for _ in range(height):
        raw.append(0)  # PNG filter type 0 (None) per scanline
        raw.extend(row)
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


PNG_BYTES = make_png()


class MockComfyHandler(BaseHTTPRequestHandler):
    """Handles the small subset of the ComfyUI REST API the client relies on."""

    server_version = "MockComfyUI/1.0"
    _lock = threading.Lock()
    _counter = 0

    def log_message(self, fmt: str, *args) -> None:  # noqa: A003 - stdlib signature
        print("[mock-comfyui] " + (fmt % args))

    def _send_json(self, obj, code: int = 200) -> None:
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802 - stdlib signature
        path = urlparse(self.path).path
        if path == "/system_stats":
            self._send_json(
                {"devices": [{"name": "Mock RTX 4090", "vram_total": 24 * 1024**3}]}
            )
        elif path == "/models/checkpoints":
            self._send_json([CHECKPOINT])
        elif path.startswith("/history/"):
            prompt_id = path.rsplit("/", 1)[-1]
            self._send_json(
                {
                    prompt_id: {
                        "outputs": {
                            "9": {
                                "images": [
                                    {
                                        "filename": "generated_00001_.png",
                                        "subfolder": "",
                                        "type": "output",
                                    }
                                ]
                            }
                        },
                        "status": {
                            "status_str": "success",
                            "completed": True,
                            "messages": [],
                        },
                    }
                }
            )
        elif path == "/view":
            self.send_response(200)
            self.send_header("Content-Type", "image/png")
            self.send_header("Content-Length", str(len(PNG_BYTES)))
            self.end_headers()
            self.wfile.write(PNG_BYTES)
        else:
            self._send_json({"error": "not found"}, code=404)

    def do_POST(self) -> None:  # noqa: N802 - stdlib signature
        path = urlparse(self.path).path
        length = int(self.headers.get("Content-Length", "0"))
        self.rfile.read(length)  # drain the request body
        if path == "/prompt":
            with MockComfyHandler._lock:
                MockComfyHandler._counter += 1
                number = MockComfyHandler._counter
            self._send_json({"prompt_id": f"mock-{number:04d}", "number": number})
        else:
            self._send_json({"error": "not found"}, code=404)


def serve(host: str = "127.0.0.1", port: int = 0) -> tuple[ThreadingHTTPServer, threading.Thread]:
    """Start the mock server in a background thread.

    Returns the ``ThreadingHTTPServer`` (use ``server.server_address`` to read the
    bound host/port) and the daemon thread running it. Call ``server.shutdown()``
    to stop.
    """
    server = ThreadingHTTPServer((host, port), MockComfyHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run a mock ComfyUI server.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8188)
    args = parser.parse_args(argv)

    server = ThreadingHTTPServer((args.host, args.port), MockComfyHandler)
    host, port = server.server_address[0], server.server_address[1]
    print(f"[mock-comfyui] listening on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[mock-comfyui] shutting down")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
