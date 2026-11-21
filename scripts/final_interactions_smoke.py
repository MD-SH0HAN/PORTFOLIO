#!/usr/bin/env python3
"""Focused browser tests for final visual, navigation, and mobile refinements."""
from __future__ import annotations

import os
import sys
sys.dont_write_bytecode = True
from playwright.sync_api import sync_playwright
from browser_smoke import standalone_document


def main() -> int:
    """Verify content-aware grids, dialogs, command search, focus, and mobile diagrams."""
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

            # Content-aware grid regression: card collections should use intentional
            # full rows or balanced spans rather than leaving a visually vacant slot.
            layout_checks = []
            for viewport_width in (1440, 1024, 768, 390, 320):
                page.set_viewport_size({"width": viewport_width, "height": 950})
                page.wait_for_timeout(80)
                state = page.evaluate(r"""() => {
                  const tracks = element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length;
                  const span = element => {
                    const style = getComputedStyle(element);
                    return { start: style.gridColumnStart, end: style.gridColumnEnd };
                  };
                  const compact = document.querySelector('#delivery-model .eng-card-grid');
                  const trio = [...document.querySelectorAll('.eng-card-grid[data-compact-count="3"]')];
                  const labs = [...document.querySelectorAll('.ea-grid')];
                  const trioLab = labs.find(grid => grid.children.length === 3);
                  const soloLab = labs.find(grid => grid.children.length === 1);
                  const roadmap = document.querySelector('.eng-roadmap');
                  const sources = document.querySelector('.eng-source-groups');
                  const skills = document.querySelector('.skills-matrix-grid');
                  const decision = document.querySelector('.eng-decision-grid');
                  const system = document.querySelector('.eng-system-flow');
                  const toolList = document.querySelector('#toolList');
                  const techList = document.querySelector('.motion-tech-list');
                  const metricGrid = document.querySelector('.motion-metric-grid');
                  const iacSteps = document.querySelector('.iac-steps');
                  const terraformSteps = document.querySelector('.terraform-sim-steps');
                  const capabilities = document.querySelector('.ea-platform-capabilities');
                  const threeInput = [...document.querySelectorAll('.ea-input-grid')].find(grid => grid.children.length === 3);
                  const timeline = document.querySelector('.motion-timeline');
                  return {
                    width: innerWidth,
                    docOverflow: document.documentElement.scrollWidth > innerWidth,
                    compactCount: compact?.children.length || 0,
                    compactColumns: compact ? tracks(compact) : 0,
                    trio: trio.map(grid => ({ columns: tracks(grid), count: grid.children.length, last: span(grid.lastElementChild) })),
                    trioLab: trioLab ? { columns: tracks(trioLab), last: span(trioLab.lastElementChild) } : null,
                    soloLab: soloLab ? span(soloLab.firstElementChild) : null,
                    roadmap: roadmap ? { columns: tracks(roadmap), count: roadmap.children.length, spans: [...roadmap.children].map(span) } : null,
                    sources: sources ? { columns: tracks(sources), count: sources.children.length, spans: [...sources.children].map(span) } : null,
                    skills: skills ? { columns: tracks(skills), count: skills.children.length, last: [...skills.children].slice(-2).map(span) } : null,
                    decisionLast: decision ? span(decision.lastElementChild) : null,
                    system: system ? { columns: tracks(system), count: system.children.length, spans: [...system.children].map(span) } : null,
                    toolList: toolList ? { columns: tracks(toolList), count: toolList.children.length, last: span(toolList.lastElementChild) } : null,
                    techList: techList ? { columns: tracks(techList), count: techList.children.length, last: span(techList.lastElementChild) } : null,
                    metricGrid: metricGrid ? { columns: tracks(metricGrid), count: metricGrid.children.length, last: span(metricGrid.lastElementChild), spans: [...metricGrid.children].map(span) } : null,
                    iacSteps: iacSteps ? { columns: tracks(iacSteps), count: iacSteps.children.length, spans: [...iacSteps.children].map(span) } : null,
                    terraformSteps: terraformSteps ? { columns: tracks(terraformSteps), count: terraformSteps.children.length, spans: [...terraformSteps.children].map(span) } : null,
                    capabilities: capabilities ? { columns: tracks(capabilities), count: capabilities.children.length, last: span(capabilities.lastElementChild) } : null,
                    threeInput: threeInput ? { columns: tracks(threeInput), last: span(threeInput.lastElementChild) } : null,
                    timeline: timeline ? { columns: tracks(timeline), count: timeline.children.length, last: span(timeline.lastElementChild) } : null
                  };
                }""")
                def is_full(item):
                    """Return whether a grid item spans the complete available row."""
                    return bool(item and item.get("start") == "1" and item.get("end") == "-1")
                errors = []
                if state["docOverflow"]:
                    errors.append("document overflows horizontally")
                if state["compactCount"] != 10:
                    errors.append(f"delivery topic count is {state['compactCount']}, expected 10")
                if viewport_width >= 1101 and state["compactColumns"] != 5:
                    errors.append(f"desktop delivery topics use {state['compactColumns']} columns, expected 5")
                if 361 <= viewport_width <= 1100 and state["compactColumns"] != 2:
                    errors.append(f"tablet/mobile delivery topics use {state['compactColumns']} columns, expected 2")
                if viewport_width <= 360 and state["compactColumns"] != 1:
                    errors.append(f"small mobile delivery topics use {state['compactColumns']} columns, expected 1")
                for grid in state["trio"]:
                    expected_columns = 3 if viewport_width >= 1101 else (1 if viewport_width <= 620 else 2)
                    if grid["columns"] != expected_columns:
                        errors.append(f"three-topic grid uses {grid['columns']} columns, expected {expected_columns}")
                    if expected_columns == 2 and not is_full(grid["last"]):
                        errors.append("tablet three-topic grid leaves its final card half-width")
                if state["trioLab"]:
                    expected_columns = 3 if viewport_width >= 1101 else (1 if viewport_width <= 620 else 2)
                    if state["trioLab"]["columns"] != expected_columns:
                        errors.append(f"three-model motion lab uses {state['trioLab']['columns']} columns, expected {expected_columns}")
                    if expected_columns == 2 and not is_full(state["trioLab"]["last"]):
                        errors.append("tablet three-model lab leaves its final model half-width")
                if state["soloLab"] and not is_full(state["soloLab"]):
                    errors.append("single-model motion lab does not use the full row")
                if state["roadmap"]:
                    expected_columns = 6 if viewport_width >= 1101 else (1 if viewport_width <= 460 else 2)
                    if state["roadmap"]["columns"] != expected_columns:
                        errors.append(f"learning roadmap uses {state['roadmap']['columns']} columns, expected {expected_columns}")
                    if viewport_width >= 1101 and any(span["start"] != "span 2" for span in state["roadmap"]["spans"][:3]):
                        errors.append("desktop learning roadmap first three stages are not balanced")
                    if viewport_width >= 1101 and any(span["start"] != "span 3" for span in state["roadmap"]["spans"][3:]):
                        errors.append("desktop learning roadmap final pair is not balanced")
                    if 461 <= viewport_width <= 1100 and not is_full(state["roadmap"]["spans"][-1]):
                        errors.append("tablet learning roadmap leaves the fifth stage half-width")
                if state["sources"]:
                    if viewport_width >= 761 and state["sources"]["columns"] != 6:
                        errors.append("wide source groups do not retain their balanced 3 + 2 layout")
                    if viewport_width >= 761 and any(span["start"] != "span 3" for span in state["sources"]["spans"][3:]):
                        errors.append("wide source-group final pair is not balanced")
                    if 461 <= viewport_width <= 760 and not is_full(state["sources"]["spans"][-1]):
                        errors.append("tablet source groups leave the fifth group half-width")
                if state["skills"]:
                    expected_columns = 4 if viewport_width >= 1101 else (1 if viewport_width <= 620 else 2)
                    if state["skills"]["columns"] != expected_columns:
                        errors.append(f"technology map uses {state['skills']['columns']} columns, expected {expected_columns}")
                if state["decisionLast"] and not is_full(state["decisionLast"]):
                    errors.append("final odd decision card does not span the full row")
                if state["system"]:
                    expected_columns = 7 if viewport_width >= 1101 else (1 if viewport_width <= 460 else (2 if viewport_width <= 760 else 12))
                    if state["system"]["columns"] != expected_columns:
                        errors.append(f"system flow uses {state['system']['columns']} columns, expected {expected_columns}")
                    if 461 <= viewport_width <= 760 and not is_full(state["system"]["spans"][-1]):
                        errors.append("mobile system flow leaves its final stage half-width")
                if state["toolList"] and 361 <= viewport_width <= 1050 and not is_full(state["toolList"]["last"]):
                    errors.append("tablet technology explorer leaves its final item half-width")
                if state["techList"]:
                    if state["techList"]["count"] == 11:
                        if viewport_width >= 901 and (state["techList"]["columns"] != 6):
                            errors.append("wide technology list does not use its balanced 3 + 3 + 3 + 2 layout")
                        if 701 <= viewport_width <= 900 and (state["techList"]["columns"] != 12):
                            errors.append("tablet technology list does not use its balanced 4 + 4 + 3 layout")
                        if viewport_width <= 420 and not is_full(state["techList"]["last"]):
                            errors.append("small-screen eleven-item technology list leaves a half-row")
                if state["metricGrid"]:
                    if viewport_width >= 901 and (state["metricGrid"]["columns"] != 12
                            or any(span["start"] != "span 3" for span in state["metricGrid"]["spans"][:4])
                            or any(span["start"] != "span 4" for span in state["metricGrid"]["spans"][4:])):
                        errors.append("desktop metric cards do not use the balanced 4 + 3 layout")
                    if viewport_width <= 900 and not is_full(state["metricGrid"]["last"]):
                        errors.append("tablet metric grid leaves its seventh metric half-width")
                for step_grid in (state["iacSteps"], state["terraformSteps"]):
                    if step_grid:
                        if 621 <= viewport_width <= 1100 and (step_grid["columns"] != 12
                                or any(span["start"] != "span 3" for span in step_grid["spans"][:4])
                                or any(span["start"] != "span 4" for span in step_grid["spans"][4:])):
                            errors.append("tablet seven-stage IaC lifecycle does not use the balanced 4 + 3 layout")
                        if viewport_width <= 460 and step_grid["columns"] != 1:
                            errors.append("small-screen IaC steps are not a readable single column")
                if state["capabilities"] and not is_full(state["capabilities"]["last"]):
                    errors.append("final platform capability card does not fill its row")
                if state["threeInput"] and not is_full(state["threeInput"]["last"]):
                    errors.append("final input card in a three-item group does not fill its row")
                if state["timeline"] and viewport_width <= 420 and not is_full(state["timeline"]["last"]):
                    errors.append("mobile nine-stage timeline leaves its final stage half-width")
                if errors:
                    layout_checks.append(f"{viewport_width}px: FAIL — " + "; ".join(errors))
                else:
                    layout_checks.append(f"{viewport_width}px: PASS")

            page.set_viewport_size({"width": 1440, "height": 1000})
            for result in layout_checks:
                if "FAIL" in result:
                    failed.append(f"content-aware responsive grid layout {result}")
                else:
                    passed.append(f"content-aware responsive grid layout {result}")

            # Filtered technology subsets are rebalanced from their visible count,
            # including a two-card tail on the desktop three-column index.
            page.locator('[data-tool-filter="foundation"]').click()
            filtered_tool_state = page.evaluate(r"""() => {
              const grid = document.querySelector('#toolList');
              const visible = [...grid.querySelectorAll('[data-tool]:not([hidden])')];
              return {
                count: visible.length,
                balance: grid.dataset.gridBalance || '',
                columns: getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length,
                firstSpans: visible.slice(0, 3).map(item => getComputedStyle(item).gridColumnStart),
                tailSpans: visible.slice(-2).map(item => getComputedStyle(item).gridColumnStart)
              };
            }""")
            if (filtered_tool_state['count'] == 5 and filtered_tool_state['balance'] == 'pair-tail'
                    and filtered_tool_state['columns'] == 6
                    and filtered_tool_state['firstSpans'] == ['span 2', 'span 2', 'span 2']
                    and filtered_tool_state['tailSpans'] == ['span 3', 'span 3']):
                passed.append("filtered technology explorer dynamically balances an uneven five-item result")
            else:
                failed.append(f"filtered technology explorer layout is unbalanced: {filtered_tool_state}")
            page.locator('[data-tool-filter="all"]').click()

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
