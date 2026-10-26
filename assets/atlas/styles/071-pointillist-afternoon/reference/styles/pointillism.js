{
  // ---------------------------------------------------------------
  // Pointillism — pure-hue dabs that mix in the eye, on a woven canvas
  // ---------------------------------------------------------------
  const PIG = [
    [250, 246, 230], // lead white
    [248, 216, 64],  // lemon yellow
    [240, 150, 46],  // orange
    [214, 66, 44],   // vermilion
    [232, 138, 156], // rose
    [126, 82, 168],  // violet
    [44, 62, 168],   // ultramarine
    [74, 146, 214],  // cerulean
    [36, 148, 96],   // emerald
    [158, 196, 62],  // yellow-green
    [28, 84, 66],    // viridian deep
    [204, 150, 72],  // ochre
    [36, 34, 92],    // deep ultramarine (no black on the palette)
  ];
  const css = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  // Seurat's vibration: each pigment's complement (index into PIG), laid in beside it now and then
  //            white lemon orange verm. rose violet ultra cerul. emer. y-grn viri. ochre deep
  const COMP = [0,    5,    7,     8,    9,   1,     2,    2,     4,   5,    3,   6,    11];


  // =================================================================
  // EXPLAINER — "How does AI learn?" in divisionist dots. Every frame re-dabs a fixed field of dots against
  // a colour study of the current scene; scene changes are the painter re-dabbing the canvas in a diagonal
  // sweep (dots pop to their new hue behind the front). Lettering, arrows and numbers are fine dabs.
  // =================================================================
  let PXC = null;
  const clP = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ezP = (u) => H.ease.inOut(clP(u));
  const wP = (t, a, b) => clP((t - a) / (b - a));
  const lerpP = (a, b, u) => a + (b - a) * u;
  const PAL_INK = [6, 6, 6, 6, 12, 12, 5, 6, 3], PAL_RED = [3, 3, 3, 2, 4, 3], PAL_GREEN = [8, 8, 10, 10, 6, 9], PAL_GOLD = [1, 1, 2, 0, 11];
  function pxCache(W, H_) {
    if (PXC) return PXC;
    const C = { glyph: new Map() };
    const tex = H.layer(W, H_), tc = tex.getContext('2d');
    tc.fillStyle = 'rgb(232,222,198)'; tc.fillRect(0, 0, W, H_);
    tc.globalAlpha = 0.16; tc.fillStyle = 'rgb(150,130,100)'; for (let y = 0; y < H_; y += 3) tc.fillRect(0, y, W, 1);
    tc.globalAlpha = 0.1; for (let x = 0; x < W; x += 3) tc.fillRect(x, 0, 1, H_);
    C.tex = tex;
    // brush touches: larger oval dabs laid along a slow flow field (the painter's hand), not random round dots
    const rp = H.rng(2025), nzf = H.makeNoise(2026), sp = 5.6, pos = [];
    for (let y = 6; y < H_ - 4; y += sp * 0.87) for (let x = 6; x < W - 4; x += sp) {
      const px = x + rp.range(-1.6, 1.6) + ((y / sp) & 1) * sp * 0.5, py = y + rp.range(-1.4, 1.4);
      pos.push(px, py, rp.range(2.6, 3.4), -0.6 + 0.5 * nzf.n2(px * 0.004, py * 0.004) + rp.range(-0.18, 0.18), rp());
    }
    C.pos = new Float32Array(pos); C.n = pos.length / 5;
    C.study = H.layer(W, H_); C.study2 = H.layer(W, H_);
    // the painted border of dots (hero step 5), baked once: darker complementary dabs travelling round the frame
    C.border = H.layer(W, H_); { const bc = C.border.getContext('2d'), br = H.rng(66), bl = PIG.map(() => []);
      for (let k = 0; k < 2600; k++) {
        const side = br.int(0, 3), along = br(), depth = br.range(2, 16);
        const x = side === 0 || side === 1 ? along * W : side === 2 ? depth : W - depth, y = side === 0 ? depth : side === 1 ? H_ - depth : along * H_;
        bl[br.pick([6, 6, 12, 5, 2, 3, 6, 12])].push([x, y, br.range(2, 2.8), br() * 3]);
      }
      bc.shadowColor = 'rgba(52,38,74,0.42)'; bc.shadowOffsetX = 1.2; bc.shadowOffsetY = 1.6; batchFill(bc, bl); }
    PXC = C;
    return C;
  }
  // fine-dab glyphs, cached per (char,size)
  function glyph(ch, size) {
    const C = PXC, key = ch + '|' + size;
    let g = C.glyph.get(key);
    if (g) return g;
    const font = `800 italic ${size}px "Playfair Display"`, m = H.layer(4, 4).getContext('2d'); m.font = font;
    const adv = m.measureText(ch).width, w = Math.ceil(adv + size * 0.5), h = Math.ceil(size * 1.4);
    const cv = H.layer(w, h), c = cv.getContext('2d'); c.font = font; c.fillStyle = '#000'; c.fillText(ch, size * 0.15, size * 1.05);
    const d = c.getImageData(0, 0, w, h).data, r = H.rng(ch.charCodeAt(0) * 131 + size), st = Math.max(1.35, size / 30), dots = [];
    for (let y = 0; y < h; y += st) for (let x = 0; x < w; x += st) {
      const xx = x + r.range(-0.5, 0.5), yy = y + r.range(-0.5, 0.5), k = ((yy | 0) * w + (xx | 0)) * 4 + 3;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h && d[k] > 110) dots.push([xx - size * 0.15, yy - size * 1.05, st * r.range(0.72, 0.92), r(), r()]);
    }
    g = { adv, dots };
    C.glyph.set(key, g);
    return g;
  }
  function batchFill(ctx, lists, ratio = 0.8) {
    lists.forEach((list, p) => {
      if (!list.length) return;
      ctx.fillStyle = `rgb(${PIG[p][0]},${PIG[p][1]},${PIG[p][2]})`;
      // fill in chunks: one huge multi-subpath path rasterises far slower than many modest ones
      for (let s = 0; s < list.length; s += 600) {
        ctx.beginPath();
        for (let i = s, e = Math.min(list.length, s + 600); i < e; i++) { const [x, y, rr, a] = list[i]; ctx.moveTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); ctx.ellipse(x, y, rr, rr * ratio, a, 0, 6.2832); }
        ctx.fill();
      }
    });
  }
  const textW = (str, size) => { let w = 0; for (const ch of str) w += glyph(ch, size).adv; return w; };
  // lettering dabbed in fine dots; reveal sweeps left to right, each dot popping on in turn
  function dotText(ctx, str, x, y, size, { align = 'left', reveal = 1, pal = PAL_INK, scale = 1 } = {}) {
    if (reveal <= 0) return;
    const lists = PIG.map(() => []), tw = textW(str, size);
    let cx = align === 'center' ? -tw / 2 : align === 'right' ? -tw : 0;
    const n = [...str].length;
    [...str].forEach((ch, i) => {
      const g = glyph(ch, size), lr = clP(reveal * (n + 2) - i);
      if (lr > 0) for (const [dx, dy, rr, q, q2] of g.dots) if (q < lr) lists[pal[(q2 * pal.length) | 0]].push([x + (cx + dx) * scale, y + dy * scale, rr * scale, q * 3]);
      cx += g.adv;
    });
    batchFill(ctx, lists);
  }
  // dotted arrow / line, dabbed along the path as it is drawn on
  function dotPath(ctx, pts, prog, width, pal, seed, head = true) {
    if (prog <= 0) return;
    const lists = PIG.map(() => []), r = H.rng(seed);
    let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
    const upto = L * clP(prog);
    let acc = 0, ang = 0, ex = pts[0][0], ey = pts[0][1];
    for (let i = 1; i < pts.length && acc < upto; i++) {
      const a = pts[i - 1], b = pts[i], l = seg[i - 1]; ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      for (let s = 0; s < l && acc + s < upto; s += 2.4) {
        const u = s / l, x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u; ex = x; ey = y;
        for (let k = 0; k < Math.max(1, Math.round(width / 2.4)); k++) { const o = (k + 0.5 - width / 4.8) * 2.4 + r.range(-0.7, 0.7); lists[pal[(r() * pal.length) | 0]].push([x - Math.sin(ang) * o, y + Math.cos(ang) * o, r.range(1.1, 1.5), r() * 3]); }
      }
      acc += l;
    }
    if (head && prog >= 1) for (const sgn of [-1, 1]) for (let s = 0; s < width * 3.2; s += 2.2) { const a = ang + Math.PI + sgn * 0.55; for (let k = 0; k < 2; k++) lists[pal[(r() * pal.length) | 0]].push([ex + Math.cos(a) * s + r.range(-0.8, 0.8), ey + Math.sin(a) * s + r.range(-0.8, 0.8), r.range(1.1, 1.5), r() * 3]); }
    batchFill(ctx, lists);
  }
  const bezP = (p0, p1, p2, p3, n = 30) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, a = 1 - u; o.push([a * a * a * p0[0] + 3 * a * a * u * p1[0] + 3 * a * u * u * p2[0] + u * u * u * p3[0], a * a * a * p0[1] + 3 * a * a * u * p1[1] + 3 * a * u * u * p2[1] + u * u * u * p3[1]]); } return o; };
  const ringP = (cx, cy, rx, ry, a0 = -0.6, turns = 1.08, n = 50) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI * 2 * turns; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const fmtP = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // ----- the colour studies (what the dots are trying to mix to) -----
  function studyScene(u, sc, t, W, H_) {
    const lg = (y0, y1, stops) => { const g = u.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
    u.fillStyle = lg(0, 300, [[0, 'rgb(86,142,214)'], [0.6, 'rgb(158,190,226)'], [1, 'rgb(238,214,184)']]); u.fillRect(0, 0, W, 300);
    u.fillStyle = 'rgb(130,152,148)'; u.beginPath(); u.moveTo(0, 310); for (let x = 0; x <= W; x += 20) u.lineTo(x, 286 - 16 * Math.abs(Math.sin(x * 0.021)) - 8 * Math.sin(x * 0.007)); u.lineTo(W, 310); u.fill();
    u.fillStyle = lg(300, 390, [[0, 'rgb(150,186,214)'], [1, 'rgb(70,124,184)']]); u.fillRect(0, 300, W, 90);
    // warm haze where sky meets the far bank, sun glints on the water (light from the left)
    u.fillStyle = lg(230, 330, [[0, 'rgba(250,214,170,0)'], [0.55, 'rgba(250,214,170,0.2)'], [1, 'rgba(250,214,170,0)']]); u.fillRect(0, 230, W, 100);
    u.fillStyle = 'rgba(252,238,196,0.7)'; for (let k = 0; k < 7; k++) u.fillRect(120 + Math.sin(k * 2.3) * 50, 318 + k * 10, 170 - k * 14, 3);
    u.fillStyle = lg(380, 720, [[0, 'rgb(164,200,82)'], [0.55, 'rgb(124,174,64)'], [0.8, 'rgb(70,132,80)'], [1, 'rgb(40,92,96)']]); u.fillRect(0, 386, W, 340);
    { const g = u.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(250,226,140,0.28)'); g.addColorStop(0.5, 'rgba(250,226,140,0)'); g.addColorStop(1, 'rgba(60,70,150,0.16)'); u.fillStyle = g; u.fillRect(0, 386, W, 340); }
    // violet cast shadow, thrown down-right (light from the upper left), soft-edged
    const shadow = (fn) => { u.save(); u.filter = 'blur(10px)'; u.fillStyle = 'rgba(96,70,150,0.55)'; fn(); u.restore(); };
    // labels sit on feathered pale-peach grounds so the dots thin out at the edges (no sticker boxes)
    const ribbon = (x, y, w, h) => { u.save(); u.shadowColor = 'rgb(250,230,212)'; u.shadowBlur = 14; u.fillStyle = 'rgb(250,232,214)'; u.beginPath(); u.roundRect(x + 4, y + 4, Math.max(0, w - 8), h - 8, 14); u.fill(); u.restore(); };
    const orb = (x, y, r, flash, spin) => {
      shadow(() => { u.beginPath(); u.ellipse(x + r * 0.55, y + r + 92, r * 0.95, 20, 0, 0, 7); u.fill(); });
      u.fillStyle = 'rgb(70,56,110)'; u.fillRect(x - 18, y + r - 6, 36, 90); u.beginPath(); u.ellipse(x, y + r + 86, 60, 14, 0, 0, 7); u.fill();
      const g = u.createRadialGradient(x - r * 0.2, y - r * 0.2, 4, x, y, r * (1 + flash * 0.25)); g.addColorStop(0, flash > 0.2 ? 'rgb(255,250,226)' : 'rgb(252,232,140)'); g.addColorStop(0.55, 'rgb(242,168,66)'); g.addColorStop(1, 'rgb(150,70,120)');
      u.fillStyle = g; u.beginPath(); u.arc(x, y, r * (1 + flash * 0.12), 0, 7); u.fill();
      u.strokeStyle = 'rgb(40,36,96)'; u.lineWidth = 7; u.lineCap = 'round';
      for (let k = 0; k < 3; k++) { const a = -2.4 + k * 1.0 + spin * (k === 1 ? -0.9 : 0.8); u.beginPath(); u.moveTo(x - 46 + k * 46, y + 30); u.lineTo(x - 46 + k * 46 + Math.cos(a) * 30, y + 30 + Math.sin(a) * 30); u.stroke(); u.beginPath(); u.arc(x - 46 + k * 46, y + 30, 18, 0, 7); u.lineWidth = 3; u.stroke(); u.lineWidth = 7; }
    };
    const card = (x, y, s, dog) => {
      u.fillStyle = 'rgba(96,70,150,0.5)'; u.fillRect(x - s / 2 + s * 0.09, y - s / 2 + s * 0.11, s, s);
      u.fillStyle = 'rgb(248,242,224)'; u.fillRect(x - s / 2, y - s / 2, s, s);
      if (dog) { u.fillStyle = 'rgb(150,96,60)'; u.beginPath(); u.ellipse(x, y + s * 0.04, s * 0.28, s * 0.27, 0, 0, 7); u.fill(); u.fillStyle = 'rgb(90,56,40)'; for (const k of [-1, 1]) { u.beginPath(); u.ellipse(x + k * s * 0.3, y + s * 0.06, s * 0.09, s * 0.2, k * 0.3, 0, 7); u.fill(); } }
      else { u.fillStyle = 'rgb(236,130,50)'; u.beginPath(); [[-0.32, 0], [-0.3, -0.36], [-0.1, -0.2], [0.1, -0.2], [0.3, -0.36], [0.32, 0], [0.22, 0.24], [0, 0.32], [-0.22, 0.24]].forEach(([a, b], i) => (i ? u.lineTo(x + a * s, y + b * s) : u.moveTo(x + a * s, y + b * s))); u.fill(); }
      u.fillStyle = 'rgb(30,30,80)'; u.beginPath(); u.arc(x - s * 0.1, y, s * 0.04, 0, 7); u.arc(x + s * 0.1, y, s * 0.04, 0, 7); u.fill();
    };
    if (t > 1.9) ribbon(18, 14, 500 * clP((t - 1.9) / 0.3), 76);
    if (sc === 1) {
      // sandy path to the model
      u.strokeStyle = 'rgb(226,200,150)'; u.lineWidth = 34; u.lineCap = 'round'; u.beginPath(); u.moveTo(-30, 540); u.bezierCurveTo(300, 580, 600, 470, 960, 400); u.stroke();
      if (t > 1.0) orb(1080, 300, 100 * H.ease.back(wP(t, 1.0, 1.6)), 0, 0);
      if (t > 2.4) ribbon(1000, 548, 162, 52);
      for (const c of P_cards(t)) card(c.x, c.y, c.s, c.dog);
      if (t > 2.9) ribbon(46, 600, 720, 104);
    }
    if (sc === 2) {
      const flash = Math.sin(Math.PI * wP(t, 8.6, 9.6)), spin = ezP((t - 8.7) / 0.6);
      orb(290, 370, 135, flash, spin); ribbon(205, 618, 172, 54);
      card(1060, 250, 220, false); if (t > 6.8) ribbon(960, 376, 200, 52);
      u.fillStyle = 'rgb(248,242,224)'; u.beginPath(); u.ellipse(660, 196, 196, 104, 0, 0, 7); u.fill(); u.beginPath(); u.moveTo(540, 260); u.lineTo(500, 330); u.lineTo(600, 280); u.fill();
      if (t > 6.9) ribbon(330, 112, 140, 54); if (t > 7.6) ribbon(830, 72, 140, 54); if (t > 8.45) ribbon(722, 560, 166, 56);
      if (t > 7.95 && t < 9.4) ribbon(950, 430, 220, 54);
    }
    if (sc === 3) {
      const pr = wP(t, 11.2, 12.7), N = 24, pts = P_chart();
      const lx = lerpP(160, 980, pr), area = () => { u.beginPath(); u.moveTo(160, 560); for (let i = 0; i <= N * pr; i++) u.lineTo(pts[i][0], pts[i][1]); u.lineTo(lx, 560); u.closePath(); };
      if (pr > 0) shadow(() => { u.translate(16, 14); area(); u.fill(); });
      u.fillStyle = lg(170, 560, [[0, 'rgb(254,228,96)'], [0.6, 'rgb(246,172,64)'], [0.88, 'rgb(232,130,70)'], [1, 'rgb(140,100,178)']]); area(); u.fill();
      ribbon(170, 98, 560, 76); ribbon(400, 584, 340, 50);
      if (t > 12.7) { const k = Math.sin(Math.PI * wP(t, 12.7, 13.4)); const g = u.createRadialGradient(980, pts[N][1], 2, 980, pts[N][1], 120); g.addColorStop(0, `rgba(255,246,190,${k})`); g.addColorStop(1, 'rgba(255,246,190,0)'); u.fillStyle = g; u.fillRect(840, 40, 280, 300); }
      if (t > 13.15) ribbon(110, 628, 1060, 84);
    }
  }
  function P_cards(t) {
    const out = [];
    for (let i = 0; i < 24; i++) {
      const s0 = 2.5 + i * 0.15, v = (t - s0) / 1.5;
      if (v <= 0 || v >= 1) continue;
      const a = 1 - v, x = a * a * a * -30 + 3 * a * a * v * 300 + 3 * a * v * v * 600 + v * v * v * 980, y = a * a * a * 540 + 3 * a * a * v * 580 + 3 * a * v * v * 470 + v * v * v * 330;
      out.push({ x, y: y - 64, s: v > 0.8 ? 92 * (1 - (v - 0.8) / 0.2 * 0.9) : 92, dog: (i % 2 === 1) !== (i % 5 === 0) });
    }
    return out;
  }
  function P_chart() { const N = 24, pts = []; for (let i = 0; i <= N; i++) { const acc = 61 + 36 * (1 - Math.exp(-i / 5.5)) / (1 - Math.exp(-N / 5.5)) + (i > 0 && i < N ? Math.sin(i * 2.7) * 1.6 : 0); pts.push([160 + i / N * 820, 560 - (acc - 50) / 50 * 380]); } return pts; }

  // ----- the fine-dab layer for each scene (text, arrows, numbers, emphasis) -----
  function overlayScene(ctx, sc, t) {
    if (sc === 1) {
      if (t > 2.4) dotText(ctx, 'the model', 1081, 584, 32, { align: 'center', reveal: wP(t, 2.4, 2.9) });
      dotPath(ctx, bezP([140, 450], [400, 500], [640, 400], [950, 320]), wP(t, 2.3, 2.9), 5, PAL_INK, 11);
      for (const c of P_cards(t)) if (c.s > 60) dotText(ctx, c.dog ? 'dog' : 'cat', c.x, c.y + c.s / 2 + 30, 28, { align: 'center', pal: c.dog ? PAL_INK : PAL_RED });
      if (t > 2.9) {
        const n = t > 5.6 ? 1e6 : Math.round(1e6 * H.ease.in(wP(t, 3.0, 5.6)) / 1000) * 1000;
        dotText(ctx, fmtP(n), 70, 676, 66, { reveal: wP(t, 2.9, 3.3) });
        dotText(ctx, 'examples', 84 + textW(fmtP(n), 66), 672, 44, { reveal: wP(t, 3.0, 3.4) });
        if (t > 5.6) dotPath(ctx, [[70, 692], [400, 696], [720, 690]], wP(t, 5.6, 5.95), 5, PAL_RED, 12, false);
      }
    }
    if (sc === 2) {
      const second = t > 9.4;
      dotText(ctx, 'the model', 291, 656, 34, { align: 'center' });
      dotText(ctx, 'new picture', 1060, 413, 32, { align: 'center', reveal: wP(t, 6.8, 7.2) });
      dotPath(ctx, bezP([395, 270], [420, 210], [440, 200], [470, 196]), wP(t, 6.9, 7.2), 6, PAL_INK, 21);
      dotText(ctx, 'Guess', 400, 150, 38, { align: 'center', reveal: wP(t, 6.9, 7.3) });
      if (!second) dotText(ctx, 'dog?', 660, 226, 88, { align: 'center', reveal: wP(t, 7.1, 7.5), pal: PAL_INK });
      dotPath(ctx, bezP([945, 230], [910, 190], [890, 180], [860, 178]), wP(t, 7.5, 7.8), 6, PAL_INK, 22);
      dotText(ctx, 'Check', 900, 110, 38, { align: 'center', reveal: wP(t, 7.6, 8.0) });
      if (t > 7.9 && !second) {
        dotPath(ctx, [[570, 136], [750, 250]], wP(t, 7.9, 8.05), 12, PAL_RED, 23, false);
        dotPath(ctx, [[750, 136], [570, 250]], wP(t, 8.05, 8.2), 12, PAL_RED, 24, false);
        dotPath(ctx, ringP(660, 196, 214, 120), wP(t, 8.0, 8.45), 7, PAL_RED, 25, false);
        dotText(ctx, "it's a cat!", 1060, 469, 34, { align: 'center', reveal: wP(t, 8.0, 8.4), pal: PAL_RED });
      }
      dotPath(ctx, bezP([700, 318], [780, 600], [520, 600], [440, 440]), wP(t, 8.25, 8.8), 7, PAL_RED, 26);
      dotText(ctx, 'Adjust', 805, 600, 38, { align: 'center', reveal: wP(t, 8.5, 8.9), pal: PAL_RED });
      if (second) {
        dotText(ctx, 'cat', 640, 226, 88, { align: 'center', reveal: wP(t, 9.4, 9.7), pal: PAL_INK });
        dotPath(ctx, [[730, 196], [752, 226], [806, 150]], wP(t, 9.7, 9.95), 11, PAL_GREEN, 27, false);
      }
    }
    if (sc === 3) {
      const pts = P_chart(), pr = wP(t, 11.2, 12.7);
      dotPath(ctx, [[160, 170], [160, 560], [1010, 560]], wP(t, 10.9, 11.3), 4, PAL_INK, 31, false);
      dotText(ctx, 'training rounds', 570, 620, 34, { align: 'center', reveal: wP(t, 11.0, 11.4) });
      dotPath(ctx, pts, pr, 6, PAL_INK, 32, false);
      const acc = Math.round(t < 11.2 ? 61 : t > 12.7 ? 97 : lerpP(61, 97, H.ease.out(pr)));
      dotText(ctx, 'Accuracy', 186, 154, 48, { reveal: wP(t, 10.9, 11.3) });
      dotText(ctx, acc + '%', 470, 160, 68, { reveal: wP(t, 11.1, 11.3), pal: acc >= 97 ? PAL_RED : PAL_INK });
      dotText(ctx, '61%', 92, pts[0][1] + 10, 32, { reveal: wP(t, 11.2, 11.5) });
      if (t > 12.7) { dotPath(ctx, ringP(536, 138, 112, 58), wP(t, 12.7, 13.1), 6, PAL_RED, 33, false); dotPath(ctx, ringP(pts[24][0], pts[24][1], 26, 26, 0, 1.05, 30), wP(t, 12.9, 13.2), 5, PAL_RED, 34, false); }
      if (t > 13.15) dotText(ctx, 'More examples → better guesses', 640, 688, 54, { align: 'center', reveal: ezP((t - 13.15) / 0.8) });
    }
  }

  function explainPointillism(ctx, W, H_, t) {
    const C = pxCache(W, H_);
    ctx.drawImage(C.tex, 0, 0);
    // which scene(s): the canvas is re-dabbed in a diagonal sweep between scenes
    const wipes = [[5.95, 6.75], [10.35, 11.15]];
    let sc = t < 6.35 ? 1 : t < 10.75 ? 2 : 3, sweep = null;
    wipes.forEach(([a, b], i) => { if (t > a && t < b) sweep = { from: i + 1, to: i + 2, front: lerpP(-120, 1620, ezP((t - a) / (b - a))) }; });
    const study = (cv, s, tt) => { const u = cv.getContext('2d'); studyScene(u, s, tt, W, H_); return u.getImageData(0, 0, W, H_).data; };
    const TA = study(C.study, sweep ? sweep.from : sc, sweep ? Math.min(t, sweep.from === 1 ? 6.3 : 10.7) : t);
    const TB = sweep ? study(C.study2, sweep.to, Math.max(t, sweep.to === 2 ? 6.4 : 10.8)) : null;
    // greedy optical mixing per cell
    const CELL = 8, cw = Math.ceil(W / CELL), ch = Math.ceil(H_ / CELL), acc = new Float32Array(cw * ch * 3), cnt = new Uint16Array(cw * ch);
    const lists = PIG.map(() => []), sh = H.rng(7000 + Math.floor(t * 6)), P = C.pos;
    for (let i = 0; i < C.n; i++) {
      const x = P[i * 5], y = P[i * 5 + 1], q = P[i * 5 + 4];
      let rr = P[i * 5 + 2], T = TA;
      if (sweep) { const d = sweep.front - (x + y * 0.35); if (d > 0) { T = TB; if (d < 90) rr *= H.ease.back(clP(d / 90)); } else if (d > -50) rr *= 1 - 0.5 * clP((d + 50) / 50); }
      const o = ((y | 0) * W + (x | 0)) * 4, ci = ((y / CELL) | 0) * cw + ((x / CELL) | 0), n = cnt[ci], k = ci * 3;
      const w0 = T[o] * (n + 1) - acc[k], w1 = T[o + 1] * (n + 1) - acc[k + 1], w2 = T[o + 2] * (n + 1) - acc[k + 2];
      const dark = T[o] + T[o + 1] + T[o + 2] < 330;   // in shadow, reach for ultramarine/violet, not a darker same-hue
      let best = 0, bd = 1e12, second = 0, sd = 1e12;
      for (let p = 0; p < PIG.length; p++) { const Q = PIG[p]; let dd = (Q[0] - w0) ** 2 + (Q[1] - w1) ** 2 * 1.2 + (Q[2] - w2) ** 2 + ((q * 977 + p * 0.37) % 1) * 2600; if (dark && (p === 5 || p === 6 || p === 12)) dd *= 0.78; if (dd < bd) { second = best; sd = bd; best = p; bd = dd; } else if (dd < sd) { second = p; sd = dd; } }
      const qq = (q * 7919) % 1;
      let pick = qq < 0.16 ? second : qq > 0.93 && COMP[best] !== best ? COMP[best] : best;
      acc[k] += PIG[pick][0]; acc[k + 1] += PIG[pick][1]; acc[k + 2] += PIG[pick][2]; cnt[ci]++;
      if (sh() < 0.05) pick = pick === best ? second : best;
      lists[pick].push([x, y, rr, P[i * 5 + 3]]);
    }
    // paint on canvas: every dab throws a hard little shadow onto the weave down-right (light from the upper left)
    ctx.save(); ctx.shadowColor = 'rgba(52,38,74,0.42)'; ctx.shadowOffsetX = 1.2; ctx.shadowOffsetY = 1.6;
    batchFill(ctx, lists, 0.6);
    ctx.restore();
    ctx.drawImage(C.border, 0, 0);
    // fine dabs: the explanation itself (split along the sweep front during a change)
    const clipSide = (ahead) => { ctx.beginPath(); const f = sweep.front; if (ahead) { ctx.moveTo(f, 0); ctx.lineTo(W + 400, 0); ctx.lineTo(W + 400, H_); ctx.lineTo(f - H_ * 0.35, H_); } else { ctx.moveTo(-400, 0); ctx.lineTo(f, 0); ctx.lineTo(f - H_ * 0.35, H_); ctx.lineTo(-400, H_); } ctx.closePath(); ctx.clip(); };
    if (sweep) {
      ctx.save(); clipSide(true); overlayScene(ctx, sweep.from, sweep.from === 1 ? 6.3 : 10.7); ctx.restore();
      ctx.save(); clipSide(false); overlayScene(ctx, sweep.to, Math.max(t, sweep.to === 2 ? 6.4 : 10.8)); ctx.restore();
    } else overlayScene(ctx, sc, t);
    // hook -> header
    {
      const k = ezP((t - 1.5) / 0.6);
      if (k < 1) { const s = lerpP(1, 44 / 84, k), tw = textW('How does AI learn?', 84); dotText(ctx, 'How does AI learn?', lerpP(640 - tw / 2, 36, k), lerpP(190, 66, k), 84, { reveal: wP(t, 0.1, 1.2), scale: s }); }
      else dotText(ctx, 'How does AI learn?', 36, 66, 44);
    }
    ctx.strokeStyle = 'rgba(40,40,90,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(19.5, 19.5, W - 39, H_ - 39);
  }

  registerStyle({
    id: 'pointillism',
    name: 'Pointillist Afternoon',
    category: 'Painterly',
    description: 'Neo-Impressionist divisionism: every form is built from small dabs of unmixed pigment — complementary hues side by side that blend optically — with the canvas weave peeking between the dots and a dotted painted border.',
    motion: 'Dots shimmer as individual dabs re-pick their hue each frame while the overall colour holds, like light vibrating on the water; the sailboat drifts and the parasol sways.',
    fonts: ['800 italic 50px "Playfair Display"'],
    duration: 5.5,
    frameT: 5.4,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Every frame re-dabs one fixed field of pure-pigment dots against the current scene, so moving things shimmer as dots re-pick their hue; scene changes are the canvas being re-dabbed in a diagonal sweep, and lettering, arrows, counters and the emphasis rings are all fine dabs.',
    explainer(ctx, W, H_, t) { explainPointillism(ctx, W, H_, t); },
    explainerSound(k) {
      // all times copied from explainPointillism()/overlayScene()/studyScene() above (their wP() windows)
      const D = 15, px = (x) => H.clamp(x / 1280 * 2 - 1, -1, 1) * 0.7;
      const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
      // one dab: a round brush tip tapped onto canvas. a soft muted tap with a little body, nothing bright.
      const dab = (t, g = 1, pan = 0, f = 1000, minor = true) => {
        k.noise(t, { dur: 0.018, filter: 'bandpass', f, q: 1.4, gain: 0.28 * g, a: 0.002, pan, minor });
        k.noise(t, { dur: 0.025, color: 'brown', filter: 'lowpass', f: 450, gain: 0.2 * g, a: 0.002, pan, minor });
      };
      // dabbing a line of dots on: a patter of taps at `rate` per second, panned along the path
      const patter = (a, b, rate, g = 1, p0 = 0, p1 = p0, minor = true) => {
        const d = b - a, r = H.rng(Math.round(a * 1009) + 5);
        for (let x = 0; x < d; x += (0.6 + r() * 0.8) / rate) dab(a + x, g * (0.55 + r() * 0.5), p0 + (p1 - p0) * x / d, 750 + r() * 650, minor);
      };
      // the whole canvas re-dabbed in a diagonal sweep: a dense wave of taps travelling left to right, over a soft swell
      const redab = (a, b) => { const d = b - a;
        patter(a, b, 34, 0.85, -0.8, 0.8, false);
        k.noise(a, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 350], [d * 0.5, 900], [d, 500]], q: 0.7, gain: 0.09, a: d * 0.45, verb: 0.2 }); };
      const counter = (val, a, b, pan) => { let last = val(a), lastT = -1;
        for (let t = a; t <= b; t += 1 / 240) { const v = val(t); if (v !== last && t - lastT >= 1 / 12) { dab(t, 1.1, pan, 900); lastT = t; } last = v; } };

      k.bed('room', 0, D, { gain: 0.4 });
      // a sunny afternoon pad (Gmaj7, Em7, Cmaj7, D6; 3.75 s bars)
      k.music('pad', 0, D, { bpm: 64, gain: 0.3, chords: [['G2', 'D3', 'F#3', 'B3'], ['E2', 'B2', 'D3', 'G3'], ['C3', 'E3', 'G3', 'B3'], ['D3', 'F#3', 'A3', 'B3']] });

      // ---- 1 HOOK: title dabbed in 0.1-1.2, shrinks to the header 1.5-2.1, ribbon 1.9-2.2
      patter(0.1, 1.2, 16, 1.0, -0.5, 0.5, false);
      k.play('tock', 1.0, { f: 260, gain: 0.35, pan: px(1080) }); // the model's orb blooms in (ease.back 1.0-1.6)
      k.noise(1.0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.4, 800], [0.6, 500]], q: 0.8, gain: 0.08, a: 0.25, pan: px(1080), verb: 0.25 });
      k.noise(1.5, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.6, 650]], q: 0.7, gain: 0.06, a: 0.2, minor: true }); // title slides to the corner
      patter(1.9, 2.2, 12, 0.6, -0.9, -0.3);

      // ---- 2 DATA: dotted arrow 2.3-2.9, 'the model' 2.4-2.9, counter 2.9-3.4
      patter(2.3, 2.9, 14, 0.9, px(140), px(950), false);
      patter(2.45, 2.9, 8, 0.5, px(1080));
      patter(2.9, 3.35, 12, 0.8, -0.7, -0.3);
      // counter: n = 1e6 * ease.in(wP(3.0, 5.6)), rounded to thousands; one firm dab per change, at most 12/s
      counter((t) => Math.round(1e6 * H.ease.in(wP(t, 3.0, 5.6)) / 1000), 3.4, 5.58, -0.6);
      k.play('tock', 5.6, { f: 420, gain: 0.55, pan: -0.6 }); // 1,000,000 lands
      patter(5.6, 5.95, 16, 1.0, -0.8, 0.0, false);              // red dotted underline

      // ---- re-dab sweep 5.95-6.75
      redab(5.95, 6.75);

      // ---- 3 GUESS -> CHECK -> ADJUST
      patter(6.85, 7.2, 14, 0.9, px(395), px(470), false);    // guess arrow (+ 'Guess', 'new picture')
      patter(7.2, 7.5, 12, 0.9, px(600), px(720));            // 'dog?'
      patter(7.5, 7.85, 14, 0.9, px(945), px(860), false);    // check arrow (+ 'Check')
      // the wrong guess: two heavy red dotted slashes hammered on, a low "nope" under them
      patter(7.9, 8.05, 30, 1.6, px(570), px(750), false); patter(8.05, 8.2, 30, 1.6, px(750), px(570), false);
      k.play('thud', 7.9, { f: 115, gain: 0.45, pan: px(660) });
      k.tone(7.92, { f: 'A3', type: 'triangle', dur: 0.2, gain: 0.17, a: 0.01, hold: 0.07, verb: 0.2, pan: px(660) });
      k.tone(8.1, { f: 'F#3', type: 'triangle', dur: 0.38, gain: 0.17, a: 0.01, hold: 0.12, verb: 0.2, pan: px(660) });
      patter(8.2, 8.45, 12, 0.7, px(800), px(560));           // the red ring closes
      patter(8.45, 8.8, 14, 1.0, px(600), px(440), false);    // adjust arrow back to the model
      // the orb flashes and its dials turn (8.6-9.6 / ezP over 8.7-9.3): a soft warm swell and three detents
      k.noise(8.6, { dur: 1.0, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.5, 800], [1.0, 380]], q: 0.8, gain: 0.08, a: 0.45, pan: px(290), verb: 0.3, minor: true });
      const sp = (t) => ezP((t - 8.7) / 0.6);
      for (let s = 1; s <= 3; s++) k.play('tock', when((t) => sp(t) * 4, s, 8.7, 9.3), { f: 600 + s * 30, gain: 0.5, pan: px(290), minor: true });
      patter(9.4, 9.7, 12, 1.0, px(600), px(700));             // 'cat'
      patter(9.7, 9.95, 22, 1.1, px(730), px(806), false);    // green check
      k.play('success', 9.95, { f: 'G5', gain: 0.45, pan: px(770) });

      // ---- re-dab sweep 10.35-11.15
      redab(10.35, 11.15);

      // ---- 4 PROGRESS: axes and labels 10.9-11.4, dotted line 11.2-12.7
      patter(11.15, 12.7, 10, 0.55, px(160), px(980));
      const acc = (t) => Math.round(61 + 36 * H.ease.out(wP(t, 11.2, 12.7)));
      const t97 = when(acc, 97, 11.2, 12.7);
      counter(acc, 11.25, t97 - 0.05, px(470));
      // 97% lands, re-dabbed in red: the biggest hit
      k.play('impact', t97, { gain: 0.85, pan: px(470) });
      patter(t97, t97 + 0.18, 40, 1.6, px(420), px(560), false);
      k.play('ding', t97 + 0.02, { f: 'D5', gain: 0.5 });
      ['G4', 'B4'].forEach((f, i) => k.tone(t97 + 0.05 + i * 0.03, { f, dur: 1.3, gain: 0.07, verb: 0.3, pan: (i - 0.5) * 0.5 }));
      patter(12.7, 13.1, 18, 1.1, px(430), px(650), false);   // red ring around 97%, while the summit glows
      k.noise(12.7, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.35, 1000], [0.7, 500]], q: 0.8, gain: 0.07, a: 0.3, pan: px(980), verb: 0.3 });
      patter(12.95, 13.2, 14, 0.7, px(980));                  // small ring on the summit

      // ---- 5 TAKEAWAY (13.15-13.95), then the resolve
      patter(13.15, 13.95, 18, 1.1, -0.7, 0.7, false);
      k.play('ding', 14.0, { f: 'G4', gain: 0.45 });
      ['B4', 'D5', 'G5'].forEach((f, i) => k.tone(14.06 + i * 0.06, { f, dur: 1.2, gain: 0.065 - i * 0.008, verb: 0.3, pan: (i - 1) * 0.3 }));
    },
    draw(ctx, W, H_, t) {
      // ---------- 1. the scene as a soft colour study (sampled, never shown) ----------
      const U = H.layer(W, H_), u = U.getContext('2d');
      const lg = (y0, y1, stops) => { const g = u.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
      u.fillStyle = lg(0, 290, [[0, 'rgb(104,150,214)'], [0.55, 'rgb(170,196,226)'], [1, 'rgb(240,214,186)']]); u.fillRect(0, 0, W, 300);
      const sg = u.createRadialGradient(980, 200, 10, 980, 200, 380); sg.addColorStop(0, 'rgba(255,236,190,0.9)'); sg.addColorStop(1, 'rgba(255,236,190,0)'); u.fillStyle = sg; u.fillRect(0, 0, W, 300);
      // far bank: hazy trees + a low data-centre with mast
      u.fillStyle = 'rgb(126,150,146)'; u.beginPath(); u.moveTo(0, 300);
      for (let x = 0; x <= W; x += 20) u.lineTo(x, 270 - 18 * Math.abs(Math.sin(x * 0.021)) - 10 * Math.sin(x * 0.007)); u.lineTo(W, 300); u.fill();
      u.fillStyle = 'rgb(150,128,186)'; u.fillRect(450, 226, 200, 62); u.fillRect(510, 204, 70, 24);
      u.fillStyle = 'rgb(120,104,170)'; u.fillRect(650, 248, 100, 40); u.fillStyle = 'rgb(214,170,150)'; u.fillRect(450, 222, 200, 6); u.fillRect(650, 244, 100, 5);
      u.fillStyle = 'rgb(96,84,150)'; u.fillRect(593, 130, 6, 100); u.fillRect(582, 154, 28, 4); u.fillRect(586, 176, 20, 3);
      u.fillStyle = 'rgb(235,100,70)'; u.fillRect(590, 124, 12, 10);
      u.fillStyle = 'rgb(246,190,110)'; for (let x = 462; x < 640; x += 16) { u.fillRect(x, 240, 9, 7); u.fillRect(x, 260, 9, 7); }
      // river
      u.fillStyle = lg(288, 430, [[0, 'rgb(150,186,214)'], [1, 'rgb(64,118,180)']]); u.fillRect(0, 288, W, 150);
      u.fillStyle = 'rgba(250,236,200,0.75)'; for (let k = 0; k < 9; k++) u.fillRect(880 + Math.sin(k * 2.1) * 60, 300 + k * 12, 150 - k * 8, 3);
      // sailboat (drifts with t)
      const bx = 760 + t * 12;
      u.fillStyle = 'rgb(250,246,232)'; u.beginPath(); u.moveTo(bx, 250); u.lineTo(bx + 4, 340); u.lineTo(bx + 58, 334); u.closePath(); u.fill();
      u.fillStyle = 'rgb(236,232,214)'; u.beginPath(); u.moveTo(bx - 4, 270); u.lineTo(bx - 4, 338); u.lineTo(bx - 40, 336); u.closePath(); u.fill();
      u.fillStyle = 'rgb(150,60,50)'; u.beginPath(); u.moveTo(bx - 50, 340); u.lineTo(bx + 66, 338); u.lineTo(bx + 52, 352); u.lineTo(bx - 40, 352); u.fill();
      u.fillStyle = 'rgba(80,70,120,0.5)'; u.fillRect(bx - 44, 354, 100, 10);
      // near bank: sunlit grass
      u.fillStyle = lg(420, 720, [[0, 'rgb(150,190,76)'], [1, 'rgb(118,170,60)']]);
      u.beginPath(); u.moveTo(0, 440); u.bezierCurveTo(300, 418, 700, 432, 1280, 412); u.lineTo(1280, 720); u.lineTo(0, 720); u.fill();
      // tree shadow pooled across the grass (cool)
      u.fillStyle = 'rgb(42,96,86)'; u.beginPath(); u.moveTo(0, 470); u.bezierCurveTo(260, 470, 520, 520, 740, 560); u.bezierCurveTo(800, 600, 760, 720, 620, 720); u.lineTo(0, 720); u.fill();
      u.fillStyle = 'rgb(62,120,86)'; u.beginPath(); u.ellipse(420, 600, 160, 30, 0, 0, 7); u.fill();
      // tree: slender trunk + clumped canopy, lit warm on the right, cool in shadow
      u.fillStyle = 'rgb(86,66,60)'; u.beginPath(); u.moveTo(158, 600); u.bezierCurveTo(172, 460, 150, 300, 186, 110); u.lineTo(202, 110); u.bezierCurveTo(176, 300, 198, 460, 190, 604); u.fill();
      u.fillStyle = 'rgb(206,150,90)'; u.fillRect(187, 300, 5, 280);
      u.strokeStyle = 'rgb(70,60,60)'; u.lineWidth = 7; u.beginPath(); u.moveTo(186, 200); u.quadraticCurveTo(260, 150, 330, 140); u.stroke(); u.beginPath(); u.moveTo(182, 240); u.quadraticCurveTo(110, 200, 60, 196); u.stroke();
      const cr = H.rng(44);
      for (let k = 0; k < 26; k++) {
        const x = cr.range(10, 420), y = cr.range(-10, 200 - Math.abs(x - 200) * 0.25), rx = cr.range(40, 80), ry = cr.range(22, 40);
        const lit = H.clamp((x - 120) / 300) * (1 - y / 260);
        const c = H.mix([24, 60, 56], [126, 172, 64], lit * cr.range(0.6, 1));
        u.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; u.beginPath(); u.ellipse(x, y, rx, ry, cr.range(-0.3, 0.3), 0, 7); u.fill();
      }
      // seated figure in profile with a laptop (sits in the sun at the shadow's edge)
      const fx = 780, fy = 600;
      u.save(); u.translate(fx, fy); u.scale(1.35, 1.35); u.translate(-fx, -fy);
      // halo of complementary warmth around the cool screen glow
      { const g = u.createRadialGradient(fx + 78, fy - 64, 4, fx + 78, fy - 64, 60); g.addColorStop(0, 'rgba(250,190,110,0.85)'); g.addColorStop(1, 'rgba(250,190,110,0)'); u.fillStyle = g; u.fillRect(fx, fy - 140, 160, 150); }
      u.fillStyle = 'rgb(46,44,88)';
      u.beginPath(); u.moveTo(fx - 30, fy); u.lineTo(fx - 24, fy - 86); u.quadraticCurveTo(fx - 4, fy - 102, fx + 12, fy - 84); u.lineTo(fx + 20, fy - 40); u.lineTo(fx + 70, fy - 34); u.lineTo(fx + 76, fy); u.closePath(); u.fill();
      u.fillStyle = 'rgb(228,176,146)'; u.beginPath(); u.arc(fx - 6, fy - 112, 15, 0, 7); u.fill();
      u.fillStyle = 'rgb(60,44,40)'; u.beginPath(); u.ellipse(fx - 10, fy - 120, 17, 9, -0.2, 0, 7); u.fill();
      u.fillStyle = 'rgb(220,96,70)'; u.fillRect(fx - 30, fy - 94, 40, 6);
      u.fillStyle = 'rgb(170,170,186)'; u.beginPath(); u.moveTo(fx + 14, fy - 46); u.lineTo(fx + 68, fy - 44); u.lineTo(fx + 68, fy - 38); u.lineTo(fx + 14, fy - 40); u.fill();
      u.fillStyle = 'rgb(214,240,252)'; u.beginPath(); u.moveTo(fx + 62, fy - 44); u.lineTo(fx + 84, fy - 92); u.lineTo(fx + 94, fy - 88); u.lineTo(fx + 72, fy - 42); u.fill();
      u.fillStyle = 'rgb(28,70,70)'; u.beginPath(); u.ellipse(fx + 20, fy + 6, 80, 10, 0, 0, 7); u.fill();
      u.restore();
      // standing figure with parasol (right)
      const sx = 1080, sy = 640, sway = Math.sin(t * 1.2) * 0.05;
      u.fillStyle = 'rgb(58,48,96)'; u.beginPath(); u.moveTo(sx - 18, sy - 150); u.lineTo(sx + 14, sy - 150); u.quadraticCurveTo(sx + 26, sy - 60, sx + 60, sy); u.lineTo(sx - 30, sy); u.quadraticCurveTo(sx - 26, sy - 80, sx - 18, sy - 150); u.fill();
      u.fillStyle = 'rgb(226,170,140)'; u.beginPath(); u.arc(sx - 2, sy - 166, 13, 0, 7); u.fill();
      u.fillStyle = 'rgb(40,34,70)'; u.beginPath(); u.ellipse(sx - 2, sy - 178, 20, 6, 0, 0, 7); u.fill();
      u.save(); u.translate(sx + 6, sy - 140); u.rotate(-0.25 + sway);
      u.strokeStyle = 'rgb(60,40,40)'; u.lineWidth = 3; u.beginPath(); u.moveTo(0, 0); u.lineTo(0, -70); u.stroke();
      u.fillStyle = 'rgb(222,84,64)'; u.beginPath(); u.moveTo(-66, -60); u.quadraticCurveTo(0, -116, 66, -60); u.quadraticCurveTo(0, -70, -66, -60); u.fill();
      u.restore();
      u.fillStyle = 'rgb(30,72,70)'; u.beginPath(); u.ellipse(sx + 50, sy + 4, 90, 9, 0, 0, 7); u.fill();
      // title in the sky
      u.fillStyle = 'rgb(38,40,112)'; u.font = '800 italic 50px "Playfair Display"'; u.textBaseline = 'alphabetic';
      // (lettering is NOT in the colour study: it is dabbed on top later with a finer brush)
      const TM = H.layer(W, H_), tm = TM.getContext('2d');
      tm.fillStyle = '#000'; tm.font = '800 italic 50px "Playfair Display"'; tm.fillText('A Sunday with the Machine', 540, 96);
      const textMask = tm.getImageData(0, 0, W, H_).data;
      u.filter = 'blur(2px)'; u.drawImage(U, 0, 0); u.filter = 'none';
      const T = u.getImageData(0, 0, W, H_).data;

      // ---------- 2. canvas ----------
      ctx.fillStyle = 'rgb(232,222,198)'; ctx.fillRect(0, 0, W, H_);
      ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = 'rgb(150,130,100)';
      for (let y = 0; y < H_; y += 3) ctx.fillRect(0, y, W, 1);
      ctx.globalAlpha = 0.1; for (let x = 0; x < W; x += 3) ctx.fillRect(x, 0, 1, H_);
      ctx.restore();

      // ---------- 3. dabs: greedy optical mixing per cell ----------
      const D = H.layer(W, H_), dx = D.getContext('2d');
      const CELL = 8, cw = Math.ceil(W / CELL), ch = Math.ceil(H_ / CELL);
      const acc = new Float32Array(cw * ch * 3), cnt = new Uint16Array(cw * ch);
      const r = H.rng(2025);                       // the colour decisions are stable...
      const sh = H.rng(7000 + Math.floor(t * 6));   // ...but a few dabs flick to their runner-up hue: the shimmer
      const live = H.clamp((t - 3.3) / 0.6);
      const rp = H.rng(2025);                      // positions stay put
      const dots = [];
      // directional brush touches: oval dabs laid along a slow flow field (the hand's rhythm), slightly larger than before
      const sp = 4.3, nzf = H.makeNoise(2026);
      for (let y = 22; y < H_ - 20; y += sp * 0.87) for (let x = 22; x < W - 20; x += sp) { const px = x + rp.range(-1.6, 1.6) + ((y / sp) & 1) * sp * 0.5, py = y + rp.range(-1.4, 1.4), rr = rp.range(2.05, 2.7); rp();
        dots.push([px, py, rr, -0.6 + 0.5 * nzf.n2(px * 0.004, py * 0.004) + nzf.n2(px * 0.3, py * 0.3) * 0.18]); }
      // each dab gets its moment: the painter works down from the sky, dabbing all over each band
      dots.forEach((d) => { d.push(0.12 + 2.7 * (0.45 * rp() + 0.55 * (d[1] / H_))); });
      dots.sort((a, b) => a[4] - b[4]);
      function choose(tc, ci, temp) {
        const n = cnt[ci], k = ci * 3;
        const want = [0, 1, 2].map((c) => tc[c] * (n + 1) - acc[k + c]);
        let best = 0, bd = 1e12, second = 0, sd = 1e12;
        const dark = tc[0] + tc[1] + tc[2] < 330;   // shadows reach for ultramarine/violet rather than a darker same hue
        for (let p = 0; p < PIG.length; p++) {
          const P = PIG[p];
          let d = (P[0] - want[0]) ** 2 + (P[1] - want[1]) ** 2 * 1.2 + (P[2] - want[2]) ** 2 + r() * temp;
          if (dark && (p === 5 || p === 6 || p === 12)) d *= 0.78;
          if (d < bd) { second = best; sd = bd; best = p; bd = d; } else if (d < sd) { second = p; sd = d; }
        }
        const rq = r(), pick = rq < 0.16 ? second : rq > 0.93 && COMP[best] !== best ? COMP[best] : best;   // ~7% complements: the vibration
        acc[k] += PIG[pick][0]; acc[k + 1] += PIG[pick][1]; acc[k + 2] += PIG[pick][2]; cnt[ci]++;
        return live > 0 && sh() < 0.07 * live ? (pick === best ? second : best) : pick;
      }
      const batches = PIG.map(() => []);
      const flush = () => {
        batches.forEach((list, p) => {
          if (!list.length) return;
          dx.fillStyle = css(PIG[p]); dx.beginPath();
          for (const [x, y, rr, a] of list) { dx.moveTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); dx.ellipse(x, y, rr, rr * (rr > 1.7 ? 0.62 : 0.78), a, 0, 6.2832); }
          dx.fill(); list.length = 0;
        });
      };
      dots.forEach((d0, i) => {
        if (d0[4] > t) return;
        const pop = H.ease.back(H.clamp((t - d0[4]) / 0.09));
        const d = pop >= 1 ? d0 : [d0[0], d0[1], d0[2] * pop, d0[3]];
        const [x, y] = d, xi = Math.min(W - 1, x | 0), yi = Math.min(H_ - 1, y | 0), o = (yi * W + xi) * 4;
        const tc = [T[o], T[o + 1], T[o + 2]];
        const ci = Math.min(ch - 1, (y / CELL) | 0) * cw + Math.min(cw - 1, (x / CELL) | 0);
        batches[choose(tc, ci, 2600)].push(d);
        if (i % 9000 === 8999) flush();
      });
      flush();
      // finer dabs for the lettering and the figures' faces: keeps edges crisp
      const fine = [];
      for (let y = 40; y < 115; y += 1.7) for (let x = 500; x < 1220; x += 1.8) {
        const xi = (x + rp.range(-0.8, 0.8)) | 0, yi = (y + rp.range(-0.8, 0.8)) | 0;
        const fr = rp.range(1.2, 1.55), fa = rp() * 3, fb = 2.85 + (x - 500) / 720 * 0.55 + rp() * 0.08;
        if (textMask[(yi * W + xi) * 4 + 3] > 120 && t >= fb) fine.push([xi + 0.5, yi + 0.5, fr * H.ease.out(H.clamp((t - fb) / 0.08)), fa]);
      }
      fine.forEach((d) => { const q = H.rng((d[0] * 31 + d[1] * 7919) | 0); const pick = q() < 0.55 ? 6 : q() < 0.7 ? 12 : q() < 0.6 ? 5 : 3; batches[pick].push(d); });
      flush();

      // ---------- 4. dab relief: each dab catches light on its upper-left rim ----------
      ctx.drawImage(D, 0, 0);
      const img = ctx.getImageData(0, 0, W, H_), d = img.data, a = dx.getImageData(0, 0, W, H_).data;
      for (let y = 1; y < H_ - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = (y * W + x) * 4;
        const g = (a[i + 3 - 4 - W * 4] - a[i + 3 + 4 + W * 4]);
        if (g === 0) continue;
        const f = 1 + (g < 0 ? 0.2 : -0.17) * Math.abs(g) / 255;   // lit upper-left rim, shadowed lower-right rim
        d[i] *= f; d[i + 1] *= f; d[i + 2] *= f;
      }
      ctx.putImageData(img, 0, 0);

      // ---------- 5. painted border of dots (complementary, darker) ----------
      const br = H.rng(66);
      const border = PIG.map(() => []);
      for (let k = 0; k < 2600; k++) {
        const side = br.int(0, 3), along = br();
        let x, y; const depth = br.range(2, 16);
        if (side === 0) { x = along * W; y = depth; } else if (side === 1) { x = along * W; y = H_ - depth; } else if (side === 2) { x = depth; y = along * H_; } else { x = W - depth; y = along * H_; }
        const p = br.pick([6, 6, 12, 5, 2, 3, 6, 12]), rr = br.range(2, 2.8), an = br() * 3;
        // the border is dabbed on last, travelling clockwise round the frame
        const pos = side === 0 ? along * 0.25 : side === 3 ? 0.25 + along * 0.25 : side === 1 ? 0.5 + (1 - along) * 0.25 : 0.75 + (1 - along) * 0.25;
        const bb = 3.2 + pos * 0.8;
        if (t >= bb) border[p].push([x, y, rr * H.ease.out(H.clamp((t - bb) / 0.08)), an]);
      }
      border.forEach((list, p) => { if (!list.length) return; ctx.fillStyle = css(PIG[p]); ctx.beginPath(); for (const [x, y, rr, an] of list) { ctx.moveTo(x + rr, y); ctx.ellipse(x, y, rr, rr * 0.8, an, 0, 6.2832); } ctx.fill(); });
      ctx.strokeStyle = `rgba(40,40,90,${0.35 * H.clamp((t - 3.9) / 0.3)})`; ctx.lineWidth = 1; ctx.strokeRect(19.5, 19.5, W - 39, H_ - 39);
    }
  });
}
