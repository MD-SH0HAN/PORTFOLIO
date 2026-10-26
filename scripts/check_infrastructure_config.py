#!/usr/bin/env python3
"""Statically validate the observability lab's Compose, Prometheus and Grafana contract.

This catches malformed/mismatched configuration before a Docker daemon is
available. It complements, but does not replace, the live Compose integration test.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT / "projects" / "observability-lab"
EXPECTED_ALERTS = {"ApiScrapeMissing", "Elevated5xxRate", "HighP95Latency"}
EXPECTED_SERVICES = {"api", "prometheus", "grafana"}


class ConfigAudit:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.checked: list[str] = []

    def require(self, condition: bool, message: str) -> None:
        if not condition:
            self.errors.append(message)

    def read_yaml(self, relative: str) -> dict[str, Any]:
        path = LAB / relative
        try:
            payload = yaml.safe_load(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, yaml.YAMLError) as exc:
            self.errors.append(f"{relative}: unable to parse YAML ({exc})")
            return {}
        self.checked.append(relative)
        if not isinstance(payload, dict):
            self.errors.append(f"{relative}: expected a YAML mapping at the document root")
            return {}
        return payload

    def read_json(self, relative: str) -> dict[str, Any]:
        path = LAB / relative
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            self.errors.append(f"{relative}: unable to parse JSON ({exc})")
            return {}
        self.checked.append(relative)
        if not isinstance(payload, dict):
            self.errors.append(f"{relative}: expected a JSON object at the document root")
            return {}
        return payload


def main() -> int:
    audit = ConfigAudit()
    compose = audit.read_yaml("docker-compose.yml")
    prometheus = audit.read_yaml("prometheus/prometheus.yml")
    alert_config = audit.read_yaml("prometheus/alerts.yml")
    datasource_config = audit.read_yaml("grafana/provisioning/datasources/prometheus.yml")
    dashboard_provider = audit.read_yaml("grafana/provisioning/dashboards/provider.yml")
    dashboard = audit.read_json("grafana/dashboards/observability.json")

    services = compose.get("services", {})
    if not isinstance(services, dict):
        services = {}
    audit.require(set(services) == EXPECTED_SERVICES,
                  f"docker-compose.yml: expected services {sorted(EXPECTED_SERVICES)}, found {sorted(services)}")

    published_ports: list[tuple[str, str]] = []
    for service_name, service in services.items():
        if not isinstance(service, dict):
            audit.errors.append(f"docker-compose.yml: service {service_name!r} must be a mapping")
            continue
        for port in service.get("ports", []) or []:
            published_ports.append((service_name, str(port)))
            audit.require(str(port).startswith("127.0.0.1:"),
                          f"docker-compose.yml: {service_name} publishes non-loopback port {port!r}")
        audit.require("ALL" in (service.get("cap_drop") or []),
                      f"docker-compose.yml: {service_name} should drop all Linux capabilities")
        audit.require("no-new-privileges:true" in (service.get("security_opt") or []),
                      f"docker-compose.yml: {service_name} should disable privilege escalation")
        audit.require(int(service.get("pids_limit", 0) or 0) > 0,
                      f"docker-compose.yml: {service_name} must set a positive pids_limit")

    api = services.get("api", {}) if isinstance(services.get("api", {}), dict) else {}
    audit.require(api.get("read_only") is True,
                  "docker-compose.yml: API container should have a read-only root filesystem")
    audit.require(bool(api.get("healthcheck", {}).get("test")) if isinstance(api.get("healthcheck"), dict) else False,
                  "docker-compose.yml: API must define a health check")
    audit.require(any("127.0.0.1:8000:8000" == port for service, port in published_ports if service == "api"),
                  "docker-compose.yml: API should publish only on 127.0.0.1:8000")

    grafana = services.get("grafana", {}) if isinstance(services.get("grafana", {}), dict) else {}
    environment = grafana.get("environment", {}) or {}
    if isinstance(environment, list):
        environment = dict(item.split("=", 1) for item in environment if isinstance(item, str) and "=" in item)
    password_setting = str(environment.get("GF_SECURITY_ADMIN_PASSWORD", "")) if isinstance(environment, dict) else ""
    audit.require(":?" in password_setting,
                  "docker-compose.yml: Grafana admin password must be required, not silently defaulted")
    audit.require(str(environment.get("GF_USERS_ALLOW_SIGN_UP", "")).lower() == "false" if isinstance(environment, dict) else False,
                  "docker-compose.yml: Grafana user sign-up should be disabled")

    scrape_jobs = prometheus.get("scrape_configs", []) or []
    api_job = next((job for job in scrape_jobs if isinstance(job, dict) and job.get("job_name") == "observability-api"), None)
    audit.require(api_job is not None, "prometheus/prometheus.yml: missing observability-api scrape job")
    if api_job:
        targets = [target for static in api_job.get("static_configs", []) or [] if isinstance(static, dict)
                   for target in static.get("targets", []) or []]
        audit.require("api:8000" in targets, "prometheus/prometheus.yml: observability-api must scrape api:8000")
        audit.require(api_job.get("metrics_path", "/metrics") == "/metrics",
                      "prometheus/prometheus.yml: API scrape path should be /metrics")
    audit.require("/etc/prometheus/alerts.yml" in (prometheus.get("rule_files", []) or []),
                  "prometheus/prometheus.yml: alert rules file is not loaded")

    groups = alert_config.get("groups", []) or []
    loaded_alerts = {rule.get("alert") for group in groups if isinstance(group, dict)
                     for rule in (group.get("rules", []) or []) if isinstance(rule, dict)}
    audit.require(loaded_alerts == EXPECTED_ALERTS,
                  f"prometheus/alerts.yml: expected alerts {sorted(EXPECTED_ALERTS)}, found {sorted(str(x) for x in loaded_alerts)}")
    for group in groups:
        if isinstance(group, dict):
            for rule in group.get("rules", []) or []:
                if isinstance(rule, dict):
                    audit.require(bool(rule.get("expr")), f"prometheus/alerts.yml: alert {rule.get('alert')} has no expression")
                    audit.require(bool(rule.get("for")), f"prometheus/alerts.yml: alert {rule.get('alert')} has no pending duration")

    datasources = datasource_config.get("datasources", []) or []
    datasource = next((item for item in datasources if isinstance(item, dict) and item.get("uid") == "prometheus"), None)
    audit.require(datasource is not None, "Grafana provisioning: datasource UID 'prometheus' is missing")
    if datasource:
        audit.require(datasource.get("type") == "prometheus", "Grafana provisioning: datasource type must be Prometheus")
        audit.require(datasource.get("url") == "http://prometheus:9090", "Grafana provisioning: datasource URL should target the Compose Prometheus service")
    providers = dashboard_provider.get("providers", []) or []
    audit.require(any(isinstance(provider, dict) and provider.get("options", {}).get("path") == "/etc/grafana/dashboards"
                      for provider in providers),
                  "Grafana provisioning: dashboard provider path is missing or mismatched")

    panels = dashboard.get("panels", []) or []
    panel_ids = [panel.get("id") for panel in panels if isinstance(panel, dict)]
    audit.require(dashboard.get("uid") == "shohan-observability-lab", "Grafana dashboard UID does not match integration test")
    audit.require(len(panels) >= 6, f"Grafana dashboard should include at least 6 panels, found {len(panels)}")
    audit.require(len(panel_ids) == len(set(panel_ids)), "Grafana dashboard panel IDs must be unique")
    data_panels = [panel for panel in panels if isinstance(panel, dict) and panel.get("type") != "row"]
    audit.require(len(data_panels) == len([panel for panel in panels if not isinstance(panel, dict) or panel.get("type") != "row"]),
                  "Grafana dashboard contains a malformed panel entry")
    audit.require(all(isinstance(panel.get("datasource"), dict) and panel["datasource"].get("uid") == "prometheus"
                      for panel in data_panels),
                  "Grafana panels must use the provisioned Prometheus datasource")

    dockerfile = LAB / "api" / "Dockerfile"
    try:
        dockerfile_text = dockerfile.read_text(encoding="utf-8")
        audit.checked.append("api/Dockerfile")
    except OSError as exc:
        dockerfile_text = ""
        audit.errors.append(f"api/Dockerfile: unable to read file ({exc})")
    audit.require("USER 10001:10001" in dockerfile_text,
                  "api/Dockerfile: API should run as the dedicated non-root UID/GID 10001")
    audit.require("FROM python:3.12-slim-bookworm" in dockerfile_text,
                  "api/Dockerfile: expected the documented Python 3.12 slim base image")

    if audit.errors:
        print(f"Infrastructure configuration checks failed ({len(audit.errors)} issue(s)):", file=sys.stderr)
        for issue in audit.errors:
            print(f"  - {issue}", file=sys.stderr)
        return 1

    print(f"Infrastructure configuration checks passed: {len(audit.checked)} files parsed; "
          f"{len(services)} Compose services, {len(loaded_alerts)} Prometheus alerts, "
          f"{len(panels)} Grafana panels; local-only published ports and baseline container hardening verified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
