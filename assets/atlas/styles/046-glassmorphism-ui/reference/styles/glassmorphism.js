{
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  let NOISE = null;
  function noisePattern(ctx) {
    if (!NOISE) {
      NOISE = H.layer(160, 160);
      const nc = NOISE.getContext('2d'), id = nc.createImageData(160, 160), r = H.rng(99);
      for (let i = 0; i < id.data.length; i += 4) { const v = r() < 0.5 ? 0 : 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = r() * 60; }
      nc.putImageData(id, 0, 0);
    }
    return ctx.createPattern(NOISE, 'repeat');
  }
  // Frosted glass panel: shadow -> blurred backdrop (clipped) -> tint -> grain -> sheen -> 1px gradient border
  function glass(ctx, src, x, y, w, h, r, o = {}) {
    const tint = o.tint ?? 0.1;
    ctx.save();
    ctx.shadowColor = 'rgba(8,4,30,0.45)'; ctx.shadowBlur = o.shadow ?? 50; ctx.shadowOffsetY = (o.shadow ?? 50) * 0.4;
    ctx.fillStyle = 'rgba(20,10,50,1)'; rr(ctx, x, y, w, h, r); ctx.fill();
    ctx.restore();
    ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
    { const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(src, 0, 0, ctx.canvas.width, ctx.canvas.height); ctx.setTransform(M); }
    const tg = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
    tg.addColorStop(0, `rgba(255,255,255,${tint + 0.08})`); tg.addColorStop(1, `rgba(255,255,255,${tint * 0.5})`);
    ctx.fillStyle = tg; ctx.fillRect(x, y, w, h);
    { const A = ctx.globalAlpha; ctx.globalAlpha = A * 0.22; ctx.fillStyle = noisePattern(ctx); ctx.fillRect(x, y, w, h); ctx.globalAlpha = A; }
    // diagonal specular sheen
    const sg = ctx.createLinearGradient(x, y, x + w * 0.55, y + h * 0.55);
    sg.addColorStop(0, 'rgba(255,255,255,0.16)'); sg.addColorStop(0.45, 'rgba(255,255,255,0.04)'); sg.addColorStop(0.46, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = sg; ctx.fillRect(x, y, w, h);
    ctx.restore();
    // 1px light border, brighter top-left
    ctx.save();
    const bg = ctx.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, 'rgba(255,255,255,0.65)'); bg.addColorStop(0.35, 'rgba(255,255,255,0.18)'); bg.addColorStop(0.7, 'rgba(255,255,255,0.08)'); bg.addColorStop(1, 'rgba(255,255,255,0.32)');
    ctx.strokeStyle = bg; ctx.lineWidth = 1; rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.stroke();
    // inner top highlight
    const hg = ctx.createLinearGradient(x, 0, x + w, 0);
    hg.addColorStop(0, 'rgba(255,255,255,0)'); hg.addColorStop(0.3, 'rgba(255,255,255,0.55)'); hg.addColorStop(0.7, 'rgba(255,255,255,0.15)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = hg; ctx.beginPath(); ctx.moveTo(x + r, y + 1.5); ctx.lineTo(x + w - r, y + 1.5); ctx.stroke();
    ctx.restore();
  }
  function blurOf(srcCanvas, W, Hh, px) {
    const L = H.layer(W, Hh), c = L.getContext('2d');
    c.filter = `blur(${px}px) saturate(150%)`;
    c.drawImage(srcCanvas, 0, 0, W, Hh);
    return L;
  }
  function orb(ctx, x, y, r, c1, c2, c3) {
    const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.05, x, y, r);
    g.addColorStop(0, c1); g.addColorStop(0.55, c2); g.addColorStop(1, c3);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }

  // ================= EXPLAINER: the camera glides across one big frosted-glass dashboard; panels blur the live blobs behind them =================
  function petIcon(ctx, kind, x, y, r, col = '#ffffff', lw = 2) {
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    if (kind === 'cat') { ctx.moveTo(-0.8 * r, -0.1 * r); ctx.lineTo(-0.7 * r, -1.0 * r); ctx.lineTo(-0.25 * r, -0.72 * r); ctx.moveTo(0.8 * r, -0.1 * r); ctx.lineTo(0.7 * r, -1.0 * r); ctx.lineTo(0.25 * r, -0.72 * r); }
    else { ctx.moveTo(-0.62 * r, -0.62 * r); ctx.quadraticCurveTo(-1.25 * r, -0.4 * r, -0.95 * r, 0.35 * r); ctx.moveTo(0.62 * r, -0.62 * r); ctx.quadraticCurveTo(1.25 * r, -0.4 * r, 0.95 * r, 0.35 * r); }
    ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 0.8 * r, 0, 7); ctx.stroke();
    ctx.fillStyle = col;
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 0.3 * r, -0.08 * r, 0.09 * r, 0, 7); ctx.fill(); }
    ctx.beginPath(); ctx.ellipse(0, 0.25 * r, 0.12 * r, 0.08 * r, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  function chipPill(ctx, x, y, text, o = {}) {
    ctx.save(); ctx.font = o.font || '600 13px "Inter"';
    const w = ctx.measureText(text).width + (o.dot ? 40 : 26), h = o.h || 26, k = o.k ?? 1;
    ctx.globalAlpha *= Math.min(1, k * 1.5); ctx.translate(x, y); ctx.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k);
    if (o.grad) { const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, o.grad[0]); g.addColorStop(1, o.grad[1]); ctx.fillStyle = g; ctx.shadowColor = o.glow || 'rgba(255,60,200,0.4)'; ctx.shadowBlur = 16; }
    else ctx.fillStyle = o.bg || 'rgba(255,255,255,0.16)';
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1, h / 2); ctx.stroke();
    if (o.dot) { ctx.fillStyle = o.dot; ctx.beginPath(); ctx.arc(-w / 2 + 14, 0, 4, 0, 7); ctx.fill(); }
    ctx.fillStyle = o.col || '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, o.dot ? 8 : 0, 1);
    ctx.restore();
  }
  function glowLine(ctx, a, c, b, prog, col1, col2, w = 3, dots = 0, t = 0) {
    if (prog <= 0) return null;
    const q = (u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
    const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, col1); g.addColorStop(1, col2);
    ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.shadowColor = col2; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); for (let i = 1; i <= 40; i++) { const p = q(prog * i / 40); ctx.lineTo(p[0], p[1]); } ctx.stroke();
    const e = q(prog), e0 = q(Math.max(0, prog - 0.03)), ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
    ctx.translate(e[0], e[1]); ctx.rotate(ang); ctx.fillStyle = col2; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-8, -7); ctx.lineTo(-5, 0); ctx.lineTo(-8, 7); ctx.closePath(); ctx.fill();
    ctx.restore();
    for (let i = 0; i < dots; i++) { const uu = ((t * 0.7 + i / dots) % 1) * prog; const p = q(uu); ctx.fillStyle = '#ffffff'; ctx.shadowColor = col2; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(p[0], p[1], 3.2, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
    return q;
  }
  function glassExplainer(ctx, W, H_, t) {
    const ph = (a, b) => H.clamp((t - a) / (b - a));
    const E = (a, b) => H.ease.inOut(ph(a, b));
    const EO = (a, b) => H.ease.out(ph(a, b));
    const typed = (str, a, b) => str.slice(0, Math.round(str.length * ph(a, b)));
    // camera over the dashboard: [t, centreX, centreY, zoom]
    const KF = [[0, 640, 360, 1], [1.7, 640, 360, 1], [2.8, 1300, 345, 1.35], [5.8, 1302, 345, 1.37], [6.8, 2238, 330, 1.3], [10.2, 2242, 330, 1.31], [11.1, 3060, 345, 1.35], [12.8, 3062, 345, 1.37], [13.8, 1800, 330, 0.37], [20, 1800, 330, 0.37]];
    let k = 0; while (k < KF.length - 2 && t > KF[k + 1][0]) k++;
    const A = KF[k], B = KF[k + 1], u = H.ease.inOut(H.clamp((t - A[0]) / (B[0] - A[0])));
    const camX = H.lerp(A[1], B[1], u), camY = H.lerp(A[2], B[2], u), z = H.lerp(A[3], B[3], u);
    const d = (p, a) => Math.sin(t * 0.5 + p) * a;

    // ---------- background: blobs live in screen space but drift with a slow parallax of the camera ----------
    const BG = H.layer(W, H_), b = BG.getContext('2d');
    const base = b.createLinearGradient(0, 0, W, H_); base.addColorStop(0, '#0c0a24'); base.addColorStop(1, '#170f3a');
    b.fillStyle = base; b.fillRect(0, 0, W, H_);
    // blobs add light ('screen'), so overlaps go luminous instead of muddy; orange gets a hot coral mid-stop
    const blob = (x, y, r, col, a = 1) => { const hot = col === '#ff7a1a', mid = hot ? '#ff5a4a' : col, tail = hot ? '#ff2b8a' : col; const g = b.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, H.rgba(col, a)); g.addColorStop(0.5, H.rgba(mid, a * 0.55)); g.addColorStop(1, H.rgba(tail, 0)); b.fillStyle = g; b.fillRect(x - r, y - r, r * 2, r * 2); };
    const par = (wx) => 640 + (wx - camX) * 0.35 * Math.max(z, 0.6);
    const BL = [[300, 170, '#7a2bff'], [900, 600, '#2b6bff'], [1400, 220, '#ff2bd6'], [1900, 620, '#00d1ff'], [2300, 200, '#ff7a1a'], [2800, 560, '#ff2bd6'], [3300, 220, '#7a2bff'], [3700, 600, '#ff7a1a'], [-200, 600, '#00d1ff']];
    BL.forEach(([x, y, c], i) => blob(par(x) + d(i, 30), y + d(i + 2, 20), c === '#ff7a1a' ? 300 : i % 2 ? 330 : 380, c, 0.85));
    // pools of dark negative space, like the hero (base colour re-asserted in the corners)
    const pool = (x, y, r, a) => { const g = b.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(12,10,36,${a})`); g.addColorStop(0.55, `rgba(12,10,36,${a * 0.6})`); g.addColorStop(1, 'rgba(12,10,36,0)'); b.fillStyle = g; b.fillRect(x - r, y - r, r * 2, r * 2); };
    pool(0, H_, 520, 0.6); pool(W, 0, 420, 0.4);
    const orb = (x, y, r, c1, c2, c3) => { const g = b.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.05, x, y, r); g.addColorStop(0, c1); g.addColorStop(0.55, c2); g.addColorStop(1, c3); b.fillStyle = g; b.beginPath(); b.arc(x, y, r, 0, 7); b.fill(); };
    orb(par(1650) + d(5, 10), 150, 90, '#ffd2f4', '#ff4fc1', '#6a1497');
    orb(par(2700) + d(6, 10), 600, 70, '#c7f2ff', '#3aa0ff', '#1a2a8a');
    orb(par(600), 560, 60, '#ffe3b8', '#ff8a2a', '#9a2f12');
    b.strokeStyle = 'rgba(255,255,255,0.035)'; b.lineWidth = 1; b.beginPath();
    const gx = (-(camX * z) % 48 + 48) % 48;
    for (let x = gx; x <= W; x += 48 * z) { b.moveTo(x + 0.5, 0); b.lineTo(x + 0.5, H_); }
    for (let y = 0; y <= H_; y += 48 * z) { b.moveTo(0, y + 0.5); b.lineTo(W, y + 0.5); }
    b.stroke();
    // dither the smooth gradients before the blur + saturate, which otherwise bands
    b.globalAlpha = 0.05; b.fillStyle = noisePattern(b); b.fillRect(0, 0, W, H_); b.globalAlpha = 1;
    ctx.drawImage(BG, 0, 0);
    let SRC = blurOf(BG, W, H_, 26);

    ctx.save();
    ctx.translate(640, 360); ctx.scale(z, z); ctx.translate(-camX, -camY);
    const panelIn = (t0) => EO(t0, t0 + 0.6);
    const panel = (x, y, w, h, t0, title) => {
      const e = panelIn(t0); if (e <= 0) return false;
      ctx.save(); ctx.globalAlpha = e; glass(ctx, SRC, x, y + (1 - e) * 40, w, h, 28, { tint: 0.09 }); ctx.restore();
      if (title) { ctx.save(); ctx.globalAlpha = EO(t0 + 0.2, t0 + 0.6); ctx.font = '600 21px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.78)'; ctx.fillText(title, x + 28, y + 44 + (1 - e) * 40); ctx.restore(); }
      return true;
    };
    // ===== B: training data =====
    const BX = 980, BY = 150, BW = 640, BH = 430;
    if (panel(BX, BY, BW, BH, 2.2, 'TRAINING DATA')) {
      const cnt = Math.floor(1e6 * Math.pow(EO(2.9, 5.7), 1.6));
      ctx.font = '800 50px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText(cnt.toLocaleString('en-US'), BX + 26, BY + 104);
      const nw = ctx.measureText(cnt.toLocaleString('en-US')).width;
      ctx.font = '600 22px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillText('examples', BX + 36 + nw, BY + 102);
      const pr = ph(2.9, 5.7);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.roundRect(BX + 28, BY + 116, BW - 56, 6, 3); ctx.fill();
      const pg = ctx.createLinearGradient(BX + 28, 0, BX + BW - 28, 0); pg.addColorStop(0, '#7a2bff'); pg.addColorStop(1, '#ff4fc1');
      ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(BX + 28, BY + 116, (BW - 56) * Math.pow(pr, 1.6), 6, 3); ctx.fill();
      // grid of labelled example tiles that keeps refilling (scrolls upward like a live feed)
      const scroll = Math.max(0, t - 2.6) * 60;
      ctx.save(); ctx.beginPath(); ctx.roundRect(BX + 20, BY + 140, BW - 40, BH - 160, 16); ctx.clip();
      for (let i = 0; i < 16; i++) {
        const col = i % 4, row = Math.floor(i / 4);
        const tx = BX + 30 + col * 146, ty = BY + 150 + row * 128 - (scroll % 128);
        const idx = i + Math.floor(scroll / 128) * 4;
        const appear = 2.5 + (idx % 15) * 0.05 + Math.floor(idx / 15) * 0;
        const e = EO(appear, appear + 0.3); if (e <= 0) continue;
        const kind = (idx * 7 + 3) % 5 < 2 ? 'dog' : 'cat';
        ctx.save(); ctx.globalAlpha = e;
        ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.beginPath(); ctx.roundRect(tx, ty, 134, 116, 18); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(tx + 0.5, ty + 0.5, 133, 115, 18); ctx.stroke();
        petIcon(ctx, kind, tx + 67, ty + 44, 22, '#ffffff', 2.5);
        chipPill(ctx, tx + 67, ty + 92, kind, { font: '600 21px "Inter"', h: 32, bg: 'rgba(255,255,255,0.26)', dot: kind === 'cat' ? '#7ad7ff' : '#ffb35c' });
        ctx.restore();
      }
      ctx.restore();
    }
    // ===== C: model (network card) =====
    const CX = 1800, CY = 160, CW = 420, CH = 400;
    const adj = E(8.6, 9.3);
    const showC = panel(CX, CY, CW, CH, 4.2, 'MODEL');
    const NODES = [];
    for (let c = 0; c < 3; c++) for (let r = 0; r < (c === 1 ? 4 : 3); r++) NODES.push([CX + 80 + c * 130, CY + (c === 1 ? 110 : 140) + r * (c === 1 ? 70 : 85), c]);
    const wgt = (i, j) => { const a = Math.abs(Math.sin(i * 3.1 + j * 1.7)), b2 = Math.abs(Math.cos(i * 2.3 + j * 0.9)); return H.lerp(a, b2, adj); };
    const err = ph(8.0, 8.4) * (1 - ph(9.2, 9.6));
    if (showC) {
      const pulse = (c) => Math.max(0, Math.sin((t * 6) - c * 1.4)) * ((t > 6.8 && t < 7.2) || (t > 9.3 && t < 9.7) ? 1 : 0);
      for (let i = 0; i < NODES.length; i++) for (let j = 0; j < NODES.length; j++) {
        if (NODES[j][2] !== NODES[i][2] + 1) continue;
        const w = wgt(i, j);
        const col = H.mix(H.mix([122, 215, 255], [255, 79, 193], w), [255, 90, 90], err);
        ctx.strokeStyle = H.rgba(col, 0.25 + 0.65 * w); ctx.lineWidth = 0.8 + 3.2 * w;
        ctx.beginPath(); ctx.moveTo(NODES[i][0], NODES[i][1]); ctx.lineTo(NODES[j][0], NODES[j][1]); ctx.stroke();
      }
      for (const [x, y, c] of NODES) {
        const g = ctx.createRadialGradient(x - 4, y - 5, 1, x, y, 15); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, H.rgba(H.mix([255, 120, 220], [255, 230, 140], pulse(c)))); g.addColorStop(1, '#7a2bff');
        ctx.save(); ctx.shadowColor = '#ff4fc1'; ctx.shadowBlur = 12 + 14 * pulse(c); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill(); ctx.restore();
      }
      ctx.font = '600 21px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.78)'; ctx.fillText('weights', CX + CW - 112, CY + 44);
    }
    // ===== D: output chat card =====
    const DX = 2290, DY = 190, DW = 380, DH = 320;
    const wrong = t > 7.05 && t < 9.4, right = t >= 9.4;
    const shake = t > 7.4 && t < 7.8 ? Math.sin(t * 80) * 6 : 0;
    if (panel(DX + shake, DY, DW, DH, 6.5, 'OUTPUT')) {
      // test picture
      ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.beginPath(); ctx.roundRect(DX + 28 + shake, DY + 64, 120, 110, 18); ctx.fill();
      petIcon(ctx, 'cat', DX + 88 + shake, DY + 124, 28, '#ffffff', 2.5);
      if (t > 6.9 && t < 7.05) chipPill(ctx, DX + 270, DY + 110, '• • •', { bg: 'rgba(255,255,255,0.12)', font: '800 20px "Inter"', h: 34 });
      if (wrong || right) {
        const k2 = EO(right ? 9.4 : 7.05, (right ? 9.4 : 7.05) + 0.3);
        ctx.save(); ctx.globalAlpha = k2;
        const gx2 = DX + 170 + shake, gy2 = DY + 82;
        const ug = ctx.createLinearGradient(gx2, gy2, gx2 + 180, gy2 + 56);
        if (right) { ug.addColorStop(0, '#1fbf8f'); ug.addColorStop(1, '#4dffa6'); } else { ug.addColorStop(0, '#8a5bff'); ug.addColorStop(1, '#ff4fc1'); }
        ctx.fillStyle = ug; ctx.beginPath(); ctx.roundRect(gx2, gy2, 180, 60, [20, 20, 20, 4]); ctx.fill();
        ctx.font = '800 36px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText(right ? 'cat' : 'dog?', gx2 + 18, gy2 + 43);
        ctx.restore();
        // verdict badge
        const vk = H.ease.back(ph(right ? 9.45 : 7.4, (right ? 9.45 : 7.4) + 0.3));
        if (vk > 0) {
          ctx.save(); ctx.translate(gx2 + 150, gy2 + 30); ctx.scale(vk, vk);
          ctx.shadowColor = right ? '#4dffa6' : '#ff3b5c'; ctx.shadowBlur = 18; ctx.fillStyle = right ? '#4dffa6' : '#ff3b5c'; ctx.beginPath(); ctx.arc(0, 0, 17, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath();
          if (right) { ctx.moveTo(-7, 0); ctx.lineTo(-2, 6); ctx.lineTo(8, -6); } else { ctx.moveTo(-6, -6); ctx.lineTo(6, 6); ctx.moveTo(6, -6); ctx.lineTo(-6, 6); }
          ctx.stroke(); ctx.restore();
        }
      }
      if (t > 7.6 && t < 9.5) { ctx.save(); ctx.globalAlpha = EO(7.6, 7.9) * (1 - ph(9.3, 9.5)); ctx.font = '600 22px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText('Answer:', DX + 30, DY + 226); chipPill(ctx, DX + 176, DY + 219, 'cat', { dot: '#7ad7ff', font: '700 22px "Inter"', h: 36, bg: 'rgba(255,255,255,0.24)' }); ctx.restore(); }
      ctx.font = '400 16px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText(typed(right ? 'Weights updated · try #2' : wrong ? 'Prediction 1 of many' : '', right ? 9.5 : 7.1, right ? 9.9 : 7.5), DX + 30, DY + 280);
      // emphasis on the wrong guess: red glow ring
      if (wrong && t > 7.4) { ctx.save(); ctx.strokeStyle = '#ff3b5c'; ctx.shadowColor = '#ff3b5c'; ctx.shadowBlur = 20; ctx.lineWidth = 3; ctx.globalAlpha = 0.55 + 0.45 * Math.sin(t * 10); const pr = EO(7.4, 7.8); ctx.beginPath(); ctx.roundRect(DX + 160 - 10 * (1 - pr), DY + 72 - 10 * (1 - pr), 200 + 20 * (1 - pr), 80 + 20 * (1 - pr), 26); ctx.stroke(); ctx.restore(); }
    }
    // ===== E: accuracy chart =====
    const EX = 2780, EY = 150, EW = 560, EH = 430;
    const ACCS = [61, 72, 80, 86, 90, 93, 95, 97];
    if (panel(EX, EY, EW, EH, 10.4, 'ACCURACY')) {
      const cp = H.ease.inOut(ph(10.9, 12.6));
      const cur = Math.round(H.lerp(61, 97, cp));
      const big = t > 12.6 ? 1 + 0.12 * Math.sin(Math.min(1, (t - 12.6) / 0.35) * Math.PI) : 1;
      ctx.save(); ctx.translate(EX + 28, EY + 110); ctx.scale(big, big);
      const ng = ctx.createLinearGradient(0, -60, 220, 0); ng.addColorStop(0, '#ffffff'); ng.addColorStop(1, cur >= 97 ? '#4dffa6' : '#ffc6f0');
      ctx.font = '800 72px "Inter"'; ctx.fillStyle = ng; if (cur >= 97) { ctx.shadowColor = '#4dffa6'; ctx.shadowBlur = 24 * (1 - ph(13.2, 14)); } ctx.fillText(cur + '%', 0, 0); ctx.restore();
      ctx.font = '600 21px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.78)'; ctx.fillText('round 1: 61%', EX + 300, EY + 104);
      // axes + line chart
      const gx0 = EX + 40, gx1 = EX + EW - 40, gy0 = EY + EH - 50, gy1 = EY + 150;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) { const y = H.lerp(gy0, gy1, i / 4); ctx.beginPath(); ctx.moveTo(gx0, y); ctx.lineTo(gx1, y); ctx.stroke(); }
      const pts = ACCS.map((a, i) => [H.lerp(gx0, gx1, i / 7), H.lerp(gy0, gy1, (a - 50) / 50)]);
      const n = cp * 7, m = Math.floor(n), f = n - m;
      const vis = pts.slice(0, m + 1); if (m < 7) vis.push([H.lerp(pts[m][0], pts[m + 1][0], f), H.lerp(pts[m][1], pts[m + 1][1], f)]);
      if (t > 10.9) {
        const ag = ctx.createLinearGradient(0, gy1, 0, gy0); ag.addColorStop(0, 'rgba(77,255,166,0.35)'); ag.addColorStop(1, 'rgba(77,255,166,0)');
        ctx.fillStyle = ag; ctx.beginPath(); ctx.moveTo(vis[0][0], gy0); vis.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(vis[vis.length - 1][0], gy0); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.strokeStyle = '#4dffa6'; ctx.shadowColor = '#4dffa6'; ctx.shadowBlur = 12; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath(); vis.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.restore();
        vis.forEach((p, i) => { if (i <= m) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, 7); ctx.fill(); } });
        const lp = vis[vis.length - 1]; ctx.save(); ctx.shadowColor = '#4dffa6'; ctx.shadowBlur = 16; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lp[0], lp[1], 7, 0, 7); ctx.fill(); ctx.restore();
        if (t > 12.6) { ctx.save(); ctx.strokeStyle = '#4dffa6'; ctx.globalAlpha = 1 - ph(12.6, 13.4); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lp[0], lp[1], 10 + 40 * EO(12.6, 13.4), 0, 7); ctx.stroke(); ctx.restore(); }
        ctx.font = '600 18px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText('training rounds →', gx1 - 168, gy0 + 32);
        ctx.fillText('61%', gx0 - 6, pts[0][1] + 26);
      }
    }
    // ---------- connectors that draw on ----------
    if (t > 4.4) glowLine(ctx, [BX + BW - 10, BY + 230], [1720, 140], [CX + 30, CY + 150], E(4.4, 5.2), '#7a2bff', '#ff4fc1', 3, t < 7 ? 4 : 0, t);
    if (t > 4.9 && t < 7.0) chipPill(ctx, 1685, 175, 'into the model', { k: EO(4.9, 5.2) * (1 - ph(6.7, 7.0)), grad: ['#8a5bff', '#ff4fc1'], font: '700 19px "Inter"', h: 36 });
    if (t > 6.8) {
      const fade = 1 - ph(10.3, 10.7);
      ctx.save(); ctx.globalAlpha = Math.max(0.0, fade);
      glowLine(ctx, [CX + CW - 30, CY + 90], [2250, 70], [DX + 24, DY + 26], E(6.85, 7.2), '#7ad7ff', '#ffffff', 3);
      chipPill(ctx, 2250, 112, '1  Guess', { k: EO(6.95, 7.25), font: '800 22px "Inter"', h: 40, bg: 'rgba(255,255,255,0.22)' });
      if (t > 7.45) chipPill(ctx, DX + DW - 60, DY - 22, '2  Check', { k: EO(7.45, 7.75), font: '800 22px "Inter"', h: 40, bg: 'rgba(255,255,255,0.22)' });
      if (t > 8.0) {
        const q = glowLine(ctx, [DX + 120, DY + DH - 10], [2250, 590], [CX + CW - 60, CY + CH - 30], E(8.0, 8.6), '#ff7a1a', '#ff3b5c', 3.5);
        if (q && t < 8.8) { const p = q(E(8.0, 8.6)); ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = '#ff3b5c'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, 7); ctx.fill(); ctx.restore(); }
        chipPill(ctx, 2240, 562, '3  Adjust', { k: EO(8.5, 8.8), grad: ['#ff7a1a', '#ff3b5c'], glow: 'rgba(255,60,90,0.5)', font: '800 22px "Inter"', h: 40 });
        if (t < 9.4) chipPill(ctx, 2250, 510, 'error signal', { k: EO(8.1, 8.35) * (1 - ph(9.1, 9.4)), bg: 'rgba(255,59,92,0.38)', font: '700 21px "Inter"', h: 34 });
      }
      if (right) chipPill(ctx, DX + DW - 70, DY - 22, 'Guess again ✓', { k: EO(9.5, 9.8), grad: ['#1fbf8f', '#4dffa6'], glow: 'rgba(77,255,166,0.5)', font: '800 22px "Inter"', h: 40 });
      ctx.restore();
    }
    ctx.restore(); // world

    // ---------- glass over glass: hook card → header pill, takeaway (re-blur the frame) ----------
    SRC = blurOf(ctx.canvas, W, H_, 20);
    {
      const sh = E(1.5, 2.4), a = EO(0.1, 0.6);
      const w = H.lerp(760, 310, sh), h = H.lerp(190, 58, sh), x = H.lerp(640 - 380, 40, sh), y = H.lerp(250, 32, sh) + (1 - a) * 30;
      ctx.save(); ctx.globalAlpha = a; glass(ctx, SRC, x, y, w, h, H.lerp(36, 25, sh), { shadow: H.lerp(50, 20, sh), tint: 0.1 });
      const fs = H.lerp(60, 28, sh);
      ctx.font = `800 ${fs}px "Inter"`; ctx.textBaseline = 'middle';
      const tw = ctx.measureText('How does AI learn?').width;
      const hg = ctx.createLinearGradient(x, 0, x + w, 0); hg.addColorStop(0, '#ffffff'); hg.addColorStop(1, '#ffc6f0');
      ctx.fillStyle = hg; ctx.fillText('How does AI learn?', x + (w - tw) / 2, y + h / 2 + 2);
      if (sh < 0.5) { ctx.globalAlpha = a * (1 - sh * 2) * EO(0.5, 0.9); chipPill(ctx, 640, y - 24, 'NEW SERIES · AI BASICS', { font: '600 12px "Inter"', dot: '#b7f5ff' }); }
      ctx.restore();
    }
    if (t > 13.0) {
      const e = EO(13.0, 13.5);
      const w = 900, h = 100, x = 640 - w / 2, y = 572 + (1 - e) * 30;
      ctx.save(); ctx.globalAlpha = e; glass(ctx, SRC, x, y, w, h, 42, { shadow: 40, tint: 0.12 });
      ctx.font = '800 46px "Inter"'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      const hg = ctx.createLinearGradient(x, 0, x + w, 0); hg.addColorStop(0, '#ffffff'); hg.addColorStop(1, '#ffc6f0');
      ctx.fillStyle = hg; ctx.fillText('More examples → better guesses', 640, y + h / 2 + 2);
      ctx.restore();
    }
  }

  // ---------- sound: frosted-glass dashboard (soft glass taps, airy panel slides, gentle chimes, a calm pad) ----------
  function glassSound(k) {
    const D = 14.5;
    const ph = (t, a, b) => H.clamp((t - a) / (b - a));
    const inv = (u) => (u < 0.5 ? Math.cbrt(u / 4) : 1 - Math.cbrt((1 - u) * 2) / 2); // inverse of H.ease.inOut
    // camera keyframes copied from glassExplainer (KF): pan a sound to where its panel sits on screen
    const KF = [[0, 640, 360, 1], [1.7, 640, 360, 1], [2.8, 1300, 345, 1.35], [5.8, 1302, 345, 1.37], [6.8, 2238, 330, 1.3], [10.2, 2242, 330, 1.31], [11.1, 3060, 345, 1.35], [12.8, 3062, 345, 1.37], [13.8, 1800, 330, 0.37], [20, 1800, 330, 0.37]];
    const pan = (wx, t) => { let i = 0; while (i < KF.length - 2 && t > KF[i + 1][0]) i++; const A = KF[i], B = KF[i + 1], u = H.ease.inOut(H.clamp((t - A[0]) / (B[0] - A[0]))); return H.clamp(((wx - H.lerp(A[1], B[1], u)) * H.lerp(A[3], B[3], u)) / 640, -1, 1) * 0.6; };
    const busy = [];
    // glass tap: a light fingertip click on a glass pane (tiny click + a short, soft glassy ring, kept under ~2 kHz)
    const tap = (t, f, g, p = 0, minor = true) => { busy.push(t); k.play('click', t, { f: f * 1.3, gain: 0.45 * g, pan: p, minor }); k.tone(t, { f, dur: 0.16, gain: 0.07 * g, a: 0.002, pan: p, verb: 0.25, minor }); k.tone(t, { f: f * 1.5, dur: 0.08, gain: 0.025 * g, a: 0.002, pan: p, minor }); };
    // soft chime: rounded sine with an octave shimmer and room
    const chime = (t, n, g, p = 0, dur = 1.2, minor) => { const f = k.hz(n); busy.push(t); k.tone(t, { f, dur, gain: 0.1 * g, a: 0.004, pan: p, verb: 0.4, minor }); k.tone(t, { f: f * 2, dur: dur * 0.45, gain: 0.025 * g, a: 0.003, pan: p, verb: 0.4, minor }); };
    // a frosted panel glides up into place (EO over 0.6 s): an airy breath that settles with a tap
    const frost = (t0, p, g = 1) => { k.noise(t0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.35, 1500], [0.6, 1100]], q: 0.8, gain: 0.06 * g, a: 0.12, pan: p, verb: 0.2 }); tap(t0 + 0.28, 880, 0.7 * g, p); };
    // glowing connector draws on: a soft, rising shimmer that follows the eased line
    const glow = (t0, t1, f0, f1, g, p) => { const d = t1 - t0; k.noise(t0, { dur: d + 0.1, color: 'pink', filter: 'bandpass', f: [[0, f0], [d, f1]], q: 4, gain: 0.05 * g, a: d * 0.5, pan: p, verb: 0.3, minor: true }); k.tone(t0, { f: [[0, f0 / 2], [d, f1 / 2]], type: 'sine', dur: d + 0.1, gain: 0.025 * g, a: d * 0.5, pan: p, minor: true }); };
    const glide = (t0, t1, g = 1) => { const d = t1 - t0; k.noise(t0, { dur: d + 0.15, color: 'pink', filter: 'bandpass', f: [[0, 240], [d * 0.5, 560], [d, 260]], q: 0.7, gain: 0.04 * g, a: d * 0.5, verb: 0.15 }); };
    const counter = (a, b, val, f, g, p, minGap) => {
      let last = -1, lastV = val(a); const top = Math.abs(val(b) - val(a)) / (b - a) * 0.22;
      for (let t = a; t <= b + 1e-6; t += 1 / 120) {
        const v = val(t); if (v === lastV) continue; lastV = v;
        const speed = Math.abs(val(Math.min(b, t + 0.05)) - val(Math.max(a, t - 0.05)));
        const gap = H.clamp(minGap / Math.max(0.2, Math.min(1, speed / top)), minGap, 0.4);
        if (t - last >= gap && !busy.some((x) => t > x - 0.03 && t < x + 0.09)) { k.play('tick', t, { f, gain: g, pan: p, minor: true }); last = t; }
      }
    };

    k.bed('room', 0, D, { gain: 0.18 });
    k.music('pad', 0, D, { bpm: 92, gain: 0.34, chords: [['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['C4', 'E4', 'G4', 'B4'], ['G3', 'B3', 'D4', 'F#4'], ['F3', 'A3', 'C4', 'E4'], ['C4', 'E4', 'G4', 'C5']] });

    // ---- hook: the glass title card fades up (EO 0.1-0.6), its series pill (0.5-0.9), then slides to the header
    k.noise(0.05, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 600], [0.5, 1400]], q: 0.8, gain: 0.05, a: 0.3, verb: 0.3 });
    chime(0.18, 'E5', 1, 0, 1.6); chime(0.18, 'A4', 0.7, 0, 1.6);
    tap(0.6, 1100, 0.5, 0);
    k.noise(1.5, { dur: 0.9, color: 'pink', filter: 'lowpass', f: [[0, 800], [0.9, 350]], gain: 0.045, a: 0.35, minor: true }); // card glides to the corner
    glide(1.7, 2.8);

    // ---- beat 2: TRAINING DATA panel, tiles fade in, counter + progress bar
    frost(2.2, pan(1300, 2.4));
    for (let i = 0; i < 15; i += 2) tap(2.5 + i * 0.05 + 0.04, 980 + (i % 4) * 70, 0.35, pan(1010 + (i % 4) * 146, 2.6)); // tiles appear in a ripple
    counter(2.95, 5.66, (t) => Math.floor(1e6 * Math.pow(H.ease.out(ph(t, 2.9, 5.7)), 1.6)), 3000, 1.0, pan(1100, 4), 1 / 9);
    frost(4.2, pan(2010, 4.4)); // MODEL card
    glow(4.4, 5.2, 600, 1500, 1, pan(1720, 4.8)); // data -> model connector
    tap(4.95, 1050, 0.8, pan(1715, 5.0), false); // "into the model"
    chime(5.7, 'E5', 0.8, pan(1100, 5.7)); tap(5.7, 1300, 0.6, pan(1100, 5.7)); // 1,000,000 + progress bar full

    // ---- beat 3: guess, check, adjust
    glide(5.8, 6.8);
    frost(6.5, pan(2480, 6.7)); // OUTPUT card
    k.tone(6.8, { f: [[0, 330], [0.4, 660]], type: 'sine', dur: 0.42, gain: 0.04, a: 0.15, pan: pan(2010, 6.9), minor: true }); // network lights up
    glow(6.85, 7.2, 900, 1700, 0.8, pan(2250, 7.0)); // Guess line
    tap(6.92, 820, 0.4, pan(2560, 6.92)); // typing dots
    tap(7.0, 1200, 0.8, pan(2250, 7.0)); // "1 Guess"
    chime(7.06, 'G4', 0.7, pan(2550, 7.1), 0.35); // "dog?" message lands (short, so the typing reads)
    for (let i = 0; i < 6; i++) k.play('key', 7.14 + i * 0.065, { gain: 0.4, pan: pan(2400, 7.3), minor: true }); // "Prediction 1 of many" types out (7.1-7.5)
    k.play('error', 7.4, { f: 'A3', gain: 0.7, pan: pan(2600, 7.4) });
    k.tone(7.4, { f: [[0, 160], [0.2, 90]], dur: 0.3, gain: 0.18, pan: pan(2600, 7.4) }); // panel judders
    tap(7.63, 900, 0.9, pan(2400, 7.65)); // Answer: cat
    // ADJUST: the red error line draws back (E 8.0-8.6) with a hot dot riding it; weights re-balance (8.6-9.3)
    glow(8.0, 8.6, 1400, 600, 1.2, pan(2250, 8.3));
    k.tone(8.0, { f: [[0, 520], [0.6, 260]], type: 'triangle', dur: 0.62, gain: 0.045, a: 0.3, pan: pan(2250, 8.3) });
    tap(8.12, 760, 0.6, pan(2250, 8.2)); // "error signal"
    tap(8.52, 900, 0.8, pan(2240, 8.6), false); // "3 Adjust"
    k.noise(8.6, { dur: 0.75, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.4, 1300], [0.75, 900]], q: 3, gain: 0.05, a: 0.3, pan: pan(2010, 9), verb: 0.3, minor: true }); // weights shimmer as they rebalance
    // CORRECT: green "cat" (9.4), check badge (9.45), typing, Guess again
    ['C5', 'E5', 'G5'].forEach((n, i) => chime(9.4 + i * 0.07, n, 0.75 - i * 0.12, pan(2600, 9.45), 0.6));
    for (let i = 0; i < 6; i++) k.play('key', 9.55 + i * 0.065, { gain: 0.5, pan: pan(2400, 9.7), minor: true });

    // ---- beat 4: ACCURACY panel, the line chart draws point by point
    glide(10.2, 11.1);
    frost(10.4, pan(3060, 10.6));
    ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'].forEach((n, i) => chime(10.9 + 1.7 * inv((i + 1) / 7), n, 0.45, pan(2820 + (i + 1) * 69, 11 + i * 0.2), 0.7, true)); // each point lands
    k.noise(10.9, { dur: 1.7, color: 'pink', filter: 'bandpass', f: [[0, 700], [1.7, 1600]], q: 5, gain: 0.025, a: 0.8, pan: pan(3060, 11.8), minor: true }); // the glowing line drawing
    counter(10.95, 12.56, (t) => Math.round(H.lerp(61, 97, H.ease.inOut(ph(t, 10.9, 12.6)))), 2600, 0.9, pan(2900, 12), 1 / 10);
    // 97% (the biggest hit): number glows green and swells, a ring pulses off the last point
    k.play('thud', 12.6, { f: 90, gain: 0.6 });
    k.noise(12.6, { dur: 1.0, color: 'pink', filter: 'lowpass', f: [[0, 2200], [0.9, 400]], gain: 0.16, verb: 0.4 });
    ['A4', 'C5', 'E5', 'A5'].forEach((n, i) => chime(12.6 + i * 0.03, n, 1.3 - i * 0.15, (i - 1.5) * 0.25, 1.8));
    glide(12.8, 13.8, 0.9);
    // takeaway glass bar (EO 13.0-13.5) settles and resolves
    frost(12.95, 0, 0.7);
    ['E5', 'A5'].forEach((n, i) => chime(13.35 + i * 0.09, n, 0.6 - i * 0.12, (i - 0.5) * 0.3, 1.4));
    k.tone(13.35, { f: 'A2', type: 'triangle', dur: 1.2, gain: 0.12, a: 0.02 });
  }

  registerStyle({
    id: 'glassmorphism',
    name: 'Glassmorphism UI',
    category: 'Dimensional',
    description: 'Frosted-glass UI: translucent panels that genuinely blur the vivid gradient blobs and orbs behind them, with 1px light borders, a diagonal specular sheen, fine frost grain and crisp Inter type.',
    motion: 'Color blobs bloom up under the glass, the frosted card rises in, then the chat plays out (user bubble pops, the AI reply types itself line by line) while stat chips float in glass-over-glass and their ring and sparkline draw on; blobs keep drifting so the frost shimmers.',
    duration: 5,
    fonts: ['800 60px "Inter"', '700 20px "Inter"', '600 18px "Inter"', '600 15px "Inter"', '400 15px "Inter"', '400 18px "Inter"', '800 22px "Inter"', '600 12px "Inter"'],
    frameT: 4.6,
    readsPixels: false,
    explainerDuration: 14.5,
    explainerNote: 'The camera glides and zooms across one big frosted dashboard (data feed → network card → output chat → accuracy chart → pull back) while the live colour blobs drift behind, so every panel re-frosts as it moves; connectors are glowing gradient lines with travelling light dots, labels are glass pills, numbers count in big Inter 800.',
    explainer: glassExplainer,
    explainerSound: glassSound,
    draw(ctx, W, H_, t) {
      // ---------- background: vivid blobs + a few crisp orbs (so the frost has something to blur) ----------
      const BG = H.layer(W, H_), b = BG.getContext('2d');
      const base = b.createLinearGradient(0, 0, W, H_);
      base.addColorStop(0, '#0c0a24'); base.addColorStop(1, '#170f3a');
      b.fillStyle = base; b.fillRect(0, 0, W, H_);
      const blob = (x, y, r, col, a = 1) => {
        const g = b.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, H.rgba(col, a)); g.addColorStop(0.5, H.rgba(col, a * 0.55)); g.addColorStop(1, H.rgba(col, 0));
        b.fillStyle = g; b.fillRect(x - r, y - r, r * 2, r * 2);
      };
      const d = (ph, a) => Math.sin(t * 0.5 + ph) * a;
      const ph = (a, b2) => H.clamp((t - a) / (b2 - a));
      const E = (a, b2) => H.ease.out(ph(a, b2));
      const typed = (str, a, b2) => str.slice(0, Math.round(str.length * ph(a, b2)));
      const bloom = (i) => 0.35 + 0.65 * H.ease.out(ph(i * 0.12, 0.9 + i * 0.12));
      blob(930 + d(0, 30), 230 + d(1, 20), 330 * bloom(0), '#ff2bd6', 0.95 * bloom(0));
      blob(1180 + d(2, 20), 600, 300 * bloom(1), '#ff7a1a', 0.95 * bloom(1));
      blob(620, 640 + d(3, 20), 320 * bloom(2), '#2b6bff', 0.9 * bloom(2));
      blob(260 + d(4, 30), 170, 330 * bloom(3), '#7a2bff', 0.85 * bloom(3));
      blob(120, 640, 250, '#00d1ff', 0.6);
      blob(760, 380, 200, '#ff4d6d', 0.5);
      // crisp orbs
      orb(b, 1090 + d(5, 10), 170, 118, '#ffd2f4', '#ff4fc1', '#6a1497');
      orb(b, 585, 575 + d(6, 8), 86, '#c7f2ff', '#3aa0ff', '#1a2a8a');
      orb(b, 1215, 520, 46, '#ffe3b8', '#ff8a2a', '#9a2f12');
      // ring
      b.save(); b.translate(780, 120); b.rotate(-0.4);
      const rg = b.createLinearGradient(-90, 0, 90, 0); rg.addColorStop(0, '#7af0ff'); rg.addColorStop(1, '#8a5bff');
      b.strokeStyle = rg; b.lineWidth = 22; b.beginPath(); b.ellipse(0, 0, 92, 40, 0, 0, 7); b.stroke(); b.restore();
      // faint grid
      b.strokeStyle = 'rgba(255,255,255,0.035)'; b.lineWidth = 1; b.beginPath();
      for (let x = 0; x <= W; x += 48) { b.moveTo(x + 0.5, 0); b.lineTo(x + 0.5, H_); }
      for (let y = 0; y <= H_; y += 48) { b.moveTo(0, y + 0.5); b.lineTo(W, y + 0.5); }
      b.stroke();
      ctx.drawImage(BG, 0, 0);
      let SRC = blurOf(BG, W, H_, 26);

      // ---------- left: headline ----------
      ctx.save(); ctx.globalAlpha = E(0.35, 0.7);
      glass(ctx, SRC, 80 - (1 - E(0.35, 0.8)) * 20, 196, 196, 34, 17, { shadow: 16, tint: 0.08 });
      ctx.fillStyle = '#b7f5ff'; ctx.beginPath(); ctx.arc(100, 213, 4 * (0.7 + 0.3 * Math.sin(t * 4)), 0, 7); ctx.fill();
      ctx.font = '600 12px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillText('NEW  ·  AI COPILOT 2.0', 114, 217.5);
      ctx.restore();
      // headline lines rise out of a mask, staggered
      const line = (str, y, a, fill, font) => {
        const e = E(a, a + 0.55); if (e <= 0) return;
        ctx.save(); ctx.beginPath(); ctx.rect(60, y - 62, 520, 76); ctx.clip();
        ctx.globalAlpha = e; ctx.font = font; ctx.fillStyle = fill; ctx.fillText(str, 76, y + (1 - e) * 64); ctx.restore();
      };
      line('Your AI', 300, 0.5, '#ffffff', '800 60px "Inter"');
      line('copilot,', 366, 0.62, '#ffffff', '800 60px "Inter"');
      const hg = ctx.createLinearGradient(76, 0, 400, 0); hg.addColorStop(0, '#ffffff'); hg.addColorStop(1, '#ffc6f0');
      line('always on.', 432, 0.74, hg, '800 60px "Inter"');
      ctx.save(); ctx.globalAlpha = E(1.05, 1.5); ctx.font = '400 18px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.68)';
      ctx.fillText('Answers, summaries and actions —', 78, 478 + (1 - E(1.05, 1.5)) * 10); ctx.fillText('right where you work.', 78, 504 + (1 - E(1.05, 1.5)) * 10);
      ctx.restore();

      // ---------- chat card (rises in, frosted) ----------
      const ce = E(0.55, 1.25);
      const cx = 650, cy = 96 + (1 - ce) * 50, cw = 470, ch = 520;
      ctx.save(); ctx.globalAlpha = ce;
      glass(ctx, SRC, cx, cy, cw, ch, 28, { tint: 0.09 });
      ctx.restore();
      // header
      ctx.save(); ctx.globalAlpha = E(1.0, 1.35);
      orb(ctx, cx + 44, cy + 46, 20, '#ffd6f5', '#ff4fc1', '#7a1fb0');
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.8; ctx.beginPath();
      const sx = cx + 44, sy = cy + 46; ctx.moveTo(sx, sy - 8); ctx.quadraticCurveTo(sx, sy, sx + 8, sy); ctx.quadraticCurveTo(sx, sy, sx, sy + 8); ctx.quadraticCurveTo(sx, sy, sx - 8, sy); ctx.quadraticCurveTo(sx, sy, sx, sy - 8); ctx.stroke();
      ctx.font = '600 15px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText('Nova', cx + 76, cy + 42);
      ctx.fillStyle = '#4dffa6'; ctx.beginPath(); ctx.arc(cx + 80, cy + 58, 3.5, 0, 7); ctx.fill();
      ctx.font = '400 12px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText('AI assistant · online', cx + 89, cy + 62);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(cx + cw - 54 + i * 8, cy + 46, 2, 0, 7); ctx.fill(); }
      ctx.restore();
      const dl = E(1.1, 1.6);
      if (dl > 0) { ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 24, cy + 88.5); ctx.lineTo(cx + 24 + (cw - 48) * dl, cy + 88.5); ctx.stroke(); }
      // user message pops from its tail corner
      {
        const bw = 262, bx = cx + cw - 24 - bw, by = cy + 112;
        const k = H.ease.back(ph(1.45, 1.85));
        if (k > 0) {
          ctx.save(); ctx.translate(bx + bw, by + 46); ctx.scale(k, k); ctx.translate(-(bx + bw), -(by + 46)); ctx.globalAlpha = Math.min(1, ph(1.45, 1.6));
          const ug = ctx.createLinearGradient(bx, by, bx + bw, by + 46);
          ug.addColorStop(0, '#8a5bff'); ug.addColorStop(1, '#ff4fc1');
          ctx.save(); ctx.shadowColor = 'rgba(255,60,200,0.35)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
          ctx.fillStyle = ug; ctx.beginPath(); ctx.roundRect(bx, by, bw, 46, [18, 18, 4, 18]); ctx.fill(); ctx.restore();
          ctx.font = '400 15px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText("Summarize today's sales call", bx + 18, by + 28);
          ctx.restore();
          ctx.save(); ctx.globalAlpha = E(1.8, 2.1); ctx.font = '400 11px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText('9:41', cx + cw - 52, by + 64); ctx.restore();
        }
      }
      // AI reply: bubble grows from its tail corner, then types line by line
      {
        const bx = cx + 24, by = cy + 192, bw = 340, bh = 156;
        const k = H.ease.back(ph(1.95, 2.35));
        if (k > 0) {
          ctx.save(); ctx.translate(bx, by + bh); ctx.scale(k, k); ctx.translate(-bx, -(by + bh)); ctx.globalAlpha = Math.min(1, ph(1.95, 2.1));
          ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, [18, 18, 18, 4]); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(bx + 0.5, by + 0.5, bw - 1, bh - 1, [18, 18, 18, 4]); ctx.stroke();
          ctx.restore();
          ctx.font = '400 15px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText(typed('Here are the 3 key takeaways:', 2.25, 2.65), bx + 18, by + 32);
          const items = [['Budget approved for Q3', '#4dffa6'], ['Pilot starts next Monday', '#7ad7ff'], ['Security review needed', '#ffb35c']];
          items.forEach(([txt, c], i) => {
            const a0 = 2.7 + i * 0.32;
            const e = E(a0, a0 + 0.25); if (e <= 0) return;
            const yy = by + 66 + i * 34;
            ctx.save(); ctx.globalAlpha = e;
            ctx.fillStyle = H.rgba(c, 0.18); ctx.beginPath(); ctx.roundRect(bx + 18, yy - 15, 22, 22, 7); ctx.fill();
            ctx.font = '600 12px "Inter"'; ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), bx + 29, yy); ctx.textAlign = 'left';
            ctx.restore();
            ctx.font = '400 14px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.fillText(typed(txt, a0 + 0.05, a0 + 0.3), bx + 52, yy);
          });
        }
      }
      // typing indicator: Nova is "thinking" before the reply, then again after it
      {
        const bx = cx + 24;
        const before = t > 1.7 && t < 1.98, after = t > 3.75;
        if (before || after) {
          const by = before ? cy + 192 : cy + 364;
          ctx.save(); ctx.globalAlpha = before ? 1 : E(3.75, 3.95);
          ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.beginPath(); ctx.roundRect(bx, by, 64, 30, 15); ctx.fill();
          for (let i = 0; i < 3; i++) {
            const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - i * 0.9));
            ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.arc(bx + 20 + i * 12, by + 15, 3.2, 0, 7); ctx.fill();
          }
          ctx.restore();
        }
      }
      // input field
      {
        const ix = cx + 20, iy = cy + ch - 74, iw = cw - 40, ih = 52;
        ctx.save(); ctx.globalAlpha = E(1.15, 1.5);
        ctx.fillStyle = 'rgba(10,6,40,0.22)'; ctx.beginPath(); ctx.roundRect(ix, iy, iw, ih, 26); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.roundRect(ix + 0.5, iy + 0.5, iw - 1, ih - 1, 26); ctx.stroke();
        ctx.font = '400 15px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillText('Ask Nova anything…', ix + 22, iy + 31);
        if (Math.sin(t * 6) > 0) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(ix + 21, iy + 17, 1.5, 19); }
        const g = ctx.createLinearGradient(ix + iw - 46, iy, ix + iw - 6, iy + ih);
        g.addColorStop(0, '#ff7a1a'); g.addColorStop(1, '#ff2bd6');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ix + iw - 26, iy + 26, 19, 0, 7); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(ix + iw - 26, iy + 34); ctx.lineTo(ix + iw - 26, iy + 18); ctx.moveTo(ix + iw - 33, iy + 25); ctx.lineTo(ix + iw - 26, iy + 18); ctx.lineTo(ix + iw - 19, iy + 25); ctx.stroke();
        ctx.restore();
      }

      // ---------- stat chips: glass over glass (re-blur the composited frame), floating in ----------
      SRC = blurOf(ctx.canvas, W, H_, 18);
      const chip = (a0, dx, dy, fn) => {
        const e = E(a0, a0 + 0.6); if (e <= 0) return;
        ctx.save(); ctx.globalAlpha = Math.min(1, ph(a0, a0 + 0.3)); fn((1 - e) * dx, (1 - e) * dy); ctx.restore();
      };
      // chip 1: speed
      chip(2.25, -40, 0, (ox, oy) => {
        const x = 570 + ox, y = 180 + d(1, 4) + oy, w = 168, h = 64;
        glass(ctx, SRC, x, y, w, h, 18, { shadow: 34, tint: 0.12 });
        const g = ctx.createLinearGradient(x + 14, y + 14, x + 50, y + 50); g.addColorStop(0, '#ffcf5c'); g.addColorStop(1, '#ff7a1a');
        ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x + 14, y + 14, 36, 36, 11); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x + 34, y + 20); ctx.lineTo(x + 24, y + 34); ctx.lineTo(x + 31, y + 34); ctx.lineTo(x + 28, y + 44); ctx.lineTo(x + 39, y + 29); ctx.lineTo(x + 32, y + 29); ctx.closePath(); ctx.fill();
        ctx.font = '800 22px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText((2.4 * E(2.3, 3.0)).toFixed(1) + '×', x + 62, y + 34);
        ctx.font = '400 12px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText('faster replies', x + 62, y + 51);
      });
      // chip 2: accuracy ring
      chip(2.55, 40, 0, (ox, oy) => {
        const x = 1018 + ox, y = 356 + d(2, 4) + oy, w = 196, h = 76;
        glass(ctx, SRC, x, y, w, h, 20, { shadow: 34, tint: 0.12 });
        const c = [x + 40, y + 38];
        const rp = H.ease.inOut(ph(2.7, 3.6));
        ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(c[0], c[1], 21, 0, 7); ctx.stroke();
        const g = ctx.createLinearGradient(c[0] - 20, c[1] - 20, c[0] + 20, c[1] + 20); g.addColorStop(0, '#4dffa6'); g.addColorStop(1, '#00d1ff');
        if (rp > 0) { ctx.strokeStyle = g; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(c[0], c[1], 21, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.986 * rp); ctx.stroke(); }
        ctx.font = '800 22px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText((98.6 * rp).toFixed(1) + '%', x + 76, y + 40);
        ctx.font = '400 12px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText('answer accuracy', x + 76, y + 58);
      });
      // chip 3: sparkline
      chip(2.85, 0, 40, (ox, oy) => {
        const x = 556 + ox, y = 586 + d(3, 4) + oy, w = 190, h = 92;
        glass(ctx, SRC, x, y, w, h, 20, { shadow: 34, tint: 0.12 });
        ctx.font = '400 12px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText('Tokens / sec', x + 16, y + 26);
        ctx.font = '800 22px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText('12.8k', x + 16, y + 52);
        ctx.font = '600 12px "Inter"'; ctx.fillStyle = '#4dffa6'; ctx.fillText('▲ 18%', x + 82, y + 51);
        const pts = []; const sr = H.rng(4);
        for (let i = 0; i <= 12; i++) pts.push([x + 16 + i * 13.2, y + 80 - (i * 1.4 + sr() * 8 + Math.sin(i * 0.8 + t) * 2)]);
        const sp = H.ease.inOut(ph(3.0, 3.7)), n = Math.max(1, Math.round(12 * sp));
        const vis = pts.slice(0, n + 1);
        if (sp > 0) {
          const ag = ctx.createLinearGradient(0, y + 50, 0, y + 86); ag.addColorStop(0, 'rgba(77,255,166,0.35)'); ag.addColorStop(1, 'rgba(77,255,166,0)');
          ctx.fillStyle = ag; ctx.beginPath(); ctx.moveTo(vis[0][0], y + 86); vis.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(vis[vis.length - 1][0], y + 86); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#4dffa6'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.beginPath(); vis.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
          const lp = vis[vis.length - 1]; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lp[0], lp[1], 3.5, 0, 7); ctx.fill();
        }
      });
    },
  });
}
