# Theme-Aware Monochrome Card Refinement

Date: 2026-11-23

## What changed

Content cards use a shared monochrome palette that switches with the active theme. Dark mode uses charcoal surfaces with light ink; light mode uses white and light-gray surfaces with dark ink. Primary cards, inner cards, diagrams, data insets, text, and borders all derive from the same theme tokens so nested content does not remain dark after switching to light mode.

The opening hero/orbital profile and final contact/footer section retain their separately scoped visual treatment. Functional chart and diagram data encodings remain intact.

## Validation

The browser regression suite checks the computed theme-specific surface and ink colors, solid nested surfaces, absence of card gradients/shadows, protected footer treatment, and responsive overflow at 320, 390, 768, 1024, and 1440 CSS pixels.
