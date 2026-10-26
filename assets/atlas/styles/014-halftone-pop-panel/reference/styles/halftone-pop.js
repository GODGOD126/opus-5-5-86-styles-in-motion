{
  // ---------- Lichtenstein pop-art comic panel ----------
  const C = { red: '#e2231a', blue: '#1f5fbf', yellow: '#ffd51f', black: '#141210', white: '#fbf6ea' };

  // Ben-Day dot field inside the current clip (staggered grid)
  const benday = (x, color, s, r, x0, y0, x1, y1, seed, rgain) => {
    const rr = H.rng(seed);
    x.fillStyle = color; x.beginPath();
    for (let j = 0, y = y0; y < y1 + s; j++, y += s * 0.5) {
      const off = (j & 1) ? s * 0.5 : 0;
      for (let xx = x0 + off; xx < x1 + s; xx += s) {
        const g = rgain ? rgain(xx, y) : 1;
        const rad = r * g * (1 + (rr() - 0.5) * 0.08);
        if (rad < 0.4) continue;
        const px = xx + (rr() - 0.5) * 0.6, py = y + (rr() - 0.5) * 0.6;
        x.moveTo(px + rad, py); x.arc(px, py, rad, 0, Math.PI * 2);
      }
    }
    x.fill();
  };

  // ---------- robot head geometry (local coords) ----------
  const headPath = (x) => {
    x.beginPath(); x.moveTo(-238, -70);
    x.bezierCurveTo(-240, -255, -125, -325, 0, -325);
    x.bezierCurveTo(125, -325, 240, -255, 238, -70);
    x.lineTo(228, 170); x.quadraticCurveTo(218, 262, 120, 292);
    x.lineTo(-120, 292); x.quadraticCurveTo(-218, 262, -228, 170); x.closePath();
  };
  const facePath = (x) => {
    x.beginPath(); x.moveTo(-180, -150);
    x.quadraticCurveTo(-182, -205, -120, -208); x.lineTo(120, -208); x.quadraticCurveTo(182, -205, 180, -150);
    x.lineTo(172, 150); x.quadraticCurveTo(165, 240, 80, 252); x.lineTo(-80, 252); x.quadraticCurveTo(-165, 240, -172, 150); x.closePath();
  };
  const eye = (x, cx, cy, sgn) => { x.beginPath(); x.ellipse(cx, cy, 64, 50, sgn * 0.08, 0, Math.PI * 2); };
  const tearPath = (x, cx, cy, s) => {
    x.beginPath(); x.moveTo(cx, cy - 46 * s);
    x.bezierCurveTo(cx + 8 * s, cy - 20 * s, cx + 26 * s, cy, cx + 26 * s, cy + 16 * s);
    x.arc(cx, cy + 16 * s, 26 * s, 0, Math.PI);
    x.bezierCurveTo(cx - 26 * s, cy, cx - 8 * s, cy - 20 * s, cx, cy - 46 * s); x.closePath();
  };
  const mouthPath = (x) => {
    x.beginPath(); x.moveTo(-78, 186); x.quadraticCurveTo(0, 150, 78, 186);
    x.lineTo(70, 216); x.quadraticCurveTo(0, 186, -70, 216); x.closePath();
  };

  const bubblePath = (x) => {
    x.beginPath();
    x.ellipse(330, 318, 262, 150, -0.04, 0.78, Math.PI * 2 + 0.5);
    x.lineTo(588, 600); x.closePath();
  };

  // ================= EXPLAINER: a comic page read panel by panel =================
  const PE = H.ease, pcl = H.clamp, pseg = (t, a, b) => pcl((t - a) / (b - a));
  const PPW = 1200, PPH = 660, PG = 44;
  const pX = (i) => i * (PPW + PG);

  // robot head drawn on colour (c) + key (k) plates; mood: think | eat | sad | happy
  const robot = (c, k, cx, cy, s, rot, mood, t, opt = {}) => {
    for (const [x, isKey] of [[c, false], [k, true]]) {
      x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(s, s);
      x.lineJoin = 'round'; x.lineCap = 'round';
      if (!isKey) {
        x.fillStyle = C.yellow; headPath(x); x.fill();
        // orange Ben-Day shade band down the shell's right side (as in the hero still)
        x.save(); headPath(x); x.clip();
        x.beginPath(); x.moveTo(160, -320); x.bezierCurveTo(150, -150, 150, 60, 170, 320); x.lineTo(320, 320); x.lineTo(320, -320); x.closePath(); x.clip();
        benday(x, C.red, 12, 3.3, 100, -340, 320, 340, 12);
        x.restore();
        x.save(); facePath(x); x.clip(); x.fillStyle = C.white; x.fillRect(-300, -300, 600, 600); benday(x, C.red, 16, 3.7, -260, -260, 260, 300, 8); x.restore();
        x.fillStyle = C.white; x.beginPath(); x.moveTo(-226, -60); x.bezierCurveTo(-226, -200, -160, -270, -90, -300); x.bezierCurveTo(-150, -250, -196, -170, -200, -60); x.closePath(); x.fill();
        for (const [ex, sg] of [[-88, -1], [92, 1]]) { x.fillStyle = C.white; eye(x, ex, -30, sg); x.fill(); x.save(); eye(x, ex, -30, sg); x.clip(); x.fillStyle = C.blue; x.beginPath(); x.arc(ex + (opt.look || [8, -8])[0], -30 + (opt.look || [8, -8])[1], 34, 0, 7); x.fill(); x.restore(); }
        // blue-dot eye-shadow lids (Lichtenstein make-up, matches the hero)
        for (const [ex, sg] of [[-88, -1], [92, 1]]) {
          x.save(); x.beginPath(); x.ellipse(ex, -48, 74, 40, sg * 0.1, Math.PI, Math.PI * 2); x.closePath(); x.clip();
          x.fillStyle = C.white; x.fillRect(ex - 90, -120, 180, 70);
          benday(x, C.blue, 10, 3.4, ex - 100, -130, ex + 100, -40, 21 + ex);
          x.restore();
        }
        x.fillStyle = C.red; x.beginPath(); x.arc(0, -392, 30, 0, 7); x.fill();
        for (const sx of [-1, 1]) { x.beginPath(); x.arc(sx * 262, -10, 46, 0, 7); x.fill(); }
      } else {
        x.strokeStyle = C.black; x.fillStyle = C.black;
        x.lineWidth = 12; x.beginPath(); x.moveTo(0, -325); x.lineTo(0, -362); x.stroke();
        x.lineWidth = 9; x.beginPath(); x.arc(0, -392, 30, 0, 7); x.stroke();
        x.fillStyle = C.white; x.beginPath(); x.ellipse(-10, -402, 9, 6, -0.6, 0, 7); x.fill(); x.fillStyle = C.black;
        for (const sx of [-1, 1]) {
          x.lineWidth = 9; x.beginPath(); x.arc(sx * 262, -10, 46, 0, 7); x.stroke();
          x.lineWidth = 5; x.beginPath(); x.arc(sx * 262, -10, 22, 0, 7); x.stroke();
          const sp = opt.spin || 0; x.lineWidth = 8; x.beginPath(); x.moveTo(sx * 262 + Math.cos(sp) * 30, -10 + Math.sin(sp) * 30); x.lineTo(sx * 262 - Math.cos(sp) * 30, -10 - Math.sin(sp) * 30); x.stroke();
        }
        x.save(); headPath(x); x.clip();
        x.beginPath(); x.moveTo(252, -300); x.bezierCurveTo(222, -170, 214, 40, 226, 300); x.lineTo(320, 300); x.lineTo(320, -300); x.closePath(); x.fill();
        x.beginPath(); x.moveTo(-150, -296); x.bezierCurveTo(-60, -318, 70, -318, 150, -290); x.bezierCurveTo(70, -300, -50, -298, -150, -282); x.closePath(); x.fill();
        x.restore();
        // fat brush outlines, doubled with a slight offset like the hero's inking
        x.lineWidth = 13; headPath(x); x.stroke();
        x.save(); x.translate(5, 4); x.lineWidth = 10; headPath(x); x.stroke(); x.restore();
        x.lineWidth = 9; facePath(x); x.stroke();
        x.save(); x.translate(-4, 3); x.lineWidth = 6; facePath(x); x.stroke(); x.restore();
        for (const [rx, ry] of [[-208, -150], [-206, 100], [204, -150], [200, 100], [-60, -270], [60, -270]]) { x.beginPath(); x.arc(rx, ry, 7, 0, 7); x.fill(); }
        for (const [ex, sg] of [[-88, -1], [92, 1]]) {
          const lk = opt.look || [8, -8];
          x.lineWidth = 8; eye(x, ex, -30, sg); x.stroke();
          x.save(); eye(x, ex, -30, sg); x.clip(); x.beginPath(); x.arc(ex + lk[0], -30 + lk[1], 15, 0, 7); x.fill();
          x.fillStyle = C.white; x.beginPath(); x.ellipse(ex + lk[0] - 14, -30 + lk[1] - 16, 10, 7, -0.5, 0, 7); x.fill(); x.fillStyle = C.black; x.restore();
        }
        // brows by mood
        const browY = mood === 'happy' ? -128 : -118;
        for (const sg of [-1, 1]) {
          x.lineWidth = 14; x.beginPath();
          if (mood === 'sad') { x.moveTo(sg * 165, -100); x.quadraticCurveTo(sg * 100, -150, sg * 36, -150); }
          else if (mood === 'think' && sg > 0) { x.moveTo(36, -150); x.quadraticCurveTo(100, -175, 165, -140); }
          else { x.moveTo(sg * 160, browY + 10); x.quadraticCurveTo(sg * 100, browY - 18, sg * 40, browY); }
          x.stroke();
        }
        // mouth
        x.lineWidth = 12;
        if (mood === 'happy') { x.beginPath(); x.moveTo(-80, 160); x.quadraticCurveTo(0, 235, 80, 160); x.quadraticCurveTo(0, 200, -80, 160); x.fill(); x.stroke(); }
        else if (mood === 'eat') { const o = 30 + 16 * Math.abs(Math.sin(t * 9)); x.beginPath(); x.ellipse(0, 180, 60, o, 0, 0, 7); x.fill(); }
        else if (mood === 'sad') { mouthPath(x); x.fill(); }
        else { x.beginPath(); x.moveTo(-60, 185); x.lineTo(50, 175); x.stroke(); }
      }
      x.restore();
    }
  };

  // comic devices
  const box = (c, k, x0, y0, w, h, fill, txt, size, t0, t) => {
    if (t < t0) return;
    const u = PE.back(pseg(t, t0, t0 + 0.25)), dx = (1 - u) * -w;
    c.fillStyle = fill; c.fillRect(x0 + dx, y0, w, h);
    k.lineWidth = 6; k.strokeStyle = C.black; k.strokeRect(x0 + dx, y0, w, h);
    k.fillStyle = C.black; k.font = `400 ${size}px "Bangers"`; k.letterSpacing = '1.5px'; k.textAlign = 'left'; k.textBaseline = 'middle';
    k.fillText(txt, x0 + dx + 16, y0 + h / 2 + 2); k.letterSpacing = '0px';
  };
  const balloon = (c, k, cx, cy, rx, ry, tx, ty, sc) => {
    if (sc <= 0) return;
    const path = (x) => { x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 7); };
    const tail = (x) => { const a = Math.atan2(ty - cy, tx - cx); x.beginPath(); x.moveTo(cx + Math.cos(a - 0.22) * rx * 0.9, cy + Math.sin(a - 0.22) * ry * 0.9); x.lineTo(tx, ty); x.lineTo(cx + Math.cos(a + 0.22) * rx * 0.9, cy + Math.sin(a + 0.22) * ry * 0.9); x.closePath(); };
    for (const x of [c, k]) { x.save(); x.translate(cx, cy); x.scale(sc, sc); x.translate(-cx, -cy); }
    k.lineWidth = 8; k.strokeStyle = C.black; tail(k); k.stroke(); path(k); k.stroke();
    c.fillStyle = C.white; path(c); c.fill(); tail(c); c.fill();
    k.fillStyle = '#fff'; k.save(); k.globalCompositeOperation = 'destination-out'; path(k); k.fill(); k.restore();
    k.fillStyle = C.black; k.lineWidth = 8;
    // re-stroke ellipse (tail join hidden by fill)
    path(k); k.stroke();
    k.save(); k.globalCompositeOperation = 'destination-out'; k.beginPath(); k.ellipse(cx, cy, rx - 4, ry - 4, 0, 0, 7); k.fill(); k.restore();
    for (const x of [c, k]) x.restore();
  };
  const burstPath = (x, cx, cy, r, n, seed) => { const rr = H.rng(seed); x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, R = i % 2 ? r * rr.range(0.6, 0.72) : r * rr.range(0.92, 1.12); x.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); } x.closePath(); };
  const burst = (c, k, cx, cy, r, sc, fill, seed) => {
    if (sc <= 0) return;
    c.fillStyle = fill; burstPath(c, cx, cy, r * sc, 14, seed); c.fill();
    k.lineWidth = 8; k.strokeStyle = C.black; k.lineJoin = 'miter'; burstPath(k, cx, cy, r * sc, 14, seed); k.stroke(); k.lineJoin = 'round';
  };
  const say = (k, txt, size, x, y, sc = 1, align = 'center', rot = 0) => {
    if (sc <= 0) return;
    k.save(); k.translate(x, y); k.rotate(rot); k.scale(sc, sc); k.fillStyle = C.black; k.font = `400 ${size}px "Bangers"`; k.letterSpacing = '2px'; k.textAlign = align; k.textBaseline = 'middle'; k.fillText(txt, 0, 0); k.letterSpacing = '0px'; k.restore();
  };
  // lettering knocked out of whatever is behind it: a white halo on both plates (breaks dots, arrow fills and key lines)
  const sayK = (c, k, txt, size, x, y, sc = 1, align = 'center', rot = 0, halo = 12) => {
    if (sc <= 0) return;
    for (const x_ of [c, k]) {
      x_.save(); x_.translate(x, y); x_.rotate(rot); x_.scale(sc, sc); x_.font = `400 ${size}px "Bangers"`; x_.letterSpacing = '2px'; x_.textAlign = align; x_.textBaseline = 'middle';
      x_.lineJoin = 'round'; x_.lineWidth = halo; x_.strokeStyle = C.white; x_.strokeText(txt, 0, 0); x_.letterSpacing = '0px'; x_.restore();
    }
    say(k, txt, size, x, y, sc, align, rot);
  };
  const popIn = (t, t0) => (t < t0 ? 0 : 1 + 0.3 * (1 - PE.out(pseg(t, t0, t0 + 0.16))) * (t - t0 < 0.16 ? 1 : 0));
  // fat comic arrow along a quadratic, drawn on with progress u (yellow fill, black outline)
  const fatArrow = (c, k, p0, cp, p1, u, w, fill) => {
    if (u <= 0) return;
    const q = (s) => [(1 - s) * (1 - s) * p0[0] + 2 * (1 - s) * s * cp[0] + s * s * p1[0], (1 - s) * (1 - s) * p0[1] + 2 * (1 - s) * s * cp[1] + s * s * p1[1]];
    const N = 24, L = [], R = [], end = u * 0.86;
    for (let i = 0; i <= N; i++) { const s = (i / N) * end, a = q(s), b = q(Math.min(1, s + 0.01)); let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const ww = w * (0.6 + 0.4 * (i / N)) / 2; L.push([a[0] - dy * ww, a[1] + dx * ww]); R.push([a[0] + dy * ww, a[1] - dx * ww]); }
    const e = q(end), tip = q(Math.min(1, end + 0.14)); let dx = tip[0] - e[0], dy = tip[1] - e[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const hw = w * 1.1;
    const path = (x) => { x.beginPath(); x.moveTo(L[0][0], L[0][1]); L.forEach((p) => x.lineTo(p[0], p[1])); x.lineTo(e[0] - dy * hw, e[1] + dx * hw); x.lineTo(tip[0], tip[1]); x.lineTo(e[0] + dy * hw, e[1] - dx * hw); for (let i = R.length - 1; i >= 0; i--) x.lineTo(R[i][0], R[i][1]); x.closePath(); };
    c.fillStyle = fill; path(c); c.fill(); k.lineWidth = 6; k.strokeStyle = C.black; k.lineJoin = 'round'; path(k); k.stroke();
    return q(0.5);
  };
  // labelled training photo (comic style)
  const photo = (c, k, cx, cy, s, kind, label, rot) => {
    for (const x of [c, k]) { x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(s / 100, s / 100); }
    c.fillStyle = C.white; c.fillRect(-50, -60, 100, 120); c.fillStyle = C.yellow; c.fillRect(-50, 30, 100, 30);
    benday(c, C.blue, 9, 2.4, -46, -56, 46, 24, 4);
    c.fillStyle = C.white; c.beginPath(); c.arc(0, -16, 30, 0, 7); c.fill();
    k.lineWidth = 4; k.strokeStyle = C.black; k.fillStyle = C.black; k.strokeRect(-50, -60, 100, 120); k.beginPath(); k.moveTo(-50, 30); k.lineTo(50, 30); k.stroke();
    k.lineWidth = 3.5; k.beginPath(); k.arc(0, -16, 28, 0, 7); k.stroke();
    if (kind === 'cat') { k.beginPath(); k.moveTo(-24, -28); k.lineTo(-22, -54); k.lineTo(-6, -42); k.moveTo(24, -28); k.lineTo(22, -54); k.lineTo(6, -42); k.stroke(); k.beginPath(); for (const sg of [-1, 1]) { k.moveTo(sg * 8, -8); k.lineTo(sg * 38, -10); k.moveTo(sg * 8, -4); k.lineTo(sg * 36, 0); } k.stroke(); }
    else { for (const sg of [-1, 1]) { k.beginPath(); k.ellipse(sg * 28, -14, 8, 18, sg * 0.4, 0, 7); k.fill(); } k.beginPath(); k.ellipse(0, -6, 6, 4, 0, 0, 7); k.fill(); }
    k.beginPath(); k.arc(-9, -20, 3.2, 0, 7); k.arc(9, -20, 3.2, 0, 7); k.fill();
    k.font = '400 26px "Bangers"'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText(label, 0, 46);
    for (const x of [c, k]) x.restore();
  };
  const speedLines = (k, x0, y0, len, n, seed) => { const r = H.rng(seed); k.lineWidth = 3; k.strokeStyle = C.black; k.lineCap = 'round'; for (let i = 0; i < n; i++) { const yy = y0 + r.range(-50, 50), l = len * r.range(0.5, 1); k.beginPath(); k.moveTo(x0 - 70, yy); k.lineTo(x0 - 70 - l, yy); k.stroke(); } };

  const panel = (c, k, i, t, bg) => {
    const x0 = pX(i);
    c.save(); c.translate(x0, 0); c.beginPath(); c.rect(0, 0, PPW, PPH); c.clip();
    k.save(); k.translate(x0, 0); k.beginPath(); k.rect(0, 0, PPW, PPH); k.clip();
    bg(c, k);
    return () => { c.restore(); k.restore(); k.save(); k.translate(x0, 0); k.lineWidth = 9; k.strokeStyle = C.black; k.strokeRect(0, 0, PPW, PPH); k.restore(); };
  };
  const fmtN = (n) => Math.round(n).toLocaleString('en-US');

  const PANELS = [
    // 1 HOOK
    (c, k, t) => {
      const done = panel(c, k, 0, t, (c) => { c.fillStyle = C.white; c.fillRect(0, 0, PPW, PPH); benday(c, C.blue, 17, 5.2, -10, -10, PPW, PPH, 3, (x, y) => 0.75 + 0.3 * H.smooth(0, 1400, x + y * 0.4)); });
      robot(c, k, 860, 470, 0.82, -0.08, 'think', t, { look: [-14, -16] });
      box(c, k, 22, 20, 420, 60, C.yellow, 'MEANWHILE, IN THE LAB...', 30, 0.1, t);
      balloon(c, k, 330, 300, 290, 165, 600, 430, PE.back(pseg(t, 0.35, 0.6)));
      say(k, 'HOW DOES', 84, 330, 255, popIn(t, 0.55)); say(k, 'AI LEARN?', 92, 330, 345, popIn(t, 0.85));
      const bob = Math.floor(t * 6) % 2 ? -6 : 0;
      if (t > 1.1) { say(k, '?', 90, 1040, 120 + bob, 1, 'center', 0.2); say(k, '?', 64, 1110, 190 - bob, 1, 'center', 0.35); }
      done();
    },
    // 2 DATA
    (c, k, t) => {
      const done = panel(c, k, 1, t, (c) => { c.fillStyle = C.yellow; c.fillRect(0, 0, PPW, PPH); benday(c, C.red, 18, 5.4, -10, -10, PPW, PPH, 5, (x, y) => H.smooth(700, 50, Math.hypot(x - 980, y - 330))); });
      robot(c, k, 1000, 370, 0.6, -0.05, 'eat', t, { look: [-20, 0] });
      // stream of labelled examples, faster and faster
      for (let j = 0, t0 = 2.75; j < 26; j++, t0 += Math.max(0.1, 0.34 - j * 0.02)) {
        const u = pseg(t, t0, t0 + 1.1); if (u <= 0 || u >= 1) continue;
        const e = u * u * 0.4 + u * 0.6, x = -80 + e * 1020, y = 300 + Math.sin(j * 1.7) * 90 * (1 - e), kind = j % 3 === 1 ? 'dog' : 'cat';
        speedLines(k, x, y, 120, 3, j);
        photo(c, k, x, y, 130 * (1 - e * 0.55), kind, kind.toUpperCase(), Math.sin(j * 2.3) * 0.25);
      }
      box(c, k, 22, 20, 470, 60, C.white, 'STEP 1: STUDY EXAMPLES', 32, 2.55, t);
      const bs = PE.back(pseg(t, 2.9, 3.15));
      burst(c, k, 250, 540, 175, bs, C.white, 7);
      if (bs > 0) { sayK(c, k, fmtN(1e6 * Math.pow(pseg(t, 3.0, 5.4), 2.3)), 68, 250, 524, bs, 'center', 0, 10); say(k, 'EXAMPLES!', 32, 250, 580, bs); }
      if (t > 5.4) { k.save(); k.strokeStyle = C.black; k.lineWidth = 6; for (let a = 0; a < 8; a++) { const an = -Math.PI / 2 + (a - 3.5) * 0.28, r0 = 195, r1 = 235 + 20 * (Math.floor(t * 8) % 2); k.beginPath(); k.moveTo(250 + Math.cos(an) * r0, 540 + Math.sin(an) * r0); k.lineTo(250 + Math.cos(an) * r1, 540 + Math.sin(an) * r1); k.stroke(); } k.restore(); }
      done();
    },
    // 3 GUESS -> CHECK -> ADJUST
    (c, k, t) => {
      const done = panel(c, k, 2, t, (c) => { c.fillStyle = C.white; c.fillRect(0, 0, PPW, PPH); benday(c, C.blue, 16, 3.6, -10, -10, PPW, PPH, 9); });
      const right = t > 9.0;
      const spin = PE.inOut(pseg(t, 8.2, 8.9)) * Math.PI * 4;
      robot(c, k, 560, 430, 0.55, 0.03, right ? 'happy' : (t > 7.5 ? 'sad' : 'think'), t, { spin, look: [-22, -4] });
      photo(c, k, 165, 400, 230 * PE.back(pseg(t, 6.15, 6.4)), 'cat', '?', -0.06);
      sayK(c, k, 'NEW PICTURE', 30, 165, 590, popIn(t, 6.3), 'center', 0, 9);
      // GUESS arrow (photo -> robot -> thought)
      const g = fatArrow(c, k, [210, 240], [330, 120], [430, 200], PE.out(pseg(t, 6.45, 6.85)), 34, C.yellow);
      if (t > 6.7) sayK(c, k, 'GUESS', 40, 325, 120, popIn(t, 6.7), 'center', -0.1);
      // thought balloon
      const ts = PE.back(pseg(t, 6.85, 7.1));
      if (ts > 0) {
        for (const [bx, by, br] of [[730, 250, 12], [760, 215, 18]]) { c.fillStyle = C.white; c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill(); k.lineWidth = 5; k.beginPath(); k.arc(bx, by, br, 0, 7); k.stroke(); }
        balloon(c, k, 900, 140, 150, 90, 900, 140, ts);
        say(k, right ? 'CAT!' : 'DOG?', 78, 900, 145, right ? popIn(t, 9.0) : ts);
      }
      // CHECK: WRONG! burst with emphasis shake
      if (t > 7.45 && !right) {
        const bs = PE.back(pseg(t, 7.45, 7.65)), sh = t < 7.9 ? Math.sin(t * 90) * 6 : 0;
        burst(c, k, 1050 + sh, 360, 120, bs, C.red, 13);
        say(k, 'WRONG!', 44, 1050 + sh, 350, bs, 'center', -0.1);
        say(k, "IT'S A CAT", 26, 1050, 395, bs, 'center', -0.1);
        k.save(); k.strokeStyle = C.black; k.lineWidth = 14; k.lineCap = 'round'; const u = PE.out(pseg(t, 7.5, 7.7)); k.translate(1000, 120); k.scale(u, u); k.beginPath(); k.moveTo(-40, -40); k.lineTo(40, 40); k.moveTo(40, -40); k.lineTo(-40, 40); k.stroke(); k.restore();
      }
      if (t > 7.5) sayK(c, k, 'CHECK', 40, 1120, 245, popIn(t, 7.5), 'center', 0.08);
      // ADJUST: arrow from the burst back round to the ear bolt
      fatArrow(c, k, [1030, 480], [960, 650], [740, 540], PE.inOut(pseg(t, 7.95, 8.35)), 34, C.yellow);
      if (t > 8.15) sayK(c, k, 'ADJUST', 40, 930, 600, popIn(t, 8.15), 'center', 0.05);
      if (t > 8.25 && t < 9.1) sayK(c, k, 'WHIRR!', 46, 790, 300, 1 + 0.08 * (Math.floor(t * 12) % 2), 'center', 0.25);
      if (right) {
        const u = PE.back(pseg(t, 9.15, 9.4));
        c.fillStyle = C.blue; c.beginPath(); c.arc(1080, 90, 46 * u, 0, 7); c.fill();
        k.save(); k.translate(1080, 90); k.scale(u, u); k.lineWidth = 7; k.strokeStyle = C.black; k.beginPath(); k.arc(0, 0, 46, 0, 7); k.stroke(); k.restore();
        c.save(); c.translate(1080, 90); c.scale(u, u); c.lineWidth = 13; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = C.white; c.beginPath(); c.moveTo(-20, 0); c.lineTo(-5, 16); c.lineTo(22, -16); c.stroke(); c.restore();
        // loop it again: arrow re-draws as a cycling highlight
        const lp = ((t - 9.4) / 0.6) % 1;
        if (t > 9.4) { k.save(); k.fillStyle = C.black; const q = [(1 - lp) * (1 - lp) * 1030 + 2 * (1 - lp) * lp * 960 + lp * lp * 740, (1 - lp) * (1 - lp) * 480 + 2 * (1 - lp) * lp * 650 + lp * lp * 540]; k.beginPath(); k.arc(q[0], q[1], 9, 0, 7); k.fill(); k.restore(); }
      }
      done();
    },
    // 4 PROGRESS
    (c, k, t) => {
      const done = panel(c, k, 3, t, (c) => { c.fillStyle = C.white; c.fillRect(0, 0, PPW, PPH); benday(c, C.blue, 17, 5.2, -10, -10, PPW, PPH, 21, (x, y) => 0.6 + 0.3 * H.smooth(1200, 0, x)); });
      box(c, k, 22, 20, 520, 60, C.yellow, 'AFTER MILLIONS OF ROUNDS...', 32, 10.75, t);
      const hit = t > 12.4;
      // sunburst rays sit behind the chart board
      if (hit) { c.save(); c.fillStyle = C.yellow; c.beginPath(); for (let a = 0; a < 16; a++) { const a0 = (a / 16) * Math.PI * 2 + t * 0.4; c.moveTo(950, 340); c.arc(950, 340, 700, a0, a0 + 0.1); } c.fill(); c.restore(); }
      // chart board
      c.fillStyle = C.white; c.fillRect(70, 120, 620, 480); k.lineWidth = 7; k.strokeStyle = C.black; k.strokeRect(70, 120, 620, 480);
      k.lineWidth = 5; k.beginPath(); k.moveTo(110, 150); k.lineTo(110, 540); k.lineTo(670, 540); k.stroke();
      say(k, 'TRAINING ROUNDS', 28, 390, 572, 1);
      const prog = PE.inOut(pseg(t, 11.0, 12.4));
      for (let b = 0; b < 8; b++) {
        const hv = (61 + 36 * (1 - Math.exp(-(b + 1) * 0.45)) / (1 - Math.exp(-8 * 0.45)) - 50) / 50 * 370;
        const g = pcl(prog * 8 - b), h = hv * PE.back(g);
        if (h <= 0) continue;
        const bx = 130 + b * 66;
        c.fillStyle = b % 2 ? C.red : C.yellow; c.fillRect(bx, 540 - h, 50, h);
        c.save(); c.beginPath(); c.rect(bx + 32, 540 - h, 18, h); c.clip(); benday(c, C.black, 8, 2.2, bx, 540 - h, bx + 50, 540, b); c.restore();
        k.lineWidth = 5; k.strokeRect(bx, 540 - h, 50, h);
      }
      const v = Math.round(61 + 36 * prog);
      const bs = PE.back(pseg(t, 10.9, 11.15));
      burst(c, k, 950, 340, 230, bs * (hit ? 1 + 0.12 * (1 - PE.out(pseg(t, 12.4, 12.65))) : 1), hit ? C.red : C.white, 31);
      if (bs > 0) { say(k, 'ACCURACY', 36, 950, 250, bs); say(k, v + '%', 150, 950, 360, bs * (hit ? 1 + 0.25 * (1 - PE.out(pseg(t, 12.4, 12.6))) : 1)); }
      if (hit) sayK(c, k, 'WOW!', 46, 1100, 520, popIn(t, 12.5), 'center', -0.15);
      done();
    },
    // 5 TAKEAWAY
    (c, k, t) => {
      const done = panel(c, k, 4, t, (c) => { c.fillStyle = C.yellow; c.fillRect(0, 0, PPW, PPH); benday(c, C.red, 18, 5.4, -10, -10, PPW, PPH, 41, (x, y) => H.smooth(800, 100, Math.hypot(x - 900, y - 400))); });
      robot(c, k, 920, 450, 0.7, 0.06, 'happy', t, { look: [-18, -10] });
      balloon(c, k, 380, 290, 330, 190, 684, 446, PE.back(pseg(t, 13.15, 13.4)));
      say(k, 'MORE EXAMPLES', 74, 380, 230, popIn(t, 13.3));
      if (t > 13.55) { const u = PE.out(pseg(t, 13.55, 13.75)); k.save(); k.translate(380, 300); k.fillStyle = C.black; k.beginPath(); k.moveTo(-12, -40 * u); k.lineTo(12, -40 * u); k.lineTo(12, 0); k.lineTo(30, 0); k.lineTo(0, 30 * u); k.lineTo(-30, 0); k.lineTo(-12, 0); k.closePath(); k.fill(); k.restore(); }
      say(k, 'BETTER GUESSES!', 74, 380, 375, popIn(t, 13.7));
      box(c, k, 22, PPH - 82, 230, 60, C.white, 'THE END!', 34, 14.2, t);
      done();
    },
  ];

  let ageCache = null;
  const paperAge = (W, H_) => {
    if (ageCache && ageCache.W === W && ageCache.H === H_) return ageCache;
    const nz = H.makeNoise(41), LW = 160, LH = 90;
    const lo = H.layer(LW, LH), lx = lo.getContext('2d'), li = lx.createImageData(LW, LH);
    for (let y = 0; y < LH; y++) for (let x = 0; x < LW; x++) { const i = (y * LW + x) * 4; li.data[i] = 128 + 127 * nz.fbm2(x * 0.06, y * 0.06, 3); li.data[i + 3] = 255; }
    lx.putImageData(li, 0, 0);
    const big = H.layer(W, H_), bx = big.getContext('2d'); bx.drawImage(lo, 0, 0, W, H_);
    const lf = bx.getImageData(0, 0, W, H_).data, r = H.rng(5), N = W * H_;
    const R = new Float32Array(N), G = new Float32Array(N), B = new Float32Array(N);
    for (let y = 0, p = 0; y < H_; y++) for (let x = 0; x < W; x++, p++) {
      const n = (lf[p * 4] - 128) / 128, g = r() - 0.5, ex = Math.min(x, W - x, y, H_ - y);
      const age = 1 - 0.06 * (1 - H.smooth(0, 160, ex)) - 0.025 * n;
      R[p] = age * (1 + g * 0.05); G[p] = (age - 0.01) * (1 + g * 0.05); B[p] = (age - 0.045) * (1 + g * 0.06);
    }
    return (ageCache = { W, H: H_, r: R, g: G, b: B });
  };

  const popExplainer = (ctx, W, H_, t) => {
    // camera: reads the strip panel by panel, pulling back a touch on each move
    const B = [2.4, 6.0, 10.6, 13.0];
    let pos = 0, dip = 0;
    B.forEach((b, i) => { const u = PE.inOut(pseg(t, b - 0.4, b + 0.4)); pos += u; dip = Math.max(dip, Math.sin(Math.PI * pseg(t, b - 0.4, b + 0.4))); });
    const cx = pos * (PPW + PG) + PPW / 2, cy = PPH / 2, z = 1 - 0.2 * dip;
    const col = H.layer(W, H_), c = col.getContext('2d'), key = H.layer(W, H_), k = key.getContext('2d');
    c.fillStyle = C.white; c.fillRect(0, 0, W, H_);
    for (const x of [c, k]) { x.save(); x.translate(W / 2, H_ / 2); x.scale(z, z); x.translate(-cx, -cy); x.lineJoin = 'round'; x.lineCap = 'round'; }
    const half = (W / 2) / z - 1.5;
    PANELS.forEach((fn, i) => { const px = pX(i); if (px + PPW + 4.5 < cx - half || px - 4.5 > cx + half) return; fn(c, k, t); });
    for (const x of [c, k]) x.restore();
    ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H_);
    ctx.drawImage(col, 2.5, -1.5);
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(key, 0, 0); ctx.globalCompositeOperation = 'source-over';
    // paper: the hero's low-frequency yellowing, edge ageing and fibre grain (multipliers cached per size)
    const A = paperAge(W, H_), img = ctx.getImageData(0, 0, W, H_), d = img.data;
    for (let i = 0, p = 0; i < d.length; i += 4, p++) { d[i] *= A.r[p]; d[i + 1] *= A.g[p]; d[i + 2] *= A.b[p]; }
    ctx.putImageData(img, 0, 0);
  };

  registerStyle({
    id: 'halftone-pop',
    name: 'Halftone Pop Panel',
    category: 'Print',
    description: 'A Lichtenstein-style blown-up comic panel: fat tapering black brush outlines, mechanical Ben-Day dot fields in red and blue, flat primary yellow, a tearful close-up and hand-lettered balloon.',
    motion: 'Blue dots pop on in a wave, the robot head springs up into frame, red skin dots wash down the face, caption and balloon slam in word by word, then a single tear wells up and rolls down during a slow push-in.',
    fonts: ['400 66px "Bangers"', '400 30px "Bangers"'],
    duration: 5,
    frameT: 4.8,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Told as a comic strip the camera reads panel by panel (pulling back to the gutters on each move), with fat yellow comic arrows, captions and balloons, Bangers counters bursting out of explosion balloons, and a WRONG! burst with shake as the emphasis.',
    explainer(ctx, W, H_, t) { popExplainer(ctx, W, H_, t); },
    // Sound: a comic book read aloud by its sound effects. Lettering lands with short punchy "thwacks", explosion
    // balloons go BAM, the WRONG! burst crashes and rattles with its shake, the ear bolts ratchet through WHIRR!,
    // fat arrows zip on, and each camera move across the strip is a soft, smooth slide over the page.
    // Timings mirror PANELS / popExplainer above (B camera beats, box/balloon/popIn/pseg windows).
    // Voiceover mode: room bed drops; photo zips, counter clicks, small labels and bubbles are minor.
    explainerSound(k) {
      const D = 15, B = [2.4, 6.0, 10.6, 13.0];
      const pan = (px) => H.clamp((px / PPW) * 2 - 1, -1, 1) * 0.6; // panel-local x -> stereo
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // comic lettering landing: a short dry thwack with a low body (no pitched chirp)
      const punch = (t, g, p, minor) => {
        const o = { minor: !!minor };
        k.tone(t, { ...o, f: [[0, 210], [0.09, 70]], dur: 0.14, gain: 0.42 * g, pan: p });
        k.noise(t, { ...o, dur: 0.06, filter: 'bandpass', f: 1100, q: 0.9, gain: 0.34 * g, a: 0.001, pan: p });
        k.noise(t, { ...o, dur: 0.015, filter: 'highpass', f: 2600, gain: 0.14 * g, a: 0.001, pan: p });
      };
      // explosion balloon: BAM (thud + a short crashing burst of noise)
      const bam = (t, g, p) => {
        k.play('thud', t, { f: 120, gain: 0.9 * g, pan: p });
        k.noise(t, { dur: 0.42, color: 'pink', filter: 'lowpass', f: [[0, 3200], [0.4, 380]], gain: 0.34 * g, a: 0.002, verb: 0.25, pan: p });
        k.noise(t, { dur: 0.05, filter: 'bandpass', f: 1400, q: 0.8, gain: 0.3 * g, a: 0.001, pan: p });
      };
      // fat arrow / photo whipping on: a short low zip, length = draw time
      const zip = (t, d, g, p, minor) => k.noise(t, { minor: !!minor, dur: d, color: 'pink', filter: 'bandpass', f: [[0, 420], [d * 0.7, 1500], [d, 900]], q: 1.1, gain: 0.22 * g, a: d * 0.55, pan: p });
      // camera glides along the strip: a soft smooth slide, centred on the beat
      const glide = (b) => k.noise(b - 0.4, { dur: 0.85, color: 'brown', filter: 'lowpass', f: [[0, 260], [0.4, 700], [0.85, 240]], q: 0.7, gain: 0.2, a: 0.38 });
      // counter digit flip: tiny dry click, low
      const clk = (t, g, p) => k.noise(t, { minor: true, dur: 0.02, filter: 'bandpass', f: 2300, q: 1.6, gain: 0.26 * g, a: 0.001, pan: p });

      k.bed('room', 0, D, { gain: 0.18 });

      // ---- panel 1: HOOK
      k.play('slap', when(0.1, 0.35, PE.back, 1), { gain: 0.35, pan: pan(230), minor: true }); // MEANWHILE caption box
      k.play('pop', when(0.35, 0.6, PE.back, 1), { f: 330, gain: 0.7, pan: pan(330), minor: true }); // balloon inflates
      punch(0.55, 0.9, pan(330)); // HOW DOES
      punch(0.85, 1.05, pan(330)); // AI LEARN?
      k.play('pop', 1.1, { f: 300, gain: 0.45, pan: pan(1040), minor: true }); // the two ?s
      k.play('pop', 1.24, { f: 260, gain: 0.4, pan: pan(1110), minor: true });

      // ---- camera to panel 2
      glide(B[0]);
      k.play('slap', when(2.55, 2.8, PE.back, 1), { gain: 0.3, pan: -0.4, minor: true }); // STEP 1 caption
      bam(when(2.9, 3.15, PE.back, 1) - 0.12, 0.5, pan(250)); // EXAMPLES! burst springs open
      // photos fly in with speed lines (same spawn schedule as panel 2)
      for (let j = 0, t0 = 2.75; t0 < 5.45; j++, t0 += Math.max(0.1, 0.34 - j * 0.02)) zip(t0, 0.16, 0.6, -0.6, true);
      // counter n = 1e6 * pseg(3.0, 5.4)^2.3: clicks speeding up with the count, <= ~11/s
      for (let t = 3.06; t < 5.32; ) { const s = pseg(t, 3.0, 5.4); clk(t, 0.75 + 0.35 * s, pan(250)); t += 0.18 - 0.09 * s; }
      bam(5.4, 0.75, pan(250)); // 1,000,000 + action lines flash
      punch(5.4, 0.55, pan(250));

      // ---- camera to panel 3
      glide(B[1]);
      k.play('pop', when(6.15, 6.4, PE.back, 1) - 0.08, { f: 240, gain: 0.7, pan: pan(165), minor: true }); // NEW PICTURE photo
      punch(6.3, 0.45, pan(165), true); // NEW PICTURE label
      zip(6.45, 0.4, 0.9, pan(320)); // GUESS arrow
      punch(6.7, 0.65, pan(325), true); // GUESS
      k.play('pop', 6.85, { f: 380, gain: 0.35, pan: pan(730), minor: true }); // thought bubbles
      k.play('pop', when(6.85, 7.1, PE.back, 1) - 0.05, { f: 300, gain: 0.6, pan: pan(900) }); // DOG? balloon
      // CHECK: WRONG! burst crashes in, rattles while it shakes (7.45 -> 7.9)
      bam(7.45, 1.15, pan(1050));
      k.play('buzz', 7.58, { f: 92, dur: 0.3, gain: 0.8, pan: pan(1050) });
      for (let t = 7.5; t < 7.88; t += 0.07) k.noise(t, { minor: true, dur: 0.04, filter: 'bandpass', f: 700, q: 1.2, gain: 0.16, a: 0.001, pan: pan(1050) });
      k.play('stroke', 7.56, { material: 'brush', dur: 0.16, gain: 1.1, pan: pan(1000), minor: true }); // the inked X
      punch(7.5, 0.55, pan(1120), true); // CHECK
      // ADJUST arrow, label, then the ear bolts ratchet round twice (spin 8.2..8.9, 4*pi) under WHIRR!
      zip(7.95, 0.4, 0.9, pan(900));
      punch(8.15, 0.6, pan(930), true);
      k.tone(8.22, { f: [[0, 85], [0.35, 150], [0.7, 85]], type: 'sawtooth', dur: 0.75, gain: 0.045, a: 0.1, hold: 0.4, filter: 'lowpass', f2: 650, pan: pan(560) });
      for (let i = 1; i <= 4; i++) k.play('click', when(8.2, 8.9, PE.inOut, i / 4), { f: 1150, gain: 1.1, pan: pan(560) + (i % 2 ? -0.15 : 0.15), minor: true });
      // CORRECT: CAT! lands, then the blue tick
      punch(9.0, 1.0, pan(900));
      k.play('success', when(9.15, 9.4, PE.back, 1) - 0.05, { f: 'C5', gain: 0.5, pan: pan(1080) });
      // the loop keeps cycling: a soft tap each time the dot sets off
      for (let t = 10.0; t < 10.3; t += 0.6) k.play('tock', t, { f: 420, gain: 0.25, pan: pan(1030), minor: true });

      // ---- camera to panel 4
      glide(B[2]);
      k.play('slap', when(10.75, 11.0, PE.back, 1), { gain: 0.3, pan: -0.4, minor: true }); // AFTER MILLIONS caption
      k.play('pop', when(10.9, 11.15, PE.back, 1) - 0.08, { f: 260, gain: 0.6, pan: pan(950), minor: true }); // ACCURACY burst opens
      // bars spring up one by one (bar b starts when prog = b/8), each a little higher-pitched thunk
      for (let b = 0; b < 8; b++) k.tone(when(11.0, 12.4, PE.inOut, b / 8 + 0.01), { minor: true, f: [[0, 150 + b * 18], [0.08, 80 + b * 10]], dur: 0.12, gain: 0.18, pan: pan(130 + b * 66) });
      // 61% -> 97% counter, throttled to ~10/s
      for (let t = 11.0, last = 61, lastT = -1; t < 12.42; t += 1 / 120) { const v = Math.round(61 + 36 * PE.inOut(pseg(t, 11.0, 12.4))); if (v !== last && t - lastT >= 0.1) { clk(t, 0.9, pan(950)); last = v; lastT = t; } }
      // 97%: the biggest hit. KA-POW + sunburst
      bam(12.4, 1.4, pan(950));
      k.play('impact', 12.4, { gain: 1.0, pan: pan(950) });
      k.tone(12.4, { f: [[0, 75], [0.5, 38]], dur: 0.7, gain: 0.5, pan: pan(950) }); // sub boom under the sunburst
      punch(12.5, 0.75, pan(1100)); // WOW!

      // ---- camera to panel 5: TAKEAWAY
      glide(B[3]);
      k.play('pop', when(13.15, 13.4, PE.back, 1) - 0.06, { f: 300, gain: 0.6, pan: pan(380), minor: true });
      punch(13.3, 0.8, pan(380)); // MORE EXAMPLES
      zip(13.55, 0.2, 0.6, pan(380), true); // down arrow
      punch(13.7, 1.0, pan(380)); // BETTER GUESSES!
      ['C5', 'E5', 'G5', 'C6'].forEach((f, i) => k.play('ding', 13.8 + i * 0.07, { f, gain: 0.38 - i * 0.05, pan: (i - 1.5) * 0.2 }));
      k.play('slap', when(14.2, 14.45, PE.back, 1), { gain: 0.4, pan: -0.5 }); // THE END!
    },
    draw(ctx, W, H_, t) {
      const PX = 26, PY = 24, PW = W - 52, PH = H_ - 48; // panel
      const E = H.ease;
      const headIn = H.clamp((t - 0.5) / 0.5);
      const hx = 880, hy = 462 + Math.sin(t * 1.3) * 3 + (1 - E.back(headIn)) * 720, hr = -0.11 + (1 - E.out(headIn)) * 0.25, hs = 1.04;
      const bgT = H.clamp((t - 0.02) / 0.7), bgWave = (x, y) => H.clamp((bgT * 1900 - (x - PX) - (y - PY) * 0.5) / 160);
      const faceT = H.clamp((t - 1.0) / 0.5), faceWave = (x, y) => H.clamp((faceT * 700 - (y + 330)) / 70);
      const tearIn = H.clamp((t - 2.85) / 1.15), tearY = H.lerp(-40, 105, E.inOut(tearIn)), tearS = 1.3 * E.out(H.clamp((t - 2.85) / 0.3));
      const capIn = E.back(H.clamp((t - 1.5) / 0.35)), capDX = (1 - capIn) * -500;
      const balIn = H.clamp((t - 1.9) / 0.28), balS = balIn <= 0 ? 0 : E.back(balIn);
      const pop = (t0) => (t < t0 ? 0 : 1 + 0.35 * (1 - E.out(H.clamp((t - t0) / 0.14))));
      const bal = (x, fn) => { if (balS <= 0) return; x.save(); x.translate(560, 520); x.scale(balS, balS); x.translate(-560, -520); fn(); x.restore(); };
      const cap = (x, fn) => { if (t < 1.5) return; x.save(); x.translate(capDX, 0); fn(); x.restore(); };
      const word = (x, t0, txt, size, cx, cy) => { const sc = pop(t0); if (!sc) return; x.save(); x.translate(cx, cy); x.scale(sc, sc); x.font = `400 ${size}px "Bangers"`; x.fillText(txt, 0, 0); x.restore(); };

      // ---------- COLOR PLATES ----------
      const col = H.layer(W, H_), c = col.getContext('2d');
      c.fillStyle = C.white; c.fillRect(0, 0, W, H_);
      c.save(); c.beginPath(); c.rect(PX, PY, PW, PH); c.clip();
      // background: blue Ben-Day field, denser toward the right edge
      benday(c, C.blue, 17, 5.2, PX - 10, PY - 10, PX + PW, PY + PH, 3, (x, y) => (0.72 + 0.32 * H.smooth(200, 1200, x + y * 0.4)) * bgWave(x, y));
      // head
      if (headIn > 0) {
      c.save(); c.translate(hx, hy); c.rotate(hr); c.scale(hs, hs);
      c.fillStyle = C.yellow; headPath(c); c.fill();
      c.save(); headPath(c); c.clip();
      c.beginPath(); c.moveTo(160, -320); c.bezierCurveTo(150, -150, 150, 60, 170, 320); c.lineTo(320, 320); c.lineTo(320, -320); c.closePath(); c.clip();
      benday(c, C.red, 12, 3.3, 100, -340, 320, 340, 12, faceWave);
      c.restore();
      c.fillStyle = C.white; c.beginPath(); c.moveTo(-226, -60); c.bezierCurveTo(-226, -200, -160, -270, -90, -300); c.bezierCurveTo(-150, -250, -196, -170, -200, -60); c.closePath(); c.fill();
      c.save(); facePath(c); c.clip();
      c.fillStyle = C.white; c.fillRect(-300, -300, 600, 600);
      benday(c, C.red, 16, 3.7, -260, -260, 260, 300, 8, faceWave);
      c.restore();
      // eyes: whites + blue irises
      for (const [ex, sg] of [[-88, -1], [92, 1]]) {
        c.fillStyle = C.white; eye(c, ex, -30, sg); c.fill();
        c.save(); eye(c, ex, -30, sg); c.clip();
        c.fillStyle = C.blue; c.beginPath(); c.arc(ex + 8, -22, 34, 0, 7); c.fill();
        c.restore();
      }
      // eye-shadow lids (blue dots like Roy's make-up)
      for (const [ex, sg] of [[-88, -1], [92, 1]]) {
        c.save(); c.beginPath(); c.ellipse(ex, -48, 74, 40, sg * 0.1, Math.PI, Math.PI * 2); c.closePath(); c.clip();
        c.fillStyle = C.white; c.fillRect(ex - 90, -120, 180, 70);
        benday(c, C.blue, 10, 3.4, ex - 100, -130, ex + 100, -40, 21 + ex);
        c.restore();
      }
      // antenna bulb, ear bolts
      c.fillStyle = C.red; c.beginPath(); c.arc(0, -392, 30, 0, 7); c.fill();
      for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 262, -10, 46, 0, 7); c.fill(); }
      // tear
      if (tearS > 0) {
        c.fillStyle = '#5fa3ef'; tearPath(c, -128, tearY + 40, tearS); c.fill();
        if (tearY > 14) { c.beginPath(); c.moveTo(-128, 4); c.lineTo(-128, tearY - 10); c.lineWidth = 12; c.strokeStyle = '#5fa3ef'; c.stroke(); }
      }
      c.restore();
      }
      // caption box + balloon
      cap(c, () => { c.fillStyle = C.yellow; c.fillRect(PX + 18, PY + 16, 412, 64); });
      bal(c, () => { c.fillStyle = C.white; bubblePath(c); c.fill(); });
      c.restore();

      // ---------- KEY (black) PLATE ----------
      const key = H.layer(W, H_), k = key.getContext('2d');
      k.lineJoin = 'round'; k.lineCap = 'round'; k.strokeStyle = C.black; k.fillStyle = C.black;
      k.save(); k.beginPath(); k.rect(PX, PY, PW, PH); k.clip();
      if (headIn > 0) {
      k.save(); k.translate(hx, hy); k.rotate(hr); k.scale(hs, hs);
      // antenna
      k.lineWidth = 12; k.beginPath(); k.moveTo(0, -325); k.lineTo(0, -362); k.stroke();
      k.lineWidth = 9; k.beginPath(); k.arc(0, -392, 30, 0, 7); k.stroke();
      k.fillStyle = C.white; k.beginPath(); k.ellipse(-10, -402, 9, 6, -0.6, 0, 7); k.fill(); k.fillStyle = C.black;
      // ear bolts
      for (const sx of [-1, 1]) {
        k.lineWidth = 9; k.beginPath(); k.arc(sx * 262, -10, 46, 0, 7); k.stroke();
        k.lineWidth = 6; k.beginPath(); k.arc(sx * 262, -10, 22, 0, 7); k.stroke();
      }
      // chrome shading on yellow shell: hard black reflection shapes
      k.save(); headPath(k); k.clip();
      k.beginPath(); k.moveTo(250, -300); k.bezierCurveTo(205, -170, 196, 40, 214, 300); k.lineTo(320, 300); k.lineTo(320, -300); k.closePath(); k.fill();
      k.beginPath(); k.moveTo(-150, -296); k.bezierCurveTo(-60, -318, 70, -318, 150, -290); k.bezierCurveTo(70, -300, -50, -298, -150, -282); k.closePath(); k.fill();
      // shell highlight streaks (white) on the dome
      k.restore();
      // outlines: fat brush lines
      k.lineWidth = 12; headPath(k); k.stroke();
      k.save(); k.translate(5, 4); k.lineWidth = 10; headPath(k); k.stroke(); k.restore();
      k.lineWidth = 8; facePath(k); k.stroke();
      k.save(); k.translate(-4, 3); k.lineWidth = 6; facePath(k); k.stroke(); k.restore();
      // rivets
      for (const [rx, ry] of [[-208, -150], [-206, 100], [204, -150], [200, 100], [-60, -270], [60, -270]]) { k.beginPath(); k.arc(rx, ry, 7, 0, 7); k.fill(); }
      // eyes
      for (const [ex, sg] of [[-88, -1], [92, 1]]) {
        k.lineWidth = 8; eye(k, ex, -30, sg); k.stroke();
        k.save(); eye(k, ex, -30, sg); k.clip();
        k.beginPath(); k.arc(ex + 8, -22, 15, 0, 7); k.fill();
        k.lineWidth = 5; k.beginPath(); k.arc(ex + 8, -22, 34, 0, 7); k.stroke();
        k.fillStyle = C.white;
        k.beginPath(); k.ellipse(ex - 6, -40, 11, 8, -0.5, 0, 7); k.fill();
        k.beginPath(); k.arc(ex + 20, -10, 5, 0, 7); k.fill();
        k.fillStyle = C.black;
        // heavy upper lid
        k.beginPath(); k.ellipse(ex, -30, 66, 52, sg * 0.08, Math.PI * 1.02, Math.PI * 1.98); k.lineWidth = 14; k.stroke();
        k.restore();
        // lashes-like brush flicks at outer corner
        k.lineWidth = 7;
        k.beginPath(); k.moveTo(ex + sg * 58, -52); k.quadraticCurveTo(ex + sg * 80, -66, ex + sg * 92, -62); k.stroke();
      }
      // worried brows: tapered brush strokes
      const brow = (x0, y0, x1, y1, bulge) => {
        k.beginPath(); k.moveTo(x0, y0);
        k.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - bulge, x1, y1);
        k.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - bulge + 22, x0 + (x1 > x0 ? 6 : -6), y0 + 6); k.closePath(); k.fill();
      };
      brow(-168, -96, -32, -150, 18); brow(172, -96, 36, -150, 18);
      // nose seam / cheek plate lines
      k.lineWidth = 6; k.beginPath(); k.moveTo(0, 30); k.quadraticCurveTo(-14, 80, 4, 104); k.stroke();
      // mouth grille (down-turned)
      mouthPath(k); k.fill();
      k.strokeStyle = C.white; k.lineWidth = 4;
      k.beginPath(); k.moveTo(-50, 188); k.quadraticCurveTo(0, 168, 50, 188); k.stroke();
      k.strokeStyle = C.black;
      // tear outline + highlight
      if (tearS > 0) {
        k.lineWidth = 7; tearPath(k, -128, tearY + 40, tearS); k.stroke();
        if (tearY > 14) { k.lineWidth = 5; k.beginPath(); k.moveTo(-134, 6); k.lineTo(-134, tearY - 14); k.moveTo(-122, 6); k.lineTo(-122, tearY - 14); k.stroke(); }
        k.fillStyle = C.white; k.beginPath(); k.ellipse(-128 - 12 * tearS / 1.3, tearY + 40 + 18 * tearS / 1.3, 8 * tearS / 1.3, 14 * tearS / 1.3, 0.3, 0, 7); k.fill(); k.fillStyle = C.black;
      }
      k.restore();
      }
      // emanata (shock lines) around head
      k.lineWidth = 8;
      if (t > 1.45) {
        const throb = 1 + 0.12 * (Math.floor(t * 6) % 2); // on-twos shock pulse
        for (const [a, r0, r1] of [[-2.2, 380, 440], [-2.0, 390, 455], [-1.8, 384, 430], [-1.0, 395, 445], [-0.8, 380, 438]]) {
          const r1b = r0 + (r1 - r0) * throb;
          k.beginPath(); k.moveTo(hx + Math.cos(a) * r0, hy - 30 + Math.sin(a) * r0); k.lineTo(hx + Math.cos(a) * r1b, hy - 30 + Math.sin(a) * r1b); k.stroke();
        }
      }
      // caption box
      cap(k, () => {
        k.lineWidth = 6; k.strokeRect(PX + 18, PY + 16, 412, 64);
        k.font = '400 30px "Bangers"'; k.letterSpacing = '1.5px'; k.textBaseline = 'middle'; k.textAlign = 'left';
        k.fillText('MEANWHILE, IN THE LAB...', PX + 36, PY + 50);
      });
      k.textBaseline = 'middle';
      // balloon
      bal(k, () => { k.lineWidth = 8; bubblePath(k); k.stroke(); });
      k.textAlign = 'center'; k.letterSpacing = '2px';
      word(k, 2.12, 'I THINK...', 58, 330, 250);
      word(k, 2.42, 'I FEEL', 70, 330, 318);
      word(k, 2.72, 'SOMETHING!', 66, 336, 386);
      k.restore();
      // panel border
      { const per = 2 * (PW + PH), u = E.inOut(H.clamp(t / 0.4));
        k.lineWidth = 9; k.setLineDash([per * u, per]); k.strokeRect(PX, PY, PW, PH); k.setLineDash([]); }

      // ---------- PRINT: paper, misregistered plates, dot gain, grain ----------
      ctx.drawImage(col, 0, 0);
      // offset colour plate ~2px vs key (press misregistration)
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H_);
      ctx.drawImage(col, 2.5, -1.5);
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(key, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      const img = ctx.getImageData(0, 0, W, H_), d = img.data;
      const nz = H.makeNoise(41);
      const lo = H.layer(80, 45), lx = lo.getContext('2d'), li = lx.createImageData(80, 45);
      for (let y = 0; y < 45; y++) for (let x = 0; x < 80; x++) { const i = (y * 80 + x) * 4; li.data[i] = 128 + 127 * nz.fbm2(x * 0.12, y * 0.12, 3); li.data[i + 3] = 255; }
      lx.putImageData(li, 0, 0);
      const big = H.layer(W, H_), bx = big.getContext('2d'); bx.drawImage(lo, 0, 0, W, H_);
      const lf = bx.getImageData(0, 0, W, H_).data;
      const r = H.rng(5);
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const n = (lf[i] - 128) / 128, g = (r() - 0.5);
        // paper yellowing toward edges + fibre grain
        const ex = Math.min(x, W - x, y, H_ - y);
        const age = 1 - 0.05 * (1 - H.smooth(0, 160, ex)) - 0.02 * n;
        d[i] = d[i] * age * (1 + g * 0.05);
        d[i + 1] = d[i + 1] * (age - 0.008) * (1 + g * 0.05);
        d[i + 2] = d[i + 2] * (age - 0.04) * (1 + g * 0.06);
      }
      ctx.putImageData(img, 0, 0);
      // slow camera push-in on the drama
      const z = 1 + 0.02 * E.inOut(H.clamp((t - 1.9) / 3.1));
      if (z > 1.0001) {
        const cp = H.layer(W, H_); cp.getContext('2d').drawImage(ctx.canvas, 0, 0, W, H_);
        const fx = 660, fy = 360;
        ctx.drawImage(cp, fx - fx / z, fy - fy / z, W / z, H_ / z, 0, 0, W, H_);
      }
    },
  });
}
