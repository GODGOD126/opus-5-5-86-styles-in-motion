{
  // ---------- neon sign on a night brick wall ----------
  const COL = {
    pink: { core: [255, 236, 246], tube: [255, 70, 165], glow: [255, 25, 125], dark: [52, 26, 40] },
    cyan: { core: [228, 255, 255], tube: [70, 228, 255], glow: [0, 150, 255], dark: [22, 38, 48] },
    warm: { core: [255, 250, 228], tube: [255, 196, 80], glow: [255, 120, 15], dark: [48, 38, 26] },
  };
  const WALL_BASE = 596;

  function mask(W, Hh, fn) {
    const c = H.layer(W, Hh), x = c.getContext('2d');
    x.fillStyle = '#fff'; x.strokeStyle = '#fff'; x.lineCap = 'round'; x.lineJoin = 'round';
    fn(x); return c;
  }
  function colorize(m, rgb, a = 1) {
    const c = H.layer(m.width, m.height), x = c.getContext('2d');
    x.drawImage(m, 0, 0); x.globalCompositeOperation = 'source-in';
    x.fillStyle = H.rgba(rgb, a); x.fillRect(0, 0, c.width, c.height); return c;
  }
  function erode(m, r) {
    const c = H.layer(m.width, m.height), x = c.getContext('2d');
    x.drawImage(m, 0, 0); x.globalCompositeOperation = 'destination-in';
    for (let a = 0; a < 8; a++) x.drawImage(m, Math.round(Math.cos(a * Math.PI / 4) * r), Math.round(Math.sin(a * Math.PI / 4) * r));
    return c;
  }
  // cheap big blur: downsample, blur, return small canvas (caller scales it back up)
  function blurSmall(src, px, s = 0.25) {
    const w = Math.ceil(src.width * s), h = Math.ceil(src.height * s), c = H.layer(w, h), x = c.getContext('2d');
    x.filter = `blur(${Math.max(0.5, px * s)}px)`; x.drawImage(src, 0, 0, w, h); return c;
  }
  function addBlur(g, src, px, a, W, Hh) {
    const s = px > 24 ? 0.125 : px > 8 ? 0.25 : 0.5;
    g.globalAlpha = a; g.drawImage(blurSmall(src, px, s), 0, 0, W, Hh);
  }

  // ================= EXPLAINER: camera pans along one long wall of neon signs =================
  const NX = { pink: [255, 70, 165], cyan: [70, 228, 255], warm: [255, 190, 70], red: [255, 48, 36], green: [90, 255, 120], violet: [175, 110, 255] };
  let brickTile = null;
  function getBrickTile() {
    if (brickTile) return brickTile;
    const TW = 92 * 14, TH = 600, rowH = 30, brW = 92, mort = 5;
    const c = H.layer(TW, TH), x = c.getContext('2d'), img = x.createImageData(TW, TH), d = img.data;
    const R = H.rng(4401), nz = H.makeNoise(4402);
    const cols = [[230, 106, 76], [200, 90, 66], [245, 130, 92], [180, 96, 78], [220, 120, 90], [140, 76, 62]];
    const bh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
    for (let y = 0; y < TH; y++) {
      const row = Math.floor(y / rowH), ly = y - row * rowH, off = (row % 2) * (brW / 2);
      for (let xx = 0; xx < TW; xx++) {
        const col = Math.floor((xx + off) / brW) % 14, lxp = (xx + off) % brW;
        const h1 = bh(row, col), h2 = bh(col + 9, row + 3), g = R() - 0.5;
        const ang = xx / TW * Math.PI * 2, st = nz.n3(Math.cos(ang) * 3, Math.sin(ang) * 3, y * 0.012) * 0.3;
        const ej = (bh(xx >> 2, row) - 0.5) * 2.2;
        let r, gg, b;
        if (ly < mort + ej * 0.5 || lxp < mort + ej * 0.6) { const m = 0.5 + g * 0.3; r = 190 * m; gg = 182 * m; b = 172 * m; }
        else {
          const c0 = cols[Math.floor(h1 * cols.length)];
          const k = (0.85 + h2 * 0.3 + st) * (1 + g * 0.3) * (bh(xx * 0.37 | 0, y * 0.41 | 0) > 0.985 ? 0.55 : 1) * (ly - mort < 3 ? 1.15 : rowH - ly < 3 ? 0.75 : 1);
          r = c0[0] * k; gg = c0[1] * k; b = c0[2] * k;
        }
        const i = (y * TW + xx) * 4; d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
    return (brickTile = c);
  }
  // brick-edge masks matching getBrickTile(): top-edge and bottom-edge alpha, so the sign light can catch brick arrises
  let edgeTiles = null;
  function getEdgeTiles() {
    if (edgeTiles) return edgeTiles;
    const TW = 92 * 14, TH = 600, rowH = 30, brW = 92, mort = 5;
    const bh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
    const mk = () => { const c = H.layer(TW, TH), x = c.getContext('2d'); return [c, x, x.createImageData(TW, TH)]; };
    const [tc, tcx, ti] = mk(), [bc, bcx, bi] = mk(), td = ti.data, bd = bi.data;
    for (let y = 0; y < TH; y++) {
      const row = Math.floor(y / rowH), ly = y - row * rowH, off = (row % 2) * (brW / 2);
      for (let xx = 0; xx < TW; xx++) {
        const lxp = (xx + off) % brW, ej = (bh(xx >> 2, row) - 0.5) * 2.2;
        if (ly < mort + ej * 0.5 || lxp < mort + ej * 0.6) continue;
        const top = ly - (mort + ej * 0.5), bot = rowH - ly, i = (y * TW + xx) * 4;
        if (top < 3.5) { td[i] = td[i + 1] = td[i + 2] = 255; td[i + 3] = 255 * (1 - top / 3.5) * (lxp - mort < 2 ? 0.5 : 1); }
        if (bot < 3) { bd[i] = bd[i + 1] = bd[i + 2] = 255; bd[i + 3] = 255 * (1 - bot / 3); }
      }
    }
    tcx.putImageData(ti, 0, 0); bcx.putImageData(bi, 0, 0);
    tcx.globalAlpha = 0.55; tcx.drawImage(bc, 0, 0);
    return (edgeTiles = { both: tc });
  }
  // wet sidewalk tile (concrete, aggregate speckle) + puddle alpha, periodic in x so it pans with the wall
  let paveTile = null;
  function getPaveTile(W) {
    if (paveTile && paveTile.w === W) return paveTile;
    const PW = W * 2, PH = 120, nz = H.makeNoise(4410), R = H.rng(4411);
    const c = H.layer(PW, PH), x = c.getContext('2d'), img = x.createImageData(PW, PH), d = img.data;
    const p = H.layer(PW, PH), px = p.getContext('2d'), pimg = px.createImageData(PW, PH), pd = pimg.data;
    for (let y = 0; y < PH; y++) for (let xx = 0; xx < PW; xx++) {
      const a = xx / PW * Math.PI * 2, cx0 = Math.cos(a), sx0 = Math.sin(a);
      const g = R() - 0.5, st = nz.n3(cx0 * 9, sx0 * 9, y * 0.06) * 0.5 + nz.n3(cx0 * 40, sx0 * 40, y * 0.25) * 0.3;
      let base = 22 + g * 12 + st * 9;
      if (y < 4) base = 54 + g * 14 - y * 3; else if (y < 12) base = 40 + g * 14 - (y - 4) * 1.6; // curb lip
      base *= 1 - y / PH * 0.35;
      const i = (y * PW + xx) * 4; d[i] = base * 0.92; d[i + 1] = base * 0.95; d[i + 2] = base * 1.1; d[i + 3] = 255;
      const v = nz.n3(cx0 * 4.5, sx0 * 4.5, y * 0.03 + 20) + 0.4 * nz.n3(cx0 * 12, sx0 * 12, y * 0.08);
      pd[i] = pd[i + 1] = pd[i + 2] = 255; pd[i + 3] = 255 * H.smooth(-0.12, 0.08, v) * H.smooth(6, 16, y);
    }
    x.putImageData(img, 0, 0); px.putImageData(pimg, 0, 0);
    // aggregate speckle catching light
    for (let k = 0; k < 1400; k++) { x.fillStyle = `rgba(200,200,220,${R() * 0.16})`; x.fillRect(R() * PW, 12 + Math.pow(R(), 0.8) * (PH - 12), 1 + R(), 1); }
    return (paveTile = { w: W, c, p, PW });
  }
  function catPath(x, cx, cy, s) {
    x.beginPath();
    x.moveTo(cx - s * 0.95, cy - s * 0.1);
    x.lineTo(cx - s * 0.8, cy - s * 1.05); x.lineTo(cx - s * 0.35, cy - s * 0.72);
    x.quadraticCurveTo(cx, cy - s * 0.82, cx + s * 0.35, cy - s * 0.72);
    x.lineTo(cx + s * 0.8, cy - s * 1.05); x.lineTo(cx + s * 0.95, cy - s * 0.1);
    x.bezierCurveTo(cx + s * 1.0, cy + s * 0.75, cx - s * 1.0, cy + s * 0.75, cx - s * 0.95, cy - s * 0.1);
    x.moveTo(cx - s * 0.45, cy - s * 0.14); x.lineTo(cx - s * 0.2, cy - s * 0.1);
    x.moveTo(cx + s * 0.45, cy - s * 0.14); x.lineTo(cx + s * 0.2, cy - s * 0.1);
    x.moveTo(cx - s * 0.09, cy + s * 0.1); x.lineTo(cx + s * 0.09, cy + s * 0.1); x.lineTo(cx, cy + s * 0.2);
    x.quadraticCurveTo(cx - s * 0.1, cy + s * 0.34, cx - s * 0.24, cy + s * 0.28);
    x.moveTo(cx, cy + s * 0.2); x.quadraticCurveTo(cx + s * 0.1, cy + s * 0.34, cx + s * 0.24, cy + s * 0.28);
    x.moveTo(cx - s * 0.38, cy + s * 0.18); x.lineTo(cx - s * 1.05, cy + s * 0.06);
    x.moveTo(cx + s * 0.38, cy + s * 0.18); x.lineTo(cx + s * 1.05, cy + s * 0.06);
  }
  function dogPath(x, cx, cy, s) {
    x.beginPath();
    x.moveTo(cx - s * 0.55, cy - s * 0.7);
    x.quadraticCurveTo(cx, cy - s * 0.95, cx + s * 0.55, cy - s * 0.7);
    x.bezierCurveTo(cx + s * 0.78, cy - s * 0.1, cx + s * 0.55, cy + s * 0.78, cx, cy + s * 0.8);
    x.bezierCurveTo(cx - s * 0.55, cy + s * 0.78, cx - s * 0.78, cy - s * 0.1, cx - s * 0.55, cy - s * 0.7);
    x.moveTo(cx - s * 0.55, cy - s * 0.7); x.bezierCurveTo(cx - s * 1.2, cy - s * 0.6, cx - s * 1.15, cy + s * 0.3, cx - s * 0.8, cy + s * 0.25);
    x.moveTo(cx + s * 0.55, cy - s * 0.7); x.bezierCurveTo(cx + s * 1.2, cy - s * 0.6, cx + s * 1.15, cy + s * 0.3, cx + s * 0.8, cy + s * 0.25);
    x.moveTo(cx - s * 0.2, cy - s * 0.2); x.arc(cx - s * 0.26, cy - s * 0.2, s * 0.06, 0, 7);
    x.moveTo(cx + s * 0.32, cy - s * 0.2); x.arc(cx + s * 0.26, cy - s * 0.2, s * 0.06, 0, 7);
    x.moveTo(cx - s * 0.16, cy + s * 0.18); x.quadraticCurveTo(cx, cy + s * 0.06, cx + s * 0.16, cy + s * 0.18); x.quadraticCurveTo(cx, cy + s * 0.32, cx - s * 0.16, cy + s * 0.18);
    x.moveTo(cx, cy + s * 0.3); x.lineTo(cx, cy + s * 0.44);
    x.moveTo(cx - s * 0.22, cy + s * 0.48); x.quadraticCurveTo(cx, cy + s * 0.6, cx + s * 0.22, cy + s * 0.48);
  }
  function brainPath(x, cx, cy, s) {
    x.beginPath();
    for (let i = 0; i <= 120; i++) {
      const a = i / 120 * Math.PI * 2, r = 1 + 0.07 * Math.max(0, Math.cos(a * 9));
      const px = cx + Math.cos(a) * s * 1.15 * r, py = cy + Math.sin(a) * s * 0.85 * r;
      if (i === 0) x.moveTo(px, py); else x.lineTo(px, py);
    }
    x.moveTo(cx, cy - s * 0.8);
    for (let i = 1; i <= 20; i++) x.lineTo(cx + Math.sin(i * 1.3) * s * 0.06, cy - s * 0.8 + i / 20 * s * 1.55);
    [[-1, -0.35], [-1, 0.2], [1, -0.3], [1, 0.25]].forEach(([sd, oy]) => {
      x.moveTo(cx + sd * s * 0.2, cy + oy * s);
      for (let i = 1; i <= 16; i++) { const u = i / 16; x.lineTo(cx + sd * s * (0.2 + u * 0.7), cy + oy * s + Math.sin(u * Math.PI * 3) * s * 0.1); }
    });
  }

  function neonExplainer(ctx, W, Hh, t) {
    const hs = (n) => { const v = Math.sin(n * 91.731 + 7.13) * 43758.5453; return v - Math.floor(v); };
    const ign = (t0, len = 0.3) => t < t0 ? 0 : t - t0 > len ? 1 : (hs(Math.floor(t * 40) + t0 * 977) > 0.42 ? 1 : 0);
    const sm = H.smooth, E = H.ease;
    // ---- camera: whip-pans along the wall between beats ----
    const pans = [[2.0, 2.8], [5.8, 6.5], [10.4, 11.1], [12.9, 13.5]];
    let cam = 0; pans.forEach(([a, b]) => { cam += 1280 * E.inOut(sm(a, b, t)); });
    const col = H.layer(W, Hh), cx = col.getContext('2d');
    const txt = H.layer(W, Hh), tx = txt.getContext('2d');
    const txtB = H.layer(W, Hh), tbx = txtB.getContext('2d'); // fat script glyphs: eroded harder so the hot core stays thin
    const core = H.layer(W, Hh), kx = core.getContext('2d');
    const off = H.layer(W, Hh), ox = off.getContext('2d');
    [cx, tx, tbx, kx, ox].forEach((c) => { c.lineCap = 'round'; c.lineJoin = 'round'; c.translate(-cam, 0); });
    // physical hardware (world coords): glass-tube clips, electrode housings, painted-out blockout runs
    const HW = { clips: [], elec: [] }, USED = { thin: null, fat: null };
    const clip = (x, y, a = 0) => HW.clips.push([x, y, a]);
    const elec = (x, y, a) => HW.elec.push([x, y, a]);
    const blockout = (pathFn, w = 7) => {
      ox.save(); ox.strokeStyle = 'rgb(13,11,14)'; ox.lineWidth = w; pathFn(ox); ox.stroke();
      ox.strokeStyle = 'rgba(150,110,130,0.28)'; ox.lineWidth = w * 0.28; ox.translate(-1, -1.5); pathFn(ox); ox.stroke(); ox.restore();
    };
    const quadPt = (x0, y0, qx, qy, x1, y1, u) => [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * qx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * qy + u * u * y1];
    const ellClip = (ex, ey, rx, ry, a) => clip(ex + Math.cos(a) * rx, ey + Math.sin(a) * ry, Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx));
    // blockout run between two words of a lettered line: dips under the baseline, electrodes where it enters the glass
    const wordGap = (s, cxw, y, font, splitAt, dip = 30) => {
      tx.font = font; const wd = tx.measureText(s).width, x0 = cxw - wd / 2;
      const xa = x0 + tx.measureText(s.slice(0, splitAt)).width - 10, xb = x0 + tx.measureText(s.slice(0, splitAt + 1)).width + 10;
      blockout((g) => { g.beginPath(); g.moveTo(xa, y - 4); g.bezierCurveTo(xa + 6, y + dip, xb - 6, y + dip, xb, y - 4); });
      elec(xa, y - 4, -1.9); elec(xb, y - 4, -1.25);
      return [x0, x0 + wd];
    };
    cx.globalCompositeOperation = 'lighter'; kx.globalCompositeOperation = 'lighter';
    const tube = (pathFn, c, k, w = 7) => {
      ox.strokeStyle = 'rgb(44,36,48)'; ox.lineWidth = w; pathFn(ox); ox.stroke();
      ox.strokeStyle = 'rgba(170,160,180,0.2)'; ox.lineWidth = w * 0.3; ox.save(); ox.translate(-1, -1.5); pathFn(ox); ox.stroke(); ox.restore();
      if (k <= 0) return;
      cx.strokeStyle = H.rgba(c, k); cx.lineWidth = w; pathFn(cx); cx.stroke();
      kx.strokeStyle = H.rgba(H.mix(c, [255, 255, 255], 0.82), k); kx.lineWidth = w * 0.36; pathFn(kx); kx.stroke();
    };
    const ntext = (s, x, y, font, c, k, align = 'center', lw = 3, ghost = true) => {
      if (ghost) { ox.font = font; ox.textAlign = align; ox.lineWidth = lw; ox.fillStyle = ox.strokeStyle = 'rgb(44,36,48)'; ox.fillText(s, x, y); ox.strokeText(s, x, y); }
      if (k <= 0) return;
      const fat = font.includes('Gloria');
      { // screen-space bbox of the lit text, so the core erosion only touches that region
        tx.font = font; const fsz = +(font.match(/(\d+)px/) || [0, 60])[1], w = tx.measureText(s).width, pad = lw + 8;
        const x0 = (align === 'center' ? x - w / 2 : x) - cam - pad, b = [x0, y - fsz * 1.15 - pad, x0 + w + 2 * pad, y + fsz * 0.55 + pad];
        const key = fat ? 'fat' : 'thin', o = USED[key];
        USED[key] = o ? [Math.min(o[0], b[0]), Math.min(o[1], b[1]), Math.max(o[2], b[2]), Math.max(o[3], b[3])] : b;
      }
      for (const [g, cc] of [[cx, c], [fat ? tbx : tx, H.mix(c, [255, 255, 255], 0.85)]]) {
        g.font = font; g.textAlign = align; g.lineWidth = fat && g === cx ? lw + 3 : lw; g.fillStyle = g.strokeStyle = H.rgba(cc, k);
        g.fillText(s, x, y); g.strokeText(s, x, y);
      }
    };
    const wordByLetter = (s, x, y, font, c, t0, dt, align = 'center') => {
      tx.font = font; const wd = tx.measureText(s).width; let x0 = align === 'center' ? x - wd / 2 : x;
      for (let i = 0; i < s.length; i++) { if (s[i] !== ' ') ntext(s[i], x0 + tx.measureText(s.slice(0, i)).width, y, font, c, ign(t0 + i * dt), 'left'); }
    };
    // segmented chase arrow along a quadratic; draws on segment by segment
    const arrow = (x0, y0, qx, qy, x1, y1, c, prog, n = 12, w = 6) => {
      const P = (u) => [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * qx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * qy + u * u * y1];
      for (let i = 0; i < n; i++) {
        const a = P(i / n + 0.012), b = P((i + 1) / n - 0.012);
        const lit = prog * n > i + 0.5 ? 0.45 + 0.55 * ((((i - t * 14) % 4) + 4) % 4 < 1.4 ? 1 : 0) : 0;
        tube((g) => { g.beginPath(); g.moveTo(...a); g.lineTo(...b); }, c, lit, w);
      }
      const e = P(1), pe = P(0.94), ang = Math.atan2(e[1] - pe[1], e[0] - pe[0]);
      tube((g) => { g.beginPath(); g.moveTo(e[0] + Math.cos(ang + 2.5) * 22, e[1] + Math.sin(ang + 2.5) * 22); g.lineTo(...e); g.lineTo(e[0] + Math.cos(ang - 2.5) * 22, e[1] + Math.sin(ang - 2.5) * 22); }, c, prog >= 1 ? 1 : 0, w);
    };
    const frame = (x, y, w, h, c, k) => tube((g) => { g.beginPath(); g.roundRect(x, y, w, h, 14); }, c, k, 6);
    const icon = (kind, x, y, s, c, k) => tube((g) => (kind === 'cat' ? catPath : dogPath)(g, x, y, s), c, k, 5);
    const seen = (X) => cam > X - 1400 && cam < X + 1400;

    // ---------------- A: HOOK ----------------
    if (seen(0)) {
      ntext('How does', 640, 250, '400 74px "Poiret One"', NX.cyan, ign(0.15, 0.35), 'center', 4.5);
      wordByLetter('AI learn', 600, 430, '400 160px "Gloria Hallelujah"', NX.pink, 0.55, 0.09);
      const q = t > 1.4 ? (t < 2.3 && hs(Math.floor(t * 12)) > 0.6 ? 0.25 : 1) : 0;
      ntext('?', 990, 430, '400 160px "Gloria Hallelujah"', NX.warm, q, 'left');
      tube((g) => { g.beginPath(); g.moveTo(330, 470); g.quadraticCurveTo(640, 500, 960, 466); }, NX.violet, ign(1.25), 6);
      wordGap('How does', 640, 250, '400 74px "Poiret One"', 3, 22);
      wordGap('AI learn', 600, 430, '400 160px "Gloria Hallelujah"', 2, 40);
      elec(330, 470, Math.PI); elec(960, 466, 0);
      for (const u of [0.2, 0.5, 0.8]) { const q = quadPt(330, 470, 640, 500, 960, 466, u); clip(q[0], q[1], 0); }
    }
    // ---------------- B: DATA ----------------
    const XB = 1280;
    if (seen(XB)) {
      for (let k = 0; k < 6; k++) {
        const c0 = k % 2, r0 = Math.floor(k / 2);
        const fx = XB + 110 + c0 * 200, fy = 70 + r0 * 170, t0 = 2.85 + k * 0.17;
        const cyc = Math.max(0, Math.floor((t - 3.6 - k * 0.11) * 2.6));
        const kind = (k + cyc) % 2 ? 'dog' : 'cat';
        const swapOff = t > 3.6 && ((t - 3.6 - k * 0.11) * 2.6) % 1 < 0.12 ? 0 : 1;
        const kk = ign(t0) * swapOff;
        frame(fx, fy, 160, 104, NX.violet, ign(t0));
        icon(kind, fx + 80, fy + 56, 34, NX.warm, kk);
        tube((g) => { g.beginPath(); g.moveTo(fx + 80, fy + 104); g.lineTo(fx + 80, fy + 116); }, NX.cyan, ign(t0 + 0.05), 3);
        tube((g) => { g.beginPath(); g.roundRect(fx + 36, fy + 115, 88, 38, 14); }, NX.cyan, ign(t0 + 0.05), 3.5);
        ntext(kind, fx + 80, fy + 144, '400 31px "Poiret One"', NX.warm, ign(t0 + 0.05) * swapOff, 'center', 2.2);
        clip(fx + 34, fy, 0); clip(fx + 126, fy, 0); clip(fx, fy + 52, Math.PI / 2); clip(fx + 160, fy + 52, Math.PI / 2);
      }
      elec(XB + 540, 320, Math.PI); clip(XB + 650, 309, 0);
      for (const a of [-2.3, -1.0, 0.5, 2.5]) ellClip(XB + 960, 290, 161, 119, a);
      arrow(XB + 540, 320, XB + 640, 300, XB + 760, 312, NX.warm, sm(3.05, 3.45, t), 10);
      const bk = ign(3.3) * (0.85 + 0.15 * Math.sin(t * 9));
      tube((g) => brainPath(g, XB + 960, 290, 140), NX.pink, bk, 7);
      const p = sm(3.4, 5.25, t), val = p >= 1 ? 1000000 : Math.round(Math.pow(10, 6 * p));
      ntext(val.toLocaleString('en-US'), XB + 960, 520, '400 66px "Poiret One"', NX.warm, ign(3.35), 'center', 4, false);
      ntext('examples', XB + 960, 572, '400 34px "Poiret One"', NX.cyan, ign(3.5), 'center', 2.4);
    }
    // ---------------- C: GUESS -> CHECK -> ADJUST loop ----------------
    const XC = 2560;
    if (seen(XC)) {
      frame(XC + 80, 222, 180, 132, NX.violet, ign(6.45));
      icon('cat', XC + 170, 292, 44, NX.warm, ign(6.5));
      arrow(XC + 280, 290, XC + 380, 284, XC + 455, 290, NX.cyan, sm(6.65, 6.95, t), 6);
      ntext('Guess', XC + 368, 246, '400 46px "Poiret One"', NX.warm, ign(6.7), 'center', 3);
      const adj = sm(8.85, 9.45, t);
      const bglow = ign(6.5) * (adj > 0 && adj < 1 ? 0.6 + 0.4 * hs(Math.floor(t * 20)) : 1);
      tube((g) => brainPath(g, XC + 600, 290, 112), adj >= 1 ? NX.pink : H.mix(NX.pink, NX.violet, adj), bglow, 7);
      arrow(XC + 745, 290, XC + 800, 284, XC + 862, 290, NX.cyan, sm(7.0, 7.25, t), 5);
      tube((g) => { g.beginPath(); g.roundRect(XC + 872, 222, 230, 132, 30); g.moveTo(XC + 900, 354); g.lineTo(XC + 884, 384); g.lineTo(XC + 940, 354); }, NX.warm, ign(7.2), 6);
      const wrong = t < 9.55 ? ign(7.4) : 0;
      ntext('dog?', XC + 987, 312, '400 78px "Gloria Hallelujah"', NX.pink, wrong, 'center', 2);
      const xOn = t >= 7.85 && t < 9.55 ? (t < 8.6 ? (Math.floor(t * 7) % 2 ? 1 : 0.15) : 1) : 0;
      tube((g) => { g.beginPath(); g.moveTo(XC + 1152, 252); g.lineTo(XC + 1212, 322); g.moveTo(XC + 1212, 252); g.lineTo(XC + 1152, 322); }, NX.red, xOn, 9);
      tube((g) => { g.beginPath(); g.arc(XC + 1182, 287, 58, 0, Math.PI * 2); }, NX.red, t < 9.55 ? ign(7.95) : 0, 5);
      ntext('Check', XC + 1160, 196, '400 46px "Poiret One"', NX.warm, ign(7.95), 'center', 3);
      // error signal travels back to the model
      arrow(XC + 1150, 360, XC + 980, 600, XC + 715, 470, NX.red, sm(8.2, 8.8, t), 14);
      // knobs (weights) step to new settings
      for (let i = 0; i < 3; i++) {
        const kx0 = XC + 520 + i * 70, ky0 = 482;
        const a0 = [-2.2, -0.6, -1.4][i], a1 = [-0.9, -1.9, -0.3][i];
        const st = Math.floor(adj * 3 + 0.0001) / 3; // stepped: tube banks switch
        const a = H.lerp(a0, a1, st);
        tube((g) => { g.beginPath(); g.arc(kx0, ky0, 22, 0, Math.PI * 2); }, NX.cyan, ign(6.6 + i * 0.05), 4);
        tube((g) => { g.beginPath(); g.moveTo(kx0, ky0); g.lineTo(kx0 + Math.cos(a) * 18, ky0 + Math.sin(a) * 18); }, NX.warm, ign(6.6 + i * 0.05), 4);
      }
      ntext('Adjust', XC + 600, 564, '400 46px "Poiret One"', NX.warm, ign(8.8), 'center', 3);
      clip(XC + 125, 222, 0); clip(XC + 215, 222, 0); clip(XC + 125, 354, 0); clip(XC + 215, 354, 0);
      elec(XC + 280, 290, Math.PI); elec(XC + 745, 290, Math.PI); elec(XC + 1150, 360, -2.2);
      for (const a of [-2.2, -0.8, 0.9, 2.4]) ellClip(XC + 600, 290, 129, 95, a);
      clip(XC + 935, 222, 0); clip(XC + 1040, 222, 0); clip(XC + 1040, 354, 0);
      clip(XC + 1182, 229, 0); clip(XC + 1182, 345, 0);
      for (let i = 0; i < 3; i++) clip(XC + 520 + i * 70, 504, 0);
      const right = ign(9.6);
      ntext('cat', XC + 987, 312, '400 78px "Gloria Hallelujah"', NX.green, right, 'center', 2);
      tube((g) => { g.beginPath(); g.moveTo(XC + 1150, 290); g.lineTo(XC + 1175, 318); g.lineTo(XC + 1220, 256); }, NX.green, ign(9.8), 9);
    }
    // ---------------- D: PROGRESS ----------------
    const XD = 3840;
    if (seen(XD)) {
      tube((g) => { g.beginPath(); g.moveTo(XD + 140, 110); g.lineTo(XD + 140, 500); g.lineTo(XD + 780, 500); }, NX.cyan, ign(10.95), 5);
      ntext('training rounds', XD + 460, 552, '400 38px "Poiret One"', NX.cyan, ign(11.05), 'center', 2.6);
      const pts = []; for (let r = 0; r <= 12; r++) { const acc = 0.97 - 0.36 * Math.exp(-r / 3.2) + (r > 0 && r < 12 ? (hs(r) - 0.5) * 0.03 : 0); pts.push([XD + 160 + r * 50, 500 - (acc - 0.5) / 0.5 * 380]); }
      const lp = sm(11.2, 12.45, t) * 12;
      tube((g) => { g.beginPath(); g.moveTo(...pts[0]); for (let r = 1; r <= Math.floor(lp); r++) g.lineTo(...pts[r]); const f = lp - Math.floor(lp); if (f > 0 && lp < 12) { const a = pts[Math.floor(lp)], b = pts[Math.floor(lp) + 1]; g.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); } }, NX.warm, lp > 0 ? 1 : 0, 6);
      for (let r = 0; r <= 12; r += 2) if (lp >= r) tube((g) => { g.beginPath(); g.arc(pts[r][0], pts[r][1], 7, 0, Math.PI * 2); }, NX.pink, 1, 4);
      ntext('Accuracy', XD + 1010, 210, '400 50px "Poiret One"', NX.cyan, ign(11.0), 'center', 3);
      const pct = Math.round(61 + 36 * E.out(sm(11.2, 12.45, t)));
      const flash = t > 12.45 && t < 12.95 ? (Math.floor(t * 10) % 2 ? 1 : 0.2) : 1;
      ntext(pct + '%', XD + 1010, 390, '400 150px "Gloria Hallelujah"', pct >= 97 ? NX.green : NX.pink, ign(11.05) * flash, 'center', 3, false);
      tube((g) => { g.beginPath(); g.ellipse(XD + 1010, 335, 190, 105, -0.05, 0, Math.PI * 2); }, NX.warm, ign(12.55, 0.35), 6);
      elec(XD + 140, 110, -Math.PI / 2); elec(XD + 780, 500, 0);
      clip(XD + 140, 230, Math.PI / 2); clip(XD + 140, 400, Math.PI / 2); clip(XD + 300, 500, 0); clip(XD + 620, 500, 0);
      for (const a of [-2.0, -0.9, 0.9, 2.2]) ellClip(XD + 1010, 335, 190, 105, a);
    }
    // ---------------- E: TAKEAWAY ----------------
    const XE = 5120;
    if (seen(XE)) {
      ntext('More examples', XE + 640, 230, '400 82px "Poiret One"', NX.cyan, ign(13.4, 0.3), 'center', 4.5);
      arrow(XE + 640, 262, XE + 646, 300, XE + 640, 345, NX.warm, sm(13.6, 13.85, t), 4, 7);
      wordByLetter('better guesses', XE + 640, 470, '400 120px "Gloria Hallelujah"', NX.pink, 13.85, 0.04);
      wordGap('More examples', XE + 640, 230, '400 82px "Poiret One"', 4, 24);
      wordGap('better guesses', XE + 640, 470, '400 120px "Gloria Hallelujah"', 6, 36);
      elec(XE + 640, 262, -Math.PI / 2);
    }

    // ---------- compose: brick wall lit by the signs ----------
    kx.setTransform(1, 0, 0, 1, 0, 0); for (const [m, r, b] of [[txt, 2, USED.thin], [txtB, 5, USED.fat]]) { if (!b) continue; const x0 = Math.max(r, Math.floor(b[0])), y0 = Math.max(r, Math.floor(b[1])), x1 = Math.min(W - r, Math.ceil(b[2])), y1 = Math.min(Hh - r, Math.ceil(b[3])); if (x1 - x0 < 2 || y1 - y0 < 2) continue; const bw = x1 - x0, bh = y1 - y0, c = H.layer(bw, bh), e = c.getContext('2d'); e.drawImage(m, x0, y0, bw, bh, 0, 0, bw, bh); e.globalCompositeOperation = 'destination-in'; for (let a = 0; a < 8; a++) { const dx = Math.round(Math.cos(a * Math.PI / 4) * r), dy = Math.round(Math.sin(a * Math.PI / 4) * r); e.drawImage(m, x0 - dx, y0 - dy, bw, bh, 0, 0, bw, bh); } kx.drawImage(c, x0, y0); }
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, Hh);
    const tile = getBrickTile(), tw = tile.width, tx0 = -(((cam % tw) + tw) % tw);
    for (let x = tx0; x < W; x += tw) ctx.drawImage(tile, x, 0);
    const LW8 = W / 8, LH8 = Hh / 8;
    const L = H.layer(LW8, LH8), lx = L.getContext('2d');
    lx.fillStyle = 'rgb(30,34,52)'; lx.fillRect(0, 0, LW8, LH8);
    lx.globalCompositeOperation = 'lighter';
    lx.filter = 'blur(10px)'; lx.drawImage(col, 0, 0, LW8, LH8); lx.drawImage(col, 0, 0, LW8, LH8);
    lx.filter = 'blur(3px)'; lx.globalAlpha = 0.9; lx.drawImage(col, 0, 0, LW8, LH8);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0, W, Hh); ctx.restore();
    { // brick arrises catch the sign light: top edges where the light is above, bottom edges where it is below
      const Ld = lx.getImageData(0, 0, LW8, LH8).data;
      const rimC = H.layer(LW8, LH8), ri = rimC.getContext('2d').createImageData(LW8, LH8);
      const lum = (x, y) => { const k = (H.clamp(y, 0, LH8 - 1) * LW8 + x) * 4; return Ld[k] + Ld[k + 1] + Ld[k + 2]; };
      for (let y = 0; y < LH8; y++) for (let x = 0; x < LW8; x++) {
        const k = (y * LW8 + x) * 4, dir = H.clamp((lum(x, y - 1) - lum(x, y + 1)) / 90, -1, 1);
        const up = 0.3 + Math.abs(dir) * 1.3;
        ri.data[k] = Math.max(0, Ld[k] - 30) * up; ri.data[k + 1] = Math.max(0, Ld[k + 1] - 34) * up; ri.data[k + 2] = Math.max(0, Ld[k + 2] - 52) * up; ri.data[k + 3] = 255;
      }
      rimC.getContext('2d').putImageData(ri, 0, 0);
      const et = getEdgeTiles(), rim = H.layer(W, 600), rx = rim.getContext('2d');
      for (let x = tx0; x < W; x += tw) rx.drawImage(et.both, x, 0);
      rx.globalCompositeOperation = 'source-in'; rx.drawImage(rimC, 0, 0, LW8, 600 / 8, 0, 0, W, 600);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(rim, 0, 0); ctx.restore();
    }
    // tubes stand ~4cm off the wall: soft contact shadow, then the glass itself
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.6;
    ctx.drawImage(blurSmall(off, 4, 0.25), 5, 9, W, Hh); ctx.restore();
    ctx.drawImage(off, 0, 0);
    // electrode housings where runs dive into the wall
    ctx.save(); ctx.translate(-cam, 0);
    for (const [x, y, a] of HW.elec) {
      if (x - cam < -40 || x - cam > W + 40) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = '#0d0c0f'; ctx.beginPath(); ctx.roundRect(-7, -6, 22, 12, 4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-4, -5, 15, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(13, -4, 4, 8);
      ctx.restore();
    }
    ctx.restore();
    // wet sidewalk: concrete tile panned with the wall
    const pave = getPaveTile(W), px0 = -(((cam % pave.PW) + pave.PW) % pave.PW);
    for (let x = px0; x < W; x += pave.PW) ctx.drawImage(pave.c, x, 600);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 600, W, 3);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // halos are blurred at low res with extra saturation, so the glass rim stays deep colour around a thin hot core
    const blurSat = (src, px, sc, sat) => { const w = Math.ceil(src.width * sc), h = Math.ceil(src.height * sc), c = H.layer(w, h), x = c.getContext('2d'); x.filter = `blur(${Math.max(0.5, px * sc)}px) saturate(${sat})`; x.drawImage(src, 0, 0, w, h); return c; };
    ctx.globalAlpha = 0.55; ctx.drawImage(blurSat(col, 60, 0.125, 1.6), 0, 0, W, Hh);
    ctx.globalAlpha = 0.75; ctx.drawImage(blurSat(col, 18, 0.25, 1.8), 0, 0, W, Hh);
    ctx.globalAlpha = 0.6; ctx.drawImage(blurSat(col, 5, 0.5, 2.2), 0, 0, W, Hh);
    ctx.globalAlpha = 1; ctx.drawImage(col, 0, 0); ctx.drawImage(core, 0, 0);
    ctx.globalAlpha = 0.5; ctx.drawImage(blurSmall(core, 2.5, 0.5), 0, 0, W, Hh);
    ctx.restore();
    // mounting clips over the glass
    ctx.save(); ctx.translate(-cam, 0);
    for (const [x, y, a] of HW.clips) {
      if (x - cam < -20 || x - cam > W + 20) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = 'rgba(30,28,34,0.92)'; ctx.beginPath(); ctx.roundRect(-2.5, -8, 5, 16, 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(-1.5, -7, 1, 14);
      ctx.restore();
    }
    ctx.restore();
    // reflection in the wet pavement: rippled mirror rows, vertical streak smear, full mirror only inside puddles
    {
      const RS = 0.25, src = blurSmall(col, 6, RS), GH = Hh - 600, refl = H.layer(W, GH), rfx = refl.getContext('2d');
      for (let y = 604; y < Hh; y += 2) {
        const gy = y - 600, sy = 600 - gy / 0.3;
        if (sy < 0) break;
        const offx = Math.sin(y * 0.35 + t * 6) * (1.5 + gy * 0.035) + Math.sin(y * 0.11 - t * 2.3 + 1.7) * (1 + gy * 0.03);
        rfx.drawImage(src, 0, sy * RS, src.width, (2 / 0.3) * RS, offx, gy, W, 2);
      }
      const smear = H.layer(W, 10), smx = smear.getContext('2d');
      smx.filter = 'blur(1.5px)'; smx.drawImage(refl, 0, 4, W, GH - 4, 0, 0, W, 10);
      const rm = H.layer(W, GH), rmx = rm.getContext('2d');
      for (let x = px0; x < W; x += pave.PW) rmx.drawImage(pave.p, x, 0);
      rmx.globalCompositeOperation = 'source-in'; rmx.drawImage(refl, 0, 0);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.45; ctx.drawImage(smear, 0, 0, W, 10, 0, 604, W, GH - 4);
      ctx.globalAlpha = 0.22; ctx.drawImage(refl, 0, 600);
      ctx.globalAlpha = 0.6; ctx.drawImage(rm, 0, 600);
      ctx.restore();
    }
    H.vignette(ctx, W, Hh, 0.55, '4,2,10');
    H.grain(ctx, W, Hh, 0.045, 31 + Math.floor(t * 24), false);
  }

  // Sound: a night street after rain. Transformer hum and light drizzle underneath; every tube that lights makes the
  // real ignition noise (contactor click, then a 120 Hz buzz that stutters exactly with the on-screen flicker, then
  // settles); chase arrows tick relay by relay; whip-pans are a fast air smear with the passing sign hum bending past.
  // All times are copied from neonExplainer() above (same ign() flicker hash, same smooth/ease windows).
  // Voiceover mode (k.vo): beds drop out, letter-by-letter crackle, chase ticks, counter re-lights and the per-scene
  // ballast hum are minor (quieter); scene transitions, WRONG, the correction, the 97% hit and the resolve stay full.
  function neonSound(k) {
    const sm = H.smooth, E = H.ease, D = 15;
    const hs = (n) => { const v = Math.sin(n * 91.731 + 7.13) * 43758.5453; return v - Math.floor(v); }; // = neonExplainer hs
    const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
    // contactor / relay click as a sign's circuit closes: dull, low, no ring
    const relay = (t, g = 1, pan = 0) => {
      k.noise(t, { dur: 0.022, filter: 'bandpass', f: 1300, q: 1.4, gain: 0.32 * g, a: 0.001, pan });
      k.tone(t, { f: [[0, 190], [0.04, 75]], dur: 0.06, gain: 0.2 * g, pan });
    };
    // one stretch of lit tube: 120 Hz gas buzz (bright band + body) with a tiny spark at the strike
    const buzzRun = (t, dur, g, pan, f = 120) => {
      k.tone(t, { f, type: 'sawtooth', dur: dur + 0.012, gain: 0.075 * g, a: 0.002, hold: dur * 0.85, filter: 'bandpass', f2: 1700, q: 2, pan });
      k.tone(t, { f, type: 'sawtooth', dur: dur + 0.02, gain: 0.06 * g, a: 0.002, hold: dur * 0.85, filter: 'lowpass', f2: 480, pan });
      k.noise(t, { dur: 0.008, filter: 'highpass', f: 2600, gain: 0.12 * g, a: 0.001, pan });
    };
    // ign(t0, len) from the explainer, reproduced slot by slot (40 slots/s): buzz while lit, silence while dark,
    // then the latch tail where the tube holds and the buzz settles into the hum.
    const ignite = (t0, o = {}) => {
      const len = o.len || 0.3, g = o.gain == null ? 1 : o.gain, pan = o.pan || 0, f = o.f || 120;
      if (!o.noClick) relay(t0, g * (o.click || 1), pan);
      let s = Math.floor(t0 * 40), run = null;
      const flush = (end) => { if (run != null && end - run > 0.004) buzzRun(run, end - run, g, pan, f); run = null; };
      for (; s / 40 < t0 + len; s++) {
        const a = Math.max(t0, s / 40), b = Math.min((s + 1) / 40, t0 + len), on = hs(s + t0 * 977) > 0.42;
        if (on && run == null) run = a; else if (!on) flush(a);
        if (b >= t0 + len) break;
      }
      flush(t0 + len);
      k.tone(t0 + len, { f, type: 'sawtooth', dur: o.tail || 0.35, gain: 0.06 * g, a: 0.004, filter: 'bandpass', f2: 900, q: 1.5, pan });
    };
    // chase-light arrow: one relay tick per segment that latches (segment i lit when prog*n > i+0.5), throttled
    const chase = (a, b, n, pan, gap = 0.08) => {
      let last = -1;
      for (let i = 0; i < n; i++) { const ti = when((t) => sm(a, b, t) * n, i + 0.5 + 1e-6, a, b + 0.01);
        if (ti - last >= gap) { k.noise(ti, { dur: 0.016, filter: 'bandpass', f: 1500 + i * 25, q: 2, gain: 0.22, a: 0.001, pan, minor: true }); last = ti; } }
      ignite(b, { len: 0.06, gain: 0.55, pan, noClick: true, tail: 0.18 }); // arrowhead latches when prog hits 1
    };
    // neon digits re-lit as the number changes: a short dry relay tick per change, throttled
    const relight = (val, a, b, gap, avoid = []) => { let last = -1, prev = val(a);
      for (let t = a; t <= b; t += 0.002) { const v = val(t);
        if (v !== prev && t - last >= gap && !avoid.some((x) => t > x - 0.03 && t < x + 0.1)) {
          k.noise(t, { dur: 0.014, filter: 'bandpass', f: 1150, q: 2.5, gain: 0.42, a: 0.001, pan: 0.35, minor: true });
          k.tone(t, { f: 120, type: 'sawtooth', dur: 0.03, gain: 0.03, filter: 'bandpass', f2: 1600, q: 2, pan: 0.35, minor: true });
          last = t; }
        prev = v; } };
    // whip-pan along the wall (eased inOut, fastest at the middle): an air smear plus the hum of the sign we pass
    const whip = (a, b) => { const d = b - a, m = d * 0.5;
      k.noise(a, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 260], [m, 1300], [d, 320]], q: 0.8, gain: 0.19, a: m * 0.9 });
      k.tone(a + d * 0.2, { f: [[0, 112], [d * 0.3, 138], [d * 0.6, 96]], type: 'sawtooth', dur: d * 0.6, gain: 0.05, a: d * 0.25, filter: 'lowpass', f2: 700 });
    };
    // ballast hum of the sign in view: rises when it lights, falls away during the pan off it (minor, low)
    const ballast = (t0, t1, f = 120) => k.tone(t0, { f, type: 'sawtooth', dur: t1 - t0, gain: 0.013, a: 0.3, hold: t1 - t0 - 0.7, filter: 'lowpass', f2: 380, bus: 'amb', minor: true });

    // ---- beds: transformer hum, drizzle on wet pavement, a little night air
    k.bed('hum', 0, D, { gain: 0.55 });
    k.bed('rain', 0, D, { gain: 0.18 });
    k.bed('room', 0, D, { gain: 0.35 });

    // ---- A: hook. "How does" (0.15, len .35), "AI learn" letter by letter at 0.55 + i*0.09, underline 1.25
    ignite(0.15, { len: 0.35, gain: 1.0, pan: 0, click: 1.3 });
    k.withMinor(() => [...'AI learn'].forEach((c, i) => { if (c !== ' ') ignite(0.55 + i * 0.09, { gain: 0.55, click: 0.6, pan: -0.45 + i * 0.1, tail: 0.15 }); }));
    ignite(1.25, { gain: 0.7, pan: 0 });
    // "?" lights at 1.4 and keeps cutting out (hs(floor(t*12)) > 0.6 until 2.3): a crackle each time it comes back
    ignite(1.4, { len: 0.05, gain: 0.8, pan: 0.5, f: 118 });
    k.withMinor(() => { for (let s = Math.floor(1.4 * 12); s / 12 < 2.3; s++) if (hs(s) > 0.6 && !(hs(s + 1) > 0.6) && (s + 1) / 12 < 2.3) buzzRun((s + 1) / 12, 0.05, 0.6, 0.5, 118); });
    ballast(0.15, 2.6);

    // ---- pan 1 (2.0–2.8)
    whip(2.0, 2.8);

    // ---- B: data. six frames at 2.85 + k*0.17 (labels +0.05), arrow 3.05–3.45, brain 3.3, counter 3.35, "examples" 3.5
    k.withMinor(() => { for (let c = 0; c < 6; c++) ignite(2.85 + c * 0.17, { gain: 0.5, click: 0.8, pan: -0.6 + (c % 2) * 0.2, tail: 0.2 }); });
    chase(3.05, 3.45, 10, 0);
    ignite(3.3, { gain: 1.0, pan: 0.4, f: 116, tail: 0.5 });   // the brain sign, the big one in this beat
    ignite(3.5, { gain: 0.45, pan: 0.4, tail: 0.15, noClick: true });
    // 10^(6p), p = sm(3.4, 5.25): digits re-light faster and faster, then lock at 1,000,000
    relight((t) => { const p = sm(3.4, 5.25, t); return p >= 1 ? 1e6 : Math.round(Math.pow(10, 6 * p)); }, 3.62, 5.2, 0.09, [3.69]);
    relay(5.25, 1.2, 0.35); ignite(5.25, { len: 0.08, gain: 0.7, pan: 0.35, noClick: true, tail: 0.3 });
    ballast(2.85, 6.1, 116);

    // ---- pan 2 (5.8–6.5)
    whip(5.8, 6.5);

    // ---- C: guess -> check -> adjust
    ignite(6.45, { gain: 0.85, pan: -0.5 });                                      // image frame + cat, brain (6.5)
    ignite(6.5, { gain: 0.6, pan: 0, noClick: true, f: 116 });
    k.withMinor(() => [6.6, 6.65, 6.7].forEach((t, i) => ignite(t, { gain: 0.3, click: 0.6, pan: -0.1 + i * 0.1, tail: 0.1 }))); // knobs, "Guess"
    chase(6.65, 6.95, 6, -0.25);
    chase(7.0, 7.25, 5, 0.2);
    ignite(7.2, { gain: 0.6, pan: 0.4 });                                          // speech bubble
    ignite(7.4, { gain: 1.0, pan: 0.45, f: 124 });                                 // the guess: "dog?"
    // WRONG: red X blinks on at 55/7, 57/7, 59/7 s (floor(t*7) odd), then holds from 8.6; ring + "Check" at 7.95
    relay(7.857, 1.6, 0.7); k.tone(7.857, { f: [[0, 140], [0.12, 55]], dur: 0.22, gain: 0.4, pan: 0.7 });
    [[55 / 7, 56 / 7], [57 / 7, 58 / 7], [59 / 7, 60 / 7], [8.6, 8.85]].forEach(([a, b], i) => {
      k.play('buzz', a, { f: 98, dur: b - a, gain: i === 0 ? 1.0 : 0.75, pan: 0.7 });
      if (i) relay(a, 0.7, 0.7);
    });
    ignite(7.95, { gain: 0.5, pan: 0.7, noClick: true, f: 98, tail: 0.15 });
    chase(8.2, 8.8, 14, 0.2, 0.1);                                                // error signal runs back to the model
    ignite(8.8, { gain: 0.4, pan: -0.1, tail: 0.15 });                            // "Adjust"
    // brain stutters while the weights change (8.85–9.45, hs(floor(t*20)))
    k.withMinor(() => { for (let s = Math.ceil(8.85 * 20); s / 20 < 9.45; s++) if (hs(s) > 0.55) buzzRun(s / 20, 0.04, 0.45, 0, 116); });
    // knob tube banks switch at adj = 1/3, 2/3, 1 (adj = sm(8.85, 9.45))
    for (let st = 1; st <= 3; st++) { const ts = when((t) => sm(8.85, 9.45, t) * 3 + 0.0001, st, 8.85, 9.46);
      k.play('tock', ts, { f: 300 + st * 30, gain: 0.55, pan: -0.15 }); relay(ts, 0.8, -0.15); }
    // RIGHT: green "cat" at 9.6, tick at 9.8; a low warm two-note answer under it
    ignite(9.6, { gain: 1.0, pan: 0.45, f: 120 });
    ignite(9.8, { gain: 0.8, pan: 0.7, noClick: false });
    k.play('success', 9.8, { f: 'G4', gain: 0.75, pan: 0.4 });
    ballast(6.45, 10.7, 98);

    // ---- pan 3 (10.4–11.1)
    whip(10.4, 11.1);

    // ---- D: progress. axes 10.95, "Accuracy" 11.0, % and caption 11.05; line 11.2–12.45 with dots every 2 rounds
    ignite(10.95, { gain: 0.7, pan: -0.4 });
    k.withMinor(() => ignite(11.0, { gain: 0.4, pan: 0.5, tail: 0.15 }));
    ignite(11.05, { gain: 0.8, pan: 0.5, noClick: true });
    // the plotted tube lights along its length: a low buzz that climbs as it goes
    k.tone(11.2, { f: 120, type: 'sawtooth', dur: 1.3, gain: 0.04, a: 0.15, hold: 1.0, filter: 'bandpass', f2: [[0, 500], [1.25, 1500]], q: 1.5, pan: -0.3, minor: true });
    const lp = (t) => sm(11.2, 12.45, t) * 12, dots = [];
    for (let r = 2; r <= 12; r += 2) { const td = when(lp, r, 11.2, 12.46); dots.push(td); buzzRun(td, 0.04, 0.5, -0.5 + r * 0.05); }
    // pct = round(61 + 36 * E.out(sm(11.2, 12.45))): re-lit digits, slowing until it locks on 97 (turns green)
    const pct = (t) => Math.round(61 + 36 * E.out(sm(11.2, 12.45, t)));
    const t97 = when(pct, 97, 11.2, 12.45);
    relight(pct, 11.21, t97 - 0.05, 0.085, dots);
    relay(t97, 1.2, 0.5); ignite(t97, { len: 0.1, gain: 0.8, pan: 0.5, noClick: true, f: 124, tail: 0.4 });
    // THE HIT: 97% flashes from 12.45 (on at 12.5, 12.7, 12.9) and the ring tube ignites at 12.55
    k.play('thud', 12.5, { f: 90, gain: 1.1 }); relay(12.5, 1.8, 0.4);
    [[12.5, 12.6], [12.7, 12.8], [12.9, 12.95]].forEach(([a, b], i) => k.tone(a, { f: 124, type: 'sawtooth', dur: b - a + 0.02, gain: 0.11 - i * 0.02, a: 0.002, hold: (b - a) * 0.8, filter: 'bandpass', f2: 1400, q: 1.2, pan: 0.4 }));
    ignite(12.55, { len: 0.35, gain: 1.2, pan: 0.4, f: 120, tail: 0.6 });
    [120, 240, 360].forEach((f, i) => k.tone(12.5, { f, type: 'sawtooth', dur: 1.2, gain: 0.03 / (i + 1), a: 0.02, hold: 0.3, filter: 'lowpass', f2: 900, verb: 0.3, pan: 0.3 }));
    ballast(10.95, 13.3, 124);

    // ---- pan 4 (12.9–13.5)
    whip(12.9, 13.5);

    // ---- E: takeaway. "More examples" 13.4 (len .3), arrow 13.6–13.85, "better guesses" letters 13.85 + i*0.04
    ignite(13.4, { gain: 0.9, pan: 0 });
    chase(13.6, 13.85, 4, 0);
    k.withMinor(() => [...'better guesses'].forEach((c, i) => { if (c !== ' ') ignite(13.85 + i * 0.04, { gain: 0.32, click: i % 3 ? 0 : 0.5, pan: -0.5 + i * 0.075, tail: 0.1 }); }));
    // resolve: as the last letters settle, the hum blooms (slow attack) into a chord on its own harmonics
    const tEnd = 13.85 + 13 * 0.04 + 0.12; // last letter (13 = index of the final 's') is mid-flicker, settling
    [240, 300, 360, 480].forEach((f, i) => k.tone(tEnd - 0.05, { f, type: i ? 'sine' : 'triangle', dur: D - tEnd + 0.05, gain: 0.075 - i * 0.01, a: 0.2, hold: 0.3, verb: 0.35, pan: (i - 1.5) * 0.25 }));
    k.tone(tEnd - 0.05, { f: 120, type: 'sawtooth', dur: D - tEnd + 0.05, gain: 0.04, a: 0.1, hold: 0.2, filter: 'lowpass', f2: 600 });
  }

  registerStyle({
    id: 'neon-sign',
    name: 'Neon Sign at Night',
    category: 'Light & Imaging',
    description: 'Hand-bent glass neon on an old brick wall after rain: white-hot tube cores, saturated colour halos, painted-out blockout tube, clips and electrodes, light spilling across the brickwork and smearing in the wet pavement.',
    motion: 'Tubes buzz on letter by letter with a stutter, one failing letter keeps flickering, and the puddle reflection shivers as drops land.',
    fonts: ['400 150px "Gloria Hallelujah"', '400 40px "Poiret One"'],
    frameT: 4.68,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'One long brick wall the camera whip-pans along: every beat is a new neon sign that buzzes on tube by tube, arrows are segmented chase-light tubes that ignite toward their target, numbers are neon digits re-lit as they change, and the emphasis is a blinking red tube with a ring.',
    explainer(ctx, W, Hh, t) { neonExplainer(ctx, W, Hh, t); },
    explainerSound(k) { neonSound(k); },
    draw(ctx, W, Hh, t) {
      const R = H.rng(1207), nz = H.makeNoise(77);
      // ---- flicker of the failing letter ----
      const hsh = (n) => { const v = Math.sin(n * 91.731 + 7.13) * 43758.5453; return v - Math.floor(v); };
      // ignition: a tube buzzes on/off for a moment, then latches on
      const ign = (t0, len = 0.34) => t < t0 ? 0 : t - t0 > len ? 1 : (hsh(Math.floor(t * 40) + t0 * 977) > 0.42 ? 1 : 0);
      const ON = {
        bulb: ign(0.12, 0.45), fil: ign(0.8),
        rays: rayIdx => ign(1.05 + rayIdx * 0.08, 0.22),
        letter: li => ign(1.45 + li * 0.16, 0.26),
        cyan: ign(2.75, 0.4),
      };
      // the failing letter: tries to strike, then lives with intermittent dropouts
      let flick = 0;
      if (t >= 2.45) {
        const r = hsh(Math.floor(t * 14) + 3);
        flick = t < 3.1 ? (r > 0.55 ? 1 : r > 0.3 ? 0.3 : 0) : (r > 0.74 ? 0.3 : 1);
      }
      const hum = 0.97 + 0.03 * hsh(Math.floor(t * 30) + 11);

      // ---------- geometry (masks) ----------
      const bx = 268, by = 262, BR = 104;
      const bulbPath = (x) => {
        x.beginPath();
        const nk = 0.42 * BR, ny = by + 1.28 * BR;
        x.moveTo(bx - nk, ny);
        x.bezierCurveTo(bx - nk, by + 0.95 * BR, bx - BR * 0.98, by + 0.62 * BR, bx - BR * 0.98, by);
        x.arc(bx, by, BR * 0.98, Math.PI, 0);
        x.bezierCurveTo(bx + BR * 0.98, by + 0.62 * BR, bx + nk, by + 0.95 * BR, bx + nk, ny);
        x.stroke();
      };
      const threads = (x) => {
        const ny = by + 1.28 * BR;
        [[0, 0.44], [22, 0.40], [44, 0.34]].forEach(([dy, w]) => {
          x.beginPath(); x.moveTo(bx - w * BR, ny + 16 + dy); x.lineTo(bx + w * BR, ny + 16 + dy); x.stroke();
        });
        x.beginPath(); x.moveTo(bx - 14, ny + 80); x.lineTo(bx + 14, ny + 80); x.stroke();
      };
      const filament = (x) => {
        const y0 = by + 0.16 * BR, ny = by + 1.28 * BR;
        x.beginPath();
        x.moveTo(bx - 0.26 * BR, ny - 8); x.lineTo(bx - 0.30 * BR, y0);
        const loops = 5, span = 0.6 * BR, rr = 11;
        for (let i = 0; i <= 120; i++) {
          const u = i / 120, th = u * loops * Math.PI * 2;
          x.lineTo(bx - 0.30 * BR + u * span + Math.sin(th) * rr * 0.9, y0 - (1 - Math.cos(th)) * rr * 0.9);
        }
        x.lineTo(bx + 0.26 * BR, ny - 8);
        x.stroke();
      };
      const rayAngles = [-158, -132, -108, -90, -72, -48, -22];
      const rays = (x, which) => {
        rayAngles.forEach((d, i) => {
          if (which === 'lit' && (i === 5 || !ON.rays(i))) return;
          if (which === 'off' && (i === 5 || ON.rays(i))) return;
          if (which === 'dead' && i !== 5) return;
          const a = d * Math.PI / 180;
          x.beginPath();
          x.moveTo(bx + Math.cos(a) * BR * 1.28, by + Math.sin(a) * BR * 1.28);
          x.lineTo(bx + Math.cos(a) * BR * (i === 3 ? 1.72 : 1.58), by + Math.sin(a) * BR * (i === 3 ? 1.72 : 1.58));
          x.stroke();
        });
      };

      const word = 'big ideas', FLK = 7; // flickering letter index ('a')
      const tx = 470, ty = 338;
      const wordMask = (x, which) => {
        x.font = '400 150px "Gloria Hallelujah"';
        for (let i = 0; i < word.length; i++) {
          if (word[i] === ' ') continue;
          if ((which === 'flk') !== (i === FLK)) continue;
          if (which === 'main' && !ON.letter(i)) continue;
          if (which === 'off' && ON.letter(i)) continue;
          const px = tx + x.measureText(word.slice(0, i)).width;
          x.lineWidth = 3.2; x.fillText(word[i], px, ty); x.strokeText(word[i], px, ty);
        }
      };
      const boxX = 586, boxY = 424, boxW = 432, boxH = 74;
      const cyanMask = (x) => {
        x.font = '400 40px "Poiret One"';
        x.letterSpacing = '9px';
        x.textAlign = 'center';
        x.lineWidth = 4.2;
        x.fillText('OPEN ALL NIGHT', boxX + boxW / 2 + 4, boxY + 51);
        x.strokeText('OPEN ALL NIGHT', boxX + boxW / 2 + 4, boxY + 51);
        x.lineWidth = 7;
        x.beginPath(); x.roundRect(boxX, boxY, boxW, boxH, 22); x.stroke();
      };

      const mPink = mask(W, Hh, (x) => wordMask(x, 'main'));
      const mFlk = mask(W, Hh, (x) => wordMask(x, 'flk'));
      const mCyan = mask(W, Hh, cyanMask);
      const mWarm = mask(W, Hh, (x) => { x.lineWidth = 8; if (ON.bulb) { bulbPath(x); threads(x); } rays(x, 'lit'); });
      const mFil = mask(W, Hh, (x) => { x.lineWidth = 5.5; filament(x); });
      const mDead = mask(W, Hh, (x) => { x.lineWidth = 8; rays(x, 'dead'); });
      // every tube that is currently dark (rendered as unlit glass)
      const mOff = mask(W, Hh, (x) => {
        x.lineWidth = 8; if (!ON.bulb) { bulbPath(x); threads(x); } rays(x, 'off');
        if (!ON.fil) { x.lineWidth = 5.5; filament(x); }
        wordMask(x, 'off'); if (!ON.cyan) cyanMask(x);
      });
      const anyLit = { pink: [...word].some((c, i) => c !== ' ' && i !== FLK && ON.letter(i)), cyan: !!ON.cyan, warm: true, fil: !!ON.fil };

      // blockout (painted black) tubes connecting the runs + electrode ends
      const blockout = (x) => {
        x.lineWidth = 9;
        x.beginPath(); // bulb neck -> under word
        x.moveTo(bx + 0.42 * BR, by + 1.28 * BR + 6);
        x.bezierCurveTo(bx + 120, by + 170, 400, 392, 478, 360);
        x.stroke();
        x.beginPath(); // 'g' to 'i' of ideas, behind
        x.moveTo(668, 372); x.bezierCurveTo(700, 398, 724, 392, 742, 330); x.stroke();
        x.beginPath(); // end of ideas down to box
        x.moveTo(1105, 330); x.bezierCurveTo(1112, 380, 1060, 410, 1018, 440); x.stroke();
      };

      // ---------- neon light layer (additive) ----------
      const neon = H.layer(W, Hh), g = neon.getContext('2d');
      g.fillStyle = '#000'; g.fillRect(0, 0, W, Hh);
      g.globalCompositeOperation = 'lighter';
      const groups = [
        [mPink, COL.pink, anyLit.pink ? hum : 0], [mFlk, flick < 1 ? { core: [255, 150, 200], tube: [190, 25, 105], glow: [200, 10, 90] } : COL.pink, flick],
        [mCyan, COL.cyan, anyLit.cyan ? hum : 0], [mWarm, COL.warm, (ON.bulb || ON.rays(0)) ? hum : 0], [mFil, COL.pink, ON.fil ? 0.95 * hum : 0],
      ].filter((g0) => g0[2] > 0);
      // light map for the wall (very blurred colour)
      const light = H.layer(W / 4, Hh / 4), lx = light.getContext('2d');
      lx.fillStyle = '#000'; lx.fillRect(0, 0, W / 4, Hh / 4);
      lx.globalCompositeOperation = 'lighter';
      for (const [m, c, k] of groups) {
        const gs = colorize(m, c.glow);
        addBlur(g, gs, 70, 0.55 * k, W, Hh);
        addBlur(g, gs, 26, 0.75 * k, W, Hh);
        addBlur(g, colorize(m, c.tube), 7, 0.9 * k, W, Hh);
        g.globalAlpha = k; g.drawImage(colorize(m, c.tube), 0, 0);
        const core = colorize(erode(m, 2), c.core);
        g.globalAlpha = Math.min(1, k * k * 1.1); g.drawImage(core, 0, 0);
        addBlur(g, core, 2.5, 0.6 * k, W, Hh);
        // wall light contributions
        lx.globalAlpha = k; lx.filter = 'blur(40px)'; lx.drawImage(gs, 0, 0, W / 4, Hh / 4); lx.filter = 'blur(18px)'; lx.drawImage(gs, 0, 0, W / 4, Hh / 4);
        lx.filter = 'blur(7px)'; lx.globalAlpha = 0.8 * k; lx.drawImage(gs, 0, 0, W / 4, Hh / 4);
      }
      g.globalAlpha = 1;

      // ---------- wall + ground per-pixel pass ----------
      const Ld = lx.getImageData(0, 0, W / 4, Hh / 4).data, LW = W / 4, LH = Hh / 4;
      const sampleL = (x, y, o) => {
        const fx = H.clamp(x / 4 - 0.5, 0, LW - 1.001), fy = H.clamp(y / 4 - 0.5, 0, LH - 1.001);
        const ix = fx | 0, iy = fy | 0, ax = fx - ix, ay = fy - iy, i = (iy * LW + ix) * 4 + o;
        return (Ld[i] * (1 - ax) + Ld[i + 4] * ax) * (1 - ay) + (Ld[i + LW * 4] * (1 - ax) + Ld[i + LW * 4 + 4] * ax) * ay;
      };
      // low-res stain field
      const SW = 161, SH = 91, stain = new Float32Array(SW * SH);
      for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) stain[y * SW + x] = nz.fbm2(x * 0.09, y * 0.09, 4);
      const sampleS = (x, y) => {
        const fx = H.clamp(x / 8, 0, SW - 1.01), fy = H.clamp(y / 8, 0, SH - 1.01), ix = fx | 0, iy = fy | 0, ax = fx - ix, ay = fy - iy, i = iy * SW + ix;
        return (stain[i] * (1 - ax) + stain[i + 1] * ax) * (1 - ay) + (stain[i + SW] * (1 - ax) + stain[i + SW + 1] * ax) * ay;
      };
      const brickCols = [[122, 56, 40], [104, 46, 34], [138, 72, 50], [92, 50, 40], [116, 64, 48], [70, 38, 32]];
      const rowH = 30, brW = 92, mort = 5;
      const bhash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
      const img = ctx.createImageData(W, Hh), d = img.data;
      const amb = [16, 19, 30];
      for (let y = 0; y < Hh; y++) {
        const row = Math.floor(y / rowH), ly = y - row * rowH, off = (row % 2) * (brW / 2) + (row % 3 === 0 ? 7 : 0);
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const lr = sampleL(x, y, 0), lg = sampleL(x, y, 1), lb = sampleL(x, y, 2);
          const grain = R() - 0.5;
          if (y < WALL_BASE) {
            const col = Math.floor((x + off) / brW), lxp = x + off - col * brW;
            const h1 = bhash(row, col), h2 = bhash(col + 9, row + 3);
            const st = sampleS(x, y);
            let ar, ag, ab, shade = 1;
            // chipped / irregular mortar edges
            const edgeJit = (bhash(x >> 2, row) - 0.5) * 2.2 + (h2 - 0.5) * 1.5;
            const inMortar = ly < mort + edgeJit * 0.5 || lxp < mort + edgeJit * 0.6;
            if (inMortar) {
              ar = 96; ag = 90; ab = 84; shade = 0.5 + grain * 0.35;
            } else {
              const bc = brickCols[Math.floor(h1 * brickCols.length)];
              const k = 0.85 + h2 * 0.3 + st * 0.35;
              ar = bc[0] * k; ag = bc[1] * k; ab = bc[2] * k;
              // pitted surface
              shade = 1 + grain * 0.32 + (bhash(x * 0.37 | 0, y * 0.41 | 0) > 0.985 ? -0.45 : 0);
              // bevel: light comes from where the sign is (gradient of light map)
              const gL = (sampleL(x, y - 10, 0) + sampleL(x, y - 10, 2)) - (sampleL(x, y + 10, 0) + sampleL(x, y + 10, 2));
              const dir = H.clamp(gL / 60, -1, 1);
              const top = ly - mort, bot = rowH - ly;
              if (top < 3) shade *= 1 + 0.55 * dir;
              else if (bot < 3) shade *= 1 - 0.45 * dir;
              if (lxp - mort < 2) shade *= 0.85;
            }
            // soot streaks darken lower wall a bit
            const soot = 1 - H.smooth(380, WALL_BASE, y) * 0.25;
            shade *= soot;
            d[i] = ar * shade * (amb[0] + lr * 3.4) / 255;
            d[i + 1] = ag * shade * (amb[1] + lg * 3.4) / 255;
            d[i + 2] = ab * shade * (amb[2] + lb * 3.4) / 255;
          } else {
            // wet concrete sidewalk
            const gy = y - WALL_BASE;
            let base = 26 + grain * 14 + sampleS((x * 1.7) % 1280, (y * 3) % 720) * 10;
            if (gy < 12) base = 52 + grain * 18 - gy * 1.2; // footing/curb lip
            const fall = 1 / (1 + gy * 0.012);
            d[i] = base * 0.9 + lr * 0.9 * fall;
            d[i + 1] = base * 0.95 + lg * 0.9 * fall;
            d[i + 2] = base * 1.1 + lb * 0.9 * fall;
          }
          d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);

      // ---------- physical hardware (unlit) ----------
      ctx.save();
      // cable from the bulb base down the wall to transformer
      ctx.strokeStyle = '#0b0a0c'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx, by + 1.28 * BR + 84); ctx.bezierCurveTo(bx + 6, 470, bx - 30, 520, bx - 40, 560); ctx.lineTo(bx - 42, 566); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,150,90,0.25)'; ctx.lineWidth = 1; ctx.stroke();
      // transformer box
      const tbx = bx - 92, tby = 546;
      ctx.fillStyle = '#121216'; ctx.fillRect(tbx, tby, 110, 46);
      const tg = ctx.createLinearGradient(tbx, tby, tbx, tby + 46);
      tg.addColorStop(0, 'rgba(255,170,90,0.35)'); tg.addColorStop(0.1, 'rgba(255,170,90,0.04)'); tg.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = tg; ctx.fillRect(tbx, tby, 110, 46);
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(tbx + 2, tby + 46, 110, 4);
      ctx.fillStyle = 'rgba(255,200,150,0.18)'; ctx.font = '600 8px monospace'; ctx.fillText('15kV  30mA', tbx + 10, tby + 28);
      // blockout tubes: painted black glass
      const mBlk = mask(W, Hh, blockout);
      ctx.drawImage(colorize(mBlk, [14, 12, 14]), 0, 0);
      ctx.globalAlpha = 0.5; ctx.drawImage(colorize(erode(mBlk, 3), [120, 70, 90]), -1, -2); ctx.globalAlpha = 1;
      // dead tube ray (unlit glass, catches some colour)
      ctx.drawImage(colorize(mDead, COL.warm.dark), 0, 0);
      ctx.globalAlpha = 0.55; ctx.drawImage(colorize(erode(mDead, 3), [200, 160, 110]), -1, -1); ctx.globalAlpha = 1;
      // all tubes not lit right now: pale unlit glass catching a little street light
      ctx.drawImage(colorize(mOff, [34, 30, 38]), 0, 0);
      ctx.globalAlpha = 0.22; ctx.drawImage(colorize(erode(mOff, 2), [170, 150, 170]), -1, -2); ctx.globalAlpha = 1;
      // unlit glass under the flickering letter
      ctx.drawImage(colorize(mFlk, COL.pink.dark), 0, 0);
      ctx.globalAlpha = 0.18; ctx.drawImage(colorize(erode(mFlk, 2), [190, 110, 150]), -1, -2); ctx.globalAlpha = 1;
      // electrode housings where runs dive into the wall
      const electrode = (x, y, a) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        ctx.fillStyle = '#0d0c0f'; ctx.beginPath(); ctx.roundRect(-7, -6, 22, 12, 4); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-4, -5, 15, 2);
        ctx.restore();
      };
      electrode(478, 360, -0.4); electrode(1105, 330, 1.5); electrode(1018, 440, 2.5); electrode(742, 330, -1.4); electrode(668, 372, 0.6);
      ctx.restore();

      // shadow of tubes on wall (tubes stand ~4cm off the wall, lit by each other + street glow)
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.55;
      const shadowM = mask(W, Hh, (x) => { x.drawImage(mPink, 0, 0); x.drawImage(mFlk, 0, 0); x.drawImage(mCyan, 0, 0); x.drawImage(mWarm, 0, 0); });
      const sh = colorize(shadowM, [20, 10, 20]);
      ctx.filter = 'blur(3px)'; ctx.drawImage(sh, 5, 9); ctx.filter = 'none';
      ctx.restore();

      // ---------- add neon light ----------
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(neon, 0, 0);
      ctx.restore();

      // mounting clips (glass tube supports) over the tubes
      const clips = [[520, 300], [610, 270], [850, 262], [1000, 300], [1080, 318], [586, 462], [1018, 461], [800, 424], [bx - BR * 0.98, by - 10], [bx + BR * 0.98, by - 10], [bx, by - BR * 0.98]];
      for (const [cx, cy] of clips) {
                ctx.fillStyle = 'rgba(30,28,34,0.92)'; ctx.beginPath(); ctx.roundRect(cx - 2.5, cy - 8, 5, 16, 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(cx - 1.5, cy - 7, 1, 14);
      }

      // ---------- wet-pavement reflection ----------
      const soft = H.layer(W, Hh), sfx = soft.getContext('2d');
      sfx.filter = 'blur(2.5px)'; sfx.drawImage(neon, 0, 0); sfx.filter = 'none';
      const refl = H.layer(W, Hh), rx = refl.getContext('2d');
      const squash = 0.36, srcTop = 40;
      // rippled mirror: 1px rows with wobbling offsets
      for (let y = WALL_BASE + 4; y < Hh; y++) {
        const gy = y - WALL_BASE;
        const sy = WALL_BASE - 14 - gy / squash;
        if (sy < srcTop) break;
        const off = nz.n2(y * 0.035, t * 1.2) * (4 + gy * 0.22) + nz.n2(y * 0.12, 9 + t * 2) * (1 + gy * 0.05);
        rx.drawImage(soft, 0, sy, W, 1 / squash, off, y, W, 1);
      }
      // vertical streak smear: squash rows hard, scale back up
      const smear = H.layer(W, 12), smx = smear.getContext('2d');
      smx.filter = 'blur(1.5px)'; smx.drawImage(refl, 0, WALL_BASE, W, Hh - WALL_BASE, 0, 0, W, 12);
      // puddle mask
      const pud = H.layer(W, Hh), px = pud.getContext('2d');
      const pimg = px.createImageData(W, Hh - WALL_BASE), pd = pimg.data;
      for (let y = 0; y < Hh - WALL_BASE; y++) for (let x = 0; x < W; x++) {
        const v = nz.fbm2(x * 0.0045, y * 0.02 + 20, 3);
        const a = H.smooth(-0.08, 0.1, v);
        const j = (y * W + x) * 4; pd[j] = pd[j + 1] = pd[j + 2] = 255; pd[j + 3] = a * 255 * H.smooth(3, 12, y);
      }
      px.putImageData(pimg, 0, WALL_BASE);
      // diffuse wet sheen everywhere (streaks), mirror only in puddles
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.95; ctx.drawImage(smear, 0, 0, W, 12, 0, WALL_BASE + 4, W, Hh - WALL_BASE - 4);
      const rm = H.layer(W, Hh), rmx = rm.getContext('2d');
      rmx.drawImage(refl, 0, 0);
      rmx.globalCompositeOperation = 'destination-in'; rmx.drawImage(pud, 0, 0);
      ctx.globalAlpha = 0.7; ctx.drawImage(rm, 0, 0);
      ctx.restore();
      // concrete aggregate speckle catching the light
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 900; k++) {
        const x = R() * W, y = WALL_BASE + 14 + Math.pow(R(), 0.8) * (Hh - WALL_BASE - 14);
        const near = x < 520 ? [255, 170, 80] : x < 1100 ? [255, 60, 150] : [60, 200, 255];
        ctx.fillStyle = H.rgba(near, R() * 0.18);
        ctx.fillRect(x, y, 1 + R(), 1);
      }
      ctx.restore();
      // expansion joint
      ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(150, Hh); ctx.lineTo(205, WALL_BASE + 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1210, Hh); ctx.lineTo(1120, WALL_BASE + 12); ctx.stroke();

      // rain drops / ripples rings in puddles
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 9; k++) {
        const x = R.range(80, 1200), y = R.range(WALL_BASE + 30, Hh - 10), ph = (t * 0.8 + R()) % 1;
        ctx.strokeStyle = `rgba(255,140,200,${0.18 * (1 - ph)})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(x, y, 4 + ph * 26, (4 + ph * 26) * 0.22, 0, 0, 7); ctx.stroke();
      }
      ctx.restore();

      // ---------- atmosphere: bloom haze, vignette, grain ----------
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.35;
      ctx.drawImage(blurSmall(neon, 120, 0.0625), 0, 0, W, Hh); ctx.restore();
      H.vignette(ctx, W, Hh, 0.6, '4,2,10');
      H.grain(ctx, W, Hh, 0.05, 31 + Math.floor(t * 24), false);
    },
  });
}
