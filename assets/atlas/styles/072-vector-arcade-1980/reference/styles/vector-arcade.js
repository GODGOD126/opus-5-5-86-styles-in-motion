{
  // ---------- 1980 XY vector monitor: thin beams on black, additive bloom, vertex dwell dots, stroke font ----------
  const GLYPH = {
    A: [[[0, 6], [0, 2], [2, 0], [4, 2], [4, 6]], [[0, 4], [4, 4]]],
    B: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]], [[3, 3], [4, 4], [4, 5], [3, 6], [0, 6]]],
    C: [[[4, 0], [0, 0], [0, 6], [4, 6]]],
    D: [[[0, 0], [2, 0], [4, 2], [4, 4], [2, 6], [0, 6], [0, 0]]],
    E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
    F: [[[4, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]],
    G: [[[4, 1], [4, 0], [0, 0], [0, 6], [4, 6], [4, 3], [2, 3]]],
    H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
    I: [[[0, 0], [4, 0]], [[2, 0], [2, 6]], [[0, 6], [4, 6]]],
    J: [[[4, 0], [4, 6], [2, 6], [0, 4]]],
    K: [[[0, 0], [0, 6]], [[4, 0], [0, 3], [4, 6]]],
    L: [[[0, 0], [0, 6], [4, 6]]],
    M: [[[0, 6], [0, 0], [2, 2], [4, 0], [4, 6]]],
    N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
    O: [[[0, 0], [4, 0], [4, 6], [0, 6], [0, 0]]],
    P: [[[0, 6], [0, 0], [4, 0], [4, 3], [0, 3]]],
    Q: [[[0, 0], [4, 0], [4, 4], [2, 6], [0, 6], [0, 0]], [[2, 4], [4, 6]]],
    R: [[[0, 6], [0, 0], [4, 0], [4, 3], [0, 3], [4, 6]]],
    S: [[[4, 0], [0, 0], [0, 3], [4, 3], [4, 6], [0, 6]]],
    T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
    U: [[[0, 0], [0, 6], [4, 6], [4, 0]]],
    V: [[[0, 0], [2, 6], [4, 0]]],
    W: [[[0, 0], [0, 6], [2, 4], [4, 6], [4, 0]]],
    X: [[[0, 0], [4, 6]], [[4, 0], [0, 6]]],
    Y: [[[0, 0], [2, 2], [4, 0]], [[2, 2], [2, 6]]],
    Z: [[[0, 0], [4, 0], [0, 6], [4, 6]]],
    0: [[[0, 0], [4, 0], [4, 6], [0, 6], [0, 0]]],
    1: [[[2, 0], [2, 6]]],
    2: [[[0, 0], [4, 0], [4, 3], [0, 3], [0, 6], [4, 6]]],
    3: [[[0, 0], [4, 0], [4, 6], [0, 6]], [[0, 3], [4, 3]]],
    4: [[[0, 0], [0, 3], [4, 3]], [[4, 0], [4, 6]]],
    5: [[[4, 0], [0, 0], [0, 3], [4, 3], [4, 6], [0, 6]]],
    6: [[[0, 0], [0, 6], [4, 6], [4, 3], [0, 3]]],
    7: [[[0, 0], [4, 0], [4, 6]]],
    8: [[[0, 0], [4, 0], [4, 6], [0, 6], [0, 0]], [[0, 3], [4, 3]]],
    9: [[[4, 3], [0, 3], [0, 0], [4, 0], [4, 6]]],
    '-': [[[1, 3], [3, 3]]],
  };

  // ================= EXPLAINER: "How does AI learn?" as a vector-HUD sequence =================
  const EXG = Object.assign({}, GLYPH, {
    '?': [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [2, 3.5], [2, 4.6]], [[2, 5.7], [2, 6]]],
    '%': [[[0, 6], [4, 0]], [[0, 0], [1.2, 0], [1.2, 1.2], [0, 1.2], [0, 0]], [[2.8, 4.8], [4, 4.8], [4, 6], [2.8, 6], [2.8, 4.8]]],
    ',': [[[2, 5.2], [1.4, 7]]],
    '.': [[[2, 5.7], [2, 6]]],
    ':': [[[2, 1.5], [2, 2]], [[2, 4.5], [2, 5]]],
    '>': [[[0, 0], [4, 3], [0, 6]]],
    '~': [[[0, 3], [4, 3]], [[2.5, 1.4], [4, 3], [2.5, 4.6]]], // used as a right arrow glyph
  });
  // ---------- shared beam renderer (hero + explainer use the same passes) ----------
  // Beam core layer (1.7px + dwell dots), fat halo layer (5px). Wide halos are blurred at half resolution (cheaper,
  // identical look), then the tube glass is laid over: faint P31 face glow, a soft diagonal reflection of the cabinet,
  // rounded-tube corner falloff and the vignette.
  const glassCache = {};
  function glassLayer(W, H_) {
    const key = W + 'x' + H_;
    if (glassCache[key]) return glassCache[key];
    const G = H.layer(W, H_), g = G.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H_); // opaque, drawn in 'screen' mode so black = no change
    // faint glow of the phosphor face (the black is lit glass, not a void)
    const rg = g.createRadialGradient(W * 0.5, H_ * 0.52, 0, W * 0.5, H_ * 0.52, W * 0.62);
    rg.addColorStop(0, 'rgba(20,40,30,0.55)'); rg.addColorStop(0.6, 'rgba(12,26,20,0.3)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(0, 0, W, H_);
    // tube glare up-left (as the hero had) + a soft diagonal reflection band of the cabinet
    const gl = g.createRadialGradient(W * 0.3, H_ * 0.2, 0, W * 0.3, H_ * 0.2, W * 0.5); gl.addColorStop(0, 'rgba(120,160,140,0.05)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gl; g.fillRect(0, 0, W, H_);
    g.save(); g.translate(W * 0.62, H_ * 0.3); g.rotate(-0.55);
    const band = g.createLinearGradient(0, -90, 0, 90);
    band.addColorStop(0, 'rgba(150,190,170,0)'); band.addColorStop(0.45, 'rgba(150,190,170,0.04)'); band.addColorStop(0.55, 'rgba(150,190,170,0.05)'); band.addColorStop(1, 'rgba(150,190,170,0)');
    g.fillStyle = band; g.fillRect(-W, -90, W * 2, 180); g.restore();
    // fine phosphor-screen grain (static, very faint)
    const gr = H.rng(1981), id = g.getImageData(0, 0, W, H_), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const v = gr() * 3.5; d[i] += v * 0.6; d[i + 1] += v; d[i + 2] += v * 0.8; }
    g.putImageData(id, 0, 0);
    // rounded tube corners: the curved faceplate falls off into the bezel
    const M = H.layer(W, H_), m = M.getContext('2d');
    m.fillStyle = '#000'; m.fillRect(0, 0, W, H_);
    m.globalCompositeOperation = 'destination-out'; m.filter = 'blur(18px)';
    m.beginPath(); m.roundRect(10, 8, W - 20, H_ - 16, 90); m.fill();
    m.globalCompositeOperation = 'source-over'; m.filter = 'none';
    H.vignette(m, W, H_, 0.6); // baked: same vignette the frame used to draw live
    const out = { glass: G, bezel: M };
    return (glassCache[key] = out);
  }
  let halfA = null, halfB = null, halfT = null;
  function renderBeams(ctx, W, H_, strokes, r, flick, jit = 0.2) {
    const gls = glassLayer(W, H_);
    ctx.drawImage(gls.glass, 0, 0); // opaque lit-glass base (black + faint face glow, glare, grain)
    const beam = H.layer(W, H_), b = beam.getContext('2d');
    b.lineCap = 'round'; b.lineJoin = 'round'; b.globalCompositeOperation = 'lighter';
    const fat = H.layer(W, H_), fb = fat.getContext('2d');
    fb.lineCap = 'round'; fb.lineJoin = 'round'; fb.globalCompositeOperation = 'lighter';
    strokes.forEach((s) => {
      // long strokes are swept faster -> dimmer; per-stroke beam jitter
      let L = 0; for (let i = 1; i < s.pts.length; i++) L += Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1]);
      const inten = s.a * flick * (1 - jit + jit * r()) * H.clamp(1.25 - L / 2600, 0.55, 1);
      const [cr, cg, cb] = s.col;
      b.strokeStyle = `rgba(${cr},${cg},${cb},${inten})`; b.lineWidth = 1.7;
      b.beginPath(); s.pts.forEach(([x, y], i) => (i ? b.lineTo(x + (r() - 0.5) * 0.4, y + (r() - 0.5) * 0.4) : b.moveTo(x, y))); b.stroke();
      // dwell dots at vertices (beam pauses = brighter)
      if (!s.ghost) {
        b.fillStyle = `rgba(${Math.min(255, cr + 60)},${Math.min(255, cg + 40)},${Math.min(255, cb + 60)},${inten * 0.9})`;
        s.pts.forEach(([x, y]) => { b.beginPath(); b.arc(x, y, 1.6, 0, 7); b.fill(); });
      }
      if (s.ghost) return; // decaying phosphor is too dim to feed the halo
      fb.strokeStyle = `rgba(${cr},${cg},${cb},${s.a * 0.55})`; fb.lineWidth = 5; fb.beginPath(); s.pts.forEach(([x, y], i) => (i ? fb.lineTo(x, y) : fb.moveTo(x, y))); fb.stroke();
    });
    // low-res copies for the wide halos: downsample first, then blur the small canvas (much cheaper than blurring
    // at full size; a 22px/14px halo has no detail to lose)
    const hw = W >> 2, hh = H_ >> 2;
    if (!halfA || halfA.width !== hw) { halfA = H.layer(hw, hh); halfB = H.layer(hw, hh); halfT = H.layer(hw, hh); }
    const ha = halfA.getContext('2d'), hb = halfB.getContext('2d'), ht = halfT.getContext('2d');
    ht.clearRect(0, 0, hw, hh); ht.drawImage(fat, 0, 0, hw, hh);
    ha.clearRect(0, 0, hw, hh); ha.filter = 'blur(5.5px)'; ha.drawImage(halfT, 0, 0); ha.filter = 'none';
    ht.clearRect(0, 0, hw, hh); ht.globalCompositeOperation = 'lighter'; ht.drawImage(beam, 0, 0, hw, hh); ht.drawImage(beam, 0, 0, hw, hh); ht.globalCompositeOperation = 'source-over';
    hb.clearRect(0, 0, hw, hh); hb.filter = 'blur(3.5px)'; hb.drawImage(halfT, 0, 0); hb.filter = 'none';
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.75; ctx.drawImage(halfA, 0, 0, W, H_);
    ctx.filter = 'blur(8px)'; ctx.globalAlpha = 0.6; ctx.drawImage(fat, 0, 0);
    ctx.filter = 'none'; ctx.globalAlpha = 0.9; ctx.drawImage(halfB, 0, 0, W, H_);
    ctx.filter = 'blur(4px)'; ctx.globalAlpha = 1; ctx.drawImage(beam, 0, 0);
    ctx.filter = 'blur(1.5px)'; ctx.drawImage(beam, 0, 0);
    ctx.filter = 'none'; ctx.globalAlpha = 0.9; ctx.drawImage(beam, 0, 0);
    // white-hot centre on top of the core lines
    ctx.globalAlpha = 0.35; ctx.filter = 'brightness(1.6)'; ctx.drawImage(beam, 0, 0);
    ctx.restore();
    ctx.drawImage(gls.bezel, 0, 0);
  }
  const exBeams = (ctx, W, H_, strokes, r, flick) => renderBeams(ctx, W, H_, strokes, r, flick, 0.2);

  function vecExplainer(ctx, W, H_, t) {
    const r = H.rng(77 + Math.floor(t * 30));
    const GREEN = [110, 255, 120], RED = [255, 70, 50], WHITE = [210, 255, 220];
    const flick = 0.93 + 0.07 * r();
    const cx = W / 2, cyc = H_ / 2;
    const strokes = [];
    let REV = 1, ZOOM = 1, GHOST = false;
    const cut = (pts, f) => {
      if (f >= 1) return pts; if (f <= 0) return [];
      let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      let left = L * f; const out = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (d >= left) { const k = d ? left / d : 0; out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]); break; }
        out.push(pts[i]); left -= d;
      }
      return out;
    };
    const poly = (pts, col = GREEN, a = 1) => {
      pts = cut(pts, REV);
      if (ZOOM !== 1) pts = pts.map(([x, y]) => [cx + (x - cx) * ZOOM, cyc + (y - cyc) * ZOOM]);
      if (pts.length > 1 && a > 0.01) strokes.push({ pts, col, a, ghost: GHOST });
    };
    // phosphor persistence (P31 decay): moving strokes leave a fading smear of copies over the last ~50 ms
    const LAGS = [[0.048, 0.07], [0.036, 0.12], [0.024, 0.2], [0.012, 0.32]];
    const trail = (fn) => { GHOST = true; LAGS.forEach(([lag, ga]) => fn(t - lag, ga)); GHOST = false; fn(t, 1); };
    const ph = (a, d) => H.ease.inOut(H.clamp((t - a) / d));
    const text = (str, x, y, sz, col, a = 1, track = 1.6) => {
      let px = x; const nC = REV * str.length, rev0 = REV;
      for (let ci = 0; ci < str.length; ci++) {
        const g = EXG[str[ci]]; REV = H.clamp(nC - ci);
        if (g && REV > 0) g.forEach((pl) => poly(pl.map(([gx, gy]) => [px + gx * sz, y + gy * sz]), col, a));
        px += sz * 4 + sz * track;
      }
      REV = rev0; return px - x;
    };
    const tw = (str, sz, track = 1.6) => str.length * (sz * 4 + sz * track) - sz * track;
    const ctext = (str, x, y, sz, col, a, track) => text(str, x - tw(str, sz, track) / 2, y, sz, col, a, track);
    const arrow = (x1, y1, x2, y2, col, a = 1) => {
      const ang = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), f = REV;
      const ex = x1 + (x2 - x1) * f, ey = y1 + (y2 - y1) * f;
      const r0 = REV; REV = 1;
      poly([[x1, y1], [ex, ey]], col, a);
      if (f > 0.05) poly([[ex + Math.cos(ang + 2.6) * 16, ey + Math.sin(ang + 2.6) * 16], [ex, ey], [ex + Math.cos(ang - 2.6) * 16, ey + Math.sin(ang - 2.6) * 16]], col, a);
      REV = r0; return L;
    };
    const box = (x, y, w, h, col, a = 1) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], col, a);
    const brackets = (x, y, w, h, s, col, a = 1) => {
      poly([[x, y + s], [x, y], [x + s, y]], col, a); poly([[x + w - s, y], [x + w, y], [x + w, y + s]], col, a);
      poly([[x, y + h - s], [x, y + h], [x + s, y + h]], col, a); poly([[x + w - s, y + h], [x + w, y + h], [x + w, y + h - s]], col, a);
    };
    const shape = (pts, x, y, s, col, a = 1, close = true) => poly((close ? [...pts, pts[0]] : pts).map(([px, py]) => [x + px * s, y + py * s]), col, a);
    const cat = (x, y, s, col, a = 1) => {
      shape([[-1, -0.1], [-0.85, -1], [-0.35, -0.55], [0.35, -0.55], [0.85, -1], [1, -0.1], [0.8, 0.6], [0, 0.9], [-0.8, 0.6]], x, y, s, col, a);
      shape([[-0.45, -0.1], [-0.25, -0.1]], x, y, s, col, a, false); shape([[0.25, -0.1], [0.45, -0.1]], x, y, s, col, a, false);
      shape([[-0.1, 0.25], [0.1, 0.25], [0, 0.38], [-0.1, 0.25]], x, y, s, col, a, false);
      shape([[-0.3, 0.35], [-1.1, 0.2]], x, y, s, col, a, false); shape([[0.3, 0.35], [1.1, 0.2]], x, y, s, col, a, false);
    };
    const dog = (x, y, s, col, a = 1) => {
      shape([[-0.6, -0.75], [0.6, -0.75], [0.72, 0.3], [0.3, 0.85], [-0.3, 0.85], [-0.72, 0.3]], x, y, s, col, a);
      shape([[-0.6, -0.75], [-1.05, -0.45], [-0.95, 0.35], [-0.66, 0.1]], x, y, s, col, a, false);
      shape([[0.6, -0.75], [1.05, -0.45], [0.95, 0.35], [0.66, 0.1]], x, y, s, col, a, false);
      shape([[-0.3, -0.2], [-0.15, -0.2]], x, y, s, col, a, false); shape([[0.15, -0.2], [0.3, -0.2]], x, y, s, col, a, false);
      shape([[-0.15, 0.3], [0.15, 0.3], [0, 0.45]], x, y, s, col, a);
    };
    const check = (x, y, s, col, a = 1) => poly([[x - s, y], [x - s * 0.3, y + s * 0.7], [x + s, y - s * 0.9]], col, a);
    const cross = (x, y, s, col, a = 1) => { poly([[x - s, y - s], [x + s, y + s]], col, a); poly([[x + s, y - s], [x - s, y + s]], col, a); };
    // wireframe icosahedron "model core" in 2D (weak perspective), optional vertex wobble = weights moving
    const phi = (1 + Math.sqrt(5)) / 2;
    const icoV = [[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0], [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi], [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]];
    const icoE = []; for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) { const d = Math.hypot(icoV[i][0] - icoV[j][0], icoV[i][1] - icoV[j][1], icoV[i][2] - icoV[j][2]); if (Math.abs(d - 2) < 0.01) icoE.push([i, j]); }
    const core = (x, y, s, col, a = 1, wob = 0, rev = 1, tt = t) => {
      const ca = tt * 0.6, cb = tt * 0.37;
      const P = icoV.map((v, k) => {
        let [vx, vy, vz] = v.map((q) => q + (wob ? Math.sin(tt * 9 + k * 2.1) * wob : 0));
        let y1 = vy * Math.cos(cb) - vz * Math.sin(cb), z1 = vy * Math.sin(cb) + vz * Math.cos(cb);
        let x2 = vx * Math.cos(ca) - z1 * Math.sin(ca), z2 = vx * Math.sin(ca) + z1 * Math.cos(ca);
        const pz = 1 / (1 + z2 * 0.08);
        return [x + x2 * s * pz, y + y1 * s * pz];
      });
      const r0 = REV, k = rev * icoE.length;
      icoE.forEach(([i, j], e) => { REV = H.clamp(k - e); if (REV > 0) poly([P[i], P[j]], col, a); });
      REV = r0;
    };
    // the hero's mountain range (same seed and silhouette) standing on the y=520 ground line
    const MTN = []; { const rs = H.rng(42); for (let i = 0; i <= 26; i++) { const x = -200 + i * ((W + 400) / 26); const h = (i % 2 ? 10 + rs() * 30 : 40 + rs() * 70); MTN.push([x, 520 - h * (i > 9 && i < 15 ? 0.45 : 1)]); } }
    const fmt = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const streaks = (k, a) => { const rs = H.rng(5); for (let i = 0; i < 46; i++) { const ang = rs() * 6.283, d0 = 40 + rs() * 300; const d1 = d0 + 60 + k * 900; poly([[cx + Math.cos(ang) * d0 * (1 + k * 2), cyc + Math.sin(ang) * d0 * (1 + k * 2)], [cx + Math.cos(ang) * d1, cyc + Math.sin(ang) * d1]], GREEN, a); } };

    // ---------- persistent HUD: the question, once it has shrunk into the corner ----------
    const hdrK = ph(1.7, 0.6);
    {
      const sz = H.lerp(10, 4, hdrK), x = H.lerp(cx - tw('HOW DOES AI LEARN?', 10) / 2, 40, hdrK), y = H.lerp(290, 34, hdrK);
      REV = H.clamp((t - 0.15) / 0.9);
      text('HOW DOES AI LEARN?', x, y, sz, hdrK > 0.5 ? RED : GREEN, 1);
      REV = 1;
      if (hdrK >= 1) poly([[40, 70], [40 + tw('HOW DOES AI LEARN?', 4), 70]], RED, 0.6);
    }

    // ---------- BEAT 1 -> 2: the model core appears, then the DATA stream ----------
    if (t < 6.4) {
      ZOOM = t > 5.8 ? 1 + Math.pow((t - 5.8) / 0.6, 2) * 9 : 1;   // warp INTO the core
      const coreX = cx + 180, coreY = 360;
      REV = ph(0.9, 0.5); poly([[0, 520], [W, 520]], GREEN, 0.5);
      poly(MTN, GREEN, 0.2); REV = 1;
      trail((tt, ga) => core(coreX, coreY, 70, WHITE, ga, 0, ph(1.95, 1.0), tt));
      if (t > 2.4) { REV = ph(2.4, 0.4); poly([[coreX, coreY + 130], [coreX, coreY + 168]], GREEN, 0.8); REV = ph(2.6, 0.4); ctext('MODEL', coreX, coreY + 178, 6, GREEN, 1); REV = 1; }
      // the stream arrow
      if (t > 2.6) { REV = ph(2.6, 0.5); arrow(90, 520, coreX - 120, 470, GREEN, 0.7); REV = ph(2.9, 0.4); text('TRAINING DATA', 100, 540, 5, GREEN, 0.95); REV = 1; }
      // labelled examples fly along the arrow into the core
      for (let i = 0; i < 9; i++) {
        const t0 = 2.6 + i * 0.34;
        if (t < t0 || t > t0 + 1.5) continue;
        const isCat = (i * 7) % 3 !== 0;
        trail((tt, ga) => {
          const k = (tt - t0) / 1.5; if (k < 0 || k > 1) return;
          const x = H.lerp(-80, coreX - 40, k), y = H.lerp(400, coreY, Math.pow(k, 2)) - Math.sin(k * Math.PI) * 30;
          const s = 46 * (1 - Math.pow(k, 3) * 0.85);
          box(x - s * 1.25, y - s * 1.25, s * 2.5, s * 2.5, GREEN, 0.75 * ga);
          (isCat ? cat : dog)(x, y - s * 0.12, s * 0.8, GREEN, 0.95 * ga);
          if (s > 20 && ga === 1) text(isCat ? 'CAT' : 'DOG', x - tw('CAT', s / 9) / 2, y + s * 1.4, s / 9, isCat ? GREEN : WHITE, 1);
        });
      }
      // counter readout
      if (t > 2.8) {
        const n = 1e6 * Math.pow(H.clamp((t - 2.9) / 2.6), 2.2);
        REV = ph(2.8, 0.3); box(40, 90, 560, 130, RED, 0.7); text('EXAMPLES SEEN', 60, 104, 4.2, RED, 0.95); REV = 1;
        text(fmt(n), 60, 140, 11, GREEN, 1, 1.3);
      }
      if (t > 5.8) streaks((t - 5.8) / 0.6, 0.6);
      ZOOM = 1;
    }

    // ---------- BEAT 3: GUESS -> CHECK -> ADJUST loop ----------
    if (t >= 6.4 && t < 10.9) {
      ZOOM = t < 6.75 ? Math.pow((t - 6.4) / 0.35, 0.6) : t > 10.5 ? 1 - Math.pow((t - 10.5) / 0.4, 2) : 1;
      if (t < 6.8) streaks(1 - (t - 6.4) / 0.4, 0.4);
      const picX = 260, picY = 380, coreX = 840, coreY = 360;
      // loop indicator across the top: GUESS > CHECK > ADJUST, with return arrow
      const phase = t < 7.5 ? 0 : t < 8.4 ? 1 : t < 9.4 ? 2 : 0;
      const items = ['GUESS', 'CHECK', 'ADJUST'], ix = [400, 640, 890];
      items.forEach((s, i) => {
        const on = i === phase;
        ctext(s, ix[i], 104, 5, on ? WHITE : GREEN, on ? 1 : 0.5);
        if (on) brackets(ix[i] - tw(s, 5) / 2 - 16, 90, tw(s, 5) + 32, 58, 10, WHITE, 1);
        if (i < 2) { REV = 1; arrow(ix[i] + tw(s, 5) / 2 + 12, 120, ix[i + 1] - tw(items[i + 1], 5) / 2 - 12, 120, GREEN, 0.5); }
      });
      poly([[ix[2], 152], [ix[2], 172], [ix[0], 172]], GREEN, 0.45); arrow(ix[0], 172, ix[0], 154, GREEN, 0.45);
      // dim horizon + mountain range behind the loop (broken where the NEW PICTURE caption sits)
      poly([[0, 520], [picX - 140, 520]], GREEN, 0.2); poly([[picX + 140, 520], [W, 520]], GREEN, 0.2);
      poly(MTN, GREEN, 0.14);
      // the new picture (a cat) in a targeting frame
      box(picX - 110, picY - 110, 220, 220, GREEN, 0.8);
      cat(picX, picY, 70, GREEN, 1);
      REV = 1; text('NEW PICTURE', picX - tw('NEW PICTURE', 4.2) / 2, picY + 126, 4.2, GREEN, 0.9);
      // model core with dials
      trail((tt, ga) => core(coreX, coreY, 85, WHITE, ga, tt > 8.5 && tt < 9.4 ? 0.22 * (1 - (tt - 8.5) / 0.9) : 0, 1, tt));
      // GUESS beam from picture into model and out to readout
      const g1 = ph(6.8, 0.45);
      REV = g1; arrow(picX + 125, picY, coreX - 120, coreY, GREEN, 0.9); REV = 1;
      const g2 = t > 9.4 ? ph(9.45, 0.4) : 0;
      if (g2 > 0 && g2 < 1) { const px = H.lerp(picX + 125, coreX - 120, g2), py = H.lerp(picY, coreY, g2); cross(px, py, 6, WHITE, 1); }
      const rx = coreX + 175, ry = coreY - 40;
      if (t > 7.15 && t < 9.4) {
        REV = H.clamp((t - 7.15) / 0.3); text('DOG?', rx, ry, 7, t > 7.5 ? RED : GREEN, 1); REV = 1;
        if (t > 7.5) { // CHECK: wrong!
          const bl = Math.floor((t - 7.5) * 8) % 2 === 0 || t > 8.0;
          if (bl) cross(rx + 90, ry + 22, 46, RED, 1);
          if (bl) brackets(picX - 126, picY - 126, 252, 252, 26, RED, 1);
          REV = ph(7.6, 0.4); text('IT IS A CAT', picX - tw('IT IS A CAT', 5) / 2, picY - 160, 5, RED, 1); REV = 1;
        }
      }
      // ADJUST: error pulse travels back, dials turn, connections re-shape
      if (t > 8.3) {
        const ek = H.clamp((t - 8.35) / 0.55);
        const path = [[rx + 40, ry + 60], [rx + 40, coreY + 150], [coreX, coreY + 150]];
        REV = ek; poly(path, RED, 0.9); REV = 1;
        if (ek > 0 && ek < 1) { const p = cut(path, ek); const [ex, ey] = p[p.length - 1]; box(ex - 8, ey - 8, 16, 16, RED, 1); }
        if (t > 8.4 && t < 9.4) { REV = ph(8.4, 0.3); text('ERROR', rx + 54, coreY + 124, 5, RED, 1); REV = 1; }
      }
      // weight dials under the core (knobs)
      ['W1', 'W2', 'W3'].forEach((s, i) => {
        const dx = coreX - 150 + i * 150, dy = 600, R = 38;
        const circ = []; for (let a = 0; a <= 6.3; a += 0.3) circ.push([dx + Math.cos(a) * R, dy + Math.sin(a) * R]);
        poly(circ, GREEN, 0.7);
        const a0 = [-2.2, -0.6, -1.4][i], a1 = [-0.9, -1.9, 0.2][i];
        trail((tt, ga) => {
          const ang = H.lerp(a0, a1, H.ease.inOut(H.clamp((tt - 8.6 - i * 0.12) / 0.6)));
          poly([[dx, dy], [dx + Math.cos(ang) * (R - 6), dy + Math.sin(ang) * (R - 6)]], t > 8.6 && t < 9.5 ? WHITE : GREEN, ga);
        });
        ctext(s, dx, dy + R + 10, 4, GREEN, 0.9);
      });
      REV = 1; text('WEIGHTS', coreX - 360, 588, 4.2, GREEN, 0.8);
      // second GUESS: correct
      if (t > 9.75) {
        REV = H.clamp((t - 9.75) / 0.3); text('CAT', rx, ry, 7, GREEN, 1); REV = 1;
        if (t > 10.0) { check(rx + 150, ry + 22, 30, GREEN, 1); brackets(picX - 126, picY - 126, 252, 252, 26, GREEN, 1); }
      }
      ZOOM = 1;
    }

    // ---------- BEAT 4: PROGRESS chart ----------
    if (t >= 10.85) {
      ZOOM = t < 11.2 ? H.ease.out((t - 10.85) / 0.35) : 1;
      const ox = 110, oy = 660, aw = 780, ah = 400;
      REV = ph(10.9, 0.4); poly([[ox, oy - ah], [ox, oy], [ox + aw, oy]], GREEN, 0.8); REV = 1;
      for (let k = 1; k <= 4; k++) poly([[ox - 8, oy - (k / 4) * ah], [ox, oy - (k / 4) * ah]], GREEN, 0.6);
      REV = ph(11.0, 0.4); text('TRAINING ROUNDS', ox + aw - tw('TRAINING ROUNDS', 4.2), oy + 8, 4.2, GREEN, 0.9); REV = 1;
      const N = 24, prog = H.clamp((t - 11.1) / 1.7);
      const acc = (i) => 97 - 36 * Math.exp(-i / 5.5);
      const pts = []; for (let i = 0; i <= N * prog + 1e-6; i++) pts.push([ox + (i / N) * aw, oy - ((acc(i) - 50) / 50) * ah]);
      if (prog * N % 1 > 0.01 && pts.length <= N) { const i = N * prog, i0 = Math.floor(i); pts.push([ox + (i / N) * aw, oy - ((H.lerp(acc(i0), acc(i0 + 1), i - i0) - 50) / 50) * ah]); }
      poly(pts, WHITE, 1);
      pts.forEach(([x, y], k) => { if (k % 4 === 0) box(x - 3, y - 3, 6, 6, GREEN, 0.8); });
      const val = Math.round(61 + 36 * H.ease.out(prog));
      const last = pts[pts.length - 1] || [ox, oy];
      text('ACCURACY', 950, 330, 5, GREEN, 0.95);
      text(val + '%', 950, 376, 15, prog >= 1 ? WHITE : GREEN, 1, 1.3);
      // emphasis: lock-on brackets + ring at the 97% point
      if (prog >= 1) {
        const bl = t > 13.0 || Math.floor((t - 12.8) * 8) % 2 === 0;
        if (bl) brackets(930, 310, 330, 170, 24, RED, 1);
        const ring = []; const rr = 26 + Math.max(0, 0.4 - (t - 12.8)) * 80; for (let a = 0; a <= 6.3; a += 0.25) ring.push([last[0] + Math.cos(a) * rr, last[1] + Math.sin(a) * rr]); poly(ring, RED, 1);
      }
      // ---------- BEAT 5: takeaway ----------
      if (t > 13.1) {
        REV = H.clamp((t - 13.1) / 0.55);
        ctext('MORE EXAMPLES ~ BETTER GUESSES', cx, 132, 7, WHITE, 1, 1.4);
        REV = 1;
      }
      ZOOM = 1;
    }
    exBeams(ctx, W, H_, strokes, r, flick);
  }

  // ================= SOUND: a 1979-83 vector cabinet. Discrete analog circuits, no music: a low buzzing beam while
  // strokes draw, the two-note heartbeat thump that speeds up with the counter, laser pews, a hyperspace sweep for the
  // warps, a noise-circuit explosion and alarm warble for the miss, and saw-chord bonus tones for the hits.
  // Cabinet fan + mains hum underneath. Times copied from vecExplainer.
  function vecSound(k) {
    const END = 14.5;
    const px = (x) => H.clamp(x / 1280) * 1.4 - 0.7;
    // vector beam drawing: buzzy low saw through a band, pitch drifts from f0 to f1 over the draw
    const beam = (t, dur, f0, f1, p0 = 0, g = 1) => k.tone(t, { f: [[0, f0], [dur, f1]], type: 'sawtooth', dur, gain: 0.05 * g, a: Math.min(0.04, dur * 0.2), hold: dur * 0.7, filter: 'bandpass', f2: 900, q: 1.5, pan: p0, minor: true });
    const saw = (t, f, dur, gain, o) => k.tone(t, Object.assign({ f, type: 'sawtooth', dur, gain, a: 0.003, hold: dur * 0.5, filter: 'lowpass', f2: 2000 }, o));
    // heartbeat thump (alternating low notes)
    const beat = (t, hi, g = 1) => { k.tone(t, { f: [[0, hi ? 70 : 62], [0.09, 40]], type: 'square', dur: 0.12, gain: 0.085 * g, a: 0.002, hold: 0.04, filter: 'lowpass', f2: 300, minor: true }); };
    // laser pew: fast falling square sweep
    const pew = (t, dur, f0, f1, p = 0, g = 1) => k.tone(t, { f: [[0, f0], [dur, f1]], type: 'square', dur, gain: 0.06 * g, a: 0.002, hold: dur * 0.6, filter: 'lowpass', f2: 2200, pan: p });
    // noise-circuit explosion
    const boom = (t, dur, g = 1, p = 0) => { k.noise(t, { dur, color: 'brown', filter: 'lowpass', f: [[0, 1600], [dur, 120]], gain: 0.55 * g, a: 0.002, pan: p }); k.noise(t, { dur: dur * 0.5, filter: 'lowpass', f: 3000, gain: 0.12 * g, rate: 0.3, a: 0.001, pan: p }); };
    // hyperspace: rising (in) or falling (out) noise + saw sweep
    const warp = (t, dur, up, g = 1) => {
      k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: up ? [[0, 300], [dur, 3000]] : [[0, 3000], [dur, 300]], q: 1.4, gain: 0.16 * g, a: up ? dur * 0.85 : 0.01 });
      k.tone(t, { f: up ? [[0, 90], [dur, 700]] : [[0, 700], [dur, 90]], type: 'sawtooth', dur, gain: 0.05 * g, a: up ? dur * 0.8 : 0.01, filter: 'lowpass', f2: 1500 });
    };

    k.bed('hum', 0, END, { gain: 0.5 });
    k.bed('room', 0, END, { gain: 0.9 }); // cabinet fan

    // ---- BEAT 1: title draws letter by letter (0.15-1.05), horizon line (0.9-1.4)
    beam(0.15, 0.9, 120, 150, 0);
    for (let i = 0; i < 18; i += 2) k.noise(0.15 + (i / 18) * 0.9, { dur: 0.012, filter: 'bandpass', f: 1300, q: 3, gain: 0.12, a: 0.001, pan: px(440 + i * 22), minor: true });
    k.tone(0.9, { f: [[0, 150], [0.5, 260]], type: 'sawtooth', dur: 0.5, gain: 0.04, a: 0.05, hold: 0.35, filter: 'lowpass', f2: 800, pan: 0 });
    // title shrinks into the corner (1.7-2.3): soft low slide, small tone as it turns red (~2.0)
    k.noise(1.7, { dur: 0.6, color: 'brown', filter: 'lowpass', f: [[0, 600], [0.6, 200]], gain: 0.09, a: 0.25, pan: -0.4 });
    saw(2.0, 'E3', 0.12, 0.035, { pan: -0.6 });
    // ---- BEAT 2: core draws edge by edge (1.95-2.95), stem + MODEL (2.4/2.6), arrow (2.6-3.1), label (2.9)
    beam(1.95, 1.0, 80, 160, px(820), 1.1);
    beam(2.6, 0.5, 140, 200, px(450), 0.7);
    // cards fly into the core: arrive at 2.6 + i*0.34 + 1.5 (only the ones before the warp)
    for (let i = 0; i < 6; i++) { const t = 4.1 + i * 0.34; if (t > 5.75) break; k.tone(t, { f: [[0, 220], [0.08, 520]], type: 'square', dur: 0.1, gain: 0.04, a: 0.002, hold: 0.05, filter: 'lowpass', f2: 1600, pan: px(780), minor: true }); }
    // EXAMPLES SEEN (box 2.8, counter 2.9-5.5, accelerating): the heartbeat speeds up with it
    { let hi = true; for (let t = 2.95; t < 5.45;) { beat(t, hi); hi = !hi; t += H.lerp(0.42, 0.13, H.clamp((t - 2.9) / 2.6)); } }
    saw(5.5, 'A3', 0.1, 0.05, { pan: -0.4 }); saw(5.6, 'E4', 0.3, 0.05, { pan: -0.4 });          // lands on 1,000,000
    // warp into the core (5.8-6.4), out of the streaks into the loop (6.4-6.75)
    warp(5.8, 0.6, true, 1);
    k.play('thud', 6.4, { f: 90, gain: 0.45 });
    warp(6.4, 0.35, false, 0.6);

    // ---- BEAT 3: guess beam (6.8-7.25), DOG? draws (7.15-7.45)
    pew(6.8, 0.45, 1400, 500, px(600), 0.9);
    beam(7.15, 0.3, 130, 150, px(1100), 0.8);
    // CHECK (7.5): red cross + brackets blink (on at 7.5, 7.75, steady from 8.0) -> explosion + alarm warble
    boom(7.5, 0.7, 1.5, px(1080)); k.play('thud', 7.5, { f: 80, gain: 0.5, pan: px(1080) });
    [7.5, 7.75, 8.0].forEach((t) => { saw(t, 'C4', 0.06, 0.06, { pan: px(260) }); saw(t + 0.06, 'G3', 0.06, 0.06, { pan: px(260) }); });
    beam(7.6, 0.4, 120, 110, px(260), 0.7);                                                  // IT IS A CAT
    // ADJUST (8.4): error pulse runs back (8.35-8.9), core wobbles 8.5-9.4, dials turn (8.6, 8.72, 8.84 for 0.6)
    k.tone(8.35, { f: [[0, 600], [0.55, 200]], type: 'square', dur: 0.56, gain: 0.04, a: 0.01, hold: 0.4, filter: 'lowpass', f2: 1500, pan: px(1000) });
    k.withMinor(() => {
      for (let i = 0; i < 3; i++) k.tone(8.6 + i * 0.12, { f: [[0, 160 + i * 30], [0.6, 230 + i * 30]], type: 'sawtooth', dur: 0.6, gain: 0.03, a: 0.08, hold: 0.3, filter: 'lowpass', f2: 700, pan: px(690 + i * 150) });
      for (let t = 8.5; t < 9.35; t += 1 / 9) k.tone(t, { f: 95 + 30 * Math.sin(t * 9), type: 'sawtooth', dur: 0.1, gain: 0.04 * (1 - (t - 8.5) / 0.9), filter: 'lowpass', f2: 500, pan: px(840) });
    });
    // GUESS again: a shot travels from picture to core (9.45-9.85), CAT draws (9.75), lock-on check (10.0): the correction
    pew(9.45, 0.4, 1200, 400, px(560), 1.0);
    beam(9.75, 0.3, 140, 170, px(1100), 0.8);
    saw(10.0, 'E4', 0.1, 0.06, { pan: px(1100) }); saw(10.1, 'A4', 0.35, 0.06, { pan: px(1100) }); saw(10.1, 'A3', 0.35, 0.05, { pan: px(1100) });
    // zoom out of the loop (10.5-10.9), chart zooms in (10.85-11.2)
    warp(10.5, 0.4, false, 0.7);

    // ---- BEAT 4: axes draw (10.9-11.3), curve draws 11.1-12.8 with the % climbing (ease-out)
    beam(10.9, 0.4, 110, 130, px(400), 0.8);
    k.tone(11.1, { f: [[0, 120], [0.6, 210], [1.7, 240]], type: 'sawtooth', dur: 1.7, gain: 0.045, a: 0.05, hold: 1.5, filter: 'bandpass', f2: 900, q: 1.5, pan: px(500), minor: true });
    { let last = 61, lastT = -1; for (let f = Math.ceil(11.1 * 60); f < 12.75 * 60; f++) { const t = f / 60, v = Math.round(61 + 36 * H.ease.out(H.clamp((t - 11.1) / 1.7))); if (v > last && t - lastT >= 1 / 12) { k.noise(t, { dur: 0.014, filter: 'bandpass', f: 1600, q: 3, gain: 0.13, a: 0.001, pan: px(1080), minor: true }); last = v; lastT = t; } } }
    // 97% (12.8): lock-on brackets blink, ring collapses on the last point. the biggest hit: deep boom + saw chord
    const P = 12.8;
    k.play('thud', P, { f: 110, gain: 0.8 }); boom(P, 0.5, 0.6, px(1000));
    ['C4', 'E4', 'G4', 'C5'].forEach((n) => saw(P, n, 0.9, 0.04, { hold: 0.35, verb: 0.15, pan: px(1080) })); k.tone(P, { f: 'C2', dur: 0.9, gain: 0.25, a: 0.004, hold: 0.2 });
    k.tone(P, { f: [[0, 900], [0.4, 300]], type: 'square', dur: 0.4, gain: 0.03, a: 0.005, hold: 0.25, filter: 'lowpass', f2: 1600, pan: px(870) }); // ring shrinking
    // ---- BEAT 5: takeaway draws (13.1-13.65) and lands with a resolving two-note
    beam(13.1, 0.55, 140, 170, 0, 0.9);
    saw(13.68, 'G3', 0.12, 0.04); saw(13.8, 'C4', 0.7, 0.04, { verb: 0.12 }); k.tone(13.8, { f: 'C3', type: 'triangle', dur: 0.8, gain: 0.09, a: 0.005, hold: 0.3 });
  }

  registerStyle({
    id: 'vector-arcade',
    name: 'Vector Arcade 1980',
    category: 'Retro Digital',
    description: 'An XY vector monitor cabinet game: hair-thin phosphor beams on pure black, additive bloom, brighter dwell dots where the beam pauses at vertices, dimmer long strokes, wireframe 3D in perspective and a hand-built stroke font.',
    motion: 'Attract-mode build: the beam traces the horizon and mountains, wireframes draw on edge by edge, the AI core flies in from the distance spinning, the saucer slides in with phosphor trails, then the radar, score and title are stroked in letter by letter while everything flickers with beam load.',
    duration: 5,
    frameT: 4.8,
    readsPixels: false,
    explainerDuration: 14.5,
    explainerNote: 'Told as a vector-cabinet HUD: the question shrinks into a red corner readout, labelled wireframe cards stream into a spinning icosahedron core, a hyperspace-style zoom carries us into a lock-on loop (GUESS > CHECK > ADJUST with brackets, red error beam, turning weight dials), and the stroked accuracy graph climbs to a flashing 97%.',
    explainer(ctx, W, H_, t) { vecExplainer(ctx, W, H_, t); },
    explainerSound(k) { vecSound(k); },
    draw(ctx, W, H_, t) {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H_);
      const r = H.rng(1980 + Math.floor(t * 30));       // per-frame beam jitter/flicker
      const rs = H.rng(42);                               // static scene randomness
      const GREEN = [110, 255, 120], RED = [255, 70, 50], WHITE = [210, 255, 220];
      const globalFlick = 0.93 + 0.07 * r();

      // collect beam strokes first, render them in bloom passes after
      const strokes = []; // {pts:[[x,y]...], col, a}
      let REV = 1; // fraction of each path the beam has traced so far
      const cut = (pts, f) => {
        if (f >= 1) return pts; if (f <= 0) return [];
        let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        let left = L * f; const out = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
          const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          if (d >= left) { const k = d ? left / d : 0; out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]); break; }
          out.push(pts[i]); left -= d;
        }
        return out;
      };
      let GHOST = false;
      const poly = (pts, col = GREEN, a = 1) => { pts = cut(pts, REV); if (pts.length > 1) strokes.push({ pts, col, a, ghost: GHOST }); };
      const ph = (a, d) => H.ease.inOut(H.clamp((t - a) / d));

      // ---------- 3D camera ----------
      const camH = 1.5, f = 760, hz = 420, cx = W / 2;
      const yaw = Math.sin(t * 0.25) * 0.08;
      const proj = ([x, y, z]) => {
        const xr = x * Math.cos(yaw) - z * Math.sin(yaw), zr = x * Math.sin(yaw) + z * Math.cos(yaw);
        if (zr < 0.5) return null;
        return [cx + (f * xr) / zr, hz - (f * (y - camH)) / zr, zr];
      };
      const edges3 = (verts, edges, col, a = 1) => {
        const P = verts.map(proj);
        const rev0 = REV, k = REV * edges.length;
        edges.forEach(([i, j], e) => { REV = H.clamp(k - e); if (P[i] && P[j] && REV > 0) poly([[P[i][0], P[i][1]], [P[j][0], P[j][1]]], col, a * H.clamp(2.2 - P[i][2] / 30, 0.35, 1)); });
        REV = rev0;
      };
      const rotY = (v, a) => [v[0] * Math.cos(a) - v[2] * Math.sin(a), v[1], v[0] * Math.sin(a) + v[2] * Math.cos(a)];
      const rotX = (v, a) => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
      const tr = (v, p) => [v[0] + p[0], v[1] + p[1], v[2] + p[2]];

      // ---------- horizon + mountain range + moon + volcano ----------
      REV = ph(0.1, 0.35); poly([[0, hz], [W, hz]], GREEN, 0.75);
      REV = ph(0.35, 0.6);
      const mx = (x) => (((x - t * 18 * 0 - yaw * 900) % (W + 400)) + W + 400) % (W + 400) - 200;
      const mtn = [];
      for (let i = 0; i <= 26; i++) { const x = -200 + i * ((W + 400) / 26); const h = (i % 2 ? 10 + rs() * 30 : 40 + rs() * 70); mtn.push([x - yaw * 900, hz - h * (i > 9 && i < 15 ? 0.45 : 1)]); }
      poly(mtn, GREEN, 0.7);
      REV = ph(0.6, 0.3);
      // volcano (left) with erupting debris arcs
      const vx = 1170 - yaw * 900;
      poly([[vx - 90, hz], [vx - 22, hz - 92], [vx + 22, hz - 92], [vx + 90, hz]], GREEN, 0.75);
      for (let k = 0; k < (t > 0.9 ? 6 : 0); k++) {
        const ph = ((t * 0.7 + k / 6) % 1), dir = (k % 2 ? 1 : -1) * (0.3 + rs() * 0.7);
        const px = vx + dir * ph * 90, py = hz - 92 - (ph * 160 - ph * ph * 190);
        poly([[px, py], [px + dir * 6, py - 4]], GREEN, 1 - ph * 0.6);
      }
      // crescent moon (right)
      const moon = [];
      for (let a = -1.9; a <= 1.9; a += 0.12) moon.push([1040 + Math.cos(a) * 34 - yaw * 900, 235 + Math.sin(a) * 34]);
      for (let a = 1.6; a >= -1.6; a -= 0.12) moon.push([1054 + Math.cos(a) * 26 - yaw * 900, 235 + Math.sin(a) * 30]);
      REV = ph(0.7, 0.4); poly(moon, GREEN, 0.8);

      // ---------- ground objects: pyramids + blocks in perspective ----------
      const pyramid = (p, s, h) => edges3(
        [[-s, 0, -s], [s, 0, -s], [s, 0, s], [-s, 0, s], [0, h, 0]].map((v) => tr(v, p)),
        [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4]], GREEN);
      const block = (p, sx, sy, sz) => edges3(
        [[-sx, 0, -sz], [sx, 0, -sz], [sx, 0, sz], [-sx, 0, sz], [-sx, sy, -sz], [sx, sy, -sz], [sx, sy, sz], [-sx, sy, sz]].map((v) => tr(v, p)),
        [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]], GREEN);
      let oi = 0; const nx = () => { REV = H.clamp((t - 0.8 - (oi++) * 0.1) / 0.3); };
      nx(); pyramid([-12, 0, 27], 2, 3.4); nx(); block([11.5, 0, 19], 1.6, 2.2, 1.6); nx(); pyramid([9.5, 0, 30], 2.4, 4); nx(); block([-17, 0, 15], 1.2, 1.2, 1.2);
      nx(); pyramid([-30, 0, 44], 3, 5); nx(); block([-6, 0, 36], 2.2, 1.4, 1.4); nx(); pyramid([24, 0, 58], 3, 5);

      // ---------- AI CORE: rotating icosahedron + counter-rotating inner cube (focal point) ----------
      const phi = (1 + Math.sqrt(5)) / 2;
      const icoV = [[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0], [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi], [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]];
      const icoE = [];
      for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) { const d = Math.hypot(icoV[i][0] - icoV[j][0], icoV[i][1] - icoV[j][1], icoV[i][2] - icoV[j][2]); if (Math.abs(d - 2) < 0.01) icoE.push([i, j]); }
      const corePAt = (tt) => [0.4, 3.3 + Math.sin(tt * 1.3) * 0.2, 15 + 50 * (1 - H.ease.out(H.clamp((tt - 1.2) / 1.3)))];
      const coreP = corePAt(t);
      REV = H.clamp((t - 1.2) / 0.6);
      const ca = t * 0.6, cb = t * 0.37;
      const cubeV = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
      // phosphor persistence: the spinning core leaves a fading smear of copies over the last ~50 ms
      [[0.048, 0.07], [0.036, 0.12], [0.024, 0.2], [0.012, 0.32], [0, 1]].forEach(([lag, ga]) => {
        const tt = t - lag, pa = tt * 0.6, pb = tt * 0.37, cp = corePAt(tt); GHOST = lag > 0;
        edges3(icoV.map((v) => tr(rotX(rotY(v.map((q) => q * 1.05), pa), pb), cp)), icoE, WHITE, ga);
        edges3(cubeV.map((v) => tr(rotY(rotX(v.map((q) => q * 0.62), -pa * 1.7), -pb * 2), cp)), [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]], GREEN, ga);
      });
      GHOST = false;
      // orbit ring around core
      const ring = []; for (let a = 0; a <= 6.3; a += 0.15) { const v = proj(tr(rotX([Math.cos(a + t) * 2.6, 0, Math.sin(a + t) * 2.6], 0.3), coreP)); if (v) ring.push([v[0], v[1]]); }
      REV = ph(2.1, 0.5); poly(ring, GREEN, 0.55);
      REV = 1;

      // ---------- enemy saucer with phosphor-decay trail ----------
      const saucerAt = (tt) => [-3 + Math.sin(tt * 0.9) * 1.6 - 16 * (1 - H.ease.out(H.clamp((tt - 1.7) / 1.1))), 1.0, 12 + Math.cos(tt * 0.9) * 2];
      if (t > 1.7) [0.12, 0.06, 0].forEach((lag, li) => {
        const p = saucerAt(t - lag), sa = (t - lag) * 2.5;
        const ring1 = [], ring2 = [], spokes = [];
        const n = 8;
        const v1 = [], v2 = [], v3 = [];
        for (let k = 0; k < n; k++) { const a = sa + (k / n) * Math.PI * 2; v1.push([Math.cos(a) * 1.3, 0, Math.sin(a) * 1.3]); v2.push([Math.cos(a) * 0.55, 0.45, Math.sin(a) * 0.55]); v3.push([Math.cos(a) * 0.6, -0.25, Math.sin(a) * 0.6]); }
        const V = [...v1, ...v2, ...v3].map((v) => tr(v, p));
        const E = [];
        for (let k = 0; k < n; k++) { E.push([k, (k + 1) % n], [n + k, n + (k + 1) % n], [2 * n + k, 2 * n + (k + 1) % n], [k, n + k]); if (k % 2 === 0) E.push([k, 2 * n + k]); }
        edges3(V, E, GREEN, [0.08, 0.16, 0.8][li]);
      });
      // player shell flying toward the core
      const shellK = (t * 0.9) % 1;
      if (t > 2.6) [0.08, 0.04, 0].forEach((lag, li) => { const k = ((t - lag - 2.6) * 0.9) % 1; const p = proj([0.2, 0.6 + k * 3.2, 2 + k * 10]); if (p) poly([[p[0] - 3, p[1]], [p[0] + 3, p[1]], [p[0], p[1] - 5], [p[0] - 3, p[1]]], GREEN, [0.2, 0.4, 1][li]); });

      // ---------- gunsight reticle ----------
      const ry = 520;
      REV = ph(1.6, 0.35);
      poly([[cx, ry - 120], [cx, ry - 60]], GREEN, 0.9); poly([[cx, ry + 20], [cx, ry + 80]], GREEN, 0.9);
      poly([[cx - 70, ry - 40], [cx - 70, ry - 60], [cx - 20, ry - 60]], GREEN, 0.9); poly([[cx + 70, ry - 40], [cx + 70, ry - 60], [cx + 20, ry - 60]], GREEN, 0.9);
      poly([[cx - 70, ry], [cx - 70, ry + 20], [cx - 20, ry + 20]], GREEN, 0.9); poly([[cx + 70, ry], [cx + 70, ry + 20], [cx + 20, ry + 20]], GREEN, 0.9);

      // ---------- HUD (red overlay zone, like the cabinet's colour gel) ----------
      const text = (str, x, y, sz, col, a = 1, track = 1.6) => {
        let px = x;
        const nC = REV * str.length, rev0 = REV;
        for (let ci = 0; ci < str.length; ci++) {
          const ch = str[ci]; REV = H.clamp(nC - ci);
          const g = GLYPH[ch];
          if (g) g.forEach((pl) => poly(pl.map(([gx, gy]) => [px + gx * sz, y + gy * sz]), col, a));
          px += sz * 4 + sz * track;
        }
        REV = rev0;
        return px - x;
      };
      const textW = (str, sz, track = 1.6) => str.length * (sz * 4 + sz * track) - sz * track;
      // radar
      const rx0 = cx, ry0 = 92, rr = 62;
      REV = ph(1.9, 0.45);
      const circ = []; for (let a = 0; a <= 6.30; a += 0.2) circ.push([rx0 + Math.cos(a) * rr, ry0 + Math.sin(a) * rr]); poly(circ, RED, 0.85);
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; poly([[rx0 + Math.cos(a) * (rr - 8), ry0 + Math.sin(a) * (rr - 8)], [rx0 + Math.cos(a) * rr, ry0 + Math.sin(a) * rr]], RED, 0.7); }
      const sw = t * 2.2;
      REV = t > 2.35 ? 1 : 0;
      poly([[rx0, ry0], [rx0 + Math.cos(sw) * rr, ry0 + Math.sin(sw) * rr]], RED, 1);
      if (REV > 0) { GHOST = true; for (let k = 1; k <= 5; k++) { const a = sw - k * 0.07; poly([[rx0, ry0], [rx0 + Math.cos(a) * rr, ry0 + Math.sin(a) * rr]], RED, 0.5 * Math.pow(0.6, k)); } GHOST = false; }
      [[0.5, 0.6], [2.4, 0.4], [4.1, 0.75]].forEach(([a, d]) => { const fade = ((sw - a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); const al = H.clamp(1 - fade / 4); if (al > 0.05) { const bx = rx0 + Math.cos(a) * rr * d, by = ry0 + Math.sin(a) * rr * d; poly([[bx - 2, by], [bx + 2, by]], RED, al); } });
      poly([[rx0 - 6, ry0 - 14], [rx0, ry0 - 22], [rx0 + 6, ry0 - 14]], RED, 0.8);
      // score / hi-score
      REV = H.clamp((t - 2.2) / 0.3); text('SCORE', 60, 40, 4, RED, 0.85);
      REV = H.clamp((t - 2.35) / 0.35); text(String(42150 + Math.floor(Math.max(0, t - 2.4) * 50) * 10).padStart(7, '0'), 60, 74, 6, GREEN, 1);
      const hs = 'HI 0099900'; REV = H.clamp((t - 2.3) / 0.35); text(hs, W - 60 - textW(hs, 4), 40, 4, RED, 0.85);
      REV = t > 2.6 ? 1 : 0;
      // lives as tiny tank glyphs
      for (let k = 0; k < 3; k++) { const lx = W - 60 - textW(hs, 4) + k * 34, ly = 82; poly([[lx, ly + 12], [lx + 24, ly + 12], [lx + 20, ly + 6], [lx + 4, ly + 6], [lx, ly + 12]], GREEN, 0.9); poly([[lx + 8, ly + 6], [lx + 10, ly + 1], [lx + 16, ly + 1], [lx + 17, ly + 6]], GREEN, 0.9); poly([[lx + 16, ly + 3], [lx + 26, ly + 2]], GREEN, 0.9); }
      // blinking alert line
      REV = 1;
      if (t > 2.9 && Math.floor(t * 2.5) % 3 !== 1) { const msg = 'AI CORE IN RANGE'; text(msg, cx - textW(msg, 5) / 2, 180, 5, RED, 1); }
      // title, bottom
      const title = 'NEURAL ZONE';
      REV = H.clamp((t - 2.4) / 0.7); text(title, cx - textW(title, 11, 1.4) / 2, 632, 11, GREEN, 1, 1.4);
      REV = 1;

      // ---------- render: beam strokes with intensity model, additive bloom, tube glass ----------
      renderBeams(ctx, W, H_, strokes, r, globalFlick, 0.22);
    },
  });
}
