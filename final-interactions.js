/* Final interaction layer for the Cloud & DevOps portfolio.
 * Adds architecture detail dialogs,
 * an honest stage navigator, accessible feedback, and touch refinements.
 * All data remains local to the browser; no external services are called.
 */
(() => {
  'use strict';

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.dataset.reduceMotion === 'true';
  const toast = document.getElementById('toast');
  let toastTimer = 0;
  /** Announce interaction results through the shared non-blocking status message. */
  const feedback = (message, level = 'info') => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.dataset.feedback = level;
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2400);
  };

  /* 01 — Expand each architecture card into a focused, zoomable flow view. */
  const flowExplanations = [
    [
      ['Client request', 'A browser or API client initiates a request using the public application endpoint.'],
      ['Public DNS and edge', 'DNS resolves the service name. The client then establishes a connection to the edge or load balancer.'],
      ['Web tier', 'The web tier terminates or forwards the request according to the selected ingress design.'],
      ['Application tier', 'Private application services validate and execute the business operation.'],
      ['Private data tier', 'The application accesses persistence through an explicitly permitted private path.']
    ],
    [
      ['Regional DNS / load balancer', 'A regional endpoint distributes requests using configured health checks and routing policy.'],
      ['Zone A application', 'One healthy application replica can receive a given request in availability zone A.'],
      ['Zone B application', 'A second replica provides capacity in a separate zone; traffic is not broadcast to both replicas.'],
      ['Managed database primary', 'The primary database accepts writes according to its service-specific consistency model.'],
      ['Standby / replica', 'Replication and failover behavior depend on the managed database engine and configuration.']
    ],
    [
      ['VPC / VNet boundary', 'The virtual network defines address space and the routing and security context.'],
      ['Public subnet', 'Internet-facing resources use an internet gateway and explicit route-table entries.'],
      ['Private application subnet', 'Application workloads use private addresses; outbound internet access may traverse NAT.'],
      ['Isolated data subnet', 'Data services have no direct public route and accept only specifically authorized sources.'],
      ['Policy and return path', 'Route tables, security groups and network ACLs must permit both directions as required.']
    ],
    [
      ['Reviewed source change', 'A pull request or commit enters the delivery workflow with a traceable revision.'],
      ['Continuous integration', 'Build checks, tests and static validation run before an artifact is promoted.'],
      ['Security gates', 'Dependency, source, infrastructure and image checks can block release on policy failure.'],
      ['Immutable artifact', 'The build publishes an artifact that can be identified by digest.'],
      ['Controlled deployment', 'The same artifact is promoted, health-checked and retained for rollback.']
    ],
    [
      ['Dockerfile', 'A declarative build recipe defines the image inputs and build steps.'],
      ['Image build', 'The builder creates an immutable image composed of layers.'],
      ['Registry', 'A registry stores and distributes the image by tag and digest.'],
      ['Container runtime', 'The engine creates an isolated container process from the selected image.'],
      ['Runtime dependencies', 'Networking, volumes, limits and secrets are attached through explicit runtime configuration.']
    ],
    [
      ['API server and etcd', 'The API server exposes the control-plane interface; etcd stores cluster state.'],
      ['Scheduler and controllers', 'The scheduler assigns pending Pods to eligible nodes while controllers reconcile desired state.'],
      ['Kubelet and node runtime', 'The node agent coordinates container execution through the configured runtime.'],
      ['Pods and readiness', 'Workload containers run in Pods; readiness determines normal Service endpoint eligibility.'],
      ['Service routing', 'A Service routes traffic to eligible endpoints, subject to the chosen networking implementation.']
    ],
    [
      ['Configuration and providers', 'Configuration describes resources and provider requirements. Initialization prepares providers and backend access.'],
      ['Dependency graph', 'Terraform derives resource ordering from references and explicit dependencies.'],
      ['Plan', 'The plan compares desired configuration with the state and observed remote objects.'],
      ['Human / policy review', 'Review replacements, deletes, sensitive values, permissions and policy results before approval.'],
      ['Apply and state update', 'Terraform calls provider APIs and records managed object state in the configured backend.']
    ],
    [
      ['Pull request and merge', 'A reviewed change updates the repository that represents desired state.'],
      ['GitOps controller', 'A controller observes the repository revision and renders the declared configuration.'],
      ['Diff and policy checks', 'The controller compares desired and observed state and evaluates configured sync rules.'],
      ['Reconciliation', 'Permitted changes are applied to move the cluster toward the declared state.'],
      ['Health and drift feedback', 'Controller health and drift status inform follow-up, rollback or remediation.']
    ],
    [
      ['Instrumented application', 'The application emits traces, metrics and logs with resource and request context.'],
      ['OpenTelemetry collector', 'The collector receives, processes and exports telemetry according to its pipeline configuration.'],
      ['Signal backends', 'Metrics, logs and traces are stored in systems suited to each signal.'],
      ['Correlation', 'Shared trace context and resource attributes make related telemetry discoverable.'],
      ['Dashboards and alerts', 'Dashboards summarize service behavior while alert rules route actionable conditions.']
    ],
    [
      ['Source and dependency checks', 'The pipeline inspects source and third-party dependencies for declared policy violations.'],
      ['Infrastructure policy', 'Infrastructure changes are evaluated against organizational rules before provisioning.'],
      ['Image and SBOM checks', 'The container image is scanned and its component inventory is generated.'],
      ['Provenance and signature', 'Build provenance and artifact signatures establish verifiable release metadata.'],
      ['Verification and runtime policy', 'Admission and runtime controls verify artifacts and enforce deployment policy.']
    ],
    [
      ['Client and gateway', 'A gateway applies routing and shared request controls at the service boundary.'],
      ['Service A / B / C', 'Independent services own bounded capabilities and communicate through synchronous or event-driven interfaces.'],
      ['Service-to-service calls', 'Timeouts, retries, authentication and circuit breakers govern remote dependencies.'],
      ['Events and queues', 'Asynchronous messages decouple producers and consumers but introduce delivery and ordering concerns.'],
      ['Independent data stores', 'Each service owns its persistence boundary; cross-service consistency requires explicit design.']
    ],
    [
      ['Primary region', 'The primary region serves normal workload traffic and owns the active service path.'],
      ['Replication and backups', 'Data and encrypted backups are copied according to the selected recovery design.'],
      ['Recovery region', 'A separate region retains the resources and data needed to restore service.'],
      ['Failover decision', 'An approved runbook validates the incident, data state, dependencies and cutover conditions.'],
      ['Recovery verification', 'Operators verify user-facing health, data consistency, RTO and RPO before declaring recovery.']
    ]
  ];

  /** Create dialog/interface nodes without parsing untrusted text as HTML. */
  const create = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const gallery = document.getElementById('architectureGalleryGrid');
  let lastArchitectureTrigger = null;
  let activeArchitectureVisual = null;
  let architectureZoom = 1;
  let architectureDialog = null;
  let architectureZoomReadout = null;
  let architectureStage = null;
  let architectureStatus = null;
  let architectureDrawButton = null;
  /** Build the architecture detail dialog once, then reuse it for all twelve patterns. */
  const ensureArchitectureDialog = () => {
    if (architectureDialog) return architectureDialog;
    architectureDialog = create('dialog', 'architecture-detail-dialog');
    architectureDialog.id = 'architectureDetailDialog';
    architectureDialog.setAttribute('aria-labelledby', 'architectureDetailTitle');
    architectureDialog.setAttribute('aria-describedby', 'architectureDetailSummary');
    const shell = create('div', 'architecture-detail-shell');
    const heading = create('header', 'architecture-detail-heading');
    const headingCopy = create('div');
    headingCopy.append(create('span', 'architecture-detail-kicker', 'ARCHITECTURE PATTERN / EXPANDED VIEW'));
    const title = create('h2', '', 'Architecture pattern');
    title.id = 'architectureDetailTitle';
    const summary = create('p', '', 'Inspect the conceptual flow and its engineering boundaries.');
    summary.id = 'architectureDetailSummary';
    headingCopy.append(title, summary);
    const close = create('button', 'icon-button architecture-detail-close', '×');
    close.type = 'button'; close.setAttribute('aria-label', 'Close architecture detail');
    heading.append(headingCopy, close);

    const content = create('div', 'architecture-detail-content');
    const visualPanel = create('section', 'architecture-detail-visual-panel');
    const toolbar = create('div', 'architecture-detail-toolbar');
    toolbar.append(create('span', 'architecture-detail-toolbar-label', 'DIAGRAM / ZOOM & DRAW'));
    const zoomGroup = create('div', 'architecture-detail-zoom');
    const zoomOut = create('button', 'architecture-detail-control', '−');
    zoomOut.type = 'button'; zoomOut.dataset.architectureZoom = 'out'; zoomOut.setAttribute('aria-label', 'Zoom diagram out');
    const zoomIn = create('button', 'architecture-detail-control', '+');
    zoomIn.type = 'button'; zoomIn.dataset.architectureZoom = 'in'; zoomIn.setAttribute('aria-label', 'Zoom diagram in');
    const zoomReset = create('button', 'architecture-detail-control', 'Fit');
    zoomReset.type = 'button'; zoomReset.dataset.architectureZoom = 'reset'; zoomReset.setAttribute('aria-label', 'Reset diagram zoom');
    architectureZoomReadout = create('output', '', '100%');
    zoomGroup.append(zoomOut, architectureZoomReadout, zoomIn, zoomReset);
    toolbar.append(zoomGroup);
    architectureStage = create('div', 'architecture-detail-stage');
    architectureStage.tabIndex = 0;
    architectureStage.setAttribute('role', 'region');
    architectureStage.setAttribute('aria-label', 'Scrollable architecture diagram');
    visualPanel.append(toolbar, architectureStage);

    const sequencePanel = create('section', 'architecture-detail-sequence-panel');
    sequencePanel.append(create('h3', '', 'How the flow works'));
    sequencePanel.append(create('p', '', 'Follow the numbered sequence. Arrows and trust boundaries depend on the selected pattern.'));
    const steps = create('ol', 'architecture-detail-steps');
    sequencePanel.append(steps);
    content.append(visualPanel, sequencePanel);

    const footer = create('footer', 'architecture-detail-footer');
    architectureStatus = create('span', 'architecture-detail-status', 'Conceptual reference · no live account connection');
    const footerActions = create('div');
    architectureDrawButton = create('button', 'architecture-detail-control', 'Draw flow');
    architectureDrawButton.type = 'button'; architectureDrawButton.dataset.architectureDraw = '';
    const done = create('button', 'architecture-detail-control', 'Done');
    done.type = 'button'; done.dataset.architectureClose = '';
    footerActions.append(architectureDrawButton, done);
    footer.append(architectureStatus, footerActions);
    shell.append(heading, content, footer);
    architectureDialog.append(shell);
    document.body.append(architectureDialog);

    close.addEventListener('click', () => architectureDialog.close());
    done.addEventListener('click', () => architectureDialog.close());
    architectureDialog.addEventListener('click', event => { if (event.target === architectureDialog) architectureDialog.close(); });
    architectureDialog.addEventListener('close', () => {
      architectureDialog.classList.remove('is-flow-drawing');
      if (lastArchitectureTrigger?.isConnected) lastArchitectureTrigger.focus({preventScroll: true});
    });
    zoomGroup.addEventListener('click', event => {
      const button = event.target.closest('[data-architecture-zoom]');
      if (!button || !activeArchitectureVisual) return;
      const action = button.dataset.architectureZoom;
      architectureZoom = action === 'reset' ? 1 : Math.max(.75, Math.min(1.5, architectureZoom + (action === 'in' ? .1 : -.1)));
      activeArchitectureVisual.style.transform = `scale(${architectureZoom.toFixed(2)})`;
      architectureZoomReadout.value = `${Math.round(architectureZoom * 100)}%`;
      architectureZoomReadout.textContent = architectureZoomReadout.value;
      zoomOut.disabled = architectureZoom <= .75;
      zoomIn.disabled = architectureZoom >= 1.5;
      architectureStatus.textContent = `Diagram zoom ${Math.round(architectureZoom * 100)}% · scroll to inspect on smaller screens.`;
    });
    architectureDrawButton.addEventListener('click', () => {
      if (!activeArchitectureVisual) return;
      architectureDialog.classList.remove('is-flow-drawing');
      if (reducedMotion()) {
        architectureStatus.textContent = 'Static flow displayed · reduced motion preference respected.';
        architectureDrawButton.textContent = 'Replay flow';
        return;
      }
      void architectureDialog.offsetWidth;
      architectureDialog.classList.add('is-flow-drawing');
      architectureStatus.textContent = 'Drawing the architecture sequence…';
      architectureDrawButton.disabled = true;
      architectureDrawButton.textContent = 'Drawing…';
      window.setTimeout(() => {
        if (!architectureDialog?.open) return;
        architectureDialog.classList.remove('is-flow-drawing');
        architectureDrawButton.disabled = false;
        architectureDrawButton.textContent = 'Replay flow';
        architectureStatus.textContent = 'Flow complete · conceptual reference.';
      }, 1700);
    });
    return architectureDialog;
  };

  /** Populate the dialog, preserve the invoking control, and expose the selected pattern. */
  const openArchitecture = (card, trigger) => {
    const index = [...gallery.querySelectorAll('.architecture-card')].indexOf(card);
    const dialog = ensureArchitectureDialog();
    const title = card.querySelector('h3')?.textContent?.trim() || 'Architecture pattern';
    const summary = card.querySelector(':scope > p')?.textContent?.trim() || 'Conceptual architecture pattern.';
    const note = card.querySelector('.architecture-pattern-note')?.textContent?.trim() || 'Review routing, identity, failure and data boundaries for the chosen implementation.';
    const titleNode = dialog.querySelector('#architectureDetailTitle');
    const summaryNode = dialog.querySelector('#architectureDetailSummary');
    titleNode.textContent = title;
    summaryNode.textContent = `${summary} ${note}`;
    architectureStage.replaceChildren();
    const visual = card.querySelector('.arch-visual')?.cloneNode(true);
    if (visual) {
      visual.classList.add('architecture-detail-visual');
      visual.setAttribute('role', 'img');
      visual.setAttribute('aria-label', card.querySelector('.arch-visual')?.getAttribute('aria-label') || `${title} conceptual diagram`);
      activeArchitectureVisual = visual;
      architectureStage.append(visual);
    }
    const sequencePanel = dialog.querySelector('.architecture-detail-steps');
    sequencePanel.replaceChildren();
    const steps = flowExplanations[index] || [['Review the system boundary', note]];
    steps.forEach(([name, detail]) => {
      const item = create('li');
      const copy = create('div');
      copy.append(create('strong', '', name), create('span', '', detail));
      item.append(copy);
      sequencePanel.append(item);
    });
    architectureZoom = 1;
    if (activeArchitectureVisual) activeArchitectureVisual.style.transform = 'scale(1)';
    architectureZoomReadout.value = '100%';
    architectureZoomReadout.textContent = '100%';
    dialog.querySelector('[data-architecture-zoom="out"]').disabled = false;
    dialog.querySelector('[data-architecture-zoom="in"]').disabled = false;
    architectureStatus.textContent = `Pattern ${String(index + 1).padStart(2, '0')} of 12 · Conceptual reference · no live account connection.`;
    architectureDrawButton.disabled = false;
    architectureDrawButton.textContent = 'Draw flow';
    lastArchitectureTrigger = trigger;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    dialog.querySelector('.architecture-detail-close')?.focus({preventScroll: true});
    feedback(`Opened architecture pattern: ${title}.`, 'success');
  };

  if (gallery) {
    [...gallery.querySelectorAll('.architecture-card')].forEach((card, index) => {
      const title = card.querySelector('h3')?.textContent?.trim() || `Architecture pattern ${index + 1}`;
      const actions = create('div', 'architecture-card-actions');
      const expand = create('button', 'architecture-expand-button', 'Expand diagram ↗');
      expand.type = 'button';
      expand.dataset.architectureExpand = String(index + 1);
      expand.setAttribute('aria-haspopup', 'dialog');
      expand.setAttribute('aria-label', `Expand ${title} and read its flow explanation`);
      expand.addEventListener('click', () => {
        expand.disabled = true;
        expand.setAttribute('aria-busy', 'true');
        expand.textContent = 'Opening…';
        window.requestAnimationFrame(() => {
          try { openArchitecture(card, expand); }
          catch (error) { feedback(`Could not open this diagram: ${error.message}`, 'error'); }
          finally { expand.disabled = false; expand.removeAttribute('aria-busy'); expand.textContent = 'Expand diagram ↗'; }
        });
      });
      actions.append(expand);
      const galleryControls = card.querySelector('.ea-gallery-controls');
      if (galleryControls) card.insertBefore(actions, galleryControls);
      else card.append(actions);
    });
  }

  /* 03 — Stage focus navigator; selection is a navigation aid, never a mastery score. */
  const roadmap = document.querySelector('.eng-roadmap');
  if (roadmap) {
    const stages = [...roadmap.querySelectorAll(':scope > li')];
    if (stages.length === 5) {
      const explorer = create('div', 'roadmap-stage-explorer');
      const header = create('div', 'roadmap-stage-explorer-head');
      const headerCopy = create('div');
      headerCopy.append(create('strong', '', 'LEARNING PATH / STAGE SELECTOR'), create('p', '', 'Choose a stage to inspect its readiness checkpoint. Selection is navigation only; it does not record completion or claim proficiency.'));
      header.append(headerCopy);
      const track = create('div', 'roadmap-stage-track');
      track.setAttribute('role', 'group');
      track.setAttribute('aria-label', 'Select a learning stage');
      const fill = create('span', 'roadmap-stage-track-fill');
      fill.setAttribute('aria-hidden', 'true');
      track.append(fill);
      const status = create('p', 'roadmap-stage-status');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.textContent = 'Selected focus: Stage 01 of 05. No completion is inferred.';
      explorer.append(header, track, status);
      roadmap.parentNode.insertBefore(explorer, roadmap);

      let selected = 0;
      const selectStage = (index, revealCheckpoint = false) => {
        selected = Math.max(0, Math.min(stages.length - 1, index));
        const currentTitle = stages[selected].querySelector('b')?.textContent?.trim() || `Stage ${selected + 1}`;
        roadmap.style.setProperty('--roadmap-progress', String(selected / (stages.length - 1)));
        stages.forEach((stage, stageIndex) => {
          const active = stageIndex === selected;
          stage.classList.toggle('is-stage-focused', active);
          const button = track.querySelector(`[data-roadmap-select="${stageIndex}"]`);
          button?.setAttribute('aria-pressed', String(active));
          if (active) button?.setAttribute('aria-current', 'step');
          else button?.removeAttribute('aria-current');
          const focusButton = stage.querySelector('.roadmap-focus-button');
          focusButton?.setAttribute('aria-pressed', String(active));
        });
        status.textContent = `Selected focus: Stage ${String(selected + 1).padStart(2,'0')} of 05 — ${currentTitle}. Selection only; no completion or proficiency is inferred.`;
        if (revealCheckpoint) {
          const details = stages[selected].querySelector('.eng-roadmap-checkpoint');
          if (details) details.open = true;
          stages[selected].scrollIntoView({behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest'});
          feedback(`Focused learning stage ${selected + 1}: ${currentTitle}.`, 'success');
        }
      };

      stages.forEach((stage, index) => {
        stage.dataset.roadmapStage = String(index + 1);
        const title = stage.querySelector('b')?.textContent?.trim() || `Stage ${index + 1}`;
        const select = create('button', 'roadmap-stage-select');
        select.type = 'button';
        select.dataset.roadmapSelect = String(index);
        select.setAttribute('aria-label', `Focus stage ${index + 1}: ${title}`);
        select.setAttribute('aria-pressed', String(index === 0));
        if (index === 0) select.setAttribute('aria-current', 'step');
        select.append(create('span', 'roadmap-stage-dot', String(index + 1).padStart(2,'0')));
        select.append(create('span', 'roadmap-stage-name', title));
        track.append(select);
        const focus = create('button', 'roadmap-focus-button', 'Inspect readiness ↗');
        focus.type = 'button';
        focus.setAttribute('aria-pressed', String(index === 0));
        focus.addEventListener('click', () => selectStage(index, true));
        stage.append(focus);
        select.addEventListener('click', () => selectStage(index, false));
      });
    }
  }

  /* 06 — Mobile graph ergonomics: make horizontal graph canvases discoverable by touch and keyboard. */
  /** Add discoverable keyboard/touch affordances to diagrams that must scroll on small screens. */
  const enhanceScrollableGraphs = () => {
    document.querySelectorAll('.ea-graph-wrap, .constellation-canvas, .architecture-detail-stage').forEach((region, index) => {
      if (region.dataset.panEnhanced === 'true') return;
      region.dataset.panEnhanced = 'true';
      if (!region.hasAttribute('tabindex')) region.tabIndex = 0;
      if (!region.hasAttribute('role')) region.setAttribute('role', 'region');
      if (!region.hasAttribute('aria-label')) region.setAttribute('aria-label', `Scrollable technical diagram ${index + 1}`);
      region.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        if (event.target !== region) return;
        event.preventDefault();
        region.scrollBy({left: event.key === 'ArrowRight' ? 90 : -90, behavior: reducedMotion() ? 'auto' : 'smooth'});
      });
    });
  };
  enhanceScrollableGraphs();
  const observer = new MutationObserver(() => enhanceScrollableGraphs());
  observer.observe(document.body, {childList: true, subtree: true});
  window.addEventListener('beforeunload', () => observer.disconnect(), {once: true});
})();
