# GitHub publication checklist — MD-SH0HAN/PORTFOLIO

## Upload the package

- [ ] Open the existing repository: <https://github.com/MD-SH0HAN/PORTFOLIO>.
- [ ] Extract the ZIP and upload the **contents** to the repository root, not the enclosing `Portfolio/` folder.
- [ ] Keep `.github/workflows/portfolio-quality.yml`, `.nojekyll`, `LICENSE`, both HTML pages, `assets/`, `projects/`, `scripts/`, `tests/`, and the requirements files.
- [ ] Do not upload a real `.env` file, cloud credentials, access tokens, private keys, local logs, or generated test results.
- [ ] Keep all observability lab ports bound to `127.0.0.1`; these are local learning services, not public production endpoints.

## GitHub Pages settings

- [ ] Open repository **Settings → Pages** and select **GitHub Actions** as the deployment source.
- [ ] Confirm the default branch is `main` (or use whichever branch is marked as the repository default; the workflow follows that setting).
- [ ] Confirm the repository allows GitHub Actions to run and deploy Pages. No personal access token is required by the included workflow.
- [ ] Push the package to the default branch and open **Actions**.
- [ ] Confirm the static/API tests, Chromium browser tests, and Docker Compose API → Prometheus → Grafana integration all pass before the gated deployment runs.
- [ ] Open the `github-pages` deployment URL reported by Actions. If it differs from `https://md-sh0han.github.io/Portfolio/`, set repository variable `PORTFOLIO_SITE_URL` to the exact HTTPS site root and trigger a new run.
- [ ] Do not claim a successful live deployment until the Pages deployment job has completed successfully.

## Validate the published website

- [ ] Check the homepage and `/projects/observability-lab/` on desktop and mobile.
- [ ] Exercise theme switching, mobile navigation, command palette (`Ctrl+K` / `⌘K`), project filters, project-details dialogs, and contact links.
- [ ] Confirm the canonical URLs, Open Graph URLs, sitemap, robots directive, and source links point to this repository or the configured custom domain.
- [ ] Respect `prefers-reduced-motion` and verify the site remains usable when third-party fonts are blocked.
- [ ] Keep planned roadmap projects labelled as planned and browser-based CI/CD, Kubernetes, and SRE experiences labelled as simulations.
- [ ] Run the local observability stack only with a strong local Grafana password and stop it with `docker compose down` when finished.

## Optional custom domain

Only configure `PORTFOLIO_SITE_URL` after setting up the domain under **Settings → Pages**, verifying DNS ownership, and enabling HTTPS. Use the full HTTPS site root, for example `https://www.your-domain.example/`; do not use an example domain as a real setting and do not commit a `.env` file or secret.
