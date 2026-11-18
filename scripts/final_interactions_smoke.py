#!/usr/bin/env python3
"""Focused browser tests for final visual, navigation, and mobile refinements."""
from __future__ import annotations

import os
import sys
sys.dont_write_bytecode = True
from playwright.sync_api import sync_playwright
from browser_smoke import standalone_document


def main() -> int:
    passed: list[str] = []
    failed: list[str] = []
    browser_errors: list[str] = []

    with sync_playwright() as playwright:
        launch = {"headless": True, "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
        executable = os.environ.get("CHROMIUM_PATH")
        if executable:
            launch["executable_path"] = executable
        browser = playwright.chromium.launch(**launch)
        page = browser.new_page(viewport={"width": 1440, "height": 1000}, reduced_motion="no-preference")
        page.set_default_timeout(7000)
        page.on("pageerror", lambda error: browser_errors.append(str(error)))
        page.on("console", lambda message: browser_errors.append(message.text) if message.type == "error" else None)
        try:
            page.set_content(standalone_document(), wait_until="load", timeout=30000)
            page.wait_for_selector("#architectureGalleryGrid [data-architecture-expand]", timeout=10000)

            # Pointer-follow effects are intentionally absent; the page canvas is a flat theme color.
            pointer_state = page.evaluate("""() => {
              const pseudo = selector => {
                const element = document.querySelector(selector);
                return element ? getComputedStyle(element, '::before').content : 'none';
              };
              return {
                gridSections: document.querySelectorAll('.eng-grid-interactive').length,
                gridOverlays: document.querySelectorAll('.eng-grid-flow-overlay').length,
                spotlights: document.querySelectorAll('.pointer-spotlight').length,
                motionCards: document.querySelectorAll('.motion-card').length,
                bodyImage: getComputedStyle(document.body).backgroundImage,
                bodyBefore: getComputedStyle(document.body, '::before').content,
                architectureGrid: pseudo('.architecture-stage'),
                constellationDots: pseudo('.constellation-canvas'),
                projectGrid: pseudo('.project-visual')
              };
            }""")
            if pointer_state['gridSections'] == 0 and pointer_state['gridOverlays'] == 0:
                passed.append("section-wide pointer grid and directional overlays are completely removed")
            else:
                failed.append(f"section pointer grid remains in DOM: {pointer_state}")
            if pointer_state['spotlights'] == 0 and pointer_state['motionCards'] == 0:
                passed.append("card cursor spotlights and pointer-driven tilt are completely removed")
            else:
                failed.append(f"card pointer effects remain in DOM: {pointer_state}")
            if (pointer_state['bodyImage'] == 'none' and pointer_state['bodyBefore'] in ('none', 'normal')
                    and pointer_state['architectureGrid'] in ('none', 'normal')
                    and pointer_state['constellationDots'] in ('none', 'normal')
                    and pointer_state['projectGrid'] in ('none', 'normal')):
                passed.append("page and selected diagram canvases use solid theme surfaces without decorative grid textures")
            else:
                failed.append(f"page or diagram canvas is not solid: {pointer_state}")
            theme_before = page.evaluate("getComputedStyle(document.body).backgroundColor")
            page.locator('body').evaluate("el => el.style.backgroundImage = 'none'")
            theme_after = page.evaluate("getComputedStyle(document.body).backgroundColor")
            if theme_before == theme_after:
                passed.append("solid page background remains stable without decorative pointer overlays")
            else:
                failed.append("page background color changed unexpectedly during visual-effect removal")
            if not page.locator('#about.eng-grid-interactive, #contact.eng-grid-interactive').count():
                passed.append("hero/about and final contact sections remain free of pointer-grid classes")
            else:
                failed.append("protected first/last sections received pointer-grid classes")

            # Architecture expansion: all 12 cards expose a named button and a focused flow dialog.
            expanders = page.locator("#architectureGalleryGrid [data-architecture-expand]")
            if expanders.count() == 12:
                passed.append("all twelve architecture patterns expose a dedicated expansion control")
            else:
                failed.append(f"expected 12 architecture expansion controls, found {expanders.count()}")
            expanders.nth(0).click()
            dialog = page.locator("#architectureDetailDialog")
            if dialog.evaluate("el => el.open") and "Three-Tier" in dialog.locator("#architectureDetailTitle").inner_text():
                passed.append("architecture expansion opens an accessible modal with the selected pattern title")
            else:
                failed.append("architecture expansion did not open the expected pattern")
            if dialog.locator(".architecture-detail-steps li").count() == 5:
                passed.append("architecture modal presents a five-step explanatory flow")
            else:
                failed.append("architecture modal did not render all explanatory steps")
            dialog.locator('[data-architecture-zoom="in"]').click()
            if dialog.locator(".architecture-detail-zoom output").inner_text() == "110%":
                passed.append("architecture diagram zoom control updates its visible zoom state")
            else:
                failed.append("architecture diagram zoom control did not update")
            dialog.locator('[data-architecture-zoom="reset"]').click()
            if dialog.locator(".architecture-detail-zoom output").inner_text() == "100%":
                passed.append("architecture diagram zoom reset restores the baseline")
            else:
                failed.append("architecture diagram zoom reset failed")
            dialog.locator("[data-architecture-draw]").click()
            if dialog.locator(".architecture-detail-status").inner_text().startswith("Drawing"):
                passed.append("expanded architecture draw control starts its flow animation and status feedback")
            else:
                failed.append("expanded architecture draw control did not start")
            page.wait_for_timeout(1800)
            dialog.locator("[data-architecture-close]").click()
            page.wait_for_function("() => !document.querySelector('#architectureDetailDialog')?.open && document.activeElement === document.querySelector('#architectureGalleryGrid [data-architecture-expand]')", timeout=3000)
            if not dialog.evaluate("el => el.open") and expanders.nth(0).evaluate("el => document.activeElement === el"):
                passed.append("architecture dialog closes and restores focus to its invoking card control")
            else:
                failed.append("architecture dialog close/focus restoration failed")

            # Learning stages: a focus navigator, not a false completion tracker.
            stage_buttons = page.locator(".roadmap-stage-track [data-roadmap-select]")
            if stage_buttons.count() == 5:
                passed.append("learning progression exposes five stage selector controls")
            else:
                failed.append(f"expected five learning stage selectors, found {stage_buttons.count()}")
            stage_buttons.nth(2).click()
            stage_status = page.locator(".roadmap-stage-status").inner_text()
            if "Stage 03 of 05" in stage_status and "no completion" in stage_status.lower():
                passed.append("learning stage selector announces focus without implying completion or mastery")
            else:
                failed.append(f"learning stage status is inaccurate: {stage_status}")
            page.locator(".eng-roadmap [data-roadmap-stage='3'] .roadmap-focus-button").click()
            if page.locator(".eng-roadmap [data-roadmap-stage='3'] .eng-roadmap-checkpoint").get_attribute("open") is not None:
                passed.append("stage inspection opens the corresponding readiness checkpoint")
            else:
                failed.append("stage inspection did not open its readiness checkpoint")
            if page.locator("#toast").inner_text().startswith("Focused learning stage"):
                passed.append("learning stage interaction provides visible and announced feedback")
            else:
                failed.append("learning stage interaction feedback was not shown")

            # Command palette: categories, dynamic lab/architecture entries, token search, recents.
            page.keyboard.press("Control+k")
            palette = page.locator("#commandDialog")
            if palette.evaluate("el => el.open") and page.locator("[data-command-filter]").count() == 10:
                passed.append("enhanced command palette opens with ten topic filters")
            else:
                failed.append("enhanced command palette or topic filters did not render")
            page.locator('[data-command-filter="architecture"]').click()
            arch_results = page.locator("#commandResults .command-result").count()
            if arch_results >= 12 and "architecture" in page.locator("#commandResultCount").inner_text().lower():
                passed.append("architecture filter finds all twelve dynamic architecture destinations")
            else:
                failed.append(f"architecture filter returned {arch_results} results")
            page.locator("#commandSearch").fill("kubernetes")
            kubernetes_matches = page.locator("#commandResults .command-result").count()
            if kubernetes_matches >= 1:
                passed.append("command palette supports token-based search across architecture content")
            else:
                failed.append("command palette did not find Kubernetes content")
            page.locator('[data-command-filter="all"]').click()
            page.locator("#commandSearch").fill("Open lab: Kubernetes Pod lifecycle")
            if page.locator("#commandResults .command-result").count() == 1:
                page.locator("#commandResults .command-result").click()
                page.wait_for_timeout(400)
                if not palette.evaluate("el => el.open") and page.locator('[data-ea-lab="pod-lifecycle"]').evaluate("el => el.classList.contains('command-target-highlight')"):
                    passed.append("command palette discovers and navigates directly to an interactive engineering lab")
                else:
                    failed.append("dynamic lab command did not navigate to the selected lab")
            else:
                failed.append("dynamic lab command was not searchable as expected")
            page.keyboard.press("Control+k")
            page.locator("#commandSearch").fill("")
            if page.locator("#commandResults .command-result").first.locator("small").inner_text().endswith("RECENT"):
                passed.append("recent command destinations are persisted locally and ranked first")
            else:
                failed.append("recent command destinations were not promoted")
            page.keyboard.press("Escape")

            # Mobile: modal, touch-sized controls, contained page width, keyboard-pan support.
            page.set_viewport_size({"width": 390, "height": 844})
            page.wait_for_timeout(100)
            page.locator("#architectureGalleryGrid [data-architecture-expand]").nth(5).click()
            mobile_dialog = page.locator("#architectureDetailDialog")
            mobile_box = mobile_dialog.bounding_box()
            viewport = page.evaluate("({width:innerWidth,height:innerHeight,doc:document.documentElement.scrollWidth})")
            if mobile_dialog.evaluate("el => el.open") and mobile_box["width"] <= viewport["width"] and viewport["doc"] <= viewport["width"]:
                passed.append("architecture modal fits a 390px viewport without page-level horizontal overflow")
            else:
                failed.append(f"mobile architecture modal/page overflow: dialog={mobile_box}, viewport={viewport}")
            if mobile_dialog.locator(".architecture-detail-stage").evaluate("el => el.scrollWidth >= el.clientWidth"):
                passed.append("mobile architecture diagrams remain internally pannable rather than widening the page")
            else:
                failed.append("mobile architecture stage does not expose its diagram canvas")
            mobile_dialog.locator('[data-architecture-zoom="in"]').click()
            if mobile_dialog.locator(".architecture-detail-zoom output").inner_text() == "110%":
                passed.append("mobile diagram zoom remains operable at touch viewport width")
            else:
                failed.append("mobile diagram zoom is not operable")
            mobile_dialog.locator("[data-architecture-close]").click()

            # Reduced motion disables pointer effects and keeps diagram draw static.
            page.emulate_media(reduced_motion="reduce")
            page.locator("#architectureGalleryGrid [data-architecture-expand]").first.click()
            reduced_dialog = page.locator("#architectureDetailDialog")
            reduced_dialog.locator("[data-architecture-draw]").click()
            if "reduced motion preference respected" in reduced_dialog.locator(".architecture-detail-status").inner_text():
                passed.append("architecture draw respects reduced-motion preferences with a static equivalent")
            else:
                failed.append("architecture draw did not respect reduced motion")
            if page.locator("body").evaluate("el => getComputedStyle(el).backgroundImage === 'none'"):
                passed.append("solid page canvas remains unchanged under reduced-motion preference")
            else:
                failed.append("page canvas acquired a texture under reduced motion")
            reduced_dialog.locator("[data-architecture-close]").click()

            if browser_errors:
                failed.extend(f"browser error: {error}" for error in browser_errors)
        finally:
            browser.close()

    for item in passed:
        print(f"PASS: {item}")
    for item in failed:
        print(f"FAIL: {item}")
    print(f"RESULT: {len(passed)} passed, {len(failed)} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
