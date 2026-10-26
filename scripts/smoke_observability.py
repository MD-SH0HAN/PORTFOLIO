#!/usr/bin/env python3
"""End-to-end smoke tests for the Docker Compose observability stack.

Run only after the API, Prometheus, and Grafana containers are started. The
script uses only Python's standard library so it stays small and portable in CI.
"""
from __future__ import annotations

import base64
import json
import os
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

API = os.getenv("OBSERVABILITY_API_URL", "http://127.0.0.1:8000")
PROMETHEUS = os.getenv("PROMETHEUS_URL", "http://127.0.0.1:9090")
GRAFANA = os.getenv("GRAFANA_URL", "http://127.0.0.1:3000")
GRAFANA_USER = os.getenv("GRAFANA_ADMIN_USER", "admin")
GRAFANA_PASSWORD = os.getenv(
    "GRAFANA_ADMIN_PASSWORD", "replace-with-a-long-random-local-password"
)
EXPECTED_DASHBOARD_UID = "shohan-observability-lab"
EXPECTED_ALERTS = {"ApiScrapeMissing", "Elevated5xxRate", "HighP95Latency"}


def get_json(url: str, *, basic_auth: tuple[str, str] | None = None, timeout: float = 4) -> dict:
    headers = {"Accept": "application/json"}
    if basic_auth:
        token = base64.b64encode(f"{basic_auth[0]}:{basic_auth[1]}".encode("utf-8")).decode("ascii")
        headers["Authorization"] = f"Basic {token}"
    request = Request(url, headers=headers)
    with urlopen(request, timeout=timeout) as response:
        if response.status < 200 or response.status >= 300:
            raise RuntimeError(f"GET {url} returned HTTP {response.status}")
        body = response.read().decode("utf-8")
        return json.loads(body) if body else {}


def json_url(base: str, path: str, **query: str) -> str:
    suffix = f"?{urlencode(query)}" if query else ""
    return f"{base.rstrip('/')}/{path.lstrip('/')}{suffix}"


def expect_http_status(url: str, expected: int) -> dict:
    try:
        with urlopen(url, timeout=4) as response:
            status, body = response.status, response.read()
    except HTTPError as exc:
        status, body = exc.code, exc.read()
    if status != expected:
        raise RuntimeError(f"Expected GET {url} to return HTTP {expected}; received HTTP {status}")
    try:
        return json.loads(body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"GET {url} did not return valid JSON") from exc


def prometheus_vector(query: str) -> list[dict]:
    payload = get_json(json_url(PROMETHEUS, "/api/v1/query", query=query))
    if payload.get("status") != "success":
        raise RuntimeError(f"Prometheus query failed: {query}")
    data = payload.get("data", {})
    if data.get("resultType") != "vector":
        raise RuntimeError(f"Prometheus query did not return a vector: {query}")
    return data.get("result", [])


def request_demo_traffic() -> None:
    # Generate real samples before waiting for Prometheus to complete a scrape.
    for path in ("/", "/healthz", "/readyz", "/demo/slow?seconds=0.02"):
        get_json(f"{API}{path}")
    error = expect_http_status(f"{API}/demo/error", 503)
    if error.get("status") != "error":
        raise RuntimeError("/demo/error returned an unexpected JSON payload")


