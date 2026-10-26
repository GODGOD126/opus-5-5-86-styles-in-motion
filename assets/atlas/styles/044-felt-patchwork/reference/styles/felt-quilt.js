{
  const TAU = Math.PI * 2;
  const hx = (h) => H.hex(h);

  // ---- fabric prints (u,v local px) -> rgb ----
  const PRINTS = [
    { kind: 'gingham', a: hx('#c9634d'), b: hx('#f3eadb') },
    { kind: 'dots', a: hx('#e2b24a'), b: hx('#f7efdc') },
    { kind: 'stripes', a: hx('#8fae84'), b: hx('#eee4cf') },
    { kind: 'floral', a: hx('#d98f86'), b: hx('#f6d9cf'), c: hx('#fff5e6') },
    { kind: 'denim', a: hx('#5f7ea3'), b: hx('#8aa3c2') },
    { kind: 'linen', a: hx('#e9dcc2'), b: hx('#d8c8aa') },
    { kind: 'gingham', a: hx('#6f9a8a'), b: hx('#f1ecdf') },
    { kind: 'dots', a: hx('#b9563f'), b: hx('#f1d4bf') },
  ];
  const printCol = (p, u, v) => {
    switch (p.kind) {
      case 'gingham': {
        const a = Math.floor(u / 14) % 2, b = Math.floor(v / 14) % 2, n = a + b;
        return n === 2 ? p.a : n === 1 ? H.mix(p.a, p.b, 0.55) : p.b;
      }
      case 'dots': {
        const row = Math.floor(v / 20), ox = row % 2 ? 10 : 0;
        const du = ((u + ox) % 20) - 10, dv = (v % 20) - 10;
        return du * du + dv * dv < 20 ? p.b : p.a;
      }
      case 'stripes': return (u % 18) < 7 ? p.a : (u % 18) < 9 ? H.mix(p.a, p.b, 0.5) : p.b;
      case 'floral': {
        const row = Math.floor(v / 26), ox = row % 2 ? 13 : 0;
        const du = ((u + ox) % 26) - 13, dv = (v % 26) - 13, d = du * du + dv * dv;
        if (d < 5) return p.c;
        const pet = [[4, 0], [-4, 0], [0, 4], [0, -4]].some(([x, y]) => (du - x) ** 2 + (dv - y) ** 2 < 8);
        return pet ? p.b : p.a;
      }
      case 'denim': return ((u + v) % 5) < 2 ? p.b : p.a;
      default: return p.a;
    }
  };

  const HQ = {}; // hero quilt cache (per canvas size)
  const feltTex = (seed) => {
    const S = 256, cv = H.layer(S, S), x = cv.getContext('2d'), r = H.rng(seed);
    const img = x.createImageData(S, S), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const n = r(); d[i] = d[i + 1] = d[i + 2] = n > 0.5 ? 255 : 0; d[i + 3] = Math.abs(n - 0.5) * 70; }
    x.putImageData(img, 0, 0);
    x.lineCap = 'round';
    for (let n = 0; n < 1400; n++) {
      const px = r() * S, py = r() * S, a = r() * TAU, l = r.range(2, 7);
      x.strokeStyle = r() < 0.5 ? `rgba(255,255,255,${r.range(0.08, 0.2)})` : `rgba(0,0,0,${r.range(0.08, 0.18)})`;
      x.lineWidth = r.range(0.4, 0.9);
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        x.beginPath(); x.moveTo(px + ox * S, py + oy * S);
        x.quadraticCurveTo(px + ox * S + Math.cos(a + 1) * l, py + oy * S + Math.sin(a + 1) * l, px + ox * S + Math.cos(a) * l * 1.6, py + oy * S + Math.sin(a) * l * 1.6);
        x.stroke();
      }
    }
    return cv;
  };

  // =====================================================================
  // EXPLAINER: the camera pans along one long quilt. Felt pieces drop on
  // with a lifted shadow, thread sews arrows and outlines on as we watch,
  // labels are woven tags stitched to what they name, buttons are the weights.
  // =====================================================================
  const FX = {};
  const fwalk = (pts, step, fn) => {
    let acc = 0, next = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay) || 1e-6, a = Math.atan2(by - ay, bx - ax);
      while (next <= acc + L) { const u = (next - acc) / L; fn(ax + (bx - ax) * u, ay + (by - ay) * u, a, next); next += step; }
      acc += L;
    }
  };
  const fthread = (ctx, x0, y0, x1, y1, col, w = 2.4) => {
    const rgb = hx(col);
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(40,25,15,0.38)'; ctx.lineWidth = w + 1.2; ctx.beginPath(); ctx.moveTo(x0 + 0.8, y0 + 1.2); ctx.lineTo(x1 + 0.8, y1 + 1.2); ctx.stroke();
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, H.rgba(rgb.map((v) => v * 0.65))); g.addColorStop(0.5, H.rgba(rgb.map((v) => Math.min(255, v * 1.1 + 10)))); g.addColorStop(1, H.rgba(rgb.map((v) => v * 0.65)));
    ctx.strokeStyle = g; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.fillStyle = 'rgba(30,15,10,0.45)'; ctx.beginPath(); ctx.arc(x0, y0, 1.1, 0, TAU); ctx.arc(x1, y1, 1.1, 0, TAU); ctx.fill();
  };
  const frun = (ctx, pts, col, len = 12, gap = 7, w = 3, pr = 1) => {
    if (pr <= 0 || pts.length < 2) return;
    let total = 0; for (let i = 0; i < pts.length - 1; i++) total += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    let start = null;
    fwalk(pts, (len + gap) / 2, (x, y, a, dd) => {
      if (dd > total * pr) return;
      const k = Math.round(dd / ((len + gap) / 2));
      if (k % 2 === 0) start = [x, y]; else if (start) { fthread(ctx, start[0], start[1], start[0] + Math.cos(a) * len, start[1] + Math.sin(a) * len, col, w); start = null; }
    });
  };
  // stitched arrow: running stitch shaft + two stitched head strokes once complete
  const farrow = (ctx, pts, col, pr, w = 3.4) => {
    frun(ctx, pts, col, 14, 7, w, pr);
    if (pr >= 1) { const [x1, y1] = pts[pts.length - 1], [x0, y0] = pts[pts.length - 2], a = Math.atan2(y1 - y0, x1 - x0); fthread(ctx, x1, y1, x1 + Math.cos(a + 2.5) * 24, y1 + Math.sin(a + 2.5) * 24, col, w); fthread(ctx, x1, y1, x1 + Math.cos(a - 2.5) * 24, y1 + Math.sin(a - 2.5) * 24, col, w); }
  };
  const fcurve = (ax, ay, cx, cy, bx, by) => Array.from({ length: 31 }, (_, i) => { const u = i / 30; return [(1 - u) * (1 - u) * ax + 2 * u * (1 - u) * cx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * u * (1 - u) * cy + u * u * by]; });
  const fpat = () => FX.pat || (FX.pat = H.layer(2, 2).getContext('2d').createPattern(feltTex(55), 'repeat'));
  // a felt piece cut to polygon pts (local coords, origin top-left), fuzz + felt texture + soft edge
  const feltSpr = (key, pts, col, w, h, extra) => {
    if (FX[key]) return FX[key];
    const pad = 12, C = H.layer(Math.ceil(w + pad * 2), Math.ceil(h + pad * 2)), c = C.getContext('2d');
    c.translate(pad, pad);
    const path = () => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
    path(); c.fillStyle = col; c.fill();
    const fr = H.rng(key.length * 31 + w);
    c.lineCap = 'round';
    fwalk([...pts, pts[0]], 1.6, (x, y, a) => { const nx = Math.sin(a), ny = -Math.cos(a), l = fr.range(0.5, 2.6), tw = fr.range(-0.8, 0.8); c.strokeStyle = col; c.lineWidth = fr.range(0.5, 1.1); c.beginPath(); c.moveTo(x - nx * 1.5, y - ny * 1.5); c.lineTo(x + (nx + tw * ny) * l, y + (ny - tw * nx) * l); c.stroke(); });
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop';
    const p = fpat(); p.setTransform(new DOMMatrix().translateSelf(fr() * 256, fr() * 256)); c.fillStyle = p; c.fillRect(0, 0, C.width, C.height); c.restore();
    c.save(); c.globalCompositeOperation = 'source-atop'; c.filter = 'blur(3px)'; c.lineWidth = 7; c.strokeStyle = 'rgba(0,0,0,0.22)'; path(); c.stroke(); c.translate(-2, -2); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.12)'; path(); c.stroke(); c.restore();
    if (extra) extra(c);
    C.pad = pad; C.w = w; C.h = h;
    return (FX[key] = C);
  };
  // felt letters: cut glyphs with fuzzy edges, a darker cut rim and a soft padded bevel.
  // o.back: colour of a slightly larger felt cut-out the letters are appliqued onto (layered felt, for contrast).
  const feltText = (key, str, px, col, font = '700 PXpx "Fredoka"', o = {}) => {
    if (FX[key]) return FX[key];
    const f = font.replace('PX', px), m = H.layer(4, 4).getContext('2d'); m.font = f;
    const w = Math.ceil(m.measureText(str).width) + 8, h = Math.ceil(px * 1.2), bw = o.back ? Math.round(px * 0.14) : 0, pad = 12 + bw;
    const C = H.layer(w + pad * 2, h + pad * 2), c = C.getContext('2d'), r = H.rng(key.length * 13 + px);
    const tx = pad + 4, ty = pad + px * 0.95, dk = H.rgba(hx(col).map((v) => v * 0.6), 0.6);
    c.font = f; c.lineJoin = 'round';
    if (o.back) { // backing felt: dilated glyphs, own fuzz, texture and rim, with a small shadow from the letter layer
      const B = H.layer(C.width, C.height), b = B.getContext('2d');
      b.font = f; b.lineJoin = 'round'; b.fillStyle = b.strokeStyle = o.back;
      for (let i = 0; i < 18; i++) { b.globalAlpha = 0.2; b.lineWidth = bw * 2 + r.gauss() * 1.6; const ox = r.gauss() * 1.2, oy = r.gauss() * 1.2; b.strokeText(str, tx + ox, ty + oy); b.fillText(str, tx + ox, ty + oy); }
      b.globalAlpha = 1; b.lineWidth = bw * 2 - 1; b.strokeText(str, tx, ty); b.fillText(str, tx, ty);
      b.globalCompositeOperation = 'source-atop'; const pb = fpat(); pb.setTransform(new DOMMatrix().translateSelf(r() * 256, r() * 256)); b.fillStyle = pb; b.fillRect(0, 0, B.width, B.height);
      { // shaded cut edge: dark band = silhouette minus an eroded copy, softened
        const D = H.layer(C.width, C.height), dd = D.getContext('2d');
        dd.fillStyle = 'rgba(70,45,25,0.42)'; dd.fillRect(0, 0, D.width, D.height);
        dd.globalCompositeOperation = 'destination-out'; dd.font = f; dd.lineJoin = 'round'; dd.lineWidth = bw * 2 - 7; dd.strokeText(str, tx + 0.8, ty + 0.8); dd.fillText(str, tx + 0.8, ty + 0.8);
        b.filter = 'blur(2px)'; b.drawImage(D, 0, 0); b.filter = 'none';
      }
      c.drawImage(B, 0, 0);
      c.save(); c.shadowColor = 'rgba(40,20,10,0.45)'; c.shadowBlur = 4; c.shadowOffsetX = 1.5; c.shadowOffsetY = 2.5;
    }
    const L = H.layer(C.width, C.height), l = L.getContext('2d');
    l.font = f; l.lineJoin = 'round';
    l.strokeStyle = dk; l.lineWidth = 3; l.strokeText(str, tx, ty); // darker cut edge under the fuzz
    l.fillStyle = col;
    for (let i = 0; i < 26; i++) { l.globalAlpha = 0.18; l.fillText(str, tx + r.gauss() * 1.4, ty + r.gauss() * 1.4); }
    l.globalAlpha = 1; l.fillText(str, tx, ty);
    l.globalCompositeOperation = 'source-atop'; const p = fpat(); p.setTransform(new DOMMatrix().translateSelf(r() * 256, r() * 256)); l.fillStyle = p; l.fillRect(0, 0, C.width, C.height);
    // padded felt: shaded rim, light catching the top-left
    l.filter = 'blur(2.5px)'; l.lineWidth = Math.max(4, px * 0.06); l.strokeStyle = 'rgba(30,15,5,0.3)'; l.strokeText(str, tx, ty);
    l.lineWidth = Math.max(2, px * 0.03); l.strokeStyle = 'rgba(255,250,235,0.22)'; l.strokeText(str, tx - 1.5, ty - 1.5); l.filter = 'none';
    c.drawImage(L, 0, 0);
    if (o.back) c.restore();
    C.pad = pad; C.w = w; C.h = h;
    return (FX[key] = C);
  };
  // satin-stitched embroidery floss: close slanted stitches across a thick band (heavy, raised, catches the light)
  const fsatin = (ctx, x0, y0, x1, y1, col, w = 13) => {
    const L = Math.hypot(x1 - x0, y1 - y0); if (L < 0.5) return;
    const rgb = hx(col), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux, hw = w / 2, sl = w * 0.35;
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(40,20,10,0.42)'; ctx.lineWidth = w + 3; ctx.filter = 'blur(1.5px)';
    ctx.beginPath(); ctx.moveTo(x0 + 1.5, y0 + 2.5); ctx.lineTo(x1 + 1.5, y1 + 2.5); ctx.stroke(); ctx.filter = 'none';
    ctx.strokeStyle = H.rgba(rgb.map((v) => v * 0.55)); ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    const dark = H.rgba(rgb.map((v) => v * 0.72)), lite = H.rgba(rgb.map((v) => Math.min(255, v * 1.18 + 18))), hi = 'rgba(255,255,255,0.35)';
    for (let d = -hw * 0.5; d <= L + hw * 0.5; d += 2.1) {
      const cx = x0 + ux * d, cy = y0 + uy * d;
      const ax = cx - nx * hw - ux * sl / 2, ay = cy - ny * hw - uy * sl / 2, bx = cx + nx * hw + ux * sl / 2, by = cy + ny * hw + uy * sl / 2;
      ctx.strokeStyle = dark; ctx.lineWidth = 2.3; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.strokeStyle = lite; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(ax - 0.4, ay - 0.6); ctx.lineTo(bx - 0.4, by - 0.6); ctx.stroke();
      ctx.strokeStyle = hi; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(cx - nx * hw * 0.5 - 0.5, cy - ny * hw * 0.5 - 0.7); ctx.lineTo(cx - nx * hw * 0.1 - 0.5, cy - ny * hw * 0.1 - 0.7); ctx.stroke();
    }
    ctx.restore();
  };
  // woven label with satin-stitched text
  const tagSpr = (str, px, ink = '#2f5f9a') => {
    const key = 'tag' + str + px + ink;
    if (FX[key]) return FX[key];
    const m = H.layer(4, 4).getContext('2d'); m.font = `700 ${px}px "Fredoka"`;
    const lw = Math.ceil(m.measureText(str).width + px * 1.4), lh = Math.ceil(px * 1.75), pad = 10;
    const C = H.layer(lw + pad * 2, lh + pad * 2), c = C.getContext('2d');
    c.translate(pad, pad);
    c.fillStyle = '#f3ecdc'; c.fillRect(0, 0, lw, lh);
    c.save(); c.beginPath(); c.rect(0, 0, lw, lh); c.clip();
    c.strokeStyle = 'rgba(120,100,70,0.12)'; c.lineWidth = 1; for (let k = -lw; k < lw; k += 3) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + lh, lh); c.stroke(); }
    c.fillStyle = '#c8443a'; c.fillRect(0, 4, lw, 2.5); c.fillRect(0, lh - 6.5, lw, 2.5);
    const fg = c.createLinearGradient(0, 0, 12, 0); fg.addColorStop(0, 'rgba(90,60,30,0.3)'); fg.addColorStop(1, 'rgba(90,60,30,0)'); c.fillStyle = fg; c.fillRect(0, 0, 12, lh);
    const fg2 = c.createLinearGradient(lw, 0, lw - 12, 0); fg2.addColorStop(0, 'rgba(90,60,30,0.3)'); fg2.addColorStop(1, 'rgba(90,60,30,0)'); c.fillStyle = fg2; c.fillRect(lw - 12, 0, 12, lh);
    c.restore();
    const M = H.layer(lw, lh), mc = M.getContext('2d');
    mc.font = `700 ${px}px "Fredoka"`; mc.textAlign = 'center'; mc.textBaseline = 'middle'; mc.fillStyle = '#fff'; mc.fillText(str, lw / 2, lh / 2 + 2);
    mc.globalCompositeOperation = 'source-in'; mc.fillStyle = ink; mc.fillRect(0, 0, lw, lh);
    mc.globalCompositeOperation = 'source-atop'; mc.lineWidth = 1;
    for (let k = -lh; k < lw + lh; k += 2) { mc.strokeStyle = 'rgba(255,255,255,0.28)'; mc.beginPath(); mc.moveTo(k, 0); mc.lineTo(k + lh * 0.35, lh); mc.stroke(); mc.strokeStyle = 'rgba(0,0,30,0.25)'; mc.beginPath(); mc.moveTo(k + 1, 0); mc.lineTo(k + 1 + lh * 0.35, lh); mc.stroke(); }
    c.save(); c.shadowColor = 'rgba(20,10,5,0.45)'; c.shadowBlur = 1.5; c.shadowOffsetX = 0.8; c.shadowOffsetY = 1.2; c.drawImage(M, 0, 0); c.restore();
    frun(c, [[7, 4], [7, lh - 4]], '#c8443a', 6, 4, 1.8); frun(c, [[lw - 7, 4], [lw - 7, lh - 4]], '#c8443a', 6, 4, 1.8);
    C.pad = pad; C.w = lw; C.h = lh;
    return (FX[key] = C);
  };
  const circPts = (cx, cy, rx, ry, n = 90, wob = 0.02, seed = 0) => { const nz = FX.nz || (FX.nz = H.makeNoise(21)); return Array.from({ length: n }, (_, i) => { const a = (i / n) * TAU, k = 1 + nz.n2(Math.cos(a) + seed, Math.sin(a)) * wob; return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; }); };

  const EXPLAIN = (ctx, W, H_, t) => {
    const seg = (a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
    const prog = (a, b) => H.clamp((t - a) / (b - a));
    // drop-on: falls in large with lifted shadow, squashes, settles
    const put = (spr, x, y, st, o = {}) => {
      if (!spr || t < st) return;
      const u = H.clamp((t - st) / 0.45), lift = 1 - H.ease.out(u), sq = u > 0.45 && u < 1 ? Math.sin(((u - 0.45) / 0.55) * Math.PI) * 0.04 : 0;
      const cx = x + spr.w / 2, cy = y + spr.h / 2;
      ctx.save();
      ctx.shadowColor = `rgba(40,20,10,${0.45 - lift * 0.2})`; ctx.shadowBlur = (o.sb ?? 10) + lift * 26; ctx.shadowOffsetX = (o.sx ?? 4) + lift * 18; ctx.shadowOffsetY = (o.sy ?? 6) + lift * 26;
      ctx.globalAlpha = H.clamp(u * 5);
      ctx.translate(cx, cy - lift * 30); if (o.rot) ctx.rotate(o.rot); ctx.scale((1 + lift * 0.14 + sq) * (o.s || 1), (1 + lift * 0.14 - sq) * (o.s || 1)); ctx.translate(-cx, -cy);
      ctx.drawImage(spr, x - spr.pad, y - spr.pad); ctx.restore();
    };
    // ---- camera pan along the quilt ----
    const cam = 1280 * seg(1.9, 2.6) + 700 * seg(5.6, 6.3) + 1300 * seg(10.0, 10.7);
    // ---- quilt (baked once, 2560 wide, tiled) ----
    if (!FX.quilt) {
      const QW = 2560, P = 160, C = H.layer(QW, H_), c = C.getContext('2d'), img = c.createImageData(QW, H_), d = img.data;
      const nz = H.makeNoise(21), r = H.rng(314), cols = QW / P, rows = Math.ceil(H_ / P) + 1, pick = [];
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { let k; do { k = r.int(0, PRINTS.length - 1); } while ((i > 0 && pick[j * cols + i - 1] === k) || (j > 0 && pick[(j - 1) * cols + i] === k)); pick.push(k); }
      const grain = H.rng(9), lnz = H.makeNoise(77);
      for (let y = 0; y < H_; y++) {
        const yy = y + 30, j = Math.floor(yy / P), v = yy - j * P;
        // broad uneven light, periodic over the 2560px tile (sampled on a cylinder so the tile wrap has no seam), every 8px
        if (y % 8 === 0) { // coarse 8px grid rows, blended vertically below
          FX.lg0 = FX.lg1 || null; FX.lg1 = []; const y8 = y + 8;
          for (let x = 0; x <= QW; x += 8) { const a = (x / QW) * TAU; FX.lg1.push(0.85 + 0.15 * lnz.fbm3(Math.cos(a) * 0.9, Math.sin(a) * 0.9, y8 * 0.0035, 3)); }
          if (!FX.lg0) { FX.lg0 = []; for (let x = 0; x <= QW; x += 8) { const a = (x / QW) * TAU; FX.lg0.push(0.85 + 0.15 * lnz.fbm3(Math.cos(a) * 0.9, Math.sin(a) * 0.9, y * 0.0035, 3)); } }
        }
        const yt = (y % 8) / 8, lrow = FX.lg0.map((v, q) => v + (FX.lg1[q] - v) * yt);
        for (let x = 0; x < QW; x++) {
          const i = Math.floor(x / P), u = x - i * P, pr = PRINTS[pick[j * cols + i]];
          const col = H.mix(printCol(pr, Math.max(0, u + nz.n2(x * 0.02, y * 0.02) * 1.2), Math.max(0, v + nz.n2(x * 0.02 + 9, y * 0.02) * 1.2)), [214, 200, 178], 0.3);
          const wx = x % 3, wy = y % 3, over = (Math.floor(x / 3) + Math.floor(y / 3)) & 1;
          const wv = 1 + (over ? (wx === 1 ? 0.05 : -0.02) : (wy === 1 ? 0.05 : -0.02)) - (wx === 0 && wy === 0 ? 0.06 : 0) + (grain() - 0.5) * 0.06;
          const e = Math.min(u, P - u, v, P - v), puff = 0.93 - 0.36 * Math.exp(-e / 14) + (0.08 * (P / 2 - u + (P / 2 - v))) / P, seam = Math.exp(-(e * e) / 2.5) * 0.45;
          const lq = x >> 3, lf = lrow[lq] + ((lrow[lq + 1] ?? lrow[0]) - lrow[lq]) * ((x & 7) / 8);
          const s = wv * puff * (1 - seam) * lf, k = (y * QW + x) * 4;
          d[k] = col[0] * s; d[k + 1] = col[1] * s; d[k + 2] = col[2] * s; d[k + 3] = 255;
        }
      }
      c.putImageData(img, 0, 0);
      for (let gx = 9; gx < QW; gx += P) frun(c, [[gx, -10], [gx, H_ + 10]], '#f4ead6', 10, 7, 2.4);
      for (let gy = -21; gy < H_ + P; gy += P) frun(c, [[-10, gy], [QW + 10, gy]], '#f4ead6', 10, 7, 2.4);
      FX.quilt = C;
    }
    const qx = -(cam % 2560);
    ctx.drawImage(FX.quilt, qx, 0); ctx.drawImage(FX.quilt, qx + 2560, 0);

    ctx.save(); ctx.translate(-cam, 0); // ======== world ========

    // ---- BEAT 1: felt letters dropped on ----
    {
      const cols = ['#d9564a', '#2f5f9a', '#e8b04a', '#6fb3a6', '#ef9aa6'];
      const line = (str, px, y, st, off) => {
        const m = H.layer(4, 4).getContext('2d'); m.font = `700 ${px}px "Fredoka"`;
        let x = 640 - (m.measureText(str).width + str.length * 6) / 2, i = 0;
        for (const ch of str) { const w = m.measureText(ch).width; if (ch !== ' ') put(feltText('L' + ch + px + (i + off) % 5, ch, px, cols[(i + off) % 5]), x, y, st + i * 0.07, { rot: (H.rng(i + off)() - 0.5) * 0.12 }); x += w + 6; i++; }
      };
      // felt backing ovals the letters sit on
      put(feltSpr('b1back', circPts(330, 150, 330, 150, 120, 0.03, 1), '#f3ecdc', 660, 300), 310, 150, 0.0, { sb: 16 });
      line('How does', 100, 178, 0.15, 0);
      line('AI learn?', 116, 296, 0.75, 2);
      // blanket stitch around the backing, sewn on
      const bp = prog(0.4, 1.8), ring = circPts(640, 300, 340, 160, 160, 0.03, 1);
      for (let i = 0; i < ring.length * bp; i += 2) { const [x, y] = ring[i], dx = x - 640, dy = y - 300, d = Math.hypot(dx / 340, dy / 160) || 1, ux = dx / 340 / d, uy = dy / 160 / d, n = Math.hypot(ux, uy); fthread(ctx, x - (ux / n) * 14, y - (uy / n) * 14, x + (ux / n) * 2, y + (uy / n) * 2, '#c8443a', 2.6); if (i > 1) fthread(ctx, ring[i - 2][0], ring[i - 2][1], x, y, '#c8443a', 2.6); }
    }

    // ---- BEAT 2: labelled patches slide along a stitched path into the felt brain ----
    const BX = 2350, BY = 380; // brain centre (world)
    const brain = feltSpr('brain', (() => { const pts = []; for (let i = 0; i < 100; i++) { const a = (i / 100) * TAU, k = 1 + 0.08 * Math.sin(a * 7) + 0.04 * Math.sin(a * 13); pts.push([150 + Math.cos(a) * 145 * k, 115 + Math.sin(a) * 112 * k]); } return pts; })(), '#e9879a', 300, 230,
      (c) => { [[[150, 10], [150, 220]], [[60, 70], [100, 95], [80, 130], [110, 165]], [[200, 60], [240, 85], [215, 120], [250, 150]], [[105, 40], [125, 75]], [[185, 175], [215, 200]], [[40, 120], [70, 150]]].forEach((ln) => frun(c, ln, '#a8455c', 9, 5, 2.4)); });
    put(brain, BX - 150, BY - 115, 2.3, { sb: 20, sx: 8, sy: 12 });
    put(tagSpr('model', 34), BX - 70, BY + 140, 2.6, { rot: -0.05 });
    // buttons = the model's knobs (thread X turns when it adjusts)
    const turn = H.ease.inOut(prog(8.9, 9.6));
    [[-80, '#e8b04a'], [0, '#6fb3a6'], [80, '#d9564a']].forEach(([dx, col], i) => {
      const x = BX + dx, y = BY + 222, R = 30, st = 2.5 + i * 0.1;
      if (t < st) return;
      const s = Math.max(0.15, H.ease.back(prog(st, st + 0.35))), rgb = hx(col);
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.shadowColor = 'rgba(40,20,10,0.5)'; ctx.shadowBlur = 8; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 5;
      const g = ctx.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R); g.addColorStop(0, H.rgba(rgb.map((v) => Math.min(255, v * 1.25 + 20)))); g.addColorStop(0.7, H.rgba(rgb)); g.addColorStop(1, H.rgba(rgb.map((v) => v * 0.7)));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); ctx.restore();
      if (s < 0.99) return;
      ctx.strokeStyle = H.rgba(rgb.map((v) => v * 0.6), 0.6); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, R * 0.72, 0, TAU); ctx.stroke();
      const a = [0.2, 0.9, -0.4][i] + [1.4, -1.1, 1.6][i] * turn, hs = R * 0.3;
      const hp = [0, 1, 2, 3].map((k) => [x + Math.cos(a + k * Math.PI / 2 + Math.PI / 4) * hs, y + Math.sin(a + k * Math.PI / 2 + Math.PI / 4) * hs]);
      fthread(ctx, hp[0][0], hp[0][1], hp[2][0], hp[2][1], '#f4ead2', 3); fthread(ctx, hp[1][0], hp[1][1], hp[3][0], hp[3][1], '#f4ead2', 3);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(x - R * 0.45, y - R * 0.5, R * 0.18, R * 0.08, -0.6, 0, TAU); ctx.fill();
    });
    // example patches
    const patch = (kind) => FX['patch' + kind] || (FX['patch' + kind] = (() => {
      const cat = kind === 'cat';
      const base = feltSpr('pbase' + kind, [[0, 0], [150, 0], [150, 150], [0, 150]], cat ? '#9fc6d6' : '#f1d27a', 150, 150, (c) => {
        const head = cat ? [[30, 70], [38, 22], [62, 48], [88, 48], [112, 22], [120, 70], [112, 105], [75, 122], [38, 105]] : circPts(75, 75, 46, 42, 60, 0.02, 3);
        c.save(); c.shadowColor = 'rgba(40,20,10,0.4)'; c.shadowBlur = 5; c.shadowOffsetX = 2; c.shadowOffsetY = 3;
        c.beginPath(); head.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fillStyle = cat ? '#f08a3c' : '#a8673c'; c.fill();
        if (!cat) { c.fillStyle = '#6e4428'; c.beginPath(); c.ellipse(32, 72, 13, 30, 0.25, 0, TAU); c.fill(); c.beginPath(); c.ellipse(118, 72, 13, 30, -0.25, 0, TAU); c.fill(); }
        c.restore();
        c.fillStyle = '#2a2433'; [[60, 70], [90, 70]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 5.5, 0, TAU); c.fill(); });
        c.fillStyle = cat ? '#e0607a' : '#2a2433'; c.beginPath(); c.ellipse(75, 88, 7, 5, 0, 0, TAU); c.fill();
        frun(c, [[8, 8], [142, 8], [142, 142], [8, 142], [8, 8]], '#f4ead2', 8, 5, 2);
      });
      const tg = tagSpr(kind, 30, cat ? '#c8443a' : '#2f5f9a');
      const C = H.layer(base.width, base.height + 50), c = C.getContext('2d');
      c.drawImage(base, 0, 0);
      c.save(); c.shadowColor = 'rgba(40,20,10,0.4)'; c.shadowBlur = 4; c.shadowOffsetX = 2; c.shadowOffsetY = 3; c.translate(base.pad + 75, base.pad + 150); c.rotate(-0.04); c.drawImage(tg, -tg.width / 2, -tg.height / 2); c.restore();
      C.pad = base.pad; C.w = 150; C.h = 190;
      return C;
    })());
    if (t < 6.4) {
      // counter: felt digit tiles re-cut as the number climbs
      if (t >= 2.45) {
        const n = Math.round(1e6 * Math.pow(prog(2.7, 5.1), 2)), str = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        let x = 1280 + 50;
        put(feltSpr('cback', [[0, 6], [440, 0], [446, 118], [4, 124]], '#2f4f7a', 446, 124, (c) => frun(c, [[10, 14], [434, 9], [438, 112], [12, 116], [10, 14]], '#f4ead2', 8, 5, 2)), 1310, 72, 2.4, { sb: 12 });
        for (const ch of str) { const s = feltText('D' + ch, ch, 96, '#e8b04a'); put(s, x, 70, 2.45); x += s.w - 6; }
        put(tagSpr('examples', 36, '#3f8c86'), x + 18, 104, 2.6);
      }
      farrow(ctx, fcurve(1300, 250, 1650, 205, 2140, 270), '#c8443a', prog(2.6, 3.4));
      const KINDS = ['cat', 'dog', 'dog', 'cat', 'dog', 'cat', 'cat', 'dog'];
      KINDS.forEach((k, i) => {
        const s0 = 2.55 + i * 0.36, x = 1160 + (t - s0) * 640;
        if (t < s0 || x > BX - 110) return;
        const sh = H.clamp((BX - 110 - x) / 130);
        ctx.save(); ctx.shadowColor = 'rgba(40,20,10,0.45)'; ctx.shadowBlur = 12; ctx.shadowOffsetX = 6; ctx.shadowOffsetY = 9;
        const p = patch(k); ctx.translate(x + 75, 390 + 95); ctx.rotate(Math.sin(t * 6 + i) * 0.03); ctx.scale(sh, sh); ctx.drawImage(p, -75 - p.pad, -95 - p.pad); ctx.restore();
      });
      // brain re-drawn on top so patches go "into" it
      if (t > 2.75) { ctx.save(); ctx.shadowColor = 'rgba(40,20,10,0.4)'; ctx.shadowBlur = 20; ctx.shadowOffsetX = 8; ctx.shadowOffsetY = 12; ctx.drawImage(brain, BX - 150 - brain.pad, BY - 115 - brain.pad); ctx.restore(); }
    }

    // ---- BEAT 3: guess -> check -> adjust (a stitched loop) ----
    if (t > 5.9) {
      put(patch('cat'), 2000, 300, 6.25, { rot: -0.04 });
      put(tagSpr('new photo', 28), 1990, 255, 6.4, { rot: -0.05 });
      farrow(ctx, [[2160, 400], [2196, 400]], '#c8443a', prog(6.5, 6.7));
      farrow(ctx, fcurve(2510, 330, 2600, 280, 2700, 320), '#c8443a', prog(6.8, 7.2));
      put(tagSpr('Guess', 36), 2540, 210, 7.0, { rot: -0.06 });
      const bub = feltSpr('bub', (() => { const pts = []; for (let i = 0; i <= 80; i++) { const a = 0.62 * Math.PI + (i / 80) * (2 * Math.PI - 0.22 * Math.PI); pts.push([185 + Math.cos(a) * 180, 105 + Math.sin(a) * 100]); } pts.push([55, 236]); return pts; })(), '#f6f1e7', 370, 240);
      const wrong = t < 9.55, shake = t > 7.9 && t < 8.35 ? Math.sin(t * 70) * 7 : 0;
      put(bub, 2740 + shake, 220, 7.25, { sb: 14 });
      const ans = wrong ? feltText('Tdog', 'dog?', 104, '#2f5f9a') : feltText('Tcat', 'cat', 112, '#4f9a52');
      put(ans, 2925 - ans.w / 2 + shake, 262, wrong ? 7.45 : 9.6);
      if (wrong && t > 7.85) { // emphasis: red X + blanket-stitch ring sewn around the wrong guess
        const xr = prog(7.85, 8.05);
        if (xr > 0) { fsatin(ctx, 3060, 200, 3060 + 80 * xr, 200 + 80 * xr, '#c8443a', 14); if (xr > 0.5) fsatin(ctx, 3140, 200, 3140 - 80 * (xr - 0.5) * 2, 200 + 80 * (xr - 0.5) * 2, '#c8443a', 14); }
        const ring = circPts(2925, 330, 225, 140, 120, 0.02, 9), rp = prog(7.9, 8.4);
        for (let i = 0; i < ring.length * rp; i += 2) { const [x, y] = ring[i]; const dx = x - 2925, dy = y - 330, d = Math.hypot(dx, dy); fthread(ctx, x - (dx / d) * 12, y - (dy / d) * 12, x, y, '#c8443a', 2.6); if (i > 1) fthread(ctx, ring[i - 2][0], ring[i - 2][1], x, y, '#c8443a', 2.6); }
        put(tagSpr('Check', 38, '#c8443a'), 2840, 485, 8.05, { rot: 0.05 });
        farrow(ctx, fcurve(2860, 540, 2700, 660, 2480, 610), '#c8443a', prog(8.35, 8.85));
        put(tagSpr('Adjust', 38, '#c8443a'), 2560, 640, 8.7, { rot: -0.03 });
      }
      if (!wrong) { const vr = prog(9.85, 10.05); if (vr > 0) { fsatin(ctx, 3070, 240, 3070 + 26 * Math.min(1, vr * 2), 240 + 26 * Math.min(1, vr * 2), '#4f9a52', 14); if (vr > 0.5) fsatin(ctx, 3096, 266, 3096 + 60 * (vr - 0.5) * 2, 266 - 70 * (vr - 0.5) * 2, '#4f9a52', 14); } }
    }

    // ---- BEAT 4: felt bar chart, buttons on top, accuracy counts up ----
    if (t > 9.9) {
      const OXw = 3600, base = 600, accs = [61, 72, 80, 86, 90, 93, 95, 97], cols = ['#e8b04a', '#6fb3a6'];
      let shown = 61;
      frun(ctx, [[OXw, base + 8], [OXw + 760, base + 8]], '#3d3548', 14, 7, 3.4, prog(10.5, 11.0));
      accs.forEach((a, i) => {
        const st = 10.65 + i * 0.25, hgt = Math.round(a * 3.6);
        const bar = feltSpr('bar' + i, [[0, 0], [62, 0], [62, hgt], [0, hgt]], i === 7 ? '#d9564a' : cols[i % 2], 62, hgt, (c) => frun(c, [[8, 8], [54, 8], [54, hgt - 6], [8, hgt - 6], [8, 8]], '#f4ead2', 7, 5, 1.8));
        put(bar, OXw + 30 + i * 90, base - hgt, st, { sb: 12 });
        if (t >= st) shown = H.lerp(i ? accs[i - 1] : 61, a, prog(st, st + 0.25));
      });
      put(tagSpr('Accuracy', 44, '#3f8c86'), 3320, 140, 10.45, { rot: -0.03 });
      const str = Math.round(shown) + '%', hot = t > 12.6;
      const bounce = hot ? 1 + 0.18 * Math.sin(prog(12.6, 12.95) * Math.PI) : 1;
      let x = 3315;
      ctx.save(); ctx.translate(3430, 290); ctx.scale(bounce, bounce); ctx.translate(-3430, -290);
      { const s = feltText('A' + str + hot, str, 130, hot ? '#d9564a' : '#2f5f9a', undefined, { back: '#f4ecdc' }); put(s, x, 225, 10.5, { sb: 18, sx: 6, sy: 10 }); }
      ctx.restore();
      if (hot) { const star = feltSpr('star', Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i / 10) * TAU, r = i % 2 ? 26 : 60; return [62 + Math.cos(a) * r, 62 + Math.sin(a) * r]; }), '#e8b04a', 124, 124, (c) => frun(c, Array.from({ length: 11 }, (_, i) => { const a = -Math.PI / 2 + (i / 10) * TAU, r = i % 2 ? 16 : 40; return [62 + Math.cos(a) * r, 62 + Math.sin(a) * r]; }), '#c8443a', 5, 4, 1.8)); put(star, OXw + 30 + 7 * 90 - 30, base - 97 * 3.6 - 130, 12.6, { rot: 0.1 }); }
      put(tagSpr('training rounds', 32), 3830, 622, 11.0);
    }
    ctx.restore(); // ======== end world ========

    // header tag + takeaway (screen space)
    put(tagSpr('How does AI learn?', 30), 24, 16, 2.25, { rot: -0.02 });
    if (t >= 13.0) {
      const tg = tagSpr('More examples  →  better guesses', 46, '#2f5f9a');
      put(tg, 640 - tg.w / 2, 600, 13.0, { sb: 16, rot: -0.01 });
    }
    // studio light + grain
    ctx.save(); ctx.globalCompositeOperation = 'soft-light';
    const lg = ctx.createRadialGradient(380 + t * 10, 190, 60, 600, 360, 900); lg.addColorStop(0, 'rgba(255,245,220,0.6)'); lg.addColorStop(1, 'rgba(30,20,10,0.62)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H_); ctx.restore();
    H.vignette(ctx, W, H_, 0.55, '35,20,10');
    H.grain(ctx, W, H_, 0.025, 6 + Math.floor(t * 12));
  };

  registerStyle({
    id: 'felt-quilt',
    name: 'Felt & Patchwork',
    category: 'Paper & Craft',
    description: 'A cosy patchwork quilt of cotton prints with puffy quilted squares, topped with fuzzy felt appliqué edged in blanket stitch, button "nodes" sewn on and joined by running-stitch thread, plus an embroidered label.',
    motion: 'Thread draws itself stitch by stitch between the buttons, felt pieces drop on with a soft squash, and the quilt breathes with a slow puff of the padding.',
    fonts: ['700 42px "Fredoka"'],
    frameT: 4.8,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'The camera pans along one long patchwork quilt; felt pieces drop on with a lifted shadow and soft squash, arrows and emphasis rings are thread sewn on stitch by stitch, labels are woven tags stitched onto what they name, the counter is cut felt digits swapped as it climbs, and the model\'s weights are buttons whose thread-X turns when it adjusts.',
    explainer(ctx, W, H_, t) { EXPLAIN(ctx, W, H_, t); },
    // Sound: felt and buttons on a quilt. Felt pieces fall in with a lifted shadow and land as a soft, dull "fump" at
    // the moment they touch (put(): squash starts at u = 0.45 of 0.45 s, so st + 0.2); thread sewn stitch by stitch is
    // a needle through thick felt with the thread drawn after it (one pass about every 0.12 s); buttons click on as
    // small wooden toks; the camera pans are the quilt drawn across the table. Times mirror EXPLAIN() above.
    explainerSound(k) {
      const LAND = 0.2;
      const seg = (t, a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
      const cam = (t) => 1280 * seg(t, 1.9, 2.6) + 700 * seg(t, 5.6, 6.3) + 1300 * seg(t, 10.0, 10.7);
      const pan = (wx, t) => H.clamp(((wx - cam(t)) / 1280) * 2 - 1, -1, 1) * 0.6;
      let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const fump = (t, g = 1, p = 0, minor = true) => { // felt landing on quilted cotton: soft and dull
        k.noise(t, { dur: 0.09, color: 'brown', filter: 'lowpass', f: 420, gain: 0.42 * g, a: 0.006, pan: p, minor });
        k.noise(t, { dur: 0.05, color: 'pink', filter: 'bandpass', f: 700, q: 0.8, gain: 0.1 * g, a: 0.004, pan: p, minor });
        k.tone(t, { f: [[0, 120], [0.07, 70]], dur: 0.09, gain: 0.12 * g, pan: p, minor });
      };
      const pass = (t, g = 1, p = 0, minor = true) => { // needle through felt, thread drawn after it
        k.noise(t, { dur: 0.025, filter: 'bandpass', f: 800, q: 1.3, gain: 0.26 * g, a: 0.002, pan: p, minor });
        const pd = 0.07 + rnd() * 0.03;
        k.noise(t + 0.03, { dur: pd, filter: 'bandpass', f: [[0, 1400], [pd, 950]], q: 0.9, gain: 0.15 * g, a: pd * 0.6, pan: p, minor });
      };
      const sew = (t0, t1, g, p0, p1) => { for (let t = t0; t < t1 - 0.03; t += 0.115 + rnd() * 0.02) pass(t, g, p0 + (p1 - p0) * ((t - t0) / (t1 - t0))); };
      const button = (t, g = 1, p = 0, minor = true) => { k.play('tock', t, { f: 520, gain: 0.8 * g, pan: p, minor }); k.noise(t, { dur: 0.04, color: 'brown', filter: 'lowpass', f: 500, gain: 0.2 * g, pan: p, minor }); };
      const drag = (t, d, g = 1) => { // the quilt drawn along the table
        k.noise(t, { dur: d + 0.1, color: 'pink', filter: 'bandpass', f: [[0, 320], [d * 0.5, 700], [d + 0.1, 320]], q: 0.6, gain: 0.1 * g, a: d * 0.45 });
        k.noise(t, { dur: d + 0.1, color: 'brown', filter: 'lowpass', f: 280, gain: 0.075 * g, a: d * 0.5 });
      };

      k.bed('room', 0, 15, { gain: 0.4 });
      k.music('pad', 0.2, 14.8, { bpm: 62, gain: 0.22, chords: [['C3', 'E3', 'G3', 'D4'], ['A2', 'E3', 'G3', 'C4'], ['F2', 'A2', 'C3', 'G3'], ['G2', 'B2', 'D3', 'A3']] });

      // BEAT 1: backing oval, felt letters dropped on (0.15 + i*0.07, 0.75 + i*0.07), blanket stitch sewn round (0.4..1.8)
      fump(0.0 + LAND, 1.1, 0, false);
      {
        const ts = [];
        [...'How does'].forEach((ch, i) => ch !== ' ' && ts.push([0.15 + i * 0.07 + LAND, i / 8]));
        [...'AI learn?'].forEach((ch, i) => ch !== ' ' && ts.push([0.75 + i * 0.07 + LAND, i / 9]));
        let last = -1; ts.forEach(([t, u]) => { if (t - last >= 0.09) { fump(t, 0.55, (u - 0.5) * 0.8); last = t; } });
      }
      sew(0.4, 1.8, 0.6, -0.4, 0.4);

      // BEAT 2
      drag(1.9, 0.7, 1);
      fump(2.25 + LAND, 0.5, -0.8); // header tag
      fump(2.3 + LAND, 1.3, pan(2350, 2.5), false); // the felt brain
      fump(2.4 + LAND, 0.8, pan(1530, 2.6)); fump(2.45 + LAND, 0.6, pan(1500, 2.65)); // counter backing + digits
      [0, 1, 2].forEach((i) => button(2.5 + i * 0.1 + 0.13, 0.8, pan(2270 + i * 80, 2.7))); // buttons
      fump(2.6 + LAND, 0.55, pan(2280, 2.8)); // 'model' + 'examples' tags
      sew(2.6, 3.4, 0.75, pan(1300, 2.6), pan(2140, 3.4)); // red thread arrow
      for (let i = 0; i < 8; i++) { const tin = 2.55 + i * 0.36 + (2350 - 110 - 1160) / 640; fump(tin, 0.4, pan(2240, tin)); } // patches tucked into the brain
      { // counter: felt digits swapped as n = 1e6 * prog(2.7, 5.1)^2 climbs
        for (let t = 2.78; t < 5.04;) { const s = H.clamp((t - 2.7) / 2.4); k.noise(t, { dur: 0.04, color: 'brown', filter: 'lowpass', f: 600, gain: 0.3, a: 0.002, pan: pan(1500, t), minor: true }); k.noise(t, { dur: 0.02, filter: 'bandpass', f: 1100, q: 1.2, gain: 0.1, a: 0.001, pan: pan(1500, t), minor: true }); t += 0.15 - 0.06 * s; }
        fump(5.1, 1.0, pan(1500, 5.1), false); button(5.1, 0.6, pan(1500, 5.1));
      }

      // BEAT 3
      drag(5.6, 0.7, 0.8);
      fump(6.25 + LAND, 1.0, pan(2075, 6.45), false); // new cat patch
      fump(6.4 + LAND, 0.5, pan(2050, 6.6));
      sew(6.5, 6.7, 0.7, pan(2160, 6.5), pan(2196, 6.7));
      sew(6.8, 7.2, 0.7, pan(2510, 6.8), pan(2700, 7.2));
      fump(7.0 + LAND, 0.5, pan(2580, 7.2)); // 'Guess'
      fump(7.25 + LAND, 0.9, pan(2925, 7.45)); // bubble
      fump(7.45 + LAND, 0.75, pan(2925, 7.65)); // 'dog?'
      // wrong guess (7.85): thick red thread yanked through as an X, a blanket-stitch ring sewn round it, the bubble jiggles
      k.noise(7.85, { dur: 0.2, filter: 'bandpass', f: [[0, 1500], [0.2, 700]], q: 0.8, gain: 0.32, a: 0.01, pan: pan(3100, 7.9) });
      k.play('thud', 7.86, { f: 110, gain: 0.6, pan: pan(3000, 7.9) });
      k.tone(7.88, { f: 'D3', type: 'triangle', dur: 0.16, gain: 0.2, filter: 'lowpass', f2: 700 });
      k.tone(8.04, { f: 'A2', type: 'triangle', dur: 0.32, gain: 0.22, filter: 'lowpass', f2: 600 });
      sew(8.1, 8.4, 0.6, 0.3, 0.6);
      fump(8.05 + LAND, 0.55, pan(2900, 8.25)); // 'Check'
      sew(8.35, 8.85, 0.75, pan(2860, 8.35), pan(2480, 8.85)); // red thread arrow back to the buttons
      fump(8.7 + LAND, 0.55, pan(2620, 8.9)); // 'Adjust'
      for (let i = 1; i <= 5; i++) { let t = 8.9; while (seg(t, 8.9, 9.6) < i / 5 - 1e-6) t += 0.005; button(t, 0.45, pan(2350, t)); } // buttons twist
      // correction: 'cat' dropped on, green check sewn (9.85..10.05)
      fump(9.6 + LAND, 1.0, pan(2925, 9.8), false);
      pass(9.85, 0.9, pan(3090, 9.9), false); pass(9.97, 0.7, pan(3110, 10));
      k.play('success', 9.86, { f: 'G5', gain: 0.45, pan: pan(3090, 9.9) });

      // BEAT 4
      drag(10.0, 0.7, 1);
      fump(10.45 + LAND, 0.55, pan(3420, 10.65)); fump(10.5 + LAND, 0.8, pan(3420, 10.7)); // 'Accuracy' tag + % digits
      sew(10.5, 11.0, 0.5, pan(3600, 10.5), pan(4360, 11.0)); // axis thread
      fump(11.0 + LAND, 0.45, pan(3950, 11.2)); // 'training rounds'
      for (let i = 0; i < 8; i++) fump(10.65 + i * 0.25 + LAND, 0.6 + i * 0.04, pan(3660 + i * 90, 11 + i * 0.25)); // felt bars
      { // % digits swapped as `shown` climbs, at most ~7/s
        const accs = [61, 72, 80, 86, 90, 93, 95, 97];
        let last = -1, lt = -1;
        for (let t = 10.66; t < 12.6; t += 1 / 120) {
          const i = Math.min(7, Math.floor((t - 10.65) / 0.25)), st = 10.65 + i * 0.25;
          const v = Math.round(H.lerp(i ? accs[i - 1] : 61, accs[i], H.clamp((t - st) / 0.25)));
          if (v !== last && t - lt >= 0.14) { k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1000, q: 1.2, gain: 0.16, a: 0.001, pan: -0.5, minor: true }); last = v; lt = t; }
        }
      }
      // 97% (12.6): number turns red and bounces, a felt star drops on top: biggest hit
      k.play('impact', 12.6, { gain: 1.55, pan: -0.2 });
      k.play('ding', 12.6, { f: 'E5', gain: 0.6, pan: -0.1 });
      fump(12.6 + LAND, 1.6, pan(4230, 12.8), false);
      button(12.6 + LAND, 0.5, pan(4230, 12.8));

      // BEAT 5: takeaway label drops on and resolves
      fump(13.0 + LAND, 1.3, 0, false);
      ['C4', 'G4', 'E5'].forEach((f, i) => k.play('ding', 13.32 + i * 0.09, { f, gain: 0.38 - i * 0.03, pan: (i - 1) * 0.25 }));
    },
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(21), r = H.rng(314);
      const P = 160, OY = -30, OX = -40;
      const breathe = 1 + 0.12 * Math.sin(t * 1.4 - 1.5);
      const prog = (a, b) => H.clamp((t - a) / (b - a));

      // ---------- quilt: per-pixel cotton prints, weave, puff & seams ----------
      // The static part (print colour x weave x broad light falloff) and the puff/seam terms are cached per size;
      // each frame only re-applies the breathing puff.
      {
        const key = W + 'x' + H_;
        if (!HQ.key || HQ.key !== key) {
          const N = W * H_, base = new Float32Array(N * 3), A = new Float32Array(N), B = new Float32Array(N);
          const cols = Math.ceil((W - OX) / P) + 1, rows = Math.ceil((H_ - OY) / P) + 1;
          const pick = [];
          for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
            let k;
            do { k = r.int(0, PRINTS.length - 1); } while ((i > 0 && pick[j * cols + i - 1] === k) || (j > 0 && pick[(j - 1) * cols + i] === k));
            pick.push(k);
          }
          const grain = H.rng(9), lnz = H.makeNoise(77);
          for (let y = 0; y < H_; y++) {
            const yy = y - OY, j = Math.floor(yy / P), v = yy - j * P;
            // broad, uneven light across the quilt (a real quilt never lies perfectly flat or evenly lit), sampled every 8px
            const lrow = []; for (let x = 0; x <= W + 8; x += 8) lrow.push(0.9 + 0.1 * lnz.fbm2(x * 0.0022, y * 0.0035, 3));
            for (let x = 0; x < W; x++) {
              const xx = x - OX, i = Math.floor(xx / P), u = xx - i * P;
              const pr = PRINTS[pick[j * cols + i]];
              // slight fabric wobble in the print
              const wu = u + nz.n2(x * 0.02, y * 0.02) * 1.2, wv = v + nz.n2(x * 0.02 + 9, y * 0.02) * 1.2;
              const c = H.mix(printCol(pr, Math.max(0, wu), Math.max(0, wv)), [214, 200, 178], 0.3);
              // plain weave: warp/weft over-under
              const wx = x % 3, wy = y % 3, over = ((Math.floor(x / 3) + Math.floor(y / 3)) & 1);
              let wv2 = 1 + (over ? (wx === 1 ? 0.05 : -0.02) : (wy === 1 ? 0.05 : -0.02)) - (wx === 0 && wy === 0 ? 0.06 : 0);
              wv2 += (grain() - 0.5) * 0.06;
              const lq = x >> 3, lt = (x & 7) / 8, m = wv2 * (lrow[lq] + (lrow[lq + 1] - lrow[lq]) * lt), n = y * W + x;
              base[n * 3] = c[0] * m; base[n * 3 + 1] = c[1] * m; base[n * 3 + 2] = c[2] * m;
              // puff: pillowy patches, lit from top-left, sinking into seams
              const eu = Math.min(u, P - u), ev = Math.min(v, P - v), e = Math.min(eu, ev);
              const seam = Math.exp(-(e * e) / 2.5) * 0.45;
              A[n] = (0.95 + 0.08 * ((P / 2 - u) + (P / 2 - v)) / P) * (1 - seam);
              B[n] = 0.36 * Math.exp(-e / 14) * (1 - seam);
            }
          }
          HQ.key = key; HQ.base = base; HQ.A = A; HQ.B = B;
        }
        const img = ctx.createImageData(W, H_), d = img.data, base = HQ.base, A = HQ.A, B = HQ.B;
        for (let n = 0, N = W * H_; n < N; n++) {
          const s = A[n] - B[n] * breathe, k = n * 4, b = n * 3;
          d[k] = base[b] * s; d[k + 1] = base[b + 1] * s; d[k + 2] = base[b + 2] * s; d[k + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }

      // ---------- thread helpers ----------
      const walk = (pts, step, fn) => {
        // walk along polyline, calling fn(x,y,angle,dist)
        let acc = 0, next = 0;
        for (let i = 0; i < pts.length - 1; i++) {
          const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay), a = Math.atan2(by - ay, bx - ax);
          while (next <= acc + L) { const u = (next - acc) / L; fn(ax + (bx - ax) * u, ay + (by - ay) * u, a, next); next += step; }
          acc += L;
        }
      };
      const threadSeg = (x0, y0, x1, y1, col, w = 2.4) => {
        const rgb = hx(col);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(40,25,15,0.38)'; ctx.lineWidth = w + 1.2;
        ctx.beginPath(); ctx.moveTo(x0 + 0.8, y0 + 1.2); ctx.lineTo(x1 + 0.8, y1 + 1.2); ctx.stroke();
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, H.rgba(rgb.map((v) => v * 0.65))); g.addColorStop(0.5, H.rgba(rgb.map((v) => Math.min(255, v * 1.1 + 10)))); g.addColorStop(1, H.rgba(rgb.map((v) => v * 0.65)));
        ctx.strokeStyle = g; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.7;
        const nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1;
        ctx.beginPath(); ctx.moveTo(x0 * 0.8 + x1 * 0.2 - (nx / L) * 0.5, y0 * 0.8 + y1 * 0.2 - (ny / L) * 0.5); ctx.lineTo(x0 * 0.3 + x1 * 0.7 - (nx / L) * 0.5, y0 * 0.3 + y1 * 0.7 - (ny / L) * 0.5); ctx.stroke();
        // holes where thread enters the cloth
        ctx.fillStyle = 'rgba(30,15,10,0.45)';
        ctx.beginPath(); ctx.arc(x0, y0, 1.1, 0, TAU); ctx.arc(x1, y1, 1.1, 0, TAU); ctx.fill();
      };
      const running = (pts, col, len = 9, gap = 6, w = 2.4, pr = 1) => {
        if (pr <= 0) return;
        let start = null, total = 0;
        for (let i = 0; i < pts.length - 1; i++) total += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
        walk(pts, (len + gap) / 2, (x, y, a, dd) => {
          const k = Math.round(dd / ((len + gap) / 2));
          if (dd > total * pr) return;
          if (k % 2 === 0) start = [x, y]; else if (start) { threadSeg(start[0], start[1], start[0] + Math.cos(a) * len, start[1] + Math.sin(a) * len, col, w); start = null; }
        });
      };

      // quilting: running stitches echoing every seam
      {
        for (let gx = OX; gx < W + P; gx += P) for (const off of [9]) {
          const pts = [[gx + off, -10], [gx + off, H_ + 10]];
          running(pts, '#f4ead6', 10, 7, 2.4);
        }
        for (let gy = OY; gy < H_ + P; gy += P) for (const off of [9]) {
          const pts = [[-10, gy + off], [W + 10, gy + off]];
          running(pts, '#f4ead6', 10, 7, 2.4);
        }
      }

      // ---------- felt appliqué ----------
      const ftex = feltTex(55), fpat = ctx.createPattern(ftex, 'repeat');
      const felt = (pts, col, o = {}) => {
        if (o.at != null && t < o.at) return;
        // layer sized to the piece (not the whole frame) to keep the fuzz/blur passes cheap
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
        const LX = Math.floor(x0) - 24, LY = Math.floor(y0) - 24, L = H.layer(Math.ceil(x1 - LX) + 24, Math.ceil(y1 - LY) + 24), c = L.getContext('2d');
        c.translate(-LX, -LY);
        const path = (cc) => { cc.beginPath(); pts.forEach(([x, y], i) => (i ? cc.lineTo(x, y) : cc.moveTo(x, y))); cc.closePath(); };
        path(c); c.fillStyle = col; c.fill();
        // fuzzy fibres poking past the cut edge
        const fr = H.rng(o.seed || 3);
        c.lineCap = 'round';
        walk([...pts, pts[0]], 1.6, (x, y, a) => {
          const nx = Math.sin(a), ny = -Math.cos(a), l = fr.range(0.5, 2.6), tw = fr.range(-0.8, 0.8);
          c.strokeStyle = col; c.lineWidth = fr.range(0.5, 1.1);
          c.beginPath(); c.moveTo(x - nx * 1.5, y - ny * 1.5); c.lineTo(x + (nx + tw * ny) * l * (o.outward ?? 1), y + (ny - tw * nx) * l * (o.outward ?? 1)); c.stroke();
        });
        c.save(); c.globalCompositeOperation = 'source-atop';
        fpat.setTransform(new DOMMatrix().translateSelf(fr() * 256, fr() * 256));
        c.fillStyle = fpat; c.fillRect(LX, LY, L.width, L.height);
        // soft rounded felt edge: darker rim, lighter top-left
        c.filter = 'blur(3px)'; c.lineWidth = 7; c.strokeStyle = 'rgba(0,0,0,0.22)'; path(c); c.stroke();
        c.translate(-2, -2); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.12)'; path(c); c.stroke();
        c.restore();
        // drop-on: falls in slightly large with a lifted shadow, squashes and settles
        const u = o.at == null ? 1 : H.clamp((t - o.at) / 0.5);
        const lift = 1 - H.ease.out(u);
        const sq = u < 1 ? Math.sin(Math.min(1, u * 1.6) * Math.PI) * 0.035 * (u > 0.45 ? 1 : 0) : 0;
        const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
        ctx.save(); ctx.shadowColor = `rgba(40,20,10,${0.45 - lift * 0.2})`; ctx.shadowBlur = (o.sb ?? 12) + lift * 30; ctx.shadowOffsetX = (o.sx ?? 4) + lift * 22; ctx.shadowOffsetY = (o.sy ?? 6) + lift * 30;
        ctx.globalAlpha = H.clamp(u * 5);
        ctx.translate(cx, cy - lift * 24); ctx.scale(1 + lift * 0.14 + sq, 1 + lift * 0.14 - sq); ctx.translate(-cx, -cy);
        ctx.drawImage(L, LX, LY); ctx.restore();
      };
      const circlePts = (cx, cy, R, n = 120, wob = 0.008, seed = 0) => Array.from({ length: n }, (_, i) => { const a = (i / n) * TAU; const k = 1 + nz.n2(Math.cos(a) + seed, Math.sin(a)) * wob; return [cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * k]; });
      const blobPts = (cx, cy, R, seed, amp, sx = 1, sy = 1, n = 70) => Array.from({ length: n }, (_, i) => { const a = (i / n) * TAU; const k = 1 + nz.fbm2(Math.cos(a) * 1.2 + seed, Math.sin(a) * 1.2 + seed, 3) * amp; return [cx + Math.cos(a) * R * k * sx, cy + Math.sin(a) * R * k * sy]; });

      const G = { x: 560, y: 368, R: 206 };
      // orbit ellipse thread (behind globe)
      const orbit = (a0, a1) => { const pts = []; for (let a = a0; a <= a1; a += 0.02) { const x = Math.cos(a) * 360, y = Math.sin(a) * 118, rr = -0.22; pts.push([G.x + x * Math.cos(rr) - y * Math.sin(rr), G.y + 10 + x * Math.sin(rr) + y * Math.cos(rr)]); } return pts; };
      running(orbit(Math.PI, TAU), '#f2c14e', 13, 8, 3.2, prog(1.6, 2.0));
      // globe
      const gpts = circlePts(G.x, G.y, G.R, 160, 0.01, 2);
      felt(gpts, '#2f5f9a', { seed: 5, sb: 24, sx: 9, sy: 14, at: 0.1 });
      // continents (green felt, running-stitched edges)
      const conts = [
        blobPts(G.x - 70, G.y - 60, 70, 3, 0.35, 1.0, 1.15), blobPts(G.x + 75, G.y + 40, 62, 8, 0.4, 0.9, 1.3), blobPts(G.x - 50, G.y + 110, 38, 12, 0.35, 1.3, 0.7), blobPts(G.x + 110, G.y - 110, 30, 17, 0.3, 1.2, 0.8),
      ];
      // clip continents to the globe disc
      const inside = (pts) => pts.map(([x, y]) => { const dx = x - G.x, dy = y - G.y, d = Math.hypot(dx, dy), m = G.R - 16; return d > m ? [G.x + (dx / d) * m, G.y + (dy / d) * m] : [x, y]; });
      conts.forEach((c0, i) => {
        const c = inside(c0);
        felt(c, i % 2 ? '#8dbb5e' : '#73a650', { seed: 30 + i, sb: 6, sx: 2.5, sy: 3.5, at: 0.55 + i * 0.13 });
        const inset = c.map(([x, y]) => { const cx = c.reduce((s, p) => s + p[0], 0) / c.length, cy = c.reduce((s, p) => s + p[1], 0) / c.length; const dx = x - cx, dy = y - cy, dd = Math.hypot(dx, dy) || 1; return [x - (dx / dd) * 7, y - (dy / dd) * 7]; });
        running([...inset, inset[0]], '#f2c14e', 8, 5, 2.5, prog(1.3 + i * 0.12, 1.9 + i * 0.12));
      });
      // blanket stitch around the globe
      {
        const n = gpts.length, step = 2;
        let prev = null;
        const bp = prog(0.9, 1.9);
        for (let i = 0; i < n * bp; i += step) {
          const [x, y] = gpts[i], dx = x - G.x, dy = y - G.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
          const ox = x + ux * 2, oy = y + uy * 2, ix = x - ux * 15, iy = y - uy * 15;
          if (prev) threadSeg(prev[0], prev[1], ox, oy, '#f4ead2', 2.8);
          threadSeg(ix, iy, ox, oy, '#f4ead2', 2.8);
          prev = [ox, oy];
        }
        if (bp >= 1) threadSeg(prev[0], prev[1], gpts[0][0] + ((gpts[0][0] - G.x) / G.R) * 1.5, gpts[0][1] + ((gpts[0][1] - G.y) / G.R) * 1.5, '#f4ead2', 2.2);
      }
      // orbit front half
      running(orbit(0, Math.PI), '#f2c14e', 13, 8, 3.2, prog(2.0, 2.4));

      // ---------- buttons as network nodes, linked by thread ----------
      const nodes = [
        [G.x - 300, G.y - 70, 26, '#e8b04a', 4], [G.x + 330, G.y - 120, 30, '#d9564a', 4], [G.x + 250, G.y + 120, 22, '#f4efe4', 2],
        [G.x - 210, G.y + 140, 24, '#6fb3a6', 4], [G.x - 40, G.y - 40, 20, '#f4efe4', 4], [G.x + 95, G.y + 45, 18, '#e8b04a', 2],
        [G.x - 60, G.y + 115, 16, '#ef9aa6', 2], [G.x + 490, G.y + 20, 24, '#6fb3a6', 4], [G.x + 120, G.y - 115, 15, '#d9564a', 2],
      ];
      const links = [[0, 4], [4, 5], [5, 2], [4, 8], [8, 1], [1, 7], [2, 7], [6, 3], [6, 5], [0, 3], [4, 6]];
      const grow = prog(2.55, 3.7);
      links.forEach(([a, b], li) => {
        const A = nodes[a], B = nodes[b];
        const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2 - 28 - (li % 3) * 8;
        const pts = [];
        const frac = H.clamp(grow * links.length - li * 0.6, 0, 1);
        for (let k = 0; k <= 30 * frac; k++) { const u = k / 30; pts.push([(1 - u) * (1 - u) * A[0] + 2 * u * (1 - u) * mx + u * u * B[0], (1 - u) * (1 - u) * A[1] + 2 * u * (1 - u) * my + u * u * B[1]]); }
        if (pts.length > 1) running(pts, '#c8443a', 12, 7, 3.2);
      });
      nodes.forEach(([x, y, R0, col, holes], i) => {
        const bu = prog(2.05 + i * 0.07, 2.35 + i * 0.07);
        if (bu <= 0) return;
        const R = R0 * Math.max(0.15, H.ease.back(bu));
        const rgb = hx(col);
        ctx.save();
        ctx.shadowColor = 'rgba(40,20,10,0.5)'; ctx.shadowBlur = 8; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 5;
        const g = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.1, x, y, R);
        g.addColorStop(0, H.rgba(rgb.map((v) => Math.min(255, v * 1.25 + 20)))); g.addColorStop(0.7, H.rgba(rgb)); g.addColorStop(1, H.rgba(rgb.map((v) => v * 0.7)));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
        ctx.restore();
        // rim + dished centre
        ctx.strokeStyle = H.rgba(rgb.map((v) => v * 0.6), 0.6); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, R * 0.72, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, R * 0.76, 0.2, 1.8); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, R - 1.5), 3.4, 4.6); ctx.stroke();
        // holes + thread
        const hp = holes === 4 ? [[-1, -1], [1, -1], [1, 1], [-1, 1]] : [[-1, 0], [1, 0]];
        const hs = R * 0.24;
        const tc = col === '#d9564a' || col === '#ef9aa6' ? '#f4ead2' : '#c8443a';
        if (bu < 1) return;
        if (holes === 4) { threadSeg(x - hs, y - hs, x + hs, y + hs, tc, 2.2); threadSeg(x + hs, y - hs, x - hs, y + hs, tc, 2.2); }
        else threadSeg(x - hs * 1.1, y, x + hs * 1.1, y, tc, 2.4);
        hp.forEach(([a, b]) => { ctx.fillStyle = 'rgba(30,15,10,0.55)'; ctx.beginPath(); ctx.arc(x + a * hs * (holes === 2 ? 1.1 : 1), y + b * hs, R * 0.09, 0, TAU); ctx.fill(); });
        // specular glint
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(x - R * 0.45, y - R * 0.5, R * 0.18, R * 0.08, -0.6, 0, TAU); ctx.fill();
      });

      // ---------- felt heart + star accents ----------
      {
        const heart = []; for (let i = 0; i < 80; i++) { const a = (i / 80) * TAU; const x = 16 * Math.pow(Math.sin(a), 3), y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); heart.push([1080 + x * 3.2, 150 + y * 3.2]); }
        felt(heart, '#d9564a', { seed: 61, sb: 10, at: 0.3 });
        const hi = heart.map(([x, y]) => [1080 + (x - 1080) * 0.78, 150 + (y - 150) * 0.78 + 3]);
        running([...hi, hi[0]], '#f4ead2', 6, 5, 1.8, prog(0.9, 1.4));
        const star = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * TAU, rr = i % 2 ? 17 : 38; star.push([175 + Math.cos(a) * rr, 120 + Math.sin(a) * rr]); }
        felt(star, '#f2c14e', { seed: 62, sb: 9, at: 0.42 });
        const si = star.map(([x, y]) => [175 + (x - 175) * 0.62, 120 + (y - 120) * 0.62 + 1]);
        running([...si, si[0]], '#c8443a', 5, 4, 1.7, prog(1.0, 1.5));
      }

      // ---------- sewn-on woven label with satin-stitched lettering ----------
      {
        const lx = 1010, ly = 612, lw = 390, lh = 100, rot = -0.05;
        const lu = prog(1.55, 2.0);
        if (lu > 0) {
        ctx.save(); ctx.translate(lx + (1 - H.ease.out(lu)) * 420, ly); ctx.rotate(rot - (1 - H.ease.out(lu)) * 0.25);
        ctx.save(); ctx.shadowColor = 'rgba(40,20,10,0.45)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 5;
        ctx.fillStyle = '#f3ecdc'; ctx.fillRect(-lw / 2, -lh / 2, lw, lh); ctx.restore();
        // twill weave
        ctx.save(); ctx.beginPath(); ctx.rect(-lw / 2, -lh / 2, lw, lh); ctx.clip();
        ctx.strokeStyle = 'rgba(120,100,70,0.12)'; ctx.lineWidth = 1;
        for (let k = -lw; k < lw; k += 3) { ctx.beginPath(); ctx.moveTo(k, -lh / 2); ctx.lineTo(k + lh, lh / 2); ctx.stroke(); }
        // folded-under ends
        const fg = ctx.createLinearGradient(-lw / 2, 0, -lw / 2 + 16, 0); fg.addColorStop(0, 'rgba(90,60,30,0.3)'); fg.addColorStop(1, 'rgba(90,60,30,0)');
        ctx.fillStyle = fg; ctx.fillRect(-lw / 2, -lh / 2, 16, lh);
        const fg2 = ctx.createLinearGradient(lw / 2, 0, lw / 2 - 16, 0); fg2.addColorStop(0, 'rgba(90,60,30,0.3)'); fg2.addColorStop(1, 'rgba(90,60,30,0)');
        ctx.fillStyle = fg2; ctx.fillRect(lw / 2 - 16, -lh / 2, 16, lh);
        // woven border lines
        ctx.fillStyle = '#c8443a'; ctx.fillRect(-lw / 2, -lh / 2 + 6, lw, 3); ctx.fillRect(-lw / 2, lh / 2 - 9, lw, 3);
        ctx.restore();
        // satin-stitched text: thread lines clipped to glyphs
        const M = H.layer(lw, lh), mc = M.getContext('2d');
        mc.font = '700 42px "Fredoka"'; mc.textAlign = 'center'; mc.textBaseline = 'middle'; mc.fillStyle = '#fff';
        mc.fillText('WORLD WIDE WEB', lw / 2, lh / 2 + 2);
        mc.globalCompositeOperation = 'source-in';
        mc.fillStyle = '#2f5f9a'; mc.fillRect(0, 0, lw, lh);
        mc.globalCompositeOperation = 'source-atop';
        mc.lineWidth = 1;
        for (let k = -lh; k < lw + lh; k += 2) {
          mc.strokeStyle = 'rgba(255,255,255,0.28)'; mc.beginPath(); mc.moveTo(k, 0); mc.lineTo(k + lh * 0.35, lh); mc.stroke();
          mc.strokeStyle = 'rgba(0,0,30,0.25)'; mc.beginPath(); mc.moveTo(k + 1, 0); mc.lineTo(k + 1 + lh * 0.35, lh); mc.stroke();
        }
        // satin stitch fills the letters left to right
        const tp = prog(2.0, 2.7);
        ctx.save(); ctx.beginPath(); ctx.rect(-lw / 2, -lh / 2, lw * (0.12 + 0.76 * tp) + (tp >= 1 ? lw : 0), lh); ctx.clip();
        ctx.shadowColor = 'rgba(20,10,5,0.45)'; ctx.shadowBlur = 1.5; ctx.shadowOffsetX = 0.8; ctx.shadowOffsetY = 1.2;
        if (tp > 0) ctx.drawImage(M, -lw / 2, -lh / 2); ctx.restore();
        ctx.restore();
        // stitched down at both ends (in world coords)
        const cr = Math.cos(rot), sr = Math.sin(rot), tw = (x, y) => [lx + x * cr - y * sr, ly + x * sr + y * cr];
        running([tw(-lw / 2 + 9, -lh / 2 + 4), tw(-lw / 2 + 9, lh / 2 - 4)], '#c8443a', 7, 5, 2, prog(2.7, 2.9));
        running([tw(lw / 2 - 9, -lh / 2 + 4), tw(lw / 2 - 9, lh / 2 - 4)], '#c8443a', 7, 5, 2, prog(2.9, 3.1));
        }
      }

      // ---------- soft studio light ----------
      ctx.save(); ctx.globalCompositeOperation = 'soft-light';
      const lg = ctx.createRadialGradient(380 + t * 10, 190 + Math.sin(t * 0.7) * 15, 60, 600, 360, 900);
      lg.addColorStop(0, 'rgba(255,245,220,0.55)'); lg.addColorStop(1, 'rgba(30,20,10,0.5)');
      ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H_); ctx.restore();
      H.vignette(ctx, W, H_, 0.4, '35,20,10');
      H.grain(ctx, W, H_, 0.025, 6 + Math.floor(t * 12));
    },
  });
}
