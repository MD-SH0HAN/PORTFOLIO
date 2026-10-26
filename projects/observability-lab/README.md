# Platform Observability Reference Lab

A **local reference implementation** for practicing platform-observability capabilities with Docker Compose, a small Python HTTP service, Prometheus, Grafana provisioning, and Prometheus alert rules. It is deliberately scoped for a laptop, not a production deployment.

## What it demonstrates

- Separate liveness (`/healthz`) and readiness (`/readyz`) endpoints; set `SERVICE_READY=false` before starting the API to demonstrate an HTTP 200 liveness response alongside an HTTP 503 readiness response and a `service_ready 0` metric.
- HTTP request counters and latency histograms with bounded route labels.
- Prometheus scrape configuration and alert rules for scrape failure, 5xx ratio, and p95 latency.
- Grafana datasource and dashboard provisioning from version-controlled configuration.
- A non-root API container, read-only root filesystem, dropped Linux capabilities, local-only host port bindings, and an explicit local Grafana password.
- Unit-tested route behavior without needing Docker for the test suite.

## Architecture

```text
Browser / curl
      |
      v
API :8000 ---- /metrics ----> Prometheus :9090 ----> Grafana :3000
  |                                  |                    |
  +-- /healthz                       +-- alert rules      +-- provisioned platform observability dashboard
  +-- /readyz
  +-- /demo/error (intentional 503)
  +-- /demo/slow?seconds=1.5 (bounded delay)
```

All host ports bind to `127.0.0.1`. Do not remove that restriction when using this stack as a local learning environment unless you understand the network/security implications.

## Requirements

- Docker Engine with the Docker Compose v2 plugin.
- Python 3.12+ for running the unit tests outside the container.

## Start locally

From this directory:

```bash
cp .env.example .env
# Edit .env and replace the example password with a strong local password.
docker compose up --build -d
docker compose ps
```

On PowerShell, use `Copy-Item .env.example .env` for the copy step. Then open:

- API: <http://127.0.0.1:8000/>
- Prometheus: <http://127.0.0.1:9090/targets>
- Grafana: <http://127.0.0.1:3000/> (user `admin`, password from `.env`)

The `Platform Observability` folder and Prometheus datasource are provisioned automatically. Generate a few sample requests so the dashboard has data:

```bash
curl http://127.0.0.1:8000/
curl http://127.0.0.1:8000/healthz
curl -i http://127.0.0.1:8000/demo/error
curl "http://127.0.0.1:8000/demo/slow?seconds=1.5"
```

The `/demo/error` endpoint intentionally returns HTTP 503; it is included to make error-rate signals visible. `/demo/slow` accepts a delay from 0 to 3 seconds. Neither endpoint is meant for public exposure.

To exercise readiness separately from liveness, start the API with `SERVICE_READY=false` in its environment. The process remains live (`/healthz` returns 200), while `/readyz` returns 503 and the `service_ready` gauge becomes `0`. The Compose health check uses `/readyz`, so the container is marked unhealthy in this mode. Restore `SERVICE_READY=true` and restart the service to return to the healthy baseline. This switch is a local teaching control, not a production dependency check.

## Run tests

```bash
python -m pip install -r api/requirements.txt
python -m unittest discover -s tests -v
```

The tests verify the API routing contract and metric endpoint. GitHub Actions additionally starts the full Compose stack with a per-run random Grafana test password. Its integration smoke test generates traffic and verifies the live Prometheus scrape target, the queryable intentional-503 counter, all three provisioned alert rules, and Grafana dashboard/datasource provisioning. Container logs are collected on failure, and the stack plus CI volumes are always removed afterward.

## Stop and clean up

```bash
docker compose down
```

To delete stored Prometheus history and Grafana state as well, run `docker compose down --volumes`. This permanently removes the lab's local metric history and dashboard state.

## Important limits

- Metrics are in-memory counters/histograms and reset when the API container restarts.
- Alerts are evaluated by Prometheus; no Alertmanager/email/chat notification service is included.
- The stack has no authentication proxy, TLS termination, multi-user hardening, long-term storage, or production SLO policy.
- Values and dashboards are for practice and must not be described as production telemetry or a deployed service.
