#!/usr/bin/env python3
"""Dependency-free static checks for the portfolio's local HTML and assets."""
from __future__ import annotations

import argparse
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

DEFAULT_ROOT = Path(__file__).resolve().parents[1]
IGNORED_SCHEMES = {"http", "https", "mailto", "tel", "data", "javascript", "blob"}


def html_files_for(root: Path) -> list[Path]:
    """Return site pages while avoiding a generated dist/ tree in source mode."""
    files = (path for path in root.rglob("*.html") if path.is_file())
    if root == DEFAULT_ROOT.resolve():
        return sorted(path for path in files if "dist" not in path.relative_to(root).parts)
    return sorted(files)


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.references: list[tuple[str, str]] = []
        self.images_without_alt: int = 0
        self.h1_count: int = 0
        self.title_count: int = 0
        self.meta_description = False
        self.canonical_url = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        element_id = values.get("id")
        if element_id:
            self.ids.append(element_id)
        if tag == "h1":
            self.h1_count += 1
        if tag == "title":
            self.title_count += 1
        if tag == "meta" and values.get("name", "").lower() == "description" and values.get("content", "").strip():
            self.meta_description = True
        if tag == "link" and "canonical" in values.get("rel", "").lower().split() and values.get("href"):
            self.canonical_url = values["href"].strip()
        if tag == "img" and "alt" not in values:
            self.images_without_alt += 1

        for attribute in ("href", "src", "poster", "data-placeholder-src", "data-local-fallback-src"):
            value = values.get(attribute)
            if value:
                self.references.append((attribute, value.strip()))
        if values.get("srcset"):
            for candidate in values["srcset"].split(","):
                pieces = candidate.strip().split()
                if pieces:
                    self.references.append(("srcset", pieces[0]))


def local_target(page: Path, value: str, root: Path) -> tuple[Path | None, str]:
    """Resolve a local URL to a file path and optional decoded fragment."""
    parsed = urlsplit(value)
    if parsed.scheme.lower() in IGNORED_SCHEMES or parsed.netloc or value.startswith("//"):
        return None, ""
    raw_path = unquote(parsed.path)
    if not raw_path:
        target = page
    elif raw_path.startswith("/"):
        # Treat root-relative site URLs as relative to the published site root.
        target = root / raw_path.lstrip("/")
    else:
        target = page.parent / raw_path
    target = target.resolve()
    try:
        target.relative_to(root.resolve())
    except ValueError:
        return target, parsed.fragment
    if target.is_dir():
        target = target / "index.html"
    return target, unquote(parsed.fragment)


