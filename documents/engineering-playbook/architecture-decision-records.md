# Architecture Decision Records: a practical review method

**Evidence level:** conceptual reference and reusable study template. The example is illustrative, not a record of a real deployment.

An architecture decision is a documented choice made under constraints. A good record makes the context, alternatives, trade-offs and consequences inspectable. It does not try to prove that one technology is universally best.

## 1. Use a small, stable record format

Copy this template for a meaningful decision:

```markdown
# ADR-NNN: <decision title>
- Status: proposed | accepted | superseded | deprecated
- Date: YYYY-MM-DD
- Decision owner: <role or team>
- Review trigger: <condition that would reopen the decision>

## Context
What problem must be solved? Who is affected? What is in scope and out of scope?

## Constraints and quality attributes
Availability, latency, data residency, security, compliance, skills, budget,
operational ownership, delivery time, portability, and growth assumptions.

## Options considered
For each option: benefits, costs, risks, dependencies and operational burden.

## Decision
State the selected option and the conditions under which it is valid.

## Consequences
Positive consequences, negative consequences, accepted risks and new work.

## Verification
What measurable test, review, prototype or operational evidence will validate it?

## Revisit conditions
What change in scale, risk, requirement or capability would invalidate it?
```

## 2. Compare options against the actual workload

Avoid a tool-first decision such as “we need Kubernetes”. Start from the workload and operating model. Record at least:

- **Workload shape:** stateless or stateful, request/queue/batch, traffic profile, dependencies, background jobs and data lifecycle.
- **Service objectives:** availability target, latency objectives, recovery time objective (RTO), recovery point objective (RPO), and acceptable degradation.
- **Security model:** users, workload identities, trust boundaries, secrets, data sensitivity, ingress and egress requirements.
- **Operating model:** team skills, on-call coverage, patch ownership, upgrade cadence, incident response and support expectations.
- **Economics:** baseline and peak cost, fixed platform overhead, usage-based cost, egress, observability, backups and staff time.
- **Change model:** release frequency, rollback safety, environment count, policy controls and audit needs.

Use qualitative ratings only when evidence is unavailable, and label them as assumptions. Do not present subjective ratings as measured performance.

## 3. Worked example: managed container platform or Kubernetes?

**Scenario assumptions:** a small team runs a stateless HTTP service; there is no stated need for custom scheduling, cluster-level extensions, a service mesh, complex multi-workload tenancy or a bespoke platform API. The team has limited time for cluster operations.

| Criterion | Managed container platform | Managed Kubernetes |
|---|---|---|
| Initial operational surface | Usually smaller | Larger: cluster, add-ons, policies and workloads |
| Workload flexibility | Bounded by provider platform features | Broad Kubernetes API and ecosystem |
| Portability | More provider-specific | More standardized APIs, but add-ons and operations still vary |
| Team ownership | Provider operates more of the platform | Team retains more cluster and add-on responsibility |
| Cost model | Platform and usage charges; verify minimums and scaling rules | Cluster/control-plane, nodes, add-ons, traffic and operational effort |
| Best fit signal | Standard application needs and small ops capacity | Demonstrated need for Kubernetes APIs or a shared platform |

**Provisional decision:** evaluate a managed container platform first because the scenario does not establish a Kubernetes-specific requirement. Validate that the service can meet networking, identity, scaling, observability, deployment and recovery needs. Choose Kubernetes only when its flexibility or platform capabilities justify its additional operational surface.

**What would change the decision:** multiple teams need a shared API platform; workloads require Kubernetes-specific controllers or scheduling; policy and tenancy requirements are better met through an established cluster platform; or there is an experienced team prepared to own upgrades, add-ons, security and on-call operations.

This is a decision method, not a universal recommendation. Actual products, service limits, prices and compliance requirements must be checked against the selected provider and region.

## 4. Worked example: multi-zone or multi-region?

Start with impact and recovery objectives, not a diagram. Multi-zone design can reduce exposure to a single-zone failure while keeping data and traffic closer together. Multi-region design may reduce regional failure exposure, but introduces replication, consistency, failover, data-residency, routing and recovery complexity.

Ask:

1. What user-visible failure is the design intended to prevent?
2. Does the data layer support the required replication and recovery semantics?
3. Is the target RPO compatible with asynchronous replication or does it need a stronger consistency model?
4. Who is authorized to initiate failover, and how is split-brain or duplicate processing prevented?
5. Has restoration/failover been tested, including DNS, identity, secrets, dependencies and observability?
6. Does the business impact justify recurring infrastructure and operational cost?

A second region without tested data recovery, failover ownership and runbooks is not evidence of disaster recovery readiness.

## 5. Review checklist

- [ ] Problem statement is outcome-based, not technology-led.
- [ ] Assumptions, constraints and non-goals are visible.
- [ ] At least two credible alternatives are compared.
- [ ] Security, reliability, operations and cost are considered.
- [ ] Failure modes and recovery behaviour are addressed.
- [ ] The selected option includes consequences and accepted risks.
- [ ] Verification steps and revisit triggers are defined.
- [ ] The record links to source, tests or diagrams where they exist.

## Further reading

- [Architecture Decision Records (ADR) GitHub organization](https://adr.github.io/)
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
- [Google Cloud Architecture Framework](https://cloud.google.com/architecture/framework)
- [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)
