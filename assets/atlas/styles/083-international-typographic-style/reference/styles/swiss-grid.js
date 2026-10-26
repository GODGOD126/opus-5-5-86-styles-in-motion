{
  const fieldNoise = (w, h, seed, cell, oct, sx = 1, sy = 1) => {
    const nz = H.makeNoise(seed), gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2, g = new Float32Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) g[j * gw + i] = nz.fbm2(i * 0.35 * sx, j * 0.35 * sy, oct);
    const out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      const fy = y / cell, j = fy | 0, ty = fy - j;
      for (let x = 0; x < w; x++) {
        const fx = x / cell, i = fx | 0, tx = fx - i, k = j * gw + i;
        const a = g[k] + (g[k + 1] - g[k]) * tx, b = g[k + gw] + (g[k + gw + 1] - g[k + gw]) * tx;
        out[y * w + x] = a + (b - a) * ty;
      }
    }
    return out;
  };

  const RED = '#e2231a', BLACK = '#141414', PAPER = '#f1efe9';

  // ===================== EXPLAINER: "How does AI learn?" =====================
  // A Zürich-school information sequence: every page hangs on the same 12-column grid; pages change with a
  // column-by-column red wipe; arrows are hairline rules with solid heads; numbers are set in Inter 800.
  const EXF = {};
  const exField = (k, ...a) => { const kk = k + a[0] + 'x' + a[1]; return EXF[kk] || (EXF[kk] = fieldNoise(...a)); }; // cached per size
  // ink dropouts: fixed-seed single-pixel specks plus a few offset "hickeys" (tiny donuts of missing ink)
  const speckMask = (w, h) => {
    const key = 'speck' + w + 'x' + h; if (EXF[key]) return EXF[key];
    const m = new Float32Array(w * h), r = H.rng(12);
    for (let p = 0; p < m.length; p++) if (r() < 0.0015) m[p] = 0.5;
    const rh = H.rng(1212);
    for (let k = 0; k < 70; k++) {
      const cx = rh.range(4, w - 4), cy = rh.range(4, h - 4), ro = rh.range(1.6, 3.2);
      for (let y = Math.floor(cy - ro - 1); y <= cy + ro + 1; y++) for (let x = Math.floor(cx - ro - 1); x <= cx + ro + 1; x++) {
        const dd = Math.hypot(x - cx, y - cy), ring = Math.max(0, 1 - Math.abs(dd - ro * 0.75) / (ro * 0.4)), core = dd < ro * 0.3 ? 0.35 : 0;
        const v = Math.min(0.85, ring * 0.8 + core); if (v > m[y * w + x]) m[y * w + x] = v;
      }
    }
    return (EXF[key] = m);
  };
  const pict = (c, kind, x, y, s, col = BLACK, eye = PAPER) => { // isotype-like pictograms
    c.fillStyle = col;
    if (kind === 'cat') {
      c.beginPath(); c.moveTo(x - s * 0.3, y - s * 0.02); c.lineTo(x - s * 0.27, y - s * 0.4); c.lineTo(x - s * 0.05, y - s * 0.2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(x + s * 0.3, y - s * 0.02); c.lineTo(x + s * 0.27, y - s * 0.4); c.lineTo(x + s * 0.05, y - s * 0.2); c.closePath(); c.fill();
      c.beginPath(); c.arc(x, y + s * 0.06, s * 0.3, 0, 7); c.fill();
    } else {
      c.beginPath(); c.arc(x, y + s * 0.02, s * 0.28, 0, 7); c.fill();
      c.beginPath(); c.ellipse(x - s * 0.3, y + s * 0.04, s * 0.1, s * 0.22, 0.35, 0, 7); c.fill();
      c.beginPath(); c.ellipse(x + s * 0.3, y + s * 0.04, s * 0.1, s * 0.22, -0.35, 0, 7); c.fill();
      c.beginPath(); c.ellipse(x, y + s * 0.22, s * 0.13, s * 0.1, 0, 0, 7); c.fill();
    }
    if (s > 30) { c.fillStyle = eye; c.beginPath(); c.arc(x - s * 0.1, y + s * 0.02, s * 0.045, 0, 7); c.arc(x + s * 0.1, y + s * 0.02, s * 0.045, 0, 7); c.fill(); }
  };
  const rule = (c, x0, y0, x1, y1, p, w = 2, col = BLACK, head = true) => { // hairline arrow
    if (p <= 0) return;
    const x = H.lerp(x0, x1, p), y = H.lerp(y0, y1, p), a = Math.atan2(y1 - y0, x1 - x0);
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = w; c.lineCap = 'butt';
    const hl = 14 + w * 2.6;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x - Math.cos(a) * hl * 0.6, y - Math.sin(a) * hl * 0.6); c.stroke();
    if (head) { c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(a - 0.42) * hl, y - Math.sin(a - 0.42) * hl); c.lineTo(x - Math.cos(a + 0.42) * hl, y - Math.sin(a + 0.42) * hl); c.closePath(); c.fill(); }
  };

  const explainSwiss = (ctx, W, HH, t) => {
    const M = 48, PITCH = 100, COLW = 84, colX = (i) => M + i * PITCH, E = H.ease, cl = H.clamp;
    const S = (a, b) => cl((t - a) / (b - a), 0, 1);
    const txt = (s, x, y, size, wgt = 400, col = BLACK, ls = 0) => { c.font = `${wgt} ${size}px "Inter"`; c.letterSpacing = ls + 'px'; c.fillStyle = col; c.fillText(s, x, y); c.letterSpacing = '0px'; };
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, HH);
    const L = H.layer(W, HH), c = L.getContext('2d'); c.textBaseline = 'alphabetic';

    // page changes: column-by-column wipe, content swaps while fully covered
    const WIPES = [5.8, 10.3, 12.7], swap = (w) => w + 0.58;
    const page = t < swap(WIPES[0]) ? 0 : t < swap(WIPES[1]) ? 1 : t < swap(WIPES[2]) ? 2 : 3;

    // ---------- running header (the hook shrinks into it) ----------
    const hp = E.inOut(S(1.7, 2.4));
    {
      const fs = H.lerp(150, 28, hp), x = M - fs * 0.05, y1 = H.lerp(HH - M - 150 * 0.86, M + 22, hp), y2 = H.lerp(HH - M, M + 22, hp);
      c.font = `800 ${fs}px "Inter"`; c.letterSpacing = `${-(fs * 0.045).toFixed(1)}px`; c.fillStyle = BLACK;
      const rise = (s, d, x, yb) => { const p = E.inOut(S(d, d + 0.5)); if (p <= 0) return; c.save(); if (hp === 0) { c.beginPath(); c.rect(0, yb - fs * 0.9, W, fs * 0.98); c.clip(); } c.fillText(s, x, yb + (1 - p) * fs * 0.9); c.restore(); };
      if (hp < 1) { rise('How does', 0.15, x, y1); rise('AI learn?', 0.35, x + (c.measureText('How does ').width) * hp, y2); }
      else c.fillText('How does AI learn?', x, M + 22);
      c.letterSpacing = '0px';
      if (hp < 0.5) { c.globalAlpha = 1 - hp * 2; txt('Lecture 05', colX(0), M + 14, 13, 600); txt('Machine learning, explained', colX(2), M + 14, 13); txt('in five steps', colX(2), M + 31, 13); c.globalAlpha = 1;
        const rp = E.back(S(0.5, 1.0)); c.fillStyle = RED; c.beginPath(); c.arc(colX(9) + 42, 250, 150 * rp, 0, 7); c.fill();
        c.strokeStyle = BLACK; c.lineWidth = 8; for (let k = 0; k < 4; k++) { const a0 = k * 1.4 + t * 0.6; c.beginPath(); c.arc(colX(9) + 42, 250, 60 + k * 26, a0, a0 + 1.6 * E.out(S(0.7 + k * 0.1, 1.3))); c.stroke(); }
      }
      c.fillStyle = BLACK; c.fillRect(colX(0), M - 6, (colX(11) + COLW - colX(0)) * E.inOut(S(0, 0.7)), 3);
      if (hp >= 1) { const sec = ['01  Data', '02  Learning loop', '03  Progress', '04  Summary'][page]; c.textAlign = 'right'; txt(sec, colX(11) + COLW, M + 22, 28, 600, page === 3 ? BLACK : RED); c.textAlign = 'left'; }
    }

    // ---------- page 0: data ----------
    if (page === 0 && t > 2.3) {
      const top = 130;
      c.fillStyle = BLACK; c.fillRect(colX(0), top, (colX(5) + COLW - colX(0)) * E.out(S(2.4, 2.9)), 2);
      txt('Training data: labelled examples', colX(0), top + 32, 28, 600);
      // two large annotated examples with leader rules landing on them
      pict(c, 'cat', colX(0) + 42, top + 100, 84 * E.back(S(2.6, 2.9)));
      pict(c, 'dog', colX(2) + 42, top + 100, 84 * E.back(S(2.75, 3.05)));
      const lp1 = E.out(S(3.0, 3.3)), lp2 = E.out(S(3.15, 3.45));
      rule(c, colX(1) + 40, top + 60, colX(0) + 70, top + 78, lp1, 1.5); if (lp1 >= 1) txt('cat', colX(1) + 44, top + 68, 28, 800, RED);
      rule(c, colX(3) + 40, top + 60, colX(2) + 72, top + 80, lp2, 1.5); if (lp2 >= 1) txt('dog', colX(3) + 44, top + 68, 28, 800, RED);
      // matrix of examples filling in reading order
      const mx = colX(0), my = top + 180, cell = 36, cols = 16, rows = 8, nShow = Math.floor(cols * rows * Math.pow(S(3.2, 5.5), 0.8));
      for (let i = 0; i < nShow; i++) { const k = H.rng(i * 13 + 5)() < 0.5 ? 'cat' : 'dog'; pict(c, k, mx + (i % cols) * cell + 16, my + Math.floor(i / cols) * cell + 16, 30); }
      // flow into the model
      rule(c, colX(6) + 10, my + 120, colX(7) - 10, my + 120, E.out(S(3.4, 3.8)), 2);
      for (let k = 0; k < 4; k++) { const u = ((t * 1.6 + k / 4) % 1); if (t > 3.8) { c.fillStyle = BLACK; c.fillRect(H.lerp(colX(6) + 10, colX(7) - 24, u) - 4, my + 116, 8, 8); } }
      const ms = E.out(S(2.9, 3.4)), bx = colX(7), by = my + 20;
      c.fillStyle = BLACK; c.fillRect(bx, by, (COLW * 3 + 32) * ms, 230);
      if (ms >= 1) { // mini network knocked out of the black block
        c.strokeStyle = PAPER; c.lineWidth = 1.2; const xs = [bx + 50, bx + 142, bx + 234], ys = [[50, 115, 180], [38, 88, 140, 192], [88, 140]];
        for (let a = 0; a < 2; a++) for (const y0 of ys[a]) for (const y1 of ys[a + 1]) { c.beginPath(); c.moveTo(xs[a], by + y0); c.lineTo(xs[a + 1], by + y1); c.stroke(); }
        c.fillStyle = PAPER; ys.forEach((col, a) => col.forEach((y) => { c.beginPath(); c.arc(xs[a], by + y, 8, 0, 7); c.fill(); }));
        txt('Model', bx, by + 266, 30, 800);
      }
      // counter
      const cp = S(3.0, 5.6), n = cp < 1 ? Math.pow(cp, 3) * 1e6 : 1e6;
      if (t > 3.0) { c.font = '800 96px "Inter"'; c.letterSpacing = '-5px'; c.fillStyle = RED; c.fillText(Math.round(n).toLocaleString('en-US'), colX(7) - 6, top + 92); c.letterSpacing = '0px';
        c.fillStyle = BLACK; c.fillRect(colX(7), top, (colX(11) + COLW - colX(7)) * E.out(S(2.9, 3.3)), 2); txt('examples', colX(7), top + 142, 28, 800); txt('seen in training', colX(9), top + 142, 28, 400); }
    }

    // ---------- page 1: guess -> check -> adjust ----------
    if (page === 1) {
      const t0 = swap(WIPES[0]);
      // step bar
      const steps = ['Guess', 'Check', 'Adjust'], act = t < 7.6 ? 0 : t < 8.3 ? 1 : t < 9.3 ? 2 : Math.floor((t - 9.3) * 2.5) % 3;
      steps.forEach((s, i) => {
        const x = colX(i * 3), p = E.out(S(t0 + 0.1 + i * 0.12, t0 + 0.4 + i * 0.12)); if (p <= 0) return;
        const on = i === act;
        c.fillStyle = on ? RED : BLACK; c.fillRect(x, 130, (COLW * 3 + 32) * p, on ? 6 : 2);
        txt(`${i + 1}`, x, 176, 28, 800, on ? RED : BLACK); txt(s, x + 30, 176, 28, 800, BLACK, -1);
      });
      // loop return rule: Adjust -> back to Guess
      { const p = E.inOut(S(9.0, 9.5)), y = 196, x1 = colX(0) + 10, x0 = colX(8) + 20;
        if (p > 0) { c.strokeStyle = BLACK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y - 8); c.lineTo(x0, y); c.lineTo(H.lerp(x0, x1, p), y); c.stroke(); if (p >= 1) rule(c, x1, y, x1, y - 12, 1, 1.5); }
        if (p >= 1) txt('repeat', colX(4), y + 32, 28, 800, RED); }
      // network
      const adj = E.inOut(S(8.35, 9.2)), layers = [[0, 3], [1, 4], [2, 4], [3, 2]], LX = [colX(2) + 40, colX(4) + 20, colX(6), colX(7) + 80], cy = 440;
      const nodes = layers.map(([li, n]) => Array.from({ length: n }, (_, k) => [LX[li], cy + (k - (n - 1) / 2) * 76]));
      const r = H.rng(808);
      for (let a = 0; a < 3; a++) for (const p0 of nodes[a]) for (const p1 of nodes[a + 1]) {
        const w0 = r.range(0.4, 3.2), w1 = r.range(0.4, 4.5), w = H.lerp(w0, w1, adj);
        c.strokeStyle = adj > 0 && adj < 1 ? RED : BLACK; c.lineWidth = w; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke();
      }
      const np = E.back(S(t0 + 0.2, t0 + 0.5));
      nodes.forEach((col) => col.forEach(([x, y]) => { c.fillStyle = BLACK; c.beginPath(); c.arc(x, y, 11 * np, 0, 7); c.fill(); c.fillStyle = PAPER; c.beginPath(); c.arc(x, y, 5 * np, 0, 7); c.fill(); }));
      // forward pass pulses (guess) and the error travelling back (adjust)
      const pulse = (ts, dir, col) => { const u = S(ts, ts + 0.6); if (u <= 0 || u >= 1) return; const f = dir > 0 ? u : 1 - u, xx = H.lerp(LX[0], LX[3], f); c.fillStyle = col; for (const k of [-1, 0, 1]) { c.beginPath(); c.arc(xx, cy + k * 72 + Math.sin(f * 9 + k) * 10, 7, 0, 7); c.fill(); } };
      pulse(7.0, 1, BLACK); pulse(7.85, -1, RED); pulse(9.35, 1, BLACK);
      // input picture
      pict(c, 'cat', colX(0) + 84, cy, 130 * E.back(S(t0 + 0.15, t0 + 0.5)));
      if (S(t0 + 0.4, t0 + 0.6) > 0) txt('New picture', colX(0), cy + 108, 28, 600);
      rule(c, colX(1) + 70, cy, LX[0] - 18, cy, E.out(S(t0 + 0.4, t0 + 0.7)), 2);
      // outputs: two labelled nodes; guess, check, correct
      const oN = nodes[3];
      txt('dog', oN[0][0] + 24, oN[0][1] + 10, 28, 600); txt('cat', oN[1][0] + 24, oN[1][1] + 10, 28, 600);
      const ox = colX(9) + 40;
      if (t > 7.5 && t < 9.4) {
        txt('dog?', ox, cy - 20, 54, 800, BLACK, -2);
        const sp = E.out(S(7.75, 7.95)); // check: struck out in red + cross
        if (sp > 0) { c.fillStyle = RED; c.fillRect(ox - 6, cy - 42, 140 * sp, 7); }
        const xp = E.out(S(7.8, 8.0)); if (xp > 0) { c.save(); c.translate(ox + 175, cy - 40); c.rotate(Math.PI / 4); c.fillStyle = RED; c.fillRect(-26 * xp, -5, 52 * xp, 10); c.fillRect(-5, -26 * xp, 10, 52 * xp); c.restore(); }
        if (t > 7.95) { txt('Wrong —', ox, cy + 22, 28, 800, RED); txt('it is a cat.', ox, cy + 54, 28, 800, RED); }
        if (t > 8.35) txt('Error flows back,', ox, cy + 100, 28, 400), txt('weights adjust.', ox, cy + 132, 28, 400);
      }
      if (t >= 9.4) {
        const p = E.out(S(9.6, 9.9));
        txt('cat', ox, cy - 20, 54, 800, BLACK, -2);
        if (p > 0) { c.save(); c.translate(ox + 120, cy - 34); c.strokeStyle = BLACK; c.lineWidth = 9; c.lineCap = 'butt'; c.beginPath(); c.moveTo(-14, 0); c.lineTo(0, 14 * p); c.lineTo(30 * p, -26 * p); c.stroke(); c.restore();
          c.fillStyle = RED; c.fillRect(ox, cy - 8, 92 * p, 6); txt('Correct.', ox, cy + 34, 28, 800); }
      }
      // highlight the chosen output node
      const sel = t < 9.4 ? oN[0] : oN[1];
      if (t > 7.5) { c.strokeStyle = t < 9.4 ? RED : BLACK; c.lineWidth = 3; c.beginPath(); c.arc(sel[0], sel[1], 19, 0, 7); c.stroke(); }
    }

    // ---------- page 2: progress ----------
    if (page === 2) {
      const t0 = swap(WIPES[1]), gx = colX(0) + 40, gy = 600, gw = colX(7) + COLW - gx, gh = 380;
      c.fillStyle = BLACK; c.fillRect(gx, gy, gw * E.out(S(t0, t0 + 0.3)), 2); c.fillRect(gx, gy - gh * E.out(S(t0, t0 + 0.3)), 2, gh * E.out(S(t0, t0 + 0.3)));
      for (let k = 0; k <= 5; k++) { const v = 50 + k * 10, y = gy - (v - 50) / 50 * gh; c.fillStyle = 'rgba(20,20,20,0.18)'; c.fillRect(gx, y, gw, 1); c.textAlign = 'right'; txt(v + '%', gx - 10, y + 7, 20, 400); c.textAlign = 'left'; }
      txt('Accuracy', gx, gy - gh - 14, 28, 800); c.textAlign = 'right'; txt('Training rounds →', gx + gw, gy + 38, 28, 600); c.textAlign = 'left';
      const prog = E.inOut(S(t0 + 0.2, 12.2)), N = 40, pts = [];
      for (let i = 0; i <= N; i++) { const u = i / N, acc = 61 + 36 * (1 - Math.pow(1 - u, 2.2)) + Math.sin(i * 2.3) * 1.2 * (1 - u); pts.push([gx + u * gw, gy - (acc - 50) / 50 * gh]); }
      const m = Math.floor(prog * N);
      c.strokeStyle = RED; c.lineWidth = 5; c.lineJoin = 'round'; c.beginPath(); for (let i = 0; i <= m; i++) i ? c.lineTo(...pts[i]) : c.moveTo(...pts[i]); c.stroke();
      if (m > 0) { c.fillStyle = RED; c.beginPath(); c.arc(pts[m][0], pts[m][1], 8, 0, 7); c.fill(); }
      const acc = Math.round(H.lerp(61, 97, prog));
      const em = E.out(S(12.15, 12.35)); // emphasis: red block slams behind the final number
      if (em > 0) { c.fillStyle = RED; c.fillRect(colX(8) - 8, 236, (colX(11) + COLW - colX(8) + 16) * em, 190); }
      c.font = '800 150px "Inter"'; c.letterSpacing = '-8px'; c.fillStyle = em >= 1 ? PAPER : BLACK; c.fillText(acc + '%', colX(8), 390); c.letterSpacing = '0px';
      txt('Accuracy per round', colX(8), 222, 28, 600); txt('61% → 97%', colX(8), 470, 36, 800, BLACK, -1);
    }

    // ---------- page 3: takeaway ----------
    if (page === 3) {
      const t0 = swap(WIPES[2]);
      c.font = '800 112px "Inter"'; c.letterSpacing = '-5px'; c.fillStyle = BLACK;
      const r1 = E.inOut(S(t0, t0 + 0.4)), r2 = E.inOut(S(t0 + 0.15, t0 + 0.55));
      c.save(); c.beginPath(); c.rect(0, 190, W, 154); c.clip(); c.fillText('More examples', M - 5, 318 + (1 - r1) * 130); c.restore();
      c.save(); c.beginPath(); c.rect(0, 344, W, 150); c.clip(); c.fillText('better guesses.', M - 5 + 160, 458 + (1 - r2) * 130); c.restore();
      c.letterSpacing = '0px';
      rule(c, M + 6, 410, M + 140, 410, E.out(S(t0 + 0.3, t0 + 0.6)), 12, RED);
      c.fillStyle = BLACK; c.fillRect(colX(0), 560, (colX(11) + COLW - colX(0)) * E.out(S(t0 + 0.3, t0 + 0.8)), 2);
      if (t > t0 + 0.6) { txt('1,000,000 examples', colX(0), 598, 28, 600); txt('Guess · Check · Adjust', colX(4), 598, 28, 600); txt('61% → 97% accuracy', colX(8), 598, 28, 600, RED); }
    }

    // ---------- the column wipes ----------
    for (const w of WIPES) {
      if (t < w || t > w + 1.2) continue;
      c.fillStyle = w === WIPES[2] ? BLACK : RED;
      for (let i = 0; i < 12; i++) { const a = E.inOut(S(w + i * 0.025, w + i * 0.025 + 0.28)), b = E.inOut(S(w + 0.6 + i * 0.025, w + 0.88 + i * 0.025)); const x = i * W / 12; if (a > b) c.fillRect(x, b * HH, W / 12 + 1, (a - b) * HH); }
    }

    // ---------- offset-print finish ----------
    const img = c.getImageData(0, 0, W, HH), d = img.data, n1 = exField('n1', W, HH, 3, 3, 2), n2 = exField('n2', W, HH, 8, 60, 3), sm = speckMask(W, HH);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) { if (!d[i + 3]) continue; d[i + 3] *= Math.max(0, 1 - 0.07 * Math.max(0, n1[p] * 1.5 + n2[p]) - sm[p]); }
    c.putImageData(img, 0, 0);
    ctx.save(); ctx.globalAlpha = 0.12; ctx.filter = 'blur(1.2px)'; ctx.drawImage(L, 0, 0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0); ctx.restore();
    const pi = ctx.getImageData(0, 0, W, HH), pd = pi.data, fib = exField('fib', W, HH, 21, 2, 2, 3, 0.6), lo = exField('lo', W, HH, 22, 30, 3), rg = H.rng(99 + Math.floor(t * 12));
    for (let i = 0, p = 0; i < pd.length; i += 4, p++) { const s = 1 + fib[p] * 0.022 + lo[p] * 0.02 + (rg() - 0.5) * 0.03; pd[i] *= s; pd[i + 1] *= s; pd[i + 2] *= s; }
    ctx.putImageData(pi, 0, 0);
    H.vignette(ctx, W, HH, 0.07, '40,30,20');
  };

  registerStyle({
    id: 'swiss-grid',
    name: 'International Typographic Style',
    category: 'Art & Design Movements',
    description: 'A 1960s Zürich-school concert-style poster: strict 12-column modular grid, enormous flush-left grotesk set tight, an asymmetric field of rotating concentric arc segments over a red disc, and small precise info blocks hung from the grid — red, black and white only.',
    motion: 'Rules draw out along the grid, the red disc opens and the ring segments spin in and decelerate until they lock onto a 22.5° module; the headline rises line by line out of its baseline masks and the info blocks step in column by column, then the rings drift like a slow mechanical score.',
    fonts: ['800 180px "Inter"', '600 13px "Inter"', '400 13px "Inter"'],
    frameT: 4.6,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'A Zürich-school information sequence on the same 12-column grid: the headline shrinks into a running header, pages change with a column-by-column red wipe, hairline rules with solid heads carry cause and flow, numbers count in Inter 800 and the key result gets a red block slammed behind it.',
    explainer(ctx, W, HH, t) { explainSwiss(ctx, W, HH, t); },
    // Sound: clean and exact. Page wipes are a riffle of 12 sheets falling column by column (left to right), set type
    // lands with a dry tap, hairline rules get a faint ruling-pen draw, counters click like a fine mechanical counter,
    // and the few tonal moments (wrong, correct, 97%, takeaway) are plain soft sine chimes. Times copied from explainSwiss().
    explainerSound(k) {
      const D = 15, E = H.ease, cl = H.clamp;
      const S = (t, a, b) => cl((t - a) / (b - a), 0, 1);
      const M = 48, PITCH = 100, colX = (i) => M + i * PITCH; // grid, as in explainSwiss
      const pan = (px) => cl((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (a, b, ease, u) => { for (let i = 0; i <= 400; i++) if (ease(i / 400) >= u - 1e-6) return a + ((b - a) * i) / 400; return b; };
      const backLand = (a, b) => a + (b - a) * 0.37; // back ease first reaches full size at 37%
      const WIPES = [5.8, 10.3, 12.7], swap = (w) => w + 0.58;
      // dry tap: set type or a pictogram landing on the sheet
      const tap = (t, g, p, minor = true) => { k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1700, q: 1.2, gain: 0.3 * g, a: 0.001, pan: p, minor }); k.tone(t, { f: 190, dur: 0.05, gain: 0.12 * g, pan: p, minor }); };
      // fine mechanical counter click
      const cnt = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.018, filter: 'bandpass', f: 3000, q: 2, gain: 0.34 * g, a: 0.001, pan: p }); k.tone(t, { f: 700, type: 'triangle', dur: 0.025, gain: 0.04 * g, pan: p }); });
      // ruling pen along a hairline: faint, smooth, low
      const ruleDraw = (t, dur, g, p) => k.noise(t, { dur: dur + 0.05, color: 'pink', filter: 'bandpass', f: [[0, 800], [dur, 1200]], q: 1, gain: 0.06 * g, a: dur * 0.3, pan: p, minor: true });
      // the column wipe: 12 sheets drop one after another, left to right, landing at w + i*0.025 + 0.28
      const riffle = (w, g) => {
        k.noise(w + 0.05, { dur: 0.55, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.3, 1100], [0.55, 600]], q: 0.8, gain: 0.05 * g, a: 0.22 });
        for (let i = 0; i < 12; i++) { const ti = w + i * 0.025 + 0.28, p = (i / 11 - 0.5) * 1.4;
          k.noise(ti, { dur: 0.035, filter: 'bandpass', f: 1300 + (i % 3) * 180, q: 1, gain: 0.24 * g, a: 0.002, pan: p }); k.tone(ti, { f: 150, dur: 0.05, gain: 0.05 * g, pan: p }); }
      };
      // plain soft sine chime (kept low: no high pings)
      const chime = (t, n, g, p, minor) => { const f = k.hz(n); k.tone(t, { f, dur: 1.1, gain: 0.16 * g, a: 0.004, pan: p, verb: 0.25, minor }); k.tone(t, { f: f * 2, dur: 0.35, gain: 0.03 * g, a: 0.003, pan: p, minor }); };

      k.bed('room', 0, D, { gain: 0.3 });

      // ---- hook: header rule (0-0.7), headline rises line by line (inOut 0.15-0.65, 0.35-0.85), red disc (back 0.5-1.0)
      ruleDraw(0.0, 0.65, 1, -0.2);
      tap(when(0.15, 0.65, E.inOut, 0.97), 1.1, -0.5, false);
      tap(when(0.35, 0.85, E.inOut, 0.97), 1.1, -0.3, false);
      k.play('thud', backLand(0.5, 1.0), { f: 120, gain: 0.45, pan: pan(942) });
      tap(backLand(0.5, 1.0), 0.6, pan(942));
      // headline shrinks into the running header (1.7-2.4): a soft slide
      k.noise(1.7, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 350], [0.7, 800]], q: 0.7, gain: 0.07, a: 0.3, pan: -0.4, minor: true });

      // ---- page 0: DATA
      ruleDraw(2.4, 0.5, 1, pan(300));
      tap(backLand(2.6, 2.9), 0.9, pan(90));  // cat pictogram
      tap(backLand(2.75, 3.05), 0.9, pan(290)); // dog pictogram
      k.play('tock', when(2.9, 3.4, E.out, 0.97), { f: 330, gain: 0.5, pan: pan(900), minor: true }); // model block set
      tap(3.32, 0.8, pan(184)); tap(3.46, 0.8, pan(384)); // "cat" / "dog" labels at the leader heads
      // matrix fills in reading order: a soft tap each time a row of 16 completes (n = 128 * S(3.2,5.5)^0.8)
      const rows = []; for (let r = 1; r <= 8; r++) rows.push(3.2 + 2.3 * Math.pow(r / 8, 1.25));
      rows.forEach((t) => { if (Math.abs(t - 3.32) > 0.08 && Math.abs(t - 3.46) > 0.08) tap(t, 0.45, pan(330), true); });
      // counter n = S(3.0,5.6)^3 * 1e6: clicks speeding up, keeping clear of the row taps
      for (let t = 3.05; t < 5.52; ) { const s = S(t, 3.0, 5.6); if (![...rows, 3.32, 3.46].some((r) => t > r - 0.07 && t < r + 0.08)) cnt(t, 0.8 + 0.3 * s, pan(900)); t += 0.16 - 0.075 * s; }
      k.play('thud', 5.6, { f: 150, gain: 0.55, pan: pan(900) }); tap(5.6, 1.2, pan(900), false); // 1,000,000 set

      // ---- page wipes
      riffle(WIPES[0], 1); riffle(WIPES[0] + 0.6, 0.6); // red columns fall, then lift off the new page
      riffle(WIPES[1], 1); riffle(WIPES[1] + 0.6, 0.6);
      riffle(WIPES[2], 1); riffle(WIPES[2] + 0.6, 0.6);

      // ---- page 1: GUESS / CHECK / ADJUST (t0 = swap(5.8) = 6.38)
      const p1 = swap(WIPES[0]);
      tap(backLand(p1 + 0.15, p1 + 0.5), 0.8, pan(130)); // cat picture + nodes
      // forward pass (7.0-7.6): a quiet travelling sweep left -> right
      k.noise(7.0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 600], [0.6, 1500]], q: 1.5, gain: 0.07, a: 0.2, pan: 0.1, minor: true });
      tap(7.5, 1, pan(980), false); // "dog?" set, output node ringed
      // check (7.75-8.0): red strike, cross — the wrong guess
      k.noise(7.75, { dur: 0.12, filter: 'bandpass', f: [[0, 900], [0.12, 2200]], q: 0.8, gain: 0.18, a: 0.01, pan: pan(1060) });
      k.play('thud', 7.82, { f: 110, gain: 0.7, pan: pan(1150) });
      k.tone(7.82, { f: 'A2', type: 'triangle', dur: 0.5, gain: 0.16, a: 0.005, filter: 'lowpass', f2: 900, pan: pan(1150) });
      k.tone(7.82, { f: 'Bb2', type: 'triangle', dur: 0.5, gain: 0.14, a: 0.005, filter: 'lowpass', f2: 900, pan: pan(1150) });
      // error flows back right -> left (7.85-8.45)
      k.noise(7.9, { dur: 0.55, color: 'pink', filter: 'bandpass', f: [[0, 1400], [0.55, 500]], q: 1.5, gain: 0.08, a: 0.15, pan: -0.1, minor: true });
      // weights re-set (inOut 8.35-9.2): fine detents, at least 90 ms apart
      for (let i = 1, lt = 0; i <= 8; i++) { const t = when(8.35, 9.2, E.inOut, i / 8); if (t - lt < 0.09) continue; lt = t; cnt(t, 0.9, pan(500)); }
      ruleDraw(9.0, 0.5, 1, pan(500)); // loop return rule
      tap(9.5, 0.8, pan(450)); // "repeat"
      tap(9.4, 0.8, pan(980)); // "cat" set
      // the correction: check mark + red rule + "Correct." (9.6-9.9)
      chime(9.62, 'C5', 1, pan(1100)); chime(9.72, 'G5', 0.9, pan(1100));

      // ---- page 2: PROGRESS (t0 = swap(10.3) = 10.88)
      const p2 = swap(WIPES[1]);
      ruleDraw(p2, 0.3, 1, pan(400));
      k.play('stroke', p2 + 0.2, { material: 'pen', dur: 12.2 - p2 - 0.2, gain: 0.18, pan: pan(400), minor: true }); // red line inks along
      for (let t = p2 + 0.22, last = 61, lt = -1; t < 12.12; t += 1 / 120) {
        const v = Math.round(H.lerp(61, 97, E.inOut(S(t, p2 + 0.2, 12.2))));
        if (v !== last && t - lt >= 1 / 11) { cnt(t, 0.9, pan(1000)); last = v; lt = t; }
      }
      // 97%: the red block slams in behind the number (12.15-12.35) — the biggest hit
      const slam = when(12.15, 12.35, E.out, 0.9);
      k.play('impact', slam, { gain: 1.2, pan: pan(1000) });
      k.play('thud', slam, { f: 140, gain: 0.6, pan: pan(1000) });
      ['C4', 'G4', 'C5'].forEach((n, i) => chime(slam + 0.01, n, 0.8, pan(1000) + (i - 1) * 0.15));

      // ---- page 3: TAKEAWAY (t0 = swap(12.7) = 13.28): two lines rise in, red rule, hairline, footnotes
      const p3 = swap(WIPES[2]);
      tap(when(p3, p3 + 0.4, E.inOut, 0.97), 1, -0.3, false);
      tap(when(p3 + 0.15, p3 + 0.55, E.inOut, 0.97), 1, 0.1, false);
      ruleDraw(p3 + 0.3, 0.5, 1, 0);
      ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => chime(p3 + 0.6 + i * 0.06, n, 0.55 - i * 0.06, (i - 1.5) * 0.25)); // resolves as the footnotes set
    },
    draw(ctx, W, HH, t) {
      const M = 48, PITCH = 100, COLW = 84;
      const colX = (i) => M + i * PITCH;
      const P = (d, dur = 0.6) => H.ease.out(H.clamp((t - d) / dur, 0, 1));

      // ---------- paper ----------
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, HH);

      // ---------- art layer (all inks) ----------
      const L = H.layer(W, HH), c = L.getContext('2d');

      // red disc
      const ox = 958, oy = 262;
      c.fillStyle = RED;
      c.beginPath(); c.arc(ox, oy, 205 * P(0.2, 0.8), 0, Math.PI * 2); c.fill();

      // concentric arc segments (the "score")
      const rr = H.rng(404);
      c.strokeStyle = BLACK; c.lineCap = 'butt';
      for (let k = 0; k < 17; k++) {
        const rad = 46 + k * 19;
        const lw = H.lerp(12, 5, k / 16);
        const Q = Math.PI / 8; // angles snap to a 22.5° module at the hero frame
        const len = rr.int(2, 9) * Q;
        const spd = rr.range(-0.4, 0.4);
        // the rings spin in and decelerate onto the module (locked at t=3.2), then drift very slowly
        const settle = t < 3.2 ? -Math.pow(3.2 - t, 2) * 0.9 : (t - 3.2) * 0.05;
        const a0 = rr.int(0, 15) * Q + settle * spd * 2.2;
        const grow = P(0.4 + k * 0.06, 0.9);
        c.lineWidth = lw;
        c.beginPath(); c.arc(ox, oy, rad, a0, a0 + len * grow); c.stroke();
        if (rr() < 0.45) { // a second, shorter segment on the same ring
          const b0 = a0 + len + rr.int(1, 3) * Q;
          c.beginPath(); c.arc(ox, oy, rad, b0, b0 + rr.int(1, 3) * Q * grow); c.stroke();
        }
      }
      // one red ring segment outside the disc, bleeding off the top edge
      c.strokeStyle = RED; c.lineWidth = 6;
      { const g = P(1.3, 0.8); if (g > 0) { c.beginPath(); c.arc(ox, oy, 46 + 17 * 19, -Math.PI * 0.95 + t * 0.12, -Math.PI * 0.95 + t * 0.12 + Math.PI * 0.6 * g); c.stroke(); } }
      // centre point
      const cp = H.ease.back(H.clamp((t - 0.9) / 0.35, 0, 1));
      c.fillStyle = PAPER; c.beginPath(); c.arc(ox, oy, 14 * cp, 0, 7); c.fill();
      c.fillStyle = BLACK; c.beginPath(); c.arc(ox, oy, 6 * cp, 0, 7); c.fill();

      // ---------- headline: huge, flush left, tight ----------
      c.fillStyle = BLACK; c.textBaseline = 'alphabetic';
      c.letterSpacing = '0px';
      c.font = '800 100px "Inter"';
      const targetW = colX(7) + COLW - M; // span cols 0..7
      c.letterSpacing = '-5px';
      const w100 = c.measureText('Networks').width;
      const fs = Math.floor(100 * targetW / w100);
      c.font = `800 ${fs}px "Inter"`; c.letterSpacing = `${-(fs * 0.045).toFixed(1)}px`;
      const baseB = HH - M - 2, lead = fs * 0.84;
      // each line rises out of its own baseline mask
      const rise = (txt, d, yb) => { const p = H.ease.inOut(H.clamp((t - d) / 0.55, 0, 1)); if (p <= 0) return; c.save(); c.beginPath(); c.rect(0, yb - fs * 0.86, W, fs * 0.86 + fs * 0.06); c.clip(); c.fillText(txt, M - fs * 0.055, yb + (1 - p) * fs * 0.9); c.restore(); };
      rise('Neural', 0.95, baseB - lead);
      rise('Networks', 1.15, baseB);
      c.letterSpacing = '0px';

      // ---------- grid-hung info blocks ----------
      const small = (txt, x, y, wgt = 400, col = BLACK) => { c.font = `${wgt} 13px "Inter"`; c.fillStyle = col; c.fillText(txt, x, y); };
      const LH = 17;
      const top = M + 12;
      const blk = (d) => { const p = P(d, 0.3); c.restore(); c.save(); c.globalAlpha = p; c.translate(0, (1 - p) * 10); };
      c.save();
      c.fillStyle = BLACK; c.fillRect(colX(0), M - 2, (colX(5) + COLW - colX(0)) * H.ease.inOut(H.clamp(t / 0.6, 0, 1)), 3);
      blk(1.65);
      small('Lecture series', colX(0), top + 14, 600);
      small('Machine', colX(0), top + 14 + LH);
      small('Intelligence', colX(0), top + 14 + LH * 2);

      blk(1.77);
      small('Thursday', colX(2), top + 14, 600);
      small('14 November 2026', colX(2), top + 14 + LH);
      small('19.30 h', colX(2), top + 14 + LH * 2);

      blk(1.89);
      small('Auditorium E1', colX(4), top + 14, 600);
      small('School of Design', colX(4), top + 14 + LH);
      small('Free admission', colX(4), top + 14 + LH * 2);

      // big red issue number on grid
      blk(1.7);
      c.font = `800 64px "Inter"`; c.letterSpacing = '-3px'; c.fillStyle = RED;
      c.fillText('04', colX(0) - 3, top + 14 + LH * 2 + 72);
      c.letterSpacing = '0px';
      blk(2.05);
      small('How machines learn', colX(2), top + 14 + LH * 4 + 6, 600);
      small('to see patterns —', colX(2), top + 14 + LH * 5 + 6);
      small('weights, layers and', colX(2), top + 14 + LH * 6 + 6);
      small('the gradient descent.', colX(2), top + 14 + LH * 7 + 6);

      // bottom-right block under the arc field
      const by = HH - M - LH * 3 + 4;
      c.restore(); c.save();
      c.fillStyle = BLACK; c.fillRect(colX(9), by - 22, (colX(11) + COLW - colX(9)) * H.ease.inOut(H.clamp((t - 0.15) / 0.6, 0, 1)), 3);
      blk(2.2);
      small('Talk 04 / 12', colX(9), by, 600);
      small('Layers, signals,', colX(9), by + LH);
      small('feedback', colX(9), by + LH * 2);
      blk(2.32);
      small('Speaker', colX(11) - 16, by, 600);
      small('Dr. A. Lenz', colX(11) - 16, by + LH);
      small('Zürich', colX(11) - 16, by + LH * 2);
      // tiny vertical colophon on the right margin
      blk(2.5);
      c.save(); c.translate(W - 20, M); c.rotate(Math.PI / 2); small('Printed in Switzerland · Offset 2-colour · 128 × 90.5 cm', 0, 0, 400); c.restore();
      c.restore(); c.globalAlpha = 1;

      // ---------- offset-print finish on the ink layer ----------
      const img = c.getImageData(0, 0, W, HH), d = img.data;
      const n1 = exField('n1', W, HH, 3, 3, 2), n2 = exField('n2', W, HH, 8, 60, 3), r = H.rng(12);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        if (!d[i + 3]) continue;
        const a = 1 - 0.07 * Math.max(0, n1[p] * 1.5 + n2[p]) - (r() < 0.0015 ? 0.5 : 0);
        d[i + 3] *= a;
      }
      c.putImageData(img, 0, 0);
      // slight dot gain halo: draw the layer once blurred faint, then crisp
      ctx.save(); ctx.globalAlpha = 0.12; ctx.filter = 'blur(1.2px)'; ctx.drawImage(L, 0, 0); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0); ctx.restore();

      // paper fibre + grain
      const pi = ctx.getImageData(0, 0, W, HH), pd = pi.data, fib = exField('fib', W, HH, 21, 2, 2, 3, 0.6), lo = exField('lo', W, HH, 22, 30, 3), rg = H.rng(99);
      for (let i = 0, p = 0; i < pd.length; i += 4, p++) {
        const s = 1 + fib[p] * 0.022 + lo[p] * 0.02 + (rg() - 0.5) * 0.035;
        pd[i] *= s; pd[i + 1] *= s; pd[i + 2] *= s;
      }
      ctx.putImageData(pi, 0, 0);
      H.vignette(ctx, W, HH, 0.07, '40,30,20');
    },
  });
}
