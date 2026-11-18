# Engineering quality assurance matrix

**Evidence level:** portfolio quality standard and test plan. A listed test is not claimed as passed unless a dated result is recorded.

A professional static portfolio needs more than valid JavaScript. It should render correctly, expose meaningful semantics, work without a mouse, behave across viewport sizes, keep local links valid and publish only the intended static artifact.

## 1. Quality dimensions

| Dimension | Test approach | Release gate |
|---|---|---|
| Structure | Required sections, unique IDs, valid fragment and local asset references | No missing required anchor or local resource |
| Runtime | JavaScript syntax and browser console/page-error monitoring | No uncaught application exception |
| Accessibility | Semantic landmarks, accessible names, keyboard use, focus visibility, contrast and reduced motion | No known critical barrier; manual review remains required |
| Responsive layout | Test representative narrow, tablet, laptop and desktop viewports | No page-level horizontal overflow or clipped essential control |
| Interaction | Exercise dialogs, navigation, filters, calculators, simulators and expandable content | Each enabled control performs its labelled action and has a usable state |
| Content integrity | Verify evidence labels, dates, claim boundaries, sources and downloadable documents | No simulated or conceptual item represented as production evidence |
| Performance | Check image size, layout stability, unused resources and performance budgets | Meet the repository's declared budgets; investigate regressions |
| Deployment | Build the public directory, verify its contents, publish through protected Pages environment | Only intended public files are deployed; deployment identity is scoped |

## 2. Browser smoke-test plan

Test current supported Chromium, Firefox and WebKit when CI capacity permits. A Chromium-only pass is useful but does not establish cross-browser compatibility.

Representative viewport widths: 320, 360, 390, 768, 1024 and 1440 CSS pixels. Record browser/version, viewport, date, commit and test result.

Exercise at least:

1. Load the homepage; verify the hero, primary navigation, main content and contact section render.
2. Open and close the command palette by keyboard and by its control; verify focus is returned appropriately.
3. Open accessibility settings; toggle contrast and reduce-motion preferences; close the dialog.
4. Change theme and confirm readable contrast remains.
5. Select a stage in the connected-system explorer and verify its detail content changes.
6. Filter architecture cards and confirm the status text and visible cards update together.
7. Run successful and failing CI/CD simulation paths; confirm a failed gate blocks later stages.
8. Inject and recover the Kubernetes readiness and incident simulations; verify the status text reflects the modeled state.
9. Change FinOps calculator inputs and verify totals update without implying provider pricing.
10. Use only the keyboard to reach and operate all interactive controls.

Do not test only the initial page state. Also inspect dialogs, open details, error messages, theme variants and narrow layouts.

## 3. Accessibility review

Use automated checks as a screening tool, not a substitute for human review. Inspect heading order, landmark names, labels, live-region announcements, dialog labelling, focus order, focus visibility, contrast, zoom/reflow, reduced motion and meaningful link text. Test keyboard-only operation and at least one screen reader/browser combination before making a conformance claim.

Do not claim WCAG conformance based solely on an automated score. Record specific findings, affected components, severity, remediation and retest result.

## 4. Security and deployment checks

- Pin third-party GitHub Actions to reviewed full commit SHAs and keep a human-readable version comment.
- Use least-privilege workflow permissions and place deployment-only permissions in the deployment job.
- Set `persist-credentials: false` on checkout steps that do not need a persisted token.
- Separate pull-request validation from deployment authority.
- Protect the deployment environment and branch rules in repository settings.
- Exclude local-only files, source notes not intended for publication, tests and temporary artifacts from the public Pages directory.
- Do not put secrets, tokens, private URLs, debug traces or personal data in static assets.
- Review external scripts, fonts, images and links for necessity and privacy implications.

A workflow file can describe these settings, but repository branch protections, environment reviewers, required checks and organization policies must be configured in GitHub settings and verified there.

## 5. Test evidence record

```markdown
- Test run ID:
- Commit / revision:
- Date and timezone:
- Environment:
- Browser and version:
- Viewport(s):
- Commands / test suite:
- Passed checks:
- Failed checks:
- Screenshots or sanitized logs:
- Known limitations:
- Reviewer:
```

## 6. Release decision

A release candidate should have no known critical runtime, navigation, security or accessibility defect. Medium/low issues must be documented with owner and rationale. If any test was not run, mark it **not tested**; never turn an absence of failure into a passed result.
