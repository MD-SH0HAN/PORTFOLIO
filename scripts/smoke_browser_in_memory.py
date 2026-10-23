#!/usr/bin/env python3
"""Run real Chromium interaction/layout checks without navigating to localhost.

Useful in restricted environments where browser policy blocks local HTTP/file
navigation. It inlines the site CSS/JavaScript and bundles images as data URIs,
then uses Chromium's actual DOM, CSS layout, events, dialogs, and JavaScript.
This complements (does not replace) the HTTP-backed Playwright E2E suite.
"""
from __future__ import annotations

import argparse
import base64
import os
import re
import sys
from pathlib import Path
from typing import Callable

from playwright.sync_api import Browser, Page, sync_playwright

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
VIEWPORTS = (320, 360, 390, 430, 560, 640, 768, 1024, 1440)


class SmokeChecks:
    def __init__(self) -> None:
        self.passed: list[str] = []
        self.failed: list[str] = []

    def run(self, name: str, check: Callable[[], None]) -> None:
        try:
            check()
        except Exception as exc:  # Report every independent finding in one run.
            self.failed.append(f"{name}: {type(exc).__name__}: {exc}")
            print(f"FAIL  {name}: {type(exc).__name__}: {exc}")
        else:
            self.passed.append(name)
            print(f"PASS  {name}")

    def finish(self) -> int:
        print(f"\nIn-memory Chromium smoke checks: {len(self.passed)} passed, {len(self.failed)} failed")
        if self.failed:
            print("\nFailures:")
            for item in self.failed:
                print(f"  - {item}")
            return 1
        return 0


def data_uri(path: Path, mime: str) -> str:
    payload = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{payload}"


def replace_attribute_asset(html: str, attribute: str, source: str, replacement: str) -> str:
    pattern = re.compile(rf'({re.escape(attribute)}=["\']){re.escape(source)}(["\'])')
    return pattern.sub(lambda match: f"{match.group(1)}{replacement}{match.group(2)}", html)


def prepare_homepage(root: Path, css: str, js: str) -> str:
    html = (root / "index.html").read_text(encoding="utf-8")
    html = html.replace('<link rel="stylesheet" href="styles.css">', f"<style>\n{css}\n</style>")
    html = html.replace('<script defer src="script.js"></script>', "")
    html = re.sub(r'<link\b[^>]*href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>', "", html)
    # Local images are bundled into the test document so the test can run with
    # no web server, browser file access, or outbound network requests.
    assets = {
        "Profile%20Photo.webp": data_uri(root / "Profile Photo.webp", "image/webp"),
        "Orbit%20Photo.webp": data_uri(root / "Orbit Photo.webp", "image/webp"),
        "assets/portrait-placeholder.svg": data_uri(root / "assets/portrait-placeholder.svg", "image/svg+xml"),
        "assets/favicon.svg": data_uri(root / "assets/favicon.svg", "image/svg+xml"),
    }
    for source, replacement in assets.items():
        for attribute in ("src", "srcset", "data-placeholder-src", "data-local-fallback-src", "href"):
            html = replace_attribute_asset(html, attribute, source, replacement)
    return html.replace("</body>", f"<script>\n{js}\n</script>\n</body>")


def prepare_case_study(root: Path, css: str) -> str:
    page = root / "projects" / "observability-lab" / "index.html"
    html = page.read_text(encoding="utf-8")
    html = html.replace('<link rel="stylesheet" href="../../styles.css">', f"<style>\n{css}\n</style>")
    html = re.sub(r'<link\b[^>]*href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>', "", html)
    return html


def wait_for_paint(page: Page) -> None:
    page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")


