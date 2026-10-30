// Editorial Essay Collage: the editorial "animated opinion essay" look. Warm paper, archival halftone prints with torn
// edges and white borders, newspaper clippings with a yellow highlighter sweep, masking tape, flat colour blocks,
// cut-out condensed headlines, flat diagrams with thin lines and pins. 2.5D parallax camera (smooth) over cutouts
// that move on 12 fps steps; cuts hidden inside fast blurred camera whips.
{
  const TAU = Math.PI * 2;
  const KRAFT = '#c9a878';
  const PAPER = '#f0e9d9', INK = '#1a1816', RED = '#b8483a', CARD = '#f5f1e7', NEWS = '#e9e1cb';
  const C = {}; // caches (static textures and sprites; output still depends only on t)
  const NZ = () => C.nz || (C.nz = H.makeNoise(4242));
  const q12 = (t) => Math.floor(t * 12 + 1e-6) / 12;
  const gs = (v, a = 1) => { const k = Math.round(H.clamp(v) * 255); return a >= 1 ? `rgb(${k},${k},${k})` : `rgba(${k},${k},${k},${a})`; };
  const ell = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); };
  const pathPoly = (c, p) => { c.beginPath(); c.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]); c.closePath(); };
  const measure = (font, s) => { const m = C.m || (C.m = H.layer(8, 8).getContext('2d')); m.font = font; return m.measureText(s); };

  // rectangle centred on 0 -> polygon; torn sides get a ragged fibre edge, cut sides stay straight (scissor cut)
  const edgePoly = (w, h, torn, seed, amp = 5) => {
    const nz = NZ(), r = H.rng(seed);
    const cs = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => [x + (r() - 0.5) * 4, y + (r() - 0.5) * 4]);
    const out = [];
    for (let e = 0; e < 4; e++) {
      const [ax, ay] = cs[e], [bx, by] = cs[(e + 1) % 4], len = Math.hypot(bx - ax, by - ay), dx = (bx - ax) / len, dy = (by - ay) / len;
      if (!torn[e]) { out.push([ax, ay]); continue; }
      const o = seed * 0.37 + e * 11.3;
      for (let d = 0; d < len; d += 2.5) {
        const fade = Math.min(1, d / 10, (len - d) / 10);
        const off = (nz.fbm2(o + d * 0.021, o * 0.5, 4) * amp * 1.7 + (r() - 0.5) * amp * 0.3 - amp * 0.25) * fade;
        out.push([ax + dx * d + dy * off, ay + dy * d - dx * off]);
      }
    }
    return out;
  };

  const sprite = (w, h, pad, paint) => {
    const cv = H.layer(Math.ceil(w + pad * 2), Math.ceil(h + pad * 2)), c = cv.getContext('2d');
    c.translate(cv.width / 2, cv.height / 2); paint(c);
    return { cv, ox: cv.width / 2, oy: cv.height / 2, w, h };
  };
  const drawSpr = (c, s) => c.drawImage(s.cv, -s.ox, -s.oy);
  const shadowFill = (c, poly, col, sh = 1) => {
    c.save(); c.shadowColor = `rgba(40,28,15,${0.4 * sh})`; c.shadowBlur = 15 * sh; c.shadowOffsetX = 4 * sh; c.shadowOffsetY = 8 * sh;
    pathPoly(c, poly); c.fillStyle = col; c.fill(); c.restore();
    c.save(); c.shadowColor = 'rgba(40,28,15,0.25)'; c.shadowBlur = 2; c.shadowOffsetY = 1; pathPoly(c, poly); c.fillStyle = col; c.fill(); c.restore();
  };

  // ---------- paper fibre texture (white based; multiplied over paper colour and cutouts) ----------
  const fibre = () => {
    if (C.fib) return C.fib;
    const W = 2000, Hh = 1100, cv = H.layer(W, Hh), c = cv.getContext('2d'), nz = NZ(), r = H.rng(31);
    c.fillStyle = '#fff'; c.fillRect(0, 0, W, Hh);
    const lo = H.layer(250, 138), lc = lo.getContext('2d'), im = lc.createImageData(250, 138);
    for (let y = 0; y < 138; y++) for (let x = 0; x < 250; x++) {
      const v = nz.fbm2(x * 0.05, y * 0.05, 4) * 0.6 + nz.n2(x * 0.3, y * 0.3) * 0.4, k = (y * 250 + x) * 4;
      const g = 244 + v * 22; im.data[k] = g; im.data[k + 1] = g - 2; im.data[k + 2] = g - 6; im.data[k + 3] = 255;
    }
    lc.putImageData(im, 0, 0); c.imageSmoothingQuality = 'high'; c.drawImage(lo, 0, 0, W, Hh);
    c.lineCap = 'round';
    for (let i = 0; i < 2600; i++) {
      const x = r() * W, y = r() * Hh, a = r() * TAU, l = 4 + r() * 16, dark = r() < 0.55;
      c.strokeStyle = dark ? `rgba(120,100,70,${0.05 + r() * 0.08})` : `rgba(255,255,255,${0.2 + r() * 0.3})`; c.lineWidth = 0.6 + r() * 0.7;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 0.4) * l * 0.5, y + Math.sin(a + 0.4) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
    }
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(80,60,40,${0.08 + r() * 0.2})`; c.fillRect(r() * W, r() * Hh, 0.8 + r() * 1.4, 0.8 + r() * 1.2); }
    return (C.fib = cv);
  };
  const texture = (c, poly, alpha, ox = 0, oy = 0) => {
    c.save(); pathPoly(c, poly); c.clip(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = alpha; c.drawImage(fibre(), -1000 + ox, -550 + oy); c.restore();
  };
  const grainTiles = () => {
    if (C.gr) return C.gr;
    C.gr = [0, 1, 2, 3].map((s) => {
      const cv = H.layer(256, 256), c = cv.getContext('2d'), im = c.createImageData(256, 256), r = H.rng(900 + s);
      for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 150; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
      c.putImageData(im, 0, 0); return c.createPattern(cv, 'repeat');
    });
    return C.gr;
  };

  // ---------- photographs: grey scene -> soft blur, grain, contrast, coarse halftone duotone ----------
  const treat = (w, h, seed, paint, o = {}) => {
    const cell = o.cell || 4, mix = o.mix == null ? 0.38 : o.mix, con = o.con || 1.25;
    const a = H.layer(w, h), ac = a.getContext('2d'); paint(ac, w, h);
    const b = H.layer(w, h), bc = b.getContext('2d'); bc.filter = `blur(${o.blur || 1}px)`; bc.drawImage(a, 0, 0); bc.filter = 'none';
    const img = bc.getImageData(0, 0, w, h), d = img.data, r = H.rng(seed);
    const ink = [30, 27, 25], pap = [238, 231, 214], ca = Math.cos(0.785), sa = Math.sin(0.785);
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
      const k = (py * w + px) * 4, u = px / w - 0.5, v = py / h - 0.5;
      let L = d[k] / 255;
      L *= 1 - (u * u + v * v) * 1.1;
      L += (r() + r() + r() - 1.5) * 0.11;
      L = H.clamp((L - 0.5) * con + 0.5 + (o.lift || 0));
      const D = 1 - L, rx = px * ca + py * sa, ry = -px * sa + py * ca;
      const gx = (Math.floor(rx / cell) + 0.5) * cell, gy = (Math.floor(ry / cell) + 0.5) * cell;
      const dot = H.clamp(cell * 0.74 * Math.sqrt(D) - Math.hypot(rx - gx, ry - gy) + 0.6);
      const cov = dot * (1 - mix) + D * mix;
      d[k] = pap[0] + (ink[0] - pap[0]) * cov; d[k + 1] = pap[1] + (ink[1] - pap[1]) * cov; d[k + 2] = pap[2] + (ink[2] - pap[2]) * cov;
    }
    bc.putImageData(img, 0, 0);
    // dust and a hairline scratch, like an old print
    for (let i = 0; i < w * h / 2500; i++) { bc.fillStyle = r() < 0.6 ? 'rgba(245,240,228,0.8)' : 'rgba(20,18,16,0.5)'; ell(bc, r() * w, r() * h, 0.5 + r() * 1.2, 0.5 + r() * 1.0); bc.fill(); }
    bc.strokeStyle = 'rgba(245,240,228,0.45)'; bc.lineWidth = 0.8; bc.beginPath(); const sx = r() * w; bc.moveTo(sx, 0); bc.bezierCurveTo(sx + 20, h * 0.3, sx - 15, h * 0.6, sx + 10 + r() * 20, h); bc.stroke();
    return b;
  };

  const makePrint = (img, seed, torn = [0, 1, 1, 0], border = 12, amp = 7) => {
    const w = img.width + border * 2, h = img.height + border * 2;
    return sprite(w, h, 34, (c) => {
      const outer = edgePoly(w, h, torn, seed, amp);
      shadowFill(c, outer, '#f8f5ee');
      texture(c, outer, 0.35, seed * 13 % 400, seed * 7 % 200);
      const inner = edgePoly(w - 7, h - 7, torn, seed, amp);
      c.save(); pathPoly(c, inner); c.clip(); c.beginPath(); c.rect(-img.width / 2, -img.height / 2, img.width, img.height); c.clip();
      c.drawImage(img, -img.width / 2, -img.height / 2); c.restore();
      c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1; c.strokeRect(-img.width / 2, -img.height / 2, img.width, img.height);
    });
  };
  const makeStrip = (text, font, o = {}) => {
    const m = measure(font, text), tw = m.width, asc = m.actualBoundingBoxAscent, desc = Math.max(1, m.actualBoundingBoxDescent);
    const px = asc / 0.72, padX = o.padX == null ? px * 0.2 : o.padX, padY = o.padY == null ? px * 0.15 : o.padY, w = tw + padX * 2, h = asc + desc + padY * 2;
    const base = -h / 2 + padY + asc;
    const spr = sprite(w, h, 30, (c) => {
      const poly = edgePoly(w, h, o.torn || [0, 0, 0, 0], o.seed || 1, o.amp || 4);
      shadowFill(c, poly, o.bg || CARD, o.sh || 1);
      texture(c, poly, o.bg === INK ? 0.12 : 0.45, (o.seed || 1) * 31 % 600, 0);
      c.fillStyle = o.fg || INK; c.font = font; c.fillText(text, -tw / 2, base);
    });
    spr.base = base; spr.tw = tw; spr.asc = asc;
    if (o.hl) {
      const i = text.indexOf(o.hl), x0 = -tw / 2 + measure(font, text.slice(0, i)).width, ww = measure(font, o.hl).width;
      spr.hl = [x0 - px * 0.07, base - asc * 0.9, ww + px * 0.14, asc * 1.0];
    }
    return spr;
  };
  // ---------- live marks: highlighter, tape, marker, ink arrows ----------
  // highlighter: translucent, slightly uneven band sweeping left -> right, multiplied into the paper
  const hilite = (c, rect, prog, seed) => {
    if (!rect || prog <= 0) return;
    const [x, y, w, h] = rect, nz = NZ(), L = w * H.clamp(prog), o = seed * 1.7, tilt = (H.rng(seed)() - 0.5) * h * 0.12;
    const top = [], bot = [];
    for (let d = 0; d <= L; d += 6) { top.push([x + d, y + nz.n2(o + d * 0.02, 1) * h * 0.07 + tilt * d / w]); bot.push([x + d, y + h + nz.n2(o + d * 0.02, 5) * h * 0.08 + tilt * d / w]); }
    top.push([x + L + h * 0.08, y + tilt * L / w]); bot.push([x + L - h * 0.08, y + h + tilt * L / w]);
    c.save(); c.globalCompositeOperation = 'multiply';
    c.beginPath(); c.moveTo(x - h * 0.06, y + h * 0.05); top.forEach((p) => c.lineTo(p[0], p[1])); for (let i = bot.length - 1; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]); c.closePath();
    c.fillStyle = 'rgba(255,226,38,0.84)'; c.fill(); c.clip();
    for (let k = 0; k < 4; k++) { // felt streaks along the stroke
      c.fillStyle = k % 2 ? 'rgba(235,190,20,0.22)' : 'rgba(255,240,150,0.3)';
      c.fillRect(x - 10, y + h * (0.12 + k * 0.22) + nz.n2(o + k, 3) * 3, L + 20, h * (0.05 + (k % 3) * 0.03));
    }
    c.fillStyle = 'rgba(230,180,10,0.3)'; ell(c, x + h * 0.08, y + h * 0.5, h * 0.18, h * 0.55); c.fill(); // pooled ink where the tip landed
    if (prog >= 1) { ell(c, x + L - h * 0.05, y + h * 0.5, h * 0.14, h * 0.55); c.fill(); }
    c.restore();
  };
  const tape = (c, x, y, w, h, rot, seed) => {
    const r = H.rng(seed);
    c.save(); c.translate(x, y); c.rotate(rot);
    const p = []; const n = 7;
    p.push([-w / 2, -h / 2]); p.push([w / 2, -h / 2]);
    for (let i = 1; i < n; i++) p.push([w / 2 + (i % 2 ? 3 : -2) + (r() - 0.5) * 3, -h / 2 + h * i / n]);
    p.push([w / 2, h / 2]); p.push([-w / 2, h / 2]);
    for (let i = n - 1; i > 0; i--) p.push([-w / 2 + (i % 2 ? -3 : 2) + (r() - 0.5) * 3, -h / 2 + h * i / n]);
    c.shadowColor = 'rgba(40,28,15,0.22)'; c.shadowBlur = 3; c.shadowOffsetY = 1.5;
    pathPoly(c, p); c.fillStyle = 'rgba(228,216,186,0.8)'; c.fill(); c.shadowColor = 'transparent';
    c.clip(); c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 1;
    for (let i = 0; i < 5; i++) { const yy = -h / 2 + r() * h; c.beginPath(); c.moveTo(-w / 2, yy); c.lineTo(w / 2, yy + (r() - 0.5) * 2); c.stroke(); }
    c.fillStyle = 'rgba(150,130,90,0.12)'; c.fillRect(-w / 2, -h / 2, w, 2); c.fillRect(-w / 2, h / 2 - 2, w, 2);
    c.restore();
  };
  // polyline drawn on by fraction (partial last segment)
  const partial = (c, pts, prog) => {
    const n = pts.length - 1, f = H.clamp(prog) * n, k = Math.floor(f);
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i <= Math.min(k, n); i++) c.lineTo(pts[i][0], pts[i][1]);
    if (k < n) { const a = pts[k], b = pts[k + 1], u = f - k; c.lineTo(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u); }
  };
  const marker = (c, pts, prog, col = RED, lw = 7) => {
    if (prog <= 0) return;
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = col; c.globalAlpha = 0.9; c.lineWidth = lw; partial(c, pts, prog); c.stroke();
    c.globalAlpha = 0.35; c.lineWidth = lw * 0.4; c.translate(lw * 0.18, -lw * 0.15); partial(c, pts, prog); c.stroke();
    c.restore();
  };
  const loopPts = (cx, cy, rx, ry, seed) => {
    const nz = NZ(), pts = [], a0 = -2.3 + seed % 1;
    for (let i = 0; i <= 70; i++) { const u = i / 70, a = a0 + u * TAU * 1.12, k = 1 + nz.n2(seed + u * 3, 2) * 0.06 + u * 0.07; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    return pts;
  };
  const linePts = (ax, ay, bx, by, seed, n = 10, wob = 2) => { const r = H.rng(seed), p = []; for (let i = 0; i <= n; i++) { const u = i / n; p.push([ax + (bx - ax) * u + (r() - 0.5) * wob, ay + (by - ay) * u + (r() - 0.5) * wob]); } return p; };
  const quadPts = (ax, ay, cx, cy, bx, by, n = 32) => { const p = []; for (let i = 0; i <= n; i++) { const u = i / n; p.push([(1 - u) * (1 - u) * ax + 2 * u * (1 - u) * cx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * u * (1 - u) * cy + u * u * by]); } return p; };
  const inkArrow = (c, pts, prog, lw = 2.6, col = INK, dash = null) => {
    if (prog <= 0) return;
    c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; if (dash) c.setLineDash(dash);
    partial(c, pts, prog); c.stroke(); c.setLineDash([]);
    if (prog >= 1) {
      const [x1, y1] = pts[pts.length - 1], [x0, y0] = pts[pts.length - 3], a = Math.atan2(y1 - y0, x1 - x0), L = 9 + lw * 3;
      c.fillStyle = col; c.beginPath(); c.moveTo(x1 + Math.cos(a) * 3, y1 + Math.sin(a) * 3); c.lineTo(x1 + Math.cos(a + 2.7) * L, y1 + Math.sin(a + 2.7) * L); c.lineTo(x1 + Math.cos(a - 2.7) * L, y1 + Math.sin(a - 2.7) * L); c.closePath(); c.fill();
    }
    c.restore();
  };

  // ---------- camera + stepped cutout animation ----------
  // place(): 2.5D parallax. p = depth factor (1 = main plane, <1 behind, >1 in front).
  const place = (c, cam, p, x, y, rot, s, fn) => {
    c.save(); c.translate(640, 360); const k = Math.pow(cam.z, p); c.scale(k, k); c.translate(-cam.x * p, -cam.y * p);
    c.translate(x, y); if (rot) c.rotate(rot); if (s !== 1) c.scale(s, s); fn(c); c.restore();
  };
  // cutout arrival on 12 fps steps: returns null before it lands
  const POP = {
    drop: { s: [1.16, 1.05, 0.985, 1], r: [0.05, 0.015, -0.006, 0] },
    slideL: { dx: [-300, -110, -26, 0], r: [-0.04, -0.015, 0.004, 0] }, slideR: { dx: [300, 110, 26, 0], r: [0.04, 0.015, -0.004, 0] },
    slideU: { dy: [320, 120, 28, 0], r: [0.03, 0.01, -0.003, 0] }, slideD: { dy: [-320, -120, -28, 0], r: [-0.03, -0.01, 0.003, 0] },
  };
  const arrive = (tq, a, kind = 'drop') => {
    if (tq < a - 1e-6) return null;
    const f = Math.min(3, Math.round((tq - a) * 12)), P = POP[kind];
    return { s: P.s ? P.s[f] : 1, r: P.r[f], dx: P.dx ? P.dx[f] : 0, dy: P.dy ? P.dy[f] : 0 };
  };
  const putSpr = (c, cam, p, spr, x, y, rot, s, tq, a, kind, extra) => {
    const A = arrive(tq, a, kind); if (!A) return false;
    place(c, cam, p, x + A.dx, y + A.dy, rot + A.r, s * A.s, (cc) => { drawSpr(cc, spr); if (extra) extra(cc); });
    return true;
  };
  const bgPaper = (c, cam, tint) => {
    c.save(); c.fillStyle = tint || PAPER; c.fillRect(0, 0, 1280, 720); c.restore();
    place(c, cam, 0.2, 0, 0, 0, 1, (cc) => { cc.globalCompositeOperation = 'multiply'; cc.drawImage(fibre(), -1000, -550); });
  };
  const block = (c, cam, p, x, y, w, h, rot, col, seed, torn = [0, 0, 0, 0], amp = 6) => {
    place(c, cam, p, x, y, rot, 1, (cc) => {
      const poly = edgePoly(w, h, torn, seed, amp);
      cc.save(); cc.shadowColor = 'rgba(40,28,15,0.25)'; cc.shadowBlur = 10; cc.shadowOffsetY = 4; pathPoly(cc, poly); cc.fillStyle = col; cc.fill(); cc.restore();
      texture(cc, poly, 0.55, seed * 40 % 300, 0);
    });
  };
  const finish = (c, t, vig = 0.32) => {
    const pats = grainTiles(), f = Math.floor(t * 12), r = H.rng(5000 + f);
    c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.26; c.fillStyle = pats[f % 4];
    c.translate(-r() * 256, -r() * 256); c.fillRect(0, 0, 1280 + 256, 720 + 256); c.restore();
    c.save(); c.globalCompositeOperation = 'multiply';
    const g = c.createRadialGradient(640, 360, 260, 640, 360, 820); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, `rgba(${255 - 90 * vig},${255 - 100 * vig},${255 - 120 * vig},1)`);
    c.fillStyle = g; c.fillRect(0, 0, 1280, 720); c.restore();
  };


window.Collage={edgePoly,pathPoly,sprite,drawSpr,shadowFill,fibre,texture,treat,makePrint,makeStrip,hilite,tape,partial,marker,loopPts,linePts,quadPts,inkArrow,place,arrive,putSpr,bgPaper,block,finish,q12};
}
