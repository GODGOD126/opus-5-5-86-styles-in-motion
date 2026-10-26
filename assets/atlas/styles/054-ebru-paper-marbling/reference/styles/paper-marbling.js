{
  // Ebru / suminagashi marbling, simulated FORWARD with the mathematical marbling transforms
  // (Jaffer & Lu):  ink drop   p' = c + (p-c)·sqrt(1 + r²/|p-c|²)
  //                 tine line  p' = p + α·λ/(d+λ)·M        (d = distance to the stylus line)
  //                 comb       = a periodic set of tine lines with alternating direction
  // Every floated colour is a polygon; each later operation moves all earlier vertices, with
  // adaptive re-subdivision so stretched veins stay smooth. Pigment speckle is sampled in the
  // pre-comb coordinates, so it is dragged along the rake like real floated paint.
  const TAU = Math.PI * 2;
  const PAL = {
    indigo: '#1d2a5e', red: '#a6252b', ochre: '#d89c2c', teal: '#21807c', cream: '#efe3c4',
    ink: '#1b1d27', slate: '#3f5470', rose: '#cf6f5e', sky: '#7ea6c4', sand: '#d9bf86', green: '#4f6b3a',
  };

  // ---- transforms (forward) ----
  const T = {
    drop: (o) => (x, y) => { const dx = x - o.x, dy = y - o.y, d2 = dx * dx + dy * dy + 1e-9, f = Math.sqrt(1 + (o.r * o.r) / d2); return [o.x + dx * f, o.y + dy * f]; },
    tine: (o) => (x, y) => { const d = Math.abs((x - o.x) * -o.my + (y - o.y) * o.mx), z = (o.a * o.l) / (d + o.l); return [x + z * o.mx, y + z * o.my]; },
    // periodic comb: tines every S px along one axis, alternating push direction
    comb: (o) => (x, y) => { const u = o.vertical ? x : y; const dv = combShift(u, o); return o.vertical ? [x, y + dv] : [x + dv, y]; },
    wave: (o) => (x, y) => o.vertical ? [x, y + o.A * Math.sin((x / o.L) * TAU + o.ph)] : [x + o.A * Math.sin((y / o.L) * TAU + o.ph), y],
  };
  function combShift(u, o) {
    const j0 = Math.round((u - o.off) / o.S);
    let s = 0;
    for (let j = j0 - 3; j <= j0 + 3; j++) { const d = Math.abs(u - (o.off + j * o.S)); s += ((j & 1) ? -1 : 1) * (o.a * o.l) / (d + o.l); }
    return s;
  }

  function applyOp(polys, f, maxLen) {
    for (const P of polys) {
      if (P.dead) continue;
      const src = P.pts, out = [];
      const n = src.length / 2;
      const tp = new Array(n);
      for (let i = 0; i < n; i++) tp[i] = f(src[i * 2], src[i * 2 + 1]);
      const push = (ax, ay, bx, by, A, B, depth) => {
        // emits A then (recursively) the midpoints needed so that |A'B'| <= maxLen
        const ddx = B[0] - A[0], ddy = B[1] - A[1];
        if (depth < 5 && ddx * ddx + ddy * ddy > maxLen * maxLen) {
          const mx = (ax + bx) / 2, my = (ay + by) / 2, M = f(mx, my);
          push(ax, ay, mx, my, A, M, depth + 1);
          push(mx, my, bx, by, M, B, depth + 1);
        } else out.push(A[0], A[1]);
      };
      // NB: subdivision samples pre-images; we keep transformed coordinates as the new polygon
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        push(src[i * 2], src[i * 2 + 1], src[j * 2], src[j * 2 + 1], tp[i], tp[j], 0);
      }
      P.pts = out;
      // cull polygons that have left the sheet entirely
      let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
      for (let i = 0; i < out.length; i += 2) { const x = out[i], y = out[i + 1]; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; }
      if (minx > 1500 || maxx < -220 || miny > 940 || maxy < -220) P.dead = true;
    }
  }
  function circle(x, y, r) {
    const n = Math.max(48, Math.min(360, Math.round((TAU * r) / 3)));
    const pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; pts.push(x + Math.cos(a) * r, y + Math.sin(a) * r); }
    return pts;
  }


  // =====================================================================================
  // EXPLAINER — the model is the marbling bath. Examples are drops of colour landing on it
  // (ochre = cat, indigo = dog). A new picture is a red probe drop; the model's "guess" is the
  // way its current flow drags the probe. The error is a counter-stroke of the stylus, and the
  // adjustment is a comb pass that puts the pattern in order. Scenes change the marbler's way:
  // the printed sheet is lifted off the bath, revealing the next bath underneath.
  // =====================================================================================
  const PX = (t, a, b) => H.clamp((t - a) / (b - a));
  const INKB = '#2a2018', REDI = '#a6252b';
  let PM_TEX = null, PM_STILL = null, PM_SPK = null;
  function pmTexture(W, H_) {
    if (PM_TEX) return PM_TEX;
    PM_TEX = H.layer(W, H_); const c = PM_TEX.getContext('2d'), img = c.createImageData(W, H_), d = img.data;
    const nz = H.makeNoise(3), nz2 = H.makeNoise(8), cn = H.makeNoise(44), r = H.rng(9);
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const sp = nz.n2(x * 0.08, y * 0.08) * 0.5 + nz2.n2(x * 0.35, y * 0.35) * 0.5;
      const laid = (x % 3 === 0 ? -0.025 : 0) + ((x + 9) % 64 < 1.5 ? -0.03 : 0);
      const cock = cn.fbm2(x * 0.0044, y * 0.0044, 3) * 0.11 + cn.fbm2(x * 0.035 / 8 + 7, y * 0.035 / 8, 3) * 0.035; // broad cockle + the still's finer drying undulation
      const k = H.clamp(0.93 + sp * 0.07 + laid + cock + (r() - 0.5) * 0.04, 0, 1);
      const o = (y * W + x) * 4; d[o] = d[o + 1] = d[o + 2] = 255 * k; d[o + 3] = 255;
    }
    c.putImageData(img, 0, 0); return PM_TEX;
  }
  function pmStill(W, H_) {
    if (PM_STILL) return PM_STILL;
    PM_STILL = H.layer(W, H_); const st = window.STYLES.find((s) => s.id === 'paper-marbling'); H.render(st, PM_STILL, 7.9); return PM_STILL;
  }
  // pigment pooling at a floated drop's rim: the drop's own colour, darker (not a neutral ink outline)
  const RIM = {}, HALO = {};
  const rimOf = (col) => RIM[col] || (RIM[col] = H.rgba(H.hex(col).map((v) => v * 0.66), 0.72));
  const haloOf = (col) => HALO[col] || (HALO[col] = H.rgba(H.mix(col, '#fff6e2', 0.35), 0.38));
  // cockle (the hero's soft-light undulation from the wetted sheet drying), built once per size
  let PM_COCK = null;
  function pmCockle(W, H_) {
    if (PM_COCK && PM_COCK.w === W) return PM_COCK.c;
    const cn = H.makeNoise(44), sw = Math.round(W / 8), sh = Math.round(H_ / 8);
    const lay = H.layer(sw, sh), lc = lay.getContext('2d'), li = lc.createImageData(sw, sh);
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      const v = cn.fbm2(x * 0.035, y * 0.035, 3), o = (y * sw + x) * 4;
      li.data[o] = li.data[o + 1] = li.data[o + 2] = v > 0 ? 255 : 0; li.data[o + 3] = Math.min(255, Math.abs(v) * 110);
    }
    lc.putImageData(li, 0, 0); PM_COCK = { w: W, c: lay }; return lay;
  }
  // pigment granulation: fine dark/light speckle that only lives inside floated colour. Baked into one
  // repeating tile per pigment, so filling a drop with its colour already carries the granulation.
  let PM_GRAIN = null; const PM_PAT = {};
  function pmGrain() {
    if (PM_GRAIN) return PM_GRAIN;
    const S = 512; PM_GRAIN = new Float32Array(S * S);
    const nz = H.makeNoise(17), r = H.rng(23), w = (x, y, f) => nz.n2(x * f, y * f * 0.42) ; // tileable via 4-corner blend
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const fx = x / S, fy = y / S, n = (xx, yy) => w(xx, yy, 0.5) * 0.6 + nz.n2(xx * 0.09 + 40, yy * 0.05) * 0.4;
      const v = n(x, y) * (1 - fx) * (1 - fy) + n(x - S, y) * fx * (1 - fy) + n(x, y - S) * (1 - fx) * fy + n(x - S, y - S) * fx * fy;
      PM_GRAIN[y * S + x] = H.clamp(0.9 + (v * 1.6 + (r() - 0.5) * 0.5) * 0.16, 0, 1.05);
    }
    return PM_GRAIN;
  }
  function pigment(ctx, col) {
    if (PM_PAT[col]) return PM_PAT[col];
    const S = 512, g = pmGrain(), c3 = H.hex(col), cv = H.layer(S, S), c = cv.getContext('2d'), img = c.createImageData(S, S), d = img.data;
    for (let i = 0; i < S * S; i++) { const k = g[i]; d[i * 4] = Math.min(255, c3[0] * k); d[i * 4 + 1] = Math.min(255, c3[1] * k); d[i * 4 + 2] = Math.min(255, c3[2] * k); d[i * 4 + 3] = 255; }
    c.putImageData(img, 0, 0); return (PM_PAT[col] = ctx.createPattern(cv, 'repeat'));
  }
  function renderPolys(ctx, W, H_, polys, bath) {
    ctx.fillStyle = bath; ctx.fillRect(0, 0, W, H_);
    // the bare size is never flat: a broad, faint tonal drift across the bath
    const bg = ctx.createLinearGradient(0, 0, W, H_); bg.addColorStop(0, 'rgba(255,250,236,0.35)'); bg.addColorStop(0.55, 'rgba(255,250,236,0)'); bg.addColorStop(1, 'rgba(150,120,70,0.12)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
    for (const P of polys) {
      if (P.dead) continue; const p = P.pts;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.closePath();
      ctx.fillStyle = pigment(ctx, P.col); ctx.fill();
      if (P.halo) { ctx.save(); ctx.clip(); ctx.strokeStyle = haloOf(P.col); ctx.lineWidth = 6; ctx.stroke(); ctx.restore(); } // gall halo just inside a fresh drop
      ctx.strokeStyle = rimOf(P.col); ctx.lineWidth = 1; ctx.stroke();
    }
  }
  function finish(ctx, W, H_) {
    // soften like the still (floated colour never has a vector edge): a half-pixel resample of itself,
    // visually the hero's blur(0.6px) at a fraction of the cost; then laid paper, fibre and cockle (pmTexture)
    ctx.save(); ctx.globalAlpha = 0.5; ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height, 0.5, 0.5, W, H_); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(pmTexture(W, H_), 0, 0); ctx.restore();
    H.vignette(ctx, W, H_, 0.2, '40,25,10');
  }
  // bookbinder's paper label: cream, double rule, serif type
  function blabel(ctx, text, x, y, o = {}) {
    const size = o.size || 22; ctx.save();
    ctx.font = `${o.italic ? 'italic ' : ''}700 ${size}px "Libre Baskerville"`; try { ctx.letterSpacing = o.ls || '1px'; } catch (e) {}
    const w = ctx.measureText(text).width + size * 1.4, h = size * 2;
    const ox = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2;
    ctx.fillStyle = 'rgba(30,20,10,0.25)'; ctx.fillRect(ox + 3, y - h / 2 + 4, w, h);
    ctx.fillStyle = o.red ? '#f6e6d6' : '#f3ead2'; ctx.fillRect(ox, y - h / 2, w, h);
    ctx.strokeStyle = o.red ? REDI : INKB; ctx.lineWidth = 1.6; ctx.strokeRect(ox + 4, y - h / 2 + 4, w - 8, h - 8); ctx.lineWidth = 0.6; ctx.strokeRect(ox + 7, y - h / 2 + 7, w - 14, h - 14);
    ctx.fillStyle = o.red ? REDI : INKB; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(text, ox + w / 2, y + 1);
    ctx.restore(); return w;
  }
  function dropLabel(ctx, t, t0, text, x, y, o) { if (t < t0) return; const k = H.ease.out(PX(t, t0, t0 + 0.25)); ctx.save(); ctx.globalAlpha = k; blabel(ctx, text, x, y + (1 - k) * -18, o); ctx.restore(); }
  // inked brush arrow (stylus-drawn line with a tapered head)
  function inkArrow(ctx, pts, p, col = INKB, lw = 4) {
    if (p <= 0) return; let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    let left = L * p, end = pts[0], prev = pts[0]; ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && left > 0; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), q = Math.min(1, left / d); prev = pts[i - 1]; end = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * q, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * q]; ctx.lineTo(end[0], end[1]); left -= d; }
    ctx.stroke(); const a = Math.atan2(end[1] - prev[1], end[0] - prev[0]), hd = lw * 4.5;
    ctx.beginPath(); ctx.moveTo(end[0] + Math.cos(a) * lw, end[1] + Math.sin(a) * lw); ctx.lineTo(end[0] - Math.cos(a - 0.45) * hd, end[1] - Math.sin(a - 0.45) * hd); ctx.quadraticCurveTo(end[0] - Math.cos(a) * hd * 0.6, end[1] - Math.sin(a) * hd * 0.6, end[0] - Math.cos(a + 0.45) * hd, end[1] - Math.sin(a + 0.45) * hd); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  const HEAD = 28; // running head: a story label, so >= 28px
  const pmHeader = (ctx) => blabel(ctx, 'How does AI learn?', 24, 42, { size: HEAD, italic: true, align: 'left' });
  const textW = (ctx, text, size, italic) => { ctx.save(); ctx.font = `${italic ? 'italic ' : ''}700 ${size}px "Libre Baskerville"`; try { ctx.letterSpacing = '1px'; } catch (e) {} const w = ctx.measureText(text).width + size * 1.4; ctx.restore(); return w; };
  // shared battal ground (the untrained model): `n` drops, landing from time t0 over dur
  function battal(polys, t, n, t0, dur, ML, halo = false) {
    const r = H.rng(77), cols = [PAL.ochre, PAL.indigo, PAL.sand, PAL.ochre, PAL.indigo, PAL.cream, PAL.sky];
    const landed = [];
    for (let i = 0; i < n; i++) {
      const x = r.range(-40, 1320), y = r.range(-40, 760), rad = r.range(44, 84), kind = r() < 0.5 ? 'cat' : 'dog';
      const col = kind === 'cat' ? (r() < 0.75 ? PAL.ochre : PAL.sand) : (r() < 0.75 ? PAL.indigo : PAL.sky);
      const ti = t0 + dur * Math.pow(i / n, 0.85); if (t < ti) break;
      const g = H.ease.out(PX(t, ti, ti + 0.3));
      applyOp(polys, T.drop({ x, y, r: Math.max(0.5, rad * g) }), ML); polys.push({ pts: circle(x, y, Math.max(0.5, rad * g)), col, halo: halo && t - ti < 0.7 }); // gall halo only while the drop is fresh
      landed.push({ x, y, kind, ti });
    }
    return landed;
  }
  function probe(polys, x, y, ML, g = 1) {
    [PAL.red, PAL.cream, PAL.red, PAL.cream, PAL.red].forEach((col, i) => { const rad = Math.max(0.5, (i === 0 ? 40 : 19) * g); applyOp(polys, T.drop({ x, y, r: rad }), ML); polys.push({ pts: circle(x, y, rad), col, probe: true }); });
  }
  function centroid(polys) { let sx = 0, sy = 0, n = 0; for (const P of polys) if (P.probe) for (let i = 0; i < P.pts.length; i += 2) { sx += P.pts[i]; sy += P.pts[i + 1]; n++; } return [sx / n, sy / n]; }
  function flowX(polys, t) { // horizontal tine through the probe = the model's flow
    return polys;
  }

  // ---------- scenes ----------
  function mHook(ctx, W, H_, t) {
    const z = 1.08 - 0.06 * H.ease.out(PX(t, 0, 2.4));
    ctx.save(); ctx.translate(W / 2, H_ / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H_ / 2); ctx.drawImage(pmStill(W, H_), 0, 0); ctx.restore();
    const k = H.ease.inOut(PX(t, 1.75, 2.3)), pop = H.ease.back(PX(t, 0.15, 0.5));
    const hs = HEAD / 64, hcx = 24 + textW(ctx, 'How does AI learn?', HEAD, true) / 2;
    if (k < 1) { ctx.save(); ctx.translate(640 + (hcx - 640) * k, 360 + (42 - 360) * k); ctx.scale(pop * (1 - (1 - hs) * k), pop * (1 - (1 - hs) * k)); blabel(ctx, 'How does AI learn?', 0, 0, { size: 64, italic: true }); ctx.restore(); }
    else pmHeader(ctx);
  }
  function mData(ctx, W, H_, t) {
    const polys = [], ML = 4;
    const landed = battal(polys, t, 95, 2.5, 3.1, ML, true);
    renderPolys(ctx, W, H_, polys, PAL.cream); finish(ctx, W, H_);
    // the most recent drops carry their labels
    const placed = [];
    landed.slice(-3).forEach((d, i) => {
      let lx = H.clamp(d.x, 80, 1200), ly = H.clamp(d.y - 80, 200, 470);
      for (let pass = 0; pass < 3; pass++) for (const q of placed) if (Math.abs(q[0] - lx) < 60 + 50 && Math.abs(q[1] - ly) < 60) ly = q[1] - 58; // stack above a crowding label
      placed.push([lx, ly]);
      const a = H.clamp(1 - (t - d.ti - 0.5) / 0.4); if (a > 0) { ctx.save(); ctx.globalAlpha = a; blabel(ctx, d.kind, lx, ly, { size: 28 }); ctx.restore(); }
    });
    dropLabel(ctx, t, 2.9, 'the bath = the model', 960, 110, { size: 30 });
    dropLabel(ctx, t, 3.2, 'ochre = cat · indigo = dog', 1000, 650, { size: 28, italic: true });
    if (t > 2.65) {
      const p = PX(t, 2.7, 5.0), n = p >= 1 ? 1e6 : Math.floor(Math.pow(10, 6 * H.ease.inOut(p))) - 1;
      const w = blabel(ctx, Math.round(n).toLocaleString('en-US'), 40, 600, { size: 64, align: 'left' }); blabel(ctx, 'examples', 40 + w + 14, 610, { size: 30, align: 'left', italic: true });
    }
    pmHeader(ctx);
  }
  function mLoop(ctx, W, H_, t) {
    const polys = [], ML = 4;
    battal(polys, 99, 95, 0, 0.01, ML);
    const adj = PX(t, 8.95, 9.45);
    if (adj > 0) applyOp(polys, T.comb({ vertical: true, S: 90, off: 20, a: 60 * H.ease.inOut(adj), l: 22 }), ML); // adjust: the comb orders the bath
    const pg = PX(t, 6.35, 6.6); if (pg > 0) probe(polys, 640, 330, ML, H.ease.out(pg));
    const f1 = H.ease.inOut(PX(t, 6.8, 7.3)), back = H.ease.inOut(PX(t, 8.35, 8.85)), f2 = H.ease.inOut(PX(t, 9.45, 9.85));
    if (f1 > 0) applyOp(polys, T.tine({ x: 0, y: 330, mx: 1, my: 0, a: 300 * f1, l: 40 }), ML);          // guess: flow drags probe toward DOG
    if (back > 0) applyOp(polys, T.tine({ x: 0, y: 330, mx: -1, my: 0, a: 300 * back, l: 40 }), ML);    // error: counter-stroke drags it back
    if (f2 > 0) applyOp(polys, T.tine({ x: 0, y: 330, mx: -1, my: 0, a: 330 * f2, l: 40 }), ML);        // guess again: now flows to CAT
    renderPolys(ctx, W, H_, polys, PAL.cream); finish(ctx, W, H_);
    const right = t >= 9.85, [px, py] = pg > 0 ? centroid(polys) : [640, 330];
    blabel(ctx, '◀ CAT', 30, 330, { size: 36, align: 'left', red: right });
    blabel(ctx, 'DOG ▶', 1250, 330, { size: 36, align: 'right', red: t >= 7.3 && t < 8.85 });
    dropLabel(ctx, t, 6.35, t >= 8.0 ? 'answer: cat' : 'new picture', 640, 450, { size: 28, italic: true, red: t >= 8.0 });
    if (t >= 6.8 && t < 7.3) inkArrow(ctx, [[600, 250], [900, 250]], PX(t, 6.8, 7.2));
    if (t >= 7.3 && !right) dropLabel(ctx, t, 7.3, 'guess: dog?', 1010, 215, { size: 34 });
    if (t >= 7.85 && !right) { const k = H.ease.out(PX(t, 7.85, 8.05)); ctx.save(); ctx.strokeStyle = REDI; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(1150, 330, 140, 70, -0.05, -1.4, -1.4 + 6.4 * k); ctx.stroke(); ctx.restore(); dropLabel(ctx, t, 7.95, 'check: wrong ✗', 1060, 445, { size: 30, red: true }); }
    if (t >= 8.35 && t < 9.45) { inkArrow(ctx, [[960, 395], [600, 395]], PX(t, 8.35, 8.8), REDI, 6); dropLabel(ctx, t, 8.4, 'error: pull back', 700, 520, { size: 28, red: true }); }
    if (t >= 8.95 && t < 10.5) dropLabel(ctx, t, 8.95, 'adjust: comb the bath', 640, 120, { size: 32, red: true });
    if (right) dropLabel(ctx, t, 9.85, 'cat ✓', 300, 220, { size: 44, red: true });
    const words = ['guess', 'check', 'adjust'], act = t < 7.3 ? -1 : t < 7.85 ? 0 : t < 8.35 ? 1 : t < 9.45 ? 2 : Math.floor((t - 9.45) / 0.16) % 3;
    let x = 120; words.forEach((w, i) => { x += blabel(ctx, w, x, 630, { size: 32, align: 'left', red: i === act }) + 12; if (i < 2) { inkArrow(ctx, [[x, 630], [x + 52, 630]], 1, INKB, 4.5); x += 68; } });
    blabel(ctx, '↻ ×1,000,000', x + 6, 630, { size: 28, italic: true, align: 'left' });
    pmHeader(ctx);
  }
  function mProg(ctx, W, H_, t) {
    const polys = [], ML = 4;
    battal(polys, 99, 95, 0, 0.01, ML);
    const p = H.ease.inOut(PX(t, 10.85, 12.3)), rounds = Math.floor(p * 5);
    // each training round is one more, finer comb pass: chaos combs into order
    const combs = [{ vertical: true, S: 90, off: 20, a: 60, l: 22 }, { vertical: false, S: 120, off: 40, a: 28, l: 30 }, { vertical: true, S: 45, off: 10, a: 22, l: 12 }];
    for (let k = 0; k < Math.min(3, rounds); k++) applyOp(polys, T.comb(combs[k]), ML);
    const sub = H.clamp(p * 5 - rounds); if (rounds < 3) applyOp(polys, T.comb({ ...combs[rounds], a: combs[rounds].a * H.ease.inOut(sub) }), ML);
    renderPolys(ctx, W, H_, polys, PAL.cream); finish(ctx, W, H_);
    // card with accuracy + ink chart
    ctx.save(); ctx.fillStyle = 'rgba(30,20,10,0.25)'; ctx.fillRect(84, 124, 520, 470); ctx.fillStyle = '#f3ead2'; ctx.fillRect(80, 120, 520, 470);
    ctx.strokeStyle = INKB; ctx.lineWidth = 1.6; ctx.strokeRect(86, 126, 508, 458); ctx.lineWidth = 0.6; ctx.strokeRect(90, 130, 500, 450); ctx.restore();
    ctx.save(); ctx.font = 'italic 700 36px "Libre Baskerville"'; ctx.fillStyle = INKB; ctx.fillText('Accuracy', 120, 188);
    const v = Math.round(61 + 36 * p), punch = t >= 12.3 ? 1 + 0.12 * Math.exp(-(t - 12.3) * 9) : 1;
    ctx.translate(120, 320); ctx.scale(punch, punch); ctx.font = '700 120px "Libre Baskerville"'; ctx.fillText(v + '%', 0, 0); ctx.restore();
    if (t >= 12.3) { const k = H.ease.out(PX(t, 12.3, 12.55)); ctx.save(); ctx.strokeStyle = REDI; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(300, 278, 205, 85, -0.04, -2.6, -2.6 + 6.5 * k); ctx.stroke(); ctx.restore(); }
    const x0 = 130, y0 = 545, cw = 420, ch = 160, n = 6, pts = [];
    for (let i = 0; i < n; i++) { const acc = 61 + 36 * (1 - Math.exp(-i / 1.6)) / (1 - Math.exp(-(n - 1) / 1.6)); pts.push([x0 + (i / (n - 1)) * cw, y0 - ((acc - 55) / 45) * ch]); }
    ctx.save(); ctx.strokeStyle = INKB; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 - ch - 10); ctx.lineTo(x0, y0); ctx.lineTo(x0 + cw + 10, y0); ctx.stroke(); ctx.restore();
    inkArrow(ctx, pts, PX(t, 10.9, 12.3), REDI, 3.5);
    ctx.save(); ctx.font = 'italic 400 28px "Libre Baskerville"'; ctx.fillStyle = INKB; ctx.fillText('training rounds →', x0, y0 + 32); ctx.restore();
    dropLabel(ctx, t, 10.75, `comb pass ${Math.min(5, rounds + 1)}: chaos → order`, 940, 640, { size: 28, italic: true });
    pmHeader(ctx);
  }
  function mTake(ctx, W, H_, t) {
    ctx.drawImage(pmStill(W, H_), 0, 0);
    const k = H.ease.back(PX(t, 13.25, 13.6));
    ctx.save(); ctx.translate(640, 360); ctx.scale(k, k);
    blabel(ctx, 'More examples', 0, -56, { size: 56, italic: true });
    blabel(ctx, '→ better guesses', 0, 60, { size: 56, italic: true, red: true });
    ctx.restore();
  }
  function explainPM(ctx, W, H_, t) {
    const seq = [[0, mHook], [2.4, mData], [6.0, mLoop], [10.5, mProg], [13.0, mTake]];
    let i = 0; for (let k = 0; k < seq.length; k++) if (t >= seq[k][0]) i = k;
    const t0 = seq[i][0], D = 0.55;
    if (i > 0 && t < t0 + D) {
      // the printed sheet is lifted off the bath, peeling from the left edge
      seq[i][1](ctx, W, H_, t);
      const A = H.layer(W, H_); seq[i - 1][1](A.getContext('2d'), W, H_, t0 - 0.01);
      const lx = -80 + (W + 200) * H.ease.inOut(PX(t, t0, t0 + D)), curl = 90;
      ctx.save(); ctx.fillStyle = 'rgba(20,10,0,0.35)'; ctx.fillRect(lx, 0, 40, H_); ctx.restore(); // shadow of the lifted sheet
      ctx.drawImage(A, lx + curl, 0, W, H_, lx + curl, 0, W, H_);
      const g = ctx.createLinearGradient(lx, 0, lx + curl, 0); g.addColorStop(0, '#d9ccad'); g.addColorStop(0.55, '#f5ecd6'); g.addColorStop(1, '#bfae8a');
      ctx.fillStyle = g; ctx.fillRect(lx, 0, curl, H_); // the paper's back, curling up
    } else seq[i][1](ctx, W, H_, t);
  }

  registerStyle({
    id: 'paper-marbling',
    name: 'Ebru Paper Marbling',
    category: 'Generative & Type',
    description: 'Turkish ebru on laid paper: a battal stone ground of floated pigments raked into gel-git chevrons and combed, then suminagashi ring-drops pulled by a stylus into tulips — built with the exact drop and tine transforms.',
    motion: 'Colour drops rain onto the size and bloom, shoving earlier drops into veins; the rake drags the stone into gel-git flames; ring after ring is dropped at one point; then the stylus pulls the rings into a tulip, and a wet sheen glides over the finished bath.',
    fonts: ['700 22px "Libre Baskerville"', 'italic 700 22px "Libre Baskerville"', 'italic 400 15px "Libre Baskerville"'],
    duration: 8,
    frameT: 7.9,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'The bath is the model: examples land as colour drops, a new picture is a red probe drop that the flow drags toward its guess, the error is a stylus counter-stroke and the adjustment a comb pass that puts the pattern in order; scenes change by lifting the printed sheet off the bath, labels are bookbinder paper labels and arrows are inked stylus strokes.',
    explainer(ctx, W, H_, t) { explainPM(ctx, W, H_, t); },
    // Sound: the marbling bath. Colour drops land with small low water plops (pitch from drop size, pan from position,
    // throttled), the stylus and its counter-stroke are soft watery drags across the size, comb passes are a fuller
    // swish with the tines riffling through, scene changes are the wet sheet peeled off the bath, and the bookbinder
    // labels set down with a soft paper tap. A quiet pad sits under it. Timings mirror explainPM / mHook..mTake above.
    explainerSound(k) {
      const D = 14.5, E = H.ease;
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // a colour drop meeting the size: short low bubble plop (stays under ~1 kHz) with a soft body
      const plop = (t, f, g, p) => { k.tone(t, { f: [[0, f], [0.045, f * 2.1]], dur: 0.075, gain: 0.13 * g, a: 0.002, pan: p }); k.tone(t, { f: [[0, 140], [0.06, 90]], dur: 0.08, gain: 0.1 * g, pan: p }); k.noise(t, { dur: 0.03, filter: 'lowpass', f: 700, gain: 0.08 * g, a: 0.001, pan: p }); };
      // label set down on the bench
      const label = (t0, p, g = 1) => { const t = t0 + 0.06; k.withMinor(() => { k.noise(t, { dur: 0.05, filter: 'bandpass', f: 1000, q: 0.7, gain: 0.12 * g, a: 0.003, pan: p }); k.tone(t, { f: 150, dur: 0.05, gain: 0.07 * g, pan: p }); }); };
      // stylus dragged through the bath from pan a to b over dur
      const drag = (t, dur, a, b, g = 1) => {
        const steps = 6; for (let i = 0; i < steps; i++) { const u = i / steps; k.noise(t + u * dur, { dur: dur / steps + 0.08, color: 'pink', filter: 'bandpass', f: 380 + 380 * Math.sin(Math.PI * (u + 0.08)), q: 1.6, gain: 0.13 * g * Math.sin(Math.PI * (u + 0.1)), a: 0.04, pan: a + (b - a) * u }); }
        k.tone(t + dur * 0.3, { f: [[0, 220], [0.05, 420]], dur: 0.07, gain: 0.05 * g, pan: a + (b - a) * 0.3, minor: true });
        k.tone(t + dur * 0.7, { f: [[0, 260], [0.05, 500]], dur: 0.07, gain: 0.04 * g, pan: a + (b - a) * 0.7, minor: true });
      };
      // comb pass: a swish with the tines riffling through the size
      const comb = (t, dur, g = 1) => {
        k.noise(t, { dur: dur + 0.1, color: 'pink', filter: 'lowpass', f: [[0, 500], [dur * 0.5, 1100], [dur + 0.1, 400]], gain: 0.13 * g, a: dur * 0.35 });
        const r = H.rng(Math.round(t * 100)); k.withMinor(() => { for (let x = 0.03; x < dur; x += 0.045 + r() * 0.03) k.noise(t + x, { dur: 0.03, filter: 'bandpass', f: 600 + r() * 500, q: 2, gain: 0.07 * g * Math.sin(Math.PI * x / dur), a: 0.008, pan: (x / dur - 0.5) * 0.8 }); });
      };
      // wet sheet peeled off the bath, left edge first (D = 0.55, inOut)
      const peel = (t0) => {
        const r = H.rng(Math.round(t0 * 10));
        k.noise(t0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.3, 1200], [0.6, 600]], q: 0.9, gain: 0.12, a: 0.25 });
        k.withMinor(() => { for (let x = 0.04; x < 0.55; x += 0.025 + r() * 0.03) { const u = x / 0.55; k.noise(t0 + x, { dur: 0.025, filter: 'bandpass', f: 700 + r() * 800, q: 1.2, gain: 0.1 * Math.sin(Math.PI * u) + 0.02, a: 0.003, pan: -0.7 + 1.4 * E.inOut(u) }); } });
        k.noise(t0 + 0.5, { dur: 0.12, color: 'brown', filter: 'lowpass', f: 300, gain: 0.12, a: 0.01 }); // last of it lets go of the size
      };
      const busy = []; // drop times: counter clicks step around them so neither masks the other
      const counter = (t0, t1, ease, steps, rate, p) => { let last = -1, prev = 0;
        for (let t = t0; t <= t1; t += 0.002) { const s = Math.floor(ease(H.clamp((t - t0) / (t1 - t0))) * steps); if (s !== prev && t - last >= 1 / rate && !busy.some((b) => t > b - 0.02 && t < b + 0.07)) { k.play('tock', t, { f: 700, gain: 0.38, pan: p, minor: true }); last = t; } prev = s; } };

      k.bed('room', 0, D, { gain: 0.3 });
      k.music('pad', 0, D, { bpm: 64, gain: 0.35, chords: [['D3', 'A3', 'C4', 'F4'], ['G2', 'D3', 'B3', 'F4'], ['C3', 'G3', 'C4', 'E4'], ['A2', 'E3', 'A3', 'C4']] });

      // ---- hook: title label pops (back 0.15-0.5), slides to the corner (1.75-2.3)
      label(when(0.15, 0.5, E.back, 1) - 0.06, 0, 1.6);
      k.noise(1.75, { dur: 0.55, color: 'pink', filter: 'lowpass', f: [[0, 600], [0.55, 280]], gain: 0.028, a: 0.2, minor: true });

      // ---- data: peel, then 95 drops at ti = 2.5 + 3.1 (i/95)^0.85 (same seeded draws as battal), labels, counter
      peel(2.4);
      { const r = H.rng(77); let last = -1;
        for (let i = 0; i < 95; i++) {
          const x = r.range(-40, 1320); r.range(-40, 760); const rad = r.range(44, 84); r(); r();
          const ti = 2.5 + 3.1 * Math.pow(i / 95, 0.85);
          if (ti - last < (i < 4 ? 0.1 : 0.16)) continue; last = ti; busy.push(ti);
          k.withMinor(() => plop(ti, 520 - rad * 3, i < 4 ? 1.2 : 0.8, pan(x)));
        } }
      label(2.9, 0.5); label(3.2, 0.55);
      counter(2.72, 4.98, E.inOut, 30, 8, -0.6);
      label(4.94, -0.6, 1.5); k.tone(5.0, { f: 'D3', dur: 0.7, gain: 0.1, a: 0.01, verb: 0.3, pan: -0.5 }); // 1,000,000 lands

      // ---- loop: peel, probe drop, guess drag, wrong, counter-stroke, comb, guess again, cat ✓
      peel(6.0);
      plop(6.35, 300, 1.4, 0); plop(6.42, 380, 0.7, 0); plop(6.5, 420, 0.5, 0); // the red ring drops
      label(6.35, 0);
      drag(6.8, 0.5, -0.1, 0.6); // the flow pulls the probe toward DOG
      label(7.3, 0.5);
      k.play('stroke', 7.85, { material: 'brush', dur: 0.2, gain: 1.4, pan: pan(1150), minor: true }); // red ring round DOG
      label(7.95, 0.5, 1.3);
      k.play('tock', 7.97, { f: 300, gain: 0.7, pan: pan(1100) }); k.play('tock', 8.13, { f: 225, gain: 0.7, pan: pan(1100) }); // check: wrong
      k.play('thud', 7.97, { f: 100, gain: 0.45, pan: pan(1100) });
      drag(8.35, 0.5, 0.6, -0.1, 1.1); // counter-stroke pulls it back
      label(8.4, 0.1);
      label(8.95, 0);
      comb(8.95, 0.5, 0.75); // adjust: the comb orders the bath
      drag(9.45, 0.4, 0, -0.6); // now the flow pulls it to CAT
      label(9.85, -0.4, 1.3);
      ['G4', 'D5'].forEach((n, i) => k.play('ding', 9.88 + i * 0.09, { f: n, gain: 0.5, pan: -0.4 })); // cat ✓

      // ---- progress: peel, comb passes (rounds = floor(5 inOut(p))), red ink chart, counter, 97%
      peel(10.5);
      label(10.75, 0.4);
      for (let r = 0; r < 3; r++) { const a = when(10.85, 12.3, E.inOut, r / 5 + 1e-4), b = when(10.85, 12.3, E.inOut, (r + 1) / 5); comb(a, b - a, 0.6 - r * 0.12); busy.push(a + (b - a) / 2); }
      k.play('stroke', 10.9, { material: 'brush', dur: 1.4, gain: 0.35, pan: -0.4, minor: true });
      counter(10.86, 12.28, E.inOut, 36, 8, -0.5);
      k.play('impact', 12.3, { gain: 1.0, pan: -0.4 });
      plop(12.3, 180, 2.2, -0.3);
      ['D3', 'A3', 'F#4', 'A4'].forEach((n, i) => k.tone(12.32 + i * 0.03, { f: n, type: 'triangle', dur: 1.3, gain: 0.07, a: 0.01, verb: 0.35, filter: 'lowpass', f2: 1800, pan: (i - 1.5) * 0.25 })); // the 97% bloom
      k.play('stroke', 12.32, { material: 'brush', dur: 0.24, gain: 0.8, pan: -0.4, minor: true }); // red ring

      // ---- takeaway: peel back to the finished sheet, labels pop, resolve
      peel(13.0);
      const tk = when(13.25, 13.6, E.back, 1);
      label(tk - 0.06, 0, 1.6);
      ['G2', 'D3', 'B3', 'D4', 'G4'].forEach((n, i) => k.tone(tk + 0.05 + i * 0.05, { f: n, type: 'triangle', dur: 1.2, gain: 0.07, a: 0.01, verb: 0.35, filter: 'lowpass', f2: 1800, pan: (i - 2) * 0.2 }));
    },
    draw(ctx, W, H_, t) {
      const r = H.rng(2024);
      const polys = [];
      const ML = 3.2;
      const drop = (x, y, rad, col) => {
        applyOp(polys, T.drop({ x, y, r: rad }), ML);
        polys.push({ pts: circle(x, y, rad), col });
      };
      // a drop lands at time ti and blooms outward (radius eases to full) — later drops wait
      const land = (ti, x, y, rad, col, dur = 0.3) => {
        if (t < ti) return;
        const g = H.ease.out(H.clamp((t - ti) / dur));
        drop(x, y, Math.max(0.5, rad * g), col);
      };
      const P = (a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
      const op = (k, f) => { if (k > 1e-4) applyOp(polys, f, ML); };
      // 1) battal ground: rows of drops sprinkled from the brush
      const ground = ['indigo', 'sand', 'sky', 'indigo', 'cream', 'teal', 'indigo', 'slate', 'sky', 'indigo', 'sand', 'ochre'];
      for (let i = 0; i < 270; i++) {
        land(0.05 + 2.1 * Math.pow(i / 270, 0.9), r.range(-80, W + 80), r.range(-80, H_ + 80), r.range(28, 64), PAL[ground[i % ground.length]]);
      }
      // fine 'eyes' sprinkled into the stone before raking (become streaks & veins)
      for (let i = 0; i < 160; i++) land(2.15 + 0.4 * (i / 160), r.range(-40, W + 40), r.range(-40, H_ + 40), r.range(3, 11), r.chance(0.55) ? PAL.cream : r.chance(0.5) ? PAL.ochre : PAL.ink, 0.15);
      // 2) gel-git: coarse alternating rake top<->bottom, then a wave, then the fine comb (tarak)
      const ph = 0.36;
      const rake = P(2.6, 3.7), wv = P(3.2, 4.0);
      op(rake, T.comb({ vertical: true, S: 80, off: 20 + ph * 30, a: 70 * rake, l: 22 }));
      op(wv, T.wave({ vertical: false, A: 18 * wv, L: 260, ph: 0.8 + ph }));
      
      // 3) sprinkle of small dark drops (opens tiny eyes in the ground)
      for (let i = 0; i < 40; i++) land(4.0 + 0.35 * (i / 40), r.range(0, W), r.range(0, H_), r.range(4, 9), r.chance(0.5) ? PAL.cream : PAL.ink, 0.12);
      // 4) focal tulip: concentric suminagashi rings dropped at one point
      const fx = 640, fy = 250;
      const rings = ['ochre', 'red', 'cream', 'red', 'cream', 'ochre', 'cream', 'red', 'ink', 'cream', 'red', 'cream', 'teal', 'cream', 'red', 'ochre', 'cream', 'red', 'cream', 'ink', 'cream'];
      rings.forEach((c, i) => land(4.35 + i * 0.045, fx, fy, i === 0 ? 34 : 24, PAL[c], 0.12));
      // side buds
      [[330, 420], [950, 420]].forEach(([bx, by], k) => {
        ['red', 'cream', 'ochre', 'cream', 'red', 'cream', 'ink', 'cream', 'red'].forEach((c, i) => land(4.6 + k * 0.08 + i * 0.05, bx, by, i === 0 ? 20 : 15, PAL[c], 0.12));
      });
      // stem + leaves: a column of small green drops and two leaf drops
      for (let y = 470; y < 700; y += 24) land(5.2 + (y - 470) / 230 * 0.25, fx + Math.sin(y * 0.02) * 4, y, 9, PAL.green, 0.12);
      land(5.45, fx - 62, 560, 26, PAL.green, 0.2); land(5.5, fx + 62, 600, 24, PAL.green, 0.2);
      // 5) stylus: pull through each flower to form the tulip; stem and leaves pulled too
      const p0 = P(5.6, 6.4), p1 = P(5.9, 6.5), p2 = P(6.05, 6.6), p3 = P(6.3, 6.8), swl = P(6.4, 7.0);
      op(p0, T.tine({ x: fx, y: 0, mx: 0, my: 1, a: 260 * p0, l: 16 }));
      op(p1, T.tine({ x: 330, y: 0, mx: 0, my: -1, a: 120 * p1, l: 10 }));
      op(p2, T.tine({ x: 950, y: 0, mx: 0, my: -1, a: 120 * p2, l: 10 }));
      op(p3, T.tine({ x: fx - 62, y: 560, mx: -0.6, my: -0.8, a: 70 * p3, l: 12 }));
      op(p3, T.tine({ x: fx + 62, y: 600, mx: 0.6, my: -0.8, a: 70 * p3, l: 12 }));
      // a slight lateral swirl as the sheet is laid (keeps it from looking rigid)
      op(swl, T.wave({ vertical: true, A: 5 * swl, L: 420, ph: 1.7 }));

      // ---------- render ----------
      ctx.fillStyle = PAL.sand; ctx.fillRect(0, 0, W, H_);
      for (const P of polys) {
        if (P.dead) continue;
        const p = P.pts;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]);
        for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
        ctx.closePath();
        ctx.fillStyle = P.col; ctx.fill();
        // pigment concentrates at the rim of each floated drop: its own colour, darker
        ctx.strokeStyle = rimOf(P.col); ctx.lineWidth = 1; ctx.stroke();
      }

      ctx.save(); ctx.filter = 'blur(0.6px)'; ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, W, H_); ctx.restore();
      // ---------- flow-dragged pigment speckle + paper ----------
      // The rake is a vertical comb, so its inverse shift depends on x only: one combShift per column, and the
      // speckle noise is looked up from a cached pre-comb field (same formula as sampling it per pixel).
      const SPM = 260;
      if (!PM_SPK || PM_SPK.W !== W) {
        const nz = H.makeNoise(3), nz2 = H.makeNoise(8), rr = H.rng(9), RH = H_ + SPM * 2;
        const sp = new Float32Array(W * RH), lr = new Float32Array(W * H_);
        for (let y = 0; y < RH; y++) for (let x = 0; x < W; x++) { const py = y - SPM; sp[y * W + x] = (nz.n2(x * 0.08, py * 0.08) * 0.55 + nz2.n2(x * 0.35, py * 0.35) * 0.45) * 0.12; }
        for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) lr[y * W + x] = (x % 3 === 0 ? -0.025 : 0) + ((x + 9) % 64 < 1.5 ? -0.03 : 0) + (rr() - 0.5) * 0.04; // laid lines, fibre tooth
        PM_SPK = { W, sp, lr };
      }
      const img = ctx.getImageData(0, 0, W, H_), d = img.data;
      const combA = { vertical: true, S: 80, off: 20 + ph * 30, a: 70 * rake, l: 22 };
      const shiftX = new Int32Array(W);
      for (let x = 0; x < W; x++) shiftX[x] = Math.max(-SPM, Math.min(SPM, Math.round(-combShift(x, combA))));
      const { sp, lr } = PM_SPK;
      for (let y = 0; y < H_; y++) {
        for (let x = 0; x < W; x++) {
          const k = 1 + sp[(y + shiftX[x] + SPM) * W + x] + lr[y * W + x];
          const o = (y * W + x) * 4;
          d[o] *= k; d[o + 1] *= k; d[o + 2] *= k;
        }
      }
      ctx.putImageData(img, 0, 0);
      // cockle: broad soft light/dark undulation from the wetted sheet drying
      ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(pmCockle(W, H_), 0, 0, W, H_); ctx.restore();
      // wet sheen gliding across the bath once the pattern is finished
      const gs = H.clamp((t - 6.7) / 1.3);
      if (gs > 0) {
        const gx = -400 + 2100 * H.ease.inOut(gs);
        const lg = ctx.createLinearGradient(gx - 260, 0, gx + 260, 200);
        lg.addColorStop(0, 'rgba(255,250,235,0)'); lg.addColorStop(0.5, 'rgba(255,250,235,0.13)'); lg.addColorStop(1, 'rgba(255,250,235,0)');
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H_); ctx.restore();
      }
      H.vignette(ctx, W, H_, 0.2, '40,25,10');
    },
  });
}
