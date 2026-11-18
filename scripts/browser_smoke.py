#!/usr/bin/env python3
"""Real-browser smoke tests using a self-contained copy of the static site.

The browser policy in some sandboxed environments blocks local navigation. The
harness therefore embeds repository CSS/JS and local images into an about:blank
page, preserving the real source code while avoiding local-network navigation.
The deployed portfolio itself remains dependency-free.
"""
from __future__ import annotations

import base64
import os
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def data_uri(path: Path) -> str:
    suffix = path.suffix.lower()
    mime = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml"}.get(suffix, "application/octet-stream")
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode('ascii')}"


def standalone_document() -> str:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    # Inline the exact production stylesheets; no test-only layout overrides are applied.
    for asset in ("styles.css", "animations.css", "advanced-animations.css", "final-interactions.css"):
        source = (ROOT / asset).read_text(encoding="utf-8")
        html, count = re.subn(
            rf'<link\b(?=[^>]*\bhref=["\']{re.escape(asset)}["\'])(?=[^>]*\brel=["\']stylesheet["\'])[^>]*>',
            f"<style data-inlined-asset='{asset}'>\n{source}\n</style>", html, count=1, flags=re.IGNORECASE
        )
        if count != 1:
            raise RuntimeError(f"could not inline {asset} from index.html")

    # Deferred production scripts are moved to the end of body, retaining their order.
    scripts = []
    for asset in ("script.js", "animations.js", "advanced-animations.js", "final-interactions.js"):
        pattern = rf'<script\b(?=[^>]*\bsrc=["\']{re.escape(asset)}["\'])[^>]*>\s*</script>'
        html, count = re.subn(pattern, "", html, count=1, flags=re.IGNORECASE)
        if count != 1:
            raise RuntimeError(f"could not locate deferred {asset} reference")
        scripts.append(f"<script data-inlined-asset='{asset}'>\n{(ROOT / asset).read_text(encoding='utf-8')}\n</script>")

    # Embed local image resources so the browser makes no filesystem/network request.
    for relative in ("Profile Photo.webp", "assets/favicon.png"):
        html = html.replace(relative.replace(" ", "%20"), data_uri(ROOT / relative))
        html = html.replace(relative, data_uri(ROOT / relative))

    # Fonts are an external presentation enhancement; use the declared CSS fallback in this test.
    html = re.sub(r'<link\b[^>]*href=["\']https://fonts\.(?:googleapis|gstatic)\.com/[^"\']*["\'][^>]*>', "", html, flags=re.IGNORECASE)
    html = html.replace("</body>", "\n" + "\n".join(scripts) + "\n</body>")
    return html


