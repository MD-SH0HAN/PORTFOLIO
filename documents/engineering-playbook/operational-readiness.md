# Operational Readiness and Incident Response

**Evidence level:** conceptual operating model. Tailor ownership, escalation and service objectives to the actual service; do not invent SLOs or claim a tested recovery without exercising it.

## 1. Define the service contract

Document the user-visible function, critical journeys, dependencies, owner, support route, operating hours, data classification and acceptable failure modes. A host being reachable is not equivalent to a successful user transaction.

## 2. Choose useful service indicators

An SLI needs a precise event definition, numerator, denominator, measurement window, source and exclusions. Examples include successful eligible requests divided by all eligible requests, or requests completed within a stated latency threshold divided by eligible requests. Define treatment of retries, cancellations, synthetic traffic and missing telemetry. Avoid choosing a metric solely because it is easy to collect.

An SLO is a target over a window; an SLA is an external commitment with defined terms and consequences. Do not use these terms interchangeably. An error budget is the permitted unreliability implied by the SLO for that window, subject to the chosen event model.

## 3. Prepare a useful runbook

Every operational runbook should identify:

- Service, owner, environment and last-reviewed date.
- Symptoms and user impact to confirm.
- Dashboards, logs, traces and authoritative status sources.
- Safe first diagnostics and expected signals.
- Decision points and escalation conditions.
- Mitigation options, risks and required approvals.
- Rollback/recovery steps and verification criteria.
- Communication owner and update cadence.
- Cleanup and follow-up actions.

A runbook must not contain credentials, private keys or unredacted sensitive data.

## 4. Incident response loop

1. **Detect:** establish that a user-visible or security-relevant condition exists.
2. **Triage:** assign severity based on impact, scope and urgency; name an incident lead.
3. **Stabilize:** prioritize safe mitigation and preserve useful evidence.
4. **Communicate:** state known impact, current action, uncertainty and next update time.
5. **Recover:** verify the service contract, not only infrastructure status.
6. **Review:** document timeline, contributing factors, detection gaps and corrective actions.

During an incident, distinguish confirmed facts from hypotheses. Avoid blame-oriented language; focus on system conditions and controls.

## 5. Recovery objectives

- **RTO:** target time to restore a service after a disruption.
- **RPO:** target maximum data-loss interval, expressed as time.

These are requirements, not proof of recoverability. Define them per service/data class and validate through restore or failover exercises. A backup job succeeding does not prove that the backup is restorable, complete, consistent or accessible during a credential/region failure.

## 6. Change and capacity governance

For material changes, record scope, risk, reviewer, validation, maintenance/impact window, rollback trigger and owner. Capacity planning should consider demand shape, saturation, scaling delay, quotas, dependency limits and cost. Autoscaling cannot compensate for every bottleneck and can amplify downstream overload if dependencies do not scale with it.

## 7. Post-incident review template

- Summary and customer impact:
- Start/end time and detection source:
- Timeline with timezone:
- Confirmed technical cause and contributing conditions:
- What worked / what delayed recovery:
- Data integrity and security considerations:
- SLI/SLO impact and measurement caveats:
- Recovery verification:
- Corrective actions, owners and due dates:
- Follow-up validation method:

## Exit criteria

The service is restored against user-visible checks, residual risk is understood, stakeholders are informed, evidence is preserved appropriately, and follow-up actions have owners. Close an incident only under the organization's agreed process.
