# MD SHOHAN - Platform Engineer

A responsive, monochrome portfolio dedicated to **Platform Engineering**. The site explains the platform-engineering direction through an internal developer platform (IDP) model, self-service workflows, golden paths, infrastructure foundations, policy guardrails, runtime capabilities, and developer experience.

The portfolio deliberately distinguishes concepts, planned build briefs, browser-only simulations, and runnable source. The observability reference lab is included as a local implementation; the IDP, service catalog, platform APIs, policy engine, and planned golden paths are not claimed as finished production products.

**Source repository:** [MD-SH0HAN/PORTFOLIO](https://github.com/MD-SH0HAN/PORTFOLIO)  
**GitHub Pages URL:** `https://md-sh0han.github.io/PORTFOLIO/` (confirm the deployment URL in repository Pages/Actions settings).

## Platform-engineering scope

This portfolio focuses on how a platform team builds and continuously improves an internal product for application developers:

- **Internal developer platform (IDP):** the coherent collection of self-service workflows, templates, service discovery, platform APIs, documentation, and runtime capabilities.
- **Golden paths:** supported defaults for creating, validating, packaging, deploying, and operating a service, with documented extension points rather than rigid lock-in.
- **Infrastructure foundations:** infrastructure as code, reusable modules, identity boundaries, cost awareness, and policy checks.
- **Developer experience:** service templates/catalogs, clear feedback, documentation, onboarding, and reducing repetitive platform toil.
- **Runtime and reliability:** Kubernetes workload conventions, health contracts, safe rollouts, observability, SLOs, runbooks, and recovery.
- **Platform as a product:** internal developers are users; platform direction should be informed by adoption, feedback, time-to-first-deploy, friction, reliability, and support signals.

These concepts align with the CNCF's platform-engineering and platform-as-a-product guidance: [CNCF — What is platform engineering?](https://www.cncf.io/blog/2025/11/19/what-is-platform-engineering/) and [CNCF — Platform Engineering Maturity Model](https://tag-app-delivery.cncf.io/whitepapers/platform-eng-maturity-model/).

## What is in the repository

- Responsive homepage with accessible dark/light themes, reduced-motion handling, keyboard-friendly navigation, and a searchable command palette.
- Platform-capability map and conceptual platform workflow from developer intent through golden path, reusable artifacts, runtime, and feedback.
- Platform-as-product section covering internal developer platforms, golden paths, guardrails, developer experience, and feedback.
- Four project cards: one local observability reference implementation and three clearly labelled planned platform build briefs.
- Browser-only demonstrations for a golden-path workflow, Kubernetes readiness, example traces, release differences, change replay, recovery decisions, and SLO/error-budget modeling. These do not contact live infrastructure.
- Technology map and learning sequence organized around platform-engineering capabilities, not unrelated career tracks.
- GitHub Actions quality gate for static/API checks, Chromium browser regression tests, Docker Compose integration tests, and a Pages deployment gated on successful checks.

## Repository layout

```text
.
├── index.html
├── styles.css
├── script.js
├── assets/
├── Profile Photo.webp
├── Orbit Photo.webp
├── projects/observability-lab/       # Local API + Prometheus + Grafana reference lab
├── scripts/                          # Static, release, browser and integration checks
├── tests/browser/                    # Playwright/Chromium regression tests
├── .github/workflows/portfolio-quality.yml
├── IMPLEMENTATION_REPORT.md
├── PUBLISHING_CHECKLIST.md
├── LICENSE
├── robots.txt
└── sitemap.xml
```

## Run the portfolio locally

From the repository root:

```bash
python -m http.server 8080
```

Open <http://127.0.0.1:8080/>. The website uses HTML, CSS, and vanilla JavaScript; no npm build step is required.

## Validate the project

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

For real-browser checks:

```bash
python -m pip install -r requirements-browser.txt
python -m playwright install chromium
python -m unittest discover -s tests/browser -p 'test_*.py' -v
python scripts/build_pages.py
python scripts/smoke_browser_in_memory.py --root dist
```

The in-memory Chromium test complements rather than replaces the HTTP-backed Playwright suite. If browser or Docker prerequisites are unavailable, record those checks as not run rather than as passed.

## Run the included observability reference lab

**Requirements:** Docker Engine with Docker Compose v2; Python 3.12+ for the test suite.

1. Change to `projects/observability-lab/`.
2. Copy `.env.example` to `.env` and set a strong local Grafana password.
3. Start the local stack:

   ```bash
   docker compose up --build -d
   docker compose ps
   ```

4. Open the API at <http://127.0.0.1:8000/>, Prometheus targets at <http://127.0.0.1:9090/targets>, and Grafana at <http://127.0.0.1:3000/>.
5. Generate sample requests:

   ```bash
   curl http://127.0.0.1:8000/
   curl http://127.0.0.1:8000/healthz
   curl -i http://127.0.0.1:8000/demo/error
   curl "http://127.0.0.1:8000/demo/slow?seconds=1.5"
   ```

6. Stop the lab with `docker compose down`. Add `--volumes` to remove local persisted metrics/dashboard state as well.

All host ports bind to `127.0.0.1`. The included stack is a learning reference, not a production-ready IDP component. It lacks production authentication, TLS termination, multi-user hardening, durable metric storage, alert notifications, and a complete production SLO policy.

## Project status and integrity

- The **observability lab** includes the local API, tests, Prometheus alert rules, Grafana dashboard provisioning, and Compose configuration. Run the stack to verify the complete integration on your own machine.
- The **golden-path delivery workflow**, **self-service infrastructure foundation**, and **Kubernetes platform operations lab** are planned build briefs, not completed deployments.
- Platform map, CI workflow, Kubernetes readiness, traces, release comparison, change replay, recovery, and reliability controls are explicitly illustrative browser simulations.
- Dashboard preview values are illustrative sample values, not live traffic, production telemetry, or measured performance results.
- The conceptual IDP model does not claim that a production portal, service catalog, platform API, policy engine, or GitOps controller has been implemented.

## Publish with GitHub Pages

This package is configured for [`MD-SH0HAN/PORTFOLIO`](https://github.com/MD-SH0HAN/PORTFOLIO). Upload the **contents** of the ZIP to the repository root, preserving `.github/`, `.nojekyll`, `assets/`, `projects/`, `scripts/`, and `tests/`. In repository **Settings → Pages**, set the source to **GitHub Actions**. Ensure `portfolio-quality.yml` is the single active Pages deployment workflow, and remove any older independent workflow such as `.github/workflows/deploy.yml`. Uploading ZIP contents does not delete extra files already in GitHub; the obsolete workflow must be deleted from the repository explicitly so no release can bypass the quality gates.

The workflow is intended to run static/API checks, browser regression tests, and Docker Compose integration checks before building/deploying Pages from the default branch. Verify every required job and the deployed site in GitHub Actions after committing changes. The canonical URL is `https://md-sh0han.github.io/PORTFOLIO/`; update `PORTFOLIO_SITE_URL` only when the verified Pages root or an owned custom domain changes.

Never commit `.env` files, credentials, access tokens, private keys, production telemetry, or generated test artifacts. Code and configuration use the MIT license; photographs, likeness, and visual branding assets are excluded from that license.

## Content maintenance

- Identity, platform model, projects, education, and metadata: `index.html`.
- Visual system and responsive styles: `styles.css`.
- Interactions, project briefs, technology descriptions, command palette, and profile destinations: `script.js`.
- Included local implementation: `projects/observability-lab/`.
