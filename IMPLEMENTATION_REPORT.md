# Portfolio audit and release report

**Project:** MD SHOHAN — Cloud & DevOps Portfolio  
**Target repository:** <https://github.com/MD-SH0HAN/PORTFOLIO>  
**Default GitHub Pages root:** `https://md-sh0han.github.io/Portfolio/`  
**Scope:** Static portfolio website, local observability lab, quality automation, and GitHub Pages deployment package.

## Summary

The portfolio uses semantic HTML, responsive CSS, and vanilla JavaScript. It includes dark/light themes, motion preferences, keyboard navigation, a command palette, project filters/details, interactive reliability learning simulations, and a local Python + Prometheus + Grafana reference stack.

The source package is designed for the existing `MD-SH0HAN/PORTFOLIO` repository. The previous package contained URL/configuration references to a different repository name (`shohan-portfolio`) in canonical/social metadata, repository links, crawler files, build defaults, and publishing instructions. Those references have been aligned to the actual target repository. The release checker now guards against reintroducing that mismatch.

## Changes made for this handoff

- Aligned homepage and case-study canonical/Open Graph URLs with the configured Pages root.
- Aligned portfolio profile links and repository/source links with `MD-SH0HAN/PORTFOLIO`.
- Updated `robots.txt`, `sitemap.xml`, the build script, README publication instructions, and the publishing checklist.
- Rewrote the publishing checklist for updating the existing repository; it explicitly says to upload ZIP contents to the repository root, not an enclosing `Portfolio/` folder.
- Added release-config assertions for the expected site root and repository root, in addition to checks for workflow gates, Pages permissions, hidden files, and `.nojekyll`.
- Kept the project-integrity language: CI/CD, Kubernetes, SRE, and operations UI interactions are demonstrations/simulations; the observability stack is a local reference implementation and is not claimed as a production deployment.
- Kept `.env` ignored and `.env.example` tracked. Compose ports remain bound to `127.0.0.1`, and the API container uses a non-root account with a read-only filesystem and dropped capabilities.

## Local validation

Validation performed in this package-building environment:

| Check | Result |
|---|---|
| HTML / local resource / fragments / sitemap consistency | PASS — 2 HTML pages, 40 local references, 2 sitemap URLs |
| CSS syntax parser | PASS — no parse/declaration errors |
| GitHub Pages workflow and repository/site URL contract checks | PASS |
| Compose / Prometheus / Grafana static contract checks | PASS — 3 services, 3 alert rules, 6 dashboard panels |
| JavaScript syntax | PASS — `node --check script.js` |
| Observability API unit and local HTTP tests | PASS — 12 tests |
| Pages artifact build | PASS — 11 runtime files; test/CI/local infrastructure files excluded |
| In-memory Chromium smoke checks | PASS — 19 checks, including nine homepage viewport widths and five case-study widths |
| Custom-site-root rewrite | PASS — canonical, Open Graph, sitemap, robots, and portfolio profile links all rewrote to a sample HTTPS site root |

The in-memory Chromium checks exercise responsive layout, image decoding, accessible names/ARIA references, reduced-motion behavior, theme changes, navigation, command palette, project dialogs, SLO calculator, pipeline/Kubernetes/SRE simulations, case-study layout, and JavaScript runtime errors.

## Not verified here

- The HTTP-backed Playwright browser suite was attempted with the installed system Chromium but all 12 test setups were blocked by `net::ERR_BLOCKED_BY_ADMINISTRATOR` when Chromium navigated to the temporary loopback HTTP server. The in-memory Chromium suite passed; the included GitHub Actions browser job is the release gate.
- Docker is not installed in this package-building environment, so the live API → Prometheus → Grafana integration was not started here. The included Docker Compose integration job is the release gate.
- No commit was pushed by this package-building process and no remote GitHub Actions or GitHub Pages deployment was executed. Upload this package to the existing repository and confirm the workflow passes before treating the public deployment as verified.
- No Lighthouse score, production telemetry, custom-domain/DNS state, or live availability is claimed.

## Release steps

1. Extract the ZIP and upload its contents to the root of <https://github.com/MD-SH0HAN/PORTFOLIO>.
2. In **Settings → Pages**, select **GitHub Actions** as the deployment source.
3. Push to the repository's default branch and inspect **Actions**. The deploy job waits for static/API, browser, and Docker integration jobs.
4. Open the `github-pages` deployment URL and test the homepage and observability guide on desktop and mobile.
5. If GitHub Pages reports a different site root from `https://md-sh0han.github.io/Portfolio/`, set repository variable `PORTFOLIO_SITE_URL` to the actual full HTTPS site root and rerun the workflow.

## Runtime and licensing notes

The static site requires no Node package installation or frontend bundler. The observability lab requires Docker Engine with Compose v2 and Python for standalone tests. Set a strong local Grafana password in a local `.env` file; never commit it or expose the demo endpoints publicly. MIT licensing applies to source code and configuration as described in `LICENSE`; portrait photographs, names/likeness, and brand/visual assets are excluded.
