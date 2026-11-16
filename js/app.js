/* Miwave Studio — navigation, voyage au scroll, constellation, galeries, contact. */
(function () {
  'use strict';
  var M = window.MIWAVE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } }
  };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var outCubic = function (t) { return 1 - Math.pow(1 - t, 3); };
  var inOutCubic = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  var ICON = {
    out: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16L18 6M10 6h8v8"/></svg>',
    play: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>'
  };

  var ROUTES = ['voyage', 'videos', 'design', 'a-propos', 'contact'];
  var lang = store.get('miwave_lang') === 'en' ? 'en' : 'fr';
  var rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var route = 'voyage';
  var voyageScroll = 0;
  var t = function (k) { return (M.i18n[lang] && M.i18n[lang][k]) || M.i18n.fr[k] || k; };
  var titleOf = function (o) { return lang === 'en' && o.titleEn ? o.titleEn : o.title; };

  /* ================= Langue ================= */
  function applyLang() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(function (n) { n.textContent = t(n.getAttribute('data-i18n')); });
    $$('[data-i18n-aria]').forEach(function (n) { n.setAttribute('aria-label', t(n.getAttribute('data-i18n-aria'))); });
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    syncSoundLabel(); syncAboutSound();
    renderVideos(); renderDesign(); buildCards(); renderMails(); setTitle();
  }
  $$('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { lang = b.getAttribute('data-lang'); store.set('miwave_lang', lang); applyLang(); });
  });

  /* ================= Routes ================= */
  function setTitle() {
    var names = { voyage: '', videos: t('nav.videos'), design: t('nav.design'), 'a-propos': t('nav.about'), contact: t('nav.contact') };
    document.title = (names[route] ? names[route] + ' — ' : '') + 'Miwave Studio';
  }
  function go() {
    var h = (window.location.hash || '').replace('#', '');
    var next = ROUTES.indexOf(h) >= 0 ? h : 'voyage';
    if (route === 'voyage' && next !== 'voyage') voyageScroll = window.scrollY;
    route = next;
    document.body.setAttribute('data-route', route);
    $$('.view').forEach(function (v) { v.hidden = v.getAttribute('data-view') !== route; });
    $$('[data-route]').forEach(function (a) { if (a.tagName === 'A') { if (a.getAttribute('data-route') === route) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); } });
    window.scrollTo(0, route === 'voyage' ? voyageScroll : 0);
    setTitle();
    if (route === 'voyage') voyage.wake(); else voyage.sleep();
    aboutPlay(route === 'a-propos');
  }
  window.addEventListener('hashchange', go);

  /* ================= Visionneuses ================= */
  var player = $('#player'), playerVideo = $('#player-video');
  var viewer = $('#viewer'), viewerImg = $('#viewer-img'), viewerCap = $('#viewer-cap');
  var viewerSet = [], viewerAt = 0;
  function openPlayer(file, poster) {
    playerVideo.poster = poster || '';
    playerVideo.src = 'assets/video/' + file;
    if (player.showModal) player.showModal(); else player.setAttribute('open', '');
    var p = playerVideo.play(); if (p && p.catch) p.catch(function () {});
  }
  function closeBox(d) { if (d.close) d.close(); else d.removeAttribute('open'); }
  player.addEventListener('close', function () { playerVideo.pause(); playerVideo.removeAttribute('src'); playerVideo.load(); });
  function showShot(i) {
    viewerAt = (i + viewerSet.length) % viewerSet.length;
    var s = viewerSet[viewerAt];
    viewerImg.src = 'assets/design/' + s.name + '.webp';
    viewerImg.alt = s.title + ' — ' + (viewerAt + 1) + ' / ' + viewerSet.length;
    viewerCap.textContent = s.title + '  ' + (viewerAt + 1) + ' / ' + viewerSet.length;
    var many = viewerSet.length > 1; $('#viewer-prev').hidden = !many; $('#viewer-next').hidden = !many;
  }
  function openViewer(set, i) { viewerSet = set; showShot(i); if (viewer.showModal) viewer.showModal(); else viewer.setAttribute('open', ''); }
  $('#viewer-prev').addEventListener('click', function () { showShot(viewerAt - 1); });
  $('#viewer-next').addEventListener('click', function () { showShot(viewerAt + 1); });
  viewer.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') showShot(viewerAt - 1);
    if (e.key === 'ArrowRight') showShot(viewerAt + 1);
  });
  [player, viewer].forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-close]')) closeBox(d); });
  });

  /* ================= Liens / boutons projet ================= */
  function projectNode(v, cls) {
    var n;
    if (v.youtube) { n = el('a', cls); n.href = v.youtube; n.target = '_blank'; n.rel = 'noopener'; }
    else { n = el('button', cls); n.type = 'button'; n.addEventListener('click', function () { openPlayer(v.full, 'assets/video/' + v.id + '.jpg'); }); }
    return n;
  }
  function previewVideo(v) {
    var vid = document.createElement('video');
    vid.muted = true; vid.loop = true; vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.setAttribute('muted', '');
    vid.preload = 'auto'; vid.setAttribute('aria-hidden', 'true'); vid.tabIndex = -1;
    vid.src = 'assets/video/' + v.id + '.mp4';
    vid.addEventListener('playing', function () { vid.classList.add('is-ready'); });
    return vid;
  }

  /* ================= Page Vidéos ================= */
  function tile(v) {
    var n = projectNode(v, 'tile');
    var media = el('span', 'tile__media');
    var img = el('img'); img.src = 'assets/video/' + v.id + '.jpg'; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
    media.appendChild(img);
    var badge = el('span', 'tile__play'); badge.innerHTML = v.youtube ? ICON.out : ICON.play; media.appendChild(badge);
    n.appendChild(media);
    n.appendChild(el('span', 'tile__title', titleOf(v)));
    var meta = el('span', 'tile__meta'); meta.appendChild(el('i', '', v[lang].kind + '. ')); meta.appendChild(document.createTextNode(v[lang].text));
    n.appendChild(meta);
    n.setAttribute('aria-label', titleOf(v) + ' — ' + (v.youtube ? t('cta.youtube') : t('cta.play')));
    var vid = null;
    n.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || rmq.matches) return;
      if (!vid) { vid = previewVideo(v); media.insertBefore(vid, badge); }
      var p = vid.play(); if (p && p.catch) p.catch(function () {});
    });
    n.addEventListener('pointerleave', function () { if (vid) { vid.pause(); vid.classList.remove('is-ready'); } });
    return n;
  }
  function renderVideos() {
    var a = $('#grid-main'), b = $('#grid-second'), c = $('#calm-grid');
    a.textContent = ''; b.textContent = ''; c.textContent = '';
    M.videos.forEach(function (v) { (v.tier === 1 ? a : b).appendChild(tile(v)); c.appendChild(tile(v)); });
  }

  /* ================= Page Design ================= */
  function renderDesign() {
    var root = $('#design-list'); root.textContent = '';
    M.design.forEach(function (p) {
      var sec = el('section', 'dproj');
      var head = el('div', 'dproj__head');
      head.appendChild(el('h2', 'sub', titleOf(p)));
      var d = el('p'); d.appendChild(el('i', '', p[lang].kind + '. ')); d.appendChild(document.createTextNode(p[lang].text)); head.appendChild(d);
      sec.appendChild(head);
      var m = el('div', 'masonry');
      var set = p.images.map(function (name) { return { name: name, title: titleOf(p) }; });
      p.images.forEach(function (name, i) {
        var b = el('button', 'shot'); b.type = 'button';
        b.setAttribute('aria-label', titleOf(p) + ' — ' + (i + 1) + ' / ' + p.images.length);
        var img = el('img'); img.src = 'assets/design/' + name + '-t.webp'; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
        b.appendChild(img); b.addEventListener('click', function () { openViewer(set, i); });
        m.appendChild(b);
      });
      sec.appendChild(m); root.appendChild(sec);
    });
  }

  /* ================= Voyage ================= */
  var stage = $('#stage'), voyageEl = $('#view-voyage'), flyby = $('#flyby'), cometsEl = $('#comets');
  var opening = $('#opening'), finalEl = $('#final'), cockpit = $('#cockpit'), hud = $('#hud');
  var handL = $('#hand-l'), handR = $('#hand-r'), fxEl = $('#fx'), lever = $('#lever'), holo = $('#holo'), holoVal = $('#holo-val'), holoCells = $$('#holo .holo__bat i'), dash = $('#dash'), kDash = 1, zoomed = null, zoomLock = false, zoomTimer = 0, zoomY = 0, lastLv = -1;
  var hudSpeed = $('#hud-speed'), hudCount = $('#hud-count'), reticle = $('.hud__reticle'), pagerFill = $('#pager-fill');
  var constCanvas = $('#constellation'), cctx = constCanvas.getContext('2d');
  var items = [], uF = 0, FLEN = 2.6, uEnd = 1, K = 9;
  var space = null, path = [], worldObjects = [], skyObjects = [];
  var outBack = function (x) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

  function camAt(u) {
    var off = 0;
    for (var i = 0; i < items.length; i++) { var x = clamp((u - items[i].c) / items[i].w, -1, 1); off += 0.74 * items[i].w * (x * (1.5 - 0.5 * x * x)); }
    return K * (u - off);
  }
  /* trajectoire latérale : interpolation douce entre les points de passage */
  function pathAt(u) {
    if (!path.length) return [0, 0];
    if (u <= path[0][0]) return [path[0][1], path[0][2]];
    for (var i = 0; i < path.length - 1; i++) {
      var a = path[i], b = path[i + 1];
      if (u <= b[0]) { var k = (u - a[0]) / (b[0] - a[0]); k = k * k * (3 - 2 * k); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }
    }
    var l = path[path.length - 1]; return [l[1], l[2]];
  }

  (function layout() {
    var u = 0.85;
    /* comment chaque projet se révèle : capsule sortie d'un astre de la vidéo (p), étoile filante venue du bord (c),
       pluie de trois étoiles filantes (s), ou éjecté par l'impact (b) — avec le point d'origine dans l'image de la vidéo */
    var REVEAL = [['p', 0.40, 0.45], ['c', 0.62, 0.55], ['p', 0.50, 0.42], ['s', 0.55, 0.43], ['p', 0.74, 0.40], ['p', 0.08, 0.45], ['p', 0.25, 0.45], ['c', 0.75, 0.45], ['s', 0.48, 0.45],
      ['p', 0.48, 0.52], ['c', 0.48, 0.45], ['p', 0.48, 0.45], ['b', 0.47, 0.42], ['b', 0.45, 0.50], ['p', 0.38, 0.50], ['c', 0.33, 0.52], ['p', 0.43, 0.25]];
    M.videos.forEach(function (v, i) {
      var w = v.tier === 1 ? 0.5 : 0.3;
      items.push({ v: v, c: u + w, w: w, side: i % 2 ? -1 : 1, kind: (REVEAL[i] || ['c'])[0], ox: (REVEAL[i] || [0, 0.5])[1], oy: (REVEAL[i] || [0, 0, 0.4])[2], idx: i, card: null, comet: null, vid: null, shown: false, live: false });
      u += 2 * w;
    });
    uF = u + 0.2; uEnd = uF + FLEN;
    voyageEl.style.setProperty('--len', (uEnd + 1).toFixed(3));

    /* ---- décor placé le long du trajet ---- */
    var seed = 4242, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var c = function (i) { return items[Math.min(i, items.length - 1)].c; };
    var wp = [[0, 0, 0]];
    function planet(i, tex, side, x, y, r, dz, extra) {
      var o = { tex: tex, x: side * x, y: y, r: r, z: camAt(c(i)) + dz }; if (extra) for (var k in extra) o[k] = extra[k];
      worldObjects.push(o); wp.push([c(i) - 0.55, -side * 0.25, 0]); wp.push([c(i), -side * 1.0, -0.12]); wp.push([c(i) + 0.5, -side * 0.3, 0]);
    }
    planet(1, 'saturn', -1, 4.3, 1.25, 4.2, 3.6, { rot: 0.12 });
    planet(3, 'ember', 1, 4.4, 0.9, 2.1, 3.3);
    worldObjects.push({ tex: 'moon', x: 2.1, y: 2.0, r: 0.4, z: camAt(c(3)) + 2.3 });
    // champ d'astéroïdes : slalom entre les rochers
    var uA = c(4) + 0.25, uB = c(6) + 0.2, zA = camAt(uA), zB = camAt(uB), n = 26, j;
    for (j = 0; j < n; j++) {
      var zz = lerp(zA, zB, (j + rnd() * 0.8) / n), sd = j % 2 ? 1 : -1;
      worldObjects.push({ tex: 'rock' + (1 + j % 3), rock: true, x: sd * (1.7 + rnd() * 4.4), y: -0.4 + rnd() * 3.0, r: 0.16 + rnd() * rnd() * 0.62, z: zz, rot: rnd() * 6.28, spin: (rnd() - 0.5) * 0.5 });
    }
    for (var uu = uA + 0.1, sgn = 1; uu < uB; uu += 0.42, sgn = -sgn) wp.push([uu, sgn * 1.55, sgn * 0.25]);
    wp.push([uB + 0.3, 0, 0]);
    // la météorite que l'on frôle
    var uN = c(5) + 0.62; worldObjects.push({ tex: 'rock2', rock: true, x: pathAt0(wp, uN)[0] + 0.5, y: 0.38, r: 0.5, z: camAt(uN), rot: 1.2, spin: 0.9 });
    planet(7, 'giant', -1, 4.9, 1.5, 3.3, 3.5);
    planet(9, 'ice', 1, 4.3, 1.1, 2.3, 3.3);
    worldObjects.push({ tex: 'moon', x: 1.7, y: 2.3, r: 0.3, z: camAt(c(9)) + 2.0, rot: 2 });
    // seconde partie : rochers épars, puis une dernière géante
    for (j = 0; j < 12; j++) { var u2 = lerp(c(10), c(13), rnd()), s2 = rnd() < 0.5 ? -1 : 1; worldObjects.push({ tex: 'rock' + (1 + j % 3), rock: true, x: s2 * (2.0 + rnd() * 5), y: rnd() * 3.2, r: 0.2 + rnd() * 0.6, z: camAt(u2) + rnd() * 2, rot: rnd() * 6.28, spin: (rnd() - 0.5) * 0.6 }); }
    for (j = 10; j < items.length; j++) wp.push([c(j), (j % 2 ? 1 : -1) * 0.8, 0]);
    planet(14, 'saturn', 1, 5.2, 1.6, 3.4, 3.6, { rot: -0.5 });
    wp.push([uF, 0, 0]);
    wp.sort(function (a, b) { return a[0] - b[0]; }); path = wp;
    var yawEnd = 0.5 + 0.02 * uEnd;
    skyObjects = [
      { tex: 'sun', u: 0.613, v: 0.39, r: 0.46, add: true, gain: 1.25 },
      { tex: 'galaxy2', u: 0.71, v: 0.44, r: 0.22, add: true, gain: 1.7, rot: 0.3 },
      { tex: 'galaxy1', u: 0.80, v: 0.41, r: 0.36, add: true, gain: 1.6 },
      { tex: 'ice', u: 0.665, v: 0.36, r: 0.045 },
      { tex: 'galaxy1', u: yawEnd - 0.115, v: 0.47, r: 0.55, add: true, gain: 1.5, boost: true, rot: 1.1 },
      { tex: 'galaxy2', u: yawEnd + 0.12, v: 0.42, r: 0.4, add: true, gain: 1.4, boost: true, rot: -0.4 }
    ];
    function pathAt0(w, u0) { var saved = path; path = w.slice().sort(function (a, b) { return a[0] - b[0]; }); var r0 = pathAt(u0); path = saved; return r0; }
  })();

  function buildCards() {
    flyby.textContent = ''; cometsEl.textContent = ''; fxEl.textContent = '';
    items.forEach(function (it) {
      var v = it.v;
      var card = projectNode(v, 'card' + (v.tier === 2 ? ' card--t2' : '') + (v.vertical ? ' card--v' : ''));
      card.tabIndex = -1;
      var media = el('span', 'card__media');
      var img = el('img'); img.src = 'assets/video/' + v.id + '.jpg'; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      media.appendChild(img); card.appendChild(media);
      var body = el('span', 'card__body');
      if (v.badge) { var bd = el('img', 'card__badge' + (v.badgeKind ? ' card__badge--' + v.badgeKind : '')); bd.src = 'assets/logos/' + v.badge; bd.alt = v.badgeAlt || ''; bd.decoding = 'async'; body.appendChild(bd); }
      var pl = M.places && M.places[it.idx]; if (pl) body.appendChild(el('span', 'card__place', t('card.found') + ' ' + pl[lang]));
      body.appendChild(el('span', 'card__kind', v[lang].kind));
      var h;
      if (v.logo) { h = el('span', 'card__title card__title--logo'); var lg = el('img'); lg.src = 'assets/logos/' + v.logo; lg.alt = titleOf(v); lg.decoding = 'async'; h.appendChild(lg); }
      else h = el('span', 'card__title', titleOf(v));
      h.setAttribute('role', 'heading'); h.setAttribute('aria-level', '2'); body.appendChild(h);
      body.appendChild(el('span', 'card__text', v[lang].text));
      var cta = el('span', 'card__cta'); cta.innerHTML = (v.youtube ? ICON.out : ICON.play); cta.appendChild(document.createTextNode(v.youtube ? t('cta.youtube') : t('cta.play')));
      body.appendChild(cta); card.appendChild(body);
      flyby.appendChild(card);
      it.comets = [0, 1, 2].map(function () { var cm = el('i', 'comet'); cometsEl.appendChild(cm); return cm; });
      it.ping = el('i', 'ping'); fxEl.appendChild(it.ping); it.burst = el('i', 'burst'); fxEl.appendChild(it.burst);
      it.card = card; it.media = media; it.vid = null; it.shown = false; it.live = false;
    });
  }

  /* Constellation « Work with me! » */
  var glyph = null, stars = [], links = [], constW = 0, constH = 0, constDpr = 1;
  function buildConstellation() {
    var W = stage.clientWidth, H = stage.clientHeight; if (!W || !H) return;
    constDpr = Math.min(window.devicePixelRatio || 1, 2);
    constCanvas.width = Math.round(W * constDpr); constCanvas.height = Math.round(H * constDpr);
    constW = W; constH = H;
    var text = 'Work with me!', narrow = W < 700;
    var lines = narrow ? ['Work', 'with me!'] : [text];
    var off = document.createElement('canvas'), o = off.getContext('2d');
    var boxW = Math.min(W * (narrow ? 0.88 : 0.84), 1320);
    var fs = 200; o.font = fs + 'px "Unica One", "Arial Narrow", Arial, sans-serif';
    var widest = Math.max.apply(null, lines.map(function (l) { return o.measureText(l).width; }));
    fs = Math.floor(fs * boxW / widest); fs = Math.min(fs, H * (narrow ? 0.17 : 0.3));
    var lh = fs * 0.98; off.width = Math.ceil(boxW + 40); off.height = Math.ceil(lh * lines.length + 40);
    o.font = fs + 'px "Unica One", "Arial Narrow", Arial, sans-serif'; o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillStyle = '#fff';
    lines.forEach(function (l, i) { o.fillText(l, off.width / 2, 20 + lh * (i + 0.5)); });
    var data = o.getImageData(0, 0, off.width, off.height).data;
    var step = Math.max(6, fs / (narrow ? 11 : 14)), seed = 11;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var ox = (W - off.width) / 2, oy = H * (narrow ? 0.3 : 0.29) - off.height / 2;
    glyph = { lines: lines, fs: fs, lh: lh, cx: W / 2, y0: oy + 20, cy: oy + off.height / 2, w: boxW };
    stars = [];
    for (var y = step / 2; y < off.height; y += step) {
      for (var x = step / 2; x < off.width; x += step) {
        var jx = x + (rnd() - 0.5) * step * 0.55, jy = y + (rnd() - 0.5) * step * 0.55;
        var px = clamp(Math.round(jx), 0, off.width - 1), py = clamp(Math.round(jy), 0, off.height - 1);
        if (data[(py * off.width + px) * 4 + 3] > 140) {
          var s = { tx: ox + jx, ty: oy + jy, d: rnd() * 0.3, r: 0.7 + rnd() * 1.0 + (rnd() < 0.08 ? 1.7 : 0), ph: rnd() * 6.28, back: rnd() < 0.42 };
          if (s.back) { // arrive de derrière nous : part d'un bord de l'écran, très proche, puis s'éloigne
            var e = rnd(), m = 0.12 + rnd() * 0.3;
            if (e < 0.5) { s.sx = W * (-0.1 + rnd() * 1.2); s.sy = H * (1 + m); } else if (e < 0.75) { s.sx = -W * m; s.sy = H * (0.2 + rnd() * 0.9); } else { s.sx = W * (1 + m); s.sy = H * (0.2 + rnd() * 0.9); }
            s.d = 0.18 + rnd() * 0.34; s.big = 5 + rnd() * 6;
          } else { var ang = rnd() * Math.PI * 2, far = 0.5 + rnd() * 0.7; s.sx = W / 2 + Math.cos(ang) * W * far; s.sy = H * 0.4 + Math.sin(ang) * H * far; }
          stars.push(s);
        }
      }
    }
    links = [];
    var max2 = step * step * 2.4;
    for (var i = 0; i < stars.length; i++) {
      var best = [];
      for (var j = i + 1; j < stars.length; j++) { var dx = stars[i].tx - stars[j].tx, dy = stars[i].ty - stars[j].ty, d2 = dx * dx + dy * dy; if (d2 < max2) best.push([d2, j]); }
      best.sort(function (a, b) { return a[0] - b[0]; });
      for (var k = 0; k < Math.min(2, best.length); k++) links.push([i, best[k][1]]);
    }
  }
  function drawConstellation(f, time) {
    var c = cctx; c.setTransform(constDpr, 0, 0, constDpr, 0, 0); c.clearRect(0, 0, constW, constH);
    if (f <= 0.001 || !glyph) return;
    var la = smooth(0.58, 0.82, f), i, s, g;
    c.globalCompositeOperation = 'lighter';
    // halo et rayons derrière le texte
    if (la > 0) {
      var pulse = 0.85 + 0.15 * Math.sin(time * 2.2), hz = c.createRadialGradient(glyph.cx, glyph.cy, 0, glyph.cx, glyph.cy, glyph.w * 0.62);
      hz.addColorStop(0, 'rgba(243,202,32,' + (0.3 * la * pulse).toFixed(3) + ')'); hz.addColorStop(0.5, 'rgba(160,90,255,' + (0.14 * la).toFixed(3) + ')'); hz.addColorStop(1, 'rgba(124,60,255,0)');
      c.save(); c.translate(glyph.cx, glyph.cy); c.scale(1, 0.5); c.translate(-glyph.cx, -glyph.cy); c.fillStyle = hz; c.fillRect(glyph.cx - glyph.w, glyph.cy - glyph.w, glyph.w * 2, glyph.w * 2); c.restore();
      c.save(); c.translate(glyph.cx, glyph.cy); c.rotate(time * 0.04);
      for (i = 0; i < 16; i++) { c.rotate(Math.PI / 8); var rg = c.createLinearGradient(0, 0, glyph.w * 0.75, 0); rg.addColorStop(0, 'rgba(255,230,150,' + (0.1 * la).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(255,230,150,0)');
        c.fillStyle = rg; c.beginPath(); c.moveTo(0, 0); c.lineTo(glyph.w * 0.75, -14 - (i % 3) * 8); c.lineTo(glyph.w * 0.75, 14 + (i % 2) * 10); c.fill(); }
      c.restore();
    }
    // positions des étoiles, traînées de celles qui viennent de derrière
    for (i = 0; i < stars.length; i++) {
      s = stars[i]; var raw = clamp((f * 1.5 - s.d) / (s.back ? 0.5 : 0.62), 0, 1), k = s.back ? outCubic(raw) : inOutCubic(raw);
      s.x = lerp(s.sx, s.tx, k); s.y = lerp(s.sy, s.ty, k); s.k = k; s.raw = raw;
      if (s.back && raw > 0 && raw < 1) {
        var k0 = outCubic(Math.max(0, raw - 0.09)), x0 = lerp(s.sx, s.tx, k0), y0 = lerp(s.sy, s.ty, k0), sz = lerp(s.big, s.r, k);
        var tg = c.createLinearGradient(x0, y0, s.x, s.y); tg.addColorStop(0, 'rgba(243,202,32,0)'); tg.addColorStop(1, 'rgba(255,240,190,' + (0.9 * (1 - raw * 0.5)).toFixed(3) + ')');
        c.strokeStyle = tg; c.lineWidth = sz * 1.1; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(s.x, s.y); c.stroke();
      }
    }
    if (la > 0) {
      c.font = glyph.fs + 'px "Unica One", "Arial Narrow", Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
      for (g = 0; g < glyph.lines.length; g++) {
        var gy = glyph.y0 + glyph.lh * (g + 0.5);
        var fg = c.createLinearGradient(0, gy - glyph.fs / 2, 0, gy + glyph.fs / 2); fg.addColorStop(0, 'rgba(255,236,160,' + (0.34 * la).toFixed(3) + ')'); fg.addColorStop(1, 'rgba(243,170,20,' + (0.16 * la).toFixed(3) + ')');
        c.fillStyle = fg; c.fillText(glyph.lines[g], glyph.cx, gy);
        c.shadowColor = 'rgba(243,202,32,1)'; c.shadowBlur = 34 * la; c.lineWidth = 2.2; c.strokeStyle = 'rgba(243,202,32,' + (0.9 * la).toFixed(3) + ')'; c.strokeText(glyph.lines[g], glyph.cx, gy);
        c.shadowBlur = 10 * la; c.lineWidth = 1; c.strokeStyle = 'rgba(255,250,225,' + (0.95 * la).toFixed(3) + ')'; c.strokeText(glyph.lines[g], glyph.cx, gy);
        c.shadowBlur = 0;
      }
      c.strokeStyle = 'rgba(243,202,32,' + (0.3 * la).toFixed(3) + ')'; c.lineWidth = 1; c.beginPath();
      for (i = 0; i < links.length; i++) { var a = stars[links[i][0]], b = stars[links[i][1]]; c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); }
      c.stroke();
    }
    for (i = 0; i < stars.length; i++) {
      s = stars[i]; if (s.back && s.raw <= 0) continue;
      var tw = 0.72 + 0.28 * Math.sin(time * 2 + s.ph), al = smooth(0, 0.25, s.k + f * 0.4) * tw, r = (s.back ? lerp(s.big, s.r, s.k) : s.r) * (1 + la * 0.3);
      c.globalAlpha = al * 0.3; c.fillStyle = la > 0.5 || s.back ? '#f3ca20' : '#bcd4ff'; c.beginPath(); c.arc(s.x, s.y, r * 3.6, 0, 6.2832); c.fill();
      c.globalAlpha = al; c.fillStyle = '#fff'; c.beginPath(); c.arc(s.x, s.y, r, 0, 6.2832); c.fill();
      if (s.r > 2 && la > 0.3) { c.globalAlpha = al * la * 0.8; c.fillRect(s.x - r * 6, s.y - 0.5, r * 12, 1); c.fillRect(s.x - 0.5, s.y - r * 6, 1, r * 12); }
    }
    c.globalAlpha = 1;
    // éclat au moment où la constellation se verrouille
    var fl = clamp((f - 0.8) / 0.16, 0, 1);
    if (fl > 0 && fl < 1) {
      var e2 = Math.sin(fl * Math.PI), bx = lerp(glyph.cx - glyph.w * 0.6, glyph.cx + glyph.w * 0.6, fl);
      var bg = c.createRadialGradient(bx, glyph.cy, 0, bx, glyph.cy, glyph.w * 0.5); bg.addColorStop(0, 'rgba(255,250,225,' + (0.75 * e2).toFixed(3) + ')'); bg.addColorStop(0.3, 'rgba(243,202,32,' + (0.3 * e2).toFixed(3) + ')'); bg.addColorStop(1, 'rgba(243,202,32,0)');
      c.save(); c.translate(bx, glyph.cy); c.scale(1, 0.09); c.translate(-bx, -glyph.cy); c.fillStyle = bg; c.fillRect(bx - glyph.w, glyph.cy - glyph.w, glyph.w * 2, glyph.w * 2); c.restore();
      c.save(); c.translate(bx, glyph.cy); c.scale(0.5, 0.5); c.translate(-bx, -glyph.cy); c.fillStyle = bg; c.fillRect(bx - glyph.w, glyph.cy - glyph.w, glyph.w * 2, glyph.w * 2); c.restore();
    }
    c.globalCompositeOperation = 'source-over';
  }

  var TEX = ['sky', 'sun', 'galaxy1', 'galaxy2', 'saturn', 'giant', 'ice', 'ember', 'moon', 'rock1', 'rock2', 'rock3'];
  function withTextures(done) {
    var urls = {}; TEX.forEach(function (n) { urls[n] = 'assets/space/' + n + '.webp'; });
    if (window.location.protocol !== 'file:') return done(urls);
    if (window.MIWAVE_TEX) return done(window.MIWAVE_TEX);
    // ouvert en double-cliquant sur le fichier : les images doivent être intégrées pour que WebGL puisse les lire
    var sc = document.createElement('script'); sc.src = 'js/textures-inline.js';
    sc.onload = function () { done(window.MIWAVE_TEX || urls); }; sc.onerror = function () { done(urls); };
    document.head.appendChild(sc);
  }

  var voyage = (function () {
    var raf = 0, awake = false, cur = 0, lastCam = 0, lastT = 0, speed = 0, lookX = 0, lookY = 0, ptrX = 0, ptrY = 0, time0 = 0, lastIdx = 0;
    var camX = 0, camY = 0, steer = 0, bump = 0, starting = false;
    /* vidéo du voyage : le scroll la fait avancer ; le décor 3D reste affiché tant qu'elle n'est pas chargée */
    var vv = $('#voyage-video'), vReady = false, vStarted = false, RT = window.MIWAVE_ROUTE || null, T1 = 26.3, T2 = 29.9, cam0 = 0, camF = 1;
    function routeAt(arr, tSec) { if (!RT || !arr) return 0; var x = clamp(tSec * RT.hz, 0, arr.length - 1), i = Math.floor(x), j = Math.min(arr.length - 1, i + 1); return lerp(arr[i], arr[j], x - i); }
    function startVideo() {
      if (vStarted) return; vStarted = true;
      var small = window.innerWidth < 900, local = window.location.protocol === 'file:' || !window.fetch || !window.URL;
      // en ligne : une version légère s'affiche tout de suite, la version haute définition la remplace dès qu'elle est téléchargée
      var url = 'assets/video/' + (small || !local ? 'voyage-m.mp4' : 'voyage.mp4'), direct = false;
      var ready = function () { if (!vReady && vv.readyState >= 2) { vReady = true; vv.classList.add('is-on'); } };
      ['loadeddata', 'canplay', 'canplaythrough'].forEach(function (ev) { vv.addEventListener(ev, ready); });
      var useDirect = function () { if (direct) { vReady = false; vv.classList.remove('is-on'); return; } direct = true; vv.src = url; vv.load(); };
      vv.addEventListener('error', useDirect);
      var upgrade = function () {
        // la version HD est découpée en morceaux de moins de 10 Mo (limite d'envoi sur GitHub), recollés ici ; à défaut, le fichier entier
        var get = function (u) { return window.fetch(u).then(function (r) { if (!r.ok) throw new Error('video'); return r.blob(); }); };
        var parts = []; for (var k = 0; k < (M.voyageParts || 0); k++) parts.push(get('assets/video/voyage-hd.part' + k));
        (parts.length ? Promise.all(parts).then(function (bs) { return new Blob(bs, { type: 'video/mp4' }); }).catch(function () { return get('assets/video/voyage.mp4'); }) : get('assets/video/voyage.mp4')).then(function (b) {
          var hd = vv.cloneNode(false), old = vv, done = false; hd.removeAttribute('id'); hd.classList.remove('is-on'); hd.src = window.URL.createObjectURL(b);
          var show = function () { if (done) return; done = true; hd.classList.add('is-on'); vv = hd; window.setTimeout(function () { old.removeAttribute('src'); old.load(); if (old.parentNode) old.parentNode.removeChild(old); }, 900); };
          hd.addEventListener('loadeddata', function () { hd.addEventListener('seeked', show); try { hd.currentTime = Math.max(0.01, old.currentTime); } catch (e) { show(); } });
          old.parentNode.insertBefore(hd, old.nextSibling); hd.load();
        }).catch(function () {});
      };
      // la vidéo est téléchargée en entier avant d'être affichée, pour que le scroll puisse s'y déplacer sans attente
      if (local) useDirect();
      else window.fetch(url).then(function (r) { if (!r.ok) throw new Error('video'); return r.blob(); }).then(function (b) { vv.src = window.URL.createObjectURL(b); vv.load(); if (!small) upgrade(); }).catch(useDirect);
      // certains téléphones n'autorisent le déplacement dans une vidéo qu'après un premier geste
      var unlock = function () { var v0 = vv, p = v0.play(); if (p && p.then) p.then(function () { v0.pause(); }).catch(function () {}); window.removeEventListener('touchstart', unlock); window.removeEventListener('pointerdown', unlock); };
      window.addEventListener('touchstart', unlock, { passive: true }); window.addEventListener('pointerdown', unlock, { passive: true });
    }
    function target() { return clamp(window.scrollY / Math.max(1, window.innerHeight), 0, uEnd); }
    /* point de l'image de la vidéo (0..1) → position à l'écran, selon le cadrage de la vidéo */
    function vidPoint(nx, ny, W, H) {
      if (W < 900 && H > W) { var s1 = Math.max(W / 1280, H * 0.74 / 720); return [W / 2 + (nx - 0.5) * 1280 * s1, H * 0.37 + (ny - 0.5) * 720 * s1]; }
      var s0 = Math.max(W / 1280, H / 720) * 1.18; return [W / 2 + (nx - 0.5) * 1280 * s0, H / 2 + (ny - 0.5) * 720 * s0 - H * 0.08];
    }
    function bez(S, mx, my, ex, ey, u0) { var v0 = 1 - u0; return [v0 * v0 * S[0] + 2 * v0 * u0 * mx + u0 * u0 * ex, v0 * v0 * S[1] + 2 * v0 * u0 * my + u0 * u0 * ey]; }
    function cometAt(cm, x, y, ang, op, len) {
      cm.style.opacity = op.toFixed(3);
      cm.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) translate(-100%,-50%) rotate(' + ang.toFixed(4) + 'rad) scaleX(' + len.toFixed(3) + ')';
    }
    function frame(now) {
      raf = 0; if (!awake) return;
      var W = stage.clientWidth, H = stage.clientHeight, sec = now / 1000, dt = Math.min(0.05, lastT ? sec - lastT : 0.016); lastT = sec;
      if (!time0) time0 = sec;
      var tg = target(); cur += (tg - cur) * (1 - Math.pow(0.0012, dt)); if (Math.abs(tg - cur) < 0.0004) cur = tg;
      var camS = camAt(cur), cam = camS + (sec - time0) * 0.22;
      var inst = dt > 0 ? Math.abs(camS - lastCam) / dt : 0; lastCam = camS;
      speed += (clamp(inst / 26, 0, 2) - speed) * 0.12;
      lookX += (ptrX - lookX) * 0.05; lookY += (ptrY - lookY) * 0.05;
      // slalom : position latérale, braquage et roulis
      var pp = pathAt(cur), vx = dt > 0 ? (pp[0] - camX) / dt : 0; camX = pp[0]; camY = pp[1];
      var f = clamp((cur - uF) / FLEN, 0, 1);
      var close = 0, vt = cur <= uF ? (cur / uF) * T1 : T1 + f * (T2 - T1);   // la vidéo avance au même rythme que le scroll, sans ralenti
      if (vReady) {
        if (!vv.seeking && Math.abs(vt - vv.currentTime) > 0.02) { try { vv.currentTime = vt; } catch (e) { /* vidéo pas encore prête */ } }
        steer += (clamp(routeAt(RT.steer, vt) * 1.25, -1, 1) - steer) * 0.08; close = routeAt(RT.flash, vt) * 0.6;
      } else steer += (clamp(vx * 0.55, -1, 1) - steer) * 0.09;
      if (space && !vReady) close = space.render({ z: camS, zStars: cam, x: camX, y: camY, roll: -steer * 0.17, speed: speed, time: sec, yaw: 0.5 + 0.02 * cur + camX * 0.005, pitch: -0.03 + camY * 0.006, lx: lookX, ly: lookY, gain: 1 + 0.45 * smooth(0.3, 0.9, f) });
      bump += (close - bump) * 0.3;

      // ouverture
      var op = 1 - smooth(0.08, 0.7, cur);
      opening.style.opacity = op.toFixed(3); opening.style.visibility = op <= 0.01 ? 'hidden' : 'visible';
      opening.style.transform = 'translate3d(0,' + (-cur * 70).toFixed(1) + 'px,0) scale(' + (1 + cur * 0.35).toFixed(3) + ')';

      // projets : quatre façons d'arriver, trois façons de repartir
      var cx = W / 2, cy = H * (W < 900 ? 0.42 : 0.35), anyLive = false;
      for (var i = 0; i < items.length; i++) {
        var it = items[i], tt = (cur - it.c) / it.w, card = it.card, ci, cm;
        if (tt < -1.05 || tt > 1.05) {
          if (it.shown) { card.style.visibility = 'hidden'; card.style.opacity = '0'; for (ci = 0; ci < 3; ci++) it.comets[ci].style.opacity = '0'; it.ping.style.opacity = '0'; it.burst.style.opacity = '0'; it.shown = false; setLive(it, false); if (it.vid) it.vid.pause(); }
          continue;
        }
        it.shown = true;
        if (!it.vid && tt > -1) { it.vid = previewVideo(it.v); it.media.appendChild(it.vid); }
        // --- révélation : le projet vient d'un astre de la vidéo, d'une étoile filante ou de l'impact ---
        var kind = it.kind, O = vidPoint(it.ox, it.oy, W, H), far = [cx + it.side * W * 0.66, cy - H * 0.3];
        if (!vReady && kind !== 'c' && kind !== 's') kind = 'c';
        var nC = kind === 's' ? 3 : kind === 'b' ? 0 : 1, kf = clamp((tt + 1) / 0.55, 0, 1), q = tt > 0.3 ? (tt - 0.3) / 0.7 : 0;
        var STARTS = kind === 'p' ? [O] : [far, [cx - it.side * W * 0.66, cy - H * 0.16], [cx + it.side * W * 0.2, cy - H * 0.62]];
        for (ci = 0; ci < 3; ci++) {
          cm = it.comets[ci];
          var k1 = clamp(kf * 1.2 - ci * 0.1, 0, 1), leaving = ci === 0 && q > 0.35 && kind !== 'b';
          if (leaving) { // le projet repart en étoile filante
            var lk = clamp((q - 0.35) / 0.65, 0, 1), le = lk * lk, ex = cx - it.side * W * 0.75, ey = cy - H * 0.45;
            cometAt(cm, lerp(cx, ex, le), lerp(cy, ey, le), Math.atan2(ey - cy, ex - cx), Math.sin(Math.min(1, lk * 1.15) * Math.PI), 0.4 + lk);
          } else if (ci < nC && k1 > 0 && k1 < 1) {
            var S = STARTS[ci] || far, e = k1 * k1 * (3 - 2 * k1), mx = (S[0] + cx) / 2 + (cy - S[1]) * 0.22 * it.side, my = (S[1] + cy) / 2 - H * 0.14;
            var P = bez(S, mx, my, cx, cy, e), P2 = bez(S, mx, my, cx, cy, Math.min(1, e + 0.02)), P0 = bez(S, mx, my, cx, cy, Math.max(0, e - 0.02));
            cometAt(cm, P[0], P[1], Math.atan2(P2[1] - P0[1], P2[0] - P0[0]), smooth(0, 0.1, k1) * (1 - smooth(0.9, 1, k1)), 0.35 + 0.75 * Math.sin(k1 * Math.PI));
          } else cm.style.opacity = '0';
        }
        // balise sur l'astre d'où part la capsule, puis éclat à l'ouverture
        var pk = kind === 'p' || kind === 'b' ? clamp((tt + 1.05) / 0.32, 0, 1) : 0;
        if (pk > 0 && pk < 1) { it.ping.style.opacity = (1 - pk).toFixed(3); it.ping.style.transform = 'translate3d(' + O[0].toFixed(1) + 'px,' + O[1].toFixed(1) + 'px,0) translate(-50%,-50%) scale(' + (0.2 + pk * 2.4).toFixed(3) + ')'; } else it.ping.style.opacity = '0';
        var openAt = kind === 'b' ? -0.8 : -0.46, bk = clamp((tt - openAt) / 0.34, 0, 1), bx = kind === 'b' ? O[0] : cx, by = kind === 'b' ? O[1] : cy;
        if (bk > 0 && bk < 1) { it.burst.style.opacity = (1 - bk * bk).toFixed(3); it.burst.style.transform = 'translate3d(' + bx.toFixed(1) + 'px,' + by.toFixed(1) + 'px,0) translate(-50%,-50%) scale(' + (0.15 + outCubic(bk) * 3.2).toFixed(3) + ')'; } else it.burst.style.opacity = '0';
        var a = clamp((tt - openAt) / (kind === 'b' ? 0.62 : 0.36), 0, 1), ea = outCubic(a), scale = 1, dx = 0, dy = 0, rz = 0, o = clamp(a * 4, 0, 1), clip = 'none';
        if (tt <= 0.3) {
          if (kind === 'b') { dx = (O[0] - cx) * (1 - ea); dy = (O[1] - cy) * (1 - ea); scale = lerp(0.04, 1, ea); rz = it.side * 140 * (1 - ea); }  // projeté par l'impact
          else { if (a < 1) clip = 'circle(' + (ea * 78).toFixed(1) + '% at 50% 50%)'; scale = lerp(0.5, 1, outBack(a)); }                         // l'étoile s'ouvre
        } else { var sh = smooth(0, 0.5, q); scale = 1 - sh * 0.96; o = 1 - smooth(0.3, 0.52, q); rz = -it.side * 25 * sh; }                       // se replie en point lumineux
        if (a <= 0 || o <= 0.004) { card.style.visibility = 'hidden'; card.style.opacity = '0'; }
        else {
          card.style.visibility = 'visible'; card.style.opacity = o.toFixed(3); card.style.clipPath = clip; card.style.webkitClipPath = clip;
          card.style.transform = 'translate3d(' + (dx - steer * 14).toFixed(1) + 'px,calc(-50% + ' + dy.toFixed(1) + 'px),0) rotate(' + (rz - steer * 1.6).toFixed(2) + 'deg) scale(' + scale.toFixed(4) + ')';
        }
        var live = tt > -0.3 && tt < 0.42; setLive(it, live); if (live) { anyLive = true; lastIdx = i + 1; }
        if (it.vid) { if (tt > -0.42 && tt < 0.6) { if (it.vid.paused) { var p = it.vid.play(); if (p && p.catch) p.catch(function () {}); } } else if (!it.vid.paused) it.vid.pause(); }
      }

      // final
      drawConstellation(f, sec);
      var fo = smooth(0.8, 0.95, f);
      finalEl.style.opacity = fo.toFixed(3); finalEl.style.visibility = fo > 0.02 ? 'visible' : 'hidden';
      finalEl.style.transform = 'translate3d(0,' + ((1 - fo) * 18).toFixed(1) + 'px,0)';

      // tête haute, cockpit, mains
      hudSpeed.textContent = (Math.min(0.99, speed * 0.62)).toFixed(2).replace('.', lang === 'fr' ? ',' : '.') + ' c';
      hudCount.textContent = ('0' + lastIdx).slice(-2) + ' / ' + items.length;
      reticle.style.opacity = anyLive || f > 0.1 || cur < 0.6 ? '0' : '1';
      pagerFill.style.transform = 'scaleY(' + (cur / uEnd).toFixed(4) + ')';
      var j = 0.35 + speed * 1.6 + bump * 9;
      if (!zoomLock) {
      cockpit.style.setProperty('--jx', (Math.sin(sec * 31) * 0.5 * j - lookX * 10 + steer * 10).toFixed(2) + 'px');
      cockpit.style.setProperty('--jy', (Math.sin(sec * 47 + 1.3) * 0.6 * j + lookY * 6).toFixed(2) + 'px');
      cockpit.style.setProperty('--tilt', (steer * 1.5 + (vReady ? routeAt(RT.roll, vt) * 1.3 : 0)).toFixed(3) + 'deg');
      cockpit.style.setProperty('--drop', (smooth(0.55, 0.9, f) * 15 + (1 - smooth(0.05, 0.8, cur)) * 9).toFixed(2) + '%');
      }
      var pw = Math.min(1, speed * 1.5), push = pw * 20;
      // levier poussé à deux mains + batterie du vaisseau, qui se vide au fil du trajet
      lever.style.setProperty('--pw', pw.toFixed(3)); holo.style.setProperty('--pw', pw.toFixed(3));
      lever.style.transform = 'translate3d(' + (steer * 9 / kDash).toFixed(2) + 'px,' + (-push / kDash).toFixed(2) + 'px,0) rotate(' + (steer * 1.1).toFixed(3) + 'deg) scale(' + (1 - pw * 0.045).toFixed(4) + ')';
      var lv = Math.round((1 - 0.86 * clamp(cur / uEnd, 0, 1)) * 100);
      if (lv !== lastLv) { lastLv = lv; holoVal.textContent = lv + '%'; var nOn = Math.max(1, Math.ceil(lv / 20)); holoCells.forEach(function (c, i) { c.classList.toggle('on', i < nOn); c.classList.toggle('last', i === nOn - 1); }); holo.classList.toggle('is-low', lv <= 30); }
      handL.style.transform = 'translate3d(' + (steer * 9).toFixed(2) + 'px,' + (-push - steer * 3).toFixed(2) + 'px,0) rotate(' + (steer * 2.6).toFixed(3) + 'deg) scale(' + (1 - pw * 0.045).toFixed(4) + ')';
      handR.style.transform = 'translate3d(' + (steer * 9).toFixed(2) + 'px,' + (-push + steer * 3).toFixed(2) + 'px,0) rotate(' + (steer * 2.6).toFixed(3) + 'deg) scale(' + (1 - pw * 0.045).toFixed(4) + ')';
      raf = window.requestAnimationFrame(frame);
    }
    function setLive(it, on) {
      if (it.live === on) return; it.live = on;
      it.card.classList.toggle('is-live', on); it.card.tabIndex = on ? 0 : -1;
    }
    function wake() {
      if (rmq.matches) { sleep(); return; }
      awake = true;
      if (!space && !starting) {
        starting = true;
        withTextures(function (tex) {
          var small = window.innerWidth < 900;
          space = new window.MiwaveSpace($('#space'), small ? { near: 1500, far: 700, maxDpr: 1.5, textures: tex } : { near: 3200, far: 1500, maxDpr: 2, textures: tex });
          space.objects = worldObjects; space.skyObjects = skyObjects;
          buildConstellation();
        });
      }
      cam0 = camAt(0); camF = camAt(uF); startVideo();
      lastT = 0; cur = target(); lastCam = camAt(cur); var p0 = pathAt(cur); camX = p0[0]; camY = p0[1];
      if (!raf && !document.hidden) raf = window.requestAnimationFrame(frame);
    }
    function sleep() { awake = false; if (raf) { window.cancelAnimationFrame(raf); raf = 0; } items.forEach(function (it) { if (it.vid) it.vid.pause(); }); }
    function resize() { if (space) { space.resize(); buildConstellation(); } fitDash(); }
    /* écrans du tableau de bord : un premier clic zoome sur l'écran, un second sur le texte vert ouvre la page */
    function fitDash() { kDash = cockpit.offsetWidth / 2048 || 1; dash.style.transform = 'scale(' + kDash.toFixed(5) + ')'; if (zoomed) placeZoom(); }
    function placeZoom() {
      var q = zoomed.getAttribute('data-q').split(',').map(Number), W = stage.clientWidth, H = stage.clientHeight, cw = cockpit.offsetWidth, ch = cockpit.offsetHeight;
      var topH = W < 900 ? 56 : 72, s = Math.min(W * 0.66 / (q[2] * kDash), (H - topH) * 0.56 / (q[3] * kDash), 5), a = -q[4] * Math.PI / 180;
      var px = q[0] * kDash - cw / 2, py = q[1] * kDash - ch, rx = (px * Math.cos(a) - py * Math.sin(a)) * s, ry = (px * Math.sin(a) + py * Math.cos(a)) * s;
      cockpit.style.setProperty('--zs', s.toFixed(4)); cockpit.style.setProperty('--za', (-q[4]).toFixed(2) + 'deg');
      cockpit.style.setProperty('--zx', (W / 2 - cockpit.offsetLeft - rx).toFixed(1) + 'px');
      cockpit.style.setProperty('--zy', (topH + (H - topH) * 0.52 - cockpit.offsetTop - ch - ry).toFixed(1) + 'px');
    }
    function moving() { zoomLock = true; cockpit.classList.add('is-moving'); window.clearTimeout(zoomTimer); zoomTimer = window.setTimeout(function () { cockpit.classList.remove('is-moving'); if (!zoomed) zoomLock = false; }, 700); }
    function zoomIn(el) {
      if (zoomed) return; zoomed = el; zoomY = window.scrollY; placeZoom(); moving();
      cockpit.classList.add('is-zoom'); stage.classList.add('is-zoomed'); el.classList.add('is-open'); $('#unzoom').hidden = false;
      var link = $('.scr__go', el); link.tabIndex = 0; window.setTimeout(function () { if (zoomed === el) link.focus({ preventScroll: true }); }, 660);
    }
    function zoomOut(instant) {
      if (!zoomed) return; var el = zoomed; zoomed = null;
      $('.scr__go', el).tabIndex = -1; el.classList.remove('is-open'); stage.classList.remove('is-zoomed'); cockpit.classList.remove('is-zoom'); $('#unzoom').hidden = true;
      if (instant) { window.clearTimeout(zoomTimer); cockpit.classList.remove('is-moving'); zoomLock = false; } else { moving(); if (document.activeElement && el.contains(document.activeElement)) $('.scr__zoom', el).focus({ preventScroll: true }); }
    }
    $$('.scr', dash).forEach(function (el) { $('.scr__zoom', el).addEventListener('click', function () { zoomIn(el); }); $('.scr__go', el).addEventListener('click', function () { zoomOut(true); }); });
    $('#veil').addEventListener('click', function () { zoomOut(); });
    $('#unzoom').addEventListener('click', function () { zoomOut(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && zoomed) zoomOut(); });
    window.addEventListener('scroll', function () { if (zoomed && Math.abs(window.scrollY - zoomY) > 24) zoomOut(); }, { passive: true });
    window.addEventListener('hashchange', function () { zoomOut(true); });
    fitDash();
    document.addEventListener('visibilitychange', function () { if (document.hidden) { if (raf) { window.cancelAnimationFrame(raf); raf = 0; } } else if (awake && !raf) { lastT = 0; raf = window.requestAnimationFrame(frame); } });
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; ptrX = (e.clientX / window.innerWidth) * 2 - 1; ptrY = (e.clientY / window.innerHeight) * 2 - 1; }, { passive: true });
    function stops() { return [0].concat(items.map(function (it) { return it.c; })).concat([uEnd]); }
    function jump(dir) {
      var s = stops(), u = target(), to = dir > 0 ? uEnd : 0, i;
      if (dir > 0) { for (i = 0; i < s.length; i++) if (s[i] > u + 0.06) { to = s[i]; break; } }
      else { for (i = s.length - 1; i >= 0; i--) if (s[i] < u - 0.06) { to = s[i]; break; } }
      window.scrollTo({ top: to * window.innerHeight, behavior: 'smooth' });
    }
    $('#pager-prev').addEventListener('click', function () { jump(-1); });
    $('#pager-next').addEventListener('click', function () { jump(1); });
    return { wake: wake, sleep: sleep, resize: resize };
  })();

  function applyMotionPref() {
    document.body.classList.toggle('rm', rmq.matches);
    if (route === 'voyage') { if (rmq.matches) voyage.sleep(); else voyage.wake(); }
  }
  if (rmq.addEventListener) rmq.addEventListener('change', applyMotionPref); else if (rmq.addListener) rmq.addListener(applyMotionPref);
  if (document.fonts && document.fonts.load) document.fonts.load('40px "Unica One"').then(function () { voyage.resize(); }).catch(function () {});

  /* ================= Intro ================= */
  var intro = $('#intro'), introVideo = $('#intro-video'), flash = $('#flash'), soundBtn = $('#intro-sound');
  function syncSoundLabel() { var on = !introVideo.muted; soundBtn.setAttribute('aria-pressed', String(on)); $('span', soundBtn).textContent = t(on ? 'intro.sound.off' : 'intro.sound.on'); }
  function endIntro() {
    if (intro.hidden) return;
    flash.classList.add('is-on'); intro.hidden = true; introVideo.pause(); document.body.style.overflow = '';
    window.scrollTo(0, 0);
    window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { flash.classList.remove('is-on'); }); });
    addReplay();
  }
  function startIntro() {
    intro.hidden = false; document.body.style.overflow = 'hidden'; introVideo.currentTime = 0; introVideo.muted = true; syncSoundLabel();
    var p = introVideo.play(); if (p && p.catch) p.catch(function () { endIntro(); });
    $('#intro-skip').focus({ preventScroll: true });
  }
  introVideo.addEventListener('ended', endIntro);
  introVideo.addEventListener('error', endIntro);
  $('#intro-skip').addEventListener('click', endIntro);
  soundBtn.addEventListener('click', function () { introVideo.muted = !introVideo.muted; syncSoundLabel(); });
  intro.addEventListener('keydown', function (e) { if (e.key === 'Escape') endIntro(); });
  function addReplay() { /* le bouton est dans l'en-tête, toujours visible pendant le voyage */ }
  $('#replay').addEventListener('click', function () { if (route !== 'voyage') window.location.hash = '#voyage'; window.scrollTo(0, 0); startIntro(); });

  /* ================= À propos : motion en boucle ================= */
  var aboutVideo = $('#about-video'), aboutSound = $('#about-sound');
  function syncAboutSound() { var on = !aboutVideo.muted; aboutSound.setAttribute('aria-pressed', String(on)); $('span', aboutSound).textContent = t(on ? 'intro.sound.off' : 'intro.sound.on'); }
  function aboutPlay(on) {
    if (on) { if (!aboutVideo.getAttribute('src')) aboutVideo.src = 'assets/video/motion-full.mp4'; if (!rmq.matches) { var p = aboutVideo.play(); if (p && p.catch) p.catch(function () {}); } }
    else { aboutVideo.pause(); aboutVideo.muted = true; syncAboutSound(); }
  }
  aboutSound.addEventListener('click', function () { aboutVideo.muted = !aboutVideo.muted; if (aboutVideo.paused) { var p = aboutVideo.play(); if (p && p.catch) p.catch(function () {}); } syncAboutSound(); });

  /* ================= Contact : adresses directes ================= */
  function renderMails() {
    var root = $('#mails'); root.textContent = '';
    ['creation', 'pro'].forEach(function (k) {
      var addr = M.contact[k], row = el('div', 'mail');
      row.appendChild(el('span', 'mail__label', t('form.type.' + k)));
      row.appendChild(el('span', 'mail__hint', t('form.type.' + k + '.hint')));
      var line = el('span', 'mail__line'), a = el('a', 'mail__addr', addr); a.href = 'mailto:' + addr; line.appendChild(a);
      var b = el('button', 'mail__copy', t('mail.copy')); b.type = 'button';
      b.addEventListener('click', function () {
        var ok = function () { b.textContent = t('mail.copied'); window.setTimeout(function () { b.textContent = t('mail.copy'); }, 1800); };
        var sel = function () { var r = document.createRange(); r.selectNodeContents(a); var g = window.getSelection(); g.removeAllRanges(); g.addRange(r); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(addr).then(ok).catch(sel); else sel();
      });
      line.appendChild(b); row.appendChild(line); root.appendChild(row);
    });
  }

  /* ================= Contact ================= */
  var form = $('#contact-form'), statusEl = $('#f-status'), sendBtn = $('#f-send');
  function setErr(id, key) {
    var input = $('#f-' + id), e = $('#e-' + id);
    if (key) { e.textContent = t(key); input.setAttribute('aria-invalid', 'true'); } else { e.textContent = ''; input.removeAttribute('aria-invalid'); }
    return !key;
  }
  function setStatus(key, cls) { statusEl.textContent = key ? t(key) : ''; statusEl.className = 'form__status' + (cls ? ' ' + cls : ''); }
  ['name', 'email', 'message'].forEach(function (id) { $('#f-' + id).addEventListener('input', function () { setErr(id, null); }); });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = $('#f-name').value.trim(), email = $('#f-email').value.trim(), msg = $('#f-message').value.trim();
    var type = (form.querySelector('input[name="type"]:checked') || {}).value || 'creation';
    var ok1 = setErr('name', name ? null : 'form.err.name');
    var ok2 = setErr('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? null : 'form.err.email');
    var ok3 = setErr('message', msg.length >= 3 ? null : 'form.err.message');
    if (!(ok1 && ok2 && ok3)) { setStatus(null); $(!ok1 ? '#f-name' : !ok2 ? '#f-email' : '#f-message').focus(); return; }
    if ($('#f-bot').checked) return;
    var key = M.form.keys[type];
    if (!key) { setStatus('form.err.config', 'is-err'); return; }
    sendBtn.disabled = true; sendBtn.textContent = t('form.sending'); setStatus(null);
    window.fetch(M.form.endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: key, name: name, email: email, message: msg, from_name: 'Site Miwave Studio',
        subject: (type === 'pro' ? 'Demande professionnelle' : 'Demande de création') + ' — ' + name })
    }).then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.success) throw new Error('send'); }); })
      .then(function () { form.reset(); setStatus('form.sent', 'is-ok'); })
      .catch(function () { setStatus('form.err.send', 'is-err'); })
      .then(function () { sendBtn.disabled = false; sendBtn.textContent = t('form.send'); });
  });

  /* ================= Démarrage ================= */
  $('#year').textContent = String(new Date().getFullYear());
  document.body.classList.toggle('rm', rmq.matches);
  applyLang();
  go();
  if (route === 'voyage' && !rmq.matches && !/[?&]sansintro/.test(window.location.search)) startIntro();
  else if (route === 'voyage') addReplay();
})();
