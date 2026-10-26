{
  // ---------- Psychedelic Poster: 1960s San Francisco concert-poster psychedelia ----------
  // Flat full-strength litho inks in vibrating complementary pairs, liquid domain-warped ring bands,
  // sunbursts, mirror-symmetric eye-flowers, and bulbous Shrikhand lettering warped slice by slice.
  const TAU = Math.PI * 2;
  const C = {
    mag: '#ff1a8c', acid: '#a4f01a', orange: '#ff6a00', blue: '#1b3dff', purple: '#6d17c8', yellow: '#ffe11a',
    ink: '#22072b', cream: '#fbefd2', red: '#ec1c24', pink: '#ff9ad5', white: '#fffaf0',
  };
  const cl = H.clamp, E = H.ease;
  const seg = (t, a, b) => cl((t - a) / (b - a));
  const lerp = H.lerp;
  const cache = { text: new Map() };
  const hash1 = (n) => { let h = Math.imul(n | 0, 374761393) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const bez = (p0, p1, p2, p3, u) => { const v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; };

  // ---------- liquid ring bands (domain-warped, optionally kaleidoscope-folded) ----------
  function liquid(ctx, W, H_, t, o) {
    const S = 2, w = (W / S) | 0, h = (H_ / S) | 0;
    if (!cache.liq) { cache.liq = H.layer(w, h); cache.liqX = cache.liq.getContext('2d'); cache.liqImg = cache.liqX.createImageData(w, h); cache.prevRow = new Float32Array(w); }
    const d = cache.liqImg.data, prev = cache.prevRow;
    const rgb = (c) => (Array.isArray(c) ? c : H.hex(c));
    const A = o.cols.map(rgb), LA = o.line ? rgb(o.line) : null;
    const fl = o.flood, B = fl ? fl.cols.map(rgb) : null, LB = fl && fl.line ? rgb(fl.line) : null, fr2 = fl ? fl.r * fl.r : 0;
    const lw = o.lineW == null ? 0.12 : o.lineW;
    const cx = o.cx == null ? W / 2 : o.cx, cy = o.cy == null ? H_ / 2 : o.cy, k = 1 / 360;
    const warp = o.warp == null ? 0.3 : o.warp, freq = o.freq || 9, ph0 = (o.phase || 0) - t * (o.speed == null ? 0.6 : o.speed);
    const spiral = o.spiral || 0, fold = o.fold || 0, nf = o.nfold || 8, sA = TAU / nf, frot = o.foldRot || 0;
    const tt = t * (o.flow == null ? 1 : o.flow);
    const band = (p, cols, line) => { const f0 = Math.floor(p), f = p - f0; if (line && f < lw) return line; const n = cols.length; return cols[((f0 % n) + n) % n]; };
    for (let y = 0; y < h; y++) {
      let lastP = 0;
      for (let x = 0; x < w; x++) {
        const X = x * S + 1, Y = y * S + 1;
        let px = (X - cx) * k, py = (Y - cy) * k;
        if (fold > 0) {
          const r0 = Math.hypot(px, py); let a = Math.atan2(py, px) + frot; a = ((a % sA) + sA) % sA; a = Math.abs(a - sA / 2);
          px += (Math.cos(a) * r0 - px) * fold; py += (Math.sin(a) * r0 - py) * fold;
        }
        let u = px, v = py;
        for (let i = 1; i <= 4; i++) { u += (warp / i) * Math.sin(i * 1.6 * v + tt * 0.7 + i * 1.9); v += (warp / i) * Math.cos(i * 1.4 * u - tt * 0.55 + i * 0.6); }
        let p = Math.hypot(u, v) * freq + ph0;
        if (spiral) p += (spiral * Math.atan2(v, u)) / TAU;
        const gx = x ? lastP - p : 0, gy = y ? prev[x] - p : 0;
        const dp = Math.min(0.6, Math.max(0.02, Math.abs(gx), Math.abs(gy)));
        lastP = p; prev[x] = p;
        let cols = A, line = LA;
        if (fl) { const dx = X - fl.cx, dy = Y - fl.cy; if (dx * dx + dy * dy < fr2) { cols = B; line = LB; } }
        // colour plate (anti-aliased), then the key-line plate printed a hair off register (~1.4px right, 1px down)
        const c0 = band(p - dp * 0.35, cols, null), c1 = band(p, cols, null), c2 = band(p + dp * 0.35, cols, null);
        let r = (c0[0] + 2 * c1[0] + c2[0]) >> 2, g = (c0[1] + 2 * c1[1] + c2[1]) >> 2, b = (c0[2] + 2 * c1[2] + c2[2]) >> 2;
        if (line) {
          const pd = p + (Math.abs(gx) < 0.6 ? gx * 0.7 : 0) + (Math.abs(gy) < 0.6 ? gy * 0.5 : 0);
          const fa = pd - dp * 0.35, fb = pd + dp * 0.35;
          const cov = ((fa - Math.floor(fa) < lw) + 2 * (pd - Math.floor(pd) < lw) + (fb - Math.floor(fb) < lw)) * 0.25;
          if (cov > 0) { r += (line[0] - r) * cov; g += (line[1] - g) * cov; b += (line[2] - b) * cov; }
        }
        const i4 = (y * w + x) * 4;
        d[i4] = r; d[i4 + 1] = g; d[i4 + 2] = b; d[i4 + 3] = 255;
      }
    }
    cache.liqX.putImageData(cache.liqImg, 0, 0);
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(cache.liq, 0, 0, W, H_); ctx.restore();
  }

  // ---------- paper + ink finish ----------
  function finishTex(W, H_) {
    if (cache.paper) return;
    const c = H.layer(W, H_), x = c.getContext('2d');
    const nz = H.makeNoise(77), sw = 160, sh = 90, s = H.layer(sw, sh), sx = s.getContext('2d'), im = sx.createImageData(sw, sh);
    for (let y = 0; y < sh; y++) for (let xx = 0; xx < sw; xx++) {
      const v = 0.5 + 0.5 * nz.fbm2(xx * 0.05, y * 0.05, 4), i = (y * sw + xx) * 4;
      im.data[i] = 255 - 8 * v; im.data[i + 1] = 249 - 16 * v; im.data[i + 2] = 236 - 28 * v; im.data[i + 3] = 255;
    }
    sx.putImageData(im, 0, 0);
    x.imageSmoothingQuality = 'high'; x.drawImage(s, 0, 0, W, H_);
    const r = H.rng(5); x.lineCap = 'round';
    for (let i = 0; i < 1100; i++) {
      const px = r() * W, py = r() * H_, a = r() * TAU, l = r.range(4, 18);
      x.strokeStyle = `rgba(120,80,40,${r.range(0.03, 0.1)})`; x.lineWidth = r.range(0.5, 1.2);
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + 0.5) * l * 0.6, py + Math.sin(a + 0.5) * l * 0.6, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
    }
    const id = x.getImageData(0, 0, W, H_), dd = id.data, rg = H.rng(9);
    for (let i = 0; i < dd.length; i += 4) { const n = (rg() - 0.5) * 16; dd[i] += n; dd[i + 1] += n; dd[i + 2] += n; }
    x.putImageData(id, 0, 0);
    cache.paper = c;
    cache.specks = [0, 1, 2].map((k) => {
      const sc = H.layer(W, H_), s2 = sc.getContext('2d'), rr = H.rng(100 + k);
      for (let i = 0; i < 2600; i++) { s2.fillStyle = `rgba(255,248,232,${rr.range(0.25, 0.75)})`; s2.beginPath(); s2.ellipse(rr() * W, rr() * H_, rr.range(0.4, 1.5), rr.range(0.4, 1.1), rr() * 3, 0, TAU); s2.fill(); }
      for (let i = 0; i < 26; i++) { // larger worn-ink dropouts
        const px = rr() * W, py = rr() * H_; s2.fillStyle = `rgba(255,248,232,${rr.range(0.12, 0.3)})`;
        for (let j = 0; j < 14; j++) { s2.beginPath(); s2.arc(px + rr.gauss() * 6, py + rr.gauss() * 4, rr.range(0.6, 2), 0, TAU); s2.fill(); }
      }
      return sc;
    });
  }
  function finish(ctx, W, H_, t) {
    finishTex(W, H_);
    ctx.save();
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(cache.paper, 0, 0);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.5; ctx.drawImage(cache.specks[Math.floor(t * 8) % 3], 0, 0);
    ctx.restore();
    H.vignette(ctx, W, H_, 0.3, '60,10,40');
  }

  // ---------- lettering: rendered offscreen, then warped in slices ----------
  function txt(str, size, o) {
    const key = str + '|' + size + '|' + JSON.stringify(o);
    let tc = cache.text.get(key); if (tc) return tc;
    if (cache.text.size > 220) cache.text.clear();
    const fam = o.font || 'Shrikhand', font = `400 ${size}px "${fam}"`;
    const m = H.layer(8, 8).getContext('2d'); m.font = font;
    const tw = m.measureText(str).width;
    const lw = o.lw || 0, ow = o.ow || 0, sh = o.shadow;
    const pad = Math.ceil(lw + ow + (sh ? Math.max(Math.abs(sh.dx), Math.abs(sh.dy)) : 0) + size * 0.12) + 4;
    const w = Math.ceil(tw + pad * 2), h = Math.ceil(size * 1.42 + pad * 2);
    const c = H.layer(w, h), x = c.getContext('2d');
    const X = w / 2, Y = h / 2 + size * (fam === 'Shrikhand' ? 0.02 : 0.04);
    const setup = (g) => { g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.miterLimit = 2; };
    setup(x);
    if (sh) { x.save(); x.translate(sh.dx, sh.dy); x.fillStyle = x.strokeStyle = sh.col; x.lineWidth = (lw + ow) * 2; if (lw + ow) x.strokeText(str, X, Y); x.fillText(str, X, Y); x.restore(); }
    if (o.outer) { x.strokeStyle = o.outer; x.lineWidth = (lw + ow) * 2; x.strokeText(str, X, Y); }
    if (lw) { x.strokeStyle = o.line || C.ink; x.lineWidth = lw * 2; x.strokeText(str, X, Y); }
    const f = H.layer(w, h), fx = f.getContext('2d'); setup(fx);
    let fill = o.fill || C.yellow;
    if (o.grad) { const g = fx.createLinearGradient(0, Y - size * 0.42, 0, Y + size * 0.42); o.grad.forEach((cc, i) => g.addColorStop(i / (o.grad.length - 1), cc)); fill = g; }
    fx.fillStyle = fill; fx.fillText(str, X, Y);
    if (o.inline) {
      fx.globalCompositeOperation = 'source-atop';
      fx.strokeStyle = o.inline; fx.lineWidth = (o.ins + o.iw) * 2; fx.strokeText(str, X, Y);
      fx.strokeStyle = fill; fx.lineWidth = o.ins * 2; fx.strokeText(str, X, Y);
    }
    x.drawImage(f, 0, 0);
    tc = { c, w, h, tw, size };
    cache.text.set(key, tc);
    return tc;
  }
  // draw text canvas centred at (x,y), columns displaced by a travelling sine; bulge swells the middle; melt drips
  function wavy(ctx, tc, x, y, o = {}) {
    const sc = o.scale == null ? 1 : o.scale, amp = o.amp == null ? 4 : o.amp, fr = o.freq == null ? 0.02 : o.freq, ph = o.ph || 0;
    const bulge = o.bulge || 0, sw = o.sw || 3, melt = o.melt || 0, alpha = o.alpha == null ? 1 : o.alpha;
    if (alpha <= 0.002 || sc <= 0.002) return;
    const x0 = x - (tc.w * sc) / 2;
    ctx.save(); ctx.globalAlpha *= alpha;
    for (let sx = 0; sx < tc.w; sx += sw) {
      const s = Math.min(sw, tc.w - sx), u = (sx + s / 2) / tc.w;
      const dy = amp * Math.sin(sx * fr + ph);
      const sy = 1 + bulge * Math.sin(Math.PI * u);
      const hh = tc.h * sc * sy;
      const drip = melt > 0 ? melt * tc.h * sc * (0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(sx * 0.043 + 1.3) * Math.sin(sx * 0.0171 + 0.4), 2)) : 0;
      ctx.drawImage(tc.c, sx, 0, s, tc.h, x0 + sx * sc, y - hh / 2 + dy - drip * 0.35, s * sc + 0.7, hh + drip);
    }
    ctx.restore();
  }

  // ---------- shapes ----------
  function blob(x, cx, cy, rx, ry, amp, lobes, ph, n = 90) {
    x.beginPath();
    for (let i = 0; i <= n; i++) { const a = (i / n) * TAU, r = 1 + amp * Math.sin(a * lobes + ph); x.lineTo(cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r); }
    x.closePath();
  }
  // fill with a slightly mis-registered colour plate, then the ink key line on top
  function inkFill(x, fill, lw, off = [2.5, 2]) {
    x.save(); x.translate(off[0], off[1]); x.fillStyle = fill; x.fill(); x.restore();
    x.fillStyle = fill; x.fill();
    if (lw) { x.lineWidth = lw; x.strokeStyle = C.ink; x.lineJoin = 'round'; x.stroke(); }
  }
  function petalP(inner, len, wid) {
    const p = new Path2D();
    p.moveTo(inner, 0);
    p.bezierCurveTo(inner + len * 0.15, -wid, inner + len * 0.68, -wid * 1.15, inner + len * 0.95, -wid * 0.5);
    p.quadraticCurveTo(inner + len * 1.05, 0, inner + len * 0.95, wid * 0.5);
    p.bezierCurveTo(inner + len * 0.68, wid * 1.15, inner + len * 0.15, wid, inner, 0);
    p.closePath();
    return p;
  }
  function pathInk(x, p, fill, lw, off) {
    if (off) { x.save(); x.translate(off[0], off[1]); x.fillStyle = fill; x.fill(p); x.restore(); }
    x.fillStyle = fill; x.fill(p);
    if (lw) { x.lineWidth = lw; x.strokeStyle = C.ink; x.lineJoin = 'round'; x.stroke(p); }
  }
  function sunburst(x, R, t, o) {
    const N = o.n || 32, lit = o.lit == null ? 1 : o.lit, sp = o.spin == null ? 0.05 : o.spin;
    // flame-tongue rays: long and short alternate, tips curl slowly
    for (let pass = 0; pass < 2; pass++) for (let i = pass; i < N; i += 2) {
      const a = ((i + 0.5) / N) * TAU - t * sp - Math.PI / 2, hw = (Math.PI / N) * (pass ? 1.5 : 1.9);
      const on = i / N < lit - 1e-6;
      const len = R * (pass ? 0.8 : 1) * (on ? 1 : 0.86), r0 = R * 0.4, curl = 0.1 * Math.sin(t * 2.2 + i * 1.7);
      const P = (aa, rr) => [Math.cos(aa) * rr, Math.sin(aa) * rr];
      const b0 = P(a - hw, r0), c0 = P(a - hw * 0.7 + curl * 0.5, len * 0.72), tip = P(a + curl, len), c1 = P(a + hw * 0.7 + curl * 0.5, len * 0.72), b1 = P(a + hw, r0);
      x.beginPath(); x.moveTo(b0[0], b0[1]); x.quadraticCurveTo(c0[0], c0[1], tip[0], tip[1]); x.quadraticCurveTo(c1[0], c1[1], b1[0], b1[1]); x.closePath();
      x.fillStyle = on ? (pass ? o.c1 : o.c2) : (pass ? '#4a1a63' : '#35104a'); x.fill();
      x.lineWidth = 3.5; x.strokeStyle = C.ink; x.stroke();
    }
  }
  const PAL = { r1: C.yellow, r2: C.mag, p1: C.purple, p2: C.acid, q1: C.orange, q2: C.blue, ring: C.cream, iris: [C.blue, C.acid, C.orange] };
  // the eye-flower: petals are its weights, the eye is what it sees
  function model(x, cx, cy, R, t, s = {}) {
    const P = Object.assign({}, PAL, s.pal || {}), open = s.open == null ? 1 : s.open;
    if (open <= 0 && !(s.rays > 0)) return;
    const rot = (s.rot || 0) + t * 0.06, jit = s.jit || 0, jr = H.rng(900 + Math.floor(t * 15));
    x.save(); x.translate(cx, cy);
    if (s.rays > 0) sunburst(x, R * (s.rayLen || 1.6) * s.rays, t, { c1: P.r1, c2: P.r2, lit: s.lit, n: s.rayN || 32 });
    const N = 12;
    for (let i = 0; i < N; i++) { // outer petals
      const op = E.back(cl(open * 1.6 - (i / N) * 0.6)); if (op <= 0) continue;
      const w = s.wts ? s.wts[i] : 1, a = (i / N) * TAU + rot + (jit ? jr.range(-0.12, 0.12) * jit : 0);
      const len = R * (0.5 + 0.48 * w) * op, wid = R * 0.21 * Math.min(1, op);
      x.save(); x.rotate(a);
      pathInk(x, petalP(R * 0.3, len, wid), i % 2 ? P.p1 : P.p2, 5, [3, -2]);
      pathInk(x, petalP(R * 0.38, len * 0.72, wid * 0.5), i % 2 ? P.p2 : P.p1, 3);
      x.beginPath(); x.arc(R * 0.3 + len * 0.86, 0, Math.max(0.1, wid * 0.2), 0, TAU); inkFill(x, P.ring, 2.5, [0, 0]);
      x.restore();
    }
    for (let i = 0; i < N; i++) { // inner petals
      const op = E.back(cl(open * 1.6 - 0.3 - (i / N) * 0.4)); if (op <= 0) continue;
      const a = ((i + 0.5) / N) * TAU + rot * 0.6;
      x.save(); x.rotate(a);
      pathInk(x, petalP(R * 0.25, R * 0.4 * op, R * 0.12 * Math.min(1, op)), i % 2 ? P.q1 : P.q2, 4, [2, 2]);
      x.restore();
    }
    if (s.noEye) { x.restore(); return; }
    const eo = E.back(cl(open * 1.4 - 0.25));
    if (eo * R > 12) {
      blob(x, 0, 0, R * 0.5 * eo, R * 0.5 * eo, 0.05, 16, t * 0.5); inkFill(x, P.ring, 5);
      for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU + t * 0.1; x.beginPath(); x.arc(Math.cos(a) * R * 0.465 * eo, Math.sin(a) * R * 0.465 * eo, R * 0.022, 0, TAU); x.fillStyle = C.mag; x.fill(); }
      const er = R * 0.4 * eo;
      x.beginPath(); x.arc(0, 0, er, 0, TAU); inkFill(x, C.white, 5, [0, 0]);
      x.save(); x.beginPath(); x.arc(0, 0, er - 2, 0, TAU); x.clip();
      const vr = H.rng(31); x.strokeStyle = 'rgba(236,28,36,0.75)'; x.lineCap = 'round';
      for (let i = 0; i < 9; i++) { // veins
        const a = vr() * TAU; let px = Math.cos(a) * er, py = Math.sin(a) * er; x.lineWidth = vr.range(1.2, 2.4); x.beginPath(); x.moveTo(px, py);
        for (let k = 0; k < 5; k++) { const aa = a + vr.range(-0.5, 0.5), rr = er * (1 - (k + 1) * 0.08); px = Math.cos(aa) * rr; py = Math.sin(aa) * rr; x.lineTo(px, py); }
        x.stroke();
      }
      const lk = s.look || [0, 0], ir = er * 0.64, lx = lk[0] * er * 0.28, ly = lk[1] * er * 0.28;
      x.translate(lx, ly);
      const iris = P.iris;
      x.beginPath(); x.arc(0, 0, ir, 0, TAU); x.fillStyle = iris[0]; x.fill();
      x.beginPath(); x.arc(0, 0, ir * 0.78, 0, TAU); x.fillStyle = iris[1]; x.fill();
      x.beginPath(); x.arc(0, 0, ir * 0.58, 0, TAU); x.fillStyle = iris[2]; x.fill();
      x.strokeStyle = 'rgba(34,7,43,0.55)'; x.lineWidth = 2;
      for (let i = 0; i < 20; i++) { const a = (i / 20) * TAU + t * 0.3; x.beginPath(); x.moveTo(Math.cos(a) * ir * 0.45, Math.sin(a) * ir * 0.45); x.lineTo(Math.cos(a + 0.12) * ir * 0.95, Math.sin(a + 0.12) * ir * 0.95); x.stroke(); }
      x.beginPath(); x.arc(0, 0, ir, 0, TAU); x.lineWidth = 4; x.strokeStyle = C.ink; x.stroke();
      const pr = ir * 0.4 * (s.pupil || 1);
      x.beginPath(); x.arc(0, 0, pr, 0, TAU); x.fillStyle = C.ink; x.fill();
      x.fillStyle = C.white; x.beginPath(); x.ellipse(-ir * 0.32, -ir * 0.36, ir * 0.17, ir * 0.12, -0.6, 0, TAU); x.fill();
      x.beginPath(); x.arc(ir * 0.22, ir * 0.2, ir * 0.06, 0, TAU); x.fill();
      x.restore();
      x.beginPath(); x.arc(0, 0, er, 0, TAU); x.lineWidth = 5; x.strokeStyle = C.ink; x.stroke();
    }
    x.restore();
  }
  function daisy(x, cx, cy, r, t, sc) {
    if (sc <= 0) return;
    x.save(); x.translate(cx, cy); x.scale(sc, sc); x.rotate(t * 0.4);
    for (let i = 0; i < 8; i++) { x.save(); x.rotate((i / 8) * TAU); pathInk(x, petalP(r * 0.2, r * 0.85, r * 0.3), C.white, 3.5); x.restore(); }
    x.beginPath(); x.arc(0, 0, r * 0.32, 0, TAU); inkFill(x, C.yellow, 3.5, [0, 0]);
    x.beginPath(); x.arc(0, 0, r * 0.14, 0, TAU); x.fillStyle = C.orange; x.fill();
    x.restore();
  }
  function catFace(x, r) {
    const s = r * 0.66;
    for (const g of [-1, 1]) {
      x.beginPath(); x.moveTo(g * s * 0.78, -s * 0.2); x.lineTo(g * s * 0.86, -s * 1.02); x.lineTo(g * s * 0.18, -s * 0.62); x.closePath(); inkFill(x, C.orange, 4, [0, 0]);
      x.beginPath(); x.moveTo(g * s * 0.7, -s * 0.38); x.lineTo(g * s * 0.76, -s * 0.85); x.lineTo(g * s * 0.36, -s * 0.6); x.closePath(); x.fillStyle = C.pink; x.fill();
    }
    x.beginPath(); x.ellipse(0, 0, s * 0.9, s * 0.74, 0, 0, TAU); inkFill(x, C.orange, 4, [0, 0]);
    x.strokeStyle = C.mag; x.lineWidth = s * 0.07; x.lineCap = 'round';
    for (const g of [-1, 0, 1]) { x.beginPath(); x.moveTo(g * s * 0.2, -s * 0.66); x.quadraticCurveTo(g * s * 0.26, -s * 0.5, g * s * 0.18, -s * 0.36); x.stroke(); }
    for (const g of [-1, 1]) {
      x.beginPath(); x.ellipse(g * s * 0.36, -s * 0.08, s * 0.22, s * 0.15, 0, 0, TAU); inkFill(x, C.acid, 3, [0, 0]);
      x.beginPath(); x.ellipse(g * s * 0.36, -s * 0.08, s * 0.05, s * 0.13, 0, 0, TAU); x.fillStyle = C.ink; x.fill();
    }
    x.beginPath(); x.moveTo(-s * 0.1, s * 0.16); x.lineTo(s * 0.1, s * 0.16); x.lineTo(0, s * 0.28); x.closePath(); inkFill(x, C.mag, 2.5, [0, 0]);
    x.strokeStyle = C.ink; x.lineWidth = 3;
    x.beginPath(); x.moveTo(-s * 0.2, s * 0.36); x.quadraticCurveTo(-s * 0.1, s * 0.46, 0, s * 0.3); x.quadraticCurveTo(s * 0.1, s * 0.46, s * 0.2, s * 0.36); x.stroke();
    x.lineWidth = 2.5;
    for (const g of [-1, 1]) for (let k = -1; k <= 1; k++) { x.beginPath(); x.moveTo(g * s * 0.4, s * 0.26 + k * s * 0.09); x.quadraticCurveTo(g * s * 0.8, s * 0.2 + k * s * 0.14, g * s * 1.08, s * 0.16 + k * s * 0.2); x.stroke(); }
  }
  function dogFace(x, r) {
    const s = r * 0.66;
    for (const g of [-1, 1]) { x.save(); x.translate(g * s * 0.78, -s * 0.2); x.rotate(g * 0.35); x.beginPath(); x.ellipse(0, s * 0.18, s * 0.28, s * 0.6, 0, 0, TAU); inkFill(x, C.purple, 4, [0, 0]); x.restore(); }
    x.beginPath(); x.ellipse(0, 0, s * 0.74, s * 0.78, 0, 0, TAU); inkFill(x, C.yellow, 4, [0, 0]);
    x.beginPath(); x.ellipse(s * 0.32, -s * 0.16, s * 0.24, s * 0.22, 0.3, 0, TAU); x.fillStyle = C.orange; x.fill();
    for (const g of [-1, 1]) {
      x.beginPath(); x.arc(g * s * 0.3, -s * 0.14, s * 0.1, 0, TAU); x.fillStyle = C.ink; x.fill();
      x.beginPath(); x.arc(g * s * 0.3 - s * 0.03, -s * 0.18, s * 0.035, 0, TAU); x.fillStyle = C.white; x.fill();
    }
    x.beginPath(); x.ellipse(0, s * 0.3, s * 0.42, s * 0.3, 0, 0, TAU); inkFill(x, C.cream, 3, [0, 0]);
    x.beginPath(); x.moveTo(-s * 0.06, s * 0.42); x.quadraticCurveTo(0, s * 0.82, s * 0.12, s * 0.46); x.closePath(); inkFill(x, C.mag, 2.5, [0, 0]);
    x.beginPath(); x.ellipse(0, s * 0.2, s * 0.16, s * 0.1, 0, 0, TAU); x.fillStyle = C.ink; x.fill();
    x.strokeStyle = C.ink; x.lineWidth = 3; x.beginPath(); x.moveTo(0, s * 0.28); x.lineTo(0, s * 0.4); x.moveTo(-s * 0.18, s * 0.42); x.quadraticCurveTo(0, s * 0.52, s * 0.18, s * 0.42); x.stroke();
  }
  function medallion(x, cx, cy, r, kind, t, o = {}) {
    const sc = o.sc == null ? 1 : o.sc; if (sc <= 0.01) return;
    x.save(); x.translate(cx, cy); x.rotate(o.rot || 0); x.scale(sc, sc);
    blob(x, 0, 0, r, r, 0.07, 12, t * 1.4); inkFill(x, o.ring || (kind === 'cat' ? C.acid : C.orange), 5);
    x.save(); x.beginPath(); x.arc(0, 0, r * 0.8, 0, TAU); x.clip();
    const bg = kind === 'cat' ? [C.blue, C.purple] : [C.purple, C.mag];
    for (let k = 7; k >= 1; k--) { blob(x, 0, 0, r * 0.8 * k / 6.2, r * 0.8 * k / 6.2, 0.05, 6, t * 2 + k); x.fillStyle = bg[k % 2]; x.fill(); }
    x.translate(0, r * 0.08);
    if (kind === 'cat') catFace(x, r); else dogFace(x, r);
    x.restore();
    x.beginPath(); x.arc(0, 0, r * 0.8, 0, TAU); x.lineWidth = 4.5; x.strokeStyle = C.ink; x.stroke();
    x.restore();
  }
  function pill(x, cx, cy, label, t, o = {}) {
    const sc = o.sc == null ? 1 : o.sc; if (sc <= 0.01) return;
    // story label chip: always solid cream with a dark key line; an active/accent chip gets a coloured ink band around it
    const size = Math.max(30, o.size || 30), tc = txt(label, size, { font: 'Righteous', fill: o.tcol || C.ink });
    const w = tc.tw + size * 1.0, h = size * 1.6, acc = o.fill && o.fill !== C.cream ? o.fill : null;
    x.save(); x.translate(cx, cy); x.rotate(o.rot || 0); x.scale(sc, sc);
    x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, h / 2);
    x.save(); x.translate(5, 5); x.fillStyle = o.shadow || C.mag; x.fill(); x.restore();
    if (acc) { x.lineWidth = 19; x.strokeStyle = C.ink; x.stroke(); x.lineWidth = 12; x.strokeStyle = acc; x.stroke(); }
    x.fillStyle = C.cream; x.fill(); x.lineWidth = 5; x.strokeStyle = C.ink; x.stroke();
    wavy(x, tc, 0, 1, { amp: 1.0, freq: 0.05, ph: t * 3 });
    x.restore();
  }
  function wArrow(x, pt, prog, t, o = {}) {
    if (prog <= 0.001) return;
    const n = 56, w = o.w || 12, wob = o.wob == null ? 6 : o.wob, waves = o.waves || 3, pts = [];
    for (let i = 0; i <= n; i++) {
      const u = (i / n) * prog, a = pt(Math.max(0, u - 0.005)), b = pt(Math.min(1, u + 0.005)), p = pt(u);
      let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const wv = wob * Math.sin(u * TAU * waves - t * 7) * Math.sin(Math.PI * Math.min(1, u / Math.max(prog, 0.3)));
      pts.push([p[0] - ty * wv, p[1] + tx * wv]);
    }
    x.save(); x.lineCap = 'round'; x.lineJoin = 'round';
    const line = (lw, col) => { x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.lineWidth = lw; x.strokeStyle = col; x.stroke(); };
    line(w + 9, C.ink); line(w, o.col || C.yellow);
    if (o.core) line(w * 0.3, o.core);
    if (prog > 0.12) {
      const e = pts[n], f = pts[n - 4], a = Math.atan2(e[1] - f[1], e[0] - f[0]), hs = w * 1.9;
      x.translate(e[0], e[1]); x.rotate(a);
      x.beginPath(); x.moveTo(hs * 0.9, 0); x.quadraticCurveTo(-hs * 0.1, -hs * 0.2, -hs * 0.5, -hs * 0.95); x.quadraticCurveTo(-hs * 0.25, 0, -hs * 0.5, hs * 0.95); x.quadraticCurveTo(-hs * 0.1, hs * 0.2, hs * 0.9, 0); x.closePath();
      inkFill(x, o.col || C.yellow, 4.5, [0, 0]);
    }
    x.restore();
  }
  function crossMark(x, cx, cy, s, sc) {
    if (sc <= 0) return;
    x.save(); x.translate(cx, cy); x.scale(sc, sc); x.rotate(-0.08); x.lineCap = 'round';
    const st = (lw, c) => { x.lineWidth = lw; x.strokeStyle = c; x.beginPath(); x.moveTo(-s, -s); x.quadraticCurveTo(0, -s * 0.1, s, s); x.moveTo(s, -s); x.quadraticCurveTo(s * 0.1, 0, -s, s); x.stroke(); };
    st(s * 0.55 + 10, C.ink); st(s * 0.55, C.red); x.restore();
  }
  function checkMark(x, cx, cy, s, sc) {
    if (sc <= 0) return;
    x.save(); x.translate(cx, cy); x.scale(sc, sc); x.lineCap = 'round'; x.lineJoin = 'round';
    const st = (lw, c) => { x.lineWidth = lw; x.strokeStyle = c; x.beginPath(); x.moveTo(-s, -s * 0.05); x.quadraticCurveTo(-s * 0.6, s * 0.3, -s * 0.3, s * 0.7); x.quadraticCurveTo(s * 0.2, -s * 0.3, s * 1.05, -s * 0.85); x.stroke(); };
    st(s * 0.5 + 10, C.ink); st(s * 0.5, C.acid); x.restore();
  }
  function bubble(x, cx, cy, rx, ry, tail, t, sc, fill) {
    if (sc <= 0.01) return;
    x.save(); x.translate(cx, cy); x.scale(sc, sc);
    x.beginPath(); x.moveTo(-rx * 0.62, ry * 0.3); x.quadraticCurveTo(-rx * 0.8, ry * 0.75, tail[0], tail[1]); x.quadraticCurveTo(-rx * 0.5, ry * 0.95, -rx * 0.12, ry * 0.8); x.closePath(); inkFill(x, fill || C.cream, 5, [4, 4]);
    blob(x, 0, 0, rx, ry, 0.045, 7, t * 2); inkFill(x, fill || C.cream, 5, [4, 4]);
    x.restore();
  }
  function banner(x, cx, cy, wHalf, h, prog, col) {
    if (prog <= 0) return;
    const wh = wHalf * E.out(prog);
    x.save(); x.translate(cx, cy);
    for (const g of [-1, 1]) { // folded tails
      x.beginPath(); x.moveTo(g * (wh - 10), -h * 0.2); x.lineTo(g * (wh + 70), -h * 0.2); x.lineTo(g * (wh + 44), h * 0.4); x.lineTo(g * (wh + 70), h * 1.0); x.lineTo(g * (wh - 10), h * 1.0); x.closePath(); inkFill(x, col, 4, [3, 3]);
    }
    x.beginPath(); x.moveTo(-wh, -h / 2);
    for (let i = 0; i <= 20; i++) { const u = i / 20; x.lineTo(-wh + 2 * wh * u, -h / 2 + Math.sin(u * Math.PI * 2) * 8); }
    for (let i = 20; i >= 0; i--) { const u = i / 20; x.lineTo(-wh + 2 * wh * u, h / 2 + Math.sin(u * Math.PI * 2) * 8); }
    x.closePath(); inkFill(x, C.cream, 4.5, [3, 3]);
    x.restore();
  }

  // ---------- the poster (still + clip) ----------
  function poster(ctx, W, H_, t) {
    ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H_);
    const CX = 640, CY = 430;
    const rr = E.out(seg(t, 0, 1.5)) * 1450;
    if (rr > 2) {
      ctx.save(); blob(ctx, CX, CY, rr, rr, 0.035, 7, t * 3); ctx.clip();
      liquid(ctx, W, H_, t, { cx: CX, cy: CY, cols: [C.mag, C.acid], line: C.purple, lineW: 0.16, freq: 8.5, speed: 0.55, warp: 0.24 });
      ctx.restore();
      if (rr < 1440) { blob(ctx, CX, CY, rr, rr, 0.035, 7, t * 3); ctx.lineWidth = 16; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.lineWidth = 8; ctx.strokeStyle = C.orange; ctx.stroke(); }
    }
    model(ctx, CX, CY, 182, t, { open: seg(t, 0.8, 2.5), rays: E.out(seg(t, 0.5, 1.7)), rayLen: 1.75, look: [Math.sin(t * 0.9) * 0.5, Math.cos(t * 0.7) * 0.25 + 0.15], pupil: 1 + 0.08 * Math.sin(t * 2.3),
      pal: { r1: C.orange, r2: C.blue } });
    [[86, 600, 62], [1194, 600, 62], [80, 92, 46], [1200, 92, 46]].forEach(([x, y, r], i) => daisy(ctx, x, y, r, t + i, E.back(seg(t, 1.7 + i * 0.12, 2.2 + i * 0.12))));
    // title
    const tc = txt('Electric Mind', 138, { grad: [C.yellow, C.yellow, C.orange], line: C.ink, lw: 8, outer: C.cream, ow: 6, shadow: { dx: 8, dy: 8, col: C.blue }, inline: C.mag, ins: 6, iw: 3 });
    const tm = seg(t, 2.0, 3.3), melt = 1 - E.out(tm);
    wavy(ctx, tc, 640, 120, { amp: 7 + 30 * melt, freq: 0.011, ph: t * 2.4, bulge: 0.32, melt: melt * 0.9, alpha: E.out(seg(t, 2.0, 2.5)), sw: 3 });
    // bottom banner
    const bp = seg(t, 3.0, 3.6);
    banner(ctx, 640, 668, 230, 58, bp, C.mag);
    if (bp > 0.6) { const tb = txt('dreaming in color', 34, { font: 'Righteous', fill: C.ink }); wavy(ctx, tb, 640, 668, { amp: 2.5, freq: 0.03, ph: t * 3, alpha: seg(bp, 0.6, 1) }); }
    finish(ctx, W, H_, t);
  }

  // ---------- explainer scenes ----------
  const TR1 = [5.85, 6.55], TR2 = [10.25, 10.95], TR3 = [12.85, 13.35];
  const RIB = [
    (u) => bez([-60, 300], [260, 160], [520, 470], [820, 370], u),
    (u) => bez([-60, 430], [260, 545], [540, 280], [820, 410], u),
  ];
  // example cards: spawn times accelerate; alternate ribbons (shared with the score)
  const CARDS = (() => { const out = [], r = H.rng(44); for (let i = 0, ts = 3.0; ts < 5.45; i++) { out.push({ ts, kind: r() < 0.5 ? 'cat' : 'dog', rib: i % 2, ph: r() * 6 }); ts += Math.max(0.17, 0.42 - i * 0.03); } return out; })();
  const CARD_T = 1.45;
  const DRIPS = (() => { const r = H.rng(808), out = []; for (let x = 30; x < 1280; x += r.range(70, 170)) out.push([x, r.range(11, 24), r.range(40, 170)]); return out; })();
  const titleTC = () => txt('How does AI learn?', 100, { grad: [C.yellow, C.yellow, C.orange], line: C.ink, lw: 7, outer: C.cream, ow: 5, shadow: { dx: 7, dy: 7, col: C.purple }, inline: C.mag, ins: 5, iw: 2.5 });
  const W0 = [0.55, 1.1, 0.7, 0.95, 0.45, 1.2, 0.8, 0.5, 1.15, 0.65, 0.9, 0.6];
  const W1 = [0.95, 0.9, 0.95, 0.9, 0.95, 0.9, 0.95, 0.9, 0.95, 0.9, 0.95, 0.9];

  function ribbon(x, f, prog, t, cols) {
    if (prog <= 0) return;
    const pts = []; for (let i = 0; i <= 90; i++) pts.push(f((i / 90) * prog));
    x.save(); x.lineCap = 'round'; x.lineJoin = 'round';
    const line = (lw, col, dash) => { x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.lineWidth = lw; x.strokeStyle = col; if (dash) { x.setLineDash(dash); x.lineDashOffset = -t * 160; } else x.setLineDash([]); x.stroke(); };
    line(54, C.ink); line(44, cols[0]); line(28, C.ink); line(22, cols[1]); line(8, cols[2], [18, 22]);
    x.restore();
  }

  function sceneA(x, W, H_, t) {
    const fr = E.inOut(seg(t, 1.55, 2.9)) * 1500;
    liquid(x, W, H_, t, { cx: 640, cy: 360, cols: [C.mag, C.acid], freq: 8, speed: 0.75, warp: 0.32,
      flood: fr > 1 ? { cx: 950, cy: 380, r: fr, cols: [C.orange, C.blue], line: C.ink } : null, lineW: 0.1 });
    if (fr > 1 && fr < 1490) { blob(x, 950, 380, fr, fr, 0.03, 9, t * 4); x.lineWidth = 18; x.strokeStyle = C.ink; x.stroke(); x.lineWidth = 9; x.strokeStyle = C.yellow; x.stroke(); }
    const MX = 950, MY = 380, MR = 165;
    // ribbons + cards (under the flower)
    RIB.forEach((f, i) => ribbon(x, f, E.inOut(seg(t, 2.7 + i * 0.15, 3.3 + i * 0.15)), t, i ? [C.yellow, C.mag, C.cream] : [C.acid, C.purple, C.cream]));
    let gulp = 0;
    CARDS.forEach((c, i) => {
      const u = (t - c.ts) / CARD_T; if (u < 0 || u > 1) { if (u > 1 && u < 1.3) gulp = Math.max(gulp, 1 - (u - 1) / 0.3); return; }
      const [px, py] = RIB[c.rib](u * 0.97);
      const sc = u < 0.1 ? E.back(u / 0.1) : u > 0.82 ? 1 - E.in((u - 0.82) / 0.18) : 1;
      medallion(x, px, py, 75, c.kind, t + c.ph, { sc, rot: 0.18 * Math.sin(t * 3 + c.ph) });
      pill(x, px + 40 * sc, py + 62 * sc, c.kind, t, { sc, size: 30, fill: c.kind === 'cat' ? C.cream : C.yellow });
    });
    const wts = W0.map((w, i) => w + 0.08 * Math.sin(t * 2 + i));
    model(x, MX, MY, MR, t, { open: seg(t, 1.45, 2.7), rays: E.out(seg(t, 1.9, 2.8)), rayLen: 1.62, wts, pupil: 1 + 0.35 * gulp, look: [-0.7, 0.05 * Math.sin(t * 3)] });
    pill(x, MX, 625 - 40 * (1 - E.out(seg(t, 2.9, 3.2))), 'Model', t, { sc: E.back(seg(t, 2.9, 3.2)), size: 30, fill: C.yellow, shadow: C.blue });
    // headline
    const hp = seg(t, 2.55, 3.15);
    if (hp > 0) { const tc = txt('Training data', 60, { fill: C.yellow, line: C.ink, lw: 5, outer: C.cream, ow: 4, shadow: { dx: 5, dy: 5, col: C.mag } }); wavy(x, tc, 380, 136, { amp: 3 + 18 * (1 - E.out(hp)), freq: 0.02, ph: t * 3, bulge: 0.15, melt: (1 - E.out(hp)) * 0.6, alpha: E.out(seg(t, 2.55, 2.85)) }); }
    // counter cartouche
    const cp = seg(t, 2.85, 3.2);
    if (cp > 0) {
      x.save(); x.translate(345, 640); x.scale(E.back(cp), E.back(cp));
      blob(x, 0, 0, 315, 64, 0.03, 5, t * 2); inkFill(x, C.cream, 5, [5, 5]);
      x.restore();
      const n = Math.round(1e6 * Math.pow(seg(t, 3.0, 5.5), 2.2));
      const tc = txt(n.toLocaleString('en-US'), 70, { fill: C.mag, line: C.ink, lw: 4, shadow: { dx: 4, dy: 4, col: C.acid } });
      const done = t >= 5.5 ? 1 + 0.18 * (1 - E.out(seg(t, 5.5, 5.8))) : 1;
      wavy(x, tc, 52 + tc.w / 2 * 0.95, 634, { amp: 3, freq: 0.03, ph: t * 4, scale: 0.95 * done * E.out(cp), bulge: 0.1 });
      const te = txt('examples', 32, { font: 'Righteous', fill: C.ink });
      wavy(x, te, 568, 642, { amp: 2, freq: 0.04, ph: t * 3, alpha: E.out(cp) });
    }
  }

  function sceneB(x, W, H_, t) {
    const clash = t >= 7.8 && t < 9.55 ? 1 : 0, step = Math.floor(t * 15), jr = H.rng(500 + step);
    const harm = E.inOut(seg(t, 9.55, 10.15));
    const cols = clash ? (step % 2 ? [C.red, C.mag, C.acid] : [C.mag, C.orange, C.blue]) : harm > 0 ? [C.purple, C.yellow, C.purple, C.acid] : [C.purple, C.yellow];
    liquid(x, W, H_, t, { cx: 640 + clash * jr.range(-40, 40), cy: 390, cols, line: C.ink, lineW: 0.1, freq: 8, speed: clash ? 2.5 : 0.6, warp: 0.3 + clash * 0.22, phase: clash * jr(), fold: harm, nfold: 10, foldRot: t * 0.25 });
    x.save();
    if (clash) x.translate(jr.range(-7, 7), jr.range(-5, 5));
    const MX = 640, MY = 390, MR = 150;
    // cat picture
    medallion(x, 190, 395, 100, 'cat', t, { rot: 0.06 * Math.sin(t * 2) });
    const flip = seg(t, 9.6, 9.8);
    pill(x, 190, 535, t < 9.7 ? '?' : 'cat', t, { size: 30, sc: t < 9.6 ? 1 : Math.abs(Math.cos(flip * Math.PI)) * (t >= 9.7 ? 1.1 : 1), fill: t < 9.7 ? C.cream : C.acid });
    // arrow picture -> model
    wArrow(x, (u) => [300 + u * 160, 395], E.inOut(seg(t, 6.55, 6.95)), t, { w: 14, col: C.yellow, wob: 5, waves: 2 });
    // model with weights (petals) that adjust
    const adj = E.inOut(seg(t, 8.85, 9.5));
    const wts = W0.map((w, i) => lerp(w, W1[i], adj) + (clash ? jr.range(-0.15, 0.15) : 0));
    const pal = clash ? { p1: C.red, p2: C.orange, q1: C.mag, q2: C.acid, r1: C.red, r2: C.mag, iris: [C.red, C.acid, C.mag] } : harm > 0.5 ? { p1: C.mag, p2: C.acid, q1: C.blue, q2: C.orange } : { p1: C.mag, p2: C.acid };
    model(x, MX, MY, MR, t, { rays: 1, rayLen: 1.5, wts, rot: adj * 0.55, jit: clash, pal: Object.assign({ r1: C.orange, r2: C.blue }, pal), pupil: clash ? 1.5 : 1, look: t < 7.0 ? [-0.8, 0] : [0.8, -0.4] });
    // Guess arc
    const g0 = 6.9, gp = E.inOut(seg(t, g0, 7.3));
    wArrow(x, (u) => bez([745, 300], [790, 175], [880, 180], [925, 268], u), gp, t, { w: 13, col: C.acid, wob: 4, waves: 2 });
    // bubble with the guess
    const bs = E.back(seg(t, 7.3, 7.55)), BX = 1065, BY = 315;
    const bflip = seg(t, 9.45, 9.65), bsx = t < 9.45 ? 1 : Math.abs(Math.cos(bflip * Math.PI));
    if (bs > 0) {
      x.save(); x.translate(BX, BY); x.scale(bsx, 1); x.translate(-BX, -BY);
      bubble(x, BX, BY, 130, 92, [-168, 100], t, bs, t < 9.55 ? C.cream : C.yellow);
      const word = t < 9.55 ? 'dog?' : 'cat';
      const tc = txt(word, 66, { fill: t < 9.55 ? C.blue : C.mag, line: C.ink, lw: 4, shadow: { dx: 4, dy: 4, col: t < 9.55 ? C.orange : C.acid } });
      wavy(x, tc, BX, BY - 2, { amp: clash ? 6 : 3, freq: 0.04, ph: t * (clash ? 14 : 4), scale: bs, bulge: 0.12 });
      x.restore();
    }
    // Check: X + scribbled ring + clash
    if (t >= 7.8 && t < 9.5) {
      const rp = E.out(seg(t, 7.85, 8.25));
      x.save(); x.lineCap = 'round';
      const ring = (lw, col) => { x.beginPath(); for (let i = 0; i <= 80 * rp; i++) { const a = -2.2 + (i / 80) * TAU * 1.08, r = 1 + 0.05 * Math.sin(a * 5 + 1); x.lineTo(BX + Math.cos(a) * 172 * r, BY + 4 + Math.sin(a) * 128 * r); } x.lineWidth = lw; x.strokeStyle = col; x.stroke(); };
      ring(15, C.ink); ring(8, C.red);
      x.restore();
      crossMark(x, BX + 135, BY - 98, 34, 1 + 0.8 * (1 - E.out(seg(t, 7.8, 7.95))));
    }
    if (t >= 9.55) checkMark(x, BX + 135, BY - 98, 36, E.back(seg(t, 9.55, 9.75)));
    // Adjust: error ripple travels back to the model
    const ap = E.inOut(seg(t, 8.35, 8.85));
    const apath = (u) => bez([990, 425], [965, 650], [780, 670], [700, 545], u);
    wArrow(x, apath, ap, t, { w: 13, col: t < 9.55 ? C.red : C.orange, wob: 7, waves: 4 });
    if (t >= 8.35 && t < 9.0) { // pulse bead
      const u = seg(t, 8.35, 8.85), [px, py] = apath(E.inOut(u)), pr = 16 + 6 * Math.sin(t * 30);
      x.beginPath(); x.arc(px, py, pr, 0, TAU); inkFill(x, C.yellow, 4, [0, 0]);
    }
    // loop labels land as each phase starts; all glow once the loop closes
    const done = t >= 9.6;
    const actv = (a, b) => (done || (t >= a && t < b));
    pill(x, 835, 152, 'Guess', t, { size: 30, sc: E.back(seg(t, 6.9, 7.15)) * (actv(6.9, 7.8) ? 1.08 : 1), fill: actv(6.9, 7.8) ? C.yellow : C.cream, shadow: C.blue });
    pill(x, 1100, 470, 'Check', t, { size: 30, sc: E.back(seg(t, 7.8, 8.05)) * (actv(7.8, 8.6) ? 1.08 : 1), fill: actv(7.8, 8.6) ? C.acid : C.cream, shadow: C.blue });
    pill(x, 905, 668, 'Adjust', t, { size: 30, sc: E.back(seg(t, 8.6, 8.85)) * (actv(8.6, 9.6) ? 1.08 : 1), fill: actv(8.6, 9.6) ? C.orange : C.cream, shadow: C.blue });
    // weights label lands on the petals
    const wp = seg(t, 8.9, 9.15);
    if (wp > 0) {
      x.save(); x.lineCap = 'round'; const ey = 290 * E.out(wp) + 215 * (1 - E.out(wp)); for (const [lw, col] of [[9, C.ink], [4, C.cream]]) { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(450, 215); x.quadraticCurveTo(515, 235, 545, ey); x.stroke(); } x.beginPath(); x.arc(545, ey, 7, 0, TAU); inkFill(x, C.cream, 3, [0, 0]); x.restore();
      pill(x, 420, 200, 'weights', t, { size: 30, sc: E.back(wp), fill: C.pink, shadow: C.blue });
    }
    x.restore();
  }

  function sceneC(x, W, H_, t) {
    const c0 = 10.9, c1 = 12.3;
    const prog = E.inOut(seg(t, c0, c1)), acc = Math.round(61 + 36 * prog);
    const burst = t >= c1, bp = seg(t, c1, c1 + 0.6);
    const GX = 400, GY = 410;
    liquid(x, W, H_, t, { cx: GX, cy: GY, cols: burst ? [C.mag, C.orange, C.yellow, C.acid, C.blue, C.purple] : [C.mag, C.acid], line: C.ink, lineW: 0.1, freq: 8, speed: 0.9 + 2 * (1 - bp) * (burst ? 1 : 0), warp: 0.3, fold: burst ? E.out(bp) : 0, nfold: 12, foldRot: t * 0.3, spiral: burst ? 2 : 0 });
    // gauge: sunburst rays light up with accuracy, a flower in bloom around the number
    x.save(); x.translate(GX, GY);
    sunburst(x, 255 * (1 + 0.5 * E.out(bp) * (1 - seg(t, c1 + 0.6, c1 + 1.0) * 0.6)), t, { c1: C.yellow, c2: C.orange, lit: burst ? 1 : 0.61 + 0.36 * prog, n: 36, spin: 0 });
    x.restore();
    model(x, GX, GY, 165, t, { noEye: true, pal: { p1: C.blue, p2: C.purple, q1: C.acid, q2: C.yellow }, wts: W1, rot: prog * 1.2 });
    const pop = burst ? 1 + 0.3 * (1 - E.out(seg(t, c1, c1 + 0.45))) : 1;
    x.save(); x.translate(GX, GY); x.scale(pop, pop);
    blob(x, 0, 0, 122, 122, 0.04, 9, t * 2); inkFill(x, C.cream, 6, [5, 5]);
    const tc = txt(acc + '%', 104, { grad: [C.mag, C.mag, C.purple], line: C.ink, lw: 5, shadow: { dx: 5, dy: 5, col: C.acid } });
    wavy(x, tc, 0, 4, { amp: 3, freq: 0.03, ph: t * 4, bulge: 0.12, scale: 0.98 });
    x.restore();
    if (burst) { // emphasis: ring + sparks
      x.save(); x.lineCap = 'round';
      const rp = E.out(seg(t, c1, c1 + 0.3));
      const ring = (lw, col) => { x.beginPath(); for (let i = 0; i <= 90 * rp; i++) { const a = -1.6 + (i / 90) * TAU * 1.02, r = 1 + 0.015 * Math.sin(a * 9); x.lineTo(GX + Math.cos(a) * (136 * pop + 10) * r, GY + Math.sin(a) * (136 * pop + 10) * r); } x.lineWidth = lw; x.strokeStyle = col; x.stroke(); };
      ring(18, C.ink); ring(10, C.yellow);
      const sp = E.out(seg(t, c1, c1 + 0.8));
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + 0.2, r = 190 + sp * 160, s = 18 * (1 - seg(t, c1 + 0.5, c1 + 1.0)) + 2;
        x.save(); x.translate(GX + Math.cos(a) * r, GY + Math.sin(a) * r); x.rotate(t * 3 + i);
        x.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? s * 0.3 : s; x.lineTo(Math.cos((k / 8) * TAU) * rr, Math.sin((k / 8) * TAU) * rr); } x.closePath(); inkFill(x, i % 2 ? C.white : C.yellow, 3, [0, 0]);
        x.restore();
      }
      x.restore();
    }
    // headline
    const hp = seg(t, 10.75, 11.25);
    const th = txt('Accuracy', 62, { fill: C.yellow, line: C.ink, lw: 5, outer: C.cream, ow: 4, shadow: { dx: 5, dy: 5, col: C.blue } });
    wavy(x, th, 640, 112, { amp: 3 + 16 * (1 - E.out(hp)), freq: 0.02, ph: t * 3, bulge: 0.2, melt: (1 - E.out(hp)) * 0.6, alpha: E.out(seg(t, 10.75, 11.0)) });
    // chart panel
    const pp = E.back(seg(t, 10.7, 11.05));
    if (pp > 0) {
      x.save(); x.translate(985, 395); x.scale(pp, pp); x.rotate(0.015);
      x.beginPath(); x.roundRect(-250, -225, 500, 440, 40); inkFill(x, C.cream, 6, [7, 7]);
      x.restore();
      x.save(); x.globalAlpha = seg(t, 10.85, 11.0);
      const ox = 790, oy = 530, cw = 400, ch = 300;
      const val = (i) => 61 + 36 * (1 - Math.exp(-i / 3.2)) / (1 - Math.exp(-12 / 3.2)) + (i > 0 && i < 12 ? Math.sin(i * 2.3) * 1.6 : 0);
      const P = (i) => [ox + (i / 12) * cw, oy - ((val(i) - 50) / 50) * ch];
      x.lineCap = 'round'; x.lineJoin = 'round';
      // area + line up to progress
      const np = prog * 12, pts = [];
      for (let i = 0; i <= Math.floor(np); i++) pts.push(P(i));
      if (np % 1 > 0 && np < 12) { const a = P(Math.floor(np)), b = P(Math.ceil(np)), f = np % 1; pts.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f)]); }
      if (pts.length > 1) {
        x.beginPath(); x.moveTo(pts[0][0], oy); pts.forEach((p) => x.lineTo(p[0], p[1])); x.lineTo(pts[pts.length - 1][0], oy); x.closePath();
        const g = x.createLinearGradient(0, oy - ch, 0, oy); g.addColorStop(0, C.acid); g.addColorStop(1, C.yellow); x.fillStyle = g; x.fill();
        // stripes inside the area
        x.save(); x.clip(); x.strokeStyle = 'rgba(255,26,140,0.5)'; x.lineWidth = 6; for (let k = -10; k < 30; k++) { x.beginPath(); x.moveTo(ox + k * 26, oy); x.lineTo(ox + k * 26 + 200, oy - 300); x.stroke(); } x.restore();
        x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.lineWidth = 13; x.strokeStyle = C.ink; x.stroke(); x.lineWidth = 6; x.strokeStyle = C.mag; x.stroke();
        const cc = [C.blue, C.orange, C.purple, C.yellow];
        for (let i = 0; i <= Math.floor(np); i++) { const [px, py] = P(i); x.beginPath(); x.arc(px, py, 9, 0, TAU); inkFill(x, cc[i % 4], 3.5, [0, 0]); }
      }
      x.lineWidth = 5; x.strokeStyle = C.ink; x.beginPath(); x.moveTo(ox, oy - ch - 10); x.lineTo(ox, oy); x.lineTo(ox + cw + 10, oy); x.stroke();
      const tl = txt('training rounds', 31, { font: 'Righteous', fill: C.ink });
      wavy(x, tl, ox + cw / 2, oy + 36, { amp: 1.5, freq: 0.04, ph: t * 3 });
      const t100 = txt('100%', 28, { font: 'Righteous', fill: C.ink }); wavy(x, t100, ox + 52, oy - ch - 2, { amp: 1, freq: 0.05, ph: t * 3 });
      x.restore();
    }
    if (burst) { const fl = 1 - E.out(seg(t, c1, c1 + 0.35)); if (fl > 0) { x.fillStyle = `rgba(255,250,220,${0.42 * fl})`; x.fillRect(0, 0, W, H_); } }
  }

  function sceneD(x, W, H_, t) {
    liquid(x, W, H_, t, { cx: 640, cy: 360, cols: [C.mag, C.orange, C.yellow, C.acid, C.blue, C.purple], line: C.ink, lineW: 0.1, fold: 1, nfold: 12, foldRot: t * 0.15, freq: 7, speed: 0.6, warp: 0.28 });
    [[120, 590], [1160, 590]].forEach(([mx, my], i) => model(x, mx, my, 92, t, { open: seg(t, 13.25 + i * 0.1, 13.9 + i * 0.1), rays: E.out(seg(t, 13.3, 13.9)), rayLen: 1.5, look: [i ? -0.6 : 0.6, -0.3] }));
    const cp = E.back(seg(t, 13.1, 13.4));
    x.save(); x.translate(640, 360); x.scale(cp, cp);
    blob(x, 0, 0, 520, 205, 0.025, 6, t * 1.5); inkFill(x, C.cream, 7, [8, 8]);
    blob(x, 0, 0, 500, 187, 0.025, 6, t * 1.5); x.lineWidth = 3; x.strokeStyle = C.mag; x.stroke();
    x.restore();
    const l1 = txt('More examples', 78, { grad: [C.orange, C.mag], line: C.ink, lw: 5, shadow: { dx: 5, dy: 5, col: C.yellow } });
    const l2 = txt('better guesses', 84, { grad: [C.blue, C.purple], line: C.ink, lw: 5, shadow: { dx: 5, dy: 5, col: C.acid } });
    const total = l1.tw + 150, x0 = 640 - total / 2;
    const p1 = seg(t, 13.25, 13.75), p2 = seg(t, 13.55, 14.05);
    wavy(x, l1, x0 + l1.tw / 2, 298, { amp: 3 + 22 * (1 - E.out(p1)), freq: 0.016, ph: t * 3, bulge: 0.14, melt: (1 - E.out(p1)) * 0.7, alpha: E.out(seg(t, 13.25, 13.5)) });
    wArrow(x, (u) => [x0 + l1.tw + 22 + u * 112, 300], E.inOut(seg(t, 13.5, 13.8)), t, { w: 14, col: C.acid, wob: 4, waves: 1.5 });
    wavy(x, l2, 640, 428, { amp: 3 + 22 * (1 - E.out(p2)), freq: 0.016, ph: t * 3 + 1, bulge: 0.14, melt: (1 - E.out(p2)) * 0.7, alpha: E.out(seg(t, 13.55, 13.8)) });
  }

  // ---------- transitions ----------
  function layers(W, H_) {
    if (!cache.LA) { cache.LA = H.layer(W, H_); cache.LB = H.layer(W, H_); }
    return [cache.LA, cache.LB];
  }
  function kaleido(ctx, src, cx, cy, n, rot, zoom) {
    const sA = TAU / n;
    for (let i = 0; i < n; i++) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(i * sA + rot); if (i % 2) ctx.scale(1, -1);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 1600, -0.003, sA + 0.003); ctx.closePath(); ctx.clip();
      ctx.rotate(-rot * 1.6); ctx.scale(zoom, zoom); ctx.drawImage(src, -cx, -cy);
      ctx.restore();
    }
    ctx.save(); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; // mirror seams
    for (let i = 0; i < n; i++) { const a = i * sA + rot; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 1600, cy + Math.sin(a) * 1600); ctx.stroke(); }
    ctx.restore();
  }
  function scene(i, x, W, H_, t) { x.save(); [sceneA, sceneB, sceneC, sceneD][i](x, W, H_, t); x.restore(); }

  function explainerFn(ctx, W, H_, t) {
    const [LA, LB] = layers(W, H_), ax = LA.getContext('2d'), bx = LB.getContext('2d');
    if (t < TR1[0]) scene(0, ctx, W, H_, t);
    else if (t < TR1[1]) { // kaleidoscope rotation
      const p = seg(t, TR1[0], TR1[1]), env = Math.sin(Math.PI * p);
      const src = p < 0.5 ? LA : LB;
      scene(p < 0.5 ? 0 : 1, src.getContext('2d'), W, H_, t);
      ctx.drawImage(src, 0, 0);
      ctx.save(); ctx.globalAlpha = H.smooth(0, 0.22, p) * (1 - H.smooth(0.78, 1, p));
      kaleido(ctx, src, 640, 380, 10, (p - 0.5) * 2.4, 1 + env * 0.45);
      ctx.restore();
    } else if (t < TR2[0]) scene(1, ctx, W, H_, t);
    else if (t < TR2[1]) { // liquid melt: the next poster pours down over the old one, drips leading
      const p = seg(t, TR2[0], TR2[1]);
      scene(1, ctx, W, H_, t); scene(2, bx, W, H_, t);
      const lvl = E.inOut(p) * (H_ + 330) - 170, pts = [];
      for (let sx = -4; sx <= W + 4; sx += 4) {
        let y = lvl + 18 * Math.sin(sx * 0.009 + t * 3) + 10 * Math.sin(sx * 0.023 + 1.7);
        for (const [xk, wk, lk0] of DRIPS) { // drip tongues with filleted roots and round tips
          const d = (sx - xk) / wk, lk = lk0 * Math.min(1, p * 2.2);
          if (Math.abs(d) < 3) y += lk * (0.8 * Math.sqrt(Math.max(0, 1 - d * d)) + 0.2 * Math.exp(-d * d / 2.5));
        }
        pts.push([sx, y]);
      }
      const path = () => { ctx.beginPath(); ctx.moveTo(-10, -10); pts.forEach(([px, py]) => ctx.lineTo(px, py)); ctx.lineTo(W + 10, -10); ctx.closePath(); };
      ctx.save(); path(); ctx.clip(); ctx.drawImage(LB, 0, 0); ctx.restore();
      ctx.save(); ctx.lineJoin = 'round';
      const edge = (lw, col, off) => { ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py + off) : ctx.moveTo(px, py + off))); ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.stroke(); };
      edge(20, C.ink, 4); edge(9, C.mag, 2); edge(3, C.yellow, -4);
      ctx.restore();
    } else if (t < TR3[0]) scene(2, ctx, W, H_, t);
    else if (t < TR3[1]) { // iris ripple: rings open from the centre onto the takeaway
      const p = seg(t, TR3[0], TR3[1]), r = E.inOut(p) * 820;
      scene(2, ctx, W, H_, t); scene(3, bx, W, H_, t);
      ctx.save(); blob(ctx, 640, 360, r, r, 0.04, 8, t * 6); ctx.clip(); ctx.drawImage(LB, 0, 0); ctx.restore();
      [[C.ink, 0, 34], [C.yellow, 4, 26], [C.ink, 16, 6], [C.mag, 22, 12], [C.ink, 32, 5]].forEach(([col, off, lw]) => { blob(ctx, 640, 360, r + off, r + off, 0.04, 8, t * 6); ctx.lineWidth = lw * Math.min(1, p * 4); ctx.strokeStyle = col; ctx.stroke(); });
    } else scene(3, ctx, W, H_, t);

    // the question: melts in, holds, then shrinks into the corner header (stays put through transitions)
    const fade = 1 - seg(t, 12.85, 13.1);
    if (fade > 0) {
      const tc = titleTC(), m = E.inOut(seg(t, 1.7, 2.4)), melt = 1 - E.out(seg(t, 0.05, 1.05)), sc = lerp(1, 0.5, m);
      wavy(ctx, tc, lerp(640, 10 + (tc.w * 0.5) / 2, m), lerp(330, 44, m), { scale: sc, amp: lerp(6 + 34 * melt, 2, m), freq: lerp(0.012, 0.02, m), ph: t * 3, bulge: lerp(0.4, 0.06, m), melt: melt * 0.85, alpha: E.out(seg(t, 0.05, 0.6)) * fade });
    }
    finish(ctx, W, H_, t);
  }

  // ---------- sound: a warm phased organ drone, swirly phaser whooshes, round bass plucks ----------
  // Timings come from the explainer above (TR1/TR2/TR3, CARDS, scene seg() windows).
  // Voiceover mode (k.vo): the organ drone stays but drops to half and is minor; card plucks, counter tocks,
  // ribbon swirls and small landings are minor; transitions, the wrong guess, the correction and 97% stay full.
  function psySound(k) {
    const D = 15, VOG = k.vo ? 0.3 : 0.6;
    const hz = k.hz;
    const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.6;
    // first time an eased progress over [a,b] reaches u
    const when = (a, b, ease, u) => { for (let i = 0; i <= 400; i++) if (ease(i / 400) >= u - 1e-6) return a + ((b - a) * i) / 400; return b; };
    // organ voice: two oscillators a few Hz apart beat into a slow tremolo; resonant lowpass sweeps like a phaser
    const organ = (t, notes, dur, g, sweep) => notes.forEach((n, i) => {
      const f = hz(n), beat = 3.2 + i * 0.7;
      const f2 = sweep || [[0, 420], [dur * 0.3, 1100], [dur * 0.65, 480], [dur, 900]];
      for (const [ff, type, gg] of [[f, 'sawtooth', 0.022], [f + beat, 'triangle', 0.05], [f * 0.5 + beat * 0.25, 'sine', 0.03]])
        k.tone(t, { f: ff, type, dur, gain: gg * g * VOG, a: Math.min(0.6, dur * 0.25), hold: dur * 0.55, filter: 'lowpass', f2, q: 3.5, pan: (i - (notes.length - 1) / 2) * 0.35, verb: 0.3, minor: true });
    });
    // round bassy pluck: triangle with a closing lowpass and a sine sub
    const pluck = (t, n, g = 1, p = 0, minor = false) => {
      const f = hz(n);
      k.tone(t, { f, type: 'triangle', dur: 0.5, gain: 0.34 * g, a: 0.004, filter: 'lowpass', f2: [[0, 1600], [0.25, 320]], q: 2, pan: p, verb: 0.2, minor });
      k.tone(t, { f: f / 2, dur: 0.35, gain: 0.22 * g, a: 0.004, pan: p, minor });
    };
    // swirly phaser whoosh: filtered noise whose resonant band sweeps up and back down
    const phaser = (t, dur, g = 1, lo = 260, hi = 1500, minor = false) => {
      k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, lo], [dur * 0.5, hi], [dur, lo * 1.2]], q: 5, gain: 0.3 * g, a: dur * 0.45, verb: 0.25, minor });
      k.noise(t + 0.03, { dur, color: 'pink', filter: 'bandpass', f: [[0, lo * 1.5], [dur * 0.45, hi * 0.7], [dur, lo]], q: 7, gain: 0.2 * g, a: dur * 0.5, pan: 0.3, minor });
    };
    const tock = (t, f, g = 1, p = 0) => { k.tone(t, { f, type: 'triangle', dur: 0.08, gain: 0.16 * g, a: 0.002, pan: p, minor: true }); k.noise(t, { dur: 0.03, filter: 'bandpass', f: f * 2, q: 4, gain: 0.12 * g, a: 0.001, pan: p, minor: true }); };

    // ---- the drone: E dorian organ, one voicing per scene
    organ(0, ['E2', 'B2'], D, 1, [[0, 380], [3.5, 900], [7, 420], [11, 1000], [D, 500]]);
    organ(0.0, ['E3', 'G3', 'B3'], 6.1, 0.8);
    organ(6.0, ['A2', 'E3', 'C#4'], 1.9, 0.8);
    organ(9.55, ['D3', 'F#3', 'A3'], 0.9, 0.7);
    organ(10.3, ['E3', 'G3', 'D4'], 2.7, 0.8);
    organ(13.1, ['E3', 'G#3', 'B3'], 1.9, 0.85);

    // ---- 1 HOOK: the question melts up out of the liquid (0.05..1.05), then slides to the corner (1.7..2.4)
    k.tone(0.05, { f: [[0, 98], [0.9, 165]], type: 'triangle', dur: 1.1, gain: 0.16, a: 0.5, filter: 'lowpass', f2: [[0, 300], [0.9, 1200]], q: 4, verb: 0.3 });
    phaser(0.05, 1.0, 0.7, 200, 900);
    pluck(1.05, 'E2', 0.8); // title settles
    k.noise(1.7, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 600], [0.7, 260]], q: 1, gain: 0.08, a: 0.25, pan: -0.4, minor: true });
    // the eye opens and its colour floods out (1.5..2.9)
    phaser(1.55, 1.35, 1, 220, 1300);
    pluck(when(1.45, 2.7, (u) => u, 0.75), 'B2', 0.7, pan(950));

    // ---- 2 DATA
    pluck(2.62, 'G2', 0.7, pan(360)); // "Training data" melts in
    phaser(2.7, 0.65, 0.45, 300, 1100, true); phaser(2.85, 0.65, 0.4, 260, 900, true); // ribbons swirl on
    pluck(when(2.85, 3.2, E.back, 1), 'E2', 0.7, pan(345), true); // counter cartouche
    pluck(when(2.9, 3.2, E.back, 1), 'B2', 0.8, pan(950)); // "Model" lands
    CARDS.forEach((c, i) => {
      const p = -0.55 + c.rib * 0.15;
      pluck(c.ts + 0.05, ['E3', 'G3', 'A3', 'B3', 'D4'][i % 5], 0.4, p, true); // card pops onto the ribbon
      k.tone(c.ts + CARD_T, { f: [[0, 180], [0.12, 90]], dur: 0.16, gain: 0.12, pan: pan(900), minor: true }); // swallowed by the eye
    });
    for (let t = 3.05, last = -1; t < 5.45;) { const u = seg(t, 3.0, 5.5); tock(t, 380 + 260 * u, 0.9, pan(250)); last = t; t += 0.16 - 0.08 * u; }
    pluck(5.5, 'E2', 1.1, pan(250)); pluck(5.5, 'B2', 0.6, pan(250)); pluck(5.5, 'E3', 0.5, pan(250)); // 1,000,000

    // ---- kaleidoscope rotation (TR1)
    phaser(TR1[0] - 0.05, TR1[1] - TR1[0] + 0.15, 1.15, 220, 1700);
    k.tone(TR1[0], { f: [[0, 130], [0.35, 196], [0.7, 147]], type: 'triangle', dur: 0.75, gain: 0.1, a: 0.3, filter: 'lowpass', f2: 900, verb: 0.4 });

    // ---- 3 GUESS -> CHECK -> ADJUST
    k.noise(6.55, { dur: 0.4, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.4, 900]], q: 2, gain: 0.08, a: 0.2, pan: pan(380), minor: true }); // arrow to the eye
    pluck(when(6.9, 7.15, E.back, 1), 'G2', 0.8, pan(835)); // Guess
    k.noise(6.9, { dur: 0.4, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.4, 1100]], q: 2, gain: 0.08, a: 0.2, pan: pan(840), minor: true });
    pluck(when(7.3, 7.55, E.back, 1), 'B2', 0.9, pan(1065)); // "dog?" bubble
    // WRONG (7.8): woozy pitch-bent dip, two sour detuned saws sliding down + a soft low thud
    for (const f0 of [233, 233 * 1.06, 175])
      k.tone(7.8, { f: [[0, f0], [0.12, f0 * 1.03], [0.75, f0 * 0.62]], type: 'sawtooth', dur: 0.9, gain: 0.09, a: 0.01, hold: 0.3, filter: 'lowpass', f2: [[0, 1400], [0.8, 400]], q: 3, pan: pan(1100), verb: 0.25 });
    k.play('thud', 7.8, { f: 110, gain: 0.7, pan: pan(1100) });
    pluck(when(7.8, 8.05, E.back, 1), 'F2', 0.6, pan(1100), true); // Check lands
    // the clash: a sour beating drone under the jitter (tritone, fast beat)
    k.tone(7.85, { f: 'Bb2', type: 'sawtooth', dur: 1.7, gain: 0.03 * VOG, a: 0.1, hold: 1.3, filter: 'lowpass', f2: 700, pan: -0.3, minor: true });
    k.tone(7.85, { f: hz('E3') + 7, type: 'sawtooth', dur: 1.7, gain: 0.03 * VOG, a: 0.1, hold: 1.3, filter: 'lowpass', f2: 700, pan: 0.3, minor: true });
    // error ripple travels back (8.35..8.85): a descending phaser sweep with a low glide
    k.noise(8.35, { dur: 0.55, color: 'pink', filter: 'bandpass', f: [[0, 1400], [0.5, 240]], q: 6, gain: 0.3, a: 0.15, pan: pan(900), verb: 0.2 });
    k.tone(8.35, { f: [[0, 260], [0.5, 110]], type: 'triangle', dur: 0.55, gain: 0.14, a: 0.05, pan: pan(800) });
    pluck(when(8.6, 8.85, E.back, 1), 'A2', 0.7, pan(905)); // Adjust lands
    // petals (weights) re-tune: four round plucks climbing as they turn (8.85..9.5)
    ['E2', 'G2', 'A2', 'B2'].forEach((n, i) => pluck(when(8.85, 9.5, E.inOut, (i + 1) / 4) - 0.04, n, 0.55, pan(640) + (i - 1.5) * 0.12, true));
    pluck(when(8.9, 9.15, E.back, 1), 'D3', 0.45, pan(420), true); // "weights" label
    // RIGHT (9.55): bright major chord swell as the swirl folds into a mandala
    ['E3', 'G#3', 'B3', 'E4'].forEach((n, i) => {
      k.tone(9.55, { f: n, type: 'triangle', dur: 1.3, gain: 0.07, a: 0.12, hold: 0.4, filter: 'lowpass', f2: [[0, 700], [0.4, 2000], [1.3, 900]], q: 1.5, pan: (i - 1.5) * 0.3, verb: 0.4 });
      k.tone(9.55, { f: hz(n) + 2.5, dur: 1.3, gain: 0.05, a: 0.15, hold: 0.4, pan: (i - 1.5) * 0.3 });
    });
    pluck(9.55, 'E2', 0.9);

    // ---- liquid melt (TR2): the new poster pours down, a gloopy falling slide with drips
    k.noise(TR2[0], { dur: 0.75, color: 'pink', filter: 'bandpass', f: [[0, 900], [0.7, 200]], q: 4, gain: 0.32, a: 0.2, verb: 0.2 });
    k.tone(TR2[0], { f: [[0, 330], [0.7, 98]], type: 'sine', dur: 0.75, gain: 0.14, a: 0.1 });
    [0.25, 0.42, 0.6].forEach((d, i) => k.tone(TR2[0] + d, { f: [[0, 520 - i * 60], [0.07, 200]], dur: 0.1, gain: 0.1, pan: (i - 1) * 0.5, minor: true }));

    // ---- 4 PROGRESS
    pluck(when(10.7, 11.05, E.back, 1), 'G2', 0.6, pan(985), true); // chart panel
    pluck(10.8, 'B2', 0.7, pan(575)); // "Accuracy"
    for (let t = 10.9, last = 61, lastT = -1; t < 12.3; t += 1 / 120) {
      const v = Math.round(61 + 36 * E.inOut(seg(t, 10.9, 12.3)));
      if (v !== last && t - lastT >= 1 / 11) { tock(t, 300 + (v - 61) * 7, 1, pan(400)); last = v; lastT = t; }
    }
    // 97% (12.3): big shimmering bloom: low impact + a wide detuned E-major chord swelling in
    k.play('impact', 12.3, { gain: 1.15, pan: pan(400) });
    ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'].forEach((n, i) => {
      for (const d of [-3, 3]) k.tone(12.3, { f: hz(n) + d * (1 + i * 0.3), type: i < 2 ? 'triangle' : 'sine', dur: 1.6, gain: 0.065, a: 0.06, hold: 0.5, filter: 'lowpass', f2: [[0, 2200], [1.6, 700]], pan: (i - 2.5) * 0.25 + d * 0.05, verb: 0.5 });
    });
    k.noise(12.3, { dur: 1.2, color: 'pink', filter: 'bandpass', f: [[0, 2000], [1.2, 700]], q: 3, gain: 0.08, a: 0.05, verb: 0.5 });

    // ---- iris ripple (TR3) onto the takeaway
    phaser(TR3[0] - 0.05, 0.6, 0.9, 260, 1500);

    // ---- 5 TAKEAWAY
    pluck(13.3, 'E2', 0.8); // "More examples" melts in
    k.noise(13.5, { dur: 0.3, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.3, 1000]], q: 2, gain: 0.08, a: 0.12, pan: 0.4, minor: true }); // arrow
    pluck(13.6, 'B2', 0.85); // "better guesses"
    ['E3', 'G#3', 'B3'].forEach((n, i) => k.tone(13.95, { f: n, type: 'triangle', dur: 1.05, gain: 0.08, a: 0.05, hold: 0.5, filter: 'lowpass', f2: 1400, pan: (i - 1) * 0.3, verb: 0.4 }));
    pluck(13.95, 'E2', 0.9);
  }

  registerStyle({
    id: 'psychedelic',
    name: 'Psychedelic Poster',
    category: 'Cosmic & Psychedelic',
    description: '1960s San Francisco concert-poster psychedelia: full-strength inks in vibrating complementary pairs, liquid churning ring bands, sunbursts and a mirror-symmetric eye-flower, with bulbous melting Shrikhand lettering on worn poster stock.',
    motion: 'Colour ripples out from the centre, petals unfurl and the eye opens, then the lettering melts into place while the liquid bands keep slowly churning.',
    fonts: ['400 138px "Shrikhand"', '400 34px "Righteous"'],
    duration: 6,
    frameT: 5.6,
    readsPixels: true,
    draw(ctx, W, H_, t) { poster(ctx, W, H_, t); },
    explainerDuration: 15,
    explainerNote: 'The model is a giant eye-flower whose petals are its weights: examples ride striped ribbons into it, the wrong guess makes the inks clash and jitter, the correction folds the swirl into a symmetric mandala, 97% bursts into a kaleidoscope sunburst; scenes change by kaleidoscope rotation, a liquid melt and an iris ripple.',
    explainer(ctx, W, H_, t) { explainerFn(ctx, W, H_, t); },
    explainerSound(k) { psySound(k); },
  });
}
