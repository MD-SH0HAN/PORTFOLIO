# Engineering Playbook

A practical companion to the Cloud & DevOps knowledge portfolio. These guides are written as **study and lab procedures**, not claims that the author has operated production systems. Commands are examples: adapt paths, names, permissions and versions to the environment, and run potentially disruptive actions only in a disposable lab.

## Guides

1. [Linux and network troubleshooting](linux-network-troubleshooting.md) — isolate failures by layer and collect evidence before changing configuration.
2. [Containers and Kubernetes troubleshooting](containers-kubernetes-troubleshooting.md) — diagnose image, scheduling, startup, readiness, service and resource problems.
3. [Terraform and CI/CD change review](terraform-cicd-review.md) — protect state, review plans, constrain workflow identity and preserve artifact provenance.
4. [Operational readiness and incident response](operational-readiness.md) — define service signals, prepare runbooks, recover safely and learn from incidents.
5. [Learning and lab evidence record](learning-evidence-template.md) — record what was reproduced, what failed, what was observed and what remains unknown.
6. [Architecture decision records](architecture-decision-records.md) — compare alternatives, record assumptions, choose deliberately and revisit decisions when evidence changes.
7. [Security threat-model workbook](security-threat-model-workbook.md) — map assets, trust boundaries, threats, controls, residual risk and verification evidence.
8. [FinOps and capacity review](finops-capacity-review.md) — connect workload demand, unit economics, reliability headroom and cost controls without inventing provider prices.
9. [Incident postmortem template](incident-postmortem-template.md) — build a blameless, evidence-led timeline and assign measurable corrective actions.
10. [Engineering quality assurance](engineering-quality-assurance.md) — review accessibility, browser behaviour, repository quality and release safeguards.

## Evidence labels

- **Conceptual:** explanation or design reasoning; no execution is implied.
- **Reproduced lab:** performed in a named local or disposable environment, with versions and observed output recorded.
- **Verified implementation:** independently inspectable source, configuration, test results and environment context are linked.

Do not promote a guide or simulation to a higher evidence level without performing and recording the work. Redact credentials, tokens, private endpoints, personal data and sensitive infrastructure identifiers.

## Safe use

- Read the command's manual/help and understand its effect before execution.
- Prefer read-only diagnostics before state-changing commands.
- Confirm account, cluster, namespace, workspace, region and context before any mutation.
- Back up recoverable state and define rollback/cleanup before risky changes.
- Never paste secrets or unredacted production logs into public documentation.
- Treat output as environment-specific; a command returning success does not by itself prove the service is healthy.
