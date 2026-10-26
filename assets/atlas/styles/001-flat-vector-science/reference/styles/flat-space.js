{
  // ---------- Flat-vector science explainer: deep space gradients, chunky shaded balls, crescent shadows, glows ----------
  const TAU = Math.PI * 2;
  const cl = H.clamp, lerp = H.lerp;
  const seg = (t, a, b) => cl((t - a) / (b - a));
  const eo = H.ease.out, eio = H.ease.inOut;
  // gentle overshoot
  const back = (u, s = 1.5) => { if (u <= 0) return 0; if (u >= 1) return 1; return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };
  const FONT = '"Nunito", "Fredoka", sans-serif';
  const F = (w, px) => `${w} ${px}px ${FONT}`;

  const C = {
    sky0: '#090b2c', sky1: '#18134f', sky2: '#3a1a6c',
    ink: '#141846', visor: '#10164a',
    teal: ['#a4fbef', '#3ccbdc', '#1d64b0'],
    orange: ['#ffcc7a', '#ff8d3f', '#d24a2a'],
    tan: ['#ffe9be', '#ecb676', '#b4723c'],
    yellow: '#ffd23f', pink: '#ff5d8f', red: '#ff3b5c', green: '#38e08e', cyan: '#56e8ff', violet: '#8b5cff',
  };

  // ---------- timeline of the explainer (shared with explainerSound) ----------
  const TL = {
    title: 0.15, titleShrink: [1.8, 2.4], robotIn: [0.5, 1.4], robotMove: [1.9, 2.8],
    arrow: [2.55, 3.1], count: [2.8, 5.6], travel: 1.5,
    zoom: [4.55, 5.8], sweep: [5.95, 6.85],
    catIn: [6.35, 6.95], guess: 6.95, bubble: 7.15, check: 7.6, wrong: 7.75,
    err: [8.05, 8.6], adjust: 8.6, zoomIn: [8.65, 9.1], rewire: [8.75, 9.35], zoomBack: [9.45, 9.85],
    guess2: 9.6, right: 9.75, toC: [10.3, 10.8], acc: [11.0, 12.55], hit: 12.55,
    take: [13.0, 13.75], line1: 13.3, line2: 13.55, D: 15,
  };
  // creature spawn times on the data stream
  const SPAWN = (() => { const a = []; let s = 2.75, i = 0; while (s < 5.3) { a.push(s); s += Math.max(0.18, 0.38 - i * 0.03); i++; } return a; })();
  const KIND = (i) => ['cat', 'dog', 'cat', 'cat', 'dog', 'dog', 'cat', 'dog'][i % 8];

  // ---------- small helpers ----------
  function rr(x, X, Y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r);
    x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath();
  }
  function glow(x, cx, cy, r, col, a) {
    if (a <= 0 || r <= 0) return;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, H.rgba(col, a)); g.addColorStop(0.35, H.rgba(col, a * 0.4)); g.addColorStop(1, H.rgba(col, 0));
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
  }
  function spark(x, cx, cy, r, col, a) {
    if (a <= 0 || r <= 0) return;
    x.save(); x.globalAlpha *= a; x.fillStyle = col; x.beginPath();
    x.moveTo(cx, cy - r); x.quadraticCurveTo(cx, cy, cx + r, cy); x.quadraticCurveTo(cx, cy, cx, cy + r);
    x.quadraticCurveTo(cx, cy, cx - r, cy); x.quadraticCurveTo(cx, cy, cx, cy - r); x.fill(); x.restore();
  }
  // region of circle (cx,cy,r) NOT covered by the same circle shifted by (dx,dy)
  function crescent(x, cx, cy, r, dx, dy, fill) {
    x.save(); x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.clip();
    x.beginPath(); x.rect(cx - r - 2, cy - r - 2, 2 * r + 4, 2 * r + 4); x.arc(cx + dx, cy + dy, r * 1.02, 0, TAU);
    x.fillStyle = fill; x.fill('evenodd'); x.restore();
  }
  // the core flat-vector ball: multi-stop gradient, two stepped flat shadow crescents, rim highlight
  function ball(x, cx, cy, r, col, o = {}) {
    if (r <= 0.3) return;
    const la = o.la == null ? -2.25 : o.la, lx = Math.cos(la), ly = Math.sin(la);
    const g = x.createLinearGradient(cx + lx * r, cy + ly * r, cx - lx * r, cy - ly * r);
    g.addColorStop(0, col[0]); g.addColorStop(0.45, col[1]); g.addColorStop(1, H.rgba(H.mix(col[1], col[2], 0.6)));
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    if (o.inner) { x.save(); x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.clip(); o.inner(); x.restore(); }
    const sh = o.sh == null ? 0.3 : o.sh;
    crescent(x, cx, cy, r, lx * r * sh, ly * r * sh, H.rgba(col[2], o.sha == null ? 0.5 : o.sha));
    crescent(x, cx, cy, r, lx * r * sh * 2.2, ly * r * sh * 2.2, H.rgba(col[2], (o.sha == null ? 0.5 : o.sha) * 0.45));
    crescent(x, cx, cy, r, -lx * r * 0.075, -ly * r * 0.075, H.rgba(o.rim || '#ffffff', o.rima == null ? 0.42 : o.rima));
  }
  const bez = (P, u) => { const v = 1 - u; return [v * v * v * P[0][0] + 3 * v * v * u * P[1][0] + 3 * v * u * u * P[2][0] + u * u * u * P[3][0], v * v * v * P[0][1] + 3 * v * v * u * P[1][1] + 3 * v * u * u * P[2][1] + u * u * u * P[3][1]]; };
  // rounded dotted / solid arrow along a cubic, drawn on to `prog`
  function arrow(x, P, prog, col, lw, o = {}) {
    if (prog <= 0) return;
    const n = 48, a = o.a == null ? 1 : o.a;
    x.save(); x.globalAlpha *= a; x.strokeStyle = col; x.fillStyle = col; x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round';
    if (o.dots) x.setLineDash([0.01, lw * 1.9]);
    x.beginPath(); const p0 = bez(P, o.from || 0); x.moveTo(p0[0], p0[1]);
    for (let i = 1; i <= n; i++) { const u = (o.from || 0) + ((prog - (o.from || 0)) * i) / n; const p = bez(P, u); x.lineTo(p[0], p[1]); }
    x.stroke(); x.setLineDash([]);
    if (o.head !== false && prog > 0.08) {
      const e = bez(P, prog), e0 = bez(P, prog - 0.02), ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]), hs = lw * 1.5 * cl(prog * 5);
      x.translate(e[0], e[1]); x.rotate(ang); x.beginPath(); x.moveTo(hs * 1.1, 0); x.lineTo(-hs * 0.8, hs); x.lineTo(-hs * 0.8, -hs); x.closePath();
      x.lineWidth = lw * 0.7; x.fill(); x.stroke();
    }
    x.restore();
  }
  // flat text with a darker offset "long shadow"
  function text(x, s, cx, cy, px, col, o = {}) {
    x.save(); x.font = F(o.w || 900, px); x.textAlign = o.align || 'center'; x.textBaseline = 'middle';
    x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = o.shadow || 'rgba(10,8,46,0.55)'; x.fillText(s, cx + px * 0.03, cy + px * 0.07);
    x.fillStyle = col; x.fillText(s, cx, cy); x.restore();
  }
  // rounded label pill, optional pointer below
  function pill(x, cx, cy, s, px, o = {}) {
    const sc = o.s == null ? 1 : o.s, a = o.a == null ? 1 : o.a;
    if (sc <= 0.01 || a <= 0.01) return;
    x.save(); x.font = F(o.w || 900, px);
    const tw = x.measureText(s).width, w = tw + px * 1.15, h = px * 1.6;
    x.translate(cx, cy); x.scale(sc, sc); x.globalAlpha *= a;
    x.fillStyle = 'rgba(10,8,46,0.4)'; rr(x, -w / 2, -h / 2 + px * 0.2, w, h, h / 2); x.fill();
    x.fillStyle = o.bg || '#ffffff';
    if (o.ptr) { x.beginPath(); x.moveTo(-px * 0.35, h / 2 - 2); x.lineTo(0, h / 2 + px * 0.45); x.lineTo(px * 0.35, h / 2 - 2); x.fill(); }
    rr(x, -w / 2, -h / 2, w, h, h / 2); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.35)'; rr(x, -w / 2 + h * 0.25, -h / 2 + h * 0.12, w - h * 0.5, h * 0.16, h * 0.08); x.fill();
    x.fillStyle = o.fg || C.ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, 0, px * 0.06);
    x.restore();
    return w;
  }

  // ---------- sky: gradient, nebula glows, parallax stars and sparkles ----------
  let STARS = null;
  function stars() {
    if (STARS) return STARS;
    const r = H.rng(77), a = [], sp = [];
    for (let i = 0; i < 620; i++) a.push({ x: r.range(0, 1680), y: r.range(0, 1120), d: r.pick([0.15, 0.3, 0.3, 0.55, 1]), s: r.range(0.6, 2.0), ph: r.range(0, TAU), sp: r.range(0.8, 2.6), c: r.pick(['#ffffff', '#cfe4ff', '#ffe9c7', '#dccbff']) });
    for (let i = 0; i < 16; i++) sp.push({ x: r.range(0, 1680), y: r.range(0, 1120), d: r.range(0.3, 0.9), s: r.range(6, 13), ph: r.range(0, TAU) });
    STARS = { a, sp }; return STARS;
  }
  function sky(x, W, H_, t, cam = {}) {
    const px = cam.x || 0, py = cam.y || 0, lz = Math.log(cam.z || 1);
    const g = x.createLinearGradient(0, 0, W * 0.3, H_);
    g.addColorStop(0, C.sky0); g.addColorStop(0.5, C.sky1); g.addColorStop(1, C.sky2);
    x.fillStyle = g; x.fillRect(0, 0, W, H_);
    glow(x, W * 0.86, H_ * 0.12, 700, '#7b34c6', 0.34);
    glow(x, W * 0.05, H_ * 1.0, 620, '#2448b4', 0.4);
    glow(x, W * 0.45, H_ * 0.6, 520, '#4a2a9c', 0.16);
    const S = stars();
    const place = (s) => {
      const k = Math.exp(lz * s.d * 0.6);
      let sx = (((s.x - px * s.d) % 1680) + 1680) % 1680 - 200, sy = (((s.y - py * s.d) % 1120) + 1120) % 1120 - 200;
      return [(sx - 640) * k + 640, (sy - 360) * k + 360];
    };
    for (const s of S.a) {
      const [sx, sy] = place(s);
      if (sx < -4 || sx > W + 4 || sy < -4 || sy > H_ + 4) continue;
      x.globalAlpha = (0.55 + 0.45 * Math.sin(t * s.sp + s.ph)) * (0.45 + s.d * 0.55);
      x.fillStyle = s.c; x.beginPath(); x.arc(sx, sy, s.s * (0.7 + 0.35 * s.d), 0, TAU); x.fill();
    }
    x.globalAlpha = 1;
    for (const s of S.sp) {
      const [sx, sy] = place(s); const tw = 0.6 + 0.4 * Math.sin(t * 1.7 + s.ph);
      glow(x, sx, sy, s.s * 2.2, '#bfa8ff', 0.25 * tw);
      spark(x, sx, sy, s.s * tw, '#ffffff', 0.9);
    }
  }

  // ---------- planets ----------
  function ring(x, cx, cy, R, half, a = 1) {
    if (a <= 0) return;
    x.save(); x.translate(cx, cy); x.rotate(R.tilt); x.globalAlpha *= a;
    // clip to the back or front half, wide enough for the outermost band so the ring ends are never cut off
    const m = Math.max(...R.bands.map((b) => b[1])) * 1.05;
    x.beginPath(); if (half === 'back') x.rect(-R.rx * m, -R.ry * m, R.rx * m * 2, R.ry * m); else x.rect(-R.rx * m, 0, R.rx * m * 2, R.ry * m); x.clip();
    for (const [f0, f1, col, al] of R.bands) {
      x.beginPath(); x.ellipse(0, 0, R.rx * f1, R.ry * f1, 0, 0, TAU); x.ellipse(0, 0, R.rx * f0, R.ry * f0, 0, 0, TAU);
      x.fillStyle = H.rgba(col, (al == null ? 1 : al) * (half === 'back' ? 0.75 : 1)); x.fill('evenodd');
    }
    x.restore();
  }
  function bands(x, r, B, tilt) {
    x.save(); x.rotate(tilt || 0);
    for (const [v0, v1, col, a] of B) {
      x.beginPath();
      for (let i = 0; i <= 20; i++) { const u = (i / 20) * 2 - 1; x.lineTo(u * r * 1.1, (v0 + 0.13 * (1 - u * u)) * r); }
      for (let i = 20; i >= 0; i--) { const u = (i / 20) * 2 - 1; x.lineTo(u * r * 1.1, (v1 + 0.13 * (1 - u * u)) * r); }
      x.fillStyle = H.rgba(col, a == null ? 1 : a); x.fill();
    }
    x.restore();
  }
  const PL = {
    magenta: { c: ['#ffa0c4', '#de4b93', '#4e1670'], glow: '#ff5fa8', tilt: -0.18, atmo: [255, 214, 234],
      bands: [[-0.62, -0.48, '#ffc1d8', 0.55], [-0.2, -0.02, '#b5307e', 0.6], [0.06, 0.14, '#ffd0e2', 0.4], [0.36, 0.58, '#9a2775', 0.55]],
      ring: { rx: 1.75, ry: 0.5, tilt: -0.2, bands: [[1.18, 1.32, '#ffd27a', 0.95], [1.34, 1.5, '#ff9f5a', 0.9], [1.53, 1.6, '#ffe7b0', 0.8]] } },
    coral: { c: ['#ffd29a', '#ff7a4a', '#7a1f4f'], glow: '#ff8a50', tilt: 0.1, atmo: [255, 226, 190],
      bands: [[-0.7, -0.5, '#ffe2b8', 0.5], [-0.32, -0.12, '#e8553a', 0.6], [0.05, 0.22, '#ffb27a', 0.5], [0.4, 0.62, '#c43c46', 0.55]] },
    teal: { c: ['#9ff3ff', '#3a9be0', '#1d2f86'], glow: '#4fc9ff', tilt: -0.12, atmo: [190, 245, 255],
      bands: [[-0.5, -0.36, '#c6f8ff', 0.5], [-0.05, 0.1, '#2f74c9', 0.55], [0.32, 0.5, '#7fdcff', 0.4]] },
    moon: { c: ['#e8e6ff', '#a7a2d8', '#4a3f8c'], craters: true },
  };
  function planet(x, cx, cy, r, pal, o = {}) {
    if (r <= 0.5) return;
    const ra = o.ringA == null ? 1 : o.ringA;
    if (pal.glow) glow(x, cx, cy, r * 1.7, pal.glow, o.glowA == null ? 0.32 : o.glowA);
    const R = pal.ring && { rx: pal.ring.rx * r, ry: pal.ring.ry * r, tilt: pal.ring.tilt, bands: pal.ring.bands };
    if (R) ring(x, cx, cy, R, 'back', ra);
    if (o.behind) o.behind(R);
    ball(x, cx, cy, r, pal.c, {
      sh: 0.34, sha: 0.55, rima: 0.35,
      inner: () => {
        x.save(); x.translate(cx, cy);
        if (pal.bands) bands(x, r, pal.bands, pal.tilt);
        if (pal.craters) { const q = H.rng(5); for (let i = 0; i < 5; i++) { const a = q.range(0, TAU), d = q.range(0.1, 0.65) * r, cr = q.range(0.1, 0.2) * r, qx = Math.cos(a) * d, qy = Math.sin(a) * d; x.fillStyle = 'rgba(80,66,150,0.38)'; x.beginPath(); x.arc(qx, qy, cr, 0, TAU); x.fill(); crescent(x, qx, qy, cr, -cr * 0.3, -cr * 0.3, 'rgba(255,255,255,0.3)'); } }
        x.restore();
      },
    });
    const atA = o.atmo == null ? 0.7 : o.atmo;
    if (pal.atmo && atA > 0) { // thin bright atmosphere on the limb, strongest on the lit (upper-left) side
      x.save(); x.lineCap = 'round'; const ga0 = x.globalAlpha;
      const la = -2.25, ag = x.createLinearGradient(cx + Math.cos(la) * r, cy + Math.sin(la) * r, cx - Math.cos(la) * r, cy - Math.sin(la) * r);
      ag.addColorStop(0, H.rgba(pal.atmo, 1)); ag.addColorStop(0.55, H.rgba(pal.atmo, 0.5)); ag.addColorStop(1, H.rgba(pal.atmo, 0.08));
      x.strokeStyle = ag;
      for (const [lw, a] of [[r * 0.05, 0.08], [r * 0.028, 0.16], [r * 0.014, 0.3], [Math.max(2, r * 0.006), 0.6]]) { x.globalAlpha = ga0 * a * atA; x.lineWidth = lw; x.beginPath(); x.arc(cx, cy, r + lw * 0.15, 0, TAU); x.stroke(); }
      x.restore();
    }
    if (R) ring(x, cx, cy, R, 'front', ra);
    if (o.front) o.front(R);
  }

  // ---------- print finish: fine animated grain + soft static mottling (overlay), kills gradient banding ----------
  let GRAIN = null;
  function grainTex() {
    if (GRAIN) return GRAIN;
    const S = 256, tile = H.layer(S, S), tc = tile.getContext('2d'), img = tc.createImageData(S, S), d = img.data, r = H.rng(4242);
    for (let i = 0; i < d.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 92; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    tc.putImageData(img, 0, 0);
    const MW = 320, MH = 180, mot = H.layer(MW, MH), mc = mot.getContext('2d'), mi = mc.createImageData(MW, MH), md = mi.data, nz = H.makeNoise(88);
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const v = 128 + nz.fbm2(x * 0.035, y * 0.035, 4) * 70 + nz.n2(x * 0.22, y * 0.22) * 14, k = (y * MW + x) * 4; md[k] = md[k + 1] = md[k + 2] = v; md[k + 3] = 255; }
    mc.putImageData(mi, 0, 0);
    GRAIN = { tile, mot };
    return GRAIN;
  }
  function finish(x, W, H_, t) {
    const G = grainTex(), f = Math.floor(t * 24);
    x.save(); x.globalCompositeOperation = 'overlay';
    x.globalAlpha = 0.12; x.imageSmoothingEnabled = true; x.drawImage(G.mot, 0, 0, W, H_);
    const pat = x.createPattern(G.tile, 'repeat'); pat.setTransform(new DOMMatrix().translateSelf((f * 73) % 256, (f * 151) % 256));
    x.globalAlpha = 0.09; x.fillStyle = pat; x.fillRect(0, 0, W, H_);
    x.restore();
  }

  // ---------- eyes (big white, dark pupils) ----------
  function eye(x, ex, ey, er, o) {
    const look = o.look || [0, 0];
    if ((o.happy || 0) > 0.5) {
      x.save(); x.strokeStyle = '#ffffff'; x.lineWidth = er * 0.42; x.lineCap = 'round';
      x.beginPath(); x.arc(ex, ey + er * 0.35, er * 0.62, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); x.restore(); return;
    }
    const bl = 1 - 0.92 * (o.blink || 0);
    x.save(); x.translate(ex, ey); x.scale(1, bl);
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(0, 0, er, 0, TAU); x.fill();
    const pr = er * (o.worry ? 0.5 : 0.56);
    const px = look[0] * er * 0.36, py = look[1] * er * 0.36;
    x.fillStyle = '#141638'; x.beginPath(); x.arc(px, py, pr, 0, TAU); x.fill();
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(px - pr * 0.35, py - pr * 0.4, pr * 0.32, 0, TAU); x.fill();
    x.beginPath(); x.arc(px + pr * 0.35, py + pr * 0.35, pr * 0.13, 0, TAU); x.fill();
    x.restore();
  }
  const blinkAt = (t, ph) => { const u = (t + ph) % 3.3; return u < 0.14 ? Math.sin((u / 0.14) * Math.PI) : 0; };

  // ---------- the AI: a chunky round robot with a glass brain dome ----------
  const NET = (() => {
    const r = H.rng(31), L = [[-0.6, [-0.42, 0.02, 0.44]], [0, [-0.58, -0.2, 0.2, 0.58]], [0.6, [-0.4, 0.04, 0.44]]];
    const nodes = []; L.forEach(([lx, ys], li) => ys.forEach((y) => nodes.push({ x: lx, y: y - 0.05, l: li })));
    const byL = (l) => nodes.map((n, i) => [n, i]).filter(([n]) => n.l === l).map(([, i]) => i);
    const edges = [];
    const l0 = byL(0), l1 = byL(1), l2 = byL(2);
    l0.forEach((a, k) => { const tA = [l1[k], l1[k + 1]], tB = [l1[(k + 2) % 4], l1[k + 1]]; tA.forEach((b, j) => edges.push({ a, b, b2: tB[j], w: r.range(0.2, 0.5), w2: r.range(0.6, 1) })); });
    l1.forEach((a, k) => { const tA = [l2[k % 3], l2[(k + 1) % 3]], tB = [l2[(k + 2) % 3], l2[(k + 1) % 3]]; tA.forEach((b, j) => edges.push({ a, b, b2: tB[j], w: r.range(0.2, 0.5), w2: r.range(0.6, 1) })); });
    return { nodes, edges };
  })();
  function network(x, cx, cy, dr, o) {
    const rw = o.rewire || 0, br = o.bright == null ? 0.5 : o.bright, err = o.err || 0, t = o.t || 0, s = dr * 0.82;
    const P = (i) => [cx + NET.nodes[i].x * s, cy + NET.nodes[i].y * s];
    x.save(); x.lineCap = 'round';
    NET.edges.forEach((e, k) => {
      const a = P(e.a), b0 = P(e.b), b1 = P(e.b2), m = eio(cl(rw * 1.25 - (k % 6) * 0.05));
      const b = [lerp(b0[0], b1[0], m), lerp(b0[1], b1[1], m)], w = lerp(e.w, e.w2, m);
      const col = H.mix(H.mix('#7a5cff', '#ffd23f', w * (0.4 + br * 0.6)), '#ff3b5c', err);
      x.strokeStyle = H.rgba(col, 0.55 + 0.45 * w); x.lineWidth = dr * (0.025 + 0.05 * w);
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - dr * 0.08;
      x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo(mx, my, b[0], b[1]); x.stroke();
      // a little signal dot running along
      const u = (t * 0.9 + k * 0.137) % 1, v = 1 - u;
      const qx = v * v * a[0] + 2 * v * u * mx + u * u * b[0], qy = v * v * a[1] + 2 * v * u * my + u * u * b[1];
      x.fillStyle = H.rgba(err > 0.3 ? '#ffb0bf' : '#fff6c8', 0.8 * (0.4 + br * 0.6)); x.beginPath(); x.arc(qx, qy, dr * 0.035, 0, TAU); x.fill();
    });
    NET.nodes.forEach((n, i) => {
      const [nx, ny] = P(i), pulse = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.3);
      const col = H.mix(H.mix('#9b7bff', '#ffe066', br), '#ff4a66', err);
      glow(x, nx, ny, dr * (0.2 + 0.22 * br), col, 0.35 + 0.4 * br);
      x.fillStyle = H.rgba(col); x.beginPath(); x.arc(nx, ny, dr * (0.085 + 0.03 * br), 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.75)'; x.beginPath(); x.arc(nx - dr * 0.025, ny - dr * 0.025, dr * 0.035, 0, TAU); x.fill();
    });
    x.restore();
  }
  function robot(x, cx, cy, R, o = {}) {
    if (R < 1) return;
    const t = o.t || 0, red = o.red || 0, happy = o.happy || 0, worry = o.worry || 0;
    if (red > 0) glow(x, cx, cy - R * 0.4, R * 2.2, '#ff3b5c', 0.5 * red);
    // thruster flame
    const fl = 1 + 0.14 * Math.sin(t * 29) + 0.08 * Math.sin(t * 13.7);
    glow(x, cx, cy + R * 1.25, R * 0.95, '#ff9a3d', 0.4);
    x.fillStyle = '#ff8a3d'; x.beginPath(); x.moveTo(cx - R * 0.25, cy + R * 0.9);
    x.quadraticCurveTo(cx - R * 0.2, cy + R * (1.25 + 0.2 * fl), cx, cy + R * (1.35 + 0.42 * fl)); x.quadraticCurveTo(cx + R * 0.2, cy + R * (1.25 + 0.2 * fl), cx + R * 0.25, cy + R * 0.9); x.fill();
    x.fillStyle = '#ffd94a'; x.beginPath(); x.moveTo(cx - R * 0.13, cy + R * 0.92);
    x.quadraticCurveTo(cx - R * 0.1, cy + R * (1.15 + 0.1 * fl), cx, cy + R * (1.2 + 0.22 * fl)); x.quadraticCurveTo(cx + R * 0.1, cy + R * (1.15 + 0.1 * fl), cx + R * 0.13, cy + R * 0.92); x.fill();
    x.fillStyle = '#16307a'; rr(x, cx - R * 0.32, cy + R * 0.78, R * 0.64, R * 0.22, R * 0.08); x.fill();
    // arms
    for (const sd of [-1, 1]) {
      const up = (o.armUp || 0) * (sd > 0 ? 1 : 0.6), ang = sd * (0.55 + 0.12 * Math.sin(t * 2.2 + sd)) - sd * up * 1.6;
      const sx = cx + sd * R * 0.86, sy = cy + R * 0.12, ex = sx + Math.sin(ang) * R * 0.55, ey = sy + Math.cos(ang) * R * 0.55;
      x.strokeStyle = '#1d5aa6'; x.lineWidth = R * 0.24; x.lineCap = 'round'; x.beginPath(); x.moveTo(sx, sy); x.lineTo(ex, ey); x.stroke();
      ball(x, ex, ey, R * 0.17, C.teal, { sha: 0.4 });
    }
    // brain dome (glass) with the glowing network inside
    const dr = R * 0.76, dx = cx, dy = cy - R * 1.02;
    glow(x, dx, dy, dr * 2.0, red > 0.2 ? '#ff3b5c' : '#58e6ff', 0.22 + 0.25 * (o.brainGlow || 0) + 0.2 * red);
    x.save(); x.beginPath(); x.arc(dx, dy, dr, 0, TAU); x.clip();
    const dg = x.createRadialGradient(dx - dr * 0.3, dy - dr * 0.3, 0, dx, dy, dr * 1.1);
    dg.addColorStop(0, '#2a3a9c'); dg.addColorStop(0.6, '#18206a'); dg.addColorStop(1, '#0d1146');
    x.fillStyle = dg; x.fillRect(dx - dr, dy - dr, dr * 2, dr * 2);
    if (red > 0) { x.fillStyle = H.rgba('#ff3b5c', 0.3 * red); x.fillRect(dx - dr, dy - dr, dr * 2, dr * 2); }
    network(x, dx, dy - dr * 0.12, dr * 0.92, o);
    x.restore();
    crescent(x, dx, dy, dr, dr * 0.1, dr * 0.12, 'rgba(190,250,255,0.55)');
    crescent(x, dx, dy, dr, -dr * 0.22, -dr * 0.2, 'rgba(8,10,50,0.28)');
    x.save(); x.strokeStyle = 'rgba(255,255,255,0.6)'; x.lineWidth = dr * 0.09; x.lineCap = 'round';
    x.beginPath(); x.arc(dx, dy, dr * 0.74, Math.PI * 1.08, Math.PI * 1.36); x.stroke();
    x.fillStyle = 'rgba(255,255,255,0.6)'; x.beginPath(); x.arc(dx + dr * 0.74 * Math.cos(Math.PI * 1.5), dy - dr * 0.74, dr * 0.05, 0, TAU); x.fill(); x.restore();
    // collar
    x.fillStyle = '#1b4c9c'; rr(x, cx - R * 0.6, cy - R * 0.84, R * 1.2, R * 0.26, R * 0.13); x.fill();
    x.fillStyle = 'rgba(160,240,255,0.5)'; rr(x, cx - R * 0.5, cy - R * 0.81, R * 0.7, R * 0.06, R * 0.03); x.fill();
    // body
    ball(x, cx, cy, R, C.teal, { sha: 0.5 });
    // visor face
    const vw = R * 1.36, vh = R * 0.78, vx = cx - vw / 2 + R * 0.02, vy = cy - R * 0.42;
    x.fillStyle = '#0c1145'; rr(x, vx, vy + R * 0.05, vw, vh, R * 0.34); x.fill();
    const vg = x.createLinearGradient(vx, vy, vx + vw, vy + vh); vg.addColorStop(0, '#26338e'); vg.addColorStop(0.5, '#151c5c'); vg.addColorStop(1, '#0d1246');
    x.fillStyle = vg; rr(x, vx, vy, vw, vh, R * 0.34); x.fill();
    x.fillStyle = 'rgba(160,240,255,0.22)'; rr(x, vx + R * 0.16, vy + R * 0.07, vw * 0.45, R * 0.07, R * 0.035); x.fill();
    const ey = vy + vh * 0.48, er = R * 0.19, look = o.look || [0, 0];
    for (const sd of [-1, 1]) eye(x, cx + sd * R * 0.3, ey, er, { look, blink: o.blink, happy, worry: worry > 0.5 });
    // brows when worried
    if (worry > 0.02) {
      x.save(); x.globalAlpha *= cl(worry * 2); x.strokeStyle = '#9ff7ff'; x.lineWidth = R * 0.065; x.lineCap = 'round';
      for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(cx + sd * R * 0.46, ey - er * 1.05); x.lineTo(cx + sd * R * 0.16, ey - er * 1.5); x.stroke(); }
      x.restore();
    }
    // mouth
    x.save(); x.strokeStyle = '#9ff7ff'; x.lineWidth = R * 0.06; x.lineCap = 'round'; x.beginPath();
    const my = vy + vh * 0.86;
    if (worry > 0.5) { x.moveTo(cx - R * 0.12, my); x.quadraticCurveTo(cx - R * 0.06, my - R * 0.06, cx, my); x.quadraticCurveTo(cx + R * 0.06, my + R * 0.06, cx + R * 0.12, my); }
    else if (happy > 0.5) { x.arc(cx, my - R * 0.06, R * 0.12, 0.15 * Math.PI, 0.85 * Math.PI); }
    else { x.arc(cx, my - R * 0.1, R * 0.1, 0.3 * Math.PI, 0.7 * Math.PI); }
    x.stroke(); x.restore();
    // belly lights
    ['#ffd23f', '#ff5d8f', '#56e8ff'].forEach((c, i) => { const bx = cx + (i - 1) * R * 0.2, by = cy + R * 0.58; glow(x, bx, by, R * 0.12, c, 0.5); x.fillStyle = c; x.beginPath(); x.arc(bx, by, R * 0.055, 0, TAU); x.fill(); });
    // sweat drop
    if (worry > 0.3) {
      const sx = cx + R * 0.82, sy = cy - R * 0.38 + (t * 40 % (R * 0.3));
      x.save(); x.globalAlpha *= cl((worry - 0.3) * 3); x.fillStyle = '#7fe6ff';
      x.beginPath(); x.moveTo(sx, sy - R * 0.16); x.quadraticCurveTo(sx + R * 0.09, sy, sx, sy + R * 0.06); x.quadraticCurveTo(sx - R * 0.09, sy, sx, sy - R * 0.16); x.fill(); x.restore();
    }
  }

  // ---------- creatures: little cat and dog (training data) ----------
  function cat(x, cx, cy, r, o = {}) {
    if (r < 1) return;
    const t = o.t || 0;
    x.save(); x.translate(cx, cy); x.rotate(o.rot || 0);
    x.strokeStyle = C.orange[2]; x.lineWidth = r * 0.24; x.lineCap = 'round';
    x.beginPath(); x.moveTo(r * 0.6, r * 0.55); x.quadraticCurveTo(r * 1.4, r * 0.55 + Math.sin(t * 3) * r * 0.12, r * 1.18, -r * 0.2); x.stroke();
    for (const sd of [-1, 1]) {
      x.fillStyle = sd < 0 ? C.orange[1] : '#e8693a'; x.strokeStyle = x.fillStyle; x.lineWidth = r * 0.16; x.lineJoin = 'round';
      x.beginPath(); x.moveTo(sd * r * 0.82, -r * 0.3); x.lineTo(sd * r * 0.66, -r * 1.08); x.lineTo(sd * r * 0.14, -r * 0.8); x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#ff9fb4'; x.beginPath(); x.moveTo(sd * r * 0.66, -r * 0.48); x.lineTo(sd * r * 0.62, -r * 0.9); x.lineTo(sd * r * 0.32, -r * 0.74); x.closePath(); x.fill();
    }
    ball(x, 0, 0, r, C.orange, { sha: 0.45, inner: () => {
      x.fillStyle = 'rgba(200,70,40,0.55)';
      for (const k of [-1, 0, 1]) { rr(x, k * r * 0.17 - r * 0.045, -r * 0.92, r * 0.09, r * 0.3, r * 0.045); x.fill(); }
      x.fillStyle = 'rgba(255,240,220,0.9)'; x.beginPath(); x.ellipse(0, r * 0.42, r * 0.42, r * 0.3, 0, 0, TAU); x.fill();
    } });
    for (const sd of [-1, 1]) eye(x, sd * r * 0.36, -r * 0.08, r * 0.25, { look: o.look, blink: o.blink, happy: o.happy });
    x.fillStyle = '#ff6f8e'; x.beginPath(); x.moveTo(-r * 0.09, r * 0.22); x.lineTo(r * 0.09, r * 0.22); x.lineTo(0, r * 0.33); x.closePath(); x.fill();
    x.strokeStyle = '#7a2e2e'; x.lineWidth = r * 0.05; x.lineCap = 'round'; x.beginPath();
    x.arc(-r * 0.08, r * 0.36, r * 0.08, 0.1 * Math.PI, 0.9 * Math.PI); x.moveTo(r * 0.16, r * 0.36 + r * 0.025); x.arc(r * 0.08, r * 0.36, r * 0.08, 0.1 * Math.PI, 0.9 * Math.PI); x.stroke();
    x.restore();
  }
  function dog(x, cx, cy, r, o = {}) {
    if (r < 1) return;
    const t = o.t || 0;
    x.save(); x.translate(cx, cy); x.rotate(o.rot || 0);
    ball(x, 0, 0, r, C.tan, { sha: 0.45, inner: () => {
      x.fillStyle = 'rgba(150,85,40,0.55)'; x.beginPath(); x.arc(r * 0.38, -r * 0.2, r * 0.36, 0, TAU); x.fill();
      x.fillStyle = '#fff3dc'; x.beginPath(); x.ellipse(0, r * 0.36, r * 0.4, r * 0.3, 0, 0, TAU); x.fill();
    } });
    for (const sd of [-1, 1]) {
      x.save(); x.translate(sd * r * 0.86, -r * 0.18); x.rotate(sd * (0.35 + 0.08 * Math.sin(t * 4 + sd)));
      x.fillStyle = '#8b4f2c'; x.beginPath(); x.ellipse(0, r * 0.18, r * 0.27, r * 0.55, 0, 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,200,150,0.25)'; x.beginPath(); x.ellipse(-sd * r * 0.06, r * 0.05, r * 0.1, r * 0.3, 0, 0, TAU); x.fill();
      x.restore();
    }
    for (const sd of [-1, 1]) eye(x, sd * r * 0.34, -r * 0.12, r * 0.23, { look: o.look, blink: o.blink, happy: o.happy });
    x.fillStyle = '#2a1a2a'; x.beginPath(); x.ellipse(0, r * 0.22, r * 0.13, r * 0.09, 0, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.6)'; x.beginPath(); x.arc(-r * 0.04, r * 0.19, r * 0.03, 0, TAU); x.fill();
    x.fillStyle = '#ff6f8e'; rr(x, -r * 0.08, r * 0.38, r * 0.16, r * 0.17, r * 0.08); x.fill();
    x.restore();
  }
  const creature = (x, kind, cx, cy, r, o) => (kind === 'cat' ? cat : dog)(x, cx, cy, r, o);

  // speech bubble with a tail
  function bubble(x, cx, cy, w, h, tx, ty, s, col) {
    if (s <= 0.01) return;
    x.save(); x.translate(cx, cy); x.scale(s, s);
    x.fillStyle = 'rgba(10,8,46,0.4)'; rr(x, -w / 2, -h / 2 + 8, w, h, h / 2); x.fill();
    x.fillStyle = col || '#ffffff';
    x.beginPath(); x.moveTo(-w * 0.18, h * 0.3); x.lineTo((tx - cx) / s, (ty - cy) / s); x.lineTo(-w * 0.02, h * 0.42); x.fill();
    rr(x, -w / 2, -h / 2, w, h, h / 2); x.fill();
    x.restore();
  }
  function badge(x, cx, cy, r, ok, s) {
    if (s <= 0.01) return;
    x.save(); x.translate(cx, cy); x.scale(s, s);
    glow(x, 0, 0, r * 2.4, ok ? C.green : C.red, 0.45);
    ball(x, 0, 0, r, ok ? ['#9fffc8', C.green, '#178a5a'] : ['#ff9aa8', C.red, '#9c1638'], { sha: 0.4 });
    x.strokeStyle = '#ffffff'; x.lineWidth = r * 0.26; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath();
    if (ok) { x.moveTo(-r * 0.42, 0); x.lineTo(-r * 0.1, r * 0.32); x.lineTo(r * 0.45, -r * 0.3); }
    else { x.moveTo(-r * 0.34, -r * 0.34); x.lineTo(r * 0.34, r * 0.34); x.moveTo(r * 0.34, -r * 0.34); x.lineTo(-r * 0.34, r * 0.34); }
    x.stroke(); x.restore();
  }
  function flare(x, cx, cy, k, t, seed) {
    if (k <= 0) return;
    glow(x, cx, cy, 420 * (0.6 + 0.4 * k), '#ffcf5a', 0.55 * k);
    glow(x, cx, cy, 160, '#fff6d0', 0.6 * k);
    x.save(); x.translate(cx, cy); x.rotate(t * 0.25); x.globalAlpha *= 0.32 * k; x.fillStyle = '#ffe28a';
    for (let i = 0; i < 12; i++) { x.rotate(TAU / 12); x.beginPath(); x.moveTo(0, -12); x.lineTo(330 + 60 * (i % 2), 0); x.lineTo(0, 12); x.fill(); }
    x.restore();
  }
  function burst(x, cx, cy, age, seed, spread) {
    if (age < 0 || age > 1.4) return;
    const r = H.rng(seed);
    for (let i = 0; i < 18; i++) {
      const a = r.range(0, TAU), d = (spread || 300) * r.range(0.45, 1) * eo(cl(age / 0.9)), sz = r.range(7, 16) * (1 - cl(age / 1.4));
      spark(x, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, sz, r.pick(['#ffffff', '#ffe28a', '#9ff7ff', '#ffb0d0']), 1);
    }
  }

  // ---------- galaxy of examples (precomputed) ----------
  let GAL = null;
  function galaxyPts() {
    if (GAL) return GAL;
    const r = H.rng(901); GAL = [];
    for (let i = 0; i < 2600; i++) {
      const arm = i % 3, u = Math.pow(r(), 0.85), rr2 = 260 + 5300 * u;
      const ang = arm * (TAU / 3) + rr2 * 0.00075 + r.gauss() * (0.16 + 0.25 * (1 - u));
      GAL.push({ rr: rr2 * (1 + r.gauss() * 0.04), a: ang, s: r.range(1.2, 3.2), c: r.pick(['#ff9a4a', '#ffcc7a', '#ecb676', '#ffffff', '#9ff7ff', '#ff8fb8']) });
    }
    return GAL;
  }
  function galaxy(x, cx, cy, s, rot, a) {
    if (a <= 0.01) return;
    glow(x, cx, cy, 5600 * s * 0.55, '#8a5cff', 0.35 * a);
    glow(x, cx, cy, 5600 * s * 0.22, '#ffcf7a', 0.4 * a);
    x.save(); x.globalAlpha = a;
    for (const p of galaxyPts()) {
      const ang = p.a + rot, d = p.rr * s;
      if (d < 14) continue;
      const px = cx + Math.cos(ang) * d, py = cy + Math.sin(ang) * d * 0.52;
      if (px < -5 || px > 1285 || py < -5 || py > 725) continue;
      x.fillStyle = p.c; x.beginPath(); x.arc(px, py, p.s, 0, TAU); x.fill();
    }
    x.restore();
  }

  // ---------- header pill ----------
  function header(x, a) { pill(x, 186, 44, 'How does AI learn?', 28, { a, bg: 'rgba(255,255,255,0.95)' }); }

  // ================= EXPLAINER SCENES =================
  const ROBOT_A0 = [640, 470], ROBOT_A1 = [930, 400];
  const DOME_A1 = [ROBOT_A1[0], ROBOT_A1[1] - 1.02 * 100];
  const STREAM = [[-140, 230], [330, 720], [560, 60], [DOME_A1[0] - 40, DOME_A1[1] - 10]];

  function exA(x, W, H_, t) {
    const zo = eio(seg(t, TL.zoom[0], TL.zoom[1]));
    const s = Math.exp(lerp(0, Math.log(0.062), zo));
    const mv = eio(seg(t, TL.robotMove[0], TL.robotMove[1]));
    const RW = [lerp(ROBOT_A0[0], ROBOT_A1[0], mv), lerp(ROBOT_A0[1], ROBOT_A1[1], mv)];
    const Cs = [lerp(RW[0], 680, zo), lerp(RW[1], 330, zo)];
    const toS = (wx, wy) => [Cs[0] + (wx - RW[0]) * s, Cs[1] + (wy - RW[1]) * s];
    const pull = 1 + 1.8 * (1 - eo(seg(t, 0, 1.4)));
    sky(x, W, H_, t, { z: pull * Math.pow(s, 0.35), x: t * 14 + mv * 60, y: 0 });

    // background planet (mid distance, drifts)
    const bp = toS(1170 - t * 6, 690); planet(x, bp[0], bp[1], 165 * s * (0.9 + 0.1 * eo(seg(t, 0, 1.4))), PL.magenta, { glowA: 0.28 });
    const mp = toS(1110 - t * 4, 140); planet(x, mp[0], mp[1], 34 * s, PL.moon);

    // galaxy of examples
    const ga = cl((0.75 - s) / 0.5);
    galaxy(x, Cs[0], Cs[1], s, -0.5 + t * 0.22, ga);

    // stream arrow
    const ap = eio(seg(t, TL.arrow[0], TL.arrow[1]));
    const SP = STREAM.map(([a, b]) => toS(a, b));
    arrow(x, SP, ap, '#7ff0ff', Math.max(1.5, 9 * s), { dots: true, a: 0.75 * (1 - ga) });

    // creatures flowing in along the stream
    let absorb = 0;
    SPAWN.forEach((ts, i) => {
      const u = (t - ts) / TL.travel;
      if (u > 0.98 && u < 1.25) absorb = Math.max(absorb, 1 - (u - 0.98) / 0.27);
      if (u <= 0 || u >= 1) return;
      const uu = 0.2 * eio(u) + 0.8 * u, p = bez(SP, uu), kind = KIND(i);
      const bob = Math.sin(t * 3 + i) * 8 * s;
      const r = 50 * s * back(cl(u / 0.12)) * (1 - 0.85 * H.smooth(0.82, 1, u));
      creature(x, kind, p[0], p[1] + bob, r, { t: t + i, rot: Math.sin(t * 2 + i) * 0.12, look: [0.6, -0.2], blink: blinkAt(t, i * 0.7) });
      if (s > 0.45) pill(x, p[0], p[1] + bob - r - 34 * s, kind, 26, { s: back(cl((u - 0.05) / 0.12)) * s, a: 1 - H.smooth(0.72, 0.86, u), ptr: true });
    });

    // the robot (the model)
    const rin = back(seg(t, TL.robotIn[0], TL.robotIn[1]), 1.2);
    const R = 100 * (0.88 + 0.12 * mv) * s * rin;
    const rp = toS(RW[0], RW[1] + Math.sin(t * 1.8) * 9);
    const lookA = t < 2.6 ? [0, -0.2] : [-0.7, -0.4];
    robot(x, rp[0], rp[1], R, { t, look: lookA, blink: blinkAt(t, 0.3), bright: 0.35 + 0.4 * absorb + 0.3 * seg(t, 2.8, 5.6), brainGlow: absorb, rewire: 0 });
    if (absorb > 0 && s > 0.3) burst(x, rp[0] - 10 * s, rp[1] - 120 * s, 1 - absorb, Math.floor(t * 4), 70 * s);
    if (ga > 0.3) { glow(x, rp[0], rp[1], 120, '#fff2c0', 0.5 * ga); spark(x, rp[0], rp[1], 26 * ga, '#ffffff', ga); }
    // "?" thought in the hook
    const qa = seg(t, 1.25, 1.45) * (1 - seg(t, 2.2, 2.4));
    if (qa > 0) { const qs = back(seg(t, 1.25, 1.55)); x.save(); x.globalAlpha = qa; ball(x, rp[0] + R * 1.05, rp[1] - R * 1.75, 34 * qs, ['#ffffff', '#e8e4ff', '#9a8fe0'], { sha: 0.3 }); text(x, '?', rp[0] + R * 1.05, rp[1] - R * 1.75, 46 * qs, C.violet, { shadow: 'rgba(0,0,0,0)' }); x.restore(); }
    // "AI model" label lands under the robot
    const la = back(seg(t, 2.95, 3.3));
    pill(x, rp[0], rp[1] + Math.max(R * 1.95, 42), 'AI model', 28, { s: la, bg: C.yellow });
    // "1 dot = 1 example" label in the galaxy
    pill(x, 1010, 560, '1 dot = 1 example', 26, { s: back(seg(t, 5.15, 5.45)), bg: '#ffffff' });

    // counter
    if (t > TL.count[0] - 0.3) {
      const ca = seg(t, TL.count[0] - 0.3, TL.count[0]);
      const v = Math.round(1e6 * Math.pow(seg(t, TL.count[0], TL.count[1]), 2.3));
      const land = seg(t, TL.count[1], TL.count[1] + 0.35), pop = 1 + 0.2 * Math.sin(land * Math.PI) * (land > 0 ? 1 : 0);
      x.save(); x.translate(64, 650); x.scale(pop, pop); x.globalAlpha = ca;
      x.font = F(900, 78); const nw = x.measureText(v.toLocaleString('en-US')).width;
      text(x, v.toLocaleString('en-US'), 0, 0, 78, land > 0 ? C.yellow : '#ffffff', { align: 'left' });
      text(x, 'examples', nw + 18, 8, 38, '#bfe9ff', { align: 'left', w: 800 });
      x.restore();
      if (land > 0) burst(x, 220, 640, land * 1.2, 77, 200);
    }

    // title (hook) and its shrink into the header
    const tp = eio(seg(t, TL.titleShrink[0], TL.titleShrink[1]));
    if (tp < 1) {
      const words = ['How', 'does', 'AI', 'learn?'], px = 84; x.font = F(900, px);
      const sp = x.measureText(' ').width, ws = words.map((w) => x.measureText(w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * 3;
      const hx = 186, hy = 44, hs = 28 / px;
      const cx = lerp(640, hx, tp), cy = lerp(215, hy, tp), sc = lerp(1, hs, tp);
      x.save(); x.translate(cx, cy); x.scale(sc, sc);
      let wx = -tot / 2;
      words.forEach((w, i) => {
        const u = back(seg(t, TL.title + i * 0.13, TL.title + i * 0.13 + 0.4), 1.2);
        x.save(); x.translate(wx + ws[i] / 2, (1 - u) * 40); x.scale(u, u);
        text(x, w, 0, 0, px, i === 2 ? C.yellow : '#ffffff');
        x.restore(); wx += ws[i] + sp;
      });
      x.restore();
    }
    if (tp > 0.75) header(x, seg(tp, 0.75, 1));
  }

  // ---- scene B: guess -> check -> adjust ----
  const RB = [320, 470], RBR = 110, DOMEB = [RB[0], RB[1] - 1.02 * RBR];
  const CATB = [985, 450], LOOP = [652, 520], LR = 118;
  const LP = { guess: -Math.PI / 2, check: Math.PI / 6, adjust: (5 * Math.PI) / 6 };
  function loopArc(x, a0, a1, prog, col, lw, alpha) {
    if (prog <= 0) return;
    const e = a0 + (a1 - a0) * prog;
    x.save(); x.globalAlpha *= alpha; x.strokeStyle = col; x.fillStyle = col; x.lineWidth = lw; x.lineCap = 'round';
    x.setLineDash([0.01, lw * 1.9]); x.beginPath(); x.ellipse(LOOP[0], LOOP[1], LR * 1.25, LR, 0, a0, e); x.stroke(); x.setLineDash([]);
    const hx = LOOP[0] + Math.cos(e) * LR * 1.25, hy = LOOP[1] + Math.sin(e) * LR, ang = Math.atan2(Math.cos(e) * LR, -Math.sin(e) * LR * 1.25);
    x.translate(hx, hy); x.rotate(ang); const hs = lw * 1.5; x.beginPath(); x.moveTo(hs * 1.1, 0); x.lineTo(-hs * 0.8, hs); x.lineTo(-hs * 0.8, -hs); x.closePath(); x.fill();
    x.restore();
  }
  function exB(x, W, H_, t) {
    const zA = eio(seg(t, TL.zoomIn[0], TL.zoomIn[1])) - eio(seg(t, TL.zoomBack[0], TL.zoomBack[1]));
    const zC = Math.exp(Math.log(16) * H.ease.in(seg(t, TL.toC[0], TL.toC[1])));
    const z = (1 + 0.32 * zA) * zC;
    sky(x, W, H_, t, { x: 300 + t * 22, y: 40, z: z });
    x.save(); x.translate(DOMEB[0], DOMEB[1]); x.scale(z, z); x.translate(-DOMEB[0], -DOMEB[1]);
    // background planet behind the cat
    planet(x, 1180 - (t - 6) * 10, 830, 250, PL.magenta, { glowA: 0.3 });
    planet(x, 150 - (t - 6) * 5, 120, 30, PL.moon);

    const wrong = seg(t, TL.wrong, TL.wrong + 0.1) * (1 - seg(t, TL.right - 0.2, TL.right));
    const worry = cl(seg(t, TL.wrong, TL.wrong + 0.15) - seg(t, TL.guess2, TL.guess2 + 0.15));
    const happy = t > TL.right + 0.05 ? 1 : 0;
    const redPulse = Math.max(0, 1 - Math.abs(t - (TL.wrong + 0.15)) / 0.35) + 0.6 * seg(t, TL.err[0] + 0.3, TL.err[1]) * (1 - seg(t, TL.rewire[0], TL.rewire[0] + 0.4));
    const rw = eio(seg(t, TL.rewire[0], TL.rewire[1]));
    const bright = 0.35 + 0.65 * rw;

    // loop diagram: Guess -> Check -> Adjust
    const la = seg(t, 6.6, 6.9);
    const act = t < TL.check ? 'guess' : t < TL.adjust ? 'check' : t < TL.guess2 ? 'adjust' : 'guess';
    loopArc(x, LP.guess + 0.42, LP.check - 0.42, eio(seg(t, 6.7, 7.0)), '#9ff7ff', 7, la * 0.8);
    loopArc(x, LP.check + 0.42, LP.adjust - 0.42, eio(seg(t, 6.8, 7.1)), t > TL.err[0] && t < TL.right ? C.red : '#9ff7ff', 7, la * 0.8);
    loopArc(x, LP.adjust + 0.42, LP.guess + TAU - 0.42, eio(seg(t, 6.9, 7.2)), '#9ff7ff', 7, la * 0.8);
    // error pulse travelling check -> adjust -> into the brain
    const ep = seg(t, TL.err[0], TL.err[0] + 0.3);
    if (ep > 0 && ep < 1) { const a = lerp(LP.check, LP.adjust, eio(ep)); const ex = LOOP[0] + Math.cos(a) * LR * 1.25, ey = LOOP[1] + Math.sin(a) * LR; glow(x, ex, ey, 46, C.red, 0.8); x.fillStyle = '#ffd0d8'; x.beginPath(); x.arc(ex, ey, 9, 0, TAU); x.fill(); }
    const EP = [[LOOP[0] + Math.cos(LP.adjust) * LR * 1.25 - 40, LOOP[1] + Math.sin(LP.adjust) * LR - 10], [470, 520], [470, 400], [DOMEB[0] + 0.74 * RBR + 8, DOMEB[1] + 6]];
    const ea = eio(seg(t, TL.err[0] + 0.25, TL.err[1])), eaA = 1 - seg(t, TL.right, TL.right + 0.3);
    arrow(x, EP, ea, C.red, 8, { dots: true, a: eaA });
    if (ea > 0 && ea < 1) { const p = bez(EP, ea); glow(x, p[0], p[1], 40, C.red, 0.8); }
    for (const [k, lab] of [['guess', 'Guess'], ['check', 'Check'], ['adjust', 'Adjust']]) {
      const a = LP[k], px = LOOP[0] + Math.cos(a) * LR * 1.25, py = LOOP[1] + Math.sin(a) * LR;
      const on = act === k && t > TL.guess - 0.05;
      const bg = !on ? 'rgba(235,240,255,0.9)' : k === 'guess' ? (t > TL.guess2 ? C.green : C.yellow) : k === 'check' ? C.red : C.cyan;
      const sIn = back(seg(t, 6.55 + (k === 'check' ? 0.1 : k === 'adjust' ? 0.2 : 0), 6.9 + (k === 'check' ? 0.1 : k === 'adjust' ? 0.2 : 0)));
      const switchT = k === 'guess' ? (t > TL.guess2 ? TL.guess2 : TL.guess) : k === 'check' ? TL.check : TL.adjust;
      const bump = 1 + 0.18 * Math.sin(seg(t, switchT, switchT + 0.3) * Math.PI);
      if (on) glow(x, px, py, 90, bg, 0.35);
      pill(x, px, py, lab, 30, { s: sIn * (on ? bump * 1.08 : 0.92), bg, fg: on && k === 'check' ? '#ffffff' : C.ink });
    }

    // the cat (new example) floats in from the right
    const ci = eo(seg(t, TL.catIn[0], TL.catIn[1]));
    const cxp = lerp(1450, CATB[0], back(seg(t, TL.catIn[0], TL.catIn[1]), 1.1)), cyp = CATB[1] + Math.sin(t * 2.1) * 10;
    cat(x, cxp, cyp, 92, { t, rot: Math.sin(t * 1.6) * 0.08 + (1 - ci) * 0.4, look: [-0.8, -0.1], blink: blinkAt(t, 1.1), happy: t > TL.right + 0.1 ? 1 : 0 });
    // its tag: "?" until checked, then "cat" drops on
    const tagDrop = back(seg(t, TL.check, TL.check + 0.3), 2);
    if (t < TL.check + 0.05) pill(x, cxp, cyp - 155, '?', 30, { s: back(seg(t, 6.8, 7.1)) * (1 - seg(t, TL.check - 0.05, TL.check + 0.05)), bg: '#d9dcff', ptr: true });
    pill(x, cxp, cyp - 155 - (1 - tagDrop) * 60, 'cat', 34, { s: tagDrop, a: seg(t, TL.check, TL.check + 0.08), bg: C.green, ptr: true });
    if (t > TL.check) burst(x, cxp, cyp - 160, (t - TL.check) * 1.4, 12, 120);

    // the robot (model)
    const shake = wrong > 0 ? Math.sin(t * 60) * 6 * Math.max(0, 1 - (t - TL.wrong) / 0.4) : 0;
    const by = RB[1] + Math.sin(t * 1.8) * 8;
    const look = t < 6.9 ? [0.4, -0.2] : t < TL.wrong ? [1, -0.1] : t < TL.adjust ? [0.9, 0.3] : t < TL.guess2 ? [-0.2, -1] : [1, -0.2];
    robot(x, RB[0] + shake, by, RBR, { t, look, blink: blinkAt(t, 0.9), worry, happy, red: cl(redPulse) * 0.8, err: cl(redPulse) * (1 - rw), rewire: rw, bright, brainGlow: 0.5 * rw + 0.6 * Math.max(0, 1 - Math.abs(t - TL.rewire[1]) / 0.4), armUp: happy ? 1 : 0 });
    // "weights" label on the dome during the adjust
    const wl = back(seg(t, TL.adjust, TL.adjust + 0.3)) * (1 - seg(t, TL.toC[0] - 0.2, TL.toC[0]));
    pill(x, DOMEB[0] - 150, DOMEB[1] - 60, 'weights', 26, { s: wl, bg: C.cyan });
    if (wl > 0) arrow(x, [[DOMEB[0] - 150, DOMEB[1] - 36], [DOMEB[0] - 140, DOMEB[1] + 10], [DOMEB[0] - 100, DOMEB[1] + 10], [DOMEB[0] - 70, DOMEB[1] + 4]], eio(seg(t, TL.adjust + 0.1, TL.adjust + 0.4)), C.cyan, 5, { a: wl });
    if (t > TL.rewire[1] - 0.1) burst(x, DOMEB[0], DOMEB[1], (t - TL.rewire[1] + 0.1) * 1.3, 33, 120);

    // speech bubble: "dog?" then "cat"
    const b1 = back(seg(t, TL.bubble, TL.bubble + 0.3)), b2 = seg(t, TL.guess2 - 0.12, TL.guess2) , b2s = back(seg(t, TL.guess2, TL.guess2 + 0.3));
    const BX = 568 + (wrong > 0 ? Math.sin(t * 70) * 5 * Math.max(0, 1 - (t - TL.wrong) / 0.35) : 0), BY = 205;
    if (t < TL.guess2) {
      bubble(x, BX, BY, 230, 112, 420, 350, b1 * (1 - b2), wrong > 0.5 ? '#ffd9df' : '#ffffff');
      x.save(); x.translate(BX, BY); x.scale(b1 * (1 - b2), b1 * (1 - b2)); text(x, 'dog?', 0, 0, 58, wrong > 0.5 ? C.red : C.ink, { shadow: 'rgba(0,0,0,0)' }); x.restore();
      badge(x, BX + 118, BY - 52, 34, false, back(seg(t, TL.wrong, TL.wrong + 0.3), 2.2) * (1 - b2));
    } else {
      bubble(x, BX, BY, 230, 112, 420, 350, b2s, '#e3ffef');
      x.save(); x.translate(BX, BY); x.scale(b2s, b2s); text(x, 'cat', 0, 0, 58, '#12925a', { shadow: 'rgba(0,0,0,0)' }); x.restore();
      badge(x, BX + 118, BY - 52, 34, true, back(seg(t, TL.right, TL.right + 0.3), 2.2));
      burst(x, BX + 118, BY - 52, (t - TL.right) * 1.2, 21, 160);
    }
    x.restore();
    // red flash on the wrong guess
    const fl = Math.max(0, 1 - Math.abs(t - (TL.wrong + 0.1)) / 0.3);
    if (fl > 0) { const g = x.createRadialGradient(640, 360, 200, 640, 360, 760); g.addColorStop(0, 'rgba(255,59,92,0)'); g.addColorStop(1, H.rgba(C.red, 0.55 * fl)); x.fillStyle = g; x.fillRect(0, 0, W, H_); }
  }

  // ---- scene C: accuracy ring + takeaway ----
  const PC = [430, 395], PCR = 182;
  const accAt = (t) => lerp(61, 97, eio(seg(t, TL.acc[0], TL.acc[1])));
  function exC(x, W, H_, t) {
    const em = 1 + 1.3 * (1 - eo(seg(t, TL.toC[1], TL.toC[1] + 0.7)));
    const tk = eio(seg(t, TL.take[0], TL.take[1]));
    sky(x, W, H_, t, { x: 700 + t * 18, y: 80 - tk * 260, z: em });
    x.save(); x.translate(PC[0], PC[1]); x.scale(em, em); x.translate(-PC[0], -PC[1]);
    const acc = accAt(t), hitK = Math.max(0, 1 - Math.abs(t - TL.hit - 0.15) / 0.75) * (t > TL.hit ? 1 : 0);
    const pcx = lerp(PC[0], 640, tk), pcy = lerp(PC[1], 1160, tk), pr = lerp(PCR, 780, tk);
    const ringA = 1 - seg(t, TL.take[0], TL.take[0] + 0.35);
    const frac = acc / 100, a0 = Math.PI * 0.5;
    const head = a0 + frac * TAU;
    const R = { rx: 1.78 * pr, ry: 0.4 * pr, tilt: -0.16 };
    const ringBar = (half) => {
      x.save(); x.translate(pcx, pcy); x.rotate(R.tilt); x.globalAlpha *= ringA;
      x.beginPath(); if (half === 'back') x.rect(-R.rx * 1.3, -R.ry * 1.6, R.rx * 2.6, R.ry * 1.6); else x.rect(-R.rx * 1.3, 0, R.rx * 2.6, R.ry * 1.6); x.clip();
      // track
      x.beginPath(); x.ellipse(0, 0, R.rx, R.ry, 0, 0, TAU); x.ellipse(0, 0, R.rx * 0.8, R.ry * 0.8, 0, 0, TAU); x.fillStyle = half === 'back' ? 'rgba(120,110,210,0.32)' : 'rgba(150,140,240,0.4)'; x.fill('evenodd');
      // fill
      const g = x.createLinearGradient(-R.rx, 0, R.rx, 0); g.addColorStop(0, '#ff8d3f'); g.addColorStop(0.5, '#ffd23f'); g.addColorStop(1, '#fff1a8');
      x.beginPath(); x.ellipse(0, 0, R.rx * 0.98, R.ry * 0.98, 0, a0, head); x.ellipse(0, 0, R.rx * 0.82, R.ry * 0.82, 0, head, a0, true); x.closePath();
      x.fillStyle = g; x.globalAlpha *= half === 'back' ? 0.8 : 1; x.fill();
      if (hitK > 0) { x.globalAlpha = 0.55 * hitK * ringA; x.fillStyle = '#ffffff'; x.fill(); }
      x.restore();
    };
    // the head of the bar (a tiny robot riding the ring)
    const hx0 = Math.cos(head) * R.rx * 0.9, hy0 = Math.sin(head) * R.ry * 0.9;
    const hx = pcx + hx0 * Math.cos(R.tilt) - hy0 * Math.sin(R.tilt), hy = pcy + hx0 * Math.sin(R.tilt) + hy0 * Math.cos(R.tilt);
    const rider = () => { if (ringA > 0.05) { glow(x, hx, hy, 60, '#ffe066', 0.6 * ringA); x.save(); x.globalAlpha *= ringA; robot(x, hx, hy - 26, 22, { t, look: [0.5, 0], happy: t > TL.hit ? 1 : 0, bright: 1 }); x.restore(); } };
    const headBack = Math.sin(head) < 0;
    glow(x, pcx, pcy, pr * 1.8, '#4fc9ff', 0.3);
    ringBar('back'); if (headBack) rider();
    // takeaway horizon: at this scale only the polar cap is in view, so add cap latitude bands as the camera tilts up
    const pal = tk > 0 ? { ...PL.teal, bands: [...PL.teal.bands, [-0.99, -0.93, '#c6f8ff', 0.38 * tk], [-0.86, -0.79, '#2f74c9', 0.42 * tk], [-0.72, -0.68, '#7fdcff', 0.32 * tk], [-0.62, -0.54, '#2f74c9', 0.3 * tk]] } : PL.teal;
    planet(x, pcx, pcy, pr, pal, { glowA: 0, atmo: 1 });
    ringBar('front'); if (!headBack) rider();
    x.restore();

    // accuracy number + training-round bars (slide up and out for the takeaway)
    const out = seg(t, TL.take[0], TL.take[0] + 0.35), oy = -260 * eio(out);
    x.save(); x.globalAlpha = 1 - out; x.translate(0, oy);
    const inA = seg(t, TL.toC[1], TL.toC[1] + 0.3);
    flare(x, 985, 380, hitK, t);
    text(x, 'Accuracy', 985, 238, 48, '#bfe9ff', { a: inA, w: 900 });
    const pop = t > TL.hit ? 1 + 0.22 * Math.sin(seg(t, TL.hit, TL.hit + 0.35) * Math.PI) : 1;
    x.save(); x.translate(985, 372); x.scale(pop, pop); text(x, Math.round(acc) + '%', 0, 0, 150, t > TL.hit ? C.yellow : '#ffffff', { a: inA }); x.restore();
    // bars
    const nb = 10, bx0 = 850, bw = 22, gap = 7, base = 600, pr2 = seg(t, TL.acc[0], TL.acc[1]);
    for (let i = 0; i < nb; i++) {
      const u = cl(pr2 * nb - i); if (u <= 0) continue;
      const v = 61 + 36 * (1 - Math.exp(-i * 0.42)) / (1 - Math.exp(-9 * 0.42));
      const h = (v - 48) * 2.3 * back(u);
      const g = x.createLinearGradient(0, base - h, 0, base); g.addColorStop(0, '#ffe680'); g.addColorStop(1, '#ff8d3f');
      x.fillStyle = 'rgba(10,8,46,0.4)'; rr(x, bx0 + i * (bw + gap) + 3, base - h + 5, bw, h, bw / 2); x.fill();
      x.fillStyle = g; rr(x, bx0 + i * (bw + gap), base - h, bw, h, bw / 2); x.fill();
    }
    text(x, 'training rounds', 985, 632, 26, '#bfe9ff', { a: seg(t, TL.acc[0], TL.acc[0] + 0.3), w: 800 });
    text(x, 'from 61%', 985, 470, 28, '#ffb0c8', { a: seg(t, TL.toC[1], TL.toC[1] + 0.3) * (1 - seg(t, TL.hit - 0.4, TL.hit)), w: 800 });
    burst(x, 985, 372, (t - TL.hit) * 1.0, 97, 340);
    x.restore();

    // takeaway: horizon planet, characters, line
    if (t > TL.take[0] + 0.2) {
      const tb = t - TL.take[0];
      const rs = back(seg(t, 13.35, 13.75)), cs = back(seg(t, 13.5, 13.9)), ds = back(seg(t, 13.6, 14.0));
      robot(x, 640, 380 + Math.sin(t * 2) * 6 + (1 - rs) * 90, 74 * rs, { t, happy: 1, bright: 1, rewire: 1, armUp: 1 });
      cat(x, 395, 382 + Math.sin(t * 2.4) * 6 + (1 - cs) * 80, 50 * cs, { t, happy: 1, rot: -0.1 });
      dog(x, 885, 382 + Math.sin(t * 2.2 + 1) * 6 + (1 - ds) * 80, 50 * ds, { t, happy: 1, rot: 0.1 });
      const l1 = back(seg(t, TL.line1, TL.line1 + 0.4)), l2 = back(seg(t, TL.line2, TL.line2 + 0.4));
      x.save(); x.translate(640, 92); x.scale(l1, l1); text(x, 'More examples', 0, 0, 68, '#ffffff'); x.restore();
      x.save(); x.translate(640, 176); x.scale(l2, l2);
      x.font = F(900, 68); const w2 = x.measureText('better guesses').width;
      text(x, 'better guesses', 34, 0, 68, C.yellow);
      // rounded flat arrow before the line
      const ax = -w2 / 2 + 34 - 70;
      x.fillStyle = 'rgba(10,8,46,0.55)'; x.save(); x.translate(2, 5); drawArrowGlyph(x, ax, 0); x.restore();
      x.fillStyle = C.cyan; drawArrowGlyph(x, ax, 0);
      x.restore();
      if (tb > 0.5) for (let i = 0; i < 7; i++) { const q = H.rng(400 + i); spark(x, q.range(120, 1160), q.range(60, 300), q.range(8, 15) * (0.5 + 0.5 * Math.sin(t * 3 + i)), '#ffffff', seg(t, TL.line2, TL.line2 + 0.4)); }
    }
  }
  function drawArrowGlyph(x, cx, cy) {
    x.beginPath(); rr(x, cx - 42, cy - 9, 56, 18, 9); x.fill();
    x.beginPath(); x.moveTo(cx + 4, cy - 26); x.lineTo(cx + 40, cy); x.lineTo(cx + 4, cy + 26); x.closePath();
    x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = x.fillStyle; x.fill(); x.stroke();
  }

  // ================= STILL / CLIP =================
  function scene(x, W, H_, t, build) {
    const B = (a, b) => (build ? seg(t, a, b) : 1);
    const zin = build ? 1 + 1.6 * (1 - eo(seg(t, 0, 1.3))) : 1;
    sky(x, W, H_, t, { z: zin, x: t * 12 });
    // big ringed planet, lower right
    const pIn = eo(B(0.0, 1.3));
    const pcx = lerp(1500, 1070, pIn) - t * 4, pcy = lerp(820, 575, pIn);
    planet(x, pcx, pcy, 215 * (0.7 + 0.3 * pIn), PL.magenta, { glowA: 0.32 });
    planet(x, 1180 - t * 3, 120, 30 * back(B(0.6, 1.1)), PL.moon);
    planet(x, 70 + t * 2, 330, 36 * back(B(0.25, 0.8)), PL.coral, { glowA: 0.25 });

    // stream of creatures into the dome
    const RX = 640, RY = 420 + Math.sin(t * 1.8) * 8, R = 106 * back(B(0.35, 1.25), 1.2);
    const P = [[120, 760], [150, 420], [380, 250], [RX - 60, RY - 1.02 * 106 - 20]];
    arrow(x, P, eio(B(1.4, 2.1)), '#7ff0ff', 9, { dots: true, a: 0.8 });
    // data dots flowing along
    if (!build || t > 2.1) for (let i = 0; i < 6; i++) { const u = ((t * 0.32 + i / 6) % 1); const p = bez(P, u); glow(x, p[0], p[1], 18, '#9ff7ff', 0.6); x.fillStyle = '#e8fdff'; x.beginPath(); x.arc(p[0], p[1], 4, 0, TAU); x.fill(); }
    const crit = [['dog', 0.18, 46, 1.5], ['cat', 0.43, 42, 1.7], ['cat', 0.68, 34, 1.9]];
    crit.forEach(([k, u, r, at], i) => {
      const p = bez(P, u), s = back(B(at, at + 0.4)), bob = Math.sin(t * 2.4 + i * 2) * 7;
      creature(x, k, p[0] + 20, p[1] + bob, r * s, { t: t + i, rot: Math.sin(t * 1.5 + i) * 0.12, look: [0.7, -0.3], blink: blinkAt(t, i * 1.3) });
      pill(x, p[0] + 20, p[1] + bob - r - 34, k, 26, { s: back(B(at + 0.2, at + 0.5)) * (r / 46 + 0.15), ptr: true });
    });

    // the robot with its glowing brain
    const nb = build ? cl((t - 1.0) / 0.7) : 1;
    robot(x, RX, RY, R, { t, look: [-0.5, -0.5], blink: blinkAt(t, 0.4), bright: 0.3 + 0.7 * nb, brainGlow: 0.6 * nb, rewire: 0.6, armUp: 0.5 });
    pill(x, RX, RY + R * 1.95, 'AI model', 28, { s: back(B(1.8, 2.2)), bg: C.yellow });

    // guess bubble
    const bs = back(B(2.55, 2.85));
    bubble(x, 878, 228, 200, 100, 735, 330, bs, '#ffffff');
    x.save(); x.translate(878, 228); x.scale(bs, bs); text(x, 'cat!', 0, 0, 54, C.ink, { shadow: 'rgba(0,0,0,0)' }); x.restore();
    badge(x, 975, 182, 28, true, back(B(2.95, 3.25), 2.2));

    // title, top-left
    const words = [['How', '#ffffff'], ['Machines', '#ffffff'], ['Learn', C.yellow]];
    x.font = F(900, 74);
    let wx = 64;
    words.forEach(([w, c], i) => {
      const u = back(B(2.1 + i * 0.16, 2.55 + i * 0.16), 1.4), ww = x.measureText(w).width;
      const line = i < 2 ? 0 : 1, lx = i === 2 ? 64 : wx;
      x.save(); x.translate(lx + ww / 2, 112 + line * 80 + (1 - u) * 40); x.scale(u, u); text(x, w, 0, 0, 74, c); x.restore();
      if (i < 2) wx += ww + 20;
    });
    pill(x, 128, 48, 'EPISODE 7', 22, { s: back(B(2.0, 2.3)), bg: C.pink, fg: '#ffffff' });
    if (build && t > 2.95) burst(x, 975, 182, (t - 2.95) * 1.2, 5, 120);
  }

  registerStyle({
    id: 'flat-space',
    name: 'Flat-Vector Science',
    category: 'Popular Explainer Looks',
    description: 'Flat-vector science-explainer illustration: deep navy-to-violet space gradients, chunky outline-free shapes with rich multi-stop gradients, flat crescent shadows and rim highlights, soft radial glows, sparkly star fields, banded ringed planets and cute big-eyed round characters.',
    motion: 'Smooth eased motion with gentle overshoot: the camera pulls back through scales, planets drift with parallax, characters bob and pop in, glows pulse.',
    fonts: ['900 64px "Nunito"', '800 32px "Nunito"', '700 28px "Nunito"'],
    duration: 5,
    frameT: 4.6,
    readsPixels: false,
    draw(ctx, W, H_, t) { scene(ctx, W, H_, t, true); finish(ctx, W, H_, t); },

    explainerDuration: TL.D,
    explainerNote: 'Big smooth camera moves through scale: the model pulls back until a million examples become a spiral galaxy, a foreground planet sweeps across as the wipe, and the camera dives into the glowing brain dome to emerge at a planet whose ring is the accuracy bar; arrows are chunky dotted rounded curves, numbers are big rounded Nunito.',
    explainer(ctx, W, H_, t) {
      const x = ctx;
      const sw = eio(seg(t, TL.sweep[0], TL.sweep[1])), spx = lerp(W + 980, -980, sw);
      if (t < TL.sweep[0] || spx > 640) exA(x, W, H_, t);
      else if (t < TL.toC[1]) exB(x, W, H_, t);
      else exC(x, W, H_, t);
      // the foreground planet sweep (wipe)
      if (sw > 0 && sw < 1) planet(x, spx, 380 + (sw - 0.5) * 120, 880, PL.coral, { glowA: 0.4 });
      // dive into the brain: glow whiteout
      const wo = seg(t, TL.toC[0] + 0.2, TL.toC[1]) * (1 - seg(t, TL.toC[1], TL.toC[1] + 0.4));
      if (wo > 0) {
        const g = x.createRadialGradient(640, 360, 0, 640, 360, 800);
        g.addColorStop(0, H.rgba('#fff6d0', wo)); g.addColorStop(0.5, H.rgba('#8ff0ff', wo * 0.95)); g.addColorStop(1, H.rgba('#6a4cff', wo * 0.9));
        x.fillStyle = g; x.fillRect(0, 0, W, H_);
      }
      if (t > TL.titleShrink[1]) header(x, 1);
      finish(x, W, H_, t);
    },

    explainerSound(k) {
      // Soft cinematic-science palette: marimba-ish plucks (low-mid, minor), airy whooshes for scale moves,
      // a warm wonder-pad underneath, cute boops for the creatures. All times come from TL / SPAWN above.
      const D = TL.D, hz = k.hz;
      const pan = (px) => cl((px / 1280) * 2 - 1, -1, 1) * 0.6;
      // first time an eased progress over [t0,t1] reaches u
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const tt = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return tt; } return t1; };
      const backPeak = (t0, t1) => when(t0, t1, (u) => back(u), 1); // when an overshoot pop first reaches full size
      // marimba-like pluck: sine body, short 4th-partial knock, soft octave
      const pluck = (t, n, g = 1, p = 0, minor = false) => {
        const f = hz(n);
        k.tone(t, { f, dur: 0.9, gain: 0.2 * g, a: 0.003, pan: p, verb: 0.25, minor });
        k.tone(t, { f: f * 4, dur: 0.09, gain: 0.04 * g, a: 0.001, pan: p, minor });
        k.tone(t, { f: f * 2, type: 'triangle', dur: 0.32, gain: 0.045 * g, a: 0.003, pan: p, minor });
      };
      // cute soft boop: a rounded sine that bends up
      const boop = (t, f0, g = 1, p = 0, minor = true) => {
        k.tone(t, { f: [[0, f0], [0.07, f0 * 1.45], [0.16, f0 * 1.3]], dur: 0.2, gain: 0.17 * g, a: 0.008, pan: p, verb: 0.15, minor });
        k.tone(t, { f: [[0, f0 * 0.5], [0.08, f0 * 0.72]], type: 'triangle', dur: 0.14, gain: 0.06 * g, a: 0.006, pan: p, minor });
      };
      // airy whoosh: pink noise through a soft band that opens to `top` then closes
      const air = (t, dur, top, g = 1, p = 0, peak = 0.55, minor = false) =>
        k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 260], [dur * peak, top], [dur, 340]], q: 0.55, gain: 0.26 * g, a: dur * peak, pan: p, verb: 0.3, minor });
      const chord = (t, notes, g = 1, dur = 2.2) => notes.forEach((n, i) => {
        k.tone(t + i * 0.012, { f: n, type: 'triangle', dur, gain: 0.07 * g, a: 0.02, verb: 0.35, filter: 'lowpass', f2: 1800, pan: (i / (notes.length - 1) - 0.5) * 0.6 });
        k.tone(t + i * 0.012, { f: hz(n) * 1.003, dur, gain: 0.06 * g, a: 0.03, verb: 0.35 });
      });
      const shimmer = (t, notes, g = 1, p = 0) => k.withMinor(() => notes.forEach((n, i) => k.tone(t + i * 0.055, { f: n, dur: 0.7, gain: 0.07 * g, a: 0.004, verb: 0.4, pan: p + (i % 2 ? 0.25 : -0.25) })));

      // warm wonder-pad: Am7 -> Fmaj7 -> Dm7 -> Cmaj7 (resolves under the 97% and the takeaway)
      k.music('pad', 0, D, { bpm: 64, gain: 0.45, chords: [['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']] });

      // ---- 1 HOOK: the camera pulls back through the stars, the title pops word by word
      air(0, 1.4, 1500, 0.8, 0, 0.35);
      ['A3', 'C4', 'E4', 'A4'].forEach((n, i) => pluck(TL.title + i * 0.13 + 0.06, n, 0.9, (i - 1.5) * 0.2, i < 3));
      air(TL.robotIn[0], 0.9, 1100, 0.45, 0, 0.8, true); // robot flies in from far away
      boop(backPeak(TL.robotIn[0], TL.robotIn[1]), 330, 1.1, 0, false); // ...and arrives
      boop(1.3, 470, 0.8, 0.15); // "?" thought
      k.noise(TL.titleShrink[0], { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.6, 300]], q: 0.7, gain: 0.08, a: 0.2, pan: -0.3, minor: true }); // title glides to the corner

      // ---- 2 DATA: dotted stream draws, creatures boop in, the counter ticks
      const nearBoop = (tt) => SPAWN.some((ts) => Math.abs(ts + 0.05 - tt) < 0.045);
      for (let i = 1; i <= 5; i++) if (!nearBoop(when(TL.arrow[0], TL.arrow[1], eio, i / 5))) k.play('tock', when(TL.arrow[0], TL.arrow[1], eio, i / 5), { f: 520 + i * 40, gain: 0.35, pan: pan(-100 + i * 200), minor: true });
      pluck(backPeak(2.95, 3.3), 'E4', 0.9, pan(930)); // "AI model" label lands
      SPAWN.forEach((ts, i) => boop(ts + 0.05, KIND(i) === 'cat' ? 520 : 400, i < 4 ? 0.9 : 0.6, -0.55, true));
      // counter: v = 1e6 * seg^2.3 speeds up; ticks throttled under 12/s
      for (let tt = TL.count[0] + 0.12; tt < TL.count[1] - 0.04;) { const u = seg(tt, TL.count[0], TL.count[1]); if (!nearBoop(tt) && Math.abs(tt - 3.12) > 0.06) k.play('tock', tt, { f: 760 + 160 * u, gain: 0.5 + 0.15 * u, pan: -0.5, minor: true }); tt += 0.22 - 0.135 * u; }
      // zoom out to the galaxy: one long airy breath
      air(TL.zoom[0], TL.zoom[1] - TL.zoom[0] + 0.3, 1900, 1.0, 0, 0.5);
      pluck(backPeak(5.15, 5.45), 'C4', 0.8, pan(1010), true); // "1 dot = 1 example"
      // 1,000,000 lands
      pluck(TL.count[1], 'A3', 1.2, -0.4); pluck(TL.count[1] + 0.07, 'E4', 1.0, -0.3); pluck(TL.count[1] + 0.14, 'A4', 0.8, -0.2);

      // ---- transition: a giant planet sweeps past the camera
      air(TL.sweep[0], TL.sweep[1] - TL.sweep[0], 1300, 1.3, 0, 0.5);
      k.noise(TL.sweep[0] + 0.1, { dur: 0.75, color: 'brown', filter: 'lowpass', f: 260, gain: 0.32, a: 0.35, verb: 0.2 });
      k.tone(TL.sweep[0] + 0.1, { f: [[0, 70], [0.4, 58], [0.75, 46]], dur: 0.75, gain: 0.16, a: 0.3 });

      // ---- 3 GUESS -> CHECK -> ADJUST
      boop(backPeak(TL.catIn[0], TL.catIn[1]) || 6.8, 560, 0.9, pan(985)); // the cat arrives
      ['A3', 'C4', 'E4'].forEach((n, i) => pluck(6.62 + i * 0.1, n, 0.55, pan([652, 790, 515][i]), true)); // loop pills
      pluck(TL.guess, 'G4', 0.8, pan(652)); // Guess lights
      boop(backPeak(TL.bubble, TL.bubble + 0.3), 420, 1.1, pan(568), false); // "dog?"
      pluck(backPeak(TL.check, TL.check + 0.3), 'C4', 0.9, pan(985)); // "cat" tag drops on: Check
      shimmer(TL.check + 0.05, ['C5', 'E5', 'G5'], 0.6, pan(985));
      // the wrong guess: low two-note "nope" + soft thump
      k.tone(TL.wrong, { f: 'E3', type: 'triangle', dur: 0.26, gain: 0.24, hold: 0.1, filter: 'lowpass', f2: 900, pan: pan(680) });
      k.tone(TL.wrong, { f: 'E2', dur: 0.26, gain: 0.18, hold: 0.1 });
      k.tone(TL.wrong + 0.2, { f: 'C3', type: 'triangle', dur: 0.5, gain: 0.24, hold: 0.18, filter: 'lowpass', f2: 800, pan: pan(680) });
      k.tone(TL.wrong + 0.2, { f: 'C2', dur: 0.5, gain: 0.2, hold: 0.18 });
      k.play('thud', TL.wrong, { f: 95, gain: 0.3, pan: pan(680) });
      // error signal travels back to the brain (right -> left), low and soft
      k.noise(TL.err[0], { dur: TL.err[1] - TL.err[0], color: 'pink', filter: 'bandpass', f: [[0, 900], [TL.err[1] - TL.err[0], 260]], q: 1.2, gain: 0.2, a: 0.15, pan: -0.1, verb: 0.2 });
      k.tone(TL.err[0], { f: [[0, 220], [0.55, 110]], type: 'triangle', dur: 0.55, gain: 0.07, a: 0.1, filter: 'lowpass', f2: 700 });
      pluck(backPeak(TL.adjust, TL.adjust + 0.3), 'D4', 0.9, pan(170)); // Adjust + "weights"
      air(TL.zoomIn[0], 0.5, 1200, 0.5, pan(320), 0.6, true);
      // rewiring: nodes brighten one after another
      ['A3', 'C4', 'D4', 'E4', 'G4', 'A4'].forEach((n, i) => pluck(TL.rewire[0] + i * 0.1, n, 0.55, pan(320) + (i % 2 ? 0.1 : -0.1), true));
      shimmer(TL.rewire[1] - 0.05, ['E5', 'A5'], 0.5, pan(320));
      air(TL.zoomBack[0], 0.4, 1000, 0.4, 0, 0.5, true);
      boop(backPeak(TL.guess2, TL.guess2 + 0.3), 520, 1.0, pan(568), false); // "cat"
      // correct: warm rising pair + a little shimmer
      pluck(TL.right, 'C4', 1.1, pan(680)); pluck(TL.right + 0.09, 'G4', 1.0, pan(690)); pluck(TL.right + 0.18, 'C5', 0.7, pan(700));

      // ---- transition: dive into the glowing brain
      air(TL.toC[0], TL.toC[1] - TL.toC[0] + 0.1, 2200, 1.2, pan(320), 0.9);
      k.tone(TL.toC[0], { f: [[0, 110], [0.5, 330]], type: 'triangle', dur: 0.55, gain: 0.07, a: 0.45 });
      chord(TL.toC[1], ['C3', 'G3', 'E4'], 0.6, 1.4); // bloom as we emerge

      // ---- 4 ACCURACY: ring fills, number counts 61 -> 97
      for (let tt = TL.acc[0], last = 61, lastT = -1; tt < TL.acc[1]; tt += 1 / 120) {
        const v = Math.round(accAt(tt));
        if (v !== last && tt - lastT >= 1 / 11) { k.play('tock', tt, { f: 560 + (v - 61) * 9, gain: 0.5, pan: pan(985), minor: true }); last = v; lastT = tt; }
      }
      // swell into the big moment
      k.noise(TL.hit - 0.8, { dur: 0.85, color: 'pink', filter: 'bandpass', f: [[0, 250], [0.8, 1800]], q: 0.8, gain: 0.24, a: 0.78, verb: 0.3 });
      k.tone(TL.hit - 0.8, { f: [[0, 110], [0.8, 220]], type: 'triangle', dur: 0.82, gain: 0.08, a: 0.75 });
      // 97%: warm low boom + big chord + shimmer
      k.play('impact', TL.hit, { gain: 0.75 });
      chord(TL.hit, ['A2', 'E3', 'A3', 'C4', 'E4', 'B4'], 1.6, 2.4);
      shimmer(TL.hit + 0.08, ['E5', 'A5', 'C6', 'E5', 'B5'], 0.8, 0.3);

      // ---- 5 TAKEAWAY: camera tilts up to the horizon, everyone pops up, the line resolves
      air(TL.take[0], TL.take[1] - TL.take[0], 1000, 0.6, 0, 0.5, true);
      pluck(backPeak(TL.line1, TL.line1 + 0.4), 'E4', 0.8, 0);
      boop(backPeak(13.35, 13.75), 400, 0.9, 0); boop(backPeak(13.5, 13.9), 540, 0.8, pan(395)); boop(backPeak(13.6, 14.0), 440, 0.8, pan(885));
      chord(backPeak(TL.line2, TL.line2 + 0.4), ['C3', 'G3', 'C4', 'E4', 'G4', 'D5'], 1.1, 1.5);
      pluck(backPeak(TL.line2, TL.line2 + 0.4), 'C4', 1.0, 0);
    },
  });
}
