{
  // ---------- Wood-type letterpress broadside: 2 inks, per-block wear, wood grain, deboss ----------
  const PAPER = [238, 226, 198];
  const INKS = { black: [30, 27, 26], red: [206, 58, 36] };

  // cream rag stock: cloudy formation, irregular (patchy) fibre streaks and fine tooth, slight warm/cool drift
  const paperBase = (px, W, H_) => {
    const nz = H.makeNoise(17), img = px.createImageData(W, H_), d = img.data;
    // low-frequency fields on a 4px grid (bilinear), fine streak + tooth per pixel
    const GS = 4, gw = Math.ceil(W / GS) + 2, gh = Math.ceil(H_ / GS) + 2, G = new Float32Array(gw * gh * 3);
    for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) { const x = gx * GS, y = gy * GS, j = (gy * gw + gx) * 3; G[j] = nz.fbm2(x * 0.006, y * 0.006, 4); G[j + 1] = nz.fbm2(x * 0.035, y * 0.028, 2); G[j + 2] = 0.5 + 0.5 * nz.n2(x * 0.01 + 40, y * 0.01); }
    for (let y = 0; y < H_; y++) {
      const gy = (y / GS) | 0, fy = (y % GS) / GS;
      for (let x = 0; x < W; x++) {
        const gx = (x / GS) | 0, fx = (x % GS) / GS, j00 = (gy * gw + gx) * 3, j01 = j00 + 3, j10 = j00 + gw * 3, j11 = j10 + 3;
        const bl = (c) => (G[j00 + c] * (1 - fx) + G[j01 + c] * fx) * (1 - fy) + (G[j10 + c] * (1 - fx) + G[j11 + c] * fx) * fy;
        const cl = bl(0), md = bl(1), streak = nz.n2(x * 0.16, y * 0.035) * bl(2);
        let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
        const v = 1 + cl * 0.045 + md * 0.018 + streak * 0.022 + ((h >>> 0) / 4294967296 - 0.5) * 0.035, warm = cl * 6, i = (y * W + x) * 4;
        d[i] = PAPER[0] * v + warm; d[i + 1] = PAPER[1] * v + warm * 0.4; d[i + 2] = PAPER[2] * v - warm * 0.6; d[i + 3] = 255;
      }
    }
    px.putImageData(img, 0, 0);
  };
  let HP = null; // hero paper cache

  // each glyph/ornament is a separate "block": colour encodes (id, density, grain phase)
  let nextId = 1, CT = 0;
  // timing: a block is invisible (but still consumes its random draws) until pressed, then lands with a small 'kiss'
  const stamp = (x, t0) => { x.globalAlpha = CT >= t0 ? 1 : 0; return 1 + 0.14 * (1 - H.ease.out(H.clamp((CT - t0) / 0.1))); };
  const blockStyle = (r, dens, grain) => `rgb(${(nextId++ % 250) + 1},${Math.round(dens * 255)},${grain ? Math.round(r.range(30, 255)) : 0})`;

  const setType = (x, r, text, font, cx, baseline, targetW, capH, opt = {}) => {
    const sp = opt.spacing || 0, grain = opt.grain !== false;
    x.font = `${font.split('|')[0]} 200px ${font.split('|')[1]}`;
    const capM = x.measureText('H'), cap = capM.actualBoundingBoxAscent;
    const ws = [...text].map((ch) => x.measureText(ch).width);
    const total = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    const sx = targetW / total, sy = capH / cap;
    let acc = cx - targetW / 2;
    [...text].forEach((ch, i) => {
      const w = ws[i] * sx;
      if (ch !== ' ') {
        x.save();
        const k = stamp(x, (opt.t0 ?? 0) + i * (opt.dt ?? 0));
        x.translate(acc + w / 2, baseline + r.range(-1.6, 1.6) * (opt.jit ?? 1));
        x.rotate(r.range(-0.006, 0.006) * (opt.jit ?? 1)); x.translate(0, -capH / 2); x.scale(k, k); x.translate(0, capH / 2); x.scale(sx, sy);
        x.fillStyle = blockStyle(r, r.range(0.72, 1), grain);
        x.textAlign = 'center'; x.textBaseline = 'alphabetic';
        x.fillText(ch, 0, 0);
        x.restore();
      }
      x.globalAlpha = 1;
      acc += w + sp * sx;
    });
  };

  const rule = (x, r, x0, x1, y, h, t0 = 0) => { x.fillStyle = blockStyle(r, r.range(0.85, 1), false); stamp(x, t0); x.fillRect(x0, y, x1 - x0, h); x.globalAlpha = 1; };
  const diamond = (x, r, cx, cy, s0, t0 = 0) => { x.fillStyle = blockStyle(r, r.range(0.8, 1), false); const s = s0 * stamp(x, t0); x.beginPath(); x.moveTo(cx, cy - s); x.lineTo(cx + s * 0.7, cy); x.lineTo(cx, cy + s); x.lineTo(cx - s * 0.7, cy); x.closePath(); x.fill(); x.globalAlpha = 1; };
  const star = (x, r, cx, cy, s0, t0 = 0) => { x.fillStyle = blockStyle(r, r.range(0.8, 1), false); const s = s0 * stamp(x, t0); x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? s * 0.42 : s; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); x.globalAlpha = 1; };
  const gear = (x, r, cx, cy, R0, teeth, rot, t0 = 0) => {
    x.fillStyle = blockStyle(r, r.range(0.85, 1), true);
    const R = R0 * stamp(x, t0);
    x.beginPath();
    for (let i = 0; i < teeth * 4; i++) {
      const a = rot + (i / (teeth * 4)) * Math.PI * 2, q = i % 4, rr = q === 0 || q === 1 ? R : R * 0.8;
      x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    x.closePath();
    x.moveTo(cx + R * 0.32, cy); x.arc(cx, cy, R * 0.32, 0, Math.PI * 2, true);
    x.fill('evenodd');
    // spokes cut-outs
    x.save(); x.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 4; i++) { const a = rot + i * Math.PI / 2 + Math.PI / 4; x.beginPath(); x.arc(cx + Math.cos(a) * R * 0.52, cy + Math.sin(a) * R * 0.52, R * 0.13, 0, 7); x.fill(); }
    x.restore(); x.globalAlpha = 1;
  };

  // ================= EXPLAINER: five proofs pulled off the press, one per beat =================
  const XE2 = H.ease, xcl = H.clamp, xseg = (t, a, b) => xcl((t - a) / (b - a));
  const SHEETS = [0, 2.3, 5.95, 10.45, 12.85], SWAP = 0.6;
  let LPX = null;
  const lph = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  const fmtC = (n) => Math.round(n).toLocaleString('en-US');

  // a stock cut (engraved block) of a cat or dog: black silhouette with white cuts
  const stockCut = (x, r, kind, cx, cy, s, t0) => {
    x.fillStyle = blockStyle(r, r.range(0.85, 1), true); const k = stamp(x, t0);
    x.save(); x.translate(cx, cy); x.scale(s * k / 100, s * k / 100);
    x.beginPath(); x.roundRect(-50, -50, 100, 100, 6); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.lineWidth = 5; x.strokeRect(-43, -43, 86, 86);
    x.beginPath(); x.arc(0, 4, 28, 0, 7); x.fill();
    if (kind === 'cat') { x.beginPath(); x.moveTo(-26, -6); x.lineTo(-22, -38); x.lineTo(-4, -22); x.closePath(); x.moveTo(26, -6); x.lineTo(22, -38); x.lineTo(4, -22); x.closePath(); x.fill(); }
    if (kind === 'dog') { // a proper reversed cut: long lop ears hang outside the head, all cut from the block
      for (const sg of [-1, 1]) { x.save(); x.translate(sg * 29, 8); x.rotate(-sg * 0.22); x.beginPath(); x.ellipse(0, 0, 10, 24, 0, 0, 7); x.fill(); x.restore(); }
    }
    x.globalCompositeOperation = 'source-over';
    if (kind === 'dog') { // engraved lines left standing: ear seams, muzzle outline, mouth
      x.strokeStyle = x.fillStyle; x.lineCap = 'round'; x.lineWidth = 3.2;
      for (const sg of [-1, 1]) { const c0 = sg > 0 ? 0 : Math.PI; x.beginPath(); x.arc(0, 4, 28, c0 - 0.95, c0 + 0.95); x.stroke(); }
      x.lineWidth = 2.6; x.beginPath(); x.ellipse(0, 15, 12, 9, 0, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
      x.beginPath(); x.moveTo(0, 14); x.lineTo(0, 19); x.stroke();
    }
    x.beginPath(); x.arc(-10, 0, 4, 0, 7); x.arc(10, 0, 4, 0, 7); x.fill(); x.beginPath(); x.ellipse(0, kind === 'dog' ? 11 : 12, kind === 'dog' ? 6.5 : 5, kind === 'dog' ? 4.5 : 3.5, 0, 0, 7); x.fill();
    if (kind === 'cat') { x.lineWidth = 2.5; x.strokeStyle = x.fillStyle; x.beginPath(); for (const sg of [-1, 1]) { x.moveTo(sg * 8, 16); x.lineTo(sg * 26, 13); x.moveTo(sg * 8, 20); x.lineTo(sg * 25, 23); } x.stroke(); }
    x.restore(); x.globalAlpha = 1;
  };
  // an arrow assembled from short rule pieces locked up one after another (draws on)
  const dashArrow = (x, r, P, t0, dur, n = 12, w = 7) => {
    for (let i = 0; i < n; i++) {
      const s0 = i / n, s1 = (i + 0.62) / n, a = P(s0), b = P(s1);
      x.fillStyle = blockStyle(r, r.range(0.85, 1), false); stamp(x, t0 + dur * (i / n));
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      x.save(); x.translate(a[0], a[1]); x.rotate(ang); x.fillRect(0, -w / 2, len, w); x.restore();
    }
    const e = P(1), p = P(0.97), ang = Math.atan2(e[1] - p[1], e[0] - p[0]);
    x.fillStyle = blockStyle(r, 1, false); stamp(x, t0 + dur);
    x.save(); x.translate(e[0], e[1]); x.rotate(ang); x.beginPath(); x.moveTo(w * 2.4, 0); x.lineTo(-w * 1.6, -w * 2.2); x.lineTo(-w * 1.6, w * 2.2); x.closePath(); x.fill(); x.restore();
    x.globalAlpha = 1;
  };
  const qP = (x0, y0, cx, cy, x1, y1) => (s) => [(1 - s) * (1 - s) * x0 + 2 * (1 - s) * s * cx + s * s * x1, (1 - s) * (1 - s) * y0 + 2 * (1 - s) * s * cy + s * s * y1];
  const runningHead = (b, rd, r, T0) => {
    setType(rd, r, 'HOW DOES AI LEARN?', '400|"Rubik Mono One"', 640, 56, 520, 22, { spacing: 22, grain: false, jit: 0.3, t0: T0 + 0.05 });
    rule(b, r, 58, 1222, 22, 5, T0); rule(b, r, 58, 1222, 72, 2, T0 + 0.05);
  };

  // build the forme for sheet si at time t: black into b, red into rd
  const forme = (si, b, rd, t) => {
    const r = H.rng(500 + si * 37), rc = H.rng(900 + si);
    const T0 = SHEETS[si] + (si ? SWAP * 0.6 : 0.1);
    const stepT = (a, z) => Math.floor(xcl(t, a, z) * 6) / 6; // counters re-set and re-stamped 6x a second
    if (si === 0) {
      rule(b, r, 58, 1222, 40, 8, 0.1); rule(b, r, 58, 1222, 54, 2.5, 0.15);
      setType(b, r, 'HOW DOES', '400|"Anton"', 640, 300, 900, 190, { spacing: 10, t0: 0.25, dt: 0.09 });
      setType(rd, r, 'AI LEARN?', '400|"Abril Fatface"', 640, 520, 820, 150, { spacing: 6, t0: 1.05, dt: 0.07 });
      rule(b, r, 58, 1222, 650, 2.5, 1.7); rule(b, r, 58, 1222, 660, 8, 1.72);
    }
    if (si === 1) {
      runningHead(b, rd, r, T0);
      [['cat', 160, 230], ['dog', 330, 230], ['dog', 160, 440], ['cat', 330, 440]].forEach(([kind, cx, cy], i) => {
        stockCut(b, r, kind, cx, cy, 140, T0 + 0.35 + i * 0.32);
        setType(rd, r, kind.toUpperCase(), '400|"Bebas Neue"', cx, cy + 106, 70, 30, { grain: false, spacing: 8, t0: T0 + 0.5 + i * 0.32, jit: 0.3 });
      });
      dashArrow(b, r, qP(440, 335, 560, 300, 700, 335), T0 + 1.3, 0.55);
      // examples stepping along the arrow into the model, re-set on every move (stop-motion conveyor)
      if (t > T0 + 1.9 && t < 5.7) { const ph = Math.floor((t - T0 - 1.9) * 5); [0.2, 0.5, 0.8].forEach((u, j) => { const q = qP(440, 300, 560, 265, 700, 300)(u); const kind = (ph + j) % 3 === 1 ? 'dog' : 'cat'; stockCut(b, H.rng(ph * 7 + j), kind, q[0], q[1] - 20, 60 - j * 8, 0); }); }
      gear(b, r, 900, 320, 105, 12, 0.2 + t * 0.8, T0 + 1.0); gear(b, r, 1045, 215, 50, 9, -0.1 - t * 1.6, T0 + 1.1);
      setType(rd, r, 'THE MODEL', '400|"Rubik Mono One"', 920, 480, 260, 24, { grain: false, spacing: 12, t0: T0 + 1.15, jit: 0.3 });
      const st = stepT(T0 + 1.1, 5.6), v = 1e6 * Math.pow(xseg(st, T0 + 1.1, 5.3), 2.3);
      if (t > T0 + 1.1) { const s = fmtC(v); setType(b, rc, s, '400|"Anton"', 820, 640, s.length * 42, 80, { spacing: 6, t0: st, jit: 0.5 }); }
      setType(rd, r, 'EXAMPLES', '400|"Bebas Neue"', 820, 690, 200, 32, { spacing: 10, grain: false, t0: T0 + 1.2, jit: 0.3 });
    }
    if (si === 2) {
      runningHead(b, rd, r, T0);
      const right = t > 9.15;
      stockCut(b, r, 'cat', 170, 330, 170, T0 + 0.3);
      setType(rd, r, 'NEW PICTURE', '400|"Bebas Neue"', 170, 460, 170, 30, { spacing: 6, grain: false, t0: T0 + 0.4, jit: 0.3 });
      dashArrow(b, r, qP(280, 330, 340, 300, 400, 330), T0 + 0.55, 0.3, 6);
      setType(b, r, 'GUESS', '400|"Bebas Neue"', 600, 180, 160, 40, { spacing: 8, grain: false, t0: T0 + 0.6 });
      if (!right) setType(b, r, 'DOG?', '400|"Anton"', 600, 390, 300, 150, { spacing: 8, t0: T0 + 0.85, dt: 0.06 });
      else setType(b, rc, 'CAT', '400|"Anton"', 600, 390, 260, 150, { spacing: 8, t0: 9.15, dt: 0.06 });
      dashArrow(b, r, qP(780, 330, 840, 300, 900, 330), T0 + 1.25, 0.3, 6);
      setType(b, r, 'CHECK', '400|"Bebas Neue"', 1060, 180, 160, 40, { spacing: 8, grain: false, t0: T0 + 1.35 });
      setType(rd, r, right ? 'RIGHT!' : "IT'S A CAT", '400|"Bebas Neue"', 1060, 350, right ? 200 : 250, 60, { spacing: 6, t0: right ? 9.3 : T0 + 1.5 });
      // emphasis: a rubber-stamp overprint across the wrong guess
      if (!right && t > 7.75) {
        rd.save(); rd.translate(640, 440); rd.rotate(-0.14);
        const k = 0.75 * stamp(rd, 7.75) * (1 + 0.25 * (1 - XE2.out(xseg(t, 7.75, 7.95))));
        rd.scale(k, k); rd.fillStyle = blockStyle(r, 0.85, false); rd.lineWidth = 10; rd.strokeStyle = rd.fillStyle; rd.strokeRect(-190, -62, 380, 124);
        rd.font = '400 92px "Rubik Mono One"'; rd.textAlign = 'center'; rd.textBaseline = 'middle'; rd.fillText('WRONG', 0, 6); rd.restore(); rd.globalAlpha = 1;
      }
      // ADJUST: the return path set as a curve of rule pieces, gears turning
      dashArrow(b, r, qP(1060, 420, 1000, 600, 720, 560), 8.05, 0.45, 12);
      setType(b, r, 'ADJUST', '400|"Bebas Neue"', 960, 640, 190, 46, { spacing: 8, grain: false, t0: 8.3 });
      const turn = XE2.inOut(xseg(t, 8.35, 9.0)) * 3;
      gear(b, r, 560, 545, 55, 10, 0.2 + turn, 8.25); gear(b, r, 640, 600, 32, 8, -0.3 - turn * 1.7, 8.32);
      if (right) { rd.fillStyle = blockStyle(r, 1, false); const k = stamp(rd, 9.3); rd.save(); rd.translate(1060, 260); rd.scale(k, k); rd.lineWidth = 16; rd.lineCap = 'butt'; rd.lineJoin = 'miter'; rd.strokeStyle = rd.fillStyle; rd.beginPath(); rd.moveTo(-34, 0); rd.lineTo(-10, 26); rd.lineTo(38, -32); rd.stroke(); rd.restore(); rd.globalAlpha = 1; }
    }
    if (si === 3) {
      runningHead(b, rd, r, T0);
      // bar chart built from stacked square blocks, locked up course by course
      const target = [61, 70, 78, 84, 89, 93, 95, 97];
      for (let c = 0; c < 8; c++) {
        const nb = Math.round((target[c] - 50) / 4);
        for (let j = 0; j < nb; j++) {
          const tt = T0 + 0.3 + c * 0.17 + j * 0.022, x0 = 110 + c * 64, y0 = 560 - (j + 1) * 34;
          (c >= 6 ? rd : b).fillStyle = blockStyle(r, r.range(0.85, 1), false); stamp(c >= 6 ? rd : b, tt);
          (c >= 6 ? rd : b).fillRect(x0, y0 + 3, 50, 28); (c >= 6 ? rd : b).globalAlpha = 1;
        }
      }
      rule(b, r, 96, 640, 566, 5, T0 + 0.2);
      setType(b, r, 'TRAINING ROUNDS', '400|"Bebas Neue"', 368, 610, 300, 30, { spacing: 8, grain: false, t0: T0 + 0.25 });
      setType(rd, r, 'ACCURACY', '400|"Rubik Mono One"', 960, 200, 330, 32, { spacing: 18, grain: false, t0: T0 + 0.3 });
      const st = stepT(T0 + 0.35, 12.05), v = Math.round(61 + 36 * XE2.inOut(xseg(st, T0 + 0.35, 12.05)));
      setType(b, rc, v + '%', '400|"Anton"', 960, 440, 380, 200, { spacing: 8, t0: st, jit: 0.4 });
      if (t > 12.1) { rule(rd, r, 770, 1150, 470, 10, 12.1); rule(rd, r, 770, 1150, 486, 3, 12.15); [[760, 250], [1160, 250], [760, 410], [1160, 410]].forEach(([a, c2], i) => star(rd, r, a, c2, 22, 12.2 + i * 0.06)); }
    }
    if (si === 4) {
      runningHead(b, rd, r, T0);
      setType(b, r, 'MORE EXAMPLES', '400|"Anton"', 640, 270, 1060, 150, { spacing: 8, t0: T0 + 0.1, dt: 0.025 });
      dashArrow(b, r, qP(640, 300, 640, 330, 640, 380), T0 + 0.45, 0.15, 3, 12);
      setType(rd, r, 'BETTER GUESSES', '400|"Abril Fatface"', 640, 560, 1000, 120, { spacing: 4, t0: T0 + 0.6, dt: 0.025 });
      for (let i = 0; i < 17; i++) diamond(rd, r, 640 + (i - 8) * 34, 640, i % 2 ? 5 : 8, T0 + 1.05 + Math.abs(i - 8) * 0.02);
    }
  };

  const printSheet = (W, H_, si, t) => {
    if (!LPX) {
      const pc = H.layer(W, H_), px = pc.getContext('2d'), r = H.rng(2026);
      paperBase(px, W, H_);
      for (let i = 0; i < 260; i++) { const x0 = r.range(0, W), y0 = r.range(0, H_), a = r.range(0, 6.28), l = r.range(4, 22); px.strokeStyle = `rgba(${r.chance(0.5) ? '120,95,60' : '255,250,235'},${r.range(0.1, 0.3)})`; px.lineWidth = r.range(0.4, 1.1); px.beginPath(); px.moveTo(x0, y0); px.quadraticCurveTo(x0 + Math.cos(a + 0.5) * l * 0.6, y0 + Math.sin(a + 0.5) * l * 0.6, x0 + Math.cos(a) * l, y0 + Math.sin(a) * l); px.stroke(); }
      H.vignette(px, W, H_, 0.18, '120,85,40');
      const nz = H.makeNoise(33), GW = 427, GH = 240, fld = new Float32Array(GW * GH * 3);
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { const j = (y * GW + x) * 3; fld[j] = nz.fbm2(x * 0.05, y * 0.05, 3); fld[j + 1] = nz.fbm2(x * 0.6, y * 0.6, 2); fld[j + 2] = nz.fbm2(x * 0.012, y * 0.35, 2); }
      LPX = { paper: px.getImageData(0, 0, W, H_).data, fld, GW, GH, nz };
    }
    const { paper, fld, GW, GH, nz } = LPX;
    nextId = 1; CT = t;
    const blk = H.layer(W, H_), b = blk.getContext('2d'), red = H.layer(W, H_), rd = red.getContext('2d');
    forme(si, b, rd, t);
    const redShift = H.layer(W, H_), rs = redShift.getContext('2d'); rs.translate(W / 2, H_ / 2); rs.rotate([0.0015, -0.0011, 0.0013, -0.0015, 0.0009][si]); rs.translate(-W / 2, -H_ / 2); rs.drawImage(red, 2.5, -1.5);
    const bk = b.getImageData(0, 0, W, H_).data, rk = rs.getImageData(0, 0, W, H_).data;
    const blurOf = (c, px) => { const o = H.layer(W, H_), ox = o.getContext('2d'); ox.filter = `blur(${px}px)`; ox.drawImage(c, 0, 0); return ox.getImageData(0, 0, W, H_).data; };
    const both = H.layer(W, H_), bx = both.getContext('2d'); bx.drawImage(blk, 0, 0); bx.drawImage(redShift, 0, 0);
    const bb = blurOf(both, 2.2), bkB = blurOf(blk, 1.6), rkB = blurOf(redShift, 1.6);
    const samp = (x, y, c) => fld[(((y * GH / H_) | 0) * GW + ((x * GW / W) | 0)) * 3 + c];
    const inkPass = (i, x, y, m, mB, s) => {
      const a = m[i + 3] / 255; if (a < 0.02) return 0;
      const dens0 = m[i + 1] / 255, phase = m[i + 2] / 255, broad = samp(x, y, 0), fine = samp(x, y, 1), ab = mB[i + 3] / 255;
      let cov = xcl((Math.min(a, ab * 1.15) - (0.5 + fine * 0.45 + (lph(x, y, s) - 0.5) * 0.2)) * 2.6 + 0.5);
      if (cov <= 0) return 0;
      let dens = (0.25 + dens0 * 0.85) * (0.97 + broad * 0.22) + (lph(x, y, s + 1) - 0.5) * 0.08;
      const sq = xcl((a - ab) * 3.5); // ink squeezed to the rim of the block
      if (phase > 0) { const gv = Math.sin((y + samp(x, y, 2) * 40 + phase * 30) * 0.9 + Math.sin(x * 0.01 + phase * 9) * 2.5); dens *= 1 - 0.3 * H.smooth(0.55, 1, gv * 0.5 + nz.n2(x * 0.004 + phase * 7, y * 0.22) * 0.8); }
      if (lph(x, y, s + 2) < 0.004 + Math.max(0, -broad - 0.15) * 0.35 + Math.max(0, fine - 0.3) * 0.2) dens *= 0.25;
      dens = dens * (1 - sq * 0.5) + sq * 0.5 * Math.max(dens, 1.06) + sq * 0.12;
      return cov * xcl(dens);
    };
    const out = new ImageData(W, H_), d = out.data;
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      let cr = paper[i], cg = paper[i + 1], cb = paper[i + 2];
      const gA = (y > 2 && y < H_ - 3 && x > 2 && x < W - 3) ? bb[i + 3 + (W + 1) * 8] - bb[i + 3 - (W + 1) * 8] : 0;
      // directional bite: shadowed upper-left wall, only a soft light on the lower-right (no pale all-round halo)
      const k = (1 - Math.max(gA, 0) / 255 * 0.14 - Math.min(gA, 0) / 255 * 0.04) * (1 - (bb[i + 3] / 255) * 0.05); cr *= k; cg *= k; cb *= k;
      const cR = inkPass(i, x, y, rk, rkB, 10);
      if (cR) { cr *= 1 - cR * (1 - INKS.red[0] / 255); cg *= 1 - cR * (1 - INKS.red[1] / 255); cb *= 1 - cR * (1 - INKS.red[2] / 255); }
      const cK = inkPass(i, x, y, bk, bkB, 20);
      if (cK) { cr = cr * (1 - cK) + INKS.black[0] * cK; cg = cg * (1 - cK) + INKS.black[1] * cK; cb = cb * (1 - cK) + INKS.black[2] * cK; }
      d[i] = cr; d[i + 1] = cg; d[i + 2] = cb; d[i + 3] = 255;
    }
    const c = H.layer(W, H_); c.getContext('2d').putImageData(out, 0, 0);
    return c;
  };

  const lpExplainer = (ctx, W, H_, t) => {
    let cur = 0; for (let i = 0; i < SHEETS.length; i++) if (t >= SHEETS[i]) cur = i;
    const sw = cur > 0 ? xseg(t, SHEETS[cur], SHEETS[cur] + SWAP) : 1;
    ctx.fillStyle = '#26221e'; ctx.fillRect(0, 0, W, H_); // the press bed
    // fresh sheet already on the bed, drops the last few px as it is laid down
    const drop = 1 - XE2.out(sw);
    ctx.save(); ctx.translate(W / 2, H_ / 2); ctx.scale(1 - drop * 0.03, 1 - drop * 0.03); ctx.translate(-W / 2, -H_ / 2);
    ctx.drawImage(printSheet(W, H_, cur, t), 0, 0); ctx.restore();
    if (sw < 1) {
      // the finished proof is lifted off the forme and carried away
      const u = XE2.in(sw), old = printSheet(W, H_, cur - 1, SHEETS[cur] - 0.001);
      ctx.save(); ctx.translate(W / 2 - u * 1500, H_ / 2 - u * 260); ctx.rotate(-u * 0.12); ctx.scale(1 + u * 0.04, 1 + u * 0.04);
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30 * u + 4; ctx.shadowOffsetY = 18 * u + 2;
      ctx.drawImage(old, -W / 2, -H_ / 2); ctx.restore();
    }
  };

  registerStyle({
    id: 'letterpress',
    name: 'Wood Type Letterpress',
    category: 'Print',
    description: 'A two-ink wood-type broadside on cream stock: mixed display faces set block by block, each letter inked a little differently, wood grain and worn edges in the solids, ink squeezed to the rims and the whole forme bitten into the paper.',
    motion: 'The forme is proofed block by block — rules first, then each wood letter lands with a heavy kiss of the platen, red and black alternating down the sheet — and the gears keep turning as the impression deepens.',
    fonts: ['400 200px "Anton"', '400 200px "Abril Fatface"', '400 200px "Rubik Mono One"', '400 200px "Bebas Neue"'],
    duration: 5,
    frameT: 4.8,
    readsPixels: true,
    explainerDuration: 15.5,
    explainerNote: 'Every beat is a new proof: the finished sheet is lifted off the press and a fresh one is laid down, then wood type, stock cuts of a cat and a dog, and arrows set from short rule pieces lock up block by block with a kiss of the platen; counters are re-set and re-stamped six times a second, and the wrong guess gets a red rubber-stamp WRONG.',
    explainer(ctx, W, H_, t) { lpExplainer(ctx, W, H_, t); },
    // Sound: a hand press in a print shop. Every block that locks up gets a wooden "kiss" of the platen (letters,
    // stock cuts, rules), rule-piece arrows tick together piece by piece, counters re-stamp on their 6 fps steps,
    // the bar chart rattles up in stacks of quoins, each new sheet is peeled off the forme and a fresh one laid
    // down, WRONG is a rubber stamp, and the big moments are the full weight of the press.
    // Timings mirror SHEETS / SWAP / forme() above (T0 = SHEETS[si] + SWAP*0.6, per-block t0s, stepT on sixths).
    // Voiceover mode: room bed drops; per-letter kisses, rule pieces, counter re-stamps and small labels are minor.
    explainerSound(k) {
      const D = 15.5, T0 = (si) => SHEETS[si] + (si ? SWAP * 0.6 : 0.1);
      const pan = (px) => xcl((px / 1280) * 2 - 1, -1, 1) * 0.6;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // the platen kisses a wood block: short woody thunk, heavier for big blocks
      const kiss = (t, g, p, minor) => {
        const o = { minor: !!minor };
        k.tone(t, { ...o, f: [[0, 150], [0.05, 72]], dur: 0.08, gain: 0.3 * g, pan: p });
        k.noise(t, { ...o, dur: 0.04, filter: 'bandpass', f: 650, q: 1.2, gain: 0.3 * g, a: 0.001, pan: p });
        k.noise(t, { ...o, dur: 0.01, filter: 'bandpass', f: 1800, q: 1, gain: 0.08 * g, a: 0.001, pan: p });
      };
      const word = (t0, dt, n, g, x0, x1) => { for (let i = 0; i < n; i++) kiss(t0 + i * dt, g, pan(x0 + (x1 - x0) * (i / Math.max(1, n - 1))), true); };
      // a metal rule piece dropped into the chase: tiny dry tick
      const piece = (t, g, p) => k.noise(t, { minor: true, dur: 0.015, filter: 'bandpass', f: 1500, q: 1.5, gain: 0.22 * g, a: 0.001, pan: p });
      const arrow = (t0, dur, n, p0, p1) => { for (let i = 0; i < n; i += n > 6 ? 2 : 1) piece(t0 + dur * (i / n), 0.9, p0 + (p1 - p0) * (i / n)); kiss(t0 + dur, 0.55, p1, true); };
      // proof off, fresh sheet on: tacky peel, the sheet carried away, the next one settling on the bed
      const swap = (t) => {
        k.withMinor(() => { for (let x = 0; x < 0.16; x += 0.012) k.noise(t + x, { dur: 0.006, filter: 'bandpass', f: 1700, q: 1, gain: 0.14 * (1 - x / 0.16), a: 0.001, pan: -0.2 }); });
        k.play('paper', t + 0.05, { dur: 0.45, gain: 1.1, pan: -0.4 });
        k.noise(t + 0.05, { dur: 0.45, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.45, 1100]], q: 0.7, gain: 0.14, a: 0.15, pan: -0.5 }); // air of the sheet carried off
        k.noise(t + 0.3, { dur: 0.25, color: 'pink', filter: 'lowpass', f: [[0, 900], [0.25, 300]], gain: 0.16, a: 0.03 });
        k.play('slap', t + 0.24, { gain: 0.3 }); // fresh sheet settles on the bed
      };

      k.bed('room', 0, D, { gain: 0.22 });

      // ---- sheet 1: HOOK. rules, HOW DOES (dt .09, space skipped), AI LEARN? in red (dt .07), closing rules
      kiss(0.1, 0.7, 0); kiss(0.15, 0.4, 0, true);
      [0, 1, 2, 4, 5, 6, 7].forEach((i) => kiss(0.25 + i * 0.09, 0.85, pan(190 + i * 129), true));
      [0, 1, 3, 4, 5, 6, 7, 8].forEach((i) => kiss(1.05 + i * 0.07, 0.85, pan(230 + i * 102), true));
      k.play('press', 1.7, { gain: 0.55 }); // closing rules lock the forme up

      // ---- sheet 2: DATA
      swap(SHEETS[1]);
      kiss(T0(1), 0.6, 0); // running head
      for (let i = 0; i < 4; i++) { kiss(T0(1) + 0.35 + i * 0.32, 1.0, pan(i % 2 ? 330 : 160)); kiss(T0(1) + 0.5 + i * 0.32, 0.4, pan(i % 2 ? 330 : 160), true); } // stock cuts + labels
      kiss(T0(1) + 1.0, 1.0, pan(900)); kiss(T0(1) + 1.1, 0.6, pan(1045), true); // the model's gears
      kiss(T0(1) + 1.15, 0.45, pan(920), true); // THE MODEL
      arrow(T0(1) + 1.3, 0.55, 12, pan(440), pan(700));
      // counter re-set on sixths of a second from 3.83 to 5.5; 1,000,000 first lands on the 5.333 step
      for (let n = Math.ceil((T0(1) + 1.1) * 6); n <= 33; n++) { const t = n / 6; if (Math.abs(t - 32 / 6) < 1e-6) continue; kiss(t, 0.5, pan(820), true); }
      k.play('press', 32 / 6, { gain: 0.85, pan: pan(820) }); // 1,000,000

      // ---- sheet 3: GUESS / CHECK
      swap(SHEETS[2]);
      kiss(T0(2), 0.6, 0);
      kiss(T0(2) + 0.3, 1.0, pan(170)); // cat cut
      kiss(T0(2) + 0.4, 0.4, pan(170), true); // NEW PICTURE
      arrow(T0(2) + 0.55, 0.3, 6, pan(280), pan(400));
      kiss(T0(2) + 0.6, 0.45, pan(600), true); // GUESS
      word(T0(2) + 0.85, 0.06, 4, 0.9, 480, 720); // DOG?
      arrow(T0(2) + 1.25, 0.3, 6, pan(780), pan(900));
      kiss(T0(2) + 1.35, 0.45, pan(1060), true); // CHECK
      kiss(T0(2) + 1.5, 0.6, pan(1060), true); // IT'S A CAT
      k.play('stamp', 7.75, { gain: 0.95, pan: pan(640) }); // red rubber-stamp WRONG
      k.play('error', 7.93, { f: 'E3', gain: 0.7, pan: pan(640) });
      arrow(8.05, 0.45, 12, pan(1060), pan(720));
      kiss(8.25, 0.8, pan(560)); kiss(8.32, 0.5, pan(640), true); // gears
      kiss(8.3, 0.45, pan(960), true); // ADJUST
      for (let i = 1; i <= 3; i++) k.play('tock', when(8.35, 9.0, XE2.inOut, (i - 0.5) / 3), { f: 420 + i * 20, gain: 0.32, pan: pan(600), minor: true }); // gears turn
      word(9.15, 0.06, 3, 1.0, 500, 700); // CAT re-set
      kiss(9.3, 0.7, pan(1060));
      k.play('success', 9.38, { f: 'C5', gain: 0.55, pan: pan(1060) }); // RIGHT! + tick

      // ---- sheet 4: ACCURACY
      swap(SHEETS[3]);
      kiss(T0(3), 0.6, 0);
      kiss(T0(3) + 0.2, 0.5, pan(368), true); kiss(T0(3) + 0.3, 0.45, pan(960), true); // base rule / ACCURACY
      // each bar is a stack of blocks locked up 22 ms apart: one short rattle per column
      [3, 5, 7, 9, 10, 11, 11, 12].forEach((nb, c) => { const t0 = T0(3) + 0.3 + c * 0.17, p = pan(135 + c * 64); kiss(t0, 0.6, p, true); for (let j = 1; j < nb; j += 2) piece(t0 + j * 0.022, 0.7, p); });
      for (let n = Math.ceil((T0(3) + 0.35) * 6); n <= 72; n++) kiss(n / 6, 0.45, pan(960), true); // % re-stamped on sixths
      // 97%: the red rules bite in under it, stars follow. The biggest hit: full weight of the press
      k.play('impact', 12.1, { gain: 1.1, pan: pan(960) });
      k.play('press', 12.1, { gain: 1.0, pan: pan(960) });
      [12.2, 12.26, 12.32, 12.38].forEach((t, i) => kiss(t, 0.45, pan(i % 2 ? 1160 : 760), true));

      // ---- sheet 5: TAKEAWAY
      swap(SHEETS[4]);
      kiss(T0(4), 0.6, 0);
      kiss(T0(4) + 0.1, 0.9, pan(200)); for (let i = 2; i < 13; i += 2) kiss(T0(4) + 0.1 + i * 0.025, 0.55, pan(200 + i * 75), true); // MORE EXAMPLES runs in
      arrow(T0(4) + 0.45, 0.15, 3, 0, 0);
      kiss(T0(4) + 0.6, 0.9, pan(200)); for (let i = 2; i < 14; i += 2) kiss(T0(4) + 0.6 + i * 0.025, 0.55, pan(200 + i * 68), true); // BETTER GUESSES
      k.play('press', T0(4) + 0.95, { gain: 0.6 }); // the takeaway is locked up
      ['C4', 'G4', 'C5', 'E5'].forEach((f, i) => k.play('ding', T0(4) + 1.08 + i * 0.06, { f, gain: 0.36 - i * 0.05, pan: (i - 1.5) * 0.2 }));
      for (let i = 0; i <= 8; i += 2) { const t = T0(4) + 1.05 + i * 0.02; piece(t, 0.6, -i * 0.05); piece(t, 0.6, i * 0.05); } // diamond ornaments, centre out
    },
    draw(ctx, W, H_, t) {
      nextId = 1; CT = t;
      const r = H.rng(2026);
      const press = 0.35 + 0.65 * H.ease.out(H.clamp((t - 0.2) / 3.4)); // impression strength ramps in
      const blk = H.layer(W, H_), b = blk.getContext('2d');
      const red = H.layer(W, H_), rd = red.getContext('2d');
      const L = 58, R = 1222;

      // ---- black forme ----
      rule(b, r, L, R, 28, 8, 0.12); rule(b, r, L, R, 42, 2.5, 0.18);
      setType(b, r, 'THINKING', '400|"Anton"', 640, 318, 1110, 196, { spacing: 10, t0: 0.85, dt: 0.1 });
      setType(b, r, 'LIVE DEMONSTRATION', '400|"Bebas Neue"', 640, 552, 800, 54, { spacing: 18, jit: 0.6, t0: 2.45, dt: 0.025 });
      gear(b, r, 218, 398, 48, 10, 0.2 + t * 0.3, 2.28); gear(b, r, 1062, 398, 48, 10, -0.1 - t * 0.3, 2.28);
      gear(b, r, 162, 432, 24, 8, 0.5 - t * 0.6, 2.36); gear(b, r, 1118, 432, 24, 8, 0.1 + t * 0.6, 2.36);
      rule(b, r, L, R, 666, 2.5, 3.5); rule(b, r, L, R, 676, 8, 3.44);
      // thin side rules with diamond terminals framing 'LIVE DEMONSTRATION'
      rule(b, r, L + 10, 220, 525, 2, 2.42); rule(b, r, 1060, R - 10, 525, 2, 2.42);

      // ---- red forme ----
      setType(rd, r, 'NOW SHOWING', '400|"Rubik Mono One"', 640, 98, 420, 25, { spacing: 30, grain: false, jit: 0.4, t0: 0.38, dt: 0.035 });
      star(rd, r, 392, 86, 15, 0.32); star(rd, r, 888, 86, 15, 0.76);
      setType(rd, r, 'MACHINES', '400|"Abril Fatface"', 640, 448, 680, 98, { spacing: 6, t0: 1.75, dt: 0.065 });
      for (let i = 0; i < 17; i++) diamond(rd, r, 640 + (i - 8) * 34, 590, i % 2 ? 5 : 8, 2.92 + Math.abs(i - 8) * 0.03);
      setType(rd, r, 'ADMISSION FREE', '400|"Rubik Mono One"', 640, 638, 360, 20, { spacing: 24, grain: false, jit: 0.4, t0: 3.2, dt: 0.02 });
      diamond(rd, r, 230, 525, 8, 2.5); diamond(rd, r, 1050, 525, 8, 2.5);
      rule(rd, r, L, R, 15, 4, 0.24); rule(rd, r, L, R, 689, 4, 3.56);

      // ---- paper (static: built once, the random draws are still consumed so everything after is unchanged) ----
      const fib = [], fox = [];
      for (let i = 0; i < 260; i++) fib.push([r.range(0, W), r.range(0, H_), r.range(0, 6.28), r.range(4, 22), r.chance(0.5), r.range(0.1, 0.3), r.range(0.4, 1.1)]);
      for (let i = 0; i < 14; i++) fox.push([r.range(0, W), r.range(0, H_), r.range(2, 9)]);
      if (!HP || HP.width !== W || HP.height !== H_) {
        HP = H.layer(W, H_); const pc = HP.getContext('2d');
        paperBase(pc, W, H_);
        for (const [x0, y0, a, l, dk, al, lw] of fib) {
          pc.strokeStyle = `rgba(${dk ? '120,95,60' : '255,250,235'},${al})`; pc.lineWidth = lw;
          pc.beginPath(); pc.moveTo(x0, y0); pc.quadraticCurveTo(x0 + Math.cos(a + 0.5) * l * 0.6, y0 + Math.sin(a + 0.5) * l * 0.6, x0 + Math.cos(a) * l, y0 + Math.sin(a) * l); pc.stroke();
        }
        // foxing
        for (const [x0, y0, rr] of fox) { const g = pc.createRadialGradient(x0, y0, 0, x0, y0, rr); g.addColorStop(0, 'rgba(150,100,50,0.22)'); g.addColorStop(1, 'rgba(150,100,50,0)'); pc.fillStyle = g; pc.fillRect(x0 - rr, y0 - rr, rr * 2, rr * 2); }
        H.vignette(pc, W, H_, 0.18, '120,85,40');
      }
      ctx.drawImage(HP, 0, 0);

      // ---- masks ----
      const dx = 2.5, dy = -1.5; // red forme slightly out of register
      const redShift = H.layer(W, H_), rs = redShift.getContext('2d'); rs.translate(W / 2, H_ / 2); rs.rotate(0.0015); rs.translate(-W / 2, -H_ / 2); rs.drawImage(red, dx, dy);
      const bk = b.getImageData(0, 0, W, H_).data, rk = rs.getImageData(0, 0, W, H_).data;
      const blurOf = (c, px) => { const o = H.layer(W, H_), ox = o.getContext('2d'); ox.filter = `blur(${px}px)`; ox.drawImage(c, 0, 0); return ox.getImageData(0, 0, W, H_).data; };
      const both = H.layer(W, H_), bx = both.getContext('2d'); bx.drawImage(blk, 0, 0); bx.drawImage(redShift, 0, 0);
      const bb = blurOf(both, 2.2);   // impression relief
      const bkB = blurOf(blk, 1.6), rkB = blurOf(redShift, 1.6); // for ink-squash rims

      const nz = H.makeNoise(33);
      // low-res noise fields
      const GW = 427, GH = 240, fld = new Float32Array(GW * GH * 3);
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
        const j = (y * GW + x) * 3;
        fld[j] = nz.fbm2(x * 0.05, y * 0.05, 3);                 // broad ink patchiness
        fld[j + 1] = nz.fbm2(x * 0.6, y * 0.6, 2);               // fine edge wear
        fld[j + 2] = nz.fbm2(x * 0.012, y * 0.35, 2);            // wood grain warp (stretched in x)
      }
      const samp = (x, y, c) => fld[(((y * GH / H_) | 0) * GW + ((x * GW / W) | 0)) * 3 + c];
      const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };

      const img = ctx.getImageData(0, 0, W, H_), d = img.data;
      const inkPass = (i, x, y, m, mB, ink, s, rr, gg, bl) => {
        const a = m[i + 3] / 255; if (a < 0.02) return null;
        const dens0 = m[i + 1] / 255, phase = m[i + 2] / 255;
        const broad = samp(x, y, 0), fine = samp(x, y, 1);
        // worn, slightly ragged edges
        const ab = mB[i + 3] / 255;
        const thr = 0.5 + fine * 0.45 + (hash(x, y, s) - 0.5) * 0.2;
        let cov = H.clamp((Math.min(a, ab * 1.15) - thr) * 2.6 + 0.5);
        if (cov <= 0) return null;
        let dens = (0.25 + dens0 * 0.85) * (0.97 + broad * 0.22) + (hash(x, y, s + 1) - 0.5) * 0.08;
        // ink squash: darker rim just inside the edges
        const rim = H.clamp((a - mB[i + 3] / 255) * 3.5);
        // wood grain in the big blocks
        if (phase > 0) {
          const gv = Math.sin((y + samp(x, y, 2) * 40 + phase * 30) * 0.9 + Math.sin(x * 0.01 + phase * 9) * 2.5);
          const gv2 = nz.n2(x * 0.004 + phase * 7, y * 0.22);
          dens *= 1 - 0.32 * H.smooth(0.55, 1, gv * 0.5 + gv2 * 0.8);
          // a low spot on the block that took less ink
          dens *= 1 - 0.3 * H.smooth(0.2, 0.7, broad + (phase - 0.5) * 0.6);
        }
        // pinholes / speckle
        if (hash(x, y, s + 2) < 0.004 + Math.max(0, -broad - 0.15) * 0.35 + Math.max(0, fine - 0.3) * 0.2) dens *= 0.25;
        // ink squeezed out to the rim: the edge prints solid and slightly heavier even where the face is grainy
        dens = dens * (1 - rim * 0.5) + rim * 0.5 * Math.max(dens, 1.06) + rim * 0.12;
        cov *= H.clamp(dens);
        return cov;
      };
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        let cr = d[i], cg = d[i + 1], cb = d[i + 2];
        // deboss: impressed areas shade like a shallow relief lit from top-left
        const gA = (y > 2 && y < H_ - 3 && x > 2 && x < W - 3) ? bb[i + 3 + (W + 1) * 8] - bb[i + 3 - (W + 1) * 8] : 0;
        // directional bite: shadowed upper-left wall, only a soft light on the lower-right (no pale all-round halo)
        const sh = 1 - (Math.max(gA, 0) / 255 * 0.14 + Math.min(gA, 0) / 255 * 0.04) * press;
        const inside = bb[i + 3] / 255;
        const dep = 1 - inside * 0.05 * press;
        let k = sh * dep; cr *= k; cg *= k; cb *= k;
        const cR = inkPass(i, x, y, rk, rkB, INKS.red, 10);
        if (cR) { cr = cr * (1 - cR) + cr * (INKS.red[0] / 255) * cR; cg = cg * (1 - cR) + cg * (INKS.red[1] / 255) * cR; cb = cb * (1 - cR) + cb * (INKS.red[2] / 255) * cR; }
        const cK = inkPass(i, x, y, bk, bkB, INKS.black, 20);
        if (cK) { const kk = cK; cr = cr * (1 - kk) + INKS.black[0] * kk; cg = cg * (1 - kk) + INKS.black[1] * kk; cb = cb * (1 - kk) + INKS.black[2] * kk; }
        d[i] = cr; d[i + 1] = cg; d[i + 2] = cb;
      }
      ctx.putImageData(img, 0, 0);
      // stray ink specks from dirty furniture
      for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(30,27,26,${r.range(0.2, 0.6)})`; ctx.beginPath(); ctx.arc(r.range(40, W - 40), r.range(40, H_ - 40), r.range(0.5, 1.6), 0, 7); ctx.fill(); }
      const z = 1 + 0.025 * H.ease.inOut(H.clamp((t - 3.0) / 2.0));
      if (z > 1.0001) {
        const cp = H.layer(W, H_); cp.getContext('2d').drawImage(ctx.canvas, 0, 0, W, H_);
        ctx.drawImage(cp, 640 - 640 / z, 330 - 330 / z, W / z, H_ / z, 0, 0, W, H_);
      }
    },
  });
}
