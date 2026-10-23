#!/usr/bin/env python3
"""Build a minimal, deployment-ready GitHub Pages artifact using the stdlib."""
from __future__ import annotations

import os
import shutil
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "dist"
DEFAULT_SITE_ROOT = "https://md-sh0han.github.io/Portfolio"

# Publish only files required at runtime. Repository tooling, CI files, tests,
# and local infrastructure configuration remain in GitHub but out of the site artifact.
FILES = (
    "index.html",
    "styles.css",
    "script.js",
    "Profile Photo.webp",
    "Orbit Photo.webp",
    "robots.txt",
    "sitemap.xml",
    ".nojekyll",
    "assets/favicon.svg",
    "assets/portrait-placeholder.svg",
    "projects/observability-lab/index.html",
)


def main() -> int:
    configured_root = (os.environ.get("PORTFOLIO_SITE_URL", "").strip() or DEFAULT_SITE_ROOT).rstrip("/")
    parsed_root = urlsplit(configured_root)
    if parsed_root.scheme != "https" or not parsed_root.netloc or parsed_root.query or parsed_root.fragment:
        print(
            "ERROR: PORTFOLIO_SITE_URL must be an HTTPS site root without query or fragment, "
            "for example https://md-sh0han.github.io/Portfolio/.",
            file=sys.stderr,
        )
        return 1

    missing = [name for name in FILES if not (ROOT / name).is_file()]
    if missing:
        print("ERROR: cannot build Pages artifact; missing required file(s):", file=sys.stderr)
        for name in missing:
            print(f"  - {name}", file=sys.stderr)
        return 1

    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir(parents=True)

    for name in FILES:
        source = ROOT / name
        destination = OUTPUT / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)

    # Keep canonicals, social previews, crawler hints, and footer portfolio links
    # aligned with the actual Pages URL, including a custom domain configured later.
    if configured_root != DEFAULT_SITE_ROOT:
        for relative in ("index.html", "script.js", "robots.txt", "sitemap.xml", "projects/observability-lab/index.html"):
            destination = OUTPUT / relative
            content = destination.read_text(encoding="utf-8")
            destination.write_text(content.replace(DEFAULT_SITE_ROOT, configured_root), encoding="utf-8")

    print(f"GitHub Pages artifact built at {OUTPUT.relative_to(ROOT)}/")
    print(f"Published site root: {configured_root}/")
    print(f"Copied {len(FILES)} runtime files; CI, test, and local service files were excluded.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
