// Manim-Style Math: the math-explainer look popularised by 3Blue1Brown's open-source Manim library. Pure black
// background, crisp anti-aliased vectors, a restrained Manim palette (blue, teal, yellow, red, green, white), math
// typeset in a LaTeX-like serif with italic variables, axes with tick marks, curves, arrows and braces. Motion uses
// Manim's own vocabulary: Write (glyph outlines trace on, then fill), Create, Transform, Indicate, FadeIn-shift,
// ShowPassingFlash and SurroundingRectangle, all on the sigmoid `smooth` rate function. No characters, no branding.
{
  const cl = H.clamp, lerp = H.lerp;
  const sig = (x) => 1 / (1 + Math.exp(-x));
  const SE = sig(-5);
  // Manim's `smooth` rate function (inflection 10)
  const SM = (x) => { x = cl(x); return cl((sig(10 * (x - 0.5)) - SE) / (1 - 2 * SE)); };
  const seg = (a, b, t) => cl((t - a) / (b - a));
  const sm = (a, b, t) => SM(seg(a, b, t));
  // there_and_back
  const tab = (a, b, t) => { const x = seg(a, b, t); return x <= 0 || x >= 1 ? 0 : SM(x < 0.5 ? 2 * x : 2 - 2 * x); };
  const C = {
    bg: '#000000', blue: '#58C4DD', blueE: '#236B8E', teal: '#5CD0B3', yellow: '#FFFF00', gold: '#F7D96F',
    red: '#FC6255', green: '#83C167', white: '#FFFFFF', grey: '#888888', greyL: '#BBBBBB', greyD: '#444444',
  };
  const mixc = (a, b, t) => '#' + H.mix(a, b, cl(t)).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const FAM = '"STIX Two Text", "STIXGeneral", "Times New Roman", serif';
  const fnt = (sz, it, w) => `${it ? 'italic ' : ''}${w || 400} ${sz}px ${FAM}`;
  const TAU = Math.PI * 2;

  // ------------------------------------------------------------------ typesetting (a tiny MathTex)
  // token: { s, it (italic), c (colour), w (weight), sz (relative size), dy (baseline shift in em), k (match key), gap (em), kern (em) }
  const T = (s, o) => Object.assign({ s }, o || {});
  function layout(ctx, toks, size, x, y, align) {
    const gl = []; let cx = 0;
    for (const tk of toks) {
      if (tk.gap) { cx += tk.gap * size; continue; }
      const sz = size * (tk.sz || 1), font = fnt(sz, tk.it, tk.w);
      ctx.font = font;
      const s = tk.s;
      for (let i = 0; i < s.length; i++) {
        if (s[i] === ' ') continue;
        const off = i ? ctx.measureText(s.slice(0, i)).width : 0;
        gl.push({ ch: s[i], x: cx + off, y: (tk.dy || 0) * size, font, sz, c: tk.c || C.white, k: tk.k || s, ki: i, tag: tk.tag });
      }
      cx += ctx.measureText(s).width + (tk.kern || 0) * size;
    }
    const w = cx, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    for (const g of gl) { g.x += x0; g.y += y; }
    return { gl, w, x0, x1: x0 + w, y, size, cx: x0 + w / 2 };
  }
  // one glyph, Write-style: outline traces on (dash per contour), then the fill comes up as the outline fades
  function glyph(ctx, g, a, alpha, col, x, y, s) {
    if (a <= 0 || alpha <= 0.003) return;
    x = x == null ? g.x : x; y = y == null ? g.y : y; s = s || 1;
    ctx.save();
    ctx.translate(x, y); if (s !== 1) ctx.scale(s, s);
    ctx.font = g.font;
    if (a >= 1) { ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.fillText(g.ch, 0, 0); ctx.restore(); return; }
    const d = SM(a * 2), f = SM(a * 2 - 1), Lm = g.sz * 4;
    if (f < 1) { ctx.globalAlpha = alpha * (1 - f); ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, g.sz * 0.028); ctx.setLineDash([d * Lm + 0.01, Lm * 30]); ctx.strokeText(g.ch, 0, 0); }
    if (f > 0) { ctx.setLineDash([]); ctx.globalAlpha = alpha * f; ctx.fillStyle = col; ctx.fillText(g.ch, 0, 0); }
    ctx.restore();
  }
  // Write(p): glyph sub-animations with Manim's lag ratio min(4/n, 0.2)
  function writeA(n, p, i) {
    if (p >= 1) return 1;
    const r = Math.min(4 / Math.max(1, n), 0.2), Ld = 1 / (1 + (n - 1) * r);
    return cl((p - i * r * Ld) / Ld);
  }
  function drawTex(ctx, L, o) {
    o = o || {};
    const p = o.p == null ? 1 : o.p, alpha = o.alpha == null ? 1 : o.alpha, n = L.gl.length;
    const dx = o.dx || 0, dy = o.dy || 0;
    L.gl.forEach((g, i) => {
      const col = o.col ? (typeof o.col === 'function' ? o.col(g, i) : o.col) : g.c;
      let s = 1, x = g.x + dx, y = g.y + dy;
      if (o.scale && o.scale !== 1) { const ox = o.ox == null ? L.cx : o.ox, oy = o.oy == null ? L.y - L.size * 0.33 : o.oy; x = ox + (x - ox) * o.scale; y = oy + (y - oy) * o.scale; s = o.scale; }
      glyph(ctx, g, writeA(n, p, i), alpha, col, x, y, s);
    });
  }
  // Transform / TransformMatchingTex: glyphs with the same key fly to their new places (resizing, recolouring);
  // the rest fade out / in while shifting with the group (FadeTransform).
  function morphTex(ctx, A, B, q, o) {
    o = o || {};
    const alpha = o.alpha == null ? 1 : o.alpha, used = new Set();
    const dx = B.cx - A.cx, dy = B.y - A.y, sc = B.size / A.size;
    const colA = (g) => (o.colA ? o.colA(g) : g.c), colB = (g) => (o.colB ? o.colB(g) : g.c);
    for (const g of A.gl) {
      const j = B.gl.findIndex((h, jj) => !used.has(jj) && h.k === g.k && h.ki === g.ki);
      if (j >= 0) {
        used.add(j); const h = B.gl[j];
        glyph(ctx, g, 1, alpha, mixc(colA(g), colB(h), q), lerp(g.x, h.x, q), lerp(g.y, h.y, q), lerp(1, h.sz / g.sz, q));
      } else {
        glyph(ctx, g, 1, alpha * (1 - q), colA(g), A.cx + (g.x - A.cx) * lerp(1, sc, q) + dx * q, A.y + (g.y - A.y) * lerp(1, sc, q) + dy * q, lerp(1, sc, q));
      }
    }
    B.gl.forEach((h, j) => {
      if (used.has(j)) return;
      glyph(ctx, h, 1, alpha * q, colB(h), B.cx + (h.x - B.cx) * lerp(1 / sc, 1, q) - dx * (1 - q), B.y + (h.y - B.y) * lerp(1 / sc, 1, q) - dy * (1 - q), lerp(1 / sc, 1, q));
    });
  }
  // DecimalNumber / Integer with commas
  const commas = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // ------------------------------------------------------------------ vector primitives
  function cumLen(pts) { const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return c; }
  function pathPart(ctx, pts, a, b, cum) {
    cum = cum || cumLen(pts);
    const L = cum[cum.length - 1], A = a * L, B = b * L;
    if (B <= A) return false;
    const at = (d) => { let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const u = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u), i]; };
    const s = at(A), e = at(B);
    ctx.beginPath(); ctx.moveTo(s[0], s[1]);
    for (let i = s[2]; i < e[2]; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.lineTo(e[0], e[1]);
    return true;
  }
  function strokePts(ctx, pts, col, lw, a, b, alpha, cum) {
    if (alpha != null && alpha <= 0.003) return;
    ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
    if (pathPart(ctx, pts, a == null ? 0 : a, b == null ? 1 : b, cum)) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
    ctx.restore();
  }
  // ShowPassingFlash: a bright piece of the path travelling along it (time width w)
  function flash(ctx, pts, u, col, lw, w, alpha, cum) {
    w = w || 0.3; const b = lerp(0, 1 + w, u), a = b - w;
    strokePts(ctx, pts, col, lw, Math.max(0, a), Math.min(1, b), alpha, cum);
  }
  function tip(ctx, x, y, ang, len, col, alpha) {
    ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.fillStyle = col;
    ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-len, -len * 0.5); ctx.lineTo(-len, len * 0.5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // Arrow with GrowArrow progress p
  function arrow(ctx, x1, y1, x2, y2, col, lw, p, tl, alpha) {
    p = p == null ? 1 : p; if (p <= 0) return;
    tl = (tl || 18) * Math.min(1, p * 1.5);
    const ex = lerp(x1, x2, p), ey = lerp(y1, y2, p), ang = Math.atan2(y2 - y1, x2 - x1);
    const sx = ex - Math.cos(ang) * tl * 0.9, sy = ey - Math.sin(ang) * tl * 0.9;
    strokePts(ctx, [[x1, y1], [sx, sy]], col, lw, 0, 1, alpha);
    tip(ctx, ex, ey, ang, tl, col, alpha);
  }
  // CurvedArrow along an arc from (x1,y1) to (x2,y2) bulging by `bend` (fraction of length, + = left of travel)
  function arcPts(x1, y1, x2, y2, bend, n) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    const cx = mx - dy / L * bend * L, cy = my + dx / L * bend * L, pts = [];
    for (let i = 0; i <= (n || 24); i++) { const u = i / (n || 24); pts.push([(1 - u) * (1 - u) * x1 + 2 * u * (1 - u) * cx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * u * (1 - u) * cy + u * u * y2]); }
    return pts;
  }
  function curvedArrow(ctx, pts, col, lw, p, tl, alpha) {
    if (p <= 0) return;
    const cum = cumLen(pts), L = cum[cum.length - 1];
    tl = tl || 16;
    const end = p * L, k = cum.findIndex((c) => c >= end - tl * 0.85);
    strokePts(ctx, pts, col, lw, 0, Math.max(0, (end - tl * 0.85) / L), alpha, cum);
    // tip at the current end, aligned to the path there
    let i = 1; while (i < cum.length - 1 && cum[i] < end) i++;
    const u = (end - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
    const ex = lerp(pts[i - 1][0], pts[i][0], u), ey = lerp(pts[i - 1][1], pts[i][1], u);
    const j = Math.max(0, k);
    tip(ctx, ex, ey, Math.atan2(ey - pts[j][1], ex - pts[j][0]), tl * Math.min(1, p * 2), col, alpha);
  }
  // SurroundingRectangle drawn with Create (Manim polygon order: UR -> UL -> DL -> DR -> UR)
  function rectPts(x0, y0, x1, y1) { return [[x1, y0], [x0, y0], [x0, y1], [x1, y1], [x1, y0]]; }
  // Brace (horizontal, opening up), GrowFromCenter with progress p
  function brace(ctx, x0, x1, y, p, col, alpha) {
    if (p <= 0) return;
    const m = (x0 + x1) / 2, hw = (x1 - x0) / 2 * p, d = 16, a = m - hw, b = m + hw;
    ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.fillStyle = col;
    // filled tapered brace: outer edge then inner edge
    const k = Math.min(d * 0.9, hw * 0.45);
    ctx.beginPath();
    ctx.moveTo(a, y);
    ctx.quadraticCurveTo(a + 1, y + d * 0.55, a + k, y + d * 0.55);
    ctx.lineTo(m - k, y + d * 0.55); ctx.quadraticCurveTo(m - 2, y + d * 0.55, m, y + d * 1.15);
    ctx.quadraticCurveTo(m + 2, y + d * 0.55, m + k, y + d * 0.55);
    ctx.lineTo(b - k, y + d * 0.55); ctx.quadraticCurveTo(b - 1, y + d * 0.55, b, y);
    ctx.quadraticCurveTo(b - 1.5, y + d * 0.3, b - k, y + d * 0.32);
    ctx.lineTo(m + k, y + d * 0.32); ctx.quadraticCurveTo(m + 1, y + d * 0.32, m, y + d * 0.62);
    ctx.quadraticCurveTo(m - 1, y + d * 0.32, m - k, y + d * 0.32);
    ctx.lineTo(a + k, y + d * 0.32); ctx.quadraticCurveTo(a + 1.5, y + d * 0.3, a, y);
    ctx.fill();
    ctx.restore();
  }
  // ghost of a previous position: a thin ring with a faint fill, so it stays gold over the blue curve
  function ghost(ctx, x, y, r, col, alpha) {
    if (alpha <= 0.003) return;
    ctx.save(); ctx.globalAlpha = alpha * 0.2; ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.globalAlpha = alpha * 0.22; ctx.fillStyle = col; ctx.fill();
    ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  }
  function dot(ctx, x, y, r, col, alpha) { if (r <= 0) return; ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }
  // Circle with Create (stroke runs counter-clockwise from the right) and fill opacity `fill`
  function circle(ctx, x, y, r, p, stroke, lw, fillCol, fill, alpha) {
    alpha = alpha == null ? 1 : alpha; if (p <= 0 || alpha <= 0.003) return;
    ctx.save();
    if (fill > 0.002) { ctx.globalAlpha = alpha * fill * Math.min(1, p * 1.2); ctx.fillStyle = fillCol; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = alpha; ctx.strokeStyle = stroke; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.arc(x, y, r, 0, -TAU * Math.min(1, p), true); ctx.stroke();
    ctx.restore();
  }
  function checkPts(x, y, s) { return [[x - 0.5 * s, y], [x - 0.15 * s, y + 0.38 * s], [x + 0.55 * s, y - 0.45 * s]]; }

  // Axes: origin (ox,oy), unit px, x 0..xn, y 0..yn; Create progress p, tick-label progress pl
  function axes(ctx, A, p, o) {
    o = o || {}; const alpha = o.alpha == null ? 1 : o.alpha, col = o.col || C.white, lw = o.lw || 2.5;
    if (p <= 0 || alpha <= 0.003) return;
    const xe = A.ox + (A.xn + 0.35) * A.ux, ye = A.oy - (A.yn + 0.35) * A.uy;
    arrow(ctx, A.ox, A.oy, xe, A.oy, col, lw, SM(p), 14, alpha);
    arrow(ctx, A.ox, A.oy, A.ox, ye, col, lw, SM(p), 14, alpha);
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = 2;
    for (let i = 1; i <= A.xn; i++) { const s = SM(seg(i / (A.xn + 1) * 0.8, i / (A.xn + 1) * 0.8 + 0.25, p)); if (s > 0) { const x = A.ox + i * A.ux; ctx.beginPath(); ctx.moveTo(x, A.oy - 7 * s); ctx.lineTo(x, A.oy + 7 * s); ctx.stroke(); } }
    for (let i = 1; i <= A.yn; i++) { const s = SM(seg(i / (A.yn + 1) * 0.8, i / (A.yn + 1) * 0.8 + 0.25, p)); if (s > 0) { const y = A.oy - i * A.uy; ctx.beginPath(); ctx.moveTo(A.ox - 7 * s, y); ctx.lineTo(A.ox + 7 * s, y); ctx.stroke(); } }
    ctx.restore();
  }
  const ax2s = (A, x, y) => [A.ox + x * A.ux, A.oy - y * A.uy];
  function graphPts(A, f, x0, x1, n) { const pts = []; for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n); pts.push(ax2s(A, x, f(x))); } return pts; }

  // =====================================================================================================
  // STILL + CLIP: gradient descent on a loss curve, with the update rule typeset beside it
  // =====================================================================================================
  const fS = (x) => 0.16 * (x - 4.4) * (x - 4.4) + 0.45 + 0.16 * Math.sin(2.2 * x + 0.3);
  const dfS = (x) => (fS(x + 1e-3) - fS(x - 1e-3)) / 2e-3;
  const AS = { ox: 110, oy: 612, ux: 104, uy: 100, xn: 6, yn: 4 };
  const STEPS = [0.7, 2.05, 3.2];
  const CLIP = {
    title: [0.05, 1.0], under: [0.55, 1.2], axes: [0.45, 1.55], nums: [1.2, 1.7], curve: [1.35, 2.45], curveLbl: [2.05, 2.6],
    dot: [2.35, 2.7], tan: [2.55, 3.0], eq: [2.6, 3.7], lossLine: [3.2, 3.8],
    hop: [[3.85, 4.45], [4.6, 5.2]], rect: [5.25, 5.7], ind: [5.3, 5.85], brace: [5.55, 5.95], slope: [5.7, 6.2], pflash: [6.1, 6.75],
  };
  function drawStill(ctx, W, Hh, t) {
    const K = CLIP;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, Hh);
    // ---- Title (Manim Title: centred text + underline across the frame)
    const title = layout(ctx, [T('Gradient '), T('descent')], 52, 640, 78, 'center');
    drawTex(ctx, title, { p: seg(K.title[0], K.title[1], t) });
    const u = sm(K.under[0], K.under[1], t);
    if (u > 0) strokePts(ctx, [[640 - 560 * u, 104], [640 + 560 * u, 104]], C.white, 2);

    // ---- axes with ticks and numbers
    axes(ctx, AS, seg(K.axes[0], K.axes[1], t));
    const na = sm(K.nums[0], K.nums[1], t);
    if (na > 0) {
      ctx.save(); ctx.font = fnt(26); ctx.fillStyle = C.white; ctx.textAlign = 'center';
      for (let i = 1; i <= 6; i++) { ctx.globalAlpha = na; ctx.fillText(String(i), AS.ox + i * AS.ux, AS.oy + 38 - 10 * (1 - na)); }
      ctx.textAlign = 'right';
      for (let i = 1; i <= 4; i++) { ctx.globalAlpha = na; ctx.fillText(String(i), AS.ox - 16 - 10 * (1 - na), AS.oy - i * AS.uy + 9); }
      ctx.restore();
      const wl = layout(ctx, [T('w', { it: true })], 36, AS.ox + 6.55 * AS.ux, AS.oy + 10);
      drawTex(ctx, wl, { alpha: na });
    }
    // ---- loss curve (Create)
    const curve = graphPts(AS, fS, 0.35, 6.0, 160), ccum = cumLen(curve);
    const cp = sm(K.curve[0], K.curve[1], t);
    if (cp > 0) strokePts(ctx, curve, C.blue, 4, 0, cp, 1, ccum);
    // ShowPassingFlash along the curve at the end of the clip
    const pf = seg(K.pflash[0], K.pflash[1], t);
    if (pf > 0 && pf < 1) flash(ctx, curve, SM(pf), C.yellow, 6, 0.25, 0.9, ccum);
    const cl1 = layout(ctx, [T('L', { it: true, c: C.blue }), T('(', { c: C.blue }), T('w', { it: true, c: C.blue }), T(')', { c: C.blue })], 38, AS.ox + 5.45 * AS.ux + 25, AS.oy - fS(5.45) * AS.uy - 63);
    drawTex(ctx, cl1, { p: seg(K.curveLbl[0], K.curveLbl[1], t) });

    // ---- gradient-descent hops
    const h1 = sm(K.hop[0][0], K.hop[0][1], t), h2 = sm(K.hop[1][0], K.hop[1][1], t);
    const wNow = h2 > 0 ? lerp(STEPS[1], STEPS[2], h2) : lerp(STEPS[0], STEPS[1], h1);
    const dotA = sm(K.dot[0], K.dot[1], t);
    // ghost dots + curved arrows between steps
    const hopArrow = (i, p) => {
      const [x1, y1] = ax2s(AS, STEPS[i], fS(STEPS[i])), [x2, y2] = ax2s(AS, STEPS[i + 1], fS(STEPS[i + 1]));
      const pts = arcPts(x1 + 6, y1 - 10, x2 - 4, y2 - 14, -0.32, 30);
      curvedArrow(ctx, pts, C.gold, 3, p, 15);
    };
    if (h1 > 0) { const [x, y] = ax2s(AS, STEPS[0], fS(STEPS[0])); ghost(ctx, x, y, 8, C.gold, h1); hopArrow(0, h1); }
    if (h2 > 0) { const [x, y] = ax2s(AS, STEPS[1], fS(STEPS[1])); ghost(ctx, x, y, 8, C.gold, h2); hopArrow(1, h2); }
    if (dotA > 0) {
      const [x, y] = ax2s(AS, wNow, fS(wNow));
      // dashed drop line to the axis
      ctx.save(); ctx.setLineDash([9, 8]); ctx.globalAlpha = 0.7 * dotA; ctx.strokeStyle = C.white; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.lineTo(x, lerp(y + 12, AS.oy, dotA)); ctx.stroke(); ctx.restore();
      // tangent line (Create from centre)
      const tp = sm(K.tan[0], K.tan[1], t);
      if (tp > 0) {
        const m = dfS(wNow) * AS.uy / AS.ux, ang = Math.atan(-m), hl = 150 * tp;
        strokePts(ctx, [[x - Math.cos(ang) * hl, y - Math.sin(ang) * hl], [x + Math.cos(ang) * hl, y + Math.sin(ang) * hl]], C.green, 3.5);
      }
      dot(ctx, x, y, 10 * SM(dotA * 1.3) + 0.01, C.yellow);
      // w subscript label under the axis at the dot
      const idx = h2 > 0.5 ? '2' : h1 > 0.5 ? '1' : '0';
      const wl2 = layout(ctx, [T('w', { it: true, c: C.yellow }), T(idx, { sz: 0.62, dy: 0.22, c: C.yellow })], 34, x - 12, AS.oy + 74);
      if (na > 0) drawTex(ctx, wl2, { alpha: dotA });
    }

    // ---- the update rule (right): w_{n+1} = w_n − η ∇L(w_n)
    const eqT = [
      T('w', { it: true, k: 'w1' }), T('n', { it: true, sz: 0.62, dy: 0.22, k: 'n1' }), T('+1', { sz: 0.62, dy: 0.22, k: 'p1' }), T(' = '),
      T('w', { it: true, k: 'w2' }), T('n', { it: true, sz: 0.62, dy: 0.22, k: 'n2' }), T(' − '), T('η', { it: true, c: C.teal }), T('', { gap: 0.32 }),
      T('∇', { c: C.yellow, tag: 'g' }), T('L', { it: true, c: C.yellow, tag: 'g', kern: 0.02 }), T('(', { c: C.yellow, tag: 'g' }), T('w', { it: true, c: C.yellow, tag: 'g', k: 'w3' }), T('n', { it: true, sz: 0.62, dy: 0.22, c: C.yellow, tag: 'g', k: 'n3' }), T(')', { c: C.yellow, tag: 'g' }),
    ];
    const eq = layout(ctx, eqT, 52, 985, 320, 'center');
    const ind = tab(K.ind[0], K.ind[1], t);
    const gl = eq.gl.filter((g) => g.tag === 'g');
    const gx0 = Math.min(...gl.map((g) => g.x)) - 6, gx1 = eq.x1 + 6;
    const gcx = (gx0 + gx1) / 2;
    const ep = seg(K.eq[0], K.eq[1], t);
    eq.gl.forEach((g, i) => {
      let x = g.x, y = g.y, s = 1, col = g.c;
      if (g.tag === 'g' && ind > 0) { s = 1 + 0.2 * ind; x = gcx + (g.x - gcx) * s; y = 302 + (g.y - 302) * s; col = mixc(g.c, C.yellow, ind); }
      glyph(ctx, g, writeA(eq.gl.length, ep, i), 1, col, x, y, s);
    });
    // SurroundingRectangle around ∇L(w_n)
    const rp = sm(K.rect[0], K.rect[1], t);
    if (rp > 0) strokePts(ctx, rectPts(gx0 - 8, 320 - 50, gx1 + 8, 320 + 24), C.yellow, 3, 0, rp);
    brace(ctx, gx0 - 4, gx1 + 4, 356, sm(K.brace[0], K.brace[1], t), C.white);
    const sl = layout(ctx, [T('slope')], 36, gcx, 420, 'center');
    drawTex(ctx, sl, { p: seg(K.slope[0], K.slope[1], t) });
    // step-size note under η
    // live loss value: L(w) = 0.61 (DecimalNumber)
    const lp = seg(K.lossLine[0], K.lossLine[1], t);
    if (lp > 0) {
      const lab = layout(ctx, [T('L', { it: true, c: C.blue }), T('(', { c: C.blue }), T('w', { it: true, c: C.blue }), T(')', { c: C.blue }), T(' = ')], 46, 815, 520);
      drawTex(ctx, lab, { p: lp });
      ctx.save(); ctx.font = fnt(46); ctx.fillStyle = C.white; ctx.globalAlpha = SM(lp * 1.6 - 0.6);
      ctx.fillText(fS(wNow).toFixed(2), lab.x1 + 4, 520); ctx.restore();
    }
  }

  // =====================================================================================================
  // EXPLAINER: "How does AI learn?" as one continuous Manim scene (MovingCameraScene)
  // =====================================================================================================
  const X = {
    D: 16,
    title: [0.1, 1.15], toHeader: [1.3, 1.95],
    net: [1.55, 2.6], edges: [1.9, 2.85], outLbl: [2.4, 2.85],
    q0: 2.15, fly: [3.0, 3.35, 3.7, 4.0, 4.3, 4.55, 4.8, 5.05], flyDur: 0.5,
    count: [3.05, 5.0], counterIn: [2.95, 3.3], dataOut: [5.35, 5.75],
    loop: [5.8, 6.4], test: [5.7, 6.1], testTag: [5.95, 6.25], testFly: [6.2, 6.65],
    pass1: 6.6, layerDur: 0.27, guessQ: [7.4, 7.7], check: 7.8, tagMorph: [7.8, 8.15], rect: [7.85, 8.2], cross: [8.1, 8.35],
    adjust: 8.5, back: 8.5, pan: [8.4, 9.1], lossAxes: [8.6, 9.2], lossCurve: [8.8, 9.35], lossVal: [9.0, 9.35], lossDot: [9.15, 9.35],
    steps: [[9.35, 9.8], [9.85, 10.3]], reweight: [9.35, 10.3], loopFlash: [10.0, 10.4],
    pass2: 10.3, layerDur2: 0.12, fix: [10.62, 10.95], tick: [10.75, 11.0],
    out: [11.6, 12.0], cam2: [11.6, 12.25], relabel: [11.8, 12.3], acc: [12.25, 13.3], hero: [13.3, 13.7], ind: [13.7, 14.15],
    heroRect: [14.05, 14.4], accFlash: [13.6, 14.1], chartOut: [14.45, 14.85], heroUp: [14.45, 14.95], take: [14.65, 15.3], sub: [15.1, 15.55],
  };
  // network geometry (world coordinates; camera starts at (640,360) zoom 1 so world = screen there)
  const LX = [470, 630, 790, 950];
  const LAY = [
    [0, 1, 2, 3, 4, 5].map((i) => 195 + i * 62),
    [0, 1, 2, 3, 4].map((i) => 220 + i * 65),
    [0, 1, 2, 3, 4].map((i) => 220 + i * 65),
    [290, 410],
  ];
  const NR = [19, 20, 20, 24];
  const NEUR = LAY.map((ys, l) => ys.map((y) => [LX[l], y]));
  const EDGES = [];
  {
    const r = H.rng(808);
    for (let l = 0; l < 3; l++) for (let i = 0; i < NEUR[l].length; i++) for (let j = 0; j < NEUR[l + 1].length; j++) {
      const [x1, y1] = NEUR[l][i], [x2, y2] = NEUR[l + 1][j], ang = Math.atan2(y2 - y1, x2 - x1);
      const a = [x1 + Math.cos(ang) * NR[l], y1 + Math.sin(ang) * NR[l]], b = [x2 - Math.cos(ang) * NR[l + 1], y2 - Math.sin(ang) * NR[l + 1]];
      const w0 = r.range(-1, 1) * (0.35 + 0.65 * r());
      const w1 = r.chance(0.45) ? -w0 * r.range(0.6, 1.2) + r.range(-0.3, 0.3) : w0 + r.range(-0.25, 0.25);
      EDGES.push({ l, i, j, pts: [a, b], w0, w1: cl(w1, -1, 1), d: r() });
    }
  }
  const ACT = (() => {
    const r = H.rng(41), A1 = [], A2 = [];
    for (const l of [1, 2]) { A1[l] = NEUR[l].map(() => r.range(0.05, 0.95)); A2[l] = NEUR[l].map(() => r.range(0.05, 0.95)); }
    A1[3] = [0.88, 0.16]; A2[3] = [0.1, 0.94];
    return { A1, A2 };
  })();
  // 12x12 greyscale "pixel" pictures (like 3b1b's MNIST grids): cat / dog
  function pix(kind) {
    const N = 12, out = new Float32Array(N * N);
    const E = (x, y, cx, cy, rx, ry, rot) => { const c = Math.cos(rot || 0), s = Math.sin(rot || 0), dx = x - cx, dy = y - cy, u = dx * c + dy * s, v = -dx * s + dy * c; return (u / rx) ** 2 + (v / ry) ** 2 <= 1; };
    const Tri = (x, y, a, b, c) => { const d = (p, q, r) => (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1]); const P = [x, y], d1 = d(P, a, b), d2 = d(P, b, c), d3 = d(P, c, a); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
    const shade = (x, y) => {
      if (kind === 'cat') {
        const head = E(x, y, 6, 7.4, 4.5, 3.7), ears = Tri(x, y, [1.6, 5.6], [2.4, 0.7], [5.4, 4.0]) || Tri(x, y, [10.4, 5.6], [9.6, 0.7], [6.6, 4.0]);
        if (!head && !ears) return 0;
        if (E(x, y, 4.2, 6.9, 0.75, 1.0) || E(x, y, 7.8, 6.9, 0.75, 1.0)) return 0.08;
        if (Tri(x, y, [5.2, 8.7], [6.8, 8.7], [6, 9.6])) return 0.2;
        if (ears && !head && (Tri(x, y, [2.4, 5.0], [2.7, 2.2], [4.5, 4.2]) || Tri(x, y, [9.6, 5.0], [9.3, 2.2], [7.5, 4.2]))) return 0.55;
        return 0.95 - 0.3 * (y / 12);
      }
      const head = E(x, y, 6, 6.0, 3.3, 3.9), snout = E(x, y, 6, 8.9, 2.3, 1.9), earL = E(x, y, 2.5, 6.6, 1.3, 3.2, 0.32), earR = E(x, y, 9.5, 6.6, 1.3, 3.2, -0.32);
      if (!head && !snout && !earL && !earR) return 0;
      if (E(x, y, 6, 8.0, 0.95, 0.65)) return 0.06;
      if (E(x, y, 4.6, 5.4, 0.6, 0.75) || E(x, y, 7.4, 5.4, 0.6, 0.75)) return 0.08;
      if ((earL || earR) && !head) return 0.42;
      if (snout && !head) return 0.82;
      return 0.97 - 0.25 * (y / 12);
    };
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      let s = 0; for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) s += shade(i + (a + 0.5) / 4, j + (b + 0.5) / 4);
      out[j * N + i] = s / 16;
    }
    return out;
  }
  const IMG = { cat: pix('cat'), dog: pix('dog') };
  function drawPix(ctx, img, x, y, cell, alpha, border) {
    if (alpha <= 0.003) return;
    const N = 12;
    ctx.save(); ctx.globalAlpha = alpha;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const v = img[j * N + i];
      if (v > 0.01) { ctx.fillStyle = H.rgba('#ffffff', v); ctx.fillRect(x + i * cell, y + j * cell, cell, cell); }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = 1; k < N; k++) { ctx.moveTo(x + k * cell, y); ctx.lineTo(x + k * cell, y + N * cell); ctx.moveTo(x, y + k * cell); ctx.lineTo(x + N * cell, y + k * cell); }
    ctx.stroke();
    ctx.strokeStyle = border || C.white; ctx.lineWidth = 2; ctx.strokeRect(x, y, N * cell, N * cell);
    ctx.restore();
  }
  // which input neuron each pixel feeds (6 neurons + the ⋮ slot)
  const pixTarget = (k) => (k * 5 + ((k / 12) | 0)) % 7;
  function inputActs(img) { const s = new Array(7).fill(0), n = new Array(7).fill(0); for (let k = 0; k < 144; k++) { const j = pixTarget(k); s[j] += img[k]; n[j]++; } return s.map((v, j) => cl(v / n[j] * 1.8)); }
  const IA = { cat: inputActs(IMG.cat), dog: inputActs(IMG.dog) };
  const targetPos = (j) => (j < 6 ? NEUR[0][j] : [LX[0], 552]);
  // pixels flying from a picture into the input column (Transform with lag)
  function drawFlight(ctx, img, x, y, cell, u) {
    if (u <= 0 || u >= 1) return;
    ctx.save();
    for (let k = 0; k < 144; k++) {
      const v = img[k]; if (v < 0.12) continue;
      const d = (k / 144) * 0.45, a = SM((u - d) / 0.55); if (a <= 0 || a >= 1) continue;
      const sx = x + (k % 12) * cell + cell / 2, sy = y + ((k / 12) | 0) * cell + cell / 2, [tx, ty] = targetPos(pixTarget(k));
      const px = lerp(sx, tx, a), py = lerp(sy, ty, a), s = lerp(cell, 5, a);
      ctx.globalAlpha = v * (a > 0.75 ? (1 - a) / 0.25 : 1);
      ctx.fillStyle = '#fff'; ctx.fillRect(px - s / 2, py - s / 2, s, s);
    }
    ctx.restore();
  }
  // camera
  function cam(t) {
    const a = sm(X.pan[0], X.pan[1], t), b = sm(X.cam2[0], X.cam2[1], t);
    let x = lerp(640, 1065, a), y = 360, z = Math.exp(lerp(0, Math.log(0.84), a));
    x = lerp(x, 1560, b); z = Math.exp(lerp(Math.log(z), Math.log(1.1), b));
    return { x, y, z };
  }
  const w2s = (c, x, y) => [(x - c.x) * c.z + 640, (y - c.y) * c.z + 360];
  // loss / accuracy panel (world)
  const AL = { ox: 1160, oy: 525, ux: 100, uy: 100, xn: 5, yn: 3 };
  const fL = (w) => 0.22 * (w - 3.6) * (w - 3.6) + 0.25 + 0.1 * Math.sin(3 * w);
  const dfL = (w) => (fL(w + 1e-3) - fL(w - 1e-3)) / 2e-3;
  const LSTEP = [0.55, 1.95, 3.35];
  const ACC = (r) => 61 + 36 * (1 - Math.exp(-0.7 * r)) / (1 - Math.exp(-0.7 * 5)) + 1.6 * Math.sin(r * 5.3) * Math.exp(-0.5 * r) * Math.min(1, r * 2);
  const accY = (v) => (v - 40) / 20; // 40%..100% over 3 units

  function explainer(ctx, W, Hh, t) {
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, Hh);
    const cm = cam(t);
    const outA = 1 - sm(X.out[0], X.out[1], t), outDx = -70 * sm(X.out[0], X.out[1], t);

    // ======================= WORLD =======================
    ctx.save();
    ctx.translate(640, 360); ctx.scale(cm.z, cm.z); ctx.translate(-cm.x, -cm.y);

    // ---------------- network
    if (outA > 0.003) {
      ctx.save(); ctx.translate(outDx, 0);
      const rw = sm(X.reweight[0], X.reweight[1], t);
      // edges: colour by sign of weight, thickness by magnitude; Create with lag
      for (const e of EDGES) {
        const cp = sm(X.edges[0] + e.l * 0.22 + e.d * 0.25, X.edges[0] + e.l * 0.22 + e.d * 0.25 + 0.45, t);
        if (cp <= 0) continue;
        const w = lerp(e.w0, e.w1, rw), m = Math.abs(w);
        strokePts(ctx, e.pts, w >= 0 ? C.blue : C.red, 0.6 + 3.6 * m, 0, cp, outA * (0.25 + 0.75 * m));
      }
      // passing flashes
      const pass = (P, dur, col, rev, alpha) => {
        for (const e of EDGES) {
          const st = rev ? P + (2 - e.l) * dur * 0.85 : P + e.l * dur * 0.85, u = seg(st, st + dur, t);
          if (u > 0 && u < 1) flash(ctx, rev ? [e.pts[1], e.pts[0]] : e.pts, SM(u), col, 3, 0.4, alpha * outA);
        }
      };
      // little flashes for the streamed examples (beat 2)
      X.fly.forEach((f, i) => { if (i > 0) pass(f + X.flyDur * 0.9, 0.22, C.yellow, false, 0.35); });
      pass(X.pass1, X.layerDur, C.yellow, false, 0.95);
      pass(X.back, 0.27, C.red, true, 1);
      pass(X.pass2, X.layerDur2, C.yellow, false, 0.95);

      // neuron activations
      const inAct = (j) => {
        let v = 0;
        X.fly.forEach((f, i) => { const k = i % 2 ? 'dog' : 'cat'; const on = sm(f + X.flyDur * 0.6, f + X.flyDur, t); if (on > 0) v = lerp(v, IA[k][j] * 0.75, on); });
        v *= 1 - sm(X.dataOut[0], X.dataOut[1], t);
        const tin = sm(X.testFly[0] + 0.3, X.testFly[1], t); if (tin > 0) v = lerp(v, IA.cat[j], tin);
        return v;
      };
      const layerAct = (l, i) => {
        if (l === 0) return inAct(i);
        let v = 0;
        // faint flicker while data streams
        X.fly.forEach((f, k) => { if (k > 0) { const st = f + X.flyDur * 0.9 + (l - 0.5) * 0.19; v = Math.max(v, 0.3 * tab(st, st + 0.35, t) * ((i * 7 + k * 3 + l) % 5) / 4); } });
        const on1 = sm(X.pass1 + l * X.layerDur * 0.85 + X.layerDur * 0.6, X.pass1 + l * X.layerDur * 0.85 + X.layerDur * 1.1, t);
        const on2 = sm(X.pass2 + l * X.layerDur2 * 0.85 + X.layerDur2 * 0.6, X.pass2 + l * X.layerDur2 * 0.85 + X.layerDur2 * 1.4, t);
        if (on1 > 0) v = lerp(v, ACT.A1[l][i], on1);
        if (on2 > 0) v = lerp(v, ACT.A2[l][i], on2);
        return v;
      };
      for (let l = 0; l < 4; l++) NEUR[l].forEach(([x, y], i) => {
        const p = sm(X.net[0] + l * 0.18 + i * 0.03, X.net[0] + l * 0.18 + i * 0.03 + 0.5, t);
        circle(ctx, x, y, NR[l], p, C.white, 2.2, C.white, layerAct(l, i), outA);
      });
      // ⋮ under the input column
      const dp = sm(X.net[0] + 0.3, X.net[0] + 0.7, t);
      for (let k = 0; k < 3; k++) dot(ctx, LX[0], 540 + k * 13, 3.2, C.white, dp * outA);

      // output labels: dog / cat, the guess "dog?", check marks
      const lblIn = seg(X.outLbl[0], X.outLbl[1], t);
      const dogL = layout(ctx, [T('dog', { k: 'dog' })], 38, 990, 302);
      const dogQ = layout(ctx, [T('dog', { k: 'dog' }), T('?', { k: 'q' })], 38, 990, 302);
      const catL = layout(ctx, [T('cat', { k: 'cat' })], 38, 990, 422);
      const gq = sm(X.guessQ[0], X.guessQ[1], t), fix = sm(X.fix[0], X.fix[1], t);
      const redA = sm(X.check, X.check + 0.25, t);
      const dogCol = mixc(mixc(C.white, C.yellow, gq), C.red, redA);
      if (gq <= 0) drawTex(ctx, dogL, { p: lblIn, alpha: outA });
      else if (fix <= 0) morphTex(ctx, dogL, dogQ, gq, { alpha: outA, colB: () => dogCol });
      else morphTex(ctx, dogQ, dogL, fix, { alpha: outA, colA: () => dogCol, colB: () => mixc(C.red, C.greyL, fix) });
      drawTex(ctx, catL, { p: lblIn, alpha: outA, col: mixc(C.white, C.green, fix) });
      // ✗ next to dog?
      const crossP = sm(X.cross[0], X.cross[1], t) * (1 - fix);
      if (crossP > 0) {
        const cx = dogQ.x1 + 28, cy = 290, s = 15;
        strokePts(ctx, [[cx - s, cy - s], [cx + s, cy + s]], C.red, 5, 0, SM(crossP * 2), outA);
        strokePts(ctx, [[cx + s, cy - s], [cx - s, cy + s]], C.red, 5, 0, SM(crossP * 2 - 1), outA);
      }
      // ✓ next to cat
      const tk = sm(X.tick[0], X.tick[1], t);
      if (tk > 0) strokePts(ctx, checkPts(catL.x1 + 34, 410, 32), C.green, 5, 0, tk, outA);
      // SurroundingRectangle: red round the wrong guess, then Transform to green round the right answer
      const rp = sm(X.rect[0], X.rect[1], t);
      if (rp > 0) {
        const r0 = [950 - 34, 290 - 38, dogQ.x1 + 56, 290 + 36], r1 = [950 - 34, 410 - 38, catL.x1 + 64, 410 + 36];
        const q = fix, R = r0.map((v, i) => lerp(v, r1[i], q));
        strokePts(ctx, rectPts(R[0], R[1], R[2], R[3]), mixc(C.red, C.green, q), 3.5, 0, rp, outA);
      }
      ctx.restore();
    }

    // ---------------- data queue (beat 2)
    const dataOutA = sm(X.dataOut[0], X.dataOut[1], t);
    const qA = 1 - dataOutA, qDx = -80 * dataOutA;
    if (qA > 0.003) {
      const SLOTS = [206, 349, 492], N = X.fly.length, later = [];
      for (let i = 0; i < N; i++) {
        const kind = i % 2 ? 'dog' : 'cat', fl = X.fly[i];
        const appear = i < 3 ? X.q0 + i * 0.15 : X.fly[i - 3];
        if (t < appear) continue;
        // slot position: index in queue = i - (# flown before t), animated smoothly
        let slot = i; for (let k = 0; k < i; k++) slot -= sm(X.fly[k], X.fly[k] + 0.32, t);
        slot = Math.min(slot, 2);
        const y = lerp(SLOTS[0], SLOTS[2], slot / 2) + 40 * (1 - sm(appear, appear + 0.35, t));
        const fin = sm(appear, appear + 0.35, t);
        const flyU = seg(fl, fl + X.flyDur, t);
        const cell = 10, x0 = 172 + qDx, y0 = y - 60;
        const imgA = (flyU > 0 ? 1 - SM(flyU * 2.5) : 1) * fin * qA;
        // cards are stacked back to front: each one knocks out what is beneath it (plus a 3px black gap)
        if (imgA > 0.003) { ctx.save(); ctx.globalAlpha = Math.min(1, imgA * 1.6); ctx.fillStyle = C.bg; ctx.fillRect(x0 - 4, y0 - 4, 12 * cell + 8, 12 * cell + 8); ctx.restore(); }
        drawPix(ctx, IMG[kind], x0, y0, cell, imgA);
        later.push([kind, x0, y0, cell, flyU, y, appear, imgA * fin]);
      }
      // labels, then the flying pixels on top of everything in the queue
      for (const [kind, x0, , , , y, appear, a] of later) {
        const tag = layout(ctx, [T(kind)], 32, x0 + 132, y + 11);
        drawTex(ctx, tag, { p: seg(appear + 0.1, appear + 0.5, t), alpha: a, col: kind === 'cat' ? C.gold : C.teal });
      }
      for (const [kind, x0, y0, cell, flyU] of later) drawFlight(ctx, IMG[kind], x0, y0, cell, flyU);
      // counter: Integer + "examples"
      const ci = sm(X.counterIn[0], X.counterIn[1], t);
      if (ci > 0) {
        const n = 1e6 * Math.pow(seg(X.count[0], X.count[1], t), 2.4);
        ctx.save(); ctx.globalAlpha = ci * qA; ctx.font = fnt(70); ctx.fillStyle = C.white;
        const s = commas(n); ctx.fillText(s, 58 + qDx, 650 + 24 * (1 - ci));
        const wN = ctx.measureText(s).width; ctx.restore();
        const ex = layout(ctx, [T('examples', { it: false })], 34, 58 + qDx + Math.max(wN, 270) + 16, 650 + 24 * (1 - ci));
        drawTex(ctx, ex, { alpha: ci * qA, col: C.greyL });
      }
    }

    // ---------------- test picture (beat 3)
    const testIn = sm(X.test[0], X.test[1], t);
    if (testIn > 0) {
      const fade = 1 - sm(X.pan[0], X.pan[0] + 0.4, t);
      const cell = 15, x0 = 140, y0 = 250 + 30 * (1 - testIn);
      const flyU = seg(X.testFly[0], X.testFly[1], t);
      drawPix(ctx, IMG.cat, x0, y0, cell, testIn * fade, C.white);
      drawFlight(ctx, IMG.cat, x0, y0, cell, flyU);
      const q = layout(ctx, [T('?', { k: 'q' })], 44, 230, 490, 'center');
      const cat = layout(ctx, [T('cat', { k: 'cat' })], 44, 230, 490, 'center');
      const tm = sm(X.tagMorph[0], X.tagMorph[1], t);
      if (tm <= 0) drawTex(ctx, q, { p: seg(X.testTag[0], X.testTag[1], t), alpha: fade });
      else morphTex(ctx, q, cat, tm, { alpha: fade, colA: () => C.white, colB: () => C.green });
      // "answer" note
      const an = layout(ctx, [T('answer:')], 30, 230, 452, 'center');
      drawTex(ctx, an, { alpha: fade * tm, col: C.greyL, dy: -8 * (1 - tm) });
    }

    // ---------------- loss panel → accuracy panel
    const la = seg(X.lossAxes[0], X.lossAxes[1], t);
    const chartA = 1 - sm(X.chartOut[0], X.chartOut[1], t), chartDx = -80 * sm(X.chartOut[0], X.chartOut[1], t);
    if (la > 0 && chartA > 0.003) {
      ctx.save(); ctx.translate(chartDx, 0);
      axes(ctx, AL, la, { alpha: chartA });
      const rl = sm(X.relabel[0], X.relabel[1], t);
      // y tick labels: 1 2 3  →  60% 80% 100%
      const nA = SM(la * 1.4 - 0.4) * chartA;
      ctx.save(); ctx.font = fnt(28); ctx.textAlign = 'right'; ctx.fillStyle = C.white;
      for (let i = 1; i <= 3; i++) {
        const y = AL.oy - i * AL.uy + 10;
        ctx.globalAlpha = nA * (1 - rl); ctx.fillText(String(i), AL.ox - 16, y - 14 * rl);
        ctx.globalAlpha = nA * rl; ctx.fillText((40 + i * 20) + '%', AL.ox - 16, y + 14 * (1 - rl));
      }
      ctx.restore();
      // axis labels: loss → accuracy (y), w → training rounds (x)
      const yl0 = layout(ctx, [T('loss', { k: 'l' })], 34, AL.ox + 22, AL.oy - 3.3 * AL.uy + 10);
      const yl1 = layout(ctx, [T('accuracy', { k: 'a' })], 34, AL.ox + 22, AL.oy - 3.3 * AL.uy + 10);
      const xl0 = layout(ctx, [T('w', { it: true })], 38, AL.ox + 5.45 * AL.ux, AL.oy + 12);
      const xl1 = layout(ctx, [T('rounds')], 32, AL.ox + 5.0 * AL.ux - 30, AL.oy + 48);
      if (rl <= 0) { drawTex(ctx, yl0, { p: seg(X.lossAxes[0] + 0.3, X.lossAxes[1] + 0.2, t), alpha: chartA }); drawTex(ctx, xl0, { p: seg(X.lossAxes[0] + 0.3, X.lossAxes[1] + 0.2, t), alpha: chartA }); }
      else { morphTex(ctx, yl0, yl1, rl, { alpha: chartA }); morphTex(ctx, xl0, xl1, rl, { alpha: chartA }); }

      // loss curve + rolling dot + tangent, fading out on the relabel
      const lossA = (1 - sm(X.out[0], X.out[0] + 0.35, t)) * chartA;
      if (lossA > 0.003) {
        const lc = graphPts(AL, fL, 0.2, 5.0, 120);
        strokePts(ctx, lc, C.blue, 4, 0, sm(X.lossCurve[0], X.lossCurve[1], t), lossA);
        const s1 = sm(X.steps[0][0], X.steps[0][1], t), s2 = sm(X.steps[1][0], X.steps[1][1], t);
        const w = s2 > 0 ? lerp(LSTEP[1], LSTEP[2], s2) : lerp(LSTEP[0], LSTEP[1], s1);
        const dA = sm(X.lossDot[0], X.lossDot[1], t);
        const [dx, dy] = ax2s(AL, w, fL(w));
        if (dA > 0) {
          if (s1 > 0) { const [gx, gy] = ax2s(AL, LSTEP[0], fL(LSTEP[0])); ghost(ctx, gx, gy, 7, C.gold, s1 * lossA); curvedArrow(ctx, arcPts(gx + 6, gy - 10, ...ax2s(AL, LSTEP[1], fL(LSTEP[1]) + 0.14), -0.3, 24), C.gold, 3, s1, 14, lossA); }
          if (s2 > 0) { const [gx, gy] = ax2s(AL, LSTEP[1], fL(LSTEP[1])); ghost(ctx, gx, gy, 7, C.gold, s2 * lossA); curvedArrow(ctx, arcPts(gx + 6, gy - 10, ...ax2s(AL, LSTEP[2], fL(LSTEP[2]) + 0.14), -0.3, 24), C.gold, 3, s2, 14, lossA); }
          const m = dfL(w), ang = Math.atan(-m), hl = 95 * dA;
          strokePts(ctx, [[dx - Math.cos(ang) * hl, dy - Math.sin(ang) * hl], [dx + Math.cos(ang) * hl, dy + Math.sin(ang) * hl]], C.green, 3, 0, 1, lossA);
          dot(ctx, dx, dy, 11 * dA, C.yellow, lossA);
        }
        // L(w) = value (DecimalNumber)
        const lv = seg(X.lossVal[0], X.lossVal[1], t);
        if (lv > 0) {
          const lab = layout(ctx, [T('L', { it: true, c: C.blue }), T('(', { c: C.blue }), T('w', { it: true, c: C.blue }), T(')', { c: C.blue }), T(' = ')], 46, 1385, 215);
          drawTex(ctx, lab, { p: lv, alpha: lossA });
          ctx.save(); ctx.font = fnt(46); ctx.fillStyle = C.white; ctx.globalAlpha = SM(lv * 1.6 - 0.6) * lossA;
          ctx.fillText(fL(w).toFixed(2), lab.x1 + 4, 215); ctx.restore();
        }
      }
      // accuracy curve (Create) with the tip dot
      const ap = sm(X.acc[0], X.acc[1], t);
      if (ap > 0) {
        const ac = graphPts(AL, (r) => accY(ACC(r)), 0, 5, 140), acum = cumLen(ac);
        strokePts(ctx, ac, C.green, 4, 0, ap, chartA, acum);
        const af = seg(X.accFlash[0], X.accFlash[1], t);
        if (af > 0 && af < 1) flash(ctx, ac, SM(af), C.yellow, 6, 0.3, chartA, acum);
        const r = 5 * ap, [tx, ty] = ax2s(AL, r, accY(ACC(r)));
        dot(ctx, tx, ty, 9, C.white, chartA * (1 - sm(X.hero[0], X.hero[1], t) * 0.0));
        // dashed 97% guide once complete
        const g = sm(X.acc[1] - 0.1, X.acc[1] + 0.3, t);
        if (g > 0) { ctx.save(); ctx.setLineDash([8, 8]); ctx.globalAlpha = 0.5 * g * chartA; ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(AL.ox, ty); ctx.lineTo(lerp(AL.ox, tx, g), ty); ctx.stroke(); ctx.restore(); }
      }
      ctx.restore();
    }
    ctx.restore();

    // ======================= SCREEN (fixed in frame) =======================
    // accuracy number: rides the curve tip, then Transforms into the hero 97%, Indicate, SurroundingRectangle
    const ap = sm(X.acc[0], X.acc[1], t);
    if (ap > 0) {
      const r = 5 * ap, v = Math.round(ACC(r));
      const [wx, wy] = ax2s(AL, r, accY(ACC(r)));
      const [sx, sy] = w2s(cm, wx, wy);
      const hp = sm(X.hero[0], X.hero[1], t), up = sm(X.heroUp[0], X.heroUp[1], t);
      const ind = tab(X.ind[0], X.ind[1], t);
      const smallS = 66, heroS = 136, finS = 104;
      let size = lerp(smallS, heroS, hp), cx = lerp(sx + 16, 1010, hp), cy = lerp(sy - 24, 430, hp);
      size = lerp(size, finS, up); cx = lerp(cx, 640, up); cy = lerp(cy, 300, up);
      const s = size * (1 + 0.2 * ind);
      const txt = v + '%';
      ctx.save();
      ctx.font = fnt(s, false, 600);
      const w = ctx.measureText(txt).width;
      const align = lerp(0, 0.5, hp); // left-aligned just above the tip, centred as hero
      const x0 = cx - w * align;
      ctx.fillStyle = mixc(C.white, C.yellow, ind);
      ctx.globalAlpha = sm(X.acc[0], X.acc[0] + 0.2, t);
      ctx.fillText(txt, x0, cy);
      ctx.restore();
      // "accuracy" caption above the hero number
      if (hp > 0) {
        const cap = layout(ctx, [T('accuracy')], 38, cx, cy - size * 0.82 - 50 * hp, 'center');
        drawTex(ctx, cap, { alpha: hp * (1 - up), col: C.greyL });
      }
      const rr = sm(X.heroRect[0], X.heroRect[1], t);
      if (rr > 0) { ctx.font = fnt(heroS, false, 600); const bw = ctx.measureText(txt).width, bh = heroS * 0.8; const R = [cx - bw / 2 - 24, cy - bh - 16, cx + bw / 2 + 24, cy + 24]; const k = lerp(1, finS / heroS, up); strokePts(ctx, rectPts(cx - (cx - R[0]) * k, cy - (cy - R[1]) * k, cx + (R[2] - cx) * k, cy + (R[3] - cy) * k), C.yellow, 3.5, 0, rr); }
    }

    // header: "How does AI learn?" written centre, then Transform to the top-left header
    const big = layout(ctx, [T('How does '), T('AI', { c: C.yellow }), T(' '), T('learn', { c: C.blue }), T('?')], 76, 640, 380, 'center');
    const hdr = layout(ctx, [T('How does '), T('AI', { c: C.yellow }), T(' '), T('learn', { c: C.blue }), T('?')], 44, 40, 68);
    const hq = sm(X.toHeader[0], X.toHeader[1], t);
    if (hq <= 0) drawTex(ctx, big, { p: seg(X.title[0], X.title[1], t) });
    else morphTex(ctx, big, hdr, hq);

    // Guess → Check → Adjust loop row (bottom), active stage in yellow, curved arrow back
    const lp = seg(X.loop[0], X.loop[1], t), loopA = 1 - sm(X.out[0], X.out[1], t);
    if (lp > 0 && loopA > 0.003) {
      ctx.save(); ctx.translate(0, 40 * sm(X.out[0], X.out[1], t));
      const words = ['Guess', 'Check', 'Adjust'], gap = 92;
      ctx.font = fnt(36); const ws = words.map((w) => ctx.measureText(w).width);
      const total = ws.reduce((a, b) => a + b, 0) + gap * 2;
      let x = 640 - total / 2; const by = 662;
      const act = (i) => {
        if (i === 0) return Math.max(tab(X.pass1 - 0.1, X.check + 0.05, t) > 0 ? sm(X.pass1 - 0.1, X.pass1 + 0.15, t) * (1 - sm(X.check - 0.1, X.check + 0.1, t)) : 0, sm(X.pass2 - 0.1, X.pass2 + 0.1, t) * (1 - sm(X.fix[0], X.fix[0] + 0.2, t)));
        if (i === 1) return Math.max(sm(X.check - 0.1, X.check + 0.1, t) * (1 - sm(X.adjust - 0.1, X.adjust + 0.1, t)), sm(X.fix[0], X.fix[0] + 0.2, t));
        return sm(X.adjust - 0.1, X.adjust + 0.1, t) * (1 - sm(X.pass2 - 0.1, X.pass2 + 0.1, t));
      };
      const pos = [];
      words.forEach((wd, i) => {
        const L = layout(ctx, [T(wd)], 36, x, by);
        const a = act(i), dim = sm(X.loop[1], X.loop[1] + 0.3, t);
        const col = mixc(mixc(C.white, C.grey, dim), C.yellow, a);
        drawTex(ctx, L, { p: cl(lp * 1.4 - i * 0.2), alpha: loopA, col, scale: 1 + 0.08 * a, ox: L.cx, oy: by - 12 });
        pos.push([x, x + ws[i]]);
        x += ws[i] + gap;
      });
      for (let i = 0; i < 2; i++) arrow(ctx, pos[i][1] + 16, by - 12, pos[i + 1][0] - 16, by - 12, C.white, 2.5, sm(X.loop[0] + 0.15 + i * 0.15, X.loop[0] + 0.45 + i * 0.15, t), 13, loopA * 0.85);
      // loop-back arc under the row: Adjust → Guess
      const arc = arcPts(pos[2][0] + ws[2] / 2, by + 14, pos[0][0] + ws[0] / 2, by + 14, -0.09, 40);
      const ap2 = sm(X.loop[1] - 0.1, X.loop[1] + 0.35, t);
      curvedArrow(ctx, arc, C.grey, 2.5, ap2, 13, loopA);
      const lf = seg(X.loopFlash[0], X.loopFlash[1], t);
      if (lf > 0 && lf < 1) flash(ctx, arc, SM(lf), C.yellow, 4, 0.35, loopA);
      ctx.restore();
    }

    // takeaway: More examples → better guesses
    const tp = seg(X.take[0], X.take[1], t);
    if (tp > 0) {
      ctx.font = fnt(56);
      const a = layout(ctx, [T('More '), T('examples', { c: C.blue })], 56, 0, 0), b = layout(ctx, [T('better guesses', { c: C.green })], 56, 0, 0);
      const gap = 110, total = a.w + gap + b.w, x0 = 640 - total / 2, y = 470;
      const A2 = layout(ctx, [T('More '), T('examples', { c: C.blue })], 56, x0, y), B2 = layout(ctx, [T('better guesses', { c: C.green })], 56, x0 + a.w + gap, y);
      drawTex(ctx, A2, { p: cl(tp * 1.8) });
      arrow(ctx, A2.x1 + 18, y - 18, B2.x0 - 18, y - 18, C.white, 3.5, sm(0.35, 0.6, tp), 20);
      drawTex(ctx, B2, { p: cl(tp * 1.8 - 0.8) });
      // tiny equation underneath
      const sub = layout(ctx, [T('examples', { it: true, c: C.blue }), T(' ↑   ⟹   '), T('L', { it: true }), T('('), T('w', { it: true }), T(')'), T(' ↓   ⟹   '), T('accuracy', { it: true, c: C.green }), T(' ↑')], 38, 640, 565, 'center');
      drawTex(ctx, sub, { p: seg(X.sub[0], X.sub[1], t), col: (g) => (g.c === C.white ? C.greyL : g.c) });
    }
  }

  // =====================================================================================================
  // SOUND: gentle, warm and sparse, like the soft score under a math explainer. Timings come from X.
  // =====================================================================================================
  function explainerSound(k) {
    const D = X.D;
    // muted pluck: a soft triangle with a quick low-passed decay, tuned low
    const pluck = (t, f, g = 1, o = {}) => {
      k.tone(t, { f, type: 'triangle', dur: 0.55, gain: 0.1 * g, a: 0.004, filter: 'lowpass', f2: 1300, verb: 0.3, pan: o.pan || 0, minor: o.minor });
      k.tone(t, { f: k.hz(f) * 2, dur: 0.22, gain: 0.025 * g, a: 0.003, verb: 0.25, pan: o.pan || 0, minor: o.minor });
    };
    // soft tick for glyph writing / counters (low band-passed noise, no ping)
    const tick = (t, g = 1, f = 1300, pan = 0) => k.noise(t, { dur: 0.02, filter: 'bandpass', f, q: 2.2, gain: 0.16 * g, a: 0.002, pan, minor: true });
    // pencil-soft write: a few ticks across the write duration
    const write = (t0, t1, n, g = 1, pan = 0) => k.withMinor(() => { for (let i = 0; i < n; i++) tick(t0 + (t1 - t0) * (i + 0.3) / n, g * (0.7 + 0.3 * ((i * 7) % 3) / 2), 1100 + ((i * 5) % 4) * 90, pan); });
    // airy swish for Transforms: band-passed pink noise, slow attack, low top
    const swish = (t, dur, g = 1, pan = 0, minor) => k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 300], [dur * 0.55, 1300], [dur, 500]], q: 0.7, gain: 0.13 * g, a: dur * 0.5, verb: 0.25, pan, minor });
    const counter = (val, a, b, gap, g, f) => { let last = -1, prev = val(a); for (let t = a; t <= b; t += 0.002) { const v = val(t); if (v !== prev && t - last >= gap) { tick(t, g, f, -0.3); last = t; } prev = v; } };

    // ---- quiet warm pad underneath (D major-ish, resolving to D under the takeaway)
    k.music('pad', 0, 14.4, { bpm: 60, gain: 0.45, chords: [['D3', 'A3', 'C#4', 'F#4'], ['B2', 'F#3', 'A3', 'D4'], ['G2', 'D3', 'F#3', 'B3'], ['A2', 'E3', 'G3', 'C#4']] });
    k.music('pad', 14.4, D, { bpm: 60, gain: 0.45, chords: [['D3', 'A3', 'D4', 'F#4']] });

    // ---- beat 1: title written, then glides to the header
    pluck(X.title[0] + 0.02, 'D4', 0.9);
    write(X.title[0], X.title[1], 6, 0.9);
    swish(X.toHeader[0], X.toHeader[1] - X.toHeader[0] + 0.1, 1.0);

    // ---- beat 2: network created, examples stream in, counter
    k.withMinor(() => [0, 1, 2, 3].forEach((l) => pluck(X.net[0] + l * 0.18 + 0.15, ['A3', 'D4', 'E4', 'F#4'][l], 0.55, { pan: -0.4 + l * 0.25 })));
    k.noise(X.edges[0], { dur: X.edges[1] - X.edges[0], color: 'pink', filter: 'bandpass', f: [[0, 500], [0.9, 900]], q: 0.8, gain: 0.05, a: 0.3, minor: true });
    write(X.outLbl[0], X.outLbl[1], 3, 0.8, 0.5);
    X.fly.forEach((f, i) => { if (i < 3) pluck(X.q0 + i * 0.15 + 0.05, ['F#3', 'A3', 'D4'][i], 0.45, { pan: -0.6, minor: true }); swish(f, X.flyDur, 0.45, -0.3, true); });
    counter((t) => Math.round(1e6 * Math.pow(seg(X.count[0], X.count[1], t), 2.4) / 4000), X.count[0] + 0.05, X.count[1], 0.09, 0.9, 1250);
    pluck(X.count[1], 'A4', 0.8, { pan: -0.4 });

    // ---- beat 3: guess, check, adjust
    swish(X.dataOut[0], 0.4, 0.6, -0.5, true);
    write(X.loop[0], X.loop[1], 4, 0.8);
    pluck(X.test[0] + 0.1, 'D4', 0.6, { pan: -0.5, minor: true });
    swish(X.testFly[0], X.testFly[1] - X.testFly[0], 0.6, -0.4);
    // forward pass: a soft rising three-note figure as each layer lights
    ['D4', 'F#4', 'A4'].forEach((n, i) => pluck(X.pass1 + i * X.layerDur * 0.85 + X.layerDur * 0.7, n, 0.6, { pan: -0.2 + i * 0.2, minor: true }));
    pluck(X.guessQ[0] + 0.05, 'B4', 0.8, { pan: 0.4 });                                       // "dog?"
    // wrong: a low, soft minor fall (no buzzer)
    k.tone(X.check, { f: 'F3', type: 'triangle', dur: 0.5, gain: 0.14, a: 0.01, filter: 'lowpass', f2: 900, verb: 0.3, pan: 0.4 });
    k.tone(X.check + 0.16, { f: 'C#3', type: 'triangle', dur: 0.8, gain: 0.14, a: 0.01, filter: 'lowpass', f2: 800, verb: 0.35, pan: 0.4 });
    k.noise(X.rect[0], { dur: X.rect[1] - X.rect[0], filter: 'bandpass', f: [[0, 600], [0.35, 1100]], q: 1.2, gain: 0.05, a: 0.1, pan: 0.4, minor: true });
    swish(X.tagMorph[0], 0.4, 0.6, -0.5);                                                     // "?" → "cat"
    // error flowing back + camera pan
    k.tone(X.back, { f: [[0, 520], [0.75, 190]], type: 'sine', dur: 0.85, gain: 0.07, a: 0.2, hold: 0.2, filter: 'lowpass', f2: 900, verb: 0.3 });
    swish(X.pan[0], X.pan[1] - X.pan[0], 0.9, 0.3);
    write(X.lossAxes[0] + 0.3, X.lossVal[1], 3, 0.7, 0.4);
    // gradient steps: two soft descending plucks
    pluck(X.steps[0][1] - 0.05, 'A3', 0.7, { pan: 0.4 }); pluck(X.steps[1][1] - 0.05, 'F#3', 0.7, { pan: 0.4 });
    k.noise(X.reweight[0], { dur: X.reweight[1] - X.reweight[0], color: 'pink', filter: 'bandpass', f: [[0, 400], [0.9, 750]], q: 1, gain: 0.05, a: 0.4, minor: true });
    // second pass + correct: warm rising major third pair
    ['D4', 'F#4', 'A4'].forEach((n, i) => pluck(X.pass2 + i * X.layerDur2 * 0.85 + 0.05, n, 0.45, { minor: true }));
    pluck(X.fix[0] + 0.05, 'D4', 0.9, { pan: 0.4 }); pluck(X.fix[0] + 0.15, 'F#4', 0.85, { pan: 0.4 }); pluck(X.tick[0] + 0.1, 'A4', 0.8, { pan: 0.4 });

    // ---- beat 4: camera move, relabel, accuracy climbs, the 97% moment
    swish(X.cam2[0], X.cam2[1] - X.cam2[0], 1.0);
    swish(X.relabel[0], 0.45, 0.5, 0.2, true);
    counter((t) => Math.round(ACC(5 * sm(X.acc[0], X.acc[1], t))), X.acc[0] + 0.05, X.acc[1], 0.085, 0.85, 1200);
    swish(X.hero[0], X.hero[1] - X.hero[0] + 0.05, 0.9, 0.3);
    // 97%: low warm tone + gentle chord
    k.tone(X.ind[0], { f: 'D2', type: 'sine', dur: 2.0, gain: 0.3, a: 0.02, verb: 0.2 });
    k.tone(X.ind[0], { f: 'D3', type: 'triangle', dur: 1.6, gain: 0.08, a: 0.02, filter: 'lowpass', f2: 700, verb: 0.3 });
    ['A3', 'D4', 'F#4', 'A4'].forEach((n, i) => k.tone(X.ind[0] + 0.02 + i * 0.05, { f: n, type: 'triangle', dur: 1.8, gain: 0.07, a: 0.02, filter: 'lowpass', f2: 1500, verb: 0.45, pan: (i - 1.5) * 0.3 }));
    k.noise(X.accFlash[0], { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.5, 1200]], q: 1, gain: 0.04, a: 0.2, minor: true });

    // ---- beat 5: chart clears, 97% moves up, takeaway written, resolving chord
    swish(X.chartOut[0], 0.5, 0.7, -0.3);
    write(X.take[0], X.take[1], 6, 0.8);
    ['D3', 'A3', 'D4', 'F#4', 'A4'].forEach((n, i) => k.tone(X.take[0] + 0.25 + i * 0.06, { f: n, type: i ? 'sine' : 'triangle', dur: 2.2, gain: 0.075, a: 0.03, verb: 0.5, pan: (i - 2) * 0.22 }));
    k.tone(X.take[0] + 0.25, { f: 'D2', dur: 2.2, gain: 0.16, a: 0.04 });
  }

  registerStyle({
    id: 'math-anim',
    name: 'Manim-Style Math',
    category: 'Popular Explainer Looks',
    description: 'The math-explainer look of Manim, the open-source library behind 3Blue1Brown: pure black, crisp anti-aliased vector lines, a restrained palette of Manim blue, teal, yellow, red and green, LaTeX-like serif math with italic variables, axes with tick marks, curves, arrows, braces and surrounding rectangles.',
    motion: 'Manim\'s own vocabulary on a smooth sigmoid ease: equations Write on (glyph outlines trace, then fill), axes and curves Create, a dot slides down the graph in gradient-descent hops, then a SurroundingRectangle draws round the key term and it Indicates with a yellow pulse.',
    duration: 6.8,
    frameT: 6.75,
    fonts: ['400 52px "STIX Two Text"', 'italic 400 52px "STIX Two Text"', '600 52px "STIX Two Text"'],
    readsPixels: false,
    draw: drawStill,
    explainerDuration: X.D,
    explainerNote: 'One MovingCameraScene: the question Writes on and Transforms into the header, a neural net Creates (edges blue/red by weight sign), pixel pictures fly into the input neurons as a counter climbs, a forward pass runs as ShowPassingFlash, the wrong "dog?" gets a red SurroundingRectangle, the camera pans to a loss curve where a dot descends while edges re-colour, then the axes relabel to accuracy, the curve climbs and the number Transforms into a 97% that Indicates.',
    explainer,
    explainerSound,
  });
}
