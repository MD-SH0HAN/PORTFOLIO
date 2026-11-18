# Linux and Network Troubleshooting

**Evidence level:** conceptual runbook; commands require reproduction in a named environment before being reported as lab evidence.

## Objective

Find the first failing boundary in a request path. Avoid changing DNS, firewall, routing or service configuration until observations narrow the fault domain.

## 1. Establish scope and impact

Record the affected host/service, start time and timezone, recent changes, affected users/regions, exact error, frequency, and whether the issue is total or partial. Compare a known-good client or path when safe. Do not assume that a successful ping proves an application path works.

## 2. Inspect the host and process

```bash
hostnamectl
uptime
free -h
df -h
 df -i
ps -eo pid,ppid,stat,%cpu,%mem,comm --sort=-%cpu | head
ss -lntup
```

Check CPU saturation, memory pressure, swap activity, filesystem capacity and inode exhaustion. Identify whether the expected process exists and whether it listens on the expected address/port. A process bound only to loopback will not accept remote connections through a host interface.

For a systemd service:

```bash
systemctl status SERVICE --no-pager
journalctl -u SERVICE --since '30 minutes ago' --no-pager
```

Replace `SERVICE` with the actual unit. Logs may contain credentials or personal data; sanitize before sharing.

## 3. Trace the network path

```bash
ip -brief address
ip route
ip route get DESTINATION_IP
getent ahosts example.com
resolvectl status
```

Use the tools available on the distribution; `resolvectl` is not present everywhere. Check the route selected for the destination, interface/address state, resolver configuration and whether name resolution returns expected addresses.

Test progressively, with bounded timeouts:

```bash
nc -vz -w 3 HOST PORT
curl -sv --connect-timeout 3 --max-time 10 https://HOST/ -o /dev/null
```

Interpret the layer that failed:

- Name lookup error: resolver, search domain, record or client configuration.
- Connection refused: destination reachable but no listener or an active reject is likely; verify server listener and firewall.
- Timeout: route, filtering, overloaded endpoint or silent drop may be involved; gather evidence from both ends.
- TLS validation error: inspect certificate chain, hostname, validity and trust store; do not disable verification as a fix.
- HTTP 4xx/5xx: transport and TLS completed; inspect application routing, authentication, dependency and server logs.

## 4. Inspect TLS without weakening it

```bash
openssl s_client -connect HOST:443 -servername HOST -brief </dev/null
```

Verify SNI/hostname, certificate validity, chain and trust. Do not normalize `curl -k` or disabling certificate verification; those options can hide the defect and expose traffic to interception.

## 5. Capture a useful diagnosis

A good report contains: symptom, scope, timestamp, recent change, exact command, sanitized output, interpretation, first failing boundary, hypothesis, test that confirmed/refuted it, remediation, and post-change verification. Separate facts from hypotheses.

## Common traps

- Treating ping/ICMP as an application health check.
- Repeatedly restarting a service before preserving logs and state.
- Changing DNS and firewall rules simultaneously, making causality unclear.
- Assuming a listening socket is reachable through every interface or network policy.
- Sharing raw logs that expose tokens, cookies, user identifiers or internal topology.

## Exit criteria

The request succeeds through the intended path; the service and dependency signals are healthy; the original symptom is no longer reproducible; and the change, verification and remaining uncertainty are recorded.
