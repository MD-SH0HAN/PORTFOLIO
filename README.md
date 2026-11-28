# MD SHOHAN — Cloud & DevOps Engineering Portfolio

A dependency-free, single-page engineering portfolio and technical learning library focused on **Cloud Engineering, DevOps, platform operations, reliability, and secure delivery**.

I am a Computer Science and Engineering undergraduate at Bangladesh University, building my engineering capability across Cloud and DevOps. This portfolio is designed to present that journey honestly while providing a substantial technical reference for the systems and practices I am studying. It combines a personal profile, inspectable repository work, architecture references, interactive browser-local labs, and an engineering playbook.

> **Evidence-first:** this repository demonstrates a static web application, repository automation, technical documentation, and browser-local engineering simulations. It does **not** claim professional DevOps employment, production infrastructure ownership, certifications, or completed production Cloud/DevOps projects.

**Live portfolio:** [md-sh0han.github.io/PORTFOLIO](https://md-sh0han.github.io/PORTFOLIO/)  
**Repository guide:** [`CODE-READING-GUIDE.md`](CODE-READING-GUIDE.md) · **Audit record:** [`FINAL-CODE-AUDIT.md`](FINAL-CODE-AUDIT.md)

---

## Contents

- [Portfolio at a glance](#portfolio-at-a-glance)
- [What the portfolio contains](#what-the-portfolio-contains)
- [Technical coverage](#technical-coverage)
- [Interactive engineering labs](#interactive-engineering-labs)
- [Architecture and engineering decision practice](#architecture-and-engineering-decision-practice)
- [Repository evidence and scope](#repository-evidence-and-scope)
- [Run locally](#run-locally)
- [Validation and tests](#validation-and-tests)
- [Deployment](#deployment)
- [Accessibility and interaction](#accessibility-and-interaction)
- [Repository structure](#repository-structure)
- [Engineering principles](#engineering-principles)
- [License and contact](#license-and-contact)

## Portfolio at a glance

| Area | Included |
|---|---:|
| Technical learning domains | **14** |
| Conceptual architecture patterns | **12** |
| Interactive browser-local engineering labs | **26** |
| Engineering playbook topic guides | **10** |
| Selectable end-to-end reference architecture stages | **7** |
| Engineering decision records | **7** |
| Architecture review scenarios | **4** |

The site is built with native **HTML, CSS, SVG, and JavaScript**. It has no framework, package manager, build step, server-side runtime, analytics dependency, or external API requirement for normal operation.

## What the portfolio contains

The page follows an evidence-first reading order: the personal engineering story and repository evidence come before the deeper technical appendix.

1. **Profile and engineering principles** — current learning stage, background, goals, and an explanation of how evidence is classified.
2. **Systems foundations** — Linux, operating-system concepts, networking, shell and programming fundamentals, Git, and APIs.
3. **Cloud infrastructure** — identity, network boundaries, compute, data, availability, recovery, and provider-neutral architecture concepts.
4. **Delivery engineering** — CI/CD, validation gates, artifact identity, release strategies, and secure software supply-chain concepts.
5. **Infrastructure as Code** — Terraform/OpenTofu workflows, dependency graphs, state and plan review, drift, and configuration management.
6. **Containers and platform engineering** — Docker, Kubernetes workloads, scheduling, probes, resource limits, GitOps, and service-mesh concepts.
7. **Reliability and security** — metrics, logs, traces, SLOs, incident response, DevSecOps, identity, recovery, and FinOps.
8. **Architecture and learning library** — conceptual patterns, decision records, readiness exercises, primary documentation links, and an engineering playbook.
9. **Repository evidence** — the existing website implementation, automation configuration, local simulations, and technical documentation.
10. **Contact and profile links** — the original contact destinations and profile information.

## Technical coverage

The technical library is grouped by engineering responsibility rather than presented as an unstructured list of tools.

| Domain | Topics explored |
|---|---|
| Systems foundations | Linux processes and resources, operating systems, shell, Git, APIs |
| Networking | DNS, TCP, TLS, HTTP, routing, subnet boundaries, network access controls |
| Cloud infrastructure | IAM, workload identity, networking, compute, data, availability, recovery |
| Delivery engineering | CI/CD, runners, artifact promotion, release strategies, validation gates |
| Infrastructure as Code | Terraform/OpenTofu, dependency planning, state, drift, Ansible idempotency |
| Containers | Images, registries, runtime behaviour, resource boundaries |
| Kubernetes | Workloads, probes, scheduling, rollouts, services, EndpointSlices |
| Platform engineering | Golden paths, GitOps, reconciliation, service-mesh concepts |
| Observability | Metrics, logs, traces, correlation, latency, incident timelines |
| Site reliability engineering | SLIs, SLOs, error budgets, burn rates, incident learning |
| Security and DevSecOps | OIDC, least privilege, STRIDE, SBOMs, provenance, signatures |
| Resilience engineering | High availability, failover, RPO, RTO, recovery planning |
| FinOps | Cost composition, capacity, utilization, right-sizing trade-offs |
| Architecture practice | Design alternatives, verification strategies, failure modes, decision records |

The portfolio also links to a curated set of primary documentation across AWS, Terraform, Kubernetes, Argo CD, Helm, Docker, OCI, Sigstore, observability, and Google SRE. These links are learning starting points; version-specific behaviour should always be checked against the documentation for the target environment.

## Interactive engineering labs

The portfolio includes **26 purpose-built browser-local models** embedded in the sections where their concepts are introduced. Each model uses a visual structure suited to the system being explained—for example, a dependency graph for execution order, a route-table inspector for packet routing, or a rollout board for Kubernetes deployment strategies.

| Section | Models and concepts |
|---|---|
| Foundations | Linux process lifecycle; DNS/TCP/TLS/HTTP request journey; Git branching and merge graph; API request lifecycle |
| Cloud infrastructure | Longest-prefix VPC route selection; ordered network ACL evaluation; RPO/RTO recovery model |
| Delivery | Rolling, blue/green, and canary release strategy comparison |
| Infrastructure as Code | Terraform dependency graph; desired-versus-observed drift review; Ansible first-run changes and second-run idempotency |
| Containers and Kubernetes | Pod startup and readiness; scheduler filter-and-score; rolling update; ready EndpointSlice routing |
| Platform engineering | GitOps drift and reconciliation; developer golden path; service-mesh mTLS request path |
| Reliability and observability | SLO error-budget burn; metrics/logs/traces correlation; incident impact and recovery timeline |
| Security and DevSecOps | OIDC trust-condition sequence; STRIDE threat model; SBOM/provenance/signature verification gates |
| FinOps | Illustrative cost composition; workload capacity and right-sizing trade-offs |

Labs provide controls such as **Play, Pause, Step, and Reset** where applicable. Selectors and inputs update the relevant model or calculation. Examples include IPv4 longest-prefix matching, ordered first-match network ACL evaluation, a simplified scheduler scoring model, SLO error-budget calculations, and trace-to-log correlation using synthetic records.

### Simulation boundary

These labs teach concepts and decision flow; they are not connected to real infrastructure. They do not execute shell, Git, Terraform, or Ansible commands; create cloud or Kubernetes resources; exchange live OIDC tokens; run security scans; or connect to monitoring, billing, or deployment backends. Metrics, identities, route tables, workload constraints, and cost rates are illustrative local data.

## Architecture and engineering decision practice

### Connected reference architecture

A selectable seven-stage reference architecture follows a typical source-to-operation lifecycle:

1. Git source and reviewed intent.
2. CI verification and runner trust.
3. Infrastructure provisioning and plan review.
4. Artifact identity, SBOM, and signature verification.
5. GitOps desired-state reconciliation.
6. Kubernetes workload health and traffic readiness.
7. Telemetry, SLOs, and operational feedback.

Cross-cutting controls include federated identity, least privilege, secrets handling, policy and audit, and network boundaries. Selecting a stage reveals its design question, verification evidence, failure boundary, and related portfolio section. The architecture is a **conceptual reference**, not a deployed end-to-end system.

### Architecture patterns and decision records

The architecture gallery contains **12 conceptual patterns**, each with an explanation and an on-demand flow drawing. Expanded views provide a pattern-specific walkthrough, zoom/reset controls, and a static readable diagram when motion is reduced.

Seven engineering decision records explore:

- Terraform plan and state review
- Kubernetes readiness semantics
- CI OIDC trust
- GitOps ownership and pruning
- Prometheus cardinality
- User-centred SLO design
- High availability versus disaster recovery

The architecture review studio adds four scenario-based exercises: managed container service versus Kubernetes, multi-AZ versus multi-region, rolling versus blue/green/canary delivery, and local versus remote Terraform state. Each scenario frames requirements, alternatives, verification, and failure testing rather than presenting one answer as universally correct.

## Repository evidence and scope

There are not yet standalone Cloud/DevOps project case studies in this repository. Instead, the following existing artifacts can be inspected directly:

| Artifact | What can be reviewed | What it does not prove |
|---|---|---|
| Static portfolio application | HTML, CSS, JavaScript, responsive layouts, navigation, accessible controls, diagrams, and learning interfaces | A cloud-hosted application or production infrastructure deployment |
| Repository quality and delivery automation | Structural checker, JavaScript syntax checks, Chromium smoke-test scripts, and GitHub Actions workflow definitions | A successful hosted deployment or operation of external infrastructure |
| Engineering simulation models | Browser-local models and their interaction logic | Real shell execution, cloud API calls, cluster operations, or production telemetry |
| Engineering playbook | Ten topic guides, decision records, checklists, and reusable evidence templates | Proof that every documented procedure has been performed in a production environment |

The `projects/` directory is intentionally empty until a Cloud/DevOps implementation has reproducible setup instructions, source code, validation evidence, engineering decisions, and documented limitations. The portfolio does not fill that space with hypothetical projects.

### Evidence levels

The site distinguishes three levels of evidence:

- **Conceptual reference** — diagrams and explanations that communicate architecture or engineering principles.
- **Local reproduction or simulation** — behaviour reproduced in a local or disposable environment, with the environment and limitations stated.
- **Inspectable implementation** — source, repeatable setup, validation results, decisions, and limitations that another person can review.

Practical claims should identify the environment and tool versions, reproducible steps, expected and observed results, failure diagnosis, cleanup, and known limitations.

## Run locally

No build step or package installation is required to view the site.

1. Clone or download this repository.
2. Open a terminal in the repository root.
3. Start a local static HTTP server:

   ```bash
   python -m http.server 8080
   ```

4. Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/) in a browser.

Any static HTTP server can be used. Opening `index.html` directly may also work, but a local server gives more predictable browser behaviour.

## Validation and tests

### Lightweight source checks

Run the structural checker and JavaScript syntax checks from the repository root:

```bash
python scripts/check_portfolio.py
node --check script.js
node --check animations.js
node --check advanced-animations.js
node --check final-interactions.js
```

These checks do not require the optional browser-test dependencies.

### Chromium browser tests

Install the development-only test requirements and Chromium:

```bash
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
```

Then run the browser smoke suites:

```bash
python scripts/browser_smoke.py
python scripts/advanced_animation_smoke.py
python scripts/final_interactions_smoke.py
```

The suites exercise key navigation and controls, architecture and lab interactions, keyboard behaviour, local document links, selected accessibility semantics, and responsive layouts. The repository checker also validates required content, local references, IDs, key controls, architecture patterns, lab renderers, workflow wiring, and release-file hygiene.

**Verification scope:** recorded results are local source and browser checks. They are not, by themselves, a hosted GitHub Actions result, a full WCAG conformance audit, a penetration test, a guarantee that external links remain available, or evidence of deployed Cloud/DevOps infrastructure. See [`FINAL-CODE-AUDIT.md`](FINAL-CODE-AUDIT.md) for the repository's detailed audit record. Re-run the commands above against the checkout you intend to publish.

## Deployment

This is a static site and can be hosted on GitHub Pages, Cloudflare Pages, Netlify, or another static web host. No environment file, API key, server-side runtime, or runtime package installation is required.

### GitHub Pages

The repository includes a GitHub Actions deployment workflow.

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main`, or manually run the **Deploy portfolio to GitHub Pages** workflow.
4. Review the workflow result and the published Pages site.

The workflow validates the site before publishing. The build and deployment jobs are separated, permissions are job-scoped, and third-party GitHub Actions are pinned to full commit SHAs. Dependabot is configured to propose weekly GitHub Actions updates; review proposed changes before merging them.

The canonical site URL and social metadata are configured for:

```text
https://md-sh0han.github.io/PORTFOLIO/
```

Keep the repository name `PORTFOLIO` unless you also update the canonical URLs in `index.html`, `sitemap.xml`, `robots.txt`, and `script.js`.

### Other static hosts

Publish the repository root as the site directory. Do not configure a build command or a separate build-output directory.

## Accessibility and interaction

The interface uses native HTML controls wherever practical and includes:

- Keyboard-operable navigation, filters, dialogs, selectors, sliders, and lab controls.
- Visible focus, hover, active, and disabled states.
- Persistent **Reduce Motion** and **Increase Contrast** preferences.
- Motion behaviour that respects the site's setting and the operating-system reduced-motion preference.
- Labelled SVG diagrams or structured text alternatives for important information.
- Responsive diagram viewports that keep wide technical graphics inside their own scrollable area on narrow screens.
- Dialog focus management, including returning focus to the control that opened the dialog.

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl` / `⌘` + `K` | Open Quick Jump / command palette |
| `T` | Change theme |
| `C` | Open contact section |
| `A` | Open accessibility settings |
| `?` | Show keyboard shortcut help |
| `Esc` | Close dialogs |

Single-letter shortcuts are suspended while typing in a form field.

## Repository structure

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
├── CODE-READING-GUIDE.md
├── FINAL-CODE-AUDIT.md
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
│   ├── engineering-playbook/       # index and ten topic guides
│   ├── one-page-profile-print.html
│   ├── technical-portfolio-print.html
│   └── README.md
├── projects/                       # reserved for verified implementation work
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

For the runtime loading order, file responsibilities, evidence boundaries, and maintenance notes, start with [`CODE-READING-GUIDE.md`](CODE-READING-GUIDE.md).

## Engineering principles

The portfolio is shaped by a few practical principles:

1. **Evidence over claims.** Distinguish learning, simulation, local reproduction, and independently inspectable implementation.
2. **Understand the system, not just the tool.** Explain control flow, dependencies, failure modes, and trade-offs.
3. **Verify before changing.** Prefer read-only diagnosis and context gathering before state-changing operations.
4. **Make work reproducible.** Record assumptions, versions, commands, expected outcomes, observed results, and cleanup.
5. **Design for failure.** Treat security, reliability, recovery, observability, and cost as connected engineering concerns.
6. **Keep the learning path honest.** Readiness checkpoints are exercises and evidence criteria, not claims of mastery or completed capability.

## License and contact

See [`LICENSE`](LICENSE) for repository terms. Contact details and public profile destinations are maintained in the website source. No LinkedIn URL is listed because one was not present in the source portfolio.
