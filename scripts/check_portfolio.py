#!/usr/bin/env python3
"""Dependency-free structural checks for the integrated static portfolio."""
from __future__ import annotations

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_IDS = {
    "about", "focus", "cloud-infrastructure", "delivery-model", "iac",
    "advanced", "containers", "platform-engineering", "reliability",
    "observability-dashboard", "security-devsecops", "supporting", "finops",
    "work", "stack", "architecture-gallery", "workbench", "projects",
    "journey", "contact", "pipelinePlayground", "podHealthPlayground",
    "sreControlRoom",
}
REQUIRED_CONTROLS = {"toolSearch", "commandDialog", "accessibilityDialog", "accessibilityTrigger", "shortcutsTrigger",
                     "reduceMotionToggle", "highContrastToggle", "sloTarget", "sloWindow", "sloRequests",
                     "runPipeline", "failPipeline", "simulatePodFailure", "recoverPod",
                     "injectIncident", "injectLatency", "recoverService", "resetSimulation",
                     "architectureGalleryGrid", "architectureFilterStatus", "finopsCompute",
                     "finopsStorage", "finopsEgress", "finopsTotal", "terraformSimSteps",
                     "terraformSimNext", "terraformSimComplete", "terraformSimReset",
                     "terraformSimStatus", "terraformSimMessage"}
LOCAL_ASSETS = {"styles.css", "script.js", "assets/favicon.svg", "assets/portrait-placeholder.svg",
                "assets/social-preview.png", "assets/MD-SHOHAN-DevOps-Portfolio.pdf", "Profile Photo.webp"}
FORBIDDEN = ("projects/laboratory", "projects/extensions", "laboratory/index.html")


class PortfolioParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.links: list[str] = []
        self.resources: list[str] = []
        self.sections: list[tuple[str, str]] = []
        self._section_id: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        element_id = values.get("id")
        if element_id:
            self.ids.append(element_id)
            if tag == "section":
                self.sections.append((element_id, values.get("aria-labelledby") or ""))
        href = values.get("href")
        if href:
            self.links.append(href)
        src = values.get("src")
        if src:
            self.resources.append(src)


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    raise SystemExit(1)


def main() -> int:
    html_path = ROOT / "index.html"
    html = html_path.read_text(encoding="utf-8")
    parser = PortfolioParser()
    parser.feed(html)
    parser.close()

    duplicates = sorted(key for key, count in Counter(parser.ids).items() if count > 1)
    if duplicates:
        fail(f"duplicate HTML ids: {', '.join(duplicates)}")

    missing = sorted(REQUIRED_IDS - set(parser.ids))
    if missing:
        fail(f"missing required sections/anchors: {', '.join(missing)}")

    missing_controls = sorted(REQUIRED_CONTROLS - set(parser.ids))
    if missing_controls:
        fail(f"missing required interactive controls: {', '.join(missing_controls)}")

    # The former laboratory link is rewritten to an in-page reference section at runtime;
    # source HTML must never point to the retired standalone application.
    for term in FORBIDDEN:
        if term in html or term in (ROOT / "script.js").read_text(encoding="utf-8"):
            fail(f"retired standalone lab dependency remains in main source: {term}")
    if re.search(r'class=["\'][^"\']*\bproject-card\b', html) or 'id="projectDialog"' in html:
        fail("a completed-project gallery or dialog remains in the project-free portfolio")

    # The expanded portfolio keeps the learning/evidence boundary explicit while
    # requiring the full 12-pattern gallery and 14 categorized knowledge domains.
    if html.count('class="glass-card architecture-card') != 12:
        fail("architecture gallery must contain exactly 12 conceptual patterns")
    if html.count('<article><b>') != 14:
        fail("technical domain map must contain 14 categorized areas")
    if 'No completed project case studies are published here yet.' not in html:
        fail("project evidence section must preserve the no-fabricated-project boundary")
    if 'not AWS, Azure, or Google Cloud pricing' not in html:
        fail("FinOps simulator must disclose its illustrative, non-provider pricing")
    if 'DEMO DATA ONLY' not in html:
        fail("observability dashboard must label synthetic data")

    existing_ids = set(parser.ids)
    for href in parser.links:
        if href.startswith("#") and len(href) > 1 and href[1:] not in existing_ids:
            fail(f"broken fragment link: {href}")
        if href.startswith(("https://", "http://", "mailto:", "tel:", "data:", "javascript:")):
            continue
        if href.startswith("#") or href.startswith("//"):
            continue
        local = unquote(href.split("#", 1)[0].split("?", 1)[0])
        if local and not (ROOT / local).exists():
            fail(f"missing local link target: {href}")

    for src in parser.resources:
        if src.startswith(("https://", "http://", "data:")):
            continue
        local = unquote(src.split("?", 1)[0])
        if local and not (ROOT / local).exists():
            fail(f"missing local resource: {src}")

    for asset in LOCAL_ASSETS:
        if not (ROOT / asset).is_file():
            fail(f"required local asset missing: {asset}")

    projects = ROOT / "projects"
    if not projects.is_dir():
        fail("projects/ directory is missing")
    if any(projects.iterdir()):
        fail("projects/ must remain empty")

    sitemap = ROOT / "sitemap.xml"
    if sitemap.exists():
        sitemap_text = sitemap.read_text(encoding="utf-8")
        if any(term in sitemap_text for term in FORBIDDEN):
            fail("retired laboratory URL remains in sitemap.xml")

    css = (ROOT / "styles.css").read_text(encoding="utf-8")
    if css.count("{") != css.count("}"):
        fail("stylesheet brace counts do not balance")
    if not re.search(r"\.eng-section", css):
        fail("engineering knowledge styles were not found")

    print("PASS: cloud, IaC, containers, platform, observability, security, FinOps, and portfolio evidence sections are present")
    print("PASS: 12 conceptual architecture diagrams and 14 technical learning domains are present")
    print("PASS: simulations and illustrative data/pricing are explicitly labeled")
    print("PASS: no duplicate IDs or broken local fragment references")
    print("PASS: local stylesheet, script, images, PDF, and links resolve")
    print("PASS: retired laboratory paths are absent; no project gallery/dialog remains")
    print("PASS: projects/ exists and is empty")
    print(f"PASS: parsed {len(parser.ids)} IDs and {len(parser.links)} links")
    return 0


if __name__ == "__main__":
    sys.exit(main())
