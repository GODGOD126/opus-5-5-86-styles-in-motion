{
  // ---------- environment map for liquid chrome ----------
  const SKY_HI = H.hex('#7fa8f5'), SKY_LO = H.hex('#f4f8ff'), HOR = H.hex('#1a1d45'), GR_HI = H.hex('#cbb8ff'), GR_LO = H.hex('#5a4a9a');
  const IRI = ['#7ff3ff', '#c9a6ff', '#ff9ee6', '#b8f7ff'].map(H.hex);
  const L = (() => { const v = [-0.45, -0.65, 0.62]; const m = Math.hypot(...v); return v.map((x) => x / m); })();
  let ENVX = 0, IRIP = 0; // animated env-map rotation / film phase
  let ENVH = -0.1, ENVS = 0;        // lower edge of the dark horizon band (hero -0.1; the explainer narrows it for small chrome)
  const EB = [0, 0, 0];
  function envBase(e, rx, o) {
    let r, g, b;
    if (e > 0.04) {
      const u = Math.pow(H.clamp((e - 0.04) / 0.9), 0.55);
      r = H.lerp(SKY_LO[0], SKY_HI[0], u); g = H.lerp(SKY_LO[1], SKY_HI[1], u); b = H.lerp(SKY_LO[2], SKY_HI[2], u);
      // softbox panels
      if (e > 0.42 && e < 0.8 && Math.abs(rx + 0.25) < 0.22) { r = g = b = 255; }
      if (e > 0.15 && e < 0.3 && rx > 0.35 && rx < 0.7) { r = H.lerp(r, 255, 0.85); g = H.lerp(g, 255, 0.85); b = H.lerp(b, 255, 0.85); }
    } else if (e > ENVH) {
      const u = (e - ENVH) / (0.04 - ENVH);
      const k = Math.pow(Math.abs(u - 0.62) / 0.62, 2.4);
      r = H.lerp(HOR[0], 210, k * 0.6); g = H.lerp(HOR[1], 200, k * 0.6); b = H.lerp(HOR[2], 255, k * 0.6);
    } else {
      const u = Math.pow(H.clamp((ENVH - e) / 0.85), 0.7);
      r = H.lerp(GR_HI[0], GR_LO[0], u); g = H.lerp(GR_HI[1], GR_LO[1], u); b = H.lerp(GR_HI[2], GR_LO[2], u);
    }
    o[0] = r; o[1] = g; o[2] = b;
  }
  function env(nx, ny, nz, out) {
    // reflect view (0,0,-1) about n
    const rx = 2 * nz * nx + ENVX, ry = 2 * nz * ny, rz = 2 * nz * nz - 1;
    const e = -ry; // elevation
    envBase(e, rx, out);
    let r = out[0], g = out[1], b = out[2];
    if (ENVS > 0 && (Math.abs(e - 0.04) < ENVS || Math.abs(e - ENVH) < ENVS)) {
      // explainer: filter the horizon band's edges over a few elevation taps, so it reads as a clean liquid line, not jaggies
      for (let q = -2; q <= 2; q++) { if (!q) continue; envBase(e + q * ENVS * 0.5, rx, EB); r += EB[0]; g += EB[1]; b += EB[2]; }
      r /= 5; g /= 5; b /= 5;
    }
    // thin-film iridescence at grazing angles
    const f = Math.pow(1 - H.clamp(nz), 1.6);
    const hp = ((rx * 0.9 + ry * 0.6 + f * 1.4 + IRIP) % 1 + 1) % 1 * IRI.length;
    const i0 = Math.floor(hp) % IRI.length, i1 = (i0 + 1) % IRI.length, ft = hp - Math.floor(hp);
    const ir = H.lerp(IRI[i0][0], IRI[i1][0], ft), ig = H.lerp(IRI[i0][1], IRI[i1][1], ft), ib = H.lerp(IRI[i0][2], IRI[i1][2], ft);
    const im = 0.18 + f * 0.45;
    r = H.lerp(r, ir, im); g = H.lerp(g, ig, im); b = H.lerp(b, ib, im);
    // specular
    const s = Math.pow(Math.max(0, rx * L[0] + ry * L[1] + rz * L[2]), 90) * 255;
    out[0] = Math.min(255, r + s); out[1] = Math.min(255, g + s); out[2] = Math.min(255, b + s);
  }

  // shade a height field region onto ctx: z[] heights, sd[] signed distance (px, >0 inside)
  function shadeRegion(ctx, x0, y0, w, h, z, sd, zscale, tilt = 0) {
    const img = ctx.getImageData(x0, y0, w, h), d = img.data, out = [0, 0, 0];
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x; const a = H.clamp(sd[i] + 0.5);
      if (a <= 0) continue;
      const dzx = (z[i + 1] - z[i - 1]) * 0.5 * zscale, dzy = (z[i + w] - z[i - w]) * 0.5 * zscale;
      const ny0 = -dzy - tilt; // tilt > 0 makes flat faces look up into the sky
      const m = Math.hypot(dzx, ny0, 1);
      env(-dzx / m, ny0 / m, 1 / m, out);
      const p = i * 4;
      d[p] = H.lerp(d[p], out[0], a); d[p + 1] = H.lerp(d[p + 1], out[1], a); d[p + 2] = H.lerp(d[p + 2], out[2], a);
    }
    ctx.putImageData(img, x0, y0);
  }

  function boxBlur(a, w, h, r, passes) {
    const tmp = new Float32Array(a.length);
    for (let p = 0; p < passes; p++) {
      for (let y = 0; y < h; y++) { let acc = 0; const row = y * w; for (let x = -r; x <= r; x++) acc += a[row + H.clamp(x, 0, w - 1)]; for (let x = 0; x < w; x++) { tmp[row + x] = acc / (2 * r + 1); acc += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)]; } }
      for (let x = 0; x < w; x++) { let acc = 0; for (let y = -r; y <= r; y++) acc += tmp[H.clamp(y, 0, h - 1) * w + x]; for (let y = 0; y < h; y++) { a[y * w + x] = acc / (2 * r + 1); acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]; } }
    }
  }

  function metaBlob(ctx, balls, bx, by, bw, bh, smooth = 0) {
    const w = bw, h = bh, n = w * h;
    const f = new Float32Array(n), z = new Float32Array(n), sd = new Float32Array(n);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let s = 0, rw = 0, ww = 0;
      const px = bx + x, py = by + y;
      for (const [cx, cy, r] of balls) { const dd = (px - cx) ** 2 + (py - cy) ** 2 + 1; const q = (r * r) / dd, v = q * q; s += v; rw += v * r; ww += v; }
      const i = y * w + x; f[i] = s;
      const g = s > 1 ? 1 - 1 / Math.sqrt(s) : 0;
      z[i] = (rw / ww) * Math.sqrt(g);
    }
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x; const gx = (f[i + 1] - f[i - 1]) * 0.5, gy = (f[i + w] - f[i - w]) * 0.5;
      sd[i] = (f[i] - 1) / (Math.hypot(gx, gy) + 1e-6);
    }
    if (smooth) boxBlur(z, w, h, smooth, 2);   // explainer: liquid-smooth height field (no torn horizon creases)
    shadeRegion(ctx, bx, by, w, h, z, sd, 1.0);
  }

  let MEAS = null;
  function bubbleText(ctx, text, cx, by, font, stroke, blur, W, Hh, scaleOf = () => 1, opt = null) {
    // opt (explainer): ls letter spacing, zh inflate height, zs extra height smoothing, halo/haloA/haloBlur, tilt
    const o = opt || {}, ls = o.ls != null ? o.ls : 12, zh = o.zh || 60;
    if (!MEAS) MEAS = document.createElement('canvas').getContext('2d');
    MEAS.font = font; MEAS.textAlign = 'center'; MEAS.textBaseline = 'alphabetic'; MEAS.letterSpacing = ls + 'px';
    const m = MEAS.measureText(text);
    const x0 = Math.floor(cx - m.width / 2 - 60), x1 = Math.ceil(cx + m.width / 2 + 60);
    const y0 = Math.floor(by - m.actualBoundingBoxAscent - 60), y1 = Math.ceil(by + m.actualBoundingBoxDescent + 60);
    const w = x1 - x0, h = y1 - y0;
    // letters drawn sharp into a bbox-sized layer, then blurred once (was a full-frame blur per glyph draw)
    const L0 = H.layer(w, h), l0 = L0.getContext('2d');
    l0.font = font; l0.textBaseline = 'alphabetic'; l0.lineJoin = 'round'; l0.letterSpacing = ls + 'px'; l0.textAlign = 'left';
    l0.fillStyle = '#fff'; l0.strokeStyle = '#fff'; l0.lineWidth = stroke; l0.translate(-x0, -y0);
    const left = cx - m.width / 2;
    for (let i = 0; i < text.length; i++) { // letters inflate individually
      const k = scaleOf(i); if (k <= 0.01 || text[i] === ' ') continue;
      const xa = left + l0.measureText(text.slice(0, i)).width, wch = l0.measureText(text[i]).width;
      l0.save(); l0.translate(xa + wch / 2, by - m.actualBoundingBoxAscent * 0.45); l0.scale(k, k); l0.translate(-(xa + wch / 2), -(by - m.actualBoundingBoxAscent * 0.45));
      l0.strokeText(text[i], xa, by); l0.fillText(text[i], xa, by);
      l0.restore();
    }
    const Lr = H.layer(w, h), lc = Lr.getContext('2d', { willReadFrequently: true });
    lc.filter = `blur(${blur}px)`; lc.drawImage(L0, 0, 0); lc.filter = 'none';
    const a = lc.getImageData(0, 0, w, h).data;
    const A = new Float32Array(w * h), z = new Float32Array(w * h), sd = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) A[i] = a[i * 4 + 3] / 255;
    boxBlur(A, w, h, o.ab || 3, 3);
    const T = 0.5;
    for (let i = 0; i < w * h; i++) z[i] = Math.sqrt(H.clamp((A[i] - T) / (1 - T))) * zh;
    if (o.zs) boxBlur(z, w, h, o.zs, 1);   // calmer normals on small glyphs: continuous reflections, no speckled horizon
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x; const gx = (A[i + 1] - A[i - 1]) * 0.5, gy = (A[i + w] - A[i - w]) * 0.5;
      sd[i] = (A[i] - T) / (Math.hypot(gx, gy) + 1e-6);
    }
    // soft lilac drop shadow
    ctx.save(); ctx.globalAlpha = 0.55; ctx.filter = 'blur(12px)';
    const sh = H.layer(w, h), sc = sh.getContext('2d'); sc.drawImage(Lr, 0, 0); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#5a3fa8'; sc.fillRect(0, 0, w, h);
    ctx.drawImage(sh, x0 + 8, y0 + 18); ctx.restore();
    if (o.halo) { // thin indigo rim for legibility on pale backgrounds (explainer only)
      const hl = H.layer(w, h), hc = hl.getContext('2d'); hc.filter = `blur(${o.haloBlur != null ? o.haloBlur : 2}px)`; hc.drawImage(Lr, 0, 0); hc.filter = 'none'; hc.globalCompositeOperation = 'source-in'; hc.fillStyle = o.halo; hc.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = o.haloA != null ? o.haloA : 0.95; ctx.drawImage(hl, x0, y0); if (o.haloA == null) ctx.drawImage(hl, x0, y0); ctx.restore();
    }
    shadeRegion(ctx, x0, y0, w, h, z, sd, 1.0, o.tilt != null ? o.tilt : 0.32);
  }

  function sparkle(c, x, y, s, a = 1) {
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(x, y, 0, x, y, s * 0.6);
    g.addColorStop(0, `rgba(255,255,255,${0.9 * a})`); g.addColorStop(0.3, `rgba(220,235,255,${0.35 * a})`); g.addColorStop(1, 'rgba(200,220,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, s * 0.6, 0, 7); c.fill();
    c.fillStyle = `rgba(255,255,255,${a})`;
    const star = (len, wid, rot) => { c.save(); c.translate(x, y); c.rotate(rot); c.beginPath(); c.moveTo(-len, 0); c.quadraticCurveTo(0, -wid, len, 0); c.quadraticCurveTo(0, wid, -len, 0); c.fill(); c.restore(); };
    star(s, s * 0.09, 0); star(s, s * 0.09, Math.PI / 2); star(s * 0.45, s * 0.06, Math.PI / 4); star(s * 0.45, s * 0.06, -Math.PI / 4);
    c.restore();
  }

  function iriBubble(c, x, y, r, rot) {
    c.save();
    // body: mostly clear with faint tint
    const g = c.createRadialGradient(x - r * 0.2, y - r * 0.25, r * 0.1, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.04)'); g.addColorStop(0.75, 'rgba(220,235,255,0.10)'); g.addColorStop(0.93, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0.0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    // thin-film rim
    const cg = c.createConicGradient(rot, x, y);
    ['#7ff3ff', '#b28cff', '#ff8fe0', '#ffe28f', '#8fffc8', '#7ff3ff'].forEach((col, i, arr) => cg.addColorStop(i / (arr.length - 1), col));
    c.globalAlpha = 0.55; c.strokeStyle = cg; c.lineWidth = Math.max(2, r * 0.09);
    c.beginPath(); c.arc(x, y, r * 0.93, 0, 7); c.stroke();
    c.globalAlpha = 0.25; c.lineWidth = r * 0.22; c.beginPath(); c.arc(x, y, r * 0.84, rot, rot + 2.2); c.stroke();
    // highlights
    c.globalAlpha = 0.85; c.strokeStyle = '#fff'; c.lineWidth = Math.max(1.5, r * 0.06); c.lineCap = 'round';
    c.beginPath(); c.arc(x, y, r * 0.72, Math.PI * 1.08, Math.PI * 1.42); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x + r * 0.42, y + r * 0.45, r * 0.08, r * 0.05, -0.7, 0, 7); c.fill();
    c.restore();
  }

  function frostedPill(ctx, snap, x, y, w, h, label, icon) {
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.clip();
    ctx.filter = 'blur(10px)'; ctx.drawImage(snap, 0, 0); ctx.filter = 'none';
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, 'rgba(255,255,255,0.62)'); g.addColorStop(0.5, 'rgba(240,245,255,0.30)'); g.addColorStop(1, 'rgba(225,215,255,0.38)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    // glossy top lip
    const gl = ctx.createLinearGradient(0, y, 0, y + h * 0.5);
    gl.addColorStop(0, 'rgba(255,255,255,0.75)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.roundRect(x + 4, y + 2, w - 8, h * 0.45, h * 0.22); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, h / 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(110,100,190,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x - 0.5, y - 0.5, w + 1, h + 1, h / 2 + 0.5); ctx.stroke();
    let tx = x + h * 0.5;
    if (icon) { icon(ctx, x + h * 0.5, y + h / 2); tx += h * 0.55; }
    ctx.fillStyle = '#2c2a6b'; ctx.font = '700 15px "Space Grotesk"'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '1.5px';
    ctx.fillText(label, tx, y + h / 2 + 1);
    ctx.restore();
  }
  const orbIcon = (c, x, y) => { const g = c.createRadialGradient(x - 3, y - 3, 1, x, y, 10); g.addColorStop(0, '#fff'); g.addColorStop(0.4, '#9ff0ff'); g.addColorStop(1, '#6a5cff'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); };
  const playIcon = (c, x, y) => { c.fillStyle = '#2c2a6b'; c.beginPath(); c.moveTo(x - 5, y - 7); c.lineTo(x + 7, y); c.lineTo(x - 5, y + 7); c.closePath(); c.fill(); };

  // =====================================================================================
  // EXPLAINER: a glossy millennium "AI 2000" interface. The model is a living mercury blob; scenes change by
  // liquid morph (the blob slides and re-forms) while frosted glass panels swoosh in/out; arrows are
  // iridescent ribbons; hero numbers are inflated chrome bubble digits.
  // =====================================================================================
  const cl = H.clamp, EZ = H.ease;
  function y2kBackground(ctx, W, H_, t) {
    const bg = ctx.createLinearGradient(0, 0, W * 0.4, H_);
    bg.addColorStop(0, '#eef3ff'); bg.addColorStop(0.45, '#cfdcff'); bg.addColorStop(1, '#c6b6f4');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
    const glow = (x, y, r, col) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
    glow(900 + Math.sin(t * 0.3) * 60, 300, 420, 'rgba(255,255,255,0.7)'); glow(200, 640, 380, 'rgba(190,160,255,0.45)'); glow(160, 90, 300, 'rgba(160,230,255,0.5)');
    ctx.save(); ctx.strokeStyle = 'rgba(120,110,200,0.08)'; ctx.lineWidth = 1;
    const off = (t * 12) % 32;
    for (let x = -off; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H_); ctx.stroke(); }
    for (let y = 0; y < H_; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();
  }
  function glass(ctx, x, y, w, h, r, a = 1) {
    ctx.save(); ctx.globalAlpha = a;
    ctx.shadowColor = 'rgba(80,60,160,0.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(255,255,255,0.72)'); g.addColorStop(0.5, 'rgba(245,248,255,0.45)'); g.addColorStop(1, 'rgba(230,220,255,0.55)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
    ctx.shadowColor = 'transparent';
    const gl = ctx.createLinearGradient(0, y, 0, y + Math.min(60, h * 0.4)); gl.addColorStop(0, 'rgba(255,255,255,0.8)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.roundRect(x + 6, y + 3, w - 12, Math.min(60, h * 0.4), r * 0.6); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x + 1, y + 1, w - 2, h - 2, r); ctx.stroke();
    ctx.strokeStyle = 'rgba(110,100,190,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x - 0.5, y - 0.5, w + 1, h + 1, r); ctx.stroke();
    ctx.restore();
  }
  function label(ctx, txt, x, y, px, col = '#2c2a6b', align = 'center', a = 1) {
    ctx.save(); ctx.globalAlpha = a; ctx.font = `700 ${px}px "Space Grotesk"`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.restore();
  }
  function pillTag(ctx, txt, x, y, px, active = false, a = 1) { // glossy pill centred at x,y
    ctx.save(); ctx.font = `700 ${px}px "Space Grotesk"`; const w = ctx.measureText(txt).width + px * 1.4, h = px * 1.8; ctx.restore();
    glass(ctx, x - w / 2, y - h / 2, w, h, h / 2, a);
    if (active) { ctx.save(); ctx.globalAlpha = a; const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#9ff0ff'); g.addColorStop(0.5, '#c4a6ff'); g.addColorStop(1, '#ff9be3'); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x - w / 2 + 3, y - h / 2 + 3, w - 6, h - 6, h / 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.roundRect(x - w / 2 + 8, y - h / 2 + 5, w - 16, h * 0.32, h / 4); ctx.fill(); ctx.restore(); }
    label(ctx, txt, x, y + 1, px, '#2c2a6b', 'center', a);
    return w;
  }
  function critter(ctx, kind, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const face = ctx.createRadialGradient(-10, -14, 4, 0, 0, 44);
    if (kind === 'cat') {
      face.addColorStop(0, '#ffe2b8'); face.addColorStop(0.6, '#ffaa5c'); face.addColorStop(1, '#e8743a');
      ctx.fillStyle = '#e8743a'; ctx.beginPath(); ctx.moveTo(-34, -6); ctx.lineTo(-28, -44); ctx.lineTo(-6, -28); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(34, -6); ctx.lineTo(28, -44); ctx.lineTo(6, -28); ctx.closePath(); ctx.fill();
      ctx.fillStyle = face; ctx.beginPath(); ctx.ellipse(0, 4, 38, 32, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#2c2a6b'; ctx.beginPath(); ctx.ellipse(-13, 0, 5, 7, 0, 0, 7); ctx.ellipse(13, 0, 5, 7, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#ff6f9c'; ctx.beginPath(); ctx.moveTo(-5, 12); ctx.lineTo(5, 12); ctx.lineTo(0, 18); ctx.fill();
      ctx.strokeStyle = '#2c2a6b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-44, 10); ctx.lineTo(-20, 14); ctx.moveTo(44, 10); ctx.lineTo(20, 14); ctx.stroke();
    } else {
      face.addColorStop(0, '#fff2dc'); face.addColorStop(0.6, '#e2c08c'); face.addColorStop(1, '#b98a52');
      ctx.fillStyle = face; ctx.beginPath(); ctx.ellipse(0, 2, 30, 36, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#7a4a28'; ctx.beginPath(); ctx.ellipse(-32, 0, 12, 28, 0.35, 0, 7); ctx.ellipse(32, 0, 12, 28, -0.35, 0, 7); ctx.fill();
      ctx.fillStyle = '#2c2a6b'; ctx.beginPath(); ctx.ellipse(-11, -6, 5, 6, 0, 0, 7); ctx.ellipse(11, -6, 5, 6, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 14, 8, 6, 0, 0, 7); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-12, -18, 10, 5, -0.4, 0, 7); ctx.fill();
    ctx.restore();
  }
  function card(ctx, x, y, s, kind, lab, a = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    glass(ctx, -70, -80, 140, 160, 22, a);
    ctx.globalAlpha = a; critter(ctx, kind, 0, -18, 0.9); ctx.globalAlpha = 1;
    pillTag(ctx, lab, 0, 52, 26, false, a);
    ctx.restore();
  }
  function ribbon(ctx, a, b, cp, prog, w = 12) { // iridescent swoosh arrow, quadratic
    const pt = (u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * cp[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * cp[1] + u * u * b[1]];
    const n = Math.max(2, Math.round(40 * cl(prog)));
    const pts = []; for (let i = 0; i <= n; i++) pts.push(pt((i / 40)));
    ctx.save(); ctx.lineCap = 'round';
    const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, '#9ff0ff'); g.addColorStop(0.5, '#c4a6ff'); g.addColorStop(1, '#ff9be3');
    ctx.strokeStyle = 'rgba(90,70,170,0.18)'; ctx.lineWidth = w + 8; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke();
    ctx.strokeStyle = g; ctx.lineWidth = w; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = w * 0.25; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1] - w * 0.2) : ctx.moveTo(p[0], p[1] - w * 0.2))); ctx.stroke();
    if (prog >= 1) {
      const [ex, ey] = b, [px, py] = pt(0.95), ang = Math.atan2(ey - py, ex - px);
      ctx.fillStyle = '#ff9be3'; ctx.beginPath(); ctx.moveTo(ex + Math.cos(ang) * 14, ey + Math.sin(ang) * 14); ctx.lineTo(ex + Math.cos(ang + 2.4) * 22, ey + Math.sin(ang + 2.4) * 22); ctx.lineTo(ex + Math.cos(ang - 2.4) * 22, ey + Math.sin(ang - 2.4) * 22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.restore();
    return pt;
  }
  function badge(ctx, x, y, r, ok, a = 1) {
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, 2, x, y, r); g.addColorStop(0, ok ? '#c8ffe6' : '#ffc8d8'); g.addColorStop(0.6, ok ? '#2fd39a' : '#ff3d6e'); g.addColorStop(1, ok ? '#14946a' : '#c0153f');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.beginPath();
    if (ok) { ctx.moveTo(x - r * 0.42, y + r * 0.02); ctx.lineTo(x - r * 0.1, y + r * 0.34); ctx.lineTo(x + r * 0.46, y - r * 0.32); }
    else { ctx.moveTo(x - r * 0.35, y - r * 0.35); ctx.lineTo(x + r * 0.35, y + r * 0.35); ctx.moveTo(x + r * 0.35, y - r * 0.35); ctx.lineTo(x - r * 0.35, y + r * 0.35); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.5, r * 0.35, r * 0.16, -0.4, 0, 7); ctx.fill();
    ctx.restore();
  }
  function blobAt(ctx, cx, cy, R, t, wob, extra = []) {
    const ph = t * 0.9;
    const balls = [
      [cx + Math.cos(ph) * 6 * wob, cy + Math.sin(ph * 1.3) * 6 * wob, R],
      [cx + R * 0.8 + Math.cos(ph + 2) * 10 * wob, cy - R * 0.7 + Math.sin(ph + 1) * 10 * wob, R * 0.48],
      [cx - R * 0.75 + Math.cos(ph + 4) * 10 * wob, cy + R * 0.65 + Math.sin(ph + 2) * 8 * wob, R * 0.5],
      [cx + R * 0.95, cy + R * 0.55 + Math.sin(ph) * 12 * wob, R * 0.32],
      ...extra,
    ].filter((b) => b[2] > 1);
    const pad = R * 2.1;
    metaBlob(ctx, balls, Math.max(0, Math.round(cx - pad)), Math.max(0, Math.round(cy - pad)), Math.round(pad * 2), Math.round(pad * 2), 4);
  }

  const HALO = { halo: '#3b2f8f', haloA: 0.6, haloBlur: 1, tilt: 0.32, zs: 2 };
  const bt = (px, extra) => ({ ...HALO, zh: Math.round(px * 0.45), ...extra });   // inflate height scaled to glyph size (hero: 160px -> 60)
  function explainY2K(ctx, W, H_, t) {
    const T2 = 2.55, T3 = 6.0, T4 = 10.5, T5 = 12.9;
    ENVX = -0.1 + Math.sin(t * 0.5) * 0.06; IRIP = t * 0.06; ENVH = -0.06; ENVS = 0.03;   // own env state (was whatever the hero left behind)
    y2kBackground(ctx, W, H_, t);
    // ---- model blob position per scene (liquid morph between them) ----
    const keys = [[0, 1000, 340, 0], [1.6, 1000, 340, 0], [2.3, 960, 330, 125], [T3, 960, 330, 125], [T3 + 0.6, 540, 300, 105], [T4, 540, 300, 105], [T4 + 0.5, 1170, 105, 42], [T5, 1170, 105, 42], [T5 + 0.5, 1090, 590, 55]];
    let bx = 0, by = 0, bR = 0;
    for (let i = 0; i < keys.length - 1; i++) { const [t0, x0, y0, r0] = keys[i], [t1, x1, y1, r1] = keys[i + 1]; if (t >= t0 && t < t1) { const e = EZ.inOut((t - t0) / (t1 - t0)); bx = H.lerp(x0, x1, e); by = H.lerp(y0, y1, e); bR = H.lerp(r0, r1, e); break; } if (i === keys.length - 2) { bx = x1; by = y1; bR = r1; } }
    const moving = keys.some(([k0], i) => i < keys.length - 1 && t > k0 && t < keys[i + 1][0] && (keys[i + 1][1] !== keys[i][1]));
    const adjusting = t > 8.9 && t < 9.6;
    // droplets fly in to form the model during the hook
    let extra = [];
    if (t > 1.5 && t < 2.6) for (let k = 0; k < 4; k++) { const p = cl((t - 1.5 - k * 0.12) / 0.6); const a = k * 1.7; extra.push([bx + Math.cos(a) * 420 * (1 - EZ.out(p)), by + Math.sin(a) * 300 * (1 - EZ.out(p)), 40 * (1 - p * 0.7)]); }
    if (adjusting) extra.push([bx + Math.sin(t * 9) * bR * 0.6, by + bR * 0.9, bR * 0.35]);
    ctx.save(); ctx.filter = 'blur(22px)'; ctx.fillStyle = 'rgba(90,60,170,0.25)'; ctx.beginPath(); ctx.ellipse(bx, by + bR * 1.5, bR * 1.6 + 1, bR * 0.25 + 1, 0, 0, 7); ctx.fill(); ctx.restore();
    if (bR > 2 || extra.length) blobAt(ctx, bx, by, Math.max(bR, 1), t, 1 + (moving ? 3 : 0) + (adjusting ? 4 : 0), extra);

    // ---------------- S1: hook ----------------
    if (t < T2) {
      const def = cl((t - 2.1) / 0.35); // letters deflate into the header pill
      const inflate = (i, t0) => EZ.back(cl((t - t0 - i * 0.05) / 0.3)) * (1 - EZ.in(def));
      if (def < 1) { bubbleText(ctx, 'How does', 600, 280, '700 132px "Fredoka"', 5, 4, W, H_, (i) => inflate(i, 0.1), bt(132)); bubbleText(ctx, 'AI learn?', 600, 450, '700 132px "Fredoka"', 5, 4, W, H_, (i) => inflate(i, 0.4), bt(132)); }
    }
    // header pill (persistent)
    if (t > 2.2) { const p = EZ.out(cl((t - 2.2) / 0.4)); ctx.save(); ctx.translate(-420 * (1 - p), 0); pillTag(ctx, 'How does AI learn?', 205, 54, 30, false, cl(p * 2)); ctx.restore(); }

    // ---------------- S2: data ----------------
    if (t > T2 - 0.1 && t < T3 + 0.5) {
      const out = EZ.in(cl((t - T3) / 0.45)), ox = -900 * out;
      ctx.save(); ctx.translate(ox, 0);
      const A = [60, 280], B = [800, 320], CP = [420, 90];
      const pt = ribbon(ctx, A, B, CP, cl((t - 2.5) / 0.45), 14);
      for (let k = 0; k < 10; k++) {
        const t0 = 2.8 + k * 0.32, p = (t - t0) / 1.3; if (p < 0 || p > 1) continue;
        const [x, y] = pt(EZ.inOut(p)); const kind = k % 2 ? 'dog' : 'cat';
        card(ctx, x, y - 10, H.lerp(1.15, 0.45, EZ.in(p)), kind, kind, cl((1 - p) * 6));
      }
      const n = 1e6 * EZ.inOut(cl((t - 2.9) / 2.6));
      if (t > 2.6) {
        bubbleText(ctx, Math.round(n).toLocaleString('en-US'), 330, 600, '700 96px "Fredoka"', 4, 3, W, H_, undefined, bt(96, { ab: 2, zs: 3 }));
        label(ctx, 'labelled examples', 330, 660, 32);
      }
      if (t > 2.7) pillTag(ctx, 'THE MODEL', 960 - ox, 520, 30);
      ctx.restore();
    }

    // ---------------- S3: guess -> check -> adjust ----------------
    const step = t < 7.0 ? -1 : t < 7.9 ? 0 : t < 8.5 ? 1 : t < 9.6 ? 2 : t < 10.0 ? 0 : 1;
    if (t > T3 + 0.2 && t < T4 + 0.32) {
      const inn = EZ.out(cl((t - T3 - 0.2) / 0.45)), out = EZ.in(cl((t - T4) / 0.3));
      const ox = 1300 * (1 - inn) - 1300 * out;
      ctx.save(); ctx.translate(ox, 0);
      card(ctx, 160, 300, 1.25, 'cat', '?');
      ribbon(ctx, [258, 300], [405, 300], [330, 260], cl((t - 6.6) / 0.3), 10);
      pillTag(ctx, 'THE MODEL', 540, 452, 28);
      ribbon(ctx, [660, 260], [780, 230], [720, 200], cl((t - 7.0) / 0.3), 10);
      if (t > 7.0) label(ctx, 'Guess', 720, 176, 30, '#4b3fa8');
      // speech bubble
      const sb = cl((t - 7.2) / 0.25);
      if (sb > 0) {
        const shake = t > 7.9 && t < 8.25 ? Math.sin(t * 90) * 10 * (8.25 - t) * 3 : 0;
        ctx.save(); ctx.translate(shake, 0);
        glass(ctx, 790, 120, 420, 220, 40, sb);
        ctx.save(); ctx.globalAlpha = sb; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.moveTo(812, 260); ctx.lineTo(770, 300); ctx.lineTo(850, 280); ctx.fill(); ctx.restore();
        if (t < 9.6) {
          label(ctx, 'dog?', 950, 205, 96, '#2c2a6b', 'center', sb);
          if (t > 7.9) {
            badge(ctx, 1130, 200, 44, false, cl((t - 7.9) / 0.15));
            const rg = cl((t - 7.9) / 0.4); ctx.save(); ctx.strokeStyle = `rgba(255,60,110,${0.8 * (1 - rg * 0.5)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(1000, 230, 230 + rg * 20, 128 + rg * 12, 0, 0, 7); ctx.stroke(); ctx.restore();
            label(ctx, "Check: it's a cat!", 1000, 296, 34, '#c0153f');
          }
        } else {
          label(ctx, 'cat', 950, 205, 96, '#2c2a6b');
          badge(ctx, 1110, 200, 44, true, cl((t - 9.6) / 0.15));
          label(ctx, 'Correct!', 1000, 296, 34, '#14946a');
        }
        ctx.restore();
      }
      // error droplet back to the weights
      if (t > 8.5 && t < 9.6) {
        const pt = ribbon(ctx, [930, 350], [700, 560], [930, 560], cl((t - 8.5) / 0.35), 8);
        const p = cl((t - 8.5) / 0.4); const [dx, dy] = pt(p);
        const g = ctx.createRadialGradient(dx - 4, dy - 4, 1, dx, dy, 20); g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#ff6fb5'); g.addColorStop(1, 'rgba(255,60,160,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dx, dy, 20, 0, 7); ctx.fill();
        label(ctx, 'error', 980, 470, 30, '#c0153f');
      }
      // weights panel with chrome slider knobs
      glass(ctx, 360, 500, 330, 130, 26);
      label(ctx, 'weights', 525, 528, 28);
      const adj = EZ.inOut(cl((t - 8.9) / 0.6));
      [[0.2, 0.75], [0.8, 0.3], [0.45, 0.9]].forEach(([a0, b0], i) => {
        const y = 562 + i * 24, x0 = 390, w = 270, v = H.lerp(a0, b0, adj);
        ctx.fillStyle = 'rgba(80,70,160,0.25)'; ctx.beginPath(); ctx.roundRect(x0, y - 4, w, 8, 4); ctx.fill();
        const kx = x0 + v * w, g = ctx.createRadialGradient(kx - 3, y - 4, 1, kx, y, 11); g.addColorStop(0, '#fff'); g.addColorStop(0.5, adjusting ? '#ff9be3' : '#b9c8ff'); g.addColorStop(1, '#5a5aa0');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(kx, y, 11, 0, 7); ctx.fill();
      });
      // loop pills
      const xs = [800, 980, 1160];
      ['Guess', 'Check', 'Adjust'].forEach((lab, i) => pillTag(ctx, lab, xs[i], 612, 30, i === step));
      ribbon(ctx, [860, 612], [912, 612], [886, 600], 1, 5); ribbon(ctx, [1040, 612], [1094, 612], [1067, 600], 1, 5);
      ribbon(ctx, [1160, 650], [800, 650], [980, 705], 1, 5);
      label(ctx, 'repeat', 980, 690, 28, '#4b3fa8');
      ctx.restore();
    }

    // ---------------- S4: progress ----------------
    if (t > T4 + 0.3 && t < T5 + 0.37) {
      const inn = EZ.out(cl((t - T4 - 0.3) / 0.45)), out = EZ.in(cl((t - T5) / 0.35));
      const ox = 1300 * (1 - inn) - 1300 * out;
      ctx.save(); ctx.translate(ox, 0);
      glass(ctx, 50, 120, 700, 500, 36);
      const gx0 = 110, gx1 = 710, gy0 = 170, gy1 = 540;
      ctx.strokeStyle = 'rgba(80,70,160,0.18)'; ctx.lineWidth = 1.5;
      for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(gx0, H.lerp(gy1, gy0, i / 4)); ctx.lineTo(gx1, H.lerp(gy1, gy0, i / 4)); ctx.stroke(); }
      label(ctx, 'training rounds →', (gx0 + gx1) / 2, 585, 30);
      label(ctx, '100%', gx0 - 6, gy0 - 22, 24, '#4b3fa8', 'left'); label(ctx, '50%', gx0 - 6, gy1 + 20, 24, '#4b3fa8', 'left');
      const pr = cl((t - T4 - 0.55) / 1.2), N = 24, val = (u) => 61 + 36 * (1 - Math.pow(1 - u, 2.2));
      const P = (u) => [H.lerp(gx0, gx1, u), H.lerp(gy1, gy0, (val(u) - 50) / 50)];
      if (pr > 0) {
        const g = ctx.createLinearGradient(gx0, 0, gx1, 0); g.addColorStop(0, '#9ff0ff'); g.addColorStop(0.5, '#b28cff'); g.addColorStop(1, '#ff8fe0');
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(90,70,170,0.2)'; ctx.lineWidth = 16; ctx.beginPath(); for (let i = 0; i <= N * pr; i++) ctx.lineTo(...P(i / N)); ctx.lineTo(...P(pr)); ctx.stroke();
        ctx.strokeStyle = g; ctx.lineWidth = 9; ctx.stroke(); ctx.restore();
        const [hx, hy] = P(pr); const sg = ctx.createRadialGradient(hx - 5, hy - 6, 1, hx, hy, 16); sg.addColorStop(0, '#fff'); sg.addColorStop(0.5, '#c4d4ff'); sg.addColorStop(1, '#5a5aa0');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(hx, hy, 16, 0, 7); ctx.fill();
      }
      const acc = pr >= 1 ? 97 : Math.round(val(pr));
      pillTag(ctx, 'ACCURACY', 1010, 190, 32);
      bubbleText(ctx, acc + '%', 1010, 410, '700 170px "Fredoka"', 8, 6, W, H_, undefined, bt(170));
      if (pr >= 1) {
        const k = cl((t - T4 - 1.8) / 0.35);
        ctx.save(); const g = ctx.createConicGradient(t, 1010, 350); ['#9ff0ff', '#b28cff', '#ff8fe0', '#ffe28f', '#9ff0ff'].forEach((c2, i, a) => g.addColorStop(i / (a.length - 1), c2));
        ctx.strokeStyle = g; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(1010, 350, 230 * EZ.back(k), 140 * EZ.back(k), 0, 0, 7); ctx.stroke(); ctx.restore();
        sparkle(ctx, 1180, 250, 80 * Math.sin(k * Math.PI) + 30, 1);
        label(ctx, 'up from 61%', 1010, 520, 34, '#4b3fa8');
      }
      ctx.restore();
    }

    // ---------------- S5: takeaway ----------------
    if (t > T5 + 0.2) {
      bubbleText(ctx, 'More examples', 640, 330, '700 120px "Fredoka"', 3, 4, W, H_, (i) => EZ.back(cl((t - T5 - 0.25 - i * 0.04) / 0.35)), bt(120, { ls: 8, ab: 2 }));
      const p = EZ.out(cl((t - T5 - 0.8) / 0.4));
      if (p > 0) {
        ctx.save(); ctx.globalAlpha = p; ctx.translate(0, 30 * (1 - p));
        ctx.font = '700 64px "Space Grotesk"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const g = ctx.createLinearGradient(330, 0, 950, 0); g.addColorStop(0, '#4fb8ff'); g.addColorStop(0.5, '#8a5cff'); g.addColorStop(1, '#ff5cc8');
        ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.lineJoin = 'round'; ctx.strokeText('→ better guesses', 640, 470);
        ctx.fillStyle = g; ctx.fillText('→ better guesses', 640, 470);
        ctx.restore();
      }
    }
    // ambient bubbles + glints
    const bub = (x, y, r, rot, sp) => iriBubble(ctx, x + Math.sin(t * 0.9 + rot) * 8, ((y - t * sp) % 820 + 820) % 820 - 50, r, rot + t * 0.4);
    bub(90, 700, 34, 3.0, 30); bub(1230, 760, 28, 2.0, 24); bub(700, 820, 20, 1.2, 36);
    const tw = (k) => 0.6 + 0.4 * Math.sin(t * 3 + k);
    sparkle(ctx, bx - bR * 0.45, by - bR * 0.55, bR * 0.5 * tw(0) + 4, 0.95);
    sparkle(ctx, 1220, 40, 24 * tw(2), 0.8);
    H.grain(ctx, W, H_, 0.025, 4 + Math.floor(t * 12), true);
  }

  // ---- SOUND: a glossy millennium UI. Inflating chrome letters are springy bubble pops, mercury droplets land with
  // liquid plips, the blob morphs with a gloopy wobble, frosted glass panels glide with a soft smooth air slide, pills
  // and badges are glass taps, all over a light airy maj9 pad. Times copy explainY2K (T2/T3/T4/T5 and the per-element
  // offsets); tonal sounds stay below ~2 kHz.
  function y2kSound(k) {
    const END = 15, T2 = 2.55, T3 = 6.0, T4 = 10.5, T5 = 12.9;
    // inflating bubble letter: quick rising "boing" body + the pop skin
    const inflate = (t, f, g = 1, pan = 0, minor = true) => {
      k.tone(t, { f: [[0, f * 0.55], [0.07, f]], dur: 0.12, gain: 0.16 * g, a: 0.003, pan, minor });
      k.noise(t + 0.004, { dur: 0.012, filter: 'bandpass', f: 1800, q: 1.2, gain: 0.08 * g, a: 0.0005, pan, minor });
    };
    // mercury droplet landing: a wet "plip" (pitch jumps up fast like a water drop)
    const plip = (t, f, g = 1, pan = 0, minor = true) => k.tone(t, { f: [[0, f], [0.045, f * 2.1]], dur: 0.07, gain: 0.16 * g, a: 0.002, pan, verb: 0.2, minor });
    // liquid chrome morph: wobbling low sine + soft brown-noise slosh
    const gloop = (t, d, g = 1, pan = 0) => {
      const pts = []; for (let i = 0; i <= 6; i++) pts.push([(i / 6) * d, (i % 2 ? 230 : 160) * (1 + 0.15 * Math.sin(i))]);
      k.tone(t, { f: pts, dur: d, gain: 0.06 * g, a: d * 0.3, hold: d * 0.3, filter: 'lowpass', f2: 600, pan });
      k.noise(t, { dur: d, color: 'brown', filter: 'lowpass', f: [[0, 250], [d * 0.5, 550], [d, 200]], gain: 0.1 * g, a: d * 0.4, pan });
    };
    // frosted panel glide: a smooth, low air slide (no swoosh)
    const glide = (t, d, g = 1, pan = 0) => k.noise(t, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 350], [d, 650]], q: 0.7, gain: 0.07 * g, a: d * 0.5, pan, minor: true });
    // glass tap: soft sine with a fifth partial, short and shiny
    const tap = (t, n, g = 1, pan = 0, minor = false) => { k.tone(t, { f: n, dur: 0.5, gain: 0.1 * g, a: 0.002, verb: 0.35, pan, minor }); k.tone(t, { f: k.hz(n) * 1.5, dur: 0.18, gain: 0.03 * g, a: 0.002, pan, minor }); };
    // iridescent ribbon drawing on: a soft shimmering band of air rising with it
    const shimmer = (t, d, g = 1, pan = 0) => k.noise(t, { dur: d + 0.05, color: 'pink', filter: 'bandpass', f: [[0, 700], [d, 1700]], q: 2.5, gain: 0.05 * g, a: d * 0.6, pan, minor: true });
    const counter = (t0, t1, fn, step, play) => { let last = -1, lastV = fn(t0); for (let t = t0; t <= t1 + 1e-6; t += 1 / 120) { const v = fn(t); if (v - lastV >= step && t - last >= 1 / 12) { play(t); last = t; lastV = v; } } };

    k.music('pad', 0, END, { bpm: 90, gain: 0.42, chords: [['D4', 'F#4', 'A4', 'C#5'], ['B3', 'D4', 'F#4', 'A4'], ['G3', 'B3', 'D4', 'F#4'], ['A3', 'C#4', 'E4', 'G4']] });

    // ---- S1: chrome letters inflate (line 1 from 0.1, line 2 from 0.4, 0.05 s apart): a pop every other letter
    const PENT = [294, 330, 370, 440, 494, 587, 659, 740];
    for (let i = 0; i < 8; i += 2) inflate(0.1 + i * 0.05, PENT[i / 2], 1, -0.3);
    for (let i = 0; i < 9; i += 2) inflate(0.4 + i * 0.05, PENT[Math.min(7, 2 + i / 2)], 1, 0.3);
    // mercury droplets fly in and merge (each lands at 1.5 + 0.12k + 0.6), blob swells 1.6..2.3
    for (let j = 0; j < 4; j++) plip(2.1 + j * 0.12, 260 + j * 40, 0.9, 0.4);
    gloop(1.6, 0.75, 1.1, 0.4);
    // letters deflate into the header (2.1..2.45): a soft falling air release; header pill glides in (2.2..2.6)
    k.noise(2.1, { dur: 0.36, color: 'pink', filter: 'lowpass', f: [[0, 1400], [0.35, 300]], gain: 0.12, a: 0.03, hold: 0.15 });
    k.tone(2.1, { f: [[0, 420], [0.35, 150]], dur: 0.36, gain: 0.07, a: 0.03, hold: 0.15 });
    glide(2.2, 0.4, 1, -0.6);

    // ---- S2: ribbon draws (2.5..2.95), model pill (2.7), cards ride in, bubble counter
    shimmer(2.5, 0.45, 1, -0.3);
    tap(2.7, 'A5', 0.8, 0.4, true);
    for (let i = 0; 2.8 + i * 0.32 + 1.1 < T3; i++) plip(2.8 + i * 0.32 + 1.1, 220 + (i % 3) * 30, 0.8, 0.45);   // card dissolves into the blob (p ~ 0.85)
    counter(2.9, 5.5, (t) => EZ.inOut(cl((t - 2.9) / 2.6)), 1 / 40, (t) => k.play('pop', t, { f: 520, gain: 0.45, pan: -0.4, minor: true }));
    inflate(5.5, 440, 1.6, -0.4, false); tap(5.55, 'D5', 0.8, -0.4);                                                  // lands on 1,000,000

    // ---- T3: data panel out (6.0..6.45), blob morphs (6.0..6.6), loop panel glides in (6.2..6.65)
    glide(T3, 0.45, 1.3, -0.5); gloop(T3, 0.6, 1); glide(T3 + 0.2, 0.45, 1.3, 0.5);
    shimmer(6.6, 0.3, 0.8, -0.3);                                                       // card -> model ribbon
    shimmer(7.0, 0.3, 0.8, 0.3); tap(7.0, 'E5', 0.6, 0.2, true);                        // model -> guess ribbon, Guess pill lights
    inflate(7.2, 330, 1.6, 0.4, false); tap(7.32, 'B4', 0.7, 0.4);                     // speech bubble inflates: "dog?"
    // CHECK (7.9): wrong. red badge pops, ring, the bubble shakes (7.9..8.25): rubbery falling "bwomp" + low knock
    const WRONG = 7.9;
    k.tone(WRONG, { f: [[0, 340], [0.3, 110]], type: 'triangle', dur: 0.45, gain: 0.3, a: 0.004, hold: 0.1, pan: 0.5 });
    k.tone(WRONG, { f: [[0, 360], [0.3, 116]], type: 'sine', dur: 0.45, gain: 0.2, a: 0.004, hold: 0.1, pan: 0.5 });
    k.play('thud', WRONG, { f: 100, gain: 0.85, pan: 0.5 });
    inflate(WRONG, 250, 1.2, 0.6, false);
    tap(WRONG, 'F#5', 0.4, 0.3, true);                                                   // Check pill
    // ADJUST (8.5): error droplet slides down to the weights (8.5..8.9), then the blob wobbles while sliders glide
    tap(8.5, 'G5', 0.4, -0.2, true);
    k.tone(8.5, { f: [[0, 700], [0.38, 260]], dur: 0.42, gain: 0.09, a: 0.02, hold: 0.25, pan: 0.3, verb: 0.2 });
    plip(8.88, 230, 1.2, -0.2, false);
    gloop(8.9, 0.7, 0.9, -0.1);
    k.withMinor(() => [0, 1, 2].forEach((i) => k.tone(8.9, { f: [[0, 300 + i * 50], [0.6, 380 + i * 70]], dur: 0.62, gain: 0.03, a: 0.2, hold: 0.2, pan: -0.4 + i * 0.1 })));
    // GUESS again -> "cat" + green badge (9.6): bright glossy chime
    inflate(9.6, 440, 1.3, 0.5, false);
    ['D5', 'F#5', 'A5'].forEach((n, i) => tap(9.6 + i * 0.07, n, 1, 0.5));
    tap(10.0, 'F#5', 0.4, 0.3, true);                                                     // Check pill

    // ---- T4: loop panel out (10.5..10.8), blob morphs (10.5..11.0), chart panel in (10.8..11.25)
    glide(T4, 0.3, 1.3, -0.5); gloop(T4, 0.5, 0.9, 0.5); glide(T4 + 0.3, 0.45, 1.3, 0.4);
    shimmer(T4 + 0.55, 1.2, 0.9, -0.3);                                                   // the line draws 11.05..12.25
    const val = (u) => 61 + 36 * (1 - Math.pow(1 - u, 2.2));
    counter(T4 + 0.55, T4 + 1.75, (t) => Math.round(val(cl((t - T4 - 0.55) / 1.2))), 1, (t) => k.play('pop', t, { f: 560, gain: 0.45, pan: 0.4, minor: true }));
    // 97% (pr >= 1 at T4 + 1.75; ring springs out from T4 + 1.8): biggest moment. big bubble burst + glossy chord bloom
    const BEST = T4 + 1.75 + 1e-3;
    k.play('impact', BEST, { f: 90, gain: 0.85 });
    inflate(BEST, 300, 2.2, 0.3, false);
    ['D4', 'A4', 'C#5', 'E5', 'F#5'].forEach((n, i) => { k.tone(BEST + 0.05 + i * 0.05, { f: n, type: 'triangle', dur: 1.5, gain: 0.09, a: 0.01, verb: 0.45, pan: -0.4 + i * 0.2 }); k.tone(BEST + 0.05 + i * 0.05, { f: n, detune: 8, dur: 1.5, gain: 0.07, a: 0.01, verb: 0.45, pan: 0.4 - i * 0.2 }); });
    shimmer(BEST + 0.05, 0.35, 1.4, 0.5);

    // ---- T5: chart panel out (12.9..13.25), blob morphs down (12.9..13.4), takeaway letters inflate (13.15 + 0.04i)
    glide(T5, 0.35, 1.3, -0.5); gloop(T5, 0.5, 0.8, 0.5);
    for (let i = 0; i < 13; i += 2) inflate(T5 + 0.25 + i * 0.04, PENT[Math.min(7, i / 2 + 1)], 1, -0.5 + i * 0.08);
    // "→ better guesses" glides up (13.7..14.1): the takeaway resolves on the tonic
    const TAKE = T5 + 0.8;
    glide(TAKE, 0.4, 1, 0);
    ['A4', 'D5'].forEach((n, i) => tap(TAKE + 0.1 + i * 0.12, n, 1));
    k.tone(TAKE + 0.22, { f: 'D3', type: 'triangle', dur: 1.3, gain: 0.16, a: 0.02, hold: 0.3 });
  }

  registerStyle({
    id: 'y2k-chrome',
    name: 'Y2K Liquid Chrome',
    category: 'Retro UI & Neon',
    description: 'Millennium-futurist liquid chrome: environment-mapped metaball blobs and inflated chrome bubble letters with thin-film iridescence, soap bubbles, starburst glints and frosted pill UI in silver, ice-blue and lilac.',
    motion: 'Mercury droplets fly in, overshoot and merge into one blob, chrome letters inflate one by one with a springy pop, frosted pills glide up, and reflections, bubbles and glints keep sliding and twinkling.',
    fonts: ['700 190px "Fredoka"', '700 15px "Space Grotesk"', '500 13px "Orbitron"', '700 30px "Space Grotesk"', '700 132px "Fredoka"'],
    frameT: 5.2,
    duration: 5.5,
    explainerDuration: 15,
    explainerNote: 'A glossy millennium interface explains it: the model is a living mercury blob that liquid-morphs to a new spot at every scene change while frosted-glass panels swoosh in and out, arrows are iridescent ribbons, labels are glossy pills, and the counter and 97% are inflated chrome bubble digits.',
    explainer(ctx, W, H_, t) { explainY2K(ctx, W, H_, t); },
    explainerSound(k) { y2kSound(k); },
    readsPixels: true,
    draw(ctx, W, H_, t) {
      // background: pearly silver to ice blue to lilac
      const bg = ctx.createLinearGradient(0, 0, W * 0.4, H_);
      bg.addColorStop(0, '#eef3ff'); bg.addColorStop(0.45, '#cfdcff'); bg.addColorStop(1, '#c6b6f4');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
      const glow = (x, y, r, col) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
      glow(980, 300, 420, 'rgba(255,255,255,0.75)');
      glow(200, 640, 380, 'rgba(190,160,255,0.45)');
      glow(160, 90, 300, 'rgba(160,230,255,0.5)');
      // concentric orbit rings + fine grid (tech wallpaper)
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1;
      for (let k = 0; k < 6; k++) { const rp = H.ease.out(H.clamp((t - k * 0.08) / 1.2)); if (rp <= 0) continue; ctx.globalAlpha = rp; ctx.beginPath(); ctx.ellipse(930, 330, (230 + k * 70) * (0.6 + 0.4 * rp), (90 + k * 28) * (0.6 + 0.4 * rp), -0.25 + Math.sin(t * 0.4) * 0.03, 0, 7); ctx.stroke(); }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(120,110,200,0.08)';
      for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H_); ctx.stroke(); }
      for (let y = 0; y < H_; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.restore();

      // liquid chrome blob cluster (mercury): droplets fly in, overshoot and merge
      const E = H.ease, cl = H.clamp;
      ENVX = Math.sin(t * 0.7) * 0.18; IRIP = t * 0.06; ENVH = -0.1; ENVS = 0;
      const ph = t * 0.6;
      const arrive = (i, t0, dx, dy) => { const p = cl((t - t0) / 0.9); const e = E.back(p); return [dx * (1 - e), dy * (1 - e), cl(p * 2.2)]; };
      const BL = [
        [960 + Math.cos(ph) * 10, 320 + Math.sin(ph * 1.3) * 8, 118, 0.2, 0, 260],
        [1112 + Math.cos(ph + 2) * 14, 196 + Math.sin(ph + 1) * 12, 64, 0.45, 260, -220],
        [826 + Math.cos(ph + 4) * 12, 452 + Math.sin(ph + 2) * 10, 66, 0.6, -300, 160],
        [1118 + Math.sin(ph) * 8, 470 + Math.cos(ph) * 10, 46, 0.75, 240, 240],
        [1196, 330 + Math.sin(ph * 0.8) * 20, 28, 0.9, 260, 0],
        [800 + Math.sin(ph * 1.2) * 10, 236, 26, 1.0, -220, -200],
      ];
      const balls = BL.map(([x, y, r, t0, dx, dy], i) => { const [ox, oy, k] = arrive(i, t0, dx, dy); return [x + ox, y + oy, r * k]; }).filter((b) => b[2] > 1);
      const bk = cl((t - 0.2) / 1.0);
      ctx.save(); ctx.filter = 'blur(26px)'; ctx.fillStyle = `rgba(90,60,170,${0.28 * bk})`;
      ctx.beginPath(); ctx.ellipse(950, 590, 60 + 200 * bk, 14 + 26 * bk, 0, 0, 7); ctx.fill(); ctx.restore();
      if (balls.length) metaBlob(ctx, balls, 650, 110, 590, 450);
      const drops = [[1195, 140, 22, 1.25, 120, -120], [690, 560, 26, 1.35, -160, 120], [1210, 560, 16, 1.45, 120, 120]].map(([x, y, r, t0, dx, dy]) => { const [ox, oy, k] = arrive(0, t0, dx, dy); return [x + ox, y + oy, r * k]; }).filter((b) => b[2] > 1);
      if (drops.length) metaBlob(ctx, drops, 640, 100, 600, 500);

      // iridescent soap bubbles: pop into being, then drift up
      const bub = (x, y, r, rot, t0, sp) => { const p = cl((t - t0) / 0.5); if (p <= 0) return; iriBubble(ctx, x + Math.sin(t * 0.9 + rot) * 6, y - (t - t0) * sp, r * E.back(p), rot + t * 0.4); };
      bub(600, 168, 62, 0.4, 0.5, 9);
      bub(1180, 660, 46, 2.0, 0.9, 11);
      bub(470, 630, 30, 4.1, 1.2, 14);
      bub(690, 84, 22, 1.2, 1.5, 7);
      bub(80, 490, 40, 3.0, 0.7, 10);

      // chrome bubble lettering: each letter inflates with a springy overshoot
      const T_TX = 1.6;
      bubbleText(ctx, 'AI 2000', 392, 398, '700 160px "Fredoka"', 7, 7, W, H_, (i) => E.back(cl((t - T_TX - i * 0.11) / 0.45)));

      // small label types on
      ctx.save();
      ctx.font = '500 13px "Orbitron"'; ctx.letterSpacing = '6px'; ctx.fillStyle = 'rgba(60,55,140,0.85)';
      const LAB = 'NEXT-GEN INTELLIGENCE';
      ctx.fillText(LAB.slice(0, cl(Math.floor((t - 2.5) / 0.025), 0, LAB.length)), 112, 214);
      const ul = E.out(cl((t - 2.4) / 0.5));
      ctx.fillRect(112, 224, 36 * ul, 2); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(152, 224, 170 * ul, 1);
      ctx.restore();

      // frosted UI pills glide up into place
      const snap = H.layer(W, H_); snap.getContext('2d').drawImage(ctx.canvas, 0, 0, W, H_);
      const pill = (t0, x, y, w, h, label, icon) => { const p = cl((t - t0) / 0.55); if (p <= 0) return; ctx.save(); ctx.globalAlpha = E.out(p); frostedPill(ctx, snap, x, y + 26 * (1 - E.out(p)), w, h, label, icon); ctx.restore(); };
      const Q = 'ask me anything';
      const typed = Q.slice(0, cl(Math.floor((t - 3.2) / 0.04), 0, Q.length)) + (Math.floor(t * 2.5) % 2 ? '_' : ' ');
      pill(2.7, 112, 468, 370, 54, typed, orbIcon);
      pill(2.85, 498, 468, 150, 54, 'LAUNCH', playIcon);
      pill(2.3, 980, 46, 196, 40, 'v2.0 online', (c, x, y) => { c.fillStyle = '#41e0a0'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); c.strokeStyle = `rgba(65,224,160,${0.25 + 0.25 * Math.sin(t * 5)})`; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 10 + 2 * Math.sin(t * 5), 0, 7); c.stroke(); });
      // loading bar pill
      const lp = cl((t - 3.0) / 0.5);
      if (lp > 0) {
        ctx.save(); ctx.globalAlpha = E.out(lp);
        const lx = 112, ly = 540, lw = 300, lh = 14;
        ctx.beginPath(); ctx.roundRect(lx, ly, lw, lh, 7); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.stroke();
        const pr = 0.02 + 0.84 * E.inOut(cl((t - 3.1) / 2.4));
        const lg = ctx.createLinearGradient(lx, 0, lx + lw * pr, 0); lg.addColorStop(0, '#9ff0ff'); lg.addColorStop(0.6, '#b9a2ff'); lg.addColorStop(1, '#ff9be3');
        ctx.beginPath(); ctx.roundRect(lx + 2, ly + 2, (lw - 4) * pr, lh - 4, 5); ctx.fillStyle = lg; ctx.fill();
        ctx.font = '500 11px "Orbitron"'; ctx.letterSpacing = '3px'; ctx.fillStyle = 'rgba(50,45,120,0.8)';
        ctx.fillText('LOADING FUTURE ' + Math.round(pr * 100) + '%', lx + lw + 16, ly + 11);
        ctx.restore();
      }

      // starburst glints
      const on = (k, t0) => H.ease.back(H.clamp((t - t0) / 0.35));
      const tw = (k) => (0.6 + 0.4 * Math.sin(t * 3 + k)) * on(k, [2.0, 2.2, 2.4, 2.6, 2.8][k]);
      sparkle(ctx, 868, 214, 70 * tw(0), 1);
      sparkle(ctx, 1052, 168, 34 * tw(1), 0.9);
      sparkle(ctx, 182, 292, 52 * tw(2), 1);
      sparkle(ctx, 560, 300, 30 * tw(3), 0.9);
      sparkle(ctx, 300, 90, 22 * on(5, 1.0), 0.8);
      sparkle(ctx, 1230, 380, 26 * tw(4), 0.8);
      sparkle(ctx, 760, 620, 20 * on(6, 3.0), 0.7);
      H.grain(ctx, W, H_, 0.025, 4 + Math.floor(t * 12), true);
    },
  });
}
