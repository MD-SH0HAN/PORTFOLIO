# Visual system and interaction notes — MD SHOHAN

**Current direction:** liquid icons · glassmorphism · monochrome palette · restrained glow  
**Positioning:** Bangladesh University student developing DevOps, Platform Engineering, and SRE skills  
**Updated:** 2026-11-04

## Design principles

1. **Monochrome first.** Use surface, border, opacity, typography, and spacing to establish hierarchy. Reserve semantic colors only where the meaning requires them.
2. **Liquid iconography.** Use custom inline SVG shapes inside softly rounded glass controls. Icons remain decorative when adjacent text provides the same meaning.
3. **Layered glass.** Keep a small number of surface levels—page background, glass panel, elevated panel, and featured glass surface—rather than giving every element the same blur and border.
4. **Restrained glow.** Keep glow close to focal objects and selected states. Large decorative effects must not reduce text contrast or obscure controls.
5. **Respectful motion.** Existing orbit, reveal, and diagram transitions remain subtle. Respect `prefers-reduced-motion` automatically and pause selected offscreen motion without adding a manual pause button.
6. **Evidence over decoration.** Use real repository evidence for the local observability architecture; label abstract models, planned work, and synthetic chart data explicitly.

## Responsive behavior

The portfolio has a compact mobile header with dedicated controls for the command palette, theme, and navigation. The command palette becomes a labelled icon control on narrow widths. The secondary brand caption is hidden on small phone widths so the header controls remain inside the viewport. There is no manual animation-pause button; operating-system reduced-motion preferences are respected automatically, and selected offscreen motion is paused for efficiency.

New learning snapshot, source-based lab architecture, metrics cards, chart inspector, graph filters, and the branded 404 page share the same glass and monochrome tokens as the original site.

## Chart interaction

The synthetic metrics gallery contains nine coordinated charts: request rate, error ratio, latency percentiles, error budget remaining, CPU and memory utilization, HTTP 4xx/5xx response rates, successful request ratio, deployment outcomes, and recovery-drill duration. It supports 1-hour, 6-hour, and 24-hour sample windows. Hovering or keyboard-focusing any chart moves a synchronized crosshair across the gallery and updates a readout for all sample signals. The chart inspector supports arrow keys, Home, and End. A 15-column data table provides an additional non-visual alternative.

The data is static and deterministic; the gallery is not connected to Prometheus or a live API. Deployment and recovery values are illustrative scenarios, not measured DORA metrics or MTTR.

## Keep future additions consistent

- Add project screenshots only after the corresponding project exists and is safe to publish.
- Add a CV only when the owner is ready to publish it.
- Keep future project cards labelled `Planned` until a reproducible implementation is included.
- Prefer source-based diagrams over illustrative diagrams when describing the existing local lab.
- Do not use synthetic values as production performance claims.
