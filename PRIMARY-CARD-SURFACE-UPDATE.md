# Primary Card Surface Update

Date: 2026-11-21

## Requested design rule

All large / primary content cards use the exact solid background `#111111` in both dark and light themes. Primary card text and borders use light monochrome tokens so contrast remains clear when the site is in light mode.

## Nested card treatment

Inner cards are intentionally separated from the primary surface using flat solid fills:

- Primary card: `#111111`
- Raised inner card: `#191919`
- Recessed chart / data surface: `#0B0B0B`

Decorative inset bevels, card drop shadows, glow shadows, and gradient fills were removed from the affected primary and nested content-card surfaces. Borders remain to distinguish component boundaries. Functional chart strokes, gauges, SVG paths, and data encodings remain intact.

## Explicitly reviewed examples

- Reliability signals / `.sre-control-room`
- SLO Explorer / `.slo-workbench`
- SLO controls, results, metrics, and budget note
- Reliability metrics, chart panel, event timeline, and event stream
- Engineering review and evidence panels
- Technology matrix, topic cards, motion models, and other primary content cards

## Protected areas

- Opening hero and orbital profile
- Final full-connection contact/footer section
- `index.html` and all user-facing content / interaction logic

The source `index.html` is unchanged from the preceding Solid Monochrome Cards release.

## Validation

The browser regression suite checks exact computed primary color (`rgb(17, 17, 17)`), no gradient/image, no box shadow, foreground readability, nested card fills, footer preservation, and page overflow at 320, 390, 768, 1024, and 1440 CSS pixels.
