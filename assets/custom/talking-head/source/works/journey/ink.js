{
  // ---------------------------------------------------------------
  // Sumi-e — ink wash on rice paper
  // ---------------------------------------------------------------
  const INK = [22, 20, 19];

  // resample a polyline to a fixed spacing; pts = [[x,y,p], ...]
  function resample(pts, step) {
    const out = [pts[0]];
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      let tt = step - acc;
      while (tt <= d) { const u = tt / d; out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]); tt += step; }
      acc = (acc + d) % step;
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  // smooth Catmull-Rom through control points [[x,y,p]...]
  function spline(cp, n = 12) {
    const out = [];
    for (let i = 0; i < cp.length - 1; i++) {
      const p0 = cp[Math.max(0, i - 1)], p1 = cp[i], p2 = cp[i + 1], p3 = cp[Math.min(cp.length - 1, i + 2)];
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), f(p0[2], p1[2], p2[2], p3[2])]);
      }
    }
    out.push(cp[cp.length - 1]);
    return out;
  }

  // One loaded-brush stroke: a solid wet body with ragged edges, then "flying white" — the dry-brush streaks
  // where individual bristles ran out of ink — erased out of it, more and more toward the tail.
  let TMP = null;
  function brush(c, cp, o, nz) {
    const { w = 10, ink = 1, dry = 0.9, seed = 1, tone = 1, pool = 0.35, rim = 0.3, p: prog = 1 } = o;
    if (prog <= 0) return;
    const r = H.rng(seed);
    const pts = resample(spline(cp), 2);
    const N = pts.length;
    if (N < 2) return;
    const Np = prog >= 1 ? N : Math.floor(N * prog);    // the brush is still travelling: only lay what it has covered
    if (Np < 2) return;
    const nrm = pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      return [-dy / l, dx / l];
    });
    if (!TMP) TMP = H.layer(1280, 720);
    const tc = TMP.getContext('2d');
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    const m = w + 4; x0 = Math.max(0, Math.floor(x0 - m)); y0 = Math.max(0, Math.floor(y0 - m)); x1 = Math.min(1280, Math.ceil(x1 + m)); y1 = Math.min(720, Math.ceil(y1 + m));
    if (x1 <= x0 || y1 <= y0) return;
    tc.clearRect(x0, y0, x1 - x0, y1 - y0);
    const ph = r() * 100;
    const L = [], Rr = [];
    for (let i = 0; i < Np; i++) {
      const head = prog >= 1 ? 1 : Math.min(1, (Np - i) / 5);
      const p = pts[i], hw = Math.max(0.3, w * p[2] * 0.5 * head * (1 + nz.n2(ph + i * 0.06, 3.3) * 0.16));
      L.push([p[0] + nrm[i][0] * hw, p[1] + nrm[i][1] * hw]); Rr.push([p[0] - nrm[i][0] * hw, p[1] - nrm[i][1] * hw]);
    }
    tc.save();
    tc.fillStyle = `rgb(${INK})`; tc.strokeStyle = `rgb(${INK})`;
    tc.globalAlpha = Math.min(1, ink) * 0.9 * tone;
    tc.beginPath(); tc.moveTo(L[0][0], L[0][1]); for (let i = 1; i < Np; i++) tc.lineTo(L[i][0], L[i][1]);
    for (let i = Np - 1; i >= 0; i--) tc.lineTo(Rr[i][0], Rr[i][1]); tc.closePath(); tc.fill();
    if (rim > 0) { tc.globalAlpha = rim * tone; tc.lineWidth = 1.1; tc.stroke(); }
    if (pool > 0) {
      const p0 = pts[0], p1 = pts[Math.min(N - 1, 3)];
      tc.globalAlpha = pool * tone;
      tc.beginPath(); tc.ellipse((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, w * p0[2] * 0.48, w * p0[2] * 0.4, Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), 0, 7); tc.fill();
    }
    // flying white
    tc.globalCompositeOperation = 'destination-out'; tc.lineCap = 'butt'; tc.lineJoin = 'round';
    const nb = Math.max(4, Math.min(64, Math.round(w * 1.4)));
    const step = 2;
    for (let b = 0; b < nb; b++) {
      const off = ((b + r()) / nb) * 2 - 1, edge = Math.abs(off);
      const start = r() * 0.25 - (ink - 1) * 0.6, rate = dry * (0.5 + edge * edge * 1.1 + r() * 0.9);
      const lw = Math.max(0.5, (w / nb) * (0.5 + r() * 0.9));
      const ph2 = r() * 100;
      let run = null, sumA = 0;
      const flush = () => {
        if (run && run.length > 1) { tc.globalAlpha = H.clamp(sumA / run.length); tc.lineWidth = lw; tc.beginPath(); tc.moveTo(run[0][0], run[0][1]); for (let k = 1; k < run.length; k++) tc.lineTo(run[k][0], run[k][1]); tc.stroke(); }
        run = null; sumA = 0;
      };
      for (let i = 0; i < Np; i += step) {
        const s = i / N;
        const dness = start + s * rate + nz.n2(ph2 + i * 0.05, b * 0.53) * 0.4;
        if (dness < 0.5) { flush(); continue; }
        const p = pts[i], h = w * p[2] * 0.5 * off;
        const pos = [p[0] + nrm[i][0] * h, p[1] + nrm[i][1] * h];
        if (!run) run = [];
        run.push(pos); sumA += (dness - 0.5) * 3;
        if (run.length >= 8) { flush(); run = [pos]; sumA = (dness - 0.5) * 3; }
      }
      flush();
    }
    tc.restore();
    c.drawImage(TMP, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
    return [x0, y0, x1, y1];
  }

  // Kozo rice paper, shared by the still and the scroll: cloudy fibre formation (mottle), a fine pulp grain,
  // faint old sizing stains, and hair-like fibres -- the light ones kept subtle so they read as fibre, not scratches.
  function makePaper(w, h, nz, R, nFib) {
    const pw = H.layer(w, h), p = pw.getContext('2d');
    p.fillStyle = '#efe7d6'; p.fillRect(0, 0, w, h);
    const cw = Math.ceil(w / 20), ch = Math.ceil(h / 20);
    const big = H.layer(cw, ch), bx = big.getContext('2d');
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) { const v = nz.fbm2(i * 0.12, j * 0.12, 3); bx.fillStyle = v > 0 ? `rgba(255,252,242,${Math.min(1, v * 0.8)})` : `rgba(176,160,128,${Math.min(1, -v * 0.45)})`; bx.fillRect(i, j, 1, 1); }
    p.imageSmoothingEnabled = true; p.drawImage(big, 0, 0, w, h);
    // flocculation: finer clouds of denser pulp (the formation you see holding washi up to light)
    const fw = Math.ceil(w / 6), fh = Math.ceil(h / 6), fl = H.layer(fw, fh), fx = fl.getContext('2d'), fi = fx.createImageData(fw, fh), fd = fi.data;
    for (let j = 0; j < fh; j++) for (let i = 0; i < fw; i++) { const v = nz.fbm2(i * 0.11 + 40, j * 0.11 + 17, 3), k = (j * fw + i) * 4; if (v > 0) { fd[k] = 255; fd[k + 1] = 253; fd[k + 2] = 246; fd[k + 3] = Math.min(255, v * 90); } else { fd[k] = 170; fd[k + 1] = 152; fd[k + 2] = 120; fd[k + 3] = Math.min(255, -v * 40); } }
    fx.putImageData(fi, 0, 0); p.drawImage(fl, 0, 0, w, h);
    // pulp grain
    const gi = p.getImageData(0, 0, w, h), gd = gi.data, gr = H.rng(31337);
    for (let i = 0; i < gd.length; i += 4) { const v = (gr() - 0.5) * 9 + (gr() < 0.004 ? -26 * gr() : 0); gd[i] += v; gd[i + 1] += v; gd[i + 2] += v * 0.9; }
    p.putImageData(gi, 0, 0);
    p.lineCap = 'round';
    for (let i = 0; i < nFib; i++) {
      const x = R() * w, y = R() * h, len = R.range(10, 70), a = R() * Math.PI * 2, bend = R.gauss() * 0.6, dark = R.chance(0.45);
      p.strokeStyle = dark ? `rgba(150,130,100,${R.range(0.07, 0.2)})` : `rgba(255,253,246,${R.range(0.12, 0.3)})`; p.lineWidth = R.range(0.4, 1.3);
      p.beginPath(); p.moveTo(x, y); p.quadraticCurveTo(x + Math.cos(a + bend) * len * 0.5, y + Math.sin(a + bend) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len); p.stroke();
    }
    return pw;
  }
window.Ink = {brush, makePaper};
}
