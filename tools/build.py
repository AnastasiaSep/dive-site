#!/usr/bin/env python3
"""Build the site from src/ into two outputs:
   public/          — for your own hosting (images as files, JS in separate files for a strict CSP)
   dist/artifact.html — single self-contained file (images inlined) for the claude.ai preview.
Usage: python3 tools/build.py"""
import base64, pathlib, re
R = pathlib.Path(__file__).resolve().parent.parent
page = (R/"src/page.html").read_text()
js = (R/"src/app.js").read_text() + "\n" + (R/"src/backend.js").read_text()
IMGS = {"HERO": "hero", "ME": "me", "CEMSM": "site-cemetery-sm", "CEM": "site-cemetery", "MADSM": "site-madonna-sm", "MAD": "site-madonna"}

# 1) public/
title = re.search(r"<title>.*?</title>", page).group(0)
body = page.replace(title, "").replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
for k, v in IMGS.items(): body = body.replace(f"%%{k}%%", f"img/{v}.webp")
split = body.index('<header class="bar">')
html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#061217">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'none'; form-action 'self'">
{title}
<link rel="icon" href="data:,">
<meta property="og:title" content="Dive Nha Trang with Nastya">
<meta property="og:image" content="img/hero.webp">
<style>:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
{body[:split].strip()}
</head>
<body>
{body[split:].strip()}
<script src="config.js"></script>
<script src="app.js"></script>
</body>
</html>
'''
(R/"public/index.html").write_text(html)
(R/"public/app.js").write_text(js)

# 2) dist/artifact.html
art = page
for k, v in IMGS.items():
    data = base64.b64encode((R/f"public/img/{v}.webp").read_bytes()).decode()
    art = art.replace(f"%%{k}%%", "data:image/webp;base64," + data)
(R/"dist").mkdir(exist_ok=True)
(R/"dist/artifact.html").write_text(art + "\n<script>\n" + js + "</script>\n")
print("built public/ and dist/artifact.html")
