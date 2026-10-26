{
  // Kinetic typography frame: oversized words stacked edge to edge with tight leading, mixed
  // weights, outline vs fill, strobe echoes, a slice-glitch, and one word stretched and masked
  // with a halftone image. Strict two-colour: near-black + acid yellow.
  const INK = '#e6ff2e', BG = '#0c0c0b';

  // fit a word so its ink spans exactly targetW (uses actual bounding box, not advance)
  function fit(ctx, font, size, text, targetW) {
    ctx.font = `${font.replace('{s}', size)}`;
    const m = ctx.measureText(text);
    const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    const s = (size * targetW) / w;
    ctx.font = `${font.replace('{s}', s)}`;
    const m2 = ctx.measureText(text);
    return { size: s, left: m2.actualBoundingBoxLeft, asc: m2.actualBoundingBoxAscent, desc: m2.actualBoundingBoxDescent, w: m2.actualBoundingBoxLeft + m2.actualBoundingBoxRight };
  }


  // =====================================================================================
  // EXPLAINER — "How does AI learn?" told in kinetic type: words slam on the beat, cuts are
  // slice-glitches and whip-pans, arrows are heavy rules with chevrons, numbers are Anton.
  // =====================================================================================
  const XS = (t, a, b) => H.clamp((t - a) / (b - a));
  let ANTON_CAP = 0;
  function capRatio(ctx) {
    if (!ANTON_CAP) { ctx.font = '400 200px "Anton"'; ANTON_CAP = ctx.measureText('H').actualBoundingBoxAscent / 200; }
    return ANTON_CAP;
  }
  // Anton word at left x / baseline y with a given cap height; returns drawn width
  function aw(ctx, text, x, y, cap, o = {}) {
    let size = cap / capRatio(ctx);
    ctx.save();
    ctx.font = `400 ${size}px "Anton"`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    if (o.fitW) { const mw = ctx.measureText(text).width; if (mw > o.fitW) { size *= o.fitW / mw; ctx.font = `400 ${size}px "Anton"`; } }
    const m = ctx.measureText(text), w = m.width * (o.sx || 1);
    let ox = x; if (o.align === 'center') ox = x - w / 2; else if (o.align === 'right') ox = x - w;
    ctx.translate(ox, y); if (o.sx) ctx.scale(o.sx, 1);
    if (o.outline) { ctx.strokeStyle = o.color || INK; ctx.lineWidth = (o.lw || 3) / (o.sx || 1); ctx.lineJoin = 'miter'; ctx.strokeText(text, 0, 0); }
    else { ctx.fillStyle = o.color || INK; ctx.fillText(text, 0, 0); }
    ctx.restore();
    return w;
  }
  function tag(ctx, text, x, y, o = {}) { // inverted label block (ink box, black mono text)
    ctx.save();
    ctx.font = `700 ${o.size || 18}px "Space Mono"`; ctx.textBaseline = 'middle';
    const w = ctx.measureText(text).width + 16, h = (o.size || 18) + 12;
    const ox = o.align === 'center' ? x - w / 2 : x;
    ctx.fillStyle = o.inv ? BG : INK; ctx.fillRect(ox, y - h / 2, w, h);
    if (o.inv) { ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(ox, y - h / 2, w, h); }
    ctx.fillStyle = o.inv ? INK : BG; ctx.fillText(text, ox + 8, y + 1);
    ctx.restore();
    return w;
  }
  // pet pictogram brightness for halftone (u,v in -1..1, y down): clean geometric shapes,
  // lit from the upper left so the dot portrait has some volume
  const inTri = (px, py, ax, ay, bx, by, cx, cy) => {
    const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by), d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy), d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  const inEll = (u, v, cx, cy, rx, ry) => { const a = (u - cx) / rx, b = (v - cy) / ry; return a * a + b * b < 1; };
  function petB(kind, u, v) {
    const lit = (cx, cy, r) => H.clamp(1.08 - 0.3 * Math.hypot(u - cx + r * 0.38, v - cy + r * 0.42) / r, 0.72, 1);
    if (kind === 'cat') {
      const hx = 0, hy = 0.16, hr = 0.56;
      const head = inEll(u, v, hx, hy, hr, hr * 0.92);
      let ear = 0;
      for (const s of [-1, 1]) {
        if (inTri(u, v, s * 0.56, 0.02, s * 0.5, -0.86, s * 0.08, -0.28)) ear = 1;
        if (inTri(u, v, s * 0.45, -0.1, s * 0.45, -0.62, s * 0.22, -0.3)) ear = ear ? 2 : ear;
      }
      for (const s of [-1, 1]) for (const dy of [-0.05, 0.07]) { // whiskers: straight bright strokes outside the face
        const x = u * s; if (x > 0.42 && x < 0.95) { const yy = 0.36 + dy + (x - 0.42) * dy * 1.6; if (Math.abs(v - yy) < 0.026) return 0.8; }
      }
      if (!head && !ear) return 0.035;
      if (ear === 2) return 0.5;
      if (ear && !head) return lit(hx, hy, hr) * 0.92;
      for (const s of [-1, 1]) { if (inEll(u, v, s * 0.23, 0.08, 0.1, 0.12)) return inEll(u, v, s * 0.23 - 0.03, 0.04, 0.035, 0.035) ? 0.9 : 0.03; }
      if (inTri(u, v, -0.08, 0.27, 0.08, 0.27, 0, 0.36)) return 0.03;
      if (Math.abs(u) < 0.022 && v > 0.35 && v < 0.43) return 0.1;
      return lit(hx, hy, hr);
    }
    // dog: round head, long floppy ears, pale muzzle, dark nose
    const hx = 0, hy = 0.04, hr = 0.5;
    for (const s of [-1, 1]) {
      const a = 0.32 * s, du = u - s * 0.52, dv = v - 0.14, ru = du * Math.cos(a) + dv * Math.sin(a), rv = -du * Math.sin(a) + dv * Math.cos(a);
      if ((ru / 0.17) ** 2 + (rv / 0.44) ** 2 < 1 && !inEll(u, v, hx, hy, hr * 0.98, hr * 1.06)) return 0.6;
      if ((ru / 0.24) ** 2 + (rv / 0.51) ** 2 < 1 && !inEll(u, v, hx, hy, hr * 0.92, hr)) return 0.02; // dark gap so the ear reads
    }
    const head = inEll(u, v, hx, hy, hr * 0.92, hr), muz = inEll(u, v, 0, 0.36, 0.3, 0.22);
    if (!head && !muz) return 0.035;
    if (inEll(u, v, 0, 0.27, 0.11, 0.075)) return inEll(u, v, -0.03, 0.25, 0.03, 0.022) ? 0.75 : 0.03;
    for (const s of [-1, 1]) { if (inEll(u, v, s * 0.2, -0.02, 0.08, 0.09)) return inEll(u, v, s * 0.2 - 0.025, -0.05, 0.03, 0.03) ? 0.9 : 0.03; }
    if (muz) { if (Math.abs(u) < 0.02 && v > 0.33 && v < 0.45) return 0.15; if (v > 0.43 && Math.abs(u) < 0.2 && Math.abs(v - 0.45 - u * u * 1.2) < 0.025) return 0.15; return 1; }
    return lit(hx, hy, hr) * 0.85;
  }
  // halftone portrait on a 45° screen, baked once per kind+size
  const PET_CACHE = {};
  function petTex(kind, size) {
    const key = kind + '|' + Math.round(size);
    if (PET_CACHE[key]) return PET_CACHE[key];
    const S = Math.ceil(size), cv = H.layer(S, S), c = cv.getContext('2d'), h = size / 2;
    const step = Math.max(3.4, Math.min(size / 28, 6.2)), ca = Math.SQRT1_2;
    c.fillStyle = INK; c.beginPath();
    for (let j = -S; j < S * 1.5; j += step) for (let i = -S; i < S * 1.5; i += step) {
      const x = (i - j) * ca + h, y = (i + j) * ca - h * 0.42;
      if (x < 1 || y < 1 || x > S - 1 || y > S - 1) continue;
      const b = petB(kind, ((x - h) / h) * 1.08, ((y - h) / h) * 1.08);
      const r = Math.sqrt(b) * step * 0.6;
      if (r < 0.45) continue;
      c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2);
    }
    c.fill();
    return (PET_CACHE[key] = cv);
  }
  function halftonePet(ctx, kind, cx, cy, size) { const tx = petTex(kind, size); ctx.drawImage(tx, cx - size / 2, cy - size / 2); }
  // ink-block offset shadow (two-colour, like the hero's TO tab), black face, heavy rule
  function blockBox(ctx, x, y, w, h, lw, off) {
    ctx.fillStyle = INK; ctx.fillRect(x + off, y + off, w, h);
    ctx.fillStyle = BG; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h);
  }
  function card(ctx, kind, x, y, size, label) {
    ctx.save();
    const off = size > 150 ? 9 : 6;
    blockBox(ctx, x, y, size, size, 3, off);
    halftonePet(ctx, kind, x + size / 2, y + size / 2, size - 10);
    if (label) tag(ctx, label, x, y + size + 18, { size: 22 });
    ctx.restore();
  }
  function arrowLine(ctx, x0, y0, x1, y1, p, lw = 6, head = 22) {
    if (p <= 0) return;
    const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p, a = Math.atan2(y1 - y0, x1 - x0);
    ctx.save(); ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x - Math.cos(a) * head * 0.6, y - Math.sin(a) * head * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(a - 0.5) * head, y - Math.sin(a - 0.5) * head); ctx.lineTo(x - Math.cos(a + 0.5) * head, y - Math.sin(a + 0.5) * head); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function modelBox(ctx, x, y, w, h, t, adjust, drawP = 1) {
    ctx.save();
    ctx.strokeStyle = INK; ctx.lineWidth = 4;
    // box draws on as a perimeter
    const per = 2 * (w + h), L = per * drawP;
    if (drawP >= 1) blockBox(ctx, x, y, w, h, 4, 10);
    else {
    ctx.beginPath(); ctx.moveTo(x, y);
    const pts = [[x + w, y], [x + w, y + h], [x, y + h], [x, y]];
    let acc = 0, px = x, py = y;
    for (const [qx, qy] of pts) { const d = Math.hypot(qx - px, qy - py); if (acc + d <= L) { ctx.lineTo(qx, qy); acc += d; px = qx; py = qy; } else { const k = (L - acc) / d; ctx.lineTo(px + (qx - px) * k, py + (qy - py) * k); break; } }
    ctx.stroke();
    }
    if (drawP >= 1) {
      aw(ctx, 'MODEL', x + 16, y + 16 + h * 0.18, h * 0.18);
      // weights: bars that jiggle while processing and re-set when adjusted
      const r = H.rng(321), n = 9, bw = (w - 32) / n;
      for (let i = 0; i < n; i++) {
        const b0 = r.range(0.15, 0.95), b1 = r.range(0.35, 0.9);
        const k = adjust <= 0 ? 0 : H.ease.back(H.clamp(adjust));
        let hh = b0 + (b1 - b0) * k + 0.04 * Math.sin(t * 9 + i * 1.7);
        const bh = (h * 0.5) * H.clamp(hh, 0.05, 1.1);
        const bx = x + 16 + i * bw + 3, by = y + h - 16 - bh;
        ctx.fillStyle = INK;
        if (i % 2) { // alternate rounds: 3px stripe hatch inside a rule, like a print screen
          for (let yy = y + h - 16 - 3; yy > by; yy -= 6) ctx.fillRect(bx, Math.max(by, yy), bw - 6, Math.min(3, yy - by + 3));
          ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(bx + 1, by + 1, bw - 8, bh - 1);
        } else ctx.fillRect(bx, by, bw - 6, bh);
      }
      ctx.font = '700 24px "Space Mono"'; ctx.fillStyle = INK; ctx.fillText('WEIGHTS', x + 16, y + h * 0.44);
    }
    ctx.restore();
  }
  function header(ctx) {
    ctx.save(); ctx.font = '700 28px "Space Mono"'; ctx.fillStyle = INK; ctx.textBaseline = 'middle';
    try { ctx.letterSpacing = '2px'; } catch (e) {}
    const w = ctx.measureText('HOW DOES AI LEARN?').width;
    ctx.fillText('HOW DOES AI LEARN?', 30, 34); ctx.fillRect(30, 57, w, 4); ctx.fillRect(30, 64, w * 0.38, 2); ctx.restore();
  }
  // ---------- the hero's typographic finishing, reused in the explainer ----------
  // a filled Anton word rendered through a scratch layer so it can carry the hero's signatures:
  // knocked-out speed lines through the lower third, a shoved slice band with thin rule ticks,
  // and an optional rotated-dot halftone fill (like DREAM) held together by an outline.
  let SCR = null, SCRB = null;
  const DOT_CACHE = {};
  function dotTex(key, w, h, top, capH) { // baked once per word: 45° dot screen, a glow rising from the baseline + drifting cloud bands
    if (DOT_CACHE[key]) return DOT_CACHE[key];
    const cv = H.layer(Math.ceil(w), Math.ceil(h)), c = cv.getContext('2d'), nz = H.makeNoise(31);
    const step = 8, ca = Math.SQRT1_2;
    c.fillStyle = INK; c.beginPath();
    for (let j = -h; j < w + h; j += step) for (let i = -h; i < w + h; i += step) {
      const x = (i - j) * ca, y = (i + j) * ca - w * 0.5;
      if (x < -6 || y < -6 || x > w + 6 || y > h + 6) continue;
      const v = H.clamp((y - top) / capH), cl = nz.fbm2(x * 0.004, y * 0.012, 4) * 0.5 + 0.5;
      const sun = Math.max(0, 0.5 - Math.hypot((x - w * 0.62) / 1.8, y - top - capH * 1.05) / (capH * 1.6));
      const b = H.clamp(0.24 + 0.62 * Math.pow(v, 1.4) + 0.35 * Math.pow(H.clamp(cl * 1.6 - 0.6), 1.2) + sun);
      const r = Math.sqrt(b) * step * 0.62;
      if (r < 0.5) continue;
      c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2);
    }
    c.fill();
    return (DOT_CACHE[key] = cv);
  }
  function heroWord(ctx, text, x, y, cap, o = {}) {
    if (!SCR) { SCR = H.layer(1520, 600); SCRB = H.layer(1520, 80); }
    const c = SCR.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    let size = cap / capRatio(ctx);
    c.font = `400 ${size}px "Anton"`;
    if (o.fitW) { const mw = c.measureText(text).width; if (mw > o.fitW) { size *= o.fitW / mw; c.font = `400 ${size}px "Anton"`; } }
    const capH = size * capRatio(ctx), w = c.measureText(text).width;
    const PX = 80, PY = 40, sw = Math.min(SCR.width, Math.ceil(w + PX * 2)), sh = Math.min(SCR.height, Math.ceil(capH + PY * 2 + size * 0.12));
    const bx = PX, by = PY + capH;
    c.clearRect(0, 0, SCR.width, SCR.height);
    // echoes behind (outline copies fanning right/up, as on the hero's MACHINES)
    if (o.echo) for (let e = o.echo; e >= 1; e--) {
      ctx.save(); ctx.globalAlpha = 0.22 * (o.echo + 1 - e) / o.echo; ctx.font = `400 ${size}px "Anton"`; ctx.textBaseline = 'alphabetic';
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.lineJoin = 'miter'; ctx.strokeText(text, x + e * 24, y - e * 4); ctx.restore();
    }
    c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.fillStyle = INK;
    c.fillText(text, bx, by);
    if (o.dots) { c.globalCompositeOperation = 'source-in'; c.drawImage(dotTex(o.dots + '|' + Math.round(w), sw, sh, PY, capH), 0, 0); c.globalCompositeOperation = 'source-over'; }
    if (o.speed) { c.globalCompositeOperation = 'destination-out'; for (let k = 0; k < 3; k++) c.fillRect(0, Math.round(by - capH * (0.2 + k * 0.045)), sw, Math.max(2, Math.round((4 - k) * capH / 240))); c.globalCompositeOperation = 'source-over'; }
    if (o.dots) { c.strokeStyle = INK; c.lineWidth = 2.6; c.lineJoin = 'miter'; c.strokeText(text, bx, by); }
    let sy = 0, sl = o.slice;
    if (sl) {
      sy = Math.round(by - capH * sl.at);
      const bc = SCRB.getContext('2d'); bc.clearRect(0, 0, SCRB.width, SCRB.height);
      bc.drawImage(SCR, 0, sy, sw, sl.h, 0, 0, sw, sl.h);
      c.clearRect(0, sy, sw, sl.h); c.drawImage(SCRB, 0, 0, sw, sl.h, sl.shift, sy, sw, sl.h);
    }
    ctx.drawImage(SCR, 0, 0, sw, sh, x - bx, y - by, sw, sh);
    if (sl) { // the thin rule ticks the hero draws beside its slice
      const yy = y - by + sy; ctx.fillStyle = INK;
      const tx = x - (sl.tick ?? 24); ctx.fillRect(tx, yy + sl.h + 5, sl.shift - 12, 2); ctx.fillRect(tx, yy - 7, sl.shift * 0.6, 2);
    }
    return w;
  }
  // heavy rule arrow as a polygon (so it can be filled, or stroked as a strobe echo)
  function arrowShape(ctx, x0, y, x1, lw, head) {
    ctx.beginPath();
    ctx.moveTo(x0, y - lw / 2); ctx.lineTo(x1 - head * 0.9, y - lw / 2); ctx.lineTo(x1 - head * 0.9, y - head * 0.55);
    ctx.lineTo(x1, y); ctx.lineTo(x1 - head * 0.9, y + head * 0.55); ctx.lineTo(x1 - head * 0.9, y + lw / 2); ctx.lineTo(x0, y + lw / 2); ctx.closePath();
  }
  function loopIcon(ctx, cx, cy, r, lw) { // ↻ drawn as a heavy circular arrow
    ctx.save(); ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = lw; ctx.lineCap = 'butt';
    const a0 = -Math.PI * 0.35, a1 = Math.PI * 1.25;
    ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke();
    const hx = cx + Math.cos(a1) * r, hy = cy + Math.sin(a1) * r, tg = a1 + Math.PI / 2, hs = lw * 1.7;
    ctx.beginPath(); ctx.moveTo(hx + Math.cos(tg) * hs * 1.3, hy + Math.sin(tg) * hs * 1.3);
    ctx.lineTo(hx + Math.cos(a1) * hs, hy + Math.sin(a1) * hs); ctx.lineTo(hx - Math.cos(a1) * hs, hy - Math.sin(a1) * hs); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  // ---------- scenes ----------
  function ktHook(ctx, W, H_, t) {
    const sl = (c) => (t >= c ? 1 - H.ease.out(XS(t, c, c + 0.16)) : -1);
    const a = sl(0), b = sl(0.5), c = sl(1.0);
    if (a > -1) { ctx.save(); const s = 1 + a * 0.4; ctx.translate(40, 200); ctx.scale(s, s); aw(ctx, 'HOW DOES', 0, 0, 180); ctx.restore(); }
    if (b > -1) { const s = 1 + b * 0.5; ctx.save(); ctx.translate(40 + b * 600, 0); aw(ctx, 'AI', 0, 520, 300 * s, { outline: true, lw: 6 }); for (let e = 1; e <= 3; e++) { ctx.globalAlpha = 0.2 * (4 - e) / 3; aw(ctx, 'AI', e * 26, 520 - e * 4, 300, { outline: true, lw: 2 }); } ctx.restore(); }
    if (c > -1) { ctx.save(); ctx.translate(0, c * 300); heroWord(ctx, 'LEARN?', 420, 520, 300, { fitW: W - 460, speed: true, slice: t >= 1.5 ? { at: 0.6, h: 30, shift: 38 } : null }); ctx.restore(); }
  }
  function ktData(ctx, W, H_, t) {
    const MX = 900;
    modelBox(ctx, MX, 120, 340, 500, t, 0, H.ease.out(XS(t, 2.3, 2.7)));
    // conveyor arrows into the model
    const rows = [175, 335, 495];
    rows.forEach((y, i) => arrowLine(ctx, 20, y + 55, MX - 8, y + 55, H.ease.out(XS(t, 2.4 + i * 0.08, 2.8 + i * 0.08)), 3, 18));
    // labelled examples streaming in, faster and faster
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, MX - 4, H_); ctx.clip();
    const r = H.rng(77), K = 46;
    for (let k = 0; k < K; k++) {
      const kind = r() < 0.5 ? 'cat' : 'dog';
      const ts = 2.45 + 3.1 * Math.pow(k / K, 0.75);
      if (t < ts) continue;
      const x = -130 + (t - ts) * (620 + k * 22);
      if (x > MX + 10) continue;
      card(ctx, kind, x, rows[k % 3], 110, kind.toUpperCase());
    }
    ctx.restore();
    // counter
    if (t < 2.6) return;
    const p = XS(t, 2.6, 5.0);
    const n = p >= 1 ? 1e6 : Math.min(1e6, Math.floor(Math.pow(10, 6 * H.ease.inOut(p))) - 1);
    const w = aw(ctx, fmt(n), 30, 700, 64);
    for (let e = 2; e >= 1; e--) { ctx.save(); ctx.globalAlpha = 0.24 * (3 - e) / 2; aw(ctx, 'EXAMPLES', 30 + w + 18 + e * 14, 700 - e * 3, 64, { outline: true, lw: 1.6 }); ctx.restore(); }
    aw(ctx, 'EXAMPLES', 30 + w + 18, 700, 64, { outline: true, lw: 2.5 });
  }
  function ktLoop(ctx, W, H_, t) {
    // test picture
    card(ctx, 'cat', 70, 150, 230, null);
    const truth = t >= 8.05;
    tag(ctx, truth ? 'ANSWER: CAT' : 'NEW PICTURE', 70, 410, { size: 26 });
    arrowLine(ctx, 315, 265, 465, 265, H.ease.out(XS(t, 6.55, 6.85)));
    const adjust = XS(t, 8.95, 9.35);
    modelBox(ctx, 475, 140, 330, 300, t, adjust, 1);
    arrowLine(ctx, 815, 265, 880, 265, H.ease.out(XS(t, 7.0, 7.2)));
    // data pulse travelling through on the second pass
    if (t > 9.3 && t < 9.6) { const k = XS(t, 9.3, 9.6), x = 315 + k * 565; ctx.fillStyle = INK; ctx.fillRect(x - 14, 252, 28, 26); }
    // output guess
    const right = t >= 9.6;
    if (t >= 7.25 && !right) {
      const s = 1 + 0.4 * Math.pow(1 - H.ease.out(XS(t, 7.25, 7.4)), 2);
      ctx.save(); ctx.translate(900, 330); ctx.scale(s, s);
      for (let e = 3; e >= 1; e--) { ctx.save(); ctx.globalAlpha = 0.2 * (4 - e) / 3; aw(ctx, 'DOG?', e * 22, -e * 4, 150, { outline: true, lw: 2 }); ctx.restore(); }
      aw(ctx, 'DOG?', 0, 0, 150, { outline: true, lw: 5 }); ctx.restore();
    }
    if (right) {
      const s = 1 + 0.4 * Math.pow(1 - H.ease.out(XS(t, 9.6, 9.75)), 2);
      ctx.save(); ctx.translate(900, 330); ctx.scale(s, s); heroWord(ctx, 'CAT', 0, 0, 150, { speed: true, slice: t >= 10.0 ? { at: 0.58, h: 18, shift: 26 } : null }); ctx.restore();
      // tick drawn on
      const k = H.ease.out(XS(t, 9.75, 9.95));
      if (k > 0) { ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.lineCap = 'square'; ctx.beginPath(); ctx.moveTo(1170, 270);
        const p1 = [1195, 300], p2 = [1250, 220]; if (k < 0.4) { ctx.lineTo(1170 + (p1[0] - 1170) * k / 0.4, 270 + (p1[1] - 270) * k / 0.4); } else { ctx.lineTo(p1[0], p1[1]); const q = (k - 0.4) / 0.6; ctx.lineTo(p1[0] + (p2[0] - p1[0]) * q, p1[1] + (p2[1] - p1[1]) * q); } ctx.stroke(); ctx.restore(); }
    }
    // the big X on the wrong guess
    if (t >= 7.85 && !right) {
      const k1 = H.ease.out(XS(t, 7.85, 7.97)), k2 = H.ease.out(XS(t, 7.97, 8.09));
      ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 20; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(880, 170); ctx.lineTo(880 + 340 * k1, 170 + 200 * k1); ctx.stroke();
      if (k2 > 0) { ctx.beginPath(); ctx.moveTo(1220, 170); ctx.lineTo(1220 - 340 * k2, 170 + 200 * k2); ctx.stroke(); }
      ctx.restore();
    }
    // labels that land on what they label
    const drop = (t0) => (1 - H.ease.back(XS(t, t0, t0 + 0.25))) * -60;
    if (t >= 7.35) tag(ctx, 'GUESS', 900, 126 + drop(7.35), { size: 28 });
    if (t >= 8.0 && !right) tag(ctx, 'CHECK ✗ WRONG', 900, 400 + drop(8.0), { size: 28 });
    // error signal travels back to the model
    const e = XS(t, 8.45, 8.9);
    if (e > 0 && t < 9.6) {
      ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.setLineDash([16, 10]); ctx.lineDashOffset = t * 80;
      const path = [[1050, 420], [1050, 520], [640, 520], [640, 448]];
      let L = 0; for (let i = 1; i < path.length; i++) L += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
      let left = L * H.ease.inOut(e); ctx.beginPath(); ctx.moveTo(1050, 420); let end = path[0];
      for (let i = 1; i < path.length && left > 0; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]), k = Math.min(1, left / d); end = [path[i - 1][0] + (path[i][0] - path[i - 1][0]) * k, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * k]; ctx.lineTo(end[0], end[1]); left -= d; }
      ctx.stroke(); ctx.setLineDash([]);
      if (e >= 1) arrowLine(ctx, 640, 470, 640, 446, 1, 5, 22);
      ctx.restore();
      if (t >= 8.6) tag(ctx, 'ADJUST WEIGHTS', 760, 556 + drop(8.6), { size: 28 });
    }
    // loop strip
    const words = ['GUESS', 'CHECK', 'ADJUST'];
    let act = t < 7.3 ? -1 : t < 7.9 ? 0 : t < 8.5 ? 1 : t < 9.4 ? 2 : t < 9.9 ? 0 : Math.floor((t - 9.9) / 0.12) % 3;
    let x = 30;
    const glyphW = (txt, cap) => { ctx.save(); ctx.font = `400 ${cap / capRatio(ctx)}px "Anton"`; const m = ctx.measureText(txt).width; ctx.restore(); return m; };
    words.forEach((wd, i) => {
      x += aw(ctx, wd, x, 690, 64, { outline: i !== act, lw: 2.5 }) + 14;
      if (i < 2) { const aW = glyphW('→', 64); ctx.fillStyle = INK; arrowShape(ctx, x + 4, 690 - 30, x + aW - 2, 7, 22); ctx.fill(); x += aW + 14; }
    });
    { const iW = glyphW('↻ ', 40); loopIcon(ctx, x + 10 + 19, 690 - 19, 15, 6); aw(ctx, '×1,000,000', x + 10 + Math.max(iW, 46), 690, 40, { outline: false }); }
  }
  function ktProgress(ctx, W, H_, t) {
    for (let e = 2; e >= 1; e--) { ctx.save(); ctx.globalAlpha = 0.22 * (3 - e) / 2; aw(ctx, 'ACCURACY', 40 + e * 20, 190 - e * 4, 92, { outline: true, lw: 1.6 }); ctx.restore(); }
    aw(ctx, 'ACCURACY', 40, 190, 92, { outline: true, lw: 3 });
    const p = H.ease.inOut(XS(t, 10.85, 12.3));
    const v = Math.round(61 + 36 * p);
    const punch = t >= 12.3 ? 1 + 0.18 * Math.exp(-(t - 12.3) * 10) : 1;
    ctx.save(); ctx.translate(40, 540); ctx.scale(punch, punch); const w = heroWord(ctx, v + '%', 0, 0, 250, { speed: true, slice: t >= 12.55 ? { at: 0.64, h: 30, shift: 22, tick: 12 } : null }); ctx.restore();
    if (t >= 12.3) { // emphasis box draws around the number
      const k = H.ease.out(XS(t, 12.3, 12.55));
      ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath();
      ctx.rect(22, 262, (w + 40) * k, 306); ctx.stroke(); ctx.restore();
    }
    // bar chart of training rounds
    const x0 = 720, y0 = 600, cw = 520, ch = 360, n = 12;
    ctx.fillStyle = INK; ctx.fillRect(x0, y0, cw, 4);
    for (let i = 0; i < n; i++) {
      const acc = 61 + 36 * (1 - Math.exp(-i / 3.2)) / (1 - Math.exp(-(n - 1) / 3.2));
      const k = H.ease.out(XS(t, 10.85 + i * 0.12, 11.05 + i * 0.12));
      const bh = ((acc - 40) / 60) * ch * k, bx = x0 + i * (cw / n) + 4, bw = cw / n - 10;
      if (bh <= 0) continue;
      if (i % 2) { // alternate rounds: 3px stripe hatch held by a hairline rule
        for (let yy = y0 - 3; yy > y0 - bh; yy -= 6) ctx.fillRect(bx, Math.max(y0 - bh, yy - 3), bw, Math.min(3, yy - (y0 - bh)));
        ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(bx + 1, y0 - bh + 1, bw - 2, bh - 1);
      } else ctx.fillRect(bx, y0 - bh, bw, bh);
    }
    ctx.font = '700 28px "Space Mono"'; ctx.fillText('TRAINING ROUNDS →', x0, y0 + 40);
    if (t >= 12.3) tag(ctx, '97%', x0 + cw - 90, y0 - ch * (57 / 60) - 30, { size: 26 });
  }
  function ktTake(ctx, W, H_, t) {
    const sl = (c) => (t >= c ? 1 + 0.4 * Math.pow(1 - H.ease.out(XS(t, c, c + 0.16)), 2) : 0);
    const settled = (c) => t >= c + 0.16;
    let s = sl(13.0); if (s) { ctx.save(); ctx.translate(40, 270); ctx.scale(s, s);
      heroWord(ctx, 'MORE EXAMPLES', 0, 0, 230, { fitW: W - 80, echo: settled(13.0) ? 3 : 0 }); ctx.restore(); }
    s = sl(13.25); if (s) { ctx.save(); ctx.translate(40, 420); ctx.scale(s, s);
      if (settled(13.25)) for (let e = 3; e >= 1; e--) { ctx.globalAlpha = 0.22 * (4 - e) / 3; arrowShape(ctx, e * 26, -50 - e * 4, 300 + e * 26, 26, 70); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.lineJoin = 'miter'; ctx.stroke(); }
      ctx.globalAlpha = 1; ctx.fillStyle = INK; arrowShape(ctx, 0, -50, 300, 26, 70); ctx.fill();
      ctx.fillStyle = BG; for (let k = 0; k < 2; k++) ctx.fillRect(0, -50 + 4 + k * 5, 240, 2); // knocked-out speed lines
      ctx.restore(); }
    s = sl(13.5); if (s) { ctx.save(); ctx.translate(40, 690); ctx.scale(s, s);
      if (t < 13.8) {
        if (settled(13.5)) for (let e = 2; e >= 1; e--) { ctx.save(); ctx.globalAlpha = 0.2 * (3 - e) / 2; aw(ctx, 'BETTER GUESSES', e * 24, -e * 4, 230, { fitW: W - 80, outline: true, lw: 2 }); ctx.restore(); }
        aw(ctx, 'BETTER GUESSES', 0, 0, 230, { fitW: W - 80, outline: true, lw: 5 });
      } else heroWord(ctx, 'BETTER GUESSES', 0, 0, 230, { fitW: W - 80, dots: 'bg', echo: 2 });
      ctx.restore(); }
  }
  function sceneLayer(W, H_, fn, t) { const c = H.layer(W, H_), x = c.getContext('2d'); fn(x, W, H_, t); return c; }

  function explainKT(ctx, W, H_, t) {
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H_);
    const slam = [0, 0.5, 1.0, 7.25, 7.97, 9.6, 12.3, 13.0, 13.5].reduce((a, c) => a + (t >= c ? Math.exp(-(t - c) * 14) : 0), 0);
    const sr = H.rng(Math.floor(t * 30) + 5);
    ctx.save(); ctx.translate((sr() - 0.5) * 12 * slam, (sr() - 0.5) * 12 * slam);
    if (t < 2.5) {
      // hook: the stack slams in, then shrinks into the corner header
      const k = H.ease.inOut(XS(t, 1.85, 2.45));
      ctx.save(); ctx.translate(30 * k, 20 * k); ctx.scale(1 - 0.93 * k, 1 - 0.93 * k); ktHook(ctx, W, H_, t); ctx.restore();
      if (t > 2.3) header(ctx);
      if (t > 2.3) ktData(ctx, W, H_, t);
    } else if (t < 6.0) {
      header(ctx); ktData(ctx, W, H_, t);
    } else if (t < 10.5) {
      header(ctx);
      if (t < 6.4) {
        // slice-glitch cut: the data scene is torn into bands that fly apart
        const p = H.ease.in(XS(t, 6.0, 6.4));
        const A = sceneLayer(W, H_, ktData, 5.99), B = sceneLayer(W, H_, ktLoop, t);
        ctx.drawImage(B, 0, 0);
        const bands = 9, bh = H_ / bands;
        for (let i = 0; i < bands; i++) {
          const dir = i % 2 ? 1 : -1, off = dir * p * W * (1.1 + (i % 3) * 0.35);
          ctx.fillStyle = BG; if (p < 0.98) ctx.fillRect(off, i * bh, W, bh);
          ctx.drawImage(A, 0, i * bh, W, bh, off, i * bh, W, bh);
        }
      } else ktLoop(ctx, W, H_, t);
    } else if (t < 13.0) {
      header(ctx);
      if (t < 10.8) {
        // whip-pan: scene smears off left with echo copies, next one arrives from the right
        const p = H.ease.inOut(XS(t, 10.5, 10.8));
        const A = sceneLayer(W, H_, ktLoop, 10.49), B = sceneLayer(W, H_, ktProgress, t);
        for (let e = 3; e >= 0; e--) { ctx.globalAlpha = e ? 0.18 : 1; ctx.drawImage(A, -p * W * 1.2 + e * 60 * p, 0); ctx.drawImage(B, W * (1 - p) + e * 60 * (1 - p) * (p > 0 ? 1 : 0), 0); }
        ctx.globalAlpha = 1;
      } else ktProgress(ctx, W, H_, t);
    } else {
      ktTake(ctx, W, H_, t);
    }
    ctx.restore();
    // one-frame inverted flashes on the key hits (wrong guess, 97%)
    if ((t >= 7.97 && t < 8.0) || (t >= 12.3 && t < 12.333)) { ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H_); ctx.restore(); }
    H.grain(ctx, W, H_, 0.04, 91 + Math.floor(t * 12));
  }

  registerStyle({
    id: 'kinetic-type',
    name: 'Kinetic Type',
    category: 'Generative & Type',
    description: 'A typographic music-video frame: condensed words cropped edge to edge with zero leading, filled vs outlined, strobe echoes, a slice glitch and one word stretched and filled with a halftone dreamscape — strictly two colours.',
    motion: 'One word per beat at 120 bpm: THE punches in, MACHINES whips in from the right trailing outline echoes, LEARNED slams up with a one-frame inverted flash, the TO tab wipes up, DREAM springs open and its halftone moon develops; then the slice glitch and echoes pulse on every beat.',
    fonts: ['400 200px "Anton"', '400 60px "Inter"', '800 60px "Inter"', '700 14px "Space Mono"', '400 14px "Space Mono"'],
    duration: 5,
    frameT: 4.9,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'Words slam in on the beat and do the explaining; scenes change with a slice-glitch tear and a whip-pan, arrows are heavy rules with chevrons, labels are inverted mono tags that drop onto their targets, and the counters are huge Anton numerals with a strobe-flash on the key hits.',
    explainer(ctx, W, H_, t) { explainKT(ctx, W, H_, t); },
    // Sound: a type-driven music video. A low 120 bpm pulse bed (the cut grid: beats at 0, 0.5, 1.0 ... 13.0, 13.5)
    // drops out for each hard cut; every word that slams in gets a punchy kick + snap (bigger with a synth stab on the
    // key hits); the slice-glitch cut is a real glitch tear, the whip-pan one fast whoosh, counters tick as short
    // filtered blips, the bars of the chart are pitched plucks. Timings mirror explainKT / kt* scenes (slam list etc).
    explainerSound(k) {
      const E = H.ease;
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // word slam: kick body + bright snap
      const slam = (t, g, p = 0) => { k.tone(t, { f: [[0, 160], [0.12, 46]], dur: 0.26, gain: 0.42 * g, a: 0.002, pan: p }); k.noise(t, { dur: 0.06, filter: 'bandpass', f: 1800, q: 0.8, gain: 0.22 * g, a: 0.001, pan: p }); k.noise(t, { dur: 0.12, color: 'brown', filter: 'lowpass', f: 400, gain: 0.2 * g, a: 0.002, pan: p }); };
      // detuned saw stab
      const stab = (t, notes, dur, g) => notes.forEach((n, i) => { for (const det of [-8, 8]) k.tone(t, { f: n, type: 'sawtooth', detune: det, dur, gain: 0.03 * g, a: 0.004, hold: dur * 0.3, filter: 'lowpass', f2: [[0, 2200], [dur, 500]], q: 0.8, pan: (i - (notes.length - 1) / 2) * 0.3, verb: 0.2 }); });
      const blip = (t, f, g, p) => k.tone(t, { f, type: 'square', dur: 0.03, gain: 0.04 * g, a: 0.001, hold: 0.015, filter: 'lowpass', f2: 2000, pan: p, minor: true });
      const zip = (t, dur, p) => k.noise(t, { dur, filter: 'bandpass', f: [[0, 700], [dur, 2000]], q: 1.5, gain: 0.07, a: dur * 0.5, pan: p, minor: true });
      const tagIn = (t0, p) => k.play('tock', when(t0, t0 + 0.25, E.back, 1), { f: 650, gain: 0.32, pan: p, minor: true });

      // ---- music: low pulse on the 120 bpm grid, out for the cuts
      k.music('pulse', 0, 6.0, { bpm: 120, gain: 0.5, chords: [['A2', 'E3', 'A3', 'C4'], ['F2', 'C3', 'A3', 'C4'], ['G2', 'D3', 'G3', 'B3']] });
      k.music('pulse', 6.5, 10.5, { bpm: 120, gain: 0.45, chords: [['D3', 'A3', 'C4', 'F4'], ['E3', 'B3', 'D4', 'G#4']] });
      k.music('pulse', 11.0, 12.3, { bpm: 120, gain: 0.45, chords: [['F2', 'C3', 'A3', 'E4']] });
      k.music('pulse', 13.0, 14.5, { bpm: 120, gain: 0.5, chords: [['C3', 'G3', 'C4', 'E4']] });

      // ---- hook: HOW DOES / AI / LEARN? slam on beats 0, 0.5, 1.0; the stack shrinks to the header (1.85-2.45)
      slam(0.0, 1, -0.3);
      slam(0.5, 0.9, 0.3); k.noise(0.42, { dur: 0.1, filter: 'highpass', f: [[0, 1500], [0.1, 3500]], gain: 0.06, a: 0.08, pan: 0.6, minor: true }); // AI whips in
      slam(1.0, 1.2, 0.2); stab(1.0, ['A3', 'C4', 'E4'], 0.4, 1);
      k.tone(1.85, { f: [[0, 300], [0.6, 90]], type: 'triangle', dur: 0.6, gain: 0.05, a: 0.1, minor: true }); // shrink away

      // ---- data: model box draws (2.3-2.7), arrows, counter, 1,000,000
      k.tone(2.3, { f: [[0, 120], [0.4, 420]], type: 'sawtooth', dur: 0.42, gain: 0.04, a: 0.05, hold: 0.3, filter: 'lowpass', f2: 900, pan: pan(1070), minor: true });
      [0, 1, 2].forEach((i) => zip(2.4 + i * 0.08, 0.38, -0.3));
      { let prev = 0, last = -1; for (let t = 2.62; t <= 4.98; t += 0.002) { const s = Math.floor(E.inOut(XS(t, 2.6, 5.0)) * 32); if (s !== prev && t - last >= 1 / 10) { blip(t, 700 + 500 * XS(t, 2.6, 5.0), 1, -0.5); last = t; } prev = s; } }
      slam(5.0, 1, -0.5); stab(5.0, ['G3', 'B3', 'D4'], 0.3, 0.8);

      // ---- slice-glitch tear 6.0-6.4 (bands fly apart, ease in)
      k.play('glitch', 6.0, { gain: 1.1 });
      k.noise(6.05, { dur: 0.35, filter: 'bandpass', f: [[0, 600], [0.35, 3000]], q: 0.9, gain: 0.12, a: 0.3 });

      // ---- loop: arrows, DOG? slam, wrong X, error dashes, weights jump, pulse through, CAT ✓
      zip(6.55, 0.3, pan(390)); zip(7.0, 0.2, pan(850));
      slam(7.25, 1, pan(1050)); tagIn(7.35, pan(950));
      k.noise(7.85, { dur: 0.12, filter: 'bandpass', f: [[0, 900], [0.12, 2200]], q: 1, gain: 0.12, a: 0.08, pan: pan(1050) }); // first stroke of the X
      slam(7.97, 1.3, pan(1050)); stab(7.97, ['A#2', 'E3', 'A3'], 0.45, 1.2); // second stroke + flash: wrong
      // (the CHECK tag lands at 8.09 inside the wrong hit, so it stays silent)
      k.withMinor(() => { for (let i = 0; i < 6; i++) { const u = (i + 0.5) / 6, tt = when(8.45, 8.9, E.inOut, u); blip(tt, 520 - i * 30, 1.2, pan(1050 - 410 * u)); } }); // error dashes run back
      tagIn(8.6, pan(760));
      k.tone(8.95, { f: [[0, 180], [0.12, 520]], type: 'sawtooth', dur: 0.14, gain: 0.05, a: 0.02, hold: 0.06, filter: 'lowpass', f2: 1200, pan: pan(640) }); // weights jump (back ease overshoot)
      k.play('click', when(8.95, 9.35, E.back, 1), { f: 1500, gain: 1.1, pan: pan(640), minor: true });
      k.tone(9.3, { f: [[0, 220], [0.3, 660]], type: 'square', dur: 0.3, gain: 0.03, a: 0.02, hold: 0.2, filter: 'lowpass', f2: 1400, pan: 0, minor: true }); // data pulse runs through
      slam(9.6, 1.1, pan(1030)); stab(9.6, ['C4', 'E4', 'G4'], 0.35, 1);
      stab(9.8, ['G4', 'C5'], 0.4, 0.6); // tick drawn

      // ---- whip-pan 10.5-10.8
      k.play('whoosh', 10.48, { dur: 0.34, top: 2200, gain: 0.8 });

      // ---- progress: bars rise (10.85 + i*0.12), counter, 97% slam
      k.withMinor(() => { for (let i = 0; i < 12; i++) { const acc = 61 + 36 * (1 - Math.exp(-i / 3.2)) / (1 - Math.exp(-11 / 3.2)); k.tone(10.85 + i * 0.12 + 0.04, { f: 110 * Math.pow(2, (acc - 61) / 36 * 1.2), type: 'triangle', dur: 0.15, gain: 0.12, a: 0.003, pan: pan(740 + i * 43) }); } });
      { let prev = 0, last = -1; for (let t = 10.86; t <= 12.28; t += 0.002) { const s = Math.floor(E.inOut(XS(t, 10.85, 12.3)) * 36), near = ((t - 10.89) % 0.12 + 0.12) % 0.12 < 0.04; if (s !== prev && !near && t - last >= 1 / 8) { k.noise(t, { dur: 0.015, filter: 'bandpass', f: 2200, q: 2, gain: 0.16, a: 0.001, pan: -0.5, minor: true }); last = t; } prev = s; } }
      slam(12.3, 1.6, -0.3); k.play('impact', 12.3, { gain: 0.9, pan: -0.3 });
      stab(12.3, ['A3', 'C#4', 'E4', 'A4'], 0.7, 1.4);
      k.noise(12.3, { dur: 0.25, filter: 'bandpass', f: [[0, 800], [0.25, 1800]], q: 1.2, gain: 0.05, a: 0.15, minor: true }); // box draws round it

      // ---- takeaway: three slams on the beat, resolve as BETTER GUESSES fills in (13.8)
      slam(13.0, 0.85, -0.2);
      slam(13.25, 0.7, -0.3); zip(13.22, 0.1, -0.3);
      slam(13.5, 0.95, 0); stab(13.5, ['C4', 'E4', 'G4'], 0.3, 0.7);
      stab(13.8, ['C3', 'G3', 'C4', 'E4', 'G4'], 0.65, 1);
    },
    draw(ctx, W, H_, t) {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H_);
      const beat = (t * 2) % 1; // 120 bpm
      const kick = Math.exp(-beat * 6);
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      // per-word cue times (on the beat)
      const P = (t0, d) => H.clamp((t - t0) / d);
      const pThe = P(0.0, 0.16), pMac = P(0.5, 0.26), pLea = P(1.0, 0.2), pSlice = t >= 1.5 ? 1 : 0;
      const pTo = P(2.0, 0.18), pDr = P(2.5, 0.32), pDots = P(2.6, 0.5);
      // camera shake on each slam, decaying fast
      const slam = [0, 1.0, 2.5].reduce((a, c) => a + (t >= c ? Math.exp(-(t - c) * 14) : 0), 0);
      const sr = H.rng(Math.floor(t * 30) + 1);
      ctx.save();
      ctx.translate((sr() - 0.5) * 14 * slam, (sr() - 0.5) * 14 * slam);

      // ---------- ROW 1: "THE" light + "MACHINES" outline, with strobe echoes ----------
      const C1 = 128, C2 = 262, gap = 12, top = 16;
      ctx.font = '400 200px "Anton"';
      const aCap = ctx.measureText('MACHINES').actualBoundingBoxAscent / 200; // cap-height ratio
      const s1 = C1 / aCap;
      ctx.font = `400 ${s1}px "Anton"`;
      const mM = ctx.measureText('MACHINES');
      const mW = mM.actualBoundingBoxLeft + mM.actualBoundingBoxRight;
      ctx.font = '400 100px "Inter"';
      const iCap = ctx.measureText('THE').actualBoundingBoxAscent / 100;
      const sT = C1 / iCap;
      ctx.font = `400 ${sT}px "Inter"`;
      const mT = ctx.measureText('THE');
      const tW = mT.actualBoundingBoxLeft + mT.actualBoundingBoxRight;
      const inner = 22;
      const row1W = tW + inner + mW;
      const sx1 = (W + 12) / row1W;
      const base1 = top + C1;
      ctx.save(); ctx.translate(-4, 0); ctx.scale(sx1, 1);
      if (pThe > 0) {
        const sc = 1 + 0.35 * Math.pow(1 - H.ease.out(pThe), 2);
        ctx.save(); ctx.translate(tW / 2, base1 - C1 / 2); ctx.scale(sc, sc); ctx.translate(-tW / 2, -(base1 - C1 / 2));
        ctx.fillStyle = INK; ctx.fillText('THE', mT.actualBoundingBoxLeft, base1); ctx.restore();
      }
      const mx = tW + inner + mM.actualBoundingBoxLeft;
      ctx.font = `400 ${s1}px "Anton"`; ctx.lineJoin = 'miter'; ctx.strokeStyle = INK;
      if (pMac > 0) {
        // whip in from the right; echoes trail horizontally while moving, then fan upward
        const em = H.ease.out(pMac), offX = (1 - em) * 900;
        const settle = H.ease.inOut(P(0.76, 0.4));
        for (let e = 3; e >= 1; e--) {
          ctx.globalAlpha = 0.18 * (4 - e) * (0.6 + 0.4 * (t > 1.5 ? kick : 1)); ctx.lineWidth = 1.4 / sx1;
          const ex = offX + e * 70 * (1 - em) * 3, ey = -e * 30 * settle;
          ctx.strokeText('MACHINES', mx + ex, base1 + ey);
        }
        ctx.globalAlpha = 1; ctx.lineWidth = 3.2 / sx1;
        ctx.strokeText('MACHINES', mx + offX, base1);
      }
      ctx.restore();

      // ---------- ROW 2: "LEARNED" massive fill, stretched edge to edge, slice glitch ----------
      const s2 = C2 / aCap;
      ctx.font = `400 ${s2}px "Anton"`;
      const mL = ctx.measureText('LEARNED');
      const lW = mL.actualBoundingBoxLeft + mL.actualBoundingBoxRight;
      const sx2 = (W + 30) / lW;
      const base2 = base1 + gap + C2;
      const lay = H.layer(W, H_), lc = lay.getContext('2d');
      lc.save(); lc.translate(-15, 0); lc.scale(sx2, 1);
      lc.font = `400 ${s2}px "Anton"`; lc.fillStyle = INK; lc.textBaseline = 'alphabetic';
      lc.fillText('LEARNED', mL.actualBoundingBoxLeft, base2);
      lc.restore();
      // knocked-out speed lines through the lower third
      lc.globalCompositeOperation = 'destination-out';
      for (let k = 0; k < 3; k++) lc.fillRect(0, base2 - C2 * (0.2 + k * 0.045), W, 4 - k);
      // slice glitch: cut a band and shove it sideways on the beat
      const sy = Math.round(base2 - C2 * 0.6), sh = 28, shift = 22 + Math.round(kick * 26);
      if (pSlice) {
        const band = H.layer(W, sh); band.getContext('2d').drawImage(lay, 0, sy, W, sh, 0, 0, W, sh);
        lc.fillRect(0, sy, W, sh);
        lc.globalCompositeOperation = 'source-over'; lc.drawImage(band, shift, sy);
      }
      if (pLea > 0) {
        const el = H.ease.out(pLea), dy = (1 - el) * 420;
        // squash on impact (2 frames), then hold
        const sq = pLea >= 1 ? 1 + 0.06 * Math.exp(-(t - 1.2) * 20) : 1;
        ctx.save(); ctx.translate(0, base2); ctx.scale(1, 1 / sq); ctx.translate(0, -base2 + dy);
        ctx.drawImage(lay, 0, 0); ctx.restore();
        if (pSlice) { ctx.fillStyle = INK; ctx.fillRect(0, sy + sh + 5, shift - 12, 2); ctx.fillRect(0, sy - 7, shift * 0.6, 2); }
      }

      // ---------- ROW 3: "TO" tab + "DREAM" stretched with halftone image ----------
      const r3top = base2 + gap;
      const r3h = H_ - r3top - 6;
      // TO tab: filled block with knocked-out letters, rotated
      const tabW = 104;
      ctx.save();
      const tabH = r3h * H.ease.out(pTo);
      ctx.beginPath(); ctx.rect(0, r3top + r3h - tabH, tabW, tabH); ctx.clip();
      ctx.fillStyle = INK; ctx.fillRect(0, r3top, tabW, r3h);
      ctx.save();
      ctx.translate(tabW / 2 + 2, r3top + 14); ctx.rotate(Math.PI / 2);
      ctx.font = '800 92px "Inter"'; ctx.fillStyle = BG; ctx.textBaseline = 'middle';
      ctx.fillText('TO', 0, 2);
      ctx.restore();
      ctx.font = '700 14px "Space Mono"'; ctx.fillStyle = BG;
      ctx.save(); ctx.translate(20, H_ - 14); ctx.rotate(-Math.PI / 2); ctx.fillText('02:47', 0, 0); ctx.restore();
      ctx.save(); ctx.font = '700 13px "Space Mono"'; ctx.fillStyle = BG; ctx.textBaseline = 'alphabetic';
      ctx.translate(tabW - 16, H_ - 14); ctx.rotate(-Math.PI / 2); ctx.fillText('[VERSE 02]', 0, 0); ctx.restore();
      const chx = tabW / 2, chy = r3top + 150, cs = 9 + kick * 4;
      ctx.strokeStyle = BG; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(chx - cs, chy); ctx.lineTo(chx + cs, chy); ctx.moveTo(chx, chy - cs); ctx.lineTo(chx, chy + cs); ctx.stroke();
      ctx.beginPath(); ctx.arc(chx, chy, cs * 0.6, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      // DREAM: stretched to fill the remaining box
      const dx0 = tabW + 14, dW = W - dx0 + 20, dH = r3h;
      ctx.font = '400 200px "Anton"';
      const mD = ctx.measureText('DREAM');
      const dWnat = mD.actualBoundingBoxLeft + mD.actualBoundingBoxRight, dHnat = mD.actualBoundingBoxAscent;
      const sxD = dW / dWnat, syD = ((dH - 6) / dHnat) * Math.max(0.02, pDr <= 0 ? 0 : H.ease.back(pDr));
      const dTop = r3top + (dH - 6) * (1 - syD / ((dH - 6) / dHnat));
      const mask = H.layer(W, H_), mk = mask.getContext('2d');
      mk.save(); mk.translate(dx0, dTop); mk.scale(sxD, syD);
      mk.font = '400 200px "Anton"'; mk.fillStyle = '#fff'; mk.textBaseline = 'alphabetic';
      mk.fillText('DREAM', mD.actualBoundingBoxLeft, dHnat);
      mk.restore();
      // halftone dreamscape: moon + drifting clouds rendered as rotated dot screen
      const img = H.layer(W, H_), ic = img.getContext('2d');
      const nz = H.makeNoise(31);
      const step = 9, ang = Math.PI / 4, ca = Math.cos(ang), sa = Math.sin(ang);
      ic.fillStyle = INK;
      const moonX = 860, moonY = r3top + dH * 0.42, moonR = 120;
      for (let v = -900; v < 1500; v += step) {
        for (let u = -900; u < 1900; u += step) {
          const x = u * ca - v * sa + 200, y = u * sa + v * ca - 200;
          if (x < dx0 - 10 || x > W + 10 || y < r3top - 10 || y > H_ + 10) continue;
          // image brightness
          const cl = nz.fbm2(x * 0.0035 + t * 0.08, y * 0.009, 4) * 0.5 + 0.5;
          const md = Math.hypot(x - moonX, y - moonY);
          // crescent moon: disc minus offset disc, soft glow around
          const md2 = Math.hypot(x - moonX - 46, y - moonY + 26);
          const disc = md < moonR ? 1 : 0, bite = md2 < moonR * 0.92 ? 1 : 0;
          const glow = Math.max(0, 0.42 - Math.max(0, md - moonR) / 260);
          const cloud = Math.pow(H.clamp(cl * 1.6 - 0.55), 1.3);       // banded drifting clouds
          const sky = 0.06 + 0.22 * H.smooth(r3top, H_, y);              // brighter toward horizon
          let b = disc && !bite ? 1 : Math.max(sky, glow * (1 - bite * 0.7), cloud * 0.9);
          b = H.clamp(b);
          const rad = Math.sqrt(b) * step * 0.62 * H.ease.out(H.clamp(pDots * 1.6 - (1 - b) * 0.6));
          if (rad < 0.5) continue;
          ic.beginPath(); ic.arc(x, y, rad, 0, Math.PI * 2); ic.fill();
        }
      }
      // mask image by DREAM letters
      ic.globalCompositeOperation = 'destination-in'; ic.drawImage(mask, 0, 0);
      if (pDr > 0) ctx.drawImage(img, 0, 0);
      // letter outline so the word holds its shape
      if (pDr > 0) { ctx.save(); ctx.translate(dx0, dTop); ctx.scale(sxD, syD);
      ctx.font = '400 200px "Anton"'; ctx.strokeStyle = INK; ctx.lineWidth = 2.4 / Math.min(sxD, syD);
      ctx.strokeText('DREAM', mD.actualBoundingBoxLeft, dHnat);
      ctx.restore(); }

      ctx.restore(); // camera shake
      // one-frame inverted flash on the LEARNED and DREAM impacts (music-video cut)
      if ((t >= 1.2 && t < 1.2 + 1 / 30) || (t >= 2.82 && t < 2.82 + 1 / 30)) {
        ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H_); ctx.restore();
      }

      // ---------- finish: subtle print/video grain ----------
      H.grain(ctx, W, H_, 0.04, 77 + Math.floor(t * 12));
    },
  });
}
