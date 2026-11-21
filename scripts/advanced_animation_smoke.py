#!/usr/bin/env python3
"""Focused Chromium checks for the 26 advanced labs and 12 gallery animations."""
from __future__ import annotations

import os
import sys
sys.dont_write_bytecode = True
from playwright.sync_api import sync_playwright
from browser_smoke import standalone_document


def main() -> int:
    """Exercise all advanced lab models, controls, graph ordering, and narrow layouts."""
    passed: list[str] = []
    failed: list[str] = []
    errors: list[str] = []
    with sync_playwright() as playwright:
        launch = {"headless": True, "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
        executable = os.environ.get("CHROMIUM_PATH")
        if executable:
            launch["executable_path"] = executable
        browser = playwright.chromium.launch(**launch)
        context = browser.new_context(reduced_motion="reduce")
        page = context.new_page()
        page.set_default_timeout(5000)
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        # Every lab is tested through its public data-attribute controls, not private implementation hooks.
        try:
            page.set_content(standalone_document(), wait_until="load", timeout=30000)
            page.wait_for_function("document.querySelectorAll('[data-ea-lab]').length === 26", timeout=10000)
            labs = page.locator("[data-ea-lab]").count()
            gallery = page.locator("#architectureGalleryGrid [data-gallery-play]").count()
            if labs == 26 and gallery == 12:
                passed.append("26 purpose-specific labs and 12 architecture gallery controls mount")
            else:
                failed.append(f"inventory mismatch: {labs} labs / {gallery} gallery controls")

            visual_ids = page.locator('[data-ea-visual]').evaluate_all("els => els.map(el => el.dataset.eaVisual)")
            reused_rails = page.locator('.ea-packet-track, .ea-sequence-track, .ea-state-track').count()
            if len(visual_ids) == 26 and len(set(visual_ids)) == 26 and reused_rails == 0:
                passed.append("all 26 labs mount a unique visual model without shared horizontal progress rails")
            else:
                failed.append(f"visual grammar inventory mismatch: {len(visual_ids)} models / {len(set(visual_ids))} unique / {reused_rails} shared rails")

            theme_card = page.locator('[data-ea-lab="linux-process"]')
            dark_surface = theme_card.evaluate("el => getComputedStyle(el).backgroundColor")
            page.locator('#themeToggle').click()
            light_surface = theme_card.evaluate("el => getComputedStyle(el).backgroundColor")
            light_text = theme_card.evaluate("el => getComputedStyle(el).color")
            page.locator('#themeToggle').click()
            if dark_surface != light_surface and light_surface != 'rgba(0, 0, 0, 0)' and light_text != 'rgba(0, 0, 0, 0)':
                passed.append("advanced animation cards adapt their surfaces and text to both themes")
            else:
                failed.append(f"advanced animation theme adaptation failed: {dark_surface} / {light_surface} / {light_text}")

            for selector in ("[data-ea-action=play]", "[data-ea-action=pause]", "[data-ea-action=step]", "[data-ea-action=reset]"):
                count = page.locator(f"[data-ea-lab] {selector}").count()
                if count == 26:
                    passed.append(f"all 26 labs expose {selector.removeprefix('[data-ea-action=').rstrip(']')} control")
                else:
                    failed.append(f"expected 26 instances of {selector}; got {count}")

            state = page.locator('[data-ea-lab="linux-process"]')
            state.locator('[data-ea-action=step]').click()
            if state.locator('[data-ea-state].is-current').get_attribute("data-ea-state") == "0":
                passed.append("Linux process state machine advances to Created")
            else:
                failed.append("Linux process state machine did not advance to Created")
            state.locator('[data-ea-action=reset]').click()
            if state.locator('[data-ea-state].is-current').count() == 0:
                passed.append("state machine reset clears the active state")
            else:
                failed.append("state machine reset did not clear the active state")
            for _ in range(4):
                state.locator('[data-ea-action=step]').click()
            waiting_branch = state.locator('[data-ea-state="3"].is-current').count() == 1 and state.locator('[data-ea-edge-step="3"].is-current').count() == 1
            state.locator('[data-ea-action=step]').click()
            ready_return = state.locator('[data-ea-state="1"].is-current').count() == 1
            if waiting_branch and ready_return:
                passed.append("Linux process model highlights the Waiting branch and returns to Ready after the event")
            else:
                failed.append("Linux process model did not render the Waiting → Ready return transition")
            state.locator('[data-ea-action=reset]').click()

            sequence = page.locator('[data-ea-lab="network-journey"]')
            if sequence.locator('.ea-protocol-stack .ea-protocol-layer').count() == 6 and sequence.locator('.ea-protocol-foot').count() == 1:
                passed.append("network journey uses a six-layer vertical protocol stack, not a step-card rail")
            else:
                failed.append("network protocol stack structure is incomplete")
            api = page.locator('[data-ea-lab="api-lifecycle"]')
            if api.locator('.ea-api-cache-decision').count() == 1 and api.locator('.ea-api-cache-branches > div').count() == 2 and api.locator('.ea-api-return').count() == 1:
                passed.append("API lifecycle models optional cache hit/miss and the upward response unwind")
            else:
                failed.append("API call-stack decision and response structure is incomplete")
            sequence.locator('[data-ea-action=step]').click()
            if sequence.locator('[data-ea-step].is-current').get_attribute("data-ea-step") == "0":
                passed.append("sequence engine advances and highlights the active protocol hop")
            else:
                failed.append("sequence engine did not highlight its first protocol hop")

            # Reduced-motion Play advances exactly one step and never starts a timer.
            sequence.locator('[data-ea-action=reset]').click()
            sequence.locator('[data-ea-action=play]').click()
            reduced_index = sequence.get_attribute('data-index')
            page.wait_for_timeout(1000)
            if reduced_index == "0" and sequence.get_attribute('data-index') == reduced_index:
                passed.append("reduced-motion Play performs one explicit step without autoplay")
            else:
                failed.append("reduced-motion Play started continuous autoplay")

            # With motion enabled, Play advances automatically and Pause freezes the current step.
            page.emulate_media(reduced_motion='no-preference')
            sequence.locator('[data-ea-action=reset]').click()
            sequence.locator('[data-ea-action=play]').click()
            page.wait_for_function("Number(document.querySelector('[data-ea-lab=network-journey]').dataset.index) >= 1", timeout=3000)
            sequence.locator('[data-ea-action=pause]').click()
            paused_index = sequence.get_attribute('data-index')
            page.wait_for_timeout(1000)
            if paused_index == sequence.get_attribute('data-index') and sequence.locator('[data-ea-action=pause]').is_disabled():
                passed.append("animated Play advances and Pause freezes the sequence at its current step")
            else:
                failed.append("animated sequence did not retain its position after Pause")
            sequence.locator('[data-ea-action=reset]').click()
            page.emulate_media(reduced_motion='reduce')

            git_history = page.locator('[data-ea-lab="git-branching"]')
            if git_history.locator('.ea-git-history .ea-git-node').count() == 6 and git_history.locator('.ea-git-branch-label').count() == 2:
                passed.append("Git history uses distinct main/feature lanes and a two-parent merge node")
            else:
                failed.append("Git history does not expose its dedicated branch-lane visual grammar")

            graph = page.locator('[data-ea-lab="terraform-graph"]')
            graph.locator('[data-ea-action=step]').click()
            if graph.locator('[data-ea-node].is-current').count() == 1:
                passed.append("DAG engine advances one node using topological ordering")
            else:
                failed.append("DAG engine did not highlight exactly one node")
            graph_geometry = graph.locator("svg").evaluate("svg => [...svg.querySelectorAll('.ea-graph-node')].every(node => { const box=node.getBBox(); const vb=svg.viewBox.baseVal; return box.x>=0 && box.y>=0 && box.x+box.width<=vb.width && box.y+box.height<=vb.height; })")
            if graph_geometry:
                passed.append("dependency graph nodes remain inside their SVG viewBox")
            else:
                failed.append("one or more dependency graph nodes are clipped by the SVG viewBox")
            graph.locator('[data-ea-action=reset]').click()
            for _ in range(graph.locator('[data-ea-node]').count()):
                graph.locator('[data-ea-action=step]').click()
            if graph.locator('[data-ea-node].is-visited').count() == graph.locator('[data-ea-node]').count():
                passed.append("dependency graph completes every node in a dependency-safe order")
            else:
                failed.append("dependency graph did not visit every node")

            route = page.locator('[data-ea-lab="vpc-routing"]')
            route.locator('[data-ea-input=destination]').select_option("10.20.4.25")
            local_route = "local" in route.locator('[data-ea-result]').inner_text()
            route.locator('[data-ea-input=destination]').select_option("10.30.2.15")
            transit_route = "transit gateway" in route.locator('[data-ea-result]').inner_text()
            route.locator('[data-ea-input=destination]').select_option("8.8.8.8")
            default_route = "0.0.0.0/0" in route.locator('[data-ea-result]').inner_text() and "NAT gateway" in route.locator('[data-ea-result]').inner_text()
            if local_route and transit_route and default_route:
                passed.append("VPC evaluator matches local, connected, and default NAT routes by longest prefix")
            else:
                failed.append("VPC longest-prefix route outcomes are incorrect")

            policy = page.locator('[data-ea-lab="network-policy"]')
            policy.locator('[data-ea-input=source]').select_option("198.51.100.12")
            policy.locator('[data-ea-input=destination]').select_option("10.20.3.10")
            denied = "DENY" in policy.locator('[data-ea-result]').inner_text()
            policy.locator('[data-ea-input=source]').select_option("10.20.1.25")
            allowed = "ALLOW" in policy.locator('[data-ea-result]').inner_text()
            policy.locator('[data-ea-input=protocol]').select_option("UDP")
            protocol_denied = "DENY" in policy.locator('[data-ea-result]').inner_text()
            if denied and allowed and protocol_denied:
                passed.append("ordered NACL model allows only matching app-to-data traffic and denies source, destination, and protocol mismatches")
            else:
                failed.append("ordered NACL model did not enforce its allow/default-deny rules")

            dr = page.locator('[data-ea-lab="disaster-recovery"]')
            dr.locator('[data-ea-input=lag]').evaluate("(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}", "45")
            rpo_failed = "RPO MISSED" in dr.locator('[data-ea-result]').inner_text()
            dr.locator('[data-ea-input=lag]').evaluate("(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}", "2")
            rpo_met = "RPO MET" in dr.locator('[data-ea-result]').inner_text()
            if rpo_failed and rpo_met:
                passed.append("recovery calculator evaluates RPO independently from RTO")
            else:
                failed.append("recovery objective evaluation failed")

            drift = page.locator('[data-ea-lab="terraform-drift"]')
            drift.locator('[data-ea-input=drift]').uncheck()
            if "No drift" in drift.locator('[data-ea-result]').inner_text():
                passed.append("Terraform drift toggle recomputes the plan explanation")
            else:
                failed.append("Terraform drift toggle did not recompute the plan")

            ansible = page.locator('[data-ea-lab="ansible-converge"]')
            ansible.locator('[data-ea-action=converge]').click()
            first_run = "changed=2" in ansible.locator('[data-ea-result]').inner_text()
            ansible.locator('[data-ea-action=converge]').click()
            second_run = "changed=0" in ansible.locator('[data-ea-result]').inner_text()
            if first_run and second_run:
                passed.append("Ansible first run changes state and second run is idempotent")
            else:
                failed.append("Ansible convergence did not demonstrate changed then no-change runs")

            deployment = page.locator('[data-ea-lab="deployment-strategy"]')
            deployment.locator('[data-ea-input=strategy]').select_option("canary")
            if "Canary" in deployment.locator('[data-ea-result]').inner_text():
                passed.append("deployment strategy explorer switches to canary semantics")
            else:
                failed.append("deployment strategy selector did not switch behavior")

            pod = page.locator('[data-ea-lab="pod-lifecycle"]')
            pod.locator('[data-ea-action=pod-failure]').click()
            pod_failure = "ImagePullBackOff" in pod.locator('[data-ea-result]').inner_text()
            pod.locator('[data-ea-action=pod-retry]').click()
            pod_recovered = "readiness is false" in pod.locator('[data-ea-result]').inner_text()
            if pod_failure and pod_recovered:
                passed.append("Pod lifecycle failure injection and retry preserve readiness distinctions")
            else:
                failed.append("Pod lifecycle failure or retry behavior failed")

            scheduler = page.locator('[data-ea-lab="k8s-scheduler"]')
            scheduler.locator('[data-ea-input=cpu]').evaluate("(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}", "6")
            scheduler.locator('[data-ea-input=memory]').evaluate("(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}", "12")
            if "no eligible node" in scheduler.locator('[data-ea-result]').inner_text():
                passed.append("scheduler filter rejects resource requests that fit no eligible node")
            else:
                failed.append("scheduler filter accepted an oversized workload")

            endpoints = page.locator('[data-ea-lab="service-routing"]')
            endpoints.locator('[data-ea-input=endpoint-a]').uncheck()
            endpoints.locator('[data-ea-action=route-request]').click()
            if "Pod B" in endpoints.locator('[data-ea-result]').inner_text():
                passed.append("Service routing excludes non-ready endpoints")
            else:
                failed.append("Service routing selected a non-ready endpoint")
            endpoints.locator('[data-ea-input=endpoint-b]').uncheck()
            if endpoints.locator('.ea-endpoint-pod.is-selected').count() == 0 and "No ready endpoints" in endpoints.locator('[data-ea-result]').inner_text():
                passed.append("Service routing clears a selected Pod when it loses readiness")
            else:
                failed.append("Service routing retained an ineligible selected endpoint")

            rollout = page.locator('[data-ea-lab="rolling-update"]')
            rollout.locator('[data-ea-input=replicas]').select_option("5")
            if "5 desired replicas" in rollout.locator('[data-ea-result]').inner_text():
                passed.append("rolling update model accepts and describes the desired replica count")
            else:
                failed.append("rolling update model did not update its replica assumptions")

            gitops = page.locator('[data-ea-lab="gitops-reconcile"]')
            gitops.locator('[data-ea-action=gitops-drift]').click()
            detected = "Drift detected" in gitops.locator('[data-ea-result]').inner_text()
            gitops.locator('[data-ea-action=gitops-sync]').click()
            aligned = "aligned" in gitops.locator('[data-ea-result]').inner_text()
            if detected and aligned:
                passed.append("GitOps lab detects drift and restores desired/live alignment")
            else:
                failed.append("GitOps drift/reconcile actions failed")

            slo = page.locator('[data-ea-lab="slo-burn"]')
            slo.locator('[data-ea-input=availability]').evaluate("(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}", "99.8")
            if "Burn rate" in slo.locator('[data-ea-result]').inner_text():
                passed.append("SLO lab recalculates error-budget burn rate from availability")
            else:
                failed.append("SLO burn-rate calculation did not update")

            correlation = page.locator('[data-ea-lab="telemetry-correlation"]')
            correlation.locator('[data-ea-input=traceid]').fill("trace-test-123")
            no_match = (
                "No synthetic log events or spans match trace_id=trace-test-123" in correlation.locator('[data-ea-result]').inner_text()
                and correlation.locator('.ea-log-event:not(.is-correlation-hidden)').count() == 0
                and correlation.locator('.ea-span-row:not(.is-correlation-hidden)').count() == 0
                and correlation.locator('.ea-span-node:not(.is-correlation-hidden)').count() == 0
                and correlation.locator('.ea-latency-sample.is-exemplar.is-correlation-hidden').count() == 1
                and not correlation.locator('[data-ea-correlation-empty-logs]').is_hidden()
                and not correlation.locator('[data-ea-correlation-empty-spans]').is_hidden()
                and correlation.locator('[data-ea-trace-copy]').first.inner_text() == "trc-8f31a2"
            )
            correlation.locator('[data-ea-input=traceid]').fill("trc-8f31a2")
            restored = (
                "4 structured log events and 4 distributed spans match" in correlation.locator('[data-ea-result]').inner_text()
                and correlation.locator('[data-trace-context]').inner_text() == "trace_id = trc-8f31a2"
                and correlation.locator('.ea-log-event:not(.is-correlation-hidden)').count() == 4
                and correlation.locator('.ea-span-row:not(.is-correlation-hidden)').count() == 4
                and correlation.locator('.ea-span-node:not(.is-correlation-hidden)').count() == 4
                and correlation.locator('.ea-latency-sample.is-exemplar.is-correlation-hidden').count() == 0
            )
            if no_match and restored:
                passed.append("telemetry filter returns true zero-match results and restores only records with the actual sample trace ID")
            else:
                failed.append("telemetry filter relabeled records or failed to restore matching trace data")

            telemetry_grid = correlation.locator('xpath=..')
            grid_width = telemetry_grid.evaluate("el=>el.getBoundingClientRect().width")
            card_width = correlation.evaluate("el=>el.getBoundingClientRect().width")
            workspace_columns = correlation.locator('.ea-telemetry-workspace').evaluate("el=>getComputedStyle(el).gridTemplateColumns.split(' ').length")
            if card_width >= grid_width * 0.97 and workspace_columns == 2:
                passed.append("observability lab spans the full gallery width and uses a balanced two-panel investigation layout")
            else:
                failed.append(f"observability wide layout incomplete: card {card_width}px / grid {grid_width}px / columns {workspace_columns}")

            if (
                correlation.locator('.ea-latency-sample').count() == 12
                and correlation.locator('.ea-log-event').count() == 4
                and correlation.locator('.ea-span-row').count() == 4
                and correlation.locator('.ea-correlation-bridge').count() == 1
            ):
                passed.append("observability workspace renders 12 metric samples, four filtered events, and a four-span waterfall")
            else:
                failed.append("observability investigation is missing metric, log, span, or correlation structures")

            correlation.locator('[data-ea-action=reset]').click()
            for _ in range(9):
                correlation.locator('[data-ea-action=step]').click()
            active_span = correlation.locator('.ea-span-row.is-current')
            root_context = (
                correlation.locator('[data-ea-active-service]').inner_text() == "API gateway"
                and correlation.locator('[data-ea-active-span]').inner_text() == "sp-01"
                and correlation.locator('[data-ea-parent-span]').inner_text() == "—"
            )
            if active_span.count() == 1 and "Root request span" in correlation.locator('[data-ea-trace-insight]').inner_text() and root_context:
                passed.append("telemetry playback activates the root waterfall span and its live context inspector")
            else:
                failed.append("telemetry playback did not populate the active root span context")
            correlation.locator('[data-ea-action=step]').click()
            child_context = (
                correlation.locator('[data-ea-active-service]').inner_text() == "Catalog service"
                and correlation.locator('[data-ea-active-span]').inner_text() == "sp-02"
                and correlation.locator('[data-ea-parent-span]').inner_text() == "sp-01"
            )
            if child_context and correlation.locator('.ea-span-node.is-current').count() == 1:
                passed.append("trace context inspector follows parent-child span selection")
            else:
                failed.append("trace parent-child context did not advance to the Catalog child span")
            correlation.locator('[data-ea-action=reset]').click()

            oidc = page.locator('[data-ea-lab="oidc-journey"]')
            oidc.locator('[data-ea-input=issuer]').uncheck()
            issuer_denied = "rejects the token" in oidc.locator('[data-ea-result]').inner_text()
            oidc.locator('[data-ea-input=issuer]').check()
            oidc.locator('[data-ea-input=audience]').uncheck()
            audience_denied = "rejects the token" in oidc.locator('[data-ea-result]').inner_text()
            oidc.locator('[data-ea-input=audience]').check()
            oidc.locator('[data-ea-input=subject]').uncheck()
            subject_denied = "rejects the token" in oidc.locator('[data-ea-result]').inner_text()
            if issuer_denied and audience_denied and subject_denied:
                passed.append("OIDC trust model rejects an untrusted issuer, mismatched audience, and disallowed subject")
            else:
                failed.append("OIDC trust model did not enforce all three trust conditions")

            threat = page.locator('[data-ea-lab="threat-model"]')
            threat.locator('[data-ea-input=stride]').select_option("D")
            if "Denial of service" in threat.locator('[data-ea-result]').inner_text():
                passed.append("STRIDE model changes its threat prompt by category")
            else:
                failed.append("STRIDE selector did not update the threat prompt")

            supply = page.locator('[data-ea-lab="supply-chain"]')
            supply.locator('[data-ea-input=failure]').select_option("sign")
            if "blocked" in supply.locator('[data-ea-result]').inner_text():
                passed.append("supply-chain signature failure blocks the modeled admission gate")
            else:
                failed.append("supply-chain failure did not block the modeled admission gate")
            for _ in range(5):
                supply.locator('[data-ea-action=step]').click()
            if "BLOCKED AT SIGN" in supply.locator('[data-ea-status]').inner_text():
                passed.append("supply-chain sequence stops at the injected signature gate and blocks downstream steps")
            else:
                failed.append("supply-chain step sequence did not stop at the failed gate")

            cost = page.locator('[data-ea-lab="cloud-cost"]')
            cost.locator('[data-ea-input=compute]').evaluate("(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}", "3000")
            if "$212.50" in cost.locator('[data-ea-result]').inner_text():
                passed.append("FinOps calculator recomputes its explicitly illustrative rates")
            else:
                failed.append(f"FinOps estimate incorrect: {cost.locator('[data-ea-result]').inner_text()}")

            rightsizing = page.locator('[data-ea-lab="rightsizing"]')
            rightsizing.locator('[data-ea-input=profile]').select_option("memory")
            tight_gauges = rightsizing.locator('.ea-resource-gauge.is-tight').count() == 1
            if "Memory-heavy cache" in rightsizing.locator('[data-ea-result]').inner_text() and tight_gauges:
                passed.append("rightsizing profile recalculates its capacity analysis and flags a tight memory envelope")
            else:
                failed.append("rightsizing profile did not update its analysis or highlight constrained headroom")

            gallery_button = page.locator('#architectureGalleryGrid [data-gallery-play]').first
            gallery_button.click()
            reduced_status = gallery_button.locator("xpath=following-sibling::*[1]").inner_text()
            if "reduced motion" in reduced_status:
                passed.append("architecture gallery preserves a static flow under reduced motion")
            else:
                failed.append("architecture gallery reduced-motion fallback did not activate")
            page.emulate_media(reduced_motion="no-preference")
            gallery_button.click()
            if page.locator('#architectureGalleryGrid .architecture-card.is-flow-drawing').count() == 1:
                passed.append("architecture gallery per-card draw animation activates when motion is allowed")
            else:
                failed.append("architecture gallery draw button did not activate its card")
            page.wait_for_function("document.querySelector('#architectureGalleryGrid .ea-gallery-status')?.textContent.includes('Flow complete')", timeout=3000)
            passed.append("architecture gallery animation completes and exposes a replay state")

            # The new lab panels and graph canvases must not widen the document.
            for width in (320, 390, 768, 1440):
                page.set_viewport_size({"width": width, "height": 900})
                page.wait_for_timeout(40)
                metrics = page.evaluate("({inner:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth})")
                if max(metrics["scroll"], metrics["body"]) <= metrics["inner"] + 1:
                    passed.append(f"advanced labs keep page width contained at {width}px")
                else:
                    failed.append(f"advanced labs create horizontal overflow at {width}px: {metrics}")
                visual_overflow = page.locator('[data-ea-lab]').evaluate_all("cards=>cards.map(card=>{const visual=card.querySelector('.ea-visual');return {id:card.dataset.eaLab,scroll:visual.scrollWidth,client:visual.clientWidth}}).filter(item=>item.scroll>item.client+1)")
                if not visual_overflow:
                    passed.append(f"all 26 model canvases fit their cards at {width}px")
                else:
                    failed.append(f"model canvases overflow their cards at {width}px: {visual_overflow}")

        except Exception as error:
            failed.append(f"advanced browser test interrupted: {type(error).__name__}: {error}")
        finally:
            context.close()
            browser.close()

    failed.extend(f"browser error: {error}" for error in errors)
    for message in passed:
        print(f"PASS: {message}")
    for message in failed:
        print(f"FAIL: {message}")
    print(f"RESULT: {len(passed)} passed; {len(failed)} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
