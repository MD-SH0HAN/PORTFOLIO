/*
 * Monochrome engineering animation system.
 * All demonstrations are deterministic, browser-local and explicitly illustrative.
 * No shell commands, cloud APIs, deployment targets or telemetry backends are invoked.
 */
(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReducedMotion = () => reducedMotionQuery.matches || root.dataset.reduceMotion === 'true';
  const byId = id => document.getElementById(id);
  const broadcastMotionPreference = () => document.dispatchEvent(new CustomEvent('motionpreferencechange', { detail: { reduced: isReducedMotion() } }));
  if ('MutationObserver' in window) {
    const preferenceObserver = new MutationObserver(broadcastMotionPreference);
    preferenceObserver.observe(root, { attributes: true, attributeFilter: ['data-reduce-motion'] });
  }
  reducedMotionQuery.addEventListener?.('change', broadcastMotionPreference);
  const wait = ms => new Promise(resolve => window.setTimeout(resolve, isReducedMotion() ? 0 : ms));
  const safeText = (element, value) => { if (element) element.textContent = String(value); };

  /** Create the shared semantic shell used by the original motion panels. */
  const panelShell = (kicker, title, description, note, content, extraClass = '') => `
    <section class="motion-panel ${extraClass}" aria-label="${title}">
      <div class="motion-panel-inner">
        <header class="motion-panel-head">
          <div><span class="motion-kicker">${kicker}</span><h3>${title}</h3><p>${description}</p></div>
          ${note ? `<span class="motion-panel-note">${note}</span>` : ''}
        </header>
        ${content}
      </div>
    </section>`;

  /** Mount generated markup only into the explicitly named placeholder. */
  // `markup` is assembled by this file from authored model data; never pass user-entered HTML here.
  const mount = (key, markup) => {
    const target = document.querySelector(`[data-anim-mount="${key}"]`);
    if (!target) return null;
    target.innerHTML = markup;
    return target.firstElementChild;
  };

  /** Update visible and machine-readable status for an interactive model. */
  const setStatus = (element, text, state = 'waiting') => {
    if (!element) return;
    element.textContent = text;
    element.dataset.state = state;
  };

  // A single visibility observer drives one-shot SVG entrances and pauses long simulations off-screen.
  const visibleCallbacks = new WeakMap();
  let visibilityObserver = null;
  if ('IntersectionObserver' in window) {
    visibilityObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const callback = visibleCallbacks.get(entry.target);
        if (entry.isIntersecting && callback) {
          callback();
          visibleCallbacks.delete(entry.target);
          visibilityObserver.unobserve(entry.target);
        }
        entry.target.dispatchEvent(new CustomEvent('motionvisibilitychange', { detail: { visible: entry.isIntersecting } }));
      });
    }, { rootMargin: '100px 0px', threshold: 0.08 });
  }
  /** Start an entrance animation only when visible; reduced motion runs it immediately. */
  const onceVisible = (element, callback) => {
    if (!element) return;
    if (isReducedMotion() || !visibilityObserver) { callback(); return; }
    visibleCallbacks.set(element, callback);
    visibilityObserver.observe(element);
  };
  const trackVisibility = element => { if (element && visibilityObserver) visibilityObserver.observe(element); };

  // Shared SVG drawing utility used by the architecture gallery and four domain-specific references.
  /** Reveal connector paths while retaining a static complete diagram for reduced motion. */
  const drawSvg = svg => {
    if (!svg) return;
    const paths = [...svg.querySelectorAll('.motion-edge')];
    if (isReducedMotion()) {
      svg.classList.add('is-drawn');
      paths.forEach(path => { path.style.setProperty('--path-length', '0'); path.style.strokeDashoffset = '0'; });
      return;
    }
    svg.classList.remove('is-drawn');
    paths.forEach(path => {
      try {
        const length = path.getTotalLength();
        path.style.setProperty('--path-length', String(length));
        path.style.removeProperty('stroke-dasharray');
        path.style.removeProperty('stroke-dashoffset');
      } catch (_) {
        path.style.setProperty('--path-length', '1');
        path.style.removeProperty('stroke-dasharray');
        path.style.removeProperty('stroke-dashoffset');
      }
    });
    svg.querySelectorAll('.motion-node').forEach(node => { node.style.transitionDelay = `${Math.min(500, Number(node.dataset.nodeOrder || 0) * 100)}ms`; });
    void svg.getBoundingClientRect().width;
    window.requestAnimationFrame(() => svg.classList.add('is-drawn'));
  };

  const architectureSvg = `
    <svg class="motion-architecture-svg" viewBox="0 0 840 360" role="img" aria-label="Conceptual request and data path: clients resolve DNS, reach an edge load balancer, then private application replicas in two availability zones. Application replicas access a primary data service, which replicates to a standby.">
      <defs><marker id="motionArrowArchitecture" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="none" stroke="currentColor" stroke-width="1"/></marker></defs>
      <rect class="motion-zone" x="600" y="24" width="210" height="135"/><text class="motion-zone-label" x="614" y="41">ZONE A / APPLICATION</text>
      <rect class="motion-zone" x="600" y="177" width="210" height="135"/><text class="motion-zone-label" x="614" y="194">ZONE B / APPLICATION</text>
      <path class="motion-edge" marker-end="url(#motionArrowArchitecture)" d="M155 105 H225"/>
      <path class="motion-edge" marker-end="url(#motionArrowArchitecture)" d="M355 105 H425"/>
      <path class="motion-edge" marker-end="url(#motionArrowArchitecture)" d="M570 105 C590 105 590 88 620 88"/>
      <path class="motion-edge" marker-end="url(#motionArrowArchitecture)" d="M570 105 C590 105 590 242 620 242"/>
      <path class="motion-edge" marker-end="url(#motionArrowArchitecture)" d="M705 129 C705 176 535 181 535 228"/>
      <path class="motion-edge" marker-end="url(#motionArrowArchitecture)" d="M620 256 H570" stroke-dasharray="5 4"/>
      <g class="motion-node" data-node-order="0"><rect x="25" y="78" width="130" height="54"/><text x="90" y="100">Clients</text><text class="node-sub" x="90" y="116">Request origin</text></g>
      <g class="motion-node" data-node-order="1"><rect x="225" y="78" width="130" height="54"/><text x="290" y="100">DNS + TLS</text><text class="node-sub" x="290" y="116">Name + trust</text></g>
      <g class="motion-node" data-node-order="2"><rect x="425" y="78" width="145" height="54"/><text x="497" y="100">Edge / LB</text><text class="node-sub" x="497" y="116">Health-aware routing</text></g>
      <g class="motion-node" data-node-order="3"><rect x="620" y="61" width="170" height="68"/><text x="705" y="87">App replica A</text><text class="node-sub" x="705" y="105">Private subnet</text></g>
      <g class="motion-node" data-node-order="4"><rect x="620" y="215" width="170" height="68"/><text x="705" y="241">App replica B</text><text class="node-sub" x="705" y="259">Private subnet</text></g>
      <g class="motion-node" data-node-order="5"><rect x="365" y="228" width="205" height="58"/><text x="467" y="251">Managed data</text><text class="node-sub" x="467" y="268">Primary · private</text></g>
      <g class="motion-node" data-node-order="6"><rect x="25" y="240" width="180" height="58"/><text x="115" y="263">Standby / replica</text><text class="node-sub" x="115" y="280">Replication path</text></g>
      <path class="motion-edge" marker-end="url(#motionArrowArchitecture)" d="M365 257 H205" stroke-dasharray="5 4"/>
    </svg>`;

  const architectureFlowMarkup = `
    <div class="arch-path-visual" data-architecture-path>
      <div class="arch-path-scroll" role="region" tabindex="0" aria-label="Scrollable architecture path diagram">
        <svg class="arch-path-svg" viewBox="0 0 1460 850" role="img" aria-labelledby="archPathTitle archPathDescription">
          <title id="archPathTitle">Cloud request, application, data and recovery architecture</title>
          <desc id="archPathDescription">DNS is a separate name-resolution exchange between the client and DNS resolver. After resolution, the client sends an HTTPS request to the public edge. The edge load balancer selects one healthy private application replica in availability zone A or B. Application replicas exchange database queries and results with a managed primary data service. The primary sends a separate, dashed replication stream to a recovery target in another failure domain.</desc>
          <defs>
            <marker id="archPathArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" class="arch-arrow-head"/></marker>
            <marker id="archPathArrowStart" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M10 0 L0 5 L10 10 Z" class="arch-arrow-head"/></marker>
            <marker id="archPathArrowReplica" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" class="arch-arrow-head arch-arrow-head--replica"/></marker>
          </defs>
          <rect class="arch-canvas-solid" x="0" y="0" width="1460" height="850" rx="18"/>

          <text class="arch-lane-label" x="60" y="55">01 / NAME RESOLUTION</text>
          <text class="arch-lane-label" x="420" y="350">02 / PUBLIC REQUEST INGRESS</text>
          <text class="arch-lane-label" x="780" y="105">03 / PRIVATE APPLICATION NETWORK</text>
          <text class="arch-lane-label" x="1150" y="325">04 / PRIVATE DATA TIER</text>
          <text class="arch-lane-label" x="1150" y="600">05 / RECOVERY DOMAIN</text>

          <rect class="arch-zone arch-zone--apps" x="760" y="125" width="370" height="455" rx="20"/>
          <rect class="arch-az" x="780" y="165" width="330" height="155" rx="15"/>
          <rect class="arch-az" x="780" y="355" width="330" height="155" rx="15"/>
          <text class="arch-zone-caption" x="800" y="190">AVAILABILITY ZONE A</text>
          <text class="arch-zone-caption" x="800" y="380">AVAILABILITY ZONE B</text>

          <rect class="arch-zone arch-zone--data" x="1140" y="345" width="280" height="205" rx="18"/>
          <rect class="arch-zone arch-zone--replica" x="1140" y="625" width="280" height="190" rx="18"/>
          <text class="arch-zone-caption" x="1160" y="372">PRIVATE DATA SUBNET</text>
          <text class="arch-zone-caption" x="1160" y="652">SEPARATE FAILURE DOMAIN</text>

          <g class="arch-path-stage" data-path-stage="1">
            <!-- DNS is a name-resolution exchange, not an HTTP proxy hop. -->
            <path class="arch-path-edge arch-path-edge--dns" data-flow="dns-query" pathLength="1" d="M145 420 V190" marker-end="url(#archPathArrow)"/>
            <path class="arch-path-edge arch-path-edge--dns" data-flow="dns-answer" pathLength="1" d="M195 190 V420" marker-end="url(#archPathArrow)"/>
            <path class="arch-path-edge" data-flow="https-request" pathLength="1" d="M280 470 H420" marker-end="url(#archPathArrow)"/>
            <circle class="arch-flow-packet" cx="0" cy="0" r="5" aria-hidden="true"><animateMotion class="arch-packet-motion" path="M145 420 V190" dur="0.72s" begin="indefinite" fill="freeze"/></circle>
            <circle class="arch-flow-packet" cx="0" cy="0" r="5" aria-hidden="true"><animateMotion class="arch-packet-motion" path="M195 190 V420" dur="0.72s" begin="indefinite" fill="freeze"/></circle>
            <circle class="arch-flow-packet" cx="0" cy="0" r="5" aria-hidden="true"><animateMotion class="arch-packet-motion" path="M280 470 H420" dur="0.72s" begin="indefinite" fill="freeze"/></circle>

            <g class="arch-node arch-node--dns" transform="translate(60 90)">
              <rect width="220" height="100" rx="15"/>
              <circle class="arch-node-icon-bg" cx="28" cy="28" r="15"/><circle class="arch-icon-stroke" cx="28" cy="28" r="9"/><path class="arch-icon-stroke" d="M19 28h18M28 19c4 5 4 13 0 18M28 19c-4 5-4 13 0 18"/>
              <text class="arch-node-kicker" x="53" y="27">NAME RESOLUTION</text><text class="arch-node-title" x="18" y="64">DNS resolver</text><text class="arch-node-detail" x="18" y="82">Returns the public edge address</text>
            </g>
            <g class="arch-node arch-node--client" transform="translate(60 420)">
              <rect width="220" height="100" rx="15"/>
              <circle class="arch-node-icon-bg" cx="28" cy="28" r="15"/><path class="arch-icon-stroke" d="M20 34c1-7 15-7 16 0M28 20a5 5 0 1 0 0 10"/>
              <text class="arch-node-kicker" x="53" y="27">REQUEST ORIGIN</text><text class="arch-node-title" x="18" y="64">Client</text><text class="arch-node-detail" x="18" y="82">Browser / API consumer</text>
            </g>
            <text class="arch-flow-label" x="210" y="290">DNS QUERY ↑</text>
            <text class="arch-flow-label" x="210" y="307">EDGE ADDRESS ↓</text>
            <text class="arch-flow-label" x="300" y="450">HTTPS · TLS</text>

            <g class="arch-node arch-node--edge" transform="translate(420 420)">
              <rect width="240" height="100" rx="15"/>
              <circle class="arch-node-icon-bg" cx="29" cy="28" r="15"/><path class="arch-icon-stroke" d="M21 21h16v14H21zM25 17v4M33 17v4M25 35v4M33 35v4M17 25h4M37 25h4M17 31h4M37 31h4"/>
              <text class="arch-node-kicker" x="56" y="27">PUBLIC EDGE</text><text class="arch-node-title" x="18" y="64">Edge / load balancer</text><text class="arch-node-detail" x="18" y="82">TLS listener · health-aware routing</text>
            </g>
          </g>

          <g class="arch-path-stage" data-path-stage="2">
            <path class="arch-path-edge" data-flow="edge-to-app-a" pathLength="1" d="M660 442 H720 V250 H800" marker-end="url(#archPathArrow)"/>
            <path class="arch-path-edge" data-flow="edge-to-app-b" pathLength="1" d="M660 492 H745 V440 H800" marker-end="url(#archPathArrow)"/>
            <circle class="arch-flow-packet" cx="0" cy="0" r="5" aria-hidden="true"><animateMotion class="arch-packet-motion" path="M660 442 H720 V250 H800" dur="1.02s" begin="indefinite" fill="freeze"/></circle>
            <circle class="arch-flow-packet" cx="0" cy="0" r="5" aria-hidden="true"><animateMotion class="arch-packet-motion" path="M660 492 H745 V440 H800" dur="1.02s" begin="indefinite" fill="freeze"/></circle>
            <text class="arch-flow-label" x="800" y="147">LB SELECTS ONE HEALTHY TARGET PER REQUEST</text>

            <g class="arch-node arch-node--compute" transform="translate(800 215)">
              <rect width="280" height="72" rx="13"/>
              <rect class="arch-node-icon-bg arch-node-icon-square" x="14" y="18" width="36" height="36" rx="9"/><path class="arch-icon-stroke" d="M22 27h20v18H22zM26 23v4M38 23v4M26 45v4M38 45v4"/>
              <text class="arch-node-kicker" x="62" y="29">04A · PRIVATE SUBNET</text><text class="arch-node-title" x="62" y="50">Application replica A</text>
              <circle class="arch-node-status" cx="258" cy="36" r="4"/>
            </g>
            <g class="arch-node arch-node--compute" transform="translate(800 405)">
              <rect width="280" height="72" rx="13"/>
              <rect class="arch-node-icon-bg arch-node-icon-square" x="14" y="18" width="36" height="36" rx="9"/><path class="arch-icon-stroke" d="M22 27h20v18H22zM26 23v4M38 23v4M26 45v4M38 45v4"/>
              <text class="arch-node-kicker" x="62" y="29">04B · PRIVATE SUBNET</text><text class="arch-node-title" x="62" y="50">Application replica B</text>
              <circle class="arch-node-status" cx="258" cy="36" r="4"/>
            </g>
          </g>

          <g class="arch-path-stage" data-path-stage="3">
            <!-- Bidirectional arrows represent query/request and result/response traffic. -->
            <path class="arch-path-edge arch-path-edge--data" data-flow="app-a-db-query-response" pathLength="1" d="M1080 250 H1120 V430 H1165" marker-start="url(#archPathArrowStart)" marker-end="url(#archPathArrow)"/>
            <path class="arch-path-edge arch-path-edge--data" data-flow="app-b-db-query-response" pathLength="1" d="M1080 440 H1165" marker-start="url(#archPathArrowStart)" marker-end="url(#archPathArrow)"/>
            <circle class="arch-flow-packet" cx="0" cy="0" r="5" aria-hidden="true"><animateMotion class="arch-packet-motion" path="M1080 250 H1120 V430 H1165" dur="1.15s" begin="indefinite" fill="freeze"/></circle>
            <circle class="arch-flow-packet" cx="0" cy="0" r="5" aria-hidden="true"><animateMotion class="arch-packet-motion" path="M1080 440 H1165" dur="0.82s" begin="indefinite" fill="freeze"/></circle>
            <g class="arch-node arch-node--data" transform="translate(1165 395)">
              <rect width="230" height="110" rx="15"/>
              <circle class="arch-node-icon-bg" cx="29" cy="29" r="16"/><ellipse class="arch-icon-stroke" cx="29" cy="24" rx="9" ry="4"/><path class="arch-icon-stroke" d="M20 24v13c0 5 18 5 18 0V24M20 30c0 5 18 5 18 0"/>
              <text class="arch-node-kicker" x="56" y="27">05 · PRIMARY DATA</text><text class="arch-node-title" x="18" y="65">Managed data service</text><text class="arch-node-detail" x="18" y="85">Persistent application state</text>
              <circle class="arch-node-status" cx="208" cy="28" r="4"/>
            </g>
          </g>

          <g class="arch-path-stage" data-path-stage="4">
            <path class="arch-path-edge arch-path-edge--replication" data-flow="primary-to-replica-target" pathLength="1" d="M1280 505 V675" marker-end="url(#archPathArrowReplica)"/>
            <circle class="arch-flow-packet" cx="0" cy="0" r="5" aria-hidden="true"><animateMotion class="arch-packet-motion" path="M1280 505 V675" dur="0.92s" begin="indefinite" fill="freeze"/></circle>
            <g class="arch-node arch-node--replica" transform="translate(1165 680)">
              <rect width="230" height="105" rx="15"/>
              <circle class="arch-node-icon-bg" cx="29" cy="29" r="16"/><path class="arch-icon-stroke" d="M22 26a8 8 0 0 1 13-3l2 2M37 25v-5M37 25h-5M36 34a8 8 0 0 1-13 3l-2-2M21 35v5M21 35h5"/>
              <text class="arch-node-kicker" x="56" y="27">06 · RECOVERY COPY</text><text class="arch-node-title" x="18" y="65">Replica target</text><text class="arch-node-detail" x="18" y="85">Standby / recovery copy</text>
              <circle class="arch-node-status" cx="208" cy="28" r="4"/>
            </g>
          </g>

          <text class="arch-path-caption" x="420" y="555">REQUEST ROUTING: CLIENT → EDGE → ONE HEALTHY APP REPLICA</text>
          <text class="arch-path-caption" x="1160" y="835">SEPARATE REPLICATION / RECOVERY PATH</text>
        </svg>
      </div>
      <p class="arch-path-scroll-hint">Swipe horizontally to inspect the complete architecture path.</p>
      <div class="arch-path-legend" aria-label="Diagram line legend">
        <span><i class="arch-legend-line arch-legend-line--dns"></i> DNS query / answer exchange</span>
        <span><i class="arch-legend-line"></i> HTTPS request and load-balancer routing</span>
        <span><i class="arch-legend-line arch-legend-line--data"></i> Application queries ↔ database results</span>
        <span><i class="arch-legend-line arch-legend-line--replication"></i> Primary → recovery replication</span>
      </div>
      <ol class="arch-path-stages" aria-label="Architecture path stages">
        <li data-stage-label="1"><span>01</span><b>Resolve &amp; ingress</b><small>Client ↔ DNS · Client → HTTPS edge</small></li>
        <li data-stage-label="2"><span>02</span><b>Route to compute</b><small>Edge → one healthy private replica</small></li>
        <li data-stage-label="3"><span>03</span><b>Access data</b><small>App replicas ↔ managed primary</small></li>
        <li data-stage-label="4"><span>04</span><b>Replicate</b><small>Primary → separate recovery target</small></li>
      </ol>
      <p class="arch-path-technical-note">DNS resolves the edge hostname; it does not proxy the HTTPS request. The load balancer selects one healthy replica from the private target pool per request—the two branches represent eligible targets, not simultaneous fan-out. Application-to-database traffic carries queries and results in both directions. Replication mode, target placement and failover behaviour depend on the selected managed service and its configuration.</p>
    </div>`;

  const drawPanelMarkup = (title, description, svgMarkup, isMini = false) => panelShell(
    '07 / ARCHITECTURE PATH DRAWING', title, description,
    'Conceptual topology · not a live account',
    `<div class="motion-diagram-shell">${svgMarkup}</div><div class="motion-controls"><button class="motion-button motion-button-primary" type="button" data-arch-redraw>Draw connections</button><span class="motion-status" data-arch-status data-state="waiting" aria-live="polite">Ready to draw</span></div><p class="motion-microcopy">Nodes represent the components; directional lines show only the request and replication relationships defined in this reference. The same drawing utility powers the Cloud, IaC, Containers, Platform, and gallery diagrams.</p>`,
    isMini ? 'motion-mini' : ''
  );

  const architecturePanel = mount('architecture', panelShell(
    '07 / ARCHITECTURE PATH DRAWING',
    'Architecture paths, drawn in sequence',
    'DNS resolves the edge hostname; the client then sends HTTPS to the public edge, which selects one healthy private application replica. The application exchanges data with the managed primary, while replication to a separate recovery target remains an independent final path.',
    'Conceptual topology · not a live account',
    `${architectureFlowMarkup}<div class="motion-controls"><button class="motion-button motion-button-primary" type="button" data-arch-redraw>Replay sequence</button><span class="motion-status" data-arch-status data-state="waiting" aria-live="polite">Ready to play</span></div><p class="motion-microcopy">Conceptual model only. Exact DNS behaviour, TLS termination, load-balancer target selection, database access, replication mode and recovery semantics depend on the selected provider, managed services and workload requirements.</p>`
  ));

  /** Build a compact architecture reference from an ordered list of labeled nodes. */
  const miniArchitecture = (title, nodes, desc) => {
    const width = 720;
    const boxWidth = 130;
    const gap = (width - nodes.length * boxWidth) / (nodes.length + 1);
    let nodeMarkup = '';
    let edgeMarkup = '';
    nodes.forEach((node, index) => {
      const x = gap + index * (boxWidth + gap);
      const cx = x + boxWidth / 2;
      if (index) edgeMarkup += `<path class="motion-edge" d="M${x - gap} 64 H${x}"/>`;
      nodeMarkup += `<g class="motion-node" data-node-order="${index}"><rect x="${x}" y="36" width="${boxWidth}" height="56"/><text x="${cx}" y="59">${node[0]}</text><text class="node-sub" x="${cx}" y="76">${node[1]}</text></g>`;
    });
    const markerId = `motionArrow${title.replace(/[^a-z0-9]/gi, '')}`;
    edgeMarkup = edgeMarkup.replaceAll('class="motion-edge"', `class="motion-edge" marker-end="url(#${markerId})"`);
    const svg = `<svg class="motion-architecture-svg" viewBox="0 0 ${width} 128" role="img" aria-label="${title}: ${nodes.map(node => node[0]).join(' to ')}"><defs><marker id="${markerId}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="none" stroke="currentColor" stroke-width="1"/></marker></defs>${edgeMarkup}${nodeMarkup}</svg>`;
    return drawPanelMarkup(title, desc, svg, true);
  };
  mount('arch-cloud', miniArchitecture('Cloud request routing', [['Client','Request'],['DNS / TLS','Resolution'],['Load balancer','Health checks'],['Private app','Compute'],['Data tier','Persistent state']], 'A compact, provider-neutral path from client ingress to private application and data tiers.'));
  mount('arch-iac', miniArchitecture('Terraform change path', [['Git','Versioned config'],['Init / plan','Proposed state'],['Review','Human control'],['Apply','Authorized API'],['State','Tracked objects']], 'A plan is a proposal. A real apply is authorized, changes provider resources, and records state; this illustration does not call a provider.'));
  mount('arch-containers', miniArchitecture('Container image lifecycle', [['Dockerfile','Build input'],['BuildKit','Image layers'],['OCI registry','Digest stored'],['Runtime','Container process']], 'The registry stores an immutable image reference; the runtime creates a container process from that image.'));
  mount('arch-platform', miniArchitecture('GitOps reconciliation path', [['Git repo','Desired state'],['Controller','Observe diff'],['Kubernetes','Reconcile'],['Health','Report status']], 'A controller observes declared configuration and reconciles managed resources toward the committed desired state.'));

  const architectureTimers = new WeakMap();
  const replayArchitecture = panel => {
    if (!panel) return;
    const pathDiagram = panel.querySelector('[data-architecture-path]');
    const svg = panel.querySelector('.motion-architecture-svg');
    const status = panel.querySelector('[data-arch-status]');
    const previousTimers = architectureTimers.get(panel) || [];
    previousTimers.forEach(timer => window.clearTimeout(timer));
    architectureTimers.set(panel, []);

    if (pathDiagram) {
      const stageLabels = [
        'Stage 1 of 4 · DNS resolution and HTTPS ingress',
        'Stage 2 of 4 · Edge selects one healthy private replica',
        'Stage 3 of 4 · Application queries and database results',
        'Stage 4 of 4 · Primary replication to recovery target'
      ];
      pathDiagram.classList.remove('is-stage-1', 'is-stage-2', 'is-stage-3', 'is-stage-4');
      pathDiagram.querySelectorAll('.arch-flow-packet').forEach(packet => { packet.style.opacity = '0'; });
      void pathDiagram.offsetWidth;
      if (isReducedMotion()) {
        pathDiagram.classList.add('is-stage-1', 'is-stage-2', 'is-stage-3', 'is-stage-4');
        setStatus(status, 'Complete · 4 architecture stages', 'complete');
        panel.querySelectorAll('[data-stage-label]').forEach(item => item.classList.add('is-active'));
        return;
      }
      setStatus(status, 'Sequence starting…', 'running');
      panel.querySelectorAll('[data-stage-label]').forEach(item => item.classList.remove('is-active'));
      const timers = [];
      stageLabels.forEach((label, index) => {
        timers.push(window.setTimeout(() => {
          pathDiagram.classList.add(`is-stage-${index + 1}`);
          const packets = [...pathDiagram.querySelectorAll(`[data-path-stage="${index + 1}"] .arch-flow-packet`)];
          packets.forEach(packet => {
            packet.style.opacity = '1';
            packet.querySelector('.arch-packet-motion')?.beginElement?.();
            const fadeTimer = window.setTimeout(() => { packet.style.opacity = '0'; }, 1250);
            timers.push(fadeTimer);
          });
          const stageItem = panel.querySelector(`[data-stage-label="${index + 1}"]`);
          if (stageItem) stageItem.classList.add('is-active');
          setStatus(status, label, 'running');
          if (index === stageLabels.length - 1) {
            const finishTimer = window.setTimeout(() => setStatus(status, 'Complete · request and replication paths drawn', 'complete'), 700);
            timers.push(finishTimer);
            architectureTimers.set(panel, timers);
          }
        }, index * 760));
      });
      architectureTimers.set(panel, timers);
    } else {
      setStatus(status, 'Drawing connections…', 'running');
      drawSvg(svg);
      const timer = window.setTimeout(() => setStatus(status, 'All connections drawn', 'complete'), isReducedMotion() ? 0 : 1050);
      architectureTimers.set(panel, [timer]);
    }
  };
  document.querySelectorAll('[data-arch-redraw]').forEach(button => {
    button.addEventListener('click', () => replayArchitecture(button.closest('.motion-panel')));
  });
  document.querySelectorAll('[data-anim-mount="architecture"], [data-anim-mount^="arch-"]').forEach(wrapper => {
    const panel = wrapper.firstElementChild;
    onceVisible(panel, () => replayArchitecture(panel));
  });

  // 12 — Layer reveal uses the same infrastructure hierarchy, not the path-drawing animation.
  const layerData = [
    ['Client', 'Browser or service initiates a request'],
    ['DNS', 'Resolves the service name to an endpoint'],
    ['Load balancer', 'Selects a healthy ingress target'],
    ['Network', 'Routes into the intended trust boundary'],
    ['Compute', 'Private VM or container workload processes it'],
    ['Storage', 'Managed data service persists application state']
  ];
  const layerMarkup = panelShell('12 / LAYER-BY-LAYER REVEAL', 'Build the infrastructure from the edge inward', 'Reveal each infrastructure layer in order and establish its relationship to the layer before it.', 'Sequential hierarchy · interactive steps', `
    <ol class="motion-layer-list" aria-label="Ordered infrastructure request path" data-layer-list>${layerData.map((layer, index) => `<li class="motion-layer ${index === 0 ? 'is-visible' : ''}" data-layer-index="${index}"><span class="motion-layer-index">LAYER ${String(index + 1).padStart(2, '0')}</span><b>${layer[0]}</b><small>${layer[1]}</small></li>`).join('')}</ol>
    <div class="motion-chart-footer"><span class="motion-status" data-layer-status data-state="running">Layer 1 of 6 · Client</span><div class="motion-controls"><button class="motion-button motion-button-primary" type="button" data-layer-next>Reveal next layer</button><button class="motion-button" type="button" data-layer-all>Reveal all</button><button class="motion-button" type="button" data-layer-reset>Reset</button></div></div>
    <p class="motion-microcopy">This is a logical request path, not a universal deployment topology. Actual DNS, load-balancer, routing, compute, and storage arrangements depend on the cloud service and application design.</p>`);
  const layerPanel = mount('layers', layerMarkup);
  if (layerPanel) {
    let visibleLayers = 1;
    const cards = [...layerPanel.querySelectorAll('[data-layer-index]')];
    const next = layerPanel.querySelector('[data-layer-next]');
    const all = layerPanel.querySelector('[data-layer-all]');
    const reset = layerPanel.querySelector('[data-layer-reset]');
    const status = layerPanel.querySelector('[data-layer-status]');
    const render = () => {
      const shown = isReducedMotion() ? cards.length : visibleLayers;
      cards.forEach((card, index) => card.classList.toggle('is-visible', index < shown));
      safeText(status, shown === cards.length ? 'All 6 infrastructure layers revealed' : `Layer ${shown} of 6 · ${layerData[shown - 1][0]}`);
      if (status) status.dataset.state = shown === cards.length ? 'complete' : 'running';
      next.disabled = shown >= cards.length;
      all.disabled = shown >= cards.length;
    };
    next.addEventListener('click', () => { visibleLayers = Math.min(cards.length, visibleLayers + 1); render(); });
    all.addEventListener('click', () => { visibleLayers = cards.length; render(); });
    reset.addEventListener('click', () => { visibleLayers = 1; render(); });
    document.addEventListener('motionpreferencechange', render);
    render();
  }

  // 14 — Availability-zone failover state machine.
  const failoverMarkup = panelShell('14 / HIGH-AVAILABILITY FAILOVER', 'Route around a simulated zone failure', 'Watch a health-aware traffic path move from the primary application zone to a ready secondary zone.', 'Browser-local failure model', `
    <div class="motion-ha-layout" data-ha-layout>
      <article class="motion-zone-card" data-ha-zone="primary"><span class="motion-kicker">ZONE A / PRIMARY</span><h4>Application path A</h4><p>Normally receives the preferred traffic path. Becomes unavailable in the failure scenario.</p><span class="motion-status" data-ha-primary data-state="complete">HEALTHY</span></article>
      <div class="motion-traffic-path"><span class="motion-ha-traffic" data-ha-traffic>TRAFFIC → A</span><span class="motion-traffic-line motion-traffic-line--primary"></span><span class="motion-traffic-line motion-traffic-line--secondary"></span><small>HEALTH-CHECKED ROUTING</small></div>
      <article class="motion-zone-card" data-ha-zone="secondary"><span class="motion-kicker">ZONE B / SECONDARY</span><h4>Application path B</h4><p>Pre-provisioned capacity is ready to receive traffic after health checks and routing converge.</p><span class="motion-status" data-ha-secondary data-state="waiting">READY / STANDBY</span></article>
    </div>
    <div class="motion-chart-footer"><span class="motion-status" data-ha-status data-state="complete">NORMAL · PRIMARY SERVING</span><div class="motion-controls"><button class="motion-button motion-button-primary" type="button" data-ha-fail>Simulate Failure</button><button class="motion-button" type="button" data-ha-recover disabled>Recover / Restore</button><button class="motion-button" type="button" data-ha-reset>Reset</button></div></div>
    <p class="motion-microcopy">Conceptual only. Real failover requires configured health checks, independent failure domains, sufficient secondary capacity, data replication or restore semantics, session handling, and service-specific recovery behaviour. The timing and data-loss outcome are not guaranteed by redundancy alone.</p>`);
  const haPanel = mount('failover', failoverMarkup);
  if (haPanel) {
    const layout = haPanel.querySelector('[data-ha-layout]');
    const primaryZone = haPanel.querySelector('[data-ha-zone="primary"]');
    const secondaryZone = haPanel.querySelector('[data-ha-zone="secondary"]');
    const primary = haPanel.querySelector('[data-ha-primary]');
    const secondary = haPanel.querySelector('[data-ha-secondary]');
    const traffic = haPanel.querySelector('[data-ha-traffic]');
    const status = haPanel.querySelector('[data-ha-status]');
    const fail = haPanel.querySelector('[data-ha-fail]');
    const recover = haPanel.querySelector('[data-ha-recover]');
    const reset = haPanel.querySelector('[data-ha-reset]');
    let mode = 'healthy';
    let run = 0;
    const render = () => {
      layout.classList.toggle('is-failed', mode === 'failing' || mode === 'failed' || mode === 'recovering');
      primaryZone.classList.toggle('is-unavailable', mode === 'failing' || mode === 'failed');
      primaryZone.classList.toggle('is-recovering', mode === 'recovering');
      secondaryZone.classList.remove('is-unavailable', 'is-recovering');
      if (mode === 'healthy') {
        setStatus(primary, 'HEALTHY', 'complete'); setStatus(secondary, 'READY / STANDBY', 'waiting');
        safeText(traffic, 'TRAFFIC → A'); setStatus(status, 'NORMAL · PRIMARY SERVING', 'complete');
      } else if (mode === 'failing') {
        setStatus(primary, 'UNAVAILABLE', 'failed'); setStatus(secondary, 'HEALTHY · READY', 'complete');
        safeText(traffic, 'REROUTING → B'); setStatus(status, 'FAILURE DETECTED · HEALTH CHECKS', 'running');
      } else if (mode === 'failed') {
        setStatus(primary, 'UNAVAILABLE', 'failed'); setStatus(secondary, 'HEALTHY · SERVING', 'complete');
        safeText(traffic, 'TRAFFIC → B'); setStatus(status, 'FAILOVER COMPLETE · SECONDARY SERVING', 'complete');
      } else {
        setStatus(primary, 'RECOVERING · CHECKS', 'running'); setStatus(secondary, 'HEALTHY · SERVING', 'complete');
        safeText(traffic, 'TRAFFIC → B'); setStatus(status, 'RECOVERY CHECKS IN PROGRESS', 'running');
      }
      fail.disabled = mode !== 'healthy';
      recover.disabled = mode !== 'failed';
    };
    fail.addEventListener('click', async () => {
      if (mode !== 'healthy') return;
      const id = ++run; mode = 'failing'; render();
      await wait(700);
      if (id !== run) return;
      mode = 'failed'; render();
    });
    recover.addEventListener('click', async () => {
      if (mode !== 'failed') return;
      const id = ++run; mode = 'recovering'; render();
      await wait(850);
      if (id !== run) return;
      mode = 'healthy'; render();
    });
    reset.addEventListener('click', () => { run += 1; mode = 'healthy'; render(); });
    render();
  }

  // 16 — One immutable artifact is promoted, not rebuilt, in each environment.
  const artifactDigest = 'sha256:7f3a9c2e4b1d6f8a90c5e7d2b4a1f6398d0e2c5b7a4f1d6e9c3b8a5f7d2e1c40';
  const artifactMarkup = panelShell('16 / ARTIFACT PROMOTION JOURNEY', 'Build once. Promote the same identity.', 'Move one illustrative immutable artifact from Development to Staging and Production with environment validation and an explicit approval gate.', 'Example digest · not a published build', `
    <div class="motion-promotion-grid" data-promotion-grid>
      <article class="motion-env-card is-active" data-env="development"><span class="motion-kicker">ENVIRONMENT 01</span><h4>Development</h4><p>Fast feedback and functional validation.</p><code>${artifactDigest}</code><span class="motion-env-state" data-env-state>WAITING FOR BUILD</span></article>
      <article class="motion-env-card" data-env="staging"><span class="motion-kicker">ENVIRONMENT 02</span><h4>Staging</h4><p>Release-candidate verification and deployment rehearsal.</p><code>${artifactDigest}</code><span class="motion-env-state" data-env-state>WAITING FOR PROMOTION</span></article>
      <article class="motion-env-card" data-env="production"><span class="motion-kicker">ENVIRONMENT 03</span><h4>Production</h4><p>Protected release with an authorized approval decision.</p><code>${artifactDigest}</code><span class="motion-env-state" data-env-state>APPROVAL REQUIRED</span></article>
    </div>
    <div class="motion-promotion-approval"><div><span class="motion-kicker">PRODUCTION CONTROL</span><p data-promotion-message aria-live="polite">No artifact has been built in this demonstration. Build creates the example digest; later actions promote that exact identity.</p></div><span class="motion-status" data-promotion-status data-state="waiting">NOT STARTED</span></div>
    <div class="motion-controls"><button class="motion-button motion-button-primary" type="button" data-promotion-next>Build example artifact</button><button class="motion-button" type="button" data-promotion-approve disabled>Approve production</button><button class="motion-button" type="button" data-promotion-reset>Reset</button></div>
    <p class="motion-microcopy">A promotion changes the deployment target, not the artifact bytes. Digest equality is shown in all three environments. Real release policy may require automated tests, environment-specific configuration, signatures, attestations, change management, and an authorized human approval.</p>`);
  const artifactPanel = mount('artifact', artifactMarkup);
  if (artifactPanel) {
    let phase = 0;
    const next = artifactPanel.querySelector('[data-promotion-next]');
    const approve = artifactPanel.querySelector('[data-promotion-approve]');
    const reset = artifactPanel.querySelector('[data-promotion-reset]');
    const message = artifactPanel.querySelector('[data-promotion-message]');
    const status = artifactPanel.querySelector('[data-promotion-status]');
    const environments = [...artifactPanel.querySelectorAll('[data-env]')];
    const messages = [
      'Build complete: one example image digest is now available. The environment cards all retain the same identity.',
      'Development validation passed and the example artifact is deployed to the Development environment.',
      'Staging received the same digest. Staging checks passed; no rebuild occurred during promotion.',
      'Staging is verified. Production remains blocked until an authorized approval is recorded.',
      'Approval recorded in this browser-local model. Production now references the same immutable digest.'
    ];
    const render = () => {
      environments.forEach((env, index) => {
        const activeEnvironment = phase <= 2 ? 0 : phase === 3 ? 1 : 2;
        env.classList.toggle('is-active', index === activeEnvironment);
        const state = env.querySelector('[data-env-state]');
        const values = phase === 0
          ? ['WAITING FOR BUILD', 'WAITING FOR PROMOTION', 'APPROVAL REQUIRED']
          : phase === 1
            ? ['BUILT · READY TO VALIDATE', 'WAITING FOR PROMOTION', 'APPROVAL REQUIRED']
            : phase === 2
              ? ['VALIDATED · DEPLOYED', 'WAITING FOR PROMOTION', 'APPROVAL REQUIRED']
              : phase === 3
                ? ['VALIDATED · DEPLOYED', 'VALIDATED · DEPLOYED', 'APPROVAL REQUIRED']
                : phase === 4
                  ? ['VALIDATED · DEPLOYED', 'VALIDATED · DEPLOYED', 'AWAITING APPROVAL']
                  : ['VALIDATED · DEPLOYED', 'VALIDATED · DEPLOYED', 'PROMOTED · DEPLOYED'];
        safeText(state, values[index]);
      });
      safeText(message, phase === 0 ? 'No artifact has been built in this demonstration. Build creates the example digest; later actions promote that exact identity.' : messages[Math.min(phase - 1, messages.length - 1)]);
      const statusText = ['NOT STARTED', 'ARTIFACT BUILT', 'DEVELOPMENT PASSED', 'STAGING PASSED', 'APPROVAL PENDING', 'PRODUCTION COMPLETE'][phase];
      setStatus(status, statusText, phase === 0 ? 'waiting' : phase === 4 ? 'running' : 'complete');
      const labels = ['Build example artifact', 'Validate Development', 'Promote to Staging', 'Request production approval', 'Awaiting approval', 'Completed'];
      safeText(next, labels[phase]);
      next.disabled = phase === 4 || phase === 5;
      approve.disabled = phase !== 4;
      approve.hidden = phase !== 4;
    };
    next.addEventListener('click', () => { if (phase < 4) phase += 1; render(); });
    approve.addEventListener('click', () => { if (phase === 4) phase = 5; render(); });
    reset.addEventListener('click', () => { phase = 0; render(); });
    render();
  }

  // 17 — Software-supply-chain security gates are separate from the general delivery pipeline.
  const securityGates = [
    ['Source', 'Review · branch protection'], ['Test', 'Unit · integration tests'],
    ['Scan', 'SAST · SCA · secret scan'], ['IaC Policy', 'Misconfiguration controls'],
    ['Build + SBOM', 'Provenance · digest'], ['Image Scan', 'CVEs · base image'],
    ['Sign + Attest', 'Identity · provenance'], ['Deploy', 'Policy · runtime controls']
  ];
  const securityOptions = securityGates.map((gate, index) => `<option value="${index}">${String(index + 1).padStart(2, '0')} · ${gate[0]}</option>`).join('');
  const securityMarkup = panelShell('17 / SECURITY GATE ANIMATION', 'Protect the release at every trust boundary', 'Run the software-supply-chain controls in sequence. A failed gate blocks every later stage and exposes the exact stopping point.', 'Synthetic gate results · no scanner is invoked', `
    <div class="motion-gate-grid" data-security-gates>${securityGates.map((gate, index) => `<article class="motion-gate" data-security-gate="${index}"><strong>${String(index + 1).padStart(2, '0')} · ${gate[0]}</strong><small>${gate[1]}</small><span data-gate-state>WAITING</span></article>`).join('')}</div>
    <div class="motion-chart-footer"><label class="motion-field" for="securityFailureSelect">Inject illustrative failure at <select class="motion-select" id="securityFailureSelect"><option value="none">No failure · all gates pass</option>${securityOptions}</select></label><span class="motion-status" data-security-status data-state="waiting">READY</span></div>
    <div class="motion-controls"><button class="motion-button motion-button-primary" type="button" data-security-run>Run security gates</button><button class="motion-button" type="button" data-security-reset>Reset</button></div>
    <p class="motion-microcopy" data-security-message aria-live="polite">All results are simulated locally. Real security assurance depends on scanner configuration, policy quality, coverage, severity handling, signatures, attestations, and runtime controls.</p>`);
  const securityPanel = mount('security', securityMarkup);
  if (securityPanel) {
    const gateEls = [...securityPanel.querySelectorAll('[data-security-gate]')];
    const failureSelect = securityPanel.querySelector('#securityFailureSelect');
    const runButton = securityPanel.querySelector('[data-security-run]');
    const resetButton = securityPanel.querySelector('[data-security-reset]');
    const status = securityPanel.querySelector('[data-security-status]');
    const message = securityPanel.querySelector('[data-security-message]');
    let runId = 0;
    let running = false;
    const reset = () => {
      runId += 1; running = false;
      gateEls.forEach(gate => { gate.className = 'motion-gate'; safeText(gate.querySelector('[data-gate-state]'), 'WAITING'); });
      runButton.disabled = false;
      setStatus(status, 'READY', 'waiting');
      safeText(message, 'All results are simulated locally. Choose a gate failure to see where downstream release protection stops execution.');
    };
    runButton.addEventListener('click', async () => {
      if (running) return;
      reset();
      running = true;
      const id = ++runId;
      const failAt = failureSelect.value === 'none' ? -1 : Number(failureSelect.value);
      runButton.disabled = true;
      setStatus(status, 'RUNNING SECURITY CONTROLS', 'running');
      safeText(message, 'Evaluating the selected release controls in order.');
      for (let index = 0; index < gateEls.length; index += 1) {
        if (id !== runId) return;
        const gate = gateEls[index];
        gate.classList.add('is-running');
        safeText(gate.querySelector('[data-gate-state]'), 'RUNNING');
        await wait(390);
        if (id !== runId) return;
        gate.classList.remove('is-running');
        if (index === failAt) {
          gate.classList.add('is-failed');
          safeText(gate.querySelector('[data-gate-state]'), 'FAILED');
          for (let blocked = index + 1; blocked < gateEls.length; blocked += 1) {
            gateEls[blocked].classList.add('is-blocked');
            safeText(gateEls[blocked].querySelector('[data-gate-state]'), 'BLOCKED');
          }
          setStatus(status, `FAILED AT ${securityGates[index][0].toUpperCase()}`, 'failed');
          safeText(message, `${securityGates[index][0]} failed. Downstream release stages remain blocked; the artifact must not be promoted until the issue is resolved and controls are rerun.`);
          running = false; runButton.disabled = false; return;
        }
        gate.classList.add('is-complete');
        safeText(gate.querySelector('[data-gate-state]'), 'PASSED');
      }
      setStatus(status, 'ALL 8 GATES PASSED · SIMULATED', 'complete');
      safeText(message, 'Every configured gate passed in this illustrative run. This is not evidence of an actual repository scan, image scan, signature verification, or deployment.');
      running = false; runButton.disabled = false;
    });
    resetButton.addEventListener('click', reset);
    reset();
  }

  // Shared terminal rendering primitives for #09 and #20.
  /** Render terminal output with textContent so command output is never parsed as HTML. */
  const renderTerminalFrame = (body, command, outputLines, cursor = false) => {
    if (!body) return;
    body.replaceChildren();
    const prompt = document.createElement('span');
    prompt.className = 'motion-terminal-prompt';
    prompt.textContent = '$ ';
    const commandNode = document.createElement('span');
    commandNode.className = 'motion-terminal-command';
    commandNode.textContent = command;
    const commandLine = document.createElement('div');
    commandLine.className = 'motion-terminal-line is-command';
    commandLine.append(prompt, commandNode);
    body.appendChild(commandLine);
    outputLines.forEach(line => {
      const node = document.createElement('div');
      node.className = 'motion-terminal-line is-output';
      node.textContent = line;
      body.appendChild(node);
    });
    if (cursor) {
      const cursorNode = document.createElement('span');
      cursorNode.className = 'motion-terminal-cursor';
      cursorNode.setAttribute('aria-hidden', 'true');
      body.appendChild(cursorNode);
    }
    body.scrollTop = body.scrollHeight;
  };
  const terminalMarkup = panelShell('09 / TERMINAL COMMAND ANIMATION', 'A command, then its output', 'A progressive terminal presentation makes the command and returned lines readable in sequence. It is a visual example and never runs on the visitor’s machine.', 'Static output remains available', `
    <div class="motion-terminal" data-terminal-demo>
      <div class="motion-terminal-head"><span>LINUX / KUBERNETES TERMINAL</span><span data-terminal-state>STATIC EXAMPLE</span></div>
      <div class="motion-terminal-body" data-terminal-body role="region" aria-label="Illustrative terminal command and output" tabindex="0"><div class="motion-terminal-line is-command">$ kubectl get pods -n platform</div><div class="motion-terminal-line is-output">NAME                         READY   STATUS    RESTARTS</div><div class="motion-terminal-line is-output">api-6c8df7d9f8-2p4kq         1/1     Running   0</div><div class="motion-terminal-line is-output">worker-78d8b8d9bd-fk7mx      1/1     Running   0</div></div>
    </div>
    <div class="motion-controls"><button class="motion-button motion-button-primary" type="button" data-terminal-replay>Replay output</button><button class="motion-button" type="button" data-terminal-pause disabled>Pause</button><span class="motion-status" data-terminal-status data-state="waiting">STATIC EXAMPLE</span></div>
    <p class="motion-microcopy">The command and output are illustrative. No shell, cluster, API, container runtime, Terraform provider, or external system is executed.</p>`);
  const terminalPanel = mount('terminal', terminalMarkup);
  if (terminalPanel) {
    const body = terminalPanel.querySelector('[data-terminal-body]');
    const status = terminalPanel.querySelector('[data-terminal-status]');
    const label = terminalPanel.querySelector('[data-terminal-state]');
    const replay = terminalPanel.querySelector('[data-terminal-replay]');
    const pause = terminalPanel.querySelector('[data-terminal-pause]');
    const command = 'kubectl get pods -n platform';
    const lines = [
      'NAME                         READY   STATUS    RESTARTS',
      'api-6c8df7d9f8-2p4kq         1/1     Running   0',
      'worker-78d8b8d9bd-fk7mx      1/1     Running   0',
      'deployment.apps/api          2/2     Available'
    ];
    let runId = 0;
    let paused = false;
    let running = false;
    const type = async (id, text, target) => {
      for (let index = 0; index <= text.length; index += 1) {
        if (id !== runId) return false;
        while (paused && id === runId) await wait(80);
        if (id !== runId) return false;
        safeText(target, text.slice(0, index));
        if (!isReducedMotion()) await wait(24);
      }
      return true;
    };
    const play = async () => {
      if (running) return;
      running = true; paused = false;
      const id = ++runId;
      replay.disabled = true; pause.disabled = false; safeText(pause, 'Pause');
      safeText(label, 'TYPING OUTPUT'); setStatus(status, 'RUNNING', 'running');
      body.replaceChildren();
      const commandLine = document.createElement('div'); commandLine.className = 'motion-terminal-line is-command';
      const prompt = document.createElement('span'); prompt.className = 'motion-terminal-prompt'; prompt.textContent = '$ ';
      const commandNode = document.createElement('span'); commandNode.className = 'motion-terminal-command';
      const cursorNode = document.createElement('span'); cursorNode.className = 'motion-terminal-cursor'; cursorNode.setAttribute('aria-hidden', 'true');
      commandLine.append(prompt, commandNode); body.appendChild(commandLine);
      if (isReducedMotion()) {
        commandNode.textContent = command;
        lines.forEach(line => { const row = document.createElement('div'); row.className = 'motion-terminal-line is-output'; row.textContent = line; body.appendChild(row); });
      } else {
        if (!(await type(id, command, commandNode))) return;
        commandLine.appendChild(cursorNode);
        for (const line of lines) {
          while (paused && id === runId) await wait(80);
          if (id !== runId) return;
          await wait(210);
          const row = document.createElement('div'); row.className = 'motion-terminal-line is-output'; row.textContent = line;
          cursorNode.remove(); body.appendChild(row); body.appendChild(cursorNode); body.scrollTop = body.scrollHeight;
        }
      }
      if (id !== runId) return;
      cursorNode.remove();
      running = false; replay.disabled = false; pause.disabled = true;
      safeText(label, 'OUTPUT COMPLETE'); setStatus(status, 'COMPLETE', 'complete');
    };
    replay.addEventListener('click', play);
    pause.addEventListener('click', () => {
      if (!running) return;
      paused = !paused;
      safeText(pause, paused ? 'Resume' : 'Pause');
      setStatus(status, paused ? 'PAUSED' : 'RUNNING', paused ? 'waiting' : 'running');
    });
    document.addEventListener('motionpreferencechange', event => {
      if (!event.detail.reduced || !running) return;
      runId += 1; running = false; paused = false;
      renderTerminalFrame(body, command, lines, false);
      replay.disabled = false; pause.disabled = true; safeText(label, 'STATIC OUTPUT');
      setStatus(status, 'STATIC OUTPUT · REDUCED MOTION', 'complete');
    });
    onceVisible(terminalPanel, () => { if (!isReducedMotion()) play(); });
  }

  // 20 — User-controlled terminal command replay; uses the same terminal renderer as #09.
  const replayScenarios = {
    docker: [
      ['docker build -t checkout-api:1.4.2 .', ['[+] Building 8.4s (12/12) FINISHED', 'Successfully tagged checkout-api:1.4.2']],
      ['docker image ls checkout-api', ['REPOSITORY      TAG     IMAGE ID       SIZE', 'checkout-api    1.4.2   7f3a9c2e1b8d   148MB']],
      ['docker run -d --name checkout -p 8080:8080 checkout-api:1.4.2', ['container id: 4a8d…2c91', 'port mapping: 0.0.0.0:8080 → 8080/tcp']],
      ['docker ps --filter name=checkout', ['CONTAINER ID   IMAGE                  STATUS', '4a8d…2c91     checkout-api:1.4.2    Up (illustrative)']]
    ],
    kubernetes: [
      ['kubectl apply -f deployment.yaml', ['deployment.apps/checkout-api configured']],
      ['kubectl rollout status deployment/checkout-api', ['Waiting for deployment "checkout-api" rollout to finish…', 'deployment "checkout-api" successfully rolled out']],
      ['kubectl get pods -l app=checkout-api', ['NAME                           READY   STATUS', 'checkout-api-6c8df7d9f8-2p4kq  1/1     Running', 'checkout-api-6c8df7d9f8-fk7mx  1/1     Running']],
      ['kubectl get svc checkout-api', ['NAME           TYPE        CLUSTER-IP      PORT(S)', 'checkout-api   ClusterIP   10.96.42.18     80/TCP']]
    ],
    terraform: [
      ['terraform init', ['Initializing the backend…', 'Terraform has been successfully initialized!']],
      ['terraform validate', ['Success! The configuration is valid.']],
      ['terraform plan -out=tfplan', ['Plan: 3 to add, 0 to change, 0 to destroy.', 'Saved the plan to: tfplan']],
      ['terraform show tfplan  # human review', ['Review resource scope, IAM permissions, network exposure, and replacement actions.', 'Approval is an explicit control before apply.']],
      ['terraform apply tfplan', ['Apply complete! Resources: 3 added, 0 changed, 0 destroyed.', 'Illustrative output only; no provider API is called here.']]
    ],
    linux: [
      ['systemctl status nginx', ['nginx.service - A high performance web server', 'Active: active (running) · illustrative state']],
      ['ss -lntp', ['State  Recv-Q Send-Q Local Address:Port', 'LISTEN 0      511    0.0.0.0:80', 'LISTEN 0      511    0.0.0.0:443']],
      ['journalctl -u nginx --since "10 min ago"', ['INFO: worker process started', 'INFO: configuration reload completed']],
      ['df -h', ['Filesystem      Size  Used  Avail  Use%', '/dev/root        40G   18G    22G   45%']]
    ]
  };
  const replayMarkup = panelShell('20 / TERMINAL COMMAND REPLAY', 'Control the workflow one command at a time', 'Choose a learning path, then play, pause, replay, step backward or forward, and adjust playback speed. Each output is a predefined teaching example.', 'Playback is local · nothing is executed', `
    <div class="motion-controls" style="margin-top:0;margin-bottom:12px"><label class="motion-field" for="replayScenario">Demo sequence <select class="motion-select" id="replayScenario"><option value="docker">Docker image → container</option><option value="kubernetes">Kubernetes deploy → inspect</option><option value="terraform">Terraform init → apply review</option><option value="linux">Linux administration</option></select></label><label class="motion-field" for="replaySpeed">Playback speed <select class="motion-select" id="replaySpeed"><option value="1800">0.5×</option><option selected value="900">1×</option><option value="600">1.5×</option><option value="450">2×</option></select></label></div>
    <div class="motion-terminal-grid">
      <nav class="motion-command-steps" data-replay-steps aria-label="Command replay steps"></nav>
      <div>
        <div class="motion-terminal" data-replay-terminal><div class="motion-terminal-head"><span>ILLUSTRATIVE COMMAND REPLAY</span><span data-replay-terminal-state>STEP 1</span></div><div class="motion-terminal-body" data-replay-terminal-body role="region" aria-label="Selected command and illustrative output" tabindex="0"></div></div>
        <div class="motion-terminal-caption"><span data-replay-progress>STEP 1 OF 4</span><span>STATIC COMMAND EXAMPLES</span></div>
      </div>
    </div>
    <div class="motion-controls"><button class="motion-button motion-button-primary" type="button" data-replay-play>Play</button><button class="motion-button" type="button" data-replay-pause disabled>Pause</button><button class="motion-button" type="button" data-replay-again>Replay</button><button class="motion-button" type="button" data-replay-prev>Previous step</button><button class="motion-button" type="button" data-replay-next>Next step</button><button class="motion-button" type="button" data-replay-reset>Reset</button><span class="motion-status" data-replay-status data-state="waiting">READY</span></div>
    <p class="motion-microcopy">Commands and outputs are static examples; no external shell, container engine, Kubernetes cluster, Terraform provider, Linux host, or cloud resource is accessed or changed. Review and approval steps remain explicit in the Terraform path.</p>`);
  const replayPanel = mount('replay', replayMarkup);
  if (replayPanel) {
    const scenarioSelect = replayPanel.querySelector('#replayScenario');
    const speedSelect = replayPanel.querySelector('#replaySpeed');
    const stepsList = replayPanel.querySelector('[data-replay-steps]');
    const terminalBody = replayPanel.querySelector('[data-replay-terminal-body]');
    const terminalState = replayPanel.querySelector('[data-replay-terminal-state]');
    const progress = replayPanel.querySelector('[data-replay-progress]');
    const playButton = replayPanel.querySelector('[data-replay-play]');
    const pauseButton = replayPanel.querySelector('[data-replay-pause]');
    const status = replayPanel.querySelector('[data-replay-status]');
    let scenario = 'docker';
    let currentStep = 0;
    let playbackTimer = null;
    let playing = false;
    const getSteps = () => replayScenarios[scenario];
    const stopPlayback = () => {
      if (playbackTimer !== null) window.clearTimeout(playbackTimer);
      playbackTimer = null; playing = false;
      playButton.disabled = currentStep >= getSteps().length - 1;
      pauseButton.disabled = true;
    };
    const renderReplay = () => {
      const steps = getSteps();
      stepsList.replaceChildren();
      steps.forEach((step, index) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'motion-command-step';
        const state = index === currentStep ? 'current' : index < currentStep ? 'completed' : 'upcoming';
        button.setAttribute('aria-current', state === 'current' ? 'step' : 'false');
        button.dataset.stepState = state;
        button.setAttribute('aria-label', `Step ${index + 1} ${state}: ${step[0]}`);
        const title = document.createElement('strong'); title.textContent = `STEP ${String(index + 1).padStart(2,'0')} · ${state.toUpperCase()}`;
        const command = document.createElement('small'); command.textContent = step[0];
        button.append(title, command);
        button.addEventListener('click', () => { stopPlayback(); currentStep = index; renderReplay(); setStatus(status, 'PAUSED · MANUAL STEP', 'waiting'); });
        stepsList.appendChild(button);
      });
      const [command, output] = steps[currentStep];
      renderTerminalFrame(terminalBody, command, output, false);
      safeText(terminalState, `STEP ${currentStep + 1} / ${steps.length}`);
      safeText(progress, `STEP ${currentStep + 1} OF ${steps.length}`);
      playButton.disabled = currentStep === steps.length - 1;
      replayPanel.querySelector('[data-replay-prev]').disabled = currentStep === 0;
      replayPanel.querySelector('[data-replay-next]').disabled = currentStep >= steps.length - 1;
    };
    const scheduleNext = () => {
      if (!playing) return;
      playbackTimer = window.setTimeout(() => {
        if (currentStep < getSteps().length - 1) {
          currentStep += 1; renderReplay(); scheduleNext();
        } else {
          stopPlayback(); setStatus(status, 'SEQUENCE COMPLETE', 'complete');
        }
      }, isReducedMotion() ? 80 : Number(speedSelect.value));
    };
    playButton.addEventListener('click', () => {
      if (playing || currentStep >= getSteps().length - 1) return;
      if (isReducedMotion()) {
        currentStep = Math.min(getSteps().length - 1, currentStep + 1);
        renderReplay(); setStatus(status, 'REDUCED MOTION · ONE STEP ADVANCED', 'waiting');
        return;
      }
      playing = true; playButton.disabled = true; pauseButton.disabled = false;
      setStatus(status, 'PLAYING', 'running'); scheduleNext();
    });
    pauseButton.addEventListener('click', () => { stopPlayback(); setStatus(status, 'PAUSED · STATE RETAINED', 'waiting'); });
    replayPanel.querySelector('[data-replay-again]').addEventListener('click', () => {
      stopPlayback(); currentStep = 0; renderReplay();
      if (isReducedMotion()) { setStatus(status, 'RESET · USE STEP CONTROLS', 'waiting'); return; }
      playing = true; playButton.disabled = true; pauseButton.disabled = false;
      setStatus(status, 'REPLAYING', 'running'); scheduleNext();
    });
    replayPanel.querySelector('[data-replay-prev]').addEventListener('click', () => { stopPlayback(); currentStep = Math.max(0,currentStep-1); renderReplay(); setStatus(status, 'PAUSED · MANUAL STEP', 'waiting'); });
    replayPanel.querySelector('[data-replay-next]').addEventListener('click', () => { stopPlayback(); currentStep = Math.min(getSteps().length-1,currentStep+1); renderReplay(); setStatus(status, currentStep === getSteps().length - 1 ? 'SEQUENCE COMPLETE' : 'PAUSED · MANUAL STEP', currentStep === getSteps().length - 1 ? 'complete' : 'waiting'); });
    replayPanel.querySelector('[data-replay-reset]').addEventListener('click', () => { stopPlayback(); currentStep = 0; renderReplay(); setStatus(status, 'RESET TO STEP 1', 'waiting'); });
    scenarioSelect.addEventListener('change', () => { stopPlayback(); scenario = scenarioSelect.value; currentStep = 0; renderReplay(); setStatus(status, 'NEW SEQUENCE READY', 'waiting'); });
    speedSelect.addEventListener('change', () => { if (playing) { stopPlayback(); setStatus(status, 'SPEED UPDATED · PRESS PLAY', 'waiting'); } });
    document.addEventListener('motionpreferencechange', event => {
      if (event.detail.reduced && playing) { stopPlayback(); setStatus(status, 'PAUSED · REDUCED MOTION', 'waiting'); }
    });
    renderReplay();
  }

  // 10 — Deterministic synthetic metric chart updates.
  const metricSamples = {
    cpu: [62, 68, 82, 59, 51], memory: [71, 72, 74, 73, 70], requests: [420, 510, 680, 455, 390],
    errors: [0.18, 0.22, 0.62, 0.12, 0.09], latency: [184, 210, 286, 166, 142], availability: [99.96, 99.94, 99.91, 99.97, 99.98], sli: [99.94, 99.91, 99.88, 99.95, 99.97]
  };
  const metricMeta = {
    cpu: ['CPU UTILIZATION', '%', 75, '', 0, 100],
    memory: ['MEMORY UTILIZATION', '%', 85, '', 0, 100],
    requests: ['REQUEST RATE', 'req/s', null, '', 0, 800],
    errors: ['HTTP 5XX ERROR RATE', '%', 0.5, '', 0, 1],
    latency: ['P95 LATENCY', 'ms', 250, '', 0, 350],
    availability: ['AVAILABILITY', '%', 99.9, '', 99.8, 100],
    sli: ['SERVICE-LEVEL INDICATOR', '%', 99.9, '', 99.8, 100]
  };
  const metricsMarkup = panelShell('10 / OBSERVABILITY CHART ANIMATION', 'Synthetic service signals over a controlled sample window', 'Line charts, threshold bars, and headline values move together through a fixed set of illustrative samples.', 'SIMULATED DATA ONLY', `
    <div class="motion-metric-grid" data-metric-grid>${Object.entries(metricSamples).map(([key, values]) => {
      const meta = metricMeta[key];
      const current = values[0];
      const formatted = key === 'requests' ? `${current} req/s` : key === 'latency' ? `${current} ms` : `${current}%`;
      return `<article class="motion-metric-card" data-metric-card="${key}"><span>${meta[0]}</span><strong data-metric-value>${formatted}</strong><small data-metric-status>Illustrative sample</small><svg class="motion-spark" viewBox="0 0 180 42" role="img" aria-label="Synthetic ${meta[0].toLowerCase()} sample chart"><path data-metric-path d="M4 24 L40 18 L76 27 L112 12 L148 19 L176 9"/></svg><div class="motion-metric-track"><span data-metric-fill style="--metric-value:${Math.min(100,Math.max(0,((current - meta[4])/(meta[5]-meta[4]))*100))}%"></span></div></article>`;
    }).join('')}</div>
    <div class="motion-chart-footer"><span class="motion-status" data-metric-window data-state="complete">SAMPLE 1 / 5 · BASELINE</span><div class="motion-controls"><button class="motion-button motion-button-primary" type="button" data-metric-next>Advance sample</button><button class="motion-button" type="button" data-metric-reset>Reset samples</button></div></div>
    <p class="motion-microcopy">These fixed browser-local values are synthetic and are not collected from Prometheus, Grafana, OpenTelemetry, or any live system. Thresholds are illustrative; real SLI/SLO definitions must reflect user-visible service outcomes and valid measurement windows.</p>`);
  const metricsPanel = mount('metrics', metricsMarkup);
  if (metricsPanel) {
    let sample = 0;
    const cards = [...metricsPanel.querySelectorAll('[data-metric-card]')];
    const windowStatus = metricsPanel.querySelector('[data-metric-window]');
    let metricsRevealed = false;
    const render = () => {
      cards.forEach(card => {
        const key = card.dataset.metricCard;
        const meta = metricMeta[key];
        const values = metricSamples[key];
        const value = values[sample];
        const output = key === 'requests' ? `${value} req/s` : key === 'latency' ? `${value} ms` : `${value}%`;
        safeText(card.querySelector('[data-metric-value]'), output);
        const limit = meta[2];
        let thresholdText = 'Synthetic sample';
        if (limit !== null) {
          const exceeded = key === 'availability' || key === 'sli' ? value < limit : value >= limit;
          thresholdText = `${exceeded ? 'Threshold crossed' : 'Within sample threshold'} · ${key === 'availability' || key === 'sli' ? 'min ' : 'max '}${limit}${meta[1]}`;
        }
        safeText(card.querySelector('[data-metric-status]'), thresholdText);
        const scale = Math.max(0, Math.min(100, ((value - meta[4]) / (meta[5] - meta[4])) * 100));
        card.querySelector('[data-metric-fill]').style.setProperty('--metric-value', `${scale}%`);
        const series = values.slice(0, sample + 1);
        const min = Math.min(...values); const max = Math.max(...values); const range = Math.max(1, max - min);
        const yFor = entry => 36 - ((entry - min) / range) * 28;
        const coords = series.map((entry, index) => `${4 + (index / Math.max(1, values.length - 1)) * 172},${yFor(entry)}`);
        if (series.length === 1) coords.push(`40,${yFor(series[0])}`);
        const path = card.querySelector('[data-metric-path]');
        path.setAttribute('d', `M${coords.join(' L')}`);
        const svg = card.querySelector('svg');
        svg.classList.remove('is-drawn');
        try {
          const pathLength = path.getTotalLength();
          path.style.strokeDasharray = String(pathLength);
          path.style.strokeDashoffset = isReducedMotion() ? '0' : String(pathLength);
        } catch (_) {
          path.style.strokeDasharray = '1'; path.style.strokeDashoffset = isReducedMotion() ? '0' : '1';
        }
        if (isReducedMotion() || metricsRevealed) {
          if (isReducedMotion()) svg.classList.add('is-drawn');
          else window.requestAnimationFrame(() => svg.classList.add('is-drawn'));
        }
      });
      setStatus(windowStatus, `SAMPLE ${sample + 1} / 5 · ${['BASELINE','RISING LOAD','PEAK WINDOW','RECOVERY','STABLE'][sample]}`, 'complete');
      metricsPanel.querySelector('[data-metric-next]').disabled = sample === 4;
    };
    metricsPanel.querySelector('[data-metric-next]').addEventListener('click', () => { sample = Math.min(4, sample + 1); render(); });
    metricsPanel.querySelector('[data-metric-reset]').addEventListener('click', () => { sample = 0; render(); });
    render();
    onceVisible(metricsPanel, () => {
      metricsRevealed = true;
      metricsPanel.querySelectorAll('.motion-spark').forEach(svg => svg.classList.add('is-drawn'));
    });
  }

  // 11 + 27 — One accurate relationship dataset powers staged graph reveal and interactive spotlight.
  // The outer SVG group owns the node's fixed position; the inner group owns its entrance transform.
  // Keeping those transforms separate prevents CSS animation from overriding SVG coordinates.
  const technologyNodes = [
    { id: 'git', label: 'Git', x: 105, y: 112, group: 'SOURCE' },
    { id: 'actions', label: 'GitHub Actions', x: 310, y: 112, group: 'CI WORKFLOWS' },
    { id: 'terraform', label: 'Terraform', x: 535, y: 112, group: 'INFRASTRUCTURE AS CODE' },
    { id: 'aws', label: 'AWS', x: 755, y: 112, group: 'CLOUD PROVIDER' },
    { id: 'argocd', label: 'Argo CD', x: 310, y: 258, group: 'GITOPS' },
    { id: 'docker', label: 'Docker', x: 105, y: 405, group: 'IMAGE BUILD' },
    { id: 'registry', label: 'OCI registry', x: 330, y: 405, group: 'IMAGE STORAGE' },
    { id: 'kubernetes', label: 'Kubernetes', x: 560, y: 330, group: 'CONTAINER PLATFORM' },
    { id: 'helm', label: 'Helm', x: 560, y: 475, group: 'PACKAGE MANAGEMENT' },
    { id: 'prometheus', label: 'Prometheus', x: 775, y: 270, group: 'METRICS' },
    { id: 'otel', label: 'OpenTelemetry', x: 775, y: 420, group: 'TELEMETRY' }
  ];
  const technologyEdges = [
    { from: 'git', to: 'actions', d: 'M180 112 H235' },
    { from: 'git', to: 'argocd', d: 'M105 141 V258 H235' },
    { from: 'terraform', to: 'aws', d: 'M610 112 H680' },
    { from: 'docker', to: 'registry', d: 'M180 405 H255' },
    { from: 'registry', to: 'kubernetes', d: 'M405 405 H460 V330 H485' },
    { from: 'helm', to: 'kubernetes', d: 'M560 446 V359' },
    { from: 'argocd', to: 'kubernetes', d: 'M385 258 H435 V330 H485' },
    { from: 'kubernetes', to: 'prometheus', d: 'M635 330 H680 V270 H700' },
    { from: 'kubernetes', to: 'otel', d: 'M635 330 H680 V420 H700' }
  ];
  const nodeById = Object.fromEntries(technologyNodes.map(node => [node.id, node]));
  const techSvg = `<svg class="motion-tech-svg" viewBox="0 0 850 520" role="img" aria-label="Technology relationship graph. Git connects to GitHub Actions and Argo CD. Terraform connects to AWS. Docker connects to an OCI registry, which Kubernetes can pull images from. Argo CD and Helm relate to Kubernetes. Kubernetes telemetry connects to Prometheus and OpenTelemetry." focusable="false">
    <g class="motion-tech-cluster-labels" aria-hidden="true">
      <text x="105" y="48">SOURCE + DELIVERY</text><text x="535" y="48">PROVISIONING</text>
      <text x="105" y="340">CONTAINER SUPPLY CHAIN</text><text x="560" y="220">PLATFORM + OBSERVABILITY</text>
    </g>
    <g class="motion-tech-edges">${technologyEdges.map((edge,index) => `<path class="motion-tech-edge" data-tech-edge="${edge.from}|${edge.to}" data-edge-order="${index}" d="${edge.d}"/>`).join('')}</g>
    <g class="motion-tech-nodes">${technologyNodes.map((node,index) => `<g transform="translate(${node.x - 75},${node.y - 29})"><g class="motion-tech-node" data-tech-node="${node.id}" style="--node-order:${index}"><rect width="150" height="58" rx="10"/><text class="motion-tech-name" x="75" y="25">${node.label}</text><text class="motion-tech-group" x="75" y="42">${node.group}</text></g></g>`).join('')}</g>
  </svg>`;
  const technologyMarkup = panelShell('11 + 27 / TECHNOLOGY MAP + DEPENDENCY SPOTLIGHT', 'Reveal the ecosystem. Then inspect one dependency at a time.', 'Connections draw progressively; selecting a technology emphasizes its directly related concepts and quiets unrelated nodes. Use the same relationship graph for both experiences.', 'Concept map · not a proficiency ranking', `
    <div class="motion-tech-layout">
      <div class="motion-tech-canvas"><div class="motion-tech-canvas-inner">${techSvg}</div><p class="motion-tech-scroll-hint">On smaller screens, scroll the map horizontally to inspect every connection.</p></div>
      <aside class="motion-tech-side">
        <div class="motion-controls" style="margin-top:0"><button class="motion-button motion-button-primary" type="button" data-tech-animate>Replay connection drawing</button><button class="motion-button" type="button" data-tech-clear>Clear selection</button></div>
        <div class="motion-tech-list" aria-label="Choose a technology to spotlight">${technologyNodes.map(node => `<button type="button" data-tech-select="${node.id}" aria-pressed="false">${node.label}</button>`).join('')}</div>
        <div class="motion-tech-description" aria-live="polite"><span class="motion-status" data-tech-animation-status data-state="waiting">Ready to draw</span><strong data-tech-title>Choose a technology</strong><p data-tech-copy>Select any node to see the direct relationships defined by this reference graph.</p></div>
      </aside>
    </div>
    <p class="motion-microcopy">Edges are intentionally limited to defensible relationships: Git as source for CI workflows and GitOps, Terraform provisioning AWS resources through provider APIs, Docker images stored in OCI registries and pulled by Kubernetes, Helm packaging Kubernetes resources, and cluster telemetry scraped or exported to observability tools. This is a study map, not a proficiency ranking or dependency lockfile.</p>`);
  const technologyPanel = mount('technology', technologyMarkup);
  if (technologyPanel) {
    const svg = technologyPanel.querySelector('.motion-tech-svg');
    const title = technologyPanel.querySelector('[data-tech-title]');
    const copy = technologyPanel.querySelector('[data-tech-copy]');
    const buttons = [...technologyPanel.querySelectorAll('[data-tech-select]')];
    const nodes = [...svg.querySelectorAll('[data-tech-node]')];
    const edges = [...svg.querySelectorAll('[data-tech-edge]')];
    const relationSummary = {
      git: 'Git provides versioned source for CI workflows and the desired-state repository observed by GitOps controllers.',
      actions: 'GitHub Actions runs CI workflows triggered by repository events. A workflow can validate, build, test, and publish project changes.',
      terraform: 'Terraform plans and manages cloud resources through a configured provider and its APIs; state tracks resource identity.',
      aws: 'AWS is a cloud provider target for Terraform-managed networking, identity, compute, storage, and managed services.',
      docker: 'Docker builds and runs container images; an OCI-compatible registry stores image manifests and layers.',
      registry: 'An OCI registry stores image manifests and layers. Kubernetes nodes pull the referenced images when starting workloads.',
      kubernetes: 'Kubernetes orchestrates container workloads, pulls images from registries, and can receive resources managed by Helm or GitOps controllers.',
      argocd: 'Argo CD observes Git repositories and reconciles the Kubernetes application resources it is configured to manage.',
      helm: 'Helm packages Kubernetes resource templates and values into repeatable releases; it is a packaging and release tool, not a runtime dependency.',
      prometheus: 'Prometheus scrapes configured targets, including suitable Kubernetes workload and infrastructure metrics endpoints.',
      otel: 'OpenTelemetry instrumentation and Collectors can produce and process traces, metrics, and logs for compatible backends.'
    };
    let selected = null;
    let animationRun = 0;
    const resetGraph = () => {
      selected = null;
      nodes.forEach(node => node.classList.remove('is-muted','is-related','is-selected'));
      edges.forEach(edge => edge.classList.remove('is-muted','is-related'));
      buttons.forEach(button => button.setAttribute('aria-pressed','false'));
      safeText(title, 'Choose a technology');
      safeText(copy, 'Select any node to see the direct relationships defined by this reference graph.');
    };
    const spotlight = id => {
      selected = id;
      const connected = new Set([id]);
      const activeEdges = new Set();
      technologyEdges.forEach(({from,to}) => {
        if (from === id || to === id) { connected.add(from); connected.add(to); activeEdges.add(`${from}|${to}`); }
      });
      nodes.forEach(node => {
        const nodeId = node.dataset.techNode;
        node.classList.toggle('is-selected', nodeId === id);
        node.classList.toggle('is-related', connected.has(nodeId) && nodeId !== id);
        node.classList.toggle('is-muted', !connected.has(nodeId));
      });
      edges.forEach(edge => {
        const key = edge.dataset.techEdge;
        edge.classList.toggle('is-related', activeEdges.has(key));
        edge.classList.toggle('is-muted', !activeEdges.has(key));
      });
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.techSelect === id)));
      safeText(title, nodeById[id].label);
      safeText(copy, relationSummary[id]);
    };
    buttons.forEach(button => button.addEventListener('click', () => spotlight(button.dataset.techSelect)));
    technologyPanel.querySelector('[data-tech-clear]').addEventListener('click', resetGraph);
    const animate = () => {
      const run = ++animationRun;
      const animateButton = technologyPanel.querySelector('[data-tech-animate]');
      const animationStatus = technologyPanel.querySelector('[data-tech-animation-status]');
      svg.classList.remove('is-drawn');
      if (animationStatus) setStatus(animationStatus, 'Drawing connections', 'running');
      edges.forEach((edge,index) => {
        const length = edge.getTotalLength();
        edge.style.setProperty('--path-length', String(length));
        edge.style.transitionDelay = `${index * 105}ms`;
      });
      // Force a style/layout boundary so replay always begins from the undrawn state.
      void svg.getBoundingClientRect().width;
      window.requestAnimationFrame(() => {
        if (run !== animationRun) return;
        svg.classList.add('is-drawn');
        if (animateButton) animateButton.textContent = 'Replay connection drawing';
        window.setTimeout(() => {
          if (run === animationRun && animationStatus) setStatus(animationStatus, 'Connections visible', 'complete');
        }, isReducedMotion() ? 0 : 1700);
      });
    };
    technologyPanel.querySelector('[data-tech-animate]').addEventListener('click', animate);
    onceVisible(technologyPanel, animate);
    resetGraph();
  }

  // 23 — Distributed tracing waterfall with parent-child hierarchy and relative span timing.
  const traceSpans = [
    { id:'client', name:'Client request', parent:null, start:0, duration:248, depth:0, kind:'ROOT' },
    { id:'gateway', name:'API Gateway', parent:'client', start:8, duration:232, depth:1, kind:'HTTP' },
    { id:'auth', name:'Authentication', parent:'gateway', start:24, duration:42, depth:2, kind:'RPC' },
    { id:'orders', name:'Order Service', parent:'gateway', start:68, duration:150, depth:2, kind:'RPC' },
    { id:'database', name:'Database query', parent:'orders', start:112, duration:74, depth:3, kind:'DB' },
    { id:'response', name:'Response encoding', parent:'gateway', start:222, duration:22, depth:2, kind:'APP' }
  ];
  const traceMarkup = panelShell('23 / DISTRIBUTED TRACING WATERFALL', 'Follow one request across service boundaries', 'Span bars show relative elapsed time and parent-child relationships. A long or failed span can dominate total latency even when most services are fast.', 'Synthetic trace · 248 ms end to end', `
    <div class="motion-trace-toolbar"><button class="motion-button motion-button-primary" type="button" data-trace-replay>Replay trace</button><button class="motion-button" type="button" data-trace-expand aria-expanded="true">Collapse child spans</button><button class="motion-button" type="button" data-trace-reset>Reset</button><label class="motion-field" for="traceServiceSelect">Select service <select class="motion-select" id="traceServiceSelect"><option value="all">All services</option>${traceSpans.map(span => `<option value="${span.id}">${span.name}</option>`).join('')}</select></label><span class="motion-status" data-trace-status data-state="complete">TRACE READY</span></div>
    <div class="motion-trace-legend"><span>0 ms</span><span>Request elapsed time →</span><span>248 ms</span></div>
    <div data-trace-rows>${traceSpans.map(span => `<button class="motion-trace-row is-visible" type="button" aria-pressed="false" aria-label="Select ${span.name} span, ${span.duration} milliseconds" data-trace-row="${span.id}" data-trace-parent="${span.parent || ''}" data-trace-depth="${span.depth}"><span class="motion-trace-label" style="padding-left:${span.depth * 9}px">${span.name}<small>${span.kind}</small></span><span class="motion-trace-track"><span class="motion-trace-bar" style="--span-start:${span.start/248*100}%;--span-width:${span.duration/248*100}%"></span><span class="motion-trace-duration">${span.duration} ms</span></span></button>`).join('')}</div>
    <div class="motion-trace-axis"><span>0</span><span>62</span><span>124</span><span>186</span><span>248 ms</span></div>
    <p class="motion-microcopy" data-trace-detail aria-live="polite">Select a service row to inspect its span. This synthetic trace uses relative times; it is not connected to Tempo, Jaeger, Zipkin, or an OpenTelemetry backend.</p>`);
  const tracePanel = mount('trace', traceMarkup);
  if (tracePanel) {
    const rows = [...tracePanel.querySelectorAll('[data-trace-row]')];
    const select = tracePanel.querySelector('#traceServiceSelect');
    const status = tracePanel.querySelector('[data-trace-status]');
    const detail = tracePanel.querySelector('[data-trace-detail]');
    const expand = tracePanel.querySelector('[data-trace-expand]');
    let expanded = true;
    let replayId = 0;
    const selectTrace = id => {
      rows.forEach(row => {
        const selected = id !== 'all' && row.dataset.traceRow === id;
        row.classList.toggle('is-selected', selected);
        row.setAttribute('aria-pressed', String(selected));
      });
      const span = traceSpans.find(item => item.id === id);
      safeText(detail, span ? `${span.name}: ${span.duration} ms from request start ${span.start} ms. Parent: ${span.parent || 'root request'}. This is an illustrative span, not a backend result.` : 'All spans are visible. Parent-child nesting is represented by indentation and each span’s parent field.');
    };
    select.addEventListener('change', () => selectTrace(select.value));
    rows.forEach(row => row.addEventListener('click', () => { select.value = row.dataset.traceRow; selectTrace(select.value); }));
    expand.addEventListener('click', () => {
      expanded = !expanded;
      rows.forEach(row => { const depth = Number(row.dataset.traceDepth); row.hidden = !expanded && depth > 1; });
      expand.setAttribute('aria-expanded', String(expanded));
      safeText(expand, expanded ? 'Collapse child spans' : 'Expand all spans');
      selectTrace(select.value);
    });
    tracePanel.querySelector('[data-trace-replay]').addEventListener('click', async () => {
      const id = ++replayId;
      rows.forEach(row => row.classList.remove('is-visible'));
      setStatus(status, 'REPLAYING SPANS', 'running');
      for (const row of rows) { if (id !== replayId) return; row.classList.add('is-visible'); await wait(230); }
      setStatus(status, 'TRACE COMPLETE · 248 MS', 'complete');
    });
    tracePanel.querySelector('[data-trace-reset]').addEventListener('click', () => {
      replayId += 1; rows.forEach(row => { row.classList.add('is-visible'); row.classList.remove('is-selected'); row.hidden = false; });
      expanded = true; expand.setAttribute('aria-expanded', 'true'); safeText(expand, 'Collapse child spans'); select.value = 'all'; selectTrace('all'); setStatus(status, 'TRACE READY', 'complete');
    });
    selectTrace('all');
  }

  // 24 — Incident timeline with step controls and synchronized synthetic service signals.
  const incidentEvents = [
    ['09:00','Normal baseline','Requests, latency, and errors are within the sample operating envelope.'],
    ['09:04','Release deployed','A new application release is introduced in this simulated scenario.'],
    ['09:07','Latency rises','P95 response time increases as a dependency call slows.'],
    ['09:09','Errors increase','A share of requests begins returning server errors.'],
    ['09:10','Monitoring detects','Synthetic metrics cross the configured demonstration thresholds.'],
    ['09:11','Alert fires','An alert is raised for the checkout service objective.'],
    ['09:14','Investigation','The responder correlates the release with a slow downstream database span.'],
    ['09:18','Mitigation applied','The example release is rolled back and connection pressure subsides.'],
    ['09:22','Service recovers','Latency and error ratio return to the illustrative baseline.']
  ];
  const incidentMarkup = panelShell('24 / INCIDENT TIMELINE REPLAY', 'Reconstruct the incident, one event at a time', 'Advance through a realistic service-degradation scenario. The timeline and sample metrics move together so the visitor can connect symptoms, detection, response, and recovery.', 'Illustrative scenario · 09:00–09:22', `
    <div class="motion-chart-footer"><span class="motion-status" data-incident-phase data-state="complete">PHASE 1 / NORMAL</span><span class="motion-kicker" data-incident-clock>09:00</span></div>
    <ol class="motion-timeline" data-incident-timeline>${incidentEvents.map((event,index) => `<li class="${index === 0 ? 'is-current is-past' : ''}" data-incident-step="${index}"><time>${event[0]}</time><strong>${event[1]}</strong><small>${event[2]}</small></li>`).join('')}</ol>
    <div class="motion-incident-metrics"><div><span>P95 LATENCY</span><strong data-incident-latency>160 ms</strong></div><div><span>HTTP 5XX</span><strong data-incident-errors>0.08%</strong></div><div><span>AVAILABILITY</span><strong data-incident-availability>99.97%</strong></div><div><span>RELEASE STATE</span><strong data-incident-release>STABLE</strong></div></div>
    <div class="motion-chart-footer"><span class="motion-status" data-incident-status data-state="complete">READY TO REPLAY</span><div class="motion-controls"><button class="motion-button motion-button-primary" type="button" data-incident-play>Play</button><button class="motion-button" type="button" data-incident-pause disabled>Pause</button><button class="motion-button" type="button" data-incident-prev>Previous</button><button class="motion-button" type="button" data-incident-next>Next event</button><button class="motion-button" type="button" data-incident-replay>Replay</button><button class="motion-button" type="button" data-incident-reset>Reset</button></div></div>
    <p class="motion-microcopy" data-incident-message aria-live="polite">The timeline starts in normal operating conditions. All events and metrics are synthetic; no alerting system, deployment platform, or production service is connected.</p>`);
  const incidentPanel = mount('incident', incidentMarkup);
  if (incidentPanel) {
    let index = 0;
    let timer = null;
    const timeline = [...incidentPanel.querySelectorAll('[data-incident-step]')];
    const phase = incidentPanel.querySelector('[data-incident-phase]');
    const clock = incidentPanel.querySelector('[data-incident-clock]');
    const status = incidentPanel.querySelector('[data-incident-status]');
    const message = incidentPanel.querySelector('[data-incident-message]');
    const play = incidentPanel.querySelector('[data-incident-play]');
    const pause = incidentPanel.querySelector('[data-incident-pause]');
    const prev = incidentPanel.querySelector('[data-incident-prev]');
    const next = incidentPanel.querySelector('[data-incident-next]');
    const metricState = [
      ['160 ms','0.08%','99.97%','STABLE'], ['174 ms','0.09%','99.97%','RELEASED'],
      ['420 ms','0.14%','99.95%','DEGRADED'], ['610 ms','1.8%','99.91%','ERRORS RISING'],
      ['640 ms','2.1%','99.90%','THRESHOLD'], ['655 ms','2.3%','99.89%','ALERTING'],
      ['690 ms','2.5%','99.88%','INVESTIGATING'], ['280 ms','0.7%','99.93%','ROLLBACK'],
      ['168 ms','0.09%','99.97%','RECOVERED']
    ];
    const render = () => {
      timeline.forEach((item, itemIndex) => {
        item.classList.toggle('is-past', itemIndex <= index);
        item.classList.toggle('is-current', itemIndex === index);
      });
      safeText(phase, `PHASE ${index + 1} / ${incidentEvents[index][1].toUpperCase()}`);
      phase.dataset.state = index === 8 ? 'complete' : index >= 2 && index <= 7 ? 'running' : 'waiting';
      safeText(clock, incidentEvents[index][0]);
      const values = metricState[index];
      safeText(incidentPanel.querySelector('[data-incident-latency]'), values[0]);
      safeText(incidentPanel.querySelector('[data-incident-errors]'), values[1]);
      safeText(incidentPanel.querySelector('[data-incident-availability]'), values[2]);
      safeText(incidentPanel.querySelector('[data-incident-release]'), values[3]);
      safeText(message, `${incidentEvents[index][0]} — ${incidentEvents[index][1]}. ${incidentEvents[index][2]}`);
      prev.disabled = index === 0; next.disabled = index === 8;
    };
    const stop = () => { if (timer !== null) window.clearInterval(timer); timer = null; pause.disabled = true; play.disabled = index === 8; };
    const step = () => { if (index < 8) { index += 1; render(); } if (index === 8) { stop(); setStatus(status, 'INCIDENT REPLAY COMPLETE', 'complete'); } };
    play.addEventListener('click', () => {
      if (timer !== null) return;
      if (isReducedMotion()) {
        if (index >= 8) index = 0;
        step(); setStatus(status, 'REDUCED MOTION · STEP ADVANCED', 'waiting');
        return;
      }
      if (index >= 8) index = 0;
      render(); setStatus(status, 'PLAYING TIMELINE', 'running'); play.disabled = true; pause.disabled = false;
      timer = window.setInterval(step, 1250);
    });
    pause.addEventListener('click', () => { stop(); setStatus(status, 'PAUSED', 'waiting'); });
    prev.addEventListener('click', () => { stop(); index = Math.max(0,index-1); render(); setStatus(status, 'PAUSED · STEP MODE', 'waiting'); });
    next.addEventListener('click', () => { stop(); step(); if (index < 8) setStatus(status, 'PAUSED · STEP MODE', 'waiting'); });
    incidentPanel.querySelector('[data-incident-replay]').addEventListener('click', () => {
      stop(); index = 0; render();
      if (isReducedMotion()) { setStatus(status, 'RESET · USE STEP CONTROLS', 'waiting'); return; }
      setStatus(status, 'REPLAYING TIMELINE', 'running');
      play.disabled = true; pause.disabled = false;
      timer = window.setInterval(step, 1250);
    });
    incidentPanel.querySelector('[data-incident-reset]').addEventListener('click', () => { stop(); index = 0; render(); setStatus(status, 'RESET TO BASELINE', 'waiting'); });
    incidentPanel.addEventListener('motionvisibilitychange', event => { if (!event.detail.visible) { stop(); setStatus(status, 'PAUSED · OFF SCREEN', 'waiting'); } });
    document.addEventListener('motionpreferencechange', event => {
      if (event.detail.reduced && timer !== null) { stop(); setStatus(status, 'PAUSED · REDUCED MOTION · STEP MODE', 'waiting'); }
    });
    trackVisibility(incidentPanel);
    render();
  }

  // 26 — A bounded, deterministic autoscaling simulation with cooldown and delayed availability.
  const autoscaleMarkup = panelShell('26 / AUTO-SCALING SIMULATION', 'Scale capacity against workload, not intuition', 'Raise or lower the sample workload and watch CPU pressure drive a bounded desired replica count. Available replicas converge after a readiness delay.', 'Local deterministic model · no cluster calls', `
    <div class="motion-scale-layout">
      <div>
        <div class="motion-scale-gauges">
          <div class="motion-scale-metric"><span>CURRENT LOAD</span><strong data-scale-load>40</strong><small>synthetic load units</small></div>
          <div class="motion-scale-metric"><span>CPU UTILIZATION</span><strong data-scale-cpu>64%</strong><small>scale target 70%</small></div>
          <div class="motion-scale-metric"><span>DESIRED REPLICAS</span><strong data-scale-desired>2</strong><small>min 1 · max 6</small></div>
          <div class="motion-scale-metric"><span>AVAILABLE REPLICAS</span><strong data-scale-available>2</strong><small>readiness is delayed</small></div>
        </div>
        <div class="motion-replica-row" aria-label="Replica availability" data-scale-replicas><span class="motion-replica is-ready">POD 1</span><span class="motion-replica is-ready">POD 2</span></div>
      </div>
      <div class="motion-scale-controls">
        <div class="motion-range-row"><label for="scaleLoadRange">Workload level</label><output data-scale-output>40 / 100</output></div>
        <input class="motion-range" id="scaleLoadRange" type="range" min="10" max="100" step="5" value="40"/>
        <div class="motion-controls"><button class="motion-button" type="button" data-scale-up>Increase Load +15</button><button class="motion-button" type="button" data-scale-down>Decrease Load −15</button></div>
        <div><span class="motion-kicker">SCALING POLICY</span><p>Scale out above 70% CPU for 2 samples. Scale in below 30% CPU for 3 samples. Cooldown: 2 samples. Replica bounds: 1–6.</p></div>
        <div class="motion-controls"><button class="motion-button motion-button-primary" type="button" data-scale-run>Run simulation</button><button class="motion-button" type="button" data-scale-pause disabled>Pause</button><button class="motion-button" type="button" data-scale-reset>Reset</button></div>
      </div>
    </div>
    <div class="motion-chart-footer"><span class="motion-status" data-scale-status data-state="complete">BASELINE · 2 REPLICAS AVAILABLE</span><span class="motion-kicker">DETERMINISTIC STEPS · BROWSER LOCAL</span></div>
    <div class="motion-scale-log" data-scale-log role="log" aria-live="polite"><p>00 · Baseline: load 40, CPU 64%, 2 desired / 2 available replicas.</p></div>
    <p class="motion-microcopy">This model approximates one horizontal scaling policy. Real Kubernetes HPA behaviour depends on metric collection, target utilization, readiness, stabilization windows, behavior policies, Pod resource requests, cluster capacity, and workload startup time. No Kubernetes resource is created or modified.</p>`);
  const autoscalePanel = mount('autoscale', autoscaleMarkup);
  if (autoscalePanel) {
    const range = autoscalePanel.querySelector('#scaleLoadRange');
    const output = autoscalePanel.querySelector('[data-scale-output]');
    const loadValue = autoscalePanel.querySelector('[data-scale-load]');
    const cpuValue = autoscalePanel.querySelector('[data-scale-cpu]');
    const desiredValue = autoscalePanel.querySelector('[data-scale-desired]');
    const availableValue = autoscalePanel.querySelector('[data-scale-available]');
    const replicas = autoscalePanel.querySelector('[data-scale-replicas]');
    const log = autoscalePanel.querySelector('[data-scale-log]');
    const status = autoscalePanel.querySelector('[data-scale-status]');
    const run = autoscalePanel.querySelector('[data-scale-run]');
    const pause = autoscalePanel.querySelector('[data-scale-pause]');
    let load = 40; let desired = 2; let available = 2; let highCount = 0; let lowCount = 0; let cooldown = 0; let pendingReadyTicks = 0; let drainingTicks = 0; let tick = 0; let timer = null;
    const minReplicas = 1; const maxReplicas = 6;
    const cpu = () => Math.min(100, Math.round((load / Math.max(1,available)) * 3.2));
    const addLog = text => { const entry = document.createElement('p'); entry.textContent = text; log.appendChild(entry); log.scrollTop = log.scrollHeight; while (log.children.length > 7) log.removeChild(log.firstChild); };
    const render = () => {
      const currentCpu = cpu();
      safeText(loadValue, load); safeText(cpuValue, `${currentCpu}%`); safeText(desiredValue, desired); safeText(availableValue, available); safeText(output, `${load} / 100`);
      range.value = String(load);
      replicas.replaceChildren();
      for (let index = 0; index < desired; index += 1) {
        const pod = document.createElement('span');
        const ready = index < available;
        pod.className = `motion-replica ${ready ? 'is-ready' : 'is-pending'}`;
        pod.textContent = `POD ${index + 1}`;
        pod.setAttribute('aria-label', `Replica ${index + 1} ${ready ? 'available' : 'pending readiness'}`);
        replicas.appendChild(pod);
      }
    };
    const tickOnce = () => {
      tick += 1;
      const currentCpu = cpu();
      if (cooldown > 0) cooldown -= 1;
      if (currentCpu > 70) { highCount += 1; lowCount = 0; }
      else if (currentCpu < 30) { lowCount += 1; highCount = 0; }
      else { highCount = 0; lowCount = 0; }
      if (cooldown === 0 && highCount >= 2 && desired < maxReplicas) {
        desired += 1; highCount = 0; cooldown = 2; pendingReadyTicks = 1; addLog(`${String(tick).padStart(2,'0')} · Scale out requested: desired replicas → ${desired}. New capacity is pending readiness.`);
      } else if (cooldown === 0 && lowCount >= 3 && desired > minReplicas) {
        desired -= 1; lowCount = 0; cooldown = 2; drainingTicks = 1; addLog(`${String(tick).padStart(2,'0')} · Scale in requested: desired replicas → ${desired}. Excess capacity begins draining.`);
      }
      if (available < desired) {
        if (pendingReadyTicks > 0) {
          pendingReadyTicks -= 1;
          addLog(`${String(tick).padStart(2,'0')} · New replica is starting; desired capacity is ${desired}, available capacity remains ${available}.`);
        } else {
          available = Math.min(desired, available + 1);
          addLog(`${String(tick).padStart(2,'0')} · Replica became available after its readiness delay (${available}/${desired}).`);
        }
      } else if (available > desired) {
        if (drainingTicks > 0) {
          drainingTicks -= 1;
          addLog(`${String(tick).padStart(2,'0')} · Excess replica is draining before removal (${available} available, ${desired} desired).`);
        } else {
          available = Math.max(desired, available - 1);
          addLog(`${String(tick).padStart(2,'0')} · Draining replica removed from available capacity (${available}/${desired}).`);
        }
      } else {
        addLog(`${String(tick).padStart(2,'0')} · Sample evaluated: load ${load}, CPU ${cpu()}%, ${desired}/${available} replicas.`);
      }
      render();
      setStatus(status, cooldown > 0 ? `COOLDOWN ${cooldown} · ${desired}/${available} AVAILABLE` : `RUNNING · ${desired} DESIRED / ${available} AVAILABLE`, 'running');
    };
    const stop = () => { if (timer !== null) window.clearInterval(timer); timer = null; run.disabled = false; pause.disabled = true; };
    range.addEventListener('input', () => { load = Number(range.value); highCount = 0; lowCount = 0; render(); setStatus(status, `MANUAL LOAD · CPU ${cpu()}%`, 'waiting'); });
    autoscalePanel.querySelector('[data-scale-up]').addEventListener('click', () => { load = Math.min(100, load + 15); highCount = 0; lowCount = 0; render(); setStatus(status, `LOAD INCREASED · CPU ${cpu()}%`, 'waiting'); });
    autoscalePanel.querySelector('[data-scale-down]').addEventListener('click', () => { load = Math.max(10, load - 15); highCount = 0; lowCount = 0; render(); setStatus(status, `LOAD DECREASED · CPU ${cpu()}%`, 'waiting'); });
    run.addEventListener('click', () => {
      if (timer !== null) return;
      if (isReducedMotion()) {
        tickOnce(); setStatus(status, 'REDUCED MOTION · ONE SAMPLE EVALUATED', 'waiting');
        return;
      }
      run.disabled = true; pause.disabled = false;
      setStatus(status, 'SIMULATION RUNNING', 'running');
      timer = window.setInterval(tickOnce, 1100);
    });
    pause.addEventListener('click', () => { stop(); setStatus(status, 'PAUSED · STATE RETAINED', 'waiting'); });
    autoscalePanel.querySelector('[data-scale-reset]').addEventListener('click', () => {
      stop(); load = 40; desired = 2; available = 2; highCount = 0; lowCount = 0; cooldown = 0; pendingReadyTicks = 0; drainingTicks = 0; tick = 0;
      log.replaceChildren(); addLog('00 · Baseline: load 40, CPU 64%, 2 desired / 2 available replicas.');
      render(); setStatus(status, 'BASELINE · 2 REPLICAS AVAILABLE', 'complete');
    });
    autoscalePanel.addEventListener('motionvisibilitychange', event => { if (!event.detail.visible && timer !== null) { stop(); setStatus(status, 'PAUSED · OFF SCREEN', 'waiting'); } });
    document.addEventListener('motionpreferencechange', event => {
      if (event.detail.reduced && timer !== null) { stop(); setStatus(status, 'PAUSED · REDUCED MOTION · STEP MODE', 'waiting'); }
    });
    trackVisibility(autoscalePanel);
    render();
  }

  // Progressive enhancement guard: report a useful diagnostic when a mount is accidentally lost.
  const expectedMounts = ['architecture','arch-cloud','layers','failover','artifact','security','arch-iac','arch-containers','autoscale','arch-platform','metrics','trace','incident','technology','terminal','replay'];
  const missingMounts = expectedMounts.filter(key => !document.querySelector(`[data-anim-mount="${key}"]`));
  if (missingMounts.length && window.console && typeof window.console.warn === 'function') {
    window.console.warn('Animation mount points missing:', missingMounts.join(', '));
  }
})();
