{
  // ---------- 1940s film noir still ----------
  const BAR = 54;

  function detectivePath(x) {
    // standing figure facing left; fedora, profile, turned-up collar, trench coat
    x.beginPath();
    x.moveTo(700, 720);
    x.bezierCurveTo(706, 560, 716, 470, 742, 420);   // coat front (left) edge
    x.bezierCurveTo(756, 392, 770, 372, 778, 352);   // lapel to collar
    x.lineTo(770, 334);                               // collar point
    x.bezierCurveTo(772, 322, 776, 312, 780, 304);   // chin underside
    x.lineTo(772, 300); x.lineTo(770, 292);           // chin
    x.lineTo(764, 284); x.lineTo(766, 276);           // lips
    x.lineTo(758, 264); x.lineTo(764, 258);           // nose tip -> under nose
    x.bezierCurveTo(766, 248, 770, 240, 772, 232);   // brow
    x.lineTo(730, 226);                               // hat brim front (tilted down)
    x.bezierCurveTo(728, 220, 740, 214, 772, 212);
    x.bezierCurveTo(776, 190, 786, 168, 812, 160);   // crown front
    x.bezierCurveTo(828, 156, 848, 160, 862, 158);   // pinch
    x.bezierCurveTo(880, 164, 888, 190, 890, 206);
    x.bezierCurveTo(912, 208, 934, 214, 938, 222);   // brim back
    x.bezierCurveTo(918, 230, 896, 230, 880, 230);
    x.bezierCurveTo(878, 260, 872, 290, 868, 306);   // back of head / neck
    x.bezierCurveTo(886, 318, 900, 322, 910, 330);   // collar back
    x.bezierCurveTo(960, 344, 1000, 366, 1018, 410); // shoulder
    x.bezierCurveTo(1036, 470, 1044, 580, 1050, 720);
    x.closePath();
  }
  function armPath(x) {
    // forearm raised, hand holding cigarette near chest
    x.beginPath();
    x.moveTo(820, 470);
    x.bezierCurveTo(790, 480, 760, 476, 735, 462);
    x.bezierCurveTo(720, 456, 712, 446, 716, 436);
    x.bezierCurveTo(722, 428, 736, 430, 746, 436);
    x.bezierCurveTo(770, 446, 800, 444, 830, 432);
    x.closePath();
  }

  // ================= EXPLAINER: a 1940s newsreel / B-picture montage =================
  let corkTex = null;
  function getCork(W, Hh) {
    if (corkTex) return corkTex;
    const c = H.layer(W, Hh), x = c.getContext('2d'), img = x.createImageData(W, Hh), d = img.data, R = H.rng(1212), nz = H.makeNoise(1213);
    for (let y = 0; y < Hh; y++) for (let xx = 0; xx < W; xx++) {
      const v = 112 + nz.n2(xx * 0.02, y * 0.02) * 16 + (R() - 0.5) * 46 + (R() < 0.04 ? -40 : 0);
      const i = (y * W + xx) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    x.putImageData(img, 0, 0); return (corkTex = c);
  }
  const gy = (v, a = 1) => `rgba(${v},${v},${v},${a})`;
  // painted plaster (mean ~128, used through 'overlay' so it adds material without shifting exposure); half-res, cached
  let plasterTex = null, hazeTex = null;
  function getPlaster(W, Hh) {
    if (plasterTex && plasterTex.width === W && plasterTex.height === Hh) return plasterTex;
    const w = W >> 1, h = Hh >> 1, s = H.layer(w, h), x = s.getContext('2d'), img = x.createImageData(w, h), d = img.data, R = H.rng(1331), nz = H.makeNoise(1332);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
      const v = 128 + nz.fbm2(xx * 0.018, y * 0.018, 3) * 30 + nz.n2(xx * 0.16, y * 0.16) * 8 + (R() - 0.5) * 12;
      const i = (y * w + xx) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    const c = H.layer(W, Hh); c.getContext('2d').drawImage(s, 0, 0, W, Hh); return (plasterTex = c);
  }
  // hanging cigarette-smoke strata (white, alpha = density); half-res, cached
  function getHaze(W, Hh) {
    if (hazeTex && hazeTex.width === (W >> 1) && hazeTex.height === (Hh >> 1)) return hazeTex;
    const w = W >> 1, h = Hh >> 1, s = H.layer(w, h), x = s.getContext('2d'), img = x.createImageData(w, h), d = img.data, nz = H.makeNoise(1414);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
      const q = nz.n2(xx * 0.004, y * 0.01) * 1.6;
      const v = nz.fbm2(xx * 0.007 + q, y * 0.02, 4);
      const i = (y * w + xx) * 4; d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = H.clamp((v + 0.15) * 1.5) * 255;
    }
    x.putImageData(img, 0, 0); return (hazeTex = s);
  }
  // venetian-blind light: same slat geometry as before (34 px period, 17 px gaps, slope 0.5), drawn at half res with a
  // real penumbra blur, a soft window-frame edge and an optional mullion shadow. bg/color allow a multiply shadow pass.
  function slats(W, Hh, o) {
    const w = W >> 1, h = Hh >> 1, l = H.layer(w, h), x = l.getContext('2d');
    const x0 = o.x0, sw = o.sway || 0, X1 = W + 200, dy = (X1 - x0) * 0.5;
    if (o.bg) { x.fillStyle = o.bg; x.fillRect(0, 0, w, h); }
    x.save(); x.filter = `blur(${(o.blur || 3) / 2}px)`; x.scale(0.5, 0.5); x.globalAlpha = o.alpha; x.fillStyle = o.color || '#fff';
    x.beginPath();
    for (let k = -10; k < 48; k++) { const y = k * 34 + sw; x.moveTo(x0, y); x.lineTo(X1, y - dy); x.lineTo(X1, y - dy + 17); x.lineTo(x0, y + 17); x.closePath(); }
    x.fill();
    if (o.mullion) { const [mx, ms] = o.mullion; x.globalAlpha = o.bg ? Math.min(1, o.alpha * 1.4) : 1; x.globalCompositeOperation = o.bg ? 'source-over' : 'destination-out'; x.strokeStyle = o.bg ? (o.color || '#000') : '#000'; x.lineWidth = 9;
      x.beginPath(); x.moveTo(mx - 60 * ms, -60); x.lineTo(mx + (Hh + 60) * ms, Hh + 60); x.stroke(); }
    x.restore();
    if (!o.bg && o.edge) { // window-frame penumbra on the leading edge, light strongest deep in the patch
      x.save(); x.globalCompositeOperation = 'destination-in'; x.scale(0.5, 0.5);
      const g = x.createLinearGradient(x0 - 30, 0, x0 + o.edge, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
      x.fillStyle = g; x.fillRect(0, 0, W, Hh); x.restore();
    }
    return l;
  }
  function face(c, kind, cx, cy, s) {
    const gr = c.createRadialGradient(cx - s * 0.3, cy - s * 0.3, s * 0.1, cx, cy, s * 1.1);
    gr.addColorStop(0, gy(238)); gr.addColorStop(1, gy(118));
    c.fillStyle = gr; c.beginPath();
    if (kind === 'cat') {
      c.ellipse(cx, cy + s * 0.08, s * 0.95, s * 0.8, 0, 0, 7); c.fill();
      c.beginPath(); c.moveTo(cx - s * 0.9, cy - s * 0.2); c.lineTo(cx - s * 0.78, cy - s * 1.05); c.lineTo(cx - s * 0.3, cy - s * 0.65); c.fill();
      c.beginPath(); c.moveTo(cx + s * 0.9, cy - s * 0.2); c.lineTo(cx + s * 0.78, cy - s * 1.05); c.lineTo(cx + s * 0.3, cy - s * 0.65); c.fill();
      c.fillStyle = gy(20); c.beginPath(); c.ellipse(cx - s * 0.36, cy - s * 0.05, s * 0.14, s * 0.11, 0, 0, 7); c.ellipse(cx + s * 0.36, cy - s * 0.05, s * 0.14, s * 0.11, 0, 0, 7); c.fill();
      c.beginPath(); c.moveTo(cx - s * 0.1, cy + s * 0.18); c.lineTo(cx + s * 0.1, cy + s * 0.18); c.lineTo(cx, cy + s * 0.3); c.fill();
      c.strokeStyle = gy(235); c.lineWidth = 1.5; [-1, 1].forEach((sd) => { for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(cx + sd * s * 0.3, cy + s * 0.3 + k * 4); c.lineTo(cx + sd * s * 1.05, cy + s * 0.2 + k * 10); c.stroke(); } });
    } else {
      c.ellipse(cx, cy, s * 0.72, s * 0.88, 0, 0, 7); c.fill();
      c.fillStyle = gy(60); c.beginPath(); c.ellipse(cx - s * 0.8, cy - s * 0.05, s * 0.28, s * 0.62, 0.25, 0, 7); c.ellipse(cx + s * 0.8, cy - s * 0.05, s * 0.28, s * 0.62, -0.25, 0, 7); c.fill();
      c.fillStyle = gy(215); c.beginPath(); c.ellipse(cx, cy + s * 0.42, s * 0.36, s * 0.28, 0, 0, 7); c.fill();
      c.fillStyle = gy(20); c.beginPath(); c.ellipse(cx - s * 0.28, cy - s * 0.2, s * 0.1, s * 0.1, 0, 0, 7); c.ellipse(cx + s * 0.28, cy - s * 0.2, s * 0.1, s * 0.1, 0, 0, 7); c.fill();
      c.beginPath(); c.ellipse(cx, cy + s * 0.3, s * 0.14, s * 0.09, 0, 0, 7); c.fill();
    }
  }
  function mugshot(c, x, y, w, kind, num, rot = 0) {
    const h = w * 1.25; c.save(); c.translate(x, y); c.rotate(rot);
    // soft cast shadow on the board (key light from upper left)
    c.save(); c.shadowColor = 'rgba(0,0,0,0.65)'; c.shadowBlur = 14; c.shadowOffsetX = 8; c.shadowOffsetY = 10;
    c.fillStyle = gy(230); c.fillRect(-w / 2, -h / 2, w, h); c.restore();
    const pg = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); pg.addColorStop(0, gy(248)); pg.addColorStop(1, gy(205));
    c.fillStyle = pg; c.fillRect(-w / 2, -h / 2, w, h);                             // glossy print border
    const bg = c.createLinearGradient(0, -h / 2, 0, h / 2); bg.addColorStop(0, gy(150)); bg.addColorStop(1, gy(82));
    c.fillStyle = bg; c.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);           // studio backdrop, top-lit
    c.strokeStyle = gy(95, 0.8); c.lineWidth = 1; for (let k = 1; k < 6; k++) { c.beginPath(); c.moveTo(-w / 2 + 8, -h / 2 + 8 + k * (h - 16) / 6); c.lineTo(w / 2 - 8, -h / 2 + 8 + k * (h - 16) / 6); c.stroke(); }
    face(c, kind, 0, -h * 0.1, w * 0.26);
    c.fillStyle = gy(22); c.fillRect(-w * 0.36, h * 0.18, w * 0.72, h * 0.22);          // booking placard
    c.fillStyle = gy(70); c.fillRect(-w * 0.36, h * 0.18, w * 0.72, 2);
    c.fillStyle = gy(235); c.textAlign = 'center'; c.font = `700 ${Math.max(24, Math.round(w * 0.2))}px "Oswald"`; c.fillText(kind.toUpperCase(), 0, h * 0.3);
    c.font = `400 ${Math.round(w * 0.08)}px "Courier Prime"`; c.fillText('No. ' + num, 0, h * 0.37);
    c.strokeStyle = gy(60, 0.5); c.lineWidth = 1; c.strokeRect(-w / 2 + 8.5, -h / 2 + 8.5, w - 17, h - 17);
    // curled bottom-right corner lifting off the board
    const cs = w * 0.17, ex = w / 2, ey = h / 2;
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.moveTo(ex - cs, ey); c.lineTo(ex, ey - cs); c.lineTo(ex + 3, ey + 4); c.fill();
    const cg = c.createLinearGradient(ex - cs, ey - cs, ex - cs * 0.4, ey - cs * 0.4); cg.addColorStop(0, gy(255)); cg.addColorStop(1, gy(170));
    c.fillStyle = cg; c.beginPath(); c.moveTo(ex - cs, ey); c.lineTo(ex, ey - cs); c.quadraticCurveTo(ex - cs * 0.55, ey - cs * 0.55, ex - cs * 0.82, ey - cs * 0.82); c.closePath(); c.fill();
    // push pin
    c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.arc(3, -h / 2 + 8, 5.5, 0, 7); c.fill();
    const pn = c.createRadialGradient(-2, -h / 2 + 2, 0.5, 0, -h / 2 + 4, 6); pn.addColorStop(0, gy(245)); pn.addColorStop(0.4, gy(120)); pn.addColorStop(1, gy(30));
    c.fillStyle = pn; c.beginPath(); c.arc(0, -h / 2 + 4, 6, 0, 7); c.fill();
    c.restore();
  }
  function machine(c, x, y, s, dials, lampT, label = true, shadow = true) {
    c.save(); c.translate(x, y); c.scale(s, s);
    // sheet-metal cabinet lit from above, with a soft cast shadow
    const cab = c.createLinearGradient(0, -210, 0, 210); cab.addColorStop(0, gy(118)); cab.addColorStop(0.55, gy(70)); cab.addColorStop(1, gy(35));
    c.save(); if (shadow) { c.shadowColor = 'rgba(0,0,0,0.65)'; c.shadowBlur = 14; c.shadowOffsetX = 8; c.shadowOffsetY = 10; }
    c.fillStyle = cab; c.fillRect(-170, -210, 340, 420); c.restore();
    c.fillStyle = gy(185); c.fillRect(-170, -210, 340, 2.5); c.fillStyle = gy(150); c.fillRect(-170, -210, 2.5, 420);   // bevel: lit top/left
    c.fillStyle = gy(14); c.fillRect(-170, 207.5, 340, 2.5); c.fillRect(167.5, -210, 2.5, 420);                     // dark bottom/right
    const pnl = c.createLinearGradient(0, -190, 0, 190); pnl.addColorStop(0, gy(60)); pnl.addColorStop(1, gy(26));
    c.fillStyle = pnl; c.fillRect(-150, -190, 300, 380);
    c.fillStyle = gy(12); c.fillRect(-150, -190, 300, 2.5); c.fillRect(-150, -190, 2.5, 380);                      // recessed panel
    c.fillStyle = gy(120); c.fillRect(-150, 187.5, 300, 2.5); c.fillRect(147.5, -190, 2.5, 380);
    for (const [rx, ry] of [[-160, -200], [160, -200], [-160, 200], [160, 200], [-160, 0], [160, 0]]) {         // rivets
      c.fillStyle = gy(12, 0.8); c.beginPath(); c.arc(rx + 1.2, ry + 1.5, 3.6, 0, 7); c.fill();
      const rg = c.createRadialGradient(rx - 1.2, ry - 1.2, 0.3, rx, ry, 3.6); rg.addColorStop(0, gy(235)); rg.addColorStop(1, gy(75));
      c.fillStyle = rg; c.beginPath(); c.arc(rx, ry, 3.4, 0, 7); c.fill();
    }
    for (let i = 0; i < 2; i++) { const rx = -70 + i * 140, ry = -120;
      const mg = c.createRadialGradient(rx - 16, ry - 18, 4, rx, ry, 48); mg.addColorStop(0, gy(232)); mg.addColorStop(0.6, gy(160)); mg.addColorStop(1, gy(92));
      c.fillStyle = gy(15); c.beginPath(); c.arc(rx + 2, ry + 3, 48, 0, 7); c.fill();
      c.fillStyle = mg; c.beginPath(); c.arc(rx, ry, 46, 0, 7); c.fill();
      c.strokeStyle = gy(60); c.lineWidth = 2; c.beginPath(); c.arc(rx, ry, 34, 0, 7); c.stroke();
      c.strokeStyle = gy(38); c.lineWidth = 6; c.lineCap = 'round'; for (let k = 0; k < 3; k++) { const a = lampT * 3 + k * 2.09 + i; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx + Math.cos(a) * 40, ry + Math.sin(a) * 40); c.stroke(); }
      c.lineCap = 'butt'; c.fillStyle = gy(40); c.beginPath(); c.arc(rx, ry, 12, 0, 7); c.fill();
      c.fillStyle = gy(200); c.beginPath(); c.arc(rx - 3, ry - 3, 3, 0, 7); c.fill(); }
    for (let k = 0; k < 8; k++) { const on = Math.sin(lampT * 5 + k * 1.9) > 0.2, lx = -112 + k * 32, ly = -38;
      c.fillStyle = gy(10); c.beginPath(); c.arc(lx, ly, 10.5, 0, 7); c.fill();
      if (on) { const lg = c.createRadialGradient(lx, ly, 1, lx, ly, 20); lg.addColorStop(0, gy(255)); lg.addColorStop(0.4, gy(245, 0.95)); lg.addColorStop(0.42, gy(220, 0.35)); lg.addColorStop(1, gy(200, 0));
        c.fillStyle = lg; c.beginPath(); c.arc(lx, ly, 20, 0, 7); c.fill(); }
      else { c.fillStyle = gy(78); c.beginPath(); c.arc(lx, ly, 8, 0, 7); c.fill(); c.fillStyle = gy(150, 0.7); c.beginPath(); c.arc(lx - 2.5, ly - 2.5, 2, 0, 7); c.fill(); } }
    dials.forEach((a, i) => { const dx = -95 + i * 95, dy = 40;
      c.fillStyle = gy(12); c.beginPath(); c.arc(dx + 2, dy + 3, 40, 0, 7); c.fill();
      const bz = c.createLinearGradient(dx, dy - 40, dx, dy + 40); bz.addColorStop(0, gy(200)); bz.addColorStop(1, gy(55));
      c.fillStyle = bz; c.beginPath(); c.arc(dx, dy, 40, 0, 7); c.fill();                                      // chrome bezel
      const fg = c.createRadialGradient(dx - 10, dy - 12, 4, dx, dy, 36); fg.addColorStop(0, gy(245)); fg.addColorStop(1, gy(168));
      c.fillStyle = fg; c.beginPath(); c.arc(dx, dy, 36, 0, 7); c.fill();
      c.strokeStyle = gy(40); c.lineWidth = 2;
      for (let k = 0; k < 10; k++) { const b = -2.4 + k * 0.53; c.beginPath(); c.moveTo(dx + Math.cos(b) * 28, dy + Math.sin(b) * 28); c.lineTo(dx + Math.cos(b) * 34, dy + Math.sin(b) * 34); c.stroke(); }
      c.strokeStyle = gy(20, 0.35); c.lineWidth = 5; c.beginPath(); c.moveTo(dx + 2, dy + 3); c.lineTo(dx + 2 + Math.cos(a) * 28, dy + 3 + Math.sin(a) * 28); c.stroke();   // needle shadow
      c.strokeStyle = gy(30); c.beginPath(); c.moveTo(dx, dy); c.lineTo(dx + Math.cos(a) * 28, dy + Math.sin(a) * 28); c.stroke(); c.fillStyle = gy(30); c.beginPath(); c.arc(dx, dy, 6, 0, 7); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.arc(dx, dy, 29, -2.7, -1.75); c.stroke(); c.lineCap = 'butt';   // glass glint
    });
    c.fillStyle = gy(8); c.fillRect(-90, 120, 180, 14); c.fillStyle = gy(130); c.fillRect(-90, 134, 180, 2); // tape slot with lit lip
    if (label) { const lp = c.createLinearGradient(0, 150, 0, 184); lp.addColorStop(0, gy(228)); lp.addColorStop(1, gy(170));
      c.fillStyle = gy(10, 0.6); c.fillRect(-108, 153, 220, 34);
      c.fillStyle = lp; c.fillRect(-110, 150, 220, 34); c.fillStyle = gy(80); c.beginPath(); c.arc(-102, 167, 2.5, 0, 7); c.arc(102, 167, 2.5, 0, 7); c.fill();
      c.fillStyle = gy(20); c.font = '700 24px "Oswald"'; c.textAlign = 'center'; c.fillText('THE MACHINE', 0, 176); }
    c.restore();
  }
  function blindsOverlay(c, W, Hh, x0, alpha, sway) {
    c.save(); c.globalCompositeOperation = 'screen';
    for (let k = -10; k < 30; k++) {
      const y = k * 34 + sway; c.fillStyle = `rgba(255,255,255,${alpha})`;
      c.beginPath(); c.moveTo(x0, y); c.lineTo(W + 200, y - (W + 200 - x0) * 0.5); c.lineTo(W + 200, y - (W + 200 - x0) * 0.5 + 17); c.lineTo(x0, y + 17); c.fill();
    }
    c.restore();
  }
  let htPat = null;
  function halftone(c) {
    if (htPat) return htPat;
    const p = H.layer(6, 12), x = p.getContext('2d'); x.fillStyle = 'rgba(0,0,0,0.16)';
    for (const [px, py] of [[0, 0], [6, 0], [0, 12], [6, 12], [3, 6]]) { x.beginPath(); x.arc(px, py, 1.5, 0, 7); x.fill(); }
    return (htPat = c.createPattern(p, 'repeat'));
  }
  function newspaper(c, cx, cy, sc, rot, head, sub) {
    c.save(); c.translate(cx, cy); c.rotate(rot); c.scale(sc, sc);
    c.fillStyle = 'rgba(0,0,0,0.1)'; for (let k = 8; k >= 0; k--) { const g = k * 2.5; c.fillRect(-380 + 12 - g, -240 + 18 - g, 760 + 2 * g, 480 + 2 * g); } // soft drop shadow
    const np = c.createLinearGradient(-380, -240, 380, 240); np.addColorStop(0, gy(240)); np.addColorStop(0.5, gy(224)); np.addColorStop(1, gy(196));
    c.fillStyle = np; c.fillRect(-380, -240, 760, 480);
    // centre fold: shaded valley with a lit ridge
    const fd = c.createLinearGradient(-30, 0, 30, 0); fd.addColorStop(0, 'rgba(0,0,0,0)'); fd.addColorStop(0.45, 'rgba(0,0,0,0.13)'); fd.addColorStop(0.55, 'rgba(255,255,255,0.18)'); fd.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = fd; c.fillRect(-30, -240, 60, 480);
    c.fillStyle = gy(25); c.textAlign = 'center'; c.font = '400 54px "UnifrakturMaguntia"'; c.fillText('The Daily Circuit', 0, -182);
    c.fillRect(-360, -168, 720, 3); c.fillRect(-360, -160, 720, 1);
    c.font = '400 14px "Courier Prime"'; c.fillText('LATE CITY EDITION  ★  FIVE CENTS', 0, -146);
    c.font = '400 76px "Anton"'; c.fillText(head, 0, -66);
    c.font = 'italic 400 26px "Playfair Display"'; c.fillText(sub, 0, -28);
    const ph = c.createRadialGradient(-250, 40, 20, -210, 100, 230); ph.addColorStop(0, gy(190)); ph.addColorStop(1, gy(80));
    c.fillStyle = ph; c.fillRect(-360, -10, 300, 220);                                     // wire photo, flash-lit
    machine(c, -210, 100, 0.45, [-1, 0.2, 1.2], 0, false, false);
    c.fillStyle = halftone(c); c.fillRect(-360, -10, 300, 220);                           // coarse newsprint halftone c.strokeStyle = gy(40); c.lineWidth = 2; c.strokeRect(-360, -10, 300, 220);
    c.fillStyle = gy(110); for (let col = 0; col < 2; col++) for (let k = 0; k < 20; k++) c.fillRect(-40 + col * 210, -6 + k * 11, 190 - (k % 7 === 6 ? 80 : 0), 4);
    c.restore();
  }
  function odometer(c, x, y, value, digits, h) {
    const w = h * 0.62, bw = digits * (w + 4) + 12, bh = h + 16;
    c.save(); c.shadowColor = 'rgba(0,0,0,0.7)'; c.shadowBlur = 14; c.shadowOffsetX = 6; c.shadowOffsetY = 9;
    const bz = c.createLinearGradient(0, y - 8, 0, y - 8 + bh); bz.addColorStop(0, gy(92)); bz.addColorStop(0.5, gy(40)); bz.addColorStop(1, gy(18));
    c.fillStyle = bz; c.fillRect(x - 8, y - 8, bw, bh); c.restore();                       // enamelled counter housing
    c.fillStyle = gy(170); c.fillRect(x - 8, y - 8, bw, 2); c.fillStyle = gy(8); c.fillRect(x - 8, y + h + 6, bw, 2);
    c.fillStyle = gy(8); c.fillRect(x - 2, y - 2, bw - 12, h + 4);
    for (let k = 0; k < digits; k++) {
      const place = Math.pow(10, digits - 1 - k), v = value / place, d = Math.floor(v) % 10, fr = digits - 1 - k === 0 ? v % 1 : (value % place) / place > 0.9 ? ((value % place) / place - 0.9) * 10 : 0;
      const wx = x + k * (w + 4);
      c.save(); c.beginPath(); c.rect(wx, y, w, h); c.clip();
      const g2 = c.createLinearGradient(0, y, 0, y + h); g2.addColorStop(0, gy(120)); g2.addColorStop(0.5, gy(240)); g2.addColorStop(1, gy(120));
      c.fillStyle = g2; c.fillRect(wx, y, w, h);
      c.fillStyle = gy(20); c.font = `700 ${Math.round(h * 0.8)}px "Courier Prime"`; c.textAlign = 'center';
      c.fillText(String(d), wx + w / 2, y + h * 0.78 - fr * h); c.fillText(String((d + 1) % 10), wx + w / 2, y + h * 1.78 - fr * h);
      c.restore();
    }
    // glass window over the drums: a lit band across the top, darkness under the housing lip
    const gl = c.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, 'rgba(0,0,0,0.35)'); gl.addColorStop(0.12, 'rgba(255,255,255,0.22)'); gl.addColorStop(0.3, 'rgba(255,255,255,0.04)'); gl.addColorStop(0.85, 'rgba(0,0,0,0)'); gl.addColorStop(1, 'rgba(0,0,0,0.3)');
    c.fillStyle = gl; c.fillRect(x, y, digits * (w + 4) - 4, h);
  }

  function noirExplainer(ctx, W, Hh, t) {
    const sm = H.smooth, E = H.ease, nz = H.makeNoise(46);
    const fr24 = Math.floor(t * 24), Rg = H.rng(7000 + fr24);
    const weaveX = nz.n2(t * 3.1, 0.3) * 2.2, weaveY = nz.n2(0.7, t * 2.7) * 2.8, flick = 1 + nz.n2(t * 9, 4.4) * 0.05;
    // newsreel lettering: white bold caps with black keyline
    const NR = (c, s, x, y, size, prog = 1, align = 'center') => { if (prog <= 0) return; c.save(); c.globalAlpha = Math.min(1, prog * 2); c.font = `700 ${size}px "Oswald"`; c.textAlign = align; c.lineJoin = 'round'; c.lineWidth = size * 0.16; c.strokeStyle = gy(0); c.strokeText(s, x, y); c.fillStyle = gy(250); c.fillText(s, x, y); c.restore(); };
    const NRarrow = (c, pts, prog) => { if (prog <= 0) return; const n = Math.max(1, Math.floor((pts.length - 1) * Math.min(1, prog)));
      for (const [col, lw] of [[gy(0), 13], [gy(250), 7]]) { c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.beginPath(); c.moveTo(...pts[0]); for (let i = 1; i <= n; i++) c.lineTo(...pts[i]); c.stroke(); }
      if (prog >= 1) { const e = pts[pts.length - 1], q = pts[pts.length - 3], a = Math.atan2(e[1] - q[1], e[0] - q[0]); for (const [col, grow] of [[gy(0), 5], [gy(250), 0]]) { c.fillStyle = col; c.beginPath(); c.moveTo(e[0] + Math.cos(a) * (14 + grow), e[1] + Math.sin(a) * (14 + grow)); c.lineTo(e[0] + Math.cos(a + 2.4) * (22 + grow), e[1] + Math.sin(a + 2.4) * (22 + grow)); c.lineTo(e[0] + Math.cos(a - 2.4) * (22 + grow), e[1] + Math.sin(a - 2.4) * (22 + grow)); c.fill(); } } };
    const Q = (x0, y0, qx, qy, x1, y1, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * qx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * qy + u * u * y1]; });

    // shared set-dressing: plaster grain, soft light pools, screened slat light, drifting smoke
    const tex = (c, a) => { c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = a; c.drawImage(getPlaster(W, Hh), 0, 0); c.restore(); };
    const pool = (c, x, y, rx, ry, a) => { c.save(); c.globalCompositeOperation = 'screen'; c.translate(x, y); c.scale(1, ry / rx);
      const g = c.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.5, `rgba(255,255,255,${a * 0.45})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(-rx, -rx, rx * 2, rx * 2); c.restore(); };
    const screenL = (c, l, a = 1) => { c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = a; c.drawImage(l, 0, 0, W, Hh); c.restore(); };
    const haze = (c, mask, a) => { // smoke strata, visible only where the light passes through it
      const w4 = W >> 2, h4 = Hh >> 2, hl = H.layer(w4, h4), hx = hl.getContext('2d');
      const hz = getHaze(W, Hh), off = (t * 4.5) % w4;
      hx.drawImage(hz, -off, 0, w4, h4); hx.drawImage(hz, w4 - off, 0, w4, h4);
      hx.globalCompositeOperation = 'destination-in'; hx.drawImage(mask, 0, 0, w4, h4);
      screenL(c, hl, a);
    };
    const figT = (c) => { c.translate(980, 0); c.scale(0.9, 0.9); c.translate(-760, 60); };

    const scenes = {
      hook(c) {
        c.fillStyle = gy(14); c.fillRect(0, 0, W, Hh);
        pool(c, 640, 380, 620, 420, 0.16);
        screenL(c, slats(W, Hh, { x0: 300, sway: t * 6, alpha: 0.2, blur: 7, edge: 180 })); tex(c, 0.7);
        const p = E.out(sm(0.15, 1.15, t));
        newspaper(c, 640, 360, 0.04 + 0.96 * p, (1 - p) * Math.PI * 5 - 0.04, 'HOW DOES AI LEARN?', 'Thinking machine baffles the experts');
      },
      data(c) {
        c.drawImage(getCork(W, Hh), 0, 0);
        const p = sm(2.7, 5.4, t), cnt = p >= 1 ? 1000000 : Math.pow(10, 6 * p);
        machine(c, 1010, 300, 0.95, [-1.2 + t * 0.4, 0.3 - t * 0.3, 1.1 + t * 0.2], t, true);
        const cards = [];
        for (let k = 0; k < 9; k++) { const t0 = 2.75 + k * 0.28; if (t < t0) continue; cards.push(k); }
        // red-string... in b&w: white string from each file to the machine
        cards.forEach((k) => { const x = 110 + (k % 3) * 175, y = 170 + Math.floor(k / 3) * 165; const sp = sm(2.75 + k * 0.28 + 0.1, 2.75 + k * 0.28 + 0.45, t);
          c.strokeStyle = gy(235, 0.85); c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 70); c.lineTo(H.lerp(x, 850, sp), H.lerp(y - 70, 300, sp)); c.stroke(); });
        cards.forEach((k) => { const t0 = 2.75 + k * 0.28, sl = E.out(sm(t0, t0 + 0.15, t)); const x = 110 + (k % 3) * 175, y = 170 + Math.floor(k / 3) * 165;
          c.save(); c.translate(x, y); c.scale(1.4 - 0.4 * sl, 1.4 - 0.4 * sl); mugshot(c, 0, 0, 120, k % 3 === 1 ? 'dog' : 'cat', 4400 + k * 37, Math.sin(k * 2.7) * 0.06); c.restore(); });
        // hard key light from a desk lamp, blind-slat shadows raked across the whole board (multiplied over everything)
        c.save(); c.globalCompositeOperation = 'multiply';
        const lamp = c.createRadialGradient(640, 200, 50, 640, 300, 760); lamp.addColorStop(0, gy(255)); lamp.addColorStop(0.4, gy(228)); lamp.addColorStop(0.75, gy(178)); lamp.addColorStop(1, gy(95));
        c.fillStyle = lamp; c.fillRect(0, 0, W, Hh);
        c.drawImage(slats(W, Hh, { x0: -200, sway: t * 3, alpha: 0.3, blur: 6, color: '#000', bg: '#fff', mullion: [560, 0.55] }), 0, 0, W, Hh);
        c.restore();
        pool(c, 620, 230, 430, 330, 0.3);
        odometer(c, 838, 556, Math.round(cnt), 7, 72);
        NR(c, 'EXAMPLES', 1010, 545, 30, sm(3.0, 3.3, t));
        NR(c, '→ FED TO THE MACHINE', 640, 110, 34, sm(3.2, 3.5, t));
      },
      loop(c, zoom) {
        c.fillStyle = gy(10); c.fillRect(0, 0, W, Hh);
        pool(c, 640, 360, 640, 420, 0.07);                                        // faint spill on the back wall
        // hanging lamp: a volumetric beam through smoky air, brightest at the shade, fading toward the floor
        const cl = H.layer(W >> 2, Hh >> 2), cx = cl.getContext('2d'); cx.scale(0.25, 0.25); cx.filter = 'blur(4.5px)';
        const vg = cx.createLinearGradient(0, 54, 0, 720); vg.addColorStop(0, 'rgba(255,255,255,0.7)'); vg.addColorStop(0.35, 'rgba(255,255,255,0.32)'); vg.addColorStop(1, 'rgba(255,255,255,0.1)');
        cx.fillStyle = vg; cx.beginPath(); cx.moveTo(600, 54); cx.lineTo(680, 54); cx.lineTo(1250, 720); cx.lineTo(30, 720); cx.fill();
        cx.filter = 'none'; const core = cx.createRadialGradient(640, 60, 10, 640, 200, 260); core.addColorStop(0, 'rgba(255,255,255,0.45)'); core.addColorStop(1, 'rgba(255,255,255,0)');
        cx.globalCompositeOperation = 'source-atop'; cx.fillStyle = core; cx.fillRect(0, 0, W, Hh);
        screenL(c, cl, 0.75); haze(c, cl, 0.5); tex(c, 0.6);
        // table: lit front edge, top falling off into darkness, an elliptical pool of lamplight
        const tg = c.createLinearGradient(0, 560, 0, 720); tg.addColorStop(0, gy(58)); tg.addColorStop(1, gy(12));
        c.fillStyle = tg; c.fillRect(0, 560, W, 160);
        c.fillStyle = gy(150); c.fillRect(0, 556, W, 3); c.fillStyle = gy(70); c.fillRect(0, 559, W, 3);
        pool(c, 640, 600, 470, 70, 0.42);
        // the lamp shade itself, with a glowing bulb lip
        const bg0 = c.createRadialGradient(640, 62, 2, 640, 62, 70); bg0.addColorStop(0, 'rgba(255,255,255,0.9)'); bg0.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = bg0; c.fillRect(570, 20, 140, 110);
        const sh = c.createLinearGradient(590, 0, 690, 0); sh.addColorStop(0, gy(12)); sh.addColorStop(0.3, gy(70)); sh.addColorStop(1, gy(10));
        c.fillStyle = sh; c.beginPath(); c.moveTo(590, 40); c.lineTo(690, 40); c.lineTo(670, 60); c.lineTo(610, 60); c.fill();
        c.fillStyle = gy(250); c.fillRect(612, 59, 56, 3);
        // dust motes drifting in the beam
        const Rm = H.rng(4242);
        for (let k = 0; k < 44; k++) {
          const yb = Rm() * 620, ph = Rm() * 6.28, u = Rm() * 2 - 1, r = Rm() * 1.4 + 0.7, my = 80 + ((yb + t * 11) % 620), hw = 40 + (my - 54) / 666 * 570;
          const mx = 640 + u * hw * 0.85 + Math.sin(t * 0.7 + ph) * 7;
          c.fillStyle = `rgba(255,255,255,${(0.35 + 0.45 * Rm()) * (1 - my / 900)})`; c.beginPath(); c.arc(mx, my, r, 0, 7); c.fill();
        }
        const adj = sm(8.75, 9.35, t), step = Math.floor(adj * 4) / 4;
        c.save(); c.translate(640, 330); c.scale(zoom, zoom); c.translate(-640, -330 - (zoom - 1) * 60);
        machine(c, 640, 320, 0.85, [-1.6 + step * 1.9, 0.6 - step * 1.7, -0.2 + step * 1.3], t, true);
        c.restore();
        const ms = E.out(sm(6.3, 6.6, t)); mugshot(c, H.lerp(-120, 190, ms), 330, 150, 'cat', 9001, -0.05);
        // tape with the answer
        const tp = sm(6.95, 7.35, t);
        if (tp > 0 && zoom < 1.05) {
          const tpg = c.createLinearGradient(0, 0, 0, 74); tpg.addColorStop(0, gy(244)); tpg.addColorStop(1, gy(200));
          c.save(); c.translate(870, 420); c.rotate(-0.06);
          c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 12; c.shadowOffsetX = 5; c.shadowOffsetY = 8; c.fillStyle = gy(225); c.fillRect(0, 0, 330 * tp, 74); c.restore();
          c.fillStyle = tpg; c.fillRect(0, 0, 330 * tp, 74);
          c.fillStyle = gy(20); c.font = '400 52px "Special Elite"'; c.save(); c.beginPath(); c.rect(0, 0, 330 * tp, 74); c.clip(); c.fillText(t < 9.5 ? 'DOG?' : 'CAT.', 22, 56); c.restore();
          if (t >= 9.5) { c.fillStyle = tpg; c.fillRect(0, 0, 330, 74); c.fillStyle = gy(20); c.fillText('CAT.', 22, 56); }
          c.restore();
        }
        // rubber stamp emphasis
        const st = (t0, word) => { const p = sm(t0, t0 + 0.12, t); if (p <= 0) return; c.save(); c.translate(1050, 318); c.rotate(-0.16); const s = 2.2 - 1.2 * E.out(p); c.scale(s, s); c.globalAlpha = Math.min(1, p * 1.5);
          c.fillStyle = gy(10, 0.7); c.fillRect(-116, -44, 232, 88); c.strokeStyle = gy(245); c.lineWidth = 6; c.strokeRect(-110, -38, 220, 76); c.fillStyle = gy(245); c.font = '700 54px "Oswald"'; c.textAlign = 'center'; c.fillText(word, 0, 20); c.restore(); };
        if (t < 9.5 && zoom < 1.05) st(7.6, 'WRONG');
        if (t >= 9.75) st(9.75, 'RIGHT');
        if (zoom < 1.05) {
          NRarrow(c, Q(285, 280, 360, 230, 470, 260), sm(6.6, 6.9, t)); NR(c, 'GUESS', 370, 205, 40, sm(6.7, 6.95, t));
          NR(c, 'CHECK', 1050, 238, 40, sm(7.7, 7.95, t));
          if (t < 9.5) NR(c, '✗', 1225, 340, 70, sm(7.65, 7.75, t));
          else NR(c, '✓', 1225, 340, 70, sm(9.85, 9.95, t));
          NRarrow(c, Q(1000, 500, 860, 640, 720, 470), sm(8.15, 8.55, t)); NR(c, 'ADJUST', 900, 650, 40, sm(8.3, 8.55, t));
        } else NR(c, 'ADJUSTING THE DIALS', 640, 640, 44, 1);
      },
      prog(c) {
        c.fillStyle = gy(14); c.fillRect(0, 0, W, Hh);
        // desk-lamp pool behind the chart, soft slat light raking the wall
        pool(c, 450, 340, 560, 380, 0.2); pool(c, 1040, 330, 260, 200, 0.08);
        const sl = slats(W, Hh, { x0: -200, sway: t * 4, alpha: 0.2, blur: 7, mullion: [900, 0.55] });
        screenL(c, sl); haze(c, sl, 0.35); tex(c, 0.6);
        c.strokeStyle = gy(90); c.lineWidth = 1; for (let k = 0; k <= 5; k++) { c.beginPath(); c.moveTo(120, 160 + k * 80); c.lineTo(760, 160 + k * 80); c.stroke(); }
        c.strokeStyle = gy(235); c.lineWidth = 4; c.beginPath(); c.moveTo(120, 140); c.lineTo(120, 560); c.lineTo(780, 560); c.stroke();
        NR(c, 'TRAINING ROUNDS →', 450, 612, 30);
        const lp = sm(10.75, 12.2, t), pts = []; for (let r = 0; r <= 30; r++) { const a = 0.97 - 0.36 * Math.exp(-r / 7) + (r > 0 && r < 30 ? Math.sin(r * 2.7) * 0.01 : 0); pts.push([130 + r * 21, 560 - (a - 0.5) / 0.5 * 400]); }
        const n = Math.floor(lp * 30); c.lineCap = 'round';
        c.lineJoin = 'round';
        for (const [col, lw, glow] of [[gy(0), 12, 0], [gy(250), 6, 1]]) { c.save(); if (glow) { c.shadowColor = gy(255, 0.6); c.shadowBlur = 12; }
          c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(...pts[0]); for (let i = 1; i <= n; i++) c.lineTo(...pts[i]); c.stroke(); c.restore(); }
        NR(c, 'ACCURACY', 1010, 250, 44);
        const pct = Math.round(61 + 36 * E.out(lp));
        odometer(c, 905, 290, pct, 2, 110); NR(c, '%', 1170, 385, 90);
      },
      news2(c) {
        const p = E.out(sm(12.3, 13.0, t));
        newspaper(c, 640, 360, 0.04 + 0.96 * p, (1 - p) * Math.PI * 5 + 0.05, 'ACCURACY HITS 97%!', 'Machine learns from a million case files');
      },
      end(c) {
        c.fillStyle = gy(12); c.fillRect(0, 0, W, Hh);
        const sw = Math.sin(t) * 4;
        // real slat light: bright bands with penumbra, a mullion bar, and the detective's shadow cut out of it
        const sl = slats(W, Hh, { x0: 380, sway: sw, alpha: 0.85, blur: 6, edge: 170, mullion: [640, 0.55] });
        const shL = H.layer(W >> 2, Hh >> 2), shx = shL.getContext('2d'); shx.filter = 'blur(3px)'; shx.scale(0.25, 0.25); shx.translate(-130, 40); figT(shx); shx.fillStyle = '#000'; detectivePath(shx); shx.fill();
        const sx = sl.getContext('2d'); sx.save(); sx.globalCompositeOperation = 'destination-out'; sx.globalAlpha = 0.85; sx.drawImage(shL, 0, 0, W >> 1, Hh >> 1); sx.restore();
        screenL(c, sl, 0.78); tex(c, 0.55);                                           // plaster shows in the lit bands
        haze(c, sl, 0.4);
        // a smoke wisp hanging in the beam
        const wl = H.layer(W >> 2, Hh >> 2), wc = wl.getContext('2d'); wc.filter = 'blur(2px)'; wc.scale(0.25, 0.25); wc.lineCap = 'round';
        for (let s = 0; s < 3; s++) { wc.strokeStyle = `rgba(255,255,255,${0.15 - s * 0.035})`; wc.lineWidth = 10 + s * 12; wc.beginPath();
          const wx = 860 + s * 30 + Math.sin(t * 0.6 + s) * 10; wc.moveTo(wx, 520); wc.bezierCurveTo(wx - 60, 420 - s * 10, wx + 70 + Math.sin(t * 0.8) * 20, 300, wx - 10, 150 + s * 20); wc.stroke(); }
        screenL(c, wl);
        // the detective: near-black, faint slat light across the coat, a hard rim where the window light grazes him
        c.save(); figT(c); c.fillStyle = gy(8); detectivePath(c); c.fill(); c.restore();
        c.save(); figT(c); detectivePath(c); c.restore(); c.save(); c.clip(); screenL(c, sl, 0.12); c.restore();
        const ox = 890, oy = 140, rl = H.layer(W - ox, Hh - oy), rx = rl.getContext('2d');   // rim worked only over the figure's box
        rx.save(); rx.translate(-ox, -oy); figT(rx); rx.fillStyle = '#fff'; detectivePath(rx); rx.fill(); rx.restore();
        rx.save(); rx.globalCompositeOperation = 'destination-out'; rx.translate(-ox - 6, -oy + 3); figT(rx); detectivePath(rx); rx.fill(); rx.restore();
        const rm = H.layer(W >> 1, Hh >> 1), rmx = rm.getContext('2d'); rmx.fillStyle = 'rgba(255,255,255,0.35)'; rmx.fillRect(0, 0, W >> 1, Hh >> 1); rmx.drawImage(sl, 0, 0);
        rx.globalCompositeOperation = 'destination-in'; rx.drawImage(rm, -ox, -oy, W, Hh);
        c.save(); c.globalCompositeOperation = 'screen'; c.drawImage(rl, ox, oy); c.restore();
        c.save(); c.textAlign = 'center'; c.shadowColor = 'rgba(0,0,0,0.9)'; c.shadowBlur = 12; c.fillStyle = gy(242);
        c.font = '400 64px "Limelight"'; c.fillText('More examples', 470, 290);
        // the arrow, drawn at Limelight weight (the font's '↓' glyph is spindly)
        c.fillRect(466.5, 322, 7, 32); c.beginPath(); c.moveTo(452, 348); c.lineTo(488, 348); c.lineTo(470, 374); c.closePath(); c.fill();
        c.font = '400 64px "Limelight"'; c.fillText('better guesses', 470, 450); c.restore();
      },
    };
    // ---------- timeline with period transitions ----------
    const L = (fn, ...a) => { const l = H.layer(W, Hh), c = l.getContext('2d'); fn(c, ...a); return l; };
    let out;
    if (t < 1.95) out = L(scenes.hook);
    else if (t < 2.8) {           // iris out on the newspaper, iris in on the case board
      const a = sm(1.95, 2.35, t), b = sm(2.4, 2.8, t);
      out = H.layer(W, Hh); const c = out.getContext('2d'); c.fillStyle = '#000'; c.fillRect(0, 0, W, Hh);
      const src = t < 2.37 ? L(scenes.hook) : L(scenes.data), r = t < 2.37 ? 760 * (1 - E.in(a)) : 760 * E.out(b);
      c.save(); c.beginPath(); c.arc(640, 360, Math.max(0.1, r), 0, 7); c.clip(); c.drawImage(src, 0, 0); c.restore();
    } else if (t < 5.9) out = L(scenes.data);
    else if (t < 6.35) {          // hard-edged horizontal wipe
      const w = E.inOut(sm(5.9, 6.35, t)) * (W + 40);
      out = L(scenes.data); const c = out.getContext('2d'); c.save(); c.beginPath(); c.rect(0, 0, w, Hh); c.clip(); c.drawImage(L(scenes.loop, 1), 0, 0); c.restore();
      c.fillStyle = gy(250); c.fillRect(w - 3, 0, 3, Hh);
    } else if (t < 10.35) {
      const z = 1 + 0.45 * E.inOut(sm(8.6, 8.85, t)) * (1 - E.inOut(sm(9.3, 9.5, t)));
      out = L(scenes.loop, z);
    } else if (t < 10.75) {       // clock wipe
      const a = sm(10.35, 10.75, t) * Math.PI * 2;
      out = L(scenes.loop, 1); const c = out.getContext('2d'); c.save(); c.beginPath(); c.moveTo(640, 360); c.arc(640, 360, 900, -Math.PI / 2, -Math.PI / 2 + a); c.closePath(); c.clip(); c.drawImage(L(scenes.prog), 0, 0); c.restore();
    } else if (t < 13.3) { out = L(scenes.prog); if (t > 12.3) out.getContext('2d').drawImage(L(scenes.news2), 0, 0); }
    else {                        // iris in on the closing card
      const r = 900 * E.out(sm(13.3, 13.75, t));
      out = H.layer(W, Hh); const c = out.getContext('2d'); c.fillStyle = '#000'; c.fillRect(0, 0, W, Hh);
      c.save(); c.beginPath(); c.arc(470, 370, Math.max(0.1, r), 0, 7); c.clip(); c.drawImage(L(scenes.end), 0, 0); c.restore();
    }
    // ---------- projected film finish ----------
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, Hh);
    ctx.drawImage(out, weaveX, weaveY);
    const soft = H.layer(W, Hh), sfx = soft.getContext('2d'); sfx.filter = 'blur(0.8px)'; sfx.drawImage(ctx.canvas, 0, 0); ctx.drawImage(soft, 0, 0);
    const fimg = ctx.getImageData(0, 0, W, Hh), fd = fimg.data;
    for (let i = 0; i < fd.length; i += 4) {
      let v = Math.min(1, ((fd[i] + fd[i + 1] + fd[i + 2]) / 765) * flick);
      v = v < 0.5 ? 0.5 * Math.pow(2 * v, 1.5) : 1 - 0.5 * Math.pow(2 - 2 * v, 1.3);
      v = H.clamp(v + (Rg() + Rg() + Rg() - 1.5) * 0.15 * (0.5 + 0.8 * Math.sqrt(v * (1 - v) + 0.04)));
      fd[i] = v * 255; fd[i + 1] = v * 252; fd[i + 2] = v * 246;
    }
    ctx.putImageData(fimg, 0, 0);
    const hl = H.layer(W / 4, Hh / 4), hx = hl.getContext('2d'); hx.filter = 'blur(6px) brightness(1.2)'; hx.drawImage(ctx.canvas, 0, 0, W / 4, Hh / 4);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.25; ctx.drawImage(hl, 0, 0, W, Hh); ctx.restore();
    H.vignette(ctx, W, Hh, 0.7, '0,0,0');
    for (let k = 0; k < 50; k++) { const white = Rg() < 0.6; ctx.fillStyle = white ? `rgba(255,255,250,${Rg.range(0.4, 0.9)})` : `rgba(0,0,0,${Rg.range(0.5, 0.9)})`; const x = Rg() * W, y = Rg() * Hh, r = Rg() < 0.9 ? Rg.range(0.6, 1.8) : Rg.range(2, 4); ctx.beginPath(); ctx.ellipse(x, y, r, r * Rg.range(0.5, 1), Rg() * 3, 0, 7); ctx.fill(); }
    ctx.strokeStyle = 'rgba(255,255,250,0.3)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let y = 0; y <= Hh; y += 20) ctx.lineTo(300 + Math.sin(t * 6) * 4 + nz.n2(3, y * 0.01) * 4, y); ctx.stroke();
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, BAR); ctx.fillRect(0, Hh - BAR, W, BAR);
  }

  registerStyle({
    id: 'film-noir',
    name: '1940s Film Noir',
    category: 'Light & Imaging',
    description: 'A high-contrast black-and-white still from a forties detective picture: venetian-blind light slicing across a fedora silhouette, a glowing terminal as the only other light, cigarette smoke hanging in the beams, with heavy nitrate grain, gate weave, dust and scratches.',
    motion: 'Blinds sway and smoke curls in a dark office; the terminal warms up with a CRT flash, its glow rim-lights the detective, a prompt types out, and the title card dissolves in word by word over projector flicker, weave and dirt.',
    fonts: ['400 66px "Limelight"', '400 28px "Limelight"', '400 25px "VT323"', 'italic 400 24px "Playfair Display"', '700 40px "Oswald"', '400 54px "UnifrakturMaguntia"', '400 76px "Anton"', '400 52px "Special Elite"', '700 30px "Courier Prime"', '400 14px "Courier Prime"'],
    frameT: 4.6,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Told as a 1940s newsreel / B-picture montage: spinning-newspaper headlines, iris, wipe and clock-wipe transitions, mugshot booking placards as labels, white newsreel arrows and lettering, a rolling mechanical odometer for numbers and a rubber stamp slammed down as the emphasis, all under heavy grain and gate weave.',
    explainer(ctx, W, Hh, t) { noirExplainer(ctx, W, Hh, t); },
    // Newsreel soundtrack: projector clatter + optical-track crackle underneath; paper, typebars, ratchets,
    // rubber stamps and a desk bell on the events; muted-brass stings for the two headlines and the end card.
    // Every time below is copied from noirExplainer() (same numbers, same easing) so cues land on the frame.
    // Voiceover mode (k.vo): beds drop out and everything tagged { minor: true } or inside k.withMinor() plays quieter,
    // so landings, transitions, WRONG/RIGHT, the 97% hit and the resolve stay on top of the narration.
    explainerSound(k) {
      const sm = H.smooth, E = H.ease, D = 15;
      // first time (1 ms scan) at which f(t) reaches or passes v
      const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
      // muted newsreel brass: detuned filtered saws with a soft bite
      const brass = (t, notes, dur, g) => notes.forEach((n, i) => {
        for (const det of [-7, 7]) k.tone(t, { f: n, type: 'sawtooth', detune: det, dur, gain: 0.03 * g, a: 0.03, hold: dur * 0.55, filter: 'lowpass', f2: [[0, 700], [0.06, 2200], [dur, 900]], q: 0.7, pan: (i - (notes.length - 1) / 2) * 0.3, verb: 0.35 });
      });
      // spinning newspaper: a paper flap at every half turn (rotation = (1-p)*5π), louder as it grows toward camera
      const spin = (t0, t1) => {
        const p = (t) => E.out(sm(t0, t1, t));
        for (let h = 1; h < 5; h++) { const th = when((t) => p(t) * 5, h, t0, t1), g = 0.35 + 0.18 * h;
          k.noise(th - 0.03, { dur: 0.09, color: 'pink', filter: 'bandpass', f: [[0, 900], [0.05, 2600], [0.09, 1400]], q: 0.8, gain: 0.22 * g, a: 0.03, minor: true }); }
        k.play('whoosh', t0, { dur: (t1 - t0) * 0.85, top: 1800, gain: 0.5, minor: true });
      };
      // iris: a soft mechanical leaf-shutter sweep
      const iris = (t, dur, open) => k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: open ? [[0, 500], [dur, 2400]] : [[0, 2400], [dur, 500]], q: 1.4, gain: 0.16, a: dur * 0.6 });
      // throttled mechanical odometer: one click per value change, never closer than `gap`
      const odo = (val, a, b, gap, f, avoid = []) => { let last = -1, prev = val(a);
        for (let t = a; t <= b; t += 0.002) { const v = val(t); if (v !== prev && t - last >= gap && !avoid.some((x) => t > x - 0.03 && t < x + 0.12)) { k.play('tock', t, { f, gain: 0.32, pan: 0.4, minor: true }); last = t; } prev = v; } };

      // ---- beds: projector gate clatter, optical soundtrack crackle, a little room
      k.bed('projector', 0, D, { gain: 1.1 });
      k.bed('vinyl', 0, D, { gain: 0.7 });
      k.bed('room', 0, D, { gain: 0.6 });

      // ---- 0.15–1.15 newspaper spins in, lands; newsreel fanfare
      spin(0.15, 1.15);
      k.play('slap', 1.15, { gain: 0.7 });
      k.withMinor(() => { brass(1.2, ['G3'], 0.12, 1); brass(1.34, ['G3'], 0.12, 1); brass(1.48, ['C4', 'E4', 'G4'], 0.9, 1.1); });

      // ---- iris out 1.95–2.35, iris in 2.4–2.8
      iris(1.95, 0.4, false); iris(2.4, 0.4, true);

      // ---- case board: mugshots slap onto the cork at 2.75 + k*0.28 (scale lands 0.15 s later)
      for (let c = 0; c < 9; c++) { const t0 = 2.75 + c * 0.28; k.play('slap', t0 + 0.12, { gain: 0.32, pan: -0.6 + (c % 3) * 0.2, minor: true }); }
      // examples odometer 10^(6p), p = sm(2.7, 5.4): clicks speed up to ~11/s, then it locks at 1,000,000
      odo((t) => Math.round(Math.pow(10, 6 * sm(2.7, 5.4, t))), 2.72, 5.38, 0.09, 1500, Array.from({ length: 9 }, (_, c) => 2.87 + c * 0.28));
      k.play('tock', 5.4, { f: 520, gain: 0.9, pan: 0.4 });

      // ---- 5.9–6.35 hard horizontal wipe
      k.play('swish', 5.92, { dur: 0.4, gain: 0.6 });

      // ---- interrogation table
      k.bed('hum', 6.0, 10.35, { gain: 0.5 });                             // lamp/machine hum under the scene
      k.play('paper', 6.3, { dur: 0.3, gain: 1.0, pan: -0.5, minor: true });            // mugshot slides in
      k.play('tock', 6.7, { f: 700, gain: 0.35, pan: -0.3, minor: true });              // GUESS arrow + label
      k.play('tape', 6.95, { dur: 0.4, gain: 0.6, pan: 0.35, minor: true });            // answer tape feeds out
      k.play('typing', 6.98, { n: 4, rate: 0.09, gain: 0.7, pan: 0.35, minor: true });  // "DOG?"
      k.play('stamp', 7.72, { gain: 0.85, pan: 0.5 });                      // WRONG stamp hits (lands 7.6+0.12)
      k.play('buzz', 7.84, { f: 98, dur: 0.28, gain: 0.85, pan: 0.5, minor: true });     // quiz-show buzzer for the wrong guess
      k.play('stroke', 8.15, { material: 'pencil', dur: 0.4, gain: 1.3, minor: true });    // ADJUST arrow draws
      k.play('swish', 8.6, { dur: 0.25, gain: 0.45, minor: true });                     // punch in
      // dials ratchet in four steps: step = floor(sm(8.75, 9.35)*4)/4
      for (let s = 1; s <= 4; s++) { const ts = when((t) => sm(8.75, 9.35, t) * 4, s, 8.75, 9.36); k.play('tock', ts, { f: 420 + s * 40, gain: 0.7, minor: true }); k.play('click', ts + 0.012, { gain: 0.5, minor: true }); }
      k.play('swish', 9.3, { dur: 0.2, gain: 0.35, minor: true });                      // punch out
      k.play('typing', 9.5, { n: 4, rate: 0.045, gain: 0.7, pan: 0.35, minor: true }); // tape now reads "CAT."
      k.play('stamp', 9.87, { gain: 0.85, pan: 0.5 });                      // RIGHT stamp hits (9.75+0.12)
      k.play('bell', 9.95, { f: 'A6', gain: 0.9, pan: 0.5 });              // desk bell: correct

      // ---- 10.35–10.75 clock wipe: a quick rotary ratchet sweep
      for (let i = 0; i < 5; i++) k.play('tock', 10.37 + i * 0.08, { f: 1100 + i * 120, gain: 0.45, minor: i > 0 });
      k.play('whoosh', 10.35, { dur: 0.4, top: 1600, gain: 0.5 });

      // ---- 10.75–12.2 accuracy line draws while the odometer rolls 61 -> 97, slowing as it settles
      k.play('stroke', 10.78, { material: 'pencil', dur: 1.4, gain: 0.3, pan: -0.4, minor: true });
      odo((t) => Math.round(61 + 36 * E.out(sm(10.75, 12.2, t))), 10.76, 12.15, 0.085, 1600);
      k.play('tock', 12.2, { f: 560, gain: 0.7, pan: 0.4 });

      // ---- 12.3–13.0 "ACCURACY HITS 97%!" spins in: the big hit
      spin(12.3, 13.0);
      k.play('impact', 13.0, { gain: 1.3 }); k.play('press', 13.0, { gain: 0.8 }); k.play('slap', 13.0, { gain: 0.7, minor: true });
      brass(13.04, ['C4', 'E4', 'G4', 'C5'], 0.32, 1.1);

      // ---- 13.3–13.75 iris in on the closing card; resolving brass chord under the takeaway
      iris(13.3, 0.45, true);
      k.withMinor(() => brass(13.55, ['F3', 'C4', 'A4'], 0.55, 0.7));  // lead-in chord: quieter under voiceover
      brass(14.05, ['C3', 'G3', 'E4', 'C5'], 0.92, 0.8);          // the resolve, kept under voiceover too
    },
    draw(ctx, W, Hh, t) {
      const R = H.rng(1946), nz = H.makeNoise(46);
      const weaveX = nz.n2(t * 3.1, 0.3) * 2.2, weaveY = nz.n2(0.7, t * 2.7) * 2.8;
      const flick = 1 + nz.n2(t * 9, 4.4) * 0.05;
      const fr24 = Math.floor(t * 24), Rg = H.rng(7000 + fr24); // per-frame grain & dirt (24 fps film)
      const termOn = t < 0.9 ? 0 : H.smooth(0.9, 1.35, t) * (t < 1.3 ? (Math.floor(t * 30) % 3 ? 1 : 0.6) : 1);
      const sway = Math.sin(t * 0.9) * 4 + Math.sin(t * 2.3) * 1.2;

      // ---------- albedo (greyscale) ----------
      const A = H.layer(W, Hh), a = A.getContext('2d');
      // wall: painted plaster with wainscot
      a.fillStyle = 'rgb(150,150,150)'; a.fillRect(0, 0, W, Hh);
      a.fillStyle = 'rgb(110,110,110)'; a.fillRect(0, 440, W, 30);
      a.fillStyle = 'rgb(120,120,120)'; a.fillRect(0, 470, W, 250);
      for (let x = 30; x < W; x += 140) { a.fillStyle = 'rgb(90,90,90)'; a.fillRect(x, 470, 3, 250); }
      // framed picture on wall (left)
      a.fillStyle = 'rgb(60,60,60)'; a.fillRect(70, 150, 150, 190);
      a.fillStyle = 'rgb(170,170,170)'; a.fillRect(84, 164, 122, 162);
      a.fillStyle = 'rgb(120,120,120)'; a.beginPath(); a.moveTo(84, 326); a.lineTo(130, 250); a.lineTo(160, 290); a.lineTo(206, 220); a.lineTo(206, 326); a.fill();
      // desk
      a.fillStyle = 'rgb(70,70,70)'; a.beginPath(); a.moveTo(0, 492); a.lineTo(690, 492); a.lineTo(712, 512); a.lineTo(0, 512); a.fill();
      a.fillStyle = 'rgb(40,40,40)'; a.fillRect(0, 512, 712, 210);
      a.fillStyle = 'rgb(55,55,55)'; a.fillRect(40, 540, 300, 6); a.fillRect(380, 540, 300, 6);
      // terminal casing (cream metal)
      a.fillStyle = 'rgb(175,175,170)';
      a.beginPath(); a.roundRect(318, 282, 238, 196, 14); a.fill();
      a.fillStyle = 'rgb(140,140,138)'; a.beginPath(); a.moveTo(340, 478); a.lineTo(534, 478); a.lineTo(548, 494); a.lineTo(326, 494); a.fill();
      a.fillStyle = 'rgb(40,40,40)'; a.beginPath(); a.roundRect(340, 300, 194, 146, 20); a.fill();
      for (let k = 0; k < 6; k++) { a.fillStyle = 'rgb(100,100,100)'; a.fillRect(470 + k * 9, 456, 5, 12); }
      // keyboard
      a.fillStyle = 'rgb(130,130,128)'; a.beginPath(); a.moveTo(352, 498); a.lineTo(560, 498); a.lineTo(574, 512); a.lineTo(338, 512); a.fill();
      // rotary telephone (left)
      a.fillStyle = 'rgb(22,22,22)';
      a.beginPath(); a.ellipse(128, 478, 62, 22, 0, Math.PI, 0); a.lineTo(190, 494); a.lineTo(66, 494); a.fill();
      a.beginPath(); a.roundRect(80, 436, 96, 18, 9); a.fill();
      a.beginPath(); a.ellipse(84, 444, 16, 12, 0, 0, 7); a.ellipse(172, 444, 16, 12, 0, 0, 7); a.fill();
      a.fillStyle = 'rgb(80,80,80)'; a.beginPath(); a.arc(128, 478, 12, 0, 7); a.fill();
      // whisky glass
      a.fillStyle = 'rgb(110,110,110)'; a.beginPath(); a.moveTo(226, 452); a.lineTo(264, 452); a.lineTo(260, 494); a.lineTo(230, 494); a.fill();
      a.fillStyle = 'rgb(70,70,70)'; a.fillRect(229, 472, 33, 21);
      // ashtray
      a.fillStyle = 'rgb(60,60,60)'; a.beginPath(); a.ellipse(620, 490, 34, 8, 0, 0, 7); a.fill();
      // detective (dark wool coat)
      const Fm = H.layer(W, Hh), fm = Fm.getContext('2d');
      fm.fillStyle = '#fff'; detectivePath(fm); fm.fill(); armPath(fm); fm.fill();
      a.fillStyle = 'rgb(46,46,46)'; detectivePath(a); a.fill();
      a.fillStyle = 'rgb(30,30,30)'; a.beginPath(); a.moveTo(730, 226); a.bezierCurveTo(728, 220, 740, 214, 772, 212); a.bezierCurveTo(776, 190, 786, 168, 812, 160); a.bezierCurveTo(828, 156, 848, 160, 862, 158); a.bezierCurveTo(880, 164, 888, 190, 890, 206); a.bezierCurveTo(912, 208, 934, 214, 938, 222); a.bezierCurveTo(900, 232, 780, 230, 730, 226); a.fill();
      a.fillStyle = 'rgb(140,140,140)'; a.fillRect(776, 204, 112, 8); // hat band catches light
      a.fillStyle = 'rgb(150,150,150)'; a.beginPath(); a.moveTo(772, 232); a.lineTo(764, 258); a.lineTo(758, 264); a.lineTo(766, 276); a.lineTo(764, 284); a.lineTo(770, 292); a.lineTo(772, 300); a.lineTo(780, 304); a.lineTo(800, 300); a.lineTo(806, 236); a.fill(); // face skin
      a.fillStyle = 'rgb(56,56,56)'; armPath(a); a.fill();
      a.fillStyle = 'rgb(150,150,150)'; a.beginPath(); a.ellipse(722, 440, 12, 9, 0.4, 0, 7); a.fill(); // hand
      a.fillStyle = 'rgb(230,230,230)'; a.save(); a.translate(712, 434); a.rotate(-0.3); a.fillRect(-26, -2, 26, 4); a.restore(); // cigarette
      // belt line
      a.strokeStyle = 'rgb(30,30,30)'; a.lineWidth = 6; a.beginPath(); a.moveTo(708, 590); a.quadraticCurveTo(870, 610, 1046, 596); a.stroke();
      // lapel crease
      a.strokeStyle = 'rgb(25,25,25)'; a.lineWidth = 3; a.beginPath(); a.moveTo(778, 352); a.bezierCurveTo(800, 400, 790, 460, 760, 520); a.stroke();

      // ---------- light ----------
      const Ad = a.getImageData(0, 0, W, Hh).data, Fd = fm.getImageData(0, 0, W, Hh).data;
      const fig = (x, y) => { x = x | 0; y = y | 0; if (x < 0 || y < 0 || x >= W || y >= Hh) return 0; return Fd[(y * W + x) * 4 + 3] / 255; };
      const scx = 437, scy = 373; // terminal screen centre
      const blindPeriod = 34, slope = 0.5;
      const blinds = (x, y, shift) => {
        // window light patch: parallelogram projected from upper right
        const left = 470 + (y - 60) * 0.55, right = 1500;
        const inPatch = H.smooth(left - 20, left + 20, x) * H.smooth(right + 20, right - 20, x) * H.smooth(20, 70, y) * (1 - H.smooth(690, 720, y));
        const per = blindPeriod + (x - 600) * 0.012 + (y - 300) * 0.01;
        const p = (((y + x * slope + shift + sway) / per) % 1 + 1) % 1;
        const pen = 0.04 + (1 - H.smooth(300, 1300, x)) * 0.06; // penumbra widens farther from the blinds
        const slat = H.smooth(0.1 - pen, 0.1 + pen, p) * (1 - H.smooth(0.52 - pen, 0.52 + pen, p));
        const fall = 0.45 + 0.55 * H.smooth(350, 1250, x + (300 - y) * 0.6);
        // window mullion shadow
        const mull = 1 - (1 - H.smooth(5, 9, Math.abs(x - (980 + (y - 60) * 0.55)))) * 0.95;
        return inPatch * slat * mull * fall;
      };
      const img = ctx.createImageData(W, Hh), d = img.data;
      for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const alb = Ad[i] / 255, onFig = Fd[i + 3] / 255;
        // detective's shadow on the wall (light from upper right)
        const sh = onFig > 0.5 ? 0 : fig(x + 190, y - 70) * 0.92;
        let L = 0.035;
        const onDesk = y > 492 && x < 712 && onFig < 0.5;
        const wallStripes = blinds(x, y, 0) * (1 - sh) * (onDesk ? 0.25 : 1);
        const figStripes = blinds(x + 14, y, 21) * (H.smooth(760, 900, x) * 0.75 + 0.25) * 1.3;
        L += onFig > 0.5 ? figStripes * 0.9 : wallStripes;
        // terminal glow (soft cool light)
        const dx = x - scx, dy = y - scy, dd = dx * dx + dy * dy;
        let glow = 0.55 / (1 + dd / 26000);
        if (onFig > 0.5) {
          // rim on the edges facing the screen
          const rim = (1 - fig(x - 7, y - 2)) * 0.7 + (1 - fig(x - 3, y - 1)) * 0.6;
          glow = glow * 0.15 + rim * 2.2 / (1 + dd / 120000);
        }
        if (y > 492 && y < 512 && x < 700) glow *= 2.4; // desk top catches it // desk top catches it
        L += glow * termOn;
        let v = alb * L * 2.1;
        d[i] = d[i + 1] = d[i + 2] = H.clamp(v) * 255; d[i + 3] = 255;
      }
      ctx.save(); ctx.translate(weaveX, weaveY);
      const Sc = H.layer(W, Hh); Sc.getContext('2d').putImageData(img, 0, 0);
      ctx.fillStyle = '#000'; ctx.fillRect(-10, -10, W + 20, Hh + 20);
      ctx.drawImage(Sc, 0, 0);

      // ---------- emissive: terminal screen ----------
      ctx.save();
      ctx.beginPath(); ctx.roundRect(350, 310, 174, 126, 16); ctx.clip();
      if (termOn > 0) {
        // CRT warm-up: a bright line opens vertically into the raster
        const open = H.ease.out(H.smooth(0.9, 1.2, t)), hh = 126 * open;
        ctx.beginPath(); ctx.rect(350, scy - hh / 2 - 1, 174, hh + 2); ctx.clip();
        const sg = ctx.createRadialGradient(scx, scy, 10, scx, scy, 120);
        const b0 = 215 + (1 - open) * 40;
        sg.addColorStop(0, `rgb(${b0},${b0},${b0})`); sg.addColorStop(1, 'rgb(120,120,120)');
        ctx.fillStyle = sg; ctx.fillRect(340, 300, 200, 150);
        ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.font = '400 25px "VT323"';
        if (t > 1.35) ctx.fillText('READY.', 364, 346);
        const line = '> WHO SENT YOU?', nch = Math.max(0, Math.min(line.length, Math.floor((t - 1.7) * 13)));
        if (nch > 0) ctx.fillText(line.slice(0, nch), 364, 372);
        const cy0 = nch > 0 && nch < line.length ? 354 : 386, cx0 = nch > 0 && nch < line.length ? 364 + ctx.measureText(line.slice(0, nch)).width + 2 : 364;
        if (t > 1.35 && (nch < line.length || Math.floor(t * 2) % 2 === 0)) ctx.fillRect(cx0, cy0, 13, 20);
      } else { ctx.fillStyle = 'rgb(28,28,28)'; ctx.fillRect(340, 300, 200, 150); }
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 310; y < 436; y += 3) ctx.fillRect(350, y, 174, 1);
      ctx.restore();
      // specular glints on props facing the screen
      ctx.globalAlpha = termOn;
      ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(128, 478, 58, 19, 0, Math.PI * 1.15, Math.PI * 1.75); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(176, 437); ctx.lineTo(168, 437); ctx.stroke();
      ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(261, 455); ctx.lineTo(258, 492); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(230, 471, 31, 2);
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(620, 488, 32, 6, 0, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
      ctx.globalAlpha = 1;
      // cigarette ember
      const drag = Math.exp(-Math.pow((t - 3.9) / 0.25, 2));
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(689, 442, 2.6 + drag * 1.6, 0, 7); ctx.fill();
      if (drag > 0.05) { const eg = ctx.createRadialGradient(689, 442, 0, 689, 442, 26); eg.addColorStop(0, `rgba(255,255,255,${0.5 * drag})`); eg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = eg; ctx.fillRect(660, 414, 58, 58); }

      // ---------- smoke (lit by the blind beams) ----------
      const Sm = H.layer(W, Hh), smx = Sm.getContext('2d');
      smx.lineCap = 'round';
      for (let s = 0; s < 5; s++) {
        smx.beginPath();
        let px = 689, py = 440;
        smx.moveTo(px, py);
        for (let k = 0; k < 70; k++) {
          const u = k / 70;
          px += nz.n2(u * 3 + s * 7, t * 0.3 + s) * (2 + u * 7) + 0.6 + u * 1.2;
          py -= 4.2 - u * 1.3;
          smx.lineTo(px, py);
        }
        smx.strokeStyle = `rgba(255,255,255,${0.32 - s * 0.04})`; smx.lineWidth = 2 + s * 4;
        smx.stroke();
      }
      // hanging haze layer
      for (let k = 0; k < 24; k++) {
        const hx = 560 + R() * 520, hy = 120 + R() * 200, r = 40 + R() * 90;
        const gg = smx.createRadialGradient(hx, hy, 0, hx, hy, r);
        gg.addColorStop(0, 'rgba(255,255,255,0.05)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
        smx.fillStyle = gg; smx.fillRect(hx - r, hy - r, r * 2, r * 2);
      }
      const SmB = H.layer(W, Hh), sbx = SmB.getContext('2d');
      sbx.filter = 'blur(5px)'; sbx.drawImage(Sm, 0, 0);
      // modulate by beams: volumetric light shafts through smoke
      const beam = H.layer(W, Hh), bmx = beam.getContext('2d');
      const bimg = bmx.createImageData(W, Hh), bd = bimg.data;
      for (let y = 0; y < Hh; y += 1) for (let x = 400; x < W; x += 1) {
        const v = blinds(x, y, 30) * 255; const i = (y * W + x) * 4; bd[i] = bd[i + 1] = bd[i + 2] = 255; bd[i + 3] = 90 + v * 0.65;
      }
      bmx.putImageData(bimg, 0, 0);
      sbx.globalCompositeOperation = 'destination-in'; sbx.drawImage(beam, 0, 0);
      ctx.globalCompositeOperation = 'screen'; ctx.drawImage(SmB, 0, 0); ctx.globalAlpha = 0.85; ctx.filter = 'blur(2.5px)'; ctx.drawImage(Sm, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = 1;
      // faint beams in air
      ctx.globalAlpha = 0.07; ctx.filter = 'blur(10px)'; ctx.drawImage(beam, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();

      // ---------- title card ----------
      ctx.save();
      ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 12; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3;
      ctx.fillStyle = '#f2f2f2';
      const ti = (k) => H.smooth(2.5 + k * 0.22, 2.95 + k * 0.22, t);
      ctx.globalAlpha = ti(0); ctx.font = '400 26px "Limelight"'; ctx.fillText('THE', 70, 112);
      ctx.globalAlpha = ti(1); ctx.font = '400 60px "Limelight"'; ctx.fillText('GHOST', 66, 172);
      ctx.globalAlpha = ti(2); ctx.font = 'italic 400 24px "Playfair Display"'; ctx.fillText('in the', 74, 204);
      ctx.globalAlpha = ti(3); ctx.font = '400 60px "Limelight"'; ctx.fillText('MACHINE', 66, 262);
      ctx.globalAlpha = 1;
      ctx.restore();

      // ---------- film finish: contrast, halation, grain, flicker ----------
      const soft = H.layer(W, Hh), sfx = soft.getContext('2d');
      sfx.filter = 'blur(0.8px)'; sfx.drawImage(ctx.canvas, 0, 0); ctx.drawImage(soft, 0, 0);
      const fimg = ctx.getImageData(0, 0, W, Hh), fd = fimg.data;
      for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        let v = fd[i] / 255;
        v = Math.min(1, v * flick);
        v = v < 0.5 ? 0.5 * Math.pow(2 * v, 1.6) : 1 - 0.5 * Math.pow(2 - 2 * v, 1.3); // S-curve
        const gn = (Rg() + Rg() + Rg() - 1.5) * 0.16 * (0.5 + 0.8 * Math.sqrt(v * (1 - v) + 0.04));
        v = H.clamp(v + gn);
        // faint warm silver tone
        fd[i] = v * 255; fd[i + 1] = v * 252; fd[i + 2] = v * 246;
      }
      ctx.putImageData(fimg, 0, 0);
      // halation around highlights
      const hl = H.layer(W / 4, Hh / 4), hx = hl.getContext('2d');
      hx.filter = 'blur(6px) brightness(1.2)'; hx.drawImage(ctx.canvas, 0, 0, W / 4, Hh / 4);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.28; ctx.drawImage(hl, 0, 0, W, Hh); ctx.restore();
      // projector vignette
      H.vignette(ctx, W, Hh, 0.75, '0,0,0');
      // dust (white = dirt on negative, black = on print), hairs, scratches
      for (let k = 0; k < 70; k++) {
        const white = Rg() < 0.6;
        ctx.fillStyle = white ? `rgba(255,255,250,${Rg.range(0.4, 0.9)})` : `rgba(0,0,0,${Rg.range(0.5, 0.9)})`;
        const x = Rg() * W, y = Rg() * Hh, r = Rg() < 0.9 ? Rg.range(0.6, 1.8) : Rg.range(2, 4);
        ctx.beginPath(); ctx.ellipse(x, y, r, r * Rg.range(0.5, 1), Rg() * 3, 0, 7); ctx.fill();
      }
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = `rgba(250,250,245,${Rg.range(0.3, 0.6)})`; ctx.lineWidth = Rg.range(0.6, 1.2);
        const x = Rg() * W, y = Rg() * Hh; ctx.beginPath(); ctx.moveTo(x, y);
        ctx.bezierCurveTo(x + Rg.range(-20, 20), y + Rg.range(-20, 20), x + Rg.range(-30, 30), y + Rg.range(-10, 30), x + Rg.range(-30, 30), y + Rg.range(-30, 30)); ctx.stroke();
      }
      const scr = [[312 + Math.sin(t * 7) * 3, 0.35], [1043 + Math.sin(t * 5) * 2, 0.22]];
      scr.forEach(([sx0, al]) => {
        ctx.strokeStyle = `rgba(255,255,250,${al})`; ctx.lineWidth = 1.2; ctx.beginPath();
        for (let y = 0; y <= Hh; y += 20) ctx.lineTo(sx0 + nz.n2(sx0, y * 0.01) * 4, y);
        ctx.stroke();
      });
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let y = 0; y <= Hh; y += 20) ctx.lineTo(640 + nz.n2(9, y * 0.01) * 5, y); ctx.stroke();

      // ---------- letterbox ----------
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, BAR); ctx.fillRect(0, Hh - BAR, W, BAR);
    },
  });
}
