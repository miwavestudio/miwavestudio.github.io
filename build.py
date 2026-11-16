#!/usr/bin/env python3
"""Assemble index.html (site) et artifact.html (aperçu en une page) à partir de src/body.html."""
import pathlib, re
R = pathlib.Path(__file__).parent
body = (R/'src/body.html').read_text()
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Unica+One&family=VT323&display=swap">'
DESC = "Miwave Studio — Dream to screen. Portfolio de Mathias Lopez : créations vidéo et design graphique."
index = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Miwave Studio</title>
<meta name="description" content="{DESC}">
<meta name="theme-color" content="#000000">
<meta property="og:title" content="Miwave Studio — Dream to screen">
<meta property="og:description" content="{DESC}">
<meta property="og:image" content="assets/video/intro.jpg">
<link rel="icon" href="assets/img/logo-mark.png">
{FONTS}
<link rel="stylesheet" href="css/style.css">
</head>
<body>
{body}
<script src="js/data.js"></script>
<script src="js/route.js"></script>
<script src="js/space.js"></script>
<script src="js/app.js"></script>
</body>
</html>
'''
(R/'index.html').write_text(index)
css = (R/'css/style.css').read_text().replace('../assets/', 'assets/')
js = '\n'.join((R/'js'/n).read_text() for n in ('data.js', 'route.js', 'space.js', 'app.js'))
art = f'''<title>Miwave Studio</title>
<meta name="claude:viewport-fit-sides" content="cover">
{FONTS}
<style>
{css}
</style>
{body}
<script>
{js}
</script>
'''
(R/'artifact.html').write_text(art)
import base64, json
tex = {f.stem: 'data:image/webp;base64,' + base64.b64encode(f.read_bytes()).decode() for f in sorted((R/'assets/space').glob('*.webp'))}
(R/'js/textures-inline.js').write_text('/* Généré par build.py : textures du décor, intégrées pour ouvrir le site en local par double-clic. */\nwindow.MIWAVE_TEX = ' + json.dumps(tex) + ';\n')
print('ok', len(index), len(art))
