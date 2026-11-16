/* ============================================================
   MIWAVE STUDIO — contenus du site
   Tout ce qui est modifiable sans toucher au reste du code est ici :
   projets vidéo, liens YouTube, galeries de design, textes FR / EN
   et clés du formulaire de contact.
   ============================================================ */

window.MIWAVE = {

  /* ---------- Formulaire de contact (Web3Forms) ----------
     Les adresses e-mail ne sont jamais écrites dans le site.
     1. Aller sur web3forms.com et créer une clé d'accès pour chaque adresse.
     2. Coller chaque clé ci-dessous, entre les guillemets.
     Tant qu'une clé est vide, le formulaire prévient qu'il n'est pas encore branché. */
  /* vidéo du voyage HD : nombre de morceaux assets/video/voyage-hd.part0… (0 = utiliser voyage.mp4 en entier) */
  voyageParts: 5,
  form: {
    endpoint: 'https://api.web3forms.com/submit',
    keys: {
      pro: '87ec34b3-294c-48b5-8679-5617ff543cab',   // mathias.lopeznantes@gmail.com — demandes professionnelles (emploi, collaboration, partenariat)
      creation: 'cb7c7a05-0314-44f6-910b-047e6b819824'   // miwavestudio@gmail.com — demandes de création (projet vidéo, design)
    }
  },

  /* ---------- Adresses affichées sur la page Contact ---------- */
  contact: { creation: 'miwavestudio@gmail.com', pro: 'mathias.lopeznantes@gmail.com' },

  /* ---------- Lieux du voyage : où chaque projet est découvert (même ordre que les vidéos) ---------- */
  places: [
    { fr: 'la géante aux anneaux', en: 'the ringed giant' }, { fr: 'les anneaux de glace', en: 'the ice rings' }, { fr: 'la petite lune', en: 'the small moon' },
    { fr: 'les lunes jumelles', en: 'the twin moons' }, { fr: 'la lune aux cratères', en: 'the cratered moon' }, { fr: 'la planète rose', en: 'the pink planet' },
    { fr: 'le grand astéroïde', en: 'the great asteroid' }, { fr: 'la ceinture d\'astéroïdes', en: 'the asteroid belt' }, { fr: 'le cœur de la ceinture', en: 'the heart of the belt' },
    { fr: 'la planète bleue', en: 'the blue planet' }, { fr: 'l\'orbite bleue', en: 'the blue orbit' }, { fr: 'l\'astéroïde solitaire', en: 'the lone asteroid' },
    { fr: 'l\'impact', en: 'the impact' }, { fr: 'le nuage de poussière', en: 'the dust cloud' }, { fr: 'le lever de soleil', en: 'the sunrise' },
    { fr: 'la haute atmosphère', en: 'the upper atmosphere' }, { fr: 'la galaxie lointaine', en: 'the distant galaxy' }
  ],

  /* ---------- Projets vidéo ----------
     youtube : lien de la version complète ('' = la vidéo se lit sur le site).
     full    : fichier lu sur le site quand il n'y a pas de lien YouTube.
     tier    : 1 = projet principal, 2 = second plan (passage plus bref).
     logo    : image (assets/logos) affichée à la place du titre pendant le voyage.
     badge   : image (assets/logos) ajoutée au-dessus du titre ; badgeKind 'cover' = pochette carrée.
     ⚠ Correspondance fichiers ↔ liens YouTube à valider (ordre du brief). */
  videos: [
    { id: 'spiderman', tier: 1, title: 'Evolved Spider-Man 2069', logo: 'spiderman.webp', youtube: 'https://youtu.be/3esMpodb0Bc',
      fr: { kind: 'Court-métrage', text: 'Un héros réinventé pour 2069, entre néons et gratte-ciel.' },
      en: { kind: 'Short film', text: 'A hero reimagined for 2069, between neon lights and skyscrapers.' } },
    { id: 'f1-ciao', tier: 1, title: 'F1 Ciao Team Project', badge: 'ciao.svg', badgeAlt: 'Ciao Energy', youtube: 'https://youtu.be/yjccx1X7zAw',
      fr: { kind: 'Film de marque', text: 'La présentation d\'une écurie de Formule 1 imaginée de A à Z.' },
      en: { kind: 'Brand film', text: 'The reveal of a Formula 1 team imagined from scratch.' } },
    { id: 'motion', tier: 1, title: 'Miwave Studio', logo: '../img/logo.png', youtube: '', full: 'motion-full.mp4',
      fr: { kind: 'Motion design', text: 'Dream to screen : la signature de Miwave Studio en quinze secondes.' },
      en: { kind: 'Motion design', text: 'Dream to screen: the Miwave Studio signature in fifteen seconds.' } },
    { id: 'hyorin', tier: 1, title: 'Hyōrin', logo: 'hyorin.webp', youtube: 'https://youtu.be/d42BMnuPRTE',
      fr: { kind: 'Animation', text: 'Une séquence d\'anime originale, du personnage à la mise en scène.' },
      en: { kind: 'Animation', text: 'An original anime sequence, from character design to staging.' } },
    { id: 'spiritmania', tier: 1, title: 'Spiritmania', logo: 'spiritmania.webp', youtube: 'https://youtu.be/M6bl8sK-6kQ',
      fr: { kind: 'Univers fantastique', text: 'Une forêt d\'esprits lumineux, pensée comme un monde à explorer.' },
      en: { kind: 'Fantasy world', text: 'A forest of glowing spirits, built as a world to explore.' } },
    { id: 'portals', tier: 1, title: 'The PORTALS', logo: 'portals.webp', youtube: 'https://youtu.be/PcVF7rt3xGc',
      fr: { kind: 'Court-métrage VFX', text: 'Une rue ordinaire, un passage vers ailleurs.' },
      en: { kind: 'VFX short film', text: 'An ordinary street, a doorway to somewhere else.' } },
    { id: 'ultima-curva', tier: 1, title: 'Última Curva', badge: 'ultima-curva-cover.webp', badgeKind: 'cover', badgeAlt: 'Pochette Última Curva', youtube: 'https://youtu.be/2NfeCmAn33E',
      fr: { kind: 'Clip musical', text: 'Un clip pour célébrer l\'Espagne, championne du monde de football 2026.' },
      en: { kind: 'Music video', text: 'A music video celebrating Spain, 2026 football world champions.' } },
    { id: 'volvo', tier: 1, title: 'Volvo XC40', badge: 'volvo.webp', badgeKind: 'round', badgeAlt: 'Volvo', youtube: 'https://youtu.be/byx_XSMswno',
      fr: { kind: 'Publicité automobile', text: 'Un spot qui met en valeur les lignes et le caractère du XC40.' },
      en: { kind: 'Car commercial', text: 'A spot that shows off the lines and character of the XC40.' } },
    { id: 'hypermotion', tier: 1, title: 'Hypermotion', badge: 'ciao.svg', badgeAlt: 'Ciao Energy', youtube: '', full: 'hypermotion-full.mp4', vertical: true,
      fr: { kind: 'Publicité verticale', text: 'Montage nerveux et mouvements de caméra enchaînés pour Ciao.' },
      en: { kind: 'Vertical ad', text: 'Fast cutting and chained camera moves for Ciao.' } },
    { id: 'chibi-cook', tier: 1, title: 'Exemple de VFX', titleEn: 'VFX example', youtube: '', full: 'chibi-cook-full.mp4',
      fr: { kind: 'Effets visuels', text: 'Un personnage animé intégré dans une prise de vue réelle.' },
      en: { kind: 'Visual effects', text: 'An animated character composited into live-action footage.' } },

    { id: 'seminaire', tier: 2, title: 'Trailer séminaire', titleEn: 'Seminar trailer', youtube: 'https://youtu.be/rPaJSJ0u8nI',
      fr: { kind: 'Événementiel', text: 'La bande-annonce d\'un séminaire d\'entreprise.' },
      en: { kind: 'Event', text: 'The trailer for a company seminar.' } },
    { id: 'promo-1', tier: 2, title: 'Vidéo promotionnelle 1', titleEn: 'Promotional video 1', youtube: 'https://youtu.be/eIUSHfY6zuI',
      fr: { kind: 'Entreprise', text: 'Un film court pour promouvoir une agence immobilière, réalisé d\'après son brief.' },
      en: { kind: 'Corporate', text: 'A short film promoting a real estate agency, made to their brief.' } },
    { id: 'promo-2', tier: 2, title: 'Vidéo promotionnelle 2', titleEn: 'Promotional video 2', youtube: 'https://youtu.be/ODuNqhtWhWw',
      fr: { kind: 'Entreprise', text: 'Vidéo promotionnelle et portrait d\'un leader de l\'immobilier.' },
      en: { kind: 'Corporate', text: 'A promotional video and portrait of a real estate leader.' } },
    { id: 'promo-3', tier: 2, title: 'Vidéo promotionnelle 3', titleEn: 'Promotional video 3', youtube: 'https://youtu.be/36qntWILhLQ',
      fr: { kind: 'Entreprise', text: 'Une offre de formation expliquée en images.' },
      en: { kind: 'Corporate', text: 'A training offer explained in pictures.' } },
    { id: 'promo-4', tier: 2, title: 'Vidéo promotionnelle 4', titleEn: 'Promotional video 4', youtube: 'https://youtu.be/ylWAtWiwC4I',
      fr: { kind: 'Entreprise', text: 'Allier réalité et fiction pour dynamiser des offres de formation.' },
      en: { kind: 'Corporate', text: 'Blending reality and fiction to energise training offers.' } },
    { id: 'promo-5', tier: 2, title: 'Vidéo promotionnelle 5', titleEn: 'Promotional video 5', youtube: 'https://youtu.be/X__8Vs7Aep0',
      fr: { kind: 'Entreprise', text: 'Un savoir-faire technique mis en scène.' },
      en: { kind: 'Corporate', text: 'Technical know-how brought to the screen.' } },
    { id: 'promo-6', tier: 2, title: 'Vidéo promotionnelle 6', titleEn: 'Promotional video 6', youtube: 'https://youtu.be/vh4FpX3gWrs',
      fr: { kind: 'Entreprise', text: 'Un trailer tout en VFX pour annoncer un séminaire marquant.' },
      en: { kind: 'Corporate', text: 'An all-VFX trailer announcing a landmark seminar.' } }
  ],

  /* ---------- Design graphique ----------
     Chaque image existe en deux tailles dans assets/design :
     nom.webp (grande) et nom-t.webp (vignette). */
  design: [
    { id: 'hum', title: 'Hum… Café',
      fr: { kind: 'Identité de marque', text: 'Logo, déclinaisons, carte, affichage et réseaux pour un café-débat.' },
      en: { kind: 'Brand identity', text: 'Logo, variations, menu, posters and social media for a debate café.' },
      images: ['hum-cafe-hum-cafe-logo', 'hum-cafe-32', 'hum-cafe-33', 'hum-cafe-35', 'hum-cafe-affiche-murale-cafe-debat', 'hum-cafe-34', 'hum-cafe-carte-p2-p4', 'hum-cafe-mockup-1-carte', 'hum-cafe-compte-insta'] },
    { id: 'folle-journee', title: 'La Folle Journée',
      fr: { kind: 'Affiche de festival', text: 'Un voyage musical au Brésil : recherches, affiche finale et déclinaisons.' },
      en: { kind: 'Festival poster', text: 'A musical journey to Brazil: research, final poster and variations.' },
      images: ['la-folle-journee-affiche-folle-journee-finale', 'la-folle-journee-affiche-folle-journee-1ere-idee', 'la-folle-journee-idees-au-brouillons', 'la-folle-journee-image-pour-mockup-ordi', 'la-folle-journee-banniere-publicitaire-la-folle-journee'] },
    { id: 'nuit-du-cirque', title: 'La Nuit du Cirque',
      fr: { kind: 'Affiches', text: 'Deux propositions d\'affiche et leur mise en situation dans la rue.' },
      en: { kind: 'Posters', text: 'Two poster proposals and how they look out in the street.' },
      images: ['la-nuit-du-cirque-affiche-la-nuit-du-cirque-2025-mathias', 'la-nuit-du-cirque-affiche-2-la-nuit-du-cirque', 'la-nuit-du-cirque-mockup-la-nuit-du-cirque'] },
    { id: 'peaky-blinders', title: 'Peaky Blinders',
      fr: { kind: 'Mise en page éditoriale', text: 'Un journal de trois pages consacré à la série.' },
      en: { kind: 'Editorial layout', text: 'A three-page newspaper devoted to the series.' },
      images: ['peaky-blinders-journal-journal-peaky-blinders-mathias-page-1', 'peaky-blinders-journal-journal-peaky-blinders-mathias-page-2', 'peaky-blinders-journal-journal-peaky-blinders-mathias-page-3'] },
    { id: 'terras-gauda', title: 'Terras Gauda',
      fr: { kind: 'Affiche', text: 'Une affiche illustrée pour le domaine viticole.' },
      en: { kind: 'Poster', text: 'An illustrated poster for the wine estate.' },
      images: ['terras-gauda-terras-gauda-copie'] },
    { id: 'sport', title: 'Affiches sport', titleEn: 'Sports posters',
      fr: { kind: 'Projets personnels', text: 'Affiches de jour de match et portraits de joueurs.' },
      en: { kind: 'Personal projects', text: 'Matchday posters and player portraits.' },
      images: ['affiches-diverses-benfica-fcb-matchday-4-5', 'affiches-diverses-mci-rma-matchday-2-3', 'affiches-diverses-stuttgart-paris-sg-matchday-1-4', 'affiches-diverses-bvb-losc-matchday-1-1', 'affiches-diverses-marquinhos-player-rouge', '10-ousmane', 'vini-2-base-copie', 'affiche-liee-copie-3-grande'] },
    { id: 'musique', title: 'Affiches musique', titleEn: 'Music posters',
      fr: { kind: 'Projets personnels', text: 'Affiches de concert et visuels d\'artistes.' },
      en: { kind: 'Personal projects', text: 'Concert posters and artist visuals.' },
      images: ['ni-2-mai-2025-a3-copie', 'sdm-2024-vrai'] }
  ],

  /* ---------- Textes de l'interface ---------- */
  i18n: {
    fr: {
      'nav.voyage': 'Voyage', 'nav.videos': 'Vidéos', 'nav.design': 'Design', 'nav.about': 'À propos', 'nav.contact': 'Contact',
      'nav.label': 'Navigation principale', 'nav.replay': 'Revoir l\'intro',
      'lang.label': 'Langue du site',
      'intro.skip': 'Passer l\'intro', 'intro.sound.on': 'Activer le son', 'intro.sound.off': 'Couper le son',
      'hero.hint': 'Fais défiler pour décoller', 'hero.title': 'Embarque avec moi.',
      'hero.story': 'Un voyage à travers mes créations. Il te suffit de faire défiler : le vaisseau décolle, et chaque étoile filante te dévoile un projet.',
      'scr.videos': '17 fichiers', 'scr.design': '7 projets', 'scr.contact': 'réponse < 48 h', 'scr.power': 'Batterie', 'scr.hint': '[ clic ] ouvrir · [ esc ] retour', 'scr.back': 'Retour au cockpit', 'scr.zoom.videos': 'Écran Vidéos : zoomer', 'scr.zoom.design': 'Écran Design : zoomer', 'scr.zoom.about': 'Écran À propos : zoomer', 'scr.zoom.contact': 'Écran Contact : zoomer', 'card.found': 'Découvert près de',
      'hud.speed': 'Vitesse', 'hud.project': 'Projet', 'hud.prev': 'Projet précédent', 'hud.next': 'Projet suivant',
      'cta.youtube': 'Voir sur YouTube', 'cta.play': 'Lire la vidéo', 'cta.close': 'Fermer',
      'final.cta': 'Écrire à Miwave Studio', 'final.sub': 'Un projet vidéo, une identité, une idée à faire décoller ?',
      'videos.title': 'Vidéos', 'videos.lead': 'Toutes les créations vidéo, sans le voyage. Un clic ouvre la version complète.',
      'videos.main': 'Projets', 'videos.second': 'Commandes et formats courts',
      'design.title': 'Design', 'design.lead': 'Identités graphiques, affiches et mises en page. Un clic agrandit l\'image.',
      'design.prev': 'Image précédente', 'design.next': 'Image suivante',
      'about.title': 'À propos',
      'about.p1': 'Je m\'appelle Mathias Lopez. Sous le nom Miwave Studio, je donne à vos idées l\'attention qu\'elles méritent afin d\'en faire de véritables projets marquants pour vous, comme pour moi, dans la forme qui vous convient.',
      'about.do': 'Ce que je fais',
      'about.s1': 'Réalisation et montage vidéo', 'about.s2': 'Effets visuels et animation', 'about.s3': 'Publicité et films de marque',
      'about.s4': 'Identités graphiques', 'about.s5': 'Affiches et mises en page',
      'about.s6': 'Réalisation de sites internet et interfaces UI / UX', 'about.s7': 'Toutes sortes de projets créatifs',
      'about.cta': 'Parler d\'un projet',
      'contact.reply': 'Je réponds généralement sous 48 h, grand maximum.', 'mail.copy': 'Copier', 'mail.copied': 'Copié',
      'contact.title': 'Contact', 'contact.name': 'Mathias Lopez — Miwave Studio',
      'contact.lead': 'Avec des idées et de l\'ambition, tout devient possible. Partagez-nous votre projet et regardez-le prendre vie.',
      'form.name': 'Nom', 'form.email': 'Adresse e-mail', 'form.type': 'Type de demande',
      'form.type.pro': 'Demande professionnelle', 'form.type.pro.hint': 'Emploi, collaboration, partenariat',
      'form.type.creation': 'Demande de création', 'form.type.creation.hint': 'Projet vidéo, design',
      'form.message': 'Message', 'form.send': 'Envoyer le message', 'form.sending': 'Envoi en cours…',
      'form.sent': 'Message envoyé. Je vous réponds dès que possible.',
      'form.err.name': 'Indiquez votre nom.', 'form.err.email': 'Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.',
      'form.err.message': 'Écrivez quelques mots sur votre demande.',
      'form.err.send': 'Le message n\'est pas parti. Vérifiez votre connexion puis réessayez.',
      'form.err.config': 'Le formulaire n\'est pas encore relié à une boîte mail. Il reste à ajouter les clés d\'envoi dans js/data.js.',
      'footer.rights': 'Tous droits réservés.', 'skip': 'Aller au contenu'
    },
    en: {
      'nav.voyage': 'Journey', 'nav.videos': 'Videos', 'nav.design': 'Design', 'nav.about': 'About', 'nav.contact': 'Contact',
      'nav.label': 'Main navigation', 'nav.replay': 'Replay the intro',
      'lang.label': 'Site language',
      'intro.skip': 'Skip intro', 'intro.sound.on': 'Turn sound on', 'intro.sound.off': 'Turn sound off',
      'hero.hint': 'Scroll to take off', 'hero.title': 'Come aboard.',
      'hero.story': 'A journey through my work. Just scroll: the ship takes off, and every shooting star reveals a project.',
      'scr.videos': '17 files', 'scr.design': '7 projects', 'scr.contact': 'reply < 48 h', 'scr.power': 'Battery', 'scr.hint': '[ click ] open · [ esc ] back', 'scr.back': 'Back to cockpit', 'scr.zoom.videos': 'Videos screen: zoom in', 'scr.zoom.design': 'Design screen: zoom in', 'scr.zoom.about': 'About screen: zoom in', 'scr.zoom.contact': 'Contact screen: zoom in', 'card.found': 'Discovered near',
      'hud.speed': 'Speed', 'hud.project': 'Project', 'hud.prev': 'Previous project', 'hud.next': 'Next project',
      'cta.youtube': 'Watch on YouTube', 'cta.play': 'Play the video', 'cta.close': 'Close',
      'final.cta': 'Write to Miwave Studio', 'final.sub': 'A video project, an identity, an idea ready for take-off?',
      'videos.title': 'Videos', 'videos.lead': 'Every video, without the journey. One click opens the full version.',
      'videos.main': 'Projects', 'videos.second': 'Commissions and short formats',
      'design.title': 'Design', 'design.lead': 'Brand identities, posters and layouts. One click enlarges the image.',
      'design.prev': 'Previous image', 'design.next': 'Next image',
      'about.title': 'About',
      'about.p1': 'My name is Mathias Lopez. As Miwave Studio, I give your ideas the attention they deserve and turn them into projects that leave a mark, for you as much as for me, in whatever form suits you.',
      'about.do': 'What I do',
      'about.s1': 'Video direction and editing', 'about.s2': 'Visual effects and animation', 'about.s3': 'Commercials and brand films',
      'about.s4': 'Brand identities', 'about.s5': 'Posters and layouts',
      'about.s6': 'Websites and UI / UX interfaces', 'about.s7': 'All kinds of creative projects',
      'about.cta': 'Talk about a project',
      'contact.reply': 'I usually reply within 48 hours at most.', 'mail.copy': 'Copy', 'mail.copied': 'Copied',
      'contact.title': 'Contact', 'contact.name': 'Mathias Lopez — Miwave Studio',
      'contact.lead': 'With ideas and ambition, anything becomes possible. Tell us about your project and watch it come to life.',
      'form.name': 'Name', 'form.email': 'Email address', 'form.type': 'Type of request',
      'form.type.pro': 'Professional request', 'form.type.pro.hint': 'Job, collaboration, partnership',
      'form.type.creation': 'Creative request', 'form.type.creation.hint': 'Video project, design',
      'form.message': 'Message', 'form.send': 'Send the message', 'form.sending': 'Sending…',
      'form.sent': 'Message sent. I will get back to you as soon as possible.',
      'form.err.name': 'Enter your name.', 'form.err.email': 'Enter a valid email address, for example name@domain.com.',
      'form.err.message': 'Write a few words about your request.',
      'form.err.send': 'The message did not go through. Check your connection and try again.',
      'form.err.config': 'The form is not connected to a mailbox yet. The sending keys still need to be added in js/data.js.',
      'footer.rights': 'All rights reserved.', 'skip': 'Skip to content'
    }
  }
};
