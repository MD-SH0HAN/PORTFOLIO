# MD SHOHAN — Cloud & DevOps Engineering Portfolio

A single-page, dependency-free HTML/CSS/JavaScript career portfolio and technical learning library for an undergraduate aspiring to work in Cloud and DevOps engineering. The main story prioritizes current career stage, evidence boundaries, and inspectable repository artifacts; the deeper reference library covers cloud infrastructure, delivery automation, Infrastructure as Code, containers, platform engineering, observability, SRE, DevSecOps, FinOps, and architecture patterns.

## Code reading and maintenance

Start with [CODE-READING-GUIDE.md](CODE-READING-GUIDE.md) for the runtime loading order, file responsibilities, evidence boundaries, and local test commands. Source files include comments at module, section, and non-obvious function boundaries; comments focus on intent and maintenance context rather than repeating syntax.

## Run locally

No build step or package installation is required. Serve the repository root with Python:

```bash
python -m http.server 8080
```

Open <http://127.0.0.1:8080/>. Any static HTTP server can be used. The site can also be opened as a local HTML file, although a local server gives more predictable browser behaviour.

## Information architecture

The page is organized in two layers: a recruiter-readable career story first, followed by a deeper technical reference and learning library.

1. **Profile and evidence guide** — undergraduate positioning, engineering principles, and a visible distinction between conceptual references, browser-local simulations, and implemented repository artifacts.
2. **Core systems foundations** — Linux, operating systems, networking, resource behaviour, shell/programming, Git, and API fundamentals.
3. **Cloud infrastructure engineering** — identity, network boundaries, compute, data, availability, recovery, and provider-neutral design patterns.
4. **Delivery and Infrastructure as Code** — source-to-runtime delivery, automated validation, immutable artifacts, CI/CD, Terraform/OpenTofu lifecycle, state, drift, and configuration management.
5. **Containers and platform operations** — Docker, Kubernetes workloads, probes, scheduling, resource boundaries, declarative operations, GitOps, and platform engineering.
6. **Reliability, observability, and security** — telemetry, SLOs, incident response, secure delivery, identity, secrets, recovery, and cost accountability.
7. **Integrated architecture and learning progression** — connected reference patterns, engineering decision records, readiness checkpoints, and an evidence-led learning sequence.
8. **Selected repository evidence** — four existing artifacts: the static portfolio application, repository quality/deployment workflow configuration, browser-local simulation models, and the engineering playbook. These are not presented as completed Cloud/DevOps project case studies.
9. **Technical reference appendix** — a 14-domain technology map, twelve conceptual architecture diagrams, and interactive browser-local workbench models.
10. **Connection** — the original full contact and social destination section.

The first hero/orbital profile and final full connection section are intentionally preserved as the visual bookends of the page. The middle sections can evolve as new evidence is added.

## Evidence in this repository

The portfolio has no standalone Cloud/DevOps project case studies yet. It still contains genuine, inspectable work that can be reviewed without presenting it as production infrastructure experience:

| Artifact | What can be inspected | Boundary |
|---|---|---|
| Static portfolio application | HTML, CSS, JavaScript, section navigation, accessible controls, architecture explorer, and responsive learning interfaces | A static website implementation; not a cloud infrastructure deployment |
| Repository quality and delivery automation | Structural checker, JavaScript syntax checks, Chromium smoke-test scripts, and GitHub Actions workflow definitions | Workflow configuration is inspectable; successful hosted deployment or external infrastructure operation is not implied |
| Engineering simulation models | Purpose-built browser-local models for system and delivery concepts, with local interaction tests | Illustrative models; no shell commands, cloud APIs, Kubernetes cluster, or production monitoring backend is called |
| Engineering playbook | Ten focused study guides, decision records, checklists, and reusable evidence templates | Technical documentation and learning material; not proof that each procedure was performed in production |

The `projects/` directory is intentionally empty until a future Cloud/DevOps implementation has reproducible setup, source, validation evidence, engineering decisions, and known limitations. The project gallery is not padded with hypothetical work.

## Monochrome engineering animations

The portfolio includes a coordinated set of browser-local engineering visualizations. The animation layer is implemented with native HTML, CSS, SVG, and JavaScript; it adds no package manager, build step, framework, external service, or runtime API dependency. The `animations.css` / `animations.js` pair preserves the original animation layer; `advanced-animations.css` / `advanced-animations.js` adds 26 purpose-built visual renderers and interactive domain-specific labs. Playback, state highlighting and accessibility utilities are shared, while each model's visual grammar is authored for its subject. Both layers are deliberately separate from the original global design system and add no runtime package or external API dependency.

