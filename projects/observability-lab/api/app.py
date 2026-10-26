"""Small HTTP service designed for a local Prometheus/Grafana learning lab."""
from __future__ import annotations

import json
import os
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, Histogram, generate_latest

SERVICE_VERSION = os.getenv("SERVICE_VERSION", "1.0.0")
STARTED_AT = time.monotonic()

HTTP_REQUESTS = Counter(
    "http_requests_total",
    "Total HTTP requests served, excluding the scrape endpoint.",
    ("method", "route", "status_code"),
)
HTTP_REQUEST_DURATION = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds, excluding the scrape endpoint.",
    ("route",),
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0),
)
SERVICE_READY = Gauge("service_ready", "Whether the application is ready to serve requests.")
SERVICE_UPTIME = Gauge("service_uptime_seconds", "Application process uptime in seconds.")


def is_service_ready() -> bool:
    """Read the local demo readiness switch; liveness remains independent."""
    return os.getenv("SERVICE_READY", "true").strip().lower() not in {"0", "false", "no", "off"}


SERVICE_READY.set(1 if is_service_ready() else 0)

ROUTE_NAMES = {"/", "/healthz", "/readyz", "/metrics", "/demo/error", "/demo/slow"}


def _json_response(status: int, payload: dict) -> tuple[int, str, bytes]:
    body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    return status, "application/json; charset=utf-8", body


def classify_route(path: str) -> str:
    """Return a bounded route label to avoid unbounded Prometheus cardinality."""
    return path if path in ROUTE_NAMES else "unmatched"


def route_response(target: str, method: str = "GET") -> tuple[int, str, bytes]:
    """Resolve a request without opening a socket, so routes can be unit-tested."""
    parsed = urlsplit(target)
    path = parsed.path or "/"

    if method != "GET":
        return _json_response(405, {"error": "method_not_allowed", "allowed": ["GET"]})

    if path == "/metrics":
        SERVICE_UPTIME.set(max(0.0, time.monotonic() - STARTED_AT))
        SERVICE_READY.set(1 if is_service_ready() else 0)
        return 200, CONTENT_TYPE_LATEST, generate_latest()

    if path == "/healthz":
        # Liveness answers whether the process can handle an HTTP request.
        return _json_response(200, {"status": "ok", "service": "observability-lab-api"})

    if path == "/readyz":
        # Readiness is separately controllable for local failure-mode practice.
        ready = is_service_ready()
        SERVICE_READY.set(1 if ready else 0)
        payload = {
            "status": "ok" if ready else "not_ready",
            "service": "observability-lab-api",
        }
        return _json_response(200 if ready else 503, payload)

    if path == "/demo/error":
        return _json_response(503, {"status": "error", "message": "Intentional demo failure; inspect the metrics and recover."})

    if path == "/demo/slow":
        query = parse_qs(parsed.query)
        try:
            requested_delay = float(query.get("seconds", ["1.0"])[0])
        except (TypeError, ValueError):
            requested_delay = 1.0
        delay = min(3.0, max(0.0, requested_delay))
        time.sleep(delay)
        return _json_response(200, {"status": "ok", "simulated_delay_seconds": delay})

    if path == "/":
        return _json_response(200, {
            "service": "observability-lab-api",
            "status": "ok",
            "version": SERVICE_VERSION,
            "uptime_seconds": round(max(0.0, time.monotonic() - STARTED_AT), 3),
            "endpoints": ["/healthz", "/readyz", "/metrics", "/demo/error", "/demo/slow?seconds=1.5"],
            "notice": "Local learning lab; not a production service.",
        })

    return _json_response(404, {"error": "not_found", "path": path})


class ObservabilityHandler(BaseHTTPRequestHandler):
    server_version = "ObservabilityLab/1.0"
    sys_version = ""

    def _serve(self, method: str) -> None:
        started = time.perf_counter()
        path = urlsplit(self.path).path or "/"
        status, content_type, body = route_response(self.path, method)
        route = classify_route(path)
        elapsed = max(0.0, time.perf_counter() - started)

        if path != "/metrics":
            HTTP_REQUESTS.labels(method=method, route=route, status_code=str(status)).inc()
            HTTP_REQUEST_DURATION.labels(route=route).observe(elapsed)

        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802 - standard-library handler API
        self._serve("GET")

    def do_POST(self) -> None:  # noqa: N802
        self._serve("POST")

    def do_PUT(self) -> None:  # noqa: N802
        self._serve("PUT")

    def do_DELETE(self) -> None:  # noqa: N802
        self._serve("DELETE")


def main() -> None:
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    server = ThreadingHTTPServer((host, port), ObservabilityHandler)
    server.daemon_threads = True
    print(f"Observability Lab API {SERVICE_VERSION} listening on {host}:{port}", flush=True)
    try:
        server.serve_forever(poll_interval=0.5)
    except KeyboardInterrupt:
        print("Shutting down observability lab API.", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
