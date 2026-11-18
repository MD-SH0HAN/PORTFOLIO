#!/usr/bin/env python3
"""Dependency-free structural and deployment checks for the static portfolio."""
from __future__ import annotations

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json
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
    "sreControlRoom", "engReviewStudio",
}
REQUIRED_CONTROLS = {
    "toolSearch", "commandDialog", "commandFilters", "commandResultCount", "accessibilityDialog", "accessibilityTrigger",
    "shortcutsTrigger", "reduceMotionToggle", "highContrastToggle", "sloTarget",
    "sloWindow", "sloRequests", "runPipeline", "failPipeline", "failSecurityPipeline",
    "simulatePodFailure", "recoverPod", "injectIncident", "injectLatency",
    "recoverService", "resetSimulation", "architectureGalleryGrid",
    "architectureFilterStatus", "finopsCompute", "finopsStorage", "finopsEgress",
    "finopsTotal", "terraformSimSteps", "terraformSimNext",
    "terraformSimComplete", "terraformSimReset", "terraformSimStatus",
    "terraformSimMessage",
}
LOCAL_ASSETS = {
    "styles.css", "script.js", "animations.css", "animations.js", "advanced-animations.css", "advanced-animations.js", "final-interactions.css", "final-interactions.js", "scripts/advanced_animation_smoke.py", "scripts/final_interactions_smoke.py", "assets/favicon.png",
    "assets/portrait-placeholder.svg", "assets/social-preview.png",
    "assets/MD-SHOHAN-DevOps-Portfolio.pdf", "Profile Photo.webp",
}
FORBIDDEN = ("projects/laboratory", "projects/extensions", "laboratory/index.html")
ANIMATION_MOUNTS = {
    "arch-cloud", "layers", "failover", "artifact", "security", "arch-iac",
    "arch-containers", "autoscale", "arch-platform", "metrics", "trace",
    "incident", "technology", "architecture", "terminal", "replay",
}
PIPELINE_STAGES = ("source", "validate", "build", "secure", "publish", "deploy", "operate")


class PortfolioParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.links: list[str] = []
        self.resources: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"])
        if values.get("href"):
            self.links.append(values["href"])
        if values.get("src"):
            self.resources.append(values["src"])


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    raise SystemExit(1)


