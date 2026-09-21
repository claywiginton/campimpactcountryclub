#!/usr/bin/env python3
"""Build the hosted (Claude Artifact) copy of the scorecard from index.html.

Artifacts supply their own <!doctype>/<head>/<body> skeleton, including the
charset and viewport meta, so the hosted page is index.html with that outer
wrapper stripped off. Everything else -- title, fonts, styles, markup, script
-- is shared, so there is only ever one source file to edit.

    python3 make-artifact.py [output.html]
"""
import re
import sys
import pathlib

SRC = pathlib.Path(__file__).parent / "index.html"
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "artifact.html")

html = SRC.read_text(encoding="utf-8")

# keep everything from <title> onward, minus the closing wrapper tags
start = html.index("<title>")
body = html[start:]
for tag in ("</head>", "<body>", "</body>", "</html>"):
    body = body.replace(tag, "")

# the skeleton declares charset and viewport; the icon and manifest links point
# at sibling files that only exist on the static host, so they go too
body = re.sub(r'^\s*<meta[^>]*>\s*$\n?', '', body, flags=re.M)
body = re.sub(r'^\s*<link rel="(icon|apple-touch-icon|manifest)"[^>]*>\s*$\n?', '', body, flags=re.M)

# the service worker caches sibling files that only exist on the static host
body = re.sub(r'<!-- offline:start -->.*?<!-- offline:end -->\n?', '', body, flags=re.S)
out.write_text(body.strip() + "\n", encoding="utf-8")
print(f"wrote {out} ({len(body.strip()):,} bytes)")
