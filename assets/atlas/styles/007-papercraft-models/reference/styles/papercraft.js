// Papercraft Models: printed-cardstock kit models (glue tabs, seams, dotted fold lines) standing on a green
// self-healing cutting mat. A tiny 3D engine: every model is a hinge tree of flat printed faces (so a flat template
// net can fold itself up), Lambert-shaded per face, painter-sorted, with soft contact shadows from a warm key light.
{
  const PI = Math.PI, HP = PI / 2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const win = (t, a, b) => clamp((t - a) / (b - a));
  const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const eout = (x) => 1 - Math.pow(1 - x, 3);
  const eback = (x) => { if (x <= 0) return 0; if (x >= 1) return 1; const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const lerp = (a, b, u) => a + (b - a) * u;
  const TQ = (t) => Math.floor(t * 12 + 1e-6) / 12; // stop-motion: models are re-posed on twos (12 fps)

  // ---------- vectors ----------
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const LIGHT = nrm([-0.55, 1.0, -0.5]); // warm key light: upper left, slightly in front

  const PAL = {
    card: '#f5f0e4', back: '#e8e0cf', tab: '#ece5d4', blue: '#2f6db3', blueD: '#1f4f8a', orange: '#ee6b2d', yellow: '#f4b630',
    red: '#d83a2e', green: '#2e9a57', ink: '#22252d', ginger: '#ea8a39', gingerD: '#b9581a', tan: '#d9aa74', brown: '#7a4a2a',
    cream: '#f7e6c8', pink: '#e9798d', teal: '#279c8e', steel: '#c3c8cd', wood: '#d6b585',
  };

  // ---------- camera (no roll, no yaw: the camera slides across the mat) ----------
  const makeCam = (tx, tz, D, pitch, W, Hh, ty = 0, F = 1000) => {
    const sp = Math.sin(pitch), cp = Math.cos(pitch), C = [tx, ty + D * sp, tz - D * cp];
    const proj = (P) => {
      const dx = P[0] - C[0], dy = P[1] - C[1], dz = P[2] - C[2], zc = -dy * sp + dz * cp, yc = dy * cp + dz * sp;
      return [W / 2 + (F * dx) / zc, Hh / 2 - (F * yc) / zc, zc];
    };
    // where the screen row sy meets the mat plane
    const ground = (sy) => { const k = (Hh / 2 - sy) / F, dy = -sp + k * cp, dz = cp + k * sp; if (dy >= -1e-4) return null; const s = -C[1] / dy; return { z: C[2] + s * dz, s }; };
    return { C, sp, cp, F, W, H: Hh, proj, ground };
  };
  const camAt = (keys, t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t <= b[0]) { const u = eio((t - a[0]) / Math.max(1e-6, b[0] - a[0])); return a.slice(1).map((v, j) => v + (b[j + 1] - v) * u); }
    }
    return keys[keys.length - 1].slice(1);
  };

  // ---------- faces: flat printed pieces of card in their own 2D frame ----------
  let GID = 1;
  const mkF = (O, ex, ey, poly, o) => {
    let pw = 0, ph = 0;
    for (const p of poly) { pw = Math.max(pw, p[0]); ph = Math.max(ph, p[1]); }
    return Object.assign({ O, ex, ey, n: nrm(cross(ex, ey)), poly, pw, ph }, o);
  };
  const rect = (w, h) => [[0, 0], [w, 0], [w, h], [0, h]];
  const P3 = (f, p) => [f.O[0] + f.ex[0] * p[0] + f.ey[0] * p[1], f.O[1] + f.ex[1] * p[0] + f.ey[1] * p[1], f.O[2] + f.ex[2] * p[0] + f.ey[2] * p[1]];
  // child face hinged on the parent's edge A->B (parent CCW). th > 0 folds toward the printed side, < 0 away.
  const attach = (par, A2, B2, th, poly, o) => {
    const A = P3(par, A2), B = P3(par, B2), ex = nrm(sub(A, B)), ey0 = cross(par.n, ex);
    const ey = add(mul(ey0, Math.cos(th)), mul(par.n, Math.sin(th)));
    return mkF(B, ex, ey, poly, Object.assign({ hinge: true }, o));
  };
  const fromPts = (pts, hint, o) => {
    let P = pts, n = nrm(cross(sub(P[1], P[0]), sub(P[2], P[0])));
    if (dot(n, hint) < 0) { P = P.slice().reverse(); n = mul(n, -1); }
    const O = P[0], ex = nrm(sub(P[1], P[0])), ey = cross(n, ex);
    let poly = P.map((p) => [dot(sub(p, O), ex), dot(sub(p, O), ey)]);
    const mx = Math.min(...poly.map((p) => p[0])), my = Math.min(...poly.map((p) => p[1]));
    poly = poly.map((p) => [p[0] - mx, p[1] - my]);
    return mkF(add(O, add(mul(ex, mx), mul(ey, my))), ex, ey, poly, o);
  };
  const xf = (faces, p = [0, 0, 0], yaw = 0, s = 1) => {
    const c = Math.cos(yaw), sn = Math.sin(yaw), R = (v) => [v[0] * c + v[2] * sn, v[1], -v[0] * sn + v[2] * c];
    return faces.map((f) => Object.assign({}, f, { O: add(mul(R(f.O), s), p), ex: mul(R(f.ex), s), ey: mul(R(f.ey), s), n: R(f.n) }));
  };

  // ---------- builders ----------
  // A box folded from a cross-shaped net. The top is the root; the four walls hang off it and fold down (printed
  // side out) while the root rises, the bottom folds under last. f = 0 flat template, 1 assembled.
  const tabPrint = (c, w, h) => {
    c.fillStyle = '#e3dac6'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(120,100,70,0.35)'; c.lineWidth = 0.8;
    for (let x = -h; x < w; x += 3.2) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + h, 0); c.stroke(); }
  };
  const box = (o) => {
    const { w, d, h } = o, f = o.f == null ? 1 : o.f, grp = GID++, st = 0.09;
    const C = (k) => (typeof o.col === 'string' ? o.col : o.col[k] || o.col.side);
    const PR = o.pr || {};
    const A = (i) => HP * eio(clamp((f - i * st) / 0.62));
    const ang = { front: A(0), right: A(1), back: A(2), left: A(3) };
    if (o.gap && f > 0.85) ang[o.gap] = lerp(ang[o.gap], HP * (1 - (o.gapAmt || 0.05)), win(f, 0.85, 1));
    const lift = f > 0 && f < 1 ? 1.4 * Math.sin(PI * f) : 0;
    const ytop = h * Math.max(Math.sin(ang.front), Math.sin(ang.right), Math.sin(ang.back), Math.sin(ang.left)) + 0.04 + lift;
    const closed = f >= 1 && !o.gap;
    const top = mkF([-w / 2, ytop, d / 2], [1, 0, 0], [0, 0, -1], rect(w, d), { grp, col: C('top'), print: PR.top, closed });
    const out = [top];
    const tf = -HP * eio(win(f, 0.12, 0.7));
    const side = (k, A2, B2, L) => {
      const p = attach(top, A2, B2, -ang[k], rect(L, h), { grp, col: C(k), print: PR[k], closed, fl: o.fl });
      out.push(p);
      if (o.tabs !== false && (k === 'front' || k === 'back') && !(closed)) {
        const tw = Math.min(1.2, L * 0.2);
        const trap = [[0, 0], [h, 0], [h - tw * 0.7, tw], [tw * 0.7, tw]];
        out.push(attach(p, [L, 0], [L, h], tf, trap, { grp, col: PAL.tab, print: tabPrint, bias: 1.5, fl: false }));
        out.push(attach(p, [0, h], [0, 0], tf, trap, { grp, col: PAL.tab, print: tabPrint, bias: 1.5, fl: false }));
      }
      return p;
    };
    side('back', [0, 0], [w, 0], w);
    side('right', [w, 0], [w, d], d);
    const fr = side('front', [w, d], [0, d], w);
    side('left', [0, d], [0, 0], d);
    if (f < 0.999) out.push(attach(fr, [w, h], [0, h], -HP * eio(win(f, 0.72, 1)), rect(w, d), { grp, col: C('bottom') || PAL.card, print: PR.bottom, fl: o.fl }));
    return out;
  };
  // tent card: two panels meeting at a printed fold line, with little glue feet. a: 0 flat .. 1 standing
  const tent = (o) => {
    const grp = GID++, al = (o.ang || 1.12) * eio(clamp(o.a == null ? 1 : o.a)), s = Math.sin(al), c = Math.cos(al), yr = o.h * s + 0.03;
    const fr = mkF([-o.w / 2, yr, 0], [1, 0, 0], [0, -s, -c], rect(o.w, o.h), { grp, col: o.col || PAL.card, print: o.pf });
    const bk = mkF([o.w / 2, yr, 0], [-1, 0, 0], [0, -s, c], rect(o.w, o.h), { grp, col: o.col2 || o.col || PAL.card, print: o.pb, hinge: true });
    const feet = [attach(fr, [o.w, o.h], [0, o.h], al, rect(o.w, 1.1), { grp, col: PAL.tab, print: tabPrint, fl: false }),
      attach(bk, [o.w, o.h], [0, o.h], al, rect(o.w, 1.1), { grp, col: PAL.tab, print: tabPrint, fl: false })];
    return [fr, bk, ...feet];
  };
  // flat piece of card lying on the mat (print "up" points away from camera before yaw)
  const flat = (w, d, col, print, y = 0.06) => [mkF([-w / 2, y, d / 2], [1, 0, 0], [0, 0, -1], rect(w, d), { grp: GID++, col, print, flat: true })];
  // prism along an axis frame {o, ax, u, v}; sec is a CCW 2D section in (u, v)
  const prism = (sec, len, fr, col, print, capCol) => {
    const grp = GID++, out = [], n = sec.length, cx = sec.reduce((s, p) => s + p[0], 0) / n, cy = sec.reduce((s, p) => s + p[1], 0) / n;
    const at = (p, l) => add(fr.o, add(mul(fr.ax, l), add(mul(fr.u, p[0]), mul(fr.v, p[1]))));
    for (let i = 0; i < n; i++) {
      const a = sec[i], b = sec[(i + 1) % n], mid = [(a[0] + b[0]) / 2 - cx, (a[1] + b[1]) / 2 - cy];
      const hint = add(mul(fr.u, mid[0]), mul(fr.v, mid[1]));
      out.push(fromPts([at(a, 0), at(a, len), at(b, len), at(b, 0)], hint, { grp, col: typeof col === 'function' ? col(i) : col, print, idx: i, closed: true }));
    }
    out.push(fromPts(sec.map((p) => at(p, len)), fr.ax, { grp, col: capCol || col, closed: true }));
    out.push(fromPts(sec.map((p) => at(p, 0)).reverse(), mul(fr.ax, -1), { grp, col: capCol || col, closed: true }));
    return out;
  };
  const ngon = (r, n, rot = 0) => Array.from({ length: n }, (_, i) => [Math.cos(rot + (i / n) * PI * 2) * r, Math.sin(rot + (i / n) * PI * 2) * r]);
  // folded strip arrow lying on the mat: accordion creases, pointed head; prog grows it along the path
  const resample = (pts, step = 0.5) => {
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / step));
      for (let j = 1; j <= n; j++) out.push([ax + ((bx - ax) * j) / n, az + ((bz - az) * j) / n]);
    }
    return out;
  };
  const bez = (p0, p1, p2, p3, n = 30) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, m = 1 - t; return [0, 1].map((k) => m * m * m * p0[k] + 3 * m * m * t * p1[k] + 3 * m * t * t * p2[k] + t * t * t * p3[k]); });
  const pathAt = (P, L) => { // point + tangent at arc length L on a polyline
    let acc = 0;
    for (let i = 0; i < P.length - 1; i++) {
      const dx = P[i + 1][0] - P[i][0], dz = P[i + 1][1] - P[i][1], l = Math.hypot(dx, dz);
      if (acc + l >= L || i === P.length - 2) { const u = clamp((L - acc) / (l || 1)); return [P[i][0] + dx * u, P[i][1] + dz * u, dx / (l || 1), dz / (l || 1)]; }
      acc += l;
    }
    return [P[0][0], P[0][1], 1, 0];
  };
  const pathLen = (P) => { let L = 0; for (let i = 0; i < P.length - 1; i++) L += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); return L; };
  const strip = (path, prog, o) => {
    if (prog <= 0) return [];
    const P = resample(path), L = pathLen(P), vis = L * clamp(prog), wd = o.w || 2.2, hl = Math.min(vis, o.head || 3.4), grp = GID++;
    const out = [], seg = o.seg || 3.0, body = Math.max(0, vis - hl);
    const pt = (l, side, y) => { const [x, z, tx, tz] = pathAt(P, l); return [x - tz * side, y, z + tx * side]; };
    const yAt = (i) => (i % 2 ? 0.55 : 0.07);
    let l0 = 0, i = 0;
    while (l0 < body - 0.01) {
      const l1 = Math.min(body, l0 + seg), y0 = yAt(i), y1 = l1 >= body ? 0.07 : yAt(i + 1);
      out.push(fromPts([pt(l0, -wd / 2, y0), pt(l1, -wd / 2, y1), pt(l1, wd / 2, y1), pt(l0, wd / 2, y0)], [0, 1, 0], { grp, col: o.col, print: o.print, fl: false, strip: true }));
      l0 = l1; i++;
    }
    if (hl > 0.3) {
      const hw = wd * (o.hw || 1.15);
      out.push(fromPts([pt(body, -hw, 0.07), pt(vis, 0, 0.07), pt(body, hw, 0.07)], [0, 1, 0], { grp, col: o.col, fl: false, strip: true }));
    }
    return out;
  };
  // a folded paper star rosette (ten facets around a raised centre)
  const star = (R, r, dep, cA, cB) => {
    const grp = GID++, out = [], pts = [];
    for (let k = 0; k < 10; k++) { const a = -HP + (k * PI) / 5, rr = k % 2 ? r : R; pts.push([Math.cos(a) * rr, -Math.sin(a) * rr, 0]); }
    const cen = [0, 0, -dep];
    for (let k = 0; k < 10; k++) out.push(fromPts([cen, pts[k], pts[(k + 1) % 10]], [0, 0, -1], { grp, col: k % 2 ? cA : cB, fl: false }));
    return out;
  };

  // ---------- print helpers (all prints are drawn in mm on the face) ----------
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  const txt = (c, s, x, y, size, col, align = 'center', font = '"Fredoka"', wt = 700) => {
    c.font = `${wt} ${size}px ${font}`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y);
  };
  const fitTxt = (c, s, x, y, size, maxW, col, font = '"Fredoka"', wt = 700) => {
    c.font = `${wt} ${size}px ${font}`; const m = c.measureText(s).width; if (m > maxW) size *= maxW / m;
    txt(c, s, x, y, size, col, 'center', font, wt);
  };
  const dots = (c, x0, y0, x1, y1, col = 'rgba(40,40,40,0.4)', lw = 0.8, dash = [3, 3]) => {
    c.save(); c.setLineDash(dash); c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.restore();
  };
  const partNo = (c, s, x, y, col = 'rgba(40,40,40,0.55)') => txt(c, s, x, y, 4.2, col, 'left', '"Space Mono"', 700);
  const catIcon = (c, x, y, s, col = PAL.ginger) => {
    c.fillStyle = col;
    c.beginPath(); c.moveTo(x - s * 0.42, y - s * 0.05); c.lineTo(x - s * 0.36, y - s * 0.5); c.lineTo(x - s * 0.1, y - s * 0.3); c.lineTo(x + s * 0.1, y - s * 0.3); c.lineTo(x + s * 0.36, y - s * 0.5); c.lineTo(x + s * 0.42, y - s * 0.05);
    c.quadraticCurveTo(x + s * 0.44, y + s * 0.38, x, y + s * 0.38); c.quadraticCurveTo(x - s * 0.44, y + s * 0.38, x - s * 0.42, y - s * 0.05); c.fill();
    c.fillStyle = PAL.ink; c.beginPath(); c.ellipse(x - s * 0.16, y + s * 0.02, s * 0.05, s * 0.08, 0, 0, 7); c.ellipse(x + s * 0.16, y + s * 0.02, s * 0.05, s * 0.08, 0, 0, 7); c.fill();
    c.fillStyle = PAL.pink; c.beginPath(); c.moveTo(x - s * 0.05, y + s * 0.13); c.lineTo(x + s * 0.05, y + s * 0.13); c.lineTo(x, y + s * 0.19); c.fill();
    c.strokeStyle = PAL.ink; c.lineWidth = s * 0.018;
    [[-1, 0.15], [-1, 0.22], [1, 0.15], [1, 0.22]].forEach(([d, yy]) => { c.beginPath(); c.moveTo(x + d * s * 0.12, y + s * yy); c.lineTo(x + d * s * 0.42, y + s * (yy + (yy - 0.18) * 1.5)); c.stroke(); });
  };
  const dogIcon = (c, x, y, s, col = PAL.tan) => {
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y + s * 0.02, s * 0.32, s * 0.36, 0, 0, 7); c.fill();
    c.fillStyle = PAL.brown; c.beginPath(); c.ellipse(x - s * 0.34, y + s * 0.02, s * 0.11, s * 0.26, 0.3, 0, 7); c.ellipse(x + s * 0.34, y + s * 0.02, s * 0.11, s * 0.26, -0.3, 0, 7); c.fill();
    c.fillStyle = PAL.cream; c.beginPath(); c.ellipse(x, y + s * 0.2, s * 0.16, s * 0.12, 0, 0, 7); c.fill();
    c.fillStyle = PAL.ink; c.beginPath(); c.arc(x - s * 0.13, y - s * 0.04, s * 0.045, 0, 7); c.arc(x + s * 0.13, y - s * 0.04, s * 0.045, 0, 7); c.fill();
    c.beginPath(); c.ellipse(x, y + s * 0.14, s * 0.07, s * 0.05, 0, 0, 7); c.fill();
  };
  const tickMark = (c, x, y, s, col) => { c.strokeStyle = col; c.lineWidth = s * 0.22; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - s * 0.5, y); c.lineTo(x - s * 0.12, y + s * 0.4); c.lineTo(x + s * 0.55, y - s * 0.45); c.stroke(); };
  const crossMark = (c, x, y, s, col) => { c.strokeStyle = col; c.lineWidth = s * 0.24; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - s * 0.45, y - s * 0.45); c.lineTo(x + s * 0.45, y + s * 0.45); c.moveTo(x + s * 0.45, y - s * 0.45); c.lineTo(x - s * 0.45, y + s * 0.45); c.stroke(); };

  // ---- prints for each piece ----
  const pCardFace = (kind) => (c, w, h) => {
    c.fillStyle = PAL.card; c.fillRect(0, 0, w, h);
    c.fillStyle = kind === 'cat' ? '#bcd9ee' : '#f5d898'; rr(c, 3.5, 3.5, w - 7, h * 0.6, 2.5); c.fill();
    (kind === 'cat' ? catIcon : dogIcon)(c, w / 2, 3.5 + h * 0.33, h * 0.52);
    c.fillStyle = kind === 'cat' ? PAL.orange : PAL.blue; c.fillRect(3.5, h * 0.68, w - 7, h * 0.27);
    txt(c, kind, w / 2, h * 0.82, h * 0.24, '#fff');
  };
  const pTag = (s, col, size = 30, sub) => (c, w, h) => {
    c.fillStyle = PAL.card; c.fillRect(0, 0, w, h);
    c.fillStyle = col; c.fillRect(0, 0, w, h * 0.17);
    c.fillStyle = 'rgba(255,255,255,0.7)'; for (let x = 6; x < w - 3; x += 7) { c.beginPath(); c.arc(x, h * 0.085, 0.9, 0, 7); c.fill(); }
    fitTxt(c, s, w / 2, h * (sub ? 0.5 : 0.6), size, w * 0.9, col);
    if (sub) fitTxt(c, sub, w / 2, h * 0.82, size * 0.42, w * 0.9, PAL.ink, '"Fredoka"', 600);
    partNo(c, 'T' + (s.length % 7 + 1), 2.5, h - 3.5);
  };
  const pPlainBack = (col) => (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); };
  // robot
  const pChest = (dial) => (c, w, h) => {
    c.fillStyle = PAL.card; c.fillRect(0, 0, w, h);
    c.fillStyle = PAL.blue; rr(c, 7, 6, w - 14, 74, 6); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1; rr(c, 10, 9, w - 20, 68, 4.5); c.stroke();
    txt(c, 'MODEL', w / 2, 21, 17, '#fff');
    for (let i = 0; i < 3; i++) {
      const x = 32 + i * 38, y = 53, r = 12.5, a = [-2.2, -0.9, -1.6][i] + dial * [1.9, -1.4, 2.3][i];
      c.fillStyle = PAL.cream; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
      c.strokeStyle = PAL.orange; c.lineWidth = 1.2;
      for (let k = 0; k < 7; k++) { const b = -PI * 1.15 + (k / 6) * PI * 1.3; c.beginPath(); c.moveTo(x + Math.cos(b) * (r - 3), y + Math.sin(b) * (r - 3)); c.lineTo(x + Math.cos(b) * (r - 0.8), y + Math.sin(b) * (r - 0.8)); c.stroke(); }
      c.strokeStyle = PAL.ink; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * (r - 3.5), y + Math.sin(a) * (r - 3.5)); c.stroke();
      c.fillStyle = PAL.ink; c.beginPath(); c.arc(x, y, 2.2, 0, 7); c.fill();
    }
    c.fillStyle = '#151820'; rr(c, 32, h - 21, w - 64, 10, 3); c.fill();
    txt(c, 'DATA IN', w / 2, h - 27, 6, PAL.ink, 'center', '"Space Mono"', 700);
    c.fillStyle = PAL.orange;
    for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(8 + k * 6, h - 4); c.lineTo(12 + k * 6, h - 14); c.lineTo(15 + k * 6, h - 14); c.lineTo(11 + k * 6, h - 4); c.fill(); c.beginPath(); c.moveTo(w - 8 - k * 6, h - 4); c.lineTo(w - 12 - k * 6, h - 14); c.lineTo(w - 15 - k * 6, h - 14); c.lineTo(w - 11 - k * 6, h - 4); c.fill(); }
    partNo(c, 'B1', 3, 3);
  };
  const pRivets = (c, w, h) => { c.fillStyle = 'rgba(40,50,70,0.45)'; [[5, 5], [w - 5, 5], [5, h - 5], [w - 5, h - 5]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 1.6, 0, 7); c.fill(); }); };
  const pBodySide = (c, w, h) => {
    c.fillStyle = PAL.card; c.fillRect(0, 0, w, h);
    c.fillStyle = PAL.blue; c.fillRect(0, h * 0.62, w, h * 0.16);
    c.fillStyle = PAL.orange; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(w * 0.3 + k * 11, 22); c.lineTo(w * 0.3 + k * 11 + 7, 30); c.lineTo(w * 0.3 + k * 11, 38); c.lineTo(w * 0.3 + k * 11 + 3, 30); c.fill(); }
    c.strokeStyle = 'rgba(40,50,70,0.4)'; c.lineWidth = 0.8; rr(c, 10, 46, w - 20, 16, 2); c.stroke();
    for (let x = 16; x < w - 12; x += 6) { c.beginPath(); c.moveTo(x, 50); c.lineTo(x, 58); c.stroke(); }
    pRivets(c, w, h); partNo(c, 'B3', 3, h - 4);
  };
  const pBodyTop = (c, w, h) => { c.fillStyle = PAL.card; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(40,50,70,0.35)'; c.lineWidth = 1.2; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(15, 12 + k * 6); c.lineTo(45, 12 + k * 6); c.stroke(); } pRivets(c, w, h); };
  const pFace = (look) => (c, w, h) => {
    c.fillStyle = PAL.card; c.fillRect(0, 0, w, h);
    c.fillStyle = '#d8e5f1'; rr(c, 8, 8, w - 16, h - 16, 10); c.fill();
    c.strokeStyle = PAL.blue; c.lineWidth = 2; rr(c, 8, 8, w - 16, h - 16, 10); c.stroke();
    [[w * 0.32, h * 0.43], [w * 0.68, h * 0.43]].forEach(([x, y]) => {
      c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, 15, 0, 7); c.fill();
      c.strokeStyle = PAL.ink; c.lineWidth = 2; c.stroke();
      c.fillStyle = PAL.ink; c.beginPath(); c.arc(x + look * 6, y + 1, 7.5, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(x + look * 6 - 2.6, y - 2.4, 2.2, 0, 7); c.fill();
    });
    c.fillStyle = 'rgba(233,121,141,0.55)'; c.beginPath(); c.ellipse(w * 0.17, h * 0.66, 6, 3.6, 0, 0, 7); c.ellipse(w * 0.83, h * 0.66, 6, 3.6, 0, 0, 7); c.fill();
    c.fillStyle = PAL.orange; rr(c, w * 0.34, h * 0.68, w * 0.32, 11, 4); c.fill();
    c.strokeStyle = 'rgba(60,25,10,0.7)'; c.lineWidth = 1.1; for (let k = 1; k < 5; k++) { const x = w * 0.34 + (k * w * 0.32) / 5; c.beginPath(); c.moveTo(x, h * 0.68 + 2); c.lineTo(x, h * 0.68 + 9); c.stroke(); }
    partNo(c, 'A1', 3, 3.5);
  };
  const pHeadSide = (c, w, h) => {
    c.fillStyle = PAL.card; c.fillRect(0, 0, w, h);
    c.fillStyle = PAL.blue; c.beginPath(); c.arc(w / 2, h * 0.5, 17, 0, 7); c.fill();
    c.fillStyle = PAL.card; c.beginPath(); c.arc(w / 2, h * 0.5, 10, 0, 7); c.fill();
    c.fillStyle = PAL.orange; c.beginPath(); c.arc(w / 2, h * 0.5, 5, 0, 7); c.fill();
    pRivets(c, w, h); partNo(c, 'A2', 3, h - 4);
  };
  const pHeadTop = (c, w, h) => { c.fillStyle = PAL.card; c.fillRect(0, 0, w, h); c.fillStyle = PAL.blue; c.fillRect(0, h * 0.42, w, 14); txt(c, 'AI-01', w / 2, h * 0.42 + 7, 9, '#fff', 'center', '"Space Mono"', 700); pRivets(c, w, h); };
  const pBlueArm = (c, w, h) => { c.fillStyle = PAL.blue; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(0, h * 0.25, w, 4); c.fillRect(0, h * 0.25 + 7, w, 2); c.fillStyle = PAL.orange; c.fillRect(0, h - 14, w, 14); };
  const pTread = (c, w, h) => {
    c.fillStyle = '#3c4249'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#5c646d'; for (let x = 2; x < w; x += 9) c.fillRect(x, 0, 4.5, h);
    if (h > 30 && w > 100) { c.fillStyle = '#8b939b'; [0.18, 0.5, 0.82].forEach((u) => { c.beginPath(); c.arc(w * u, h * 0.5, h * 0.3, 0, 7); c.fill(); c.fillStyle = '#2b3036'; c.beginPath(); c.arc(w * u, h * 0.5, h * 0.12, 0, 7); c.fill(); c.fillStyle = '#8b939b'; }); }
  };
  // cat & dog
  const pCatFace = (c, w, h) => {
    c.fillStyle = PAL.ginger; c.fillRect(0, 0, w, h);
    c.fillStyle = PAL.gingerD; [[0.3, 0], [0.5, 0], [0.7, 0]].forEach(([u]) => { c.beginPath(); c.moveTo(w * u - 4, 0); c.lineTo(w * u + 4, 0); c.lineTo(w * u, 13); c.fill(); });
    c.fillStyle = PAL.cream; c.beginPath(); c.ellipse(w / 2, h * 0.74, w * 0.3, h * 0.22, 0, 0, 7); c.fill();
    [[w * 0.3, h * 0.44], [w * 0.7, h * 0.44]].forEach(([x, y]) => {
      c.fillStyle = '#86c15a'; c.beginPath(); c.ellipse(x, y, 7.5, 6, 0, 0, 7); c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 1.3; c.stroke();
      c.fillStyle = PAL.ink; c.beginPath(); c.ellipse(x, y, 1.9, 5.2, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 2.6, y - 2, 1.3, 0, 7); c.fill();
    });
    c.fillStyle = PAL.pink; c.beginPath(); c.moveTo(w / 2 - 4, h * 0.62); c.lineTo(w / 2 + 4, h * 0.62); c.lineTo(w / 2, h * 0.68); c.fill();
    c.strokeStyle = PAL.ink; c.lineWidth = 1.1; c.beginPath(); c.moveTo(w / 2, h * 0.68); c.lineTo(w / 2, h * 0.73); c.quadraticCurveTo(w / 2 - 4, h * 0.78, w / 2 - 7, h * 0.73); c.moveTo(w / 2, h * 0.73); c.quadraticCurveTo(w / 2 + 4, h * 0.78, w / 2 + 7, h * 0.73); c.stroke();
    c.lineWidth = 0.8; [-1, 1].forEach((d) => [0.68, 0.74].forEach((yy, i) => { c.beginPath(); c.moveTo(w / 2 + d * 12, h * yy); c.lineTo(w / 2 + d * (w * 0.5 - 1), h * (yy - 0.05 + i * 0.08)); c.stroke(); }));
    partNo(c, 'C1', 2.5, h - 3.5, 'rgba(90,40,10,0.6)');
  };
  const pStripes = (base, stripe, n = 4, white = false) => (c, w, h) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    c.fillStyle = stripe; for (let k = 0; k < n; k++) { const x = ((k + 0.6) * w) / n; c.beginPath(); c.moveTo(x - 4, 0); c.lineTo(x + 4, 0); c.lineTo(x + 1, h * 0.55); c.lineTo(x - 2, h * 0.5); c.fill(); }
    if (white) { c.fillStyle = PAL.cream; c.fillRect(0, h * 0.72, w, h * 0.28); }
  };
  const pCatChest = (c, w, h) => { c.fillStyle = PAL.ginger; c.fillRect(0, 0, w, h); c.fillStyle = PAL.cream; c.beginPath(); c.ellipse(w / 2, h * 0.65, w * 0.3, h * 0.5, 0, 0, 7); c.fill(); };
  const pSock = (base) => (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); c.fillStyle = PAL.cream; c.fillRect(0, h * 0.55, w, h * 0.45); };
  const pEarIn = (c, w, h) => { c.fillStyle = PAL.ginger; c.fillRect(0, 0, w, h); c.fillStyle = PAL.pink; c.beginPath(); c.moveTo(w * 0.25, h * 0.85); c.lineTo(w * 0.5, h * 0.2); c.lineTo(w * 0.75, h * 0.85); c.fill(); };
  const pDogFace = (c, w, h) => {
    c.fillStyle = PAL.tan; c.fillRect(0, 0, w, h);
    c.fillStyle = PAL.brown; c.beginPath(); c.ellipse(w * 0.3, h * 0.38, 11, 9, 0.3, 0, 7); c.fill();
    [[w * 0.3, h * 0.42], [w * 0.7, h * 0.42]].forEach(([x, y]) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, 6.2, 0, 7); c.fill(); c.fillStyle = PAL.ink; c.beginPath(); c.arc(x + 0.8, y + 0.6, 3.8, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 2, y - 1, 1.2, 0, 7); c.fill(); });
    c.fillStyle = PAL.brown; c.fillRect(w * 0.24, h * 0.24, 9, 2.2); c.fillRect(w * 0.62, h * 0.24, 9, 2.2);
    c.fillStyle = PAL.red; c.fillRect(0, h - 9, w, 9); c.fillStyle = PAL.yellow; c.beginPath(); c.arc(w / 2, h - 4.5, 3.6, 0, 7); c.fill();
    partNo(c, 'D1', 2.5, 4, 'rgba(70,40,20,0.6)');
  };
  const pSnout = (c, w, h) => {
    c.fillStyle = PAL.cream; c.fillRect(0, 0, w, h);
    c.fillStyle = PAL.ink; c.beginPath(); c.ellipse(w / 2, h * 0.32, 7, 5, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(w / 2 - 2, h * 0.27, 2.2, 1.2, 0, 0, 7); c.fill();
    c.strokeStyle = PAL.ink; c.lineWidth = 1.2; c.beginPath(); c.moveTo(w / 2, h * 0.45); c.lineTo(w / 2, h * 0.6); c.quadraticCurveTo(w / 2 - 6, h * 0.75, w / 2 - 11, h * 0.6); c.moveTo(w / 2, h * 0.6); c.quadraticCurveTo(w / 2 + 6, h * 0.75, w / 2 + 11, h * 0.6); c.stroke();
    c.fillStyle = PAL.pink; c.beginPath(); c.ellipse(w / 2 + 3, h * 0.78, 4, 3.2, 0, 0, 7); c.fill();
  };
  const pSpots = (c, w, h) => { c.fillStyle = PAL.tan; c.fillRect(0, 0, w, h); c.fillStyle = PAL.brown; c.beginPath(); c.ellipse(w * 0.35, h * 0.4, w * 0.16, h * 0.3, 0.4, 0, 7); c.fill(); c.beginPath(); c.ellipse(w * 0.78, h * 0.7, w * 0.08, h * 0.16, 0, 0, 7); c.fill(); };

  // ---------- models (local coords: front faces -z, base on y = 0) ----------
  const robot = (o) => {
    const out = [], fB = o.fBody == null ? 1 : o.fBody, fH = o.fHead == null ? 1 : o.fHead, parts = o.parts == null ? 1 : o.parts;
    out.push(...box({ w: 14, d: 11, h: 12, f: fB, col: PAL.card, gap: 'right', gapAmt: 0.075, pr: { front: pChest(o.dial || 0), right: pBodySide, left: pBodySide, back: pBodySide, top: pBodyTop } }));
    // head: folds flat on the mat beside the body, then hops up on top
    const hp = o.hop == null ? 1 : o.hop, hx = o.headX == null ? 18 : o.headX;
    const hpos = [lerp(hx, 0, hp), lerp(0, 12, hp) + Math.sin(PI * hp) * 7, lerp(-2, 0, hp)];
    const head = [...box({ w: 12, d: 10, h: 10, f: fH, col: PAL.card, gap: 'left', gapAmt: 0.04, pr: { front: pFace(o.look || 0), left: pHeadSide, right: pHeadSide, top: pHeadTop, back: pBodyTop } })];
    if (hp >= 1 && parts > 0) {
      const s = eback(parts);
      head.push(...xf(box({ w: 1.6, d: 3.6, h: 3.6, col: PAL.orange }), [-6.8, 3.2, 0], 0, s), ...xf(box({ w: 1.6, d: 3.6, h: 3.6, col: PAL.orange }), [6.8, 3.2, 0], 0, s));
      head.push(...xf(box({ w: 0.5, d: 0.5, h: 4.2, col: PAL.steel }), [0, 10, 0.5], 0, s), ...xf(box({ w: 1.9, d: 1.9, h: 1.9, col: PAL.red }), [0, 10 + 4.2 * s, 0.5], 0.3, s));
    }
    out.push(...xf(head, hpos, (o.headYaw || 0) * (hp >= 1 ? 1 : 0)));
    if (parts > 0) {
      const s = eback(parts);
      [-1, 1].forEach((d) => {
        out.push(...xf(box({ w: 3, d: 13, h: 4.5, col: '#3c4249', pr: { right: pTread, left: pTread, front: pTread, back: pTread, top: pTread } }), [d * 8.7, 0, 0], 0, s));
        out.push(...xf(box({ w: 2.4, d: 3, h: 8, col: PAL.blue, pr: { front: pBlueArm, back: pBlueArm, left: pBlueArm, right: pBlueArm } }), [d * 8.4, 4.8 + (o.arm || 0) * (d > 0 ? 1 : -1) * 0, -1], 0, s));
      });
    }
    return out;
  };
  const cat = (o = {}) => {
    const out = [];
    [[-2.1, -3.4], [2.1, -3.4], [-2.1, 3.4], [2.1, 3.4]].forEach(([x, z]) => out.push(...xf(box({ w: 1.8, d: 1.8, h: 2.6, col: PAL.ginger, pr: { front: pSock(PAL.ginger), left: pSock(PAL.ginger), right: pSock(PAL.ginger), back: pSock(PAL.ginger) } }), [x, 0, z])));
    out.push(...xf(box({ w: 6.4, d: 10, h: 5.2, col: PAL.ginger, pr: { left: pStripes(PAL.ginger, PAL.gingerD, 4, true), right: pStripes(PAL.ginger, PAL.gingerD, 4, true), top: pStripes(PAL.ginger, PAL.gingerD, 3), front: pCatChest, back: pStripes(PAL.ginger, PAL.gingerD, 2) } }), [0, 2.6, 0]));
    const head = box({ w: 7.2, d: 6, h: 6.2, col: PAL.ginger, gap: 'right', gapAmt: 0.035, pr: { front: pCatFace, top: pStripes(PAL.ginger, PAL.gingerD, 3), left: pStripes(PAL.ginger, PAL.gingerD, 2), right: pStripes(PAL.ginger, PAL.gingerD, 2) } });
    [-1, 1].forEach((d) => {
      const bx = d * 2.1, y = 6.2, z0 = -1.6, z1 = 1.2, apex = [d * 2.5, 9.0, -0.9];
      const grp = GID++;
      head.push(fromPts([[bx - 1.4, y, z0], [bx + 1.4, y, z0], apex], [0, 0.3, -1], { grp, col: PAL.ginger, print: pEarIn, fl: false }));
      head.push(fromPts([[bx + 1.4, y, z0], [bx + 1.4, y, z1], apex], [d, 0.2, 0], { grp, col: PAL.ginger, fl: false }));
      head.push(fromPts([[bx - 1.4, y, z0], [bx - 1.4, y, z1], apex], [-d, 0.2, 0], { grp, col: PAL.ginger, fl: false }));
      head.push(fromPts([[bx - 1.4, y, z1], [bx + 1.4, y, z1], apex], [0, 0.3, 1], { grp, col: PAL.gingerD, fl: false }));
    });
    out.push(...xf(head, [0, 6.6, -4.6], o.headYaw || 0));
    out.push(...xf(box({ w: 1.3, d: 1.3, h: 7, col: PAL.ginger, pr: { left: pStripes(PAL.ginger, PAL.gingerD, 2), right: pStripes(PAL.ginger, PAL.gingerD, 2), front: pStripes(PAL.ginger, PAL.gingerD, 2) } }), [0, 6.5, 4.4], 0.2));
    return out;
  };
  const dog = (o = {}) => {
    const out = [];
    [[-2.3, -3.8], [2.3, -3.8], [-2.3, 3.8], [2.3, 3.8]].forEach(([x, z]) => out.push(...xf(box({ w: 2, d: 2, h: 3.2, col: PAL.tan, pr: { front: pSock(PAL.tan), left: pSock(PAL.tan), right: pSock(PAL.tan) } }), [x, 0, z])));
    out.push(...xf(box({ w: 7, d: 11, h: 5.6, col: PAL.tan, pr: { left: pSpots, right: pSpots, top: pSpots } }), [0, 3.2, 0]));
    const head = box({ w: 7, d: 6.6, h: 6.6, col: PAL.tan, gap: 'left', gapAmt: 0.04, pr: { front: pDogFace, top: pSpots } });
    head.push(...xf(box({ w: 4.2, d: 3.4, h: 3.2, col: PAL.cream, pr: { front: pSnout } }), [0, 0.3, -4.9]));
    [-1, 1].forEach((d) => {
      const grp = GID++;
      head.push(fromPts([[d * 3.55, 6.6, -2.2], [d * 3.55, 6.6, 1.2], [d * 4.7, 1.6, 1.0], [d * 4.6, 1.4, -1.8]], [d, 0, 0], { grp, col: PAL.brown, bcol: PAL.brown, fl: false }));
    });
    out.push(...xf(head, [0, 7.4, -5.6], o.headYaw || 0));
    out.push(...xf(box({ w: 1.4, d: 1.4, h: 4.6, col: PAL.brown }), [0, 7.6, 5.4], 0));
    return out;
  };
  const flag = (o) => { // pole in a little cube base, two-sided printed flag; spin = yaw of the flag
    const out = [...box({ w: 3, d: 3, h: 2.4, col: o.baseCol || PAL.yellow })];
    out.push(...box({ w: 0.45, d: 0.45, h: o.pole, col: PAL.wood }).map((f) => Object.assign(f, { O: add(f.O, [0, 2.3, 0]) })));
    const grp = GID++, fl = mkF([0.25, 2.3 + o.pole - 0.2, 0], [1, 0, 0], [0, -1, 0], rect(o.fw, o.fh), { grp, col: o.col, print: o.pf, bcol: o.col2 || o.col, bprint: o.pb, fl: false });
    out.push(...xf([fl], [0, 0, 0], o.spin || 0));
    return out;
  };
  // tools on the mat
  const ruler = (len) => {
    const pr = (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#dfe3e6'); g.addColorStop(0.5, '#b8bec4'); g.addColorStop(1, '#d4d8db');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 0.4; for (let y = 2; y < h; y += 1.6) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      c.strokeStyle = 'rgba(25,25,30,0.85)'; c.lineWidth = 0.5;
      for (let x = 10, i = 0; x < w - 8; x += 1, i++) { const L = i % 10 === 0 ? 9 : i % 5 === 0 ? 6 : 3.5; c.beginPath(); c.moveTo(x, h); c.lineTo(x, h - L); c.stroke(); if (i % 10 === 0 && i) txt(c, String(i / 10), x, h - 14, 5.5, 'rgba(25,25,30,0.85)', 'center', '"Space Grotesk"', 700); }
    };
    return box({ w: len, d: 3.6, h: 0.22, col: { top: '#c9ced3', side: '#5a4a3a' }, pr: { top: pr }, tabs: false });
  };
  const knife = () => {
    const out = [], fr = { o: [0, 0.62, 0], ax: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] };
    const knurl = (c, w, h) => { c.fillStyle = '#9aa1a8'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(40,45,50,0.55)'; c.lineWidth = 0.5; for (let x = 0; x < w; x += 1.4) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + h, h); c.stroke(); } c.fillStyle = PAL.blue; c.fillRect(w * 0.1, 0, w * 0.45, h); };
    out.push(...prism(ngon(0.62, 8, 0.39), 11, fr, '#a9b0b6', knurl, '#8d949a'));
    out.push(...prism(ngon(0.7, 8, 0.39), 1.6, { ...fr, o: [11, 0.62, 0] }, '#c7ccd1', null, '#9aa1a8'));
    out.push(fromPts([[12.6, 0.75, -0.05], [15.6, 0.7, 0], [12.6, 0.45, 0.05]], [0, 0.2, -1], { grp: GID++, col: '#e3e7ea', fl: false }));
    return out;
  };
  const glueStick = () => {
    const band = (c, w, h) => { c.fillStyle = '#f2efe8'; c.fillRect(0, 0, w, h); c.fillStyle = '#7b4fb0'; c.fillRect(w * 0.18, 0, w * 0.1, h); c.fillStyle = PAL.yellow; c.fillRect(w * 0.32, 0, w * 0.3, h); c.fillStyle = '#7b4fb0'; c.fillRect(w * 0.66, 0, w * 0.05, h); };
    const out = prism(ngon(1.5, 12), 8.5, { o: [0, 0, 0], ax: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] }, '#f2efe8', band, '#f2efe8');
    out.push(...prism(ngon(1.62, 12), 3.2, { o: [0, 8.5, 0], ax: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] }, '#7b4fb0', null, '#8e62c4'));
    return out;
  };

  // ---------- the cutting mat (cached top-down texture, drawn row by row in perspective) ----------
  const MX0 = -58, MX1 = 232, MZ0 = -34, MZ1 = 66;
  const TX0 = -170, TZ0 = -70, TS = 5, TW = 500, TD = 300;
  let MATC = null, FIB = null, SL = null, CL = null, DL = null;
  const matTex = () => {
    if (MATC) return MATC;
    const c = H.layer(TW * TS, TD * TS), g = c.getContext('2d'), X = (x) => (x - TX0) * TS, Z = (z) => (z - TZ0) * TS;
    const nz = H.makeNoise(31), r = H.rng(77);
    // walnut-ish desk: rows of grain running along x
    for (let y = 0; y < TD * TS; y += 2) {
      const z = y / TS, v = nz.n2(z * 0.35, 3.1) * 0.5 + nz.n2(z * 1.7, 9.2) * 0.25 + Math.sin(z * 0.9 + nz.n2(z * 0.05, 1) * 4) * 0.12;
      const k = 1 + v * 0.22, plank = Math.floor((z + 4) / 19);
      g.fillStyle = `rgb(${(168 + plank % 2 * 8) * k | 0},${(117 + plank % 2 * 5) * k | 0},${76 * k | 0})`; g.fillRect(0, y, c.width, 2);
    }
    for (let i = 0; i < 260; i++) { const y = r.range(0, c.height), x = r.range(0, c.width); g.strokeStyle = `rgba(${r.chance(0.5) ? '70,40,20' : '230,190,140'},${r.range(0.05, 0.14)})`; g.lineWidth = r.range(0.6, 2); g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 200, y + r.range(-4, 4), x + 400, y + r.range(-4, 4), x + r.range(500, 900), y + r.range(-6, 6)); g.stroke(); }
    for (let z = -4; z < TD; z += 19) { g.fillStyle = 'rgba(40,22,10,0.45)'; g.fillRect(0, Z(z), c.width, 2); }
    // mat drop shadow + body
    g.save(); g.filter = 'blur(10px)'; g.fillStyle = 'rgba(20,10,0,0.55)'; g.beginPath(); g.roundRect(X(MX0) + 6, Z(MZ0) + 8, (MX1 - MX0) * TS, (MZ1 - MZ0) * TS, 12); g.fill(); g.restore();
    g.fillStyle = '#23573f'; g.beginPath(); g.roundRect(X(MX0), Z(MZ0), (MX1 - MX0) * TS, (MZ1 - MZ0) * TS + 3, 12); g.fill();
    g.fillStyle = '#2d6c4e'; g.beginPath(); g.roundRect(X(MX0), Z(MZ0), (MX1 - MX0) * TS, (MZ1 - MZ0) * TS, 12); g.fill();
    g.save(); g.beginPath(); g.roundRect(X(MX0), Z(MZ0), (MX1 - MX0) * TS, (MZ1 - MZ0) * TS, 12); g.clip();
    for (let i = 0; i < 520; i++) { // mottling of the vinyl
      const x = r.range(X(MX0), X(MX1)), y = r.range(Z(MZ0), Z(MZ1)), rad = r.range(20, 120), lt = r.chance(0.5);
      const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, lt ? `rgba(120,190,150,${r.range(0.03, 0.07)})` : `rgba(10,40,25,${r.range(0.04, 0.09)})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 9000; i++) { g.fillStyle = r.chance(0.5) ? 'rgba(150,210,170,0.18)' : 'rgba(5,25,15,0.2)'; g.fillRect(r.range(X(MX0), X(MX1)), r.range(Z(MZ0), Z(MZ1)), 1, 1); }
    // healed knife cuts: mostly straight along the grid, some free
    for (let i = 0; i < 420; i++) {
      const x = r.range(X(MX0), X(MX1)), y = r.range(Z(MZ0), Z(MZ1)), L = r.range(30, 380), a = r.chance(0.6) ? r.pick([0, HP, PI / 4, -PI / 4]) + r.range(-0.03, 0.03) : r.range(0, PI);
      g.strokeStyle = `rgba(${r.chance(0.7) ? '170,220,180' : '15,45,30'},${r.range(0.08, 0.2)})`; g.lineWidth = r.range(0.5, 1.2);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
    }
    // paper offcuts and crumbs left from cutting
    const cols = [PAL.orange, PAL.yellow, PAL.blue, '#e9e2d0', PAL.red, PAL.ginger];
    for (let i = 0; i < 46; i++) {
      const x = r.range(MX0 + 4, MX1 - 4), z = r.range(MZ0 + 10, MZ1 - 4), s = r.range(0.35, 1.0), a = r.range(0, PI * 2);
      g.save(); g.translate(X(x), Z(z)); g.rotate(a);
      const pts = r.chance(0.5) ? [[0, 0], [s * 3, 0], [s * 1.2, s * 1.4]] : [[0, 0], [s * 4.5, 0.2], [s * 4.4, s * 0.6], [0.1, s * 0.5]];
      g.fillStyle = 'rgba(0,20,10,0.35)'; g.beginPath(); pts.forEach(([px, py], j) => (j ? g.lineTo(px * TS + 2, py * TS + 2) : g.moveTo(px * TS + 2, py * TS + 2))); g.fill();
      g.fillStyle = r.pick(cols); g.beginPath(); pts.forEach(([px, py], j) => (j ? g.lineTo(px * TS, py * TS) : g.moveTo(px * TS, py * TS))); g.fill();
      g.restore();
    }
    // border printing: numbers along the far and left edges
    g.fillStyle = 'rgba(214,232,180,0.75)'; g.font = `700 ${1.7 * TS}px "Space Grotesk"`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let x = MX0 + 5, i = 1; x < MX1 - 2; x += 5, i++) g.fillText(String(i * 5 - 5), X(x), Z(MZ1 - 1.6));
    for (let z = MZ0 + 5, i = 1; z < MZ1 - 2; z += 5, i++) g.fillText(String(i), X(MX0 + 1.6), Z(z));
    g.restore();
    MATC = c; return c;
  };
  const fibre = () => {
    if (FIB) return FIB;
    const c = H.layer(256, 256), g = c.getContext('2d'), r = H.rng(5);
    g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2200; i++) { const x = r.range(0, 256), y = r.range(0, 256), a = r.range(0, PI), L = r.range(2, 9); g.strokeStyle = `rgba(${r.chance(0.3) ? '150,120,90' : '120,115,105'},${r.range(0.05, 0.16)})`; g.lineWidth = r.range(0.3, 0.8); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + r.range(-1, 1), y + Math.sin(a) * L * 0.5 + r.range(-1, 1), x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
    for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(110,100,90,${r.range(0.04, 0.12)})`; g.fillRect(r.range(0, 256), r.range(0, 256), 0.8, 0.8); }
    FIB = c; return c;
  };

  const drawMat = (ctx, cam, W, Hh) => {
    const tex = matTex(), step = 2;
    ctx.fillStyle = '#2a1a0e'; ctx.fillRect(0, 0, W, Hh);
    for (let sy = 0; sy < Hh; sy += step) {
      const a = cam.ground(sy), b = cam.ground(sy + step), m = cam.ground(sy + step / 2);
      if (!a || !b || !m) continue;
      const half = ((W / 2) * m.s) / cam.F, x0 = cam.C[0] - half;
      ctx.drawImage(tex, (x0 - TX0) * TS, (b.z - TZ0) * TS, 2 * half * TS, Math.max(0.6, (a.z - b.z) * TS), 0, sy, W, step + 0.6);
    }
    // crisp printed grid (1 cm lines, bolder every 5 cm, 45-degree guides)
    const gN = cam.ground(Hh), gF = cam.ground(0) || cam.ground(Hh * 0.05);
    const zN = Math.max(MZ0 + 0.6, gN.z), zF = Math.min(MZ1 - 0.6, gF.z), xh = ((W / 2) * gF.s) / cam.F;
    const xa = Math.max(MX0 + 0.6, cam.C[0] - xh), xb = Math.min(MX1 - 0.6, cam.C[0] + xh);
    const seg = (ax, az, bx, bz) => { const p = cam.proj([ax, 0, az]), q = cam.proj([bx, 0, bz]); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
    ctx.save(); ctx.lineCap = 'butt';
    for (const major of [false, true]) {
      ctx.beginPath();
      for (let x = Math.ceil(xa); x <= xb; x++) if ((Math.abs(x) % 5 === 0) === major) seg(x, zN, x, zF);
      for (let z = Math.ceil(zN); z <= zF; z++) if ((Math.abs(z) % 5 === 0) === major) seg(xa, z, xb, z);
      ctx.strokeStyle = major ? 'rgba(222,238,184,0.42)' : 'rgba(205,230,170,0.2)'; ctx.lineWidth = major ? 1.35 : 0.9; ctx.stroke();
    }
    ctx.beginPath(); // diagonal guides, clipped to the mat
    for (let k = -300; k < 400; k += 50) {
      const z0 = MZ0 + 0.6, z1 = MZ1 - 0.6, xs = k + z0, xe = k + z1;
      const A = [clamp(xs, MX0, MX1), 0], B = [clamp(xe, MX0, MX1), 0]; A[1] = A[0] - k; B[1] = B[0] - k;
      const za = clamp(A[1], zN, zF), zb = clamp(B[1], zN, zF);
      if (zb - za > 0.5) seg(za + k, za, zb + k, zb);
    }
    ctx.strokeStyle = 'rgba(222,238,184,0.22)'; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.restore();
    // depth of field: far mat (and the desk) softly out of focus
    if (!DL) DL = H.layer(W / 2, Hh / 2);
    const d = DL.getContext('2d');
    d.setTransform(1, 0, 0, 1, 0, 0); d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, W / 2, Hh / 2);
    d.filter = 'blur(2.2px)'; d.drawImage(ctx.canvas, 0, 0, W / 2, Hh / 2); d.filter = 'none';
    const gm = d.createLinearGradient(0, 0, 0, Hh / 2); gm.addColorStop(0, 'rgba(0,0,0,1)'); gm.addColorStop(0.36, 'rgba(0,0,0,0.6)'); gm.addColorStop(0.55, 'rgba(0,0,0,0)'); gm.addColorStop(0.85, 'rgba(0,0,0,0)'); gm.addColorStop(1, 'rgba(0,0,0,0.65)');
    d.globalCompositeOperation = 'destination-in'; d.fillStyle = gm; d.fillRect(0, 0, W / 2, Hh / 2);
    ctx.drawImage(DL, 0, 0, W, Hh);
  };

  // hull for shadows
  const hull = (pts) => {
    const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (P.length < 3) return P;
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  };

  const drawFace = (ctx, cam, it) => {
    const { f, sp, front } = it, n = front ? f.n : mul(f.n, -1), lam = Math.max(0, dot(n, LIGHT));
    const path = () => { ctx.beginPath(); sp.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
    path();
    ctx.fillStyle = front ? f.col : f.bcol || PAL.back; ctx.fill();
    ctx.save(); ctx.clip();
    // affine print frame (mm), fitted at the face centre
    const cl = [f.pw / 2, f.ph / 2], p0 = cam.proj(P3(f, cl)), pu = cam.proj(P3(f, [cl[0] + 1, cl[1]])), pv = cam.proj(P3(f, [cl[0], cl[1] + 1]));
    const a = [pu[0] - p0[0], pu[1] - p0[1]], b = [pv[0] - p0[0], pv[1] - p0[1]];
    ctx.transform(a[0], a[1], b[0], b[1], p0[0] - a[0] * cl[0] - b[0] * cl[1], p0[1] - a[1] * cl[0] - b[1] * cl[1]);
    ctx.scale(0.1, 0.1);
    const W10 = f.pw * 10, H10 = f.ph * 10;
    if (!front) { ctx.translate(W10, 0); ctx.scale(-1, 1); }
    const pr = front ? f.print : f.bprint;
    if (pr) pr(ctx, W10, H10, f);
    if (front && f.hinge && f.fl !== false) dots(ctx, 0, 1.2, W10, 1.2, 'rgba(60,45,30,0.42)', 0.9, [4, 3.5]);
    // paper fibre (moves with the face)
    if (!f.noFib) {
      if (!it.pat) { const pt = ctx.createPattern(fibre(), 'repeat'); pt.setTransform(new DOMMatrix([0.45, 0, 0, 0.45, (f.grp * 37) % 100, (f.grp * 53) % 100])); FIBP = pt; }
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.9; ctx.fillStyle = FIBP; ctx.fillRect(0, 0, W10, H10);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
    // per-face Lambert shading with a warm key and cool fill
    const s = 0.6 + 0.08 * n[1] + 0.52 * lam;
    path();
    if (s < 1) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = `rgb(${255 * Math.min(1, s * (1.0 + 0.05 * lam)) | 0},${255 * Math.min(1, s * 0.985) | 0},${255 * Math.min(1, s * (0.94 + 0.1 * (1 - lam))) | 0})`; ctx.fill();
    } else { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,232,195,${(s - 1) * 0.7})`; ctx.fill(); }
    // ambient occlusion where walls meet the mat
    if (it.minY < 0.4 && Math.abs(n[1]) < 0.6) {
      const g0 = it.lowPt, g1 = cam.proj(add(P3(f, [0, 0]), [0, 0, 0]));
      const q0 = cam.proj([g0[0], 0, g0[2]]), q1 = cam.proj([g0[0], 2.5, g0[2]]);
      const gr = ctx.createLinearGradient(q0[0], q0[1], q1[0], q1[1]); gr.addColorStop(0, 'rgba(90,100,90,1)'); gr.addColorStop(1, 'rgba(255,255,255,1)');
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = gr; ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1;
      void g1;
    }
    ctx.globalCompositeOperation = 'source-over';
    // soft light cut edges / creases (white core of the card)
    ctx.strokeStyle = `rgba(255,247,230,${0.22 + 0.4 * lam})`; ctx.lineWidth = 1.05; ctx.lineJoin = 'round'; ctx.stroke();
  };
  let FIBP = null;

  // the whole frame: mat -> flat pieces -> shadows -> standing pieces (painter's sort) -> light
  const renderScene = (ctx, W, Hh, cam, faces, tt) => {
    FIBP = null;
    drawMat(ctx, cam, W, Hh);
    const items = [], groups = new Map();
    for (const f of faces) {
      const wp = f.poly.map((p) => P3(f, p)), sp = wp.map(cam.proj);
      let ok = true, zs = 0, minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9, maxY = -1e9, minY = 1e9, low = wp[0];
      for (let i = 0; i < sp.length; i++) {
        const p = sp[i]; if (p[2] < 3) ok = false; zs += p[2];
        minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]);
        maxY = Math.max(maxY, wp[i][1]); if (wp[i][1] < minY) { minY = wp[i][1]; low = wp[i]; }
      }
      if (!ok) continue;
      if (!groups.has(f.grp)) groups.set(f.grp, []);
      groups.get(f.grp).push(...wp);
      if (maxx < -40 || minx > W + 40 || maxy < -40 || miny > Hh + 40) continue;
      const cen = wp.reduce((s, p) => add(s, p), [0, 0, 0]).map((v) => v / wp.length);
      const front = dot(f.n, sub(cam.C, cen)) > 0;
      if (!front && f.closed) continue;
      items.push({ f, sp, front, depth: zs / sp.length + (f.bias || 0), ground: maxY < 0.8, minY, lowPt: [cen[0], 0, cen[2]] });
    }
    const ground = items.filter((i) => i.ground).sort((a, b) => b.depth - a.depth);
    const stand = items.filter((i) => !i.ground).sort((a, b) => (a.front !== b.front ? (a.front ? 1 : -1) : b.depth - a.depth));
    ground.forEach((it) => drawFace(ctx, cam, it));
    // shadows: each group's vertices projected along the light onto the mat (soft), plus a tight contact shadow
    if (!SL) { SL = H.layer(W / 2, Hh / 2); CL = H.layer(W / 2, Hh / 2); }
    const sg = SL.getContext('2d'), cg = CL.getContext('2d');
    [sg, cg].forEach((g) => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W / 2, Hh / 2); g.setTransform(0.5, 0, 0, 0.5, 0, 0); g.fillStyle = '#06140c'; });
    for (const [, pts] of groups) {
      let top = -1e9; for (const p of pts) top = Math.max(top, p[1]);
      if (top < 0.8) continue;
      const sh = hull(pts.map((p) => { const q = cam.proj([p[0] - (LIGHT[0] / LIGHT[1]) * p[1], 0, p[2] - (LIGHT[2] / LIGHT[1]) * p[1]]); return [q[0], q[1]]; }));
      sg.beginPath(); sh.forEach((p, i) => (i ? sg.lineTo(p[0], p[1]) : sg.moveTo(p[0], p[1]))); sg.fill();
      const lowp = pts.filter((p) => p[1] < 0.7);
      if (lowp.length > 2) { const ch = hull(lowp.map((p) => { const q = cam.proj([p[0] + 0.25, 0, p[2] + 0.35]); return [q[0], q[1]]; })); cg.beginPath(); ch.forEach((p, i) => (i ? cg.lineTo(p[0], p[1]) : cg.moveTo(p[0], p[1]))); cg.fill(); }
    }
    ctx.save(); ctx.filter = 'blur(7px)'; ctx.globalAlpha = 0.42; ctx.drawImage(SL, 0, 0, W, Hh); ctx.filter = 'blur(2px)'; ctx.globalAlpha = 0.5; ctx.drawImage(CL, 0, 0, W, Hh); ctx.restore();
    stand.forEach((it) => drawFace(ctx, cam, it));
    // warm key-light pool and lens falloff
    ctx.save();
    const lp = ctx.createRadialGradient(W * 0.38, Hh * 0.35, 40, W * 0.45, Hh * 0.45, W * 0.75);
    lp.addColorStop(0, 'rgba(255,214,150,0.16)'); lp.addColorStop(0.6, 'rgba(255,200,140,0.04)'); lp.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = lp; ctx.fillRect(0, 0, W, Hh);
    ctx.globalCompositeOperation = 'source-over';
    H.vignette(ctx, W, Hh, 0.42, '20,12,4');
    ctx.restore();
    H.grain(ctx, W, Hh, 0.03, 3 + Math.floor(tt * 12) % 7);
  };

  // stop-motion jitter: a model is nudged a hair every time the animator touches the set (on twos)
  const jit = (id, tq, amp = 0.05) => { const r = H.rng(id * 977 + Math.floor(tq * 12 + 1e-6) * 13); return [r.range(-amp, amp), r.range(-amp, amp), r.range(-amp, amp) * 0.12]; };
  const place = (faces, id, tq, x, y, z, yaw = 0, s = 1, amp = 0.04) => { const j = jit(id, tq, amp); return xf(faces, [x + j[0], y, z + j[1]], yaw + j[2], s); };

  // ---------- still / clip scene ----------
  const heroScene = (t) => {
    const q = TQ(t), F = [];
    const fBody = eio(win(q, 0.35, 1.65)), fHead = eio(win(q, 0.85, 1.95)), hop = eio(win(q, 2.05, 2.5)), parts = win(q, 2.5, 2.95);
    F.push(...place(robot({ fBody, fHead, hop, parts, headX: 17, dial: 0.4, look: -0.25, headYaw: q > 4 ? -0.08 : 0 }), 1, q, 2, 0, 4, 0.32));
    F.push(...place(cat({ headYaw: -0.25 }), 2, q, -26, 0, -3, -0.55));
    F.push(...place(dog({ headYaw: 0.2 }), 3, q, -18, 0, 15, -0.3));
    F.push(...place(tent({ w: 30, h: 8.5, a: eio(win(q, 3.0, 3.55)), pf: pTitle, pb: pPlainBack(PAL.card) }), 4, q, -3, 0, -17, 0.05));
    // a template sheet with a half-folded cube (part of the next build)
    F.push(...place(flat(28, 20, PAL.card, pSheet), 5, 0, 33, 0, 12, -0.22, 1, 0));
    F.push(...place(box({ w: 6, d: 6, h: 6, f: 0.36, col: PAL.yellow, pr: { front: pCubeF('?'), top: pCubeF(''), right: pCubeF(''), left: pCubeF(''), back: pCubeF('') } }), 6, q, 33, 0, 12, -0.22));
    // data cards scattered at the front
    [[-14, -14, 0.5, 'cat'], [-10, -9, -0.25, 'dog'], [-20, -12, 0.15, 'dog'], [-7, -16, 0.9, 'cat']].forEach(([x, z, a, k], i) => F.push(...xf(flat(5.5, 4.2, PAL.card, pCardFace(k), 0.06 + i * 0.03), [x, 0, z], a)));
    // chart in the back
    [[0, 5, PAL.orange], [1, 8, PAL.yellow], [2, 11.5, PAL.blue], [3, 15, PAL.green]].forEach(([i, hh, col]) => F.push(...xf(box({ w: 3.6, d: 3.6, h: hh, col, pr: { front: pBar(col) } }), [38 + i * 4.6, 0, 34])));
    F.push(...xf(flat(22, 8, PAL.card, pBase), [44.9, 0, 32]));
    // tools
    F.push(...xf(ruler(46), [40, 0, -12], -0.42));
    F.push(...xf(knife(), [-44, 0, 4], 0.9));
    F.push(...xf(glueStick(), [-36, 0, 30], 0));
    return F;
  };
  const pTitle = (c, w, h) => {
    c.fillStyle = PAL.card; c.fillRect(0, 0, w, h);
    c.fillStyle = PAL.blue; c.fillRect(0, 0, w, h * 0.2);
    txt(c, 'KIT No.07  ·  CUT  ·  FOLD  ·  GLUE', w / 2, h * 0.1, 8, '#fff', 'center', '"Space Mono"', 700);
    fitTxt(c, 'Build Your Own AI', w / 2, h * 0.6, 56, w * 0.9, PAL.ink);
    c.fillStyle = PAL.orange; c.fillRect(w * 0.2, h * 0.86, w * 0.6, 3);
    partNo(c, 'T1', 3, h - 4);
  };
  const pSheet = (c, w, h) => {
    c.fillStyle = '#f7f4ec'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(40,40,40,0.5)'; c.lineWidth = 0.6; c.setLineDash([2.5, 2]); c.strokeRect(6, 6, w - 12, h - 12); c.setLineDash([]);
    txt(c, 'PART C · CUBE', 10, 12, 6, 'rgba(40,40,40,0.75)', 'left', '"Space Mono"', 700);
    txt(c, '✂', w - 14, h - 12, 9, 'rgba(40,40,40,0.6)', 'center', 'sans-serif', 400);
    // the cube net has been cut out of this sheet: the mat shows through the hole
    const hx = w * 0.5 - 30, hy = h * 0.5 - 90, cs = 60;
    const hole = () => { c.beginPath(); c.rect(hx, hy, cs, cs * 3); c.rect(hx - cs, hy + cs, cs, cs); c.rect(hx + cs, hy + cs, cs, cs); c.rect(hx, hy + cs * 3, cs, cs * 0.8); };
    c.save(); hole(); c.clip(); c.fillStyle = '#2b684b'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(205,230,170,0.35)'; c.lineWidth = 1; for (let x = 0; x < w; x += 10) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y < h; y += 10) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 3; hole(); c.stroke(); c.restore();
    c.strokeStyle = 'rgba(40,40,40,0.55)'; c.lineWidth = 0.7; hole(); c.stroke();
  };
  const pCubeF = (s) => (c, w, h) => { c.fillStyle = PAL.yellow; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(120,70,0,0.35)'; c.lineWidth = 1; c.strokeRect(4, 4, w - 8, h - 8); if (s) txt(c, s, w / 2, h / 2 + 2, 34, PAL.ink); };
  const pBar = (col) => (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(4, 4, w - 8, 3); };
  const pBase = (c, w, h) => { c.fillStyle = PAL.card; c.fillRect(0, 0, w, h); c.strokeStyle = PAL.ink; c.lineWidth = 1.2; c.beginPath(); c.moveTo(5, h - 8); c.lineTo(w - 5, h - 8); c.stroke(); };


  // ================= explainer: "How does AI learn?" on one long cutting mat =================
  // shared timing (explainerSound reads the same table)
  const XT = {
    qFold: [0.2, 0.85], slide1: [1.6, 2.6],
    body: [2.45, 3.25], head: [2.75, 3.45], hop: [3.5, 3.85], parts: [3.85, 4.2],
    catDrop: 2.75, dogDrop: 2.95, catTag: 3.25, dogTag: 3.45, DROP: 0.25,
    arrow1: [3.6, 4.2], ctr: [3.95, 4.35], count: [4.35, 5.75], cards0: 4.25, cardGap: 0.19, cardDur: 0.95, nCards: 9,
    slide2: [6.0, 6.8], ctrDown: [6.05, 6.4], ctrAway: [6.45, 6.95], newCard: 6.5, look: 6.85,
    guessArrow: [7.0, 7.35], guessTag: 7.3, ans: [7.45, 7.8],
    xPop: [7.95, 8.2], checkTag: 8.3, push: [7.85, 8.3],
    adjArrow: [8.5, 9.0], adjTag: 8.95, token: [8.6, 9.05], dials: [9.0, 9.5], spin: [9.55, 9.95],
    slide3: [10.35, 10.95], acc: [10.85, 11.2], bar0: 11.05, barGap: 0.24, barDur: 0.4, hit: 12.6, star: [12.6, 12.85],
    banner: [13.05, 13.55],
  };
  XT.ACCS = [61, 72, 81, 88, 93, 97];
  const ROBOT = { x: 68, z: 6, yaw: 0.25 };
  const rLocal = (lx, lz) => { const c = Math.cos(ROBOT.yaw), s = Math.sin(ROBOT.yaw); return [ROBOT.x + lx * c + lz * s, ROBOT.z - lx * s + lz * c]; };
  const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const pQuestion = (c, w, h) => {
    c.fillStyle = PAL.card; c.fillRect(0, 0, w, h);
    c.fillStyle = PAL.blue; c.fillRect(0, 0, w, 18);
    txt(c, 'LESSON 1  ·  FOLD ON DOTTED LINE', w / 2, 9, 8, '#fff', 'center', '"Space Mono"', 700);
    fitTxt(c, 'How does', w / 2, 56, 50, w * 0.9, PAL.ink);
    c.font = '700 54px "Fredoka"'; const wa = c.measureText('AI ').width, wl = c.measureText('learn?').width, x0 = w / 2 - (wa + wl) / 2;
    txt(c, 'AI', x0, 108, 54, PAL.orange, 'left'); txt(c, 'learn?', x0 + wa, 108, 54, PAL.ink, 'left');
    partNo(c, 'Q1', 3, h - 4);
  };
  const pCounter = (v) => (c, w, h) => {
    c.fillStyle = PAL.card; c.fillRect(0, 0, w, h);
    c.fillStyle = PAL.yellow; c.fillRect(0, 0, w, 17);
    txt(c, 'TRAINING DATA', w / 2, 8.5, 9, PAL.ink, 'center', '"Space Mono"', 700);
    fitTxt(c, fmt(v), w / 2, 56, 58, w * 0.92, PAL.ink);
    txt(c, 'examples', w / 2, 98, 25, PAL.blue, 'center', '"Fredoka"', 600);
  };
  const pAnswer = (c, w, h) => { c.fillStyle = PAL.card; c.fillRect(0, 0, w, h); c.fillStyle = PAL.blue; c.fillRect(0, 0, w, 16); txt(c, 'ANSWER', w / 2, 8, 8, '#fff', 'center', '"Space Mono"', 700); txt(c, 'dog?', w / 2, 60, 52, PAL.ink); };
  const pAnswerB = (c, w, h) => { c.fillStyle = PAL.card; c.fillRect(0, 0, w, h); c.fillStyle = PAL.green; c.fillRect(0, 0, w, 16); txt(c, 'ANSWER', w / 2, 8, 8, '#fff', 'center', '"Space Mono"', 700); txt(c, 'cat', w / 2 - 14, 60, 54, PAL.green); tickMark(c, w / 2 + 50, 58, 30, PAL.green); };
  const pFlagX = (c, w, h) => { c.fillStyle = PAL.red; c.fillRect(0, 0, w, h); crossMark(c, w / 2, h / 2, h * 0.62, '#fff'); };
  const pFlagV = (c, w, h) => { c.fillStyle = PAL.green; c.fillRect(0, 0, w, h); tickMark(c, w / 2, h / 2 + 2, h * 0.62, '#fff'); };
  const pNewCard = (c, w, h) => {
    c.fillStyle = PAL.card; c.fillRect(0, 0, w, h);
    c.fillStyle = '#bcd9ee'; rr(c, 5, 5, w - 10, h - 24, 3); c.fill();
    catIcon(c, w / 2, (h - 24) / 2 + 7, h * 0.62);
    c.fillStyle = PAL.red; rr(c, w - 34, 2, 32, 15, 4); c.fill(); txt(c, 'new', w - 18, 9.5, 11, '#fff');
    txt(c, '?', w / 2, h - 10, 15, PAL.ink);
  };
  const pAcc = (v, done) => (c, w, h) => {
    c.fillStyle = PAL.card; c.fillRect(0, 0, w, h);
    c.fillStyle = done ? PAL.green : PAL.blue; c.fillRect(0, 0, w, 17);
    txt(c, 'MODEL SCORE', w / 2, 8.5, 9, '#fff', 'center', '"Space Mono"', 700);
    txt(c, 'Accuracy', w / 2, 37, 26, PAL.ink, 'center', '"Fredoka"', 600);
    txt(c, Math.round(v) + '%', w / 2, 92, 66, done ? PAL.green : PAL.ink);
  };
  const pRounds = (c, w, h) => { c.fillStyle = PAL.card; c.fillRect(0, 0, w, h); c.fillStyle = PAL.orange; c.fillRect(0, h - 6, w, 6); txt(c, 'training rounds  →', w / 2, h * 0.45, 24, PAL.ink, 'center', '"Fredoka"', 600); };
  const pBanner = (c, w, h) => {
    c.fillStyle = PAL.card; c.fillRect(0, 0, w, h);
    c.fillStyle = PAL.orange; c.fillRect(0, 0, w, 14); c.fillRect(0, h - 8, w, 8);
    c.font = '700 50px "Fredoka"';
    const k = Math.min(1, (w * 0.92) / (c.measureText('More examples').width + c.measureText('better guesses').width + 72)), fs = 50 * k;
    c.font = `700 ${fs}px "Fredoka"`;
    const a = c.measureText('More examples').width, b = c.measureText('better guesses').width, gap = 72 * k, x0 = w / 2 - (a + b + gap) / 2, y = h * 0.53;
    txt(c, 'More examples', x0, y, fs, PAL.ink, 'left'); txt(c, 'better guesses', x0 + a + gap, y, fs, PAL.blue, 'left');
    c.fillStyle = PAL.orange; c.beginPath(); const ax = x0 + a + 10 * k, u = k;
    c.moveTo(ax, y - 4.5 * u); c.lineTo(ax + 36 * u, y - 4.5 * u); c.lineTo(ax + 36 * u, y - 12 * u); c.lineTo(ax + 54 * u, y); c.lineTo(ax + 36 * u, y + 12 * u); c.lineTo(ax + 36 * u, y + 4.5 * u); c.lineTo(ax, y + 4.5 * u); c.fill();
  };
  const pStripPrint = (col) => (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 1; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke(); c.setLineDash([]); };
  const drop = (q, t0, h = 14) => { const u = win(q, t0, t0 + XT.DROP); return q < t0 ? null : h * (1 - u * u); };
  const ARROW1 = bez([29, -9], [42, -15], [57, -7], rLocal(0, -5.6));
  const CARDPATH = bez([29, -9], [42, -15], [57, -7], rLocal(0, -5.6)).concat([rLocal(0, -1)]);
  const GUESS = bez(rLocal(10.5, -2), [85, -5], [89, -4], [92.5, -2.5]);
  const ADJ = bez([110, -13], [98, -19], [81, -17], rLocal(5, -7.5));

  const explainScene = (t) => {
    const q = TQ(t), F = [];
    // beat 1: the question, a flat template that folds up into a tent card
    F.push(...place(tent({ w: 40, h: 15, a: eio(win(q, ...XT.qFold)), pf: pQuestion, pb: pPlainBack(PAL.card) }), 10, q, -6, 0, 0, 0));
    F.push(...xf(ruler(46), [-10, 0, -16], 0.06));
    F.push(...xf(glueStick(), [-33, 0, 22], 0));
    F.push(...xf(knife(), [16, 0, 24], -0.5));
    // beat 2: the robot template folds itself up, examples are set down with tags
    const fBody = eio(win(q, ...XT.body)), fHead = eio(win(q, ...XT.head)), hop = eio(win(q, ...XT.hop)), parts = win(q, ...XT.parts);
    const look = q < XT.look ? 0 : q < XT.ans[0] ? -0.9 : q < XT.spin[0] ? 0.8 : 0;
    const headYaw = q < XT.look ? 0 : q < XT.ans[0] ? 0.35 : q < XT.spin[1] ? -0.25 : 0;
    const dial = eio(win(q, ...XT.dials));
    const wob = q > XT.dials[0] && q < XT.dials[1] ? Math.sin(q * 40) * 0.06 : 0;
    F.push(...place(robot({ fBody, fHead, hop, parts, headX: 18, dial, look, headYaw: headYaw + wob }), 11, q, ROBOT.x, 0, ROBOT.z, ROBOT.yaw));
    const yc = drop(q, XT.catDrop), yd = drop(q, XT.dogDrop);
    if (yc != null) F.push(...place(cat({ headYaw: -0.2 }), 12, q, 21, yc, -1, -0.45));
    if (yd != null) F.push(...place(dog({ headYaw: 0.25 }), 13, q, 29, yd, 10, -0.4));
    const yct = drop(q, XT.catTag, 10), ydt = drop(q, XT.dogTag, 10);
    if (yct != null) F.push(...place(tent({ w: 11, h: 6, pf: pTag('cat', PAL.orange, 34) }), 14, q, 22.5, yct, -10.5, 0.05));
    if (ydt != null) F.push(...place(tent({ w: 11, h: 6, pf: pTag('dog', PAL.blue, 34) }), 15, q, 37, ydt, 1, -0.05));
    F.push(...strip(ARROW1, eio(win(q, ...XT.arrow1)), { col: PAL.yellow, print: pStripPrint(PAL.yellow), w: 2.6 }));
    const cv = q < XT.count[0] ? 0 : (Math.pow(10, win(q, ...XT.count) * 6) - 1) / (1e6 - 1) * 1e6;
    if (q >= XT.ctr[0]) F.push(...place(tent({ w: 28, h: 12.5, a: eio(win(q, ...XT.ctr)) * (1 - eio(win(q, ...XT.ctrDown))), pf: pCounter(win(q, ...XT.count) >= 1 ? 1e6 : cv) }), 16, q, 44 - 34 * eio(win(q, ...XT.ctrAway)), 0, 26, 0));
    { // example cards sliding along the arrow into the DATA IN slot
      const L = pathLen(resample(CARDPATH));
      for (let k = 0; k < XT.nCards; k++) {
        const u = win(q, XT.cards0 + k * XT.cardGap, XT.cards0 + k * XT.cardGap + XT.cardDur);
        if (u <= 0 || u >= 1) continue;
        const [x, z] = pathAt(resample(CARDPATH), L * u), kind = k % 3 === 1 ? 'dog' : 'cat';
        F.push(...xf(flat(5.4, 4.1, PAL.card, pCardFace(kind), 0.35).map((f) => Object.assign(f, { bias: -60 })), [x, 0, z], 0.08 * Math.sin(k * 2.1)));
      }
    }
    // beat 3: guess -> check -> adjust around the robot
    const yn = drop(q, XT.newCard, 12);
    if (yn != null) F.push(...place(tent({ w: 10, h: 8.5, ang: 1.25, pf: pNewCard }), 17, q, 61, yn, -12, 0.3));
    F.push(...strip(GUESS, eio(win(q, ...XT.guessArrow)), { col: PAL.blue, print: pStripPrint(PAL.blue), w: 2.2, head: 2.8 }));
    const ygt = drop(q, XT.guessTag, 10);
    if (ygt != null) F.push(...place(tent({ w: 12, h: 6, pf: pTag('Guess', PAL.blue, 32) }), 18, q, 85, ygt, 8, 0));
    const spin = PI * eio(win(q, ...XT.spin));
    if (q >= XT.ans[0]) F.push(...place(tent({ w: 18, h: 10, a: eio(win(q, ...XT.ans)), pf: pAnswer, pb: pAnswerB }), 19, q, 101.5, 0, 0, spin));
    if (q >= XT.xPop[0]) {
      const s = eback(win(q, ...XT.xPop)) * (1 + (q < XT.xPop[1] + 0.25 ? 0.06 * Math.sin((q - XT.xPop[0]) * 30) : 0));
      F.push(...place(flag({ pole: 13, fw: 8, fh: 6, col: PAL.red, col2: PAL.green, pf: pFlagX, pb: pFlagV, spin: spin, baseCol: PAL.yellow }), 20, q, 114, 0, 7, 0.15, Math.max(0.05, s), 0.06));
    }
    const yck = drop(q, XT.checkTag, 10);
    if (yck != null) F.push(...place(tent({ w: 12, h: 6, pf: pTag('Check', PAL.red, 32) }), 21, q, 116, yck, -4, -0.1));
    F.push(...strip(ADJ, eio(win(q, ...XT.adjArrow)), { col: PAL.red, print: pStripPrint(PAL.red), w: 2.2, head: 2.8 }));
    const yat = drop(q, XT.adjTag, 10);
    if (yat != null) F.push(...place(tent({ w: 13, h: 6, pf: pTag('Adjust', PAL.red, 32) }), 22, q, 91, yat, -12.5, 0.02));
    if (q > XT.token[0] && q < XT.token[1] + 0.05) { // error signal: a little red paper chevron riding back along the strip
      const P = resample(ADJ), u = win(q, ...XT.token), [x, z, tx, tz] = pathAt(P, pathLen(P) * u);
      F.push(...xf(star(1.8, 0.8, 0.9, PAL.red, '#f06a5a'), [x, 2.2, z], Math.atan2(-tz, tx) * 0));
    }
    F.push(...xf(glueStick(), [141, 0, 30], 0.4));
    F.push(...xf(knife(), [128, 0, -9], 0.35));
    [[138, 6, 0.5, 'dog'], [142, 11, -0.3, 'cat'], [136, 12, 0.1, 'cat']].forEach(([x, z, a, kd], i) => F.push(...xf(flat(5.5, 4.2, PAL.card, pCardFace(kd), 0.06 + i * 0.03), [x, 0, z], a)));
    // beat 4: bars fold up one by one; the score card counts
    let accV = XT.ACCS[0];
    XT.ACCS.forEach((a, i) => {
      const t0 = XT.bar0 + i * XT.barGap, f = eio(win(q, t0, t0 + XT.barDur));
      if (q < t0) return;
      const hh = 3 + ((a - 55) / 42) * 17, col = [PAL.orange, PAL.yellow, PAL.blue, PAL.teal, PAL.ginger, PAL.green][i];
      F.push(...place(box({ w: 4.6, d: 4.6, h: hh, f, col, pr: { front: pBar(col) } }), 30 + i, q, 153 + i * 6.2, 0, 11, 0, 1, 0.03));
      if (f > 0.5) accV = Math.max(accV, lerp(i ? XT.ACCS[i - 1] : 55, a, win(f, 0.5, 1)));
    });
    if (q >= XT.bar0 - 0.3) F.push(...place(flat(40, 13, PAL.card, pBase), 29, 0, 168.5, 0, 11, 0, 1, 0));
    if (q >= XT.acc[0] - 0.05) F.push(...place(tent({ w: 30, h: 7, ang: 1.2, a: eio(win(q, XT.acc[0], XT.acc[1])), pf: pRounds }), 28, q, 168.5, 0, 0, 0));
    const done = q >= XT.hit;
    if (q >= XT.acc[0]) F.push(...place(tent({ w: 22, h: 14, a: eio(win(q, ...XT.acc)), pf: pAcc(done ? 97 : accV, done) }), 27, q, 198, 0, 4, -0.12));
    if (q >= XT.star[0]) { const s = eback(win(q, ...XT.star)); F.push(...xf(star(6.5, 2.8, 2.2, PAL.yellow, '#f7c95a'), [207, 15.5, 9], 0.0, Math.max(0.05, s))); }
    // beat 5: the takeaway banner folds up in front
    if (q >= XT.banner[0] - 0.1) F.push(...place(tent({ w: 70, h: 11, a: eio(win(q, ...XT.banner)), pf: pBanner }), 40, q, 174, 0, -14, 0));
    return F;
  };
  const EXCAM = [[0, -6, 3, 56, 0.5, 3], [1.6, -4, 3, 54, 0.5, 3], [2.6, 46, 8, 66, 0.55, 5], [5.95, 48, 8, 64, 0.55, 5], [6.8, 91, 5, 70, 0.6, 5], [7.85, 92, 5, 68, 0.6, 5],
    [8.2, 103, 1, 46, 0.55, 5], [8.4, 103, 1, 46, 0.55, 5], [8.85, 91, 5, 70, 0.6, 5], [10.35, 90, 5, 69, 0.6, 5], [10.95, 179, 9, 57, 0.63, 4], [12.45, 180, 9, 56, 0.63, 4],
    [12.8, 194, 5, 52, 0.58, 6], [13.0, 194, 5, 52, 0.58, 6], [13.6, 175, -4, 80, 0.6, 5], [15, 175, -5, 77, 0.6, 5]];

  registerStyle({
    id: 'papercraft',
    name: 'Papercraft Models',
    category: 'Popular Explainer Looks',
    description: 'Printed-cardstock kit models: boxy low-poly robots, cats and charts assembled from flat printed faces with dotted fold lines, glue tabs and hairline seam gaps, Lambert-lit by a warm key light on a green self-healing cutting mat with craft tools at the edges.',
    motion: 'Flat printed templates fold themselves up into 3D models on twos with a stop-motion jitter, pieces hop into place and tags fold into tents, while the camera slides smoothly across the mat.',
    fonts: ['700 40px "Fredoka"', '600 40px "Fredoka"', '700 20px "Space Mono"', '700 20px "Space Grotesk"'],
    frameT: 5.8,
    duration: 6,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const c = camAt([[0, -8, 10, 86, 0.56], [6, 0, 7, 80, 0.58]], t);
      const cam = makeCam(c[0], c[1], c[2], c[3], W, H_);
      renderScene(ctx, W, H_, cam, heroScene(t), t);
    },
    explainerDuration: 15,
    explainerNote: 'One long cutting mat: the camera slides from beat to beat while flat printed templates fold themselves up into the robot, cards, bars and tent labels (on twos); arrows are creased paper strips that unroll along the mat, labels are tent tags dropped onto what they name, counters are printed tent cards re-posed each step, and the wrong guess gets a camera push-in and a red flag that pops and later spins to green.',
    explainer(ctx, W, H_, t) {
      const c = camAt(EXCAM, t);
      const cam = makeCam(c[0], c[1], c[2], c[3], W, H_, c[4]);
      renderScene(ctx, W, H_, cam, explainScene(t), t);
    },
    // Sound: cardstock handling on a cutting mat. Every visual change lands on the 12 fps stop-motion grid, so cue
    // times are snapped up to that grid (S). Times come from XT / EXCAM above, the same tables explainer() uses.
    explainerSound(k) {
      const S = (x) => Math.ceil(x * 12 - 1e-6) / 12;
      const inv = (f) => { let a = 0, b = 1; for (let i = 0; i < 30; i++) { const m = (a + b) / 2; if (eio(m) < f) a = m; else b = m; } return b; }; // eased progress -> linear
      const camX = (t) => { const c = camAt(EXCAM, t); return [c[0], c[2]]; };
      const pan = (x, t) => { const [cx, D] = camX(t); return clamp((x - cx) / (D * 0.75), -1, 1) * 0.6; };
      // a crisp crease: the card gives (dry fibre tick), then the fold is pressed flat with a fingertip
      const crease = (t, g = 1, p = 0, minor = true) => {
        k.noise(t - 0.012, { dur: 0.014, filter: 'bandpass', f: 2600, q: 1.4, gain: 0.22 * g, a: 0.001, pan: p, minor });
        k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1500, q: 1.1, gain: 0.5 * g, a: 0.001, pan: p, minor });
        k.noise(t + 0.004, { dur: 0.06, color: 'brown', filter: 'lowpass', f: 480, gain: 0.38 * g, a: 0.002, pan: p, minor });
      };
      // a stiff card bending through its fold: a low airy sweep with a few fibre crackles
      const bend = (t0, t1, g = 1, p = 0) => {
        const d = t1 - t0;
        k.noise(t0, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 450], [d, 1100]], q: 0.7, gain: 0.08 * g, a: d * 0.5, pan: p, minor: true });
        for (let i = 1; i <= 3; i++) k.noise(t0 + d * (i / 4), { dur: 0.012, filter: 'bandpass', f: 2000 + i * 300, q: 1.5, gain: 0.08 * g, a: 0.001, pan: p, minor: true });
      };
      // a glue tab pressed home: soft tacky press
      const tab = (t, g = 1, p = 0) => {
        k.noise(t, { dur: 0.09, color: 'brown', filter: 'lowpass', f: 380, gain: 0.32 * g, a: 0.006, pan: p, minor: true });
        k.noise(t + 0.02, { dur: 0.05, filter: 'bandpass', f: 900, q: 2, gain: 0.07 * g, a: 0.01, pan: p, minor: true });
      };
      // a model set down on the mat: soft tap on the vinyl
      const tap = (t, g = 1, p = 0, minor = true) => {
        k.noise(t, { dur: 0.045, color: 'brown', filter: 'lowpass', f: 650, gain: 0.4 * g, a: 0.001, pan: p, minor });
        k.noise(t, { dur: 0.018, filter: 'bandpass', f: 1100, q: 1, gain: 0.12 * g, a: 0.001, pan: p, minor });
      };
      // card scraping across the mat
      const scrape = (t, d, g = 1, p = 0) => k.noise(t, { dur: d, filter: 'bandpass', f: [[0, 1100], [d, 1500]], q: 0.8, gain: 0.07 * g, a: d * 0.3, hold: d * 0.3, pan: p, minor: true });
      // the camera sliding across the mat: a smooth low air move, no rustle
      const glide = (t, d, g = 1) => k.noise(t, { dur: d, color: 'brown', filter: 'lowpass', f: [[0, 200], [d * 0.5, 380], [d, 200]], gain: 0.1 * g, a: d * 0.5 });
      const snip = (t, g = 1, p = 0) => { // craft-knife / scissor snip for small parts
        k.noise(t, { dur: 0.012, filter: 'highpass', f: 3200, gain: 0.2 * g, a: 0.001, pan: p, minor: true });
        k.noise(t + 0.006, { dur: 0.03, filter: 'bandpass', f: 1900, q: 3, gain: 0.12 * g, a: 0.001, pan: p, minor: true });
      };
      const flick = (t, g = 1, p = 0) => { // a printed number card flicked over
        k.noise(t, { dur: 0.02, filter: 'bandpass', f: 1700, q: 1.6, gain: 0.24 * g, a: 0.001, pan: p, minor: true });
        k.tone(t, { f: 210, dur: 0.03, gain: 0.04 * g, pan: p, minor: true });
      };
      // a whole box folding up from its net (fold progress f(t) = eio(win(t, a, b)))
      const boxFold = (a, b, x, g = 1, tabs = true) => {
        const at = (f) => S(a + (b - a) * inv(f));
        bend(S(a), at(0.62), 0.9 * g, pan(x, a));
        [0.62, 0.71, 0.8, 0.89].forEach((f, i) => crease(at(f), (0.7 + 0.1 * i) * g, pan(x, at(f))));
        if (tabs) tab(at(0.95), 0.9 * g, pan(x, b));
      };
      const tentFold = (a, b, x, g = 1, minor = true) => { bend(S(a), S(b), g, pan(x, a)); crease(S(b), g, pan(x, b), minor); };
      const stripRun = (path, a, b, x, g = 1) => { // strip arrow unrolling: a crease at each accordion fold as it extends
        const L = pathLen(resample(path));
        scrape(S(a), b - a, 0.9 * g, pan(x, a));
        let last = -1;
        for (let l = 3; l < L - 3; l += 3) { const tt = S(a + (b - a) * inv(l / L)); if (tt - last >= 1 / 12) { crease(tt, 0.32 * g, pan(x, tt)); last = tt; } }
        crease(S(b), 0.6 * g, pan(x, b));
      };
      const land = (t0, x, g = 1) => tap(S(t0 + XT.DROP), g, pan(x, t0 + XT.DROP));

      k.bed('room', 0, 15, { gain: 0.45 });

      // 1 HOOK: the template is smoothed flat, then folds up into the question card
      k.noise(0.0, { dur: 0.45, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.45, 800]], q: 0.6, gain: 0.09, a: 0.15, pan: -0.1, minor: true });
      tentFold(XT.qFold[0], XT.qFold[1], -6, 1.4, false);
      tap(S(XT.qFold[1]) + 0.02, 1.3, 0, false); // the question card's feet settle on the mat
      k.tone(S(XT.qFold[1]) + 0.03, { f: 'G3', type: 'triangle', dur: 0.3, gain: 0.1, filter: 'lowpass', f2: 900 });
      glide(XT.slide1[0], XT.slide1[1] - XT.slide1[0]);

      // 2 DATA: robot body and head fold up, examples are set down and tagged
      boxFold(XT.body[0], XT.body[1], ROBOT.x, 1.1);
      boxFold(XT.head[0], XT.head[1], ROBOT.x + 17, 0.8);
      land(XT.catDrop, 21, 0.9); land(XT.dogDrop, 29, 0.9);
      land(XT.catTag, 22, 0.6); land(XT.dogTag, 37, 0.6);
      k.noise(S(XT.hop[0]), { dur: XT.hop[1] - XT.hop[0], color: 'pink', filter: 'bandpass', f: [[0, 400], [0.18, 700], [0.35, 400]], q: 0.7, gain: 0.07, a: 0.15, pan: pan(ROBOT.x + 8, XT.hop[0]), minor: true });
      tap(S(XT.hop[1]), 1.1, pan(ROBOT.x, XT.hop[1]), false); tab(S(XT.hop[1]) + 0.05, 1, pan(ROBOT.x, XT.hop[1])); // head pressed onto the body
      snip(S(XT.parts[0]), 0.9, pan(ROBOT.x, 3.9)); snip(S(XT.parts[0]) + 0.09, 0.8, pan(ROBOT.x, 3.95)); tap(S(XT.parts[0] + 0.12), 0.5, pan(ROBOT.x, 4));
      stripRun(ARROW1, XT.arrow1[0], XT.arrow1[1], 47);
      tentFold(XT.ctr[0], XT.ctr[1], 47, 0.9);
      { // counter: every printed number change is a card flick, thinning out toward the end
        let last = -1;
        for (let f = Math.ceil(XT.count[0] * 12) + 1; f < XT.count[1] * 12; f++) { const t = f / 12; if (t - last >= (t < 5.1 ? 1 / 12 : 1 / 6)) { flick(t, 0.8, pan(47, t)); last = t; } }
        crease(S(XT.count[1]), 0.9, pan(47, XT.count[1]), false); // 1,000,000 settles
      }
      for (let i = 0; i < XT.nCards; i++) { // cards slide along the strip and drop through the DATA IN slot
        const a = XT.cards0 + i * XT.cardGap, b = a + XT.cardDur;
        if (i % 2 === 0) scrape(S(a), XT.cardDur, 0.6, pan(40, a));
        k.noise(S(b), { dur: 0.05, color: 'brown', filter: 'lowpass', f: 520, gain: 0.22, a: 0.002, pan: pan(ROBOT.x, b), minor: true });
      }

      // 3 GUESS -> CHECK -> ADJUST
      glide(XT.slide2[0], XT.slide2[1] - XT.slide2[0]);
      bend(S(XT.ctrDown[0]), S(XT.ctrDown[1]), 0.6, pan(44, 6.2)); tap(S(XT.ctrDown[1]), 0.5, pan(44, 6.4)); // counter card laid flat
      scrape(S(XT.ctrAway[0]), XT.ctrAway[1] - XT.ctrAway[0], 1.1, -0.6); // ...and slid off to the side
      land(XT.newCard, 61, 0.8);
      k.noise(S(XT.look), { dur: 0.12, filter: 'bandpass', f: 800, q: 1.2, gain: 0.08, a: 0.04, pan: pan(ROBOT.x, XT.look), minor: true }); // head turns on its tab
      stripRun(GUESS, XT.guessArrow[0], XT.guessArrow[1], 86, 0.8);
      land(XT.guessTag, 85, 0.6);
      tentFold(XT.ans[0], XT.ans[1], 101, 1.1, false);
      glide(XT.push[0], XT.push[1] - XT.push[0], 1.2);
      // the wrong guess: the red flag is jabbed into its block with a firm desk thump
      const tX = S(XT.xPop[0] + 0.12);
      k.noise(S(XT.xPop[0]), { dur: 0.08, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.08, 1500]], q: 0.7, gain: 0.16, a: 0.03, pan: pan(114, 8) });
      k.play('thud', tX, { f: 110, gain: 0.85, pan: pan(114, tX) });
      k.play('slap', tX + 0.01, { gain: 0.35, pan: pan(114, tX) });
      k.tone(tX + 0.03, { f: 'D3', type: 'triangle', dur: 0.18, gain: 0.16, filter: 'lowpass', f2: 700 });
      k.tone(tX + 0.2, { f: 'A2', type: 'triangle', dur: 0.36, gain: 0.18, filter: 'lowpass', f2: 600 });
      land(XT.checkTag, 116, 0.6);
      stripRun(ADJ, XT.adjArrow[0], XT.adjArrow[1], 92, 0.9);
      land(XT.adjTag, 91, 0.6);
      scrape(S(XT.token[0]), XT.token[1] - XT.token[0], 1.4, pan(92, 8.8)); // the error chip sliding back along the strip
      for (let f = Math.ceil(XT.dials[0] * 12); f <= XT.dials[1] * 12; f++) { // paper dials turning on split pins
        const t = f / 12; k.noise(t, { dur: 0.018, filter: 'bandpass', f: 1300 + (f % 3) * 200, q: 2.2, gain: 0.22, a: 0.001, pan: pan(ROBOT.x, t), minor: true });
        k.tone(t, { f: 180, dur: 0.03, gain: 0.05, pan: pan(ROBOT.x, t), minor: true });
      }
      // answer card and flag spin round to the right answer
      k.noise(S(XT.spin[0]), { dur: 0.4, color: 'pink', filter: 'bandpass', f: [[0, 420], [0.2, 950], [0.4, 450]], q: 0.7, gain: 0.14, a: 0.18, pan: pan(106, 9.7) });
      crease(S(XT.spin[1]), 1.1, pan(103, 10), false);
      k.play('success', S(XT.spin[1]) + 0.01, { f: 'G5', gain: 0.22, pan: pan(103, 10) });

      // 4 PROGRESS: bars fold up one by one, the score card counts
      glide(XT.slide3[0], XT.slide3[1] - XT.slide3[0]);
      tap(S(XT.bar0 - 0.3), 0.7, pan(168, 10.8)); // chart base card laid down
      tentFold(XT.acc[0], XT.acc[1], 198, 0.9); tentFold(XT.acc[0], XT.acc[1], 168, 0.6);
      XT.ACCS.forEach((a, i) => { const t0 = XT.bar0 + i * XT.barGap; boxFold(t0, t0 + XT.barDur, 153 + i * 6.2, 0.55, false); });
      { // shown % changes -> card flicks (<= 12/s)
        let lastV = -1, lastT = -1;
        for (let f = Math.ceil(XT.acc[0] * 12); f < Math.round(XT.hit * 12); f++) {
          const q = f / 12; let v = XT.ACCS[0];
          XT.ACCS.forEach((a, i) => { const t0 = XT.bar0 + i * XT.barGap, ff = eio(win(q, t0, t0 + XT.barDur)); if (q >= t0 && ff > 0.5) v = Math.max(v, lerp(i ? XT.ACCS[i - 1] : 55, a, win(ff, 0.5, 1))); });
          v = Math.round(v); if (v !== lastV && q - lastT >= 1 / 12) { flick(q, 0.75, pan(198, q)); lastV = v; lastT = q; }
        }
      }
      // 97%: firm desk thump as the score turns green and the paper star springs open (biggest hit)
      const tH = S(XT.hit);
      glide(12.45, 0.4, 1.1);
      k.play('impact', tH, { gain: 1.25, pan: 0.15 });
      k.play('ding', tH + 0.01, { f: 'E5', gain: 0.55, pan: 0.25 });
      k.noise(tH, { dur: 0.16, color: 'pink', filter: 'bandpass', f: [[0, 800], [0.16, 2000]], q: 0.6, gain: 0.2, a: 0.02, pan: 0.35 });
      crease(S(XT.star[1]), 0.8, 0.35);

      // 5 TAKEAWAY: the banner folds up in front and the lesson resolves
      tentFold(XT.banner[0], XT.banner[1], 172, 1.4, false);
      tap(S(XT.banner[1]) + 0.02, 1.0, 0, false);
      ['C4', 'G4', 'E5'].forEach((f, i) => k.play('ding', S(XT.banner[1]) + 0.16 + i * 0.1, { f, gain: [0.38, 0.32, 0.44][i], pan: (i - 1) * 0.25 }));
    },
  });
}
