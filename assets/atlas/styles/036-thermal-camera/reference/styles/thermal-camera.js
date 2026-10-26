{
  // ---------- FLIR-style thermal image ----------
  const TMIN = 16, TMAX = 72;
  const IRONBOW = [
    [0.00, [0, 0, 6]], [0.08, [16, 4, 64]], [0.20, [72, 6, 130]], [0.33, [140, 12, 140]],
    [0.46, [196, 34, 96]], [0.58, [232, 70, 40]], [0.70, [248, 120, 12]], [0.82, [252, 184, 24]],
    [0.92, [254, 232, 110]], [1.00, [255, 255, 236]],
  ];
  function buildLUT() {
    const lut = new Uint8ClampedArray(1024 * 3);
    for (let i = 0; i < 1024; i++) {
      const v = i / 1023;
      let k = 0; while (k < IRONBOW.length - 2 && v > IRONBOW[k + 1][0]) k++;
      const [a, ca] = IRONBOW[k], [b, cb] = IRONBOW[k + 1], f = H.clamp((v - a) / (b - a));
      for (let c = 0; c < 3; c++) lut[i * 3 + c] = ca[c] + (cb[c] - ca[c]) * f;
    }
    return lut;
  }
  const g = (T) => { const v = H.clamp((T - TMIN) / (TMAX - TMIN)) * 255; return `rgb(${v},${v},${v})`; };
  const ga = (T, a) => { const v = H.clamp((T - TMIN) / (TMAX - TMIN)) * 255; return `rgba(${v},${v},${v},${a})`; };

  // ================= EXPLAINER: the IR camera films a model learning; heat = activity, cold = error =================
  let exLUT = null;
  function catSil(f, cx, cy, s, T, Tf) {
    f.fillStyle = g(T);
    f.beginPath(); f.ellipse(cx, cy + s * 0.08, s * 0.95, s * 0.78, 0, 0, 7); f.fill();
    f.beginPath(); f.moveTo(cx - s * 0.9, cy - s * 0.2); f.lineTo(cx - s * 0.78, cy - s * 1.05); f.lineTo(cx - s * 0.3, cy - s * 0.62); f.fill();
    f.beginPath(); f.moveTo(cx + s * 0.9, cy - s * 0.2); f.lineTo(cx + s * 0.78, cy - s * 1.05); f.lineTo(cx + s * 0.3, cy - s * 0.62); f.fill();
    f.fillStyle = g(Tf); f.beginPath(); f.ellipse(cx - s * 0.35, cy - s * 0.05, s * 0.14, s * 0.1, 0, 0, 7); f.ellipse(cx + s * 0.35, cy - s * 0.05, s * 0.14, s * 0.1, 0, 0, 7); f.fill();
    f.beginPath(); f.ellipse(cx, cy + s * 0.25, s * 0.12, s * 0.08, 0, 0, 7); f.fill();
  }
  function dogSil(f, cx, cy, s, T, Tf) {
    f.fillStyle = g(T);
    f.beginPath(); f.ellipse(cx, cy, s * 0.7, s * 0.85, 0, 0, 7); f.fill();
    f.beginPath(); f.ellipse(cx - s * 0.78, cy - s * 0.05, s * 0.26, s * 0.6, 0.25, 0, 7); f.ellipse(cx + s * 0.78, cy - s * 0.05, s * 0.26, s * 0.6, -0.25, 0, 7); f.fill();
    f.beginPath(); f.ellipse(cx, cy + s * 0.42, s * 0.34, s * 0.26, 0, 0, 7); f.fill();
    f.fillStyle = g(Tf); f.beginPath(); f.ellipse(cx - s * 0.28, cy - s * 0.2, s * 0.11, s * 0.09, 0, 0, 7); f.ellipse(cx + s * 0.28, cy - s * 0.2, s * 0.11, s * 0.09, 0, 0, 7); f.fill();
    f.fillStyle = g(T + 6); f.beginPath(); f.ellipse(cx, cy + s * 0.32, s * 0.13, s * 0.09, 0, 0, 7); f.fill();
  }
  // static sensor layers, built once: noise, sensor canvases, slow convective mottling field, column FPN
  const MOT_PAD = 48;
  let exNz = null, exF = null, exB = null, exMot = null, exFPN = null, exEdge = null, exSoft = null, exIX = null, exAX = null;
  function exCache() {
    if (exNz) return;
    exNz = H.makeNoise(17); exLUT = buildLUT();
    exF = H.layer(640, 360); exB = H.layer(640, 360); exB.getContext('2d').filter = 'blur(3px)';
    // same temperature mottling as the still (fbm2(x*.02, y*.02 + t*.05) * 3.2), pre-sampled; t scrolls it by 2.5 px/s
    exMot = new Float32Array(640 * (360 + MOT_PAD));
    for (let y = 0; y < 360 + MOT_PAD; y++) for (let x = 0; x < 640; x++) exMot[y * 640 + x] = exNz.fbm2(x * 0.02, y * 0.02, 3) * 5.4;
    const R = H.rng(4243); exFPN = new Float32Array(4096);
    for (let x = 0; x < 4096; x++) exFPN[x] = (R() - 0.5) * 0.012 + Math.sin(x * 0.9) * 0.002;
    exEdge = new Float32Array(640 * 360); exSoft = new Float32Array(640 * 360);
  }
  function thermalExplainer(ctx, W, Hh, t) {
    exCache();
    const sm = H.smooth, E = H.ease, nz = exNz, Rn = H.rng(5000 + Math.floor(t * 30));
    const FW = 640, FH = 360, F = exF, f = F.getContext('2d');
    f.setTransform(1, 0, 0, 1, 0, 0);
    // scenes separated by the camera's shutter calibration click (NUC)
    const NUC = [[0, 0.3], [6.0, 6.22], [10.45, 10.67]];
    const inNUC = NUC.some(([a, b]) => t >= a && t < b);
    const scene = t < 6.1 ? 1 : t < 10.55 ? 2 : 3;
    const sceneStart = scene === 1 ? 0.3 : scene === 2 ? 6.22 : 10.67;
    const settle = sm(sceneStart, sceneStart + 0.6, t);
    const shakeX = nz.n2(t * 0.8, 50) * 5, shakeY = nz.n2(60, t * 0.7) * 3.5;
    f.scale(FW / W, FH / Hh); f.translate(shakeX, shakeY);
    // room: warm ceiling, cool floor
    const wg = f.createLinearGradient(0, 0, 0, Hh); wg.addColorStop(0, g(24)); wg.addColorStop(0.65, g(21.5)); wg.addColorStop(1, g(20));
    f.fillStyle = wg; f.fillRect(-20, -20, W + 40, Hh + 40);
    // ceiling light strip (warm) and the wall/floor junction with a cooler floor, as in the still's room
    f.fillStyle = g(26.5); f.fillRect(-20, -20, W + 40, 30);
    const fl = f.createLinearGradient(0, 604, 0, Hh); fl.addColorStop(0, g(21.2)); fl.addColorStop(1, g(19.6));
    f.fillStyle = fl; f.fillRect(-20, 604, W + 40, Hh - 584);
    f.fillStyle = g(22.6); f.fillRect(-20, 598, W + 40, 6);
    const hud = []; // deferred HUD drawing (needs screen coords incl. shake)
    // ---- neural net as heat: nodes = hot spots, connections = warm wires whose temperature is the weight ----
    const net = (ox, oy, sc, heat, wts, pulses, outHot) => {
      const L = [[-110, [-80, 0, 80]], [0, [-110, -37, 37, 110]], [110, [-40, 40]]];
      const P = (li, k) => [ox + L[li][0] * sc, oy + L[li][1][k] * sc];
      let ci = 0;
      for (let li = 0; li < 2; li++) for (let a = 0; a < L[li][1].length; a++) for (let b = 0; b < L[li + 1][1].length; b++) {
        const w = wts(ci++), A = P(li, a), B = P(li + 1, b);
        f.strokeStyle = g(22 + w * 20 + heat * 4); f.lineWidth = 3 + w * 6;
        f.beginPath(); f.moveTo(...A); f.lineTo(...B); f.stroke();
        for (const [lay, u0, T] of pulses) { const u = H.clamp(u0 * 1.35 - ((ci * 7) % 5) * 0.08); if (lay === li && u > 0 && u < 1) {
          const x = A[0] + (B[0] - A[0]) * u, y = A[1] + (B[1] - A[1]) * u, gr = f.createRadialGradient(x, y, 0, x, y, 16 * sc);
          gr.addColorStop(0, ga(T, 0.95)); gr.addColorStop(1, ga(T, 0)); f.fillStyle = gr; f.fillRect(x - 20 * sc, y - 20 * sc, 40 * sc, 40 * sc);
        } }
      }
      L.forEach((l, li) => l[1].forEach((_, k) => {
        const [x, y] = P(li, k), hot = li === 2 ? (outHot ? outHot(k) : 0) : 0;
        const gr = f.createRadialGradient(x, y, 0, x, y, 26 * sc);
        gr.addColorStop(0, g(32 + heat * 6 + hot * 14)); gr.addColorStop(0.55, g(29 + heat * 4 + hot * 8)); gr.addColorStop(1, ga(25, 0));
        f.fillStyle = gr; f.beginPath(); f.arc(x, y, 26 * sc, 0, 7); f.fill();
      }));
      return P;
    };
    const card = (x, y, kind, T, sc = 1) => {
      f.fillStyle = g(27); f.beginPath(); f.roundRect(x - 52 * sc, y - 46 * sc, 104 * sc, 92 * sc, 6); f.fill();
      (kind === 'cat' ? catSil : dogSil)(f, x, y + 6 * sc, 30 * sc, T, T - 5);
    };

    let header = 0;
    if (scene === 1) {
      // conveyor belt feeding labelled examples into the model
      f.fillStyle = g(23); f.fillRect(-20, 486, 860, 22);
      for (let k = 0; k < 18; k++) { f.fillStyle = g(25.5); f.fillRect(((k * 52 + t * 380) % 900) - 40, 488, 12, 18); }
      f.fillStyle = g(38); f.beginPath(); f.arc(830, 497, 20, 0, 7); f.fill(); // warm drive motor
      const fed = H.clamp((t - 2.6) / 0.32, 0, 9);
      const heat = sm(2.6, 6, t);
      // model housing (server chassis) with the net inside
      f.fillStyle = g(25 + heat * 3); f.beginPath(); f.roundRect(830, 140, 330, 330, 18); f.fill();
      f.fillStyle = g(23 + heat * 2); f.beginPath(); f.roundRect(848, 158, 294, 294, 12); f.fill();
      net(995, 305, 1.05, heat, (c) => 0.3 + 0.4 * Math.abs(Math.sin(c * 1.7)), [], null);
      // exhaust above the model grows with work
      const ex = f.createLinearGradient(0, 60, 0, 140); ex.addColorStop(0, ga(26, 0)); ex.addColorStop(1, ga(30 + heat * 6, 0.8));
      f.fillStyle = ex; f.fillRect(860, 60, 270, 80);
      for (let k = 0; k < 9; k++) {
        const sk = 2.6 + k * 0.32; if (t < sk) continue;
        const x = -60 + (t - sk) * 380; if (x > 800) continue;
        const kind = k % 3 === 1 ? 'dog' : 'cat';
        card(x, 420, kind, 41, 1.25);
        hud.push(['tag', x + shakeX, 352 + shakeY, kind]);
      }
      if (t > 2.7) hud.push(['counter', sm(2.7, 5.3, t)]);
      header = sm(1.55, 2.25, t);
    } else if (scene === 2) {
      const cin = E.out(sm(6.25, 6.7, t));
      card(-140 + cin * 360, 330, 'cat', 41, 1.8);
      // weights before / after the adjustment
      const adj = sm(8.85, 9.3, t);
      const wts = (c) => H.lerp(0.15 + 0.75 * Math.abs(Math.sin(c * 2.3)), 0.15 + 0.75 * Math.abs(Math.cos(c * 1.1 + 0.4)), adj);
      const pulses = [];
      const fw1 = sm(6.75, 7.05, t), fw2 = sm(7.05, 7.35, t);           // first guess: heat flows forward
      if (fw1 > 0 && fw1 < 1) pulses.push([0, fw1, 44]); if (fw2 > 0 && fw2 < 1) pulses.push([1, fw2, 44]);
      const bk1 = sm(8.2, 8.5, t), bk2 = sm(8.5, 8.8, t);               // error: a cold wave runs backwards
      if (bk1 > 0 && bk1 < 1) pulses.push([1, 1 - bk1, 14]); if (bk2 > 0 && bk2 < 1) pulses.push([0, 1 - bk2, 14]);
      const g1 = sm(9.35, 9.6, t), g2 = sm(9.6, 9.85, t);               // second guess
      if (g1 > 0 && g1 < 1) pulses.push([0, g1, 44]); if (g2 > 0 && g2 < 1) pulses.push([1, g2, 44]);
      const outHot = (k) => k === 1 ? sm(7.3, 7.45, t) * (1 - sm(8.2, 8.5, t)) : sm(9.8, 9.95, t);
      net(640, 330, 1.25, 0.6, wts, pulses, outHot);
      hud.push(['loop']);
      header = 1;
    } else {
      const lp = sm(10.9, 12.4, t), heat = 0.4 + lp * 0.9;
      f.fillStyle = g(25 + heat * 2); f.beginPath(); f.roundRect(110, 170, 340, 330, 18); f.fill();
      f.fillStyle = g(23 + heat * 2); f.beginPath(); f.roundRect(128, 188, 304, 294, 12); f.fill();
      net(280, 335, 1.1, heat, (c) => H.lerp(0.15 + 0.75 * Math.abs(Math.sin(c * 2.3)), 0.75 + 0.2 * Math.sin(c), lp), [], () => lp * 0.6);
      const ex = f.createLinearGradient(0, 80, 0, 170); ex.addColorStop(0, ga(26, 0)); ex.addColorStop(1, ga(30 + heat * 8, 0.85));
      f.fillStyle = ex; f.fillRect(140, 80, 280, 90);
      hud.push(['chart', lp]);
      header = 1;
    }
    // ---- optics + palette (same pipeline as the still) ----
    f.setTransform(1, 0, 0, 1, 0, 0);
    const sharp = f.getImageData(0, 0, FW, FH).data;
    const B = exB, b = B.getContext('2d'); b.clearRect(0, 0, FW, FH); b.drawImage(F, 0, 0);
    const soft8 = b.getImageData(0, 0, FW, FH).data;
    // convective mottling + emissivity variation (slowly drifting, as in the still), added in float so the
    // equalisation below cannot posterise it into 8-bit contour steps
    const soft = exSoft, mOff = t * 2.5, mRow = Math.floor(mOff) % MOT_PAD, mA = mOff - Math.floor(mOff);
    for (let y = 0; y < FH; y++) {
      const r0 = (y + mRow) * FW, r1 = r0 + FW, o = y * FW;
      for (let x = 0; x < FW; x++) {
        const v = soft8[(o + x) * 4] + exMot[r0 + x] * (1 - mA) + exMot[r1 + x] * mA;
        soft[o + x] = v < 0 ? 0 : v > 254.99 ? 254.99 : v;
      }
    }
    // MSX-style edge map from the sharp field (Sobel)
    const edge = exEdge;
    for (let y = 1; y < FH - 1; y++) {
      const o = y * FW;
      for (let x = 1; x < FW - 1; x++) {
        const a = (o - FW + x) * 4, c = (o + x) * 4, e = (o + FW + x) * 4;
        const gx = -sharp[a - 4] - 2 * sharp[c - 4] - sharp[e - 4] + sharp[a + 4] + 2 * sharp[c + 4] + sharp[e + 4];
        const gy = -sharp[a - 4] - 2 * sharp[a] - sharp[a + 4] + sharp[e - 4] + 2 * sharp[e] + sharp[e + 4];
        const mg = Math.sqrt(gx * gx + gy * gy) / 90; edge[o + x] = mg > 1 ? 1 : mg;
      }
    }
    // plateau histogram equalisation, blended with the fixed linear span the scale bar reports
    const hist = new Float32Array(256);
    for (let i = 0; i < soft.length; i++) hist[soft[i] | 0]++;
    const plateau = (FW * FH) / 70;
    let tot = 0; for (let i = 0; i < 256; i++) { hist[i] = Math.min(hist[i], plateau); tot += hist[i]; }
    const cdf = new Float32Array(257); let acc = 0;
    for (let i = 0; i < 256; i++) { acc += hist[i]; cdf[i] = acc / tot; } cdf[256] = 1;
    const img = ctx.createImageData(W, Hh), d = img.data, sx = FW / W, sy = FH / Hh;
    const lo = 19.5, hi = 47, kT = (TMAX - TMIN) / (hi - lo), kO = (TMIN - lo) / (hi - lo);
    const cont = 0.3 + 0.7 * settle;
    if (!exIX || exIX.length !== W) { exIX = new Int32Array(W); exAX = new Float32Array(W);
      for (let x = 0; x < W; x++) { const fx = H.clamp(x * sx - 0.5, 0, FW - 1.001); exIX[x] = fx | 0; exAX[x] = fx - (fx | 0); } }
    for (let y = 0; y < Hh; y++) {
      const fy = H.clamp(y * sy - 0.5, 0, FH - 1.001), iy = fy | 0, ay = fy - iy, rowN = (Rn() - 0.5) * 0.006;
      for (let x = 0; x < W; x++) {
        const ix = exIX[x], ax = exAX[x], j = iy * FW + ix;
        const v = ((soft[j] * (1 - ax) + soft[j + 1] * ax) * (1 - ay) + (soft[j + FW] * (1 - ax) + soft[j + FW + 1] * ax) * ay) / 255;
        const e = (edge[j] * (1 - ax) + edge[j + 1] * ax) * (1 - ay) + (edge[j + FW] * (1 - ax) + edge[j + FW + 1] * ax) * ay;
        const v255 = v * 255, ci = v255 | 0, cf = v255 - ci, q = cdf[ci] * (1 - cf) + cdf[ci + 1] * cf;
        let n = 0.4 * q + 0.6 * (v * kT + kO);
        n = 0.4 + (n - 0.4) * cont;
        if (inNUC) n = 0.36 + (x / W - 0.5) * 0.02;
        else n += e * 0.05 + exFPN[x];
        n += (Rn() + Rn() - 1) * 0.02 + rowN;
        const li = (n < 0 ? 0 : n > 1 ? 1 : n) * 1023 | 0, i = (y * W + x) * 4;
        d[i] = exLUT[li * 3]; d[i + 1] = exLUT[li * 3 + 1]; d[i + 2] = exLUT[li * 3 + 2]; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    H.vignette(ctx, W, Hh, 0.35, '0,0,10');

    // ---- HUD (the camera's own annotation layer does the explaining) ----
    ctx.save(); ctx.textBaseline = 'middle';
    const T_ = (s, x, y, font, align = 'left', col = '#fff') => { ctx.font = font; ctx.textAlign = align; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText(s, x + 1.5, y + 1.5); ctx.fillStyle = col; ctx.fillText(s, x, y); };
    const Ln = (pts, w = 2, col = '#fff', prog = 1) => {
      let total = 0; for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const draw = (c, lw) => { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(...pts[0]); let acc = 0;
        for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + L <= total * prog) { ctx.lineTo(...pts[i]); acc += L; } else { const u = (total * prog - acc) / L; ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u); break; } } ctx.stroke(); };
      draw('rgba(0,0,0,0.55)', w + 2); draw(col, w);
    };
    const Arw = (pts, prog, col = '#fff') => {
      if (prog <= 0) return; Ln(pts, 2.5, col, prog);
      if (prog >= 1) { const e = pts[pts.length - 1], p = pts[pts.length - 2], a = Math.atan2(e[1] - p[1], e[0] - p[0]);
        Ln([[e[0] + Math.cos(a + 2.6) * 14, e[1] + Math.sin(a + 2.6) * 14], e, [e[0] + Math.cos(a - 2.6) * 14, e[1] + Math.sin(a - 2.6) * 14]], 2.5, col); }
    };
    const curve = (x0, y0, qx, qy, x1, y1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * qx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * qy + u * u * y1]; });
    const box = (x, y, w, h, prog, col = '#fff') => Ln([[x + w / 2, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y], [x + w / 2, y]], 2, col, prog);
    const tri = (x, y, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - 9, y + 8); ctx.lineTo(x + 9, y + 8); ctx.lineTo(x, y - 8); ctx.fill(); };
    if (!inNUC) {
      // status bar
      T_('ε 0.95   IRONBOW', 1090, 34, '400 16px "Inter"', 'right');
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(1112, 25, 34, 17); ctx.fillStyle = '#fff'; ctx.fillRect(1146, 30, 3, 7); ctx.fillRect(1115, 28, 21, 11);
      T_('REC', 1176, 34, '600 16px "Inter"'); if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = '#ff3b2a'; ctx.beginPath(); ctx.arc(1166, 34, 5, 0, 7); ctx.fill(); }
      // colour scale bar
      const sg = ctx.createLinearGradient(0, 600, 0, 112); IRONBOW.forEach(([p, c]) => sg.addColorStop(p, H.rgba(c, 1)));
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(1216, 110, 26, 494); ctx.fillStyle = sg; ctx.fillRect(1218, 112, 22, 490);
      T_('47.0', 1240, 92, '600 18px "Inter"', 'right'); T_('19.5', 1240, 622, '600 18px "Inter"', 'right'); T_('°C', 1229, 646, '400 15px "Inter"', 'center');
      // the question: big annotation, then docks into the measurement table as the header
      if (t > 0.35) {
        const h = E.inOut(header), typed = 'How does AI learn?'.slice(0, Math.floor((t - 0.35) * 22));
        const fs = H.lerp(56, 28, h), x = H.lerp(640, 30, h), y = H.lerp(300, 42, h);
        if (h > 0.02) { ctx.fillStyle = `rgba(0,0,0,${0.38 * h})`; ctx.fillRect(18, 18, 340 * h, 50); }
        T_(typed, x, y, `600 ${fs}px "Inter"`, h < 0.5 ? 'center' : 'left');
        if (h < 0.05 && t > 0.6) { ctx.strokeStyle = '#fff'; Ln([[640 - 30, 360], [640 - 9, 360]]); Ln([[649, 360], [670, 360]]); Ln([[640, 330 + 10], [640, 351]]); Ln([[640, 369], [640, 390]]); }
      }
    }
    for (const it of hud) {
      if (inNUC) break;
      if (it[0] === 'tag') {
        const [, x, y, kind] = it;
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x - 42, y - 40, 84, 36);
        T_(kind, x, y - 22, '800 26px "Inter"', 'center'); Ln([[x, y - 4], [x, y + 12]], 1.5);
      } else if (it[0] === 'counter') {
        const p = it[1], v = p >= 1 ? 1000000 : Math.round(Math.pow(10, 6 * p));
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(18, 548, 560, 156);
        T_('TRAINING DATA', 34, 576, '600 24px "Inter"', 'left', 'rgba(255,255,255,0.85)');
        T_(v.toLocaleString('en-US'), 34, 642, '800 68px "Inter"'); T_('examples', 560, 660, '700 30px "Inter"', 'right');
        Arw([[560, 330], [700, 330], [820, 300]], sm(2.7, 3.1, t));
        T_('model', 995, 110, '800 30px "Inter"', 'center'); box(838, 132, 314, 346, sm(2.9, 3.4, t));
      } else if (it[0] === 'loop') {
        T_('new picture', 220, 214, '800 28px "Inter"', 'center', 'rgba(255,255,255,0.9)');
        // GUESS arrow -> answer
        Arw([[790, 330], [900, 330]], sm(7.3, 7.55, t));
        T_('Guess', 845, 296, '800 32px "Inter"', 'center');
        const ans = t < 9.85 ? 'dog?' : 'cat';
        if (t > 7.5) T_(ans, 1010, 330, '800 54px "Inter"', 'center', t < 9.85 ? '#fff' : '#7dff8a');
        // CHECK: red box flashes round the wrong answer
        if (t > 7.75 && t < 9.85) {
          const fl = t < 8.4 ? (Math.floor(t * 8) % 2 ? 1 : 0.25) : 1;
          ctx.globalAlpha = fl; box(930, 286, 160, 88, sm(7.75, 8.0, t), '#ff3b2a');
          T_('✗', 1120, 330, '800 46px "Inter"', 'center', '#ff3b2a'); ctx.globalAlpha = 1;
          T_('Check', 1010, 256, '800 32px "Inter"', 'center', '#ff8a7a');
        }
        if (t >= 9.85) { box(930, 286, 160, 88, 1, '#7dff8a'); T_('✓', 1120, 330, '800 46px "Inter"', 'center', '#7dff8a'); T_('Check', 1010, 256, '800 32px "Inter"', 'center', '#7dff8a'); }
        // ADJUST: error flows back (the cold wave), weights retune
        Arw(curve(1010, 390, 860, 560, 660, 480), sm(8.2, 8.8, t), '#8fd3ff');
        if (t > 8.5) T_('Adjust', 830, 556, '800 32px "Inter"', 'center', '#8fd3ff');
        if (t > 8.85 && t < 9.4) { tri(640, 470, '#28a8ff'); T_('weights retuned', 640, 506, '800 26px "Inter"', 'center'); }
        tri(780, 380 - 0, t > 7.4 && t < 8.6 ? '#ff2a1a' : 'rgba(0,0,0,0)');
      } else if (it[0] === 'chart') {
        const lp = it[1];
        ctx.fillStyle = 'rgba(0,0,0,0.42)'; ctx.fillRect(560, 130, 620, 380);
        T_('LINE PROFILE · accuracy per training round', 578, 154, '600 20px "Inter"', 'left', 'rgba(255,255,255,0.8)');
        Ln([[600, 180], [600, 470], [1150, 470]], 2, '#fff', sm(10.7, 10.95, t));
        T_('rounds →', 1150, 492, '700 24px "Inter"', 'right', 'rgba(255,255,255,0.85)');
        const pts = []; for (let r = 0; r <= 24; r++) { const acc = 0.97 - 0.36 * Math.exp(-r / 6) + (r > 0 && r < 24 ? Math.sin(r * 3.1) * 0.012 : 0); pts.push([610 + r * 22, 470 - (acc - 0.5) / 0.5 * 280]); }
        if (lp > 0) Ln(pts, 3, '#ffd23a', lp);
        const pct = Math.round(61 + 36 * E.out(lp));
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(18, 80, 300, 46);
        T_('Accuracy', 30, 103, '600 28px "Inter"'); T_(pct + ' %', 306, 102, '800 30px "Inter"', 'right', pct >= 97 ? '#7dff8a' : '#fff');
        ctx.fillStyle = 'rgba(8,0,18,0.7)'; ctx.fillRect(915, 210, 170, 80); // readout plate: the profile runs behind it
        T_(pct + '%', 1000, 250, '800 64px "Inter"', 'center', pct >= 97 ? '#7dff8a' : '#fff');
        if (lp >= 1) { const fl = t < 12.9 ? (Math.floor(t * 8) % 2 ? 1 : 0.3) : 1; ctx.globalAlpha = fl; box(915, 210, 170, 80, sm(12.4, 12.65, t), '#7dff8a'); ctx.globalAlpha = 1; tri(pts[24][0], pts[24][1] - 16, '#ff2a1a'); }
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(222, 129, 116, 36);
        T_('model', 280, 146, '800 30px "Inter"', 'center');
        if (t > 13.0) {
          const tp = sm(13.0, 13.3, t);
          ctx.fillStyle = `rgba(0,0,0,${0.6 * tp})`; ctx.fillRect(110, 548, 1060, 100);
          const s = 'More examples → better guesses'; T_(s.slice(0, Math.floor((t - 13.0) * 40)), 640, 598, '800 52px "Inter"', 'center');
          box(110, 548, 1060, 100, tp);
        }
      }
    }
    if (inNUC && t > 0.05) T_('NUC', W / 2, Hh / 2, '600 22px "Inter"', 'center', 'rgba(255,255,255,0.85)');
    T_(`2026-10-09  23:41:${String(7 + Math.floor(t)).padStart(2, '0')}`, 1180, 700, '600 15px "IBM Plex Mono"', 'right', 'rgba(255,255,255,0.8)');
    ctx.restore();
  }

  // Sound: we are holding the IR camera. Its electronics whisper under everything; scene changes are the shutter-flag
  // NUC calibration (solenoid clack in, clack out); the HUD speaks in soft low beeps and data ticks; heat moving through
  // the net is a warm low swell, the error is a cold falling hiss; the measurement-box alarm beeps in step with its
  // flashing; the model's fan spins up as it works. The takeaway lands as a snapshot capture + save tone.
  // All times are copied from thermalExplainer() above (same NUC table, smooth/ease windows and flash formulas).
  // Voiceover mode (k.vo): beds drop out; typing ticks, counter ticks, card thumps, HUD line draws and fan are minor.
  function thermalSound(k) {
    const sm = H.smooth, E = H.ease, D = 15;
    const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
    // shutter flag solenoid: a dry plastic clack with a tiny rattle, no ring
    const clack = (t, g = 1) => {
      k.noise(t, { dur: 0.018, filter: 'bandpass', f: 2100, q: 1.1, gain: 0.4 * g, a: 0.001 });
      k.tone(t, { f: [[0, 260], [0.035, 110]], dur: 0.05, gain: 0.26 * g });
      k.noise(t + 0.022, { dur: 0.012, filter: 'bandpass', f: 1600, q: 2, gain: 0.14 * g, a: 0.001 });
    };
    const nuc = (a, b) => { clack(a, 1); k.noise(a + 0.02, { dur: b - a - 0.02, filter: 'bandpass', f: 900, q: 3, gain: 0.03 }); clack(b, 0.8); };
    // HUD beep: soft, low, slightly square (camera piezo through a lowpass)
    const beep = (t, f = 1050, dur = 0.06, g = 1, pan = 0, minor = false) => k.tone(t, { f, type: 'square', dur, gain: 0.05 * g, a: 0.003, hold: dur * 0.7, filter: 'lowpass', f2: 1800, q: 0.7, pan, minor });
    // data tick: what a HUD annotation "sounds" like as it writes; throttled so it stays under ~12/s
    const ticks = (t0, n, rate, every, pan = 0, g = 1) => { for (let i = 0; i < n; i += every)
      k.noise(t0 + i / rate, { dur: 0.012, filter: 'bandpass', f: 1700 + (i % 3) * 120, q: 3, gain: 0.2 * g, a: 0.001, pan, minor: true }); };
    // HUD line drawing on: a faint electronic trace that rises slightly, then a beep when it completes
    const trace = (a, b, pan = 0, f0 = 420) => k.tone(a, { f: [[0, f0], [b - a, f0 * 1.35]], type: 'triangle', dur: b - a, gain: 0.03, a: 0.03, hold: (b - a) * 0.7, pan, minor: true });
    // heat flowing forward through a layer: warm, low, breathy swell
    const heat = (a, b, pan = 0) => { const d = b - a;
      k.noise(a, { dur: d + 0.1, color: 'brown', filter: 'lowpass', f: [[0, 220], [d, 700]], gain: 0.35, a: d * 0.6, pan });
      k.tone(a, { f: [[0, 90], [d, 140]], dur: d + 0.1, gain: 0.07, a: d * 0.6, pan }); };
    // cold wave running back: an airy hiss that falls
    const cold = (a, b, pan = 0) => { const d = b - a;
      k.noise(a, { dur: d + 0.08, color: 'pink', filter: 'bandpass', f: [[0, 2200], [d, 650]], q: 1.4, gain: 0.22, a: d * 0.3, pan }); };
    // a dry counter tick per change, throttled
    const counter = (val, a, b, gap, pan, avoid = []) => { let last = -1, prev = val(a);
      for (let t = a; t <= b; t += 0.002) { const v = val(t);
        if (v !== prev && t - last >= gap && !avoid.some((x) => t > x - 0.03 && t < x + 0.1)) { k.play('tick', t, { f: 2300, gain: 1.15, pan, minor: true }); last = t; }
        prev = v; } };
    // the model's cooling fan: noise band that rises with the heat (amb bus, minor, kept low)
    const fan = (a, b, f0, f1, g) => k.noise(a, { dur: b - a, color: 'pink', filter: 'bandpass', f: [[0, f0], [b - a - 0.3, f1]], q: 2.5, gain: g, a: 0.6, hold: b - a - 1.0, bus: 'amb', pan: 0.3, minor: true });

    // ---- beds: the camera's electronics, the room
    k.bed('room', 0, D, { gain: 0.45 });
    k.bed('hiss', 0, D, { gain: 0.9 });
    k.tone(0.3, { f: 165, type: 'triangle', dur: D - 0.3, gain: 0.006, a: 0.5, hold: D - 1.3, bus: 'amb', minor: true }); // faint core whine, low

    // ---- 0–0.3 opens on a NUC; 0.3–0.9 auto-gain settles (a short soft rise)
    nuc(0.0, 0.3);
    k.tone(0.32, { f: [[0, 300], [0.5, 460]], type: 'sine', dur: 0.55, gain: 0.03, a: 0.3 });
    // title types at 22 chars/s from 0.35 (18 chars); spot-meter crosshair appears at 0.6
    ticks(0.35, 18, 22, 2, 0, 0.9);
    beep(0.6, 880, 0.05, 0.8, 0, true);
    // header docks 1.55–2.25 (eased inOut): a soft smooth low slide, fastest in the middle
    k.noise(1.55, { dur: 0.7, color: 'pink', filter: 'lowpass', f: [[0, 300], [0.35, 900], [0.7, 300]], gain: 0.06, a: 0.35, pan: -0.4 });

    // ---- scene 1: conveyor runs from 0.3 (belt rumble + drive motor, right side)
    k.noise(0.3, { dur: 5.75, color: 'brown', filter: 'bandpass', f: 180, q: 1.2, gain: 0.16, a: 0.4, hold: 5.0, bus: 'amb', pan: -0.2, minor: true });
    k.tone(0.3, { f: 98, type: 'sawtooth', dur: 5.75, gain: 0.012, a: 0.4, hold: 5.0, filter: 'lowpass', f2: 400, pan: 0.5, minor: true });
    // cards drop onto the belt at 2.6 + k*0.32 (short soft tap each)
    k.withMinor(() => { for (let c = 0; c < 9; c++) { const tc = 2.6 + c * 0.32;
      k.tone(tc, { f: [[0, 150], [0.06, 70]], dur: 0.08, gain: 0.15, pan: -0.8 }); k.noise(tc, { dur: 0.03, filter: 'bandpass', f: 700, q: 1, gain: 0.14, pan: -0.8 }); } });
    // arrow draws 2.7–3.1, model box 2.9–3.4
    trace(2.7, 3.1, 0.2); beep(3.1, 940, 0.05, 0.7, 0.2, true);
    trace(2.9, 3.4, 0.5, 520); beep(3.4, 1180, 0.08, 1.0, 0.5);
    // TRAINING DATA counter 10^(6p), p = sm(2.7, 5.3); locks on 1,000,000
    counter((t) => { const p = sm(2.7, 5.3, t); return p >= 1 ? 1e6 : Math.round(Math.pow(10, 6 * p)); }, 2.72, 5.25, 0.09, -0.5, [2.92, 3.24, 3.4, 3.56, 3.88, 4.2, 4.52, 4.84, 5.16]);
    beep(5.3, 1180, 0.05, 1, -0.5); beep(5.37, 1580, 0.09, 1, -0.5);
    // the chassis heats sm(2.6, 6): its fan spins up
    fan(2.6, 6.15, 500, 1100, 0.05);

    // ---- NUC 6.0–6.22 (scene change)
    nuc(6.0, 6.22);

    // ---- scene 2: cat card slides in E.out(sm(6.25, 6.7)) — a soft smooth slide
    k.noise(6.25, { dur: 0.45, color: 'pink', filter: 'lowpass', f: [[0, 800], [0.45, 250]], gain: 0.14, a: 0.02, pan: -0.5 });
    beep(6.4, 880, 0.04, 0.6, -0.6, true);                 // "new picture" tag
    heat(6.75, 7.05, -0.1); heat(7.05, 7.35, 0.15);       // first guess: heat flows forward
    k.tone(7.3, { f: 180, dur: 0.25, gain: 0.08, a: 0.1, pan: 0.25 });   // output node glows hot (7.3–7.45)
    trace(7.3, 7.55, 0.3); beep(7.4, 740, 0.04, 0.7, 0.3, true);         // Guess arrow + hot-spot marker
    beep(7.5, 1050, 0.09, 1.1, 0.45);                                    // the answer "dog?" posts
    // WRONG: red box + ✗ flash at 8 Hz (on when floor(t*8) is odd): on at 7.875, 8.125, then steady from 8.375
    k.play('thud', 7.875, { f: 110, gain: 0.6, pan: 0.5 });
    [7.875, 8.125, 8.375].forEach((ta, i) => { beep(ta, 620, 0.1, 1.6, 0.5); beep(ta, 930, 0.1, 0.8, 0.5); });
    // error flows back as a cold wave 8.2–8.5, 8.5–8.8 (arrow 8.2–8.8), "Adjust" 8.5
    cold(8.2, 8.5, 0.25); cold(8.5, 8.8, -0.1);
    beep(8.5, 820, 0.04, 0.6, 0.0, true);
    // weights retuned 8.85–9.3: a low servo-like retune sweep under the label
    k.tone(8.85, { f: [[0, 200], [0.45, 320]], type: 'sawtooth', dur: 0.5, gain: 0.045, a: 0.05, hold: 0.35, filter: 'lowpass', f2: 700, q: 2 });
    beep(8.85, 700, 0.05, 0.8, 0, true);
    heat(9.35, 9.6, -0.1); heat(9.6, 9.85, 0.15);         // second guess
    // RIGHT: "cat", green box and ✓ at 9.85: the camera's confirm tones
    k.play('success', 9.85, { f: 'C5', gain: 0.7, pan: 0.45 });
    beep(9.85, 1050, 0.05, 0.8, 0.45);

    // ---- NUC 10.45–10.67
    nuc(10.45, 10.67);

    // ---- scene 3: axes 10.7–10.95; line profile lp = sm(10.9, 12.4) with % counting 61 -> 97
    trace(10.7, 10.95, 0.3);
    const pct = (t) => Math.round(61 + 36 * E.out(sm(10.9, 12.4, t)));
    const t97 = when(pct, 97, 10.9, 12.4);
    k.tone(10.9, { f: [[0, 260], [t97 - 10.9, 520]], type: 'triangle', dur: t97 - 10.9, gain: 0.022, a: 0.2, hold: t97 - 11.2, pan: 0.3, minor: true }); // trace rising with the line
    counter(pct, 10.92, t97 - 0.04, 0.085, 0.3);
    beep(t97, 1180, 0.06, 1, 0.3); beep(t97 + 0.07, 1580, 0.08, 0.9, 0.3);  // number turns green
    fan(10.67, 14.95, 700, 1500, 0.055);                                   // model heats with lp
    // THE HIT at 12.4: lp reaches 1, measurement box locks on 97% and flashes (on 12.4, 12.625, steady from 12.875)
    k.play('thud', 12.4, { f: 85, gain: 1.2, pan: 0.2 }); clack(12.4, 1.1);
    k.noise(12.4, { dur: 0.5, color: 'pink', filter: 'lowpass', f: [[0, 2000], [0.45, 300]], gain: 0.22, verb: 0.3 });
    [12.4, 12.625, 12.875].forEach((ta, i) => { beep(ta, 784, 0.11, 1.9 - i * 0.3, 0.3); beep(ta, 1175, 0.11, 1.1 - i * 0.2, 0.3); });

    // ---- 13.0 takeaway panel: box draws sm(13.0, 13.3), text types at 40 chars/s (30 chars, done 13.75)
    trace(13.0, 13.3, 0, 360);
    ticks(13.0, 30, 40, 3, 0, 0.9);
    // resolve: snapshot captured + saved (shutter flag, then a low two-note save tone)
    clack(13.78, 0.9); k.noise(13.84, { dur: 0.04, filter: 'bandpass', f: 1500, q: 1, gain: 0.2 }); clack(13.86, 0.5);
    k.tone(13.95, { f: 'G4', dur: 0.5, gain: 0.12, a: 0.005, verb: 0.3 });
    k.tone(14.1, { f: 'C5', dur: 0.85, gain: 0.13, a: 0.005, verb: 0.35 });
    k.tone(14.1, { f: 'E5', dur: 0.85, gain: 0.06, a: 0.01, verb: 0.35 });
  }

  registerStyle({
    id: 'thermal-camera',
    name: 'Thermal Camera',
    category: 'Light & Imaging',
    description: 'A handheld IR camera frame in ironbow: soft low-res heat field, cold glasses and warm breath, hot coffee and GPU racks, edge-enhanced outlines, sensor noise and the camera’s own HUD with spot meter, box measurement and scale bar.',
    motion: 'Camera clicks through its shutter calibration, the auto-gain settles, coffee is hot-poured and steam rises, rack bands heat up bottom to top while the spot meter glides onto the mug and the readouts tick live.',
    fonts: ['600 22px "Inter"', '400 18px "Inter"', '600 16px "IBM Plex Mono"'],
    frameT: 4.6,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Everything is filmed through the IR camera: scenes change with the shutter-calibration (NUC) click, heat is activity and a cold wave is the error signal, while the camera\u2019s own HUD does the explaining with spot-meter arrows, measurement-box emphasis, tag labels riding on objects and live readouts.',
    explainer(ctx, W, Hh, t) { thermalExplainer(ctx, W, Hh, t); },
    explainerSound(k) { thermalSound(k); },
    draw(ctx, W, Hh, t) {
      const R = H.rng(4242), nz = H.makeNoise(17);
      const Rn = H.rng(9000 + Math.floor(t * 30)); // per-frame sensor noise
      const coffee = H.ease.out(H.smooth(0.55, 1.7, t)), mugWarm = H.smooth(0.8, 2.6, t), steamOn = H.smooth(1.1, 2.4, t);
      const settle = H.smooth(0.42, 1.3, t);
      const shakeX = nz.n2(t * 0.9, 50) * 4, shakeY = nz.n2(60, t * 0.8) * 3;
      const FW = 640, FH = 360; // sensor resolution
      const F = H.layer(FW, FH), f = F.getContext('2d');
      f.scale(FW / W, FH / Hh); f.translate(shakeX, shakeY);

      // ---- room: ceiling warmer than floor ----
      const wg = f.createLinearGradient(0, 0, 0, Hh);
      wg.addColorStop(0, g(24.5)); wg.addColorStop(0.6, g(22)); wg.addColorStop(1, g(20.5));
      f.fillStyle = wg; f.fillRect(0, 0, W, Hh);
      // ceiling light fixture warm streak, radiator glow lower-left
      f.fillStyle = g(27); f.fillRect(0, 0, W, 10);
      // window (cold glass, warmer frame)
      f.fillStyle = g(19.5); f.fillRect(40, 40, 260, 300);
      const wn = f.createLinearGradient(0, 52, 0, 330);
      wn.addColorStop(0, g(11)); wn.addColorStop(1, g(13.5));
      f.fillStyle = wn; f.fillRect(54, 54, 108, 272); f.fillRect(176, 54, 110, 272);
      // reflection of the ceiling lamp in the glass (IR mirror)
      f.fillStyle = ga(17, 0.6); f.beginPath(); f.ellipse(120, 120, 24, 70, 0.2, 0, 7); f.fill();
      // radiator under window
      for (let i = 0; i < 9; i++) { f.fillStyle = g(44 - (i % 2) * 6); f.fillRect(60 + i * 26, 382, 16, 70); }
      const rh = f.createLinearGradient(0, 230, 0, 382); rh.addColorStop(0, ga(30, 0)); rh.addColorStop(1, ga(30, 0.5));
      f.fillStyle = rh; f.fillRect(50, 230, 250, 152);

      // ---- server racks (right) ----
      const racks = [[880, 70, 170], [1062, 50, 190]];
      racks.forEach(([x, y, w], ri) => {
        f.fillStyle = g(27); f.fillRect(x, y, w, 560 - y);
        f.fillStyle = g(25); f.fillRect(x, y, 10, 560 - y); f.fillRect(x + w - 10, y, 10, 560 - y);
        for (let u = y + 20, k = 0; u < 540; u += 24, k++) {
          const load = 0.5 + 0.5 * nz.n2(k * 0.7 + ri * 5, t * 0.6);
          const spin = H.smooth(0.7 + (20 - k) * 0.07 + ri * 0.15, 1.3 + (20 - k) * 0.07 + ri * 0.15, t); // servers spin up bottom->top
          const T = 27 + spin * (3 + load * 18 + (k % 5 === 2 ? 6 : 0));
          f.fillStyle = g(T); f.fillRect(x + 16, u, w - 32, 18);
          // vent perforation: hotter slots
          f.fillStyle = g(T + 5);
          for (let s = 0; s < 8; s++) f.fillRect(x + 26 + s * ((w - 50) / 8), u + 5, (w - 50) / 16, 8);
          f.fillStyle = g(T - 6); f.fillRect(x + 16, u + 18, w - 32, 6);
        }
        // warm exhaust rising above rack
        const ex = f.createLinearGradient(0, y - 60, 0, y);
        ex.addColorStop(0, ga(30, 0)); ex.addColorStop(1, ga(36, 0.7));
        f.fillStyle = ex; f.fillRect(x + 10, y - 60, w - 20, 60);
      });

      // ---- person (behind laptop) ----
      const hx = 520, hy = 200;
      // body heat halo on wall
      const halo = f.createRadialGradient(hx, hy + 140, 60, hx, hy + 140, 300);
      halo.addColorStop(0, ga(27, 0.6)); halo.addColorStop(1, ga(24, 0));
      f.fillStyle = halo; f.fillRect(hx - 320, hy - 160, 640, 520);
      // shoulders / torso (shirt ~30)
      f.fillStyle = g(28.2);
      f.beginPath(); f.moveTo(hx - 210, 560); f.bezierCurveTo(hx - 215, 380, hx - 150, 320, hx - 60, 300);
      f.lineTo(hx + 60, 300); f.bezierCurveTo(hx + 150, 320, hx + 215, 380, hx + 210, 560); f.closePath(); f.fill();
      // shirt folds cooler/warmer
      f.strokeStyle = ga(27, 0.7); f.lineWidth = 10; f.lineCap = 'round';
      f.beginPath(); f.moveTo(hx - 140, 380); f.quadraticCurveTo(hx - 120, 450, hx - 150, 520); f.stroke();
      f.beginPath(); f.moveTo(hx + 135, 370); f.quadraticCurveTo(hx + 120, 440, hx + 150, 520); f.stroke();
      // arms reaching forward to keyboard
      f.fillStyle = g(29);
      f.beginPath(); f.ellipse(hx - 190, 470, 48, 110, 0.35, 0, 7); f.fill();
      f.beginPath(); f.ellipse(hx + 190, 470, 48, 110, -0.35, 0, 7); f.fill();
      // neck
      const nk = f.createLinearGradient(hx - 40, 0, hx + 40, 0);
      nk.addColorStop(0, g(32)); nk.addColorStop(0.5, g(35)); nk.addColorStop(1, g(32));
      f.fillStyle = nk; f.fillRect(hx - 38, 250, 76, 64);
      // collar V hot skin
      f.fillStyle = g(34.5); f.beginPath(); f.moveTo(hx - 34, 300); f.lineTo(hx, 345); f.lineTo(hx + 34, 300); f.fill();
      // head: hot face, limb-darkened edges
      const hd = f.createRadialGradient(hx, hy + 10, 10, hx, hy, 82);
      hd.addColorStop(0, g(36)); hd.addColorStop(0.65, g(35)); hd.addColorStop(1, g(31.5));
      f.fillStyle = hd; f.beginPath(); f.ellipse(hx, hy, 70, 86, 0, 0, 7); f.fill();
      // ears (cooler)
      f.fillStyle = g(32); f.beginPath(); f.ellipse(hx - 70, hy + 6, 12, 22, 0, 0, 7); f.ellipse(hx + 70, hy + 6, 12, 22, 0, 0, 7); f.fill();
      // hair (insulating -> cool)
      f.fillStyle = g(27.5);
      f.beginPath(); f.moveTo(hx - 74, hy + 10); f.bezierCurveTo(hx - 90, hy - 80, hx - 20, hy - 112, hx + 30, hy - 100);
      f.bezierCurveTo(hx + 90, hy - 90, hx + 86, hy - 20, hx + 74, hy + 4);
      f.bezierCurveTo(hx + 60, hy - 40, hx + 20, hy - 58, hx - 20, hy - 54);
      f.bezierCurveTo(hx - 50, hy - 50, hx - 66, hy - 20, hx - 74, hy + 10); f.fill();
      // glasses: glass blocks LWIR -> look cold
      f.fillStyle = g(25.5);
      f.beginPath(); f.roundRect(hx - 60, hy - 12, 50, 36, 10); f.roundRect(hx + 10, hy - 12, 50, 36, 10); f.fill();
      f.strokeStyle = g(29); f.lineWidth = 4;
      f.beginPath(); f.roundRect(hx - 60, hy - 12, 50, 36, 10); f.roundRect(hx + 10, hy - 12, 50, 36, 10); f.stroke();
      f.beginPath(); f.moveTo(hx - 10, hy - 2); f.lineTo(hx + 10, hy - 2); f.stroke();
      // nose tip slightly cool, inner eye corners hottest (seen as bright dots at bridge)
      f.fillStyle = g(32.6); f.beginPath(); f.ellipse(hx, hy + 40, 11, 9, 0, 0, 7); f.fill();
      f.fillStyle = g(36.4); f.beginPath(); f.arc(hx - 7, hy + 6, 5, 0, 7); f.arc(hx + 7, hy + 6, 5, 0, 7); f.fill();
      // mouth warm line
      f.fillStyle = g(36); f.beginPath(); f.ellipse(hx, hy + 62, 16, 4, 0, 0, 7); f.fill();
      // warm breath plume
      for (let i = 0; i < 6; i++) {
        f.fillStyle = ga(31, 0.18 - i * 0.025);
        f.beginPath(); f.ellipse(hx + 6 + i * 6, hy + 82 + i * 10 + Math.sin(t * 2 + i) * 3, 14 + i * 7, 8 + i * 3, 0.3, 0, 7); f.fill();
      }

      // ---- desk ----
      const dg = f.createLinearGradient(0, 520, 0, Hh);
      dg.addColorStop(0, g(22.8)); dg.addColorStop(1, g(21.5));
      f.fillStyle = dg; f.fillRect(0, 520, W, Hh - 520);
      f.fillStyle = g(21); f.fillRect(0, 520, W, 5);
      // warm patch under laptop (conducted heat)
      const lp = f.createRadialGradient(540, 590, 20, 540, 590, 300);
      lp.addColorStop(0, ga(31, 0.85)); lp.addColorStop(1, ga(24, 0));
      f.fillStyle = lp; f.beginPath(); f.ellipse(540, 600, 320, 70, 0, 0, 7); f.fill();
      // residual handprint on desk (thermal ghost)
      const hpx = 230, hpy = 640;
      f.fillStyle = ga(26.5, 0.75);
      f.beginPath(); f.ellipse(hpx, hpy, 36, 22, -0.2, 0, 7); f.fill();
      [[-34, -26, 0.5], [-12, -36, 0.25], [10, -36, 0], [30, -28, -0.25]].forEach(([dx, dy, a]) => {
        f.beginPath(); f.ellipse(hpx + dx, hpy + dy, 7, 20, a, 0, 7); f.fill();
      });
      f.beginPath(); f.ellipse(hpx + 46, hpy + 2, 7, 18, 1.2, 0, 7); f.fill();

      // ---- laptop: lid back toward camera ----
      const lx0 = 340, lx1 = 720, ly0 = 318, ly1 = 560;
      f.fillStyle = g(25.8);
      f.beginPath(); f.moveTo(lx0 + 14, ly0); f.lineTo(lx1 - 14, ly0); f.lineTo(lx1, ly1); f.lineTo(lx0, ly1); f.closePath(); f.fill();
      // warmer toward hinge/bottom (heat from the base)
      const lg = f.createLinearGradient(0, ly0, 0, ly1);
      lg.addColorStop(0, ga(26, 0)); lg.addColorStop(0.6, ga(28, 0.35)); lg.addColorStop(1, ga(36, 0.9));
      f.fillStyle = lg; f.fill();
      // lid logo-less emblem: cooler circle (different emissivity metal)
      f.fillStyle = g(24.5); f.beginPath(); f.arc((lx0 + lx1) / 2, 420, 22, 0, 7); f.fill();
      // base / hinge: hot exhaust slot
      f.fillStyle = g(41); f.fillRect(lx0 - 6, ly1 - 4, lx1 - lx0 + 12, 14);
      f.fillStyle = g(47); f.fillRect(lx0 + 40, ly1 + 2, 120, 6);
      // exhaust plume
      const pl = f.createLinearGradient(0, ly1 + 10, 0, ly1 + 80);
      pl.addColorStop(0, ga(38, 0.7)); pl.addColorStop(1, ga(30, 0));
      f.fillStyle = pl; f.beginPath(); f.ellipse(lx0 + 100, ly1 + 30, 90, 30, 0, 0, 7); f.fill();
      // hands on keyboard visible either side of lid
      f.fillStyle = g(32.5);
      f.beginPath(); f.ellipse(lx0 - 18, 548, 34, 20, -0.3, 0, 7); f.fill();
      f.beginPath(); f.ellipse(lx1 + 18, 548, 34, 20, 0.3, 0, 7); f.fill();
      f.fillStyle = g(29.5); // fingertips cooler
      for (let i = 0; i < 4; i++) { f.beginPath(); f.arc(lx0 + 6 + i * 6, 560 + i, 6, 0, 7); f.arc(lx1 - 6 - i * 6, 560 + i, 6, 0, 7); f.fill(); }

      // ---- coffee mug ----
      const mx = 820, my = 470, mw = 92, mh = 108;
      const mg = f.createLinearGradient(mx - mw / 2, 0, mx + mw / 2, 0);
      const mT = (T) => g(23 + (T - 23) * mugWarm);
      mg.addColorStop(0, mT(44)); mg.addColorStop(0.35, mT(56)); mg.addColorStop(0.6, mT(57)); mg.addColorStop(1, mT(43));
      f.fillStyle = mg; f.fillRect(mx - mw / 2, my, mw, mh);
      f.beginPath(); f.ellipse(mx, my + mh, mw / 2, 12, 0, 0, Math.PI); f.fill();
      // handle
      f.strokeStyle = mT(46); f.lineWidth = 14;
      f.beginPath(); f.ellipse(mx + mw / 2 + 4, my + 50, 26, 32, 0, -1.3, 1.3); f.stroke();
      // liquid surface: hottest
      f.fillStyle = mT(52); f.beginPath(); f.ellipse(mx, my, mw / 2, 13, 0, 0, 7); f.fill();
      f.fillStyle = g(23 + 44 * coffee); f.beginPath(); f.ellipse(mx, my + 1, mw / 2 - 7, 9, 0, 0, 7); f.fill();
      // mug heat reflected on desk
      f.fillStyle = ga(30, 0.5 * mugWarm); f.beginPath(); f.ellipse(mx, my + mh + 14, 70, 14, 0, 0, 7); f.fill();
      // steam plume: soft rising puffs, cooling and spreading with height
      for (let k = 0; k < 110; k++) {
        const strand = k % 2, u = (k >> 1) / 55, yy = my - 6 - u * 260 + (R() - 0.5) * 14;
        const xx = mx + (strand ? 14 : -14) * (1 - u) + Math.sin(u * 5.2 + t * 1.3 + strand * 2.2) * (6 + u * 34)
          + nz.n2(u * 2.5 + strand * 4, t * 0.4) * 34 * u + (R() - 0.5) * 18 * u;
        const r = 10 + u * 30 + R() * 8;
        const dens = H.clamp(0.6 + nz.n2(u * 6 + strand * 3, t * 0.8) * 1.2, 0.1, 1) * steamOn * (1 - H.smooth((t - 1.1) * 0.9 - 0.15, (t - 1.1) * 0.9 + 0.05, u));
        const gr = f.createRadialGradient(xx, yy, 0, xx, yy, r);
        gr.addColorStop(0, ga(46 - u * 16, 0.2 * dens * (1 - u * 0.75))); gr.addColorStop(1, ga(30, 0));
        f.fillStyle = gr; f.beginPath(); f.arc(xx, yy, r, 0, 7); f.fill();
      }

      // ---- optics: blur the field (lens + low-res microbolometer) ----
      const sharpImg = f.getImageData(0, 0, FW, FH), sharp = sharpImg.data;
      // organic temperature mottling (convection, emissivity variation)
      for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
        const i = (y * FW + x) * 4, m = nz.fbm2(x * 0.02, y * 0.02 + t * 0.05, 3) * 3.2;
        sharp[i] = sharp[i + 1] = sharp[i + 2] = H.clamp(sharp[i] + m, 0, 255);
      }
      f.setTransform(1, 0, 0, 1, 0, 0); f.putImageData(sharpImg, 0, 0);
      const B = H.layer(FW, FH), b = B.getContext('2d');
      b.filter = 'blur(3.2px)'; b.drawImage(F, 0, 0);
      const soft = b.getImageData(0, 0, FW, FH).data;
      // MSX-style edge map from sharp field (Sobel)
      const edge = new Float32Array(FW * FH);
      for (let y = 1; y < FH - 1; y++) for (let x = 1; x < FW - 1; x++) {
        const p = (yy, xx) => sharp[((y + yy) * FW + x + xx) * 4];
        const gx = -p(-1, -1) - 2 * p(0, -1) - p(1, -1) + p(-1, 1) + 2 * p(0, 1) + p(1, 1);
        const gy = -p(-1, -1) - 2 * p(-1, 0) - p(-1, 1) + p(1, -1) + 2 * p(1, 0) + p(1, 1);
        edge[y * FW + x] = Math.min(1, Math.hypot(gx, gy) / 90);
      }
      // auto-range from scene (with slight pumping over time)
      let lo = 255, hi = 0;
      for (let i = 0; i < soft.length; i += 4) { const v = soft[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
      const tLo = TMIN + lo / 255 * (TMAX - TMIN), tHi = TMIN + hi / 255 * (TMAX - TMIN) + Math.sin(t * 0.7) * 0.3;

      // plateau histogram equalisation (what real IR cameras do so faces don't go dull next to a hot mug)
      const hist = new Float32Array(256);
      for (let i = 0; i < soft.length; i += 4) hist[soft[i]]++;
      const plateau = (FW * FH) / 70;
      let tot = 0; for (let i = 0; i < 256; i++) { hist[i] = Math.min(hist[i], plateau); tot += hist[i]; }
      const cdf = new Float32Array(256); let acc = 0;
      for (let i = 0; i < 256; i++) { acc += hist[i]; cdf[i] = acc / tot; }
      const eq = (v255) => { const i = Math.min(254, v255 | 0), f2 = v255 - i; return cdf[i] * (1 - f2) + cdf[i + 1] * f2; };
      // ---- palette mapping at output resolution ----
      const lut = buildLUT();
      const img = ctx.createImageData(W, Hh), d = img.data;
      const colFPN = new Float32Array(W); for (let x = 0; x < W; x++) colFPN[x] = (R() - 0.5) * 0.012 + Math.sin(x * 0.9) * 0.002;
      const sx = FW / W, sy = FH / Hh;
      for (let y = 0; y < Hh; y++) {
        const fy = H.clamp(y * sy - 0.5, 0, FH - 1.001), iy = fy | 0, ay = fy - iy;
        const rowN = (Rn() - 0.5) * 0.006;
        for (let x = 0; x < W; x++) {
          const fx = H.clamp(x * sx - 0.5, 0, FW - 1.001), ix = fx | 0, ax = fx - ix, j = iy * FW + ix;
          const v = ((soft[j * 4] * (1 - ax) + soft[j * 4 + 4] * ax) * (1 - ay) + (soft[(j + FW) * 4] * (1 - ax) + soft[(j + FW) * 4 + 4] * ax) * ay) / 255;
          const e = (edge[j] * (1 - ax) + edge[j + 1] * ax) * (1 - ay) + (edge[j + FW] * (1 - ax) + edge[j + FW + 1] * ax) * ay;
          const T = TMIN + v * (TMAX - TMIN);
          let n = 0.55 * eq(v * 255) + 0.45 * (T - tLo) / (tHi - tLo);
          n = 0.42 + (n - 0.42) * (0.25 + 0.75 * settle); // AGC settling after calibration
          n += (Rn() + Rn() - 1) * 0.022 + colFPN[x] + rowN;
          n += e * 0.035;
          if (t < 0.42) n = 0.36 + (x / W - 0.5) * 0.02 + (Rn() - 0.5) * 0.03; // shutter closed (NUC): flat field
          const li = H.clamp(n, 0, 1) * 1023 | 0;
          const i = (y * W + x) * 4;
          d[i] = lut[li * 3]; d[i + 1] = lut[li * 3 + 1]; d[i + 2] = lut[li * 3 + 2]; d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      // lens vignetting (microbolometer narcissus/ fall-off)
      H.vignette(ctx, W, Hh, 0.35, '0,0,10');

      // ---- HUD ----
      const tempAt = (x, y) => { const j = ((y * sy) | 0) * FW + ((x * sx) | 0); return TMIN + soft[j * 4] / 255 * (TMAX - TMIN); };
      ctx.save();
      ctx.textBaseline = 'middle';
      const hudText = (s, x, y, font, align = 'left', col = '#fff') => {
        ctx.font = font; ctx.textAlign = align;
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillText(s, x + 1.5, y + 1.5);
        ctx.fillStyle = col; ctx.fillText(s, x, y);
      };
      const line = (pts, w = 2) => {
        ctx.lineCap = 'butt';
        ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = w + 2; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = w; ctx.stroke();
      };
      // spot meter crosshair on the mug
      const hudOn = t >= 0.45;
      const glide = H.ease.inOut(H.smooth(1.9, 2.7, t));
      const cx = Math.round(H.lerp(640, mx + 4, glide)), cy = Math.round(H.lerp(360, my + 4, glide));
      const spotT = tempAt(cx, cy) + Math.sin(t * 3.1) * 0.1;
      if (!hudOn) { ctx.font = '600 22px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.textAlign = 'center'; ctx.fillText('CALIBRATING\u2026', W / 2, Hh / 2); ctx.restore(); return; }
      line([[cx - 30, cy], [cx - 9, cy]]); line([[cx + 9, cy], [cx + 30, cy]]);
      line([[cx, cy - 30], [cx, cy - 9]]); line([[cx, cy + 9], [cx, cy + 30]]);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, 2, 0, 7); ctx.stroke();
      hudText(spotT.toFixed(1) + '\u00b0', cx + 36, cy - 22, '600 20px "Inter"');
      // measurement box on GPU rack
      const bx0 = 1074, by0 = 160, bx1 = 1200, by1 = 360;
      const boxP = H.ease.out(H.smooth(2.85, 3.15, t));
      const bl = (a, b) => H.lerp(a, b, boxP), mxb = bx0 + 63, myb = by0 + 100;
      ctx.setLineDash([]);
      if (boxP > 0) line([[bl(mxb, bx0), bl(myb, by0)], [bl(mxb, bx1), bl(myb, by0)], [bl(mxb, bx1), bl(myb, by1)], [bl(mxb, bx0), bl(myb, by1)], [bl(mxb, bx0), bl(myb, by0) - 1]], 2);
      let bmax = -99, bmx = 0, bmy = 0;
      for (let y = by0; y < by1; y += 4) for (let x = bx0; x < bx1; x += 4) { const T = tempAt(x, y); if (T > bmax) { bmax = T; bmx = x; bmy = y; } }
      if (boxP >= 1) hudText('Bx1', bx0 + 4, by0 - 14, '600 16px "Inter"');
      // hot/cold markers
      const tri = (x, y, col, up) => {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.moveTo(x - 9, y + (up ? 8 : -8) + 1); ctx.lineTo(x + 10, y + (up ? 8 : -8) + 1); ctx.lineTo(x + 1, y + (up ? -8 : 8) + 1); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - 9, y + (up ? 8 : -8)); ctx.lineTo(x + 9, y + (up ? 8 : -8)); ctx.lineTo(x, y + (up ? -8 : 8)); ctx.fill();
      };
      if (boxP >= 1) tri(bmx, bmy, '#ff2a1a', true);
      tri(110, 300, '#28a8ff', false);

      // top-left measurement table
      ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.fillRect(18, 18, 238, boxP >= 1 ? 84 : 46);
      hudText('Sp1', 30, 40, '600 22px "Inter"'); hudText(spotT.toFixed(1) + ' °C', 244, 40, '600 22px "Inter"', 'right');
      if (boxP >= 1) { hudText('Bx1  Max', 30, 78, '600 22px "Inter"'); hudText(bmax.toFixed(1) + ' °C', 244, 78, '600 22px "Inter"', 'right'); }
      // top-right status: emissivity + battery
      hudText('ε 0.95   IRONBOW', 1090, 34, '400 16px "Inter"', 'right');
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(1112, 25, 34, 17); ctx.fillStyle = '#fff'; ctx.fillRect(1146, 30, 3, 7);
      ctx.fillRect(1115, 28, 21, 11);
      hudText('AUTO', 1172, 34, '600 16px "Inter"');

      // colour scale bar (right edge)
      const sbx = 1218, sbt = 112, sbb = 600;
      const sg = ctx.createLinearGradient(0, sbb, 0, sbt);
      IRONBOW.forEach(([p, c]) => sg.addColorStop(p, H.rgba(c, 1)));
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(sbx - 2, sbt - 2, 26, sbb - sbt + 4);
      ctx.fillStyle = sg; ctx.fillRect(sbx, sbt, 22, sbb - sbt);
      hudText(tHi.toFixed(1), sbx + 22, sbt - 20, '600 20px "Inter"', 'right');
      hudText(tLo.toFixed(1), sbx + 22, sbb + 22, '600 20px "Inter"', 'right');
      hudText('°C', sbx + 11, sbb + 48, '400 16px "Inter"', 'center');

      // annotation tag (on-screen label)
      ctx.fillStyle = 'rgba(0,0,0,0.42)'; ctx.fillRect(18, t >= 3.1 ? 640 : 670, 330, t >= 3.1 ? 62 : 32);
      if (t >= 3.1) hudText('GPU LOAD: ' + Math.round(98 * H.ease.out(H.smooth(3.1, 3.8, t))) + '%', 32, 662, '600 22px "Inter"');
      const hh = 23 + Math.floor(t / 60), ss = (41 * 60 + 7 + Math.floor(t)) % 3600;
      hudText(`2026-10-09  ${hh}:${String(Math.floor(ss / 60)).padStart(2, '0')}:${String(ss % 60).padStart(2, '0')}`, 32, 688, '600 16px "IBM Plex Mono"', 'left', 'rgba(255,255,255,0.85)');
      ctx.restore();
    },
  });
}
