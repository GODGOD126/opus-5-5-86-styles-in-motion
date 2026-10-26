// Napkin Sketch — Sharpie startup idea on a crumpled cafe napkin.
{
  const seg = (pts, step = 2.5) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
      for (let j = 0; j < n; j++) out.push([x0 + (x1 - x0) * j / n, y0 + (y1 - y0) * j / n]);
    }
    out.push(pts[pts.length - 1]);
    return out;
  };
  const normals = (P) => P.map((p, i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    return [-dy / d, dx / d];
  });
  const wob = (pts, nz, seed, amp = 1.6, freq = 0.012) => {
    const N = normals(pts); let L = 0;
    return pts.map((p, i) => {
      if (i) L += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      const o = nz.n2(L * freq + seed * 1.37, seed * 0.71) * amp + nz.n2(L * freq * 6 + seed, seed + 3.3) * amp * 0.3;
      return [p[0] + N[i][0] * o, p[1] + N[i][1] * o];
    });
  };
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2) => {
    const n = Math.max(10, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 2.5)), out = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return out;
  };
  const quad = (p0, p1, p2, n = 40) => {
    const out = [];
    for (let i = 0; i <= n; i++) { const t = i / n, m = 1 - t; out.push([m * m * p0[0] + 2 * m * t * p1[0] + t * t * p2[0], m * m * p0[1] + 2 * m * t * p1[1] + t * t * p2[1]]); }
    return out;
  };

  // >>>XE-ENGINE
  // ===================== explainer story engine (shared script: "How does AI learn?") =====================
  // Builds the diagram as timed world-space strokes/texts; each style renders them with its own medium.
  const XC = {}; // cache for static textures (output still depends only on t)
  const XE = (() => {
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const win = (t, a, b) => clamp((t - a) / (b - a));
    const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const camAt = (keys, t) => {
      if (t <= keys[0][0]) return keys[0].slice(1);
      for (let i = 0; i < keys.length - 1; i++) {
        const a = keys[i], b = keys[i + 1];
        if (t <= b[0]) {
          const u = eio((t - a[0]) / Math.max(1e-6, b[0] - a[0]));
          return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * u)];
        }
      }
      return keys[keys.length - 1].slice(1);
    };
    const circ = (x, y, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 0) => {
      n = n || Math.max(12, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 6)); const o = [];
      for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry]); }
      return o;
    };
    const quad = (p0, p1, p2, n = 30) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, m = 1 - t; o.push([m * m * p0[0] + 2 * m * t * p1[0] + t * t * p2[0], m * m * p0[1] + 2 * m * t * p1[1] + t * t * p2[1]]); } return o; };
    const cubic = (p0, p1, p2, p3, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, m = 1 - t; o.push([m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0], m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]); } return o; };
    const rrect = (x, y, w, h, r) => {
      const o = [[x + r, y], [x + w - r, y]]; o.push(...circ(x + w - r, y + r, r, r, -Math.PI / 2, 0, 5).slice(1));
      o.push([x + w, y + h - r]); o.push(...circ(x + w - r, y + h - r, r, r, 0, Math.PI / 2, 5).slice(1));
      o.push([x + r, y + h]); o.push(...circ(x + r, y + h - r, r, r, Math.PI / 2, Math.PI, 5).slice(1));
      o.push([x, y + r]); o.push(...circ(x + r, y + r, r, r, Math.PI, Math.PI * 1.5, 5).slice(1));
      o.push([x + r + 6, y - 1]); return o;
    };
    const head = (P, len = 20, spread = 0.5) => {
      const a = P[P.length - 1], b = P[Math.max(0, P.length - 4)], an = Math.atan2(a[1] - b[1], a[0] - b[0]);
      return [[a[0] - Math.cos(an - spread) * len, a[1] - Math.sin(an - spread) * len], a, [a[0] - Math.cos(an + spread) * len, a[1] - Math.sin(an + spread) * len]];
    };
    const cat = (x, y, s) => [
      circ(x, y + 0.06 * s, 0.3 * s, 0.27 * s, -1.2, 5.1),
      [[x - 0.27 * s, y - 0.02 * s], [x - 0.24 * s, y - 0.34 * s], [x - 0.07 * s, y - 0.2 * s]],
      [[x + 0.07 * s, y - 0.2 * s], [x + 0.24 * s, y - 0.34 * s], [x + 0.27 * s, y - 0.02 * s]],
      [[x - 0.03 * s, y + 0.1 * s], [x, y + 0.13 * s], [x + 0.03 * s, y + 0.1 * s]],
      [[x - 0.12 * s, y + 0.12 * s], [x - 0.36 * s, y + 0.08 * s]], [[x - 0.12 * s, y + 0.16 * s], [x - 0.35 * s, y + 0.2 * s]],
      [[x + 0.12 * s, y + 0.12 * s], [x + 0.36 * s, y + 0.08 * s]], [[x + 0.12 * s, y + 0.16 * s], [x + 0.35 * s, y + 0.2 * s]],
    ];
    const dog = (x, y, s) => [
      circ(x, y + 0.04 * s, 0.26 * s, 0.28 * s, -1.4, 4.9),
      circ(x - 0.29 * s, y + 0.04 * s, 0.09 * s, 0.2 * s, 0, 6.4),
      circ(x + 0.29 * s, y + 0.04 * s, 0.09 * s, 0.2 * s, 0, 6.4),
      circ(x, y + 0.15 * s, 0.07 * s, 0.045 * s, 0, 6.4),
      [[x - 0.08 * s, y + 0.23 * s], [x, y + 0.26 * s], [x + 0.08 * s, y + 0.23 * s]],
    ];
    const eyes = (x, y, s, dy = 0.02) => [[x - 0.1 * s, y + dy * s], [x + 0.1 * s, y + dy * s]];
    const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // L: layout options. mode: 'same' (progress drawn where the loop was) | 'below' | 'right'
    // model(cx, cy, adj, add): style supplies its model drawing; adj 0..1 = how far the knobs have been adjusted.
    const story = (t, L) => {
      const items = [];
      const line = (pts, role, w, a, b, g) => items.push({ k: 'line', pts, role, w, a, b, g });
      const text = (s, x, y, size, font, role, a, b, opt = {}) => items.push({ k: 'text', s, x, y, size, font, role, a, b, rot: opt.rot || 0, align: opt.align || 'left', g: opt.g });
      const dot = (x, y, r, role, a, g) => items.push({ k: 'dot', x, y, r, role, a, b: a + 0.05, g });
      const S = L.s || 1;
      // ---- 1 HOOK ----
      const TX = L.titleX ?? 640, TY = L.titleY ?? 350;
      text('How does AI learn?', TX, TY, 84 * S, 'title', 'ink', 0.15, 1.3, { align: 'center', rot: -0.015, g: 'A' });
      line([[TX - 330 * S, TY + 32 * S], [TX + 330 * S, TY + 24 * S]], 'acc1', 7, 1.3, 1.55, 'A');
      // ---- 2 DATA ----
      const MX = L.modelX ?? 2250, MY = L.modelY ?? 640;
      const mAdj = eio(win(t, 8.95, 9.5));
      L.model(MX, MY, mAdj, (it) => { it.g = it.g || 'M'; items.push(it); }, { line, text, dot }, t);
      text(L.modelName || 'model', MX, MY + 228, 38, 'label', 'ink', 3.15, 3.4, { align: 'center', g: 'M' });
      const CS = 118, cx0 = MX - 870, cy0 = MY - 175;
      for (let i = 0; i < 6; i++) {
        const col = i % 3, row = (i / 3) | 0, x = cx0 + col * 150 + (row ? 40 : 0), y = cy0 + row * 170, isCat = [1, 0, 1, 1, 0, 0][i];
        const a = 3.0 + i * 0.17;
        line(rrect(x - CS / 2, y - CS / 2, CS, CS, 12), 'ink', 4, a, a + 0.12, 'B');
        (isCat ? cat : dog)(x, y - 6, CS * 0.82).forEach((p) => line(p, 'ink', 3.2, a + 0.1, a + 0.22, 'B'));
        eyes(x, y - 6, CS * 0.82).forEach(([ex, ey]) => dot(ex, ey, 3.2, 'ink', a + 0.22, 'B'));
        // label tag hanging off the card
        const tx = x + 18, ty = y + CS / 2 - 4;
        line([[tx, ty], [tx + 70, ty], [tx + 84, ty + 19], [tx + 70, ty + 38], [tx, ty + 38], [tx, ty]], isCat ? 'acc1' : 'acc3', 3, a + 0.2, a + 0.3, 'B');
        text(isCat ? 'cat' : 'dog', tx + 8, ty + 30, 31, 'label', isCat ? 'acc1' : 'acc3', a + 0.28, a + 0.36, { g: 'B' });
      }
      // flow arrow into the model
      const fa = cubic([cx0 + 370, MY - 10], [cx0 + 470, MY - 60], [MX - 260, MY - 40], [MX - 165, MY - 10]);
      line(fa, 'ink', 5, 4.15, 4.45, 'B'); line(head(fa, 24), 'ink', 5, 4.45, 4.55, 'B');
      // little example cards streaming along the arrow
      if (t > 4.5 && t < 6.2) {
        for (let k = 0; k < 9; k++) {
          const u = ((t - 4.5) * 0.9 + k / 9) % 1, ix = Math.min(fa.length - 1, Math.floor(u * fa.length));
          const [px, py] = fa[ix], sz = 26 * (1 - 0.5 * u);
          if (t - 4.5 < k / 9 / 0.9) continue;
          items.push({ k: 'line', pts: rrect(px - sz / 2, py - sz / 2 - 18, sz, sz, 4), role: k % 2 ? 'acc1' : 'acc3', w: 2.5, a: -1, b: 0, g: 'F', inst: true });
        }
      }
      // counter (numerals redrawn on twos)
      if (t > 4.5) {
        const u = win(Math.floor(t * 12) / 12, 4.55, 5.25), n = u >= 1 ? 1e6 : (Math.pow(10, u * 6) - 1) / (1e6 - 1) * 1e6;
        items.push({ k: 'text', s: fmt(n), x: cx0 + 150, y: cy0 + 425, size: 76, font: 'num', role: 'ink', a: -1, b: 0, align: 'center', g: 'B', inst: true, live: true });
        text('examples', cx0 + 150, cy0 + 472, 36, 'label', 'ink', 4.55, 4.8, { align: 'center', g: 'B' });
      }
      if (L.model2At) L.model(MX, MY, mAdj, (it) => { it.g = 'M2'; if (!it.inst) { it.a += L.model2At - 2.5; it.b += L.model2At - 2.5; } items.push(it); }, { line: (p, r, w, a, b) => line(p, r, w, a + L.model2At - 2.5, b + L.model2At - 2.5, 'M2'), text: (s2, x, y, sz, f, r, a, b, o = {}) => text(s2, x, y, sz, f, r, a + L.model2At - 2.5, b + L.model2At - 2.5, { ...o, g: 'M2' }), dot }, t - (L.model2At - 2.5));
      // ---- 3 GUESS -> CHECK -> ADJUST ----
      const qx = MX, qy = MY - 300;
      line(rrect(qx - 62, qy - 62, 124, 124, 12), 'acc2', 4, 6.4, 6.55, 'C');
      cat(qx, qy - 4, 100).forEach((p) => line(p, 'ink', 3.2, 6.5, 6.7, 'C'));
      eyes(qx, qy - 4, 100).forEach(([ex, ey]) => dot(ex, ey, 3, 'ink', 6.7, 'C'));
      text('new!', qx + 72, qy - 30, 30, 'label', 'acc2', 6.65, 6.8, { g: 'C' });
      const dn = [[qx, qy + 70], [qx + 2, MY - 170]];
      line(dn, 'ink', 5, 6.8, 6.95, 'C'); line(head(dn, 18), 'ink', 5, 6.95, 7.02, 'C');
      const gA = [[MX + 175, MY - 10], [MX + 300, MY - 14], [MX + 400, MY - 8]];
      line(gA, 'ink', 5, 7.02, 7.2, 'C'); line(head(gA, 20), 'ink', 5, 7.2, 7.26, 'C');
      text('Guess', MX + 290, MY - 40, 38, 'label', 'ink', 7.15, 7.4, { align: 'center', g: 'C' });
      const BX = MX + 540, BY = MY - 10;
      line(rrect(BX - 120, BY - 55, 240, 110, 40), 'ink', 5, 7.3, 7.5, 'C');
      line([[BX - 70, BY + 52], [BX - 96, BY + 92], [BX - 40, BY + 54]], 'ink', 5, 7.48, 7.55, 'C');
      text('dog?', BX, BY + 18, 52, 'title', 'ink', 7.52, 7.75, { align: 'center', g: 'C' });
      text('Check', BX, BY - 82, 38, 'label', 'acc2', 7.85, 8.05, { align: 'center', g: 'C' });
      line([[BX + 140, BY - 40], [BX + 200, BY + 30]], 'acc2', 8, 8.0, 8.08, 'C');
      line([[BX + 200, BY - 40], [BX + 140, BY + 30]], 'acc2', 8, 8.08, 8.16, 'C');
      line(circ(BX + 4, BY + 2, 150, 82, -2.2, 4.4), 'acc2', 5, 8.15, 8.45, 'C'); // emphasis ring
      const back = cubic([BX - 60, BY + 70], [BX - 80, BY + 290], [MX + 290, MY + 300], [MX + 155, MY + 190]);
      line(back, 'acc2', 6, 8.45, 8.95, 'C'); line(head(back, 22), 'acc2', 6, 8.95, 9.02, 'C');
      text('Adjust', (BX + MX) / 2 - 10, MY + 315, 40, 'label', 'acc2', 8.8, 9.05, { align: 'center', g: 'C' });
      if (t > 8.95 && t < 9.4) { // error signal travelling back
        const u = win(t, 8.95, 9.35), p = back[Math.min(back.length - 1, Math.floor((1 - u) * (back.length - 1)))];
        items.push({ k: 'dot', x: p[0], y: p[1], r: 13, role: 'acc2', a: -1, b: 0, g: 'C', inst: true });
      }
      line([[BX - 66, BY + 4], [BX - 20, BY - 6], [BX + 24, BY + 6], [BX + 66, BY - 4]], 'ink', 5, 9.5, 9.62, 'C'); // strike
      text('cat', BX + 30, BY + 118, 52, 'title', 'acc3', 9.62, 9.85, { align: 'center', g: 'C' });
      line([[BX + 92, BY + 96], [BX + 112, BY + 122], [BX + 156, BY + 66]], 'acc3', 8, 9.85, 10.05, 'C');
      if (L.bridge) { // a connector the hand draws while the camera travels to the next part
        const B = L.bridge;
        line(B.pts, 'acc1', 5, B.a, B.b, 'D'); line(head(B.pts, 22), 'acc1', 5, B.b, B.b + 0.06, 'D');
        text(B.label, B.lx, B.ly, 40, 'label', 'acc1', B.b + 0.06, B.b + 0.3, { align: 'center', rot: B.rot || 0, g: 'D' });
      }
      // ---- 4 PROGRESS ----
      const D = L.D;
      const ox = D[0] - 380, oy = D[1] + 150, cw = 560, ch = 330;
      line([[ox, oy - ch], [ox, oy], [ox + cw, oy]], 'ink', 5, L.pT, L.pT + 0.35, 'D');
      line(head([[ox, oy], [ox, oy - ch]], 16), 'ink', 5, L.pT + 0.35, L.pT + 0.4, 'D');
      line(head([[ox, oy], [ox + cw, oy]], 16), 'ink', 5, L.pT + 0.4, L.pT + 0.45, 'D');
      text('training rounds', ox + cw / 2, oy + 48, 34, 'label', 'ink', L.pT + 0.3, L.pT + 0.55, { align: 'center', g: 'D' });
      const cpts = [];
      for (let i = 0; i <= 40; i++) {
        const u = i / 40, acc = 61 + 36 * (1 - Math.pow(1 - u, 2.2)) + (i % 3 === 1 ? -2.5 : i % 3 === 2 ? 1.5 : 0) * (1 - u);
        cpts.push([ox + 20 + u * (cw - 50), oy - (acc - 50) / 50 * ch]);
      }
      line(cpts, 'acc1', 6, L.pT + 0.5, L.pT + 1.7, 'D');
      text('accuracy', D[0] + 330, D[1] - 120, 40, 'label', 'ink', L.pT + 0.45, L.pT + 0.7, { align: 'center', g: 'D' });
      if (t > L.pT + 0.55) {
        const u = win(Math.floor(t * 12) / 12, L.pT + 0.6, L.pT + 1.7), v = 61 + 36 * (1 - Math.pow(1 - u, 2.2));
        items.push({ k: 'text', s: Math.round(v) + '%', x: D[0] + 330, y: D[1] + 10, size: 110, font: 'num', role: u >= 1 ? 'acc3' : 'ink', a: -1, b: 0, align: 'center', g: 'D', inst: true, live: true });
      }
      line(circ(D[0] + 335, D[1] - 25, 140, 90, -2.4, 4.2), 'acc2', 6, L.pT + 1.75, L.pT + 2.05, 'D');
      // ---- 5 TAKEAWAY ----
      text('More examples → better guesses', D[0], D[1] + 290, 62, 'title', 'ink', L.kT, L.kT + 0.75, { align: 'center', rot: -0.01, g: 'E' });
      line([[D[0] - 450, D[1] + 316], [D[0] + 455, D[1] + 308]], 'acc1', 6, L.kT + 0.75, L.kT + 0.95, 'E');
      return items;
    };
    // the 'tip' of whatever is currently being drawn (for the hand/tool)
    const tipOf = (items, t, measure) => {
      let tip = null;
      for (const it of items) {
        if (it.inst || it.k === 'dot') continue;
        const p = win(t, it.a, it.b);
        if (p > 0 && p < 1) {
          if (it.k === 'line') { const P = it.pts; tip = P[Math.min(P.length - 1, Math.floor(p * (P.length - 1)))]; }
          else tip = measure ? measure(it, p) : [it.x, it.y];
        }
      }
      return tip;
    };
    return { clamp, win, eio, camAt, circ, quad, cubic, rrect, head, cat, dog, story, tipOf, fmt };
  })();
  // <<<XE-ENGINE
  registerStyle({
    id: 'napkin-sketch',
    name: 'Napkin Sketch',
    category: 'Hand-Drawn',
    description: 'A back-of-the-napkin startup pitch in black Sharpie: ink feathering into soft tissue fibers, an embossed napkin border, quarter-fold creases and crumples, a coffee ring, all lying on a warm wooden cafe table.',
    motion: 'The marker scrawls each box and arrow in quick confident strokes while ink slowly feathers outward; the napkin breathes slightly as if just set down.',
    fonts: ['400 54px "Permanent Marker"', '400 30px "Permanent Marker"', '400 26px "Permanent Marker"'],
    frameT: 5.9,
    duration: 6,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(64);

      // ---------- wooden table (half-res, per pixel) ----------
      {
        const w2 = W / 2, h2 = H_ / 2, wl = H.layer(w2, h2), wc = wl.getContext('2d');
        const id = wc.createImageData(w2, h2), d = id.data, rr = H.rng(3);
        const PL = 92; // plank height (half-res)
        const tints = [0, 1, 2, 3, 4, 5].map(() => [rr.range(-12, 12), rr.range(-0.4, 0.4)]);
        for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) {
          const pi = Math.floor((y + 20) / PL), py = (y + 20) % PL;
          const [tint, ph] = tints[pi % tints.length];
          const warp = nz.fbm2(x * 0.0025 + pi * 7, py * 0.012 + pi, 3) * 5.5;
          const ring = Math.sin((py * 0.07 + warp + ph * 3) * Math.PI * 2);
          const fine = nz.n2(x * 0.012 + pi * 5, y * 0.55) * 0.6 + nz.n2(x * 0.05, y * 1.3) * 0.25;
          let v = 0.5 + 0.16 * Math.sign(ring) * Math.pow(Math.abs(ring), 0.4) + 0.14 * fine + nz.n2(x * 0.004, y * 0.02 + pi) * 0.12;
          const r0 = 118 + tint, g0 = 74 + tint * 0.6, b0 = 42 + tint * 0.3;
          let r = r0 * (0.75 + 0.5 * v), g = g0 * (0.75 + 0.5 * v), b = b0 * (0.78 + 0.45 * v);
          if (py < 2 || py > PL - 2) { r *= 0.35; g *= 0.3; b *= 0.3; }
          const i = (y * w2 + x) * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
        }
        wc.putImageData(id, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.drawImage(wl, 0, 0, W, H_);
        // varnish sheen from a window
        const sh = ctx.createLinearGradient(0, 0, W, H_);
        sh.addColorStop(0, 'rgba(255,230,190,0.16)'); sh.addColorStop(0.4, 'rgba(255,230,190,0.02)'); sh.addColorStop(1, 'rgba(20,8,0,0.25)');
        ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H_);
      }

      // ---------- napkin geometry ----------
      const NW = 600, NH = 576, NCX = 548, NCY = 368, NR = -0.06;
      const toCanvas = (u, v) => {
        const x = u - NW / 2, y = v - NH / 2, c = Math.cos(NR), s = Math.sin(NR);
        return [NCX + x * c - y * s, NCY + x * s + y * c];
      };
      const toLocal = (X, Y) => {
        const x = X - NCX, y = Y - NCY, c = Math.cos(-NR), s = Math.sin(-NR);
        return [x * c - y * s + NW / 2, x * s + y * c + NH / 2];
      };
      const setLocal = (c) => { c.translate(NCX, NCY); c.rotate(NR); c.translate(-NW / 2, -NH / 2); };
      // deckled outline
      const outline = [];
      {
        const edge = (x0, y0, x1, y1, s) => {
          const n = 60;
          for (let i = 0; i < n; i++) {
            const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u;
            const o = nz.n2(u * 9 + s, s) * 2.2 + nz.n2(u * 60, s + 1) * 0.8;
            const nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny);
            outline.push([x + nx / l * o, y + ny / l * o]);
          }
        };
        edge(4, 0, NW - 2, 6, 1); edge(NW, 4, NW - 6, NH - 2, 2); edge(NW - 4, NH, 2, NH - 4, 3); edge(0, NH - 2, 6, 6, 4);
      }
      const napPath = (c) => { c.beginPath(); outline.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };

      // shadow on the table
      ctx.save(); ctx.filter = 'blur(10px)'; ctx.translate(7, 10); setLocal(ctx); napPath(ctx);
      ctx.fillStyle = 'rgba(25,10,0,0.55)'; ctx.fill(); ctx.restore();

      // napkin body layer
      const NL = H.layer(W, H_), nc = NL.getContext('2d');
      nc.save(); setLocal(nc); napPath(nc); nc.fillStyle = '#f6f5f0'; nc.fill(); nc.restore();
      // tissue fiber texture
      {
        const rr = H.rng(21);
        nc.save(); setLocal(nc); napPath(nc); nc.clip();
        for (let i = 0; i < 2600; i++) {
          const x = rr.range(0, NW), y = rr.range(0, NH), a = rr.range(0, 6.28), l = rr.range(3, 10);
          nc.strokeStyle = rr.chance(0.5) ? 'rgba(180,175,165,0.08)' : 'rgba(255,255,255,0.35)';
          nc.lineWidth = 0.7; nc.beginPath(); nc.moveTo(x, y); nc.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); nc.stroke();
        }
        nc.restore();
      }

      // ---------- emboss pattern ----------
      {
        const EM = H.layer(W, H_), ec = EM.getContext('2d');
        ec.save(); setLocal(ec); ec.strokeStyle = '#000'; ec.fillStyle = '#000'; ec.lineWidth = 2;
        const inset = (k) => { ec.beginPath(); ec.roundRect(k, k, NW - 2 * k, NH - 2 * k, 6); ec.stroke(); };
        inset(16); inset(52); ec.lineWidth = 1.2; inset(20);
        const ring = (x, y) => {
          ec.lineWidth = 1.6;
          for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; ec.beginPath(); ec.ellipse(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 5, 3, a, 0, 7); ec.stroke(); }
          ec.beginPath(); ec.arc(x, y, 1.6, 0, 7); ec.fill();
        };
        const step = 34;
        for (let x = 34 + step; x < NW - 34 - 10; x += step) { ring(x, 34); ring(x, NH - 34); }
        for (let y = 34 + step; y < NH - 34 - 10; y += step) { ring(34, y); ring(NW - 34, y); }
        [[34, 34], [NW - 34, 34], [34, NH - 34], [NW - 34, NH - 34]].forEach(([x, y]) => { ec.lineWidth = 1.6; ec.beginPath(); ec.arc(x, y, 9, 0, 7); ec.stroke(); ring(x, y); });
        // fine quilted dot grid in the field
        for (let y = 70; y < NH - 60; y += 16) for (let x = 70 + ((y / 16) % 2) * 8; x < NW - 60; x += 16) { ec.beginPath(); ec.arc(x, y, 0.9, 0, 7); ec.fill(); }
        ec.restore();
        const tint = (col, dx, dy, a) => {
          const tl = H.layer(W, H_), tc = tl.getContext('2d');
          tc.drawImage(EM, dx, dy); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, W, H_);
          nc.save(); nc.globalAlpha = a; nc.drawImage(tl, 0, 0); nc.restore();
        };
        tint('#8f8a80', 1.1, 1.3, 0.35);
        tint('#ffffff', -1, -1.1, 0.9);
        nc.save(); nc.globalCompositeOperation = 'source-atop'; nc.globalAlpha = 0.05; nc.drawImage(EM, 0, 0); nc.restore();
      }

      // ---------- coffee ring stain ----------
      {
        const RL = H.layer(W, H_), rc = RL.getContext('2d');
        rc.save(); setLocal(rc);
        const ring = (cx, cy, R, a) => {
          for (let k = 0; k < 3; k++) {
            const r = R + k * 1.4;
            const g = rc.createRadialGradient(cx, cy, r - 16, cx, cy, r + 2);
            g.addColorStop(0, 'rgba(150,95,45,0)'); g.addColorStop(0.7, `rgba(150,95,45,${a * 0.25})`);
            g.addColorStop(0.92, `rgba(120,70,30,${a})`); g.addColorStop(1, 'rgba(120,70,30,0)');
            rc.fillStyle = g; rc.beginPath(); rc.arc(cx + k * 0.8, cy - k * 0.6, r + 2, 0, 7); rc.fill();
          }
          const g2 = rc.createRadialGradient(cx, cy, 0, cx, cy, R);
          g2.addColorStop(0, `rgba(170,120,60,${a * 0.07})`); g2.addColorStop(1, `rgba(170,120,60,${a * 0.12})`);
          rc.fillStyle = g2; rc.beginPath(); rc.arc(cx, cy, R - 2, 0, 7); rc.fill();
        };
        ring(488, 128, 60, 0.55);
        ring(512, 146, 59, 0.22);
        rc.restore();
        // partial: fade part of the ring away (cup was tilted)
        rc.globalCompositeOperation = 'destination-in';
        const [cxw, cyw] = toCanvas(488, 128);
        const cg = rc.createConicGradient(0.6, cxw, cyw);
        cg.addColorStop(0, 'rgba(0,0,0,1)'); cg.addColorStop(0.55, 'rgba(0,0,0,1)'); cg.addColorStop(0.72, 'rgba(0,0,0,0.15)'); cg.addColorStop(0.86, 'rgba(0,0,0,0.6)'); cg.addColorStop(1, 'rgba(0,0,0,1)');
        rc.fillStyle = cg; rc.fillRect(0, 0, W, H_);
        nc.save(); nc.globalCompositeOperation = 'multiply'; nc.drawImage(RL, 0, 0); nc.restore();
      }

      // ---------- Sharpie ink ----------
      const IL = H.layer(W, H_), ic = IL.getContext('2d');
      ic.save(); setLocal(ic);
      ic.lineCap = 'round'; ic.lineJoin = 'round'; ic.strokeStyle = 'rgb(22,20,28)'; ic.fillStyle = 'rgb(22,20,28)';
      // stroke clock: quick, confident Sharpie strokes one after another
      let clock = 0.25, TIP = null;
      const slot = (dur) => { const a = clock; clock += dur; return H.clamp((t - a) / dur); };
      const ink = (pts, w = 5, s = 1, amp = 1.4) => {
        const P = wob(seg(pts), nz, s, amp);
        let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
        const pr = slot(Math.max(0.05, L / 1900) + 0.025);
        if (pr <= 0) return P;
        const Q = pr < 1 ? P.slice(0, Math.max(2, Math.ceil(P.length * pr))) : P;
        if (pr < 1) TIP = Q[Q.length - 1];
        ic.lineWidth = w; ic.beginPath(); Q.forEach(([x, y], i) => (i ? ic.lineTo(x, y) : ic.moveTo(x, y))); ic.stroke();
        return P;
      };
      const arrow = (pts, s, w = 5, hl = 18) => {
        const P = ink(pts, w, s);
        const a = P[P.length - 1], b = P[Math.max(0, P.length - 8)], an = Math.atan2(a[1] - b[1], a[0] - b[0]);
        ink([[a[0] - Math.cos(an - 0.55) * hl, a[1] - Math.sin(an - 0.55) * hl], a, [a[0] - Math.cos(an + 0.55) * hl, a[1] - Math.sin(an + 0.55) * hl]], w, s + 100, 0.5);
      };
      const txt = (str, x, y, size, rot, s) => {
        ic.save(); ic.font = `400 ${size}px "Permanent Marker"`; ic.translate(x, y); ic.rotate(rot);
        const rr = H.rng(s); let px = 0;
        const pr = slot(str.length * 0.034), nCh = Math.ceil(str.length * pr);
        if (pr > 0 && pr < 1) { const ww = ic.measureText(str.slice(0, nCh)).width; TIP = [x + ww * Math.cos(rot), y + ww * Math.sin(rot) - size * 0.3]; }
        let ci = 0;
        for (const ch of str) { const w = ic.measureText(ch).width; if (ci++ >= nCh) { px += w; continue; } ic.save(); ic.translate(px, rr.range(-1.5, 1.5)); ic.rotate(rr.range(-0.05, 0.05)); ic.fillText(ch, 0, 0); ic.restore(); px += w + rr.range(-1, 1.5); }
        ic.restore(); return px;
      };
      // title
      const tw = txt('THE BIG IDEA', 78, 128, 54, -0.03, 1);
      ink([[74, 146], [80 + tw * 0.55, 140], [78 + tw, 134]], 4.5, 2, 1.8);
      ink([[96, 160], [80 + tw * 0.6, 154], [70 + tw, 150]], 4, 3, 1.8);
      // stick person + speech bubble
      ink(ell(112, 236, 22, 24, -1.6, 4.75), 5, 4, 0.8);
      ink([[112, 262], [110, 330]], 5, 5); ink([[80, 290], [112, 282], [146, 292]], 5, 6); ink([[86, 378], [110, 330], [138, 376]], 5, 7);
      ink([[160, 200], [168, 178], [196, 166], [280, 168], [300, 188], [296, 218], [270, 232], [196, 234], [182, 252], [178, 230], [162, 222], [158, 202]], 4.5, 8, 0.8);
      txt('ugh!!', 190, 214, 30, -0.04, 9);
      // arrow to AI box
      arrow([[300, 260], [336, 262], [362, 258]], 10);
      // robot head box
      ink([[372, 210], [470, 206], [474, 304], [368, 308], [372, 202]], 5, 11, 1.2);
      ink([[420, 206], [422, 180]], 4.5, 12); ink(ell(422, 172, 8, 8), 4, 13, 0.3);
      ink(ell(400, 244, 9, 9), 4.5, 14, 0.3); ink(ell(444, 242, 9, 9), 4.5, 15, 0.3);
      ink([[396, 278], [410, 284], [430, 284], [448, 276]], 4.5, 16, 0.6);
      txt('AI', 398, 342, 30, 0.02, 17);
      // arrow down into the chart
      arrow(quad([480, 300], [540, 320], [520, 372]), 18, 5, 16);
      // hockey-stick chart
      ink([[268, 384], [266, 522], [520, 520]], 4.5, 19, 1);
      const hs = quad([278, 508], [430, 506], [505, 392], 30);
      arrow(hs, 20, 5.5, 18);
      txt('$$$', 400, 420, 30, -0.1, 21);
      ink(ell(432, 410, 50, 28, -2.5, 3.9), 4, 22, 1.4);
      txt('users', 298, 552, 26, 0, 23);
      // notes bottom-left with a scribbled-out word
      txt('MVP in', 74, 452, 26, -0.04, 24);
      const ww = txt('3', 186, 446, 26, -0.04, 25);
      { const rz = H.rng(5), P = []; for (let k = 0; k < 13; k++) P.push([178 + (k % 2) * 28 + rz.range(-4, 4), 420 + k * 2.4 + rz.range(-3, 3)]); ink(P, 3.5, 26, 0.6); }
      txt('2 wks?', 74, 490, 26, -0.04, 27);
      ic.restore();
      const BUILD_END = clock;

      // feathering: fiber-shaped bleed + soft halo + sharp core
      {
        const FB = H.layer(W, H_), fc = FB.getContext('2d'), rr = H.rng(44);
        fc.strokeStyle = '#000'; fc.lineWidth = 0.9;
        for (let i = 0; i < 42000; i++) {
          const x = rr.range(80, 900), y = rr.range(40, 690), a = rr.range(0, 6.28), l = rr.range(1.5, 5);
          fc.beginPath(); fc.moveTo(x, y); fc.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); fc.stroke();
        }
        const BL = H.layer(W, H_), bc = BL.getContext('2d');
        const soak = H.smooth(0.3, BUILD_END + 1.2, t); // ink keeps wicking into the fibres
        bc.filter = `blur(${(1.2 + 2.2 * soak).toFixed(2)}px)`; bc.drawImage(IL, 0, 0); bc.drawImage(IL, 0, 0); bc.filter = 'none';
        bc.globalCompositeOperation = 'destination-in'; bc.drawImage(FB, 0, 0);
        nc.save(); nc.globalAlpha = 0.2 + 0.3 * soak; nc.drawImage(BL, 0, 0); nc.restore();
        nc.save(); nc.filter = 'blur(2.2px)'; nc.globalAlpha = 0.85; nc.drawImage(IL, 0, 0); nc.restore();
        // core: slightly uneven absorption
        const CO = H.layer(W, H_), co = CO.getContext('2d');
        co.drawImage(IL, 0, 0);
        co.globalCompositeOperation = 'destination-out';
        const r2 = H.rng(45);
        for (let i = 0; i < 9000; i++) { co.fillStyle = `rgba(0,0,0,${r2.range(0.05, 0.3)})`; co.fillRect(r2.range(60, 920), r2.range(30, 700), r2.range(1, 3), r2.range(1, 3)); }
        nc.save(); nc.globalAlpha = 0.92; nc.drawImage(CO, 0, 0); nc.restore();
      }

      // ---------- crumple + fold lighting ----------
      {
        const s = 2, gw = Math.ceil(W / s), gh = Math.ceil(H_ / s);
        const hf = new Float32Array(gw * gh);
        const creases = [];
        { const rr = H.rng(9); for (let i = 0; i < 7; i++) creases.push([rr.range(0, NW), rr.range(0, NH), rr.range(0, Math.PI), rr.range(2, 5) * (rr.chance(0.5) ? 1 : -1), rr.range(80, 260)]); }
        for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
          const [u, v] = toLocal(x * s, y * s);
          if (u < -10 || v < -10 || u > NW + 10 || v > NH + 10) continue;
          let h = nz.fbm2(u * 0.009 + 3, v * 0.009, 4) * 11;
          const r1 = 1 - Math.abs(nz.n2(u * 0.018 + 9, v * 0.018)), r2 = 1 - Math.abs(nz.n2(u * 0.042 + 5, v * 0.042 + 2));
          h += r1 * r1 * 4.5 + r2 * r2 * 1.2;
          const du = Math.abs(u - NW / 2 - 4), dv = Math.abs(v - NH / 2 + 6);
          h += 8 * Math.max(0, 1 - du / 22);        // vertical fold: ridge
          h -= 7 * Math.max(0, 1 - dv / 20);        // horizontal fold: valley
          for (const [cx, cy, a, amp, len] of creases) {
            const dx = u - cx, dy = v - cy, along = dx * Math.cos(a) + dy * Math.sin(a), across = -dx * Math.sin(a) + dy * Math.cos(a);
            const fall = Math.max(0, 1 - Math.abs(along) / len);
            h += amp * 0.6 * fall * Math.max(0, 1 - Math.abs(across) / 14);
          }
          // edges curl up a little
          const ed = Math.min(u, v, NW - u, NH - v);
          h += 6 * Math.max(0, 1 - ed / 40);
          hf[y * gw + x] = h;
        }
        const SL = H.layer(gw, gh), sc = SL.getContext('2d'), sid = sc.createImageData(gw, gh), sd = sid.data;
        const HLt = H.layer(gw, gh), hc = HLt.getContext('2d'), hid = hc.createImageData(gw, gh), hd = hid.data;
        const Lx = -0.55, Ly = -0.6, Lz = 0.58;
        for (let y = 1; y < gh - 1; y++) for (let x = 1; x < gw - 1; x++) {
          const i = y * gw + x;
          const gx = (hf[i + 1] - hf[i - 1]) / (2 * s), gy = (hf[i + gw] - hf[i - gw]) / (2 * s);
          const nl = Math.hypot(gx, gy, 1), nxv = -gx / nl, nyv = -gy / nl, nzv = 1 / nl;
          const lam = nxv * Lx + nyv * Ly + nzv * Lz, flat = Lz;
          const dlt = (lam - flat) * 1.35;
          const j = i * 4;
          if (dlt < 0) { sd[j] = 70; sd[j + 1] = 64; sd[j + 2] = 58; sd[j + 3] = Math.min(255, -dlt * 255); }
          else { hd[j] = 255; hd[j + 1] = 255; hd[j + 2] = 252; hd[j + 3] = Math.min(255, dlt * 200); }
        }
        sc.putImageData(sid, 0, 0); hc.putImageData(hid, 0, 0);
        nc.save(); nc.globalCompositeOperation = 'source-atop'; nc.imageSmoothingEnabled = true;
        nc.drawImage(SL, 0, 0, W, H_); nc.globalAlpha = 0.6; nc.drawImage(HLt, 0, 0, W, H_); nc.restore();
      }
      // overall soft falloff on the napkin + crisp edge
      nc.save(); nc.globalCompositeOperation = 'source-atop';
      const fo = nc.createRadialGradient(480, 260, 120, 560, 380, 520);
      fo.addColorStop(0, 'rgba(255,255,255,0)'); fo.addColorStop(1, 'rgba(90,80,70,0.16)');
      nc.fillStyle = fo; nc.fillRect(0, 0, W, H_); nc.restore();
      ctx.drawImage(NL, 0, 0);
      ctx.save(); setLocal(ctx); napPath(ctx); ctx.strokeStyle = 'rgba(120,110,95,0.35)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();

      // ---------- coffee cup on saucer (top right) ----------
      {
        const cx = 1128, cy = 150;
        ctx.save(); ctx.filter = 'blur(14px)'; ctx.fillStyle = 'rgba(20,8,0,0.55)';
        ctx.beginPath(); ctx.arc(cx + 18, cy + 22, 156, 0, 7); ctx.fill(); ctx.restore();
        const sg = ctx.createRadialGradient(cx - 50, cy - 60, 20, cx, cy, 160);
        sg.addColorStop(0, '#ffffff'); sg.addColorStop(0.7, '#ebe9e4'); sg.addColorStop(1, '#bfbab2');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, 158, 0, 7); ctx.fill();
        const wellG = ctx.createRadialGradient(cx + 20, cy + 20, 60, cx, cy, 110);
        wellG.addColorStop(0, 'rgba(0,0,0,0)'); wellG.addColorStop(0.9, 'rgba(120,110,100,0.18)'); wellG.addColorStop(1, 'rgba(255,255,255,0.4)');
        ctx.fillStyle = wellG; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, 7); ctx.fill();
        // handle
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(2.35);
        ctx.fillStyle = 'rgba(40,20,5,0.3)'; ctx.beginPath(); ctx.roundRect(86, -8, 52, 26, 12); ctx.fill();
        const hg = ctx.createLinearGradient(0, -14, 0, 14); hg.addColorStop(0, '#ffffff'); hg.addColorStop(1, '#c9c4bb');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.roundRect(80, -14, 52, 26, 12); ctx.fill();
        ctx.restore();
        // cup shadow + body
        ctx.save(); ctx.filter = 'blur(6px)'; ctx.fillStyle = 'rgba(60,40,20,0.35)'; ctx.beginPath(); ctx.arc(cx + 10, cy + 12, 92, 0, 7); ctx.fill(); ctx.restore();
        const cg = ctx.createRadialGradient(cx - 40, cy - 40, 10, cx, cy, 92);
        cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.8, '#efece6'); cg.addColorStop(1, '#c6c0b6');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, 90, 0, 7); ctx.fill();
        // coffee
        const cf = ctx.createRadialGradient(cx - 10, cy - 10, 5, cx, cy, 76);
        cf.addColorStop(0, '#6b3e1e'); cf.addColorStop(0.75, '#4a2810'); cf.addColorStop(0.92, '#9a6a3c'); cf.addColorStop(1, '#3a1e0a');
        ctx.fillStyle = cf; ctx.beginPath(); ctx.arc(cx, cy, 76, 0, 7); ctx.fill();
        // latte heart
        ctx.save(); ctx.translate(cx + 4, cy + 4); ctx.rotate(0.4);
        ctx.fillStyle = 'rgba(232,206,170,0.92)';
        ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-46, 0, -34, -38, 0, -16); ctx.bezierCurveTo(34, -38, 46, 0, 0, 30); ctx.fill();
        ctx.strokeStyle = 'rgba(120,70,30,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, 36); ctx.stroke();
        ctx.restore();
        // rim highlight + inner shadow
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 82, 3.4, 5.2); ctx.stroke();
        ctx.strokeStyle = 'rgba(60,30,10,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx + 2, cy + 2, 74, 0, 7); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(cx - 30, cy - 36, 16, 6, -0.7, 0, 7); ctx.fill();
      }

      // ---------- steam curling off the coffee (ambient) ----------
      {
        const SL = H.layer(W, H_), sc = SL.getContext('2d');
        sc.lineCap = 'round';
        for (let k = 0; k < 5; k++) {
          const ph = k * 1.3, life = ((t * 0.35 + k / 5) % 1);
          const bx = 1095 + k * 14, by = 200 - life * 150;
          sc.strokeStyle = `rgba(255,250,240,${0.65 * Math.sin(life * Math.PI)})`; sc.lineWidth = 10 + life * 18;
          sc.beginPath();
          for (let j = 0; j <= 12; j++) {
            const u = j / 12, y = by + 40 - u * 110, x = bx + Math.sin(u * 4 + t * 1.6 + ph) * (10 + 26 * u);
            j ? sc.lineTo(x, y) : sc.moveTo(x, y);
          }
          sc.stroke();
        }
        ctx.save(); ctx.filter = 'blur(9px)'; ctx.drawImage(SL, 0, 0); ctx.restore();
      }

      // ---------- the marker: in hand while drawing, then set down on the table ----------
      const hTIP = TIP && t < BUILD_END ? (() => { const [u, v] = TIP; return toCanvas(u, v); })() : null;
      if (hTIP) {
        const [tx, ty] = hTIP, ang = 0.9;
        ctx.save();
        ctx.save(); ctx.filter = 'blur(8px)'; ctx.fillStyle = 'rgba(20,8,0,0.35)'; ctx.translate(tx + 24, ty + 30); ctx.rotate(ang); ctx.beginPath(); ctx.roundRect(10, -14, 300, 28, 12); ctx.fill(); ctx.restore();
        ctx.translate(tx, ty); ctx.rotate(ang);
        ctx.fillStyle = '#111114'; ctx.beginPath(); ctx.ellipse(5, 0, 7, 4, 0, 0, 7); ctx.fill();
        const ng = ctx.createLinearGradient(0, -10, 0, 10); ng.addColorStop(0, '#d8d8de'); ng.addColorStop(1, '#6a6a72');
        ctx.fillStyle = ng; ctx.beginPath(); ctx.moveTo(8, -4); ctx.lineTo(30, -11); ctx.lineTo(30, 11); ctx.lineTo(8, 4); ctx.closePath(); ctx.fill();
        const bg = ctx.createLinearGradient(0, -15, 0, 15); bg.addColorStop(0, '#5a5a62'); bg.addColorStop(0.3, '#2a2a30'); bg.addColorStop(1, '#0c0c10');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(28, -15, 190, 30, 12); ctx.fill();
        ctx.fillStyle = '#9c9ca4'; ctx.fillRect(150, -15, 14, 30);
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(210, -17, 96, 34, 14); ctx.fill(); // cap posted on the back
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(36, -10, 170, 2.5);
        ctx.restore();
      }
      if (t >= BUILD_END) {
        const drop = H.ease.out(H.clamp((t - BUILD_END) / 0.3));
        ctx.save(); ctx.translate(1010 + (1 - drop) * -60, 560 + (1 - drop) * -50); ctx.rotate(-0.62 + (1 - drop) * 0.5);
        ctx.scale(1 + (1 - drop) * 0.08, 1 + (1 - drop) * 0.08);
        ctx.save(); ctx.filter = 'blur(6px)'; ctx.fillStyle = 'rgba(20,8,0,0.5)'; ctx.beginPath(); ctx.roundRect(8, 4, 270, 34, 16); ctx.fill(); ctx.restore();
        const bg = ctx.createLinearGradient(0, -16, 0, 16);
        bg.addColorStop(0, '#5a5a62'); bg.addColorStop(0.3, '#2a2a30'); bg.addColorStop(1, '#0c0c10');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(0, -15, 180, 30, 13); ctx.fill();
        ctx.fillStyle = '#9c9ca4'; ctx.fillRect(110, -15, 14, 30);
        const cg = ctx.createLinearGradient(0, -17, 0, 17);
        cg.addColorStop(0, '#606068'); cg.addColorStop(0.3, '#26262c'); cg.addColorStop(1, '#09090c');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(176, -17, 100, 34, 14); ctx.fill();
        ctx.fillStyle = '#18181c'; ctx.beginPath(); ctx.roundRect(190, -24, 76, 10, 4); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(14, -10, 150, 2.5); ctx.fillRect(186, -11, 80, 2.5);
        ctx.restore();
      }

      H.grain(ctx, W, H_, 0.03, 8 + (Math.floor(t * 12) % 4));
      H.vignette(ctx, W, H_, 0.35, '25,10,0');
    },
    // >>>EXPLAINER
    explainerDuration: 15,
    explainerNote: 'A cafe-table pitch: the camera starts tight on the scrawled question then pulls back to the napkin; when a napkin is full a fresh one is slapped down on top of the pile (with a red Sharpie for the wrong guess and the 97%), arrows and numbers are fast Sharpie scrawls that feather into the tissue.',
    explainer(ctx, W, H_, t) {
      const nz = H.makeNoise(64);
      const D = [2560, 650];
      const SLIDE = [[-1, -0.5, 0], [5.55, 5.95, 1], [10.25, 10.65, 2]]; // napkin k lands at [1]
      const L = {
        D, pT: 10.85, kT: 13.05, modelName: 'the model', titleX: 1880, titleY: 300, model2At: 6.0,
        model: (cx, cy, adj, push, api, tt) => {
          const g = 'M';
          api.line(XE.rrect(cx - 150, cy - 135, 300, 290, 24), 'ink', 6, 2.5, 2.68, g);
          api.line([[cx + 70, cy - 135], [cx + 74, cy - 180]], 'ink', 5, 2.68, 2.72, g);
          api.line(XE.circ(cx + 75, cy - 192, 12, 12), 'ink', 5, 2.72, 2.76, g);
          api.line(XE.circ(cx - 55, cy - 50, 22, 22), 'ink', 5, 2.76, 2.81, g);
          api.line(XE.circ(cx + 55, cy - 50, 22, 22), 'ink', 5, 2.81, 2.86, g);
          api.line([[cx - 50, cy + 10], [cx - 18, cy + 30], [cx + 18, cy + 30], [cx + 50, cy + 10]], 'ink', 5, 2.86, 2.9, g);
          api.text('AI', cx - 22, cy - 82, 40, 'title', 'ink', 2.9, 2.96, { g });
          [-1, 0, 1].forEach((k, i) => {
            const x = cx + k * 80, y = cy + 92;
            api.line(XE.circ(x, y, 24, 24, -1.2, 5.2), 'ink', 4.5, 2.95 + i * 0.03, 3.0 + i * 0.03, g);
            if (tt > 3.0 + i * 0.03) {
              const a0 = [-2.4, -0.6, -1.9][i], a1 = [-0.7, -2.2, -0.4][i], a = a0 + (a1 - a0) * adj + Math.sin(adj * Math.PI) * 0.3;
              push({ k: 'line', pts: [[x, y], [x + Math.cos(a) * 19, y + Math.sin(a) * 19]], role: adj > 0 && adj < 1 ? 'acc2' : 'ink', w: 5, a: -1, b: 0, inst: true, g });
            }
          });
        },
      };
      const items = XE.story(t, L);
      const cam = XE.camAt([[0, 1880, 300, 1.45], [1.9, 1880, 305, 1.5], [2.75, 1880, 600, 0.84], [5.45, 1890, 605, 0.86], [6.1, 2550, 620, 0.86], [10.2, 2555, 625, 0.88],
        [10.8, 2560, 690, 0.9], [12.9, 2565, 695, 0.93], [13.6, 2560, 690, 0.88], [15, 2560, 690, 0.89]], t);
      const z = cam[2];
      const apply = (c) => { c.translate(W / 2, H_ / 2); c.scale(z, z); c.translate(-cam[0], -cam[1]); };
      const toS = ([x, y]) => [(x - cam[0]) * z + W / 2, (y - cam[1]) * z + H_ / 2];

      // ---------- cached textures: wood table, napkin body, napkin crumple shading ----------
      if (!XC.wood) {
        const w2 = 1300, h2 = 760, wl = H.layer(w2, h2), wc = wl.getContext('2d'), id = wc.createImageData(w2, h2), d = id.data, rr = H.rng(3);
        const PL = 92, tints = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(() => [rr.range(-12, 12), rr.range(-0.4, 0.4)]);
        for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) {
          const pi = Math.floor((y + 20) / PL), py = (y + 20) % PL, [tint, ph] = tints[pi % tints.length];
          const warp = nz.fbm2(x * 0.0025 + pi * 7, py * 0.012 + pi, 3) * 5.5, ring = Math.sin((py * 0.07 + warp + ph * 3) * Math.PI * 2);
          const fine = nz.n2(x * 0.012 + pi * 5, y * 0.55) * 0.6 + nz.n2(x * 0.05, y * 1.3) * 0.25;
          const v = 0.5 + 0.16 * Math.sign(ring) * Math.pow(Math.abs(ring), 0.4) + 0.14 * fine + nz.n2(x * 0.004, y * 0.02 + pi) * 0.12;
          let r = (118 + tint) * (0.75 + 0.5 * v), gg = (74 + tint * 0.6) * (0.75 + 0.5 * v), b = (42 + tint * 0.3) * (0.78 + 0.45 * v);
          if (py < 2 || py > PL - 2) { r *= 0.35; gg *= 0.3; b *= 0.3; }
          const i = (y * w2 + x) * 4; d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255;
        }
        wc.putImageData(id, 0, 0); XC.wood = wl;
        // napkin body (with embossed border + fibres) and its crumple shading, 1100x760
        const NW = 1100, NH = 760, nb = H.layer(NW, NH), nc = nb.getContext('2d');
        const out = []; const edge = (x0, y0, x1, y1, s) => { for (let i = 0; i < 60; i++) { const u = i / 60, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u, o = nz.n2(u * 9 + s, s) * 2.5; const nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny); out.push([x + nx / l * o, y + ny / l * o]); } };
        edge(4, 3, NW - 3, 6, 1); edge(NW - 3, 4, NW - 6, NH - 3, 2); edge(NW - 4, NH - 3, 3, NH - 4, 3); edge(3, NH - 3, 6, 6, 4);
        const path = (c) => { c.beginPath(); out.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
        path(nc); nc.fillStyle = '#f6f5f0'; nc.fill(); nc.save(); nc.clip();
        const r2 = H.rng(21);
        for (let i = 0; i < 3500; i++) { const x = r2.range(0, NW), y = r2.range(0, NH), a = r2.range(0, 6.28), l = r2.range(3, 10); nc.strokeStyle = r2.chance(0.5) ? 'rgba(180,175,165,0.08)' : 'rgba(255,255,255,0.35)'; nc.lineWidth = 0.7; nc.beginPath(); nc.moveTo(x, y); nc.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); nc.stroke(); }
        const EM = H.layer(NW, NH), ec = EM.getContext('2d'); ec.strokeStyle = '#000'; ec.fillStyle = '#000';
        const inset = (k, lw) => { ec.lineWidth = lw; ec.beginPath(); ec.roundRect(k, k, NW - 2 * k, NH - 2 * k, 6); ec.stroke(); };
        inset(18, 2); inset(56, 2); inset(22, 1.2);
        const ring = (x, y) => { ec.lineWidth = 1.6; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; ec.beginPath(); ec.ellipse(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 5, 3, a, 0, 7); ec.stroke(); } };
        for (let x = 74; x < NW - 40; x += 36) { ring(x, 37); ring(x, NH - 37); }
        for (let y = 74; y < NH - 40; y += 36) { ring(37, y); ring(NW - 37, y); }
        const tintL = (col, dx, dy, a) => { const tl = H.layer(NW, NH), tc = tl.getContext('2d'); tc.drawImage(EM, dx, dy); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, NW, NH); nc.globalAlpha = a; nc.drawImage(tl, 0, 0); nc.globalAlpha = 1; };
        tintL('#8f8a80', 1.1, 1.3, 0.35); tintL('#ffffff', -1, -1.1, 0.9);
        nc.restore();
        XC.napkin = nb;
        // crumple shading (multiply) + highlights, half-res
        const gw = NW / 2, gh = NH / 2, hf = new Float32Array(gw * gh);
        for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
          const u = x * 2, v = y * 2;
          let h = nz.fbm2(u * 0.009 + 3, v * 0.009, 4) * 11;
          const q1 = 1 - Math.abs(nz.n2(u * 0.018 + 9, v * 0.018)), q2 = 1 - Math.abs(nz.n2(u * 0.042 + 5, v * 0.042 + 2));
          h += q1 * q1 * 4.5 + q2 * q2 * 0.6 + 8 * Math.max(0, 1 - Math.abs(u - NW / 2) / 22) - 7 * Math.max(0, 1 - Math.abs(v - NH / 2) / 20);
          h += 6 * Math.max(0, 1 - Math.min(u, v, NW - u, NH - v) / 40);
          hf[y * gw + x] = h;
        }
        // shadows (multiplied, warm grey like the hero) and tissue highlights (laid on top) as separate layers
        const SL = H.layer(gw, gh), sc = SL.getContext('2d'), sid = sc.createImageData(gw, gh), sd = sid.data;
        const HLl = H.layer(gw, gh), hlc = HLl.getContext('2d'), hid = hlc.createImageData(gw, gh), hd = hid.data;
        for (let y = 1; y < gh - 1; y++) for (let x = 1; x < gw - 1; x++) {
          const i = y * gw + x, gx = (hf[i + 1] - hf[i - 1]) / 4, gy = (hf[i + gw] - hf[i - gw]) / 4, nl = Math.hypot(gx, gy, 1);
          const lam = (-gx * -0.55 + -gy * -0.6 + 0.58) / nl, dl = (lam - 0.58) * 1.35, j = i * 4;
          if (dl < 0) { sd[j] = 118; sd[j + 1] = 108; sd[j + 2] = 96; sd[j + 3] = Math.min(255, -dl * 255); } else { hd[j] = 255; hd[j + 1] = 255; hd[j + 2] = 251; hd[j + 3] = Math.min(255, dl * 200); }
        }
        sc.putImageData(sid, 0, 0); hlc.putImageData(hid, 0, 0);
        const up = (src) => { const o = H.layer(NW, NH), oc = o.getContext('2d'); oc.imageSmoothingEnabled = true; oc.drawImage(src, 0, 0, NW, NH); oc.globalCompositeOperation = 'destination-in'; oc.drawImage(nb, 0, 0); return o; };
        XC.crumple = up(SL); XC.crumpleHL = up(HLl);
        // tissue fibre mask (ink wicks along these) and an absorption speckle mask, both in napkin space
        const FB = H.layer(NW, NH), fbc = FB.getContext('2d'), r3 = H.rng(44);
        fbc.strokeStyle = '#000'; fbc.lineWidth = 0.9; fbc.beginPath();
        for (let i = 0; i < 52000; i++) { const x = r3.range(0, NW), y = r3.range(0, NH), a = r3.range(0, 6.28), l = r3.range(1.5, 5); fbc.moveTo(x, y); fbc.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); }
        fbc.stroke(); XC.fibre = FB;
        const SP = H.layer(NW, NH), spc = SP.getContext('2d'), r4 = H.rng(45);
        for (let i = 0; i < 14000; i++) { spc.fillStyle = `rgba(0,0,0,${r4.range(0.05, 0.3).toFixed(3)})`; spc.fillRect(r4.range(0, NW), r4.range(0, NH), r4.range(1, 3), r4.range(1, 3)); }
        XC.speck = SP;
        // coffee-ring stain sprite (the hero's ring(): a double ring, one side faded where the cup tilted)
        const RS = 300, RL = H.layer(RS, RS), rc = RL.getContext('2d');
        const ringS = (cx, cy, R, a) => {
          for (let k = 0; k < 3; k++) {
            const r = R + k * 1.6, g = rc.createRadialGradient(cx, cy, r - 18, cx, cy, r + 2);
            g.addColorStop(0, 'rgba(150,95,45,0)'); g.addColorStop(0.7, `rgba(150,95,45,${a * 0.25})`);
            g.addColorStop(0.92, `rgba(120,70,30,${a})`); g.addColorStop(1, 'rgba(120,70,30,0)');
            rc.fillStyle = g; rc.beginPath(); rc.arc(cx + k * 0.9, cy - k * 0.7, r + 2, 0, 7); rc.fill();
          }
          const g2 = rc.createRadialGradient(cx, cy, 0, cx, cy, R);
          g2.addColorStop(0, `rgba(170,120,60,${a * 0.07})`); g2.addColorStop(1, `rgba(170,120,60,${a * 0.12})`);
          rc.fillStyle = g2; rc.beginPath(); rc.arc(cx, cy, R - 2, 0, 7); rc.fill();
        };
        ringS(140, 140, 74, 0.55); ringS(168, 162, 73, 0.22);
        rc.globalCompositeOperation = 'destination-in';
        const cgR = rc.createConicGradient(0.6, 140, 140);
        cgR.addColorStop(0, 'rgba(0,0,0,1)'); cgR.addColorStop(0.55, 'rgba(0,0,0,1)'); cgR.addColorStop(0.72, 'rgba(0,0,0,0.15)'); cgR.addColorStop(0.86, 'rgba(0,0,0,0.6)'); cgR.addColorStop(1, 'rgba(0,0,0,1)');
        rc.fillStyle = cgR; rc.fillRect(0, 0, RS, RS);
        XC.ring = RL;
      }

      // ---------- table ----------
      ctx.save(); apply(ctx);
      ctx.imageSmoothingEnabled = true; ctx.drawImage(XC.wood, 700, -150, 2600, 1520);
      ctx.restore();
      const vig = ctx.createLinearGradient(0, 0, W, H_); vig.addColorStop(0, 'rgba(255,230,190,0.12)'); vig.addColorStop(1, 'rgba(20,8,0,0.22)');
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H_);

      // ---------- napkins, slapped down one on top of the other ----------
      const NAP = [[1880, 600, 1320, 840, -0.02], [2550, 620, 1100, 800, 0.035], [2560, 690, 1090, 690, -0.03]];
      const GRP = [['A', 'B', 'M', 'F'], ['C', 'M2'], ['D', 'E']];
      const font = (it) => `400 ${it.size * (it.font === 'label' ? 1.1 : it.font === 'num' ? 1.0 : 0.92)}px "Permanent Marker"`;
      const measure = (it, p) => {
        ctx.save(); ctx.font = font(it); const w = ctx.measureText(it.s).width, x0 = it.align === 'center' ? it.x - w / 2 : it.x;
        const w2 = ctx.measureText(it.s.slice(0, Math.ceil(it.s.length * p))).width; ctx.restore(); return [x0 + w2, it.y - it.size * 0.3];
      };
      for (let k = 0; k < 3; k++) {
        const [s0, s1] = SLIDE[k];
        if (t < s0) break;
        const u = XE.clamp((t - s0) / (s1 - s0)), e = u >= 1 ? 1 : 1 - Math.pow(1 - u, 3) * Math.cos(u * 4.5);
        const [ncx, ncy, nw, nh, nr] = NAP[k];
        const ox = (1 - e) * 1100, oy = (1 - e) * -700, orot = (1 - e) * 0.6, lift = (1 - XE.clamp(u * 1.1)) * 1;
        ctx.save(); apply(ctx);
        ctx.translate(ncx + ox, ncy + oy); ctx.rotate(nr + orot);
        // shadow: big and soft while in the air, tight once it lands
        ctx.save(); ctx.filter = `blur(${(8 + lift * 30).toFixed(1)}px)`; ctx.fillStyle = `rgba(25,10,0,${(0.5 - lift * 0.25).toFixed(2)})`;
        ctx.fillRect(-nw / 2 + 8 + lift * 60, -nh / 2 + 12 + lift * 70, nw, nh); ctx.restore();
        ctx.drawImage(XC.napkin, -nw / 2, -nh / 2, nw, nh);
        // a coffee ring where the cup was set down on this napkin (world offsets from the napkin centre, clipped to it)
        const RG = [[-565, -325, 0.9], [350, -230, 2.4], [-500, -300, -0.7]][k];
        ctx.save(); ctx.beginPath(); ctx.rect(-nw / 2 + 4, -nh / 2 + 4, nw - 8, nh - 8); ctx.clip();
        ctx.translate(RG[0], RG[1]); ctx.rotate(RG[2]); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(XC.ring, -140, -140);
        ctx.restore();
        ctx.restore();
        if (u >= 1) {
          // ink for this napkin (Sharpie, feathering)
          const IL = H.layer(W, H_), ic = IL.getContext('2d');
          ic.save(); apply(ic); ic.lineCap = 'round'; ic.lineJoin = 'round';
          for (const it of items) {
            if (!GRP[k].includes(it.g)) continue;
            const p = it.inst ? 1 : XE.win(t, it.a, it.b);
            if (p <= 0) continue;
            const col = it.role === 'acc2' ? 'rgb(196,28,36)' : 'rgb(22,20,28)';
            ic.strokeStyle = col; ic.fillStyle = col;
            if (it.k === 'line') {
              const seed = ((it.pts[0][0] * 13 + it.pts[0][1] * 7) | 0) + 3;
              let P = wob(seg(it.pts, 2.5), nz, seed % 79, it.inst ? 0.5 : 1.5);
              if (p < 1) P = P.slice(0, Math.max(2, Math.ceil(P.length * p)));
              ic.lineWidth = Math.max(4, it.w * 1.05); ic.beginPath(); P.forEach(([x, y], i) => (i ? ic.lineTo(x, y) : ic.moveTo(x, y))); ic.stroke();
            } else if (it.k === 'dot') { ic.beginPath(); ic.arc(it.x, it.y, it.r, 0, 7); ic.fill(); }
            else {
              ic.save(); ic.font = font(it); const w = ic.measureText(it.s).width;
              ic.translate(it.align === 'center' ? it.x - w / 2 : it.x, it.y); ic.rotate(it.rot);
              const rr = H.rng((it.s.length * 31 + (it.x | 0)) % 991), n = Math.ceil(it.s.length * p); let px = 0;
              for (let i = 0; i < n; i++) { const cw = ic.measureText(it.s[i]).width; ic.save(); ic.translate(px, rr.range(-1.5, 1.5)); ic.rotate(rr.range(-0.05, 0.05)); ic.fillText(it.s[i], 0, 0); ic.restore(); px += cw; }
              ic.restore();
            }
          }
          ic.restore();
          // clip ink to the napkin, feather it, then let the crumples shade it
          ic.save(); ic.globalCompositeOperation = 'destination-in'; apply(ic); ic.translate(ncx, ncy); ic.rotate(nr); ic.drawImage(XC.napkin, -nw / 2, -nh / 2, nw, nh); ic.restore();
          // the hero's feathering: a soft halo, a fibre-shaped bleed wicking out along the tissue, then the core
          // with slightly uneven absorption (speckle knocked out of it)
          const toNap = (c) => { apply(c); c.translate(ncx, ncy); c.rotate(nr); };
          // blur at half resolution (cheap, and the upscale softens it further), reusing cached scratch layers
          const hw = W >> 1, hh = H_ >> 1;
          if (!XC.bl || XC.bl.width !== hw) { XC.bl = H.layer(hw, hh); XC.fb = H.layer(W, H_); }
          const BL = XC.bl, bc = BL.getContext('2d'), FBL = XC.fb, fc = FBL.getContext('2d');
          bc.clearRect(0, 0, hw, hh); bc.filter = `blur(${(1.5 * Math.sqrt(z)).toFixed(2)}px)`; bc.drawImage(IL, 0, 0, hw, hh); bc.filter = 'none';
          bc.drawImage(BL, 0, 0); // doubled, so the bleed has some body
          ctx.save(); ctx.imageSmoothingEnabled = true; ctx.globalAlpha = 0.38; ctx.drawImage(BL, 0, 0, W, H_); ctx.restore();
          fc.clearRect(0, 0, W, H_); fc.imageSmoothingEnabled = true; fc.drawImage(BL, 0, 0, W, H_);
          fc.save(); fc.globalCompositeOperation = 'destination-in'; toNap(fc); fc.drawImage(XC.fibre, -nw / 2, -nh / 2, nw, nh); fc.restore();
          ctx.save(); ctx.globalAlpha = 0.75; ctx.drawImage(FBL, 0, 0); ctx.restore();
          ic.save(); ic.globalCompositeOperation = 'destination-out'; toNap(ic); ic.drawImage(XC.speck, -nw / 2, -nh / 2, nw, nh); ic.restore();
          ctx.save(); ctx.globalAlpha = 0.94; ctx.drawImage(IL, 0, 0); ctx.restore();
        }
        ctx.save(); apply(ctx); ctx.translate(ncx + ox, ncy + oy); ctx.rotate(nr + orot);
        ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5; ctx.drawImage(XC.crumple, -nw / 2, -nh / 2, nw, nh);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.5; ctx.drawImage(XC.crumpleHL, -nw / 2, -nh / 2, nw, nh);
        ctx.restore();
      }

      // ---------- coffee cup + steam (on the table, top right) ----------
      {
        const [cx, cy] = toS([3170, 160]), s = z;
        ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
        ctx.save(); ctx.filter = 'blur(14px)'; ctx.fillStyle = 'rgba(20,8,0,0.5)'; ctx.beginPath(); ctx.arc(18, 22, 156, 0, 7); ctx.fill(); ctx.restore();
        const sg = ctx.createRadialGradient(-50, -60, 20, 0, 0, 160); sg.addColorStop(0, '#ffffff'); sg.addColorStop(0.7, '#ebe9e4'); sg.addColorStop(1, '#bfbab2');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, 158, 0, 7); ctx.fill();
        const cg = ctx.createRadialGradient(-40, -40, 10, 0, 0, 92); cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.8, '#efece6'); cg.addColorStop(1, '#c6c0b6');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill();
        const cf = ctx.createRadialGradient(-10, -10, 5, 0, 0, 76); cf.addColorStop(0, '#6b3e1e'); cf.addColorStop(0.75, '#4a2810'); cf.addColorStop(0.92, '#9a6a3c'); cf.addColorStop(1, '#3a1e0a');
        ctx.fillStyle = cf; ctx.beginPath(); ctx.arc(0, 0, 76, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(232,206,170,0.92)'; ctx.rotate(0.4); ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-46, 0, -34, -38, 0, -16); ctx.bezierCurveTo(34, -38, 46, 0, 0, 30); ctx.fill();
        ctx.restore();
        ctx.save(); ctx.filter = 'blur(9px)'; ctx.lineCap = 'round';
        for (let k = 0; k < 5; k++) {
          const life = (t * 0.35 + k / 5) % 1; ctx.strokeStyle = `rgba(255,250,240,${0.6 * Math.sin(life * Math.PI)})`; ctx.lineWidth = (10 + life * 18) * z;
          ctx.beginPath();
          for (let j = 0; j <= 12; j++) { const v = j / 12, y = cy + (40 - life * 150 - v * 110) * z, x = cx + (-30 + k * 14 + Math.sin(v * 4 + t * 1.6 + k * 1.3) * (10 + 26 * v)) * z; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.stroke();
        }
        ctx.restore();
      }

      // ---------- the Sharpie in hand ----------
      const tp = XE.tipOf(items, t, measure);
      if (tp) {
        const [tx, ty] = toS(tp), ang = 0.9;
        const red = (items.filter((q) => !q.inst && q.k !== 'dot' && XE.win(t, q.a, q.b) > 0 && XE.win(t, q.a, q.b) < 1).pop() || {}).role === 'acc2';
        ctx.save();
        ctx.save(); ctx.filter = 'blur(8px)'; ctx.fillStyle = 'rgba(20,8,0,0.35)'; ctx.translate(tx + 24, ty + 30); ctx.rotate(ang); ctx.beginPath(); ctx.roundRect(10, -14, 300, 28, 12); ctx.fill(); ctx.restore();
        ctx.translate(tx, ty); ctx.rotate(ang);
        ctx.fillStyle = red ? '#9a1018' : '#111114'; ctx.beginPath(); ctx.ellipse(5, 0, 7, 4, 0, 0, 7); ctx.fill();
        const ng = ctx.createLinearGradient(0, -10, 0, 10); ng.addColorStop(0, '#d8d8de'); ng.addColorStop(1, '#6a6a72');
        ctx.fillStyle = ng; ctx.beginPath(); ctx.moveTo(8, -4); ctx.lineTo(30, -11); ctx.lineTo(30, 11); ctx.lineTo(8, 4); ctx.closePath(); ctx.fill();
        const bg = ctx.createLinearGradient(0, -15, 0, 15);
        if (red) { bg.addColorStop(0, '#e05058'); bg.addColorStop(0.3, '#b8202a'); bg.addColorStop(1, '#5a0a10'); } else { bg.addColorStop(0, '#5a5a62'); bg.addColorStop(0.3, '#2a2a30'); bg.addColorStop(1, '#0c0c10'); }
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(28, -15, 190, 30, 12); ctx.fill();
        ctx.fillStyle = '#9c9ca4'; ctx.fillRect(150, -15, 14, 30);
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(210, -17, 96, 34, 14); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(36, -10, 170, 2.5);
        ctx.restore();
      }
      H.grain(ctx, W, H_, 0.025, 8 + (Math.floor(t * 12) % 4));
      H.vignette(ctx, W, H_, 0.3, '25,10,0');
    },
    // <<<EXPLAINER
    // Sound: a Sharpie on a paper napkin on a wooden cafe table. Every draw-on is a soft, fibrous felt-tip drag with the
    // table's dull body under it (the tip presses the tissue onto wood); the red Sharpie (acc2 items) is the same pen a
    // little brighter; a fresh napkin is slapped down on the pile for each new part (SLIDE windows: it whips in through
    // the air, lands flat with a soft tissue slap, and settles). Quiet room under it, a distant cup now and then.
    // Times mirror explainer()/XE.story (pT 10.85, kT 13.05, model2At 6.0, SLIDE, model timings from explainer()).
    explainerSound(k) {
      const pT = 10.85, kT = 13.05, M2 = 6.0 - 2.5; // the model is drawn again on napkin 2, shifted by model2At - 2.5
      const SLIDE = [[5.55, 5.95], [10.25, 10.65]];
      // first time XE.eio(win(t, t0, t1)) reaches u (the knob needles' eased turn)
      const when = (t0, t1, u) => { for (let i = 0; i <= 400; i++) if (XE.eio(i / 400) >= u - 1e-6) return t0 + (t1 - t0) * i / 400; return t1; };
      // one Sharpie line: felt tip lands (soft press into tissue over wood), fibrous drag for the draw-on, table body under it
      const LV = 0.45; // drawing sits well under the hits
      const sh = (a, b, g = 1, pan = 0, minor = true, red = false) => {
        const d = Math.max(0.03, b - a); g *= LV;
        k.noise(a, { dur: 0.03, filter: 'bandpass', f: 700, q: 1, gain: 0.16 * g, a: 0.002, pan, minor });
        k.tone(a, { f: 120, dur: 0.05, gain: 0.07 * g, pan, minor });
        k.play('stroke', a, { material: 'sharpie', dur: d, gain: (red ? 0.5 : 0.42) * g, pan, minor });
        k.noise(a, { dur: d + 0.04, color: 'pink', filter: 'lowpass', f: 520, gain: 0.07 * g, a: 0.015, hold: d * 0.6, pan, minor });
      };
      // scrawled words: one stroke per word, timed by character position like the explainer's per-letter reveal
      const write = (s, a, b, g = 0.9, pan = 0, red = false, minor = true) => {
        const n = s.length, re = /\S+/g; let m;
        while ((m = re.exec(s))) sh(a + (b - a) * m.index / n, a + (b - a) * (m.index + m[0].length) / n, g, pan, minor, red);
      };
      const dab = (t, g = 1) => k.noise(t, { dur: 0.025, filter: 'bandpass', f: 900, q: 1.2, gain: 0.22 * g, a: 0.002, minor: true }); // a felt-tip dot
      // a fresh napkin: whips in from the top right, first reaches its spot at u = pi/9 of the eased slide
      // (e = 1 - (1-u)^3 cos 4.5u), slaps down flat, shadow tightens as it settles by the end of the window
      const napkin = (s0, s1) => {
        const land = s0 + (s1 - s0) * Math.PI / 9;
        k.noise(s0, { dur: land - s0 + 0.03, color: 'pink', filter: 'bandpass', f: [[0, 260], [land - s0, 800]], q: 0.7, gain: 0.2, a: (land - s0) * 0.8, pan: 0.5 }); // air under the sheet
        k.play('slap', land, { gain: 0.7, pan: 0.1 });
        k.play('thud', land, { f: 85, gain: 0.4, pan: 0.1 }); // the pile on the table
        k.play('paper', land + 0.01, { dur: 0.16, gain: 0.35, pan: 0.1 }); // tissue crinkles as it lands
        k.noise(land + 0.12, { dur: s1 - land, color: 'pink', filter: 'bandpass', f: 1100, q: 0.6, gain: 0.04, a: 0.08, pan: 0.1, minor: true }); // settling
      };
      const clink = (t, f, pan) => { k.tone(t, { f, dur: 0.5, gain: 0.025, verb: 0.6, pan, minor: true }); k.tone(t, { f: f * 2.41, dur: 0.2, gain: 0.008, verb: 0.6, pan, minor: true }); };

      k.bed('room', 0, 15, { gain: 0.7 });
      clink(1.8, 1560, -0.7); clink(14.45, 1720, 0.75); // a cup set down somewhere across the cafe

      // 1 HOOK (tight on the napkin)
      k.play('pop', 0.03, { f: 300, gain: 0.45, minor: true }); // cap off
      write('How does AI learn?', 0.15, 1.3, 1.0);
      sh(1.3, 1.55, 1.25, 0, false); // underline: a fast confident swipe

      // 2 DATA: robot (box, antenna, eyes, smile, "AI", knobs), then six cards
      sh(2.5, 2.68, 1.05, 0.1, false); // robot head: first mark in the new scene
      sh(2.68, 2.76, 0.7, 0.15); sh(2.76, 2.86, 0.7, 0.1); sh(2.86, 2.9, 0.6, 0.1); // antenna, eyes, smile
      write('AI', 2.9, 2.96, 0.6, 0.05);
      for (let i = 0; i < 6; i++) { const a = 3.0 + i * 0.17; sh(a, a + (i < 5 ? 0.15 : 0.21), 0.85, (i % 3 - 1) * 0.15); }
      sh(4.15, 4.45, 1.0); sh(4.46, 4.55, 0.85); // flow arrow + head
      write('examples', 4.55, 4.8, 0.35);
      for (let f = 55; f < 63; f++) k.play('count', f / 12, { gain: 1.5, f: 2000 + (f - 55) * 100, minor: true }); // numbers re-scrawled on the 12 fps grid
      k.play('tock', 63 / 12, { f: 470, gain: 0.45 }); // 1,000,000 lands

      // napkin 2 slaps down
      napkin(SLIDE[0][0], SLIDE[0][1]);

      // 3 GUESS -> CHECK -> ADJUST (the robot is redrawn on the new napkin while the new photo goes up)
      sh(2.5 + M2, 2.68 + M2, 0.95, 0.1, false); sh(2.68 + M2, 2.9 + M2, 0.6, 0.1); // robot again: head, then face
      sh(6.4, 6.53, 0.9, 0, true, true); // red frame of the new photo
      sh(6.55, 6.7, 0.85); dab(6.7, 0.9); // cat + eyes
      write('new!', 6.67, 6.8, 0.6, 0.2, true);
      sh(6.8, 6.94, 0.9); sh(6.96, 7.02, 0.8); // arrow down into the model
      sh(7.02, 7.15, 0.9); // guess arrow out
      write('Guess', 7.15, 7.4, 0.6);
      sh(7.3, 7.47, 0.85); sh(7.48, 7.53, 0.75); // speech bubble + tail
      write('dog?', 7.54, 7.75, 1.0);
      write('Check', 7.86, 8.0, 0.6, 0, true);
      // the wrong guess: two hard red slashes + a low "nope"
      sh(8.0, 8.08, 1.8, 0.1, false, true); sh(8.08, 8.16, 1.8, 0.1, false, true);
      k.play('error', 8.0, { f: 'F3', gain: 0.55 });
      sh(8.16, 8.45, 1.1, 0, true, true); // red ring
      sh(8.45, 8.8, 1.0, -0.1, true, true); // long arrow back to the knobs
      write('Adjust', 8.8, 9.05, 0.6, -0.1, true);
      // knob needles swing (eio 8.95..9.5): a soft detent click every 1/7 of the turn, slowing as they settle
      for (let j = 1; j <= 7; j++) k.play('click', when(8.95, 9.5, j / 7), { f: 950, gain: 0.5, pan: -0.15, minor: true });
      sh(9.5, 9.62, 1.1); // strike through "dog?"
      write('cat', 9.62, 9.85, 1.0);
      sh(9.85, 10.05, 1.15, 0, false); // check mark
      k.play('success', 9.98, { f: 'A5', gain: 0.6 });

      // napkin 3 slaps down
      napkin(SLIDE[1][0], SLIDE[1][1]);

      // 4 PROGRESS
      sh(pT, pT + 0.3, 1.0, 0, false); // axes
      write('training rounds', pT + 0.3, pT + 0.55, 0.5);
      write('accuracy', pT + 0.45, pT + 0.7, 0.55, 0.3);
      sh(pT + 0.7, pT + 1.7, 0.3); // the rising curve
      { // % counter: a tick whenever the shown number changes (12 fps grid), slowing as it settles.
        // The numbers stay black, so the hit lands on the frame 97% is first scrawled.
        let last = -1;
        for (let f = Math.ceil((pT + 0.6) * 12); f < 160; f++) {
          const u = Math.min(1, (f / 12 - (pT + 0.6)) / 1.1), v = Math.round(61 + 36 * (1 - Math.pow(1 - u, 2.2)));
          if (v === 97) { // 97% lands: the biggest hit
            k.play('impact', f / 12, { gain: 1.2, pan: 0.2 });
            k.play('ding', f / 12 + 0.01, { f: 'D6', gain: 0.42, pan: 0.2 });
            break;
          }
          if (v !== last) { k.play('tick', f / 12, { gain: 1.5, f: 3200 + (v - 61) * 22, pan: 0.25, minor: true }); last = v; }
        }
      }
      sh(pT + 1.75, pT + 2.05, 1.25, 0.25, false, true); // red ring round the 97%

      // 5 TAKEAWAY
      write('More examples → better guesses', kT, kT + 0.75, 0.9);
      k.play('success', kT + 0.75, { f: 'G5', gain: 0.7 }); // resolving landing
      sh(kT + 0.75, kT + 0.95, 1.15, 0, false);
      k.play('click', kT + 1.15, { f: 700, gain: 1.0, minor: true }); // cap back on
    },
  });
}
