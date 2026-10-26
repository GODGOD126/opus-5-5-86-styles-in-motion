{
  // ---------- brainstorming cork board ----------
  const TAU = Math.PI * 2;
  let CORK = null; // static cork texture, computed once (deterministic)
  const INK = '#1b1f29', BLUE = '#1f3c8f', RED = '#c3202a';

  function grainPattern(ctx, seed) {
    const c = H.layer(160, 160), x = c.getContext('2d'), img = x.createImageData(160, 160), d = img.data, r = H.rng(seed), nz = H.makeNoise(seed);
    for (let i = 0; i < 160 * 160; i++) {
      const px = i % 160, py = (i / 160) | 0;
      const v = 200 + (r() - 0.5) * 50 + nz.n2(px * 0.4, py * 0.05) * 20;
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return ctx.createPattern(c, 'repeat');
  }

  // handwriting: per-word jitter on baseline/rotation, light double-pass for marker bleed
  function hand(ctx, lines, x, y, font, color, seed, lh, opts = {}) {
    const r = H.rng(seed);
    ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textBaseline = 'middle';
    lines.forEach((ln, li) => {
      const words = ln.split(' ');
      const sp = ctx.measureText(' ').width * 0.9;
      const total = words.reduce((a, w) => a + ctx.measureText(w).width, 0) + sp * (words.length - 1);
      let cx = x - total / 2 + r.range(-4, 4);
      const cy = y + (li - (lines.length - 1) / 2) * lh;
      words.forEach((w) => {
        const ww = ctx.measureText(w).width;
        ctx.save(); ctx.translate(cx + ww / 2, cy + r.range(-2, 2)); ctx.rotate(r.range(-0.045, 0.045));
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.35; ctx.fillText(w, 0.7, 0.5);
        ctx.globalAlpha = opts.alpha || 0.93; ctx.fillText(w, 0, 0);
        ctx.restore();
        cx += ww + sp;
      });
    });
    ctx.restore();
  }
  // wobbly marker line
  function mline(ctx, pts, w, color, r, close) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = 0.9;
    ctx.beginPath();
    pts.forEach((p, i) => { const x = p[0] + r.range(-0.8, 0.8), y = p[1] + r.range(-0.8, 0.8); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    if (close) ctx.closePath();
    ctx.stroke(); ctx.restore();
  }
  const arcPts = (cx, cy, rx, ry, a0, a1, n = 20) => { const o = []; for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };

  function note(ctx, o, pat) {
    const { x, y, w, h, rot, col } = o;
    const r = H.rng(o.seed);
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const hw = w / 2, hh = h / 2, lift = (o.lift ?? 1) * 1.35;
    // shadow (bottom lifts off the board -> bigger, softer shadow there)
    const air = Math.max(0, o.air || 0); ctx.save(); ctx.filter = `blur(${7 + air * 40}px)`; ctx.translate(air * 50, air * 70); ctx.fillStyle = `rgba(40,20,5,${0.42 - air * 0.5})`;
    ctx.beginPath(); ctx.moveTo(-hw + 3, -hh + 5); ctx.lineTo(hw + 3, -hh + 5); ctx.lineTo(hw + 6 + 6 * lift, hh + 8 + 10 * lift); ctx.quadraticCurveTo(0, hh + 4 + 6 * lift, -hw + 1, hh + 6 + 9 * lift); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.filter = 'blur(1.5px)'; ctx.fillStyle = 'rgba(40,20,5,0.3)'; ctx.fillRect(-hw + 1, -hh + 2, w, h * 0.3); ctx.restore();
    // paper with curled bottom edge
    const bc = 5 * lift;
    const shape = () => { ctx.beginPath(); ctx.moveTo(-hw, -hh); ctx.lineTo(hw, -hh); ctx.lineTo(hw + 0.5, hh - bc); ctx.quadraticCurveTo(hw * 0.2, hh + bc * 0.4, -hw, hh - bc * 0.4); ctx.closePath(); };
    shape(); ctx.fillStyle = col; ctx.fill();
    ctx.save(); shape(); ctx.clip();
    // paper grain
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.16; ctx.fillStyle = pat; ctx.fillRect(-hw, -hh, w, h + 10);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    // adhesive strip (slightly darker, flatter band at top)
    const ag = ctx.createLinearGradient(0, -hh, 0, -hh + h * 0.2);
    ag.addColorStop(0, 'rgba(90,60,0,0.07)'); ag.addColorStop(0.9, 'rgba(90,60,0,0.05)'); ag.addColorStop(1, 'rgba(255,255,255,0.10)');
    ctx.fillStyle = ag; ctx.fillRect(-hw, -hh, w, h * 0.2 + 1);
    // curl shading (lower part bends toward the light, then dips)
    const cg = ctx.createLinearGradient(0, hh * 0.25, 0, hh + 4);
    cg.addColorStop(0, 'rgba(255,255,255,0)'); cg.addColorStop(0.55, `rgba(255,255,240,${0.14 * lift})`); cg.addColorStop(0.85, `rgba(60,30,0,${0.1 * lift})`); cg.addColorStop(1, `rgba(60,30,0,${0.2 * lift})`);
    ctx.fillStyle = cg; ctx.fillRect(-hw, -hh, w, h + 10);
    // corner lift
    const rg = ctx.createRadialGradient(hw, hh, 2, hw, hh, w * 0.45); rg.addColorStop(0, `rgba(60,30,0,${0.16 * lift})`); rg.addColorStop(1, 'rgba(60,30,0,0)');
    ctx.fillStyle = rg; ctx.fillRect(-hw, -hh, w, h + 10);
    // light falloff across the sheet (lamp at upper-left)
    const lg = ctx.createLinearGradient(-hw, -hh, hw, hh); lg.addColorStop(0, 'rgba(255,255,255,0.10)'); lg.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = lg; ctx.fillRect(-hw, -hh, w, h + 10);
    ctx.restore();
    ctx.strokeStyle = 'rgba(80,50,10,0.18)'; ctx.lineWidth = 0.8; shape(); ctx.stroke();
    // content
    if (o.draw) { ctx.save(); ctx.translate(0, o.pin ? 8 : 0); o.draw(ctx, r, hw, hh); ctx.restore(); }
    ctx.restore();
  }

  function tape(ctx, x, y, w, h, rot, seed) {
    const r = H.rng(seed);
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const edge = (x0, sgn) => { const pts = []; for (let k = 0; k <= 8; k++) pts.push([x0 + sgn * r.range(0, 3.5), -h / 2 + k * h / 8]); return pts; };
    const L = edge(-w / 2, 1), R = edge(w / 2, -1);
    const path = () => { ctx.beginPath(); L.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); R.slice().reverse().forEach((p) => ctx.lineTo(...p)); ctx.closePath(); };
    ctx.save(); ctx.filter = 'blur(2px)'; ctx.translate(2, 3); path(); ctx.fillStyle = 'rgba(40,25,5,0.18)'; ctx.fill(); ctx.restore();
    path(); ctx.fillStyle = 'rgba(232,218,170,0.62)'; ctx.fill();
    ctx.save(); path(); ctx.clip();
    for (let k = 0; k < 40; k++) { ctx.fillStyle = `rgba(255,255,255,${r.range(0, 0.12)})`; ctx.fillRect(r.range(-w / 2, w / 2), r.range(-h / 2, h / 2), r.range(4, 18), 1); }
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, 'rgba(255,255,255,0.25)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,90,30,0.12)');
    ctx.fillStyle = g; ctx.fillRect(-w / 2 - 4, -h / 2, w + 8, h);
    ctx.restore();
    ctx.restore();
  }

  function pinShadow(ctx, x, y) {
    ctx.save(); ctx.filter = 'blur(3px)'; ctx.fillStyle = 'rgba(30,15,0,0.45)';
    ctx.beginPath(); ctx.ellipse(x + 9, y + 12, 10, 8, 0.5, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.strokeStyle = 'rgba(30,15,0,0.35)'; ctx.lineWidth = 1.6; ctx.filter = 'blur(0.8px)';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 16, y + 20); ctx.stroke(); ctx.restore();
  }
  function pinHead(ctx, x, y, col) {
    const c = H.hex(col);
    // collar
    ctx.save();
    let g = ctx.createRadialGradient(x - 4, y - 4, 1, x, y, 12);
    g.addColorStop(0, H.rgba(H.mix(c, [255, 255, 255], 0.35))); g.addColorStop(0.6, H.rgba(c)); g.addColorStop(1, H.rgba(H.mix(c, [0, 0, 0], 0.5)));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill();
    // dome
    g = ctx.createRadialGradient(x - 4, y - 5, 0.5, x - 1, y - 2, 9);
    g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.25, H.rgba(H.mix(c, [255, 255, 255], 0.25))); g.addColorStop(1, H.rgba(H.mix(c, [0, 0, 0], 0.35)));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x - 1, y - 2, 7.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = H.rgba(H.mix(c, [0, 0, 0], 0.55), 0.6); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  function yarn(ctx, a, b, sag, prog, r) {
    if (prog <= 0) return;
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + sag;
    const pts = [];
    const n = 60, m = Math.max(1, Math.round(n * prog));
    for (let k = 0; k <= m; k++) { const t = k / n, u = 1 - t; pts.push([u * u * a[0] + 2 * u * t * mx + t * t * b[0], u * u * a[1] + 2 * u * t * my + t * t * b[1]]); }
    const path = (dx = 0, dy = 0) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0] + dx, p[1] + dy) : ctx.moveTo(p[0] + dx, p[1] + dy)); };
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.filter = 'blur(2.5px)'; ctx.strokeStyle = 'rgba(30,10,0,0.4)'; ctx.lineWidth = 3; path(5, 9); ctx.stroke(); ctx.filter = 'none';
    ctx.strokeStyle = '#a8121b'; ctx.lineWidth = 3.4; path(); ctx.stroke();
    ctx.strokeStyle = '#d8323a'; ctx.lineWidth = 2; path(-0.4, -0.5); ctx.stroke();
    // twist highlights
    ctx.setLineDash([2.2, 3.2]); ctx.strokeStyle = 'rgba(255,150,140,0.75)'; ctx.lineWidth = 1.1; path(-0.6, -0.8); ctx.stroke();
    ctx.lineDashOffset = 2.6; ctx.strokeStyle = 'rgba(90,0,0,0.5)'; ctx.lineWidth = 1; path(0.8, 0.8); ctx.stroke();
    ctx.setLineDash([]);
    // stray fibers
    for (let k = 0; k < 6; k++) { const p = pts[Math.floor(r() * pts.length)]; ctx.strokeStyle = 'rgba(200,40,40,0.5)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + r.range(-4, 4), p[1] + r.range(-4, 4)); ctx.stroke(); }
    ctx.restore();
  }

  // ===== EXPLAINER HELPERS =====
  let BIGCORK = null;
  const XW = 3200, XH = 1600;
  function bigCork() {
    if (BIGCORK) return BIGCORK;
    const L = H.layer(XW, XH), c = L.getContext('2d'), img = c.createImageData(XW, XH), d = img.data, nz = H.makeNoise(12);
    const A = [176, 128, 78], B = [214, 170, 112], Dk = [120, 78, 40];
    for (let y = 0; y < XH; y++) for (let x = 0; x < XW; x++) {
      const g1 = nz.n2(x * 0.21, y * 0.21), h = ((x * 374761393 + y * 668265263) ^ 0x5bd1e995) >>> 0, rr = ((h ^ (h >>> 13)) * 1274126177 >>> 0) / 4294967296;
      // second, finer granule octave (as in the hero's cork) so the texture stays crisp when the camera zooms in
      const g2 = nz.n2(x * 0.55 + 40, y * 0.55);
      const v = H.clamp(0.5 + g1 * 0.8 + g2 * 0.45 + (rr - 0.5) * 0.3), low = nz.n2(x * 0.006, y * 0.006) * 0.1;
      const pore = g2 > 0.42 ? H.clamp((g2 - 0.42) * 5) * 0.85 : (rr > 0.95 ? 0.6 : 0);
      const rr2 = (((h * 2246822519) ^ (h >>> 16)) >>> 0) / 4294967296;
      const i = (y * XW + x) * 4, s = 1 + low + (rr2 - 0.5) * 0.12; // 1px granules, +-6% luminance
      d[i] = H.lerp(A[0] + (B[0] - A[0]) * v, Dk[0], pore) * s; d[i + 1] = H.lerp(A[1] + (B[1] - A[1]) * v, Dk[1], pore) * s; d[i + 2] = H.lerp(A[2] + (B[2] - A[2]) * v, Dk[2], pore) * s; d[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    // old pin holes from earlier brainstorms
    { const r = H.rng(77); for (let k = 0; k < 260; k++) { const x = r() * XW, y = r() * XH, rad = r.range(0.9, 1.8); c.fillStyle = 'rgba(40,20,5,0.6)'; c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(255,230,190,0.18)'; c.beginPath(); c.arc(x - rad * 0.6, y - rad * 0.6, rad * 0.7, 0, Math.PI * 2); c.fill(); } }
    // frame (wood with grain lines, like the hero's)
    const f = 26;
    const wood = (x, y, w, h, vert) => {
      const g = vert ? c.createLinearGradient(x, 0, x + w, 0) : c.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, '#7a4e2a'); g.addColorStop(0.4, '#9a6a3c'); g.addColorStop(1, '#5a361b');
      c.fillStyle = g; c.fillRect(x, y, w, h);
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.strokeStyle = 'rgba(60,30,10,0.35)'; c.lineWidth = 0.9;
      const len = vert ? h : w, n = Math.ceil(len / 6);
      for (let k = 0; k < 10; k++) { c.beginPath(); for (let s2 = 0; s2 <= n; s2++) { const q = s2 / n; const px = vert ? x + 2 + k * 2.4 + Math.sin(q * len / 40 + k) * 0.9 : x + q * w; const py = vert ? y + q * h : y + 2 + k * 2.4 + Math.sin(q * len / 40 + k) * 0.9; s2 ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); }
      c.restore();
    };
    wood(0, 0, XW, f, false); wood(0, XH - f, XW, f, false); wood(0, 0, f, XH, true); wood(XW - f, 0, f, XH, true);
    c.strokeStyle = 'rgba(20,10,0,0.35)'; c.lineWidth = 8; c.filter = 'blur(5px)'; c.strokeRect(f + 3, f + 3, XW - 2 * f - 6, XH - 2 * f - 6); c.filter = 'none';
    BIGCORK = L; return L;
  }
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  // write-on: reveal content left to right like a marker moving
  function wr(ctx, p, x0, y0, w, h, fn) { if (p <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w * Math.min(1, p), h); ctx.clip(); fn(); ctx.restore(); }
  function catDoodle(c, x, y, s, col, r) {
    mline(c, arcPts(x, y, 20 * s, 17 * s, 0, TAU, 24), 2.6 * s, col, r, true);
    mline(c, [[x - 17 * s, y - 8 * s], [x - 14 * s, y - 27 * s], [x - 4 * s, y - 16 * s]], 2.6 * s, col, r);
    mline(c, [[x + 17 * s, y - 8 * s], [x + 14 * s, y - 27 * s], [x + 4 * s, y - 16 * s]], 2.6 * s, col, r);
    c.fillStyle = col; [[-7, -3], [7, -3]].forEach(([dx, dy]) => { c.beginPath(); c.arc(x + dx * s, y + dy * s, 2.2 * s, 0, TAU); c.fill(); });
    mline(c, [[x - 3 * s, y + 4 * s], [x, y + 7 * s], [x + 3 * s, y + 4 * s]], 1.8 * s, col, r);
    [[-1, 5], [1, 5], [-1, 9], [1, 9]].forEach(([sg, dy]) => mline(c, [[x + sg * 7 * s, y + dy * s], [x + sg * 26 * s, y + (dy - 2 + (dy > 6 ? 4 : 0)) * s]], 1.4 * s, col, r));
  }
  function dogDoodle(c, x, y, s, col, r) {
    mline(c, arcPts(x, y, 19 * s, 18 * s, 0, TAU, 24), 2.6 * s, col, r, true);
    [-1, 1].forEach((sg) => mline(c, arcPts(x + sg * 20 * s, y - 2 * s, 7 * s, 15 * s, 0, TAU, 16), 2.6 * s, col, r, true));
    mline(c, arcPts(x, y + 8 * s, 9 * s, 6 * s, 0, TAU, 16), 2 * s, col, r, true);
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y + 5 * s, 3.5 * s, 2.5 * s, 0, 0, TAU); c.fill();
    [[-7, -5], [7, -5]].forEach(([dx, dy]) => { c.beginPath(); c.arc(x + dx * s, y + dy * s, 2.2 * s, 0, TAU); c.fill(); });
  }
  function arrowM(ctx, pts, p, col, w, r) {
    if (p <= 0) return;
    const n = Math.max(2, Math.round(pts.length * Math.min(1, p)));
    const seg = pts.slice(0, n);
    mline(ctx, seg, w, col, r);
    if (p >= 1) { const a = pts[pts.length - 1], b = pts[pts.length - 3] || pts[0], an = Math.atan2(a[1] - b[1], a[0] - b[0]); mline(ctx, [[a[0] + Math.cos(an + 2.6) * 22, a[1] + Math.sin(an + 2.6) * 22], a, [a[0] + Math.cos(an - 2.6) * 22, a[1] + Math.sin(an - 2.6) * 22]], w, col, r); }
  }
  const qpts = (a, c, b, n = 24) => { const o = []; for (let k = 0; k <= n; k++) { const t = k / n, m = 1 - t; o.push([m * m * a[0] + 2 * m * t * c[0] + t * t * b[0], m * m * a[1] + 2 * m * t * c[1] + t * t * b[1]]); } return o; };

  // ===== END EXPLAINER HELPERS =====
  registerStyle({
    id: 'sticky-notes',
    name: 'Sticky-Note Wall',
    category: 'Illustration',
    description: 'A brainstorming cork board: curling Post-its with adhesive bands and lifted-corner shadows, marker handwriting and doodles, a taped index card, push pins and red yarn connecting the ideas.',
    motion: 'Notes slap onto the board one by one with a tiny bounce, then red yarn unspools from pin to pin linking the ideas.',
    fonts: ['400 30px "Permanent Marker"', '700 28px "Kalam"', '700 30px "Caveat"', '400 22px "Gloria Hallelujah"', '400 22px "Rock Salt"'],
    frameT: 5.4,
    duration: 5.5,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const r = H.rng(2024), nz = H.makeNoise(12);
      // ---------- cork ----------
      if (!CORK) {
        const img = ctx.createImageData(W, H_), d = img.data;
        const A = [176, 128, 78], B = [214, 170, 112], Dk = [120, 78, 40];
        for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
          const g1 = nz.n2(x * 0.21, y * 0.21), g2 = nz.n2(x * 0.55 + 40, y * 0.55);
          let v = H.clamp(0.5 + g1 * 0.9 + g2 * 0.45);
          const low = nz.n2(x * 0.012, y * 0.012) * 0.12;
          let c0 = A[0] + (B[0] - A[0]) * v, c1 = A[1] + (B[1] - A[1]) * v, c2 = A[2] + (B[2] - A[2]) * v;
          const pore = g2 > 0.42 ? H.clamp((g2 - 0.42) * 5) : 0;
          c0 = H.lerp(c0, Dk[0], pore); c1 = H.lerp(c1, Dk[1], pore); c2 = H.lerp(c2, Dk[2], pore);
          const i = (y * W + x) * 4, s = 1 + low;
          d[i] = c0 * s; d[i + 1] = c1 * s; d[i + 2] = c2 * s; d[i + 3] = 255;
        }
        CORK = img;
      }
      ctx.putImageData(CORK, 0, 0);
      // lamp light from upper-left
      { const g = ctx.createRadialGradient(330, 120, 50, 400, 200, 1100); g.addColorStop(0, 'rgba(255,240,210,0.22)'); g.addColorStop(0.5, 'rgba(255,240,210,0)'); g.addColorStop(1, 'rgba(40,20,0,0.35)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H_); }
      // old pin holes
      for (let k = 0; k < 40; k++) { ctx.fillStyle = 'rgba(40,20,5,0.6)'; ctx.beginPath(); ctx.arc(r() * W, r() * H_, r.range(0.8, 1.6), 0, TAU); ctx.fill(); }
      // wooden frame
      {
        const f = 16;
        const wood = (x, y, w, h, vert) => {
          const g = vert ? ctx.createLinearGradient(x, 0, x + w, 0) : ctx.createLinearGradient(0, y, 0, y + h);
          g.addColorStop(0, '#7a4e2a'); g.addColorStop(0.4, '#9a6a3c'); g.addColorStop(1, '#5a361b');
          ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
          ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.strokeStyle = 'rgba(60,30,10,0.35)'; ctx.lineWidth = 0.8;
          for (let k = 0; k < 7; k++) { ctx.beginPath(); for (let s = 0; s <= 60; s++) { const q = s / 60; const px = vert ? x + 2 + k * 2 + Math.sin(q * 20 + k) * 0.8 : x + q * w; const py = vert ? y + q * h : y + 2 + k * 2 + Math.sin(q * 30 + k) * 0.8; s ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
          ctx.restore();
        };
        wood(0, 0, W, f, false); wood(0, H_ - f, W, f, false); wood(0, 0, f, H_, true); wood(W - f, 0, f, H_, true);
        // inner shadow on cork
        ctx.save(); ctx.strokeStyle = 'rgba(20,10,0,0.35)'; ctx.lineWidth = 6; ctx.filter = 'blur(4px)'; ctx.strokeRect(f + 2, f + 2, W - 2 * f - 4, H_ - 2 * f - 4); ctx.restore();
      }
      const pat = grainPattern(ctx, 3);

      // appearance timing: each item slaps on with a small bounce
      const appear = (i) => H.clamp((t - 0.2 - i * 0.2) / 0.3);
      // slap: arrives large (close to camera), overshoots flat against the cork, settles
      const S = (i) => { const a = appear(i); return a <= 0 ? 0 : 1 + 0.32 * (1 - H.ease.back(a)); };
      const pinT = (i) => 0.2 + i * 0.2 + 0.32;

      const YEL = '#fbe36a', PNK = '#ff8db5', ORG = '#ffb04f', GRN = '#b6e27a', BLU = '#86d0f2';
      const notes = [
        { x: 40, y: 92, w: 160, h: 160, rot: 0.12, col: ORG, seed: 1, lift: 0.6 },
        { x: 210, y: 220, w: 168, h: 168, rot: -0.07, col: YEL, seed: 2, pin: [0, -58, '#d22b2b'],
          draw(c, rr, hw, hh) { hand(c, ['COLLECT', 'DATA'], 0, -18, '400 31px "Permanent Marker"', INK, 11, 34); const R = H.rng(5); mline(c, arcPts(0, 36, 22, 6, 0, TAU), 2.6, INK, R, true); mline(c, [[-22, 36], [-22, 60]], 2.6, INK, R); mline(c, [[22, 36], [22, 60]], 2.6, INK, R); mline(c, arcPts(0, 60, 22, 6, 0, Math.PI), 2.6, INK, R); mline(c, arcPts(0, 48, 22, 6, 0, Math.PI), 2, INK, R); } },
        { x: 455, y: 330, w: 168, h: 168, rot: 0.05, col: PNK, seed: 3, pin: [0, -60, '#2a62c9'],
          draw(c, rr, hw, hh) { hand(c, ['TRAIN THE', 'MODEL'], 0, -26, '400 28px "Permanent Marker"', INK, 12, 32); const R = H.rng(6); mline(c, [[-50, 20], [-50, 66], [50, 66]], 2.4, INK, R); const cv = []; for (let k = 0; k <= 16; k++) { const q = k / 16; cv.push([-46 + q * 92, 24 + 38 * (1 - Math.exp(-q * 4)) + Math.sin(q * 40) * 2]); } mline(c, cv, 2.6, RED, R); hand(c, ['loss'], -26, 76, '700 15px "Kalam"', INK, 4, 14); } },
        { x: 182, y: 505, w: 160, h: 160, rot: 0.06, col: ORG, seed: 4, pin: [0, -56, '#f2f2ee'],
          draw(c) { hand(c, ['TOKENS??'], 0, -22, '400 30px "Permanent Marker"', INK, 13, 30); hand(c, ['~ ¾ of a word'], 0, 22, '700 23px "Caveat"', BLUE, 7, 22); const R = H.rng(9); mline(c, [[-50, 40], [-20, 44], [10, 40], [48, 43]], 2, BLUE, R); } },
        { x: 650, y: 478, w: 176, h: 176, rot: -0.03, col: GRN, seed: 5, pin: [0, -62, '#d22b2b'],
          draw(c) { hand(c, ['USERS', 'FIRST!'], 0, -22, '400 34px "Permanent Marker"', INK, 14, 38); const R = H.rng(10); const hp = []; for (let k = 0; k <= 30; k++) { const a = k / 30 * TAU; hp.push([16 * Math.pow(Math.sin(a), 3) * 1.3, 42 - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 1.25]); } mline(c, hp, 3, RED, R, true); } },
        { x: 880, y: 300, w: 168, h: 168, rot: -0.06, col: BLU, seed: 6, pin: [0, -60, '#f0c419'],
          draw(c) { hand(c, ['EVALS', 'EVALS', 'EVALS'], 6, -4, '400 28px "Permanent Marker"', INK, 15, 31); const R = H.rng(11); [-35, -4, 27].forEach((yy) => mline(c, [[-62, yy], [-56, yy + 7], [-44, yy - 9]], 3, '#1d7a33', R)); } },
        { x: 1100, y: 196, w: 160, h: 160, rot: 0.07, col: YEL, seed: 7, pin: [0, -56, '#2a62c9'],
          draw(c) { hand(c, ['FINE-', 'TUNE?'], 0, -14, '400 32px "Permanent Marker"', INK, 16, 36); hand(c, ['maybe later'], 0, 48, '400 16px "Gloria Hallelujah"', BLUE, 3, 18); } },
        { x: 1088, y: 500, w: 170, h: 170, rot: -0.05, col: PNK, seed: 8, pin: [0, -60, '#f2f2ee'],
          draw(c) { hand(c, ['SHIP IT'], 0, -42, '400 34px "Permanent Marker"', INK, 17, 34); const R = H.rng(12);
            const rk = [[0, -14], [12, 4], [12, 34], [-12, 34], [-12, 4]]; mline(c, rk, 2.6, INK, R, true); mline(c, arcPts(0, 14, 4.5, 4.5, 0, TAU), 2, INK, R, true);
            mline(c, [[-12, 22], [-22, 36], [-12, 34]], 2.4, INK, R); mline(c, [[12, 22], [22, 36], [12, 34]], 2.4, INK, R); mline(c, [[-7, 38], [0, 58], [7, 38]], 2.4, '#e2611b', R); mline(c, [[-3, 40], [0, 50], [3, 40]], 2, '#e2611b', R);
            hand(c, ['Fri!'], 48, 40, '700 26px "Caveat"', RED, 2, 20); } },
        { x: 430, y: 592, w: 128, h: 128, rot: -0.09, col: YEL, seed: 9, pin: null, lift: 1.4,
          draw(c) { hand(c, ['cost?', 'latency?'], 0, 0, '700 26px "Kalam"', BLUE, 18, 30); } },
        { x: 870, y: 592, w: 132, h: 132, rot: 0.08, col: BLU, seed: 10, pin: null, lift: 1.2,
          draw(c) { hand(c, ['< 1 sec', 'replies'], 0, -4, '700 27px "Caveat"', INK, 19, 30); const R = H.rng(13); mline(c, [[-40, 32], [40, 30]], 2.2, RED, R); } },
        { x: 1262, y: 700, w: 160, h: 160, rot: -0.1, col: GRN, seed: 11, lift: 0.5 },
      ];
      // index card (title), drawn first among top items
      const card = { x: 650, y: 140, w: 330, h: 190, rot: -0.022 };
      const pinPos = (n) => { if (!n.pin) return null; const ca = Math.cos(n.rot), sa = Math.sin(n.rot), py = -n.h / 2 + 14; return [n.x + n.pin[0] * ca - py * sa, n.y + n.pin[0] * sa + py * ca, n.pin[2]]; };

      const order = [0, 1, 2, 3, 5, 6, 4, 7, 8, 9, 10];
      notes[0].lift = 0.6 + 0.3 * Math.sin(t * 2.3); notes[10].lift = 0.5 + 0.25 * Math.sin(t * 1.9 + 1);
      // shadows of pins under notes are drawn after each note
      order.forEach((idx, k) => {
        const n = notes[idx], s = S(k);
        if (!s) return;
        n.air = s - 1;
        ctx.save(); ctx.translate(n.x, n.y); ctx.scale(s, s); ctx.translate(-n.x, -n.y);
        note(ctx, n, pat);
        ctx.restore();
      });
      // index card
      if (S(3.5)) {
        const s = S(3.5);
        ctx.save(); ctx.translate(card.x, card.y); ctx.rotate(card.rot); ctx.scale(s, s);
        const { w, h } = card;
        ctx.save(); ctx.filter = 'blur(6px)'; ctx.fillStyle = 'rgba(40,20,5,0.4)'; ctx.fillRect(-w / 2 + 4, -h / 2 + 8, w, h); ctx.restore();
        ctx.fillStyle = '#fbfaf3'; ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.12; ctx.fillStyle = pat; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
        ctx.fillStyle = 'rgba(220,60,70,0.7)'; ctx.fillRect(-w / 2, -h / 2 + 40, w, 1.4);
        ctx.fillStyle = 'rgba(80,140,210,0.5)'; for (let k = 0; k < 7; k++) ctx.fillRect(-w / 2, -h / 2 + 62 + k * 19, w, 1);
        const lg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); lg.addColorStop(0, 'rgba(255,255,255,0.08)'); lg.addColorStop(1, 'rgba(60,40,0,0.08)'); ctx.fillStyle = lg; ctx.fillRect(-w / 2, -h / 2, w, h);
        hand(ctx, ['AI HELPER  v1'], 0, -h / 2 + 22, '400 30px "Permanent Marker"', INK, 21, 30);
        hand(ctx, ['what does it need', 'to actually be useful?'], -4, 14, '700 26px "Caveat"', BLUE, 22, 19);
        const R = H.rng(23);
        mline(ctx, [[-118, 70], [-40, 66], [40, 69], [120, 64]], 2.4, RED, R);
        hand(ctx, ['brainstorm · tues'], 92, 82, '400 13px "Gloria Hallelujah"', INK, 24, 14, { alpha: 0.7 });
        ctx.restore();
        // tape at the two top corners
        const ca = Math.cos(card.rot), sa = Math.sin(card.rot);
        const cp = (px, py) => [card.x + px * ca - py * sa, card.y + px * sa + py * ca];
        const t1 = cp(-card.w / 2 + 6, -card.h / 2 + 4), t2 = cp(card.w / 2 - 6, -card.h / 2 + 4);
        tape(ctx, t1[0], t1[1], 78, 26, -0.7, 31); tape(ctx, t2[0], t2[1], 78, 26, 0.65, 32);
        const t3 = cp(0, card.h / 2 - 2); tape(ctx, t3[0], t3[1], 70, 24, 0.04, 33);
      }

      // pins: shadows, yarn, heads
      const pins = notes.map(pinPos);
      pins.forEach((p, i) => { if (p && t >= pinT(order.indexOf(i))) pinShadow(ctx, p[0], p[1]); });
      const links = [[1, 2, 40], [2, 5, 50], [5, 7, 40], [3, 2, 36], [4, 7, 55], [2, 4, 30], [6, 5, 30]];
      links.forEach(([a, b, sag], k) => {
        const pa = pins[a], pb = pins[b];
        yarn(ctx, pa, pb, sag + Math.sin(t * 1.6 + k) * 2.5, H.clamp((t - 2.75 - k * 0.18) / 0.45), H.rng(50 + k));
      });
      pins.forEach((p, i) => { const k = (t - pinT(order.indexOf(i))) / 0.14; if (!p || k < 0) return; const sc = 1 + 0.9 * Math.pow(1 - H.clamp(k), 2); ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(sc, sc); ctx.translate(-p[0], -p[1]); pinHead(ctx, p[0], p[1], p[2]); ctx.restore(); });
      // a spare pin stuck in the cork
      if (t > 0.3) { pinShadow(ctx, 330, 82); pinHead(ctx, 330, 82, '#3fae4a'); }

      // warm overall grade + vignette + grain
      H.vignette(ctx, W, H_, 0.35, '30,15,0');
      H.grain(ctx, W, H_, 0.04, 8 + Math.floor(t * 12));
    },
    // ===== EXPLAINER =====
    explainerDuration: 14.5,
    explainerNote: 'A detective-board camera move across one big cork wall: notes slap in on cue, marker arrows and red yarn draw the flow, numbers are crossed out and rewritten by hand, and red marker circles the key moments.',
    explainer(ctx, W, H_, t) {
      const pat = grainPattern(ctx, 3), r0 = H.rng(9);
      const YEL = '#fbe36a', PNK = '#ff8db5', ORG = '#ffb04f', GRN = '#b6e27a', BLU = '#86d0f2', GREEN = '#1d7a33';
      // ---- camera keyframes [t, cx, cy, zoom] ----
      const K = [[0, 560, 260, 1.25], [1.5, 560, 260, 1.25], [2.4, 1200, 560, 0.84], [5.9, 1200, 560, 0.84], [6.8, 2490, 590, 1.0], [10.1, 2490, 590, 1.0], [10.9, 1260, 1210, 0.92], [12.9, 1260, 1210, 0.92], [13.7, 1720, 850, 0.56], [99, 1720, 850, 0.56]];
      let ki = 0; while (ki < K.length - 2 && t > K[ki + 1][0]) ki++;
      const [ta, ax, ay, az] = K[ki], [tb, bx, by, bz] = K[ki + 1], e = H.ease.inOut(H.clamp((t - ta) / (tb - ta)));
      const z = Math.exp(H.lerp(Math.log(az), Math.log(bz), e)), hwv = W / 2 / z, hhv = H_ / 2 / z;
      const cx = H.clamp(H.lerp(ax, bx, e), hwv, XW - hwv), cy = H.clamp(H.lerp(ay, by, e), hhv, XH - hhv);
      ctx.save(); ctx.translate(W / 2, H_ / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
      ctx.drawImage(bigCork(), 0, 0);
      const slap = (t0) => { const a = H.clamp((t - t0) / 0.3); return a <= 0 ? 0 : 1 + 0.32 * (1 - H.ease.back(a)); };
      const put = (n, t0) => { const s = slap(t0); if (!s) return false; n.air = s - 1; ctx.save(); ctx.translate(n.x, n.y); ctx.scale(s, s); ctx.translate(-n.x, -n.y); note(ctx, n, pat); ctx.restore(); return true; };
      const pin = (x, y, col, t0) => { const k = (t - t0) / 0.14; if (k < 0) return; pinShadow(ctx, x, y); const sc = 1 + 0.9 * Math.pow(1 - H.clamp(k), 2); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y); pinHead(ctx, x, y, col); ctx.restore(); };
      const MK = '400 30px "Permanent Marker"';

      // ===== yarn trail linking the regions (camera follows it) =====
      const Y1 = [[560, 110], [1560, 408]], Y2 = [[1560, 408], [2440, 234]], Y3 = [[2470, 960], [1450, 1060]];
      yarn(ctx, Y1[0], Y1[1], 60, H.clamp((t - 1.6) / 0.9), H.rng(61));
      yarn(ctx, Y2[0], Y2[1], 90, H.clamp((t - 5.9) / 0.85), H.rng(62));
      yarn(ctx, Y3[0], Y3[1], 70, H.clamp((t - 10.1) / 0.8), H.rng(63));

      // ===== BEAT 1: hook card =====
      {
        const s = slap(0.1);
        if (s) {
          ctx.save(); ctx.translate(560, 260); ctx.rotate(-0.03); ctx.scale(s, s);
          const w = 560, h = 300;
          ctx.save(); ctx.filter = `blur(${7 + (s - 1) * 40}px)`; ctx.fillStyle = 'rgba(40,20,5,0.4)'; ctx.fillRect(-w / 2 + 6 + (s - 1) * 60, -h / 2 + 10 + (s - 1) * 80, w, h); ctx.restore();
          ctx.fillStyle = '#fbfaf3'; ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.12; ctx.fillStyle = pat; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
          ctx.fillStyle = 'rgba(220,60,70,0.7)'; ctx.fillRect(-w / 2, -h / 2 + 52, w, 1.6);
          ctx.fillStyle = 'rgba(80,140,210,0.5)'; for (let k = 0; k < 9; k++) ctx.fillRect(-w / 2, -h / 2 + 80 + k * 24, w, 1);
          wr(ctx, (t - 0.35) / 0.55, -w / 2, -h / 2, w, 150, () => hand(ctx, ['How does AI'], 0, -60, '400 54px "Permanent Marker"', INK, 41, 54));
          wr(ctx, (t - 0.85) / 0.45, -w / 2, -10, w, 120, () => hand(ctx, ['learn?'], 0, 30, '400 62px "Permanent Marker"', INK, 42, 54));
          if (t > 1.3) { const R = H.rng(43); const pp = qpts([-200, 92], [0, 104], [200, 86]); arrowM(ctx, pp, (t - 1.3) / 0.3, RED, 5, R); }
          ctx.restore();
          if (t > 0.4) { tape(ctx, 300, 120, 90, 30, -0.6, 31); tape(ctx, 820, 104, 90, 30, 0.55, 32); }
          pin(560, 110, '#d22b2b', 1.55);
        }
      }

      // ===== BEAT 2: data -> model =====
      const cols = [YEL, BLU, GRN, ORG];
      const ex = [];
      for (let k = 0; k < 12; k++) ex.push({ x: 920 + (k % 3) * 135 + r0.range(-10, 10), y: 400 + Math.floor(k / 3) * 125 + r0.range(-8, 8), rot: r0.range(-0.12, 0.12), cat: (k * 7) % 3 !== 0, t0: 2.2 + k * 0.13 });
      for (let k = 0; k < 10; k++) ex.push({ x: 930 + r0.range(0, 260), y: 410 + r0.range(0, 360), rot: r0.range(-0.3, 0.3), cat: k % 2 === 0, t0: 4.15 + k * 0.1 });
      ex.forEach((q, k) => {
        put({ x: q.x, y: q.y, w: 118, h: 118, rot: q.rot, col: cols[k % 4], seed: 100 + k, lift: 0.6, draw(c) { const R = H.rng(200 + k); (q.cat ? catDoodle : dogDoodle)(c, 0, -14, 1.1, INK, R); hand(c, [q.cat ? 'cat' : 'dog'], 0, 38, '700 32px "Kalam"', BLUE, 300 + k, 20); } }, q.t0);
      });
      // model note
      const MX = 1560, MY = 520;
      put({ x: MX, y: MY, w: 250, h: 250, rot: 0.03, col: PNK, seed: 51, lift: 0.8, pin: [0, 0, '#2a62c9'],
        draw(c) { const R = H.rng(52); mline(c, arcPts(-14, -20, 46, 38, Math.PI * 0.95, Math.PI * 2.05, 20), 3, INK, R); mline(c, arcPts(16, -20, 46, 38, Math.PI * 0.95, Math.PI * 2.05, 20), 3, INK, R); mline(c, [[-60, -14], [-50, 14], [60, 14], [62, -14]], 3, INK, R); mline(c, [[0, -56], [2, -30], [-6, -6], [0, 12]], 2.4, INK, R); mline(c, arcPts(-24, -22, 10, 8, 0, Math.PI * 1.5), 2, INK, R); mline(c, arcPts(28, -26, 10, 8, Math.PI, Math.PI * 2.4), 2, INK, R); hand(c, ['MODEL'], 0, 62, MK, INK, 53, 30); } }, 1.95);
      pin(MX, MY - 112, "#2a62c9", 2.25);
      { const R = H.rng(54); arrowM(ctx, qpts([1290, 520], [1350, 490], [1415, 520], 20), (t - 3.0) / 0.4, RED, 7, R); arrowM(ctx, qpts([1285, 640], [1350, 640], [1415, 580], 20), (t - 3.4) / 0.4, RED, 5, R); arrowM(ctx, qpts([1285, 410], [1350, 410], [1415, 460], 20), (t - 3.7) / 0.4, RED, 5, R); }
      // counter card: numbers crossed out and rewritten by hand
      {
        const s = slap(2.9);
        if (s) {
          ctx.save(); ctx.translate(1560, 850); ctx.rotate(-0.025); ctx.scale(s, s);
          const w = 500, h = 230;
          ctx.save(); ctx.filter = 'blur(6px)'; ctx.fillStyle = 'rgba(40,20,5,0.4)'; ctx.fillRect(-w / 2 + 5, -h / 2 + 8, w, h); ctx.restore();
          ctx.fillStyle = '#fbfaf3'; ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.fillStyle = 'rgba(80,140,210,0.45)'; for (let k = 0; k < 6; k++) ctx.fillRect(-w / 2, -h / 2 + 34 + k * 24, w, 1);
          const nums = [[3.05, '10'], [3.65, '1,000'], [4.3, '80,000'], [4.95, '1,000,000']];
          let shown = nums.filter((q) => t >= q[0]);
          shown.forEach(([t0, txt], i) => {
            const last = i === shown.length - 1, row = i - Math.max(0, shown.length - 3);
            if (row < 0) return;
            const y = last ? 6 : -82 + row * 34;
            wr(ctx, (t - t0) / 0.3, -w / 2, y - 46, w, 92, () => hand(ctx, [txt], 0, y, last ? '400 80px "Permanent Marker"' : '400 28px "Permanent Marker"', last ? INK : 'rgba(27,31,41,0.6)', 70 + i, 30));
            if (!last) { const R = H.rng(80 + i); mline(ctx, [[-70, y + 2], [70, y - 3]], 3, RED, R); }
          });
          if (t > 5.2) wr(ctx, (t - 5.2) / 0.35, -w / 2, 60, w, 60, () => hand(ctx, ['examples'], 0, 86, '700 40px "Caveat"', BLUE, 90, 20));
          ctx.restore();
        }
        pin(1560, 750, '#f0c419', 3.1);
      }

      // ===== BEAT 3: guess -> check -> adjust loop =====
      const GX = 2440, GY = 330, CXn = 2860, CYn = 560, AX = 2440, AY = 820;
      // new photo (polaroid)
      {
        const s = slap(6.5);
        if (s) {
          ctx.save(); ctx.translate(2100, 560); ctx.rotate(-0.06); ctx.scale(s, s);
          ctx.save(); ctx.filter = 'blur(6px)'; ctx.fillStyle = 'rgba(40,20,5,0.45)'; ctx.fillRect(-100 + 6, -120 + 9, 200, 240); ctx.restore();
          ctx.fillStyle = '#f7f5ee'; ctx.fillRect(-100, -120, 200, 240); ctx.fillStyle = '#cfd6d2'; ctx.fillRect(-84, -104, 168, 168);
          catDoodle(ctx, 0, -14, 2.2, '#2b2f36', H.rng(91));
          hand(ctx, ['new photo'], 0, 92, '700 34px "Caveat"', INK, 92, 20);
          ctx.restore();
          tape(ctx, 2100, 440, 80, 26, 0.05, 93);
        }
      }
      put({ x: GX, y: GY, w: 220, h: 220, rot: -0.04, col: YEL, seed: 61, lift: 0.8, pin: [0, 0, '#d22b2b'],
        draw(c) {
          hand(c, ['GUESS'], 0, -66, MK, INK, 62, 30);
          wr(c, (t - 7.0) / 0.3, -110, -40, 220, 70, () => hand(c, ['dog?'], 0, -4, '400 44px "Permanent Marker"', INK, 63, 40));
          const R = H.rng(64);
          if (t > 7.7) { mline(c, [[-60, -30], [-50 + 110 * H.clamp((t - 7.7) / 0.15), -30 + 50 * H.clamp((t - 7.7) / 0.15)]], 6, RED, R); }
          if (t > 7.85) { mline(c, [[50, -30], [50 - 110 * H.clamp((t - 7.85) / 0.15), -30 + 50 * H.clamp((t - 7.85) / 0.15)]], 6, RED, R); }
          if (t > 8.0) { const pr = H.clamp((t - 8.0) / 0.3); mline(c, arcPts(0, -6, 86, 40, -0.5, -0.5 + TAU * 1.05 * pr, 30), 4, RED, R); }
          wr(c, (t - 9.5) / 0.35, -110, 30, 220, 70, () => { hand(c, ['cat'], -18, 60, '400 46px "Permanent Marker"', GREEN, 65, 40); mline(c, [[40, 58], [52, 72], [78, 36]], 6, GREEN, H.rng(66)); });
        } }, 6.7);
      pin(GX, GY - 96, '#d22b2b', 6.9);
      put({ x: CXn, y: CYn, w: 220, h: 220, rot: 0.05, col: BLU, seed: 71, lift: 0.8,
        draw(c) { hand(c, ['CHECK'], 0, -66, MK, INK, 72, 30); wr(c, (t - 7.75) / 0.4, -110, -30, 220, 120, () => hand(c, ["it's a", 'cat!'], 0, 14, '400 36px "Permanent Marker"', RED, 73, 40)); } }, 7.3);
      pin(CXn, CYn - 96, '#f2f2ee', 7.5);
      put({ x: AX, y: AY, w: 220, h: 220, rot: 0.03, col: GRN, seed: 81, lift: 0.8,
        draw(c) {
          hand(c, ['ADJUST'], 0, -66, MK, INK, 82, 30);
          const R = H.rng(83), tq = Math.floor(t * 12) / 12;
          [-30, 10, 50].forEach((yy, i) => {
            mline(c, [[-80, yy], [80, yy]], 3, INK, R);
            const k0 = [-40, 30, -10][i], k1 = [35, -45, 50][i], kp = k0 + (k1 - k0) * H.ease.inOut(H.clamp((tq - 8.6 - i * 0.15) / 0.6));
            c.fillStyle = '#fbfaf3'; c.beginPath(); c.arc(kp, yy, 11, 0, TAU); c.fill(); mline(c, arcPts(kp, yy, 11, 11, 0, TAU, 14), 3, INK, R, true);
            if (tq > 8.6 + i * 0.15 && tq < 9.3 + i * 0.15) { mline(c, [[kp - 26, yy - 14], [kp - 18, yy - 14]], 2, INK, R); mline(c, [[kp + 18, yy - 14], [kp + 26, yy - 14]], 2, INK, R); }
          });
        } }, 8.2);
      pin(AX, AY - 96, '#3fae4a', 8.4);
      {
        const R = H.rng(85);
        arrowM(ctx, qpts([2205, 540], [2240, 420], [2320, 360]), (t - 6.85) / 0.3, INK, 6, R);
        arrowM(ctx, qpts([2560, 300], [2720, 300], [2770, 440]), (t - 7.35) / 0.3, INK, 6, R);
        arrowM(ctx, qpts([2780, 680], [2740, 830], [2570, 850]), (t - 8.3) / 0.3, RED, 6, R);
        if (t > 8.5) hand(ctx, ['error'], 2800, 820, '700 46px "Caveat"', RED, 86, 20);
        arrowM(ctx, qpts([2320, 760], [2250, 620], [2330, 470]), (t - 9.2) / 0.3, INK, 6, R);
      }

      // ===== BEAT 4: progress chart =====
      {
        const s = slap(10.55);
        if (s) {
          ctx.save(); ctx.translate(1060, 1250); ctx.rotate(0.015); ctx.scale(s, s);
          const w = 700, h = 430;
          ctx.save(); ctx.filter = `blur(${8 + (s - 1) * 40}px)`; ctx.fillStyle = 'rgba(40,20,5,0.42)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 10, w, h); ctx.restore();
          ctx.fillStyle = '#fbfaf3'; ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.fillStyle = 'rgba(80,140,210,0.4)'; for (let k = 0; k < 15; k++) ctx.fillRect(-w / 2, -h / 2 + 50 + k * 26, w, 1);
          ctx.fillStyle = 'rgba(220,60,70,0.6)'; ctx.fillRect(-w / 2 + 60, -h / 2, 1.4, h);
          wr(ctx, (t - 10.75) / 0.35, -w / 2, -h / 2, w, 60, () => hand(ctx, ['Accuracy'], -120, -h / 2 + 30, '400 34px "Permanent Marker"', INK, 101, 30));
          const R = H.rng(102), ox = -260, oy = 150, gw = 520, gh = 300;
          arrowM(ctx, [[ox, oy + 6], [ox, oy - gh * 0.5], [ox, oy - gh]], (t - 10.85) / 0.2, INK, 3.5, R);
          arrowM(ctx, [[ox - 6, oy], [ox + gw * 0.5, oy], [ox + gw, oy]], (t - 10.95) / 0.2, INK, 3.5, R);
          if (t > 11.1) hand(ctx, ['training rounds →'], ox + gw - 160, oy + 36, '700 48px "Caveat"', BLUE, 103, 20);
          const acc = (u) => 61 + 36 * (1 - Math.pow(1 - u, 2.2));
          const pr = H.clamp((t - 11.1) / 1.4), pts = [];
          for (let k = 0; k <= 40; k++) { const u = k / 40; if (u > pr) break; pts.push([ox + u * gw, oy - (acc(u) - 50) / 50 * gh]); }
          if (pts.length > 1) mline(ctx, pts, 4.5, RED, R);
          ctx.fillStyle = RED; for (let k = 0; k <= 8; k++) { const u = k / 8; if (u > pr) break; ctx.beginPath(); ctx.arc(ox + u * gw, oy - (acc(u) - 50) / 50 * gh, 6, 0, TAU); ctx.fill(); }
          { // axis ticks, sized to stay legible at the final pull-back; right edge kept just left of the axis
            const TF = '700 34px "Kalam"'; ctx.save(); ctx.font = TF; const w50 = ctx.measureText('50%').width, w100 = ctx.measureText('100%').width; ctx.restore();
            hand(ctx, ['50%'], ox - 8 - w50 / 2, oy, TF, INK, 104, 20); hand(ctx, ['100%'], ox - 8 - w100 / 2, oy - gh, TF, INK, 105, 20);
          }
          ctx.restore();
          pin(1060, 1050, '#d22b2b', 10.75);
        }
      }
      put({ x: 1610, y: 1200, w: 300, h: 300, rot: -0.04, col: YEL, seed: 111, lift: 0.8, pin: [0, 0, '#2a62c9'],
        draw(c) {
          hand(c, ['ACCURACY'], 0, -100, '400 34px "Permanent Marker"', INK, 112, 30);
          const seq = [[11.1, '61%'], [11.6, '74%'], [12.05, '88%'], [12.45, '97%']].filter((q) => t >= q[0]);
          seq.forEach(([t0, txt], i) => {
            const last = i === seq.length - 1, row = i - Math.max(0, seq.length - 2);
            if (row < 0) return;
            const y = last ? 40 : -52; // crossed-out row nudged up 16px to clear the larger ring
            wr(c, (t - t0) / 0.25, -150, y - (last ? 72 : 50), 300, last ? 144 : 100, () => hand(c, [txt], 0, y, last ? '400 116px "Permanent Marker"' : '400 34px "Permanent Marker"', last && i === 3 ? GREEN : (last ? INK : 'rgba(27,31,41,0.6)'), 113 + i, 40));
            if (!last) mline(c, [[-40, y + 2], [40, y - 4]], 4, RED, H.rng(120 + i));
          });
          if (t > 12.7) { const pr = H.clamp((t - 12.7) / 0.35); mline(c, arcPts(0, 42, 136, 68, -0.3, -0.3 + TAU * 1.08 * pr, 30), 5, RED, H.rng(125)); }
        } }, 10.7);
      pin(1610, 1064, '#2a62c9', 10.9);
      { const R = H.rng(130); arrowM(ctx, qpts([1420, 1130], [1450, 1110], [1470, 1150], 12), (t - 11.2) / 0.3, RED, 5, R); }

      // ===== BEAT 5: takeaway =====
      put({ x: 1740, y: 850, w: 900, h: 360, rot: -0.02, col: ORG, seed: 141, lift: 0.7, pin: [0, 0, '#d22b2b'],
        draw(c) { hand(c, ['More examples →'], 0, -60, '400 84px "Permanent Marker"', INK, 142, 70); hand(c, ['better guesses'], 0, 56, '400 84px "Permanent Marker"', INK, 143, 70); if (t > 13.9) mline(c, [[-260, 104], [-80, 98], [100, 104], [270, 96]], 6, RED, H.rng(144)); } }, 13.35);
      pin(1740, 685, '#d22b2b', 13.6);
      ctx.restore();
      // lamp + vignette + grain (screen space)
      { const g = ctx.createRadialGradient(330, 120, 50, 400, 200, 1100); g.addColorStop(0, 'rgba(255,240,210,0.18)'); g.addColorStop(0.5, 'rgba(255,240,210,0)'); g.addColorStop(1, 'rgba(40,20,0,0.3)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H_); }
      H.vignette(ctx, W, H_, 0.35, '30,15,0');
      H.grain(ctx, W, H_, 0.04, 8 + Math.floor(t * 12));
    },
    // Sound: an evidence board in a quiet office. Notes slap flat onto cork (a papery smack with a soft cork thump,
    // bigger cards land heavier), push pins press into the cork (a short dull stab), strips of tape tear and press,
    // marker squeaks are avoided: writing is a felt-tip drag, one stroke per word. Red yarn is pulled across the board
    // (a soft fibrous draw that ends in a low twang as it catches the pin). Times copied from explainer() above:
    // a note slapped at t0 (scale 1.32 -> 1 on back ease over 0.3 s) first hits the board at t0 + 0.11; a pin at t0
    // seats at t0 + 0.14.
    explainerSound(k) {
      // Chrome glitch: a noise buffer that starts within ~1e-8 s of a sample boundary (float error like 4.15 + 0.1 * 1 + 0.11)
      // spikes far above its gain. Put every start a quarter sample past the 48 kHz grid so none land there.
      { const k0 = k, sn = (t) => (Math.round(t * 48000) + 0.25) / 48000; k = { ...k0, play: (n, t, o) => k0.play(n, sn(t), o), tone: (t, o) => k0.tone(sn(t), o), noise: (t, o) => k0.noise(sn(t), o) }; }
      const D = 14.5, XW = 3200, XH = 1600, W = 1280, Hh = 720;
      const K = [[0, 560, 260, 1.25], [1.5, 560, 260, 1.25], [2.4, 1200, 560, 0.84], [5.9, 1200, 560, 0.84], [6.8, 2490, 590, 1.0], [10.1, 2490, 590, 1.0], [10.9, 1260, 1210, 0.92], [12.9, 1260, 1210, 0.92], [13.7, 1720, 850, 0.56], [99, 1720, 850, 0.56]];
      // stereo position of a board x at time t, through the same camera as explainer()
      const pan = (x, t) => {
        let ki = 0; while (ki < K.length - 2 && t > K[ki + 1][0]) ki++;
        const [ta, ax, , az] = K[ki], [tb, bx, , bz] = K[ki + 1], e = H.ease.inOut(H.clamp((t - ta) / (tb - ta)));
        const z = Math.exp(H.lerp(Math.log(az), Math.log(bz), e)), hw = W / 2 / z, cx = H.clamp(H.lerp(ax, bx, e), hw, XW - hw);
        return H.clamp((x - cx) * z / (W / 2), -1, 1) * 0.6;
      };
      const LAND = 0.11, SEAT = 0.14;
      // sticky note slapped onto cork; size 0 (small note) .. 1 (big card)
      const slapN = (t0, x, size = 0, g = 1, minor = false) => {
        const t = t0 + LAND, p = pan(x, t);
        k.play('slap', t, { gain: (0.3 + 0.2 * size) * g, pan: p, minor });
        k.noise(t, { dur: 0.08, color: 'pink', filter: 'lowpass', f: 450 + 250 * size, gain: (0.25 + 0.2 * size) * g, a: 0.002, pan: p, minor }); k.tone(t, { f: [[0, 150 - 40 * size], [0.07, 65]], dur: 0.1, gain: (0.1 + 0.12 * size) * g, pan: p, minor }); // cork takes it
      };
      // push pin pressed into cork: a short dull stab
      const pinIn = (t0, x, g = 1, minor = true) => {
        const t = t0 + SEAT, p = pan(x, t);
        k.noise(t, { dur: 0.035, filter: 'bandpass', f: 1300, q: 1.6, gain: 0.3 * g, a: 0.001, pan: p, minor });
        k.tone(t, { f: [[0, 260], [0.05, 140]], dur: 0.07, gain: 0.16 * g, pan: p, minor });
      };
      // felt-tip marker: touch down, then the stroke
      const mk = (a, b, x, g = 1, minor = true) => { const p = pan(x, a); k.noise(a, { dur: 0.02, filter: 'bandpass', f: 1500, q: 1.4, gain: 0.18 * g, a: 0.001, pan: p, minor }); k.play('stroke', a, { material: 'marker', dur: b - a, gain: g, pan: p, minor }); };
      // handwriting revealed left to right over [a, a+d]: one marker stroke per word
      const write = (s, a, d, x, g = 0.85, minor = true) => { const n = s.length, re = /\S+/g; let m; while ((m = re.exec(s))) mk(a + d * m.index / n, a + d * (m.index + m[0].length) / n, x, g, minor); };
      // red yarn drawn across the board, catching on its pin at the end
      const yarnPull = (a, d, x0, x1) => {
        k.noise(a, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 500], [d, 900]], q: 0.9, gain: 0.08, a: d * 0.3, hold: d * 0.4, pan: (pan(x0, a) + pan(x1, a + d)) / 2, minor: true });
        k.tone(a + d, { f: 'A2', type: 'triangle', dur: 0.35, gain: 0.12, a: 0.003, pan: pan(x1, a + d) });
        k.tone(a + d, { f: 'A3', dur: 0.2, gain: 0.03, a: 0.003, pan: pan(x1, a + d) });
      };

      k.bed('room', 0, D, { gain: 0.45 });

      // ---- BEAT 1: index card slaps on (0.1), "How does AI" (0.35..0.9) "learn?" (0.85..1.3), red arrow (1.3..1.6)
      slapN(0.1, 560, 1, 0.9);
      write('How does AI', 0.35, 0.55, 560, 0.95);
      k.play('tape', 0.4, { dur: 0.12, gain: 0.5, pan: pan(300, 0.4), minor: true }); k.play('tape', 0.47, { dur: 0.1, gain: 0.45, pan: pan(820, 0.47), minor: true });
      write('learn?', 0.85, 0.45, 560, 1.0, false);
      mk(1.3, 1.6, 560, 1.1, false);
      pinIn(1.55, 560, 1.1, false);
      yarnPull(1.6, 0.9, 560, 1560);

      // ---- BEAT 2: model note (1.95), its pin (2.25), twelve example notes (2.2 + k*0.13), ten more (4.15 + k*0.1)
      slapN(1.95, 1560, 0.6, 1);
      pinIn(2.25, 1560);
      for (let i = 0; i < 12; i++) slapN(2.2 + i * 0.13, 920 + (i % 3) * 135, 0, 0.6, true);
      for (let i = 0; i < 10; i++) slapN(4.15 + i * 0.1, 1060, 0, 0.45, true);
      // counter card (2.9) and its pin (3.1); numbers crossed out and rewritten
      slapN(2.9, 1560, 0.8, 0.9);
      pinIn(3.1, 1560);
      mk(3.0, 3.4, 1350); mk(3.4, 3.8, 1350); mk(3.7, 4.1, 1350); // three red arrows into the model
      write('10', 3.05, 0.3, 1560);
      [[3.65, '1,000'], [4.3, '80,000']].forEach(([t0, s]) => { mk(t0, t0 + 0.06, 1560, 0.8); write(s, t0 + 0.02, 0.3, 1560); }); // strike the old number, write the new
      mk(4.95, 5.01, 1560, 0.9); write('1,000,000', 4.97, 0.3, 1560, 1.25, false);
      k.play('tock', 5.27, { f: 300, gain: 0.45, pan: pan(1560, 5.27) }); // the marker taps a full stop under it
      write('examples', 5.2, 0.35, 1560, 0.7);

      // ---- camera follows the yarn to the loop (5.9 -> 6.8)
      yarnPull(5.9, 0.85, 1560, 2440);
      slapN(6.5, 2100, 0.7, 1); k.play('tape', 6.55, { dur: 0.12, gain: 0.5, pan: pan(2100, 6.55), minor: true }); // the new photo, taped
      slapN(6.7, 2440, 0.4, 1); pinIn(6.9, 2440); // GUESS
      mk(6.85, 7.15, 2260, 0.8); // arrow photo -> guess
      write('dog?', 7.0, 0.3, 2440, 1.0, false);
      slapN(7.3, 2860, 0.4, 1); pinIn(7.5, 2860); // CHECK
      mk(7.35, 7.65, 2700, 0.8);
      // WRONG: two red slashes over "dog?" (7.7, 7.85), then a red ring (8.0 -> 8.3)
      mk(7.7, 7.85, 2440, 1.6, false); mk(7.85, 8.0, 2440, 1.6, false);
      k.play('error', 7.7, { f: 'F3', gain: 0.55, pan: pan(2440, 7.7) });
      write("it's a cat!", 7.75, 0.4, 2860, 0.8);
      mk(8.0, 8.3, 2440, 1.1, false);
      slapN(8.2, 2440, 0.4, 0.9); pinIn(8.4, 2440); // ADJUST
      mk(8.3, 8.6, 2700, 0.9); write('error', 8.5, 0.15, 2800, 0.7);
      // sliders slide on twos (8.6 + i*0.15, 0.6 s each): a tiny dry tick per moving frame
      for (let f = Math.floor(8.6 * 12) + 1; f / 12 < 9.5; f++) k.noise(f / 12, { dur: 0.025, filter: 'bandpass', f: 1100 + (f % 3) * 120, q: 1.5, gain: 0.22, a: 0.001, pan: pan(2440, f / 12), minor: true });
      mk(9.2, 9.5, 2290, 0.9); // arrow back to the guess
      // CORRECTION: "cat ✓" in green (9.5 -> 9.85)
      mk(9.5, 9.66, 2420, 1.1, false); mk(9.72, 9.85, 2490, 1.2, false);
      k.play('success', 9.85, { f: 'G5', gain: 0.6, pan: pan(2440, 9.85) });

      // ---- yarn down to the chart (10.1 -> 10.9)
      yarnPull(10.1, 0.8, 2470, 1450);
      slapN(10.55, 1060, 1, 1); slapN(10.7, 1610, 0.6, 0.9); // chart card, accuracy note
      pinIn(10.75, 1060); pinIn(10.9, 1610);
      write('Accuracy', 10.75, 0.35, 940, 0.75);
      mk(10.85, 11.05, 800, 0.7); mk(10.95, 11.15, 1060, 0.7); // axes
      mk(11.1, 12.5, 1060, 0.5); // the red curve
      mk(11.2, 11.5, 1445, 0.7); // little arrow to the note
      write('61%', 11.1, 0.25, 1610);
      [[11.6, '74%'], [12.05, '88%']].forEach(([t0, s]) => { mk(t0, t0 + 0.05, 1610, 0.8); write(s, t0 + 0.02, 0.25, 1610); });
      // 97% lands (12.45), in green, big: the big hit; red ring (12.7 -> 13.05)
      mk(12.45, 12.5, 1610, 0.9);
      k.play('impact', 12.47, { gain: 1.35, pan: pan(1610, 12.47) });
      write('97%', 12.47, 0.25, 1610, 1.4, false);
      k.play('ding', 12.5, { f: 'E5', gain: 0.45, pan: pan(1610, 12.5) });
      mk(12.7, 13.05, 1610, 1.2, false);

      // ---- BEAT 5: camera pulls back (12.9 -> 13.7), the takeaway note slaps on (13.35), pinned (13.6), underlined (13.9)
      slapN(13.35, 1740, 1, 1.15);
      pinIn(13.6, 1740, 1.2, false);
      ['C5', 'E5', 'G5'].forEach((f, i) => k.play('ding', 13.5 + i * 0.08, { f, gain: 0.38 - i * 0.06, pan: (i - 1) * 0.25 }));
      mk(13.9, 14.02, 1740, 1.1, false);
    },

    // ===== END EXPLAINER =====
  });
}
