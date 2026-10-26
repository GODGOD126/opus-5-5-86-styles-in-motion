{
  const TAU = Math.PI * 2;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const rotY = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; };
  const rotX = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; };
  const rotZ = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; };

  const icosphere = (subdiv) => {
    const g = (1 + Math.sqrt(5)) / 2;
    const v = [[-1, g, 0], [1, g, 0], [-1, -g, 0], [1, -g, 0], [0, -1, g], [0, 1, g], [0, -1, -g], [0, 1, -g], [g, 0, -1], [g, 0, 1], [-g, 0, -1], [-g, 0, 1]].map(norm);
    let f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    for (let s = 0; s < subdiv; s++) {
      const cache = {}, nf = [];
      const mid = (a, b) => { const k = a < b ? a + '_' + b : b + '_' + a; if (cache[k] == null) { cache[k] = v.length; v.push(norm(mul(add(v[a], v[b]), 0.5))); } return cache[k]; };
      f.forEach(([a, b, c]) => { const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a); nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); });
      f = nf;
    }
    return { v, f };
  };

  const makeTex = (seed) => {
    const S = 256, cv = H.layer(S, S), x = cv.getContext('2d'), r = H.rng(seed);
    const img = x.createImageData(S, S), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const n = r(); const w = n > 0.5; d[i] = d[i + 1] = d[i + 2] = w ? 255 : 0; d[i + 3] = Math.abs(n - 0.5) * 34; }
    x.putImageData(img, 0, 0);
    x.lineCap = 'round';
    for (let n = 0; n < 260; n++) {
      const px = r() * S, py = r() * S, len = r.range(3, 14), a = r() * TAU;
      x.strokeStyle = r() < 0.6 ? `rgba(255,255,255,${r.range(0.06, 0.16)})` : `rgba(60,40,20,${r.range(0.04, 0.09)})`;
      x.lineWidth = r.range(0.4, 0.9);
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        x.beginPath(); x.moveTo(px + ox * S, py + oy * S); x.lineTo(px + ox * S + Math.cos(a) * len, py + oy * S + Math.sin(a) * len); x.stroke();
      }
    }
    return cv;
  };

  // =====================================================================
  // EXPLAINER: a long studio table the camera dollies along. Every prop is
  // folded paper; labels are printed on tent cards / arrows that fold up.
  // =====================================================================
  const OXC = {};
  const SG = (px) => `700 ${px}px "Space Grotesk"`;
  const ORANGE = [232, 135, 76], BROWN = [176, 122, 76], CREAM = [246, 242, 233], INK = '#23242a', RED = [214, 74, 58], GREEN = [92, 170, 104], MUS = [241, 182, 68], IND = [58, 82, 150], CORAL = [240, 138, 126], TEAL = [44, 160, 150];
  const EXPLAIN = (ctx, W, H_, t) => {
    const seg = (a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
    const pop = (a, d = 0.45) => { const u = H.clamp((t - a) / d); if (u <= 0) return 0; const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
    // ---- camera dolly along the table ----
    const cx = 8 * seg(1.9, 2.9) + 3.6 * seg(5.6, 6.3) + 7.0 * seg(10.1, 10.9);
    const zoom = seg(7.85, 8.3) * (1 - seg(9.1, 9.6)); // push in on the wrong guess
    const E = [cx + 0.3 + zoom * 1.2, 2.35 - zoom * 0.2, 7.7 - zoom * 1.3], TG = [cx + zoom * 1.2, 0.85 + zoom * 0.35, 0];
    const fwd = norm(sub(TG, E)), right = norm(cross(fwd, [0, 1, 0])), up = cross(right, fwd);
    const F = 1180, PCX = 640, PCY = 372;
    const proj = (p) => { const d = sub(p, E); const z = dot(d, fwd); return [PCX + (F * dot(d, right)) / z, PCY - (F * dot(d, up)) / z, z]; };
    const Lkey = norm([-0.55, 1.0, 0.55]), Lfill = norm([0.9, 0.25, 0.35]), Ls = mul(Lkey, -1);
    const faces = [];
    const face = (pts, col, extra = {}) => faces.push({ pts, col, ...extra });

    // ---- prop builders ----
    // tent card: folds up from flat (u 0..1); front face carries printed lettering
    const tent = (x, z, w, h, rot, u, paint, col = CREAM) => {
      if (u <= 0) return;
      const dz = 0.34, Lf = Math.hypot(h, dz), th = Math.atan2(h, dz) * Math.min(1, u);
      const T = (p) => add(rotY(p, rot), [x, 0, z]);
      const rid = [0, Lf * Math.sin(th), dz - Lf * Math.cos(th)];
      const BLf = [-w, 0.003, dz], BRf = [w, 0.003, dz], TR = [w, rid[1], rid[2]], TL = [-w, rid[1], rid[2]];
      const bz = rid[2] - dz * Math.min(1, u);
      face([TL, TR, [w, 0.003, bz], [-w, 0.003, bz]].map(T), col.map((v) => v * 0.97));
      face([BLf, BRf, TR, TL].map(T), col, { map: [T(TL), T(TR), T(BLf)], paint });
    };
    // flat folded arrow lying on the table (centre crease), grows with p; optional printed label
    const arrowFlat = (x0, z0, x1, z1, p, col, label) => {
      if (p <= 0) return;
      const ex = H.lerp(x0, x1, p), ez = H.lerp(z0, z1, p), a = Math.atan2(ez - z0, ex - x0);
      const len = Math.hypot(ex - x0, ez - z0), dx = Math.cos(a), dz = Math.sin(a), nx = -dz, nz2 = dx;
      const hw = 0.22, hl = Math.min(0.55, len * 0.5), y = 0.012, cr = 0.05;
      const P = (s, n, yy = y) => [x0 + dx * s + nx * n, yy, z0 + dz * s + nz2 * n];
      const sEnd = len - hl;
      const fr = nz2 > 0; // which half faces the camera carries the print
      const lab = label ? { map: fr ? [P(0, 0, y + cr), P(sEnd, 0, y + cr), P(0, hw)] : [P(sEnd, 0, y + cr), P(0, 0, y + cr), P(sEnd, -hw)], paint: label } : {};
      face([P(0, -hw), P(sEnd, -hw), P(sEnd, 0, y + cr), P(0, 0, y + cr)], col, fr ? {} : lab);
      face([P(0, 0, y + cr), P(sEnd, 0, y + cr), P(sEnd, hw), P(0, hw)], col.map((v) => v * 0.98), fr ? lab : {});
      face([P(sEnd, -hw * 2.2), P(len, 0, y + cr * 0.4), P(sEnd, 0, y + cr * 1.6)], col);
      face([P(sEnd, 0, y + cr * 1.6), P(len, 0, y + cr * 0.4), P(sEnd, hw * 2.2)], col);
    };
    // origami animal head (cat: pointed ears; dog: folded-down ears), standing on the table
    const animal = (kind, x, z, s, rot, hop = 0, extraLift = 0) => {
      const T = (p) => add(rotY(mul(p, s), rot), [x, 0.48 * s + hop + extraLift, z]);
      const cat = kind === 'cat', base = cat ? ORANGE : BROWN;
      const eyes = (c, w, h) => { c.fillStyle = '#2b2033'; c.beginPath(); c.arc(w * 0.62, h * 0.38, w * 0.07, 0, TAU); c.fill(); c.fillStyle = cat ? '#e0607a' : '#2b2033'; c.beginPath(); c.ellipse(w * 0.05, h * 0.62, w * 0.09, h * 0.06, 0, 0, TAU); c.fill(); };
      const eyesR = (c, w, h) => { c.fillStyle = '#2b2033'; c.beginPath(); c.arc(w * 0.38, h * 0.38, w * 0.07, 0, TAU); c.fill(); };
      if (cat) {
        face([[-0.5, 0.5, 0], [-0.12, 0.5, 0.02], [-0.44, 0.98, -0.06]].map(T), base.map((v) => v * 0.92));
        face([[0.5, 0.5, 0], [0.12, 0.5, 0.02], [0.44, 0.98, -0.06]].map(T), base.map((v) => v * 0.92));
        face([[-0.5, 0.5, 0], [0, 0.5, 0.12], [0, -0.48, 0.12], [-0.42, 0.1, 0]].map(T), base, { map: [T([0, 0.5, 0.12]), T([-0.5, 0.5, 0]), T([0, -0.48, 0.12])], paint: eyes });
        face([[0, 0.5, 0.12], [0.5, 0.5, 0], [0.42, 0.1, 0], [0, -0.48, 0.12]].map(T), base.map((v) => v * 1.02), { map: [T([0, 0.5, 0.12]), T([0.5, 0.5, 0]), T([0, -0.48, 0.12])], paint: eyesR });
      } else {
        face([[-0.42, 0.55, 0], [0, 0.55, 0.12], [0, -0.48, 0.12], [-0.42, -0.05, 0]].map(T), base, { map: [T([0, 0.55, 0.12]), T([-0.42, 0.55, 0]), T([0, -0.48, 0.12])], paint: eyes });
        face([[0, 0.55, 0.12], [0.42, 0.55, 0], [0.42, -0.05, 0], [0, -0.48, 0.12]].map(T), base.map((v) => v * 1.02), { map: [T([0, 0.55, 0.12]), T([0.42, 0.55, 0]), T([0, -0.48, 0.12])], paint: eyesR });
        face([[-0.42, 0.56, 0.04], [-0.16, 0.56, 0.08], [-0.6, -0.08, 0.14]].map(T), [110, 70, 44]);
        face([[0.42, 0.56, 0.04], [0.16, 0.56, 0.08], [0.6, -0.08, 0.14]].map(T), [110, 70, 44]);
      }
    };
    const brain = (x, z, s, refold) => {
      const ico = OXC.ico || (OXC.ico = icosphere(1));
      const nz = OXC.nz || (OXC.nz = H.makeNoise(41));
      [-1, 1].forEach((side) => {
        const vs = ico.v.map((u) => {
          const k = 1 + 0.12 * nz.n3(u[0] * 2.2 + side * 3 + refold, u[1] * 2.2, u[2] * 2.2);
          let p = [u[0] * 0.62 * k, u[1] * 0.78 * k, u[2] * 1.1 * k];
          if (u[0] * side < -0.15) p[0] *= 0.8;
          p[1] = Math.max(p[1], -0.55);
          p = rotY([p[0] + side * 0.62, p[1], p[2]], -1.18);
          return add(mul(p, s), [x, 0.6 * s, z]);
        });
        ico.f.forEach(([a, b, c]) => face([vs[a], vs[b], vs[c]], CORAL));
      });
    };
    const pinwheel = (x, z, s, ang, col) => {
      face([[x - 0.02, 0, z], [x + 0.02, 0, z], [x + 0.02, 1.2 * s, z], [x - 0.02, 1.2 * s, z]], [200, 190, 170]);
      const c = [x, 1.2 * s, z + 0.05];
      for (let i = 0; i < 4; i++) {
        const a = ang + (i * TAU) / 4, a2 = a + 0.9;
        face([c, add(c, [Math.cos(a) * 0.42 * s, Math.sin(a) * 0.42 * s, 0.02]), add(c, [Math.cos(a2) * 0.3 * s, Math.sin(a2) * 0.3 * s, 0.12])], i % 2 ? col : col.map((v) => v * 0.8));
      }
    };
    // standing speech bubble panel; flips about its vertical axis (phi); front/back print different words
    const bubble = (x, z, u, phi, front, back, shake = 0) => {
      if (u <= 0) return;
      const w = 1.0, h = 0.66 * Math.min(1, u), y0 = 0.55;
      const T = (p) => add(rotY(p, phi), [x + shake, 0, z]);
      const pts = [[-w, y0 + h * 0.2], [-w * 0.8, y0 - h * 0.05], [-0.5, y0 - h * 0.15], [-0.75, 0.02], [-0.2, y0 - h * 0.18], [w * 0.8, y0 - h * 0.1], [w, y0 + h * 0.4], [w * 0.85, y0 + h * 1.2], [-w * 0.85, y0 + h * 1.25]].map(([a, b]) => T([a, b, 0]));
      const seeBack = Math.cos(phi) < 0;
      const TL = T([-w * 0.85, y0 + h * 1.2, 0.002]), TR = T([w * 0.85, y0 + h * 1.2, 0.002]), BL = T([-w * 0.85, y0 - h * 0.05, 0.002]);
      const map = { map: seeBack ? [TR, TL, T([w * 0.85, y0 - h * 0.05, 0.002])] : [TL, TR, BL], paint: seeBack ? back : front };
      // the panel carries one diagonal crease: split the outline along it into two faces, ridge pushed forward a touch
      const P2 = [[-w, y0 + h * 0.2], [-w * 0.8, y0 - h * 0.05], [-0.5, y0 - h * 0.15], [-0.75, 0.02], [-0.2, y0 - h * 0.18], [w * 0.8, y0 - h * 0.1], [w, y0 + h * 0.4], [w * 0.85, y0 + h * 1.2], [-w * 0.85, y0 + h * 1.25]];
      const A0 = [0.38, y0 + h * 1.4], A1 = [-0.05, y0 - h * 0.4]; // crease line (top right-of-centre to bottom)
      const sd = (p) => (A1[0] - A0[0]) * (p[1] - A0[1]) - (A1[1] - A0[1]) * (p[0] - A0[0]);
      const halves = [[], []];
      P2.forEach((p, i) => {
        const q = P2[(i + 1) % P2.length], sp = sd(p), sq = sd(q);
        halves[sp >= 0 ? 0 : 1].push([p[0], p[1], 0]);
        if ((sp >= 0) !== (sq >= 0)) { const k = sp / (sp - sq), m = [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, 0.045]; halves[0].push(m); halves[1].push(m); }
      });
      void pts;
      halves.forEach((hp, i) => { if (hp.length >= 3) face(hp.map(T), CREAM.map((v) => v * (i ? 1.0 : 0.97)), map); });
    };
    const strip = (a, b, wdt, col) => { // a flat paper strip standing in the plane facing camera, slightly folded
      const d = sub(b, a), n = norm([-d[1], d[0], 0]), m = mul(add(a, b), 0.5);
      face([add(a, mul(n, wdt)), add(m, [n[0] * wdt, n[1] * wdt, 0.04]), add(m, [-n[0] * wdt, -n[1] * wdt, 0.04]), add(a, mul(n, -wdt))], col);
      face([add(m, [n[0] * wdt, n[1] * wdt, 0.04]), add(b, mul(n, wdt)), add(b, mul(n, -wdt)), add(m, [-n[0] * wdt, -n[1] * wdt, 0.04])], col.map((v) => v * 0.94));
    };
    const column = (x, z, hgt, col) => { // accordion-pleated paper column: 12 folds alternating out (mountain) / in (valley)
      const n = 12, r0 = 0.24;
      const ring = (y) => Array.from({ length: n }, (_, k) => { const a = ((k + 0.5) / n) * TAU, r = k % 2 ? r0 * 0.82 : r0; return [x + Math.cos(a) * r, y, z + Math.sin(a) * r]; });
      const A = ring(0.01), B = ring(hgt);
      for (let k = 0; k < n; k++) { const k2 = (k + 1) % n; face([A[k], A[k2], B[k2], B[k]], k % 2 ? col.map((v) => v * 0.92) : col); }
      // cap folded as a shallow fan with the centre raised
      const cc = [x, hgt + 0.035, z];
      for (let k = 0; k < n; k++) face([B[k], B[(k + 1) % n], cc], col.map((v) => Math.min(255, v * (k % 2 ? 1.0 : 1.06))));
    };
    const star = (x, y, z, s, spin) => {
      const c = [x, y, z], pts = [];
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * TAU, rr = (i % 2 ? 0.42 : 1) * s; pts.push(add(c, rotY([Math.cos(a) * rr, -Math.sin(a) * rr, 0], spin))); }
      const f1 = add(c, rotY([0, 0, 0.3 * s], spin)), f2 = add(c, rotY([0, 0, -0.3 * s], spin));
      for (let i = 0; i < 10; i++) { face([pts[i], pts[(i + 1) % 10], f1], i % 2 ? MUS : MUS.map((v) => v * 0.85)); face([pts[(i + 1) % 10], pts[i], f2], MUS.map((v) => v * 0.8)); }
    };
    const printer = (lines, opt = {}) => (c, w, h) => {
      c.fillStyle = opt.ink || INK; c.textAlign = 'center'; c.textBaseline = 'middle';
      lines.forEach(([txt, fr, yy, col]) => {
        let px = fr * h; c.font = SG(px); const mw = c.measureText(txt).width; if (mw > w * 0.9) { px *= (w * 0.9) / mw; c.font = SG(px); }
        c.fillStyle = col || opt.ink || INK; c.fillText(txt, w / 2, h * yy);
      });
    };

    // ================= scene =================
    // BEAT 1: the question printed on a big tent card that folds up
    tent(0, 1.2, 2.6, 1.55, 0, seg(0.1, 0.9), printer([['How does', 0.34, 0.3], ['AI learn?', 0.42, 0.7, '#e45a3e']]));
    animal('cat', -3.6, 0.2, 0.8, 0.3, 0, 0); animal('dog', 3.6, 0.2, 0.8, -0.3, 0, 0);

    // BEAT 2: labelled origami examples hop along into the paper brain
    const BXp = 10.6;
    brain(BXp, -0.2, 1.05, 2.4 * seg(8.85, 9.5));
    tent(BXp - 0.6, 1.5, 0.62, 0.36, 0.1, seg(2.8, 3.2), printer([['model', 0.6, 0.55, '#e45a3e']]));
    tent(6.0, -1.1, 2.3, 1.55, 0.05, seg(2.6, 3.0), (c, w, h) => {
      const n = Math.round(1e6 * Math.pow(H.clamp((t - 2.9) / 2.3), 2.2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      printer([[n, 0.42, 0.24], ['examples', 0.22, 0.55, '#3a8f86']])(c, w, h);
    });
    arrowFlat(4.4, 1.75, 9.1, 1.6, seg(2.7, 3.4), MUS);
    {
      const r = H.rng(55);
      for (let k = 0; k < 10; k++) {
        const s = 2.1 + k * 0.3, kind = r() < 0.5 ? 'cat' : 'dog';
        const x = 3.0 + (t - s) * 3.1;
        if (t < s || x > BXp - 0.9) continue;
        const hop = Math.abs(Math.sin((t - s) * 7)) * 0.18;
        const shrink = H.clamp((BXp - 0.9 - x) / 0.6);
        animal(kind, x, 0.35, 0.5 * shrink, 0.25, hop);
        tent(x, 0.95, 0.36, 0.24, 0.25, shrink, printer([[kind, 0.62, 0.55, kind === 'cat' ? '#e45a3e' : '#2f6f9a']]));
      }
    }

    // BEAT 3: guess -> check -> adjust (a loop of folded arrows)
    if (t > 5.5) {
      const nc = pop(6.25);
      if (nc > 0) { animal('cat', 8.2, 0.9, 0.62 * nc, 0.35); tent(8.2, 1.75, 0.55, 0.28, 0.3, seg(6.4, 6.7), printer([['new photo', 0.55, 0.55]])); }
      arrowFlat(8.7, 1.1, 9.5, 0.95, seg(6.6, 6.9), MUS);
      arrowFlat(11.8, 0.7, 13.0, 0.5, seg(6.95, 7.3), MUS);
      tent(12.45, 0.35, 0.5, 0.3, 0, seg(7.15, 7.4), printer([['Guess', 0.62, 0.55]]));
      // once the camera dollies on to the results, the guess bubble and its tick fold back down flat
      // (otherwise their remains sit clipped at the left frame edge)
      const away = 1 - seg(10.3, 10.85);
      const bu = pop(7.3, 0.4) * away, phi = Math.PI * seg(9.45, 9.85);
      const shake = t > 7.9 && t < 8.35 ? Math.sin(t * 55) * 0.05 * (8.35 - t) * 2.2 : 0;
      bubble(13.9, 0.1, bu, phi, printer([['dog?', 0.5, 0.5]]), printer([['cat', 0.5, 0.5, '#2f8a5a']]), shake);
      if (t > 7.85 && t < 9.45) { const xs = pop(7.85, 0.3); const c0 = [14.72, 1.47, 0.45]; /* crosses the bubble's corner, clear of the '?' */ strip(add(c0, [-0.3 * xs, 0.3 * xs, 0]), add(c0, [0.3 * xs, -0.3 * xs, 0]), 0.07, RED); strip(add(c0, [-0.3 * xs, -0.3 * xs, 0.03]), add(c0, [0.3 * xs, 0.3 * xs, 0.03]), 0.07, RED); }
      tent(13.9, 1.3, 0.6, 0.34, -0.1, t < 9.45 ? seg(8.0, 8.3) : 0, printer([['Check', 0.6, 0.55, '#d4473a']]));
      if (t < 9.45) { arrowFlat(13.2, 1.75, 11.4, 1.55, seg(8.3, 8.75), RED); tent(12.3, 1.95, 0.55, 0.3, 0, seg(8.6, 8.85), printer([['Adjust', 0.62, 0.55, '#d4473a']])); }
      const vs = pop(9.9, 0.35) * away;
      if (vs > 0) { const c0 = [14.55, 1.35, 0.45]; strip(add(c0, [-0.32 * vs, 0.02, 0]), add(c0, [-0.08 * vs, -0.24 * vs, 0]), 0.07, GREEN); strip(add(c0, [-0.08 * vs, -0.24 * vs, 0.02]), add(c0, [0.42 * vs, 0.36 * vs, 0.02]), 0.07, GREEN); }
    }
    // weights: pinwheels by the brain spin when the error comes back
    {
      const spin = t < 8.85 ? 0 : (t - 8.85) * 9 * (1 - seg(9.4, 9.9)) + 4.5 * seg(9.4, 9.9);
      pinwheel(BXp + 1.1, -1.3, 1.0, 0.3 + spin, TEAL);
      pinwheel(BXp + 1.8, -0.9, 0.8, 1.1 - spin * 1.3, MUS);
      pinwheel(BXp + 0.3, -1.7, 0.9, 0.7 + spin * 0.8, IND);
    }

    // BEAT 4: progress — pleated paper columns rise, accuracy counts up
    const accs = [61, 72, 80, 86, 90, 93, 95, 97];
    let shown = 61;
    accs.forEach((a, i) => {
      const st = 10.55 + i * 0.25, u = H.clamp((t - st) / 0.3);
      if (u <= 0) return;
      column(15.4 + i * 0.62, 0.2, (a / 100) * 2.25 * H.ease.out(u), i === 7 ? RED : i % 2 ? TEAL : MUS);
      shown = H.lerp(i ? accs[i - 1] : 61, a, u);
    });
    arrowFlat(15.2, 0.85, 20.6, 0.85, seg(10.6, 12.5), CREAM);
    tent(17.9, 1.55, 0.9, 0.26, 0, seg(10.8, 11.1), printer([['training rounds', 0.6, 0.55, '#6a6a70']]));
    tent(20.7, 0.9, 1.35, 1.1, -0.12, seg(10.5, 10.9), (c, w, h) => printer([['Accuracy', 0.26, 0.26, '#3a8f86'], [Math.round(shown) + '%', 0.55, 0.68, t > 12.6 ? '#e45a3e' : INK]])(c, w, h));
    const sp = pop(12.6, 0.5);
    if (sp > 0) star(15.4 + 7 * 0.62, 2.55 + 0.12 * Math.sin(t * 3), 0.2, 0.4 * sp, (t - 12.6) * 2.5);

    // BEAT 5: takeaway card folds up in front
    tent(18.2, 3.0, 2.0, 0.62, 0, seg(13.0, 13.55), (c, w, h) => {
      c.font = SG(100); const k = Math.min(h * 0.5, (100 * w * 0.86) / (c.measureText('More examples  better guesses').width + 60));
      c.textBaseline = 'middle'; c.font = SG(k); c.fillStyle = INK; c.textAlign = 'right'; c.fillText('More examples', w * 0.47, h * 0.5);
      c.fillStyle = '#e45a3e'; c.beginPath(); c.moveTo(w * 0.495, h * 0.42); c.lineTo(w * 0.535, h * 0.5); c.lineTo(w * 0.495, h * 0.58); c.fill(); c.fillRect(w * 0.48, h * 0.48, w * 0.03, h * 0.04);
      c.textAlign = 'left'; c.fillStyle = '#e45a3e'; c.fillText('better guesses', w * 0.55, h * 0.5);
    });

    // ================= render =================
    faces.forEach((f) => {
      const [a, b, c] = f.pts;
      let n = norm(cross(sub(b, a), sub(c, a)));
      const cen = mul(f.pts.reduce((s, p) => add(s, p), [0, 0, 0]), 1 / f.pts.length);
      if (dot(n, sub(E, cen)) < 0) n = mul(n, -1);
      const I = 0.36 + 0.7 * Math.max(0, dot(n, Lkey)) + 0.16 * Math.max(0, dot(n, Lfill)) + 0.1 * Math.max(0, -n[1]);
      f.rgb = f.col.map((ch, i) => Math.min(255, ch * I * [1.04, 1, 0.95][i]));
      f.I = I; f.n = n; f.cen = cen;
      f.sp = f.pts.map(proj); f.z = f.sp.reduce((s, p) => s + p[2], 0) / f.sp.length;
    });
    const vis = faces.filter((f) => f.sp.every((p) => p[2] > 0.5));
    // crease map (as in the still): shared edges between facets are valley (dark) or mountain (lit) folds
    {
      const ek = (p) => Math.round(p[0] * 1000) + ',' + Math.round(p[1] * 1000) + ',' + Math.round(p[2] * 1000);
      const edges = new Map();
      vis.forEach((f, fi) => f.pts.forEach((p, i) => {
        const q = f.pts[(i + 1) % f.pts.length], a = ek(p), b = ek(q), k = a < b ? a + '|' + b : b + '|' + a;
        const e = edges.get(k); if (e) e.push(fi); else edges.set(k, [fi]);
        (f.ek || (f.ek = []))[i] = k;
      }));
      vis.forEach((f, fi) => {
        f.ekind = f.ek.map((k) => {
          const fs = edges.get(k);
          if (!fs || fs.length !== 2) return 0;
          const g = vis[fs[0] === fi ? fs[1] : fs[0]];
          const d = dot(sub(g.cen, f.cen), f.n);
          return d > 0.004 ? -1 : d < -0.004 ? 1 : 0;
        });
      });
    }
    vis.sort((a, b) => b.z - a.z);
    // backdrop
    ctx.drawImage(OXC.bg || (OXC.bg = (() => {
      const C = H.layer(W, H_), c = C.getContext('2d');
      const bg = c.createLinearGradient(0, 0, 0, H_);
      bg.addColorStop(0, '#c9d3cf'); bg.addColorStop(0.45, '#dde3de'); bg.addColorStop(0.62, '#e6e6de'); bg.addColorStop(1, '#d8d5ca');
      c.fillStyle = bg; c.fillRect(0, 0, W, H_);
      const spot = c.createRadialGradient(560, 330, 40, 600, 380, 780); spot.addColorStop(0, 'rgba(255,252,240,0.6)'); spot.addColorStop(1, 'rgba(255,252,240,0)');
      c.fillStyle = spot; c.fillRect(0, 0, W, H_);
      c.globalAlpha = 0.6; c.fillStyle = c.createPattern(OXC.tex || (OXC.tex = makeTex(5)), 'repeat'); c.fillRect(0, 0, W, H_);
      return C;
    })()), 0, 0);
    // soft table shadows + contact occlusion, rendered into reduced-resolution masks (blur scaled to match),
    // then upscaled: the same look as full-res blur(12px) / blur(5px) at a fraction of the cost
    const lowL = (key, sc0) => { const w = Math.ceil(W * sc0), h = Math.ceil(H_ * sc0); let L = OXC[key]; if (!L || L.width !== w) { L = OXC[key] = H.layer(w, h); } const c = L.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h); c.setTransform(sc0, 0, 0, sc0, 0, 0); return [L, c]; };
    {
      const [SL, sc] = lowL('SLh', 0.5); sc.fillStyle = '#000';
      vis.forEach((f) => { if (f.pts.every((p) => p[1] < 0.02)) return; sc.beginPath(); f.pts.forEach((p, i) => { const s = proj(add(p, mul(Ls, p[1] / -Ls[1]))); i ? sc.lineTo(s[0], s[1]) : sc.moveTo(s[0], s[1]); }); sc.closePath(); sc.fill(); });
      // contact occlusion where paper meets the table (the still's CL pass): footprints of low facets, tight blur
      const [CL, cc] = lowL('CLh', 0.5); cc.fillStyle = '#000';
      vis.forEach((f) => {
        let mn = 1e9; f.pts.forEach((p) => { if (p[1] < mn) mn = p[1]; });
        if (mn > 0.22) return;
        cc.beginPath(); f.pts.forEach((p, i) => { const s = proj([p[0], 0, p[2]]); i ? cc.lineTo(s[0], s[1]) : cc.moveTo(s[0], s[1]); }); cc.closePath(); cc.fill();
      });
      // black-over-white stacking == multiplying the two shadow layers; one multiply onto the frame
      const w = SL.width, h = SL.height; let M = OXC.SM; if (!M || M.width !== w) M = OXC.SM = H.layer(w, h);
      const m = M.getContext('2d'); m.globalAlpha = 1; m.filter = 'none'; m.fillStyle = '#fff'; m.fillRect(0, 0, w, h);
      m.filter = 'blur(6px)'; m.globalAlpha = 0.38; m.drawImage(SL, 0, 0);
      m.filter = 'blur(2.5px)'; m.globalAlpha = 0.6; m.drawImage(CL, 0, 0);
      m.filter = 'none'; m.globalAlpha = 1;
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(M, 0, 0, W, H_); ctx.restore();
    }
    // facets: per-facet light gradient, lit edge, valley/mountain creases (same finish as the still)
    const OL = OXC.OL || (OXC.OL = H.layer(W, H_)), o = OL.getContext('2d');
    o.clearRect(0, 0, W, H_); o.lineJoin = 'round';
    const Lscr = [-0.6, -0.8];
    vis.forEach((f) => {
      const sp = f.sp;
      let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
      sp.forEach((p) => { if (p[0] < mnx) mnx = p[0]; if (p[0] > mxx) mxx = p[0]; if (p[1] < mny) mny = p[1]; if (p[1] > mxy) mxy = p[1]; });
      if (mxx < -20 || mnx > W + 20 || mxy < -20 || mny > H_ + 20) return;
      const gx = (mnx + mxx) / 2, gy = (mny + mxy) / 2, rr = Math.max(1, Math.max(mxx - mnx, mxy - mny) / 2);
      const g = o.createLinearGradient(gx + Lscr[0] * rr, gy + Lscr[1] * rr, gx - Lscr[0] * rr, gy - Lscr[1] * rr);
      g.addColorStop(0, H.rgba(f.rgb.map((v) => Math.min(255, v * 1.05)), 1)); g.addColorStop(1, H.rgba(f.rgb.map((v) => v * 0.94), 1));
      o.beginPath(); sp.forEach((p, i) => (i ? o.lineTo(p[0], p[1]) : o.moveTo(p[0], p[1]))); o.closePath();
      o.fillStyle = g; o.fill();
      o.strokeStyle = H.rgba(f.rgb, 1); o.lineWidth = 0.7; o.stroke();
      o.strokeStyle = `rgba(255,255,250,${0.05 + 0.08 * Math.min(1, f.I)})`; o.lineWidth = 0.6; o.stroke();
      for (const kind of [-1, 1]) { // valley folds dark, mountain folds lit; one stroke per kind per facet
        let any = false;
        sp.forEach((p, i) => { if (f.ekind[i] !== kind) return; if (!any) { o.beginPath(); any = true; } const q = sp[(i + 1) % sp.length]; o.moveTo(p[0], p[1]); o.lineTo(q[0], q[1]); });
        if (!any) continue;
        if (kind < 0) { o.strokeStyle = H.rgba(f.rgb.map((v) => v * 0.55), 0.55); o.lineWidth = 0.9; }
        else { o.strokeStyle = `rgba(255,250,242,${0.1 + 0.2 * H.clamp(f.I - 0.5)})`; o.lineWidth = 0.8; }
        o.stroke();
      }
      if (f.paint) {
        const [p0, p1, p3] = f.map.map(proj), cw = 400, ch = 400 * (Math.hypot(p3[0] - p0[0], p3[1] - p0[1]) / Math.max(1, Math.hypot(p1[0] - p0[0], p1[1] - p0[1])));
        if (ch > 2 && ch < 4000) {
          o.save(); o.beginPath(); sp.forEach((p, i) => (i ? o.lineTo(p[0], p[1]) : o.moveTo(p[0], p[1]))); o.closePath(); o.clip();
          o.setTransform((p1[0] - p0[0]) / cw, (p1[1] - p0[1]) / cw, (p3[0] - p0[0]) / ch, (p3[1] - p0[1]) / ch, p0[0], p0[1]);
          f.paint(o, cw, ch); o.restore();
        }
      }
    });
    o.save(); o.globalCompositeOperation = 'source-atop'; o.globalAlpha = 0.9; o.fillStyle = o.createPattern(OXC.tex, 'repeat'); o.fillRect(0, 0, W, H_); o.restore();
    ctx.drawImage(OL, 0, 0);
    // emphasis: key light flares on the moments that matter
    const flash = Math.max(Math.exp(-Math.pow((t - 7.95) * 5, 2)), Math.exp(-Math.pow((t - 12.65) * 5, 2)));
    if (flash > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,240,215,${flash * 0.18})`; ctx.fillRect(0, 0, W, H_); ctx.restore(); }
    H.vignette(ctx, W, H_, 0.28, '30,40,40');
    H.grain(ctx, W, H_, 0.022, 3 + Math.floor(t * 24));
  };

  registerStyle({
    id: 'origami',
    name: 'Origami Studio',
    category: 'Paper & Craft',
    description: 'Folded-paper models shot on a seamless studio sweep: every form is flat facets with consistent fold shading, crisp crease lines, two-tone paper and soft table shadows.',
    motion: 'Models unfold into place crease by crease, the paper crane-drone bobs on spinning paper rotors while the key light slowly orbits the table.',
    fonts: ['700 30px "Space Grotesk"', '400 15px "Space Mono"'],
    frameT: 4.8,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'The camera dollies along one long studio table: every prop folds up from flat paper, arrows are creased paper arrows lying on the table with the label printed on them, numbers are printed on tent cards that refold, and the wrong guess gets a camera push-in and a key-light flare.',
    explainer(ctx, W, H_, t) { EXPLAIN(ctx, W, H_, t); },
    // Sound: paper folding on a quiet studio table. Every tent card / prop that folds up gets a soft bend of the sheet
    // for exactly its seg() window and a crisp crease as it stands; arrows are folded sheets slid across the table;
    // hopping animals patter; pleated columns ripple up; the brain re-folds with a real crinkle; the pinwheels flutter.
    // Camera dollies are a barely-there low glide. Times mirror EXPLAIN() above (seg/pop windows, accs at 10.55+i*0.25).
    explainerSound(k) {
      const seg = (t, a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
      const camX = (t) => 8 * seg(t, 1.9, 2.9) + 3.6 * seg(t, 5.6, 6.3) + 7.0 * seg(t, 10.1, 10.9);
      const pan = (x, t) => H.clamp(((x - camX(t)) * 153) / 640, -1, 1) * 0.6;
      const POP = 1 - 1.5 / 2.5; // pop() (c1 = 1.5) first reaches full size at this fraction of its duration
      // the sheet bending up along its crease (smooth, a few fibre crackles), then the crease pressed
      const fold = (t0, t1, g = 1, p = 0, minor = true) => {
        const d = t1 - t0;
        k.noise(t0, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 520], [d, 1300]], q: 0.6, gain: 0.095 * g, a: d * 0.55, pan: p, minor: true });
        for (let i = 1; i <= 3; i++) k.noise(t0 + d * (0.25 + i * 0.17), { dur: 0.018, filter: 'bandpass', f: 1500 + i * 250, q: 1.2, gain: 0.07 * g, a: 0.001, pan: p, minor: true });
        crease(t1, g, p, minor);
      };
      const crease = (t, g = 1, p = 0, minor = true) => {
        k.noise(t, { dur: 0.028, filter: 'bandpass', f: 1700, q: 1.1, gain: 0.55 * g, a: 0.001, pan: p, minor });
        k.noise(t, { dur: 0.07, color: 'brown', filter: 'lowpass', f: 520, gain: 0.42 * g, a: 0.002, pan: p, minor });
      };
      // a folded sheet slid across the table
      const slideSheet = (t0, t1, g = 1, p = 0) => {
        const d = t1 - t0;
        k.noise(t0, { dur: d, filter: 'bandpass', f: [[0, 700], [d, 1000]], q: 0.7, gain: 0.08 * g, a: d * 0.4, hold: d * 0.3, pan: p, minor: true });
        crease(t1, 0.45 * g, p);
      };
      const tap = (t, g = 1, p = 0) => { // small paper foot touching the table
        k.noise(t, { dur: 0.03, color: 'brown', filter: 'lowpass', f: 700, gain: 0.3 * g, a: 0.001, pan: p, minor: true });
        k.noise(t, { dur: 0.015, filter: 'bandpass', f: 1300, q: 1, gain: 0.08 * g, a: 0.001, pan: p, minor: true });
      };
      const glide = (t, d) => k.noise(t, { dur: d, color: 'brown', filter: 'lowpass', f: [[0, 220], [d * 0.5, 420], [d, 220]], gain: 0.09, a: d * 0.5 }); // camera dolly
      const tick = (t, g, p) => { k.noise(t, { dur: 0.02, filter: 'bandpass', f: 1500, q: 1.6, gain: 0.26 * g, a: 0.001, pan: p, minor: true }); k.tone(t, { f: 240, dur: 0.03, gain: 0.05 * g, pan: p, minor: true }); };

      k.bed('room', 0, 15, { gain: 0.3 });
      k.music('pad', 0.3, 14.8, { bpm: 64, gain: 0.24, chords: [['C3', 'G3', 'B3', 'E4'], ['A2', 'E3', 'G3', 'C4'], ['F2', 'C3', 'E3', 'A3'], ['G2', 'D3', 'G3', 'B3']] });

      // BEAT 1: the question card folds up (0.1..0.9)
      fold(0.1, 0.9, 1.4, 0, false);

      // BEAT 2
      glide(1.9, 1.0);
      fold(2.6, 3.0, 1.1, pan(6.0, 2.9)); // counter card
      slideSheet(2.7, 3.4, 1, pan(7.5, 3.2)); // yellow arrow slides under the parade
      fold(2.8, 3.2, 0.7, pan(10.0, 3.1)); // 'model' card
      { // hopping animals: each lands every pi/7 s; patter throttled so it never gets busy
        const lands = [];
        for (let c = 0; c < 10; c++) {
          const s = 2.1 + c * 0.3, gone = s + (10.6 - 0.9 - 3.0) / 3.1;
          for (let t = s + Math.PI / 7; t < gone - 0.05; t += Math.PI / 7) { const x = 3.0 + (t - s) * 3.1; if (Math.abs(x - camX(t)) < 4.5) lands.push([t, x]); }
        }
        lands.sort((a, b) => a[0] - b[0]);
        let lastT = -1;
        for (const [t, x] of lands) if (t - lastT >= 0.26) { tap(t, 0.4, pan(x, t)); lastT = t; }
      }
      // counter 0 -> 1,000,000 (2.9..5.2): printed digits tick, quickening; the card settles at the end
      for (let t = 2.96; t < 5.16;) { const s = H.clamp((t - 2.9) / 2.3); tick(t, 0.6 + 0.3 * s, pan(6.0, t)); t += 0.15 - 0.055 * s; }
      crease(5.2, 1.2, pan(6.0, 5.2), false);
      k.tone(5.2, { f: 'G3', type: 'triangle', dur: 0.25, gain: 0.12, filter: 'lowpass', f2: 900, pan: pan(6.0, 5.2) });

      // BEAT 3: guess -> check -> adjust
      glide(5.6, 0.7);
      fold(6.25, 6.25 + POP * 0.45, 1.0, pan(8.2, 6.4), false); // new cat pops up out of a flat sheet
      fold(6.4, 6.7, 0.6, pan(8.2, 6.6)); // 'new photo'
      slideSheet(6.6, 6.9, 0.9, pan(9.1, 6.8));
      slideSheet(6.95, 7.3, 0.9, pan(12.4, 7.1));
      fold(7.15, 7.4, 0.6, pan(12.45, 7.3)); // 'Guess'
      fold(7.3, 7.3 + POP * 0.4, 0.9, pan(13.9, 7.4)); // 'dog?' bubble stands up
      // the wrong guess: red strips snap into an X, camera pushes in, key light flares, the bubble wobbles
      const tX = 7.85 + POP * 0.3;
      k.noise(7.85, { dur: tX - 7.85, color: 'pink', filter: 'bandpass', f: [[0, 600], [tX - 7.85, 1600]], q: 0.7, gain: 0.2, a: 0.08, pan: 0.5 });
      k.play('slap', tX, { gain: 0.55, pan: 0.5 });
      k.play('thud', tX, { f: 120, gain: 0.55, pan: 0.4 });
      k.tone(tX + 0.02, { f: 'D3', type: 'triangle', dur: 0.16, gain: 0.2, filter: 'lowpass', f2: 700 });
      k.tone(tX + 0.18, { f: 'A2', type: 'triangle', dur: 0.32, gain: 0.22, filter: 'lowpass', f2: 600 });
      k.play('paper', 7.98, { dur: 0.35, gain: 0.3, pan: 0.4, minor: true });
      fold(8.0, 8.3, 0.65, 0.35); // 'Check'
      slideSheet(8.3, 8.75, 1.1, 0.0); // red arrow back toward the brain
      fold(8.6, 8.85, 0.65, -0.1); // 'Adjust'
      // the brain re-folds (8.85..9.5): real paper crinkle; the pinwheels flutter while they spin (8.85..9.9)
      k.play('paper', 8.85, { dur: 0.65, gain: 0.45, pan: -0.25 });
      {
        let ang = 0, next = 0;
        for (let t = 8.85; t < 9.9; t += 0.005) {
          const w = 9 * (1 - seg(t, 9.4, 9.9)) + 0.5; ang += w * 0.005;
          if (ang >= next) { k.noise(t, { dur: 0.035, color: 'pink', filter: 'bandpass', f: 800, q: 1, gain: 0.16 * Math.min(1, w / 6), a: 0.008, pan: -0.15, minor: true }); next += Math.PI / 4; }
        }
      }
      // bubble flips round (9.45..9.85) and the green tick snaps on
      k.noise(9.48, { dur: 0.32, color: 'pink', filter: 'bandpass', f: [[0, 420], [0.16, 900], [0.32, 420]], q: 0.7, gain: 0.18, a: 0.14, pan: 0.4 });
      const tV = 9.9 + POP * 0.35;
      crease(tV, 1.3, 0.5, false);
      k.play('success', tV, { f: 'G5', gain: 0.6, pan: 0.45 });

      // BEAT 4: columns ripple up pleat by pleat, % ticks, star pops
      glide(10.1, 0.8);
      fold(10.5, 10.9, 0.9, pan(20.7, 10.9)); // 'Accuracy' card
      slideSheet(10.6, 12.5, 0.6, 0);
      fold(10.8, 11.1, 0.5, pan(17.9, 11)); // 'training rounds'
      const accs = [61, 72, 80, 86, 90, 93, 95, 97];
      accs.forEach((a, i) => {
        const st = 10.55 + i * 0.25, p = pan(15.4 + i * 0.62, st + 0.1);
        for (let j = 0; j < 4; j++) k.noise(st + j * 0.045, { dur: 0.03, filter: 'bandpass', f: 1100 + j * 90, q: 1.3, gain: 0.14 * (1 - j * 0.15), a: 0.002, pan: p, minor: true }); // pleats opening
        tap(st + 0.2, 0.5, p);
      });
      {
        let last = -1, lastT = -1;
        for (let t = 10.56; t < 12.6; t += 1 / 120) {
          const i = Math.min(7, Math.floor((t - 10.55) / 0.25)), st = 10.55 + i * 0.25;
          const v = Math.round(H.lerp(i ? accs[i - 1] : 61, accs[i], H.clamp((t - st) / 0.3)));
          if (v !== last && t - lastT >= 1 / 12) { tick(t, 0.6, pan(20.7, t)); last = v; lastT = t; }
        }
      }
      // 97%: the folded star springs open over the red column, key light flares (biggest hit)
      k.play('impact', 12.6, { gain: 1.25, pan: 0.25 });
      k.noise(12.6, { dur: 0.15, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.15, 1800]], q: 0.6, gain: 0.26, a: 0.03, pan: 0.25 });
      k.play('ding', 12.6, { f: 'E5', gain: 0.65, pan: 0.3 });

      // BEAT 5: the takeaway card folds up in front and resolves
      fold(13.0, 13.55, 1.3, 0, false);
      ['C4', 'G4', 'E5'].forEach((f, i) => k.play('ding', 13.6 + i * 0.09, { f, gain: 0.48 - i * 0.04, pan: (i - 1) * 0.25 }));
    },
    draw(ctx, W, H_, t) {
      // ---------- camera ----------
      const dolly = H.ease.inOut(H.clamp(t / 5));
      const E = [0.5 * (1 - dolly) - 0.15, 3.25 - 0.15 * dolly, 11.9 - 0.7 * dolly], TG = [0, 1.35, 0];
      const fwd = norm(sub(TG, E)), right = norm(cross(fwd, [0, 1, 0])), up = cross(right, fwd);
      const F = 1180, CX = 640, CY = 372;
      const proj = (p) => { const d = sub(p, E); const z = dot(d, fwd); return [CX + (F * dot(d, right)) / z, CY - (F * dot(d, up)) / z, z]; };

      const Lkey = norm([-0.55 + 0.16 * (t - 4.8) / 4.8, 1.0, 0.55 + 0.1 * Math.sin((t - 4.8) * 0.8)]), Lfill = norm([0.9, 0.25, 0.35]);
      const Ls = mul(Lkey, -1);
      const faces = [];
      const addFace = (pts, col, under, extra = {}) => faces.push({ pts, col, under, ...extra });

      // ---------- geometric brain ----------
      const nz = H.makeNoise(41);
      const brainParts = [];
      {
        const ico = icosphere(2);
        const bRot = (p) => add(rotX(rotY(p, -1.18), 0.16), [0.1, 0, 0]);
        const jr = H.rng(43);
        const jit = ico.v.map(() => [jr.gauss() * 0.03, jr.gauss() * 0.03, jr.gauss() * 0.03]);
        const hemi = (side) => {
          const vs = ico.v.map((u, vi) => {
            const k = 1 + 0.07 * nz.n3(u[0] * 2.6 + side * 3, u[1] * 2.6, u[2] * 2.6) + 0.045 * nz.n3(u[0] * 6 + 9, u[1] * 6, u[2] * 6 + side);
            let p = [u[0] * 0.62 * k, u[1] * 0.8 * k, u[2] * 1.12 * k];
            if (u[0] * side < -0.15) p[0] *= 0.8; // flat medial wall -> fissure groove
            if (u[1] < -0.05 && u[2] > -0.35 && u[2] < 0.75) { p[0] *= 1.1; p[1] -= 0.05; } // temporal lobe
            p[1] = Math.max(p[1], -0.62 + Math.max(0, -u[2] - 0.1) * 0.6);
            p = add([p[0] + side * 0.63, p[1], p[2]], jit[vi]);
            return bRot(mul(p, 1.42));
          });
          ico.f.forEach(([a, b, c]) => addFace([vs[a], vs[b], vs[c]], [240, 138, 126], null, { obj: 'brain' }));
          vs.forEach((p) => brainParts.push(p));
        };
        hemi(-1); hemi(1);
        const ico1 = icosphere(1);
        const cv = ico1.v.map((u) => bRot(mul([u[0] * 1.0, u[1] * 0.3 - 0.5, u[2] * 0.42 - 0.88], 1.42)));
        ico1.f.forEach(([a, b, c]) => addFace([cv[a], cv[b], cv[c]], [205, 88, 92], null, { obj: 'brain' }));
        cv.forEach((p) => brainParts.push(p));
        // brain stem: a folded pentagonal tube
        {
          const n = 5, top = [], bot = [];
          for (let k = 0; k < n; k++) { const a = (k / n) * TAU; top.push(bRot(mul([Math.cos(a) * 0.17, -0.38, Math.sin(a) * 0.15 - 0.42], 1.42))); bot.push(bRot(mul([Math.cos(a) * 0.12, -0.78, Math.sin(a) * 0.1 - 0.58], 1.42))); }
          for (let k = 0; k < n; k++) { const k2 = (k + 1) % n; addFace([top[k], top[k2], bot[k2], bot[k]], [222, 112, 100], null, { obj: 'brain' }); }
          bot.forEach((p) => brainParts.push(p));
        }
        // drop so it rests on the table
        const minY = Math.min(...brainParts.map((p) => p[1]));
        const lift = 0.02 - minY;
        faces.forEach((f) => { if (f.obj === 'brain') f.pts = f.pts.map((p) => [p[0], p[1] + lift, p[2]]); });
      }

      // ---------- paper rocket ----------
      {
        const wob = Math.sin(t * 2.2) * 0.02;
        const tr = (p) => add(rotZ(rotY(p, 0.28 + t * 0.05), wob), [3.75, 0, 0.7]);
        const n = 6, r0 = 0.44;
        const ring = (y, r, off = 0) => Array.from({ length: n }, (_, k) => { const a = ((k + 0.5) / n) * TAU + off; return [Math.cos(a) * r, y, Math.sin(a) * r]; });
        const pleat = (y, r) => Array.from({ length: n }, (_, k) => { const a = ((k + 1) / n) * TAU; return [Math.cos(a) * r * 1.0, y, Math.sin(a) * r * 1.0]; });
        const IND = [58, 82, 150], MUS = [241, 182, 68], RED = [222, 84, 62], WHITE = [244, 240, 230];
        const band = (y0, y1, col) => {
          const A = ring(y0, r0), B = ring(y1, r0), PA = pleat(y0, r0 * 0.93), PB = pleat(y1, r0 * 0.93);
          for (let k = 0; k < n; k++) {
            const k2 = (k + 1) % n;
            addFace([A[k], PA[k], PB[k], B[k]].map(tr), col, null, { obj: 'rocket' });
            addFace([PA[k], A[k2], B[k2], PB[k]].map(tr), col, null, { obj: 'rocket' });
          }
        };
        band(0.42, 1.55, IND);
        band(1.55, 1.82, MUS);
        band(1.82, 2.25, IND);
        // nose
        const top = ring(2.25, r0), tip = [0, 3.2, 0], nb = ring(2.62, r0 * 0.62);
        for (let k = 0; k < n; k++) {
          const k2 = (k + 1) % n;
          addFace([top[k], top[k2], nb[k2], nb[k]].map(tr), RED, null, { obj: 'rocket' });
          addFace([nb[k], nb[k2], tip].map(tr), RED, null, { obj: 'rocket' });
        }
        // nozzle
        const z0 = ring(0.42, r0 * 0.78), z1 = ring(0.18, r0 * 0.6);
        for (let k = 0; k < n; k++) { const k2 = (k + 1) % n; addFace([z0[k], z0[k2], z1[k2], z1[k]].map(tr), [70, 70, 82], null, { obj: 'rocket' }); }
        // fins (two-tone: mustard outside, white inside)
        [0.5, 0.5 + TAU / 3, 0.5 + (2 * TAU) / 3].forEach((a) => {
          const P = (rr, y) => [Math.cos(a) * rr, y, Math.sin(a) * rr];
          const pts = [P(r0 * 0.95, 1.35), P(r0 + 0.62, 0.48), P(r0 + 0.7, 0.0), P(r0 * 0.95, 0.42)].map(tr);
          // slight fold crease along the fin
          const m1 = P(r0 + 0.3, 0.9), m2 = P(r0 + 0.32, 0.22);
          const off = [Math.cos(a + 1.57) * 0.05, 0, Math.sin(a + 1.57) * 0.05];
          addFace([pts[0], pts[1], tr(add(m1, off))], MUS, null, { obj: 'rocket' });
          addFace([tr(add(m1, off)), pts[1], pts[2], tr(add(m2, off)), pts[3]], MUS, null, { obj: 'rocket' });
          addFace([pts[0], tr(add(m1, off)), pts[3]], MUS, null, { obj: 'rocket' });
        });
        // round porthole flap
        const wp = Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * TAU; return tr([Math.cos(0.75) * (r0 + 0.012) + Math.sin(0.75) * Math.cos(a) * 0.17 * 0, 1.15 + Math.sin(a) * 0.17, 0]); });
        void wp;
      }

      // ---------- crane drone (hovering) ----------
      const rotorDiscs = [];
      {
        const bob = Math.sin(t * 2.4) * 0.09;
        const tr = (p) => add(rotX(rotY(rotZ(mul(p, 1.35), 0.04 + Math.sin(t * 1.3) * 0.03), 0.62), 0.32), [-3.5, 2.5 + bob, 0.3]);
        const TEAL = [44, 160, 150], WH = null;
        const C0 = [0, 0.1, 0], Bb = [0, -0.42, 0], BL = [0, -0.05, -0.2], BR = [0, -0.05, 0.2];
        const Nb = [0.42, -0.08, 0], Tb = [-0.42, -0.08, 0];
        const N = [1.0, 0.78, 0], Hd = [1.2, 0.62, 0];
        const T = [-1.08, 0.74, 0];
        const NL = [0.3, -0.16, -0.04], NR = [0.3, -0.16, 0.04], TL = [-0.3, -0.16, -0.04], TR = [-0.3, -0.16, 0.04];
        const flap = Math.sin(t * 3.1) * 0.06;
        const WL = [-0.3, 0.42 + flap, -1.35], WR = [-0.3, 0.42 + flap, 1.35];
        const WfL = [0.42, -0.04, -0.06], WbL = [-0.42, -0.04, -0.06], WfR = [0.42, -0.04, 0.06], WbR = [-0.42, -0.04, 0.06];
        const MlL = [-0.1, 0.32, -0.62], MlR = [-0.1, 0.32, 0.62];
        const F = (pts, c, b) => addFace(pts.map(tr), c, b, { obj: 'crane' });
        F([Nb, BL, Bb], TEAL, WH); F([Tb, Bb, BL], TEAL, WH); F([Nb, Bb, BR], TEAL, WH); F([Tb, BR, Bb], TEAL, WH);
        F([Nb, C0, BL], TEAL, WH); F([Tb, BL, C0], TEAL, WH); F([Nb, BR, C0], TEAL, WH); F([Tb, C0, BR], TEAL, WH);
        F([Nb, NL, N], TEAL, WH); F([Nb, N, NR], TEAL, WH); F([NL, NR, N], [240, 236, 226], null);
        F([N, Hd, [1.0, 0.7, -0.03]], TEAL, WH); F([N, [1.0, 0.7, 0.03], Hd], TEAL, WH);
        F([Tb, TL, T], TEAL, WH); F([Tb, T, TR], TEAL, WH); F([TL, TR, T], [240, 236, 226], null);
        // wings: folded along a crease to the tip (two-tone underside)
        F([C0, WfL, MlL], TEAL, WH); F([WfL, WL, MlL], TEAL, WH); F([C0, MlL, WbL], TEAL, WH); F([MlL, WL, WbL], TEAL, WH);
        F([C0, MlR, WfR], TEAL, WH); F([WfR, MlR, WR], TEAL, WH); F([C0, WbR, MlR], TEAL, WH); F([MlR, WbR, WR], TEAL, WH);
        // rotor posts + paper blades at wingtips
        [WL, WR].forEach((wt, i) => {
          const base = add(wt, [0.05, -0.02, i ? -0.08 : 0.08]);
          const top = add(base, [0, 0.2, 0]);
          F([add(base, [-0.025, 0, 0]), add(base, [0.025, 0, 0]), add(top, [0.025, 0, 0]), add(top, [-0.025, 0, 0])], [240, 182, 68], null);
          const a = t * 22 + i * 1.1;
          for (let b = 0; b < 2; b++) {
            const aa = a + b * Math.PI, d = [Math.cos(aa), 0, Math.sin(aa)], pp = [-Math.sin(aa), 0, Math.cos(aa)];
            const L = 0.4, w = 0.06;
            F([add(top, mul(pp, -w * 0.4)), add(add(top, mul(d, L)), add(mul(pp, -w), [0, 0.03, 0])), add(add(top, mul(d, L)), add(mul(pp, w), [0, -0.03, 0])), add(top, mul(pp, w * 0.4))], [246, 242, 234], null);
          }
          rotorDiscs.push(Array.from({ length: 28 }, (_, k) => { const a2 = (k / 28) * TAU; return tr(add(top, [Math.cos(a2) * 0.42, 0.005, Math.sin(a2) * 0.42])); }));
        });
      }

      // ---------- pre-creased square sheet lying on the table ----------
      {
        const tr = (p) => add(rotY(p, 0.5), [1.75, 0, 2.55]);
        const s0 = 0.78, Y = (v) => 0.004 + v;
        const C = [0, Y(0.05), 0];
        const P = [[-s0, Y(0), -s0], [0, Y(0.018), -s0], [s0, Y(0), -s0], [s0, Y(0.018), 0], [s0, Y(0), s0], [0, Y(0.018), s0], [-s0, Y(0), s0], [-s0, Y(0.018), 0]];
        const IN = [[-s0 / 2, Y(0.03), -s0 / 2], [s0 / 2, Y(0.03), -s0 / 2], [s0 / 2, Y(0.03), s0 / 2], [-s0 / 2, Y(0.03), s0 / 2]];
        const PAP = [244, 214, 120];
        for (let k = 0; k < 4; k++) {
          const c0 = P[k * 2], m = P[k * 2 + 1], c1 = P[(k * 2 + 2) % 8], i0 = IN[k], i1 = IN[(k + 1) % 4], mprev = P[(k * 2 + 7) % 8];
          addFace([c0, m, i0].map(tr), PAP, null, { obj: 'sheet' });
          addFace([m, i1, i0].map(tr), PAP, null, { obj: 'sheet' });
          addFace([m, c1, i1].map(tr), PAP, null, { obj: 'sheet' });
          addFace([i0, i1, C].map(tr), PAP, null, { obj: 'sheet' });
          addFace([mprev, c0, i0].map(tr), PAP, null, { obj: 'sheet' });
        }
      }

      // ---------- tent card (title) ----------
      let cardFront;
      {
        const tr = (p) => add(rotY(p, 0.2), [-2.7, 0, 2.7]);
        const w = 1.3, h = 0.86, dz = 0.36;
        const BLf = [-w, 0, dz], BRf = [w, 0, dz], TRr = [w, h, 0], TLr = [-w, h, 0], BLb = [-w, 0, -dz], BRb = [w, 0, -dz];
        addFace([TLr, TRr, BRb, BLb].map(tr), [236, 231, 220], null, { obj: 'card' });
        addFace([BLf, BRf, TRr, TLr].map(tr), [248, 245, 238], null, { obj: 'card', card: true });
        cardFront = [TLr, TRr, BLf].map(tr);
        faces[faces.length - 1].cardIdx = true;
      }

      // ---------- fold-up build: every model starts as a flat sheet on the table and folds up crease by crease ----------
      {
        const AN = { sheet: [0.0, 0.45], card: [0.1, 0.8], brain: [0.3, 1.6], rocket: [0.8, 1.4], crane: [1.4, 1.6] };
        const bounds = {};
        faces.forEach((f) => f.pts.forEach((p) => {
          const b = bounds[f.obj] || (bounds[f.obj] = { minY: 1e9, maxY: -1e9, sx: 0, sz: 0, n: 0 });
          b.minY = Math.min(b.minY, p[1]); b.maxY = Math.max(b.maxY, p[1]); b.sx += p[0]; b.sz += p[2]; b.n++;
        }));
        const backOut = (u) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
        const cache = new Map();
        const animV = (p, obj) => {
          const key = obj + p[0] + ',' + p[1] + ',' + p[2];
          if (cache.has(key)) return cache.get(key);
          const [st, du] = AN[obj], b = bounds[obj], cx = b.sx / b.n, cz = b.sz / b.n;
          let out;
          if (obj === 'sheet') {
            const u = H.clamp((t - st) / du), e = H.ease.out(u);
            out = [p[0] - (1 - e) * 0.6, p[1] + (1 - e) * 2.2, p[2] + (1 - e) * 0.4];
          } else {
            const dx = p[0] - cx, dz = p[2] - cz, hd = Math.hypot(dx, dz) || 1;
            const hn = obj === 'crane' ? H.clamp(hd / 1.8) : (p[1] - b.minY) / (b.maxY - b.minY + 1e-6);
            const u = H.clamp((t - st - du * 0.45 * hn) / (du * 0.55));
            const e = backOut(u);
            const spread = (p[1] - b.minY) * 0.55;
            const flat = [cx + dx * 1.05 + (dx / hd) * spread, 0.006 + hn * 0.004, cz + dz * 1.05 + (dz / hd) * spread];
            out = [H.lerp(flat[0], p[0], e), H.lerp(flat[1], p[1], e), H.lerp(flat[2], p[2], e)];
          }
          cache.set(key, out);
          return out;
        };
        faces.forEach((f) => { if (f.obj && AN[f.obj]) f.pts = f.pts.map((p) => animV(p, f.obj)); });
        // card lettering follows the folding card
        const cf = faces.find((f) => f.cardIdx);
        if (cf) cardFront = [cf.pts[3], cf.pts[2], cf.pts[0]];
        // rotor blur only once the crane is airborne
        if (t < AN.crane[0] + AN.crane[1]) rotorDiscs.length = 0;
      }

      // ---------- crease map: valley vs mountain folds ----------
      const ek = (p) => p[0].toFixed(3) + ',' + p[1].toFixed(3) + ',' + p[2].toFixed(3);
      const edges = new Map();
      faces.forEach((f, fi) => f.pts.forEach((p, i) => {
        const q = f.pts[(i + 1) % f.pts.length], k = [ek(p), ek(q)].sort().join('|');
        if (!edges.has(k)) edges.set(k, []);
        edges.get(k).push(fi);
      }));
      // ---------- shade + sort faces ----------
      faces.forEach((f) => {
        const [a, b, c] = f.pts;
        let n = norm(cross(sub(b, a), sub(c, a)));
        const cen = mul(f.pts.reduce((s, p) => add(s, p), [0, 0, 0]), 1 / f.pts.length);
        const v = norm(sub(E, cen));
        let side = 0;
        if (dot(n, v) < 0) { n = mul(n, -1); side = 1; }
        const base = f.under && n[1] < -0.08 ? f.under : f.col;
        const diff = Math.max(0, dot(n, Lkey)), fill = Math.max(0, dot(n, Lfill)), bounce = Math.max(0, -n[1]);
        const I = 0.36 + 0.7 * diff + 0.16 * fill + 0.1 * bounce;
        const warm = [1.04, 1.0, 0.95];
        f.rgb = base.map((ch, i) => Math.min(255, ch * I * warm[i]));
        f.I = I; f.n = n;
        f.sp = f.pts.map(proj);
        f.z = f.sp.reduce((s, p) => s + p[2], 0) / f.sp.length;
      });
      faces.forEach((f, fi) => {
        const cen = mul(f.pts.reduce((s2, p) => add(s2, p), [0, 0, 0]), 1 / f.pts.length);
        f.cen = cen;
      });
      faces.forEach((f, fi) => {
        f.ekind = f.pts.map((p, i) => {
          const q = f.pts[(i + 1) % f.pts.length], k = [ek(p), ek(q)].sort().join('|');
          const fs = edges.get(k);
          if (!fs || fs.length < 2) return 0;
          const g = faces[fs[0] === fi ? fs[1] : fs[0]];
          const d = dot(sub(g.cen, f.cen), f.n);
          return d > 0.004 ? -1 : d < -0.004 ? 1 : 0; // -1 valley, 1 mountain
        });
      });
      faces.sort((a, b) => b.z - a.z);

      // ---------- backdrop: seamless paper sweep ----------
      const tex = makeTex(5);
      const pat = ctx.createPattern(tex, 'repeat');
      const bg = ctx.createLinearGradient(0, 0, 0, H_);
      bg.addColorStop(0, '#c9d3cf'); bg.addColorStop(0.45, '#dde3de'); bg.addColorStop(0.62, '#e6e6de'); bg.addColorStop(1, '#d8d5ca');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
      const spot = ctx.createRadialGradient(520, 330, 40, 560, 380, 760);
      spot.addColorStop(0, 'rgba(255,252,240,0.65)'); spot.addColorStop(1, 'rgba(255,252,240,0)');
      ctx.fillStyle = spot; ctx.fillRect(0, 0, W, H_);
      ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H_); ctx.restore();

      // ---------- shadows on the table ----------
      const shadowPt = (p) => proj(add(p, mul(Ls, p[1] / -Ls[1])));
      const SL = H.layer(W, H_), sc = SL.getContext('2d');
      sc.fillStyle = '#000';
      faces.forEach((f) => { sc.beginPath(); f.pts.forEach((p, i) => { const s = shadowPt(p); i ? sc.lineTo(s[0], s[1]) : sc.moveTo(s[0], s[1]); }); sc.closePath(); sc.fill(); });
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.filter = 'blur(16px)'; ctx.globalAlpha = 0.42; ctx.drawImage(SL, 0, 0); ctx.restore();
      // contact shadow (occlusion) where paper meets table
      const CL = H.layer(W, H_), cc = CL.getContext('2d');
      cc.fillStyle = '#000';
      faces.forEach((f) => {
        if (f.obj === 'crane' || !f.obj) return;
        if (Math.min(...f.pts.map((p) => p[1])) > 0.22) return;
        cc.beginPath(); f.pts.forEach((p, i) => { const s = proj([p[0], 0, p[2]]); i ? cc.lineTo(s[0], s[1]) : cc.moveTo(s[0], s[1]); }); cc.closePath(); cc.fill();
      });
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.filter = 'blur(5px)'; ctx.globalAlpha = 0.6; ctx.drawImage(CL, 0, 0); ctx.restore();

      // ---------- draw paper facets ----------
      const OL = H.layer(W, H_), o = OL.getContext('2d');
      o.lineJoin = 'round';
      const Lscr = [-0.6, -0.8];
      faces.forEach((f) => {
        const sp = f.sp;
        const path = () => { o.beginPath(); sp.forEach((p, i) => (i ? o.lineTo(p[0], p[1]) : o.moveTo(p[0], p[1]))); o.closePath(); };
        let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
        sp.forEach((p) => { mnx = Math.min(mnx, p[0]); mxx = Math.max(mxx, p[0]); mny = Math.min(mny, p[1]); mxy = Math.max(mxy, p[1]); });
        const cx = (mnx + mxx) / 2, cy = (mny + mxy) / 2, rr = Math.max(mxx - mnx, mxy - mny) / 2;
        const g = o.createLinearGradient(cx + Lscr[0] * rr, cy + Lscr[1] * rr, cx - Lscr[0] * rr, cy - Lscr[1] * rr);
        const c1 = f.rgb.map((v) => Math.min(255, v * 1.05)), c2 = f.rgb.map((v) => v * 0.94);
        g.addColorStop(0, H.rgba(c1, 1)); g.addColorStop(1, H.rgba(c2, 1));
        path(); o.fillStyle = g; o.fill();
        o.strokeStyle = H.rgba(f.rgb, 1); o.lineWidth = 0.7; o.stroke();
        // crisp crease: lit edge highlight + faint dark fold line
        o.strokeStyle = `rgba(255,255,250,${0.05 + 0.08 * Math.min(1, f.I)})`; o.lineWidth = 0.6; o.stroke();
        // crisp creases: dark valley folds, lit mountain folds
        sp.forEach((p, i) => {
          const k = f.ekind[i]; if (!k) return;
          const q = sp[(i + 1) % sp.length];
          o.beginPath(); o.moveTo(p[0], p[1]); o.lineTo(q[0], q[1]);
          if (k < 0) { o.strokeStyle = H.rgba(f.rgb.map((v) => v * 0.55), 0.55); o.lineWidth = 0.9; }
          else { o.strokeStyle = `rgba(255,250,242,${0.1 + 0.2 * H.clamp(f.I - 0.5)})`; o.lineWidth = 0.8; }
          o.stroke();
        });
      });
      // printed lettering on the tent card front (affine-mapped)
      {
        const [p0, p1, p3] = cardFront.map(proj);
        const cw = 400, ch = 130;
        o.save();
        o.setTransform((p1[0] - p0[0]) / cw, (p1[1] - p0[1]) / cw, (p3[0] - p0[0]) / ch, (p3[1] - p0[1]) / ch, p0[0], p0[1]);
        o.fillStyle = '#23242a'; o.font = '700 46px "Space Grotesk"'; o.textAlign = 'center'; o.textBaseline = 'middle';
        o.fillText('THINK IN FOLDS', cw / 2, ch * 0.44);
        o.fillStyle = '#e45a3e'; o.fillRect(cw / 2 - 30, ch * 0.72, 60, 5);
        o.font = '400 17px "Space Mono"'; o.fillStyle = '#6a6a70';
        o.fillText('AI · EP. 07', cw / 2, ch * 0.86);
        o.restore();
      }
      // paper fibre texture on all folded paper
      o.save(); o.globalCompositeOperation = 'source-atop'; o.globalAlpha = 0.9; o.fillStyle = pat; o.fillRect(0, 0, W, H_); o.restore();
      ctx.drawImage(OL, 0, 0);

      // rotor motion blur discs
      rotorDiscs.forEach((ring) => {
        const sp = ring.map(proj);
        ctx.save(); ctx.beginPath(); sp.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,250,0.16)'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,250,0.28)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
      });

      // ---------- studio finish ----------
      H.vignette(ctx, W, H_, 0.28, '30,40,40');
      H.grain(ctx, W, H_, 0.025, 3 + Math.floor(t * 24));
    },
  });
}