| No. | Experience | Portfolio location | What it demonstrates |
|---:|---|---|---|
| 07 | Architecture line drawing | Architectures; Cloud, IaC, Containers, Platform references | SVG nodes and directional paths reveal progressively; diagrams retain a readable static structure. |
| 08 | Pipeline execution | Delivery; existing Workbench pipeline launcher | The existing CI/CD runner now covers Source, Validate, Build, Secure, Publish, Deploy, and Operate. Deliberate validation or security failures block downstream stages. |
| 09 | Terminal command animation | Workbench | A simulated command and output stream types in sequence with a restrained cursor; no visitor machine commands are executed. |
| 10 | Observability chart animation | Observability | Synthetic CPU, memory, request, error, latency, availability, and SLI samples update through a controlled local demonstration. |
| 11 | Technology map connection animation | Skills map | The technology relationship graph progressively appears and exposes connected groups. |
| 12 | Layer-by-layer architecture reveal | Cloud | A client-to-storage path is revealed in ordered infrastructure layers with step, reveal-all, and reset controls. |
| 14 | High-availability failover | Cloud / Resilience Design | A simulated primary-zone failure routes traffic to a ready secondary path; recovery and reset are available. |
| 16 | Artifact promotion journey | Delivery | One example immutable artifact digest advances through Development, Staging, and Production, including approval. |
| 17 | Security gate animation | Delivery / Secure Software Supply Chain | Eight sequential release controls can pass or stop at an injected failure; downstream gates are blocked. |
| 20 | Terminal command replay | Workbench | Docker, Kubernetes, Terraform, and Linux command sequences support play, pause, replay, step navigation, reset, and speed control. |
| 23 | Distributed tracing waterfall | Observability | A synthetic parent/child request trace shows service spans, relative duration, selection, and expand/collapse. |
| 24 | Incident timeline replay | Observability; linked from Workbench | A timestamped simulated release incident can be played, paused, stepped, replayed, and reset. |
| 26 | Auto-scaling simulation | Containers; linked from Workbench | Browser-local demand, CPU, desired/available replicas, cooldown, readiness, and scale-in are modelled with bounded replica counts. |
| 27 | Technology dependency spotlight | Skills map | Selecting a technology highlights its direct relationships and subdues unrelated nodes; clearing restores the full graph. |

The experiences reuse shared rendering and interaction patterns where appropriate: SVG path drawing, status labels, viewport-aware activation, terminal rendering, stage states, and a shared technology relationship model. They are placed in the existing engineering sections rather than collected into a separate animation gallery. Existing compact topic cards and the detail-dialog pattern remain in place.

All statuses use text and shape as well as grayscale contrast. Motion responds to the site's Reduce Motion setting and the operating-system preference; the information and direct controls remain available without animation. Diagrams are accessible as labelled SVGs or structured text, and meaningful controls are native keyboard-operable buttons, selects, and inputs.

**Simulation boundary:** pipeline execution, release gates, terminal output, tracing, incidents, metrics, failover, and scaling are illustrative browser-local demonstrations. No shell commands are run, no cloud or Kubernetes resources are changed, no security scan is executed, and no production monitoring backend is connected. Example digests and measurements are labelled as illustrative or synthetic.

## Advanced interactive engineering animation labs

The expanded animation layer adds **26 purpose-built learning models** distributed inside the engineering sections where their concepts are introduced. Each lab has its own visual renderer and visual grammar; the implementation shares playback and accessibility utilities, not a generic diagram layout. The diagrams are deliberately varied so the visual structure teaches the system being modelled rather than forcing every concept into horizontal step cards. Examples include:

