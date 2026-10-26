{
  const TAU = Math.PI * 2;
  const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const LIGHT = nrm([-0.5, -0.66, 0.58]);
  const HALF = nrm([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);

  // lumpy closed shape from a centre + radius function
  const lumpy = (c, nz, cx, cy, rx, ry, seed, amp = 0.05, rot = 0) => {
    c.beginPath();
    const N = 72, cr = Math.cos(rot), sr = Math.sin(rot);
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * TAU, k = 1 + amp * nz.n2(Math.cos(a) * 1.3 + seed, Math.sin(a) * 1.3 + seed * 0.7);
      const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
      const px = cx + x * cr - y * sr, py = cy + x * sr + y * cr;
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.closePath();
    c.fill();
  };

  let WALL = null; // static set wall: identical every frame, rendered once
  const SEQ = {
    pop: [[0.5, 0.42], [1.16, 0.8], [0.9, 1.14], [1.04, 0.97], [1, 1]],
    lid: [[1, 0.12], [1, 0.38], [1, 0.66], [1, 0.9], [1, 1.05], [1, 1]],
  };
  // =====================================================================
  // EXPLAINER: a fixed clay set; every prop is a baked plasticine lump that
  // is placed, popped, slid and dropped on twos (12 fps) like a real animator
  // moving pieces between exposures. Sprites are baked once and cached.
  // =====================================================================
  const CLX = {};
  const cnz = () => CLX.nz || (CLX.nz = H.makeNoise(8));
  // bake a clay lump; draw(c) paints the silhouette in local coords [0..w]x[0..h]
  const bake = (key, w, h, o) => {
    if (CLX[key]) return CLX[key];
    const nz = cnz(), R = o.R || 14, pad = Math.ceil(R * 2 + 6), ox = o.ox || 0, oy = o.oy || 0;
    const W2 = Math.ceil(w + pad * 2), H2 = Math.ceil(h + pad * 2);
    const M = H.layer(W2, H2), mc = M.getContext('2d', { willReadFrequently: true });
    mc.translate(pad, pad); mc.fillStyle = '#fff'; mc.strokeStyle = '#fff'; o.draw(mc);
    const ds = 3, sw = Math.ceil(W2 / ds), sh = Math.ceil(H2 / ds);
    const Bs = H.layer(sw, sh), bsc = Bs.getContext('2d'); bsc.filter = `blur(${R / ds}px)`; bsc.drawImage(M, 0, 0, sw, sh);
    const B = H.layer(W2, H2), bc = B.getContext('2d', { willReadFrequently: true }); bc.drawImage(Bs, 0, 0, W2, H2);
    const md = mc.getImageData(0, 0, W2, H2).data, bd = bc.getImageData(0, 0, W2, H2).data;
    const Hh = new Float32Array(W2 * H2), A = new Float32Array(W2 * H2), lump = o.lump ?? 1.2, seed = o.seed || 1;
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
      const i = y * W2 + x, a = bd[i * 4 + 3] / 255, ap = H.clamp((a - 0.42) / 0.58);
      A[i] = ap;
      if (!md[i * 4 + 3]) continue;
      const X = x + ox, Y = y + oy;
      Hh[i] = Math.sqrt(1 - (1 - ap) * (1 - ap)) * R * (o.dome ?? 1.1) + nz.n2(X * 0.025 + seed, Y * 0.025) * lump + nz.n2(X * 0.11 + (o.boil || 0) * 1.7, Y * 0.11 + seed) * 0.35;
    }
    (o.fps || []).forEach((f) => {
      const R2 = f[2], ang = f[3], ca = Math.cos(ang), sa = Math.sin(ang);
      for (let y = Math.max(0, Math.floor(f[1] + pad - R2)); y <= Math.min(H2 - 1, f[1] + pad + R2); y++) for (let x = Math.max(0, Math.floor(f[0] + pad - R2)); x <= Math.min(W2 - 1, f[0] + pad + R2); x++) {
        const dx0 = x - pad - f[0], dy0 = y - pad - f[1], dx = dx0 * ca + dy0 * sa, dy = (-dx0 * sa + dy0 * ca) * 1.45, d = Math.hypot(dx, dy);
        if (d >= R2) continue;
        Hh[y * W2 + x] += Math.sin(d * 1.6 + nz.n2(dx * 0.06 + ang, dy * 0.06) * 2.5) * 0.22 * Math.pow(1 - d / R2, 1.5) * H.smooth(-0.6, 0.4, Math.cos(Math.atan2(dy, dx) - ang * 2));
      }
    });
    (o.marks || []).forEach((m) => {
      const [ax, ay, bx, by] = m.map((v, i) => (i < 4 ? v + pad : v)), vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1, dep = m[4] || 1.2;
      for (let y = Math.max(0, Math.floor(Math.min(ay, by) - 9)); y <= Math.min(H2 - 1, Math.max(ay, by) + 9); y++) for (let x = Math.max(0, Math.floor(Math.min(ax, bx) - 9)); x <= Math.min(W2 - 1, Math.max(ax, bx) + 9); x++) {
        const u = H.clamp(((x - ax) * vx + (y - ay) * vy) / L2), d = Math.hypot(x - ax - vx * u, y - ay - vy * u);
        if (d > 8) continue;
        Hh[y * W2 + x] += Math.sin(Math.PI * Math.min(1, u * 1.05 + 0.02)) * (-dep * Math.exp((-d * d) / (o.markW || 3.2)) + 0.4 * dep * Math.exp(-((d - 3.4) ** 2) / 2));
      }
    });
    const out = mc.createImageData(W2, H2), od = out.data, base = H.hex(o.color), sss = o.sss || [1.12, 0.92, 0.85];
    for (let y = 1; y < H2 - 1; y++) for (let x = 1; x < W2 - 1; x++) {
      const i = y * W2 + x, ma = md[i * 4 + 3];
      if (!ma) continue;
      const n = nrm([-(Hh[i + 1] - Hh[i - 1]) * 0.5, -(Hh[i + W2] - Hh[i - W2]) * 0.5, 1]);
      const diff = H.clamp((n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2] + 0.42) / 1.42);
      const spec = Math.pow(Math.max(0, n[0] * HALF[0] + n[1] * HALF[1] + n[2] * HALF[2]), 26) * (o.spec ?? 0.3);
      const k = (0.3 + 0.86 * diff) * (0.72 + 0.28 * Math.min(1, A[i] * 1.4)), sh2 = 1 - diff, k4 = i * 4;
      od[k4] = Math.min(255, base[0] * k * (1 + (sss[0] - 1) * sh2) + spec * 255);
      od[k4 + 1] = Math.min(255, base[1] * k * (1 + (sss[1] - 1) * sh2) + spec * 245);
      od[k4 + 2] = Math.min(255, base[2] * k * (1 + (sss[2] - 1) * sh2) + spec * 230);
      od[k4 + 3] = ma;
    }
    const O = H.layer(W2, H2); O.getContext('2d').putImageData(out, 0, 0); O.pad = pad; O.w = w; O.h = h;
    return (CLX[key] = O);
  };
  // place a sprite: (x,y) = top-left of its shape box; anchor (ax,ay) in local coords for squash/rotate
  const place = (ctx, spr, x, y, o = {}) => {
    if (!spr) return;
    const ax = o.ax ?? spr.w / 2, ay = o.ay ?? spr.h;
    ctx.save();
    if (o.shadow !== false) { const s = o.shadow || {}; ctx.shadowColor = `rgba(40,20,10,${s.a ?? 0.4})`; ctx.shadowBlur = s.blur ?? 10; ctx.shadowOffsetX = s.dx ?? 6; ctx.shadowOffsetY = s.dy ?? 7; }
    ctx.translate(x + ax, y + ay); if (o.rot) ctx.rotate(o.rot); ctx.scale(o.sx ?? 1, o.sy ?? 1); ctx.translate(-ax, -ay);
    ctx.drawImage(spr, -spr.pad, -spr.pad); ctx.restore();
  };
  const prn = (seed, w, h, n, R) => { const r = H.rng(seed); return Array.from({ length: n }, () => [r.range(w * 0.15, w * 0.85), r.range(h * 0.15, h * 0.85), R * r.range(0.7, 1.2), r() * 50]); };
  const FR = (px) => `700 ${px}px "Fredoka"`;
  const mctx = () => CLX.m || (CLX.m = H.layer(4, 4).getContext('2d'));
  const glyph = (ch, px, col) => {
    const c = mctx(); c.font = FR(px); const w = Math.ceil(c.measureText(ch).width) + 4, h = Math.ceil(px * 1.05);
    return bake('g' + ch + px + col, w, h, { R: Math.max(4, px * 0.075), dome: 1.3, lump: 0.8, seed: ch.charCodeAt(0), color: col, draw: (x) => { x.font = FR(px); x.fillText(ch, 2, px * 0.82); }, fps: px > 60 ? prn(ch.charCodeAt(0) + px, w, h, 1, px * 0.18) : [] });
  };
  const PAL = ['#f2c14e', '#f07b5a', '#f6efe3', '#ef8fb0', '#a8dd8a', '#7fd0e0'];

  const EXPLAIN = (ctx, W, H_, t) => {
    const nz = cnz();
    const tq = Math.floor(t * 12) / 12, fr = Math.floor(t * 12);
    // ---- stepped life of a piece: pops on (squash & stretch), then leaves by falling / sliding ----
    const life = (st, en = 99, seed = 0, mode = 'fall') => {
      if (tq + 1e-6 < st) return null;
      const k = Math.floor((tq - st) * 12 + 1e-6), e = SEQ.pop[Math.min(4, k >> 1)];
      let sx = e[0], sy = e[1], dx = 0, dy = 0, rot = 0;
      if (tq >= en) {
        const d = tq - en + 1 / 12;
        if (mode === 'fall') { dy = 2400 * d * d; rot = ((((seed * 37) % 10) / 10) - 0.5) * d * 5; }
        else if (mode === 'right') dx = 2600 * d * d;
        else if (mode === 'left') dx = -2600 * d * d;
        if (dy > 900 || Math.abs(dx) > 1500) return null;
      }
      return { sx, sy, dx, dy, rot };
    };
    const word = (str, x, y, px, st, en, mode = 'fall', cols = PAL, step = 1 / 12, colOff = 0) => {
      const c = mctx(); c.font = FR(px);
      let cx = x, i = 0;
      for (const ch of str) {
        const w = c.measureText(ch).width;
        if (ch !== ' ') {
          const L = life(st + i * step, en == null ? 99 : en + (mode === 'fall' ? i * (1 / 24) : 0), i + colOff, mode);
          if (L) {
            const jr = H.rng(ch.charCodeAt(0) * 7 + i + colOff);
            const col = typeof cols === 'string' ? cols : cols[(i + colOff) % cols.length];
            place(ctx, glyph(ch, px, col), cx + L.dx, y - px * 0.82 + L.dy, { sx: L.sx, sy: L.sy, rot: (jr() - 0.5) * 0.14 + L.rot, shadow: { blur: px * 0.09, dx: px * 0.05, dy: px * 0.07, a: 0.45 } });
          }
        }
        cx += w + px * 0.04; i++;
      }
      return cx;
    };
    const wordW = (str, px) => { const c = mctx(); c.font = FR(px); let w = 0; for (const ch of str) w += c.measureText(ch).width + px * 0.04; return w; };
    const obj = (spr, x, y, L, o = {}) => { if (L) place(ctx, spr, x + L.dx, y + L.dy, { ...o, sx: (o.sx ?? 1) * L.sx, sy: (o.sy ?? 1) * L.sy, rot: (o.rot || 0) + L.rot }); };
    const boil = fr % 3;
    // contact AO: one cached blurred ellipse, scaled under anything resting on the table
    const AO = CLX.ao || (CLX.ao = (() => { const C = H.layer(240, 100), c = C.getContext('2d'); c.filter = 'blur(10px)'; c.fillStyle = 'rgb(70,20,5)'; c.beginPath(); c.ellipse(120, 50, 90, 22, 0, 0, TAU); c.fill(); return C; })());
    const contact = (cx, cy, rx, ry, a = 0.45) => { ctx.save(); ctx.globalAlpha = a; ctx.drawImage(AO, cx - (rx * 120) / 90, cy - (ry * 50) / 22, (rx * 240) / 90, (ry * 100) / 22); ctx.restore(); };

    // ---------- set: wall + table, baked once ----------
    if (!CLX.bg) {
      const C = H.layer(W, H_), c = C.getContext('2d');
      c.fillStyle = '#3f8593'; c.fillRect(0, 0, W, H_);
      const wall = bake('wall', W, 520, { R: 4, dome: 0, lump: 3.2, seed: 3, color: '#4f9fae', spec: 0.12, draw: (x) => x.fillRect(-30, -30, W + 60, 580), fps: prn(11, W, 470, 12, 30), markW: 14 });
      c.save(); c.filter = 'blur(1.6px)'; c.drawImage(wall, -wall.pad, -wall.pad); c.restore();
      const g = c.createRadialGradient(620, 220, 30, 640, 300, 760); g.addColorStop(0, 'rgba(255,240,200,0.22)'); g.addColorStop(1, 'rgba(10,20,30,0.35)');
      c.fillStyle = g; c.fillRect(0, 0, W, H_);
      const tab = bake('table', W + 80, 240, { R: 22, dome: 1.0, lump: 2.4, seed: 80, color: '#d0703f', draw: (x) => { x.beginPath(); x.moveTo(0, 14); for (let X = 0; X <= W + 80; X += 20) x.lineTo(X, 6 + nz.n2(X * 0.01, 3) * 8); x.lineTo(W + 80, 300); x.lineTo(0, 300); x.closePath(); x.fill(); }, fps: prn(81, W, 200, 7, 30), marks: (() => { const r = H.rng(82); return Array.from({ length: 6 }, () => { const x = r.range(40, W), y = r.range(40, 200), a = r() * TAU, l = r.range(50, 110); return [x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, 1.2]; }); })(), markW: 16 });
      c.save(); c.shadowColor = 'rgba(40,20,10,0.35)'; c.shadowBlur = 30; c.shadowOffsetY = -10; c.drawImage(tab, -40 - tab.pad, 500 - tab.pad); c.restore();
      const g2 = c.createLinearGradient(0, 600, 0, H_); g2.addColorStop(0, 'rgba(60,20,10,0)'); g2.addColorStop(1, 'rgba(60,20,10,0.35)');
      c.fillStyle = g2; c.fillRect(0, 600, W, 120);
      CLX.bg = C;
    }
    ctx.drawImage(CLX.bg, 0, 0);

    // ---------- props (baked) ----------
    const brainS = bake('brain' + boil, 280, 210, { R: 26, lump: 1.6, seed: 31, color: '#ef8fb0', boil, draw: (c) => {
      [[70, 90, 70], [130, 60, 68], [200, 75, 66], [225, 130, 58], [160, 140, 70], [85, 145, 62], [140, 100, 80]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r * 0.95, 0, TAU); c.fill(); });
    }, markW: 7, marks: [[140, 18, 140, 192, 3.0], [40, 80, 75, 70, 2.2], [75, 70, 100, 100, 2.2], [55, 125, 105, 120, 2.2], [90, 165, 125, 145, 2.2], [100, 40, 120, 60, 2.0], [170, 40, 200, 65, 2.2], [200, 65, 240, 60, 2.2], [175, 105, 230, 120, 2.2], [165, 160, 210, 150, 2.2], [210, 150, 245, 165, 2.0], [60, 100, 120, 92, 1.8]], fps: prn(33, 280, 210, 2, 24) });
    const card = (kind) => CLX['card' + kind] || (CLX['card' + kind] = (() => {
      const cat = kind === 'cat', C = H.layer(190, 210), c = C.getContext('2d');
      const slab = bake('slab', 150, 170, { R: 10, dome: 0.7, lump: 0.8, seed: 5, color: '#f6efe3', sss: [1.04, 1, 1], draw: (x) => { x.beginPath(); x.roundRect(0, 0, 150, 170, 14); x.fill(); }, fps: prn(6, 150, 170, 2, 18) });
      const pc = (spr, x, y) => { c.save(); c.shadowColor = 'rgba(40,20,10,0.4)'; c.shadowBlur = 5; c.shadowOffsetX = 3; c.shadowOffsetY = 4; c.drawImage(spr, x - spr.pad, y - spr.pad); c.restore(); };
      pc(slab, 15, 10);
      const head = bake('head' + kind, 104, 96, { R: 14, lump: 0.8, seed: cat ? 41 : 42, color: cat ? '#f08a3c' : '#a8673c', draw: (x) => {
        x.beginPath(); x.ellipse(52, 56, 46, 38, 0, 0, TAU); x.fill();
        if (cat) { x.beginPath(); x.moveTo(12, 40); x.lineTo(20, 0); x.lineTo(46, 24); x.fill(); x.beginPath(); x.moveTo(92, 40); x.lineTo(84, 0); x.lineTo(58, 24); x.fill(); }
        else { x.beginPath(); x.ellipse(10, 54, 12, 30, 0.25, 0, TAU); x.fill(); x.beginPath(); x.ellipse(94, 54, 12, 30, -0.25, 0, TAU); x.fill(); }
      }, fps: prn(cat ? 43 : 44, 104, 96, 1, 16) });
      pc(head, 38, 28);
      const eye = bake('eye', 12, 12, { R: 5, dome: 1.4, lump: 0.2, seed: 9, color: '#23202a', spec: 0.9, draw: (x) => { x.beginPath(); x.arc(6, 6, 6, 0, TAU); x.fill(); } });
      pc(eye, 66, 72); pc(eye, 100, 72);
      const nose = bake('nose' + kind, 16, 11, { R: 5, dome: 1.4, lump: 0.2, seed: 10, color: cat ? '#e0607a' : '#23202a', spec: 0.6, draw: (x) => { x.beginPath(); x.ellipse(8, 5.5, 8, 5.5, 0, 0, TAU); x.fill(); } });
      pc(nose, 82, 92);
      // the label is part of the card: clay letters pressed into the slab
      const lw = wordW(kind, 40); let lx = 95 - lw / 2;
      for (const ch of kind) { const g = glyph(ch, 40, cat ? '#e0607a' : '#2e6f9a'); pc(g, lx, 132); lx += mctx().measureText(ch).width + 1.6; }
      C.pad = 0; C.w = 190; C.h = 210;
      return C;
    })());
    const coilAbs = (key, pts, col, L, wdt) => {
      if (!L) return;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
      x0 -= 30; y0 -= 30; x1 += 30; y1 += 30;
      const spr = bake('coil' + key, x1 - x0, y1 - y0, { R: 7, dome: 1.3, lump: 0.6, seed: key.length * 7, color: col, draw: (c) => {
        c.translate(-x0, -y0); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = wdt || 16;
        c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
        const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2], a = Math.atan2(ey - py, ex - px);
        c.beginPath(); c.moveTo(ex + Math.cos(a) * 22, ey + Math.sin(a) * 22); c.lineTo(ex + Math.cos(a + 2.3) * 26, ey + Math.sin(a + 2.3) * 26); c.lineTo(ex + Math.cos(a - 2.3) * 26, ey + Math.sin(a - 2.3) * 26); c.closePath(); c.fill();
      } });
      place(ctx, spr, x0 + L.dx, y0 + L.dy, { sx: L.sx, sy: L.sy, ax: pts[0][0] - x0, ay: pts[0][1] - y0, rot: L.rot, shadow: { blur: 6, dx: 4, dy: 6, a: 0.4 } });
    };
    const curve = (ax, ay, cx, cy, bx, by) => Array.from({ length: 21 }, (_, i) => { const u = i / 20; return [(1 - u) * (1 - u) * ax + 2 * u * (1 - u) * cx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * u * (1 - u) * cy + u * u * by]; });

    // ================= BEAT 1: the question, pressed letters on the wall =================
    word('How does', 640 - wordW('How does', 104) / 2, 230, 104, 0.1, 2.0, 'fall', PAL);
    word('AI learn?', 640 - wordW('AI learn?', 120) / 2, 390, 120, 0.85, 2.15, 'fall', PAL, 1 / 12, 3);
    // header: the question rides along, top-left
    word('How does AI learn?', 28, 64, 44, 2.35, null, 'fall', '#f6efe3', 1 / 24);

    // ================= BEAT 2: labelled examples slide into the clay brain =================
    // brain position: on the right in beat 2, pushed to centre for beat 3, off right for beat 4
    const bShift = Math.round(H.ease.inOut(H.clamp((tq - 5.9) / 0.5)) * 6) / 6;
    let bx = H.lerp(880, 470, bShift), by = 300;
    let gulp = 0;
    const KINDS = ['cat', 'dog', 'dog', 'cat', 'dog', 'cat', 'cat', 'dog'];
    KINDS.forEach((k, i) => { const s0 = 2.5 + i * 0.36, arrive = s0 + (bx - 40 + 150) / 600; if (tq >= arrive && tq < arrive + 0.17) gulp = 1; });
    const exitB = tq >= 10.25 ? 2600 * (tq - 10.25 + 1 / 12) ** 2 : 0;
    const drawBrain = () => { if (tq >= 2.4 && exitB < 1400) {
      const L = life(2.4);
      contact(bx + 140 + exitB, by + 206, 128 * L.sx, 13 * L.sy, 0.55);
      contact(bx + 140 + exitB, by + 210, 70 * L.sx, 6, 0.4);
      place(ctx, brainS, bx + exitB, by, { sx: L.sx * (gulp ? 1.07 : 1), sy: L.sy * (gulp ? 0.93 : 1), shadow: { blur: 22, dx: 12, dy: 14, a: 0.42 } });
      word('model', bx + 140 - wordW('model', 52) / 2 + exitB, 600, 52, 2.6, 6.25, 'fall', '#ef8fb0');
    } };
    if (tq < 6.3) {
      // counter: clay digits re-pressed each time the number changes
      const n = Math.round(1e6 * Math.pow(H.clamp((tq - 2.7) / 2.5), 2)), str = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      if (tq >= 2.55) {
        const e = word(str, 40, 200, 88, 2.55, 5.8, 'fall', '#f2c14e', 0);
        word('examples', e + 14, 196, 48, 2.7, 5.85, 'fall', '#a8dd8a', 1 / 24);
      }
      coilAbs('a1', curve(70, 270, 420, 235, 800, 290), '#f6efe3', life(2.55, 5.75, 3), 16);
      KINDS.forEach((k, i) => {
        const s0 = 2.5 + i * 0.36;
        if (tq < s0) return;
        const x = -190 + (tq - s0) * 600;
        if (x > bx - 40) return;
        const hop = ((fr + i) % 2) * 5;
        const L = life(s0, 5.75, i);
        if (L && L.dy < 40) contact(x + L.dx + 95, 512, 78, 9 - hop * 0.6, 0.32 - hop * 0.02);
        if (L) place(ctx, card(k), x + L.dx, 300 - hop + L.dy, { rot: (((i * 37) % 10) / 100 - 0.05) + L.rot, shadow: { blur: 12, dx: 8, dy: 8, a: 0.4 } });
      });
    }

    drawBrain();
    // ================= BEAT 3: guess -> check -> adjust =================
    if (tq >= 6.1 && tq < 10.7) {
      const out = 10.25;
      { const L = life(6.2, out, 1, 'right'); if (L) contact(135 + L.dx, 512, 78 * L.sx, 9, 0.32); }
      obj(card('cat'), 40, 300, life(6.2, out, 1, 'right'), { shadow: { blur: 12, dx: 8, dy: 8, a: 0.4 } });
      coilAbs('a2', curve(250, 400, 330, 380, 440, 400), '#f6efe3', life(6.45, out, 2, 'right'));
      coilAbs('a3', curve(770, 360, 810, 320, 860, 340), '#f6efe3', life(6.9, out, 3, 'right'));
      word('Guess', 735, 290, 50, 7.0, out, 'right', '#f2c14e', 1 / 24);
      // knobs (weights) under the brain turn in steps
      const kn = bake('knob', 64, 64, { R: 12, dome: 1.2, lump: 0.6, seed: 61, color: '#c9c5bd', sss: [1.04, 1, 1.02], draw: (c) => { c.beginPath(); c.arc(32, 32, 32, 0, TAU); c.fill(); }, fps: [[32, 32, 14, 1]] });
      const ptr = bake('ptr', 10, 30, { R: 4, dome: 1.3, lump: 0.2, seed: 62, color: '#c43a46', draw: (c) => c.fillRect(0, 0, 10, 30) });
      const turn = Math.round(H.clamp((tq - 8.9) / 0.6) * 4) / 4;
      [0, 1, 2].forEach((i) => {
        const L = life(6.3 + i * 0.08, out, i, 'right'); if (!L) return;
        const kx = bx + 30 + i * 80, ky = 540;
        contact(kx + 34 + L.dx, ky + 60, 38 * L.sx, 8, 0.7);
        place(ctx, kn, kx + L.dx, ky, { sx: L.sx, sy: L.sy, shadow: { blur: 8, dx: 5, dy: 6, a: 0.45 } });
        const a = [-0.9, 0.6, -0.3][i] + [1.5, -1.1, 1.2][i] * turn;
        place(ctx, ptr, kx + 27 + L.dx, ky + 2, { ax: 5, ay: 30, rot: a, sx: L.sx, sy: L.sy, shadow: { blur: 3, dx: 2, dy: 3, a: 0.4 } });
      });
      // speech bubble with the guess
      const bub = bake('bubble', 330, 220, { R: 18, lump: 1.0, seed: 71, color: '#f6efe3', sss: [1.05, 1, 0.98], draw: (c) => { c.beginPath(); c.ellipse(170, 90, 160, 88, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(60, 140); c.lineTo(20, 215); c.lineTo(120, 165); c.closePath(); c.fill(); }, fps: prn(72, 330, 180, 2, 22) });
      const shake = tq >= 7.92 && tq < 8.4 ? ((fr % 2) * 2 - 1) * 9 : 0;
      obj(bub, 880 + shake, 210, life(7.25, out, 4, 'right'), { shadow: { blur: 16, dx: 10, dy: 10, a: 0.4 } });
      if (tq < out) {
        word('dog?', 945 + shake, 340, 96, 7.4, 9.55, 'fall', '#2e3760', 1 / 12);
        // wrong: red clay X slapped on, "Check" pressed below
        const xs = bake('xmark', 120, 120, { R: 10, lump: 0.6, seed: 73, color: '#d9473b', draw: (c) => { c.lineWidth = 28; c.lineCap = 'round'; c.beginPath(); c.moveTo(16, 16); c.lineTo(104, 104); c.moveTo(104, 16); c.lineTo(16, 104); c.stroke(); } });
        obj(xs, 1130, 160, life(7.9, 9.5, 5), { rot: 0.1, shadow: { blur: 10, dx: 6, dy: 8, a: 0.45 } });
        word('Check', 935, 492, 52, 8.0, 9.55, 'fall', '#f07b5a', 1 / 24);
        coilAbs('a4', curve(1010, 520, 980, 640, 760, 600), '#d9473b', life(8.35, 9.55, 6));
        word('Adjust', 520, 690, 52, 8.6, 9.6, 'fall', '#f07b5a', 1 / 24);
        word('cat', 965, 340, 104, 9.7, out, 'right', '#4f9a52', 1 / 12);
        const ck = bake('check', 120, 100, { R: 10, lump: 0.6, seed: 74, color: '#4f9a52', draw: (c) => { c.lineWidth = 26; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(14, 54); c.lineTo(44, 84); c.lineTo(106, 16); c.stroke(); } });
        obj(ck, 1130, 160, life(9.9, out, 7, 'right'), { shadow: { blur: 10, dx: 6, dy: 8, a: 0.45 } });
      }
    }

    // ================= BEAT 4: accuracy bars squished up from the table =================
    if (tq >= 10.4) {
      const accs = [61, 72, 80, 86, 90, 93, 95, 97];
      let shown = 61;
      accs.forEach((a, i) => {
        const st = 10.6 + i * 0.25, hgt = Math.round(a * 3.4);
        if (tq < st) return;
        const spr = bake('bar' + i, 70, hgt, { R: 16, lump: 1.2, seed: 90 + i, color: i === 7 ? '#d9473b' : i % 2 ? '#7fd0e0' : '#f2c14e', draw: (c) => { c.beginPath(); c.roundRect(0, 0, 70, hgt + 20, 22); c.fill(); }, fps: prn(95 + i, 70, hgt, 1, 18) });
        const k = Math.floor((tq - st) * 12 + 1e-6), e = [[1.25, 0.2], [1.12, 0.55], [0.95, 1.08], [1.03, 0.97], [1, 1]][Math.min(4, k >> 1)];
        contact(187 + i * 96, 538, 46 * e[0], 9, 0.7);
        place(ctx, spr, 150 + i * 96, 520 - hgt, { sx: e[0], sy: e[1], ay: hgt + 20, shadow: { blur: 14, dx: 9, dy: 6, a: 0.4 } });
        shown = H.lerp(i ? accs[i - 1] : 61, a, H.clamp((tq - st) / 0.25));
      });
      word('Accuracy', 40, 175, 64, 10.45, null, 'fall', '#a8dd8a', 1 / 24);
      const v = Math.round(shown) + '%';
      const big = tq >= 12.6 ? [1.25, 1.12, 1.05, 1][Math.min(3, Math.floor((tq - 12.6) * 6))] : 1;
      ctx.save(); ctx.translate(560, 140); ctx.scale(big, big); ctx.translate(-560, -140);
      word(v, 400, 205, 128, 10.5, null, 'fall', tq >= 12.6 ? '#f07b5a' : '#f6efe3', 0);
      ctx.restore();
      if (tq >= 12.6) {
        const star = bake('star', 120, 120, { R: 12, lump: 0.6, seed: 75, color: '#f2c14e', spec: 0.5, draw: (c) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * TAU, r = i % 2 ? 24 : 58; c.lineTo(60 + Math.cos(a) * r, 62 + Math.sin(a) * r); } c.closePath(); c.fill(); } });
        obj(star, 822, 40, life(12.6), { rot: Math.round((tq - 12.6) * 6) * 0.08, ax: 60, ay: 60, shadow: { blur: 10, dx: 6, dy: 8, a: 0.45 } });
      }
      word('training rounds', 640 - wordW('training rounds', 44) / 2, 600, 44, 11.0, 12.95, 'fall', '#f6efe3', 1 / 24);
    }

    // ================= BEAT 5: takeaway pressed into the table front =================
    if (tq >= 13.0) {
      const p = 50, l1 = 'More examples', l2 = 'better guesses';
      const w1 = wordW(l1, p), w2 = wordW(l2, p), tot = w1 + 90 + w2, x0 = 640 - tot / 2;
      word(l1, x0, 640, p, 13.0, null, 'fall', '#f6efe3', 1 / 24);
      coilAbs('a5', [[x0 + w1 + 14, 622], [x0 + w1 + 52, 622]], '#f2c14e', life(13.5), 12);
      word(l2, x0 + w1 + 90, 640, p, 13.55, null, 'fall', '#f2c14e', 1 / 24, 2);
    }

    // ---------- lens finish ----------
    ctx.save(); ctx.globalCompositeOperation = 'soft-light';
    const gg = ctx.createLinearGradient(0, 0, W, H_); gg.addColorStop(0, 'rgba(255,220,170,0.5)'); gg.addColorStop(1, 'rgba(40,60,90,0.4)');
    ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H_); ctx.restore();
    H.vignette(ctx, W, H_, 0.42, '20,12,8');
    { const f = (H.rng(900 + fr)() - 0.5) * 0.06; ctx.fillStyle = f > 0 ? `rgba(255,240,220,${f})` : `rgba(0,0,0,${-f})`; ctx.fillRect(0, 0, W, H_); }
    H.grain(ctx, W, H_, 0.03, 4 + fr);
  };

  registerStyle({
    id: 'claymation',
    name: 'Claymation Set',
    category: 'Paper & Craft',
    description: 'A plasticine stop-motion still: chunky hand-squished characters and props with soft waxy subsurface shading, thumbprints, tool marks and lumpy silhouettes on a sculpted clay set, shot with shallow depth of field.',
    motion: 'Animated on twos: the character boils subtly between frames, fingerprints shift, the waving arm snaps pose-to-pose and the chat-bubble dots pop like little clay balls.',
    fonts: ['700 92px "Fredoka"', '700 44px "Fredoka"'],
    frameT: 4.8,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Animated on twos on one clay set: every piece is a baked plasticine lump that the "animator" pops on with squash-and-stretch, slides along the table or knocks off so it falls out of frame; arrows are rolled clay coils, labels and the counter are pressed clay letters re-sculpted each time the number changes, and the wrong guess gets a red clay X slapped on with a shake.',
    explainer(ctx, W, H_, t) { EXPLAIN(ctx, W, H_, t); },
    // Sound: plasticine on a stop-motion set, animated on twos. Every event lands on the 12 fps grid (a piece set to
    // appear at s shows on the first frame >= s), and every piece that pops on gets a soft, low clay "plop" (no
    // chirps); squashes squelch, coils slap down, pieces knocked off the table land offscreen as dull thuds, pieces
    // swept off to the right smear across the table. Times mirror EXPLAIN() above (life()/word() starts, step 1/12 or 1/24).
    explainerSound(k) {
      const q = (s) => Math.ceil(s * 12 - 1e-6) / 12;
      const pan = (x) => H.clamp((x / 1280) * 2 - 1, -1, 1) * 0.6;
      const plop = (t, g = 1, f = 170, p = 0, minor = true) => {
        k.tone(t, { f: [[0, f * 1.6], [0.06, f * 0.7]], dur: 0.11, gain: 0.3 * g, pan: p, minor });
        k.noise(t, { dur: 0.05, color: 'brown', filter: 'lowpass', f: 700, gain: 0.28 * g, a: 0.002, pan: p, minor });
        k.noise(t, { dur: 0.04, filter: 'bandpass', f: 520, q: 1.5, gain: 0.1 * g, a: 0.002, pan: p, minor });
      };
      const squelch = (t, g = 1, p = 0, d = 0.14, minor = true) => {
        k.noise(t, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 280], [d, 650]], q: 2, gain: 0.3 * g, a: 0.02, pan: p, minor });
        k.tone(t, { f: [[0, 90], [d, 130]], dur: d, gain: 0.12 * g, pan: p, minor });
      };
      const floor = (t, n, g = 1, minor = true) => { // pieces knocked off the table landing offscreen
        for (let i = 0; i < n; i++) k.noise(t + i * 0.07 + (i % 2) * 0.02, { dur: 0.09, color: 'brown', filter: 'lowpass', f: 260, gain: 0.32 * g * (1 - i * 0.08), a: 0.003, pan: (i % 3 - 1) * 0.3, minor });
      };
      const smear = (t, d, g = 1) => { // lumps pushed along the table
        k.noise(t, { dur: d, color: 'brown', filter: 'bandpass', f: [[0, 260], [d, 520]], q: 1.3, gain: 0.28 * g, a: d * 0.3 });
        for (let x = 0; x < d; x += 1 / 12) k.noise(t + x, { dur: 0.05, color: 'pink', filter: 'bandpass', f: 380, q: 2.5, gain: 0.08 * g, a: 0.01, minor: true });
      };
      // a clay word: one plop per frame on which new letters appear
      const word = (str, x, w, st, step, g = 0.6, f = 190) => {
        const fr = new Map(); [...str].forEach((ch, i) => { if (ch !== ' ') { const t = q(st + i * step); if (!fr.has(t)) fr.set(t, i / str.length); } });
        [...fr].forEach(([t, u]) => plop(t, g * 0.42, f, pan(x + w * u)));
      };

      k.bed('room', 0, 15, { gain: 0.45 });

      // BEAT 1: the question pressed onto the wall letter by letter, then knocked off (fall at 2.0 / 2.15)
      word('How does', 410, 460, 0.1, 1 / 12, 0.7, 200);
      word('AI learn?', 380, 520, 0.85, 1 / 12, 0.75, 180);
      floor(2.45, 4, 0.9, false); floor(2.62, 4, 0.7);
      word('How does AI learn?', 28, 420, 2.35, 1 / 24, 0.35, 240); // header

      // BEAT 2: brain plopped down, coil arrow, cards slide in, counter re-pressed
      plop(q(2.4), 1.05, 110, pan(1020), false); squelch(q(2.4) + 1 / 12, 0.7, pan(1020));
      word('model', 960, 160, 2.6, 1 / 12, 0.5, 210);
      plop(q(2.55), 0.9, 140, pan(420)); squelch(q(2.55) + 1 / 12, 0.6, pan(420), 0.2); // coil laid down
      word('examples', 420, 220, 2.7, 1 / 24, 0.4, 230);
      [0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => plop(q(2.5 + i * 0.36), 0.4, 150, -0.6)); // each card set on
      { // brain gulps a card (squash for 0.17 s) when it arrives; bx moves with bShift from 5.9
        let was = false;
        for (let f = 30; f < 80; f++) {
          const tq = f / 12, bx = H.lerp(880, 470, Math.round(H.ease.inOut(H.clamp((tq - 5.9) / 0.5)) * 6) / 6);
          let gulp = false; for (let i = 0; i < 8; i++) { const a = 2.5 + i * 0.36 + (bx - 40 + 150) / 600; if (tq >= a && tq < a + 0.17) gulp = true; }
          if (gulp && !was && tq < 6.3) squelch(tq, 0.9, pan(bx + 140), 0.12);
          was = gulp;
        }
      }
      { // counter: n = 1e6 * ((tq-2.7)/2.5)^2 re-pressed; a squish every other frame, 1,000,000 at 5.25
        for (let f = 33; f < 63; f += 2) plop(f / 12, 0.28, 230, pan(200));
        plop(q(5.2), 1.1, 160, pan(200), false); squelch(q(5.2) + 1 / 12, 0.5, pan(200));
      }
      // everything knocked off at 5.75..5.85, lands offscreen; brain shoved to centre (5.9..6.4, steps of 1/6)
      floor(6.3, 5, 0.8);
      smear(q(5.9), 0.5, 0.8);

      // BEAT 3
      plop(q(6.2), 0.9, 150, pan(130));
      [6.3, 6.38, 6.46].forEach((s, i) => plop(q(s), 0.35, 200, pan(520 + i * 80))); // knobs
      plop(q(6.45), 0.6, 140, pan(340)); plop(q(6.9), 0.6, 140, pan(810)); // coils
      word('Guess', 735, 140, 7.0, 1 / 24, 0.45, 220);
      plop(q(7.25), 1.0, 120, pan(1040)); // bubble
      word('dog?', 945, 200, 7.4, 1 / 12, 0.7, 170);
      // wrong guess: red clay X slapped on (7.92) and the bubble shakes (7.92..8.4)
      const tX = q(7.9);
      k.play('slap', tX, { gain: 0.7, pan: pan(1190) });
      plop(tX, 1.3, 100, pan(1190), false);
      k.tone(tX + 0.02, { f: 'D3', type: 'triangle', dur: 0.16, gain: 0.22, filter: 'lowpass', f2: 700 });
      k.tone(tX + 0.18, { f: 'A2', type: 'triangle', dur: 0.32, gain: 0.24, filter: 'lowpass', f2: 600 });
      for (let f = 96; f < 101; f += 2) squelch(f / 12 + 1 / 12, 0.45, pan(1040), 0.08); // wobble
      word('Check', 935, 150, 8.0, 1 / 24, 0.45, 200);
      plop(q(8.35), 0.6, 140, pan(880)); squelch(q(8.35) + 1 / 12, 0.4, pan(880), 0.18); // red coil back to the knobs
      word('Adjust', 520, 170, 8.6, 1 / 24, 0.45, 200);
      [9.0, 9.125, 9.3333, 9.5].forEach((t) => k.play('tock', q(t), { f: 240, gain: 0.45, pan: pan(600), minor: true })); // knobs twisted
      floor(10.05, 4, 0.6); // X, dog?, Check, Adjust dropped off (9.5..9.6)
      // correction: 'cat' pressed in, green tick plopped on
      word('cat', 965, 170, 9.7, 1 / 12, 0.75, 170);
      plop(q(9.9), 0.85, 130, pan(1190), false);
      k.play('success', q(9.9), { f: 'G5', gain: 0.55, pan: pan(1190) });
      // everything swept off to the right (10.25)
      smear(q(10.25), 0.45, 1.1);

      // BEAT 4: bars squeezed up out of the table (squash 1.25x0.2 -> stretch), % re-pressed
      word('Accuracy', 40, 260, 10.45, 1 / 24, 0.45, 200);
      for (let i = 0; i < 8; i++) { const t = q(10.6 + i * 0.25); squelch(t, 0.6, pan(185 + i * 96), 0.16); }
      for (let f = 129; f < 151; f += 2) plop(f / 12, 0.24, 240, pan(500)); // % changing
      word('training rounds', 450, 380, 11.0, 1 / 24, 0.3, 230);
      // 97% (12.6): number swells red, gold clay star plopped on: biggest hit
      k.play('impact', 12.6, { gain: 1.45, pan: 0.2 });
      plop(12.6, 2.1, 95, pan(880), false);
      squelch(12.6 + 1 / 6, 0.7, pan(560), 0.2);
      k.play('ding', 12.6, { f: 'E5', gain: 0.6, pan: 0.3 });
      floor(13.45, 4, 0.5); // 'training rounds' knocked off at 12.95

      // BEAT 5: takeaway pressed into the table front, then it resolves
      word('More examples', 300, 330, 13.0, 1 / 24, 0.45, 200);
      plop(q(13.5), 0.6, 150, pan(660));
      word('better guesses', 720, 360, 13.55, 1 / 24, 0.45, 200);
      ['C4', 'G4', 'E5'].forEach((f, i) => k.play('ding', 14.25 + i * 0.08, { f, gain: 0.45 - i * 0.04, pan: (i - 1) * 0.25 }));
    },
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(8);
      // stop-motion "boil": texture seeds change on twos (12 fps)
      const fr = Math.floor(t * 12);
      const boil = H.rng(500 + fr);
      const tq = fr / 12; // all animation is stepped on 12 fps (shot on twos)
      const boilOff = (Math.floor(t * 12) % 3) * 1.7;

      // ---------- core: inflate a 2D mask into a lit clay lump ----------
      const blob = (o) => {
        let SX = 1, SY = 1, AX = (o.bb[0] + o.bb[2]) / 2, AY = o.bb[3];
        if (o.at) {
          const k = Math.floor((tq - o.at[0]) * 12 + 1e-6);
          if (k < 0) return;
          const seq = SEQ[o.at[1] || 'pop'], e = seq[Math.min(seq.length - 1, k >> 1)];
          SX = e[0]; SY = e[1];
          if (o.at[2] != null) { AX = o.at[2]; AY = o.at[3]; }
        }
        if (o.sc) { SX *= o.sc[0]; SY *= o.sc[1]; if (o.sc[2] != null) { AX = o.sc[2]; AY = o.sc[3]; } }
        const R = o.R || 14, pad = Math.ceil(R * 2 + 6);
        let [x0, y0, x1, y1] = o.bb;
        x0 = Math.floor(Math.max(0, x0 - pad)); y0 = Math.floor(Math.max(0, y0 - pad));
        x1 = Math.ceil(Math.min(W, x1 + pad)); y1 = Math.ceil(Math.min(H_, y1 + pad));
        const w = x1 - x0, h = y1 - y0;
        if (w < 3 || h < 3) return;
        const M = H.layer(w, h), mc = M.getContext('2d', { willReadFrequently: true });
        mc.translate(-x0, -y0); mc.fillStyle = '#fff'; o.draw(mc);
        const ds = 3, sw = Math.ceil(w / ds), sh = Math.ceil(h / ds);
        const Bs = H.layer(sw, sh), bsc = Bs.getContext('2d');
        bsc.filter = `blur(${R / ds}px)`; bsc.drawImage(M, 0, 0, sw, sh);
        const B = H.layer(w, h), bc = B.getContext('2d', { willReadFrequently: true });
        bc.imageSmoothingEnabled = true; bc.drawImage(Bs, 0, 0, w, h);
        const md = mc.getImageData(0, 0, w, h).data, bd = bc.getImageData(0, 0, w, h).data;
        const Hh = new Float32Array(w * h), A = new Float32Array(w * h);
        const fps = o.fps || [], marks = o.marks || [], lump = o.lump ?? 2.2;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const i = y * w + x;
          const a = bd[i * 4 + 3] / 255, ap = H.clamp((a - 0.42) / 0.58);
          A[i] = ap;
          if (md[i * 4 + 3] === 0) continue;
          const X = x + x0, Y = y + y0;
          let hh = Math.sqrt(1 - (1 - ap) * (1 - ap)) * R * (o.dome ?? 1.1);
          hh += nz.n2(X * 0.025 + o.seed, Y * 0.025) * lump + nz.n2(X * 0.11 + (o.target ? 0 : boilOff), Y * 0.11 + o.seed) * 0.35;
          Hh[i] = hh;
        }
        // thumbprints: partial, warped whorls (only inside their own box)
        for (const f of fps) {
          const R2 = f[2], fx0 = Math.max(0, Math.floor(f[0] - R2 - x0)), fx1 = Math.min(w - 1, Math.ceil(f[0] + R2 - x0));
          const fy0 = Math.max(0, Math.floor(f[1] - R2 - y0)), fy1 = Math.min(h - 1, Math.ceil(f[1] + R2 - y0));
          const ang = f[3], ca = Math.cos(ang), sa = Math.sin(ang);
          for (let y = fy0; y <= fy1; y++) for (let x = fx0; x <= fx1; x++) {
            const dx0 = x + x0 - f[0], dy0 = y + y0 - f[1];
            const dx = dx0 * ca + dy0 * sa, dy = (-dx0 * sa + dy0 * ca) * 1.45;
            const d = Math.hypot(dx, dy);
            if (d >= R2) continue;
            const fall = Math.pow(1 - d / R2, 1.5) * H.smooth(-0.6, 0.4, Math.cos(Math.atan2(dy, dx) - ang * 2));
            const warp = nz.n2(dx * 0.06 + ang, dy * 0.06) * 2.5;
            Hh[y * w + x] += Math.sin(d * 1.6 + warp) * 0.22 * fall;
          }
        }
        // sculpting-tool smears: soft wide grooves with a raised lip
        for (const m of marks) {
          const [ax, ay, bx, by] = m, vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1, dep = m[4] || 1.2;
          const mx0 = Math.max(0, Math.floor(Math.min(ax, bx) - 9 - x0)), mx1 = Math.min(w - 1, Math.ceil(Math.max(ax, bx) + 9 - x0));
          const my0 = Math.max(0, Math.floor(Math.min(ay, by) - 9 - y0)), my1 = Math.min(h - 1, Math.ceil(Math.max(ay, by) + 9 - y0));
          for (let y = my0; y <= my1; y++) for (let x = mx0; x <= mx1; x++) {
            const X = x + x0, Y = y + y0;
            const u = H.clamp(((X - ax) * vx + (Y - ay) * vy) / L2);
            const d = Math.hypot(X - ax - vx * u, Y - ay - vy * u);
            if (d > 8) continue;
            const taper = Math.sin(Math.PI * Math.min(1, u * 1.05 + 0.02));
            Hh[y * w + x] += taper * (-dep * Math.exp((-d * d) / (o.markW || 3.2)) + 0.4 * dep * Math.exp((-(d - 3.4) * (d - 3.4)) / 2));
          }
        }
        const out = mc.createImageData(w, h), od = out.data;
        const base = H.hex(o.color);
        const sss = o.sss || [1.12, 0.92, 0.85];
        for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
          const i = y * w + x, ma = md[i * 4 + 3];
          if (!ma) continue;
          const dx = (Hh[i + 1] - Hh[i - 1]) * 0.5, dy = (Hh[i + w] - Hh[i - w]) * 0.5;
          const n = nrm([-dx, -dy, 1]);
          const nl = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
          const diff = H.clamp((nl + 0.42) / 1.42);
          const nh = Math.max(0, n[0] * HALF[0] + n[1] * HALF[1] + n[2] * HALF[2]);
          const spec = Math.pow(nh, 26) * (o.spec ?? 0.3);
          const ao = 0.72 + 0.28 * Math.min(1, A[i] * 1.4);
          const k = (0.3 + 0.86 * diff) * ao;
          const sh = 1 - diff;
          const k4 = i * 4;
          od[k4] = Math.min(255, base[0] * k * (1 + (sss[0] - 1) * sh) + spec * 255);
          od[k4 + 1] = Math.min(255, base[1] * k * (1 + (sss[1] - 1) * sh) + spec * 245);
          od[k4 + 2] = Math.min(255, base[2] * k * (1 + (sss[2] - 1) * sh) + spec * 230);
          od[k4 + 3] = ma;
        }
        const O = H.layer(w, h); O.getContext('2d').putImageData(out, 0, 0);
        const tgt = o.target || ctx;
        tgt.save();
        if (o.shadow !== false) {
          const s = o.shadow || {};
          tgt.shadowColor = `rgba(40,20,10,${s.a ?? 0.38})`; tgt.shadowBlur = s.blur ?? 16; tgt.shadowOffsetX = s.dx ?? 7; tgt.shadowOffsetY = s.dy ?? 9;
        }
        if (o.dof) tgt.filter = `blur(${o.dof}px)`;
        if (SX !== 1 || SY !== 1) { tgt.translate(AX, AY); tgt.scale(SX, SY); tgt.translate(-AX, -AY); }
        tgt.drawImage(O, x0, y0);
        tgt.restore();
      };
      // random thumbprints within a box
      const prints = (seed, bb, n, R = 22) => { const r = H.rng(seed); return Array.from({ length: n }, () => [r.range(bb[0], bb[2]), r.range(bb[1], bb[3]), R * r.range(0.7, 1.2), r() * 50]); };
      const marksIn = (seed, bb, n, len = 30) => { const r = H.rng(seed); return Array.from({ length: n }, () => { const x = r.range(bb[0], bb[2]), y = r.range(bb[1], bb[3]), a = r() * TAU, l = r.range(len * 0.5, len); return [x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, r.range(0.8, 1.6)]; }); };

      // ---------- clay set: smeared back wall (slightly out of focus) ----------
      if (!WALL) {
        WALL = H.layer(W, H_);
        const wc = WALL.getContext('2d');
        wc.fillStyle = '#3f8593'; wc.fillRect(0, 0, W, H_);
        blob({
          bb: [0, 0, W, H_], R: 4, dome: 0, lump: 3.2, seed: 3, color: '#4f9fae', shadow: false, spec: 0.12, dof: 1.6, target: wc,
          draw: (c) => c.fillRect(-40, -40, W + 80, H_ + 80),
          fps: prints(11, [0, 0, W, 470], 12, 30),
          marks: marksIn(12, [0, 0, W, 480], 10, 90), markW: 14,
        });
      }
      ctx.drawImage(WALL, 0, 0);
      // soft key-light pool on the wall
      {
        const g = ctx.createRadialGradient(620, 220, 30, 640, 300, 760);
        g.addColorStop(0, 'rgba(255,240,200,0.22)'); g.addColorStop(1, 'rgba(10,20,30,0.35)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H_);
      }

      // ---------- pressed clay letters on the wall ----------
      {
        const txt = 'ASK ME ANYTHING';
        const cols = ['#f2c14e', '#f07b5a', '#f6efe3', '#ef8fb0', '#a8dd8a'];
        ctx.save(); ctx.font = '700 92px "Fredoka"';
        const sp = 4;
        let total = 0; for (const ch of txt) total += ctx.measureText(ch).width + sp;
        ctx.restore();
        let x = W / 2 - total / 2;
        const r = H.rng(77);
        let ci = 0;
        for (const ch of txt) {
          ctx.save(); ctx.font = '700 92px "Fredoka"'; const cw = ctx.measureText(ch).width; ctx.restore();
          if (ch !== ' ') {
            const rot = r.range(-0.09, 0.09) + (boil() - 0.5) * 0.015, yy = 140 + r.range(-6, 6), lx = x;
            blob({
              bb: [lx - 10, yy - 90, lx + cw + 10, yy + 20], R: 7, dome: 1.3, lump: 1.2, seed: 20 + ci, color: cols[ci % cols.length],
              draw: (c) => { c.save(); c.translate(lx + cw / 2, yy - 34); c.rotate(rot); c.font = '700 92px "Fredoka"'; c.fillText(ch, -cw / 2, 34); c.restore(); },
              fps: prints(40 + ci, [lx, yy - 70, lx + cw, yy], 1, 16),
              shadow: { blur: 8, dx: 5, dy: 7, a: 0.45 }, dof: 0.8, at: [0.25 + ci * 0.1, 'pop', lx + cw / 2, yy + 8],
            });
            ci++;
          }
          x += cw + sp;
        }
      }

      // ---------- character (behind the table) ----------
      const wave = Math.round(Math.sin(t * 5) * 2) / 2; // pose-to-pose
      const rise = H.clamp((tq - 1.6) / 0.6);
      const CH = { x: 945, y: 380 + 330 * (1 - H.ease.back(rise)) };
      const land = tq - 2.2;
      const bodySc = rise < 1 ? [0.94, 1.07] : land < 0.17 ? [1.08, 0.92] : land < 0.34 ? [0.97, 1.03] : [1, 1];
      const showCH = tq >= 1.6;
      const blink = tq >= 3.75 && tq < 3.92;
      if (showCH) blob({ // body bean
        sc: [...bodySc, CH.x, CH.y + 170],
        bb: [CH.x - 140, CH.y - 175, CH.x + 140, CH.y + 180], R: 30, lump: 2.6, seed: 31, color: '#f2b84b',
        draw: (c) => lumpy(c, nz, CH.x, CH.y, 118, 168, 3.1 + boil() * 0.02, 0.05, 0.05),
        fps: prints(32, [CH.x - 100, CH.y - 140, CH.x + 100, CH.y + 120], 7, 24),
        marks: marksIn(33, [CH.x - 90, CH.y - 120, CH.x + 90, CH.y + 120], 4, 26),
        shadow: { blur: 26, dx: 14, dy: 16, a: 0.4 },
      });
      // waving arm (behind-right) + mitten
      {
        const ax = CH.x + 100, ay = CH.y + 10, a = (tq < 2.5 ? 0.9 : -1.05 + wave * 0.18), L = 120;
        const hx = ax + Math.cos(a) * L, hy = ay + Math.sin(a) * L;
        blob({
          bb: [Math.min(ax, hx) - 50, Math.min(ay, hy) - 50, Math.max(ax, hx) + 50, Math.max(ay, hy) + 50], R: 12, lump: 1.2, seed: 41, color: '#f2b84b',
          draw: (c) => { c.lineCap = 'round'; c.strokeStyle = '#fff'; c.lineWidth = 40; c.beginPath(); c.moveTo(ax - 20, ay + 10); c.quadraticCurveTo(ax + 30, ay - 20, hx, hy); c.stroke(); lumpy(c, nz, hx, hy, 32, 28, 9, 0.12, a); c.fill(); lumpy(c, nz, hx - 22, hy + 6, 13, 10, 4, 0.1, a); c.fill(); },
          fps: prints(42, [hx - 25, hy - 25, hx + 25, hy + 25], 2, 14), at: [2.3, 'pop', ax, ay],
        });
      }
      // eyes: white balls + glossy black pupils
      [[-48, -70, 40], [44, -74, 44]].forEach(([dx, dy, rr], i) => {
        const ex = CH.x + dx, ey = CH.y + dy;
        blob({ at: [2.2 + i * 0.08, 'pop', ex, ey], sc: blink ? [1.04, 0.14, ex, ey] : null, bb: [ex - rr, ey - rr, ex + rr, ey + rr], R: 14, dome: 1.3, lump: 0.6, seed: 50 + i, color: '#f7f3ea', spec: 0.45, sss: [1.04, 1.0, 1.0],
          draw: (c) => lumpy(c, nz, ex, ey, rr * 0.92, rr, 7 + i, 0.05), fps: prints(52 + i, [ex - 20, ey - 20, ex + 20, ey + 20], 1, 14), shadow: { blur: 6, dx: 3, dy: 4, a: 0.35 } });
        const px = ex - 10 + i * 4 + (tq > 2.9 && tq < 4.3 ? -10 : 0), py = ey + 4;
        if (!blink) blob({ at: [2.3 + i * 0.08, 'pop', px, py], bb: [px - 18, py - 18, px + 18, py + 18], R: 7, dome: 1.4, lump: 0.3, seed: 60 + i, color: '#23202a', spec: 0.9, sss: [1, 1, 1.05],
          draw: (c) => lumpy(c, nz, px, py, 15, 16, 2 + i, 0.06), shadow: { blur: 3, dx: 1.5, dy: 2, a: 0.4 } });
      });
      // nose bump + mouth
      blob({ at: [2.35, 'pop', CH.x, CH.y + 5], bb: [CH.x - 22, CH.y - 30, CH.x + 26, CH.y + 10], R: 10, lump: 0.6, seed: 70, color: '#f0a63e',
        draw: (c) => lumpy(c, nz, CH.x + 2, CH.y - 12, 22, 16, 1, 0.08), shadow: { blur: 7, dx: 4, dy: 5, a: 0.35 } });
      blob({ at: [2.45, 'pop', CH.x, CH.y + 40], bb: [CH.x - 60, CH.y + 15, CH.x + 60, CH.y + 70], R: 6, dome: 0.6, lump: 0.4, seed: 71, color: '#7a2230', spec: 0.15,
        draw: (c) => { c.beginPath(); c.moveTo(CH.x - 50, CH.y + 24); c.quadraticCurveTo(CH.x, CH.y + 92, CH.x + 52, CH.y + 20); c.quadraticCurveTo(CH.x, CH.y + 48, CH.x - 50, CH.y + 24); c.fill(); },
        shadow: { blur: 3, dx: -1, dy: -2, a: 0.4 } });
      blob({ at: [2.5, 'pop', CH.x, CH.y + 60], bb: [CH.x - 30, CH.y + 40, CH.x + 30, CH.y + 70], R: 5, lump: 0.3, seed: 72, color: '#e9737c',
        draw: (c) => lumpy(c, nz, CH.x + 4, CH.y + 52, 18, 7, 5, 0.1), shadow: false });

      // ---------- table slab ----------
      blob({
        bb: [0, 490, W, H_], R: 22, dome: 1.0, lump: 2.4, seed: 80, color: '#d0703f',
        draw: (c) => { c.beginPath(); c.moveTo(-40, 520); for (let x = -40; x <= W + 40; x += 20) c.lineTo(x, 506 + nz.n2(x * 0.01, 3) * 8); c.lineTo(W + 40, H_ + 60); c.lineTo(-40, H_ + 60); c.closePath(); c.fill(); },
        fps: prints(81, [0, 520, W, 700], 7, 30),
        marks: marksIn(82, [0, 520, W, 700], 7, 110), markW: 16,
        shadow: { blur: 30, dx: 0, dy: -10, a: 0.35 },
      });
      // table front-edge shading (slab turns down)
      {
        const g = ctx.createLinearGradient(0, 600, 0, H_);
        g.addColorStop(0, 'rgba(60,20,10,0)'); g.addColorStop(1, 'rgba(60,20,10,0.35)');
        ctx.fillStyle = g; ctx.fillRect(0, 600, W, 120);
      }
      // contact shadows on the table
      const contact = (cx, cy, rx, ry, a = 0.45) => {
        ctx.save(); ctx.filter = 'blur(10px)'; ctx.fillStyle = `rgba(70,20,5,${a})`; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.fill(); ctx.restore();
      };
      if (tq >= 0.9) contact(600, 588, 230, 26);
      if (tq >= 0.6) contact(1165, 590, 70, 16);
      if (tq >= 2.25) contact(CH.x - 120, 545, 60, 12, 0.35);

      // resting arm on the table
      blob({
        bb: [CH.x - 190, CH.y + 60, CH.x - 60, CH.y + 190], R: 13, lump: 1.0, seed: 90, color: '#f2b84b',
        draw: (c) => { c.lineCap = 'round'; c.strokeStyle = '#fff'; c.lineWidth = 40; c.beginPath(); c.moveTo(CH.x - 80, CH.y + 70); c.quadraticCurveTo(CH.x - 120, CH.y + 150, CH.x - 150, CH.y + 160); c.stroke(); lumpy(c, nz, CH.x - 152, CH.y + 160, 28, 22, 6, 0.12); c.fill(); },
        fps: prints(91, [CH.x - 170, CH.y + 130, CH.x - 120, CH.y + 180], 1, 14), at: [2.2, 'pop', CH.x - 80, CH.y + 70],
      });

      // ---------- laptop ----------
      const LX = 600;
      blob({ // lid
        bb: [LX - 170, 270, LX + 170, 540], R: 12, dome: 0.8, lump: 1.0, seed: 100, color: '#c9c5bd', sss: [1.04, 1.0, 1.02],
        draw: (c) => { const P = [[LX - 155, 290], [LX + 160, 282], [LX + 150, 535], [LX - 150, 538]]; c.beginPath(); c.moveTo((P[0][0] + P[3][0]) / 2, (P[0][1] + P[3][1]) / 2); for (let i = 0; i < 4; i++) c.arcTo(P[i][0], P[i][1], P[(i + 1) % 4][0], P[(i + 1) % 4][1], 12); c.closePath(); c.fill(); },
        fps: prints(101, [LX - 140, 300, LX + 140, 520], 4, 20), at: [1.1, 'lid', LX, 536],
        shadow: { blur: 22, dx: 12, dy: 10, a: 0.4 },
      });
      blob({ // screen inset
        bb: [LX - 140, 300, LX + 140, 520], R: 6, dome: 0.4, lump: 0.6, seed: 102, color: '#2b3c64', spec: 0.5,
        draw: (c) => { c.beginPath(); c.moveTo(LX - 132, 308); c.lineTo(LX + 138, 302); c.lineTo(LX + 130, 512); c.lineTo(LX - 128, 515); c.closePath(); c.fill(); },
        marks: marksIn(103, [LX - 120, 320, LX + 120, 500], 3, 40), at: [1.1, 'lid', LX, 536],
        shadow: { blur: 4, dx: -2, dy: -3, a: 0.5 },
      });
      blob({ // chat bubble on the screen
        bb: [LX - 105, 340, LX + 100, 470], R: 12, lump: 0.9, seed: 104, color: '#f6f1e7',
        draw: (c) => { lumpy(c, nz, LX - 5, 395, 95, 50, 12, 0.05); c.fill(); c.beginPath(); c.moveTo(LX - 70, 425); c.lineTo(LX - 92, 470); c.lineTo(LX - 30, 438); c.closePath(); c.fill(); },
        fps: prints(105, [LX - 70, 360, LX + 60, 430], 2, 18), at: [2.6, 'pop', LX - 80, 460],
        shadow: { blur: 8, dx: 5, dy: 6, a: 0.45 },
      });
      ['#ef7f9e', '#f2c14e', '#7fd0b8'].forEach((col, i) => {
        const pop = 1 + 0.25 * Math.max(0, Math.sin(tq * 6 - i * 1.2));
        const dx = LX - 55 + i * 50, dy = 395, rr = 15 * pop;
        blob({ bb: [dx - rr, dy - rr, dx + rr, dy + rr], R: 8, dome: 1.4, lump: 0.3, seed: 110 + i, color: col, spec: 0.5,
          draw: (c) => lumpy(c, nz, dx, dy, rr, rr * 0.95, i * 3, 0.08), shadow: { blur: 4, dx: 3, dy: 4, a: 0.4 }, at: [2.85 + i * 0.12, 'pop', dx, dy + rr] });
      });
      blob({ // keyboard deck
        bb: [LX - 200, 528, LX + 205, 600], R: 10, dome: 0.7, lump: 0.9, seed: 120, color: '#d3cfc6', sss: [1.04, 1.0, 1.02],
        draw: (c) => { c.beginPath(); c.moveTo(LX - 160, 532); c.lineTo(LX + 160, 530); c.lineTo(LX + 200, 590); c.lineTo(LX - 198, 594); c.closePath(); c.fill(); },
        marks: (() => {
          const m = [];
          for (let row = 0; row < 3; row++) {
            const y = 546 + row * 14, inset = 150 - row * 8 + (row ? 0 : 0);
            m.push([LX - inset - row * 4, y, LX + inset + row * 4, y - 1, 1.6]);
            for (let k = -6; k <= 6; k++) m.push([LX + k * 22 * (1 + row * 0.06) - 2, y - 6, LX + k * 22 * (1 + row * 0.06) + 1, y + 6, 1.2]);
          }
          m.push([LX - 40, 586, LX + 40, 586, 1.4]);
          return m;
        })(),
        fps: prints(121, [LX - 150, 540, LX + 150, 590], 3, 16), at: [0.9, 'pop', LX, 594],
        shadow: { blur: 12, dx: 6, dy: 6, a: 0.4 },
      });

      // ---------- potted plant (right) ----------
      {
        const px = 1165, py = 540;
        [[-30, -95, -0.5, '#5aa65b'], [26, -105, 0.45, '#4f9a52'], [-2, -125, 0.02, '#6bb865'], [-42, -55, -1.0, '#5aa65b'], [40, -60, 0.95, '#4f9a52']].forEach(([dx, dy, a, col], i) => {
          blob({ bb: [px + dx - 50, py + dy - 50, px + dx + 50, py + dy + 50], R: 10, lump: 0.8, seed: 130 + i, color: col,
            draw: (c) => lumpy(c, nz, px + dx, py + dy, 18, 44, i * 2, 0.08, a),
            marks: [[px + dx - Math.sin(a) * 30, py + dy - Math.cos(a) * 30 * -1 - 30, px + dx + Math.sin(a) * 30, py + dy + 30, 1.0]],
            shadow: { blur: 10, dx: 6, dy: 7, a: 0.35 }, at: [0.75 + i * 0.08, 'pop', px, py - 25] });
        });
        blob({ bb: [px - 60, py - 40, px + 60, py + 50], R: 14, lump: 1.2, seed: 140, color: '#e07d4f',
          draw: (c) => { c.beginPath(); c.moveTo(px - 52, py - 30); c.lineTo(px + 52, py - 30); c.lineTo(px + 38, py + 44); c.lineTo(px - 38, py + 44); c.closePath(); c.fill(); },
          marks: [[px - 50, py - 12, px + 50, py - 12, 1.8]], fps: prints(141, [px - 40, py - 20, px + 40, py + 40], 2, 16), shadow: { blur: 14, dx: 8, dy: 6, a: 0.4 }, at: [0.6, 'pop', px, py + 44] });
      }

      // ---------- stray clay crumbs on the table ----------
      {
        const r = H.rng(160);
        [[330, 640, '#f2b84b'], [905, 655, '#ef8fb0'], [968, 668, '#4f9fae'], [1040, 610, '#f2b84b'], [780, 690, '#a8dd8a'], [420, 600, '#f6efe3']].forEach(([x, y, col], i) => {
          const rr = r.range(5, 9);
          blob({ bb: [x - rr, y - rr, x + rr, y + rr], R: 4, dome: 1.4, lump: 0.3, seed: 170 + i, color: col, spec: 0.35,
            draw: (c) => lumpy(c, nz, x, y, rr * 1.2, rr * 0.85, i, 0.2, r() * 3), shadow: { blur: 4, dx: 3, dy: 3, a: 0.45 } });
        });
      }

      // ---------- out-of-focus foreground mug ----------
      {
        const mx = 150, my = 610;
        blob({ bb: [mx - 120, my - 110, mx + 120, my + 130], R: 20, lump: 2, seed: 150, color: '#e86f7f', dof: 3.5,
          draw: (c) => { c.beginPath(); c.moveTo(mx - 85, my - 95); c.lineTo(mx + 85, my - 95); c.lineTo(mx + 80, my + 130); c.lineTo(mx - 80, my + 130); c.closePath(); c.fill(); c.lineWidth = 30; c.strokeStyle = '#fff'; c.beginPath(); c.arc(mx + 78, my + 10, 45, -1.5, 1.5); c.stroke(); },
          fps: prints(151, [mx - 60, my - 70, mx + 60, my + 100], 3, 24), shadow: { blur: 30, dx: 16, dy: 10, a: 0.35 } });
      }

      // ---------- lens finish: soft DOF falloff on far wall edges, warm grade, vignette ----------
      ctx.save(); ctx.globalCompositeOperation = 'soft-light';
      const gg = ctx.createLinearGradient(0, 0, W, H_);
      gg.addColorStop(0, 'rgba(255,220,170,0.5)'); gg.addColorStop(1, 'rgba(40,60,90,0.4)');
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H_); ctx.restore();
      H.vignette(ctx, W, H_, 0.45, '20,12,8');
      // stop-motion exposure flicker (changes on twos)
      { const f = (H.rng(900 + fr)() - 0.5) * 0.06; ctx.fillStyle = f > 0 ? `rgba(255,240,220,${f})` : `rgba(0,0,0,${-f})`; ctx.fillRect(0, 0, W, H_); }
      H.grain(ctx, W, H_, 0.03, 4 + fr);
    },
  });
}
