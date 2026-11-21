/*
 * Advanced engineering animation labs.
 * Twenty-six concept-specific visual renderers share only playback/accessibility
 * utilities. Every model is local, deterministic or explicitly illustrative. No cloud APIs,
 * shell commands, credentials, telemetry backends, or real infrastructure are used.
 */
(() => {
  'use strict';

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.dataset.reduceMotion === 'true';
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  // Maps each portfolio section to the lab IDs that belong in that learning area.
  const sectionMap = {
    focus: ['linux-process','network-journey','git-branching','api-lifecycle'],
    'cloud-infrastructure': ['vpc-routing','network-policy','disaster-recovery'],
    'delivery-model': ['deployment-strategy'],
    iac: ['terraform-graph','terraform-drift','ansible-converge'],
    containers: ['pod-lifecycle','k8s-scheduler','rolling-update','service-routing'],
    'platform-engineering': ['gitops-reconcile','golden-path','service-mesh'],
    reliability: ['slo-burn','incident-impact'],
    'observability-dashboard': ['telemetry-correlation'],
    'security-devsecops': ['oidc-journey','threat-model','supply-chain'],
    finops: ['cloud-cost','rightsizing']
  };

  // Declarative lab registry: descriptions, states, steps, and sources are data; renderers below provide behavior.
  const labs = [
    {id:'linux-process',section:'focus',n:'01',title:'Linux process lifecycle',kind:'state',tag:'STATE MACHINE',desc:'Follow a process from creation to termination. A blocked process waits for an event; a terminated process does not transition back to running.',states:['Created','Ready','Running','Waiting','Terminated'],path:[0,1,2,3,1,2,4],pathNotes:['Kernel creates the task and its initial process context.','The scheduler can select a runnable task.','The task is executing on a CPU.','The task sleeps until I/O or another event completes.','The event completes and the task returns to the runnable queue.','The scheduler selects the runnable task again.','The process exits; resources are reclaimed.'],source:'Linux scheduling concepts · simplified educational lifecycle'},
    {id:'network-journey',section:'focus',n:'02',title:'Network request journey',kind:'sequence',tag:'PROTOCOL SEQUENCE',desc:'Separate name resolution from transport and application protocols: DNS lookup, TCP establishment, TLS negotiation, HTTP request and response.',steps:[['Client','Request hostname'],['DNS resolver','Query and answer'],['TCP','Three-way handshake'],['TLS','Certificate and session negotiation'],['HTTP','Request reaches the origin'],['Origin','Response returns to client']],source:'DNS, TCP, TLS and HTTP are separate protocol layers; exact connection reuse and DNS transport vary by implementation.'},
    {id:'git-branching',section:'focus',n:'03',title:'Git branching and merge graph',kind:'graph',tag:'DIRECTED ACYCLIC GRAPH',desc:'See how commits form a directed acyclic graph. A merge commit has two parents; a rebase creates new commits on a different base.',nodes:[['C1','Initial'],['C2','Main'],['F1','Feature'],['C3','Main'],['F2','Feature'],['M1','Merge']],edges:[[0,1],[1,3],[1,2],[2,4],[3,5],[4,5]],source:'Conceptual Git commit DAG; hashes and branch histories are illustrative.'},
    {id:'api-lifecycle',section:'focus',n:'04',title:'API request lifecycle',kind:'sequence',tag:'REQUEST / RESPONSE',desc:'Trace a request through gateway policy, authentication, service logic, optional cache and persistent data. Responses travel back through the call stack.',steps:[['Client','HTTPS request'],['API gateway','Route, quota and request policy'],['Identity layer','Validate token and claims'],['Application service','Authorize and execute logic'],['Cache','Read-through lookup (optional)'],['Database','Query or transaction'],['Client','Response and status']],source:'A common API pattern; not every deployment uses an API gateway or cache.'},
    {id:'vpc-routing',section:'cloud-infrastructure',n:'05',title:'VPC packet routing',kind:'sequence',tag:'LONGEST-PREFIX MATCH',desc:'Choose a destination and watch a simplified route table select the most-specific matching CIDR. The example source is a private application subnet.',steps:[['Private workload','Packet leaves 10.20.1.12'],['Route lookup','Match destination CIDRs'],['Next hop','Select local, transit gateway or NAT'],['Network policy','Security controls evaluate traffic'],['Destination','Packet reaches the selected network']],custom:'route',source:'Illustrative IPv4 route table; longest-prefix match is used. Real reachability also depends on subnet routes, gateways, firewall policy and return routes.'},
    {id:'network-policy',section:'cloud-infrastructure',n:'06',title:'Subnet ingress NACL evaluator',kind:'state',tag:'ORDERED POLICY EVALUATION',desc:'Evaluate an illustrative stateless network ACL by ascending rule number. The first matching rule decides; unmatched traffic reaches the default deny.',states:['Packet fields','Rule 100','Rule 110','Default action'],notes:['Read source, destination, protocol and destination port.','Allow HTTPS from an external client to the public edge.','Allow PostgreSQL from the private app subnet to the data subnet.','No earlier rule matched: deny.'],custom:'policy',source:'Simplified stateless subnet-ingress NACL example. Return traffic needs a corresponding egress rule; Security Groups are stateful and use different evaluation semantics.'},
    {id:'disaster-recovery',section:'cloud-infrastructure',n:'07',title:'Backup and disaster recovery',kind:'sequence',tag:'RPO / RTO MODEL',desc:'Separate data-loss tolerance (RPO) from service-restoration time (RTO). Compare illustrative replication lag and restore duration with selected objectives.',steps:[['Protect','Create and retain recoverable backups'],['Replicate','Ship changes to recovery domain'],['Declare','Assess impact and authorize recovery'],['Restore','Recover data and application capacity'],['Validate','Check integrity and service health'],['Resume','Return service under runbook control']],custom:'dr',source:'RPO is the maximum tolerable data-loss window; RTO is the target time to restore service. Values below are hypothetical.'},
    {id:'terraform-graph',section:'iac',n:'08',title:'Terraform dependency graph',kind:'graph',tag:'TOPOLOGICAL ORDER',desc:'Resources are created only after their dependencies are ready. A directed graph makes implicit and explicit dependencies easier to reason about.',nodes:[['VPC','Network'],['Subnet','Network'],['Route','Network'],['Security','Policy'],['Compute','Workload'],['DB subnet','Data'],['Database','Data']],edges:[[0,1],[0,2],[1,3],[2,3],[3,4],[0,5],[5,6]],source:'Illustrative dependency graph. Terraform derives a graph from references and explicit depends_on edges; execution can be parallel where dependencies allow.'},
    {id:'terraform-drift',section:'iac',n:'09',title:'Terraform drift and plan review',kind:'graph',tag:'DESIRED VS OBSERVED',desc:'Compare declared configuration with refreshed remote observations, inspect proposed actions and stop to review replacement or destructive changes.',nodes:[['Config','Desired'],['Refresh','Observed'],['Diff','Changes'],['Review','Risk'],['Apply','Authorized']],edges:[[0,2],[1,2],[2,3],[3,4]],custom:'drift',source:'Simplified plan model. A real Terraform plan can include create, update, replace and destroy actions; apply requires authorization.'},
    {id:'ansible-converge',section:'iac',n:'10',title:'Ansible desired-state convergence',kind:'state',tag:'IDEMPOTENT CONFIGURATION',desc:'A configuration run compares actual state with the declared target. The first run may change resources; a second run should report no changes if state remains compliant.',states:['Inspect','Compare','Change','Verify','Converged'],notes:['Gather facts and inspect the current host state.','Compare packages, files and service state with the playbook.','Apply only the required changes.','Verify configuration and handler outcomes.','A repeated run reports no changes when state is compliant.'],custom:'converge',source:'Illustrative idempotent configuration workflow; actual task idempotency depends on modules and playbook design.'},
    {id:'deployment-strategy',section:'delivery-model',n:'11',title:'Deployment strategy explorer',kind:'sequence',tag:'TRAFFIC SHIFT',desc:'Compare rolling, blue/green and canary release shapes. Traffic movement and health checks are modeled locally; no deployment is performed.',steps:[['Prepare','Build and verify release artifact'],['Deploy','Place candidate capacity'],['Verify','Check readiness and service signals'],['Shift','Move traffic under policy'],['Observe','Watch error rate and latency'],['Complete','Promote or roll back']],custom:'deployment',source:'Illustrative strategies. Exact traffic control, rollback semantics and capacity requirements depend on the platform.'},
    {id:'pod-lifecycle',section:'containers',n:'12',title:'Kubernetes Pod startup and readiness path',kind:'state',tag:'WORKLOAD STATE',desc:'Distinguish scheduling, container creation, Running and Ready. A Running container is not automatically a Ready Service endpoint.',states:['Pending','Scheduled','ContainerCreating','Running','Ready'],notes:['Pod is accepted but not yet assigned to a node.','Scheduler binds the Pod to a suitable node.','Kubelet prepares sandbox, volumes and containers.','Container process is running; readiness may still fail.','Readiness succeeds and the Pod can be an eligible endpoint.'],custom:'pod',source:'Simplified startup path, not a literal Pod-phase enumeration: Scheduled and ContainerCreating are scheduling/container statuses; ImagePullBackOff is a container waiting reason and the Pod phase commonly remains Pending.'},
    {id:'k8s-scheduler',section:'containers',n:'13',title:'Kubernetes scheduling filter and score',kind:'graph',tag:'FILTER → SCORE → BIND',desc:'First filter nodes that cannot satisfy resource and placement constraints. Then score eligible nodes using configured scheduler plugins and bind the Pod.',nodes:[['Pod','Requests'],['Node A','Candidate'],['Node B','Candidate'],['Node C','Candidate'],['Filter','Feasibility'],['Score','Preference'],['Bind','Placement']],edges:[[0,1],[0,2],[0,3],[1,4],[2,4],[3,4],[4,5],[5,6]],custom:'scheduler',source:'Educational filter-and-score model. Kubernetes scheduler behavior depends on enabled plugins, policies, resources, affinity, taints and other constraints.'},
    {id:'rolling-update',section:'containers',n:'14',title:'Kubernetes rolling update',kind:'state',tag:'REPLICASET ROLLOUT',desc:'Increase new replicas while keeping the number of unavailable replicas within the Deployment strategy limits; remove old replicas as new Pods become available.',states:['Old version','Create new','Wait Ready','Scale old down','Repeat','Complete'],notes:['Existing ReplicaSet serves traffic.','Controller creates a new ReplicaSet Pod.','New Pod must pass readiness checks.','Old capacity is reduced within rollout limits.','The controller repeats until desired replicas run the new version.','Rollout completes when updated and available counts satisfy the desired state.'],custom:'rollout',source:'Simplified rolling update. maxSurge, maxUnavailable, readiness, scheduling and termination behavior affect rollout steps.'},
    {id:'service-routing',section:'containers',n:'15',title:'Kubernetes Service endpoint routing',kind:'sequence',tag:'READY ENDPOINT SELECTION',desc:'A Service selects matching Pods. EndpointSlice readiness conditions determine which endpoints are eligible for ordinary traffic.',steps:[['Client','Request to Service virtual IP / DNS'],['Service','Resolve selector and port'],['EndpointSlice','List matching endpoints'],['Readiness','Exclude endpoints not ready'],['Selected Pod','Receive one request']],custom:'endpoints',source:'Conceptual Service routing. Actual packet path varies by cluster networking implementation and traffic policy.'},
    {id:'gitops-reconcile',section:'platform-engineering',n:'16',title:'GitOps reconciliation loop',kind:'state',tag:'CONTROLLER FEEDBACK LOOP',desc:'A controller repeatedly observes the committed desired state and live cluster state, computes a difference, then reconciles within its permissions and policy.',states:['Git desired','Observe live','Compare diff','Reconcile','Health report'],notes:['Reviewed configuration is committed to the source repository.','Controller reads declared and observed state.','Differences are evaluated against sync and policy settings.','Controller applies permitted changes and waits for convergence.','Health and sync status are reported; the loop repeats.'],custom:'gitops',source:'Generic GitOps controller loop. Pruning, self-heal, sync waves and approval semantics are product/configuration dependent.'},
    {id:'golden-path',section:'platform-engineering',n:'17',title:'Developer golden path',kind:'graph',tag:'SELF-SERVICE DELIVERY',desc:'A paved road connects a reviewed service template to repository controls, CI, an immutable artifact, IaC and an observable runtime.',nodes:[['Template','Scaffold'],['Repo','Controls'],['CI','Verify'],['Artifact','Digest'],['IaC','Provision'],['Deploy','Release'],['Observe','Operate']],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],source:'Conceptual internal developer platform golden path; templates and guardrails are organization-specific.'},
    {id:'service-mesh',section:'platform-engineering',n:'18',title:'Service mesh request path',kind:'sequence',tag:'SIDECAR / mTLS',desc:'Show how a mesh proxy can apply identity-aware encryption and traffic policy between workloads. Retries and circuit breakers require bounded policies.',steps:[['Service A','Application issues request'],['Proxy A','Apply route and mTLS identity'],['Network','Encrypted connection'],['Proxy B','Verify peer identity and policy'],['Service B','Handle request'],['Telemetry','Record spans and policy outcomes']],source:'Generic sidecar mesh flow; ambient meshes and other architectures differ. Retries must be bounded to avoid amplification.'},
    {id:'slo-burn',section:'reliability',n:'19',title:'SLO error-budget burn rate',kind:'metrics',tag:'ERROR BUDGET',desc:'Compare observed error rate with the error rate allowed by the SLO. Burn rate is the ratio of observed error ratio to the budget error ratio.',data:[1,0,1,2,1,3,5,7,4,3,2,1],custom:'slo',source:'Illustrative event series. Real SLOs need a defined good-event indicator, measurement window and eligible request population.'},
    {id:'telemetry-correlation',section:'observability-dashboard',n:'20',title:'Metrics, logs and traces correlation',kind:'metrics',tag:'SHARED REQUEST CONTEXT',desc:'Filter structured logs and distributed spans with one trace ID, then connect them to a latency change through time alignment and a metric exemplar.',data:[18,20,19,22,24,28,67,72,41,30,22,19],stageNotes:['Baseline latency is steady near 18 ms before the request window.','The time series remains within its normal illustrative range.','A small increase appears; this is temporal context, not a trace-level metric filter.','The latency trend begins to rise before the correlated log events.','The request is accepted at the edge; its trace context is attached to the event.','A cache miss adds work and passes the same trace context downstream.','The pricing dependency times out; the latency spike is visible in the same time window.','A retry is scheduled. The metric exemplar links this outlier window to the trace.','The root API span contains the end-to-end request.','The catalog child span accounts for most downstream time.','The pricing child span contains the timeout interval.','The database span is nested beneath the downstream service call; inspect parent/child timing together.'],custom:'correlation',source:'Synthetic telemetry and illustrative span timings. Trace IDs directly filter logs and spans; metrics are aggregated time series and may link to traces through exemplars. Production correlation also needs propagated context and consistent resource attributes.'},
    {id:'incident-impact',section:'reliability',n:'21',title:'Incident impact and recovery graph',kind:'sequence',tag:'CHANGE → SIGNAL → RESPONSE',desc:'Connect a change to user-visible symptoms, detection, mitigation and recovery verification. A postmortem should distinguish contributing factors from root-cause shorthand.',steps:[['Change','Release or configuration event'],['Impact','Latency and error rate rise'],['Detect','SLI alert fires'],['Triage','Correlate metrics, logs and traces'],['Mitigate','Rollback or reduce blast radius'],['Verify','User-facing SLI returns to target'],['Learn','Actions assigned and reviewed']],source:'Synthetic incident narrative; not a real production incident.'},
    {id:'oidc-journey',section:'security-devsecops',n:'22',title:'OIDC workload identity journey',kind:'sequence',tag:'SHORT-LIVED CREDENTIALS',desc:'A CI workload presents an OIDC token. The cloud identity service validates issuer, audience and subject trust conditions before issuing temporary credentials.',steps:[['CI runner','Request identity token'],['OIDC issuer','Sign ID token'],['Cloud STS','Validate issuer and audience'],['Trust policy','Match subject and conditions'],['STS','Issue short-lived credentials'],['Cloud API','Authorize permitted action']],custom:'oidc',source:'Generic federated identity pattern. Exact claims, role trust and token exchange differ between cloud providers.'},
    {id:'threat-model',section:'security-devsecops',n:'23',title:'Threat modelling and trust boundaries',kind:'graph',tag:'STRIDE / DATA FLOW',desc:'Map assets, actors, data flows and trust boundaries before selecting threats and mitigations. STRIDE categories are prompts, not a substitute for risk analysis.',nodes:[['Client','Untrusted actor'],['Edge','Trust boundary'],['Service','Business logic'],['Data','Sensitive store'],['Identity','Token issuer']],edges:[[0,1],[1,2],[2,3],[4,2]],custom:'threat',source:'Conceptual data-flow threat model; threat applicability depends on assets, attacker capability and context.'},
    {id:'supply-chain',section:'security-devsecops',n:'24',title:'Software supply-chain verification',kind:'sequence',tag:'PROVENANCE / SIGNATURE',desc:'Build a traceable artifact, produce an SBOM, sign an attestation, verify provenance and policy, then allow deployment only when controls pass.',steps:[['Source','Reviewed commit'],['Build','Isolated reproducible process'],['SBOM','Inventory components'],['Provenance','Record builder and inputs'],['Sign','Bind identity to artifact digest'],['Verify','Check signature and policy'],['Admission','Permit or block deployment']],custom:'supply',source:'Illustrative supply-chain control chain. SBOM presence alone does not prove an artifact is safe.'},
    {id:'cloud-cost',section:'finops',n:'25',title:'Cloud cost explorer',kind:'metrics',tag:'COST COMPOSITION',desc:'Adjust compute, storage and egress assumptions to see how a sample monthly bill changes. Rates are illustrative, not provider prices.',data:[80,12.5,80],custom:'cost',source:'Synthetic monthly cost model using explicitly illustrative rates; taxes, discounts, support, requests and regional pricing are excluded.'},
    {id:'rightsizing',section:'finops',n:'26',title:'Workload rightsizing simulator',kind:'metrics',tag:'CAPACITY / COST TRADE-OFF',desc:'Compare workload demand with provisioned CPU and memory. Avoid sizing solely to average utilization; include peaks, headroom, latency and availability constraints.',data:[35,42,48,55,52,61,70,74,66,58,50,46],custom:'rightsizing',source:'Illustrative capacity profiles only. Production rightsizing requires representative demand, peak behavior, performance tests and resilience requirements.'}
  ];

  /* Each lab has its own visual grammar. Shared playback only controls emphasis;
     it does not force the diagrams into a shared horizontal sequence. */
  const graphLayouts = {
    'git-branching': [[128,8],[128,82],[24,166],[24,248],[232,166],[128,316]],
    'terraform-graph': [[128,8],[18,86],[238,86],[18,166],[18,246],[238,166],[238,246]]
  };

  const customMarkup = {
    route: `<label class="ea-input">Destination IP<select data-ea-input="destination"><option value="10.20.4.25">10.20.4.25 · same VPC</option><option value="10.30.2.15">10.30.2.15 · connected network</option><option value="8.8.8.8">8.8.8.8 · public internet</option></select></label><div class="ea-result" data-ea-result>Longest-prefix route selects the local VPC route.</div>`,
    policy: `<div class="ea-input-grid"><label class="ea-input">Source<select data-ea-input="source"><option value="10.20.1.25">10.20.1.25 · app subnet</option><option value="198.51.100.12">198.51.100.12 · internet</option></select></label><label class="ea-input">Destination<select data-ea-input="destination"><option value="10.20.3.10">10.20.3.10 · data subnet</option><option value="10.20.2.10">10.20.2.10 · public edge</option></select></label><label class="ea-input">Protocol<select data-ea-input="protocol"><option>TCP</option><option>UDP</option></select></label><label class="ea-input">Destination port<select data-ea-input="port"><option>5432</option><option>443</option><option>80</option></select></label></div><div class="ea-result" data-ea-result>Rule 110: allow app-to-data PostgreSQL.</div>`,
    dr: `<div class="ea-input-grid"><label class="ea-input">RPO objective <output data-ea-value="rpo">5 min</output><input data-ea-input="rpo" type="range" min="1" max="60" value="5"></label><label class="ea-input">Replication lag <output data-ea-value="lag">2 min</output><input data-ea-input="lag" type="range" min="0" max="120" value="2"></label><label class="ea-input">RTO objective <output data-ea-value="rto">30 min</output><input data-ea-input="rto" type="range" min="5" max="240" step="5" value="30"></label><label class="ea-input">Restore time <output data-ea-value="restore">25 min</output><input data-ea-input="restore" type="range" min="5" max="360" step="5" value="25"></label></div><div class="ea-result" data-ea-result>Both sample recovery objectives are met.</div>`,
    drift: `<div class="ea-inline-control"><label><input data-ea-input="drift" type="checkbox" checked> Show out-of-band drift</label></div><div class="ea-result" data-ea-result>Detected: desired 3 replicas, observed 2. Proposed action: update in place.</div>`,
    converge: `<div class="ea-inline-control"><button class="ea-mini-button" data-ea-action="converge" type="button">Run configuration convergence</button><span class="ea-result" data-ea-result>Two changes pending: package and service state.</span></div>`,
    deployment: `<label class="ea-input">Strategy<select data-ea-input="strategy"><option value="rolling">Rolling update</option><option value="bluegreen">Blue / green</option><option value="canary">Canary release</option></select></label><div class="ea-result" data-ea-result>Rolling: replace capacity gradually while respecting availability limits.</div>`,
    pod: `<div class="ea-inline-control"><button class="ea-mini-button" data-ea-action="pod-failure" type="button">Inject image pull failure</button><button class="ea-mini-button" data-ea-action="pod-retry" type="button">Retry pull</button></div><div class="ea-result" data-ea-result>Running does not automatically mean Ready.</div>`,
    scheduler: `<div class="ea-input-grid"><label class="ea-input">Pod CPU request <output data-ea-value="cpu">2 vCPU</output><input data-ea-input="cpu" type="range" min="1" max="6" value="2"></label><label class="ea-input">Pod memory request <output data-ea-value="memory">4 GiB</output><input data-ea-input="memory" type="range" min="1" max="12" value="4"></label></div><div class="ea-result" data-ea-result>Filter leaves Node B eligible; scoring selects the best fit in this simplified model.</div>`,
    rollout: `<label class="ea-input">Desired replicas<select data-ea-input="replicas"><option>3</option><option>4</option><option>5</option></select></label><div class="ea-result" data-ea-result>New replicas are created and must become Ready before old capacity is removed.</div>`,
    endpoints: `<div class="ea-endpoint-options"><label><input data-ea-input="endpoint-a" type="checkbox" checked> Pod A ready</label><label><input data-ea-input="endpoint-b" type="checkbox" checked> Pod B ready</label><label><input data-ea-input="endpoint-c" type="checkbox"> Pod C ready</label><button class="ea-mini-button" data-ea-action="route-request" type="button">Send request</button></div><div class="ea-result" data-ea-result>Ready endpoints: A, B. Requests exclude non-ready endpoints.</div>`,
    gitops: `<div class="ea-inline-control"><button class="ea-mini-button" data-ea-action="gitops-drift" type="button">Inject live drift</button><button class="ea-mini-button" data-ea-action="gitops-sync" type="button">Reconcile</button></div><div class="ea-result" data-ea-result>Desired and live state are aligned.</div>`,
    slo: `<div class="ea-input-grid"><label class="ea-input">SLO target <output data-ea-value="target">99.9%</output><input data-ea-input="target" type="range" min="99" max="99.99" step="0.01" value="99.9"></label><label class="ea-input">Observed availability <output data-ea-value="availability">99.95%</output><input data-ea-input="availability" type="range" min="98" max="100" step="0.01" value="99.95"></label></div><div class="ea-result" data-ea-result>Error budget is unspent in this sample window.</div>`,
    correlation: `<label class="ea-input ea-trace-filter">Trace ID filter<input data-ea-input="traceid" value="trc-8f31a2" maxlength="32" autocomplete="off" spellcheck="false"></label><div class="ea-result" data-ea-result>Logs and spans are filtered by trace_id=trc-8f31a2. The latency series provides time-window context; the exemplar links the outlier sample to this trace.</div>`,
    oidc: `<div class="ea-inline-control"><label><input data-ea-input="issuer" type="checkbox" checked> Issuer is trusted and signature is valid</label><label><input data-ea-input="audience" type="checkbox" checked> Audience claim matches trust policy</label><label><input data-ea-input="subject" type="checkbox" checked> Subject is permitted</label></div><div class="ea-result" data-ea-result>Trust conditions pass; the identity provider may issue short-lived credentials.</div>`,
    threat: `<label class="ea-input">STRIDE prompt<select data-ea-input="stride"><option value="S">Spoofing</option><option value="T">Tampering</option><option value="R">Repudiation</option><option value="I">Information disclosure</option><option value="D">Denial of service</option><option value="E">Elevation of privilege</option></select></label><div class="ea-result" data-ea-result>Identity spoofing: verify token issuer, audience, signature, expiry and workload subject.</div>`,
    supply: `<label class="ea-input">Inject a failed control<select data-ea-input="failure"><option value="none">No failure</option><option value="sbom">SBOM generation</option><option value="sign">Signature verification</option><option value="provenance">Provenance policy</option></select></label><div class="ea-result" data-ea-result>All illustrative controls pass. Deployment is permitted by this model.</div>`,
    cost: `<div class="ea-input-grid"><label class="ea-input">Compute <output data-ea-value="compute">2,000 h</output><input data-ea-input="compute" type="range" min="100" max="12000" step="100" value="2000"></label><label class="ea-input">Storage <output data-ea-value="storage">500 GB-mo</output><input data-ea-input="storage" type="range" min="50" max="5000" step="50" value="500"></label><label class="ea-input">Egress <output data-ea-value="egress">1,000 GB</output><input data-ea-input="egress" type="range" min="0" max="10000" step="100" value="1000"></label></div><div class="ea-result" data-ea-result>Illustrative estimate: $172.50 / month.</div>`,
    rightsizing: `<label class="ea-input">Workload profile<select data-ea-input="profile"><option value="balanced">Balanced API · moderate peak</option><option value="cpu">CPU-heavy batch</option><option value="memory">Memory-heavy cache</option></select></label><div class="ea-result" data-ea-result>Balanced profile: compare 2 vCPU / 4 GiB demand with reserved headroom before reducing capacity.</div>`
  };

  const baseRates = {compute:0.04, storage:0.025, egress:0.08};
  const labVisibilityObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => { if (!entry.isIntersecting) entry.target._eaStop?.(); }), { rootMargin: '80px 0px' }) : null;
  const strideNotes = {
    S:'Spoofing: validate issuer, audience, signature, expiry and workload identity.',
    T:'Tampering: protect data integrity with authorization, validation and signed artifacts.',
    R:'Repudiation: retain attributable, time-synchronized audit events with protected storage.',
    I:'Information disclosure: minimize data exposure, encrypt sensitive paths and enforce access boundaries.',
    D:'Denial of service: apply quotas, admission controls, bounded retries and capacity safeguards.',
    E:'Elevation of privilege: constrain permissions and validate authorization at every trust boundary.'
  };
  const initialDetails = {
    'linux-process':'Inspect the branch points: a running process can block and later return to Ready, or exit to a terminal state.',
    'network-journey':'Inspect the protocol layers from name resolution through transport, TLS and HTTP. Step to reveal each responsibility.',
    'git-branching':'Inspect the commit DAG: feature and main histories diverge, then meet at a merge commit.',
    'api-lifecycle':'Trace the request down through each dependency, then follow the response as the call stack unwinds.',
    'vpc-routing':'Choose a destination IP to recompute the longest-prefix route and selected next hop.',
    'network-policy':'Set packet fields to evaluate ordered NACL rules. The first matching rule decides; otherwise default deny applies.',
    'disaster-recovery':'Compare replication lag against RPO separately from restore duration against RTO.',
    'terraform-graph':'Inspect dependency edges. Independent resources can proceed in parallel once their prerequisites are ready.',
    'terraform-drift':'Compare declared configuration with refreshed remote state, then inspect the proposed plan before any apply.',
    'ansible-converge':'Run the configuration twice: the first run may change state; a compliant second run should be idempotent.',
    'deployment-strategy':'Choose rolling, blue/green or canary to compare how candidate capacity and production traffic are managed.',
    'pod-lifecycle':'Follow scheduling and container startup, then distinguish Running from Ready and endpoint eligibility.',
    'k8s-scheduler':'Adjust the Pod requests to see the filter stage reject infeasible nodes before scoring the remaining candidates.',
    'rolling-update':'Adjust desired replicas and inspect how a Deployment replaces old capacity only as new Pods become Ready.',
    'service-routing':'Toggle Pod readiness and send a request. Only eligible ready endpoints remain in the normal target pool.',
    'gitops-reconcile':'Compare Git desired state with the live cluster, inject drift, then reconcile the permitted difference.',
    'golden-path':'Explore how a developer request enters a self-service platform and passes through templates, controls and delivery capabilities.',
    'service-mesh':'Follow the workload-to-workload path through both proxies; the control plane distributes identity and traffic policy.',
    'slo-burn':'Adjust the SLO and observed availability to calculate budget consumption and burn rate.',
    'telemetry-correlation':'Use one trace identifier to join metric signals, structured log events and distributed spans.',
    'incident-impact':'Follow the change into user and system impact, then through detection, triage, mitigation and learning.',
    'oidc-journey':'Inspect the trust boundary: the cloud role is issued only after issuer, audience and subject conditions match.',
    'threat-model':'Inspect actors, processes, stores and trust boundaries, then choose a STRIDE prompt to consider threats.',
    'supply-chain':'Follow the artifact evidence envelope: source, build, SBOM, provenance, signature, verification and admission.',
    'cloud-cost':'Adjust compute, storage and egress assumptions to see their contribution to the illustrative monthly total.',
    'rightsizing':'Choose a workload profile and compare peak resource demand with provisioned capacity and resilience headroom.'
  };
  const initialDetail = lab => initialDetails[lab.id] || 'Step through the model to inspect its structure.';

  // Escape all data-derived labels before interpolating them into the generated lab markup.
  const stage = (i, title, detail, cls='') => `<div class="${cls} ea-stage" data-ea-stage="${i}"><span class="ea-stage-index">${String(i+1).padStart(2,'0')}</span><strong>${esc(title)}</strong>${detail?`<small>${esc(detail)}</small>`:''}</div>`;
  const visualRenderers = {
    'linux-process': lab => {
      const nodes = [
        [138,8,'Created','Kernel creates task'],[138,78,'Ready','Runnable queue'],[138,148,'Running','CPU execution'],[260,218,'Waiting','Blocked on event'],[16,218,'Terminated','Exit / cleanup']
      ];
      const nodeMarkup = nodes.map(([x,y,title,detail],i)=>`<g class="ea-process-node" data-ea-state="${i}" transform="translate(${x} ${y})"><rect width="124" height="44" rx="9"/><text class="ea-process-number" x="12" y="15">0${i+1}</text><text class="ea-process-title" x="62" y="25">${title}</text><text class="ea-process-sub" x="62" y="36">${detail}</text></g>`).join('');
      return `<div class="ea-process-map"><svg viewBox="0 0 400 280" role="img" aria-label="Linux process state machine with a waiting return transition and a terminal exit"><defs><marker id="proc-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="currentColor"/></marker></defs><path class="ea-process-edge" data-ea-edge-step="0" d="M200 52V74"/><path class="ea-process-edge" data-ea-edge-step="1" d="M200 122V144"/><path class="ea-process-edge" data-ea-edge-step="2" d="M200 192C228 204 255 202 275 214"/><path class="ea-process-edge" data-ea-edge-step="3" d="M260 240H380V100H266"/><path class="ea-process-edge" data-ea-edge-step="4" d="M200 122V144"/><path class="ea-process-edge" data-ea-edge-step="5" d="M200 192C180 210 145 212 142 230"/>${nodeMarkup}</svg><div class="ea-process-key"><span><i class="ea-key-dot is-live"></i>Runnable / executing</span><span><i class="ea-key-dot is-wait"></i>Event wait</span><span><i class="ea-key-dot is-stop"></i>Terminal state</span></div></div>`;
    },
    'network-journey': lab => `<div class="ea-protocol-stack">${lab.steps.map((s,i)=>`<div class="ea-protocol-layer ea-stage" data-ea-stage="${i}" data-ea-step="${i}"><div class="ea-protocol-index">${String(i+1).padStart(2,'0')}</div><div class="ea-protocol-copy"><strong>${esc(s[0])}</strong><small>${esc(s[1])}</small></div><span class="ea-protocol-class">${['CLIENT','NAME LOOKUP','TRANSPORT','SECURITY','APPLICATION','ORIGIN'][i]}</span></div>`).join('')}</div><div class="ea-protocol-foot"><span>NAME RESOLUTION</span><i></i><span>TRANSPORT + SECURITY</span><i></i><span>APPLICATION</span></div>`,
    'git-branching': lab => {
      const points=[[180,44],[88,132],[272,132],[88,224],[272,224],[180,312]];
      const edges=lab.edges.map(([from,to],i)=>{const [x1,y1]=points[from],[x2,y2]=points[to];const mid=(y1+y2)/2;return `<path class="ea-git-edge" data-ea-edge="${i}" d="M${x1} ${y1+18} C${x1} ${mid},${x2} ${mid},${x2} ${y2-18}"/>`;}).join('');
      const nodes=lab.nodes.map((node,i)=>{const [x,y]=points[i];return `<g class="ea-git-node" data-ea-node="${i}" data-ea-stage="${topologicalOrder(lab).indexOf(i)}" transform="translate(${x} ${y})"><circle r="18"/><text class="ea-git-hash" y="3">${esc(node[0])}</text><text class="ea-git-sub" y="32">${esc(node[1])}</text></g>`;}).join('');
      return `<div class="ea-git-history"><svg viewBox="0 0 360 352" role="img" aria-label="Git commit history with main and feature branches converging in a merge commit"><defs><marker id="git-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="currentColor"/></marker></defs><path class="ea-git-rail main" d="M88 132V224"/><path class="ea-git-rail feature" d="M272 132V224"/><text class="ea-git-branch-label" x="88" y="92">MAIN</text><text class="ea-git-branch-label" x="272" y="92">FEATURE</text>${edges.replaceAll('class="ea-git-edge"','class="ea-git-edge" marker-end="url(#git-arrow)"')}${nodes}</svg><div class="ea-git-legend"><span><i class="main"></i>Protected main history</span><span><i class="feature"></i>Feature branch</span><span><i class="merge"></i>Merge commit · two parents</span></div></div>`;
    },
    'api-lifecycle': lab => `<div class="ea-api-waterfall"><div class="ea-api-direction"><span class="ea-direction-pill">REQUEST ↓</span><span>Downstream call stack</span></div>${lab.steps.slice(0,4).map((s,i)=>`<div class="ea-api-call ea-stage" data-ea-stage="${i}"><div class="ea-api-call-marker">${String(i+1).padStart(2,'0')}</div><div><strong>${esc(s[0])}</strong><small>${esc(s[1])}</small></div><span class="ea-api-call-kind">${['INGRESS','POLICY','IDENTITY','LOGIC'][i]}</span></div>`).join('')}<div class="ea-api-cache-decision ea-stage" data-ea-stage="4"><span>CACHE LOOKUP · OPTIONAL</span><div class="ea-api-cache-branches"><div class="cache-hit"><b>HIT</b><small>Return cached representation</small></div><div class="cache-miss"><b>MISS</b><small>Continue to persistent data</small></div></div></div><div class="ea-api-database ea-stage" data-ea-stage="5"><b>Database</b><small>${esc(lab.steps[5][1])}</small><span>QUERY / TRANSACTION</span></div><div class="ea-api-return ea-stage" data-ea-stage="6"><div class="ea-return-arrow">↥</div><div><strong>Response unwinds to client</strong><small>Database or cache → service → gateway → client · status and payload</small></div><span class="ea-direction-pill">RESPONSE ↑</span></div></div>`,
    'vpc-routing': lab => `<div class="ea-route-inspector"><div class="ea-route-packet ea-stage" data-ea-stage="0"><span class="ea-route-packet-icon">↗</span><div><small>SOURCE WORKLOAD</small><strong>10.20.1.12</strong><small>Destination: <b data-route-destination>10.20.4.25</b></small></div></div><div class="ea-route-lookup ea-stage" data-ea-stage="1"><span>ROUTE TABLE · LONGEST PREFIX MATCH</span><div class="ea-route-row" data-route="local"><code>10.20.0.0/16</code><b>local</b><small>16-bit prefix</small></div><div class="ea-route-row" data-route="transit"><code>10.30.0.0/16</code><b>Transit Gateway</b><small>16-bit prefix</small></div><div class="ea-route-row" data-route="default"><code>0.0.0.0/0</code><b>NAT Gateway</b><small>0-bit fallback</small></div></div><div class="ea-route-selected ea-stage" data-ea-stage="2"><span class="ea-route-check">✓</span><div><small>SELECTED NEXT HOP</small><strong data-route-next>local VPC route</strong></div></div><div class="ea-route-guard ea-stage" data-ea-stage="3"><span>POLICY CHECK</span><b>Security groups · NACLs · firewall</b></div><div class="ea-route-destination ea-stage" data-ea-stage="4"><span>DESTINATION</span><b>Reachability also needs a valid return route</b></div></div>`,
    'network-policy': lab => `<div class="ea-acl-evaluator"><div class="ea-acl-packet ea-stage" data-ea-stage="0"><span>INBOUND PACKET</span><b data-acl-packet>TCP · 5432</b><small>Source / destination / protocol / port</small></div><div class="ea-acl-rule ea-stage" data-ea-stage="1"><span class="ea-rule-no">100</span><div><strong>Allow HTTPS to public edge</strong><small>TCP · destination port 443 · internet client</small></div><b class="ea-rule-state">MATCH?</b></div><div class="ea-acl-rule ea-stage" data-ea-stage="2"><span class="ea-rule-no">110</span><div><strong>Allow PostgreSQL from app subnet</strong><small>TCP · destination port 5432 · app → data</small></div><b class="ea-rule-state">MATCH?</b></div><div class="ea-acl-default ea-stage" data-ea-stage="3"><span>END OF RULE LIST</span><strong>Default action · DENY</strong><small>First matching rule wins. No match means reject.</small></div></div>`,
    'disaster-recovery': lab => `<div class="ea-recovery-board"><div class="ea-recovery-objectives"><div class="ea-recovery-metric rpo"><span>DATA LOSS WINDOW</span><strong>RPO</strong><small>How far back can recovery go?</small><div class="ea-recovery-ruler"><i></i><i></i><i></i><b data-rpo-fill></b></div><em data-rpo-label>2 min lag / 5 min objective</em></div><div class="ea-recovery-metric rto"><span>SERVICE RESTORE WINDOW</span><strong>RTO</strong><small>How long can restoration take?</small><div class="ea-recovery-ruler"><i></i><i></i><i></i><b data-rto-fill></b></div><em data-rto-label>25 min restore / 30 min objective</em></div></div><div class="ea-recovery-phases">${lab.steps.map((s,i)=>`<div class="ea-recovery-phase ea-stage" data-ea-stage="${i}"><span>${String(i+1).padStart(2,'0')}</span><div><strong>${esc(s[0])}</strong><small>${esc(s[1])}</small></div></div>`).join('')}</div></div>`,
    'terraform-graph': lab => renderGraph(lab),
    'terraform-drift': lab => `<div class="ea-drift-inspector"><div class="ea-drift-columns"><div class="ea-drift-pane desired ea-stage" data-ea-stage="0"><span>DECLARED CONFIG</span><strong>Desired state</strong><div class="ea-code-line"><code>replicas</code><b>3</b></div><div class="ea-code-line"><code>image</code><b>v2.4.1</b></div><div class="ea-code-line"><code>size</code><b>small</b></div></div><div class="ea-drift-pane observed ea-stage" data-ea-stage="1"><span>REFRESHED REMOTE</span><strong>Observed state</strong><div class="ea-code-line"><code>replicas</code><b class="ea-diff-value">2</b></div><div class="ea-code-line"><code>image</code><b>v2.4.1</b></div><div class="ea-code-line"><code>size</code><b>small</b></div></div></div><div class="ea-drift-diff ea-stage" data-ea-stage="2"><span>PLAN DIFF</span><strong>replicas: 2 <i>→</i> 3</strong><small>One in-place update proposed · no replacement in this simplified case</small></div><div class="ea-drift-review ea-stage" data-ea-stage="3"><b>Human review gate</b><small>Inspect blast radius, replacements and destructive actions before apply.</small></div><div class="ea-drift-apply ea-stage" data-ea-stage="4">AUTHORIZED APPLY ONLY</div></div>`,
    'ansible-converge': lab => `<div class="ea-converge-orbit"><div class="ea-converge-core"><span>DECLARED</span><strong>Desired<br>state</strong><small>idempotent target</small></div><div class="ea-converge-node inspect ea-stage" data-ea-stage="0"><b>01</b><strong>Inspect</strong><small>Gather facts</small></div><div class="ea-converge-node compare ea-stage" data-ea-stage="1"><b>02</b><strong>Compare</strong><small>Find changes</small></div><div class="ea-converge-node apply ea-stage" data-ea-stage="2"><b>03</b><strong>Apply</strong><small>Change only what differs</small></div><div class="ea-converge-node verify ea-stage" data-ea-stage="3"><b>04</b><strong>Verify</strong><small>Check outcomes</small></div><div class="ea-converge-node stable ea-stage" data-ea-stage="4"><b>05</b><strong>Converged</strong><small>Second run: changed=0</small></div><div class="ea-converge-loop">↻ repeat until compliant</div></div>`,
    'deployment-strategy': lab => `<div class="ea-release-explorer"><div class="ea-release-modes" data-ea-deploy="rolling"><div class="ea-release-mode" data-release-mode="rolling"><span>ROLLING</span><div class="ea-pod-strip"><i class="old"></i><i class="old"></i><i class="new"></i><i class="new"></i></div><small>Replace instances in batches</small></div><div class="ea-release-mode" data-release-mode="bluegreen"><span>BLUE / GREEN</span><div class="ea-env-pair"><i class="blue">BLUE</i><i class="green">GREEN</i></div><small>Switch traffic between pools</small></div><div class="ea-release-mode" data-release-mode="canary"><span>CANARY</span><div class="ea-canary-split"><i></i><b>10%</b><i></i><b>90%</b></div><small>Increase candidate share gradually</small></div></div><div class="ea-release-gates">${lab.steps.map((s,i)=>`<div class="ea-release-gate ea-stage" data-ea-stage="${i}"><b>${String(i+1).padStart(2,'0')}</b><span>${esc(s[0])}</span><small>${esc(s[1])}</small></div>`).join('')}</div></div>`,
    'pod-lifecycle': lab => `<div class="ea-pod-ladder">${lab.states.map((s,i)=>`<div class="ea-pod-step ea-stage" data-ea-stage="${i}"><span class="ea-pod-state-icon">${['◌','⌖','▦','▶','✓'][i]}</span><div><b>${esc(s)}</b><small>${esc(lab.notes[i])}</small></div>${i===4?'<em>ENDPOINT ELIGIBLE</em>':''}</div>`).join('')}<div class="ea-pod-fault-branch"><span>↳ FAILURE BRANCH</span><b>ImagePullBackOff</b><small>Container waiting reason · Pod phase commonly remains Pending</small></div></div>`,
    'k8s-scheduler': lab => `<div class="ea-scheduler-board"><div class="ea-scheduler-request ea-stage" data-ea-stage="0"><span>POD REQUEST</span><b>CPU <i data-scheduler-cpu>2 vCPU</i> · MEMORY <i data-scheduler-memory>4 GiB</i></b></div><div class="ea-scheduler-candidates">${lab.nodes.slice(1,4).map((n,i)=>`<div class="ea-scheduler-node ea-stage" data-ea-stage="${i+1}"><span>${esc(n[0])}</span><b>${['1 / 4','3 / 6','5 / 2'][i]}</b><small>CPU / GiB</small></div>`).join('')}</div><div class="ea-scheduler-filter ea-stage" data-ea-stage="4"><span>FILTER</span><b>Feasible nodes only</b><small>Resources · taints · affinity · constraints</small></div><div class="ea-scheduler-score ea-stage" data-ea-stage="5"><span>SCORE</span><div class="ea-score-row"><b>Node A</b><i><em data-score-a></em></i><small data-score-a-label>—</small></div><div class="ea-score-row"><b>Node B</b><i><em data-score-b></em></i><small data-score-b-label>—</small></div><div class="ea-score-row"><b>Node C</b><i><em data-score-c></em></i><small data-score-c-label>—</small></div></div><div class="ea-scheduler-bind ea-stage" data-ea-stage="6">BIND POD → <b data-scheduler-bind>Node B</b></div></div>`,
    'rolling-update': lab => `<div class="ea-rollout-board"><div class="ea-rollout-columns"><div class="ea-rollout-set old-set"><span>OLD REPLICASET</span><div class="ea-rollout-pods">${[1,2,3,4,5].map(i=>`<i data-old-pod="${i}">old-${i}</i>`).join('')}</div><small>Existing capacity stays until replacement is Ready</small></div><div class="ea-rollout-set new-set"><span>NEW REPLICASET</span><div class="ea-rollout-pods">${[1,2,3,4,5].map(i=>`<i data-new-pod="${i}">new-${i}</i>`).join('')}</div><small>New Pods must pass readiness before old capacity is removed</small></div></div><div class="ea-rollout-controller">DEPLOYMENT CONTROLLER <span>maxSurge · maxUnavailable · readiness</span></div><div class="ea-rollout-stages">${lab.states.map((s,i)=>`<span class="ea-stage" data-ea-stage="${i}">${esc(s)}</span>`).join('')}</div><div class="ea-rollout-count">Desired replicas: <b data-ea-replicas>3</b></div></div>`,
    'service-routing': lab => `<div class="ea-endpoint-tree"><div class="ea-endpoint-client ea-stage" data-ea-stage="0">CLIENT REQUEST</div><div class="ea-tree-stem"></div><div class="ea-endpoint-service ea-stage" data-ea-stage="1"><b>Service</b><small>Selector + port mapping</small></div><div class="ea-tree-stem"></div><div class="ea-endpoint-slice ea-stage" data-ea-stage="2">EndpointSlice · matching Pod addresses</div><div class="ea-endpoint-pods">${['A','B','C'].map((p,i)=>`<div class="ea-endpoint-pod ea-stage ${i<2?'is-ready':'is-not-ready'}" data-endpoint-pod="${p}" data-ea-stage="3"><b>Pod ${p}</b><small>${i<2?'Ready':'NotReady'}</small></div>`).join('')}</div><div class="ea-endpoint-pool ea-stage" data-ea-stage="4"><span>ELIGIBLE READY POOL</span><b data-ea-selected>Pod A / Pod B</b></div></div>`,
    'gitops-reconcile': lab => `<div class="ea-gitops-board"><div class="ea-gitops-columns"><div class="ea-gitops-state desired ea-stage" data-ea-stage="0"><span>GIT REPOSITORY</span><b>Desired state</b><small>replicas: 3</small><em>reviewed commit</em></div><div class="ea-gitops-state live ea-stage" data-ea-stage="1"><span>LIVE CLUSTER</span><b>Observed state</b><small data-gitops-replicas>replicas: 3</small><em>controller observation</em></div></div><div class="ea-gitops-diff ea-stage" data-ea-stage="2"><span>DIFF ENGINE</span><b data-gitops-diff>In sync · no drift</b></div><div class="ea-gitops-controller ea-stage" data-ea-stage="3">↻ CONTROLLER RECONCILIATION <small>apply permitted desired state</small></div><div class="ea-gitops-health ea-stage" data-ea-stage="4">HEALTH + SYNC STATUS <b data-gitops-health>Healthy · Synced</b></div></div>`,
    'golden-path': lab => `<div class="ea-platform-blueprint"><div class="ea-platform-actor ea-stage" data-ea-stage="0"><span>DEVELOPER</span><b>Service intent</b></div><div class="ea-platform-hub">INTERNAL DEVELOPER PLATFORM <small>self-service control plane</small></div><div class="ea-platform-capabilities"><div class="ea-platform-cap ea-stage" data-ea-stage="1"><b>01</b><strong>Template</strong><small>Repo scaffold</small></div><div class="ea-platform-cap ea-stage" data-ea-stage="2"><b>02</b><strong>Controls</strong><small>Ownership + policy</small></div><div class="ea-platform-cap ea-stage" data-ea-stage="3"><b>03</b><strong>CI</strong><small>Build + verify</small></div><div class="ea-platform-cap ea-stage" data-ea-stage="4"><b>04</b><strong>Artifact</strong><small>Digest + registry</small></div><div class="ea-platform-cap ea-stage" data-ea-stage="5"><b>05</b><strong>IaC + deploy</strong><small>Provision + release</small></div></div><div class="ea-platform-rails"><span>SECURITY GUARDRAILS · IAM · POLICY</span><span>OBSERVABILITY · OWNERSHIP · SLO</span></div><div class="ea-platform-runtime ea-stage" data-ea-stage="6">RUNTIME SERVICE <b>Operate with feedback</b></div></div>`,
    'service-mesh': lab => `<div class="ea-mesh-top">CONTROL PLANE <span>identity · certificates · traffic policy</span></div><div class="ea-mesh-data-plane"><div class="ea-mesh-workload"><b>Service A</b><div class="ea-mesh-proxy">Proxy A <small>mTLS client</small></div></div><div class="ea-mesh-tunnel"><span>ENCRYPTED mTLS TUNNEL</span><i>⇄</i><small>peer identity + policy</small></div><div class="ea-mesh-workload"><b>Service B</b><div class="ea-mesh-proxy">Proxy B <small>mTLS server</small></div></div></div><div class="ea-mesh-telemetry">TELEMETRY OUTCOME <span>spans · policy decisions · retries</span></div><div class="ea-mesh-stage-list">${lab.steps.map((s,i)=>`<span class="ea-stage" data-ea-stage="${i}">${esc(s[0])}</span>`).join('')}</div>`,
    'slo-burn': lab => `<div class="ea-slo-board"><div class="ea-budget-vessel"><span>ERROR BUDGET</span><div class="ea-budget-tank"><div class="ea-budget-fill" data-budget-fill></div><div class="ea-budget-ticks">${lab.data.map((v,i)=>`<i class="ea-stage" data-ea-stage="${i}" title="Sample ${i+1}: ${v}"></i>`).join('')}</div></div><b data-budget-readout>100% remaining</b></div><div class="ea-burn-panel"><span>BURN RATE</span><strong data-burn-readout>—×</strong><small>Observed error ratio ÷ allowed error ratio</small><div class="ea-burn-threshold"><i></i><b>1× budget pace</b></div><p>Above 1× consumes budget faster than the SLO allows.</p></div></div>`,
    'telemetry-correlation': lab => `<div class="ea-telemetry-board">
      <div class="ea-trace-context ea-telemetry-context">
        <div class="ea-context-copy"><span>SHARED REQUEST CONTEXT</span><b data-trace-context>trace_id = trc-8f31a2</b><small>One distributed trace propagated through the request path</small></div>
        <div class="ea-context-route" aria-label="Request path"><span>EDGE</span><i>→</i><span>CATALOG</span><i>→</i><span>PRICING</span><i>→</i><span>POSTGRES</span></div>
      </div>
      <div class="ea-telemetry-workspace">
        <section class="ea-signal-investigation" aria-label="Metrics and structured log investigation">
          <div class="ea-telemetry-panel-head"><span>01 / SIGNAL INVESTIGATION</span><small>TIME WINDOW · SYNTHETIC</small></div>
          <div class="ea-metric-panel">
            <div class="ea-metric-heading"><div><span class="ea-panel-kicker">METRICS / LATENCY</span><strong>Request latency</strong><small>12 samples · illustrative milliseconds</small></div><div class="ea-peak-readout"><b>72<span>ms</span></b><small>peak sample</small></div></div>
            <div class="ea-latency-chart" role="img" aria-label="Twelve synthetic latency samples. Values rise from 18 milliseconds to a peak of 72 milliseconds, then recover to 19 milliseconds."><div class="ea-chart-axis"><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div><div class="ea-latency-bars">${lab.data.map((value,i)=>`<div class="ea-latency-sample ea-stage${i===7?' is-exemplar':''}" data-ea-stage="${i}"${i===7?' data-ea-trace-id="trc-8f31a2"':''} title="Sample ${i+1}: ${value} ms"><i style="height:${Math.max(5,Math.round(value/80*100))}%"></i><small>${String(i+1).padStart(2,'0')}</small></div>`).join('')}</div></div>
            <div class="ea-metric-footer"><span>BASELINE <b>18–24 ms</b></span><span class="ea-exemplar-label"><i></i> TRACE EXEMPLAR · SAMPLE 08 → <code data-ea-trace-copy>trc-8f31a2</code></span><span>RECOVERY <b>19 ms</b></span></div>
          </div>
          <div class="ea-log-panel">
            <div class="ea-log-panel-head"><div><span class="ea-panel-kicker">LOGS / STRUCTURED EVENTS</span><strong>Filtered request events</strong></div><small>trace_id match</small></div>
            <div class="ea-log-events">
              ${[['00 ms','INFO','edge.gateway','request accepted','sp-01'],['12 ms','DEBUG','catalog.api','cache miss','sp-02'],['46 ms','ERROR','pricing.api','upstream timeout','sp-03'],['51 ms','WARN','edge.gateway','retry scheduled','sp-01']].map((event,i)=>`<div class="ea-log-event ea-stage" data-ea-stage="${i+4}" data-ea-trace-id="trc-8f31a2"><span class="ea-log-time">${event[0]}</span><span class="ea-log-level level-${event[1].toLowerCase()}">${event[1]}</span><div class="ea-log-message"><b>${event[2]}</b><small>${event[3]}</small><small class="ea-log-trace-id">trace_id=<code data-ea-trace-copy>trc-8f31a2</code></small></div><code>${event[4]}</code></div>`).join('')}
            </div>
            <p class="ea-correlation-empty" data-ea-correlation-empty-logs hidden>No structured log events match this trace ID.</p>
          </div>
        </section>
        <section class="ea-trace-investigation" aria-label="Distributed trace waterfall">
          <div class="ea-telemetry-panel-head"><span>02 / DISTRIBUTED TRACE</span><small>4 SPANS · PARENT / CHILD</small></div>
          <div class="ea-trace-panel-title"><div><span class="ea-panel-kicker">TRACE WATERFALL</span><strong>Request execution tree</strong><small>Nested span duration · illustrative timing</small></div><span class="ea-trace-duration">124 <small>ms total</small></span></div>
          <div class="ea-trace-scale"><span>SERVICE / SPAN</span><div><i>0</i><i>40</i><i>80</i><i>120 ms</i></div></div>
          <div class="ea-trace-waterfall">
            ${[['API gateway','GET /products','sp-01',0,100,0,'ROOT','124 ms'],['Catalog service','getProduct','sp-02',9,78,1,'CHILD','97 ms'],['Pricing service','fetchPrice','sp-03',31,43,2,'CHILD','53 ms'],['PostgreSQL','SELECT product','sp-04',63,26,3,'CHILD','32 ms']].map((span,i)=>`<div class="ea-span-row ea-stage depth-${span[5]}" data-ea-stage="${i+8}" data-ea-trace-id="trc-8f31a2"><div class="ea-span-identity"><span class="ea-span-branch">${i===0?'●':i===3?'└':'├'}</span><div><b>${span[0]}</b><small>${span[1]}</small></div><code>${span[2]}</code></div><div class="ea-span-track"><i class="ea-span-bar" style="--span-start:${span[3]}%;--span-size:${span[4]}%"></i></div><span class="ea-span-kind">${span[7]}</span></div>`).join('')}
          </div>
          <p class="ea-correlation-empty" data-ea-correlation-empty-spans hidden>No distributed spans match this trace ID.</p>
          <div class="ea-trace-bottom-grid">
            <div class="ea-span-hierarchy">
              <div class="ea-bottom-panel-head"><span>SPAN PARENTAGE</span><small>CALL TREE</small></div>
              <div class="ea-span-tree-list">
                ${[['API gateway','root request','sp-01',0],['Catalog service','child of sp-01','sp-02',1],['Pricing service','child of sp-02','sp-03',2],['PostgreSQL','child of sp-03','sp-04',3]].map((node,i)=>`<div class="ea-span-node ea-stage depth-${node[3]}" data-ea-stage="${i+8}" data-ea-trace-id="trc-8f31a2"><i>${i===0?'●':'↳'}</i><div><b>${node[0]}</b><small>${node[1]}</small></div><code>${node[2]}</code></div>`).join('')}
              </div>
              <p class="ea-correlation-empty" data-ea-correlation-empty-tree hidden>No span parentage is available for this trace ID.</p>
            </div>
            <div class="ea-active-span-panel">
              <div class="ea-bottom-panel-head"><span>ACTIVE SPAN CONTEXT</span><small>INSPECT</small></div>
              <div class="ea-span-context-grid">
                <div><small>SERVICE</small><b data-ea-active-service>Awaiting selection</b></div>
                <div><small>SPAN ID</small><b data-ea-active-span>—</b></div>
                <div><small>PARENT SPAN</small><b data-ea-parent-span>—</b></div>
                <div><small>TRACE FLAGS</small><b>01 · sampled</b></div>
              </div>
              <p>Use <code>span_id</code> to inspect an operation and <code>parent_span_id</code> to follow its call ancestry.</p>
            </div>
          </div>
          <div class="ea-trace-insight"><span class="ea-insight-pulse"></span><div><b data-ea-trace-insight>Awaiting span selection</b><small>Compare the active span interval with its parent and the matching structured log event.</small></div></div>
          <div class="ea-trace-legend"><span><i class="legend-root"></i>Root operation</span><span><i class="legend-child"></i>Child operation</span><span><i class="legend-exemplar"></i>Metric exemplar link</span></div>
        </section>
      </div>
      <div class="ea-correlation-bridge"><span>TIME-SERIES CONTEXT</span><i>↔</i><span>TRACE-FILTERED LOGS</span><i>↔</i><span>PARENT / CHILD SPANS</span><b>ONE INVESTIGATION</b></div>
    </div>`,
    'incident-impact': lab => `<div class="ea-incident-map"><div class="ea-incident-root ea-stage" data-ea-stage="0"><span>TRIGGERING CHANGE</span><b>Release / configuration event</b></div><div class="ea-incident-fork"><i></i><i></i></div><div class="ea-incident-impact"><div class="ea-impact-branch ea-stage" data-ea-stage="1"><b>USER IMPACT</b><small>Latency increase · failed requests</small></div><div class="ea-impact-branch ea-stage" data-ea-stage="1"><b>SYSTEM SIGNALS</b><small>Errors · saturation · dependency health</small></div></div><div class="ea-incident-response">${lab.steps.slice(2).map((s,i)=>`<div class="ea-incident-action ea-stage" data-ea-stage="${i+2}"><span>${String(i+1).padStart(2,'0')}</span><div><b>${esc(s[0])}</b><small>${esc(s[1])}</small></div></div>`).join('')}</div></div>`,
    'oidc-journey': lab => `<div class="ea-oidc-boundary"><div class="ea-oidc-outside"><span>WORKLOAD DOMAIN</span><div class="ea-oidc-step ea-stage" data-ea-stage="0"><b>CI runner</b><small>Request job identity token</small></div><div class="ea-oidc-step ea-stage" data-ea-stage="1"><b>OIDC issuer</b><small>Signed JWT · iss / aud / sub</small></div></div><div class="ea-oidc-trust-label">TRUST BOUNDARY · TOKEN EXCHANGE</div><div class="ea-oidc-inside"><div class="ea-oidc-step ea-stage" data-ea-stage="2"><b>Cloud STS</b><small>Validate issuer and audience</small></div><div class="ea-oidc-step ea-stage" data-ea-stage="3"><b>Role trust policy</b><small>Match subject and conditions</small></div><div class="ea-oidc-step ea-stage" data-ea-stage="4"><b>Temporary credentials</b><small>Short-lived scoped session</small></div><div class="ea-oidc-step ea-stage" data-ea-stage="5"><b>Cloud API</b><small>Authorize permitted action</small></div></div></div>`,
    'threat-model': lab => `<div class="ea-dfd-map"><div class="ea-dfd-actor ea-stage" data-ea-stage="0"><span>EXTERNAL ACTOR</span><b>Client</b><small>Untrusted input</small></div><div class="ea-dfd-boundary"><span class="ea-boundary-label">TRUST BOUNDARY A · EDGE</span><div class="ea-dfd-process ea-stage" data-ea-stage="1"><b>API edge</b><small>Rate limit · validation</small></div><div class="ea-dfd-flow">HTTPS + identity context ↓</div><div class="ea-dfd-process ea-stage" data-ea-stage="2"><b>Application service</b><small>Authorization · business logic</small></div><div class="ea-dfd-stores"><div class="ea-dfd-store ea-stage" data-ea-stage="3"><b>Data store</b><small>Confidential records</small></div><div class="ea-dfd-store identity ea-stage" data-ea-stage="4"><b>Identity provider</b><small>Issuer / key material</small></div></div></div><div class="ea-dfd-legend"><i></i>Process <i></i>Data store <i></i>Trust boundary</div></div>`,
    'supply-chain': lab => `<div class="ea-supply-assurance"><div class="ea-supply-source ea-stage" data-ea-stage="0"><span>TRUSTED SOURCE</span><b>Reviewed commit</b><small>source ref + approval</small></div><div class="ea-supply-build ea-stage" data-ea-stage="1"><b>Isolated build</b><small>builder identity + declared inputs</small></div><div class="ea-supply-artifact"><div class="ea-artifact-core">OCI<br>ARTIFACT<small>sha256:digest</small></div><div class="ea-proof proof-sbom ea-stage" data-ea-stage="2"><b>SBOM</b><small>component inventory</small></div><div class="ea-proof proof-prov ea-stage" data-ea-stage="3"><b>Provenance</b><small>builder + inputs</small></div><div class="ea-proof proof-sign ea-stage" data-ea-stage="4"><b>Signature</b><small>identity binds digest</small></div></div><div class="ea-supply-verify ea-stage" data-ea-stage="5"><b>VERIFY POLICY</b><small>signature · subject · source · materials</small></div><div class="ea-supply-admission ea-stage" data-ea-stage="6">ADMISSION <strong>PERMIT / BLOCK</strong></div></div>`,
    'cloud-cost': lab => `<div class="ea-cost-composition"><div class="ea-cost-total"><span>ESTIMATED MONTHLY TOTAL</span><strong data-cost-total>$172.50</strong><small>Illustrative unit rates only</small></div><div class="ea-cost-rows"><div class="ea-cost-row ea-stage" data-ea-stage="0"><span>COMPUTE</span><div class="ea-cost-bar"><i data-cost-bar="compute"></i></div><b data-cost-value="compute">$80.00</b></div><div class="ea-cost-row ea-stage" data-ea-stage="1"><span>STORAGE</span><div class="ea-cost-bar"><i data-cost-bar="storage"></i></div><b data-cost-value="storage">$12.50</b></div><div class="ea-cost-row ea-stage" data-ea-stage="2"><span>EGRESS</span><div class="ea-cost-bar"><i data-cost-bar="egress"></i></div><b data-cost-value="egress">$80.00</b></div></div><div class="ea-cost-note">COST COMPOSITION · workload drivers, not provider quotations</div></div>`,
    'rightsizing': lab => `<div class="ea-capacity-envelope" data-capacity-profile="balanced"><div class="ea-capacity-legend"><span><i class="allocated"></i> Provisioned</span><span><i class="demand"></i> Observed demand</span><span><i class="headroom"></i> Safety headroom</span></div><div class="ea-capacity-resources"><div class="ea-resource-gauge"><div class="ea-resource-head"><b>CPU</b><span data-capacity-cpu>2 vCPU · 62% peak</span></div><div class="ea-resource-track"><i class="ea-resource-demand" data-resource-demand="cpu"></i><i class="ea-resource-headroom"></i></div><small>Utilization envelope · include sustained + peak demand</small></div><div class="ea-resource-gauge"><div class="ea-resource-head"><b>MEMORY</b><span data-capacity-memory>4 GiB · 72% working set</span></div><div class="ea-resource-track"><i class="ea-resource-demand" data-resource-demand="memory"></i><i class="ea-resource-headroom"></i></div><small>Working set · cache pressure · failover margin</small></div></div><div class="ea-capacity-samples">${lab.data.map((v,i)=>`<i class="ea-stage" data-ea-stage="${i}" style="--demand:${v}%"></i>`).join('')}</div><div class="ea-capacity-warning">RIGHTSIZE AGAINST PEAKS, SLOs AND RESILIENCE — NOT AVERAGE UTILIZATION ALONE</div></div>`
  };

  const createStageVisual = lab => {
    const renderer = visualRenderers[lab.id];
    if (!renderer) return `<div class="ea-visual-error">Visual model unavailable for ${esc(lab.title)}.</div>`;
    return `<div class="ea-viz ea-viz-${lab.id}" data-ea-visual="${lab.id}">${renderer(lab)}<p class="ea-engine-detail" data-ea-detail>${esc(initialDetail(lab))}</p></div>`;
  };

  const renderGraph = lab => {
    const nodes = lab.nodes;
    const positions = graphLayouts[lab.id] || nodes.map((_,i)=>[128,8+i*70]);
    const viewHeight = Math.max(220,Math.max(...positions.map(p => p[1]))+66);
    const order = topologicalOrder(lab);
    const edges = lab.edges.map(([a,b],i)=>{
      const [x1,y1]=positions[a], [x2,y2]=positions[b];
      const sx=x1+52, sy=y1+50, ex=x2+52, ey=y2;
      const mid=(sy+ey)/2;
      return `<path class="ea-graph-edge" data-ea-edge="${i}" d="M${sx} ${sy} C${sx} ${mid}, ${ex} ${mid}, ${ex} ${ey}"/>`;
    }).join('');
    const nodesMarkup = nodes.map((node,i)=>{
      const [x,y]=positions[i];
      return `<g class="ea-graph-node" data-ea-node="${i}" data-ea-stage="${order.indexOf(i)}" transform="translate(${x} ${y})"><rect width="104" height="50" rx="9"/><text x="52" y="21">${esc(node[0])}</text><text class="ea-graph-sub" x="52" y="36">${esc(node[1])}</text></g>`;
    }).join('');
    return `<div class="ea-graph-wrap" data-ea-engine="graph"><svg class="ea-graph-svg" viewBox="0 0 360 ${viewHeight}" role="img" aria-label="Directed graph for ${esc(lab.title)}"><defs><marker id="ea-arrow-${lab.id}" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="currentColor"/></marker></defs>${edges.replaceAll('class="ea-graph-edge"','class="ea-graph-edge" marker-end="url(#ea-arrow-'+lab.id+')"')}${nodesMarkup}</svg></div>`;
  };

  const topologicalOrder = lab => {
    const indegree = lab.nodes.map(()=>0); const outgoing = lab.nodes.map(()=>[]);
    lab.edges.forEach(([from,to])=>{outgoing[from].push(to);indegree[to]++;});
    const queue = indegree.map((value,i)=>value===0?i:-1).filter(i=>i>=0); const order=[];
    while(queue.length){const node=queue.shift();order.push(node);outgoing[node].forEach(next=>{indegree[next]--;if(indegree[next]===0)queue.push(next);});}
    return order.length===lab.nodes.length?order:lab.nodes.map((_,i)=>i);
  };

  /** Reflect rollout progress without implying a real cluster or deployment operation. */
  const updateRolloutVisual = (card, desired, stepIndex) => {
    const stageIndex=Number.isFinite(stepIndex)?stepIndex:-1;
    let oldCount=desired, newCount=0, readyCount=0;
    if(stageIndex===1){newCount=1;}
    else if(stageIndex===2){newCount=1;readyCount=1;}
    else if(stageIndex===3){oldCount=Math.max(0,desired-1);newCount=1;readyCount=1;}
    else if(stageIndex===4){oldCount=Math.max(0,desired-1);newCount=Math.min(desired,2);readyCount=newCount;}
    else if(stageIndex>=5){oldCount=0;newCount=desired;readyCount=desired;}
    card.querySelectorAll('[data-old-pod]').forEach(pod=>pod.classList.toggle('is-inactive',Number(pod.dataset.oldPod)>oldCount));
    card.querySelectorAll('[data-new-pod]').forEach(pod=>{
      const visible=Number(pod.dataset.newPod)<=newCount;
      pod.classList.toggle('is-inactive',!visible);
      pod.classList.toggle('is-ready',visible&&Number(pod.dataset.newPod)<=readyCount);
    });
  };

  /** Execute the domain-specific calculation behind a lab that needs more than a static stage list. */
  const customResult = (lab, card) => {
    const get = name => card.querySelector(`[data-ea-input="${name}"]`);
    const out = card.querySelector('[data-ea-result]'); if (!out) return;
    const val = name => get(name)?.value;
    if (lab.custom === 'route') {
      const destination = val('destination');
      const table = [['10.20.0.0/16','local'],['10.30.0.0/16','transit gateway'],['0.0.0.0/0','NAT gateway']];
      const ipNum = ip => ip.split('.').reduce((n,part)=>(n*256 + Number(part))>>>0,0);
      const bits = cidr => Number(cidr.split('/')[1]);
      const match = (ip,cidr) => {const [network]=cidr.split('/');const prefix=bits(cidr);const mask=prefix===0?0:(0xffffffff << (32-prefix))>>>0;return (ipNum(ip)&mask)===(ipNum(network)&mask);};
      const best = table.filter(([cidr])=>match(destination,cidr)).sort((a,b)=>bits(b[0])-bits(a[0]))[0];
      out.textContent = `${best[0]} is the longest-prefix match → ${best[1]}. Next, network policy and return routing must also permit the flow.`;
      card.querySelector('[data-route-destination]').textContent=destination;
      card.querySelectorAll('[data-route]').forEach(row=>row.classList.toggle('is-selected',row.dataset.route===({local:'local','transit gateway':'transit','NAT gateway':'default'}[best[1]])));
      card.querySelector('[data-route-next]').textContent=best[1];
    } else if (lab.custom === 'policy') {
      const source=val('source'), destination=val('destination'), protocol=val('protocol'), port=val('port');
      const allowWeb = destination==='10.20.2.10' && source==='198.51.100.12' && protocol==='TCP' && port==='443';
      const allowDb = destination==='10.20.3.10' && source==='10.20.1.25' && protocol==='TCP' && port==='5432';
      const allowed=allowWeb||allowDb;
      out.textContent = allowWeb?'Rule 100 matches: ALLOW TCP 443 to public edge.':allowDb?'Rule 110 matches: ALLOW TCP 5432 from app subnet to data subnet.':'No allow rule matches before the default action: DENY.';
      card.querySelector('[data-acl-packet]').textContent=`${protocol} · ${port}`;
      card.querySelectorAll('.ea-acl-rule').forEach((row,i)=>row.classList.toggle('is-match',(allowWeb&&i===0)||(allowDb&&i===1)));
      card.querySelector('.ea-acl-default').classList.toggle('is-denied',!allowed);
      out.dataset.state=allowed?'ok':'warn';
    } else if (lab.custom === 'dr') {
      const rpo=Number(val('rpo')), lag=Number(val('lag')), rto=Number(val('rto')), restore=Number(val('restore'));
      card.querySelector('[data-ea-value="rpo"]').textContent=`${rpo} min`;card.querySelector('[data-ea-value="lag"]').textContent=`${lag} min`;card.querySelector('[data-ea-value="rto"]').textContent=`${rto} min`;card.querySelector('[data-ea-value="restore"]').textContent=`${restore} min`;
      out.textContent=`RPO ${lag<=rpo?'MET':'MISSED'} (${lag} / ${rpo} min). RTO ${restore<=rto?'MET':'MISSED'} (${restore} / ${rto} min).`;
      out.dataset.state=lag<=rpo&&restore<=rto?'ok':'warn';
      card.querySelector('[data-rpo-fill]').style.width=`${Math.min(100,(lag/rpo)*100)}%`;
      card.querySelector('[data-rto-fill]').style.width=`${Math.min(100,(restore/rto)*100)}%`;
      card.querySelector('[data-rpo-label]').textContent=`${lag} min lag / ${rpo} min objective · ${lag<=rpo?'MET':'MISSED'}`;
      card.querySelector('[data-rto-label]').textContent=`${restore} min restore / ${rto} min objective · ${restore<=rto?'MET':'MISSED'}`;
    } else if (lab.custom === 'drift') {
      const drift=get('drift').checked;
      out.textContent=drift?'Detected drift: desired replicas = 3, observed = 2. Plan proposes creating one additional replica, assuming no other resource replacement is required; review before apply.':'No drift in this snapshot. A plan would show no change if all managed attributes match.';
      card.classList.toggle('has-drift',drift);
      card.querySelector('.ea-drift-diff strong').textContent=drift?'replicas: 2 → 3':'No changes · desired = observed';
      card.querySelector('.ea-drift-review').classList.toggle('is-clear',!drift);
    } else if (lab.custom === 'converge') {
      const runs=Number(card.dataset.convergedRuns||0);
      out.textContent=runs>=2?'Run 2: changed=0, failed=0. Desired and observed state remain aligned; this demonstrates idempotent convergence.':runs===1?'Run 1: changed=2, failed=0. Package and service state now match the desired configuration. Run again to verify idempotency.':'Two declared changes are pending. Run convergence to apply the package and service state.';
      card.classList.toggle('is-converged',runs>=2);
    } else if (lab.custom === 'deployment') {
      const value=val('strategy');
      out.textContent=value==='rolling'?'Rolling: replace replicas gradually; readiness and maxUnavailable/maxSurge constrain progress.':value==='bluegreen'?'Blue/green: deploy a parallel environment, validate it, then switch traffic; rollback switches traffic back if the old environment is retained.':'Canary: send a small controlled traffic share to the candidate, compare service signals, then increase or abort.';
      card.querySelector('.ea-release-modes').dataset.eaDeploy=value;
      card.querySelectorAll('[data-release-mode]').forEach(mode=>mode.classList.toggle('is-selected',mode.dataset.releaseMode===value));
    } else if (lab.custom === 'pod') {
      const failed=card.dataset.podFailed==='true';
      out.textContent=failed?'ImagePullBackOff: the container image could not be retrieved. Check image name, tag, registry reachability and pull credentials; retry only after correction.':'A Pod may be Running while readiness is false. Only endpoints that satisfy readiness are eligible for ordinary Service traffic.';
      card.classList.toggle('has-pull-failure',failed);
      card.querySelector('.ea-pod-fault-branch').classList.toggle('is-active',failed);
    } else if (lab.custom === 'scheduler') {
      const cpu=Number(val('cpu')), mem=Number(val('memory'));
      card.querySelector('[data-ea-value="cpu"]').textContent=`${cpu} vCPU`;card.querySelector('[data-ea-value="memory"]').textContent=`${mem} GiB`;
      card.querySelector('[data-scheduler-cpu]').textContent=`${cpu} vCPU`;card.querySelector('[data-scheduler-memory]').textContent=`${mem} GiB`;
      const nodes=[{name:'Node A',cpu:1,mem:4,taint:false},{name:'Node B',cpu:3,mem:6,taint:false},{name:'Node C',cpu:5,mem:2,taint:true}];
      const fits=nodes.filter(n=>cpu<=n.cpu&&mem<=n.mem&&!n.taint).map(n=>({...n,score:100-(((n.cpu-cpu)/n.cpu)*50+((n.mem-mem)/n.mem)*50)})).sort((a,b)=>b.score-a.score);
      out.textContent=fits.length?`Filter: ${fits.map(n=>n.name).join(', ')} eligible. Sample score: ${fits.map(n=>`${n.name} ${n.score.toFixed(0)}`).join(' · ')}. Highest-scoring node: ${fits[0].name}. This is a deliberately simplified scoring plugin.`:'Filter: no eligible node. At least one resource or placement constraint cannot be satisfied.';
      nodes.forEach(node=>{
        const key=node.name.split(' ')[1].toLowerCase(), candidate=card.querySelector(`[data-ea-stage="${nodes.indexOf(node)+1}"]`);
        const fit=fits.find(item=>item.name===node.name);
        candidate?.classList.toggle('is-filtered',!fit);
        const bar=card.querySelector(`[data-score-${key}]`), label=card.querySelector(`[data-score-${key}-label]`);
        if(bar)bar.style.width=`${fit?fit.score:0}%`;
        if(label)label.textContent=fit?fit.score.toFixed(0):'EXCLUDED';
      });
      card.querySelector('[data-scheduler-bind]').textContent=fits[0]?.name||'No eligible node';
    } else if (lab.custom === 'rollout') {
      const replicas=Number(val('replicas'));
      out.textContent=`Model: ${replicas} desired replicas. Create candidate capacity, wait for readiness, then scale old replicas down while respecting rollout availability limits.`;
      card.querySelector('[data-ea-replicas]').textContent=String(replicas);
      updateRolloutVisual(card,replicas,Number(card.dataset.index??'-1'));
    } else if (lab.custom === 'endpoints') {
      const ready=['a','b','c'].filter(key=>get(`endpoint-${key}`).checked).map(key=>key.toUpperCase());
      out.textContent=ready.length?`Eligible endpoints: ${ready.join(', ')}. Non-ready endpoints are excluded from the normal ready endpoint set.`:'No ready endpoints. The Service has no eligible Pod target in this example.';
      ['A','B','C'].forEach(key=>{
        const isReady=get(`endpoint-${key.toLowerCase()}`).checked, pod=card.querySelector(`[data-endpoint-pod="${key}"]`);
        pod.classList.toggle('is-ready',isReady);pod.classList.toggle('is-not-ready',!isReady);pod.querySelector('small').textContent=isReady?'Ready':'NotReady';
      });
      const last=ready.length?ready[Number(card.dataset.requests||0)%ready.length]:'none';
      if(card.dataset.selectedEndpoint && !ready.includes(card.dataset.selectedEndpoint)) card.dataset.selectedEndpoint='';
      const selected=card.dataset.selectedEndpoint||'';
      card.querySelector('[data-ea-selected]').textContent=selected?`Pod ${selected} · selected`:last==='none'?'No eligible Pod':`Pod ${last} · ready pool`;
      card.querySelectorAll('[data-endpoint-pod]').forEach(pod=>pod.classList.toggle('is-selected',pod.dataset.endpointPod===selected));
    } else if (lab.custom === 'gitops') {
      const drift=card.dataset.gitopsDrift==='true';
      out.textContent=drift?'Drift detected: live replicas differ from Git desired state. Reconcile applies the configured desired state if policy and permissions allow.':'Desired and live state are aligned. The controller continues observing for drift.';
      card.classList.toggle('has-gitops-drift',drift);
      card.querySelector('[data-gitops-replicas]').textContent=drift?'replicas: 2':'replicas: 3';
      card.querySelector('[data-gitops-diff]').textContent=drift?'Drift · desired 3 / live 2':'In sync · no drift';
      card.querySelector('[data-gitops-health]').textContent=drift?'Progressing · OutOfSync':'Healthy · Synced';
    } else if (lab.custom === 'slo') {
      const target=Number(val('target')), availability=Number(val('availability'));
      card.querySelector('[data-ea-value="target"]').textContent=`${target.toFixed(2)}%`;card.querySelector('[data-ea-value="availability"]').textContent=`${availability.toFixed(2)}%`;
      const allowed=100-target, observed=100-availability, burn=allowed===0?(observed>0?Infinity:0):observed/allowed;
      const consumed=allowed===0?(observed>0?Infinity:0):Math.max(0,(observed/allowed)*100);
      out.textContent=`Error budget consumed in this illustrative window: ${Number.isFinite(consumed)?consumed.toFixed(1)+'%':'unbounded (zero budget)'}. Burn rate: ${Number.isFinite(burn)?burn.toFixed(2)+'×':'unbounded'}. A rate above 1× consumes budget faster than the SLO allowance.`;
      out.dataset.state=burn>1?'warn':'ok';
      card.querySelector('[data-burn-readout]').textContent=Number.isFinite(burn)?`${burn.toFixed(2)}×`:'∞';
      card.querySelector('[data-budget-readout]').textContent=Number.isFinite(consumed)?`${Math.max(0,100-consumed).toFixed(1)}% remaining`:'0% remaining';
      card.querySelector('[data-budget-fill]').style.height=`${Math.max(0,Math.min(100,100-consumed))}%`;
    } else if (lab.custom === 'correlation') {
      const id=val('traceid').trim()||'trace-id-required';
      const matched=id==='trc-8f31a2';
      card.dataset.correlationMatch=String(matched);
      card.querySelector('[data-trace-context]').textContent=`trace_id = ${id}`;
      card.querySelectorAll('[data-ea-trace-id]').forEach(el=>el.classList.toggle('is-correlation-hidden',el.dataset.eaTraceId!==id));
      card.querySelector('[data-ea-correlation-empty-logs]').hidden=matched;
      card.querySelector('[data-ea-correlation-empty-spans]').hidden=matched;
      card.querySelector('[data-ea-correlation-empty-tree]').hidden=matched;
      card.querySelector('.ea-span-hierarchy').classList.toggle('is-no-match',!matched);
      card.querySelector('.ea-latency-sample.is-exemplar')?.classList.toggle('is-unmatched',!matched);
      out.textContent=matched?`4 structured log events and 4 distributed spans match trace_id=${id}. The latency series supplies time-window context; its sample 08 exemplar links the outlier to this trace. Production correlation requires propagated context and consistent resource identity.`:`No synthetic log events or spans match trace_id=${id}. The latency chart remains aggregate time-series context; its only sample exemplar belongs to trc-8f31a2.`;
      out.dataset.state=matched?'ok':'warn';
      setStepState(card,lab,Number(card.dataset.index??'-1'));
    } else if (lab.custom === 'oidc') {
      const valid=get('issuer').checked&&get('audience').checked&&get('subject').checked;
      out.textContent=valid?'Issuer signature, audience and subject trust conditions match in this model: short-lived credentials may be issued.':'Trust policy rejects the token. No cloud credentials are issued; inspect issuer/signature, audience and subject conditions.';
      out.dataset.state=valid?'ok':'warn';card.classList.toggle('is-trust-rejected',!valid);
    } else if (lab.custom === 'threat') {
      out.textContent=strideNotes[val('stride')];
      card.dataset.stride=val('stride');
    } else if (lab.custom === 'supply') {
      const failure=val('failure');
      card.dataset.supplyFailure=failure;
      out.textContent=failure==='none'?'All illustrative controls pass. Deployment is permitted by this model.':`${failure.toUpperCase()} gate fails: deployment is blocked and downstream admission does not proceed.`;
      out.dataset.state=failure==='none'?'ok':'warn';
      card.dataset.supplyState=failure;
    } else if (lab.custom === 'cost') {
      const compute=Number(val('compute')),storage=Number(val('storage')),egress=Number(val('egress'));
      card.querySelector('[data-ea-value="compute"]').textContent=`${compute.toLocaleString()} h`;card.querySelector('[data-ea-value="storage"]').textContent=`${storage.toLocaleString()} GB-mo`;card.querySelector('[data-ea-value="egress"]').textContent=`${egress.toLocaleString()} GB`;
      const parts={compute:compute*baseRates.compute,storage:storage*baseRates.storage,egress:egress*baseRates.egress};
      const total=parts.compute+parts.storage+parts.egress, max=Math.max(...Object.values(parts),1);
      out.textContent=`Illustrative monthly estimate: $${total.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} · Compute $${parts.compute.toFixed(2)} · Storage $${parts.storage.toFixed(2)} · Egress $${parts.egress.toFixed(2)}.`;
      card.querySelector('[data-cost-total]').textContent=`$${total.toFixed(2)}`;
      Object.entries(parts).forEach(([key,amount])=>{card.querySelector(`[data-cost-value="${key}"]`).textContent=`$${amount.toFixed(2)}`;card.querySelector(`[data-cost-bar="${key}"]`).style.width=`${Math.max(2,(amount/max)*100)}%`;});
    } else if (lab.custom === 'rightsizing') {
      const profile=val('profile');
      const messages={cpu:'CPU-heavy batch: observe sustained and peak CPU, queue depth and completion time; evaluate compute-optimized capacity with safe headroom.',memory:'Memory-heavy cache: observe working set, eviction rate and memory pressure; evaluate memory-optimized capacity and failover behavior.',balanced:'Balanced API: compare request concurrency, p95/p99 latency and peak utilization before reducing either CPU or memory.'};
      out.textContent=messages[profile];
      card.querySelector('.ea-capacity-envelope').dataset.capacityProfile=profile;
      const values={cpu:[82,42,'4 vCPU · 82% peak','4 GiB · 42% working set'],memory:[48,86,'2 vCPU · 48% peak','8 GiB · 86% working set'],balanced:[62,72,'2 vCPU · 62% peak','4 GiB · 72% working set']}[profile];
      card.querySelector('[data-resource-demand="cpu"]').style.width=`${values[0]}%`;card.querySelector('[data-resource-demand="memory"]').style.width=`${values[1]}%`;
      card.querySelector('[data-capacity-cpu]').textContent=values[2];card.querySelector('[data-capacity-memory]').textContent=values[3];
      const gauges=card.querySelectorAll('.ea-resource-gauge');
      gauges[0].classList.toggle('is-tight',values[0]>80);gauges[1].classList.toggle('is-tight',values[1]>80);
    }
  };

  const stageCount = lab => lab.path ? lab.path.length : lab.kind==='sequence' ? lab.steps.length : lab.kind==='state' ? lab.states.length : lab.kind==='graph' ? lab.nodes.length : lab.data.length;

  /** Synchronize the active step, visual highlight, and live status for one lab. */
  const setStepState = (card, lab, index) => {
    const total=stageCount(lab);
    const clamped=Math.max(-1,Math.min(index,total-1));
    card.dataset.index=String(clamped);
    if(lab.id==='linux-process'){
      const activeState=clamped<0?-1:lab.path[clamped];
      const visited=new Set(clamped<0?[]:lab.path.slice(0,clamped+1));
      card.querySelectorAll('[data-ea-state]').forEach((el,i)=>{
        el.classList.toggle('is-current',i===activeState);
        el.classList.toggle('is-visited',visited.has(i));
      });
      card.querySelectorAll('[data-ea-edge-step]').forEach((el)=>{
        const edgeStep=Number(el.dataset.eaEdgeStep);
        el.classList.toggle('is-current',edgeStep===clamped);
        el.classList.toggle('is-visited',edgeStep>=0&&edgeStep<clamped);
      });
      card.querySelector('[data-ea-detail]').textContent=clamped<0?initialDetail(lab):lab.pathNotes[clamped];
    } else if(lab.kind==='graph' && card.querySelector('[data-ea-node]')){
      const order=topologicalOrder(lab);const active=new Set(order.slice(0,clamped+1));
      card.querySelectorAll('[data-ea-node]').forEach((el,i)=>{
        const orderIndex=order.indexOf(i);
        el.classList.toggle('is-visited',active.has(i));el.classList.toggle('is-current',orderIndex===clamped);
      });
      card.querySelectorAll('[data-ea-edge]').forEach((el,i)=>{
        const [from,to]=lab.edges[i];el.classList.toggle('is-visited',active.has(from)&&active.has(to));
      });
      card.querySelector('[data-ea-detail]').textContent=clamped<0?initialDetail(lab):`Execution order ${clamped+1}: ${lab.nodes[order[clamped]][0]}. Only nodes whose dependencies are satisfied can enter the ready set.`;
    } else {
      card.querySelectorAll('[data-ea-stage]').forEach(el=>{
        const stageIndex=Number(el.dataset.eaStage);
        el.classList.toggle('is-current',stageIndex===clamped);
        el.classList.toggle('is-past',stageIndex<clamped);
      });
      if(lab.id==='rolling-update') updateRolloutVisual(card,Number(card.querySelector('[data-ea-input=replicas]').value),clamped);
      if(lab.kind==='graph'){
        card.querySelector('[data-ea-detail]').textContent=clamped<0?initialDetail(lab):`Model stage ${clamped+1}: ${lab.nodes[clamped][0]}.`;
      } else if(lab.kind==='sequence'){
        const text=clamped<0?initialDetail(lab):lab.steps[clamped][1];
        card.querySelector('[data-ea-detail]').textContent=text;
      } else if(lab.kind==='state'){
        card.querySelector('[data-ea-detail]').textContent=clamped<0?initialDetail(lab):lab.notes[Math.min(clamped,lab.notes.length-1)];
      } else {
        const current=clamped<0?'—':String(lab.data[clamped]);
        const currentValue=card.querySelector('[data-ea-current]');if(currentValue)currentValue.textContent=current;
        const windowValue=card.querySelector('[data-ea-window]');if(windowValue)windowValue.textContent=`${clamped+1} / ${lab.data.length}`;
        const detail=clamped<0?initialDetail(lab):(lab.stageNotes?.[clamped]||`Sample ${clamped+1}: ${lab.data[clamped]} (illustrative model value).`);
        card.querySelector('[data-ea-detail]').textContent=detail;
        if(lab.id==='telemetry-correlation'){
          const insight=card.querySelector('[data-ea-trace-insight]');
          const traceMatch=card.dataset.correlationMatch!=='false';
          if(insight)insight.textContent=!traceMatch?'No matching span in the selected trace':clamped<0?'Awaiting span selection':clamped<8?`Signal event ${clamped+1} · ${lab.data[clamped]} ms sample`:['Root request span · 124 ms total','Catalog child span · 97 ms','Pricing child span · 53 ms · timeout interval','Database child span · 32 ms'][clamped-8]||'Trace span selected';
          const spanContext=traceMatch?([
            {service:'API gateway',span:'sp-01',parent:'—'},
            {service:'Catalog service',span:'sp-02',parent:'sp-01'},
            {service:'Pricing service',span:'sp-03',parent:'sp-02'},
            {service:'PostgreSQL',span:'sp-04',parent:'sp-03'}
          ][clamped-8]||{service:clamped<0?'Awaiting selection':'Trace context propagated',span:'—',parent:'—'}):{service:'No matching span',span:'—',parent:'—'};
          const serviceReadout=card.querySelector('[data-ea-active-service]');if(serviceReadout)serviceReadout.textContent=spanContext.service;
          const spanReadout=card.querySelector('[data-ea-active-span]');if(spanReadout)spanReadout.textContent=spanContext.span;
          const parentReadout=card.querySelector('[data-ea-parent-span]');if(parentReadout)parentReadout.textContent=spanContext.parent;
        }
      }
    }
    const status=card.querySelector('[data-ea-status]');
    status.textContent=clamped===total-1?'Model complete.':clamped<0?'Ready · use Step or Play.':`Step ${clamped+1} of ${total}`;
  };

  const initCard = lab => {
    const card=document.querySelector(`[data-ea-lab="${lab.id}"]`);if(!card)return;
    let timer=null;const total=stageCount(lab);
    const stop=()=>{if(timer!==null)window.clearInterval(timer);timer=null;card.querySelector('[data-ea-action="play"]').disabled=false;card.querySelector('[data-ea-action="pause"]').disabled=true;};
    const step=()=>{
      let current=Number(card.dataset.index??'-1');
      if(current>=total-1){stop();return;}
      const next=current+1;
      if(lab.custom==='supply'){
        const gateIndex={sbom:2,provenance:3,sign:4}[card.dataset.supplyFailure||'none'];
        if(gateIndex!==undefined && next>gateIndex){stop();card.querySelector('[data-ea-status]').textContent='BLOCKED · DOWNSTREAM GATES NOT EXECUTED';return;}
        if(gateIndex!==undefined && next===gateIndex){setStepState(card,lab,next);card.classList.add('is-blocked');card.querySelector('[data-ea-detail]').textContent=`${lab.steps[next][0]} verification failed. Stop here; downstream stages are blocked.`;card.querySelector('[data-ea-status]').textContent=`BLOCKED AT ${lab.steps[next][0].toUpperCase()}`;stop();return;}
      }
      setStepState(card,lab,next);
      if(Number(card.dataset.index)>=total-1)stop();
    };
    const play=()=>{if(timer!==null)return; if(reduced()){step();return;} card.querySelector('[data-ea-action="play"]').disabled=true;card.querySelector('[data-ea-action="pause"]').disabled=false;step();timer=window.setInterval(step,800);};
    card.querySelector('[data-ea-action="play"]').addEventListener('click',play);
    card.querySelector('[data-ea-action="pause"]').addEventListener('click',()=>{stop();card.querySelector('[data-ea-status]').textContent='Paused · current state retained.';});
    card.querySelector('[data-ea-action="step"]').addEventListener('click',()=>{stop();step();});
    card.querySelector('[data-ea-action="reset"]').addEventListener('click',()=>{stop();card.classList.remove('is-blocked');setStepState(card,lab,-1);});
    card.querySelector('[data-ea-action="converge"]')?.addEventListener('click',()=>{card.dataset.convergedRuns=String(Math.min(2,Number(card.dataset.convergedRuns||0)+1));customResult(lab,card);});
    card.querySelector('[data-ea-action="pod-failure"]')?.addEventListener('click',()=>{card.dataset.podFailed='true';card.querySelector('[data-ea-detail]').textContent='ImagePullBackOff is a waiting reason, not a Pod phase. The Pod phase commonly remains Pending while the container cannot start.';customResult(lab,card);});
    card.querySelector('[data-ea-action="pod-retry"]')?.addEventListener('click',()=>{card.dataset.podFailed='false';customResult(lab,card);});
    card.querySelector('[data-ea-action="route-request"]')?.addEventListener('click',()=>{const ready=['a','b','c'].filter(k=>card.querySelector(`[data-ea-input="endpoint-${k}"]`).checked);const count=Number(card.dataset.requests||0);card.dataset.requests=String(count+1);const selected=ready.length?ready[count%ready.length].toUpperCase():'none';card.querySelector('[data-ea-result]').textContent=selected==='none'?'No eligible ready endpoint: request cannot be routed to a Pod.':`Request ${count+1} → Pod ${selected}. This local example rotates among ready endpoints.`;card.querySelector('[data-ea-selected]').textContent=selected==='none'?'No eligible Pod':`Pod ${selected} · selected`;card.dataset.selectedEndpoint=selected==='none'?'':selected;card.querySelectorAll('[data-endpoint-pod]').forEach(pod=>pod.classList.toggle('is-selected',pod.dataset.endpointPod===selected));});
    card.querySelector('[data-ea-action="gitops-drift"]')?.addEventListener('click',()=>{card.dataset.gitopsDrift='true';customResult(lab,card);});
    card.querySelector('[data-ea-action="gitops-sync"]')?.addEventListener('click',()=>{card.dataset.gitopsDrift='false';customResult(lab,card);});
    card.querySelectorAll('[data-ea-input]').forEach(input=>{
      if (!input.getAttribute('aria-label') && (!input.labels || input.labels.length === 0)) {
        const wrapper = input.closest('label');
        const labelText = wrapper ? [...wrapper.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join(' ').trim() : '';
        input.setAttribute('aria-label', labelText || `${lab.title} ${input.dataset.eaInput}`);
      }
      input.addEventListener('input',()=>customResult(lab,card));
      input.addEventListener('change',()=>customResult(lab,card));
    });
    setStepState(card,lab,-1);if(lab.custom)customResult(lab,card);
    card._eaStop = stop;
    labVisibilityObserver?.observe(card);
  };

  /** Create one lab article from its registry record; all controls are scoped by data attributes. */
  const makeCard = (lab) => `<article class="ea-card${lab.id==='telemetry-correlation'?' ea-card-wide ea-card-observability':''}" data-ea-lab="${lab.id}"><div class="ea-card-head"><span>${lab.n} / ${esc(lab.tag)}</span><span class="ea-local-badge">LOCAL MODEL</span></div><h3>${esc(lab.title)}</h3><p class="ea-description">${esc(lab.desc)}</p><div class="ea-visual" data-visual-model="${lab.id}">${createStageVisual(lab)}</div>${lab.custom?`<div class="ea-custom">${customMarkup[lab.custom]}</div>`:''}<div class="ea-controls"><button type="button" data-ea-action="play">Play</button><button type="button" data-ea-action="pause" disabled>Pause</button><button type="button" data-ea-action="step">Step →</button><button type="button" data-ea-action="reset">Reset</button></div><p class="ea-status" data-ea-status aria-live="polite">Ready · use Step or Play.</p><p class="ea-source-note">${esc(lab.source)}</p></article>`;

  /** Mount every configured lab and delegate Play/Pause/Step/Reset actions to its own card. */
  const initGallery = () => {
    const cards=[...document.querySelectorAll('#architectureGalleryGrid .architecture-card')];
    cards.forEach((card,index)=>{
      if(card.querySelector('[data-gallery-play]'))return;
      const title=card.querySelector('h3')?.textContent?.trim()||`Architecture ${index+1}`;
      const controls=document.createElement('div');controls.className='ea-gallery-controls';
      const button=document.createElement('button');button.type='button';button.className='ea-gallery-play';button.dataset.galleryPlay='';button.textContent='Draw flow';button.setAttribute('aria-label',`Animate ${title} architecture flow`);
      const status=document.createElement('span');status.className='ea-gallery-status';status.setAttribute('aria-live','polite');status.textContent='Conceptual diagram';
      controls.append(button,status);card.append(controls);
      button.addEventListener('click',()=>{
        if (reduced()) {
          card.classList.remove('is-flow-drawing');
          button.textContent='Replay flow';
          status.textContent='Flow shown · reduced motion';
          return;
        }
        card.classList.remove('is-flow-drawing');void card.offsetWidth;card.classList.add('is-flow-drawing');button.disabled=true;button.textContent='Drawing…';status.textContent='Drawing architecture paths';
        window.setTimeout(()=>{card.classList.remove('is-flow-drawing');button.disabled=false;button.textContent='Replay flow';status.textContent='Flow complete · conceptual';},1700);
      });
    });
  };

  /** Initialize the advanced lab gallery after the page DOM is available. */
  const init = () => {
    Object.entries(sectionMap).forEach(([sectionId,ids])=>{
      const section=document.getElementById(sectionId);if(!section)return;
      const selected=ids.map(id=>labs.find(lab=>lab.id===id)).filter(Boolean);if(!selected.length)return;
      const existing=section.querySelector(':scope > .ea-lab-section');if(existing)return;
      // The template uses the fixed lab registry; esc() protects all registry text inserted into HTML.
      const wrapper=document.createElement('div');wrapper.className='ea-lab-section';wrapper.innerHTML=`<div class="ea-section-heading"><div><span class="mono">INTERACTIVE ENGINEERING MOTION LABS / ${esc(sectionId.toUpperCase())}</span><h3>Explore the system <span>in motion.</span></h3><p>Step through each model, inspect the decision points and replay the flow. These are illustrative browser-local learning experiences, not live infrastructure.</p></div><span class="ea-count">${selected.length} VISUAL MODELS</span></div><div class="ea-grid">${selected.map(makeCard).join('')}</div>`;
      section.append(wrapper);selected.forEach(initCard);
    });
    initGallery();
    document.addEventListener('motionpreferencechange', event => { if (event.detail.reduced) document.querySelectorAll('[data-ea-lab]').forEach(card => card._eaStop?.()); });
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