- **Linux process lifecycle:** a branching state machine with a Waiting → Ready return transition and a terminal state that cannot restart.
- **Network request journey:** a vertical protocol stack that separates DNS resolution, TCP, TLS, HTTP, and the origin.
- **API request lifecycle:** a nested downstream call stack, an explicit optional cache hit/miss decision, a database path on cache miss, and an upward response unwind.
- **VPC routing:** a route-table inspector that applies longest-prefix selection to a destination rather than animating generic hops.
- **Network ACLs:** an ordered rule evaluator with explicit first-match and default-deny semantics.
- **GitOps:** desired-versus-live state comparison, drift evidence, controller action, and health status.
- **SLOs:** an error-budget instrument and burn-rate gauge; **telemetry:** a full-width investigation workspace pairing a latency signal chart and exact trace-ID log filter with a distributed span waterfall, a separate parentage tree, and a live active-span context inspector; **FinOps:** cost composition and capacity headroom.

Other models use the structure most suitable to their subject: dependency DAGs, convergence loops, rollout ReplicaSet boards, scheduler filter-and-score funnels, EndpointSlice trees, mTLS service boundaries, RPO/RTO instruments, threat-model data-flow maps, and software-supply-chain evidence envelopes. No shared horizontal progress rail is used as a substitute for the model's actual relationships.

| Portfolio section | Interactive models |
|---|---|
| Foundations | Linux process lifecycle; DNS/TCP/TLS/HTTP request journey; Git branching/merge DAG; API request lifecycle |
| Cloud infrastructure | Longest-prefix VPC routing; ordered subnet-ingress NACL evaluator; RPO/RTO recovery model |
| Delivery | Rolling, blue/green and canary strategy explorer |
| Infrastructure as Code | Terraform dependency graph; desired/observed drift review; Ansible first-run change and second-run idempotency |
| Containers / Kubernetes | Pod startup and readiness; scheduler filter-and-score; rolling update; ready EndpointSlice routing model |
| Platform engineering | GitOps drift/reconciliation; developer golden path; service-mesh mTLS request path |
| Reliability / observability | SLO error-budget burn; metrics/logs/traces correlation; incident impact and recovery timeline |
| Security / DevSecOps | OIDC trust-condition sequence; STRIDE threat model; SBOM/provenance/signature verification gates |
| FinOps | Adjustable illustrative cost composition; workload capacity/right-sizing trade-off |

Every lab has Play, Pause, Step and Reset controls. Interactive selectors and inputs change the relevant decision or calculation. The graph engine uses a topological ordering for dependency execution. Route selection applies IPv4 longest-prefix matching. The NACL example evaluates ordered ingress rules and explicitly notes that return traffic requires egress rules. The scheduler demo filters by sample resource fit and scores the eligible nodes with a clearly identified simplified scoring model. The SLO model calculates error-budget consumption and burn rate from the selected objective and sample availability. The FinOps model exposes its assumed sample rates in the explanation. The observability model keeps the sample records' trace ID immutable: a matching ID reveals the four associated synthetic log events and four spans, while a non-matching ID returns explicit empty states. The latency series remains aggregate time-series context; its highlighted exemplar links the outlier sample to the trace rather than pretending the metric itself is filtered by trace ID. Selecting a trace span updates its service, span ID, and parent span in the inspector.

The 12 architecture-gallery cards each receive their own Draw flow / Replay flow control. Motion is activated on demand rather than running continuously as the visitor scrolls. Reduced-motion mode retains the full static topology and does not force packet or reveal animation. Long diagrams remain internally scrollable on narrow screens; the document itself is tested for horizontal overflow at 320, 390, 768 and 1440 CSS pixels.

**Simulation boundary:** all 26 labs, their metrics, route tables, workload constraints, identity claims and cost rates are local illustrative models. They do not run Git, Terraform, Ansible or shell commands; they do not create Kubernetes/cloud resources; they do not exchange OIDC tokens; they do not connect to telemetry or billing backends. They teach the reasoning and control flow, not production execution evidence.

## Interaction and diagram refinements

