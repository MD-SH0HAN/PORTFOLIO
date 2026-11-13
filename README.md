# MD SHOHAN — Cloud & DevOps Engineering Portfolio

A single-page, dependency-free HTML/CSS/JavaScript portfolio and technical knowledge map. The design remains monochrome and engineering-focused while the information architecture now covers cloud infrastructure, delivery automation, infrastructure as code, containers, platform engineering, observability, SRE, DevSecOps, FinOps, and reference architectures.

## Run locally

No build step or package installation is required. Serve the repository root with Python:

```bash
python -m http.server 8080
```

Open <http://127.0.0.1:8080/>. Any static HTTP server can be used. The site can also be opened as a local HTML file, although a local server gives more predictable browser behaviour.

## Information architecture

1. **Hero and engineering mindset** — personal introduction, existing education context, engineering principles, GitHub, email, and portfolio download.
2. **Core foundations** — Linux, operating systems, networking, computer systems, shell/programming, Git, and API fundamentals.
3. **Cloud infrastructure engineering** — cloud fundamentals, compute, VPC/VNet, public/private/data subnets, gateways, load balancing, managed storage and databases, IAM, DNS/TLS, high availability, and disaster recovery.
4. **DevOps and CI/CD** — source-to-runtime delivery, automated validation, security gates, container builds, registries, deployment, and rollback concepts.
5. **Infrastructure as Code** — Terraform/OpenTofu lifecycle, providers, resources, variables, outputs, modules, state, remote backends, drift, CloudFormation, and Ansible.
6. **Docker and Kubernetes** — image lifecycle, volumes, networking, Compose, control plane, nodes, Pods, Deployments, ReplicaSets, Services, Ingress, ConfigMaps, Secrets, PV/PVC, namespaces, RBAC, Helm, probes, updates, and autoscaling.
7. **Platform engineering and GitOps** — internal developer platforms, self-service, golden paths, Backstage, Argo CD, Flux, and reconciliation.
8. **Observability and SRE** — metrics, logs, traces, synthetic dashboards, Prometheus/Grafana/OpenTelemetry concepts, SLI/SLO/SLA, error budgets, incidents, and root cause analysis.
9. **Cloud security and DevSecOps** — identity, network security, encryption, secrets, scanning, software supply chain, policy as code, and compliance concepts.
10. **FinOps** — right-sizing, autoscaling, budgets, tagging, storage and egress, idle resource detection, and a browser-local illustrative cost estimator.
11. **Architecture gallery** — twelve responsive conceptual diagrams: three-tier cloud, high availability, VPC/subnets, CI/CD, Docker, Kubernetes, Terraform, GitOps, observability, DevSecOps, microservices, and disaster recovery.
12. **Projects and evidence** — explicit empty state; no completed work, client deployment, certification, or achievement is fabricated.
13. **Interactive workbench** — existing CI/CD failure-gate simulator, Kubernetes readiness state machine, SLO/error-budget calculator, and incident simulator, plus Terraform lifecycle and illustrative cost simulations.
14. **Technology map and learning progression** — categorized technology reference, search/filter explorer, and ordered study path.

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
- No completed project case studies are published yet. New work should be added only when the repository, setup, architecture, tests, and results can be verified.
- The existing downloadable PDF is retained as supplied; the updated, detailed source documentation is available in the website and print-ready HTML masters under `documents/`.
- No LinkedIn profile was present in the source portfolio, so no LinkedIn URL has been invented.

## Structure

```text
Portfolio/
├── index.html
├── styles.css
├── script.js
├── assets/
│   ├── favicon.svg
│   ├── portrait-placeholder.svg
│   ├── social-preview.png
│   └── MD-SHOHAN-DevOps-Portfolio.pdf
├── documents/
│   ├── one-page-profile-print.html
│   ├── technical-portfolio-print.html
│   └── README.md
├── projects/                 # intentionally empty until verified work is published
├── scripts/
│   └── check_portfolio.py
├── Profile Photo.webp
└── .github/workflows/portfolio-quality.yml
```

## Validation

Run the dependency-free repository checks:

```bash
python scripts/check_portfolio.py
node --check script.js
```

The checker validates section anchors, required interactive controls, architecture coverage, unique HTML IDs, local fragment and asset references, theme-related CSS structure, retired paths, and the intentionally empty projects directory.

## Deployment

The site is static and can be hosted on GitHub Pages, Cloudflare Pages, Netlify, or any static web server. Upload the repository contents as-is; there is no package installation, environment file, API key, or server-side runtime requirement. Preserve the repository base path used by the canonical URL when deploying to GitHub Pages.

## License and identity

See `LICENSE` for repository terms. Public profile links and contact details are defined in the website source.
