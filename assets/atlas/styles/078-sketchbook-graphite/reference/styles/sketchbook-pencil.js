// Sketchbook Pencil — graphite study on cream sketchbook paper.
{
  const seg = (pts, step = 3) => {
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
  const wob = (pts, nz, seed, amp = 1.2, freq = 0.01) => {
    const N = normals(pts); let L = 0;
    return pts.map((p, i) => {
      if (i) L += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      const o = nz.n2(L * freq + seed * 1.37, seed * 0.71) * amp + nz.n2(L * freq * 7 + seed, seed + 3.3) * amp * 0.2;
      return [p[0] + N[i][0] * o, p[1] + N[i][1] * o];
    });
  };
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, grow = 0) => {
    const n = Math.max(10, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 3)), out = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, a = a0 + (a1 - a0) * u, g = 1 + grow * u;
      out.push([cx + Math.cos(a) * rx * g, cy + Math.sin(a) * ry * g]);
    }
    return out;
  };
  const bez = (p0, p1, p2, p3, n = 40) => {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, m = 1 - t;
      out.push([m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
        m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]);
    }
    return out;
  };

  const GR = '38,38,44';
  // a graphite line: pressure tapers at both ends, slight density flicker
  // time gating: PH = sequential stroke clock, GATE = explicit progress
  let PH = null, GATE = 1, TIP = null;
  const pencil = (c, pts, w, a, seed, taperIn = 0.15, taperOut = 0.25, nz) => {
    if (pts.length < 2) return;
    let gate = GATE;
    if (PH) { const k = PH.k++; gate = H.clamp((PH.t - (PH.t0 + k * PH.dt)) / (PH.dt * 2)); }
    if (gate <= 0) return;
    const n = gate < 1 ? Math.max(2, Math.ceil(pts.length * gate)) : pts.length;
    if (gate < 1 && PH) TIP = pts[n - 1];
    c.lineCap = 'butt'; c.lineJoin = 'round';
    for (let i = 0; i < n - 1; i += 2) {
      const u = i / (n - 1);
      let p = Math.min(1, u / taperIn, (1 - u) / taperOut);
      p = 0.25 + 0.75 * Math.sqrt(Math.max(0, p));
      const fl = 0.8 + 0.4 * (0.5 + 0.5 * nz.n2(i * 0.07, seed * 0.13));
      c.strokeStyle = `rgba(${GR},${Math.min(1, a * p * fl)})`; c.lineWidth = w * (0.55 + 0.45 * p);
      c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[i + 1][0], pts[i + 1][1]);
      if (pts[i + 2]) c.lineTo(pts[i + 2][0], pts[i + 2][1]);
      c.stroke();
    }
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
    id: 'sketchbook-pencil',
    name: 'Sketchbook Graphite',
    category: 'Hand-Drawn',
    description: 'A graphite study in a spiral sketchbook: faint construction circles and axes under confident darker contours, directional hatching that breaks on the paper tooth, smudged tones, kneaded-eraser highlights and a margin note.',
    motion: 'Construction lines ghost in first, contours firm up over them, then hatching sweeps across the shadow side while the eraser lifts the highlight.',
    fonts: ['700 56px "Caveat"', '400 34px "Caveat"', '400 26px "Caveat"', '700 30px "Caveat"'],
    frameT: 6.4,
    duration: 6.5,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(23);
      const r = H.rng(99);
      const PX = 74; // page left edge
      const win = (a, b) => H.clamp((t - a) / (b - a));
      const seq = (t0, dt) => { PH = { t, t0, dt, k: 0 }; };
      PH = null; GATE = 1; TIP = null;

      // ---------- desk + page ----------
      const desk = ctx.createLinearGradient(0, 0, PX, 0);
      desk.addColorStop(0, '#2a2420'); desk.addColorStop(1, '#3b332c');
      ctx.fillStyle = desk; ctx.fillRect(0, 0, PX + 10, H_);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(PX - 6, 0, 10, H_);
      const paper = H.layer(W, H_), pc = paper.getContext('2d');
      H.paper(pc, W, H_, '#efe6d2', 31, 0.025);
      ctx.drawImage(paper, PX, 0, W - PX, H_, PX, 0, W - PX, H_);
      // page curvature near binding + warm lamp falloff
      const cur = ctx.createLinearGradient(PX, 0, PX + 90, 0);
      cur.addColorStop(0, 'rgba(90,70,40,0.28)'); cur.addColorStop(1, 'rgba(90,70,40,0)');
      ctx.fillStyle = cur; ctx.fillRect(PX, 0, 90, H_);
      const lamp = ctx.createRadialGradient(560, 220, 80, 640, 360, 900);
      lamp.addColorStop(0, 'rgba(255,250,235,0.18)'); lamp.addColorStop(1, 'rgba(70,50,20,0.16)');
      ctx.fillStyle = lamp; ctx.fillRect(PX, 0, W, H_);

      // ---------- graphite layer ----------
      const L = H.layer(W, H_), g = L.getContext('2d');
      const S = H.layer(W, H_), sm = S.getContext('2d'); // smudge layer
      const cx = 600, cy = 300, R = 172;
      const draw = (fn) => fn();

      // construction lines: light, long, overshooting
      const con = (pts, s, a = 0.32, w = 1.2) => pencil(g, wob(seg(pts), nz, s, 1.0, 0.006), w, a, s, 0.05, 0.05, nz);
      seq(0.05, 0.06);
      con([[cx + 2, 70], [cx - 3, 672]], 1, 0.15);
      con([[cx - 270, cy + 2], [cx + 280, cy - 3]], 2, 0.14);
      con([[cx - 210, cy - 140], [cx + 230, cy + 160]], 3, 0.08);
      for (let k = 0; k < 3; k++) {
        const a0 = r.range(0, 6.28);
        pencil(g, wob(ell(cx + r.range(-4, 4), cy + r.range(-4, 4), R + r.range(-6, 8), R + r.range(-6, 8), a0, a0 + 6.6), nz, 10 + k, 1.4, 0.02), 1.1, 0.2, 10 + k, 0.05, 0.05, nz);
      }
      con(ell(cx, 498, 64, 13), 4, 0.14);
      con(ell(cx, 594, 58, 12), 5, 0.13);
      con([[cx - 64, 460], [cx - 64, 600]], 6, 0.11);
      con([[cx + 64, 460], [cx + 64, 600]], 7, 0.11);
      con(ell(cx, cy, 76, 76), 8, 0.12);
      con(ell(cx, cy, 58, 58), 9, 0.1);
      // light source arrow guide (artist's note to self)

      // ---------- tonal smudge (blended with finger/stump) ----------
      {
        sm.save();
        sm.beginPath(); sm.arc(cx, cy, R, 0, 7); sm.clip();
        const gg = sm.createRadialGradient(cx - 70, cy - 80, 20, cx + 20, cy + 20, R * 1.15);
        gg.addColorStop(0, `rgba(${GR},0)`); gg.addColorStop(0.55, `rgba(${GR},0.1)`); gg.addColorStop(0.85, `rgba(${GR},0.32)`); gg.addColorStop(1, `rgba(${GR},0.2)`);
        sm.fillStyle = gg; sm.fillRect(0, 0, W, H_);
        sm.restore();
        // cast shadow
        sm.save(); sm.translate(cx + 120, 632); sm.scale(1, 0.13);
        const cs = sm.createRadialGradient(0, 0, 10, 0, 0, 220);
        cs.addColorStop(0, `rgba(${GR},0.5)`); cs.addColorStop(0.6, `rgba(${GR},0.22)`); cs.addColorStop(1, `rgba(${GR},0)`);
        sm.fillStyle = cs; sm.beginPath(); sm.arc(0, 0, 220, 0, 7); sm.fill(); sm.restore();
        // base tone
        const bt = sm.createLinearGradient(cx - 64, 0, cx + 64, 0);
        bt.addColorStop(0, `rgba(${GR},0.06)`); bt.addColorStop(0.6, `rgba(${GR},0.2)`); bt.addColorStop(1, `rgba(${GR},0.4)`);
        sm.fillStyle = bt; sm.fillRect(cx - 64, 498, 128, 100);
      }

      // ---------- hatching driven by a light model ----------
      const Ld = [-0.55, -0.62, 0.56];
      const shadeAt = (x, y) => {
        // sphere
        let dx = (x - cx) / R, dy = (y - cy) / R, d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          const nzv = Math.sqrt(1 - d2);
          let lam = dx * Ld[0] + dy * Ld[1] + nzv * Ld[2];
          let s = 1 - Math.max(0, lam);
          // reflected light along the lower right rim
          s -= 0.28 * H.smooth(0.8, 1, Math.sqrt(d2)) * H.smooth(0.2, 0.9, dx * 0.6 + dy * 0.8);
          return s;
        }
        // screw base cylinder
        if (y > 488 && y < 600 && Math.abs(x - cx) < 64) {
          const u = (x - cx) / 64;
          let s = 0.35 + 0.55 * u + 0.1;
          const th = ((y - 500) % 24) / 24; // thread grooves
          s += 0.25 * Math.max(0, Math.sin(th * Math.PI * 2 - 1));
          return s;
        }
        // neck
        if (y > 440 && y < 500 && Math.abs(x - cx) < 66 - (y - 440) * 0.05) return 0.5 + 0.5 * (x - cx) / 66;
        return -1;
      };
      const hatchPass = (ang, sp, thr, a, w, seed, t0, t1) => {
        const rr = H.rng(seed), ca = Math.cos(ang), sa = Math.sin(ang);
        const ext = 520, oMax = -250 + 500 * H.ease.inOut(win(t0, t1));
        for (let o = -ext; o < ext; o += sp * (0.8 + rr() * 0.4)) {
          if (o > oMax) break;
          // line through (cx,cy+60) offset o along normal
          const ox = cx - sa * o, oy = cy + 120 + ca * o;
          let run = [];
          const flush = () => {
            if (run.length > 4) {
              // break long runs into hand-length flicks
              let i = 0;
              while (i < run.length - 3) {
                const len = Math.floor(rr.range(9, 26));
                const part = run.slice(i, i + len);
                if (part.length > 3) {
                  const jx = rr.range(-1.5, 1.5), jy = rr.range(-1.5, 1.5);
                  pencil(g, part.map(([x, y]) => [x + jx, y + jy]), w, a * rr.range(0.75, 1.15), seed + i, 0.1, 0.45, nz);
                }
                i += len - Math.floor(rr.range(0, 3));
              }
            }
            run = [];
          };
          for (let s = -ext; s < ext; s += 3) {
            const x = ox + ca * s, y = oy + sa * s;
            const v = shadeAt(x, y);
            const jitter = nz.n2(x * 0.02, y * 0.02) * 0.06;
            if (v > thr + jitter) run.push([x, y]); else flush();
          }
          flush();
        }
      };
      PH = null; GATE = 1;
      hatchPass(-0.85, 7.0, 0.34, 0.5, 1.5, 101, 2.0, 2.9);
      hatchPass(0.32, 7.8, 0.6, 0.48, 1.45, 202, 2.6, 3.3);
      hatchPass(-1.4, 8.5, 0.8, 0.5, 1.4, 303, 3.0, 3.6);
      { // pencil follows the hatching sweep
        const ph = [[2.0, 2.9, -0.85], [2.6, 3.3, 0.32], [3.0, 3.6, -1.4]].filter(([a, b]) => t > a && t < b).pop();
        if (ph) { const u = win(ph[0], ph[1]), o = -250 + 500 * H.ease.inOut(u), ca = Math.cos(ph[2]), sa = Math.sin(ph[2]), s0 = -120 * sa + 40 + Math.sin(t * 40) * 45; TIP = [cx - sa * o + ca * s0, cy + 120 + ca * o + sa * s0]; const dx = TIP[0] - cx, dy = TIP[1] - cy, dd = Math.hypot(dx, dy), lim = R - 14; if (dd > lim) TIP = [cx + dx / dd * lim, cy + dy / dd * lim]; }
      }

      // lift the glass highlight with a kneaded eraser
      const lift = (c, alpha) => {
        c.save(); c.globalCompositeOperation = 'destination-out';
        c.translate(cx - 82, cy - 86); c.rotate(-0.7);
        const hg = c.createRadialGradient(0, 0, 4, 0, 0, 46), la = alpha * win(3.55, 3.9);
        hg.addColorStop(0, `rgba(0,0,0,${la})`); hg.addColorStop(0.7, `rgba(0,0,0,${la * 0.8})`); hg.addColorStop(1, 'rgba(0,0,0,0)');
        c.scale(1, 0.45); c.fillStyle = hg; c.beginPath(); c.arc(0, 0, 46, 0, 7); c.fill();
        c.restore();
        c.save(); c.globalCompositeOperation = 'destination-out';
        c.beginPath(); c.arc(cx, cy, 77, 0, 7); c.fillStyle = `rgba(0,0,0,${alpha * 0.9})`; c.fill();
        c.restore();
      };
      lift(g, 0.92); lift(sm, 0.85);
      seq(0.75, 0.03);

      // ---------- confident contours ----------
      const contour = (pts, s, a = 0.75, w = 2.0, passes = 2) => {
        for (let k = 0; k < passes; k++) {
          const P = wob(seg(pts), nz, s + k * 17, 0.9 + k * 0.4, 0.012);
          pencil(g, P.map(([x, y]) => [x + k * 0.8, y + k * 0.6]), w * (k ? 0.7 : 1), a * (k ? 0.55 : 1), s + k, 0.08, 0.15, nz);
        }
      };
      // bulb: big arc from neck-left around top to neck-right
      const aL = Math.PI / 2 + Math.asin(62 / R), aR = Math.PI / 2 - Math.asin(62 / R);
      contour(ell(cx, cy, R, R, aL, aR + Math.PI * 2), 40, 0.75, 2.4);
      // heavier accent on the shadow side
      contour(ell(cx, cy, R + 1, R + 1, -0.3, 1.25), 41, 0.75, 2.8, 1);
      // neck curves
      const nyB = cy + Math.sqrt(R * R - 62 * 62);
      contour(bez([cx - 62, nyB], [cx - 58, nyB + 14], [cx - 66, 478], [cx - 64, 498]), 42, 0.7, 2);
      contour(bez([cx + 62, nyB], [cx + 58, nyB + 14], [cx + 66, 478], [cx + 64, 498]), 43, 0.8, 2.3);
      // screw threads
      for (let k = 0; k < 5; k++) {
        const y = 500 + k * 22;
        contour(ell(cx, y, 64 - k * 0.6, 12, 0.1, Math.PI - 0.1), 50 + k, 0.62, 1.8, 1);
        contour(ell(cx, y + 11, 66 - k * 0.6, 12, 0.05, Math.PI - 0.05), 60 + k, 0.4, 1.3, 1);
      }
      contour([[cx - 64, 498], [cx - 61, 598]], 70, 0.6, 1.8);
      contour([[cx + 64, 498], [cx + 61, 598]], 71, 0.8, 2.4);
      contour(bez([cx - 60, 606], [cx - 46, 622], [cx - 30, 626], [cx - 22, 628]), 72, 0.7, 2);
      contour(bez([cx + 60, 606], [cx + 46, 622], [cx + 30, 626], [cx + 22, 628]), 73, 0.8, 2.2);
      contour(ell(cx, 630, 22, 8, 0, Math.PI), 74, 0.85, 2.6, 1);
      // filament supports up into the gear
      contour([[cx - 14, 498], [cx - 18, 420], [cx - 30, 362]], 75, 0.55, 1.4, 1);
      contour([[cx + 14, 498], [cx + 18, 420], [cx + 32, 362]], 76, 0.6, 1.4, 1);
      contour([[cx, 500], [cx, 376]], 77, 0.45, 1.3, 1);

      // gear inside the bulb
      const teeth = 11, Ro = 76, Ri = 63;
      const gp = [];
      for (let i = 0; i <= teeth * 4; i++) {
        const k = i % 4, base = Math.floor(i / 4) * (Math.PI * 2 / teeth) + 0.2;
        const a = base + [0, 0.07, 0.24, 0.31][k] * (Math.PI * 2 / teeth) * 1.6;
        const rr = k === 1 || k === 2 ? Ro : Ri;
        gp.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      contour(gp, 80, 0.8, 1.9);
      contour(ell(cx, cy, 44, 44, 0.3, 6.7), 81, 0.6, 1.6);
      contour(ell(cx, cy, 15, 15, 1, 7.4), 82, 0.85, 2.2, 1);
      for (let k = 0; k < 3; k++) {
        const a = k * 2.094 + 0.5;
        contour([[cx + Math.cos(a) * 17, cy + Math.sin(a) * 17], [cx + Math.cos(a) * 43, cy + Math.sin(a) * 43]], 83 + k, 0.6, 1.5, 1);
      }
      // gear shading (lower right of ring), tight hatching
      {
        const rr = H.rng(404);
        const nG = Math.floor(120 * win(3.3, 3.6));
        PH = null; GATE = 1;
        for (let i = 0; i < nG; i++) {
          const a = rr.range(-0.4, 2.0), rad = rr.range(46, 74);
          const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
          pencil(g, seg([[x - 5, y + 6], [x + 5, y - 6]], 2), 1.3, 0.55, 900 + i, 0.1, 0.4, nz);
        }
      }

      // ---------- gear study, top right ----------
      const gx = 1052, gy = 205;
      seq(3.6, 0.035);
      con([[gx - 110, gy], [gx + 110, gy]], 90, 0.13);
      con([[gx, gy - 105], [gx, gy + 105]], 91, 0.13);
      con(ell(gx, gy, 82, 82, 0, 6.5), 92, 0.12);
      con(ell(gx, gy, 66, 66, 0, 6.5), 93, 0.11);
      con([[gx - 80, gy - 80], [gx + 80, gy + 80]], 94, 0.08);
      // half-finished: teeth only along the top arc
      const tp = [];
      for (let i = 0; i <= 7 * 4; i++) {
        const k = i % 4, base = -Math.PI - 0.1 + Math.floor(i / 4) * (Math.PI * 2 / 14);
        const a = base + [0, 0.12, 0.38, 0.5][k] * (Math.PI * 2 / 14);
        tp.push([gx + Math.cos(a) * (k === 1 || k === 2 ? 82 : 66), gy + Math.sin(a) * (k === 1 || k === 2 ? 82 : 66)]);
      }
      contour(tp, 95, 0.62, 1.6);
      contour(ell(gx, gy, 22, 22, 0.4, 6.8), 96, 0.6, 1.6, 1);

      seq(3.95, 0.006);
      // ---------- thumbnails (quick variants) ----------
      const thumb = (tx, ty, sc, s, variant) => {
        con(ell(tx, ty, 44 * sc, 44 * sc, 0, 6.6), s, 0.22);
        con([[tx, ty - 60 * sc], [tx, ty + 110 * sc]], s + 1, 0.18);
        if (variant === 0) contour(ell(tx, ty, 44 * sc, 44 * sc, 2.1, 7.32), s + 2, 0.6, 1.5, 1);
        else {
          contour(bez([tx - 22 * sc, ty + 38 * sc], [tx - 70 * sc, ty - 20 * sc], [tx - 30 * sc, ty - 62 * sc], [tx, ty - 60 * sc]), s + 2, 0.6, 1.5, 1);
          contour(bez([tx, ty - 60 * sc], [tx + 30 * sc, ty - 62 * sc], [tx + 70 * sc, ty - 20 * sc], [tx + 22 * sc, ty + 38 * sc]), s + 9, 0.6, 1.5, 1);
        }
        contour([[tx - 22 * sc, ty + 38 * sc], [tx - 20 * sc, ty + 80 * sc], [tx + 20 * sc, ty + 80 * sc], [tx + 22 * sc, ty + 38 * sc]], s + 3, 0.6, 1.4, 1);
        for (let k = 0; k < 3; k++) contour([[tx - 21 * sc, ty + (50 + k * 10) * sc], [tx + 21 * sc, ty + (52 + k * 10) * sc]], s + 4 + k, 0.45, 1.1, 1);
        const rr = H.rng(s);
        for (let i = 0; i < 16; i++) {
          const a = rr.range(-0.5, 1.4), rad = rr.range(20, 42) * sc;
          const x = tx + Math.cos(a) * rad, y = ty + Math.sin(a) * rad;
          pencil(g, seg([[x - 6, y + 7], [x + 6, y - 7]], 2), 1.2, 0.45, s * 10 + i, 0.1, 0.4, nz);
        }
      };
      thumb(232, 300, 1.0, 600, 0);
      thumb(232, 500, 1.0, 620, 1);
      con([[160, 216], [310, 214], [312, 620], [158, 622], [160, 210]], 640, 0.2);

      // ---------- value scale ----------
      {
        const vx = 905, vy = 588, bw = 52;
        for (let k = 0; k < 5; k++) {
          contour([[vx + k * bw, vy], [vx + k * bw + bw, vy + 1]], 700 + k, 0.45, 1.1, 1);
          contour([[vx + k * bw, vy + 40], [vx + k * bw + bw, vy + 41]], 710 + k, 0.45, 1.1, 1);
          contour([[vx + k * bw, vy - 2], [vx + k * bw + 1, vy + 43]], 720 + k, 0.45, 1.1, 1);
          const rr = H.rng(730 + k), dens = [0, 9, 6, 4.2, 3][k];
          if (dens) for (let o = 4; o < bw + 36; o += dens) {
            const x0 = vx + k * bw + o, pts = [];
            for (let q = 0; q <= 14; q++) { const u = q / 14; pts.push([x0 - u * 40, vy + 3 + u * 35]); }
            const clipped = pts.filter(([x]) => x > vx + k * bw + 2 && x < vx + k * bw + bw - 2);
            if (clipped.length > 2) pencil(g, clipped, 1.3, 0.35 + k * 0.1, 740 + k * 50 + o, 0.05, 0.2, nz);
            if (k >= 3 && clipped.length > 2) pencil(g, clipped.map(([x, y]) => [2 * (vx + k * bw) + bw - x, y]), 1.2, 0.4, 760 + o, 0.05, 0.2, nz);
          }
        }
        contour([[vx + bw * 5, vy - 2], [vx + bw * 5 + 1, vy + 42]], 729, 0.45, 1.1, 1);
      }

      // ---------- lettering ----------
      const write = (str, x, y, font, a, rot, seed, t0 = 0, t1 = 0.001) => {
        g.save(); g.font = font; g.translate(x, y); g.rotate(rot);
        const rr = H.rng(seed); let px = 0;
        const nCh = Math.ceil(str.length * win(t0, t1));
        if (nCh > 0 && nCh < str.length) { const ww = g.measureText(str.slice(0, nCh)).width; TIP = [x + Math.cos(rot) * ww, y + Math.sin(rot) * ww - 8]; }
        let ci = 0;
        for (const ch of str) {
          if (ci++ >= nCh) break;
          const w = g.measureText(ch).width;
          g.fillStyle = `rgba(${GR},${a * rr.range(0.8, 1.05)})`;
          g.save(); g.translate(px, rr.range(-1, 1)); g.rotate(rr.range(-0.03, 0.03)); g.fillText(ch, 0, 0); g.restore();
          px += w;
        }
        g.restore();
        return px;
      };
      PH = null;
      const tw = write('the idea engine', 130, 104, '700 56px "Caveat"', 0.82, -0.025, 7, 4.25, 4.75);
      GATE = win(4.75, 4.85);
      pencil(g, wob(seg([[128, 120], [128 + 290 * 0.98, 113]]), nz, 300, 1.6, 0.01), 1.6, 0.55, 300, 0.05, 0.4, nz);
      GATE = 1;
      write('sketch no. 14', 134, 148, '400 26px "Caveat"', 0.5, -0.02, 8, 4.85, 5.0);
      // margin note with arrow to the gear
      write('more teeth?', 880, 420, '400 34px "Caveat"', 0.72, -0.05, 10, 3.9, 4.1);
      write('make it spin!', 892, 456, '400 34px "Caveat"', 0.72, -0.04, 11, 4.1, 4.25);
      seq(3.75, 0.04);
      contour(bez([872, 412], [800, 400], [740, 360], [688, 330]), 97, 0.6, 1.5, 1);
      contour([[688, 330], [702, 330]], 98, 0.6, 1.5, 1);
      contour([[688, 330], [697, 341]], 99, 0.6, 1.5, 1);
      PH = null;
      write('14T?', gx - 26, gy + 128, '400 30px "Caveat"', 0.6, 0.02, 12, 3.85, 3.9);
      write('A', 166, 258, '700 30px "Caveat"', 0.6, 0, 13, 4.0, 4.02);
      write('B', 166, 458, '700 30px "Caveat"', 0.6, 0, 14, 4.12, 4.14);
      write('values', 905, 656, '400 26px "Caveat"', 0.55, 0.01, 15, 4.22, 4.3);

      // ---------- eraser passes (partial lifts) ----------
      {
        const er = (x, y, len, ang, wd, a) => {
          [g, sm].forEach((c) => {
            c.save(); c.globalCompositeOperation = 'destination-out'; c.lineCap = 'round';
            c.strokeStyle = `rgba(0,0,0,${a * win(3.45, 3.6)})`; c.lineWidth = wd; c.translate(x, y); c.rotate(ang);
            c.beginPath(); c.moveTo(-len / 2, 0); c.quadraticCurveTo(0, 4, len / 2, -2); c.stroke();
            c.restore();
          });
          // smeared graphite left at the edges of the eraser path
          sm.save(); sm.translate(x, y); sm.rotate(ang); sm.filter = 'blur(3px)';
          sm.strokeStyle = `rgba(${GR},${0.07 * win(3.45, 3.6)})`; sm.lineWidth = wd * 1.4; sm.lineCap = 'round';
          sm.beginPath(); sm.moveTo(-len / 2, 0); sm.quadraticCurveTo(0, 4, len / 2, -2); sm.stroke(); sm.restore();
        };
        er(cx + 6, 96, 90, 0.08, 16, 0.78);
        er(cx + 250, cy - 6, 70, -0.05, 14, 0.7);
        er(cx - 250, cy + 4, 60, 0.1, 18, 0.6);
        er(cx - 150, cy + 150, 80, 0.6, 14, 0.55);
      }

      // ---------- tooth: graphite only bites the paper's peaks ----------
      {
        const tooth = new Float32Array(W * H_);
        const tc = H.layer(W, H_), tx = tc.getContext('2d');
        const small = H.layer(W / 2, H_ / 2), sx = small.getContext('2d');
        const id = sx.createImageData(W / 2, H_ / 2), rr = H.rng(5);
        for (let i = 0; i < id.data.length; i += 4) { const v = rr() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
        sx.putImageData(id, 0, 0);
        tx.imageSmoothingEnabled = true; tx.drawImage(small, 0, 0, W, H_);
        const td = tx.getImageData(0, 0, W, H_).data, r2 = H.rng(6);
        for (let i = 0, j = 0; i < tooth.length; i++, j += 4) tooth[i] = td[j] / 255 * 0.65 + r2() * 0.35;
        const apply = (c, hard) => {
          const im = c.getImageData(0, 0, W, H_), d = im.data;
          for (let i = 0, j = 3; i < tooth.length; i++, j += 4) {
            const a = d[j] / 255; if (!a) continue;
            const need = 1 - Math.min(1, a * hard);            // light pressure -> only peaks catch
            const k = H.clamp((tooth[i] - need * 0.75) * 3.2 + 0.15);
            d[j] = 255 * a * (0.25 + 0.75 * k);
          }
          c.putImageData(im, 0, 0);
        };
        apply(g, 1.4); apply(sm, 2.2);
      }
      ctx.save(); ctx.globalAlpha = H.smooth(2.2, 3.7, t); ctx.drawImage(S, 0, 0); ctx.restore();
      ctx.drawImage(L, 0, 0);

      // ---------- eraser crumbs ----------
      {
        const rr = H.rng(808);
        for (let i = 0; i < (t > 3.6 ? 9 : 0); i++) {
          const x = rr.range(360, 480), y = rr.range(600, 680), l = rr.range(9, 18), a = rr.range(0, 3);
          ctx.save(); ctx.translate(x, y); ctx.rotate(a);
          ctx.fillStyle = 'rgba(60,40,30,0.22)'; ctx.beginPath(); ctx.ellipse(1.5, 2.5, l / 2, 3.4, 0, 0, 7); ctx.fill();
          const cg = ctx.createLinearGradient(0, -3, 0, 3); cg.addColorStop(0, '#e9d7cf'); cg.addColorStop(1, '#a99791');
          ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(0, 0, l / 2, 3.1, 0, 0, 7); ctx.fill();
          ctx.fillStyle = 'rgba(70,70,80,0.35)'; ctx.beginPath(); ctx.ellipse(l * 0.1, 0.6, l / 4, 1, 0, 0, 7); ctx.fill();
          ctx.restore();
        }
      }

      // ---------- spiral binding ----------
      for (let y = 22; y < H_; y += 34) {
        // punched hole (shows the desk)
        ctx.fillStyle = '#2b2520'; ctx.beginPath(); ctx.ellipse(PX + 22, y, 6, 7.5, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(PX + 22, y + 0.8, 6, 7.5, 0, 0.2, 2.9); ctx.stroke();
        // coil shadow on page
        ctx.strokeStyle = 'rgba(40,30,20,0.25)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(PX + 24, y + 5); ctx.quadraticCurveTo(PX - 6, y + 2, PX - 22, y + 12); ctx.stroke();
        // wire
        const wg = ctx.createLinearGradient(0, y - 6, 0, y + 6);
        wg.addColorStop(0, '#f2f2f2'); wg.addColorStop(0.45, '#9a9ca0'); wg.addColorStop(1, '#3e3f42');
        ctx.strokeStyle = wg; ctx.lineWidth = 4.2;
        ctx.beginPath(); ctx.moveTo(PX + 22, y - 2); ctx.quadraticCurveTo(PX - 4, y - 14, PX - 26, y + 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PX + 16, y - 6); ctx.quadraticCurveTo(PX - 4, y - 14, PX - 20, y - 6); ctx.stroke();
      }

      // ---------- the pencil in hand while drawing ----------
      if (TIP && t < 5.0) {
        const [tx, ty] = TIP, ang = 0.72, len = 300;
        ctx.save();
        ctx.save(); ctx.filter = 'blur(7px)'; ctx.fillStyle = 'rgba(50,35,15,0.28)';
        ctx.translate(tx + 22, ty + 26); ctx.rotate(ang + 0.05); ctx.beginPath(); ctx.roundRect(30, -8, len, 16, 6); ctx.fill(); ctx.restore();
        ctx.translate(tx, ty); ctx.rotate(ang);
        ctx.fillStyle = '#2c2c30'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12, -2.6); ctx.lineTo(12, 2.6); ctx.closePath(); ctx.fill();
        const wg = ctx.createLinearGradient(0, -8, 0, 8); wg.addColorStop(0, '#f1d9b0'); wg.addColorStop(1, '#b98e5a');
        ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(11, -2.8); ctx.lineTo(40, -8); ctx.lineTo(40, 8); ctx.lineTo(11, 2.8); ctx.closePath(); ctx.fill();
        const bg = ctx.createLinearGradient(0, -8, 0, 8); bg.addColorStop(0, '#5f8c6a'); bg.addColorStop(0.35, '#2f5a3c'); bg.addColorStop(0.36, '#24472f'); bg.addColorStop(1, '#16301f');
        ctx.fillStyle = bg; ctx.fillRect(40, -8, len - 40, 16);
        ctx.fillStyle = 'rgba(220,190,110,0.8)'; ctx.font = '600 8px "IBM Plex Mono", monospace'; ctx.fillText('2B', 120, -1);
        ctx.restore();
      }

      // ---------- slow pull-back of the camera over the build ----------
      {
        const k = 1 + 0.05 * (1 - H.ease.inOut(win(0, 5.2)));
        if (k > 1.0005) {
          const cv = ctx.canvas, snap = H.layer(cv.width, cv.height);
          snap.getContext('2d').drawImage(cv, 0, 0);
          ctx.save(); ctx.translate(W * 0.47, H_ * 0.45); ctx.scale(k, k); ctx.translate(-W * 0.47, -H_ * 0.45);
          ctx.drawImage(snap, 0, 0, W, H_); ctx.restore();
        }
      }
      H.grain(ctx, W, H_, 0.035, 3 + (Math.floor(t * 12) % 3));
      H.vignette(ctx, W, H_, 0.22, '40,28,10');
    },
    // >>>EXPLAINER
    explainerDuration: 15,
    explainerNote: 'A pencil works across a wide sketchbook spread (faint construction pass first, then a firm contour, crescent hatching for form) while the camera follows, then the page physically turns to a fresh sheet for the progress chart; numbers are pencilled and re-pencilled as they count.',
    explainer(ctx, W, H_, t) {
      const nz = H.makeNoise(23);
      const D = [2560, 640];
      const TURN0 = 10.35, TURN1 = 11.0;
      const L = {
        D, pT: 11.05, kT: 13.05, modelName: 'the model',
        model: (cx, cy, adj, push, api, tt) => {
          const g = 'M', by = cy - 35, R = 118;
          const aL = Math.PI / 2 + Math.asin(55 / R), aR = Math.PI / 2 - Math.asin(55 / R);
          api.line(XE.circ(cx, by, R, R, aL, aR + Math.PI * 2), 'ink', 5, 2.5, 2.85, g);
          const ny = by + Math.sqrt(R * R - 55 * 55);
          api.line([[cx - 55, ny], [cx - 52, cy + 110]], 'ink', 4.5, 2.85, 2.92, g);
          api.line([[cx + 55, ny], [cx + 52, cy + 110]], 'ink', 4.5, 2.92, 2.99, g);
          for (let k = 0; k < 3; k++) api.line([[cx - 54, cy + 112 + k * 18], [cx + 54, cy + 116 + k * 18]], 'ink', 4, 2.99 + k * 0.03, 3.03 + k * 0.03, g);
          api.line([[cx - 40, cy + 166], [cx, cy + 176], [cx + 40, cy + 166]], 'ink', 4, 3.1, 3.15, g);
          // gear inside the bulb: it turns as the model adjusts
          const rot = adj * 1.6 + (tt > 9.0 && tt < 9.6 ? 0 : 0), gp = [], teeth = 10, Ro = 60, Ri = 48;
          for (let i = 0; i <= teeth * 4; i++) {
            const k = i % 4, base = Math.floor(i / 4) * (Math.PI * 2 / teeth) + rot;
            const a = base + [0, 0.07, 0.24, 0.31][k] * (Math.PI * 2 / teeth) * 1.6, r = k === 1 || k === 2 ? Ro : Ri;
            gp.push([cx + Math.cos(a) * r, by + Math.sin(a) * r]);
          }
          if (adj > 0) push({ k: 'line', pts: gp, role: adj < 1 ? 'acc2' : 'ink', w: 4, a: -1, b: 0, inst: true, g });
          else api.line(gp, 'ink', 4, 3.15, 3.4, g);
          api.line(XE.circ(cx, by, 16, 16, 0.4, 6.8), 'ink', 4, 3.35, 3.42, g);
          // two tuning dials either side of the base
          [-1, 1].forEach((s, i) => {
            const x = cx + s * 120, y = cy + 135;
            api.line(XE.circ(x, y, 24, 24, -1.2, 5.2), 'ink', 4, 3.2 + i * 0.06, 3.3 + i * 0.06, g);
            if (tt > 3.32 + i * 0.06) {
              const a0 = [-2.4, -0.6][i], a1 = [-0.7, -2.2][i], a = a0 + (a1 - a0) * adj + Math.sin(adj * Math.PI) * 0.3;
              push({ k: 'line', pts: [[x, y], [x + Math.cos(a) * 19, y + Math.sin(a) * 19]], role: adj > 0 && adj < 1 ? 'acc2' : 'ink', w: 4.5, a: -1, b: 0, inst: true, g });
            }
          });
        },
      };
      const items = XE.story(t, L);
      { // smooth the progress curve's per-round jitter into a hand-drawn rise (same points, same timing)
        const ci = items.find((it) => it.g === 'D' && it.k === 'line' && it.role === 'acc1' && it.pts.length > 30);
        if (ci) {
          let P = ci.pts;
          for (const kk of [[1 / 3, 1 / 3, 1 / 3], [0.25, 0.5, 0.25]]) P = P.map((q, j) => (j === 0 || j === P.length - 1 ? q : [P[j - 1][0] * kk[0] + q[0] * kk[1] + P[j + 1][0] * kk[2], P[j - 1][1] * kk[0] + q[1] * kk[1] + P[j + 1][1] * kk[2]]));
          ci.pts = P;
        }
      }
      const camKeys = [[0, 590, 360, 1.0], [2.0, 610, 362, 1.04], [2.8, 1830, 610, 0.95], [5.95, 1860, 620, 0.97], [6.55, 2580, 640, 0.9], [10.35, 2600, 645, 0.93],
        [11.0, 2560, 660, 0.92], [12.9, 2570, 670, 0.95], [13.6, 2560, 760, 0.88], [15, 2560, 760, 0.9]];
      const cam = XE.camAt(camKeys, Math.min(t, TURN0));   // page 1 freezes once the page starts turning
      const cam2 = XE.camAt(camKeys, Math.max(t, TURN0 + 0.3));

      if (!XC.page) { const pl = H.layer(1100, 620), pc = pl.getContext('2d'); H.paper(pc, 1100, 620, '#efe6d2', 31, 0.025); XC.page = pl; }
      const GR = '38,38,44';
      // ---- static, page-anchored caches: paper tooth (as a lookup tile + a grain pattern) ----
      if (!XC.tooth) {
        const TS = 512, T = new Float32Array(TS * TS);
        for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
          let h = Math.imul(x, 374761393) + Math.imul(y, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); h = ((h ^ (h >>> 16)) >>> 0) / 4294967296;
          T[y * TS + x] = h * 0.4 + (nz.n2(x * 0.35, y * 0.35) * 0.5 + 0.5) * 0.6;
        }
        XC.tooth = T;
        const tc = H.layer(256, 256), tx = tc.getContext('2d'), id = tx.createImageData(256, 256);
        for (let i = 0; i < 256 * 256; i++) id.data[i * 4 + 3] = 255 * H.clamp((T[((i >> 8) << 9) | (i & 255)] - 0.42) * 2.4);
        tx.putImageData(id, 0, 0); XC.toothCv = tc;
      }
      // ---- world-space sprites (built once, then placed with the camera transform) ----
      // tooth(af, wx, wy): graphite alpha after the paper's peaks take it (wx, wy in page units)
      const toothK = (af, ti) => { const need = 1 - Math.min(1, af * 1.4); return 0.3 + 0.7 * H.clamp((XC.tooth[ti] - need * 0.75) * 3.2 + 0.15); };
      const sprite = (key, x0, y0, w, h, fn, tooth = true) => {
        const S = XC.spr || (XC.spr = {});
        if (!S[key]) {
          const cw = Math.ceil(w), ch = Math.ceil(h), cv = H.layer(cw, ch), c = cv.getContext('2d');
          c.translate(-x0, -y0); const ph = PH, ga = GATE; PH = null; GATE = 1; fn(c); PH = ph; GATE = ga;
          if (tooth) { // bake the page-anchored tooth in once, so the per-frame pass can skip these pixels
            const id = c.getImageData(0, 0, cw, ch), d = id.data;
            for (let y = 0, i = 3; y < ch; y++) {
              const row = (((y0 + y) * 1.4 | 0) & 511) << 9;
              for (let x = 0; x < cw; x++, i += 4) if (d[i]) d[i] = d[i] * toothK(d[i] / 255, row | (((x0 + x) * 1.4 | 0) & 511));
            }
            c.putImageData(id, 0, 0);
          }
          S[key] = { cv, x0, y0 };
        }
        return S[key];
      };
      const putS = (c, s) => c.drawImage(s.cv, s.x0, s.y0);
      // hero-style hatching: parallel lines through a pivot, kept where shade() > threshold, broken into hand-length flicks
      const hatchW = (c, shade, px, py, ang, sp, thr, a, w, seed, ext) => {
        const rr = H.rng(seed), ca = Math.cos(ang), sa = Math.sin(ang);
        for (let o = -ext; o < ext; o += sp * (0.8 + rr() * 0.4)) {
          const ox = px - sa * o, oy = py + ca * o; let run = [];
          const flush = () => {
            if (run.length > 4) {
              let i = 0;
              while (i < run.length - 3) {
                const len = Math.floor(rr.range(8, 22)), part = run.slice(i, i + len);
                if (part.length > 3) { const jx = rr.range(-1.4, 1.4), jy = rr.range(-1.4, 1.4); pencil(c, part.map(([x, y]) => [x + jx, y + jy]), w, a * rr.range(0.75, 1.15), seed + i, 0.1, 0.45, nz); }
                i += len - Math.floor(rr.range(0, 3));
              }
            }
            run = [];
          };
          for (let s = -ext; s < ext; s += 3) {
            const x = ox + ca * s, y = oy + sa * s;
            if (shade(x, y) > thr + nz.n2(x * 0.02, y * 0.02) * 0.06) run.push([x, y]); else flush();
          }
          flush();
        }
      };
      // reveal a sprite behind a hatch-direction sweep (u 0..1)
      const sweep = (c, s, px, py, ang, u, lo, hi) => {
        if (u <= 0) return;
        c.save();
        if (u < 1) { c.translate(px, py); c.rotate(ang); c.beginPath(); c.rect(-900, lo - 900, 1800, 900 + (hi - lo) * u); c.rotate(-ang); c.translate(-px, -py); c.clip(); }
        putS(c, s); c.restore();
      };
      // two-pass contour with pressure: heavier on the shadow (lower-right) side, lighter where the light hits
      const pstroke = (c, P, w, a, seed, gate, bb, inst) => {
        const N = P.length; if (N < 2 || gate <= 0) return;
        const n = gate < 1 ? Math.max(2, Math.ceil(N * gate)) : N;
        const mx = (bb[0] + bb[1]) / 2, my = (bb[2] + bb[3]) / 2, hx = Math.max(30, (bb[1] - bb[0]) / 2), hy = Math.max(30, (bb[3] - bb[2]) / 2);
        c.lineCap = 'butt'; c.lineJoin = 'round';
        for (let k = 0; k < (inst ? 1 : 2); k++) {
          const dx = k ? 0.9 : 0, dy = k ? 0.7 : 0, wk = k ? 0.6 : 1, ak = k ? 0.42 : 1;
          for (let i = 0; i < n - 1; i += 3) {
            const u = i / (N - 1);
            let pr = Math.min(1, u / 0.08, (1 - u) / 0.15); pr = 0.3 + 0.7 * Math.sqrt(Math.max(0, pr));
            const x = P[i][0], y = P[i][1];
            const side = H.clamp((x - mx) / hx * 0.6 + (y - my) / hy * 0.8, -1, 1);
            const press = 0.8 + 0.24 * side + 0.14 * nz.n2(i * 0.05 + k * 3.1, seed * 0.11);
            c.strokeStyle = `rgba(${GR},${Math.min(1, a * ak * pr * press)})`;
            c.lineWidth = w * wk * (0.5 + 0.5 * pr) * (0.75 + 0.4 * press);
            c.beginPath(); c.moveTo(x + dx, y + dy); c.lineTo(P[i + 1][0] + dx, P[i + 1][1] + dy);
            if (i + 2 < n) c.lineTo(P[i + 2][0] + dx, P[i + 2][1] + dy);
            if (i + 3 < n) c.lineTo(P[i + 3][0] + dx, P[i + 3][1] + dy);
            c.stroke();
          }
        }
      };
      // ---- the model bulb (geometry mirrors L.model): hatching + stump tone, lit from the top-left ----
      const MX = 2250, MY = 640, BBX = MX, BBY = MY - 35, BR = 118, Ld = [-0.55, -0.62, 0.56];
      const bulbShade = (x, y) => {
        if (Math.hypot(x - BBX, y - BBY) < 68) return -1; // the gear stays clean (lifted with the eraser)
        const dx = (x - BBX) / BR, dy = (y - BBY) / BR, d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          const lam = dx * Ld[0] + dy * Ld[1] + Math.sqrt(1 - d2) * Ld[2];
          return 1 - Math.max(0, lam) - 0.28 * H.smooth(0.8, 1, Math.sqrt(d2)) * H.smooth(0.2, 0.9, dx * 0.6 + dy * 0.8);
        }
        if (y < MY + 110 && y > BBY + 90 && Math.abs(x - BBX) < 53) return 0.45 + 0.5 * (x - BBX) / 55;
        if (y >= MY + 110 && y < MY + 166 && Math.abs(x - BBX) < 52) {
          const th = ((y - (MY + 112)) % 18) / 18;
          return 0.42 + 0.55 * (x - BBX) / 54 + 0.25 * Math.max(0, Math.sin(th * Math.PI * 2 - 1));
        }
        return -1;
      };
      const BH = [[-0.85, 6.4, 0.34, 0.5, 1.4, 101, 3.42, 3.9], [0.32, 7.0, 0.6, 0.48, 1.35, 202, 3.75, 4.15], [-1.4, 7.8, 0.8, 0.52, 1.3, 303, 3.98, 4.37]];
      const bulbSpr = BH.map((p, i) => sprite('bh' + i, BBX - 140, BBY - 140, 280, 345, (c) => {
        hatchW(c, bulbShade, BBX, BBY + 60, p[0], p[1], p[2], p[3], p[4], p[5], 250);
        c.save(); c.globalCompositeOperation = 'destination-out'; c.translate(BBX - 56, BBY - 59); c.rotate(-0.7); c.scale(1, 0.45);
        const hg = c.createRadialGradient(0, 0, 3, 0, 0, 34); hg.addColorStop(0, 'rgba(0,0,0,0.95)'); hg.addColorStop(0.7, 'rgba(0,0,0,0.75)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = hg; c.beginPath(); c.arc(0, 0, 34, 0, 7); c.fill(); c.restore();
      }));
      const bulbTone = sprite('bt', BBX - 140, BBY - 140, 410, 410, (c) => {
        c.save(); c.translate(BBX + 88, MY + 177); c.scale(1, 0.12); // soft cast shadow, lower right
        const cs = c.createRadialGradient(0, 0, 8, 0, 0, 170); cs.addColorStop(0, `rgba(${GR},0.5)`); cs.addColorStop(0.55, `rgba(${GR},0.2)`); cs.addColorStop(1, `rgba(${GR},0)`);
        c.fillStyle = cs; c.beginPath(); c.arc(0, 0, 170, 0, 7); c.fill(); c.restore();
        c.save(); c.beginPath(); c.arc(BBX, BBY, BR, 0, 7); c.clip(); // stump-blended sphere tone
        const gg = c.createRadialGradient(BBX - 48, BBY - 55, 14, BBX + 14, BBY + 14, BR * 1.15);
        gg.addColorStop(0, `rgba(${GR},0)`); gg.addColorStop(0.55, `rgba(${GR},0.1)`); gg.addColorStop(0.85, `rgba(${GR},0.32)`); gg.addColorStop(1, `rgba(${GR},0.2)`);
        c.fillStyle = gg; c.fillRect(BBX - BR, BBY - BR, BR * 2, BR * 2); c.restore();
        const nt = c.createLinearGradient(BBX - 54, 0, BBX + 54, 0);
        nt.addColorStop(0, `rgba(${GR},0.04)`); nt.addColorStop(0.6, `rgba(${GR},0.16)`); nt.addColorStop(1, `rgba(${GR},0.34)`);
        c.fillStyle = nt; c.fillRect(BBX - 53, BBY + 100, 106, MY + 168 - (BBY + 100));
        c.globalCompositeOperation = 'destination-out';
        c.beginPath(); c.arc(BBX, BBY, 66, 0, 7); c.fillStyle = 'rgba(0,0,0,0.85)'; c.fill();
        c.translate(BBX - 56, BBY - 59); c.rotate(-0.7); c.scale(1, 0.45);
        const hg = c.createRadialGradient(0, 0, 3, 0, 0, 36); hg.addColorStop(0, 'rgba(0,0,0,0.9)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = hg; c.beginPath(); c.arc(0, 0, 36, 0, 7); c.fill();
      }, false);
      // soft graphite shadow under a card (stretched to each shape's box)
      const cardSh = sprite('csh', 0, 0, 200, 200, (c) => { c.filter = 'blur(9px)'; c.fillStyle = `rgba(${GR},1)`; c.beginPath(); c.roundRect(40, 40, 120, 120, 14); c.fill(); c.filter = 'none'; }, false);
      // crescent hatching on the shadow side inside a closed shape: two crossing passes, darker at the edge
      const crescent = (it, a0, a1, b0, b1, seed) => sprite('cr' + seed + '_' + (a0 | 0) + '_' + (b0 | 0), a0 - 12, b0 - 12, a1 - a0 + 24, b1 - b0 + 24, (c) => {
        const inside = (dx, dy, fn) => {
          c.save(); c.beginPath(); it.pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
          c.beginPath(); c.rect(a0 - 80, b0 - 80, a1 - a0 + 160, b1 - b0 + 160);
          it.pts.forEach(([x, y], i) => (i ? c.lineTo(x + dx, y + dy) : c.moveTo(x + dx, y + dy))); c.closePath(); c.clip('evenodd');
          fn(); c.restore();
        };
        const ext = (a1 - a0 + b1 - b0) * 0.75, mx = (a0 + a1) / 2, my = (b0 + b1) / 2;
        inside(-22, -19, () => hatchW(c, () => 1, mx, my, -0.82, 5.2, 0, 0.46, 1.3, seed, ext));
        inside(-9, -8, () => hatchW(c, () => 1, mx, my, 0.3, 5.6, 0, 0.42, 1.2, seed + 7, ext));
      });
      // the progress chart on page 2: tone + hatching under the curve, darkest just under the line
      const chartSpr = (ci) => {
        const P = ci.pts, ox = L.D[0] - 380, oy = L.D[1] + 150;
        const cyAt = (x) => { if (x < P[0][0] || x > P[P.length - 1][0]) return null; let i = 1; while (i < P.length - 1 && P[i][0] < x) i++; const a = P[i - 1], b = P[i], u = (x - a[0]) / ((b[0] - a[0]) || 1); return a[1] + (b[1] - a[1]) * u; };
        const shade = (x, y) => { const c0 = cyAt(x); if (c0 == null || y < c0 + 5 || y > oy - 5) return -1; return 1 - (y - c0) / (oy - c0); };
        const hs = sprite('chH', ox, oy - 360, 600, 370, (c) => {
          hatchW(c, shade, ox + 280, oy - 160, -0.85, 7.5, 0.2, 0.34, 1.25, 505, 420);
          hatchW(c, shade, ox + 280, oy - 160, 0.42, 8, 0.62, 0.36, 1.2, 606, 420);
        });
        const ts = sprite('chT', ox, oy - 360, 600, 370, (c) => {
          c.beginPath(); c.moveTo(P[0][0], oy); P.forEach(([x, y]) => c.lineTo(x, y + 3)); c.lineTo(P[P.length - 1][0], oy); c.closePath();
          const lg = c.createLinearGradient(0, oy - 330, 0, oy); lg.addColorStop(0, `rgba(${GR},0.2)`); lg.addColorStop(1, `rgba(${GR},0.02)`);
          c.fillStyle = lg; c.fill();
        }, false);
        return { hs, ts, x0: P[0][0], x1: P[P.length - 1][0] };
      };
      // lettering guide lines + soft dust smears + erased ghosts (all page-anchored)
      const smear = (o, x, y, rx, ry, rot, a) => {
        o.save(); o.translate(x, y); o.rotate(rot); o.scale(1, ry / rx);
        const sg = o.createRadialGradient(0, 0, 0, 0, 0, rx); sg.addColorStop(0, `rgba(${GR},${a})`); sg.addColorStop(1, `rgba(${GR},0)`);
        o.fillStyle = sg; o.beginPath(); o.arc(0, 0, rx, 0, 7); o.fill(); o.restore();
      };
      const ghost = (o, pts, seed) => { // an earlier attempt, erased: a faint grey line inside a lighter rubbed streak
        const P = wob(seg(pts, 4), nz, seed, 2, 0.01);
        o.save(); o.lineCap = 'round'; o.lineJoin = 'round';
        o.beginPath(); P.forEach(([x, y], i) => (i ? o.lineTo(x, y + 2) : o.moveTo(x, y + 2)));
        o.strokeStyle = 'rgba(255,252,240,0.2)'; o.lineWidth = 12; o.stroke();
        o.beginPath(); P.forEach(([x, y], i) => (i ? o.lineTo(x, y) : o.moveTo(x, y)));
        o.strokeStyle = `rgba(${GR},0.075)`; o.lineWidth = 1.6; o.stroke(); o.restore();
      };
      const crumbs = (o, x0, x1, y0, y1, seed, n) => {
        const rr = H.rng(seed);
        for (let i = 0; i < n; i++) {
          const x = rr.range(x0, x1), y = rr.range(y0, y1), l = rr.range(9, 18), a = rr.range(0, 3);
          o.save(); o.translate(x, y); o.rotate(a);
          o.fillStyle = 'rgba(60,40,30,0.22)'; o.beginPath(); o.ellipse(1.5, 2.5, l / 2, 3.4, 0, 0, 7); o.fill();
          const cg = o.createLinearGradient(0, -3, 0, 3); cg.addColorStop(0, '#e9d7cf'); cg.addColorStop(1, '#a99791');
          o.fillStyle = cg; o.beginPath(); o.ellipse(0, 0, l / 2, 3.1, 0, 0, 7); o.fill();
          o.fillStyle = 'rgba(70,70,80,0.35)'; o.beginPath(); o.ellipse(l * 0.1, 0.6, l / 4, 1, 0, 0, 7); o.fill();
          o.restore();
        }
      };
      const chartIt = items.find((it) => it.g === 'D' && it.k === 'line' && it.role === 'acc1' && it.pts.length > 30);
      const renderPage = (cm, page2) => {
        const z = cm[2], out = H.layer(W, H_), o = out.getContext('2d');
        const apply = (c) => { c.translate(W / 2, H_ / 2); c.scale(z, z); c.translate(-cm[0], -cm[1]); };
        // paper + binding
        o.save(); apply(o);
        o.drawImage(XC.page, -300, -300, 4400, 2480);
        o.fillStyle = '#2a2420'; o.fillRect(-600, -400, 520, 3000);
        const cur = o.createLinearGradient(-80, 0, 30, 0); cur.addColorStop(0, 'rgba(90,70,40,0.3)'); cur.addColorStop(1, 'rgba(90,70,40,0)');
        o.fillStyle = cur; o.fillRect(-80, -400, 110, 3000);
        for (let y = -380; y < 2000; y += 34) {
          o.fillStyle = 'rgba(40,30,20,0.22)'; o.beginPath(); o.ellipse(-56, y + 3, 7, 8.5, 0, 0, 7); o.fill(); // coil shadow
          o.fillStyle = '#2b2520'; o.beginPath(); o.ellipse(-58, y, 6, 7.5, 0, 0, 7); o.fill();
          o.strokeStyle = 'rgba(255,255,255,0.3)'; o.lineWidth = 1; o.beginPath(); o.ellipse(-58, y + 0.8, 6, 7.5, 0, 0.2, 2.9); o.stroke();
          o.strokeStyle = 'rgba(40,30,20,0.25)'; o.lineWidth = 5; o.lineCap = 'round';
          o.beginPath(); o.moveTo(-56, y + 5); o.quadraticCurveTo(-86, y + 2, -102, y + 12); o.stroke();
          const wg = o.createLinearGradient(0, y - 6, 0, y + 6); wg.addColorStop(0, '#f2f2f2'); wg.addColorStop(0.45, '#9a9ca0'); wg.addColorStop(1, '#3e3f42');
          o.strokeStyle = wg; o.lineWidth = 4.2; o.beginPath(); o.moveTo(-58, y - 2); o.quadraticCurveTo(-84, y - 14, -106, y + 2); o.stroke();
          o.strokeStyle = 'rgba(255,255,255,0.65)'; o.lineWidth = 1; o.beginPath(); o.moveTo(-64, y - 6); o.quadraticCurveTo(-84, y - 14, -100, y - 6); o.stroke();
        }
        if (page2) {
          o.font = '400 30px "Caveat"'; o.fillStyle = `rgba(${GR},0.45)`; o.fillText('p. 15', 3100, 330);
          ghost(o, [[2212, 690], [2300, 585], [2420, 505], [2560, 462], [2690, 445]], 71); // a first, too-steep try at the curve
          smear(o, 2470, 840, 260, 34, -0.05, 0.05); smear(o, 3010, 640, 140, 60, 0.4, 0.04);
        } else {
          o.font = '400 30px "Caveat"'; o.fillStyle = `rgba(${GR},0.45)`; o.fillText('p. 14', 1020, 120);
          smear(o, 6, 470, 170, 46, 1.45, 0.07); smear(o, 30, 980, 120, 36, 1.5, 0.05); // graphite dust by the binding
          ghost(o, [[330, 460], [600, 452], [920, 455]], 73);                          // an erased first underline
          ghost(o, ell(BBX + 20, BBY - 16, BR + 8, BR + 4, -2.7, 1.6), 74);             // an erased first try at the bulb
          smear(o, 1270, 770, 170, 40, -0.1, 0.045); smear(o, 2010, 300, 140, 40, 0.2, 0.035);
        }
        o.restore();
        // ---- tone layer (stump blending, cast shadows) ----
        const Ls = H.layer(W, H_), gS = Ls.getContext('2d');
        gS.save(); apply(gS);
        let usedS = false, usedR = false; const late = [];
        if (!page2) { if (t > 3.42) gS.globalAlpha = H.smooth(3.42, 4.37, t), putS(gS, bulbTone), gS.globalAlpha = 1, usedS = true; }
        else if (chartIt) {
          const cs = chartSpr(chartIt), rx = cs.x0 + (cs.x1 - cs.x0) * XE.win(t, L.pT + 0.62, L.pT + 1.85) + 8;
          if (rx > cs.x0 + 8) { usedS = true; gS.save(); gS.beginPath(); gS.rect(cs.x0 - 20, 0, rx - cs.x0 + 20, 2000); gS.clip(); putS(gS, cs.ts); gS.restore(); }
        }
        // graphite
        const Lg = H.layer(W, H_), gG = Lg.getContext('2d');
        const Lr = H.layer(W, H_), gR = Lr.getContext('2d'); // red colouring pencil for corrections
        gG.save(); apply(gG); gR.save(); apply(gR);
        let g = gG;
        PH = null;
        const vx0 = cm[0] - W / 2 / z - 40, vx1 = cm[0] + W / 2 / z + 40, vy0 = cm[1] - H_ / 2 / z - 40, vy1 = cm[1] + H_ / 2 / z + 40;
        const guide = (pts, seed, a, gate) => { if (gate <= 0) return; GATE = gate; pencil(gG, wob(seg(pts, 3), nz, seed, 0.6, 0.004), 1.1, a, seed, 0.03, 0.03, nz); GATE = 1; };
        if (!page2) { // lettering guides under the title, construction circle + axes for the bulb
          guide([[250, 352], [1030, 340]], 81, 0.13, XE.win(t, 0.02, 0.3));
          guide([[262, 306], [1018, 295]], 82, 0.1, XE.win(t, 0.06, 0.34));
          if (t > 2.4) {
            const cg = XE.win(t, 2.42, 2.7);
            guide(ell(BBX, BBY, BR + 5, BR + 3, -1.9, -1.9 + 6.7), 83, 0.15, cg);
            guide([[BBX + 1, BBY - 160], [BBX - 2, MY + 200]], 84, 0.12, cg);
            guide([[BBX - 175, BBY + 2], [BBX + 180, BBY - 2]], 85, 0.11, cg);
          }
        } else guide([[L.D[0] - 480, L.D[1] + 293], [L.D[0] + 490, L.D[1] + 287]], 86, 0.12, XE.win(t, L.kT - 0.15, L.kT + 0.15));
        for (const it of items) {
          const onP2 = it.g === 'D' || it.g === 'E';
          if (onP2 !== page2) continue;
          const p = it.inst ? 1 : XE.win(t, it.a, it.b);
          if (p <= 0) continue;
          g = it.role === 'acc2' ? gR : gG; if (g === gR) usedR = true;
          if (it.k === 'line') {
            let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9; for (const [x, y] of it.pts) { a0 = Math.min(a0, x); a1 = Math.max(a1, x); b0 = Math.min(b0, y); b1 = Math.max(b1, y); }
            if (a1 < vx0 || a0 > vx1 || b1 < vy0 || b0 > vy1) continue;
            const seed = ((it.pts[0][0] * 13 + it.pts[0][1] * 7) | 0) + 9;
            const dark = it.role === 'acc2' ? 1.0 : 0.8;
            const closed = it.pts.length > 8 && Math.hypot(it.pts[0][0] - it.pts[it.pts.length - 1][0], it.pts[0][1] - it.pts[it.pts.length - 1][1]) < 25 && a1 - a0 > 80;
            const hp = XE.win(t, it.b, it.b + 0.4);
            if (closed && !it.inst && hp > 0 && a1 - a0 > 100 && it.g !== 'M') { // soft cast shadow, lower right
              const sx = (a1 - a0) / 120, sy = (b1 - b0) / 120;
              usedS = true; gS.globalAlpha = 0.2 * hp; gS.drawImage(cardSh.cv, a0 - 40 * sx + 7, b0 - 40 * sy + 9, 200 * sx, 200 * sy); gS.globalAlpha = 1;
            }
            if (!it.inst) { // construction: a light guide pass that overshoots the ends, ghosted in first
              const P0 = it.pts, n0 = P0.length, e0 = P0[0], e1 = P0[1], f0 = P0[n0 - 1], f1 = P0[n0 - 2];
              const ov = Math.hypot(e0[0] - f0[0], e0[1] - f0[1]) < 25 ? 0 : 9 + (seed % 9);
              const ext = (q, r) => { const dx = q[0] - r[0], dy = q[1] - r[1], d = Math.hypot(dx, dy) || 1; return [q[0] + dx / d * ov, q[1] + dy / d * ov]; };
              const G = wob(seg([ext(e0, e1), ...P0, ext(f0, f1)], 4), nz, (seed + 3) % 91, n0 <= 3 ? 0.7 : 1.8, 0.006), nG = Math.max(2, Math.ceil(G.length * Math.min(1, p * 2.2)));
              g.beginPath(); for (let j = 0; j < nG; j++) (j ? g.lineTo(G[j][0] + 1.6, G[j][1] - 1.3) : g.moveTo(G[j][0] + 1.6, G[j][1] - 1.3));
              g.strokeStyle = `rgba(${GR},0.17)`; g.lineWidth = 1.1; g.stroke();
            }
            pstroke(g, wob(seg(it.pts, 3), nz, seed % 91, it.inst ? 0.5 : 1.0, 0.012), Math.max(1.6, it.w * 0.5), dark, seed, p, [a0, a1, b0, b1], it.inst);
            if (closed && !it.inst && hp > 0) { // crescent hatching sweeps in from the top-left
              const cr = crescent(it, a0, a1, b0, b1, seed), gc = g;
              late.push(() => {
                gc.save();
                if (hp < 1) { const C = a0 + b0 + hp * (a1 - a0 + b1 - b0 + 30); gc.beginPath(); gc.moveTo(C - (b0 - 200), b0 - 200); gc.lineTo(C - (b1 + 200), b1 + 200); gc.lineTo(a0 - 2000, b1 + 200); gc.lineTo(a0 - 2000, b0 - 200); gc.closePath(); gc.clip(); }
                putS(gc, cr); gc.restore();
              });
            }
          } else if (it.k === 'dot') {
            g.fillStyle = `rgba(${GR},0.88)`; g.beginPath(); g.arc(it.x, it.y, it.r * 0.9, 0, 7); g.fill();
          } else {
            const font = it.font === 'label' ? `400 ${it.size * 1.25}px "Caveat"` : `700 ${it.size * (it.font === 'num' ? 1.1 : 1.05)}px "Caveat"`;
            g.save(); g.font = font; const wAll = g.measureText(it.s).width;
            g.translate(it.align === 'center' ? it.x - wAll / 2 : it.x, it.y); g.rotate(it.rot);
            const rr = H.rng((it.s.length * 31 + (it.x | 0)) % 991), n = Math.ceil(it.s.length * p);
            let px = 0;
            for (let i = 0; i < n; i++) {
              const ch = it.s[i], w = g.measureText(ch).width;
              g.fillStyle = it.role === 'acc2' ? `rgba(${GR},${rr.range(0.85, 1)})` : `rgba(${GR},${0.86 * rr.range(0.82, 1.05)})`;
              g.save(); g.translate(px, rr.range(-1, 1)); g.rotate(rr.range(-0.03, 0.03)); g.fillText(ch, 0, 0); g.restore();
              px += w;
            }
            g.restore();
          }
        }
        if (!page2 && t > 3.42) late.push(() => BH.forEach((b, i) => sweep(gG, bulbSpr[i], BBX, BBY + 60, b[0], H.ease.inOut(XE.win(t, b[6], b[7])), -200, 230)));
        if (page2 && chartIt) {
          const cs = chartSpr(chartIt), rx = cs.x0 + (cs.x1 - cs.x0) * XE.win(t, L.pT + 0.62, L.pT + 1.85) + 8;
          if (rx > cs.x0 + 8) late.push(() => { gG.save(); gG.beginPath(); gG.rect(cs.x0 - 20, 0, rx - cs.x0 + 20, 2000); gG.clip(); putS(gG, cs.hs); gG.restore(); });
        }
        gG.restore(); gR.restore();
        // paper tooth, anchored to the page: light pressure only catches the peaks
        const T = XC.tooth, iz = 1 / z;
        for (const g of usedR ? [gG, gR] : [gG]) {
          const id = g.getImageData(0, 0, W, H_), d = id.data;
          for (let y = 0, i = 3; y < H_; y++) {
            const wy = ((y - H_ / 2) * iz + cm[1]) * 1.4 | 0, row = (wy & 511) << 9;
            for (let x = 0; x < W; x++, i += 4) {
              const a = d[i]; if (!a) continue;
              const wx = ((x - W / 2) * iz + cm[0]) * 1.4 | 0, af = a * 0.0054902; // a/255*1.4
              let k = (T[row | (wx & 511)] - (af < 1 ? 1 - af : 0) * 0.75) * 3.2 + 0.15; k = k < 0 ? 0 : k > 1 ? 1 : k;
              d[i] = a * (0.3 + 0.7 * k);
            }
          }
          g.putImageData(id, 0, 0);
        }
        if (late.length) { // pre-toothed sprites (hatching) go on after the per-pixel pass
          gG.save(); apply(gG); gR.save(); apply(gR);
          late.forEach((f) => f());
          gG.restore(); gR.restore();
        }
        // tone gets the same tooth (grain pattern in page space), then sits under the lines
        if (usedS) {
          gS.globalCompositeOperation = 'destination-out'; gS.globalAlpha = 0.55;
          const pat = gS.createPattern(XC.toothCv, 'repeat'); pat.setTransform(new DOMMatrix([1 / 1.4, 0, 0, 1 / 1.4, 0, 0]));
          gS.fillStyle = pat; gS.fillRect(vx0 - 50, vy0 - 50, vx1 - vx0 + 100, vy1 - vy0 + 100);
        }
        gS.restore();
        if (usedS) o.drawImage(Ls, 0, 0);
        // stump smudge: a soft, offset ghost of all the graphite (blended by finger and the side of the hand)
        const sm = XC.sm || (XC.sm = H.layer(W / 4, H_ / 4)), smc = sm.getContext('2d');
        smc.clearRect(0, 0, W / 4, H_ / 4); smc.imageSmoothingEnabled = true; smc.imageSmoothingQuality = 'high'; smc.drawImage(Lg, 0, 0, W / 4, H_ / 4);
        o.save(); o.globalAlpha = 0.12; o.imageSmoothingQuality = 'high'; o.drawImage(sm, 2 * z, 3 * z, W, H_); o.restore();
        o.drawImage(Lg, 0, 0);
        if (usedR) { gR.globalCompositeOperation = 'source-in'; gR.fillStyle = '#b8322e'; gR.fillRect(0, 0, W, H_); o.drawImage(Lr, 0, 0); }
        o.save(); apply(o); // eraser crumbs
        if (page2) crumbs(o, 3080, 3180, 780, 840, 818, 7); else if (t > 4.4) crumbs(o, 1985, 2085, 862, 915, 808, 8);
        o.restore();
        const lamp = o.createRadialGradient(560, 220, 80, 640, 360, 900);
        lamp.addColorStop(0, 'rgba(255,250,235,0.14)'); lamp.addColorStop(1, 'rgba(70,50,20,0.16)');
        o.fillStyle = lamp; o.fillRect(0, 0, W, H_);
        return out;
      };
      const tipFor = (cm) => {
        const tp = XE.tipOf(items, t, (it, p) => {
          ctx.save(); ctx.font = `700 ${it.size}px "Caveat"`; const w = ctx.measureText(it.s).width, x0 = it.align === 'center' ? it.x - w / 2 : it.x;
          const w2 = ctx.measureText(it.s.slice(0, Math.ceil(it.s.length * p))).width; ctx.restore(); return [x0 + w2, it.y - it.size * 0.3];
        });
        return tp ? [(tp[0] - cm[0]) * cm[2] + W / 2, (tp[1] - cm[1]) * cm[2] + H_ / 2] : null;
      };

      let tip = null;
      if (t < TURN0) { ctx.drawImage(renderPage(cam, false), 0, 0); tip = tipFor(cam); }
      else if (t >= TURN1) { ctx.drawImage(renderPage(cam2, true), 0, 0); tip = tipFor(cam2); }
      else {
        // ---------- page turn: the page lifts from the bottom-right corner and folds over to the left ----------
        const u = H.ease.inOut(XE.win(t, TURN0, TURN1));
        const P1 = renderPage(cam, false), P2 = renderPage(cam2, true);
        ctx.drawImage(P2, 0, 0);
        const xb = W * (1 - u) * 1.05 + 10, xt = xb + 180 * Math.sin(u * Math.PI) + 40 * (1 - u);
        // fold line from (xt,0) to (xb,H_); reflect points across it
        const fx = xb - xt, fy = H_, fl = Math.hypot(fx, fy), ux = fx / fl, uy = fy / fl;
        const refl = ([px, py]) => { const vx = px - xt, vy = py, d = vx * ux + vy * uy; return [xt + 2 * d * ux - vx, 2 * d * uy - vy]; };
        // shadow cast on the new page beyond the fold
        ctx.save(); ctx.beginPath(); ctx.moveTo(xt, 0); ctx.lineTo(W + 10, 0); ctx.lineTo(W + 10, H_); ctx.lineTo(xb, H_); ctx.closePath(); ctx.clip();
        const nx = uy, ny = -ux; // normal pointing right
        const sg = ctx.createLinearGradient(xb, H_ / 2, xb + nx * 60, H_ / 2 + ny * 60);
        sg.addColorStop(0, 'rgba(30,20,10,0.35)'); sg.addColorStop(1, 'rgba(30,20,10,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, W + 10, H_); ctx.restore();
        // the part of page 1 still lying flat (left of the fold)
        ctx.save(); ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(xt, 0); ctx.lineTo(xb, H_); ctx.lineTo(-10, H_); ctx.closePath(); ctx.clip();
        ctx.drawImage(P1, 0, 0); ctx.restore();
        // the flap: back of the turned page
        const c1 = refl([W, 0]), c2 = refl([W, H_]);
        ctx.save(); ctx.beginPath(); ctx.moveTo(xt, 0); ctx.lineTo(c1[0], c1[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(xb, H_); ctx.closePath();
        ctx.save(); ctx.filter = 'blur(10px)'; ctx.fillStyle = 'rgba(40,25,10,0.35)'; ctx.translate(-12, 6); ctx.fill(); ctx.restore();
        ctx.clip();
        ctx.drawImage(XC.page, 0, 0, 550, 310, -50, -50, W + 100, H_ + 100);
        const fg = ctx.createLinearGradient(xb, H_ / 2, xb - nx * 260, H_ / 2 - ny * 260);
        fg.addColorStop(0, 'rgba(60,40,20,0.32)'); fg.addColorStop(0.25, 'rgba(255,250,240,0.12)'); fg.addColorStop(1, 'rgba(80,60,30,0.12)');
        ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H_);
        // faint show-through of the drawing on the back of the sheet
        ctx.globalAlpha = 0.08; ctx.translate(xt, 0); ctx.transform(ux * ux - uy * uy, 2 * ux * uy, 2 * ux * uy, uy * uy - ux * ux, 0, 0); ctx.translate(-xt, 0); ctx.drawImage(P1, 0, 0);
        ctx.restore();
      }
      if (tip && (t < TURN0 - 0.05 || t > TURN1)) {
        const [tx, ty] = tip, ang = 0.72, len = 300;
        ctx.save();
        ctx.save(); ctx.filter = 'blur(7px)'; ctx.fillStyle = 'rgba(50,35,15,0.28)'; ctx.translate(tx + 22, ty + 26); ctx.rotate(ang + 0.05); ctx.beginPath(); ctx.roundRect(30, -8, len, 16, 6); ctx.fill(); ctx.restore();
        ctx.translate(tx, ty); ctx.rotate(ang);
        ctx.fillStyle = '#2c2c30'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12, -2.6); ctx.lineTo(12, 2.6); ctx.closePath(); ctx.fill();
        const wg = ctx.createLinearGradient(0, -8, 0, 8); wg.addColorStop(0, '#f1d9b0'); wg.addColorStop(1, '#b98e5a');
        ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(11, -2.8); ctx.lineTo(40, -8); ctx.lineTo(40, 8); ctx.lineTo(11, 2.8); ctx.closePath(); ctx.fill();
        const bg = ctx.createLinearGradient(0, -8, 0, 8); bg.addColorStop(0, '#5f8c6a'); bg.addColorStop(0.35, '#2f5a3c'); bg.addColorStop(0.36, '#24472f'); bg.addColorStop(1, '#16301f');
        ctx.fillStyle = bg; ctx.fillRect(40, -8, len - 40, 16);
        ctx.restore();
      }
      H.grain(ctx, W, H_, 0.03, 3 + (Math.floor(t * 12) % 3));
      H.vignette(ctx, W, H_, 0.22, '40,28,10');
    },
    // <<<EXPLAINER
    // Sound: a graphite pencil on a toothy sketchbook page under a desk lamp. Every draw-on gets a dry pencil scratch of
    // the same length (with a soft tap where the point lands and the page's low body under it); the red colouring pencil
    // (acc2 items) is waxier and lower; the crescent hatching that fills closed shapes is a quick back-and-forth flick;
    // the page turn (TURN0..TURN1) is the scene change. Times mirror explainer()/XE.story (pT 11.05, kT 13.05,
    // model + turn timings from explainer()).
    explainerSound(k) {
      const pT = 11.05, kT = 13.05, TURN0 = 10.35, TURN1 = 11.0;
      const rnd = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
      // first time XE.eio(win(t, t0, t1)) reaches u (the gear's eased turn)
      const when = (t0, t1, u) => { for (let i = 0; i <= 400; i++) if (XE.eio(i / 400) >= u - 1e-6) return t0 + (t1 - t0) * i / 400; return t1; };
      // one pencil line: the point lands, graphite scratches for the whole draw-on, the page body hums under it
      // graphite grains (bandpassed, like the kit's pencil stroke but without its highpass grain)
      let gs = 0;
      const graphite = (a, d, g, pan, minor) => {
        for (let x = 0; x < d; x += 0.04 * (0.7 + rnd(++gs) * 0.6)) {
          const gd = 0.04 * (0.8 + rnd(++gs) * 0.9);
          k.noise(a + x, { dur: gd, filter: 'bandpass', f: 3900 * (0.8 + rnd(++gs) * 0.4), q: 0.7, gain: 0.16 * g * (0.6 + rnd(++gs) * 0.5), a: gd * 0.3, pan: pan + (rnd(++gs) - 0.5) * 0.2, minor });
        }
      };
      const LV = 0.45; // drawing sits well under the hits
      const pc = (a, b, g = 1, pan = 0, minor = true, red = false) => {
        const d = Math.max(0.03, b - a); g *= LV;
        k.noise(a, { dur: 0.018, filter: 'bandpass', f: red ? 800 : 1100, q: 1.3, gain: 0.3 * g, a: 0.001, pan, minor });
        k.tone(a, { f: red ? 150 : 190, dur: 0.03, gain: 0.05 * g, pan, minor }); // the point's little knock through the pad
        if (red) k.play('stroke', a, { material: 'chalk', dur: d, gain: 0.5 * g, pan, minor }); else graphite(a, d, 0.85 * g, pan, minor);
        k.noise(a, { dur: d + 0.03, color: 'pink', filter: 'bandpass', f: red ? 480 : 650, q: 0.8, gain: 0.08 * g, a: 0.015, hold: d * 0.6, pan, minor });
      };
      // handwriting: one stroke per word, timed by character position like the explainer's per-letter reveal
      const write = (s, a, b, g = 0.9, pan = 0, red = false, minor = true) => {
        const n = s.length, re = /\S+/g; let m;
        while ((m = re.exec(s))) pc(a + (b - a) * m.index / n, a + (b - a) * (m.index + m[0].length) / n, g, pan, minor, red);
      };
      // crescent hatching: short parallel flicks, back and forth (minor texture under the contours)
      const hatch = (a, b, g = 1, seed = 1) => {
        let i = 0;
        for (let x = a; x < b; x += 0.048 + rnd(seed + i) * 0.02, i++) {
          const fade = 1 - 0.5 * (x - a) / (b - a);
          k.noise(x, { dur: 0.035, filter: 'bandpass', f: 3000 + rnd(seed + i + 50) * 900, q: 1.1, gain: 0.07 * LV * g * fade, a: 0.006, pan: i % 2 ? 0.08 : -0.08, minor: true });
        }
      };
      const tap = (t, g = 1) => k.noise(t, { dur: 0.02, filter: 'bandpass', f: 1300, q: 1.5, gain: 0.18 * g, a: 0.001, minor: true }); // pencil point dotted onto the page

      k.bed('room', 0, 15, { gain: 0.45 });

      // 1 HOOK
      write('How does AI learn?', 0.15, 1.3, 1.0);
      pc(1.3, 1.55, 1.25, 0, false); // the underline: one confident sweep

      // 2 DATA: light-bulb model, then six cards; each closed card fills with hatching right after its outline
      pc(2.5, 2.85, 1.05, 0.1, false); // bulb outline: first mark in the new scene
      pc(2.85, 2.92, 0.75, 0.1); pc(2.92, 2.99, 0.75, 0.1); // neck
      pc(2.99, 3.09, 0.65, 0.1); // screw-base bands
      for (let i = 0; i < 6; i++) { const a = 3.0 + i * 0.17; pc(a, a + (i < 5 ? 0.15 : 0.21), 0.85, (i % 3 - 1) * 0.15); }
      pc(3.15, 3.4, 0.45, 0.15); // gear inside the bulb (under the cards)
      hatch(3.12, 4.37, 0.9, 3);
      pc(4.15, 4.45, 1.0); pc(4.46, 4.55, 0.85); // flow arrow + head
      write('examples', 4.55, 4.8, 0.35);
      for (let f = 55; f < 63; f++) k.play('count', f / 12, { gain: 1.6, f: 2600 + (f - 55) * 120, minor: true }); // 0 -> 1,000,000, re-pencilled on the 12 fps grid
      k.play('tock', 63 / 12, { f: 520, gain: 0.45 }); // 1,000,000 lands

      // 3 GUESS -> CHECK -> ADJUST
      pc(6.4, 6.53, 0.9, 0, true, true); // red frame of the new photo
      pc(6.55, 6.66, 0.85); pc(6.6, 6.7, 0.6); // cat
      tap(6.7, 0.9); // eyes
      hatch(6.55, 6.95, 0.8, 11);
      write('new!', 6.67, 6.8, 0.7, 0.2, true);
      pc(6.8, 6.94, 0.9); pc(6.96, 7.02, 0.8); // arrow down into the model
      pc(7.02, 7.15, 0.9); // guess arrow out
      write('Guess', 7.15, 7.4, 0.7);
      pc(7.3, 7.47, 0.85); pc(7.48, 7.53, 0.75); // speech bubble + tail
      hatch(7.5, 7.9, 0.75, 21);
      write('dog?', 7.54, 7.75, 1.0);
      write('Check', 7.86, 8.0, 0.7, 0, true);
      // the wrong guess: two hard red slashes + a low "nope"
      pc(8.0, 8.08, 1.8, 0.1, false, true); pc(8.08, 8.16, 1.8, 0.1, false, true);
      k.play('error', 8.0, { f: 'E3', gain: 0.55 });
      pc(8.16, 8.45, 1.1, 0, true, true); // red ring
      pc(8.45, 8.8, 1.0, -0.1, true, true); // the long arrow back to the model
      write('Adjust', 8.8, 9.05, 0.7, -0.1, true);
      // the gear turns (1.6 rad over eio(8.95..9.5)): a soft click for every ~0.27 rad, so they slow as it settles
      for (let j = 1; j <= 6; j++) k.play('click', when(8.95, 9.5, j / 6), { f: 900, gain: 0.5, pan: -0.15, minor: true });
      pc(9.5, 9.62, 1.1); // strike through "dog?"
      write('cat', 9.62, 9.85, 1.0);
      pc(9.85, 10.05, 1.15, 0, false); // check mark
      k.play('success', 9.98, { f: 'A5', gain: 0.75 });

      // page turn: the corner lifts, the sheet sweeps over (air), and lands flat on the left
      k.play('paper', TURN0, { dur: 0.22, gain: 0.7 });
      k.noise(TURN0 + 0.05, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 260], [0.32, 900], [0.6, 380]], q: 0.7, gain: 0.24, a: 0.28, pan: 0.2 });
      k.play('slap', TURN1 - 0.05, { gain: 0.35, pan: -0.3 });
      k.noise(TURN1 - 0.05, { dur: 0.18, color: 'brown', filter: 'lowpass', f: 400, gain: 0.25, pan: -0.3 });

      // 4 PROGRESS (fresh page)
      pc(pT, pT + 0.3, 1.0, 0, false); // axes
      write('training rounds', pT + 0.3, pT + 0.55, 0.55);
      write('accuracy', pT + 0.5, pT + 0.7, 0.65, 0.3);
      pc(pT + 0.7, pT + 1.7, 0.4); // the rising curve
      { // % counter: a light pencil tick whenever the shown number changes (12 fps grid), slowing as it settles.
        // The number is graphite all the way, so the hit lands on the frame 97% is first pencilled.
        let last = -1;
        for (let f = Math.ceil((pT + 0.6) * 12); f < 160; f++) {
          const u = Math.min(1, (f / 12 - (pT + 0.6)) / 1.1), v = Math.round(61 + 36 * (1 - Math.pow(1 - u, 2.2)));
          if (v === 97) { // 97% lands: the biggest hit
            k.play('impact', f / 12, { gain: 1.0, pan: 0.15 });
            k.play('ding', f / 12 + 0.01, { f: 'C6', gain: 0.42, pan: 0.15 });
            break;
          }
          if (v !== last) { k.play('tick', f / 12, { gain: 1.1, f: 2600 + (v - 61) * 25, pan: 0.25, minor: true }); last = v; }
        }
      }
      pc(pT + 1.75, pT + 2.05, 1.25, 0.25, false, true);

      // 5 TAKEAWAY
      write('More examples → better guesses', kT, kT + 0.75, 0.9);
      k.play('success', kT + 0.75, { f: 'G5', gain: 0.7 }); // resolving landing
      pc(kT + 0.75, kT + 0.95, 1.15, 0, false);
      k.play('tock', kT + 1.05, { f: 380, gain: 0.6, minor: true }); // pencil laid down on the desk
    },
  });
}
