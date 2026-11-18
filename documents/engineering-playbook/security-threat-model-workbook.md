# Security threat-model workbook

**Evidence level:** conceptual study workbook. Completing this worksheet is not a penetration test, audit, compliance assessment or proof that a system is secure.

Threat modelling is a structured way to ask what can go wrong, where trust changes, and which controls reduce risk. It should be revisited when architecture, identity, data flows or dependencies change.

## 1. Define the system boundary

Record the system name, owner, review date, architecture revision and scope. List explicit non-goals so readers do not assume unreviewed components were included.

| Item | Questions to answer |
|---|---|
| Assets | What data, credentials, compute, artifacts and business capabilities need protection? |
| Actors | Which users, administrators, services, vendors and automation identities interact with it? |
| Entry points | Public APIs, admin interfaces, CI runners, registry endpoints, webhooks, SSH and support channels? |
| Data flows | Which information moves, where is it stored, and which identity authorizes each hop? |
| Trust boundaries | Where does data or control cross from one privilege, network, tenant or administrative domain to another? |
| Dependencies | Identity provider, DNS, certificate authority, package registry, cloud control plane, databases and telemetry backends? |

Draw data-flow arrows and label protocols, identities, authentication, authorization and data sensitivity. Distinguish a network boundary from an authorization boundary; neither automatically implies the other.

## 2. Enumerate threats systematically

STRIDE is one useful prompt set. Apply it to each flow and component, then remove duplicates and record why a scenario is or is not relevant.

| STRIDE category | Example questions for cloud and DevOps systems |
|---|---|
| Spoofing | Can a user, runner, workload or webhook impersonate another identity? |
| Tampering | Can source, build inputs, Terraform plans, manifests or artifacts be changed without review? |
| Repudiation | Are privileged actions and deployment decisions attributable to an identity and revision? |
| Information disclosure | Can logs, state, artifacts, metadata endpoints or backups expose secrets or personal data? |
| Denial of service | Can an endpoint, queue, cluster, registry or dependency be exhausted or made unavailable? |
| Elevation of privilege | Can a low-privilege principal gain admin, cloud, cluster or production deployment rights? |

Also consider dependency compromise, malicious maintainers, compromised CI runners, leaked tokens, build cache poisoning, unsafe admission policies, exposed control planes and recovery-path abuse. These are prompts, not a complete threat catalogue.

## 3. Threat register

Copy one row per concrete scenario. Make the attack path explicit rather than writing a generic statement such as “the system could be hacked”.

| Field | Record |
|---|---|
| ID and scenario | Actor + capability + target + attack path |
| Asset / boundary | What is affected and where trust changes |
| Preconditions | Access, exposure, misconfiguration or dependency required |
| Impact | Confidentiality, integrity, availability, safety, financial or legal impact |
| Likelihood rationale | Evidence and assumptions; do not fabricate probability |
| Existing controls | Controls that currently exist and their scope |
| Proposed treatment | Prevent, detect, limit, transfer or accept with rationale |
| Verification | Test, configuration review, log, alert or recovery exercise |
| Residual risk | What remains after the proposed control |
| Owner / status | Accountable role, target date and review status |

## 4. Cloud and delivery-path control prompts

**Identity and access:** prefer short-lived workload identity and OIDC federation over long-lived cloud keys where supported. Scope trust by repository, branch, environment, audience and permitted role. Separate pull-request validation from production deployment authority. Review human and machine access independently.

**Network:** document ingress and egress; avoid assuming a private subnet is intrinsically safe. Confirm routing, security groups/firewalls, DNS, private endpoints, administrative access and network-policy enforcement by the actual CNI or network implementation.

**Secrets and state:** keep credentials out of source, build logs, container layers, browser storage and public artifacts. Restrict Terraform state access, enable backend encryption and locking where available, and rehearse recovery. Treat state as sensitive even when outputs appear harmless.

**Software supply chain:** protect source review, workflow permissions, runners, dependencies, build inputs, registry access and release approvals. Use immutable artifact identifiers; generate SBOM/provenance when the tools and process support them; verify signatures at the consuming boundary rather than merely producing them.

**Runtime:** use non-root execution where practical, restrict Linux capabilities, define resource requests/limits, keep images updated, apply network policy only where enforced, and review workload service-account permissions. Validate what the cluster actually admits and runs.

**Detection and response:** define audit events, alert ownership, log retention, sensitive-field redaction, incident contacts, credential revocation and recovery steps. Monitoring that no one owns is not an operational control.

## 5. Validate controls safely

Start with read-only configuration review and disposable environments. For each high-priority threat, define a non-destructive validation step and expected evidence. Examples include:

- Review effective cloud and Kubernetes permissions, not only declared policy files.
- Confirm an untrusted pull request cannot access production secrets or write deployment credentials.
- Verify artifact digests remain stable between promotion stages.
- Test that a public route cannot reach a private administrative interface.
- Confirm sensitive values do not appear in logs or generated static assets.
- Verify backup restoration and identity-provider outage procedures in an approved test environment.

Do not run exploit attempts, load tests, destructive cloud changes or credential attacks against systems without explicit authorization and a documented scope.

## 6. Review and exit criteria

A review is ready to close when the system scope and trust boundaries are clear, important abuse cases have owners, proposed controls are mapped to verification, residual risks are accepted by an accountable party, and revisit triggers are recorded. “No findings” is not a valid conclusion when the system boundary or evidence is incomplete.

## References

- [OWASP Threat Modeling](https://owasp.org/www-community/Threat_Modeling)
- [OWASP Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html)
- [NIST SP 800-154 (Draft): Guide to Data-Centric System Threat Modeling](https://csrc.nist.gov/pubs/sp/800/154/ipd)
- [GitHub Actions security hardening](https://docs.github.com/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
