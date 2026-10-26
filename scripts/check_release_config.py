#!/usr/bin/env python3
"""Validate GitHub Pages release workflow settings that static HTML checks cannot see."""
from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "portfolio-quality.yml"
REQUIRED_GATES = {"static-and-unit", "browser-e2e", "observability-integration"}
EXPECTED_SITE_ROOT = "https://md-sh0han.github.io/PORTFOLIO"
FORMER_CASE_VARIANT = "https://md-sh0han.github.io/Portfolio"
EXPECTED_REPOSITORY_ROOT = "https://github.com/MD-SH0HAN/PORTFOLIO"


def fail(message: str) -> int:
    print(f"Release configuration check failed: {message}", file=sys.stderr)
    return 1


def main() -> int:
    # A second Pages deployment workflow can bypass this workflow's quality gates.
    workflow_dir = ROOT / ".github" / "workflows"
    for candidate in workflow_dir.glob("*"):
        if not candidate.is_file() or candidate == WORKFLOW or candidate.suffix.lower() not in {".yml", ".yaml"}:
            continue
        try:
            other_text = candidate.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            return fail(f"unable to inspect extra workflow {candidate.name}: {exc}")
        deploy_markers = ("actions/deploy-pages", "actions/upload-pages-artifact", "deploy-pages:")
        if any(marker in other_text for marker in deploy_markers):
            return fail(f"additional Pages deployment workflow {candidate.name!r} may bypass portfolio-quality.yml; remove it or route deployment through the gated workflow")

    try:
        config = yaml.safe_load(WORKFLOW.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, yaml.YAMLError) as exc:
        return fail(f"unable to parse {WORKFLOW.relative_to(ROOT)}: {exc}")

    if not isinstance(config, dict):
        return fail("GitHub Actions workflow must be a mapping")

    # Prevent repository-name changes from silently breaking source links,
    # canonical metadata, crawler hints, or social previews.
    build_script = ROOT / "scripts" / "build_pages.py"
    source_files = {
        "scripts/build_pages.py": build_script,
        "index.html": ROOT / "index.html",
        "script.js": ROOT / "script.js",
        "projects/observability-lab/index.html": ROOT / "projects" / "observability-lab" / "index.html",
        "robots.txt": ROOT / "robots.txt",
        "sitemap.xml": ROOT / "sitemap.xml",
        "README.md": ROOT / "README.md",
    }
    try:
        source_text = {name: path.read_text(encoding="utf-8") for name, path in source_files.items()}
    except (OSError, UnicodeError) as exc:
        return fail(f"unable to read repository URL configuration: {exc}")

    match = re.search(r'^DEFAULT_SITE_ROOT\s*=\s*["\']([^"\']+)["\']', source_text["scripts/build_pages.py"], re.MULTILINE)
    if not match or match.group(1).rstrip("/") != EXPECTED_SITE_ROOT:
        actual = match.group(1) if match else "<missing>"
        return fail(f"build default site root must be {EXPECTED_SITE_ROOT!r}; found {actual!r}")

    for name in ("index.html", "script.js", "projects/observability-lab/index.html", "robots.txt", "sitemap.xml", "README.md"):
        if EXPECTED_SITE_ROOT not in source_text[name]:
            return fail(f"{name} must reference the configured GitHub Pages root {EXPECTED_SITE_ROOT}")
        if FORMER_CASE_VARIANT in source_text[name]:
            return fail(f"{name} contains a mixed-case Pages path; use {EXPECTED_SITE_ROOT} consistently")
        if "shohan-portfolio" in source_text[name].lower():
            return fail(f"{name} still contains an obsolete shohan-portfolio URL")

    # Verify the actual metadata and generated profile destination, rather than
    # accepting an unrelated comment as proof that the expected root is present.
    root_html = source_text["index.html"]
    if f'<link rel="canonical" href="{EXPECTED_SITE_ROOT}/">' not in root_html:
        return fail("index.html canonical URL does not match the configured site root")
    if f'<meta property="og:url" content="{EXPECTED_SITE_ROOT}/">' not in root_html:
        return fail("index.html Open Graph URL does not match the configured site root")
    case_study = source_text["projects/observability-lab/index.html"]
    if f'<link rel="canonical" href="{EXPECTED_SITE_ROOT}/projects/observability-lab/">' not in case_study:
        return fail("observability case-study canonical URL does not match the configured site root")
    if f"href: '{EXPECTED_SITE_ROOT}/'" not in source_text["script.js"]:
        return fail("script.js portfolio profile destination does not match the configured site root")
    if f"Sitemap: {EXPECTED_SITE_ROOT}/sitemap.xml" not in source_text["robots.txt"]:
        return fail("robots.txt sitemap URL does not match the configured site root")

    for name in ("index.html", "script.js", "projects/observability-lab/index.html"):
        if EXPECTED_REPOSITORY_ROOT not in source_text[name]:
            return fail(f"{name} must link to the existing repository {EXPECTED_REPOSITORY_ROOT}")
        if "github.com/md-sh0han/shohan-portfolio" in source_text[name].lower():
            return fail(f"{name} still links to the obsolete shohan-portfolio repository")

    jobs = config.get("jobs")
    if not isinstance(jobs, dict):
        return fail("workflow is missing its jobs mapping")

    static_job = jobs.get("static-and-unit", {})
    static_steps = static_job.get("steps", []) if isinstance(static_job, dict) else []
    static_commands = {
        str(step.get("run", ""))
        for step in static_steps
        if isinstance(step, dict)
    }
    if "python scripts/check_release_config.py" not in static_commands:
        return fail("the static-and-unit job must run check_release_config.py")

    deploy = jobs.get("deploy-pages")
    if not isinstance(deploy, dict):
        return fail("workflow is missing deploy-pages job")
    needs = deploy.get("needs", [])
    if isinstance(needs, str):
        needs = [needs]
    if not REQUIRED_GATES.issubset(set(needs or [])):
        return fail(f"Pages deployment must wait for all quality jobs: {sorted(REQUIRED_GATES)}")

    permissions = deploy.get("permissions", {})
    if not isinstance(permissions, dict) or permissions.get("pages") != "write" or permissions.get("id-token") != "write":
        return fail("deploy-pages needs pages: write and id-token: write permissions")

    steps = deploy.get("steps", [])
    upload_step = next(
        (step for step in steps if isinstance(step, dict) and str(step.get("uses", "")).startswith("actions/upload-pages-artifact@")),
        None,
    )
    if upload_step is None:
        return fail("deploy-pages must upload its site with actions/upload-pages-artifact")
    upload_inputs = upload_step.get("with", {})
    if not isinstance(upload_inputs, dict) or str(upload_inputs.get("path", "")).strip() != "dist":
        return fail("the Pages artifact must be built from dist/")
    include_hidden = upload_inputs.get("include-hidden-files")
    if include_hidden is not True and str(include_hidden).strip().lower() != "true":
        return fail("upload-pages-artifact must set include-hidden-files: true so .nojekyll is preserved")
    if not (ROOT / ".nojekyll").is_file():
        return fail("repository root is missing .nojekyll")

    print("Release configuration checks passed: all three quality gates protect Pages deployment; ")
    print("artifact path is dist/, hidden files are retained, and .nojekyll is present.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
