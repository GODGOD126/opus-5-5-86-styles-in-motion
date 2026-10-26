{
  // ---------- Kawaii anime: flat 2D chibi illustration, soft plum outlines, one cel-shadow tone, glossy anime eyes ----------
  // make sure the kana subset of Zen Maru Gothic is fetched before the first frame (H.loadFonts reads FONT_SAMPLE)
  window.FONT_SAMPLE = (window.FONT_SAMPLE || '') + 'ぽよんもぐもぐガーンやったーキラぴょん';
  const TAU = Math.PI * 2;
  const C = {
    plum: '#5a3659', dark: '#3b2342',
    pink: '#ffbfd2', pinkS: '#f597b7', pinkD: '#ff6f9c',
    mint: '#bff0dc', mintS: '#86d6b9', mintD: '#3fb98e',
    butter: '#fff0a6', butterS: '#f5d06a', butterD: '#ffd84d',
    lav: '#ded2ff', lavS: '#b7a2f2', lavD: '#8f74e6',
    sky: '#c6e7ff', skyS: '#8cc6f2', skyD: '#5aa9ea',
    cream: '#fffaf4', creamS: '#e4d8f6',
    peach: '#ffe2cf', peachS: '#f2b996', brown: '#dca07a', brownS: '#b97b5a',
    red: '#ff6b8a', white: '#ffffff',
  };
  const TH = {
    pink: { base: '#ffe7ef', dot: '#ffd3e1', acc: '#fff3b0', kind: 'dots' },
    mint: { base: '#ddf6ec', dot: '#c4ecdb', acc: '#fff1a0', kind: 'stars' },
    lav: { base: '#efe8ff', dot: '#e0d4ff', acc: '#ffd0e0', kind: 'clouds' },
    butter: { base: '#fff6d8', dot: '#ffeab0', acc: '#ffc4d6', kind: 'hearts' },
  };
  const FONT = '"Fredoka"', KANA = '"Zen Maru Gothic"';
  const q15 = (t) => Math.floor(t * 15 + 1e-6) / 15; // anime "on twos" at 30 fps

  // ---------- paths ----------
  const scaleOf = (ctx) => { const m = ctx.getTransform(); return Math.hypot(m.a, m.b) || 1; };
  const rrP = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
  const ellP = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, TAU); return p; };
  function roundPoly(pts, rad) {
    const p = new Path2D(), n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const s = mid(pts[n - 1], pts[0]); p.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) { const c = pts[i], m = mid(c, pts[(i + 1) % n]); p.arcTo(c[0], c[1], m[0], m[1], rad); }
    p.closePath(); return p;
  }
  const starPts = (cx, cy, R, r, n = 5, rot = -Math.PI / 2) => {
    const out = [];
    for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r : R; out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    return out;
  };
  const starP = (cx, cy, R, rot = -Math.PI / 2, ratio = 0.5, n = 5) => roundPoly(starPts(cx, cy, R, R * ratio, n, rot), R * 0.12);
  function heartP(cx, cy, s, rot = 0) {
    const p = new Path2D(), m = new DOMMatrix().translate(cx, cy).rotate(rot * 180 / Math.PI).scale(s, s), q = new Path2D();
    q.moveTo(0, 0.9);
    q.bezierCurveTo(-0.15, 0.75, -1, 0.3, -1, -0.25);
    q.bezierCurveTo(-1, -0.78, -0.35, -0.98, 0, -0.5);
    q.bezierCurveTo(0.35, -0.98, 1, -0.78, 1, -0.25);
    q.bezierCurveTo(1, 0.3, 0.15, 0.75, 0, 0.9);
    q.closePath(); p.addPath(q, m); return p;
  }
  function spark4P(cx, cy, R, rot = 0) {
    const p = new Path2D(), k = R * 0.16, pts = [[0, -R], [R, 0], [0, R], [-R, 0]], cs = [[k, -k], [k, k], [-k, k], [-k, -k]];
    const tr = ([x, y]) => [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
    const s0 = tr(pts[0]); p.moveTo(s0[0], s0[1]);
    for (let i = 0; i < 4; i++) { const c = tr(cs[i]), e = tr(pts[(i + 1) % 4]); p.quadraticCurveTo(c[0], c[1], e[0], e[1]); }
    p.closePath(); return p;
  }
  function cloudP(cx, cy, s) {
    const p = new Path2D();
    [[-70, 10, 42], [-30, -18, 52], [22, -26, 58], [70, 4, 44], [30, 22, 46], [-22, 24, 44]].forEach(([x, y, r]) => { p.moveTo(cx + (x + r) * s, cy + y * s); p.arc(cx + x * s, cy + y * s, r * s, 0, TAU); });
    return p;
  }

  // ---------- inking ----------
  function ol(ctx, p, w = 4.5, col = C.plum) { ctx.save(); ctx.lineWidth = w / scaleOf(ctx); ctx.strokeStyle = col; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(p); ctx.restore(); }
  // flat fill + ONE cel-shadow tone (light from top-left: the base is shifted up-left inside the shape, shade remains bottom-right)
  function cel(ctx, p, base, shade, dx = -8, dy = -8, w = 4.5) {
    ctx.save(); ctx.fillStyle = shade; ctx.fill(p); ctx.clip(p); ctx.translate(dx, dy); ctx.fillStyle = base; ctx.fill(p); ctx.restore();
    if (w) ol(ctx, p, w);
  }
  // union outline: outline every sub-shape, then fill them all (interior seams vanish)
  function union(ctx, paths, fill, w = 4.5) {
    ctx.save(); ctx.lineWidth = (2 * w) / scaleOf(ctx); ctx.strokeStyle = C.plum; ctx.lineJoin = 'round';
    paths.forEach((p) => ctx.stroke(p)); ctx.fillStyle = fill; paths.forEach((p) => ctx.fill(p)); ctx.restore();
  }
  function shine(ctx, x, y, rx, ry, rot = -0.6, a = 0.95) { ctx.save(); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill(ellP(x, y, rx, ry, rot)); ctx.restore(); }

  // ---------- motion grammar ----------
  // bouncy pop: 0 -> overshoot -> settle, with squash & stretch
  function pop(t, t0, k = 1) {
    const u = t - t0;
    if (u <= 0) return { s: 0, sx: 0, sy: 0, u };
    const s = 1 - Math.exp(-9 * u) * Math.cos(18 * u), q = Math.exp(-8 * u) * Math.sin(18 * u) * 0.28 * k;
    return { s, sx: s * (1 + q), sy: s * (1 - q), u };
  }
  const popOut = (t, t1, d = 0.2) => 1 - H.clamp((t - t1) / d);
  function squash(t, tl, amp = 0.22) { const u = t - tl; if (u < 0) return [1, 1]; const q = Math.exp(-7 * u) * Math.cos(16 * u) * amp; return [1 + q, 1 - q]; }
  const bob = (t, ph = 0, a = 8) => Math.sin(t * TAU * 0.85 + ph) * a;

  // ---------- lettering: bold rounded type, colored outline, soft drop shadow ----------
  function kText(ctx, str, x, y, size, o = {}) {
    ctx.save();
    ctx.font = `${o.weight || 700} ${size}px ${o.font || FONT}`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round'; ctx.miterLimit = 2;
    const lw = size * (o.lw || 0.24);
    if (o.outer) { ctx.strokeStyle = o.outer; ctx.lineWidth = lw + size * (o.ow || 0.13); ctx.strokeText(str, x, y); }
    if (o.shadow !== false) { ctx.shadowColor = o.shadow || 'rgba(90,54,89,0.32)'; ctx.shadowBlur = size * 0.12; ctx.shadowOffsetY = size * 0.07; }
    ctx.strokeStyle = o.line || C.pinkD; ctx.lineWidth = lw; ctx.strokeText(str, x, y);
    ctx.shadowColor = 'transparent'; ctx.fillStyle = o.fill || C.white; ctx.fillText(str, x, y);
    ctx.restore();
  }
  // per-letter bounce-in (each glyph pops on its own, anchored at the baseline)
  function kWord(ctx, str, cx, y, size, t, t0, stg, o = {}) {
    ctx.save(); ctx.font = `${o.weight || 700} ${size}px ${o.font || FONT}`;
    const ws = [...str].map((c) => ctx.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0) + (o.track || 0) * (str.length - 1);
    ctx.restore();
    let x = o.align === 'left' ? cx : cx - tot / 2;
    const fills = o.fills;
    [...str].forEach((c, i) => {
      const w = ws[i]; const p = pop(t, t0 + i * stg, 1.3);
      if (c !== ' ' && p.s > 0) {
        const hop = p.u < 0.25 ? -Math.sin((p.u / 0.25) * Math.PI) * size * 0.18 : 0;
        ctx.save(); ctx.translate(x + w / 2, y + hop); ctx.rotate((o.wob || 0) * Math.sin(t * 6 + i * 1.3)); ctx.scale(Math.min(p.sx, p.s, 1), p.sy);
        kText(ctx, c, 0, 0, size, { ...o, fill: fills ? fills[i % fills.length] : o.fill });
        ctx.restore();
      }
      x += w + (o.track || 0);
    });
    return tot;
  }
  function kana(ctx, str, x, y, size, rot, s, fill) {
    if (s <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    kText(ctx, str, 0, 0, size, { font: KANA, weight: 900, fill, line: C.white, outer: C.plum, lw: 0.22 });
    ctx.restore();
  }

  // ---------- anime face parts ----------
  function eye(ctx, x, y, rx, ry, iris, kind = 'normal', side = 1, look = [0, 0]) {
    ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.dark;
    if (kind === 'happy' || kind === 'blink') {
      ctx.beginPath();
      if (kind === 'happy') { ctx.moveTo(-rx * 0.95, ry * 0.18); ctx.quadraticCurveTo(0, -ry * 0.85, rx * 0.95, ry * 0.18); }
      else { ctx.moveTo(-rx * 0.95, -ry * 0.05); ctx.quadraticCurveTo(0, ry * 0.45, rx * 0.95, -ry * 0.05); }
      ctx.lineWidth = rx * 0.32; ctx.stroke();
    } else if (kind === 'squeeze') {
      ctx.beginPath(); ctx.moveTo(-rx * 0.65 * side, -ry * 0.5); ctx.lineTo(rx * 0.6 * side, 0); ctx.lineTo(-rx * 0.65 * side, ry * 0.5);
      ctx.lineWidth = rx * 0.3; ctx.stroke();
    } else if (kind === 'swirl') {
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 5.2; a += 0.15) { const r = rx * 0.95 * a / (Math.PI * 5.2), px = Math.cos(a * side) * r, py = Math.sin(a * side) * r * ry / rx; a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
      ctx.lineWidth = rx * 0.17; ctx.stroke();
    } else if (kind === 'star') {
      const p = starP(0, 0, rx * 1.2, -Math.PI / 2, 0.5);
      ctx.fillStyle = C.butterD; ctx.fill(p); ctx.lineWidth = rx * 0.15; ctx.stroke(p);
      shine(ctx, -rx * 0.22, -rx * 0.28, rx * 0.2, rx * 0.14, -0.5, 1);
    } else if (kind === 'shock') {
      ctx.fillStyle = C.white; ctx.fill(ellP(0, 0, rx * 0.78, ry * 0.82)); ctx.lineWidth = rx * 0.14; ctx.stroke(ellP(0, 0, rx * 0.78, ry * 0.82));
      ctx.fillStyle = C.dark; ctx.fill(ellP(look[0] * rx * 0.2, look[1] * ry * 0.2, rx * 0.17, ry * 0.17));
    } else {
      // glossy anime eye: dark lid shape, gradient iris, big pupil, two white highlight dots, top lash
      const lx = look[0] * rx * 0.16, ly = look[1] * ry * 0.12;
      ctx.fillStyle = C.dark; ctx.fill(ellP(0, 0, rx, ry));
      const g = ctx.createLinearGradient(0, -ry, 0, ry);
      g.addColorStop(0, C.dark); g.addColorStop(0.42, H.rgba(H.mix(iris, C.dark, 0.35))); g.addColorStop(1, H.rgba(H.mix(iris, '#ffffff', 0.45)));
      ctx.fillStyle = g; ctx.fill(ellP(lx, ly + ry * 0.06, rx * 0.8, ry * 0.82));
      ctx.fillStyle = '#28142c'; ctx.fill(ellP(lx, ly + ry * 0.02, rx * 0.42, ry * 0.44));
      ctx.fillStyle = H.rgba(H.mix(iris, '#ffffff', 0.65), 0.9); ctx.fill(ellP(lx, ly + ry * 0.6, rx * 0.46, ry * 0.16));
      ctx.fillStyle = C.white;
      ctx.fill(ellP(lx - rx * 0.3, ly - ry * 0.36, rx * 0.34, ry * 0.28));
      ctx.fill(ellP(lx + rx * 0.34, ly + ry * 0.3, rx * 0.14, ry * 0.12));
      ctx.beginPath(); ctx.ellipse(0, 0, rx * 1.06, ry * 1.04, 0, Math.PI * 1.13, Math.PI * 1.87); ctx.lineWidth = rx * 0.22; ctx.stroke();
    }
    ctx.restore();
  }
  function mouth(ctx, x, y, w, kind = 'smile') {
    ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.dark; ctx.lineWidth = w * 0.26;
    const inner = '#b8456f';
    if (kind === 'w') { ctx.beginPath(); ctx.moveTo(-w, -w * 0.15); ctx.quadraticCurveTo(-w * 0.5, w * 0.75, 0, 0); ctx.quadraticCurveTo(w * 0.5, w * 0.75, w, -w * 0.15); ctx.stroke(); }
    else if (kind === 'flat') { ctx.beginPath(); ctx.moveTo(-w * 0.5, 0); ctx.lineTo(w * 0.5, 0); ctx.stroke(); }
    else if (kind === 'wobble') { ctx.beginPath(); ctx.moveTo(-w, 0); for (let i = 1; i <= 4; i++) ctx.quadraticCurveTo(-w + (i - 0.5) * w / 2, (i % 2 ? -1 : 1) * w * 0.4, -w + i * w / 2, 0); ctx.stroke(); }
    else if (kind === 'o' || kind === 'O') {
      const k = kind === 'O' ? 0.8 : 0.5, p = ellP(0, 0, w * k, w * k * 1.15);
      ctx.fillStyle = inner; ctx.fill(p); ctx.save(); ctx.clip(p); ctx.fillStyle = '#ff8fab'; ctx.fill(ellP(0, w * k * 0.9, w * k * 0.7, w * k * 0.5)); ctx.restore(); ctx.lineWidth = w * 0.22; ctx.stroke(p);
    } else { // open smile with tongue
      const p = new Path2D(); p.moveTo(-w, -w * 0.2); p.quadraticCurveTo(0, w * 1.7, w, -w * 0.2); p.closePath();
      ctx.fillStyle = inner; ctx.fill(p); ctx.save(); ctx.clip(p); ctx.fillStyle = '#ff8fab'; ctx.fill(ellP(0, w * 0.85, w * 0.6, w * 0.42)); ctx.restore(); ctx.lineWidth = w * 0.22; ctx.stroke(p);
    }
    ctx.restore();
  }
  function blush(ctx, x, y, rx, ry) {
    ctx.save(); ctx.fillStyle = 'rgba(255,135,170,0.55)'; ctx.fill(ellP(x, y, rx, ry));
    ctx.strokeStyle = 'rgba(255,95,145,0.85)'; ctx.lineWidth = rx * 0.13; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = -1; i <= 1; i++) { ctx.moveTo(x + i * rx * 0.45 - rx * 0.1, y + ry * 0.35); ctx.lineTo(x + i * rx * 0.45 + rx * 0.1, y - ry * 0.35); }
    ctx.stroke(); ctx.restore();
  }

  // ---------- characters (local units; (x,y) = head centre) ----------
  function rig(ctx, x, y, s, P, footY) {
    ctx.translate(x, y); ctx.scale(s, s);
    if (P.shadow !== false) { const k = 1 - Math.min(P.lift || 0, 140) / 280; ctx.fillStyle = 'rgba(90,54,89,0.13)'; ctx.fill(ellP(0, footY + 40, 115 * k, 17 * k)); }
    ctx.translate(0, -(P.lift || 0));
    const sq = P.sq || [1, 1]; ctx.translate(0, footY); ctx.rotate(P.tilt || 0); ctx.scale(sq[0], sq[1]); ctx.translate(0, -footY);
  }
  // the AI mascot: round robot, heart antenna, ear pods, candy-knob belly panel
  function bot(ctx, x, y, s, P = {}) {
    ctx.save(); rig(ctx, x, y, s, P, 200);
    // arms
    const arm = (side, a) => { ctx.save(); ctx.translate(side * 80, 108); ctx.rotate(-side * a); const p = ellP(side * 12, 30, 22, 32, -side * 0.25); cel(ctx, p, C.pink, C.pinkS, -5, -5); ctx.restore(); };
    const aL = P.armL || 0.15, aR = P.armR || 0.15;
    if (aL < 1.2) arm(-1, aL); if (aR < 1.2) arm(1, aR);
    // body + belly panel + knobs (the model's weights)
    cel(ctx, rrP(-86, 68, 172, 132, 56), C.pink, C.pinkS, -11, -11);
    shine(ctx, -58, 140, 9, 20, 0.2, 0.75);
    cel(ctx, rrP(-60, 104, 120, 66, 28), C.mint, C.mintS, -5, -5);
    const kc = [[C.butter, C.butterS], [C.sky, C.skyS], [C.lav, C.lavS]], ka = P.knobs || [-2.3, -0.5, -1.9];
    for (let i = 0; i < 3; i++) {
      const kx = -34 + i * 34, ky = 137;
      cel(ctx, ellP(kx, ky, 14, 14), kc[i][0], kc[i][1], -3, -3, 3.5);
      ctx.save(); ctx.strokeStyle = C.plum; ctx.lineCap = 'round'; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx + Math.cos(ka[i]) * 10, ky + Math.sin(ka[i]) * 10); ctx.stroke(); ctx.restore();
    }
    // ear pods
    for (const sd of [-1, 1]) { cel(ctx, ellP(sd * 140, -4, 30, 34), C.pink, C.pinkS, -6, -6); ctx.fillStyle = C.pinkS; ctx.fill(ellP(sd * 146, -4, 11, 14)); }
    // antenna with heart bulb
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = C.plum; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(0, -98); ctx.quadraticCurveTo(4, -125, 0, -146); ctx.stroke();
    ctx.strokeStyle = C.lav; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
    if (P.glow) { const g = ctx.createRadialGradient(0, -166, 4, 0, -166, 70); g.addColorStop(0, `rgba(255,140,180,${0.6 * P.glow})`); g.addColorStop(1, 'rgba(255,140,180,0)'); ctx.fillStyle = g; ctx.fillRect(-80, -240, 160, 150); }
    const hs = 24 * (1 + 0.25 * (P.glow || 0));
    cel(ctx, heartP(0, -166, hs), P.glow > 0.3 ? C.pinkD : C.pink, C.pinkS, -4, -4, 4);
    shine(ctx, -9, -174, 5, 3.5, -0.6);
    // head
    cel(ctx, rrP(-138, -106, 276, 204, 98), C.cream, C.creamS, -13, -13);
    shine(ctx, -90, -64, 30, 13, -0.6); shine(ctx, -52, -86, 7, 7, 0);
    if (aL >= 1.2) arm(-1, aL); if (aR >= 1.2) arm(1, aR);
    // face
    const ek = P.eyes || 'normal', look = P.look || [0, 0];
    eye(ctx, -56, 2, 36, 48, '#8a6cf0', ek, 1, look); eye(ctx, 56, 2, 36, 48, '#8a6cf0', ek, -1, look);
    if (P.blush !== false) { blush(ctx, -98, 46, 24, 13); blush(ctx, 98, 46, 24, 13); }
    mouth(ctx, 0, 50, 15, P.mouth || 'smile');
    ctx.restore();
  }
  function cat(ctx, x, y, s, P = {}) {
    ctx.save(); rig(ctx, x, y, s, P, 182);
    if (!P.headOnly) {
      const wag = P.wag || 0;
      ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(50, 150); ctx.bezierCurveTo(120, 160, 128 + wag * 18, 90, 100 + wag * 34, 48);
      ctx.strokeStyle = C.plum; ctx.lineWidth = 30; ctx.stroke(); ctx.strokeStyle = C.butter; ctx.lineWidth = 20; ctx.stroke(); ctx.restore();
      cel(ctx, ellP(0, 124, 72, 60), C.butter, C.butterS, -8, -8);
      for (const sd of [-1, 1]) cel(ctx, ellP(sd * 32, 174, 24, 15), C.butter, C.butterS, -3, -3);
    }
    for (const sd of [-1, 1]) {
      cel(ctx, roundPoly([[sd * 106, -26], [sd * 90, -130], [sd * 22, -86]], 16), C.butter, C.butterS, -5, -5);
      ctx.fillStyle = C.pink; ctx.fill(roundPoly([[sd * 88, -50], [sd * 81, -106], [sd * 45, -80]], 9));
    }
    cel(ctx, ellP(0, 0, 116, 96), C.butter, C.butterS, -12, -12);
    ctx.save(); ctx.strokeStyle = C.butterS; ctx.lineCap = 'round'; ctx.lineWidth = 8; ctx.beginPath();
    ctx.moveTo(0, -90); ctx.lineTo(0, -70); ctx.moveTo(-26, -86); ctx.lineTo(-21, -68); ctx.moveTo(26, -86); ctx.lineTo(21, -68); ctx.stroke(); ctx.restore();
    shine(ctx, -66, -46, 20, 9, -0.6);
    const ek = P.eyes || 'normal';
    eye(ctx, -44, 8, 28, 37, '#3fbf95', ek, 1, P.look || [0, 0]); eye(ctx, 44, 8, 28, 37, '#3fbf95', ek, -1, P.look || [0, 0]);
    blush(ctx, -78, 42, 18, 10); blush(ctx, 78, 42, 18, 10);
    ctx.fillStyle = C.pinkD; ctx.fill(roundPoly([[-7, 33], [7, 33], [0, 41]], 3));
    mouth(ctx, 0, 46, 11, P.mouth || 'w');
    ctx.save(); ctx.strokeStyle = C.plum; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath();
    for (const sd of [-1, 1]) { ctx.moveTo(sd * 100, 26); ctx.lineTo(sd * 134, 18); ctx.moveTo(sd * 100, 40); ctx.lineTo(sd * 136, 44); }
    ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  function dog(ctx, x, y, s, P = {}) {
    ctx.save(); rig(ctx, x, y, s, P, 182);
    if (!P.headOnly) {
      const wag = P.wag || 0;
      ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-52, 140); ctx.quadraticCurveTo(-100, 130, -108 - wag * 22, 84 + Math.abs(wag) * 6);
      ctx.strokeStyle = C.plum; ctx.lineWidth = 30; ctx.stroke(); ctx.strokeStyle = C.brown; ctx.lineWidth = 20; ctx.stroke(); ctx.restore();
      cel(ctx, ellP(0, 124, 72, 60), C.peach, C.peachS, -8, -8);
      for (const sd of [-1, 1]) cel(ctx, ellP(sd * 32, 174, 24, 15), C.peach, C.peachS, -3, -3);
    }
    const head = ellP(0, 0, 112, 98);
    cel(ctx, head, C.peach, C.peachS, -12, -12, 0);
    ctx.save(); ctx.clip(head); ctx.fillStyle = '#efbf9c'; ctx.fill(ellP(46, -8, 38, 34)); ctx.fillStyle = '#fff6ee'; ctx.fill(ellP(0, 42, 54, 36)); ctx.restore();
    ol(ctx, head);
    shine(ctx, -64, -52, 20, 9, -0.6);
    const ek = P.eyes || 'normal';
    eye(ctx, -44, -4, 27, 36, '#b06c42', ek, 1, P.look || [0, 0]); eye(ctx, 44, -4, 27, 36, '#b06c42', ek, -1, P.look || [0, 0]);
    blush(ctx, -76, 36, 17, 10); blush(ctx, 76, 36, 17, 10);
    ctx.fillStyle = C.dark; ctx.fill(ellP(0, 26, 17, 11)); shine(ctx, -5, 22, 5, 3, -0.3);
    ctx.save(); ctx.strokeStyle = C.dark; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 36); ctx.lineTo(0, 44); ctx.stroke(); ctx.restore();
    if (P.tongue !== false) { const tp = new Path2D(); tp.moveTo(-10, 50); tp.lineTo(10, 50); tp.quadraticCurveTo(10, 68, 0, 68); tp.quadraticCurveTo(-10, 68, -10, 50); ctx.fillStyle = '#ff8fab'; ctx.fill(tp); ol(ctx, tp, 3); }
    mouth(ctx, 0, 48, 13, 'w');
    for (const sd of [-1, 1]) cel(ctx, ellP(sd * 104, 2, 30, 62, sd * -0.38), C.brown, C.brownS, -5, -6);
    ctx.restore();
  }

  // ---------- props / emotes ----------
  function tag(ctx, x, y, label, fill, flip = 1, size = 28) {
    ctx.save(); ctx.translate(x, y); ctx.scale(flip, 1);
    ctx.font = `700 ${size}px ${FONT}`; const w = Math.max(ctx.measureText(label).width + size * 1.1, size * 1.6), h = size * 1.5;
    cel(ctx, rrP(-w / 2, -h / 2, w, h, h / 2), fill, H.rgba(H.mix(fill, C.plum, 0.15)), -3, -3, 3.5);
    ctx.fillStyle = C.plum; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 2);
    ctx.restore();
  }
  function card(ctx, x, y, s, kind, label, P = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(P.rot || 0); ctx.scale(s * (P.sx || 1), s * (P.sy || 1));
    cel(ctx, rrP(-82, -92, 164, 176, 26), '#fffdfb', '#eadcf2', -6, -6);
    const inner = rrP(-68, -78, 136, 126, 18);
    ctx.save(); ctx.clip(inner); ctx.fillStyle = kind === 'cat' ? '#dff0ff' : '#ffe6ef'; ctx.fillRect(-70, -80, 140, 130);
    ctx.fillStyle = kind === 'cat' ? '#cbe5fb' : '#ffd4e2';
    for (let j = 0; j < 5; j++) for (let i = 0; i < 6; i++) ctx.fill(ellP(-62 + i * 26 + (j % 2) * 13, -70 + j * 28, 4, 4));
    (kind === 'cat' ? cat : dog)(ctx, 0, 8, 0.52, { headOnly: true, shadow: false, eyes: P.eyes });
    ctx.restore(); ol(ctx, inner, 3.5);
    if (label) tag(ctx, 0, 92, label, P.tagFill || (kind === 'cat' ? C.butter : C.sky), P.flip == null ? 1 : P.flip, P.tagSize || 28);
    ctx.restore();
  }
  function bubble(ctx, x, y, w, h, tail, s = [1, 1], fill = C.white) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s[0], s[1]);
    const p = rrP(-w / 2, -h / 2, w, h, h * 0.46), tx = tail[0] - x, ty = tail[1] - y;
    const bx = H.clamp(tx * 0.45, -w / 2 + 34, w / 2 - 34), tp = new Path2D();
    tp.moveTo(bx - 24, h / 2 - 8); tp.quadraticCurveTo(bx - 6, (h / 2 + ty) / 2 + 4, tx, ty); tp.quadraticCurveTo(bx + 4, (h / 2 + ty) / 2 - 6, bx + 22, h / 2 - 8); tp.closePath();
    union(ctx, [p, tp], fill);
    ctx.restore();
  }
  function thought(ctx, x, y, s, tail, dots, tq) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    union(ctx, [cloudP(0, 0, 1.05)], C.white);
    const [tx, ty] = [(tail[0] - x) / s, (tail[1] - y) / s];
    union(ctx, [ellP(tx * 0.55, ty * 0.55 + 20, 16, 14)], C.white); union(ctx, [ellP(tx * 0.85, ty * 0.85, 10, 9)], C.white);
    for (let i = 0; i < dots; i++) { ctx.fillStyle = C.plum; ctx.fill(ellP(-34 + i * 34, 4 + Math.sin(tq * 8 + i) * 3, 9, 9)); }
    ctx.restore();
  }
  function sweat(ctx, x, y, s, rot = 0.25) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    const p = new Path2D(); p.moveTo(0, -30); p.bezierCurveTo(8, -12, 20, 2, 20, 14); p.arc(0, 14, 20, 0, Math.PI); p.bezierCurveTo(-20, 2, -8, -12, 0, -30); p.closePath();
    cel(ctx, p, C.sky, C.skyS, -4, -4, 4); shine(ctx, -6, 12, 4, 7, 0.3);
    ctx.restore();
  }
  function vein(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = C.red; ctx.lineCap = 'round'; ctx.lineWidth = 7;
    for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2 + Math.PI / 4); ctx.beginPath(); ctx.moveTo(-14, -6); ctx.quadraticCurveTo(-6, -6, -6, -14); ctx.translate(0, 0); ctx.stroke(); ctx.restore(); }
    ctx.restore();
  }
  function sparkle(ctx, x, y, R, fill = C.white, rot = 0, w = 3.5) { const p = spark4P(x, y, R, rot); ctx.fillStyle = fill; ctx.fill(p); if (w) ol(ctx, p, w); }
  function heart(ctx, x, y, s, fill = C.pinkD, rot = 0) { cel(ctx, heartP(x, y, s, rot), fill, H.rgba(H.mix(fill, C.plum, 0.25)), -s * 0.12, -s * 0.12, 3.5); shine(ctx, x - s * 0.45, y - s * 0.35, s * 0.18, s * 0.12, -0.6); }
  function impactLines(ctx, x, y, r0, t, t0, n = 8, col = C.plum) {
    const u = (t - t0) / 0.3; if (u < 0 || u > 1) return;
    ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 6; ctx.globalAlpha = 1 - u * 0.6; ctx.beginPath();
    for (let i = 0; i < n; i++) { const a = i / n * TAU + 0.3, a0 = r0 + u * 30, a1 = r0 + 24 + u * 46; ctx.moveTo(x + Math.cos(a) * a0, y + Math.sin(a) * a0); ctx.lineTo(x + Math.cos(a) * a1, y + Math.sin(a) * a1); }
    ctx.stroke(); ctx.restore();
  }
  function confetti(ctx, t, t0, x, y, n, seed, spread = 1) {
    const tau = t - t0; if (tau < 0 || tau > 2.4) return;
    const r = H.rng(seed), cols = [C.pinkD, C.mintD, C.butterD, C.skyD, C.lavD, C.pink];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 2.6 * spread, v = r.range(380, 820), rs = r.range(-8, 8), c = cols[i % cols.length], kind = i % 4, sz = r.range(9, 15);
      const px = x + Math.cos(a) * v * tau * 0.8, py = y + Math.sin(a) * v * tau * 0.8 + 520 * tau * tau;
      if (py > 760) continue;
      ctx.save(); ctx.translate(px, py); ctx.rotate(rs * tau); ctx.scale(1, Math.cos(tau * 9 + i));
      if (kind === 0) { ctx.fillStyle = c; ctx.fill(rrP(-sz * 0.6, -sz * 0.35, sz * 1.2, sz * 0.7, 3)); }
      else if (kind === 1) { ctx.fillStyle = c; ctx.fill(ellP(0, 0, sz * 0.45, sz * 0.45)); }
      else if (kind === 2) { ctx.fillStyle = c; ctx.fill(starP(0, 0, sz * 0.7)); }
      else { ctx.fillStyle = c; ctx.fill(heartP(0, 0, sz * 0.5)); }
      ctx.restore();
    }
  }
  // dotted connector that draws on, chunky rounded arrowhead at the tip
  const bez = (p0, p1, p2, p3, n = 60) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; });
  const arcPts = (cx, cy, r, a0, a1, n = 50) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  function along(pts, d) {
    let acc = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + l >= d) { const u = (d - acc) / l; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u, Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])]; } acc += l; }
    const a = pts[pts.length - 1], b = pts[pts.length - 2]; return [a[0], a[1], Math.atan2(a[1] - b[1], a[0] - b[0])];
  }
  const plen = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
  function dotted(ctx, pts, prog, col, r = 6, gap = 22, head = 1) {
    if (prog <= 0) return;
    const L = plen(pts) * prog;
    for (let d = 0; d < L - (head ? 16 : 0); d += gap) { const [x, y] = along(pts, d); ctx.fillStyle = col; ctx.fill(ellP(x, y, r, r)); }
    if (head) {
      const [x, y, a] = along(pts, L), s = 20 * head;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      const p = roundPoly([[s * 0.9, 0], [-s * 0.6, -s * 0.85], [-s * 0.6, s * 0.85]], s * 0.25);
      cel(ctx, p, col, H.rgba(H.mix(col, C.plum, 0.25)), -2, -2, 4); ctx.restore();
    }
  }

  // ---------- backgrounds: soft pastel with simple patterns ----------
  function bg(ctx, W, H_, t, th, seed = 1) {
    ctx.fillStyle = th.base; ctx.fillRect(0, 0, W, H_);
    const r = H.rng(seed);
    // big soft clouds (no outline) drifting
    ctx.save(); ctx.globalAlpha = th.kind === 'clouds' ? 0.95 : 0.7; ctx.fillStyle = C.white;
    const nc = th.kind === 'clouds' ? 6 : 3;
    for (let i = 0; i < nc; i++) { const s = r.range(0.9, 1.6), x = ((r.range(0, W + 300) + t * r.range(8, 16)) % (W + 300)) - 150, y = r.range(60, H_ - 40); ctx.fill(cloudP(x, y, s)); }
    ctx.restore();
    const sx = 66, sy = 48, ox = (t * 12) % (sx * 2), oy = (t * 7) % (sy * 2);
    for (let j = -2; j < H_ / sy + 2; j++) for (let i = -2; i < W / sx + 2; i++) {
      const x = i * sx + (j & 1 ? sx / 2 : 0) + ox, y = j * sy + oy;
      if ((j & 1) && th.kind !== 'dots' && th.kind !== 'clouds') {
        ctx.fillStyle = th.acc;
        if (th.kind === 'stars') ctx.fill(starP(x, y, 10, -Math.PI / 2 + (i + j) * 0.3));
        else ctx.fill(heartP(x, y, 9));
      } else { ctx.fillStyle = th.dot; ctx.fill(ellP(x, y, 8, 8)); }
    }
  }
  function twinkles(ctx, W, H_, t, seed, n = 9, avoid) {
    const r = H.rng(seed);
    for (let i = 0; i < n; i++) {
      const x = r.range(40, W - 40), y = r.range(40, H_ - 40), R = r.range(9, 18), ph = r() * TAU, sp = r.range(2.5, 4.5);
      if (avoid && avoid(x, y)) continue;
      const k = Math.max(0, Math.sin(t * sp + ph)); if (k < 0.1) continue;
      sparkle(ctx, x, y, R * (0.4 + 0.6 * k), i % 3 ? C.white : C.butter, 0, 0);
    }
  }
  // star / heart iris wipe with a thick candy rim
  function wipe(ctx, W, H_, u, shape, cx, cy, drawB) {
    const e = u * u * (3 - 2 * u), rot = -Math.PI / 2 + u * 0.9;
    const p = shape === 'heart' ? heartP(cx, cy, 1900 * e * e + 4, 0) : starP(cx, cy, 1800 * e * e + 4, rot, 0.52);
    ctx.save(); ctx.clip(p); drawB(); ctx.restore();
    ctx.save(); ctx.lineJoin = 'round'; ctx.strokeStyle = C.plum; ctx.lineWidth = 34; ctx.stroke(p); ctx.strokeStyle = shape === 'heart' ? C.pink : C.butter; ctx.lineWidth = 24; ctx.stroke(p);
    ctx.strokeStyle = C.white; ctx.lineWidth = 6; ctx.globalAlpha = 0.8; ctx.stroke(p); ctx.restore();
  }

  // ---------- explainer timing (shared by explainer() and explainerSound()) ----------
  const EX = {
    D: 15.5, wd: 0.5,
    land: 0.45, q1: 0.95, q2: 1.15, title0: 0.3, stg: 0.04, shrink: 1.85,
    w1: 2.2,
    lbl: 2.75, arrow: [2.8, 3.35], cnt: [2.9, 5.6], card0: 2.75, cardGap: 0.28, cardN: 8, cardTravel: 1.1, dataOut: 5.95,
    jump: [6.0, 6.5], newCard: 6.55, think: 6.55, badges: [6.6, 6.7, 6.8], loopArrows: [6.85, 7.0, 7.15],
    guess: 7.0, check: 7.8, wrong: 8.0, adjust: 8.6, errArrow: [8.6, 8.9], knobs: 8.95, weights: 8.95, guess2: 9.5, right: 9.75,
    w2: 10.25, axis: [10.55, 10.8], rounds: 10.7, accLbl: 10.7, bar0: 10.8, barGap: 0.2, hit: 12.4, pill: 12.55,
    w3: 13.05, take1: 13.3, take2: 13.62, friends: [13.35, 13.5],
  };
  const LOOP = { cx: 965, cy: 392, r: 168 };
  const BADGE = [['Guess', -90, C.butter], ['Check', 30, C.sky], ['Adjust', 150, C.pink]];
  const accAt = (k) => 61 + 36 * (1 - Math.pow(1 - H.clamp(k / 8), 1.6));
  const cardArrive = (i) => EX.card0 + i * EX.cardGap + EX.cardTravel;

  function header(ctx, t) {
    const str = 'How does AI learn?';
    if (t < EX.title0) return;
    const u = H.ease.inOut(H.clamp((t - EX.shrink) / 0.4));
    if (u <= 0) { kWord(ctx, str, 640, 172, 80, t, EX.title0, EX.stg, { wob: 0.02, track: 3 }); return; }
    ctx.save(); ctx.font = `700 34px ${FONT}`; const tw = ctx.measureText(str).width; ctx.restore();
    const pw = tw + 52, ph = 62, hx = 24 + pw / 2, hy = 20 + ph / 2;
    const ps = pop(t, EX.shrink + 0.25, 1.2);
    if (ps.s > 0) { ctx.save(); ctx.translate(hx, hy); ctx.scale(ps.sx, ps.sy); cel(ctx, rrP(-pw / 2, -ph / 2, pw, ph, ph / 2), C.butter, C.butterS, -4, -4); ctx.restore(); }
    const size = H.lerp(80, 34, u), cx = H.lerp(640, hx, u), by = H.lerp(172, hy + 12, u);
    kText(ctx, str, cx, by, size, { lw: H.lerp(0.24, 0.3, u) });
  }

  function sceneHook(ctx, W, H_, t) {
    bg(ctx, W, H_, t, TH.pink, 3);
    twinkles(ctx, W, H_, t, 21, 10, (x, y) => Math.abs(x - 640) < 260 && y > 200);
    if (t >= 0.15) {
      let y = 470, sq;
      if (t < EX.land) { const u = (t - 0.15) / (EX.land - 0.15); y = 470 - 560 * (1 - u * u); sq = [0.86, 1.16]; } else sq = squash(t, EX.land, 0.26);
      const blink = t > 1.33 && t < 1.47;
      const tilt = t < EX.q1 ? 0 : t < 1.55 ? -0.09 : 0.08;
      bot(ctx, 640, y, 0.95, { sq, lift: t > EX.land + 0.5 ? bob(t) : 0, eyes: blink ? 'blink' : 'normal', look: [0.3, -0.7], mouth: t < 1.0 ? 'O' : 'o', tilt, armL: t > EX.q1 ? 0.6 : 0.15, glow: 0.4 + 0.3 * Math.sin(t * 7) });
      kana(ctx, 'ぽよん', 420, 640, 46, -0.15, t > EX.land && t < EX.land + 1.2 ? pop(t, EX.land).s * popOut(t, EX.land + 1.0) : 0, C.mint);
    }
    for (const [tt, x, y, sz, ph] of [[EX.q1, 865, 400, 104, 0], [EX.q2, 930, 318, 66, 1.7]]) {
      const p = pop(t, tt, 1.4); if (p.s <= 0) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(0.14 * Math.sin(t * 9 + ph)); ctx.scale(p.sx, p.sy);
      kText(ctx, '?', 0, 0, sz, { fill: C.butter, line: C.pinkD, outer: C.plum, lw: 0.2 }); ctx.restore();
    }
  }

  function sceneMint(ctx, W, H_, t) {
    bg(ctx, W, H_, t, TH.mint, 5);
    // emphasis: a punch-in on the wrong guess, with a two-frame shake
    const z = 1 + 0.08 * H.smooth(EX.wrong, EX.wrong + 0.12, t) * (1 - H.smooth(EX.adjust + 0.1, EX.adjust + 0.45, t));
    const shake = t >= EX.wrong && t < EX.wrong + 0.14 ? (Math.floor(t * 15) % 2 ? 7 : -7) : 0;
    ctx.save(); ctx.translate(470 + shake, 280); ctx.scale(z, z); ctx.translate(-470, -280);
    twinkles(ctx, W, H_, t, 41, 7, (x, y) => y > 120);

    // ---- DATA beat ----
    if (t < EX.dataOut + 0.3) {
      const out = popOut(t, EX.dataOut);
      const pl = pop(t, EX.lbl); if (pl.s > 0) { ctx.save(); ctx.translate(440, 150); ctx.scale(pl.sx * out, pl.sy * out); kText(ctx, 'Training data', 0, 0, 50, {}); ctx.restore(); }
      const lane = bez([110, 505], [350, 548], [650, 548], [860, 472]);
      if (out > 0) { ctx.save(); ctx.globalAlpha = out; dotted(ctx, lane, H.ease.out(H.clamp((t - EX.arrow[0]) / (EX.arrow[1] - EX.arrow[0]))), C.mintD, 6, 24); ctx.restore(); }
      const pc = pop(t, EX.cnt[0]);
      if (pc.s > 0 && out > 0) {
        const u = H.clamp((t - EX.cnt[0]) / (EX.cnt[1] - EX.cnt[0])), v = Math.round(1e6 * (1 - Math.pow(1 - u, 2.2)));
        let bump = 0; for (let i = 0; i < EX.cardN; i++) { const d = t - cardArrive(i); if (d >= 0 && d < 0.2) bump = 0.08 * (1 - d / 0.2); }
        ctx.save(); ctx.translate(390, 652); ctx.scale(pc.sx * out * (1 + bump), pc.sy * out * (1 + bump));
        kText(ctx, v.toLocaleString('en-US'), 0, 0, 82, { fill: C.butter, line: C.pinkD, outer: C.plum, ow: 0.08, lw: 0.16 }); ctx.restore();
        ctx.save(); ctx.translate(628, 650); ctx.scale(pc.s * out, pc.s * out); kText(ctx, 'examples', 0, 0, 40, { align: 'left', fill: C.white, line: C.mintD }); ctx.restore();
      }
    }

    // ---- the mascot ----
    let bx = 1000, by = 410, bs = 0.92, P = {};
    let lastArr = -9; for (let i = 0; i < EX.cardN; i++) if (t >= cardArrive(i)) lastArr = cardArrive(i);
    let nextArr = 99; for (let i = EX.cardN - 1; i >= 0; i--) if (t < cardArrive(i)) nextArr = cardArrive(i);
    if (t < EX.jump[0]) {
      const munch = t - lastArr < 0.2;
      P = { eyes: munch ? 'happy' : 'normal', look: [-0.7, 0.1], mouth: munch ? 'w' : nextArr - t < 0.3 ? 'O' : 'smile', glow: Math.exp(-(t - lastArr) * 5), lift: bob(t), sq: squash(t, lastArr, 0.12) };
    } else if (t < EX.jump[1]) {
      const u = (t - EX.jump[0]) / (EX.jump[1] - EX.jump[0]);
      bx = H.lerp(1000, 300, u); by = H.lerp(410, 420, u) - Math.sin(u * Math.PI) * 190; bs = H.lerp(0.92, 0.9, u);
      P = { eyes: 'happy', mouth: 'smile', armL: 2.2, armR: 2.2, sq: [0.88, 1.14], lift: 0 };
    } else {
      bx = 300; by = 420; bs = 0.9;
      const ph = t < EX.guess ? 'think' : t < EX.wrong ? 'guess' : t < EX.adjust ? 'wrong' : t < EX.guess2 ? 'adjust' : t < EX.right ? 'guess2' : 'right';
      const knobs = [-2.3, -0.5, -1.9].map((a0, i) => { const a1 = [-1.0, -1.9, -0.7][i], p = pop(t, EX.knobs + i * 0.12); return a0 + (a1 - a0) * p.s; });
      P = {
        think: { eyes: 'normal', look: [0.5, -0.6], mouth: 'flat' },
        guess: { eyes: 'normal', look: [0.7, 0], mouth: t < EX.check ? 'o' : 'smile' },
        wrong: { eyes: 'swirl', mouth: 'wobble', blush: false, tilt: 0.05 * Math.sin(t * 30) },
        adjust: { eyes: 'squeeze', mouth: t > EX.knobs ? 'w' : 'flat' },
        guess2: { eyes: 'normal', look: [0.7, -0.1], mouth: 'o' },
        right: { eyes: 'star', mouth: 'smile', armL: 2.4, armR: 2.0 },
      }[ph];
      P.knobs = knobs; P.sq = squash(t, EX.jump[1], 0.28); P.lift = t > EX.jump[1] + 0.5 ? bob(t) : 0; P.glow = ph === 'right' ? 0.8 : 0.3;
      if (ph === 'right') P.sq = squash(t, EX.right, 0.2);
    }
    bot(ctx, bx, by, bs, P);
    if (t >= EX.jump[0] && t < EX.jump[1] + 0.7) kana(ctx, 'ぴょん', 640, 210, 46, 0.12, pop(t, EX.jump[0] + 0.1).s * popOut(t, EX.jump[1] + 0.5), C.pink);
    if (t >= 3.4 && t < EX.dataOut) kana(ctx, 'もぐもぐ', 1170, 250, 40, 0.18, pop(t, 3.4).s * (Math.floor(t * 7.5) % 2 ? 1 : 0.94), C.butter);

    // ---- cards hopping in along the lane ----
    for (let i = 0; i < EX.cardN; i++) {
      const t0 = EX.card0 + i * EX.cardGap, u = (t - t0) / EX.cardTravel;
      if (u < 0 || u >= 1) continue;
      const kind = [0, 3, 5, 6].includes(i) ? 'cat' : 'dog';
      let x = H.lerp(-90, 850, Math.min(u / 0.85, 1)), y = 350 - Math.abs(Math.sin(Math.min(u / 0.85, 1) * Math.PI * 2)) * 62, s = 0.95;
      if (u > 0.85) { const v = (u - 0.85) / 0.15; x = H.lerp(850, 1000, v); y = H.lerp(350, 456, v); s = 0.95 * (1 - v * 0.85); }
      const land = Math.abs(Math.sin(Math.min(u / 0.85, 1) * Math.PI * 2)) < 0.25;
      card(ctx, x, y, s, kind, kind, { rot: 0.12 * Math.sin(u * Math.PI * 4), sx: land ? 1.08 : 0.96, sy: land ? 0.92 : 1.05, tagSize: 32 });
    }

    // ---- GUESS -> CHECK -> ADJUST ----
    if (t >= EX.newCard - 0.05) {
      // the new picture
      const pc = pop(t, EX.newCard);
      const fl = H.clamp((t - EX.check) / 0.2), flip = Math.abs(Math.cos(fl * Math.PI)) || 0.02;
      const lbl = fl < 0.5 ? '?' : 'cat';
      card(ctx, 628, 398, 1.1, 'cat', lbl, { sx: pc.sx, sy: pc.sy, flip, tagFill: fl < 0.5 ? C.pink : C.mint, tagSize: 32 });
      if (t >= EX.right) { const pk = pop(t, EX.right + 0.1); ctx.save(); ctx.translate(720, 505); ctx.scale(pk.s, pk.s); cel(ctx, ellP(0, 0, 22, 22), C.mintD, '#2fa078', -3, -3); ctx.strokeStyle = C.white; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-9, 1); ctx.lineTo(-2, 8); ctx.lineTo(10, -7); ctx.stroke(); ctx.restore(); }

      // the loop diagram
      const { cx, cy, r } = LOOP, rad = (d) => d * Math.PI / 180;
      [[-62, 6], [58, 122], [174, 246]].forEach(([a0, a1], i) => {
        const pts = arcPts(cx, cy, r, rad(a0), rad(a1));
        dotted(ctx, pts, H.ease.out(H.clamp((t - EX.loopArrows[i]) / 0.3)), C.lavD, 5.5, 20);
      });
      // star cursor runs the loop: Guess -> Check -> Adjust -> Guess
      if (t >= EX.guess) {
        const keys = [[EX.guess, -90], [EX.check, 30], [EX.adjust, 150], [EX.guess2, 270]];
        let a = 270; for (let i = 0; i < 3; i++) if (t < keys[i + 1][0]) { a = H.lerp(keys[i][1], keys[i + 1][1], H.ease.inOut(H.clamp((t - keys[i][0]) / 0.45))); break; }
        const sx_ = cx + Math.cos(rad(a)) * r, sy_ = cy + Math.sin(rad(a)) * r;
        cel(ctx, starP(sx_, sy_, 22, t * 3), C.butterD, C.butterS, -3, -3, 4);
      }
      const activeAt = (i) => (i === 0 ? (t >= EX.guess && t < EX.check) || t >= EX.guess2 : i === 1 ? t >= EX.check && t < EX.adjust : t >= EX.adjust && t < EX.guess2);
      const actT = [t >= EX.guess2 ? EX.guess2 : EX.guess, EX.check, EX.adjust];
      BADGE.forEach(([lbl, deg, col], i) => {
        const bxx = cx + Math.cos(rad(deg)) * r, byy = cy + Math.sin(rad(deg)) * r, pb = pop(t, EX.badges[i]);
        if (pb.s <= 0) return;
        const on = activeAt(i), pa = on ? pop(t, actT[i], 1.6) : null, k = on ? 1 + 0.12 * (pa.sx - pa.s) / Math.max(pa.s, 0.01) : 1;
        ctx.save(); ctx.translate(bxx, byy); ctx.scale(pb.sx * (on ? 1.08 * k : 1), pb.sy * (on ? 1.08 / k : 1));
        cel(ctx, rrP(-96, -36, 192, 72, 36), on ? col : C.white, on ? H.rgba(H.mix(col, C.plum, 0.18)) : '#e8e0ef', -4, -4, on ? 5 : 4);
        ctx.font = `700 38px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = on ? C.plum : H.rgba(C.plum, 0.62); ctx.fillText(lbl, 0, 2);
        ctx.restore();
        if (on) { const kk = Math.max(0, Math.sin(t * 9)); sparkle(ctx, bxx + 98, byy - 32, 9 + 7 * kk, C.butter, 0, 3); }
      });

      // thinking ... then speech bubble
      if (t >= EX.think && t < EX.guess) { const pt = pop(t, EX.think); ctx.save(); ctx.translate(480, 190); ctx.scale(pt.s, pt.s); thought(ctx, 0, 0, 1, [-100, 110], Math.min(3, 1 + Math.floor((t - EX.think) / 0.13)), t); ctx.restore(); }
      if (t >= EX.guess) {
        const second = t >= EX.guess2 + 0.05, pbub = pop(t, second ? EX.guess2 + 0.05 : EX.guess);
        bubble(ctx, 500, 185, 236, 112, [392, 296], [pbub.sx, pbub.sy]);
        ctx.save(); ctx.translate(500, 205); ctx.scale(pbub.s, pbub.s);
        kText(ctx, second ? 'cat!' : 'dog?', 0, 0, 60, second ? { fill: C.mint, line: C.mintD, shadow: false, lw: 0.16 } : { fill: C.sky, line: C.skyD, shadow: false, lw: 0.16 });
        ctx.restore();
        if (second && t >= EX.right) { const pk = pop(t, EX.right, 1.5); ctx.save(); ctx.translate(612, 140); ctx.scale(pk.sx, pk.sy); cel(ctx, ellP(0, 0, 40, 40), C.mintD, '#2fa078', -5, -5, 5); ctx.strokeStyle = C.white; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-17, 2); ctx.lineTo(-4, 15); ctx.lineTo(18, -12); ctx.stroke(); ctx.restore(); impactLines(ctx, 612, 140, 54, t, EX.right, 10, C.mintD); }
      }
      // the wrong guess: big rounded X stamp, !?, sweat drop, swirl eyes, ガーン
      if (t >= EX.wrong && t < EX.guess2 + 0.05) {
        const px = pop(t, EX.wrong, 1.6);
        ctx.save(); ctx.translate(612, 140); ctx.rotate(-0.12); ctx.scale(px.sx, px.sy);
        cel(ctx, ellP(0, 0, 44, 44), C.red, '#e2486c', -5, -5, 5);
        ctx.strokeStyle = C.white; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-16, -16); ctx.lineTo(16, 16); ctx.moveTo(16, -16); ctx.lineTo(-16, 16); ctx.stroke();
        ctx.restore();
        impactLines(ctx, 612, 140, 58, t, EX.wrong, 10, C.red);
        if (t < EX.adjust + 0.4) {
          const pe = pop(t, EX.wrong + 0.05, 1.5);
          ctx.save(); ctx.translate(205, 282); ctx.rotate(-0.15 + 0.06 * Math.sin(t * 20)); ctx.scale(pe.sx, pe.sy); kText(ctx, '!?', 0, 0, 72, { fill: C.red, line: C.white, outer: C.plum, lw: 0.2 }); ctx.restore();
          const ds = H.clamp((t - EX.wrong) / 0.6);
          sweat(ctx, 428, 318 + ds * 26, pop(t, EX.wrong + 0.07).s * 1.15, 0.35);
          kana(ctx, 'ガーン', 168, 170, 50, -0.12, pop(t, EX.wrong + 0.1).s, C.sky);
        }
      }
      // the error travels back into the model; the knobs turn
      if (t >= EX.errArrow[0] && t < EX.guess2 + 0.3) {
        const out = popOut(t, EX.guess2, 0.25);
        const path = bez([556, 530], [520, 640], [440, 640], [380, 572]);
        ctx.save(); ctx.globalAlpha = out;
        dotted(ctx, path, H.ease.out(H.clamp((t - EX.errArrow[0]) / (EX.errArrow[1] - EX.errArrow[0]))), C.red, 6, 22);
        const pu = H.clamp((t - EX.errArrow[0]) / 0.38);
        if (pu > 0 && pu < 1) { const [hx, hy] = along(path, plen(path) * pu); heart(ctx, hx, hy, 18 + 4 * Math.sin(t * 30), C.red); }
        const pl = pop(t, EX.errArrow[0] + 0.1);
        if (pl.s > 0) { ctx.save(); ctx.translate(505, 688); ctx.scale(pl.sx, pl.sy); kText(ctx, 'error!', 0, 0, 40, { fill: C.white, line: C.red }); ctx.restore(); }
        ctx.restore();
      }
      if (t >= EX.knobs && t < EX.guess2) { for (let i = 0; i < 3; i++) impactLines(ctx, 300 + (-34 + i * 34) * 0.9, 420 + 137 * 0.9, 18, t, EX.knobs + i * 0.12, 6, C.mintD); }
      if (t >= EX.weights) { const pw = pop(t, EX.weights); ctx.save(); ctx.translate(112, 560); ctx.scale(pw.sx, pw.sy); tag(ctx, 0, 0, 'weights', C.mint, 1, 32); ctx.restore(); dotted(ctx, [[184, 556], [232, 544]], pw.s > 0.5 ? 1 : 0, C.mintD, 4, 14, 0.7); }
      // hearts float on the correction
      if (t >= EX.right) for (let i = 0; i < 4; i++) { const u = t - EX.right - i * 0.12; if (u < 0) continue; heart(ctx, 180 + i * 60 + Math.sin(u * 6 + i) * 10, 330 - u * 120, 14 * Math.min(1, u * 6), [C.pinkD, C.pink, C.red, C.pinkD][i]); }
    }
    ctx.restore();
  }

  function sceneChart(ctx, W, H_, t) {
    bg(ctx, W, H_, t, TH.lav, 7);
    twinkles(ctx, W, H_, t, 61, 8, (x, y) => x < 760 || (x > 820 && y > 150 && y < 560));
    const BASE = 600, X0 = 150, DX = 74, BW = 60;
    // axis
    const ax = H.ease.out(H.clamp((t - EX.axis[0]) / (EX.axis[1] - EX.axis[0])));
    if (ax > 0) { ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = C.plum; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(100, BASE); ctx.lineTo(100 + 640 * ax, BASE); ctx.stroke(); ctx.strokeStyle = C.lav; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); }
    const pr = pop(t, EX.rounds);
    if (pr.s > 0) { ctx.save(); ctx.translate(400, 664); ctx.scale(pr.sx, pr.sy); kText(ctx, 'training rounds', -34, 0, 40, { fill: C.white, line: C.lavD }); dotted(ctx, [[134, -14], [196, -14]], 1, C.lavD, 5, 16, 0.9); ctx.restore(); }
    // bars pop up on twos; the mascot hops bar to bar
    const cols = [[C.pink, C.pinkS], [C.mint, C.mintS], [C.butter, C.butterS], [C.sky, C.skyS], [C.lav, C.lavS]];
    const heights = [];
    for (let i = 0; i < 8; i++) {
      const h = (accAt(i + 1) - 40) * 7.4, p = pop(t, EX.bar0 + i * EX.barGap, 1.2);
      heights.push(h * p.sy);
      if (p.s <= 0) continue;
      const x = X0 + i * DX, hh = h * p.sy, w = BW * (p.sx / Math.max(p.sy, 0.01));
      cel(ctx, rrP(x - w / 2, BASE - hh, w, hh + 10, [18, 18, 4, 4]), cols[i % 5][0], cols[i % 5][1], -7, -7);
      shine(ctx, x - w * 0.22, BASE - hh + 26, 5, 12, 0, 0.8);
    }
    {
      const s = 0.36, foot = 200 * s;
      let x = 80, y = BASE - foot - 46 * s, sq = [1, 1], eyes = 'normal', armL = 0.15, armR = 0.15;
      for (let i = 0; i < 8; i++) {
        const j0 = EX.bar0 + i * EX.barGap + 0.02, j1 = j0 + 0.18;
        const px = i ? X0 + (i - 1) * DX : 80, py = i ? BASE - heights[i - 1] : BASE;
        if (t >= j0 && t < j1) { const u = (t - j0) / (j1 - j0), ty = BASE - (accAt(i + 1) - 40) * 7.4; x = H.lerp(px, X0 + i * DX, u); y = H.lerp(py, ty, u) - Math.sin(u * Math.PI) * 70 - foot - 46 * s; sq = [0.9, 1.12]; armL = armR = 2.0; eyes = 'happy'; }
        else if (t >= j1) { x = X0 + i * DX; y = BASE - heights[i] - foot - 46 * s; sq = squash(t, j1, 0.25); }
      }
      if (t >= EX.hit) { eyes = 'star'; armL = 2.5 + 0.3 * Math.sin(t * 12); armR = 2.5 + 0.3 * Math.sin(t * 12 + 1); }
      bot(ctx, x, y, s, { sq, eyes, armL, armR, mouth: t >= EX.hit ? 'smile' : 'o', glow: t >= EX.hit ? 1 : 0.3, shadow: false });
    }
    // accuracy number
    const pa = pop(t, EX.accLbl);
    if (t >= EX.hit) {
      const pb = pop(t, EX.hit, 1.4);
      ctx.save(); ctx.translate(1010, 370); ctx.rotate(t * 0.6); ctx.scale(pb.s, pb.s);
      cel(ctx, roundPoly(starPts(0, 0, 165, 132, 14), 14), C.butter, C.butterS, -8, -8, 5); ctx.restore();
    }
    if (pa.s > 0) { ctx.save(); ctx.translate(1010, 200); ctx.scale(pa.sx, pa.sy); kText(ctx, 'Accuracy', 0, 0, 52, { fill: C.white, line: C.lavD }); ctx.restore(); }
    if (pa.s > 0) {
      const k = H.clamp((t - EX.bar0) / EX.barGap, 0, 8), v = Math.round(accAt(Math.floor(k)));
      const hit = t >= EX.hit, ph = hit ? pop(t, EX.hit, 1.6) : pa;
      const sz = 1;
      ctx.save(); ctx.translate(1010, 425); ctx.scale(ph.sx * sz, ph.sy * sz);
      kText(ctx, v + '%', 0, 0, 156, hit ? { fill: C.pinkD, line: C.white, outer: C.plum, ow: 0.07, lw: 0.13 } : { fill: C.white, line: C.lavD, lw: 0.16 });
      ctx.restore();
    }
    if (t >= EX.hit) impactLines(ctx, 1010, 370, 190, t, EX.hit, 14, C.pinkD);
    const pp = pop(t, EX.pill);
    if (pp.s > 0) {
      ctx.save(); ctx.translate(1010, 528); ctx.scale(pp.sx, pp.sy);
      cel(ctx, rrP(-150, -32, 300, 64, 32), C.white, '#e8e0ef', -4, -4);
      ctx.font = `700 34px ${FONT}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = C.plum; ctx.fillText('61%', -82, 2); ctx.fillStyle = C.pinkD; ctx.fillText('97%', 84, 2);
      dotted(ctx, [[-30, 0], [26, 0]], 1, C.lavD, 4, 14, 0.7);
      ctx.restore();
    }
    if (t >= EX.hit) {
      kana(ctx, 'やったー!', 470, 130, 50, -0.1, pop(t, EX.hit + 0.08).s, C.butter);
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t * 1.5, kk = Math.max(0, Math.sin(t * 8 + i * 2)); sparkle(ctx, 1010 + Math.cos(a) * 230, 370 + Math.sin(a) * 175, 10 + 10 * kk, i % 2 ? C.white : C.butter, 0, 3); }
      confetti(ctx, t, EX.hit, 1010, 330, 46, 9, 1.1);
      confetti(ctx, t, EX.hit + 0.1, 640, -20, 30, 12, 0.6);
    }
  }

  function sceneEnd(ctx, W, H_, t) {
    bg(ctx, W, H_, t, TH.butter, 9);
    twinkles(ctx, W, H_, t, 81, 10, (x, y) => y < 290 && x > 180 && x < 1100);
    const pf0 = pop(t, EX.friends[0]), pf1 = pop(t, EX.friends[1]);
    const hop = (ph) => Math.max(0, Math.sin(t * TAU * 1.5 + ph)) * 18;
    if (pf0.s > 0) cat(ctx, 300, 520, 0.8 * pf0.s, { eyes: 'happy', mouth: 'smile', wag: Math.sin(t * 8), lift: hop(0), sq: [pf0.sx / pf0.s, pf0.sy / pf0.s] });
    if (pf1.s > 0) dog(ctx, 980, 520, 0.8 * pf1.s, { eyes: 'happy', wag: Math.sin(t * 10), lift: hop(1.5), sq: [pf1.sx / pf1.s, pf1.sy / pf1.s] });
    bot(ctx, 640, 470, 0.74, { eyes: t < EX.take2 + 0.4 ? 'star' : 'happy', mouth: 'smile', armL: 2.3 + 0.35 * Math.sin(t * 9), armR: 2.3 + 0.35 * Math.sin(t * 9 + 1.5), glow: 0.6 + 0.4 * Math.sin(t * 6), lift: hop(0.8) * 1.4, sq: squash(t, EX.w3 + 0.1, 0.15) });
    for (let i = 0; i < 6; i++) { const u = ((t - EX.w3) * 0.7 + i / 6) % 1; heart(ctx, [150, 470, 820, 1140, 380, 900][i] + Math.sin(u * 9 + i) * 14, 700 - u * 420, 12 + 6 * Math.sin(u * Math.PI), [C.pinkD, C.pink, C.red][i % 3]); }
    // takeaway lettering, two lines with a chunky drawn arrow
    const w1 = kWord(ctx, 'More examples', 610, 162, 70, t, EX.take1, 0.035, { fill: C.white, line: C.pinkD, track: 2 });
    const pa = pop(t, EX.take1 + 13 * 0.035 + 0.05);
    if (pa.s > 0) { ctx.save(); ctx.translate(610 + w1 / 2 + 52, 138); ctx.scale(pa.sx, pa.sy); const p = roundPoly([[-34, -11], [6, -11], [6, -28], [38, 0], [6, 28], [6, 11], [-34, 11]], 6); cel(ctx, p, C.pinkD, '#e2527f', -3, -3, 5); ctx.restore(); }
    kWord(ctx, 'better guesses!', 640, 264, 80, t, EX.take2, 0.035, { fill: C.white, line: C.mintD, outer: C.plum, ow: 0.09, lw: 0.2, track: 4 });
  }

  // ---------- still / clip composition ----------
  function drawHero(ctx, W, H_, t) {
    const tq = q15(t);
    const scene = () => {
      bg(ctx, W, H_, tq, TH.pink, 2);
      twinkles(ctx, W, H_, tq, 13, 12, (x, y) => Math.abs(x - 640) < 520 && y > 230 && y < 680);
      // characters
      const landB = 0.8;
      if (tq >= 0.45) {
        let y = 440, sq;
        if (tq < landB) { const u = (tq - 0.45) / (landB - 0.45); y = 440 - 600 * (1 - u * u); sq = [0.86, 1.16]; } else sq = squash(tq, landB, 0.26);
        const blink = tq > 3.2 && tq < 3.34;
        const wave = tq > 2.5 ? 2.3 + 0.45 * Math.sin((tq - 2.5) * 9) : 0.15;
        bot(ctx, 640, y, 1.0, { sq, lift: tq > landB + 0.4 ? bob(tq) : 0, eyes: blink ? 'blink' : 'normal', look: [0, 0.1], mouth: 'smile', armR: wave, glow: 0.55 + 0.35 * Math.sin(tq * 6) });
        kana(ctx, 'ぽよん', 790, 660, 40, 0.12, tq > landB && tq < landB + 1.1 ? pop(tq, landB).s * popOut(tq, landB + 0.9) : 0, C.mint);
      }
      const pc = pop(tq, 1.1), pd = pop(tq, 1.3);
      if (pc.s > 0) cat(ctx, 270, 500, 0.86 * pc.s, { sq: [pc.sx / pc.s, pc.sy / pc.s], lift: Math.max(0, bob(tq, 1.2, 10)), wag: Math.sin(tq * 5), look: [0.6, -0.2], mouth: 'w' });
      if (pd.s > 0) dog(ctx, 1010, 500, 0.86 * pd.s, { sq: [pd.sx / pd.s, pd.sy / pd.s], lift: Math.max(0, bob(tq, 2.4, 10)), wag: Math.sin(tq * 9), look: [-0.6, -0.2] });
      // floating hearts + sparkles
      if (tq >= 2.5) {
        for (let i = 0; i < 4; i++) { const u = ((tq - 2.5) * 0.45 + i / 4) % 1; heart(ctx, [400, 880, 520, 760][i] + Math.sin(u * 8 + i) * 12, 600 - u * 300, (10 + 6 * Math.sin(u * Math.PI)) * Math.min(1, (tq - 2.5) * 3), [C.pinkD, C.pink, C.red, C.pinkD][i]); }
        const sp = [[455, 270, 22], [835, 300, 18], [160, 330, 16], [1130, 330, 20], [600, 600, 12]];
        sp.forEach(([x, y, R], i) => { const p = pop(tq, 2.5 + i * 0.07), k = 0.7 + 0.3 * Math.sin(tq * 5 + i * 2); sparkle(ctx, x, y, R * p.s * k, i % 2 ? C.white : C.butterD, 0, 3.5); });
        kana(ctx, 'キラキラ', 1135, 225, 42, 0.16, pop(tq, 2.7).s, C.butter);
      }
      // title lettering
      kWord(ctx, 'Hello, AI buddy!', 640, 150, 92, tq, 1.6, 0.05, { fill: C.white, line: C.pinkD, wob: 0.03 });
    };
    if (t < 0.6) {
      // eyecatch card, then a star iris opens onto the scene
      bg(ctx, W, H_, tq, TH.butter, 4);
      sparkle(ctx, 640, 360, 70 * pop(tq, 0).s, C.white, 0, 5);
      const u = H.clamp((t - 0.1) / 0.5);
      if (u > 0) wipe(ctx, W, H_, u, 'star', 640, 400, scene);
    } else scene();
  }

  registerStyle({
    id: 'kawaii',
    name: 'Kawaii Anime',
    category: 'Popular Explainer Looks',
    description: 'Flat 2D kawaii anime illustration: chibi characters with big glossy anime eyes and blush marks, chunky rounded shapes in strawberry-milk pink, mint, butter, lavender and sky, soft plum outlines of even weight, one cel-shadow tone and a small highlight, on polka-dot and star patterns.',
    motion: 'Everything pops in on twos with bouncy squash-and-stretch, characters bob and wiggle, sparkles twinkle, and scenes change through star and heart iris wipes.',
    fonts: ['700 80px "Fredoka"', '600 30px "Fredoka"', '900 46px "Zen Maru Gothic"'],
    frameT: 4.6,
    duration: 5,
    readsPixels: false,
    draw(ctx, W, H_, t) { drawHero(ctx, W, H_, t); },

    explainerDuration: EX.D,
    explainerNote: 'A chibi robot mascot acts the lesson out with anime reaction grammar (swirl eyes, sweat drop and "!?" on the wrong guess, star eyes and confetti at 97%); scenes change through star and heart iris wipes, connectors are dotted candy arrows, and the counters are bouncing outlined numerals.',
    explainer(ctx, W, H_, t) {
      const tq = q15(t);
      const S = [[0, sceneHook], [EX.w1, sceneMint, 'star', 640, 430], [EX.w2, sceneChart, 'heart', 640, 380], [EX.w3, sceneEnd, 'star', 1010, 400]];
      let cur = 0; for (let i = 0; i < S.length; i++) if (t >= S[i][0]) cur = i;
      const s = S[cur], wu = cur > 0 ? (t - s[0]) / EX.wd : 1;
      if (wu < 1) { S[cur - 1][1](ctx, W, H_, tq); wipe(ctx, W, H_, wu, s[2], s[3], s[4], () => s[1](ctx, W, H_, tq)); }
      else s[1](ctx, W, H_, tq);
      header(ctx, tq);
    },

    explainerSound(k) {
      // Everything animates on twos (15 fps grid): a pop(t0) first shows on the next grid frame after t0.
      const vis = (t0) => (Math.floor(t0 * 15 + 1e-6) + 1) / 15;
      const grid = (t0) => Math.floor(t0 * 15 + 1e-6) / 15;
      // ---- custom cute sounds (built from k.tone / k.noise; all tonal parts kept under ~1.6 kHz) ----
      const bloop = (t, f = 420, g = 1, o = {}) => { k.tone(t, { f: [[0, f * 0.7], [0.07, f * 1.35]], dur: 0.11, gain: 0.2 * g, pan: o.pan, minor: o.minor }); k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1600, q: 1.2, gain: 0.05 * g, pan: o.pan, minor: o.minor }); };
      const boing = (t, g = 1, o = {}) => { k.tone(t, { f: [[0, 150], [0.05, 290], [0.12, 190], [0.2, 250], [0.3, 210], [0.4, 225]], type: 'triangle', dur: 0.45, gain: 0.22 * g, pan: o.pan, minor: o.minor }); k.tone(t, { f: [[0, 75], [0.06, 140], [0.3, 110]], dur: 0.3, gain: 0.2 * g, minor: o.minor }); };
      const pyon = (t, g = 1, o = {}) => { k.tone(t, { f: [[0, 330], [0.15, 860]], type: 'triangle', dur: 0.19, gain: 0.1 * g, a: 0.005, pan: o.pan, minor: o.minor }); k.tone(t, { f: [[0, 165], [0.15, 430]], dur: 0.19, gain: 0.12 * g, pan: o.pan, minor: o.minor }); };
      const bell = (t, f, g = 1, o = {}) => { const hz = k.hz(f); k.tone(t, { f: hz, dur: o.dur || 0.9, gain: 0.09 * g, a: 0.004, verb: 0.35, pan: o.pan, minor: o.minor }); k.tone(t, { f: hz * 2, dur: 0.3, gain: 0.025 * g, a: 0.003, verb: 0.3, pan: o.pan, minor: o.minor }); };
      const twinkle = (t, n = 4, g = 1, minor = true) => { const ns = ['G4', 'C5', 'E5', 'G5', 'A5', 'C6']; for (let i = 0; i < n; i++) bell(t + i * 0.06, ns[(i * 2 + n) % ns.length], 0.55 * g, { dur: 0.7, pan: (i % 2 ? 0.35 : -0.35), minor }); };
      const nom = (t, g = 1) => { k.tone(t, { f: [[0, 280], [0.09, 170]], dur: 0.12, gain: 0.22 * g, pan: 0.4, minor: true }); k.noise(t, { dur: 0.05, color: 'pink', filter: 'lowpass', f: 900, gain: 0.08 * g, pan: 0.4, minor: true }); };
      const iris = (t, d = 0.5, base = 'C5') => { // star/heart iris wipe: a soft rising glide + airy sweep, sparkle at the open
        k.tone(t, { f: [[0, k.hz(base) / 2], [d, k.hz(base) * 1.5]], dur: d + 0.05, gain: 0.06, a: d * 0.6, verb: 0.3 });
        k.noise(t, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 300], [d, 1800]], q: 0.8, gain: 0.14, a: d * 0.7 });
        twinkle(t + d * 0.75, 3, 0.8, false);
      };

      k.music('pad', 0, EX.D, { bpm: 120, gain: 0.42, chords: [['C4', 'E4', 'G4', 'B4'], ['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'B3', 'D4', 'G4']] });

      // 1 HOOK: mascot drops in and lands (boing), title letters pop by word, ? marks, title slides to the corner
      k.tone(vis(0.15), { f: [[0, 700], [0.3, 320]], dur: 0.32, gain: 0.05, minor: true }); // falling
      boing(vis(EX.land) , 1.1);
      ['How', 'does', 'AI', 'learn?'].reduce((ci, w, i) => { bloop(vis(EX.title0 + ci * EX.stg), [520, 580, 660, 780][i], 0.8, { minor: true }); return ci + w.length + 1; }, 0);
      bloop(vis(EX.q1), 360, 1.1); bloop(vis(EX.q2), 470, 0.8, { minor: true });
      k.noise(grid(EX.shrink) + 1 / 15, { dur: 0.4, color: 'pink', filter: 'lowpass', f: [[0, 500], [0.4, 220]], gain: 0.1, a: 0.12, minor: true }); // soft slide to corner
      bloop(vis(EX.shrink + 0.25), 640, 0.6, { minor: true }); // header pill

      // 2 DATA
      iris(EX.w1, EX.wd, 'C5');
      bloop(vis(EX.lbl), 520, 0.9);
      for (let i = 0; i < 6; i++) k.play('tock', EX.arrow[0] + i * 0.09, { f: 1500, gain: 0.3, pan: -0.3, minor: true }); // dotted lane drawing on
      bloop(vis(EX.cnt[0]), 440, 0.9);
      for (let i = 0; i < EX.cardN; i++) { const t0 = EX.card0 + i * EX.cardGap; pyon(vis(t0 + EX.cardTravel * 0.2), 0.3, { minor: true, pan: -0.5 }); nom(cardArrive(i)); }
      { // counter ticks: when the shown number changes, at most ~11/s, thinning as it settles
        let last = -1, lastT = -1;
        for (let f = Math.ceil(EX.cnt[0] * 15); f / 15 <= EX.cnt[1] + 0.01; f++) {
          const tt = f / 15, u = H.clamp((tt - EX.cnt[0]) / (EX.cnt[1] - EX.cnt[0])), v = Math.round(1e6 * (1 - Math.pow(1 - u, 2.2)));
          const gap = 0.09 + 0.25 * u * u;
          if (v !== last && tt - lastT >= gap) { k.play('tock', tt, { f: 1250 + u * 350, gain: 0.42, pan: -0.25, minor: true }); last = v; lastT = tt; }
        }
        bell(EX.cnt[1], 'E5', 1.1); // 1,000,000 lands
      }
      for (let i = 0; i < 3; i++) k.tone(vis(EX.dataOut) + i * 0.04, { f: [[0, 600 - i * 80], [0.08, 300 - i * 40]], dur: 0.1, gain: 0.08, minor: true }); // poof out

      // 3 GUESS -> CHECK -> ADJUST
      pyon(vis(EX.jump[0]), 1.2); boing(vis(EX.jump[1]), 0.8);
      bloop(vis(EX.newCard), 400, 1);
      EX.badges.forEach((b, i) => bloop(vis(b), 500 + i * 90, 0.6, { minor: true, pan: 0.5 }));
      EX.loopArrows.forEach((a, i) => k.play('tock', a + 0.3, { f: 650 + i * 120, gain: 0.25, pan: 0.5, minor: true }));
      bloop(vis(EX.guess), 470, 1.1); k.play('tock', vis(EX.guess), { f: 880, gain: 0.25, pan: 0.5, minor: true }); // "dog?" + Guess lights
      k.play('tock', vis(EX.check), { f: 980, gain: 0.3, pan: 0.6 }); k.noise(vis(EX.check), { dur: 0.16, filter: 'bandpass', f: [[0, 600], [0.16, 1400]], q: 1, gain: 0.08, minor: true }); // tag flips to "cat"
      // the wrong guess: X stamp, a soft descending "aww", sweat drop slide
      { const t = vis(EX.wrong);
        k.play('thud', t, { f: 120, gain: 0.55 }); bloop(t, 300, 0.9);
        k.tone(t + 0.05, { f: [[0, 'E4'], [0.3, 'D#4']], type: 'sawtooth', filter: 'lowpass', f2: 900, dur: 0.32, gain: 0.04, a: 0.03, hold: 0.15 });
        k.tone(t + 0.05, { f: [[0, 'E4'], [0.3, 'D#4']], type: 'triangle', dur: 0.32, gain: 0.07, a: 0.03, hold: 0.15 });
        k.tone(t + 0.34, { f: [[0, 'C4'], [0.55, 'A3']], type: 'sawtooth', filter: 'lowpass', f2: 800, dur: 0.6, gain: 0.04, a: 0.03, hold: 0.25 });
        k.tone(t + 0.34, { f: [[0, 'C4'], [0.55, 'A3']], type: 'triangle', dur: 0.6, gain: 0.07, a: 0.03, hold: 0.25 });
        k.tone(vis(EX.wrong + 0.07), { f: [[0, 520], [0.5, 260]], dur: 0.5, gain: 0.04, a: 0.05, minor: true }); // sweat drop slides
      }
      // adjust: the error heart travels back, the knobs ratchet
      k.play('tock', vis(EX.adjust), { f: 760, gain: 0.9, pan: 0.3 }); bloop(vis(EX.adjust), 380, 0.5);
      k.tone(vis(EX.errArrow[0]), { f: [[0, 520], [0.3, 220]], dur: 0.32, gain: 0.08, a: 0.04, pan: 0.2 }); // the error pulse runs into the model
      bloop(vis(EX.errArrow[0] + 0.1), 330, 0.6, { minor: true });
      for (let i = 0; i < 3; i++) { const t0 = vis(EX.knobs + i * 0.12); k.play('tock', t0, { f: 1100 - i * 90, gain: 0.75, pan: -0.4, minor: true }); k.noise(t0 + 0.05, { dur: 0.05, filter: 'bandpass', f: 1300, q: 3, gain: 0.08, pan: -0.4, minor: true }); }
      bloop(vis(EX.weights) + 0.16, 560, 0.7, { minor: true });
      // the second guess is right: rising arpeggio + twinkle + hearts
      bloop(vis(EX.guess2 + 0.05), 520, 1); k.play('tock', vis(EX.guess2), { f: 880, gain: 0.25, pan: 0.5, minor: true });
      ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => bell(vis(EX.right) + i * 0.07, n, 1.0 - i * 0.08, { dur: 0.8 }));
      twinkle(vis(EX.right) + 0.3, 4, 0.8);

      // 4 PROGRESS
      iris(EX.w2, EX.wd, 'D5');
      k.noise(EX.axis[0], { dur: 0.25, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.25, 900]], q: 1, gain: 0.08, a: 0.05, minor: true }); // axis draws
      bloop(vis(EX.rounds), 480, 0.7, { minor: true }); bloop(vis(EX.accLbl) + 0.03, 600, 0.7, { minor: true });
      const scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
      for (let i = 0; i < 8; i++) {
        const tb = vis(EX.bar0 + i * EX.barGap);
        k.tone(tb, { f: [[0, k.hz(scale[i]) * 0.8], [0.06, k.hz(scale[i])]], type: 'triangle', dur: 0.16, gain: 0.16, pan: -0.3 }); // bar pops up, climbing in pitch (the counter steps with it)
        pyon(vis(EX.bar0 + i * EX.barGap + 0.02) + 0.02, 0.5, { minor: true, pan: -0.3 });
      }
      { // 97%: bright chime chord, a soft low hit, confetti flutter, twinkles
        const t = vis(EX.hit);
        k.play('impact', t, { f: 110, gain: 0.55 });
        ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => bell(t + i * 0.012, n, 1.9, { dur: 1.7, pan: (i - 1.5) * 0.3 }));
        k.tone(t, { f: 'C3', type: 'triangle', dur: 1.2, gain: 0.12, a: 0.01 });
        for (let i = 0; i < 18; i++) k.noise(t + 0.08 + i * 0.05 + (i % 3) * 0.013, { dur: 0.018, filter: 'bandpass', f: 1800 + (i * 337) % 1400, q: 1.5, gain: 0.05 * (1 - i / 22), pan: ((i * 0.37) % 1.4) - 0.7, minor: true });
        twinkle(t + 0.25, 5, 0.9);
        bloop(vis(EX.pill), 560, 0.6, { minor: true });
      }

      // 5 TAKEAWAY
      iris(EX.w3, 0.5, 'E5');
      bloop(vis(EX.friends[0]), 430, 0.8, { pan: -0.5 }); bloop(vis(EX.friends[1]), 500, 0.8, { pan: 0.5 });
      bloop(vis(EX.take1), 560, 0.8, { minor: true }); bloop(vis(EX.take1 + 5 * 0.035), 620, 0.8, { minor: true });
      bloop(vis(EX.take1 + 13 * 0.035 + 0.05), 700, 0.7, { minor: true }); // arrow
      bloop(vis(EX.take2), 660, 0.9, { minor: true }); bloop(vis(EX.take2 + 7 * 0.035), 740, 0.9, { minor: true });
      { const t = vis(EX.take2 + 14 * 0.035) + 0.1; // last letter lands: resolving chord
        ['G4', 'C5', 'E5', 'G5'].forEach((n, i) => bell(t + i * 0.05, n, 1.3, { dur: 1.4 }));
        k.tone(t, { f: 'C3', type: 'triangle', dur: 1.2, gain: 0.1, a: 0.02 });
      }
      twinkle(14.9, 3, 0.6);
    },
  });
}
