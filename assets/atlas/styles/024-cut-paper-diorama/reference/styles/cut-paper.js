{
  const TAU = Math.PI * 2;

  const poly = (c, pts) => {
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.closePath();
  };
  // scissor-cut circle: slightly faceted, slightly wobbly
  const circPts = (r, cx, cy, R, seg = 15, jit = 0.6) => {
    const n = Math.max(18, Math.round((TAU * R) / seg)), a0 = r() * TAU, out = [];
    for (let i = 0; i < n; i++) {
      const a = a0 + ((i + r.range(-0.2, 0.2)) / n) * TAU, rr = R + r.gauss() * jit;
      out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return out;
  };
  // scissor-cut edge following y=f(x): short straight-ish snips
  const ridge = (r, x0, x1, f, sMin = 12, sMax = 30, jit = 0.6) => {
    const out = [];
    let x = x0;
    while (x < x1) { out.push([x, f(x) + r.gauss() * jit]); x += r.range(sMin, sMax); }
    out.push([x1, f(x1)]);
    return out;
  };
  // straight cut between points with tiny wobbles
  const cutLines = (r, pts, seg = 22, jit = 0.7) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / seg));
      for (let k = 0; k < n; k++) {
        const u = k / n;
        out.push([ax + (bx - ax) * u + (k ? r.gauss() * jit : 0), ay + (by - ay) * u + (k ? r.gauss() * jit : 0)]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  };

  // tileable paper fibre texture (alpha-only light/dark flecks)
  const makeTex = (seed) => {
    const S = 512, cv = H.layer(S, S), x = cv.getContext('2d'), r = H.rng(seed), nz = H.makeNoise(seed + 1);
    // low-res tileable mottle
    const M = 64, mc = H.layer(M, M), mx = mc.getContext('2d'), mi = mx.createImageData(M, M), f = 5 / M;
    for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) {
      const n = (a, b) => nz.fbm2(a * f, b * f, 3);
      const v = (n(i, j) * (M - i) * (M - j) + n(i - M, j) * i * (M - j) + n(i, j - M) * (M - i) * j + n(i - M, j - M) * i * j) / (M * M);
      const k = (j * M + i) * 4, a = Math.min(255, Math.abs(v) * 120);
      mi.data[k] = mi.data[k + 1] = mi.data[k + 2] = v > 0 ? 255 : 0; mi.data[k + 3] = a;
    }
    mx.putImageData(mi, 0, 0);
    x.imageSmoothingEnabled = true;
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) x.drawImage(mc, ox * S, oy * S, S, S);
    // fine grain
    const g = x.getImageData(0, 0, S, S), d = g.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = r() - 0.5;
      if (r() < 0.5) continue;
      const a = Math.abs(n) * 60;
      // blend fleck over mottle
      const c = n > 0 ? 255 : 0, aa = a / 255, oa = d[i + 3] / 255, na = aa + oa * (1 - aa);
      if (na > 0) {
        d[i] = (c * aa + d[i] * oa * (1 - aa)) / na; d[i + 1] = d[i]; d[i + 2] = d[i];
        d[i + 3] = na * 255;
      }
    }
    x.putImageData(g, 0, 0);
    // fibres
    x.lineCap = 'round';
    for (let n = 0; n < 1100; n++) {
      const px = r() * S, py = r() * S, len = r.range(4, 22), a = r() * TAU, bend = r.range(-5, 5);
      const light = r() < 0.55;
      x.strokeStyle = light ? `rgba(255,255,255,${r.range(0.08, 0.22)})` : `rgba(0,0,0,${r.range(0.05, 0.14)})`;
      x.lineWidth = r.range(0.4, 1.1);
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const sx = px + ox * S, sy = py + oy * S;
        if (sx < -30 || sx > S + 30 || sy < -30 || sy > S + 30) continue;
        x.beginPath(); x.moveTo(sx, sy);
        x.quadraticCurveTo(sx + Math.cos(a) * len * 0.5 - Math.sin(a) * bend, sy + Math.sin(a) * len * 0.5 + Math.cos(a) * bend, sx + Math.cos(a) * len, sy + Math.sin(a) * len);
        x.stroke();
      }
    }
    return cv;
  };

  // =====================================================================
  // EXPLAINER: "How does AI learn?" told as one long paper diorama that
  // the camera pans along (parallax), with paper sprites cached once.
  // =====================================================================
  const PK = {};
  const pkTex = () => PK.tex || (PK.tex = makeTex(77));
  const paperize = (w, h, paint, o = {}) => {
    const L = H.layer(Math.ceil(w), Math.ceil(h)), c = L.getContext('2d');
    paint(c);
    const r = H.rng(o.seed || 7);
    const pat = c.createPattern(pkTex(), 'repeat');
    pat.setTransform(new DOMMatrix().translateSelf(r() * 512, r() * 512).rotateSelf(r.range(-30, 30)));
    c.save(); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = o.tex ?? 1; c.fillStyle = pat; c.fillRect(0, 0, w, h); c.restore();
    const edge = (col, dx, dy) => {
      const T = H.layer(L.width, L.height), tc = T.getContext('2d');
      tc.drawImage(L, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, w, h);
      tc.globalCompositeOperation = 'destination-out'; tc.drawImage(L, dx, dy);
      c.save(); c.globalCompositeOperation = 'source-atop'; c.drawImage(T, 0, 0); c.restore();
    };
    if (o.rim !== false) { edge(`rgba(255,247,232,${o.hi ?? 0.38})`, 1.3, 1.6); edge(`rgba(0,0,0,${o.lo ?? 0.28})`, -1.1, -1.3); }
    return L;
  };
  const shadowDraw = (ctx, img, x, y, d = 1, sa = 0.5) => {
    ctx.save();
    if (d > 0) {
      ctx.shadowColor = `rgba(14,10,30,${sa})`; ctx.shadowBlur = 6 + d * 7; ctx.shadowOffsetX = 1.5 + d * 2.4; ctx.shadowOffsetY = 2 + d * 3.6;
      ctx.drawImage(img, x, y);
      ctx.shadowColor = 'rgba(10,6,20,0.38)'; ctx.shadowBlur = 2.5; ctx.shadowOffsetX = 0.8; ctx.shadowOffsetY = 1.4;
    }
    ctx.drawImage(img, x, y); ctx.restore();
  };
  const put = (ctx, spr, cx, cy, o = {}) => {
    ctx.save(); ctx.translate(cx, cy);
    if (o.rot) ctx.rotate(o.rot);
    if (o.sx != null || o.s != null) ctx.scale(o.sx ?? o.s ?? 1, o.sy ?? o.s ?? 1);
    if (o.a != null) ctx.globalAlpha = o.a;
    shadowDraw(ctx, spr, -spr.width / 2, -spr.height / 2, o.d ?? 1, o.sa ?? 0.5);
    ctx.restore();
  };
  const compose = (w, h, layers) => {
    const C = H.layer(w, h), c = C.getContext('2d');
    layers.forEach(([paint, d, o], i) => shadowDraw(c, paperize(w, h, paint, { seed: 30 + i * 7, ...(o || {}) }), 0, 0, d, 0.4));
    return C;
  };
  const cache = (k, f) => PK[k] || (PK[k] = f());
  const AF = (px) => `400 ${px}px "Archivo Black"`;
  const measure = (str, font) => { const c = H.layer(4, 4).getContext('2d'); c.font = font; return c.measureText(str).width; };
  // cut letters (or a word) on a cut-around backing
  const wordSpr = (str, px, col, back = '#f3ecdc', bw = 18) => cache('w' + str + px + col + back, () => {
    const font = AF(px), tw = measure(str, font), w = tw + bw * 2 + 16, h = px * 1.35 + bw * 2;
    const by = h / 2 + px * 0.36;
    const layers = [];
    if (back) layers.push([(c) => { c.font = font; c.lineJoin = 'round'; c.lineWidth = bw * 1.6; c.strokeStyle = back; c.fillStyle = back; c.strokeText(str, bw + 8, by); c.fillText(str, bw + 8, by); }, 0]);
    layers.push([(c) => { c.font = font; c.fillStyle = col; c.fillText(str, bw + 8, by); }, back ? 0.45 : 0]);
    return compose(w, h, layers);
  });
  const blobPath = (c, parts) => { c.beginPath(); parts.forEach((p) => poly(c, p)); };
  // little cut-paper picture cards with a tag that names them
  const cardSpr = (kind) => cache('card' + kind, () => {
    const r = H.rng(kind === 'cat' ? 11 : 12);
    const cat = kind === 'cat';
    return compose(140, 176, [
      [(c) => { c.fillStyle = '#f3ecdc'; c.beginPath(); poly(c, cutLines(r, [[8, 8], [132, 8], [132, 168], [8, 168], [8, 8]], 20, 0.5)); c.fill(); }, 0],
      [(c) => { c.fillStyle = cat ? '#86bccd' : '#e8c56b'; c.fillRect(20, 20, 100, 94); }, 0.3],
      [(c) => {
        c.fillStyle = cat ? '#e8874c' : '#6e4428';
        c.beginPath();
        if (cat) { poly(c, [[44, 58], [50, 26], [66, 48]]); poly(c, [[96, 58], [90, 26], [74, 48]]); }
        else { c.ellipse(42, 66, 11, 24, 0.3, 0, TAU); c.ellipse(98, 66, 11, 24, -0.3, 0, TAU); }
        c.fill();
      }, 0.3],
      [(c) => { c.fillStyle = cat ? '#f09a5c' : '#b07a4c'; c.beginPath(); poly(c, circPts(r, 70, 70, 29, 10, 0.5)); c.fill(); }, 0.45],
      [(c) => {
        c.fillStyle = cat ? '#fbe3c8' : '#f3dfc2'; c.beginPath(); c.ellipse(70, 84, cat ? 13 : 16, cat ? 9 : 12, 0, 0, TAU); c.fill();
        c.fillStyle = '#2b2033'; c.beginPath(); c.arc(59, 64, 4, 0, TAU); c.arc(81, 64, 4, 0, TAU); c.fill();
        c.fillStyle = cat ? '#e0607a' : '#2b2033'; c.beginPath(); c.ellipse(70, 79, cat ? 4 : 6, cat ? 3 : 4.5, 0, 0, TAU); c.fill();
      }, 0.25],
      [(c) => { c.fillStyle = '#fbf6ea'; c.beginPath(); poly(c, [[30, 128], [100, 128], [114, 145], [100, 162], [30, 162]]); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(103, 145, 4, 0, TAU); c.fill(); }, 0.55],
      [(c) => { c.font = AF(24); c.fillStyle = cat ? '#d9473b' : '#2f7f86'; c.fillText(kind, 38, 154); }, 0.12],
    ]);
  });
  const brainSpr = () => cache('brain', () => {
    const r = H.rng(21), parts = [], inner = [];
    [[-90, 10, 58], [-50, -50, 62], [15, -68, 64], [80, -40, 58], [104, 22, 50], [50, 50, 60], [-30, 52, 62], [-10, 0, 70]].forEach(([x, y, rr]) => parts.push(circPts(r, 160 + x, 128 + y, rr, 12, 0.6)));
    [[-60, -10, 26], [-20, -40, 24], [30, -30, 26], [70, 0, 22], [20, 25, 24], [-30, 30, 22]].forEach(([x, y, rr]) => inner.push(circPts(r, 160 + x, 128 + y, rr, 10, 0.5)));
    return compose(330, 260, [
      [(c) => { c.fillStyle = '#e8839a'; blobPath(c, parts); c.fill(); }, 0],
      [(c) => { c.strokeStyle = '#f3a7b6'; c.lineWidth = 13; c.lineCap = 'round'; c.lineJoin = 'round';
        [[[70, 120], [95, 80], [130, 95], [120, 60]], [[70, 170], [110, 150], [100, 120]], [[195, 60], [230, 80], [210, 110], [245, 130]], [[190, 180], [225, 150], [255, 175]], [[115, 205], [140, 180]], [[205, 210], [240, 200]]].forEach((ln) => { c.beginPath(); ln.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); });
      }, 0.35],
      [(c) => { c.fillStyle = '#c95f7a'; c.fillRect(156, 52, 8, 150); }, 0.2],
    ]);
  });
  const panelSpr = () => cache('panel', () => compose(300, 96, [
    [(c) => { c.fillStyle = '#2f7f86'; c.beginPath(); poly(c, cutLines(H.rng(4), [[6, 6], [294, 6], [294, 90], [6, 90], [6, 6]], 24, 0.5)); c.fill(); }, 0],
    [(c) => { c.fillStyle = '#f3ecdc'; [70, 150, 230].forEach((x) => { c.beginPath(); poly(c, circPts(H.rng(x), x, 48, 28, 10, 0.4)); c.fill(); }); }, 0.45],
  ]));
  const pointerSpr = () => cache('ptr', () => paperize(16, 56, (c) => { c.fillStyle = '#d9473b'; c.beginPath(); poly(c, [[8, 2], [14, 30], [10, 54], [6, 54], [2, 30]]); c.fill(); }, { seed: 5 }));
  const bubbleSpr = (txt) => cache('bub' + txt, () => {
    const r = H.rng(txt.length + 3);
    return compose(230, 150, [
      [(c) => { c.fillStyle = '#fbf6ea'; c.beginPath(); c.ellipse(118, 64, 100, 54, 0, 0, TAU); c.moveTo(40, 92); c.lineTo(18, 140); c.lineTo(78, 112); c.fill(); }, 0],
      [(c) => { c.font = AF(46); c.fillStyle = txt === 'cat' ? '#2f7f86' : '#2b2d5a'; const w = measure(txt, AF(46)); c.fillText(txt, 118 - w / 2, 82); }, 0.35],
    ]);
  });
  const crossSpr = () => cache('x', () => paperize(110, 110, (c) => { c.fillStyle = '#d9473b'; c.save(); c.translate(55, 55); c.rotate(0.785); c.fillRect(-48, -11, 96, 22); c.fillRect(-11, -48, 22, 96); c.restore(); }, { seed: 9 }));
  const checkSpr = () => cache('ok', () => paperize(120, 110, (c) => { c.fillStyle = '#5fae6a'; c.beginPath(); poly(c, [[8, 58], [26, 40], [46, 62], [96, 10], [114, 28], [46, 98]]); c.fill(); }, { seed: 10 }));
  const ringSpr = () => cache('ring', () => paperize(300, 230, (c) => { c.fillStyle = '#f2b545'; c.beginPath(); c.ellipse(150, 115, 145, 110, 0, 0, TAU); c.ellipse(150, 115, 125, 92, 0, 0, TAU); c.fill('evenodd'); }, { seed: 12 }));
  const burstSpr = () => cache('burst', () => paperize(340, 340, (c) => { c.fillStyle = '#f2b545'; c.beginPath(); for (let i = 0; i < 32; i++) { const a = (i / 32) * TAU, rr = i % 2 ? 100 : 168; const x = 170 + Math.cos(a) * rr, y = 170 + Math.sin(a) * rr; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.fill(); }, { seed: 13 }));
  const digitSpr = (ch, px, col) => wordSpr(ch, px, col, '#f3ecdc', 10);
  // cut-paper arrow (strip + head) revealed along a quadratic path
  const arrow = (ctx, ax, ay, cx, cy, bx, by, p, col, seed) => {
    if (p <= 0) return;
    const pts = [];
    for (let i = 0; i <= 40 * p; i++) { const u = i / 40; pts.push([(1 - u) * (1 - u) * ax + 2 * u * (1 - u) * cx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * u * (1 - u) * cy + u * u * by]); }
    if (pts.length < 2) return;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    x0 -= 34; y0 -= 34; x1 += 34; y1 += 34;
    const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2], a = Math.atan2(ey - py, ex - px);
    const L = paperize(x1 - x0, y1 - y0, (c) => {
      c.translate(-x0, -y0); c.strokeStyle = col; c.lineWidth = 13; c.lineCap = 'butt'; c.lineJoin = 'round';
      c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x - Math.cos(a) * 12 * (i === pts.length - 1), y - Math.sin(a) * 12 * (i === pts.length - 1)) : c.moveTo(x, y))); c.stroke();
      c.fillStyle = col; c.beginPath(); c.moveTo(ex + Math.cos(a) * 14, ey + Math.sin(a) * 14);
      c.lineTo(ex + Math.cos(a + 2.5) * 22, ey + Math.sin(a + 2.5) * 22); c.lineTo(ex + Math.cos(a - 2.5) * 22, ey + Math.sin(a - 2.5) * 22); c.fill();
    }, { seed });
    shadowDraw(ctx, L, x0, y0, 0.6);
  };
  const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const numberRow = (ctx, str, x, y, px, col, o = {}) => {
    let cx = x;
    for (const ch of str) {
      const s = digitSpr(ch, px, col), w = s.width - 22;
      const jr = H.rng(ch.charCodeAt(0) * 13 + Math.round(cx));
      put(ctx, s, cx + w / 2, y, { rot: (jr() - 0.5) * 0.08, d: o.d ?? 0.7 });
      cx += w - 2;
    }
    return cx;
  };
  // drop-in animation helper (paper falls on, overshoots, settles; shadow is lifted while in the air)
  const dropIn = (t, st, du = 0.4, dist = 60) => {
    const u = H.clamp((t - st) / du);
    if (u <= 0) return null;
    const e = H.ease.back(u), lift = 1 - H.ease.out(u);
    return { dy: -(1 - e) * dist, s: 1 + lift * 0.08, d: lift * 3, a: H.clamp(u * 4) };
  };

  const EXPLAIN = (ctx, W, H_, t) => {
    // ---- camera: one long diorama, panned station to station ----
    const seg = (a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
    const cam = 1280 * seg(1.8, 2.8) + 380 * seg(5.6, 6.2) + 1280 * seg(10.1, 10.8);
    // backboard + stars (screen-fixed, far away)
    ctx.drawImage(cache('sky', () => {
      const C = H.layer(W, H_), c = C.getContext('2d');
      c.drawImage(paperize(W, H_, (x) => { x.fillStyle = '#2b2d5a'; x.fillRect(0, 0, W, H_); }, { rim: false, seed: 2 }), 0, 0);
      const r = H.rng(31);
      const st = paperize(W, H_, (x) => { x.fillStyle = '#f6e7bf'; for (let i = 0; i < 60; i++) { const sx = r.range(10, W - 10), sy = r.range(10, 430), s = r.range(3, 7), pts = []; for (let j = 0; j < 10; j++) { const rr = j % 2 ? s * 0.42 : s, a = (j / 10) * TAU; pts.push([sx + Math.cos(a) * rr, sy + Math.sin(a) * rr]); } x.beginPath(); poly(x, pts); x.fill(); } }, { hi: 0.3 });
      shadowDraw(c, st, 0, 0, 0.25);
      return C;
    }), 0, 0);
    // far mountains (parallax 0.3)
    const far = cache('far', () => {
      const r = H.rng(71), f = (x) => 470 + 70 * Math.sin(x * 0.006 + 1) + 40 * Math.sin(x * 0.017);
      // sprite starts 40px higher than before so the tallest peak (y 360) is no longer sliced flat by the sprite top
      return paperize(2400, 400, (c) => { c.fillStyle = '#4c5590'; c.beginPath(); poly(c, [...ridge(r, 0, 2400, (x) => f(x) - 340, 14, 30, 0.6), [2400, 400], [0, 400]]); c.fill(); });
    });
    shadowDraw(ctx, far, -cam * 0.3, 340, 1.0);
    // mid ridge (parallax 0.6): a second scissor-cut hill sheet with little paper pines glued on,
    // so the backdrop reads as a stacked shadow-box like the hero rather than one ridge + a slab
    const mid = cache('mid', () => {
      const r = H.rng(91), f = (x) => 62 + 26 * Math.sin(x * 0.0047 + 0.6) + 14 * Math.sin(x * 0.0135 + 2.1) + 6 * Math.sin(x * 0.037);
      const C = H.layer(3200, 300), c = C.getContext('2d');
      shadowDraw(c, paperize(3200, 300, (x) => { x.fillStyle = '#3d5f7a'; x.beginPath(); poly(x, [...ridge(r, 0, 3200, f, 12, 28, 0.6), [3200, 300], [0, 300]]); x.fill(); }, { seed: 92 }), 0, 0, 0);
      // pines: three stacked zigzag tiers on a trunk, each pine its own cut sheet
      const pr = H.rng(93);
      for (let px = 60; px < 3200; px += pr.range(130, 320)) {
        const h = pr.range(46, 84), base = f(px) + h * 0.18, w = h * 0.5, col = pr() < 0.5 ? '#2a5560' : '#335f6a';
        const pts = [];
        for (let k = 0; k < 3; k++) {
          const ty = base - h * 0.16 - k * h * 0.25, tw = w * (1 - k * 0.24), th = h * 0.4;
          const tier = [[px, ty - th]];
          for (let j = 0; j <= 4; j++) { const u = j / 4; tier.push([px + tw / 2 - u * tw, ty + (j % 2 ? -4 : 0) + pr.gauss() * 0.5]); }
          pts.push(tier);
        }
        const pw = Math.ceil(w + 24), ph = Math.ceil(h * 1.25 + 10), ox = px - pw / 2, oy = base - h * 1.15;
        const sp = paperize(pw, ph, (x) => { x.translate(-ox, -oy); x.fillStyle = '#3a2c2a'; x.fillRect(px - 3, base - h * 0.22, 6, h * 0.3); x.fillStyle = col; x.beginPath(); pts.forEach((p) => poly(x, p)); x.fill(); }, { seed: 94 + Math.round(px) });
        shadowDraw(c, sp, ox, oy, 0.5, 0.4);
      }
      return C;
    });
    shadowDraw(ctx, mid, -cam * 0.6, 452, 1.15);
    // ground (world, parallax 1): torn top edge showing the white fibrous core of the card, like the hero's hills
    const ground = cache('ground', () => {
      const nz = H.makeNoise(83), r = H.rng(81), f = (x) => 22 + 12 * Math.sin(x * 0.005 + 1.3) + 7 * Math.sin(x * 0.019);
      const torn = [], core = [];
      for (let x = 0; x <= 4500; x += 2.5) {
        const y = f(x) + nz.fbm2(x * 0.03, 0.5, 4) * 5 + r.gauss() * 0.6;
        torn.push([x, y + 3 + Math.abs(nz.n2(x * 0.045, 3.1)) * 7 + Math.abs(nz.n2(x * 0.3, 7.7)) * 2]);
        core.push([x, y]);
      }
      return paperize(4500, 200, (c) => {
        c.fillStyle = '#f3ecdc'; c.beginPath(); poly(c, [...core, [4500, 200], [0, 200]]); c.fill();
        c.strokeStyle = 'rgba(248,244,236,0.95)'; c.lineCap = 'round';
        for (let i = 0; i < core.length; i++) {
          if (!r.chance(0.55)) continue;
          const [x, y] = core[i], a = -Math.PI / 2 + r.range(-0.9, 0.9), l = r.range(1.5, 5.5);
          c.lineWidth = r.range(0.4, 0.9); c.beginPath(); c.moveTo(x, y + 1); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
        }
        c.fillStyle = '#2f6b66'; c.beginPath(); poly(c, [...torn, [4500, 200], [0, 200]]); c.fill();
        // grass snips cut up out of the green sheet
        const gr = H.rng(84);
        c.beginPath();
        for (let x = 30; x < 4480; x += gr.range(60, 190)) {
          const n = gr.int(2, 4), by = f(x) + 40 + gr.range(0, 60);
          for (let k = 0; k < n; k++) { const bx = x + k * 7; c.moveTo(bx, by); c.lineTo(bx + 2 + gr.range(-3, 4), by - gr.range(10, 22)); c.lineTo(bx + 5, by); }
        }
        c.fillStyle = '#285f5a'; c.fill();
      }, { seed: 85 });
    });
    shadowDraw(ctx, ground, -cam - 100, 560, 1.3);
    // nearest strip (parallax 1.25): dark foreground card with grass snips along the bottom edge
    const fore = cache('fore', () => {
      const r = H.rng(141), f = (x) => 30 + 10 * Math.sin(x * 0.0045 + 0.4) + 5 * Math.sin(x * 0.013), pts = [];
      let x = 0;
      while (x < 5200) {
        if (r.chance(0.2)) {
          const n = r.int(2, 4);
          for (let k = 0; k < n; k++) { const bx = x + k * 7, by = f(bx); pts.push([bx, by], [bx + 2 + r.range(-3, 4), by - r.range(12, 26)], [bx + 5, by]); }
          x += n * 7 + 4;
        } else { pts.push([x, f(x) + r.gauss() * 0.6]); x += r.range(14, 30); }
      }
      return paperize(5200, 90, (c) => { c.fillStyle = '#163a3a'; c.beginPath(); poly(c, [...pts, [5200, 90], [0, 90]]); c.fill(); }, { seed: 142 });
    });
    shadowDraw(ctx, fore, -cam * 1.25 - 60, 660, 1.6);

    ctx.save(); ctx.translate(-cam, 0); // ---------------- world space ----------------

    // ---- BEAT 1: the question, cut letters dropped on the backboard ----
    {
      const lines = [['How does', 92, 250], ['AI learn?', 128, 400]];
      let i = 0;
      lines.forEach(([str, px, y]) => {
        const tot = measure(str, AF(px)) + str.length * 4;
        let x = 640 - tot / 2;
        for (const ch of str) {
          const w = measure(ch, AF(px));
          if (ch !== ' ') {
            const A = dropIn(t, 0.15 + i * 0.06, 0.38, 70);
            const cols = ['#e8604a', '#f2b545', '#58b0a6'];
            if (A && cam < 1300) put(ctx, wordSpr(ch, px, cols[i % 3], '#f3ecdc', 14), x + w / 2, y + A.dy, { s: A.s, d: 0.8 + A.d, rot: (H.rng(i + 3)() - 0.5) * 0.12 });
            i++;
          }
          x += w + 4;
        }
      });
    }

    // ---- BEAT 2: labelled examples ride a paper conveyor into the model ----
    const BX = 2290, BY = 330;
    if (cam > 400) {
      const belt = cache('belt', () => compose(1060, 120, [
        [(c) => { // cut-card supports: tapered teal legs with a foot tab
          const r = H.rng(88);
          [37, 527, 1007].forEach((x) => { c.fillStyle = '#24585b'; c.beginPath(); poly(c, cutLines(r, [[x - 14, 50], [x + 14, 50], [x + 17, 112], [x + 26, 112], [x + 26, 120], [x - 26, 120], [x - 26, 112], [x - 17, 112], [x - 14, 50]], 16, 0.4)); c.fill();
            c.fillStyle = 'rgba(8,24,30,0.35)'; c.beginPath(); poly(c, [[x + 3, 50], [x + 14, 50], [x + 17, 112], [x + 5, 112]]); c.fill(); });
        }, 0.5],
        [(c) => { c.fillStyle = '#1f4f53'; c.beginPath(); poly(c, cutLines(H.rng(8), [[0, 20], [1060, 20], [1060, 56], [0, 56], [0, 20]], 26, 0.5)); c.fill(); }, 0.4],
        [(c) => { c.fillStyle = '#f2b545'; for (let x = 40; x < 1060; x += 90) { c.beginPath(); c.arc(x, 38, 11, 0, TAU); c.fill(); } }, 0.3],
      ]));
      shadowDraw(ctx, belt, 1110, 470, 0.9);
      // flow arrow over the belt
      arrow(ctx, 1380, 300, 1700, 262, 2080, 300, seg(2.7, 3.3), '#f2b545', 41);
      // cards
      const r = H.rng(55);
      for (let k = 0; k < 9; k++) {
        const s = 2.15 + k * 0.3, kind = r() < 0.5 ? 'cat' : 'dog', wob = r() * 6;
        const x = 1150 + (t - s) * 650;
        if (t < s || x > BX - 60) continue;
        put(ctx, cardSpr(kind), x, 410 + Math.sin(t * 9 + wob) * 2, { rot: Math.sin(t * 5 + wob) * 0.03, d: 0.9 });
      }
      // counter: paper digits
      const A = dropIn(t, 2.55, 0.4, 50);
      if (A) {
        const n = 1e6 * Math.pow(H.clamp((t - 2.8) / 2.3), 2.2);
        const end = numberRow(ctx, fmt(n), 1440, 165 + A.dy, 64, '#f2b545');
        put(ctx, wordSpr('examples', 40, '#58b0a6'), end + 120, 172 + A.dy, { d: 0.7 });
      }
    }
    // model: brain + dial panel (stays through beat 3)
    let gulp = 0;
    { const r = H.rng(55); for (let k = 0; k < 9; k++) { const s = 2.15 + k * 0.3; r(); r(); const tin = s + (BX - 60 - 1150) / 650; gulp += Math.exp(-Math.pow((t - tin) * 9, 2)); } }
    const PB = dropIn(t, 2.6, 0.45, 80);
    if (PB) {
      put(ctx, panelSpr(), BX, 560 + PB.dy, { d: 1 + PB.d });
      const adj = seg(8.9, 9.5);
      [0, 1, 2].forEach((i) => {
        const base = [-0.9, 0.5, -0.3][i], delta = [1.3, -0.9, 1.0][i];
        const ang = base + delta * adj + (adj > 0 && adj < 1 ? Math.sin(t * 40 + i) * 0.08 : 0);
        put(ctx, pointerSpr(), BX - 80 + i * 80 + Math.sin(ang) * 14, 560 + PB.dy - Math.cos(ang) * 14, { rot: ang, d: 0.4 });
      });
      put(ctx, brainSpr(), BX, BY + PB.dy, { s: (1 + gulp * 0.05) * PB.s, d: 1.4 + PB.d });
      const T1 = dropIn(t, 3.3, 0.35, 40);
      if (T1) put(ctx, wordSpr('model', 30, '#2b2d5a', '#fbf6ea', 10), BX - 110, BY + 118 + T1.dy, { rot: -0.1, d: 0.8 + T1.d });
    }

    // ---- BEAT 3: guess -> check -> adjust loop ----
    if (t > 6.0) {
      const NC = dropIn(t, 6.3, 0.4, 90);
      if (NC) put(ctx, cardSpr('cat'), 1880, 300 + NC.dy, { s: 1.15 * NC.s, d: 1.2 + NC.d, rot: -0.05 });
      arrow(ctx, 1975, 300, 2040, 270, 2120, 300, seg(6.7, 7.0), '#f2b545', 51);
      arrow(ctx, 2445, 290, 2510, 250, 2570, 262, seg(7.05, 7.35), '#f2b545', 52);
      const G = dropIn(t, 7.2, 0.3, 40);
      if (G) put(ctx, wordSpr('Guess', 30, '#2b2d5a', '#fbf6ea', 10), 2505, 205 + G.dy, { rot: -0.08, d: 0.8 + G.d });
      // bubble flips from "dog?" to "cat"
      const B = dropIn(t, 7.4, 0.35, 50);
      if (B) {
        const flip = H.clamp((t - 9.55) / 0.3), sx = Math.abs(Math.cos(flip * Math.PI)) + 0.001;
        const wrong = flip < 0.5;
        const shake = t > 7.9 && t < 8.3 ? Math.sin(t * 60) * 6 * (8.3 - t) * 2.5 : 0;
        const ring = dropIn(t, 7.9, 0.3, 0);
        if (ring && wrong) put(ctx, ringSpr(), 2690, 255, { s: 0.7 + 0.3 * H.ease.back(H.clamp((t - 7.9) / 0.3)), d: 0.6, rot: 0.05 });
        put(ctx, bubbleSpr(wrong ? 'dog?' : 'cat'), 2690 + shake, 260 + B.dy, { sx, sy: 1, d: 1 + B.d });
        const X = dropIn(t, 7.9, 0.25, 40);
        if (X && wrong) put(ctx, crossSpr(), 2790, 215 + X.dy, { s: X.s, d: 0.8 + X.d, rot: 0.1 });
        const C = dropIn(t, 8.05, 0.3, 40);
        if (C && t < 9.55) put(ctx, wordSpr('Check', 30, '#d9473b', '#fbf6ea', 10), 2640, 345 + C.dy, { rot: 0.06, d: 0.8 + C.d });
        const V = dropIn(t, 9.9, 0.3, 50);
        if (V) put(ctx, checkSpr(), 2795, 215 + V.dy, { s: V.s, d: 0.8 + V.d, rot: -0.06 });
      }
      // error signal travels back to the dials
      if (t < 9.6) arrow(ctx, 2660, 335, 2580, 560, 2420, 560, seg(8.3, 8.8), '#d9473b', 53);
      const AJ = dropIn(t, 8.7, 0.3, 40);
      if (AJ && t < 9.6) put(ctx, wordSpr('Adjust', 30, '#d9473b', '#fbf6ea', 10), 2560, 610 + AJ.dy, { rot: -0.05, d: 0.8 + AJ.d });
    }

    // ---- BEAT 4: progress chart, bars pop up from behind the ground ----
    if (cam > 2000) {
      const OXc = 3250, base = 590, accs = [61, 72, 80, 86, 90, 93, 95, 97];
      const axis = cache('axis', () => compose(640, 400, [[(c) => { c.fillStyle = '#f3ecdc'; c.fillRect(20, 0, 12, 390); c.fillRect(20, 378, 620, 12); }, 0]]));
      shadowDraw(ctx, axis, OXc - 26, base - 388, 0.6);
      let shown = 61, last = -1;
      ctx.save(); ctx.beginPath(); ctx.rect(OXc - 40, 0, 700, base - 6); ctx.clip();
      accs.forEach((a, i) => {
        const st = 10.85 + i * 0.22, u = H.clamp((t - st) / 0.32);
        if (u <= 0) return;
        const hgt = a * 3.4, bar = cache('bar' + i, () => paperize(56, hgt, (c) => { c.fillStyle = i === 7 ? '#e8604a' : i % 2 ? '#58b0a6' : '#f2b545'; c.beginPath(); poly(c, cutLines(H.rng(i), [[2, 2], [54, 2], [54, hgt], [2, hgt], [2, 2]], 22, 0.5)); c.fill(); }, { seed: 60 + i }));
        shadowDraw(ctx, bar, OXc + 30 + i * 74, base - hgt * H.ease.back(u), 0.9);
        last = i;
      });
      ctx.restore();
      if (last >= 0) { const st = 10.85 + last * 0.22; shown = H.lerp(last ? accs[last - 1] : 55, accs[last], H.clamp((t - st) / 0.32)); }
      const Lb = dropIn(t, 10.6, 0.35, 50);
      if (Lb) {
        if (t > 12.6) { const u = H.clamp((t - 12.6) / 0.35); put(ctx, burstSpr(), 3995, 168, { s: 0.2 + 0.8 * H.ease.back(u), rot: t * 0.3, d: 0.7 }); }
        put(ctx, wordSpr('Accuracy', 44, '#58b0a6'), 3480, 170 + Lb.dy, { d: 0.8 + Lb.d, rot: -0.03 });
        const pop = t > 12.6 ? 1 + 0.18 * Math.sin(H.clamp((t - 12.6) / 0.35) * Math.PI) : 1;
        ctx.save(); ctx.translate(3995, 170); ctx.scale(pop, pop); ctx.translate(-3995, -170);
        numberRow(ctx, Math.round(shown) + '%', 3900, 165 + Lb.dy, 72, '#e8604a');
        ctx.restore();
      }
      const RL = dropIn(t, 11.1, 0.3, 30);
      if (RL) put(ctx, wordSpr('training rounds', 26, '#2b2d5a', '#fbf6ea', 9), OXc + 330, base + 40 + RL.dy, { d: 0.6 + RL.d });
    }
    ctx.restore(); // ---------------- end world ----------------

    // header: the question shrinks to a pinned paper tag
    const HD = dropIn(t, 2.0, 0.4, 60);
    if (HD) put(ctx, wordSpr('How does AI learn?', 30, '#f3ecdc', '#e8604a', 10), 225, 48 + HD.dy, { rot: -0.03, d: 1 + HD.d });

    // ---- BEAT 5: takeaway banner ----
    const TB = dropIn(t, 13.0, 0.45, 80);
    if (TB) {
      const ban = cache('banner', () => {
        const a = wordSpr('More examples', 38, '#2b2d5a', null), b = wordSpr('better guesses', 38, '#e8604a', null);
        const w = a.width + b.width + 110, C = H.layer(w + 40, 110), c = C.getContext('2d');
        shadowDraw(c, paperize(w + 40, 110, (x) => { x.fillStyle = '#fbf6ea'; x.beginPath(); poly(x, cutLines(H.rng(3), [[6, 12], [w + 34, 6], [w + 30, 98], [10, 104], [6, 12]], 30, 0.6)); x.fill(); }, { seed: 4 }), 0, 0, 0);
        shadowDraw(c, a, 20, 55 - a.height / 2, 0.4, 0.3);
        arrow(c, a.width + 22, 56, a.width + 50, 56, a.width + 84, 56, 1, '#58b0a6', 77);
        shadowDraw(c, b, a.width + 100, 55 - b.height / 2, 0.4, 0.3);
        return C;
      });
      put(ctx, ban, 640, 660 + TB.dy, { s: TB.s, d: 1.4 + TB.d, rot: -0.01 });
    }

    // ---- photo finish ----
    ctx.save(); ctx.globalCompositeOperation = 'soft-light';
    const lg = ctx.createRadialGradient(260, 60, 40, 420, 200, 1100);
    lg.addColorStop(0, 'rgba(255,236,200,1)'); lg.addColorStop(0.5, 'rgba(255,230,200,0.25)'); lg.addColorStop(1, 'rgba(0,0,20,0.6)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H_);
    // second, fainter warm pool on the stage where the action is (a lamp over the shadow-box)
    const lp = ctx.createRadialGradient(720, 330, 20, 720, 330, 560);
    lp.addColorStop(0, 'rgba(255,214,160,0.42)'); lp.addColorStop(1, 'rgba(255,214,160,0)');
    ctx.fillStyle = lp; ctx.fillRect(0, 0, W, H_); ctx.restore();
    H.vignette(ctx, W, H_, 0.42, '10,6,24');
    H.grain(ctx, W, H_, 0.03, 9 + Math.floor(t * 12));
  };

  registerStyle({
    id: 'cut-paper',
    name: 'Cut-Paper Diorama',
    category: 'Paper & Craft',
    description: 'A layered cardstock shadow-box: every shape is a separate scissor-cut sheet with fibre texture, a lit paper edge and a soft drop shadow onto the sheet behind it; torn edges show the white core of the paper.',
    motion: 'Layers slide in on parallax like a pop-up book, the rocket rises on its wire while paper smoke puffs and the flame tongues flutter.',
    fonts: ['400 112px "Archivo Black"', '400 50px "Archivo Black"', '400 30px "Archivo Black"'],
    frameT: 4.8,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'One long paper diorama the camera pans along on parallax; arrows are cut-paper strips that grow, labels are paper tags dropped onto what they name, numbers are swapped cut-out digit tiles, and emphasis is a paper ring or sunburst popping up behind.',
    explainer(ctx, W, H_, t) { EXPLAIN(ctx, W, H_, t); },
    // Sound: a cardstock shadow-box. Every dropped piece lands as a light card tap (body + paper snap) at the moment
    // its back-eased drop first reaches rest (st + 0.37*du); camera pans are big cardstock layers sliding past each
    // other; arrows are paper strips pushed out with a dry slide; digit tiles flick; the sunburst is a pop-up page.
    // Times mirror EXPLAIN()/dropIn above (title 0.15+i*0.06, cam pans 1.8-2.8 / 5.6-6.2 / 10.1-10.8, bars 10.85+i*0.22).
    explainerSound(k) {
      const LAND = 1 - 1.70158 / 2.70158; // H.ease.back first reaches 1 here: the piece touches down
      const land = (st, du) => st + LAND * du;
      const seg = (t, a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
      const cam = (t) => 1280 * seg(t, 1.8, 2.8) + 380 * seg(t, 5.6, 6.2) + 1280 * seg(t, 10.1, 10.8);
      const pan = (wx, t) => H.clamp(((wx - cam(t)) / 1280) * 2 - 1, -1, 1) * 0.6;
      // card tap: a cut piece of cardstock landing on the sheet behind it
      const card = (t, g = 1, p = 0, f = 1, minor = true) => {
        k.noise(t, { dur: 0.045, filter: 'bandpass', f: 1100 * f, q: 0.9, gain: 0.26 * g, a: 0.001, pan: p, minor });
        k.noise(t, { dur: 0.09, color: 'brown', filter: 'lowpass', f: 650, gain: 0.3 * g, a: 0.002, pan: p, minor });
        k.tone(t, { f: [[0, 160 * f], [0.07, 85]], dur: 0.09, gain: 0.16 * g, pan: p, minor });
      };
      // a big cardstock layer sliding against the one behind it (camera pans): smooth, low, no crinkle
      const layer = (t, d, g = 1) => {
        k.noise(t, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 260], [d * 0.5, 620], [d, 300]], q: 0.6, gain: 0.16 * g, a: d * 0.45, pan: 0.15 });
        k.noise(t + 0.05, { dur: d, color: 'brown', filter: 'lowpass', f: 380, gain: 0.14 * g, a: d * 0.5, pan: -0.15 });
      };
      // paper strip pushed out (arrows): a dry, soft slide with a little tooth, then the head taps down
      const strip = (t0, t1, g = 1, p0 = 0, p1 = 0) => {
        const d = t1 - t0;
        k.noise(t0, { dur: d, filter: 'bandpass', f: [[0, 900], [d, 1500]], q: 0.8, gain: 0.09 * g, a: d * 0.3, hold: d * 0.4, pan: (p0 + p1) / 2, minor: true });
        card(t1, 0.55 * g, p1, 1.2);
      };
      // digit tile flick (counters)
      const flick = (t, g = 1, p = 0) => {
        k.noise(t, { dur: 0.022, filter: 'bandpass', f: 1800, q: 1.4, gain: 0.22 * g, a: 0.001, pan: p, minor: true });
        k.tone(t, { f: 220, dur: 0.03, gain: 0.06 * g, pan: p, minor: true });
      };

      k.bed('room', 0, 15, { gain: 0.45 });

      // ---- BEAT 1: 15 cut letters drop onto the backboard
      for (let i = 0; i < 15; i++) {
        const line = i < 7 ? 0 : 1, j = line ? i - 7 : i, n = line ? 8 : 7;
        card(land(0.15 + i * 0.06, 0.38), i === 14 ? 0.85 : 0.42 + (i % 3) * 0.07, ((j + 0.5) / n - 0.5) * 0.8, line ? 0.9 : 1.05);
      }

      // ---- pan 1: the diorama slides to the conveyor; header tag pinned
      layer(1.8, 1.0, 1);
      card(land(2.0, 0.4), 0.7, -0.6, 1.2);
      card(land(2.55, 0.4), 0.8, pan(1600, 2.7)); // counter row drops
      card(land(2.6, 0.45), 1.1, pan(2290, 2.77), 0.8, false); // dial panel + brain (the model) lands
      strip(2.7, 3.3, 1, pan(1380, 3), pan(2080, 3.3));
      card(land(3.3, 0.35), 0.6, pan(2180, 3.4), 1.2); // 'model' tag
      // cards riding the belt (soft drag) and the brain gulping each one (tin = s + (BX-60-1150)/650)
      k.noise(2.3, { dur: 3.95, color: 'brown', filter: 'lowpass', f: 520, gain: 0.05, a: 0.4, hold: 3.2, pan: 0, minor: true });
      for (let c = 0; c < 9; c++) {
        const tin = 2.15 + c * 0.3 + (2290 - 60 - 1150) / 650;
        k.noise(tin, { dur: 0.08, color: 'brown', filter: 'lowpass', f: 420, gain: 0.32, a: 0.01, pan: pan(2230, tin), minor: true });
        k.tone(tin, { f: [[0, 120], [0.08, 70]], dur: 0.1, gain: 0.1, pan: pan(2230, tin), minor: true });
      }
      // counter 0 -> 1,000,000 over 2.8..5.1: tile flicks speeding up with the count, a firm tile at the end
      for (let t = 2.86; t < 5.06;) { const s = H.clamp((t - 2.8) / 2.3); flick(t, 0.75 + 0.3 * s, pan(1600, t)); t += 0.125 - 0.04 * s; }
      card(5.1, 1.1, pan(1700, 5.1), 1.3, false);

      // ---- pan 2 (short) and BEAT 3: guess -> check -> adjust
      layer(5.6, 0.6, 0.6);
      card(land(6.3, 0.4), 1.0, pan(1880, 6.45), 0.9, false); // new cat photo drops in
      strip(6.7, 7.0, 1, pan(1975, 6.8), pan(2120, 7));
      strip(7.05, 7.35, 1, pan(2445, 7.1), pan(2570, 7.35));
      card(land(7.2, 0.3), 0.6, pan(2505, 7.3), 1.2); // 'Guess' tag
      card(land(7.4, 0.35), 0.9, pan(2690, 7.5)); // 'dog?' bubble
      // the wrong guess: red paper X slapped on, ring pops behind, the bubble rattles
      const tX = land(7.9, 0.25);
      k.play('slap', tX, { gain: 0.6, pan: pan(2790, tX) });
      card(tX, 1.3, pan(2790, tX), 0.8, false);
      k.tone(tX + 0.01, { f: 'D3', type: 'triangle', dur: 0.16, gain: 0.2, filter: 'lowpass', f2: 700 }); // low wooden "nope"
      k.tone(tX + 0.17, { f: 'A2', type: 'triangle', dur: 0.3, gain: 0.22, filter: 'lowpass', f2: 600 });
      k.play('paper', 7.93, { dur: 0.33, gain: 0.35, pan: pan(2690, 8), minor: true }); // bubble card shaking
      card(land(8.05, 0.3), 0.6, pan(2640, 8.16), 1.2); // 'Check' tag
      strip(8.3, 8.8, 1.1, pan(2660, 8.3), pan(2420, 8.8)); // red error strip back to the dials
      card(land(8.7, 0.3), 0.6, pan(2560, 8.8), 1.2); // 'Adjust' tag
      // dial pointers pivot on their brads (seg 8.9..9.5)
      for (let i = 1; i <= 6; i++) {
        let t = 8.9; while (seg(t, 8.9, 9.5) < i / 6 - 1e-6 && t < 9.5) t += 0.005;
        k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1300 + i * 40, q: 2, gain: 0.22, a: 0.001, pan: pan(2420, t), minor: true });
        k.tone(t, { f: 300, dur: 0.035, gain: 0.05, pan: pan(2420, t), minor: true });
      }
      // bubble flips over (9.55..9.85): two soft flaps of stiff card, then the green tick lands
      k.noise(9.56, { dur: 0.13, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.13, 1100]], q: 0.7, gain: 0.25, a: 0.05, pan: pan(2690, 9.6) });
      k.noise(9.7, { dur: 0.14, color: 'pink', filter: 'bandpass', f: [[0, 1000], [0.14, 450]], q: 0.7, gain: 0.22, a: 0.04, pan: pan(2690, 9.7) });
      const tV = land(9.9, 0.3);
      card(tV, 1.1, pan(2795, tV), 1, false);
      k.play('success', tV, { f: 'G5', gain: 0.6, pan: pan(2795, tV) });

      // ---- pan 3 and BEAT 4: bars pop up from behind the ground
      layer(10.1, 0.7, 1);
      card(land(10.6, 0.35), 0.75, pan(3480, 10.73)); // 'Accuracy' header
      card(land(11.1, 0.3), 0.55, pan(3580, 11.2), 1.2); // 'training rounds'
      const accs = [61, 72, 80, 86, 90, 93, 95, 97];
      accs.forEach((a, i) => {
        const st = 10.85 + i * 0.22, p = pan(3280 + i * 74, st);
        k.noise(st, { dur: 0.1, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.1, 900]], q: 0.7, gain: 0.14, a: 0.05, pan: p, minor: true }); // slides up past the ground layer
        card(land(st, 0.32), 0.6 + i * 0.04, p, 0.9 + i * 0.05);
      });
      { // % digits swap: tick on each change, at most ~12/s
        let last = -1, lastT = -1;
        for (let t = 10.86; t < 12.72; t += 1 / 120) {
          const i = Math.min(7, Math.floor((t - 10.85) / 0.22)), st = 10.85 + i * 0.22;
          const v = Math.round(H.lerp(i ? accs[i - 1] : 55, accs[i], H.clamp((t - st) / 0.32)));
          if (v !== last && t - lastT >= 1 / 12) { flick(t, 0.7, pan(3995, t)); last = v; lastT = t; }
        }
      }
      // 97%: the sunburst springs up behind the number like a pop-up page (biggest hit)
      k.play('impact', 12.6, { gain: 1.3, pan: 0.5 });
      k.noise(12.6, { dur: 0.12, color: 'pink', filter: 'bandpass', f: [[0, 600], [0.12, 1600]], q: 0.6, gain: 0.3, a: 0.02, pan: 0.5 });
      k.play('ding', 12.6, { f: 'E5', gain: 0.65, pan: 0.4 });

      // ---- BEAT 5: takeaway banner drops and resolves
      card(land(13.0, 0.45), 1.0, 0, 0.8, false);
      ['C4', 'G4', 'E5'].forEach((f, i) => k.play('ding', land(13.0, 0.45) + 0.16 + i * 0.09, { f, gain: 0.48 - i * 0.04, pan: (i - 1) * 0.25 }));
    },
    draw(ctx, W, H_, t) {
      const R = H.rng(1207);
      const tex = makeTex(77);
      const pat = ctx.createPattern(tex, 'repeat');

      // one paper sheet = shape + fibre texture + lit/dark cut edge + 2-part drop shadow
      // entrance animation: 'up' slides up like a pop-up layer, 'drop' falls on with a lifted shadow, 'pop' springs out
      const anim = (o) => {
        if (!o.at) return { p: 1, dx: 0, dy: 0, s: 1, lift: 0 };
        const [st, du, mode, dist] = o.at, u = H.clamp((t - st) / du);
        if (u <= 0) return null;
        if (mode === 'up') { const e = H.ease.out(u); return { p: u, dx: 0, dy: (1 - e) * (dist || 260), s: 1, lift: (1 - e) * 1.2 }; }
        if (mode === 'drop') { const e = H.ease.back(u); return { p: u, dx: (1 - e) * -10, dy: (1 - e) * -(dist || 60), s: 1 + (1 - H.ease.out(u)) * 0.06, lift: (1 - H.ease.out(u)) * 3 }; }
        const e = H.ease.back(u); return { p: u, dx: 0, dy: 0, s: Math.max(0.01, e), lift: (1 - H.ease.out(u)) * 2 };
      };
      const sheet = (paint, o = {}) => {
        const tx = R.range(0, 512), ty = R.range(0, 512), tr = R.range(-30, 30);
        const A = anim(o);
        if (!A) return;
        const pad = 6;
        let [x0, y0, x1, y1] = o.bb || [0, 0, W, H_];
        x0 = Math.floor(Math.max(-20, x0 - pad)); y0 = Math.floor(Math.max(-20, y0 - pad));
        x1 = Math.ceil(Math.min(W + 20, x1 + pad)); y1 = Math.ceil(Math.min(H_ + 20, y1 + pad));
        const w = x1 - x0, h = y1 - y0;
        const L = H.layer(w, h), c = L.getContext('2d');
        c.translate(-x0, -y0); paint(c); c.setTransform(1, 0, 0, 1, 0, 0);
        // fibre texture
        c.save(); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = o.tex ?? 1;
        pat.setTransform(new DOMMatrix().translateSelf(tx, ty).rotateSelf(tr));
        c.fillStyle = pat; c.fillRect(0, 0, w, h); c.restore();
        // edge: light catches top-left cut edge, bottom-right edge falls dark
        const edge = (col, dx, dy) => {
          const T = H.layer(w, h), tc = T.getContext('2d');
          tc.drawImage(L, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, w, h);
          tc.globalCompositeOperation = 'destination-out'; tc.drawImage(L, dx, dy);
          c.save(); c.globalCompositeOperation = 'source-atop'; c.drawImage(T, 0, 0); c.restore();
        };
        if (o.rim !== false) {
          edge(`rgba(255,247,232,${o.hi ?? 0.38})`, 1.3, 1.6);
          edge(`rgba(0,0,0,${o.lo ?? 0.28})`, -1.1, -1.3);
        }
        ctx.save();
        if (A.p < 1) {
          const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
          ctx.translate(cx + A.dx, cy + A.dy); ctx.scale(A.s, A.s); ctx.translate(-cx, -cy);
        }
        const d = (o.depth ?? 1) + (o.depth ? A.lift : 0);
        if (d > 0) {
          ctx.shadowColor = `rgba(14,10,30,${o.sa ?? 0.5})`; ctx.shadowBlur = 6 + d * 7;
          ctx.shadowOffsetX = 1.5 + d * 2.4; ctx.shadowOffsetY = 2 + d * 3.6;
          ctx.drawImage(L, x0, y0);
          ctx.shadowColor = 'rgba(10,6,20,0.38)'; ctx.shadowBlur = 2.5; ctx.shadowOffsetX = 0.8; ctx.shadowOffsetY = 1.4;
        }
        ctx.drawImage(L, x0, y0);
        ctx.restore();
      };

      // slow camera push once the diorama is assembled
      const push = 1 + 0.035 * H.ease.inOut(H.clamp((t - 2.2) / 2.8));
      ctx.translate(W * 0.52, H_ * 0.5); ctx.scale(push, push); ctx.translate(-W * 0.52, -H_ * 0.5);
      const sway = Math.sin(t * 1.7) * 0.03;
      const drift = t * 6;

      // ---------- 1 backboard (sky) ----------
      sheet((c) => { c.fillStyle = '#2b2d5a'; c.fillRect(-20, -20, W + 40, H_ + 40); }, { depth: 0, rim: false });

      // stars: punched little shapes
      {
        const r = H.rng(31);
        sheet((c) => {
          c.fillStyle = '#f6e7bf';
          for (let i = 0; i < 46; i++) {
            const x = r.range(20, W - 20), y = r.range(20, 420);
            if (Math.hypot(x - 840, y - 300) < 250) continue;
            const s = r.range(3, 7.5), pts = [], k = r.chance(0.6) ? 5 : 4, a0 = r() * TAU;
            for (let j = 0; j < k * 2; j++) { const rr = j % 2 ? s * 0.42 : s; const a = a0 + (j / (k * 2)) * TAU; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
            c.beginPath(); poly(c, pts); c.fill();
          }
        }, { depth: 0.25, bb: [0, 0, W, 440], hi: 0.3, at: [0.1, 0.4, 'drop', 20] });
      }

      // ---------- 2 sun rings ----------
      const sun = [[232, '#3c3f78'], [192, '#c75a5c'], [154, '#e9845b'], [116, '#f3ad62'], [78, '#f8d891']];
      sun.forEach(([rad, col], i) => {
        const r = H.rng(50 + i);
        const pts = circPts(r, 840, 300, rad, 14, 0.7);
        sheet((c) => { c.fillStyle = col; c.beginPath(); poly(c, pts); c.fill(); },
          { depth: 0.55, bb: [840 - rad, 300 - rad, 840 + rad, 300 + rad], at: [0.2 + i * 0.13, 0.5, 'pop'] });
      });

      // ---------- paper clouds in sky ----------
      const cloud = (seed, cx, cy, s, col, depth, st) => {
        const r = H.rng(seed), parts = [];
        const bumps = [[-1.0, 0, 0.42], [-0.45, -0.25, 0.6], [0.2, -0.35, 0.72], [0.82, -0.1, 0.5], [1.2, 0.05, 0.34]];
        bumps.forEach(([bx, by, br]) => parts.push(circPts(r, cx + bx * s, cy + by * s, br * s, 12, 0.5)));
        sheet((c) => {
          c.fillStyle = col; c.beginPath();
          parts.forEach((p) => poly(c, p));
          poly(c, cutLines(r, [[cx - 1.15 * s, cy], [cx + 1.38 * s, cy], [cx + 1.38 * s, cy + 0.3 * s], [cx - 1.15 * s, cy + 0.3 * s]], 26, 0.5));
          c.fill();
        }, { depth, bb: [cx - 1.6 * s, cy - 1.2 * s, cx + 1.7 * s, cy + 0.5 * s], at: [st, 0.5, 'drop', 50] });
      };
      cloud(61, 1130 - drift * 0.6, 120, 62, '#e9e1d4', 0.8, 1.0);
      cloud(62, 640 + drift, 412, 46, '#dcd3c8', 0.8, 1.15);

      // ---------- 3 far mountains + snowcaps ----------
      const peaks = [[-30, 520], [70, 420], [150, 470], [260, 360], [380, 455], [470, 410], [560, 480], [690, 430], [790, 490], [930, 380], [1040, 460], [1150, 395], [1310, 470]];
      {
        const r = H.rng(71);
        const top = cutLines(r, peaks, 20, 0.8);
        sheet((c) => { c.fillStyle = '#4c5590'; c.beginPath(); poly(c, [...top, [1310, 740], [-30, 740]]); c.fill(); },
          { depth: 1.0, bb: [-30, 350, W + 30, H_], at: [0.35, 0.6, 'up', 380] });
        // snowcaps (glued-on pieces with zigzag bottom)
        const caps = [[260, 360], [930, 380], [1150, 395]];
        sheet((c) => {
          c.fillStyle = '#f1ece2';
          caps.forEach(([px, py], ci) => {
            const i = peaks.findIndex((p) => p[0] === px);
            const [lx, ly] = peaks[i - 1], [rx, ry] = peaks[i + 1];
            const k = 0.3;
            const L1 = [px + (lx - px) * k, py + (ly - py) * k], R1 = [px + (rx - px) * k, py + (ry - py) * k];
            const pts = [[px, py - 1], R1];
            const n = 4;
            for (let j = 1; j < n; j++) {
              const u = j / n, x = R1[0] + (L1[0] - R1[0]) * u, y = R1[1] + (L1[1] - R1[1]) * u + (j % 2 ? 9 : -2) + r.range(-2, 2);
              pts.push([x, y]);
            }
            pts.push(L1);
            c.beginPath(); poly(c, pts); c.fill();
          });
        }, { depth: 0.35, bb: [200, 340, 1250, 440], hi: 0.7, at: [0.9, 0.4, 'drop', 40] });
      }

      // ---------- 4 mid hills ----------
      {
        const r = H.rng(81);
        const f = (x) => 492 + 34 * Math.sin(x * 0.0072 + 1.3) + 18 * Math.sin(x * 0.019 + 0.4) + 10 * Math.sin(x * 0.041);
        const top = ridge(r, -30, W + 30, f, 12, 26, 0.6);
        sheet((c) => { c.fillStyle = '#373f73'; c.beginPath(); poly(c, [...top, [W + 30, 740], [-30, 740]]); c.fill(); },
          { depth: 1.1, bb: [-30, 430, W + 30, H_], at: [0.5, 0.6, 'up', 320] });
      }

      // ---------- 5 server city: lit sheet behind, skyline with cut-out windows ----------
      {
        const r = H.rng(91), blds = [];
        let x = -10;
        while (x < W + 10) {
          const w = r.range(42, 86), h = r.range(55, 150) * (Math.abs(x - 840) < 160 ? 0.65 : 1);
          blds.push({ x, w, h, ant: r.chance(0.3), seed: r.int(1, 1e6) });
          x += w + r.range(-6, 10);
        }
        const base = 575;
        sheet((c) => {
          c.fillStyle = '#f6c862';
          blds.forEach((b) => c.fillRect(b.x + 4, base - b.h + 6, b.w - 8, b.h));
        }, { depth: 0.2, bb: [-20, 380, W + 20, 600], rim: false, at: [0.65, 0.6, 'up', 260] });
        sheet((c) => {
          c.fillStyle = '#232a55';
          c.beginPath();
          blds.forEach((b) => {
            const rr = H.rng(b.seed);
            const pts = cutLines(rr, [[b.x, base + 20], [b.x, base - b.h], [b.x + b.w, base - b.h], [b.x + b.w, base + 20]], 24, 0.5);
            poly(c, pts);
            if (b.ant) poly(c, [[b.x + b.w * 0.5 - 2, base - b.h + 1], [b.x + b.w * 0.5 - 1, base - b.h - 26], [b.x + b.w * 0.5 + 1, base - b.h - 26], [b.x + b.w * 0.5 + 2, base - b.h + 1]]);
          });
          c.fill();
          // cut-out windows / rack slots
          c.globalCompositeOperation = 'destination-out';
          blds.forEach((b) => {
            const rr = H.rng(b.seed + 3), slots = rr.chance(0.45);
            const cols = Math.max(2, Math.floor((b.w - 12) / 13));
            const gx = (b.w - cols * 13 + 5) / 2;
            for (let yy = base - b.h + 12; yy < base - 14; yy += slots ? 11 : 16) {
              if (slots) { if (rr.chance(0.7)) c.fillRect(b.x + 8, yy, b.w - 16 - rr.range(0, 14), 3.5); continue; }
              for (let i = 0; i < cols; i++) if (rr.chance(0.55)) c.fillRect(b.x + gx + i * 13 + rr.gauss() * 0.4, yy + rr.gauss() * 0.4, 7, 9);
            }
          });
        }, { depth: 0.9, bb: [-20, 380, W + 20, 600], at: [0.65, 0.6, 'up', 260] });
      }

      // ---------- 6 rocket ----------
      const launch = H.clamp((t - 1.5) / 1.7);
      const rx = 840 + Math.sin(t * 1.3) * 6 * launch, ry = H.lerp(1000, 345, H.ease.out(launch)) - Math.max(0, t - 3.2) * 10; // body centre
      const rocketT = (c) => { c.translate(rx, ry); c.rotate(sway + 0.06); c.scale(1.28, 1.28); };
      const body = (c) => {
        c.moveTo(0, -95);
        c.bezierCurveTo(28, -78, 37, -35, 37, 5); c.bezierCurveTo(37, 40, 34, 70, 30, 88);
        c.lineTo(-30, 88);
        c.bezierCurveTo(-34, 70, -37, 40, -37, 5); c.bezierCurveTo(-37, -35, -28, -78, 0, -95);
        c.closePath();
      };
      const rbb = [rx - 190, ry - 150, rx + 190, ry + 330];
      // smoke column behind flame
      {
        const r = H.rng(101), parts = [];
        const topY = ry + 190, botY = 590;
        for (let i = 0; i < 16; i++) {
          const u = i / 15, y = H.lerp(topY, botY, u), spread = 14 + u * u * 120;
          parts.push(circPts(r, rx + 12 + r.range(-spread, spread) * 0.6, y + r.range(-6, 6), 18 + u * 34 + r.range(-4, 4), 12, 0.5));
        }
        sheet((c) => { c.fillStyle = '#d9d2c9'; c.beginPath(); parts.forEach((p) => poly(c, p)); c.fill(); },
          { depth: 0.9, bb: [rx - 200, topY - 40, rx + 220, 650] });
      }
      // flames: three stacked cut pieces, tongues flicker with t
      const flame = (w, L, col, seed, depth) => {
        const r = H.rng(seed), fl = (k) => 1 + 0.12 * Math.sin(t * 19 + k * 2.1 + seed);
        const y0 = 84;
        const p = [[w / 2, y0], [w * 0.47, y0 + L * 0.3], [w * 0.3, y0 + L * 0.72 * fl(1)], [w * 0.14, y0 + L * 0.5], [0, y0 + L * fl(2)],
          [-w * 0.15, y0 + L * 0.55], [-w * 0.31, y0 + L * 0.78 * fl(3)], [-w * 0.47, y0 + L * 0.3], [-w / 2, y0]];
        sheet((c) => {
          rocketT(c); c.fillStyle = col; c.beginPath();
          c.moveTo(p[0][0], p[0][1]);
          for (let i = 1; i < p.length; i++) {
            const [ax, ay] = p[i - 1], [bx, by] = p[i];
            const mx = (ax + bx) / 2 + r.gauss() * 1.2, my = (ay + by) / 2 + r.gauss() * 1.2;
            c.quadraticCurveTo(ax + (mx - ax) * 0.4 + (by - ay) * 0.08, ay + (my - ay) * 0.4, mx, my);
            c.lineTo(bx, by);
          }
          c.closePath(); c.fill();
        }, { depth, bb: rbb });
      };
      flame(64, 150, '#e4513a', 111, 0.6);
      flame(46, 112, '#f39a3c', 112, 0.45);
      flame(26, 72, '#f9db78', 113, 0.35);
      // back fins
      sheet((c) => {
        rocketT(c); c.fillStyle = '#b5372f'; c.beginPath();
        c.moveTo(-28, 22); c.bezierCurveTo(-58, 40, -68, 76, -64, 112); c.lineTo(-24, 84); c.closePath();
        c.moveTo(28, 22); c.bezierCurveTo(58, 40, 68, 76, 64, 112); c.lineTo(24, 84); c.closePath();
        c.fill();
      }, { depth: 0.5, bb: rbb });
      // body
      sheet((c) => { rocketT(c); c.fillStyle = '#f1e8d6'; c.beginPath(); body(c); c.fill(); }, { depth: 0.7, bb: rbb });
      // nose cone + band + centre fin (glued on top)
      sheet((c) => {
        rocketT(c);
        c.save(); c.beginPath(); body(c); c.clip();
        c.fillStyle = '#d9473b';
        c.beginPath(); c.moveTo(-50, -110); c.lineTo(50, -110); c.lineTo(50, -50); c.quadraticCurveTo(0, -38, -50, -50); c.closePath(); c.fill();
        c.fillStyle = '#2f7f86';
        c.beginPath(); c.moveTo(-50, 44); c.quadraticCurveTo(0, 54, 50, 44); c.lineTo(50, 60); c.quadraticCurveTo(0, 70, -50, 60); c.closePath(); c.fill();
        c.restore();
        c.fillStyle = '#c63f35';
        c.beginPath(); c.moveTo(-6, 58); c.lineTo(6, 58); c.lineTo(8, 116); c.lineTo(-8, 116); c.closePath(); c.fill();
        // window frame
        c.fillStyle = '#9c968c'; c.beginPath(); c.arc(0, -8, 23, 0, TAU); c.fill();
      }, { depth: 0.35, bb: rbb });
      sheet((c) => {
        rocketT(c);
        c.fillStyle = '#26566a'; c.beginPath(); c.arc(0, -8, 15.5, 0, TAU); c.fill();
      }, { depth: 0.3, bb: rbb, hi: 0.4 });
      sheet((c) => {
        rocketT(c);
        c.fillStyle = '#e9f1ea'; c.beginPath(); c.arc(-4, -12, 7.5, Math.PI * 0.95, Math.PI * 1.75); c.arc(-1, -9, 6.5, Math.PI * 1.6, Math.PI * 1.05, true); c.closePath(); c.fill();
      }, { depth: 0.2, bb: rbb, hi: 0.2 });

      // ---------- 7 launch smoke puffs at ground ----------
      {
        const r = H.rng(121), parts = [];
        for (let i = 0; i < 13; i++) {
          const u = (i / 12) * 2 - 1, x = rx + 10 + u * 230 + r.range(-12, 12), y = 588 - (1 - Math.abs(u)) * 22 + r.range(-6, 6);
          parts.push(circPts(r, x, y, 26 + (1 - Math.abs(u)) * 22 + r.range(-5, 5), 12, 0.5));
        }
        sheet((c) => { c.fillStyle = '#f4efe6'; c.beginPath(); parts.forEach((p) => poly(c, p)); c.fill(); },
          { depth: 1.0, bb: [rx - 300, 500, rx + 320, 650], at: [1.65, 0.5, 'pop'] });
      }

      // ---------- 8 torn hills: white fibrous core ----------
      {
        const nz = H.makeNoise(131), r = H.rng(132);
        const f = (x) => 606 + 22 * Math.sin(x * 0.0058 + 2.2) + 11 * Math.sin(x * 0.017 + 1);
        const torn = [], core = [];
        for (let x = -30; x <= W + 30; x += 2.5) {
          const n = nz.fbm2(x * 0.03, 0.5, 4) * 5 + r.gauss() * 0.6;
          const y = f(x) + n;
          torn.push([x, y + 3.5 + Math.abs(nz.n2(x * 0.045, 3.1)) * 8 + Math.abs(nz.n2(x * 0.3, 7.7)) * 2]);
          core.push([x, y]);
        }
        sheet((c) => {
          c.fillStyle = '#f5f0e5'; c.beginPath(); poly(c, [...core, [W + 30, 740], [-30, 740]]); c.fill();
          // protruding fibres along the torn core
          c.strokeStyle = 'rgba(248,244,236,0.95)'; c.lineCap = 'round';
          for (let i = 0; i < core.length; i += 1) {
            if (!r.chance(0.55)) continue;
            const [x, y] = core[i], a = -Math.PI / 2 + r.range(-0.9, 0.9), l = r.range(1.5, 5.5);
            c.lineWidth = r.range(0.4, 0.9);
            c.beginPath(); c.moveTo(x, y + 1); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
          }
          c.fillStyle = '#2f6b66'; c.beginPath(); poly(c, [...torn, [W + 30, 740], [-30, 740]]); c.fill();
        }, { depth: 1.3, bb: [-30, 560, W + 30, H_], at: [0.8, 0.6, 'up', 200] });
      }

      // ---------- 8b paper pines on the hills ----------
      {
        const r = H.rng(161);
        const pine = (x, base, h, col, seed, depth, st) => {
          const rr = H.rng(seed), w = h * 0.52, tiers = 3, pieces = [];
          for (let k = 0; k < tiers; k++) {
            const ty = base - h * 0.18 - k * h * 0.26, tw = w * (1 - k * 0.24), th = h * 0.42;
            const pts = [[x, ty - th]];
            const n = 4;
            for (let j = 0; j <= n; j++) { const u = j / n; pts.push([x + tw / 2 - u * tw, ty + (j % 2 ? -5 : 0) + rr.gauss() * 0.6]); }
            pieces.push(cutLines(rr, [...pts, [x, ty - th]], 18, 0.5));
          }
          sheet((c) => {
            c.fillStyle = '#4a3326'; c.fillRect(x - 4, base - h * 0.25, 8, h * 0.3);
            c.fillStyle = col; c.beginPath(); pieces.forEach((p) => poly(c, p)); c.fill();
          }, { depth, bb: [x - w, base - h * 1.1, x + w, base + 10], at: [st, 0.45, 'pop'] });
        };
        pine(70, 640, 150, '#24594f', 162, 1.1, 1.15);
        pine(150, 628, 108, '#2e6c5b', 163, 0.9, 1.25);
        pine(1215, 640, 136, '#24594f', 164, 1.1, 1.2);
        pine(1140, 636, 92, '#2e6c5b', 165, 0.9, 1.3);
      }

      // ---------- 9 foreground with grass snips ----------
      {
        const r = H.rng(141);
        const f = (x) => 664 + 20 * Math.sin(x * 0.0045 + 0.4) + 8 * Math.sin(x * 0.013);
        const pts = [];
        let x = -30;
        while (x < W + 30) {
          if (r.chance(0.22)) {
            const n = r.int(2, 4);
            for (let k = 0; k < n; k++) {
              const bx = x + k * 7, by = f(bx);
              pts.push([bx, by], [bx + 2 + r.range(-3, 4), by - r.range(16, 36)], [bx + 5, by]);
            }
            x += n * 7 + 4;
          } else { pts.push([x, f(x) + r.gauss() * 0.6]); x += r.range(14, 30); }
        }
        sheet((c) => { c.fillStyle = '#163a3a'; c.beginPath(); poly(c, [...pts, [W + 30, 740], [-30, 740]]); c.fill(); },
          { depth: 1.6, bb: [-30, 610, W + 30, H_], at: [0.95, 0.6, 'up', 160] });
      }

      // ---------- 9b nearest layer: scalloped paper bushes in the corners ----------
      {
        const bush = (seed, cx, cy, s, col, depth, st) => {
          const r = H.rng(seed), parts = [];
          for (let i = 0; i < 7; i++) {
            const a = Math.PI + (i / 6) * Math.PI;
            parts.push(circPts(r, cx + Math.cos(a) * s * 1.1, cy + Math.sin(a) * s * 0.75, s * r.range(0.42, 0.58), 12, 0.5));
          }
          parts.push(circPts(r, cx, cy, s * 0.9, 14, 0.5));
          sheet((c) => { c.fillStyle = col; c.beginPath(); parts.forEach((p) => poly(c, p)); c.fill(); },
            { depth, bb: [cx - s * 1.8, cy - s * 1.4, cx + s * 1.8, cy + s * 1.2], at: [st, 0.5, 'up', 180] });
        };
        bush(171, 1210, 740, 120, '#11302f', 2.2, 1.1);
        bush(172, 1040, 760, 70, '#1d4a45', 1.8, 1.2);
        bush(173, 30, 735, 105, '#11302f', 2.2, 1.05);
      }

      // ---------- 10 title: cut letters on a cut-around backing sheet ----------
      {
        const r = H.rng(151);
        const lines = [{ s: 'READY FOR', f: '400 50px "Archivo Black"', y: 132, x: 86 }, { s: 'LAUNCH', f: '400 112px "Archivo Black"', y: 246, x: 78 }];
        const glyphs = [];
        ctx.save();
        lines.forEach((ln) => {
          ctx.font = ln.f; let x = ln.x;
          const sp = ln.s === 'LAUNCH' ? 4 : 6;
          for (const ch of ln.s) {
            const w = ctx.measureText(ch).width;
            if (ch !== ' ') glyphs.push({ ch, f: ln.f, x, y: ln.y + r.range(-3, 3), rot: r.range(-0.06, 0.06), w });
            x += w + sp;
          }
        });
        ctx.restore();
        const cols = ['#e8604a', '#f2b545', '#58b0a6', '#f2b545', '#e8604a', '#58b0a6', '#e8604a', '#f2b545'];
        const tilt = (c) => { c.translate(330, 190); c.rotate(-0.045); c.translate(-330, -190); };
        const drawG = (c, g, fn) => { c.save(); c.translate(g.x + g.w / 2, g.y); c.rotate(g.rot); c.font = g.f; fn(c, -g.w / 2); c.restore(); };
        sheet((c) => {
          tilt(c); c.fillStyle = '#f3ecdc'; c.strokeStyle = '#f3ecdc'; c.lineJoin = 'round'; c.lineWidth = 26;
          glyphs.forEach((g) => drawG(c, g, (cc, x) => { cc.strokeText(g.ch, x, 0); cc.fillText(g.ch, x, 0); }));
          // fill gaps so backing reads as one cut piece
          c.lineWidth = 34; c.beginPath(); c.moveTo(100, 115); c.lineTo(395, 115); c.moveTo(95, 210); c.lineTo(560, 210); c.stroke();
        }, { depth: 1.5, bb: [40, 50, 640, 290], at: [1.7, 0.45, 'drop', 70] });
        glyphs.forEach((g, i) => {
          const big = g.f.includes('112');
          sheet((c) => { tilt(c); drawG(c, g, (cc, x) => { cc.fillStyle = cols[i % cols.length]; cc.fillText(g.ch, x, 0); }); },
            { depth: 0.6, bb: [g.x - 24, g.y - (big ? 110 : 55), g.x + g.w + 24, g.y + 30], at: [1.95 + i * 0.06, 0.38, 'drop', big ? 60 : 40] });
        });
      }

      // ---------- lighting / photo finish ----------
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      const lg = ctx.createRadialGradient(260, 60, 40, 420, 200, 1100);
      lg.addColorStop(0, 'rgba(255,236,200,0.9)'); lg.addColorStop(0.5, 'rgba(255,230,200,0.25)'); lg.addColorStop(1, 'rgba(0,0,20,0.6)');
      ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H_);
      ctx.restore();
      H.vignette(ctx, W, H_, 0.42, '10,6,24');
      H.grain(ctx, W, H_, 0.035, 9 + Math.floor(t * 12));
    },
  });
}
