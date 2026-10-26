{
  // ---------------------------------------------------------------
  // Impasto oil — thousands of loaded strokes along a swirling flow field,
  // each one raised off the canvas (height map) and lit for 3-D paint relief
  // ---------------------------------------------------------------
  const C = (r, g, b) => [r, g, b];
  const jit = (c, r, a) => [c[0] + r.gauss() * a, c[1] + r.gauss() * a, c[2] + r.gauss() * a];
  const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const css = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

  // region ids painted into a flat map
  const ID = { sky: 1, ground: 2, dome: 3, body: 4, slit: 5, person: 6, screen: 7, cypress: 8, text: 9, moon: 10, star: 11 };


  // =================================================================
  // EXPLAINER — "How does AI learn?" painted across one long canvas the camera travels along.
  // Background: a swirling night sky built once with the full lit-stroke engine; the story is laid on top in
  // fat, lit daubs (shadow edge, body, highlight ridge) — arrows, labels and numbers included.
  // =================================================================
  const IXW = 3400;
  let IXC = null;
  const lerpI = (a, b, u) => a + (b - a) * u;
  const clI = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ezI = (u) => H.ease.inOut(clI(u));
  const winI = (t, a, b) => clI((t - a) / (b - a));
  const CREAM = C(244, 232, 196), CHROMEY = C(244, 206, 72), OCH = C(214, 150, 60), VERMI = C(214, 70, 46), PRUS = C(24, 44, 100), SKYL = C(110, 160, 210);

  function impBackground() {
    const W = IXW, Hh = 720, nz = H.makeNoise(77);
    const hill = (x) => 560 + 26 * Math.sin(x * 0.0042 + 0.5) + 14 * Math.sin(x * 0.011 + 2);
    const vort = [[420, 160, 1.6, 95], [1300, 140, -1.4, 85], [1900, 190, 1.8, 105], [2700, 150, -1.5, 95], [3200, 230, 1.4, 90]];
    const psiRaw = (x, y) => { let v = y * 0.9 + 14 * Math.sin(x * 0.006 + y * 0.004) + nz.fbm2(x * 0.004, y * 0.004, 2) * 24; for (const [cx, cy, s, R] of vort) { const d2 = (x - cx) ** 2 + (y - cy) ** 2; v += s * R * 1.6 * Math.exp(-d2 / (2 * R * R)); } return v; };
    const GS = 6, GW = Math.ceil(W / GS) + 2, GH = Math.ceil(Hh / GS) + 2, PG = new Float32Array(GW * GH);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) PG[j * GW + i] = psiRaw(i * GS, j * GS);
    const bil = (x, y) => { const fx = H.clamp(x / GS, 0, GW - 1.001), fy = H.clamp(y / GS, 0, GH - 1.001), i = fx | 0, j = fy | 0, u = fx - i, v = fy - j, k = j * GW + i; return (PG[k] * (1 - u) + PG[k + 1] * u) * (1 - v) + (PG[k + GW] * (1 - u) + PG[k + GW + 1] * u) * v; };
    const dir = (x, y) => { if (y > hill(x)) { const d = (hill(x + 4) - hill(x - 4)) / 8; return Math.atan(d) + nz.n2(x * 0.01, y * 0.02) * 0.3; } const gx = (bil(x + 3, y) - bil(x - 3, y)) / 6, gy = (bil(x, y + 3) - bil(x, y - 3)) / 6; return Math.atan2(-gx, gy); };
    const SKY_D = C(18, 34, 96), SKY_M = C(40, 78, 158), SKY_L = C(86, 140, 196), PALE = C(190, 214, 214);
    const colAt = (x, y, r) => {
      const hy = hill(x);
      if (y > hy) { const dp = y - hy, b = Math.sin(dp * 0.07 + nz.n2(x * 0.006, y * 0.01) * 3); let c = mixc(C(24, 52, 60), C(16, 30, 52), H.clamp(dp / 160)); if (b > 0.4) c = mixc(c, C(64, 98, 66), 0.6); return c; }
      let c = mixc(SKY_D, SKY_M, H.clamp(y / hy)); const band = Math.sin(bil(x, y) * 0.085);
      let sw = 0; for (const [cx, cy, , R] of vort) sw = Math.max(sw, Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * (R * 1.3) ** 2)));
      if (band > 0.35) c = mixc(c, SKY_L, 0.45 + 0.3 * sw); if (band > 0.75 && sw > 0.3) c = mixc(c, PALE, 0.5 * sw); if (band < -0.6) c = mixc(c, SKY_D, 0.5);
      if (y > hy - 60) c = mixc(c, C(100, 140, 165), H.clamp((y - (hy - 60)) / 60) * 0.5);
      return c;
    };
    const COL = H.layer(W, Hh), cx_ = COL.getContext('2d'), HT = H.layer(W, Hh), hx = HT.getContext('2d');
    { const UP = H.layer(Math.ceil(W / 8), 90), ux = UP.getContext('2d'), r = H.rng(3); for (let y = 0; y < 90; y++) for (let x = 0; x < UP.width; x++) { ux.fillStyle = css(colAt(x * 8 + 4, y * 8 + 4, r)); ux.fillRect(x, y, 1, 1); } cx_.filter = 'blur(4px)'; cx_.drawImage(UP, -8, -8, W + 16, Hh + 16); cx_.filter = 'none'; }
    hx.fillStyle = '#3a3a3a'; hx.fillRect(0, 0, W, Hh);
    cx_.lineCap = hx.lineCap = 'round'; cx_.lineJoin = hx.lineJoin = 'round';
    const r1 = H.rng(78), cells = [];
    for (let y = 0; y < Hh + 6; y += 8.5) for (let x = 0; x < W + 6; x += 10) cells.push([x + r1.range(-4, 4), y + r1.range(-3, 3)]);
    for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(r1() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
    for (const [x, y] of cells) {
      const gnd = y > hill(x), longS = r1() < 0.13;
      const len = gnd ? r1.range(20, 32) : longS ? r1.range(28, 40) : r1.range(14, 24), w = longS ? r1.range(6.5, 8.5) : r1.range(5.5, 8), a0 = dir(x, y), pts = [[x, y]];
      let fx = x, fy = y, bx = x, by = y;
      for (let i = 0; i < 3; i++) { const af = dir(fx, fy), ab = dir(bx, by); fx += Math.cos(af) * len / 6; fy += Math.sin(af) * len / 6; bx -= Math.cos(ab) * len / 6; by -= Math.sin(ab) * len / 6; pts.push([fx, fy]); pts.unshift([bx, by]); }
      const col = jit(colAt(x, y, r1), r1, 9), col2 = mixc(col, r1.chance(0.5) ? C(240, 236, 210) : C(10, 20, 60), 0.25);
      const path = (c, o = 0, ox = 0, oy = 0) => { c.beginPath(); c.moveTo(pts[o][0] + ox, pts[o][1] + oy); for (let i = o + 1; i < pts.length - o; i++) c.lineTo(pts[i][0] + ox, pts[i][1] + oy); };
      cx_.lineWidth = w; cx_.strokeStyle = css(col); path(cx_); cx_.stroke();
      const nx = -Math.sin(a0), ny = Math.cos(a0), off = (r1() - 0.5) * w * 0.5;
      cx_.lineWidth = w * 0.3; cx_.strokeStyle = css(col2); path(cx_, 1, nx * off, ny * off); cx_.stroke();
      const base = 110 + r1() * 60; hx.lineWidth = w; hx.strokeStyle = `rgb(${base | 0},${base | 0},${base | 0})`; path(hx); hx.stroke();
      const top = base + 50 + r1() * 40; hx.lineWidth = w * 0.42; hx.strokeStyle = `rgb(${top | 0},${top | 0},${top | 0})`; path(hx, 1, nx * off * 0.5, ny * off * 0.5); hx.stroke();
    }
    // light the relief once
    const img = cx_.getImageData(0, 0, W, Hh), d = img.data;
    hx.filter = 'blur(0.7px)'; hx.drawImage(HT, 0, 0); hx.filter = 'none';
    const hd = hx.getImageData(0, 0, W, Hh).data;
    for (let y = 1; y < Hh - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = (y * W + x) * 4, gx = hd[i + 4] - hd[i - 4], gy = hd[i + W * 4] - hd[i - W * 4];
      const lam = (gx * 0.7 + gy * 0.7) * 0.0078, sh = 1 + lam, spec = lam > 0.25 ? (lam - 0.25) * 140 : 0;
      for (let c = 0; c < 3; c++) d[i + c] = d[i + c] * sh + spec;
    }
    cx_.putImageData(img, 0, 0);
    return { canvas: COL, hill };
  }

  // one fat daub of paint: shadowed edge, body, a broken-colour streak and a lit ridge
  function daub(c, pts, w, col, r) {
    if (pts.length < 2) return;
    const path = (ox, oy, s = 0) => { c.beginPath(); c.moveTo(pts[s][0] + ox, pts[s][1] + oy); for (let i = s + 1; i < pts.length - s; i++) c.lineTo(pts[i][0] + ox, pts[i][1] + oy); };
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.lineWidth = w; c.strokeStyle = css(mixc(col, C(5, 8, 25), 0.55)); path(w * 0.16 + 0.6, w * 0.2 + 0.8); c.stroke();
    c.strokeStyle = css(col); path(0, 0); c.stroke();
    c.lineWidth = Math.max(1, w * 0.22); c.strokeStyle = css(mixc(col, r() < 0.5 ? C(255, 250, 230) : C(30, 30, 70), 0.22)); path(w * 0.18, -w * 0.05); c.stroke();
    c.lineWidth = Math.max(1, w * 0.3); c.strokeStyle = css(mixc(col, C(255, 252, 240), 0.5)); path(-w * 0.18, -w * 0.22, pts.length > 3 ? 1 : 0); c.stroke();
  }
  // fill a shape (given as a mask canvas) with short daubs running along `ang(x,y)`
  function paintMask(mask, colFn, ang, { step = 5, len = 10, w = 5, seed = 1 } = {}) {
    const mw = mask.width, mh = mask.height, md = mask.getContext('2d').getImageData(0, 0, mw, mh).data;
    const out = H.layer(mw + 16, mh + 16), oc = out.getContext('2d'), r = H.rng(seed);
    oc.translate(8, 8);
    for (let y = 0; y < mh; y += step * 0.8) for (let x = 0; x < mw; x += step) {
      const xx = x + r.range(-1.5, 1.5), yy = y + r.range(-1.5, 1.5), k = ((yy | 0) * mw + (xx | 0)) * 4 + 3;
      if (xx < 0 || yy < 0 || xx >= mw || yy >= mh || md[k] < 128) continue;
      const a = ang(xx, yy) + r.gauss() * 0.15, l = len * (0.7 + r() * 0.6);
      daub(oc, [[xx - Math.cos(a) * l / 2, yy - Math.sin(a) * l / 2], [xx, yy], [xx + Math.cos(a) * l / 2, yy + Math.sin(a) * l / 2]], w * (0.8 + r() * 0.4), jit(colFn(xx, yy), r, 10), r);
    }
    return out;
  }
  function impCache() {
    if (IXC) return IXC;
    const C0 = { bg: impBackground(), text: new Map() };
    // painted cat & dog pictures (little framed canvases)
    const animal = (dog) => {
      const m = H.layer(200, 200), c = m.getContext('2d'); c.fillStyle = '#000';
      c.fillRect(0, 0, 200, 200);
      const frame = paintMask(m, (x, y) => (x < 14 || y < 14 || x > 186 || y > 186 ? C(150, 100, 50) : C(236, 222, 186)), (x, y) => (x < 14 || x > 186 ? Math.PI / 2 : 0), { step: 6, len: 14, w: 7, seed: dog ? 11 : 12 });
      const hm = H.layer(200, 200), h = hm.getContext('2d'); h.fillStyle = '#000';
      if (dog) { h.beginPath(); h.ellipse(100, 108, 52, 48, 0, 0, 7); h.fill(); }
      else { h.beginPath(); [[46, 96], [50, 34], [80, 64], [120, 64], [150, 34], [154, 96], [140, 140], [100, 156], [60, 140]].forEach(([x, y], i) => (i ? h.lineTo(x, y) : h.moveTo(x, y))); h.fill(); }
      const headCol = dog ? C(150, 98, 56) : C(238, 140, 48);
      const head = paintMask(hm, () => headCol, (x, y) => Math.atan2(y - 108, x - 100) + Math.PI / 2, { step: 4.5, len: 10, w: 5, seed: dog ? 13 : 14 });
      const out = H.layer(216, 216), o = out.getContext('2d'); o.drawImage(frame, 0, 0); o.drawImage(head, 0, 0);
      const r = H.rng(dog ? 15 : 16);
      if (dog) for (const s of [-1, 1]) daub(o, [[108 + s * 50, 80], [108 + s * 62, 116], [108 + s * 56, 146]], 18, C(90, 56, 34), r);
      daub(o, [[84, 108], [86, 110]], 9, C(30, 30, 60), r); daub(o, [[128, 108], [130, 110]], 9, C(30, 30, 60), r);
      daub(o, [[104, 128], [112, 128]], 8, C(60, 30, 40), r);
      return out;
    };
    C0.cat = animal(false); C0.dog = animal(true);
    IXC = C0;
    return C0;
  }
  // lettering painted with a small brush (cached per string)
  function paintedText(str, size, col, font = '900 italic', family = 'Fraunces') {
    const C0 = impCache(), key = str + '|' + size + '|' + col.join(',');
    let cv = C0.text.get(key);
    if (cv) return cv;
    const m = H.layer(4, 4).getContext('2d'); m.font = `${font} ${size}px "${family}"`;
    const w = Math.ceil(m.measureText(str).width) + 10, h = Math.ceil(size * 1.3);
    // thick lettering: a solid loaded fill, raised (shadow + lit rim) and dragged with brush streaks
    cv = H.layer(w + 16, h + 16); const c = cv.getContext('2d'), r = H.rng(str.length * 7 + size), e = Math.max(1.2, size / 40);
    c.font = `${font} ${size}px "${family}"`; c.translate(8, 8);
    c.fillStyle = css(mixc(col, C(5, 8, 25), 0.65)); c.fillText(str, 5 + e * 1.6, size + e * 2);
    c.fillStyle = css(mixc(col, C(255, 252, 240), 0.6)); c.fillText(str, 5 - e, size - e);
    c.fillStyle = css(col); c.fillText(str, 5, size);
    c.globalCompositeOperation = 'source-atop'; c.lineCap = 'round';
    for (let k = 0; k < w * h / (size * 1.2); k++) {
      const x = r() * w, y = r() * h, l = size * r.range(0.15, 0.4);
      c.strokeStyle = css(mixc(col, r() < 0.5 ? C(255, 250, 230) : C(60, 40, 20), r.range(0.12, 0.3))); c.lineWidth = r.range(1, Math.max(1.5, size / 22));
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + r.gauss() * 1.5); c.stroke();
    }
    cv.base = size + 16;
    // a dark ultramarine-umber glaze laid under the lettering so it separates from the swirls
    { const gz = H.layer(cv.width + 24, cv.height + 24), gc = gz.getContext('2d');
      const dr = Math.max(2, size / 18);
      gc.filter = `blur(${Math.max(3.5, size / 11).toFixed(1)}px)`;
      for (let a = 0; a < 8; a++) gc.drawImage(cv, 12 + Math.cos(a * 0.785) * dr, 12 + Math.sin(a * 0.785) * dr);
      gc.filter = 'none';
      gc.globalCompositeOperation = 'source-in'; gc.fillStyle = 'rgba(12,16,44,0.82)'; gc.fillRect(0, 0, gz.width, gz.height);
      cv.glaze = gz; }
    if (C0.text.size > 200) C0.text.clear();
    C0.text.set(key, cv);
    return cv;
  }
  let glazeTmp = null;
  function pText(c, str, x, y, size, col, { align = 'left', reveal = 1 } = {}) {
    if (reveal <= 0) return;
    const cv = paintedText(str, size, col), w = cv.width - 16, ox = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
    const rw = cv.width * clI(reveal), go = Math.max(2, size / 24);
    if (cv.glaze) {
      const gz = cv.glaze, dx = x + ox - 20 + go * 0.7, dy = y - cv.base - 12 + go;
      if (reveal >= 1) c.drawImage(gz, dx, dy);
      else {
        // glaze follows the brush: cropped at the reveal edge and feathered so it never shows a hard dark block
        if (!glazeTmp || glazeTmp.width < gz.width || glazeTmp.height < gz.height) glazeTmp = H.layer(gz.width, gz.height);
        const gt = glazeTmp.getContext('2d'), ew = rw + 12;
        gt.globalCompositeOperation = 'source-over'; gt.clearRect(0, 0, glazeTmp.width, glazeTmp.height);
        gt.drawImage(gz, 0, 0, ew, gz.height, 0, 0, ew, gz.height);
        const fg = gt.createLinearGradient(Math.max(0, ew - 26), 0, ew, 0); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,1)');
        gt.globalCompositeOperation = 'destination-out'; gt.fillStyle = fg; gt.fillRect(Math.max(0, ew - 26), 0, 27, gz.height);
        c.drawImage(glazeTmp, 0, 0, ew, gz.height, dx, dy, ew, gz.height);
      }
    }
    c.drawImage(cv, 0, 0, rw, cv.height, x + ox - 8, y - cv.base, rw, cv.height);
  }
  // a painted arrow: a chain of fat daubs following a curve, drawn on progressively
  function pArrow(c, pts, w, col, prog, seed, head = true) {
    if (prog <= 0) return;
    const r = H.rng(seed), n = Math.max(2, Math.ceil(pts.length * clI(prog)));
    // each daub is laid by hand: a slight sideways wobble and its own load, so the chain never reads as one vector line
    for (let i = 0; i < n - 1; i += 2) { const ox = (r() - 0.5) * w * 0.28, oy = (r() - 0.5) * w * 0.28; daub(c, pts.slice(i, Math.min(n, i + 4)).map((p) => [p[0] + ox, p[1] + oy]), w * (0.8 + r() * 0.4), jit(col, r, 12), r); }
    if (head && prog >= 1) {
      const a = pts[pts.length - 4] || pts[0], b = pts[pts.length - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      for (const s of [-1, 1]) daub(c, [[b[0], b[1]], [b[0] - Math.cos(ang + s * 0.55) * w * 1.6, b[1] - Math.sin(ang + s * 0.55) * w * 1.6], [b[0] - Math.cos(ang + s * 0.55) * w * 3, b[1] - Math.sin(ang + s * 0.55) * w * 3]], w * 0.9, col, r);
    }
  }
  const bezI = (p0, p1, p2, p3, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, a = 1 - u; o.push([a * a * a * p0[0] + 3 * a * a * u * p1[0] + 3 * a * u * u * p2[0] + u * u * u * p3[0], a * a * a * p0[1] + 3 * a * a * u * p1[1] + 3 * a * u * u * p2[1] + u * u * u * p3[1]]); } return o; };
  const ring = (cx, cy, rx, ry, a0 = -0.5, turns = 1.08, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI * 2 * turns; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const fmtI = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  function explainImpasto(ctx, W, H_, t) {
    const C0 = impCache();
    const cam = Math.round(760 * ezI((t - 6.0) / 0.9) + 1300 * ezI((t - 10.5) / 0.9));
    ctx.drawImage(C0.bg.canvas, cam, 0, W, H_, 0, 0, W, H_);
    ctx.save(); ctx.translate(-cam, 0);
    const r = H.rng(1000 + Math.floor(t * 12));   // daubs re-laid on twos: a living, hand-made jitter

    // ---------- the model: a blazing swirl-sun with three arms (its weights) ----------
    const OX = 1040, OY = 290, OR = 110;
    const og = winI(t, 1.4, 2.4);
    if (og > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const g = ctx.createRadialGradient(OX, OY, 10, OX, OY, OR * 2.2); g.addColorStop(0, `rgba(255,214,110,${0.55 * og})`); g.addColorStop(1, 'rgba(255,214,110,0)');
      ctx.fillStyle = g; ctx.fillRect(OX - OR * 2.3, OY - OR * 2.3, OR * 4.6, OR * 4.6); ctx.restore();
      for (let k = 0; k < 3; k++) { const rr = OR * (0.55 + k * 0.28) * og; if (rr > 4) pArrow(ctx, ring(OX, OY, rr, rr, k * 1.3, 1.0, 36), 13 - k * 2, k === 1 ? C(250, 236, 180) : CHROMEY, winI(t, 1.4 + k * 0.2, 2.2 + k * 0.2), 300 + k, false); }
      const spin = ezI((t - 8.7) / 0.7) * 1.4;
      for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.3 + spin * (k === 1 ? -1 : 1); const arm = []; for (let i = 0; i <= 8; i++) { const u = i / 8; arm.push([OX + Math.cos(a + u * 1.6) * u * OR * 0.5, OY + Math.sin(a + u * 1.6) * u * OR * 0.5]); } pArrow(ctx, arm, 10, VERMI, winI(t, 2.0 + k * 0.1, 2.4 + k * 0.1), 310 + k, false); }
      pText(ctx, 'the model', OX, OY + OR + 70, 40, CREAM, { align: 'center', reveal: winI(t, 2.4, 2.9) });
    }
    if (t > 8.6 && t < 9.7) { const k = Math.sin(Math.PI * winI(t, 8.6, 9.7)); ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(OX, OY, 10, OX, OY, OR * 2.6); g.addColorStop(0, `rgba(255,236,170,${0.7 * k})`); g.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = g; ctx.fillRect(OX - 300, OY - 300, 600, 600); ctx.restore(); }

    // ---------- beat 2: painted examples swirl into the model; the count climbs ----------
    const flow = bezI([-120, 520], [300, 600], [700, 120], [OX - OR, OY], 50);
    pArrow(ctx, flow.slice(0, 46), 12, C(200, 214, 230), winI(t, 2.3, 3.0), 400, true);
    const at = (u) => { const f = u * (flow.length - 1), i = Math.min(flow.length - 2, Math.floor(f)), q = f - i; return [lerpI(flow[i][0], flow[i + 1][0], q), lerpI(flow[i][1], flow[i + 1][1], q)]; };
    for (const pass of [0, 1]) for (let i = 0; i < 24; i++) {   // pass 0: the little canvases, pass 1: their labels on top
      const s0 = 2.6 + i * 0.13, u = (t - s0) / 1.5;
      if (u <= 0 || u >= 1) continue;
      const [x, y] = at(u), dog = (i % 2 === 1) !== (i % 5 === 0), sc = u > 0.8 ? 1 - (u - 0.8) / 0.2 * 0.85 : 1, sz = 96 * sc;
      ctx.save(); ctx.translate(x, y - 40 * sc); ctx.rotate(Math.sin(i * 1.9) * 0.15);
      if (!pass) {
        // cast shadow of the little canvas onto the sky
        ctx.fillStyle = 'rgba(8,12,36,0.35)'; ctx.fillRect(-sz / 2 + 5, -sz / 2 + 7, sz * 0.92, sz * 0.92);
        ctx.drawImage(dog ? C0.dog : C0.cat, -sz / 2, -sz / 2, sz, sz);
      } else if (sc > 0.6) pText(ctx, dog ? 'dog' : 'cat', -sz / 2, sz / 2 + 34, 32, dog ? C(230, 190, 150) : CHROMEY);
      ctx.restore();
    }
    if (t > 2.9) {
      const n = t > 5.6 ? 1e6 : Math.round(1e6 * H.ease.in(winI(t, 3.0, 5.6)) / 1000) * 1000;
      pText(ctx, fmtI(n), 80, 680, 64, CHROMEY, { reveal: winI(t, 2.9, 3.2) });
      pText(ctx, 'examples', 80 + paintedText(fmtI(n), 64, CHROMEY).width, 680, 46, CREAM, { reveal: winI(t, 3.0, 3.4) });
      if (t > 5.6) pArrow(ctx, bezI([70, 696], [250, 708], [500, 700], [660, 704], 24), 11, VERMI, winI(t, 5.6, 5.95), 410, false);
    }

    // ---------- beat 3: guess -> check -> adjust ----------
    const PX = 1730, PY = 300;
    if (t > 6.4) {
      const k = H.ease.back(winI(t, 6.4, 6.8));
      ctx.save(); ctx.translate(PX + 105, PY + 105); ctx.scale(k, k); ctx.drawImage(C0.cat, -110, -110, 220, 220); ctx.restore();
      pText(ctx, 'new picture', PX + 105, PY + 262, 34, CREAM, { align: 'center', reveal: winI(t, 6.7, 7.1) });
    }
    const BX = 1420, BY = 120;
    pArrow(ctx, bezI([OX + 80, OY - 80], [OX + 140, OY - 170], [BX - 60, BY + 60], [BX - 10, BY + 30], 24), 12, CHROMEY, winI(t, 6.8, 7.2), 420);
    pText(ctx, 'Guess', OX + 60, OY - 150, 42, CREAM, { reveal: winI(t, 6.9, 7.3) });
    const second = t > 9.4;
    if (!second) pText(ctx, 'dog?', BX + 10, BY + 70, 86, C(230, 190, 150), { reveal: winI(t, 7.1, 7.5) });
    pArrow(ctx, bezI([PX + 60, PY - 10], [PX + 20, PY - 90], [BX + 300, BY - 10], [BX + 250, BY + 20], 24), 12, CREAM, winI(t, 7.5, 7.9), 430);
    pText(ctx, 'Check', PX + 60, PY - 60, 42, CREAM, { reveal: winI(t, 7.6, 8.0) });
    if (t > 7.9 && !second) {
      pArrow(ctx, [[BX + 10, BY - 20], [BX + 70, BY + 30], [BX + 130, BY + 80], [BX + 190, BY + 120]], 15, VERMI, winI(t, 7.9, 8.05), 440, false);
      pArrow(ctx, [[BX + 190, BY - 20], [BX + 130, BY + 30], [BX + 70, BY + 80], [BX + 10, BY + 120]], 15, VERMI, winI(t, 8.05, 8.2), 441, false);
      pArrow(ctx, ring(BX + 100, BY + 46, 150, 95, -0.4, 1.06, 44), 9, CHROMEY, winI(t, 8.0, 8.45), 442, false);
      pText(ctx, "it's a cat!", PX + 105, PY + 312, 40, VERMI, { align: 'center', reveal: winI(t, 8.0, 8.4) });
    }
    pArrow(ctx, bezI([BX + 120, BY + 140], [BX + 80, BY + 360], [OX + 220, OY + 220], [OX + 100, OY + 110], 30), 10, VERMI, winI(t, 8.25, 8.8), 450);
    pText(ctx, 'Adjust', BX + 40, BY + 330, 42, VERMI, { reveal: winI(t, 8.5, 8.9) });
    if (second) {
      pText(ctx, 'cat', BX + 20, BY + 70, 86, CHROMEY, { reveal: winI(t, 9.4, 9.7) });
      pArrow(ctx, [[BX + 170, BY + 30], [BX + 186, BY + 52], [BX + 205, BY + 20], [BX + 232, BY - 20]], 11, C(90, 190, 90), winI(t, 9.7, 9.95), 460, false);
    }

    // ---------- beat 4: accuracy climbs, painted as a ridge over the hills ----------
    const CX0 = 2210, CY0 = 540, CW = 800, CH = 340, N = 24;
    if (t > 10.6) {
      // axes as a chain of short loaded daubs (not one long vector line)
      const axY = [], axX = [];
      for (let i = 0; i <= 12; i++) { const u = i / 12; axY.push([CX0 + Math.sin(i * 2.1) * 1.4, CY0 - CH + CH * u]); axX.push([CX0 + (CW + 20) * u, CY0 + Math.sin(i * 1.7) * 1.4]); }
      pArrow(ctx, axY, 9, CREAM, winI(t, 10.7, 11.0), 470, false);
      pArrow(ctx, axX, 9, CREAM, winI(t, 10.8, 11.2), 471, false);
      pText(ctx, 'training rounds', CX0 + CW / 2, CY0 + 52, 34, CREAM, { align: 'center', reveal: winI(t, 11.0, 11.4) });
      const pts = [];
      for (let i = 0; i <= N; i++) { const acc = 61 + 36 * (1 - Math.exp(-i / 5.5)) / (1 - Math.exp(-N / 5.5)) + (i > 0 && i < N ? Math.sin(i * 2.7) * 1.6 : 0); pts.push([CX0 + i / N * CW, CY0 - (acc - 50) / 50 * CH]); }
      const pr = winI(t, 11.2, 12.7), dense = [];
      for (let i = 0; i < N; i++) for (let k = 0; k < 3; k++) dense.push([lerpI(pts[i][0], pts[i + 1][0], k / 3), lerpI(pts[i][1], pts[i + 1][1], k / 3)]);
      dense.push(pts[N]);
      pArrow(ctx, dense, 11, CHROMEY, pr, 480, false);
      const acc = Math.round(t < 11.2 ? 61 : t > 12.7 ? 97 : lerpI(61, 97, H.ease.out(pr)));
      pText(ctx, 'Accuracy', CX0 + 10, CY0 - CH - 30, 50, CREAM, { reveal: winI(t, 10.9, 11.3) });
      pText(ctx, acc + '%', CX0 + 270, CY0 - CH - 26, 76, acc >= 97 ? VERMI : CHROMEY, { reveal: winI(t, 11.1, 11.3) });
      pText(ctx, '61%', CX0 - 74, pts[0][1] + 12, 30, CREAM, { reveal: winI(t, 11.2, 11.5) });
      if (t > 12.7) { pArrow(ctx, ring(CX0 + 372, CY0 - CH - 52, 104, 60, -0.3, 1.06, 40), 8, CHROMEY, winI(t, 12.7, 13.1), 490, false); pArrow(ctx, ring(pts[N][0], pts[N][1], 28, 28, 0, 1.05, 24), 6, VERMI, winI(t, 12.9, 13.2), 491, false); }
    }
    ctx.restore();

    // ---------- beat 5 + beat 1 (screen space) ----------
    if (t > 13.2) pText(ctx, 'More examples → better guesses', 640, 690, 56, CREAM, { align: 'center', reveal: ezI((t - 13.2) / 0.7) });
    {
      const k = ezI((t - 1.5) / 0.8), s = lerpI(1, 0.58, k), cv = paintedText('How does AI learn?', 96, CHROMEY);
      ctx.save(); ctx.translate(lerpI(640 - (cv.width - 16) / 2, 34, k), lerpI(380, 64, k)); ctx.scale(s, s);
      pText(ctx, 'How does AI learn?', 0, 0, 96, CHROMEY, { reveal: winI(t, 0.1, 1.1) });
      ctx.restore();
    }
    void r;
  }

  registerStyle({
    id: 'impasto-oil',
    name: 'Impasto Night',
    category: 'Painterly',
    description: 'Thick oil paint in short loaded strokes that follow a swirling flow field, Post-Impressionist night-sky style; every stroke stands off the canvas with a lit ridge and a shadowed edge, colour broken within each stroke.',
    motion: 'The sky\'s strokes slowly rotate along their swirl and the halos around the moon and stars pulse ring by ring, as if the paint itself were turning.',
    fonts: ['900 italic 64px "Fraunces"'],
    duration: 6.5,
    frameT: 6.4,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'The camera travels along one long swirling night-sky canvas; arrows, rings, labels and numbers are all laid on as fat lit daubs of paint (shadow edge, body, highlight ridge) in chrome yellow and vermilion against the blues.',
    explainer(ctx, W, H_, t) { explainImpasto(ctx, W, H_, t); },
    explainerSound(k) {
      // all times copied from explainImpasto() above (its winI()/ezI() windows)
      const D = 15;
      const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
      // one fat daub of oil paint pressed onto canvas: a short, sticky, low smack
      const daub = (t, g = 1, pan = 0, minor = true) => {
        k.noise(t, { dur: 0.09, color: 'pink', filter: 'bandpass', f: [[0, 750], [0.09, 380]], q: 1.3, gain: 0.24 * g, a: 0.006, pan, minor });
        k.tone(t, { f: [[0, 150], [0.06, 85]], dur: 0.08, gain: 0.09 * g, pan, minor });
      };
      // a loaded hog-hair brush dragged through thick paint, laying daubs as it goes (at most ~11 per second)
      const drag = (a, b, g = 1, p0 = 0, p1 = p0, minor = true) => {
        const d = b - a;
        k.play('stroke', a, { material: 'brush', dur: d, gain: 1.1 * g, pan: (p0 + p1) / 2, minor });
        for (let x = 0; x < d - 0.02; x += 0.09) daub(a + x, (x ? 0.55 : 1) * g, p0 + (p1 - p0) * x / d, minor);
      };
      const write = (s, a, b, g = 0.7, pan = 0) => { const re = /\S+/g; let m;
        while ((m = re.exec(s))) { const wa = a + (b - a) * m.index / s.length, wb = a + (b - a) * (m.index + m[0].length) / s.length; k.play('stroke', wa, { material: 'brush', dur: wb - wa, gain: 1.1 * g, pan, minor: true }); daub(wa, 0.7 * g, pan); } };
      // palette knife scraping paint: a steady, slightly metallic scrape (kept below 2 kHz)
      const knife = (a, b, g = 1, pan = 0, minor = false) => { const d = b - a;
        k.noise(a, { dur: d, filter: 'bandpass', f: [[0, 1100], [d, 1700]], q: 2.6, gain: 0.2 * g, a: 0.01, hold: d * 0.6, pan, minor });
        k.noise(a, { dur: d, color: 'brown', filter: 'lowpass', f: 400, gain: 0.18 * g, a: 0.01, hold: d * 0.5, pan, minor }); };
      // scene change: mixing a fresh pile on the palette with the knife, then a tap of the blade
      const palette = (t) => { knife(t, t + 0.22, 0.8, -0.3); knife(t + 0.3, t + 0.5, 0.65, 0.3); k.play('tock', t + 0.62, { f: 1400, gain: 0.25, pan: 0.2 }); };
      const counter = (val, a, b, pan) => { let last = val(a), lastT = -1;
        for (let t = a; t <= b; t += 1 / 240) { const v = val(t); if (v !== last && t - lastT >= 1 / 12) { daub(t, 0.6, pan); lastT = t; } last = v; } };

      k.bed('room', 0, D, { gain: 0.45 });
      // a slow, dark night-sky pad (Ebmaj7, Cm7, Abmaj7, Bb6; 3.75 s bars)
      k.music('pad', 0, D, { bpm: 64, gain: 0.3, chords: [['Eb3', 'G3', 'Bb3', 'D4'], ['C3', 'Eb3', 'G3', 'Bb3'], ['Ab2', 'C3', 'Eb3', 'G3'], ['Bb2', 'D3', 'F3', 'G3']] });

      // ---- 1 HOOK: title painted 0.1-1.1, then a soft slide to the corner 1.5-2.3
      write('How does AI learn?', 0.1, 1.1, 1.0);
      k.noise(1.5, { dur: 0.8, color: 'pink', filter: 'bandpass', f: [[0, 280], [0.8, 600]], q: 0.7, gain: 0.07, a: 0.3, minor: true });

      // ---- 2 DATA: the swirl-sun (rings 1.4-2.6, arms 2.0-2.6), the flow arrow 2.3-3.0
      k.noise(1.4, { dur: 1.2, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.6, 700], [1.2, 400]], q: 0.8, gain: 0.08, a: 0.5, pan: 0.6, verb: 0.3 }); // the glow swells
      drag(1.4, 2.2, 1.0, 0.4, 0.8, false);
      drag(1.8, 2.6, 0.6, 0.8, 0.4);
      drag(2.3, 3.0, 1.0, -0.9, 0.3, false);
      write('the model', 2.4, 2.9, 0.5, 0.6);
      // counter painted in: n = 1e6 * ease.in(winI(3.0, 5.6)), rounded to thousands
      counter((t) => Math.round(1e6 * H.ease.in(winI(t, 3.0, 5.6)) / 1000), 3.05, 5.58, -0.6);
      k.play('thud', 5.6, { f: 140, gain: 0.25, pan: -0.6 }); daub(5.6, 1.0, -0.6, false); // 1,000,000 lands
      drag(5.6, 5.95, 1.0, -0.8, -0.1, false);   // vermilion underline

      // ---- camera travels 6.0-6.9: the knife works a new pile on the palette
      palette(6.0);

      // ---- 3 GUESS -> CHECK -> ADJUST
      daub(6.45, 1.5, 0.6, false);              // the cat canvas pops on (ease.back 6.4-6.8)
      drag(6.8, 7.2, 0.9, 0.1, 0.4, false);     // Guess arrow
      write('dog?', 7.1, 7.5, 0.9, 0.3);
      drag(7.5, 7.9, 0.9, 0.6, 0.4, false);     // Check arrow
      // the wrong guess: two vermilion slashes laid with the knife, a low dull knock
      knife(7.9, 8.05, 1.4, 0.2); knife(8.05, 8.2, 1.4, 0.35);
      k.play('thud', 7.9, { f: 110, gain: 0.5, pan: 0.25 });
      k.tone(7.92, { f: 'Ab3', type: 'triangle', dur: 0.2, gain: 0.17, a: 0.01, hold: 0.07, verb: 0.2, pan: 0.25 });
      k.tone(8.1, { f: 'F3', type: 'triangle', dur: 0.38, gain: 0.17, a: 0.01, hold: 0.12, verb: 0.2, pan: 0.25 });
      drag(8.25, 8.8, 1.1, 0.3, -0.1, false);   // Adjust arrow runs back to the model
      // the sun's arms swing round (ezI over 8.7-9.4) while it glows: a slow swirl of paint
      k.noise(8.6, { dur: 1.1, color: 'pink', filter: 'bandpass', f: [[0, 350], [0.55, 900], [1.1, 400]], q: 1.0, gain: 0.08, a: 0.45, pan: -0.1, verb: 0.3, minor: true });
      write('cat', 9.4, 9.7, 1.0, 0.3);
      drag(9.7, 9.95, 1.1, 0.3, 0.4, false);    // green check
      k.play('success', 9.95, { f: 'G5', gain: 0.45, pan: 0.3 });

      // ---- camera travels 10.5-11.4
      palette(10.5);

      // ---- 4 PROGRESS: axes 10.7-11.2, the ridge 11.2-12.7
      drag(10.7, 11.0, 0.5, -0.6, -0.6); drag(10.8, 11.2, 0.5, -0.6, 0.6);
      k.play('stroke', 11.2, { material: 'brush', dur: 1.5, gain: 0.6, pan: 0, minor: true }); // the ridge, a long drag
      const acc = (t) => Math.round(61 + 36 * H.ease.out(winI(t, 11.2, 12.7)));
      const t97 = when(acc, 97, 11.2, 12.7);
      counter(acc, 11.2, t97 - 0.05, -0.3);
      // 97% lands and turns vermilion: the biggest hit, a heavy knife-load of paint slapped on with a warm chord
      k.play('impact', t97, { gain: 0.85, pan: -0.3 });
      k.play('slap', t97, { gain: 0.5, pan: -0.3 }); daub(t97, 2.0, -0.3, false);
      k.play('ding', t97 + 0.02, { f: 'Bb4', gain: 0.5 });
      ['Eb5', 'G5'].forEach((f, i) => k.tone(t97 + 0.05 + i * 0.03, { f, dur: 1.3, gain: 0.07, verb: 0.3, pan: (i - 0.5) * 0.5 }));
      drag(12.7, 13.1, 1.2, -0.4, -0.1, false);  // chrome-yellow ring around 97%
      drag(12.9, 13.2, 0.7, 0.6, 0.7);           // small ring on the last point

      // ---- 5 TAKEAWAY (13.2-13.9), then the resolve
      write('More examples → better guesses', 13.2, 13.9, 1.1);
      k.play('ding', 13.95, { f: 'Eb4', gain: 0.45 });
      ['G4', 'Bb4', 'Eb5'].forEach((f, i) => k.tone(14.01 + i * 0.06, { f, dur: 1.2, gain: 0.065 - i * 0.008, verb: 0.3, pan: (i - 1) * 0.3 }));
    },
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(31);
      const hill = (x) => 498 + 26 * Math.sin(x * 0.0052 + 0.6) + 14 * Math.sin(x * 0.013 + 2) - 40 * Math.exp(-Math.pow((x - 930) / 180, 2));
      const moon = [190, 124], stars = [[400, 88, 1.15], [575, 330, 0.85], [760, 66, 1.0], [960, 92, 1.2], [1050, 310, 0.8], [300, 262, 0.85], [870, 350, 0.7], [1180, 60, 0.9]];
      const domeC = [930, hill(930) - 46], domeR = 52;
      const person = [430, hill(430) + 8];

      // ---------- region map ----------
      const M = H.layer(W, H_), mx = M.getContext('2d');
      mx.imageSmoothingEnabled = false;
      const idc = (id) => `rgb(${id},0,0)`;
      mx.fillStyle = idc(ID.sky); mx.fillRect(0, 0, W, H_);
      mx.fillStyle = idc(ID.ground); mx.beginPath(); mx.moveTo(0, H_); for (let x = 0; x <= W; x += 8) mx.lineTo(x, hill(x)); mx.lineTo(W, H_); mx.fill();
      mx.fillStyle = idc(ID.moon); mx.beginPath(); mx.arc(moon[0], moon[1], 36, 0, 7); mx.fill();
      stars.forEach(([x, y, s]) => { mx.fillStyle = idc(ID.star); mx.beginPath(); mx.arc(x, y, 9 * s, 0, 7); mx.fill(); });
      // observatory
      mx.fillStyle = idc(ID.body); mx.fillRect(domeC[0] - 56, domeC[1], 112, 58);
      mx.fillStyle = idc(ID.dome); mx.beginPath(); mx.arc(domeC[0], domeC[1] + 2, domeR, Math.PI, 0); mx.closePath(); mx.fill();
      mx.fillStyle = idc(ID.slit); mx.beginPath(); mx.moveTo(domeC[0] - 6, domeC[1] - domeR + 2); mx.lineTo(domeC[0] + 12, domeC[1] - domeR + 4); mx.lineTo(domeC[0] + 14, domeC[1]); mx.lineTo(domeC[0] - 8, domeC[1]); mx.fill();
      mx.fillRect(domeC[0] - 12, domeC[1] + 18, 18, 26);
      // seated figure with laptop
      const [px, py] = person;
      mx.save(); mx.translate(px, py); mx.scale(1.55, 1.55); mx.translate(-px, -py);
      mx.fillStyle = idc(ID.person);
      mx.beginPath(); mx.arc(px - 6, py - 64, 11, 0, 7); mx.fill();
      mx.beginPath(); mx.moveTo(px - 24, py - 50); mx.quadraticCurveTo(px - 4, py - 58, px + 2, py - 40); mx.lineTo(px + 12, py - 12); mx.lineTo(px - 32, py - 6); mx.closePath(); mx.fill();
      mx.beginPath(); mx.moveTo(px - 30, py - 14); mx.lineTo(px + 40, py - 16); mx.lineTo(px + 46, py - 2); mx.lineTo(px - 28, py + 2); mx.fill();
      mx.beginPath(); mx.moveTo(px - 2, py - 44); mx.lineTo(px + 26, py - 26); mx.lineTo(px + 22, py - 20); mx.lineTo(px - 6, py - 36); mx.fill();
      mx.fillStyle = idc(ID.screen); mx.beginPath(); mx.moveTo(px + 22, py - 16); mx.lineTo(px + 46, py - 46); mx.lineTo(px + 53, py - 42); mx.lineTo(px + 31, py - 14); mx.fill();
      mx.restore();
      // cypress, flame-shaped
      mx.fillStyle = idc(ID.cypress); mx.beginPath();
      mx.moveTo(1090, H_);
      for (let y = H_; y >= 110; y -= 10) { const u = (H_ - y) / (H_ - 110); mx.lineTo(1150 - 88 * Math.pow(1 - u, 0.7) * (0.8 + 0.2 * Math.sin(y * 0.05)) + 8 * Math.sin(y * 0.03), y); }
      for (let y = 110; y <= H_; y += 10) { const u = (H_ - y) / (H_ - 110); mx.lineTo(1150 + 80 * Math.pow(1 - u, 0.7) * (0.8 + 0.2 * Math.cos(y * 0.045)) + 8 * Math.sin(y * 0.03), y); }
      mx.closePath(); mx.fill();
      // painted title
      mx.fillStyle = idc(ID.text); mx.font = '900 italic 64px "Fraunces"'; mx.fillText('The Night Shift', 56, 672);
      const MAP = mx.getImageData(0, 0, W, H_).data;
      const idAt = (x, y) => { x = Math.max(0, Math.min(W - 1, x | 0)); y = Math.max(0, Math.min(H_ - 1, y | 0)); return MAP[(y * W + x) * 4]; };

      // ---------- flow: stream function -> direction ----------
      const vort = [[640, 200, 2.2, 110], [450, 270, -1.4, 85], [830, 250, -1.1, 75], [moon[0], moon[1], 1.6, 70], [1010, 170, 0.9, 80]];
      const rot = t * 0.08;
      const psiRaw = (x, y) => {
        let v = y * 0.9 + 16 * Math.sin(x * 0.006 + y * 0.004 + 1.3) + nz.fbm2(x * 0.004, y * 0.004, 2) * 26;
        for (const [cx, cy, s, R] of vort) { const d2 = (x - cx) ** 2 + (y - cy) ** 2; v += s * R * 1.6 * Math.exp(-d2 / (2 * R * R)); }
        for (const [cx, cy, s] of stars) { const d2 = (x - cx) ** 2 + (y - cy) ** 2; v += 40 * s * Math.exp(-d2 / (2 * 22 * 22 * s * s)); }
        return v;
      };
      // stream function sampled once per frame on a 4px grid (bilinear lookups are far cheaper than the analytic field)
      const GS = 4, GW = Math.ceil(W / GS) + 2, GH = Math.ceil(H_ / GS) + 2, PG = new Float32Array(GW * GH), GX = new Float32Array(GW * GH), GY = new Float32Array(GW * GH);
      for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) PG[j * GW + i] = psiRaw(i * GS, j * GS);
      for (let j = 1; j < GH - 1; j++) for (let i = 1; i < GW - 1; i++) { const k = j * GW + i; GX[k] = (PG[k + 1] - PG[k - 1]) / (2 * GS); GY[k] = (PG[k + GW] - PG[k - GW]) / (2 * GS); }
      const bil = (A, x, y) => {
        const fx = H.clamp(x / GS, 0, GW - 1.001), fy = H.clamp(y / GS, 0, GH - 1.001), i = fx | 0, j = fy | 0, u = fx - i, v = fy - j, k = j * GW + i;
        return (A[k] * (1 - u) + A[k + 1] * u) * (1 - v) + (A[k + GW] * (1 - u) + A[k + GW + 1] * u) * v;
      };
      const psi = (x, y) => bil(PG, x, y);
      function dirAt(x, y, id) {
        if (id === ID.ground) { const d = (hill(x + 4) - hill(x - 4)) / 8; const depth = (y - hill(x)) / 220; return Math.atan(d * (1 - depth)) + nz.n2(x * 0.01, y * 0.02) * 0.35; }
        if (id === ID.cypress) return -Math.PI / 2 + 0.55 * Math.sin(y * 0.035 + x * 0.04) + nz.n2(x * 0.03, y * 0.03) * 0.3;
        if (id === ID.dome) return Math.atan2(y - domeC[1], x - domeC[0]) + Math.PI / 2;
        if (id === ID.body || id === ID.text) return 0.02 * Math.sin(y);
        if (id === ID.slit) return Math.PI / 2;
        if (id === ID.person) return -Math.PI / 2 + 0.4;
        if (id === ID.screen) return -0.8;
        if (id === ID.moon) return Math.atan2(y - moon[1], x - moon[0]) + Math.PI / 2;
        const gx = bil(GX, x, y), gy = bil(GY, x, y);
        return Math.atan2(-gx, gy) + rot * Math.exp(-((x - 620) ** 2 + (y - 210) ** 2) / 30000);
      }

      // ---------- palette by region ----------
      const SKY_D = C(18, 34, 96), SKY_M = C(40, 78, 158), SKY_L = C(86, 140, 196), PALE = C(190, 214, 214), CHROME = C(244, 206, 72), OCHRE = C(214, 160, 60), WHITE = C(240, 236, 210);
      function colorAt(x, y, id, r) {
        if (id === ID.sky || id === ID.star || id === ID.moon) {
          const hy = hill(x);
          let c = mixc(SKY_D, SKY_M, H.clamp(y / hy));
          const ps = psi(x, y), band = Math.sin(ps * 0.085);
          let sw = 0; for (const [cx, cy, s, R] of vort) sw = Math.max(sw, Math.exp(-(((x - cx) ** 2 + (y - cy) ** 2)) / (2 * (R * 1.3) ** 2)));
          if (band > 0.35) c = mixc(c, SKY_L, 0.55 + 0.3 * sw);
          if (band > 0.75 && sw > 0.3) c = mixc(c, PALE, 0.6 * sw);
          if (band < -0.6) c = mixc(c, SKY_D, 0.5);
          if (y > hy - 60) c = mixc(c, C(110, 150, 170), H.clamp((y - (hy - 60)) / 60) * 0.6);
          // halos: concentric rings of chrome yellow / pale
          const halo = (cx, cy, r0, r1, k) => {
            const d = Math.hypot(x - cx, y - cy);
            if (d < r0) return mixc(CHROME, WHITE, r() * 0.35);
            if (d < r1) { const ring = Math.sin((d - r0) * k - t * 1.6); const f = 1 - (d - r0) / (r1 - r0); if (ring > 0.1) return mixc(c, ring > 0.6 ? mixc(CHROME, WHITE, 0.4) : C(200, 210, 150), f * 0.95); return mixc(c, SKY_L, f * 0.3); }
            return null;
          };
          const hm = halo(moon[0], moon[1], 38, 108, 0.24); if (hm) return hm;
          for (const [sx, sy, s] of stars) { const hs = halo(sx, sy, 10 * s, 52 * s, 0.34 / s); if (hs) return hs; }
          return c;
        }
        if (id === ID.ground) {
          const dpt = y - hill(x), b = Math.sin(dpt * 0.07 + nz.n2(x * 0.006, y * 0.01) * 3);
          let c = mixc(C(24, 52, 60), C(16, 30, 52), H.clamp(dpt / 220));
          if (b > 0.4) c = mixc(c, C(64, 98, 66), 0.6);
          if (b < -0.7) c = mixc(c, C(90, 70, 40), 0.4);
          // laptop glow spills onto the grass
          const gd = Math.hypot(x - (px + 62), y - (py - 10));
          if (gd < 170) c = mixc(c, mixc(CHROME, OCHRE, 0.4), Math.pow(1 - gd / 170, 1.6) * 0.85);
          // distant village lights at the horizon
          if (dpt < 26 && x > 560 && x < 840 && nz.n2(x * 0.15, 3) > 0.35) c = mixc(c, CHROME, 0.8);
          return c;
        }
        if (id === ID.dome) { const sh = (x - domeC[0]) / domeR; return mixc(C(206, 210, 214), C(96, 116, 160), H.clamp(0.5 + sh * 0.6)); }
        if (id === ID.body) return mixc(C(70, 90, 130), C(40, 54, 92), H.clamp((x - domeC[0] + 56) / 112));
        if (id === ID.slit) return mixc(CHROME, C(255, 236, 160), r() * 0.5);
        if (id === ID.person) { const lit = H.clamp(1 - Math.hypot(x - (px + 48), y - (py - 46)) / 70); return mixc(C(22, 26, 52), C(200, 140, 60), lit * 0.8); }
        if (id === ID.screen) return mixc(C(255, 246, 200), C(240, 214, 120), r() * 0.4);
        if (id === ID.cypress) { const b = Math.sin(x * 0.12 + y * 0.02); return b > 0.3 ? C(46, 78, 52) : b < -0.5 ? C(14, 20, 24) : C(26, 44, 40); }
        if (id === ID.text) return mixc(CHROME, WHITE, 0.45 + r() * 0.3);
        return SKY_M;
      }

      // ---------- layers ----------
      const COL = H.layer(W, H_), cx_ = COL.getContext('2d');
      const HT = H.layer(W, H_), hx = HT.getContext('2d');
      // underpainting: thin, flat, scrubbed
      // primed canvas, then a thin scrubbed underpainting (blocked in small, smoothed up)
      cx_.fillStyle = 'rgb(214,200,172)'; cx_.fillRect(0, 0, W, H_);
      {
        const UP = H.layer(214, 120), ux = UP.getContext('2d'), r = H.rng(3);
        for (let y = 0; y < 120; y++) for (let x = 0; x < 214; x++) { const X = x * 6 + 3, Y = y * 6 + 3, q = idAt(X, Y); ux.fillStyle = css(colorAt(X, Y, q === ID.text ? ID.ground : q, r)); ux.fillRect(x, y, 1, 1); }
        cx_.globalAlpha = 0.9 * H.ease.out(H.clamp((t - 0.1) / 0.7)); cx_.filter = 'blur(5px)'; cx_.drawImage(UP, -6, -6, W + 12, H_ + 12); cx_.filter = 'none'; cx_.globalAlpha = 1;
      }
      hx.fillStyle = '#3a3a3a'; hx.fillRect(0, 0, W, H_);

      function stroke(x, y, len, w, r, idFilter, birth = 0, dry = false) {
        if (t < birth) return;
        len *= 0.35 + 0.65 * H.ease.out(H.clamp((t - birth) / 0.18));   // the stroke is dragged out by the brush
        const id = idAt(x, y);
        if (idFilter && !idFilter(id)) return;
        // trace the stroke along the flow, both directions from its centre
        const pts = [[x, y]];
        let a0 = dirAt(x, y, id);
        const n = 3, st = len / (2 * n);
        let fx = x, fy = y, bx = x, by = y, af = a0, ab = a0;
        for (let i = 0; i < n; i++) {
          fx += Math.cos(af) * st; fy += Math.sin(af) * st; af = af + (dirAt(fx, fy, id) - af + Math.PI * 3) % (Math.PI * 2) - Math.PI;
          // keep bend gentle
          bx -= Math.cos(ab) * st; by -= Math.sin(ab) * st; ab = ab + (dirAt(bx, by, id) - ab + Math.PI * 3) % (Math.PI * 2) - Math.PI;
          pts.push([fx, fy]); pts.unshift([bx, by]);
        }
        const col = jit(colorAt(x, y, id, r), r, 9);
        // occasional broken colour within the stroke
        const col2 = mixc(col, r.chance(0.5) ? WHITE : C(10, 20, 60), 0.25 + r() * 0.15);
        const path = () => { cx_.beginPath(); cx_.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) cx_.lineTo(pts[i][0], pts[i][1]); };
        const nx = -Math.sin(a0), ny = Math.cos(a0);
        if (dry) {
          // dry brush: a few starved bristle streaks, the layer below showing between them, barely raised
          const hb = 92 + r() * 30;
          for (let b = 0; b < 4; b++) {
            const o = (b - 1.5) * w * 0.3 + (r() - 0.5) * 1.2, s0 = r() < 0.5 ? 1 : 0;
            cx_.lineWidth = w * (0.12 + r() * 0.12); cx_.strokeStyle = css(mixc(col, b & 1 ? WHITE : col, 0.15));
            cx_.beginPath(); cx_.moveTo(pts[s0][0] + nx * o, pts[s0][1] + ny * o); for (let i = s0 + 1; i < pts.length - (b & 1); i++) cx_.lineTo(pts[i][0] + nx * o, pts[i][1] + ny * o); cx_.stroke();
            hx.lineWidth = w * 0.18; hx.strokeStyle = `rgb(${hb | 0},${hb | 0},${hb | 0})`;
            hx.beginPath(); hx.moveTo(pts[s0][0] + nx * o, pts[s0][1] + ny * o); for (let i = s0 + 1; i < pts.length - (b & 1); i++) hx.lineTo(pts[i][0] + nx * o, pts[i][1] + ny * o); hx.stroke();
          }
          return;
        }
        cx_.lineWidth = w; cx_.strokeStyle = css(col); path(); cx_.stroke();
        // streak of the second colour dragged through one side of the stroke
        const off = (r() - 0.5) * w * 0.5;
        cx_.lineWidth = w * 0.3; cx_.strokeStyle = css(col2);
        cx_.beginPath(); cx_.moveTo(pts[1][0] + nx * off, pts[1][1] + ny * off); for (let i = 2; i < pts.length - 1; i++) cx_.lineTo(pts[i][0] + nx * off, pts[i][1] + ny * off); cx_.stroke();
        // height: a body plateau + a raised ridge, each stroke paints over what's under it
        const hpath = () => { hx.beginPath(); hx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) hx.lineTo(pts[i][0], pts[i][1]); };
        const base = 100 + r() * 50 + w * 3;   // fatter, more loaded strokes stand higher
        hx.lineWidth = w; hx.strokeStyle = `rgb(${base | 0},${base | 0},${base | 0})`; hpath(); hx.stroke();
        hx.lineWidth = w * 0.42; const top = base + 50 + r() * 40; hx.strokeStyle = `rgb(${top | 0},${top | 0},${top | 0})`;
        hx.beginPath(); hx.moveTo(pts[0][0] + nx * off * 0.5, pts[0][1] + ny * off * 0.5); for (let i = 1; i < pts.length - 1; i++) hx.lineTo(pts[i][0] + nx * off * 0.5, pts[i][1] + ny * off * 0.5); hx.stroke();
      }
      cx_.lineCap = hx.lineCap = 'round'; cx_.lineJoin = hx.lineJoin = 'round';

      // pass 1: sky + ground, big strokes on a jittered grid (random order so they overlap naturally)
      const r1 = H.rng(77), cells = [];
      for (let y = 0; y < H_ + 6; y += 7.5) for (let x = 0; x < W + 6; x += 9) cells.push([x + r1.range(-4, 4), y + r1.range(-3, 3)]);
      for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(r1() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
      const big = (id) => id === ID.sky || id === ID.ground || id === ID.cypress;
      cells.forEach(([x, y], i) => {
        const b = 0.5 + 2.2 * (0.6 * i / cells.length + 0.4 * H.clamp(y / H_));
        if (t < b) return;
        const rs = H.rng(5000 + i), id = idAt(x, y);
        // vary the brush load by region: long sweeping strokes where the swirl runs strong, short dabs in the halos,
        // long horizontal drags on the hill, tall narrow flicks on the cypress; a few starved dry-brush strokes
        let len, w;
        if (id === ID.ground) { len = rs.range(20, 34); w = rs.range(6, 8.2); }
        else if (id === ID.cypress) { len = rs.range(20, 30); w = rs.range(4.2, 5.8); }
        else {
          let nearHalo = Math.hypot(x - moon[0], y - moon[1]) < 112;
          for (const [sx, sy, ss] of stars) if (Math.hypot(x - sx, y - sy) < 54 * ss) nearHalo = true;
          const fl = H.clamp(Math.hypot(bil(GX, x, y), bil(GY, x, y)) / 2.2);
          if (nearHalo) { len = rs.range(7, 11); w = rs.range(5, 6.5); }
          else if (rs() < 0.13) { len = rs.range(28, 40); w = rs.range(6.5, 8.5); }
          else { len = rs.range(12, 18) + 8 * fl; w = rs.range(5.2, 7) + 1.2 * fl; }
        }
        stroke(x, y, len, w, rs, big, b, id !== ID.cypress && rs() < 0.05);
      });
      // pass 2: halos, objects, figure — smaller, denser strokes
      const r2 = H.rng(78);
      const small = (id) => !(id === ID.sky || id === ID.ground || id === ID.cypress || id === ID.text);
      for (let k = 0; k < 2600; k++) {
        const b2 = 2.4 + 1.1 * k / 2600;
        const pick = r2();
        let x, y;
        if (pick < 0.35) { const a = r2() * 6.283, d = Math.sqrt(r2()) * 110; x = moon[0] + Math.cos(a) * d; y = moon[1] + Math.sin(a) * d; }
        else if (pick < 0.6) { const s = r2.pick(stars), a = r2() * 6.283, d = Math.sqrt(r2()) * 40 * s[2]; x = s[0] + Math.cos(a) * d; y = s[1] + Math.sin(a) * d; }
        else { x = r2.range(360, 1000); y = r2.range(380, 560); }
        const id = idAt(x, y);
        const rs = H.rng(9000 + k);
        if (pick < 0.6) stroke(x, y, rs.range(9, 15), rs.range(4, 5.5), rs, (q) => q === ID.sky || q === ID.moon || q === ID.star, b2);
        else stroke(x, y, rs.range(7, 11), rs.range(3.2, 4.4), rs, small, b2);
      }
      // dense small strokes over the observatory and the figure
      [[860, 300, 1000, 470], [340, 330, 540, 530]].forEach(([x0, y0, x1, y1]) => {
        for (let y = y0; y < y1; y += 3.2) for (let x = x0; x < x1; x += 3.6) {
          const q = idAt(x, y);
          const jx = r2.range(-1.5, 1.5), jy = r2.range(-1.5, 1.5);
          if (small(q)) { const rs = H.rng((x * 7 + y * 131) | 0); stroke(x + jx, y + jy, rs.range(6, 10), rs.range(2.8, 3.8), rs, small, 3.0 + 0.8 * (1 - (y - y0) / (y1 - y0))); }
        }
      });
      // laptop glow strokes radiating over the grass
      for (let k = 0; k < 260; k++) {
        const a = r2.range(-Math.PI, 0.3), d = r2.range(20, 120);
        const rs = H.rng(12000 + k);
        stroke(px + 62 + Math.cos(a) * d, py - 10 + Math.sin(a) * d * 0.6, rs.range(8, 14), rs.range(3.5, 5), rs, (q) => q === ID.ground, 3.6 + d / 120 * 0.4);
      }
      // cypress gets a second, flame-like pass
      for (let k = 0; k < 900; k++) { const x = r2.range(1050, 1240), y = r2.range(100, 720), rs = H.rng(14000 + k); stroke(x, y, rs.range(14, 22), rs.range(4.5, 6.5), rs, (q) => q === ID.cypress, 2.5 + 0.9 * (1 - y / 720)); }
      // dark underpaint ring under the title (comes in with the lettering) so it separates from the grass
      { const ua = H.clamp((t - 3.9) / 0.6);
        if (ua > 0) { cx_.save(); cx_.globalAlpha = 0.85 * ua; cx_.filter = 'blur(4px)'; cx_.font = '900 italic 64px "Fraunces"';
          cx_.lineJoin = 'round'; cx_.lineWidth = 18; cx_.strokeStyle = 'rgb(12,20,34)'; cx_.strokeText('The Night Shift', 56, 672); cx_.fillStyle = 'rgb(12,20,34)'; cx_.fillText('The Night Shift', 56, 672); cx_.restore(); } }
      // pass 3: lettering, painted with a small brush
      for (let y = 600; y < 690; y += 2.6) for (let x = 40; x < 560; x += 3.2) {
        if (idAt(x, y) !== ID.text) continue;
        const rs = H.rng((x * 13 + y * 977) | 0);
        stroke(x + rs.range(-1, 1), y + rs.range(-1, 1), rs.range(5, 8), rs.range(2.6, 3.4), rs, (q) => q === ID.text, 3.9 + (x - 40) / 520 * 0.6);
      }

      // ---------- light the relief ----------
      ctx.drawImage(COL, 0, 0);
      const img = ctx.getImageData(0, 0, W, H_), d = img.data;
      hx.filter = 'blur(0.7px)'; hx.drawImage(HT, 0, 0); hx.filter = 'none';
      const hd = hx.getImageData(0, 0, W, H_).data;
      const cr = H.rng(9);
      for (let y = 1; y < H_ - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = (y * W + x) * 4;
        const gx = hd[i + 4] - hd[i - 4], gy = hd[i + W * 4] - hd[i - W * 4];
        // light from upper-left
        const lam = (-gx * -0.7 + -gy * -0.7) * 0.0078;
        let sh = 1 + lam;
        const spec = lam > 0.25 ? (lam - 0.25) * 140 : 0;
        // canvas weave in the valleys
        const weave = ((x & 3) === 0 || (y & 3) === 0) ? -4 : 2;
        const low = hd[i] < 120 ? 1 : 0;
        for (let c = 0; c < 3; c++) d[i + c] = d[i + c] * sh + spec + weave * low + (cr() - 0.5) * 5;
      }
      ctx.putImageData(img, 0, 0);
      // a breath of luminous glaze around the brightest lights
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const gl = H.clamp((t - 3.2) / 1.0) * (0.85 + 0.15 * Math.sin(t * 2.2));
      [[moon[0], moon[1], 120, 0.22 * gl], [px + 66, py - 50, 100, 0.3 * gl], [domeC[0] + 3, domeC[1] - 20, 50, 0.18 * gl]].forEach(([x, y, rr, a]) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, `rgba(255,220,120,${a})`); g.addColorStop(1, 'rgba(255,220,120,0)');
        ctx.fillStyle = g; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      });
      ctx.restore();
      H.vignette(ctx, W, H_, 0.35, '8,10,30');
    }
  });
}