def main() -> int:
    argument_parser = argparse.ArgumentParser(description=__doc__)
    argument_parser.add_argument(
        "--root", type=Path, default=DEFAULT_ROOT,
        help="site root to validate (defaults to the repository source root)",
    )
    args = argument_parser.parse_args()
    root = args.root.resolve()
    errors: list[str] = []
    pages: dict[Path, PageParser] = {}
    html_files = html_files_for(root)

    if not html_files:
        print("ERROR: no HTML files found", file=sys.stderr)
        return 1

    for html_file in html_files:
        parser = PageParser()
        try:
            parser.feed(html_file.read_text(encoding="utf-8"))
            parser.close()
        except (OSError, UnicodeError) as exc:
            errors.append(f"{html_file.relative_to(root)}: unable to read HTML ({exc})")
            continue
        pages[html_file.resolve()] = parser

        duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
        if duplicates:
            errors.append(f"{html_file.relative_to(root)}: duplicate id(s): {', '.join(duplicates)}")
        if parser.images_without_alt:
            errors.append(f"{html_file.relative_to(root)}: {parser.images_without_alt} image(s) missing an alt attribute")

    home = (root / "index.html").resolve()
    if home not in pages:
        errors.append("index.html: portfolio homepage is missing")
    else:
        parser = pages[home]
        if parser.h1_count != 1:
            errors.append(f"index.html: expected exactly one H1, found {parser.h1_count}")
        if not parser.title_count:
            errors.append("index.html: missing title element")
        if not parser.meta_description:
            errors.append("index.html: missing meta description")
        if not parser.canonical_url:
            errors.append("index.html: missing canonical URL")
        html_text = home.read_text(encoding="utf-8")
        if "<title>MD SHOHAN - Platform Engineer</title>" not in html_text:
            errors.append("index.html: title must be exactly 'MD SHOHAN - Platform Engineer'")
        if '<meta property="og:title" content="MD SHOHAN - Platform Engineer">' not in html_text:
            errors.append("index.html: Open Graph title must match the Platform Engineer identity")
        if '<meta name="twitter:title" content="MD SHOHAN - Platform Engineer">' not in html_text:
            errors.append("index.html: Twitter title must match the Platform Engineer identity")
        if "internal developer platforms" not in html_text.lower() or "golden paths" not in html_text.lower():
            errors.append("index.html: platform engineering description must cover IDPs and golden paths")

    for page_path, parser in pages.items():
        relative_page = page_path.relative_to(root)
        if parser.h1_count != 1:
            errors.append(f"{relative_page}: expected exactly one H1, found {parser.h1_count}")
        if not parser.title_count:
            errors.append(f"{relative_page}: missing title element")
        if not parser.canonical_url:
            errors.append(f"{relative_page}: missing canonical URL")

    sitemap_path = root / "sitemap.xml"
    sitemap_urls: set[str] = set()
    try:
        tree = ET.parse(sitemap_path)
        namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        sitemap_urls = {
            (item.text or "").strip()
            for item in tree.findall(".//sm:loc", namespace)
            if (item.text or "").strip()
        }
        if not sitemap_urls:
            errors.append("sitemap.xml: no <loc> URLs found")
    except (OSError, ET.ParseError) as exc:
        errors.append(f"sitemap.xml: missing or invalid XML ({exc})")
    canonical_urls = {parser.canonical_url for parser in pages.values() if parser.canonical_url}
    if sitemap_urls and sitemap_urls != canonical_urls:
        missing = sorted(canonical_urls - sitemap_urls)
        extra = sorted(sitemap_urls - canonical_urls)
        details = []
        if missing:
            details.append("canonical page(s) omitted: " + ", ".join(missing))
        if extra:
            details.append("URL(s) without canonical page: " + ", ".join(extra))
        errors.append("sitemap.xml: " + "; ".join(details))

    robots_path = root / "robots.txt"
    if not robots_path.is_file():
        errors.append("robots.txt: file is missing")
    elif not any(line.strip().lower().startswith("sitemap:") and "sitemap.xml" in line.lower() for line in robots_path.read_text(encoding="utf-8").splitlines()):
        errors.append("robots.txt: no sitemap.xml declaration found")

    checked_references = 0
    for page_path, parser in pages.items():
        relative_page = page_path.relative_to(root)
        for attribute, value in parser.references:
            target, fragment = local_target(page_path, value, root)
            if target is None:
                continue
            checked_references += 1
            try:
                target.relative_to(root.resolve())
            except ValueError:
                errors.append(f"{relative_page}: {attribute} escapes the published site root: {value}")
                continue
            if not target.exists():
                errors.append(f"{relative_page}: broken local {attribute}: {value}")
                continue
            if fragment and target.suffix.lower() == ".html" and target.resolve() in pages:
                if fragment not in pages[target.resolve()].ids:
                    errors.append(f"{relative_page}: missing fragment target in {value}")

    if errors:
        print(f"Portfolio static checks failed ({len(errors)} issue(s)):")
        for issue in errors:
            print(f"  - {issue}")
        return 1

    print(f"Portfolio static checks passed: {len(pages)} HTML page(s), {checked_references} local references, and {len(sitemap_urls)} sitemap URL(s); no duplicate IDs, broken assets, missing image alt attributes, or sitemap/canonical mismatches.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
