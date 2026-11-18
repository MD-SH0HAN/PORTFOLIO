# Containers and Kubernetes Troubleshooting

**Evidence level:** conceptual runbook. Run against a local/disposable container runtime or cluster before claiming reproduced results. Commands assume `docker` and `kubectl` are configured.

## 1. Confirm the target context first

```bash
docker context show
kubectl config current-context
kubectl get namespace
kubectl get nodes -o wide
```

Before mutation, confirm cluster, namespace, account and environment. Never assume the current context is a development cluster.

## 2. Container image and process

```bash
docker image ls
docker ps -a
docker logs --tail=200 CONTAINER
 docker inspect CONTAINER
```

Check image reference/digest, entrypoint, command, environment, mounts, port mapping, exit code and logs. An image that builds successfully may still fail at runtime because of missing files, permissions, architecture mismatch, configuration or dependency access. Do not print secrets from `inspect` output into public notes.

## 3. Kubernetes scheduling and startup

```bash
kubectl get pods -n NAMESPACE -o wide
kubectl describe pod POD -n NAMESPACE
kubectl get events -n NAMESPACE --sort-by=.lastTimestamp
kubectl logs POD -n NAMESPACE --all-containers --tail=200
kubectl logs POD -n NAMESPACE -c CONTAINER --previous --tail=200
```

Use `describe` and events to distinguish scheduling, image-pull, mount, admission and startup failures. `Pending` is a broad phase, not a root cause. Inspect node capacity, requests, taints/tolerations, affinity, PVC binding and scheduler events.

For restart loops, inspect current and previous container logs, exit code, command/args, mounted configuration, resource limits and probe events. Avoid increasing restart thresholds without identifying the underlying failure.

## 4. Separate probe contracts

- **Startup probe:** gives a slow-starting application time to initialize; while it has not succeeded, liveness/readiness checks are held back as defined by Kubernetes probe behavior.
- **Liveness probe:** indicates whether the container should be restarted. It should not fail merely because a downstream dependency is temporarily unavailable unless restarting is the intended recovery.
- **Readiness probe:** indicates whether the Pod should receive normal Service traffic. A process can be alive but not ready.

Inspect the actual probe configuration and events. Probe timing must reflect measured startup and response behavior; arbitrary aggressive thresholds can amplify an outage.

## 5. Service and traffic path

```bash
kubectl get svc,endpointslices -n NAMESPACE
kubectl describe svc SERVICE -n NAMESPACE
kubectl get pods -n NAMESPACE --show-labels
kubectl get ingress -n NAMESPACE
```

Verify selector-to-Pod label matching, readiness, EndpointSlice membership, target port, Service port, ingress routing and network policy. Test from an appropriate in-cluster client when possible. A Service object existing does not prove it has ready backends.

## 6. Resources and capacity

```bash
kubectl top nodes
kubectl top pods -n NAMESPACE
kubectl describe node NODE
```

`kubectl top` requires a functioning metrics pipeline. Compare observed usage with requests/limits and events. Distinguish scheduling capacity (`requests`) from runtime enforcement (`limits`); investigate OOMKilled, throttling, eviction and node pressure using events and container status.

## 7. Safe remediation loop

1. State the symptom and scope.
2. Collect read-only evidence.
3. Form one testable hypothesis.
4. Make the smallest reversible change in a safe environment.
5. Observe rollout, Pod conditions, endpoints and user-facing behavior.
6. Roll back if the expected signal worsens.
7. Record the root cause and prevention work.

Do not delete Pods, scale workloads, change probes or edit production resources simply because a generic checklist suggests it. Confirm ownership, change approval and rollback path first.

## Exit criteria

Desired replicas are available, Pods are ready, Service endpoints match intended backends, rollout status is healthy, and a request-level check confirms the application behavior. Record the cluster/version and relevant manifests without exposing secrets.
