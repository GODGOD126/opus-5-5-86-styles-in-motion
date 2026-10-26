{
  // ---------- Product Launch Reveal: big-tech keynote film ----------
  // A single glossy hero object (an invented "model" chip-slab) on a near-black stage, lit like a studio product
  // shot: soft key, rim light, a specular sweep, a floor reflection. Huge tight-tracked Inter, words revealed one at
  // a time, gradient key numbers with a soft glow, hairline callouts with small spec labels, slow eased camera moves.
  const PI = Math.PI;
  const sm = (a, b, x) => H.smooth(a, b, x);
  const io = (x) => H.ease.inOut(H.clamp(x));
  const eo = (x) => H.ease.out(H.clamp(x));
  const GV = ['#b69cff', '#e879f9', '#ff9a4d'];   // violet -> orange
  const GT = ['#5eead4', '#38bdf8', '#6d7cff'];   // teal -> blue
  const GG = ['#7cf0b8', '#2dd4bf'];               // green -> teal
  const RED = '#ff453a';
  const INK = '#f5f5f7', GREY = '#a1a1a6', DIM = '#6e6e73';

  // ---------- geometry: a rounded slab (x-z plane), with an inset die carrying a 4-layer network ----------
  const HALF = 1, RAD = 0.27, THICK = 0.12, SEG = 48; // fine corner segments so the machined side wall shades smoothly
  function rr(a, r, seg) {
    const pts = [], cs = [[a - r, a - r], [-(a - r), a - r], [-(a - r), -(a - r)], [a - r, -(a - r)]];
    cs.forEach(([cx, cz], k) => { for (let i = 0; i <= seg; i++) { const an = k * PI / 2 + (i / seg) * PI / 2; pts.push([cx + r * Math.cos(an), cz + r * Math.sin(an), an]); } });
    return pts;
  }
  const OUT = rr(HALF, RAD, SEG), DIE = rr(0.66, 0.12, 5);
  const LX = [-0.45, -0.15, 0.15, 0.45], LN = [4, 5, 5, 3];
  const NODES = LX.map((x, li) => Array.from({ length: LN[li] }, (_, k) => [x, -0.42 + (0.84 * k) / (LN[li] - 1)]));
  const EDGES = [];
  { const ra = H.rng(11), rb = H.rng(29);
    for (let li = 0; li < 3; li++) for (let a = 0; a < LN[li]; a++) for (let b = 0; b < LN[li + 1]; b++) EDGES.push({ li, a, b, wa: Math.pow(ra(), 1.6), wb: Math.pow(rb(), 1.6) }); }

  // camera: c = {cx, cy (screen point of the floor under the object), s (zoom), yaw, pitch}
  function cam(c) {
    const cyw = Math.cos(c.yaw), syw = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch), D = 7, F = c.s * 1900;
    const P = (x, y, z) => { const X = x * cyw - z * syw, Z = x * syw + z * cyw, up = y * cp - Z * sp, dep = Z * cp + y * sp, k = F / (D - dep); return [c.cx + X * k, c.cy - up * k, dep]; };
    const N = (nx, nz) => [nx * cyw - nz * syw, nx * syw + nz * cyw];
    return Object.assign({}, c, { P, N, unit: F / D });
  }
  function keyed(keys, t) {
    if (t <= keys[0].t) return Object.assign({}, keys[0]);
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t <= b.t) { const e = io((t - a.t) / (b.t - a.t)), o = {}; for (const k in a) o[k] = H.lerp(a[k], b[k], e); return o; }
    }
    return Object.assign({}, keys[keys.length - 1]);
  }
  const poly = (x, pts) => { x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath(); };
  const gauss = (d, k) => Math.exp(-d * d * k);

  // ---------- stage ----------
  function stage(x, W, Hh, c, L, t) {
    if (L.white) {
      x.fillStyle = '#e4e4e9'; x.fillRect(0, 0, W, Hh);
      let g = x.createRadialGradient(c.cx, c.cy - 220, 40, c.cx, c.cy - 120, 900);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#f4f4f7'); g.addColorStop(1, '#dcdce2');
      x.fillStyle = g; x.fillRect(0, 0, W, Hh);
      return;
    }
    x.fillStyle = '#030304'; x.fillRect(0, 0, W, Hh);
    const k = L.key;
    let g = x.createRadialGradient(c.cx, c.cy - c.unit * 0.9, 10, c.cx, c.cy - c.unit * 0.6, 820);
    g.addColorStop(0, `rgba(44,47,60,${0.9 * k})`); g.addColorStop(0.45, `rgba(20,21,28,${0.8 * k})`); g.addColorStop(1, 'rgba(3,3,4,0)');
    x.fillStyle = g; x.fillRect(0, 0, W, Hh);
    // floor pool of light
    x.save(); x.translate(c.cx, c.cy); x.scale(1, 0.24);
    g = x.createRadialGradient(0, 0, 0, 0, 0, c.unit * 2.6);
    g.addColorStop(0, `rgba(70,74,92,${0.42 * k})`); g.addColorStop(1, 'rgba(70,74,92,0)');
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, c.unit * 2.6, 0, 7); x.fill(); x.restore();
    // out-of-focus background bokeh (shallow depth of field)
    const r = H.rng(404);
    for (let i = 0; i < 6; i++) {
      const bx = r() * W + Math.sin(t * 0.2 + i) * 14 - (c.cx - 640) * 0.15, by = r.range(0.05, 0.5) * Hh, rad = r.range(40, 110), hue = r.pick(['120,110,255', '255,140,90', '90,200,255']);
      const a = r.range(0.025, 0.05) * k;
      g = x.createRadialGradient(bx, by, 0, bx, by, rad);
      g.addColorStop(0, `rgba(${hue},${a})`); g.addColorStop(0.6, `rgba(${hue},${a * 0.6})`); g.addColorStop(1, `rgba(${hue},0)`);
      x.fillStyle = g; x.beginPath(); x.arc(bx, by, rad, 0, 7); x.fill();
    }
  }

  // ---------- the hero object ----------
  function body(x, c, L, mirror) {
    const hv = L.hover, yT = hv + THICK / 2, yB = hv - THICK / 2, sc = c.unit / 271;
    const P = mirror ? (a, y, b) => c.P(a, -y, b) : c.P;
    const n = OUT.length, top = OUT.map((p) => P(p[0], yT, p[1])), bot = OUT.map((p) => P(p[0], yB, p[1]));
    const white = L.white ? 1 : 0;
    const segs = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, a1 = OUT[i][2], a2 = OUT[j][2];
      let nx = Math.cos(a1) + Math.cos(a2), nz = Math.sin(a1) + Math.sin(a2); const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl;
      const [NX, NZ] = c.N(nx, nz);
      segs.push({ i, j, NX, NZ });
      if (NZ < -0.03) continue;
      // softbox key: a broad soft specular lobe (exp 18) plus a wide sheen, peak clamped so it never blows out to a bar
      const lam = Math.max(0, NX * -0.6 + NZ * 0.8), sd = Math.max(0, NX * -0.25 + NZ * 0.97), spec = Math.pow(sd, 18), sheen = Math.pow(sd, 4);
      const rim = Math.pow(Math.max(0, NX), 3);
      let v = 14 + lam * 62 * L.key + Math.min(1, spec * 0.85 + sheen * 0.3) * 140 * L.key + rim * 120 * L.rim + white * 40;
      if (mirror) v *= 0.9;
      const cc = (m) => `rgb(${Math.min(255, v * 0.96 * m) | 0},${Math.min(255, v * 0.98 * m) | 0},${Math.min(255, (v * 1.05 + 3) * m) | 0})`;
      // long straight faces are split into short pieces so the vertical profile follows the perspective-sloped edges
      const m = Math.max(1, Math.ceil(Math.hypot(top[j][0] - top[i][0], top[j][1] - top[i][1]) / 40));
      const lp = (A, B, f) => [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f];
      for (let q = 0; q < m; q++) {
        const t0 = lp(top[i], top[j], q / m), t1 = lp(top[i], top[j], (q + 1) / m), b0 = lp(bot[i], bot[j], q / m), b1 = lp(bot[i], bot[j], (q + 1) / m);
        // gradient axis perpendicular to the top edge, so the bands run parallel to the edge (no sawtooth)
        let ex = t1[0] - t0[0], ey = t1[1] - t0[1]; const el = Math.hypot(ex, ey) || 1; ex /= el; ey /= el;
        const tm = [(t0[0] + t1[0]) / 2, (t0[1] + t1[1]) / 2], bm = [(b0[0] + b1[0]) / 2, (b0[1] + b1[1]) / 2];
        let gx = -ey, gy = ex, hh = (bm[0] - tm[0]) * gx + (bm[1] - tm[1]) * gy;
        if (Math.abs(hh) < 0.5) { gx = bm[0] - tm[0]; gy = bm[1] - tm[1]; hh = 1; }
        const sg = x.createLinearGradient(tm[0], tm[1], tm[0] + gx * hh, tm[1] + gy * hh);
        // polished metal: bright softbox reflection at the top, the dark studio horizon across the middle, a soft floor bounce low
        if (mirror) { sg.addColorStop(0, cc(0.5)); sg.addColorStop(0.45, cc(1)); sg.addColorStop(1, cc(1.2)); }
        else { sg.addColorStop(0, cc(1.32)); sg.addColorStop(0.3, cc(1.05)); sg.addColorStop(0.52, cc(0.62)); sg.addColorStop(0.74, cc(0.82)); sg.addColorStop(1, cc(0.42)); }
        x.fillStyle = sg; x.strokeStyle = sg; x.lineWidth = 0.9;
        poly(x, [t1, t0, b0, b1]); x.fill(); x.stroke();
      }
    }
    // bottom crease
    x.lineWidth = 1.2 * sc; x.strokeStyle = 'rgba(0,0,0,0.6)';
    for (const s of segs) if (s.NZ > 0) { x.beginPath(); x.moveTo(bot[s.i][0], bot[s.i][1]); x.lineTo(bot[s.j][0], bot[s.j][1]); x.stroke(); }
    if (mirror) { x.fillStyle = '#060608'; poly(x, bot); x.fill(); return; }

    // top: dark glass
    let minY = 1e9, maxY = -1e9; top.forEach((p) => { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
    poly(x, top);
    let g = x.createLinearGradient(0, minY, 0, maxY);
    g.addColorStop(0, white ? '#2a2c33' : '#1d2028'); g.addColorStop(1, '#08090c');
    x.fillStyle = g; x.fill();
    x.save(); poly(x, top); x.clip();
    // softbox reflection (glossy)
    g = x.createLinearGradient(0, minY, 0, maxY);
    g.addColorStop(0, `rgba(255,255,255,${0.16 * L.key})`); g.addColorStop(0.35, `rgba(255,255,255,${0.035 * L.key})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, minY, 1280, maxY - minY);
    // fixed soft streak of the softbox on the glass
    { const A = P(-1.1, yT, 0.6), B = P(0.6, yT, -1.1); const sg = x.createLinearGradient(A[0], A[1], B[0], B[1]);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.3, 'rgba(255,255,255,0)'); sg.addColorStop(0.46, `rgba(255,255,255,${0.11 * L.key})`); sg.addColorStop(0.5, `rgba(255,255,255,${0.05 * L.key})`); sg.addColorStop(0.66, 'rgba(255,255,255,0)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = sg; x.fillRect(0, minY, 1280, maxY - minY); }
    // die
    const die = DIE.map((p) => P(p[0], yT, p[1]));
    poly(x, die); x.fillStyle = 'rgba(4,5,8,0.92)'; x.fill();
    // micro-grid
    x.lineWidth = 0.6; x.strokeStyle = `rgba(150,160,200,${0.06 + 0.05 * L.act})`; x.beginPath();
    for (let q = -0.56; q <= 0.57; q += 0.08) { let a = P(q, yT, -0.6), b = P(q, yT, 0.6); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); a = P(-0.6, yT, q); b = P(0.6, yT, q); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); }
    x.stroke();
    // network
    const fp = L.fwd >= 0 ? L.fwd * 3.8 - 0.4 : -9, bp = L.back >= 0 ? (1 - L.back) * 3.8 - 0.4 : -9;
    const np = NODES.map((ly) => ly.map(([nx, nz]) => P(nx, yT, nz)));
    x.lineCap = 'round';
    for (const e of EDGES) {
      const w = H.lerp(e.wa, e.wb, L.adj), fi = gauss(fp - (e.li + 0.5), 3) * (0.35 + 0.65 * w), bi = gauss(bp - (e.li + 0.5), 3) * (0.35 + 0.65 * w);
      const a = 0.05 + 0.26 * w * L.act + 0.85 * Math.max(fi, bi);
      const col = bi > fi ? '255,140,80' : (fi > 0.05 ? '140,230,255' : '190,180,255');
      const A = np[e.li][e.a], B = np[e.li + 1][e.b];
      x.strokeStyle = `rgba(${col},${Math.min(1, a)})`; x.lineWidth = (0.7 + 1.3 * w) * sc;
      x.beginPath(); x.moveTo(A[0], A[1]); x.lineTo(B[0], B[1]); x.stroke();
    }
    np.forEach((ly, li) => ly.forEach((p) => {
      const fi = gauss(fp - li, 3), bi = gauss(bp - li, 3), on = Math.max(fi, bi);
      const col = bi > fi ? '255,150,90' : '170,235,255';
      const rad = (2.6 + 2.4 * on) * sc;
      if (on > 0.08) { const gg = x.createRadialGradient(p[0], p[1], 0, p[0], p[1], rad * 4); gg.addColorStop(0, `rgba(${col},${0.5 * on})`); gg.addColorStop(1, `rgba(${col},0)`); x.fillStyle = gg; x.beginPath(); x.arc(p[0], p[1], rad * 4, 0, 7); x.fill(); }
      x.fillStyle = `rgba(${on > 0.15 ? col : '215,215,235'},${0.35 + 0.25 * L.act + 0.4 * on})`; x.beginPath(); x.arc(p[0], p[1], rad, 0, 7); x.fill();
    }));
    // specular sweep
    if (L.spec > -0.3 && L.spec < 1.3) {
      const A = P(-1.1, yT, 1.1), B = P(1.1, yT, -1.1), u = L.spec;
      g = x.createLinearGradient(A[0], A[1], B[0], B[1]);
      const st = (o, a) => { const q = u + o; if (q > 0 && q < 1) g.addColorStop(q, `rgba(255,255,255,${a})`); };
      g.addColorStop(0, 'rgba(255,255,255,0)'); st(-0.16, 0); st(-0.05, 0.08); st(0, 0.42 * L.key); st(0.02, 0.18); st(0.1, 0); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 1280, 720);
    }
    x.restore();
    // glowing ring around the die
    if (L.ring > 0.01) {
      const ctr = P(0, yT, 0);
      x.save();
      const cg = x.createConicGradient(L.ringRot || 0, ctr[0], ctr[1]);
      ['#b69cff', '#e879f9', '#ff9a4d', '#5eead4', '#6d7cff', '#b69cff'].forEach((s, i, arr) => cg.addColorStop(i / (arr.length - 1), s));
      x.strokeStyle = cg; x.globalAlpha = Math.min(1, L.ring); x.lineWidth = 2.2 * sc;
      x.shadowColor = 'rgba(200,130,255,0.9)'; x.shadowBlur = 16 * sc * Math.min(1.6, L.ring);
      poly(x, die); x.stroke();
      x.shadowBlur = 0; x.lineWidth = 0.8 * sc; x.strokeStyle = `rgba(255,255,255,${0.5 * Math.min(1, L.ring)})`; poly(x, die); x.stroke();
      x.restore();
    }
    // top chamfer edge: rim-lit at the back, key-lit at the front
    x.lineWidth = 1.5 * sc;
    for (const s of segs) {
      const back = Math.max(0, -s.NZ), front = Math.max(0, s.NX * -0.6 + s.NZ * 0.8);
      const a = Math.min(1, Math.pow(back, 1.2) * 0.95 * L.rim + front * 0.45 * L.key + 0.06);
      x.strokeStyle = `rgba(235,238,255,${a})`;
      x.beginPath(); x.moveTo(top[s.i][0], top[s.i][1]); x.lineTo(top[s.j][0], top[s.j][1]); x.stroke();
    }
  }
  let RL = null;
  function chip(x, c, L) {
    const u = c.unit, white = !!L.white;
    // contact shadow + coloured light spill on the floor
    x.save(); x.translate(c.cx, c.cy); x.scale(1, Math.max(0.18, Math.sin(c.pitch) * 0.8));
    let g = x.createRadialGradient(0, 0, 0, 0, 0, u * 1.45);
    g.addColorStop(0, `rgba(0,0,0,${white ? 0.32 : 0.75})`); g.addColorStop(0.6, `rgba(0,0,0,${white ? 0.1 : 0.3})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, u * 1.45, 0, 7); x.fill();
    if (L.ring > 0.01 && !white) {
      g = x.createRadialGradient(0, 0, 0, 0, 0, u * 1.9);
      g.addColorStop(0, `rgba(170,110,255,${0.16 * Math.min(1.5, L.ring)})`); g.addColorStop(0.5, `rgba(255,130,90,${0.05 * Math.min(1.5, L.ring)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.globalCompositeOperation = 'lighter'; x.fillStyle = g; x.beginPath(); x.arc(0, 0, u * 1.9, 0, 7); x.fill();
    }
    x.restore();
    // floor reflection
    if (!RL) RL = H.layer(1280, 720);
    const r = RL.getContext('2d'); r.setTransform(1, 0, 0, 1, 0, 0); r.globalCompositeOperation = 'source-over'; r.clearRect(0, 0, 1280, 720);
    body(r, c, L, true);
    r.globalCompositeOperation = 'destination-in';
    g = r.createLinearGradient(0, c.cy, 0, c.cy + u * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    r.fillStyle = g; r.fillRect(0, 0, 1280, 720);
    x.save(); x.globalAlpha = white ? 0.22 : 0.45 * Math.max(0.2, L.key); x.drawImage(RL, 0, 0, 1280, 720); x.restore();
    body(x, c, L, false);
  }

  // ---------- type ----------
  function setF(x, w, px) { x.font = `${w} ${px}px "Inter"`; try { x.letterSpacing = (px >= 40 ? -Math.round(px * 0.035) : 0) + 'px'; } catch (e) {} }
  function grad(x, x0, x1, stops) { const g = x.createLinearGradient(x0, 0, x1, 0); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; }
  function wordsW(x, list, w, px) { setF(x, w, px); const sp = x.measureText(' ').width + px * 0.08; let tot = 0; list.forEach((it, i) => { it._w = x.measureText(it.s).width; tot += it._w + (i ? sp : 0); }); return { tot, sp }; }
  // one-word-at-a-time reveal: focus-pull from blur, rise and fade. list: [{s, t, fill?}]
  function words(x, list, X, Y, w, px, t, o) {
    o = o || {};
    x.save();
    const { tot, sp } = wordsW(x, list, w, px);
    let cx = o.align === 'center' ? X - tot / 2 : o.align === 'right' ? X - tot : X;
    const x0 = cx;
    for (const it of list) {
      const e = eo((t - it.t) / (o.dur || 0.6));
      if (e > 0.001) {
        x.globalAlpha = e * (o.alpha == null ? 1 : o.alpha);
        const b = (1 - e) * (o.blur == null ? 10 : o.blur);
        x.filter = b > 0.3 ? `blur(${b.toFixed(1)}px)` : 'none';
        x.fillStyle = it.fill === 'grad' ? grad(x, o.gx0 == null ? x0 : o.gx0, o.gx1 == null ? x0 + tot : o.gx1, o.stops || GV) : it.fill || o.fill || INK;
        x.textAlign = 'left'; x.textBaseline = 'alphabetic';
        x.fillText(it.s, cx, Y + (1 - e) * px * 0.28);
      }
      cx += it._w + sp;
    }
    x.restore();
    return { x0, tot };
  }
  function label(x, s, X, Y, w, px, fill, align, a) {
    x.save(); setF(x, w, px); x.globalAlpha = a == null ? 1 : a; x.fillStyle = fill; x.textAlign = align || 'left'; x.textBaseline = 'alphabetic'; x.fillText(s, X, Y); x.restore();
  }
  // hairline callout: anchor dot -> elbow -> end, label sits at the end
  function callout(x, pts, p, lab, sub, side, o) {
    o = o || {};
    if (p <= 0) return;
    const ink = o.ink || '255,255,255';
    x.save();
    const [A] = pts, e = eo(p / 0.35);
    x.fillStyle = `rgba(${ink},${0.95 * e})`; x.beginPath(); x.arc(A[0], A[1], 3.6, 0, 7); x.fill();
    x.strokeStyle = `rgba(${ink},${0.35 * e})`; x.lineWidth = 1; x.beginPath(); x.arc(A[0], A[1], 5 + 6 * e, 0, 7); x.stroke();
    let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    let rem = len * io(sm(0.1, 0.75, p));
    x.strokeStyle = `rgba(${ink},0.7)`; x.lineWidth = 1; x.beginPath(); x.moveTo(A[0], A[1]);
    for (let i = 1; i < pts.length && rem > 0; i++) {
      const a = pts[i - 1], b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]), f = Math.min(1, rem / d);
      x.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); rem -= d;
    }
    x.stroke();
    const la = sm(0.6, 1, p), E = pts[pts.length - 1], dx = (1 - la) * 10 * (side === 'r' ? 1 : -1);
    if (la > 0) {
      const tx = side === 'r' ? E[0] + 14 + dx : E[0] - 14 + dx, al = side === 'r' ? 'left' : 'right';
      label(x, lab, tx, E[1] + 10, 600, o.px || 28, o.labFill || `rgb(${ink})`, al, la);
      if (sub) label(x, sub, tx, E[1] + 10 + (o.px || 28) * 1.05, 400, o.subPx || 21, o.subFill || GREY, al, la);
    }
    x.restore();
  }
  // arrow along a polyline/bezier sample list, drawn to progress p
  function arrow(x, pts, p, stroke, lw, head) {
    if (p <= 0) return;
    const n = Math.max(2, Math.round(pts.length * H.clamp(p)));
    x.save(); x.strokeStyle = stroke; x.lineWidth = lw || 1.2; x.lineCap = 'round'; x.beginPath();
    for (let i = 0; i < n; i++) (i ? x.lineTo : x.moveTo).call(x, pts[i][0], pts[i][1]);
    x.stroke();
    if (head !== false && n >= 2) {
      const a = pts[n - 2], b = pts[n - 1], an = Math.atan2(b[1] - a[1], b[0] - a[0]), hl = 10;
      x.beginPath(); x.moveTo(b[0] - hl * Math.cos(an - 0.45), b[1] - hl * Math.sin(an - 0.45)); x.lineTo(b[0], b[1]); x.lineTo(b[0] - hl * Math.cos(an + 0.45), b[1] - hl * Math.sin(an + 0.45)); x.stroke();
    }
    x.restore();
  }
  const bez = (p0, p1, p2, p3, n) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; });

  // ---------- example "photo" cards (cached sprites, pre-blurred for depth of field) ----------
  const CARD = {}, CW = 150, CH = 184, CS = 2, CP = 40;
  function cardSprite(kind, tag, tagCol, blur) {
    const key = [kind, tag, tagCol, blur].join('|');
    if (CARD[key]) return CARD[key];
    const c = H.layer(CW * CS + CP * 2, CH * CS + CP * 2), x = c.getContext('2d');
    if (blur) { const b = cardSprite(kind, tag, tagCol, 0); x.filter = `blur(${blur * CS}px)`; x.drawImage(b, 0, 0); return (CARD[key] = c); }
    x.translate(CP, CP); x.scale(CS, CS);
    x.beginPath(); x.roundRect(0, 0, CW, CH, 20); x.save(); x.clip();
    let g = x.createLinearGradient(0, 0, CW * 0.4, CH);
    if (kind === 'cat') { g.addColorStop(0, '#ffd2a6'); g.addColorStop(1, '#ee7d55'); } else if (kind === 'dog') { g.addColorStop(0, '#a9ccff'); g.addColorStop(1, '#5b6ff0'); } else { g.addColorStop(0, '#ffd2a6'); g.addColorStop(1, '#ee7d55'); }
    x.fillStyle = g; x.fillRect(0, 0, CW, CH);
    g = x.createRadialGradient(CW * 0.5, 70, 10, CW * 0.5, 70, 110); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, CW, CH);
    const bg = kind === 'dog' ? '#4d5fd6' : '#d8673f';
    x.fillStyle = '#fff';
    if (kind !== 'dog') {
      x.beginPath(); x.moveTo(44, 70); x.lineTo(40, 28); x.lineTo(68, 52); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(106, 70); x.lineTo(110, 28); x.lineTo(82, 52); x.closePath(); x.fill();
      x.beginPath(); x.ellipse(75, 80, 40, 34, 0, 0, 7); x.fill();
      x.fillStyle = bg; x.beginPath(); x.ellipse(60, 77, 4.5, 7, 0, 0, 7); x.ellipse(90, 77, 4.5, 7, 0, 0, 7); x.fill();
      x.beginPath(); x.moveTo(70, 91); x.lineTo(80, 91); x.lineTo(75, 97); x.closePath(); x.fill();
      x.strokeStyle = bg; x.lineWidth = 1.6; x.lineCap = 'round'; x.beginPath();
      x.moveTo(75, 97); x.quadraticCurveTo(70, 103, 64, 100); x.moveTo(75, 97); x.quadraticCurveTo(80, 103, 86, 100);
      x.moveTo(52, 92); x.lineTo(30, 88); x.moveTo(52, 97); x.lineTo(32, 100); x.moveTo(98, 92); x.lineTo(120, 88); x.moveTo(98, 97); x.lineTo(118, 100); x.stroke();
    } else {
      x.fillStyle = 'rgba(255,255,255,0.78)';
      x.beginPath(); x.ellipse(42, 76, 14, 30, 0.35, 0, 7); x.ellipse(108, 76, 14, 30, -0.35, 0, 7); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.ellipse(75, 76, 36, 38, 0, 0, 7); x.fill();
      x.beginPath(); x.ellipse(75, 100, 20, 15, 0, 0, 7); x.fill();
      x.fillStyle = bg; x.beginPath(); x.ellipse(61, 72, 4.5, 5.5, 0, 0, 7); x.ellipse(89, 72, 4.5, 5.5, 0, 0, 7); x.fill();
      x.beginPath(); x.ellipse(75, 92, 8, 5.5, 0, 0, 7); x.fill();
      x.strokeStyle = bg; x.lineWidth = 1.6; x.beginPath(); x.moveTo(75, 97); x.lineTo(75, 104); x.quadraticCurveTo(69, 109, 64, 105); x.moveTo(75, 104); x.quadraticCurveTo(81, 109, 86, 105); x.stroke();
    }
    // tag pill
    x.font = '600 28px "Inter"';
    const tw = x.measureText(tag).width + 30;
    x.fillStyle = tagCol || 'rgba(10,10,14,0.55)'; x.beginPath(); x.roundRect(75 - tw / 2, 132, tw, 40, 20); x.fill();
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(tag, 75, 153);
    // gloss
    g = x.createLinearGradient(0, 0, CW, CH * 0.7); g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, CW, CH);
    x.restore();
    x.strokeStyle = 'rgba(255,255,255,0.45)'; x.lineWidth = 1; x.beginPath(); x.roundRect(0.5, 0.5, CW - 1, CH - 1, 20); x.stroke();
    return (CARD[key] = c);
  }
  function drawCard(x, kind, tag, tagCol, cx, cy, s, blur, rot, a) {
    const lv = [0, 2, 5, 9]; let bi = 0; for (let i = 0; i < lv.length; i++) if (Math.abs(lv[i] - blur) < Math.abs(lv[bi] - blur)) bi = i;
    const sp = cardSprite(kind, tag, tagCol, lv[bi]);
    x.save(); x.globalAlpha = a; x.translate(cx, cy); x.rotate(rot || 0); x.scale(s / CS, s / CS);
    x.drawImage(sp, -sp.width / 2, -sp.height / 2); x.restore();
  }

  // ---------- finishing ----------
  let GR = null;
  function finish(x, W, Hh, t, white) {
    if (!GR) { GR = H.layer(256, 256); const g = GR.getContext('2d'), img = g.createImageData(256, 256), r = H.rng(77); for (let i = 0; i < img.data.length; i += 4) { const v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; } g.putImageData(img, 0, 0); }
    if (!white) H.vignette(x, W, Hh, 0.55);
    const r = H.rng(900 + Math.floor(t * 24));
    x.save(); x.globalAlpha = white ? 0.04 : 0.06; x.globalCompositeOperation = 'soft-light';
    x.translate(-r() * 256, -r() * 256); x.fillStyle = x.createPattern(GR, 'repeat'); x.fillRect(0, 0, W + 256, Hh + 256); x.restore();
  }
  function ringGlow(base, t, pulses) { let v = base; for (const p of pulses) if (t > p) v += 0.9 * Math.exp(-(t - p) * 5); return v; }

  // ================= STILL / CLIP =================
  function drawHero(ctx, W, Hh, t) {
    const D = 6, q = io(t / D);
    const c = cam({ cx: 640, cy: 572, s: H.lerp(0.68, 0.8, q), yaw: H.lerp(-0.95, -0.42, q), pitch: H.lerp(0.32, 0.42, q) });
    const L = { key: sm(0.7, 2.2, t), rim: sm(0.1, 1.1, t), ring: sm(1.5, 2.1, t) + 0.8 * Math.exp(-Math.max(0, t - 1.6) * 3) * (t > 1.6 ? 1 : 0), spec: H.map(t, 2.0, 3.8, -0.25, 1.25),
      fwd: t > 2.4 ? ((t - 2.4) % 1.8) / 1.4 : -1, back: -1, adj: 0, act: sm(1.6, 2.6, t), hover: 0.36 + 0.015 * Math.sin(t * 1.2), ringRot: t * 0.25 };
    if (L.fwd > 1) L.fwd = -1;
    stage(ctx, W, Hh, c, L, t);
    chip(ctx, c, L);
    // headline
    words(ctx, [{ s: 'Introducing', t: 1.75, fill: 'grad' }], 640, 92, 600, 26, t, { align: 'center', stops: GV });
    words(ctx, [{ s: 'Thinks', t: 2.05 }, { s: 'in', t: 2.3 }, { s: 'layers.', t: 2.55 }], 640, 176, 800, 88, t, { align: 'center' });
    // callouts on the object
    const yT = L.hover + THICK / 2;
    const a1 = c.P(NODES[0][1][0], yT, NODES[0][1][1]), a2 = c.P(DIE[3][0], yT, DIE[3][1]), a3 = c.P(0.55, L.hover - THICK * 0.2, 1.0);
    callout(ctx, [a1, [a1[0] - 60, 300], [380, 300]], sm(3.0, 3.9, t), '4-layer neural core', 'Learns from every example', 'l');
    callout(ctx, [a2, [a2[0] + 50, 300], [920, 300]], sm(3.35, 4.25, t), 'Edge-lit glass', 'Sapphire top, 0.4 mm', 'r');
    callout(ctx, [a3, [a3[0] + 40, 590], [920, 590]], sm(3.7, 4.6, t), 'Graphite unibody', 'Machined from one block', 'r');
    finish(ctx, W, Hh, t, false);
  }

  // ================= EXPLAINER =================
  const D_EX = 15.5;
  // timing (shared by explainer() and explainerSound())
  const T = {
    hook: [0.3, 0.55, 0.8, 1.05], key: [1.15, 2.4], rim: [0.6, 1.5], ringOn: 1.95, head: [1.85, 2.6],
    path: [2.6, 3.1], cards: Array.from({ length: 14 }, (_, i) => 2.68 + i * 0.18), travel: 1.25, cnt: [2.95, 5.5],
    inCard: 6.15, inArrow: [6.5, 6.8], fwd1: [6.8, 7.25], outArrow: [7.2, 7.45], dog: 7.45,
    check: 8.1, strike: [8.15, 8.4], xmark: 8.42, err: [8.5, 8.95], back: [8.92, 9.42], adjust: 8.95,
    fwd2: [9.45, 9.75], dogOut: [9.5, 9.72], cat: 9.75, loop: [9.95, 10.6],
    acc: 10.8, num: [11.0, 12.4], lock: 12.4, gleam: [12.45, 12.95],
    sweep: [13.0, 13.45], tag: [13.35, 13.52, 13.69, 13.86, 14.03],
  };
  const KEYS = [
    { t: 0, cx: 640, cy: 640, s: 0.58, yaw: -0.8, pitch: 0.30 },
    { t: 1.7, cx: 640, cy: 628, s: 0.62, yaw: -0.66, pitch: 0.32 },
    { t: 2.8, cx: 860, cy: 520, s: 0.8, yaw: -0.32, pitch: 0.42 },
    { t: 5.8, cx: 880, cy: 515, s: 0.85, yaw: -0.08, pitch: 0.46 },
    { t: 6.6, cx: 580, cy: 500, s: 0.76, yaw: 0.06, pitch: 0.72 },
    { t: 10.25, cx: 590, cy: 500, s: 0.79, yaw: 0.2, pitch: 0.74 },
    { t: 11.0, cx: 300, cy: 520, s: 0.64, yaw: -0.3, pitch: 0.42 },
    { t: 13.0, cx: 290, cy: 520, s: 0.68, yaw: -0.12, pitch: 0.42 },
    { t: 14.3, cx: 640, cy: 590, s: 0.7, yaw: 0.3, pitch: 0.36 },
    { t: 15.5, cx: 640, cy: 585, s: 0.72, yaw: 0.42, pitch: 0.36 },
  ];
  const accVal = (p) => 61 + 36 * (1 - Math.pow(1 - p, 2.2)) + Math.sin(p * 23) * 2.2 * (1 - p) * p;

  function lighting(t) {
    const pulses = T.cards.map((c) => c + T.travel - 0.05).concat([T.fwd1[1], T.fwd2[1], T.lock, T.sweep[1]]);
    let fwd = -1, back = -1;
    if (t > T.fwd1[0] && t < T.fwd1[1] + 0.2) fwd = (t - T.fwd1[0]) / (T.fwd1[1] - T.fwd1[0]);
    else if (t > T.fwd2[0] && t < T.fwd2[1] + 0.2) fwd = (t - T.fwd2[0]) / (T.fwd2[1] - T.fwd2[0]);
    else if (t > 2.8 && t < 6.4) fwd = ((t - 2.8) % 0.72) / 0.6;
    else if (t > 11.0 && t < 12.4) fwd = ((t - 11.0) % 0.47) / 0.4;
    if (fwd > 1.15) fwd = -1;
    if (t > T.back[0] && t < T.back[1] + 0.2) back = (t - T.back[0]) / (T.back[1] - T.back[0]);
    return { key: sm(T.key[0], T.key[1], t), rim: sm(T.rim[0], T.rim[1], t), ring: t < T.ringOn ? 0 : ringGlow(sm(T.ringOn, T.ringOn + 0.5, t) * 0.85, t, pulses),
      spec: t < 8 ? H.map(t, 2.2, 4.0, -0.25, 1.25) : t < 13.3 ? H.map(t, 12.35, 13.0, -0.25, 1.25) : H.map(t, 13.6, 14.9, -0.25, 1.25),
      fwd, back, adj: io(sm(T.back[0], T.back[1] + 0.1, t)), act: sm(1.9, 2.8, t), hover: 0.36 + 0.015 * Math.sin(t * 1.2), ringRot: t * 0.3 };
  }

  function darkScene(x, W, Hh, t, c, L) {
    stage(x, W, Hh, c, L, t);
    const yT = L.hover + THICK / 2, top = c.P(0, yT, 0);
    // loop ring (back half before the chip)
    const ringP = sm(T.loop[0], T.loop[1], t), ringA = (1 - sm(T.loop[1], T.loop[1] + 0.35, t));
    if (ringP > 0 && ringA > 0) loopRing(x, c, L, ringP, ringA, false);
    chip(x, c, L);
    if (ringP > 0 && ringA > 0) loopRing(x, c, L, ringP, ringA, true);

    // ---- beat 1: hook, then shrink to a corner header
    {
      const list = [{ s: 'How', t: T.hook[0] }, { s: 'does', t: T.hook[1] }, { s: 'AI', t: T.hook[2] }, { s: 'learn?', t: T.hook[3] }];
      const m = io(sm(T.head[0], T.head[1], t)), px = 108;
      const { tot } = wordsW(x, list, 800, px);
      const k = H.lerp(1, 44 / px, m), X = H.lerp(640 - tot / 2, 56, m), Y = H.lerp(330, 82, m);
      const fade = 1 - sm(12.6, 13.0, t);
      if (fade > 0) {
        x.save(); x.translate(X, Y); x.scale(k, k);
        words(x, list, 0, 0, 800, px, t, { alpha: H.lerp(1, 0.9, m) * fade });
        x.restore();
      }
    }

    // ---- beat 2: training data streams into the model
    const b2 = 1 - sm(5.85, 6.35, t), dx2 = c.cx - 880;
    if (t > T.path[0] && b2 > 0) {
      x.save(); x.globalAlpha = b2;
      const P0 = [-160, 690 + 0], P1 = [80, 380], P2 = [360, 230], P3 = [top[0] - 30, top[1] - 6];
      const path = bez(P0, P1, P2, P3, 60).map((p) => [p[0] + (p === null ? 0 : 0), p[1]]);
      arrow(x, path.slice(8, 57), sm(T.path[0], T.path[1], t), 'rgba(255,255,255,0.32)', 1.2);
      callout(x, [[path[24][0], path[24][1]], [path[24][0] + 30, 172], [250, 172]], sm(2.95, 3.8, t), 'Training data', 'labeled examples', 'r');
      const kinds = ['cat', 'dog', 'dog', 'cat', 'cat', 'dog', 'cat', 'dog', 'dog', 'cat', 'dog', 'cat', 'cat', 'dog'];
      // draw far-to-near: later cards (closer to camera at start) on top
      for (let i = 0; i < T.cards.length; i++) {
        const u = (t - T.cards[i]) / T.travel;
        if (u <= 0 || u >= 1) continue;
        const v = H.ease.inOut(u) * 0.9 + u * 0.1;
        const pts = bez(P0, P1, P2, P3, 1), p = (() => { const w = 1 - v; return [w * w * w * P0[0] + 3 * w * w * v * P1[0] + 3 * w * v * v * P2[0] + v * v * v * P3[0], w * w * w * P0[1] + 3 * w * w * v * P1[1] + 3 * w * v * v * P2[1] + v * v * v * P3[1]]; })();
        void pts;
        const s = v < 0.42 ? H.lerp(1.7, 1.05, v / 0.42) : H.lerp(1.05, 0.08, Math.pow((v - 0.42) / 0.58, 1.25));
        const blur = v < 0.38 ? H.lerp(9, 0, v / 0.38) : v > 0.85 ? (v - 0.85) * 20 : 0;
        const a = Math.min(1, u * 6) * (1 - sm(0.86, 1, v));
        drawCard(x, kinds[i], kinds[i], null, p[0], p[1], s, blur, H.lerp(-0.22, 0.12, v) + Math.sin(i * 2.1) * 0.06, a);
      }
      // counter
      const cv = Math.round(Math.pow(10, 6 * io(sm(T.cnt[0], T.cnt[1], t))));
      const ca = sm(T.cnt[0] - 0.2, T.cnt[0] + 0.15, t);
      if (ca > 0) {
        x.save(); x.globalAlpha = ca * b2; setF(x, 800, 80);
        const s = cv.toLocaleString('en-US'), w = x.measureText(s).width, X = 1216 + dx2 * 0.3 - w;
        x.shadowColor = 'rgba(60,170,255,0.55)'; x.shadowBlur = 30; x.fillStyle = grad(x, X, X + w, GT); x.fillText(s, X, 636);
        x.shadowBlur = 0; x.fillText(s, X, 636);
        label(x, 'examples', 1216 + dx2 * 0.3, 680, 400, 30, GREY, 'right');
        x.restore();
      }
      x.restore();
    }

    // ---- beat 3: guess -> check -> adjust
    const b3 = sm(6.05, 6.5, t) * (1 - sm(10.3, 10.65, t)), dx3 = c.cx - 580;
    if (b3 > 0) {
      x.save(); x.globalAlpha = b3; x.translate(dx3 * 0.9, 0);
      const ix = 172, iy = 396;
      const cardIn = eo(sm(T.inCard, T.inCard + 0.55, t));
      const flip = sm(T.check, T.check + 0.25, t);
      const cs = H.lerp(0.9, 1.18, cardIn), cb = (1 - cardIn) * 8;
      drawCard(x, 'cat', '?', null, ix - (1 - cardIn) * 80, iy, cs, cb, -0.04, cardIn * (1 - flip));
      if (flip > 0) drawCard(x, 'cat', 'cat', 'rgba(32,190,140,0.95)', ix, iy, cs, 0, -0.04, flip);
      callout(x, [[ix, iy - 112], [ix, 232], [ix + 24, 232]], sm(T.check, T.check + 0.7, t), '02  Check', 'it\'s a cat', 'r');
      const L0 = c.P(-1.0, yT, 0.05), R0 = c.P(1.0, yT, -0.05);
      arrow(x, bez([ix + 96, iy], [ix + 150, iy], [L0[0] - 70, L0[1]], [L0[0] - 14 - dx3 * 0.9, L0[1]], 24), sm(T.inArrow[0], T.inArrow[1], t), 'rgba(255,255,255,0.6)', 1.3);
      const ox = 930, oy = 404;
      arrow(x, bez([R0[0] + 14 - dx3 * 0.9, R0[1]], [R0[0] + 40 - dx3 * 0.9, R0[1]], [ox - 60, oy - 34], [ox - 18, oy - 34], 24), sm(T.outArrow[0], T.outArrow[1], t), 'rgba(255,255,255,0.6)', 1.3);
      // guess
      const out1 = 1 - sm(T.dogOut[0], T.dogOut[1], t);
      if (t > T.dog && out1 > 0) {
        x.save(); x.globalAlpha *= out1; x.translate(0, -(1 - out1) * 30);
        const r = words(x, [{ s: 'dog?', t: T.dog }], ox, oy, 800, 104, t, {});
        const sp = sm(T.strike[0], T.strike[1], t);
        if (sp > 0) {
          x.strokeStyle = RED; x.lineWidth = 7; x.lineCap = 'round'; x.shadowColor = 'rgba(255,69,58,0.6)'; x.shadowBlur = 14;
          x.beginPath(); x.moveTo(ox - 8, oy - 34); x.lineTo(ox - 8 + (r.tot + 16) * io(sp), oy - 34); x.stroke(); x.shadowBlur = 0;
        }
        const xm = eo(sm(T.xmark, T.xmark + 0.3, t));
        if (xm > 0) {
          const mx = ox + r.tot + 52, my = oy - 36, rr_ = 26 * (0.6 + 0.4 * xm);
          x.globalAlpha *= xm; x.strokeStyle = RED; x.lineWidth = 3.5;
          x.beginPath(); x.arc(mx, my, rr_, 0, 7); x.stroke();
          x.beginPath(); x.moveTo(mx - 9, my - 9); x.lineTo(mx + 9, my + 9); x.moveTo(mx + 9, my - 9); x.lineTo(mx - 9, my + 9); x.stroke();
        }
        x.restore();
      }
      if (t > T.cat) {
        const r = words(x, [{ s: 'cat', t: T.cat, fill: 'grad' }], ox, oy, 800, 104, t, { stops: GG });
        x.save(); x.shadowColor = 'rgba(60,230,170,0.6)'; x.shadowBlur = 24 * Math.exp(-(t - T.cat) * 2);
        const cm = eo(sm(T.cat + 0.1, T.cat + 0.4, t)), mx = ox + r.tot + 52, my = oy - 36;
        x.globalAlpha *= cm; x.fillStyle = '#2fd6a0'; x.beginPath(); x.arc(mx, my, 26 * (0.6 + 0.4 * cm), 0, 7); x.fill();
        x.shadowBlur = 0; x.strokeStyle = '#04120c'; x.lineWidth = 4; x.lineCap = 'round'; x.lineJoin = 'round';
        x.beginPath(); x.moveTo(mx - 11, my + 1); x.lineTo(mx - 3, my + 9); x.lineTo(mx + 12, my - 8); x.stroke();
        x.restore();
      }
      callout(x, [[ox + 4, oy - 108], [ox + 4, 238], [ox + 28, 238]], sm(T.dog + 0.05, T.dog + 0.75, t), '01  Guess', null, 'r');
      // error signal travelling back to the model
      const ep = sm(T.err[0], T.err[1], t), ea = 1 - sm(T.back[1], T.back[1] + 0.4, t);
      if (ep > 0 && ea > 0) {
        const F0 = c.P(0.55, yT - THICK, 1.0);
        const epath = bez([ox + 70, oy + 28], [ox + 60, 640], [F0[0] + 180 - dx3 * 0.9, 650], [F0[0] + 10 - dx3 * 0.9, F0[1] + 26], 50);
        x.save(); x.globalAlpha *= ea;
        arrow(x, epath, ep, 'rgba(255,110,80,0.75)', 1.6);
        // the struck word charges with a soft red underglow, and the signal leaves it as a small comet with a tail
        { const ug = (1 - sm(T.err[0] + 0.25, T.back[1], t)) * 0.2;
          if (ug > 0.005) { x.save(); x.translate(ox + 150, oy - 30); x.scale(1, 0.32); const g = x.createRadialGradient(0, 0, 0, 0, 0, 240); g.addColorStop(0, `rgba(255,70,50,${ug})`); g.addColorStop(1, 'rgba(255,60,40,0)'); x.globalCompositeOperation = 'lighter'; x.fillStyle = g; x.beginPath(); x.arc(0, 0, 240, 0, 7); x.fill(); x.restore(); } }
        if (ep < 1) {
          const hi = Math.min(epath.length - 1, Math.round(ep * (epath.length - 1))), hp = epath[hi], ha = sm(0, 0.14, ep);
          const ti = Math.max(0, hi - 7), tp = epath[ti];
          if (hi > ti) { const tg = x.createLinearGradient(tp[0], tp[1], hp[0], hp[1]); tg.addColorStop(0, 'rgba(255,90,60,0)'); tg.addColorStop(1, `rgba(255,150,120,${0.9 * ha})`); x.strokeStyle = tg; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); for (let q = ti; q <= hi; q++) (q > ti ? x.lineTo : x.moveTo).call(x, epath[q][0], epath[q][1]); x.stroke(); }
          const g = x.createRadialGradient(hp[0], hp[1], 0, hp[0], hp[1], 18); g.addColorStop(0, `rgba(255,225,205,${ha})`); g.addColorStop(0.3, `rgba(255,100,70,${0.75 * ha})`); g.addColorStop(1, 'rgba(255,60,40,0)'); x.fillStyle = g; x.beginPath(); x.arc(hp[0], hp[1], 18, 0, 7); x.fill();
        }
        label(x, 'error', epath[22][0] + 18, epath[22][1] + 8, 600, 28, '#ff7a5c', 'left', sm(T.err[0] + 0.15, T.err[0] + 0.4, t));
        x.restore();
      }
      // adjust callout on the inner layers
      const an = c.P(NODES[2][1][0], yT, NODES[2][1][1]);
      callout(x, [[an[0] - dx3 * 0.9, an[1]], [an[0] + 30 - dx3 * 0.9, 150], [an[0] + 70 - dx3 * 0.9, 150]], sm(T.adjust, T.adjust + 0.75, t), '03  Adjust', 'weights shift', 'r', { ink: '255,190,150' });
      if (ringP > 0.05 && ringA > 0) { const fr = c.P(1.42 * Math.cos(0.75), L.hover, 1.42 * Math.sin(0.75)); label(x, 'Repeat × 1,000,000', fr[0] + 22 - dx3 * 0.9, fr[1] + 10, 600, 30, INK, 'left', sm(T.loop[0] + 0.05, T.loop[0] + 0.3, t) * ringA); }
      x.restore();
    }

    // ---- beat 4: accuracy, the giant gradient number
    const b4 = sm(10.6, 11.0, t);
    if (b4 > 0) {
      const p = eo(sm(T.num[0], T.num[1], t)), val = Math.round(accVal(p));
      const lk = t > T.lock ? Math.exp(-(t - T.lock) * 2.2) : 0;
      const zoom = 1 + 0.05 * sm(T.lock, T.lock + 0.5, t) + 0.035 * lk;
      x.save(); x.globalAlpha = b4;
      label(x, 'Accuracy', 566, 196, 600, 36, GREY, 'left', sm(T.acc, T.acc + 0.4, t));
      // chart
      const cx0 = 572, cx1 = 1196, yOf = (v) => 640 - ((v - 55) / 45) * 170, N = 60;
      x.strokeStyle = 'rgba(255,255,255,0.18)'; x.lineWidth = 1; x.beginPath(); x.moveTo(cx0, 642); x.lineTo(cx0 + (cx1 - cx0) * sm(10.85, 11.3, t), 642); x.stroke();
      const cp = sm(T.num[0], T.num[1], t);
      const pts = []; for (let i = 0; i <= N * cp; i++) { const r = i / N; pts.push([H.lerp(cx0, cx1, r), yOf(accVal(r))]); }
      if (pts.length > 1) {
        const hp = [H.lerp(cx0, cx1, cp), yOf(accVal(cp))]; pts.push(hp);
        x.beginPath(); pts.forEach((q, i) => (i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]))); x.lineTo(hp[0], 642); x.lineTo(cx0, 642); x.closePath();
        let g = x.createLinearGradient(0, 440, 0, 642); g.addColorStop(0, 'rgba(232,121,249,0.22)'); g.addColorStop(1, 'rgba(232,121,249,0)'); x.fillStyle = g; x.fill();
        x.beginPath(); pts.forEach((q, i) => (i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])));
        x.strokeStyle = grad(x, cx0, cx1, GV); x.lineWidth = 3; x.lineJoin = 'round'; x.shadowColor = 'rgba(232,121,249,0.7)'; x.shadowBlur = 14; x.stroke(); x.shadowBlur = 0;
        g = x.createRadialGradient(hp[0], hp[1], 0, hp[0], hp[1], 22); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,170,110,0.8)'); g.addColorStop(1, 'rgba(255,150,80,0)'); x.fillStyle = g; x.beginPath(); x.arc(hp[0], hp[1], 22, 0, 7); x.fill();
      }
      label(x, 'Training rounds →', cx0, 682, 400, 28, '#8e8e93', 'left', sm(10.9, 11.3, t));
      // number
      const s = val + '%', na = sm(T.num[0] - 0.25, T.num[0] + 0.1, t);
      x.save(); x.translate(566, 404); x.scale(zoom, zoom); x.globalAlpha = b4 * na; setF(x, 800, 200);
      const w = x.measureText(s).width;
      const fill = grad(x, 0, w, GV);
      x.shadowColor = `rgba(220,110,255,${0.5 + 0.4 * lk})`; x.shadowBlur = 50 + 60 * lk; x.fillStyle = fill; x.fillText(s, 0, 0);
      x.shadowBlur = 0; x.fillText(s, 0, 0);
      x.restore();
      // gleam across the number
      const gp = sm(T.gleam[0], T.gleam[1], t);
      if (gp > 0 && gp < 1) {
        const Lr = gleamLayer(); const g2 = Lr.getContext('2d'); g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalCompositeOperation = 'source-over'; g2.clearRect(0, 0, 1280, 720);
        g2.save(); g2.translate(566, 404); g2.scale(zoom, zoom); setF(g2, 800, 200); g2.fillStyle = '#fff'; g2.fillText(s, 0, 0); g2.restore();
        g2.globalCompositeOperation = 'source-in';
        const bx = 566 - 200 + gp * (w * zoom + 400), gg = g2.createLinearGradient(bx - 90, 0, bx + 90, 0);
        gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,255,0.85)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
        g2.fillStyle = gg; g2.fillRect(0, 0, 1280, 720);
        x.drawImage(Lr, 0, 0, 1280, 720);
      }
      x.restore();
    }
  }
  let GL = null; const gleamLayer = () => GL || (GL = H.layer(1280, 720));

  function loopRing(x, c, L, p, a, front) {
    const N = 90, R = 1.42, y = L.hover, a0 = 1.6, cd = c.P(0, L.hover, 0)[2];
    const pts = []; for (let i = 0; i <= N * p; i++) { const an = a0 + (i / N) * PI * 2; pts.push(c.P(R * Math.cos(an), y, R * Math.sin(an))); }
    if (pts.length < 2) return;
    x.save(); x.globalAlpha *= a; x.lineCap = 'round'; x.lineWidth = 2;
    const g = grad(x, c.cx - c.unit * 1.8, c.cx + c.unit * 1.8, GV); x.strokeStyle = g; x.shadowColor = 'rgba(220,120,255,0.6)'; x.shadowBlur = 10;
    for (let i = 1; i < pts.length; i++) { if ((pts[i][2] > cd) !== front) continue; x.beginPath(); x.moveTo(pts[i - 1][0], pts[i - 1][1]); x.lineTo(pts[i][0], pts[i][1]); x.stroke(); }
    const hp = pts[pts.length - 1];
    if ((hp[2] > cd) === front) { const b = pts[pts.length - 2], an = Math.atan2(hp[1] - b[1], hp[0] - b[0]); x.fillStyle = '#ffd0f0'; x.beginPath(); x.moveTo(hp[0] + 12 * Math.cos(an), hp[1] + 12 * Math.sin(an)); x.lineTo(hp[0] + 9 * Math.cos(an + 2.3), hp[1] + 9 * Math.sin(an + 2.3)); x.lineTo(hp[0] + 9 * Math.cos(an - 2.3), hp[1] + 9 * Math.sin(an - 2.3)); x.fill(); }
    x.restore();
  }

  function whiteScene(x, W, Hh, t, c, L) {
    const Lw = Object.assign({}, L, { white: 1, key: 1, rim: 1 });
    stage(x, W, Hh, c, Lw, t);
    chip(x, c, Lw);
    const list = [{ s: 'More', t: T.tag[0], fill: '#1d1d1f' }, { s: 'examples', t: T.tag[1], fill: '#1d1d1f' }, { s: '→', t: T.tag[2], fill: '#86868b' }, { s: 'better', t: T.tag[3], fill: 'grad' }, { s: 'guesses', t: T.tag[4], fill: 'grad' }];
    const { tot, sp } = wordsW(x, list, 800, 66);
    const gx0 = 640 - tot / 2 + list[0]._w + list[1]._w + list[2]._w + sp * 3;
    words(x, list, 640, 196, 800, 66, t, { align: 'center', gx0, gx1: 640 + tot / 2, stops: ['#7c4dff', '#d946ef', '#ff7a2f'] });
    label(x, 'That’s how AI learns.', 640, 262, 400, 30, '#6e6e73', 'center', sm(14.45, 14.9, t));
  }

  function explainer(ctx, W, Hh, t) {
    const c = cam(keyed(KEYS, t));
    const L = lighting(t);
    const s0 = T.sweep[0], s1 = T.sweep[1];
    if (t < s1) darkScene(ctx, W, Hh, t, c, L);
    if (t >= s0) {
      const bx = H.lerp(-260, W + 260, io(sm(s0, s1, t)));
      ctx.save();
      if (t < s1) { ctx.beginPath(); ctx.rect(0, 0, Math.max(0, bx), Hh); ctx.clip(); }
      whiteScene(ctx, W, Hh, t, c, L);
      ctx.restore();
      if (t < s1 + 0.05) {
        const g = ctx.createLinearGradient(bx - 260, 0, bx + 120, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(255,255,255,0.9)'); g.addColorStop(0.85, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(bx - 260, 0, 380, Hh); ctx.restore();
      }
    }
    finish(ctx, W, Hh, t, t >= s1);
  }

  registerStyle({
    id: 'product-launch',
    name: 'Product Launch Reveal',
    category: 'Popular Explainer Looks',
    description: 'A big-tech keynote product film: one glossy hero object on a near-black stage, lit like a studio shot with soft key, rim light, a sweeping specular highlight and a floor reflection, huge tight-tracked sans headlines, gradient key numbers with a soft glow and hairline spec callouts.',
    motion: 'Rim light finds the object in the dark, the key light fades up as the camera slowly orbits and pushes in, a highlight glides across the glass, the edge ring ignites, then the headline arrives one word at a time and hairline callouts draw out to their spec labels.',
    fonts: ['800 108px "Inter"', '800 88px "Inter"', '800 200px "Inter"', '600 28px "Inter"', '600 36px "Inter"', '400 30px "Inter"', '400 21px "Inter"'],
    frameT: 5.6,
    duration: 6,
    draw: drawHero,
    explainerDuration: D_EX,
    explainerNote: 'Told as a keynote launch film around one hero object (the model, a glass-topped chip): one continuous studio camera that orbits and pushes between beats, hairline callouts and arrows for flow, a clean red strike for the wrong guess while the chip’s inner layers light up backwards to adjust, a giant violet-to-orange 97% with a glow bloom and gleam, and a light-sweep wipe to a pristine white stage for the tagline.',
    explainer,
    // Keynote-film score: a quiet pad, then a minimal synth pulse under the data/learning beats, deep soft sub "bwooms"
    // on reveals, airy risers into the big moments, clean low clicks for labels and words, smooth low whooshes for every
    // camera move, a muted low two-note for the wrong guess, warm chords for "cat" and the 97% lock, and a resolving
    // chord under the tagline. All times come from T / the same easing used in explainer().
    explainerSound(k) {
      const D = D_EX, when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
      const bwoom = (t, g, dur = 1.4, f = 58) => {
        k.tone(t, { f: [[0, f * 1.7], [0.1, f], [dur, f * 0.72]], dur, gain: 0.5 * g, a: 0.012, hold: dur * 0.15 });
        k.tone(t, { f: f * 2, dur: dur * 0.45, gain: 0.07 * g, a: 0.012 });
        k.noise(t, { dur: 0.6, color: 'brown', filter: 'lowpass', f: [[0, 420], [0.6, 80]], gain: 0.22 * g, a: 0.008, verb: 0.25 });
      };
      const air = (t, dur, g) => { k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 450], [dur, 4200]], q: 0.7, gain: 0.13 * g, a: dur * 0.92, verb: 0.35 }); k.tone(t, { f: [[0, 'D3'], [dur, 'D4']], type: 'triangle', dur, gain: 0.025 * g, a: dur * 0.9, filter: 'lowpass', f2: 900 }); };
      const click = (t, g = 1, pan = 0, minor = true) => { k.noise(t, { dur: 0.014, filter: 'bandpass', f: 2300, q: 1.6, gain: 0.2 * g, pan, minor }); k.tone(t, { f: [[0, 420], [0.03, 260]], dur: 0.04, gain: 0.07 * g, pan, minor }); };
      const glide = (t, dur, g, pan = 0, minor = true) => k.noise(t, { dur, color: 'pink', filter: 'lowpass', f: [[0, 160], [dur * 0.5, 720], [dur, 190]], q: 0.9, gain: 0.26 * g, a: dur * 0.45, pan, verb: 0.15, minor });
      const chord = (t, notes, dur, g, minor = false) => notes.forEach((n, i) => {
        const pan = (i - (notes.length - 1) / 2) * 0.22;
        k.tone(t, { f: n, type: 'triangle', dur, gain: 0.05 * g, a: 0.03, hold: dur * 0.3, filter: 'lowpass', f2: [[0, 2200], [dur, 700]], pan, verb: 0.4, minor });
        k.tone(t, { f: k.hz(n) * 1.003, dur, gain: 0.04 * g, a: 0.05, hold: dur * 0.3, pan: -pan, verb: 0.4, minor });
      });
      const ticks = (val, a, b, gap, g, pan) => { let last = -1, prev = val(a); for (let t = a; t <= b; t += 0.002) { const v = val(t); if (v !== prev && t - last >= gap) { click(t, g, pan); last = t; } prev = v; } };

      // ---- music: quiet pad, minimal pulse through the middle, pad again for the resolve
      const CH = [['D3', 'A3', 'E4', 'F#4'], ['B2', 'F#3', 'D4', 'A4'], ['G2', 'D3', 'B3', 'F#4'], ['A2', 'E3', 'C#4', 'E4']];
      k.music('pad', 0.2, 2.65, { bpm: 64, gain: 0.32, chords: [CH[0]] });
      k.music('pulse', 2.65, 12.4, { bpm: 64, gain: 0.26, chords: [CH[1], CH[2], CH[3]] });
      k.music('pad', 12.4, D, { bpm: 64, gain: 0.3, chords: [CH[0]] });

      // ---- beat 1: words, light finds the object
      T.hook.forEach((t, i) => click(t, 0.8, (i - 1.5) * 0.15));
      air(0.4, 0.8, 0.8);
      bwoom(T.key[0] + 0.05, 0.7, 1.6);
      chord(T.ringOn, ['A3', 'E4'], 1.0, 0.5, true);                       // edge ring ignites
      glide(1.75, 1.05, 1.0, 0, false);                                      // header slides up, camera orbits right

      // ---- beat 2: data into the model
      click(T.path[1], 0.7, -0.3);
      click(when((t) => sm(2.95, 3.8, t), 0.6, 2.95, 3.8), 0.8, -0.4);       // "Training data" label lands
      T.cards.forEach((c) => { const ta = c + T.travel - 0.05; k.tone(ta, { f: [[0, 200], [0.12, 105]], dur: 0.16, gain: 0.12, pan: 0.3, minor: true }); k.noise(ta, { dur: 0.06, color: 'brown', filter: 'lowpass', f: 600, gain: 0.12, pan: 0.3, minor: true }); });
      ticks((t) => Math.round(Math.pow(10, 6 * io(sm(T.cnt[0], T.cnt[1], t))) / 1000), T.cnt[0] + 0.05, T.cnt[1] - 0.02, 0.085, 0.55, 0.5);
      k.play('tock', T.cnt[1], { f: 520, gain: 0.35, pan: 0.5 }); bwoom(T.cnt[1], 0.35, 0.9, 70);

      // ---- beat 3: guess, check, adjust
      glide(5.8, 0.85, 1.0, 0, false);                                       // camera swings round to the top view
      k.noise(T.inCard, { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 600], [0.5, 1800]], q: 0.8, gain: 0.07, a: 0.4, pan: -0.5, minor: true });
      click(T.inArrow[1], 0.7, -0.3);
      k.noise(T.fwd1[0], { dur: 0.45, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.45, 2200]], q: 1.2, gain: 0.08, a: 0.3, minor: true });
      click(T.outArrow[1], 0.7, 0.3);
      bwoom(T.dog, 0.5, 0.9, 72); click(T.dog, 0.9, 0.4, false);              // "dog?"
      click(when((t) => sm(T.dog + 0.05, T.dog + 0.75, t), 0.6, T.dog, T.dog + 0.8), 0.6, 0.4);
      click(T.check, 0.8, -0.5);                                             // tag turns to "cat"
      click(when((t) => sm(T.check, T.check + 0.7, t), 0.6, T.check, T.check + 0.8), 0.6, -0.5);
      k.noise(T.strike[0], { dur: 0.26, filter: 'bandpass', f: [[0, 900], [0.26, 2600]], q: 0.9, gain: 0.13, a: 0.08, pan: 0.4 });   // red strike
      k.tone(T.xmark, { f: 'E3', type: 'triangle', dur: 0.22, gain: 0.2, hold: 0.1, filter: 'lowpass', f2: 900, pan: 0.45 });         // muted "wrong"
      k.tone(T.xmark + 0.14, { f: 'C3', type: 'triangle', dur: 0.45, gain: 0.2, hold: 0.15, filter: 'lowpass', f2: 800, pan: 0.45 });
      bwoom(T.xmark, 0.45, 0.6, 50);
      k.tone(T.err[0], { f: [[0, 520], [0.45, 140]], dur: 0.5, gain: 0.07, a: 0.05, pan: 0.2 });                                          // error signal travels back
      k.noise(T.err[0], { dur: 0.48, color: 'pink', filter: 'bandpass', f: [[0, 1800], [0.48, 400]], q: 1, gain: 0.1, a: 0.1, pan: 0.2 });
      click(T.err[0] + 0.3, 0.5, 0.3);
      [3, 2, 1, 0].forEach((li, i) => click(T.back[0] + (1 - (li + 0.4) / 3.8) * (T.back[1] - T.back[0]), 0.75, 0.3 - i * 0.2));       // layers light up backwards
      k.noise(T.back[0], { dur: 0.6, color: 'brown', filter: 'lowpass', f: [[0, 250], [0.6, 900]], gain: 0.12, a: 0.3, minor: true });
      click(when((t) => sm(T.adjust, T.adjust + 0.75, t), 0.6, T.adjust, T.adjust + 0.8), 0.6, 0.1);
      k.noise(T.fwd2[0], { dur: 0.3, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.3, 2200]], q: 1.2, gain: 0.08, a: 0.2, minor: true });
      chord(T.cat, ['D4', 'F#4', 'A4'], 1.1, 0.9); bwoom(T.cat, 0.45, 0.9, 74);   // "cat" correct
      // loop ring: one smooth circular pass, panned around
      [[-0.6, 0], [0, 0.2], [0.6, 0.4]].forEach(([pan, dt]) => k.noise(T.loop[0] + dt, { dur: 0.35, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.18, 1300], [0.35, 500]], q: 0.9, gain: 0.12, a: 0.15, pan, minor: true }));
      click(T.loop[0] + 0.2, 0.6, 0.4);

      // ---- beat 4: accuracy
      glide(10.25, 0.85, 1.0, 0, false);
      click(T.acc + 0.15, 0.6, 0.2);
      bwoom(T.num[0] - 0.15, 0.35, 0.9, 66);
      ticks((t) => Math.round(accVal(eo(sm(T.num[0], T.num[1], t)))), T.num[0] + 0.02, T.num[1] - 0.02, 0.085, 0.6, 0.3);
      air(T.num[0] + 0.2, T.lock - T.num[0] - 0.2, 1.2);
      bwoom(T.lock, 1.35, 2.2, 52);                                          // the 97% lock: biggest hit
      chord(T.lock, ['D3', 'A3', 'D4', 'F#4', 'A4'], 1.8, 1.0);
      k.noise(T.lock, { dur: 0.9, color: 'pink', filter: 'lowpass', f: [[0, 2000], [0.9, 200]], gain: 0.16, a: 0.01, verb: 0.4 });
      k.noise(T.gleam[0], { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 1400], [0.25, 2600], [0.5, 1500]], q: 1.5, gain: 0.05, a: 0.2, minor: true });

      // ---- beat 5: light sweep to the white stage, tagline, resolve
      air(12.75, 0.3, 0.6);
      k.noise(T.sweep[0], { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 380], [0.25, 3000], [0.5, 900]], q: 0.8, gain: 0.26, a: 0.22, pan: -0.4, verb: 0.3 });
      k.noise(T.sweep[0] + 0.12, { dur: 0.4, color: 'pink', filter: 'bandpass', f: [[0, 600], [0.2, 2600], [0.4, 900]], q: 0.8, gain: 0.18, a: 0.15, pan: 0.5, verb: 0.3 });
      bwoom(T.sweep[0] + 0.25, 0.55, 1.2, 60);
      T.tag.forEach((t, i) => click(t, 0.7, (i - 2) * 0.15));
      chord(T.tag[4], ['D2', 'A2', 'D3', 'F#3', 'A3', 'E4'], 1.45, 1.0);   // the resolve under the tagline
      bwoom(T.tag[4], 0.6, 1.4, 55);
      click(14.5, 0.5);
    },
  });
}
