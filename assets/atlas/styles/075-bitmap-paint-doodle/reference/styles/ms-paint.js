{
  // Everything renders into a 640x360 buffer, upscaled 2x with nearest neighbour.
  const BW = 640, BH = 360;
  const UI = { face: '#c0c0c0', hi: '#ffffff', lt: '#dfdfdf', sh: '#808080', dk: '#000000' };
  // Classic 28-colour default palette
  const PALETTE = [
    ['#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000'],
    ['#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040'],
  ];

  const rect = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  function bevel(c, x, y, w, h, kind) {
    let o1, o2, i1, i2;
    if (kind === 'button') [o1, o2, i1, i2] = [UI.hi, UI.dk, UI.lt, UI.sh];
    else if (kind === 'window') [o1, o2, i1, i2] = [UI.lt, UI.dk, UI.hi, UI.sh];
    else if (kind === 'pressed') [o1, o2, i1, i2] = [UI.dk, UI.hi, UI.sh, UI.lt];
    else if (kind === 'field') [o1, o2, i1, i2] = [UI.sh, UI.hi, UI.dk, UI.lt];
    else { rect(c, x, y, w, 1, UI.sh); rect(c, x, y, 1, h, UI.sh); rect(c, x, y + h - 1, w, 1, UI.hi); rect(c, x + w - 1, y, 1, h, UI.hi); return; }
    rect(c, x, y, w - 1, 1, o1); rect(c, x, y, 1, h - 1, o1); rect(c, x, y + h - 1, w, 1, o2); rect(c, x + w - 1, y, 1, h, o2);
    rect(c, x + 1, y + 1, w - 3, 1, i1); rect(c, x + 1, y + 1, 1, h - 3, i1); rect(c, x + 1, y + h - 2, w - 2, 1, i2); rect(c, x + w - 2, y + 1, 1, h - 2, i2);
  }
  let scratch = null;
  function rasterText(s, font, thr = 110) { // returns {w,h,mask(Uint8Array), base}
    if (!scratch) scratch = H.layer(600, 80);
    const sx = scratch.getContext('2d', { willReadFrequently: true });
    sx.clearRect(0, 0, scratch.width, scratch.height);
    sx.font = font; sx.fillStyle = '#000'; sx.textBaseline = 'alphabetic';
    const m = sx.measureText(s), w = Math.ceil(m.width) + 4, h = 60, base = 44;
    sx.fillText(s, 2, base);
    const d = sx.getImageData(0, 0, w, h).data, mask = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) mask[i] = d[i * 4 + 3] > thr ? 1 : 0;
    return { w, h, mask, base };
  }
  function ptext(c, s, x, y, font, col, align = 'left') {
    const r = rasterText(s, font, 105);
    let dx = x - 2; if (align === 'center') dx = Math.round(x - (r.w - 4) / 2) - 2; if (align === 'right') dx = x - (r.w - 4) - 2;
    c.fillStyle = col;
    for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) if (r.mask[j * r.w + i]) c.fillRect(dx + i, y - r.base + j, 1, 1);
    return r.w - 4;
  }
  const SYS = '400 9px "Inter"';

  // ---------------- pixel canvas (the "document") ----------------
  function PixelDoc(w, h) {
    const d = new Uint32Array(w * h);
    const C = (hex) => { const [r, g, b] = H.hex(hex); return (0xff000000 | (b << 16) | (g << 8) | r) >>> 0; };
    d.fill(C('#ffffff'));
    const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
    const plot = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (inb(x, y)) d[y * w + x] = c; };
    const stamp = (x, y, c, size) => {
      if (size <= 1) return plot(x, y, c);
      const r = size / 2;
      for (let j = -Math.ceil(r); j <= Math.ceil(r); j++) for (let i = -Math.ceil(r); i <= Math.ceil(r); i++) if (i * i + j * j <= r * r) plot(x + i, y + j, c);
    };
    const line = (x0, y0, x1, y1, c, size = 1) => {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) { stamp(x0, y0, c, size); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
    };
    const poly = (pts, c, size = 1, closed = false) => { for (let i = 0; i < pts.length - 1; i++) line(...pts[i], ...pts[i + 1], c, size); if (closed) line(...pts[pts.length - 1], ...pts[0], c, size); };
    // mouse-drawn: densify + jitter, and occasionally overshoot
    const hand = (pts, c, size, rng, jit = 1.2, closed = false, p = 1) => {
      const out = [];
      const P = closed ? [...pts, pts[0]] : pts;
      for (let i = 0; i < P.length - 1; i++) {
        const [ax, ay] = P[i], [bx, by] = P[i + 1], n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / 6));
        for (let k = 0; k < n; k++) { const u = k / n; out.push([ax + (bx - ax) * u + rng.gauss() * jit, ay + (by - ay) * u + rng.gauss() * jit]); }
      }
      out.push(P[P.length - 1]);
      const n = Math.max(1, Math.ceil(p * (out.length - 1)));
      poly(out.slice(0, n + 1), c, size);
    };
    const rectO = (x, y, ww, hh, c, size = 1) => { line(x, y, x + ww, y, c, size); line(x + ww, y, x + ww, y + hh, c, size); line(x + ww, y + hh, x, y + hh, c, size); line(x, y + hh, x, y, c, size); };
    const rectF = (x, y, ww, hh, c) => { for (let j = 0; j <= hh; j++) for (let i = 0; i <= ww; i++) plot(x + i, y + j, c); };
    const ellipse = (cx, cy, rx, ry, c, size = 1, gapFrom = null, gapTo = null, p = 1) => {
      if (p < 1) { const nrx = Math.max(1, rx * p), nry = Math.max(1, ry * p); cx = cx - rx + nrx; cy = cy - ry + nry; rx = nrx; ry = nry; } // rubber-band drag from the corner
      const n = Math.ceil((rx + ry) * 2.2); let prev = null;
      for (let k = 0; k <= n; k++) {
        const a = (k / n) * Math.PI * 2;
        const p = [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
        const inGap = gapFrom != null && a > gapFrom && a < gapTo;
        if (prev && !inGap) line(...prev, ...p, c, size);
        prev = p;
      }
    };
    const flood = (x, y, c) => {
      x = Math.round(x); y = Math.round(y); if (!inb(x, y)) return;
      const target = d[y * w + x]; if (target === c) return;
      const st = [[x, y]];
      while (st.length) {
        const [px, py] = st.pop(); let lx = px;
        while (lx >= 0 && d[py * w + lx] === target) lx--;
        lx++; let up = false, dn = false;
        for (let xx = lx; xx < w && d[py * w + xx] === target; xx++) {
          d[py * w + xx] = c;
          if (py > 0) { const m = d[(py - 1) * w + xx] === target; if (m && !up) { st.push([xx, py - 1]); up = true; } else if (!m) up = false; }
          if (py < h - 1) { const m = d[(py + 1) * w + xx] === target; if (m && !dn) { st.push([xx, py + 1]); dn = true; } else if (!m) dn = false; }
        }
      }
    };
    const spray = (cx, cy, r, n, c, rng) => { for (let i = 0; i < Math.round(n); i++) { const a = rng() * Math.PI * 2, rr = Math.sqrt(rng()) * r; plot(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, c); } };
    const text = (s, x, y, font, c, bg = null, nChars = null) => { // y = baseline
      const r = rasterText(s, font, 120);
      if (nChars != null && nChars < s.length) {
        const vis = nChars > 0 ? rasterText(s.slice(0, nChars), font, 120) : null;
        if (bg != null) { let y0 = r.h, y1 = 0; for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) if (r.mask[j * r.w + i]) { y0 = Math.min(y0, j); y1 = Math.max(y1, j); } rectF(x - 4, y - r.base + y0 - 3, r.w + 4, y1 - y0 + 7, bg); }
        if (vis) for (let j = 0; j < vis.h; j++) for (let i = 0; i < vis.w; i++) if (vis.mask[j * vis.w + i]) plot(x + i - 2, y - vis.base + j, c);
        return { w: r.w, vw: vis ? vis.w - 4 : 0 };
      }
      if (bg != null) {
        let y0 = r.h, y1 = 0;
        for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) if (r.mask[j * r.w + i]) { y0 = Math.min(y0, j); y1 = Math.max(y1, j); }
        rectF(x - 4, y - r.base + y0 - 3, r.w + 4, y1 - y0 + 7, bg);
      }
      for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) if (r.mask[j * r.w + i]) plot(x + i - 2, y - r.base + j, c);
      return { w: r.w, vw: r.w - 4 };
    };
    const toImageData = () => new ImageData(new Uint8ClampedArray(d.buffer), w, h);
    return { w, h, C, plot, line, poly, hand, rectO, rectF, ellipse, flood, spray, text, toImageData, stamp };
  }

  // The painting is a timeline of tool operations, replayed up to time t (partial strokes = mouse still dragging).
  function paintScene(t) {
    const W = 540, Hh = 246;
    const P = PixelDoc(W, Hh), C = P.C;
    const HX = { K: '#000000', NAVY: '#000080', Y: '#ffff00', LIME: '#00ff00', GRN: '#008000', GRY: '#c0c0c0', DG: '#808080', RED: '#ff0000', ORG: '#ff8040', WHT: '#ffffff', CY: '#00ffff', OL: '#808000' };
    const K = C(HX.K), NAVY = C(HX.NAVY), Y = C(HX.Y), LIME = C(HX.LIME), GRN = C(HX.GRN), GRY = C(HX.GRY), DG = C(HX.DG), RED = C(HX.RED), ORG = C(HX.ORG), WHT = C(HX.WHT), CY = C(HX.CY), OL = C(HX.OL);
    const ry = 19, rx = 262, fl = -3;
    const ops = [];
    // tool ids: 2 eraser, 3 fill, 6 pencil, 7 brush, 8 airbrush, 9 text, 10 line, 12 rect, 14 ellipse
    const op = (t0, dur, tool, col, fn, pen) => ops.push({ t0, dur, tool, col, fn, pen, seed: ops.length + 11 });
    const handOp = (t0, dur, tool, col, pts, size, jit) => op(t0, dur, tool, col, (p, r) => P.hand(pts, C(col), size, r, jit, false, p), (p) => { const k = Math.min(pts.length - 1, Math.floor(p * (pts.length - 1) + 0.5)); return pts[k]; });
    const rectOp = (t0, dur, x, y, w, h, size) => op(t0, dur, 12, HX.K, (p) => P.rectO(x, y, Math.round(w * p), Math.round(h * p), K, size), (p) => [x + w * p, y + h * p]);
    const fillOp = (t0, x, y, col) => op(t0, 0.001, 3, col, () => P.flood(x, y, C(col)), () => [x, y]);

    const ground = [[0, 206], [60, 198], [120, 204], [190, 214], [260, 207], [330, 200], [400, 196], [470, 203], [539, 199]];
    handOp(0.1, 0.45, 7, HX.K, ground, 2, 1.4);
    op(0.58, 0.001, 2, HX.WHT, () => P.rectF(36, 117, 71, 88, WHT), () => [70, 160]); // tidy-up erase where the building goes
    rectOp(0.6, 0.18, 34, 118, 74, 88, 1);
    rectOp(0.8, 0.15, 37, 115, 74, 91, 1); // wonky second rectangle
    op(0.98, 0.1, 10, HX.K, (p) => { P.line(70, 115, 70, Math.round(115 - 23 * p), K, 1); if (p >= 1) P.line(66, 96, 74, 96, K, 1); }, (p) => [70, 115 - 23 * p]);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) rectOp(1.1 + (j * 3 + i) * 0.03, 0.025, 46 + i * 21 + (j % 2), 126 + j * 17, 12, 9, 1);
    rectOp(1.48, 0.07, 64, 188, 14, 18, 1);
    rectOp(1.6, 0.18, rx - 20, ry + 64, 40, 74, 2);
    handOp(1.8, 0.2, 7, HX.K, [[rx - 20, ry + 64], [rx - 2, ry + 26], [rx + 20, ry + 64]], 2, 0.8);
    handOp(2.02, 0.12, 7, HX.K, [[rx - 20, ry + 112], [rx - 38, ry + 140], [rx - 20, ry + 136]], 2, 0.6);
    handOp(2.16, 0.12, 7, HX.K, [[rx + 20, ry + 112], [rx + 38, ry + 141], [rx + 20, ry + 136]], 2, 0.6);
    op(2.3, 0.1, 14, HX.K, (p) => P.ellipse(rx, ry + 88, 10, 10, K, 2, null, null, p), (p) => [rx - 10 + 20 * p, ry + 78 + 20 * p]);
    handOp(2.43, 0.22, 7, HX.RED, [[rx - 16, ry + 140], [rx - 22, ry + 158], [rx - 10, ry + 154], [rx - 6, ry + 176 + fl], [rx + 2, ry + 158], [rx + 10, ry + 172 - fl], [rx + 12, ry + 154], [rx + 22, ry + 160], [rx + 16, ry + 140]], 2, 0.7);
    op(2.7, 0.18, 14, HX.K, (p) => P.ellipse(470, 52, 34, 33, K, 2, null, null, p), (p) => [436 + 68 * p, 19 + 66 * p]);
    op(2.92, 0.23, 14, HX.K, (p) => P.ellipse(410, 120, 92, 30, K, 2, 5.05, 5.17, p), (p) => [318 + 184 * p, 90 + 60 * p]);
    handOp(3.17, 0.1, 7, HX.K, [[338, 138], [rx + 26, ry + 92], [350, 145]], 2, 0.5);
    // bucket fills: instant pops (the sky leaks into the bubble through its gap)
    fillOp(3.4, 5, 5, HX.NAVY);
    fillOp(3.6, 10, 240, HX.LIME);
    fillOp(3.68, 42, 200, HX.GRY);
    fillOp(3.74, rx, ry + 120, HX.GRY);
    fillOp(3.79, rx - 2, ry + 50, HX.RED);
    fillOp(3.83, rx - 26, ry + 132, HX.RED);
    fillOp(3.86, rx + 26, ry + 133, HX.RED);
    fillOp(3.9, rx, ry + 88, HX.CY);
    fillOp(3.95, 470, 52, HX.Y);
    fillOp(4.0, rx, ry + 150, HX.ORG);
    let wk = 0;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) if ((i * 7 + j * 3) % 4 !== 0) fillOp(4.05 + (wk++) * 0.035, 52 + i * 21 + (j % 2), 130 + j * 17, HX.Y);
    // pencil details
    op(4.4, 0.15, 6, HX.K, (p, r) => {
      P.plot(460, 44, K); P.plot(461, 44, K); P.plot(460, 45, K); P.plot(461, 45, K);
      if (p > 0.3) { P.plot(478, 44, K); P.plot(479, 44, K); P.plot(478, 45, K); P.plot(479, 45, K); }
      if (p > 0.5) P.hand([[456, 60], [464, 66], [474, 66], [482, 59]], K, 1, r, 0.3, false, (p - 0.5) * 2);
    }, (p) => [456 + 26 * p, 44 + 20 * p]);
    op(4.56, 0.06, 14, HX.OL, (p) => { P.ellipse(446, 34, 4, 3, OL, 1); P.ellipse(488, 72, 5, 3, OL, 1); }, () => [488, 72]);
    op(4.62, 0.25, 6, HX.GRN, (p) => { const r = H.rng(99); const n = Math.round(26 * p); for (let i = 0; i < 26; i++) { const gx = r.range(4, 530), gy = r.range(214, 240), a = r.range(-2, 2), b = r.range(4, 8), c2 = r.range(3, 7); if (i < n) { P.line(gx, gy, gx + a, gy - b, GRN, 1); P.line(gx + 3, gy, gx + 5, gy - c2, GRN, 1); } } }, (p) => [4 + 526 * p, 226]);
    op(4.9, 0.25, 8, HX.Y, (p) => { const sr = H.rng(17); const n = 9 * p; for (let i = 0; i < 9; i++) { const x = sr.range(10, 330), y = sr.range(8, 90); P.spray(x, y, 5, i < Math.floor(n) ? 14 : i < n ? 14 * (n - i) : 0, i % 2 ? Y : WHT, sr); } }, (p) => [10 + 320 * p, 50]);
    op(5.15, 0.1, 6, HX.Y, (p) => { const sr = H.rng(18); for (let i = 0; i < 7; i++) { const sx = sr.range(120, 520), sy = sr.range(8, 80); if (i > p * 7) break; if (Math.hypot(sx - 470, sy - 52) < 44) continue; P.line(sx - 3, sy, sx + 3, sy, Y, 1); P.line(sx, sy - 3, sx, sy + 3, Y, 1); } }, (p) => [120 + 400 * p, 40]);
    const sm = [[0, 186, 16, 110], [-18, 196, 18, 120], [20, 194, 16, 110], [-40, 204, 20, 110], [42, 206, 18, 100], [-66, 210, 18, 90], [70, 212, 16, 80]];
    op(5.3, 0.3, 8, HX.DG, (p) => { const smk = H.rng(41); const n = sm.length * p; sm.forEach(([ox, oy, rad, cnt], i) => { const f = H.clamp(n - i); P.spray(rx + ox, oy, rad, cnt * 2 * f, DG, smk); P.spray(rx + ox, oy - 3, rad * 0.7, cnt * f, WHT, smk); }); }, (p) => { const k = Math.min(sm.length - 1, Math.floor(p * sm.length)); return [rx + sm[k][0], sm[k][1]]; });
    handOp(5.62, 0.035, 6, HX.WHT, [[rx - 52, ry + 70], [rx - 50, ry + 120]], 1, 0.3);
    handOp(5.66, 0.035, 6, HX.WHT, [[rx - 62, ry + 86], [rx - 60, ry + 128]], 1, 0.3);
    handOp(5.7, 0.035, 6, HX.WHT, [[rx + 52, ry + 60], [rx + 50, ry + 104]], 1, 0.3);
    op(5.75, 0.17, 2, HX.WHT, (p) => { for (let k = 0; k < Math.round(13 * p); k++) { const ex = 112 + k * 6, ey = 16 + Math.round(Math.sin(k * 0.6) * 5 + k * 1.6); P.rectF(ex, ey, 8, 8, WHT); } }, (p) => { const k = Math.round(12 * p); return [116 + k * 6, 20 + Math.sin(k * 0.6) * 5 + k * 1.6]; });
    const typeOp = (t0, dur, str, x, y, font, col, bg, box) => op(t0, dur, 9, col, (p) => { const res = P.text(str, x, y, font, C(col), bg, Math.floor(p * str.length + 1e-6)); box.vw = res.vw; }, () => [box.x + box.vw + 4, box.y + box.h / 2], box);
    const box1 = { x: 42, y: 95, w: 58, h: 22, vw: 0 }, box2 = { x: 344, y: 109, w: 146, h: 26, vw: 0 };
    typeOp(5.95, 0.15, 'AI HQ', 47, 112, '400 15px "Patrick Hand"', HX.RED, null, box1);
    typeOp(6.2, 0.36, 'TO THE MOON!!', 350, 128, '400 23px "Patrick Hand"', HX.K, WHT, box2);
    ops[ops.length - 1].pen = () => [box2.x + box2.vw + 4, box2.y + box2.h / 2];
    ops[ops.length - 1].box = box2; ops[ops.length - 2].box = box1;

    // replay
    let cur = null, curIdx = -1;
    ops.forEach((o, i) => {
      if (t < o.t0) return;
      const p = H.clamp((t - o.t0) / o.dur);
      o.fn(Math.max(p, 1e-3), H.rng(o.seed));
      cur = o; curIdx = i;
    });
    // cursor: on the active op's pen, or gliding to the next op's start during gaps
    let pen = [270, 120], tool = 7, col = HX.K, box = null;
    if (cur) {
      const p = H.clamp((t - cur.t0) / cur.dur);
      pen = cur.pen(p); tool = cur.tool; col = cur.col;
      const nxt = ops[curIdx + 1];
      if (p >= 1 && nxt) {
        const g = H.clamp((t - cur.t0 - cur.dur) / Math.max(0.001, nxt.t0 - cur.t0 - cur.dur));
        const a = cur.pen(1), b = nxt.pen(0), e = H.ease.inOut(g);
        pen = [H.lerp(a[0], b[0], e), H.lerp(a[1], b[1], e)];
        if (g > 0.5) { tool = nxt.tool; col = nxt.col; }
      }
      if (cur.box && (curIdx === ops.length - 1 || t < ops[curIdx + 1].t0)) box = cur.box;
    } else { const b = ops[0].pen(0); pen = [H.lerp(300, b[0], H.clamp(t / 0.1)), H.lerp(150, b[1], H.clamp(t / 0.1))]; }
    return { P, tool, col, pen, textBox: box, blink: Math.floor(t * 2) % 2 === 0 };
  }

  function drawCursor(c, x, y, tool) {
    x = Math.round(x); y = Math.round(y);
    const R = (a, b, w, h, col) => rect(c, x + a, y + b, w, h, col);
    if (tool === 9) { R(-2, -7, 2, 1, '#000'); R(1, -7, 2, 1, '#000'); R(0, -6, 1, 12, '#000'); R(-2, 6, 2, 1, '#000'); R(1, 6, 2, 1, '#000'); return; }
    if (tool === 6) { // pencil cursor, tip at (x,y)
      for (let k = 0; k < 9; k++) { R(k, -k - 1, 2, 2, k < 2 ? '#000' : k < 7 ? '#ffd040' : '#c06060'); } R(0, -1, 1, 1, '#000'); return;
    }
    if (tool === 3) { R(1, -12, 9, 8, '#000'); R(2, -11, 7, 6, '#fff'); R(8, -14, 3, 5, '#000'); R(-1, -4, 2, 3, '#000'); return; }
    if (tool === 2) { R(-4, -4, 9, 1, '#000'); R(-4, 4, 9, 1, '#000'); R(-4, -4, 1, 9, '#000'); R(4, -4, 1, 9, '#000'); return; }
    // crosshair (brush, line, shapes, airbrush)
    R(-7, 0, 5, 1, '#000'); R(3, 0, 5, 1, '#000'); R(0, -7, 1, 5, '#000'); R(0, 3, 1, 5, '#000');
    R(-7, 1, 5, 1, '#fff'); R(3, 1, 5, 1, '#fff'); R(1, -7, 1, 5, '#fff'); R(1, 3, 1, 5, '#fff');
  }

  // ---------------- toolbox icons (approximate, 16x16) ----------------
  function toolIcon(c, x, y, k) {
    const R = (a, b, w, h, col = '#000') => rect(c, x + a, y + b, w, h, col);
    switch (k) {
      case 0: for (let i = 0; i < 14; i += 2) { R(1 + i, 2, 1, 1); R(1 + i, 13, 1, 1); } for (let j = 2; j < 14; j += 2) { R(1, j, 1, 1); R(14, j, 1, 1); } R(5, 5, 6, 1); R(4, 6, 1, 4); break; // free select
      case 1: for (let i = 0; i < 14; i += 2) { R(1 + i, 2, 1, 1); R(1 + i, 13, 1, 1); } for (let j = 2; j < 14; j += 2) { R(1, j, 1, 1); R(14, j, 1, 1); } break; // select
      case 2: R(3, 5, 10, 7, '#000'); R(4, 6, 8, 3, '#ff80c0'); R(4, 9, 8, 2, '#fff'); break; // eraser
      case 3: R(3, 6, 8, 8); R(4, 7, 6, 6, '#fff'); R(10, 3, 4, 6, '#000'); R(11, 4, 2, 4, '#c00'); R(12, 13, 2, 2, '#c00'); break; // bucket
      case 4: R(9, 2, 4, 4); R(7, 5, 3, 3); R(4, 8, 3, 3); R(2, 11, 3, 3); break; // picker
      case 5: R(3, 2, 7, 7); R(4, 3, 5, 5, '#c0e0ff'); R(9, 9, 2, 2); R(11, 11, 3, 3); break; // magnifier
      case 6: R(10, 2, 3, 3, '#c80'); R(8, 4, 3, 3, '#ff0'); R(6, 6, 3, 3, '#ff0'); R(4, 8, 3, 3, '#ff0'); R(3, 11, 2, 2); break; // pencil
      case 7: R(9, 2, 3, 7, '#840'); R(7, 9, 5, 3, '#888'); R(6, 12, 4, 3, '#000'); break; // brush
      case 8: R(4, 6, 5, 8, '#888'); R(5, 4, 3, 2); R(9, 3, 1, 1); R(11, 2, 1, 1); R(10, 5, 1, 1); R(12, 4, 1, 1); R(11, 7, 1, 1); break; // airbrush
      case 9: R(4, 3, 8, 2); R(7, 3, 2, 10); R(5, 12, 6, 1); break; // text "A"
      case 10: for (let i = 0; i < 11; i++) R(2 + i, 13 - i, 1, 1); break; // line
      case 11: for (let i = 0; i < 12; i++) R(2 + i, Math.round(8 + Math.sin(i / 1.8) * 4), 1, 1); break; // curve
      case 12: R(2, 3, 12, 1); R(2, 12, 12, 1); R(2, 3, 1, 10); R(13, 3, 1, 10); break; // rect
      case 13: R(3, 3, 8, 1); R(10, 3, 1, 4); R(10, 7, 4, 1); R(13, 7, 1, 6); R(3, 12, 11, 1); R(3, 3, 1, 10); break; // polygon
      case 14: for (let a = 0; a < 6.28; a += 0.2) R(8 + Math.round(Math.cos(a) * 6), 8 + Math.round(Math.sin(a) * 4), 1, 1); break; // ellipse
      case 15: R(4, 3, 8, 1); R(4, 12, 8, 1); R(2, 5, 1, 6); R(13, 5, 1, 6); R(3, 4, 1, 1); R(12, 4, 1, 1); R(3, 11, 1, 1); R(12, 11, 1, 1); break; // rounded rect
    }
  }

  // =====================================================================================
  // EXPLAINER: someone paints the explanation live on one wide bitmap. Transition = the canvas scrolls
  // (scrollbar thumb slides) so the camera pans along the drawing; arrows are line/curve-tool strokes,
  // numbers are retyped in a text box, emphasis is a big red brush X and an ellipse-tool circle.
  // =====================================================================================
  const EXW = 2100, EXH = 230, VIEWW = 540;
  const PH = (px) => `400 ${px}px "Patrick Hand"`;
  function paintEx(t) {
    const P = PixelDoc(EXW, EXH), C = P.C;
    const HX = { K: '#000000', Y: '#ffff00', GRN: '#008000', LIME: '#00ff00', RED: '#ff0000', ORG: '#ff8040', BRN: '#804000', PNK: '#ff80c0', MAG: '#ff00ff', WHT: '#ffffff', NAVY: '#000080', BLU: '#0000ff', DG: '#808080' };
    const K = C(HX.K), RED = C(HX.RED), GRN = C(HX.GRN), WHT = C(HX.WHT);
    const ops = [];
    const op = (t0, dur, tool, col, fn, pen, extra = {}) => ops.push({ t0, dur, tool, col, fn, pen, seed: ops.length + 31, ...extra });
    const handOp = (t0, dur, tool, col, pts, size, jit) => op(t0, dur, tool, col, (p, r) => P.hand(pts, C(col), size, r, jit, false, p), (p) => pts[Math.min(pts.length - 1, Math.floor(p * (pts.length - 1) + 0.5))]);
    const lineOp = (t0, dur, col, x0, y0, x1, y1, size = 3, head = true) => op(t0, dur, 10, col, (p) => {
      const ex = H.lerp(x0, x1, p), ey = H.lerp(y0, y1, p);
      P.line(x0, y0, ex, ey, C(col), size);
      if (head && p >= 1) { const a = Math.atan2(y1 - y0, x1 - x0); for (const s of [-1, 1]) P.line(x1, y1, x1 - Math.cos(a + s * 0.5) * 14, y1 - Math.sin(a + s * 0.5) * 14, C(col), size); }
    }, (p) => [H.lerp(x0, x1, p), H.lerp(y0, y1, p)]);
    const curveOp = (t0, dur, col, a, b, cp, size = 3) => op(t0, dur, 11, col, (p) => {
      const pts = []; for (let i = 0; i <= 30 * p; i++) { const u = i / 30; pts.push([(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * cp[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * cp[1] + u * u * b[1]]); }
      if (pts.length > 1) P.poly(pts, C(col), size);
      if (p >= 1) { const ang = Math.atan2(b[1] - cp[1], b[0] - cp[0]); for (const s of [-1, 1]) P.line(b[0], b[1], b[0] - Math.cos(ang + s * 0.5) * 14, b[1] - Math.sin(ang + s * 0.5) * 14, C(col), size); }
    }, (p) => { const u = p; return [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * cp[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * cp[1] + u * u * b[1]]; });
    const rectOp = (t0, dur, x, y, w, h, size = 1) => op(t0, dur, 12, HX.K, (p) => P.rectO(x, y, Math.round(w * p), Math.round(h * p), K, size), (p) => [x + w * p, y + h * p]);
    const fillOp = (t0, x, y, col) => op(t0, 0.001, 3, col, () => P.flood(x, y, C(col)), () => [x, y]);
    const typeOp = (t0, dur, str, x, y, px, col, bg = null) => { const box = { x: x - 6, y: y - px * 0.95, w: 0, h: px * 1.25, vw: 0 }; op(t0, dur, 9, col, (p) => { const res = P.text(str, x, y, PH(px), C(col), bg, Math.floor(p * str.length + 1e-6)); box.vw = res.vw; box.w = res.w + 6; }, () => [box.x + box.vw + 8, box.y + box.h / 2], { box }); };
    // crude critters, drawn with pencil/ellipse; p = drag progress
    const cat = (x, y, p, r) => {
      P.ellipse(x + 35, y + 34, 22, 19, K, 2, null, null, H.clamp(p * 2.5));
      if (p > 0.4) { P.hand([[x + 16, y + 26], [x + 18, y + 8], [x + 30, y + 17]], K, 2, r, 0.5); P.hand([[x + 40, y + 17], [x + 52, y + 8], [x + 54, y + 26]], K, 2, r, 0.5); }
      if (p > 0.7) { P.stamp(x + 27, y + 31, K, 3); P.stamp(x + 43, y + 31, K, 3); P.line(x + 33, y + 39, x + 37, y + 39, K, 2); }
      if (p > 0.85) { P.line(x + 6, y + 36, x + 22, y + 39, K, 1); P.line(x + 6, y + 44, x + 22, y + 42, K, 1); P.line(x + 48, y + 39, x + 64, y + 36, K, 1); P.line(x + 48, y + 42, x + 64, y + 44, K, 1); }
    };
    const dog = (x, y, p, r) => {
      P.ellipse(x + 35, y + 32, 19, 22, K, 2, null, null, H.clamp(p * 2.5));
      if (p > 0.4) { P.ellipse(x + 11, y + 30, 7, 15, K, 2); P.ellipse(x + 59, y + 30, 7, 15, K, 2); } // floppy ears hang outside the head outline
      if (p > 0.7) { P.stamp(x + 28, y + 26, K, 3); P.stamp(x + 42, y + 26, K, 3); P.ellipse(x + 35, y + 40, 5, 3, K, 2); }
      if (p > 0.85) P.hand([[x + 30, y + 47], [x + 35, y + 51], [x + 40, y + 47]], K, 1, r, 0.2);
    };
    const card = (x, y, kind, label, fillIt = true) => {
      P.rectF(x, y, 70, 76, WHT); // opaque paste
      P.rectO(x, y, 70, 76, K, 1);
      const r = H.rng(kind === 'cat' ? 3 : 4);
      (kind === 'cat' ? cat : dog)(x, y, 1, r);
      if (fillIt) { P.flood(x + 35, y + 34, C(kind === 'cat' ? HX.ORG : HX.BRN)); if (kind === 'dog') { P.flood(x + 13, y + 30, K); P.flood(x + 57, y + 30, K); } }
      if (label) P.text(label, x + 22, y + 72, PH(18), C(HX.NAVY));
    };

    // ---- beat 1: question typed big, then selected, dragged to the corner and stretched smaller ----
    const qBox = { x: 54, y: 82, w: 0, h: 50, vw: 0 };
    op(0.1, 0.7, 9, HX.K, (p) => {
      if (t < 1.3) { const res = P.text('How does AI learn?', 60, 122, PH(44), K, null, Math.floor(p * 18 + 1e-6)); qBox.vw = res.vw; qBox.w = res.w + 6; }
    }, () => [qBox.x + qBox.vw + 8, qBox.y + 25], { box: qBox });
    op(1.3, 0.6, 1, HX.K, (p) => { if (p >= 1) P.text('How does AI learn?', 10, 23, PH(24), C(HX.NAVY)); }, (p) => [H.lerp(200, 90, p), H.lerp(100, 14, p)]);
    // ---- beat 2: labelled examples, the model, copy-paste pile, arrow, counter ----
    rectOp(2.0, 0.15, 24, 34, 70, 76);
    op(2.15, 0.35, 6, HX.K, (p, r) => cat(24, 34, p, H.rng(3)), (p) => [44 + 30 * p, 60]);
    fillOp(2.55, 59, 68, HX.ORG);
    typeOp(2.6, 0.15, 'cat', 46, 106, 18, HX.NAVY);
    rectOp(2.8, 0.15, 24, 130, 70, 76);
    op(2.95, 0.35, 6, HX.K, (p) => dog(24, 130, p, H.rng(4)), (p) => [44 + 30 * p, 160]);
    fillOp(3.32, 59, 162, HX.BRN); fillOp(3.34, 37, 160, HX.K); fillOp(3.36, 81, 160, HX.K);
    typeOp(3.4, 0.15, 'dog', 46, 202, 18, HX.NAVY);
    // brain (brush blob + squiggles, bucket pink)
    const br = [[392, 112], [400, 84], [422, 70], [446, 68], [470, 76], [486, 96], [488, 122], [474, 144], [446, 152], [418, 150], [398, 136], [392, 112]];
    handOp(3.6, 0.3, 7, HX.K, br, 3, 1.0);
    fillOp(3.92, 440, 110, HX.PNK);
    handOp(3.95, 0.12, 7, HX.MAG, [[408, 100], [420, 92], [428, 104], [440, 94], [452, 106], [464, 96], [476, 108]], 2, 0.6);
    handOp(4.08, 0.1, 7, HX.MAG, [[410, 126], [424, 118], [436, 130], [450, 120], [466, 132]], 2, 0.6);
    typeOp(4.2, 0.12, 'model', 418, 182, 22, HX.K);
    // Ctrl+V pile: pasted copies stack up toward the model
    const pastes = 8, pt0 = 4.4, pdt = 0.14;
    for (let k = 0; k < pastes; k++) op(pt0 + k * pdt, 0.001, 1, HX.K, () => card(116 + k * 16, 40 + k * 8, k % 2 ? 'dog' : 'cat', k % 2 ? 'dog' : 'cat'), () => [151 + k * 16, 78 + k * 8], { sel: [116 + k * 16, 40 + k * 8, 71, 77], selUntil: pt0 + (k + 1) * pdt });
    lineOp(5.55, 0.15, HX.K, 312, 112, 372, 112, 3); // ends short of the 380 scroll stop so no arrowhead peeks in later
    typeOp(5.72, 0.1, 'train', 326, 100, 20, HX.K);
    const nEx = 1e6 * H.ease.inOut(H.clamp((t - 4.4) / 1.5));
    op(4.4, 0.001, 9, HX.NAVY, () => P.text(Math.round(nEx).toLocaleString('en-US') + ' examples', 112, 224, PH(34), C(HX.NAVY), WHT), () => [330, 206]);

    // ---- beat 3 (canvas scrolled right): new picture, guess, red X, adjust knobs, guess again ----
    rectOp(6.65, 0.12, 560, 24, 70, 76);
    op(6.77, 0.18, 6, HX.K, (p) => cat(560, 24, p, H.rng(5)), (p) => [580 + 30 * p, 50]);
    fillOp(6.97, 595, 58, HX.ORG);
    typeOp(7.0, 0.06, '???', 576, 96, 18, HX.NAVY);
    typeOp(7.08, 0.12, 'new picture', 552, 18, 18, HX.K);
    lineOp(7.25, 0.15, HX.K, 556, 70, 492, 100, 3);
    lineOp(7.45, 0.15, HX.K, 488, 128, 628, 150, 3);
    typeOp(7.62, 0.12, 'Guess', 520, 172, 24, HX.BLU);
    op(7.78, 0.22, 14, HX.K, (p) => P.ellipse(708, 152, 74, 30, K, 2, null, null, p), (p) => [634 + 148 * p, 122 + 60 * p]);
    const dogQ = t < 9.75;
    if (dogQ) typeOp(8.05, 0.14, 'dog?', 680, 164, 32, HX.K);
    // emphasis: big red brush X over the wrong guess
    if (dogQ) handOp(8.3, 0.12, 7, HX.RED, [[660, 128], [760, 180]], 5, 1.0);
    if (dogQ) handOp(8.44, 0.12, 7, HX.RED, [[760, 126], [662, 182]], 5, 1.0);
    typeOp(8.6, 0.2, "Check: it's a cat!", 638, 214, 22, HX.RED);
    curveOp(8.85, 0.25, HX.RED, [800, 150], [496, 204], [820, 228], 3);
    // knobs (weights): circles with pointer lines, re-drawn at new angles = adjusting
    const knobs = [[410, 204], [444, 208], [478, 204]];
    const angA = [-2.4, -0.6, -1.9], angB = [-1.0, -2.2, -0.4];
    const kst = H.clamp(Math.floor((t - 9.2) / 0.12) / 3);
    op(5.85, 0.001, 14, HX.K, () => { knobs.forEach(([x, y], i) => { P.ellipse(x, y, 13, 13, K, 2); const a = H.lerp(angA[i], angB[i], t >= 9.2 ? kst : 0); P.line(x, y, x + Math.cos(a) * 10, y + Math.sin(a) * 10, t >= 9.2 && t < 9.6 ? RED : K, 2); }); }, () => [444, 200]);
    typeOp(9.15, 0.14, 'Adjust', 496, 222, 22, HX.RED);
    op(9.2, 0.4, 6, HX.K, () => {}, (p) => [knobs[Math.min(2, Math.floor(p * 3))][0], knobs[Math.min(2, Math.floor(p * 3))][1] - 6]);
    curveOp(9.62, 0.12, HX.GRN, [390, 180], [402, 130], [372, 160], 3);
    typeOp(9.72, 0.02, '', 0, 0, 10, HX.K);
    // second guess: erase, then the right answer + check mark
    op(9.75, 0.15, 2, HX.WHT, (p) => { for (let k = 0; k <= p * 10; k++) P.rectF(652 + k * 11, 130, 14, 50, WHT); }, (p) => [656 + 110 * p, 155]);
    op(9.75, 0.15, 2, HX.WHT, (p) => { P.ellipse(708, 152, 74, 30, K, 2); }, (p) => [656 + 110 * p, 155]);
    typeOp(9.92, 0.12, 'cat', 690, 166, 34, HX.GRN);
    handOp(10.08, 0.14, 7, HX.GRN, [[796, 150], [808, 166], [834, 124]], 5, 0.6);

    // ---- beat 4 (scroll on): axes, climbing pencil line, retyped accuracy number, red circle ----
    lineOp(10.9, 0.12, HX.K, 1000, 20, 1000, 200, 2, false);
    lineOp(11.02, 0.12, HX.K, 1000, 200, 1330, 200, 2, true);
    typeOp(11.14, 0.08, 'accuracy', 1008, 22, 20, HX.K);
    typeOp(11.22, 0.1, 'training rounds', 1110, 224, 20, HX.K);
    const curve = []; for (let i = 0; i <= 16; i++) { const u = i / 16; curve.push([1006 + u * 314, 172 - (1 - Math.pow(1 - u, 2.2)) * 130]); }
    handOp(11.3, 0.85, 6, HX.GRN, curve, 3, 2.2);
    const acc = Math.round(H.lerp(61, 97, H.ease.inOut(H.clamp((t - 11.3) / 0.85))));
    typeOp(11.3, 0.05, 'accuracy', 1360, 60, 22, HX.K);
    op(11.32, 0.85, 9, HX.K, () => P.text(acc + '%', 1366, 118, PH(52), K, WHT), () => [1440, 100]);
    op(12.22, 0.2, 14, HX.RED, (p) => P.ellipse(1408, 98, 60, 38, RED, 3, null, null, p), (p) => [1348 + 120 * p, 60 + 76 * p]);
    typeOp(12.44, 0.06, '!!', 1474, 72, 34, HX.RED);

    // ---- beat 5 (scroll on): the takeaway, underlined, airbrush sparkle ----
    typeOp(13.05, 0.32, 'More examples', 1540, 90, 46, HX.K);
    lineOp(13.4, 0.1, HX.K, 1544, 136, 1594, 136, 4);
    typeOp(13.52, 0.32, 'better guesses', 1606, 152, 46, HX.NAVY);
    handOp(13.88, 0.16, 7, HX.RED, [[1606, 166], [1700, 170], [1830, 164]], 4, 0.8);
    op(14.06, 0.3, 8, HX.Y, (p) => { const r = H.rng(77); for (const [x, y] of [[1880, 40], [1500, 40], [1860, 150]]) P.spray(x, y, 12, 70 * p, C('#ff8040'), r); }, (p) => [1500 + 380 * p, 40]);

    // replay up to t
    let cur = null, curIdx = -1;
    ops.forEach((o, i) => { if (t < o.t0) return; o.fn(Math.max(1e-3, H.clamp((t - o.t0) / o.dur)), H.rng(o.seed)); cur = o; curIdx = i; });
    let pen = [300, 120], tool = 9, col = HX.K, box = null, sel = null;
    if (cur) {
      const p = H.clamp((t - cur.t0) / cur.dur);
      pen = cur.pen(p); tool = cur.tool; col = cur.col;
      const nxt = ops.slice(curIdx + 1).find((o) => o.t0 > t);
      if (p >= 1 && nxt) {
        const g = H.clamp((t - cur.t0 - cur.dur) / Math.max(0.001, nxt.t0 - cur.t0 - cur.dur));
        const a = cur.pen(1), b = nxt.pen(0), e = H.ease.inOut(g);
        pen = [H.lerp(a[0], b[0], e), H.lerp(a[1], b[1], e)];
        if (g > 0.5) { tool = nxt.tool; col = nxt.col; }
      }
      if (cur.box && (!nxt || t < nxt.t0)) box = cur.box;
      for (const o of ops) if (o.sel && t >= o.t0 && t < o.selUntil) sel = o.sel;
    }
    // floating selection while the question is dragged + stretched
    let floatQ = null;
    if (t >= 1.3 && t < 1.9) {
      const e = H.ease.inOut(H.clamp((t - 1.3) / 0.6));
      floatQ = { x: H.lerp(60, 10, e), y: H.lerp(122, 23, e), px: Math.round(H.lerp(44, 24, e)) };
    }
    if (t >= 1.9 && t < 2.0) sel = [4, 1, 196, 30];
    const scroll = (() => {
      const keys = [[0, 0], [6.0, 0], [6.6, 380], [10.3, 380], [10.85, 960], [12.6, 960], [13.0, 1500]];
      for (let i = 0; i < keys.length - 1; i++) if (t < keys[i + 1][0]) return Math.round(H.lerp(keys[i][1], keys[i + 1][1], H.ease.inOut(H.clamp((t - keys[i][0]) / (keys[i + 1][0] - keys[i][0])))));
      return 1500;
    })();
    return { P, tool, col, pen, textBox: box, sel, floatQ, scroll, blink: Math.floor(t * 2) % 2 === 0 };
  }

  function paintExUI(c, t, scene) {
    rect(c, 0, 0, BW, BH, UI.face);
    const g = c.createLinearGradient(0, 0, BW, 0); g.addColorStop(0, '#000080'); g.addColorStop(1, '#1084d0');
    c.fillStyle = g; c.fillRect(2, 2, BW - 4, 16);
    rect(c, 5, 4, 12, 11, '#000'); rect(c, 6, 5, 10, 9, '#fff'); rect(c, 7, 6, 3, 3, '#f00'); rect(c, 11, 6, 3, 3, '#00f'); rect(c, 7, 10, 3, 3, '#ff0'); rect(c, 11, 10, 3, 3, '#0a0');
    ptext(c, 'how_does_AI_learn.bmp - Paint', 21, 14, '700 9px "Inter"', '#fff');
    const tb = (x, k) => { rect(c, x, 4, 14, 12, UI.face); bevel(c, x, 4, 14, 12, 'button'); c.fillStyle = '#000'; if (k === 'x') for (let i = 0; i < 6; i++) { c.fillRect(x + 4 + i, 7 + i, 2, 1); c.fillRect(x + 9 - i, 7 + i, 2, 1); } if (k === '_') c.fillRect(x + 4, 12, 6, 2); if (k === 'o') { c.fillRect(x + 3, 6, 8, 2); c.fillRect(x + 3, 6, 1, 7); c.fillRect(x + 10, 6, 1, 7); c.fillRect(x + 3, 12, 8, 1); } };
    tb(BW - 20, 'x'); tb(BW - 38, 'o'); tb(BW - 52, '_');
    let mx = 8;
    for (const m of ['File', 'Edit', 'View', 'Image', 'Colors', 'Help']) { const w = ptext(c, m, mx, 30, SYS, '#000'); rect(c, mx, 31, 5, 1, '#000'); mx += w + 14; }
    rect(c, 0, 35, BW, 1, UI.sh); rect(c, 0, 36, BW, 1, UI.hi);
    const tx = 4, ty0 = 40;
    for (let i = 0; i < 16; i++) {
      const bx = tx + (i % 2) * 25, by = ty0 + Math.floor(i / 2) * 25, sel = i === scene.tool;
      if (sel) { rect(c, bx, by, 25, 25, '#fff'); for (let j = 0; j < 25; j++) for (let k = j & 1; k < 25; k += 2) rect(c, bx + k, by + j, 1, 1, UI.face); bevel(c, bx, by, 25, 25, 'pressed'); }
      else { rect(c, bx, by, 25, 25, UI.face); bevel(c, bx, by, 25, 25, 'button'); }
      toolIcon(c, bx + 4 + (sel ? 1 : 0), by + 4 + (sel ? 1 : 0), i);
    }
    const ox = 8, oy = ty0 + 8 * 25 + 6;
    rect(c, ox, oy, 42, 62, UI.face); bevel(c, ox, oy, 42, 62, 'thin');
    rect(c, ox + 4, oy + 6, 34, 22, '#000080'); rect(c, ox + 9, oy + 10, 24, 14, '#fff');
    for (let i = 0; i < 4; i++) rect(c, ox + 12 + i * 5, oy + 13, 3, 8, ['#f00', '#0f0', '#00f', '#ff0'][i]);
    // canvas well with horizontal scrollbar
    const wx = 58, wy = 38, ww = BW - wx - 2, wh = 262;
    rect(c, wx, wy, ww, wh, '#808080'); bevel(c, wx, wy, ww, wh, 'field');
    const cx0 = wx + 4, cy0 = wy + 4, sx = scene.scroll;
    c.putImageData(scene.P.toImageData(), cx0 - sx, cy0, sx, 0, VIEWW, EXH);
    // floating (being dragged) question
    if (scene.floatQ) {
      const f = scene.floatQ, r = rasterText('How does AI learn?', PH(f.px), 120);
      c.fillStyle = '#000';
      for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) if (r.mask[j * r.w + i]) { const X = cx0 + f.x + i - 2 - sx, Y = cy0 + f.y - r.base + j; if (X >= cx0 && X < cx0 + VIEWW && Y >= cy0 && Y < cy0 + EXH) c.fillRect(X, Y, 1, 1); }
      scene.sel = [f.x - 6, f.y - f.px, r.w + 6, f.px * 1.3];
    }
    const dash = (x, y, w, h) => {
      x = Math.round(cx0 + x - sx); y = Math.round(cy0 + y); w = Math.round(w); h = Math.round(h);
      for (let i = 0; i < w; i += 2) { rect(c, x + i, y, 1, 1, i % 4 ? '#fff' : '#000'); rect(c, x + i, y + h, 1, 1, i % 4 ? '#fff' : '#000'); }
      for (let j = 0; j < h; j += 2) { rect(c, x, y + j, 1, 1, j % 4 ? '#fff' : '#000'); rect(c, x + w, y + j, 1, 1, j % 4 ? '#fff' : '#000'); }
    };
    // clip overlays to the canvas view
    c.save(); c.beginPath(); c.rect(cx0, cy0, VIEWW, EXH); c.clip();
    if (scene.sel) dash(...scene.sel);
    if (scene.textBox && scene.textBox.w > 0) {
      const b = scene.textBox; dash(b.x, b.y, b.w, b.h);
      if (scene.blink) rect(c, Math.round(cx0 + b.x - sx + Math.min(b.w - 3, b.vw + 6)), Math.round(cy0 + b.y + 4), 1, Math.round(b.h - 8), '#000');
    }
    drawCursor(c, cx0 + scene.pen[0] - sx, cy0 + scene.pen[1], scene.tool);
    c.restore();
    // scrollbar
    const sby = cy0 + EXH + 1, sbx = cx0, sbw = VIEWW;
    for (let j = 0; j < 16; j++) for (let i = (j & 1); i < sbw; i += 2) rect(c, sbx + i, sby + j, 1, 1, '#fff');
    rect(c, sbx, sby, 16, 16, UI.face); bevel(c, sbx, sby, 16, 16, 'button'); for (let k = 0; k < 4; k++) rect(c, sbx + 6 + k, sby + 8 - k, 1, k * 2 + 1, '#000');
    rect(c, sbx + sbw - 16, sby, 16, 16, UI.face); bevel(c, sbx + sbw - 16, sby, 16, 16, 'button'); for (let k = 0; k < 4; k++) rect(c, sbx + sbw - 7 - k, sby + 8 - k, 1, k * 2 + 1, '#000');
    const trk = sbw - 32, thw = Math.round(trk * VIEWW / EXW), thx = sbx + 16 + Math.round((trk - thw) * sx / (EXW - VIEWW));
    rect(c, thx, sby, thw, 16, UI.face); bevel(c, thx, sby, thw, 16, 'button');
    // palette
    const py = 304;
    rect(c, 0, py - 2, BW, 1, UI.hi);
    rect(c, 4, py, 30, 32, UI.face); bevel(c, 4, py, 30, 32, 'field');
    for (let j = 0; j < 30; j++) for (let i = (j & 1); i < 26; i += 2) rect(c, 6 + i, py + 2 + j, 1, 1, '#fff');
    rect(c, 16, py + 13, 13, 13, '#ffffff'); bevel(c, 16, py + 13, 13, 13, 'button'); rect(c, 18, py + 15, 9, 9, '#ffffff');
    rect(c, 9, py + 6, 13, 13, scene.col); bevel(c, 9, py + 6, 13, 13, 'button'); rect(c, 11, py + 8, 9, 9, scene.col);
    PALETTE.forEach((row, j) => row.forEach((col, i) => { const x = 36 + i * 16, y = py + j * 16; rect(c, x, y, 16, 16, col); bevel(c, x, y, 16, 16, 'field'); rect(c, x + 2, y + 2, 12, 12, col); }));
    const sy = BH - 18;
    rect(c, 2, sy, 420, 16, UI.face); bevel(c, 2, sy, 420, 16, 'thin');
    ptext(c, 'For Help, click Help Topics on the Help Menu.', 6, sy + 12, SYS, '#000');
    rect(c, 425, sy, 100, 16, UI.face); bevel(c, 425, sy, 100, 16, 'thin');
    ptext(c, `${Math.round(scene.pen[0])},${Math.round(scene.pen[1])}`, 430, sy + 12, SYS, '#000');
    rect(c, 528, sy, 110, 16, UI.face); bevel(c, 528, sy, 110, 16, 'thin');
  }

  // ---- SOUND: someone at a 90s PC painting with the mouse. Everything is the person's hardware: mouse-button clicks
  // (down + release) bracketing every tool drag, the mouse sliding on its pad while a stroke drags, keyboard keys for
  // the text tool / Ctrl+V / retyped numbers, mouse-wheel notches when the canvas scrolls, a soft "bloop" for each
  // bucket fill and a hiss for the airbrush. A tower hums underneath. All times copy the ops in paintEx().
  function paintSound(k) {
    const END = 14.6;
    const down = (t, g = 1, pan = 0) => { k.noise(t, { dur: 0.01, filter: 'bandpass', f: 2600, q: 1.6, gain: 0.26 * g, a: 0.0005, pan }); k.tone(t, { f: [[0, 230], [0.03, 150]], dur: 0.035, gain: 0.08 * g, pan }); };
    const up = (t, g = 1, pan = 0) => k.noise(t, { dur: 0.008, filter: 'bandpass', f: 3100, q: 1.6, gain: 0.13 * g, a: 0.0005, pan, minor: true });
    const slide = (t, d, g = 1, pan = 0) => k.noise(t, { dur: d + 0.03, color: 'pink', filter: 'bandpass', f: 650, q: 0.8, gain: 0.09 * g, a: Math.min(0.03, d * 0.3), hold: d * 0.6, pan, minor: true }); // mouse on the pad
    const drag = (t, d, g = 1, pan = 0) => { down(t, g, pan); slide(t, d, g, pan); up(t + d, g, pan); };
    const key = (t, g = 1, pan = 0.2) => k.play('key', t, { gain: 1.3 * g, pan, minor: true });
    // text tool: one key per character, thinned to <= ~12 keys/s so fast typing does not turn into a buzz
    const type = (t0, dur, n, g = 1) => { const m = Math.max(1, Math.min(n, Math.floor(dur * 10) + 1)); for (let i = 0; i < m; i++) key(t0 + (dur * (i + 1)) / m, g); }; // char i shows at t0 + dur*(i+1)/n
    const textOp = (t0, dur, n, g) => { down(t0, 0.7); type(t0 + 0.005, dur, n, g); };
    const fill = (t, pan = 0) => { down(t, 1, pan); k.tone(t + 0.005, { f: [[0, 260], [0.07, 520]], type: 'triangle', dur: 0.12, gain: 0.12, a: 0.004, pan, minor: true }); };
    const wheel = (t0, t1, n) => { for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, t = t0 + (t1 - t0) * (u < 0.5 ? Math.sqrt(u / 2) : 1 - Math.sqrt((1 - u) / 2)); k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1500, q: 3, gain: 0.2, a: 0.0005, minor: true }); k.tone(t, { f: 180, dur: 0.02, gain: 0.05, minor: true }); } };
    const counter = (t0, t1, fn, step, play) => { let last = -1, lastV = fn(t0); for (let t = t0; t <= t1 + 1e-6; t += 1 / 120) { const v = fn(t); if (v - lastV >= step && t - last >= 1 / 10) { play(t); last = t; lastV = v; } } };

    k.bed('room', 0, END, { gain: 0.35 });
    k.bed('hum', 0, END, { gain: 0.35 });

    // ---- beat 1: type the question, then select-drag it into the corner (1.3..1.9)
    textOp(0.1, 0.7, 18);
    down(1.3); k.noise(1.3, { dur: 0.62, color: 'brown', filter: 'lowpass', f: [[0, 300], [0.6, 180]], gain: 0.09, a: 0.15, hold: 0.25, minor: true }); slide(1.3, 0.6, 0.8); up(1.9);

    // ---- beat 2: examples drawn, filled, labelled; the model; Ctrl+V pile; arrow; counter
    drag(2.0, 0.15, 1, -0.5); drag(2.15, 0.35, 1, -0.5); fill(2.55, -0.5); textOp(2.6, 0.15, 3);
    drag(2.8, 0.15, 1, -0.5); drag(2.95, 0.35, 1, -0.5); fill(3.32, -0.5); down(3.34, 0.7, -0.5); down(3.36, 0.7, -0.5); textOp(3.4, 0.15, 3);
    drag(3.6, 0.3, 1, 0.4); fill(3.92, 0.4); drag(3.95, 0.12, 0.8, 0.4); drag(4.08, 0.1, 0.8, 0.4); textOp(4.2, 0.12, 5);
    // 8 pastes, one every 0.14 s: Ctrl+V key + the copy landing with a dull paper-less "thup" (bitmap paste, no rustle)
    for (let i = 0; i < 8; i++) { const t = 4.4 + i * 0.14; key(t - 0.03, 0.9, -0.2); k.tone(t, { f: [[0, 340], [0.05, 190]], type: 'triangle', dur: 0.07, gain: 0.11, pan: -0.3 + i * 0.05, minor: true }); }
    // counter retyped 0 -> 1,000,000 (4.4..5.9): soft keys, thinned to <= 10/s, slowing as it settles
    counter(5.45, 5.9, (t) => H.ease.inOut(H.clamp((t - 4.4) / 1.5)), 1 / 400, (t) => key(t, 0.8, -0.4)); // while pasting, the paste rhythm carries the count
    drag(5.55, 0.15, 1, 0.1); textOp(5.72, 0.1, 5); down(5.85, 1, 0.3);
    wheel(6.0, 6.6, 7);

    // ---- beat 3: new picture, guess, red X (wrong), check, adjust knobs, erase, right answer
    drag(6.65, 0.12, 1, 0.3); drag(6.77, 0.18, 1, 0.3); fill(6.97, 0.3); textOp(7.0, 0.06, 3); textOp(7.08, 0.12, 11);
    drag(7.25, 0.15); drag(7.45, 0.15); textOp(7.62, 0.12, 5); drag(7.78, 0.22, 1, 0.3);
    textOp(8.05, 0.14, 4);                                                           // "dog?" typed
    // the wrong guess: two fat red brush slashes (8.3, 8.44), hard and fast, with a dull low "nope" under the first
    const X1 = 8.3, X2 = 8.44;
    [X1, X2].forEach((t, i) => { down(t, 1.3, 0.3); k.noise(t, { dur: 0.13, color: 'pink', filter: 'bandpass', f: [[0, 900], [0.12, 500]], q: 0.9, gain: 0.22, a: 0.01, pan: 0.3 - i * 0.2 }); up(t + 0.12, 1.2, 0.3); });
    k.play('thud', X1, { f: 120, gain: 0.7, pan: 0.3 });
    k.tone(X1, { f: [[0, 'D3'], [0.3, 'A2']], type: 'triangle', dur: 0.4, gain: 0.18, hold: 0.15, pan: 0.3 });
    k.tone(X2, { f: [[0, 'C#3'], [0.35, 'G#2']], type: 'triangle', dur: 0.45, gain: 0.15, hold: 0.15, pan: 0.1 });
    textOp(8.6, 0.2, 18); drag(8.85, 0.25, 1, 0.3);
    textOp(9.15, 0.14, 6);
    // knobs re-drawn at new angles: three steps at 9.32 / 9.44 / 9.56
    [9.32, 9.44, 9.56].forEach((t, i) => { down(t, 0.9, -0.2 + i * 0.1); k.play('tock', t, { f: 700 + i * 60, gain: 0.25, pan: -0.2 + i * 0.1, minor: true }); });
    drag(9.62, 0.12, 0.9, -0.2);
    drag(9.75, 0.15, 1.1, 0.4);                                                      // eraser wipes the guess
    textOp(9.92, 0.12, 3);
    // correct: the green check mark lands (10.08..10.22)
    drag(10.08, 0.14, 1, 0.4);
    k.play('success', 10.22, { f: 'C5', gain: 0.4, pan: 0.3 });
    wheel(10.3, 10.85, 9);

    // ---- beat 4: axes, labels, the long climbing pencil line + retyped accuracy, red ellipse, "!!"
    drag(10.9, 0.12); drag(11.02, 0.12); textOp(11.14, 0.08, 8); textOp(11.22, 0.1, 15);
    down(11.3); slide(11.3, 0.85, 1.1, -0.2); up(12.15);
    counter(11.45, 12.17, (t) => Math.round(H.lerp(61, 97, H.ease.inOut(H.clamp((t - 11.3) / 0.85)))), 1, (t) => key(t, 0.8, 0.4));
    drag(12.22, 0.2, 1, 0.4);
    // 97%: the ellipse closes (12.42) and "!!" is hammered in (12.44, 12.47): biggest moment, a bright chord + thump
    const BEST = 12.44;
    k.play('key', BEST, { gain: 1.4, pan: 0.4 }); k.play('key', BEST + 0.03, { gain: 1.4, pan: 0.4 });
    k.play('impact', BEST, { f: 110, gain: 1.0 });
    ['C4', 'E4', 'G4', 'C5', 'E5'].forEach((n, i) => k.tone(BEST + i * 0.05, { f: n, type: 'triangle', dur: 1.3, gain: 0.2, a: 0.004, verb: 0.4, pan: 0.4 }));
    wheel(12.6, 13.0, 8);

    // ---- beat 5: takeaway typed, arrow, red underline (lands 14.04), airbrush sparkle (14.06..14.36)
    textOp(13.05, 0.32, 13); drag(13.4, 0.1); textOp(13.52, 0.32, 14);
    drag(13.88, 0.16, 1, 0.2);
    const TAKE = 14.04;
    k.tone(TAKE, { f: 'G4', type: 'triangle', dur: 0.25, gain: 0.12, verb: 0.3 }); k.tone(TAKE + 0.1, { f: 'C5', type: 'triangle', dur: 1.0, gain: 0.14, verb: 0.35 }); k.tone(TAKE + 0.1, { f: 'C3', type: 'triangle', dur: 1.0, gain: 0.14 });
    down(14.06, 0.8, 0.5); k.noise(14.06, { dur: 0.32, filter: 'bandpass', f: 1800, q: 0.7, gain: 0.07, a: 0.02, hold: 0.24, pan: 0.5, minor: true }); up(14.36, 0.8, 0.5);
  }

  registerStyle({
    id: 'ms-paint',
    name: 'Bitmap Paint Doodle',
    category: 'Retro UI & Neon',
    description: 'A proudly crude early-2000s bitmap painting: aliased pencil lines, real flood fills that leak through gaps, airbrush speckle, double-drawn rectangles and an opaque text-tool box, all inside a grey paint-program window.',
    motion: 'Strokes appear as if dragged by a mouse in real time, the bucket floods regions in one instant pop (and leaks), the airbrush speckles accumulate while held, and the text cursor blinks.',
    fonts: ['400 9px "Inter"', '700 9px "Inter"', '400 23px "Patrick Hand"', '400 15px "Patrick Hand"', '400 44px "Patrick Hand"', '400 20px "Patrick Hand"'],
    frameT: 7.8,
    duration: 8,
    explainerDuration: 14.6,
    explainerNote: 'Someone paints the explanation live on one wide bitmap: the camera move is the canvas scrolling (scrollbar thumb sliding), arrows are line/curve-tool strokes, examples pile up via Ctrl+V pastes, numbers are retyped in a text box, and emphasis is a fat red brush X and an ellipse-tool circle.',
    explainer(ctx, W, H_, t) {
      const buf = H.layer(BW, BH), c = buf.getContext('2d', { willReadFrequently: true });
      c.imageSmoothingEnabled = false;
      paintExUI(c, t, paintEx(t));
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buf, 0, 0, W, H_);
    },
    explainerSound(k) { paintSound(k); },
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const buf = H.layer(BW, BH), c = buf.getContext('2d', { willReadFrequently: true });
      c.imageSmoothingEnabled = false;
      rect(c, 0, 0, BW, BH, UI.face);
      // title bar
      const g = c.createLinearGradient(0, 0, BW, 0); g.addColorStop(0, '#000080'); g.addColorStop(1, '#1084d0');
      c.fillStyle = g; c.fillRect(2, 2, BW - 4, 16);
      // app icon: tiny palette
      rect(c, 5, 4, 12, 11, '#000'); rect(c, 6, 5, 10, 9, '#fff'); rect(c, 7, 6, 3, 3, '#f00'); rect(c, 11, 6, 3, 3, '#00f'); rect(c, 7, 10, 3, 3, '#ff0'); rect(c, 11, 10, 3, 3, '#0a0');
      ptext(c, 'rocket_FINAL_v2.bmp - Paint', 21, 14, '700 9px "Inter"', '#fff');
      const tb = (x, k) => { rect(c, x, 4, 14, 12, UI.face); bevel(c, x, 4, 14, 12, 'button'); c.fillStyle = '#000'; if (k === 'x') for (let i = 0; i < 6; i++) { c.fillRect(x + 4 + i, 7 + i, 2, 1); c.fillRect(x + 9 - i, 7 + i, 2, 1); } if (k === '_') c.fillRect(x + 4, 12, 6, 2); if (k === 'o') { c.fillRect(x + 3, 6, 8, 2); c.fillRect(x + 3, 6, 1, 7); c.fillRect(x + 10, 6, 1, 7); c.fillRect(x + 3, 12, 8, 1); } };
      tb(BW - 20, 'x'); tb(BW - 38, 'o'); tb(BW - 52, '_');
      // menu
      let mx = 8;
      for (const m of ['File', 'Edit', 'View', 'Image', 'Colors', 'Help']) { const w = ptext(c, m, mx, 30, SYS, '#000'); rect(c, mx, 31, 5, 1, '#000'); mx += w + 14; }
      rect(c, 0, 35, BW, 1, UI.sh); rect(c, 0, 36, BW, 1, UI.hi);

      const scene = paintScene(t);
      // toolbox
      const tx = 4, ty0 = 40;
      for (let i = 0; i < 16; i++) {
        const bx = tx + (i % 2) * 25, by = ty0 + Math.floor(i / 2) * 25;
        const sel = i === scene.tool;
        if (sel) { rect(c, bx, by, 25, 25, '#fff'); for (let j = 0; j < 25; j++) for (let k = j & 1; k < 25; k += 2) rect(c, bx + k, by + j, 1, 1, UI.face); bevel(c, bx, by, 25, 25, 'pressed'); }
        else { rect(c, bx, by, 25, 25, UI.face); bevel(c, bx, by, 25, 25, 'button'); }
        toolIcon(c, bx + 4 + (sel ? 1 : 0), by + 4 + (sel ? 1 : 0), i);
      }
      // tool options box (opaque / transparent text bg)
      const ox = 8, oy = ty0 + 8 * 25 + 6;
      rect(c, ox, oy, 42, 62, UI.face); bevel(c, ox, oy, 42, 62, 'thin');
      rect(c, ox + 4, oy + 6, 34, 22, '#000080');
      rect(c, ox + 9, oy + 10, 24, 14, '#fff'); for (let i = 0; i < 4; i++) rect(c, ox + 12 + i * 5, oy + 13, 3, 8, ['#f00', '#0f0', '#00f', '#ff0'][i]);
      rect(c, ox + 9, oy + 36, 24, 14, '#fff'); rect(c, ox + 9, oy + 36, 24, 1, '#000'); rect(c, ox + 9, oy + 49, 24, 1, '#000'); rect(c, ox + 9, oy + 36, 1, 14, '#000'); rect(c, ox + 32, oy + 36, 1, 14, '#000');
      for (let i = 0; i < 4; i++) rect(c, ox + 12 + i * 5, oy + 39, 3, 8, ['#f00', '#0f0', '#00f', '#ff0'][i]);

      // canvas well
      const wx = 58, wy = 38, ww = BW - wx - 2, wh = 262;
      rect(c, wx, wy, ww, wh, '#808080'); bevel(c, wx, wy, ww, wh, 'field');
      const cx0 = wx + 4, cy0 = wy + 4;
      c.putImageData(scene.P.toImageData(), cx0, cy0);
      // resize handles
      const cw = scene.P.w, ch = scene.P.h;
      for (const [hx, hy] of [[cx0 + cw, cy0 + ch / 2], [cx0 + cw / 2, cy0 + ch], [cx0 + cw, cy0 + ch]]) rect(c, Math.round(hx), Math.round(hy), 3, 3, '#000080');
      // text box being edited: dashed frame + cursor
      if (scene.textBox) {
      const tbx = cx0 + scene.textBox.x, tby = cy0 + scene.textBox.y, tbw = scene.textBox.w, tbh = scene.textBox.h;
      for (let i = 0; i < tbw; i += 2) { rect(c, tbx + i, tby, 1, 1, i % 4 ? '#fff' : '#000'); rect(c, tbx + i, tby + tbh, 1, 1, i % 4 ? '#fff' : '#000'); }
      for (let j = 0; j < tbh; j += 2) { rect(c, tbx, tby + j, 1, 1, j % 4 ? '#fff' : '#000'); rect(c, tbx + tbw, tby + j, 1, 1, j % 4 ? '#fff' : '#000'); }
      for (const [hx, hy] of [[tbx, tby], [tbx + tbw, tby], [tbx, tby + tbh], [tbx + tbw, tby + tbh], [tbx + tbw / 2, tby], [tbx + tbw / 2, tby + tbh], [tbx, tby + tbh / 2], [tbx + tbw, tby + tbh / 2]]) rect(c, Math.round(hx) - 1, Math.round(hy) - 1, 3, 3, '#000080');
      if (scene.blink) rect(c, tbx + Math.min(tbw - 3, scene.textBox.vw + 4), tby + 5, 1, tbh - 9, '#000');
      }

      // palette
      const py = 304;
      rect(c, 0, py - 2, BW, 1, UI.hi);
      rect(c, 4, py, 30, 32, UI.face); bevel(c, 4, py, 30, 32, 'field');
      for (let j = 0; j < 30; j++) for (let i = (j & 1); i < 26; i += 2) rect(c, 6 + i, py + 2 + j, 1, 1, '#fff');
      rect(c, 16, py + 13, 13, 13, '#ffffff'); bevel(c, 16, py + 13, 13, 13, 'button'); rect(c, 18, py + 15, 9, 9, '#ffffff');
      rect(c, 9, py + 6, 13, 13, scene.col); bevel(c, 9, py + 6, 13, 13, 'button'); rect(c, 11, py + 8, 9, 9, scene.col);
      PALETTE.forEach((row, j) => row.forEach((col, i) => { const sx = 36 + i * 16, sy = py + j * 16; rect(c, sx, sy, 16, 16, col); bevel(c, sx, sy, 16, 16, 'field'); rect(c, sx + 2, sy + 2, 12, 12, col); }));

      // status bar
      const sy = BH - 18;
      rect(c, 2, sy, 420, 16, UI.face); bevel(c, 2, sy, 420, 16, 'thin');
      ptext(c, 'For Help, click Help Topics on the Help Menu.', 6, sy + 12, SYS, '#000');
      rect(c, 425, sy, 100, 16, UI.face); bevel(c, 425, sy, 100, 16, 'thin');
      const mxp = Math.round(scene.pen[0]), myp = Math.round(scene.pen[1]);
      ptext(c, `${mxp},${myp}`, 430, sy + 12, SYS, '#000');
      rect(c, 528, sy, 110, 16, UI.face); bevel(c, 528, sy, 110, 16, 'thin');
      // size grip
      for (let i = 0; i < 3; i++) { for (let k = 0; k <= i * 4 + 2; k++) rect(c, BW - 4 - k, sy + 14 - (i * 4 + 2) + k, 1, 1, UI.sh); }

      // I-beam text cursor over the canvas
      // tool cursor follows the "mouse"; while typing it parks below the text box like a real I-beam would
      const pen = scene.tool === 9 && scene.textBox ? [scene.textBox.x + scene.textBox.w * 0.4, scene.textBox.y + scene.textBox.h + 22] : scene.pen;
      drawCursor(c, cx0 + pen[0], cy0 + pen[1], scene.tool);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buf, 0, 0, W, H_);
    },
  });
}
