{
  // ---------- long-exposure light painting ----------
  const hsl = (h, s, l) => {
    h = ((h % 360) + 360) % 360 / 360;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
  };
  function blurSmall(src, px, s) {
    const w = Math.ceil(src.width * s), h = Math.ceil(src.height * s), c = H.layer(w, h), x = c.getContext('2d');
    x.filter = `blur(${Math.max(0.5, px * s)}px)`; x.drawImage(src, 0, 0, w, h); return c;
  }

  // light-tube ribbon: an RGB tube swept round an ellipse and twisted as it goes (shared by the still and the explainer)
  function lightRibbon(rb, nz, { cx0, cy0, rx, ry, skew = 30, tyk = 0.42, len = 112, twists = 3.4, hue0 = 175, hueSpan = 150, RN = 900, stri = 10, gain = 1, prog }) {
    let pv = null, tip = null;
    for (let i = 0; i < RN; i++) {
      const u = i / (RN - 1);
      if (u > prog) break;
      const a = Math.PI * (0.62 + u * 1.72);
      const cx = cx0 + Math.cos(a) * rx + nz.n2(u * 6, 1) * 6, cy = cy0 + Math.sin(a) * ry - Math.cos(a) * skew + nz.n2(u * 6, 4) * 6;
      const tw = Math.cos(u * Math.PI * twists + 0.4);
      const ln = len * tw;
      const tx = -Math.sin(a), ty = Math.cos(a) * tyk;
      const nl = Math.hypot(tx, ty), nx = -ty / nl, ny = tx / nl;
      const cur = [cx - nx * ln / 2, cy - ny * ln / 2, cx + nx * ln / 2, cy + ny * ln / 2];
      if (pv) {
        const hue = hue0 + u * hueSpan;
        const dens = H.clamp(0.13 / (Math.abs(tw) + 0.15), 0.12, 0.75) * gain;
        const gr = rb.createLinearGradient(cur[0], cur[1], cur[2], cur[3]);
        gr.addColorStop(0, H.rgba(hsl(hue, 1, 0.6), dens)); gr.addColorStop(0.5, H.rgba(hsl(hue + 45, 1, 0.55), dens * 0.55)); gr.addColorStop(1, H.rgba(hsl(hue + 95, 1, 0.6), dens));
        rb.fillStyle = gr; rb.beginPath(); rb.moveTo(pv[0], pv[1]); rb.lineTo(pv[2], pv[3]); rb.lineTo(cur[2], cur[3]); rb.lineTo(cur[0], cur[1]); rb.closePath(); rb.fill();
        // individual LEDs leave fine parallel striations
        for (let k = 1; k < stri; k++) {
          const f = k / stri, hk = hue + f * 95;
          rb.strokeStyle = H.rgba(hsl(hk, 1, 0.7), Math.min(0.5, dens * 0.55)); rb.lineWidth = 0.9;
          rb.beginPath(); rb.moveTo(pv[0] + (pv[2] - pv[0]) * f, pv[1] + (pv[3] - pv[1]) * f); rb.lineTo(cur[0] + (cur[2] - cur[0]) * f, cur[1] + (cur[3] - cur[1]) * f); rb.stroke();
        }
        // hot tube ends trace the edges
        rb.strokeStyle = H.rgba(hsl(hue, 1, 0.8), 0.5 * gain); rb.lineWidth = 1.8; rb.beginPath(); rb.moveTo(pv[0], pv[1]); rb.lineTo(cur[0], cur[1]); rb.stroke();
        rb.strokeStyle = H.rgba(hsl(hue + 95, 1, 0.8), 0.5 * gain); rb.beginPath(); rb.moveTo(pv[2], pv[3]); rb.lineTo(cur[2], cur[3]); rb.stroke();
      }
      pv = cur;
      if (prog > 0 && prog < 1) tip = [(cur[0] + cur[2]) / 2, (cur[1] + cur[3]) / 2, hsl(hue0 + u * hueSpan, 1, 0.7), cur];
    }
    return tip;
  }

  // ghost of the painter (moved during the exposure): silhouette G, trail-lit colour Gc and a rim-lit edge Rim. Static, cached.
  let ghostCache = null;
  function getGhost(W, Hh) {
    if (ghostCache && ghostCache.W === W && ghostCache.H === Hh) return ghostCache;
    const G = H.layer(W, Hh), gx = G.getContext('2d');
    const ghost = (ox, oy, a) => {
      gx.save(); gx.translate(ox, oy); gx.globalAlpha = a;
      gx.fillStyle = 'rgb(255,255,255)'; gx.strokeStyle = 'rgb(255,255,255)'; gx.lineCap = 'round'; gx.lineJoin = 'round';
      gx.beginPath(); gx.ellipse(1012, 330, 19, 24, 0.1, 0, 7); gx.fill();                // head
      gx.beginPath(); gx.moveTo(1004, 352); gx.lineTo(1020, 352); gx.lineTo(1022, 362); gx.lineTo(1002, 362); gx.fill(); // neck
      gx.beginPath(); gx.moveTo(976, 372); gx.quadraticCurveTo(1012, 356, 1048, 374);       // shoulders
      gx.quadraticCurveTo(1054, 420, 1046, 480); gx.lineTo(1040, 500); gx.lineTo(984, 500); gx.lineTo(976, 470);
      gx.quadraticCurveTo(970, 420, 976, 372); gx.fill();
      gx.lineWidth = 22; gx.beginPath(); gx.moveTo(996, 500); gx.lineTo(990, 580); gx.lineTo(984, 650); gx.stroke(); // legs
      gx.beginPath(); gx.moveTo(1028, 500); gx.lineTo(1036, 580); gx.lineTo(1046, 650); gx.stroke();
      gx.lineWidth = 15; gx.beginPath(); gx.moveTo(982, 380); gx.quadraticCurveTo(944, 330, 912, 272); gx.stroke(); // raised arm
      gx.beginPath(); gx.moveTo(1044, 384); gx.quadraticCurveTo(1062, 440, 1052, 492); gx.stroke();                 // other arm
      gx.restore();
    };
    ghost(0, 0, 0.6); ghost(-8, 2, 0.25);
    // lit by the coloured trails from the left/front, cool rim + warm wand light from above
    const Gc = H.layer(W, Hh), gcx = Gc.getContext('2d');
    gcx.drawImage(G, 0, 0); gcx.globalCompositeOperation = 'source-in';
    const gl = gcx.createLinearGradient(960, 260, 1060, 640);
    gl.addColorStop(0, 'rgb(150,110,120)'); gl.addColorStop(0.4, 'rgb(90,70,140)'); gl.addColorStop(1, 'rgb(30,30,60)');
    gcx.fillStyle = gl; gcx.fillRect(0, 0, W, Hh);
    // rim light: the edge facing the light trails (left / top) catches cyan-magenta spill, so the figure reads as a body
    const Rim = H.layer(W, Hh), rx = Rim.getContext('2d');
    rx.drawImage(G, 0, 0); rx.globalCompositeOperation = 'destination-out'; rx.drawImage(G, 6, 3);
    rx.globalCompositeOperation = 'source-in';
    const rg = rx.createLinearGradient(900, 260, 1060, 660);
    rg.addColorStop(0, 'rgb(255,200,170)'); rg.addColorStop(0.35, 'rgb(150,120,255)'); rg.addColorStop(0.7, 'rgb(70,160,220)'); rg.addColorStop(1, 'rgb(20,40,70)');
    rx.fillStyle = rg; rx.fillRect(0, 0, W, Hh);
    // pre-blur once and keep only the figure's bounding box, so each frame is three small, filter-free draws
    const BX = 860, BY = 236, BW = 240, BH = 450;
    const crop = (src, b) => { const c = H.layer(BW, BH), x = c.getContext('2d'); x.filter = `blur(${b}px)`; x.drawImage(src, -BX, -BY); return c; };
    return (ghostCache = { W, H: Hh, BX, BY, G: crop(G, 2), Gc: crop(Gc, 2.5), Rim: crop(Rim, 1.2) });
  }
  const drawGhost = (x, gh, dx, a) => {
    if (a <= 0) return;
    x.save();
    x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.45 * a; x.drawImage(gh.G, gh.BX + dx, gh.BY);
    x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.32 * a; x.drawImage(gh.Gc, gh.BX + dx, gh.BY);
    x.globalAlpha = 0.5 * a; x.drawImage(gh.Rim, gh.BX + dx, gh.BY);
    x.restore();
  };
  // ground spill mask: fades away from the horizon and breaks up in patches of wet grass (cached)
  let spillMask = null;
  function getSpillMask(SW, SH) {
    if (spillMask && spillMask.width === SW && spillMask.height === SH) return spillMask;
    const m = H.layer(SW, SH), x = m.getContext('2d'), id = x.createImageData(SW, SH), nz = H.makeNoise(4242);
    for (let y = 0; y < SH; y++) for (let q = 0; q < SW; q++) {
      const v = Math.pow(1 - y / SH, 1.25) * H.clamp(0.5 + 0.75 * nz.fbm2(q * 0.045, y * 0.3, 3) + 0.1, 0, 1);
      const i = (y * SW + q) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = 255; id.data[i + 3] = v * 255;
    }
    x.putImageData(id, 0, 0);
    return (spillMask = m);
  }

  // static caches: eroded lettering cores (per word) and finished ribbons (per beat)
  const lpCores = new Map(), lpRibbons = {};

  // ================= EXPLAINER: a live long exposure; whip-pans smear everything into streaks between beats =================
  let lpBg = null;
  function getLpBg(W, Hh) {
    if (lpBg) return lpBg;
    const BW = W * 3, HZ = 560, c = H.layer(BW, Hh), x = c.getContext('2d'), R = H.rng(3131), nz = H.makeNoise(3132);
    const sky = x.createLinearGradient(0, 0, 0, HZ); sky.addColorStop(0, '#02030a'); sky.addColorStop(0.6, '#060a1c'); sky.addColorStop(1, '#151a2e');
    x.fillStyle = sky; x.fillRect(0, 0, BW, HZ + 2);
    for (let k = 0; k < 1500; k++) {
      const sx = R() * BW, sy = Math.pow(R(), 1.3) * (HZ - 30), m = Math.pow(R(), 5);
      x.fillStyle = H.rgba(R.pick([[255, 255, 255], [200, 215, 255], [255, 230, 200]]), (0.25 + m * 0.75) * (1 - H.smooth(HZ - 160, HZ, sy) * 0.8));
      x.beginPath(); x.arc(sx, sy, 0.6 + m * 1.3, 0, 7); x.fill();
    }
    x.fillStyle = '#04050a'; x.beginPath(); x.moveTo(0, HZ);
    for (let px = 0; px <= BW; px += 4) x.lineTo(px, HZ - 14 - 16 * Math.sin(px * 0.004 + 1.2) - Math.max(0, nz.fbm2(px * 0.03, 2.2, 3)) * 46 - Math.max(0, nz.n2(px * 0.08, 5)) * 10);
    x.lineTo(BW, Hh); x.lineTo(0, Hh); x.fill();
    for (let k = 0; k < 7000; k++) { const gx = R() * BW, gy2 = HZ + Math.pow(R(), 0.7) * (Hh - HZ); x.strokeStyle = `rgba(30,36,48,${R.range(0.2, 0.6)})`; x.beginPath(); x.moveTo(gx, gy2); x.lineTo(gx + R.range(-3, 3), gy2 - R.range(3, 8)); x.stroke(); }
    x.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 26; k++) { const bx = R() * BW, by = HZ - 10 - R() * 30, r = 8 + R() * 16, cc = R.pick([[255, 170, 90], [255, 200, 120], [170, 210, 255]]);
      const g = x.createRadialGradient(bx, by, 0, bx, by, r); g.addColorStop(0, H.rgba(cc, 0.16)); g.addColorStop(0.85, H.rgba(cc, 0.28)); g.addColorStop(1, H.rgba(cc, 0)); x.fillStyle = g; x.beginPath(); x.arc(bx, by, r, 0, 7); x.fill(); }
    return (lpBg = c);
  }
  function lpCat(x, cx, cy, s) {
    x.beginPath(); x.moveTo(cx - s * 0.95, cy - s * 0.1); x.lineTo(cx - s * 0.8, cy - s * 1.05); x.lineTo(cx - s * 0.35, cy - s * 0.72);
    x.quadraticCurveTo(cx, cy - s * 0.82, cx + s * 0.35, cy - s * 0.72); x.lineTo(cx + s * 0.8, cy - s * 1.05); x.lineTo(cx + s * 0.95, cy - s * 0.1);
    x.bezierCurveTo(cx + s * 1.0, cy + s * 0.75, cx - s * 1.0, cy + s * 0.75, cx - s * 0.95, cy - s * 0.1);
    x.moveTo(cx - s * 0.45, cy - s * 0.14); x.lineTo(cx - s * 0.2, cy - s * 0.1); x.moveTo(cx + s * 0.45, cy - s * 0.14); x.lineTo(cx + s * 0.2, cy - s * 0.1);
    x.moveTo(cx - s * 0.38, cy + s * 0.18); x.lineTo(cx - s * 1.05, cy + s * 0.06); x.moveTo(cx + s * 0.38, cy + s * 0.18); x.lineTo(cx + s * 1.05, cy + s * 0.06);
    x.moveTo(cx - s * 0.08, cy + s * 0.12); x.lineTo(cx + s * 0.08, cy + s * 0.12); x.lineTo(cx, cy + s * 0.22);
  }
  function lpDog(x, cx, cy, s) {
    x.beginPath(); x.moveTo(cx - s * 0.55, cy - s * 0.7); x.quadraticCurveTo(cx, cy - s * 0.95, cx + s * 0.55, cy - s * 0.7);
    x.bezierCurveTo(cx + s * 0.78, cy - s * 0.1, cx + s * 0.55, cy + s * 0.78, cx, cy + s * 0.8); x.bezierCurveTo(cx - s * 0.55, cy + s * 0.78, cx - s * 0.78, cy - s * 0.1, cx - s * 0.55, cy - s * 0.7);
    x.moveTo(cx - s * 0.55, cy - s * 0.7); x.bezierCurveTo(cx - s * 1.2, cy - s * 0.6, cx - s * 1.15, cy + s * 0.3, cx - s * 0.8, cy + s * 0.25);
    x.moveTo(cx + s * 0.55, cy - s * 0.7); x.bezierCurveTo(cx + s * 1.2, cy - s * 0.6, cx + s * 1.15, cy + s * 0.3, cx + s * 0.8, cy + s * 0.25);
    x.moveTo(cx - s * 0.2, cy - s * 0.2); x.arc(cx - s * 0.26, cy - s * 0.2, s * 0.06, 0, 7); x.moveTo(cx + s * 0.32, cy - s * 0.2); x.arc(cx + s * 0.26, cy - s * 0.2, s * 0.06, 0, 7);
    x.moveTo(cx - s * 0.16, cy + s * 0.18); x.quadraticCurveTo(cx, cy + s * 0.06, cx + s * 0.16, cy + s * 0.18); x.quadraticCurveTo(cx, cy + s * 0.32, cx - s * 0.16, cy + s * 0.18);
  }
  const LED = { '0': '01110100011001110101110011000101110', '1': '00100011000010000100001000010001110', '2': '01110100010000100010001000100011111', '3': '11110000010000101110000010000111110',
    '4': '00010001100101010010111110001000010', '5': '11111100001111000001000011000101110', '6': '00110010001000011110100011000101110', '7': '11111000010001000100010000100001000',
    '8': '01110100011000101110100011000101110', '9': '01110100011000101111000010001001100', '%': '11001110100001000100010000101110011', ',': '00000000000000000000001100010001000' };

  function lightExplainer(ctx, W, Hh, t) {
    const sm = H.smooth, E = H.ease, Rn = H.rng(31 + Math.floor(t * 30));
    // beats live in separate exposures; whip-pans between them: [start, end-of-pan]
    const pans = [[2.05, 2.5], [5.9, 6.35], [10.3, 10.75], [12.85, 13.3]];
    let beat = 0; pans.forEach(([a, b]) => { if (t >= (a + b) / 2) beat++; });
    const panP = pans.map(([a, b]) => sm(a, b, t));
    let camX = 0; panP.forEach((p) => camX += p * 560);
    const smear = pans.reduce((m, [a, b]) => Math.max(m, t > a && t < b ? Math.sin(Math.PI * (t - a) / (b - a)) : 0), 0);
    const Ccol = H.layer(W, Hh), cc = Ccol.getContext('2d'), Ccore = H.layer(W, Hh), co = Ccore.getContext('2d');
    [cc, co].forEach((x) => { x.globalCompositeOperation = 'lighter'; x.lineCap = 'round'; x.lineJoin = 'round'; });
    let tip = null;
    const C = { cyan: [60, 220, 255], pink: [255, 70, 190], amber: [255, 180, 60], violet: [170, 90, 255], red: [255, 50, 40], green: [80, 255, 120], white: [235, 240, 255] };
    const pen = (id, pts, c0, c1, w, prog, gaps = 0) => {
      if (prog <= 0) return; const jn = H.makeNoise(id); let prev = null;
      for (let i = 0; i < pts.length; i++) {
        const u = i / (pts.length - 1); if (u > prog) break;
        const x = pts[i][0] + jn.n2(u * 9, 0.5) * 2.2, y = pts[i][1] + jn.n2(u * 9, 7.5) * 2.2;
        if (prev && !(gaps && jn.n2(u * 6, 11) > 0.45)) {
          const sp = 0.65 + 0.35 * jn.n2(u * 4, 3), c = H.mix(c0, c1, u);
          cc.strokeStyle = H.rgba(c, 0.6 * sp); cc.lineWidth = w * (0.8 + sp * 0.4); cc.beginPath(); cc.moveTo(...prev); cc.lineTo(x, y); cc.stroke();
          co.strokeStyle = H.rgba(H.mix(c, [255, 255, 255], 0.75), 0.55 * sp); co.lineWidth = w * 0.38; co.beginPath(); co.moveTo(...prev); co.lineTo(x, y); co.stroke();
        }
        prev = [x, y];
      }
      if (prog < 1 && prev) tip = [prev[0], prev[1], H.mix(c0, c1, prog)];
    };
    const line = (a, b, n = 40) => Array.from({ length: n }, (_, i) => [a[0] + (b[0] - a[0]) * i / (n - 1), a[1] + (b[1] - a[1]) * i / (n - 1)]);
    const quad = (a, q, b, n = 50) => Array.from({ length: n }, (_, i) => { const u = i / (n - 1); return [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * q[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * q[1] + u * u * b[1]]; });
    const loop = (cx, cy, r, n = 90) => Array.from({ length: n }, (_, i) => { const a = i / (n - 1) * Math.PI * 4.3 - 1.2, rr = r * (1 + 0.07 * Math.sin(a * 0.5)) + i * 0.02; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; });
    const arrowPen = (id, pts, c0, c1, w, prog) => {
      pen(id, pts, c0, c1, w, prog);
      if (prog >= 1) { const e = pts[pts.length - 1], q = pts[pts.length - 4], a = Math.atan2(e[1] - q[1], e[0] - q[0]);
        pen(id + 500, [[e[0] + Math.cos(a + 2.5) * 24, e[1] + Math.sin(a + 2.5) * 24], ...line(e, e, 2), [e[0] + Math.cos(a - 2.5) * 24, e[1] + Math.sin(a - 2.5) * 24]], c1, c1, w, 1); }
    };
    const pathPen = (pathFn, col, w, prog, cx, cy, r) => {       // a doodle traced with the wand, revealed in a sweep
      if (prog <= 0) return;
      for (const [x, k, ww] of [[cc, 0.6, w], [co, 0.55, w * 0.38]]) { x.save(); x.beginPath(); x.rect(cx - r * 1.3, cy - r * 1.3, r * 2.6 * Math.min(1, prog), r * 2.7); x.clip();
        x.strokeStyle = H.rgba(x === co ? H.mix(col, [255, 255, 255], 0.75) : col, k); x.lineWidth = ww; pathFn(x); x.stroke(); x.restore(); }
      if (prog < 1) tip = [cx - r * 1.3 + r * 2.6 * prog, cy + Math.sin(prog * 30) * r * 0.6, col];
    };
    // handwriting traced with the wand: the glyph laid down a few times with hand shake (soft coloured falloff),
    // and a thin, eroded white-hot core that flickers along its length
    const write = (s, x, y, size, col, prog, align = 'center') => {
      if (prog <= 0) return; cc.font = co.font = `700 ${size}px "Caveat"`; const w = cc.measureText(s).width, x0 = align === 'center' ? x - w / 2 : x;
      const jn = H.makeNoise(s.length * 31 + size), cw = (w + 12) * Math.min(1, prog);
      cc.save(); cc.beginPath(); cc.rect(x0 - 6, y - size, cw, size * 1.5); cc.clip(); cc.textAlign = 'left';
      cc.fillStyle = H.rgba(col, 0.66); cc.fillText(s, x0, y);
      for (let k = 0; k < 2; k++) { cc.fillStyle = H.rgba(col, 0.32); cc.fillText(s, x0 + jn.n2(k * 3.1, 0.5) * 1.8 + (k ? 2 : -1), y + jn.n2(k * 3.1, 7.5) * 1.8); }
      cc.restore();
      // eroded core, sized to the word (static per word, so cached)
      const bw = Math.ceil(w + 24), bh = Math.ceil(size * 1.6), er = Math.max(1.5, size * 0.03), ck = s + '|' + size + '|' + col.join(',');
      let E2 = lpCores.get(ck);
      if (!E2) {
        const T = H.layer(bw, bh), tx = T.getContext('2d'); tx.font = cc.font; tx.textAlign = 'left'; tx.fillStyle = '#fff'; tx.fillText(s, 12, size * 1.1);
        E2 = H.layer(bw, bh); const ex = E2.getContext('2d'); ex.drawImage(T, 0, 0); ex.globalCompositeOperation = 'destination-in';
        for (let k = 0; k < 8; k++) ex.drawImage(T, Math.cos(k * Math.PI / 4) * er, Math.sin(k * Math.PI / 4) * er);
        ex.globalCompositeOperation = 'source-in'; ex.fillStyle = H.rgba(H.mix(col, [255, 255, 255], 0.85), 0.95); ex.fillRect(0, 0, bw, bh);
        // flicker: the core dims in a few places where the wand turned away
        ex.globalCompositeOperation = 'destination-out';
        for (let q = 0; q < bw; q += 6) { const g = jn.n2(q * 0.02, 11); if (g > 0.35) { ex.fillStyle = `rgba(0,0,0,${Math.min(0.75, (g - 0.35) * 2.5)})`; ex.fillRect(q, 0, 6, bh); } }
        if (lpCores.size > 64) lpCores.clear();
        lpCores.set(ck, E2);
      }
      co.save(); co.beginPath(); co.rect(x0 - 6, y - size, cw, size * 1.5); co.clip();
      co.globalAlpha = 0.35; co.fillStyle = H.rgba(H.mix(col, [255, 255, 255], 0.6), 1); co.fillText(s, x0, y);
      co.globalAlpha = 1; co.drawImage(E2, 0, 0, bw, bh, x0 - 12, y - size * 1.1, bw, bh);
      co.restore();
      if (prog < 1) tip = [x0 + w * prog, y - size * 0.3 + Math.sin(prog * 50) * size * 0.2, col];
    };
    const led = (s, x, y, dot, col, k = 1) => {            // LED pixel-stick read-out
      let px = x; for (const ch of s) { const gph = LED[ch]; if (!gph) { px += dot * 3; continue; }
        for (let r = 0; r < 7; r++) for (let q = 0; q < 5; q++) if (gph[r * 5 + q] === '1') {
          const dx = px + q * dot, dy = y + r * dot; cc.fillStyle = H.rgba(col, 0.85 * k); cc.beginPath(); cc.arc(dx, dy, dot * 0.36, 0, 7); cc.fill();
          co.fillStyle = H.rgba([255, 255, 255], 0.7 * k); co.beginPath(); co.arc(dx, dy, dot * 0.16, 0, 7); co.fill(); }
        px += dot * 6; }
      return px - x;
    };
    const net = (id, ox, oy, sc, prog, cols, conP = prog) => {
      const L = [[-1, 3], [0, 4], [1, 2]], P = L.map(([lx, n]) => Array.from({ length: n }, (_, k) => [ox + lx * 150 * sc, oy + (k - (n - 1) / 2) * 92 * sc]));
      let ci = 0;
      for (let li = 0; li < 2; li++) P[li].forEach((a) => P[li + 1].forEach((b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = Math.hypot(dx, dy);
        pen(id + ci, line([a[0] + dx / L2 * 24 * sc, a[1] + dy / L2 * 24 * sc], [b[0] - dx / L2 * 24 * sc, b[1] - dy / L2 * 24 * sc], 30), cols(ci, li), cols(ci, li + 1), 2.6, sm(ci * 0.03, ci * 0.03 + 0.5, conP), 1); ci++; }));
      P.forEach((ln, li) => ln.forEach(([x, y], k) => pen(id + 100 + li * 10 + k, loop(x, y, 18 * sc), [C.cyan, C.violet, C.amber][li], [C.cyan, C.violet, C.amber][li], 4, sm(li * 0.2 + k * 0.05, li * 0.2 + k * 0.05 + 0.4, prog))));
      return P;
    };
    // the RGB tube goes straight into the colour layer; once a beat's ribbon is complete it is a static, cached image
    const ribbon = (key, opts) => {
      if (opts.prog >= 1) {
        let c = lpRibbons[key];
        if (!c || c.width !== W) { c = lpRibbons[key] = H.layer(W, Hh); const x = c.getContext('2d'); x.globalCompositeOperation = 'lighter'; lightRibbon(x, H.makeNoise(opts.seed), opts); }
        cc.drawImage(c, 0, 0);
      } else {
        const rt = lightRibbon(cc, H.makeNoise(opts.seed), opts);
        // the tube itself, white-hot, at the leading edge of the sweep
        if (rt && rt[3]) { co.strokeStyle = 'rgba(255,255,255,0.85)'; co.lineWidth = 3; co.beginPath(); co.moveTo(rt[3][0], rt[3][1]); co.lineTo(rt[3][2], rt[3][3]); co.stroke(); }
      }
    };
    let ghostA = 0, ghostDX = 0;
    // ---------------- beats ----------------
    if (beat === 0) {
      write('How does', 640, 270, 96, C.cyan, sm(0.15, 0.75, t));
      write('AI learn?', 640, 410, 150, C.pink, sm(0.8, 1.6, t));
      pen(9, quad([380, 450], [640, 490], [920, 440]), C.amber, C.amber, 5, sm(1.6, 1.9, t));
    } else if (beat === 1) {
      // the RGB tube swept round the network while it is traced (same window as the net)
      ribbon(1, { seed: 5101, cx0: 930, cy0: 290, rx: 330, ry: 215, skew: 24, tyk: 0.65, len: 86, twists: 3.0, RN: 170, stri: 4, gain: 0.65, prog: E.inOut(sm(2.45, 3.2, t)) });
      ghostA = 0.65 * sm(2.45, 4.2, t); ghostDX = 175;
      const P = net(1000, 930, 290, 1.2, sm(2.45, 3.2, t), (ci, li) => [C.cyan, C.violet, C.amber][li]);
      for (let k = 0; k < 6; k++) {
        const cx = 120 + (k % 2) * 210, cy = 130 + Math.floor(k / 2) * 185, kind = k % 3 === 1 ? 'dog' : 'cat', t0 = 2.55 + k * 0.32;
        pathPen((x) => (kind === 'cat' ? lpCat : lpDog)(x, cx, cy, 54), kind === 'cat' ? C.amber : C.cyan, 5, sm(t0, t0 + 0.28, t), cx, cy, 54);
        write(kind, cx, cy + 94, 48, C.white, sm(t0 + 0.2, t0 + 0.4, t));
        const tgt = P[0][k % 3];
        pen(200 + k, quad([cx + 60, cy], [(cx + tgt[0]) / 2, Math.min(cy, tgt[1]) - 90], [tgt[0] - 30, tgt[1]]), kind === 'cat' ? C.amber : C.cyan, C.white, 7, sm(t0 + 0.4, t0 + 0.85, t));
      }
      const p = sm(2.9, 5.4, t), v = p >= 1 ? 1000000 : Math.round(Math.pow(10, 6 * p)), s = v.toLocaleString('en-US');
      const wdt = led(s, 930 - (s.length * 6 * 10) / 2, 515, 10, C.amber, sm(2.85, 3.0, t));
      write('examples', 930, 640, 54, C.white, sm(3.0, 3.3, t));
    } else if (beat === 2) {
      pathPen((x) => lpCat(x, 200, 330, 70), C.amber, 5, sm(6.35, 6.75, t), 200, 330, 70);
      const adj = sm(9.0, 9.45, t);
      const P = net(2000, 620, 330, 1.05, sm(6.4, 7.0, t), (ci, li) => [C.cyan, C.violet, C.amber][li]);
      if (adj > 0) net(3000, 620, 330, 1.05, 1, (ci) => (ci % 3 === 0 ? C.green : C.white), adj);   // weights re-painted
      arrowPen(40, quad([300, 300], [360, 250], [440, 300]), C.white, C.white, 4, sm(6.95, 7.2, t));
      write('Guess', 370, 236, 54, C.white, sm(7.0, 7.3, t));
      arrowPen(41, quad([800, 330], [840, 310], [880, 330]), C.white, C.white, 4, sm(7.3, 7.45, t));
      write('dog?', 1010, 360, 100, C.pink, sm(7.5, 7.85, t));
      pen(42, line([1130, 300], [1200, 370], 12), C.red, C.red, 7, sm(7.95, 8.05, t)); pen(43, line([1200, 300], [1130, 370], 12), C.red, C.red, 7, sm(8.05, 8.15, t));
      pen(44, Array.from({ length: 70 }, (_, i) => { const a = -0.9 + i / 69 * Math.PI * 2.15; return [1005 + Math.cos(a) * 115, 330 + Math.sin(a) * 62]; }), C.red, C.red, 5, sm(8.1, 8.4, t));
      write('Check', 1010, 240, 54, C.red, sm(8.15, 8.45, t));
      arrowPen(45, quad([1000, 420], [880, 610], [690, 470]), C.red, C.red, 5, sm(8.45, 8.9, t));
      write('Adjust', 870, 610, 54, C.red, sm(8.75, 9.05, t));
      pen(46, line([940, 345], [1080, 330], 14), C.red, C.red, 6, sm(9.45, 9.55, t));
      write('cat', 1010, 480, 100, C.green, sm(9.55, 9.85, t));
      pen(47, [[1100, 450], [1120, 475], [1170, 410]].flatMap((p, i, a) => i ? line(a[i - 1], p, 10) : []), C.green, C.green, 7, sm(9.85, 10.0, t));
    } else if (beat === 3) {
      pen(50, [...line([140, 150], [140, 520], 20), ...line([140, 520], [760, 520], 30)], C.white, C.white, 3.5, sm(10.75, 11.1, t));
      write('training rounds', 450, 580, 46, C.white, sm(10.95, 11.3, t));
      const lp = sm(11.1, 12.3, t), pts = Array.from({ length: 60 }, (_, i) => { const r = i / 59 * 12; return [160 + r * 50, 520 - (0.97 - 0.36 * Math.exp(-r / 3.2) - 0.5) / 0.5 * 360]; });
      for (let k = 0; k < 7; k++) pen(60 + k, pts.map(([x, y]) => [x, y - 9 + k * 3]), hsl(180 + k * 25, 1, 0.6), hsl(300 + k * 15, 1, 0.6), 2, lp);  // RGB light-tube trace
      write('Accuracy', 1010, 230, 64, C.cyan, sm(10.85, 11.15, t));
      const pct = Math.round(61 + 36 * E.out(lp)), s = pct + '%';
      led(s, 1010 - s.length * 6 * 11 / 2, 290, 11, pct >= 97 ? C.green : C.amber, sm(10.9, 11.05, t));
      pen(70, Array.from({ length: 70 }, (_, i) => { const a = -1 + i / 69 * Math.PI * 2.2; return [1010 + Math.cos(a) * 170, 325 + Math.sin(a) * 92]; }), C.amber, C.pink, 5, sm(12.35, 12.7, t));
      const burst = sm(12.3, 12.75, t);
      if (burst > 0 && burst < 1) for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2 + 0.3, r0 = 180 + burst * 40, r1 = r0 + 30 + (k % 3) * 18; pen(80 + k, line([1010 + Math.cos(a) * r0, 325 + Math.sin(a) * r0 * 0.6], [1010 + Math.cos(a) * r1, 325 + Math.sin(a) * r1 * 0.6], 4), C.amber, [255, 255, 255], 2.5, 1); }
    } else {
      ribbon(4, { seed: 5104, cx0: 640, cy0: 362, rx: 560, ry: 212, skew: 26, tyk: 0.38, len: 100, twists: 3.4, RN: 180, stri: 4, gain: 0.75, prog: E.inOut(sm(13.3, 14.4, t)) });
      ghostA = 0.6 * sm(13.3, 14.6, t); ghostDX = 150;
      write('More examples', 640, 250, 104, C.cyan, sm(13.3, 13.75, t));
      arrowPen(90, line([640, 290], [640, 370], 20), C.amber, C.amber, 6, sm(13.75, 13.9, t));
      write('better guesses', 640, 500, 132, C.pink, sm(13.9, 14.4, t));
    }
    // ---------- compose: landscape + accumulated light, camera whip-pan smears it all ----------
    const bg = getLpBg(W, Hh);
    const scene = H.layer(W, Hh), sx = scene.getContext('2d');
    sx.drawImage(bg, -camX * 0.6 % (bg.width - W), 0);
    if (ghostA > 0) drawGhost(sx, getGhost(W, Hh), ghostDX, ghostA);
    sx.globalCompositeOperation = 'lighter';
    const glow34 = blurSmall(Ccol, 34, 0.125);
    // colour spill on the wet grass: the light mirrored about the horizon, squashed, fading and broken up in patches
    { const HZ = 560, SW = Math.ceil(W / 4), SH = Math.ceil((Hh - HZ) / 4), sp = H.layer(SW, SH), spx = sp.getContext('2d');
      spx.setTransform(0.25, 0, 0, -0.0875, 0, 0.0875 * HZ); spx.drawImage(glow34, 0, 0, W, Hh);
      spx.setTransform(1, 0, 0, 1, 0, 0); spx.globalCompositeOperation = 'destination-in'; spx.drawImage(getSpillMask(SW, SH), 0, 0);
      sx.globalAlpha = 1; sx.drawImage(sp, 0, HZ, W, Hh - HZ); }
    sx.globalAlpha = 0.5; sx.drawImage(glow34, 0, 0, W, Hh);
    sx.globalAlpha = 0.8; sx.drawImage(blurSmall(Ccol, 9, 0.25), 0, 0, W, Hh);
    sx.globalAlpha = 1; sx.drawImage(Ccol, 0, 0); sx.drawImage(Ccore, 0, 0);
    sx.globalAlpha = 0.6; sx.drawImage(blurSmall(Ccore, 3, 0.5), 0, 0, W, Hh);
    if (tip && smear < 0.05) { const tg = sx.createRadialGradient(tip[0], tip[1], 0, tip[0], tip[1], 34); tg.addColorStop(0, 'rgba(255,255,255,0.95)'); tg.addColorStop(0.15, H.rgba(tip[2], 0.6)); tg.addColorStop(1, H.rgba(tip[2], 0)); sx.globalAlpha = 1; sx.fillStyle = tg; sx.beginPath(); sx.arc(tip[0], tip[1], 34, 0, 7); sx.fill(); }
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, Hh);
    if (smear > 0.02) {
      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 28; k++) { ctx.globalAlpha = 0.14 * (1 - k / 28); ctx.drawImage(scene, -k * smear * 26 - smear * 80, 0); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    } else ctx.drawImage(scene, 0, 0);
    H.vignette(ctx, W, Hh, 0.55, '0,0,4');
    const img = ctx.getImageData(0, 0, W, Hh), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const l = (d[i] + d[i + 1] + d[i + 2]) / 765, k = (1 - l) * 9 + 2, n = (Rn() - 0.5) * k; d[i] += n + (Rn() - 0.5) * k * 0.8; d[i + 1] += n; d[i + 2] += n + (Rn() - 0.5) * k; }
    ctx.putImageData(img, 0, 0);
  }

  // Sound: out in a dark field at night with a camera on a tripod. Each beat is one exposure: the shutter opens (soft
  // click), the LED wand swishes through the air for exactly as long as it draws (short hand gestures, low and airy),
  // orbs fly into the network and land with a soft glow tone, the pixel-stick ticks as numbers change, and the 97%
  // ring goes off with a steel-wool spark crackle. Between beats the shutter closes and the tripod head is swung.
  // The final exposure closes over a warm chord. A quiet night breeze and a soft pad sit underneath.
  // All times are copied from lightExplainer() above (same pans table, smooth windows and doodle/orb schedule).
  // Voiceover mode (k.vo): beds and pad drop out; small gestures, labels, orb flights and counter ticks are minor.
  function lightSound(k) {
    const sm = H.smooth, E = H.ease, D = 15;
    const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
    // the wand moving through air while it draws: a run of short, low, breathy hand gestures covering a..b
    const wand = (a, b, g = 1, pan = 0, minor = true) => { const r = H.rng(Math.floor(a * 997)); let x = a;
      while (x < b - 0.04) { const d = Math.min(b - x, 0.14 + r() * 0.1), up = r() > 0.5, f0 = 380 + r() * 120, f1 = f0 * (1.6 + r() * 0.5);
        k.noise(x, { dur: d + 0.05, color: 'pink', filter: 'bandpass', f: up ? [[0, f0], [d * 0.6, f1], [d + 0.05, f0]] : [[0, f1], [d * 0.6, f0 * 1.1], [d + 0.05, f0]], q: 1.3, gain: 0.08 * g * (0.75 + r() * 0.4), a: d * 0.45, pan: pan + (r() - 0.5) * 0.3, minor });
        x += d * (0.85 + r() * 0.2); } };
    // camera shutter: open = light click; close = click with the mirror's soft knock
    const shutterOpen = (t, g = 1) => { k.noise(t, { dur: 0.015, filter: 'bandpass', f: 1800, q: 1.5, gain: 0.25 * g, a: 0.001 }); k.tone(t, { f: [[0, 300], [0.03, 160]], dur: 0.04, gain: 0.12 * g }); };
    const shutterClose = (t, g = 1) => { k.noise(t, { dur: 0.018, filter: 'bandpass', f: 1500, q: 1.3, gain: 0.3 * g, a: 0.001 }); k.tone(t, { f: [[0, 200], [0.05, 90]], dur: 0.08, gain: 0.22 * g }); k.noise(t + 0.045, { dur: 0.02, filter: 'bandpass', f: 1100, q: 2, gain: 0.15 * g, a: 0.001 }); };
    // tripod head swung hard (smoothstep pan a..b): low friction drag + air, fastest in the middle
    const swing = (a, b) => { const d = b - a;
      k.noise(a + 0.03, { dur: d, color: 'brown', filter: 'bandpass', f: [[0, 160], [d / 2, 320], [d, 140]], q: 1.4, gain: 0.32, a: d * 0.45 });
      k.noise(a + 0.03, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 400], [d / 2, 1100], [d, 450]], q: 0.9, gain: 0.09, a: d * 0.5 }); };
    const transition = (a, b) => { shutterClose(a, 0.9); swing(a, b); shutterOpen(b, 0.8); };
    // an orb flying along its arc and landing in the network (soft glow tone on arrival)
    const orb = (a, b, pan0, pan1) => { const d = b - a;
      k.noise(a, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 600], [d, 1300]], q: 2, gain: 0.045, a: d * 0.7, pan: pan0, minor: true });
      k.tone(b, { f: 'A3', dur: 0.5, gain: 0.07, a: 0.01, verb: 0.3, pan: pan1, minor: true }); k.tone(b, { f: 'E4', dur: 0.35, gain: 0.03, a: 0.01, verb: 0.3, pan: pan1, minor: true }); };
    // pixel-stick readout ticks, throttled
    const pixel = (val, a, b, gap, pan, avoid = []) => { let last = -1, prev = val(a);
      for (let t = a; t <= b; t += 0.002) { const v = val(t);
        if (v !== prev && t - last >= gap && !avoid.some((x) => t > x - 0.03 && t < x + 0.1)) { k.play('click', t, { f: 1500, gain: 1.5, pan, minor: true }); last = t; }
        prev = v; } };

    // ---- beds: night breeze, a quiet field; a soft slow pad (64 bpm, one chord per 3.75 s)
    k.bed('room', 0, D, { gain: 0.3 });
    k.noise(0, { dur: D, color: 'pink', filter: 'lowpass', f: [[0, 380], [5, 520], [10, 340], [15, 480]], gain: 0.05, a: 1, hold: D - 2, bus: 'amb', minor: true });
    k.music('pad', 0, D, { bpm: 64, gain: 0.22, chords: [['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']] });

    // ---- beat 0: exposure opens; "How does" 0.15–0.75, "AI learn?" 0.8–1.6, underline 1.6–1.9
    shutterOpen(0.05, 1);
    wand(0.15, 0.75, 1.0, -0.2, false);
    wand(0.8, 1.6, 1.2, 0.1, false);
    wand(1.6, 1.9, 0.9, 0.2);
    transition(2.05, 2.5);

    // ---- beat 1: network traced 2.45–3.2; six doodles at t0 = 2.55 + k*0.32 (doodle t0..t0+0.28, label +0.2..+0.4),
    //      each sends an orb along an arc (t0+0.4 .. t0+0.85) into the input layer
    wand(2.5, 3.2, 0.35, 0.45);
    const land = [];
    for (let c = 0; c < 6; c++) { const t0 = 2.55 + c * 0.32, pan = c % 2 ? -0.55 : -0.8;
      wand(t0, t0 + 0.38, 0.4, pan); orb(t0 + 0.4, t0 + 0.85, pan, 0.3); land.push(t0 + 0.85); }
    // LED pixel-stick counter 10^(6p), p = sm(2.9, 5.4), lit 2.85; "examples" 3.0–3.3
    pixel((t) => { const p = sm(2.9, 5.4, t); return p >= 1 ? 1e6 : Math.round(Math.pow(10, 6 * p)); }, 2.92, 5.35, 0.09, 0.3, land);
    k.play('tick', 5.4, { f: 2400, gain: 1.0, pan: 0.3 }); k.tone(5.4, { f: 'E4', dur: 0.4, gain: 0.08, verb: 0.25, pan: 0.3 });
    transition(5.9, 6.35);

    // ---- beat 2: cat doodle 6.35–6.75, network 6.4–7.0, Guess arrow 6.95–7.2 + label 7.0–7.3, arrow 7.3–7.45
    wand(6.38, 6.75, 0.8, -0.6);
    wand(6.75, 7.0, 0.5, 0);
    wand(7.0, 7.3, 0.6, -0.3); wand(7.3, 7.45, 0.5, 0.3);
    wand(7.5, 7.85, 1.0, 0.45, false);                             // "dog?" (the guess)
    // WRONG: two hard red slashes 7.95–8.05, 8.05–8.15, then a ring 8.1–8.4 and "Check" 8.15–8.45
    [7.95, 8.05].forEach((ts, i) => { k.noise(ts, { dur: 0.12, color: 'pink', filter: 'bandpass', f: [[0, 1400], [0.1, 350]], q: 1.1, gain: 0.34, a: 0.01, pan: 0.6 });
      k.tone(ts + 0.02, { f: [[0, i ? 150 : 175], [0.12, 70]], dur: 0.2, gain: 0.28, pan: 0.6 }); });
    k.tone(8.0, { f: 'D3', type: 'triangle', dur: 0.45, gain: 0.1, a: 0.01, verb: 0.2, pan: 0.5 }); k.tone(8.0, { f: 'Ab3', type: 'triangle', dur: 0.45, gain: 0.07, a: 0.01, verb: 0.2, pan: 0.5 }); // sour, low
    wand(8.15, 8.45, 0.6, 0.45);
    wand(8.45, 8.9, 0.8, 0.2, false);                              // red arrow back
    wand(8.92, 9.05, 0.5, 0.1);                                    // "Adjust" tail
    // weights re-painted 9.0–9.45: a soft rising glow swell under the net
    k.tone(9.0, { f: [[0, 220], [0.45, 330]], type: 'triangle', dur: 0.55, gain: 0.06, a: 0.25, verb: 0.3 });
    k.noise(9.0, { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.45, 1400]], q: 1.5, gain: 0.08, a: 0.3, minor: true });
    // RIGHT: strike-through 9.45–9.55, "cat" 9.55–9.85, tick 9.85–10.0
    wand(9.45, 9.55, 0.6, 0.45);
    wand(9.55, 9.85, 1.0, 0.45, false);
    wand(9.85, 10.0, 0.9, 0.6, false);
    k.play('success', 10.0, { f: 'A4', gain: 0.6, pan: 0.45 });
    transition(10.3, 10.75);

    // ---- beat 3: axes 10.75–11.1, "Accuracy" 10.85–11.15, labels; RGB tube sweeps the curve 11.1–12.3
    wand(10.78, 11.1, 0.6, -0.5);
    wand(11.1, 11.3, 0.4, 0.4);
    // the light tube is swept along the curve: one long, smooth airy pass, brighter as it climbs
    k.noise(11.1, { dur: 1.2, color: 'pink', filter: 'bandpass', f: [[0, 350], [1.2, 900]], q: 1.2, gain: 0.07, a: 0.3, hold: 0.7, pan: -0.4, minor: true });
    k.tone(11.1, { f: [[0, 196], [1.2, 294]], type: 'triangle', dur: 1.25, gain: 0.03, a: 0.3, hold: 0.7, pan: -0.4, minor: true });
    const pct = (t) => Math.round(61 + 36 * E.out(sm(11.1, 12.3, t)));
    const t97 = when(pct, 97, 11.1, 12.3);
    pixel(pct, 11.11, t97 - 0.04, 0.085, 0.45);
    k.play('tick', t97, { f: 2400, gain: 1.0, pan: 0.45 }); k.tone(t97, { f: 'E4', dur: 0.4, gain: 0.08, verb: 0.25, pan: 0.45 });
    // THE HIT 12.3: steel wool spins up — a soft ignition thump, then a spark crackle as the burst flies (12.3–12.75)
    k.play('thud', 12.3, { f: 90, gain: 1.1, pan: 0.4 });
    k.noise(12.3, { dur: 0.5, color: 'pink', filter: 'lowpass', f: [[0, 2600], [0.45, 400]], gain: 0.28, a: 0.005, verb: 0.35, pan: 0.4 });
    { const r = H.rng(1230); for (let x = 0; x < 0.5; x += 0.012 + r() * 0.02) k.noise(12.3 + x, { dur: 0.006 + r() * 0.006, filter: 'bandpass', f: 1200 + r() * 1300, q: 1.2, gain: (0.35 + r() * 0.35) * (1 - x * 1.4), a: 0.001, pan: 0.4 + (r() - 0.5) * 0.9 }); }
    wand(12.35, 12.7, 0.7, 0.4);                                   // ring traced round 97%
    ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => k.tone(12.32, { f: n, type: 'triangle', dur: 1.0, gain: 0.05, a: 0.02, hold: 0.15, filter: 'lowpass', f2: 1800, verb: 0.35, pan: (i - 1.5) * 0.3 }));
    transition(12.85, 13.3);

    // ---- beat 4: "More examples" 13.3–13.75, arrow 13.75–13.9, "better guesses" 13.9–14.4
    wand(13.3, 13.75, 1.0, -0.1, false);
    wand(13.75, 13.9, 0.6, 0);
    wand(13.9, 14.4, 1.1, 0.1, false);
    // resolve: the last exposure closes over a warm chord
    shutterClose(14.45, 1.0);
    ['C3', 'G3', 'E4', 'B4'].forEach((n, i) => k.tone(14.42, { f: n, type: i ? 'sine' : 'triangle', dur: 0.58, gain: 0.08 - i * 0.012, a: 0.05, hold: 0.2, verb: 0.4, pan: (i - 1.5) * 0.25 }));
  }

  registerStyle({
    id: 'light-painting',
    name: 'Light Painting',
    category: 'Light & Imaging',
    description: 'A 30-second exposure in a dark field: a neural network drawn in the air with an LED wand and a twisting rainbow light-tube ribbon, hand-jittered trails with hot cores and coloured falloff, a ghost of the painter, pinpoint stars, horizon bokeh and colour spill on the grass.',
    motion: 'Shot as a live-composite exposure: the wand traces node after node and fans out each layer of connections, the RGB tube sweeps the twisting ribbon around it, the word is written last, while the ghost painter slowly accumulates and star trails lengthen.',
    fonts: ['700 92px "Caveat"'],
    frameT: 5.6,
    duration: 6,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Each beat is a fresh live long exposure: the wand traces doodles, arrows and handwriting with its glowing tip, orbs leave arcing light trails into the network, numbers come from an LED pixel-stick, the emphasis is a traced ring with a spark burst, and between beats the camera whip-pans so every trail smears into streaks.',
    explainer(ctx, W, Hh, t) { lightExplainer(ctx, W, Hh, t); },
    explainerSound(k) { lightSound(k); },
    draw(ctx, W, Hh, t) {
      const R = H.rng(3030), nz = H.makeNoise(303);
      const HZ = 528; // horizon
      const sch = (a, d) => H.clamp((t - a) / d); // stroke progress
      const ghostA = 0.3 + 0.7 * H.smooth(0.2, 4.6, t);
      const expo = 0.3 + 0.7 * H.smooth(0, 6, t);  // star trails lengthen as the exposure accumulates
      let tip = null;

      // ---------- night landscape ----------
      const sky = ctx.createLinearGradient(0, 0, 0, HZ);
      sky.addColorStop(0, '#02030a'); sky.addColorStop(0.6, '#060a1c'); sky.addColorStop(1, '#14182c');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, HZ + 2);
      // light-pollution glow on the horizon
      const lp = ctx.createRadialGradient(980, HZ, 10, 980, HZ, 520);
      lp.addColorStop(0, 'rgba(120,80,60,0.35)'); lp.addColorStop(1, 'rgba(60,40,40,0)');
      ctx.fillStyle = lp; ctx.fillRect(0, 0, W, HZ + 2);
      // stars: pinpoints, a few short trails from earth rotation
      for (let k = 0; k < 520; k++) {
        const x = R() * W, y = Math.pow(R(), 1.3) * (HZ - 30), m = Math.pow(R(), 5);
        const col = R.pick([[255, 255, 255], [200, 215, 255], [255, 230, 200], [180, 200, 255]]);
        const fade = 1 - H.smooth(HZ - 160, HZ, y) * 0.8;
        ctx.strokeStyle = H.rgba(col, (0.25 + m * 0.75) * fade); ctx.lineWidth = 0.8 + m * 1.6; ctx.lineCap = 'round';
        const len = (1 + m * 3) * expo;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y - len * 0.35); ctx.stroke();
        if (m > 0.6) { ctx.fillStyle = H.rgba(col, 0.1 * fade); ctx.beginPath(); ctx.arc(x, y, 2.5 + m * 1.5, 0, 7); ctx.fill(); }
      }
      // treeline / hills silhouette
      ctx.fillStyle = '#04050a';
      ctx.beginPath(); ctx.moveTo(0, HZ);
      for (let x = 0; x <= W; x += 4) {
        const hill = 18 * Math.sin(x * 0.004 + 1.2) + 10 * Math.sin(x * 0.011);
        const trees = Math.max(0, nz.fbm2(x * 0.03, 2.2, 3)) * 46 * H.smooth(80, 300, x) * (1 - H.smooth(760, 940, x)) + Math.max(0, nz.n2(x * 0.08, 5)) * 10;
        ctx.lineTo(x, HZ - 14 - hill - trees);
      }
      ctx.lineTo(W, Hh); ctx.lineTo(0, Hh); ctx.fill();
      // grass field texture
      for (let k = 0; k < 2600; k++) {
        const x = R() * W, y = HZ + Math.pow(R(), 0.7) * (Hh - HZ);
        ctx.strokeStyle = `rgba(30,36,48,${R.range(0.2, 0.6)})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + R.range(-3, 3), y - R.range(3, 6 + (y - HZ) * 0.05)); ctx.stroke();
      }
      // bokeh: distant out-of-focus lights along the horizon
      const bok = [[860, HZ - 30, 18, [255, 170, 90]], [915, HZ - 22, 13, [255, 200, 120]], [1040, HZ - 34, 22, [255, 150, 70]], [1100, HZ - 18, 11, [170, 210, 255]],
        [1170, HZ - 28, 16, [255, 190, 110]], [120, HZ - 26, 14, [255, 160, 80]], [60, HZ - 16, 9, [255, 210, 150]], [990, HZ - 12, 9, [255, 220, 170]]];
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      bok.forEach(([x, y, r, c]) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, H.rgba(c, 0.18)); g.addColorStop(0.8, H.rgba(c, 0.26)); g.addColorStop(0.95, H.rgba(c, 0.42)); g.addColorStop(1, H.rgba(c, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      });
      ctx.restore();

      // ---------- ghost painter (moved during exposure: translucent) ----------
      drawGhost(ctx, getGhost(W, Hh), 0, ghostA);

      // ---------- light trails ----------
      const Ccol = H.layer(W, Hh), cc = Ccol.getContext('2d');   // coloured trail
      const Ccore = H.layer(W, Hh), co = Ccore.getContext('2d'); // hot core
      [cc, co].forEach((x) => { x.globalCompositeOperation = 'lighter'; x.lineCap = 'round'; x.lineJoin = 'round'; });
      let seed = 1;
      // a hand-held LED pen stroke along pts with jitter, speed-dependent brightness and colour from c0->c1
      const pen = (pts, c0, c1, width = 4.2, gaps = 0, pr = 1) => {
        const jn = H.makeNoise(seed++);
        const N = pts.length;
        let prev = null;
        for (let i = 0; i < N; i++) {
          const u = i / (N - 1);
          if (u > pr) break;
          const [x0, y0] = pts[i];
          const x = x0 + jn.n2(u * 9, 0.5) * 2.4, y = y0 + jn.n2(u * 9, 7.5) * 2.4;
          if (prev) {
            const sp = 0.65 + 0.35 * jn.n2(u * 4, 3);         // dwell variation
            const off = gaps && jn.n2(u * 6, 11) > 0.42;       // pen flicker gap
            if (!off) {
              const c = H.mix(c0, c1, u);
              cc.strokeStyle = H.rgba(c, 0.55 * sp); cc.lineWidth = width * (0.8 + sp * 0.4);
              cc.beginPath(); cc.moveTo(prev[0], prev[1]); cc.lineTo(x, y); cc.stroke();
              co.strokeStyle = H.rgba(H.mix(c, [255, 255, 255], 0.75), 0.5 * sp); co.lineWidth = width * 0.38;
              co.beginPath(); co.moveTo(prev[0], prev[1]); co.lineTo(x, y); co.stroke();
            }
          }
          prev = [x, y];
        }
        if (pr > 0 && pr < 1 && prev) tip = [prev[0], prev[1], H.mix(c0, c1, pr)];
      };
      const line = (a, b, n = 60) => Array.from({ length: n }, (_, i) => [a[0] + (b[0] - a[0]) * i / (n - 1), a[1] + (b[1] - a[1]) * i / (n - 1)]);
      const loop = (cx, cy, r, turns = 2.3, n = 120) => Array.from({ length: n }, (_, i) => {
        const a = i / (n - 1) * Math.PI * 2 * turns - 1.2, rr = r * (1 + 0.08 * Math.sin(a * 0.5)) + i * 0.02;
        return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.96];
      });

      // neural net layout
      const layers = [3, 4, 4, 2];
      const lx = [330, 500, 670, 840];
      const nodes = layers.map((n, li) => Array.from({ length: n }, (_, k) => [lx[li] + Math.sin(k * 2 + li) * 6, 300 + (k - (n - 1) / 2) * 96 + Math.cos(k + li) * 6]));
      const lcol = [[60, 220, 255], [170, 90, 255], [255, 70, 190], [255, 180, 60]];
      for (let li = 0; li < layers.length - 1; li++) {
        let ci = 0;
        nodes[li].forEach((a) => nodes[li + 1].forEach((b) => {
          const cp = sch(0.62 + li * 0.6 + (ci++) * 0.022, 0.26);
          const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
          const a2 = [a[0] + dx / L * 26, a[1] + dy / L * 26], b2 = [b[0] - dx / L * 26, b[1] - dy / L * 26];
          pen(line(a2, b2, 50), lcol[li], lcol[li + 1], 2.6, 1, cp);
        }));
      }
      nodes.forEach((ln, li) => ln.forEach(([x, y], k) => pen(loop(x, y, 20), lcol[li], H.mix(lcol[li], [255, 255, 255], 0.3), 4.5, 0, sch(0.3 + li * 0.6 + k * 0.07, 0.24))));

      // light-tube ribbon: a 60cm RGB tube swept and twisted around the net
      const Rb = H.layer(W, Hh), rb = Rb.getContext('2d');
      rb.globalCompositeOperation = 'lighter';
      const rprog = H.ease.inOut(sch(2.5, 1.1));
      { const rt = lightRibbon(rb, nz, { cx0: 590, cy0: 290, rx: 430, ry: 182, prog: rprog }); if (rt) tip = rt; }

      // light-written word (pen script)
      co.save(); cc.save();
      const word = 'learning';
      const writeWord = (x, col, a, wobble) => {
        x.font = '700 92px "Caveat"'; x.textAlign = 'center';
        x.fillStyle = col; x.globalAlpha = a;
        x.save(); x.beginPath(); x.rect(395, 440, 10 + wp * 420, 160); x.clip();
        x.translate(600 + wobble, 548); x.rotate(-0.05); x.fillText(word, 0, 0); x.restore();
      };
      const wp = sch(3.65, 0.85);
      if (wp > 0 && wp < 1) tip = [395 + 10 + wp * 420, 530 - Math.sin(wp * 40) * 18, [255, 140, 60]];
      if (wp > 0) {
        writeWord(cc, 'rgb(255,120,40)', 0.9, 0); writeWord(cc, 'rgb(255,80,30)', 0.4, 2);
        co.globalCompositeOperation = 'source-over';
        const tmp = H.layer(W, Hh), tx = tmp.getContext('2d'); writeWord(tx, '#fff', 1, 0);
        // thin core: erode the glyphs
        const ero = H.layer(W, Hh), ex = ero.getContext('2d'); ex.drawImage(tmp, 0, 0); ex.globalCompositeOperation = 'destination-in';
        for (let k = 0; k < 8; k++) ex.drawImage(tmp, Math.round(Math.cos(k * Math.PI / 4) * 2), Math.round(Math.sin(k * Math.PI / 4) * 2));
        ex.globalCompositeOperation = 'source-in'; ex.fillStyle = 'rgba(255,236,200,0.95)'; ex.fillRect(0, 0, W, Hh);
        co.globalCompositeOperation = 'lighter'; co.drawImage(ero, 0, 0);
      }
      co.restore(); cc.restore();

      // ---------- composite light (additive, with optical bloom) ----------
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      // spill onto the grass beneath (soft, squashed)
      ctx.globalAlpha = 1.0; ctx.drawImage(blurSmall(Ccol, 40, 0.125), 0, HZ + 6, W, 190);
      ctx.drawImage(blurSmall(Rb, 40, 0.125), 0, HZ + 6, W, 190);
      ctx.globalAlpha = 0.5; ctx.drawImage(blurSmall(Ccol, 34, 0.125), 0, 0, W, Hh);
      ctx.globalAlpha = 0.8; ctx.drawImage(blurSmall(Ccol, 9, 0.25), 0, 0, W, Hh);
      ctx.globalAlpha = 0.7; ctx.drawImage(blurSmall(Rb, 22, 0.25), 0, 0, W, Hh);
      ctx.globalAlpha = 1; ctx.drawImage(Rb, 0, 0); ctx.drawImage(Ccol, 0, 0);
      ctx.drawImage(Ccore, 0, 0);
      ctx.globalAlpha = 0.6; ctx.drawImage(blurSmall(Ccore, 3, 0.5), 0, 0, W, Hh);
      ctx.restore();

      // the wand itself, live at the current stroke tip
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (tip) {
        const tg = ctx.createRadialGradient(tip[0], tip[1], 0, tip[0], tip[1], 34);
        tg.addColorStop(0, 'rgba(255,255,255,0.95)'); tg.addColorStop(0.15, H.rgba(tip[2], 0.6)); tg.addColorStop(1, H.rgba(tip[2], 0));
        ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(tip[0], tip[1], 34, 0, 7); ctx.fill();
        if (tip[3]) { ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tip[3][0], tip[3][1]); ctx.lineTo(tip[3][2], tip[3][3]); ctx.stroke(); }
      }
      ctx.restore();
      // wand light on the painter's raised hand
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = tip ? 0.3 : 1;
      const wg = ctx.createRadialGradient(910, 270, 0, 910, 270, 22);
      wg.addColorStop(0, 'rgba(255,220,180,0.55)'); wg.addColorStop(1, 'rgba(255,160,80,0)');
      ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(910, 270, 22, 0, 7); ctx.fill();
      ctx.restore();

      // ---------- sensor finish: high-ISO noise, vignette ----------
      // slow push-in
      const push = 1 + 0.03 * H.ease.inOut(H.clamp(t / 6));
      const cpy = H.layer(W, Hh); cpy.getContext('2d').drawImage(ctx.canvas, 0, 0);
      ctx.save(); ctx.translate(600, 330); ctx.scale(push, push); ctx.translate(-600, -330); ctx.drawImage(cpy, 0, 0); ctx.restore();
      H.vignette(ctx, W, Hh, 0.55, '0,0,4');
      const Rn = H.rng(31 + Math.floor(t * 30));
      const img = ctx.getImageData(0, 0, W, Hh), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const l = (d[i] + d[i + 1] + d[i + 2]) / 765, k = (1 - l) * 9 + 2;
        const n = (Rn() - 0.5) * k;
        d[i] += n + (Rn() - 0.5) * k * 0.8; d[i + 1] += n; d[i + 2] += n + (Rn() - 0.5) * k;
      }
      ctx.putImageData(img, 0, 0);
    },
  });
}
