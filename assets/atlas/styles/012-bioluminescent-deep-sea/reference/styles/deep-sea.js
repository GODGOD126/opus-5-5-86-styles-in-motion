{
  // ================= BIOLUMINESCENT DEEP SEA =================
  // The midnight zone: near-black water, drifting marine snow in parallax, and living light
  // (jellyfish, siphonophores, comb jellies, an anglerfish lure). All light is additive.
  const TAU = Math.PI * 2;
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const sm = (a, b, x) => H.smooth(a, b, x);
  const E = H.ease;
  const lerp = H.lerp;
  const WH = [255, 255, 255];
  const C = {
    cyan: [80, 232, 255], teal: [40, 230, 195], blue: [70, 140, 255], violet: [150, 120, 255],
    mag: [255, 80, 205], amber: [255, 172, 70], red: [255, 74, 60], snow: [178, 206, 228], green: [110, 255, 190],
    ice: [190, 250, 255],
  };
  const F = {
    title: (px) => `600 ${px}px "Fraunces"`,
    titleI: (px) => `italic 600 ${px}px "Fraunces"`,
    num: (px) => `700 ${px}px "Fraunces"`,
    label: (px) => `700 ${px}px "Space Grotesk"`,
    hud: (px) => `400 ${px}px "IBM Plex Mono"`,
  };
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const hsl = (h, s, l) => {
    h = (((h % 360) + 360) % 360) / 360;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
  };

  // ---------- glow sprites ----------
  const SPR = {};
  function spr(rgb, kind) {
    const key = kind + rgb.map((v) => v | 0).join(',');
    if (SPR[key]) return SPR[key];
    const S = 64, c = H.layer(S, S), x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    const hot = H.mix(rgb, WH, 0.6);
    if (kind === 'core') {
      g.addColorStop(0, H.rgba(WH, 1)); g.addColorStop(0.1, H.rgba(hot, 0.9)); g.addColorStop(0.3, H.rgba(rgb, 0.35));
      g.addColorStop(0.6, H.rgba(rgb, 0.08)); g.addColorStop(1, H.rgba(rgb, 0));
    } else if (kind === 'bokeh') {
      g.addColorStop(0, H.rgba(rgb, 0.45)); g.addColorStop(0.7, H.rgba(rgb, 0.55)); g.addColorStop(0.88, H.rgba(rgb, 0.8)); g.addColorStop(1, H.rgba(rgb, 0));
    } else { // soft gaussian-ish glow
      g.addColorStop(0, H.rgba(hot, 1)); g.addColorStop(0.12, H.rgba(rgb, 0.75)); g.addColorStop(0.35, H.rgba(rgb, 0.22));
      g.addColorStop(0.65, H.rgba(rgb, 0.05)); g.addColorStop(1, H.rgba(rgb, 0));
    }
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    return (SPR[key] = c);
  }
  function dot(ctx, x, y, r, rgb, a, kind) {
    if (a <= 0.004 || r <= 0.2) return;
    const ga = ctx.globalAlpha;
    ctx.globalAlpha = Math.min(1, a);
    ctx.drawImage(spr(rgb, kind || 'soft'), x - r, y - r, 2 * r, 2 * r);
    ctx.globalAlpha = ga;
  }

  // ---------- far, out-of-focus layer: drawn at 1/3 size, blurred once, scaled up (cheap depth of field) ----------
  let FAR = null;
  function far(ctx, W, Hh, fn, a, blur) {
    if (a <= 0.004) return;
    const fw = Math.ceil(W / 3), fh = Math.ceil(Hh / 3);
    if (!FAR || FAR.w !== fw) { FAR = { w: fw, a: H.layer(fw, fh), b: H.layer(fw, fh) }; }
    const xa = FAR.a.getContext('2d'), xb = FAR.b.getContext('2d');
    xa.setTransform(1, 0, 0, 1, 0, 0); xa.globalAlpha = 1; xa.globalCompositeOperation = 'source-over'; xa.clearRect(0, 0, fw, fh);
    xa.setTransform(1 / 3, 0, 0, 1 / 3, 0, 0); fn(xa); xa.setTransform(1, 0, 0, 1, 0, 0);
    xb.setTransform(1, 0, 0, 1, 0, 0); xb.globalCompositeOperation = 'source-over'; xb.clearRect(0, 0, fw, fh);
    xb.filter = `blur(${blur == null ? 1 : blur}px)`; xb.drawImage(FAR.a, 0, 0); xb.filter = 'none';
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, a); ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(FAR.b, 0, 0, fw * 3, fh * 3); ctx.restore();
  }

  // explainer's far animals: pre-blurred sprites (rendered once at half size)
  const FARJ = [
    { x: 1170, y: 660, s: 30, ph: 0.3, on: 0.42, col: C.blue, tent: 7, tl: 80, dr: 0.21, sw: 18, v: 3 },
    { x: 96, y: 470, s: 22, ph: 0.7, on: 0.38, col: C.teal, tent: 6, tl: 58, tilt: 0.3, dr: 0.17, sw: 14, v: 2 },
    { x: 760, y: 620, s: 26, ph: 0.5, on: 0.35, col: C.violet, tent: 6, tl: 64, tilt: -0.2, dr: 0.13, sw: 30, v: 4 },
  ];
  const FSPR = {};
  function blurSprite(w, h, sc, blur, fn) {
    const cw = Math.ceil(w * sc), ch = Math.ceil(h * sc), a = H.layer(cw, ch), b = H.layer(cw, ch);
    const xa = a.getContext('2d'); xa.setTransform(sc, 0, 0, sc, 0, 0); fn(xa);
    const xb = b.getContext('2d'); xb.filter = `blur(${blur}px)`; xb.drawImage(a, 0, 0); xb.filter = 'none';
    return b;
  }
  function farJelly(i, J) {
    if (FSPR['j' + i]) return FSPR['j' + i];
    const w = J.s * 5, h = J.s * 2.6 + J.tl + 30, ox = w / 2, oy = J.s * 2.3;
    const cv = blurSprite(w, h, 0.5, 1.4, (x) => { jelly(x, { x: ox, y: oy, s: J.s, t: 1.3 + i, ph: J.ph, on: 1, col: J.col, tent: J.tent, tl: J.tl }); });
    return (FSPR['j' + i] = { cv, w, h, ox, oy });
  }
  function farStrand() {
    if (FSPR.strand) return FSPR.strand;
    const w = 1280, h = 1100, ch = [];
    for (let i = 0; i < 16; i++) { const f = i / 15; ch.push([1240 - f * 230 + Math.sin(f * 3) * 22, f * 1000]); }
    const cv = blurSprite(w, h, 1 / 3, 1.1, (x) => siph(x, ch, 0.7, (i) => 0.3 + 0.3 * Math.sin(-i * 0.5), 0.8, 0.36, C.violet, C.blue));
    return (FSPR.strand = { cv, w, h });
  }

  // ---------- water ----------
  let HAZE = null;
  function haze() {
    if (HAZE) return HAZE;
    const w = 160, h = 90, c = H.layer(w, h), x = c.getContext('2d'), nz = H.makeNoise(5150), img = x.createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const v = cl(nz.fbm2(i * 0.025, j * 0.04, 4) * 0.7 + 0.45), k = (j * w + i) * 4;
      img.data[k] = 20; img.data[k + 1] = 70; img.data[k + 2] = 105; img.data[k + 3] = 255 * v * v;
    }
    x.putImageData(img, 0, 0);
    return (HAZE = c);
  }
  function water(ctx, W, Hh, t, depth, rays) {
    const top = H.mix([12, 44, 74], [3, 12, 26], depth), mid = H.mix([4, 20, 40], [1, 6, 15], depth);
    const g = ctx.createLinearGradient(0, 0, 0, Hh);
    g.addColorStop(0, H.rgba(top)); g.addColorStop(0.5, H.rgba(mid)); g.addColorStop(1, 'rgb(0,2,6)');
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.max(0.11, 0.16 * (1 - depth * 0.55));
    ctx.drawImage(haze(), -60 + Math.sin(t * 0.13) * 40, -30 + Math.cos(t * 0.1) * 20, W + 120, Hh + 60);
    // the last of the daylight scattering down from above: gives the midnight zone volume instead of flat black
    ctx.globalAlpha = 1;
    const vf = ctx.createLinearGradient(0, 0, 0, Hh * 0.55);
    vf.addColorStop(0, 'rgba(14,52,84,0.2)'); vf.addColorStop(0.45, 'rgba(10,40,70,0.07)'); vf.addColorStop(1, 'rgba(10,40,70,0)');
    ctx.fillStyle = vf; ctx.fillRect(0, 0, W, Hh * 0.55);
    if (rays > 0.01) {
      for (let i = 0; i < 7; i++) {
        const xc = 90 + i * 190 + Math.sin(t * 0.35 + i * 2.1) * 35, wt = 18 + (i % 3) * 16, len = 360 + (i % 2) * 120;
        const fl = 0.55 + 0.45 * Math.sin(t * 0.9 + i * 1.7);
        const gr = ctx.createLinearGradient(0, 0, 0, len);
        gr.addColorStop(0, `rgba(110,195,225,${0.075 * rays * fl})`); gr.addColorStop(1, 'rgba(110,195,225,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.beginPath();
        ctx.moveTo(xc - wt, -5); ctx.lineTo(xc + wt, -5); ctx.lineTo(xc + wt * 2.6 + len * 0.22, len); ctx.lineTo(xc - wt * 1.4 + len * 0.22, len); ctx.fill();
      }
      // surface shimmer far above
      ctx.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) {
        ctx.strokeStyle = `rgba(140,215,240,${0.05 * rays})`; ctx.beginPath();
        for (let x = 0; x <= W; x += 16) ctx.lineTo(x, 8 + k * 7 + Math.sin(x * 0.02 + t * 1.3 + k * 2) * 3 + Math.sin(x * 0.051 - t * 0.9) * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  // ---------- marine snow (3 parallax layers, near layer out of focus) ----------
  let SNOW = null;
  function snowData() {
    if (SNOW) return SNOW;
    const R = H.rng(4242);
    const spec = [
      { n: 260, z: 0.3, r: [0.5, 1.1], a: [0.14, 0.38], v: [3, 8] },
      { n: 110, z: 0.65, r: [0.9, 1.9], a: [0.28, 0.58], v: [6, 13] },
      { n: 16, z: 1.6, r: [7, 22], a: [0.035, 0.09], v: [10, 22], bokeh: true },
    ];
    SNOW = spec.map((L) => ({ ...L, ps: Array.from({ length: L.n }, () => ({
      x: R() * 1400, y: R() * 840, r: R.range(L.r[0], L.r[1]), a: R.range(L.a[0], L.a[1]), v: R.range(L.v[0], L.v[1]),
      ph: R() * TAU, f: R.range(0.2, 0.7), sw: R.range(2, 9),
    })) }));
    return SNOW;
  }
  function snow(ctx, W, Hh, t, camY, camX, vel, lights, amt) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    const spanY = Hh + 120, spanX = W + 120;
    for (const L of snowData()) for (const p of L.ps) {
      const y = (((p.y + t * p.v - camY * L.z) % spanY) + spanY) % spanY - 60;
      const x = (((p.x + Math.sin(t * p.f + p.ph) * p.sw - camX * L.z) % spanX) + spanX) % spanX - 60;
      const a = p.a * amt;
      let lit = 0, lc = null;
      if (lights) for (const l of lights) { const d = Math.hypot(x - l.x, y - l.y); if (d < l.r) { const v = l.k * (1 - d / l.r) ** 2; if (v > lit) { lit = v; lc = l.col; } } }
      const st = vel * L.z * 0.045;
      if (L.bokeh) { dot(ctx, x, y, p.r * (1 + Math.min(2, Math.abs(st) * 0.01)), lc && lit > 0.05 ? lc : C.snow, a + lit * 0.12, 'bokeh'); continue; }
      if (Math.abs(st) > 2.5) {
        ctx.globalAlpha = cl((a + lit) * 1.4 / (1 + Math.abs(st) * 0.03));
        ctx.strokeStyle = 'rgb(178,206,228)'; ctx.lineWidth = p.r * 1.3;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + st); ctx.stroke();
      } else {
        dot(ctx, x, y, p.r * 2.8, C.snow, a);
        if (lit > 0.02) dot(ctx, x, y, p.r * 3.5, lc, lit);
      }
    }
    ctx.restore();
  }

  // ---------- generic plankton sparkle (twinkles where something moves) ----------
  function sparkles(ctx, cx, cy, rx, ry, t, seed, n, a, col, rate) {
    if (a <= 0.01) return;
    const R = H.rng(seed);
    for (let i = 0; i < n; i++) {
      const ang = R() * TAU, rr = Math.sqrt(R()), ph = R() * TAU, sp = (rate || 3) * (0.6 + R()), sz = R.range(3, 7);
      const fl = Math.pow(Math.max(0, Math.sin(t * sp + ph)), 6);
      if (fl < 0.02) continue;
      dot(ctx, cx + Math.cos(ang) * rr * rx, cy + Math.sin(ang) * rr * ry, sz, col || C.cyan, a * fl, 'core');
    }
  }

  // ---------- jellyfish ----------
  const NET = (() => {
    const R = H.rng(919), nodes = [], edges = [];
    [[0.3, 3], [0.56, 5], [0.8, 7]].forEach(([rr, n], li) => {
      for (let i = 0; i < n; i++) {
        const a = lerp(0.3, Math.PI - 0.3, i / (n - 1)) + R.range(-0.06, 0.06);
        nodes.push({ u: Math.cos(a) * rr, v: Math.sin(a) * rr * 0.98 + 0.04, L: li });
      }
    });
    nodes.push({ u: 0, v: 0.12, L: -1 }); // hub just above the rim centre
    const hub = nodes.length - 1;
    nodes.forEach((n, i) => {
      if (n.L < 0) return;
      if (n.L === 0) edges.push({ a: hub, b: i });
      const next = nodes.map((m, j) => ({ j, m })).filter((o) => o.m.L === n.L + 1)
        .sort((p, q) => Math.hypot(p.m.u - n.u, p.m.v - n.v) - Math.hypot(q.m.u - n.u, q.m.v - n.v)).slice(0, 2);
      next.forEach((o) => edges.push({ a: i, b: o.j }));
      // a few lateral links within the ring
      const same = nodes.map((m, j) => ({ j, m })).filter((o) => o.m.L === n.L && o.j > i).sort((p, q) => Math.abs(p.m.u - n.u) - Math.abs(q.m.u - n.u));
      if (same.length && R() < 0.5) edges.push({ a: i, b: same[0].j });
    });
    edges.forEach((e) => { e.w0 = R.range(0.15, 1); e.w1 = cl(e.w0 + R.range(-0.7, 0.7), 0.12, 1); });
    return { nodes, edges, hub };
  })();

  function jelly(ctx, J) {
    const on = J.on == null ? 1 : J.on;
    if (on <= 0.003) return null;
    const { x, s, t } = J, col = J.col || C.cyan, acc = J.acc || C.mag, hot = H.mix(col, WH, 0.45);
    const c = Math.pow(0.5 + 0.5 * Math.sin(TAU * (t * (J.rate || 0.45) + (J.ph || 0))), 2);
    const w = s * (1 - 0.12 * c), h = s * 0.8 * (1 + 0.08 * c), y = J.y - c * s * 0.04;
    const rimY = (u) => y + h * 0.12 * Math.sqrt(Math.max(0, 1 - u * u));
    ctx.save();
    ctx.translate(x, y); ctx.rotate(J.tilt || 0); ctx.translate(-x, -y);
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // --- tentacles (behind the bell)
    const n = J.tent || 14, TL = J.tl || s * 2;
    for (let i = 0; i < n; i++) {
      const u = -0.92 + 1.84 * i / (n - 1), bx = x + u * w, by = rimY(u), L = TL * (0.6 + 0.4 * hash(i + 3.3));
      const pts = [];
      for (let j = 0; j <= 24; j++) {
        const f = j / 24;
        pts.push([bx + u * w * 0.22 * f + Math.sin(t * 1.6 - f * 6.5 + i * 1.9) * s * 0.11 * f + (J.sway || 0) * f * f * L, by + f * L * (1 - 0.1 * c)]);
      }
      const tg = ctx.createLinearGradient(0, by, 0, by + L);
      tg.addColorStop(0, H.rgba(col, 0.5 * on)); tg.addColorStop(0.5, H.rgba(col, 0.22 * on)); tg.addColorStop(1, H.rgba(col, 0));
      ctx.globalAlpha = 1; ctx.strokeStyle = tg;
      ctx.lineWidth = 5; ctx.globalAlpha = 0.18; ctx.beginPath(); pts.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
      ctx.lineWidth = 1.1; ctx.globalAlpha = 1; ctx.stroke();
      // light beads travelling down the tentacle
      const fb = (t * 0.42 + hash(i) ) % 1, pb = pts[Math.min(24, Math.round(fb * 24))];
      dot(ctx, pb[0], pb[1], 8, col, 0.75 * on * (1 - fb));
    }
    // --- oral arms: frilly translucent ribbons
    for (let k = 0; k < 4; k++) {
      const ox = x + (k - 1.5) * w * 0.12, L = TL * 0.42, oc = H.mix(col, acc, 0.35);
      ctx.beginPath();
      for (let j = 0; j <= 20; j++) { const f = j / 20; ctx.lineTo(ox + Math.sin(t * 1.2 - f * 4 + k * 1.3) * s * 0.07 * f + (k - 1.5) * s * 0.05 * f + (J.sway || 0) * f * f * L * 0.6, y + h * 0.08 + f * L); }
      ctx.globalAlpha = 1; ctx.strokeStyle = H.rgba(oc, 0.06 * on); ctx.lineWidth = s * 0.09; ctx.stroke();
      ctx.strokeStyle = H.rgba(oc, 0.2 * on); ctx.lineWidth = 1.4; ctx.stroke();
    }

    // --- bell
    const bellPath = (k, dy) => {
      ctx.beginPath(); ctx.moveTo(x - w * k, y + dy);
      ctx.bezierCurveTo(x - w * k * 1.03, y - h * k * 0.72 + dy, x - w * k * 0.62, y - h * k * 1.02 + dy, x, y - h * k * 1.02 + dy);
      ctx.bezierCurveTo(x + w * k * 0.62, y - h * k * 1.02 + dy, x + w * k * 1.03, y - h * k * 0.72 + dy, x + w * k, y + dy);
    };
    bellPath(1, 0);
    const N = 16;
    for (let i = 1; i <= N; i++) { const u1 = 1 - 2 * i / N, um = 1 - (2 * i - 1) / N; ctx.quadraticCurveTo(x + um * w, rimY(um) + h * 0.07, x + u1 * w, rimY(u1)); }
    ctx.closePath();
    const bg = ctx.createRadialGradient(x, y - h * 0.42, 0, x, y - h * 0.42, w * 1.08);
    bg.addColorStop(0, H.rgba(col, 0.07 * on)); bg.addColorStop(0.6, H.rgba(col, 0.1 * on)); bg.addColorStop(0.86, H.rgba(col, 0.24 * on)); bg.addColorStop(1, H.rgba(col, 0));
    ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fill();
    // subumbrella (inner dome) + radial canals
    ctx.strokeStyle = H.rgba(col, 0.16 * on); ctx.lineWidth = 1.2; bellPath(0.7, h * 0.06); ctx.stroke();
    for (let i = 0; i < 9; i++) {
      const u = -0.88 + 1.76 * i / 8;
      ctx.beginPath(); ctx.moveTo(x + u * w * 0.1, y - h * 0.97); ctx.quadraticCurveTo(x + u * w * 0.82, y - h * 0.85 * Math.sqrt(1 - u * u * 0.6), x + u * w * 0.98, rimY(u));
      ctx.strokeStyle = H.rgba(col, 0.1 * on); ctx.lineWidth = 1; ctx.stroke();
    }
    // gonads: glowing horseshoes (magenta accent)
    if (J.gon) for (let k = -1; k <= 1; k++) {
      const gx = x + k * w * 0.36, gy = y - h * (0.42 - Math.abs(k) * 0.06), gr = w * 0.11;
      ctx.beginPath(); ctx.ellipse(gx, gy, gr, gr * 0.75, 0, 0, TAU);
      ctx.strokeStyle = H.rgba(acc, 0.12 * on * J.gon); ctx.lineWidth = 9; ctx.stroke();
      ctx.strokeStyle = H.rgba(H.mix(acc, WH, 0.3), 0.4 * on * J.gon); ctx.lineWidth = 2; ctx.stroke();
    }
    // rim: bright margin + back rim ellipse
    bellPath(1, 0);
    ctx.strokeStyle = H.rgba(col, 0.1 * on); ctx.lineWidth = 10; ctx.stroke();
    ctx.strokeStyle = H.rgba(hot, 0.6 * on); ctx.lineWidth = 1.8; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y, w, h * 0.12, 0, Math.PI, TAU); ctx.strokeStyle = H.rgba(col, 0.18 * on); ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y, w, h * 0.12, 0, 0, Math.PI); ctx.strokeStyle = H.rgba(hot, 0.5 * on); ctx.lineWidth = 2; ctx.stroke();
    // marginal light organs with a chasing pulse
    for (let i = 0; i <= 26; i++) {
      const u = -1 + 2 * i / 26, pul = Math.pow(Math.max(0, Math.sin(u * 5 - t * 4 + (J.ph || 0) * 9)), 6);
      dot(ctx, x + u * w, rimY(u), 5 + pul * 8, i % 5 === 2 ? acc : col, (0.35 + 0.65 * pul) * on);
    }

    // --- nerve net (the model's "weights")
    let pos = null;
    if (J.net) {
      const Nn = J.net, na = Nn.a == null ? 1 : Nn.a;
      pos = NET.nodes.map((nd) => [x + nd.u * w, y - nd.v * h * 0.98]);
      NET.edges.forEach((e, i) => {
        const p = pos[e.a], q = pos[e.b], wg = Nn.ew ? Nn.ew(e, i) : e.w0, ec = Nn.ec ? Nn.ec(e, i) : col;
        const a = (0.2 + 0.6 * wg) * on * na;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = H.rgba(ec, a * 0.22); ctx.lineWidth = 3 + wg * 6; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
        ctx.strokeStyle = H.rgba(H.mix(ec, WH, 0.35), a); ctx.lineWidth = 0.6 + wg * 2.2; ctx.stroke();
        const pu = Nn.pulse ? Nn.pulse(e, i) : -1;
        if (pu >= 0 && pu <= 1) dot(ctx, lerp(p[0], q[0], pu), lerp(p[1], q[1], pu), 14, Nn.pc || ec, on * na, 'core');
      });
      pos.forEach((p, i) => {
        const act = Nn.act ? Nn.act(i) : 0.5, nc = Nn.nc ? Nn.nc(i) : col;
        dot(ctx, p[0], p[1], 14 + act * 26, nc, (0.3 + 0.7 * act) * on * na);
        dot(ctx, p[0], p[1], 5 + act * 4, nc, (0.55 + 0.45 * act) * on * na, 'core');
      });
    }
    // halo around the whole animal
    dot(ctx, x, y - h * 0.4, w * 2.1, col, 0.09 * on);
    ctx.restore();
    return { x, y, w, h, pos };
  }

  // ---------- siphonophore chain ----------
  function siph(ctx, pts, t, lit, sc, a, colDim, colLit) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    colDim = colDim || C.violet; colLit = colLit || C.cyan;
    // stem
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.globalAlpha = 1; ctx.strokeStyle = H.rgba(colDim, 0.12 * a); ctx.lineWidth = 6 * sc; ctx.stroke();
    ctx.strokeStyle = H.rgba(H.mix(colDim, WH, 0.3), 0.4 * a); ctx.lineWidth = 1.2; ctx.stroke();
    pts.forEach((p, i) => {
      const q = pts[Math.max(0, i - 1)], r = pts[Math.min(pts.length - 1, i + 1)], ang = Math.atan2(r[1] - q[1], r[0] - q[0]);
      const L = cl(lit(i)), col = H.mix(colDim, colLit, L), al = a * (0.35 + 0.65 * L);
      const wob = Math.sin(t * 2.2 - i * 0.7) * 0.12;
      // dangling filaments
      ctx.globalAlpha = 1; ctx.strokeStyle = H.rgba(col, 0.22 * al); ctx.lineWidth = 0.9;
      for (const sd of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(p[0], p[1]);
        for (let j = 1; j <= 8; j++) ctx.lineTo(p[0] + sd * j * 1.5 * sc + Math.sin(t * 1.8 + j * 0.8 + i) * 3 * sc, p[1] + j * 5 * sc);
        ctx.stroke();
      }
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang + wob);
      const rx = 15 * sc, ry = 10 * sc;
      const g = ctx.createRadialGradient(-rx * 0.2, 0, 0, 0, 0, rx);
      g.addColorStop(0, H.rgba(col, 0.32 * al)); g.addColorStop(0.75, H.rgba(col, 0.1 * al)); g.addColorStop(1, H.rgba(col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = H.rgba(H.mix(col, WH, 0.4), 0.65 * al); ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, -Math.PI * 0.85, Math.PI * 0.85); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(rx * 0.15, 0, rx * 0.55, ry * 0.55, 0, 0, TAU); ctx.strokeStyle = H.rgba(col, 0.35 * al); ctx.stroke();
      ctx.restore();
      dot(ctx, p[0], p[1], 26 * sc * (1 + L * 0.8), col, al * 0.55);
      dot(ctx, p[0], p[1], 7 * sc, col, al * (0.25 + 0.75 * L), 'core');
    });
    ctx.restore();
  }

  // ---------- comb jelly (ctenophore) with rainbow cilia ripples ----------
  function comb(ctx, x, y, s, t, a, tilt) {
    if (a <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt || 0); ctx.globalCompositeOperation = 'lighter';
    const rx = s * 0.62, ry = s;
    const g = ctx.createRadialGradient(0, -ry * 0.2, 0, 0, 0, ry);
    g.addColorStop(0, `rgba(150,200,255,${0.05 * a})`); g.addColorStop(0.8, `rgba(150,200,255,${0.08 * a})`); g.addColorStop(1, 'rgba(150,200,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = `rgba(170,215,255,${0.25 * a})`; ctx.lineWidth = 1.2; ctx.stroke();
    // trailing tentacles
    for (const sd of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(sd * rx * 0.3, ry * 0.2);
      for (let j = 1; j <= 20; j++) ctx.lineTo(sd * (rx * 0.3 + j * 2.5) + Math.sin(t * 1.5 - j * 0.4) * 6, ry * 0.2 + j * s * 0.09);
      ctx.strokeStyle = `rgba(170,215,255,${0.16 * a})`; ctx.lineWidth = 1; ctx.stroke();
    }
    [-0.92, -0.62, -0.25, 0.25, 0.62, 0.92].forEach((u, row) => {
      for (let j = 0; j < 15; j++) {
        const th = lerp(0.35, 2.75, j / 14), px = u * rx * Math.sin(th), py = -ry * Math.cos(th);
        const wave = Math.pow(0.5 + 0.5 * Math.sin(th * 7 - t * 8 + row * 0.9), 3);
        const col = hsl(th * 110 - t * 260 + row * 45, 1, 0.62);
        dot(ctx, px, py, 3 + wave * 6, col, a * (0.2 + 0.8 * wave) * (1 - Math.abs(u) * 0.35), 'core');
      }
    });
    ctx.restore();
  }

  // ---------- anglerfish (dark silhouette lit only by its own lure) ----------
  function angler(ctx, x, y, s, t, lure, a, flip) {
    const k = s / 100, dir = flip ? -1 : 1;
    const lx = 98, ly = -100 + Math.sin(t * 1.4) * 5 + Math.sin(t * 0.7) * 3;
    const wl = [x + lx * k * dir, y + ly * k];
    ctx.save(); ctx.globalAlpha = a;
    ctx.translate(x, y); ctx.scale(k * dir, k);
    // lure light falling on the water around it
    ctx.globalCompositeOperation = 'lighter';
    dot(ctx, lx, ly, 330, C.amber, 0.16 * lure * a);
    ctx.globalCompositeOperation = 'source-over';
    const body = () => {
      ctx.beginPath(); ctx.moveTo(-118, -6);
      ctx.lineTo(-168, -46); ctx.quadraticCurveTo(-160, 0, -168, 44); ctx.lineTo(-118, 8);
      ctx.bezierCurveTo(-90, 48, -10, 74, 62, 58);
      ctx.quadraticCurveTo(92, 48, 102, 16);       // lower jaw tip
      ctx.quadraticCurveTo(60, 20, 42, 8);          // inside of mouth
      ctx.quadraticCurveTo(64, -6, 90, -14);        // upper jaw tip
      ctx.bezierCurveTo(78, -62, -20, -78, -118, -6);
      ctx.closePath();
    };
    // dorsal fin (behind the body): a dim, ragged membrane catching a little lure light
    ctx.beginPath(); ctx.moveTo(-40, -58); ctx.quadraticCurveTo(-64, -84, -96, -70); ctx.quadraticCurveTo(-92, -48, -108, -22); ctx.lineTo(-64, -42); ctx.closePath();
    ctx.fillStyle = 'rgba(9,9,12,0.92)'; ctx.fill();
    ctx.strokeStyle = `rgba(190,140,96,${0.05 + 0.12 * lure})`; ctx.lineWidth = 1; ctx.stroke();
    ctx.strokeStyle = `rgba(190,140,96,${0.06 * lure})`; ctx.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) { const f = i / 4; ctx.beginPath(); ctx.moveTo(lerp(-46, -98, f), lerp(-54, -34, f)); ctx.lineTo(lerp(-58, -98, f), lerp(-78, -64, f)); ctx.stroke(); }
    // flesh lit by its own esca: warm near the lure, falling off to black at the tail
    const lg = ctx.createRadialGradient(lx, ly, 10, lx, ly, 270);
    lg.addColorStop(0, H.rgba(H.mix([8, 10, 14], [140, 96, 60], lure))); lg.addColorStop(0.2, H.rgba(H.mix([8, 10, 14], [92, 64, 44], lure)));
    lg.addColorStop(0.35, H.rgba(H.mix([7, 9, 13], [44, 32, 27], lure))); lg.addColorStop(0.55, H.rgba(H.mix([5, 7, 11], [16, 14, 16], lure)));
    lg.addColorStop(1, 'rgb(3,5,9)');
    body(); ctx.fillStyle = lg; ctx.fill();
    ctx.save(); body(); ctx.clip();
    // form shading: belly and lower jaw turn away from the light
    const sh = ctx.createLinearGradient(0, -40, 0, 70);
    sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.5, 'rgba(2,3,6,0.45)'); sh.addColorStop(1, 'rgba(2,3,6,0.85)');
    ctx.fillStyle = sh; ctx.fillRect(-180, -90, 300, 170);
    // warm bounce on the head and jaw facing the lure, plus a wet specular sheen
    ctx.globalCompositeOperation = 'lighter';
    const hl = ctx.createRadialGradient(lx - 30, ly + 52, 0, lx - 30, ly + 52, 150);
    hl.addColorStop(0, `rgba(255,168,92,${0.22 * lure})`); hl.addColorStop(0.5, `rgba(255,150,80,${0.07 * lure})`); hl.addColorStop(1, 'rgba(255,150,80,0)');
    ctx.fillStyle = hl; ctx.fillRect(-180, -90, 300, 170);
    // wet sheen: a soft band just inside the lit upper contour
    const sg = ctx.createRadialGradient(lx - 40, ly + 30, 0, lx - 40, ly + 30, 170);
    sg.addColorStop(0, `rgba(255,214,160,${0.07 * lure})`); sg.addColorStop(1, 'rgba(255,214,160,0)');
    ctx.save(); ctx.translate(0, 6); body(); ctx.restore(); ctx.strokeStyle = sg;
    for (let i = 0; i < 6; i++) { ctx.lineWidth = 26 - i * 4; ctx.stroke(); }
    // skin pores along the flank, catching pin-points of light
    for (let i = 0; i < 8; i++) {
      const f = i / 7, px = lerp(-96, 36, f), py = lerp(-2, -24, f) + Math.sin(f * 7) * 3, d = Math.hypot(px - lx, py - ly);
      dot(ctx, px, py, 3.2, [255, 196, 140], 0.85 * lure * cl(1.25 - d / 240), 'core');
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    // rim light on the upper edge from the lure
    const rg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 230);
    rg.addColorStop(0, `rgba(255,198,120,${0.85 * lure})`); rg.addColorStop(1, 'rgba(255,190,110,0)');
    body(); ctx.strokeStyle = rg; ctx.lineWidth = 2.2; ctx.stroke();
    // skin bumps / lateral line
    ctx.strokeStyle = `rgba(170,120,84,${0.28 * lure})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-100, 0); ctx.quadraticCurveTo(-30, -14, 40, -30); ctx.stroke();
    // caudal fin rays
    ctx.strokeStyle = `rgba(170,120,84,${0.1 * lure})`; ctx.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) { const f = (i - 2) / 2; ctx.beginPath(); ctx.moveTo(-122, f * 4); ctx.lineTo(-164, f * 38); ctx.stroke(); }
    // pectoral fin
    ctx.beginPath(); ctx.moveTo(-20, 22); ctx.quadraticCurveTo(-52, 40, -44, 64); ctx.quadraticCurveTo(-26, 46, -6, 34); ctx.closePath();
    ctx.fillStyle = 'rgba(16,14,16,0.9)'; ctx.fill(); ctx.strokeStyle = `rgba(200,150,100,${0.22 * lure})`; ctx.stroke();
    // teeth: needles, lit by the lure
    ctx.fillStyle = `rgba(235,225,205,${0.12 + 0.6 * lure})`;
    for (let i = 0; i < 8; i++) { const f = i / 7, tx = lerp(88, 50, f), ty = lerp(-12, 4, f), tl = 13 - Math.abs(f - 0.4) * 10;
      ctx.beginPath(); ctx.moveTo(tx - 2, ty); ctx.lineTo(tx + 2, ty); ctx.lineTo(tx + 1, ty + tl); ctx.fill(); }
    for (let i = 0; i < 7; i++) { const f = i / 6, tx = lerp(98, 54, f), ty = lerp(14, 14, f) + Math.sin(f * 3) * 3, tl = 15 - Math.abs(f - 0.3) * 12;
      ctx.beginPath(); ctx.moveTo(tx - 2, ty); ctx.lineTo(tx + 2, ty); ctx.lineTo(tx - 1, ty - tl); ctx.fill(); }
    // eye
    ctx.beginPath(); ctx.arc(30, -32, 7, 0, TAU); ctx.fillStyle = '#020305'; ctx.fill();
    ctx.strokeStyle = `rgba(200,220,210,${0.15 + 0.4 * lure})`; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; dot(ctx, 27, -35, 3, C.ice, 0.5 * lure, 'core');
    // illicium (fishing rod) and esca (the lure)
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath(); ctx.moveTo(18, -56); ctx.quadraticCurveTo(46, -150, lx, ly);
    ctx.strokeStyle = `rgba(${lerp(30, 120, lure) | 0},${lerp(28, 90, lure) | 0},${lerp(30, 70, lure) | 0},1)`; ctx.lineWidth = 2.6; ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    dot(ctx, lx, ly, 120, C.amber, 0.55 * lure * a);
    dot(ctx, lx, ly, 34, C.amber, lure * a, 'core');
    dot(ctx, lx, ly, 12, [255, 240, 200], lure * a, 'core');
    ctx.restore();
    return wl;
  }

  // ---------- point sampling (text and silhouettes become plankton swarms) ----------
  const PTS = {};
  function samplePts(key, w, h, step, drawFn) {
    if (PTS[key]) return PTS[key];
    const c = H.layer(w, h), x = c.getContext('2d');
    x.fillStyle = '#fff'; x.strokeStyle = '#fff'; drawFn(x);
    const d = x.getImageData(0, 0, w, h).data, R = H.rng(key), out = [];
    const on = (i, j) => i >= 0 && j >= 0 && i < w && j < h && d[(j * w + i) * 4 + 3] > 120;
    for (let j = 0; j < h; j += step) for (let i = 0; i < w; i += step) {
      if (!on(i, j)) continue;
      const edge = !on(i - step, j) || !on(i + step, j) || !on(i, j - step) || !on(i, j + step);
      out.push({ x: i - w / 2 + R.range(-0.4, 0.4) * step, y: j - h / 2 + R.range(-0.4, 0.4) * step, e: edge, r: R(), a: R() * TAU, d: R(), q: R() });
    }
    return (PTS[key] = out);
  }
  function textPts(str, font, step) {
    const key = 'B' + str + font + step;
    if (PTS[key]) return PTS[key];
    const raw = samplePts('T' + str + font + step, 1280, 200, step, (x) => { x.font = font; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillText(str, 640, 130); });
    return (PTS[key] = raw.map((p) => ({ ...p, y: p.y - 30 })));  // y relative to the baseline
  }
  const catPts = () => samplePts('cat', 160, 150, 4, (x) => {
    x.beginPath(); x.ellipse(78, 104, 38, 40, 0, 0, TAU); x.fill();
    x.beginPath(); x.arc(78, 52, 28, 0, TAU); x.fill();
    x.beginPath(); x.moveTo(52, 44); x.lineTo(54, 10); x.lineTo(74, 28); x.fill();
    x.beginPath(); x.moveTo(104, 44); x.lineTo(102, 10); x.lineTo(82, 28); x.fill();
    x.lineWidth = 10; x.lineCap = 'round'; x.beginPath(); x.moveTo(108, 132); x.quadraticCurveTo(150, 130, 142, 84); x.stroke();
    x.globalCompositeOperation = 'destination-out';
    x.beginPath(); x.ellipse(67, 50, 4, 6, 0, 0, TAU); x.ellipse(89, 50, 4, 6, 0, 0, TAU); x.fill();
  });
  const dogPts = () => samplePts('dog', 190, 150, 4, (x) => {
    x.beginPath(); x.ellipse(82, 84, 52, 27, 0, 0, TAU); x.fill();
    x.beginPath(); x.moveTo(112, 70); x.lineTo(128, 36); x.lineTo(150, 50); x.lineTo(132, 92); x.fill(); // neck
    x.beginPath(); x.arc(140, 44, 22, 0, TAU); x.fill();
    x.beginPath(); x.ellipse(164, 52, 17, 11, 0.1, 0, TAU); x.fill();
    x.beginPath(); x.ellipse(126, 54, 9, 20, 0.35, 0, TAU); x.fill(); // floppy ear
    [[38, 96, 12, 44], [58, 100, 12, 40], [104, 100, 12, 40], [122, 96, 12, 44]].forEach(([a, b, c, d]) => x.fillRect(a, b, c, d));
    x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(34, 74); x.quadraticCurveTo(14, 60, 18, 30); x.stroke();
    x.globalCompositeOperation = 'destination-out';
    x.beginPath(); x.arc(146, 38, 3.5, 0, TAU); x.fill();
    x.lineWidth = 3; x.beginPath(); x.ellipse(126, 54, 9, 20, 0.35, -1.2, 1.9); x.stroke();
  });

  // a plankton swarm holding a shape; form 0 = scattered cloud, 1 = crisp silhouette
  function swarm(ctx, pts, cx, cy, sc, form, t, col, a, sink) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const sp = 1 - form;
    for (const p of pts) {
      let px = cx + p.x * sc + Math.cos(p.a + t * 0.9) * sp * (30 + p.d * 160) + Math.sin(t * 2.1 + p.r * 9) * 1.4;
      let py = cy + p.y * sc + Math.sin(p.a + t * 0.9) * sp * (24 + p.d * 120) + Math.cos(t * 1.7 + p.q * 9) * 1.4;
      if (sink) { const k = Math.pow(cl(sink.k * (1.2 - p.d * 0.4)), 1.6); px = lerp(px, sink.x + (p.q - 0.5) * 20, k); py = lerp(py, sink.y + (p.r - 0.5) * 30, k); }
      const tw = 0.55 + 0.45 * Math.sin(t * (3 + p.r * 5) + p.a * 7);
      dot(ctx, px, py, p.e ? 6 : 5, col, a * (p.e ? 0.95 : 0.4) * tw * (0.35 + 0.65 * form), p.e ? 'core' : 'soft');
    }
    ctx.restore();
  }

  // plankton gathering into text (p 0..1); from = optional origin cloud
  function gather(ctx, pts, cx, cy, p, t, col, a, from) {
    if (a <= 0.01 || p <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const pt of pts) {
      const q = E.inOut(cl((p - pt.r * 0.42) / 0.58));
      const tx = cx + pt.x, ty = cy + pt.y;
      const sx = from ? from.x + Math.cos(pt.a) * from.r * (0.2 + pt.d) : tx + Math.cos(pt.a) * (150 + pt.d * 520);
      const sy = from ? from.y + Math.sin(pt.a) * from.r * 0.7 * (0.2 + pt.d) : ty + Math.sin(pt.a) * (110 + pt.d * 260);
      const sw = Math.sin(q * Math.PI) * 70 * (pt.q - 0.5);
      const dx = tx - sx, dy = ty - sy, dl = Math.hypot(dx, dy) || 1;
      const px = lerp(sx, tx, q) - dy / dl * sw, py = lerp(sy, ty, q) + dx / dl * sw;
      const tw = 0.6 + 0.4 * Math.sin(t * (4 + pt.d * 6) + pt.a * 5);
      dot(ctx, px, py, q > 0.97 ? 4.5 : 5.5, col, a * (0.25 + 0.75 * q) * tw, 'core');
    }
    ctx.restore();
  }

  // bioluminescent type: wide soft halo + bright core
  function gtext(ctx, s, x, y, font, rgb, a, align, blur) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = 1; ctx.font = font; ctx.textAlign = align || 'center'; ctx.textBaseline = 'alphabetic';
    const b = blur || 16;
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = H.rgba(rgb, a); ctx.shadowBlur = b * 2.6; ctx.fillStyle = H.rgba(rgb, 0.55 * a); ctx.fillText(s, x, y);
    ctx.shadowBlur = b * 1.1; ctx.fillStyle = H.rgba(rgb, 0.6 * a); ctx.fillText(s, x, y);
    ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = H.rgba(H.mix(rgb, WH, 0.62), a); ctx.fillText(s, x, y);
    ctx.restore();
  }
  function tw(ctx, s, font) { ctx.save(); ctx.font = font; const w = ctx.measureText(s).width; ctx.restore(); return w; }

  // glowing stroke (for ✗ / ✓ / rings)
  function gstroke(ctx, path, rgb, a, lw) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    path(); ctx.strokeStyle = H.rgba(rgb, 0.16 * a); ctx.lineWidth = lw * 4.5; ctx.stroke();
    ctx.strokeStyle = H.rgba(rgb, 0.4 * a); ctx.lineWidth = lw * 2; ctx.stroke();
    ctx.strokeStyle = H.rgba(H.mix(rgb, WH, 0.6), a); ctx.lineWidth = lw; ctx.stroke();
    ctx.restore();
  }
  function ring(ctx, x, y, r, rgb, a, lw) { gstroke(ctx, () => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }, rgb, a, lw || 2.5); }

  // ---------- luminous current: a dotted plankton stream with an arrowhead ----------
  function bez(P, u) {
    const v = 1 - u;
    return [v * v * v * P[0][0] + 3 * v * v * u * P[1][0] + 3 * v * u * u * P[2][0] + u * u * u * P[3][0],
      v * v * v * P[0][1] + 3 * v * v * u * P[1][1] + 3 * v * u * u * P[2][1] + u * u * u * P[3][1]];
  }
  function curPts(P) {
    const pts = [bez(P, 0)], len = [0];
    for (let i = 1; i <= 80; i++) { const p = bez(P, i / 80); len.push(len[i - 1] + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1])); pts.push(p); }
    const at = (s) => { let i = 1; while (i < 80 && len[i] < s) i++; const f = (s - len[i - 1]) / Math.max(1e-6, len[i] - len[i - 1]); return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; };
    return { at, L: len[80], pts };
  }
  function current(ctx, P, prog, t, col, a, sig, sigCol) {
    if (prog <= 0 || a <= 0.01) return;
    const c = curPts(P), Lp = c.L * cl(prog);
    ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    ctx.beginPath(); for (let s = 0; s <= Lp; s += 6) { const p = c.at(s); s ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.strokeStyle = H.rgba(col, 0.2 * a); ctx.lineWidth = 2; ctx.stroke();
    for (let s = 0; s <= Lp; s += 12) {
      const p = c.at(s), pul = Math.pow(0.5 + 0.5 * Math.sin(s * 0.045 - t * 8), 4);
      dot(ctx, p[0], p[1], 6.5, col, a * (0.4 + 0.6 * pul), 'core');
    }
    const end = c.at(Lp);
    if (prog < 1) dot(ctx, end[0], end[1], 22, col, a, 'core');
    const hp = cl((prog - 0.85) / 0.15);
    if (hp > 0) {
      const e0 = c.at(c.L - 8), ang = Math.atan2(end[1] - e0[1], end[0] - e0[0]);
      for (const sd of [-1, 1]) for (let k = 1; k <= 3; k++) {
        const aa = ang + Math.PI + sd * 0.6;
        dot(ctx, end[0] + Math.cos(aa) * k * 9 * hp, end[1] + Math.sin(aa) * k * 9 * hp, 7, col, a * hp, 'core');
      }
      dot(ctx, end[0], end[1], 9, col, a * hp, 'core');
    }
    if (sig != null && sig >= 0 && sig <= 1) {
      for (let k = 0; k < 6; k++) { const s = c.L * cl(sig - k * 0.025), p = c.at(s); dot(ctx, p[0], p[1], 26 - k * 3, sigCol || col, a * (1 - k * 0.15), 'core'); }
    }
    ctx.restore();
  }

  // ---------- minimal submersible HUD ----------
  function hud(ctx, W, depth, temp, t, a, left) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.font = F.hud(15); ctx.textAlign = left ? 'left' : 'right';
    const x = left ? 34 : W - 34;
    ctx.fillStyle = 'rgba(150,220,235,0.72)';
    ctx.fillText('DEPTH ' + String(Math.round(depth)).padStart(4, '0') + ' m', x, 40);
    ctx.fillStyle = 'rgba(150,220,235,0.45)';
    ctx.fillText('TEMP ' + temp.toFixed(1) + ' °C', x, 60);
    // tiny scrolling depth ladder
    const lx = left ? x : x - 150;
    ctx.strokeStyle = 'rgba(150,220,235,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lx, 72); ctx.lineTo(lx + 150, 72); ctx.stroke();
    for (let i = -1; i < 12; i++) { const off = ((depth * 0.6) % 15), tx = lx + i * 15 - off; if (tx < lx || tx > lx + 150) continue; ctx.beginPath(); ctx.moveTo(tx, 72); ctx.lineTo(tx, i % 5 === 0 ? 64 : 68); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,90,80,' + (0.5 + 0.5 * (Math.sin(t * 4) > 0 ? 1 : 0)) + ')';
    ctx.beginPath(); ctx.arc(left ? x + 200 : x - 196, 35, 4, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function finish(ctx, W, Hh, t, v) {
    H.vignette(ctx, W, Hh, v == null ? 0.6 : v, '0,0,4');
    H.grain(ctx, W, Hh, 0.035, 1 + Math.floor(t * 24), true);
  }

  // ======================= HERO STILL / CLIP =======================
  const flick = (t, t0, t1, seed) => {
    if (t <= t0) return 0; if (t >= t1) return 1;
    const p = (t - t0) / (t1 - t0), r = hash(Math.floor(t * 24) + seed * 13.7);
    return r < 0.35 + p * 0.6 ? p * (0.6 + 0.4 * r) + 0.1 : 0.06;
  };
  function hero(ctx, W, Hh, t) {
    const dP = E.out(cl(t / 2.4));
    const camY = 900 * dP + t * 6, vel = 900 * 3 * Math.pow(1 - cl(t / 2.4), 2) / 2.4 + 6;
    water(ctx, W, Hh, t, 0.35 + 0.3 * dP, 0.9 - 0.45 * dP);
    const MJ = { x: 690, y: 300 };
    const jOn = sm(0.4, 1.5, t), lure = flick(t, 2.5, 3.0, 3);
    snow(ctx, W, Hh, t, camY, 0, vel, [{ x: MJ.x, y: MJ.y - 80, r: 330, k: 0.45 * jOn, col: C.cyan }, { x: 268, y: 520, r: 220, k: 0.7 * lure, col: C.amber }], 1);

    // distant, out-of-focus jellies (rendered small and blurred once, instead of a per-stroke blur filter)
    far(ctx, W, Hh, (x) => {
      jelly(x, { x: 1120, y: 150 - (1 - dP) * 140, s: 34, t: t + 3, ph: 0.3, on: 0.45 * sm(0.6, 1.4, t), col: C.blue, tent: 7, tl: 90 });
      jelly(x, { x: 120, y: 330 - (1 - dP) * 200, s: 24, t: t + 7, ph: 0.7, on: 0.4 * sm(0.8, 1.6, t), col: C.teal, tent: 6, tl: 60, tilt: 0.3 });
    }, 1, 1);

    // siphonophore: a long living chain down the right edge
    const chain = [];
    for (let i = 0; i < 24; i++) { const f = i / 23; chain.push([1050 + Math.sin(f * 3.2) * 140 + Math.sin(t * 0.6 + f * 4) * 8, -20 + f * 790 - (1 - dP) * 260]); }
    siph(ctx, chain, t, (i) => flick(t, 1.6 + i * 0.07, 1.9 + i * 0.07, i) * (0.75 + 0.25 * Math.sin(t * 3 - i * 0.6)), 0.95, sm(0.8, 1.6, t), C.violet, C.cyan);

    // comb jelly upper left
    comb(ctx, 250, 160 - (1 - dP) * 220, 62, t, sm(1.7, 2.4, t), -0.35);

    // main jellyfish with its nerve net glowing like a thinking brain
    const nodeOn = (i) => { const nd = NET.nodes[i], t0 = 1.15 + (nd.L + 1) * 0.28 + hash(i) * 0.25; return flick(t, t0, t0 + 0.3, i); };
    jelly(ctx, {
      x: MJ.x, y: MJ.y - (1 - dP) * 320, s: 205, t, ph: 0.1, on: jOn, col: C.cyan, acc: C.mag, gon: sm(1.5, 2.2, t), tent: 16, tl: 420, sway: -0.12,
      net: {
        a: 1, act: (i) => nodeOn(i) * (0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(t * 3.2 - NET.nodes[i].u * 3 - NET.nodes[i].v * 4), 3)),
        ew: (e) => e.w0 * Math.min(nodeOn(e.a), nodeOn(e.b)),
        nc: (i) => (i % 6 === 4 ? C.mag : C.cyan),
        pulse: (e, i) => (Math.min(nodeOn(e.a), nodeOn(e.b)) > 0.95 ? (t * 0.9 + hash(i * 3.1)) % 1.6 : -1),
      },
    });
    sparkles(ctx, MJ.x - 40, MJ.y + 220, 220, 150, t, 77, 70, sm(1.2, 2, t), C.cyan, 2.6);

    // anglerfish, lower left, its lure lighting the water
    angler(ctx, 150, 640, 120, t, lure, 1, false);
    sparkles(ctx, 270, 520, 140, 90, t, 91, 26, lure * 0.8, C.amber, 2);

    // title: plankton gathers into the words, then they glow
    const tp = sm(3.0, 4.4, t), ta = sm(4.0, 4.6, t);
    const l1 = 'Thinking', l2 = 'in the dark';
    const f1 = F.titleI(84), f2 = F.titleI(84);
    gather(ctx, textPts(l1, f1, 3), 330, 330, tp, t, C.cyan, 1 - ta * 0.85);
    gather(ctx, textPts(l2, f2, 3), 330, 422, tp, t + 0.5, C.cyan, 1 - ta * 0.85);
    gtext(ctx, l1, 330, 330, f1, C.cyan, ta, 'center', 18);
    gtext(ctx, l2, 330, 422, f2, C.cyan, ta, 'center', 18);

    hud(ctx, W, 180 + camY * 0.95, 4.6 - dP * 0.8, t, sm(0.2, 0.7, t), false);
    finish(ctx, W, Hh, t);
  }

  // ======================= EXPLAINER =======================
  // timings (seconds) shared by explainer() and explainerSound()
  const T = {
    D: 15,
    g0: 0.15, g1: 1.25, crisp: [1.0, 1.35],
    desc: [1.95, 2.95], head: [2.0, 2.65],
    s2in: [2.2, 3.0], modelLbl: 3.05, arr2: [2.85, 3.45],
    sw0: 3.0, swGap: 0.42, swDur: 1.6, cnt: [3.0, 5.7],
    bloom: [6.0, 6.65],
    cat3: [6.45, 7.1], guessArc: [6.95, 7.4], guessLbl: 7.25, dogQ: 7.5, check: 8.0,
    adjArc: [8.4, 8.9], adjLbl: 8.65, ripple: [8.9, 9.6], again: [9.45, 9.85], catOk: 9.85,
    dark: [10.2, 10.5], fish: [10.25, 11.05], reveal: [10.5, 11.2], acc: [10.95, 12.25], burst: 12.25,
    out4: [12.95, 13.35], take: [13.0, 13.85], takeCrisp: [13.55, 13.95],
  };
  const LBL = H.mix(C.ice, C.cyan, 0.45); // secondary labels: icy cyan, so they glow like the others instead of reading grey
  const SWK = ['cat', 'dog', 'dog', 'cat', 'cat', 'dog'];
  const swTimes = SWK.map((_, i) => T.sw0 + i * T.swGap);
  const swArrive = swTimes.map((s) => s + T.swDur * 0.9);

  let LAY = [];
  function layer(i, W, Hh) { if (!LAY[i]) LAY[i] = H.layer(W, Hh); return LAY[i]; }
  function comp(ctx, W, Hh, i, fn, o) {
    o = o || {};
    if ((o.alpha == null ? 1 : o.alpha) <= 0.003) return;
    const L = layer(i, W, Hh), x = L.getContext('2d');
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none'; x.clearRect(0, 0, W, Hh);
    fn(x);
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
    if (o.mask) { x.globalCompositeOperation = 'destination-in'; x.fillStyle = o.mask(x); x.fillRect(0, 0, W, Hh); x.globalCompositeOperation = 'source-over'; }
    ctx.save();
    if (o.clip) { ctx.beginPath(); o.clip(ctx); ctx.clip(); }
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    ctx.drawImage(L, 0, 0, W, Hh); ctx.restore();
  }
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const camYOf = (t) => E.inOut(sm(T.desc[0], T.desc[1], t)) * 1100 + t * 7;
  const land = (t, t0, d) => { const p = sm(t0, t0 + (d || 0.3), t); return { a: p, dy: (1 - E.out(p)) * -16 }; };

  // ---- beat 2: data swarms stream into the model ----
  function scene2(x, W, Hh, t) {
    const dy = (1 - E.out(sm(T.s2in[0], T.s2in[1], t))) * 560;
    const MX = 930, MY = 300 + dy;
    const act = (i) => {
      const nd = NET.nodes[i]; let v = 0.3;
      swArrive.forEach((ta) => { const d = t - ta - (nd.L + 1) * 0.07; if (d > 0) v += Math.exp(-d * 5) * 0.9; });
      return cl(v);
    };
    jelly(x, { x: MX, y: MY, s: 150, t, ph: 0.2, col: C.cyan, gon: 0.6, tent: 14, tl: 340, sway: -0.05, net: { act, ew: (e) => e.w0 * 0.8 + 0.2 * Math.max(act(e.a), act(e.b)) } });
    // label lands on the model
    const ml = land(t, T.modelLbl);
    gtext(x, 'AI model', MX, MY - 152 + ml.dy, F.label(32), LBL, ml.a, 'center', 14);
    // the current carrying examples into the model
    const P = [[70, 345 + dy * 0.3], [300, 300 + dy * 0.3], [560, 380 + dy * 0.3], [770, 318 + dy]];
    current(x, P, E.inOut(sm(T.arr2[0], T.arr2[1], t)), t, C.teal, 0.85);
    // swarms
    SWK.forEach((k, i) => {
      const p = (t - swTimes[i]) / T.swDur;
      if (p < 0 || p > 1.02) return;
      const lane = i % 2 ? 448 : 222;
      const px = lerp(-110, 760, p * 0.75 + 0.25 * E.inOut(p)), py = lerp(lane, 320, sm(0.6, 1, p)) + Math.sin(p * 6 + i) * 12 + dy * 0.3;
      const pts = k === 'cat' ? catPts() : dogPts(), col = k === 'cat' ? C.cyan : C.violet;
      const form = sm(0.0, 0.32, p), ab = sm(0.8, 1.0, p);
      swarm(x, pts, px, py, 0.82, form, t + i, col, 1 - sm(0.93, 1.02, p), { x: MX - 150, y: MY + 10, k: ab });
      sparkles(x, px - 70, py, 90, 50, t, 300 + i, 18, (1 - ab) * 0.8, col, 3.5);
      const la = sm(0.1, 0.2, p) * (1 - sm(0.76, 0.84, p)), ldy = (1 - E.out(sm(0.1, 0.24, p))) * -14;
      gtext(x, k, px, py - 76 + ldy, F.label(34), col, la, 'center', 12);
    });
    // counter: hero number of the beat
    const cp = sm(T.cnt[0], T.cnt[1], t), val = cp >= 1 ? 1e6 : Math.round(Math.pow(10, 6 * E.inOut(cp)) - 1);
    const ca = sm(2.9, 3.2, t);
    const nr = 64 + tw(x, '1,000,000', F.num(80));
    gtext(x, fmt(val), nr, 652 + dy * 0.5, F.num(80), C.cyan, ca, 'right', 16);
    gtext(x, 'examples', nr + 22, 652 + dy * 0.5, F.label(34), C.teal, ca, 'left', 10);
    return { MX, MY };
  }

  // ---- beat 3: guess -> check -> adjust ----
  function scene3(x, W, Hh, t) {
    const JX = 420, JY = 345;
    const flk = t > T.dogQ && t < T.check + 0.25 ? (0.55 + 0.45 * hash(Math.floor(t * 18))) * sm(T.dogQ, T.dogQ + 0.1, t) * (1 - sm(T.check + 0.1, T.check + 0.25, t)) : 0;
    const bellCol = H.mix(C.cyan, C.amber, flk * 0.85);
    const rp = (t - T.ripple[0]) / (T.ripple[1] - T.ripple[0]);
    const delay = (u) => (1 - (u + 1) / 2) * 0.75; // ripple enters from the right side of the bell
    const nodeR = (i) => rp - delay(NET.nodes[i].u);
    const ag = (t - T.again[0]) / (T.again[1] - T.again[0]);
    const net = {
      act: (i) => {
        const r = nodeR(i), nd = NET.nodes[i];
        let v = 0.35 + 0.25 * Math.sin(t * 3 + i);
        if (r > 0 && r < 0.6) v += Math.exp(-r * 6) * 1.5;
        if (ag > 0 && ag < 1.4) v += Math.exp(-Math.abs(ag - (nd.L + 1) * 0.25) * 9) * 0.9;
        return cl(v + flk * 0.4);
      },
      nc: (i) => { const r = nodeR(i); const m = r > 0 && r < 0.5 ? Math.exp(-r * 5) : 0; return H.mix(H.mix(C.cyan, C.amber, flk * (hash(i + Math.floor(t * 18)) > 0.4 ? 1 : 0.3)), C.mag, m); },
      ew: (e) => { const r = Math.min(nodeR(e.a), nodeR(e.b)); return lerp(e.w0, e.w1, E.inOut(cl(r * 2.5))); },
      ec: (e) => { const r = Math.min(nodeR(e.a), nodeR(e.b)); const m = r > 0 && r < 0.6 ? Math.exp(-r * 5) : 0; return H.mix(bellCol, C.mag, m); },
      pulse: (e) => (ag > 0 && ag < 1.5 ? ag * 1.6 - (NET.nodes[e.a].L + 1) * 0.35 : -1),
    };
    jelly(x, { x: JX, y: JY, s: 178, t, ph: 0.55, col: bellCol, gon: 0.7, tent: 15, tl: 330, sway: 0.04, net });

    // the new example: a cat-shaped swarm, no label yet
    const cf = E.out(sm(T.cat3[0], T.cat3[1], t));
    swarm(x, catPts(), 1010, 365, 0.95, cf, t, C.cyan, sm(T.cat3[0] - 0.1, T.cat3[0] + 0.2, t));
    sparkles(x, 1010, 365, 120, 100, t, 512, 22, 0.6 * sm(T.cat3[0], T.cat3[1], t), C.cyan, 3);

    // GUESS: top arc, example -> model
    const gArc = [[930, 270], [860, 110], [680, 100], [600, 222]];
    const gsig = ag > 0 && ag < 1 ? ag : (t > T.guessArc[0] && t < T.guessArc[1] + 0.3 ? -1 : -1);
    current(x, gArc, E.inOut(sm(T.guessArc[0], T.guessArc[1], t)), t, C.cyan, 0.9, gsig, C.ice);
    const gl = land(t, T.guessLbl);
    gtext(x, 'Guess', 770, 92 + gl.dy, F.label(34), C.cyan, gl.a, 'center', 12);

    // the model's answer above its bell: "dog?" (wrong) then "cat" (right)
    const dq = sm(T.dogQ, T.dogQ + 0.25, t) * (1 - sm(T.catOk - 0.25, T.catOk - 0.05, t));
    const shake = t > T.check && t < T.check + 0.35 ? Math.sin(t * 70) * 6 * (1 - (t - T.check) / 0.35) : 0;
    gtext(x, 'dog?', JX - 20 + shake, 148, F.titleI(64), C.amber, dq, 'center', 18);
    // CHECK: truth tag lands on the example, wrong answer gets crossed out
    const ck = land(t, T.check, 0.25);
    gtext(x, 'cat', 1010, 262 + ck.dy, F.label(38), C.cyan, ck.a, 'center', 12);
    const cl2 = land(t, T.check + 0.12, 0.3);
    gtext(x, 'Check', 1010, 492 + cl2.dy, F.label(34), LBL, cl2.a, 'center', 14);
    const xm = sm(T.check, T.check + 0.18, t), xm2 = sm(T.check + 0.12, T.check + 0.3, t), xa = 1 - sm(T.catOk - 0.25, T.catOk - 0.05, t);
    gstroke(x, () => { x.beginPath(); x.moveTo(530, 98); x.lineTo(530 + 44 * xm, 98 + 44 * xm); }, C.red, xm * xa, 5);
    gstroke(x, () => { x.beginPath(); x.moveTo(574, 98); x.lineTo(574 - 44 * xm2, 98 + 44 * xm2); }, C.red, xm2 * xa, 5);
    // emphasis: red pulse ring around the wrong guess
    const er = (t - T.check) / 0.6;
    if (er > 0 && er < 1) { ring(x, JX + 20, 128, 90 + er * 70, C.red, (1 - er) * 0.9, 3); ring(x, JX + 20, 128, 70 + er * 30, C.red, (1 - er) * 0.5, 2); }

    // ADJUST: bottom arc, the error flows back into the model
    const aArc = [[960, 448], [880, 640], [650, 640], [585, 380]];
    const asg = (t - T.adjArc[0]) / (T.adjArc[1] - T.adjArc[0]);
    current(x, aArc, E.inOut(sm(T.adjArc[0], T.adjArc[1], t)), t, C.mag, 0.9, asg > 0 && asg < 1.15 ? asg : null, C.mag);
    const al = land(t, T.adjLbl);
    gtext(x, 'Adjust', 770, 632 + al.dy, F.label(34), C.mag, al.a, 'center', 12);
    // ripple of light across the bell as the weights change
    if (rp > 0 && rp < 1.2) ring(x, JX + 120, JY - 40, 30 + rp * 260, C.mag, (1 - rp / 1.2) * 0.55, 2);

    // right answer
    const ok = sm(T.catOk, T.catOk + 0.25, t);
    gtext(x, 'cat', JX - 30, 148 + (1 - E.out(ok)) * -14, F.titleI(64), C.green, ok, 'center', 18);
    const okm = sm(T.catOk + 0.1, T.catOk + 0.35, t);
    gstroke(x, () => { x.beginPath(); x.moveTo(498, 122); x.lineTo(498 + 14 * Math.min(1, okm * 2), 122 + 16 * Math.min(1, okm * 2)); if (okm > 0.5) x.lineTo(512 + 30 * (okm - 0.5) * 2, 138 - 40 * (okm - 0.5) * 2); }, C.green, okm, 5);
    const okr = (t - T.catOk - 0.1) / 0.7;
    if (okr > 0 && okr < 1) ring(x, JX + 10, 128, 70 + okr * 80, C.green, (1 - okr) * 0.7, 2.5);
  }

  // ---- beat 4: accuracy climbs along a siphonophore chain ----
  function chainPts() {
    const out = [];
    for (let i = 0; i < 15; i++) { const f = i / 14, cv = (1 - Math.exp(-3.2 * f)) / (1 - Math.exp(-3.2)); out.push([620 + f * 580, 610 - cv * 440]); }
    return out;
  }
  function scene4(x, W, Hh, t) {
    const ap = E.out(sm(T.acc[0], T.acc[1], t)), val = Math.round(61 + 36 * ap);
    const pts = chainPts().map((p, i) => [p[0] + Math.sin(t * 0.8 + i * 0.5) * 4, p[1] + Math.cos(t * 0.7 + i * 0.4) * 4]);
    const shown = sm(10.6, 11.0, t);
    const burst = (t - T.burst);
    // axis: a faint dotted sea-floor line + rounds label
    x.save(); x.globalCompositeOperation = 'lighter';
    for (let sx = 600; sx <= 1220; sx += 14) dot(x, sx, 650, 4, C.teal, 0.45 * shown, 'core');
    x.restore();
    gtext(x, 'training rounds →', 910, 694, F.label(30), C.teal, shown, 'center', 10);
    siph(x, pts, t, (i) => {
      const th = i / 14; let v = ap >= th - 0.001 ? 1 : cl((ap - th + 0.07) / 0.07) * 0.6;
      if (burst > 0 && burst < 0.8) v += Math.exp(-Math.abs(burst * 2 - (14 - i) * 0.08) * 6);
      return cl(v);
    }, 1.25, shown, C.violet, C.cyan);
    // chain head lights the current value
    const hi = Math.min(14, Math.floor(ap * 14 + 0.001)), hp = pts[hi];
    dot(x, hp[0], hp[1], 70, C.cyan, 0.5 * shown);
    // the number
    const la = land(t, 10.75, 0.3);
    gtext(x, 'Accuracy', 330, 188 + la.dy, F.label(40), LBL, la.a, 'center', 14);
    const pop = burst > 0 ? 1 + 0.16 * Math.exp(-burst * 5) * Math.sin(Math.min(Math.PI, burst * 14)) : 1;
    const flash = burst > 0 ? Math.exp(-burst * 3) : 0;
    x.save(); x.translate(330, 290); x.scale(pop, pop);
    gtext(x, val + '%', 0, 46, F.num(132), H.mix(C.cyan, WH, flash * 0.6), sm(10.7, 11.0, t), 'center', 20 + flash * 20);
    x.restore();
    // 97% emphasis: rings + plankton bloom burst
    if (burst > 0 && burst < 1.4) {
      const b = burst / 1.4;
      ring(x, 330, 290, 120 + b * 360, C.cyan, (1 - b) * 0.8, 3);
      ring(x, 330, 290, 100 + E.out(b) * 220, C.mag, (1 - b) * 0.5, 2);
      x.save(); x.globalCompositeOperation = 'lighter';
      const R = H.rng(1297);
      for (let i = 0; i < 260; i++) {
        const ang = R() * TAU, sp = R.range(120, 620), r0 = R.range(40, 110), dd = r0 + sp * E.out(cl(burst / 1.1));
        const col = R() < 0.12 ? C.mag : R() < 0.1 ? C.amber : C.cyan, fl = 0.6 + 0.4 * Math.sin(t * 14 + i);
        dot(x, 330 + Math.cos(ang) * dd, 290 + Math.sin(ang) * dd * 0.75, R.range(4, 9), col, (1 - b) * fl, 'core');
      }
      x.restore();
    }
  }

  // ---- beat 5: takeaway forms out of gathering light ----
  const TK1 = 'More examples', TK2 = 'better guesses';
  function scene5(x, W, Hh, t) {
    const f = F.title(80), p = sm(T.take[0], T.take[1], t), ca = sm(T.takeCrisp[0], T.takeCrisp[1], t);
    const w1 = tw(x, TK1, f), c1x = 570, c2x = 700, y1 = 262, y2 = 376;
    const from = { x: 330, y: 300, r: 520 };
    gather(x, textPts(TK1, f, 3), c1x, y1 + 22, p, t, C.cyan, 1 - ca * 0.8, from);
    gather(x, textPts(TK2, f, 3), c2x, y2 + 22, p, t + 0.3, C.cyan, 1 - ca * 0.8, from);
    const g1 = F.title(80);
    gtext(x, TK1, c1x, y1 + 22, g1, C.cyan, ca, 'center', 18);
    gtext(x, TK2, c2x, y2 + 22, g1, C.cyan, ca, 'center', 18);
    // arrow made of plankton
    const ax = c1x + w1 / 2 + 24;
    const arp = E.out(sm(T.take[1] - 0.2, T.take[1] + 0.25, t)), ay = y1 - 4;
    gstroke(x, () => { x.beginPath(); x.moveTo(ax, ay); x.lineTo(ax + 100 * arp, ay); if (arp > 0.8) { const hk = (arp - 0.8) / 0.2 * 18; x.moveTo(ax + 100 - hk, ay - hk); x.lineTo(ax + 100, ay); x.lineTo(ax + 100 - hk, ay + hk); } }, C.teal, arp, 4);
    current(x, [[ax, ay], [ax + 33, ay], [ax + 66, ay], [ax + 100, ay]], arp, t, C.cyan, 0.8);
    // the model, calm and bright, rising below
    const ry = E.out(sm(T.take[0], 14.6, t));
    jelly(x, { x: 640, y: lerp(900, 562, ry), s: 105, t, ph: 0.3, col: C.cyan, gon: 0.8, tent: 12, tl: 190, net: { act: (i) => 0.6 + 0.4 * Math.sin(t * 3 - i), ew: (e) => e.w1 } });
    sparkles(x, 640, 330, 420, 140, t, 777, 40, ca * 0.7, C.cyan, 2.2);
  }

  function explainer(ctx, W, Hh, t) {
    const camY = camYOf(t), vel = (camYOf(t + 0.02) - camYOf(t - 0.02)) / 0.04;
    const dP = E.inOut(sm(T.desc[0], T.desc[1], t));
    water(ctx, W, Hh, t, 0.25 + 0.7 * dP, 1 - dP);
    const fishOn = sm(T.fish[0], T.fish[0] + 0.1, t) * (1 - sm(T.out4[0], T.out4[1], t));
    const fx = lerp(-300, 150, E.out(sm(T.fish[0], T.fish[1], t))), fy = 590;
    const lureW = [fx + 98 * 1.15, fy - 100 * 1.15];
    const lights = [];
    if (t > T.s2in[0] && t < T.bloom[1]) lights.push({ x: 930, y: 260, r: 300, k: 0.4, col: C.cyan });
    if (t > T.bloom[0] && t < T.dark[1]) lights.push({ x: 420, y: 300, r: 320, k: 0.4, col: C.cyan });
    if (fishOn > 0) lights.push({ x: lureW[0], y: lureW[1], r: 260, k: 0.8 * fishOn, col: C.amber });
    snow(ctx, W, Hh, t, camY, 0, vel, lights, 1 - 0.3 * sm(T.dark[0], T.dark[1], t) * (1 - sm(T.reveal[0], T.reveal[1], t)));

    // persistent far layer, as in the still: small out-of-focus jellies and a dim siphonophore strand drifting in the
    // distance (slow parallax with the descent), dimmed while the lights go out before the anglerfish reveal.
    // Each far animal is a cached, pre-blurred sprite that only drifts and breathes, so the layer costs ~nothing.
    {
      const dk = sm(T.dark[0], T.dark[1], t) * (1 - sm(T.reveal[0], T.reveal[1], t));
      const fa = sm(0.2, 1.2, t) * (1 - 0.75 * dk), py = camY * 0.14;
      if (fa > 0.004) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        FARJ.forEach((J, i) => {
          const sp = farJelly(i, J), c = Math.pow(0.5 + 0.5 * Math.sin(TAU * (t * 0.45 + J.ph)), 2);
          const x = J.x + Math.sin(t * J.dr + i * 1.3) * J.sw, y = J.y - py - t * J.v;
          ctx.globalAlpha = fa * J.on;
          ctx.save(); ctx.translate(x, y); ctx.rotate(J.tilt || 0); ctx.scale(1 - 0.1 * c, 1 + 0.06 * c);
          ctx.drawImage(sp.cv, -sp.ox, -sp.oy, sp.w, sp.h); ctx.restore();
        });
        const st = farStrand();
        ctx.globalAlpha = fa * (0.8 + 0.2 * Math.sin(t * 0.9));
        ctx.drawImage(st.cv, Math.sin(t * 0.4) * 14, -py * 1.4 - 60, st.w, st.h);
        ctx.restore();
      }
    }

    // ---- beat 1: hook (plankton gathers into the question), a comb jelly drifts by
    if (t < 3.2) {
      comb(ctx, 1040, 230 - camY * 0.8 + Math.sin(t) * 8, 60, t, sm(0.2, 0.9, t), -0.4);
      jelly(ctx, { x: 230, y: 560 - camY * 0.6, s: 46, t: t + 2, ph: 0.6, on: 0.5 * sm(0.3, 1.2, t), col: C.blue, tent: 8, tl: 110, tilt: 0.25 });
    }
    const hk = E.inOut(sm(T.head[0], T.head[1], t));
    const hookFont0 = F.title(66);
    if (t < T.crisp[1] + 0.6) gather(ctx, textPts('How does AI learn?', hookFont0, 3), 640, 352, sm(T.g0, T.g1, t), t, C.cyan, 1 - sm(T.crisp[0], T.crisp[1] + 0.5, t));

    // ---- beat 2 (rises in during the descent) until the plankton bloom sweeps it away
    const bf = lerp(-200, W + 200, E.inOut(sm(T.bloom[0], T.bloom[1], t)));
    if (t > T.s2in[0] && t < T.bloom[1]) comp(ctx, W, Hh, 0, (x) => scene2(x, W, Hh, t), { clip: (c) => c.rect(bf, 0, W + 400, Hh) });
    // ---- beat 3 behind the bloom front
    if (t > T.bloom[0] && t < T.dark[1] + 0.05) comp(ctx, W, Hh, 1, (x) => scene3(x, W, Hh, t), { clip: (c) => c.rect(-10, 0, bf + 10, Hh), alpha: 1 - sm(T.dark[0], T.dark[1], t) });
    // the bloom itself: a sweeping wall of sparkling plankton
    if (t > T.bloom[0] && t < T.bloom[1]) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(bf - 260, 0, bf + 40, 0);
      g.addColorStop(0, 'rgba(40,200,220,0)'); g.addColorStop(0.75, 'rgba(60,220,240,0.22)'); g.addColorStop(1, 'rgba(60,220,240,0)');
      ctx.fillStyle = g; ctx.fillRect(bf - 260, 0, 300, Hh);
      const R = H.rng(606);
      for (let i = 0; i < 340; i++) {
        const off = Math.abs(R.gauss()) * 110, yy = R() * Hh, ph = R() * TAU, col = R() < 0.08 ? C.mag : R() < 0.5 ? C.cyan : C.teal;
        const fl = 0.5 + 0.5 * Math.sin(t * 16 + ph);
        dot(ctx, bf - off + Math.sin(yy * 0.03 + t * 3) * 20, yy, R.range(3, 8), col, fl * (1 - off / 360), 'core');
      }
      ctx.restore();
    }

    // ---- beat 4: the anglerfish lure lights up a new patch of water
    if (t > T.fish[0] && t < T.out4[1] + 0.05) {
      const rr = 1700 * E.in(sm(T.reveal[0], T.reveal[1], t));
      comp(ctx, W, Hh, 0, (x) => scene4(x, W, Hh, t), {
        alpha: 1 - sm(T.out4[0], T.out4[1], t),
        mask: t < T.reveal[1] ? (x) => { const g = x.createRadialGradient(lureW[0], lureW[1], 0, lureW[0], lureW[1], Math.max(1, rr)); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.6, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); return g; } : null,
      });
      angler(ctx, fx, fy, 115, t, flick(t, T.fish[0] + 0.05, T.fish[0] + 0.35, 5), fishOn, false);
    }
    // ---- beat 5: takeaway
    if (t > T.take[0]) comp(ctx, W, Hh, 1, (x) => scene5(x, W, Hh, t), {
      // the rising jelly's tentacles fade into the dark instead of being cut by the frame edge
      mask: (x) => { const g = x.createLinearGradient(0, 590, 0, Hh); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0.08)'); return g; },
    });

    // vignette first, so the hook/header keeps its full glow in the corner
    H.vignette(ctx, W, Hh, 0.6, '0,0,4');
    {
      const px = lerp(66, 44, hk), fnt = F.title(px), wq = tw(ctx, 'How does AI learn?', fnt);
      const cx = lerp(640, 36 + wq / 2, hk), cy = lerp(352, 64, hk);
      gtext(ctx, 'How does AI learn?', cx, cy, fnt, H.mix(C.cyan, C.ice, hk * 0.6), sm(T.crisp[0], T.crisp[1], t), 'center', lerp(18, 12, hk));
    }
    hud(ctx, W, 160 + camY * 0.78 + sm(T.fish[0], T.fish[1], t) * 40, 5.2 - dP * 1.4, t, 0.9, false);
    H.grain(ctx, W, Hh, 0.035, 1 + Math.floor(t * 24), true);
  }


  // ======================= SOUND =======================
  function deepSound(k) {
    const D = T.D, R = H.rng(8080);
    const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
    // soft rising bubble "bloop" (all under ~1.5 kHz)
    const bubble = (t, f0, g, pan) => k.tone(t, { f: [[0, f0], [0.045, f0 * 2.1]], dur: 0.075, gain: 0.13 * (g || 1), a: 0.003, filter: 'lowpass', f2: 1500, pan: pan || 0, verb: 0.3 });
    const bubbles = (t, n, spread, g) => { for (let i = 0; i < n; i++) bubble(t + R() * spread, 220 + R() * 260, (g || 1) * (0.5 + R() * 0.5), R() * 1.2 - 0.6); };
    // sonar-like low ping with a faint echo
    const ping = (t, f, g, pan) => { k.tone(t, { f, dur: 1.5, gain: 0.1 * (g || 1), a: 0.006, verb: 0.55, pan: pan || 0 });
      k.tone(t + 0.38, { f, dur: 1.0, gain: 0.03 * (g || 1), a: 0.01, verb: 0.6, pan: -(pan || 0) * 0.5 }); };
    // muffled swell of moving water
    const swell = (t, d, g, top) => { k.noise(t, { dur: d, color: 'brown', filter: 'lowpass', f: [[0, 120], [d * 0.55, top || 700], [d, 160]], q: 0.7, gain: 0.5 * (g || 1), a: d * 0.5, verb: 0.3 });
      k.noise(t, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 200], [d * 0.55, (top || 700) * 1.3], [d, 250]], q: 1.2, gain: 0.07 * (g || 1), a: d * 0.55 }); };
    // plankton shimmer: soft, low-passed glints
    const shimmer = (t, d, g) => { const notes = [587, 698, 880, 988, 1175, 784];
      for (let x = 0; x < d; x += 0.06 + R() * 0.05) k.tone(t + x, { f: notes[Math.floor(R() * notes.length)], dur: 0.45, gain: 0.022 * (g || 1), a: 0.015, filter: 'lowpass', f2: 1300, verb: 0.45, pan: R() * 1.4 - 0.7 });
      k.noise(t, { dur: d, color: 'pink', filter: 'bandpass', f: 1100, q: 2, gain: 0.025 * (g || 1), a: d * 0.4 }); };
    // low murmur of the current drawing on
    const stream = (t, d, g, pan) => k.noise(t, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 260], [d, 620]], q: 1.6, gain: 0.1 * (g || 1), a: d * 0.3, pan: pan || 0 });
    const chord = (t, notes, d, g) => notes.forEach((n, i) => { k.tone(t, { f: n, type: i ? 'sine' : 'triangle', dur: d, gain: 0.06 * g, a: 0.08, hold: d * 0.35, verb: 0.5, pan: (i - (notes.length - 1) / 2) * 0.3, filter: 'lowpass', f2: 1400 }); });
    const odo = (val, a, b, gap, f) => { let last = -1, prev = val(a);
      for (let t = a; t <= b; t += 0.002) { const v = val(t); if (v !== prev && t - last >= gap) { k.play('tock', t, { f, gain: 0.55, pan: -0.3, minor: true }); last = t; } prev = v; } };

    // ---- beds: deep rumble, slow current, a calm dark pad
    k.bed('room', 0, D, { gain: 1.6 });
    k.withMinor(() => { k.noise(0, { dur: D, color: 'brown', filter: 'lowpass', f: 90, gain: 0.16, a: 1.2, hold: D - 2.4, bus: 'amb' });
      for (let x = 0.5; x < D - 2; x += 3.2) k.noise(x, { dur: 3.4, color: 'pink', filter: 'bandpass', f: [[0, 180], [1.7, 360], [3.4, 200]], q: 0.9, gain: 0.04, a: 1.6, bus: 'amb', pan: Math.sin(x) * 0.5 }); });
    k.music('pad', 0, D, { bpm: 60, gain: 0.5, chords: [['D3', 'A3', 'C4', 'F4'], ['Bb2', 'F3', 'A3', 'D4'], ['G2', 'D3', 'F3', 'Bb3'], ['A2', 'E3', 'G3', 'C#4']] });

    // ---- beat 1: plankton gathers into the question
    k.withMinor(() => shimmer(T.g0, T.g1 - T.g0, 1));
    ping(T.crisp[0] + 0.05, 'A4', 0.9);
    // header glides to the corner: a soft low slide
    k.noise(T.head[0], { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.6, 250]], q: 1, gain: 0.06, a: 0.25, minor: true });
    // the descent: a muffled swell, bubbles streaming past
    swell(T.desc[0], 1.2, 1.1, 650);
    k.withMinor(() => bubbles(T.desc[0] + 0.2, 7, 0.8, 0.8));

    // ---- beat 2: data swarms ride the current into the model
    k.withMinor(() => stream(T.arr2[0], T.arr2[1] - T.arr2[0] + 0.2, 1, -0.3));
    ping(T.modelLbl, 'D4', 0.6, 0.4);                       // "AI model" lands
    swTimes.forEach((st, i) => {
      const pan = -0.7 + i * 0.05;
      k.withMinor(() => k.noise(st, { dur: 0.5, color: 'pink', filter: 'bandpass', f: 900, q: 2, gain: 0.03, a: 0.3, pan })); // swarm gathers
      k.play('pop', st + 0.1 * T.swDur + 0.03, { f: 360, gain: 0.65, pan, minor: true });   // label lands (soft, low)
      const ta = st + 0.85 * T.swDur;                                                        // absorbed into the tentacles
      k.withMinor(() => { k.tone(ta, { f: [[0, 260], [0.18, 120]], dur: 0.25, gain: 0.12, a: 0.01, filter: 'lowpass', f2: 900, pan: 0.4, verb: 0.3 }); bubble(ta + 0.08, 300, 0.6, 0.45); });
    });
    // counter rolls to 1,000,000 (value = 10^(6*inOut(p)) - 1)
    odo((t) => { const p = sm(T.cnt[0], T.cnt[1], t); return p >= 1 ? 1e6 : Math.round(Math.pow(10, 6 * E.inOut(p)) - 1); }, T.cnt[0] + 0.02, T.cnt[1], 0.09, 620);
    ping(T.cnt[1], 'A3', 0.8, -0.4);

    // ---- bloom sweeps across
    swell(T.bloom[0] - 0.05, 0.85, 1.0, 900);
    shimmer(T.bloom[0], T.bloom[1] - T.bloom[0], 1.5);

    // ---- beat 3: guess -> check -> adjust
    k.withMinor(() => shimmer(T.cat3[0], T.cat3[1] - T.cat3[0], 0.7));
    k.withMinor(() => stream(T.guessArc[0], T.guessArc[1] - T.guessArc[0] + 0.15, 0.9, 0.2));
    k.play('pop', T.guessLbl + 0.03, { f: 340, gain: 0.65, pan: 0.2, minor: true });
    // "dog?" — an uncertain, wavering glow
    k.tone(T.dogQ, { f: [[0, 330], [0.25, 370], [0.5, 311]], type: 'triangle', dur: 0.7, gain: 0.09, a: 0.04, hold: 0.3, filter: 'lowpass', f2: 900, verb: 0.35, pan: -0.3 });
    k.tone(T.dogQ, { f: 311, type: 'sine', dur: 0.7, gain: 0.05, a: 0.05, hold: 0.3, verb: 0.35, pan: -0.3 });
    // check: wrong — a muffled low double tone
    k.tone(T.check, { f: [[0, 233], [0.14, 208]], type: 'triangle', dur: 0.2, gain: 0.2, a: 0.004, hold: 0.1, filter: 'lowpass', f2: 700, pan: -0.2 });
    k.tone(T.check + 0.18, { f: [[0, 185], [0.25, 150]], type: 'triangle', dur: 0.34, gain: 0.2, a: 0.004, hold: 0.16, filter: 'lowpass', f2: 600, pan: -0.2 });
    k.play('thud', T.check, { f: 90, gain: 0.35 });
    k.play('pop', T.check + 0.15, { f: 300, gain: 0.65, pan: 0.6, minor: true });      // "Check" lands
    // adjust: the error signal flows back along the lower arc
    k.noise(T.adjArc[0], { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 900], [0.5, 260]], q: 2.2, gain: 0.16, a: 0.25, pan: 0.3, verb: 0.3 });
    k.play('pop', T.adjLbl + 0.03, { f: 280, gain: 0.65, pan: 0.2, minor: true });
    // the ripple through the nerve net: a deep swell + droplets crossing the bell right to left
    swell(T.ripple[0], 0.9, 0.8, 500);
    [784, 698, 587, 523, 440, 392].forEach((f, i) => k.tone(T.ripple[0] + 0.05 + i * 0.1, { f, dur: 0.6, gain: 0.05, a: 0.006, verb: 0.5, filter: 'lowpass', f2: 1300, pan: 0.5 - i * 0.18, minor: i > 0 }));
    // guess again, pulse rides the top arc
    k.withMinor(() => stream(T.again[0], 0.4, 0.7, 0.2));
    // right answer: a warm, open interval
    ping(T.catOk, 'A4', 1.0, -0.3);
    k.tone(T.catOk + 0.09, { f: 'E5', dur: 1.3, gain: 0.08, a: 0.008, verb: 0.5, pan: -0.2 });
    k.tone(T.catOk, { f: 'A3', type: 'triangle', dur: 1.2, gain: 0.06, a: 0.02, filter: 'lowpass', f2: 900, verb: 0.4 });

    // ---- darkness, then the anglerfish lure lights new water
    swell(T.dark[0] - 0.05, 0.9, 0.9, 380);
    const ft = T.fish[0];
    k.withMinor(() => { for (let i = 0; i < 5; i++) k.noise(ft + 0.06 + i * 0.055, { dur: 0.035, color: 'brown', filter: 'bandpass', f: 420, q: 2, gain: 0.14 }); }); // lure flickers on
    k.tone(ft + 0.3, { f: 'D3', type: 'triangle', dur: 1.4, gain: 0.07, a: 0.2, filter: 'lowpass', f2: 700, verb: 0.4, pan: -0.5 });
    swell(T.reveal[0], 0.9, 0.9, 800);
    ping(10.78, 'D4', 0.6, -0.3);                                   // "Accuracy" lands
    odo((t) => Math.round(61 + 36 * E.out(sm(T.acc[0], T.acc[1], t))), T.acc[0] + 0.01, T.acc[1] - 0.02, 0.085, 560);

    // ---- 97%: the bloom burst — deep warm swell, sub hit, chord and a plankton shimmer
    const B = T.burst;
    k.tone(B, { f: [[0, 98], [0.5, 55]], dur: 0.9, gain: 0.4, a: 0.005 });
    k.play('thud', B, { f: 80, gain: 0.6 });
    swell(B - 0.02, 1.4, 1.2, 1000);
    chord(B + 0.02, ['D3', 'A3', 'D4', 'F#4', 'A4'], 1.6, 1.1);
    shimmer(B + 0.05, 0.9, 1.6);

    // ---- takeaway forms out of the light, resolving chord
    k.withMinor(() => shimmer(T.take[0], T.take[1] - T.take[0], 1));
    k.noise(T.take[1] - 0.2, { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.4, 700]], q: 1.5, gain: 0.06, a: 0.2, pan: 0.3, minor: true }); // arrow streams on
    chord(T.takeCrisp[0] + 0.1, ['G2', 'D3', 'B3', 'D4', 'G4'], 1.4, 0.9);
    ping(T.takeCrisp[0] + 0.1, 'B4', 0.5, 0.2);
  }

  registerStyle({
    id: 'deep-sea',
    name: 'Bioluminescent Deep Sea',
    category: 'Light & Imaging',
    description: 'The midnight zone: near-black water with parallax marine snow, and nothing lit but living light — a jellyfish whose nerve net glows like a neural network, a siphonophore chain, a rainbow-rippling comb jelly and an anglerfish lure. Additive cyan, teal and electric-blue glow with magenta and amber accents; type is bioluminescent.',
    motion: 'The camera sinks (marine snow streams upward) as animals switch on one by one: bell rims pulse, nerve-net nodes flicker alight, the siphonophore lights segment by segment, the lure blinks on, and the words form out of gathering plankton.',
    fonts: [F.title(66), F.title(38), F.title(80), F.label(30), F.titleI(84), F.titleI(64), F.num(132), F.label(34), F.hud(15)],
    frameT: 5.6,
    duration: 6,
    readsPixels: true,
    draw(ctx, W, Hh, t) { hero(ctx, W, Hh, t); },
    explainerDuration: T.D,
    explainerNote: 'A descent through the midnight zone: the question forms from gathering plankton, cat and dog swarms ride a glowing current into a jellyfish model whose nerve net is its weights, the error ripples back through the net in magenta, accuracy climbs a siphonophore chain to a plankton bloom-burst, and transitions are a descent, a sweeping plankton bloom and an anglerfish lure lighting new water.',
    explainer(ctx, W, Hh, t) { explainer(ctx, W, Hh, t); },
    explainerSound(k) { deepSound(k); },
  });
}
