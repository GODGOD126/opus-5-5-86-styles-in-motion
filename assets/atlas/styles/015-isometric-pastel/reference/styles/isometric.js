{
  // ---------- isometric helpers ----------
  const C30 = Math.cos(Math.PI / 6);
  const makeIso = (ox, oy, s) => (x, y, z = 0) => [ox + (x - y) * C30 * s, oy + (x + y) * 0.5 * s - z * s];
  const SHADE_DARK = [92, 88, 150];
  const shade = (base, k = 1) => ({
    top: H.rgba(H.mix(base, '#ffffff', 0.42 * k)),
    left: H.rgba(H.mix(base, '#ffffff', 0.08)),
    right: H.rgba(H.mix(base, SHADE_DARK, 0.28 * k)),
    edge: H.rgba(H.mix(base, '#ffffff', 0.75), 0.9),
  });
  function poly(ctx, pts, fill) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  }
  function box(ctx, P, x, y, z, w, d, h, c, edges = true) {
    const px = P(x, y, 0)[1] - P(x, y, 1)[1], hp = h * px;   // pixels per unit, face height in px
    // ambient-occlusion contact strip where a box stands on the floor (faces drawn next cover its inner half)
    if (Math.abs(z) < 0.01 && hp > 6) {
      const a = P(x, y + d, 0), b = P(x + w, y + d, 0), e = P(x + w, y, 0);
      ctx.save(); ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
      for (const [lw, al] of [[Math.min(12, px * 0.3), 0.07], [Math.min(6, px * 0.15), 0.1], [Math.min(3, px * 0.07), 0.14]]) {
        ctx.strokeStyle = `rgba(60,50,110,${al})`; ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(e[0], e[1]); ctx.stroke();
      }
      ctx.restore();
    }
    poly(ctx, [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], c.right);
    poly(ctx, [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], c.left);
    // tonal falloff on the side faces: a touch lighter at the top edge, darker toward the floor
    if (hp > 10) {
      const t0 = P(x + w, y + d, z + h), b0 = P(x + w, y + d, z);
      const g = ctx.createLinearGradient(0, t0[1], 0, b0[1]);
      g.addColorStop(0, 'rgba(255,255,255,0.13)'); g.addColorStop(0.4, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(60,50,110,0.10)');
      ctx.beginPath();
      const f1 = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], f2 = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];
      for (const f of [f1, f2]) { ctx.moveTo(f[0][0], f[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(f[i][0], f[i][1]); ctx.closePath(); }
      ctx.fillStyle = g; ctx.fill();
    }
    poly(ctx, [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], c.top);
    if (edges) {
      ctx.strokeStyle = c.edge; ctx.lineWidth = 1; ctx.lineJoin = 'round';
      ctx.beginPath();
      const a = P(x, y + d, z + h), b = P(x + w, y + d, z + h), e = P(x + w, y, z + h), f = P(x + w, y + d, z);
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(e[0], e[1]);
      ctx.moveTo(b[0], b[1]); ctx.lineTo(f[0], f[1]);
      ctx.stroke();
    }
  }
  // convex hull (monotone chain) of 2D world points
  function hull(pts) {
    pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  function cylinder(ctx, P, s, cx, cy, z, r, h, base) {
    const b = P(cx, cy, z), tp = P(cx, cy, z + h);
    const rx = 1.2247 * r * s, ry = 0.7071 * r * s;
    const g = ctx.createLinearGradient(b[0] - rx, 0, b[0] + rx, 0);
    g.addColorStop(0, H.rgba(H.mix(base, '#ffffff', 0.15)));
    g.addColorStop(0.35, H.rgba(H.mix(base, '#ffffff', 0.3)));
    g.addColorStop(0.55, H.rgba(base));
    g.addColorStop(1, H.rgba(H.mix(base, SHADE_DARK, 0.32)));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(b[0], b[1], rx, ry, 0, 0, Math.PI); ctx.lineTo(tp[0] - rx, tp[1]);
    ctx.ellipse(tp[0], tp[1], rx, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
    ctx.fillStyle = H.rgba(H.mix(base, '#ffffff', 0.5));
    ctx.beginPath(); ctx.ellipse(tp[0], tp[1], rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    return { b, tp, rx, ry };
  }

  // ================= EXPLAINER: "How does AI learn?" as one long isometric factory the camera travels along =================
  function petFace(c, kind, x, y, r, col, ink) {
    c.save(); c.translate(x, y);
    c.fillStyle = col;
    if (kind === 'cat') {
      for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 0.85 * r, -0.2 * r); c.lineTo(sx * 0.62 * r, -1.15 * r); c.lineTo(sx * 0.12 * r, -0.78 * r); c.closePath(); c.fill(); }
    } else {
      c.fillStyle = H.rgba(H.mix(col, ink, 0.35));
      for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 0.88 * r, 0.05 * r, 0.32 * r, 0.62 * r, sx * 0.35, 0, 7); c.fill(); }
      c.fillStyle = col;
    }
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
    c.fillStyle = ink;
    for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 0.36 * r, -0.12 * r, r * 0.12, 0, 7); c.fill(); }
    if (kind === 'cat') {
      c.beginPath(); c.moveTo(-0.1 * r, 0.18 * r); c.lineTo(0.1 * r, 0.18 * r); c.lineTo(0, 0.3 * r); c.closePath(); c.fill();
      c.strokeStyle = ink; c.lineWidth = Math.max(0.6, r * 0.05);
      c.beginPath(); for (const sx of [-1, 1]) for (const dy of [0.22, 0.36]) { c.moveTo(sx * 0.3 * r, dy * r); c.lineTo(sx * 0.85 * r, (dy - 0.06) * r); } c.stroke();
    } else {
      c.beginPath(); c.ellipse(0, 0.32 * r, 0.2 * r, 0.14 * r, 0, 0, 7); c.fill();
    }
    c.restore();
  }
  const wallX = (ctx, p) => ctx.transform(C30, 0.5, 0, 1, p[0], p[1]);        // plane facing +y (lower-left), px units
  const floorX = (ctx, p) => ctx.transform(C30, 0.5, -C30, 0.5, p[0], p[1]);  // floor plane, px units
  function tag(ctx, x, y, text, o = {}) {
    ctx.save();
    ctx.font = o.font || '600 13px "Inter"';
    const fsz = parseInt((ctx.font.match(/(\d+)px/) || [0, 14])[1]);
    const w = ctx.measureText(text).width + (o.icon ? fsz * 2.4 : fsz * 1.4), h = o.h || Math.round(fsz * 1.75);
    const k = o.k ?? 1;
    ctx.translate(x, y); ctx.scale(k, k);
    ctx.shadowColor = 'rgba(80,70,140,0.2)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
    ctx.fillStyle = o.bg || '#ffffff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
    ctx.shadowColor = 'transparent';
    if (o.icon) { ctx.fillStyle = o.iconCol || '#ff6b5b'; ctx.beginPath(); ctx.arc(-w / 2 + fsz * 0.9, 0, fsz * 0.3, 0, 7); ctx.fill(); }
    ctx.fillStyle = o.col || '#2d3058'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, o.icon ? fsz * 0.5 : 0, 1);
    ctx.restore();
  }
  function numberTag(ctx, x, y, num, label, o = {}) {
    const k = o.k ?? 1; if (k <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.font = '800 66px "Inter"'; const nw = ctx.measureText(num).width;
    ctx.font = '600 24px "Inter"'; const lw = ctx.measureText(label).width;
    const w = Math.max(nw, lw) + 56, h = 118;
    ctx.shadowColor = 'rgba(80,70,140,0.25)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 6;
    ctx.fillStyle = o.bg || '#ffffff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = o.sub || '#7b7aa3'; ctx.fillText(label, 0, -h / 2 + 34);
    ctx.font = '800 66px "Inter"'; ctx.fillStyle = o.col || '#2d3058'; ctx.fillText(num, 0, h / 2 - 18);
    ctx.restore();
  }
  function arrow(ctx, pts, prog, col, dash, w = 2) {
    // pts: quadratic [a, ctrl, b] in screen space, drawn on up to prog
    if (prog <= 0) return;
    const [a, c, b] = pts;
    const q = (u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); const n = 30; for (let i = 1; i <= n; i++) { const p = q(prog * i / n); ctx.lineTo(p[0], p[1]); } ctx.stroke();
    ctx.setLineDash([]);
    const e = q(prog), e0 = q(Math.max(0, prog - 0.04)), ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
    ctx.fillStyle = col; ctx.translate(e[0], e[1]); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-7, -5.5); ctx.lineTo(-7, 5.5); ctx.closePath(); ctx.fill();
    ctx.restore();
    return q;
  }
  function isoExplainer(ctx, W, H_, t) {
    const ph = (a, b) => H.clamp((t - a) / (b - a));
    const E = (a, b) => H.ease.inOut(ph(a, b));
    const EO = (a, b) => H.ease.out(ph(a, b));
    const ACC = '#ff6b5b', MINT = '#3ccf9a', INK = '#2d3058';
    // ---------- camera keyframes: [t, fx, fy, scale] ----------
    const KF = [[0, 11, 4, 0.5, 24], [1.6, 11, 4, 0.5, 26], [2.8, 4.6, 3.4, 2.0, 46], [5.9, 5.6, 3.6, 1.9, 46], [6.9, 15.3, 5.0, 1.8, 54], [10.3, 15.3, 5.0, 1.8, 54], [11.1, 22.9, 3.6, 2.9, 68], [12.9, 22.9, 3.6, 2.9, 68], [13.8, 13, 4, 0.8, 27], [20, 13, 4, 0.8, 27]];
    let k = 0; while (k < KF.length - 2 && t > KF[k + 1][0]) k++;
    const [t0, fx0, fy0, fz0, s0] = KF[k], [t1, fx1, fy1, fz1, s1] = KF[k + 1];
    const u = H.ease.inOut(H.clamp((t - t0) / (t1 - t0)));
    const fx = H.lerp(fx0, fx1, u), fy = H.lerp(fy0, fy1, u), fz = H.lerp(fz0, fz1, u), s = H.lerp(s0, s1, u);
    const bob = Math.sin(t * 1.2) * 3;
    const P = (x, y, z = 0) => [640 + ((x - fx) - (y - fy)) * C30 * s, 390 + bob + ((x - fx) + (y - fy)) * 0.5 * s - (z - fz) * s];
    const LX = 26, LY = 8, TH = 0.9;

    // ---------- background ----------
    const bg = ctx.createLinearGradient(0, 0, W, H_);
    bg.addColorStop(0, '#f6efe8'); bg.addColorStop(0.55, '#efeaf4'); bg.addColorStop(1, '#e4e3f3');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
    ctx.fillStyle = 'rgba(120,110,170,0.10)';
    for (let y = 18; y < H_; y += 28) for (let x = 18 + ((y / 28) % 2) * 14; x < W; x += 28) ctx.fillRect(x, y, 2, 2);
    { const glow = ctx.createRadialGradient(660, 380, 40, 660, 380, 620); glow.addColorStop(0, 'rgba(255,255,255,0.7)'); glow.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H_); }
    // long soft shadow of the slab
    {
      const L = H.layer(W, H_), lc = L.getContext('2d');
      lc.filter = `blur(${Math.round(s * 0.5)}px)`;
      const G = (x, y) => { const p = P(x + 2.2, y, -TH); return [p[0], p[1] + s * 3.2]; };
      poly(lc, [G(0, 0), G(LX, 0), G(LX, LY), G(0, LY)], 'rgb(90,80,150)');
      ctx.globalAlpha = 0.14; ctx.drawImage(L, 0, 0); ctx.globalAlpha = 1;
    }
    // slab
    box(ctx, P, 0.3, 0.3, -TH - 0.6, LX - 0.6, LY - 0.6, 0.6, shade('#b9addf'), false);
    box(ctx, P, 0, 0, -TH, LX, LY, TH, shade('#cfc6ea'), false);
    poly(ctx, [P(0, 0), P(LX, 0), P(LX, LY), P(0, LY)], '#fbf8f3');
    ctx.strokeStyle = 'rgba(170,160,205,0.2)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 1; i < LX; i++) { const a = P(i, 0), b = P(i, LY); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    for (let i = 1; i < LY; i++) { const a = P(0, i), b = P(LX, i); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    ctx.stroke();
    // zone tints + painted floor labels
    poly(ctx, [P(0.3, 0.3), P(9.6, 0.3), P(9.6, 3.6), P(0.3, 3.6)], 'rgba(255,214,196,0.35)');
    poly(ctx, [P(19.2, 0.6), P(25.7, 0.6), P(25.7, 6.6), P(19.2, 6.6)], 'rgba(205,240,224,0.45)');
    const floorText = (x, y, str, a = 1, size = 22) => { const o = P(x, y); ctx.save(); floorX(ctx, o); ctx.scale(s / 35, s / 35); ctx.globalAlpha = a; ctx.font = `800 ${size}px "Inter"`; ctx.fillStyle = 'rgba(150,140,200,0.55)'; ctx.fillText(str, 0, 0); ctx.restore(); };
    floorText(0.9, 7.6, 'TRAINING DATA', 1, 20);
    floorText(19.6, 7.4, 'TRAINING ROUNDS →', EO(10.6, 11.4), 20);
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); { const a = P(0, LY), b = P(LX, LY), c = P(LX, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); } ctx.stroke();

    // ---------- scene objects (painter-sorted) ----------
    const objs = [], shadows = [];
    const add = (key, fn) => objs.push({ key, fn });
    const R = H.rng(31);
    // data stacks at the back: grow while the counter runs
    const cnt = Math.floor(1e6 * Math.pow(EO(2.8, 5.7), 1.6));
    const grow = 0.25 + 2.2 * Math.pow(EO(2.6, 5.8), 1.2);
    [[1.0, 1.0], [3.2, 1.0], [5.4, 1.0], [7.6, 1.0]].forEach(([x, y], i) => {
      const h = Math.max(0.15, grow * (0.8 + 0.25 * Math.sin(i * 2.3)));
      shadows.push([x, y, 1.3, 1.6, h]);
      add(x + 0.65 + y + 0.8, () => {
        const n = Math.max(1, Math.round(h / 0.16));
        for (let j = 0; j < n; j++) box(ctx, P, x + Math.sin(j * 1.7 + i) * 0.04, y, j * 0.16, 1.3, 1.6, 0.14, shade(j % 2 ? '#ffffff' : (i % 2 ? '#ffd9cf' : '#dbe3f6')), false);
        // top card shows a pet face in the floor plane
        const o = P(x + 0.65, y + 0.8, n * 0.16);
        ctx.save(); floorX(ctx, o); ctx.scale(s / 40, s / 40); petFace(ctx, i % 2 ? 'dog' : 'cat', 0, 0, 13, i % 2 ? '#f2c39a' : '#c8cde6', INK); ctx.restore();
      });
    });
    // billboard counter over the data zone
    add(4.4 + 0.4, () => {
      for (const x of [1.4, 7.6]) box(ctx, P, x, 0.35, 0, 0.18, 0.18, 3.0, shade('#d8d4ea'), false);
      box(ctx, P, 1.0, 0.25, 3.0, 7.2, 0.25, 1.15, shade('#ffffff'));
      const o = P(1.0, 0.5, 4.15);
      ctx.save(); wallX(ctx, o); ctx.scale(s / 40, s / 40);
      ctx.font = '800 32px "Inter"'; ctx.fillStyle = INK; ctx.fillText('DATASET', 60, 36);
      ctx.restore();
    });
    // conveyor belt (segmented for correct depth)
    for (let i = 0; i < 10; i++) {
      add(i + 0.5 + 5.5, () => {
        box(ctx, P, i, 5.0, 0, 1, 1.0, 0.4, shade('#8e97c9'), false);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
        const off = ((t * 2.2) % 0.5);
        for (let k2 = 0; k2 < 2; k2++) { const xx = i + k2 * 0.5 + off; if (xx > i + 1) continue; const a = P(xx, 5.0, 0.4), b = P(xx, 6.0, 0.4); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      });
    }
    // example cards riding the belt (beat 2) + the single test card (beat 3)
    const cards = [];
    if (t > 2.4 && t < 6.6) {
      for (let j = 0; j < 9; j++) {
        const x = (t - 2.4) * 2.6 - j * 2.6 + 0.3;
        if (x < 0.2 || x > 9.4) continue;
        cards.push({ x, kind: (j * 7 + 3) % 3 === 0 ? 'dog' : ((j * 5) % 2 ? 'cat' : 'dog'), lab: true });
      }
    }
    if (t > 5.9 && t < 7.4) cards.push({ x: H.lerp(0.4, 9.6, E(5.9, 7.3)), kind: 'cat', test: true });
    for (const cd of cards) {
      add(cd.x + 0.5 + 5.5 + 0.6, () => {
        const y = 5.45;
        box(ctx, P, cd.x, y, 0.4, 1.0, 0.1, 1.0, shade(cd.test ? '#ffd9cf' : '#ffffff'), false);
        const o = P(cd.x + 0.5, y + 0.1, 0.9);
        ctx.save(); wallX(ctx, o); ctx.scale(s / 40, s / 40);
        petFace(ctx, cd.kind, 0, 0, 12, cd.kind === 'cat' ? '#b9c2ea' : '#f2c39a', INK);
        ctx.restore();
      });
    }
    // the model: a machine with a glass-top neural net and three tuning dials
    const adj = E(8.6, 9.3);
    const nodes = [];
    for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) nodes.push([10.8 + c * 1.2, 3.9 + r * 1.25, c]);
    shadows.push([10, 3.2, 4, 3.8, 2.6]);
    add(12 + 5.1, () => {
      box(ctx, P, 10, 3.2, 0, 4, 3.8, 2.6, shade('#aab6e8'));
      // intake slot on the front
      poly(ctx, [P(10.25, 7, 0.45), P(10.95, 7, 0.45), P(10.95, 7, 1.5), P(10.25, 7, 1.5)], '#4a5488');
      // dials on the +y face
      const err = ph(7.4, 8.6) * (1 - ph(9.3, 9.8));
      for (let d = 0; d < 3; d++) {
        const o = P(11.6 + d * 0.85, 7, 1.15);
        ctx.save(); wallX(ctx, o); ctx.scale(s / 40, s / 40);
        ctx.fillStyle = '#eef1fa'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fill();
        ctx.strokeStyle = err > 0 ? H.rgba(ACC, 0.4 + 0.6 * err) : '#8e9bd0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.stroke();
        const ang = -0.9 + d * 0.7 + adj * (d === 1 ? -1.6 : 1.1) + Math.sin(t * 9) * 0.15 * (adj > 0 && adj < 1 ? 1 : 0);
        ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * 10, Math.sin(ang) * 10); ctx.stroke();
        ctx.restore();
      }
      // net on top (glass panel)
      poly(ctx, [P(10.3, 3.5, 2.61), P(13.7, 3.5, 2.61), P(13.7, 6.7, 2.61), P(10.3, 6.7, 2.61)], 'rgba(230,236,255,0.9)');
      const wts = (i, j) => { const a = Math.abs(Math.sin(i * 3.1 + j * 1.7)), b = Math.abs(Math.cos(i * 2.3 + j * 0.9)); return H.lerp(a, b, adj); };
      const pulse = ph(6.9, 7.4) * (1 - ph(7.4, 7.6)) + ph(9.3, 9.6) * (1 - ph(9.6, 9.9));
      for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
        if (nodes[j][2] !== nodes[i][2] + 1) continue;
        const a = P(nodes[i][0], nodes[i][1], 2.62), b = P(nodes[j][0], nodes[j][1], 2.62);
        const w = wts(i, j), errCol = H.mix([142, 155, 208], H.hex(ACC), ph(8.0, 8.6) * (1 - ph(9.0, 9.4)));
        ctx.strokeStyle = H.rgba(errCol, 0.35 + 0.6 * w); ctx.lineWidth = 0.6 + 2.6 * w * (s / 40);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      for (const [x, y, c] of nodes) {
        const p = P(x, y, 2.62), rr = 0.17 * s;
        const lit = pulse > 0 ? Math.max(0, Math.sin((t * 6) - c * 1.2)) * pulse : 0;
        ctx.fillStyle = H.rgba(H.mix('#7d8fd6', '#ffe28a', lit)); ctx.beginPath(); ctx.ellipse(p[0], p[1], rr, rr * 0.7, 0, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(p[0] - rr * 0.3, p[1] - rr * 0.25, rr * 0.35, rr * 0.22, 0, 0, 7); ctx.fill();
      }
    });
    // output monitor
    const shake = (t > 7.4 && t < 7.8) ? Math.sin(t * 90) * 0.06 : 0;
    shadows.push([15.3, 4.4, 3.2, 0.6, 3.2]);
    add(16.9 + 4.8, () => {
      box(ctx, P, 16.6, 4.5, 0, 0.4, 0.4, 1.0, shade('#d8d4ea'), false);
      box(ctx, P, 15.2 + shake, 4.4, 1.0, 3.4, 0.5, 2.3, shade('#4a5488'));
      const sx0 = 15.4 + shake, sx1 = 18.4 + shake;
      const wrong = t > 7.05 && t < 9.4, right = t >= 9.4;
      const scr = wrong && t > 7.4 ? '#ffe3df' : right ? '#dcf7ec' : '#eef1fa';
      poly(ctx, [P(sx0, 4.9, 1.2), P(sx1, 4.9, 1.2), P(sx1, 4.9, 3.1), P(sx0, 4.9, 3.1)], scr);
      { // glass: inner shade along the bezel + a diagonal sheen band
        const a0 = P(sx0, 4.9, 3.1), a1 = P(sx1, 4.9, 1.2);
        const ig = ctx.createLinearGradient(0, a0[1], 0, P(sx0, 4.9, 1.2)[1]); ig.addColorStop(0, 'rgba(60,50,110,0.10)'); ig.addColorStop(0.18, 'rgba(60,50,110,0)'); ig.addColorStop(1, 'rgba(255,255,255,0.12)');
        poly(ctx, [P(sx0, 4.9, 1.2), P(sx1, 4.9, 1.2), P(sx1, 4.9, 3.1), P(sx0, 4.9, 3.1)], ig);
        const sg = ctx.createLinearGradient(a0[0], a0[1], a1[0], a1[1]);
        sg.addColorStop(0.32, 'rgba(255,255,255,0)'); sg.addColorStop(0.4, 'rgba(255,255,255,0.32)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.08)'); sg.addColorStop(0.56, 'rgba(255,255,255,0)');
        poly(ctx, [P(sx0, 4.9, 1.2), P(sx1, 4.9, 1.2), P(sx1, 4.9, 3.1), P(sx0, 4.9, 3.1)], sg);
      }
      const o = P(sx0, 4.9, 3.1);
      ctx.save(); wallX(ctx, o); ctx.scale(s / 40, s / 40);
      const SW = 3 * 40, SH = 1.9 * 40;
      if (t > 6.9 && t < 7.05) { ctx.fillStyle = '#9aa6d6'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(SW / 2 - 14 + i * 14, SH / 2, 4, 0, 7); ctx.fill(); } }
      if (wrong || right) {
        petFace(ctx, right ? 'cat' : 'dog', 26, SH / 2, 15, right ? '#b9c2ea' : '#f2c39a', INK);
        ctx.font = '800 30px "Inter"'; ctx.fillStyle = INK; ctx.fillText(right ? 'cat' : 'dog?', 46, SH / 2 + 11);
      }
      ctx.restore();
    });
    // accuracy chart: one bar per training round
    const ACCS = [61, 72, 80, 86, 90, 93, 95, 97];
    const roundT = (i) => 10.9 + i * 0.22;
    ACCS.forEach((a, i) => {
      const x = 19.7 + i * 0.72, y = 3.4, hh = (a - 50) / 50 * 4.4 * EO(roundT(i), roundT(i) + 0.35);
      if (hh <= 0.01) return;
      shadows.push([x, y, 0.5, 0.6, hh]);
      add(x + 0.25 + y + 0.3, () => box(ctx, P, x, y, 0, 0.5, 0.6, hh, shade(i === 7 ? '#ff8a7a' : H.mix('#aab6e8', '#8fd9bd', i / 7))));
    });
    add(19.4 + 2, () => box(ctx, P, 19.4, 2.9, 0, 6.2, 0.3, 0.2, shade('#d8d4ea'), false));
    // decorative trees
    for (const [tx, ty] of [[0.7, 7.3], [25.3, 0.8], [25.2, 7.2], [9.3, 0.7]]) {
      shadows.push([tx - 0.3, ty - 0.3, 0.6, 0.6, 1.8]);
      add(tx + ty, () => {
        const b = P(tx, ty), top = P(tx, ty, 1.4); const rr = 0.6 * s;
        ctx.strokeStyle = '#b79a8a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(top[0], top[1] + 4); ctx.stroke();
        ctx.fillStyle = '#7fc8a8'; ctx.beginPath(); ctx.arc(top[0], top[1] - rr * 0.3, rr, 0, 7); ctx.fill();
        ctx.fillStyle = '#a3dcc0'; ctx.beginPath(); ctx.arc(top[0] - rr * 0.22, top[1] - rr * 0.5, rr * 0.72, 0, 7); ctx.fill();
      });
    }
    // shadows (one layer)
    {
      const L = H.layer(W, H_), lc = L.getContext('2d');
      for (const [x, y, w, d, h] of shadows) {
        const base = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
        poly(lc, hull(base.concat(base.map(p => [p[0] + 1.1 * h, p[1] + 0.12 * h]))).map(p => P(p[0], p[1])), '#000');
      }
      lc.globalCompositeOperation = 'destination-in'; poly(lc, [P(0, 0), P(LX, 0), P(LX, LY), P(0, LY)], '#000');
      lc.globalCompositeOperation = 'source-in'; lc.fillStyle = 'rgb(110,96,170)'; lc.fillRect(0, 0, W, H_);
      ctx.globalAlpha = 0.16; ctx.drawImage(L, 0, 0); ctx.globalAlpha = 1;
    }
    objs.sort((a, b) => a.key - b.key);
    for (const o of objs) { ctx.save(); o.fn(); ctx.restore(); }

    // ---------- screen-space annotation layer: tags that land on things, connectors ----------
    // beat 2: label tags riding on each card
    for (const cd of cards) {
      if (cd.test) {
        const p = P(cd.x + 0.5, 5.5, 1.75);
        tag(ctx, p[0], p[1] - 14, '?', { k: EO(5.9, 6.2), font: '800 26px "Inter"', bg: ACC, col: '#fff' });
        continue;
      }
      const p = P(cd.x + 0.5, 5.5, 1.75);
      const k = EO(2.4 + 0.0, 2.8) * H.clamp((cd.x - 0.2) * 3) * H.clamp((9.4 - cd.x) * 3);
      if (k > 0.05) tag(ctx, p[0], p[1] - 16, cd.kind, { k, font: '700 24px "Inter"', icon: true, iconCol: cd.kind === 'cat' ? '#7f8fd8' : '#f2a46b' });
    }
    if (t > 2.6 && t < 6.4) { const b = P(4.6, 0.4, 4.4); numberTag(ctx, b[0], b[1] - 70, cnt.toLocaleString('en-US'), 'examples', { k: H.ease.back(ph(2.6, 2.95)) * (1 - E(6.0, 6.4)) }); }
    // flow arrow: data -> model
    {
      const a = P(1.2, 6.6, 2.2), b = P(10.2, 6.6, 2.0);
      arrow(ctx, [a, [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 0.9 * s], b], E(3.0, 3.9) * (1 - ph(6.2, 6.5)), 'rgba(74,84,136,0.75)', [6, 6], 2);
      if (t > 3.6 && t < 6.4) { const m = P(9.3, 7.0, 3.2); tag(ctx, m[0], m[1] - 0.6 * s, 'into the model', { k: EO(3.6, 3.9), font: '700 24px "Inter"', bg: '#4a5488', col: '#fff' }); }
    }
    // beat 3 loop: Guess -> Check -> Adjust
    if (t > 6.6 && t < 10.6) {
      const fade = 1 - ph(10.3, 10.6);
      ctx.save(); ctx.globalAlpha = fade;
      const mTop = P(12.6, 5.6, 2.75), scrL = P(15.4, 4.9, 2.7), scrTop = P(16.9, 4.7, 3.4), mBack = P(12.4, 5.2, 2.9);
      // Guess
      arrow(ctx, [mTop, [(mTop[0] + scrL[0]) / 2, Math.min(mTop[1], scrL[1]) - 1.4 * s], scrL], E(6.8, 7.15), INK, null, 2.5);
      if (t > 6.85) { const g = [(mTop[0] + scrL[0]) / 2, Math.min(mTop[1], scrL[1]) - 0.75 * s]; tag(ctx, g[0], g[1] - 14, '1  Guess', { k: H.ease.back(ph(6.85, 7.15)), font: '800 26px "Inter"' }); }
      // Check: emphasis ring on the wrong answer
      if (t > 7.4) {
        tag(ctx, scrTop[0] + 0.4 * s, scrTop[1] - 0.6 * s, '2  Check', { k: H.ease.back(ph(7.45, 7.75)), font: '800 26px "Inter"' });
        if (t < 9.4) {
          const c = P(16.9, 4.9, 2.15), pr = EO(7.45, 7.9);
          ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.globalAlpha = fade * (0.6 + 0.4 * Math.sin(t * 10));
          ctx.beginPath(); ctx.ellipse(c[0], c[1], 1.95 * s * (1.4 - 0.4 * pr), 1.25 * s * (1.4 - 0.4 * pr), -0.05, 0, Math.PI * 2 * pr); ctx.stroke(); ctx.restore();
          if (t < 7.6) { ctx.fillStyle = `rgba(255,107,91,${0.25 * (1 - ph(7.4, 7.6))})`; ctx.fillRect(0, 0, W, H_); }
        }
      }
      // Adjust: error signal travels back
      if (t > 8.0) {
        const q = arrow(ctx, [scrTop, [(scrTop[0] + mBack[0]) / 2, scrTop[1] - 2.2 * s], mBack], E(8.0, 8.6), ACC, [7, 5], 2.5);
        if (q && t < 8.9) { const p2 = q(E(8.0, 8.6)); ctx.fillStyle = 'rgba(255,107,91,0.3)'; ctx.beginPath(); ctx.arc(p2[0], p2[1], 10, 0, 7); ctx.fill(); }
        const dl = P(12.45, 7.0, 0.4);
        tag(ctx, dl[0], dl[1] + 0.55 * s, '3  Adjust', { k: H.ease.back(ph(8.5, 8.8)), font: '800 26px "Inter"', bg: ACC, col: '#fff' });
        const lt = P(14.0, 3.2, 4.4);
        tag(ctx, lt[0], lt[1], 'error!', { k: H.ease.back(ph(8.1, 8.35)) * (1 - ph(9.2, 9.4)), font: '700 22px "Inter"', bg: '#ffe3df', col: ACC });
      }
      // truth label under the screen + verdict badge stamped on the screen corner
      if (t > 7.5 && t < 9.4) { const c = P(16.9, 4.9, 0.85); tag(ctx, c[0], c[1] + 16, "answer: cat", { k: H.ease.back(ph(7.6, 7.9)), font: '700 26px "Inter"', bg: INK, col: '#fff' }); }
      if (t > 7.4) {
        const right = t >= 9.4, b = P(18.5 + shake, 4.9, 3.25);
        const kk = right ? H.ease.back(ph(9.45, 9.75)) : H.ease.back(ph(7.4, 7.65));
        ctx.save(); ctx.translate(b[0], b[1]); ctx.scale(kk, kk);
        ctx.fillStyle = right ? MINT : ACC; ctx.beginPath(); ctx.arc(0, 0, 19, 0, 7); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
        if (right) { ctx.moveTo(-8, 0); ctx.lineTo(-2, 7); ctx.lineTo(9, -7); } else { ctx.moveTo(-7, -7); ctx.lineTo(7, 7); ctx.moveTo(7, -7); ctx.lineTo(-7, 7); }
        ctx.stroke(); ctx.restore();
      }
      if (t > 9.4) { const c = P(16.9, 4.7, 3.4); tag(ctx, c[0] + 0.4 * s, c[1] - 0.6 * s, 'Guess again ✓', { k: H.ease.back(ph(9.45, 9.75)), font: '800 26px "Inter"', bg: MINT, col: '#fff' }); }
      ctx.restore();
    }
    // beat 4: counting accuracy tag that rides the newest bar
    if (t > 10.8) {
      const i = Math.min(7, Math.max(0, Math.floor((t - 10.9) / 0.22)));
      const cur = Math.round(H.lerp(61, 97, H.ease.inOut(ph(10.9, 12.6))));
      const x = 19.7 + i * 0.72 + 0.25, hh = (ACCS[i] - 50) / 50 * 4.4;
      const p = P(x, 3.7, hh + 0.2);
      const pop = t > 12.6 ? 1 + 0.18 * Math.sin(Math.min(1, (t - 12.6) / 0.35) * Math.PI) : 1;
      ctx.strokeStyle = 'rgba(74,84,136,0.6)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], p[1] - 42); ctx.stroke();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(p[0], p[1], 3.5, 0, 7); ctx.fill();
      numberTag(ctx, p[0], p[1] - 100, `${cur}%`, 'Accuracy', { k: H.ease.back(ph(10.85, 11.15)) * pop, bg: cur >= 97 ? ACC : '#ffffff', col: cur >= 97 ? '#fff' : INK, sub: cur >= 97 ? 'rgba(255,255,255,0.85)' : '#7b7aa3' });
      if (t > 12.6) { // sparkle emphasis
        ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 2; ctx.globalAlpha = 1 - ph(12.6, 13.2);
        const rr2 = 80 + 60 * EO(12.6, 13.2); ctx.beginPath(); ctx.arc(p[0], p[1] - 100, rr2, 0, 7); ctx.stroke(); ctx.restore();
      }
      const p0 = P(19.95, 3.7, (61 - 50) / 50 * 4.4 + 0.15);
      if (t < 13.4 && t > 11.0) tag(ctx, p0[0] - 40, p0[1] - 68, 'round 1: 61%', { k: EO(10.9, 11.2) * (1 - ph(13.0, 13.4)), font: '700 22px "Inter"', col: '#7b7aa3' });
    }

    // ---------- hook: big question that shrinks into the corner header ----------
    {
      const sh = E(1.5, 2.4);
      const a = EO(0.15, 0.7);
      const size = H.lerp(66, 30, sh);
      ctx.save(); ctx.globalAlpha = a;
      if (sh < 1) { ctx.fillStyle = `rgba(251,248,243,${0.7 * (1 - sh)})`; ctx.fillRect(0, 0, W, H_); }
      ctx.font = `800 ${size}px "Inter"`; ctx.fillStyle = INK;
      const w = ctx.measureText('How does AI learn?').width;
      const x = H.lerp(640 - w / 2, 48, sh), y = H.lerp(330, 62, sh) + (1 - a) * 20;
      if (sh > 0) { ctx.save(); ctx.globalAlpha = a * sh; ctx.shadowColor = 'rgba(80,70,140,0.18)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(x - 18, y - size * 1.6, w + 36, size * 2.1, 14); ctx.fill(); ctx.restore(); ctx.fillStyle = INK; }
      ctx.fillText('How does AI learn?', x, y);
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.roundRect(x + 2, y - size * 1.32, H.lerp(40, 22, sh), H.lerp(7, 4, sh), 3); ctx.fill();
      ctx.restore();
    }
    // ---------- takeaway ----------
    if (t > 13.0) {
      const k2 = H.ease.back(ph(13.0, 13.5));
      ctx.save(); ctx.translate(640, 640 + (1 - EO(13.0, 13.4)) * 40); ctx.scale(k2, k2);
      ctx.font = '800 44px "Inter"';
      const str = 'More examples → better guesses', w = ctx.measureText(str).width + 80;
      ctx.shadowColor = 'rgba(80,70,140,0.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-w / 2, -44, w, 88, 44); ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(-w / 2 + 30, 0, 7, 0, 7); ctx.fill();
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, 12, 1);
      ctx.restore();
    }
  }

  // ---------- sound: a tidy toy factory (wooden-block pops, a soft belt motor, gentle camera glides) ----------
  function isoSound(k) {
    const D = 14.5;
    const ph = (t, a, b) => H.clamp((t - a) / (b - a));
    const inv = (u) => (u < 0.5 ? Math.cbrt(u / 4) : 1 - Math.cbrt((1 - u) * 2) / 2); // inverse of H.ease.inOut
    // camera keyframes copied from isoExplainer (KF), used to pan sounds to where their object sits on screen
    const KF = [[0, 11, 4, 0.5, 24], [1.6, 11, 4, 0.5, 26], [2.8, 4.6, 3.4, 2.0, 46], [5.9, 5.6, 3.6, 1.9, 46], [6.9, 15.3, 5.0, 1.8, 54], [10.3, 15.3, 5.0, 1.8, 54], [11.1, 22.9, 3.6, 2.9, 68], [12.9, 22.9, 3.6, 2.9, 68], [13.8, 13, 4, 0.8, 27], [20, 13, 4, 0.8, 27]];
    const pan = (x, y, t) => {
      let i = 0; while (i < KF.length - 2 && t > KF[i + 1][0]) i++;
      const [t0, fx0, fy0, , s0] = KF[i], [t1, fx1, fy1, , s1] = KF[i + 1], u = H.ease.inOut(H.clamp((t - t0) / (t1 - t0)));
      const sx = 640 + ((x - H.lerp(fx0, fx1, u)) - (y - H.lerp(fy0, fy1, u))) * C30 * H.lerp(s0, s1, u);
      return H.clamp(sx / 640 - 1, -1, 1) * 0.6;
    };
    // toy pop: a little lacquered-wood block snapping into place (body tock + soft pop), never squeaky
    const toy = (t, f, g, p, minor) => { const o = { pan: p, minor }; k.play('pop', t, { ...o, f, gain: 0.8 * g }); k.play('tock', t + 0.004, { ...o, f: f * 0.9, gain: 0.35 * g }); };
    // camera glide: a low, smooth air movement that swells with the eased camera speed (no swoosh)
    const glide = (t0, t1, g = 1) => { const d = t1 - t0; k.noise(t0, { dur: d + 0.15, color: 'pink', filter: 'bandpass', f: [[0, 220], [d * 0.5, 520], [d, 240]], q: 0.7, gain: 0.045 * g, a: d * 0.5, verb: 0.1 }); };
    // counter ticks: one per visible change, at most ~12/s, spaced by how fast the value is moving
    const counter = (a, b, val, f, g, p, minGap = 1 / 12, avoid = []) => {
      let last = -1, lastV = val(a);
      for (let t = a; t <= b + 1e-6; t += 1 / 120) {
        const v = val(t); if (v === lastV) continue;
        const speed = Math.abs(val(Math.min(b, t + 0.05)) - val(Math.max(a, t - 0.05)));
        const top = Math.abs(val(b) - val(a)) * 0.1 / (b - a) * 2.2; // roughly the peak change per 0.1 s
        const gap = H.clamp(minGap / Math.max(0.2, Math.min(1, speed / top)), minGap, 0.4);
        if (t - last >= gap && !avoid.some((x) => Math.abs(x - t) < 0.07)) { k.play('tick', t, { f, gain: g, pan: p, minor: true }); k.tone(t, { f: f / 8, dur: 0.03, gain: 0.05 * g, pan: p, minor: true }); last = t; }
        lastV = v;
      }
    };

    k.bed('room', 0, D, { gain: 0.25 });
    k.music('pad', 0, D, { bpm: 100, gain: 0.32, chords: [['C4', 'E4', 'G4', 'B4'], ['F3', 'A3', 'C4', 'E4'], ['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'B3', 'D4', 'F4'], ['C4', 'E4', 'G4', 'C5']] });

    // ---- hook: the question fades up (EO 0.15-0.7), then slides small into the corner header (1.5-2.4)
    toy(0.2, 520, 0.7, 0);
    k.noise(1.5, { dur: 0.9, color: 'pink', filter: 'lowpass', f: [[0, 700], [0.9, 300]], gain: 0.06, a: 0.35, minor: true });
    glide(1.6, 2.8); // camera dives onto the training-data shelves

    // ---- beat 2: data. belt motor + slat ticks while the cards ride, cards clack onto the belt once a second
    k.tone(2.4, { f: 72, type: 'sawtooth', dur: 4.3, gain: 0.025, a: 0.3, hold: 3.6, filter: 'lowpass', f2: 260, minor: true }); // belt motor
    for (let t = 2.4 + (0.5 - ((2.4 * 2.2) % 0.5)) / 2.2; t < 6.5; t += 0.5 / 2.2) if (t > 2.9 && (t - 2.36) % 1 > 0.1) k.play('tock', t, { f: 330, gain: 0.22, pan: pan(5, 5.5, t), minor: true }); // a belt slat passes
    for (let j = 0; j < 5; j++) { const t = Math.max(2.4, 2.4 + j - 0.1 / 2.6); if (t < 6.5) toy(t, 430, 0.55, pan(0.6, 5.5, t), true); } // card lands on the belt
    k.play('pop', 2.45, { f: 560, gain: 0.5, pan: pan(1, 5.5, 2.45), minor: true }); // cat/dog tags pop on
    toy(2.66, 600, 0.9, pan(4.6, 0.4, 2.66)); // examples counter pops up over the billboard
    counter(2.85, 5.66, (t) => Math.floor(1e6 * Math.pow(H.ease.out(ph(t, 2.8, 5.7)), 1.6)), 3400, 0.9, pan(4.6, 0.4, 4), 1 / 8);
    // dashed flow arrow draws (E 3.0-3.9): soft dabs, then the "into the model" tag
    for (let i = 1; i <= 5; i++) { const u = i / 5, t = 3.0 + 0.9 * inv(u); k.noise(t, { dur: 0.025, filter: 'bandpass', f: 1800, q: 1.4, gain: 0.12, a: 0.002, pan: pan(1.2 + 9 * u, 6.6, t), minor: true }); }
    toy(3.63, 470, 0.8, pan(9.3, 7, 3.63));
    // 1,000,000 lands (EO reaches 1 at 5.7)
    toy(5.7, 640, 1.1, pan(4.6, 0.4, 5.7));
    k.play('ding', 5.7, { f: 'G5', gain: 0.45, pan: pan(4.6, 0.4, 5.7) });

    // ---- beat 3: test card -> guess -> check -> adjust
    toy(5.93, 380, 0.9, pan(0.9, 5.5, 5.93)); // coral "?" on the test card
    glide(5.9, 6.9);
    k.play('tock', 7.3, { f: 300, gain: 0.35, pan: pan(10.25, 7, 7.3), minor: true }); // test card slides into the intake slot
    k.play('swish', 6.8, { dur: 0.32, gain: 0.25, pan: pan(14, 5, 6.95), minor: true }); // Guess arrow arcs over
    toy(6.9, 560, 0.85, pan(14, 5, 6.9)); // "1 Guess" tag
    k.tone(7.05, { f: 'E4', type: 'triangle', dur: 0.18, gain: 0.12, pan: pan(16.9, 4.9, 7.05) }); // "dog?" pops on the monitor
    // CHECK: wrong. red flash, monitor shakes, X badge stamps
    k.play('thud', 7.4, { f: 120, gain: 0.7, pan: pan(16.9, 4.9, 7.4) });
    k.play('error', 7.42, { f: 'A3', gain: 0.85, pan: pan(16.9, 4.9, 7.4) });
    toy(7.64, 440, 0.75, pan(16.9, 4.9, 7.64)); // "answer: cat"
    // ADJUST: error signal travels back along the dashed arc (E 8.0-8.6), then "error!" and "3 Adjust"
    k.tone(8.0, { f: [[0, 520], [0.6, 260]], type: 'triangle', dur: 0.6, gain: 0.06, a: 0.25, pan: pan(14.6, 5, 8.3), minor: true });
    k.noise(8.0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 900], [0.6, 500]], q: 1.2, gain: 0.07, a: 0.3, pan: pan(14.6, 5, 8.3), minor: true });
    toy(8.15, 680, 0.6, pan(14, 3.2, 8.15), true); // "error!"
    toy(8.55, 500, 0.85, pan(12.45, 7, 8.55)); // "3 Adjust"
    // dials turn (E 8.6-9.3, with a wobble): even ratchet clicks across the turn
    for (let i = 0; i < 5; i++) { k.play('click', 8.66 + i * 0.145, { f: 1100 + (i % 3) * 120, gain: 0.7, pan: pan(12.4, 7, 9), minor: true }); }
    // CORRECT: screen turns to cat (9.4), check badge + "Guess again" pop
    k.tone(9.4, { f: 'C5', type: 'triangle', dur: 0.15, gain: 0.1, pan: pan(16.9, 4.9, 9.4) });
    k.play('success', 9.46, { f: 'C5', gain: 0.8, pan: pan(18.3, 4.9, 9.46) });
    toy(9.48, 620, 0.7, pan(17.3, 4.7, 9.48), true);

    // ---- beat 4: the camera glides to the chart, bars pop up one round at a time (61 -> 97)
    glide(10.3, 11.1);
    ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'].forEach((n, i) => { const t = 10.9 + i * 0.22 + 0.03; k.tone(t, { f: [[0, k.hz(n)], [0.08, k.hz(n) * 0.75]], dur: 0.12, gain: 0.16, pan: pan(19.7 + i * 0.72, 3.4, t), minor: i < 7 }); k.play('tock', t, { f: k.hz(n) * 0.8, gain: 0.22, pan: pan(19.7 + i * 0.72, 3.4, t), minor: true }); });
    counter(10.92, 12.56, (t) => Math.round(H.lerp(61, 97, H.ease.inOut(ph(t, 10.9, 12.6)))), 2900, 0.7, pan(23, 3.7, 12), 1 / 12, [0, 1, 2, 3, 4, 5, 6, 7].map((i) => 10.93 + i * 0.22));
    // 97% (the biggest hit): coral flip, the tag swells, a ring expands
    k.play('impact', 12.6, { gain: 0.75, pan: pan(25, 3.7, 12.6) });
    ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => k.play('ding', 12.6 + i * 0.03, { f: n, gain: 0.42 - i * 0.05, pan: (i - 1.5) * 0.2 }));
    k.noise(12.62, { dur: 0.6, filter: 'bandpass', f: [[0, 1200], [0.6, 2400]], q: 2, gain: 0.04, a: 0.05, verb: 0.3, minor: true }); // ring shimmer
    glide(12.9, 13.8, 0.9); // pull back out to the whole floor
    // takeaway pill bounces in (back 13.0-13.5) and resolves
    toy(13.08, 470, 0.9, 0);
    ['G4', 'C5', 'E5'].forEach((n, i) => k.play('ding', 13.3 + i * 0.08, { f: n, gain: 0.35 - i * 0.06, pan: (i - 1) * 0.25 }));
    k.tone(13.3, { f: 'C3', type: 'triangle', dur: 1.2, gain: 0.12, a: 0.02 });
  }

  registerStyle({
    id: 'isometric',
    name: 'Isometric Pastel',
    category: 'Dimensional',
    description: 'Clean vector isometric illustration: true 30° projection, flat three-tone face shading, soft pastel palette with a single coral accent, tiny people for scale and long soft shadows on a floating tile.',
    motion: 'The floating tile rises into frame, buildings, tanks and racks pop up one by one on springy overshoot, then LEDs blink, fans spin, data cubes stream up and tiny workers stroll during a slow camera push.',
    duration: 5,
    fonts: ['800 46px "Inter"', '400 18px "Inter"', '600 13px "Inter"', '800 20px "Inter"'],
    frameT: 4.6,
    readsPixels: false,
    explainerDuration: 14.5,
    explainerNote: 'One long isometric factory floor (data shelves → conveyor → glass-top neural machine → monitor → bar chart) that the camera glides along beat to beat, with white label tags pinned to objects, curved dashed connectors, a counting billboard and an accuracy tag riding the newest bar.',
    explainer: isoExplainer,
    explainerSound: isoSound,
    draw(ctx, W, H_, t) {
      const R = H.rng(11);
      const s = 35;
      const bob = Math.sin(t * 1.2) * 4;
      const ph = (a, b) => H.clamp((t - a) / (b - a));
      const rise = H.ease.out(ph(0, 1.1));
      const P = makeIso(745, 118 + bob + (1 - rise) * 110, s);
      const TILE = 12, TH = 0.9;

      // ---------- background ----------
      const bg = ctx.createLinearGradient(0, 0, W, H_);
      bg.addColorStop(0, '#f6efe8'); bg.addColorStop(0.55, '#efeaf4'); bg.addColorStop(1, '#e4e3f3');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
      // faint dot grid
      ctx.fillStyle = 'rgba(120,110,170,0.10)';
      for (let y = 18; y < H_; y += 28) for (let x = 18 + ((y / 28) % 2) * 14; x < W; x += 28) ctx.fillRect(x, y, 2, 2);
      // soft glow behind tile
      const glow = ctx.createRadialGradient(745, 380, 40, 745, 380, 560);
      glow.addColorStop(0, 'rgba(255,255,255,0.75)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H_);
      // slow camera push on the world (title stays put)
      ctx.save();
      { const z = 0.955 + 0.045 * H.ease.inOut(H.clamp(t / 5)); ctx.translate(745, 380); ctx.scale(z, z); ctx.translate(-745, -380); }
      ctx.globalAlpha = ph(0, 0.45);

      // ground shadow of floating tile (long, soft, to the lower right)
      {
        const L = H.layer(W, H_), lc = L.getContext('2d');
        const G = makeIso(745 + 60, 118 + 130 - bob * 0.6, s);
        lc.filter = 'blur(16px)';
        poly(lc, [G(0, 0, -TH), G(TILE, 0, -TH), G(TILE + 3, TILE, -TH), G(3, TILE, -TH)].map(p => p), 'rgba(90,80,150,1)');
        ctx.globalAlpha = 0.16 * rise; ctx.drawImage(L, 0, 0); ctx.globalAlpha = ph(0, 0.45);
      }

      // ---------- floating tile slab ----------
      const slab = shade('#cfc6ea');
      // under-layer (soil) slightly inset
      box(ctx, P, 0.35, 0.35, -TH - 0.7, TILE - 0.7, TILE - 0.7, 0.7, shade('#b9addf'), false);
      box(ctx, P, 0, 0, -TH, TILE, TILE, TH, slab, false);
      // floor top
      poly(ctx, [P(0, 0, 0), P(TILE, 0, 0), P(TILE, TILE, 0), P(0, TILE, 0)], '#fbf8f3');
      // paving grid
      ctx.strokeStyle = 'rgba(170,160,205,0.22)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 1; i < TILE; i++) {
        let a = P(i, 0, 0), b = P(i, TILE, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        a = P(0, i, 0); b = P(TILE, i, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      }
      ctx.stroke();
      // grass patch (left corner)
      poly(ctx, [P(0.3, 7.3, 0), P(2.9, 7.3, 0), P(2.9, 11.7, 0), P(0.3, 11.7, 0)], '#d5efe1');
      poly(ctx, [P(9.4, 9.2, 0), P(11.7, 9.2, 0), P(11.7, 11.7, 0), P(9.4, 11.7, 0)], '#d5efe1');
      // walkway stripes
      ctx.strokeStyle = 'rgba(255,200,120,0.9)'; ctx.lineWidth = 2; ctx.setLineDash([7, 7]);
      ctx.beginPath(); { const a = P(3.2, 7.55, 0), b = P(9.0, 7.55, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      { const a = P(3.2, 11.3, 0), b = P(9.0, 11.3, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      ctx.stroke(); ctx.setLineDash([]);
      // painted floor marking "DC-01"
      {
        const o = P(8.9, 7.0, 0);
        ctx.save(); ctx.transform(C30, 0.5, -C30, 0.5, o[0], o[1]);
        ctx.font = '800 30px "Inter"'; ctx.fillStyle = 'rgba(160,150,205,0.45)'; ctx.fillText('DC-01', 0, 0);
        ctx.restore();
      }
      // slab front edge highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); { const a = P(0, TILE, 0), b = P(TILE, TILE, 0), c = P(TILE, 0, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); } ctx.stroke();

      ctx.globalAlpha = 1;
      // ---------- scene objects ----------
      const objs = [];
      const shadowBoxes = []; // [x,y,w,d,h]
      const add = (key, fn, at, base) => objs.push({ key, fn, at, base });

      // main data hall (back)
      const hall = { x: 0.7, y: 0.7, w: 5.2, d: 3.6, h: 3.0 };
      shadowBoxes.push([hall.x, hall.y, hall.w, hall.d, hall.h, 0.75]);
      add(hall.x + hall.w / 2 + hall.y + hall.d / 2, () => {
        const c = shade('#dbe3f6');
        box(ctx, P, hall.x, hall.y, 0, hall.w, hall.d, hall.h, c);
        // window band on left (front) face
        const y = hall.y + hall.d;
        for (let i = 0; i < 6; i++) {
          const x0 = hall.x + 0.3 + i * 0.8;
          poly(ctx, [P(x0, y, 1.1), P(x0 + 0.6, y, 1.1), P(x0 + 0.6, y, 2.4), P(x0, y, 2.4)], '#a9b8e6');
          poly(ctx, [P(x0, y, 1.9), P(x0 + 0.25, y, 2.4), P(x0 + 0.4, y, 2.4), P(x0 + 0.08, y, 1.75)], 'rgba(255,255,255,0.55)');
        }
        // door
        poly(ctx, [P(hall.x + 4.75, y, 0), P(hall.x + 5.05, y, 0), P(hall.x + 5.05, y, 0.9), P(hall.x + 4.75, y, 0.9)], '#8e9bd0');
        // vents on right face
        const x = hall.x + hall.w;
        for (let i = 0; i < 4; i++) {
          const y0 = hall.y + 0.35 + i * 0.8;
          for (let k = 0; k < 4; k++) {
            const zz = 1.0 + k * 0.32;
            poly(ctx, [P(x, y0, zz), P(x, y0 + 0.55, zz), P(x, y0 + 0.55, zz + 0.12), P(x, y0, zz + 0.12)], 'rgba(110,105,170,0.35)');
          }
        }
        // signage strip
        poly(ctx, [P(hall.x + 0.3, y, 2.55), P(hall.x + 2.6, y, 2.55), P(hall.x + 2.6, y, 2.82), P(hall.x + 0.3, y, 2.82)], '#ff6b5b');
        // roof units: AC fans
        for (let i = 0; i < 3; i++) {
          const fx = hall.x + 0.5 + i * 1.6, fy = hall.y + 0.5;
          box(ctx, P, fx, fy, hall.h, 1.2, 1.2, 0.35, shade('#eef1fa'));
          const cpt = P(fx + 0.6, fy + 0.6, hall.h + 0.35);
          ctx.fillStyle = '#9aa6d6'; ctx.beginPath(); ctx.ellipse(cpt[0], cpt[1], 0.45 * 1.2247 * s * 0.85, 0.45 * 0.7071 * s * 0.85, 0, 0, 7); ctx.fill();
          ctx.save(); ctx.translate(cpt[0], cpt[1]); ctx.scale(1, 0.577);
          ctx.rotate(t * 6 + i);
          ctx.fillStyle = '#eef1fa';
          for (let b = 0; b < 3; b++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.ellipse(5, 0, 7, 2.6, 0, 0, 7); ctx.fill(); }
          ctx.restore();
        }
        // solar panels on roof front
        for (let i = 0; i < 4; i++) {
          const px = hall.x + 0.4 + i * 1.2, py = hall.y + 2.1;
          poly(ctx, [P(px, py, hall.h + 0.1), P(px + 1.0, py, hall.h + 0.1), P(px + 1.0, py + 1.1, hall.h + 0.45), P(px, py + 1.1, hall.h + 0.45)], '#7d8fd6');
          ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 0.8; ctx.beginPath();
          for (let k = 1; k < 3; k++) { const a = P(px + k / 3, py, hall.h + 0.1), b = P(px + k / 3, py + 1.1, hall.h + 0.45); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
          const a = P(px, py + 0.55, hall.h + 0.275), b = P(px + 1, py + 0.55, hall.h + 0.275); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
          ctx.stroke();
        }
      }, 0.75, P(hall.x + hall.w / 2, hall.y + hall.d / 2, 0));

      // cooling tanks (right corner)
      const tanks = [[9.2, 1.6, 0.85, 2.7], [10.6, 3.4, 0.75, 2.2]];
      for (const [cx, cy, r, h] of tanks) {
        shadowBoxes.push([cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6, h, 1.0 + (cx - 9.2) * 0.12]);
        add(cx + cy, () => {
          const base = H.hex('#bfe7da');
          const c = cylinder(ctx, P, s, cx, cy, 0, r, h, base);
          // bands
          ctx.strokeStyle = 'rgba(90,150,140,0.35)'; ctx.lineWidth = 1.5;
          for (const zz of [0.5, h - 0.5]) { const p = P(cx, cy, zz); ctx.beginPath(); ctx.ellipse(p[0], p[1], c.rx, c.ry, 0, 0, Math.PI); ctx.stroke(); }
          // top rim + vent
          ctx.fillStyle = H.rgba(H.mix(base, '#5a8f86', 0.35)); ctx.beginPath(); ctx.ellipse(c.tp[0], c.tp[1], c.rx * 0.45, c.ry * 0.45, 0, 0, 7); ctx.fill();
          // ladder
          ctx.strokeStyle = 'rgba(80,120,120,0.5)'; ctx.lineWidth = 1;
          const lx = c.b[0] - c.rx * 0.35;
          ctx.beginPath(); ctx.moveTo(lx, c.b[1] + c.ry * 0.93); ctx.lineTo(lx, c.tp[1] + c.ry * 0.93);
          ctx.moveTo(lx + 6, c.b[1] + c.ry * 0.9); ctx.lineTo(lx + 6, c.tp[1] + c.ry * 0.9);
          for (let yy = c.tp[1] + c.ry + 4; yy < c.b[1] + c.ry; yy += 6) { ctx.moveTo(lx, yy); ctx.lineTo(lx + 6, yy); }
          ctx.stroke();
        }, 1.0 + (cx - 9.2) * 0.12, P(cx, cy, 0));
      }
      // pipes: from tanks to hall (drawn at depth just after hall, before racks)
      add(5.5, () => {
        const pipe = (pts, col, wpx) => {
          const sp = pts.map(p => P(...p));
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.strokeStyle = H.rgba(H.mix(col, SHADE_DARK, 0.3)); ctx.lineWidth = wpx;
          ctx.beginPath(); sp.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
          ctx.strokeStyle = H.rgba(col); ctx.lineWidth = wpx * 0.6;
          ctx.beginPath(); sp.forEach((p, i) => i ? ctx.lineTo(p[0], p[1] - wpx * 0.15) : ctx.moveTo(p[0], p[1] - wpx * 0.15)); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.2;
          ctx.beginPath(); sp.forEach((p, i) => i ? ctx.lineTo(p[0], p[1] - wpx * 0.3) : ctx.moveTo(p[0], p[1] - wpx * 0.3)); ctx.stroke();
          // flanges
          for (let i = 1; i < sp.length - 1; i++) { ctx.fillStyle = H.rgba(H.mix(col, SHADE_DARK, 0.15)); ctx.beginPath(); ctx.arc(sp[i][0], sp[i][1], wpx * 0.62, 0, 7); ctx.fill(); }
        };
        pipe([[8.4, 1.4, 1.6], [6.6, 1.4, 1.6], [6.6, 1.4, 1.6], [hall.x + hall.w, 1.4, 1.6]], H.hex('#c8d2f0'), 9);
        pipe([[9.9, 3.4, 1.0], [7.2, 3.4, 1.0], [7.2, 3.4, 1.0], [hall.x + hall.w, 3.4, 1.0]], H.hex('#ffd2c4'), 7);
        // pipe supports
        for (const xx of [6.9, 7.8]) box(ctx, P, xx, 1.25, 0, 0.18, 0.3, 1.45, shade('#d8d4ea'), false);
      }, 1.45, P(7.5, 2.4, 1.3));

      // server racks (two rows, open-air cutaway)
      const racks = [];
      const rowY = [5.4, 8.1];
      for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
        const accent = r === 0 && i === 2;
        racks.push({ x: 3.4 + i * 1.3, y: rowY[r], w: 1.05, d: 0.95, h: accent ? 2.5 : 2.15, accent, id: r * 4 + i });
      }
      for (const rk of racks) {
        shadowBoxes.push([rk.x, rk.y, rk.w, rk.d, rk.h, 1.15 + rk.id * 0.08]);
        add(rk.x + rk.w / 2 + rk.y + rk.d / 2, () => {
          const base = rk.accent ? '#ff8a7a' : '#aab6e8';
          const c = shade(base);
          box(ctx, P, rk.x, rk.y, 0, rk.w, rk.d, rk.h, c);
          // front panel inset on left face (facing viewer)
          const y = rk.y + rk.d;
          const fx0 = rk.x + 0.1, fx1 = rk.x + rk.w - 0.1;
          poly(ctx, [P(fx0, y, 0.12), P(fx1, y, 0.12), P(fx1, y, rk.h - 0.12), P(fx0, y, rk.h - 0.12)], rk.accent ? '#7a3a52' : '#4a5488');
          const units = rk.accent ? 7 : 6;
          const uh = (rk.h - 0.3) / units;
          const lr = H.rng(100 + rk.id);
          for (let u = 0; u < units; u++) {
            const z0 = 0.17 + u * uh;
            poly(ctx, [P(fx0 + 0.05, y, z0), P(fx1 - 0.05, y, z0), P(fx1 - 0.05, y, z0 + uh * 0.72), P(fx0 + 0.05, y, z0 + uh * 0.72)], rk.accent ? '#93465f' : '#5d68a0');
            // slats
            ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.8; ctx.beginPath();
            for (let k = 0; k < 4; k++) { const a = P(fx0 + 0.33 + k * 0.1, y, z0 + 0.06), b = P(fx0 + 0.33 + k * 0.1, y, z0 + uh * 0.66); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
            ctx.stroke();
            // LEDs
            for (let k = 0; k < 2; k++) {
              const ph = lr() * 10, rate = lr.range(2, 6);
              const on = Math.sin(t * rate + ph) > -0.2;
              const lp = P(fx0 + 0.13 + k * 0.1, y, z0 + uh * 0.36);
              const col = rk.accent ? '#ffe28a' : (lr() < 0.2 ? '#ffb38a' : '#8ff0c8');
              if (on) {
                ctx.fillStyle = H.rgba(col, 0.35); ctx.beginPath(); ctx.arc(lp[0], lp[1], 3.6, 0, 7); ctx.fill();
                ctx.fillStyle = col;
              } else ctx.fillStyle = 'rgba(30,30,60,0.6)';
              ctx.beginPath(); ctx.arc(lp[0], lp[1], 1.5, 0, 7); ctx.fill();
            }
          }
          // top label strip on the right face
          poly(ctx, [P(rk.x + rk.w, rk.y + 0.15, rk.h - 0.35), P(rk.x + rk.w, rk.y + rk.d - 0.15, rk.h - 0.35), P(rk.x + rk.w, rk.y + rk.d - 0.15, rk.h - 0.2), P(rk.x + rk.w, rk.y + 0.15, rk.h - 0.2)], 'rgba(255,255,255,0.35)');
          if (rk.accent) {
            // glow halo on top
            const tp = P(rk.x + rk.w / 2, rk.y + rk.d / 2, rk.h);
            const g = ctx.createRadialGradient(tp[0], tp[1], 2, tp[0], tp[1], 60);
            g.addColorStop(0, 'rgba(255,120,100,0.35)'); g.addColorStop(1, 'rgba(255,120,100,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(tp[0], tp[1], 60, 0, 7); ctx.fill();
          }
        }, 1.15 + rk.id * 0.08, P(rk.x + rk.w / 2, rk.y + rk.d / 2, 0));
      }
      // overhead cable tray along each row (drawn right after the row, before the next row)
      for (let r = 0; r < 2; r++) {
        const ry = rowY[r] + 0.3, z = 2.62, x0 = 3.25, x1 = 8.6;
        const lastKey = racks[r * 4 + 3].x + 0.53 + rowY[r] + 0.48;
        add(lastKey + 0.01, () => {
          box(ctx, P, x0, ry, z, x1 - x0, 0.35, 0.1, shade('#d9d6ee'));
          // cables lying in the tray
          const cols = ['#4a5488', '#ff6b5b', '#7fc8a8'];
          cols.forEach((c, k) => {
            const a = P(x0 + 0.05, ry + 0.09 + k * 0.09, z + 0.12), b = P(x1 - 0.05, ry + 0.09 + k * 0.09, z + 0.12);
            ctx.strokeStyle = c; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          });
          // drops into racks
          for (let i = 0; i < 4; i++) {
            const rk = racks[r * 4 + i];
            const a = P(rk.x + 0.5, ry + 0.2, z), b = P(rk.x + 0.5, ry + 0.2, rk.h);
            ctx.strokeStyle = i === 2 && r === 0 ? '#ff6b5b' : '#4a5488'; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.bezierCurveTo(a[0] + 3, a[1] + 4, b[0] - 3, b[1] - 4, b[0], b[1]); ctx.stroke();
          }
        }, 1.95 + r * 0.12, P(5.9, ry, 2.62));
      }
      // ground cable run from rack row to hall (a channel on the floor)
      add(4.0, () => {
        ctx.strokeStyle = '#6b74ad'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        for (let k = 0; k < 3; k++) {
          const pts = [P(3.0 + k * 0.15, 5.9, 0.02), P(3.0 + k * 0.15, 4.3 + 0.0, 0.02)];
          ctx.strokeStyle = k === 1 ? '#ff6b5b' : '#6b74ad';
          ctx.beginPath(); ctx.moveTo(...pts[0]); ctx.lineTo(...pts[1]); ctx.stroke();
        }
      }, 1.9, P(3.1, 5.1, 0));

      // trees
      const trees = [[1.0, 8.2, 1.0], [1.9, 9.6, 1.25], [0.9, 10.9, 0.85], [10.0, 10.4, 1.05], [11.1, 11.0, 0.8], [7.4, 0.9, 0.0]];
      for (const [tx, ty, sc] of trees) {
        if (!sc) continue;
        shadowBoxes.push([tx - 0.3 * sc, ty - 0.3 * sc, 0.6 * sc, 0.6 * sc, 2.0 * sc, 0.95 + (tx + ty) * 0.035]);
        add(tx + ty, () => {
          const b = P(tx, ty, 0), top = P(tx, ty, 1.5 * sc);
          ctx.strokeStyle = '#b79a8a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(top[0], top[1] + 4); ctx.stroke();
          const sway = Math.sin(t * 1.5 + tx) * 1.2;
          const rr = 0.62 * sc * s;
          const cxp = top[0] + sway, cyp = top[1] - rr * 0.3;
          ctx.fillStyle = '#7fc8a8'; ctx.beginPath(); ctx.arc(cxp, cyp, rr, 0, 7); ctx.fill();
          ctx.fillStyle = '#a3dcc0'; ctx.beginPath(); ctx.arc(cxp - rr * 0.22, cyp - rr * 0.2, rr * 0.72, 0, 7); ctx.fill();
          ctx.fillStyle = '#c4ecd6'; ctx.beginPath(); ctx.arc(cxp - rr * 0.4, cyp - rr * 0.42, rr * 0.25, 0, 7); ctx.fill();
          // shading crescent
          ctx.save(); ctx.beginPath(); ctx.arc(cxp, cyp, rr, 0, 7); ctx.clip();
          ctx.fillStyle = 'rgba(80,120,140,0.18)'; ctx.beginPath(); ctx.arc(cxp - rr * 0.6, cyp - rr * 0.6, rr * 1.35, 0, 7); ctx.arc(cxp, cyp, rr * 2, 0, 7, true); ctx.fill('evenodd');
          ctx.restore();
        }, 0.95 + (tx + ty) * 0.035, P(tx, ty, 0));
      }
      // bench + lamp post
      add(2.6 + 7.9, () => { box(ctx, P, 2.3, 7.7, 0, 0.35, 1.0, 0.35, shade('#e7d6c9')); }, 1.5, P(2.5, 8.2, 0));

      // people
      const person = (x, y, shirt, face, carry) => {
        const p = P(x, y, 0);
        const hh = 0.95 * s;
        ctx.fillStyle = 'rgba(80,70,140,0.18)'; ctx.beginPath(); ctx.ellipse(p[0] + 4, p[1] + 1, 6, 2.5, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#4a4f78'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p[0] - 2, p[1]); ctx.lineTo(p[0] - 1.5, p[1] - hh * 0.42); ctx.moveTo(p[0] + 2, p[1] - 1); ctx.lineTo(p[0] + 1.5, p[1] - hh * 0.42); ctx.stroke();
        ctx.fillStyle = shirt;
        ctx.beginPath(); ctx.roundRect(p[0] - 4.5, p[1] - hh * 0.8, 9, hh * 0.42, 3.5); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(p[0] - 4.5, p[1] - hh * 0.78, 3, hh * 0.36);
        ctx.fillStyle = '#f1c6a8'; ctx.beginPath(); ctx.arc(p[0], p[1] - hh * 0.9, 3.8, 0, 7); ctx.fill();
        ctx.fillStyle = face; ctx.beginPath(); ctx.arc(p[0] + 0.6, p[1] - hh * 0.93, 3.9, Math.PI * 1.05, Math.PI * 2.05); ctx.fill();
        if (carry) { ctx.fillStyle = '#e9ecf8'; ctx.save(); ctx.translate(p[0] + 5, p[1] - hh * 0.6); ctx.transform(1, -0.5, 0, 1, 0, 0); ctx.fillRect(0, 0, 8, 5); ctx.fillStyle = '#ff6b5b'; ctx.fillRect(1, 1, 6, 3); ctx.restore(); }
      };
      const walk = H.clamp((t - 2.7) * 0.32);
      add(7.0 + 7.3, () => person(6.6, 7.2, '#ff6b5b', '#3d3550', true), 2.25, P(6.6, 7.2, 0));
      add(3.0 + 7.4, () => person(3.0, 7.6, '#7f8fd8', '#6b4a3a', false), 2.4, P(3.0, 7.6, 0));
      add(9.6 + 5.1, () => person(9.6, 5.1, '#9fd8c2', '#2f2a40', false), 2.55, P(9.6, 5.1, 0));
      add(4.2 + 10.9 + walk * 3, () => person(4.2 + walk * 3, 10.9, '#f5b78f', '#3d3550', false), 2.7, P(4.2 + walk * 3, 10.9, 0));

      // rising data cubes from the GPU rack
      const acc = racks[2];
      add(99, () => {
        for (let i = 0; i < 6; i++) {
          const ph = (Math.max(0, t - 2.4) * 0.45 + i / 6) % 1;
          if (t < 2.4 + i * 0.37) continue;
          const z = acc.h + 0.3 + ph * 3.2;
          const ox = acc.x + acc.w / 2 - 0.15 + Math.sin(i * 2.1) * 0.35, oy = acc.y + acc.d / 2 - 0.15 + Math.cos(i * 1.7) * 0.35;
          const a = Math.sin(ph * Math.PI);
          ctx.globalAlpha = a;
          const sz = 0.26 * (1 - ph * 0.4);
          box(ctx, P, ox, oy, z, sz, sz, sz, shade(i % 2 ? '#ff8a7a' : '#ffc2b4'), false);
          ctx.globalAlpha = 1;
        }
      });

      // ---------- shadows on floor (single layer, no doubled overlaps) ----------
      {
        const L = H.layer(W, H_), lc = L.getContext('2d');
        const sv = [1.15, 0.12];
        lc.fillStyle = '#000';
        for (const [x, y, w, d, h0, at] of shadowBoxes) {
          const kk = H.ease.out(ph(at, at + 0.5)); if (kk <= 0) continue;
          const h = h0 * kk;
          const base = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
          const pts = base.concat(base.map(p => [p[0] + sv[0] * h, p[1] + sv[1] * h]));
          const hl = hull(pts).map(p => P(p[0], p[1], 0));
          poly(lc, hl, '#000');
        }
        lc.globalCompositeOperation = 'destination-in';
        poly(lc, [P(0, 0, 0), P(TILE, 0, 0), P(TILE, TILE, 0), P(0, TILE, 0)], '#000');
        lc.globalCompositeOperation = 'source-in';
        lc.fillStyle = 'rgb(110,96,170)'; lc.fillRect(0, 0, W, H_);
        ctx.globalAlpha = 0.17; ctx.drawImage(L, 0, 0); ctx.globalAlpha = 1;
      }

      // ---------- painter's sort + draw ----------
      objs.sort((a, b) => a.key - b.key);
      for (const o of objs) {
        const k = o.at == null ? 1 : H.ease.back(ph(o.at, o.at + 0.5));
        if (k <= 0.001) continue;
        ctx.save();
        if (k !== 1 && o.base) { ctx.translate(o.base[0], o.base[1]); ctx.scale(k, k); ctx.translate(-o.base[0], -o.base[1]); }
        o.fn(); ctx.restore();
      }

      // small floating debris cubes under the island
      for (const [x, y, z, sz] of [[6.5, 13.4, -2.9, 0.45], [12.6, 12.0, -3.2, 0.35], [13.2, 6.5, -2.4, 0.42]]) {
        box(ctx, P, x, y, z + Math.sin(t + x) * 0.15 - (1 - rise) * 2, sz, sz, sz, shade('#cfc6ea'), false);
      }

      // ---------- satellite mini-tile (lower left) with data link ----------
      {
        const b2 = Math.sin(t * 1.2 + 1.3) * 5;
        const mt = H.ease.back(ph(1.3, 1.95));
        const Q = makeIso(250, 452 + b2 + (1 - mt) * 140, 35);
        ctx.save(); ctx.globalAlpha = ph(1.3, 1.6);
        // its soft shadow
        const L = H.layer(W, H_), lc = L.getContext('2d');
        const G = makeIso(250 + 30, 452 + 70, 35);
        lc.filter = 'blur(12px)';
        poly(lc, [G(0, 0, 0), G(3, 0, 0), G(4, 3, 0), G(1, 3, 0)], 'rgb(90,80,150)');
        ctx.globalAlpha = 0.14 * ph(1.3, 1.9); ctx.drawImage(L, 0, 0); ctx.globalAlpha = ph(1.3, 1.6);
        box(ctx, Q, 0.15, 0.15, -1.2, 2.7, 2.7, 0.5, shade('#b9addf'), false);
        box(ctx, Q, 0, 0, -0.7, 3, 3, 0.7, shade('#cfc6ea'), false);
        poly(ctx, [Q(0, 0, 0), Q(3, 0, 0), Q(3, 3, 0), Q(0, 3, 0)], '#fbf8f3');
        ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); { const a = Q(0, 3, 0), b = Q(3, 3, 0), c = Q(3, 0, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); } ctx.stroke();
        // shadow of dish base
        poly(ctx, [Q(1.0, 1.0, 0), Q(2.6, 1.1, 0), Q(2.6, 2.0, 0), Q(1.0, 2.0, 0)], 'rgba(110,96,170,0.16)');
        box(ctx, Q, 1.0, 1.0, 0, 1.0, 1.0, 0.55, shade('#dbe3f6'));
        { const tb = Q(2.4, 0.55, 0), tt = Q(2.4, 0.55, 0.9); const rr = 11;
          poly(ctx, [Q(2.25, 0.4, 0), Q(2.95, 0.45, 0), Q(2.95, 0.75, 0), Q(2.25, 0.7, 0)], 'rgba(110,96,170,0.14)');
          ctx.strokeStyle = '#b79a8a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(tb[0], tb[1]); ctx.lineTo(tt[0], tt[1]); ctx.stroke();
          ctx.fillStyle = '#7fc8a8'; ctx.beginPath(); ctx.arc(tt[0], tt[1] - 4, rr, 0, 7); ctx.fill();
          ctx.fillStyle = '#a3dcc0'; ctx.beginPath(); ctx.arc(tt[0] - 2.5, tt[1] - 6.5, rr * 0.72, 0, 7); ctx.fill(); }
        const pole = Q(1.5, 1.5, 0.55), poleTop = Q(1.5, 1.5, 1.4);
        ctx.strokeStyle = '#8e9bd0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(pole[0], pole[1]); ctx.lineTo(poleTop[0], poleTop[1]); ctx.stroke();
        // dish (tilted toward the main island)
        ctx.save(); ctx.translate(poleTop[0] + 4, poleTop[1] - 8); ctx.rotate(0.6);
        const dg = ctx.createLinearGradient(-30, -30, 30, 30);
        dg.addColorStop(0, '#ffffff'); dg.addColorStop(1, '#c9cfee');
        ctx.fillStyle = '#a9b3e0'; ctx.beginPath(); ctx.ellipse(2, 3, 34, 15, 0, 0, 7); ctx.fill();
        ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(0, 0, 34, 15, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(140,150,200,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, 20, 8.5, 0, 0, 7); ctx.stroke();
        ctx.strokeStyle = '#8e9bd0'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-20, 4); ctx.lineTo(0, -26); ctx.lineTo(20, 4); ctx.stroke();
        ctx.fillStyle = '#ff6b5b'; ctx.beginPath(); ctx.arc(0, -27, 3.5, 0, 7); ctx.fill();
        ctx.restore();
        // dashed data arc to the hall roof
        const from = [poleTop[0] + 4 + Math.sin(0.6) * 27, poleTop[1] - 8 - Math.cos(0.6) * 27];
        const to = P(3.3, 5.75, 2.75);
        const cx = (from[0] + to[0]) / 2 - 50, cy = (from[1] + to[1]) / 2 - 110;
        ctx.restore();
        const arcP = H.ease.inOut(ph(2.1, 2.9));
        const qb = (u) => [(1 - u) * (1 - u) * from[0] + 2 * u * (1 - u) * cx + u * u * to[0], (1 - u) * (1 - u) * from[1] + 2 * u * (1 - u) * cy + u * u * to[1]];
        ctx.strokeStyle = 'rgba(255,107,91,0.7)'; ctx.lineWidth = 1.6; ctx.setLineDash([4, 6]); ctx.lineDashOffset = -t * 30;
        ctx.beginPath(); ctx.moveTo(from[0], from[1]); for (let k = 1; k <= 40; k++) { const q = qb(arcP * k / 40); ctx.lineTo(q[0], q[1]); } if (arcP > 0) ctx.stroke(); ctx.setLineDash([]);
        for (let i = 0; i < 3; i++) {
          if (t < 2.9 + i * 0.5) continue;
          const u = ((t - 2.9 - i * 0.5) * 0.3 + i / 3) % 1;
          const x = (1 - u) * (1 - u) * from[0] + 2 * u * (1 - u) * cx + u * u * to[0];
          const y = (1 - u) * (1 - u) * from[1] + 2 * u * (1 - u) * cy + u * u * to[1];
          ctx.fillStyle = 'rgba(255,107,91,0.25)'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill();
          ctx.fillStyle = '#ff6b5b'; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
        }
      }

      // ---------- label tag ----------
      {
        const anchor = P(acc.x + acc.w / 2, acc.y + acc.d / 2, acc.h + 0.1);
        const tx = anchor[0] + 120, ty = anchor[1] - 150;
        const lp = H.ease.out(ph(2.75, 3.15)), tp = H.ease.back(ph(3.05, 3.45));
        ctx.save(); if (lp <= 0) ctx.globalAlpha = 0;
        ctx.strokeStyle = '#4a4f78'; ctx.lineWidth = 1.3;
        const l1 = anchor[1] - (ty + 30), l2 = tx - 4 - anchor[0], dl = (l1 + l2) * lp;
        ctx.beginPath(); ctx.moveTo(anchor[0], anchor[1]); ctx.lineTo(anchor[0], anchor[1] - Math.min(dl, l1)); if (dl > l1) ctx.lineTo(anchor[0] + (dl - l1), ty + 30); ctx.stroke();
        ctx.fillStyle = '#4a4f78'; ctx.beginPath(); ctx.arc(anchor[0], anchor[1], 3.5, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(anchor[0], anchor[1], 1.5, 0, 7); ctx.fill();
        ctx.font = '600 13px "Inter"';
        const label = 'GPU CLUSTER', sub = '1.2 PFLOPS · 74°F';
        const wbox = Math.max(ctx.measureText(label).width, 0) + 54;
        ctx.globalAlpha = tp > 0 ? Math.min(1, ph(3.05, 3.25)) : 0;
        ctx.translate(tx, ty + 31); ctx.scale(Math.max(0.001, tp), Math.max(0.001, tp)); ctx.translate(-tx, -(ty + 31));
        ctx.save(); ctx.shadowColor = 'rgba(80,70,140,0.18)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(tx, ty + 6, wbox + 40, 50, 12); ctx.fill(); ctx.restore();
        ctx.fillStyle = '#ff6b5b'; ctx.beginPath(); ctx.roundRect(tx + 12, ty + 18, 26, 26, 7); ctx.fill();
        // tiny chip glyph
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.strokeRect(tx + 19, ty + 25, 12, 12);
        ctx.beginPath(); for (let k = 0; k < 3; k++) { ctx.moveTo(tx + 22 + k * 3, ty + 22); ctx.lineTo(tx + 22 + k * 3, ty + 25); ctx.moveTo(tx + 22 + k * 3, ty + 37); ctx.lineTo(tx + 22 + k * 3, ty + 40); } ctx.stroke();
        ctx.fillStyle = '#2d3058'; ctx.fillText(label, tx + 48, ty + 29);
        ctx.font = '400 12px "Inter"'; ctx.fillStyle = '#8a88ad'; ctx.fillText(sub, tx + 48, ty + 46);
        ctx.restore();
      }
      ctx.restore(); // end camera push

      // ---------- title ----------
      const bw = 34 * H.ease.out(ph(0.25, 0.7));
      if (bw > 0.5) { ctx.fillStyle = '#ff6b5b'; ctx.beginPath(); ctx.roundRect(72, 92, bw, 6, 3); ctx.fill(); }
      const t1 = H.ease.out(ph(0.4, 0.95)), t2 = H.ease.out(ph(0.65, 1.2));
      ctx.save(); ctx.globalAlpha = t1; ctx.font = '800 46px "Inter"'; ctx.fillStyle = '#2d3058';
      ctx.fillText('Where AI lives', 70, 152 + (1 - t1) * 18); ctx.restore();
      ctx.save(); ctx.globalAlpha = t2; ctx.font = '400 18px "Inter"'; ctx.fillStyle = '#7b7aa3';
      ctx.fillText('Inside a modern data center', 72, 186 + (1 - t2) * 12); ctx.restore();
    },
  });
}
