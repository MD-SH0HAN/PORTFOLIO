"""Offline control-flow test for the full-stack smoke-test script."""
from __future__ import annotations

import contextlib
import io
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scripts"))
import smoke_observability  # noqa: E402


class SmokeScriptControlFlowTests(unittest.TestCase):
    def test_smoke_script_checks_the_expected_service_contract(self):
        def fake_get_json(url: str, **kwargs) -> dict:
            if url.endswith("/readyz"):
                return {"status": "ok"}
            if url.endswith("/api/health"):
                return {"database": "ok"}
            if "/api/v1/targets" in url:
                return {"data": {"activeTargets": [
                    {"labels": {"job": "observability-api"}, "health": "up"}
                ]}}
            if "/api/v1/rules" in url:
                return {"data": {"groups": [{"rules": [
                    {"name": "ApiScrapeMissing", "type": "alerting"},
                    {"name": "Elevated5xxRate", "type": "alerting"},
                    {"name": "HighP95Latency", "type": "alerting"},
                ]}]}}
            if "/api/dashboards/uid/" in url:
                return {
                    "dashboard": {
                        "uid": "shohan-observability-lab",
                        "panels": [{"id": panel_id} for panel_id in range(1, 7)],
                    },
                    "meta": {"folderTitle": "SRE Learning Lab"},
                }
            if "/api/datasources/uid/" in url:
                return {"type": "prometheus"}
            return {"status": "ok"}

        output = io.StringIO()
        with (
            patch.object(smoke_observability, "get_json", side_effect=fake_get_json) as get_json,
            patch.object(smoke_observability, "prometheus_vector", return_value=[
                {"value": ["0", "1"]}
            ]) as vector_query,
            patch.object(smoke_observability, "expect_http_status", return_value={"status": "error"}),
            contextlib.redirect_stdout(output),
        ):
            smoke_observability.main()

        self.assertIn("Observability integration checks passed", output.getvalue())
        self.assertIn("6 panels", output.getvalue())
        self.assertTrue(any("/api/dashboards/uid/" in call.args[0] for call in get_json.call_args_list))
        vector_query.assert_called_once()


if __name__ == "__main__":
    unittest.main(verbosity=2)
