{
  const fieldNoise = (w, h, seed, cell, oct, sx = 1, sy = 1) => {
    const nz = H.makeNoise(seed), gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2, g = new Float32Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) g[j * gw + i] = nz.fbm2(i * 0.35 * sx, j * 0.35 * sy, oct);
    const out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      const fy = y / cell, j = fy | 0, ty = fy - j;
      for (let x = 0; x < w; x++) {
        const fx = x / cell, i = fx | 0, tx = fx - i, k = j * gw + i;
        const a = g[k] + (g[k + 1] - g[k]) * tx, b = g[k + gw] + (g[k + gw + 1] - g[k + gw]) * tx;
        out[y * w + x] = a + (b - a) * ty;
      }
    }
    return out;
  };
  const inkify = (layer, seed, mottle, speck) => {
    const c = layer.getContext('2d'), w = layer.width, h = layer.height, img = c.getImageData(0, 0, w, h), d = img.data;
    const n1 = fieldNoise(w, h, seed, 4, 3), n2 = fieldNoise(w, h, seed + 9, 36, 3), r = H.rng(seed + 3);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      if (!d[i + 3]) continue;
      let a = 1 - mottle * Math.max(0, n1[p] * 1.7 + n2[p] * 1.1);
      if (r() < speck * (0.3 + Math.max(0, n2[p]) * 4)) a *= 0.2;
      d[i + 3] *= H.clamp(a, 0, 1);
    }
    c.putImageData(img, 0, 0);
  };

  let PHOTO = null;
  const CACHE = {}; const CF = (k, ...a) => CACHE[k] || (CACHE[k] = fieldNoise(...a));
  const RED = '#c8281e', BLACK = '#1d1a17', CREAM = '#e9dcbc';

  // grayscale "photograph" of a robot shouting into a megaphone (profile, facing right)
  const drawPhoto = (c, t) => {
    const lg = (x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, v]) => g.addColorStop(o, `rgb(${v},${v},${v})`)); return g; };
    const rg = (x, y, r0, r1, stops) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, v]) => g.addColorStop(o, `rgb(${v},${v},${v})`)); return g; };
    // torso / shoulders
    c.fillStyle = lg(150, 470, 560, 720, [[0, 70], [0.45, 150], [0.75, 210], [1, 120]]);
    c.beginPath(); c.moveTo(120, 760); c.lineTo(170, 520); c.quadraticCurveTo(200, 470, 290, 458); c.lineTo(470, 458); c.quadraticCurveTo(560, 470, 590, 540); c.lineTo(640, 760); c.closePath(); c.fill();
    // chest plate seams + rivets
    c.strokeStyle = 'rgb(40,40,40)'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(380, 470); c.lineTo(390, 760); c.stroke();
    c.beginPath(); c.moveTo(200, 560); c.lineTo(600, 560); c.stroke();
    c.fillStyle = 'rgb(30,30,30)';
    for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(230 + i * 55, 585, 6, 0, 7); c.fill(); }
    c.fillStyle = rg(470, 640, 5, 90, [[0, 250], [1, 90]]); c.beginPath(); c.arc(470, 650, 70, 0, 7); c.fill(); // power core
    c.fillStyle = 'rgb(25,25,25)'; c.beginPath(); c.arc(470, 650, 38, 0, 7); c.fill();
    c.fillStyle = rg(462, 640, 2, 30, [[0, 255], [1, 120]]); c.beginPath(); c.arc(470, 650, 26, 0, 7); c.fill();
    // neck rings
    for (let i = 0; i < 4; i++) {
      c.fillStyle = lg(320, 0, 440, 0, [[0, 50], [0.6, 200], [1, 90]]);
      c.beginPath(); c.ellipse(380, 445 - i * 16, 58, 13, 0, 0, 7); c.fill();
    }
    // head (profile)
    c.fillStyle = lg(250, 160, 520, 420, [[0, 60], [0.35, 140], [0.7, 225], [1, 160]]);
    c.beginPath();
    c.moveTo(270, 400); c.lineTo(250, 250); c.quadraticCurveTo(250, 150, 360, 140); c.lineTo(450, 140);
    c.quadraticCurveTo(510, 145, 520, 210); c.lineTo(535, 300); c.lineTo(520, 345); c.lineTo(500, 400); c.closePath(); c.fill();
    // jaw shadow
    c.fillStyle = 'rgba(20,20,20,0.55)'; c.beginPath(); c.moveTo(270, 400); c.lineTo(500, 400); c.lineTo(515, 360); c.lineTo(290, 370); c.closePath(); c.fill();
    // visor
    c.fillStyle = lg(380, 200, 540, 260, [[0, 20], [0.7, 40], [1, 90]]);
    c.beginPath(); c.moveTo(380, 205); c.lineTo(522, 205); c.lineTo(530, 262); c.lineTo(390, 262); c.closePath(); c.fill();
    c.fillStyle = rg(480, 228, 2, 40, [[0, 255], [1, 40]]); c.beginPath(); c.ellipse(480, 230, 34, 14, 0, 0, 7); c.fill(); // glowing eye
    c.strokeStyle = 'rgb(250,250,250)'; c.lineWidth = 4; c.beginPath(); c.moveTo(395, 212); c.lineTo(515, 212); c.stroke(); // visor glint
    // ear disc
    c.fillStyle = rg(330, 270, 4, 52, [[0, 240], [0.5, 150], [1, 40]]); c.beginPath(); c.arc(330, 275, 48, 0, 7); c.fill();
    c.strokeStyle = 'rgb(30,30,30)'; c.lineWidth = 5; c.beginPath(); c.arc(330, 275, 30, 0, 7); c.stroke();
    c.fillStyle = 'rgb(20,20,20)'; c.beginPath(); c.arc(330, 275, 10, 0, 7); c.fill();
    // antenna bolts
    c.fillStyle = lg(300, 100, 330, 100, [[0, 60], [1, 220]]); c.fillRect(300, 92, 18, 52);
    c.fillStyle = rg(309, 88, 2, 18, [[0, 250], [1, 50]]); c.beginPath(); c.arc(309, 88, 16, 0, 7); c.fill();
    // mouth grille
    c.fillStyle = 'rgb(25,25,25)'; c.fillRect(440, 300, 70, 46);
    c.fillStyle = 'rgb(170,170,170)'; for (let i = 0; i < 4; i++) c.fillRect(444, 304 + i * 11, 62, 4);
    // megaphone cone (from mouth to upper right)
    const mx0 = 500, my0 = 322, mx1 = 690, my1 = 228, a = Math.atan2(my1 - my0, mx1 - mx0), nx = -Math.sin(a), ny = Math.cos(a);
    const r0 = 24, r1 = 92;
    c.fillStyle = lg(mx0 + nx * r1, my0 + ny * r1, mx0 - nx * r1, my0 - ny * r1, [[0, 50], [0.35, 140], [0.62, 245], [0.8, 190], [1, 80]]);
    c.beginPath(); c.moveTo(mx0 + nx * r0, my0 + ny * r0); c.lineTo(mx1 + nx * r1, my1 + ny * r1); c.lineTo(mx1 - nx * r1, my1 - ny * r1); c.lineTo(mx0 - nx * r0, my0 - ny * r0); c.closePath(); c.fill();
    // bell rim
    c.save(); c.translate(mx1, my1); c.rotate(a);
    c.fillStyle = 'rgb(35,35,35)'; c.beginPath(); c.ellipse(0, 0, 26, r1 + 4, 0, 0, 7); c.fill();
    c.fillStyle = rg(6, 0, 2, 70, [[0, 30], [1, 110]]); c.beginPath(); c.ellipse(4, 0, 18, r1 - 6, 0, 0, 7); c.fill();
    c.restore();
    // handle + raised arm
    c.fillStyle = lg(420, 360, 520, 460, [[0, 80], [0.5, 210], [1, 70]]);
    c.beginPath(); c.moveTo(560, 300); c.lineTo(588, 290); c.lineTo(560, 430); c.lineTo(520, 470); c.lineTo(470, 470); c.lineTo(530, 400); c.closePath(); c.fill();
    c.fillStyle = 'rgb(40,40,40)'; c.beginPath(); c.arc(560, 330, 16, 0, 7); c.fill();
    return { mx1, my1, a };
  };

  // cut out + halftone-screen a grayscale "photograph" (drawn by fn) once; returns photo, dot layer and cut-out rim
  const screenPhoto = (fn, W, HH, seed = 19, S = 6.2, gam = 1) => {
    const PH = H.layer(W, HH), pc = PH.getContext('2d');
    fn(pc);
    const pdat = pc.getImageData(0, 0, W, HH).data;
    const HT = H.layer(W, HH), hc = HT.getContext('2d');
    const th = Math.PI / 4, cs = Math.cos(th), sn = Math.sin(th);
    hc.fillStyle = BLACK; hc.beginPath();
    const ext = 1100;
    for (let v = -ext / S; v < ext / S; v++) for (let u = -ext / S; u < ext / S * 1.6; u++) {
      const x = (u * cs - v * sn) * S + 120, y = (u * sn + v * cs) * S - 400;
      if (x < 0 || y < 0 || x >= W || y >= HH) continue;
      const k = ((y | 0) * W + (x | 0)) * 4;
      const al = pdat[k + 3] / 255; if (al < 0.5) continue;
      const lum = gam === 1 ? pdat[k] / 255 : Math.pow(pdat[k] / 255, gam); // gam < 1 opens the midtones for small pastes
      const dk = Math.pow(1 - lum, 0.9);
      const rad = S * 0.62 * Math.sqrt(dk) + 0.35;
      hc.moveTo(x + rad, y); hc.arc(x, y, rad, 0, Math.PI * 2);
    }
    hc.fill();
    const SIL = H.layer(W, HH), sc = SIL.getContext('2d');
    sc.drawImage(PH, 0, 0); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#efe5cc'; sc.fillRect(0, 0, W, HH);
    inkify(HT, seed, 0.18, 0.004);
    return { PH, HT, SIL };
  };

  // ===================== EXPLAINER: "How does AI learn?" =====================
  // Agitprop sequence: Lissitzky's red wedge drives across the sheet between scenes, slogans slam on slanted
  // bars, arrows are heavy bars with wedge heads, numbers are stencil-tall Anton, photos are halftone cut-outs.
  const EXC = {};
  const exPaperC = (W, HH) => EXC.paper || (EXC.paper = (() => {
    const cv = H.layer(W, HH), x = cv.getContext('2d'), img = x.createImageData(W, HH), pd = img.data;
    const lo = CF('lo', W, HH, 41, 22, 4), fib = CF('fib', W, HH, 42, 2, 2, 4, 0.5), r0 = H.rng(5), base = H.hex(CREAM), tan = H.hex('#b99a62');
    for (let y = 0, p = 0; y < HH; y++) for (let xx = 0; xx < W; xx++, p++) {
      const ex = Math.min(xx, W - xx) / W, ey = Math.min(y, HH - y) / HH;
      const edge = Math.pow(1 - H.clamp(Math.min(ex * 4, ey * 3) + lo[p] * 0.2, 0, 1), 3), k = 0.4 * edge + 0.16 * Math.max(0, lo[p]);
      const s = 1 + fib[p] * 0.04 + (r0() - 0.5) * 0.05, i = p * 4;
      pd[i] = (base[0] + (tan[0] - base[0]) * k) * s; pd[i + 1] = (base[1] + (tan[1] - base[1]) * k) * s; pd[i + 2] = (base[2] + (tan[2] - base[2]) * k) * s; pd[i + 3] = 255;
    }
    x.putImageData(img, 0, 0); return cv;
  })());
  const exInk = (layer, seed, mottle, speck = 0) => { // cached-noise version of inkify (mottle + pinhole voids)
    const c = layer.getContext('2d'), w = layer.width, h = layer.height, img = c.getImageData(0, 0, w, h), d = img.data;
    const n1 = CF('ei1', w, h, seed, 4, 3), n2 = CF('ei2', w, h, seed + 9, 36, 3);
    const rnd = CACHE['rnd' + w] || (CACHE['rnd' + w] = (() => { const r = H.rng(seed + 3), a = new Float32Array(w * h); for (let i = 0; i < a.length; i++) a[i] = r(); return a; })());
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      if (!d[i + 3]) continue;
      const m = n2[p] > 0 ? n2[p] : 0;
      let a = 1 - mottle * Math.max(0, n1[p] * 1.7 + n2[p] * 1.1);
      if (rnd[p] < speck * (0.3 + m * 4)) a *= 0.2;
      d[i + 3] *= a < 0 ? 0 : a > 1 ? 1 : a;
    }
    c.putImageData(img, 0, 0);
  };
  // grayscale studio "photos" of a cat and a dog, for the halftone screen
  const drawAnimal = (kind) => (c) => {
    const g = (x0, y0, x1, y1, st) => { const gr = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, v]) => gr.addColorStop(o, `rgb(${v},${v},${v})`)); return gr; };
    c.save(); c.translate(300, 300);
    if (kind === 'cat') {
      c.fillStyle = g(-120, -100, 120, 140, [[0, 60], [0.5, 150], [1, 230]]);
      c.beginPath(); c.ellipse(0, 70, 95, 110, 0, 0, 7); c.fill();
      c.beginPath(); c.arc(0, -60, 72, 0, 7); c.fill();
      c.beginPath(); c.moveTo(-66, -80); c.lineTo(-58, -160); c.lineTo(-14, -118); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(66, -80); c.lineTo(58, -160); c.lineTo(14, -118); c.closePath(); c.fill();
      c.fillStyle = 'rgb(240,240,240)'; c.beginPath(); c.ellipse(-26, -64, 14, 10, 0, 0, 7); c.ellipse(26, -64, 14, 10, 0, 0, 7); c.fill();
      c.fillStyle = 'rgb(10,10,10)'; c.beginPath(); c.ellipse(-26, -64, 4, 9, 0, 0, 7); c.ellipse(26, -64, 4, 9, 0, 0, 7); c.fill();
      c.beginPath(); c.moveTo(-8, -38); c.lineTo(8, -38); c.lineTo(0, -28); c.closePath(); c.fill();
      c.strokeStyle = 'rgb(40,40,40)'; c.lineWidth = 12; c.beginPath(); c.moveTo(80, 150); c.quadraticCurveTo(170, 140, 140, 40); c.stroke();
    } else {
      c.fillStyle = g(-120, -100, 120, 140, [[0, 230], [0.5, 160], [1, 70]]);
      c.beginPath(); c.ellipse(0, 80, 100, 100, 0, 0, 7); c.fill();
      c.beginPath(); c.arc(0, -55, 75, 0, 7); c.fill();
      c.fillStyle = 'rgb(50,50,50)'; c.beginPath(); c.ellipse(-78, -40, 26, 62, 0.35, 0, 7); c.ellipse(78, -40, 26, 62, -0.35, 0, 7); c.fill();
      c.fillStyle = 'rgb(225,225,225)'; c.beginPath(); c.ellipse(0, -18, 40, 30, 0, 0, 7); c.fill();
      c.fillStyle = 'rgb(10,10,10)'; c.beginPath(); c.arc(-28, -70, 9, 0, 7); c.arc(28, -70, 9, 0, 7); c.fill();
      c.beginPath(); c.ellipse(0, -30, 15, 10, 0, 0, 7); c.fill();
      c.fillStyle = 'rgb(120,40,40)'; c.beginPath(); c.ellipse(0, 4, 12, 16, 0, 0, Math.PI); c.fill();
    }
    c.restore();
  };
  const exPhotos = (W, HH) => EXC.ph || (EXC.ph = {
    robot: PHOTO || (PHOTO = screenPhoto((pc) => drawPhoto(pc, 0), W, HH)),
    cat: screenPhoto(drawAnimal('cat'), 600, 600, 23), dog: screenPhoto(drawAnimal('dog'), 600, 600, 29),
    catS: screenPhoto(drawAnimal('cat'), 600, 600, 23, 11, 0.7), dogS: screenPhoto(drawAnimal('dog'), 600, 600, 29, 11, 0.7),
  });
  // paste a screened photo: cream cut-out rim, faint tone, dots (all multiplied on paper)
  const paste = (ctx, P, x, y, s, rot = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    const ro = Math.max(1, 3.2 / Math.max(0.05, s) / 4);
    for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [-3, -3], [3, 3], [3, -3], [-3, 3]]) ctx.drawImage(P.SIL, dx * ro, dy * ro);
    ctx.drawImage(P.SIL, 0, 0);
    ctx.globalAlpha = 0.18; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(P.PH, 0, 0);
    ctx.globalAlpha = 1; ctx.drawImage(P.HT, 1.5, -1);
    ctx.restore();
  };
  // heavy bar arrow with a wedge head
  const barArrow = (c, x0, y0, x1, y1, p, w, col) => {
    if (p <= 0) return; const a = Math.atan2(y1 - y0, x1 - x0), l = Math.hypot(x1 - x0, y1 - y0) * p;
    c.save(); c.translate(x0, y0); c.rotate(a); c.fillStyle = col; c.fillRect(0, -w / 2, Math.max(0, l - w * 2.2), w);
    c.beginPath(); c.moveTo(l, 0); c.lineTo(l - w * 2.6, -w * 1.4); c.lineTo(l - w * 2.6, w * 1.4); c.closePath(); c.fill(); c.restore();
  };
  const slab = (c, txt, x, y, ang, font, fg, bg, padX = 14, padY = 10, p = 1) => { // slanted bar with lettering
    if (p <= 0) return; c.save(); c.translate(x, y); c.rotate(ang); c.font = font; c.letterSpacing = '3px';
    const m = c.measureText(txt), w = m.width + padX * 2, h = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + padY * 2;
    if (bg) { c.fillStyle = bg; c.fillRect(-padX, -m.actualBoundingBoxAscent - padY, w * p, h); }
    if (p >= 1) { c.fillStyle = fg; c.fillText(txt, 0, 0); }
    c.restore(); c.letterSpacing = '0px';
  };
  const cog = (c, x, y, r, teeth, a) => {
    c.save(); c.translate(x, y); c.rotate(a); c.beginPath();
    for (let i = 0; i < teeth * 2; i++) { const rr = i % 2 ? r : r * 1.22, a0 = (i / (teeth * 2)) * Math.PI * 2; c.lineTo(Math.cos(a0 - 0.12) * rr, Math.sin(a0 - 0.12) * rr); c.lineTo(Math.cos(a0 + 0.12) * rr, Math.sin(a0 + 0.12) * rr); }
    c.closePath(); c.arc(0, 0, r * 0.38, 0, 7, true); c.fill(); c.restore();
  };

  // worn-print finish: fine cream scratches through the ink (same seed in the still and the explainer)
  const scratches = (ctx, W, HH) => {
    const rs = H.rng(88);
    ctx.save(); ctx.strokeStyle = 'rgba(250,244,228,0.35)'; ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) { const x = rs.range(0, W), y = rs.range(0, HH), l = rs.range(4, 30), a2 = rs.range(0, 3); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a2) * l, y + Math.sin(a2) * l); ctx.stroke(); }
    ctx.restore();
  };

  const explainConstructivist = (ctx, W, HH, t) => {
    const E = H.ease, cl = H.clamp, S = (a, b) => cl((t - a) / (b - a), 0, 1);
    const tq = Math.floor(t * 15) / 15; // agitprop staccato: punches land on twos
    const Sq = (a, b) => cl((tq - a) / (b - a), 0, 1);
    const WEDGES = [5.6, 10.0, 12.55], swapAt = (w) => w + 0.5;
    const scene = t < swapAt(WEDGES[0]) ? 1 : t < swapAt(WEDGES[1]) ? 2 : t < swapAt(WEDGES[2]) ? 3 : 4;
    const PH = exPhotos(W, HH);
    ctx.drawImage(exPaperC(W, HH), 0, 0);
    const L = H.layer(W, HH), c = L.getContext('2d'); c.textBaseline = 'alphabetic';
    const pastes = []; // photos to paste after the flat plates
    const R0 = { x: 14, y: 66, s: 0.85 }, bell = [14 + 690 * 0.85, 66 + 228 * 0.85];

    // ---------- hook (scene 1 opening) ----------
    const hp = E.inOut(S(1.6, 2.3));
    if (hp < 1) {
      c.save(); c.globalAlpha = 1;
      const disc = E.out(Sq(0, 0.4)); c.fillStyle = RED; c.beginPath(); c.arc(980 - (1 - disc) * 600, 300, 230, 0, 7); c.fill();
      const beams = [[-2.6, 0.06], [-2.3, 0.1], [-1.95, 0.04], [-1.7, 0.12]];
      beams.forEach(([a, w], i) => { const p = Sq(0.2 + i * 0.08, 0.3 + i * 0.08); if (p <= 0) return; c.fillStyle = i % 2 ? RED : BLACK; c.beginPath(); c.moveTo(980, 300); c.lineTo(980 + Math.cos(a - w) * 1400 * p, 300 + Math.sin(a - w) * 1400 * p); c.lineTo(980 + Math.cos(a + w) * 1400 * p, 300 + Math.sin(a + w) * 1400 * p); c.closePath(); c.fill(); });
      c.restore();
    }
    // the slogan collapses into a slanted corner banner
    {
      const x = H.lerp(110, 30, hp), y = H.lerp(430, 52, hp), s = H.lerp(1, 0.3, hp), ang = H.lerp(-0.2, -0.06, hp);
      c.save(); c.translate(x, y); c.scale(s, s);
      slab(c, 'HOW DOES', 0, 0, ang, `400 ${H.lerp(64, 96, hp).toFixed(2)}px "Russo One"`, CREAM, BLACK, 20, 16, Sq(0.35, 0.5));
      if (tq >= 0.6) { c.save(); c.rotate(ang); const k = cl((tq - 0.6) / 0.2, 0, 1), sc = 1 + 0.6 * (1 - k); c.translate(0, 150); c.scale(sc, sc); c.fillStyle = RED; c.font = '400 170px "Anton"'; c.letterSpacing = '2px'; c.fillText('AI LEARN?', 0, 0); c.letterSpacing = '0px'; c.restore(); }
      c.restore();
    }

    // ---------- scene 1: data poured into the megaphone ----------
    if (scene === 1 && t > 2.0) {
      const k = E.out(S(2.0, 2.6));
      pastes.push(['robot', R0.x - (1 - k) * 500, R0.y + (1 - k) * 200, R0.s]);
      // conveyor: heavy diagonal bar from upper right down to the bell
      const cx0 = 1300, cy0 = 40, cx1 = bell[0] + 60, cy1 = bell[1] - 20;
      c.save(); c.fillStyle = BLACK; c.translate(cx1, cy1); c.rotate(Math.atan2(cy0 - cy1, cx0 - cx1)); c.fillRect(0, 70, Math.hypot(cx0 - cx1, cy0 - cy1) * E.out(S(2.4, 2.8)), 26); c.restore();
      // examples ride the bar into the bell (photos)
      for (let i = 0; i < 9; i++) {
        const u = (t - 2.7 - i * 0.42) * 0.55; if (u < 0 || u > 1) continue;
        const kind = H.rng(i * 11 + 3)() < 0.5 ? 'cat' : 'dog', sh = 1 - E.in(cl((u - 0.75) / 0.25, 0, 1));
        const x = H.lerp(cx0 - 60, cx1, u), y = H.lerp(cy0 + 40, cy1 + 20, u) - 80, s = 0.33 * sh;
        pastes.push([kind + 'S', x - 300 * s, y - 300 * s, s, -0.25]);
        if (sh > 0.6) slab(c, kind.toUpperCase(), x - 44, y + 72 * sh, -0.25, '700 28px "Oswald"', CREAM, RED, 8, 5); // label stamped on the card
      }
      // red arrow into the bell + label
      barArrow(c, 1000, 420, bell[0] + 30, bell[1] + 40, E.out(Sq(3.0, 3.3)), 22, RED);
      slab(c, 'TRAINING DATA', 840, 505, -0.24, '700 30px "Oswald"', CREAM, BLACK, 10, 6, Sq(3.2, 3.35));
      // counter: stencil numerals in a slanted black box
      const cp = S(3.0, 5.4), n = cp < 1 ? Math.pow(cp, 3) * 1e6 : 1e6;
      c.save(); c.translate(640, 640); c.rotate(-0.12);
      c.fillStyle = BLACK; c.fillRect(-20, -100, 600 * E.out(Sq(2.8, 3.0)), 118);
      if (tq >= 3.0) { c.fillStyle = CREAM; c.font = '400 100px "Anton"'; c.letterSpacing = '4px'; c.fillText(Math.round(n).toLocaleString('en-US'), 0, 0); c.letterSpacing = '0px'; c.fillStyle = RED; c.font = '400 30px "Russo One"'; c.fillText('EXAMPLES', 440, 40); }
      c.restore();
    }

    // ---------- scene 2: guess -> check -> adjust ----------
    if (scene === 2) {
      const t0 = swapAt(WEDGES[0]);
      pastes.push(['robot', R0.x, R0.y, R0.s]);
      // new picture pinned top right
      pastes.push(['catS', 760 - 300 * 0.28, 105 - 300 * 0.28 - (1 - E.out(Sq(t0, t0 + 0.3))) * 300, 0.28, 0.08]);
      slab(c, 'NEW PICTURE', 470, 74, 0.08, '700 28px "Oswald"', CREAM, BLACK, 8, 5, Sq(t0 + 0.3, t0 + 0.45));
      // the guess is shouted through the megaphone
      const shout = (txt, ts, col) => {
        const beams = [[-0.3, 0.1], [-0.08, 0.08], [0.16, 0.06]];
        beams.forEach(([a, w], i) => { const p = cl(Math.floor((t - ts - i * 0.07) * 15) / 2, 0, 1); if (p <= 0) return; c.fillStyle = i % 2 ? BLACK : RED; c.beginPath(); c.moveTo(bell[0] + 20, bell[1]); c.lineTo(bell[0] + Math.cos(a - w) * 700 * p, bell[1] + Math.sin(a - w) * 700 * p); c.lineTo(bell[0] + Math.cos(a + w) * 700 * p, bell[1] + Math.sin(a + w) * 700 * p); c.closePath(); c.fill(); });
        if (t > ts + 0.25) { c.save(); c.translate(720, 300); c.rotate(-0.2); const k = cl(Math.floor((t - ts - 0.25) * 15) / 3, 0, 1), sc = 1 + 0.5 * (1 - k); c.scale(sc, sc); c.font = '400 120px "Anton"'; c.fillStyle = BLACK; c.fillText(txt, 4, 4); c.fillStyle = col; c.fillText(txt, 0, 0); c.restore(); }
      };
      if (t < 9.3) {
        shout('DOG?', 6.75, CREAM);
        const xp = Sq(7.45, 7.6); // CHECK: a red cross is stamped over it
        if (xp > 0) { c.save(); c.translate(1040, 220); c.fillStyle = RED; c.rotate(0.785); c.fillRect(-70 * xp, -14, 140 * xp, 28); c.fillRect(-14, -70 * xp, 28, 140 * xp); c.restore(); }
        const rp = S(7.55, 7.85); if (rp > 0) { c.strokeStyle = BLACK; c.lineWidth = 12; c.beginPath(); c.ellipse(900, 250, 240, 120, -0.2, -2, -2 + Math.PI * 2 * rp); c.stroke(); }
        if (tq > 7.7) slab(c, 'WRONG! IT IS A CAT', 700, 440, -0.2, '400 28px "Russo One"', CREAM, RED, 12, 8);
      } else {
        shout('CAT!', 9.35, RED);
        const cp = Sq(9.7, 9.85); if (cp > 0) { c.save(); c.translate(1010, 210); c.rotate(-0.2); c.fillStyle = BLACK; c.fillRect(-16, -16, 30, 70 * cp); c.fillRect(-16, 38, 110 * cp, 30); c.restore(); }
      }
      // ADJUST: error bar flies back to the robot's gears; the cogs turn
      barArrow(c, 760, 470, 390, 560, E.inOut(S(7.9, 8.35)), 20, RED);
      if (t > 8.35 && t < 9.3) slab(c, 'ERROR', 545, 470, -0.24, '700 30px "Oswald"', CREAM, RED, 8, 5);
      const turn = E.inOut(S(8.35, 9.2)) * 2.4 + (t > 9.3 ? (t - 9.3) * 0.8 : 0);
      c.fillStyle = BLACK; cog(c, 300, 560, 40 * E.back(Sq(t0 + 0.2, t0 + 0.4)), 10, turn); cog(c, 368, 512, 26 * E.back(Sq(t0 + 0.3, t0 + 0.5)), 8, -turn * 1.5);
      c.fillStyle = RED; cog(c, 248, 500, 20 * E.back(Sq(t0 + 0.35, t0 + 0.55)), 7, -turn * 2);
      // the loop: three slanted bars wired into a circuit
      const steps = [['GUESS', 760, 610], ['CHECK', 960, 560], ['ADJUST', 1110, 660]], act = t < 7.45 ? 0 : t < 8.3 ? 1 : t < 9.3 ? 2 : Math.floor((t - 9.3) * 3) % 3;
      steps.forEach(([s, x, y], i) => slab(c, s, x, y, -0.2, '400 30px "Russo One"', CREAM, i === act && t > 6.7 ? RED : BLACK, 12, 8, Sq(t0 + 0.2 + i * 0.12, t0 + 0.32 + i * 0.12)));
      barArrow(c, 890, 590, 950, 575, Sq(t0 + 0.6, t0 + 0.7), 10, BLACK);
      barArrow(c, 1100, 575, 1150, 625, Sq(t0 + 0.7, t0 + 0.8), 10, BLACK);
      barArrow(c, 1090, 680, 900, 640, Sq(t0 + 0.8, t0 + 0.9), 10, BLACK);
    }

    // ---------- scene 3: progress ----------
    if (scene === 3) {
      const t0 = swapAt(WEDGES[1]), prog = E.inOut(S(t0 + 0.2, 12.0));
      // emphasis: beams burst behind the final number
      const burst = Sq(12.05, 12.25);
      if (burst > 0) { for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.1; c.fillStyle = i % 2 ? RED : BLACK; c.beginPath(); c.moveTo(1010, 300); c.lineTo(1010 + Math.cos(a - 0.08) * 460 * burst, 300 + Math.sin(a - 0.08) * 460 * burst); c.lineTo(1010 + Math.cos(a + 0.08) * 460 * burst, 300 + Math.sin(a + 0.08) * 460 * burst); c.closePath(); c.fill(); } }
      c.save(); c.translate(90, 640); c.rotate(-0.12);
      c.fillStyle = BLACK; c.fillRect(0, 0, 700 * E.out(Sq(t0, t0 + 0.2)), 14);
      for (let i = 0; i < 9; i++) { const acc = 61 + 36 * (1 - Math.pow(1 - i / 8, 2)), bp = E.out(cl(prog * 9 - i, 0, 1)), h = (acc - 45) * 7.5 * bp; c.fillStyle = i === 8 ? RED : i % 2 ? BLACK : RED; c.fillRect(20 + i * 76, -h, 56, h); }
      slab(c, 'TRAINING ROUNDS →', 330, 62, 0, '700 30px "Oswald"', CREAM, BLACK, 8, 5, Sq(t0 + 0.2, t0 + 0.35));
      c.restore();
      c.save(); c.translate(820, 380); c.rotate(-0.12);
      c.fillStyle = BLACK; c.fillRect(-20, -200, 420, 240);
      c.fillStyle = burst > 0 ? RED : CREAM; c.font = '400 210px "Anton"'; c.fillText(Math.round(H.lerp(61, 97, prog)) + '%', 0, 0);
      c.restore();
      slab(c, 'ACCURACY', 820, 140, -0.12, '400 40px "Russo One"', CREAM, RED, 12, 8, Sq(t0 + 0.1, t0 + 0.25));
      slab(c, '61% → 97%', 860, 505, -0.12, '700 36px "Oswald"', CREAM, RED, 12, 8, Sq(t0 + 0.4, t0 + 0.5));
    }

    // ---------- scene 4: takeaway slogan ----------
    if (scene === 4) {
      const t0 = swapAt(WEDGES[2]);
      c.fillStyle = RED; c.beginPath(); c.arc(1080, 560, 260, 0, 7); c.fill();
      slab(c, 'MORE EXAMPLES', 90, 260, -0.15, '400 76px "Russo One"', CREAM, BLACK, 22, 16, Sq(t0, t0 + 0.15));
      barArrow(c, 200, 320, 300, 455, E.out(Sq(t0 + 0.2, t0 + 0.4)), 28, RED);
      if (tq >= t0 + 0.35) { c.save(); c.translate(320, 610); c.rotate(-0.15); const k = cl((tq - t0 - 0.35) / 0.2, 0, 1), sc = 1 + 0.5 * (1 - k); c.scale(sc, sc); c.font = '400 132px "Anton"'; c.fillStyle = RED; c.fillText('BETTER GUESSES', 7, 7); c.fillStyle = BLACK; c.fillText('BETTER GUESSES', 0, 0); c.restore(); }
    }

    // ---------- Lissitzky's red wedge drives across between scenes ----------
    const WL = H.layer(W, HH), wc = WL.getContext('2d'); let wedgeOn = false;
    for (const w of WEDGES) {
      const u = S(w, w + 0.95); if (u <= 0 || u >= 1) continue; wedgeOn = true; const c = wc;
      const tx = H.lerp(-100, 3900, E.inOut(u));
      c.fillStyle = RED; c.beginPath(); c.moveTo(tx, HH / 2); c.lineTo(tx - 2400, -1400); c.lineTo(tx - 2400, HH + 1400); c.closePath(); c.fill();
      c.fillStyle = BLACK; c.beginPath(); c.moveTo(tx + 60, HH / 2 + 30); c.lineTo(tx - 2400, -1360); c.lineTo(tx - 2400, -1330); c.closePath(); c.fill();
    }

    // ---------- print: plates multiply, then pasted photos, then grain ----------
    exInk(L, 7, 0.26, 0.006);
    const pasteAll = () => pastes.forEach(([k, x, y, s, rot]) => paste(ctx, PH[k], x, y, s, rot || 0));
    // photos sit under the slogans/wedge: paste first, then plates on top (multiply keeps dots visible under ink)
    pasteAll();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0); ctx.restore();
    if (wedgeOn) { exInk(WL, 7, 0.12, 0.004); ctx.drawImage(WL, 0, 0); }
    scratches(ctx, W, HH);
    H.grain(ctx, W, HH, 0.08, 4 + Math.floor(t * 12), true);
    H.vignette(ctx, W, HH, 0.25, '50,30,10');
  };

  registerStyle({
    id: 'constructivist',
    name: 'Constructivist Propaganda',
    category: 'Art & Design Movements',
    description: 'A 1920s Rodchenko / El Lissitzky agitprop poster: red, black and cream only, a halftone photomontage robot bellowing through a megaphone, beams radiating from its voice, a red disc and hard diagonal bars, and heavy condensed lettering set on the slant — litho ink mottle on cheap paper.',
    motion: 'Agitprop staccato: the red disc rolls in, the halftone robot slides up the diagonal, beams punch out of the megaphone two frames at a time, the slogan bars shoot across and the words slam down on the beat; in the hold the beam fan pulses with each shout.',
    fonts: ['400 150px "Anton"', '400 40px "Russo One"', '700 18px "Oswald"'],
    frameT: 4.6,
    duration: 5,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: "Agitprop sequence: Lissitzky's red wedge drives across the sheet between scenes, slogans and labels slam onto slanted bars on twos, arrows are heavy bars with wedge heads, the counter is stencil-tall Anton, and the key moments get a stamped red cross or a burst of beams.",
    explainer(ctx, W, HH, t) { explainConstructivist(ctx, W, HH, t); },
    // Sound: a print works on agitprop duty. Slogans and slabs slam down like a press, the red wedge is a heavy iron
    // ram driving through with a low roar, the megaphone shouts are short brass blasts through a horn, beams crack out,
    // the counter is stencil-stamped and the cogs ratchet. Times copied from explainConstructivist(); its slabs land
    // "on twos" (t quantised to 1/15 s), so q(b) gives the first frame a slab or slogan is actually complete.
    explainerSound(k) {
      const D = 14.5, E = H.ease, cl = H.clamp;
      const S = (t, a, b) => cl((t - a) / (b - a), 0, 1);
      const q = (b) => Math.ceil(b * 15 - 1e-6) / 15;
      const pan = (px) => cl((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (a, b, ease, u) => { for (let i = 0; i <= 400; i++) if (ease(i / 400) >= u - 1e-6) return a + ((b - a) * i) / 400; return b; };
      const WEDGES = [5.6, 10.0, 12.55], swapAt = (w) => w + 0.5;
      // a slab or slogan slammed down: paper slap with a press thump (big = louder, heavier)
      const slam = (t, g, p, minor) => { k.play('slap', t, { gain: 0.55 * g, pan: p, minor }); k.play('thud', t, { f: 110, gain: 0.5 * g, pan: p, minor }); };
      // megaphone shout: detuned saws honking through a horn-shaped band
      const horn = (t, notes, dur, g, p, minor) => notes.forEach((n, i) => { for (const det of [-9, 9])
        k.tone(t, { f: n, type: 'sawtooth', detune: det, dur, gain: 0.035 * g, a: 0.02, hold: dur * 0.6, filter: 'bandpass', f2: [[0, 700], [0.05, 1500], [dur, 1000]], q: 0.9, pan: p + (i - (notes.length - 1) / 2) * 0.15, verb: 0.2, minor }); });
      // a beam cracking out: short punchy noise burst
      const beam = (t, g, p) => k.noise(t, { dur: 0.09, filter: 'bandpass', f: [[0, 600], [0.09, 1800]], q: 0.8, gain: 0.22 * g, a: 0.004, pan: p, minor: true });
      // stencil-stamped counter digit
      const numb = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1500, q: 1.2, gain: 0.32 * g, a: 0.001, pan: p }); k.tone(t, { f: 130, dur: 0.05, gain: 0.12 * g, pan: p }); });
      // the red wedge: an iron ram driving left to right (inOut over 0.95 s, fastest at the middle)
      const ram = (w) => {
        k.noise(w, { dur: 0.95, color: 'brown', filter: 'lowpass', f: [[0, 150], [0.47, 900], [0.95, 200]], gain: 0.45, a: 0.4, pan: -0.3 });
        k.noise(w + 0.2, { dur: 0.75, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.27, 1300], [0.75, 400]], q: 0.8, gain: 0.16, a: 0.25, pan: 0.3 });
        k.tone(w, { f: [[0, 45], [0.47, 72], [0.95, 40]], type: 'sawtooth', dur: 0.95, gain: 0.1, a: 0.4, filter: 'lowpass', f2: 300 });
      };

      k.bed('hum', 0, D, { gain: 0.35 });  // the print works
      k.bed('room', 0, D, { gain: 0.4 });

      // ---- hook: disc drives in (0-0.4), four beams crack out, HOW DOES slab, AI LEARN? slams (0.6 -> 0.8)
      k.noise(0.0, { dur: 0.4, color: 'brown', filter: 'lowpass', f: [[0, 200], [0.4, 700]], gain: 0.3, a: 0.3, pan: 0.2 });
      k.play('thud', q(0.4), { f: 90, gain: 0.6, pan: pan(980) });
      [0, 1, 2, 3].forEach((i) => beam(q(0.2 + i * 0.08) + 1 / 15, 1, pan(700 - i * 100)));
      slam(q(0.5), 0.8, -0.4, true);
      k.play('stamp', 0.8, { gain: 0.65, pan: -0.2 }); k.play('impact', 0.8, { gain: 0.3, pan: -0.2 });
      // slogan collapses into the corner banner (1.6-2.3): a soft sheet slide
      k.noise(1.6, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.7, 900]], q: 0.7, gain: 0.08, a: 0.3, pan: -0.5, minor: true });

      // ---- scene 1: DATA poured into the megaphone
      k.noise(2.0, { dur: 0.5, color: 'brown', filter: 'lowpass', f: [[0, 250], [0.5, 600]], gain: 0.25, a: 0.15, pan: -0.5, minor: true }); // robot photo slides in
      k.play('thud', when(2.0, 2.6, E.out, 0.95), { f: 100, gain: 0.4, pan: -0.5, minor: true });
      k.noise(2.4, { dur: 0.4, color: 'brown', filter: 'bandpass', f: 350, q: 1.2, gain: 0.2, a: 0.05, pan: 0.4, minor: true }); // conveyor bar runs out
      slam(3.0, 0.6, pan(900), true); // counter box set
      const cards = []; for (let i = 0; 2.7 + i * 0.42 < swapAt(WEDGES[0]) - 0.1; i++) cards.push(2.7 + i * 0.42);
      cards.forEach((tc) => k.play('stamp', tc, { gain: 0.3, pan: pan(1200), minor: true })); // each card arrives with its label stamped on
      slam(q(3.3), 0.7, pan(820), true);      // red arrow into the bell; TRAINING DATA lands one frame later on the same slam
      // counter n = S(3.0,5.4)^3 * 1e6, stencil-stamped, speeding up, off the card stamps
      for (let t = 3.12; t < 5.32; ) { const s = S(t, 3.0, 5.4); if (!cards.some((c) => t > c - 0.06 && t < c + 0.08)) numb(t, 0.7 + 0.4 * s, pan(900)); t += 0.16 - 0.075 * s; }
      k.play('stamp', 5.4, { gain: 0.6, pan: pan(900) }); k.play('thud', 5.4, { f: 90, gain: 0.4, pan: pan(900) }); // 1,000,000

      // ---- the red wedge drives across: 5.6, 10.0, 12.55
      WEDGES.forEach(ram);

      // ---- scene 2: GUESS / CHECK / ADJUST (t0 = 6.1)
      const t0 = swapAt(WEDGES[0]);
      slam(q(t0 + 0.3), 0.7, pan(680), true);         // cat picture drops in
      k.play('tock', q(t0 + 0.4), { f: 300, gain: 0.4, pan: pan(300), minor: true }); // cogs bolt on
      slam(q(t0 + 0.45), 0.55, pan(800), true);       // NEW PICTURE + CHECK slabs land on the same frame (GUESS/ADJUST ride along)
      // the guess is shouted through the megaphone (beams 6.82+, DOG? slams at 7.2)
      horn(6.82, ['D3', 'Ab3'], 0.38, 1, pan(800));
      [0, 1, 2].forEach((i) => beam(6.75 + i * 0.07 + 1 / 15, 0.8, pan(800)));
      slam(7.2, 0.9, pan(800), false);
      // CHECK: red cross stamped on (7.47 -> 7.6), black ring brushed round it, WRONG slab
      k.play('stamp', 7.6, { gain: 1.0, pan: pan(1040) });
      horn(7.62, ['C3', 'Db3'], 0.45, 1.1, pan(1040));
      k.play('stroke', 7.58, { material: 'brush', dur: 0.3, gain: 0.8, pan: pan(900), minor: true });
      slam(q(7.71), 0.55, pan(800), true);
      // ADJUST: the error bar drives back to the cogs (inOut 7.9-8.35), cogs ratchet round (inOut 8.35-9.2)
      k.noise(7.9, { dur: 0.45, color: 'brown', filter: 'lowpass', f: [[0, 200], [0.25, 800], [0.45, 250]], gain: 0.3, a: 0.2, pan: -0.2 });
      k.play('thud', 8.35, { f: 120, gain: 0.5, pan: pan(390) });
      for (let i = 1, lt = 8.35; i <= 9; i++) { const t = when(8.35, 9.2, E.inOut, i / 9); if (t - lt < 0.09) continue; lt = t; k.play('tock', t, { f: 360 + (i % 2) * 70, gain: 0.45, pan: pan(300), minor: true }); k.play('click', t + 0.006, { f: 900, gain: 0.5, pan: pan(300), minor: true }); }
      // the correction: CAT! shouted (9.35) on a bright major blast, slams at 9.8, check mark at 9.87
      horn(9.42, ['C4', 'E4', 'G4'], 0.5, 1.1, pan(800));
      [0, 1, 2].forEach((i) => beam(9.35 + i * 0.07 + 1 / 15, 0.8, pan(800)));
      slam(9.8, 0.9, pan(800), false);
      k.play('stamp', q(9.85), { gain: 0.5, pan: pan(1010) }); // check mark stamped

      // ---- scene 3: PROGRESS (t0 = 10.5)
      const t3 = swapAt(WEDGES[1]);
      slam(q(t3 + 0.2), 0.5, -0.3, true);   // base bar
      slam(q(t3 + 0.25), 0.5, pan(820), true); // ACCURACY
      // bars rise as prog = inOut(S(10.7,12.0)) passes i/9: a heavy chunk each (at least 100 ms apart), rising a little
      const bars = []; for (let i = 1, lt = 0; i < 9; i++) { const t = when(t3 + 0.2, 12.0, E.inOut, i / 9); if (t - lt < 0.1) continue; lt = t; bars.push(t); k.play('thud', t, { f: 80 + i * 12, gain: 0.3, pan: pan(110 + i * 76), minor: true }); }
      for (let t = t3 + 0.25, last = 61, lt = -1; t < 11.97; t += 1 / 120) {
        const v = Math.round(H.lerp(61, 97, E.inOut(S(t, t3 + 0.2, 12.0))));
        if (v !== last && t - lt >= 1 / 11 && !bars.some((b) => Math.abs(t - b) < 0.05)) { numb(t, 0.9, pan(1000)); last = v; lt = t; }
      }
      // 97%: beams burst behind the number (from 12.067), the biggest hit
      const bt = q(12.05 + 1e-3);
      k.play('impact', bt, { gain: 1.7, pan: pan(1010) }); k.play('thud', bt, { f: 70, gain: 0.9 });
      k.play('stamp', bt, { gain: 0.9, pan: pan(1010) });
      horn(bt + 0.01, ['C3', 'G3', 'C4', 'E4'], 0.7, 1.2, pan(1010));

      // ---- scene 4: TAKEAWAY (t0 = 13.05): MORE EXAMPLES slab, arrow, BETTER GUESSES slams (13.4 -> 13.6)
      const t4 = swapAt(WEDGES[2]);
      slam(q(t4 + 0.15), 0.8, -0.4, false);
      k.noise(t4 + 0.2, { dur: 0.25, color: 'brown', filter: 'lowpass', f: [[0, 250], [0.2, 700]], gain: 0.2, a: 0.1, pan: -0.3, minor: true });
      k.play('stamp', 13.6, { gain: 0.6, pan: -0.1 }); k.play('thud', 13.6, { f: 80, gain: 0.35 });
      horn(13.62, ['F3', 'A3', 'C4'], 0.25, 0.8, 0, true);
      horn(13.9, ['C3', 'G3', 'C4', 'E4'], 0.55, 0.9, 0); // the resolve
    },
    draw(ctx, W, HH, t) {
      const P = (d, dur = 0.5) => H.ease.out(H.clamp((t - d) / dur, 0, 1));

      // ---------- paper ----------
      ctx.drawImage(exPaperC(W, HH), 0, 0); // same paper maths as before, built once and cached

      // ---------- flat ink plates ----------
      const L = H.layer(W, HH), c = L.getContext('2d');
      // megaphone geometry (needed for beams)
      const mx1 = 690, my1 = 228;
      // red disc behind the head
      // disc rolls in from the left edge and lands
      { const p = H.ease.out(H.clamp(t / 0.7, 0, 1)); c.fillStyle = RED; c.beginPath(); c.arc(360 - (1 - p) * 640, 300, 235, 0, 7); c.fill(); }
      // radiating beams from the bell
      const beams = [[-0.62, 0.05, BLACK], [-0.5, 0.16, RED], [-0.28, 0.035, BLACK], [-0.19, 0.12, RED], [-0.02, 0.03, BLACK], [0.06, 0.07, RED], [0.18, 0.02, BLACK]];
      beams.forEach(([ang, wid, col], i) => {
        wid = wid;
        // staccato: each beam punches out in two frames, then the whole fan "shouts" on a beat
        const p = H.clamp(Math.floor((t - (1.0 + i * 0.1)) * 15) / 2, 0, 1), len = 1500 * p;
        if (p <= 0) return;
        const beat = t > 2.8 ? Math.exp(-((t - 2.8) % 0.5) * 9) : 0;
        wid *= 1 + 0.22 * beat;
        c.fillStyle = col; c.beginPath(); c.moveTo(mx1 + 20, my1);
        c.lineTo(mx1 + Math.cos(ang - wid / 2) * len, my1 + Math.sin(ang - wid / 2) * len);
        c.lineTo(mx1 + Math.cos(ang + wid / 2) * len, my1 + Math.sin(ang + wid / 2) * len); c.closePath(); c.fill();
      });
      // heavy diagonal bars
      const ang = -0.24;
      c.save(); c.translate(650, 580); c.rotate(ang);
      c.fillStyle = BLACK; c.fillRect(-60, -54, 820 * P(1.55, 0.3), 92);
      c.fillStyle = RED; c.fillRect(-700, 62, 1500 * P(1.45, 0.35), 22);
      // lettering on the slant
      c.fillStyle = CREAM; c.font = '400 38px "Russo One"'; c.letterSpacing = '5px';
      if (t >= 1.95) c.fillText(t >= 2.1 ? 'BUILD THE' : 'BUILD', 6, 8);   // words punched in on the beat
      if (t >= 2.25) { // FUTURE slams down from oversize, stepped on twos
        const k = H.clamp(Math.floor((t - 2.25) * 15) / 3, 0, 1), sc = 1 + 0.6 * (1 - k);
        c.save(); c.translate(262 + 200, -10); c.scale(sc, sc); c.translate(-(262 + 200), 10);
        c.fillStyle = RED; c.font = '400 132px "Anton"'; c.letterSpacing = '2px';
        c.fillText('FUTURE', 262, 30); c.restore();
      }
      { const txt = 'ALL POWER TO THE MACHINES · 2026', n = H.clamp(Math.floor((t - 2.55) * 40), 0, txt.length); // typed like a ticker
        c.fillStyle = BLACK; c.font = '700 18px "Oswald"'; c.letterSpacing = '5px';
        if (n > 0) c.fillText(txt.slice(0, n), 4, 118); }
      c.restore();
      // small black square + circle (Lissitzky accent)
      c.letterSpacing = '0px';
      exInk(L, 7, 0.26, 0.006);

      // ---------- halftone photomontage ----------
      // the photograph is a fixed object (cut out once, screened once) that then slides in as a whole
      if (!PHOTO) PHOTO = screenPhoto((pc) => drawPhoto(pc, t), W, HH);
      const { PH, HT, SIL } = PHOTO;
      const slide = (1 - H.ease.out(H.clamp((t - 0.25) / 0.75, 0, 1))) * -420, ox = slide, oy = -slide * 0.4;
      // composite: rim (paper-coloured under-layer, covering beams), then ink plates multiply, then halftone multiply
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0); ctx.restore();
      ctx.save();
      for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [-3, -3], [3, 3], [3, -3], [-3, 3]]) ctx.drawImage(SIL, dx + ox, dy + oy);
      ctx.drawImage(SIL, ox, oy);
      ctx.restore();
      // light tonal wash under the dots so the photo reads as a print on toned paper
      ctx.save(); ctx.globalAlpha = 0.18; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(PH, ox, oy); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(HT, 1.5 + ox, -1 + oy); ctx.restore();

      // ---------- finish ----------
      scratches(ctx, W, HH);
      H.grain(ctx, W, HH, 0.08, 4 + Math.floor(t * 12), true);
      H.vignette(ctx, W, HH, 0.25, '50,30,10');
    },
  });
}
