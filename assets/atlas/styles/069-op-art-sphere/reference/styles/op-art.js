{
  // Op Art — Vasarely "Vega"-style warped checkerboard bulging into a sphere, with Riley-like
  // undulating rows and column compression. Rendered per-pixel with analytic anti-aliasing.
  const S = 40;            // base cell size (px)


  // =====================================================================================
  // EXPLAINER — the model is the Vasarely lens. Untrained, its grid is melted noise; every
  // correction (an error ripple travelling back through the field) combs it toward the clean
  // optical sphere. Scenes change with a Riley fold: the picture pinches into crowded columns
  // and unfolds as the next one.
  // =====================================================================================
  const OX = (t, a, b) => H.clamp((t - a) / (b - a));
  const IVc = '#f0ebdd', BKc = '#141315', RDc = '#d02622';
  let OPTEX = null;
  function opTexture(W, H_) {
    if (OPTEX) return OPTEX;
    const nz = H.makeNoise(11), r = H.rng(5), T = new Float32Array(W * H_);
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const wx = Math.sin(x * 1.9) * 0.5 + 0.5, wy = Math.sin(y * 1.9) * 0.5 + 0.5;
      const weave = ((x >> 1) + (y >> 1)) & 1 ? wx : wy;
      const brush = nz.n2(x * 0.004, y * 0.03) * 0.5 + nz.n2(x * 0.05, y * 0.002) * 0.5;
      T[y * W + x] = (weave - 0.5) * 0.04 + brush * 0.025 + (r() - 0.5) * 0.03;
    }
    return (OPTEX = T);
  }
  // the same canvas weave as a drawable overlay (white/black at |tex| alpha ~ multiply by 1+tex), for flat slabs and bands
  let OPWEAVE = null;
  function opWeave(W, H_) {
    if (OPWEAVE && OPWEAVE.width === W && OPWEAVE.height === H_) return OPWEAVE;
    const tex = opTexture(W, H_), c = H.layer(W, H_), x = c.getContext('2d'), img = x.createImageData(W, H_), d = img.data;
    for (let i = 0; i < W * H_; i++) { const v = tex[i] * 1.6, o = i * 4; d[o] = d[o + 1] = d[o + 2] = v > 0 ? 255 : 0; d[o + 3] = Math.min(255, Math.abs(v) * 255); }
    x.putImageData(img, 0, 0); return (OPWEAVE = c);
  }
  const weaveOver = (c, x, y, w, h) => { const wv = OPWEAVE; if (!wv || w <= 0 || h <= 0) return; const sx = H.clamp(Math.round(Math.abs(x)) % 600, 0, wv.width - 1), sy = H.clamp(Math.round(Math.abs(y)) % 300, 0, wv.height - 1); const sw = Math.min(w, wv.width - sx), sh = Math.min(h, wv.height - sy); c.drawImage(wv, sx, sy, sw, sh, x, y, w, h); };
  // P: {cx, cy, R, lens, fold, chaos, red, rip:{r, amp}, t}
  function opField(ctx, W, H_, P) {
    const img = ctx.createImageData(W, H_), d = img.data, tex = opTexture(W, H_);
    const GW = W + 1, GH = H_ + 1, G = new Float32Array(GW * GH), CU = new Float32Array(GW * GH), CV = new Float32Array(GW * GH);
    const PI = Math.PI, S = 40, R2 = P.R * P.R, A0 = 1 - 0.58 * P.lens, tau = P.t;
    const foldU = (x) => P.fold * (58 * Math.sin((x / W) * PI * 2.5 + 0.6 + tau * 0.25) - 9 * Math.sin((x / W) * PI * 6 + tau * 0.4));
    const ux = P.cx + foldU(P.cx);
    for (let y = 0; y < GH; y++) {
      const yy = (y - P.cy) / 360;
      for (let x = 0; x < GW; x++) {
        let u = x + foldU(x);
        let v = P.cy + (y - P.cy) * (1 + 0.42 * P.fold * yy * yy) + P.fold * 8 * Math.sin((y / H_) * PI * 2 + tau * 0.3);
        const dx = x - P.cx, dy = y - P.cy, r2 = dx * dx + dy * dy;
        if (P.rip && P.rip.amp > 0) { // error ripple: a radial ring that displaces the grid
          const dd = Math.sqrt(r2) + 1e-3, q = (dd - P.rip.r) / 38, w = P.rip.amp * Math.exp(-q * q) * Math.sin(q * 3.2);
          u += (dx / dd) * w; v += (dy / dd) * w;
        }
        if (r2 < R2) {
          const rho = Math.sqrt(r2) / P.R, k = A0 + (1 - A0) * rho * rho, blend = 1 - rho * rho;
          u = u * (1 - blend) + (ux + dx) * blend;
          u = ux + (u - ux) * k; v = P.cy + (v - P.cy) * k;
          if (P.chaos > 0) { // untrained: the lens grid is twisted and rippled (still hard-edged checks, just disordered geometry)
            const th = Math.atan2(dy, dx), fall = 1 - rho * rho;
            // smooth swirl (angle depends on radius) + a 3-fold wobble that vanishes at the centre and rim (no pinch points)
            const ang = P.chaos * (1.15 * Math.sin(Math.PI * rho) * Math.sin(tau * 0.5 + 1.1) + 1.1 * rho * fall * Math.sin(3 * th + tau * 0.9));
            const rr = P.chaos * P.R * 0.07 * Math.sin(rho * 9 - tau * 1.3) * fall * rho;
            const ou = u - ux, ov = v - P.cy, ca = Math.cos(ang), sa = Math.sin(ang), rl = Math.hypot(ou, ov) + 1e-3;
            u = ux + ou * ca - ov * sa + (ou / rl) * rr; v = P.cy + ou * sa + ov * ca + (ov / rl) * rr;
          }
        }
        const i = y * GW + x;
        G[i] = Math.sin((PI * (u - P.cx)) / S) * Math.sin((PI * (v - P.cy)) / S);
        CU[i] = Math.floor((u - P.cx) / S); CV[i] = Math.floor((v - P.cy) / S);
      }
    }
    const IV = [240, 235, 221], BK = [20, 19, 21], RD = [208, 38, 34];
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const i = y * GW + x, g = G[i];
      const gx = G[i + 1] - g, gy = G[i + GW] - g, gm = Math.sqrt(gx * gx + gy * gy) + 1e-5;
      let a = 0.5 + (g / gm) * 0.9; a = a < 0 ? 0 : a > 1 ? 1 : a;
      let L = IV;
      const dx = x - P.cx, dy = y - P.cy;
      if (dx * dx + dy * dy < R2 && P.red > 0) {
        let j = i;
        if (g <= 0) { if (G[i + 1] > 0) j = i + 1; else if (G[i + GW] > 0) j = i + GW; else if (x > 0 && G[i - 1] > 0) j = i - 1; else if (y > 0 && G[i - GW] > 0) j = i - GW; }
        const cr = Math.hypot((CU[j] + 0.5) * S, (CV[j] + 0.5) * S) / (P.R * 0.42);
        if (cr < P.red) L = RD;
      }
      const o = (y * W + x) * 4, k = 1 + tex[y * W + x];
      d[o] = (BK[0] + (L[0] - BK[0]) * a) * k; d[o + 1] = (BK[1] + (L[1] - BK[1]) * a) * k; d[o + 2] = (BK[2] + (L[2] - BK[2]) * a) * k; d[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    opWeave(W, H_);
  }
  // hard-edged label: black slab, ivory type, red keyline (or red slab)
  function oLabel(c, text, x, y, o = {}) {
    const sz = o.size || 20, f = o.big ? `400 ${sz}px "Archivo Black"` : `700 ${sz}px "Space Grotesk"`;
    c.save(); c.font = f; c.textBaseline = 'middle'; try { c.letterSpacing = o.big ? '1px' : '2px'; } catch (e) {}
    const w = c.measureText(text).width + sz * 1.1, h = sz * 1.75;
    const ox = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    c.fillStyle = o.red ? RDc : o.inv ? IVc : BKc; c.fillRect(ox, y - h / 2, w, h);
    if (!o.red) { c.fillStyle = RDc; c.fillRect(ox, y + h / 2, w, Math.max(3, sz * 0.16)); }
    weaveOver(c, ox, y - h / 2, w, h + (o.red ? 0 : Math.max(3, sz * 0.16)));
    if (o.inv) { c.strokeStyle = BKc; c.lineWidth = 3; c.strokeRect(ox, y - h / 2, w, h); }
    c.fillStyle = o.inv ? BKc : IVc;
    if (o.lead && text.startsWith('→ ')) { // hard-edged arrow in the type's own weight instead of the thin fallback glyph
      const lw0 = c.measureText('→ ').width, aw = lw0 - sz * 0.32, x0 = ox + sz * 0.55, sw = sz * 0.2;
      c.beginPath(); c.moveTo(x0, y - sw / 2); c.lineTo(x0 + aw - sz * 0.42, y - sw / 2); c.lineTo(x0 + aw - sz * 0.42, y - sz * 0.32); c.lineTo(x0 + aw, y); c.lineTo(x0 + aw - sz * 0.42, y + sz * 0.32); c.lineTo(x0 + aw - sz * 0.42, y + sw / 2); c.lineTo(x0, y + sw / 2); c.closePath(); c.fill();
      c.fillText(text.slice(2), x0 + lw0, y + 1);
    } else c.fillText(text, ox + sz * 0.55, y + 1);
    c.restore(); return w;
  }
  function oArrow(c, x0, y0, x1, y1, p, lw = 8) {
    if (p <= 0) return; const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p, a = Math.atan2(y1 - y0, x1 - x0), hd = lw * 3;
    c.save();
    for (const [col, ex] of [[IVc, 6], [RDc, 0]]) {
      c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw + ex; c.lineJoin = 'miter';
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x - Math.cos(a) * hd * 0.8, y - Math.sin(a) * hd * 0.8); c.stroke();
      c.beginPath(); c.moveTo(x + Math.cos(a) * ex * 0.6, y + Math.sin(a) * ex * 0.6); c.lineTo(x - Math.cos(a - 0.5) * (hd + ex), y - Math.sin(a - 0.5) * (hd + ex)); c.lineTo(x - Math.cos(a + 0.5) * (hd + ex), y - Math.sin(a + 0.5) * (hd + ex)); c.closePath(); c.fill();
    }
    c.restore();
  }
  function oPet(c, kind, x, y, s) {
    c.save(); c.fillStyle = IVc; c.fillRect(x, y, s, s); weaveOver(c, x, y, s, s); c.strokeStyle = BKc; c.lineWidth = Math.max(3, s * 0.035); c.strokeRect(x, y, s, s);
    const cx = x + s / 2, cy = y + s / 2; c.fillStyle = BKc;
    c.beginPath(); c.arc(cx, cy + s * 0.08, s * 0.28, 0, Math.PI * 2); c.fill();
    if (kind === 'cat') for (const k of [-1, 1]) { c.beginPath(); c.moveTo(cx + k * s * 0.06, cy - s * 0.1); c.lineTo(cx + k * s * 0.28, cy - s * 0.34); c.lineTo(cx + k * s * 0.28, cy); c.fill(); }
    else { for (const k of [-1, 1]) { c.beginPath(); c.ellipse(cx + k * s * 0.29, cy + s * 0.08, s * 0.09, s * 0.21, k * 0.3, 0, Math.PI * 2); c.fill(); } }
    c.fillStyle = IVc; for (const k of [-1, 1]) c.fillRect(cx + k * s * 0.11 - s * 0.04, cy, s * 0.08, s * 0.08);
    c.restore();
  }
  function band(c, W, y, h) { c.fillStyle = IVc; c.fillRect(0, y, W, h); weaveOver(c, 0, y, W, h); c.fillStyle = BKc; c.fillRect(0, y, W, 5); c.fillRect(0, y + h - 5, W, 5); }
  const oHeader = (c) => oLabel(c, 'HOW DOES AI LEARN?', 22, 32, { size: 28, big: true });
  const fmtN = (n) => Math.round(n).toLocaleString('en-US');

  // scene field params + overlays
  const OS = {
    hook: { P: (t) => ({ cx: 740, cy: 360, R: 268 + 6 * Math.sin(t * 2), lens: 1, fold: 1, chaos: 0, red: 1.183, t }),
      O(c, W, H_, t) {
        const k = H.ease.inOut(OX(t, 1.7, 2.3)), pop = H.ease.back(OX(t, 0.1, 0.45));
        if (k < 1) {
          c.save(); c.font = '400 52px "Archivo Black"'; try { c.letterSpacing = '1px'; } catch (e) {} const w0 = c.measureText('HOW DOES AI LEARN?').width + 57; c.restore();
          const SC = 28 / 52, sc = 1 - (1 - SC) * k, ex = 22 + (w0 * SC) / 2;
          c.save(); c.translate(640 + (ex - 640) * k, 360 + (32 - 360) * k); c.scale(pop * sc, pop * sc); oLabel(c, 'HOW DOES AI LEARN?', 0, 0, { size: 52, big: true, align: 'center' }); c.restore();
        }
        else oHeader(c);
      } },
    data: { P: (t) => ({ cx: 1010, cy: 330, R: 205, lens: 1, fold: 0.8, chaos: 1, red: 0.25 + 0.3 * OX(t, 2.5, 6), t }),
      O(c, W, H_, t) {
        oHeader(c);
        const rows = [170, 300, 430];
        rows.forEach((y, i) => oArrow(c, 30, y + 40, 770, y + 40, H.ease.out(OX(t, 2.55 + i * 0.07, 2.95 + i * 0.07)), 6));
        const rr = H.rng(9), K = 36;
        for (let k = 0; k < K; k++) {
          const kind = rr() < 0.5 ? 'cat' : 'dog', ts = 2.6 + 3.1 * Math.pow(k / K, 0.8);
          if (t < ts) continue;
          let x = -90 + (t - ts) * (520 + k * 16); const y = rows[k % 3];
          let s = 80; if (x > 760) { const q = H.clamp((x - 760) / 160); s = 80 * (1 - q); x = 760 + (x - 760) * 0.6; }
          if (s < 3) continue;
          oPet(c, kind, x, y + (80 - s) / 2, s);
          if (s > 60) oLabel(c, kind, x + s / 2, y + s + 26, { size: 28, align: 'center' });
        }
        oLabel(c, 'MODEL', 1010, 92 + (1 - H.ease.back(OX(t, 2.7, 3.0))) * -60, { size: 32, big: true, align: 'center', red: true });
        band(c, W, 600, 100);
        if (t >= 2.7) {
          const p = OX(t, 2.75, 5.0), n = p >= 1 ? 1e6 : Math.floor(Math.pow(10, 6 * H.ease.inOut(p))) - 1;
          c.save(); c.font = '400 72px "Archivo Black"'; c.textBaseline = 'middle'; c.fillStyle = BKc; c.fillText(fmtN(n), 34, 654);
          const w = c.measureText(fmtN(n)).width; c.restore();
          oLabel(c, 'EXAMPLES', 34 + w + 22, 650, { size: 30, red: true });
        }
      } },
    loop: { P: (t) => {
        const adj = H.ease.inOut(OX(t, 8.9, 9.4));
        return { cx: 640, cy: 300, R: 190, lens: 1, fold: 0.6, chaos: 0.9 - 0.55 * adj, red: 0.55 + 0.35 * adj, t,
          rip: t > 8.35 && t < 9.05 ? { r: 620 - 640 * OX(t, 8.35, 9.0), amp: 22 * Math.sin(Math.PI * OX(t, 8.35, 9.05)) } : null };
      },
      O(c, W, H_, t) {
        oHeader(c);
        oPet(c, 'cat', 60, 225, 150);
        oLabel(c, t >= 8.0 ? 'ANSWER: CAT' : 'NEW PICTURE', 135, 414, { size: 28, align: 'center', red: t >= 8.0 });
        oArrow(c, 222, 300, 436, 300, H.ease.out(OX(t, 6.4, 6.65)));
        oArrow(c, 844, 300, 940, 300, H.ease.out(OX(t, 7.05, 7.25)));
        oLabel(c, 'MODEL', 640, 76, { size: 28, big: true, align: 'center', red: true });
        const right = t >= 9.6, drop = (t0) => (1 - H.ease.back(OX(t, t0, t0 + 0.25))) * -50;
        if (t >= 7.25 && !right) {
          const s = 1 + 0.3 * Math.pow(1 - H.ease.out(OX(t, 7.25, 7.4)), 2);
          c.save(); c.translate(1090, 300); c.scale(s, s); oLabel(c, 'DOG?', 0, 0, { size: 54, big: true, align: 'center' }); c.restore();
          oLabel(c, 'GUESS', 1090, 212 + drop(7.3), { size: 28, align: 'center', inv: true });
        }
        if (t >= 7.85 && !right) {
          const k = H.ease.out(OX(t, 7.85, 8.05));
          c.save(); c.strokeStyle = RDc; c.lineWidth = 10; c.beginPath(); c.arc(1090, 300, 110, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke();
          if (k >= 1) { c.lineWidth = 14; c.beginPath(); c.moveTo(1020, 230); c.lineTo(1160, 370); c.moveTo(1160, 230); c.lineTo(1020, 370); c.stroke(); }
          c.restore();
          oLabel(c, 'CHECK: WRONG', 1090, 450 + drop(7.95), { size: 28, align: 'center', red: true });
        }
        if (t >= 8.35 && t < 9.7) oLabel(c, 'ERROR RIPPLES BACK', 885, 520 + drop(8.35), { size: 28, align: 'center' });
        if (t >= 8.85 && t < 10.4) oLabel(c, 'ADJUST: GRID SHARPENS', 460, 548 + drop(8.85), { size: 28, align: 'center', red: true });
        if (right) {
          const s = 1 + 0.3 * Math.pow(1 - H.ease.out(OX(t, 9.6, 9.75)), 2);
          c.save(); c.translate(1090, 300); c.scale(s, s); oLabel(c, 'CAT ✓', 0, 0, { size: 54, big: true, align: 'center', red: true }); c.restore();
        }
        band(c, W, 600, 100);
        const words = ['GUESS', 'CHECK', 'ADJUST'];
        const act = t < 7.25 ? -1 : t < 7.85 ? 0 : t < 8.35 ? 1 : t < 9.6 ? 2 : Math.floor((t - 9.6) / 0.15) % 3;
        let x = 34;
        words.forEach((w, i) => { x += oLabel(c, w, x, 650, { size: 28, big: true, red: i === act }) + 14; if (i < 2) { oArrow(c, x, 650, x + 50, 650, 1, 6); x += 70; } });
        c.save(); c.font = '700 28px "Space Grotesk"'; c.fillStyle = BKc; c.textBaseline = 'middle'; c.fillText('↻ ×1,000,000', x + 10, 652); c.restore();
      } },
    prog: { P: (t) => { const p = H.ease.inOut(OX(t, 10.85, 12.3)); return { cx: 950, cy: 340, R: 230, lens: 1, fold: 0.6 + 0.4 * p, chaos: 0.35 * (1 - p), red: 0.9 + 0.283 * p, t }; },
      O(c, W, H_, t) {
        oHeader(c);
        c.fillStyle = IVc; c.fillRect(30, 90, 560, 560); weaveOver(c, 30, 90, 560, 560); c.fillStyle = BKc; c.fillRect(30, 90, 560, 5); c.fillRect(30, 645, 560, 5);
        oLabel(c, 'ACCURACY', 60, 140, { size: 32, big: true });
        const p = H.ease.inOut(OX(t, 10.85, 12.3)), v = Math.round(61 + 36 * p), punch = t >= 12.3 ? 1 + 0.15 * Math.exp(-(t - 12.3) * 9) : 1;
        c.save(); c.translate(60, 290); c.scale(punch, punch); c.font = '400 150px "Archivo Black"'; c.textBaseline = 'middle'; c.fillStyle = BKc; c.fillText(v + '%', 0, 0); const w = c.measureText('97%').width; c.restore();
        if (t >= 12.3) { const k = H.ease.out(OX(t, 12.3, 12.55)); c.save(); c.strokeStyle = RDc; c.lineWidth = 9; c.beginPath(); c.ellipse(60 + w / 2, 290, w / 2 + 26, 100, 0, Math.PI, Math.PI + Math.PI * 2 * k); c.stroke(); c.restore(); }
        // stepped chart: each training round a column of checker cells
        const x0 = 70, y0 = 610, cs = 20, n = 12;
        for (let i = 0; i < n; i++) {
          const acc = 61 + 36 * (1 - Math.exp(-i / 3.2)) / (1 - Math.exp(-(n - 1) / 3.2)), m = Math.round((acc - 50) / 47 * 9);
          for (let k = 0; k < m; k++) { if (t < 10.85 + i * 0.11 + k * 0.02) break; c.fillStyle = (i + k) % 2 ? BKc : (i === n - 1 && t >= 12.3 ? RDc : '#3a383c'); c.fillRect(x0 + i * (cs + 22), y0 - (k + 1) * cs, cs + 18, cs); }
        }
        c.save(); c.font = '700 22px "Space Grotesk"'; c.fillStyle = BKc; try { c.letterSpacing = '2px'; } catch (e) {} c.fillText('TRAINING ROUNDS →', x0, y0 + 30); c.restore();
        oLabel(c, 'MODEL', 950, 76, { size: 28, big: true, align: 'center', red: true });
      } },
    take: { P: (t) => ({ cx: 740, cy: 360, R: 268 + 6 * Math.sin(t * 2), lens: 1, fold: 1, chaos: 0, red: 1.183, t }),
      O(c, W, H_, t) {
        const k = H.ease.back(OX(t, 13.25, 13.55));
        c.save(); c.translate(640, 360); c.scale(k, k);
        oLabel(c, 'MORE EXAMPLES', 0, -50, { size: 50, big: true, align: 'center' });
        oLabel(c, '→ BETTER GUESSES', 0, 52, { size: 50, big: true, align: 'center', red: true, lead: true });
        c.restore();
      } },
  };
  function opScene(c, W, H_, name, t) { opField(c, W, H_, OS[name].P(t)); OS[name].O(c, W, H_, t); }
  function explainOP(ctx, W, H_, t) {
    const seq = [[0, 'hook'], [2.45, 'data'], [6.0, 'loop'], [10.5, 'prog'], [13.0, 'take']];
    let i = 0; for (let k = 0; k < seq.length; k++) if (t >= seq[k][0]) i = k;
    const t0 = seq[i][0], D = 0.5;
    if (i > 0 && t < t0 + D) {
      // Riley fold wipe: the old picture is crushed into crowded columns at a travelling fold
      const A = H.layer(W, H_), B = H.layer(W, H_);
      opScene(A.getContext('2d'), W, H_, seq[i - 1][1], t0 - 0.01); opScene(B.getContext('2d'), W, H_, seq[i][1], t);
      const sx = -120 + (W + 240) * H.ease.inOut(OX(t, t0, t0 + D)), st = 4;
      for (let x = 0; x < W; x += st) {
        const dd = x - sx, src = sx + dd * (1 + 3.2 * Math.exp(-Math.abs(dd) / 70)), sxp = H.clamp(src, 0, W - st);
        ctx.drawImage(dd < 0 ? B : A, sxp, 0, st, H_, x, 0, st, H_);
      }
      ctx.fillStyle = BKc; ctx.fillRect(sx - 3, 0, 6, H_);
    } else opScene(ctx, W, H_, seq[i][1], t);
    H.vignette(ctx, W, H_, 0.18);
  }

  registerStyle({
    id: 'op-art',
    name: 'Op Art Sphere',
    category: 'Generative & Type',
    description: 'Hard-edged black/ivory checkerboard that swells into a lens-like sphere and ripples at the margins — Vasarely and Riley optical vibration, flat acrylic on primed canvas.',
    motion: 'A flat checkerboard first ripples into Riley folds, then swells into a lens-sphere that pops past its size and settles; red squares flip in cell by cell from the centre, then the field breathes and the folds drift.',
    fonts: ['600 13px "Space Grotesk"', '700 20px "Space Grotesk"', '400 40px "Archivo Black"'],
    duration: 5,
    frameT: 4.9,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'The model is the Vasarely lens: untrained its grid is melted noise, the error travels back as an optical ripple through the checkerboard and each adjustment combs the sphere toward perfect order; scenes change with a Riley fold that crushes the picture into crowded columns, labels are hard-edged black and red slabs, and the numbers are Archivo Black on ivory bands.',
    explainer(ctx, W, H_, t) { explainOP(ctx, W, H_, t); },
    // Sound: clean optical pulses, no hand-made noise. Hard slabs land with a short low knock, the Riley fold is a
    // ratcheting zip of crushed columns that sweeps left to right with the fold, the error ripple is a train of sine
    // pulses converging on the lens, and "grid sharpens" is two detuned sines whose beating slows into unison.
    // A quiet sine pad re-breathes every π s, the period the sphere breathes at (R = 268 + 6 sin 2t).
    // Timings mirror explainOP / OS above (seq starts, OX windows, ease curves).
    explainerSound(k) {
      const D = 14.5, E = H.ease;
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.7;
      // first time an eased progress over [t0,t1] reaches u
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // optical pulse: a clean sine blip with a faint triangle edge
      const pulse = (t, f, g, p, dur = 0.14) => { k.tone(t, { f, dur, gain: 0.2 * g, a: 0.003, pan: p }); k.tone(t, { f: k.hz(f) * 2, type: 'triangle', dur: dur * 0.5, gain: 0.04 * g, a: 0.002, pan: p }); };
      // hard-edged slab landing: short damped knock, no paper
      const slab = (t, g, p, f = 150) => { k.tone(t, { f: [[0, f], [0.07, f * 0.55]], dur: 0.12, gain: 0.32 * g, a: 0.002, pan: p }); k.noise(t, { dur: 0.025, filter: 'bandpass', f: 1400, q: 1.2, gain: 0.18 * g, a: 0.001, pan: p }); };
      // a red arrow bar extending: a short smooth rising zip
      const zip = (t, dur, p) => k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 500], [dur, 1500]], q: 1.4, gain: 0.08, a: dur * 0.5, pan: p, minor: true });
      // Riley fold wipe: sx = -120 + 1520 * inOut((t - t0) / 0.5); one column-crush click per 120 px it passes
      const fold = (t0) => {
        const sx = (t) => -120 + 1520 * E.inOut(H.clamp((t - t0) / 0.5));
        k.noise(t0, { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.25, 1100], [0.5, 350]], q: 1.1, gain: 0.14, a: 0.24 });
        k.tone(t0, { f: [[0, 70], [0.25, 110], [0.5, 60]], dur: 0.5, gain: 0.09, a: 0.22 });
        k.withMinor(() => { for (let x = 0; x <= 1280; x += 120) { const t = when(t0, t0 + 0.5, (u) => sx(t0 + u * 0.5) / 1280, x / 1280); k.noise(t, { dur: 0.018, filter: 'bandpass', f: 2200, q: 2, gain: 0.16, a: 0.001, pan: pan(x) }); k.tone(t, { f: 180, dur: 0.03, gain: 0.07, pan: pan(x) }); } });
      };
      // throttled counter: one click per step of the eased progress, at most `rate` per second
      const counter = (t0, t1, ease, steps, rate, f, p) => { let last = -1, prev = 0;
        for (let t = t0; t <= t1; t += 0.002) { const s = Math.floor(ease(H.clamp((t - t0) / (t1 - t0))) * steps); if (s !== prev && t - last >= 1 / rate) { k.noise(t, { dur: 0.016, filter: 'bandpass', f, q: 2, gain: 0.2, a: 0.001, pan: p, minor: true }); k.tone(t, { f: f * 0.1, dur: 0.025, gain: 0.05, pan: p, minor: true }); last = t; } prev = s; } };

      // ---- underneath: soft gallery room + a sine pad that breathes with the sphere (bar = π s)
      k.bed('room', 0, D, { gain: 0.15 });
      k.music('pad', 0, D, { bpm: 240 / Math.PI, gain: 0.4, chords: [['A2', 'E3', 'A3', 'C4'], ['F2', 'C3', 'A3', 'E4'], ['D3', 'A3', 'C4', 'F4'], ['A2', 'E3', 'A3', 'C4'], ['C3', 'G3', 'C4', 'E4']] });

      // ---- hook: title slab pops in (back, 0.1-0.45), shrinks into the header (1.7-2.3)
      k.tone(0.1, { f: [[0, 160], [0.2, 330]], dur: 0.22, gain: 0.1, a: 0.12, minor: true });
      const tl = when(0.1, 0.45, E.back, 1);
      slab(tl, 0.85, 0); pulse(tl, 'A3', 0.7, 0, 0.5);
      k.noise(1.7, { dur: 0.6, color: 'pink', filter: 'lowpass', f: [[0, 700], [0.6, 250]], gain: 0.03, a: 0.25, minor: true }); // soft slide to the corner

      // ---- data: fold in, three arrows, MODEL slab drops, cards swallowed by the lens, counter
      fold(2.45);
      [0, 1, 2].forEach((i) => zip(2.55 + i * 0.07, 0.35, -0.3 + i * 0.05));
      slab(when(2.7, 3.0, E.back, 1), 0.7, pan(1010), 180);
      { // card k spawns at ts = 2.6 + 3.1 (k/36)^0.8 and enters the lens (x = 760) at ts + 850/(520 + 16k)
        let last = -1; const enter = [];
        for (let c = 0; c < 36; c++) enter.push(2.6 + 3.1 * Math.pow(c / 36, 0.8) + 850 / (520 + 16 * c));
        enter.sort((a, b) => a - b).forEach((t, i) => { if (t - last < 0.16 || t > 6.0) return; last = t; k.tone(t, { f: [[0, 260 + (i % 4) * 30], [0.08, 140]], dur: 0.1, gain: 0.09, a: 0.003, pan: pan(800), minor: true }); });
      }
      // n = 10^(6 inOut(OX(t, 2.75, 5.0))) - 1: slow, fast, slow; at most 11 clicks/s
      counter(2.76, 4.98, E.inOut, 30, 11, 2600, pan(180));
      slab(5.0, 1.1, pan(200), 120); pulse(5.0, 'E3', 1, pan(200), 0.45); // 1,000,000 lands

      // ---- loop: fold in, arrows, DOG? guess, wrong, ripple back, grid sharpens, CAT ✓
      fold(6.0);
      zip(6.4, 0.25, pan(330));
      zip(7.05, 0.2, pan(890));
      slab(7.25, 0.9, pan(1090), 170); pulse(7.25, 'E4', 0.9, pan(1090), 0.25); // DOG? punches in
      k.play('tock', when(7.3, 7.55, E.back, 1), { f: 520, gain: 0.35, pan: pan(1090), minor: true }); // GUESS tag
      k.tone(7.85, { f: [[0, 220], [0.2, 440]], type: 'triangle', dur: 0.22, gain: 0.08, a: 0.15, pan: pan(1090), minor: true }); // red ring draws round
      slab(8.05, 1.1, pan(1090), 130); k.play('error', 8.05, { f: 'A3', gain: 0.8, pan: pan(1090) }); // X: wrong
      // error ripple: ring r = 620 -> -20 over 8.35-9.0, amp sin(pi u): a pulse train converging on the lens
      for (let i = 0; i < 9; i++) { const t = 8.37 + i * 0.075, u = H.clamp((t - 8.35) / 0.7), a = Math.sin(Math.PI * u);
        pulse(t, 300 + 260 * u, 0.2 + 0.4 * a, 0.45 * (1 - u), 0.1); }
      k.play('tock', when(8.85, 9.1, E.back, 1), { f: 440, gain: 0.3, pan: pan(480), minor: true }); // ADJUST tag
      // grid sharpens 8.9-9.4: beating between two sines slows to unison as the chaos combs out
      k.tone(8.9, { f: 330, dur: 0.75, gain: 0.045, a: 0.08, hold: 0.45 });
      k.tone(8.9, { f: [[0, 352], [0.5, 330.5]], dur: 0.75, gain: 0.045, a: 0.08, hold: 0.45 });
      k.tone(8.9, { f: 165, dur: 0.75, gain: 0.035, a: 0.1, hold: 0.4 });
      slab(9.6, 0.9, pan(1090), 190); k.play('success', 9.6, { f: 'E5', gain: 0.75, pan: pan(1090) }); // CAT ✓
      // the loop keeps cycling GUESS -> CHECK -> ADJUST every 0.15 s
      k.withMinor(() => { for (let i = 1; i <= 5; i++) pulse(9.6 + i * 0.15, ['G3', 'C4', 'E4'][i % 3], 0.35, pan(300), 0.09); });

      // ---- progress: fold in, checker columns stack, counter 61 -> 97, the 97% hit
      fold(10.5);
      k.withMinor(() => { for (let i = 0; i < 12; i++) { const acc = 61 + (36 * (1 - Math.exp(-i / 3.2))) / (1 - Math.exp(-11 / 3.2)); pulse(10.85 + i * 0.11, 150 + (acc - 61) * 5, 0.45, pan(70 + i * 42), 0.1); } });
      counter(10.86, 12.28, E.inOut, 36, 9, 3000, pan(160));
      k.play('impact', 12.3, { gain: 1.2, pan: pan(200) });
      ['A2', 'E3', 'A3', 'C#4'].forEach((n, i) => k.tone(12.3, { f: n, dur: 1.1, gain: 0.09 - i * 0.012, a: 0.004, verb: 0.3, pan: (i - 1.5) * 0.2 }));
      k.tone(12.3, { f: [[0, 260], [0.25, 520]], type: 'triangle', dur: 0.28, gain: 0.07, a: 0.2, pan: pan(200), minor: true }); // red ring

      // ---- takeaway: fold in, slabs pop, resolving pulse chord
      fold(13.0);
      const tk = when(13.25, 13.55, E.back, 1);
      slab(tk, 1, 0, 160);
      ['A2', 'E3', 'A3', 'C#4', 'E4'].forEach((n, i) => k.tone(tk + i * 0.04, { f: n, dur: 1.15, gain: 0.08, a: 0.01, verb: 0.35, pan: (i - 2) * 0.2 }));
    },
    draw(ctx, W, H_, t) {
      const img = ctx.createImageData(W, H_), d = img.data;
      // timeline: folds ripple in (0.2-1.6s), lens swells with overshoot (1.1-2.6s),
      // red cells flip in on twos from the centre (2.3-3.4s), then ambient breathing.
      const tau = t - 2.9;                       // ambient phase; at frameT matches the still
      const fold = H.ease.inOut(H.clamp((t - 0.05) / 1.3));
      const lensE = H.clamp((t - 1.1) / 1.5);
      const lens = lensE <= 0 ? 0 : H.ease.back(lensE);
      const tq = Math.floor(t * 15) / 15;       // on twos
      const redThr = 1.183 * H.ease.out(H.clamp((tq - 2.3) / 1.1));
      const cx = 740 + Math.sin(tau * 0.4) * 30, cy = 360;
      const R = 268 + Math.sin(tau * 0.9) * 6;
      const R2 = R * R;
      const nz = H.makeNoise(11);

      // --- field: Riley column folds outside, Vasarely lens bulge inside (grid stays continuous)
      const GW = W + 1, GH = H_ + 1;
      const G = new Float32Array(GW * GH);
      const CU = new Float32Array(GW * GH), CV = new Float32Array(GW * GH);
      const PI = Math.PI, A0 = 1 - 0.58 * lens;
      for (let y = 0; y < GH; y++) {
        for (let x = 0; x < GW; x++) {
          // Riley "Movement in Squares": columns pinch together toward two vertical folds
          let u = x + fold * (58 * Math.sin((x / W) * PI * 2.5 + 0.6 + tau * 0.25) - 9 * Math.sin((x / W) * PI * 6 + tau * 0.4));
          const yy = (y - cy) / 360; let v = cy + (y - cy) * (1 + 0.42 * fold * yy * yy) + fold * 8 * Math.sin((y / H_) * PI * 2 + tau * 0.3);
          const dx = x - cx, dy = y - cy, r2 = dx * dx + dy * dy;
          if (r2 < R2) {
            const rho = Math.sqrt(r2) / R;
            const k = A0 + (1 - A0) * rho * rho;  // f(rho)=rho*k : magnified centre, crushed rim
            // lens acts on the folded coordinates around the centre
            const ux = cx + fold * (58 * Math.sin((cx / W) * PI * 2.5 + 0.6 + tau * 0.25) - 9 * Math.sin((cx / W) * PI * 6 + tau * 0.4));
            const blend = (1 - Math.pow(rho, 2)) * H.clamp(lens * 1.5);
            u = u * (1 - blend) + (ux + dx) * blend;
            u = ux + (u - ux) * k; v = cy + (v - cy) * k;
          }
          const i = y * GW + x;
          G[i] = Math.sin((PI * (u - cx)) / S) * Math.sin((PI * (v - cy)) / S);
          CU[i] = Math.floor((u - cx) / S); CV[i] = Math.floor((v - cy) / S);
        }
      }

      // palette: ivory ground, carbon black, one signal red that floods the swelling cells
      const IV = [240, 235, 221], BK = [20, 19, 21], RD = [208, 38, 34];
      // the lens magnification of each cell -> flat, stepped tint (each square painted one colour)
      const k0 = 0.42;
      for (let y = 0; y < H_; y++) {
        for (let x = 0; x < W; x++) {
          const i = y * GW + x;
          const g = G[i];
          const gx = (G[i + 1] - g), gy = (G[i + GW] - g);
          const gm = Math.sqrt(gx * gx + gy * gy) + 1e-5;
          let a = 0.5 + (g / gm) * 0.9;
          a = a < 0 ? 0 : a > 1 ? 1 : a;
          let L = IV;
          const dx = x - cx, dy = y - cy, r2 = dx * dx + dy * dy;
          if (r2 < R2) {
            // cell centre in texture space -> its radius -> quantised tint step
            // use the neighbouring *light* cell for edge pixels so tints never fringe
            let j = i;
            if (g <= 0) { if (G[i + 1] > 0) j = i + 1; else if (G[i + GW] > 0) j = i + GW; else if (x > 0 && G[i - 1] > 0) j = i - 1; else if (y > 0 && G[i - GW] > 0) j = i - GW; }
            const ccu = (CU[j] + 0.5) * S, ccv = (CV[j] + 0.5) * S;
            const cr = Math.hypot(ccu, ccv) / (R * k0 * 1.0);
            const step = Math.max(0, Math.min(1, 1.15 - cr * 0.9));
            const q = cr < redThr ? 1 : 0;
            L = [IV[0] + (RD[0] - IV[0]) * q, IV[1] + (RD[1] - IV[1]) * q, IV[2] + (RD[2] - IV[2]) * q];
          }
          const o = (y * W + x) * 4;
          d[o] = BK[0] + (L[0] - BK[0]) * a;
          d[o + 1] = BK[1] + (L[1] - BK[1]) * a;
          d[o + 2] = BK[2] + (L[2] - BK[2]) * a;
          d[o + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);

      // --- canvas finish: linen weave + brush unevenness, multiplied lightly
      const tex = ctx.getImageData(0, 0, W, H_), td = tex.data, r = H.rng(5);
      for (let y = 0; y < H_; y++) {
        const wy = Math.sin(y * 1.9) * 0.5 + 0.5;
        for (let x = 0; x < W; x++) {
          const o = (y * W + x) * 4;
          const wx = Math.sin(x * 1.9) * 0.5 + 0.5;
          const weave = ((x >> 1) + (y >> 1)) & 1 ? wx : wy;
          const lum = (td[o] + td[o + 1] + td[o + 2]) / 765;
          const brush = nz.n2(x * 0.004, y * 0.03) * 0.5 + nz.n2(x * 0.05, y * 0.002) * 0.5;
          const k = 1 + (weave - 0.5) * 0.05 * (0.3 + lum) + brush * 0.025 + (r() - 0.5) * 0.03;
          td[o] *= k; td[o + 1] *= k; td[o + 2] *= k;
        }
      }
      ctx.putImageData(tex, 0, 0);
      H.vignette(ctx, W, H_, 0.18);
    },
  });
}
