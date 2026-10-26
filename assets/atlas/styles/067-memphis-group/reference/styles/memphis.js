{
  const K = '#151515';
  const PAL = { pink: '#f9c3d2', mint: '#a9e5d0', lilac: '#cbb8f4', butter: '#fff0a6', cream: '#fff8ec', magenta: '#ff4f9b', blue: '#2b62ff', yellow: '#ffd02e', teal: '#00b2a0', red: '#ff5a3c' };

  // filled + outlined + hard drop shadow
  const solid = (c, path, fill, sh = 10, lw = 5) => {
    c.save(); c.translate(sh, sh); c.fillStyle = K; c.fill(path); c.restore();
    c.fillStyle = fill; c.fill(path); c.lineWidth = lw; c.strokeStyle = K; c.lineJoin = 'round'; c.stroke(path);
  };
  const squigglePath = (x, y, len, amp, waves, ang, ph = 0, frac = 1) => {
    const p = new Path2D(), ca = Math.cos(ang), sa = Math.sin(ang);
    for (let i = 0; i <= Math.round(80 * frac); i++) {
      const u = i / 80, lx = u * len, ly = Math.sin(u * waves * Math.PI * 2 + ph) * amp;
      const X = x + lx * ca - ly * sa, Y = y + lx * sa + ly * ca;
      i ? p.lineTo(X, Y) : p.moveTo(X, Y);
    }
    return p;
  };
  const zigzagPath = (x, y, len, amp, n, ang, frac = 1) => {
    const p = new Path2D(), ca = Math.cos(ang), sa = Math.sin(ang), f = frac * n;
    for (let i = 0; i <= Math.ceil(f); i++) { const ii = Math.min(i, f), i0 = Math.floor(ii), fr = ii - i0, ya = i0 % 2 ? -amp : amp, yb = (i0 + 1) % 2 ? -amp : amp; const lx = (ii / n) * len, ly = ya + (yb - ya) * fr; const X = x + lx * ca - ly * sa, Y = y + lx * sa + ly * ca; i ? p.lineTo(X, Y) : p.moveTo(X, Y); }
    return p;
  };
  const strokeOutlined = (c, path, col, w, ow = 4, sh = 8) => {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.save(); c.translate(sh, sh); c.strokeStyle = K; c.lineWidth = w + ow * 2; c.stroke(path); c.restore();
    c.strokeStyle = K; c.lineWidth = w + ow * 2; c.stroke(path);
    c.strokeStyle = col; c.lineWidth = w; c.stroke(path);
  };
  const terrazzo = (c, path, seed, base = PAL.cream) => {
    c.save(); c.clip(path); c.fillStyle = base; c.fillRect(0, 0, 1280, 720);
    const r = H.rng(seed), cols = [PAL.magenta, PAL.blue, PAL.yellow, PAL.teal, K, PAL.pink, PAL.lilac, PAL.red];
    const bb = { x0: 0, y0: 0, x1: 1280, y1: 720 };
    for (let i = 0; i < 2400; i++) {
      const x = r.range(bb.x0, bb.x1), y = r.range(bb.y0, bb.y1);
      if (!c.isPointInPath(path, x, y)) continue;
      const s = r.range(3, 11) * (r() < 0.08 ? 2 : 1), n = r.int(3, 6), a0 = r.range(0, 7);
      c.fillStyle = r.pick(cols); c.beginPath();
      for (let k = 0; k < n; k++) { const a = a0 + (k / n) * Math.PI * 2 + r.range(-0.3, 0.3), rr = s * r.range(0.5, 1); k ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      c.closePath(); c.fill();
    }
    c.restore();
  };

  // ===================== EXPLAINER: "How does AI learn?" =====================
  // Memphis cut-out animation on twos: scenes change with a striped band that swipes across, arrows are fat
  // outlined shapes, counters are stickers that pop, emphasis is a spiky starburst.
  const roundRect = (x, y, w, h, r) => { const p = new Path2D(); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p; };
  const bubble = (w, h, tail) => { // tail: [x, y] of the tip relative to centre
    const p = new Path2D(), r = 34, x = -w / 2, y = -h / 2;
    p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r);
    if (tail) { p.lineTo(tail[0] + 40, y + h); p.lineTo(tail[0], tail[1]); p.lineTo(tail[0] - 10, y + h); }
    p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p;
  };
  const burst = (n, r0, r1) => { const p = new Path2D(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? r0 : r1; i ? p.lineTo(Math.cos(a) * r, Math.sin(a) * r) : p.moveTo(Math.cos(a) * r, Math.sin(a) * r); } p.closePath(); return p; };
  const fatArrow = (c, x0, y0, x1, y1, p, col, w = 22) => { // outlined chunky arrow with hard shadow
    if (p <= 0) return; const a = Math.atan2(y1 - y0, x1 - x0), l = Math.hypot(x1 - x0, y1 - y0) * p, hw = w * 1.3, hl = w * 1.6;
    const path = new Path2D(); path.moveTo(0, -w / 2); path.lineTo(Math.max(0, l - hl), -w / 2); path.lineTo(Math.max(0, l - hl), -hw); path.lineTo(l, 0); path.lineTo(Math.max(0, l - hl), hw); path.lineTo(Math.max(0, l - hl), w / 2); path.lineTo(0, w / 2); path.closePath();
    c.save(); c.translate(x0, y0); c.rotate(a); solid(c, path, col, 6, 4); c.restore();
  };
  const face = (c, kind, x, y, s) => { // chunky sticker card with a cat or dog face
    const card = roundRect(x - s / 2, y - s / 2, s, s, s * 0.14); solid(c, card, PAL.cream, 6, 4);
    c.lineWidth = 3.5; c.strokeStyle = K;
    if (kind === 'cat') {
      const p = new Path2D(); p.moveTo(x - s * 0.3, y + s * 0.02); p.lineTo(x - s * 0.28, y - s * 0.34); p.lineTo(x - s * 0.08, y - s * 0.18); p.lineTo(x + s * 0.08, y - s * 0.18); p.lineTo(x + s * 0.28, y - s * 0.34); p.lineTo(x + s * 0.3, y + s * 0.02); p.arc(x, y + s * 0.04, s * 0.3, 0, Math.PI); p.closePath();
      c.fillStyle = PAL.yellow; c.fill(p); c.stroke(p);
      c.fillStyle = K; c.beginPath(); c.arc(x - s * 0.1, y + s * 0.02, s * 0.04, 0, 7); c.arc(x + s * 0.1, y + s * 0.02, s * 0.04, 0, 7); c.fill();
      c.fillStyle = PAL.magenta; c.beginPath(); c.moveTo(x - s * 0.05, y + s * 0.1); c.lineTo(x + s * 0.05, y + s * 0.1); c.lineTo(x, y + s * 0.16); c.closePath(); c.fill();
    } else {
      c.fillStyle = PAL.blue; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(x + sd * s * 0.28, y + s * 0.02, s * 0.1, s * 0.2, sd * -0.3, 0, 7); c.fill(); c.stroke(); }
      c.fillStyle = PAL.pink; c.beginPath(); c.arc(x, y + s * 0.02, s * 0.25, 0, 7); c.fill(); c.stroke();
      c.fillStyle = K; c.beginPath(); c.arc(x - s * 0.09, y - s * 0.02, s * 0.035, 0, 7); c.arc(x + s * 0.09, y - s * 0.02, s * 0.035, 0, 7); c.fill();
      c.beginPath(); c.ellipse(x, y + s * 0.1, s * 0.06, s * 0.045, 0, 0, 7); c.fill();
    }
  };
  const tag = (c, txt, x, y, col, size = 22, rot = 0, halo = 0) => { c.save(); c.translate(x, y); c.rotate(rot); c.font = `700 ${size}px "Fredoka"`; const w = c.measureText(txt).width + size; if (halo) { const hp = roundRect(-w / 2 - halo, -size * 0.75 - halo, w + halo * 2, size * 1.5 + halo * 2, size * 0.75 + halo); solid(c, hp, PAL.cream, 6, 3); } const p = roundRect(-w / 2, -size * 0.75, w, size * 1.5, size * 0.75); solid(c, p, col, 4, 3); c.fillStyle = K; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 1); c.restore(); };
  const chunky = (c, txt, x, y, size, col, ls = -4) => { c.save(); c.font = `400 ${size}px "Rubik Mono One"`; c.letterSpacing = ls + 'px'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.fillStyle = K; c.fillText(txt, x + size * 0.07, y + size * 0.07); c.lineWidth = Math.max(4, size * 0.09); c.strokeStyle = K; c.strokeText(txt, x, y); c.fillStyle = col; c.fillText(txt, x, y); c.restore(); c.letterSpacing = '0px'; };
  const machine = (c, x, y, knobs, look, mood) => { // the model: a Memphis totem-computer with a funnel and three knobs
    // feet
    for (const sd of [-1, 1]) { const f = new Path2D(); f.arc(x + sd * 60, y + 140, 34, Math.PI, 0); f.closePath(); solid(c, f, PAL.blue, 6, 4); }
    const body = roundRect(x - 115, y - 120, 230, 260, 26); solid(c, body, PAL.lilac, 12, 5);
    c.save(); c.clip(body); c.fillStyle = 'rgba(21,21,21,0.5)'; for (let i = -10; i < 10; i++) { c.beginPath(); c.arc(x - 100 + (i % 5) * 50, y + 80 + Math.floor(i / 5) * 18, 3, 0, 7); c.fill(); } c.restore();
    const scr = roundRect(x - 85, y - 92, 170, 110, 18); solid(c, scr, PAL.cream, 0, 4);
    const dx = (look - 0.5) * 16;
    c.fillStyle = K; c.beginPath(); c.arc(x - 34 + dx, y - 42, 12, 0, 7); c.arc(x + 34 + dx, y - 42, 12, 0, 7); c.fill();
    c.lineWidth = 5; c.strokeStyle = K; c.lineCap = 'round'; c.beginPath(); if (mood > 0) c.arc(x + dx * 0.5, y - 20, 22, 0.2, Math.PI - 0.2); else if (mood < 0) c.arc(x + dx * 0.5, y + 2, 20, Math.PI + 0.3, -0.3); else { c.moveTo(x - 18, y - 6); c.lineTo(x + 18, y - 6); } c.stroke();
    // knobs on the belly
    knobs.forEach((a, i) => { const kx = x - 62 + i * 62, ky = y + 50; const kp = new Path2D(); kp.arc(kx, ky, 20, 0, Math.PI * 2); solid(c, kp, [PAL.magenta, PAL.teal, PAL.yellow][i], 4, 4); c.save(); c.translate(kx, ky); c.rotate(a); c.fillStyle = K; c.fillRect(-3, -18, 6, 16); c.restore(); });
    // funnel on top
    const fn = new Path2D(); fn.moveTo(x - 80, y - 210); fn.lineTo(x + 80, y - 210); fn.lineTo(x + 26, y - 122); fn.lineTo(x - 26, y - 122); fn.closePath();
    solid(c, fn, PAL.yellow, 8, 5); c.save(); c.clip(fn); c.fillStyle = K; for (let i = -6; i < 6; i++) c.fillRect(x + i * 24, y - 220, 9, 110); c.restore(); c.lineWidth = 5; c.strokeStyle = K; c.stroke(fn);
  };

  // static per-scene ground: pastel split, bacterio dashes at hero strength, and a decor layer (terrazzo quarter-disc,
  // dot-grid card, confetti, a squiggle) kept to corners and edges that no story element uses. Built once per scene.
  const GROUNDS = {};
  const confetti = (c, r, spots) => spots.forEach(([x, y], i) => {
    const s = r.range(10, 17), kind = i % 4, col = [PAL.magenta, PAL.blue, PAL.yellow, PAL.teal, PAL.red, K][(i * 5 + 1) % 6];
    c.save(); c.translate(x, y); c.rotate(r.range(0, 7)); const p = new Path2D();
    if (kind <= 1) { p.moveTo(0, -s); p.lineTo(s * 0.9, s * 0.6); p.lineTo(-s * 0.9, s * 0.6); p.closePath(); c.fillStyle = col; c.fill(p); c.lineWidth = 3; c.strokeStyle = K; c.stroke(p); }
    else if (kind === 2) { c.fillStyle = col; c.fillRect(-s * 0.9, -3.5, s * 1.8, 7); }
    else { c.beginPath(); c.arc(0, 0, s * 0.45, 0, 7); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.strokeStyle = K; c.stroke(); }
    c.restore();
  });
  const dotCard = (c, x, y, w, h, col, rot = 0) => { c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); const p = new Path2D(); p.rect(-w / 2, -h / 2, w, h); solid(c, p, col, 8, 4); c.save(); c.clip(p); c.fillStyle = K; for (let yy = -h / 2 + 14; yy < h / 2 - 6; yy += 16) for (let xx = -w / 2 + 14; xx < w / 2 - 6; xx += 16) { c.beginPath(); c.arc(xx, yy, 3, 0, 7); c.fill(); } c.restore(); c.restore(); };
  const quarter = (c, cx, cy, R, a0, seed) => { const p = new Path2D(); p.moveTo(cx, cy); p.arc(cx, cy, R, a0, a0 + Math.PI / 2); p.closePath(); c.save(); c.translate(10, 10); c.fillStyle = K; c.fill(p); c.restore(); terrazzo(c, p, seed); c.lineWidth = 5; c.strokeStyle = K; c.stroke(p); };
  const gridCard = (c, x, y, w, h, col, rot) => { c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); const p = new Path2D(); p.rect(-w / 2, -h / 2, w, h); solid(c, p, col, 8, 4); c.save(); c.clip(p); c.strokeStyle = 'rgba(21,21,21,0.5)'; c.lineWidth = 2; for (let xx = -w / 2; xx < w / 2; xx += 24) { c.beginPath(); c.moveTo(xx, -h / 2); c.lineTo(xx, h / 2); c.stroke(); } for (let yy = -h / 2; yy < h / 2; yy += 24) { c.beginPath(); c.moveTo(-w / 2, yy); c.lineTo(w / 2, yy); c.stroke(); } c.restore(); c.lineWidth = 4; c.strokeStyle = K; c.stroke(p); c.restore(); };
  function sceneGround(scene, grounds, W, HH) {
    const key = scene + ':' + W + 'x' + HH;
    if (GROUNDS[key]) return GROUNDS[key];
    const L = H.layer(W, HH), c = L.getContext('2d');
    c.fillStyle = grounds[0]; c.fillRect(0, 0, W, HH);
    c.fillStyle = grounds[1]; c.beginPath(); c.moveTo(860, 0); c.lineTo(W, 0); c.lineTo(W, HH); c.lineTo(600, HH); c.closePath(); c.fill();
    const rb = H.rng(3 + scene); c.fillStyle = 'rgba(21,21,21,0.55)';
    for (let i = 0; i < 260; i++) { const x = rb.range(0, W), y = rb.range(0, HH), a = rb.range(0, Math.PI); c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.ellipse(0, 0, rb.range(3, 7), 1.6, 0, 0, 7); c.fill(); c.restore(); }
    const r = H.rng(40 + scene);
    c.lineCap = 'round'; c.lineJoin = 'round';
    if (scene === 1) {
      quarter(c, 0, HH, 165, -Math.PI / 2, 21);
      dotCard(c, 1010, 638, 240, 62, PAL.butter, -0.02);
      strokeOutlined(c, squigglePath(430, 688, 230, 9, 3.5, -0.03), PAL.blue, 8, 3, 5);
      confetti(c, r, [[40, 170], [78, 300], [36, 430], [1240, 40], [1150, 70], [1250, 150], [470, 40], [600, 640], [1260, 400]]);
    } else if (scene === 2) {
      quarter(c, W, HH, 165, Math.PI, 22);
      dotCard(c, 1132, 22, 128, 84, PAL.pink, 0.04);
      strokeOutlined(c, squigglePath(620, 690, 240, 10, 3, -0.04), PAL.magenta, 8, 3, 5);
      c.strokeStyle = K; c.lineWidth = 6; c.stroke(zigzagPath(48, 200, 300, 10, 9, Math.PI / 2));
      confetti(c, r, [[40, 640], [110, 690], [380, 670], [900, 640], [880, 40], [1060, 40], [1250, 210], [1240, 300], [440, 40]]);
    } else if (scene === 3) {
      quarter(c, W, HH, 150, Math.PI, 23);
      gridCard(c, 430, 30, 230, 96, PAL.butter, -0.03);
      strokeOutlined(c, squigglePath(30, 680, 210, 9, 3, -0.03), PAL.teal, 8, 3, 5);
      confetti(c, r, [[720, 50], [780, 120], [1250, 60], [1180, 40], [40, 200], [60, 330], [850, 690], [700, 690]]);
    } else {
      quarter(c, W, 0, 160, Math.PI / 2, 24);
      dotCard(c, 560, 652, 240, 50, PAL.mint, 0.02);
      c.strokeStyle = K; c.lineWidth = 6; c.stroke(squigglePath(52, 190, 300, 12, 3, Math.PI / 2));
      confetti(c, r, [[860, 40], [960, 90], [1210, 260], [1240, 380], [1210, 520], [40, 60 + 560], [470, 690], [1240, 660], [760, 40]]);
    }
    GROUNDS[key] = L; return L;
  }

  const explainMemphis = (ctx, W, HH, t) => {
    const c = ctx, E = H.ease, cl = H.clamp;
    const tq = Math.floor(t * 12) / 12; // on twos
    const S = (a, b) => cl((tq - a) / (b - a), 0, 1);
    const pop = (d, x, y, dur = 0.25) => { const s = E.back(S(d, d + dur)); if (s <= 0) return false; c.save(); c.translate(x, y); c.scale(s, s); c.translate(-x, -y); return true; };
    const bob = (ph, a = 5) => Math.sin(tq * 2.4 + ph) * a;
    const BANDS = [5.4, 9.8, 12.35], swap = (b) => b + 0.42;
    const scene = tq < swap(BANDS[0]) ? 1 : tq < swap(BANDS[1]) ? 2 : tq < swap(BANDS[2]) ? 3 : 4;
    const grounds = { 1: [PAL.pink, PAL.mint], 2: [PAL.butter, PAL.lilac], 3: [PAL.mint, PAL.pink], 4: [PAL.lilac, PAL.butter] }[scene];
    c.drawImage(sceneGround(scene, grounds, W, HH), 0, 0);
    const MX = 300, MY = 430; // machine position in scenes 1-2

    // ---------- hook: big bubble, then it shrinks into a corner sticker ----------
    const hp = E.inOut(S(1.7, 2.3));
    {
      const bp = S(0.1, 0.45); const x = H.lerp(640, 200, hp), y = H.lerp(340, 80, hp), sc = H.lerp(1, 0.42, hp), rot = H.lerp(-0.05, -0.06, hp);
      if (bp > 0 && hp < 1) {
        c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc * E.back(bp), sc * E.back(bp));
        solid(c, bubble(820, 300, hp < 0.5 ? [-200, 230] : null), PAL.yellow, 16, 6);
        if (tq >= 0.45) chunky(c, 'HOW DOES', 0, -50, 84, PAL.magenta);
        if (tq >= 0.6) chunky(c, 'AI LEARN?', 0, 60, 84, PAL.blue);
        c.restore();
      }
      if (hp < 1) { strokeOutlined(c, squigglePath(80, 620, 260, 16, 3, -0.1, tq * 3, S(0.3, 0.9)), PAL.teal, 12, 4, 6); if (pop(0.5, 1120, 150)) { c.translate(1120, 150); c.rotate(tq); solid(c, burst(12, 50, 80), PAL.magenta, 8, 4); c.restore(); } }
    }

    // ---------- scene 1: data dropped into the funnel ----------
    if (scene === 1 && tq > 2.0) {
      if (pop(2.0, MX, MY, 0.3)) { machine(c, MX, MY + bob(0, 3), [0.4, -0.8, 1.2], 0.5 + 0.5 * Math.sin(tq * 3), 1); c.restore(); }
      if (tq > 2.3) tag(c, 'MODEL', MX, MY + 200, PAL.butter, 28, -0.05);
      // examples hop in from the right along arcs into the funnel
      for (let i = 0; i < 12; i++) {
        const u = (tq - 2.5 - i * 0.28) / 1.1; if (u < 0 || u > 1) continue;
        const kind = H.rng(i * 9 + 4)() < 0.5 ? 'cat' : 'dog', sx = 1180 - (i % 3) * 120, sy = 560 - (i % 2) * 90;
        const x = H.lerp(sx, MX, u), y = H.lerp(sy, MY - 230, u) - Math.sin(u * Math.PI) * 260, s = 92 * (1 - E.in(cl((u - 0.75) / 0.25, 0, 1)));
        if (s < 8) continue;
        c.save(); c.translate(x, y); c.rotate((1 - u) * (i % 2 ? 0.4 : -0.4)); face(c, kind, 0, 0, s); if (s > 60) tag(c, kind, 0, s * 0.58, kind === 'cat' ? PAL.yellow : PAL.mint, 28); c.restore();
      }
      fatArrow(c, 1000, 250, 520, 200, E.out(S(2.7, 3.1)), PAL.magenta, 20);
      if (tq > 3.0) tag(c, 'TRAINING DATA', 800, 160, PAL.cream, 28, -0.08, 9);
      // counter sticker pops every time it ticks
      const cp = S(3.0, 5.2), n = cp < 1 ? Math.pow(cp, 3) * 1e6 : 1e6, beat = 1 + 0.06 * (Math.floor(tq * 12) % 2);
      if (pop(2.9, 960, 520, 0.3)) {
        c.translate(960, 520); c.rotate(0.05); c.scale(beat, beat);
        const st = roundRect(-250, -70, 500, 140, 30); solid(c, st, PAL.cream, 10, 5);
        chunky(c, Math.round(n).toLocaleString('en-US'), 0, -12, 64, PAL.red, -6);
        c.font = '700 30px "Fredoka"'; c.fillStyle = K; c.textAlign = 'center'; c.fillText('EXAMPLES', 0, 50);
        c.restore();
      }
    }

    // ---------- scene 2: guess -> check -> adjust ----------
    if (scene === 2) {
      const t0 = swap(BANDS[0]), adj = E.inOut(S(8.3, 9.0)), right = tq >= 9.3;
      const knobs = [H.lerp(0.4, -1.2, adj), H.lerp(-0.8, 0.9, adj), H.lerp(1.2, 0.1, adj)];
      machine(c, MX, MY + bob(0, 3), knobs, right ? 0.9 : 0.8, tq < 7.4 ? 0 : right ? 1 : -1);
      // new picture
      if (pop(t0 + 0.1, 560, 470, 0.3)) { face(c, 'cat', 560, 470, 130); c.restore(); }
      if (tq > t0 + 0.35) tag(c, 'NEW PICTURE', 560, 570, PAL.cream, 24, 0.04);
      // speech bubble with the guess
      const bx = 600, by = 200;
      const say = (txt, col, d) => { const s = E.back(S(d, d + 0.25)); if (s <= 0) return false; c.save(); c.translate(bx, by); c.scale(s, s); solid(c, bubble(300, 130, [-110, 110]), PAL.cream, 8, 5); chunky(c, txt, 0, 4, 60, col); c.restore(); return true; };
      if (!right && say('DOG?', PAL.blue, 6.7)) {
        if (tq >= 7.4) { // CHECK: starburst + squiggly cross
          c.save(); c.translate(bx + 200, by - 40); c.rotate(tq * 0.8); solid(c, burst(10, 44, 70), PAL.red, 6, 4); c.restore();
          c.save(); c.translate(bx + 200, by - 40); c.lineCap = 'round'; c.strokeStyle = PAL.cream; c.lineWidth = 12; c.beginPath(); c.moveTo(-22, -22); c.lineTo(22, 22); c.moveTo(22, -22); c.lineTo(-22, 22); c.stroke(); c.restore();
          tag(c, 'NOPE, IT’S A CAT!', bx + 20, by - 102, PAL.red, 26, -0.04);
        }
      }
      if (right && say('CAT!', PAL.magenta, 9.3)) {
        if (tq >= 9.6) { c.save(); c.translate(bx + 190, by - 40); solid(c, burst(10, 44, 66), PAL.teal, 6, 4); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = K; c.lineWidth = 11; c.beginPath(); c.moveTo(-22, 2); c.lineTo(-6, 18); c.lineTo(24, -18); c.stroke(); c.restore(); }
      }
      // ADJUST: a zigzag bolt runs back from the check to the knobs
      if (tq >= 7.8 && tq < 9.3) { strokeOutlined(c, zigzagPath(bx + 190, by + 10, 480, 18, 10, 2.45, S(7.8, 8.2)), PAL.yellow, 11, 4, 6); if (tq > 8.2) tag(c, 'ERROR!', 520, 380, PAL.yellow, 26, 0.1); }
      // the loop on the right: three patterned shapes chased by chunky arrows
      const L = [['GUESS', 1000, 170, 'circle', PAL.magenta], ['CHECK', 1160, 400, 'tri', PAL.teal], ['ADJUST', 900, 470, 'square', PAL.blue]], act = tq < 7.4 ? 0 : tq < 8.2 ? 1 : tq < 9.3 ? 2 : Math.floor((tq - 9.3) * 3) % 3;
      L.forEach(([s, x, y, sh, col], i) => {
        if (!pop(t0 + 0.2 + i * 0.12, x, y, 0.25)) return;
        const k = i === act && tq > 6.7 ? 1.12 + 0.04 * Math.sin(tq * 12) : 1; c.translate(x, y); c.scale(k, k); c.translate(-x, -y);
        const p = new Path2D(); if (sh === 'circle') p.arc(x, y, 62, 0, 7); else if (sh === 'tri') { p.moveTo(x, y - 70); p.lineTo(x + 70, y + 52); p.lineTo(x - 70, y + 52); p.closePath(); } else p.rect(x - 60, y - 55, 120, 110);
        solid(c, p, col, 8, 5);
        c.save(); c.clip(p); c.fillStyle = 'rgba(21,21,21,0.35)'; for (let a = -4; a < 5; a++) for (let b = -4; b < 5; b++) { c.beginPath(); c.arc(x + a * 18, y + b * 18, 2.6, 0, 7); c.fill(); } c.restore();
        tag(c, s, x, y + (sh === 'tri' ? 24 : 4), PAL.cream, 24); c.restore();
      });
      fatArrow(c, 1050, 225, 1120, 320, E.out(S(7.1, 7.35)), PAL.yellow, 18);
      fatArrow(c, 1090, 450, 975, 470, E.out(S(7.9, 8.15)), PAL.yellow, 18);
      fatArrow(c, 880, 400, 945, 240, E.out(S(9.0, 9.25)), PAL.yellow, 18);
    }

    // ---------- scene 3: progress ----------
    if (scene === 3) {
      const t0 = swap(BANDS[1]), prog = E.inOut(S(t0 + 0.2, 11.9)), base = 600, x0 = 110;
      const ax = new Path2D(); ax.rect(x0 - 10, base, 700, 12); solid(c, ax, K, 0, 0);
      for (let i = 0; i < 8; i++) {
        const acc = 61 + 36 * (1 - Math.pow(1 - i / 7, 2)), bp = E.back(cl(prog * 8 - i, 0, 1)), h = (acc - 40) * 7 * bp; if (h <= 1) continue;
        const p = new Path2D(); p.rect(x0 + 10 + i * 84, base - h, 62, h); solid(c, p, [PAL.magenta, PAL.blue, PAL.yellow, PAL.teal][i % 4], 7, 4);
        c.save(); c.clip(p); if (i % 2) { c.fillStyle = 'rgba(21,21,21,0.5)'; for (let y = base - h; y < base; y += 16) c.fillRect(x0 + 10 + i * 84, y, 62, 6); } else { c.fillStyle = PAL.cream; for (let y = base - h + 8; y < base; y += 18) for (let x = 0; x < 3; x++) { c.beginPath(); c.arc(x0 + 22 + i * 84 + x * 19, y, 3.5, 0, 7); c.fill(); } } c.restore();
      }
      if (tq > t0 + 0.2) tag(c, 'TRAINING ROUNDS →', 440, 655, PAL.cream, 26);
      // emphasis burst + confetti behind the number
      const em = S(11.9, 12.1);
      if (em > 0) { c.save(); c.translate(1010, 330); c.rotate(tq * 0.6); c.scale(E.back(em), E.back(em)); solid(c, burst(16, 150, 215), PAL.yellow, 12, 5); c.restore();
        const rc = H.rng(5); for (let i = 0; i < 18; i++) { const a = rc.range(0, 7), d = 200 + rc.range(0, 120) * em; c.save(); c.translate(1010 + Math.cos(a) * d, 330 + Math.sin(a) * d); c.rotate(a + tq * 3); c.fillStyle = rc.pick([PAL.magenta, PAL.blue, PAL.teal, K]); c.beginPath(); c.moveTo(0, -12); c.lineTo(11, 8); c.lineTo(-11, 8); c.closePath(); c.fill(); c.restore(); } }
      if (pop(t0 + 0.1, 1010, 330, 0.3)) { chunky(c, Math.round(H.lerp(61, 97, prog)) + '%', 1010, 330, 120, PAL.magenta, -10); c.restore(); }
      if (tq > t0 + 0.3) tag(c, 'ACCURACY', 1010, 200, PAL.cream, 26, -0.05);
      if (tq > t0 + 0.5) tag(c, '61% → 97%', 1010, 450, PAL.mint, 24, 0.04);
    }

    // ---------- scene 4: takeaway ----------
    if (scene === 4) {
      const t0 = swap(BANDS[2]);
      if (pop(t0 + 0.05, 640, 360, 0.3)) {
        c.translate(640, 360); c.rotate(-0.04 + Math.sin(tq * 2.4) * 0.01);
        solid(c, bubble(1000, 360, [-300, 250]), PAL.yellow, 16, 6);
        chunky(c, 'MORE EXAMPLES', 0, -70, 68, PAL.blue, -6);
        if (tq >= t0 + 0.35) chunky(c, 'BETTER GUESSES!', 0, 80, 68, PAL.magenta, -6);
        c.restore();
      }
      fatArrow(c, 640, 330, 640, 380, E.out(S(t0 + 0.2, t0 + 0.4)), PAL.teal, 16);
      strokeOutlined(c, squigglePath(120, 640, 280, 16, 3, -0.08, tq * 3, S(t0 + 0.3, t0 + 0.8)), PAL.magenta, 12, 4, 6);
      strokeOutlined(c, zigzagPath(900, 640, 260, 16, 9, -0.05, S(t0 + 0.4, t0 + 0.9)), PAL.teal, 11, 4, 6);
    }

    // ---------- corner sticker header (after the hook) ----------

    // ---------- striped band swipe between scenes ----------
    for (const b of BANDS) {
      const u = S(b, b + 0.85); if (u <= 0 || u >= 1) continue;
      const x = H.lerp(-2300, W + 900, u);
      c.save(); c.translate(x, HH / 2); c.rotate(-0.35);
      const band = new Path2D(); band.rect(0, -1400, 1700, 2800);
      c.save(); c.translate(14, 14); c.fillStyle = K; c.fill(band); c.restore();
      c.save(); c.clip(band); const cols = [PAL.magenta, PAL.yellow, PAL.blue, PAL.mint, PAL.red];
      for (let i = 0; i < 20; i++) { c.fillStyle = cols[i % cols.length]; c.fillRect(i * 85, -1400, 86, 2800); c.fillStyle = K; for (let y = -1400; y < 1400; y += 40) { c.beginPath(); c.arc(i * 85 + 42, y + (i % 2) * 20, 5, 0, 7); c.fill(); } }
      c.restore(); c.lineWidth = 6; c.strokeStyle = K; c.stroke(band); c.restore();
    }
    // header sticker stays on top
    if (hp >= 1) { c.save(); c.translate(200, 80); c.rotate(-0.06); c.scale(0.42, 0.42); solid(c, bubble(820, 300, null), PAL.yellow, 16, 6); chunky(c, 'HOW DOES', 0, -50, 84, PAL.magenta); chunky(c, 'AI LEARN?', 0, 60, 84, PAL.blue); c.restore(); }
    H.grain(ctx, W, HH, 0.05, 6 + Math.floor(t * 12), true);
  };

  registerStyle({
    id: 'memphis',
    name: 'Memphis Group',
    category: 'Art & Design Movements',
    description: 'Early-80s Memphis Milano maximalism: pastel grounds clashing with bold primaries, thick black outlines and hard offset shadows, squiggles, zigzags, dot grids, terrazzo chips and confetti triangles, all orbiting a chunky tilted chat-bubble headline.',
    motion: 'Cut-out cel timing on twos: the mint wedge slides in, shapes pop on one by one with springy overshoot, squiggles and zigzags draw themselves, the chat bubble squash-and-stretches in, the words pop on the beat, confetti bursts out and the sticker slaps on; then everything bobs off-beat and the typing dots bounce.',
    fonts: ['400 92px "Rubik Mono One"', '700 26px "Fredoka"'],
    frameT: 4.1,
    duration: 4.5,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'Memphis cut-out animation on twos: examples hop into a funnel-topped totem computer, scenes change with a striped polka-dot band that swipes across, arrows are fat outlined shapes with hard shadows, counters are stickers that pop on each tick, and the key moments get a spinning starburst.',
    explainer(ctx, W, HH, t) { explainMemphis(ctx, W, HH, t); },
    // Sound: a playful 80s cut-out cartoon. Stickers and shapes land with rubbery pops, things hop on springy boings,
    // the striped band swipes across as a fluttering zip, labels get bright synth stabs, the wrong guess is a sad
    // "wah-wah" and the zigzag a buzzy zap, under a light synth-pop pulse. Times copied from explainMemphis(); it
    // animates on twos at 12 fps, so q(x) is the first frame at which its quantised clock reaches x.
    explainerSound(k) {
      const D = 14.5, E = H.ease, cl = H.clamp;
      const q = (x) => Math.ceil(x * 12 - 1e-6) / 12;
      const land = (d, dur) => q(d + dur * 0.37); // back-eased pop(d, dur) first reaches full size at 37%
      const pan = (px) => cl((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (a, b, ease, u) => { for (let i = 0; i <= 400; i++) if (ease(i / 400) >= u - 1e-6) return q(a + ((b - a) * i) / 400); return q(b); };
      const BANDS = [5.4, 9.8, 12.35], swap = (b) => b + 0.42, MX_ = 300; // MX_: the machine's x in scenes 1-2
      // rubbery sticker pop (kept low)
      const pop = (t, f, g, p, minor = true) => k.play('pop', t, { f, gain: g, pan: p, minor });
      // springy boing: quick upward bend that sags back
      const boing = (t, f, g, p, minor = true) => { k.tone(t, { f: [[0, f], [0.04, f * 2.4], [0.3, f * 1.3]], type: 'triangle', dur: 0.32, gain: 0.12 * g, a: 0.003, pan: p, minor }); k.tone(t, { f: [[0, f * 2], [0.05, f * 3.5], [0.2, f * 2.2]], dur: 0.2, gain: 0.03 * g, pan: p, minor }); };
      // bright 80s synth stab (detuned saws through a closing filter)
      const stab = (t, notes, g, p, minor) => notes.forEach((n, i) => { for (const det of [-10, 10])
        k.tone(t, { f: n, type: 'sawtooth', detune: det, dur: 0.28, gain: 0.03 * g, a: 0.004, hold: 0.05, filter: 'lowpass', f2: [[0, 2600], [0.25, 700]], q: 2, pan: p + (i - 1) * 0.15, verb: 0.2, minor }); });
      // the striped band: a fluttering zip as ~20 stripes rush past, left to right
      const zip = (b) => {
        const d = 0.85;
        k.tone(b + 0.1, { f: [[0, 160], [d - 0.15, 520]], type: 'sawtooth', dur: d - 0.1, gain: 0.04, a: 0.25, filter: 'lowpass', f2: 1200, q: 3 });
        for (let x = 0.08; x < d - 0.05; x += 1 / 28) { const e = Math.sin((x / d) * Math.PI);
          k.noise(b + x, { dur: 0.025, filter: 'bandpass', f: 800 + e * 700, q: 1.5, gain: 0.16 * e, a: 0.002, pan: (x / d - 0.5) * 1.4 }); }
      };
      // a cartoon hand clap
      const clap = (t, g, p) => [0, 0.012, 0.022].forEach((o) => k.noise(t + o, { dur: 0.05, filter: 'bandpass', f: 1300, q: 1.1, gain: 0.22 * g, a: 0.001, pan: p }));

      k.music('pulse', 0, D, { bpm: 112, gain: 0.3, chords: [['C4', 'E4', 'G4', 'B4'], ['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'B3', 'D4', 'F4']] });

      // ---- hook: bubble pops up (back 0.1-0.45), HOW DOES (0.5), AI LEARN? + starburst (0.667), squiggle draws (0.3-0.9)
      pop(land(0.1, 0.35), 360, 1.1, 0, false); boing(land(0.1, 0.35), 120, 0.8, 0, false);
      stab(q(0.45), ['E4', 'G4', 'C5'], 0.9, -0.1, true);
      stab(q(0.6), ['G4', 'C5', 'E5'], 1.1, 0.1, false); pop(q(0.6), 480, 0.8, pan(1120));
      k.tone(0.32, { f: [[0, 140], [0.3, 220], [0.6, 170]], type: 'triangle', dur: 0.6, gain: 0.05, a: 0.1, filter: 'lowpass', f2: 900, pan: pan(200), minor: true }); // squiggle wiggles on
      // bubble shrinks into the corner sticker (1.7-2.3): soft slide
      k.noise(q(1.7), { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.6, 350]], q: 0.8, gain: 0.07, a: 0.2, pan: -0.4, minor: true });

      // ---- scene 1: DATA hops into the funnel
      boing(land(2.0, 0.3), 90, 0.7, pan(MX_), false); k.play('thud', land(2.0, 0.3), { f: 120, gain: 0.2, pan: pan(MX_) });
      pop(q(2.3 + 1e-3), 420, 0.6, pan(MX_)); // MODEL tag
      const hops = []; for (let i = 0; 2.5 + i * 0.28 < 5.3; i++) hops.push(q(2.5 + i * 0.28));
      hops.forEach((t, i) => boing(t, 150 + (i % 3) * 25, 0.55, pan(1180 - (i % 3) * 120)));
      k.play('slap', when(2.7, 3.1, E.out, 0.95), { gain: 0.4, pan: pan(600), minor: true }); // fat arrow lands
      pop(q(3.0 + 1e-3), 520, 0.8, pan(880)); // TRAINING DATA tag + counter sticker
      // counter sticker swells on every other frame (6/s) while n = S(3.0,5.2)^3 * 1e6 ticks over
      for (let f = Math.ceil(3.1 * 12); f / 12 < 5.2; f++) { const t = f / 12; if (f % 2 !== 1 || hops.some((h) => Math.abs(t - h) < 0.04)) continue;
        pop(t, 640, 0.42, pan(960)); k.play('tick', t, { f: 2200, gain: 0.5, pan: pan(960), minor: true }); }
      stab(q(5.2), ['C4', 'E4', 'G4', 'C5'], 1.2, pan(960)); pop(q(5.2), 300, 1, pan(960), false); // 1,000,000

      // ---- the striped band swipes: 5.4, 9.8, 12.35
      BANDS.forEach(zip);

      // ---- scene 2: GUESS / CHECK / ADJUST (t0 = 5.82)
      const t0 = swap(BANDS[0]);
      pop(land(t0 + 0.1, 0.3), 380, 0.9, pan(560)); // new picture
      [0, 1, 2].forEach((i) => pop(land(t0 + 0.2 + i * 0.12, 0.25), [440, 520, 600][i], 0.6, pan([1000, 1160, 900][i]))); // loop shapes
      // the guess: DOG? bubble (back 6.7-6.95) with a questioning two-note blip
      pop(land(6.7, 0.25), 340, 0.9, pan(600), false);
      k.tone(land(6.7, 0.25) + 0.05, { f: 'D4', type: 'square', dur: 0.1, gain: 0.05, a: 0.003, hold: 0.06, filter: 'lowpass', f2: 1400, pan: pan(600) });
      k.tone(land(6.7, 0.25) + 0.16, { f: 'A4', type: 'square', dur: 0.14, gain: 0.05, a: 0.003, hold: 0.08, filter: 'lowpass', f2: 1400, pan: pan(600) });
      k.play('slap', when(7.1, 7.35, E.out, 0.95), { gain: 0.3, pan: pan(1090), minor: true });
      // CHECK (7.417): starburst + cross + NOPE — a sad wah-wah
      const ck = q(7.4);
      pop(ck, 260, 1.1, pan(800), false); k.play('thud', ck, { f: 110, gain: 0.4, pan: pan(800) });
      [['G3', 'F#3'], ['F#3', 'E3']].forEach(([a, b], i) => k.tone(ck + 0.05 + i * 0.24, { f: [[0, a], [0.2, b]], type: 'sawtooth', dur: i ? 0.45 : 0.22, gain: 0.12, a: 0.02, hold: 0.12, filter: 'lowpass', f2: [[0, 500], [0.1, 1300], [0.22, 500]], q: 3, pan: pan(800) }));
      // ADJUST: the zigzag bolt zaps back to the knobs (7.8-8.2), ERROR! tag (8.25)
      for (let x = 0; x < 0.4; x += 0.04) k.tone(q(7.8) + x, { f: 70 + (x * 37 % 1) * 60, type: 'sawtooth', dur: 0.035, gain: 0.07, a: 0.002, filter: 'bandpass', f2: 1500, q: 1.5, pan: pan(700 - x * 600) });
      pop(q(8.2 + 1e-3), 420, 0.7, pan(520));
      // knobs twist (inOut 8.3-9.0): ratchet clicks at least 90 ms apart
      for (let i = 1, lt = 0; i <= 8; i++) { const t = when(8.3, 9.0, E.inOut, i / 8); if (t - lt < 0.09) continue; lt = t; k.play('click', t, { f: 1100, gain: 0.6, pan: pan(MX_), minor: true }); k.play('tock', t + 0.004, { f: 500 + i * 20, gain: 0.25, pan: pan(MX_), minor: true }); }
      k.play('slap', when(9.0, 9.25, E.out, 0.95), { gain: 0.3, pan: pan(910), minor: true });
      // the correction: CAT! bubble (9.417), teal starburst + tick (9.667) — a bouncy major arpeggio
      pop(land(9.3, 0.25), 420, 0.9, pan(600));
      ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => k.tone(q(9.6) + i * 0.06, { f: n, type: 'triangle', dur: 0.35, gain: 0.13, a: 0.003, pan: pan(790), verb: 0.2 }));
      pop(q(9.6), 500, 0.9, pan(790), false);

      // ---- scene 3: PROGRESS (t0 = 10.22): number pops (10.5), bars spring up one by one as prog = inOut(S(10.42,11.9)) passes i/8
      const t3 = swap(BANDS[1]);
      pop(land(t3 + 0.1, 0.3), 330, 0.9, pan(1010), false);
      const bars = []; for (let i = 0; i < 8; i++) { const t = when(t3 + 0.2, 11.9, E.inOut, i / 8 + 0.02); if (bars.length && t - bars[bars.length - 1] < 0.09) continue; bars.push(t); boing(t, 110 + i * 14, 0.6, pan(150 + i * 84)); }
      for (let f = Math.ceil(10.5 * 12), last = 61; f / 12 < 11.9; f++) { const t = f / 12, v = Math.round(H.lerp(61, 97, E.inOut(cl((t - t3 - 0.2) / (11.9 - t3 - 0.2), 0, 1))));
        if (v !== last && !bars.some((b) => Math.abs(t - b) < 0.04)) { pop(t, 680, 0.38, pan(1010)); k.play('tick', t, { f: 2200, gain: 0.5, pan: pan(1010), minor: true }); last = v; } }
      // 97%: yellow starburst springs out with confetti (12.0) — the biggest hit
      const big = land(11.9, 0.2);
      k.play('impact', big, { gain: 1.7, pan: pan(1010) }); k.play('thud', big, { f: 70, gain: 0.6 });
      stab(big, ['C4', 'E4', 'G4', 'C5'], 1.6, pan(1010));
      clap(big, 1, pan(1010)); boing(big, 80, 1.2, pan(1010), false);
      for (let i = 0; i < 6; i++) pop(big + 0.3 + i * 0.08, 280 + (i * 97) % 300, 0.6, (i % 2 ? 0.4 : -0.4) + pan(1010) * 0.5); // confetti flies out

      // ---- scene 4: TAKEAWAY (t0 = 12.77): bubble pops (13.0), arrow, BETTER GUESSES! (13.167), squiggle + zigzag draw on
      const t4 = swap(BANDS[2]);
      pop(land(t4 + 0.05, 0.3), 340, 1.0, 0, false); boing(land(t4 + 0.05, 0.3), 110, 0.7, 0);
      k.tone(q(t4 + 0.3), { f: [[0, 150], [0.5, 230]], type: 'triangle', dur: 0.5, gain: 0.04, a: 0.1, filter: 'lowpass', f2: 900, pan: -0.5, minor: true });
      stab(q(t4 + 0.35), ['F4', 'A4', 'C5'], 0.8, 0.1, true);
      ['C4', 'G4', 'C5', 'E5'].forEach((n, i) => k.tone(q(t4 + 0.35) + 0.25 + i * 0.07, { f: n, type: 'triangle', dur: 0.8, gain: 0.12 - i * 0.015, a: 0.003, pan: (i - 1.5) * 0.25, verb: 0.3 })); // resolves
      clap(q(t4 + 0.35) + 0.25, 0.6, 0);
    },
    draw(ctx, W, HH, t) {
      const c = ctx;
      // cel-style timing: all motion is held for two frames (12 fps steps) like 80s cut-out animation
      const tq = Math.floor(t * 12) / 12;
      const bob = (ph, a = 6) => Math.sin(tq * 2.1 + ph) * a;
      const P = (d, dur = 0.5) => H.clamp((tq - d) / dur, 0, 1);
      const pop = (d, x, y, dur = 0.25) => { const s = H.ease.back(P(d, dur)); if (s <= 0) return false; c.save(); c.translate(x, y); c.scale(s, s); c.translate(-x, -y); return true; };

      // ---------- ground: pastel split (mint wedge slides in) ----------
      c.fillStyle = PAL.pink; c.fillRect(0, 0, W, HH);
      { const off = (1 - H.ease.out(P(0, 0.33))) * 760;
        c.fillStyle = PAL.mint; c.beginPath(); c.moveTo(820 + off, 0); c.lineTo(W + off, 0); c.lineTo(W + off, HH); c.lineTo(560 + off, HH); c.closePath(); c.fill(); }
      // fine black dash texture on the pink (classic Memphis "bacterio"-lite), sprinkled on
      const rb = H.rng(3), nb = Math.floor(260 * P(0.15, 0.4));
      c.fillStyle = 'rgba(21,21,21,0.55)';
      for (let i = 0; i < 260; i++) {
        const x = rb.range(0, 760), y = rb.range(0, HH); const a = rb.range(0, Math.PI), l = rb.range(3, 7);
        if (i >= nb) continue;
        c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.ellipse(0, 0, l, 1.6, 0, 0, 7); c.fill(); c.restore();
      }

      // ---------- background shapes, popping in one by one ----------
      // terrazzo semicircle dropping from the top-left
      { const dy = -(1 - H.ease.back(P(0.25, 0.3))) * 230;
        const semi = new Path2D(); semi.arc(210, -10 + bob(0.3, 4) + dy, 190, 0, Math.PI); semi.closePath();
        c.save(); c.translate(10, 10); c.fillStyle = K; c.fill(semi); c.restore();
        terrazzo(c, semi, 11); c.lineWidth = 5; c.strokeStyle = K; c.stroke(semi); }

      // dot grid panel (top right)
      if (pop(0.42, 1065, 139)) {
        c.translate(0, bob(1.2, 3));
        const dg = new Path2D(); dg.rect(930, 54, 270, 170);
        solid(c, dg, PAL.butter, 10);
        c.fillStyle = K; for (let y = 70; y < 220; y += 18) for (let x = 946; x < 1196; x += 18) { c.beginPath(); c.arc(x, y, 3.4, 0, 7); c.fill(); }
        c.restore();
      }

      // big blue circle bottom-left with stripes inside half
      if (pop(0.58, 190, 560)) {
        const bc = new Path2D(); bc.arc(190, 560 + bob(2.0, 5), 122, 0, Math.PI * 2);
        solid(c, bc, PAL.blue, 12);
        c.save(); c.clip(bc); c.fillStyle = PAL.cream; for (let x = 60; x < 330; x += 22) c.fillRect(x, 560, 11, 200); c.restore();
        c.lineWidth = 5; c.strokeStyle = K; c.stroke(bc);
        c.restore();
      }

      // teal triangle bottom-right
      if (pop(0.72, 1090, 560)) {
        c.translate(1090, 560); c.rotate(-0.2 + Math.sin(tq * 1.3) * 0.05);
        const tri = new Path2D(); tri.moveTo(0, -120); tri.lineTo(115, 85); tri.lineTo(-115, 85); tri.closePath();
        solid(c, tri, PAL.teal, 12);
        c.save(); c.clip(tri); c.fillStyle = K; for (let k = -6; k < 8; k++) { c.beginPath(); c.arc(k * 26, 40, 4, 0, 7); c.fill(); c.beginPath(); c.arc(k * 26 + 13, 64, 4, 0, 7); c.fill(); } c.restore();
        c.restore();
      }

      // lilac slab tilted behind bubble (unfolds sideways)
      { const sx = H.ease.back(P(0.88, 0.25));
        if (sx > 0) {
          c.save(); c.translate(660, 360); c.rotate(0.09); c.scale(sx, 1);
          const slab = new Path2D(); slab.rect(-360, -150, 700, 300);
          solid(c, slab, PAL.lilac, 0);
          c.save(); c.clip(slab); c.strokeStyle = 'rgba(21,21,21,0.5)'; c.lineWidth = 2;
          for (let x = -360; x < 360; x += 30) { c.beginPath(); c.moveTo(x, -150); c.lineTo(x, 150); c.stroke(); }
          for (let y = -150; y < 150; y += 30) { c.beginPath(); c.moveTo(-360, y); c.lineTo(360, y); c.stroke(); }
          c.restore(); c.lineWidth = 5; c.strokeStyle = K; c.stroke(slab);
          c.restore();
        } }

      // squiggles + zigzags draw themselves on
      const dr = (d) => H.ease.inOut(P(d, 0.4));
      if (dr(1.0) > 0) strokeOutlined(c, squigglePath(400, 92, 300, 18, 3.5, -0.08, tq * 3, dr(1.0)), PAL.yellow, 14, 4, 7);
      if (dr(1.1) > 0) strokeOutlined(c, zigzagPath(940, 290, 230, 18, 9, 0.12, dr(1.1)), PAL.magenta, 13, 4, 7);
      c.lineCap = 'round'; c.strokeStyle = K; c.lineWidth = 7;
      if (dr(1.2) > 0) c.stroke(squigglePath(610, 668, 200, 12, 4, -0.08, -tq * 3, dr(1.2)));
      if (dr(1.05) > 0) c.stroke(squigglePath(70, 250, 140, 12, 2.5, 1.35, tq * 2.5, dr(1.05)));
      if (dr(1.25) > 0) strokeOutlined(c, zigzagPath(330, 640, 160, 14, 7, -0.05, dr(1.25)), PAL.blue, 10, 3.5, 6);

      // confetti: bursts out of the bubble, then tumbles in place
      const rc = H.rng(77);
      const keep = (x, y) => !(x > 250 && x < 1060 && y > 170 && y < 560);
      const cols = [PAL.magenta, PAL.blue, PAL.yellow, PAL.teal, PAL.red, K];
      let placed = 0;
      for (let i = 0; i < 200 && placed < 34; i++) {
        const x = rc.range(40, W - 40), y = rc.range(30, HH - 30); if (!keep(x, y)) continue;
        if (Math.hypot(x - 190, y - 560) < 150 || (x > 910 && x < 1220 && y > 40 && y < 240) || Math.hypot(x - 210, y) < 210 || Math.hypot(x - 1090, y - 570) < 150) continue;
        placed++;
        const s = rc.range(10, 18), kind = rc.int(0, 3), col = rc.pick(cols), rot = rc.range(0, 7) + tq * rc.range(-1.5, 1.5), dl = rc.range(0, 0.15);
        const fp = H.ease.out(P(1.4 + dl, 0.4)); if (fp <= 0) continue;
        const px = H.lerp(640, x, fp), py = H.lerp(350, y, fp) - Math.sin(fp * Math.PI) * 60;
        c.save(); c.translate(px, py + bob(i, 3)); c.rotate(rot + (1 - fp) * 6);
        const p = new Path2D();
        if (kind <= 1) { p.moveTo(0, -s); p.lineTo(s * 0.9, s * 0.6); p.lineTo(-s * 0.9, s * 0.6); p.closePath(); c.fillStyle = col; c.fill(p); c.lineWidth = 3; c.strokeStyle = K; c.stroke(p); }
        else if (kind === 2) { c.fillStyle = col; c.fillRect(-s * 0.9, -3.5, s * 1.8, 7); }
        else { c.beginPath(); c.arc(0, 0, s * 0.45, 0, 7); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.strokeStyle = K; c.stroke(); }
        c.restore();
      }

      // ---------- hero: chunky chat bubble headline (squash & stretch pop) ----------
      const bp = P(1.3, 0.4);
      if (bp > 0) {
        const e = H.ease.back(bp), breathe = bp >= 1 ? Math.sin(tq * 2.4) * 0.012 : 0;
        const sxB = bp < 1 ? e * (1 + 0.25 * Math.sin(bp * Math.PI)) : 1 + breathe, syB = bp < 1 ? e * (1 - 0.18 * Math.sin(bp * Math.PI)) : 1 - breathe;
        c.save(); c.translate(640, 350); c.rotate(-0.06); c.scale(sxB, syB);
        const bw = 640, bh = 250, rr = 46;
        const bub = new Path2D();
        bub.moveTo(-bw / 2 + rr, -bh / 2); bub.lineTo(bw / 2 - rr, -bh / 2); bub.quadraticCurveTo(bw / 2, -bh / 2, bw / 2, -bh / 2 + rr);
        bub.lineTo(bw / 2, bh / 2 - rr); bub.quadraticCurveTo(bw / 2, bh / 2, bw / 2 - rr, bh / 2);
        bub.lineTo(-150, bh / 2); bub.lineTo(-230, bh / 2 + 80); bub.lineTo(-215, bh / 2);
        bub.lineTo(-bw / 2 + rr, bh / 2); bub.quadraticCurveTo(-bw / 2, bh / 2, -bw / 2, bh / 2 - rr);
        bub.lineTo(-bw / 2, -bh / 2 + rr); bub.quadraticCurveTo(-bw / 2, -bh / 2, -bw / 2 + rr, -bh / 2); bub.closePath();
        solid(c, bub, PAL.yellow, 16, 6);
        // headline: chunky with hard shadow, each word pops on its own beat
        c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.font = '400 92px "Rubik Mono One"'; c.letterSpacing = '-7px';
        const line = (txt, a, b, d, e2) => {
          let x = 0, y = a, col = b; if (e2) { x = a; y = b; col = d; }
          c.lineJoin = 'round';
          c.fillStyle = K; c.fillText(txt, x + 7, y + 7);
          c.lineWidth = 8; c.strokeStyle = K; c.strokeText(txt, x, y);
          c.fillStyle = col; c.fillText(txt, x, y);
        };
        if (pop(1.6, 0, -40, 0.2)) { line('HELLO', -12, PAL.magenta); c.restore(); }
        { const wH = c.measureText('HUMAN').width, wX = c.measureText('!').width * 0.45, x0 = -(wH + wX) / 2;
          if (pop(1.75, 0, 60, 0.2)) { c.textAlign = 'left'; line('HUMAN', x0, 88, PAL.blue, true); c.restore(); }
          const bx = x0 + wH - c.measureText('!').width * 0.32;
          if (pop(1.92, bx + 30, 50, 0.2)) { c.textAlign = 'left'; c.translate(bx, 0); c.rotate(0.12); line('!', 0, 88, PAL.magenta, true); c.restore(); }
          c.textAlign = 'center'; }
        c.letterSpacing = '0px';
        // typing dots badge
        if (pop(2.05, 250, -118, 0.2)) {
          c.translate(250, -118); c.rotate(0.1);
          const bd = new Path2D(); bd.ellipse(0, 0, 62, 30, 0, 0, Math.PI * 2);
          solid(c, bd, PAL.cream, 6, 4);
          for (let k = 0; k < 3; k++) { const up = Math.max(0, Math.sin(tq * 6 - k * 0.9)) * 6; c.fillStyle = [PAL.magenta, PAL.teal, PAL.blue][k]; c.beginPath(); c.arc(-24 + k * 24, -up, 8, 0, 7); c.fill(); c.lineWidth = 3; c.strokeStyle = K; c.stroke(); }
          c.restore();
        }
        c.restore();
      }

      // small caption sticker slapped on last
      { const sp = P(2.2, 0.2);
        if (sp > 0) {
          const k = H.ease.out(sp);
          c.save(); c.translate(860, 548); c.rotate(-0.04 - (1 - k) * 0.35); c.scale(1.35 - 0.35 * k, 1.35 - 0.35 * k);
          const st = new Path2D(); st.rect(-120, -24, 240, 48);
          solid(c, st, PAL.cream, 7 * k, 4);
          c.fillStyle = K; c.font = '700 26px "Fredoka"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('your new AI pal', 0, 1);
          c.restore();
        } }

      // ---------- print finish ----------
      H.grain(ctx, W, HH, 0.05, 6 + Math.floor(t * 12), true);
    },
  });
}
