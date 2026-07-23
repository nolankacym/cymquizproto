#!/usr/bin/env python3
"""Assemble the quiz into ONE self-contained HTML for a Claude Artifact.
Inlines React (prod), compiled app, CSS, fonts (woff2), and images (data URIs).
No network calls, no external hosts — CSP-safe."""
import base64, os, re

Q = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(Q, "build")

def read(p): return open(p, "r", encoding="utf-8").read()
def b64(p): return base64.b64encode(open(p, "rb").read()).decode("ascii")

# ---- assets -> data URIs ----
def data_svg(name): return "data:image/svg+xml;base64," + b64(os.path.join(Q, "assets", name))
def data_png(name): return "data:image/png;base64," + b64(os.path.join(B, name))

asset_map = {
    "assets/brandmark-green.svg": data_svg("brandmark-green.svg"),
    "assets/wordmark-dark.svg": data_svg("wordmark-dark.svg"),
    "assets/logo-white.svg": data_svg("logo-white.svg"),
    "assets/prod-creatine.png": data_png("prod-creatine.png"),
    "assets/prod-glutathione.png": data_png("prod-glutathione.png"),
    "assets/prod-vitaminc.png": data_png("prod-vitaminc.png"),
}

data_js = read(os.path.join(Q, "data.js"))
app_js = read(os.path.join(B, "app.compiled.js"))
for path, uri in asset_map.items():
    data_js = data_js.replace(path, uri)
    app_js = app_js.replace(path, uri)

# ---- fonts: minimal @font-face set (4 weights) as woff2 data URIs ----
FONT_WEIGHTS = [("35XLt", 400), ("45Lt", 450), ("55Rg", 500), ("65Md", 700)]
font_faces = "\n".join(
    "@font-face{font-family:'Neue Haas Grotesk Display Pro';font-style:normal;"
    f"font-weight:{w};font-display:swap;"
    f"src:url(data:font/woff2;base64,{b64(os.path.join(B, f'NHaas-{k}.woff2'))}) format('woff2');}}"
    for k, w in FONT_WEIGHTS
)

quiz_css = read(os.path.join(Q, "quiz.css"))
react_js = read(os.path.join(B, "react.min.js"))
react_dom_js = read(os.path.join(B, "react-dom.min.js"))

# Body-level content shared by both outputs.
body = f"""<style>
{font_faces}
{quiz_css}
</style>
<div id="root"></div>
<script>window.__ARTIFACT__ = true;</script>
<script>{react_js}</script>
<script>{react_dom_js}</script>
<script>{data_js}</script>
<script>{app_js}</script>
"""

# 1) Body-only — for the Claude Artifact tool (it adds its own <head>/viewport).
out_artifact = os.path.join(B, "quiz-artifact.html")
open(out_artifact, "w", encoding="utf-8").write(body)

# Optional Google Apps Script endpoint (GitHub Pages -> Google Sheet).
# Put the deployed Web app URL in quiz/sheet-endpoint.txt to enable capture.
endpoint_file = os.path.join(Q, "sheet-endpoint.txt")
endpoint = read(endpoint_file).strip() if os.path.exists(endpoint_file) else ""
endpoint_script = f'<script>window.__SHEET_ENDPOINT__ = {endpoint!r};</script>\n' if endpoint else ""

# 2) Full standalone document — for GitHub Pages / any static host.
#    MUST include <meta viewport> or mobile browsers render at desktop width.
standalone = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#163f35">
<title>Cymbiotika Wellness Quiz</title>
{endpoint_script}</head>
<body>
{body}</body>
</html>
"""
out_standalone = os.path.join(B, "quiz-standalone.html")
open(out_standalone, "w", encoding="utf-8").write(standalone)

print(f"wrote {out_artifact}  ({len(body)/1024:.0f} KB, body-only for Claude Artifact)")
print(f"wrote {out_standalone}  ({len(standalone)/1024:.0f} KB, full doc for GitHub Pages)")
for tag in ["window.__ARTIFACT__", "ReactDOM", "window.BASICS", "React.createElement", "@font-face"]:
    print(f"  contains {tag!r}:", tag in standalone)
print("  viewport meta present:", 'name="viewport"' in standalone)
print("  remaining bare 'assets/' refs:", standalone.count('assets/'))