def check_dimensions(page: Page, widths: tuple[int, ...], *, case_study: bool = False) -> None:
    for width in widths:
        page.set_viewport_size({"width": width, "height": 844})
        wait_for_paint(page)
        metrics = page.evaluate("""() => {
          const box = (selector) => {
            const element = document.querySelector(selector);
            if (!element) return null;
            const rect = element.getBoundingClientRect();
            return {left: rect.left, right: rect.right, width: rect.width,
                    visible: !!(rect.width && rect.height) && getComputedStyle(element).display !== 'none'};
          };
          return { viewport: document.documentElement.clientWidth,
                   document: document.documentElement.scrollWidth,
                   header: box('.site-header'), brand: box('.site-header .brand'),
                   actions: box('.site-header .header-actions'), menu: box('#menuToggle'),
                   cta: box('.site-header .header-cta') };
        }""")
        assert metrics["document"] <= metrics["viewport"] + 1, f"document overflow at {width}px: {metrics}"
        assert metrics["header"] is not None and metrics["header"]["right"] <= metrics["viewport"] + 1, f"header outside viewport at {width}px: {metrics}"
        if width <= 820 and not case_study:
            assert metrics["menu"]["visible"], f"mobile menu hidden at {width}px: {metrics}"
            assert not metrics["cta"]["visible"], f"desktop CTA visible at {width}px: {metrics}"
            assert metrics["brand"]["right"] <= metrics["actions"]["left"] + 1, f"brand collides with controls at {width}px: {metrics}"


def check_contrast(page: Page) -> None:
    def luminance(color: str) -> float:
        value = color.lstrip("#")
        channels = [int(value[index:index + 2], 16) / 255 for index in (0, 2, 4)]
        linear = [channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4 for channel in channels]
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]

    for theme in ("dark", "light"):
        tokens = page.evaluate("""theme => {
          document.documentElement.dataset.theme = theme;
          const style = getComputedStyle(document.documentElement);
          return { bg: style.getPropertyValue('--bg').trim(),
                   muted: style.getPropertyValue('--muted').trim(),
                   faint: style.getPropertyValue('--faint').trim() };
        }""", theme)
        for name in ("muted", "faint"):
            ratio = (max(luminance(tokens["bg"]), luminance(tokens[name])) + 0.05) / (min(luminance(tokens["bg"]), luminance(tokens[name])) + 0.05)
            assert ratio >= 4.5, f"{theme} --{name} contrast is {ratio:.2f}:1, below 4.5:1"