- The architecture path drawing uses a solid, responsive SVG canvas and separates name resolution from application traffic. The client exchanges a DNS query/answer with the resolver, then sends HTTPS/TLS directly to the public edge. The load balancer selects one healthy private application replica from the eligible pool across availability zones A and B (the diagram does not imply simultaneous fan-out). Each replica exchanges database queries and results with the managed primary. A dashed, one-way path then shows primary-to-recovery replication as a separate final stage. Four ordered stages progressively reveal seven nodes and eight animated path packets; reduced-motion preferences retain the complete static topology, and mobile scrolling stays inside the diagram canvas rather than widening the page.
- The architecture “Draw connections” control now reliably replays its sequence, with a live completion status. The technology-map “Draw connections” control now restarts the SVG line animation correctly; SVG stroke offsets are controlled by the animation state rather than conflicting inline styles.
- The technology graph separates each node’s SVG positioning transform from its entrance-animation transform, preventing nodes from collapsing to the SVG origin. Its orthogonal connection paths now follow a clear source/delivery, provisioning, container-supply-chain, platform, and observability layout. The map remains readable in a horizontally scrollable mobile canvas, while its native technology buttons provide keyboard-accessible dependency spotlighting and clear-selection behaviour. The completion status waits for the staggered connection draw to finish.
- Enabled portfolio buttons have been audited for click handlers. The Chromium DOM audit found 171 rendered buttons with direct click handlers and no enabled button missing a handler. Existing hero and footer sections were not modified.
- Buttons in the portfolio body (excluding the hero) have consistent hover, active, and keyboard-focus feedback while retaining their existing primary/secondary visual hierarchy.

## Interactions and accessibility

- Quick Jump / command palette: `Ctrl/⌘ + K`.
- Theme: `T` (persisted when browser storage is available).
- Contact: `C`.
- Accessibility settings: `A`.
- Keyboard shortcut help: `?`.
- Close dialogs: `Esc`.
- Single-letter shortcuts are suspended while the visitor is typing in a form field.
- Accessibility settings include persistent Reduce Motion and Increase Contrast preferences.
- Navigation, gallery filters, sliders, simulators, and calculator controls are keyboard-operable native HTML controls.

## Data and evidence boundaries

- Personal information, education, existing email addresses, profile links, portrait, and downloadable PDF are retained from the source portfolio.
- The portfolio describes MD Shohan as a Bangladesh University CSE undergraduate developing engineering capability. It does not claim professional DevOps employment, production ownership, certifications, or mastery of every tool.
- Architecture diagrams are conceptual references; they do not depict a live cloud account, managed Kubernetes cluster, production observability stack, or developer portal.
- Observability metrics are synthetic illustration data. The FinOps estimator uses fictional, clearly labeled unit rates and is not provider pricing.
- Interactive workbenches use browser-local state. They do not call a real CI platform, Terraform provider, Kubernetes cluster, Prometheus server, cloud billing API, or application endpoint.
- No standalone Cloud/DevOps project case studies are published yet. The Evidence section documents four existing portfolio artifacts instead: the website implementation, repository quality/deployment workflow configuration, browser-local simulations, and ten playbook guides. The `projects/` directory remains intentionally empty until an independently inspectable Cloud/DevOps implementation is ready.
- The downloadable technical PDF has updated middle pages 2–4. Its first and last pages reuse the supplied pages and render pixel-identically to the original; the website hero and final contact section source blocks are unchanged. The print-ready HTML master is the editable source for its five-page technical content.
- No LinkedIn profile was present in the source portfolio, so no LinkedIn URL has been invented.

## Structure

```text
Portfolio/
├── index.html
├── styles.css
├── animations.css
├── advanced-animations.css
├── final-interactions.css
├── script.js
├── animations.js
├── advanced-animations.js
├── final-interactions.js
├── Profile Photo.webp
├── README.md
├── .gitignore
├── .nojekyll
├── 404.html
├── robots.txt
├── sitemap.xml
├── LICENSE
├── requirements-dev.txt
├── assets/
│   ├── favicon.png
│   ├── portrait-placeholder.svg
│   ├── social-preview.png
│   └── MD-SHOHAN-DevOps-Portfolio.pdf
├── documents/
│   ├── engineering-playbook/       # ten guides + index
│   ├── one-page-profile-print.html
│   ├── technical-portfolio-print.html
│   └── README.md
├── projects/                       # intentionally empty until verified work exists
├── scripts/
│   ├── check_portfolio.py
│   ├── browser_smoke.py
│   ├── advanced_animation_smoke.py
│   └── final_interactions_smoke.py
└── .github/
    ├── dependabot.yml
    └── workflows/
        ├── portfolio-quality.yml
        └── deploy-pages.yml
```

## Validation

Run the dependency-free repository checks:

```bash
python scripts/check_portfolio.py
node --check script.js
node --check animations.js
node --check advanced-animations.js
node --check final-interactions.js
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
python scripts/browser_smoke.py
python scripts/advanced_animation_smoke.py
python scripts/final_interactions_smoke.py
```

