{
  // String art: brass-nail lightbulb on a stained walnut board. Threads are straight chords between
  // nails; curves emerge only as envelopes (cardioid filament, chord-ring halo, cross-hatched base).
  const TAU = Math.PI * 2;

  function woodBoard(ctx, W, H_, t) {
    const img = ctx.createImageData(W, H_), d = img.data;
    const nz = H.makeNoise(23), nz2 = H.makeNoise(91), nz3 = H.makeNoise(57), r = H.rng(4);
    const planks = [0, 236, 486, 720];
    const dark = [50, 27, 14], mid = [116, 70, 39], light = [186, 128, 78];
    const yh = (n) => { const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
    for (let p = 0; p < 3; p++) {
      const y0 = planks[p], y1 = planks[p + 1], off = p * 137.3, tone = [0.95, 1.05, 0.9][p];
      for (let y = y0; y < y1; y++) {
        for (let x = 0; x < W; x++) {
          // flat-sawn figure: parabolic "cathedral" arches around a per-plank pith, warped by noise
          const px = [380, 900, 560][p], c = [0.0011, -0.0008, 0.0013][p];
          const wv = nz.n2(x * 0.0014 + off, y * 0.008) * 30 + nz.n2(x * 0.006 + off, y * 0.02) * 2.5 + nz2.n2(x * 0.0007 + off, y * 0.003) * 40;
          let gg = (y - y0 - (y1 - y0) * 0.5) + (x - px) * (x - px) * c + wv;
          // growth rate wanders, so the rings bunch up and spread out instead of marching evenly
          const rate = 0.8 + 0.45 * (nz3.n2(x * 0.0011 + off, y * 0.006) * 0.5 + 0.5);
          gg = Math.abs(gg) * 0.055 * rate + 0.6 * Math.sin(gg * 0.013 + p) + 0.25 * nz2.n2(x * 0.004, y * 0.05);
          const yr = Math.floor(gg), fr = gg - yr, h1 = yh(yr + p * 31), h2 = yh(yr * 1.7 + p * 13 + 5);
          // asymmetric ring: earlywood darkens gradually into a latewood band that ends sharply; width and
          // darkness vary year to year
          const lw = 0.5 + 0.32 * h1;
          let ring = H.smooth(lw - 0.22, 0.95, fr) * (1 - H.smooth(0.965, 1, fr)) * (0.45 + 0.65 * h2);
          const fine = nz2.n2(x * 0.015, y * 0.7 + off) * 0.5 + 0.5;  // fine streaks along the grain
          const pore = H.smooth(0.42, 0.72, nz3.n2(x * 0.045 + off, y * 1.25 + off)); // short open-pore flecks
          const fig = nz.n2(x * 0.0012 + 3, y * 0.006 + off) * 0.5 + 0.5;
          const streak = nz3.n2(x * 0.0022 + off, y * 0.03 + 7);              // long colour streaks along the plank
          ring *= 0.6 + 0.6 * fig;
          let k = 0.47 + fig * 0.46 + streak * 0.09 - ring * 0.27 - fine * 0.1 - pore * (0.1 + ring * 0.1);
          k = H.clamp(k, 0, 1);
          const c0 = k < 0.5 ? dark : mid, c1 = k < 0.5 ? mid : light, kk = k < 0.5 ? k * 2 : (k - 0.5) * 2;
          const o = (y * W + x) * 4;
          // edge darkening toward plank seams (bevel)
          const e = Math.min(y - y0, y1 - 1 - y);
          const bev = e < 3 ? 0.45 + e * 0.15 : e < 7 ? 0.9 + (e - 3) * 0.025 : 1;
          const sh = tone * bev * (1 + (r() - 0.5) * 0.04);
          d[o] = (c0[0] + (c1[0] - c0[0]) * kk) * sh;
          d[o + 1] = (c0[1] + (c1[1] - c0[1]) * kk) * sh;
          d[o + 2] = (c0[2] + (c1[2] - c0[2]) * kk) * sh;
          d[o + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    // satin finish: soft broad sheen from upper left
    const g = ctx.createRadialGradient(330, 120, 40, 330, 120, 900);
    g.addColorStop(0, 'rgba(255,220,170,0.14)'); g.addColorStop(1, 'rgba(255,220,170,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H_);
  }

  function thread(ctx, segs, col, alpha, width) {
    if (!segs.length) return;
    ctx.save();
    ctx.lineCap = 'round';
    const path = (dx, dy) => { ctx.beginPath(); for (const [a, b] of segs) { ctx.moveTo(a[0] + dx, a[1] + dy); ctx.lineTo(b[0] + dx, b[1] + dy); } };
    // shadow cast onto the board (thread floats ~2mm above the wood, light from top-left): soft penumbra + tight core
    path(2.8, 3.6); ctx.strokeStyle = 'rgba(15,6,2,0.1)'; ctx.lineWidth = width * 3.4; ctx.stroke();
    path(1.6, 2.2); ctx.strokeStyle = 'rgba(15,6,2,0.3)'; ctx.lineWidth = width * 1.5; ctx.stroke();
    // body, with a darker under-edge so pale thread separates from the wood
    path(0.35, 0.45); ctx.strokeStyle = H.rgba(H.mix(col, '#2a1408', 0.55), alpha * 0.5); ctx.lineWidth = width * 1.05; ctx.stroke();
    path(0, 0); ctx.strokeStyle = H.rgba(col, alpha); ctx.lineWidth = width; ctx.stroke();
    // sheen (mercerised cotton): bright thin core on the lit side
    path(-0.3, -0.3); ctx.strokeStyle = H.rgba(H.mix(col, '#ffffff', 0.65), Math.min(1, alpha * 0.65)); ctx.lineWidth = width * 0.38; ctx.stroke();
    ctx.restore();
  }

  function nail(ctx, x, y, r, seed) {
    const rr = H.rng(seed);
    const dx = rr.range(-0.6, 0.6), dy = rr.range(-0.6, 0.6);
    // contact shadow + long soft shadow (light from top-left)
    let g = ctx.createRadialGradient(x + 3.5, y + 4.5, 0, x + 3.5, y + 4.5, r * 2.4);
    g.addColorStop(0, 'rgba(10,4,0,0.55)'); g.addColorStop(1, 'rgba(10,4,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + 3.5, y + 4.5, r * 2.4, 0, TAU); ctx.fill();
    // head
    g = ctx.createRadialGradient(x - r * 0.4 + dx, y - r * 0.45 + dy, 0.2, x, y, r);
    g.addColorStop(0, '#fff6dc'); g.addColorStop(0.25, '#d8c08a'); g.addColorStop(0.7, '#8c6d3a'); g.addColorStop(1, '#3d2c14');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(30,18,6,0.7)'; ctx.lineWidth = 0.6; ctx.stroke();
  }

  let WOOD = null; // the board never changes: build it once (deterministic), reuse every frame
  // wind(list, p): chords wound so far; the chord currently being wound is drawn partially
  function wind(list, p) {
    if (p <= 0) return [];
    const f = H.clamp(p) * list.length, n = Math.floor(f), out = list.slice(0, n);
    if (n < list.length) { const [a, b] = list[n], k = f - n; out.push([a, [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]]); }
    return out;
  }
  const ph = (t, t0, t1) => H.clamp((t - t0) / (t1 - t0));


  // =====================================================================================
  // EXPLAINER — the neural network IS a string-art board: nails are neurons, threads are
  // connections, and a connection's weight is how many times the thread is wound. Learning
  // = unwinding wrong paths and adding wraps to right ones. The camera travels along one
  // long board; labels are kraft tags nailed on; counters are nail-and-thread 7-segment digits.
  // =====================================================================================
  const AX = (t, a, b) => H.clamp((t - a) / (b - a));
  const BROWN = '#2a1307';
  function woodWorld(ctx, x0, x1) {
    if (!WOOD) { WOOD = H.layer(1280, 720); woodBoard(WOOD.getContext('2d'), 1280, 720, 0); }
    for (let i = Math.floor(x0 / 1280); i <= Math.floor(x1 / 1280); i++) {
      ctx.drawImage(WOOD, i * 1280, 0);
      ctx.fillStyle = 'rgba(20,8,2,0.55)'; ctx.fillRect(i * 1280 - 1.5, 0, 3, 720); // butt joint
    }
  }
  // kraft paper tag nailed at the top, hand-lettered
  function ktag(ctx, text, x, y, o = {}) {
    const size = o.size || 24;
    ctx.save(); ctx.font = `700 ${size}px "Caveat"`;
    const w = Math.max(o.minW || 0, ctx.measureText(text).width + size * 1.0), h = size * 1.5 + 10;
    ctx.translate(x, y); ctx.rotate(o.rot || 0);
    const ox = o.align === 'left' ? 0 : -w / 2;
    ctx.fillStyle = 'rgba(10,4,0,0.35)'; ctx.fillRect(ox + 4, 6, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, o.red ? '#d0503a' : '#d4b27a'); g.addColorStop(1, o.red ? '#b23a28' : '#c09858');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ox + 8, 0); ctx.lineTo(ox + w - 8, 0); ctx.lineTo(ox + w, 8); ctx.lineTo(ox + w, h); ctx.lineTo(ox, h); ctx.lineTo(ox, 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = o.red ? '#fff3e0' : BROWN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, ox + w / 2, h / 2 + 5);
    ctx.restore();
    nail(ctx, x + (o.align === 'left' ? 14 : 0), y + 7, 2.8, 900 + (x | 0));
    return w;
  }
  function droppedTag(ctx, t, t0, text, x, y, o) { if (t < t0) return; const k = H.ease.back(AX(t, t0, t0 + 0.28)); ktag(ctx, text, x, y - (1 - k) * 60, { ...o, rot: (o && o.rot || 0) + (1 - k) * 0.25 }); }
  // inked doodle on a tag
  function petTag(ctx, kind, x, y, s, label) {
    ctx.save();
    ctx.fillStyle = 'rgba(10,4,0,0.35)'; ctx.fillRect(x + 4, y + 5, s, s * 1.2);
    ctx.fillStyle = '#ead9b4'; ctx.fillRect(x, y, s, s * 1.2);
    ctx.strokeStyle = BROWN; ctx.lineWidth = Math.max(1.5, s * 0.03); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const cx = x + s / 2, cy = y + s * 0.5, r = s * 0.25;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (kind === 'cat') { ctx.moveTo(cx - r * 0.8, cy - r * 0.5); ctx.lineTo(cx - r * 0.75, cy - r * 1.35); ctx.lineTo(cx - r * 0.2, cy - r * 0.95); ctx.moveTo(cx + r * 0.8, cy - r * 0.5); ctx.lineTo(cx + r * 0.75, cy - r * 1.35); ctx.lineTo(cx + r * 0.2, cy - r * 0.95);
      ctx.moveTo(cx - r * 1.5, cy + r * 0.2); ctx.lineTo(cx - r * 0.5, cy + r * 0.3); ctx.moveTo(cx + r * 1.5, cy + r * 0.2); ctx.lineTo(cx + r * 0.5, cy + r * 0.3); }
    else { ctx.moveTo(cx - r * 0.9, cy - r * 0.6); ctx.quadraticCurveTo(cx - r * 1.6, cy, cx - r * 1.1, cy + r * 0.9); ctx.moveTo(cx + r * 0.9, cy - r * 0.6); ctx.quadraticCurveTo(cx + r * 1.6, cy, cx + r * 1.1, cy + r * 0.9); }
    ctx.stroke();
    ctx.fillStyle = BROWN; ctx.beginPath(); ctx.arc(cx - r * 0.35, cy - r * 0.1, s * 0.025, 0, 7); ctx.arc(cx + r * 0.35, cy - r * 0.1, s * 0.025, 0, 7); ctx.fill();
    if (label) { ctx.font = `700 ${Math.max(28, s * 0.24)}px "Caveat"`; ctx.textAlign = 'center'; ctx.fillText(label, cx, y + s * 1.12); }
    ctx.restore();
    nail(ctx, x + s / 2, y + 6, 2.6, 500 + (x | 0) + (y | 0));
  }
  // nail-and-thread 7-segment digits
  const SEG = { '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd', '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg' };
  function sevenSeg(ctx, str, x, y, w, h, col, seed = 1) {
    const segs = [], nails = []; let xx = x;
    for (const ch of str) {
      if (ch === ',' || ch === '.') { nails.push([xx + 4, y + h]); xx += w * 0.45; continue; }
      if (ch === '%') { const a = [xx + w * 0.15, y + h * 0.1], b = [xx + w * 0.85, y + h * 0.9], c1 = [xx + w * 0.85, y + h * 0.1], c2 = [xx + w * 0.15, y + h * 0.9];
        for (const o of [-1.5, 0, 1.5]) segs.push([[c2[0] + o, c2[1]], [c1[0] + o, c1[1]]]); nails.push(c1, c2); [[xx + w * 0.22, y + h * 0.2], [xx + w * 0.78, y + h * 0.8]].forEach(([cx, cy]) => { const rr = w * 0.22; for (let k = 0; k < 8; k++) { const a0 = (k / 8) * 6.283, a1 = ((k + 1) / 8) * 6.283; for (const o of [0, 1.6]) segs.push([[cx + Math.cos(a0) * (rr - o), cy + Math.sin(a0) * (rr - o)], [cx + Math.cos(a1) * (rr - o), cy + Math.sin(a1) * (rr - o)]]); nails.push([cx + Math.cos(a0) * rr, cy + Math.sin(a0) * rr]); } });
        xx += w * 1.3; continue; }
      const P = [[xx, y], [xx + w, y], [xx, y + h / 2], [xx + w, y + h / 2], [xx, y + h], [xx + w, y + h]];
      const S = { a: [0, 1], b: [1, 3], c: [3, 5], d: [4, 5], e: [2, 4], f: [0, 2], g: [2, 3] };
      for (const sg of SEG[ch] || '') { const [i, j] = S[sg]; for (let k = -2; k <= 2; k++) segs.push([[P[i][0] + k * 1.6, P[i][1] + k * 1.2], [P[j][0] + k * 1.6, P[j][1] + k * 1.2]]); }
      nails.push(...P); xx += w * 1.45;
    }
    thread(ctx, segs, col, 0.95, 1.8);
    nails.forEach((p, i) => nail(ctx, p[0], p[1], 3, seed + i));
    return xx - x;
  }
  // thread arrow: shaft + two barbs, three nails
  function tArrow(ctx, x0, y0, x1, y1, p, col = '#efe3c8', seed = 7) {
    if (p <= 0) return; const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p, a = Math.atan2(y1 - y0, x1 - x0), L = 18;
    const b1 = [x - Math.cos(a - 0.5) * L, y - Math.sin(a - 0.5) * L], b2 = [x - Math.cos(a + 0.5) * L, y - Math.sin(a + 0.5) * L];
    const segs = [[[x0, y0], [x, y]], [[x0 + 1, y0 + 1], [x + 1, y + 1]]]; if (p >= 1) segs.push([[x, y], b1], [[x, y], b2]);
    thread(ctx, segs, col, 0.85, 1.3); nail(ctx, x0, y0, 3, seed); if (p >= 1) { nail(ctx, x, y, 3, seed + 1); nail(ctx, b1[0], b1[1], 2.6, seed + 2); nail(ctx, b2[0], b2[1], 2.6, seed + 3); }
  }
  // pyrography burn of a line of text, revealed left->right with a glowing ember
  let BURNTEX = null; // uneven pen pressure: a static mottling texture, built once
  function burnTex() {
    if (BURNTEX) return BURNTEX;
    BURNTEX = H.layer(256, 256); const c = BURNTEX.getContext('2d'), bn = H.makeNoise(5);
    for (let y = 0; y < 256; y += 4) for (let x = 0; x < 256; x += 4) { const v = bn.n2(x * 0.03, y * 0.03) * 0.7 + bn.n2(x * 0.11, y * 0.11) * 0.3; if (v > 0.05) { c.fillStyle = `rgba(120,62,24,${Math.min(0.55, v * 1.1)})`; c.fillRect(x, y, 4, 4); } }
    return BURNTEX;
  }
  const BURNC = {}; // finished burns never change: keep their pre-blurred layers
  const blurred = (src, px, col) => { const P = px * 2, c = H.layer(src.width + P * 2, src.height + P * 2), x = c.getContext('2d'); x.filter = `blur(${px}px)`; x.drawImage(col ? tint(src, col) : src, P, P); return c; };
  const tint = (src, col) => { const c = H.layer(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return c; };
  function burnText(ctx, text, x, y, font, prog, t) {
    if (prog <= 0) return; ctx.save(); ctx.font = font; const w = ctx.measureText(text).width, asc = parseFloat(font.match(/(\d+)px/)[1]); ctx.restore();
    const PAD = 40, ox = x - w / 2 - PAD, oy = y - asc * 1.1, key = text + '|' + font;
    let B = prog >= 1 ? BURNC[key] : null;
    if (!B) {
      const L = H.layer(Math.ceil(w + PAD * 2), Math.ceil(asc * 1.6)), lc = L.getContext('2d');
      lc.font = font; lc.textBaseline = 'alphabetic'; lc.fillStyle = '#000'; lc.fillText(text, PAD, asc * 1.1);
      // reveal mask: once finished it covers the italic overhang too
      lc.globalCompositeOperation = 'destination-in'; lc.fillRect(0, 0, prog >= 1 ? L.width : PAD + w * prog, L.height);
      const toast = blurred(L, 12, 'rgb(214,150,80)'), halo = blurred(L, 5, 'rgb(40,16,4)');
      // charred core with uneven pressure
      lc.globalCompositeOperation = 'source-in'; lc.fillStyle = '#1c0a03'; lc.fillRect(0, 0, L.width, L.height);
      lc.globalCompositeOperation = 'source-atop'; lc.globalAlpha = 0.7; lc.fillStyle = lc.createPattern(burnTex(), 'repeat'); lc.fillRect(0, 0, L.width, L.height); lc.globalAlpha = 1;
      B = { toast, halo, core: L };
      if (prog >= 1) BURNC[key] = B;
    }
    // toasted rim: the wood around the burn is singed paler and golden, so the letters sit in a lit patch
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.5; ctx.drawImage(B.toast, ox - 24, oy - 24); ctx.restore();
    // scorched halo right at the stroke edges, then the core
    ctx.save(); ctx.globalAlpha = 0.5; ctx.drawImage(B.halo, ox - 10, oy - 10); ctx.globalAlpha = 0.95; ctx.drawImage(B.core, ox, oy); ctx.restore();
    if (prog < 1) { const bx = ox + PAD + w * prog, by = y - asc * 0.35 + Math.sin(t * 40) * asc * 0.25, g = ctx.createRadialGradient(bx, by, 0, bx, by, 34);
      g.addColorStop(0, 'rgba(255,225,150,1)'); g.addColorStop(0.18, 'rgba(255,170,70,0.75)'); g.addColorStop(0.45, 'rgba(255,100,25,0.32)'); g.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(bx - 36, by - 36, 72, 72); ctx.restore();
      const sm = ctx.createRadialGradient(bx + 6, by - 44, 0, bx + 6, by - 44, 40);
      sm.addColorStop(0, 'rgba(220,210,200,0.14)'); sm.addColorStop(1, 'rgba(220,210,200,0)');
      ctx.fillStyle = sm; ctx.fillRect(bx - 40, by - 100, 96, 100); }
  }
  // ---------- network on region B (world x 1280..2560) ----------
  const NB = 1280;
  const IN = [[NB + 470, 250], [NB + 470, 360], [NB + 470, 470]];
  const HID = [0, 1, 2, 3, 4].map((k) => [NB + 740, 170 + k * 95]);
  const OUT = { cat: [NB + 1010, 270], dog: [NB + 1010, 460] };
  const HC = 1, HD = 3; // hidden neurons on the cat / dog path
  function weights(t) {
    const r = H.rng(808), w1 = [], w2 = [];
    const adj = H.ease.inOut(AX(t, 8.95, 9.45));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) { let w = r.range(0.1, 0.6); if (i === 1 && j === HD) w = 0.95; if (i === 1 && j === HC) w = 0.35 + 0.6 * adj; if (i === 1 && j === HD) w = 0.95 - 0.7 * adj; w1.push(w); }
    for (let j = 0; j < 5; j++) for (const o of ['cat', 'dog']) { let w = r.range(0.1, 0.5); if (j === HD && o === 'dog') w = 0.95 - 0.75 * adj; if (j === HC && o === 'cat') w = 0.3 + 0.65 * adj; w2.push(w); }
    return { w1, w2 };
  }
  function wrapSegs(a, b, w) { const n = 1 + Math.round(w * 5), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, out = [];
    for (let k = 0; k < n; k++) { const o = (k - (n - 1) / 2) * 1.5; out.push([[a[0] + nx * o, a[1] + ny * o], [b[0] + nx * o, b[1] + ny * o]]); } return out; }
  function drawNetwork(ctx, t, build) {
    const { w1, w2 } = weights(t);
    let segs = [];
    let q = 0;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) { segs = segs.concat(wrapSegs(IN[i], HID[j], w1[q++])); }
    const s2 = []; q = 0;
    for (let j = 0; j < 5; j++) for (const o of ['cat', 'dog']) s2.push(...wrapSegs(HID[j], OUT[o], w2[q++]));
    thread(ctx, wind(segs, build), '#f4ead2', 0.78, 1.3);
    thread(ctx, wind(s2, H.clamp(build * 1.3 - 0.3)), '#f4ead2', 0.78, 1.3);
    IN.concat(HID).concat([OUT.cat, OUT.dog]).forEach((p, i) => nail(ctx, p[0], p[1], 4.2, 60 + i));
  }
  function pathSegs(a, b, c) { return [[a, b], [b, c]]; }
  function sceneB(ctx, t) {
    // examples zip along threads into the input nails, a counter in nail-and-thread digits
    const lines = [[NB + 40, 250], [NB + 40, 360], [NB + 40, 470]];
    lines.forEach((p, i) => { if (t > 2.4) { thread(ctx, [[p, IN[i]]], '#c9ccd2', 0.7, 1.1); nail(ctx, p[0], p[1], 3, 40 + i); } });
    drawNetwork(ctx, t, AX(t, 2.6, 4.2));
    if (t > 2.9) droppedTag(ctx, t, 2.9, 'the model', NB + 740, 52, { size: 28 });
    if (t < 6.4) {
      const r = H.rng(12), K = 32;
      for (let k = 0; k < K; k++) {
        const kind = r() < 0.5 ? 'cat' : 'dog', ts = 2.6 + 3.2 * Math.pow(k / K, 0.8); if (t < ts) continue;
        const x = NB + 30 + (t - ts) * (430 + k * 14); if (x > NB + 420) continue;
        petTag(ctx, kind, x, lines[k % 3][1] - 4, 64, kind);
      }
      if (t > 2.7) {
        const p = AX(t, 2.75, 5.0), n = p >= 1 ? 1e6 : Math.floor(Math.pow(10, 6 * H.ease.inOut(Math.floor(p * 30) / 30))) - 1;
        const w = sevenSeg(ctx, Math.round(n).toLocaleString('en-US'), NB + 60, 575, 30, 64, '#ffc93a', 200);
        droppedTag(ctx, t, 3.0, 'examples', NB + 60 + w + 70, 600, { size: 28 });
      }
    }
    ktag(ctx, 'cat', OUT.cat[0] + 70, OUT.cat[1] - 24, { size: 34, red: t >= 9.85 && t < 10.6 });
    ktag(ctx, 'dog', OUT.dog[0] + 70, OUT.dog[1] - 24, { size: 34 });
  }
  function sceneLoop(ctx, t) {
    if (t < 6.0) return;
    // the new picture hangs on the input
    petTag(ctx, 'cat', NB + 290, 280, 120, null);
    droppedTag(ctx, t, 6.2, t >= 8.0 ? 'answer: cat' : 'new picture', NB + 350, 440, { size: 28, red: t >= 8.0 });
    tArrow(ctx, NB + 420, 360, NB + 455, 360, 1, '#efe3c8', 70);
    const pass1 = AX(t, 6.9, 7.3), right = t >= 9.8;
    if (!right && pass1 > 0) thread(ctx, wind(pathSegs(IN[1], HID[HD], OUT.dog), pass1), '#ffc93a', 0.95, 3.4);
    if (t >= 7.3 && !right) droppedTag(ctx, t, 7.3, 'guess: dog?', OUT.dog[0] + 70, OUT.dog[1] + 78, { size: 28 });
    if (t >= 7.85 && !right) { // check: red thread wound round a ring of nails on the wrong answer
      const cx = OUT.dog[0] + 70, cy = OUT.dog[1] + 12, ring = [];
      for (let k = 0; k < 14; k++) { for (const sk of [1, 2]) { const a0 = (k / 14) * 6.283, a1 = ((k + sk) / 14) * 6.283; ring.push([[cx + Math.cos(a0) * 82, cy + Math.sin(a0) * 55], [cx + Math.cos(a1) * 82, cy + Math.sin(a1) * 55]]); } }
      thread(ctx, wind(ring, AX(t, 7.85, 8.2)), '#d8322a', 0.9, 1.6);
      for (let k = 0; k < 14; k++) { const a = (k / 14) * 6.283; if (t > 7.85 + k * 0.02) nail(ctx, cx + Math.cos(a) * 82, cy + Math.sin(a) * 55, 2.8, 300 + k); }
      droppedTag(ctx, t, 8.05, 'check: wrong ✗', cx, cy - 120, { size: 28, red: true });
    }
    if (t >= 8.35 && !right) thread(ctx, wind([[OUT.dog, HID[HD]], [HID[HD], IN[1]]], AX(t, 8.35, 8.85)), '#d8322a', 0.92, 2.8);
    if (t >= 8.4 && t < 9.6) droppedTag(ctx, t, 8.4, 'error goes back', NB + 880, 520, { size: 28, red: true });
    if (t >= 8.95 && t < 10.5) droppedTag(ctx, t, 8.95, 'adjust: rewind threads', NB + 740, 52, { size: 28, red: true });
    if (t >= 9.4) thread(ctx, wind(pathSegs(IN[1], HID[HC], OUT.cat), AX(t, 9.4, 9.8)), '#ffc93a', 0.95, 3.4);
    if (right) { droppedTag(ctx, t, 9.85, 'cat ✓', OUT.cat[0] + 70, OUT.cat[1] - 100, { size: 30, red: true }); }
    // loop strip of tags joined by thread arrows
    if (t > 6.3) {
      const words = ['guess', 'check', 'adjust'], act = t < 7.3 ? -1 : t < 7.85 ? 0 : t < 8.35 ? 1 : t < 9.8 ? 2 : Math.floor((t - 9.8) / 0.16) % 3;
      let x = NB + 120;
      words.forEach((w, i) => { const tw = ktag(ctx, w, x, 590, { size: 32, align: 'left', red: i === act, minW: 110 }); x += tw + 16; if (i < 2) { tArrow(ctx, x, 618, x + 54, 618, 1, '#efe3c8', 80 + i * 4); x += 74; } });
      ktag(ctx, '↻ x 1,000,000', x + 70, 590, { size: 28 });
    }
  }
  // ---------- region C: progress ----------
  const NC = 2560;
  function sceneC(ctx, t) {
    droppedTag(ctx, t, 10.6, 'accuracy', NC + 290, 70, { size: 38 });
    const p = H.ease.inOut(AX(t, 10.95, 12.3)), v = Math.round(61 + 36 * Math.floor(p * 18) / 18);
    sevenSeg(ctx, v + '%', NC + 70, 190, 90, 200, '#ffc93a', 400);
    if (t >= 12.3) { const cx = NC + 290, cy = 290, ring = []; for (let k = 0; k < 18; k++) { for (const sk of [1, 2]) { const a0 = (k / 18) * 6.283, a1 = ((k + sk) / 18) * 6.283; ring.push([[cx + Math.cos(a0) * 280, cy + Math.sin(a0) * 165], [cx + Math.cos(a1) * 280, cy + Math.sin(a1) * 165]]); } }
      thread(ctx, wind(ring, AX(t, 12.3, 12.7)), '#d8322a', 0.85, 1.5); for (let k = 0; k < 18; k++) { const a = (k / 18) * 6.283; nail(ctx, cx + Math.cos(a) * 280, cy + Math.sin(a) * 165, 2.8, 700 + k); } }
    // line chart strung nail to nail
    const x0 = NC + 640, y0 = 600, cw = 560, ch = 420, n = 10, pts = [];
    for (let i = 0; i < n; i++) { const acc = 61 + 36 * (1 - Math.exp(-i / 2.6)) / (1 - Math.exp(-(n - 1) / 2.6)); pts.push([x0 + 30 + i * (cw - 60) / (n - 1), y0 - ((acc - 50) / 50) * ch]); }
    thread(ctx, [[[x0, y0], [x0 + cw, y0]], [[x0, y0], [x0, y0 - ch - 20]]], '#c9ccd2', 0.8, 1.2);
    [[x0, y0], [x0 + cw, y0], [x0, y0 - ch - 20]].forEach((q, i) => nail(ctx, q[0], q[1], 3.2, 760 + i));
    const segs = []; for (let i = 0; i < n - 1; i++) for (const o of [-1.5, 0, 1.5]) segs.push([[pts[i][0], pts[i][1] + o], [pts[i + 1][0], pts[i + 1][1] + o]]); // three wraps
    const k = AX(t, 10.95, 12.3); thread(ctx, wind(segs, k), '#ffc93a', 0.9, 1.5);
    pts.forEach((q, i) => { if (k * (n - 1) >= i - 0.01) nail(ctx, q[0], q[1], 3.6, 780 + i); });
    droppedTag(ctx, t, 10.7, 'training rounds →', x0 + cw - 100, y0 + 24, { size: 28 });
  }
  // ---------- region D: takeaway ----------
  const ND = 3840;
  function sceneD(ctx, t) {
    burnText(ctx, 'More examples', ND + 640, 300, '700 110px "Caveat"', AX(t, 13.2, 13.65), t);
    burnText(ctx, '→ better guesses', ND + 660, 440, '700 110px "Caveat"', AX(t, 13.6, 14.05), t);
    // a small cardioid winds on beneath, the same envelope trick as the still
    const N = 72, cx = ND + 640, cy = 590, R = 70, circ = []; for (let i = 0; i < N; i++) { const a = -Math.PI / 2 + (i / N) * 6.283; circ.push([cx + Math.cos(a) * R * 1.12, cy + Math.sin(a) * R * 1.12]); }
    const card = []; for (let i = 0; i < N; i++) card.push([circ[i], circ[(i * 2) % N]]);
    thread(ctx, wind(card, AX(t, 13.0, 14.2)), '#ffc93a', 0.8, 1.05);
    if (t > 12.85) circ.forEach((p, i) => { if (i % 2 === 0) nail(ctx, p[0], p[1], 2.4, 1200 + i); });
  }
  function sceneA(ctx, t) {
    burnText(ctx, 'How does', 600, 300, '700 130px "Caveat"', AX(t, 0.1, 0.8), t);
    burnText(ctx, 'AI learn?', 680, 450, '700 130px "Caveat"', AX(t, 0.75, 1.45), t);
    const N = 40, ring = [], pts = []; for (let i = 0; i < N; i++) { const a = (i / N) * 6.283; pts.push([640 + Math.cos(a) * 470, 360 + Math.sin(a) * 300]); }
    for (let i = 0; i < N; i++) ring.push([pts[i], pts[(i + 13) % N]]);
    thread(ctx, wind(ring, AX(t, 0.3, 2.2)), '#efe3c8', 0.55, 1.1);
    pts.forEach((p, i) => { if (t > 0.05 + i * 0.012) nail(ctx, p[0], p[1], 3, 1000 + i); });
  }
  function explainSA(ctx, W, H_, t) {
    // camera path: (world centre x, centre y, zoom)
    const keys = [[0, 640, 360, 1], [2.15, 640, 360, 1], [2.75, 1920, 360, 1], [6.0, 1920, 360, 1], [6.5, 2010, 340, 1.08], [10.35, 2010, 340, 1.08], [10.95, 3200, 360, 1], [12.85, 3200, 360, 1], [13.35, 4480, 360, 1], [99, 4480, 360, 1]];
    let k = 0; while (k < keys.length - 2 && t >= keys[k + 1][0]) k++;
    const a = keys[k], b = keys[k + 1], u = H.ease.inOut(AX(t, a[0], b[0]));
    const cx = a[1] + (b[1] - a[1]) * u, cy = a[2] + (b[2] - a[2]) * u, z = (a[3] + (b[3] - a[3]) * u) * (1 + 0.012 * Math.sin(t * 0.7));
    ctx.save(); ctx.translate(W / 2, H_ / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
    const vx0 = cx - W / 2 / z, vx1 = cx + W / 2 / z;
    woodWorld(ctx, vx0, vx1);
    if (vx0 < 1280) sceneA(ctx, t);
    if (vx1 > 1280 && vx0 < 2560) { sceneB(ctx, t); sceneLoop(ctx, t); }
    if (vx1 > 2560 && vx0 < 3840 && t > 10) sceneC(ctx, t);
    if (vx1 > 3840) sceneD(ctx, t);
    ctx.restore();
    if (t > 1.9) { const kk = H.ease.back(AX(t, 1.9, 2.2)); ktag(ctx, 'How does AI learn?', 30, 26 - (1 - kk) * 60, { size: 28, align: 'left', rot: -0.03 }); }
    H.vignette(ctx, W, H_, 0.42, '20,8,2');
    H.grain(ctx, W, H_, 0.035, 12 + Math.floor(t * 12));
  }

  registerStyle({
    id: 'string-art',
    name: 'Nail & Thread String Art',
    category: 'Generative & Type',
    description: 'Taut cotton threads strung between brass nails on a stained walnut board; every curve is an envelope of straight chords, with thread translucency, sheen and cast shadows, plus pyrography lettering.',
    motion: 'Nails are tapped in around the outline, then thread is wound chord by chord so the glowing envelopes emerge, the filament and base are laced, the rays snap taut, and the title is burned in with a travelling ember while the camera slowly pushes in.',
    fonts: ['700 92px "Caveat"', '400 26px "Caveat"', '700 26px "Caveat"'],
    duration: 7,
    frameT: 6.9,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'The network is literally strung on the board — nails are neurons, a weight is how many wraps of thread a connection has — and learning is re-winding; the camera travels along one long walnut board between scenes, labels are kraft tags nailed on, arrows are threads with nail barbs, counters are nail-and-thread 7-segment digits, and emphasis is a red thread wound round a ring of nails.',
    explainer(ctx, W, H_, t) { explainSA(ctx, W, H_, t); },
    // Sound: a workbench. Nails are tapped into walnut (small metal tink on a wood knock), thread winding is a soft
    // cotton rub with a low muffled pluck each time it snaps round a nail (throttled), kraft tags are nailed on with one
    // tap as they land, pyrography burns with a quiet sizzle and ember crackle, and the camera travel is a smooth low
    // slide along the board. The wrong guess is a slack, out-of-tune twang; the correction and the 97% ring are taut
    // consonant thrums. Timings mirror explainSA / sceneA..D above (AX windows, wind() is linear, droppedTag back-ease).
    explainerSound(k) {
      const D = 15, E = H.ease;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      const land = (t0) => when(t0, t0 + 0.28, E.back, 1); // droppedTag: back ease over 0.28 s
      // hammer tap on a nail: metal tink + wood knock
      const tap = (t, g, p) => { k.noise(t, { dur: 0.02, filter: 'bandpass', f: 2300, q: 5, gain: 0.22 * g, a: 0.001, pan: p }); k.tone(t, { f: 1150, dur: 0.05, gain: 0.05 * g, a: 0.001, pan: p }); k.tone(t, { f: [[0, 210], [0.05, 140]], dur: 0.08, gain: 0.22 * g, a: 0.001, pan: p }); };
      const tagOn = (t0, p, g = 1) => tap(land(t0), 0.75 * g, p);
      // thread snapping round a nail: low muffled pluck
      const pluck = (t, f, g, p) => { k.tone(t, { f, type: 'triangle', dur: 0.28, gain: 0.12 * g, a: 0.002, filter: 'lowpass', f2: [[0, 1400], [0.2, 400]], pan: p }); k.noise(t, { dur: 0.015, filter: 'bandpass', f: 1200, q: 1, gain: 0.06 * g, a: 0.001, pan: p }); };
      // winding over [t0,t1] with N chords (linear): cotton rub + a pluck per chord, at most `rate` per second
      const wind = (t0, t1, N, g, p, f = 196, rate = 8) => {
        const d = t1 - t0;
        k.noise(t0, { dur: d + 0.05, color: 'pink', filter: 'bandpass', f: 900, q: 0.9, gain: 0.07 * g, a: Math.min(0.1, d * 0.3), hold: d - 0.15, pan: p, minor: true });
        let last = -1;
        k.withMinor(() => { for (let i = 0; i < N; i++) { const t = t0 + ((i + 1) / N) * d; if (t - last < 1 / rate) continue; last = t; pluck(t, f * (1 + 0.06 * (i % 3)), 0.7 * g, p + ((i % 5) - 2) * 0.06); } });
      };
      // pyrography: soft sizzle with seeded ember crackle
      const burn = (t0, t1, p) => {
        const d = t1 - t0, r = H.rng(Math.round(t0 * 100));
        k.noise(t0, { dur: d + 0.1, color: 'pink', filter: 'bandpass', f: 2200, q: 0.6, gain: 0.05, a: 0.06, hold: d - 0.1, pan: p, minor: true });
        k.withMinor(() => { for (let t = t0 + 0.03; t < t1; t += 0.05 + r() * 0.07) k.noise(t, { dur: 0.008, filter: 'bandpass', f: 1400 + r() * 900, q: 1, gain: 0.07 + r() * 0.08, a: 0.001, pan: p + (r() - 0.5) * 0.3 }); });
      };
      // camera travels along the board
      const travel = (t0, t1) => { const d = t1 - t0; k.noise(t0, { dur: d, color: 'brown', filter: 'lowpass', f: [[0, 250], [d * 0.5, 520], [d, 220]], gain: 0.16, a: d * 0.45 }); };
      const thrum = (t, notes, g) => notes.forEach((n, i) => k.tone(t + i * 0.035, { f: n, type: 'triangle', dur: 1.1, gain: 0.07 * g, a: 0.003, filter: 'lowpass', f2: [[0, 2200], [0.8, 600]], verb: 0.2, pan: (i - (notes.length - 1) / 2) * 0.2 }));

      k.bed('room', 0, D, { gain: 0.35 });

      // ---- A: nails tapped round the ellipse (0.05 + i*0.012), title burned in, ring of thread wound 0.3-2.2
      k.withMinor(() => { for (let i = 0; i < 40; i += 6) { const a = (i / 40) * 6.283; tap(0.05 + i * 0.012, 0.6, Math.cos(a) * 0.6); } });
      burn(0.1, 0.8, -0.15);
      burn(0.75, 1.45, 0.1);
      wind(0.3, 2.2, 40, 0.8, 0, 175, 5);
      tagOn(1.9, -0.7); // header tag (lands 1.9 + 0.3*0.37)

      // ---- B: travel to the network; it winds 2.6-4.2 (second layer to 4.2), tags, the 7-segment counter
      travel(2.15, 2.75);
      wind(2.6, 4.2, 45, 0.7, 0.2, 220, 4);
      tagOn(2.9, 0.15); tagOn(3.0, -0.45);
      // counter shows floor(p*30)/30 steps of p = AX(2.75, 5.0) through inOut: each step re-strings the digits
      { let prev = 0, last = -1; for (let t = 2.76; t <= 5.0; t += 0.002) { const s = Math.floor(AX(t, 2.75, 5.0) * 30); if (s !== prev && s < 30 && t - last >= 1 / 9) { k.withMinor(() => pluck(t, 330 + s * 4, 0.55, -0.55)); last = t; } prev = s; } }
      tap(5.0, 1.3, -0.5); thrum(5.0, ['G2', 'D3', 'G3'], 0.9); // 1,000,000 strung

      // ---- loop: push in, tag, guess path winds, red ring of nails, error back, rewind, cat ✓
      travel(6.0, 6.5);
      tagOn(6.2, -0.45);
      wind(6.9, 7.3, 2, 1.1, 0.2, 247);
      tagOn(7.3, 0.6, 0.8);
      k.withMinor(() => { for (let i = 0; i < 14; i += 3) tap(7.85 + i * 0.02, 0.5, 0.55); }); // ring nails go in
      wind(7.85, 8.2, 28, 0.6, 0.55, 165, 9);
      tagOn(8.05, 0.55, 1.1);
      // check: wrong — a slack, out-of-tune twang on the dog thread
      [98, 139].forEach((f, i) => k.tone(8.16, { f: [[0, f], [0.35, f * 0.94]], type: 'sawtooth', dur: 0.5, gain: 0.08, a: 0.003, filter: 'lowpass', f2: [[0, 1300], [0.4, 300]], pan: 0.5 - i * 0.1 }));
      k.play('thud', 8.16, { f: 110, gain: 0.5, pan: 0.5 });
      // red error thread runs back dog -> hidden -> input (8.35-8.85): a rub falling right to left
      k.noise(8.35, { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 1300], [0.5, 600]], q: 1.2, gain: 0.1, a: 0.1, pan: 0.2 });
      tagOn(8.4, 0.35, 0.8);
      tagOn(8.95, 0, 0.8);
      // adjust 8.95-9.45: threads unwound from the dog path, wraps added to the cat path
      k.noise(8.95, { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.5, 1100]], q: 0.9, gain: 0.09, a: 0.15, minor: true });
      k.withMinor(() => [0, 1, 2, 3].forEach((i) => pluck(9.0 + i * 0.12, [196, 220, 247, 262][i], 0.8, -0.1)));
      wind(9.4, 9.8, 2, 1.1, 0.1, 262);
      tagOn(9.85, 0.6, 1.1); thrum(land(9.85), ['C3', 'G3', 'E4'], 1.1); // cat ✓

      // ---- C: travel, tags, chart nails + counter, red ring round 97%
      travel(10.35, 10.95);
      tagOn(10.6, -0.2); tagOn(10.7, 0.6, 0.6);
      k.noise(10.95, { dur: 1.4, color: 'pink', filter: 'bandpass', f: 900, q: 0.9, gain: 0.06, a: 0.1, hold: 1.1, pan: 0.4, minor: true }); // chart thread rubs on
      k.withMinor(() => { for (let i = 1; i < 10; i++) tap(10.95 + (i / 9) * 1.35, 0.45, 0.1 + i * 0.06); }); // a nail at each point
      { let prev = 0, last = -1; for (let t = 10.96; t <= 12.3; t += 0.002) { const s = Math.floor(H.ease.inOut(AX(t, 10.95, 12.3)) * 18); if (s !== prev && t - last >= 1 / 9) { k.withMinor(() => pluck(t, 260 + s * 9, 0.5, -0.45)); last = t; } prev = s; } }
      tap(12.3, 1.5, -0.4);
      k.play('impact', 12.3, { gain: 1.1, pan: -0.3 });
      thrum(12.32, ['C3', 'G3', 'C4', 'E4'], 1.6); // the 97% hit
      wind(12.3, 12.7, 36, 0.8, -0.3, 196, 9); // red thread wound round the ring

      // ---- D: travel, cardioid winds 13.0-14.2, burn the takeaway, resolve
      travel(12.85, 13.35);
      wind(13.0, 14.2, 72, 0.5, 0, 175, 5);
      burn(13.2, 13.65, -0.1);
      burn(13.6, 14.05, 0.1);
      thrum(14.05, ['F2', 'C3', 'A3', 'C4'], 0.8); thrum(14.3, ['C3', 'G3', 'C4', 'E4'], 1.1);
    },
    draw(ctx, W, H_, t) {
      if (!WOOD) { WOOD = H.layer(W, H_); woodBoard(WOOD.getContext('2d'), W, H_, 0); }
      // slow camera push across the whole shot
      const push = 1 + 0.03 * H.ease.inOut(H.clamp(t / 7));
      ctx.save();
      ctx.translate(560, 340); ctx.scale(push, push); ctx.translate(-560, -340);
      ctx.drawImage(WOOD, -20, -20, W + 40, H_ + 40);
      // nail pop-in helper: tapped in over ~3 frames with a tiny bounce
      const nailAt = (x, y, r, seed, t0) => {
        if (t < t0) return;
        const k = H.clamp((t - t0) / 0.1);
        nail(ctx, x, y, r * (1 + 0.35 * (1 - k) * (1 - k)), seed);
      };

      const cx = 470, cy = 300, R = 172;
      const N = 120;
      // circle nails, leaving a gap at the bottom where the neck joins
      const gapA = 0.36; // radians each side of straight down
      const circ = [];
      for (let i = 0; i < N; i++) {
        const a = -Math.PI / 2 + (i / N) * TAU;  // i=0 at top -> cardioid cusp sits low, lobe fills the glass
        circ.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R, a]);
      }
      const isGap = (p) => { let da = Math.abs(((p[2] - Math.PI / 2) % TAU + TAU) % TAU); da = Math.min(da, TAU - da); return da < gapA; };

      // progress of winding (animatable); at frameT everything is wound

      // 1) glass glow: fixed-skip chords -> bright annulus whose inner edge is a circle envelope
      const halo = [], halo2 = [];
      for (let i = 0; i < N; i++) {
        const a = circ[i], b = circ[(i + 34) % N], c = circ[(i + 47) % N];
        if (!isGap(a) && !isGap(b)) halo.push([a, b]);
        if (!isGap(a) && !isGap(c) && i % 2 === 0) halo2.push([a, c]);
      }
      thread(ctx, wind(halo2, ph(t, 2.3, 3.4)), '#e8702e', 0.6, 1.0);
      thread(ctx, wind(halo, ph(t, 1.3, 2.7)), '#ffc93a', 0.82, 1.15);

      // 2) cardioid (times-two table) in cream: its cusp sits on the filament
      const card = [];
      for (let i = 0; i < N; i += 1) {
        const a = circ[i], c = circ[(i * 2) % N];
        if (!isGap(a) && !isGap(c)) card.push([a, c]);
      }
      thread(ctx, wind(card, ph(t, 2.6, 3.7)), '#f6ead2', 0.5, 0.9);

      // filament: zig-zag between two short rows of nails, wound many times
      const fil = [], filN = [];
      const fy = cy + 30;
      for (let k = 0; k < 6; k++) { filN.push([cx - 50 + k * 20, fy - 14], [cx - 40 + k * 20, fy + 14]); }
      for (let k = 0; k < filN.length - 1; k++) fil.push([filN[k], filN[k + 1]]);
      for (let k = 0; k < filN.length - 2; k += 2) fil.push([filN[k], filN[k + 2]]);
      // filament supports down to the neck
      const sup = [[filN[0], [cx - 30, cy + R * 0.9]], [filN[filN.length - 1], [cx + 30, cy + R * 0.9]]];
      thread(ctx, wind(sup, ph(t, 3.6, 3.8)), '#c9ccd2', 0.8, 1.0);
      thread(ctx, wind(fil, ph(t, 3.7, 4.2)), '#ff8c2a', 0.95, 1.3);
      thread(ctx, wind(fil, ph(t, 4.0, 4.4)), '#ffe08a', 0.6, 0.8);

      // 3) neck + screw base: nails in two columns, zig-zag cross-hatched silver thread
      const baseTop = cy + Math.cos(gapA) * R + 4, baseL = cx - Math.sin(gapA) * R, baseR = cx + Math.sin(gapA) * R;
      const neckBot = baseTop + 46;
      const nL = [], nR = [];
      const rows = 9;
      for (let k = 0; k <= rows; k++) {
        const y = baseTop + (k / rows) * 104;
        const narrow = k < 3 ? (k / 3) * 14 : 14 + (k >= rows - 1 ? (k - rows + 2) * 16 : 0);
        nL.push([baseL + narrow, y]); nR.push([baseR - narrow, y]);
      }
      const base = [];
      for (let k = 0; k < rows; k++) { base.push([nL[k], nR[k + 1]]); base.push([nR[k], nL[k + 1]]); base.push([nL[k], nR[k]]); }
      // threads also tie the neck into the bulb rim
      const left0 = circ.find((p) => !isGap(p) && p[0] < cx && p[1] > cy + R * 0.85) || circ[6];
      base.push([nL[0], circ[Math.round(N * gapA / TAU) + 1]]); base.push([nR[0], circ[N - Math.round(N * gapA / TAU) - 1]]);
      thread(ctx, wind(base, ph(t, 3.9, 4.7)), '#d4d7dc', 0.85, 1.05);
      // tip
      const tip = [cx, nL[rows][1] + 22];
      const tipSeg = [[nL[rows], tip], [nR[rows], tip], [nL[rows - 1], tip], [nR[rows - 1], tip]];
      thread(ctx, wind(tipSeg, ph(t, 4.6, 4.8)), '#9aa0a8', 0.75, 1.05);

      // 4) rays: each ray is several wraps between two nails (thicker, slightly fanned)
      const rays = [];
      const rayNails = [];
      const rayAngles = [-150, -118, -90, -62, -30, 0, 180].map((d) => (d * Math.PI) / 180);
      rayAngles.forEach((a, k) => {
        const r0 = R + 30, r1 = R + 30 + (k === 2 ? 70 : 56);
        const p0 = [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], p1 = [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1];
        const px = -Math.sin(a) * 4, py = Math.cos(a) * 4;
        const q0 = [p0[0] - px, p0[1] - py], q1 = [p0[0] + px, p0[1] + py], q2 = [p1[0] - px * 1.6, p1[1] - py * 1.6], q3 = [p1[0] + px * 1.6, p1[1] + py * 1.6];
        rayNails.push(q0, q1, q2, q3);
        const len = H.ease.out(ph(t, 4.5 + k * 0.07, 4.75 + k * 0.07));
        if (len > 0) {
          const L = (a0, b0) => [a0, [a0[0] + (b0[0] - a0[0]) * len, a0[1] + (b0[1] - a0[1]) * len]];
          rays.push(L(q0, q2), L(q1, q3), L(q0, q3), L(q1, q2), L(q0, q2), L(q1, q3));
        }
      });
      thread(ctx, rays, '#ffc93a', 0.85, 1.15);

      // 5) the bulb lights up: warm bloom round the filament + a soft glow off the gold and filament threads
      const glowK = 0.35 * ph(t, 1.3, 2.7) + 0.65 * ph(t, 3.7, 4.4);
      if (glowK > 0) {
        const GS = 440, gx0 = cx - GS / 2, gy0 = cy - GS / 2 + 10, done = t >= 4.4;
        let gb = done ? BURNC.heroGlow : null;
        if (!gb) {
          const gl = H.layer(GS, GS), gc = gl.getContext('2d');
          gc.translate(-gx0, -gy0); gc.lineCap = 'round';
          const strokeSet = (segs, col, w) => { if (!segs.length) return; gc.strokeStyle = col; gc.lineWidth = w; gc.beginPath(); for (const [a, b] of segs) { gc.moveTo(a[0], a[1]); gc.lineTo(b[0], b[1]); } gc.stroke(); };
          strokeSet(wind(halo, ph(t, 1.3, 2.7)), '#ffc93a', 2.2);
          strokeSet(wind(fil, ph(t, 3.7, 4.2)), '#ffb050', 4);
          gb = blurred(gl, 4); if (done) BURNC.heroGlow = gb;
        }
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        const g = ctx.createRadialGradient(cx, fy, 0, cx, fy, 270);
        g.addColorStop(0, `rgba(255,205,120,${0.34 * glowK})`); g.addColorStop(0.4, `rgba(255,170,80,${0.15 * glowK})`); g.addColorStop(1, 'rgba(255,150,60,0)');
        ctx.fillStyle = g; ctx.fillRect(cx - 280, fy - 280, 560, 560);
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 * Math.min(1, glowK * 1.4);
        ctx.drawImage(gb, gx0 - 8, gy0 - 8); ctx.restore();
      }

      // nails on top of threads (threads wrap around shafts under the heads)
      let s = 1;
      circ.forEach((p, i) => { if (!isGap(p)) nailAt(p[0], p[1], 3.3, s++, 0.05 + (i / N) * 0.85); });
      nL.forEach((p, k) => nailAt(p[0], p[1], 3.3, s++, 0.9 + k * 0.025));
      nR.forEach((p, k) => nailAt(p[0], p[1], 3.3, s++, 0.92 + k * 0.025));
      nailAt(tip[0], tip[1], 3.3, s++, 1.18);
      filN.forEach((p, k) => nailAt(p[0], p[1], 2.8, s++, 1.0 + k * 0.02));
      nailAt(cx - 30, cy + R * 0.9, 2.8, s++, 1.0); nailAt(cx + 30, cy + R * 0.9, 2.8, s++, 1.02);
      rayNails.forEach((p, k) => nailAt(p[0], p[1], 3.0, s++, 1.05 + k * 0.012));

      // ---------- pyrography lettering ----------
      const TX = 1000, TY = 318;
      const burn = H.layer(W, H_), bc = burn.getContext('2d');
      bc.textAlign = 'center'; bc.textBaseline = 'alphabetic';
      bc.font = '700 92px "Caveat"';
      bc.fillStyle = '#000';
      bc.fillText('Bright', TX - 20, TY);
      bc.fillText('Ideas', TX + 30, TY + 92);
      // burn-in: the pen travels left->right over each line (line 1 then line 2)
      const b1 = ph(t, 4.9, 5.5), b2 = ph(t, 5.45, 6.0);
      const reveal = H.layer(W, H_), rv = reveal.getContext('2d');
      const x0 = TX - 130, x1 = TX + 82, y0 = TX - 72, y1 = TX + 140;
      if (b1 > 0) rv.fillRect(0, TY - 110, x0 + (x1 - x0) * b1, 132);
      if (b2 > 0) rv.fillRect(0, TY + 22, y0 + (y1 - y0) * b2, 110);
      bc.globalCompositeOperation = 'destination-in'; bc.drawImage(reveal, 0, 0); bc.globalCompositeOperation = 'source-over';
      // toasted rim: the walnut round the burn is singed paler and golden (same treatment as the explainer)
      if (b1 > 0) {
        const rx0 = TX - 300, ry0 = TY - 150, rw = 620, rh = 330, done = b2 >= 1;
        let tb = done ? BURNC.heroToast : null;
        if (!tb) { const tl = H.layer(rw, rh); tl.getContext('2d').drawImage(burn, rx0, ry0, rw, rh, 0, 0, rw, rh); tb = blurred(tl, 12, 'rgb(214,150,80)'); if (done) BURNC.heroToast = tb; }
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.5; ctx.drawImage(tb, rx0 - 24, ry0 - 24); ctx.restore();
      }
      // scorch halo
      ctx.save();
      ctx.filter = 'blur(4px)'; ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(burn, 0, 0);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      // burnt core: dark umber, slightly uneven
      const core = H.layer(W, H_), cc = core.getContext('2d');
      cc.drawImage(burn, 0, 0);
      cc.globalCompositeOperation = 'source-in';
      const cg = cc.createLinearGradient(TX - 200, 0, TX + 200, 0);
      cg.addColorStop(0, '#1d0d05'); cg.addColorStop(0.5, '#2b1408'); cg.addColorStop(1, '#170903');
      cc.fillStyle = cg; cc.fillRect(0, 0, W, H_);
      // uneven pen pressure: lighter scorched patches inside strokes
      const bn = H.makeNoise(5);
      cc.globalCompositeOperation = 'source-atop';
      for (let y = TY - 90; y < TY + 30 + 92; y += 4) for (let x = TX - 220; x < TX + 220; x += 4) {
        const v = bn.n2(x * 0.03, y * 0.03);
        if (v > 0.05) { cc.fillStyle = `rgba(120,62,24,${Math.min(0.6, v * 1.2)})`; cc.fillRect(x, y, 4, 4); }
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.92;
      ctx.drawImage(core, 0, 0);
      ctx.restore();
      // ember at the pen tip while burning, with a wisp of smoke
      const ember = (bx, by, k) => {
        if (k <= 0 || k >= 1) return;
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, 26);
        g.addColorStop(0, 'rgba(255,190,90,0.9)'); g.addColorStop(0.3, 'rgba(255,110,30,0.45)'); g.addColorStop(1, 'rgba(255,80,20,0)');
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(bx - 30, by - 30, 60, 60); ctx.restore();
        const sm = ctx.createRadialGradient(bx + 6, by - 40, 0, bx + 6, by - 40, 36);
        sm.addColorStop(0, 'rgba(220,210,200,0.12)'); sm.addColorStop(1, 'rgba(220,210,200,0)');
        ctx.fillStyle = sm; ctx.fillRect(bx - 40, by - 90, 90, 90);
      };
      ember(x0 + (x1 - x0) * b1, TY - 30 + Math.sin(t * 40) * 14, b1);
      ember(y0 + (y1 - y0) * b2, TY + 62 + Math.sin(t * 40) * 14, b2);
      // small burnt underline flourish + caption
      const fl = ph(t, 5.95, 6.25);
      if (fl > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(28,12,4,0.85)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.rect(TX - 130, TY + 100, 290 * fl, 40); ctx.clip();
        ctx.beginPath(); ctx.moveTo(TX - 120, TY + 122); ctx.bezierCurveTo(TX - 40, TY + 112, TX + 60, TY + 132, TX + 150, TY + 116); ctx.stroke();
        ctx.restore();
      }
      if (t >= 6.2) {
        ctx.save(); ctx.font = '400 26px "Caveat"'; ctx.fillStyle = 'rgba(28,12,4,0.8)'; ctx.textAlign = 'center';
        ctx.fillText('~ series no. 7 ~', TX + 10, TY + 160); ctx.restore();
      }
      ctx.restore(); // camera

      // light falloff + fine film grain
      H.vignette(ctx, W, H_, 0.42, '20,8,2');
      H.grain(ctx, W, H_, 0.035, 12 + Math.floor(t * 12));
    },
  });
}
