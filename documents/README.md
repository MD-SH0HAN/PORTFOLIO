# Portfolio document masters

Two print-ready HTML document masters are included:

- `documents/technical-portfolio-print.html` - five-page technical knowledge portfolio.
- `documents/one-page-profile-print.html` - concise recruiter-facing overview.

Both use Nunito as the only declared typeface. They load Nunito from Google Fonts when opened with an internet connection. To create the final PDFs, open each HTML file in a modern browser, wait for fonts to load, then Print -> Save as PDF (A4, scale 100%, background graphics enabled, headers/footers disabled).

The current static PDF in `assets/` is retained as a source reference because this export environment does not have the Nunito font file available locally; generating a PDF here would substitute another typeface and violate the single-font requirement.