The first five commands validate the repository without extra dependencies. The remaining commands install and run optional browser-only test tooling; this tooling is not needed to serve or deploy the static site. The checker validates required sections and controls, the three-tier evidence guide, four inspectable portfolio artifacts, all 12 architecture patterns, 14 technical domains, all original animation mounts, 26 individual concept-specific visual renderers, the absence of shared horizontal progress rails, 12 gallery draw controls, the seven-stage delivery runner, eleven linked engineering playbook documents, unique IDs, local fragment and asset references, basic accessibility safeguards, SEO/structured data, the downloadable PDF, favicon size, retired paths, and the intentionally empty projects directory. All four JavaScript files are syntax-checked. The deployment workflow includes all six animation/interaction assets, assembles only the public site files, validates them, and publishes the static artifact.

## Deployment

The site is static and can be hosted on GitHub Pages, Cloudflare Pages, Netlify, or any static web server. There is no package installation, environment file, API key, or server-side runtime requirement.

**GitHub Pages (automated):** in the repository, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. Push to `main` (or run the `Deploy portfolio to GitHub Pages` workflow manually) to validate and publish the static site. The build job runs structural checks, JavaScript syntax checks, and Chromium browser smoke tests before uploading the artifact; the deploy job receives only the Pages and OIDC permissions it needs. The canonical URL and social metadata are configured for `https://md-sh0han.github.io/PORTFOLIO/`; keep the repository name `PORTFOLIO` unless you also update those URLs in `index.html`, `sitemap.xml`, `robots.txt`, and `script.js`.

**Other static hosts:** publish the repository root as the site directory. Do not set a separate build command or output directory.

## License and identity

See `LICENSE` for repository terms. Public profile links and contact details are defined in the website source.

## Content depth and learning progression refinement (v4)

- Operational checklists inside engineering topic cards are now progressively disclosed through native `<details>` controls. This keeps each card's core explanation visible while allowing readers to open practical checks when they need them; all original checklist items are preserved.
- Twelve focused engineering notes deepen existing subjects without expanding the technology inventory: Linux resource-pressure triage, layered network diagnosis, source-to-artifact traceability, Terraform state and plan review, CI runner trust and artifact identity, Kubernetes scheduling and probe semantics, controller reconciliation, GitOps deletion/drift policy, Prometheus cardinality and histogram behaviour, SLI/SLO measurement, federated IAM trust, and recovery objectives.
- The learning progression now presents five capability stages with explicit readiness exercises and evidence criteria. It is intentionally a dependency sequence rather than a calendar or a claim that any stage has already been mastered.
- Section guidance highlights the central engineering decision in Foundations, Delivery, IaC, Platform, and Reliability. The Projects section and its evidence boundaries were not changed.
- The disclosures use native keyboard-operable HTML controls and retain their content in the document for assistive technology and reduced-motion environments.

**v4 verification:** `python scripts/check_portfolio.py`, `node --check script.js`, and `node --check animations.js` pass. Chromium validation of the inlined page confirmed 41 operational disclosures, 12 engineering depth notes, five roadmap readiness checks, working keyboard activation for the new disclosures, zero page JavaScript errors, and no page-level horizontal overflow at 1024, 768, 390, or 360 pixels.


## Connected architecture, decision records and primary sources (v5)

The integrated engineering reference now includes a selectable seven-stage reference architecture:

1. Git source and reviewed intent.
2. CI verification and runner trust.
3. Infrastructure provisioning and plan review.
4. Artifact identity, SBOM and signature verification.
5. GitOps desired-state reconciliation.
6. Kubernetes workload health and traffic readiness.
7. Telemetry, SLOs and operational feedback.

The architecture also identifies cross-cutting security controls (federated identity, least privilege, secrets handling, policy/audit and network boundaries) and explains how operational findings return to the reviewed source workflow. Stage selection updates the design question, verification evidence, failure boundary and related section link. The diagram remains explicitly conceptual; it does not claim a deployed end-to-end system.

Seven expandable engineering decision records cover Terraform plan/state review, Kubernetes readiness, CI OIDC trust, GitOps ownership and pruning, Prometheus cardinality, user-centred SLOs, and the distinction between high availability and disaster recovery. Each record connects a decision to a verification method and an operational trade-off.

