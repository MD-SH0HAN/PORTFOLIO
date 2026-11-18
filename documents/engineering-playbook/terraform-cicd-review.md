# Terraform and CI/CD Change Review

**Evidence level:** conceptual review standard; no cloud resources or workflow are executed by this document.

## Terraform review sequence

### 1. Confirm execution identity and state boundary

Before planning, verify the cloud account/project/subscription, region, credentials, Terraform version, provider lock file, workspace and backend. State can contain sensitive values: restrict access, encryption, locking and retention. Never commit state, plan files or credentials to source control.

### 2. Validate before planning

```bash
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

The `-backend=false` initialization is suitable for syntax/configuration validation without initializing the configured backend; it is not a substitute for the real backend initialization required by the controlled deployment workflow. Provider/module installation still needs a trusted source and version constraints.

### 3. Review a plan in the intended environment

```bash
terraform init
terraform workspace show
terraform plan -out=tfplan
terraform show tfplan
```

Treat `tfplan` as sensitive. Review creates, updates, replacements, deletes, unknown values, dependencies, provider changes, data sources and policy results. A plan is a proposed action set, not an approval or guarantee that apply will succeed. State and remote infrastructure can change between plan and apply.

Do not apply a stale plan. Use the reviewed plan artifact in a protected workflow with appropriate approval and state locking. Never run `apply -auto-approve` as a blanket shortcut for production.

### 4. Detect dangerous change patterns

- Unexpected resource replacement or deletion.
- Broad IAM permissions or public network exposure.
- Unencrypted storage or missing retention/backup controls.
- Changes to state backend, workspace or provider identity.
- Unpinned modules/providers or unexpected lock-file changes.
- Destructive database/storage changes without recovery validation.
- Secrets in variables, outputs, logs, plans or repository history.

## CI/CD trust and artifact identity

A robust delivery path should make the relationship between source revision and deployed artifact inspectable:

1. Trigger only from intended branches, tags or protected environments.
2. Grant the workflow minimum token permissions at job scope.
3. Prefer short-lived OIDC federation to long-lived cloud keys where supported; constrain issuer, audience, repository, ref and environment claims in the trust policy.
4. Validate and test source before building.
5. Build once, publish an immutable artifact and record its digest.
6. Scan dependencies/image and produce an SBOM; define policy for findings and exceptions.
7. Promote the same artifact by digest rather than rebuilding separately for each environment.
8. Require appropriate approval and deployment protection for sensitive environments.
9. Verify rollout and service health; define rollback and recovery criteria.
10. Retain provenance and audit records without exposing secrets.

## Review checklist

- [ ] Workflow permissions are explicit and minimal.
- [ ] Third-party actions are pinned to reviewed immutable revisions or managed through an approved pinning policy.
- [ ] Secrets are not echoed, uploaded as artifacts or included in logs.
- [ ] Untrusted pull-request code cannot access privileged deployment credentials.
- [ ] OIDC trust is scoped to intended repository/ref/environment claims.
- [ ] Dependencies, providers, modules and build inputs are controlled.
- [ ] Artifact digest is captured and promoted unchanged.
- [ ] Plan, scan and policy outputs are reviewed before deployment.
- [ ] Production deployment has appropriate approval and auditability.
- [ ] Post-deploy health checks and rollback criteria are explicit.

## Important distinction

A green CI job proves only that the configured checks passed for that run. It does not prove that the checks are complete, the deployment is safe, the application is correct, or the service meets its SLO. Review what each check measures and what it cannot detect.