def main() -> int:
    failures: list[str] = []
    browser_errors: list[str] = []
    passed: list[str] = []

    document = standalone_document()
    with sync_playwright() as playwright:
        launch = {"headless": True, "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
        executable = os.environ.get("CHROMIUM_PATH")
        if executable:
            launch["executable_path"] = executable
        browser = playwright.chromium.launch(**launch)
        context = browser.new_context(reduced_motion="reduce")
        page = context.new_page()
        page.set_default_timeout(6000)
        page.on("pageerror", lambda error: browser_errors.append(str(error)))
        page.on("console", lambda message: browser_errors.append(f"console.error: {message.text}") if message.type == "error" else None)

        try:
            page.set_content(document, wait_until="load", timeout=30000)
            page.wait_for_selector("#heroTitle", timeout=10000)
            if page.title().strip():
                passed.append("self-contained production HTML/CSS/JS loads and hero renders")
            else:
                failures.append("document title is empty")

            accessibility = page.evaluate(r"""() => {
              const text = element => (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
              const named = element => Boolean(element.getAttribute('aria-label') || element.getAttribute('aria-labelledby') || element.getAttribute('title') || text(element));
              const unnamedButtons = [...document.querySelectorAll('button')].filter(element => !named(element)).length;
              const unnamedLinks = [...document.querySelectorAll('a[href]')].filter(element => !named(element) && !element.querySelector('img[alt]')).length;
              const unlabeledControls = [...document.querySelectorAll('input, select, textarea')].filter(element => !element.labels?.length && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')).length;
              const imagesWithoutAlt = document.querySelectorAll('img:not([alt])').length;
              const unresolvedReferences = [...document.querySelectorAll('[aria-labelledby], [aria-describedby]')].flatMap(element => {
                const ids = `${element.getAttribute('aria-labelledby') || ''} ${element.getAttribute('aria-describedby') || ''}`.split(/\s+/).filter(Boolean);
                return ids.filter(id => !document.getElementById(id));
              }).length;
              const unnamedDialogs = [...document.querySelectorAll('dialog, [role="dialog"]')].filter(element => !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')).length;
              return { language: document.documentElement.lang, title: document.title, h1: document.querySelectorAll('h1').length, main: document.querySelectorAll('main').length, unnamedButtons, unnamedLinks, unlabeledControls, imagesWithoutAlt, unresolvedReferences, unnamedDialogs };
            }""")
            accessibility_ok = (
                accessibility["language"] and accessibility["title"] and accessibility["h1"] == 1
                and accessibility["main"] == 1 and not any(accessibility[key] for key in (
                    "unnamedButtons", "unnamedLinks", "unlabeledControls", "imagesWithoutAlt",
                    "unresolvedReferences", "unnamedDialogs"
                ))
            )
            if accessibility_ok:
                passed.append("basic accessibility semantics: named controls, images, dialogs and valid ARIA references")
            else:
                failures.append(f"basic accessibility semantics failed: {accessibility}")

            review_cards = page.locator("#engReviewStudio details.eng-review-card")
            if review_cards.count() == 4:
                review_cards.nth(0).locator("summary").press("Enter")
                if review_cards.nth(0).get_attribute("open") is not None:
                    passed.append("architecture review scenarios open by keyboard")
                else:
                    failures.append("architecture review details did not open with keyboard")
            else:
                failures.append(f"expected 4 architecture review scenarios, got {review_cards.count()}")

            page.keyboard.press("Control+k")
            if page.locator("#commandDialog").evaluate("el => el.open"):
                passed.append("command palette keyboard shortcut opens")
            else:
                failures.append("Ctrl+K did not open command palette")
            page.keyboard.press("Escape")
            if not page.locator("#commandDialog").evaluate("el => el.open"):
                passed.append("command palette closes with Escape")
            else:
                failures.append("command palette did not close with Escape")

            page.locator("#accessibilityTrigger").click()
            if page.locator("#accessibilityDialog").evaluate("el => el.open"):
                passed.append("accessibility dialog opens")
            else:
                failures.append("accessibility dialog did not open")
            page.locator("#accessibilityClose").click()

            initial_theme = page.locator("html").get_attribute("data-theme") or "dark"
            page.locator("#themeToggle").click()
            toggled_theme = page.locator("html").get_attribute("data-theme")
            architecture_background = page.locator(".arch-path-scroll").evaluate("el => ({background:getComputedStyle(el).backgroundColor, fill:getComputedStyle(el.querySelector('.arch-canvas-solid')).fill, pattern:!!el.querySelector('pattern')})")
            page.locator("#themeToggle").click()
            restored_theme = page.locator("html").get_attribute("data-theme")
            if toggled_theme != initial_theme and restored_theme == initial_theme:
                passed.append("theme control toggles and restores")
                if architecture_background["background"] != "rgba(0, 0, 0, 0)" and architecture_background["fill"] != "none" and not architecture_background["pattern"]:
                    passed.append("architecture diagram keeps a solid canvas in the alternate theme")
                else:
                    failures.append(f"architecture diagram alternate-theme background is not solid: {architecture_background}")
            else:
                failures.append("theme control did not toggle and restore correctly")

            page.locator('[data-system-stage="runtime"]').click()
            if "KUBERNETES RUNTIME" in page.locator("#engSystemDetailKicker").inner_text():
                passed.append("connected architecture stage selection updates detail")
            else:
                failures.append("connected architecture stage selection did not update detail")

            page.locator('[data-architecture-filter="cloud"]').click()
            status = page.locator("#architectureFilterStatus").inner_text()
            visible_cards = page.locator(".architecture-card:visible").count()
            if "cloud" in status.casefold() and visible_cards > 0:
                passed.append("architecture gallery filters by domain")
            else:
                failures.append(f"architecture filter failed: {status!r}, visible={visible_cards}")
            page.locator('[data-architecture-filter="all"]').click()

            # Architecture path drawing: semantic topology, reduced-motion fallback, staged replay and mobile canvas.
            architecture_mount = page.locator('[data-anim-mount="architecture"]')
            architecture_mount.scroll_into_view_if_needed()
            path_diagram = page.locator('[data-architecture-path]')
            if path_diagram.count() == 1:
                reduced_motion_state = path_diagram.evaluate("el => ({stages: el.querySelectorAll('[data-path-stage]').length, nodes: [...el.querySelectorAll('.arch-node')].filter(node => getComputedStyle(node).opacity === '1').length, labels: el.querySelectorAll('[data-stage-label]').length, packets: el.querySelectorAll('.arch-packet-motion').length, packetsHidden: [...el.querySelectorAll('.arch-flow-packet')].every(packet => getComputedStyle(packet).display === 'none'), noDotPattern: !el.querySelector('pattern, .arch-grid-dot'), solidCanvas: getComputedStyle(el.querySelector('.arch-path-scroll')).backgroundColor !== 'rgba(0, 0, 0, 0)'})")
                if reduced_motion_state == {"stages": 4, "nodes": 7, "labels": 4, "packets": 8, "packetsHidden": True, "noDotPattern": True, "solidCanvas": True}:
                    passed.append("architecture diagram exposes four ordered stages and seven nodes on a solid canvas with reduced motion")
                else:
                    failures.append(f"architecture diagram structure/reduced-motion state failed: {reduced_motion_state}")

                flow_contract = path_diagram.evaluate("el => { const paths = [...el.querySelectorAll('[data-flow]')]; const flow = Object.fromEntries(paths.map(path => [path.dataset.flow, {stage: path.closest('[data-path-stage]')?.dataset.pathStage, start: path.hasAttribute('marker-start'), end: path.hasAttribute('marker-end'), dashed: path.classList.contains('arch-path-edge--replication'), d: path.getAttribute('d')} ])); return {keys: Object.keys(flow).sort(), flow, technicalNote: el.querySelector('.arch-path-technical-note')?.textContent || '', microcopy: el.closest('.motion-panel')?.querySelector('.motion-microcopy')?.textContent || '', stages: [...el.querySelectorAll('[data-stage-label]')].map(item => item.innerText.replace(/\\s+/g,' ').trim())}; }")
                expected_flows = ['app-a-db-query-response','app-b-db-query-response','dns-answer','dns-query','edge-to-app-a','edge-to-app-b','https-request','primary-to-replica-target']
                semantics_ok = (
                    flow_contract['keys'] == expected_flows
                    and flow_contract['flow']['dns-query']['stage'] == '1'
                    and flow_contract['flow']['dns-answer']['stage'] == '1'
                    and flow_contract['flow']['https-request']['stage'] == '1'
                    and flow_contract['flow']['dns-query']['d'] == 'M145 420 V190'
                    and flow_contract['flow']['dns-answer']['d'] == 'M195 190 V420'
                    and flow_contract['flow']['https-request']['d'] == 'M280 470 H420'
                    and flow_contract['flow']['edge-to-app-a']['stage'] == '2'
                    and flow_contract['flow']['edge-to-app-b']['stage'] == '2'
                    and flow_contract['flow']['edge-to-app-a']['d'].startswith('M660')
                    and flow_contract['flow']['edge-to-app-b']['d'].startswith('M660')
                    and all(flow_contract['flow'][key]['start'] and flow_contract['flow'][key]['end'] for key in ('app-a-db-query-response','app-b-db-query-response'))
                    and flow_contract['flow']['primary-to-replica-target']['stage'] == '4'
                    and flow_contract['flow']['primary-to-replica-target']['dashed']
                    and flow_contract['flow']['primary-to-replica-target']['d'] == 'M1280 505 V675'
                    and 'does not proxy the HTTPS request' in flow_contract['technicalNote']
                    and 'one healthy replica' in flow_contract['technicalNote']
                    and 'Conceptual model only.' in flow_contract['microcopy']
                    and 'two application replicas share' not in flow_contract['microcopy']
                )
                if semantics_ok:
                    passed.append("architecture flow direction is explicit: DNS exchange, HTTPS ingress, one healthy replica, bidirectional database traffic, separate replication")
                else:
                    failures.append(f"architecture flow semantics failed: {flow_contract}")

                page.emulate_media(reduced_motion="no-preference")
                architecture_mount.locator('[data-arch-redraw]').click()
                page.wait_for_timeout(120)
                replay_state = path_diagram.evaluate("el => ({stage1: el.classList.contains('is-stage-1'), stage4: el.classList.contains('is-stage-4'), label: el.closest('.motion-panel').querySelector('[data-arch-status]').textContent})")
                if replay_state["stage1"] and not replay_state["stage4"] and "Stage 1" in replay_state["label"]:
                    passed.append("architecture path replay begins at ingress and advances in sequence")
                else:
                    failures.append(f"architecture sequence did not restart at stage one: {replay_state}")
                page.wait_for_function("document.querySelector('[data-architecture-path]')?.classList.contains('is-stage-2')", timeout=4000)
                packet_state = path_diagram.evaluate("el => [...el.querySelectorAll('[data-path-stage=\"2\"] .arch-packet-motion')].map(animation => animation.getStartTime())")
                if len(packet_state) == 2 and all(isinstance(start, (int, float)) for start in packet_state):
                    passed.append("request packets animate along both private-replica branches")
                else:
                    failures.append(f"request packet animation did not start: {packet_state}")
                page.wait_for_function("document.querySelector('[data-architecture-path]')?.closest('.motion-panel')?.querySelector('[data-arch-status]')?.textContent.includes('Complete')", timeout=6000)
                page.wait_for_timeout(150)
                final_path_state = path_diagram.evaluate("el => ({visibleNodes: [...el.querySelectorAll('.arch-node')].filter(node => getComputedStyle(node).opacity === '1').length, activeSteps: el.querySelectorAll('[data-stage-label].is-active').length, status: el.closest('.motion-panel').querySelector('[data-arch-status]').textContent})")
                if final_path_state["visibleNodes"] == 7 and final_path_state["activeSteps"] == 4 and "Complete" in final_path_state["status"]:
                    passed.append("architecture animation draws all seven nodes and completes all four stages")
                else:
                    failures.append(f"architecture animation did not complete cleanly: {final_path_state}")

                page.set_viewport_size({"width": 390, "height": 844})
                architecture_mount.scroll_into_view_if_needed()
                mobile_path_state = page.evaluate("() => ({viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth, canvas: document.querySelector('.arch-path-scroll').scrollWidth, canvasViewport: document.querySelector('.arch-path-scroll').clientWidth, hint: getComputedStyle(document.querySelector('.arch-path-scroll-hint')).display})")
                if mobile_path_state["page"] <= mobile_path_state["viewport"] and mobile_path_state["canvas"] > mobile_path_state["canvasViewport"] and mobile_path_state["hint"] != "none":
                    passed.append("architecture diagram scrolls within its mobile viewport without page overflow")
                else:
                    failures.append(f"architecture diagram mobile layout failed: {mobile_path_state}")
                # Restore reduced motion before the remaining long-page interaction
                # checks so unrelated reveal/chart animations cannot keep scheduling.
                page.emulate_media(reduced_motion="reduce")
                page.set_viewport_size({"width": 1440, "height": 1000})
            else:
                failures.append(f"expected one architecture path drawing, got {path_diagram.count()}")

            page.locator('[data-topic-launcher="pipeline"] .topic-card-trigger').click()
            page.locator("#topicDetailDialog").wait_for(state="visible")
            page.locator("#runPipeline").click()
            page.wait_for_function("document.querySelector('#pipelineRunMessage').textContent.toLowerCase().includes('illustrative run')", timeout=10000)
            if "illustrative run" in page.locator("#pipelineRunMessage").inner_text().casefold():
                passed.append("pipeline simulator completes and preserves its illustrative label")
            else:
                failures.append("pipeline simulator did not reach the expected illustrative completion state")
            page.locator("#failSecurityPipeline").click()
            page.wait_for_function("document.querySelector('#pipelineRunMessage').textContent.toLowerCase().includes('secure stage failed')", timeout=8000)
            states = page.locator("[data-pipeline-stage]").evaluate_all("nodes => nodes.map(node => node.querySelector('.pipeline-stage-state')?.textContent.trim())")
            if states and any("Blocked" in state for state in states):
                passed.append("pipeline security failure blocks downstream simulated stages")
            else:
                failures.append("pipeline failure gate did not block downstream stages")
            page.locator("#resetPipeline").click()
            page.locator("#topicDetailClose").click()

            # Kubernetes readiness: failure removes endpoint eligibility while the process remains running.
            page.locator("#simulatePodFailure").click()
            pod_failure = page.locator("#podRunMessage").inner_text().casefold()
            pod_process = page.locator('[data-pod-state="pod"] .pod-state-value').inner_text().strip()
            pod_endpoint = page.locator('[data-pod-state="endpoint"] .pod-state-value').inner_text().strip()
            if "still running" in pod_failure and pod_process == "Running" and "0 ready" in pod_endpoint:
                passed.append("Kubernetes readiness failure keeps the process running and removes the endpoint")
            else:
                failures.append(f"Kubernetes readiness failure state was inconsistent: {pod_failure!r}, {pod_process!r}, {pod_endpoint!r}")
            page.locator("#recoverPod").click()
            page.wait_for_function("document.querySelector('#podRunMessage')?.textContent.includes('Recovery verified')", timeout=5000)
            if page.locator('[data-pod-state="endpoint"] .pod-state-value').inner_text().strip() == "1 ready endpoint":
                passed.append("Kubernetes readiness recovery restores traffic eligibility")
            else:
                failures.append("Kubernetes readiness recovery did not restore one ready endpoint")
            page.locator("#resetPod").click()

            # SLO calculator and incident simulator: inputs change the budget; recovery does not erase history.
            slo_control = page.locator("#sloTarget")
            original_slo = slo_control.input_value()
            slo_control.select_option("99.5")
            page.wait_for_function("document.querySelector('#sloTargetOutput')?.textContent.trim() === '99.50%'", timeout=2000)
            if page.locator("#sloTargetOutput").inner_text().strip() == "99.50%":
                passed.append("SLO calculator recomputes its objective output from the selected objective")
            else:
                failures.append(f"SLO target did not update: {page.locator('#sloTargetOutput').inner_text()!r}")
            slo_control.select_option(original_slo)
            page.locator("#injectIncident").click()
            page.wait_for_function("Number(document.querySelector('#simFailures')?.textContent.replaceAll(',', '')) > 0 && document.querySelector('#simLatency')?.textContent.includes('320')", timeout=2500)
            if int(page.locator("#simFailures").inner_text().replace(",", "")) > 0 and "320" in page.locator("#simLatency").inner_text():
                passed.append("incident injection updates synthetic error counts and latency")
            else:
                failures.append("incident injection did not update the expected synthetic signals")
            page.locator("#recoverService").click()
            page.wait_for_function("document.querySelector('#simLatency')?.textContent.includes('86')", timeout=3000)
            page.wait_for_function("Number(document.querySelector('#simFailures')?.textContent.replaceAll(',', '')) > 0", timeout=2000)
            if int(page.locator("#simFailures").inner_text().replace(",", "")) > 0:
                passed.append("service recovery restores latency while retaining historical errors")
            else:
                failures.append("service recovery incorrectly erased historical error counts")
            page.locator("#resetSimulation").click()
            page.wait_for_function("document.querySelector('#simFailures')?.textContent.trim() === '0'", timeout=2500)
            if page.locator("#simFailures").inner_text().strip() == "0":
                passed.append("reliability simulation reset restores the baseline")
            else:
                failures.append("reliability simulation reset did not clear the synthetic error count")

            # FinOps and Terraform workbench controls must update values and lifecycle states.
            finops_control = page.locator("#finopsCompute")
            original_compute = finops_control.input_value()
            original_total = page.locator("#finopsTotal").inner_text().strip()
            finops_control.evaluate("el => { el.value = el.max; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }")
            if page.locator("#finopsTotal").inner_text().strip() != original_total and page.locator("#finopsComputeOutput").inner_text().strip() == "12,000":
                passed.append("FinOps estimator recalculates totals and component usage")
            else:
                failures.append("FinOps estimator did not recalculate after input change")
            finops_control.evaluate("(el, value) => { el.value = value; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }", original_compute)
            page.locator("#terraformSimComplete").click()
            if "COMPLETE" in page.locator("#terraformSimStatus").inner_text():
                passed.append("Terraform lifecycle simulator can complete its seven stages")
            else:
                failures.append("Terraform lifecycle simulator did not reach its complete state")
            page.locator("#terraformSimReset").click()
            if "STAGE 1 OF 7" in page.locator("#terraformSimStatus").inner_text():
                passed.append("Terraform lifecycle simulator resets to the first stage")
            else:
                failures.append("Terraform lifecycle simulator did not reset correctly")

            # Technology relationship map: selection, clear, and connection replay remain functional.
            technology_mount = page.locator('[data-anim-mount="technology"]')
            technology_mount.scroll_into_view_if_needed()
            technology_button = page.locator('[data-tech-select]').first
            if technology_button.count():
                tech_label = technology_button.inner_text().strip()
                technology_button.click()
                if technology_button.get_attribute("aria-pressed") == "true" and page.locator("[data-tech-title]").inner_text().strip() == tech_label:
                    passed.append("technology map selection highlights the chosen dependency")
                else:
                    failures.append("technology map selection did not update its accessible state")
                page.locator("[data-tech-clear]").click()
                if page.locator("[data-tech-title]").inner_text().strip() == "Choose a technology":
                    passed.append("technology map clear action restores its neutral state")
                else:
                    failures.append("technology map clear action did not reset its detail panel")
                page.locator("[data-tech-animate]").click()
                page.wait_for_function("document.querySelector('[data-tech-animation-status]')?.textContent.includes('Connections visible')", timeout=5000)
                passed.append("technology map connection drawing can be replayed to completion")
            else:
                failures.append("technology map has no selectable relationship nodes")

            # Command palette search and accessibility preferences are visitor-facing stateful controls.
            page.locator("#commandTrigger").click()
            page.locator("#commandSearch").fill("Explore Terraform")
            if page.locator("#commandResults .command-result").count() > 0:
                passed.append("command palette filters its action list by search query")
                page.locator("#commandSearch").press("Escape")
            else:
                failures.append("command palette returned no Terraform action for a matching query")
                page.keyboard.press("Escape")
            page.locator("#accessibilityTrigger").click()
            contrast_control = page.locator("#highContrastToggle")
            contrast_control.check()
            contrast_on = page.locator("html").get_attribute("data-contrast") == "high"
            contrast_control.uncheck()
            contrast_off = page.locator("html").get_attribute("data-contrast") == "normal"
            # Escape closes the modal reliably even after the page has traversed
            # distant sections and the high-contrast preference has reflowed it.
            page.keyboard.press("Escape")
            page.wait_for_function("!document.querySelector('#accessibilityDialog')?.open", timeout=3000)
            if contrast_on and contrast_off:
                passed.append("higher-contrast preference toggles on and restores cleanly")
            else:
                failures.append("higher-contrast preference did not apply and restore")

            # Progressive reveals must activate after normal navigation to distant sections.
            for selector, label in (("#delivery-model .section-heading", "delivery section"), ("#contact .contact-panel", "contact section")):
                reveal_target = page.locator(selector)
                reveal_target.scroll_into_view_if_needed()
                page.wait_for_function("selector => { const node = document.querySelector(selector); return Boolean(node && node.classList.contains('is-visible')); }", arg=selector, timeout=3000)
                if "is-visible" in (reveal_target.get_attribute("class") or ""):
                    passed.append(f"progressive reveal activates after navigation to the {label}")
                else:
                    failures.append(f"progressive reveal remained hidden in the {label}")

            for width, height in ((320, 800), (360, 800), (390, 844), (768, 900), (1024, 900), (1440, 1000)):
                page.set_viewport_size({"width": width, "height": height})
                page.wait_for_timeout(80)
                metrics = page.evaluate("({inner: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, body: document.body.scrollWidth})")
                if max(metrics["scroll"], metrics["body"]) > metrics["inner"] + 1:
                    failures.append(f"horizontal overflow at {width}px: {metrics}")
            if not any("horizontal overflow" in failure for failure in failures):
                passed.append("responsive layout has no page-level horizontal overflow at 320–1440px")

            # The actual section-navigation rail remains usable on a narrow viewport.
            page.set_viewport_size({"width": 390, "height": 844})
            section_link = page.locator(".section-nav a[data-nav][href='#cloud-infrastructure']")
            section_link.scroll_into_view_if_needed()
            section_link.click()
            page.wait_for_function("document.getElementById('cloud-infrastructure')?.getBoundingClientRect().top < window.innerHeight && [...document.querySelectorAll('[data-nav]')].some(link => link.getAttribute('href') === '#cloud-infrastructure' && link.classList.contains('active'))", timeout=6000)
            if section_link.get_attribute("aria-current") == "location" or "active" in (section_link.get_attribute("class") or ""):
                passed.append("mobile section navigation reaches its target and updates the active destination")
            else:
                failures.append("mobile section navigation did not update its active destination")

            for relative in (
                "documents/engineering-playbook/architecture-decision-records.md",
                "documents/engineering-playbook/security-threat-model-workbook.md",
                "documents/engineering-playbook/finops-capacity-review.md",
                "documents/engineering-playbook/incident-postmortem-template.md",
                "documents/engineering-playbook/engineering-quality-assurance.md",
            ):
                link = page.locator(f'a[href="{relative}"]').first
                if link.count() and (ROOT / relative).is_file():
                    passed.append(f"playbook link target exists: {Path(relative).name}")
                else:
                    failures.append(f"playbook link target missing: {relative}")

        except Exception as error:
            failures.append(f"browser test interrupted: {type(error).__name__}: {error}")
        finally:
            context.close()
            browser.close()

    failures.extend(f"page JavaScript error: {error}" for error in browser_errors)
    for item in passed:
        print(f"PASS: {item}")
    for item in failures:
        print(f"FAIL: {item}")
    print(f"RESULT: {len(passed)} passed; {len(failures)} failed")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
