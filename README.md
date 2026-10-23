# MD SHOHAN — Cloud & DevOps Portfolio

A responsive, monochrome engineering portfolio built with plain HTML, CSS, and JavaScript. The introduction uses a liquid-glass visual system, a grayscale portrait, animated orbital geometry, and a mobile-first reading order. It combines an interactive reliability/operations learning lab, clearly labelled project briefs, and a local Python + Prometheus + Grafana reference implementation.

The site is intentionally transparent about project status: the browser-based CI/CD, Kubernetes, SRE, architecture, and operations experiences are **simulations**; the observability lab contains source and tests for a **local reference stack**. It is not presented as a production deployment.

**Source repository:** [MD-SH0HAN/PORTFOLIO](https://github.com/MD-SH0HAN/PORTFOLIO)  
**GitHub Pages URL:** `https://md-sh0han.github.io/Portfolio/` (confirm the exact deployment URL in the repository Actions/Pages settings).

## Highlights

- Responsive dark/light monochrome themes, a liquid-glass hero, portrait/orbit motion, off-screen animation pausing, reduced-motion support, skip navigation, keyboard-friendly controls, and labelled interactive regions.
- Command palette (`Ctrl+K` on Windows/Linux or `⌘K` on macOS) for quick navigation.
- Interactive architecture explorer, SLO/error-budget calculator, synthetic SRE Control Room, CI/CD flow, Kubernetes readiness model, and operations workbench.
- Featured local observability lab: a Python HTTP API, Prometheus metrics and alert rules, provisioned Grafana dashboard, Docker Compose configuration, and unit tests.
- GitHub Actions quality gate: static/API checks, real Chromium browser regression tests, Docker Compose API → Prometheus → Grafana integration, and a gated Pages deployment.
- Browser regression coverage for nine viewport widths, header-control geometry, horizontal overflow, mobile navigation, theme persistence, accessible command-palette keyboard/search states and navigation, explicit secondary-email mapping, project filters, dialogs, theme-token contrast, and browser runtime errors.
- Live integration checks for Prometheus scrape health, actual metrics samples, all three alert rules, Grafana dashboard provisioning, dashboard panels, and its Prometheus datasource.
- No JavaScript framework, bundler, icon CDN, or package install is required for the portfolio site itself. The optional Nunito web font falls back to system fonts if blocked.

## Repository layout

```text
.
├── index.html                         # Portfolio homepage
├── styles.css                         # Themes, layout, responsive styles, motion
├── script.js                          # Interactive features
├── assets/
│   ├── favicon.svg
│   └── portrait-placeholder.svg       # Offline-safe portrait fallback
├── Profile Photo.webp                 # Optimized primary portrait
├── Orbit Photo.webp                   # Contact-section portrait crop
├── projects/observability-lab/         # Local API + Prometheus + Grafana lab
├── scripts/
│   ├── build_pages.py                  # Create a minimal, deployment-ready Pages artifact
│   ├── check_portfolio.py              # Dependency-free static site checks (source or built artifact)
│   ├── check_stylesheet.py             # CSS parser check
│   ├── check_infrastructure_config.py  # Compose/Prometheus/Grafana static contract checks
│   ├── check_release_config.py         # GitHub Pages workflow/deployment contract checks
│   ├── smoke_browser_in_memory.py      # Offline-safe Chromium interaction/layout checks
│   └── smoke_observability.py          # Live stack integration checks
├── projects/observability-lab/tests/   # API unit/HTTP tests + smoke-script test
├── tests/browser/                      # Playwright/Chromium browser tests
├── requirements-ci.txt                 # CSS and YAML validation dependencies
├── requirements-browser.txt            # Pinned Playwright dependency
├── .github/workflows/                 # Three-job CI quality workflow
├── .editorconfig                      # Consistent editor defaults
├── IMPLEMENTATION_REPORT.md           # Scope, changes, and honest verification status
├── PUBLISHING_CHECKLIST.md             # GitHub Pages and first-push checklist
├── LICENSE                             # MIT for code/configuration (brand assets excluded)
├── .nojekyll                           # Publish static files without Jekyll processing
├── robots.txt
└── sitemap.xml
```

## Run the portfolio locally

From the repository root, start a small static server:

```bash
python -m http.server 8080
```

On Windows, `py -m http.server 8080` is also suitable. Then open <http://127.0.0.1:8080/>. A local server is recommended for closer-to-hosted behavior; there are no frontend build steps or npm dependencies.

## Validate the portfolio

The static checker uses only Python's standard library and verifies local HTML references, page fragments, duplicate IDs, image alt attributes, and essential homepage metadata.

```bash
python scripts/check_portfolio.py
python -m pip install -r requirements-ci.txt
python scripts/check_stylesheet.py
python scripts/check_infrastructure_config.py
python scripts/check_release_config.py
node --check script.js
python -m pip install -r projects/observability-lab/api/requirements.txt
python -m unittest discover -s projects/observability-lab/tests -v
```

## Run the observability lab

**Requirements:** Docker Engine with the Docker Compose v2 plugin. Python 3.12+ is required for the test suite.

1. Open a terminal in `projects/observability-lab/`.
2. Copy `.env.example` to `.env` and replace the example Grafana password with a strong local-only password.
3. Start the stack and check service status:

   ```bash
   docker compose up --build -d
   docker compose ps
   ```

   On PowerShell, use `Copy-Item .env.example .env` for step 2.

4. Wait for the containers to become healthy with `docker compose ps`, then open the local services:

   - API: <http://127.0.0.1:8000/>
   - Prometheus targets: <http://127.0.0.1:9090/targets>
   - Grafana: <http://127.0.0.1:3000/> (username `admin`; password from `.env`)

5. Generate example traffic from another terminal:

   ```bash
   curl http://127.0.0.1:8000/
   curl http://127.0.0.1:8000/healthz
   curl -i http://127.0.0.1:8000/demo/error
   curl "http://127.0.0.1:8000/demo/slow?seconds=1.5"
   ```

   `/demo/error` deliberately returns HTTP 503. `/demo/slow` supports a bounded delay of up to three seconds. These endpoints are for local exercises only.

6. Stop the stack when finished:

   ```bash
   docker compose down
   ```

   To also delete the stored local metrics and Grafana state, run `docker compose down --volumes`. That removes the lab's persisted data.

All Compose host ports bind to `127.0.0.1`. Keep that restriction for local use. Do not expose these learning services directly to a public network.

## Test the website in a real browser

The browser suite starts its own local static server, so no build step or manually started server is required. It uses Chromium through Playwright and blocks the optional Google Fonts requests to verify that the system-font fallback works without a third-party CDN.

```bash
python -m pip install -r requirements-browser.txt
python -m playwright install chromium
python -m unittest discover -s tests/browser -p 'test_*.py' -v
```

The suite checks the homepage and observability case study, uncaught JavaScript errors and failed local resources, header geometry and horizontal overflow at 320/360/390/430/560/640/768/1024/1440 pixels, mobile navigation, persisted theme changes, keyboard operation of the command palette, project filtering, and project-detail dialogs. If a test fails, it writes a screenshot and JSON diagnostics under `test-results/browser/`.

For restricted environments where browser policy blocks navigation to a local HTTP test server, a second Chromium run bundles the built site's CSS, JavaScript, and local images into an in-memory document. It exercises real DOM events, responsive geometry, accessible control names and ARIA references, contrast tokens, project filters and dialogs, the SLO calculator, and the operations simulations without needing `localhost` access:

```bash
python scripts/build_pages.py
python scripts/smoke_browser_in_memory.py --root dist
```

This is a complementary smoke test, not a replacement for the HTTP-backed Playwright E2E suite. CI runs both. The in-memory test can save clean desktop/mobile screenshots with `--screenshots`; the workflow uploads both browser-test folders when the browser job fails.

## Test the API without Docker

From the repository root:

```bash
python -m pip install -r projects/observability-lab/api/requirements.txt
python -m unittest discover -s projects/observability-lab/tests -v
```

These unit/HTTP tests verify the API routing and metric instrumentation without a Docker daemon.

## Continuous integration

`.github/workflows/portfolio-quality.yml` runs three independent jobs on every push, pull request, or manual dispatch:

1. **Static and unit:** local HTML references, metadata/sitemap consistency, CSS parsing, Compose/Prometheus/Grafana configuration contracts, JavaScript syntax, and API unit/HTTP tests.
2. **Browser E2E:** Playwright/Chromium interactions and responsive layout tests plus a second in-memory Chromium run for accessible names, ARIA references, theme contrast, keyboard filters, simulations, and case-study layout. Failed HTTP E2E runs upload screenshots and diagnostics for seven days.
3. **Docker Compose integration:** builds and starts the API, Prometheus, and Grafana; verifies the live scrape target and an actual 503 counter sample; confirms all three alert rules, the provisioned six-panel Grafana dashboard, its folder, and its Prometheus datasource; then always removes containers and CI volumes.
4. **Build and deploy GitHub Pages:** runs only on the default branch after the other three jobs pass, validates the minimal static artifact, preserves the required `.nojekyll` dotfile in the upload artifact, and publishes it through the official Pages actions. Pull requests run quality checks but do not deploy.

After the first push, open the repository's **Actions** tab and confirm all quality jobs and the Pages deployment pass. Then open the URL shown in the `github-pages` deployment environment and check the homepage and project page on both desktop and mobile.

## Publish the portfolio

The site is static and does not need a frontend build tool. The included GitHub Actions workflow runs the static/API, Chromium browser, and Docker Compose integration jobs. **Only after all three pass on the repository's default branch does it build and deploy the Pages site.** The build step copies only the runtime pages, assets, lab guide, sitemap, and robots file into `dist/`; tests, CI configuration, scripts, and local service configuration are not included in the published artifact.

For a manual local build and validation:

```bash
python scripts/build_pages.py
python scripts/check_portfolio.py --root dist
```

This package is configured for your existing public repository, [`MD-SH0HAN/PORTFOLIO`](https://github.com/MD-SH0HAN/PORTFOLIO); you do not need to create another repository. Upload the **contents** of the ZIP to the repository root (not an extra enclosing `Portfolio/` directory) and preserve `.github/`, `.nojekyll`, `LICENSE`, the `projects/`, `assets/`, `scripts/`, and `tests/` folders. In repository **Settings → Pages**, choose **GitHub Actions** as the deployment source. The included workflow only deploys from the default branch after all three quality jobs pass. It uses the official Pages actions and does not need a personal access token or a stored cloud secret.

The default canonical site root is `https://md-sh0han.github.io/Portfolio/`. Confirm the exact deployed URL in the GitHub Pages settings or the `github-pages` deployment environment. If the actual root differs or you later configure a custom domain, set the repository Actions variable `PORTFOLIO_SITE_URL` to the full HTTPS **site root** after configuring Pages and verifying that you control the domain. The build rewrites canonical/Open Graph URLs, the sitemap, robots directive, and portfolio profile links consistently. Do not add credentials or a real `.env` file to the repository.

## Project integrity and scope

- The cloud-foundation, CI/CD, and Kubernetes roadmap cards are planned build briefs, not completed deployments.
- The browser-based pipeline, Kubernetes readiness model, SRE Control Room, sample traces, and release/recovery events are educational simulations. They do not connect to a live cluster, cloud account, production endpoint, or real telemetry.
- The observability lab is source-complete enough to run locally, subject to the documented prerequisites. Validate the full API → Prometheus → Grafana runtime on your machine before describing the integrated stack as end-to-end verified.
- The demo stack intentionally lacks production features such as TLS termination, an authentication proxy, an alert notification service, and long-term metrics storage.

## Customization

- **Identity, introduction, education, and page content:** `index.html`
- **Colors, layout, typography, responsive rules, and animations:** `styles.css`
- **Interactions, project briefs, themes, command palette, and public profile links:** `script.js`
- **Profile photo:** replace `Profile Photo.webp` and, if desired, `Orbit Photo.webp`. If the primary image is missing, the page uses `assets/portrait-placeholder.svg` as a local fallback.
- **Observability reference implementation:** `projects/observability-lab/`

Do not commit `.env` files, cloud credentials, access tokens, private keys, or production telemetry. The repository `.gitignore` excludes common local secrets and generated test artefacts. Source code and configuration are licensed under MIT; personal photographs, names/likeness, and visual branding assets are excluded from that license.
