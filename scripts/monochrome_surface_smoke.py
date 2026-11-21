#!/usr/bin/env python3
"""Check that content cards use solid monochrome surfaces in both themes."""
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
    ".slo-controls": "rgb(25, 25, 25)",
    ".slo-results": "rgb(25, 25, 25)",
    ".slo-metric": "rgb(25, 25, 25)",
    ".simulation-metric": "rgb(25, 25, 25)",
    ".simulation-chart-wrap": "rgb(11, 11, 11)",
    ".slo-budget-note": "rgb(11, 11, 11)",
}


def main() -> int:
    """Check computed card colors, solid surfaces, shadow removal, and theme parity."""
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
            # Main/bigger cards use the exact requested #111111 in both themes.
            primary_seen = 0
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
                    if result["backgroundColor"] != "rgb(17, 17, 17)":
                        failures.append(f"{theme}: primary {selector}[{index}] is {result['backgroundColor']}, expected #111111")
                    if result["backgroundImage"] != "none":
                        failures.append(f"{theme}: primary {selector}[{index}] still has a gradient/image")
                    if result["boxShadow"] != "none":
                        failures.append(f"{theme}: primary {selector}[{index}] still has shadow {result['boxShadow']}")
                    if result["color"] != "rgb(242, 242, 242)":
                        failures.append(f"{theme}: primary {selector}[{index}] text is not using the accessible light foreground")
            if primary_seen:
                checks.append(f"{theme} theme: {primary_seen} primary cards use exact #111111 with no shadow")
            else:
                failures.append(f"{theme}: no primary cards were found for color verification")

            for selector, expected_color in NESTED_CARD_EXPECTATIONS.items():
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
            checks.append(f"{theme} theme: SLO / reliability inner cards use flat, solid tonal layers")

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
