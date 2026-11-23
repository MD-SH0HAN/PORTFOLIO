#!/usr/bin/env python3
"""Check theme-aware primary and nested card surfaces in both themes."""
from __future__ import annotations

import os
import sys
sys.dont_write_bytecode = True  # Keep browser-test imports from adding cache files to the release tree.
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_smoke import standalone_document

ROOT = Path(__file__).resolve().parents[1]

CARD_SELECTORS = [
    ".portfolio-evidence-guide",
    ".portfolio-artifact",
    ".eng-topic-card",
    ".eng-reference-card",
    ".eng-review-card",
    ".motion-panel",
    ".motion-zone-card",
    ".motion-env-card",
    ".motion-diagram-shell",
    ".cloud-principle-card",
    ".iac-domain-card",
    ".architecture-card",
    ".skills-matrix-section",
    ".sre-control-room",
    ".slo-workbench",
    ".eng-review-studio",
    ".eng-evidence-standard",
    ".demo-dashboard",
]

PRIMARY_CARD_SELECTORS = [
    ".sre-control-room",
    ".slo-workbench",
    ".eng-review-studio",
    ".eng-evidence-standard",
    ".skills-matrix-section",
    ".demo-dashboard",
    ".motion-panel",
    ".portfolio-evidence-guide",
    ".eng-topic-card",
    ".eng-reference-card",
]

NESTED_CARD_EXPECTATIONS = {
    ".slo-controls": {"dark": "rgb(25, 25, 25)", "light": "rgb(245, 245, 245)"},
    ".slo-results": {"dark": "rgb(25, 25, 25)", "light": "rgb(245, 245, 245)"},
    ".slo-metric": {"dark": "rgb(25, 25, 25)", "light": "rgb(245, 245, 245)"},
    ".simulation-metric": {"dark": "rgb(25, 25, 25)", "light": "rgb(245, 245, 245)"},
    ".simulation-chart-wrap": {"dark": "rgb(11, 11, 11)", "light": "rgb(236, 236, 236)"},
    ".slo-budget-note": {"dark": "rgb(11, 11, 11)", "light": "rgb(236, 236, 236)"},
}


