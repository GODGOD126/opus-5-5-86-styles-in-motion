{
  // Guilloché / spirograph security print: a fictional banknote — lathe-work rosettes built from
  // layered hypotrochoids & phase-shifted sine rings, iris (split-fountain) inks, microtext, serials.
  const TAU = Math.PI * 2;

  // PR = how much of each curve the lathe pen has traced so far (0..1); 1 = complete
  let PR = 1;
  const ph = (t, a, b) => H.clamp((t - a) / (b - a));
  function curve(ctx, n, f) {
    if (PR <= 0) return;
    const m = Math.floor(n * PR);
    ctx.beginPath();
    for (let i = 0; i <= m; i++) { const p = f(i / n); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    if (m < n) { const p = f(PR); ctx.lineTo(p[0], p[1]); }
    ctx.stroke();
  }
  function iris(ctx, x0, y0, x1, y1, stops) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    return g;
  }
  // hypotrochoid scaled so its outer radius = rad
  function hypo(ctx, cx, cy, R, r, d, rad, rot, n) {
    const outer = R - r + d, s = rad / outer;
    const turns = r / gcd(R, r);
    curve(ctx, n, (u) => {
      const t = u * TAU * turns;
      const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
      const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
      const c = Math.cos(rot), sn = Math.sin(rot);
      return [cx + s * (x * c - y * sn), cy + s * (x * sn + y * c)];
    });
  }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }

  // sine-ring band: K phase-shifted copies of r(a)=r0+amp*sin(n a + phase) -> woven rope ring
  function ringBand(ctx, cx, cy, r0, amp, n, K, phase0, sx = 1, sy = 1) {
    for (let k = 0; k < K; k++) {
      const ph = phase0 + (k / K) * Math.PI;
      curve(ctx, Math.max(600, n * 40), (u) => {
        const a = u * TAU, rr = r0 + amp * Math.sin(n * a + ph);
        return [cx + rr * Math.cos(a) * sx, cy + rr * Math.sin(a) * sy];
      });
    }
  }
  // lace band: rotated copies of a looping hypotrochoid
  function laceBand(ctx, cx, cy, lobes, loop, rad, copies, rot) {
    // R = lobes+1, r = 1 -> (R-r)/r = lobes loops, d = loop
    for (let k = 0; k < copies; k++) hypo(ctx, cx, cy, lobes + 1, 1, loop, rad, rot + (k / copies) * (TAU / lobes), lobes * 60);
  }
  function rosette(ctx, cx, cy, R, ink, ink2, t, o = {}) {
    const spin = t * 0.05, rp = o.p == null ? 1 : o.p;
    const sub = (a, b) => (PR = H.ease.inOut(H.clamp((rp - a) / (b - a))));
    ctx.save();
    ctx.lineWidth = o.lw || 0.55; ctx.strokeStyle = ink;
    // outer rope + scallop
    sub(0.6, 1); ringBand(ctx, cx, cy, R * 0.9, R * 0.075, o.n1 || 30, o.K1 || 7, spin);
    sub(0.7, 0.92); curve(ctx, 1600, (u) => { const a = u * TAU, rr = R * (0.99 - 0.012 * Math.abs(Math.sin((o.n1 || 30) * a))); return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; });
    curve(ctx, 1600, (u) => { const a = u * TAU, rr = R * 0.805; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; });
    // lace petals (second ink — two-colour lathe overprint)
    ctx.strokeStyle = ink2;
    sub(0.32, 0.72); laceBand(ctx, cx, cy, o.lobes || 18, o.loop || 2.6, R * 0.78, o.copies || 6, -spin);
    // pointed petal family (|cos| envelope) bridging lace and inner rope
    ctx.strokeStyle = ink;
    sub(0.14, 0.45);
    if (o.petal !== false) {
      const pn = Math.round((o.lobes || 18) / 2);
      for (let k = 0; k < 7; k++) {
        curve(ctx, 1800, (u) => {
          const a = u * TAU, e = Math.abs(Math.cos(pn * a + spin * 0.5));
          const rr = R * (0.47 + 0.11 * Math.pow(e, 0.6) * (1 - k / 9) + k * 0.006);
          return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
        });
      }
    }
    // inner fine rope
    sub(0, 0.3); ringBand(ctx, cx, cy, R * 0.42, R * 0.045, (o.lobes || 18) * 2, o.K2 || 6, spin * 2);
    PR = 1;
    ctx.restore();
  }


  // =====================================================================================
  // EXPLAINER — a sheet of five security-printed notes; the camera pans note to note.
  // The model is a lathe rosette: untrained its rings are out of register (scrambled phases
  // and centres); each correction brings the lathe passes into register until the rosette is
  // perfect. Counters are red numbering-machine serials; verdicts are rubber cancellation stamps.
  // =====================================================================================
  const SX = (t, a, b) => H.clamp((t - a) / (b - a));
  const GRN = '#173e38', RED = '#b3262b', PAPERC = '#ebe6cf';
  let SPBG = null;
  function spPaper(W, H_) {
    if (SPBG) return SPBG;
    SPBG = H.layer(W, H_); const c = SPBG.getContext('2d'), r = H.rng(77);
    H.paper(c, W, H_, '#e8e4cf', 9, 0.05);
    const g = c.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, 'rgba(120,170,140,0.20)'); g.addColorStop(0.5, 'rgba(200,190,140,0.10)'); g.addColorStop(1, 'rgba(220,140,120,0.18)');
    c.fillStyle = g; c.fillRect(0, 0, W, H_);
    for (let i = 0; i < 140; i++) {
      const x = r() * W, y = r() * H_, a = r() * TAU, L = 6 + r() * 10;
      c.strokeStyle = r() < 0.5 ? 'rgba(200,40,60,0.55)' : 'rgba(40,80,190,0.5)'; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 1) * L * 0.6, y + Math.sin(a + 1) * L * 0.6, x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke();
    }
    c.lineWidth = 0.5; c.strokeStyle = iris(c, 0, 0, W, 0, ['rgba(40,120,100,0.30)', 'rgba(70,90,150,0.28)', 'rgba(170,70,90,0.28)']);
    for (let k = 0; k < 2; k++) for (let y0 = -20; y0 < H_ + 20; y0 += 8) curve(c, 320, (u) => { const x = u * W; return [x, y0 + 4.5 * Math.sin(x / 26 + y0 / 37 + k * Math.PI) + 6 * Math.sin(x / 210 + y0 / 90)]; });
    // rope frame
    const m = 22, bw = 26;
    c.fillStyle = 'rgba(232,228,207,0.92)'; c.fillRect(m, m, W - 2 * m, bw); c.fillRect(m, H_ - m - bw, W - 2 * m, bw); c.fillRect(m, m, bw, H_ - 2 * m); c.fillRect(W - m - bw, m, bw, H_ - 2 * m);
    c.lineWidth = 0.6; c.strokeStyle = iris(c, 0, 0, W, H_, ['#1d5a48', '#2c4f7c', '#6b2f4f']);
    const side = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), tx = (x1 - x0) / L, ty = (y1 - y0) / L; for (let k = 0; k < 6; k++) curve(c, Math.floor(L / 2), (u) => { const s = u * L, off = (bw / 2 - 2) * Math.sin(s / 9 + (k / 6) * Math.PI); return [x0 + tx * s - ty * off, y0 + ty * s + tx * off]; }); };
    side(m, m + bw / 2, W - m, m + bw / 2); side(m, H_ - m - bw / 2, W - m, H_ - m - bw / 2); side(m + bw / 2, m, m + bw / 2, H_ - m); side(W - m - bw / 2, m, W - m - bw / 2, H_ - m);
    c.strokeStyle = '#1f3f3a'; c.lineWidth = 1.2; c.strokeRect(m, m, W - 2 * m, H_ - 2 * m); c.lineWidth = 0.7; c.strokeRect(m + bw + 3, m + bw + 3, W - 2 * (m + bw + 3), H_ - 2 * (m + bw + 3));
    return SPBG;
  }
  // engraved text: filled with fine hatching, outlined; small offscreen layer per call
  function engr(c, text, x, y, font, o = {}) {
    c.save(); c.font = font; const m = c.measureText(text), w = Math.ceil(m.width) + 8, asc = Math.ceil(m.actualBoundingBoxAscent) + 4, h = asc + Math.ceil(m.actualBoundingBoxDescent) + 6; c.restore();
    const ox = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    const L = H.layer(w, h), lc = L.getContext('2d');
    lc.font = font; lc.textBaseline = 'alphabetic'; lc.fillStyle = '#000'; lc.fillText(text, 4, asc);
    lc.globalCompositeOperation = 'source-in'; lc.fillStyle = o.bg || PAPERC; lc.fillRect(0, 0, w, h);
    lc.globalCompositeOperation = 'source-atop'; lc.strokeStyle = o.ink || GRN; lc.lineWidth = o.hw || 1.45;
    const st = o.step || 2.2; for (let yy = 0; yy < h + 10; yy += st) { lc.beginPath(); lc.moveTo(0, yy); lc.lineTo(w, yy + w * 0.04); lc.stroke(); }
    c.drawImage(L, ox, y - asc);
    c.save(); c.font = font; c.textBaseline = 'alphabetic'; c.strokeStyle = o.ink || GRN; c.lineWidth = o.lw || 1.6; c.strokeText(text, ox + 4, y); c.restore();
    return w;
  }
  function plain(c, text, x, y, font, o = {}) {
    c.save(); c.font = font; c.fillStyle = o.ink || GRN; c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic';
    try { c.letterSpacing = o.ls || '0px'; } catch (e) {} c.fillText(text, x, y); const w = c.measureText(text).width; c.restore(); return w;
  }
  // red numbering-machine digits: each digit wheel sits slightly off the baseline
  function serial(c, text, x, y, size) {
    c.save(); c.font = `700 ${size}px "Courier Prime"`; c.fillStyle = RED; c.textBaseline = 'alphabetic';
    let xx = x; const r = H.rng(5);
    for (const ch of text) { c.fillText(ch, xx, y + (/\d/.test(ch) ? (r() - 0.5) * size * 0.08 : 0)); xx += c.measureText(ch).width + size * 0.08; }
    c.restore(); return xx - x;
  }
  // rubber cancellation stamp: red double ellipse with text, rough coverage
  function stamp(c, text, x, y, w, h, rot, k) {
    if (k <= 0) return; const s = 1 + 0.5 * Math.pow(1 - k, 2);
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.globalAlpha = 0.85 * Math.min(1, k * 2);
    c.strokeStyle = RED; c.fillStyle = RED; c.lineWidth = 5; c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, w / 2 - 9, h / 2 - 9, 0, 0, TAU); c.stroke();
    c.font = `700 ${h * 0.34}px "Courier Prime"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, 2);
    c.globalCompositeOperation = 'destination-out'; const r = H.rng(13);
    for (let i = 0; i < 90; i++) { c.globalAlpha = 0.5; c.fillRect(r.range(-w / 2, w / 2), r.range(-h / 2, h / 2), r.range(1, 4), r.range(1, 3)); }
    c.restore();
  }
  // engraved double-rule arrow with hatched head
  function eArrow(c, x0, y0, x1, y1, p, col = GRN) {
    if (p <= 0) return; const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p, a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a) * 3, ny = Math.cos(a) * 3, hd = 22;
    c.save(); c.strokeStyle = col; c.lineWidth = 1.2;
    const bx = x - Math.cos(a) * hd * 0.8, by = y - Math.sin(a) * hd * 0.8;
    c.beginPath(); c.moveTo(x0 + nx, y0 + ny); c.lineTo(bx + nx, by + ny); c.moveTo(x0 - nx, y0 - ny); c.lineTo(bx - nx, by - ny); c.stroke();
    const p1 = [x - Math.cos(a - 0.45) * hd, y - Math.sin(a - 0.45) * hd], p2 = [x - Math.cos(a + 0.45) * hd, y - Math.sin(a + 0.45) * hd];
    c.beginPath(); c.moveTo(x, y); c.lineTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.closePath(); c.stroke(); c.save(); c.clip();
    c.lineWidth = 0.8; for (let k = -30; k < 30; k += 2.4) { c.beginPath(); c.moveTo(x + k, y - 30); c.lineTo(x + k + 20, y + 30); c.stroke(); } c.restore();
    c.restore();
  }
  // oval cartouche with a hatched pet silhouette + microtext label
  function cartouche(c, kind, cx, cy, s, label) {
    c.save(); c.fillStyle = PAPERC; c.beginPath(); c.ellipse(cx, cy, s * 0.5, s * 0.6, 0, 0, TAU); c.fill();
    c.strokeStyle = GRN; c.lineWidth = 0.6; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(cx, cy, s * 0.5 - k * 2.5, s * 0.6 - k * 2.5, 0, 0, TAU); c.stroke(); }
    c.beginPath(); c.arc(cx, cy + s * 0.06, s * 0.26, 0, TAU);
    if (kind === 'cat') for (const k of [-1, 1]) { c.moveTo(cx + k * s * 0.05, cy - s * 0.12); c.lineTo(cx + k * s * 0.25, cy - s * 0.34); c.lineTo(cx + k * s * 0.26, cy - s * 0.02); c.closePath(); }
    else for (const k of [-1, 1]) { c.moveTo(cx + k * s * 0.27, cy - s * 0.1); c.ellipse(cx + k * s * 0.27, cy + s * 0.08, s * 0.08, s * 0.2, k * 0.3, -Math.PI / 2, Math.PI * 1.5); }
    c.save(); c.clip(); c.lineWidth = Math.max(0.7, s * 0.012);
    for (let y = cy - s * 0.4; y < cy + s * 0.4; y += Math.max(1.6, s * 0.03)) { c.beginPath(); c.moveTo(cx - s * 0.4, y); c.lineTo(cx + s * 0.4, y); c.stroke(); }
    c.restore(); c.lineWidth = 1.2; c.stroke();
    c.fillStyle = PAPERC; for (const k of [-1, 1]) { c.beginPath(); c.arc(cx + k * s * 0.1, cy + s * 0.02, s * 0.04, 0, TAU); c.fill(); }
    if (label) plain(c, label, cx, cy + s * 0.6 + 26, '700 22px "Libre Baskerville"', { align: 'center', ls: '2px' });
    c.restore();
  }
  // the model: a lathe rosette whose passes are out of register by `chaos`
  function modelRosette(c, cx, cy, R, chaos, t, draw = 1) {
    const r = H.rng(404);
    c.save(); c.fillStyle = 'rgba(236,232,212,0.88)'; c.beginPath(); c.arc(cx, cy, R * 1.03, 0, TAU); c.fill();
    PR = H.ease.inOut(H.clamp(draw)); c.lineWidth = 0.6;
    const ink1 = iris(c, cx - R, cy - R, cx + R, cy + R, ['#145243', '#1f6b6a', '#2f4f8f', '#5a2f6e']);
    const ink2 = iris(c, cx, cy - R, cx, cy + R, ['#b24a2c', '#c98a3a', '#9a3d5e']);
    const pass = (rad, amp, n, K, ink) => {
      c.strokeStyle = ink;
      for (let k = 0; k < K; k++) {
        const ph = (k / K) * Math.PI + chaos * r.range(-2, 2), ox = chaos * r.range(-1, 1) * R * 0.2, oy = chaos * r.range(-1, 1) * R * 0.2, sc = 1 + chaos * r.range(-0.16, 0.16), nn = n + (chaos > 0.35 ? r.int(-2, 2) : 0);
        curve(c, Math.max(600, nn * 40), (u) => { const a = u * TAU, rr = (rad + amp * Math.sin(nn * a + ph + t * 0.05)) * sc; return [cx + ox + rr * Math.cos(a), cy + oy + rr * Math.sin(a)]; });
      }
    };
    pass(R * 0.9, R * 0.075, 30, 7, ink1);
    pass(R * 0.64, R * 0.1, 22, 6, ink2);
    pass(R * 0.4, R * 0.05, 36, 5, ink1);
    PR = 1;
    c.strokeStyle = GRN; c.lineWidth = 1.4; c.beginPath(); c.arc(cx, cy, R * 0.22, 0, TAU); c.fillStyle = PAPERC; c.fill(); c.stroke();
    c.lineWidth = 0.5; for (let rr = 3; rr < R * 0.22; rr += 2.2) { c.beginPath(); c.arc(cx, cy, rr, 0, TAU); c.stroke(); }
    c.fillStyle = PAPERC; c.fillRect(cx - R * 0.11, cy - R * 0.08, R * 0.22, R * 0.16);
    c.restore();
    plain(c, 'AI', cx, cy + R * 0.05, `600 ${R * 0.1}px "Cormorant Garamond"`, { align: 'center' });
  }
  // a woven sine-rope band running round a rectangle (x,y,w,h = outer edge, bw = band width), like the note border
  function ropeRect(c, x, y, w, h, bw, ink, strands = 5, per = 9) {
    c.save(); c.strokeStyle = ink; c.lineWidth = 0.55;
    const side = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), tx = (x1 - x0) / L, ty = (y1 - y0) / L; for (let k = 0; k < strands; k++) curve(c, Math.floor(L / 2), (u) => { const s = u * L, off = (bw / 2 - 1.5) * Math.sin(s / per + (k / strands) * Math.PI); return [x0 + tx * s - ty * off, y0 + ty * s + tx * off]; }); };
    const h2 = bw / 2;
    side(x, y + h2, x + w, y + h2); side(x, y + h - h2, x + w, y + h - h2); side(x + h2, y, x + h2, y + h); side(x + w - h2, y, x + w - h2, y + h);
    c.restore();
  }
  // a line of microprint repeated to fill a width, centred on cx
  function micro(c, text, cx, y, w, ink) {
    c.save(); c.font = '600 7px "Inter"'; c.fillStyle = ink || GRN; c.textBaseline = 'alphabetic';
    try { c.letterSpacing = '0.6px'; } catch (e) {}
    let line = ''; while (c.measureText(line + text).width < w) line += text;
    c.textAlign = 'center'; c.fillText(line, cx, y); c.restore();
  }
  function spHeader(c) {
    // running head: a small engraved cartouche with a rope edge (30px italic)
    const x = 54, y = 54, w = 330, h = 52;
    c.save(); c.fillStyle = 'rgba(235,230,207,0.95)'; c.fillRect(x, y, w, h);
    ropeRect(c, x, y, w, h, 9, iris(c, x, 0, x + w, 0, ['#1d5a48', '#2c4f7c', '#6b2f4f']), 3, 4.5);
    c.strokeStyle = GRN; c.lineWidth = 0.9; c.strokeRect(x, y, w, h); c.lineWidth = 0.6; c.strokeRect(x + 10, y + 10, w - 20, h - 20);
    c.restore();
    plain(c, 'How does AI learn?', x + w / 2, y + 36, 'italic 400 28px "Libre Baskerville"', { align: 'center' });
  }
  const fmtS = (n) => Math.round(n).toLocaleString('en-US');

  // ---------- the five notes (drawn at panel offset ox) ----------
  function note0(c, t) { // hook
    modelRosette(c, 640, 380, 250, 0, t, SX(t, 0.0, 1.9));
    const k = H.ease.back(SX(t, 0.15, 0.6)), z = 1 + 0.05 * H.ease.inOut(SX(t, 0.6, 2.4));
    c.save(); c.translate(640, 300); c.scale(k * z, k * z);
    c.fillStyle = 'rgba(235,230,207,0.94)'; c.fillRect(-470, -70, 940, 120); c.strokeStyle = GRN; c.lineWidth = 0.8; c.strokeRect(-462, -62, 924, 104);
    engr(c, 'HOW DOES AI LEARN?', 0, 20, '700 60px "Libre Baskerville"', { align: 'center' });
    c.restore();
    plain(c, 'Certificate of the Neural Reserve · Series A', 640, 210, 'italic 400 16px "Libre Baskerville"', { align: 'center' });
  }
  function note1(c, t) { // data
    const rows = [200, 340, 480];
    rows.forEach((y, i) => eArrow(c, 90, y, 770, y, H.ease.out(SX(t, 2.6 + i * 0.08, 3.1 + i * 0.08))));
    const r = H.rng(31), K = 30;
    for (let k = 0; k < K; k++) {
      const kind = r() < 0.5 ? 'cat' : 'dog', ts = 2.55 + 3.1 * Math.pow(k / K, 0.8);
      if (t < ts) continue; const x = 60 + (t - ts) * (470 + k * 14); if (x > 820) continue;
      const fade = H.clamp((820 - x) / 60); c.save(); c.globalAlpha = fade; cartouche(c, kind, x, rows[k % 3], 76, kind.toUpperCase()); c.restore();
    }
    modelRosette(c, 1000, 330, 200, 1, t, SX(t, 2.15, 3.3));
    if (t > 3.2) { engr(c, 'THE MODEL', 1000, 580 + (1 - H.ease.back(SX(t, 3.2, 3.5))) * 30, '700 34px "Libre Baskerville"', { align: 'center' }); plain(c, 'untrained: out of register', 1000, 614, 'italic 400 22px "Libre Baskerville"', { align: 'center' }); }
    if (t > 2.7) {
      const p = SX(t, 2.75, 5.0), n = p >= 1 ? 1e6 : Math.floor(Math.pow(10, 6 * H.ease.inOut(p))) - 1;
      const w = serial(c, 'No. ' + fmtS(n), 90, 650, 64);
      plain(c, 'EXAMPLES', 90 + w + 14, 646, '700 28px "Libre Baskerville"', { ls: '3px' });
    }
  }
  function note2(c, t) { // guess / check / adjust
    cartouche(c, 'cat', 190, 300, 170, null);
    plain(c, t >= 8.0 ? 'ANSWER: CAT' : 'NEW PICTURE', 190, 446, '700 24px "Libre Baskerville"', { align: 'center', ls: '2px', ink: t >= 8.0 ? RED : GRN });
    eArrow(c, 300, 300, 420, 300, H.ease.out(SX(t, 6.5, 6.75)));
    const adj = H.ease.inOut(SX(t, 8.9, 9.45));
    modelRosette(c, 610, 300, 175, 0.8 - 0.5 * adj, t, 1);
    eArrow(c, 800, 300, 880, 300, H.ease.out(SX(t, 7.05, 7.25)));
    const right = t >= 9.6;
    if (t >= 7.25 && !right) { engr(c, 'DOG?', 900, 330, '700 84px "Libre Baskerville"'); plain(c, 'GUESS', 990, 222 + (1 - H.ease.back(SX(t, 7.3, 7.55))) * -30, '700 28px "Libre Baskerville"', { align: 'center', ls: '4px' }); }
    if (!right) stamp(c, 'WRONG ✗', 1050, 405, 230, 100, -0.18, SX(t, 7.9, 8.05));
    if (t >= 8.35 && t < 9.6) { // error signal: red dotted run back to the lathe
      const k = H.ease.inOut(SX(t, 8.35, 8.9));
      c.save(); c.strokeStyle = RED; c.lineWidth = 2.5; c.setLineDash([3, 6]); c.beginPath();
      const pts = [[1050, 455], [1050, 520], [610, 520], [610, 485]]; let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      let left = L * k; c.moveTo(1050, 455); for (let i = 1; i < pts.length && left > 0; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), q = Math.min(1, left / d); c.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * q, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * q); left -= d; }
      c.stroke(); c.restore();
      plain(c, 'error sent back', 830, 556, 'italic 400 26px "Libre Baskerville"', { align: 'center', ink: RED });
    }
    if (t >= 8.85 && t < 10.5) plain(c, 'ADJUST: bring into register', 610, 112 + (1 - H.ease.back(SX(t, 8.85, 9.1))) * -30, '700 26px "Libre Baskerville"', { align: 'center', ls: '1px', ink: RED });
    if (right) { engr(c, 'CAT', 900, 330, '700 84px "Libre Baskerville"'); stamp(c, 'VERIFIED ✓', 1010, 410, 250, 100, 0.12, SX(t, 9.7, 9.85)); }
    // loop strip
    const words = ['GUESS', 'CHECK', 'ADJUST'];
    const act = t < 7.25 ? -1 : t < 7.9 ? 0 : t < 8.35 ? 1 : t < 9.6 ? 2 : Math.floor((t - 9.6) / 0.16) % 3;
    let x = 110;
    words.forEach((w, i) => { x += engr(c, w, x, 640, '700 38px "Libre Baskerville"', { ink: i === act ? RED : GRN }) + 10; if (i < 2) { eArrow(c, x, 626, x + 50, 626, 1); x += 66; } });
    plain(c, '↻ ×1,000,000', x + 10, 638, 'italic 400 26px "Libre Baskerville"');
  }
  function note3(c, t) { // progress
    const p = H.ease.inOut(SX(t, 10.85, 12.3)), v = Math.round(61 + 36 * p);
    plain(c, 'ACCURACY', 120, 170, '700 34px "Libre Baskerville"', { ls: '6px' });
    const punch = t >= 12.3 ? 1 + 0.12 * Math.exp(-(t - 12.3) * 9) : 1;
    c.save(); c.translate(120, 360); c.scale(punch, punch); engr(c, v + '%', 0, 0, '800 170px "Playfair Display"', { hw: 1.4, lw: 2 }); c.restore();
    if (t >= 12.3) stamp(c, 'CERTIFIED', 330, 455, 280, 90, -0.08, SX(t, 12.3, 12.45));
    // guilloché chart: a rope band climbing over training rounds
    const x0 = 110, x1 = 620, y0 = 620, y1 = 470, k = H.ease.inOut(SX(t, 10.9, 12.3));
    c.save(); c.strokeStyle = iris(c, x0, 0, x1, 0, ['#2f4f8f', '#1f6b6a', '#b24a2c']); c.lineWidth = 0.7;
    const f = (u) => y0 - (y0 - y1 - 30) * (1 - Math.exp(-u * 3.5)) / (1 - Math.exp(-3.5));
    PR = k; for (let q = 0; q < 7; q++) curve(c, 500, (u) => [x0 + (x1 - x0) * u, f(u) + 12 * Math.sin(u * 60 + (q / 7) * Math.PI)]); PR = 1;
    c.strokeStyle = GRN; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0 + 14); c.lineTo(x1, y0 + 14); c.stroke(); c.restore();
    const tw = plain(c, 'training rounds', x0, y0 + 44, 'italic 400 24px "Libre Baskerville"');
    eArrow(c, x0 + tw + 14, y0 + 36, x0 + tw + 84, y0 + 36, 1);
    modelRosette(c, 930, 360, 230, 0.3 * (1 - p), t, 1);
    plain(c, p < 1 ? 'coming into register…' : 'in register', 930, 630, 'italic 400 26px "Libre Baskerville"', { align: 'center' });
  }
  function note4(c, t) { // takeaway
    modelRosette(c, 640, 360, 260, 0, t, 1);
    const k = H.ease.back(SX(t, 13.3, 13.65));
    c.save(); c.translate(640, 360); c.scale(k, k);
    // banknote cartouche: translucent ground (the rosette shows faintly through), rope band, double rule, microprint, seals
    c.fillStyle = 'rgba(235,230,207,0.88)'; c.fillRect(-500, -110, 1000, 210);
    ropeRect(c, -500, -110, 1000, 210, 18, iris(c, -500, 0, 500, 0, ['#1d5a48', '#2c4f7c', '#6b2f4f']), 5, 7);
    c.strokeStyle = GRN; c.lineWidth = 1.1; c.strokeRect(-500, -110, 1000, 210);
    c.lineWidth = 0.8; c.strokeRect(-481, -91, 962, 172); c.lineWidth = 0.5; c.strokeRect(-477, -87, 954, 165);
    micro(c, 'MORE EXAMPLES · BETTER GUESSES · NEURAL RESERVE · ', 0, -77, 900, GRN);
    micro(c, 'TRAINED IN REGISTER · SERIES A · CERTIFIED ACCURATE · ', 0, 75, 900, RED);
    const ink1 = iris(c, -460, -50, -380, 30, ['#145243', '#2f4f8f', '#5a2f6e']), ink2 = iris(c, 0, -50, 0, 30, ['#b24a2c', '#c98a3a', '#9a3d5e']);
    for (const sx of [-1, 1]) {
      const cx = sx * 418, cy = -4;
      c.save(); c.fillStyle = 'rgba(235,230,207,0.9)'; c.beginPath(); c.arc(cx, cy, 50, 0, TAU); c.fill(); c.restore();
      rosette(c, cx, cy, 50, ink1, ink2, t, { lobes: 12, n1: 22, K1: 5, copies: 4, K2: 4, lw: 0.5 });
      c.save(); c.strokeStyle = GRN; c.lineWidth = 0.8; c.beginPath(); c.arc(cx, cy, 13, 0, TAU); c.stroke(); c.restore();
    }
    engr(c, 'MORE EXAMPLES', 0, -18, '700 56px "Libre Baskerville"', { align: 'center' });
    // engraved double-rule arrow (as in the loop strip) instead of the thin font arrow; the line keeps its width and centre
    c.save(); c.font = '700 56px "Libre Baskerville"'; const wA = c.measureText('→ ').width, wB = c.measureText('BETTER GUESSES').width; c.restore();
    const lx = -(wA + wB) / 2 - 4;
    c.save(); c.translate(lx - 22, 45); c.scale(1.6, 1.6); eArrow(c, 0, 0, (wA + 8) / 1.6, 0, 1, RED); c.restore();
    engr(c, 'BETTER GUESSES', lx + wA, 66, '700 56px "Libre Baskerville"', { ink: RED });
    c.restore();
  }
  const NOTES = [note0, note1, note2, note3, note4];
  function explainSP(ctx, W, H_, t) {
    const cuts = [2.1, 6.0, 10.5, 13.0], D = 0.6;
    let cam = 0; cuts.forEach((c0) => { cam += H.ease.inOut(SX(t, c0, c0 + D)); });
    const camX = cam * (W + 60);
    const bg = spPaper(W, H_);
    ctx.fillStyle = '#c9c4ad'; ctx.fillRect(0, 0, W, H_);
    for (let i = 0; i < NOTES.length; i++) {
      const ox = i * (W + 60) - camX; if (ox > W || ox < -W) continue;
      // content is clipped to the inside of the rope border, so pieces slide in from under it
      ctx.save(); ctx.translate(ox, 0); ctx.drawImage(bg, 0, 0); ctx.beginPath(); ctx.rect(48, 48, W - 96, H_ - 96); ctx.clip(); NOTES[i](ctx, t); ctx.restore();
      // perforation gutter between notes
      ctx.fillStyle = '#d8d3bc'; ctx.fillRect(ox + W, 0, 60, H_);
      ctx.fillStyle = '#b9b39b'; for (let y = 6; y < H_; y += 14) { ctx.beginPath(); ctx.arc(ox + W + 30, y, 3, 0, TAU); ctx.fill(); }
    }
    if (t > 2.0) { ctx.save(); ctx.globalAlpha = H.clamp((t - 2.0) / 0.3); spHeader(ctx); ctx.restore(); }
    // a raking glint each time a note settles
    cuts.forEach((c0) => { const g = SX(t, c0 + D, c0 + D + 0.9); if (g > 0 && g < 1) { const gx = -300 + 1900 * g, lg = ctx.createLinearGradient(gx - 160, 0, gx + 160, 120); lg.addColorStop(0, 'rgba(255,255,245,0)'); lg.addColorStop(0.5, 'rgba(255,255,245,0.12)'); lg.addColorStop(1, 'rgba(255,255,245,0)'); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H_); ctx.restore(); } });
    H.vignette(ctx, W, H_, 0.15, '40,50,30');
  }

  registerStyle({
    id: 'spirograph',
    name: 'Guilloché Security Print',
    category: 'Generative & Type',
    description: 'Banknote-grade lathe work: hairline hypotrochoid rosettes and woven sine-ring meshes in split-fountain iris inks on fibred security paper, with engraved serif lettering, microtext and red serials.',
    motion: 'Like a geometric lathe plotting the plate: the underprint waves and border ropes trace on, each rosette band is drawn pen-pass by pen-pass, the engraved title is wiped in, the red serials are stamped digit by digit; then the meshes slowly counter-rotate into shimmering moiré and a light glint crosses the note.',
    fonts: ['700 46px "Libre Baskerville"', '400 15px "Libre Baskerville"', 'italic 400 15px "Libre Baskerville"', '600 20px "Cormorant Garamond"', '700 22px "Courier Prime"', '400 22px "Courier Prime"', '800 120px "Playfair Display"', '600 7px "Inter"'],
    duration: 7,
    frameT: 6.9,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'A sheet of five security-printed notes the camera pans across; the model is a lathe rosette whose passes start out of register and are brought into register by each correction, with engraved double-rule arrows, red numbering-machine counters and rubber cancellation stamps for WRONG / VERIFIED / CERTIFIED.',
    explainer(ctx, W, H_, t) { explainSP(ctx, W, H_, t); },
    // Sound: an engraving works. The rose-engine lathe hums and its stylus scratches metal while a rosette or the
    // rope chart plots (scratch density follows the draw speed); counters are a red numbering machine (metal clack per
    // step, a plunger chunk when it locks); verdicts are rubber cancellation stamps; the camera pan is the note sheet
    // sliding across the bench. Timings mirror explainSP / note0..note4 above (cuts, SX windows, ease curves).
    explainerSound(k) {
      const D = 14.5, E = H.ease;
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // lathe pass over [t0,t1] with progress ease: motor drone + stylus scratch grains, denser where the pen moves fast
      const lathe = (t0, t1, ease, g, p) => {
        const d = t1 - t0;
        k.tone(t0, { f: 58, type: 'sawtooth', dur: d + 0.15, gain: 0.05 * g, a: 0.12, hold: d - 0.15, filter: 'lowpass', f2: 260, pan: p, minor: true });
        k.tone(t0, { f: 116, type: 'triangle', dur: d + 0.15, gain: 0.025 * g, a: 0.12, hold: d - 0.15, pan: p, minor: true });
        k.withMinor(() => { for (let t = t0 + 0.02, i = 0; t < t1 - 0.02; i++) {
          const u = (t - t0) / d, sp = (ease(Math.min(1, u + 0.01)) - ease(Math.max(0, u - 0.01))) / 0.02; // relative pen speed
          k.noise(t, { dur: 0.035, filter: 'bandpass', f: 1700 + (i % 5) * 110, q: 3, gain: 0.1 * g * (0.3 + 0.5 * Math.min(1.6, sp)), a: 0.008, pan: p + Math.sin(i * 0.9) * 0.1 });
          t += 0.032;
        } });
      };
      // numbering machine: a metal clack per step of the eased count, at most `rate` per second
      const numb = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.022, filter: 'bandpass', f: 2300, q: 1.6, gain: 0.3 * g, a: 0.001, pan: p }); k.tone(t, { f: 310, type: 'triangle', dur: 0.03, gain: 0.08 * g, pan: p }); });
      const counter = (t0, t1, ease, steps, rate, p) => { let last = -1, prev = 0;
        for (let t = t0; t <= t1; t += 0.002) { const s = Math.floor(ease(H.clamp((t - t0) / (t1 - t0))) * steps); if (s !== prev && t - last >= 1 / rate) { numb(t, 0.8 + 0.3 * ((t - t0) / (t1 - t0)), p); last = t; } prev = s; } };
      const plunger = (t, g, p) => { k.play('thud', t, { f: 190, gain: 0.5 * g, pan: p }); k.noise(t + 0.005, { dur: 0.04, filter: 'bandpass', f: 1500, q: 2, gain: 0.35 * g, a: 0.001, pan: p }); };
      // camera pan: the note sheet slides along the bench (smooth, no crinkle), cuts at c0 over D = 0.6 (inOut)
      const slide = (c0) => { k.noise(c0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 380], [0.3, 900], [0.6, 420]], q: 0.8, gain: 0.16, a: 0.28 }); k.noise(c0 + 0.05, { dur: 0.5, color: 'brown', filter: 'lowpass', f: 300, gain: 0.12, a: 0.22 }); };
      // engraved label settling: a small soft press of the plate
      const tag = (t, p) => k.play('tock', t, { f: 360, gain: 0.3, pan: p, minor: true });

      k.bed('room', 0, D, { gain: 0.3 });
      k.bed('hum', 0, D, { gain: 0.08 });

      // ---- note 0: the lathe plots the rosette (0-1.9 inOut); title plate presses in (back 0.15-0.6)
      lathe(0.0, 1.9, E.inOut, 1, 0);
      const tl = when(0.15, 0.6, E.back, 1);
      k.play('press', tl, { gain: 0.5 }); k.noise(tl, { dur: 0.04, filter: 'bandpass', f: 1200, q: 1.5, gain: 0.15 });

      // ---- pan to note 1: model rosette plots 2.15-3.3, three engraved arrows, THE MODEL, numbering machine
      slide(2.1);
      lathe(2.15, 3.3, E.inOut, 0.7, pan(1000));
      [0, 1, 2].forEach((i) => k.noise(2.6 + i * 0.08, { dur: 0.4, filter: 'bandpass', f: [[0, 1300], [0.4, 1900]], q: 2.5, gain: 0.05, a: 0.1, pan: -0.4 + i * 0.05, minor: true })); // burin cuts the arrows
      tag(when(3.2, 3.5, E.back, 1), pan(1000));
      numb(2.7, 1, pan(200)); // "No. 0" printed
      // n = 10^(6 inOut(SX(t, 2.75, 5.0))) - 1
      counter(2.8, 4.98, E.inOut, 30, 11, pan(250));
      plunger(5.0, 1.2, pan(250)); // locks on 1,000,000

      // ---- pan to note 2: guess, WRONG stamp, error runs back, lathe re-indexes into register, VERIFIED
      slide(6.0);
      k.noise(6.5, { dur: 0.25, filter: 'bandpass', f: [[0, 1300], [0.25, 1900]], q: 2.5, gain: 0.06, a: 0.06, pan: pan(360), minor: true });
      k.noise(7.05, { dur: 0.2, filter: 'bandpass', f: [[0, 1300], [0.2, 1900]], q: 2.5, gain: 0.06, a: 0.05, pan: pan(840), minor: true });
      k.play('press', 7.25, { gain: 0.45, pan: pan(950) }); // DOG? appears
      tag(when(7.3, 7.55, E.back, 1), pan(990));
      k.play('stamp', 7.99, { gain: 0.9, pan: pan(1050) }); // WRONG ✗ hits (scale settles by 8.05)
      k.play('error', 8.14, { f: 'G3', gain: 0.6, pan: pan(1050) });
      // red dotted error line 8.35-8.9 (inOut): one numbering-style dab per ~1/9 of the run, right to left
      for (let i = 1; i <= 8; i++) { const tt = when(8.35, 8.9, E.inOut, i / 8); k.withMinor(() => { k.noise(tt, { dur: 0.025, filter: 'bandpass', f: 1600, q: 1.2, gain: 0.18, a: 0.001, pan: pan(1050 - i * 55) }); k.tone(tt, { f: 220, dur: 0.03, gain: 0.05, pan: pan(1050 - i * 55) }); }); }
      tag(when(8.85, 9.1, E.back, 1), pan(610));
      // ADJUST 8.9-9.45: the lathe's index wheel clicks the passes back into register, then a short clean pass
      for (let i = 0; i < 6; i++) k.play('click', 8.95 + i * 0.085, { f: 900 + i * 40, gain: 0.9, pan: pan(610), minor: true }); // even ratchet steps
      k.tone(8.9, { f: [[0, 50], [0.55, 62]], type: 'sawtooth', dur: 0.65, gain: 0.05, a: 0.1, hold: 0.4, filter: 'lowpass', f2: 300, pan: pan(610), minor: true });
      k.play('stamp', 9.83, { gain: 0.8, pan: pan(1010) }); // VERIFIED ✓
      ['C5', 'G5'].forEach((n, i) => k.play('ding', 9.96 + i * 0.08, { f: n, gain: 0.45, pan: pan(1010) }));

      // ---- pan to note 3: rope chart plotted by the lathe, numbering machine 61 -> 97, CERTIFIED
      slide(10.5);
      lathe(10.9, 12.3, E.inOut, 0.7, pan(360));
      counter(10.87, 12.28, E.inOut, 36, 9, pan(200));
      k.play('impact', 12.3, { gain: 1.15, pan: pan(250) }); // 97% punches
      plunger(12.3, 0.8, pan(250));
      k.play('stamp', 12.43, { gain: 1, pan: pan(330) }); // CERTIFIED lands
      ['C4', 'G4', 'E5'].forEach((n, i) => k.play('ding', 12.6 + i * 0.06, { f: n, gain: 0.4, pan: (i - 1) * 0.2 }));

      // ---- pan to note 4: takeaway plate presses in, resolving chime
      slide(13.0);
      const tk = when(13.3, 13.65, E.back, 1);
      k.play('press', tk, { gain: 0.55 });
      ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => k.play('ding', tk + 0.14 + i * 0.07, { f: n, gain: 0.38 - i * 0.04, pan: (i - 1.5) * 0.25 }));
    },
    draw(ctx, W, H_, t) {
      const r = H.rng(77);
      // ---------- paper ----------
      H.paper(ctx, W, H_, '#e8e4cf', 9, 0.05);
      // soft tinted underprint wash (pale green -> peach), offset printed
      let g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, 'rgba(120,170,140,0.20)'); g.addColorStop(0.5, 'rgba(200,190,140,0.10)'); g.addColorStop(1, 'rgba(220,140,120,0.18)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H_);
      // security fibres
      for (let i = 0; i < 140; i++) {
        const x = r() * W, y = r() * H_, a = r() * TAU, L = 6 + r() * 10;
        ctx.strokeStyle = r() < 0.5 ? 'rgba(200,40,60,0.55)' : 'rgba(40,80,190,0.5)';
        ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + Math.cos(a + 1) * L * 0.6, y + Math.sin(a + 1) * L * 0.6, x + Math.cos(a) * L, y + Math.sin(a) * L);
        ctx.stroke();
      }

      // ---------- background guilloché waves (fine, pale, iris inked) ----------
      ctx.save();
      ctx.lineWidth = 0.55;
      ctx.strokeStyle = iris(ctx, 0, 0, W, 0, ['rgba(40,120,100,0.40)', 'rgba(70,90,150,0.38)', 'rgba(170,70,90,0.38)']);
      for (let k = 0; k < 2; k++) {
        PR = H.ease.inOut(ph(t, k * 0.25, 0.9 + k * 0.25));
        for (let y0 = -20; y0 < H_ + 20; y0 += 7) {
          curve(ctx, 320, (u) => {
            const x = u * W;
            return [x, y0 + 4.5 * Math.sin(x / 26 + y0 / 37 + k * Math.PI + t * 0.3) + 6 * Math.sin(x / 210 + y0 / 90)];
          });
        }
      }
      PR = 1;
      ctx.restore();

      // ---------- frame band (rope guilloché) ----------
      const m = 26, bw = 30;
      const pB = ph(t, 0.4, 1.5);
      ctx.save();
      ctx.globalAlpha = H.clamp(pB * 4);
      ctx.fillStyle = 'rgba(232,228,207,0.92)';
      ctx.fillRect(m, m, W - 2 * m, bw); ctx.fillRect(m, H_ - m - bw, W - 2 * m, bw);
      ctx.fillRect(m, m, bw, H_ - 2 * m); ctx.fillRect(W - m - bw, m, bw, H_ - 2 * m);
      ctx.lineWidth = 0.6;
      const ropeInk = iris(ctx, 0, 0, W, H_, ['#1d5a48', '#2c4f7c', '#6b2f4f']);
      ctx.strokeStyle = ropeInk;
      const side = (x0, y0, x1, y1) => {
        const L = Math.hypot(x1 - x0, y1 - y0), tx = (x1 - x0) / L, ty = (y1 - y0) / L, nx = -ty, ny = tx;
        for (let k = 0; k < 7; k++) {
          curve(ctx, Math.floor(L / 2), (u) => {
            const s = u * L, off = (bw / 2 - 2) * Math.sin(s / 9 + (k / 7) * Math.PI);
            return [x0 + tx * s + nx * off, y0 + ty * s + ny * off];
          });
        }
      };
      PR = H.ease.inOut(pB);
      side(m, m + bw / 2, W - m, m + bw / 2);
      side(m, H_ - m - bw / 2, W - m, H_ - m - bw / 2);
      side(m + bw / 2, m, m + bw / 2, H_ - m);
      side(W - m - bw / 2, m, W - m - bw / 2, H_ - m);
      PR = 1;
      ctx.globalAlpha = H.clamp(pB * 2 - 1);
      ctx.strokeStyle = '#1f3f3a'; ctx.lineWidth = 1.2;
      ctx.strokeRect(m - 0.5, m - 0.5, W - 2 * m + 1, H_ - 2 * m + 1);
      ctx.lineWidth = 0.7; ctx.strokeRect(m + bw + 3, m + bw + 3, W - 2 * (m + bw + 3), H_ - 2 * (m + bw + 3));
      ctx.restore();

      // ---------- main rosette ----------
      const RX = 400, RY = 368, RR = 238;
      const pR = ph(t, 1.4, 4.0);
      ctx.save();
      ctx.globalAlpha = H.clamp(t - 0.9);
      ctx.fillStyle = 'rgba(236,232,212,0.85)';
      ctx.beginPath(); ctx.arc(RX, RY, (RR + 6) * (0.36 + 0.64 * H.clamp((pR - 0.08) / 0.92)), 0, TAU); ctx.fill();
      ctx.restore();
      rosette(ctx, RX, RY, RR,
        iris(ctx, RX - RR, RY - RR, RX + RR, RY + RR, ['#145243', '#1f6b6a', '#2f4f8f', '#5a2f6e']),
        iris(ctx, RX, RY - RR, RX, RY + RR, ['#b24a2c', '#c98a3a', '#9a3d5e']), t,
        { n1: 40, K1: 8, lobes: 22, loop: 3.2, copies: 5, K2: 6, lw: 0.55, p: pR });
      // fine radial engraving burst between lace and medallion
      ctx.save(); ctx.strokeStyle = 'rgba(23,62,56,0.55)'; ctx.lineWidth = 0.45;
      const nb = Math.floor(360 * ph(t, 1.2, 1.6));
      for (let i = 0; i < nb; i++) { const a = (i / 360) * TAU; ctx.beginPath(); ctx.moveTo(RX + Math.cos(a) * 84, RY + Math.sin(a) * 84); ctx.lineTo(RX + Math.cos(a) * (92 + 4 * Math.sin(i * 0.7)), RY + Math.sin(a) * (92 + 4 * Math.sin(i * 0.7))); ctx.stroke(); }
      ctx.restore();

      // medallion: engraved chip in a hatched oval, cut from the centre outward
      const MR = 70;
      const pM = ph(t, 0.9, 1.4);
      ctx.save();
      ctx.beginPath(); ctx.arc(RX, RY, Math.max(0.1, (MR + 6) * H.ease.out(pM)), 0, TAU); ctx.clip();
      ctx.save();
      ctx.beginPath(); ctx.arc(RX, RY, MR, 0, TAU); ctx.fillStyle = '#ebe6cf'; ctx.fill();
      ctx.clip();
      // engraved line-shading background (concentric fine circles = lathe ground)
      ctx.strokeStyle = 'rgba(25,60,55,0.75)'; ctx.lineWidth = 0.5;
      for (let rr = 4; rr < MR; rr += 2.2) { ctx.beginPath(); ctx.arc(RX, RY, rr, 0, TAU); ctx.stroke(); }
      // chip body
      const cs = 64;
      ctx.fillStyle = '#ebe6cf'; ctx.fillRect(RX - cs / 2 - 6, RY - cs / 2 - 6, cs + 12, cs + 12);
      ctx.strokeStyle = '#173e38'; ctx.lineWidth = 1.4;
      ctx.strokeRect(RX - cs / 2, RY - cs / 2, cs, cs);
      // horizontal engraved hatching inside chip (tone), denser lower-right for shading
      ctx.lineWidth = 0.6;
      for (let y = RY - cs / 2 + 3; y < RY + cs / 2; y += 2.4) {
        ctx.beginPath(); ctx.moveTo(RX - cs / 2 + 3, y); ctx.lineTo(RX + cs / 2 - 3, y); ctx.stroke();
      }
      ctx.fillStyle = '#ebe6cf'; ctx.fillRect(RX - 17, RY - 17, 34, 34);
      ctx.lineWidth = 1.1; ctx.strokeRect(RX - 17, RY - 17, 34, 34);
      ctx.font = '600 20px "Cormorant Garamond"'; ctx.fillStyle = '#173e38'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('AI', RX, RY + 1);
      // pins
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 6; i++) {
        const o = -cs / 2 + 8 + i * ((cs - 16) / 5);
        ctx.beginPath(); ctx.moveTo(RX + o, RY - cs / 2); ctx.lineTo(RX + o, RY - cs / 2 - 7); ctx.moveTo(RX + o, RY + cs / 2); ctx.lineTo(RX + o, RY + cs / 2 + 7);
        ctx.moveTo(RX - cs / 2, RY + o); ctx.lineTo(RX - cs / 2 - 7, RY + o); ctx.moveTo(RX + cs / 2, RY + o); ctx.lineTo(RX + cs / 2 + 7, RY + o); ctx.stroke();
      }
      ctx.restore();
      ctx.save(); ctx.strokeStyle = '#173e38'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(RX, RY, MR, 0, TAU); ctx.stroke();
      ctx.lineWidth = 0.6; ctx.beginPath(); ctx.arc(RX, RY, MR + 4, 0, TAU); ctx.stroke(); ctx.restore();
      ctx.restore();
      // microtext ring
      const micro = 'ARTIFICIAL INTELLIGENCE • NEURAL RESERVE • ';
      ctx.save(); ctx.font = '600 7px "Inter"'; ctx.fillStyle = '#173e38'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const mr = MR + 10, nRep = Math.round((TAU * mr) / 5.2 / micro.length), nCh = nRep * micro.length;
      const nShow = Math.floor(nCh * ph(t, 1.3, 1.9));
      for (let i = 0; i < nShow; i++) {
        const a = (i / nCh) * TAU - Math.PI / 2;
        ctx.save(); ctx.translate(RX + Math.cos(a) * mr, RY + Math.sin(a) * mr); ctx.rotate(a + Math.PI / 2);
        ctx.fillText(micro[i % micro.length], 0, 0); ctx.restore();
      }
      ctx.restore();

      // ---------- corner rosettes with value numerals ----------
      const corners = [[m + bw + 54, m + bw + 54], [W - m - bw - 54, m + bw + 54], [m + bw + 54, H_ - m - bw - 54], [W - m - bw - 54, H_ - m - bw - 54]];
      corners.forEach(([x, y], i) => {
        if (i === 0) return; // top-left sits under the main rosette's halo — keep it clean
        const pc = ph(t, 1.8 + i * 0.35, 3.2 + i * 0.35);
        if (pc <= 0) return;
        ctx.save(); ctx.fillStyle = 'rgba(236,232,212,0.9)'; ctx.beginPath(); ctx.arc(x, y, 52 * (0.4 + 0.6 * H.ease.inOut(H.clamp(pc / 0.85))), 0, TAU); ctx.fill(); ctx.restore();
        rosette(ctx, x, y, 50, iris(ctx, x - 50, y, x + 50, y, ['#1d5a48', '#3a3f86']), '#a8553a', t, { n1: 16, K1: 5, lobes: 10, loop: 2.2, copies: 3, K2: 4, lw: 0.5, p: pc });
        ctx.save(); ctx.globalAlpha = H.clamp(pc * 6); ctx.fillStyle = '#ebe6cf'; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#173e38'; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.font = '700 26px "Libre Baskerville"'; ctx.fillStyle = '#173e38'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('1', x, y + 1); ctx.restore();
      });

      // ---------- security thread (windowed) ----------
      const sx = 700;
      const thrY = m + bw + 6 + (H_ - 2 * (m + bw)) * H.ease.inOut(ph(t, 0.9, 1.6));
      for (let y = m + bw + 6; y < Math.min(thrY, H_ - m - bw - 6); y += 36) {
        const gg = ctx.createLinearGradient(sx - 4, 0, sx + 4, 0);
        gg.addColorStop(0, '#8d8f93'); gg.addColorStop(0.45, '#e9edf0'); gg.addColorStop(0.55, '#b9bcc0'); gg.addColorStop(1, '#6d7074');
        ctx.fillStyle = gg; ctx.fillRect(sx - 4, y, 8, 20);
        ctx.save(); ctx.translate(sx, y + 10); ctx.rotate(Math.PI / 2);
        ctx.font = '600 7px "Inter"'; ctx.fillStyle = 'rgba(40,40,45,0.8)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('AI•1B', 0, 0); ctx.restore();
      }

      // ---------- right panel: engraved title ----------
      const TX = 1000;
      ctx.save();
      // engraved panel is wiped in left->right as the intaglio plate is pressed
      ctx.beginPath(); ctx.rect(0, 0, 760 + 500 * H.ease.inOut(ph(t, 4.2, 5.1)), 140 + 0); ctx.rect(0, 140, 760 + 500 * H.ease.inOut(ph(t, 4.3, 5.2)), 200); ctx.clip();
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.font = 'italic 400 15px "Libre Baskerville"'; ctx.fillStyle = '#23463f';
      ctx.fillText('Certificate of the Neural Reserve', TX, 152);
      // engraved headline: fill with fine horizontal line-shading, outlined
      const title = ['ONE BILLION', 'PARAMETERS'];
      ctx.font = '700 46px "Libre Baskerville"';
      title.forEach((ln, li) => {
        const y = 214 + li * 56;
        ctx.save();
        try { ctx.letterSpacing = '3px'; } catch (e) {}
        // shadow line (engraver's drop shade)
        ctx.fillStyle = 'rgba(60,40,50,0.35)'; ctx.fillText(ln, TX + 2, y + 2);
        ctx.fillStyle = '#173e38'; ctx.fillText(ln, TX, y);
        // hairline cuts through letters (engraved texture)
        ctx.globalCompositeOperation = 'source-atop';
        ctx.restore();
      });
      // engrave lines over title via clip of text path is not available; instead overlay lines in paper colour, masked by a layer
      const lay = H.layer(W, H_), lc = lay.getContext('2d');
      lc.font = '700 46px "Libre Baskerville"'; lc.textAlign = 'center';
      try { lc.letterSpacing = '3px'; } catch (e) {}
      lc.fillStyle = '#000'; title.forEach((ln, li) => lc.fillText(ln, TX, 214 + li * 56));
      lc.globalCompositeOperation = 'source-atop'; lc.strokeStyle = 'rgba(232,228,207,0.75)'; lc.lineWidth = 0.7;
      for (let y = 160; y < 290; y += 2.6) { lc.beginPath(); lc.moveTo(700, y); lc.lineTo(1300, y); lc.stroke(); }
      ctx.save(); ctx.beginPath(); ctx.rect(0, 140, 760 + 500 * H.ease.inOut(ph(t, 4.3, 5.2)), 200); ctx.clip(); ctx.drawImage(lay, 0, 0); ctx.restore();
      // rule + engraved label
      ctx.strokeStyle = '#23463f'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(TX - 170, 300); ctx.lineTo(TX + 170, 300); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(TX - 150, 304); ctx.lineTo(TX + 150, 304); ctx.stroke();
      ctx.font = '400 15px "Libre Baskerville"'; ctx.fillStyle = '#23463f';
      try { ctx.letterSpacing = '4px'; } catch (e) {}
      ctx.fillText('LEGAL TENDER FOR ALL COMPUTE', TX, 330);
      ctx.restore();

      // second rosette, lower right, with large lathe numeral
      const BX = 960, BY = 486;
      const pE = ph(t, 2.8, 4.0), pN = ph(t, 3.9, 4.5);
      ctx.save(); ctx.globalAlpha = H.ease.inOut(H.clamp(pE * 1.4)); ctx.fillStyle = 'rgba(236,232,212,0.8)'; ctx.beginPath(); ctx.ellipse(BX, BY, 176, 98, 0, 0, TAU); ctx.fill(); ctx.restore();
      ctx.save(); ctx.lineWidth = 0.55; ctx.strokeStyle = iris(ctx, BX - 200, BY, BX + 200, BY, ['#6a2f6a', '#2f4f8f', '#145243']);
      PR = H.ease.inOut(pE);
      for (let k = 0; k < 14; k++) {
        curve(ctx, 1200, (u) => {
          const a = u * TAU;
          const s = 1 + 0.09 * Math.sin(28 * a + (k / 14) * TAU + t * 0.1) ;
          return [BX + 168 * s * Math.cos(a), BY + 90 * s * Math.sin(a)];
        });
      }
      PR = 1;
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = H.clamp(pN * 5);
      ctx.fillStyle = '#ebe6cf'; ctx.beginPath(); ctx.ellipse(BX, BY, 132, 72, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#173e38'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.ellipse(BX, BY, 138, 77, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(BX, BY, 132, 72, 0, 0, TAU);
      ctx.strokeStyle = '#173e38'; ctx.lineWidth = 1; ctx.stroke();
      {
        const nl = H.layer(W, H_), nc = nl.getContext('2d');
        nc.font = '800 104px "Playfair Display"'; nc.textAlign = 'center'; nc.textBaseline = 'middle';
        nc.fillStyle = '#000'; nc.fillText('10⁹', BX, BY + 8);
        nc.globalCompositeOperation = 'source-in';
        nc.fillStyle = '#ebe6cf'; nc.fillRect(0, 0, W, H_); nc.globalCompositeOperation = 'source-atop';
        nc.strokeStyle = '#173e38'; nc.lineWidth = 1.25;
        for (let y = BY - 70; y < BY - 70 + 140 * pN; y += 2.0) { nc.beginPath(); nc.moveTo(BX - 160, y); nc.lineTo(BX + 160, y + 8); nc.stroke(); }
        ctx.drawImage(nl, 0, 0);
        ctx.globalAlpha = H.clamp(pN * 2 - 1);
        ctx.lineWidth = 1.6; ctx.strokeStyle = '#173e38'; ctx.font = '800 104px "Playfair Display"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeText('10⁹', BX, BY + 8);
      }
      ctx.restore();

      // ---------- serial numbers (letterpress red) ----------
      ctx.save();
      ctx.font = '700 22px "Courier Prime"'; ctx.fillStyle = '#b3262b';
      try { ctx.letterSpacing = '2px'; } catch (e) {}
      const SER = 'AI 0428 1937 B', tq = Math.floor(t * 15) / 15;
      const n1 = Math.floor(SER.length * ph(tq, 5.0, 5.5)), n2 = Math.floor(SER.length * ph(tq, 5.2, 5.7));
      ctx.fillText(SER.slice(0, n1), 790, 120);
      ctx.save(); ctx.translate(196, 652); ctx.fillText(SER.slice(0, n2), 0, 0); ctx.restore();
      ctx.restore();

      // ---------- print finish: ink spread / paper tooth ----------
      // hold: a soft raking-light glint travels across the note
      const gl = ph(t, 5.5, 6.6);
      if (gl > 0 && gl < 1) {
        const gx = -300 + 1900 * gl;
        const lg = ctx.createLinearGradient(gx - 160, 0, gx + 160, 120);
        lg.addColorStop(0, 'rgba(255,255,245,0)'); lg.addColorStop(0.5, 'rgba(255,255,245,0.16)'); lg.addColorStop(1, 'rgba(255,255,245,0)');
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H_); ctx.restore();
      }
      H.grain(ctx, W, H_, 0.045, 31 + Math.floor(t * 12));
      H.vignette(ctx, W, H_, 0.15, '40,50,30');
    },
  });
}
