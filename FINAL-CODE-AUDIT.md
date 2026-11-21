# Final Code Audit and Test Record

**Audit date:** 21 November 2026  
**Baseline:** `MD-Shohan-Portfolio-Primary-Card-111-Final.zip`  
**Scope:** static source, comments/documentation, local assets, workflows, browser behavior, responsive layouts, printable documents, and release packaging.

## Outcome

The current source passes the structural, syntax, browser, responsive, and card-surface checks listed below. Explanatory comments were added to the HTML section boundaries, CSS files, JavaScript modules and non-obvious functions, Python validators/tests, GitHub Actions workflows, and repository configuration. `CODE-READING-GUIDE.md` documents the runtime load order, source map, evidence boundaries, and local commands. The comments describe intent and trust boundaries; they intentionally do not repeat every CSS declaration or data field.

## Verification results

| Check | Result | What it verifies |
|---|---:|---|
| Structural repository checker | PASS | Required sections/controls, unique IDs, local links/resources, evidence boundaries, workflow safety, PDF signature, and clean release tree |
| JavaScript syntax | PASS · 4 files | `node --check` for all production JavaScript modules |
| Python syntax | PASS · 5 files | Python byte-compilation; generated `__pycache__` was removed afterward |
| Main browser smoke suite | **46 / 46** | Core loading, accessibility semantics, keyboard controls, theme, navigation, simulators, and responsive width |
| Advanced learning labs | **54 / 54** | 26 lab models, calculations, step/play/pause/reset controls, diagrams, reduced motion, and responsive canvases |
| Final interaction suite | **32 / 32** | Content-aware grids, filter balancing, architecture dialog, command palette, focus restoration, and mobile diagrams |
| Monochrome surface suite | **13 / 13** | 77 primary cards use `#111111` in both themes, flat nested layers, protected footer treatment, and no horizontal page overflow |
| **Total browser assertions** | **145 / 145** | All four independent Chromium suites passed |
| CSSOM parsing | PASS | Chromium parsed all four production stylesheets (2,219 + 293 + 642 + 189 top-level rules) |
| Standalone HTML documents | PASS | `404.html`, one-page print profile, and five-page technical portfolio render with expected headings/content |
| XML / YAML parsing | PASS | Sitemap XML, Dependabot YAML, and both GitHub Actions workflows parse |
| PDF integrity | PASS | Embedded PDF is valid PDF 1.7, five A4 pages |
| Packaging hygiene | PASS | No `__pycache__`, `node_modules`, `dist`, test output, or OS metadata in the release tree |

## What the browser suites exercise

- The main site loads from a self-contained document made from the actual production HTML, CSS, JavaScript, and local images.
- Keyboard access and Escape behavior for dialogs and the command palette, basic accessible naming, image alternatives, and ARIA references.
- Theme/contrast settings and reduced-motion behavior.
- Pipeline failure gates, Kubernetes readiness/recovery, SLO budget calculations, synthetic incident injection/recovery, Terraform learning flow, and illustrative FinOps calculations.
- Technology map filtering/selection, command search/recents, architecture diagrams, SVG draw/replay, and all 26 advanced labs.
- Content-aware card grids and no page-level horizontal overflow at 320, 390, 768, 1024, and 1440 CSS pixels.
- Exact primary-card fill `#111111`, no gradient image or box shadow, and solid nested surfaces in dark and light themes.

## Code-comment coverage

- `index.html`: runtime loading order and boundaries for the career/technical sections; no comments were inserted inside the protected hero/orbital profile or final connection section.
- CSS: file-level reading maps, stylesheet order, component boundaries, and explanation that final interaction rules are intentional cascade overrides.
- JavaScript: module responsibilities, data registries, accessible state updates, dialog behavior, local-only simulations, and the trust boundary for generated HTML. Fixed SVG/status snippets are allow-listed local markup; article markup is copied from authored page content; visitor input is rendered as text.
- Python: docstrings for the parser/helpers/test entry points and comments on browser setup, accessibility scope, and theme repetition.
- GitHub Actions/configuration: purpose of least-privilege permissions, build-before-deploy, test-only dependencies, ignore rules, and canonical crawler metadata.
- Print HTML: page and print-style boundaries. Binary image/PDF assets and the intentionally empty `.nojekyll` marker are documented rather than modified with inappropriate comments.

## Audit findings and maintenance notes

1. **The main stylesheet is large.** `styles.css` is approximately 6,200 lines and contains historical component refinements. The current cascade is verified in Chromium, and comments now explain that later rules intentionally override earlier declarations. Consolidating it into smaller files could improve maintenance, but should be done as a separate visual-regression refactor rather than mixed into this comment pass.
2. **The site uses Google Fonts as an optional external presentation resource.** If that request is blocked, the CSS font stack falls back; the static site does not depend on a JavaScript framework or server runtime.
3. **External destinations were syntax/markup-checked, not guaranteed reachable.** A successful local build cannot guarantee third-party profile or documentation URLs will remain online.
4. **Accessibility coverage is a smoke check, not certification.** The browser tests inspect names, ARIA references, keyboard paths, focus behavior, and reduced motion, but do not replace a full manual screen-reader review or formal WCAG 2.2 AA audit.
5. **Security coverage is source hygiene, not a penetration test.** The project has no backend, secrets, cloud credentials, or live infrastructure integration. No penetration test or dependency vulnerability assessment was performed.
6. **GitHub-hosted deployment was not triggered from this audit.** The deployment workflow is parsed and locally validated, but a hosted Actions run and the live Pages deployment must be verified in the repository after publishing.
7. **The engineering labs are illustrative browser-local models.** Passing simulation tests verifies their local logic only; it does not prove AWS/Azure/GCP, Terraform providers, a real Kubernetes cluster, production telemetry, or cloud billing integration.

## Protected areas

The opening hero/orbital profile and the final full-connection section were not edited. The changes to `index.html` are comments at the head/runtime and technical-section boundaries outside those protected areas. No new Cloud/DevOps projects or professional experience claims were added.

## Re-run locally

From the `Portfolio/` directory, follow the commands in [CODE-READING-GUIDE.md](CODE-READING-GUIDE.md). CI installs Chromium through Playwright; on a local system browser installation, set `CHROMIUM_PATH` to the browser executable when running the four smoke scripts.
