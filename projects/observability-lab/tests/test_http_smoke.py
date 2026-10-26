"""Live HTTP integration checks for the API handler; Docker is not required."""
from __future__ import annotations

import json
import sys
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "api"))
import app  # noqa: E402


class LiveHTTPTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), app.ObservabilityHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def request(self, path: str):
        try:
            with urllib.request.urlopen(self.base_url + path, timeout=2) as response:
                return response.status, response.headers.get("Content-Type", ""), response.read()
        except urllib.error.HTTPError as error:
            return error.code, error.headers.get("Content-Type", ""), error.read()

    def test_readiness_and_root_are_served_over_http(self):
        status, _, body = self.request("/readyz")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["status"], "ok")
        status, _, body = self.request("/")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["service"], "observability-lab-api")

    def test_intentional_failure_is_counted_in_prometheus_metrics(self):
        status, _, body = self.request("/demo/error")
        self.assertEqual(status, 503)
        self.assertEqual(json.loads(body)["status"], "error")
        status, content_type, body = self.request("/metrics")
        metrics = body.decode("utf-8")
        self.assertEqual(status, 200)
        self.assertIn("text/plain", content_type)
        self.assertIn('http_requests_total{method="GET",route="/demo/error",status_code="503"}', metrics)
        self.assertIn('http_request_duration_seconds_count{route="/demo/error"}', metrics)

    def test_slow_route_returns_configured_delay(self):
        status, _, body = self.request("/demo/slow?seconds=0.02")
        self.assertEqual(status, 200)
        self.assertAlmostEqual(json.loads(body)["simulated_delay_seconds"], 0.02)


if __name__ == "__main__":
    unittest.main()
