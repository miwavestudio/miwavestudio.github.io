/* Miwave Studio — décor spatial en temps réel (WebGL, sans dépendance).
   Couches, du fond vers l'avant : ciel (nébuleuses) → étoiles lointaines → soleil et galaxies →
   étoiles proches (qui défilent et repassent au loin) → planètes et astéroïdes placés sur le trajet.
   La caméra avance (z), se décale (x, y) pour slalomer et s'incline (roulis) dans les virages. */
(function () {
  'use strict';

  var STAR_V = [
    'attribute vec3 aPos;', 'attribute vec3 aSeed;', 'attribute float aEnd;',
    'uniform float uCam, uDepth, uAspect, uStreak, uPx, uTime, uFar, uRoll, uGain;', 'uniform vec2 uLook, uCamXY, uSky;',
    'varying float vA;', 'varying vec3 vC;',
    'void main(){',
    '  vec2 p; float fade; float zt = 1.0;',
    '  if (uFar > 0.5) {',
    '    p = vec2(mod(aPos.x - uSky.x + 3.0, 6.0) - 3.0, mod(aPos.y - uSky.y + 1.6, 3.2) - 1.6); fade = 1.0;',
    '  } else {',
    '    float z = mod(aPos.z - uCam, uDepth); zt = max(z + aEnd * uStreak, 0.03);',
    '    p = (aPos.xy - uCamXY) / zt * 1.25; fade = smoothstep(uDepth, uDepth * 0.72, z) * smoothstep(0.03, 0.5, z);',
    '  }',
    '  float c = cos(uRoll), s = sin(uRoll); p = vec2(p.x * c - p.y * s, p.x * s + p.y * c) + uLook;',
    '  gl_Position = vec4(p.x / uAspect, p.y, 0.0, 1.0);',
    '  float near = clamp(1.6 / zt, 0.0, 6.0);',
    '  gl_PointSize = uPx * aSeed.x * (uFar > 0.5 ? 1.0 : (0.75 + near));',
    '  float tw = 0.82 + 0.18 * sin(uTime * (0.6 + aSeed.z * 1.7) + aSeed.z * 40.0);',
    '  vA = fade * tw * (uFar > 0.5 ? 0.4 + 0.6 * aSeed.y : 0.55 + 0.45 * aSeed.y) * (1.0 - aEnd) * uGain;',
    '  vC = mix(mix(vec3(0.74, 0.84, 1.0), vec3(1.0, 0.95, 0.86), aSeed.z), vec3(1.0), 0.45);',
    '}'
  ].join('\n');
  var STAR_F = [
    'precision mediump float;', 'uniform float uLine;', 'varying float vA;', 'varying vec3 vC;',
    'void main(){ float a = vA;',
    '  if (uLine < 0.5) { float d = length(gl_PointCoord - 0.5); float g = smoothstep(0.5, 0.0, d); a *= g * g * 1.35; }',
    '  gl_FragColor = vec4(vC * a, a); }'
  ].join('\n');
  var SKY_V = 'attribute vec2 aQ; varying vec2 vP; void main(){ vP = aQ; gl_Position = vec4(aQ, 0.0, 1.0); }';
  var SKY_F = [
    'precision mediump float;', 'uniform sampler2D uTex;', 'uniform float uAspect, uRoll, uGain;', 'uniform vec2 uSky;', 'varying vec2 vP;',
    'void main(){ vec2 p = vec2(vP.x * uAspect, vP.y); float c = cos(uRoll), s = sin(uRoll); p = vec2(p.x * c + p.y * s, -p.x * s + p.y * c);',
    '  vec2 uv = vec2(uSky.x + p.x * 0.105, clamp(0.5 - uSky.y - p.y * 0.21, 0.01, 0.99));',
    '  vec3 col = texture2D(uTex, uv).rgb; gl_FragColor = vec4(col * uGain, 1.0); }'
  ].join('\n');
  var SPR_V = [
    'attribute vec2 aQ;', 'uniform vec2 uCenter, uSize;', 'uniform float uRot, uAspect;', 'varying vec2 vUv;',
    'void main(){ vUv = aQ * 0.5 + 0.5; vec2 q = aQ * uSize; float c = cos(uRot), s = sin(uRot); q = vec2(q.x * c - q.y * s, q.x * s + q.y * c);',
    '  gl_Position = vec4((uCenter.x + q.x) / uAspect, uCenter.y + q.y, 0.0, 1.0); }'
  ].join('\n');
  var SPR_F = 'precision mediump float; uniform sampler2D uTex; uniform float uAlpha, uGain; varying vec2 vUv; void main(){ vec4 t = texture2D(uTex, vec2(vUv.x, 1.0 - vUv.y)); gl_FragColor = vec4(t.rgb * uGain, t.a) * uAlpha; }';

  function rand(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function sstep(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  function Space(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas; this.depth = 42; this.near = opts.near || 3000; this.far = opts.far || 1800; this.maxDpr = opts.maxDpr || 2;
    this.tex = {}; this.objects = []; this.skyObjects = []; this.ok = false;
    var gl = null;
    try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' }); } catch (e) { gl = null; }
    if (gl) { this.gl = gl; this.ok = this.init(); }
    if (!this.ok) { this.ctx = canvas.getContext('2d'); this.init2d(); }
    else this.load(opts.textures || {});
    this.resize();
  }

  Space.prototype.program = function (vs, fs, uniforms, attribs) {
    var gl = this.gl;
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs); if (!v || !f) return null;
    var p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    var o = { p: p, u: {}, a: {} };
    uniforms.forEach(function (n) { o.u[n] = gl.getUniformLocation(p, n); });
    attribs.forEach(function (n) { o.a[n] = gl.getAttribLocation(p, n); });
    return o;
  };

  Space.prototype.init = function () {
    var gl = this.gl;
    this.pStar = this.program(STAR_V, STAR_F, ['uCam', 'uDepth', 'uAspect', 'uStreak', 'uPx', 'uTime', 'uFar', 'uLook', 'uLine', 'uRoll', 'uCamXY', 'uSky', 'uGain'], ['aPos', 'aSeed', 'aEnd']);
    this.pSky = this.program(SKY_V, SKY_F, ['uTex', 'uAspect', 'uRoll', 'uSky', 'uGain'], ['aQ']);
    this.pSpr = this.program(SPR_V, SPR_F, ['uTex', 'uCenter', 'uSize', 'uRot', 'uAspect', 'uAlpha', 'uGain'], ['aQ']);
    if (!this.pStar || !this.pSky || !this.pSpr) return false;
    var r = rand(20261111), D = this.depth, R = 30, i;
    var n = this.near, pts = new Float32Array(n * 7), lines = new Float32Array(n * 14);
    for (i = 0; i < n; i++) {
      var x = (r() * 2 - 1) * R, y = (r() * 2 - 1) * R * 0.7, z = r() * D;
      var big = r() < 0.05 ? 1.9 : 1, sx = (0.7 + r() * 0.9) * big, sy = r(), sz = r();
      pts.set([x, y, z, sx, sy, sz, 0], i * 7); lines.set([x, y, z, sx, sy, sz, 0, x, y, z, sx, sy, sz, 1], i * 14);
    }
    var m = this.far, far = new Float32Array(m * 7);
    for (i = 0; i < m; i++) far.set([(r() * 2 - 1) * 3, (r() * 2 - 1) * 1.6, 1, 0.6 + r() * r() * 1.5, r() * r(), r(), 0], i * 7);
    this.bPts = this.buf(pts); this.bLines = this.buf(lines); this.bFar = this.buf(far);
    this.bQuad = this.buf(new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));
    gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.clearColor(0, 0, 0, 1);
    // texture de traînée pour les étoiles filantes d'arrière-plan
    var c = document.createElement('canvas'); c.width = 256; c.height = 16; var x2 = c.getContext('2d');
    var g = x2.createLinearGradient(0, 0, 256, 0); g.addColorStop(0, 'rgba(160,190,255,0)'); g.addColorStop(0.8, 'rgba(210,225,255,0.55)'); g.addColorStop(1, '#fff');
    x2.fillStyle = g; x2.fillRect(0, 6, 256, 4); x2.globalCompositeOperation = 'destination-in';
    var g2 = x2.createLinearGradient(0, 0, 0, 16); g2.addColorStop(0.3, 'rgba(0,0,0,0)'); g2.addColorStop(0.5, '#000'); g2.addColorStop(0.7, 'rgba(0,0,0,0)'); x2.fillStyle = g2; x2.fillRect(0, 0, 256, 16);
    this.tex.streak = this.makeTex(c, false);
    return true;
  };
  Space.prototype.buf = function (data) { var gl = this.gl, b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return b; };
  Space.prototype.makeTex = function (img, repeat) {
    var gl = this.gl, t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    var pot = (img.width & (img.width - 1)) === 0 && (img.height & (img.height - 1)) === 0;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat && pot ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (pot) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    return t;
  };
  Space.prototype.load = function (map) {
    var self = this;
    Object.keys(map).forEach(function (name) {
      var img = new Image();
      img.onload = function () { try { self.tex[name] = self.makeTex(img, name === 'sky'); } catch (e) { /* image locale non lisible : couche ignorée */ } };
      img.src = map[name];
    });
  };

  Space.prototype.resize = function () {
    var c = this.canvas, dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
    var w = Math.max(1, Math.round(c.clientWidth * dpr)), h = Math.max(1, Math.round(c.clientHeight * dpr));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    this.dpr = dpr; this.w = w; this.h = h;
    if (this.ok) this.gl.viewport(0, 0, w, h);
  };

  Space.prototype.sprite = function (tex, cx, cy, sx, sy, rot, alpha, gain, additive) {
    var gl = this.gl, u = this.pSpr.u; if (!tex || alpha <= 0.003) return;
    gl.blendFunc(gl.ONE, additive ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform2f(u.uCenter, cx, cy); gl.uniform2f(u.uSize, sx, sy); gl.uniform1f(u.uRot, rot || 0); gl.uniform1f(u.uAlpha, alpha); gl.uniform1f(u.uGain, gain == null ? 1 : gain);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  /* s : { z, zStars, x, y, roll, speed, time, yaw, pitch, lx, ly, gain } — renvoie la proximité du rocher le plus proche (0..1) */
  Space.prototype.render = function (s) {
    if (!this.ok) { this.render2d(s.zStars); return 0; }
    var gl = this.gl, asp = this.w / this.h, t = s.time, roll = s.roll || 0, self = this, close = 0;
    var cr = Math.cos(roll), sr = Math.sin(roll), lx = (s.lx || 0) * 0.035, ly = (s.ly || 0) * 0.025, gain = s.gain || 1;
    var yaw = s.yaw + lx * 0.02, pitch = s.pitch + ly * 0.02;
    gl.clear(gl.COLOR_BUFFER_BIT);
    function quad(p) { gl.bindBuffer(gl.ARRAY_BUFFER, self.bQuad); gl.enableVertexAttribArray(p.a.aQ); gl.vertexAttribPointer(p.a.aQ, 2, gl.FLOAT, false, 8, 0); }

    // 1. ciel
    if (this.tex.sky) {
      var p1 = this.pSky; gl.useProgram(p1.p); quad(p1); gl.blendFunc(gl.ONE, gl.ZERO);
      gl.bindTexture(gl.TEXTURE_2D, this.tex.sky); gl.uniform1f(p1.u.uAspect, asp); gl.uniform1f(p1.u.uRoll, roll); gl.uniform2f(p1.u.uSky, yaw, pitch); gl.uniform1f(p1.u.uGain, 0.74 * gain);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    // 2. étoiles lointaines
    var ps = this.pStar, u = ps.u; gl.useProgram(ps.p); gl.blendFunc(gl.ONE, gl.ONE);
    gl.uniform1f(u.uDepth, this.depth); gl.uniform1f(u.uAspect, asp); gl.uniform1f(u.uTime, t); gl.uniform1f(u.uRoll, roll); gl.uniform1f(u.uGain, gain);
    gl.uniform1f(u.uPx, 2.5 * this.dpr); gl.uniform2f(u.uLook, lx, ly); gl.uniform2f(u.uCamXY, s.x, s.y); gl.uniform2f(u.uSky, yaw / 0.105, pitch / 0.21);
    gl.uniform1f(u.uCam, s.zStars); gl.uniform1f(u.uStreak, 0); gl.uniform1f(u.uFar, 1); gl.uniform1f(u.uLine, 0);
    this.bindStars(this.bFar); gl.drawArrays(gl.POINTS, 0, this.far);

    // 3. soleil, galaxies, astres lointains (ancrés au ciel)
    var sp = this.pSpr; gl.useProgram(sp.p); quad(sp); gl.uniform1f(sp.u.uAspect, asp);
    function skyPos(o) { var dx = ((o.u - yaw + 0.5) % 1 + 1) % 1 - 0.5, px = dx / 0.105, py = (0.5 - pitch - o.v) / 0.21; return [px * cr - py * sr + lx, px * sr + py * cr + ly]; }
    var i, o, q;
    for (i = 0; i < this.skyObjects.length; i++) {
      o = this.skyObjects[i]; q = skyPos(o); if (Math.abs(q[0]) > asp + o.r * 1.2 || Math.abs(q[1]) > 1 + o.r * 1.2) continue;
      this.sprite(this.tex[o.tex], q[0], q[1], o.r, o.r, (o.rot || 0) + roll, 1, (o.gain || 1) * (o.boost ? gain * gain : 1), !!o.add);
    }
    // étoiles filantes d'arrière-plan
    for (var k = 0; k < 2; k++) {
      var per = 4.3 + k * 2.9, n = Math.floor(t / per + k * 0.37), ph = (t / per + k * 0.37 - n) * per / 0.75;
      if (ph < 1) { var rr = rand(n * 97 + k * 13 + 5), sx0 = (rr() * 2 - 1) * asp * 0.9, sy0 = 0.15 + rr() * 0.8, ang = Math.PI + (rr() - 0.5) * 1.2 + (sx0 > 0 ? 0.5 : -0.5), len = 0.25 + rr() * 0.25;
        var e = 1 - Math.pow(1 - ph, 2), hx = sx0 + Math.cos(ang) * e * 0.9, hy = sy0 + Math.sin(ang) * e * 0.9 * 0.6 - e * 0.25, a2 = Math.atan2(Math.sin(ang) * 0.6 - 0.28, Math.cos(ang));
        this.sprite(this.tex.streak, hx - Math.cos(a2) * len * 0.5, hy - Math.sin(a2) * len * 0.5, len * 0.5, 0.012, a2, Math.sin(ph * Math.PI) * 0.9, 1, true); }
    }

    // 4. étoiles proches (points + traînées de vitesse)
    gl.useProgram(ps.p); gl.blendFunc(gl.ONE, gl.ONE); gl.uniform1f(u.uFar, 0); gl.uniform1f(u.uLine, 0);
    this.bindStars(this.bPts); gl.drawArrays(gl.POINTS, 0, this.near);
    var streak = Math.min(s.speed, 1.6) * 2.4;
    if (streak > 0.04) { gl.uniform1f(u.uStreak, streak); gl.uniform1f(u.uLine, 1); this.bindStars(this.bLines); gl.drawArrays(gl.LINES, 0, this.near * 2); }

    // 5. planètes et astéroïdes sur le trajet (du plus loin au plus proche)
    gl.useProgram(sp.p); quad(sp);
    var kx = Math.min(1, Math.max(0.34, asp / 1.6)), tall = asp < 1, vis = [];
    for (i = 0; i < this.objects.length; i++) {
      o = this.objects[i]; var z = o.z - s.z; if (z < 0.12 || z > 13) continue; vis.push([z, o]);
    }
    vis.sort(function (a, b) { return b[0] - a[0]; });
    for (i = 0; i < vis.length; i++) {
      var zz = vis[i][0]; o = vis[i][1];
      var ox = o.rock ? o.x * (tall ? 0.55 : 1) : o.x * kx, oy = o.rock ? o.y : (tall ? o.y * 0.5 + 2.4 : o.y), rad = o.r * (tall ? 0.62 : 1);
      var px = (ox - s.x) / zz * 1.25, py = (oy - s.y) / zz * 1.25, size = rad / zz * 1.25;
      if (Math.abs(px) > asp + size * 1.5 || Math.abs(py) > 1 + size * 1.5) continue;
      var X = px * cr - py * sr + lx, Y = px * sr + py * cr + ly;
      var al = sstep(13, 8.5, zz) * sstep(0.12, o.rock ? 0.5 : 0.9, zz);
      if (o.rock && zz < 2.2) close = Math.max(close, (1 - zz / 2.2) * Math.max(0, 1 - Math.hypot(px, py) / 1.6));
      this.sprite(this.tex[o.tex], X, Y, size, size, (o.rot || 0) + (o.spin || 0) * t + roll, al, o.gain || 1, false);
    }
    return close;
  };
  Space.prototype.bindStars = function (b) {
    var gl = this.gl, a = this.pStar.a; gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.enableVertexAttribArray(a.aPos); gl.vertexAttribPointer(a.aPos, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(a.aSeed); gl.vertexAttribPointer(a.aSeed, 3, gl.FLOAT, false, 28, 12);
    gl.enableVertexAttribArray(a.aEnd); gl.vertexAttribPointer(a.aEnd, 1, gl.FLOAT, false, 28, 24);
  };

  /* Repli sans WebGL : étoiles seules */
  Space.prototype.init2d = function () { var r = rand(7), n = 700, D = this.depth; this.s2 = []; for (var i = 0; i < n; i++) this.s2.push([(r() * 2 - 1) * 30, (r() * 2 - 1) * 21, r() * D, 0.4 + r()]); };
  Space.prototype.render2d = function (cam) {
    var c = this.ctx; if (!c) return; var w = this.w, h = this.h, D = this.depth;
    c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff';
    for (var i = 0; i < this.s2.length; i++) {
      var s = this.s2[i], z = (((s[2] - cam) % D) + D) % D; if (z < 0.05) continue;
      var x = w / 2 + (s[0] / z) * 1.25 * h / 2, y = h / 2 - (s[1] / z) * 1.25 * h / 2; if (x < 0 || x > w || y < 0 || y > h) continue;
      c.globalAlpha = Math.min(1, (D - z) / (D * 0.28)) * s[3] * 0.8; var sz = Math.min(3.2, 0.7 + 1.3 / z) * this.dpr; c.fillRect(x, y, sz, sz);
    }
    c.globalAlpha = 1;
  };

  window.MiwaveSpace = Space;
})();
