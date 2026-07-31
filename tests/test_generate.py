from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location(
    "generate", ROOT / "client" / "generate.py"
)
assert SPEC and SPEC.loader
generate = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(generate)

PNG = (
    b"\x89PNG\r\n\x1a\n"
    b"\x00\x00\x00\rIHDR"
    b"\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
)


class ClientTests(unittest.TestCase):
    url = "http://mock-comfy.test"

    def test_check_server(self):
        responses = [
            {
                "devices": [
                    {"name": "Mock RTX", "vram_total": 24 * 1024**3}
                ]
            },
            ["RealVisXL_V5.0_fp16.safetensors"],
        ]
        with mock.patch.object(generate, "request_json", side_effect=responses):
            self.assertEqual(generate.check_server(self.url), 0)

    def test_generate_and_download(self):
        submitted = {}

        def fake_request_json(base_url, path, **kwargs):
            if path == "/prompt":
                submitted.update(kwargs["payload"])
                return {"prompt_id": "mock-prompt", "number": 1}
            if path == "/history/mock-prompt":
                return {
                    "mock-prompt": {
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
            raise AssertionError(f"Unexpected API path: {path}")

        def fake_request(base_url, path, **kwargs):
            if path.startswith("/view?"):
                return PNG, "image/png"
            raise AssertionError(f"Unexpected download path: {path}")

        with tempfile.TemporaryDirectory() as temporary:
            with (
                mock.patch.object(
                    generate, "request_json", side_effect=fake_request_json
                ),
                mock.patch.object(
                    generate, "request", side_effect=fake_request
                ),
            ):
                exit_code = generate.main(
                    [
                        "a puppy in a kitchen",
                        "--url",
                        self.url,
                        "--workflow",
                        str(ROOT / "workflows" / "image_hires_api.json"),
                        "--output-dir",
                        temporary,
                        "--seed",
                        "42",
                        "--batch",
                        "2",
                        "--poll-interval",
                        "0.1",
                    ]
                )
            self.assertEqual(exit_code, 0)
            output_files = list(Path(temporary).glob("*.png"))
            self.assertEqual(len(output_files), 1)
            self.assertEqual(output_files[0].read_bytes(), PNG)

            workflow = submitted["prompt"]
            self.assertEqual(workflow["5"]["inputs"]["seed"], 42)
            self.assertEqual(workflow["7"]["inputs"]["seed"], 42)
            self.assertEqual(workflow["4"]["inputs"]["batch_size"], 2)
            self.assertEqual(workflow["5"]["inputs"]["denoise"], 1.0)
            self.assertEqual(workflow["7"]["inputs"]["denoise"], 0.5)

    def test_workflow_graph_references_exist(self):
        workflow = generate.load_workflow(
            ROOT / "workflows" / "image_hires_api.json"
        )
        node_ids = set(workflow)
        for node in workflow.values():
            for value in node["inputs"].values():
                if (
                    isinstance(value, list)
                    and len(value) == 2
                    and isinstance(value[0], str)
                    and isinstance(value[1], int)
                ):
                    self.assertIn(value[0], node_ids)

    def test_invalid_url_is_rejected(self):
        with self.assertRaises(generate.ComfyError):
            generate.normalize_url("not-a-url")


if __name__ == "__main__":
    unittest.main()
