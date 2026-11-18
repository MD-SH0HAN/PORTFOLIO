# Incident report and blameless postmortem template

**Evidence level:** reusable template for a tabletop or authorized lab exercise. It does not claim that the author has managed a real production incident.

An incident record should explain user impact, what responders knew at each point, how service was restored and which system conditions made the event possible. A blameless review examines processes and conditions rather than assigning personal fault; accountability still matters for completing corrective actions.

## 1. Incident header

```markdown
- Incident ID:
- Service / environment:
- Start and end time (include timezone, preferably UTC):
- Severity and severity rationale:
- Incident commander:
- Technical lead:
- Communications owner:
- Status: investigating | mitigating | monitoring | resolved | review
- Links: dashboards, logs, traces, deployment, change, runbook and ticket
```

## 2. Impact statement

State which users or workloads were affected, what they experienced, the affected regions or functions, and the start/end window. Quantify only when telemetry supports the number. Distinguish observed impact from estimated or unknown impact. Avoid exposing personal data or secrets in the report.

## 3. Timeline

Use one timezone consistently. Record observation and action separately. Include the evidence source for each key timestamp.

| Time | Observation or action | Actor / role | Evidence link | Confidence / notes |
|---|---|---|---|---|
| HH:MM UTC | Alert fired / user report received | Monitoring / support | Sanitized link | Observed |
| HH:MM UTC | Incident declared and roles assigned | Incident commander | Incident channel | Observed |
| HH:MM UTC | Mitigation started | Technical lead | Change record | Observed |
| HH:MM UTC | User-visible service recovered | Service owner | SLI / synthetic check | Validate recovery window |
| HH:MM UTC | Incident closed | Incident commander | Status update | Include residual risk |

## 4. Detection, diagnosis and mitigation

- What signal detected the issue? Was it user-centred or infrastructure-only?
- What was the first confirmed failing boundary?
- Which hypotheses were tested, and which evidence rejected them?
- What changed during mitigation? Was the change reversible?
- Did responders preserve logs, metrics, traces and relevant configuration revisions?
- Were customer/support/status communications timely and accurate?
- What confirmed the service was restored, including dependencies and backlog recovery?

Separate confirmed root causes from contributing conditions and unverified hypotheses. A timeline is not a causal analysis.

## 5. Contributing factors

Consider design assumptions, capacity, deployment controls, dependency behaviour, timeouts/retries, data quality, security boundaries, observability gaps, access, runbooks, ownership and recovery readiness. Explain why existing safeguards did not prevent, detect or limit the event. Avoid naming an individual as the cause.

## 6. Corrective actions

Every action needs an accountable owner, priority, due date, completion evidence and a follow-up test. Prefer actions that remove or reduce systemic risk over reminders to “be more careful”.

| Action | Type | Owner | Priority | Due date | Verification / done definition | Status |
|---|---|---|---|---|---|---|
| Add a regression test for the failure path | Prevent | Role/team | High | YYYY-MM-DD | Test fails before fix and passes after | Open |
| Improve user-impact alert and runbook | Detect/respond | Role/team | Medium | YYYY-MM-DD | Tabletop proves correct routing and diagnosis | Open |
| Rehearse recovery and measure RTO/RPO | Recover | Role/team | High | YYYY-MM-DD | Restore evidence and measured recovery window | Open |

## 7. Learning review

- What worked well and should be preserved?
- What made diagnosis or mitigation harder?
- Which assumptions were wrong or incomplete?
- What should change in architecture, process, documentation or training?
- Which risks remain accepted, by whom, and until when?

## 8. Closure criteria

Close the review only when impact and timeline are understood to an appropriate confidence level, actions have owners and due dates, unresolved risks are explicit, and the service's recovery has been validated. Corrective actions may remain open after service recovery; track them outside the incident bridge.

## References

- [Google SRE: Postmortem Culture](https://sre.google/sre-book/postmortem-culture/)
- [Google SRE Workbook: Incident Response](https://sre.google/workbook/incident-response/)
- [Google SRE: Managing Incidents](https://sre.google/sre-book/managing-incidents/)
