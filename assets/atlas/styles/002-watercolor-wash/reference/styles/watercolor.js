{
  // ---------------------------------------------------------------
  // Watercolor — layered deformed-polygon washes on cold-press paper
  // ---------------------------------------------------------------
  const PAPER = [251, 248, 240];

  // recursive midpoint displacement; each vertex carries its own "wobble" weight v
  function deform(pts, r, depth, amt) {
    let p = pts;
    for (let d = 0; d < depth; d++) {
      const out = [];
      for (let i = 0; i < p.length; i++) {
        const a = p[i], b = p[(i + 1) % p.length];
        out.push(a);
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const v = (a.v + b.v) * 0.5;
        const s = len * amt * v;
        out.push({ x: (a.x + b.x) / 2 + r.gauss() * s, y: (a.y + b.y) / 2 + r.gauss() * s, v: v * (0.7 + r() * 0.6) });
      }
      p = out;
    }
    return p;
  }
  function poly(c, pts) {
    c.beginPath(); c.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
    c.closePath();
  }
  const P = (x, y, v = 1) => ({ x, y, v });
  function circlePts(cx, cy, rx, ry, n, r, vv = 1, a0 = 0, a1 = Math.PI * 2) {
    const out = [];
    for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * i / n; out.push(P(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, vv * (0.6 + r() * 0.8))); }
    return out;
  }

  // value-noise field (fast) in 0..1, sampled bilinearly from a random grid
  function grid(W, H_, cell, r) {
    const gw = Math.ceil(W / cell) + 2, gh = Math.ceil(H_ / cell) + 2, g = new Float32Array(gw * gh);
    for (let i = 0; i < g.length; i++) g[i] = r();
    return (x, y) => {
      const fx = x / cell, fy = y / cell, ix = fx | 0, iy = fy | 0, tx = fx - ix, ty = fy - iy;
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const a = g[iy * gw + ix], b = g[iy * gw + ix + 1], c = g[(iy + 1) * gw + ix], d = g[(iy + 1) * gw + ix + 1];
      return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
    };
  }

  function makeMottle(W, H_, seed) {
    const c = H.layer(W, H_), x = c.getContext('2d'), r = H.rng(seed);
    const small = H.layer(48, 27), sx = small.getContext('2d');
    for (let j = 0; j < 27; j++) for (let i = 0; i < 48; i++) { sx.fillStyle = `rgba(0,0,0,${0.55 + r() * 0.45})`; sx.fillRect(i, j, 1, 1); }
    const mid = H.layer(160, 90), mx = mid.getContext('2d');
    for (let j = 0; j < 90; j++) for (let i = 0; i < 160; i++) { mx.fillStyle = `rgba(0,0,0,${0.75 + r() * 0.25})`; mx.fillRect(i, j, 1, 1); }
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(small, 0, 0, W, H_);
    x.globalCompositeOperation = 'destination-in'; x.drawImage(mid, 0, 0, W, H_);
    return c;
  }


  // =================================================================
  // EXPLAINER — "How does AI learn?" painted along one long sketchbook sheet; the camera pans across it.
  // =================================================================
  const EXW = 3400;
  let EXC = null;
  const lerp = (a, b, u) => a + (b - a) * u;
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ez = (u) => H.ease.inOut(cl(u));
  const win = (t, a, b) => cl((t - a) / (b - a));

  // pigment pools at the drying edge: alpha += (alpha - blurred alpha) * pool
  function rimPool(cv, pool = 2.2, blur = 4) {
    const w = cv.width, h = cv.height, c = cv.getContext('2d');
    const B = H.layer(w, h), b = B.getContext('2d');
    b.filter = `blur(${blur}px)`; b.drawImage(cv, 0, 0); b.filter = 'none';
    const A = c.getImageData(0, 0, w, h), d = A.data, e = b.getImageData(0, 0, w, h).data;
    for (let i = 3; i < d.length; i += 4) { const rim = d[i] - e[i]; if (rim > 0) d[i] = Math.min(255, d[i] + rim * pool); }
    c.putImageData(A, 0, 0);
    return cv;
  }
  // layered deformed-polygon wash into a canvas context
  function exWash(c, base, col, { layers = 26, alpha = 0.06, amt = 0.14, depth = 3, seed = 1, comp = 'source-over' } = {}) {
    const r = H.rng(seed);
    c.save(); c.globalCompositeOperation = comp; c.fillStyle = Array.isArray(col) ? H.rgba(col, 1) : col;
    for (let i = 0; i < layers; i++) { c.globalAlpha = alpha * (0.6 + r() * 0.8); poly(c, deform(base, r, depth, amt)); c.fill(); }
    c.restore();
  }
  const blob = (x, y, rx, ry, seed, n = 10, v = 1) => deform(circlePts(x, y, rx, ry, n, H.rng(seed), v), H.rng(seed + 1), 2, 0.25);
  function exBloom(c, x, y, r0, seed, a = 0.5) { exWash(c, blob(x, y, r0, r0 * 0.85, seed, 9, 1.4), '#000', { layers: 10, alpha: a / 5, amt: 0.35, depth: 2, seed: seed + 3, comp: 'destination-out' }); }

  function cachedExplainer() {
    if (EXC) return EXC;
    const C = {};
    // --- world-long sheet of cold-press paper (tooth baked in once; the height map is kept for granulation) ---
    const pw = H.layer(EXW, 720), px = pw.getContext('2d');
    const gr = H.rng(99), fine = grid(EXW, 720, 2.2, gr), mid = grid(EXW, 720, 7, gr), big = grid(EXW, 720, 40, gr);
    const img = px.createImageData(EXW, 720), d = img.data, HM = new Float32Array(EXW * 720);
    let prev = new Float32Array(EXW), cur = new Float32Array(EXW);
    for (let y = 0; y < 720; y++) {
      for (let x = 0; x < EXW; x++) cur[x] = HM[y * EXW + x] = fine(x, y) * 0.3 + mid(x, y) * 0.5 + big(x, y) * 0.2;
      for (let x = 0; x < EXW; x++) {
        const sh = 1 + ((x > 0 ? prev[x - 1] : prev[x]) - cur[x]) * 0.1 + (big(x, y) - 0.5) * 0.03, o = (y * EXW + x) * 4;
        d[o] = PAPER[0] * sh; d[o + 1] = PAPER[1] * sh; d[o + 2] = PAPER[2] * sh; d[o + 3] = 255;
      }
      const tmp = prev; prev = cur; cur = tmp;
    }
    px.putImageData(img, 0, 0);
    // the sheet isn't bare white: a very faint warm tone that gathers toward the top and bottom edges, plus old ghost washes
    px.save(); px.globalCompositeOperation = 'multiply';
    const ev = px.createLinearGradient(0, 0, 0, 720); ev.addColorStop(0, 'rgba(232,214,182,0.55)'); ev.addColorStop(0.18, 'rgba(250,240,222,0.2)');
    ev.addColorStop(0.8, 'rgba(250,240,222,0.2)'); ev.addColorStop(1, 'rgba(228,208,172,0.6)'); px.fillStyle = ev; px.fillRect(0, 0, EXW, 720);
    const gw = H.rng(404);
    for (let k = 0; k < 14; k++) { const warm = gw() < 0.5, x0 = gw.range(0, EXW), y0 = gw.range(0, 720), rx = gw.range(140, 320), ry = gw.range(70, 170);
      px.save(); px.translate(x0, y0); px.scale(1, ry / rx); const g = px.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, warm ? 'rgba(236,214,170,0.2)' : 'rgba(214,214,226,0.16)'); g.addColorStop(1, 'rgba(255,255,255,0)'); px.fillStyle = g; px.fillRect(-rx, -rx, rx * 2, rx * 2); px.restore(); }
    px.restore();
    C.paper = pw;
    // mottle (same recipe as makeMottle, built from ImageData instead of thousands of fillRects)
    const mottle = H.layer(1400, 700); {
      const r = H.rng(77), cell = (w, h, lo) => { const c = H.layer(w, h), x = c.getContext('2d'), im = x.createImageData(w, h);
        for (let i = 0; i < w * h; i++) im.data[i * 4 + 3] = (lo + r() * (1 - lo)) * 255; x.putImageData(im, 0, 0); return c; };
      const sm = cell(48, 27, 0.55), md = cell(160, 90, 0.75), mx = mottle.getContext('2d');
      mx.imageSmoothingQuality = 'high'; mx.drawImage(sm, 0, 0, 1400, 700); mx.globalCompositeOperation = 'destination-in'; mx.drawImage(md, 0, 0, 1400, 700); }
    // pooled drying edge + granulation in one pixel pass (alpha += (alpha - blurred alpha) * pool, then the paper-pit boost)
    const poolGran = (cv, pool, blur, at) => {
      // the blurred alpha is smooth, so it is computed at half resolution
      const w = cv.width, h = cv.height, c = cv.getContext('2d'), w2 = Math.ceil(w / 2), h2 = Math.ceil(h / 2), B = H.layer(w2, h2), b = B.getContext('2d');
      b.filter = `blur(${blur / 2}px)`; b.drawImage(cv, 0, 0, w2, h2);
      const im = c.getImageData(0, 0, w, h), dd = im.data, e = b.getImageData(0, 0, w2, h2).data, wx = at[0], wy = at[1], k = at[2] || 1;
      let hs = 9173;
      for (let y = 0; y < h; y++) { const Y = y + wy, row = Y >= 0 && Y < 720 ? Y * EXW : -1; for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4; let a = dd[i + 3]; hs = (hs * 1103515245 + 12345) & 0x7fffffff; if (!a) continue;
        const rim = a - e[((y >> 1) * w2 + (x >> 1)) * 4 + 3]; if (rim > 0) a = Math.min(255, a + rim * pool);
        const X = x + wx, hh = row >= 0 && X >= 0 && X < EXW ? HM[row + X] : 0.5;
        const blue = Math.max(0, (dd[i + 2] - dd[i]) / 120), sp = (hs & 1023) / 1023;
        dd[i + 3] = Math.min(255, a * (1 + k * ((0.5 - hh) * 2 * (0.18 + blue * 0.7) + (sp > 0.88 ? (sp - 0.88) * 4 * (0.2 + blue) : 0))));
      } }
      c.putImageData(im, 0, 0);
    };
    // softened mottle for the explainer washes: alpha 0.5 + 0.5 * mottle, so pigment load varies without camouflage blotches
    const soft = H.layer(1400, 700); { const sx = soft.getContext('2d'); sx.fillStyle = 'rgba(0,0,0,0.5)'; sx.fillRect(0, 0, 1400, 700); sx.drawImage(mottle, 0, 0); }
    // wash canvas: paint (optionally at half resolution for the big loose washes) -> mottle -> pooled drying edge -> granulation
    const mk = (w, h, fn, pool = 2.2, blur = 6, at = null, post = null, half = false) => {
      const cv = H.layer(w, h), c = cv.getContext('2d');
      if (half) { const hv = H.layer(Math.ceil(w / 2), Math.ceil(h / 2)), hc = hv.getContext('2d'); hc.scale(0.5, 0.5); fn(hc, w, h);
        c.imageSmoothingQuality = 'high'; c.drawImage(hv, 0, 0, w, h);
        // feather the canvas border so a wash can never end in a straight cut
        c.globalCompositeOperation = 'destination-in'; const fx = c.createLinearGradient(0, 0, w, 0), fy = c.createLinearGradient(0, 0, 0, h);
        [[0, 0], [40 / w, 1], [1 - 40 / w, 1], [1, 0]].forEach(([o, a]) => fx.addColorStop(o, `rgba(0,0,0,${a})`));
        [[0, 0], [40 / h, 1], [1 - 40 / h, 1], [1, 0]].forEach(([o, a]) => fy.addColorStop(o, `rgba(0,0,0,${a})`));
        c.fillStyle = fx; c.fillRect(0, 0, w, h); c.fillStyle = fy; c.fillRect(0, 0, w, h); }
      else fn(c, w, h);
      c.globalCompositeOperation = 'destination-in'; c.drawImage(soft, 0, 0, w, h); c.globalCompositeOperation = 'source-over';
      if (at) poolGran(cv, pool, blur, at); else rimPool(cv, pool, blur);
      if (post) post(c, w, h);
      return cv;
    };
    // wet-in-wet: a second pigment dropped into the damp wash, as soft radial blooms that only tint where the wash already is
    const softEll = (c, x, y, rx, ry, rot, col, a) => { c.save(); c.translate(x, y); c.rotate(rot); c.scale(1, ry / rx); const g = c.createRadialGradient(0, 0, 0, 0, 0, rx * 1.25);
      g.addColorStop(0, H.rgba(col, a)); g.addColorStop(0.6, H.rgba(col, a * 0.75)); g.addColorStop(1, H.rgba(col, 0)); c.fillStyle = g; c.fillRect(-rx * 1.25, -rx * 1.25, rx * 2.5, rx * 2.5); c.restore(); };
    const drop = (c, col, blobs) => { c.save(); c.globalCompositeOperation = 'source-atop';
      blobs.forEach(([x, y, rx, ry, a]) => { c.save(); c.translate(x, y); c.scale(1, ry / rx); const g = c.createRadialGradient(0, 0, 0, 0, 0, rx * 1.3);
        g.addColorStop(0, H.rgba(col, a)); g.addColorStop(0.55, H.rgba(col, a * 0.7)); g.addColorStop(1, H.rgba(col, 0)); c.fillStyle = g; c.fillRect(-rx * 1.3, -rx * 1.3, rx * 2.6, rx * 2.6); c.restore(); });
      c.restore(); };
    // built on first use, so a frame only pays for the washes it actually shows
    const lazy = (name, build) => { let v = null; Object.defineProperty(C, name, { get: () => v || (v = build()) }); };
    // --- loose background washes, one per stop on the sheet (revealed as the camera arrives) ---
    lazy('bgData', () => mk(1300, 600, (c) => {
      const base = deform([P(150, 330, 1.3), P(380, 250, 1.0), P(700, 270, 1.2), P(1000, 250, 1.3), P(1120, 380, 1.2), P(820, 470, 1.1), P(400, 480, 1.2), P(170, 450, 1.3)], H.rng(3), 3, 0.2);
      exWash(c, base, [222, 184, 118], { layers: 22, alpha: 0.05, amt: 0.15, depth: 3, seed: 4 });
      // wet-on-dry second glaze over part of it: a darker overlapped band with its own edge
      exWash(c, deform([P(300, 300, 1.2), P(640, 290, 1.1), P(900, 300, 1.3), P(860, 400, 1.2), P(520, 420, 1.0), P(280, 400, 1.3)], H.rng(31), 3, 0.22), [206, 150, 92], { layers: 15, alpha: 0.038, amt: 0.15, depth: 3, seed: 32 });
      drop(c, [176, 96, 62], [[520, 420, 120, 50, 0.32], [960, 330, 90, 60, 0.28], [250, 400, 80, 40, 0.24]]);
      drop(c, [120, 110, 170], [[720, 450, 110, 36, 0.2]], 20);
      exBloom(c, 460, 400, 40, 7, 0.6); exBloom(c, 900, 330, 30, 8, 0.5); exBloom(c, 680, 300, 26, 17, 0.55); exBloom(c, 230, 360, 22, 18, 0.5);
    }, 3, 8, [-60, 110, 0.7], null, true));
    lazy('bgLoop', () => mk(1200, 660, (c) => {
      const base = deform([P(170, 200, 1.3), P(420, 130, 1.1), P(820, 140, 1.3), P(1040, 260, 1.3), P(1000, 500, 1.2), P(640, 540, 1.1), P(280, 520, 1.3), P(150, 380, 1.2)], H.rng(5), 3, 0.2);
      exWash(c, base, [150, 188, 220], { layers: 22, alpha: 0.05, amt: 0.15, depth: 3, seed: 6 });
      exWash(c, deform([P(260, 180, 1.3), P(600, 150, 1.1), P(900, 190, 1.4), P(820, 300, 1.2), P(500, 280, 1.0), P(240, 300, 1.3)], H.rng(33), 3, 0.22), [110, 140, 200], { layers: 15, alpha: 0.038, amt: 0.15, depth: 3, seed: 34 });
      drop(c, [80, 84, 168], [[420, 240, 160, 70, 0.34], [700, 200, 120, 60, 0.26], [940, 380, 90, 70, 0.22]]);
      drop(c, [200, 120, 150], [[820, 440, 130, 60, 0.3], [300, 430, 80, 40, 0.18]]);
      exBloom(c, 760, 260, 44, 9, 0.7); exBloom(c, 300, 460, 34, 10, 0.6); exBloom(c, 560, 420, 30, 19, 0.55); exBloom(c, 980, 300, 26, 20, 0.5);
    }, 3, 8, [960, 0, 0.8], null, true));
    lazy('bgChart', () => mk(1100, 560, (c) => {
      const base = deform([P(130, 170, 1.3), P(520, 150, 1.1), P(960, 170, 1.3), P(980, 470, 1.3), P(580, 500, 1.1), P(140, 480, 1.3)], H.rng(11), 3, 0.2);
      exWash(c, base, [168, 202, 168], { layers: 22, alpha: 0.05, amt: 0.15, depth: 3, seed: 12 });
      exWash(c, deform([P(140, 380, 1.2), P(520, 330, 1.1), P(960, 300, 1.3), P(960, 460, 1.2), P(560, 490, 1.0), P(150, 470, 1.3)], H.rng(35), 3, 0.22), [120, 170, 150], { layers: 15, alpha: 0.038, amt: 0.15, depth: 3, seed: 36 });
      drop(c, [70, 130, 150], [[300, 420, 140, 60, 0.3], [760, 430, 120, 50, 0.26]]);
      drop(c, [200, 200, 90], [[620, 220, 150, 60, 0.26], [260, 210, 90, 40, 0.2]]);
      exBloom(c, 860, 140, 40, 13, 0.6); exBloom(c, 420, 300, 30, 21, 0.5); exBloom(c, 700, 380, 26, 22, 0.5);
    }, 3, 8, [2140, 60, 0.7], null, true));
    // --- a cerulean sky painted around the bulb, with a ragged white halo lifted out (negative painting, as in the still) ---
    lazy('sky', () => mk(640, 600, (c) => {
      const cx = 290, cy = 270;
      exWash(c, deform([P(90, 130, 1.4), P(230, 62, 1.2), P(420, 48, 1.4), P(560, 110, 1.3), P(588, 270, 1.4), P(548, 420, 1.2), P(430, 470, 1.0), P(300, 450, 1.0), P(170, 470, 1.3), P(70, 380, 1.4), P(60, 250, 1.3)], H.rng(82), 3, 0.18), [126, 178, 214], { layers: 22, alpha: 0.05, amt: 0.12, depth: 3, seed: 83 });
      exWash(c, deform([P(120, 110, 1.3), P(330, 60, 1.2), P(540, 100, 1.4), P(560, 200, 1.3), P(420, 170, 1.0), P(200, 210, 1.3), P(100, 220, 1.4)], H.rng(92), 3, 0.2), [70, 98, 172], { layers: 15, alpha: 0.03, amt: 0.14, depth: 3, seed: 93 });
      drop(c, [70, 82, 170], [[160, 160, 110, 70, 0.34], [470, 120, 100, 60, 0.3], [480, 420, 90, 60, 0.24], [130, 430, 80, 60, 0.26]]);
      drop(c, [200, 120, 150], [[520, 300, 70, 50, 0.24]]);
      exWash(c, deform(circlePts(cx + 4, cy + 6, 154, 160, 20, H.rng(84), 1.0), H.rng(85), 4, 0.16), '#000', { layers: 10, alpha: 0.35, amt: 0.12, depth: 2, seed: 86, comp: 'destination-out' });
      exWash(c, deform(circlePts(cx, cy + 4, 128, 136, 12, H.rng(87), 1.0), H.rng(88), 3, 0.22), '#000', { layers: 10, alpha: 0.5, amt: 0.1, depth: 2, seed: 89, comp: 'destination-out' });
      exBloom(c, 520, 160, 34, 90, 0.7); exBloom(c, 110, 330, 30, 91, 0.6);
    }, 2.6, 8, [870, 30, 0.8], null, true));
    // --- the model: a lightbulb with a sprout (the still's motif), painted once ---
    const BCX = 150, BCY = 150, BRAD = 112;
    const arcPts = (x, y, r1, r2, a0, a1, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([x + Math.cos(a) * r1, y + Math.sin(a) * r2]); } return o; };
    C.bulb = mk(300, 420, (c) => {
      const cx = BCX, cy = BCY, rad = BRAD, g = [];
      for (let i = 0; i <= 24; i++) { const a = Math.PI * 0.72 + Math.PI * 1.56 * i / 24; g.push(P(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, 0.5)); }
      g.push(P(cx + 55, cy + 136, 0.4), P(cx + 52, cy + 150, 0.3), P(cx - 52, cy + 150, 0.3), P(cx - 55, cy + 136, 0.4));
      // violet cast shadow on the table, granulating (light from the top-left)
      exWash(c, deform(circlePts(cx + 26, cy + 224, 84, 13, 14, H.rng(25), 1.0), H.rng(26), 3, 0.16), [130, 120, 176], { layers: 16, alpha: 0.03, amt: 0.16, seed: 27 });
      exWash(c, deform(g, H.rng(21), 2, 0.1), [250, 214, 90], { layers: 30, alpha: 0.05, amt: 0.08, seed: 22 });
      // second aureolin layer (wet on dry), pulled toward the shadow side -> a layered edge inside the glass
      const g2 = []; for (let i = 0; i <= 16; i++) { const a = -Math.PI * 0.55 + Math.PI * 1.25 * i / 16; g2.push(P(cx + 8 + Math.cos(a) * (rad - 10), cy + 8 + Math.sin(a) * (rad - 8), 0.7)); }
      exWash(c, deform(g2, H.rng(28), 2, 0.14), [240, 190, 70], { layers: 18, alpha: 0.04, amt: 0.12, seed: 29 });
      // wet-in-wet warm core and a touch of rose
      c.save(); c.globalCompositeOperation = 'source-atop';
      softEll(c, cx + 8, cy + 30, 66, 72, 0, [246, 150, 60], 0.5); softEll(c, cx + 30, cy + 76, 44, 36, 0, [225, 90, 90], 0.3); c.restore();
      // cool reflected light on the shadow side of the glass
      const refl = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI * 0.32 + Math.PI * 0.62 * i / 12; refl.push(P(cx + Math.cos(a) * (rad - 2), cy + Math.sin(a) * (rad - 2), 0.5)); }
      for (let i = 12; i >= 0; i--) { const a = -Math.PI * 0.22 + Math.PI * 0.5 * i / 12; refl.push(P(cx + Math.cos(a) * (rad - 22), cy + Math.sin(a) * (rad - 22), 0.9)); }
      c.save(); c.globalCompositeOperation = 'source-atop'; exWash(c, deform(refl, H.rng(30), 2, 0.2), [150, 180, 210], { layers: 14, alpha: 0.05, amt: 0.15, seed: 31 }); c.restore();
      const cres = []; for (let i = 0; i <= 10; i++) { const a = Math.PI * 1.08 + Math.PI * 0.32 * i / 10; cres.push(P(cx + Math.cos(a) * (rad - 16), cy + Math.sin(a) * (rad - 16), 0.6)); }
      for (let i = 10; i >= 0; i--) { const a = Math.PI * 1.12 + Math.PI * 0.26 * i / 10; cres.push(P(cx + 6 + Math.cos(a) * (rad - 34), cy + 6 + Math.sin(a) * (rad - 34), 0.6)); }
      exWash(c, deform(cres, H.rng(23), 2, 0.2), '#000', { layers: 12, alpha: 0.2, amt: 0.2, depth: 2, seed: 24, comp: 'destination-out' });
      exWash(c, deform(circlePts(cx + 74, cy - 62, 6, 9, 8, H.rng(37)), H.rng(38), 2, 0.2), '#000', { layers: 6, alpha: 0.7, amt: 0.1, depth: 2, seed: 39, comp: 'destination-out' });
      exBloom(c, cx - 30, cy + 80, 20, 40, 0.45);
      // sprout
      c.save(); c.strokeStyle = 'rgba(84,122,58,0.8)'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - 2, cy + 140); c.bezierCurveTo(cx - 8, cy + 90, cx + 8, cy + 40, cx + 2, cy - 14); c.stroke(); c.restore();
      const leaf = (x0, y0, ang, len, wid, seed) => { const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([u * len, -Math.sin(u * Math.PI) * wid]); } for (let i = 9; i >= 1; i--) { const u = i / 10; pts.push([u * len, Math.sin(u * Math.PI) * wid * 0.8]); }
        exWash(c, deform(pts.map(([u, v]) => P(x0 + u * Math.cos(ang) - v * Math.sin(ang), y0 + u * Math.sin(ang) + v * Math.cos(ang), 0.5)), H.rng(seed), 2, 0.1), [92, 148, 64], { layers: 18, alpha: 0.08, amt: 0.07, seed: seed + 1 }); };
      leaf(cx - 2, cy + 28, Math.PI * 1.06, 82, 24, 31); leaf(cx + 2, cy - 4, -Math.PI * 0.1, 78, 22, 33);
      // wet-in-wet yellow at the leaf tips, deep green at the stem
      c.save(); c.globalCompositeOperation = 'source-atop';
      softEll(c, cx - 58, cy + 22, 28, 11, 0.15, [190, 200, 60], 0.55); softEll(c, cx + 56, cy - 14, 28, 11, -0.3, [190, 200, 60], 0.55);
      softEll(c, cx - 16, cy + 30, 22, 11, 0.15, [40, 90, 70], 0.5); softEll(c, cx + 18, cy - 8, 22, 10, -0.3, [40, 90, 70], 0.5); c.restore();
      // screw base: Payne's grey, a warm burnt-sienna side, dark bands, a lifted highlight
      exWash(c, deform([P(cx - 54, cy + 150, 0.3), P(cx + 54, cy + 150, 0.3), P(cx + 50, cy + 196, 0.3), P(cx + 22, cy + 212, 0.4), P(cx - 22, cy + 212, 0.4), P(cx - 50, cy + 196, 0.3)], H.rng(41), 2, 0.08), [150, 152, 170], { layers: 18, alpha: 0.06, amt: 0.06, seed: 42 });
      c.save(); c.globalCompositeOperation = 'source-atop'; softEll(c, cx + 34, cy + 180, 26, 34, 0, [160, 96, 60], 0.45); c.restore();
      for (let k = 0; k < 3; k++) exWash(c, deform([P(cx - 54, cy + 160 + k * 13, 0.3), P(cx + 54, cy + 156 + k * 13, 0.3), P(cx + 54, cy + 163 + k * 13, 0.3), P(cx - 54, cy + 167 + k * 13, 0.3)], H.rng(43 + k), 2, 0.1), [70, 72, 100], { layers: 8, alpha: 0.1, amt: 0.08, seed: 46 + k });
      exWash(c, deform([P(cx - 36, cy + 154, 0.2), P(cx - 27, cy + 154, 0.2), P(cx - 28, cy + 204, 0.2), P(cx - 36, cy + 200, 0.2)], H.rng(49), 2, 0.1), '#000', { layers: 6, alpha: 0.55, amt: 0.1, depth: 2, seed: 50, comp: 'destination-out' });
    }, 2.8, 5, [1010, 150, 0.45], (c) => {
      // faint pencil underdrawing left showing around the glass and base (drawn after the wash, so it isn't pooled)
      pencil(c, arcPts(BCX, BCY, BRAD + 3, BRAD + 3, Math.PI * 0.7, Math.PI * 2.3), 1, 0.3, 1.1);
      pencil(c, arcPts(BCX + 1.5, BCY - 1, BRAD + 1, BRAD + 2, Math.PI * 0.9, Math.PI * 1.9), 1, 0.18, 0.9);
      pencil(c, [[BCX - 82, BCY + 82], [BCX - 55, BCY + 136], [BCX - 53, BCY + 154]], 1, 0.28); pencil(c, [[BCX + 82, BCY + 82], [BCX + 55, BCY + 136], [BCX + 53, BCY + 154]], 1, 0.28);
      pencil(c, [[BCX, BCY - BRAD - 26], [BCX, BCY + 226]], 1, 0.1, 0.8); pencil(c, [[BCX - BRAD - 22, BCY], [BCX + BRAD + 22, BCY]], 1, 0.09, 0.8);
      for (let k = 0; k < 3; k++) pencil(c, [[BCX - 58, BCY + 158 + k * 13], [BCX + 58, BCY + 154 + k * 13]], 1, 0.18, 1);
      pencil(c, arcPts(BCX, BCY + 210, 24, 8, 0, Math.PI), 1, 0.22);
    });
    // --- cat & dog vignettes (painted big once, drawn small on the cards) ---
    const animal = (dog) => mk(220, 220, (c) => {
      const col = dog ? [150, 100, 60] : [236, 150, 60], cx = 110, cy = 120;
      if (dog) {
        exWash(c, blob(cx, cy, 62, 56, 51, 12, 0.6), col, { layers: 22, alpha: 0.07, amt: 0.1, seed: 52 });
        exWash(c, blob(cx - 62, cy - 4, 20, 46, 53, 8, 0.6), [100, 66, 40], { layers: 16, alpha: 0.08, amt: 0.1, seed: 54 });
        exWash(c, blob(cx + 62, cy - 4, 20, 46, 55, 8, 0.6), [100, 66, 40], { layers: 16, alpha: 0.08, amt: 0.1, seed: 56 });
        exWash(c, blob(cx, cy + 26, 30, 22, 57, 8, 0.5), [236, 210, 170], { layers: 14, alpha: 0.08, amt: 0.1, seed: 58 });
      } else {
        exWash(c, [P(cx - 58, cy - 20, 0.4), P(cx - 50, cy - 84, 0.3), P(cx - 18, cy - 46, 0.4), P(cx + 18, cy - 46, 0.4), P(cx + 50, cy - 84, 0.3), P(cx + 58, cy - 20, 0.4), P(cx + 56, cy + 30, 0.5), P(cx, cy + 62, 0.5), P(cx - 56, cy + 30, 0.5)], col, { layers: 22, alpha: 0.07, amt: 0.08, seed: 61 });
        c.save(); c.filter = 'blur(8px)'; c.globalAlpha = 0.35; c.fillStyle = 'rgb(200,90,50)'; c.beginPath(); c.ellipse(cx + 26, cy - 10, 26, 30, 0, 0, 7); c.fill(); c.restore();
      }
      c.save(); c.fillStyle = 'rgba(40,40,70,0.85)'; c.beginPath(); c.ellipse(cx - 22, cy - 2, 6, dog ? 7 : 9, 0, 0, 7); c.ellipse(cx + 22, cy - 2, 6, dog ? 7 : 9, 0, 0, 7); c.fill();
      c.beginPath(); c.moveTo(cx - 7, cy + 20); c.lineTo(cx + 7, cy + 20); c.lineTo(cx, cy + 28); c.fill();
      c.strokeStyle = 'rgba(40,40,70,0.5)'; c.lineWidth = 1.5;
      if (!dog) for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(cx + s * 16, cy + 26 + k * 4); c.lineTo(cx + s * 52, cy + 18 + k * 9); c.stroke(); }
      c.restore();
    }, 2.6, 4);
    C.cat = animal(false); C.dog = animal(true);
    // speech bubble
    C.bubble = mk(300, 170, (c) => {
      exWash(c, deform([P(30, 70, 0.6), P(80, 18, 0.5), P(220, 16, 0.5), P(280, 70, 0.6), P(230, 128, 0.5), P(120, 132, 0.5), P(70, 166, 0.3), P(80, 124, 0.4)], H.rng(71), 2, 0.12), [236, 226, 200], { layers: 20, alpha: 0.07, amt: 0.08, seed: 72 });
    }, 3, 4);
    // a small bank of hand-lettered text, cached per string
    C.text = new Map();
    EXC = C;
    return C;
  }

  // brush-lettered text with pooled edges; cached per (string,size,colour)
  function wcText(c, str, x, y, size, col, { align = 'left', reveal = 1, font = '700', alpha = 1 } = {}) {
    if (reveal <= 0 || !str) return;
    const C = cachedExplainer(), key = str + '|' + size + '|' + col + '|' + font;
    let cv = C.text.get(key);
    if (!cv) {
      const m = H.layer(4, 4).getContext('2d'); m.font = `${font} ${size}px "Caveat"`;
      const w = Math.ceil(m.measureText(str).width) + 30, h = Math.ceil(size * 1.5);
      cv = H.layer(w, h); const tc = cv.getContext('2d');
      tc.font = `${font} ${size}px "Caveat"`; tc.fillStyle = col; tc.textBaseline = 'alphabetic';
      tc.globalAlpha = 0.85; tc.fillText(str, 15, size * 1.08); tc.globalAlpha = 0.25; tc.fillText(str, 16.5, size * 1.08 + 1);
      rimPool(cv, 2.4, 2.5);
      cv.base = size * 1.08;
      if (C.text.size > 300) C.text.clear();
      C.text.set(key, cv);
    }
    const w = cv.width - 30, ox = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
    c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = alpha;
    const rw = Math.max(1, cv.width * cl(reveal));
    c.drawImage(cv, 0, 0, rw, cv.height, x + ox - 15, y - cv.base, rw, cv.height);
    c.restore();
  }
  // a loaded round brush pulled along a path: tapered ribbon + darker pooled edge, drawn on progressively
  function wcStroke(c, pts, w, col, prog = 1, { head = true, alpha = 0.75, taper = true } = {}) {
    if (prog <= 0) return;
    const L = [], R = [], n = pts.length;
    const N = Math.max(2, Math.ceil(n * cl(prog)));
    for (let i = 0; i < N; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const u = i / (n - 1), ww = w * (taper ? 0.35 + 0.65 * Math.sin(Math.min(1, u * 1.15 + 0.1) * Math.PI * 0.95) : 0.8 + 0.2 * Math.sin(i * 0.7)) * 0.5;
      L.push([pts[i][0] - dy / l * ww, pts[i][1] + dx / l * ww]); R.push([pts[i][0] + dy / l * ww, pts[i][1] - dx / l * ww]);
    }
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = H.rgba(col, alpha); c.strokeStyle = H.rgba(col, 0.45); c.lineWidth = 1.2; c.lineJoin = 'round';
    c.beginPath(); L.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]); c.closePath(); c.fill(); c.stroke();
    if (head && prog >= 1) {
      const a = pts[n - 3] || pts[0], b = pts[n - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      c.lineCap = 'round'; c.strokeStyle = H.rgba(col, alpha); c.lineWidth = w * 0.55;
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0] - Math.cos(ang + s * 0.5) * w * 2.6, b[1] - Math.sin(ang + s * 0.5) * w * 2.6); c.stroke(); }
    }
    c.restore();
  }
  const bez = (p0, p1, p2, p3, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, a = 1 - u; o.push([a * a * a * p0[0] + 3 * a * a * u * p1[0] + 3 * a * u * u * p2[0] + u * u * u * p3[0], a * a * a * p0[1] + 3 * a * a * u * p1[1] + 3 * a * u * u * p2[1] + u * u * u * p3[1]]); } return o; };
  // revealed wash: the cached painting appears as if flooding outward from its centre
  function bloomIn(c, cv, x, y, p, w = cv.width, h = cv.height) {
    if (p <= 0) return;
    c.save(); c.globalCompositeOperation = 'multiply';
    if (p >= 1) { c.drawImage(cv, x, y, w, h); c.restore(); return; }
    const T = H.layer(Math.ceil(w), Math.ceil(h)), tc = T.getContext('2d');
    tc.drawImage(cv, 0, 0, w, h);
    tc.globalCompositeOperation = 'destination-in';
    const r = Math.hypot(w, h) * 0.55 * H.ease.out(p), g = tc.createRadialGradient(w / 2, h / 2, r * 0.6, w / 2, h / 2, r + 1);
    g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)'); tc.fillStyle = g; tc.fillRect(0, 0, w, h);
    c.globalAlpha = Math.min(1, p * 1.5); c.drawImage(T, x, y); c.restore();
  }
  function pencil(c, pts, prog = 1, a = 0.4, w = 1.1) {
    if (prog <= 0) return;
    const n = Math.max(2, Math.ceil(pts.length * cl(prog)));
    c.save(); c.strokeStyle = `rgba(70,68,72,${a})`; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); for (let i = 0; i < n; i++) i ? c.lineTo(pts[i][0], pts[i][1]) : c.moveTo(pts[i][0], pts[i][1]); c.stroke(); c.restore();
  }
  const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const INDIGO = [44, 52, 112], ALIZ = [190, 40, 60], SAP = [70, 130, 60], CERU = [60, 120, 190], SIENNA = [170, 90, 50];

  function explainWatercolor(ctx, W, H_, t) {
    const C = cachedExplainer();
    // camera: data stop -> loop stop -> chart stop (a pan along the sheet is the scene transition)
    const camX = 760 * ez((t - 6.0) / 0.9) + 1320 * ez((t - 10.5) / 0.9);
    const cam = Math.round(camX);
    ctx.drawImage(C.paper, cam, 0, W, H_, 0, 0, W, H_);
    ctx.save(); ctx.translate(-cam, 0);

    // ---------- backgrounds ----------
    const vis = (x, w, p) => p > 0 && x + w > cam && x < cam + W;   // skip (and don't build) washes that are off screen
    if (vis(-60, 1300, win(t, 1.4, 2.8))) bloomIn(ctx, C.bgData, -60, 110, win(t, 1.4, 2.8));
    if (vis(960, 1200, win(t, 5.9, 7.0))) bloomIn(ctx, C.bgLoop, 960, 0, win(t, 5.9, 7.0));
    if (vis(2140, 1100, win(t, 10.4, 11.6))) bloomIn(ctx, C.bgChart, 2140, 60, win(t, 10.4, 11.6));

    // ---------- the model ----------
    const BX = 1010, BY = 150;                 // bulb canvas top-left in world space
    if (vis(870, 640, win(t, 0.9, 2.3))) bloomIn(ctx, C.sky, 870, 30, win(t, 0.9, 2.3));
    bloomIn(ctx, C.bulb, BX, BY, win(t, 0.8, 2.2));
    const bcx = BX + 150, bcy = BY + 150;
    if (t > 2.6) {
      pencil(ctx, [[bcx - 40, BY + 380], [bcx - 120, BY + 420]], win(t, 2.6, 3.0), 0.45);
      wcText(ctx, 'the model', bcx - 245, BY + 440, 38, 'rgb(80,78,84)', { reveal: win(t, 2.8, 3.3), font: '400' });
    }
    // three little dials (its "weights") on the screw base; they turn when it adjusts
    const turn = ez((t - 8.7) / 0.7);
    for (let k = 0; k < 3; k++) {
      const x = bcx - 34 + k * 34, y = BY + 345, a = -2.2 + k * 0.9 + turn * (k === 1 ? -1.6 : 1.3);
      if (t < 2.9) break;
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(236,226,200,0.9)'; ctx.strokeStyle = H.rgba(INDIGO, 0.7); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10); ctx.stroke();
      ctx.restore();
    }
    if (t > 8.6 && t < 9.6) {   // a warm bloom of light as the knobs move
      const k = Math.sin(win(t, 8.6, 9.6) * Math.PI);
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.filter = 'blur(14px)'; ctx.fillStyle = `rgba(246,190,80,${0.35 * k})`;
      ctx.beginPath(); ctx.arc(bcx, bcy, 150, 0, 7); ctx.fill(); ctx.restore();
    }

    // ---------- beat 2: labelled examples flow into the model ----------
    const flow = bez([-80, 470], [260, 600], [620, 560], [bcx - 70, bcy + 70], 60);
    wcStroke(ctx, flow.slice(0, 57), 10, SIENNA, win(t, 2.4, 3.0), { alpha: 0.45 });
    const at = (u) => { const f = u * (flow.length - 1), i = Math.min(flow.length - 2, Math.floor(f)), r = f - i; return [lerp(flow[i][0], flow[i + 1][0], r), lerp(flow[i][1], flow[i + 1][1], r)]; };
    for (let i = 0; i < 26; i++) {
      const s = 2.7 + i * 0.13, u = (t - s) / 1.5;
      if (u <= 0 || u >= 1) continue;
      const [x, y] = at(u), dog = H.rng(i * 17 + 3)() < 0.5, sc = u > 0.8 ? 1 - (u - 0.8) / 0.2 * 0.85 : 1;
      const sz = 84 * sc;
      ctx.save(); ctx.translate(x, y - 50 * sc); ctx.rotate(Math.sin(i * 2.1) * 0.12);
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(250,247,240,1)';
      ctx.drawImage(dog ? C.dog : C.cat, -sz / 2, -sz / 2, sz, sz);
      ctx.strokeStyle = 'rgba(70,68,72,0.45)'; ctx.lineWidth = 1.2; ctx.strokeRect(-sz / 2, -sz / 2, sz, sz);
      if (sc > 0.5) { ctx.globalCompositeOperation = 'source-over'; pencil(ctx, [[sz / 2 - 6, sz / 2 - 6], [sz / 2 + 8, sz / 2 + 8]], 1, 0.45); ctx.restore(); ctx.save(); ctx.translate(x, y - 50 * sc); ctx.rotate(Math.sin(i * 2.1) * 0.12);
        wcText(ctx, dog ? 'dog' : 'cat', sz / 2 + 6, sz / 2 + 34, 30, dog ? 'rgb(120,70,40)' : 'rgb(200,100,40)'); }
      ctx.restore();
    }
    // a counter, written and re-written as the examples pour in
    if (t > 2.9) {
      const k = H.ease.in(win(t, 3.0, 5.6)), n = Math.round(1e6 * k / 1000) * 1000;
      const str = fmt(t > 5.6 ? 1e6 : n) + ' examples';
      wcText(ctx, str, 120, 690, 66, `rgb(${INDIGO})`, { reveal: win(t, 2.9, 3.2) });
      if (t > 5.6) wcStroke(ctx, bez([120, 704], [320, 716], [520, 704], [700, 708], 30), 7, SIENNA, win(t, 5.6, 5.95), { head: false, alpha: 0.6 });
    }

    // ---------- beat 3: guess -> check -> adjust ----------
    const PX = 1710, PY = 300;                  // the new picture
    if (t > 6.4) {
      bloomIn(ctx, C.cat, PX, PY, win(t, 6.4, 7.0), 200, 200);
      pencil(ctx, [[PX, PY], [PX + 200, PY], [PX + 200, PY + 200], [PX, PY + 200], [PX, PY]], win(t, 6.4, 6.9), 0.5);
      wcText(ctx, 'new picture', PX + 100, PY + 240, 34, 'rgb(80,78,84)', { align: 'center', reveal: win(t, 6.7, 7.1), font: '400' });
    }
    const BBX = 1350, BBY = 70;                 // speech bubble
    // Guess
    wcStroke(ctx, bez([bcx + 70, bcy - 80], [bcx + 120, bcy - 160], [BBX - 10, BBY + 170], [BBX + 30, BBY + 120], 30), 8, INDIGO, win(t, 6.8, 7.2));
    wcText(ctx, 'Guess', bcx + 30, bcy - 150, 40, `rgb(${INDIGO})`, { reveal: win(t, 6.9, 7.3) });
    bloomIn(ctx, C.bubble, BBX, BBY, win(t, 7.0, 7.4));
    const second = t > 9.4;
    if (!second) wcText(ctx, 'dog?', BBX + 150, BBY + 92, 64, 'rgb(120,70,40)', { align: 'center', reveal: win(t, 7.1, 7.5) });
    // Check: the true label is compared -> red cross + an emphatic circle
    wcStroke(ctx, bez([PX + 40, PY - 10], [PX - 20, PY - 90], BBX + 330 > PX ? [BBX + 330, BBY + 30] : [BBX + 330, BBY + 30], [BBX + 290, BBY + 70], 30), 7, INDIGO, win(t, 7.5, 7.9));
    wcText(ctx, 'Check', PX + 30, PY - 70, 40, `rgb(${INDIGO})`, { reveal: win(t, 7.6, 8.0) });
    if (t > 7.9 && !second) {
      wcStroke(ctx, [[BBX + 105, BBY + 45], [BBX + 195, BBY + 115]], 10, ALIZ, win(t, 7.9, 8.05), { head: false, alpha: 0.85 });
      wcStroke(ctx, [[BBX + 195, BBY + 45], [BBX + 105, BBY + 115]], 10, ALIZ, win(t, 8.05, 8.2), { head: false, alpha: 0.85 });
      const ring = []; for (let i = 0; i <= 50; i++) { const a = -0.6 + i / 50 * Math.PI * 2.15; ring.push([BBX + 150 + Math.cos(a) * 118, BBY + 78 + Math.sin(a) * 66]); }
      wcStroke(ctx, ring, 6, ALIZ, win(t, 8.0, 8.45), { head: false, alpha: 0.7 });
      wcText(ctx, "it's a cat!", PX + 100, PY + 285, 40, `rgb(${ALIZ})`, { align: 'center', reveal: win(t, 8.0, 8.4) });
    }
    // Adjust: the error travels back to the model
    wcStroke(ctx, bez([BBX + 110, BBY + 150], [BBX + 60, BBY + 330], [bcx + 200, bcy + 220], [bcx + 80, bcy + 190], 36), 9, ALIZ, win(t, 8.25, 8.8), { alpha: 0.7 });
    wcText(ctx, 'Adjust', BBX + 20, BBY + 330, 40, `rgb(${ALIZ})`, { reveal: win(t, 8.5, 8.9) });
    if (second) {
      wcText(ctx, 'cat', BBX + 135, BBY + 92, 64, 'rgb(200,100,40)', { align: 'center', reveal: win(t, 9.4, 9.7) });
      wcStroke(ctx, [[BBX + 190, BBY + 72], [BBX + 205, BBY + 92], [BBX + 240, BBY + 40]], 9, SAP, win(t, 9.7, 9.95), { head: false, alpha: 0.85 });
    }

    // ---------- beat 4: progress chart ----------
    const CX0 = 2260, CY0 = 560, CW = 760, CH = 360;
    if (t > 10.6) {
      pencil(ctx, [[CX0, CY0 - CH - 20], [CX0, CY0], [CX0 + CW + 20, CY0]], win(t, 10.7, 11.2), 0.5, 1.4);
      wcText(ctx, 'training rounds', CX0 + CW / 2, CY0 + 50, 34, 'rgb(80,78,84)', { align: 'center', reveal: win(t, 11.0, 11.4), font: '400' });
      const N = 24, pts = [];
      for (let i = 0; i <= N; i++) { const acc = 61 + 36 * (1 - Math.exp(-i / 5.5)) / (1 - Math.exp(-N / 5.5)) + (i > 0 && i < N ? Math.sin(i * 2.7) * 1.6 : 0); pts.push([CX0 + i / N * CW, CY0 - (acc - 50) / 50 * CH, acc]); }
      const pr = win(t, 11.2, 12.7), line = [];
      for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 4; k++) { const u = k / 4; line.push([lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]); }
      line.push(pts[N]);
      wcStroke(ctx, line, 9, CERU, pr, { head: false, alpha: 0.8, taper: false });
      const cur = Math.min(N, Math.floor(pr * N));
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = H.rgba(INDIGO, 0.75);
      for (let i = 0; i <= cur; i += 3) { ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], 6, 0, 7); ctx.fill(); }
      ctx.restore();
      const acc = Math.round(t < 11.2 ? 61 : t > 12.7 ? 97 : lerp(61, 97, H.ease.out(pr)));
      wcText(ctx, 'Accuracy', CX0 + 20, CY0 - CH - 40, 50, `rgb(${INDIGO})`, { reveal: win(t, 10.9, 11.3) });
      wcText(ctx, acc + '%', CX0 + 230, CY0 - CH - 40, 70, acc >= 97 ? `rgb(${ALIZ})` : `rgb(${INDIGO})`, { reveal: win(t, 11.1, 11.3) });
      if (t > 12.7) {
        const ring = []; for (let i = 0; i <= 50; i++) { const a = -0.4 + i / 50 * Math.PI * 2.15; ring.push([CX0 + 290 + Math.cos(a) * 100, CY0 - CH - 62 + Math.sin(a) * 52]); }
        wcStroke(ctx, ring, 6, ALIZ, win(t, 12.7, 13.1), { head: false, alpha: 0.7 });
        const ring2 = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2.1; ring2.push([pts[N][0] + Math.cos(a) * 24, pts[N][1] + Math.sin(a) * 24]); }
        wcStroke(ctx, ring2, 5, ALIZ, win(t, 12.9, 13.2), { head: false, alpha: 0.7 });
      }
      wcText(ctx, '61%', CX0 - 70, pts[0][1] + 12, 30, 'rgb(80,78,84)', { reveal: win(t, 11.2, 11.5), font: '400' });
    }
    ctx.restore();

    // ---------- beat 5: takeaway (screen space) ----------
    if (t > 13.2) {
      wcText(ctx, 'More examples → better guesses', 640, 690, 62, `rgb(${INDIGO})`, { align: 'center', reveal: ez((t - 13.2) / 0.7) });
    }
    // ---------- beat 1: hook, then it becomes the corner header ----------
    {
      const k = ez((t - 1.5) / 0.8), s = lerp(1, 0.42, k);
      const m = H.layer(4, 4).getContext('2d'); m.font = '700 110px "Caveat"'; const tw = m.measureText('How does AI learn?').width;
      const x = lerp(640 - tw / 2, 40, k), y = lerp(370, 66, k);
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      wcText(ctx, 'How does AI learn?', 0, 0, 110, `rgb(${INDIGO})`, { reveal: win(t, 0.1, 1.1) });
      ctx.restore();
    }
  }

  registerStyle({
    id: 'watercolor',
    name: 'Watercolor Wash',
    category: 'Painterly',
    description: 'Transparent pigment glazed in dozens of ragged low-opacity layers on cold-press paper: dark pooled edges, wet-in-wet bleeds, cauliflower blooms, granulation and untouched white paper for the lights, over a faint pencil sketch.',
    motion: 'Each wash floods in from its pencil outline, edges darken as the water dries and blooms creep outward; the title is brushed in stroke by stroke.',
    fonts: ['700 132px "Caveat"', '400 30px "Caveat"', '700 40px "Caveat"'],
    duration: 6,
    frameT: 5.9,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'One long sketchbook sheet the camera pans along; arrows are loaded round-brush strokes with pooled edges, labels and the counter are brush-lettered and re-written as they change, and red alizarin circles do the emphasis.',
    explainer(ctx, W, H_, t) { explainWatercolor(ctx, W, H_, t); },
    explainerSound(k) {
      // all times copied from explainWatercolor() above (its win(t, a, b) windows)
      const D = 15;
      // first time f(t) >= v (1 ms scan)
      const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
      // a loaded round brush on wet paper: soft wet touch-down, then the hair dragging through water
      const brush = (a, b, g = 1, pan = 0, minor = true) => {
        k.noise(a, { dur: 0.05, color: 'pink', filter: 'lowpass', f: 700, gain: 0.16 * g, a: 0.008, pan, minor });
        k.play('stroke', a, { material: 'brush', dur: b - a, gain: 1.5 * g, pan, minor });
      };
      // brush lettering: one wet stroke per word, timed by character position like the reveal
      const letter = (s, a, b, g = 0.7, pan = 0) => { const re = /\S+/g; let m;
        while ((m = re.exec(s))) brush(a + (b - a) * m.index / s.length, a + (b - a) * (m.index + m[0].length) / s.length, g, pan); };
      // a wash flooding outward from its pencil line: a slow, low wet swell
      const wash = (a, b, g = 1, pan = 0, minor = true) => {
        const d = b - a;
        k.noise(a, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 260], [d * 0.45, 820], [d, 420]], q: 0.7, gain: 0.09 * g, a: d * 0.4, pan, minor, verb: 0.1 });
        k.noise(a + 0.03, { dur: d * 0.7, color: 'brown', filter: 'lowpass', f: 380, gain: 0.08 * g, a: d * 0.3, pan, minor });
      };
      // a single drop of water landing in the wash (low, so it never chirps)
      const drop = (t, g = 1, pan = 0) => k.tone(t, { f: [[0, 330], [0.05, 560]], dur: 0.08, gain: 0.07 * g, a: 0.003, pan, minor: true, verb: 0.2 });
      // brush swirled in the rinse jar and tapped on the rim: the sheet's own scene change
      const rinse = (t, d, pan = 0) => {
        for (let i = 0; i < 4; i++) { const ti = t + i * d / 5; k.noise(ti, { dur: d / 2.5, color: 'pink', filter: 'bandpass', f: [[0, 420], [d / 5, 1100], [d / 2.5, 520]], q: 1.6, gain: 0.13, a: d / 8, pan: pan + (i % 2 ? 0.2 : -0.2) }); }
        drop(t + d * 0.35, 1.1, pan); drop(t + d * 0.62, 0.8, pan);
        k.play('tock', t + d, { f: 900, gain: 0.45, pan });
      };
      // dabbing the counter: a soft brush tip on paper, no click
      const dab = (t, g = 1, pan = 0) => { k.withMinor(() => { k.noise(t, { dur: 0.035, color: 'pink', filter: 'bandpass', f: 1250, q: 1.1, gain: 0.26 * g, a: 0.004, pan }); k.tone(t, { f: 190, dur: 0.05, gain: 0.07 * g, pan }); }); };
      // ticks when the shown value changes, at most 12/s
      const counter = (val, a, b, g, pan) => { let last = val(a), lastT = -1;
        for (let t = a; t <= b; t += 1 / 240) { const v = val(t); if (v !== last && t - lastT >= 1 / 12) { dab(t, g, pan); lastT = t; } last = v; } };

      // ---- beds: a quiet room and a soft painterly pad (F: Fmaj7, Dm7, Bbmaj7, Fadd9; one bar = 3.75 s)
      k.bed('room', 0, D, { gain: 0.45 });
      k.music('pad', 0, D, { bpm: 64, gain: 0.35, chords: [['F3', 'A3', 'C4', 'E4'], ['D3', 'F3', 'A3', 'C4'], ['Bb2', 'D3', 'F3', 'A3'], ['F3', 'C4', 'G4', 'A4']] });

      // ---- 1 HOOK: title brush-lettered 0.1-1.1, then it slides into the corner 1.5-2.3
      letter('How does AI learn?', 0.1, 1.1, 0.95);
      k.noise(1.5, { dur: 0.8, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.8, 700]], q: 0.7, gain: 0.07, a: 0.3, minor: true }); // soft slide
      wash(0.8, 2.2, 1.0, 0.6, false); // the bulb blooms in
      wash(1.4, 2.8, 0.8, -0.3);       // ochre ground floods under the data

      // ---- 2 DATA
      brush(2.4, 3.0, 1.1, -0.4, false);                  // sienna flow arrow
      k.play('stroke', 2.6, { material: 'pencil', dur: 0.4, gain: 0.4, pan: 0.4, minor: true }); // pencil leader
      brush(3.02, 3.3, 0.8, -0.5);                         // counter lettered in under the stream (reveal 2.9-3.2, after the arrow lifts)
      // cards float down the stream: a gentle trickle under them, a drop now and then as one sinks into the bulb
      k.noise(2.7, { dur: 3.6, color: 'pink', filter: 'bandpass', f: 700, q: 0.6, gain: 0.05, a: 0.6, hold: 2.4, pan: -0.2, minor: true });
      for (let i = 0; i < 26; i += 4) drop(2.7 + i * 0.13 + 1.5, 0.8, 0.5);
      // counter re-written: n = 1e6 * ease.in(win(3.0, 5.6)), rounded to thousands
      counter((t) => Math.round(1e6 * H.ease.in(win(t, 3.0, 5.6)) / 1000), 3.0, 5.58, 1, -0.5);
      k.play('tock', 5.6, { f: 520, gain: 0.55, pan: -0.5 });   // 1,000,000 lands
      brush(5.6, 5.95, 1.1, -0.4, false);                       // sienna underline

      // ---- pan to the loop (camera 6.0-6.9): rinse the brush, new blue wash floods in
      rinse(5.95, 0.5, 0.2);
      wash(5.9, 7.0, 1.0, 0.3, false);

      // ---- 3 GUESS -> CHECK -> ADJUST
      k.play('stroke', 6.4, { material: 'pencil', dur: 0.5, gain: 0.7, pan: 0.6, minor: true });
      brush(6.8, 7.2, 1.0, 0.0, false);                          // Guess arrow
      letter('dog?', 7.1, 7.5, 0.8, 0.2);
      brush(7.5, 7.9, 1.0, 0.5, false);                          // Check arrow
      // the wrong guess: two hard alizarin slashes and a low, soft "nope"
      brush(7.9, 8.05, 1.9, 0.2, false); brush(8.05, 8.2, 1.9, 0.2, false);
      k.tone(7.9, { f: 'A3', type: 'triangle', dur: 0.22, gain: 0.2, a: 0.01, hold: 0.08, verb: 0.2, pan: 0.2 });
      k.tone(8.08, { f: 'F3', type: 'triangle', dur: 0.4, gain: 0.2, a: 0.01, hold: 0.12, verb: 0.2, pan: 0.2 });
      k.play('thud', 7.9, { f: 120, gain: 0.35, pan: 0.2 });
      brush(8.25, 8.8, 1.5, 0.0, false);                         // Adjust arrow runs back to the model
      // three dials on the screw base turn (ez over 8.7-9.4): soft wooden detents
      for (let s = 1; s <= 3; s++) k.play('tock', when((t) => ez((t - 8.7) / 0.7) * 4, s, 8.7, 9.4), { f: 640 + s * 20, gain: 0.45, pan: -0.2, minor: true });
      letter('cat', 9.4, 9.7, 0.8, 0.2);
      brush(9.7, 9.95, 1.2, 0.2, false);                         // sap-green check mark
      k.play('success', 9.95, { f: 'A5', gain: 0.48, pan: 0.2 });

      // ---- pan to the chart (camera 10.5-11.4)
      rinse(10.45, 0.5, -0.2);
      wash(10.4, 11.6, 1.0, 0.2, false);

      // ---- 4 PROGRESS
      k.play('stroke', 10.7, { material: 'pencil', dur: 0.5, gain: 0.5, pan: -0.4, minor: true }); // pencil axes
      letter('Accuracy', 10.9, 11.3, 0.5, -0.4);
      brush(11.2, 12.7, 0.55, 0.1);                              // cerulean line pulled along
      // % counter: lerp(61, 97, ease.out(pr)), pr = win(11.2, 12.7)
      const acc = (t) => Math.round(61 + 36 * H.ease.out(win(t, 11.2, 12.7)));
      const t97 = when(acc, 97, 11.2, 12.7);
      counter(acc, 11.2, t97 - 0.05, 1, -0.3);
      // 97% lands and turns alizarin red: the biggest hit, a deep wet bloom with a warm bell chord
      k.play('thud', t97, { f: 95, gain: 0.8, pan: -0.3 });
      k.play('impact', t97, { gain: 0.55, pan: -0.3 });
      k.play('ding', t97, { f: 'C5', gain: 0.5 });
      ['F4', 'A5'].forEach((f, i) => k.tone(t97 + 0.03 + i * 0.03, { f, dur: 1.3, gain: 0.08, verb: 0.3, pan: (i - 0.5) * 0.5 }));
      wash(t97, t97 + 0.9, 0.9, -0.3);
      brush(12.7, 13.1, 1.4, -0.3, false);                       // red ring around 97%
      brush(12.9, 13.2, 0.9, 0.6);                               // small ring on the last point

      // ---- 5 TAKEAWAY (reveal 13.2-13.9), then a resolving chord
      letter('More examples → better guesses', 13.2, 13.9, 1.1);
      k.play('ding', 13.95, { f: 'F4', gain: 0.42 });   // resolving chord, rolled upward
      ['A4', 'C5', 'F5'].forEach((f, i) => k.tone(14.01 + i * 0.06, { f, dur: 1.2, gain: 0.07 - i * 0.01, verb: 0.3, pan: (i - 1) * 0.3 }));
    },
    draw(ctx, W, H_, t) {
      const R = H.rng(1207);
      // timeline: each wash has its own local progress; `cur` is the wash being painted right now
      const ph = (a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
      let cur = 1;
      const mottle = makeMottle(W, H_, 77);
      const L = H.layer(W, H_), lx = L.getContext('2d');
      const B = H.layer(W, H_), bx = B.getContext('2d');

      // ---------- 1. paper ----------
      ctx.fillStyle = `rgb(${PAPER})`; ctx.fillRect(0, 0, W, H_);

      // ---------- 2. pencil underdrawing ----------
      const cx = 420, cy = 285, rad = 168;
      const pr = H.rng(31);
      let pencilK = 0;
      function pencilLine(pts, a = 0.28, w = 1.1, passes = 2) {
        const reveal = H.clamp((t - 0.05 - pencilK++ * 0.055) / 0.45);
        for (let p = 0; p < passes; p++) {
          ctx.save(); ctx.strokeStyle = `rgba(70,68,72,${a * (0.6 + pr() * 0.5)})`; ctx.lineWidth = w * (0.7 + pr() * 0.6);
          ctx.lineCap = 'round'; ctx.beginPath();
          const ox = pr.gauss() * 1.5, oy = pr.gauss() * 1.5;
          const lim = reveal * (pts.length - 1);
          pts.forEach((q, i) => {
            let x = q[0] + ox + pr.gauss() * 0.5, y = q[1] + oy + pr.gauss() * 0.5;
            if (i > lim + 1) return;
            if (i > lim) { const f = lim - (i - 1), qp = pts[i - 1]; x = qp[0] + (x - qp[0]) * f; y = qp[1] + (y - qp[1]) * f; }
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          });
          if (reveal > 0) ctx.stroke(); ctx.restore();
        }
      }
      const arcPts = (x, y, r1, r2, a0, a1, n = 60) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([x + Math.cos(a) * r1, y + Math.sin(a) * r2]); } return o; };
      // bulb outline + construction lines
      pencilLine(arcPts(cx, cy, rad + 2, rad + 2, Math.PI * 0.72, Math.PI * 2.28), 0.3, 1.1, 3);
      pencilLine([[cx - 125, cy + 112], [cx - 82, cy + 205], [cx - 78, cy + 228]], 0.3);
      pencilLine([[cx + 125, cy + 112], [cx + 82, cy + 205], [cx + 78, cy + 228]], 0.3);
      pencilLine([[cx, cy - rad - 40], [cx, cy + 330]], 0.12, 0.8, 1);
      pencilLine([[cx - rad - 30, cy], [cx + rad + 30, cy]], 0.1, 0.8, 1);
      for (let k = 0; k < 4; k++) pencilLine([[cx - 80, cy + 232 + k * 17], [cx + 80, cy + 226 + k * 17]], 0.24, 1, 1);
      pencilLine(arcPts(cx, cy + 315, 36, 12, 0, Math.PI), 0.22);
      // sprout sketch
      pencilLine([[cx - 4, cy + 210], [cx - 10, cy + 120], [cx + 6, cy + 40], [cx + 2, cy - 30]], 0.25, 1, 2);
      pencilLine(arcPts(cx - 62, cy + 10, 62, 28, Math.PI * 0.95, Math.PI * 2.05), 0.2);
      pencilLine(arcPts(cx + 60, cy - 46, 60, 26, Math.PI * 0.95, Math.PI * 2.05), 0.2);
      // horizon + table edge
      pencilLine([[40, 548], [1240, 552]], 0.13, 0.9, 1);
      // lettering guides
      pencilLine([[760, 316], [1210, 312]], 0.13, 0.8, 1);
      pencilLine([[760, 448], [1210, 444]], 0.13, 0.8, 1);

      // ---------- wash machinery ----------
      // finish(): pool pigment at the drying edges (alpha - blurred alpha), then glaze onto paper with multiply
      function finish(bb, pool = 1.6, blurPx = 7, glaze = 1) {
        if (cur <= 0) { lx.clearRect(0, 0, W, H_); return; }
        pool *= cur * cur;                                 // edges darken only as the water dries
        const [x0, y0, x1, y1] = bb.map(Math.round);
        const w = Math.max(1, x1 - x0), h = Math.max(1, y1 - y0);
        lx.globalCompositeOperation = 'destination-in'; lx.globalAlpha = 1; lx.drawImage(mottle, 0, 0); lx.globalCompositeOperation = 'source-over';
        bx.clearRect(0, 0, W, H_); bx.filter = `blur(${blurPx}px)`; bx.drawImage(L, x0 - 20, y0 - 20, w + 40, h + 40, x0 - 20, y0 - 20, w + 40, h + 40); bx.filter = 'none';
        const a = lx.getImageData(x0, y0, w, h), b = bx.getImageData(x0, y0, w, h), d = a.data, e = b.data;
        for (let i = 3; i < d.length; i += 4) {
          const la = d[i], rim = la - e[i];
          if (rim > 0) d[i] = Math.min(255, la + rim * pool);
        }
        lx.putImageData(a, x0, y0);
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = glaze; ctx.drawImage(L, 0, 0); ctx.restore();
        lx.clearRect(0, 0, W, H_);
      }
      // layered polygon wash into the working layer
      function wash(base, color, { layers = 36, alpha = 0.045, amt = 0.32, depth = 3, seed = 1, comp = 'source-over' } = {}) {
        const r = H.rng(seed);
        lx.save(); lx.globalCompositeOperation = comp; lx.fillStyle = Array.isArray(color) ? H.rgba(color, 1) : color;
        const n = Math.round(layers * (comp === 'source-over' ? Math.min(1, 0.25 + cur) : 1));
        let cxm = 0, cym = 0; base.forEach((q) => { cxm += q.x; cym += q.y; }); cxm /= base.length; cym /= base.length;
        const sc = comp === 'source-over' ? 0.55 + 0.45 * H.ease.out(cur) : 1;
        const b2 = sc === 1 ? base : base.map((q) => ({ x: cxm + (q.x - cxm) * sc, y: cym + (q.y - cym) * sc, v: q.v }));
        for (let i = 0; i < n; i++) { lx.globalAlpha = alpha * (0.6 + r() * 0.8) * (comp === 'source-over' ? Math.min(1, cur * 1.6) : 1); poly(lx, deform(b2, r, depth, amt)); lx.fill(); }
        lx.restore();
      }
      const shape = (pts, seed, depth = 3, amt = 0.4) => deform(pts, H.rng(seed), depth, amt);
      // cauliflower bloom: a ragged hole lifted out of the damp wash
      function bloom(x, y, r0, seed, strength = 0.55) {
        const r = H.rng(seed);
        if (cur <= 0) return;
        const base = shape(circlePts(x, y, r0, r0 * (0.8 + r() * 0.4), 9, r, 1.4), seed + 1, 3, 0.5);
        const k = H.clamp((cur - 0.45) * 1.8); if (k <= 0) return;
        wash(base, '#000', { layers: 14, alpha: strength / 6 * k, amt: 0.4, depth: 2, seed: seed + 2, comp: 'destination-out' });
      }

      // ---------- 3. sky: vignetted wash, negatively painted around the bulb ----------
      cur = ph(0.9, 2.3);
      const skyBase = shape([P(70, 120, 1.6), P(250, 40, 1.2), P(520, 22, 1.5), P(760, 70, 1.3), P(820, 200, 1.6), P(780, 400, 1.4), P(660, 510, 1.2), P(400, 540, 1.0), P(130, 520, 1.6), P(40, 330, 1.4)], 5, 3, 0.28);
      wash(skyBase, [126, 178, 214], { layers: 34, alpha: 0.05, amt: 0.12, depth: 4, seed: 11 });
      // wet-in-wet: ultramarine + a little rose dropped in, softened by blur
      lx.save(); lx.filter = 'blur(14px)';
      const dr = H.rng(19);
      for (let k = 0; k < 7; k++) {
        const x = dr.range(90, 720), y = dr.range(60, 300), rr = dr.range(60, 130);
        lx.globalAlpha = (0.18 + dr() * 0.12) * H.clamp(cur * 1.5 - 0.3); lx.fillStyle = k % 3 === 2 ? 'rgb(200,120,150)' : 'rgb(70,82,170)';
        poly(lx, shape(circlePts(x, y, rr, rr * 0.7, 8, dr, 1.2), 40 + k, 3, 0.45)); lx.fill();
      }
      lx.restore();
      // lift the glow halo around the bulb (negative painting) — crisp ragged edge
      const halo = shape(circlePts(cx + 6, cy + 10, rad + 58, rad + 62, 22, R, 1.0), 23, 4, 0.18);
      wash(halo, '#000', { layers: 10, alpha: 0.35, amt: 0.12, depth: 2, seed: 24, comp: 'destination-out' });
      wash(shape(circlePts(cx, cy + 4, rad + 34, rad + 36, 12, R, 1.0), 25, 3, 0.25), '#000', { layers: 10, alpha: 0.5, amt: 0.1, depth: 2, seed: 26, comp: 'destination-out' });
      bloom(700, 160, 40 + 16 * H.smooth(2.2, 6, t), 301, 0.75); bloom(170, 390, 44, 311, 0.7); bloom(640, 420, 34, 321, 0.6); bloom(110, 170, 30, 351, 0.6);
      finish([0, 0, 960, 600], 2.2, 8, 0.95);

      // second glaze of sky (wet on dry) only on top region -> darker overlapped band
      cur = ph(1.7, 2.7);
      const sky2 = shape([P(120, 70, 1.4), P(420, 30, 1.2), P(700, 50, 1.4), P(790, 140, 1.6), P(660, 200, 1.4), P(560, 150, 1.0), P(250, 190, 1.4), P(90, 230, 1.6)], 7, 3, 0.3);
      wash(sky2, [64, 92, 168], { layers: 26, alpha: 0.045, amt: 0.12, depth: 4, seed: 12 });
      wash(halo, '#000', { layers: 6, alpha: 0.6, amt: 0.1, depth: 2, seed: 27, comp: 'destination-out' });
      bloom(330, 100, 36, 331, 0.75);
      finish([0, 0, 960, 320], 2.6, 6, 0.8);

      // ---------- 4. table / ground: ochre wash + violet cast shadow ----------
      cur = ph(1.5, 2.5);
      const ground = shape([P(60, 556, 1.2), P(400, 540, 0.6), P(780, 546, 0.8), P(930, 560, 1.6), P(880, 640, 1.8), P(500, 668, 1.4), P(140, 650, 1.6), P(30, 610, 1.4)], 9, 3, 0.3);
      wash(ground, [214, 168, 92], { layers: 28, alpha: 0.05, amt: 0.25, seed: 13 });
      lx.save(); lx.filter = 'blur(10px)'; lx.globalAlpha = 0.22 * cur; lx.fillStyle = 'rgb(190,110,70)';
      poly(lx, shape(circlePts(700, 600, 160, 40, 8, R), 50, 3, 0.4)); lx.fill(); lx.restore();
      finish([0, 500, 980, 700], 2.0, 6, 0.9);
      cur = ph(2.4, 3.0);
      const shadow = shape(circlePts(cx + 70, 572, 170, 26, 12, R, 1.0), 14, 3, 0.25);
      wash(shadow, [120, 110, 170], { layers: 22, alpha: 0.035, amt: 0.2, seed: 15 });
      finish([200, 520, 720, 620], 2.4, 5, 0.85);

      // ---------- 5. bulb glass: aureolin glow, wet-in-wet warm core, white paper highlight ----------
      const globe = [];
      for (let i = 0; i <= 26; i++) { const a = Math.PI * 0.72 + (Math.PI * 1.56) * i / 26; globe.push(P(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, 0.5)); }
      globe.push(P(cx + 82, cy + 205, 0.4), P(cx + 78, cy + 226, 0.3), P(cx - 78, cy + 226, 0.3), P(cx - 82, cy + 205, 0.4));
      cur = ph(2.1, 3.1);
      const globeB = shape(globe, 61, 2, 0.12);
      wash(globeB, [250, 214, 90], { layers: 30, alpha: 0.05, amt: 0.08, seed: 16 });
      lx.save(); lx.filter = 'blur(18px)';
      lx.globalAlpha = 0.45 * H.clamp(cur * 1.4 - 0.3); lx.fillStyle = 'rgb(246,150,60)';
      poly(lx, shape(circlePts(cx + 10, cy + 40, 95, 105, 9, R, 1.2), 62, 3, 0.4)); lx.fill();
      lx.globalAlpha = 0.25 * H.clamp(cur * 1.4 - 0.4); lx.fillStyle = 'rgb(225,90,90)';
      poly(lx, shape(circlePts(cx + 40, cy + 110, 60, 50, 8, R, 1.2), 63, 3, 0.4)); lx.fill();
      lx.restore();
      // white highlight crescent left unpainted
      // lifted highlights: two broken crescent marks, soft on one side
      const crescent = (a0, a1, r0, r1, seed) => {
        const c = [];
        for (let i = 0; i <= 10; i++) { const a = a0 + (a1 - a0) * i / 10; c.push(P(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, 0.7)); }
        for (let i = 10; i >= 0; i--) { const a = a0 + 0.04 + (a1 - a0 - 0.08) * i / 10, rr = r1 + Math.sin(i / 10 * Math.PI) * -14; c.push(P(cx + 6 + Math.cos(a) * rr, cy + 6 + Math.sin(a) * rr, 0.7)); }
        wash(shape(c, seed, 3, 0.22), '#000', { layers: 16, alpha: 0.17, amt: 0.25, depth: 3, seed: seed + 1, comp: 'destination-out' });
      };
      crescent(Math.PI * 1.06, Math.PI * 1.27, rad - 24, rad - 40, 64);
      crescent(Math.PI * 1.32, Math.PI * 1.42, rad - 22, rad - 34, 72);
      wash(shape(circlePts(cx + 112, cy - 92, 9, 13, 8, R), 66, 2, 0.2), '#000', { layers: 6, alpha: 0.8, amt: 0.1, depth: 2, seed: 67, comp: 'destination-out' });
      bloom(cx - 40, cy + 120, 28, 341, 0.45);
      finish([cx - rad - 20, cy - rad - 20, cx + rad + 20, cy + 240], 2.8, 6, 1);
      // cool reflected light on the shadow side of the glass
      const refl = [];
      for (let i = 0; i <= 16; i++) { const a = -Math.PI * 0.32 + Math.PI * 0.62 * i / 16; refl.push(P(cx + Math.cos(a) * (rad - 2), cy + Math.sin(a) * (rad - 2), 0.5)); }
      for (let i = 16; i >= 0; i--) { const a = -Math.PI * 0.22 + Math.PI * 0.5 * i / 16; refl.push(P(cx + Math.cos(a) * (rad - 30), cy + Math.sin(a) * (rad - 30), 0.9)); }
      cur = ph(2.8, 3.3);
      wash(shape(refl, 68, 3, 0.2), [140, 175, 215], { layers: 18, alpha: 0.035, amt: 0.18, seed: 69 });
      finish([cx, cy - rad, cx + rad + 10, cy + rad], 2.4, 5, 0.8);

      // ---------- 6. sprout: sap green leaves, wet-in-wet yellow, veins ----------
      function leaf(x0, y0, ang, len, wid, seed) {
        const pts = [], ca = Math.cos(ang), sa = Math.sin(ang);
        for (let i = 0; i <= 10; i++) { const u = i / 10, w = Math.sin(u * Math.PI) * wid * (1 - u * 0.25); pts.push([u * len, -w]); }
        for (let i = 9; i >= 1; i--) { const u = i / 10, w = Math.sin(u * Math.PI) * wid * 0.85 * (1 - u * 0.25); pts.push([u * len, w]); }
        return shape(pts.map(([u, v]) => P(x0 + u * ca - v * sa, y0 + u * sa + v * ca, 0.5)), seed, 2, 0.12);
      }
      cur = ph(2.9, 3.7);
      // stem
      lx.save(); lx.strokeStyle = 'rgb(84,122,58)'; lx.lineCap = 'round';
      for (let k = 0; k < 4; k++) {
        lx.globalAlpha = 0.35; lx.lineWidth = 7 - k * 1.2; lx.beginPath();
        // the stem grows upward with the brush
        lx.setLineDash([240 * H.ease.out(H.clamp(cur * 1.6)), 400]);
        lx.moveTo(cx - 4 + k, cy + 215); lx.bezierCurveTo(cx - 14 + k, cy + 140, cx + 12, cy + 70, cx + 2 + k * 0.5, cy - 22);
        lx.stroke();
      }
      lx.restore();
      const g1 = leaf(cx - 4, cy + 36, Math.PI * 1.06, 128, 36, 81), g2 = leaf(cx + 4, cy - 14, -Math.PI * 0.1, 122, 34, 82), g3 = leaf(cx, cy - 20, -Math.PI * 0.55, 62, 18, 83);
      [g1, g2, g3].forEach((g, i) => wash(g, [92, 148, 64], { layers: 22, alpha: 0.07, amt: 0.08, seed: 84 + i }));
      lx.save(); lx.filter = 'blur(8px)'; lx.globalAlpha = 0.5 * cur; lx.fillStyle = 'rgb(190,200,60)';
      lx.beginPath(); lx.ellipse(cx - 70, cy + 22, 40, 14, 0.15, 0, 7); lx.fill();
      lx.beginPath(); lx.ellipse(cx + 72, cy - 40, 38, 13, -0.3, 0, 7); lx.fill();
      lx.fillStyle = 'rgb(40,90,70)'; lx.globalAlpha = 0.45 * cur;
      lx.beginPath(); lx.ellipse(cx - 20, cy + 40, 26, 14, 0.15, 0, 7); lx.fill();
      lx.beginPath(); lx.ellipse(cx + 24, cy - 12, 26, 12, -0.3, 0, 7); lx.fill();
      lx.restore();
      finish([cx - 160, cy - 110, cx + 160, cy + 230], 3.0, 4, 1);
      // veins as fine "circuit" traces with node dots
      const vk = ph(3.6, 3.9); ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = `rgba(40,82,50,${0.55 * vk})`; ctx.fillStyle = `rgba(40,82,50,${0.6 * vk})`; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      [[cx - 8, cy + 34, cx - 118, cy + 22], [cx + 6, cy - 16, cx + 112, cy - 52]].forEach(([a, b, c, d]) => {
        ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c) / 2, (b + d) / 2 - 6, c, d); ctx.stroke();
        for (let k = 1; k < 4; k++) { const u = k / 4, x = a + (c - a) * u, y = b + (d - b) * u - 4; const s = k % 2 ? -1 : 1;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (c > a ? 12 : -12), y + s * 12); ctx.stroke();
          ctx.beginPath(); ctx.arc(x + (c > a ? 12 : -12), y + s * 12, 2.4, 0, 7); ctx.fill(); }
      });
      ctx.restore();

      // ---------- 7. screw base: Payne's grey + burnt sienna, bands, white highlights ----------
      cur = ph(3.2, 3.9);
      const baseP = shape([P(cx - 80, cy + 222, 0.3), P(cx + 80, cy + 220, 0.3), P(cx + 76, cy + 296, 0.3), P(cx + 36, cy + 318, 0.4), P(cx - 36, cy + 318, 0.4), P(cx - 76, cy + 296, 0.3)], 91, 2, 0.08);
      wash(baseP, [150, 152, 170], { layers: 22, alpha: 0.045, amt: 0.06, seed: 92 });
      lx.save(); lx.filter = 'blur(6px)'; lx.globalAlpha = 0.35 * cur; lx.fillStyle = 'rgb(160,96,60)'; lx.fillRect(cx + 20, cy + 230, 50, 80); lx.restore();
      for (let k = 0; k < 4; k++) {
        const y = cy + 238 + k * 17;
        wash(shape([P(cx - 80, y, 0.3), P(cx + 80, y - 5, 0.3), P(cx + 80, y + 6, 0.3), P(cx - 80, y + 10, 0.3)], 93 + k, 2, 0.1), [70, 72, 100], { layers: 10, alpha: 0.08, amt: 0.08, seed: 95 + k });
      }
      wash(shape([P(cx - 52, cy + 226, 0.2), P(cx - 38, cy + 226, 0.2), P(cx - 40, cy + 300, 0.2), P(cx - 52, cy + 296, 0.2)], 99, 2, 0.1), '#000', { layers: 6, alpha: 0.6, amt: 0.1, depth: 2, seed: 100, comp: 'destination-out' });
      finish([cx - 100, cy + 210, cx + 100, cy + 330], 2.2, 3, 1);

      // ---------- 8. loose brush contour on the shadow side ----------
      const br = H.rng(123);
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.lineCap = 'round';
      for (let s = 0; s < 3; s++) {
        const a0 = -Math.PI * 0.42 + s * 0.55 + br() * 0.2, a1 = a0 + 0.35 + br() * 0.3;
        const cp = H.clamp((t - 3.8 - s * 0.12) / 0.25);
        for (let i = 0; i < 18; i++) {
          if (i / 18 > cp) { br(); continue; }
          const u0 = i / 18, u1 = (i + 1) / 18, w = Math.sin(u0 * Math.PI) * 3.4 + 0.4;
          const aa = a0 + (a1 - a0) * u0, ab = a0 + (a1 - a0) * u1;
          ctx.strokeStyle = `rgba(50,48,92,${0.35 + br() * 0.15})`; ctx.lineWidth = w;
          ctx.beginPath(); ctx.moveTo(cx + Math.cos(aa) * (rad + 1), cy + Math.sin(aa) * (rad + 1)); ctx.lineTo(cx + Math.cos(ab) * (rad + 1), cy + Math.sin(ab) * (rad + 1)); ctx.stroke();
        }
      }
      ctx.restore();

      // ---------- 9. splatter ----------
      const sp = H.rng(555);
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      const spCols = [[70, 82, 170], [92, 148, 64], [235, 150, 60], [126, 178, 214]];
      for (let i = 0; i < 70; i++) {
        const c = sp.pick(spCols), ang = sp.range(-0.6, 0.3), d = Math.abs(sp.gauss()) * 240;
        const x = 700 + Math.cos(ang) * d + sp.gauss() * 50, y = 120 + Math.sin(ang) * d * 0.6 + sp.gauss() * 60;
        const rr = (Math.pow(sp(), 3) * 7 + 0.8) * H.ease.back(H.clamp((t - 3.95 - i * 0.003) / 0.12));
        if (rr <= 0.05) { sp(); sp(); sp(); continue; }
        ctx.fillStyle = H.rgba(c, 0.25 + sp() * 0.35);
        ctx.beginPath(); ctx.ellipse(x, y, rr, rr * (0.7 + sp() * 0.3), sp() * 3, 0, 7); ctx.fill();
        ctx.fillStyle = H.rgba(c, 0.25); ctx.beginPath(); ctx.arc(x, y, rr * 0.7, 0, 7); ctx.fill();
      }
      ctx.restore();

      // ---------- 10. hand-lettered title (brush + pooled edges) ----------
      const tr = H.rng(808);
      lx.save(); lx.fillStyle = 'rgb(44,52,112)';
      let chK = 0;
      function letter(str, x, y, size, rot = 0.03) {
        lx.font = `700 ${size}px "Caveat"`;
        let xx = x;
        for (const ch of str) {
          const w = lx.measureText(ch).width;
          lx.save(); lx.translate(xx, y + tr.gauss() * 2.5); lx.rotate(tr.gauss() * rot);
          const reveal = H.ease.out(H.clamp((t - 3.55 - chK++ * 0.06) / 0.16));
          if (reveal > 0) {
            lx.beginPath(); lx.rect(-10, -size, (w + 24) * reveal, size * 1.5); lx.clip();
            lx.globalAlpha = 0.82; lx.fillText(ch, 0, 0); lx.globalAlpha = 0.25; lx.fillText(ch, 1.5, 1);
          }
          lx.restore();
          xx += w * 0.96;
        }
      }
      letter('Ideas', 770, 312, 138);
      letter('take root', 790, 444, 120);
      lx.restore();
      // a tiny bloom in the "I" and wet-in-wet violet in the title
      lx.save(); lx.globalCompositeOperation = 'source-atop'; lx.filter = 'blur(12px)'; lx.fillStyle = 'rgb(130,70,150)'; lx.globalAlpha = 0.55;
      lx.beginPath(); lx.ellipse(960 + 50 * H.smooth(3.8, 6, t), 420, 90 + 40 * H.smooth(3.8, 6, t), 40, 0, 0, 7); lx.fill(); lx.restore();
      cur = ph(3.55, 4.6);
      finish([740, 180, 1240, 480], 2.4, 3, 1);
      // underline swash
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.lineCap = 'round';
      for (let i = 0; i < 40; i++) {
        const u0 = i / 40, u1 = (i + 1) / 40, w = Math.sin(Math.pow(u0, 0.7) * Math.PI) * 6 + 0.5;
        const X = (u) => 800 + u * 360, Y = (u) => 478 - Math.sin(u * 3.2) * 6 + u * 4;
        ctx.strokeStyle = `rgba(230,140,60,${0.55 * H.clamp((t - 4.3) / 0.35 * 1.2 - u0)})`; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(X(u0), Y(u0)); ctx.lineTo(X(u1), Y(u1)); ctx.stroke();
      }
      ctx.restore();
      // pencil caption
      ctx.save(); ctx.font = '400 30px "Caveat"'; ctx.fillStyle = 'rgba(80,78,84,0.62)';
      ctx.translate(808, 530); ctx.rotate(-0.012);
      const cap = 'fig. 1 — where the spark begins', nc = Math.floor(cap.length * H.clamp((t - 4.4) / 0.6));
      ctx.fillText(cap.slice(0, nc), 0, 0); ctx.restore();

      // ---------- 11. paper: cold-press tooth, granulation, pigment settling in the valleys ----------
      const gr = H.rng(99), fine = grid(W, H_, 2.2, gr), mid = grid(W, H_, 7, gr), big = grid(W, H_, 36, gr), speck = grid(W, H_, 1.3, gr);
      const img = ctx.getImageData(0, 0, W, H_), d = img.data;
      const hgt = new Float32Array(W * H_);
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) hgt[y * W + x] = fine(x, y) * 0.3 + mid(x, y) * 0.5 + big(x, y) * 0.2;
      for (let y = 1; y < H_ - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = y * W + x, p = i * 4, h = hgt[i];
        const shade = 1 + (hgt[i - W - 1] - hgt[i + W + 1]) * 0.1;
        const valley = (0.5 - h) * 2;                        // >0 in pits of the paper
        const sp = speck(x, y);
        let dens = 0;
        for (let c = 0; c < 3; c++) dens += 1 - d[p + c] / PAPER[c];
        dens /= 3;
        const blue = Math.max(0, (d[p + 2] - d[p]) / 120);           // ultramarine / violet granulate, yellows don't
        const g = 1 + (valley * (0.22 + blue * 0.7) + (sp > 0.82 ? (sp - 0.82) * 5 * blue : 0)) * Math.min(1, dens * 3);
        for (let c = 0; c < 3; c++) {
          const dc = Math.max(0, 1 - d[p + c] / PAPER[c]) * g;
          d[p + c] = Math.max(0, Math.min(255, PAPER[c] * (1 - dc) * shade));
        }
      }
      ctx.putImageData(img, 0, 0);
    }
  });
}