The evidence protocol distinguishes three levels: conceptual reference, reproduced local/disposable lab, and independently inspectable implementation. Practical claims should include environment and tool versions, reproducible steps, expected and observed results, failure diagnosis, cleanup, and limitations. The website's current diagrams and interactive simulations remain identified as references or synthetic browser-local models.

A curated library contains 22 primary documentation links across five areas: AWS and workload identity; Terraform; Kubernetes, Argo CD and Helm; Docker, OCI distribution, Sigstore and observability; and Google SRE. The links are maintained as starting points; users should check version-specific details against the target environment.

**v5 validation additions:** the repository checker requires the connected architecture, seven selectable stages, decision records, evidence protocol, and source library. The architecture interaction is tested in Chromium for stage selection, detail updates, anchor integrity, keyboard operation, and responsive overflow. The Projects section remains unchanged from v4.


## Engineering playbook (v6)

A practical reference layer now links six Markdown documents from the evidence protocol: a playbook index, Linux/network troubleshooting, container/Kubernetes troubleshooting, Terraform/CI/CD change review, operational readiness/incident response, and a reusable learning/lab evidence record. The guides emphasize read-only diagnosis first, context confirmation before mutation, safe lab boundaries, explicit interpretation, cleanup, and the difference between conceptual material and reproduced evidence. They are study resources, not claims of completed labs or production operations.

The GitHub Actions checkout steps disable persisted checkout credentials because neither workflow needs to push commits. The workflows pin third-party actions to full commit SHAs, use a separate build and deploy job with job-scoped permissions, and rely on Dependabot to propose weekly GitHub Actions updates. Review update diffs before accepting them; automatic updates are not a substitute for trust review.

## Architecture decision practice and quality engineering (v7)

The architecture review studio adds four keyboard-operable scenarios: managed container service versus Kubernetes, multi-AZ versus multi-region, rolling versus blue/green/canary delivery, and local versus remote Terraform state. Each scenario frames requirements, alternatives, verification and failure tests instead of presenting a universal answer. The examples remain conceptual exercises.

Five additional study guides cover ADR writing, STRIDE-inspired threat modelling, FinOps/capacity review, incident postmortems, and engineering quality assurance. The full playbook now includes an index and ten topic guides.

A Playwright/Chromium smoke test exercises the command palette, accessibility dialog, theme control, connected architecture explorer, architecture filters, pipeline simulation, keyboard operation of decision scenarios, local document links and six viewport widths. Browser tooling is isolated in `requirements-dev.txt`; it is not part of the published site's runtime. GitHub Actions installs Chromium and runs the smoke test on pushes and pull requests and again as a fail-closed gate before the Pages artifact is published.

The Pages workflow now has a content-read-only build job and a separate deployment job with Pages-write and OIDC permissions. Third-party actions are pinned to full commit SHAs. Dependabot checks pinned GitHub Actions weekly so SHA updates can be reviewed deliberately.

**v7 validation:** the repository checker verifies all eleven playbook documents, four architecture-review scenarios, full-SHA action references, job-scoped least-privilege permissions, the Dependabot update policy and the browser-test workflow wiring. Chromium completed 17 local browser smoke checks across six viewport widths, including a basic accessibility-semantics check (not a WCAG conformance audit). That test does not claim that any cloud workload or external production deployment exists.


## Final pre-deployment audit (v9)

The original local Chromium suite reports **41 passing checks**; the focused advanced animation suite reports **40 passing checks** across the 26 labs, shared engines, custom calculations, interactive controls, gallery animations, and responsive widths. The architecture-path tests verify the solid canvas in both themes, separate DNS query and answer directions, client-to-edge HTTPS ingress, edge-to-eligible-replica branches, bidirectional application/database traffic, and the distinct one-way dashed replication path. The suite also covers architecture replay and packet motion, the SLO selector and synthetic incident lifecycle, Terraform and FinOps workbenches, technology-map selection/replay, contrast preference, progressive reveals after navigation to distant sections, and narrow-viewport section navigation. The browser run captures uncaught page errors and browser-console errors; none occurred in the final local run. Responsive checks cover 320, 360, 390, 768, 1024, and 1440 CSS pixels.

The repository checker now rejects generated bytecode/cache folders and common OS/editor artefacts so they cannot silently enter a release archive. The final source audit also parsed all three CSS files with a CSS syntax parser, parsed all GitHub Actions and Dependabot YAML files, and confirmed that the downloadable PDF contains five A4 pages. These additional parser checks were performed locally; they are not dependencies of the published site.

