# Cloud cost and capacity review

**Evidence level:** planning method and calculation template. No provider-specific prices or savings are asserted here.

FinOps is a collaborative operating practice: engineering, finance and product teams make cloud cost visible, allocate it to meaningful owners and improve value continuously. A cost reduction is not automatically an improvement if it harms reliability, security or delivery speed.

## 1. Establish the measurement boundary

Before comparing bills, record the provider, account/subscription/project, region, currency, billing period, workload, environment and data source. Separate actual charges, forecast values, credits, taxes and one-time purchases. Use the provider's current price list or calculator for the selected region and configuration; rates can change.

## 2. Build a workload cost model

A simplified monthly estimate can be expressed as:

```text
monthly cost = compute hours × compute rate
             + provisioned storage × storage rate
             + outbound data × egress rate
             + request / operation charges
             + database, network and managed-service charges
             + observability, backup and support charges
             + applicable licensing and support costs
```

This is a structure for collecting cost drivers, not a complete invoice formula. Pricing units, commitments, free tiers, minimums, discounts, region and service-specific dimensions differ. Do not multiply incompatible units or use a generic hourly price as if it were universal.

For each component, capture:

| Dimension | Record |
|---|---|
| Quantity | Hours, GB-month, requests, vCPU-hours, data volume or other billable unit |
| Rate source | Current official rate, quote or invoice line item; include region and date |
| Usage profile | Baseline, peak, burst, seasonality and forecast range |
| Ownership | Team, service, environment and cost-center tags |
| Variability | Fixed, usage-based, commitment-based or one-time |
| Confidence | Measured, forecast or assumed; explain uncertainty |

## 3. Use unit economics

Choose a denominator that represents delivered value. Examples include cost per successful request, cost per active user, cost per batch, or cost per GB processed.

```text
unit cost = attributable workload cost for a period
            / eligible successful work units in the same period
```

Define the numerator and denominator precisely. Exclude failed or synthetic events only when the metric definition says so. Keep the time window, allocation method and currency consistent. Compare the trend with latency, error rate, throughput and customer impact so that reducing cost by degrading service is visible.

## 4. Review reliability and capacity together

- Right-size from observed utilization and saturation, not a single average CPU percentage.
- Distinguish requests, limits, reservations, provisioned capacity and actual consumption.
- Model peak, failover and recovery capacity; do not size only for normal load.
- Check autoscaling signals, scale-out delay, cooldown, quota and downstream bottlenecks.
- Compare multi-zone resilience, network egress and managed-service availability against recovery objectives.
- Include backup retention, restore tests, logs, metrics, traces and security tooling in the cost model.
- Identify idle or orphaned resources, but confirm ownership and dependencies before deletion.

## 5. Evaluate a change safely

For each optimization, write the hypothesis, baseline, proposed change, expected cost effect, service risk, security impact, rollback plan and measurement window. Change one major factor at a time where practical. Compare before/after periods with equivalent traffic and seasonality, and report confidence limits or confounders rather than claiming causation from a coincidental bill decrease.

A useful review table:

| Change | Expected value | Risk / trade-off | Guardrail | Evidence required |
|---|---|---|---|---|
| Right-size compute | Reduce idle capacity | Saturation and latency risk | Headroom and latency SLO | Usage and request metrics before/after |
| Add caching | Reduce repeated work | Stale data and invalidation | TTL and correctness policy | Hit ratio, freshness and error metrics |
| Reduce log volume | Lower ingest and retention cost | Missing diagnostic context | Preserve security/audit events | Query coverage and incident drill |
| Change NAT/egress design | Reduce network charges | Availability and routing complexity | Failure-domain review | Route tests and per-zone cost |
| Commit to capacity | Predictable unit price | Underuse or lock-in | Utilization and exit review | Contract and forecast sensitivity |

## 6. Minimum review outputs

- A dated cost baseline with its scope and source.
- A component-level estimate and assumptions.
- A unit-cost definition tied to successful workload output.
- A peak/failover capacity model.
- A risk and rollback statement.
- An owner and review date for each action.
- A measured follow-up that includes service quality indicators.

## References

- [FinOps Foundation: Framework](https://www.finops.org/framework/)
- [FinOps Foundation: Inform phase](https://www.finops.org/framework/capabilities/)
- [AWS Pricing Calculator](https://calculator.aws/)
- [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)
- [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator)
