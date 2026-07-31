"""End-to-end integration test for client/generate.py.

Unlike test_generate.py (which mocks the HTTP layer), this test starts a real
in-process mock ComfyUI HTTP server and drives the actual client over the network
loopback: health check, prompt submission, history polling, and image download.
"""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

_SPEC = importlib.util.spec_from_file_location(
    "generate", ROOT / "client" / "generate.py"
)
assert _SPEC and _SPEC.loader
generate = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(generate)

_MOCK_SPEC = importlib.util.spec_from_file_location(
    "mock_comfyui", ROOT / "tests" / "mock_comfyui.py"
)
assert _MOCK_SPEC and _MOCK_SPEC.loader
mock_comfyui = importlib.util.module_from_spec(_MOCK_SPEC)
_MOCK_SPEC.loader.exec_module(mock_comfyui)

WORKFLOW = ROOT / "workflows" / "image_hires_api.json"


class IntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.server, cls.thread = mock_comfyui.serve("127.0.0.1", 0)
        host, port = cls.server.server_address[0], cls.server.server_address[1]
        cls.base_url = f"http://{host}:{port}"

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=5)

    def test_check_reports_ready(self) -> None:
        self.assertEqual(
            generate.main(["--check", "--url", self.base_url]), 0
        )

    def test_generate_downloads_valid_png(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            exit_code = generate.main(
                [
                    "a golden retriever puppy in a sunlit kitchen",
                    "--url",
                    self.base_url,
                    "--workflow",
                    str(WORKFLOW),
                    "--output-dir",
                    tmp,
                    "--seed",
                    "42",
                    "--poll-interval",
                    "0.1",
                ]
            )
            self.assertEqual(exit_code, 0)
            images = list(Path(tmp).glob("*.png"))
            self.assertEqual(len(images), 1)
            data = images[0].read_bytes()
            self.assertTrue(data.startswith(b"\x89PNG\r\n\x1a\n"))


if __name__ == "__main__":
    unittest.main()
