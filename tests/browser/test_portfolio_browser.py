"""Browser-level regression tests for the static portfolio.

The suite starts a short-lived local HTTP server, so it does not need a build
step or a manually started web server. Chromium is installed separately with
`python -m playwright install chromium`.
"""
from __future__ import annotations

import json
import os
import threading
import unittest
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import Browser, BrowserContext, Page, expect, sync_playwright

ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS = Path(os.environ.get("PORTFOLIO_TEST_ARTIFACTS", ROOT / "test-results" / "browser"))


class QuietStaticHandler(SimpleHTTPRequestHandler):
    """Serve repository files without noisy access logs in test output."""

    def log_message(self, fmt: str, *args: object) -> None:
        return


class PortfolioBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.server = ThreadingHTTPServer(
            ("127.0.0.1", 0), partial(QuietStaticHandler, directory=str(ROOT))
        )
        cls.server.daemon_threads = True
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_port}"

        cls.playwright = sync_playwright().start()
        chromium_path = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
        cls.browser: Browser = cls.playwright.chromium.launch(
            headless=True,
            executable_path=chromium_path or None,
        )

    @classmethod
    def tearDownClass(cls) -> None:
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.server_thread.join(timeout=3)

    def setUp(self) -> None:
        self.context: BrowserContext = self.browser.new_context(
            viewport={"width": 1365, "height": 900},
            color_scheme="dark",
            reduced_motion="reduce",
        )
        # External fonts are an enhancement, not a runtime requirement. Block
        # them so CI verifies the system-font fallback and does not depend on a
        # third-party font CDN being reachable.
        self.context.route("https://fonts.googleapis.com/**", lambda route: route.abort())
        self.context.route("https://fonts.gstatic.com/**", lambda route: route.abort())
        self.page: Page = self.context.new_page()
        self.page_errors: list[str] = []
        self.failed_local_requests: list[str] = []
        self.bad_local_responses: list[str] = []
        self.page.on("pageerror", lambda error: self.page_errors.append(str(error)))
        self.page.on("requestfailed", self._record_failed_request)
        self.page.on("response", self._record_bad_response)

        response = self.page.goto(f"{self.base_url}/", wait_until="load", timeout=15000)
        self.assertIsNotNone(response, "The portfolio homepage did not return a response.")
        self.assertEqual(response.status, 200, "The portfolio homepage did not return HTTP 200.")

    def tearDown(self) -> None:
        result = getattr(getattr(self, "_outcome", None), "result", None)
        already_failed = False
        if result is not None:
            already_failed = any(
                test == self
                for test, _ in list(result.failures) + list(result.errors)
            )

        if already_failed:
            self._write_failure_artifacts()
        else:
            try:
                self.assertEqual(self.page_errors, [], "Uncaught browser JavaScript exception(s).")
                self.assertEqual(
                    self.failed_local_requests,
                    [],
                    "Local resource request(s) failed. Check the URL paths and server logs.",
                )
                self.assertEqual(
                    self.bad_local_responses,
                    [],
                    "Local resource(s) returned an HTTP error.",
                )
            except AssertionError:
                self._write_failure_artifacts()
                raise
        self.context.close()

    def _is_local_url(self, url: str) -> bool:
        return urlsplit(url).netloc == urlsplit(self.base_url).netloc

    def _record_failed_request(self, request) -> None:
        if self._is_local_url(request.url):
            self.failed_local_requests.append(f"{request.method} {request.url}: {request.failure}")

    def _record_bad_response(self, response) -> None:
        if self._is_local_url(response.url) and response.status >= 400:
            self.bad_local_responses.append(f"HTTP {response.status}: {response.url}")

    def _write_failure_artifacts(self) -> None:
        """Keep a screenshot and diagnostic summary for GitHub Actions artifacts."""
        try:
            ARTIFACTS.mkdir(parents=True, exist_ok=True)
            stem = self._testMethodName
            self.page.screenshot(path=str(ARTIFACTS / f"{stem}.png"), full_page=True, timeout=8000)
            diagnostics = {
                "test": self.id(),
                "url": self.page.url,
                "page_errors": self.page_errors,
                "failed_local_requests": self.failed_local_requests,
                "bad_local_responses": self.bad_local_responses,
            }
            (ARTIFACTS / f"{stem}.json").write_text(
                json.dumps(diagnostics, indent=2), encoding="utf-8"
            )
        except Exception as exc:  # Do not hide the original test failure.
            print(f"Unable to collect browser failure artifacts: {exc}")

    def test_home_and_observability_case_study_load_without_runtime_errors(self) -> None:
        self.assertIn("MD SHOHAN", self.page.title())
        self.assertEqual(self.page.locator("h1").count(), 1)
        self.assertTrue(self.page.locator("#main").is_visible())
        self.assertTrue(self.page.locator("#heroTitle").is_visible())

        response = self.page.goto(
            f"{self.base_url}/projects/observability-lab/index.html", wait_until="load"
        )
        self.assertIsNotNone(response)
        self.assertEqual(response.status, 200)
        self.assertIn("Platform Observability Lab", self.page.title())
        self.assertTrue(self.page.get_by_role("heading", level=1).is_visible())
        self.assertTrue(self.page.get_by_role("link", name="Read the rendered guide").is_visible())
        self.assertTrue(self.page.locator("link[rel='stylesheet']").count() >= 1)

    def test_responsive_layout_has_no_horizontal_page_overflow(self) -> None:
        for width in (320, 360, 390, 430, 560, 640, 768, 1024, 1440):
            with self.subTest(viewport_width=width):
                self.page.set_viewport_size({"width": width, "height": 850})
                self.page.evaluate(
                    "() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))"
                )
                dimensions = self.page.evaluate(
                    "() => ({ viewport: document.documentElement.clientWidth, "
                    "document: document.documentElement.scrollWidth, "
                    "body: document.body.scrollWidth })"
                )
                self.assertLessEqual(
                    dimensions["document"], dimensions["viewport"] + 1,
                    f"Horizontal document overflow at {width}px: {dimensions}",
                )

    def test_mobile_header_controls_fit_and_desktop_cta_stays_hidden(self) -> None:
        for width in (320, 360, 390, 430, 560, 640, 768):
            with self.subTest(viewport_width=width):
                self.page.set_viewport_size({"width": width, "height": 844})
                self.page.evaluate(
                    "() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))"
                )
                geometry = self.page.evaluate("""() => {
                  const box = (selector) => {
                    const element = document.querySelector(selector);
                    const rect = element.getBoundingClientRect();
                    return {
                      left: rect.left, right: rect.right, width: rect.width,
                      visible: !!(rect.width && rect.height) && getComputedStyle(element).display !== 'none'
                    };
                  };
                  return {
                    viewport: document.documentElement.clientWidth,
                    header: box('.site-header'), brand: box('.site-header .brand'),
                    actions: box('.site-header .header-actions'),
                    command: box('#commandTrigger'), theme: box('#themeToggle'),
                    menu: box('#menuToggle'), cta: box('.site-header .header-cta')
                  };
                }""")
                self.assertTrue(geometry["menu"]["visible"], f"Mobile menu is not visible: {geometry}")
                self.assertFalse(geometry["cta"]["visible"], f"Desktop GitHub CTA should be hidden on mobile: {geometry}")
                self.assertLessEqual(geometry["header"]["right"], geometry["viewport"] + 1, geometry)
                self.assertLessEqual(geometry["actions"]["right"], geometry["header"]["right"] + 1, geometry)
                self.assertGreaterEqual(geometry["menu"]["left"], geometry["header"]["left"], geometry)
                self.assertLessEqual(geometry["menu"]["right"], geometry["header"]["right"] + 1, geometry)
                self.assertLessEqual(geometry["brand"]["right"], geometry["actions"]["left"] + 1, geometry)

    def test_theme_muted_text_tokens_meet_normal_text_contrast(self) -> None:
        def luminance(hex_color: str) -> float:
            value = hex_color.lstrip("#")
            channels = [int(value[i:i + 2], 16) / 255 for i in (0, 2, 4)]
            linear = [channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4 for channel in channels]
            return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]

        def contrast(first: str, second: str) -> float:
            light, dark = sorted((luminance(first), luminance(second)), reverse=True)
            return (light + 0.05) / (dark + 0.05)

        root = self.page.locator("html")
        for theme in ("dark", "light"):
            with self.subTest(theme=theme):
                root.evaluate("(element, value) => element.dataset.theme = value", theme)
                tokens = root.evaluate("""element => {
                  const styles = getComputedStyle(element);
                  return {
                    background: styles.getPropertyValue('--bg').trim(),
                    muted: styles.getPropertyValue('--muted').trim(),
                    faint: styles.getPropertyValue('--faint').trim()
                  };
                }""")
                for name in ("muted", "faint"):
                    ratio = contrast(tokens[name], tokens["background"])
                    self.assertGreaterEqual(
                        ratio, 4.5,
                        f"{theme} theme token --{name} has {ratio:.2f}:1 contrast against --bg",
                    )

    def test_observability_page_layout_and_primary_navigation_at_mobile_widths(self) -> None:
        response = self.page.goto(f"{self.base_url}/projects/observability-lab/index.html", wait_until="load")
        self.assertIsNotNone(response)
        self.assertEqual(response.status, 200)
        for width in (320, 390, 560, 768, 1024):
            with self.subTest(viewport_width=width):
                self.page.set_viewport_size({"width": width, "height": 844})
                self.page.evaluate(
                    "() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))"
                )
                dimensions = self.page.evaluate("""() => ({
                  viewport: document.documentElement.clientWidth,
                  document: document.documentElement.scrollWidth,
                  header: document.querySelector('.site-header').getBoundingClientRect().toJSON(),
                  title: document.querySelector('h1').getBoundingClientRect().toJSON()
                })""")
                self.assertLessEqual(dimensions["document"], dimensions["viewport"] + 1, dimensions)
                self.assertLessEqual(dimensions["header"]["right"], dimensions["viewport"] + 1, dimensions)
        self.assertTrue(self.page.get_by_role("link", name="Read the rendered guide").is_visible())

    def test_mobile_navigation_opens_and_closes_after_navigation(self) -> None:
        self.page.set_viewport_size({"width": 390, "height": 844})
        menu = self.page.locator("#menuToggle")
        nav = self.page.locator("#mobileNav")
        self.assertTrue(menu.is_visible(), "Mobile menu button should be visible on a narrow viewport.")
        self.assertTrue(nav.evaluate("element => element.hidden"))

        menu.click()
        self.assertEqual(menu.get_attribute("aria-expanded"), "true")
        self.assertFalse(nav.evaluate("element => element.hidden"))
        nav.get_by_role("link", name="About").click()
        self.assertTrue(nav.evaluate("element => element.hidden"))
        self.assertEqual(menu.get_attribute("aria-expanded"), "false")
        self.assertEqual(urlsplit(self.page.url).fragment, "about")

    def test_theme_toggle_persists_and_updates_its_accessible_name(self) -> None:
        root = self.page.locator("html")
        toggle = self.page.locator("#themeToggle")
        self.assertEqual(root.get_attribute("data-theme"), "dark")

        toggle.click()
        self.assertEqual(root.get_attribute("data-theme"), "light")
        self.assertEqual(toggle.get_attribute("aria-label"), "Switch to dark monochrome theme")
        self.page.reload(wait_until="load")
        self.assertEqual(root.get_attribute("data-theme"), "light")

    def test_command_palette_search_and_keyboard_activation(self) -> None:
        self.page.keyboard.press("Control+k")
        dialog = self.page.locator("#commandDialog")
        self.assertTrue(dialog.evaluate("element => element.open"))

        search = self.page.locator("#commandSearch")
        search.fill("Show Golden-path projects")
        results = self.page.locator("#commandResults .command-result")
        self.assertEqual(results.count(), 1)
        self.assertIn("Show Golden-path projects", results.first.inner_text())
        search.press("Enter")

        self.assertFalse(dialog.evaluate("element => element.open"))
        golden_path_filter = self.page.locator('[data-filter="golden-path"]')
        expect(golden_path_filter).to_have_attribute("aria-pressed", "true", timeout=3000)
        expect(self.page.locator('.project-card[data-category]:visible')).to_have_count(2, timeout=3000)

    def test_command_palette_uses_combobox_semantics_and_live_documentation_page(self) -> None:
        search = self.page.locator("#commandSearch")
        results = self.page.locator("#commandResults")
        self.assertEqual(search.get_attribute("role"), "combobox")
        self.assertEqual(search.get_attribute("aria-controls"), "commandResults")

        self.page.keyboard.press("Control+k")
        self.assertEqual(search.get_attribute("aria-expanded"), "true")
        active_id = search.get_attribute("aria-activedescendant")
        self.assertTrue(active_id)
        self.assertEqual(results.locator(f"#{active_id}").get_attribute("role"), "option")

        search.fill("this-command-does-not-exist")
        self.assertEqual(search.get_attribute("aria-expanded"), "false")
        self.assertIsNone(search.get_attribute("aria-activedescendant"))
        self.assertTrue(self.page.locator("#commandEmpty").is_visible())

        search.fill("Open the platform observability lab guide")
        self.assertEqual(results.locator(".command-result").count(), 1)
        self.assertEqual(search.get_attribute("aria-expanded"), "true")
        results.get_by_role("option", name="Open the platform observability lab guide").click()
        self.page.wait_for_url("**/projects/observability-lab/index.html")
        self.assertIn("Platform Observability Lab", self.page.title())

    def test_secondary_email_uses_an_explicit_key_mapping(self) -> None:
        secondary_email = self.page.locator('[data-email="secondary"]')
        self.assertEqual(
            secondary_email.get_attribute("href"),
            "mailto:mohammad.and.shohan@outlook.com",
        )

    def test_project_details_dialog_opens_and_closes_with_escape(self) -> None:
        self.page.locator('[data-project="observability"]').click()
        dialog = self.page.locator("#projectDialog")
        self.assertTrue(dialog.evaluate("element => element.open"))
        self.assertEqual(self.page.locator("#dialogTitle").inner_text(), "Platform observability reference lab")
        self.assertIn("SOURCE INCLUDED", self.page.locator("#dialogStatus").inner_text())
        self.assertTrue(self.page.locator("#dialogResourceLink").get_attribute("href").endswith(
            "projects/observability-lab/index.html"
        ))

        self.page.keyboard.press("Escape")
        self.assertFalse(dialog.evaluate("element => element.open"))

    def test_project_filters_keep_visibility_and_accessible_state_in_sync(self) -> None:
        runtime_filter = self.page.locator('[data-filter="runtime"]')
        runtime_filter.click()
        expect(runtime_filter).to_have_attribute("aria-pressed", "true", timeout=3000)
        expect(self.page.locator('.project-card[data-category]:visible')).to_have_count(2, timeout=3000)
        self.assertTrue(
            self.page.locator('.project-card[data-category~="runtime"]').is_visible()
        )

        all_filter = self.page.locator('[data-filter="all"]')
        all_filter.click()
        expect(all_filter).to_have_attribute("aria-pressed", "true", timeout=3000)
        expect(self.page.locator('.project-card[data-category]:visible')).to_have_count(4, timeout=3000)


if __name__ == "__main__":
    unittest.main(verbosity=2)
