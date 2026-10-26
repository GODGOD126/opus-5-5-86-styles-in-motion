{
  // ---------- Warhol-style silkscreen grid: flat hand-cut colour plates + misregistered black photo screen ----------
  const PW = 300, PH = 331, M = 24, G = 10, COLS = 4, ROWS = 2;
  const CANVAS = [236, 230, 218];
  const PAL = [
    { bg: '#f2559c', head: '#ffe14a', eye: '#22c3c8', mouth: '#e8242b', body: '#2b4fc3', tip: '#ff8a00' },
    { bg: '#ff7a1f', head: '#9fdcff', eye: '#ffe600', mouth: '#e5007e', body: '#5b2a86', tip: '#2ad46b' },
    { bg: '#2fbf63', head: '#ffa3cf', eye: '#1d3fbb', mouth: '#ff5a1f', body: '#fff04a', tip: '#e5007e' },
    { bg: '#1e2b9c', head: '#ff6fae', eye: '#c8f53a', mouth: '#ffcf00', body: '#ff5a1f', tip: '#22c3c8' },
    { bg: '#ffe100', head: '#ff6f3c', eye: '#2b4fc3', mouth: '#b8007a', body: '#22c3c8', tip: '#e8242b' },
    { bg: '#9b4ee0', head: '#c9f53c', eye: '#ff4fa3', mouth: '#ff8a00', body: '#ffe14a', tip: '#ffffff' },
    { bg: '#e8242b', head: '#fff1b0', eye: '#2fbf63', mouth: '#1e2b9c', body: '#ff9ec8', tip: '#ffe100' },
    { bg: '#00b2c8', head: '#ffb000', eye: '#f2559c', mouth: '#e8242b', body: '#1e2b9c', tip: '#c9f53c' },
  ];

  const rrect = (x, a, b, w, h, r) => { x.beginPath(); x.roundRect(a, b, w, h, r); };

  // the "photograph" the screen was burned from (grey tone, 0 = black, 255 = white)
  const toneImage = () => {
    const c = H.layer(PW, PH), x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, PW, PH);
    // soft cast shadow behind head on the right
    x.fillStyle = 'rgba(0,0,0,0.12)'; rrect(x, 92, 82, 166, 156, 30); x.fill();
    // shoulders / body
    let g = x.createLinearGradient(40, 0, 260, 0);
    g.addColorStop(0, '#e0e0e0'); g.addColorStop(0.4, '#b0b0b0'); g.addColorStop(0.7, '#6a6a6a'); g.addColorStop(1, '#303030');
    x.fillStyle = g; x.beginPath(); x.moveTo(30, PH + 5); x.lineTo(42, 278); x.quadraticCurveTo(50, 252, 92, 248); x.lineTo(208, 248); x.quadraticCurveTo(250, 252, 258, 278); x.lineTo(270, PH + 5); x.closePath(); x.fill();
    x.strokeStyle = '#222'; x.lineWidth = 3; x.stroke();
    // chest panel with dials
    x.fillStyle = '#5a5a5a'; rrect(x, 104, 272, 92, 50, 6); x.fill();
    x.fillStyle = '#f0f0f0'; [[124, 292], [150, 292], [176, 292]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 7, 0, 7); x.fill(); });
    x.fillStyle = '#1a1a1a'; [[124, 292], [150, 292], [176, 292]].forEach(([a, b]) => { x.beginPath(); x.arc(a + 1.5, b + 1.5, 3, 0, 7); x.fill(); });
    x.fillStyle = '#d0d0d0'; x.fillRect(112, 308, 76, 5);
    // neck with rings
    g = x.createLinearGradient(124, 0, 176, 0); g.addColorStop(0, '#9a9a9a'); g.addColorStop(0.4, '#cfcfcf'); g.addColorStop(1, '#262626');
    x.fillStyle = g; x.fillRect(124, 214, 52, 38);
    x.fillStyle = '#2a2a2a'; x.fillRect(122, 224, 56, 5); x.fillRect(122, 238, 56, 5);
    // ears
    for (const s of [-1, 1]) {
      g = x.createLinearGradient(0, 118, 0, 176); g.addColorStop(0, '#d6d6d6'); g.addColorStop(1, '#3a3a3a');
      x.fillStyle = s < 0 ? g : '#3c3c3c'; rrect(x, s < 0 ? 52 : 232, 118, 16, 56, 5); x.fill();
      x.strokeStyle = '#1b1b1b'; x.lineWidth = 2.5; x.stroke();
    }
    // head
    g = x.createLinearGradient(70, 70, 235, 225);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#e2e2e2'); g.addColorStop(0.62, '#959595'); g.addColorStop(0.85, '#555555'); g.addColorStop(1, '#383838');
    x.fillStyle = g; rrect(x, 68, 70, 164, 150, 30); x.fill();
    // hard shadow side
    x.save(); rrect(x, 68, 70, 164, 150, 30); x.clip();
    x.fillStyle = 'rgba(0,0,0,0.55)'; x.beginPath(); x.moveTo(206, 60); x.quadraticCurveTo(196, 150, 214, 230); x.lineTo(260, 230); x.lineTo(260, 60); x.closePath(); x.fill();
    x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(60, 206, 200, 20);
    x.restore();
    x.strokeStyle = '#141414'; x.lineWidth = 3.5; rrect(x, 68, 70, 164, 150, 30); x.stroke();
    // antenna
    x.strokeStyle = '#202020'; x.lineWidth = 4; x.beginPath(); x.moveTo(150, 70); x.lineTo(150, 40); x.stroke();
    g = x.createRadialGradient(146, 31, 1, 150, 35, 11); g.addColorStop(0, '#fff'); g.addColorStop(1, '#333');
    x.fillStyle = g; x.beginPath(); x.arc(150, 35, 10, 0, 7); x.fill();
    // brows
    x.fillStyle = '#1e1e1e'; x.fillRect(92, 102, 44, 6); x.fillRect(164, 102, 44, 6);
    // eyes
    for (const ex of [114, 186]) {
      x.fillStyle = '#121212'; x.beginPath(); x.arc(ex, 138, 25, 0, 7); x.fill();
      g = x.createRadialGradient(ex - 6, 132, 2, ex, 138, 19); g.addColorStop(0, '#9a9a9a'); g.addColorStop(1, '#2a2a2a');
      x.fillStyle = g; x.beginPath(); x.arc(ex, 138, 18, 0, 7); x.fill();
      x.fillStyle = '#050505'; x.beginPath(); x.arc(ex + 1, 139, 8, 0, 7); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(ex - 7, 131, 5, 0, 7); x.fill();
    }
    // nose rivet
    x.fillStyle = '#333'; x.beginPath(); x.arc(150, 162, 4, 0, 7); x.fill();
    // mouth grille
    x.fillStyle = '#1a1a1a'; rrect(x, 104, 180, 92, 24, 6); x.fill();
    x.fillStyle = '#bdbdbd'; for (let i = 0; i < 6; i++) x.fillRect(112 + i * 14, 185, 5, 14);
    // rivets along head
    x.fillStyle = '#2a2a2a'; [[82, 84], [218, 84], [82, 206], [218, 206]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 3.5, 0, 7); x.fill(); });
    return x.getImageData(0, 0, PW, PH).data;
  };

  // crude hand-cut colour shapes (in panel coords)
  const cutShape = (x, pts) => { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.closePath(); x.fill(); };
  const blobAround = (r, cx, cy, rx, ry, n) => { const p = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; p.push([cx + Math.cos(a) * rx * r.range(0.9, 1.1), cy + Math.sin(a) * ry * r.range(0.9, 1.1)]); } return p; };

  // ================= EXPLAINER: six silkscreened panels, one beat each, pulled in order =================
  const SE = H.ease, scl = H.clamp, sseg = (t, a, b) => scl((t - a) / (b - a));
  const QW = 402, QH = 330, QG = 12, QM = 25;
  const SLOT = [[0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [0, 1]];          // snake order
  const qx = (i) => QM + SLOT[i][0] * (QW + QG), qy = (i) => 24 + SLOT[i][1] * (QH + QG);
  const PRINT = [0.05, 2.55, 6.15, 8.45, 10.65, 13.05];                   // when each panel is pulled
  const QPAL = [
    { bg: '#f2559c', a: '#ffe14a', b: '#22c3c8', c: '#e8242b' },
    { bg: '#ff7a1f', a: '#fff04a', b: '#9fdcff', c: '#5b2a86' },
    { bg: '#22c3c8', a: '#fff1b0', b: '#ffe14a', c: '#e8242b' },
    { bg: '#ffe100', a: '#ff9ec8', b: '#2fbf63', c: '#e8242b' },
    { bg: '#9b4ee0', a: '#c9f53c', b: '#ffe14a', c: '#ff4fa3' },
    { bg: '#e8242b', a: '#fff1b0', b: '#ffe14a', c: '#1e2b9c' },
  ];
  const FLASH = ['#ff7a1f', '#2fbf63', '#1e2b9c', '#f2559c'];
  let SX_CACHE = null;
  const shash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  const anton = (x, s, size, px, py, align = 'center', ls = 1) => { x.font = `400 ${size}px "Anton"`; x.textAlign = align; x.textBaseline = 'middle'; x.letterSpacing = ls + 'px'; x.fillText(s, px, py); x.letterSpacing = '0px'; };
  const cutPoly = (x, pts) => { x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath(); x.fill(); };
  const loose = (cx, cy, w, h, seed) => { const r = H.rng(seed); return [[cx - w / 2 + r.range(-6, 6), cy - h / 2 + r.range(-6, 6)], [cx + w / 2 + r.range(-6, 6), cy - h / 2 + r.range(-6, 6)], [cx + w / 2 + r.range(-6, 6), cy + h / 2 + r.range(-6, 6)], [cx - w / 2 + r.range(-6, 6), cy + h / 2 + r.range(-6, 6)]]; };
  // small robot portrait (colour shapes + black screen with soft shading as grey tone)
  const miniBot = (c, k, cx, cy, s, pal, mood) => {
    c.save(); c.translate(cx, cy); c.scale(s, s); k.save(); k.translate(cx, cy); k.scale(s, s);
    c.fillStyle = pal.a; cutPoly(c, loose(6, 4, 168, 150, 3)); c.fillStyle = pal.b; cutPoly(c, loose(-36, -6, 60, 46, 4)); cutPoly(c, loose(42, -4, 60, 46, 5)); c.fillStyle = pal.c; cutPoly(c, loose(4, 50, 86, 30, 6));
    k.fillStyle = '#000'; k.strokeStyle = '#000';
    const g = k.createLinearGradient(-80, -70, 80, 70); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.55, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.85)');
    k.fillStyle = g; k.beginPath(); k.roundRect(-80, -72, 160, 144, 26); k.fill(); k.fillStyle = '#000';
    k.lineWidth = 4; k.beginPath(); k.roundRect(-80, -72, 160, 144, 26); k.stroke();
    k.lineWidth = 3.5; k.beginPath(); k.moveTo(0, -72); k.lineTo(0, -98); k.stroke(); k.beginPath(); k.arc(0, -104, 8, 0, 7); k.fill();
    for (const ex of [-36, 36]) { k.beginPath(); k.arc(ex, -10, 22, 0, 7); k.fill(); k.fillStyle = '#fff'; k.globalCompositeOperation = 'destination-out'; k.beginPath(); k.arc(ex - 7, -17, 6, 0, 7); k.fill(); k.globalCompositeOperation = 'source-over'; k.fillStyle = '#000'; }
    if (mood === 'happy') { k.lineWidth = 7; k.beginPath(); k.arc(0, 36, 28, 0.2, Math.PI - 0.2); k.stroke(); }
    else if (mood === 'sad') { k.lineWidth = 7; k.beginPath(); k.arc(0, 70, 28, Math.PI + 0.3, -0.3); k.stroke(); }
    else { k.beginPath(); k.roundRect(-40, 38, 80, 22, 5); k.fill(); k.fillStyle = 'rgba(0,0,0,0)'; }
    c.restore(); k.restore();
  };
  const picCard = (c, k, cx, cy, s, kind, label, pal) => {
    c.save(); c.translate(cx, cy); c.scale(s / 100, s / 100); k.save(); k.translate(cx, cy); k.scale(s / 100, s / 100);
    c.fillStyle = '#fbf3e4'; cutPoly(c, loose(0, 0, 100, 120, kind === 'cat' ? 9 : 10)); c.fillStyle = pal.a; cutPoly(c, loose(2, 44, 96, 30, 11));
    k.fillStyle = '#000'; k.strokeStyle = '#000'; k.lineWidth = 4; k.strokeRect(-50, -60, 100, 120); k.lineCap = 'round';
    k.lineWidth = 4; k.beginPath(); k.arc(0, -14, 26, 0, 7); k.stroke();
    if (kind === 'cat') { k.beginPath(); k.moveTo(-22, -26); k.lineTo(-20, -50); k.lineTo(-6, -38); k.moveTo(22, -26); k.lineTo(20, -50); k.lineTo(6, -38); k.stroke(); k.lineWidth = 2.5; k.beginPath(); for (const sg of [-1, 1]) { k.moveTo(sg * 6, -6); k.lineTo(sg * 36, -8); k.moveTo(sg * 6, -2); k.lineTo(sg * 34, 2); } k.stroke(); }
    else { for (const sg of [-1, 1]) { k.beginPath(); k.ellipse(sg * 26, -12, 8, 17, sg * 0.4, 0, 7); k.fill(); } k.beginPath(); k.ellipse(0, -4, 6, 4, 0, 0, 7); k.fill(); }
    k.beginPath(); k.arc(-9, -18, 3.4, 0, 7); k.arc(9, -18, 3.4, 0, 7); k.fill();
    if (label) anton(k, label, 26, 0, 44, 'center', 2);
    c.restore(); k.restore();
  };
  const blackArrow = (k, p0, cp, p1, u, w) => {
    if (u <= 0) return;
    const q = (s) => [(1 - s) * (1 - s) * p0[0] + 2 * (1 - s) * s * cp[0] + s * s * p1[0], (1 - s) * (1 - s) * p0[1] + 2 * (1 - s) * s * cp[1] + s * s * p1[1]];
    k.save(); k.strokeStyle = '#000'; k.fillStyle = '#000'; k.lineWidth = w; k.lineCap = 'round'; k.beginPath(); k.moveTo(p0[0], p0[1]);
    for (let i = 1; i <= 24 * u; i++) { const p = q(i / 24); k.lineTo(p[0], p[1]); }
    const e = q(u), b = q(Math.max(0, u - 0.05)), a = Math.atan2(e[1] - b[1], e[0] - b[0]); k.lineTo(e[0], e[1]); k.stroke();
    k.beginPath(); k.moveTo(e[0] + Math.cos(a) * w * 2.2, e[1] + Math.sin(a) * w * 2.2); k.lineTo(e[0] + Math.cos(a + 2.4) * w * 2.6, e[1] + Math.sin(a + 2.4) * w * 2.6); k.lineTo(e[0] + Math.cos(a - 2.4) * w * 2.6, e[1] + Math.sin(a - 2.4) * w * 2.6); k.closePath(); k.fill(); k.restore();
  };

  // panel contents (panel-local coords 402 x 330) — colour plates into c, black screen into k
  const CONTENT = [
    (c, k, t, pal) => { // HOOK
      miniBot(c, k, 290, 210, 0.95, pal, 'think');
      c.fillStyle = pal.a; cutPoly(c, loose(118, 92, 210, 130, 21));
      anton(k, 'HOW DOES', 46, 118, 62, 'center', 1); anton(k, 'AI LEARN?', 50, 118, 120, 'center', 1);
      const q = Math.floor(t * 6) % 2 ? -4 : 0; if (t > 1.0) { anton(k, '?', 54, 366, 70 + q); anton(k, '?', 38, 340, 34 - q); }
    },
    (c, k, t, pal) => { // DATA: a contact sheet filling up + counter
      const n = Math.floor(sseg(t, 3.15, 4.6) * 12);
      const cyc = Math.floor(Math.max(0, t - 4.6) * 6);
      for (let j = 0; j < n; j++) {
        const col = j % 4, row = (j / 4) | 0, kind = (j + cyc) % 3 === 1 ? 'dog' : 'cat';
        picCard(c, k, 50 + col * 72, 52 + row * 82, 58, kind, kind.toUpperCase(), pal);
      }
      c.fillStyle = pal.b; cutPoly(c, loose(201, 290, 380, 64, 31));
      const v = Math.round(1e6 * Math.pow(sseg(t, 3.2, 5.5), 2.3));
      anton(k, v.toLocaleString('en-US') + ' EXAMPLES', 40, 201, 291, 'center', 1);
      if (t > 5.5) { k.save(); k.lineWidth = 5; k.beginPath(); k.moveTo(30, 322); k.lineTo(30 + 340 * SE.out(sseg(t, 5.5, 5.8)), 320); k.stroke(); k.restore(); }
    },
    (c, k, t, pal) => { // GUESS + CHECK
      picCard(c, k, 82, 150, 120, 'cat', '?', pal);
      blackArrow(k, [150, 120], [205, 70], [258, 108], SE.out(sseg(t, 6.8, 7.1)), 6);
      if (t > 6.95) anton(k, 'GUESS', 30, 205, 58, 'center', 2);
      if (t > 7.15) { c.fillStyle = '#fbf3e4'; cutPoly(c, loose(320, 150, 140, 90, 41)); k.lineWidth = 4; k.strokeRect(250, 105, 140, 90); anton(k, 'DOG?', 50, 320, 150); }
      if (t > 7.5) {
        const u = SE.back(sseg(t, 7.5, 7.7)); c.save(); c.translate(360, 110); c.scale(u, u); c.strokeStyle = pal.c; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(-28, -28); c.lineTo(28, 28); c.moveTo(28, -28); c.lineTo(-28, 28); c.stroke(); c.restore();
        anton(k, 'CHECK', 30, 320, 232, 'center', 2); anton(k, "WRONG — IT'S A CAT", 22, 300, 270, 'center', 1);
      }
    },
    (c, k, t, pal) => { // ADJUST + correct
      miniBot(c, k, 110, 200, 0.75, pal, t > 10.0 ? 'happy' : 'sad');
      const adj = SE.inOut(sseg(t, 9.25, 9.85));
      for (let d = 0; d < 3; d++) {
        const dx = 230 + d * 58, dy = 250; c.fillStyle = pal.c; cutPoly(c, loose(dx, dy, 48, 48, 50 + d));
        k.lineWidth = 4; k.beginPath(); k.arc(dx, dy, 22, 0, 7); k.stroke();
        const a = [-2.2, -0.6, 0.9][d] + adj * [1.8, -1.4, 2.4][d]; k.lineWidth = 6; k.lineCap = 'round'; k.beginPath(); k.moveTo(dx, dy); k.lineTo(dx + Math.cos(a) * 18, dy + Math.sin(a) * 18); k.stroke();
      }
      if (t > 9.1) anton(k, 'ADJUST', 34, 288, 196, 'center', 2);
      if (t > 10.0) {
        c.fillStyle = '#fbf3e4'; cutPoly(c, loose(290, 90, 150, 90, 61)); k.lineWidth = 4; k.strokeRect(215, 45, 150, 90); anton(k, 'CAT', 52, 290, 90);
        const u = SE.back(sseg(t, 10.05, 10.25)); c.save(); c.translate(370, 50); c.scale(u, u); c.strokeStyle = '#1e7a3a'; c.lineWidth = 14; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-22, 0); c.lineTo(-6, 16); c.lineTo(24, -18); c.stroke(); c.restore();
      }
    },
    (c, k, t, pal) => { // PROGRESS
      const X0 = 36, Y0 = 280, CW = 200, CH = 220, prog = SE.inOut(sseg(t, 11.3, 12.5));
      const acc = (u) => 61 + 36 * (1 - Math.exp(-u * 3.2)) / (1 - Math.exp(-3.2)), yv = (v) => Y0 - ((v - 50) / 50) * CH;
      c.fillStyle = pal.a; c.beginPath(); c.moveTo(X0, Y0); for (let i = 0; i <= 40 * prog; i++) c.lineTo(X0 + (i / 40) * CW + 6, yv(acc(i / 40)) + 4); c.lineTo(X0 + prog * CW + 6, Y0); c.closePath(); c.fill();
      k.lineWidth = 4; k.beginPath(); k.moveTo(X0, Y0 - CH - 6); k.lineTo(X0, Y0); k.lineTo(X0 + CW + 10, Y0); k.stroke();
      k.lineWidth = 7; k.lineJoin = 'round'; k.beginPath(); for (let i = 0; i <= 40 * prog; i++) { const u = i / 40; i ? k.lineTo(X0 + u * CW, yv(acc(u))) : k.moveTo(X0, yv(acc(0))); } k.stroke();
      anton(k, 'TRAINING ROUNDS', 18, X0 + CW / 2, Y0 + 22, 'center', 2);
      c.fillStyle = pal.b; cutPoly(c, loose(322, 160, 150, 110, 71));
      anton(k, 'ACCURACY', 22, 322, 92, 'center', 3);
      anton(k, Math.round(61 + 36 * prog) + '%', 78, 322, 165, 'center', 0);
      if (t > 12.5) { k.lineWidth = 5; k.beginPath(); k.ellipse(322, 165, 92 * SE.back(sseg(t, 12.5, 12.7)), 62 * SE.back(sseg(t, 12.5, 12.7)), -0.1, 0, 7); k.stroke(); }
    },
    (c, k, t, pal) => { // TAKEAWAY
      c.fillStyle = pal.a; cutPoly(c, loose(201, 100, 360, 80, 81)); cutPoly(c, loose(201, 236, 360, 80, 82));
      anton(k, 'MORE EXAMPLES', 54, 201, 100, 'center', 1);
      blackArrow(k, [201, 145], [201, 160], [201, 182], SE.out(sseg(t, 13.75, 13.95)), 7);
      anton(k, 'BETTER GUESSES', 54, 201, 238, 'center', 1);
    },
  ];

  const camAt = (t) => {
    const P = (i) => [qx(i) + QW / 2, qy(i) + QH / 2, 1.85];
    const keys = [[0, P(0)], [2.25, P(0)], [2.75, P(1)], [5.85, P(1)], [6.35, P(2)], [8.15, P(2)], [8.65, P(3)], [10.35, P(3)], [10.85, P(4)], [12.75, P(4)], [13.25, P(5)], [14.05, P(5)], [14.75, [640, 360, 1]]];
    let a = keys[0], b = keys[0];
    for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i][0]) { a = keys[i]; b = keys[i + 1]; }
    if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1];
    const u = SE.inOut(sseg(t, a[0], b[0]));
    // zoom out a touch while travelling between panels
    const dip = (a[1][0] !== b[1][0] || a[1][1] !== b[1][1]) && b[1][2] > 1.5 ? Math.sin(Math.PI * u) * 0.35 : 0;
    return [H.lerp(a[1][0], b[1][0], u), H.lerp(a[1][1], b[1][1], u), H.lerp(a[1][2], b[1][2], u) - dip];
  };

  const spExplainer = (ctx, W, H_, t) => {
    if (!SX_CACHE) {
      const nz = H.makeNoise(8), GW = 640, GH = 360, g = new Float32Array(GW * GH); for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) g[y * GW + x] = nz.fbm2(x * 0.11, y * 0.11, 3) * 0.7 + nz.n2(x * 0.45, y * 0.45) * 0.3;
      // squeegee streak rows per panel (same field as the still's streakRows), key misregistration, ghost pulls
      const streak = [], reg = [];
      for (let i = 0; i < 6; i++) {
        const a = new Float32Array(QH), n2 = H.makeNoise((i + 1) * 13 + 5); for (let y = 0; y < QH; y++) a[y] = n2.fbm2(y * 0.045, 0.5, 3) + 0.6 * n2.n2(y * 0.3, 7.7); streak.push(a);
      }
      // key offsets chosen so nothing near a panel edge is pushed out of its panel
      reg.push([-4, 3], [3, -3], [-3, 4], [4, 3], [-4, -3], [3, 4]);
      const ghost = [[11, -3], null, null, null, null, [-9, 5]]; // panels with no gutter arrows crossing them
      SX_CACHE = { g, GW, GH, streak, reg, ghost };
    }
    const { streak: STK, reg: REGO, ghost: GHO } = SX_CACHE;
    const [ccx, ccy, z] = camAt(t);
    const col = H.layer(W, H_), c = col.getContext('2d'), key = H.layer(W, H_), k = key.getContext('2d');
    c.fillStyle = `rgb(${CANVAS})`; c.fillRect(0, 0, W, H_);
    const cam = (x) => { x.setTransform(z, 0, 0, z, W / 2 - ccx * z, H_ / 2 - ccy * z); };
    cam(c); cam(k);
    const panelState = [];
    for (let i = 0; i < 6; i++) {
      const x0 = qx(i), y0 = qy(i), T0 = PRINT[i];
      let pal = QPAL[i];
      if (i === 4 && t > 12.5 && t < 13.0) pal = { ...pal, bg: FLASH[Math.floor((t - 12.5) * 8) % FLASH.length] }; // emphasis: colourway flicker
      if (i === 2 && t > 7.5 && t < 7.9) pal = { ...pal, bg: Math.floor((t - 7.5) * 10) % 2 ? '#e8242b' : pal.bg };
      const kp = SE.inOut(sseg(t, T0 + 0.3, T0 + 0.7));
      panelState.push({ x0, y0, kp, dir: i % 2 ? -1 : 1, seed: i, on: t >= T0, fw: QW * SE.out(sseg(t, T0, T0 + 0.18)), st: STK[i], gh: GHO[i] });
      if (t < T0) { c.strokeStyle = 'rgba(90,80,70,0.3)'; c.lineWidth = 1.2; c.strokeRect(x0, y0, QW, QH); continue; }
      c.save(); c.beginPath(); c.rect(x0, y0, QW * SE.out(sseg(t, T0, T0 + 0.18)), QH); c.clip(); c.translate(x0, y0);
      c.fillStyle = pal.bg; c.fillRect(0, 0, QW, QH);
      k.save(); k.beginPath(); k.rect(x0, y0, QW, QH); k.clip(); k.translate(x0 + REGO[i][0], y0 + REGO[i][1]); // photo screen slightly off register
      CONTENT[i](c, k, t, pal);
      c.restore(); k.restore();
    }
    // cross-panel arrows painted straight on the canvas (cause and flow between beats)
    k.save(); k.strokeStyle = '#000'; k.fillStyle = '#000';
    blackArrow(k, [qx(2) + 330, qy(2) + 296], [qx(2) + 380, qy(2) + 345], [qx(3) + 362, qy(3) + 168], SE.inOut(sseg(t, 8.4, 8.95)), 7); // error flows down to the dials
    blackArrow(k, [qx(3) + 40, qy(3) + 70], [qx(3) - 10, qy(3) - 40], [qx(2) + 40, qy(2) + 230], SE.inOut(sseg(t, 10.15, 10.4)), 6);   // ...and loops back to guess again
    blackArrow(k, [qx(1) + 380, qy(1) + 165], [qx(1) + QW + 6, qy(1) + 165], [qx(2) + 18, qy(2) + 150], SE.inOut(sseg(t, 6.0, 6.3)), 6);
    k.restore();
    c.setTransform(1, 0, 0, 1, 0, 0); k.setTransform(1, 0, 0, 1, 0, 0);
    const cd = c.getImageData(0, 0, W, H_).data, kd = k.getImageData(0, 0, W, H_).data;
    const out = ctx.createImageData(W, H_), o = out.data, { g, GW, GH } = SX_CACHE;
    const K = [22, 18, 20], iz = 1 / z, PS = [];
    for (let j = 0; j < 2; j++) for (let ii = 0; ii < 3; ii++) PS.push(panelState[SLOT.findIndex((q) => q[0] === ii && q[1] === j)]);
    const kAt = (sx, sy) => (sx < 0 || sy < 0 || sx >= W || sy >= H_ ? 0 : kd[((sy | 0) * W + (sx | 0)) * 4 + 3] / 255);
    for (let y = 0; y < H_; y++) {
      const py = ccy + (y - H_ / 2) * iz, rowj = Math.floor((py - 24) / (QH + QG)), ly = py - 24 - rowj * (QH + QG);
      const rowOK = rowj >= 0 && rowj < 2 && ly < QH;
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4, px = ccx + (x - W / 2) * iz;
        const ipx = px | 0, ipy = py | 0;
        const h1 = shash(ipx, ipy, 1), weave = 1 + 0.025 * Math.sin(px * 2.1) * Math.sin(py * 2.3) + (h1 - 0.5) * 0.05;
        let r = cd[i] * weave, gg = cd[i + 1] * weave, b = cd[i + 2] * weave;
        const gs = g[(scl(py / 720 * GH, 0, GH - 1) | 0) * GW + (scl(px / 1280 * GW, 0, GW - 1) | 0)];
        // which panel is this pixel in?
        let s = null, lx = 0;
        if (rowOK) { const colj = Math.floor((px - QM) / (QW + QG)); lx = px - QM - colj * (QW + QG); if (colj >= 0 && colj < 3 && lx < QW) s = PS[rowj * 3 + colj]; }
        let starve = 0, along = 0, st = 0;
        if (s && s.on) {
          along = s.dir > 0 ? lx / QW : 1 - lx / QW; st = s.st[ly | 0];
          starve = scl((st * 0.9 + along * 0.9 - 0.75) * 1.6) * 0.85;
          if (lx < s.fw) {
            // flood: low-frequency ink load, a darker build-up where the flood bar starts and stops, and the colour
            // thinning in the squeegee's starved streaks (as in the still)
            let f = 1 + gs * 0.08;
            const ed = Math.min(lx, QW - lx), ev = Math.min(ly, QH - ly);
            if (ed < 2.4) f *= 0.86 + 0.05 * ed; else if (ev < 1.6) f *= 0.93 + 0.04 * ev;
            r *= f; gg *= f; b *= f;
            const cs = starve * 0.22 + (0.5 - h1) * 0.04;
            r += (CANVAS[0] - r) * cs; gg += (CANVAS[1] - gg) * cs; b += (CANVAS[2] - b) * cs;
          }
        }
        let ka = kd[i + 3] / 255;
        if (s && along > s.kp * 1.05 - 0.02) ka = 0;
        if (ka > 0.01) {
          const thr = 0.5 + gs * 0.28 + (shash(ipx, ipy, 5) - 0.5) * 0.22;
          let cov = scl((ka - thr) * 6 + 0.5);
          if (cov > 0) {
            let dens = 0.97 - starve * 0.55 + (shash(ipx, ipy, 9) - 0.5) * 0.1;
            if (starve > 0.4 && shash(ipx, ipy >> 1, 11) < starve * 0.5) dens *= 0.4;
            cov *= scl(dens);
            r = r * (1 - cov) + K[0] * cov; gg = gg * (1 - cov) + K[1] * cov; b = b * (1 - cov) + K[2] * cov;
          }
        }
        // ghost: a second, starved pull of the screen slipped sideways (two panels, as in the still)
        if (s && s.gh && along <= s.kp * 1.05 - 0.02) {
          const glx = lx - s.gh[0], gly = ly - s.gh[1];
          if (glx >= 0 && gly >= 0 && glx < QW && gly < QH) {
            const ka2 = kAt(x - s.gh[0] * z, y - s.gh[1] * z);
            if (ka2 > 0.3) {
              const cov = scl((ka2 - 0.55 - gs * 0.2) * 5 + 0.5) * (0.26 + 0.18 * st) * (shash(ipx, ipy, 17) < 0.55 ? 1 : 0.3);
              r *= 1 - cov * 0.85; gg *= 1 - cov * 0.85; b *= 1 - cov * 0.85;
            }
          }
        }
        o[i] = r; o[i + 1] = gg; o[i + 2] = b; o[i + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
  };

  registerStyle({
    id: 'screenprint-grid',
    name: 'Silkscreen Grid',
    category: 'Print',
    description: 'A Warhol-style repeat portrait: the same robot pulled eight times through a grainy black photo screen over loose, hand-cut flat colour plates in garish combinations, each pull misregistered and streaked by the squeegee.',
    motion: 'Panels are printed one after another across the grid — background flood, then the loose colour shapes slap down, then the squeegee drags the black photo screen across with a wet ink bead — before a slow push-in on the finished wall.',
    fonts: ['400 50px "Anton"'],
    duration: 4.5,
    frameT: 4.4,
    readsPixels: true,
    explainerDuration: 16,
    explainerNote: 'Each beat is its own silkscreened panel, pulled in order (flood, loose colour shapes, squeegee drags the black screen) while the camera travels the grid; black arrows are painted across the gutters between panels, counters are stencil type, emphasis is a colourway flicker, and the final pull-back reveals all six beats as one Warhol grid.',
    explainer(ctx, W, H_, t) { spExplainer(ctx, W, H_, t); },
    // Sound: a screen-printing bench. Each panel is a pull: a wet flood of ink, then the rubber squeegee drags
    // across the mesh (following the pull direction), and the screen lifts off with a soft clack. Painted arrows
    // are brush strokes, cards and stencil labels are small dabs, the colourway flicker on 97% is four quick
    // re-floods after the big hit. Timings mirror PRINT / CONTENT / camAt / spExplainer above.
    // Voiceover mode: room bed drops; screen lifts, card dabs, counter ticks, labels and the flicker are minor.
    explainerSound(k) {
      const D = 16;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // ink flooded across the screen with the flood bar: a short wet swish
      const flood = (t, g, minor) => k.noise(t, { minor: !!minor, dur: 0.24, color: 'pink', filter: 'bandpass', f: [[0, 650], [0.2, 1150]], q: 0.9, gain: 0.2 * g, a: 0.07 });
      // squeegee: rubber blade dragging ink through the mesh over d seconds, panned along the pull; screen lifts after
      const squeegee = (t, d, dir, g) => {
        const p0 = -0.45 * dir, p1 = 0.45 * dir;
        k.noise(t, { dur: d * 0.55, color: 'brown', filter: 'bandpass', f: [[0, 420], [d * 0.55, 720]], q: 0.9, gain: 0.55 * g, a: d * 0.3, hold: d * 0.2, pan: p0 });
        k.noise(t + d * 0.45, { dur: d * 0.6, color: 'brown', filter: 'bandpass', f: [[0, 720], [d * 0.6, 480]], q: 0.9, gain: 0.55 * g, a: 0.05, hold: d * 0.25, pan: p1 });
        // mesh texture: the blade chatters over the threads, densest mid-pull
        k.withMinor(() => { for (let x = 0.03; x < d; x += 0.022) { const e = Math.sin(Math.PI * x / d); k.noise(t + x, { dur: 0.018, filter: 'bandpass', f: 1250, q: 2, gain: 0.12 * g * e, a: 0.002, pan: p0 + (p1 - p0) * (x / d) }); } });
        // screen lifts off the paper
        k.withMinor(() => { k.tone(t + d + 0.06, { f: [[0, 150], [0.06, 85]], dur: 0.09, gain: 0.13 * g }); k.noise(t + d + 0.06, { dur: 0.03, filter: 'bandpass', f: 900, q: 1.2, gain: 0.2 * g, a: 0.001 }); });
      };
      const pull = (i, g = 1) => { flood(PRINT[i], g); squeegee(PRINT[i] + 0.3, 0.4, i % 2 ? -1 : 1, g); };
      // camera travels the grid: a soft smooth slide, nothing papery
      const travel = (t0, t1, g = 1) => k.noise(t0, { minor: true, dur: t1 - t0, color: 'brown', filter: 'lowpass', f: [[0, 220], [(t1 - t0) / 2, 520], [t1 - t0, 220]], gain: 0.16 * g, a: (t1 - t0) * 0.45 });
      const dab = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.04, filter: 'bandpass', f: 800, q: 1, gain: 0.26 * g, a: 0.002, pan: p }); k.tone(t, { f: 130, dur: 0.05, gain: 0.1 * g, pan: p }); });
      const tick = (t, g, p) => k.noise(t, { minor: true, dur: 0.02, filter: 'bandpass', f: 2100, q: 1.6, gain: 0.24 * g, a: 0.001, pan: p });
      const brush = (t, d, g, p) => k.play('stroke', t, { material: 'brush', dur: d, gain: g, pan: p, minor: true });

      k.bed('room', 0, D, { gain: 0.2 });

      // ---- panel 1: HOOK (the black screen pulls HOW DOES AI LEARN? on)
      pull(0);
      dab(1.0, 0.6, 0.5); dab(1.07, 0.45, 0.4); // the two ?s

      // ---- panel 2: DATA
      travel(2.25, 2.75);
      pull(1);
      for (let j = 1; j <= 12; j++) dab(3.15 + (j / 12) * 1.45, 0.75, -0.4 + ((j - 1) % 4) * 0.25); // contact sheet fills
      // counter (1e6 * sseg(3.2, 5.5)^2.3): ticks once the sheet is full, speeding up toward 1,000,000
      for (let t = 4.66; t < 5.46; ) { const s = sseg(t, 4.6, 5.5); tick(t, 0.8 + 0.3 * s, 0); t += 0.13 - 0.05 * s; }
      k.play('stamp', 5.5, { gain: 0.65 }); // 1,000,000 EXAMPLES
      brush(5.5, 0.3, 0.6, -0.1); // underline
      brush(6.0, 0.3, 0.7, 0.4); // arrow painted across the gutter to panel 3

      // ---- panel 3: GUESS / CHECK
      travel(5.85, 6.35);
      pull(2);
      brush(6.8, 0.3, 1.4, 0.1); // GUESS arrow
      dab(6.95, 0.6, 0);
      k.play('slap', 7.15, { gain: 0.45, pan: 0.35 }); // DOG? card
      k.play('stamp', 7.5, { gain: 0.8, pan: 0.4 }); // red X, CHECK, WRONG
      k.play('error', 7.6, { f: 'E3', gain: 0.75, pan: 0.3 });
      for (let i = 1; i < 4; i++) flood(7.5 + i * 0.1, 0.45, true); // panel flickers red

      // ---- panel 4: ADJUST
      travel(8.15, 8.65);
      brush(8.4, 0.55, 1.4, 0.3); // error arrow painted down to the dials
      pull(3);
      dab(9.1, 0.6, 0.2); // ADJUST
      for (let i = 1; i <= 4; i++) k.play('tock', when(9.25, 9.85, SE.inOut, (i - 0.5) / 4), { f: 500 + i * 30, gain: 0.35, pan: 0.25, minor: true }); // dials turn
      k.play('slap', 10.0, { gain: 0.4, pan: 0.3 }); // CAT card
      k.play('success', when(10.05, 10.25, SE.back, 1), { f: 'C5', gain: 0.55, pan: 0.4 });
      brush(10.15, 0.25, 0.9, -0.3); // loop arrow back to guess again

      // ---- panel 5: ACCURACY
      travel(10.35, 10.85);
      pull(4);
      brush(11.38, 1.12, 0.6, -0.3); // the curve inks along
      for (let t = 11.3, last = 61, lastT = -1; t < 12.52; t += 1 / 120) { const v = Math.round(61 + 36 * SE.inOut(sseg(t, 11.3, 12.5))); if (v !== last && t - lastT >= 0.1) { tick(t, 0.9, 0.3); last = v; lastT = t; } }
      // 97%: the big hit, then the colourway flickers through four quick re-floods (8 per second)
      k.play('impact', 12.5, { gain: 1.2, pan: 0.25 });
      k.play('stamp', 12.5, { gain: 0.6, pan: 0.25 });
      for (let i = 1; i < 4; i++) flood(12.5 + i * 0.125, 0.55, true);

      // ---- panel 6: TAKEAWAY
      travel(12.75, 13.25);
      pull(5);
      brush(13.75, 0.2, 0.7, 0); // arrow
      ['C4', 'G4', 'C5', 'E5'].forEach((f, i) => k.play('ding', 13.95 + i * 0.06, { f, gain: 0.38 - i * 0.05, pan: (i - 1.5) * 0.2 }));
      // pull back to the whole Warhol grid
      travel(14.05, 14.75, 1.4);
      k.play('ding', 14.75, { f: 'G4', gain: 0.22, pan: 0 });
    },
    draw(ctx, W, H_, t) {
      const tone = toneImage();
      const step = 5; // fixed edition (matches the gallery still)
      // linen canvas ground
      ctx.fillStyle = `rgb(${CANVAS})`; ctx.fillRect(0, 0, W, H_);
      const panels = [];
      for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
        const idx = j * COLS + i, r = H.rng(100 + idx * 7 + step * 131);
        const px = M + i * (PW + G) + r.range(-2, 2), py = M + j * (PH + G) + r.range(-2, 2);
        const pal = PAL[(idx + step * 3) % PAL.length];
        const kdx = r.range(-7, 7), kdy = r.range(-6, 6);               // black screen offset
        const heavy = [0.05, -0.04, 0.15, -0.07, 0.02, 0.1, -0.1, 0.07][idx]; // ink load per pull
        panels.push({ px, py, kdx, kdy, heavy, seed: idx + 1 + step * 17, pullDir: r.chance(0.5) ? 1 : -1, ghost: (idx === 2 || idx === 5) ? [r.range(10, 16), r.range(-4, 4)] : null });
        // print order: one panel after another
        const T0 = 0.15 + idx * 0.25;
        const pp = panels[panels.length - 1];
        pp.keyProg = H.ease.inOut(H.clamp((t - T0 - 0.38) / 0.36));
        pp.ghostOn = t > T0 + 0.82;
        if (t < T0) {
          ctx.strokeStyle = 'rgba(90,80,70,0.25)'; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, PW - 1, PH - 1);
          continue;
        }
        ctx.save(); ctx.translate(px, py);
        ctx.beginPath(); ctx.rect(0, 0, PW * H.ease.out(H.clamp((t - T0) / 0.16)), PH); ctx.clip();
        ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, PW, PH);
        const plateA = t > T0 + 0.18, plateB = t > T0 + 0.28;
        // colour plates: cut loosely, placed a little off
        const o = () => [r.range(-12, 12), r.range(-9, 9)];
        let [dx, dy] = o();
        ctx.fillStyle = plateA ? pal.body : 'rgba(0,0,0,0)';
        cutShape(ctx, [[34 + dx, PH + 4], [44 + dx, 270 + dy], [70 + dx, 252 + dy], [232 + dx, 250 + dy], [258 + dx, 268 + dy], [272 + dx, PH + 4]]);
        [dx, dy] = o();
        ctx.fillStyle = plateA ? pal.head : 'rgba(0,0,0,0)';
        ctx.save(); ctx.translate(150 + dx, 145 + dy); ctx.rotate(r.range(-0.05, 0.05));
        cutShape(ctx, [[-80, -62], [-66, -76], [64, -78], [82, -60], [84, 64], [70, 78], [-70, 76], [-84, 60]]);
        ctx.fillRect(-100, -27, 20, 56); ctx.fillRect(80, -27, 20, 56);
        ctx.restore();
        [dx, dy] = o();
        ctx.fillStyle = plateB ? pal.eye : 'rgba(0,0,0,0)';
        cutShape(ctx, blobAround(r, 114 + dx, 136 + dy, 34, 28, 9)); cutShape(ctx, blobAround(r, 188 + dx, 136 + dy, 34, 28, 9));
        [dx, dy] = o();
        ctx.fillStyle = plateB ? pal.mouth : 'rgba(0,0,0,0)';
        cutShape(ctx, [[100 + dx, 176 + dy], [200 + dx, 174 + dy], [202 + dx, 206 + dy], [98 + dx, 209 + dy]]);
        ctx.fillStyle = plateB ? pal.tip : 'rgba(0,0,0,0)'; ctx.beginPath(); ctx.arc(150 + dx * 0.6, 35 + dy * 0.6, 13, 0, 7); ctx.fill();
        ctx.fillStyle = plateB ? pal.mouth : 'rgba(0,0,0,0)'; ctx.fillRect(108 + dx * 0.5, 276 + dy * 0.5, 84, 40);
        ctx.restore();
      }

      // ---- per-pixel: pull the black screen, squeegee streaks, ink texture, canvas weave ----
      const img = ctx.getImageData(0, 0, W, H_), d = img.data;
      const nz = H.makeNoise(8);
      // streak fields per panel (1D along pull direction = rows) precomputed
      const streakRows = panels.map((p) => { const a = new Float32Array(PH); const n2 = H.makeNoise(p.seed * 13); for (let y = 0; y < PH; y++) a[y] = n2.fbm2(y * 0.045, 0.5, 3) + 0.6 * n2.n2(y * 0.3, 7.7); return a; });
      // mid-frequency grain field (shared), low-res then sampled
      const GW = 320, GH = 180, grain = new Float32Array(GW * GH);
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) grain[y * GW + x] = nz.fbm2(x * 0.22, y * 0.22, 3) * 0.7 + nz.n2(x * 0.9, y * 0.9) * 0.3;
      const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
      const K = [22, 18, 20];
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        // canvas weave
        const weave = 1 + 0.025 * Math.sin(x * 2.1) * Math.sin(y * 2.3) + (hash(x, y, 1) - 0.5) * 0.05;
        let r = d[i] * weave, g = d[i + 1] * weave, b = d[i + 2] * weave;
        let pi = -1;
        for (let k = 0; k < panels.length; k++) { const p = panels[k]; if (x >= p.px && x < p.px + PW && y >= p.py && y < p.py + PH) { pi = k; break; }
        if (pi >= 0 && panels[pi].keyProg === undefined) pi = -1; }
        if (pi >= 0) {
          const p = panels[pi], lx = x - p.px, ly = y - p.py;
          const gs = grain[((y * GH / H_) | 0) * GW + ((x * GW / W) | 0)];
          // squeegee: ink starves in streaks and toward the end of the pull
          const pull = p.pullDir > 0 ? lx / PW : 1 - lx / PW;
          const st = streakRows[pi][ly | 0];
          const starve = H.clamp((st * 0.9 + pull * 0.9 - 0.75) * 1.6) * 0.85;
          // colour plates thin slightly in the starved streaks
          const cs = starve * 0.22 + (hash(x, y, 3) - 0.5) * 0.04;
          r += (CANVAS[0] - r) * cs; g += (CANVAS[1] - g) * cs; b += (CANVAS[2] - b) * cs;
          // black photo screen (misregistered)
          const tx = Math.round(lx - p.kdx), ty = Math.round(ly - p.kdy);
          const kp = p.keyProg;
          if (kp > 0 && kp < 1) { // wet ink bead riding in front of the squeegee
            const fr = kp * (PW + 20) - 10, dd = pull * PW - fr;
            if (dd > 0 && dd < 7) { const bead = 0.55 * (1 - dd / 7) * (0.8 + 0.2 * Math.sin(ly * 0.3)); r *= 1 - bead; g *= 1 - bead; b *= 1 - bead; }
          }
          if (pull * PW <= kp * (PW + 20) - 10 && tx >= 0 && ty >= 0 && tx < PW && ty < PH) {
            const tv = tone[(ty * PW + tx) * 4] / 255;
            const thr = 0.47 + p.heavy + gs * 0.14 + (hash(x, y, 5) - 0.5) * 0.16;
            let cov = H.clamp((thr - tv) * 9);
            if (cov > 0) {
              let dens = 0.97 - starve * 0.9 + (hash(x, y, 9) - 0.5) * 0.1;
              if (starve > 0.35 && hash(x, y >> 1, 11) < starve * 0.8) dens *= 0.2;
              cov *= H.clamp(dens);
              r = r * (1 - cov) + K[0] * cov; g = g * (1 - cov) + K[1] * cov; b = b * (1 - cov) + K[2] * cov;
            }
          }
          // ghost: a second, starved pull of the screen slipped sideways
          if (p.ghost && p.ghostOn) {
            const gx = Math.round(lx - p.kdx - p.ghost[0]), gy = Math.round(ly - p.kdy - p.ghost[1]);
            if (gx >= 0 && gy >= 0 && gx < PW && gy < PH) {
              const tv = tone[(gy * PW + gx) * 4] / 255;
              let cov = H.clamp((0.4 + gs * 0.2 - tv) * 6) * (0.32 + 0.25 * st) * (hash(x, y, 17) < 0.55 ? 1 : 0.25);
              r *= 1 - cov * 0.9; g *= 1 - cov * 0.9; b *= 1 - cov * 0.9;
            }
          }
        }
        d[i] = r; d[i + 1] = g; d[i + 2] = b;
      }
      ctx.putImageData(img, 0, 0);
      const z = 1 + 0.03 * H.ease.inOut(H.clamp((t - 2.4) / 2.1));
      if (z > 1.0001) {
        const cp = H.layer(W, H_); cp.getContext('2d').drawImage(ctx.canvas, 0, 0, W, H_);
        ctx.drawImage(cp, 640 - 640 / z, 360 - 360 / z, W / z, H_ / z, 0, 0, W, H_);
      }
    },
  });
}
