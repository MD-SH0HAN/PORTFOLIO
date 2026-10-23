"""Unit tests for the HTTP routing contract; no Docker daemon is required."""
import json
import os
import sys
import unittest
from unittest.mock import patch
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "api"))
import app  # noqa: E402


class RouteResponseTests(unittest.TestCase):
    def decode(self, target, method="GET"):
        status, content_type, body = app.route_response(target, method)
        if content_type.startswith("application/json"):
            self.assertIn("charset=utf-8", content_type)
        return status, json.loads(body.decode("utf-8")) if content_type.startswith("application/json") else body

    def test_root_explains_service_and_endpoints(self):
        status, payload = self.decode("/")
        self.assertEqual(status, 200)
        self.assertEqual(payload["service"], "observability-lab-api")
        self.assertIn("/metrics", payload["endpoints"])
        self.assertIn("version", payload)

    def test_health_and_readiness_are_successful_by_default(self):
        with patch.dict(os.environ, {"SERVICE_READY": "true"}):
            for path in ("/healthz", "/readyz"):
                with self.subTest(path=path):
                    status, payload = self.decode(path)
                    self.assertEqual(status, 200)
                    self.assertEqual(payload["status"], "ok")

    def test_liveness_stays_healthy_when_service_is_not_ready(self):
        with patch.dict(os.environ, {"SERVICE_READY": "false"}):
            health_status, health = self.decode("/healthz")
            ready_status, ready = self.decode("/readyz")
            _, _, metrics = app.route_response("/metrics")

        self.assertEqual(health_status, 200)
        self.assertEqual(health["status"], "ok")
        self.assertEqual(ready_status, 503)
        self.assertEqual(ready["status"], "not_ready")
        self.assertIn(b"service_ready 0.0", metrics)

    def test_demo_error_is_intentionally_unhealthy(self):
        status, payload = self.decode("/demo/error")
        self.assertEqual(status, 503)
        self.assertEqual(payload["status"], "error")

    def test_unknown_route_is_404(self):
        status, payload = self.decode("/not-a-route")
        self.assertEqual(status, 404)
        self.assertEqual(payload["error"], "not_found")

    def test_non_get_methods_are_rejected(self):
        status, payload = self.decode("/", method="POST")
        self.assertEqual(status, 405)
        self.assertEqual(payload["allowed"], ["GET"])

    def test_route_metrics_have_bounded_labels(self):
        self.assertEqual(app.classify_route("/demo/error"), "/demo/error")
        self.assertEqual(app.classify_route("/user/some-arbitrary-id"), "unmatched")

    def test_metrics_endpoint_exposes_service_metrics(self):
        status, content_type, body = app.route_response("/metrics")
        self.assertEqual(status, 200)
        self.assertIn("text/plain", content_type)
        self.assertIn(b"service_ready", body)
        self.assertIn(b"service_uptime_seconds", body)


if __name__ == "__main__":
    unittest.main()