**Verification scope:** these are local source, browser, packaging and document checks. They are not a hosted GitHub Actions run, a full WCAG conformance audit, a security penetration test, an external-link availability guarantee, or proof of deployed cloud infrastructure. The diagrams and workbenches remain conceptual or synthetic, and the Projects directory remains intentionally empty until genuine work is ready.


## Final interaction and presentation layer (v10)

The finishing interaction layer adds six focused refinements without changing the hero/about section, final contact section, or downloadable technical PDF:

1. **Solid page canvas:** the page background is a flat theme color in both dark and light modes. Cursor-following grid overlays, directional pointer links, card spotlights, and pointer-driven card tilt are intentionally removed. Diagram-specific visual structure remains inside the architecture and learning visualizations.
2. **Architecture detail views:** all twelve architecture gallery patterns have an expansion control. A native dialog presents the selected diagram, a pattern-specific five-step explanation, zoom/reset, flow drawing, a close control, and focus restoration to the invoking card. The content remains labelled conceptual.
3. **Learning-path navigator:** the five existing stages gain a keyboard-operable focus navigator and a matching readiness-checkpoint action. Selecting a stage changes navigation focus only; it does not claim completion, mastery, or verified skill.
4. **Enhanced command palette:** the existing Quick Jump supports ten topic filters, token-based search across sections, labs, architecture patterns and technology entries, a result count, keyboard navigation, and locally remembered recent destinations. If browser storage is unavailable, the current session still retains recents in memory.
5. **Interaction feedback:** the existing status toast communicates information, success and error states; new controls have visible focus, hover and disabled states.
6. **Mobile refinements:** the architecture dialog uses an internally scrollable diagram viewport with zoom controls, the command filters can be scrolled horizontally, and oversized SVG graphs remain pannable without widening the page.

The implementation is provided by `final-interactions.css` and `final-interactions.js`. It adds no framework, third-party runtime dependency, server, analytics, or external API. It uses native HTML, CSS, SVG and browser JavaScript.

**v10 verification:** the focused final-interaction suite completed 26 browser checks after the solid-background refinement. The original portfolio suite completed 41 checks and the advanced animation suite completed 40 checks, for 107 local Chromium checks in total. The repository checker, JavaScript syntax checks, CSS/YAML parsing, and extracted-archive validation also passed. These checks are not a full WCAG audit, a security penetration test, or a hosted GitHub Actions execution.


## Solid-background refinement (v11)

The cursor-following engineering grid, SVG pointer connection overlay, card spotlight, and pointer-driven 3D card tilt have been removed. The site canvas and selected diagram canvases now use solid theme surfaces without decorative page/diagram grid textures. Existing card surfaces, hover affordances, architecture diagrams, and diagram-specific visualizations remain intact. The first/about and final/contact sections retain their original content and structure.


## Compact portfolio overview in the intro (v13)

The separate long overview section was intentionally removed. A compact, icon-led five-area index now sits inside the existing intro hero, with short topic labels and a four-number content snapshot (14 learning domains, 12 architecture patterns, 26 browser-local labs, and 10 playbook guides). It uses the site's existing line-based visual language: no large filled cards, no extra section, no icon CDN, and no external runtime dependency. The original profile copy, portrait, education details, and existing engineering identity remain intact. The five links point to the existing Foundations, Cloud, Delivery, Observability, and Architecture Gallery sections.




## Evidence-first portfolio refinement

The main reading order now presents the learning journey and repository evidence before the optional technology/architecture/workbench appendix. The advanced Kubernetes/platform material follows the container foundations. The About section explains the three evidence types used throughout the page: conceptual reference, browser-local simulation, and implemented repository artifact. The Evidence section documents only work that already exists in this repository; it does not fabricate standalone Cloud/DevOps projects.

The opening hero/orbital profile, principles strip, and final full connection section are preserved byte-for-byte in the source. New styling is scoped to the internal engineering/evidence sections.


## Final code audit and source comments

The source now includes human-oriented comments at module, section, function, trust-boundary, and workflow boundaries. See [CODE-READING-GUIDE.md](CODE-READING-GUIDE.md) for the runtime map and test commands, and [FINAL-CODE-AUDIT.md](FINAL-CODE-AUDIT.md) for the 145-check local verification record and its limitations.