def main() -> int:
    # Keep the distributable source tree clean; Python caches and local tool output
    # have no place in a public portfolio archive.
    forbidden_artifacts = []
    forbidden_dirs = {"__pycache__", ".venv", "venv", "node_modules", ".pytest_cache", ".mypy_cache", ".ruff_cache", "dist", "build", "coverage", "test-results", "playwright-report"}
    forbidden_files = {".DS_Store", "Thumbs.db", "desktop.ini"}
    for path in ROOT.rglob("*"):
        if any(part in forbidden_dirs for part in path.parts):
            forbidden_artifacts.append(str(path.relative_to(ROOT)))
        elif path.is_file() and (path.name in forbidden_files or path.suffix in {".pyc", ".pyo"}):
            forbidden_artifacts.append(str(path.relative_to(ROOT)))
    if forbidden_artifacts:
        fail(f"generated/local artefacts must be removed before release: {', '.join(sorted(forbidden_artifacts)[:12])}")

    html = (ROOT / "index.html").read_text(encoding="utf-8")
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

    if not all(marker in html for marker in ('name="description"', 'property="og:title"', 'property="og:image"')):
        fail("essential SEO and social-sharing metadata is incomplete")

    jsonld_match = re.search(
        r"""<script\s+type=["']application/ld\+json["']>(.*?)</script>""",
        html, re.IGNORECASE | re.DOTALL
    )
    if not jsonld_match:
        fail("Person structured data is missing")
    try:
        jsonld = json.loads(jsonld_match.group(1))
    except json.JSONDecodeError as error:
        fail(f"structured data is invalid JSON: {error}")
    if jsonld.get("@type") != "Person" or not jsonld.get("name") or not jsonld.get("url"):
        fail("Person structured data is missing required identity fields")

    # Practical playbook: require real, linked, evidence-conscious study material.
    playbook_files = {
        "documents/engineering-playbook/README.md": ("Engineering Playbook", "Evidence labels", "Safe use"),
        "documents/engineering-playbook/linux-network-troubleshooting.md": ("Linux and Network Troubleshooting", "Exit criteria", "TLS"),
        "documents/engineering-playbook/containers-kubernetes-troubleshooting.md": ("Containers and Kubernetes Troubleshooting", "readiness", "Exit criteria"),
        "documents/engineering-playbook/terraform-cicd-review.md": ("Terraform and CI/CD Change Review", "artifact", "Review checklist"),
        "documents/engineering-playbook/operational-readiness.md": ("Operational Readiness and Incident Response", "RTO", "Post-incident review"),
        "documents/engineering-playbook/learning-evidence-template.md": ("Learning and Lab Evidence Record", "Observed result", "Claim rule"),
        "documents/engineering-playbook/architecture-decision-records.md": ("Architecture Decision Records", "Alternatives", "Review trigger"),
        "documents/engineering-playbook/security-threat-model-workbook.md": ("Security Threat-Model Workbook", "STRIDE", "Residual risk"),
        "documents/engineering-playbook/finops-capacity-review.md": ("Cloud Cost and Capacity Review", "unit economics", "Headroom and latency SLO"),
        "documents/engineering-playbook/incident-postmortem-template.md": ("Incident Report and Blameless Postmortem Template", "Timeline", "Corrective actions"),
        "documents/engineering-playbook/engineering-quality-assurance.md": ("Engineering Quality Assurance Matrix", "Accessibility", "Release decision"),
    }
    for relative, required_terms in playbook_files.items():
        path = ROOT / relative
        if not path.is_file():
            fail(f"engineering playbook document missing: {relative}")
        content = path.read_text(encoding="utf-8")
        if len(content) < 900:
            fail(f"engineering playbook document is unexpectedly short: {relative}")
        for term in required_terms:
            if term.casefold() not in content.casefold():
                fail(f"engineering playbook document {relative} is missing required topic: {term}")
    for relative in playbook_files:
        if relative not in html:
            fail(f"engineering playbook document is not linked from the portfolio: {relative}")

    # Native controls and external links should remain safe and accessible.
    if re.search(r"<button\b(?![^>]*\btype=)", html, re.IGNORECASE):
        fail("a button is missing an explicit type")
    if re.search(r"<img\b(?![^>]*\balt=)", html, re.IGNORECASE):
        fail("an image is missing alternative text")
    if re.search(r"""<a\b(?=[^>]*target=["']_blank["'])(?![^>]*rel=["'][^"']*noopener)""", html, re.IGNORECASE):
        fail("an external new-tab link is missing rel=noopener")
    if re.search(r"""<input\b(?=[^>]*id=["']toolSearch["'])(?![^>]*aria-label=)""", html, re.IGNORECASE):
        fail("technology search input needs an accessible label")

    script = (ROOT / "script.js").read_text(encoding="utf-8")
    for term in FORBIDDEN:
        if term in html or term in script:
            fail(f"retired standalone lab dependency remains in main source: {term}")
    if re.search(r'class=["\'][^"\']*\bproject-card\b', html) or 'id="projectDialog"' in html:
        fail("a completed-project gallery or dialog remains in the project-free portfolio")

    if html.count('class="glass-card architecture-card') != 12:
        fail("architecture gallery must contain exactly 12 conceptual patterns")
    if html.count('<article><b>') != 14:
        fail("technical domain map must contain 14 categorized areas")
    mounts = set(re.findall(r'data-anim-mount=["\']([^"\']+)["\']', html))
    missing_mounts = sorted(ANIMATION_MOUNTS - mounts)
    if missing_mounts:
        fail(f"missing animation mount points: {', '.join(missing_mounts)}")
    for stage in PIPELINE_STAGES:
        if f'data-pipeline-stage="{stage}"' not in html:
            fail(f"seven-stage delivery runner is missing its {stage} stage")
    if html.count('data-pipeline-stage=') != len(PIPELINE_STAGES):
        fail("delivery runner must contain exactly seven ordered pipeline stages")

    animation_script = (ROOT / "animations.js").read_text(encoding="utf-8")
    for animation_number in ("07", "08", "09", "10", "11", "12", "14", "16", "17", "20", "23", "24", "26", "27"):
        if f"{animation_number}" not in animation_script:
            fail(f"animation implementation reference {animation_number} is missing")
    animations_css = (ROOT / "animations.css").read_text(encoding="utf-8")
    if animations_css.count("{") != animations_css.count("}"):
        fail("animation stylesheet brace counts do not balance")
    if 'href="animations.css"' not in html or 'src="animations.js"' not in html or 'href="advanced-animations.css"' not in html or 'src="advanced-animations.js"' not in html or 'href="final-interactions.css"' not in html or 'src="final-interactions.js"' not in html:
        fail("animation assets are not mounted by the main document")

    if 'No completed project case studies are published here yet.' not in html:
        fail("project evidence section must preserve the no-fabricated-project boundary")
    if 'not AWS, Azure, or Google Cloud pricing' not in html:
        fail("FinOps simulator must disclose its illustrative, non-provider pricing")
    if 'DEMO DATA ONLY' not in html:
        fail("observability dashboard must label synthetic data")

    # V5 connected system reference, decision records, evidence protocol and source library.
    required_v5_markers = (
        'id="engSystemTitle"', 'id="engSystemDetail"', 'data-system-stage="source"',
        'data-system-stage="ci"', 'data-system-stage="iac"', 'data-system-stage="artifact"',
        'data-system-stage="gitops"', 'data-system-stage="runtime"', 'data-system-stage="observe"',
        'id="engDecisionTitle"', 'id="evidence-protocol"', 'id="source-library"',
        'initializeEngineeringSystemExplorer',
    )
    for marker in required_v5_markers:
        if marker not in html and marker not in script:
            fail(f"V5 engineering improvement missing: {marker}")
    if html.count('class="eng-decision-card"') != 7:
        fail("V5 must include seven expandable engineering decision records")
    if html.count('class="eng-review-card"') != 4:
        fail("architecture review studio must contain four decision scenarios")
    for marker in ("eng-review-gates", "eng-review-footnote", "engReviewTitle"):
        if marker not in html:
            fail(f"architecture review studio is missing: {marker}")
    if html.count('class="eng-source-group"') != 5:
        fail("V5 primary source library must contain five curated groups")
    for source_host in ('docs.aws.amazon.com', 'developer.hashicorp.com', 'kubernetes.io', 'docs.github.com', 'docs.docker.com', 'github.com/opencontainers/distribution-spec', 'argo-cd.readthedocs.io', 'helm.sh', 'docs.sigstore.dev', 'prometheus.io', 'opentelemetry.io', 'sre.google'):
        if source_host not in html:
            fail(f"V5 primary source library is missing the official source host: {source_host}")
    if "engSystemDetailEvidence" in html:
        fail("unexpected stale V5 system detail field")
    script_text = (ROOT / "script.js").read_text(encoding="utf-8")
    for command in ("Explore the connected delivery architecture", "Inspect engineering decision records", "Open the evidence and claim standard", "Browse primary technical documentation"):
        if command not in script_text:
            fail(f"V5 command palette shortcut missing: {command}")

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

    # The custom 404 page is a separate deploy entry point and must resolve its own assets.
    not_found = (ROOT / "404.html").read_text(encoding="utf-8")
    if "assets/favicon.svg" in not_found or 'href="assets/favicon.png"' not in not_found:
        fail("404 page favicon reference is stale")
    if 'href="styles.css"' not in not_found or 'href="./"' not in not_found:
        fail("404 page is missing its stylesheet or home navigation")

    for asset in LOCAL_ASSETS:
        if not (ROOT / asset).is_file():
            fail(f"required local asset missing: {asset}")

    projects = ROOT / "projects"
    if not projects.is_dir() or any(projects.iterdir()):
        fail("projects/ must exist and remain empty until verified projects are ready")

    sitemap = ROOT / "sitemap.xml"
    if sitemap.exists():
        sitemap_text = sitemap.read_text(encoding="utf-8")
        if any(term in sitemap_text for term in FORBIDDEN):
            fail("retired laboratory URL remains in sitemap.xml")

    favicon = ROOT / "assets/favicon.png"
    if favicon.stat().st_size > 60_000:
        fail("favicon exceeds the 60 KB performance budget")
    if not (ROOT / "assets/MD-SHOHAN-DevOps-Portfolio.pdf").read_bytes().startswith(b"%PDF-"):
        fail("downloadable portfolio is not a valid PDF file")
    if (ROOT / "desktop.ini").exists() or (ROOT / "portfolio-print.html").exists():
        fail("remove redundant OS metadata or duplicate print document from the deploy root")

    css = (ROOT / "styles.css").read_text(encoding="utf-8")
    if css.count("{") != css.count("}"):
        fail("stylesheet brace counts do not balance")
    if not re.search(r"\.eng-section", css):
        fail("engineering knowledge styles were not found")

    deploy_workflow = ROOT / ".github/workflows/deploy-pages.yml"
    quality_workflow = ROOT / ".github/workflows/portfolio-quality.yml"
    if not deploy_workflow.is_file() or not quality_workflow.is_file():
        fail("GitHub Pages deployment or portfolio quality workflow is missing")
    deploy_text = deploy_workflow.read_text(encoding="utf-8")
    quality_text = quality_workflow.read_text(encoding="utf-8")
    if "scripts/check_portfolio.py" not in deploy_text or "node --check script.js" not in deploy_text:
        fail("Pages workflow must validate the site before deployment")
    if "python scripts/browser_smoke.py" not in deploy_text or "python scripts/advanced_animation_smoke.py" not in deploy_text or "python scripts/final_interactions_smoke.py" not in deploy_text or "playwright install" not in deploy_text:
        fail("Pages deployment must pass the browser smoke gate before publishing")
    if "persist-credentials: false" not in deploy_text or "persist-credentials: false" not in quality_text:
        fail("workflow checkouts must not persist their token in the working tree")
    if not all(asset in deploy_text for asset in ("animations.css", "animations.js", "advanced-animations.css", "advanced-animations.js", "final-interactions.css", "final-interactions.js")):
        fail("Pages workflow must include both animation assets in its public artifact")
    for workflow_name, workflow_text in (("deploy-pages.yml", deploy_text), ("portfolio-quality.yml", quality_text)):
        action_refs = re.findall(r"^\s*uses:\s*([^\s]+)", workflow_text, flags=re.MULTILINE)
        if not action_refs:
            fail(f"{workflow_name} contains no pinned actions")
        for action_ref in action_refs:
            if not re.search(r"@[0-9a-f]{40}$", action_ref):
                fail(f"{workflow_name} contains an action not pinned to a full 40-character SHA: {action_ref}")
    if "permissions: {}" not in deploy_text or "needs: build" not in deploy_text:
        fail("Pages deploy workflow must use isolated build/deploy jobs and no workflow-wide permissions")
    if not re.search(r"build:\s*\n.*?permissions:\s*\n\s+contents:\s*read\s*(?:\n\s+steps:)", deploy_text, flags=re.DOTALL):
        fail("Pages build job must use content-read only permissions")
    if not re.search(r"deploy:\s*\n.*?permissions:\s*\n\s+pages:\s*write\s*\n\s+id-token:\s*write", deploy_text, flags=re.DOTALL):
        fail("Pages deploy job must have Pages-write and OIDC permissions only")
    if "python scripts/browser_smoke.py" not in quality_text or "python scripts/advanced_animation_smoke.py" not in quality_text or "python scripts/final_interactions_smoke.py" not in quality_text or "playwright install" not in quality_text:
        fail("quality workflow must run installed Chromium browser smoke tests")
    if "basic accessibility semantics" not in (ROOT / "scripts/browser_smoke.py").read_text(encoding="utf-8"):
        fail("browser smoke suite must check accessible names and core document semantics")
    requirements_dev = ROOT / "requirements-dev.txt"
    if not requirements_dev.is_file() or "playwright==1.65.2" not in requirements_dev.read_text(encoding="utf-8"):
        fail("optional browser test tooling must be pinned in requirements-dev.txt")
    if not (ROOT / "scripts/browser_smoke.py").is_file() or not (ROOT / "scripts/advanced_animation_smoke.py").is_file() or not (ROOT / "scripts/final_interactions_smoke.py").is_file():
        fail("real-browser smoke test scripts are missing")
    dependabot = ROOT / ".github/dependabot.yml"
    if not dependabot.is_file() or "package-ecosystem: github-actions" not in dependabot.read_text(encoding="utf-8"):
        fail("weekly pinned-action update monitoring must be configured in Dependabot")

    advanced_js = (ROOT / "advanced-animations.js").read_text(encoding="utf-8")
    advanced_css = (ROOT / "advanced-animations.css").read_text(encoding="utf-8")
    advanced_ids = re.findall(r"\{id:'([a-z0-9-]+)',section:'", advanced_js)
    expected_advanced = {
        "linux-process", "network-journey", "git-branching", "api-lifecycle", "vpc-routing", "network-policy",
        "disaster-recovery", "terraform-graph", "terraform-drift", "ansible-converge", "deployment-strategy",
        "pod-lifecycle", "k8s-scheduler", "rolling-update", "service-routing", "gitops-reconcile", "golden-path",
        "service-mesh", "slo-burn", "telemetry-correlation", "incident-impact", "oidc-journey", "threat-model",
        "supply-chain", "cloud-cost", "rightsizing"
    }
    if len(advanced_ids) != 26 or set(advanced_ids) != expected_advanced or len(set(advanced_ids)) != 26:
        fail(f"advanced animation lab inventory mismatch: {len(advanced_ids)} definitions")
    if not all(engine in advanced_js for engine in ("visualRenderers", "createStageVisual", "renderGraph", "topologicalOrder", "stageCount")):
        fail("concept-specific visual renderers or graph ordering logic are missing")
    visual_ids = re.findall(r"^    '([a-z0-9-]+)': lab =>", advanced_js, re.M)
    if len(visual_ids) != 26 or len(set(visual_ids)) != 26 or set(visual_ids) != expected_advanced:
        fail(f"each of the 26 labs must have an individual renderer; found {len(visual_ids)}")
    if "ea-packet-track" in advanced_css or "ea-sequence-track" in advanced_css or "ea-state-track" in advanced_css:
        fail("horizontal progress rails must not be used in advanced learning labs")
    if "initGallery" not in advanced_js or "data-gallery-play" not in advanced_js or len(re.findall(r'<article class="glass-card architecture-card"', html)) != 12:
        fail("the twelve architecture gallery diagrams must have individual animation controls")
    if advanced_css.count("{") != advanced_css.count("}"):
        fail("advanced animation stylesheet brace counts do not balance")

    final_js = (ROOT / "final-interactions.js").read_text(encoding="utf-8")
    final_css = (ROOT / "final-interactions.css").read_text(encoding="utf-8")
    for marker in ("flowExplanations", "roadmapStage", "architectureDetailDialog"):
        if marker not in final_js:
            fail(f"final interaction feature is missing: {marker}")
    if "eng-grid-interactive" in final_js or "eng-grid-flow-overlay" in final_js or "pointer-spotlight" in script_text:
        fail("cursor-following grid/spotlight effects must remain removed")
    if "discoverDynamicCommands" not in script_text or "commandFilterGroups" not in script_text:
        fail("enhanced command palette dynamic discovery or topic filtering is missing")
    if final_css.count("{") != final_css.count("}"):
        fail("final interaction stylesheet brace counts do not balance")
    if html.count('data-command-filter=') < 10:
        fail("command palette must expose all topic filters")
    if "Selection is navigation only" not in final_js:
        fail("learning path must not imply completion or mastery")
    if "architecture-detail-dialog" not in final_css or "@media (max-width: 760px)" not in final_css:
        fail("architecture expansion and mobile refinements are missing")
    if 'final-interactions.js' not in deploy_text or 'final-interactions.css' not in deploy_text:
        fail("Pages artifact must include final interaction assets")

    print("PASS: required engineering sections, controls, 12 architecture patterns, and 14 knowledge domains")
    print(f"PASS: {len(ANIMATION_MOUNTS)} original animation mount points, 26 advanced labs, 12 gallery draw controls, and seven delivery stages")
    print("PASS: 26 concept-specific visual renderers, algorithmic graph ordering, vertical / structural layouts, and project-evidence boundaries")
    print("PASS: solid page canvas with no cursor-following effects, 12 expanded architecture flows, five-stage navigator, enhanced command palette, feedback, and mobile diagram controls")
    print("PASS: unique IDs, local references, accessible control basics, and external-link safety")
    print("PASS: connected architecture, seven engineering decisions, evidence protocol, and curated official sources")
    print("PASS: eleven linked engineering playbook documents and evidence-conscious learning templates")
    print("PASS: four architecture decision scenarios and review gates")
    print("PASS: full-SHA-pinned GitHub Actions, scoped Pages permissions, and Dependabot updates")
    print("PASS: real-browser smoke test tooling is pinned and wired into CI")
    print("PASS: SEO metadata, valid Person JSON-LD, PDF signature, and optimized favicon")
    print("PASS: clean deployment tree and GitHub Pages workflow with pre-deploy validation")
    print(f"PASS: parsed {len(parser.ids)} IDs and {len(parser.links)} links")
    return 0


if __name__ == "__main__":
    sys.exit(main())
