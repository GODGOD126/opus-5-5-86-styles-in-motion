{
  const HZ = 452; // horizon line

  function sky(c, W) {
    const g = c.createLinearGradient(0, 0, 0, HZ);
    g.addColorStop(0, '#1b0b3f');
    g.addColorStop(0.32, '#4a1d7a');
    g.addColorStop(0.62, '#b03aa8');
    g.addColorStop(0.86, '#ff7ac0');
    g.addColorStop(1, '#ffc0d8');
    c.fillStyle = g; c.fillRect(0, 0, W, HZ);
  }

  function sun(c0, cx, cy, R, t) {
    const L = H.layer(c0.canvas.width, c0.canvas.height), c = L.getContext('2d');
    c.save();
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.clip();
    const g = c.createLinearGradient(0, cy - R, 0, cy + R);
    g.addColorStop(0, '#fff27a'); g.addColorStop(0.45, '#ffa45c'); g.addColorStop(0.75, '#ff4f9a'); g.addColorStop(1, '#d9208e');
    c.fillStyle = g; c.fillRect(cx - R, cy - R, R * 2, R * 2);
    // slices: gaps get thicker toward the bottom and scroll down slowly
    c.globalCompositeOperation = 'destination-out';
    const scroll = (t * 14) % 26;
    for (let k = -1; k < 12; k++) {
      const yy = cy - R * 0.42 + k * 24 + scroll;
      const f = H.clamp((yy - (cy - R * 0.45)) / (R * 0.75));
      const th = 1.5 + f * 12;
      c.fillRect(cx - R, yy, R * 2, th);
    }
    c.restore();
    // soft glow behind the disc
    c0.save();
    const gg = c0.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.6);
    gg.addColorStop(0, 'rgba(255,170,120,0.45)'); gg.addColorStop(1, 'rgba(255,100,180,0)');
    c0.fillStyle = gg; c0.fillRect(cx - R * 1.7, cy - R * 1.7, R * 3.4, R * 3.4);
    c0.drawImage(L, 0, 0);
    c0.restore();
  }

  function floor(c, W, Hh, t) {
    const g = c.createLinearGradient(0, HZ, 0, Hh);
    g.addColorStop(0, '#2a0a52'); g.addColorStop(0.5, '#1a0538'); g.addColorStop(1, '#0e0224');
    c.fillStyle = g; c.fillRect(0, HZ, W, Hh - HZ);
    // horizon haze
    const hg = c.createLinearGradient(0, HZ - 30, 0, HZ + 60);
    hg.addColorStop(0, 'rgba(255,120,200,0)'); hg.addColorStop(0.35, 'rgba(255,140,210,0.55)'); hg.addColorStop(1, 'rgba(255,120,200,0)');
    c.fillStyle = hg; c.fillRect(0, HZ - 30, W, 90);

    const vpx = W / 2, f = 260, camH = 1.0;
    const lines = (pass) => {
      c.beginPath();
      // longitudinal lines
      for (let i = -26; i <= 26; i++) {
        const xw = i * 0.9;
        const zNear = 0.35, zFar = 60;
        c.moveTo(vpx + (xw / zNear) * f, HZ + (camH / zNear) * f);
        c.lineTo(vpx + (xw / zFar) * f, HZ + (camH / zFar) * f);
      }
      // transverse lines (scrolling toward viewer)
      const off = (t * 1.6) % 0.9;
      for (let k = 0; k < 70; k++) {
        const z = 0.4 + k * 0.9 - off;
        if (z < 0.4) continue;
        const y = HZ + (camH / z) * f;
        if (y > Hh + 2) continue;
        c.moveTo(0, y); c.lineTo(W, y);
      }
      c.stroke();
    };
    c.save();
    c.beginPath(); c.rect(0, HZ, W, Hh - HZ); c.clip();
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = 'rgba(255,60,200,0.22)'; c.lineWidth = 7; lines();
    c.strokeStyle = 'rgba(120,240,255,0.35)'; c.lineWidth = 3; lines();
    c.strokeStyle = 'rgba(200,255,255,0.9)'; c.lineWidth = 1.2; lines();
    c.restore();
    // fade grid into horizon haze
    const fg = c.createLinearGradient(0, HZ, 0, HZ + 70);
    fg.addColorStop(0, 'rgba(255,150,215,0.85)'); fg.addColorStop(1, 'rgba(255,150,215,0)');
    c.fillStyle = fg; c.fillRect(0, HZ, W, 70);
  }

  // Palm silhouette
  function palm(c, x, y, h, lean, seed, col) {
    const r = H.rng(seed);
    c.save(); c.fillStyle = col; c.strokeStyle = col;
    // trunk: segmented, tapering, curved
    const segs = 22; let px = x, py = y;
    const topX = x + lean * h, topY = y - h;
    const pts = [];
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const bx = x + lean * h * (u * u * 0.6 + u * 0.4), by = y - h * u;
      pts.push([bx, by, H.lerp(h * 0.055, h * 0.028, u)]);
    }
    for (let i = 0; i < segs; i++) {
      const [ax, ay, aw] = pts[i], [bx, by, bw] = pts[i + 1];
      c.beginPath();
      c.moveTo(ax - aw, ay); c.lineTo(ax + aw, ay); c.lineTo(bx + bw * 1.15, by + 1); c.lineTo(bx - bw * 1.15, by + 1); c.closePath(); c.fill();
    }
    const [tx, ty] = pts[segs];
    // coconuts
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(tx + (i - 1) * h * 0.025, ty + h * 0.03, h * 0.022, 0, 7); c.fill(); }
    // fronds
    const fr = 9;
    for (let i = 0; i < fr; i++) {
      const a = -Math.PI / 2 + (i / (fr - 1) - 0.5) * Math.PI * 1.55 + r.range(-0.12, 0.12);
      const len = h * r.range(0.42, 0.6);
      const droop = h * r.range(0.18, 0.32);
      const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * 0.55 + droop;
      const cx1 = tx + Math.cos(a) * len * 0.55, cy1 = ty + Math.sin(a) * len * 0.75 - h * 0.06;
      // rib
      c.lineWidth = h * 0.009; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(cx1, cy1, ex, ey); c.stroke();
      // leaflets along rib
      const nL = 16;
      for (let k = 1; k <= nL; k++) {
        const u = k / (nL + 1);
        const qx = (1 - u) * (1 - u) * tx + 2 * (1 - u) * u * cx1 + u * u * ex;
        const qy = (1 - u) * (1 - u) * ty + 2 * (1 - u) * u * cy1 + u * u * ey;
        const dx = 2 * (1 - u) * (cx1 - tx) + 2 * u * (ex - cx1), dy = 2 * (1 - u) * (cy1 - ty) + 2 * u * (ey - cy1);
        const dl = Math.hypot(dx, dy), nx = -dy / dl, ny = dx / dl;
        const ll = h * 0.11 * Math.sin(u * Math.PI) + h * 0.02;
        for (const s of [-1, 1]) {
          c.beginPath();
          c.moveTo(qx, qy);
          c.lineTo(qx + nx * ll * s * 0.6 + dx / dl * ll * 0.25, qy + ny * ll * s * 0.6 + Math.abs(ll) * 0.75 + dy / dl * ll * 0.25);
          c.lineTo(qx + dx / dl * h * 0.018, qy + dy / dl * h * 0.018);
          c.closePath(); c.fill();
        }
      }
    }
    c.restore();
  }

  // Classical bust (profile facing left) as path in local units; origin = crown, approx 420 tall
  function bustPath(c) {
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(-30, -2, -58, 12, -68, 40);   // forehead curve
    c.bezierCurveTo(-72, 54, -72, 66, -76, 76);   // brow
    c.bezierCurveTo(-78, 80, -77, 84, -76, 88);   // brow ridge
    c.bezierCurveTo(-82, 100, -92, 112, -96, 122); // nose ridge
    c.bezierCurveTo(-96, 128, -90, 130, -80, 130); // nose tip -> nostril
    c.bezierCurveTo(-80, 134, -82, 138, -84, 142); // philtrum
    c.bezierCurveTo(-86, 146, -82, 149, -80, 150); // upper lip
    c.bezierCurveTo(-82, 153, -82, 157, -78, 160); // lower lip
    c.bezierCurveTo(-74, 164, -78, 170, -78, 176); // under-lip
    c.bezierCurveTo(-78, 188, -70, 198, -56, 200); // chin
    c.bezierCurveTo(-40, 202, -28, 206, -22, 214); // jaw underside
    c.bezierCurveTo(-24, 236, -30, 254, -36, 268); // neck front
    c.bezierCurveTo(-70, 282, -120, 290, -150, 316); // collarbone to shoulder
    c.bezierCurveTo(-172, 336, -180, 372, -176, 410); // shoulder down
    c.bezierCurveTo(-120, 424, -40, 432, 30, 428); // bust base curve
    c.bezierCurveTo(90, 424, 140, 414, 160, 404);
    c.bezierCurveTo(162, 370, 150, 338, 118, 312); // back shoulder
    c.bezierCurveTo(92, 292, 70, 276, 62, 250);   // trapezius
    c.bezierCurveTo(58, 230, 60, 214, 66, 200);   // neck back
    // curly hair along the back of head and crown
    const curls = [[78, 182], [92, 158], [98, 130], [100, 100], [94, 72], [80, 46], [60, 24], [36, 8], [12, 0]];
    let px = 66, py = 200;
    for (const [qx, qy] of curls) {
      const mx = (px + qx) / 2, my = (py + qy) / 2;
      const nx = (qy - py), ny = -(qx - px), nl = Math.hypot(nx, ny);
      c.quadraticCurveTo(mx - (nx / nl) * 14, my - (ny / nl) * 14, qx, qy);
      px = qx; py = qy;
    }
    c.closePath();
  }

  function drawBust(c, ox, oy, s, seed) {
    const nz = H.makeNoise(seed);
    c.save();
    c.translate(ox, oy); c.scale(s, s);
    bustPath(c);
    c.save(); c.clip();
    // marble base: soft light from upper-left (pink sun rim from behind-right)
    const g = c.createLinearGradient(-180, 0, 170, 60);
    g.addColorStop(0, '#fbf6fb'); g.addColorStop(0.45, '#e6dcea'); g.addColorStop(0.8, '#a996c4'); g.addColorStop(1, '#6f5a9e');
    c.fillStyle = g; c.fillRect(-200, -20, 400, 470);
    // form shading
    const sh = (x, y, r, col) => { const rg = c.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = rg; c.fillRect(x - r, y - r, r * 2, r * 2); };
    sh(-56, 94, 22, 'rgba(76,46,124,0.58)');   // eye socket
    sh(-60, 132, 19, 'rgba(80,50,125,0.48)');    // under nose
    sh(-66, 170, 14, 'rgba(80,50,125,0.48)');    // under lip
    sh(-74, 76, 10, 'rgba(255,255,255,0.55)');  // brow ridge catch-light
    sh(-88, 116, 9, 'rgba(255,255,255,0.6)');   // nose bridge catch-light
    sh(-50, 196, 22, 'rgba(255,255,255,0.4)');  // chin highlight
    sh(-82, 60, 22, 'rgba(255,255,255,0.6)');   // forehead highlight
    sh(-30, 130, 40, 'rgba(255,255,255,0.45)'); // cheek highlight
    sh(10, 120, 60, 'rgba(110,80,160,0.30)');   // temple/jaw turn
    sh(-10, 250, 46, 'rgba(90,60,140,0.45)');   // under jaw / neck shadow
    sh(-110, 360, 80, 'rgba(255,255,255,0.35)'); // chest highlight
    sh(40, 420, 120, 'rgba(70,40,120,0.35)');
    // ear
    c.strokeStyle = 'rgba(100,70,150,0.6)'; c.lineWidth = 3;
    c.beginPath(); c.ellipse(28, 118, 13, 22, 0.2, -1.2, 2.2); c.stroke();
    // hair: sculpted snail curls in a cap
    const r = H.rng(seed + 4);
    c.save();
    c.beginPath(); c.ellipse(30, 78, 82, 84, 0.15, 0, Math.PI * 2); c.clip();
    for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) {
      const hx = -58 + i * 19 + (j % 2) * 9 + r.range(-3, 3), hy = -4 + j * 19 + r.range(-3, 3);
      if (hx < -40 + Math.max(0, hy - 20) * 0.9 && hy > 18) continue; // keep the face clear
      if (hx < 40 && hx > -10 && hy > 92) continue; // ear / cheek area
      const rr = r.range(8, 11);
      const cg = c.createRadialGradient(hx - rr * 0.35, hy - rr * 0.4, 1, hx, hy, rr * 1.1);
      cg.addColorStop(0, 'rgba(255,255,255,0.75)'); cg.addColorStop(0.55, 'rgba(210,195,225,0.2)'); cg.addColorStop(1, 'rgba(90,60,140,0.55)');
      c.fillStyle = cg; c.beginPath(); c.arc(hx, hy, rr, 0, 7); c.fill();
      c.strokeStyle = 'rgba(90,60,140,0.55)'; c.lineWidth = 1.6;
      c.beginPath(); for (let a = 0; a < 9; a += 0.3) { const q = rr * (1 - a / 10); const X = hx + Math.cos(a + i) * q * 0.8, Y = hy + Math.sin(a + i) * q * 0.8; a === 0 ? c.moveTo(X, Y) : c.lineTo(X, Y); } c.stroke();
    }
    c.restore();
    // hairline edge shadow
    c.strokeStyle = 'rgba(100,70,150,0.45)'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(-58, 20); c.quadraticCurveTo(-34, 30, -14, 74); c.quadraticCurveTo(0, 96, 6, 100); c.stroke();
    // marble veins
    c.lineCap = 'round';
    for (let v = 0; v < 7; v++) {
      let x = r.range(-170, 150), y = r.range(-10, 420);
      c.strokeStyle = `rgba(120,100,150,${r.range(0.18, 0.4)})`; c.lineWidth = r.range(0.6, 1.8);
      c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 40; k++) { const a = nz.n2(x * 0.01, y * 0.01 + v) * 3 + 0.6; x += Math.cos(a) * 7; y += Math.sin(a) * 7; c.lineTo(x, y); }
      c.stroke();
    }
    // rim light from the sun (pink) along the back edge
    c.globalCompositeOperation = 'source-atop';
    c.restore();
    c.save(); bustPath(c); c.clip();
    c.lineWidth = 16; c.strokeStyle = 'rgba(255,120,200,0.55)'; c.filter = 'blur(6px)';
    c.translate(-10, 0); bustPath(c); c.stroke(); c.filter = 'none';
    c.restore();
    // eye line + lips detail
    c.strokeStyle = 'rgba(80,50,120,0.6)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-68, 90); c.quadraticCurveTo(-58, 84, -44, 90); c.stroke(); // upper lid
    c.lineWidth = 1.4; c.beginPath(); c.moveTo(-66, 97); c.quadraticCurveTo(-56, 101, -46, 96); c.stroke();
    c.fillStyle = 'rgba(70,40,110,0.3)'; c.beginPath(); c.ellipse(-57, 93, 6, 3, 0, 0, 7); c.fill(); // blank eye
    c.lineWidth = 2.2; c.beginPath(); c.moveTo(-82, 151); c.quadraticCurveTo(-74, 154, -64, 150); c.stroke(); // mouth
    c.beginPath(); c.moveTo(-84, 128); c.quadraticCurveTo(-74, 128, -70, 120); c.stroke(); // nostril wing
    c.fillStyle = 'rgba(60,30,100,0.45)'; c.beginPath(); c.ellipse(-80, 127, 4, 2.2, 0.3, 0, 7); c.fill(); // nostril
    c.restore();
    // sculpted edges: a crisp lilac-white specular rim on the edges facing the key light (upper left) and a
    // narrow core shadow on the edges turning away (lower right) -> reads as carved stone, not a soft blob
    const cw = c.canvas.width, chh = c.canvas.height;
    const edge = (dx, dy, col, a) => {
      const E = H.layer(cw, chh), ec = E.getContext('2d');
      ec.setTransform(c.getTransform()); ec.translate(ox, oy); ec.scale(s, s);
      ec.fillStyle = col; bustPath(ec); ec.fill();
      ec.globalCompositeOperation = 'destination-out'; ec.translate(dx, dy); bustPath(ec); ec.fill();
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.drawImage(E, 0, 0); c.restore();
    };
    edge(3.2, 2.4, '#fff6ff', 0.75);
    edge(-2.6, -3.4, '#4a2a7e', 0.4);
  }

  // drawBust is static (fixed seed), so render it once per scale into a sprite and blit it.
  const bustCache = {};
  function bustSprite(s) {
    const key = s.toFixed(3);
    if (bustCache[key]) return bustCache[key];
    const pad = 12, ox = pad + 190 * s, oy = pad + 12 * s;
    const C = H.layer(Math.ceil(360 * s + pad * 2), Math.ceil(452 * s + pad * 2));
    drawBust(C.getContext('2d'), ox, oy, s, 21);
    return (bustCache[key] = { C, ox, oy });
  }
  function blitBust(c, bx, by, s) { const b = bustSprite(s); c.drawImage(b.C, bx - b.ox, by - b.oy); }

  function pedestal(c, x, y, w, h, t) {
    // front face checkerboard + top face in perspective
    const n = 8, cw = w / n, chh = h / 4;
    c.save();
    for (let j = 0; j < 4; j++) for (let i = 0; i < n; i++) {
      c.fillStyle = (i + j) % 2 ? '#111' : '#f4f0f6';
      c.fillRect(x + i * cw, y + j * chh, cw + 0.5, chh + 0.5);
    }
    const d = 26;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + d, y - d * 0.6); c.lineTo(x + w + d, y - d * 0.6); c.lineTo(x + w, y); c.closePath();
    c.fillStyle = '#d8cfe6'; c.fill();
    c.beginPath(); c.moveTo(x + w, y); c.lineTo(x + w + d, y - d * 0.6); c.lineTo(x + w + d, y + h - d * 0.6); c.lineTo(x + w, y + h); c.closePath();
    c.fillStyle = '#3a2066'; c.fill();
    // side checker hint
    c.fillStyle = 'rgba(255,255,255,0.18)';
    for (let j = 0; j < 4; j += 2) { c.beginPath(); c.moveTo(x + w, y + j * chh); c.lineTo(x + w + d, y + j * chh - d * 0.6); c.lineTo(x + w + d, y + (j + 1) * chh - d * 0.6); c.lineTo(x + w, y + (j + 1) * chh); c.fill(); }
    c.restore();
  }

  // =====================================================================================
  // EXPLAINER: told on a worn VHS tape. Scenes change with a tape cut (VCR blue screen + vertical roll),
  // the persistent header is the VCR's on-screen menu, the counter is the tape counter, and the
  // "model" is the marble bust. Pastel pop-up windows and neon floor chevrons carry the logic.
  // =====================================================================================
  const cl = H.clamp, EZ = H.ease;
  const FP = (xw, z) => [640 + (xw / z) * 260, HZ + (1 / z) * 260]; // floor projection (matches floor())
  function chroma(c, txt, x, y, font, col, off, align = 'left', spacing = '0px', legible = 0) {
    c.save(); c.font = font; c.textAlign = align; c.textBaseline = 'alphabetic'; c.letterSpacing = spacing;
    if (legible > 0) { // dark aubergine underlay so pale text holds on the pink haze and the checker plinth
      c.lineJoin = 'round'; c.shadowColor = `rgba(30,0,60,${legible})`; c.shadowBlur = 14;
      c.strokeStyle = `rgba(40,0,70,${0.5 * legible})`; c.lineWidth = 4 + 4 * legible;
      for (let k = 0; k < 3; k++) c.strokeText(txt, x, y + 2);
      c.shadowColor = 'transparent'; c.shadowBlur = 0;
    }
    c.fillStyle = '#00f0ff'; c.fillText(txt, x + off, y + off * 0.6);
    c.fillStyle = '#ff2bd6'; c.fillText(txt, x - off, y - off * 0.4);
    c.fillStyle = col; c.fillText(txt, x, y);
    c.restore();
  }
  function osd(c, txt, x, y, px = 34, align = 'left') {
    c.save(); c.font = `400 ${px}px "VT323"`; c.textAlign = align; c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,0.7)'; c.shadowOffsetX = 2; c.shadowOffsetY = 2; c.fillText(txt, x, y); c.restore();
  }
  function silhouette(c, kind, x, y, s, col) {
    c.save(); c.fillStyle = col; c.translate(x, y); c.scale(s, s); c.beginPath();
    if (kind === 'cat') { c.moveTo(-20, -6); c.lineTo(-17, -30); c.lineTo(-5, -18); c.lineTo(5, -18); c.lineTo(17, -30); c.lineTo(20, -6); c.ellipse(0, 2, 21, 17, 0, 0, Math.PI); c.closePath(); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-8, -2, 3, 4, 0, 0, 7); c.ellipse(8, -2, 3, 4, 0, 0, 7); c.fill(); }
    else { c.ellipse(0, 0, 15, 19, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(-17, 0, 7, 15, 0.35, 0, 7); c.ellipse(17, 0, 7, 15, -0.35, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-6, -4, 2.5, 3.5, 0, 0, 7); c.ellipse(6, -4, 2.5, 3.5, 0, 0, 7); c.fill(); c.fillStyle = '#1a0634'; c.beginPath(); c.ellipse(0, 8, 4, 3, 0, 0, 7); c.fill(); }
    c.restore();
  }
  function polaroid(c, x, y, s, kind, label, rot = 0, a = 1) {
    c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.scale(s, s);
    c.shadowColor = 'rgba(40,0,80,0.45)'; c.shadowBlur = 14; c.shadowOffsetY = 6;
    c.fillStyle = '#fbf6ff'; c.fillRect(-46, -50, 92, 112); c.shadowColor = 'transparent';
    const g = c.createLinearGradient(0, -42, 0, 34); g.addColorStop(0, kind === 'cat' ? '#ffb3e6' : '#9ff0ff'); g.addColorStop(1, kind === 'cat' ? '#c9a6ff' : '#ffd6a5');
    c.fillStyle = g; c.fillRect(-38, -42, 76, 76);
    silhouette(c, kind, 0, 0, 1, '#2a0b4c');
    if (label) { c.font = '400 36px "VT323"'; c.textAlign = 'center'; c.fillStyle = '#2a0b4c'; c.fillText(label, 0, 59); }
    c.restore();
  }
  function popup(c, x, y, w, h, title, a = 1) {
    c.save(); c.globalAlpha = a;
    c.fillStyle = 'rgba(40,0,80,0.35)'; c.fillRect(x + 8, y + 10, w, h);
    c.fillStyle = '#e9ddff'; c.fillRect(x, y, w, h);
    c.fillStyle = '#fff'; c.fillRect(x, y, w, 2); c.fillRect(x, y, 2, h); c.fillStyle = '#6a4a9a'; c.fillRect(x, y + h - 2, w, 2); c.fillRect(x + w - 2, y, 2, h);
    const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#ff71ce'); g.addColorStop(1, '#01cdfe');
    c.fillStyle = g; c.fillRect(x + 4, y + 4, w - 8, 26);
    c.font = '400 24px "VT323"'; c.fillStyle = '#fff'; c.fillText(title, x + 12, y + 24);
    c.fillStyle = '#e9ddff'; c.fillRect(x + w - 30, y + 7, 21, 20); c.fillStyle = '#2a0b4c'; c.font = '400 22px "VT323"'; c.fillText('x', x + w - 24, y + 23);
    c.restore();
  }
  function neonLine(c, pts, prog, col, w = 3) {
    let tot = 0; const L = []; for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); L.push(l); tot += l; }
    let rem = tot * cl(prog); const out = [pts[0]]; let a = 0;
    for (let i = 0; i < L.length && rem > 0; i++) { const u = Math.min(1, rem / L[i]); out.push([H.lerp(pts[i][0], pts[i + 1][0], u), H.lerp(pts[i][1], pts[i + 1][1], u)]); a = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]); rem -= L[i]; }
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.shadowColor = col; c.shadowBlur = 16; c.strokeStyle = col; c.lineWidth = w;
    c.beginPath(); c.moveTo(...out[0]); for (const p of out) c.lineTo(...p);
    if (prog >= 1) { const [ex, ey] = out[out.length - 1]; c.moveTo(ex - Math.cos(a - 0.5) * 18, ey - Math.sin(a - 0.5) * 18); c.lineTo(ex, ey); c.lineTo(ex - Math.cos(a + 0.5) * 18, ey - Math.sin(a + 0.5) * 18); }
    c.stroke(); c.shadowBlur = 0; c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = w * 0.35; c.stroke(); c.restore();
  }
  function bustLayer(W, H_, bx, by, bs, withPlinth) {
    const L = H.layer(W, H_), lc = L.getContext('2d');
    blitBust(lc, bx, by, bs);
    if (withPlinth) pedestal(lc, bx - 175 * bs - 8, by + 428 * bs - 4, 336 * bs + 16, 150, 0);
    return L;
  }
  function glitchDraw(ctx, L, W, H_, t, gl, seed) {
    ctx.save(); ctx.globalAlpha = 0.4; ctx.globalCompositeOperation = 'lighter';
    const tint = (col, dx) => { const T = H.layer(W, H_), tc = T.getContext('2d'); tc.drawImage(L, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, W, H_); ctx.drawImage(T, dx, 0); };
    tint('#00e5ff', -10 * gl); tint('#ff2bd6', 9 * gl);
    ctx.restore();
    const gr = H.rng(Math.floor(t * 8) + seed); let y = 0;
    while (y < H_) { const hgt = gr.int(4, 40); const sh = gr.chance(0.15 * Math.min(2, gl)) ? gr.range(-40, 40) * gl : 0; ctx.drawImage(L, 0, y, W, hgt, sh, y, W, hgt); y += hgt; }
  }
  // VHS playback pass shared by the still and the explainer.
  // o: { roll, bandY, bandH, wobK, streakP, streakL, speck, desat, protect: [y0, y1, k] }
  // Luma stays sharp; chroma is low-passed (VHS colour-under has ~1/8 the luma bandwidth), delayed to the right,
  // with red and blue slightly misregistered. The bottom rows carry head-switching skew, like a real VCR.
  const vbuf = {};
  function vhsPass(ctx, W, H_, t, o) {
    const img = ctx.getImageData(0, 0, W, H_), d = img.data, src = new Uint8ClampedArray(d);
    const nz = H.makeNoise(31), tr = H.rng(Math.floor(t * 24) + 1), hr = H.rng(Math.floor(t * 24) + 77);
    const { roll, bandY, bandH } = o;
    if (!vbuf.W || vbuf.W !== W) { vbuf.W = W; vbuf.pY = new Float32Array(W + 1); vbuf.pR = new Float32Array(W + 1); vbuf.pB = new Float32Array(W + 1); }
    const pY = vbuf.pY, pR = vbuf.pR, pB = vbuf.pB, CW = 5, CB = 0.42, HS = 9;
    const pv = o.protect;
    for (let yy = 0; yy < H_; yy++) {
      const sy = (yy + roll) % H_;
      if (roll > 0 && (yy + roll) % H_ > H_ - 22) { for (let xx = 0; xx < W; xx++) { const i = (yy * W + xx) * 4; d[i] = d[i + 1] = d[i + 2] = 8; } continue; }
      const inBand = yy > bandY && yy < bandY + bandH;
      let bk = inBand ? Math.sin(((yy - bandY) / bandH) * Math.PI) : 0;
      if (pv && yy > pv[0] && yy < pv[1]) bk *= pv[2];
      let wob = nz.n2(yy * 0.05, t * 2) * 2.2 + (inBand ? (tr() - 0.3) * o.wobK * bk : 0);
      const hsw = yy >= H_ - HS ? (yy - (H_ - HS) + 1) / HS : 0;
      if (hsw) wob -= 6 + hsw * hsw * 26 + hr() * 6;
      const scan = (yy & 1) ? 0.9 : 1.0;
      let s0 = -1, s1 = -1, sv = 0;
      if (inBand && tr() < o.streakP * bk + 0.03 * Math.min(1, bk * 4)) { s0 = tr() * W; s1 = s0 + tr() * o.streakL * bk + 20; sv = tr() * 0.8 + 0.2; }
      // row prefix sums of luma, red, blue for the chroma low-pass
      const row = sy * W * 4;
      for (let xx = 0; xx < W; xx++) {
        const j = row + xx * 4, R = src[j], G = src[j + 1], B = src[j + 2];
        pY[xx + 1] = pY[xx] + 0.299 * R + 0.587 * G + 0.114 * B; pR[xx + 1] = pR[xx] + R; pB[xx + 1] = pB[xx] + B;
      }
      const W1 = W - 1;
      for (let xx = 0; xx < W; xx++) {
        const i = (yy * W + xx) * 4;
        const sx = Math.min(W1, Math.max(0, Math.round(xx - wob)));
        const j = row + sx * 4;
        // classic R/B misregistration (sharp, offset samples) ...
        let R = src[row + Math.min(W1, sx + 3) * 4], G = src[j + 1], B = src[row + Math.max(0, sx - 3) * 4 + 2];
        // ... plus colour-under bleed: chroma partly replaced by a low-passed, ~2px-delayed copy
        const Y = 0.299 * R + 0.587 * G + 0.114 * B;
        let c0 = sx - 2 - CW, c1 = sx - 2 + CW + 1; if (c0 < 0) c0 = 0; if (c1 > W) c1 = W; if (c1 <= c0) { c0 = 0; c1 = 1; }
        const n = 1 / (c1 - c0), mY = (pY[c1] - pY[c0]) * n;
        R += (((pR[c1] - pR[c0]) * n - mY) - (R - Y)) * CB;
        B += (((pB[c1] - pB[c0]) * n - mY) - (B - Y)) * CB;
        G = (Y - 0.299 * R - 0.114 * B) * 1.7036;
        if (inBand) {
          const nn = tr();
          if (xx > s0 && xx < s1) { R = H.lerp(R, 245, sv); G = H.lerp(G, 240, sv); B = H.lerp(B, 255, sv); }
          else if (nn < o.speck * bk + 0.004 * Math.min(1, bk * 4)) { R = G = B = 235; }
          else if (o.desat) { const l = (R + G + B) / 3; R = H.lerp(R, l + 30, bk * 0.6); G = H.lerp(G, l + 30, bk * 0.6); B = H.lerp(B, l + 40, bk * 0.6); }
        }
        if (hsw && hr() < 0.08 * hsw) { R = G = B = 200; }
        d[i] = R * scan; d[i + 1] = G * scan; d[i + 2] = B * scan;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  function vhs(ctx, W, H_, t, roll, bandY, protect) {
    vhsPass(ctx, W, H_, t, { roll, bandY, bandH: 60, wobK: 24, streakP: 0.3, streakL: 380, speck: 0.05, desat: false, protect });
  }

  function explainVW(ctx, W, H_, t) {
    const CUT1 = 6.0, CUT2 = 10.4, CUT3 = 12.7;
    const scene = t < CUT1 ? 0 : t < CUT2 ? 1 : t < CUT3 ? 2 : 3;
    const cutT = [0, CUT1, CUT2, CUT3][scene];
    const lt = t - cutT;
    // world background (all scenes)
    sky(ctx, W);
    const r = H.rng(77);
    for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(255,230,255,${r.range(0.2, 0.8) * (0.6 + 0.4 * Math.sin(t * 3 + i))})`; ctx.fillRect(r.range(0, W), r.range(0, HZ * 0.55), 1.5, 1.5); }
    const sunX = scene === 1 ? 300 : scene === 2 ? 640 : 470;
    sun(ctx, sunX, HZ - 70, 210, t);
    floor(ctx, W, H_, t);
    if (scene !== 2) {
      palm(ctx, 175, HZ + 40, 260, -0.12, 8, '#2a0b4c'); palm(ctx, 1120, HZ + 50, 250, 0.16, 11, '#2a0b4c');
      palm(ctx, 70, HZ + 120, 400, 0.28, 3, '#1a0634'); palm(ctx, 1225, HZ + 140, 430, -0.3, 5, '#1a0634');
    }

    if (scene === 0) {
      // bust + plinth rise up through the floor as "the model"
      const rise = EZ.out(cl((t - 2.0) / 0.8));
      if (rise > 0) {
        const L = bustLayer(W, H_, 860, 132 + (1 - rise) * 420, 0.86, true);
        glitchDraw(ctx, L, W, H_, t, 0.6 + 2.5 * (1 - rise) + 0.3 * Math.sin(t * 5), 5);
      }
      // neon chevrons on the floor pointing at the bust
      if (t > 2.5) for (let k = 0; k < 4; k++) {
        const xw = -2.2 + k * 0.9 + ((t * 0.9) % 0.9), z = 1.35;
        const [x, y] = FP(xw, z); const a = cl((t - 2.5 - k * 0.1) / 0.2);
        ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 14; ctx.strokeStyle = '#7ff8ff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - 18, y - 22); ctx.lineTo(x + 6, y); ctx.lineTo(x - 18, y + 22); ctx.stroke(); ctx.restore();
      }
      if (rise >= 1) { // caption on a dark OSD-style plate so it separates from the checker plinth
        ctx.save(); ctx.font = '700 36px "Noto Serif JP"'; const tw = ctx.measureText('THE MODEL  モデル').width, lx = 848;
        ctx.fillStyle = 'rgba(20,0,40,0.62)'; ctx.strokeStyle = 'rgba(255,190,240,0.45)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(lx - tw / 2 - 12, 668 - 36, tw + 24, 50, 8); ctx.fill(); ctx.stroke(); ctx.restore();
        chroma(ctx, 'THE MODEL  モデル', lx, 668, '700 36px "Noto Serif JP"', '#fff4fb', 3, 'center', '0px', 0.6);
      }
      // labelled polaroids slide in along the floor and vanish into the bust
      if (t > 2.6) for (let k = 0; k < 12; k++) {
        const t0 = 2.6 + k * 0.3, p = (t - t0) / 1.1; if (p < 0 || p > 1) continue;
        const x = H.lerp(80, 830, EZ.inOut(p)), y = H.lerp(470, 300, EZ.inOut(p)) - Math.sin(p * Math.PI) * 60;
        const kind = k % 2 ? 'dog' : 'cat';
        polaroid(ctx, x, y, H.lerp(1.7, 0.45, p), kind, kind, Math.sin(k * 1.7) * 0.15, cl((1 - p) * 5));
      }
      const n = 1e6 * EZ.inOut(cl((t - 2.7) / 2.9));
      if (t > 2.6) { osd(ctx, Math.round(n).toLocaleString('en-US'), 40, H_ - 74, 80); osd(ctx, 'LABELLED EXAMPLES', 44, H_ - 30, 40); }
    }
    if (scene === 1) {
      // close-up: bust on the left, test polaroid, pastel guess.exe window
      const L = bustLayer(W, H_, 470, 70, 1.25, false);
      const burst = (t > 8.0 && t < 8.25) ? 2.4 : 0;
      glitchDraw(ctx, L, W, H_, t, 0.5 + burst + (lt < 0.3 ? 2 : 0), 9);
      polaroid(ctx, 150, 500, 1.5, 'cat', '?', -0.12);
      neonLine(ctx, [[225, 420], [300, 360]], cl((lt - 0.4) / 0.3), '#7ff8ff');
      const step = t < 7.0 ? -1 : t < 7.9 ? 0 : t < 8.5 ? 1 : t < 9.6 ? 2 : t < 10.0 ? 0 : 1;
      const pa = cl((t - 6.9) / 0.15);
      if (pa > 0) {
        neonLine(ctx, [[560, 230], [680, 200]], cl((t - 6.7) / 0.25), '#7ff8ff');
        popup(ctx, 690, 100, 540, 320, 'guess.exe', pa);
        ctx.save(); ctx.globalAlpha = pa;
        if (t < 9.6) {
          chroma(ctx, 'dog?', 800, 250, '400 110px "VT323"', '#2a0b4c', 2);
          if (t > 7.9) {
            chroma(ctx, '✕', 1040, 252, '400 120px "VT323"', '#ff2b6a', 4 + burst * 4);
            ctx.font = '400 46px "VT323"'; ctx.fillStyle = '#c0004a'; ctx.fillText("check: it's a CAT", 740, 312);
            ctx.strokeStyle = '#ff2b6a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(890, 215, 130, 62, -0.05, -1.6, -1.6 + cl((t - 7.95) / 0.3) * 6.3); ctx.stroke();
          }
        } else {
          chroma(ctx, 'cat', 800, 250, '400 110px "VT323"', '#2a0b4c', 2);
          chroma(ctx, '✓', 1010, 252, '400 120px "VT323"', '#00c896', 3);
          ctx.font = '400 46px "VT323"'; ctx.fillStyle = '#008a66'; ctx.fillText('correct!', 740, 312);
        }
        // weights: pastel EQ sliders
        ctx.font = '400 38px "VT323"'; ctx.fillStyle = '#6a4a9a'; ctx.fillText('weights', 720, 384);
        const adj = EZ.inOut(cl((t - 8.9) / 0.6));
        [[0.2, 0.7], [0.8, 0.35], [0.45, 0.9]].forEach(([a, b], i) => {
          const x = 860 + i * 115, v = H.lerp(a, b, adj);
          ctx.fillStyle = '#c9b6f0'; ctx.fillRect(x, 370, 90, 8);
          ctx.fillStyle = t > 8.85 && t < 9.6 ? '#ff2bd6' : '#01cdfe'; ctx.fillRect(x + v * 74, 356, 16, 36);
        });
        ctx.restore();
      }
      if (t > 8.5 && t < 9.6) { // error pulse back into the bust
        neonLine(ctx, [[760, 360], [650, 420], [560, 330]], cl((t - 8.5) / 0.4), '#ff2bd6', 4);
        osd(ctx, 'ERROR', 600, 468, 48);
      }
      // loop pills
      const labs = ['GUESS', 'CHECK', 'ADJUST'];
      labs.forEach((lab, i) => {
        const x = 700 + i * 180, y = 462, act = i === step;
        ctx.save(); ctx.fillStyle = act ? '#ff71ce' : 'rgba(40,0,80,0.6)'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(x, y, 150, 56, 28); ctx.fill(); ctx.stroke();
        ctx.font = '400 44px "VT323"'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(lab, x + 75, y + 41); ctx.restore();
        if (i < 2) { ctx.save(); ctx.fillStyle = '#fff'; ctx.font = '400 44px "VT323"'; ctx.fillText('›', x + 157, y + 41); ctx.restore(); }
      });
      neonLine(ctx, [[1170, 520], [1170, 552], [775, 552], [775, 524]], 1, '#b9a2ff', 3);
      osd(ctx, 'LOOP - again and again', 970, 594, 36, 'center');
    }
    if (scene === 2) {
      // chart drawn across the sky, number with chroma split
      const gx0 = 110, gx1 = 760, gy0 = 150, gy1 = 440;
      ctx.save(); ctx.fillStyle = 'rgba(30,5,60,0.55)'; ctx.fillRect(gx0 - 20, gy0 - 30, gx1 - gx0 + 40, gy1 - gy0 + 50); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5;
      for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(gx0, H.lerp(gy1, gy0, i / 4)); ctx.lineTo(gx1, H.lerp(gy1, gy0, i / 4)); ctx.stroke(); }
      ctx.restore();
      osd(ctx, 'TRAINING ROUNDS →', gx0, gy1 + 50, 42);
      const pr = cl((lt - 0.45) / 1.2), N = 20, val = (u) => 61 + 36 * (1 - Math.pow(1 - u, 2.2));
      const P = (u) => [H.lerp(gx0, gx1, u), H.lerp(gy1, gy0, (val(u) - 50) / 50)];
      if (pr > 0) { const pts = []; for (let i = 0; i <= N * pr; i++) pts.push(P(i / N)); pts.push(P(pr)); neonLine(ctx, pts, 1, '#ff71ce', 8); for (let i = 0; i <= N * pr; i += 4) { const [x, y] = P(i / N); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); } }
      const acc = Math.round(val(pr));
      chroma(ctx, 'ACCURACY  せいど', 830, 196, '700 38px "Noto Serif JP"', '#fff4fb', 2, 'left', '0px', 0.8);
      const hit = lt > 1.7;
      chroma(ctx, acc + '%', 830, 330, '900 130px "Noto Serif JP"', '#fff4fb', hit ? 6 + 4 * Math.sin(t * 30) : 3);
      if (hit) {
        ctx.save(); ctx.strokeStyle = '#7ff8ff'; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 18; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(985, 285, 190, 92, -0.05, -1.6, -1.6 + cl((lt - 1.7) / 0.3) * 6.3); ctx.stroke(); ctx.restore();
        osd(ctx, 'up from 61%', 850, 420, 46);
      }
    }
    if (scene === 3) {
      const L = bustLayer(W, H_, 1010, 180, 0.76, true);
      glitchDraw(ctx, L, W, H_, t, 0.5, 13);
      const n1 = cl(Math.floor((lt - 0.15) / 0.03), 0, 13), n2 = cl(Math.floor((lt - 0.6) / 0.03), 0, 14);
      chroma(ctx, 'MORE EXAMPLES'.slice(0, n1), 60, 330, '600 56px "Inter"', '#fff4fb', 3, 'left', '6px', 0.7);
      chroma(ctx, '→ BETTER GUESSES'.slice(0, n2 + 2), 60, 420, '600 56px "Inter"', '#fff4fb', 3, 'left', '6px', 0.7);
      if (lt > 1.1) chroma(ctx, 'もっとデータ・もっとかしこい', 64, 484, '700 32px "Noto Serif JP"', '#ffe9f6', 2, 'left', '0px', 1);
    }
    // ---- header: question glitches in big, then becomes the VCR on-screen menu line ----
    if (t < 2.1) {
      const k = cl(Math.floor((t - 0.3) / 0.035), 0, 18);
      const jitter = t > 1.75 ? 30 * Math.sin(t * 90) : 0;
      chroma(ctx, 'HOW DOES AI LEARN?'.slice(0, k), 640 + jitter, 300, '600 58px "Inter"', '#fff4fb', 5, 'center', '12px', 0.6);
      if (k >= 18) chroma(ctx, 'エーアイはどうまなぶ？', 640, 360, '700 30px "Noto Serif JP"', '#ffe9f6', 3, 'center', '0px', 1);
    } else {
      osd(ctx, '▶ HOW DOES AI LEARN?', 40, 58, 36);
      osd(ctx, ['CH 1 — TRAINING DATA', 'CH 2 — GUESS/CHECK/ADJUST', 'CH 3 — PROGRESS', 'CH 4 — TAKEAWAY'][scene], 40, 94, 30);
    }
    // ---- tape cut transition: blue screen + roll ----
    let roll = 0;
    const sinceCut = t - cutT;
    if (scene > 0 && sinceCut < 0.5) roll = Math.round((1 - EZ.out(cl((sinceCut - 0.12) / 0.38))) * H_ * 0.85);
    const bandY = ((t * 0.21 + 0.3) % 1) * (H_ + 160) - 80;
    // keep the takeaway readable: once it has typed on, the tracking band only grazes the two headline rows
    const prot = scene === 3 ? [262, 446, 1 - 0.85 * cl((lt - 0.6) / 0.25)] : null;
    vhs(ctx, W, H_, t, roll, bandY, prot);
    if (scene > 0 && sinceCut < 0.12) {
      ctx.fillStyle = '#1f33d6'; ctx.fillRect(0, 0, W, H_);
      const nr = H.rng(Math.floor(t * 24) + 40);
      for (let i = 0; i < 50; i++) { ctx.fillStyle = `rgba(255,255,255,${nr.range(0.05, 0.4)})`; ctx.fillRect(0, nr.range(0, H_), W, nr.range(1, 4)); }
      osd(ctx, '▶▶', W - 120, 58, 40);
    }
    H.grain(ctx, W, H_, 0.07, Math.floor(t * 24) + 9, true);
    ctx.save(); ctx.font = '400 34px "VT323"'; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
    ctx.fillText('PLAY ▶', W - 170, 58);
    const secs = 1312 + Math.floor(t);
    ctx.fillText(`SP  0:${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`, W - 230, H_ - 34);
    ctx.restore();
    H.vignette(ctx, W, H_, 0.45, '20,0,40');
  }

  // ---- SOUND: a worn VHS tape. Hiss + VCR motor under a slow dreamy maj7 pad; scene cuts are tape cuts (the pad
  // slows to a stop, the VCR mechanism clunks, a fast-forward whir under the blue screen, the picture rolls into lock).
  // Soft Rhodes-like bell notes for things landing. Times copy explainVW (CUT1/2/3 and the per-scene lt offsets).
  function vwSound(k) {
    const END = 15, CUT1 = 6.0, CUT2 = 10.4, CUT3 = 12.7;
    // soft electric-piano bell: sine + quiet 2nd partial, long reverb tail. Stays below ~1.5 kHz.
    const ep = (t, n, g = 1, pan = 0, minor = false) => {
      k.tone(t, { f: n, dur: 1.4, gain: 0.12 * g, a: 0.006, verb: 0.45, pan, minor });
      k.tone(t, { f: k.hz(n) * 2, dur: 0.4, gain: 0.03 * g, a: 0.004, verb: 0.3, pan, minor });
    };
    // tape tracking crackle: short band of hissy static
    const crackle = (t, d, g = 1, minor = true) => k.noise(t, { dur: d, filter: 'bandpass', f: [[0, 2400], [d, 1400]], q: 0.7, gain: 0.07 * g, a: 0.004, minor });
    // tape cut at c: pad slows to a stop, mechanism clunk, FF whir under the blue screen (0.12 s), roll settles (to 0.5 s)
    const cut = (c, root) => {
      [root, k.hz(root) * 1.5].forEach((f, i) => k.tone(c - 0.28, { f: [[0, f], [0.28, k.hz(f) * 0.3]], type: 'sawtooth', dur: 0.3, gain: 0.07 - i * 0.02, a: 0.01, hold: 0.18, filter: 'lowpass', f2: [[0, 1200], [0.28, 300]] }));
      k.play('thud', c, { f: 85, gain: 0.45 });
      k.noise(c, { dur: 0.015, filter: 'bandpass', f: 1300, q: 2, gain: 0.3, a: 0.0005 });
      k.noise(c, { dur: 0.14, filter: 'bandpass', f: [[0, 1400], [0.12, 2200]], q: 3, gain: 0.1, a: 0.01, hold: 0.09 });  // fast-forward whir
      k.noise(c + 0.12, { dur: 0.4, color: 'pink', filter: 'lowpass', f: [[0, 1800], [0.38, 250]], gain: 0.09, a: 0.02 }); // roll sliding down
      k.noise(c + 0.5, { dur: 0.06, color: 'brown', filter: 'lowpass', f: 400, gain: 0.25, a: 0.002, minor: true });       // lock
    };
    // a neon line drawing on: the tube strikes (small zap) and hums while it draws
    const neonDraw = (t, d, g = 1, pan = 0, minor = true) => {
      k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1200, q: 1.5, gain: 0.12 * g, a: 0.001, pan, minor });
      k.tone(t, { f: 120, type: 'sawtooth', dur: d + 0.1, gain: 0.07 * g, a: 0.01, hold: d * 0.7, filter: 'bandpass', f2: 700, q: 1.2, pan, minor });
      k.play('neon', t, { dur: d, gain: 0.8 * g, pan, minor });
    };
    // counter ticks: one tick each time value advances by `step`, never closer than 1/12 s (so it slows as it settles)
    const counter = (t0, t1, fn, step, play) => {
      let last = -1, lastV = fn(t0);
      for (let t = t0; t <= t1 + 1e-6; t += 1 / 120) { const v = fn(t); if (v - lastV >= step && t - last >= 1 / 12) { play(t); last = t; lastV = v; } }
    };

    // ---- beds + music: tape hiss and the VCR motor; pad per scene, each one stopped by the tape cut
    k.bed('hiss', 0, END, { gain: 1.6 });
    k.bed('hum', 0, END, { gain: 0.35 });
    const pad = (t0, t1, chords) => k.music('pad', t0, t1, { bpm: 60, gain: 0.55, chords });
    pad(0, CUT1 - 0.25, [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4']]);
    pad(CUT1 + 0.12, CUT2 - 0.25, [['D3', 'F3', 'A3', 'C4'], ['G3', 'B3', 'D4', 'F#4']]);
    pad(CUT2 + 0.12, CUT3 - 0.25, [['Bb3', 'D4', 'F4', 'A4']]);
    pad(CUT3 + 0.12, END, [['F3', 'A3', 'C4', 'E4']]);

    // ---- scene 0: question glitches in letter by letter (0.3 + k*0.035), subtitle lands, header snaps to the VCR OSD
    for (let i = 0; i < 18; i += 3) crackle(0.3 + i * 0.035, 0.05, 0.8);
    ep(0.3 + 18 * 0.035, 'C5', 0.9); ep(0.3 + 18 * 0.035 + 0.09, 'E5', 0.6);
    crackle(1.75, 0.35, 1.4, false);                                            // title shakes (jitter 1.75..2.1)
    k.tone(1.75, { f: [[0, 220], [0.17, 180], [0.35, 230]], type: 'triangle', dur: 0.36, gain: 0.05, a: 0.02 });  // tape wobble
    k.noise(2.1, { dur: 0.012, filter: 'bandpass', f: 1600, q: 2, gain: 0.2, a: 0.0005 }); // OSD header clicks on
    // the bust rises through the floor (2.0..2.8, ease-out), heavily glitched, and its caption lands at 2.8
    k.noise(2.0, { dur: 0.75, color: 'brown', filter: 'lowpass', f: [[0, 120], [0.6, 600]], gain: 0.3, a: 0.05 });
    crackle(2.0, 0.6, 1.2, false);
    k.play('thud', 2.62, { f: 70, gain: 0.5 });
    ep(2.8, 'A4', 1); ep(2.8, 'E5', 0.6);
    // polaroids (k = 0..11, t0 = 2.6 + 0.3k, 1.1 s each) fade into the bust: one soft bell per card, a pentatonic walk
    const PENT = ['F4', 'A4', 'C5', 'G4', 'D5', 'A4', 'C5', 'E5', 'G4'];
    for (let i = 0; i < 12; i++) { const t = 2.6 + i * 0.3 + 0.95; if (t < CUT1 - 0.3) ep(t, PENT[i % PENT.length], 0.55, 0.3, true); }
    // tape-counter digits 0 -> 1,000,000 (2.7..5.6, ease-in-out): mechanical counter clicks
    counter(2.7, 5.6, (t) => EZ.inOut(cl((t - 2.7) / 2.9)), 1 / 40, (t) => k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1900, q: 3, gain: 0.16, a: 0.0005, pan: -0.5, minor: true }));
    k.noise(5.6, { dur: 0.03, color: 'brown', filter: 'lowpass', f: 600, gain: 0.3, a: 0.001, pan: -0.5 }); ep(5.6, 'C5', 0.7, -0.4);

    // ---- CUT1, scene 1: guess.exe
    cut(CUT1, 'F3');
    neonDraw(CUT1 + 0.4, 0.3, 1, -0.3);                // arrow out of the test polaroid
    neonDraw(6.7, 0.25, 1, 0.2);                     // arrow to the pop-up
    ep(6.9, 'G4', 0.8, 0.4); ep(6.98, 'D5', 0.7, 0.4);                              // guess.exe opens: "dog?"
    k.noise(7.0, { dur: 0.012, filter: 'bandpass', f: 1500, q: 2, gain: 0.16, a: 0.0005, minor: true }); // GUESS pill lights
    // CHECK (7.9): wrong. the tape warps down, a sour low chord, then the glitch burst (8.0..8.25)
    const WRONG = 7.9;
    [['E4', 0], ['Bb3', 0], ['F3', 0]].forEach(([n]) => k.tone(WRONG, { f: [[0, n], [0.5, k.hz(n) * 0.82]], type: 'sawtooth', dur: 0.6, gain: 0.06, a: 0.01, hold: 0.3, filter: 'lowpass', f2: 900, pan: 0.3 }));
    k.play('thud', WRONG, { f: 90, gain: 0.6, pan: 0.3 });
    crackle(8.0, 0.25, 2, false);
    // ADJUST (8.5): pink error pulse flows back into the bust (right -> left), then the sliders glide (8.9..9.5)
    k.noise(8.5, { dur: 0.012, filter: 'bandpass', f: 1500, q: 2, gain: 0.16, a: 0.0005, minor: true });
    k.tone(8.5, { f: [[0, 620], [0.4, 260]], type: 'triangle', dur: 0.45, gain: 0.08, a: 0.03, hold: 0.3, pan: 0.4, verb: 0.3 });
    neonDraw(8.5, 0.4, 0.9, -0.1, false);
    k.withMinor(() => [0, 1, 2].forEach((i) => k.tone(8.9 + i * 0.04, { f: [[0, 300 + i * 40], [0.6, 420 + i * 60]], type: 'sine', dur: 0.62, gain: 0.04, a: 0.2, hold: 0.2, pan: 0.2 + i * 0.2 })));
    // GUESS again -> "cat ✓ correct!" (9.6): dreamy maj7 arpeggio
    ['F4', 'A4', 'C5', 'E5'].forEach((n, i) => ep(9.6 + i * 0.07, n, 1, 0.3));
    k.noise(10.0, { dur: 0.012, filter: 'bandpass', f: 1500, q: 2, gain: 0.16, a: 0.0005, minor: true }); // CHECK pill

    // ---- CUT2, scene 2: neon chart across the sky. Line draws 10.85..12.05; dots at every 4th of 20 points
    cut(CUT2, 'D3');
    const L2 = CUT2 + 0.45;
    neonDraw(L2, 1.2, 0.6, -0.2);
    for (let i = 0; i <= 20; i += 4) ep(L2 + 1.2 * i / 20, ['C4', 'E4', 'G4', 'A4', 'C5', 'D5'][i / 4], 0.5, -0.4 + i * 0.03, true);
    const val = (u) => 61 + 36 * (1 - Math.pow(1 - u, 2.2));
    counter(L2, L2 + 1.2, (t) => Math.round(val(cl((t - L2) / 1.2))), 1, (t) => k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1900, q: 3, gain: 0.14, a: 0.0005, pan: 0.4, minor: true }));
    // 97% (lt > 1.7): the biggest moment. deep tape-thump, lush chord swell, chroma shimmer as a fast tremolo shimmer
    const BEST = CUT2 + 1.7 + 1e-3;
    k.play('impact', BEST, { f: 80, gain: 0.9 });
    ['F3', 'C4', 'E4', 'G4', 'A4'].forEach((n, i) => {
      k.tone(BEST, { f: n, type: 'sawtooth', dur: 1.6, gain: 0.05, a: 0.03, hold: 0.5, filter: 'lowpass', f2: [[0, 2200], [1.4, 700]], verb: 0.5, pan: (i - 2) * 0.3 });
      k.tone(BEST, { f: n, type: 'sawtooth', detune: 12, dur: 1.6, gain: 0.04, a: 0.03, hold: 0.5, filter: 'lowpass', f2: 1500, verb: 0.5, pan: (2 - i) * 0.3 });
    });
    ep(BEST + 0.05, 'C5', 1.1); ep(BEST + 0.2, 'G5', 0.7);

    // ---- CUT3, scene 3: takeaway glitches in (line 1 from 12.85, line 2 from 13.3), Japanese subtitle lands at 13.8
    cut(CUT3, 'Bb3');
    for (let i = 0; i < 13; i += 3) crackle(CUT3 + 0.15 + i * 0.03, 0.05, 0.8);
    for (let i = 0; i < 14; i += 3) crackle(CUT3 + 0.6 + i * 0.03, 0.05, 0.8);
    const TAKE = CUT3 + 1.1 + 1e-3;
    ['F4', 'C5', 'E5', 'A5'].forEach((n, i) => ep(TAKE + i * 0.1, n, 0.9 - i * 0.1));
    k.tone(TAKE, { f: 'F2', type: 'triangle', dur: 1.8, gain: 0.16, a: 0.05, hold: 0.6 });
  }

  registerStyle({
    id: 'vaporwave',
    name: 'Vaporwave',
    category: 'Retro UI & Neon',
    description: 'Pastel-neon dreamscape: sliced sunset sun, glowing grid floor, a glitching marble bust on a checkerboard plinth, palm silhouettes, katakana, and a chewed-up VHS tape finish.',
    motion: 'Tape starts on a blue VCR screen and rolls into lock, the striped sun rises, palms slide in, the bust glitches into existence slice by slice, katakana stamps on with chroma split and a tracking band crawls down.',
    fonts: ['900 74px "Noto Serif JP"', '700 20px "Noto Serif JP"', '400 30px "VT323"', '600 22px "Inter"', '900 130px "Noto Serif JP"', '700 30px "Noto Serif JP"', '600 58px "Inter"'],
    frameT: 4.6,
    duration: 5.5,
    explainerDuration: 15,
    explainerNote: 'Told on a worn VHS tape: scenes change with a tape cut (VCR blue screen, fast-forward, vertical roll), the header lives on as the VCR on-screen menu, the counter is tape-counter digits, labelled polaroids slide along the neon floor into the marble-bust "model", a pastel guess.exe pop-up does the guessing and the chart is drawn in neon across the sky.',
    explainer(ctx, W, H_, t) { explainVW(ctx, W, H_, t); },
    explainerSound(k) { vwSound(k); },
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const r = H.rng(77);
      sky(ctx, W);
      // faint stars
      for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(255,230,255,${r.range(0.2, 0.8) * (0.6 + 0.4 * Math.sin(t * 3 + i))})`; ctx.fillRect(r.range(0, W), r.range(0, HZ * 0.55), 1.5, 1.5); }
      sun(ctx, 470, HZ - 70 + (1 - H.ease.out(H.clamp((t - 0.5) / 1.6))) * 260, 210, t);
      floor(ctx, W, H_, t);

      // palms
      const slA = (1 - H.ease.out(H.clamp((t - 0.9) / 1.0))) * 360, slB = (1 - H.ease.out(H.clamp((t - 1.05) / 1.0))) * 260;
      palm(ctx, 175 - slB, HZ + 40, 260, -0.12, 8, '#2a0b4c');
      palm(ctx, 1120 + slB, HZ + 50, 250, 0.16, 11, '#2a0b4c');
      palm(ctx, 70 - slA, HZ + 120, 400, 0.28, 3, '#1a0634');
      palm(ctx, 1225 + slA, HZ + 140, 430, -0.3, 5, '#1a0634');

      // bust on plinth, rendered to layer for glitching
      const L = H.layer(W, H_), lc = L.getContext('2d');
      const bx = 840, by = 112, bs = 0.96;
      blitBust(lc, bx, by, bs);
      const plY = by + 428 * bs - 4;
      pedestal(lc, bx - 175 * bs - 8, plY, 336 * bs + 16, 150, t);

      // glitch composite: chroma ghosts + horizontal slice displacement (bust glitches into existence at T_B)
      const T_B = 1.8;
      const shock = t >= T_B ? Math.exp(-(t - T_B) * 3.2) : 0;
      const burst = t > 4.0 && t < 4.17 ? 1.2 : 0;
      const gl = 0.6 + 0.4 * Math.sin(t * 5.3) + shock * 3.5 + burst;
      if (t >= T_B) {
      ctx.save();
      ctx.globalAlpha = 0.42; ctx.globalCompositeOperation = 'lighter';
      const tint = (col, dx) => { const T = H.layer(W, H_), tc = T.getContext('2d'); tc.drawImage(L, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, W, H_); ctx.drawImage(T, dx, 0); };
      tint('#00e5ff', -14 * gl); tint('#ff2bd6', 12 * gl);
      ctx.restore();
      const gr = H.rng(Math.floor(t * 8) + 5);
      let y = 0;
      while (y < H_) {
        const hgt = gr.int(4, 40);
        const shift = gr.chance(0.18 + shock * 0.5 + burst * 0.2) ? gr.range(-46, 46) * gl : 0;
        if (gr.chance(H.clamp((T_B + 0.35 - t) / 0.35) * 0.7)) { y += hgt; continue; } // slices still missing while it materialises
        ctx.drawImage(L, 0, y, W, hgt, shift, y, W, hgt);
        if (shift && gr.chance(0.5)) { ctx.fillStyle = gr.chance(0.5) ? 'rgba(0,255,255,0.35)' : 'rgba(255,40,200,0.35)'; ctx.globalCompositeOperation = 'source-atop'; ctx.globalCompositeOperation = 'source-over'; }
        y += hgt;
      }
      }

      // Title: katakana + spaced latin
      ctx.save();
      ctx.font = '900 74px "Noto Serif JP"'; ctx.textBaseline = 'alphabetic';
      const KT = 'ニューラル夢';
      const nk = H.clamp(Math.floor((t - 2.55) / 0.11) + 1, 0, KT.length);
      const kt = KT.slice(0, nk);
      const kAge = t - (2.55 + (nk - 1) * 0.11), co = 4 + 14 * Math.exp(-Math.max(0, kAge) * 8);
      ctx.fillStyle = '#00f0ff'; ctx.fillText(kt, 66 + co, 120 + 3);
      ctx.fillStyle = '#ff2bd6'; ctx.fillText(kt, 66 - co, 120 - 2);
      ctx.fillStyle = '#fff4fb'; ctx.fillText(kt, 66, 120);
      ctx.font = '600 22px "Inter"'; ctx.letterSpacing = '17px'; ctx.fillStyle = '#ffe9f6';
      ctx.shadowColor = '#ff4fc0'; ctx.shadowBlur = 12;
      ctx.fillText('NEURAL DREAMS'.slice(0, H.clamp(Math.floor((t - 3.15) / 0.045), 0, 13)), 70, 162);
      ctx.shadowBlur = 0; ctx.letterSpacing = '0px';
      ctx.font = '700 20px "Noto Serif JP"'; ctx.fillStyle = 'rgba(255,220,240,0.85)';
      if (t > 3.8) ctx.fillText('エーアイ・アエステティック', 72, 196);
      ctx.restore();

      // ---------- VHS finish (pixel pass) ----------
      const bandY = ((t * 0.2 + 0.806) % 1) * (H_ + 160) - 80;
      const rollP = H.clamp((t - 0.45) / 0.6), roll = Math.round((1 - H.ease.out(rollP)) * H_ * 0.9) * (t >= 0.45 ? 1 : 0);
      vhsPass(ctx, W, H_, t, { roll, bandY, bandH: 64, wobK: 28, streakP: 0.35, streakL: 420, speck: 0.06, desat: true });
      if (t < 0.45) { // VCR blue screen before the tape locks
        ctx.fillStyle = '#1f33d6'; ctx.fillRect(0, 0, W, H_);
        const nr = H.rng(Math.floor(t * 24) + 40);
        for (let i = 0; i < 50; i++) { ctx.fillStyle = `rgba(255,255,255,${nr.range(0.05, 0.4)})`; ctx.fillRect(0, nr.range(0, H_), W, nr.range(1, 4)); }
      }
      H.grain(ctx, W, H_, t < 1.0 ? 0.16 : 0.07, Math.floor(t * 24) + 9, true);

      // OSD
      ctx.save();
      ctx.font = '400 34px "VT323"'; ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
      ctx.fillText('PLAY ▶', W - 170, 58);
      const secs = 754 + Math.floor(t);
      ctx.fillText(`SP  0:${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`, W - 230, H_ - 34);
      ctx.fillText('JUN. 14 1996', 40, H_ - 34);
      ctx.restore();
      H.vignette(ctx, W, H_, 0.45, '20,0,40');
    },
  });
}
