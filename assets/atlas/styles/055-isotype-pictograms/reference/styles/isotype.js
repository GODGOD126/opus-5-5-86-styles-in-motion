{
  // ISOTYPE (Neurath / Arntz, Vienna Method) pictorial statistics.
  const PAPER = '#EFE7D4', INK = '#26231F', BLUE = '#294C63', RED = '#C2432C', OCHRE = '#D49A33';

  // Arntz-style standing figure in a 26 x 44 box, origin top-left
  function person(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath();
    ctx.arc(13, 5.2, 5.2, 0, Math.PI * 2);
    // torso with arms (one silhouette), rounded shoulders
    ctx.moveTo(4.5, 12.5);
    ctx.quadraticCurveTo(13, 10.6, 21.5, 12.5);
    ctx.quadraticCurveTo(25.5, 13.4, 25.5, 17.5);
    ctx.lineTo(25.5, 28.5); ctx.lineTo(22.5, 28.5); ctx.lineTo(22.2, 19.5);
    ctx.lineTo(21.0, 19.5); ctx.lineTo(20.8, 28.5);
    // legs
    ctx.lineTo(20.8, 44); ctx.lineTo(14.2, 44); ctx.lineTo(13.6, 30.5); ctx.lineTo(12.4, 30.5); ctx.lineTo(11.8, 44); ctx.lineTo(5.2, 44);
    ctx.lineTo(5.2, 28.5); ctx.lineTo(5.0, 19.5); ctx.lineTo(3.8, 19.5); ctx.lineTo(3.5, 28.5); ctx.lineTo(0.5, 28.5);
    ctx.lineTo(0.5, 17.5); ctx.quadraticCurveTo(0.5, 13.4, 4.5, 12.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // compute unit: Arntz-style computer (monitor + keyboard) in a 32 x 44 box
  function chip(ctx, x, y, s, bg) {
    const ink = ctx.fillStyle;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    // monitor body
    ctx.beginPath();
    ctx.moveTo(2, 4); ctx.lineTo(30, 4); ctx.quadraticCurveTo(32, 4, 32, 6); ctx.lineTo(32, 27);
    ctx.quadraticCurveTo(32, 29, 30, 29); ctx.lineTo(2, 29); ctx.quadraticCurveTo(0, 29, 0, 27); ctx.lineTo(0, 6);
    ctx.quadraticCurveTo(0, 4, 2, 4); ctx.closePath(); ctx.fill();
    // neck + foot
    ctx.fillRect(12.5, 29, 7, 5); ctx.fillRect(8, 33, 16, 2.5);
    // keyboard slab
    ctx.beginPath(); ctx.moveTo(3, 44); ctx.lineTo(6, 38.5); ctx.lineTo(26, 38.5); ctx.lineTo(29, 44); ctx.closePath(); ctx.fill();
    // screen (negative space) with a single bright prompt line
    ctx.fillStyle = bg; ctx.fillRect(4, 8, 24, 17);
    ctx.fillStyle = ink; ctx.fillRect(7, 11, 10, 2.6); ctx.fillRect(7, 16, 14, 2.6); ctx.fillRect(7, 21, 6, 2.6);
    ctx.restore();
  }

  // data-centre (factory-like silhouette) for the key
  function factory(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 44); ctx.lineTo(0, 22); ctx.lineTo(9, 16); ctx.lineTo(9, 22); ctx.lineTo(18, 16); ctx.lineTo(18, 22);
    ctx.lineTo(27, 16); ctx.lineTo(27, 6); ctx.lineTo(33, 6); ctx.lineTo(33, 44); ctx.closePath();
    ctx.fill(); ctx.restore();
  }

  // ---- explainer pictograms (Arntz-style flat silhouettes) ----
  function catPic(ctx, x, y, s, bg) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(14, 12, 7.5, 0, 7);
    ctx.moveTo(7.2, 9); ctx.lineTo(8, -0.5); ctx.lineTo(13, 5); ctx.closePath();
    ctx.moveTo(20.8, 9); ctx.lineTo(20, -0.5); ctx.lineTo(15, 5); ctx.closePath();
    ctx.moveTo(8.5, 19); ctx.bezierCurveTo(1, 28, 2, 44, 5, 44); ctx.lineTo(23, 44); ctx.bezierCurveTo(26, 44, 27, 28, 19.5, 19); ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath(); ctx.moveTo(22, 42); ctx.quadraticCurveTo(32, 40, 29, 28); ctx.stroke();
    ctx.fillStyle = bg; ctx.fillRect(13.3, 31, 1.4, 13);
    ctx.beginPath(); ctx.arc(11, 11.5, 1.3, 0, 7); ctx.arc(17, 11.5, 1.3, 0, 7); ctx.fill();
    ctx.restore();
  }
  function dogPic(ctx, x, y, s, bg) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(7, 6); ctx.quadraticCurveTo(7, 1, 13, 1); ctx.lineTo(19, 1); ctx.quadraticCurveTo(23, 1, 23, 6); ctx.lineTo(23, 9); ctx.lineTo(30, 10); ctx.quadraticCurveTo(32, 14, 29, 17); ctx.lineTo(21, 18);
    ctx.bezierCurveTo(27, 26, 27, 44, 24, 44); ctx.lineTo(5, 44); ctx.bezierCurveTo(2, 44, 1, 28, 8, 18); ctx.quadraticCurveTo(6, 12, 7, 6); ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath(); ctx.moveTo(5, 40); ctx.quadraticCurveTo(-3, 36, -1, 27); ctx.stroke();
    ctx.fillStyle = bg; ctx.fillRect(14.3, 31, 1.4, 13);
    ctx.beginPath(); ctx.arc(18, 7.5, 1.4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(8, 4); ctx.quadraticCurveTo(4, 9, 7, 16); ctx.lineTo(9.5, 15); ctx.quadraticCurveTo(8.5, 9, 10.5, 5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // flat ISOTYPE arrow (shaft + head), optionally curved via a quadratic control point
  function flatArrow(ctx, x0, y0, x1, y1, w, p = 1, cx = null, cy = null) {
    if (p <= 0) return;
    const pts = [];
    const n = 30;
    for (let k = 0; k <= n * p; k++) {
      const u = k / n;
      if (cx === null) pts.push([H.lerp(x0, x1, u), H.lerp(y0, y1, u)]);
      else { const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; pts.push([a * x0 + b * cx + c * x1, a * y0 + b * cy + c * y1]); }
    }
    if (pts.length < 2) return;
    const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2];
    const an = Math.atan2(ey - py, ex - px);
    ctx.save(); ctx.lineWidth = w; ctx.lineCap = 'butt'; ctx.lineJoin = 'round'; ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath(); pts.slice(0, -1).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineTo(ex - Math.cos(an) * w * 0.9, ey - Math.sin(an) * w * 0.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex + Math.cos(an) * w * 0.9, ey + Math.sin(an) * w * 0.9);
    ctx.lineTo(ex - Math.cos(an) * w * 0.9 + Math.cos(an + Math.PI / 2) * w * 1.25, ey - Math.sin(an) * w * 0.9 + Math.sin(an + Math.PI / 2) * w * 1.25);
    ctx.lineTo(ex - Math.cos(an) * w * 0.9 - Math.cos(an + Math.PI / 2) * w * 1.25, ey - Math.sin(an) * w * 0.9 - Math.sin(an + Math.PI / 2) * w * 1.25);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function checkPic(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineWidth = 7; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.strokeStyle = ctx.fillStyle; ctx.beginPath(); ctx.moveTo(2, 22); ctx.lineTo(11, 31); ctx.lineTo(30, 6); ctx.stroke(); ctx.restore(); }
  function crossPic(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineWidth = 7; ctx.lineCap = 'butt'; ctx.strokeStyle = ctx.fillStyle; ctx.beginPath(); ctx.moveTo(3, 3); ctx.lineTo(29, 29); ctx.moveTo(29, 3); ctx.lineTo(3, 29); ctx.stroke(); ctx.restore(); }

  const ROWS = [
    { yr: '2000', p: 4.5, c: 0.25 },
    { yr: '2005', p: 5.25, c: 0.5 },
    { yr: '2010', p: 6.5, c: 1.5 },
    { yr: '2015', p: 7.75, c: 3.5 },
    { yr: '2020', p: 9.25, c: 7.25 },
    { yr: '2025', p: 10.5, c: 13.5 },
  ];

  // ---- litho finish, cached once per size ----
  // paper mottle: one fbm per 4x4 px, drawn upscaled with smoothing (no blocky squares, no per-frame noise)
  const MOTTLE = {};
  function mottle(W, H_, oct) {
    const key = W + 'x' + H_ + 'x' + oct;
    if (MOTTLE[key]) return MOTTLE[key];
    const w = Math.ceil(W / 4), h = Math.ceil(H_ / 4), L = H.layer(w, h), c = L.getContext('2d'), id = c.createImageData(w, h);
    const nz = H.makeNoise(4);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const v = nz.fbm2((i * 4 + 2) * 0.006, (j * 4 + 2) * 0.006, oct), o = (j * w + i) * 4;
      id.data[o] = 150; id.data[o + 1] = 120; id.data[o + 2] = 80; id.data[o + 3] = v > 0.05 ? Math.min(255, (v - 0.05) * 0.06 * 255) : 0;
    }
    c.putImageData(id, 0, 0);
    return (MOTTLE[key] = L);
  }
  function lithoFinish(ctx, W, H_, oct) {
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(mottle(W, H_, oct), 0, 0, W, H_); ctx.restore();
  }
  // ink film wear: where the litho ink did not fully take. Low-frequency density drift + fine pinholes and a few
  // dry streaks, removed from the ink layer with destination-out so paper shows through the flat fills.
  const WEAR = {};
  function wear(W, H_) {
    const key = W + 'x' + H_;
    if (WEAR[key]) return WEAR[key];
    const L = H.layer(W, H_), c = L.getContext('2d');
    const w = Math.ceil(W / 3), h = Math.ceil(H_ / 3), S = H.layer(w, h), sc = S.getContext('2d'), id = sc.createImageData(w, h);
    const nz = H.makeNoise(23), rf = H.rng(5);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const v = nz.fbm2(i * 0.05, j * 0.05, 3), f = nz.n2(i * 0.6 + 40, j * 0.6), o = (j * w + i) * 4;
      // coarse density drift + an 'orange-peel' fine stipple where the ink film is thin
      const a = Math.max(0, v * 0.5 + 0.5 - 0.4) * 0.34 + Math.max(0, f) * 0.07 + rf() * 0.035;
      id.data[o + 3] = Math.min(255, a * 255);
    }
    sc.putImageData(id, 0, 0);
    c.imageSmoothingEnabled = true; c.drawImage(S, 0, 0, W, H_);
    const r = H.rng(77);
    c.fillStyle = '#000';
    for (let n = 0; n < W * H_ * 0.0016; n++) {   // pinholes
      const x = r() * W, y = r() * H_, rr = 0.5 + r() * r() * 1.4;
      c.globalAlpha = 0.25 + r() * 0.55; c.beginPath(); c.arc(x, y, rr, 0, 7); c.fill();
    }
    c.globalAlpha = 0.09;
    for (let n = 0; n < 140; n++) {               // faint horizontal roller streaks
      const x = r() * W, y = r() * H_; c.fillRect(x, y, 20 + r() * 90, 0.8 + r() * 0.8);
    }
    c.globalAlpha = 1;
    return (WEAR[key] = L);
  }
  const INKL = {};
  function inkLayer(W, H_) {
    const key = W + 'x' + H_;
    const L = INKL[key] || (INKL[key] = H.layer(W, H_)), c = L.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H_);
    return L;
  }
  function printInk(out, L, W, H_) {
    const c = L.getContext('2d');
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'destination-out'; c.drawImage(wear(W, H_), 0, 0); c.restore();
    out.save(); out.setTransform(1, 0, 0, 1, 0, 0); out.drawImage(L, 0, 0); out.restore();
  }

  function spaced(ctx, str, x, y, track, align) {
    let w = 0; for (const ch of str) w += ctx.measureText(ch).width + track; w -= track;
    let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.textAlign = 'left';
    for (const ch of str) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + track; }
  }

  registerStyle({
    id: 'isotype',
    name: 'ISOTYPE Pictograms',
    category: 'Data & Information',
    description: 'Vienna Method pictorial statistics: rows of identical flat pictograms where each symbol is a fixed quantity, partial symbols for remainders, three muted litho inks on a strict grid with geometric sans lettering.',
    motion: 'Title and key set first, the year column drops in, then symbols are stamped out row by row from the centre in stepped, rubber-stamp timing, the 2025 row of machines racing ahead; the litho paper breathes in the hold.',
    fonts: ['700 40px "Space Grotesk"', '400 18px "Space Grotesk"', '700 26px "Space Grotesk"', '400 14px "Space Grotesk"', '700 14px "Space Grotesk"', '700 96px "Space Grotesk"', '700 32px "Space Grotesk"', '400 24px "Space Grotesk"'],
    duration: 5.5,
    frameT: 5.4,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      H.paper(ctx, W, H_, PAPER, 11, 0.02);
      const OUT = ctx, IL = inkLayer(W, H_); ctx = IL.getContext('2d');

      const CX = 640, colHalf = 56, pitch = 36, rowH = 66, top = 214;
      const s = 1.0;
      // stepped clock: the stamping runs "on twos" at 12 fps like a mechanical counter
      const ts = Math.floor(t * 12) / 12;
      const seg = (a, b) => H.clamp((ts - a) / (b - a));
      // per-icon stamp: invisible -> oversized impression (one step) -> settled
      const stampAt = (start) => (ts < start ? 0 : ts < start + 1 / 12 ? 0.5 : 1);

      // ---- title block ----
      ctx.fillStyle = INK; ctx.textBaseline = 'alphabetic';
      ctx.globalAlpha = seg(0, 0.34);
      ctx.font = '700 40px "Space Grotesk"'; spaced(ctx, 'PEOPLE AND MACHINES', CX, 86 - (1 - seg(0, 0.34)) * 8, 5, 'center');
      ctx.globalAlpha = seg(0.25, 0.6);
      ctx.font = '400 18px "Space Grotesk"';
      spaced(ctx, 'Workers and machines for AI in the computing industry, 2000–2025', CX, 120, 0.6, 'center');
      ctx.globalAlpha = 1;
      const rp = H.ease.out(seg(0.3, 0.75));
      ctx.fillStyle = INK; ctx.fillRect(CX - 300 * rp, 140, 600 * rp, 2);

      // ---- column heads with keys ----
      ctx.globalAlpha = seg(0.5, 0.84);
      ctx.font = '700 14px "Space Grotesk"';
      ctx.fillStyle = BLUE; person(ctx, CX - colHalf - 30, 156, 0.62);
      ctx.fillStyle = INK; spaced(ctx, 'WORKERS', CX - colHalf - 40, 176, 2.5, 'right');
      ctx.font = '400 14px "Space Grotesk"'; spaced(ctx, 'each figure = 1 million', CX - colHalf - 40, 194, 0.4, 'right');
      ctx.fillStyle = RED; chip(ctx, CX + colHalf + 6, 156, 0.62, PAPER);
      ctx.fillStyle = INK; ctx.font = '700 14px "Space Grotesk"'; spaced(ctx, 'AI COMPUTERS', CX + colHalf + 40, 176, 2.5, 'left');
      ctx.font = '400 14px "Space Grotesk"'; spaced(ctx, 'each machine = 100,000', CX + colHalf + 40, 194, 0.4, 'left');
      ctx.globalAlpha = 1;

      // ---- centre year column drops in ----
      const colP = H.ease.out(seg(0.6, 1.1));
      ctx.fillStyle = OCHRE;
      ctx.fillRect(CX - colHalf + 8, top - 6, (colHalf - 8) * 2, (ROWS.length * rowH - 2) * colP);

      // row timing: each row stamps outward from the column, rows in sequence
      const DT = 0.042;
      let rowStart = 1.15;
      ROWS.forEach((row, ri) => {
        const y = top + ri * rowH;
        const t0 = rowStart; rowStart += Math.max(Math.ceil(row.p), Math.ceil(row.c)) * DT + 0.05;
        // year
        if (ts >= 0.75 + ri * 0.06) { ctx.fillStyle = INK; ctx.font = '700 26px "Space Grotesk"'; spaced(ctx, row.yr, CX, y + 36, 1.5, 'center'); }
        // row hairline
        const hp = seg(t0 - 0.15, t0 + 0.35);
        if (ri && hp > 0) { ctx.fillStyle = 'rgba(38,35,31,0.18)'; const lw = (CX - colHalf - 70) * hp; ctx.fillRect(CX - colHalf - lw, y - 4, lw, 1); ctx.fillRect(CX + colHalf, y - 4, (W - 70 - CX - colHalf) * hp, 1); }

        // workers, growing leftward from the column; partial symbol on the outer end shows its inner part
        const pn = Math.ceil(row.p);
        for (let k = 0; k < pn; k++) {
          const frac = Math.min(1, row.p - k), a = stampAt(t0 + k * DT);
          if (a <= 0) continue;
          const x = CX - colHalf - 14 - (k + 1) * pitch + (pitch - 26 * s) / 2;
          ctx.save();
          if (frac < 1) { ctx.beginPath(); ctx.rect(x + 26 * s * (1 - frac), y, 26 * s * frac + 1, 60); ctx.clip(); }
          ctx.fillStyle = BLUE;
          if (a < 1) { ctx.translate(x + 13, y + 28); ctx.scale(1.14, 1.14); ctx.translate(-x - 13, -y - 28); ctx.globalAlpha = 0.8; }
          person(ctx, x, y + 6, s);
          ctx.restore();
        }
        // chips, growing rightward
        const cn = Math.ceil(row.c);
        for (let k = 0; k < cn; k++) {
          const frac = Math.min(1, row.c - k), a = stampAt(t0 + k * DT);
          if (a <= 0) continue;
          const cs = 0.88, x = CX + colHalf + 14 + k * pitch + (pitch - 32 * cs) / 2;
          ctx.save();
          if (frac < 1) { ctx.beginPath(); ctx.rect(x - 1, y, 32 * cs * frac + 1, 60); ctx.clip(); }
          ctx.fillStyle = RED;
          if (a < 1) { ctx.translate(x + 14, y + 30); ctx.scale(1.14, 1.14); ctx.translate(-x - 14, -y - 30); ctx.globalAlpha = 0.8; }
          chip(ctx, x, y + 6 + 44 * (1 - cs), cs, PAPER);
          ctx.restore();
        }
      });

      // ---- footer ----
      const fy = top + ROWS.length * rowH + 14;
      const fp = H.ease.out(seg(rowStart, rowStart + 0.4));
      ctx.fillStyle = INK; ctx.fillRect(70, fy, (W - 140) * fp, 2);
      ctx.globalAlpha = seg(rowStart + 0.2, rowStart + 0.6);
      ctx.font = '400 14px "Space Grotesk"'; ctx.fillStyle = INK;
      spaced(ctx, 'Partial symbols show fractions of a unit.  Figures are illustrative.', 70, fy + 28, 0.3, 'left');
      ctx.font = '700 14px "Space Grotesk"';
      spaced(ctx, 'AFTER THE VIENNA METHOD', W - 70, fy + 28, 2.2, 'right');
      ctx.globalAlpha = 1;

      // ---- litho finish: ink film printed onto the paper, slight mottling + grain ----
      printInk(OUT, IL, W, H_); ctx = OUT;
      lithoFinish(ctx, W, H_, 3);
      H.grain(ctx, W, H_, 0.05, 9 + Math.floor(t * 8));
    },
    // Sound: rubber stamps on a chart sheet laid on a wooden table. Every pictogram is a stamp landing on the
    // 12 fps frame it appears (stamp(st) shows at ceil(st*12)/12), numerals advance with a numbering-machine clack,
    // the camera pans are the long sheet sliding on the table. Times mirror explainer() below.
    explainerSound(k) {
      const D = 15;
      const sf = (st) => Math.ceil(st * 12 - 1e-6) / 12; // first frame a stamp(st) / ts >= st is visible
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.6; // screen x
      // small rubber stamp: a soft pat of rubber on paper with a little table body
      const pat = (t, g = 1, p = 0) => k.withMinor(() => {
        k.noise(t, { dur: 0.04, filter: 'bandpass', f: 950, q: 0.9, gain: 0.3 * g, a: 0.002, pan: p });
        k.tone(t, { f: [[0, 150], [0.06, 70]], dur: 0.08, gain: 0.22 * g, pan: p });
      });
      // big rubber stamp (pictogram blocks, crosses, ticks): the kit stamp, a bit softer and woodier
      const thump = (t, g = 1, p = 0, minor = false) => k.play('stamp', t, { gain: 0.55 * g, pan: p, minor });
      // numbering machine advancing a digit wheel
      const numb = (t, g = 1, p = 0) => k.withMinor(() => {
        k.noise(t, { dur: 0.022, filter: 'bandpass', f: 2100, q: 1.8, gain: 0.26 * g, a: 0.001, pan: p });
        k.tone(t, { f: 410, type: 'triangle', dur: 0.03, gain: 0.06 * g, pan: p });
      });
      // the long sheet slides under the camera: smooth, low, no rustle
      const slide = (t0, t1) => k.noise(t0, { dur: t1 - t0 + 0.1, color: 'brown', filter: 'bandpass', f: [[0, 220], [(t1 - t0) * 0.5, 420], [t1 - t0 + 0.1, 200]], q: 0.6, gain: 0.22, a: (t1 - t0) * 0.45 });
      // flat arrow printed in steps: a short soft brayer pass
      const arrow = (t0, t1, p) => k.noise(sf(t0), { dur: t1 - t0, color: 'brown', filter: 'bandpass', f: 330, q: 1.4, gain: 0.25, a: 0.04, pan: p, minor: true });

      k.bed('room', 0, D, { gain: 0.4 });

      // ---- title stamps on, subtitle, rule; then the title slides to the corner (1.5 -> 2.3, smooth time)
      thump(0.0, 0.7);
      pat(sf(0.3), 0.6); // subtitle
      k.noise(1.5, { dur: 0.8, color: 'brown', filter: 'bandpass', f: [[0, 260], [0.8, 380]], q: 0.6, gain: 0.12, a: 0.3, minor: true });

      // ---- panel A: 20 symbols stamped in order (cats ochre top row, dogs blue bottom row)
      for (let i = 0; i < 20; i++) {
        const kk = Math.floor(i / 2), r = i % 2, t = sf(2.35 + i * 0.09);
        pat(t, 0.75 + 0.25 * ((i * 7) % 5) / 4, pan(150 + kk * 52));
      }
      // numeral re-stamped in 50,000 steps (val changes on the 12 fps grid)
      {
        let last = -1;
        for (let f = Math.ceil(2.5 * 12); f / 12 <= 4.9; f++) {
          const ts = f / 12, n = Math.round(1e6 * H.clamp((ts - 2.5) / 2.3) / 0.05) * 0.05, v = Math.min(1e6, Math.round(n / 50000) * 50000);
          if (v !== last) { if (v < 1e6) numb(ts, 0.8 + 0.3 * v / 1e6, pan(160)); else { k.play('tock', ts, { f: 300, gain: 0.55, pan: pan(160) }); thump(ts, 0.45, pan(160)); } last = v; }
        }
      }
      thump(sf(4.1), 1, pan(1000)); // THE MODEL chip
      arrow(4.4, 5.0, pan(775));
      slide(5.9, 6.6);

      // ---- panel B: guess, check, adjust
      thump(sf(6.8), 0.9, pan(130)); // GUESS block inks + the new picture
      arrow(7.0, 7.3, pan(260));
      arrow(7.4, 7.7, pan(575));
      thump(sf(7.7), 0.7, pan(800), true); // guess box "DOG?"
      thump(sf(7.9), 1.3, pan(1010)); // red cross: the wrong guess
      k.tone(sf(7.9), { f: 'D3', type: 'triangle', dur: 0.26, gain: 0.22, hold: 0.08, filter: 'lowpass', f2: 900, pan: pan(1010) });
      k.tone(sf(7.9) + 0.15, { f: 'A2', type: 'triangle', dur: 0.18, gain: 0.2, hold: 0.06, filter: 'lowpass', f2: 700, pan: pan(1010) });
      thump(sf(8.2), 1.0, pan(800)); // CHECK block + ANSWER: CAT
      k.noise(sf(8.4), { dur: 0.6, color: 'brown', filter: 'bandpass', f: [[0, 300], [0.6, 240]], q: 1.2, gain: 0.2, a: 0.05, pan: pan(640), minor: true }); // red error arrow curls back
      pat(sf(8.6), 0.8, pan(760)); // ERROR
      thump(sf(8.9), 0.7, pan(-0.2), true); // ADJUST block
      { // dials turn on the stepped clock: a ratchet click each frame they move
        for (let f = Math.ceil(8.9 * 12) + 1; f / 12 <= 9.6; f++) k.play('tock', f / 12, { f: 560 + (f % 3) * 40, gain: 0.32, pan: pan(410), minor: true });
      }
      thump(sf(9.6), 0.6, pan(130), true); // GUESS again
      thump(sf(9.7), 0.8, pan(800), true); // box re-stamped "CAT"
      thump(sf(9.8), 1.0, pan(1010)); // blue tick
      k.play('success', sf(9.8), { f: 'E5', gain: 0.45, pan: pan(1010) });
      slide(10.3, 10.9);

      // ---- panel C: rows of tick symbols stamp in while the sheet arrives
      pat(sf(10.4), 0.6, -0.4); // RIGHT ANSWERS OUT OF 10
      for (let r = 0; r < 4; r++) {
        const st0 = 10.5 + r * 0.45, frames = new Set();
        for (let q = 0; q < 10; q++) frames.add(sf(st0 + q * 0.03));
        [...frames].forEach((t, j) => pat(t, 0.9 - j * 0.1, -0.3 + j * 0.25));
        if (r > 0) numb(sf(st0), 1.1, 0.75); // hero accuracy re-stamped 61 -> 76 -> 89
      }
      // ROUND 1,000 row: hero numeral stamps 97%: the big hit
      thump(sf(11.85), 1.0, 0.75);
      k.play('impact', sf(11.85), { gain: 0.6, pan: 0.6 });
      k.play('ding', sf(11.85) + 0.02, { f: 'C5', gain: 0.45, pan: 0.6 });
      k.play('roller', sf(12.9), { dur: 0.3, gain: 0.35, minor: true }); // ochre band printed under the best row

      // ---- takeaway: full-width black block stamped (13.25 appears), then resolves
      thump(sf(13.2), 1.2);
      k.play('press', sf(13.2) + 0.08, { gain: 0.3 });
      ['F4', 'C5', 'A5'].forEach((f, i) => k.play('ding', 13.5 + i * 0.08, { f, gain: 0.38 - i * 0.06, pan: (i - 1) * 0.25 }));
    },
    explainerDuration: 15,
    explainerNote: 'A Vienna-Method picture-statistic told across one long chart sheet the camera pans along: symbols are stamped in stepped 12 fps timing, flat Isotype arrows show flow, numerals are stamped and re-stamped, and accuracy is counted in rows of tick symbols with partial symbols for fractions.',
    explainer(ctx, W, H_, t) {
      const ts = Math.floor(t * 12) / 12;           // stepped clock for stamping
      const S = (a, b) => H.clamp((ts - a) / (b - a));
      const stamp = (st) => (ts < st ? 0 : ts < st + 1 / 12 ? 0.5 : 1);
      const big = (a, fn, cx, cy) => { if (a <= 0) return; ctx.save(); if (a < 1) { ctx.translate(cx, cy); ctx.scale(1.15, 1.15); ctx.translate(-cx, -cy); ctx.globalAlpha = 0.8; } fn(); ctx.restore(); };
      const T = (str, x, y, size, align = 'left', col = INK, track = 2, weight = 700) => { ctx.fillStyle = col; ctx.font = `${weight} ${size}px "Space Grotesk"`; spaced(ctx, str, x, y, track, align); };
      H.paper(ctx, W, H_, PAPER, 11, 0.02);
      const OUT = ctx, IL = inkLayer(W, H_); ctx = IL.getContext('2d');

      // ---- camera: a smooth pan along one long sheet (3 panels) ----
      const PK = [[0, 0], [5.9, 0], [6.6, 1280], [10.3, 1280], [10.9, 2560], [15, 2560]];
      let px = 2560;
      for (let i = 0; i < PK.length - 1; i++) if (t >= PK[i][0] && t <= PK[i + 1][0]) { px = H.lerp(PK[i][1], PK[i + 1][1], H.ease.inOut((t - PK[i][0]) / (PK[i + 1][0] - PK[i][0]))); break; }
      ctx.save(); ctx.translate(-px, 0);
      ctx.textBaseline = 'alphabetic';

      // ===== panel A: data =====
      {
        const rowY = [150, 250], N = 10, pitch = 52, x0 = 150, sc = 1.4;
        if (ts >= 2.4) { T('CAT', 40, rowY[0] + 44, 30); T('DOG', 40, rowY[1] + 44, 30); }
        for (let r = 0; r < 2; r++) for (let k = 0; k < N; k++) {
          const st = 2.35 + (k * 2 + r) * 0.09, a = stamp(st);
          const x = x0 + k * pitch, y = rowY[r];
          ctx.fillStyle = r ? BLUE : OCHRE;
          big(a, () => (r ? dogPic(ctx, x + 2.5, y + 44 * sc * 0.12, sc * 0.88, PAPER) : catPic(ctx, x, y, sc, PAPER)), x + 20, y + 30);
        }
        if (ts >= 2.5) T('each symbol = 50,000 labelled pictures', 40, 370, 24, 'left', INK, 0.4, 400);
        if (ts >= 2.5) {
          const n = Math.round(1e6 * S(2.5, 4.8) / 0.05) * 0.05;
          const val = Math.min(1e6, Math.round(n / 50000) * 50000);
          T(val.toLocaleString('en-US'), 36, 486, 96, 'left', INK, 3);
          T('EXAMPLES', 40, 530, 28, 'left', INK, 4);
        }
        ctx.fillStyle = INK; flatArrow(ctx, 690, 250, 860, 250, 30, S(4.4, 5.0));
        const ma = stamp(4.1);
        ctx.fillStyle = RED; big(ma, () => chip(ctx, 880, 130, 7.6, PAPER), 1000, 300);
        if (ts >= 4.2) T('THE MODEL', 1002, 500, 34, 'center', INK, 4);
        if (ts > 5.0 && ts < 6.4) for (let k = 0; k < 3; k++) {
          const u = ((ts - 5.0) * 1.6 + k / 3) % 1, x = 700 + u * 140;
          ctx.fillStyle = k % 2 ? BLUE : OCHRE; ctx.globalAlpha = 0.9;
          (k % 2 ? dogPic : catPic)(ctx, x, 186, 0.85, INK);
          ctx.globalAlpha = 1;
        }
      }

      // ===== panel B: guess, check, adjust (x 1280..2560) =====
      {
        const X = 1280;
        const active = ts < 6.8 ? -1 : ts < 8.2 ? 0 : ts < 8.9 ? 1 : ts < 9.6 ? 2 : 0;
        ['GUESS', 'CHECK', 'ADJUST'].forEach((s, i) => {
          const bx = X + 300 + i * 300, by = 100;
          ctx.fillStyle = i === active ? INK : 'rgba(38,35,31,0.12)'; ctx.fillRect(bx, by, 240, 66);
          T(s, bx + 120, by + 45, 32, 'center', i === active ? PAPER : INK, 4);
          if (i < 2) { ctx.fillStyle = INK; flatArrow(ctx, bx + 246, by + 33, bx + 294, by + 33, 12, 1); }
        });
        ctx.fillStyle = OCHRE; big(stamp(6.8), () => catPic(ctx, X + 76, 230, 3.6, PAPER), X + 126, 310);
        if (ts >= 6.8) T('NEW PICTURE', X + 136, 432, 28, 'center', INK, 2.5);
        ctx.fillStyle = INK; flatArrow(ctx, X + 222, 320, X + 304, 320, 24, S(7.0, 7.3));
        ctx.fillStyle = RED; chip(ctx, X + 320, 196, 5.8, PAPER);
        const turn = H.ease.inOut(S(8.9, 9.6));
        for (let i = 0; i < 3; i++) {
          const dx = X + 352 + i * 62, dy = 490;
          ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(dx, dy, 22, 0, 7); ctx.fill();
          const a0 = [-2.2, -0.6, -1.5][i], a1 = [-0.9, -2.0, -0.4][i], a = H.lerp(a0, a1, turn);
          ctx.strokeStyle = PAPER; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + Math.cos(a) * 16, dy + Math.sin(a) * 16); ctx.stroke();
        }
        if (ts >= 6.8) T('SETTINGS', X + 414, 554, 28, 'center', INK, 3);
        ctx.fillStyle = INK; flatArrow(ctx, X + 520, 320, X + 630, 320, 24, S(7.4, 7.7));
        const g2 = ts >= 9.7;
        if (ts >= 7.7) {
          const flash = ts < 8.2 && Math.floor(ts * 6) % 2 === 0;
          ctx.fillStyle = flash ? RED : INK; ctx.fillRect(X + 650, 262, 300, 120);
          T(g2 ? 'CAT' : 'DOG?', X + 800, 344, 64, 'center', PAPER, 4);
          T('ITS GUESS', X + 800, 250, 28, 'center', INK, 3);
          if (!g2) { ctx.fillStyle = RED; big(stamp(7.9), () => crossPic(ctx, X + 968, 282, 2.5), X + 1008, 322); }
          else { ctx.fillStyle = BLUE; big(stamp(9.8), () => checkPic(ctx, X + 968, 276, 2.6), X + 1010, 318); }
        }
        if (ts >= 8.2 && ts < 9.7) {
          ctx.fillStyle = OCHRE; ctx.fillRect(X + 650, 400, 300, 62);
          T('ANSWER: CAT', X + 800, 442, 30, 'center', INK, 3);
          ctx.fillStyle = RED; flatArrow(ctx, X + 760, 470, X + 520, 520, 18, S(8.4, 9.0), X + 700, 640);
          if (ts >= 8.6) T('ERROR', X + 760, 640, 32, 'center', RED, 4);
        }
        if (ts >= 8.9 && ts < 9.9) T('TURN THE DIALS', X + 414, 610, 28, 'center', INK, 3);
      }

      // ===== panel C: progress (x 2560..3840); rows start stamping while the sheet slides in =====
      {
        const X = 2560;
        const rows = [['ROUND 1', 6.1], ['ROUND 10', 7.6], ['ROUND 100', 8.9], ['ROUND 1,000', 9.7]];
        if (ts >= 10.4) T('RIGHT ANSWERS OUT OF 10', X + 40, 132, 26, 'left', INK, 2.5);
        rows.forEach(([lab, v], r) => {
          const y = 170 + r * 100, st0 = 10.5 + r * 0.45;
          if (ts < st0) return;
          if (r === 3 && ts >= 12.9) { ctx.fillStyle = 'rgba(212,154,51,0.35)'; ctx.fillRect(X + 30, y - 8, 1220, 94); }
          T(lab, X + 40, y + 52, 28, 'left', INK, 2);
          for (let k = 0; k < 10; k++) {
            const x = X + 290 + k * 70, frac = H.clamp(v - k), a = stamp(st0 + k * 0.03);
            if (a <= 0) continue;
            ctx.save();
            if (frac < 1) { ctx.save(); ctx.beginPath(); ctx.rect(x - 4 + 62 * frac, y, 62 * (1 - frac) + 4, 80); ctx.clip(); ctx.globalAlpha = 0.16; ctx.fillStyle = INK; checkPic(ctx, x, y + 10, 1.75); ctx.restore(); }
            if (frac > 0) { ctx.beginPath(); ctx.rect(x - 4, y, 62 * frac, 80); ctx.clip(); ctx.fillStyle = BLUE; checkPic(ctx, x, y + 10, 1.75); }
            ctx.restore();
          }
          T(Math.round(v * 10) + '%', X + 1010, y + 54, 38, 'left', INK, 1);
        });
        // hero accuracy counter, stamped step by step
        if (ts >= 10.5) {
          const steps = [61, 61, 76, 89, 97];
          const ci = Math.min(4, Math.floor((ts - 10.5) / 0.45) + 1);
          T('ACCURACY', X + 1240, 100, 28, 'right', RED, 3);
          T(steps[ci] + '%', X + 1240, 174, 72, 'right', RED, 2);
        }
      }
      ctx.restore();

      // ---- header: the question, big first, then set in the top corner ----
      {
        const d = H.ease.inOut(H.clamp((t - 1.5) / 0.8));
        const x = H.lerp(640, 40, d), y = H.lerp(340, 60, d), size = H.lerp(84, 30, d);
        ctx.globalAlpha = S(0, 0.25);
        T('HOW DOES AI LEARN?', x, y, size, d > 0.5 ? 'left' : 'center', INK, H.lerp(8, 3, d));
        if (d < 1) { ctx.globalAlpha = (1 - d) * S(0.3, 0.6); T('a picture statistic in three steps', 640, 400, 30, 'center', INK, 0.8, 400); }
        ctx.globalAlpha = 1;
        // header rule only in panel A (later panels use their own top rows)
        const rw = H.lerp(800, 560, d);
        ctx.fillStyle = INK; ctx.fillRect(H.lerp(240, 40, d), H.lerp(440, 76, d), rw * S(0.2, 0.6) * (1 - H.clamp((px - 300) / 300)), 3);
      }
      if (ts >= 13.2) {
        const a = stamp(13.2);
        big(a, () => {
          ctx.fillStyle = INK; ctx.fillRect(40, 600, 1200, 92);
          T('MORE EXAMPLES → BETTER GUESSES', 640, 662, 46, 'center', PAPER, 3);
        }, 640, 646);
      }
      printInk(OUT, IL, W, H_); ctx = OUT;
      lithoFinish(ctx, W, H_, 2);
      H.grain(ctx, W, H_, 0.05, 9 + Math.floor(t * 8));
    },
  });
}
