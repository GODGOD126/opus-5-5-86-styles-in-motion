{
  // ---------- ornate art-nouveau tarot card on velvet ----------
  const TAU = Math.PI * 2;
  const LINE = '#2a1c15';
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function gold(ctx, x0, y0, x1, y1, shift = 0) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    const s = (v) => H.clamp(v + shift, 0, 1);
    g.addColorStop(0, '#7a5a22'); g.addColorStop(s(0.25), '#c9a54e'); g.addColorStop(s(0.42), '#f3e3a0'); g.addColorStop(s(0.55), '#c39a44'); g.addColorStop(s(0.8), '#8d6a2a'); g.addColorStop(1, '#c4a050');
    return g;
  }
  function star(ctx, x, y, R, r, n = 4, rot = 0) {
    ctx.beginPath();
    for (let k = 0; k < n * 2; k++) { const a = rot + k * Math.PI / n - Math.PI / 2, q = k % 2 ? r : R; k ? ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : ctx.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    ctx.closePath();
  }
  function crescent(ctx, x, y, R, off) {
    ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.arc(x + off, y - off * 0.3, R * 0.86, 0, TAU, true); ctx.closePath();
  }
  // thick outlined tube along a cubic (cable "hair")
  function cable(ctx, pts, w, col, gl) {
    const path = () => { ctx.beginPath(); ctx.moveTo(...pts[0]); for (let i = 1; i + 2 < pts.length + 0; i += 3) ctx.bezierCurveTo(...pts[i], ...pts[i + 1], ...pts[i + 2]); };
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    path(); ctx.strokeStyle = LINE; ctx.lineWidth = w + 4.4; ctx.stroke();
    path(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
    // flat highlight stripe
    ctx.save(); ctx.translate(-w * 0.18, -w * 0.18); path(); ctx.strokeStyle = 'rgba(255,240,210,0.22)'; ctx.lineWidth = w * 0.28; ctx.stroke(); ctx.restore();
    // gold bands
    ctx.lineCap = 'butt'; ctx.setLineDash([2.2, 46]); ctx.lineDashOffset = -12; path(); ctx.strokeStyle = LINE; ctx.lineWidth = w + 4.4; ctx.stroke(); ctx.setLineDash([2.2, 3, 2.2, 38.6]); ctx.lineDashOffset = -12; path(); ctx.strokeStyle = gl; ctx.lineWidth = w + 2; ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  function cardBack(ctx, w, h, seed) {
    const r = H.rng(seed);
    ctx.save();
    rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.fillStyle = '#1d2744'; ctx.fill();
    ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.clip();
    ctx.strokeStyle = gold(ctx, -w / 2, -h / 2, w / 2, h / 2); ctx.lineWidth = 3; rr(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 8); ctx.stroke();
    ctx.lineWidth = 1; rr(ctx, -w / 2 + 20, -h / 2 + 20, w - 40, h - 40, 6); ctx.stroke();
    ctx.fillStyle = '#b8954a';
    for (let y = -h / 2 + 40; y < h / 2 - 30; y += 34) for (let x = -w / 2 + 40 + ((y / 34) & 1) * 17; x < w / 2 - 30; x += 34) { star(ctx, x, y, 5, 1.6, 4); ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 0, 50, 0, TAU); ctx.fillStyle = '#1d2744'; ctx.fill(); ctx.strokeStyle = '#c4a050'; ctx.lineWidth = 2.5; ctx.stroke();
    star(ctx, 0, 0, 40, 10, 8); ctx.fillStyle = '#c4a050'; ctx.fill();
    ctx.restore(); ctx.restore();
  }

  // ===== EXPLAINER HELPERS =====
  let VELVET = null;
  function velvet(W, H_) {
    if (VELVET) return VELVET;
    const nz = H.makeNoise(9), vw = 320, vh = 180, v = H.layer(vw, vh), vc = v.getContext('2d'), img = vc.createImageData(vw, vh), d = img.data;
    const dark = [18, 5, 14], mid = [74, 18, 44], hi = [150, 66, 98];
    for (let y = 0; y < vh; y++) for (let x = 0; x < vw; x++) {
      const X = x * 4, Y = y * 4, warp = nz.fbm2(X * 0.0018, Y * 0.0018, 3) * 2.4;
      const f = Math.sin(X * 0.0062 - Y * 0.0035 + warp) * 0.65 + Math.sin(X * 0.0024 + Y * 0.0078 + warp * 1.4) * 0.35;
      const ridge = Math.pow(1 - Math.abs(f), 1.6), mott = nz.fbm2(X * 0.02, Y * 0.02, 3), spot = Math.exp(-(((X - 640) / 700) ** 2 + ((Y - 360) / 460) ** 2));
      const b = H.clamp(0.1 + 0.55 * ridge * ridge * (0.5 + 0.5 * spot) + 0.14 * spot + 0.1 * mott);
      const c = b < 0.5 ? H.mix(dark, mid, b * 2) : H.mix(mid, hi, (b - 0.5) * 2);
      const i = (y * vw + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
    vc.putImageData(img, 0, 0);
    const L = H.layer(W, H_), c = L.getContext('2d'); c.imageSmoothingQuality = 'high'; c.drawImage(v, 0, 0, W, H_); H.grain(c, W, H_, 0.07, 31, false);
    VELVET = L; return L;
  }
  const SKY = ['#2c3350', '#353a58', '#41405f', '#514765', '#62506a'];
  // the hero card's aging, built once at hero card proportions and stretched over each explainer face:
  // AGE = scuffs, foxing rings and worn edges (paper core showing, heavier at the corners); GRAIN = print tooth (overlay)
  let AGE = null, GRAIN = null;
  function ageLayers() {
    if (AGE) return;
    const w = 400, h = 690, hw = w / 2, hh = h / 2, nz = H.makeNoise(9), sr = H.rng(4);
    AGE = H.layer(w, h); const a = AGE.getContext('2d'); a.translate(hw, hh);
    for (let k = 0; k < 6; k++) { const x = sr.range(-hw, hw), y = sr.range(-hh, hh), R = sr.range(12, 44); const g = a.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, 'rgba(150,110,60,0)'); g.addColorStop(0.85, 'rgba(150,105,55,0.13)'); g.addColorStop(1, 'rgba(150,105,55,0)'); a.fillStyle = g; a.beginPath(); a.arc(x, y, R, 0, TAU); a.fill(); }
    for (let k = 0; k < 22; k++) { const x = sr.range(-hw, hw), y = sr.range(-hh, hh), an = sr.range(0, TAU), l = sr.range(6, 30); a.strokeStyle = `rgba(245,236,214,${sr.range(0.15, 0.4)})`; a.lineWidth = sr.range(0.6, 1.3); a.beginPath(); a.moveTo(x, y); a.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); a.stroke(); }
    for (let k = 0; k < 900; k++) {
      const u = k / 900, per = 2 * (w + h), d = u * per;
      let x, y;
      if (d < w) { x = -hw + d; y = -hh; } else if (d < w + h) { x = hw; y = -hh + d - w; } else if (d < 2 * w + h) { x = hw - (d - w - h); y = hh; } else { x = -hw; y = hh - (d - 2 * w - h); }
      const corner = Math.max(0, 1 - Math.min(Math.hypot(x - hw, y - hh), Math.hypot(x + hw, y - hh), Math.hypot(x - hw, y + hh), Math.hypot(x + hw, y + hh)) / 76);
      const wv = (0.5 + 0.5 * nz.n2(u * 90, 3)) * 3.2 + corner * 10 * (0.5 + 0.5 * nz.n2(u * 40, 7));
      if (wv < 1) continue;
      a.fillStyle = `rgba(246,238,220,${0.5 + corner * 0.4})`; a.beginPath(); a.arc(x, y, wv, 0, TAU); a.fill();
    }
    GRAIN = H.layer(w, h); const g = GRAIN.getContext('2d'), img = g.createImageData(w, h), q = img.data, gr = H.rng(17);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, n = 128 + (gr() - 0.5) * 30 + nz.n2(x * 0.08, y * 0.08) * 16; q[i] = n; q[i + 1] = n; q[i + 2] = n; q[i + 3] = 255; }
    g.putImageData(img, 0, 0);
  }
  const hashS = (str) => { let v = 7; for (const ch of str) v = (v * 31 + ch.charCodeAt(0)) | 0; return Math.abs(v); };
  // a full art-nouveau card face, centred at the origin
  function tFace(c, w, h, numeral, title, art, sheen = 0.4) {
    const hw = w / 2, hh = h / 2, s = w / 364;
    const G = (x0, y0, x1, y1) => gold(c, x0, y0, x1, y1, (sheen - 0.5) * 0.4);
    rr(c, -hw, -hh, w, h, 16 * s); c.fillStyle = '#eadcbc'; c.fill();
    c.save(); rr(c, -hw, -hh, w, h, 16 * s); c.clip();
    c.strokeStyle = LINE; c.lineWidth = 2 * s; rr(c, -hw + 9 * s, -hh + 9 * s, w - 18 * s, h - 18 * s, 9 * s); c.stroke();
    rr(c, -hw + 13 * s, -hh + 13 * s, w - 26 * s, h - 26 * s, 7 * s); c.fillStyle = '#4f6a63'; c.fill();
    c.strokeStyle = G(-hw, -hh, hw, hh); c.lineWidth = 2.4 * s; rr(c, -hw + 15 * s, -hh + 15 * s, w - 30 * s, h - 30 * s, 6 * s); c.stroke();
    c.fillStyle = G(-hw, -hh, hw, hh);
    for (let y = -hh + 50 * s; y < hh - 40 * s; y += 22 * s) [-hw + 21 * s, hw - 21 * s].forEach((x) => { c.beginPath(); c.moveTo(x, y - 5 * s); c.lineTo(x + 3 * s, y); c.lineTo(x, y + 5 * s); c.lineTo(x - 3 * s, y); c.closePath(); c.fill(); });
    // gold dot row along the top and bottom of the band, as on the hero card
    for (let x = -hw + 52 * s; x < hw - 44 * s; x += 22 * s) [-hh + 21 * s, hh - 21 * s].forEach((y) => { c.beginPath(); c.arc(x, y, 1.7 * s, 0, TAU); c.fill(); });
    rr(c, -hw + 28 * s, -hh + 28 * s, w - 56 * s, h - 56 * s, 4 * s); c.fillStyle = '#eadcbc'; c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.8 * s; c.stroke();
    // art window with arch
    const AX = hw - 44 * s, AT = -hh + 92 * s, AB = hh - 92 * s;
    const win = () => { c.beginPath(); c.moveTo(-AX, AB); c.lineTo(-AX, AT + 30 * s); c.quadraticCurveTo(-AX, AT - 6 * s, -30 * s, AT); c.quadraticCurveTo(0, AT - 22 * s, 30 * s, AT); c.quadraticCurveTo(AX, AT - 6 * s, AX, AT + 30 * s); c.lineTo(AX, AB); c.closePath(); };
    c.save(); win(); c.clip(); SKY.forEach((col, i) => { c.fillStyle = col; c.fillRect(-AX, AT - 30 * s + i * (AB - AT + 30 * s) / 5, AX * 2, (AB - AT + 30 * s) / 5 + 1); });
    // the hero's sunburst: alternating wide/narrow wedges over the stepped sky, then scattered 4/8-point stars
    {
      const rcx = 0, rcy = (AT + AB) / 2 - 20 * s, RL = 520 * s;
      c.save(); c.globalAlpha = 0.55;
      for (let k = 0; k < 36; k++) { const a = k / 36 * TAU, ww = k % 2 ? 0.02 : 0.045; c.beginPath(); c.moveTo(rcx, rcy); c.lineTo(rcx + Math.cos(a - ww) * RL, rcy + Math.sin(a - ww) * RL); c.lineTo(rcx + Math.cos(a + ww) * RL, rcy + Math.sin(a + ww) * RL); c.closePath(); c.fillStyle = k % 2 ? '#7d6a55' : '#a78a52'; c.fill(); }
      c.restore();
      // the burst fades into a soft dark glow at its heart, so the card's emblem stands clear (the hero's halo does this)
      const hg = c.createRadialGradient(rcx, rcy, 0, rcx, rcy, 125 * s); hg.addColorStop(0, 'rgba(50,52,84,0.95)'); hg.addColorStop(0.55, 'rgba(56,56,88,0.75)'); hg.addColorStop(1, 'rgba(62,58,90,0)');
      c.fillStyle = hg; c.fillRect(rcx - 125 * s, rcy - 125 * s, 250 * s, 250 * s);
      const sr = H.rng(31 + hashS(numeral + title)); c.fillStyle = '#d9bd6a';
      for (let k = 0; k < 22; k++) { const x = sr.range(-AX + 8 * s, AX - 8 * s), y = sr.range(AT, AB - 20 * s), R = sr.range(3, 7) * s, eight = sr.chance(0.3); if (Math.hypot(x - rcx, y - rcy) < 120 * s) continue; star(c, x, y, R, 1.2 * s, eight ? 8 : 4); c.fill(); }
    }
    c.save(); c.translate(0, (AT + AB) / 2); art(c, AX * 2, AB - AT, s, G); c.restore(); c.restore();
    win(); c.strokeStyle = LINE; c.lineWidth = 2.4 * s; c.stroke();
    // numeral cartouche
    c.beginPath(); c.ellipse(0, -hh + 56 * s, 52 * s, 20 * s, 0, 0, TAU); c.fillStyle = '#eadcbc'; c.fill(); c.strokeStyle = LINE; c.lineWidth = 2 * s; c.stroke();
    c.beginPath(); c.ellipse(0, -hh + 56 * s, 47 * s, 15.5 * s, 0, 0, TAU); c.strokeStyle = G(-47 * s, -hh + 40 * s, 47 * s, -hh + 72 * s); c.lineWidth = 1.4 * s; c.stroke();
    // whiplash flourishes either side of the cartouche
    [-1, 1].forEach((sg) => { c.beginPath(); c.moveTo(sg * 58 * s, -hh + 60 * s); c.bezierCurveTo(sg * 80 * s, -hh + 74 * s, sg * 100 * s, -hh + 46 * s, sg * 118 * s, -hh + 60 * s); c.bezierCurveTo(sg * 128 * s, -hh + 68 * s, sg * 124 * s, -hh + 78 * s, sg * 114 * s, -hh + 74 * s); c.strokeStyle = LINE; c.lineWidth = 3.6 * s; c.stroke(); c.strokeStyle = '#c9a54e'; c.lineWidth = 1.6 * s; c.stroke(); });
    // corner celestial medallions
    [[-1, -1, 0], [1, -1, 1], [-1, 1, 2], [1, 1, 3]].forEach(([a, b, kind]) => {
      const x = a * (hw - 21 * s), y = b * (hh - 21 * s), R = 13 * s;
      c.beginPath(); c.arc(x, y, R, 0, TAU); c.fillStyle = '#2d3a52'; c.fill(); c.strokeStyle = G(x - R, y - R, x + R, y + R); c.lineWidth = 2.4 * s; c.stroke();
      c.fillStyle = '#d9bd6a';
      if (kind === 0) { c.beginPath(); c.arc(x, y, 4.5 * s, 0, TAU); c.fill(); }
      if (kind === 1) { crescent(c, x, y, 7 * s, 3.5 * s); c.fill(); }
      if (kind === 2) { star(c, x, y, 9 * s, 2.6 * s, 4); c.fill(); }
      if (kind === 3) { c.beginPath(); c.arc(x, y, 4 * s, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x, y, 9 * s, 2.6 * s, -0.4, 0, TAU); c.strokeStyle = '#d9bd6a'; c.lineWidth = 1.2 * s; c.stroke(); }
    });
    c.fillStyle = LINE; c.font = `600 ${24 * s}px "Cormorant Garamond"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(numeral, 0, -hh + 57 * s);
    // name panel
    rr(c, -hw + 34 * s, hh - 82 * s, w - 68 * s, 46 * s, 5 * s); c.fillStyle = '#efe3c6'; c.fill(); c.strokeStyle = LINE; c.lineWidth = 2 * s; c.stroke();
    rr(c, -hw + 39 * s, hh - 77 * s, w - 78 * s, 36 * s, 3 * s); c.strokeStyle = G(-hw, hh - 80 * s, hw, hh); c.lineWidth = 1.3 * s; c.stroke();
    c.fillStyle = LINE; let fs = Math.max(25, 30 * s); c.font = `600 ${fs}px "Cormorant Garamond"`; while (c.measureText(title).width > w - 96 * s) { fs -= 1; c.font = `600 ${fs}px "Cormorant Garamond"`; }
    c.fillText(title, 0, hh - 58 * s);
    // age: yellowing + worn corners
    c.globalCompositeOperation = 'multiply';
    const yg = c.createRadialGradient(-hw * 0.2, -hh * 0.2, w * 0.3, 0, 0, Math.hypot(hw, hh)); yg.addColorStop(0, '#fff8e8'); yg.addColorStop(1, '#c8aa78');
    c.fillStyle = yg; c.fillRect(-hw, -hh, w, h); c.globalCompositeOperation = 'source-over';
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const g = c.createRadialGradient(a * hw, b * hh, 0, a * hw, b * hh, 14 * s); g.addColorStop(0, 'rgba(246,238,220,0.9)'); g.addColorStop(1, 'rgba(246,238,220,0)'); c.fillStyle = g; c.fillRect(a * hw - 14 * s, b * hh - 14 * s, 28 * s, 28 * s); });
    // scuffs, foxing and worn edges, then the print tooth
    ageLayers();
    c.drawImage(AGE, -hw, -hh, w, h);
    c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.55; c.drawImage(GRAIN, -hw, -hh, w, h); c.globalAlpha = 1;
    // glossy foil: a soft band of light slides across with the room's sheen
    c.globalCompositeOperation = 'lighter';
    const gx = H.lerp(-hw - 200 * s, hw + 200 * s, H.clamp((sheen + 0.2) / 1.2));
    const lg = c.createLinearGradient(gx - 80 * s, -hh * 0.4, gx + 80 * s, hh * 0.4); lg.addColorStop(0, 'rgba(255,240,200,0)'); lg.addColorStop(0.5, 'rgba(255,236,190,0.16)'); lg.addColorStop(1, 'rgba(255,240,200,0)');
    c.fillStyle = lg; c.fillRect(-hw, -hh, w, h);
    c.globalCompositeOperation = 'source-over';
    c.restore();
  }
  // card placed in the scene: position, rotation, flip (0 = back up, 1 = face up), lift
  function tCard(ctx, x, y, w, h, rot, flip, faceFn, lift = 0, seed = 7) {
    const fe = H.ease.inOut(H.clamp(flip)), sx = Math.max(0.02, Math.abs(Math.cos(fe * Math.PI))), up = Math.sin(fe * Math.PI) + lift;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.save(); ctx.filter = `blur(${10 + up * 12}px)`; ctx.fillStyle = `rgba(0,0,0,${0.62 - up * 0.2})`; ctx.scale(sx, 1); rr(ctx, -w / 2 + 8 + up * 24, -h / 2 + 14 + up * 26, w, h, 14); ctx.fill(); ctx.restore();
    ctx.scale(sx * (1 + up * 0.05), 1 + up * 0.05);
    if (fe < 0.5) cardBack(ctx, w, h, seed); else faceFn(ctx);
    ctx.restore();
  }
  function plaque(ctx, x, y, w, h, lines, sizes, sheen = 0.4) {
    ctx.save(); ctx.translate(x, y);
    ctx.save(); ctx.filter = 'blur(10px)'; ctx.fillStyle = 'rgba(0,0,0,0.6)'; rr(ctx, -w / 2 + 6, -h / 2 + 12, w, h, 12); ctx.fill(); ctx.restore();
    rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fillStyle = '#1d2744'; ctx.fill();
    ctx.strokeStyle = gold(ctx, -w / 2, -h / 2, w / 2, h / 2, (sheen - 0.5) * 0.4); ctx.lineWidth = 3; rr(ctx, -w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 8); ctx.stroke(); ctx.lineWidth = 1; rr(ctx, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 6); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tot = sizes.reduce((a, b) => a + b * 1.1, 0); let yy = -tot / 2;
    lines.forEach((l, i) => { const fs = sizes[i]; yy += fs * 0.55; ctx.font = `600 ${fs}px "Cormorant Garamond"`; ctx.fillStyle = gold(ctx, -w / 2, yy - fs / 2, w / 2, yy + fs / 2, (sheen - 0.5) * 0.4); ctx.fillText(l, 0, yy); yy += fs * 0.55; });
    ctx.restore();
  }
  // gold filigree arrow drawn on along a quadratic
  function gArrow(ctx, a, m, b, p, label) {
    if (p <= 0) return;
    const pts = []; const n = 40, k = Math.max(2, Math.round(n * Math.min(1, p)));
    for (let i = 0; i <= k; i++) { const t = i / n, u = 1 - t; pts.push([u * u * a[0] + 2 * u * t * m[0] + t * t * b[0], u * u * a[1] + 2 * u * t * m[1] + t * t * b[1]]); }
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const path = () => { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); };
    path(); ctx.strokeStyle = LINE; ctx.lineWidth = 7; ctx.stroke(); path(); ctx.strokeStyle = gold(ctx, a[0], a[1], b[0], b[1]); ctx.lineWidth = 3.4; ctx.stroke();
    // little spiral flourishes along the shaft
    [0.3, 0.6].forEach((f) => { const i = Math.floor(f * n); if (i >= pts.length - 1) return; const q = pts[i]; ctx.beginPath(); ctx.arc(q[0], q[1] - 8, 6, Math.PI * 0.5, Math.PI * 2.2); ctx.strokeStyle = '#d9bd6a'; ctx.lineWidth = 1.8; ctx.stroke(); });
    if (p >= 1) { const q = pts[pts.length - 1], o = pts[pts.length - 3], an = Math.atan2(q[1] - o[1], q[0] - o[0]); ctx.beginPath(); ctx.moveTo(q[0] + Math.cos(an) * 10, q[1] + Math.sin(an) * 10); ctx.lineTo(q[0] + Math.cos(an + 2.5) * 16, q[1] + Math.sin(an + 2.5) * 16); ctx.lineTo(q[0] - Math.cos(an) * 4, q[1] - Math.sin(an) * 4); ctx.lineTo(q[0] + Math.cos(an - 2.5) * 16, q[1] + Math.sin(an - 2.5) * 16); ctx.closePath(); ctx.fillStyle = '#d9bd6a'; ctx.fill(); ctx.strokeStyle = LINE; ctx.lineWidth = 1.5; ctx.stroke(); }
    if (label && p > 0.6) { ctx.font = 'italic 600 28px "Cormorant Garamond"'; ctx.textAlign = 'center'; ctx.fillStyle = '#e8cf7a'; ctx.fillText(label, m[0], m[1] + (m[1] > a[1] ? 34 : -12)); }
    ctx.restore();
  }
  // flat art-nouveau animal heads
  function tCat(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.strokeStyle = LINE; c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(-26, -6); c.lineTo(-20, -40); c.lineTo(-4, -22); c.lineTo(4, -22); c.lineTo(20, -40); c.lineTo(26, -6); c.bezierCurveTo(30, 24, -30, 24, -26, -6); c.closePath(); c.fillStyle = '#c99a4e'; c.fill(); c.stroke();
    c.fillStyle = '#6fa39a'; [-1, 1].forEach((sg) => { c.beginPath(); c.ellipse(sg * 10, -4, 5, 6, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = LINE; c.fillRect(sg * 10 - 1, -9, 2, 10); c.fillStyle = '#6fa39a'; });
    c.beginPath(); c.moveTo(-3, 6); c.lineTo(3, 6); c.lineTo(0, 10); c.closePath(); c.fillStyle = '#a2615b'; c.fill(); c.stroke();
    c.lineWidth = 1.2; [-1, 1].forEach((sg) => { c.beginPath(); c.moveTo(sg * 6, 10); c.lineTo(sg * 30, 8); c.moveTo(sg * 6, 12); c.lineTo(sg * 28, 16); c.stroke(); });
    c.restore();
  }
  function tDog(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.strokeStyle = LINE; c.lineWidth = 2.6;
    c.beginPath(); c.ellipse(0, 0, 24, 24, 0, 0, TAU); c.fillStyle = '#a8784e'; c.fill(); c.stroke();
    [-1, 1].forEach((sg) => { c.beginPath(); c.ellipse(sg * 26, 4, 9, 20, sg * 0.25, 0, TAU); c.fillStyle = '#6b4a30'; c.fill(); c.stroke(); });
    c.beginPath(); c.ellipse(0, 12, 12, 9, 0, 0, TAU); c.fillStyle = '#e2cfa8'; c.fill(); c.stroke();
    c.beginPath(); c.ellipse(0, 8, 5, 3.5, 0, 0, TAU); c.fillStyle = LINE; c.fill();
    [-1, 1].forEach((sg) => { c.beginPath(); c.arc(sg * 9, -6, 3.5, 0, TAU); c.fillStyle = LINE; c.fill(); });
    c.restore();
  }

  // ===== END EXPLAINER HELPERS =====
  registerStyle({
    id: 'tarot-card',
    name: 'Tarot Card',
    category: 'Illustration',
    description: 'An aged art-nouveau tarot trump on crushed velvet: bold even outlines, flat muted lithograph colours, gold-foil halos and borders, celestial symbols and a worn, foxed cardstock with frayed corners.',
    motion: 'The card is dealt and flips onto the velvet; a sheen of light slides across the gold foil while the orbiting planets drift around the automaton.',
    fonts: ['600 34px "Cormorant Garamond"', '600 22px "Cormorant Garamond"', '400 14px "Cormorant Garamond"'],
    frameT: 5.4,
    duration: 5.5,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(9), r = H.rng(21);
      // ================= velvet =================
      {
        const vw = 320, vh = 180, v = H.layer(vw, vh), vc = v.getContext('2d'), img = vc.createImageData(vw, vh), d = img.data;
        const dark = [18, 5, 14], mid = [74, 18, 44], hi = [150, 66, 98];
        for (let y = 0; y < vh; y++) for (let x = 0; x < vw; x++) {
          const X = x * 4, Y = y * 4;
          const warp = nz.fbm2(X * 0.0018, Y * 0.0018, 3) * 2.4;
          const f = Math.sin(X * 0.0062 - Y * 0.0035 + warp) * 0.65 + Math.sin(X * 0.0024 + Y * 0.0078 + warp * 1.4) * 0.35;
          const ridge = Math.pow(1 - Math.abs(f), 1.6);
          const mott = nz.fbm2(X * 0.02, Y * 0.02, 3);
          const spot = Math.exp(-(((X - 640) / 700) ** 2 + ((Y - 360) / 460) ** 2));
          let b = 0.1 + 0.55 * ridge * ridge * (0.5 + 0.5 * spot) + 0.14 * spot + 0.1 * mott;
          b = H.clamp(b);
          const c = b < 0.5 ? H.mix(dark, mid, b * 2) : H.mix(mid, hi, (b - 0.5) * 2);
          const i = (y * vw + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
        }
        vc.putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(v, 0, 0, W, H_);
        H.grain(ctx, W, H_, 0.07, 31, false);
      }

      // ================= peeking card backs =================
      [[470, 400, -0.3, 5, 0.1], [812, 392, 0.26, 6, 0.3]].forEach(([x, y, a0, s, tk]) => {
        const e = H.ease.out(H.clamp((t - tk) / 0.6)); if (e <= 0) return;
        const a = a0 * (0.3 + 0.7 * e);
        ctx.save(); ctx.translate(H.lerp(640, x, e), y + (1 - e) * 520); ctx.rotate(a);
        ctx.save(); ctx.filter = 'blur(12px)'; ctx.fillStyle = 'rgba(0,0,0,0.6)'; rr(ctx, -170 + 10, -300 + 16, 340, 600, 16); ctx.fill(); ctx.restore();
        cardBack(ctx, 340, 600, s);
        const sh = ctx.createLinearGradient(-170, 0, 170, 0); sh.addColorStop(a < 0 ? 0 : 1, 'rgba(10,0,8,0.38)'); sh.addColorStop(a < 0 ? 1 : 0, 'rgba(10,0,8,0.72)'); ctx.fillStyle = sh; rr(ctx, -170, -300, 340, 600, 16); ctx.fill();
        ctx.restore();
      });

      // ================= the card (drawn on its own layer) =================
      const CW = 364, CH = 628, L = H.layer(CW + 40, CH + 40), c = L.getContext('2d');
      c.translate((CW + 40) / 2, (CH + 40) / 2);
      const hw = CW / 2, hh = CH / 2;
      c.lineJoin = 'round'; c.lineCap = 'round';
      // card stock
      rr(c, -hw, -hh, CW, CH, 18); c.fillStyle = '#eadcbc'; c.fill();
      c.save(); rr(c, -hw, -hh, CW, CH, 18); c.clip();
      const sweep = 0.4 + 0.9 * Math.sin(Math.PI * H.smooth(2.3, 4.3, t));
      const G = (x0, y0, x1, y1) => gold(c, x0, y0, x1, y1, (sweep - 0.5) * 0.4);
      // outer keyline + frame band
      c.strokeStyle = LINE; c.lineWidth = 2; rr(c, -hw + 10, -hh + 10, CW - 20, CH - 20, 10); c.stroke();
      rr(c, -hw + 14, -hh + 14, CW - 28, CH - 28, 8); c.fillStyle = '#4f6a63'; c.fill();
      c.strokeStyle = G(-hw, -hh, hw, hh); c.lineWidth = 2.4; rr(c, -hw + 16, -hh + 16, CW - 32, CH - 32, 7); c.stroke();
      // band ornaments: gold lozenges
      c.fillStyle = G(-hw, -hh, hw, hh);
      for (let y = -hh + 60; y < hh - 50; y += 22) { [-hw + 23, hw - 23].forEach((x) => { c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x + 3.5, y); c.lineTo(x, y + 6); c.lineTo(x - 3.5, y); c.closePath(); c.fill(); }); }
      for (let x = -hw + 60; x < hw - 50; x += 22) { [-hh + 23, hh - 23].forEach((y) => { c.beginPath(); c.arc(x, y, 1.8, 0, TAU); c.fill(); }); }
      // inner field
      rr(c, -hw + 30, -hh + 30, CW - 60, CH - 60, 4); c.fillStyle = '#eadcbc'; c.fill();
      c.strokeStyle = LINE; c.lineWidth = 2; c.stroke();
      // art window with nouveau arch
      const AX = 136, AT = -226, AB = 200;
      const win = () => { c.beginPath(); c.moveTo(-AX, AB); c.lineTo(-AX, AT + 40); c.bezierCurveTo(-AX, AT - 6, -60, AT - 4, -34, AT + 6); c.quadraticCurveTo(0, AT - 26, 34, AT + 6); c.bezierCurveTo(60, AT - 4, AX, AT - 6, AX, AT + 40); c.lineTo(AX, AB); c.closePath(); };
      c.save(); win(); c.clip();
      // sky: flat stepped bands
      ['#2c3350', '#353a58', '#41405f', '#514765', '#62506a'].forEach((col, i) => { c.fillStyle = col; c.fillRect(-AX, AT - 30 + i * 92, AX * 2, 94); });
      // rays
      const HC = [0, -52];
      c.save(); c.globalAlpha = 0.55;
      for (let k = 0; k < 36; k++) { const a = k / 36 * TAU + t * 0.03, w = k % 2 ? 0.02 : 0.045; c.beginPath(); c.moveTo(HC[0], HC[1]); c.lineTo(HC[0] + Math.cos(a - w) * 420, HC[1] + Math.sin(a - w) * 420); c.lineTo(HC[0] + Math.cos(a + w) * 420, HC[1] + Math.sin(a + w) * 420); c.closePath(); c.fillStyle = k % 2 ? '#7d6a55' : '#a78a52'; c.fill(); }
      c.restore();
      // stars
      for (let k = 0; k < 26; k++) { const x = r.range(-AX + 8, AX - 8), y = r.range(AT, 60); if (Math.hypot(x - HC[0], y - HC[1]) < 130) continue; const tw = 0.7 + 0.3 * Math.sin(t * 3 + k); star(c, x, y, r.range(3, 7) * tw, 1.2, r.chance(0.3) ? 8 : 4); c.fillStyle = '#d9bd6a'; c.fill(); }
      // crescent moon at top of arch
      crescent(c, 0, AT + 20, 15, 7); c.fillStyle = G(-15, AT, 15, AT + 40); c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.6; c.stroke();
      // halo gear
      {
        const R0 = 116, n = 28;
        c.beginPath();
        for (let k = 0; k < n; k++) { const a = k / n * TAU - t * 0.08, p = TAU / n; [[a - p * 0.5, R0 - 7], [a - p * 0.28, R0 - 7], [a - p * 0.2, R0 + 5], [a + p * 0.2, R0 + 5], [a + p * 0.28, R0 - 7]].forEach(([aa, q], j) => { const x = HC[0] + Math.cos(aa) * q, y = HC[1] + Math.sin(aa) * q; (k || j) ? c.lineTo(x, y) : c.moveTo(x, y); }); }
        c.closePath(); c.fillStyle = G(-R0, HC[1] - R0, R0, HC[1] + R0); c.fill(); c.strokeStyle = LINE; c.lineWidth = 2; c.stroke();
        c.beginPath(); c.arc(HC[0], HC[1], 102, 0, TAU); c.fillStyle = '#2d3a52'; c.fill(); c.stroke();
        c.fillStyle = '#d9bd6a'; for (let k = 0; k < 40; k++) { const a = k / 40 * TAU; c.beginPath(); c.arc(HC[0] + Math.cos(a) * 95, HC[1] + Math.sin(a) * 95, 1.8, 0, TAU); c.fill(); }
        c.beginPath(); c.arc(HC[0], HC[1], 88, 0, TAU); c.fillStyle = G(-88, HC[1] - 88, 88, HC[1] + 88); c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.8; c.stroke();
        c.strokeStyle = 'rgba(60,40,15,0.55)'; c.lineWidth = 1;
        for (let k = 0; k < 48; k++) { const a = k / 48 * TAU; c.beginPath(); c.moveTo(HC[0] + Math.cos(a) * 64, HC[1] + Math.sin(a) * 64); c.lineTo(HC[0] + Math.cos(a) * 86, HC[1] + Math.sin(a) * 86); c.stroke(); }
        c.beginPath(); c.arc(HC[0], HC[1], 64, 0, TAU); c.strokeStyle = LINE; c.lineWidth = 1.5; c.stroke();
        // zodiac-like ticks
        c.fillStyle = 'rgba(60,40,15,0.7)'; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; star(c, HC[0] + Math.cos(a) * 75, HC[1] + Math.sin(a) * 75, 4, 1.2, 4, a); c.fill(); }
      }
      // orbit ring (back half)
      const orbit = (front) => {
        c.save(); c.translate(0, 70); c.rotate(-0.16);
        c.beginPath(); c.ellipse(0, 0, 150, 30, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); c.strokeStyle = LINE; c.lineWidth = 4.6; c.stroke(); c.strokeStyle = '#d4b45e'; c.lineWidth = 2.2; c.stroke();
        [0.3, 1.9, 3.6, 5.0].forEach((a0, i) => {
          const a = (a0 + t * 0.4) % TAU; const fr = Math.sin(a) > 0; if (fr !== front) return;
          const x = Math.cos(a) * 150, y = Math.sin(a) * 30, R = [9, 6, 7, 5][i];
          c.beginPath(); c.arc(x, y, R, 0, TAU); c.fillStyle = ['#b65a3c', '#6d9a90', '#d9bd6a', '#9c86a8'][i]; c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.6; c.stroke();
          if (i === 0) { c.beginPath(); c.ellipse(x, y, 15, 4, -0.3, 0, TAU); c.stroke(); }
        });
        c.restore();
      };
      orbit(false);
      // cables (hair) behind figure
      const GL = '#d9bd6a';
      const cablesBack = [
        [[-24, -104], [-80, -150], [-150, -90], [-112, -20], [-80, 40], [-150, 80], [-120, 150]],
        [[24, -104], [80, -150], [150, -90], [112, -20], [80, 40], [150, 80], [120, 150]],
        [[-14, -110], [-40, -170], [-110, -170], [-128, -120]],
        [[14, -110], [40, -170], [110, -170], [128, -120]],
      ];
      cablesBack.forEach((p, i) => cable(c, p, 10, ['#a8573a', '#a8573a', '#3f6e6c', '#3f6e6c'][i], GL));
      // shoulders / mantle
      c.beginPath(); c.moveTo(-18, 52); c.bezierCurveTo(-50, 64, -110, 76, -132, 120); c.lineTo(-150, 230); c.lineTo(150, 230); c.lineTo(132, 120); c.bezierCurveTo(110, 76, 50, 64, 18, 52); c.closePath();
      c.fillStyle = '#5c7a72'; c.fill(); c.strokeStyle = LINE; c.lineWidth = 2.4; c.stroke();
      // shoulder plates
      [-1, 1].forEach((s) => { c.beginPath(); c.moveTo(s * 46, 70); c.bezierCurveTo(s * 90, 66, s * 130, 90, s * 134, 132); c.bezierCurveTo(s * 110, 120, s * 80, 112, s * 52, 112); c.closePath(); c.fillStyle = '#7f9a8f'; c.fill(); c.stroke();
        c.beginPath(); c.moveTo(s * 60, 86); c.bezierCurveTo(s * 92, 84, s * 116, 98, s * 124, 116); c.strokeStyle = 'rgba(42,28,21,0.6)'; c.lineWidth = 1.2; c.stroke(); c.strokeStyle = LINE; c.lineWidth = 2.4; });
      // flat shadow on mantle
      c.save(); c.beginPath(); c.moveTo(20, 112); c.bezierCurveTo(60, 140, 90, 170, 100, 230); c.lineTo(150, 230); c.lineTo(134, 132); c.closePath(); c.fillStyle = 'rgba(30,50,48,0.35)'; c.fill(); c.restore();
      // gold collar
      c.beginPath(); c.moveTo(-58, 66); c.quadraticCurveTo(0, 128, 58, 66); c.lineTo(48, 62); c.quadraticCurveTo(0, 112, -48, 62); c.closePath(); c.fillStyle = G(-60, 60, 60, 120); c.fill(); c.lineWidth = 1.8; c.stroke();
      // chest core
      { const cc = [0, 150]; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; c.beginPath(); c.moveTo(cc[0] + Math.cos(a) * 24, cc[1] + Math.sin(a) * 24); c.lineTo(cc[0] + Math.cos(a) * (k % 2 ? 32 : 40), cc[1] + Math.sin(a) * (k % 2 ? 32 : 40)); c.strokeStyle = '#d9bd6a'; c.lineWidth = 2; c.stroke(); }
        c.beginPath(); c.arc(cc[0], cc[1], 22, 0, TAU); c.fillStyle = G(-22, 128, 22, 172); c.fill(); c.strokeStyle = LINE; c.lineWidth = 2; c.stroke();
        c.beginPath(); c.arc(cc[0], cc[1], 13, 0, TAU); c.fillStyle = '#6fa39a'; c.fill(); c.stroke();
        c.beginPath(); c.arc(cc[0] - 4, cc[1] - 4, 4, 0, TAU); c.fillStyle = 'rgba(255,255,240,0.7)'; c.fill(); }
      // neck (ribbed)
      c.beginPath(); c.rect(-16, 8, 32, 58); c.fillStyle = '#a3aca6'; c.fill(); c.strokeStyle = LINE; c.lineWidth = 2; c.stroke();
      c.lineWidth = 1.2; for (let y = 16; y < 62; y += 7) { c.beginPath(); c.moveTo(-16, y); c.quadraticCurveTo(0, y + 3, 16, y); c.stroke(); }
      c.fillStyle = 'rgba(40,50,48,0.25)'; c.fillRect(4, 8, 12, 58);
      // face
      const face = () => { c.beginPath(); c.moveTo(0, -106); c.bezierCurveTo(32, -106, 47, -82, 46, -48); c.bezierCurveTo(46, -14, 26, 16, 0, 24); c.bezierCurveTo(-26, 16, -46, -14, -46, -48); c.bezierCurveTo(-47, -82, -32, -106, 0, -106); c.closePath(); };
      face(); c.fillStyle = '#dcd9cd'; c.fill();
      c.save(); face(); c.clip();
      c.beginPath(); c.moveTo(14, -100); c.bezierCurveTo(40, -70, 40, -30, 30, 0); c.bezierCurveTo(24, 14, 10, 22, 0, 26); c.lineTo(60, 30); c.lineTo(60, -110); c.closePath(); c.fillStyle = '#bebcb2'; c.fill();
      // cheek blush (flat)
      c.fillStyle = 'rgba(190,120,110,0.25)'; c.beginPath(); c.ellipse(-26, -18, 10, 6, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(26, -18, 10, 6, 0, 0, TAU); c.fill();
      c.restore();
      face(); c.strokeStyle = LINE; c.lineWidth = 2.6; c.stroke();
      // faceplate seams + rivets
      c.lineWidth = 1.1; c.strokeStyle = 'rgba(42,28,21,0.75)';
      [-1, 1].forEach((s) => { c.beginPath(); c.moveTo(s * 41, -70); c.bezierCurveTo(s * 34, -40, s * 36, -12, s * 22, 12); c.stroke(); c.fillStyle = LINE; c.beginPath(); c.arc(s * 38, -58, 1.6, 0, TAU); c.fill(); c.beginPath(); c.arc(s * 33, -6, 1.6, 0, TAU); c.fill(); });
      // closed eyes, brows, nose, lips
      c.strokeStyle = LINE; c.lineWidth = 2.2;
      [-1, 1].forEach((s) => {
        c.beginPath(); c.moveTo(s * 32, -44); c.quadraticCurveTo(s * 21, -36, s * 9, -43); c.stroke();
        c.lineWidth = 1.2; for (let k = 0; k < 4; k++) { const x = s * (12 + k * 6), y = -40 - Math.sin((k + 0.5) / 4 * Math.PI) * 1.8; c.beginPath(); c.moveTo(x, y); c.lineTo(x + s * 1.5, y + 4); c.stroke(); }
        c.lineWidth = 1.8; c.beginPath(); c.moveTo(s * 36, -58); c.quadraticCurveTo(s * 22, -66, s * 8, -59); c.stroke(); c.lineWidth = 2.2;
      });
      c.lineWidth = 1.6; c.beginPath(); c.moveTo(-1, -40); c.quadraticCurveTo(-4, -22, -6, -12); c.quadraticCurveTo(-1, -8, 5, -11); c.stroke();
      c.beginPath(); c.moveTo(-12, 3); c.quadraticCurveTo(-5, -1, 0, 2); c.quadraticCurveTo(5, -1, 12, 3); c.quadraticCurveTo(0, 12, -12, 3); c.closePath(); c.fillStyle = '#a2615b'; c.fill(); c.stroke();
      // headdress band with third-eye jewel
      c.beginPath(); c.moveTo(-46, -78); c.bezierCurveTo(-30, -92, 30, -92, 46, -78); c.lineTo(44, -68); c.bezierCurveTo(30, -80, -30, -80, -44, -68); c.closePath(); c.fillStyle = G(-46, -92, 46, -68); c.fill(); c.lineWidth = 1.8; c.stroke();
      c.beginPath(); c.moveTo(0, -96); c.lineTo(9, -80); c.lineTo(0, -64); c.lineTo(-9, -80); c.closePath(); c.fillStyle = '#5f9e94'; c.fill(); c.stroke();
      c.beginPath(); c.arc(-2, -84, 2, 0, TAU); c.fillStyle = 'rgba(255,255,240,0.8)'; c.fill();
      // cranium cap
      c.beginPath(); c.moveTo(-44, -82); c.bezierCurveTo(-46, -130, 46, -130, 44, -82); c.bezierCurveTo(30, -92, -30, -92, -44, -82); c.closePath(); c.fillStyle = '#4c6b66'; c.fill(); c.lineWidth = 2.4; c.stroke();
      c.lineWidth = 1.1; [-20, 0, 20].forEach((x) => { c.beginPath(); c.moveTo(x, -90); c.quadraticCurveTo(x * 1.1, -108, x * 0.6, -118); c.stroke(); });
      // front cables (whiplash over shoulders)
      const cablesFront = [
        [[-36, -96], [-74, -60], [-70, 10], [-56, 60], [-44, 100], [-90, 140], [-70, 186]],
        [[36, -96], [74, -60], [70, 10], [56, 60], [44, 100], [90, 140], [70, 186]],
      ];
      cablesFront.forEach((p, i) => cable(c, p, 9, '#b98f3e', '#efe0a2'));
      // plugs at cable ends
      [[-70, 186], [70, 186], [-120, 150], [120, 150]].forEach(([x, y]) => { c.beginPath(); c.rect(x - 7, y - 4, 14, 14); c.fillStyle = G(x - 7, y, x + 7, y + 10); c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.6; c.stroke(); c.beginPath(); c.moveTo(x - 3, y + 10); c.lineTo(x - 3, y + 17); c.moveTo(x + 3, y + 10); c.lineTo(x + 3, y + 17); c.stroke(); });
      orbit(true);
      // nouveau clouds at bottom
      const cloud = (cx, cy, s, col) => { c.beginPath(); [[-60, 0, 26], [-30, -14, 30], [6, -20, 32], [42, -10, 26], [66, 4, 20]].forEach(([x, y, R]) => { c.moveTo(cx + x * s + R * s, cy + y * s); c.arc(cx + x * s, cy + y * s, R * s, 0, TAU); }); c.rect(cx - 86 * s, cy, 172 * s, 40 * s); c.fillStyle = col; c.fill(); };
      cloud(-80, 196, 0.95, '#8e7f98'); cloud(86, 202, 0.9, '#8e7f98'); cloud(0, 214, 1.05, '#a596a8');
      c.strokeStyle = LINE; c.lineWidth = 1.6;
      [[-80, 196, 0.95], [86, 202, 0.9], [0, 214, 1.05]].forEach(([cx, cy, s]) => { [[-30, -14, 30], [6, -20, 32], [42, -10, 26]].forEach(([x, y, R]) => { c.beginPath(); c.arc(cx + x * s, cy + y * s, R * s, Math.PI * 1.05, Math.PI * 1.85); c.stroke(); c.beginPath(); c.arc(cx + x * s + 4, cy + y * s + 4, R * s * 0.55, Math.PI * 1.1, Math.PI * 1.7); c.stroke(); }); });
      c.restore(); // end art clip
      win(); c.strokeStyle = LINE; c.lineWidth = 2.6; c.stroke();
      c.save(); c.translate(0, 0); win(); c.strokeStyle = G(-AX, AT, AX, AB); c.lineWidth = 1.2; c.restore();
      // whiplash flourishes around the arch top
      [-1, 1].forEach((s) => {
        c.beginPath(); c.moveTo(s * 40, AT - 4); c.bezierCurveTo(s * 70, AT - 26, s * 100, AT - 4, s * 120, AT - 22); c.bezierCurveTo(s * 132, AT - 32, s * 124, AT - 44, s * 112, AT - 38);
        c.strokeStyle = LINE; c.lineWidth = 4.4; c.stroke(); c.strokeStyle = '#c9a54e'; c.lineWidth = 2; c.stroke();
        c.beginPath(); c.arc(s * 112, AT - 38, 3.2, 0, TAU); c.fillStyle = '#c9a54e'; c.fill();
      });
      // numeral cartouche
      c.save();
      c.beginPath(); c.ellipse(0, -hh + 64, 46, 22, 0, 0, TAU); c.fillStyle = '#eadcbc'; c.fill(); c.strokeStyle = LINE; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.ellipse(0, -hh + 64, 41, 17.5, 0, 0, TAU); c.strokeStyle = G(-40, -hh + 46, 40, -hh + 82); c.lineWidth = 1.6; c.stroke();
      c.fillStyle = LINE; c.font = '600 30px "Cormorant Garamond"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('XXI', 0, -hh + 65);
      c.restore();
      // name panel
      c.save();
      rr(c, -128, AB + 18, 256, 48, 6); c.fillStyle = '#efe3c6'; c.fill(); c.strokeStyle = LINE; c.lineWidth = 2; c.stroke();
      rr(c, -122, AB + 23, 244, 38, 4); c.strokeStyle = G(-122, AB, 122, AB + 60); c.lineWidth = 1.4; c.stroke();
      c.fillStyle = LINE; c.font = '600 25px "Cormorant Garamond"'; c.textAlign = 'center'; c.textBaseline = 'middle';
      const name = 'THE  MACHINE'; c.fillText(name.split('').join(String.fromCharCode(8202)), 0, AB + 43);
      [-1, 1].forEach((s) => { star(c, s * 110, AB + 42, 6, 1.8, 4); c.fillStyle = '#b8954a'; c.fill(); });
      c.restore();
      // corner celestial medallions
      const med = (x, y, kind) => {
        c.beginPath(); c.arc(x, y, 15, 0, TAU); c.fillStyle = '#2d3a52'; c.fill(); c.strokeStyle = G(x - 15, y - 15, x + 15, y + 15); c.lineWidth = 2.6; c.stroke();
        c.fillStyle = '#d9bd6a'; c.strokeStyle = '#d9bd6a'; c.lineWidth = 1.4;
        if (kind === 0) { c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; c.beginPath(); c.moveTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7); c.lineTo(x + Math.cos(a) * 10.5, y + Math.sin(a) * 10.5); c.stroke(); } }
        if (kind === 1) { crescent(c, x, y, 8, 4); c.fill(); }
        if (kind === 2) { star(c, x, y, 10, 3, 4); c.fill(); }
        if (kind === 3) { c.beginPath(); c.arc(x, y, 4.5, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x, y, 10, 3, -0.4, 0, TAU); c.stroke(); }
      };
      med(-hw + 23, -hh + 23, 0); med(hw - 23, -hh + 23, 1); med(-hw + 23, hh - 23, 2); med(hw - 23, hh - 23, 3);
      // side vines (thin nouveau linework in the margin)
      [-1, 1].forEach((s) => {
        c.beginPath(); for (let k = 0; k <= 60; k++) { const y = -hh + 110 + k * (CH - 220) / 60, x = s * (AX + 7) + s * Math.sin(k * 0.55) * 3; k ? c.lineTo(x, y) : c.moveTo(x, y); }
        c.strokeStyle = 'rgba(42,28,21,0.8)'; c.lineWidth = 1; c.stroke();
        for (let k = 0; k < 9; k++) { const y = -hh + 140 + k * 46; c.beginPath(); c.ellipse(s * (AX + 9), y, 2.4, 5, s * 0.5, 0, TAU); c.fillStyle = '#7f9a8f'; c.fill(); c.stroke(); }
      });
      c.restore(); // end card clip

      // ---------- aging on the card layer ----------
      c.save(); rr(c, -hw, -hh, CW, CH, 18); c.clip();
      // overall yellowing + grime toward edges
      c.globalCompositeOperation = 'multiply';
      const yg = c.createRadialGradient(-30, -60, 120, 0, 0, 420); yg.addColorStop(0, 'rgba(255,248,230,1)'); yg.addColorStop(1, 'rgba(200,170,120,1)');
      c.fillStyle = yg; c.fillRect(-hw, -hh, CW, CH);
      // stains
      const sr = H.rng(4);
      for (let k = 0; k < 6; k++) { const x = sr.range(-hw, hw), y = sr.range(-hh, hh), R = sr.range(10, 40); const g = c.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, 'rgba(190,150,100,0.0)'); g.addColorStop(0.85, 'rgba(170,125,70,0.22)'); g.addColorStop(1, 'rgba(170,125,70,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill(); }
      c.globalCompositeOperation = 'source-over';
      // crease
      c.strokeStyle = 'rgba(255,248,230,0.35)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-hw, 120); c.bezierCurveTo(-60, 100, 60, 150, hw, 118); c.stroke();
      c.strokeStyle = 'rgba(80,50,20,0.18)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-hw, 122); c.bezierCurveTo(-60, 102, 60, 152, hw, 120); c.stroke();
      // scuffs
      for (let k = 0; k < 18; k++) { const x = sr.range(-hw, hw), y = sr.range(-hh, hh), a = sr.range(0, TAU), l = sr.range(6, 30); c.strokeStyle = `rgba(245,236,214,${sr.range(0.15, 0.4)})`; c.lineWidth = sr.range(0.5, 1.2); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
      // worn edges: paper core showing through, heavier at the corners
      for (let k = 0; k < 900; k++) {
        const u = k / 900, per = 2 * (CW + CH), d = u * per;
        let x, y;
        if (d < CW) { x = -hw + d; y = -hh; } else if (d < CW + CH) { x = hw; y = -hh + d - CW; } else if (d < 2 * CW + CH) { x = hw - (d - CW - CH); y = hh; } else { x = -hw; y = hh - (d - 2 * CW - CH); }
        const corner = Math.max(0, 1 - Math.min(Math.hypot(x - hw, y - hh), Math.hypot(x + hw, y - hh), Math.hypot(x - hw, y + hh), Math.hypot(x + hw, y + hh)) / 70);
        const wv = (0.5 + 0.5 * nz.n2(u * 90, 3)) * 3 + corner * 9 * (0.5 + 0.5 * nz.n2(u * 40, 7));
        if (wv < 1) continue;
        c.fillStyle = `rgba(246,238,220,${0.5 + corner * 0.4})`; c.beginPath(); c.arc(x, y, wv, 0, TAU); c.fill();
      }
      c.restore();
      // print grain on card
      {
        const img = c.getImageData(0, 0, L.width, L.height), d = img.data, gr = H.rng(17);
        for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const p = i >> 2, x = p % L.width, y = (p / L.width) | 0; const n = (gr() - 0.5) * 16 + nz.n2(x * 0.08, y * 0.08) * 8; d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.8; }
        c.putImageData(img, 0, 0);
      }

      // ---------- place card on velvet ----------
      // dealt face-down, then flipped over, then a foil sheen passes
      const deal = H.ease.out(H.clamp((t - 0.55) / 0.75));
      const f = H.clamp((t - 1.45) / 0.6), fe = H.ease.inOut(f);
      const CX = 640, CY = 362 + (1 - deal) * 560, ROT = -0.025 + (1 - deal) * 0.25;
      if (deal > 0) {
        const sx = Math.max(0.02, Math.abs(Math.cos(fe * Math.PI))), lift = Math.sin(fe * Math.PI);
        ctx.save(); ctx.translate(CX, CY); ctx.rotate(ROT);
        ctx.save(); ctx.filter = `blur(${16 + lift * 14}px)`; ctx.fillStyle = `rgba(0,0,0,${0.7 - lift * 0.25})`; ctx.scale(sx, 1); rr(ctx, -hw + 12 + lift * 30, -hh + 20 + lift * 30, CW, CH, 18); ctx.fill(); ctx.restore();
        ctx.scale(sx * (1 + lift * 0.06), 1 + lift * 0.06);
        if (fe < 0.5) {
          cardBack(ctx, CW, CH, 7);
          ctx.fillStyle = `rgba(255,255,255,${0.12 * (1 - sx)})`; rr(ctx, -hw, -hh, CW, CH, 18); ctx.fill();
        } else {
          ctx.save(); ctx.filter = 'blur(3px)'; ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(ctx, -hw + 2, -hh + 4, CW, CH, 18); ctx.fill(); ctx.restore();
          ctx.drawImage(L, -(CW + 40) / 2, -(CH + 40) / 2);
          // glossy light band sliding across the card surface
          const gb = H.clamp((t - 2.4) / 1.6);
          if (gb > 0 && gb < 1) {
            ctx.save(); rr(ctx, -hw, -hh, CW, CH, 18); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
            const gx = H.lerp(-hw - 260, hw + 260, H.ease.inOut(gb));
            const lg = ctx.createLinearGradient(gx - 90, -hh * 0.4, gx + 90, hh * 0.4); lg.addColorStop(0, 'rgba(255,240,200,0)'); lg.addColorStop(0.5, 'rgba(255,236,190,0.26)'); lg.addColorStop(1, 'rgba(255,240,200,0)');
            ctx.fillStyle = lg; ctx.fillRect(-hw, -hh, CW, CH); ctx.restore();
          }
        }
        ctx.restore();
      }
      // gold dust on velvet
      for (let k = 0; k < 90; k++) { const a = r() * TAU, d = 220 + r() * 260; const x = 640 + Math.cos(a) * d * 1.3 + Math.sin(t * 0.6 + k) * 3, y = 362 + Math.sin(a) * d * 0.7 + Math.cos(t * 0.5 + k * 2) * 2; ctx.fillStyle = `rgba(240,210,130,${r.range(0.2, 0.8) * (0.6 + 0.4 * Math.sin(t * 3 + k))})`; ctx.beginPath(); ctx.arc(x, y, r.range(0.5, 1.5), 0, TAU); ctx.fill(); }
      H.vignette(ctx, W, H_, 0.55);
      H.grain(ctx, W, H_, 0.03, 4 + Math.floor(t * 12));
    },
    // ===== EXPLAINER =====
    explainerDuration: 14.5,
    explainerNote: 'Told as a tarot reading: cards are dealt, flipped and gathered off the velvet as the scene changes, gold filigree arrows link the spread, brass plaques count the examples and the accuracy, and a burst of gold light marks the wrong guess and the 97%.',
    explainer(ctx, W, H_, t) {
      ctx.drawImage(velvet(W, H_), 0, 0);
      const r = H.rng(21), ease = H.ease.inOut, cl = H.clamp;
      const sheen = 0.4 + 0.6 * Math.sin(t * 0.9);
      const deal = (t0, from, to) => { const k = H.ease.out(cl((t - t0) / 0.55)); return [H.lerp(from[0], to[0], k), H.lerp(from[1], to[1], k), k]; };
      const glow = (x, y, R, a) => { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, `rgba(255,226,150,${0.55 * a})`); g.addColorStop(1, 'rgba(255,226,150,0)'); ctx.fillStyle = g; ctx.fillRect(x - R, y - R, 2 * R, 2 * R); ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.3); for (let k = 0; k < 24; k++) { ctx.rotate(TAU / 24); ctx.fillStyle = `rgba(255,226,150,${0.25 * a})`; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(R * 1.1, 0); ctx.lineTo(0, 4); ctx.fill(); } ctx.restore(); };

      // ===== BEAT 1: the question card =====
      if (t < 2.6) {
        const [x, y] = deal(0, [640, 900], [640, 360]);
        const out = ease(cl((t - 1.85) / 0.6));
        const fl = cl((t - 0.45) / 0.5) - cl((t - 1.85) / 0.35);
        tCard(ctx, H.lerp(x, 160, out), H.lerp(y, 120, out), 300 * (1 - out * 0.7), 520 * (1 - out * 0.7), -0.02 - out * 0.2, fl, (c) => tFace(c, 300 * (1 - out * 0.7), 520 * (1 - out * 0.7), '0', 'THE QUESTION', (c2, aw, ah, s, G) => {
          c2.font = `600 ${200 * s}px "Cormorant Garamond"`; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillStyle = G(-60 * s, -90 * s, 60 * s, 90 * s); c2.fillText('?', 0, 0); c2.lineWidth = 3 * s; c2.strokeStyle = LINE; c2.strokeText('?', 0, 0);
          for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; star(c2, Math.cos(a) * 95 * s, Math.sin(a) * 120 * s, 6 * s, 1.6 * s, 4); c2.fillStyle = '#d9bd6a'; c2.fill(); }
        }, sheen), 0, 3);
        if (t > 0.9 && t < 2.3) { const a = cl((t - 0.9) / 0.3) * (1 - cl((t - 1.9) / 0.3)); ctx.save(); ctx.globalAlpha = a; plaque(ctx, 640, 660, 560, 72, ['How does AI learn?'], [44], sheen); ctx.restore(); }
      }
      // header plaque (the question, now a corner title)
      if (t > 2.0) { const k = ease(cl((t - 2.0) / 0.4)); plaque(ctx, H.lerp(640, 210, k), H.lerp(660, 54, k), H.lerp(560, 350, k), H.lerp(72, 56, k), ['How does AI learn?'], [H.lerp(44, 32, k)], sheen); }

      // ===== BEAT 2: examples dealt into the model =====
      const MODEL = (c, w, h) => tFace(c, w, h, 'XXI', 'THE MODEL', (c2, aw, ah, s, G) => {
        c2.beginPath(); for (let k = 0; k < 24; k++) { const a = k / 24 * TAU + t * 0.2; c2.lineTo(Math.cos(a) * 92 * s, -20 * s + Math.sin(a) * 92 * s); c2.lineTo(Math.cos(a + 0.13) * 104 * s, -20 * s + Math.sin(a + 0.13) * 104 * s); } c2.closePath(); c2.fillStyle = G(-100 * s, -120 * s, 100 * s, 80 * s); c2.fill(); c2.strokeStyle = LINE; c2.lineWidth = 2 * s; c2.stroke();
        c2.beginPath(); c2.arc(0, -20 * s, 80 * s, 0, TAU); c2.fillStyle = '#2d3a52'; c2.fill(); c2.stroke();
        c2.fillStyle = '#d9bd6a'; for (let k = 0; k < 32; k++) { const a = k / 32 * TAU; c2.beginPath(); c2.arc(Math.cos(a) * 73 * s, -20 * s + Math.sin(a) * 73 * s, 1.5 * s, 0, TAU); c2.fill(); }
        // the hero oracle's cables, in hero units mapped onto this smaller head (back pair first, behind the mantle)
        const hero = (fn) => { c2.save(); c2.scale(s, s); c2.translate(0, -14 + 41 * 0.9); c2.scale(0.92, 0.9); fn(); c2.restore(); };
        hero(() => [
          [[-24, -104], [-80, -150], [-150, -90], [-112, -20], [-80, 40], [-150, 80], [-120, 150]],
          [[24, -104], [80, -150], [150, -90], [112, -20], [80, 40], [150, 80], [120, 150]],
          [[-14, -110], [-40, -170], [-110, -170], [-128, -120]],
          [[14, -110], [40, -170], [110, -170], [128, -120]],
        ].forEach((p, i) => cable(c2, p, 10, ['#a8573a', '#a8573a', '#3f6e6c', '#3f6e6c'][i], '#d9bd6a')));
        // ribbed neck
        c2.beginPath(); c2.rect(-13 * s, 30 * s, 26 * s, 34 * s); c2.fillStyle = '#a3aca6'; c2.fill(); c2.strokeStyle = LINE; c2.lineWidth = 1.8 * s; c2.stroke();
        c2.lineWidth = 1.1 * s; for (let y = 36; y < 62; y += 6) { c2.beginPath(); c2.moveTo(-13 * s, y * s); c2.quadraticCurveTo(0, (y + 3) * s, 13 * s, y * s); c2.stroke(); }
        // face, with the hero's flat shadow side and blush
        const face = () => { c2.beginPath(); c2.ellipse(0, -14 * s, 44 * s, 58 * s, 0, 0, TAU); };
        face(); c2.fillStyle = '#dcd9cd'; c2.fill();
        c2.save(); face(); c2.clip();
        c2.beginPath(); c2.moveTo(14 * s, -72 * s); c2.bezierCurveTo(40 * s, -46 * s, 40 * s, -6 * s, 26 * s, 22 * s); c2.bezierCurveTo(20 * s, 34 * s, 8 * s, 42 * s, 0, 46 * s); c2.lineTo(60 * s, 50 * s); c2.lineTo(60 * s, -80 * s); c2.closePath(); c2.fillStyle = '#bebcb2'; c2.fill();
        c2.fillStyle = 'rgba(190,120,110,0.3)'; [-1, 1].forEach((sg) => { c2.beginPath(); c2.ellipse(sg * 25 * s, 4 * s, 9 * s, 5.5 * s, 0, 0, TAU); c2.fill(); });
        c2.restore();
        face(); c2.strokeStyle = LINE; c2.lineWidth = 2.6 * s; c2.stroke();
        // closed eyes with lashes, brows, nose
        c2.lineWidth = 2 * s; [-1, 1].forEach((sg) => {
          c2.beginPath(); c2.moveTo(sg * 28 * s, -16 * s); c2.quadraticCurveTo(sg * 18 * s, -8 * s, sg * 8 * s, -15 * s); c2.stroke();
          c2.lineWidth = 1.1 * s; for (let k = 0; k < 4; k++) { const x = sg * (11 + k * 5), y = -13.5 + Math.sin((k + 0.5) / 4 * Math.PI) * 1.6; c2.beginPath(); c2.moveTo(x * s, y * s); c2.lineTo((x + sg * 1.4) * s, (y + 3.6) * s); c2.stroke(); }
          c2.lineWidth = 1.6 * s; c2.beginPath(); c2.moveTo(sg * 31 * s, -28 * s); c2.quadraticCurveTo(sg * 19 * s, -35 * s, sg * 7 * s, -29 * s); c2.stroke(); c2.lineWidth = 2 * s;
        });
        c2.lineWidth = 1.4 * s; c2.beginPath(); c2.moveTo(-1 * s, -14 * s); c2.quadraticCurveTo(-3 * s, -2 * s, -5 * s, 5 * s); c2.quadraticCurveTo(-1 * s, 8 * s, 4 * s, 6 * s); c2.stroke();
        c2.beginPath(); c2.moveTo(-10 * s, 20 * s); c2.quadraticCurveTo(-4 * s, 17 * s, 0, 19 * s); c2.quadraticCurveTo(4 * s, 17 * s, 10 * s, 20 * s); c2.quadraticCurveTo(0, 28 * s, -10 * s, 20 * s); c2.closePath(); c2.fillStyle = '#a2615b'; c2.fill(); c2.stroke();
        // cap, gold headband and third-eye jewel
        c2.lineWidth = 2.6 * s; c2.beginPath(); c2.moveTo(-44 * s, -44 * s); c2.bezierCurveTo(-46 * s, -90 * s, 46 * s, -90 * s, 44 * s, -44 * s); c2.closePath(); c2.fillStyle = '#4c6b66'; c2.fill(); c2.stroke();
        c2.beginPath(); c2.moveTo(-44 * s, -48 * s); c2.bezierCurveTo(-30 * s, -60 * s, 30 * s, -60 * s, 44 * s, -48 * s); c2.lineTo(43 * s, -39 * s); c2.bezierCurveTo(30 * s, -50 * s, -30 * s, -50 * s, -43 * s, -39 * s); c2.closePath(); c2.fillStyle = G(-44 * s, -60 * s, 44 * s, -39 * s); c2.fill(); c2.lineWidth = 1.6 * s; c2.stroke();
        c2.beginPath(); c2.moveTo(0, -64 * s); c2.lineTo(8 * s, -50 * s); c2.lineTo(0, -36 * s); c2.lineTo(-8 * s, -50 * s); c2.closePath(); c2.fillStyle = '#5f9e94'; c2.fill(); c2.stroke();
        c2.beginPath(); c2.arc(-2 * s, -53 * s, 1.8 * s, 0, TAU); c2.fillStyle = 'rgba(255,255,240,0.8)'; c2.fill();
        c2.lineWidth = 2.4 * s; c2.beginPath(); c2.moveTo(-120 * s, ah / 2); c2.bezierCurveTo(-100 * s, 70 * s, -40 * s, 56 * s, 0, 56 * s); c2.bezierCurveTo(40 * s, 56 * s, 100 * s, 70 * s, 120 * s, ah / 2); c2.closePath(); c2.fillStyle = '#5c7a72'; c2.fill(); c2.stroke();
        // mantle shadow, gold collar and chest core
        c2.save(); c2.beginPath(); c2.moveTo(-120 * s, ah / 2); c2.bezierCurveTo(-100 * s, 70 * s, -40 * s, 56 * s, 0, 56 * s); c2.bezierCurveTo(40 * s, 56 * s, 100 * s, 70 * s, 120 * s, ah / 2); c2.closePath(); c2.clip();
        c2.beginPath(); c2.moveTo(16 * s, 90 * s); c2.bezierCurveTo(50 * s, 120 * s, 76 * s, 160 * s, 84 * s, ah / 2); c2.lineTo(140 * s, ah / 2); c2.lineTo(140 * s, 60 * s); c2.closePath(); c2.fillStyle = 'rgba(30,50,48,0.35)'; c2.fill(); c2.restore();
        c2.beginPath(); c2.moveTo(-52 * s, 64 * s); c2.quadraticCurveTo(0, 116 * s, 52 * s, 64 * s); c2.lineTo(43 * s, 61 * s); c2.quadraticCurveTo(0, 102 * s, -43 * s, 61 * s); c2.closePath(); c2.fillStyle = G(-52 * s, 60 * s, 52 * s, 110 * s); c2.fill(); c2.lineWidth = 1.6 * s; c2.stroke();
        { const cy = 140 * s; c2.strokeStyle = '#d9bd6a'; c2.lineWidth = 1.8 * s; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; c2.beginPath(); c2.moveTo(Math.cos(a) * 20 * s, cy + Math.sin(a) * 20 * s); c2.lineTo(Math.cos(a) * (k % 2 ? 27 : 34) * s, cy + Math.sin(a) * (k % 2 ? 27 : 34) * s); c2.stroke(); }
          c2.beginPath(); c2.arc(0, cy, 18 * s, 0, TAU); c2.fillStyle = G(-18 * s, cy - 18 * s, 18 * s, cy + 18 * s); c2.fill(); c2.strokeStyle = LINE; c2.lineWidth = 1.8 * s; c2.stroke();
          c2.beginPath(); c2.arc(0, cy, 10 * s, 0, TAU); c2.fillStyle = '#6fa39a'; c2.fill(); c2.stroke();
          c2.beginPath(); c2.arc(-3 * s, cy - 3 * s, 3 * s, 0, TAU); c2.fillStyle = 'rgba(255,255,240,0.7)'; c2.fill(); }
        // front cables whiplash over the shoulders, ending in gold plugs
        hero(() => {
          [[[-36, -96], [-74, -60], [-70, 10], [-56, 60], [-44, 100], [-90, 140], [-70, 186]], [[36, -96], [74, -60], [70, 10], [56, 60], [44, 100], [90, 140], [70, 186]]].forEach((p) => cable(c2, p, 9, '#b98f3e', '#efe0a2'));
          [[-70, 186], [70, 186]].forEach(([x, y]) => { c2.beginPath(); c2.rect(x - 7, y - 4, 14, 14); c2.fillStyle = '#c9a54e'; c2.fill(); c2.strokeStyle = LINE; c2.lineWidth = 1.6; c2.stroke(); });
        });
      }, sheen);
      if (t > 2.3 && t < 6.6) {
        const gone = ease(cl((t - 6.0) / 0.5));
        // deck of examples at the left
        const dx = 190 - gone * 400;
        for (let k = 0; k < 6; k++) { ctx.save(); ctx.translate(dx + k * 1.5, 420 - k * 2.5); ctx.rotate(-0.05); if (k === 0) { ctx.save(); ctx.filter = 'blur(10px)'; ctx.fillStyle = 'rgba(0,0,0,0.6)'; rr(ctx, -70 + 6, -115 + 12, 140, 230, 10); ctx.fill(); ctx.restore(); } cardBack(ctx, 140, 230, 8); ctx.restore(); }
        if (t > 2.5) { ctx.save(); ctx.translate(-gone * 400, 0); plaque(ctx, 190, 580, 210, 52, ['the examples'], [28], sheen); ctx.restore(); }
        // the model card
        const [mx, my] = deal(2.3, [700, 900], [700, 340]);
        tCard(ctx, mx, my + gone * 600, 250, 420, 0.01, cl((t - 2.6) / 0.5), (c) => MODEL(c, 250, 420), 0, 9);
        gArrow(ctx, [290, 300], [430, 200], [560, 280], cl((t - 3.0) / 0.4) * (1 - gone));
        // stream of labelled example cards flying into the model
        for (let k = 0; k < 16; k++) {
          const t0 = 3.0 + k * 0.17, u = cl((t - t0) / 0.75); if (u <= 0 || u >= 1 || gone > 0) continue;
          const isCat = k % 3 !== 1, x = H.lerp(220, 700, u), y = H.lerp(400, 330, u) - Math.sin(u * Math.PI) * 220, sc = 1 - 0.75 * Math.pow(u, 3);
          tCard(ctx, x, y, 120 * sc, 200 * sc, -0.3 + u * 0.3, 1, (c) => tFace(c, 120 * sc, 200 * sc, '', isCat ? 'CAT' : 'DOG', (c2, aw, ah, s) => (isCat ? tCat : tDog)(c2, 0, 0, 2.6 * s), sheen), 0.2);
        }
        glow(700, 330, 160, cl((t - 3.1) / 0.3) * (0.5 + 0.3 * Math.sin(t * 9)) * (1 - cl((t - 5.6) / 0.4)));
        // counter plaque
        const e = ease(cl((t - 3.0) / 2.6)), v = t >= 5.6 ? 1000000 : Math.round(Math.pow(10, 1 + 5 * e));
        if (t > 3.0) { ctx.save(); ctx.translate(0, gone * 600); plaque(ctx, 1050, 360, 380, 170, [v.toLocaleString('en-US'), 'examples'], [72, 34], sheen); ctx.restore(); }
      }

      // ===== BEAT 3: three-card spread — Guess, Check, Adjust =====
      if (t > 6.1 && t < 11.0) {
        const gone = ease(cl((t - 10.4) / 0.5)), right = t > 9.35;
        const P = [[290, 400], [640, 400], [990, 400]], CW = 230, CH = 390;
        const GUESS = (c) => tFace(c, CW, CH, 'I', 'GUESS', (c2, aw, ah, s, G) => {
          c2.save(); c2.translate(-50 * s, -60 * s); c2.rotate(-0.12); rr(c2, -60 * s, -56 * s, 120 * s, 112 * s, 6 * s); c2.fillStyle = '#efe3c6'; c2.fill(); c2.strokeStyle = LINE; c2.lineWidth = 2.4 * s; c2.stroke(); tCat(c2, 0, 4 * s, 1.5 * s); c2.restore();
          c2.beginPath(); c2.moveTo(30 * s, 40 * s); c2.quadraticCurveTo(80 * s, 10 * s, 130 * s, 40 * s); c2.quadraticCurveTo(80 * s, 70 * s, 30 * s, 40 * s); c2.closePath(); c2.fillStyle = '#efe3c6'; c2.fill(); c2.strokeStyle = LINE; c2.lineWidth = 2.4 * s; c2.stroke();
          c2.beginPath(); c2.arc(80 * s, 40 * s, 15 * s, 0, TAU); c2.fillStyle = G(60 * s, 25 * s, 100 * s, 55 * s); c2.fill(); c2.stroke(); c2.beginPath(); c2.arc(80 * s, 40 * s, 6 * s, 0, TAU); c2.fillStyle = LINE; c2.fill();
          // banner with the guess
          c2.beginPath(); c2.moveTo(-130 * s, 130 * s); c2.lineTo(130 * s, 130 * s); c2.lineTo(116 * s, 158 * s); c2.lineTo(130 * s, 186 * s); c2.lineTo(-130 * s, 186 * s); c2.lineTo(-116 * s, 158 * s); c2.closePath(); c2.fillStyle = '#efe3c6'; c2.fill(); c2.stroke();
          c2.font = `600 ${44 * s}px "Cormorant Garamond"`; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillStyle = right ? '#2f6f4a' : '#8e2a20'; c2.fillText(right ? 'cat  ✓' : 'dog?', 0, 160 * s);
        }, sheen);
        const CHECK = (c) => tFace(c, CW, CH, 'II', 'CHECK', (c2, aw, ah, s, G) => {
          const tilt = right ? 0 : 0.22 * ease(cl((t - 7.6) / 0.4));
          c2.strokeStyle = LINE; c2.lineWidth = 3 * s; c2.fillStyle = G(-120 * s, -100 * s, 120 * s, 100 * s);
          c2.beginPath(); c2.rect(-6 * s, -110 * s, 12 * s, 200 * s); c2.fill(); c2.stroke();
          c2.save(); c2.translate(0, -90 * s); c2.rotate(tilt); c2.beginPath(); c2.rect(-110 * s, -5 * s, 220 * s, 10 * s); c2.fill(); c2.stroke();
          [[-1, 'dog?'], [1, 'cat']].forEach(([sg, lb]) => { c2.save(); c2.translate(sg * 100 * s, 0); c2.rotate(-tilt); c2.beginPath(); c2.moveTo(0, 0); c2.lineTo(-30 * s, 70 * s); c2.moveTo(0, 0); c2.lineTo(30 * s, 70 * s); c2.stroke(); c2.beginPath(); c2.ellipse(0, 72 * s, 38 * s, 12 * s, 0, 0, Math.PI); c2.fill(); c2.stroke(); c2.font = `600 ${40 * s}px "Cormorant Garamond"`; c2.textAlign = 'center'; c2.lineJoin = 'round'; c2.strokeStyle = LINE; c2.lineWidth = 4 * s; c2.strokeText(lb, 0, 56 * s); c2.fillStyle = '#efe3c6'; c2.fillText(lb, 0, 56 * s); c2.strokeStyle = LINE; c2.lineWidth = 3 * s; c2.fillStyle = G(-120 * s, -100 * s, 120 * s, 100 * s); c2.restore(); });
          c2.restore();
          // verdict emblem
          c2.beginPath(); c2.arc(0, 130 * s, 44 * s, 0, TAU); c2.fillStyle = '#efe3c6'; c2.fill(); c2.stroke();
          c2.lineCap = 'round'; c2.lineWidth = 10 * s; c2.strokeStyle = right ? '#2f6f4a' : '#8e2a20';
          if (t > 7.75 && !right) { c2.beginPath(); c2.moveTo(-22 * s, 108 * s); c2.lineTo(22 * s, 152 * s); c2.moveTo(22 * s, 108 * s); c2.lineTo(-22 * s, 152 * s); c2.stroke(); }
          if (right) { c2.beginPath(); c2.moveTo(-22 * s, 130 * s); c2.lineTo(-6 * s, 148 * s); c2.lineTo(24 * s, 110 * s); c2.stroke(); }
        }, sheen);
        const ADJUST = (c) => tFace(c, CW, CH, 'III', 'ADJUST', (c2, aw, ah, s, G) => {
          const tq = Math.floor(t * 12) / 12;
          [[-60, -70, 52], [62, -10, 44], [-40, 90, 48]].forEach(([x, y, R], i) => {
            const rot = (i % 2 ? -1 : 1) * 2.4 * ease(cl((tq - 8.65 - i * 0.12) / 0.6));
            c2.save(); c2.translate(x * s, y * s); c2.rotate(rot);
            c2.beginPath(); for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; c2.lineTo(Math.cos(a) * R * s, Math.sin(a) * R * s); c2.lineTo(Math.cos(a + 0.22) * (R + 9) * s, Math.sin(a + 0.22) * (R + 9) * s); } c2.closePath();
            c2.fillStyle = G(-R * s, -R * s, R * s, R * s); c2.fill(); c2.strokeStyle = LINE; c2.lineWidth = 2.2 * s; c2.stroke();
            c2.beginPath(); c2.arc(0, 0, R * 0.55 * s, 0, TAU); c2.fillStyle = '#2d3a52'; c2.fill(); c2.stroke();
            c2.beginPath(); c2.moveTo(0, 0); c2.lineTo(R * 0.5 * s, 0); c2.strokeStyle = '#e8cf7a'; c2.lineWidth = 4 * s; c2.stroke();
            c2.restore();
          });
        }, sheen);
        if (gone < 0.3) {
          if (t > 7.75 && t < 9.35) glow(640, 400, 260, cl((t - 7.75) / 0.25) * (0.8 + 0.2 * Math.sin(t * 12)));
          if (t > 9.35) glow(290, 400, 240, (1 - cl((t - 9.8) / 0.5)) * cl((t - 9.35) / 0.15));
        }
        [[GUESS, 6.2, 6.5], [CHECK, 6.35, 7.35], [ADJUST, 6.5, 8.2]].forEach(([fn, td, tf], i) => {
          const [x, y] = deal(td, [640, 900], P[i]);
          tCard(ctx, x + (i - 1) * gone * 200, y + gone * 600, CW, CH, (i - 1) * 0.03, cl((t - tf) / 0.5), fn, 0, 10 + i);
        });
        if (gone < 0.3) {
          gArrow(ctx, [395, 250], [465, 170], [535, 250], cl((t - 7.3) / 0.35), 'then');
          gArrow(ctx, [745, 250], [815, 170], [885, 250], cl((t - 8.15) / 0.35), 'error');
          gArrow(ctx, [990, 610], [640, 760], [290, 610], cl((t - 9.0) / 0.45), 'try again');
        }
      }

      // ===== BEAT 4 + 5: the star of progress, then the moral =====
      if (t > 10.5) {
        const STAR = (c) => tFace(c, 280, 470, 'XVII', 'THE  STAR', (c2, aw, ah, s, G) => {
          const ox = -110 * s, oy = 120 * s, gw = 220 * s, gh = 220 * s, pr = cl((t - 11.0) / 1.5);
          c2.strokeStyle = '#d9bd6a'; c2.lineWidth = 2 * s; c2.beginPath(); c2.moveTo(ox, oy - gh); c2.lineTo(ox, oy); c2.lineTo(ox + gw, oy); c2.stroke();
          const acc = (u) => 61 + 36 * (1 - Math.pow(1 - u, 2.3)), pts = [];
          for (let k = 0; k <= 40; k++) { const u = k / 40 * pr; pts.push([ox + u * gw, oy - (acc(u) - 50) / 50 * gh]); }
          c2.beginPath(); pts.forEach((q, i) => i ? c2.lineTo(q[0], q[1]) : c2.moveTo(q[0], q[1])); c2.strokeStyle = LINE; c2.lineWidth = 7 * s; c2.stroke(); c2.strokeStyle = G(ox, oy - gh, ox + gw, oy); c2.lineWidth = 4 * s; c2.stroke();
          for (let k = 1; k <= 6; k++) { const u = k / 6; if (u > pr) break; star(c2, ox + u * gw, oy - (acc(u) - 50) / 50 * gh, 6 * s, 2 * s, 4); c2.fillStyle = '#efe0a2'; c2.fill(); }
          const tp = pts[pts.length - 1]; star(c2, tp[0], tp[1], 22 * s, 6 * s, 8, t); c2.fillStyle = G(tp[0] - 20, tp[1] - 20, tp[0] + 20, tp[1] + 20); c2.fill(); c2.strokeStyle = LINE; c2.lineWidth = 1.5 * s; c2.stroke();
        }, sheen);
        const [x, y] = deal(10.5, [640, 900], [420, 370]);
        tCard(ctx, x, y, 280, 470, -0.02, cl((t - 10.75) / 0.5), STAR, 0, 14);
        const acc = 61 + 36 * (1 - Math.pow(1 - cl((t - 11.0) / 1.5), 2.3)), v = Math.round(acc);
        if (t > 12.5) glow(900, 330, 260, cl((t - 12.5) / 0.25) * (1 - 0.5 * cl((t - 13.2) / 0.6)));
        const flipP = cl((t - 13.0) / 0.5), fe = ease(flipP), sx = Math.max(0.02, Math.abs(Math.cos(fe * Math.PI)));
        if (t > 10.9) {
          ctx.save(); ctx.translate(900, 340); ctx.scale(sx, 1); ctx.translate(-900, -340);
          if (fe < 0.5) { const pulse = t > 12.5 ? 1 + 0.12 * Math.pow(1 - cl((t - 12.5) / 0.3), 2) : 1; ctx.save(); ctx.translate(900, 340); ctx.scale(pulse, pulse); ctx.translate(-900, -340); plaque(ctx, 900, 340, 420, 220, ['Accuracy', v + '%'], [40, 110], sheen); ctx.restore(); }
          else plaque(ctx, 900, 340, 460, 240, ['More examples', '→', 'better guesses'], [52, 40, 52], sheen);
          ctx.restore();
        }
      }
      H.vignette(ctx, W, H_, 0.5);
      H.grain(ctx, W, H_, 0.03, 4 + Math.floor(t * 12));
    },
    // Sound: a reading by candlelight. Cards are dealt with a soft slide across velvet and settle with a muffled tap;
    // flips are a stiff card snapping over and laying down; brass plaques and gears are small, damped metal; gold
    // filigree draws in as a low, breathy shimmer (no high pings). The wrong guess is a low, sour gong; the 97% is a
    // warm low bell over an impact. A quiet minor pad underneath. Times copied from explainer() above:
    // deal(t0) = 0.55 s ease-out (settles about t0 + 0.4); tCard flip over [tf, tf+0.5] turns edge-on at tf + 0.25.
    explainerSound(k) {
      // Chrome glitch: a noise buffer that starts within ~1e-8 s of a sample boundary (float error like 4.15 + 0.1 * 1 + 0.11)
      // spikes far above its gain. Put every start a quarter sample past the 48 kHz grid so none land there.
      { const k0 = k, sn = (t) => (Math.round(t * 48000) + 0.25) / 48000; k = { ...k0, play: (n, t, o) => k0.play(n, sn(t), o), tone: (t, o) => k0.tone(sn(t), o), noise: (t, o) => k0.noise(sn(t), o) }; }
      const D = 14.5, pan = (x) => H.clamp(x / 640 - 1, -1, 1) * 0.6;
      // card slid across the velvet, then settling
      const deal = (t0, x, g = 1, minor = false) => {
        k.noise(t0, { dur: 0.42, color: 'pink', filter: 'bandpass', f: [[0, 900], [0.42, 500]], q: 0.7, gain: 0.16 * g, a: 0.05, pan: pan(x), minor });
        k.noise(t0 + 0.4, { dur: 0.05, color: 'pink', filter: 'lowpass', f: 900, gain: 0.17 * g, a: 0.002, pan: pan(x), minor });
        k.tone(t0 + 0.4, { f: [[0, 160], [0.05, 90]], dur: 0.07, gain: 0.08 * g, pan: pan(x), minor });
      };
      // flip over [tf, tf+0.5]: the stiff card flicks up, turns edge-on (tf+0.25), lays down (tf+0.5)
      const flip = (tf, x, g = 1, minor = false) => {
        k.noise(tf + 0.02, { dur: 0.03, filter: 'bandpass', f: 1800, q: 1.2, gain: 0.22 * g, a: 0.001, pan: pan(x), minor });
        k.noise(tf + 0.1, { dur: 0.3, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.15, 1400], [0.3, 600]], q: 0.8, gain: 0.12 * g, a: 0.12, pan: pan(x), minor });
        k.noise(tf + 0.48, { dur: 0.05, color: 'pink', filter: 'lowpass', f: 1100, gain: 0.15 * g, a: 0.002, pan: pan(x), minor });
      };
      // cards gathered off the velvet: one long soft slide
      const gather = (t0, d, x) => k.noise(t0, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 500], [d * 0.5, 1000], [d, 450]], q: 0.6, gain: 0.2, a: d * 0.4, pan: pan(x) });
      // gold filigree drawing in: a low breathy shimmer
      const gilt = (t0, d, x, minor = true) => {
        k.noise(t0, { dur: d + 0.1, color: 'pink', filter: 'bandpass', f: [[0, 900], [d, 1700]], q: 3, gain: 0.07, a: d * 0.5, pan: pan(x), minor });
        k.tone(t0, { f: 'E4', type: 'triangle', dur: d + 0.5, gain: 0.035, a: d * 0.6, verb: 0.4, pan: pan(x), minor });
        k.tone(t0 + d * 0.3, { f: 'B4', type: 'triangle', dur: d + 0.4, gain: 0.025, a: d * 0.5, verb: 0.4, pan: pan(x), minor });
      };
      // small damped brass tick (plaque counters, gears)
      const brass = (t, g, p, f = 1400) => k.withMinor(() => { k.noise(t, { dur: 0.03, filter: 'bandpass', f, q: 3, gain: 0.26 * g, a: 0.001, pan: p }); k.tone(t, { f: f * 0.5, type: 'triangle', dur: 0.06, gain: 0.04 * g, pan: p }); });
      // low bell with inharmonic partials (bowl-like), kept under ~1.5 kHz
      const bell = (t, f, g, p = 0) => { const F = k.hz(f); k.tone(t, { f: F, dur: 2.2, gain: 0.16 * g, a: 0.004, verb: 0.4, pan: p }); k.tone(t, { f: F * 2.0, dur: 1.2, gain: 0.05 * g, a: 0.004, verb: 0.4, pan: p }); k.tone(t, { f: F * 2.76, dur: 0.6, gain: 0.025 * g, a: 0.004, verb: 0.4, pan: p }); };

      k.bed('room', 0, D, { gain: 0.35 });
      k.music('pad', 0.4, D, { bpm: 60, gain: 0.32, chords: [['A2', 'E3', 'A3', 'C4'], ['F2', 'C3', 'F3', 'A3'], ['D3', 'F3', 'A3', 'C4'], ['E2', 'B2', 'E3', 'G#3']] });

      // ---- BEAT 1: the question card is dealt (0), turned (0.45 -> face at 0.7), plaque glows in (0.9)
      deal(0, 640, 1.1);
      flip(0.45, 640, 1.1);
      bell(0.95, 'A3', 0.7, 0); // "How does AI learn?" plaque
      // card turns back (1.85) while being drawn up to the corner (1.85 -> 2.45); plaque slides up (2.0 -> 2.4)
      flip(1.85, 400, 0.6, true);
      gather(1.9, 0.55, 300);

      // ---- BEAT 2: THE MODEL is dealt (2.3) and turned (2.6), arrow gilds in (3.0 -> 3.4)
      deal(2.3, 700);
      flip(2.6, 700);
      gilt(3.0, 0.4, 430);
      // sixteen example cards flick off the deck (3.0 + k*0.17) and fly into the model
      for (let i = 0; i < 16; i++) k.noise(3.0 + i * 0.17, { dur: 0.04, filter: 'bandpass', f: 1500, q: 1, gain: 0.12, a: 0.002, pan: pan(220), minor: true });
      k.tone(3.1, { f: 'A2', type: 'triangle', dur: 2.9, gain: 0.05, a: 0.4, hold: 2.1, verb: 0.3, pan: pan(700), minor: true }); // the model card glows while it learns
      // examples plaque 10 -> 1,000,000 over 3.0..5.6 (inOut): a brass tick whose rate follows the count's speed
      for (let t = 3.08; t < 5.52;) { const e = H.clamp((t - 3.0) / 2.6), sp = Math.min(1, 6 * e * (1 - e)); brass(t, 0.7 + 0.3 * sp, pan(1050), 1300 + e * 300); t += 1 / (4 + 7 * sp); }
      k.play('tock', 5.6, { f: 440, gain: 0.5, pan: pan(1050) }); bell(5.6, 'E3', 0.5, pan(1050)); // 1,000,000 lands
      gather(6.0, 0.5, 500); // model card, deck and plaque are swept away

      // ---- BEAT 3: the spread is dealt (6.2, 6.35, 6.5) and turned one by one (6.5, 7.35, 8.2)
      deal(6.2, 290, 0.9); deal(6.35, 640, 0.9, true); deal(6.5, 990, 0.9, true);
      flip(6.5, 290); // GUESS: dog?
      gilt(7.3, 0.35, 465); // 'then'
      flip(7.35, 640); // CHECK
      // WRONG: the scales tip (7.6 -> 8.0) and the red X burns in with a gold burst (7.75)
      k.noise(7.6, { dur: 0.4, filter: 'bandpass', f: [[0, 500], [0.4, 330]], q: 6, gain: 0.08, a: 0.1, pan: pan(640), minor: true }); // beam creaks over
      bell(7.75, 'F2', 1.1, pan(640)); bell(7.75, 'B2', 0.55, pan(640)); // sour, low gong (tritone)
      k.play('thud', 7.75, { f: 90, gain: 0.65, pan: pan(640) });
      gilt(8.15, 0.35, 815); // 'error'
      flip(8.2, 990); // ADJUST
      // gears turn on twos (8.65 + i*0.12, 0.6 s each): a brass tooth per moving frame
      for (let f = Math.floor(8.65 * 12) + 1; f / 12 < 9.45; f++) brass(f / 12, 0.6, pan(990 + ((f % 3) - 1) * 40), 900 + (f % 3) * 140);
      gilt(9.0, 0.45, 640); // 'try again' sweeps under the spread
      // CORRECTION (9.35): "cat ✓", the scales level, the Guess card glows
      k.play('success', 9.35, { f: 'A4', gain: 0.55, pan: pan(290) });
      bell(9.35, 'A3', 0.45, pan(290));
      gather(10.4, 0.5, 640); // spread swept off

      // ---- BEAT 4: THE STAR is dealt (10.5) and turned (10.75); accuracy plaque appears (10.9)
      deal(10.5, 420);
      flip(10.75, 420);
      k.play('tock', 10.9, { f: 380, gain: 0.35, pan: pan(900), minor: true });
      gilt(11.0, 1.5, 420); // the golden curve rises (11.0 -> 12.5)
      { let last = 61, lastT = -1; // a brass tick per new value, <= 12/s
        for (let t = 11.0; t < 12.5; t += 1 / 120) { const v = Math.round(61 + 36 * (1 - Math.pow(1 - H.clamp((t - 11.0) / 1.5), 2.3))); if (v !== last && t - lastT >= 1 / 12) { brass(t, 0.9, pan(900), 1200 + (v - 61) * 10); last = v; lastT = t; } } }
      // 97%: gold light bursts, the plaque pulses (12.5): the big hit
      k.play('impact', 12.5, { gain: 1.0, pan: pan(900) });
      bell(12.5, 'A2', 1.0, pan(900)); bell(12.52, 'E3', 0.7, pan(900)); bell(12.54, 'A3', 0.5, pan(900));

      // ---- BEAT 5: the plaque turns over (13.0 -> 13.5, edge-on 13.25) to the moral, which resolves
      flip(13.0, 900, 1.1);
      ['A3', 'C#4', 'E4'].forEach((f, i) => bell(13.27 + i * 0.09, f, 0.42 - i * 0.07, pan(900) + (i - 1) * 0.2));
    },

    // ===== END EXPLAINER =====
  });
}
