#!/usr/bin/env python3
"""Verify theme bootstrap, system preference, persistence, and cross-tab behavior."""
from __future__ import annotations

import os
import sys
sys.dont_write_bytecode = True
from playwright.sync_api import sync_playwright
from browser_smoke import standalone_document


FAKE_STORAGE_BOOTSTRAP = """<script>
(() => {
  // window.name survives document rewrites and provides a tiny test-only
  // storage shim for this restricted about:blank browser environment.
  const storageKey = '__portfolioThemeTestStorage';
  const readStore = () => {
    try { return JSON.parse(window.name || '{}')[storageKey] || {}; }
    catch (_) { return {}; }
  };
  const saveStore = store => {
    let envelope = {};
    try { envelope = JSON.parse(window.name || '{}'); } catch (_) { envelope = {}; }
    envelope[storageKey] = store;
    window.name = JSON.stringify(envelope);
  };
  const api = {
    getItem(key) { const store = readStore(); return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { const store = readStore(); store[key] = String(value); saveStore(store); },
    removeItem(key) { const store = readStore(); delete store[key]; saveStore(store); },
    clear() { saveStore({}); }
  };
  Object.defineProperty(window, 'localStorage', { configurable: true, value: api });
})();
</script>"""


def document_with_storage() -> str:
    """Insert a test-only storage shim before the production theme bootstrap."""
    document = standalone_document()
    return document.replace("<head>", "<head>" + FAKE_STORAGE_BOOTSTRAP, 1)

def expect(condition: bool, message: str, passed: list[str], failed: list[str]) -> None:
    """Record a named assertion without stopping the remaining checks."""
    (passed if condition else failed).append(message)


def theme_state(page) -> dict[str, str]:
    """Read the browser-visible theme state and representative rendered colors."""
    return page.evaluate(
        """() => {
          const root = document.documentElement;
          const body = getComputedStyle(document.body);
          const toggle = document.querySelector('#themeToggle');
          const sun = document.querySelector('#themeToggle .icon-sun');
          const moon = document.querySelector('#themeToggle .icon-moon');
          return {
            theme: root.dataset.theme || '',
            colorScheme: getComputedStyle(root).colorScheme,
            background: body.backgroundColor,
            foreground: body.color,
            pressed: toggle?.getAttribute('aria-pressed') || '',
            title: toggle?.title || '',
            sunDisplay: sun ? getComputedStyle(sun).display : 'missing',
            moonDisplay: moon ? getComputedStyle(moon).display : 'missing',
            themeColor: document.querySelector('meta[name="theme-color"]')?.content || ''
          };
        }"""
    )


def main() -> int:
    """Run theme regression checks with and without usable browser storage."""
    failures: list[str] = []
    passed: list[str] = []
    executable = os.environ.get("CHROMIUM_PATH")
    launch_options = {"headless": True, "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
    if executable:
        launch_options["executable_path"] = executable

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(**launch_options)

        # about:blank has blocked localStorage in Chromium. This verifies that
        # a storage exception does not suppress the system color preference.
        restricted_page = browser.new_page(color_scheme="light", reduced_motion="reduce")
        restricted_page.set_content(standalone_document(), wait_until="load", timeout=30000)
        restricted_state = theme_state(restricted_page)
        expect(
            restricted_state["theme"] == "light" and restricted_state["themeColor"] == "#ececec",
            "system light preference is applied even when localStorage is inaccessible",
            passed,
            failures,
        )
        restricted_page.emulate_media(color_scheme="dark")
        restricted_page.wait_for_function("document.documentElement.dataset.theme === 'dark'")
        expect(
            theme_state(restricted_page)["theme"] == "dark",
            "system preference changes update the open page when no manual choice exists",
            passed,
            failures,
        )
        restricted_page.locator("#themeToggle").click()
        restricted_state = theme_state(restricted_page)
        expect(
            restricted_state["theme"] == "light"
            and restricted_state["pressed"] == "true"
            and restricted_state["moonDisplay"] == "block"
            and restricted_state["sunDisplay"] == "none",
            "manual theme toggle updates the active icon and accessible pressed state",
            passed,
            failures,
        )
        restricted_page.emulate_media(color_scheme="dark")
        expect(
            theme_state(restricted_page)["theme"] == "light",
            "manual theme choice takes precedence over later system changes",
            passed,
            failures,
        )
        restricted_page.close()

        # A test-only window.name-backed shim lets this about:blank document
        # exercise persisted preferences and storage events without network I/O.
        page = browser.new_page(color_scheme="dark", reduced_motion="reduce")
        document = document_with_storage()
        page.set_content(document, wait_until="load", timeout=30000)
        state = theme_state(page)
        expect(
            state["theme"] == "dark"
            and state["background"] == "rgb(9, 9, 9)"
            and state["foreground"] == "rgb(240, 240, 240)"
            and state["colorScheme"] == "dark",
            "dark mode renders a dark canvas, light foreground, and dark native controls",
            passed,
            failures,
        )

        page.locator("#themeToggle").click()
        page.wait_for_timeout(500)  # Let the intentional body color transition finish.
        light_state = theme_state(page)
        expect(
            light_state["theme"] == "light"
            and light_state["background"] == "rgb(236, 236, 236)"
            and light_state["foreground"] == "rgb(20, 20, 20)"
            and light_state["colorScheme"] == "light"
            and light_state["pressed"] == "true"
            and light_state["title"] == "Switch to dark theme"
            and light_state["themeColor"] == "#ececec",
            "light mode updates canvas, text, native controls, button state, and browser chrome color",
            passed,
            failures,
        )
        expect(
            page.evaluate("localStorage.getItem('shohan-theme')") == "light",
            "manual theme preference is persisted in localStorage",
            passed,
            failures,
        )

        # Rebuild the same document in the same tab; the shim preserves stored data.
        page.set_content(document, wait_until="load", timeout=30000)
        expect(
            theme_state(page)["theme"] == "light",
            "saved theme preference is restored after a page reload",
            passed,
            failures,
        )
        page.emulate_media(color_scheme="dark")
        expect(
            theme_state(page)["theme"] == "light",
            "saved preference overrides the operating-system theme",
            passed,
            failures,
        )

        # Storage events are dispatched as another tab would dispatch them.
        page.evaluate("window.dispatchEvent(new StorageEvent('storage', {key: 'shohan-theme', newValue: 'dark'}))")
        expect(
            theme_state(page)["theme"] == "dark"
            and theme_state(page)["pressed"] == "false"
            and theme_state(page)["sunDisplay"] == "block",
            "storage events synchronize the active theme and icon",
            passed,
            failures,
        )
        page.emulate_media(color_scheme="light")
        expect(
            theme_state(page)["theme"] == "dark",
            "explicit stored selection remains stable when the system preference changes",
            passed,
            failures,
        )
        page.evaluate("window.dispatchEvent(new StorageEvent('storage', {key: 'shohan-theme', newValue: null}))")
        page.wait_for_function("document.documentElement.dataset.theme === 'light'")
        expect(
            theme_state(page)["theme"] == "light",
            "removing the saved preference restores system-following mode",
            passed,
            failures,
        )
        page.emulate_media(color_scheme="dark")
        page.wait_for_function("document.documentElement.dataset.theme === 'dark'")
        expect(
            theme_state(page)["theme"] == "dark",
            "system-following mode continues to track later operating-system changes",
            passed,
            failures,
        )
        page.close()
        browser.close()

    for item in passed:
        print(f"PASS: {item}")
    for item in failures:
        print(f"FAIL: {item}")
    print(f"RESULT: {len(passed)} passed; {len(failures)} failed")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