def main() -> None:
    deadline = time.monotonic() + 150
    last_error: Exception | None = None

    # Wait for API/Grafana to be healthy, then send traffic that should become
    # queryable after Prometheus performs its next 10-second scrape.
    while time.monotonic() < deadline:
        try:
            api = get_json(f"{API}/readyz")
            grafana = get_json(f"{GRAFANA}/api/health")
            if api.get("status") == "ok" and grafana.get("database") == "ok":
                break
            last_error = RuntimeError("API readiness or Grafana health is not OK yet")
        except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as exc:
            last_error = exc
        time.sleep(2)
    else:
        raise SystemExit(f"API/Grafana did not become healthy within 150 seconds: {last_error}")

    request_demo_traffic()

    # Verify that the API target is healthy and the deliberate 503 has reached
    # Prometheus as an actual sample, not just as an application HTTP response.
    deadline = time.monotonic() + 60
    last_error = None
    target_up = False
    error_sample_seen = False
    while time.monotonic() < deadline:
        try:
            target_payload = get_json(json_url(PROMETHEUS, "/api/v1/targets", state="active"))
            active_targets = target_payload.get("data", {}).get("activeTargets", [])
            target_up = any(
                target.get("labels", {}).get("job") == "observability-api"
                and target.get("health") == "up"
                for target in active_targets
            )
            samples = prometheus_vector(
                'http_requests_total{job="observability-api",route="/demo/error",status_code="503"}'
            )
            error_sample_seen = bool(samples) and float(samples[0]["value"][1]) >= 1
            if target_up and error_sample_seen:
                break
            last_error = RuntimeError(
                f"Prometheus target UP={target_up}; intentional HTTP 503 sample present={error_sample_seen}"
            )
        except (HTTPError, URLError, TimeoutError, OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
            last_error = exc
        time.sleep(3)
    else:
        raise SystemExit(f"Prometheus did not observe the API and generated 503 sample within 60 seconds: {last_error}")

    # Alert rule provisioning should include the three documented learning rules.
    rules_payload = get_json(f"{PROMETHEUS}/api/v1/rules?type=alert")
    groups = rules_payload.get("data", {}).get("groups", [])
    loaded_alerts = {
        rule.get("name")
        for group in groups
        for rule in group.get("rules", [])
        if rule.get("type") == "alerting"
    }
    missing_alerts = EXPECTED_ALERTS - loaded_alerts
    if missing_alerts:
        raise SystemExit(f"Prometheus is missing expected alert rules: {', '.join(sorted(missing_alerts))}")

    # Grafana health can go green shortly before provisioning finishes, so wait
    # for the actual dashboard API instead of only checking the health endpoint.
    deadline = time.monotonic() + 60
    last_error = None
    dashboard: dict = {}
    dashboard_meta: dict = {}
    while time.monotonic() < deadline:
        try:
            payload = get_json(
                f"{GRAFANA}/api/dashboards/uid/{EXPECTED_DASHBOARD_UID}",
                basic_auth=(GRAFANA_USER, GRAFANA_PASSWORD),
            )
            dashboard = payload.get("dashboard", {})
            dashboard_meta = payload.get("meta", {})
            if dashboard.get("uid") == EXPECTED_DASHBOARD_UID and len(dashboard.get("panels", [])) >= 6:
                break
            last_error = RuntimeError("Provisioned Grafana dashboard is missing expected panels")
        except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as exc:
            last_error = exc
        time.sleep(2)
    else:
        raise SystemExit(f"Grafana dashboard was not provisioned within 60 seconds: {last_error}")

    datasource = get_json(
        f"{GRAFANA}/api/datasources/uid/prometheus",
        basic_auth=(GRAFANA_USER, GRAFANA_PASSWORD),
    )
    if datasource.get("type") != "prometheus":
        raise SystemExit("Grafana's provisioned Prometheus datasource is missing or has the wrong type")
    if not dashboard_meta.get("folderTitle"):
        raise SystemExit("Grafana dashboard is not assigned to its provisioned folder")

    print("Observability integration checks passed:")
    print("  - API readiness, HTTP demo routes, and intentional HTTP 503 verified")
    print("  - Prometheus target UP and HTTP 503 counter query returned a live sample")
    print(f"  - Prometheus alert rules loaded: {', '.join(sorted(EXPECTED_ALERTS))}")
    print(f"  - Grafana dashboard provisioned with {len(dashboard.get('panels', []))} panels")
    print("  - Grafana Prometheus datasource and dashboard folder verified")


if __name__ == "__main__":
    main()
