#!/usr/bin/env python3
"""Parse the portfolio stylesheet and nested at-rules with tinycss2."""
from __future__ import annotations
import sys
from pathlib import Path

try:
    import tinycss2
except ImportError:
    print("ERROR: install the stylesheet-check dependency: python -m pip install tinycss2", file=sys.stderr)
    raise SystemExit(2)

ROOT = Path(__file__).resolve().parents[1]
CSS_FILE = ROOT / "styles.css"
RULE_CONTAINERS = {
    "media", "supports", "container", "layer", "keyframes", "-webkit-keyframes",
    "document", "scope", "starting-style",
}
errors = []


def walk_rules(nodes) -> None:
    for node in nodes:
        if node.type == "error":
            errors.append(node)
            continue
        if node.type == "qualified-rule":
            declarations = tinycss2.parse_declaration_list(node.content, skip_comments=True, skip_whitespace=True)
            errors.extend(item for item in declarations if item.type == "error")
        elif node.type == "at-rule" and node.content is not None:
            if node.lower_at_keyword in RULE_CONTAINERS:
                nested = tinycss2.parse_rule_list(node.content, skip_comments=True, skip_whitespace=True)
                walk_rules(nested)
            else:
                declarations = tinycss2.parse_declaration_list(node.content, skip_comments=True, skip_whitespace=True)
                errors.extend(item for item in declarations if item.type == "error")


try:
    source = CSS_FILE.read_text(encoding="utf-8")
except OSError as exc:
    print(f"ERROR: cannot read {CSS_FILE}: {exc}", file=sys.stderr)
    raise SystemExit(2)

rules = tinycss2.parse_stylesheet(source, skip_comments=True, skip_whitespace=True)
walk_rules(rules)
if errors:
    print(f"CSS check failed: {len(errors)} parser error(s)")
    for error in errors[:50]:
        print(f"  - {error}")
    raise SystemExit(1)
print(f"CSS check passed: {len(rules)} top-level nodes; no stylesheet/declaration parser errors.")
