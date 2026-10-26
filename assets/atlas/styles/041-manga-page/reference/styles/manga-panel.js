{
  // ---------- black & white manga page ----------
  const TAU = Math.PI * 2;
  function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
  function catmull(pts, n = 8, closed = false) {
    const out = [], N = pts.length, get = (i) => closed ? pts[(i + N) % N] : pts[Math.max(0, Math.min(N - 1, i))];
    const segs = closed ? N : N - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((j) => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    if (!closed) out.push(pts[N - 1]);
    return out;
  }
  // brush stroke with taper: pts polyline, w max width, prof(t) width profile
  function brush(ctx, pts, w, prof = (t) => Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, t))), 0.55)) {
    const n = pts.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1;
      const ww = w * prof(i / (n - 1)) / 2 + 0.25;
      L.push([pts[i][0] - ty / m * ww, pts[i][1] + tx / m * ww]); R.push([pts[i][0] + ty / m * ww, pts[i][1] - tx / m * ww]);
    }
    ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]); for (const p of L) ctx.lineTo(p[0], p[1]); for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath(); ctx.fill();
  }
  const bz = (p0, p1, p2, p3, n = 24) => { const o = []; for (let k = 0; k <= n; k++) { const t = k / n, m = 1 - t; o.push([m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0], m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]); } return o; };
  // radial focus lines (集中線)
  function focusLines(ctx, cx, cy, r0, r1, n, r, wMax = 4.5) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = r() * TAU, w = r.range(0.4, wMax) * (r.chance(0.15) ? 2 : 1), ri = r0 * r.range(1, 1.6), da = w / r1;
      ctx.moveTo(cx + Math.cos(a) * ri, cy + Math.sin(a) * ri);
      ctx.lineTo(cx + Math.cos(a - da) * r1, cy + Math.sin(a - da) * r1);
      ctx.lineTo(cx + Math.cos(a + da) * r1, cy + Math.sin(a + da) * r1);
      ctx.closePath();
    }
    ctx.fill();
  }
  // hand-brushed katakana for SFX (stroke paths in a unit box; each stroke tapers like a brush)
  const KANA = {
    'コ': [[[0.12, 0.22], [0.5, 0.2], [0.82, 0.18], [0.84, 0.5], [0.86, 0.86]], [[0.14, 0.86], [0.5, 0.86], [0.86, 0.86]]],
    'ゴ': [[[0.08, 0.26], [0.45, 0.24], [0.76, 0.22], [0.78, 0.55], [0.8, 0.9]], [[0.1, 0.9], [0.45, 0.9], [0.8, 0.9]], [[0.86, 0.02], [0.9, 0.16]], [[0.99, -0.02], [1.03, 0.12]]],
    'ピ': [[[0.24, 0.08], [0.22, 0.5], [0.26, 0.86], [0.55, 0.88], [0.86, 0.84]], [[0.24, 0.5], [0.5, 0.42], [0.74, 0.32]], ['o', 0.9, 0.12, 0.09]],
    'ッ': [[[0.18, 0.36], [0.26, 0.56]], [[0.44, 0.3], [0.52, 0.5]], [[0.82, 0.3], [0.78, 0.62], [0.55, 0.86], [0.3, 0.98]]],
    'ド': [[[0.38, 0.02], [0.38, 0.5], [0.38, 0.98]], [[0.4, 0.4], [0.6, 0.48], [0.78, 0.6]], [[0.74, 0.04], [0.78, 0.18]], [[0.88, 0.0], [0.92, 0.14]]],
    'ク': [[[0.42, 0.04], [0.3, 0.26], [0.12, 0.46]], [[0.36, 0.2], [0.6, 0.2], [0.86, 0.2], [0.76, 0.56], [0.5, 0.84], [0.24, 0.98]]],
    'ン': [[[0.14, 0.16], [0.26, 0.24], [0.38, 0.36]], [[0.12, 0.92], [0.5, 0.78], [0.76, 0.52], [0.92, 0.22]]],
  };
  function kanaStrokes(ctx, ch, x, y, size, rot, skew, extra, prof) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.transform(1, 0, skew, 1, 0, 0);
    for (const st of KANA[ch]) {
      if (st[0] === 'o') { ctx.beginPath(); ctx.arc((st[1] - 0.5) * size, (st[2] - 0.5) * size, st[3] * size, 0, TAU); ctx.lineWidth = size * 0.05 + extra * 2; ctx.stroke(); continue; }
      const pts = catmull(st.map(([u, v]) => [(u - 0.5) * size, (v - 0.5) * size]), 6);
      const n = pts.length, L = [], R = [];
      for (let i = 0; i < n; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1;
        const tt = i / (n - 1), ww = size * 0.14 * prof(tt, st.length) / 2 + extra;
        L.push([pts[i][0] - ty / m * ww, pts[i][1] + tx / m * ww]); R.push([pts[i][0] + ty / m * ww, pts[i][1] - tx / m * ww]);
      }
      ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]); for (const p of L) ctx.lineTo(p[0], p[1]);
      // rounded brush head
      for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], size * 0.14 * prof(0, st.length) / 2 + extra, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  function sfx(ctx, ch, x, y, size, rot, skew = -0.2, outline = 8) {
    const prof = (tt, len) => len <= 2 ? (1.25 - tt * 0.9) : (1.1 - 0.75 * Math.pow(tt, 1.6));
    ctx.save(); ctx.lineCap = 'round';
    ctx.fillStyle = '#000'; ctx.strokeStyle = '#000'; kanaStrokes(ctx, ch, x, y, size, rot, skew, outline + 2.2, prof);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; kanaStrokes(ctx, ch, x, y, size, rot, skew, outline, prof);
    ctx.fillStyle = '#000'; ctx.strokeStyle = '#000'; kanaStrokes(ctx, ch, x, y, size, rot, skew, 0, prof);
    ctx.restore();
  }
  function bubble(ctx, cx, cy, rx, ry, tail, lines, font, lh, r) {
    const pts = [];
    for (let k = 0; k < 60; k++) { const a = k / 60 * TAU; pts.push([cx + Math.cos(a) * rx * (1 + 0.03 * Math.sin(a * 3)), cy + Math.sin(a) * ry]); }
    // tail
    const ta = Math.atan2(tail[1] - cy, tail[0] - cx);
    const b1 = [cx + Math.cos(ta - 0.22) * rx * 0.85, cy + Math.sin(ta - 0.22) * ry * 0.85], b2 = [cx + Math.cos(ta + 0.22) * rx * 0.85, cy + Math.sin(ta + 0.22) * ry * 0.85];
    const tailP = [b1, [(b1[0] + tail[0]) / 2 + 6, (b1[1] + tail[1]) / 2 - 4], tail, [(b2[0] + tail[0]) / 2 + 2, (b2[1] + tail[1]) / 2 + 2], b2];
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2.6;
    poly(ctx, pts); ctx.stroke(); poly(ctx, tailP); ctx.stroke();
    poly(ctx, pts); ctx.fill(); poly(ctx, tailP); ctx.fill();
    ctx.fillStyle = '#000'; ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((l, i) => ctx.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * lh));
    ctx.restore();
  }

  // ===== EXPLAINER HELPERS =====
  // extra hand-built katakana for the explainer SFX
  Object.assign(KANA, {
    'ブ': [[[0.12, 0.22], [0.5, 0.2], [0.84, 0.2], [0.72, 0.6], [0.36, 0.96]], [[0.86, 0.0], [0.9, 0.14]], [[0.99, -0.03], [1.03, 0.11]]],
    'ー': [[[0.06, 0.5], [0.5, 0.48], [0.94, 0.5]]],
    'カ': [[[0.12, 0.3], [0.5, 0.29], [0.84, 0.27], [0.83, 0.62], [0.76, 0.92], [0.6, 0.84]], [[0.46, 0.04], [0.42, 0.5], [0.14, 0.96]]],
    'チ': [[[0.78, 0.06], [0.5, 0.16], [0.24, 0.22]], [[0.1, 0.46], [0.5, 0.44], [0.9, 0.44]], [[0.52, 0.2], [0.52, 0.62], [0.3, 0.96]]],
    'ポ': [[[0.1, 0.32], [0.5, 0.31], [0.82, 0.3]], [[0.46, 0.04], [0.46, 0.6], [0.44, 0.94]], [[0.28, 0.54], [0.12, 0.8]], [[0.64, 0.54], [0.82, 0.8]], ['o', 0.9, 0.1, 0.08]],
    'グ': [[[0.4, 0.04], [0.28, 0.26], [0.1, 0.46]], [[0.34, 0.2], [0.58, 0.2], [0.82, 0.2], [0.72, 0.56], [0.46, 0.84], [0.2, 0.98]], [[0.86, 0.0], [0.9, 0.14]], [[0.99, -0.03], [1.03, 0.11]]],
  });
  // cached screentone dot patterns (45 degree grid). Large tile (16x16 cells) with per-dot ink-spread jitter so the
  // tone reads as printed Letratone, not a clean vector pattern.
  const TONES = {};
  function tone(ctx, d) {
    const key = Math.round(d * 20);
    if (!TONES[key]) {
      const p = 5.4 * Math.SQRT2, NC = 16, c = H.layer(Math.round(p * NC), Math.round(p * NC)), x = c.getContext('2d'), s = c.width / NC;
      const rr = Math.min(s * 0.5, s / Math.SQRT2 * Math.sqrt((key / 20) / Math.PI) * 1.0), jr = H.rng(400 + key);
      x.fillStyle = '#111';
      const J = []; for (let i = 0; i < NC; i++) { J.push([]); for (let j = 0; j < NC; j++) J[i].push([jr.range(0.86, 1.1), jr.range(0.86, 1.1), jr.range(-0.3, 0.3), jr.range(-0.3, 0.3)]); }
      for (let i = -1; i <= NC; i++) for (let j = -1; j <= NC; j++) {
        const q = J[(i + NC) % NC][(j + NC) % NC];
        [[i * s, j * s, q[0]], [i * s + s / 2, j * s + s / 2, q[1]]].forEach(([px, py, f]) => { x.beginPath(); x.ellipse(px + q[2], py + q[3], rr * f, rr * f * 0.94, q[2] * 3, 0, TAU); x.fill(); });
      }
      TONES[key] = ctx.createPattern(c, 'repeat');
    }
    return TONES[key];
  }
  // gradated screentone (gradation tone) in a w x h box: density lerps d0 -> d1 along y. Cached.
  const GTONES = {};
  function gradTone(w, h, d0, d1, y0 = 0, y1 = h, fx0 = w, fx1 = w + 1) {
    const key = [w, h, d0, d1, y0, y1, fx0, fx1].join(',');
    if (!GTONES[key]) {
      const c = H.layer(w, h), x = c.getContext('2d'), p = 5.4, c45 = Math.SQRT1_2, N = Math.ceil((w + h) / p) + 2, jr = H.rng(91);
      x.fillStyle = '#111'; x.beginPath();
      for (let i = -N; i < N; i++) for (let j = 0; j < N; j++) {
        const px = (i + j) * p * c45, py = (j - i) * p * c45;
        if (px < -4 || py < -4 || px > w + 4 || py > h + 4) continue;
        const d = H.lerp(d0, d1, H.clamp((py - y0) / (y1 - y0))) * (1 - H.clamp((px - fx0) / (fx1 - fx0)));
        if (d < 0.02) continue;
        const rad = Math.min(p * 0.72, p * Math.sqrt(d / Math.PI)) * jr.range(0.88, 1.08);
        x.moveTo(px + rad, py); x.arc(px, py, rad, 0, TAU);
      }
      x.fill(); GTONES[key] = c;
    }
    return GTONES[key];
  }
  // closed brush-inked loop: line weight swells on the shadow side (normal facing down-right), thin on the lit side
  function inkLoop(c, pts, w, jr) {
    const n = pts.length, L = [], R = [];
    let area = 0; for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
    const sgn = area > 0 ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n], tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1;
      const nx = ty / m * sgn, ny = -tx / m * sgn; // outward normal
      const lit = H.clamp(nx * 0.55 + ny * 0.83, -1, 1);
      const ww = w * (0.62 + 0.38 * lit) / 2 + 0.3;
      const jx = jr ? jr.range(-0.8, 0.8) : 0, jy = jr ? jr.range(-0.8, 0.8) : 0;
      const px = pts[i][0] + jx * 0.5, py = pts[i][1] + jy * 0.5;
      L.push([px + nx * ww, py + ny * ww]); R.push([px - nx * ww * 0.85, py - ny * ww * 0.85]);
    }
    c.beginPath(); c.moveTo(L[0][0], L[0][1]); for (const p of L) c.lineTo(p[0], p[1]); c.closePath();
    c.moveTo(R[0][0], R[0][1]); for (let i = n - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]); c.closePath();
    c.fill('evenodd');
  }
  const rrPts = (x, y, w, h, rad, n = 6) => {
    const o = [], cs = [[x + w - rad, y + rad, -Math.PI / 2], [x + w - rad, y + h - rad, 0], [x + rad, y + h - rad, Math.PI / 2], [x + rad, y + rad, Math.PI]];
    cs.forEach(([cx, cy, a0]) => { for (let k = 0; k <= n; k++) { const a = a0 + k / n * Math.PI / 2; o.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); } });
    return o;
  };
  const ellPts = (cx, cy, rx, ry, n = 36, a0 = 0, a1 = TAU, closed = true) => { const o = []; const m = closed ? n : n + 1; for (let k = 0; k < m; k++) { const a = a0 + (a1 - a0) * k / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  // non-photo-blue layout rough for a panel that is not inked yet: doubled overshooting frame + loose gesture strokes
  function pencilRough(c, P) {
    const sd = Math.round(P[0][0] * 7 + P[0][1] * 13 + P[2][0] * 3 + P[2][1]), r = H.rng(500 + sd);
    const cc = P.reduce((a, q) => [a[0] + q[0] / P.length, a[1] + q[1] / P.length], [0, 0]);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; P.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
    const pw = x1 - x0, ph = y1 - y0;
    const wob = (pts) => { c.beginPath(); pts.forEach((q, i) => { const x = q[0] + r.range(-0.9, 0.9), y = q[1] + r.range(-0.9, 0.9); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); };
    const seg = (a, b, n = 6) => { const o = []; for (let k = 0; k <= n; k++) o.push([H.lerp(a[0], b[0], k / n), H.lerp(a[1], b[1], k / n)]); return o; };
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = 'rgba(110,170,215,0.75)'; c.lineWidth = 1.2;
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1, e0 = r.range(8, 14) + pass * 4, e1 = r.range(8, 14) - pass * 3, o = pass ? r.range(-2.2, 2.2) : 0;
      wob(seg([a[0] - dx / m * e0 + o, a[1] - dy / m * e0 - o], [b[0] + dx / m * e1 + o, b[1] + dy / m * e1 - o]));
    }
    c.save(); poly(c, P); c.clip();
    c.strokeStyle = 'rgba(110,170,215,0.42)'; c.lineWidth = 1.4;
    // perspective / composition diagonals
    wob(seg([x0 + pw * r.range(0, 0.2), y1], [cc[0] + r.range(-40, 40), y0 + ph * r.range(0.2, 0.4)], 10));
    wob(seg([x1 - pw * r.range(0, 0.2), y1], [cc[0] + r.range(-40, 40), y0 + ph * r.range(0.2, 0.4)], 10));
    // figure gestures: loose double ovals
    const nf = 2 + (r() * 2 | 0);
    for (let k = 0; k < nf; k++) {
      const fx = x0 + pw * r.range(0.15, 0.85), fy = y0 + ph * r.range(0.3, 0.7), rx = Math.min(pw, ph) * r.range(0.1, 0.2), ry = rx * r.range(0.7, 1.2);
      for (let q = 0; q < 2; q++) wob(ellPts(fx + r.range(-3, 3), fy + r.range(-3, 3), rx * r.range(0.95, 1.06), ry * r.range(0.95, 1.06), 28, r() * TAU, r() * TAU + TAU * 1.05, false));
      wob(seg([fx, fy + ry], [fx + r.range(-20, 20), fy + ry + rx * 1.4], 6));
    }
    // a balloon placeholder and some scribbled tone-indication hatching
    { const bx = x0 + pw * r.range(0.2, 0.8), by = y0 + ph * 0.18, brx = Math.min(90, pw * 0.12); wob(ellPts(bx, by, brx, brx * 0.55, 30, 0, TAU * 1.04, false)); }
    { const hx = x0 + pw * r.range(0.05, 0.6), hy = y0 + ph * r.range(0.55, 0.8), L = Math.min(160, pw * 0.25); c.beginPath(); for (let k = 0; k < 9; k++) { const u = hx + k * L / 9; c.moveTo(u, hy + r.range(-4, 4)); c.lineTo(u + 26, hy - 38 + r.range(-4, 4)); } c.stroke(); }
    c.restore();
    c.restore();
  }
  // cached paper finish: soft fibre mottling + faint fibres + ink specks, applied with multiply
  let PAPER = null;
  function paper(W, H_) {
    if (PAPER && PAPER.width === W && PAPER.height === H_) return PAPER;
    const c = H.layer(W, H_), x = c.getContext('2d'), nz = H.makeNoise(31), r = H.rng(32);
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H_);
    const cell = 6;
    for (let y = 0; y < H_; y += cell) for (let xx = 0; xx < W; xx += cell) {
      const v = nz.fbm2(xx * 0.006, y * 0.006, 3) * 0.5 + nz.n2(xx * 0.05, y * 0.05) * 0.25;
      const g = 246 + v * 9; x.fillStyle = `rgb(${g + 4 | 0},${g + 2 | 0},${g - 3 | 0})`; x.fillRect(xx, y, cell, cell);
    }
    x.filter = 'blur(3px)'; x.drawImage(c, 0, 0); x.filter = 'none';
    x.lineCap = 'round';
    for (let k = 0; k < 1400; k++) {
      const px = r() * W, py = r() * H_, a = r() * TAU, L = r.range(4, 16);
      x.strokeStyle = `rgba(${r.chance(0.5) ? '120,110,95' : '255,255,250'},${r.range(0.06, 0.16)})`; x.lineWidth = r.range(0.4, 0.9);
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + 0.5) * L * 0.5, py + Math.sin(a + 0.5) * L * 0.5, px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke();
    }
    x.fillStyle = 'rgba(30,28,25,0.35)';
    for (let k = 0; k < 160; k++) { x.beginPath(); x.arc(r() * W, r() * H_, r.range(0.3, 0.9), 0, TAU); x.fill(); }
    PAPER = c; return c;
  }
  function inkCat(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#000';
    inkLoop(c, ellPts(0, 0, 22, 18, 32), 4.2);
    [-1, 1].forEach((sg) => brush(c, [[sg * 19, -8], [sg * 17, -19], [sg * 15, -30], [sg * 9, -24], [sg * 4, -17]], 4, (tt) => 0.45 + 0.55 * Math.sin(Math.PI * tt)));
    [[-8, -3], [8, -3]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 2.6, 0, TAU); c.fill(); });
    [[-1, 5], [1, 5], [-1, 9], [1, 9]].forEach(([sg, dy]) => brush(c, [[sg * 8, dy], [sg * 19, dy + (dy > 6 ? 2 : -1)], [sg * 30, dy + (dy > 6 ? 4 : -2)]], 2, (tt) => 1 - tt * 0.8));
    c.restore();
  }
  function inkDog(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#000';
    inkLoop(c, ellPts(0, 0, 20, 19, 32), 4.2);
    [-1, 1].forEach((sg) => { c.beginPath(); c.ellipse(sg * 21, 2, 7, 16, sg * 0.2, 0, TAU); c.fill(); });
    inkLoop(c, ellPts(0, 9, 10, 7, 24), 3.2); c.beginPath(); c.ellipse(0, 6, 4, 3, 0, 0, TAU); c.fill();
    [[-7, -5], [7, -5]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 2.6, 0, TAU); c.fill(); });
    c.restore();
  }
  // photo card with a label tag
  function photoCard(c, x, y, rot, isCat, s = 1) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 3; c.fillRect(-46, -40, 92, 80); c.strokeRect(-46, -40, 92, 80);
    c.fillStyle = tone(c, 0.12); c.fillRect(-38, -32, 76, 52); c.lineWidth = 1.5; c.strokeRect(-38, -32, 76, 52);
    (isCat ? inkCat : inkDog)(c, 0, -4, 0.85);
    // tag
    c.fillStyle = '#fff'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(12, 24); c.lineTo(68, 24); c.lineTo(68, 54); c.lineTo(12, 54); c.lineTo(2, 39); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#000'; c.font = '400 26px "Patrick Hand"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(isCat ? 'CAT' : 'DOG', 38, 39);
    c.restore();
  }
  // monitor-headed robot (the model), inked with a tapered brush line that boils on twos like the hero
  function robot(c, x, y, s, face, tq) {
    const jr = H.rng(300 + Math.floor(tq * 8));
    c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round';
    // body
    const body = bz([-150, 260], [-140, 150], [-90, 120], [0, 118], 18).concat(bz([0, 118], [90, 120], [140, 150], [150, 260], 18).slice(1));
    for (let k = 1; k < 12; k++) body.push([150 - k * 25, 260]);
    poly(c, body); c.fillStyle = tone(c, 0.45); c.fill();
    // shadow side: solid black crescent on the right shoulder + tapered hatching on the left
    c.save(); poly(c, body); c.clip(); c.fillStyle = '#000';
    poly(c, bz([150, 262], [140, 160], [96, 128], [40, 120], 16).concat(bz([40, 120], [96, 142], [126, 180], [130, 262], 16).slice(1))); c.fill();
    for (let k = 0; k < 7; k++) { const hx = -128 + k * 13; brush(c, [[hx, 168 + k * 4], [hx + 6, 200 + k * 2], [hx + 10, 236]], 3.4, (tt) => Math.sin(Math.PI * tt)); }
    c.fillStyle = '#fff'; brush(c, bz([-120, 200], [-112, 160], [-80, 134], [-30, 128], 14), 7, (tt) => Math.sin(Math.PI * tt) * 0.9);
    c.restore();
    c.fillStyle = '#000'; inkLoop(c, body, 8, jr);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 180, 22, 0, TAU); c.fill();
    c.fillStyle = '#000'; inkLoop(c, ellPts(0, 180, 22, 22, 30), 5.5, jr);
    c.fillRect(-14, 80, 28, 40);
    // antenna
    brush(c, [[0, -84 + jr.range(-0.6, 0.6)], [jr.range(-0.8, 0.8), -102], [0, -120]], 7, (tt) => 1 - 0.55 * tt);
    c.beginPath(); c.arc(0, -128, 10, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(-3, -131, 3, 0, TAU); c.fill();
    // head (monitor): hard drop shadow block, white shell, tapered outline
    c.fillStyle = '#000'; c.beginPath(); c.roundRect(-104, -78, 224, 172, 22); c.fill();
    c.beginPath(); c.roundRect(-110, -86, 220, 170, 22); c.fillStyle = '#fff'; c.fill();
    c.fillStyle = '#000'; inkLoop(c, rrPts(-110, -86, 220, 170, 22), 10, jr);
    c.beginPath(); c.roundRect(-92, -68, 184, 134, 12); c.fillStyle = tone(c, 0.2); c.fill();
    c.fillStyle = '#000'; inkLoop(c, rrPts(-92, -68, 184, 134, 12, 4), 4.4, jr);
    // bezel shading strip on the shadow side
    brush(c, bz([104, -60], [106, 0], [104, 50], [86, 78], 14), 6, (tt) => Math.sin(Math.PI * tt));
    c.fillStyle = '#000'; c.strokeStyle = '#000';
    const arcB = (cx, cy, rad, a0, a1, w) => brush(c, ellPts(cx, cy, rad, rad, 14, a0, a1, false).map((q) => [q[0] + jr.range(-0.5, 0.5), q[1] + jr.range(-0.5, 0.5)]), w);
    if (face === 'happy') { [-1, 1].forEach((sg) => arcB(sg * 38, -2, 18, Math.PI * 1.1, Math.PI * 1.9, 9)); arcB(0, 18, 26, 0.2, Math.PI - 0.2, 9); }
    else if (face === 'shock') { [-1, 1].forEach((sg) => { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(sg * 38, -6, 22, 26, 0, 0, TAU); c.fill(); c.fillStyle = '#000'; inkLoop(c, ellPts(sg * 38, -6, 22, 26, 28), 7, jr); c.beginPath(); c.arc(sg * 38, -6, 5, 0, TAU); c.fill(); }); inkLoop(c, ellPts(0, 40, 12, 10, 20), 7, jr); }
    else if (face === 'think') { [-1, 1].forEach((sg) => { c.beginPath(); c.ellipse(sg * 38, -6, 12, 20, 0, 0, TAU); c.fill(); }); brush(c, [[-20, 40], [0, 37 + jr.range(-0.6, 0.6)], [20, 34]], 7, (tt) => 0.5 + 0.5 * Math.sin(Math.PI * tt)); }
    else { [-1, 1].forEach((sg) => { c.beginPath(); c.ellipse(sg * 38, -6, 14, 22, 0, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(sg * 38 - 4, -14, 5, 0, TAU); c.fill(); c.fillStyle = '#000'; }); arcB(0, 28, 14, 0.3, Math.PI - 0.3, 7); }
    // screen glare
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-84, -60); c.lineTo(-50, -60); c.lineTo(-74, -20); c.lineTo(-84, -20); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-44, -60); c.lineTo(-36, -60); c.lineTo(-58, -26); c.lineTo(-64, -26); c.closePath(); c.fill();
    c.restore();
  }
  function narr(c, x, y, w, h, lines, size = 24, sc = 1) {
    c.save(); c.translate(x + w / 2, y + h / 2); c.scale(sc, sc);
    c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 2.6; c.fillRect(-w / 2, -h / 2, w, h); c.strokeRect(-w / 2, -h / 2, w, h);
    c.fillStyle = '#000'; c.font = `400 ${size}px "Patrick Hand"`; c.textAlign = 'center'; c.textBaseline = 'middle';
    lines.forEach((l, i) => c.fillText(l, 0, (i - (lines.length - 1) / 2) * size * 1.1));
    c.restore();
  }
  // bold manga arrow (outlined, filled white)
  function mArrow(c, pts, w, p) {
    if (p <= 0) return; const n = Math.max(2, Math.round(pts.length * Math.min(1, p))), P = pts.slice(0, n);
    const a = P[P.length - 1], b = P[Math.max(0, P.length - 3)], an = Math.atan2(a[1] - b[1], a[0] - b[0]);
    const L = [], R = [];
    P.forEach((q, i) => { const u = P[Math.min(P.length - 1, i + 1)], v = P[Math.max(0, i - 1)], tx = u[0] - v[0], ty = u[1] - v[1], m = Math.hypot(tx, ty) || 1; L.push([q[0] - ty / m * w / 2, q[1] + tx / m * w / 2]); R.push([q[0] + ty / m * w / 2, q[1] - tx / m * w / 2]); });
    const head = [[a[0] + Math.cos(an + 1.57) * w * 1.2, a[1] + Math.sin(an + 1.57) * w * 1.2], [a[0] + Math.cos(an) * w * 1.6, a[1] + Math.sin(an) * w * 1.6], [a[0] + Math.cos(an - 1.57) * w * 1.2, a[1] + Math.sin(an - 1.57) * w * 1.2]];
    const shape = L.concat(p >= 1 ? head.slice().reverse() : [], R.reverse());
    c.save(); c.lineJoin = 'round'; poly(c, shape); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#000'; c.stroke(); c.restore();
  }

  // ===== END EXPLAINER HELPERS =====
  registerStyle({
    id: 'manga-panel',
    name: 'Manga Page',
    category: 'Illustration',
    description: 'A black-and-white manga page: slanted panel gutters, brush-tapered ink, radiating focus lines, true halftone screentone gradients, katakana sound effects with white knock-out borders and hand-lettered speech balloons.',
    motion: 'Panels land one after another with a camera shake; focus lines "boil" every couple of frames and the ゴゴゴ letters tremble.',
    fonts: ['400 64px "Archivo Black"', '400 26px "Patrick Hand"', '400 30px "VT323"'],
    frameT: 4.9,
    duration: 5,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const boil = Math.floor(t * 8);
      const r = H.rng(77 + boil), rs = H.rng(5);
      const shake = (k) => [Math.sin(t * 40 + k) * 1.2, Math.cos(t * 37 + k * 2) * 1.2];
      ctx.fillStyle = '#fbfaf6'; ctx.fillRect(0, 0, W, H_);

      // ---- panel geometry (slanted gutters) ----
      const P1 = [[24, 24], [500, 24], [460, 696], [24, 696]];
      const P2 = [[516, 24], [1256, 24], [1256, 286], [497, 322]];
      const P3 = [[496, 339], [870, 320], [842, 696], [476, 696]];
      const P4 = [[886, 319], [1256, 302], [1256, 696], [858, 696]];
      // ---- timing: animated on twos (12 drawings/s); panels slam in in reading order ----
      const tq = Math.floor(t * 12) / 12;
      const PS = [P1, P2, P3, P4], A = [0.15, 0.95, 1.75, 2.45];
      const vis = (i) => tq >= A[i];
      const zoomT = (i) => {
        const k = H.clamp((tq - A[i]) / 0.34), z = 1 + 0.14 * Math.pow(1 - k, 2), sh = Math.pow(1 - k, 2) * 7;
        const c = PS[i].reduce((a, q) => [a[0] + q[0] / 4, a[1] + q[1] / 4], [0, 0]);
        ctx.translate(c[0] + Math.sin(tq * 90 + i) * sh, c[1] + Math.cos(tq * 77 + i) * sh); ctx.scale(z, z); ctx.translate(-c[0], -c[1]);
      };
      const pop = (t0, x, y, fn) => { const k = H.clamp((tq - t0) / 0.17); if (k <= 0) return; const sc = 1 + 0.6 * Math.pow(1 - k, 2); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y); fn(); ctx.restore(); };

      // ================= screentone map =================
      const tone = H.layer(W, H_), tn = tone.getContext('2d');
      tn.fillStyle = '#000'; tn.fillRect(0, 0, W, H_);
      const g = (v) => `rgb(${v * 255 | 0},${v * 255 | 0},${v * 255 | 0})`;
      const M = [250, 245];
      // P1: dark room, light from monitor
      tn.save(); poly(tn, P1); tn.clip();
      { const rg = tn.createRadialGradient(M[0], M[1], 110, M[0], M[1], 520); rg.addColorStop(0, g(0)); rg.addColorStop(0.35, g(0.35)); rg.addColorStop(1, g(0.92)); tn.fillStyle = rg; tn.fillRect(0, 0, W, H_); }
      // desk
      tn.fillStyle = g(0.28); poly(tn, [[24, 372], [460, 360], [460, 452], [24, 470]]); tn.fill();
      tn.restore();
      // P2: skin tone + iris
      tn.save(); poly(tn, P2); tn.clip();
      { const lg = tn.createLinearGradient(0, 24, 0, 322); lg.addColorStop(0, g(0.32)); lg.addColorStop(0.4, g(0.12)); lg.addColorStop(1, g(0.2)); tn.fillStyle = lg; tn.fillRect(0, 0, W, H_); }
      tn.restore();
      // P3: dark around screen
      tn.save(); poly(tn, P3); tn.clip();
      { const rg = tn.createRadialGradient(672, 505, 80, 672, 505, 330); rg.addColorStop(0, g(0.15)); rg.addColorStop(1, g(0.75)); tn.fillStyle = rg; tn.fillRect(0, 0, W, H_); }
      tn.restore();
      // P4: gradient backdrop
      tn.save(); poly(tn, P4); tn.clip();
      { const lg = tn.createLinearGradient(870, 0, 1256, 0); lg.addColorStop(0, g(0.08)); lg.addColorStop(1, g(0.55)); tn.fillStyle = lg; tn.fillRect(0, 0, W, H_); }
      tn.restore();
      // halftone dots
      {
        const td = tn.getImageData(0, 0, W, H_).data;
        const p = 5.4, c45 = Math.SQRT1_2;
        const dots = [];
        const N = Math.ceil((W + H_) / p) + 2;
        for (let i = -N; i < N; i++) for (let j = 0; j < N; j++) {
          const x = (i + j) * p * c45, y = (j - i) * p * c45;
          if (x < -4 || y < -4 || x > W + 4 || y > H_ + 4) continue;
          const xi = Math.min(W - 1, Math.max(0, x | 0)), yi = Math.min(H_ - 1, Math.max(0, y | 0));
          const d = td[(yi * W + xi) * 4] / 255;
          if (d < 0.03) continue;
          dots.push(x, y, Math.min(p * 0.72, p * Math.sqrt(d / Math.PI)));
        }
        PS.forEach((pp, pi) => {
          if (!vis(pi)) return;
          ctx.save(); poly(ctx, pp); ctx.clip(); zoomT(pi);
          ctx.fillStyle = '#111'; ctx.beginPath();
          for (let k = 0; k < dots.length; k += 3) { ctx.moveTo(dots[k] + dots[k + 2], dots[k + 1]); ctx.arc(dots[k], dots[k + 1], dots[k + 2], 0, TAU); }
          ctx.fill(); ctx.restore();
        });
      }

      ctx.fillStyle = '#000'; ctx.strokeStyle = '#000'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      // ================= P1: silhouette before a blazing monitor =================
      if (vis(0)) { ctx.save(); poly(ctx, P1); ctx.clip(); zoomT(0);
      {
        const [sx, sy] = shake(1);
        ctx.translate(sx * 0.5, sy * 0.5);
        // white burst behind monitor
        const wg = ctx.createRadialGradient(M[0], M[1], 60, M[0], M[1], 190); wg.addColorStop(0, 'rgba(255,255,255,1)'); wg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = wg; ctx.fillRect(0, 0, 520, 720);
        ctx.fillStyle = '#000';
        focusLines(ctx, M[0], M[1], 150, 700, 230, r, 5);
        // desk edge + keyboard + mug
        brush(ctx, [[24, 372], [240, 366], [460, 360]], 3.2, () => 1);
        brush(ctx, [[24, 470], [240, 461], [460, 452]], 4, () => 1);
        ctx.fillStyle = '#fff'; poly(ctx, [[130, 392], [370, 386], [392, 428], [112, 436]]); ctx.fill(); ctx.fillStyle = '#000';
        ctx.lineWidth = 2.2; poly(ctx, [[130, 392], [370, 386], [392, 428], [112, 436]]); ctx.stroke();
        ctx.lineWidth = 0.9; ctx.beginPath();
        for (let k = 1; k < 4; k++) { const tt = k / 4; ctx.moveTo(H.lerp(130, 112, tt), H.lerp(392, 436, tt)); ctx.lineTo(H.lerp(370, 392, tt), H.lerp(386, 428, tt)); }
        for (let k = 1; k < 14; k++) { const tt = k / 14; ctx.moveTo(H.lerp(130, 370, tt), H.lerp(392, 386, tt)); ctx.lineTo(H.lerp(112, 392, tt), H.lerp(436, 428, tt)); }
        ctx.stroke();
        // mug
        ctx.fillStyle = '#fff'; ctx.fillRect(398, 372, 38, 50); ctx.fillStyle = '#000';
        ctx.lineWidth = 2.4; ctx.strokeRect(398, 372, 38, 50); ctx.beginPath(); ctx.ellipse(417, 372, 19, 5, 0, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.arc(441, 395, 9, -1.3, 1.3); ctx.stroke();
        for (let k = 0; k < 6; k++) { ctx.fillRect(421 + k * 2.4, 375, 1.2, 46); }
        // steam
        [[410, 362], [424, 356]].forEach(([x, y], i) => brush(ctx, bz([x, y], [x - 8, y - 14], [x + 10, y - 22], [x + 2, y - 40]), 2.2));
        // monitor
        ctx.fillStyle = '#000';
        poly(ctx, [[104, 124], [398, 128], [394, 338], [108, 334]]); ctx.fill();
        ctx.fillStyle = '#fff'; poly(ctx, [[118, 138], [384, 141], [381, 324], [121, 321]]); ctx.fill();
        ctx.fillStyle = '#000';
        // screen text, crisp black bars
        for (let k = 0; k < 7; k++) { const w = [150, 90, 200, 120, 170, 60, 140][k]; ctx.fillRect(146 + (k % 3 === 1 ? 18 : 0), 166 + k * 20, w, 3); }
        ctx.fillRect(146, 306, 10, 3);
        // stand
        poly(ctx, [[234, 338], [266, 338], [274, 372], [226, 372]]); ctx.fill();
        ctx.beginPath(); ctx.ellipse(250, 374, 60, 9, 0, 0, TAU); ctx.fill();
        // silhouette: over-the-shoulder back of head with anime hair tufts
        const HC = [244, 528], HR = 86, hair = [];
        const tufts = [[0.94, 14, -0.5], [1.03, 24, -0.45], [1.11, 30, -0.38], [1.19, 26, -0.3], [1.27, 36, -0.22], [1.35, 30, -0.14], [1.43, 40, -0.06], [1.51, 32, 0.04], [1.59, 38, 0.12], [1.67, 30, 0.2], [1.75, 34, 0.28], [1.83, 26, 0.36], [1.91, 22, 0.44], [1.99, 18, 0.5], [2.06, 12, 0.55]];
        const P = (ang, rad) => [HC[0] + Math.cos(ang * Math.PI) * rad * 1.04, HC[1] + Math.sin(ang * Math.PI) * rad];
        const quad = (p0, c, p1, n = 8) => { for (let k = 1; k <= n; k++) { const tt = k / n, m = 1 - tt; hair.push([m * m * p0[0] + 2 * m * tt * c[0] + tt * tt * p1[0], m * m * p0[1] + 2 * m * tt * c[1] + tt * tt * p1[1]]); } };
        let prev = P(0.88, HR); hair.push(prev);
        tufts.forEach(([ang, len, lean], k) => {
          const wob = Math.sin(t * 2 + k) * 0.01;
          const tip = P(ang + lean * 0.22 + wob, HR + len), valley = P(ang + 0.04, HR * 0.985);
          quad(prev, P(ang - 0.02, HR + len * 0.55), tip);
          quad(tip, P(ang + 0.03, HR + len * 0.3), valley);
          prev = valley;
        });
        quad(prev, P(2.1, HR), P(2.12, HR * 0.98));
        const bodyS = [[6, 724], [16, 662], [64, 630], [146, 608], [188, 594], ...hair, [300, 594], [346, 608], [424, 630], [466, 664], [474, 724]];
        // rim light: fill white, then black offset away from light
        ctx.fillStyle = '#fff'; poly(ctx, bodyS); ctx.fill();
        ctx.save(); poly(ctx, bodyS); ctx.clip();
        ctx.fillStyle = '#000'; ctx.translate(0, 7); poly(ctx, bodyS); ctx.fill(); ctx.translate(0, -7);
        // hood seam & hair strand highlights
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(120, 640); ctx.quadraticCurveTo(244, 600, 370, 640); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(176, 650); ctx.quadraticCurveTo(244, 690, 312, 650); ctx.stroke();
        ctx.fillStyle = '#fff';
        for (let k = 0; k < 10; k++) { const x0 = 196 + k * 11; brush(ctx, bz([x0, 452 + Math.abs(k - 4.5) * 5], [x0 + 6, 480], [x0 - 2, 500], [x0 + 3, 530 + rs.range(0, 26)], 12), 2.2, (tt) => Math.sin(Math.PI * tt)); }
        ctx.restore();
        ctx.lineWidth = 2.4; ctx.strokeStyle = '#000'; poly(ctx, bodyS); ctx.stroke();
        // spot "flash" sparkles around screen
        ctx.fillStyle = '#fff';
      }
      ctx.restore(); }

      // ================= P2: extreme close-up eye =================
      if (vis(1)) { ctx.save(); poly(ctx, P2); ctx.clip(); zoomT(1);
      {
        const [sx, sy] = shake(2); ctx.translate(sx * 0.6, sy * 0.6);
        const UL = bz([728, 196], [776, 104], [966, 84], [1080, 150], 40);
        const LL = bz([740, 204], [800, 252], [990, 252], [1064, 178], 40);
        const eyeW = UL.concat(LL.slice().reverse());
        ctx.fillStyle = '#fff'; poly(ctx, eyeW); ctx.fill();
        // shadow under upper lid (fine tone via hatching)
        ctx.save(); poly(ctx, eyeW); ctx.clip();
        ctx.fillStyle = '#000';
        // iris
        const IC = [890, 172], IR = 52;
        ctx.beginPath(); ctx.ellipse(IC[0], IC[1], IR * 0.9, IR, 0, 0, TAU); ctx.fill();
        // iris inner (lighter band with radial streaks)
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(IC[0], IC[1] + 4, IR * 0.72, IR * 0.8, 0, 0, TAU); ctx.fill();
        // dot-tone ring in iris
        ctx.fillStyle = '#000';
        ctx.beginPath();
        for (let rr = 6; rr < IR * 0.8; rr += 4.2) for (let a = 0; a < TAU; a += 4.2 / rr) { const x = IC[0] + Math.cos(a) * rr * 0.9, y = IC[1] + 4 + Math.sin(a) * rr; const d = H.clamp(0.25 + 0.6 * (1 - (y - IC[1] + 50) / 100)); const q = 2.4 * Math.sqrt(d); ctx.moveTo(x + q, y); ctx.arc(x, y, q, 0, TAU); }
        ctx.fill();
        // radial streaks
        for (let k = 0; k < 34; k++) { const a = k / 34 * TAU + rs.range(-0.05, 0.05); brush(ctx, [[IC[0] + Math.cos(a) * 12, IC[1] + 4 + Math.sin(a) * 13], [IC[0] + Math.cos(a) * IR * 0.62, IC[1] + 4 + Math.sin(a) * IR * 0.7]], 1.6); }
        // pupil (tiny, shocked)
        ctx.beginPath(); ctx.ellipse(IC[0], IC[1] + 4, 9, 11, 0, 0, TAU); ctx.fill();
        // lid cast shadow band
        ctx.beginPath(); for (const p of UL) ctx.lineTo(p[0], p[1] + 0); for (let k = UL.length - 1; k >= 0; k--) ctx.lineTo(UL[k][0], UL[k][1] + 18 + 6 * Math.sin(k / UL.length * Math.PI)); ctx.closePath();
        ctx.save(); ctx.clip(); ctx.lineWidth = 1.1; ctx.beginPath(); for (let x = 700; x < 1100; x += 4) { ctx.moveTo(x, 80); ctx.lineTo(x + 30, 240); } ctx.stroke(); ctx.restore();
        // highlights + reflected monitor
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(866, 142, 17, 11, -0.5, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(916, 200, 5, 0, TAU); ctx.fill();
        ctx.save(); ctx.translate(902, 176); ctx.rotate(-0.08); ctx.fillRect(-12, -9, 24, 16); ctx.fillStyle = '#000'; ctx.fillRect(-9, -5, 14, 1.6); ctx.fillRect(-9, -1, 10, 1.6); ctx.fillRect(-9, 3, 16, 1.6); ctx.restore();
        ctx.restore();
        ctx.fillStyle = '#000';
        // upper lash line: heavy brush with flick
        brush(ctx, UL, 13, (tt) => 0.35 + 0.65 * Math.pow(Math.sin(Math.PI * Math.min(1, tt * 0.9 + 0.1)), 0.4));
        brush(ctx, bz([1058, 152], [1080, 146], [1096, 134], [1118, 118], 10), 9, (tt) => 1 - tt);
        brush(ctx, bz([1040, 140], [1060, 130], [1076, 116], [1092, 100], 10), 7, (tt) => 1 - tt);
        brush(ctx, bz([1064, 160], [1090, 160], [1106, 154], [1124, 146], 10), 6, (tt) => 1 - tt);
        // lower lid
        brush(ctx, LL.slice(8, 40), 3.4);
        for (let k = 0; k < 6; k++) { const p = LL[14 + k * 4]; brush(ctx, [[p[0], p[1]], [p[0] + 3 + k, p[1] + 9]], 1.8, (tt) => 1 - tt); }
        // crease
        brush(ctx, bz([760, 150], [800, 84], [960, 66], [1060, 116], 30), 3);
        // brow (raised)
        brush(ctx, bz([742, 92], [800, 40], [930, 30], [1060, 58], 30), 16, (tt) => Math.pow(Math.sin(Math.PI * (0.15 + tt * 0.85)), 0.5) * (1 - tt * 0.4));
        // nose bridge hint
        brush(ctx, bz([600, 160], [612, 200], [610, 250], [596, 300], 16), 4);
        // hair clumps from top-left with white sheen bands
        const sheens = [];
        for (let k = 0; k < 7; k++) {
          const x0 = 500 + k * 34, w0 = 50 + rs.range(-6, 10), len = 150 + rs.range(0, 110) - k * 6;
          const tip = [x0 + 40 + k * 6, len], c1 = [x0 + 10, len * 0.55], c2 = [x0 + w0 + 22, len * 0.5];
          const L = bz([x0, 0], [x0 + 4, len * 0.3], c1, tip, 16), R = bz([x0 + w0, 0], [x0 + w0 + 6, len * 0.25], c2, tip, 16);
          ctx.fillStyle = '#000'; poly(ctx, L.concat(R.slice().reverse())); ctx.fill();
          ctx.fillStyle = '#fff';
          const C = L.map((p, j) => [H.lerp(p[0], R[j][0], 0.32 + 0.1 * (k % 2)), H.lerp(p[1], R[j][1], 0.32)]);
          sheens.push(C);
        }
        ctx.fillStyle = '#fff';
        sheens.forEach((C, k) => { brush(ctx, C.slice(2 + k % 2, 8), 4.5, (tt) => Math.sin(Math.PI * tt)); brush(ctx, C.slice(3, 7).map((p) => [p[0] + 8, p[1] + 2]), 2, (tt) => Math.sin(Math.PI * tt)); });
        ctx.fillStyle = '#000';
        // shock lines (縦線) from top edge
        ctx.beginPath();
        for (let k = 0; k < 70; k++) {
          const x = 760 + k * 7 + rs.range(-2, 2), L = rs.range(60, 104) - Math.max(0, 40 - Math.abs(x - 1100)) * 0, w = rs.range(1.8, 3.6);
          ctx.moveTo(x - w / 2, 0); ctx.lineTo(x + w / 2, 0); ctx.lineTo(x, L); ctx.closePath();
        }
        ctx.fill();
        // sweat drop
        ctx.fillStyle = '#fff'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(1150, 92); ctx.bezierCurveTo(1170, 120, 1172, 132, 1160, 140); ctx.bezierCurveTo(1148, 146, 1136, 134, 1142, 118); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(1158, 128, 2, 5, -0.4, 0, TAU); ctx.fill();
      }
      ctx.restore(); }

      // ================= P3: the screen speaks =================
      if (vis(2)) { ctx.save(); poly(ctx, P3); ctx.clip(); zoomT(2);
      {
        const [sx, sy] = shake(3); ctx.translate(sx * 0.4, sy * 0.4);
        const SC = [[548, 420], [806, 410], [800, 600], [540, 606]];
        ctx.fillStyle = '#000';
        focusLines(ctx, 672, 505, 170, 520, 170, r, 4);
        poly(ctx, [[530, 402], [824, 390], [818, 620], [522, 626]]); ctx.fill();
        ctx.fillStyle = '#fff'; poly(ctx, SC); ctx.fill();
        // scanlines (fine)
        ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 412; y < 606; y += 3) ctx.fillRect(540, y, 270, 1);
        ctx.fillStyle = '#000';
        ctx.save(); ctx.translate(672, 505); ctx.rotate(-0.035);
        ctx.font = '400 40px "VT323"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('HELLO, HUMAN.', -8, -6);
        if (Math.floor(t * 2) % 2 === 0 || t === 1.5) ctx.fillRect(98, -20, 14, 26);
        ctx.font = '400 20px "VT323"'; ctx.fillText('> _', -100, 50);
        ctx.restore();
        // bezel glint
        ctx.fillStyle = '#fff'; poly(ctx, [[536, 410], [560, 408], [552, 470], [534, 472]]); ctx.globalAlpha = 0.0; ctx.fill(); ctx.globalAlpha = 1;
      }
      ctx.restore(); }

      // ================= P4: profile in shock =================
      if (vis(3)) { ctx.save(); poly(ctx, P4); ctx.clip(); zoomT(3);
      {
        const [sx, sy] = shake(4); ctx.translate(sx, sy);
        // horizontal speed lines
        ctx.fillStyle = '#000'; ctx.beginPath();
        for (let k = 0; k < 90; k++) { const y = 300 + r() * 400, x0 = 850 + r() * 60, L = r.range(80, 260), w = r.range(0.6, 2.6); ctx.moveTo(x0, y); ctx.lineTo(x0 + L, y - w / 2); ctx.lineTo(x0 + L, y + w / 2); ctx.closePath(); }
        ctx.fill();
        const prof = catmull([[1200, 300], [1176, 336], [1146, 372], [1132, 408], [1126, 428], [1130, 440], [1116, 452], [1086, 482], [1092, 492], [1100, 500], [1092, 512], [1102, 522], [1094, 536], [1106, 548], [1100, 570], [1126, 592], [1150, 602], [1150, 720]], 6);
        const sil = prof.concat([[1270, 720], [1270, 290]]);
        ctx.fillStyle = '#fff'; poly(ctx, sil); ctx.fill();
        ctx.save(); poly(ctx, sil); ctx.clip(); ctx.fillStyle = '#000'; ctx.translate(7, 1); poly(ctx, sil); ctx.fill(); ctx.restore();
        // bangs over forehead
        for (let k = 0; k < 5; k++) { const x0 = 1176 - k * 9, y0 = 340 + k * 8; brush(ctx, bz([x0 + 30, y0 - 30], [x0, y0], [x0 - 18, y0 + 30], [x0 - 22 + k * 2, y0 + 64 - k * 4], 14), 16, (tt) => 1 - tt); }
        // shocked white eye in silhouette
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(1146, 440, 11, 7, -0.2, 0, TAU); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(1141, 440, 2.2, 0, TAU); ctx.fill();
        ctx.lineWidth = 2.2; ctx.strokeStyle = '#000'; poly(ctx, sil); ctx.stroke();
      }
      ctx.restore(); }

      // ---- panel borders ----
      ctx.lineWidth = 3.2; ctx.strokeStyle = '#000';
      PS.forEach((pp, i) => { if (!vis(i)) return; ctx.save(); zoomT(i); poly(ctx, pp); ctx.stroke(); ctx.restore(); });
      // panels not yet inked: non-photo-blue layout pencil
      ctx.save(); ctx.strokeStyle = 'rgba(110,170,215,0.7)'; ctx.lineWidth = 1.2;
      PS.forEach((pp, i) => { if (vis(i)) return; poly(ctx, pp); ctx.stroke(); const c = pp.reduce((a, q) => [a[0] + q[0] / 4, a[1] + q[1] / 4], [0, 0]); ctx.beginPath(); ctx.moveTo(c[0] - 60, c[1] - 30); ctx.quadraticCurveTo(c[0], c[1] - 70, c[0] + 50, c[1] + 10); ctx.moveTo(c[0] - 30, c[1] + 40); ctx.lineTo(c[0] + 70, c[1] + 30); ctx.stroke(); });
      ctx.restore();

      // ---- SFX ----
      const sh2 = (k) => [Math.sin(t * 50 + k * 3) * 2.2, Math.cos(t * 47 + k * 5) * 2.2];
      ['ゴ', 'ゴ', 'ゴ', 'ゴ'].forEach((ch, i) => { const [a, b] = sh2(i); const x = 400 - i * 6 + a, y = 320 + i * 92 + b; pop(0.6 + i * 0.17, x, y, () => sfx(ctx, ch, x, y, 86 - i * 4, -0.12 + i * 0.05, -0.25, 9)); });
      pop(2.1, 800, 366, () => { sfx(ctx, 'ピ', 760, 372, 46, -0.25, -0.2, 7); sfx(ctx, 'コ', 802, 362, 46, -0.15, -0.2, 7); sfx(ctx, 'ッ', 836, 360, 32, -0.1, -0.2, 6); });
      { const [a, b] = sh2(9); pop(2.95, 930, 600, () => sfx(ctx, 'ド', 930 + a, 600 + b, 92, -0.18, -0.25, 10)); pop(3.1, 1010, 628, () => sfx(ctx, 'ク', 1010 + a, 628 + b, 80, -0.05, -0.25, 9)); pop(3.25, 1072, 664, () => sfx(ctx, 'ン', 1072 + a, 664 + b, 60, 0.12, -0.25, 8)); }
      // vibration marks around ドクン
      ctx.lineWidth = 3; ctx.strokeStyle = '#000';
      if (tq >= 2.95) [[880, 552, 0.5], [1110, 690, -0.3]].forEach(([x, y, a]) => { for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x, y, 14 + k * 9, a - 0.5, a + 0.5); ctx.stroke(); } });

      // ---- balloons ----
      pop(2.75, 990, 420, () => bubble(ctx, 990, 420, 92, 64, [1086, 508], ["IT'S...", 'TALKING?!'], '400 30px "Patrick Hand"', 32, r));
      // small shout in P2
      if (tq >= 1.35) { const k = H.clamp((tq - 1.35) / 0.17), sc = 1 + 0.6 * (1 - k) * (1 - k); ctx.save(); ctx.translate(1200, 236); ctx.rotate(0.12); ctx.scale(sc, sc);
      ctx.font = '400 64px "Archivo Black"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.strokeText('!?', 0, 0); ctx.fillStyle = '#000'; ctx.fillText('!?', 0, 0);
      ctx.restore(); }
      // narration box P1
      if (tq >= 0.45) { ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2.4;
      ctx.fillRect(40, 40, 170, 64); ctx.strokeRect(40, 40, 170, 64);
      ctx.fillStyle = '#000'; ctx.font = '400 22px "Patrick Hand"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('3:07 A.M.', 125, 60); ctx.fillText('THE MODEL WOKE.', 125, 86);
      ctx.restore(); }

      // print texture: paper fibre + tiny ink speckle
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(paper(W, H_), 0, 0); ctx.restore();
      H.grain(ctx, W, H_, 0.035, 9 + boil);
    },
    // ===== EXPLAINER =====
    explainerDuration: 14.5,
    explainerNote: 'A three-page manga: panels slam in on twos, page turns carry the story, bold outlined arrows and katakana SFX (ドドド, ブー, カチカチ, ピンポーン, グングン) mark cause and effect, numbers count in narration boxes, and focus-line bursts hit the key beats.',
    explainer(ctx, W, H_, t) {
      const tq = Math.floor(t * 12) / 12, boil = Math.floor(t * 8), r = H.rng(77 + boil);
      const quake = (k, amp) => [Math.sin(tq * 90 + k) * amp, Math.cos(tq * 77 + k) * amp];
      const slam = (c, P, t0) => { const k = H.clamp((tq - t0) / 0.34); if (k <= 0) return false; const z = 1 + 0.14 * Math.pow(1 - k, 2), sh = Math.pow(1 - k, 2) * 7; const cc = P.reduce((a, q) => [a[0] + q[0] / P.length, a[1] + q[1] / P.length], [0, 0]); c.translate(cc[0] + Math.sin(tq * 90) * sh, cc[1] + Math.cos(tq * 77) * sh); c.scale(z, z); c.translate(-cc[0], -cc[1]); return true; };
      const pop = (c, t0, x, y, fn) => { const k = H.clamp((tq - t0) / 0.17); if (k <= 0) return; const sc = 1 + 0.6 * Math.pow(1 - k, 2); c.save(); c.translate(x, y); c.scale(sc, sc); c.translate(-x, -y); fn(); c.restore(); };
      const panel = (c, P, t0, fn) => { if (tq < t0) { pencilRough(c, P); return; } c.save(); if (!slam(c, P, t0)) { c.restore(); return; } c.save(); poly(c, P); c.clip(); c.fillStyle = '#fbfaf6'; c.fill(); fn(); c.restore(); c.lineWidth = 3.4; c.strokeStyle = '#000'; poly(c, P); c.stroke(); c.restore(); };

      // ---------- pages ----------
      const page1 = (c, T) => {
        const P1 = [[24, 24], [470, 24], [440, 696], [24, 696]], P2 = [[486, 24], [1256, 24], [1256, 696], [456, 696]];
        panel(c, P1, 0, () => {
          c.fillStyle = tone(c, 0.3); c.fillRect(0, 0, 500, 720);
          c.fillStyle = '#fbfaf6'; c.beginPath(); c.arc(240, 380, 170, 0, TAU); c.fill();
          c.fillStyle = '#000'; focusLines(c, 240, 380, 175, 700, 200, r, 4);
          robot(c, 240, 400, 1.05, T < 2.4 ? 'shock' : 'think', T);
        });
        panel(c, P2, 2.35, () => {
          c.fillStyle = tone(c, 0.15); c.fillRect(460, 0, 820, 720);
          // speed lines along the flow (top-right -> bottom-left, into the robot)
          c.fillStyle = '#000'; c.beginPath();
          for (let k = 0; k < 70; k++) { const off = r.range(-420, 420), L0 = r.range(0, 300), L = r.range(200, 520), w = r.range(0.6, 3); const ux = -0.82, uy = 0.57, px = 900 + -uy * off, py = 360 + ux * off; const x0 = px - ux * (400 - L0), y0 = py - uy * (400 - L0); c.moveTo(x0, y0); c.lineTo(x0 + ux * L + uy * w, y0 + uy * L - ux * w); c.lineTo(x0 + ux * L - uy * w, y0 + uy * L + ux * w); c.closePath(); }
          c.fill();
          // the stream of labelled examples
          for (let k = 0; k < 14; k++) {
            const u = ((T - 2.4) * 0.55 + k / 14) % 1; if (T < 2.4 + k * 0.08) continue;
            const x = H.lerp(1300, 420, u), y = H.lerp(60, 640, u) + Math.sin(k * 2.3) * 120, s = 0.8 + 0.5 * Math.sin(k * 1.7) ** 2;
            photoCard(c, x, y, Math.sin(k * 3.1) * 0.25, k % 3 !== 1, s);
          }
        });
        // header: the question shrinks into a caption box at the top-left corner
        const k = H.ease.inOut(H.clamp((T - 1.75) / 0.55));
        if (T > 0.3) {
          if (k <= 0) pop(c, 0.3, 300, 140, () => bubble(c, 300, 140, 210, 92, [250, 290], ['HOW DOES', 'AI LEARN?'], '400 46px "Patrick Hand"', 46, r));
          else { const sz = H.lerp(46, 28, k); narr(c, H.lerp(60, 34, k), H.lerp(80, 34, k), sz * 12.2, sz * 1.9, ['HOW DOES AI LEARN?'], sz, 1); }
        }
        if (T > 2.45) {
          ['ド', 'ド', 'ド', 'ド'].forEach((ch, i) => { const [a, b] = quake(i, 2.5); pop(c, 2.6 + i * 0.12, 1130 - i * 70, 210 + i * 70, () => sfx(c, ch, 1130 - i * 70 + a, 210 + i * 70 + b, 76, -0.3, -0.25, 8)); });
          const e = H.ease.inOut(H.clamp((T - 2.8) / 2.6)), v = T >= 5.4 ? 1000000 : Math.round(Math.pow(10, 6 * e) / 10) * 10;
          pop(c, 2.75, 1000, 610, () => { narr(c, 760, 540, 470, 140, [''], 30); c.save(); c.fillStyle = '#000'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '400 72px "Archivo Black"'; c.fillText(fmt(Math.max(10, v)), 995, 590); c.font = '400 30px "Patrick Hand"'; c.fillText('EXAMPLES', 995, 652); c.restore(); });
          if (T > 3.2) pop(c, 3.2, 560, 90, () => narr(c, 520, 60, 210, 44, ['TRAINING DATA'], 28));
        }
      };
      const page2 = (c, T) => {
        const Q1 = [[24, 24], [640, 24], [620, 340], [24, 340]], Q2 = [[656, 24], [1256, 24], [1256, 340], [636, 340]], Q3 = [[24, 356], [1256, 356], [1256, 696], [24, 696]];
        const right = T > 9.3;
        panel(c, Q1, 6.35, () => {
          c.fillStyle = tone(c, 0.2); c.fillRect(0, 0, 660, 360);
          photoCard(c, 150, 200, -0.1, true, 1.3);
          mArrow(c, bz([230, 200], [270, 170], [300, 170], [340, 190], 16), 18, (T - 6.6) / 0.25);
          robot(c, 470, 150, 0.62, right ? 'happy' : 'think', T);
          if (T > 6.9) pop(c, 6.9, 520, 70, () => bubble(c, 540, 66, 70, 36, [480, 110], [right ? 'CAT!' : 'DOG?'], '400 36px "Patrick Hand"', 36, r));
          narr(c, 34, 34, 110, 40, ['GUESS'], 28);
        });
        panel(c, Q2, 7.35, () => {
          c.fillStyle = '#fbfaf6'; c.fillRect(620, 0, 660, 360);
          c.fillStyle = '#000'; focusLines(c, 950, 185, 120, 600, 160, r, 4);
          if (!right) {
            const k = H.clamp((tq - 7.6) / 0.17), sc = 1 + 0.8 * Math.pow(1 - k, 2);
            if (k > 0) { c.save(); c.translate(950, 175); c.scale(sc, sc); c.strokeStyle = '#000'; c.lineCap = 'round'; c.lineWidth = 34; c.beginPath(); c.moveTo(-70, -70); c.lineTo(70, 70); c.moveTo(70, -70); c.lineTo(-70, 70); c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 16; c.stroke(); c.restore(); }
            if (T > 7.8) { const [a, b] = quake(3, 3); sfx(c, 'ブ', 1140 + a, 120 + b, 70, 0.1, -0.2, 8); sfx(c, 'ー', 1180 + a, 210 + b, 64, 1.57, 0, 8); }
          } else {
            c.strokeStyle = '#000'; c.lineCap = 'round'; c.lineWidth = 30; c.beginPath(); c.moveTo(880, 190); c.lineTo(935, 250); c.lineTo(1040, 110); c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 13; c.stroke();
          }
          photoCard(c, 760, 250, 0.12, true, 0.9);
          if (T > 7.75) narr(c, 712, 290, 200, 40, ["IT'S A CAT!"], 26);
          narr(c, 1132, 34, 110, 40, ['CHECK'], 28);
        });
        panel(c, Q3, 8.2, () => {
          c.fillStyle = tone(c, 0.35); c.fillRect(0, 340, 1280, 380);
          // gears/knobs inside the model
          [[220, 530, 70], [400, 520, 54], [560, 540, 62]].forEach(([x, y, R], i) => {
            const k = H.ease.inOut(H.clamp((tq - 8.55 - i * 0.12) / 0.6)), a = -2.2 + i + k * (i % 2 ? -2.2 : 2.6);
            c.fillStyle = '#000'; c.beginPath(); c.arc(x + 6, y + 6, R + 2, 0, TAU); c.fill(); c.fillStyle = '#fbfaf6'; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill(); c.fillStyle = '#000'; inkLoop(c, ellPts(x, y, R, R, 44), 9, r); c.strokeStyle = '#000';
            c.lineWidth = 2; c.beginPath(); for (let j = 0; j < 12; j++) { const aa = j / 12 * TAU; c.moveTo(x + Math.cos(aa) * R * 0.78, y + Math.sin(aa) * R * 0.78); c.lineTo(x + Math.cos(aa) * R * 0.92, y + Math.sin(aa) * R * 0.92); } c.stroke();
            c.lineWidth = 9; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * R * 0.7, y + Math.sin(a) * R * 0.7); c.stroke();
            if (tq > 8.55 + i * 0.12 && tq < 9.2 + i * 0.12) { c.lineWidth = 3; [0.6, 1.0].forEach((rr) => { c.beginPath(); c.arc(x, y, R * (1.15 + rr * 0.15), a - 0.9, a - 0.2); c.stroke(); }); }
          });
          if (T > 8.6 && T < 9.6) { const [a, b] = quake(5, 2); sfx(c, 'カ', 200 + a, 420 + b, 54, -0.2, -0.2, 7); sfx(c, 'チ', 250 + a, 420 + b, 54, -0.1, -0.2, 7); sfx(c, 'カ', 520 + a, 420 + b, 54, 0.1, -0.2, 7); sfx(c, 'チ', 570 + a, 425 + b, 54, 0.2, -0.2, 7); }
          // error arrow loops back from the check to the knobs
          mArrow(c, bz([1000, 360], [1020, 520], [800, 560], [640, 540], 30), 26, (T - 8.25) / 0.35);
          if (T > 8.45) narr(c, 860, 600, 150, 44, ['ERROR'], 30);
          robot(c, 1080, 540, 0.5, right ? 'happy' : 'think', T);
          if (right) { pop(c, 9.3, 1000, 400, () => { sfx(c, 'ピ', 940, 420, 50, -0.2, -0.2, 7); sfx(c, 'ン', 985, 410, 46, -0.1, -0.2, 7); sfx(c, 'ポ', 1035, 400, 50, 0, -0.2, 7); sfx(c, 'ー', 1080, 395, 44, 0, 0, 6); sfx(c, 'ン', 1125, 395, 46, 0.1, -0.2, 7); }); }
          narr(c, 34, 366, 130, 40, ['ADJUST'], 28);
        });
      };
      const page3 = (c, T) => {
        const R1 = [[24, 24], [1256, 24], [1256, 450], [24, 470]], R2 = [[24, 486], [1256, 466], [1256, 696], [24, 696]];
        panel(c, R1, 10.6, () => {
          c.fillStyle = '#fbfaf6'; c.fillRect(0, 0, 1280, 480);
          // gradation tone sky over the chart, fading to white towards the axis, plus rising speed hatching
          c.drawImage(gradTone(780, 480, 0.3, 0, 20, 330, 520, 770), 0, 0);
          { const hr = H.rng(611); c.fillStyle = '#000'; c.beginPath();
            for (let k = 0; k < 46; k++) { const u = hr(), x0 = 120 + u * 620, y0 = 380 - u * 300 + hr.range(-150, -20), L = hr.range(60, 200), w = hr.range(0.5, 2.2), ux = 0.89, uy = -0.45; c.moveTo(x0, y0); c.lineTo(x0 + ux * L - uy * w, y0 + uy * L + ux * w); c.lineTo(x0 + ux * L + uy * w, y0 + uy * L - ux * w); c.closePath(); }
            c.fill(); }
          const big = T > 12.45;
          if (big) { c.save(); c.beginPath(); c.rect(770, 0, 520, 480); c.clip(); c.fillStyle = '#000'; focusLines(c, 1000, 230, 150, 800, 160, r, 5); c.restore(); }
          const ox = 110, oy = 400, gw = 640, gh = 320;
          const acc = (u) => 61 + 36 * (1 - Math.pow(1 - u, 2.3)), pr = H.clamp((T - 10.9) / 1.55);
          const pts = []; for (let k = 0; k <= 50; k++) { const u = k / 50 * pr; pts.push([ox + u * gw, oy - (acc(u) - 50) / 50 * gh]); }
          if (pr > 0) { c.save(); poly(c, pts.concat([[pts[pts.length - 1][0], oy], [ox, oy]])); c.fillStyle = tone(c, 0.35); c.fill(); c.restore(); c.fillStyle = "#000"; brush(c, pts, 9, () => 1); const tp = pts[pts.length - 1]; c.beginPath(); c.arc(tp[0], tp[1], 11, 0, TAU); c.fill(); }
          c.strokeStyle = '#000'; c.lineWidth = 5; c.beginPath(); c.moveTo(ox, oy - gh - 10); c.lineTo(ox, oy); c.lineTo(ox + gw + 20, oy); c.stroke();
          c.fillStyle = '#000'; c.font = '400 28px "Patrick Hand"'; c.textAlign = 'left'; c.fillText('TRAINING ROUNDS →', ox + gw - 228, oy + 36);
          if (pr > 0.15) { const [a, b] = quake(7, 2); ['グ', 'ン', 'グ', 'ン'].forEach((ch, i) => sfx(c, ch, ox + 120 + i * 62 + a, oy - 70 - i * 46 + b, 56, -0.4, -0.25, 7)); }
          const v = Math.round(acc(pr)), sc = big ? 1 + 0.3 * Math.pow(1 - H.clamp((tq - 12.45) / 0.25), 2) : 1;
          c.save(); c.translate(1000, 230); c.scale(sc, sc);
          { const wr = H.rng(733), box = []; [[-200, -110], [200, -110], [200, 110], [-200, 110]].forEach((a, i, arr) => { const b = arr[(i + 1) % 4]; for (let k = 0; k < 8; k++) box.push([H.lerp(a[0], b[0], k / 8) + wr.range(-1.5, 1.5), H.lerp(a[1], b[1], k / 8) + wr.range(-1.5, 1.5)]); });
            c.fillStyle = '#000'; c.save(); c.translate(9, 9); poly(c, box); c.fill(); c.restore();
            c.fillStyle = '#fff'; poly(c, box); c.fill(); c.lineJoin = 'round'; c.strokeStyle = '#000'; c.lineWidth = 5; poly(c, box); c.stroke();
            c.lineWidth = 1.6; c.beginPath(); c.moveTo(-184, -36); c.lineTo(184, -38); c.stroke(); }
          c.fillStyle = '#000'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '400 40px "Patrick Hand"'; c.fillText('ACCURACY', 0, -66);
          c.font = '400 120px "Archivo Black"'; c.lineJoin = 'round'; c.lineWidth = 10; c.strokeStyle = '#fff'; c.strokeText(v + '%', 0, 30); c.fillText(v + '%', 0, 30);
          c.restore();
        });
        panel(c, R2, 12.95, () => {
          c.fillStyle = tone(c, 0.25); c.fillRect(0, 440, 1280, 280);
          c.fillStyle = '#fbfaf6'; c.beginPath(); c.arc(1080, 600, 150, 0, TAU); c.fill();
          c.fillStyle = '#000'; focusLines(c, 1080, 600, 150, 600, 120, r, 3);
          robot(c, 1080, 600, 0.55, 'happy', T);
          narr(c, 70, 520, 820, 120, ['MORE EXAMPLES →', 'BETTER GUESSES!'], 50);
        });
      };
      const fmt = (n) => n.toLocaleString('en-US');
      // ---------- page turns ----------
      ctx.fillStyle = '#d9d6cf'; ctx.fillRect(0, 0, W, H_);
      const drawPage = (fn, T) => { const L = H.layer(W, H_), c = L.getContext('2d'); c.fillStyle = '#fbfaf6'; c.fillRect(0, 0, W, H_); c.lineCap = 'round'; c.lineJoin = 'round'; fn(c, T); return L; };
      const turn = (A, B, p) => {
        // page A curls away to the left over page B
        ctx.drawImage(B, 0, 0);
        const fx = W * (1 - H.ease.inOut(p));
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, fx, H_); ctx.clip(); ctx.drawImage(A, 0, 0); ctx.restore();
        const bw = Math.min(fx, (W - fx) * 0.5);
        if (bw > 1) {
          ctx.save(); ctx.translate(fx, 0); ctx.scale(-1, 1);
          const g = ctx.createLinearGradient(0, 0, bw, 0); g.addColorStop(0, '#d8d4ca'); g.addColorStop(0.5, '#f6f3ec'); g.addColorStop(1, '#e4e0d6');
          ctx.fillStyle = g; ctx.fillRect(0, 0, bw, H_); ctx.restore();
          const sg = ctx.createLinearGradient(fx, 0, fx + 60, 0); sg.addColorStop(0, 'rgba(0,0,0,0.35)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = sg; ctx.fillRect(fx, 0, 60, H_);
        }
      };
      if (t < 5.95) ctx.drawImage(drawPage(page1, t), 0, 0);
      else if (t < 6.45) turn(drawPage(page1, 5.94), drawPage(page2, t), (t - 5.95) / 0.5);
      else if (t < 10.35) ctx.drawImage(drawPage(page2, t), 0, 0);
      else if (t < 10.85) turn(drawPage(page2, 10.34), drawPage(page3, t), (t - 10.35) / 0.5);
      else ctx.drawImage(drawPage(page3, t), 0, 0);
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(paper(W, H_), 0, 0); ctx.restore();
      H.grain(ctx, W, H_, 0.035, 9 + boil);
    },
    // Sound: the manga's own SFX made audible. Panels slam in with a punchy paper smack, the katakana sounds are what
    // they say: ドドド a rumbling drum hit per glyph, ブー a low buzzer, カチカチ ratchet clicks, ピンポーン a two-note
    // "correct" chime, グングン a surging rise. Page turns are a real page flip. Animation runs on twos (12 fps), so an
    // event at t0 first shows at the next 1/12 s frame: on(t0). Times copied from explainer() above.
    explainerSound(k) {
      // Chrome glitch: a noise buffer that starts within ~1e-8 s of a sample boundary (float error like 4.15 + 0.1 * 1 + 0.11)
      // spikes far above its gain. Put every start a quarter sample past the 48 kHz grid so none land there.
      { const k0 = k, sn = (t) => (Math.round(t * 48000) + 0.25) / 48000; k = { ...k0, play: (n, t, o) => k0.play(n, sn(t), o), tone: (t, o) => k0.tone(sn(t), o), noise: (t, o) => k0.noise(sn(t), o) }; }
      const D = 14.5, on = (t0) => (Math.floor(t0 * 12 + 1e-6) + 1) / 12;
      const pan = (x) => H.clamp(x / 640 - 1, -1, 1) * 0.6;
      // panel slam: the frame punches in (scale 1.14 -> 1 with shake over 0.34 s)
      const slam = (t, g = 1, p = 0, minor = false) => {
        k.play('slap', t, { gain: 0.55 * g, pan: p, minor });
        k.play('thud', t, { f: 120, gain: 0.45 * g, pan: p, minor });
      };
      // page flip: the sheet lifts, swishes over, settles (0.5 s, inOut)
      const flip = (t) => {
        k.play('paper', t, { dur: 0.18, gain: 0.45, pan: 0.4 });
        k.noise(t + 0.08, { dur: 0.36, color: 'pink', filter: 'bandpass', f: [[0, 600], [0.18, 1600], [0.36, 500]], q: 0.7, gain: 0.3, a: 0.16, pan: -0.1 });
        k.play('paper', t + 0.42, { dur: 0.1, gain: 0.3, pan: -0.5 });
      };
      // ド: a deep drum rumble
      // counter tick: a short dry tap with a little body (minor)
      const ctr = (t, f, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.03, filter: 'bandpass', f, q: 1.4, gain: 0.3 * g, a: 0.001, pan: p }); k.tone(t, { f: f * 0.2, type: 'triangle', dur: 0.035, gain: 0.08 * g, pan: p }); });
      const dodo = (t, p) => { k.tone(t, { f: [[0, 90], [0.2, 48]], dur: 0.3, gain: 0.26, pan: p }); k.noise(t, { dur: 0.22, color: 'brown', filter: 'lowpass', f: 380, gain: 0.28, pan: p }); };

      k.bed('room', 0, D, { gain: 0.3 });

      // ---- PAGE 1
      slam(on(0), 0.8, pan(240));
      k.play('pop', on(0.3), { f: 300, gain: 0.7, pan: pan(300) }); // speech bubble pops: "HOW DOES AI LEARN?"
      k.noise(1.75, { dur: 0.55, color: 'brown', filter: 'bandpass', f: [[0, 250], [0.3, 500], [0.55, 280]], q: 0.6, gain: 0.15, a: 0.22, minor: true }); // question shrinks into the caption box
      slam(on(2.35), 0.8, pan(860));
      // the stream of examples rushing in along the speed lines (2.4 -> page turn): a low air rush underneath
      k.noise(2.4, { dur: 3.55, color: 'pink', filter: 'bandpass', f: 700, q: 0.5, gain: 0.06, a: 0.3, hold: 3.0, pan: 0.2, minor: true });
      for (let i = 0; i < 4; i++) dodo(on(2.6 + i * 0.12), pan(1130 - i * 70)); // ドドドド
      k.play('pop', on(2.75), { f: 260, gain: 0.85, pan: pan(1000), minor: true }); // EXAMPLES box pops
      k.play('pop', on(3.2), { f: 340, gain: 0.4, pan: pan(560), minor: true }); // TRAINING DATA caption
      // counter: 10 -> 1,000,000 over 2.8..5.4 (inOut); a tick per drawn frame while it moves fast, thinning at the ends
      for (let f = Math.ceil(2.85 * 12); f / 12 < 5.38; f++) { const t = f / 12, e = H.clamp((t - 2.8) / 2.6), sp = 6 * e * (1 - e); if (sp > 0.35 || f % 2 === 0) ctr(t, 2000 + e * 500, 0.7 + 0.3 * Math.min(1, sp), pan(995)); }
      k.play('stamp', 5.4, { gain: 0.6, pan: pan(995) }); // 1,000,000 lands

      // ---- page turn 1 (5.95 -> 6.45)
      flip(5.95);

      // ---- PAGE 2
      slam(on(6.35), 0.8, pan(330)); // GUESS panel
      k.noise(6.6, { dur: 0.25, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.25, 1200]], q: 0.8, gain: 0.16, a: 0.08, pan: pan(280), minor: true }); // arrow shoots into the robot
      k.play('pop', on(6.9), { f: 280, gain: 0.6, pan: pan(520) }); // "DOG?" bubble
      slam(on(7.35), 0.8, pan(950)); // CHECK panel
      // WRONG: the giant X slams in (7.6), ブー buzzes (7.8)
      k.play('impact', on(7.6), { gain: 0.95, pan: pan(950) });
      k.play('buzz', 7.8, { f: 98, dur: 0.55, gain: 1.0, pan: pan(1160) });
      slam(on(8.2), 0.9, pan(640)); // ADJUST panel
      k.noise(8.25, { dur: 0.35, color: 'pink', filter: 'bandpass', f: [[0, 1100], [0.35, 450]], q: 0.8, gain: 0.18, a: 0.1, pan: pan(820), minor: true }); // error arrow swings back
      k.play('pop', on(8.45), { f: 240, gain: 0.35, pan: pan(935), minor: true }); // ERROR caption
      // カチカチ: knobs ratchet on twos (8.55 + i*0.12, 0.6 s each), one click per moving frame
      for (let f = Math.floor(8.55 * 12) + 1; f / 12 < 9.4; f++) k.play('click', f / 12, { f: 1000 + (f % 2) * 160, gain: 0.7, pan: pan([220, 400, 560][f % 3]), minor: true });
      // CORRECTION (9.3): check mark, "CAT!", happy robot, ピンポーン chime
      k.play('slap', on(9.3), { gain: 0.45, pan: pan(960) });
      k.tone(on(9.3), { f: 'E5', type: 'triangle', dur: 0.5, gain: 0.22, a: 0.004, verb: 0.3, pan: pan(1030) });
      k.tone(on(9.3), { f: 'E6', dur: 0.3, gain: 0.04, a: 0.004, pan: pan(1030) });
      k.tone(on(9.3) + 0.2, { f: 'C5', type: 'triangle', dur: 0.9, gain: 0.22, a: 0.004, verb: 0.35, pan: pan(1030) });
      k.tone(on(9.3) + 0.2, { f: 'C6', dur: 0.5, gain: 0.04, a: 0.004, pan: pan(1030) });

      // ---- page turn 2 (10.35 -> 10.85); the graph panel slams in under it (10.6)
      flip(10.35);
      slam(on(10.6), 0.6, pan(640), true);
      // グングン: the curve surges up (10.9 -> 12.45)
      k.noise(10.9, { dur: 1.55, color: 'pink', filter: 'bandpass', f: [[0, 250], [1.55, 1300]], q: 1.1, gain: 0.12, a: 1.2, pan: pan(300), minor: true });
      k.tone(10.9, { f: [[0, 'C3'], [1.55, 'C4']], type: 'triangle', dur: 1.55, gain: 0.05, a: 1.2, minor: true });
      { let last = 61, lastT = -1; // accuracy box ticks once per new value on drawn frames, <= 12/s
        for (let f = Math.ceil(10.9 * 12); f / 12 < 12.46; f++) { const t = f / 12, v = Math.round(61 + 36 * (1 - Math.pow(1 - H.clamp((t - 10.9) / 1.55), 2.3))); if (v !== last && t - lastT >= 1 / 12 - 1e-6) { ctr(t, 1900 + (v - 61) * 15, 1, pan(1000)); last = v; lastT = t; } } }
      // 97% punches in with focus lines (12.45): the big hit
      k.play('impact', 12.46, { gain: 1.25, pan: pan(1000) });
      k.play('stamp', 12.46, { gain: 0.5, pan: pan(1000) });
      // takeaway panel slams in (12.95), happy robot: resolve
      slam(on(12.95), 0.9, pan(450));
      ['G4', 'C5', 'E5', 'G5'].forEach((n, i) => k.tone(on(12.95) + 0.06 + i * 0.07, { f: n, type: 'triangle', dur: 0.9 - i * 0.1, gain: 0.13, a: 0.004, verb: 0.3, pan: (i - 1.5) * 0.2 }));
    },

    // ===== END EXPLAINER =====
  });
}