def main() -> int:
    """Check computed theme colors, solid surfaces, contrast, and responsive layout."""
    failures: list[str] = []
    checks: list[str] = []
    executable = os.environ.get("CHROMIUM_PATH")
    with sync_playwright() as playwright:
        launch_options = {
            "headless": True,
            "args": ["--no-sandbox", "--disable-dev-shm-usage"],
        }
        if executable:
            launch_options["executable_path"] = executable
        browser = playwright.chromium.launch(**launch_options)
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        page.set_content(standalone_document(), wait_until="load", timeout=30000)

        # Repeat the same computed-style assertions in both supported color schemes.
        for theme in ("dark", "light"):
            page.locator("html").evaluate("(el, value) => el.setAttribute('data-theme', value)", theme)
            for selector in CARD_SELECTORS:
                locator = page.locator(selector)
                if locator.count() == 0:
                    continue
                results = locator.evaluate_all("""els => els.map(el => {
                  const style = getComputedStyle(el);
                  return {
                    backgroundImage: style.backgroundImage,
                    backgroundColor: style.backgroundColor,
                    borderTopColor: style.borderTopColor
                  };
                })""")
                for index, result in enumerate(results):
                    if result["backgroundImage"] != "none":
                        failures.append(f"{theme}: {selector}[{index}] still has {result['backgroundImage']}")
                    if result["backgroundColor"] in ("rgba(0, 0, 0, 0)", "transparent"):
                        failures.append(f"{theme}: {selector}[{index}] has a transparent card fill")
            # Primary cards intentionally invert their surface/ink palette with the theme.
            primary_seen = 0
            expected_primary = "rgb(17, 17, 17)" if theme == "dark" else "rgb(255, 255, 255)"
            expected_ink = "rgb(242, 242, 242)" if theme == "dark" else "rgb(20, 20, 20)"
            for selector in PRIMARY_CARD_SELECTORS:
                locator = page.locator(selector)
                if locator.count() == 0:
                    continue
                primary_seen += locator.count()
                results = locator.evaluate_all("""els => els.map(el => {
                  const style = getComputedStyle(el);
                  return { backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage,
                           boxShadow: style.boxShadow, color: style.color };
                })""")
                for index, result in enumerate(results):
                    if result["backgroundColor"] != expected_primary:
                        failures.append(f"{theme}: primary {selector}[{index}] is {result['backgroundColor']}, expected {expected_primary}")
                    if result["backgroundImage"] != "none":
                        failures.append(f"{theme}: primary {selector}[{index}] still has a gradient/image")
                    if result["boxShadow"] != "none":
                        failures.append(f"{theme}: primary {selector}[{index}] still has shadow {result['boxShadow']}")
                    if result["color"] != expected_ink:
                        failures.append(f"{theme}: primary {selector}[{index}] text is {result['color']}, expected theme ink {expected_ink}")
            if primary_seen:
                checks.append(f"{theme} theme: {primary_seen} primary cards use theme-matched surfaces and readable ink")
            else:
                failures.append(f"{theme}: no primary cards were found for color verification")

            for selector, expected_by_theme in NESTED_CARD_EXPECTATIONS.items():
                expected_color = expected_by_theme[theme]
                locator = page.locator(selector)
                if locator.count() == 0:
                    continue
                results = locator.evaluate_all("""els => els.map(el => {
                  const style = getComputedStyle(el);
                  return { backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage,
                           boxShadow: style.boxShadow };
                })""")
                for index, result in enumerate(results):
                    if result["backgroundColor"] != expected_color:
                        failures.append(f"{theme}: nested {selector}[{index}] has {result['backgroundColor']}, expected {expected_color}")
                    if result["backgroundImage"] != "none" or result["boxShadow"] != "none":
                        failures.append(f"{theme}: nested {selector}[{index}] still has a gradient or shadow")
            checks.append(f"{theme} theme: SLO / reliability inner cards use matching, flat tonal layers")

            # Interactive terminal panels are data cards too and must not stay dark in light mode.
            terminal = page.locator(".motion-terminal").first
            if terminal.count():
                terminal_colors = terminal.evaluate("el => ({background: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color, head: getComputedStyle(el.querySelector('.motion-terminal-head')).color})")
                expected_terminal = ("rgb(9, 9, 9)", "rgb(231, 231, 231)") if theme == "dark" else ("rgb(241, 241, 241)", "rgb(24, 24, 24)")
                if terminal_colors["background"] == expected_terminal[0] and terminal_colors["color"] == expected_terminal[1]:
                    checks.append(f"{theme} theme: interactive terminal surface and text follow the active palette")
                else:
                    failures.append(f"{theme}: terminal surface/text are {terminal_colors}, expected {expected_terminal}")
            else:
                failures.append(f"{theme}: no interactive terminal panel found")

            # The protected footer retains its original theme-specific surface.
            contact_background = page.locator(".contact-panel").evaluate("el => getComputedStyle(el).backgroundColor")
            expected_contact = "rgb(21, 21, 21)" if theme == "dark" else "rgb(255, 255, 255)"
            if contact_background == expected_contact:
                checks.append(f"{theme} theme: protected full-connection footer surface is unchanged")
            else:
                failures.append(f"{theme}: protected contact panel changed to {contact_background}")

        # Protected hero and footer are intentionally outside the card override scope.
        hero_checks = page.locator(".hero .portrait-frame").count() == 1 and page.locator(".site-footer").count() == 1
        hero_gradient = page.locator(".hero .portrait-frame").evaluate("el => getComputedStyle(el).backgroundImage !== 'none'")
        if hero_checks and hero_gradient:
            checks.append("protected hero/orbital profile and final footer remain present; hero frame treatment is retained")
        else:
            failures.append("protected hero/footer presence or original hero frame treatment changed")

        motion_count = page.locator(".motion-panel").count()
        evidence_count = page.locator(".portfolio-evidence-guide").count()
        review_count = page.locator(".eng-review-card").count()
        if motion_count == 16 and evidence_count == 1 and review_count == 4:
            checks.append("all 16 motion panels, evidence guide, and four review cards are present")
        else:
            failures.append(f"unexpected card inventory: motion={motion_count}, evidence={evidence_count}, review={review_count}")

        for width in (1440, 1024, 768, 390, 320):
            page.set_viewport_size({"width": width, "height": 900})
            overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
            if overflow:
                failures.append(f"horizontal overflow at {width}px")
            else:
                checks.append(f"no page-level horizontal overflow at {width}px")

        browser.close()

    for item in checks:
        print(f"PASS: {item}")
    for item in failures:
        print(f"FAIL: {item}")
    print(f"\n{len(checks)} checks passed; {len(failures)} failures")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
