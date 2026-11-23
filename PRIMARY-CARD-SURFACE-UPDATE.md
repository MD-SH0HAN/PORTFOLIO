# Theme-Aware Primary Card Surfaces

Date: 2026-11-23

## Theme behavior

Every primary content card, nested panel, chart/data inset, and associated text/border token follows the active document theme.

- Dark mode: dark charcoal primary surfaces, darker inset data areas, light foreground text, and subtle light borders.
- Light mode: white/light-gray primary surfaces, light-gray inset data areas, dark foreground text, and subtle dark borders.
- Hover and selected states retain a clear monochrome distinction in both themes.

The surface system is token-driven from `html[data-theme]`; card components do not hardcode a dark fill or light-only foreground.

## Protected areas

- Opening hero and orbital profile.
- Final full-connection contact/footer area, which retains its own theme-aware surface rules.
- Functional chart strokes, gauges, SVG paths, data encodings, and interactive states.

## Validation

The browser regression suite checks theme-matched primary fills and text, solid nested surface tiers, no card gradients or shadows, footer preservation, and no horizontal page overflow at 320, 390, 768, 1024, and 1440 CSS pixels.
