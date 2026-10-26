{
  // Multi-scale Truchet (Carlson "winged" tiles): each tile = square in its fill colour, quarter-
  // annulus bands (r = s/3..2s/3) about two opposite corners, plus corner "wing" discs (r = s/3)
  // that spill over the tile edge. Child tiles invert colours, so paths stay continuous across
  // scales. The hidden message is carried by colour: closed regions are flood-labelled and those
  // lying inside the letters "AI" are printed in a third ink (with a touch of screen-print
  // misregistration).
  const TAU = Math.PI * 2;
  const C_DARK = [20, 30, 58], C_LIGHT = [242, 233, 212], C_ACC = [232, 86, 44];


  // =====================================================================================
  // EXPLAINER — the model is a Truchet maze: an input enters on the left, the path its band
  // takes decides which output it reaches. Training = flipping tiles (the weights) so the
  // path routes to the right answer. Scene changes re-lay the tiles in a diagonal sweep.
  // =====================================================================================
  const NAVY = `rgb(${C_DARK})`, CREAM = `rgb(${C_LIGHT})`, ACC = `rgb(${C_ACC})`;
  const XS = (t, a, b) => H.clamp((t - a) / (b - a));
  const EXIT = [{ L: 'T', T: 'L', R: 'B', B: 'R' }, { L: 'B', B: 'L', T: 'R', R: 'T' }];
  const MOVE = { R: [1, 0, 'L'], L: [-1, 0, 'R'], T: [0, -1, 'B'], B: [0, 1, 'T'] };
  const MID = { L: [0, 0.5], R: [1, 0.5], T: [0.5, 0], B: [0.5, 1] };
  const CORNER = { LT: [0, 0], TL: [0, 0], RB: [1, 1], BR: [1, 1], LB: [0, 1], BL: [0, 1], TR: [1, 0], RT: [1, 0] };
  const MC = 9, MR = 5, MS = 80, MX0 = 300, MY0 = 150, R_IN = 2, R_CAT = 1, R_DOG = 3;
  function trace(o, r0) {
    const segs = []; let i = 0, j = r0, e = 'L';
    for (let n = 0; n < 200; n++) {
      if (i < 0 || j < 0 || i >= MC || j >= MR) break;
      const x = EXIT[o[j * MC + i]][e]; segs.push({ i, j, a: e, b: x });
      const [di, dj, ne] = MOVE[x]; i += di; j += dj; e = ne;
    }
    const last = segs[segs.length - 1];
    return { segs, out: last.b === 'R' && last.i === MC - 1 ? last.j : -1 };
  }
  let MAZE = null; // deterministic search: a maze that routes to "dog", fixable by flipping tiles to "cat"
  function maze() {
    if (MAZE) return MAZE;
    for (let s = 1; s < 20000 && !MAZE; s++) {
      const r = H.rng(s * 7 + 3), o = new Uint8Array(MC * MR);
      for (let k = 0; k < o.length; k++) o[k] = r() < 0.5 ? 0 : 1;
      const A = trace(o, R_IN);
      if (A.out !== R_DOG || A.segs.length < 11) continue;
      const cand = A.segs.map((g) => g.j * MC + g.i);
      for (let a = 0; a < cand.length && !MAZE; a++) for (let b = a + 1; b < cand.length && !MAZE; b++) {
        if (cand[a] === cand[b]) continue;
        const o2 = o.slice(); o2[cand[a]] ^= 1; o2[cand[b]] ^= 1;
        const B = trace(o2, R_IN);
        if (B.out === R_CAT && B.segs.length >= 11) MAZE = { o, o2, A, B, flips: [cand[a], cand[b]] };
      }
    }
    return MAZE;
  }
  function tileXY(k) { return [MX0 + (k % MC) * MS, MY0 + Math.floor(k / MC) * MS]; }
  function drawTile(c, x, y, s, o, fill, band, rot = 0) {
    c.save();
    if (rot) { c.translate(x + s / 2, y + s / 2); c.rotate(rot); c.translate(-x - s / 2, -y - s / 2); }
    if (fill) { c.fillStyle = fill; c.fillRect(x, y, s, s); } // null fill: the block underneath was inked in one pass
    c.strokeStyle = band; c.lineWidth = s / 3; c.lineCap = 'butt'; c.beginPath();
    if (o === 0) { c.arc(x, y, s / 2, 0, Math.PI / 2); c.moveTo(x + s / 2, y + s); c.arc(x + s, y + s, s / 2, Math.PI, Math.PI * 1.5); }
    else { c.moveTo(x + s, y + s / 2); c.arc(x + s, y, s / 2, Math.PI / 2, Math.PI); c.moveTo(x + s / 2, y + s); c.arc(x, y + s, s / 2, -Math.PI / 2, 0); }
    c.stroke(); c.restore();
  }
  // draw the first `prog` segments of a path as an ink band (fractional last one)
  function flowPath(c, segs, prog, color, s = MS, reverse = false) {
    c.save(); c.strokeStyle = color; c.lineWidth = s / 3 + 1; c.lineCap = 'butt';
    const n = Math.min(segs.length, Math.ceil(prog));
    for (let q = 0; q < n; q++) {
      const g = segs[reverse ? segs.length - 1 - q : q], f = Math.min(1, prog - q);
      const [cx, cy] = CORNER[g.a + g.b], x = MX0 + g.i * s, y = MY0 + g.j * s;
      const ea = reverse ? g.b : g.a, eb = reverse ? g.a : g.b;
      const a0 = Math.atan2(MID[ea][1] - cy, MID[ea][0] - cx), a1r = Math.atan2(MID[eb][1] - cy, MID[eb][0] - cx);
      let d = a1r - a0; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
      c.beginPath(); c.arc(x + cx * s, y + cy * s, s / 2, a0, a0 + d * f, d < 0); c.stroke();
    }
    c.restore();
  }
  function pointOn(segs, prog, s = MS) { // position along path (prog in segments)
    const q = Math.min(segs.length - 1, Math.max(0, Math.floor(prog))), f = H.clamp(prog - q), g = segs[q];
    const [cx, cy] = CORNER[g.a + g.b];
    const a0 = Math.atan2(MID[g.a][1] - cy, MID[g.a][0] - cx), a1 = Math.atan2(MID[g.b][1] - cy, MID[g.b][0] - cx);
    let d = a1 - a0; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
    const a = a0 + d * f; return [MX0 + g.i * s + cx * s + Math.cos(a) * s / 2, MY0 + g.j * s + cy * s + Math.sin(a) * s / 2];
  }
  // printed label: navy (or accent) block, cream Rubik Mono, slight accent misregistration
  function plabel(c, text, x, y, o = {}) {
    c.save(); c.font = `400 ${o.size || 18}px "Rubik Mono One"`; c.textBaseline = 'middle';
    const w = c.measureText(text).width + (o.size || 18) * 1.2, h = (o.size || 18) * 1.9;
    const ox = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    c.fillStyle = ACC; c.fillRect(ox + 3, y - h / 2 + 3, w, h);
    c.fillStyle = o.bg || NAVY; c.fillRect(ox, y - h / 2, w, h);
    c.fillStyle = o.fg || CREAM; c.fillText(text, ox + (o.size || 18) * 0.6, y + 1);
    c.restore(); return w;
  }
  function pet(c, kind, cx, cy, s, ink, bg) {
    c.save(); c.fillStyle = ink;
    c.beginPath(); c.arc(cx, cy + s * 0.08, s * 0.3, 0, Math.PI * 2); c.fill();
    if (kind === 'cat') { for (const k of [-1, 1]) { c.beginPath(); c.moveTo(cx + k * s * 0.08, cy - s * 0.12); c.lineTo(cx + k * s * 0.3, cy - s * 0.34); c.lineTo(cx + k * s * 0.3, cy - s * 0.02); c.fill(); } }
    else { for (const k of [-1, 1]) { c.beginPath(); c.ellipse(cx + k * s * 0.3, cy + s * 0.08, s * 0.1, s * 0.22, k * 0.3, 0, Math.PI * 2); c.fill(); } c.beginPath(); c.ellipse(cx, cy + s * 0.26, s * 0.15, s * 0.11, 0, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = bg; for (const k of [-1, 1]) { c.beginPath(); c.arc(cx + k * s * 0.11, cy + s * 0.04, s * 0.045, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  function exampleTile(c, kind, x, y, s, label) {
    c.save(); c.fillStyle = ACC; c.fillRect(x + 3, y + 3, s, s); c.fillStyle = CREAM; c.fillRect(x, y, s, s);
    c.strokeStyle = NAVY; c.lineWidth = 3; c.strokeRect(x, y, s, s); pet(c, kind, x + s / 2, y + s / 2, s, NAVY, CREAM); c.restore();
    if (label) plabel(c, label, x + s / 2, y + s + 24, { size: 26, align: 'center', bg: ACC });
  }
  function arrow(c, x0, y0, x1, y1, p, lw = 5, col = NAVY) {
    if (p <= 0) return; const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p, a = Math.atan2(y1 - y0, x1 - x0), hd = lw * 3.4;
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x - Math.cos(a) * hd * 0.7, y - Math.sin(a) * hd * 0.7); c.stroke();
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(a - 0.55) * hd, y - Math.sin(a - 0.55) * hd); c.lineTo(x - Math.cos(a + 0.55) * hd, y - Math.sin(a + 0.55) * hd); c.closePath(); c.fill(); c.restore();
  }
  function paper(c, W, H_) { c.fillStyle = CREAM; c.fillRect(0, 0, W, H_); }
  // screen-print finish for the explainer's flat scenes: the still's ink-film unevenness (low-frequency
  // density mottle + fine speckle), built once and multiplied over the scene, plus the still's soft vignette.
  let INKF = null;
  function inkFilm(W, H_) {
    if (INKF && INKF.width === W && INKF.height === H_) return INKF;
    const L = H.layer(W, H_), c = L.getContext('2d'), img = c.createImageData(W, H_), d = img.data;
    const nz = H.makeNoise(17), rr = H.rng(3);
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const v = 0.99 + nz.n2(x * 0.02, y * 0.02) * 0.03 + nz.n2(x * 0.005 + 3.1, y * 0.005) * 0.01 + (rr() - 0.5) * 0.03;
      const o = (y * W + x) * 4, g = Math.round(255 * Math.min(1, v));
      d[o] = g; d[o + 1] = g; d[o + 2] = g; d[o + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    return (INKF = L);
  }
  function finish(c, W, H_) {
    c.save(); c.globalCompositeOperation = 'multiply'; c.drawImage(inkFilm(W, H_), 0, 0); c.restore();
    H.vignette(c, W, H_, 0.12);
  }
  const header = (c) => plabel(c, 'HOW DOES AI LEARN?', 24, 44, { size: 28 });
  let STILL = null;
  function still(W, H_) {
    if (!STILL) { STILL = H.layer(W, H_); const st = window.STYLES.find((s) => s.id === 'truchet'); H.render(st, STILL, 4.9); }
    return STILL;
  }

  // ---------- scenes ----------
  function sHook(c, W, H_, t) {
    const z = 1.12 - 0.1 * H.ease.out(XS(t, 0, 2.4));   // slow pull-back off the tiling
    c.save(); c.translate(W / 2, H_ / 2); c.scale(z, z); c.translate(-W / 2, -H_ / 2); c.drawImage(still(W, H_), 0, 0); c.restore();
    c.fillStyle = 'rgba(242,233,212,0.35)'; c.fillRect(0, 0, W, H_);
    const k = H.ease.inOut(XS(t, 1.7, 2.3));
    if (k < 1) {
      const pop = H.ease.back(XS(t, 0.15, 0.55));
      c.save(); c.translate(W / 2 + (24 - W / 2) * k, 360 + (44 - 360) * k); c.scale(pop * (1 - (1 - 28 / 46) * k), pop * (1 - (1 - 28 / 46) * k));
      plabel(c, 'HOW DOES AI LEARN?', 0, 0, { size: 46, align: k > 0.5 ? 'left' : 'center' }); c.restore();
    } else header(c);
  }
  function sData(c, W, H_, t) {
    paper(c, W, H_);
    // the model: a block of tiles that keep flipping as examples pour in
    const r = H.rng(55), MXb = 830, MYb = 150, S = 64;
    c.fillStyle = NAVY; c.fillRect(MXb, MYb, 6 * S, 6 * S);
    const turning = [];
    for (let k = 0; k < 36; k++) {
      const o0 = r() < 0.5 ? 0 : 1, tf = 2.8 + r() * 3.2, x = MXb + (k % 6) * S, y = MYb + Math.floor(k / 6) * S;
      const rot = t > tf ? Math.min(1, (t - tf) / 0.15) * Math.PI / 2 : 0;
      if (rot > 0 && rot < Math.PI / 2) turning.push([x, y, o0, rot]);
      else drawTile(c, x, y, S, rot >= Math.PI / 2 ? o0 ^ 1 : o0, null, CREAM, 0);
    }
    // tiles mid quarter-turn: their empty socket prints as a deeper navy
    for (const [x, y, o0, rot] of turning) {
      c.fillStyle = 'rgb(10,15,32)'; c.fillRect(x, y, S, S);
      drawTile(c, x, y, S, o0, NAVY, CREAM, rot);
    }
    plabel(c, 'MODEL', MXb + 192, MYb - 40 + (1 - H.ease.back(XS(t, 2.7, 3.0))) * -60, { size: 30, align: 'center' });
    const rows = [190, 330, 470];
    rows.forEach((y, i) => arrow(c, 30, y + 45, MXb - 12, y + 45, H.ease.out(XS(t, 2.55 + i * 0.08, 2.95 + i * 0.08)), 4));
    c.save(); c.beginPath(); c.rect(0, 0, MXb - 14, H_); c.clip();
    const rr = H.rng(9), K = 34;
    for (let k = 0; k < K; k++) {
      const kind = rr() < 0.5 ? 'cat' : 'dog', ts = 2.6 + 3.0 * Math.pow(k / K, 0.8);
      if (t < ts) continue; const x = -100 + (t - ts) * (560 + k * 18); if (x > MXb) continue;
      exampleTile(c, kind, x, rows[k % 3], 90, kind);
    }
    c.restore();
    if (t >= 2.7) {
      const p = XS(t, 2.75, 5.0), n = p >= 1 ? 1e6 : Math.floor(Math.pow(10, 6 * H.ease.inOut(p))) - 1;
      const w = plabel(c, Math.round(n).toLocaleString('en-US'), 30, 650, { size: 64 });
      plabel(c, 'EXAMPLES', 30 + w + 16, 650, { size: 28, bg: ACC });
    }
    header(c);
    finish(c, W, H_);
  }
  function sLoop(c, W, H_, t) {
    paper(c, W, H_);
    const M = maze();
    const flipK = XS(t, 8.95, 9.25), flipped = flipK >= 1;
    c.fillStyle = NAVY; c.fillRect(MX0, MY0, MC * MS, MR * MS);
    for (let k = 0; k < MC * MR; k++) {
      const [x, y] = tileXY(k), isF = M.flips.includes(k);
      const o = flipped ? M.o2[k] : M.o[k];
      if (isF && flipK > 0 && !flipped) continue;
      drawTile(c, x, y, MS, o, null, CREAM, 0);
    }
    if (flipK > 0 && !flipped) for (const k of M.flips) { // the two weights quarter-turn out of their sockets
      const [x, y] = tileXY(k), rot = H.ease.inOut(flipK) * Math.PI / 2;
      c.fillStyle = 'rgb(10,15,32)'; c.fillRect(x, y, MS, MS);
      drawTile(c, x, y, MS, M.o[k], NAVY, CREAM, rot);
    }
    c.strokeStyle = NAVY; c.lineWidth = 4; c.strokeRect(MX0, MY0, MC * MS, MR * MS);
    // input
    exampleTile(c, 'cat', 70, MY0 + R_IN * MS - 30, 140, null);
    if (t >= 8.0) { // the label's answer, stacked in two printed blocks so it stays legible beside the maze
      plabel(c, 'ANSWER:', 140, MY0 + R_IN * MS + 150, { size: 28, align: 'center', bg: ACC });
      plabel(c, 'CAT', 140, MY0 + R_IN * MS + 208, { size: 28, align: 'center', bg: ACC });
    } else plabel(c, 'NEW', 140, MY0 + R_IN * MS + 150, { size: 28, align: 'center', bg: NAVY });
    arrow(c, 220, MY0 + R_IN * MS + 40, MX0 - 4, MY0 + R_IN * MS + 40, H.ease.out(XS(t, 6.4, 6.6)), 5);
    // outputs
    const outY = (rw) => MY0 + rw * MS + MS / 2;
    arrow(c, MX0 + MC * MS + 4, outY(R_CAT), MX0 + MC * MS + 60, outY(R_CAT), H.ease.out(XS(t, 6.45, 6.65)), 4);
    arrow(c, MX0 + MC * MS + 4, outY(R_DOG), MX0 + MC * MS + 60, outY(R_DOG), H.ease.out(XS(t, 6.5, 6.7)), 4);
    const right = t >= 9.85;
    plabel(c, 'CAT', MX0 + MC * MS + 70, outY(R_CAT), { size: 28, bg: right ? ACC : NAVY });
    plabel(c, 'DOG', MX0 + MC * MS + 70, outY(R_DOG), { size: 28, bg: t >= 7.45 && t < 8.95 ? ACC : NAVY });
    // forward pass #1: the band routes to DOG
    if (t < 8.95) {
      const pr = XS(t, 6.65, 7.45) * M.A.segs.length;
      flowPath(c, M.A.segs, pr, ACC);
      if (t >= 8.45) { // error signal runs back along the wrong path
        const q = (1 - XS(t, 8.45, 8.9)) * M.A.segs.length; const [px, py] = pointOn(M.A.segs, q);
        c.fillStyle = NAVY; c.beginPath(); c.arc(px, py, 15, 0, Math.PI * 2); c.fill(); c.strokeStyle = ACC; c.lineWidth = 4; c.stroke();
      }
    } else {
      const pr = XS(t, 9.35, 9.85) * M.B.segs.length;
      flowPath(c, M.B.segs, pr, ACC);
    }
    const drop = (t0) => (1 - H.ease.back(XS(t, t0, t0 + 0.25))) * -50;
    if (t >= 7.45 && t < 9.85) plabel(c, 'DOG?', MX0 + MC * MS + 70, outY(R_DOG) + 80 + drop(7.45), { size: 28 });
    if (t >= 7.95 && t < 9.85) { // check: stamp a ring + X on the wrong output
      const k = H.ease.out(XS(t, 7.95, 8.15));
      const cx = MX0 + MC * MS + 112, cy = outY(R_DOG);
      c.save(); c.strokeStyle = ACC; c.lineWidth = 7; c.beginPath(); c.arc(cx, cy, 50, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke();
      if (k >= 1) { c.lineWidth = 9; c.beginPath(); c.moveTo(cx - 30, cy - 30); c.lineTo(cx + 30, cy + 30); c.moveTo(cx + 30, cy - 30); c.lineTo(cx - 30, cy + 30); c.stroke(); }
      c.restore();
      const wy = cy - 80 + drop(8.0) * 0.5;
      c.save(); c.font = '400 28px "Rubik Mono One"'; const ww = c.measureText('WRONG').width + 28 * 1.2; c.restore();
      c.fillStyle = CREAM; c.fillRect(cx - 43, wy - 28 * 0.95 - 3, ww + 9, 28 * 1.9 + 9); // knockout so the block prints clean
      plabel(c, 'WRONG', cx - 40, wy, { size: 28, bg: ACC });
    }
    if (t >= 8.85 && t < 9.9) { // adjust: the flipped tiles get ringed
      M.flips.forEach((k) => { const [x, y] = tileXY(k); c.save(); c.strokeStyle = ACC; c.lineWidth = 6; c.setLineDash([10, 7]); c.lineDashOffset = -t * 40; c.strokeRect(x - 5, y - 5, MS + 10, MS + 10); c.restore(); });
      const [fx, fy] = tileXY(M.flips[0]);
      plabel(c, 'ADJUST: FLIP', fx + MS / 2 + 30, fy - 30 + drop(8.9), { size: 28, align: 'center', bg: ACC });
    }
    if (right) {
      plabel(c, 'CAT ✓', MX0 + MC * MS + 70, outY(R_CAT) - 60 + drop(9.85), { size: 28, bg: ACC });
    }
    // loop strip
    const words = ['GUESS', 'CHECK', 'ADJUST'];
    const act = t < 7.45 ? -1 : t < 7.95 ? 0 : t < 8.45 ? 1 : t < 9.35 ? 2 : t < 9.95 ? 0 : Math.floor((t - 9.95) / 0.13) % 3;
    let x = MX0;
    words.forEach((w, i) => { x += plabel(c, w, x, 630, { size: 28, bg: i === act ? ACC : NAVY }) + 12; if (i < 2) { arrow(c, x, 630, x + 40, 630, 1, 5); x += 56; } });
    plabel(c, '↻ ×1M', x + 8, 630, { size: 28, bg: CREAM, fg: NAVY });
    header(c);
    finish(c, W, H_);
  }
  function sProgress(c, W, H_, t) {
    paper(c, W, H_);
    plabel(c, 'ACCURACY', 60, 200, { size: 36 });
    const p = H.ease.inOut(XS(t, 10.9, 12.3)), v = Math.round(61 + 36 * p);
    const punch = t >= 12.3 ? 1 + 0.15 * Math.exp(-(t - 12.3) * 9) : 1;
    c.save(); c.translate(60, 380); c.scale(punch, punch); c.font = '400 120px "Rubik Mono One"'; c.textBaseline = 'middle';
    c.fillStyle = ACC; c.fillText(v + '%', 5, 5); c.fillStyle = NAVY; c.fillText(v + '%', 0, 0);
    const w = c.measureText('97%').width; c.restore();
    if (t >= 12.3) { const k = H.ease.out(XS(t, 12.3, 12.6)); c.save(); c.strokeStyle = ACC; c.lineWidth = 8; c.beginPath(); c.ellipse(60 + w / 2, 380, w / 2 + 40, 105, -0.05, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke(); c.restore(); }
    // bar chart: each bar a stack of tiles laid one by one
    const x0 = 640, y0 = 600, S = 40, n = 12, r = H.rng(4);
    for (let i = 0; i < n; i++) {
      const acc = 61 + 36 * (1 - Math.exp(-i / 3.2)) / (1 - Math.exp(-(n - 1) / 3.2));
      const tiles = Math.round((acc - 45) / 52 * 11);
      let laid = 0; while (laid < tiles && t >= 10.85 + i * 0.11 + laid * 0.025) laid++;
      if (laid) { c.fillStyle = i === n - 1 && t >= 12.3 ? ACC : NAVY; c.fillRect(x0 + i * (S + 7), y0 - laid * S, S, laid * S); }
      for (let k = 0; k < laid; k++) drawTile(c, x0 + i * (S + 7), y0 - (k + 1) * S, S, r() < 0.5 ? 0 : 1, null, CREAM);
    }
    c.fillStyle = NAVY; c.fillRect(x0 - 6, y0 + 4, n * (S + 7) + 6, 4);
    plabel(c, 'TRAINING ROUNDS →', x0, y0 + 46, { size: 28 });
    header(c);
    finish(c, W, H_);
  }
  function sTake(c, W, H_, t) {
    c.drawImage(still(W, H_), 0, 0);
    const k = H.ease.back(XS(t, 13.25, 13.55));
    c.save(); c.translate(W / 2, 360); c.scale(k, k);
    plabel(c, 'MORE EXAMPLES', 0, -46, { size: 44, align: 'center' });
    plabel(c, '→ BETTER GUESSES', 0, 46, { size: 44, align: 'center', bg: ACC });
    c.restore();
  }
  function lay(W, H_, fn, t) { const L = H.layer(W, H_); fn(L.getContext('2d'), W, H_, t); return L; }
  // tiles re-laid: each 80px cell quarter-turns from the old scene to the new one in a diagonal sweep
  function relay(c, W, H_, A, B, t0, t) {
    const S = 80;
    c.fillStyle = NAVY; c.fillRect(0, 0, W, H_);
    for (let j = 0; j < 9; j++) for (let i = 0; i < 16; i++) {
      const ts = t0 + 0.32 * ((i / 16) * 0.7 + (j / 9) * 0.3), k = H.clamp((t - ts) / 0.14);
      const src = k < 0.5 ? A : B, x = i * S, y = j * S;
      c.save(); c.translate(x + S / 2, y + S / 2); c.rotate(k * Math.PI / 2); const sq = Math.abs(Math.cos(k * Math.PI)) * 0.25 + 0.75; c.scale(k > 0 && k < 1 ? sq : 1, k > 0 && k < 1 ? sq : 1);
      c.rotate(-(k < 0.5 ? 0 : 1) * Math.PI / 2 * 0); c.drawImage(src, x, y, S, S, -S / 2, -S / 2, S, S); c.restore();
    }
  }
  function explainTR(ctx, W, H_, t) {
    const scenes = [[0, sHook], [2.45, sData], [6.0, sLoop], [10.5, sProgress], [13.0, sTake]];
    let idx = 0; for (let i = 0; i < scenes.length; i++) if (t >= scenes[i][0]) idx = i;
    const t0 = scenes[idx][0];
    if (idx > 0 && t < t0 + 0.5) relay(ctx, W, H_, lay(W, H_, scenes[idx - 1][1], t0 - 0.01), lay(W, H_, scenes[idx][1], t), t0, t);
    else scenes[idx][1](ctx, W, H_, t);
    H.grain(ctx, W, H_, 0.05, 5 + Math.floor(t * 12));
  }

  registerStyle({
    id: 'truchet',
    name: 'Multi-scale Truchet',
    category: 'Generative & Type',
    description: 'Bold two-ink multi-scale Truchet tiling of winged quarter-circle tiles whose paths flow continuously across three scales; a third ink fills only the closed regions that fall inside the letters "AI", so the word surfaces from the maze.',
    motion: 'Big tiles are laid in a diagonal sweep, then each scale subdivides in turn (paths re-routing as detail arrives); then the accent screen is pulled across and slides into register, revealing AI.',
    fonts: ['400 540px "Rubik Mono One"', '400 20px "Rubik Mono One"'],
    duration: 5,
    frameT: 4.9,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'The model is a Truchet maze whose tiles are its weights: an input band routes to the wrong output, the error runs back along the path and two tiles quarter-turn to re-route it; scenes change by re-laying the tiles in a diagonal sweep, labels are printed blocks with misregistered accent, and the accuracy chart is built from stacked tiles.',
    explainer(ctx, W, H_, t) { explainTR(ctx, W, H_, t); },
    // Sound: ceramic tiles. A tile turning into place is a short scrape and a hard clack; the scene re-lay is a domino
    // run of clacks sweeping left to right with the diagonal; the ink band travelling through the maze is a marble
    // rolling through a tile run (soft rumble, a click at each tile it crosses, taken from the real maze path); printed
    // labels land with a dull block thump; the payoffs are wooden marimba notes. Timings mirror explainTR / sHook..sTake.
    explainerSound(k) {
      const D = 14.5, E = H.ease, M = maze();
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      const back = (t0, d) => when(t0, t0 + d, E.back, 1);
      // ceramic tile clack: bright hard tick + hollow body
      const clack = (t, g, p, f = 640) => { k.noise(t, { dur: 0.018, filter: 'bandpass', f: 2100, q: 2.5, gain: 0.26 * g, a: 0.001, pan: p }); k.tone(t, { f: [[0, f], [0.04, f * 0.85]], dur: 0.06, gain: 0.1 * g, a: 0.001, pan: p }); };
      const turn = (t, dur, g, p) => k.noise(t, { dur, filter: 'bandpass', f: [[0, 900], [dur, 1500]], q: 1.4, gain: 0.07 * g, a: dur * 0.6, pan: p }); // tile scraping round
      // printed label block landing
      const block = (t, g, p) => { k.tone(t, { f: [[0, 170], [0.06, 110]], dur: 0.09, gain: 0.22 * g, a: 0.002, pan: p }); k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1100, q: 1, gain: 0.1 * g, a: 0.001, pan: p }); };
      const marimba = (t, n, g, p) => { const f = k.hz(n); k.tone(t, { f, dur: 0.7, gain: 0.16 * g, a: 0.002, verb: 0.2, pan: p }); if (f * 4 < 2500) k.tone(t, { f: f * 4, dur: 0.07, gain: 0.04 * g, a: 0.001, pan: p }); k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1500, q: 1, gain: 0.05 * g, pan: p }); };
      const zip = (t, dur, p) => k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 600], [dur, 1500]], q: 1.4, gain: 0.06, a: dur * 0.5, pan: p, minor: true });
      // re-lay: cell (i,j) starts at t0 + 0.32 (0.7 i/16 + 0.3 j/9) and lands 0.14 s later -> a domino run left to right
      const relay = (t0) => {
        k.noise(t0 + 0.05, { dur: 0.45, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.45, 1300]], q: 0.8, gain: 0.09, a: 0.15 });
        k.withMinor(() => { for (let i = 0; i < 16; i += 1) { const tl = t0 + 0.14 + 0.32 * (0.7 * i / 16 + 0.15); clack(tl, 0.55 + 0.25 * ((i * 7) % 3) / 2, pan(i * 80 + 40), 560 + ((i * 5) % 4) * 40); } });
        clack(t0 + 0.47, 0.9, 0.6, 520); // last corner settles
      };
      // the band rolling through the maze: rumble + a click per tile crossed, panned with the tile
      const roll = (segs, t0, t1, rev, g = 1) => {
        const d = t1 - t0, n = segs.length;
        k.noise(t0, { dur: d, color: 'brown', filter: 'lowpass', f: 420, gain: 0.14 * g, a: 0.06, hold: d - 0.12, pan: pan(MX0 + (rev ? MC * MS : 0)) });
        k.withMinor(() => { for (let q = 1; q < n; q++) { const s = segs[rev ? n - 1 - q : q], t = t0 + (q / n) * d; k.noise(t, { dur: 0.014, filter: 'bandpass', f: 1500 + (q % 3) * 150, q: 2, gain: 0.12 * g, a: 0.001, pan: pan(MX0 + s.i * MS + MS / 2) }); k.tone(t, { f: rev ? 420 - q * 8 : 300 + q * 8, dur: 0.035, gain: 0.05 * g, pan: pan(MX0 + s.i * MS + MS / 2) }); } });
      };
      const outX = MX0 + MC * MS + 100;

      k.bed('room', 0, D, { gain: 0.3 });

      // ---- hook: title block pops (back 0.15-0.55), slides into the corner (1.7-2.3)
      block(back(0.15, 0.4), 1.2, 0); clack(back(0.15, 0.4), 0.5, 0, 500);
      k.noise(1.7, { dur: 0.6, color: 'pink', filter: 'lowpass', f: [[0, 600], [0.6, 260]], gain: 0.028, a: 0.25, minor: true });

      // ---- data: re-lay, arrows, MODEL, tiles of the model flip as examples pour in (same rng(55) draws), counter
      relay(2.45);
      [0, 1, 2].forEach((i) => zip(2.55 + i * 0.08, 0.4, -0.4 + i * 0.05));
      block(back(2.7, 0.3), 0.8, pan(1020));
      { const r = H.rng(55), flips = [];
        for (let c = 0; c < 36; c++) { r(); const tf = 2.8 + r() * 3.2; if (tf + 0.15 < 6.0) flips.push([tf, c]); }
        flips.sort((a, b) => a[0] - b[0]); let last = -1;
        flips.forEach(([tf, c]) => { if (tf - last < 0.14) return; last = tf; k.withMinor(() => clack(tf + 0.15, 0.6, pan(830 + (c % 6) * 64 + 32), 600 + (c % 4) * 30)); }); }
      { let prev = 0, last = -1; for (let t = 2.76; t <= 4.98; t += 0.002) { const s = Math.floor(E.inOut(XS(t, 2.75, 5.0)) * 30); if (s !== prev && t - last >= 1 / 8) { k.play('tock', t, { f: 380, gain: 0.3, pan: -0.6, minor: true }); last = t; } prev = s; } }
      block(5.0, 1.4, -0.5); clack(5.0, 1, -0.5, 480); // 1,000,000 set down

      // ---- loop: re-lay, arrows, band rolls to DOG, wrong, error rolls back, two tiles turn, band rolls to CAT
      relay(6.0);
      zip(6.4, 0.2, -0.4); zip(6.45, 0.2, 0.55); zip(6.5, 0.2, 0.55);
      roll(M.A.segs, 6.65, 7.45, false);
      marimba(7.45, 'G3', 0.8, pan(outX)); block(back(7.45, 0.25), 0.7, pan(outX)); // lands on DOG, DOG? tag
      k.noise(7.95, { dur: 0.2, filter: 'bandpass', f: [[0, 700], [0.2, 1200]], q: 1.2, gain: 0.07, a: 0.12, pan: pan(outX), minor: true }); // ring drawn
      block(back(8.0, 0.25), 0.8, pan(outX));
      k.play('thud', 8.15, { f: 120, gain: 0.6, pan: pan(outX) }); marimba(8.15, 'F#3', 0.8, pan(outX)); marimba(8.3, 'C3', 0.8, pan(outX)); // X: wrong
      roll(M.A.segs, 8.45, 8.9, true, 0.9); // error runs back along the path
      block(back(8.9, 0.25), 0.7, pan(MX0 + (M.flips[0] % MC) * MS));
      M.flips.forEach((f, i) => { const p = pan(MX0 + (f % MC) * MS + MS / 2); turn(8.95 + i * 0.02, 0.3, 1, p); clack(9.25 + i * 0.018, 1.1, p, 560 - i * 50); }); // adjust: flip
      roll(M.B.segs, 9.35, 9.85, false);
      block(back(9.85, 0.25), 0.8, pan(outX));
      marimba(9.85, 'C4', 1, pan(outX)); marimba(9.93, 'G4', 0.9, pan(outX)); marimba(10.01, 'C5', 0.8, pan(outX)); // CAT ✓

      // ---- progress: re-lay, tile columns stack (tk = 10.85 + i*0.11), counter, 97%
      relay(10.5);
      k.withMinor(() => { for (let i = 0; i < 12; i++) { const acc = 61 + 36 * (1 - Math.exp(-i / 3.2)) / (1 - Math.exp(-11 / 3.2)), n = Math.round((acc - 45) / 52 * 11); clack(10.85 + i * 0.11, 0.55, pan(640 + i * 47), 420 + n * 18); if (n > 4) clack(10.85 + i * 0.11 + (n - 1) * 0.025, 0.3, pan(640 + i * 47), 520 + n * 18); } });
      { let prev = 0, last = -1; for (let t = 10.91; t <= 12.28; t += 0.002) { const s = Math.floor(E.inOut(XS(t, 10.9, 12.3)) * 36), near = ((t - 10.85) % 0.11) < 0.05; if (s !== prev && !near && t - last >= 1 / 7) { k.play('tock', t, { f: 380, gain: 0.28, pan: -0.6, minor: true }); last = t; } prev = s; } }
      k.play('impact', 12.3, { gain: 1.1, pan: -0.4 });
      clack(12.3, 1.3, -0.4, 450);
      ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => marimba(12.33 + i * 0.03, n, 1.1, (i - 1.5) * 0.25)); // the 97% hit
      k.noise(12.3, { dur: 0.3, filter: 'bandpass', f: [[0, 700], [0.3, 1200]], q: 1.2, gain: 0.06, a: 0.15, pan: -0.4, minor: true }); // ring drawn

      // ---- takeaway: re-lay into the tiling, labels pop, resolving marimba
      relay(13.0);
      const tk = back(13.25, 0.3);
      block(tk, 1.2, 0);
      ['G3', 'C4', 'E4', 'G4', 'C5'].forEach((n, i) => marimba(tk + 0.06 + i * 0.07, n, 0.65 - i * 0.04, (i - 2) * 0.2));
    },
    draw(ctx, W, H_, t) {
      const r = H.rng(808);
      // ---------- letter mask ----------
      const ml = H.layer(W, H_), mc = ml.getContext('2d');
      mc.fillStyle = '#000'; mc.fillRect(0, 0, W, H_);
      mc.fillStyle = '#fff'; mc.textAlign = 'center'; mc.textBaseline = 'alphabetic';
      mc.font = '400 540px "Rubik Mono One"';
      try { mc.letterSpacing = "10px"; } catch (e) {}
      mc.textBaseline = 'middle';
      mc.fillText("AI", W / 2 + 6, 372);
      const md = mc.getImageData(0, 0, W, H_).data;
      const inMask = (x, y) => { x = x | 0; y = y | 0; if (x < 0 || y < 0 || x >= W || y >= H_) return 0; return md[(y * W + x) * 4] > 127 ? 1 : 0; };

      // ---------- quadtree of tiles ----------
      const S0 = 160, tiles = [];
      const flipPhase = 1.8; // fixed: keeps the finished tiling identical to the approved still
      function classify(x, y, s) {
        let n = 0, k = 0;
        for (let j = 0; j <= 6; j++) for (let i = 0; i <= 6; i++) { n++; k += inMask(x + (i / 6) * s, y + (j / 6) * s); }
        return k === 0 ? 0 : k === n ? 2 : 1; // 0 out, 1 edge, 2 inside
      }
      function build(x, y, s, L) {
        const c = classify(x, y, s);
        const pRand = [0.55, 0.32, 0.12][L] || 0;
        let split = false;
        if (L < 3 && c === 1) split = true;            // letter edges: refine to the smallest scale
        else if (L < 3 && c === 2) split = true;        // letter interiors: finest scale too
        else if (L < 2 && r() < pRand) split = true;
        else if (L === 2 && c === 0 && r() < 0.08) split = true;
        if (split) {
          const h = s / 2;
          build(x, y, h, L + 1); build(x + h, y, h, L + 1); build(x, y + h, h, L + 1); build(x + h, y + h, h, L + 1);
        } else {
          // orientation: seeded, with a slow wave of flips for animation
          const base = r() < 0.5 ? 0 : 1;
          const flip = Math.sin(x * 0.004 + y * 0.003 - flipPhase) > 0.985 ? 1 : 0;
          tiles.push({ x, y, s, L, o: base ^ flip });
        }
      }
      const oy = -(S0 * 5 - H_) / 2;
      for (let j = 0; j < 5; j++) for (let i = 0; i < 8; i++) build(i * S0, oy + j * S0, S0, 0);
      // balance the quadtree: neighbouring tiles may differ by at most one level, otherwise the
      // winged edge patterns can't meet (Carlson's construction relies on 1-level steps)
      const F = 20, GX = W / F, GY = Math.ceil((S0 * 5) / F);
      for (let pass = 0; pass < 6; pass++) {
        const grid = new Int8Array(GX * GY);
        for (const T of tiles) {
          const gx0 = Math.round(T.x / F), gy0 = Math.round((T.y - oy) / F), n = Math.round(T.s / F);
          for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) grid[(gy0 + j) * GX + gx0 + i] = T.L;
        }
        const at = (i, j) => (i < 0 || j < 0 || i >= GX || j >= GY ? -1 : grid[j * GX + i]);
        let changed = false;
        const next = [];
        for (const T of tiles) {
          const gx0 = Math.round(T.x / F), gy0 = Math.round((T.y - oy) / F), n = Math.round(T.s / F);
          let mx = -1;
          for (let k = 0; k < n; k++) { mx = Math.max(mx, at(gx0 - 1, gy0 + k), at(gx0 + n, gy0 + k), at(gx0 + k, gy0 - 1), at(gx0 + k, gy0 + n)); }
          if (mx > T.L + 1) {
            changed = true;
            const h = T.s / 2;
            for (const [dx, dy] of [[0, 0], [h, 0], [0, h], [h, h]]) next.push({ x: T.x + dx, y: T.y + dy, s: h, L: T.L + 1, o: r() < 0.5 ? 0 : 1 });
          } else next.push(T);
        }
        tiles.length = 0; tiles.push(...next);
        if (!changed) break;
      }
      tiles.sort((a, b) => a.L - b.L);

      // ---------- build: which scale is visible where (tiles laid on twos) ----------
      const tq = Math.floor(t * 15) / 15;
      const st0 = [0.1, 0.95, 1.55, 2.1], stD = [0.8, 0.55, 0.5, 0.5];
      const startAt = (l, ax, ay, s) => st0[l] + stD[l] * (((ax + s / 2) / W) * 0.65 + ((ay + s / 2 - oy) / 800) * 0.35);
      const hashO = (x, y, s) => (H.rng(((x + 1000) * 7919 + (y + 1000) * 104729 + s * 31) >>> 0)() < 0.5 ? 0 : 1);
      const shown = new Map();
      for (const T of tiles) {
        let pick = null;
        for (let l = T.L; l >= 0; l--) {
          const sl = S0 / (1 << l), ax = Math.floor(T.x / sl) * sl, ay = oy + Math.floor((T.y - oy) / sl) * sl;
          const st = startAt(l, ax, ay, sl);
          if (tq >= st) { pick = l === T.L ? { ...T, age: tq - st } : { x: ax, y: ay, s: sl, L: l, o: hashO(ax, ay, sl), age: tq - st }; break; }
        }
        if (pick) shown.set(pick.L + ':' + pick.x + ':' + pick.y, pick);
      }
      // hold: a few large tiles outside the word make a quarter-turn (orientation flip)
      const flips = [[0, 2], [7, 1], [6, 3], [1, 0]];
      const disp = [...shown.values()].sort((a, b) => a.L - b.L);
      for (const T of disp) {
        if (T.L !== 0) continue;
        const fi = flips.findIndex(([i, j]) => T.x === i * S0 && T.y === oy + j * S0);
        if (fi < 0) continue;
        const k = H.clamp((t - (3.55 + fi * 0.09)) / 0.2);
        T.rot = H.ease.inOut(k) * Math.PI / 2;
      }

      // ---------- draw the two-ink tiling (dark/light only) ----------
      const lay = H.layer(W, H_), lc = lay.getContext('2d');
      lc.fillStyle = `rgb(${C_LIGHT[0]},${C_LIGHT[1]},${C_LIGHT[2]})`; lc.fillRect(0, 0, W, H_); // bare paper
      const ink = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
      for (const T of disp) {
        const fill = T.L % 2 ? C_LIGHT : C_DARK, path = T.L % 2 ? C_DARK : C_LIGHT;
        const { x, y, s } = T;
        lc.save();
        const pop = T.age < 0.07 ? 0.86 : 1;   // freshly laid tile settles in (2 frames)
        if (pop !== 1 || T.rot) { lc.translate(x + s / 2, y + s / 2); if (T.rot) lc.rotate(T.rot); lc.scale(pop, pop); lc.translate(-x - s / 2, -y - s / 2); }
        lc.fillStyle = ink(fill); lc.fillRect(x, y, s, s);
        // wings
        lc.beginPath();
        [[x, y], [x + s, y], [x, y + s], [x + s, y + s]].forEach(([px, py]) => { lc.moveTo(px + s / 3, py); lc.arc(px, py, s / 3, 0, TAU); });
        lc.fill();
        // bands
        lc.strokeStyle = ink(path); lc.lineWidth = s / 3; lc.lineCap = 'butt';
        lc.beginPath();
        if (T.o === 0) { lc.arc(x, y, s / 2, 0, Math.PI / 2); lc.moveTo(x + s - s / 2, y + s); lc.arc(x + s, y + s, s / 2, Math.PI, Math.PI * 1.5); }
        else { lc.moveTo(x + s, y + s / 2); lc.arc(x + s, y, s / 2, Math.PI / 2, Math.PI); lc.moveTo(x + s / 2, y + s); lc.arc(x, y + s, s / 2, -Math.PI / 2, 0); }
        lc.stroke();
        lc.restore();
      }
      const src = lc.getImageData(0, 0, W, H_).data;

      // ---------- flood-label light regions; flag those inside the letters ----------
      const N = W * H_;
      const gv = new Float32Array(N), lab = new Int32Array(N).fill(-1);
      const dl = C_LIGHT[0] - C_DARK[0];
      for (let i = 0; i < N; i++) gv[i] = H.clamp((src[i * 4] - C_DARK[0]) / dl);
      const stack = new Int32Array(N);
      const cnt = [], inC = [];
      let nl = 0;
      for (let i = 0; i < N; i++) {
        if (lab[i] !== -1 || gv[i] < 0.5) continue;
        let sp = 0; stack[sp++] = i; lab[i] = nl; let c = 0, k = 0;
        while (sp) {
          const p = stack[--sp]; c++; k += md[p * 4] > 127 ? 1 : 0;
          const x = p % W;
          if (x > 0 && lab[p - 1] === -1 && gv[p - 1] >= 0.5) { lab[p - 1] = nl; stack[sp++] = p - 1; }
          if (x < W - 1 && lab[p + 1] === -1 && gv[p + 1] >= 0.5) { lab[p + 1] = nl; stack[sp++] = p + 1; }
          if (p >= W && lab[p - W] === -1 && gv[p - W] >= 0.5) { lab[p - W] = nl; stack[sp++] = p - W; }
          if (p < N - W && lab[p + W] === -1 && gv[p + W] >= 0.5) { lab[p + W] = nl; stack[sp++] = p + W; }
        }
        cnt.push(c); inC.push(k); nl++;
      }
      const flag = new Uint8Array(nl);
      // letters fill in over time (animation); at frameT all flagged
      const reveal = 1;
      for (let i = 0; i < nl; i++) flag[i] = inC[i] / cnt[i] > 0.5 && cnt[i] < 60000 && ((i * 2654435761) % 1000) / 1000 < reveal * 1.01 ? 1 : 0;
      // per-tile letter flag (finest tile wins): regions mostly inside the word take the
      // accent whole; long paths that cross the letter edge are cut at the tile boundary
      const fl = H.layer(W, H_), fc = fl.getContext('2d');
      fc.fillStyle = '#000'; fc.fillRect(0, 0, W, H_);
      for (const T of tiles) { fc.fillStyle = inMask(T.x + T.s / 2, T.y + T.s / 2) ? '#fff' : '#000'; fc.fillRect(T.x, T.y, T.s, T.s); }
      const fd = fc.getImageData(0, 0, W, H_).data;
      const accentAt = (p) => {
        const L0 = lab[p];
        if (L0 >= 0 && flag[L0]) return 1;
        if (L0 >= 0 && inC[L0] / cnt[L0] > 0.9) return 0;
        return fd[p * 4] > 127 ? 1 : 0;
      };
      const accentAtOld = (p) => {
        let L = lab[p];
        if (L >= 0) return flag[L];
        const x = p % W;
        if (x > 0 && lab[p - 1] >= 0) return flag[lab[p - 1]];
        if (x < W - 1 && lab[p + 1] >= 0) return flag[lab[p + 1]];
        if (p >= W && lab[p - W] >= 0) return flag[lab[p - W]];
        if (p < N - W && lab[p + W] >= 0) return flag[lab[p + W]];
        return 0;
      };

      // ---------- composite as a 3-colour screen print ----------
      const out = ctx.createImageData(W, H_), d = out.data;
      const nz = H.makeNoise(17), rr = H.rng(3);
      // accent screen: pulled left->right by the squeegee, then slides into (mis)register
      const pull = H.ease.inOut(H.clamp((t - 2.75) / 0.6));
      const xw = -40 + 1360 * pull;
      const reg = H.ease.out(H.clamp((t - 3.0) / 0.9));
      const MX = Math.round(2 + 16 * (1 - reg)), MY = Math.round(1 + 9 * (1 - reg));
      for (let y = 0; y < H_; y++) {
        for (let x = 0; x < W; x++) {
          const p = y * W + x;
          const g = gv[p];
          // accent screen is offset: look up the flag at the shifted position
          const sx = Math.min(W - 1, Math.max(0, x - MX)), sy = Math.min(H_ - 1, Math.max(0, y - MY));
          const accHere = accentAt(sy * W + sx);
          const gs = gv[sy * W + sx];
          let Lc = C_LIGHT;
          // accent ink lays where the shifted light region is flagged
          let ar = 0;
          const pulled = accHere && x < xw + (y - 360) * 0.25;
          if (pulled) ar = H.clamp(gs * 1.2);
          const ink1 = 1 + nz.n2(x * 0.02, y * 0.02) * 0.03 + (rr() - 0.5) * 0.05; // ink film unevenness
          let R = C_DARK[0] + (C_LIGHT[0] - C_DARK[0]) * g, G = C_DARK[1] + (C_LIGHT[1] - C_DARK[1]) * g, B = C_DARK[2] + (C_LIGHT[2] - C_DARK[2]) * g;
          if (ar > 0) {
            // accent printed under the dark ink: multiply-ish over light, hidden under dark
            const a = ar * (0.15 + 0.85 * g);
            R = R + (C_ACC[0] * (R / 255) * 1.04 - R) * a; G = G + (C_ACC[1] * (G / 255) * 1.04 - G) * a; B = B + (C_ACC[2] * (B / 255) * 1.04 - B) * a;
          }
          if (pulled) { // navy inside the letters warms toward the accent (accent printed under a translucent navy)
            const lift = (1 - g) * 0.3;
            R += (C_ACC[0] * 0.55 - R) * lift; G += (C_ACC[1] * 0.55 - G) * lift; B += (C_ACC[2] * 0.55 - B) * lift;
          }
          const o = p * 4;
          d[o] = R * ink1; d[o + 1] = G * ink1; d[o + 2] = B * ink1; d[o + 3] = 255;
        }
      }
      ctx.putImageData(out, 0, 0);
      H.grain(ctx, W, H_, 0.05, 5 + Math.floor(t * 12));
      H.vignette(ctx, W, H_, 0.12);
    },
  });
}