def check_accessibility_foundations(page: Page) -> None:
    audit = page.evaluate("""() => {
      const visible = element => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' &&
          style.visibility !== 'hidden' && !element.closest('[hidden]');
      };
      const accessibleName = element => {
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel?.trim()) return ariaLabel.trim();
        const labelledBy = element.getAttribute('aria-labelledby');
        if (labelledBy) {
          const text = labelledBy.split(/\\s+/).map(id => document.getElementById(id)?.innerText || '').join(' ').trim();
          if (text) return text;
        }
        if (element.labels?.length) {
          const text = [...element.labels].map(label => label.innerText || '').join(' ').trim();
          if (text) return text;
        }
        const text = (element.innerText || '').replace(/\\s+/g, ' ').trim();
        if (text) return text;
        return element.getAttribute('title') || element.querySelector('img[alt]')?.alt || '';
      };
      const controls = [...document.querySelectorAll('a,button,input,select,textarea,[role=button],[role=link],[role=tab],[role=switch]')];
      const missingNames = controls.filter(element => visible(element) && !element.disabled && !accessibleName(element))
        .map(element => ({ tag: element.tagName, id: element.id, className: String(element.className).slice(0, 60) }));
      const badAriaReferences = [];
      for (const element of document.querySelectorAll('*')) {
        for (const attribute of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns']) {
          const value = element.getAttribute(attribute);
          if (value) for (const id of value.split(/\\s+/)) {
            if (!document.getElementById(id)) badAriaReferences.push({ tag: element.tagName, id: element.id, attribute, missing: id });
          }
        }
      }
      const unsafeNewTabs = [...document.querySelectorAll('a[target=\"_blank\"]')]
        .filter(anchor => !/(noopener|noreferrer)/.test(anchor.rel)).map(anchor => anchor.href);
      return { language: document.documentElement.lang, headingCount: document.querySelectorAll('h1').length,
        missingNames, badAriaReferences, unsafeNewTabs, imagesWithoutAlt: [...document.images].filter(image => !image.hasAttribute('alt')).length };
    }""");
    assert audit["language"], "document language is missing"
    assert audit["headingCount"] == 1, f"expected one H1, got {audit['headingCount']}"
    assert not audit["missingNames"], f"visible controls lack accessible names: {audit['missingNames']}"
    assert not audit["badAriaReferences"], f"broken ARIA ID reference(s): {audit['badAriaReferences']}"
    assert not audit["unsafeNewTabs"], f"new-tab links missing noopener/noreferrer: {audit['unsafeNewTabs']}"
    assert audit["imagesWithoutAlt"] == 0, f"images without alt attributes: {audit['imagesWithoutAlt']}"

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=REPOSITORY_ROOT / "dist", help="Built site directory (default: dist/)")
    parser.add_argument("--screenshots", action="store_true", help="Save desktop and mobile screenshots under test-results/browser-in-memory/")
    args = parser.parse_args()
    root = args.root.resolve()
    if not (root / "index.html").is_file():
        print(f"ERROR: site root does not contain index.html: {root}", file=sys.stderr)
        return 2
    required = [root / "styles.css", root / "script.js", root / "Profile Photo.webp", root / "Orbit Photo.webp"]
    missing = [path for path in required if not path.is_file()]
    if missing:
        print("ERROR: missing required in-memory smoke-test file(s):", file=sys.stderr)
        for path in missing:
            print(f"  - {path}", file=sys.stderr)
        return 2

    css = (root / "styles.css").read_text(encoding="utf-8")
    js = (root / "script.js").read_text(encoding="utf-8")
    homepage = prepare_homepage(root, css, js)
    case_study = prepare_case_study(root, css)
    checks = SmokeChecks()
    page_errors: list[str] = []
    screenshot_dir = root.parent / "test-results" / "browser-in-memory"

    with sync_playwright() as playwright:
        executable = None
        # Prefer an explicit override, then Playwright's pinned browser, and
        # finally common system Chromium paths for restricted/offline runners.
        from playwright.sync_api import Error as PlaywrightError
        candidates = []
        override = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
        if override:
            candidates.append(Path(override))
        try:
            candidates.append(Path(playwright.chromium.executable_path))
        except (AttributeError, PlaywrightError):
            pass
        candidates.extend((
            Path("/usr/bin/chromium"),
            Path("/usr/bin/chromium-browser"),
            Path("/usr/bin/google-chrome"),
        ))
        for candidate in candidates:
            if candidate.is_file():
                executable = str(candidate)
                break
        if executable is None:
            raise RuntimeError(
                "Chromium was not found. Run `python -m playwright install chromium` "
                "or set PLAYWRIGHT_CHROMIUM_EXECUTABLE to an installed browser."
            )
        browser: Browser = playwright.chromium.launch(headless=True, executable_path=executable)
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, color_scheme="dark", reduced_motion="reduce")
        page = context.new_page()
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        page.set_content(homepage, wait_until="load", timeout=30000)
        page.evaluate("""async () => {
          const images = [...document.images];
          images.forEach(image => image.loading = 'eager');
          await Promise.all(images.map(image => image.decode().catch(() => undefined)));
        }""")

        def home_basics() -> None:
            assert "MD SHOHAN" in page.title(), page.title()
            assert page.locator("h1").count() == 1
            assert page.locator("#main").is_visible()
            assert page.locator("#heroTitle").is_visible()
            missing_images = page.evaluate("""() => [...document.images].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.alt)""")
            assert not missing_images, f"image(s) not decoded: {missing_images}"
            assert page.locator('a[href="projects/observability-lab/index.html"]').count() >= 1, "featured lab CTA is missing"
        checks.run("homepage renders and bundled images decode", home_basics)
        checks.run("accessible control names, ARIA references, and link safety", lambda: check_accessibility_foundations(page))

        if args.screenshots:
            screenshot_dir.mkdir(parents=True, exist_ok=True)
            page.set_viewport_size({"width": 1440, "height": 1000})
            page.evaluate("window.scrollTo(0, 0)")
            page.screenshot(path=str(screenshot_dir / "homepage-desktop.png"), full_page=False)
            page.set_viewport_size({"width": 390, "height": 844})
            page.evaluate("window.scrollTo(0, 0)")
            page.screenshot(path=str(screenshot_dir / "homepage-mobile.png"), full_page=False)
            page.set_viewport_size({"width": 1440, "height": 1000})

        checks.run("responsive homepage and mobile header at 9 widths", lambda: check_dimensions(page, VIEWPORTS))

        def mobile_hero_sequence() -> None:
            page.set_viewport_size({"width": 390, "height": 844})
            page.evaluate("window.scrollTo({ top: 0, behavior: 'instant' })")
            wait_for_paint(page)
            geometry = page.evaluate("""() => {
              const rect = selector => {
                const element = document.querySelector(selector);
                const box = element.getBoundingClientRect();
                return { top: box.top, bottom: box.bottom, height: box.height };
              };
              return {
                role: document.querySelector('.hero .eyebrow')?.innerText || '',
                title: rect('#heroTitle'), visual: rect('.hero-visual'),
                lede: rect('.hero-lede'), actions: rect('.hero-actions')
              };
            }""")
            assert "CLOUD" in geometry["role"] and "DEVOPS" in geometry["role"], f"hero does not state the target role: {geometry['role']}"
            assert geometry["title"]["top"] < geometry["visual"]["top"], f"profile visual should follow the headline on mobile: {geometry}"
            assert geometry["visual"]["top"] < geometry["lede"]["top"], f"profile visual should precede supporting copy on mobile: {geometry}"
            assert geometry["lede"]["top"] < geometry["actions"]["top"], f"hero actions should follow the introduction copy: {geometry}"
            assert geometry["visual"]["height"] >= 250, f"profile visual collapsed at mobile width: {geometry}"
        checks.run("mobile hero states role and places profile before supporting copy", mobile_hero_sequence)

        def orbital_visualization() -> None:
            page.set_viewport_size({"width": 390, "height": 844})
            page.evaluate("window.scrollTo({ top: 0, behavior: 'instant' })")
            wait_for_paint(page)
            details = page.evaluate("""() => {
              const visual = document.querySelector('.hero-visual').getBoundingClientRect();
              const system = document.querySelector('.portrait-orbit-system').getBoundingClientRect();
              const portrait = document.querySelector('.portrait-frame').getBoundingClientRect();
              return {
                tracks: document.querySelectorAll('.portrait-orbit-track').length,
                ticks: !!document.querySelector('.portrait-orbit-ticks'),
                satellites: document.querySelectorAll('.portrait-orbit-track .orbit-satellite').length,
                visualWidth: visual.width, visualRight: visual.right,
                systemCenterX: system.left + system.width / 2,
                portraitCenterX: portrait.left + portrait.width / 2,
                systemWidth: system.width, portraitWidth: portrait.width,
                pageWidth: document.documentElement.scrollWidth,
                viewportWidth: document.documentElement.clientWidth
              };
            }""")
            assert details["tracks"] == 3 and details["ticks"], f"expected three precision tracks and tick marks: {details}"
            assert details["satellites"] >= 4, f"orbital tracks lack animated satellite markers: {details}"
            assert abs(details["systemCenterX"] - details["portraitCenterX"]) < 2, f"orbit rig is not centered on the portrait: {details}"
            assert details["pageWidth"] <= details["viewportWidth"] + 1, f"orbit system causes horizontal overflow: {details}"
        checks.run("profile orbit rig has three animated tracks and stays centered on mobile", orbital_visualization)
        checks.run("muted/faint text contrast reaches 4.5:1 in both themes", lambda: check_contrast(page))

        def motion_preferences() -> None:
            selectors = [".orbit-one", ".portrait-frame", ".title-glass", ".portrait-orbit-track--inner", ".portrait-orbit-track--middle", ".portrait-orbit-track--outer", ".portrait-orbit-ticks", ".portrait-orbit-pulse"]
            page.emulate_media(reduced_motion="no-preference")
            running = page.evaluate("selectors => selectors.map(selector => getComputedStyle(document.querySelector(selector)).animationName)", selectors)
            assert all(name != "none" for name in running), f"hero motion failed to start under normal preferences: {running}"
            page.emulate_media(reduced_motion="reduce")
            disabled = page.evaluate("selectors => selectors.map(selector => getComputedStyle(document.querySelector(selector)).animationName)", selectors)
            assert all(name == "none" for name in disabled), f"hero motion was not disabled for reduced-motion users: {disabled}"
        checks.run("hero animations run normally and stop for reduced-motion preference", motion_preferences)

        def theme_toggle() -> None:
            page.evaluate("document.documentElement.dataset.theme = 'dark'")
            page.locator("#themeToggle").click()
            assert page.locator("html").get_attribute("data-theme") == "light"
            assert page.locator("#themeToggle").get_attribute("aria-label") == "Switch to dark monochrome theme"
            page.locator("#themeToggle").click()
            assert page.locator("html").get_attribute("data-theme") == "dark"
        checks.run("theme toggle updates theme and accessible name", theme_toggle)

        def mobile_navigation() -> None:
            page.set_viewport_size({"width": 390, "height": 844})
            menu = page.locator("#menuToggle")
            nav = page.locator("#mobileNav")
            assert nav.evaluate("element => element.hidden")
            menu.click()
            assert menu.get_attribute("aria-expanded") == "true"
            assert not nav.evaluate("element => element.hidden")
            nav.get_by_role("link", name="About").click()
            assert nav.evaluate("element => element.hidden")
            assert menu.get_attribute("aria-expanded") == "false"
            assert page.evaluate("location.hash") == "#about"
        checks.run("mobile navigation opens, navigates, and closes", mobile_navigation)

        def command_palette_and_filter() -> None:
            page.keyboard.press("Control+k")
            dialog = page.locator("#commandDialog")
            search = page.locator("#commandSearch")
            results = page.locator("#commandResults .command-result")
            assert dialog.evaluate("element => element.open"), "command dialog did not open"
            assert search.get_attribute("role") == "combobox", f"search role was {search.get_attribute('role')}"
            assert search.get_attribute("aria-controls") == "commandResults", f"controls was {search.get_attribute('aria-controls')}"
            search.fill("no-such-command-expected")
            assert page.locator("#commandEmpty").is_visible(), "empty query results not visible"
            assert search.get_attribute("aria-expanded") == "false", f"expanded with no results: {search.get_attribute('aria-expanded')}"
            assert search.get_attribute("aria-activedescendant") is None, f"unexpected active option {search.get_attribute('aria-activedescendant')}"
            search.fill("Show Cloud projects")
            assert results.count() == 1, f"expected 1 result, got {results.count()}"
            active_id = search.get_attribute("aria-activedescendant")
            assert active_id and page.locator(f"#{active_id}").get_attribute("role") == "option", f"active option mismatch: {active_id}"
            search.press("Enter")
            page.wait_for_function("!document.querySelector('#commandDialog').open")
            cloud_filter = page.locator('[data-filter="cloud"]')
            page.wait_for_function("document.querySelector('[data-filter=\"cloud\"]').getAttribute('aria-pressed') === 'true'", timeout=3000)
            cloud_pressed = cloud_filter.get_attribute("aria-pressed")
            assert str(cloud_pressed).strip().lower() == "true", f"cloud filter did not activate: {cloud_pressed!r}"
            page.wait_for_function("document.querySelectorAll('.project-card[data-category][hidden]').length === 2", timeout=3000)
            visible_count = page.locator('.project-card[data-category]:not([hidden])').count()
            states = page.locator(".project-card[data-category]").evaluate_all("cards => cards.map(card => ({title: card.querySelector('h3')?.textContent, category: card.dataset.category, hidden: card.hidden, ariaHidden: card.getAttribute('aria-hidden'), inert: card.inert, display: getComputedStyle(card).display, classes: card.className}))")
            assert visible_count == 2, f"expected two cloud cards; saw {visible_count}; states={states}"
            hidden_display = page.locator('.project-card[data-category][hidden]').evaluate_all("cards => cards.map(card => getComputedStyle(card).display)")
            assert hidden_display == ["none", "none"], f"filtered-out project cards are not actually hidden: {hidden_display}"

            page.locator('[data-filter="all"]').click()
            page.wait_for_function("document.querySelectorAll('.project-card[data-category][hidden]').length === 0", timeout=3000)
            page.keyboard.press("Control+k")
            search = page.locator("#commandSearch")
            search.fill("Show ")
            assert results.count() == 3, f"expected three matching filter commands, got {results.count()}"
            # Force focus after the DOM replacement so a stale hover/focus target cannot
            # race the keyboard-selection assertion in headless Chromium.
            search.focus()
            page.wait_for_function("document.querySelector('#commandSearch').getAttribute('aria-activedescendant') === 'command-option-0'")
            search.press("ArrowDown")
            page.wait_for_function("document.querySelector('#commandSearch').getAttribute('aria-activedescendant') === 'command-option-1'")
            active_id = search.get_attribute("aria-activedescendant")
            assert active_id == "command-option-1", f"ArrowDown did not move active option: {active_id}"
            assert page.locator(f"#{active_id}").get_attribute("aria-selected") == "true"
            search.press("Enter")
            page.wait_for_function("document.querySelector('[data-filter=\"delivery\"]').getAttribute('aria-pressed') === 'true'", timeout=3000)
            page.wait_for_function("document.querySelectorAll('.project-card[data-category][hidden]').length === 2", timeout=3000)
            assert page.locator('.project-card[data-category]:not([hidden])').count() == 2, "keyboard-selected delivery filter did not show the two delivery cards"
            page.locator('[data-filter="all"]').click()
            page.wait_for_function("document.querySelectorAll('.project-card[data-category][hidden]').length === 0", timeout=3000)
        checks.run("command palette keyboard search and project filter", command_palette_and_filter)

        def project_dialog() -> None:
            page.locator('[data-filter="all"]').click()
            page.locator('[data-project="observability"]').click()
            dialog = page.locator("#projectDialog")
            assert dialog.evaluate("element => element.open")
            assert page.locator("#dialogTitle").inner_text() == "Containerized observability lab"
            assert "SOURCE INCLUDED" in page.locator("#dialogStatus").inner_text()
            assert page.locator("#dialogResourceLink").get_attribute("href").endswith("projects/observability-lab/index.html")
            page.keyboard.press("Escape")
            assert not dialog.evaluate("element => element.open")
        checks.run("project details dialog content and Escape dismissal", project_dialog)

        def slo_calculator() -> None:
            assert page.locator("#sloErrorBudget").inner_text().strip() == "3,000"
            assert page.locator("#sloDowntime").inner_text().strip() == "43m 12s"
            page.locator("#sloTarget").select_option("99")
            assert page.locator("#sloErrorBudget").inner_text().strip() == "30,000"
            page.locator("#sloTarget").select_option("99.9")
            page.locator("#sloRequests").evaluate("element => { element.value = '200000'; element.dispatchEvent(new Event('input', {bubbles:true})); }")
            assert page.locator("#sloErrorBudget").inner_text().strip() == "6,000"
            assert "200,000 requests per day" in page.locator("#sloTakeaway").inner_text()
        checks.run("SLO calculator math responds to target and request changes", slo_calculator)

        def pipeline_failure_safety() -> None:
            page.locator("#failPipeline").click()
            page.wait_for_function("document.querySelector('#pipelineRunMessage').textContent.includes('test stage failed')", timeout=5000)
            assert page.locator('[data-pipeline-stage="test"] .pipeline-stage-state').inner_text() == "Failed"
            assert page.locator('[data-pipeline-stage="build"] .pipeline-stage-state').inner_text() == "Blocked"
            assert page.locator('[data-pipeline-stage="deploy"] .pipeline-stage-state').inner_text() == "Blocked"
        checks.run("simulated pipeline halts build/deploy after test failure", pipeline_failure_safety)

        def kubernetes_readiness() -> None:
            page.locator("#simulatePodFailure").click()
            assert page.locator('[data-pod-state="pod"] .pod-state-value').inner_text() == "Running"
            assert page.locator('[data-pod-state="readiness"] .pod-state-value').inner_text() == "Probe failing"
            assert page.locator('[data-pod-state="endpoint"] .pod-state-value').inner_text() == "0 ready endpoints"
            assert page.locator("#recoverPod").is_enabled()
            page.locator("#recoverPod").click()
            page.wait_for_function("document.querySelector('#podRunMessage').textContent.includes('Recovery verified in the simulation')", timeout=5000)
            assert page.locator('[data-pod-state="readiness"] .pod-state-value').inner_text() == "Passing"
        checks.run("Kubernetes readiness simulation removes and restores endpoint", kubernetes_readiness)

        def sre_incident() -> None:
            page.locator("#injectIncident").click()
            failures = int(page.locator("#simFailures").inner_text().replace(",", ""))
            assert failures > 0, f"incident should increase failed requests; saw {failures}"
            assert page.locator("#simulationLatencyPath").get_attribute("d"), "synthetic latency chart is empty"
            assert "ERROR" in page.locator("#simulationTerminalLog").inner_text()
        checks.run("SRE incident updates budget, chart, and event stream", sre_incident)

        # The case study has an inline local script of its own and receives the
        # same inlined global CSS, so it can be tested without site navigation.
        page.set_content(case_study, wait_until="load", timeout=30000)
        page_errors.clear()
        checks.run("observability case study renders its key content", lambda: (
            (_ for _ in ()).throw(AssertionError("wrong case-study title"))
            if "Observability Lab" not in page.title() or page.locator("h1").count() != 1 or not page.get_by_role("link", name="Read the rendered guide").count()
            else None
        ))
        checks.run("case study responsive layout at 5 widths", lambda: check_dimensions(page, (320, 390, 560, 768, 1024), case_study=True))

        def copy_command() -> None:
            page.locator("[data-copy]").first.click()
            page.wait_for_function("document.querySelector('#lpToast').classList.contains('visible')", timeout=3000)
            text = page.locator("#lpToast").inner_text()
            assert "copied" in text.lower() or "manually" in text.lower(), text
        checks.run("case-study copy-command control responds", copy_command)

        if page_errors:
            checks.failed.append("uncaught browser JavaScript errors: " + "; ".join(page_errors))
            print("FAIL  uncaught browser JavaScript errors: " + "; ".join(page_errors))
        else:
            checks.passed.append("no uncaught browser JavaScript exceptions")
            print("PASS  no uncaught browser JavaScript exceptions")
        context.close()
        browser.close()

    return checks.finish()


if __name__ == "__main__":
    raise SystemExit(main())
