# Code Reading Guide

This guide explains where to begin when maintaining the portfolio. The site is a static HTML/CSS/JavaScript application. Python and Playwright are used only to validate it; they are not required by visitors or by the deployed website.

## Runtime loading order

`index.html` loads stylesheets in this order: `styles.css`, `animations.css`, `advanced-animations.css`, then `final-interactions.css`. The last stylesheet intentionally owns the final content-aware card grids and solid monochrome surface rules. Do not move it earlier without rerunning the theme and layout tests. `styles.css` is a long accumulated cascade with later component refinements; treat its final rules as overrides and avoid adding another broad patch at the end. A future stylesheet consolidation should be a separate, screenshot-driven refactor.

The deferred JavaScript files load in this order:

1. `script.js` — navigation, contact destinations, theme/accessibility preferences, core simulators, search/command palette, and section explorers.
2. `animations.js` — original SVG motion panels and architecture/reference diagrams.
3. `advanced-animations.js` — the declarative registry and state handlers for 26 focused engineering learning labs.
4. `final-interactions.js` — architecture detail dialog, learning-stage navigation, and mobile graph ergonomics.

The files use small IIFEs to keep their implementation details out of the global namespace. Cross-module communication uses documented DOM IDs, `data-*` attributes, and the `motionpreferencechange` custom event.

## Source map

| File | Responsibility | Where to look first |
|---|---|---|
| `index.html` | Semantic page structure, section copy, interactive control IDs, SEO metadata, and asset loading | Section-boundary HTML comments; keep the intro hero and final connection section visually separate from the technical body |
| `styles.css` | Theme tokens, global layout, typography, header/hero, section and component styling, responsive rules | File header and existing topic comments; later refinement blocks intentionally override earlier declarations |
| `animations.css` | Core motion-panel and diagram presentation | File header and numbered diagram comments |
| `advanced-animations.css` | Styling for the 26 advanced labs | Numbered lab comments |
| `final-interactions.css` | Dialogs, final responsive grid rules, and primary/nested card surface contract | File header; search for `content-aware`, `Primary surfaces`, or `Nested cards` |
| `script.js` | Main UI controller and local teaching calculators | File header and JSDoc comments above the main helper functions |
| `animations.js` | Shared animation helpers and original engineering diagrams | `panelShell`, `mount`, `onceVisible`, `drawSvg`, and numbered model comments |
| `advanced-animations.js` | Lab registry, visual models, calculations, and per-card playback | `sectionMap`, `labs`, `customResult`, `setStepState`, and `initGallery` |
| `final-interactions.js` | Architecture dialog and keyboard/touch enhancements | `ensureArchitectureDialog`, `openArchitecture`, and `enhanceScrollableGraphs` |
| `scripts/check_portfolio.py` | Dependency-free source, link, content, and deployment-tree validation | `PortfolioParser` and `main` |
| `scripts/browser_smoke.py` | Builds a self-contained test document and runs core browser checks | `standalone_document` and `main` |
| `scripts/advanced_animation_smoke.py` | Exercises lab states, calculations, graphs, and playback | `main` |
| `scripts/final_interactions_smoke.py` | Tests responsive grids, command search, dialogs, focus, and mobile diagrams | `main` |
| `scripts/monochrome_surface_smoke.py` | Checks exact primary colors and flat nested cards in both themes | `CARD_SELECTORS`, `PRIMARY_CARD_SELECTORS`, and `main` |
| `.github/workflows/portfolio-quality.yml` | Read-only validation on pushes and pull requests | `validate` job |
| `.github/workflows/deploy-pages.yml` | Repeats validation, packages public files, and deploys Pages | `build` must pass before `deploy` can run |
| `.github/dependabot.yml` | Scheduled review of pinned GitHub Actions | Weekly update policy |
| `404.html` | GitHub Pages not-found route | Standalone document structure |
| `documents/*.html` | Printable PDF/export layouts | Page-boundary comments and print CSS map |
| `sitemap.xml`, `robots.txt` | Search crawler discovery | Canonical portfolio URL |

## Evidence and safety boundaries

- The main site is static. It does not deploy infrastructure, authenticate to cloud providers, or call provider APIs.
- The SLO, FinOps, pipeline, Kubernetes, incident, Terraform, observability, and advanced labs are browser-local illustrative models. Their visible labels and explanatory notes are intentional.
- SVG diagrams use DOM text and attributes for readable state. CSS motion is presentation only; reduced-motion preferences must preserve a usable static equivalent.
- The `projects/` directory is intentionally empty. Do not add invented project descriptions or imply that simulations are production implementations.
- Contact destinations are centralized in `script.js` so generated directory links and statically authored profile links use the same source of truth.
- The few `innerHTML` uses are reserved for fixed, authored templates or article markup copied from `index.html`; never interpolate visitor input into those templates. Use `textContent` for dynamic user-facing strings.
- The `.nojekyll` file is intentionally empty; its presence tells GitHub Pages not to run Jekyll over the static directory.
- Images, the PDF, and other binary assets are not source code and cannot carry useful inline source comments. Their roles are documented in the repository/asset map; keep binary assets optimized and replace them through the normal asset workflow.

## Run the checks locally

Use Python 3.12+ and Node.js 24 (the versions used by CI). Install the optional browser dependency and Chromium once:

```bash
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
```

Then run the full validation sequence from the `Portfolio/` directory:

```bash
python scripts/check_portfolio.py
node --check script.js
node --check animations.js
node --check advanced-animations.js
node --check final-interactions.js
python -m py_compile scripts/*.py
python scripts/browser_smoke.py
python scripts/advanced_animation_smoke.py
python scripts/final_interactions_smoke.py
python scripts/monochrome_surface_smoke.py
```

If Chromium is installed outside Playwright's cache, set `CHROMIUM_PATH` to its executable path before running the browser scripts. Remove `scripts/__pycache__/` after `py_compile`; the structural checker intentionally rejects generated files in a release tree.

## Commenting convention

Comments explain intent, trust boundaries, data flow, non-obvious algorithms, and why a later CSS rule overrides an earlier component rule. They should not repeat obvious syntax or narrate every property. Keep data registries readable through named fields and describe the assumptions/limitations at the registry or renderer boundary.
