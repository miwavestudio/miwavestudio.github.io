# Site Miwave Studio

Portfolio de Mathias Lopez — Miwave Studio. Site statique : aucun outil à installer.

## Voir le site
Double-cliquer sur `index.html`. Une connexion internet est nécessaire pour charger les polices (Unica One, Crimson Text).
Pour revoir la vidéo d'intro : bouton « Revoir l'intro » sur l'écran d'ouverture.

## Modifier les contenus
Tout se passe dans `js/data.js` :
- **Vidéos** : titre, type, texte court (FR et EN), lien YouTube. `tier: 1` = projet principal, `tier: 2` = second plan.
- **Design** : projets, textes et liste des images.
- **Textes de l'interface** en français et en anglais (bloc `i18n`), y compris la page À propos.

## Correspondance vidéos ↔ YouTube (à valider)
Les liens ont été attribués dans l'ordre du brief, face aux dossiers dans l'ordre alphabétique.
Vérifier chaque ligne en cliquant dessus, puis corriger `youtube:` dans `js/data.js` si besoin.

| Fichier | Lien attribué |
|---|---|
| Evolved Spider-Man 2069 | https://youtu.be/byx_XSMswno |
| F1 Ciao Team Project | https://youtu.be/d42BMnuPRTE |
| Hyōrin | https://youtu.be/M6bl8sK-6kQ |
| Spiritmania | https://youtu.be/yjccx1X7zAw |
| The PORTALS | https://youtu.be/PcVF7rt3xGc |
| Última Curva | https://youtu.be/3esMpodb0Bc |
| Volvo XC40 | https://youtu.be/2NfeCmAn33E |
| Trailer séminaire | https://youtu.be/ODuNqhtWhWw |
| Exemple 1 | https://youtu.be/vh4FpX3gWrs |
| Exemple 2 | https://youtu.be/rPaJSJ0u8nI |
| Exemple 3 | https://youtu.be/eIUSHfY6zuI |
| Exemple 4 | https://youtu.be/36qntWILhLQ |
| Exemple 5 | https://youtu.be/ylWAtWiwC4I |
| Exemple 6 | https://youtu.be/X__8Vs7Aep0 |

Le motion Miwave, Hypermotion et l'exemple de VFX n'ont pas de lien : ils se lisent directement sur le site.

## Brancher le formulaire de contact
Les deux adresses sont affichées sur la page Contact (modifiables dans `js/data.js`, bloc `contact`). L'envoi par le formulaire passe par Web3Forms :
1. Sur web3forms.com, créer une clé d'accès pour l'adresse des demandes professionnelles, et une autre pour l'adresse des demandes de création.
2. Coller les deux clés dans `js/data.js`, bloc `form.keys` (`pro` et `creation`).
Tant que les clés sont vides, le formulaire affiche qu'il n'est pas encore relié.

## Mettre en ligne sur GitHub Pages
1. Créer un dépôt et y déposer tout le contenu de ce dossier (avec `index.html` à la racine).
2. Dans Settings → Pages, choisir la branche `main` et le dossier `/ (root)`.

## Organisation
- `index.html` — la page (générée par `build.py` à partir de `src/body.html`)
- `css/style.css` — styles
- `js/space.js` — décor spatial en 3D (WebGL), `js/app.js` — voyage, galeries, contact
- `js/textures-inline.js` — copie des images du décor, utilisée seulement quand le site est ouvert par double-clic (généré par `build.py`)
- `assets/space/` — nébuleuses, planètes, astéroïdes ; `assets/logos/` — logos des projets affichés pendant le voyage
- `assets/` — vidéos compressées, images, logos

Après une modification de `src/body.html`, relancer `python3 build.py`. Les changements dans `css/` et `js/` sont pris en compte directement.
