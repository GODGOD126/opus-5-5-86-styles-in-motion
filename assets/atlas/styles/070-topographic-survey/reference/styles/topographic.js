{
  // Vintage survey quadrangle: marching-squares contours, hillshade, water-lined lake, dashed trail, full collar.
  const PAPER = '#EEE5CB', BROWN = '#A2643A', BLUE = '#3F7FA6', WATER = [168, 204, 214], WOOD = [200, 219, 168];
  const MX0 = 36, MY0 = 30, MX1 = 1244, MY1 = 620; // map neatline
  const G = 3; // grid spacing (px)
  const CI = 40; // contour interval (m)

  function makeTerrain() {
    const n = H.makeNoise(31), n2 = H.makeNoise(77), n3 = H.makeNoise(5);
    return function height(x, y) {
      const wx = x + 80 * n.fbm2(x * 0.003, y * 0.003, 3);
      const wy = y + 80 * n.fbm2(x * 0.003 + 5.2, y * 0.003 + 1.3, 3);
      let h = 560 + 620 * n.fbm2(wx * 0.0024, wy * 0.0024, 5);
      const rdg = 1 - Math.abs(n2.fbm2(wx * 0.0034, wy * 0.0034, 4));
      h += 260 * (rdg - 0.6);
      const g1 = Math.exp(-(((wx - 860) / 250) ** 2 + ((wy - 220) / 190) ** 2));
      const g2 = Math.exp(-(((wx - 1120) / 150) ** 2 + ((wy - 450) / 140) ** 2));
      h += 1300 * g1 * (0.45 + 0.75 * rdg) + 650 * g2 * (0.5 + 0.6 * rdg);
      const b = Math.exp(-(((x - 330) / 230) ** 2 + ((y - 400) / 150) ** 2));
      h -= 640 * b;
      h += 18 * n3.fbm2(x * 0.03, y * 0.03, 2); // fine texture so contours crinkle
      return h;
    };
  }

  // marching squares over a grid; calls emit(level, x1,y1,x2,y2) for every crossing
  function contours(v, gw, gh, ox, oy, levels, emit) {
    const L0 = levels[0], step = levels[1] - levels[0], nL = levels.length;
    for (let j = 0; j < gh - 1; j++) for (let i = 0; i < gw - 1; i++) {
      const a = v[j * gw + i], b = v[j * gw + i + 1], c = v[(j + 1) * gw + i + 1], d = v[(j + 1) * gw + i];
      const lo = Math.min(a, b, c, d), hi = Math.max(a, b, c, d);
      let k0 = Math.max(0, Math.ceil((lo - L0) / step)), k1 = Math.min(nL - 1, Math.floor((hi - L0) / step));
      const x = ox + i * G, y = oy + j * G;
      for (let k = k0; k <= k1; k++) {
        const L = levels[k];
        const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const T = () => [x + G * (L - a) / (b - a), y];
        const R = () => [x + G, y + G * (L - b) / (c - b)];
        const B = () => [x + G * (L - d) / (c - d), y + G];
        const Lf = () => [x, y + G * (L - a) / (d - a)];
        const seg = (p, q) => emit(k, p[0], p[1], q[0], q[1]);
        switch (idx) {
          case 1: case 14: seg(Lf(), B()); break;
          case 2: case 13: seg(B(), R()); break;
          case 3: case 12: seg(Lf(), R()); break;
          case 4: case 11: seg(T(), R()); break;
          case 6: case 9: seg(T(), B()); break;
          case 7: case 8: seg(Lf(), T()); break;
          case 5: seg(Lf(), T()); seg(B(), R()); break;
          case 10: seg(T(), R()); seg(Lf(), B()); break;
        }
      }
    }
  }

  function spacedText(ctx, str, x, y, track, align = 'left') {
    let w = 0; for (const ch of str) w += ctx.measureText(ch).width + track; w -= track;
    let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    const sa = ctx.textAlign; ctx.textAlign = 'left';
    for (const ch of str) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + track; }
    ctx.textAlign = sa; return w;
  }

  // Everything that does not depend on t is computed once and memoised (output stays a pure function of t).
  let CACHE = null;
  function buildStatic(W, H_) {
    const height = makeTerrain();
    const paperL = H.layer(W, H_);
    H.paper(paperL.getContext('2d'), W, H_, PAPER, 21, 0.03);

    // ---- heightfield ----
    const gw = Math.ceil((MX1 - MX0) / G) + 2, gh = Math.ceil((MY1 - MY0) / G) + 2;
    const hv = new Float32Array(gw * gh);
    let hmax = -1e9, pk = [0, 0];
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const x = MX0 + i * G, y = MY0 + j * G, h = height(x, y);
      hv[j * gw + i] = h;
      if (h > hmax && x > MX0 + 60 && x < MX1 - 60 && y > MY0 + 60) { hmax = h; pk = [x, y]; }
    }
    const WL = height(330, 400) + 170; // lake level
    const hAt = (x, y) => {
      const fx = H.clamp((x - MX0) / G, 0, gw - 1.001), fy = H.clamp((y - MY0) / G, 0, gh - 1.001);
      const i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j, k = j * gw + i;
      return hv[k] * (1 - u) * (1 - v) + hv[k + 1] * u * (1 - v) + hv[k + gw] * (1 - u) * v + hv[k + gw + 1] * u * v;
    };
    const grad = (x, y) => [(hAt(x + 2, y) - hAt(x - 2, y)) / 4, (hAt(x, y + 2) - hAt(x, y - 2)) / 4];

    // ---- plates at full res: water (blue), woodland (green), hillshade (grey) ----
    const mw = MX1 - MX0, mh = MY1 - MY0;
    const waterL = H.layer(mw, mh), woodL = H.layer(mw, mh), shadeL = H.layer(mw, mh);
    const wi = waterL.getContext('2d').createImageData(mw, mh), oi = woodL.getContext('2d').createImageData(mw, mh), si = shadeL.getContext('2d').createImageData(mw, mh);
    const sh = new Float32Array(gw * gh);
    const Z = 0.16, lx = -0.55, ly = -0.6, lz = 0.58;
    for (let j = 1; j < gh - 1; j++) for (let i = 1; i < gw - 1; i++) {
      const k = j * gw + i;
      const dx = (hv[k + 1] - hv[k - 1]) / (2 * G) * Z, dy = (hv[k + gw] - hv[k - gw]) / (2 * G) * Z;
      sh[k] = (-dx * lx - dy * ly + lz) / Math.hypot(dx, dy, 1);
    }
    const woodN = H.makeNoise(909);
    const wood = new Float32Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) wood[j * gw + i] = woodN.fbm2(i * G * 0.0065, j * G * 0.0065, 4);
    for (let py = 0; py < mh; py++) {
      const fy = py / G, j = Math.min(gh - 2, Math.floor(fy)), v = fy - j;
      for (let px = 0; px < mw; px++) {
        const fx = px / G, i = Math.min(gw - 2, Math.floor(fx)), u = fx - i, k = j * gw + i;
        const w00 = (1 - u) * (1 - v), w10 = u * (1 - v), w01 = (1 - u) * v, w11 = u * v;
        const h = hv[k] * w00 + hv[k + 1] * w10 + hv[k + gw] * w01 + hv[k + gw + 1] * w11;
        const s = sh[k] * w00 + sh[k + 1] * w10 + sh[k + gw] * w01 + sh[k + gw + 1] * w11;
        const wd = wood[k] * w00 + wood[k + 1] * w10 + wood[k + gw] * w01 + wood[k + gw + 1] * w11;
        const o = (py * mw + px) * 4;
        if (h < WL) {
          wi.data[o] = WATER[0]; wi.data[o + 1] = WATER[1]; wi.data[o + 2] = WATER[2]; wi.data[o + 3] = 235;
        } else {
          if (wd > 0.04 && h < 1350) { oi.data[o] = WOOD[0]; oi.data[o + 1] = WOOD[1]; oi.data[o + 2] = WOOD[2]; oi.data[o + 3] = 175; }
          const amt = H.clamp((lz - s) * 1.25, -0.25, 0.7);
          if (amt > 0) { si.data[o] = 255 - 100 * amt; si.data[o + 1] = 255 - 115 * amt; si.data[o + 2] = 255 - 128 * amt; si.data[o + 3] = 255; }
          else { si.data[o] = 255; si.data[o + 1] = 255; si.data[o + 2] = 255; si.data[o + 3] = 255; }
        }
      }
    }
    waterL.getContext('2d').putImageData(wi, 0, 0);
    woodL.getContext('2d').putImageData(oi, 0, 0);
    shadeL.getContext('2d').putImageData(si, 0, 0);

    // ---- contours ----
    const levels = []; for (let L = Math.ceil(WL / CI) * CI; L < hmax + CI; L += CI) levels.push(L);
    const segs = levels.map(() => []);
    contours(hv, gw, gh, MX0, MY0, levels, (k, x1, y1, x2, y2) => segs[k].push(x1, y1, x2, y2));

    // ---- trail: switchback descent from near the summit to the lake ----
    const trail = [];
    {
      let x = pk[0] - 26, y = pk[1] + 14, dir = [-0.7, 0.7], side = 1, run = 0;
      const tr = H.rng(17);
      for (let s = 0; s < 1600; s++) {
        const g = grad(x, y), gm = Math.hypot(g[0], g[1]) || 1e-6;
        let dx = -g[0] / gm, dy = -g[1] / gm;
        const steep = H.smooth(1.2, 4.5, gm);
        const th = side * (1.15 * steep + 0.25);
        let rx = dx * Math.cos(th) - dy * Math.sin(th), ry = dx * Math.sin(th) + dy * Math.cos(th);
        const lxv = 330 - x, lyv = 400 - y, lm = Math.hypot(lxv, lyv) || 1;
        rx += 0.45 * lxv / lm; ry += 0.45 * lyv / lm;
        const rm = Math.hypot(rx, ry); rx /= rm; ry /= rm;
        dir = [dir[0] * 0.8 + rx * 0.2, dir[1] * 0.8 + ry * 0.2];
        const dm = Math.hypot(dir[0], dir[1]); dir = [dir[0] / dm, dir[1] / dm];
        x += dir[0] * 2; y += dir[1] * 2; run += 2;
        if (run > 46 + tr() * 40 * (1 - steep) + 30 * (1 - steep)) { side = -side; run = 0; }
        trail.push(x, y);
        if (hAt(x, y) < WL + 2) break;
      }
    }
    const tm = Math.floor(trail.length / 4) * 2;
    const tlx = trail[tm], tly = trail[tm + 1];

    // ---- label placement on index contours (uphill-reading numerals) ----
    const isIndex = (L) => L % 200 === 0;
    const rng = H.rng(4242);
    const boxes = [];
    const reserve = [[pk[0], pk[1] - 4, 210, 60], [330, 402, 230, 50], [tlx + 80, tly - 10, 160, 24]];
    const freeOf = (x, y, rad) => boxes.every((b) => Math.hypot(b.x - x, b.y - y) > rad) && reserve.every(([rx, ry, rw, rh]) => Math.abs(x - rx) > rw / 2 + 12 || Math.abs(y - ry) > rh / 2 + 10);
    const labels = [];
    levels.forEach((L, k) => {
      if (!isIndex(L)) return;
      const s = segs[k]; const nSeg = s.length / 4; if (!nSeg) return;
      let placed = 0;
      for (let tries = 0; tries < 140 && placed < 3; tries++) {
        const q = rng.int(0, nSeg - 1) * 4;
        const x = (s[q] + s[q + 2]) / 2, y = (s[q + 1] + s[q + 3]) / 2;
        if (x < MX0 + 40 || x > MX1 - 40 || y < MY0 + 30 || y > MY1 - 30) continue;
        const g = grad(x, y), gm = Math.hypot(g[0], g[1]); if (gm < 0.6 || gm > 9) continue;
        const tx = -g[1] / gm, ty = g[0] / gm;
        const g2a = grad(x + tx * 14, y + ty * 14), g2b = grad(x - tx * 14, y - ty * 14);
        const dA = (g2a[0] * g[0] + g2a[1] * g[1]) / (Math.hypot(...g2a) * gm), dB = (g2b[0] * g[0] + g2b[1] * g[1]) / (Math.hypot(...g2b) * gm);
        if (dA < 0.93 || dB < 0.93) continue;
        if (!freeOf(x, y, 110)) continue;
        let ang = Math.atan2(ty, tx);
        if (Math.sin(ang) * g[0] - Math.cos(ang) * g[1] < 0) ang += Math.PI; // read uphill
        const txt = String(L);
        labels.push({ x, y, ang, txt, L });
        boxes.push({ x, y, w: txt.length * 6.2 + 6, h: 11, ang });
        placed++;
      }
    });

    // ---- water lining + shoreline ----
    const wlv = [WL - 3, WL - 9, WL - 17, WL - 28, WL - 42, WL - 60];
    const ws = wlv.map(() => []);
    wlv.forEach((L, k) => contours(hv, gw, gh, MX0, MY0, [L, L + 1000], (kk, a, b, c, d) => { if (kk === 0) ws[k].push(a, b, c, d); }));
    const shore = [];
    contours(hv, gw, gh, MX0, MY0, [WL, WL + 1000], (kk, a, b, c, d) => { if (kk === 0) shore.push(a, b, c, d); });

    // ---- streams: steepest descent from springs that reach the lake ----
    const streams = [];
    {
      const gradS = (x, y) => [(hAt(x + 7, y) - hAt(x - 7, y)) / 14, (hAt(x, y + 7) - hAt(x, y - 7)) / 14];
      const sr = H.rng(303);
      for (let tries = 0; tries < 160 && streams.length < 4; tries++) {
        let x = sr.range(MX0 + 30, MX1 - 30), y = sr.range(MY0 + 30, MY1 - 30);
        const h0 = hAt(x, y); if (h0 < WL + 260 || h0 > hmax - 250) continue;
        if (streams.some((f) => Math.hypot(f[0][0] - x, f[0][1] - y) < 220)) continue;
        let d = [0, 0]; const pts = [[x, y]]; let ok = false;
        for (let st = 0; st < 1400; st++) {
          const g = gradS(x, y), gm = Math.hypot(g[0], g[1]) || 1e-6;
          d = [d[0] * 0.75 - g[0] / gm * 0.25, d[1] * 0.75 - g[1] / gm * 0.25];
          const dm = Math.hypot(d[0], d[1]) || 1; x += d[0] / dm * 2; y += d[1] / dm * 2;
          pts.push([x, y]);
          if (hAt(x, y) < WL) { ok = true; break; }
          if (x < MX0 || x > MX1 || y < MY0 || y > MY1) break;
        }
        if (ok && pts.length > 90) streams.push(pts);
      }
    }
    const spots = [[1100, 470], [560, 230], [960, 560], [150, 150], [720, 470]].map(([x, y]) => [x, y, hAt(x, y)]).filter((s) => s[2] >= WL);
    return { paperL, waterL, woodL, shadeL, hmax, pk, WL, levels, segs, isIndex, trail, tlx, tly, labels, boxes, ws, shore, streams, spots, mw, mh };
  }

  registerStyle({
    id: 'topographic',
    name: 'Topographic Survey',
    category: 'Data & Information',
    description: 'A vintage survey quadrangle of a "loss landscape": brown contour lines with heavier labelled index contours, soft hillshade and woodland tint, a water-lined lake, a red dashed switchback trail and a full printed collar with scale bar and north arrow.',
    motion: 'Printed plate by plate: the black frame and collar, then the grey hillshade, the green woodland sliding into register, the blue lake, then brown contours rising from the shore like a tide; streams trace downhill, names land, and the red trail walks itself down the switchbacks while the camera eases in.',
    duration: 7,
    fonts: ['400 10px "Inter"', '600 10px "Inter"', '700 13px "Libre Baskerville"', 'italic 400 14px "Libre Baskerville"',
      'italic 400 11px "Libre Baskerville"', '700 22px "Libre Baskerville"', '400 10px "Libre Baskerville"', '400 9px "Inter"', 'italic 700 24px "Libre Baskerville"', '700 66px "Libre Baskerville"', '700 28px "Libre Baskerville"', 'italic 400 28px "Libre Baskerville"', '700 64px "Libre Baskerville"'],
    frameT: 6.9,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const C = CACHE || (CACHE = buildStatic(W, H_));
      const { pk, WL, hmax, mw, mh, trail, tlx, tly } = C;
      const seg = (a, b) => H.clamp((t - a) / (b - a));
      const INKC = '#1E1A16';

      // slow camera ease-in toward the trail across the whole shot
      ctx.save();
      const push = 1 + 0.02 * H.ease.inOut(seg(0.8, 7));
      const fxp = 640, fyp = 360;
      ctx.translate(fxp, fyp); ctx.scale(push, push); ctx.translate(-fxp, -fyp);

      ctx.drawImage(C.paperL, 0, 0);

      // ---- grey plate: hillshade ----
      const gA = seg(0.3, 1.0);
      if (gA > 0) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.85 * gA; ctx.drawImage(C.shadeL, MX0, MY0); ctx.restore(); }
      // ---- green plate: woodland slides into registration ----
      const wA = seg(0.6, 1.3);
      if (wA > 0) { const off = (1 - H.ease.out(wA)) * 7; ctx.save(); ctx.globalAlpha = wA; ctx.drawImage(C.woodL, MX0 + off, MY0 - off * 0.6); ctx.restore(); }
      // ---- blue plate: lake ----
      const bA = seg(0.9, 1.5);
      if (bA > 0) { ctx.save(); ctx.globalAlpha = bA; ctx.drawImage(C.waterL, MX0, MY0); ctx.restore(); }

      // ---- red section grid ----
      const rA = seg(2.4, 3.0);
      if (rA > 0) {
        ctx.save(); ctx.globalAlpha = rA;
        ctx.strokeStyle = 'rgba(190,70,50,0.28)'; ctx.lineWidth = 0.8; ctx.setLineDash([10, 4]);
        for (let x = MX0 + 201; x < MX1; x += 201) { ctx.beginPath(); ctx.moveTo(x, MY0); ctx.lineTo(x, MY1); ctx.stroke(); }
        for (let y = MY0 + 196; y < MY1; y += 196) { ctx.beginPath(); ctx.moveTo(MX0, y); ctx.lineTo(MX1, y); ctx.stroke(); }
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(180,60,45,0.55)'; ctx.font = '600 10px "Inter"'; ctx.textAlign = 'center';
        let sec = 1;
        for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { if ((r * 6 + c) % 2 === 0) ctx.fillText(String(sec), MX0 + 100 + c * 201, MY0 + 30 + r * 196); sec++; }
        ctx.restore();
      }

      // ---- brown plate: contours rise from the shore upward ----
      const rise = seg(1.2, 3.4);
      const visibleL = rise <= 0 ? -1e9 : WL + (hmax - WL + CI) * H.ease.inOut(rise);
      ctx.save();
      ctx.beginPath(); ctx.rect(MX0, MY0, mw, mh);
      for (const b of C.boxes) {
        const c = Math.cos(b.ang), s = Math.sin(b.ang), hw = b.w / 2, hh = b.h / 2;
        const P = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([u, v]) => [b.x + u * c - v * s, b.y + u * s + v * c]);
        ctx.moveTo(...P[0]); P.slice(1).forEach((p) => ctx.lineTo(...p)); ctx.closePath();
      }
      ctx.clip('evenodd');
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      C.levels.forEach((L, k) => {
        if (L > visibleL) return;
        const s = C.segs[k]; if (!s.length) return;
        const idx = C.isIndex(L);
        // the newest ring inks in over a short band
        const fresh = H.clamp((visibleL - L) / (CI * 2.5));
        ctx.strokeStyle = idx ? `rgba(150,88,48,${0.95 * (0.35 + 0.65 * fresh)})` : `rgba(162,100,58,${0.72 * (0.35 + 0.65 * fresh)})`;
        ctx.lineWidth = idx ? 1.45 : 0.65;
        ctx.beginPath();
        for (let q = 0; q < s.length; q += 4) { ctx.moveTo(s[q], s[q + 1]); ctx.lineTo(s[q + 2], s[q + 3]); }
        ctx.stroke();
      });
      ctx.restore();

      // ---- blue linework: shoreline and water lining ripple outward from the shore ----
      if (bA > 0) {
        ctx.lineCap = 'round';
        ctx.strokeStyle = `rgba(52,108,146,${0.95 * bA})`; ctx.lineWidth = 1.3; ctx.beginPath();
        for (let q = 0; q < C.shore.length; q += 4) { ctx.moveTo(C.shore[q], C.shore[q + 1]); ctx.lineTo(C.shore[q + 2], C.shore[q + 3]); } ctx.stroke();
        C.ws.forEach((s, k) => {
          const a = seg(1.2 + k * 0.12, 1.5 + k * 0.12); if (a <= 0) return;
          ctx.strokeStyle = `rgba(63,127,166,${(0.75 - k * 0.1) * a})`; ctx.lineWidth = 0.6; ctx.beginPath();
          for (let q = 0; q < s.length; q += 4) { ctx.moveTo(s[q], s[q + 1]); ctx.lineTo(s[q + 2], s[q + 3]); } ctx.stroke();
        });
      }

      // ---- streams trace downhill from their springs ----
      const sP = seg(2.6, 3.8);
      if (sP > 0) {
        ctx.strokeStyle = 'rgba(52,108,146,0.9)'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        C.streams.forEach((pts, si) => {
          const n = Math.floor(pts.length * H.clamp(sP * 1.15 - si * 0.05));
          for (let q = 1; q < n; q++) {
            const f = q / pts.length;
            ctx.lineWidth = 0.55 + 1.0 * f;
            if (f < 0.22 && (q >> 2) % 3 === 0) continue; // intermittent near the spring
            ctx.beginPath(); ctx.moveTo(...pts[q - 1]); ctx.lineTo(...pts[q]); ctx.stroke();
          }
        });
      }

      // ---- trail walks down from the summit ----
      const tP = H.ease.inOut(seg(3.5, 5.0));
      const nT = Math.floor((trail.length / 2) * tP);
      if (nT > 2) {
        ctx.save();
        ctx.strokeStyle = '#B5352A'; ctx.lineWidth = 1.7; ctx.setLineDash([6, 4]); ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(trail[0], trail[1]);
        for (let q = 2; q < nT * 2; q += 2) ctx.lineTo(trail[q], trail[q + 1]);
        ctx.stroke(); ctx.restore();
        ctx.fillStyle = '#B5352A'; ctx.beginPath(); ctx.arc(trail[0], trail[1], 2.6, 0, 7); ctx.fill();
        // walker: leads the drawing, then keeps hiking the route on a loop
        const hikeS = t < 5.0 ? nT - 1 : Math.floor(((t - 5.0) * 0.18 % 1) * (trail.length / 2 - 1));
        const hx = trail[hikeS * 2], hy = trail[hikeS * 2 + 1];
        ctx.fillStyle = 'rgba(238,229,203,0.9)'; ctx.beginPath(); ctx.arc(hx, hy, 4.4, 0, 7); ctx.fill();
        ctx.fillStyle = '#B5352A'; ctx.beginPath(); ctx.arc(hx, hy, 3, 0, 7); ctx.fill();
      }

      // ---- contour numbers ink with their level ----
      ctx.font = '600 10px "Inter"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      C.labels.forEach((lb) => {
        const a = H.clamp((visibleL - lb.L) / (CI * 2)); if (a <= 0) return;
        ctx.fillStyle = `rgba(140,80,42,${a})`;
        ctx.save(); ctx.translate(lb.x, lb.y); ctx.rotate(lb.ang); ctx.fillText(lb.txt, 0, 0.5); ctx.restore();
      });

      // ---- black plate, part 2: names & symbols land after the relief ----
      ctx.textBaseline = 'alphabetic';
      const nA = seg(3.2, 3.7);
      if (nA > 0) {
        ctx.save(); ctx.globalAlpha = nA;
        ctx.fillStyle = INKC; ctx.strokeStyle = INKC; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pk[0], pk[1] - 5); ctx.lineTo(pk[0] + 5, pk[1] + 4); ctx.lineTo(pk[0] - 5, pk[1] + 4); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.arc(pk[0], pk[1] + 1, 1, 0, 7); ctx.fill();
        ctx.font = '700 13px "Libre Baskerville"';
        const str = 'MOUNT COMPUTE';
        ctx.save(); ctx.strokeStyle = 'rgba(238,229,203,0.8)'; ctx.lineWidth = 3;
        let w = 0; for (const ch of str) w += ctx.measureText(ch).width + 3; w -= 3;
        let cx = pk[0] - w / 2; const y0 = pk[1] - 14;
        for (const ch of str) { ctx.strokeText(ch, cx, y0); cx += ctx.measureText(ch).width + 3; }
        ctx.restore();
        ctx.fillStyle = INKC; spacedText(ctx, str, pk[0], pk[1] - 14, 3, 'center');
        ctx.font = '400 10px "Libre Baskerville"'; ctx.textAlign = 'left'; ctx.fillText(String(Math.round(hmax)), pk[0] + 9, pk[1] + 9);
        ctx.font = '400 10px "Libre Baskerville"'; ctx.fillStyle = INKC; ctx.textAlign = 'left';
        C.spots.forEach(([x, y, h]) => { ctx.fillText('×', x - 3, y + 3); ctx.fillText(String(Math.round(h)), x + 6, y + 4); });
        ctx.restore();
      }
      const lA = seg(1.6, 2.1);
      if (lA > 0) {
        ctx.save(); ctx.globalAlpha = lA;
        ctx.font = 'italic 400 14px "Libre Baskerville"'; ctx.fillStyle = '#2C6D96'; ctx.textAlign = 'center';
        spacedText(ctx, 'Local Minimum Lake', 330, 405, 1.5, 'center');
        ctx.font = 'italic 400 11px "Libre Baskerville"';
        ctx.fillText('Elev ' + Math.round(WL), 330, 422);
        ctx.restore();
      }
      const trA = seg(4.4, 4.9);
      if (trA > 0 && tlx) {
        ctx.save(); ctx.globalAlpha = trA; ctx.font = 'italic 400 11px "Libre Baskerville"'; ctx.fillStyle = '#8E2A22'; ctx.textAlign = 'left';
        ctx.strokeStyle = 'rgba(238,229,203,0.85)'; ctx.lineWidth = 3;
        ctx.strokeText('Gradient Descent Trail', tlx + 10, tly - 6); ctx.fillText('Gradient Descent Trail', tlx + 10, tly - 6);
        ctx.restore();
      }

      // ---- black plate, part 1: neatline, graticule and collar (printed first) ----
      const kA = seg(0, 0.6);
      ctx.save(); ctx.globalAlpha = kA;
      ctx.strokeStyle = INKC; ctx.lineWidth = 1.2; ctx.strokeRect(MX0 + 0.5, MY0 + 0.5, mw, mh);
      ctx.lineWidth = 0.6; ctx.strokeRect(MX0 - 3.5, MY0 - 3.5, mw + 8, mh + 8);
      ctx.font = '400 9px "Inter"'; ctx.fillStyle = INKC; ctx.lineWidth = 1;
      for (let k = 1; k < 4; k++) {
        const x = MX0 + mw * k / 4;
        ctx.beginPath(); ctx.moveTo(x, MY0); ctx.lineTo(x, MY0 + 8); ctx.moveTo(x, MY1); ctx.lineTo(x, MY1 - 8); ctx.stroke();
        ctx.textAlign = 'center'; ctx.fillText(['122°20′', '122°17′30″', '122°15′'][k - 1], x, MY0 - 7);
      }
      for (let k = 1; k < 3; k++) {
        const y = MY0 + mh * k / 3;
        ctx.beginPath(); ctx.moveTo(MX0, y); ctx.lineTo(MX0 + 8, y); ctx.moveTo(MX1, y); ctx.lineTo(MX1 - 8, y); ctx.stroke();
      }
      ctx.textAlign = 'left'; ctx.fillText('37°52′30″  122°22′30″', MX0, MY0 - 7);
      ctx.textAlign = 'right'; ctx.fillText('122°12′30″', MX1, MY0 - 7);
      ctx.font = '400 9px "Inter"'; ctx.textAlign = 'left';
      spacedText(ctx, 'THE MODEL SURVEY', 489, 16, 2, 'center');
      spacedText(ctx, 'TRAINING SERIES', 1093, 16, 2, 'center');
      ctx.restore();

      // collar text sets in shortly after the frame
      const cA = seg(0.25, 0.9);
      const cy0 = MY1 + 10;
      ctx.save(); ctx.globalAlpha = cA;
      ctx.textAlign = 'left'; ctx.fillStyle = INKC; ctx.font = '400 9px "Inter"';
      ctx.fillText('Mapped, edited and published by the Model Survey', MX0, cy0 + 18);
      ctx.fillText('Topography compiled from imagined stereo pairs, 2026', MX0, cy0 + 31);
      ctx.fillText('Red tint: township and section lines', MX0, cy0 + 44);
      ctx.fillText('Illustrative map. Not for navigation', MX0, cy0 + 57);
      {
        const ax = 380, ay = cy0 + 62;
        ctx.strokeStyle = INKC; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay - 50); ctx.stroke();
        ctx.save(); ctx.translate(ax, ay - 55); ctx.beginPath();
        for (let q = 0; q < 10; q++) { const r = q % 2 ? 2.2 : 5.5, a = -Math.PI / 2 + q * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); ctx.restore();
        const mxp = ax + Math.sin(0.24) * 46, myp = ay - Math.cos(0.24) * 46;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(mxp, myp); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mxp, myp); ctx.lineTo(mxp - 1.5, myp + 10); ctx.lineTo(mxp + 3, myp + 9); ctx.closePath(); ctx.fill();
        ctx.font = '400 9px "Inter"'; ctx.textAlign = 'left';
        ctx.fillText('MN', mxp + 4, myp + 4); ctx.fillText('14°', ax + 5, ay - 6);
      }
      {
        const sx = 520, sy = cy0 + 36, unit = 60;
        ctx.textAlign = 'center'; ctx.fillStyle = INKC;
        ctx.font = '700 13px "Libre Baskerville"'; spacedText(ctx, 'SCALE 1:24 000', sx + unit * 1.5, cy0 + 16, 1.5, 'center');
        ctx.lineWidth = 0.8; ctx.strokeStyle = INKC;
        for (let k = 0; k < 4; k++) { ctx.fillStyle = k % 2 ? INKC : PAPER; ctx.fillRect(sx - unit + k * unit / 4, sy, unit / 4, 5); }
        for (let k = 0; k < 3; k++) { ctx.fillStyle = k % 2 ? PAPER : INKC; ctx.fillRect(sx + k * unit, sy, unit, 5); }
        ctx.strokeRect(sx - unit, sy, unit * 4, 5);
        ctx.fillStyle = INKC; ctx.font = '400 9px "Inter"';
        ['1', '0', '1', '2', '3'].forEach((s, k) => ctx.fillText(s, sx - unit + k * unit, sy + 16));
        ctx.fillText('KILOMETERS', sx + unit * 3 + 34, sy + 5);
        ctx.font = '400 10px "Libre Baskerville"';
        spacedText(ctx, 'CONTOUR INTERVAL 40 METERS', sx + unit * 1, sy + 34, 1.2, 'center');
      }
      ctx.textAlign = 'right'; ctx.fillStyle = INKC;
      ctx.font = '700 22px "Libre Baskerville"'; spacedText(ctx, 'MOUNT COMPUTE', MX1, cy0 + 30, 3, 'right');
      ctx.font = '400 10px "Libre Baskerville"';
      spacedText(ctx, 'LOSS LANDSCAPE QUADRANGLE', MX1, cy0 + 47, 1.6, 'right');
      ctx.font = '400 9px "Inter"';
      spacedText(ctx, '7.5-MINUTE SERIES (TOPOGRAPHIC) · 2026', MX1, cy0 + 62, 0.8, 'right');
      ctx.restore();

      // ---- age: fold crease, foxing ----
      ctx.save();
      const fx = 640;
      const gfold = ctx.createLinearGradient(fx - 10, 0, fx + 10, 0);
      gfold.addColorStop(0, 'rgba(255,255,255,0)'); gfold.addColorStop(0.45, 'rgba(255,255,255,0.18)');
      gfold.addColorStop(0.55, 'rgba(90,70,40,0.10)'); gfold.addColorStop(1, 'rgba(90,70,40,0)');
      ctx.fillStyle = gfold; ctx.fillRect(fx - 10, -20, 20, H_ + 40);
      ctx.globalCompositeOperation = 'multiply';
      const fr = H.rng(77);
      for (let k = 0; k < 7; k++) {
        const x = fr.range(0, W), y = fr.range(0, H_), r = fr.range(30, 140);
        const gg = ctx.createRadialGradient(x, y, 0, x, y, r);
        gg.addColorStop(0, 'rgba(180,150,100,0.10)'); gg.addColorStop(0.8, 'rgba(180,150,100,0.04)'); gg.addColorStop(1, 'rgba(180,150,100,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
      ctx.restore();
      ctx.restore(); // camera
      H.vignette(ctx, W, H_, 0.18, '80,60,30');
      H.grain(ctx, W, H_, 0.035, 31 + Math.floor(t * 12));
    },
    // Sound: a surveyor's sheet out in the open. A light wind under everything, a draughting pen ticks each
    // survey × onto the sheet, the terrain rises as a slow low swell, the lake laps in, and the hiker's boots
    // crunch gravel step by step down the trail (steps follow the eased hike). Times mirror explainer() below.
    explainerSound(k) {
      const D = 15, io = H.ease.inOut;
      const seg = (t, a, b) => H.clamp((t - a) / (b - a));
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.6;
      // draughting pen on the sheet
      const pen = (a, b, g = 1, p = 0, minor = true) => { k.noise(a, { dur: 0.016, filter: 'bandpass', f: 1500, q: 1.3, gain: 0.12 * g, a: 0.001, pan: p, minor }); k.play('stroke', a, { material: 'pen', dur: b - a, gain: 2.0 * g, pan: p, minor }); };
      const nib = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.018, filter: 'bandpass', f: 2200, q: 1.5, gain: 0.16 * g, a: 0.001, pan: p }); k.noise(t + 0.03, { dur: 0.016, filter: 'bandpass', f: 1900, q: 1.5, gain: 0.12 * g, a: 0.001, pan: p }); });
      // a boot on gravel
      const step = (t, g = 1, p = 0) => k.withMinor(() => {
        k.noise(t, { dur: 0.08, color: 'pink', filter: 'bandpass', f: 850, q: 0.7, gain: 0.22 * g, a: 0.004, pan: p });
        k.noise(t + 0.012, { dur: 0.06, filter: 'bandpass', f: 1800, q: 1, gain: 0.07 * g, a: 0.003, pan: p });
        k.tone(t, { f: [[0, 95], [0.05, 55]], dur: 0.08, gain: 0.12 * g, pan: p });
      });
      // a soft wooden note for type landing in the collar / cartouches
      const wood = (t, f, g = 1, p = 0, minor = true) => { k.tone(t, { f, dur: 0.5, gain: 0.07 * g, a: 0.006, pan: p, minor }); k.tone(t, { f: k.hz(f) * 4, dur: 0.08, gain: 0.012 * g, a: 0.002, pan: p, minor }); };
      const tick = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.016, filter: 'bandpass', f: 1700, q: 1.8, gain: 0.18 * g, a: 0.001, pan: p }); k.tone(t, { f: 200, dur: 0.025, gain: 0.04 * g, pan: p }); });

      k.bed('room', 0, D, { gain: 0.25 });
      // light open-air wind, slow gusts
      k.withMinor(() => { for (let t = 0, i = 0; t < D; t += 1.2, i++) k.noise(t, { dur: 2.2, color: 'pink', filter: 'bandpass', f: 380 + 120 * Math.sin(i * 1.7), q: 0.6, gain: 0.035 + 0.015 * Math.sin(i * 2.3), a: 1.0, pan: Math.sin(i * 0.9) * 0.4 }); });

      // ---- the question in a cartouche, its subtitle, then it docks into the collar (1.5 -> 2.4)
      wood(0.05, 'D3', 1.2, 0, false);
      wood(0.5, 'A3', 0.7);
      k.noise(1.5, { dur: 0.9, color: 'brown', filter: 'bandpass', f: [[0, 260], [0.9, 380]], q: 0.6, gain: 0.08, a: 0.35, pan: 0.4, minor: true });

      // ---- data: survey points plotted (accelerating), terrain rises, woods, lake
      wood(2.05, 'G3', 0.7, -0.6); // EXAMPLES SURVEYED box
      { // one pen × per new point, throttled to 12/s; shown = 260 * ease.in(seg(2.0, 5.4))^0.7
        let last = 0, lastT = -1;
        for (let t = 2.0; t <= 5.4; t += 1 / 120) {
          const n = Math.floor(260 * Math.pow(H.ease.in(seg(t, 2.0, 5.4)), 0.7));
          if (n > last && t - lastT >= 1 / 12) { const r = H.rng(515 + n)(); nib(t, 0.7 + 0.3 * seg(t, 2, 5.4), (r - 0.5) * 1.2); last = n; lastT = t; }
        }
      }
      k.noise(2.2, { dur: 3.8, color: 'brown', filter: 'lowpass', f: [[0, 120], [3.0, 380], [3.8, 200]], gain: 0.2, a: 2.6 }); // the land rises
      k.withMinor(() => { for (let t = 4.2, i = 0; t < 5.6; t += 0.35, i++) k.noise(t, { dur: 0.6, color: 'pink', filter: 'bandpass', f: 500 + (i % 3) * 90, q: 1.4, gain: 0.05, a: 0.25, pan: pan(300) }); }); // the lake laps in
      tick(5.6, 1.2, -0.6); // 1,000,000 surveyed
      k.play('tock', 5.6, { f: 300, gain: 0.45, pan: -0.6 });
      wood(5.25, 'E3', 0.9, 0.1); // HIGH ERROR / Low error lettered

      // ---- camera to the summit; the hiker
      k.noise(6.2, { dur: 0.9, color: 'pink', filter: 'bandpass', f: [[0, 280], [0.45, 560], [0.9, 260]], q: 0.7, gain: 0.09, a: 0.4 });
      step(6.7, 0.8); // the hiker sets down at the summit
      wood(6.85, 'G3', 0.6, -0.4); // GUESS → CHECK → ADJUST legend
      pen(7.0, 7.3, 0.9, 0.2); // guess: "dog?"
      pen(7.25, 7.35, 1.6, 0.3, false); pen(7.35, 7.45, 1.6, 0.3, false); // red ✗
      k.tone(7.25, { f: 'D3', type: 'triangle', dur: 0.3, gain: 0.17, hold: 0.08, filter: 'lowpass', f2: 800, pan: 0.3 });
      k.tone(7.43, { f: 'A2', type: 'triangle', dur: 0.5, gain: 0.17, hold: 0.12, filter: 'lowpass', f2: 600, pan: 0.3 });
      pen(7.45, 7.8, 1.0, 0); // ring round the hiker
      pen(7.6, 8.3, 0.7, -0.1); // check: slope arrow drawn downhill
      // adjust: first leg down 8.4 -> 9.4, five steps
      for (let i = 1; i <= 5; i++) step(when(8.4, 9.4, io, i / 5 - 0.1), 0.9, -0.1 + i * 0.04);
      pen(9.5, 9.8, 0.9, 0.1); // guess: "cat"
      pen(9.75, 9.95, 1.2, 0.2, false); // blue tick
      ['G4', 'D5'].forEach((f, i) => k.play('ding', 9.82 + i * 0.08, { f, gain: 0.4, pan: 0.2 })); // right

      // ---- camera out; accuracy cartouche; the hike down to the lake (10.8 -> 12.8)
      k.noise(10.6, { dur: 1.1, color: 'pink', filter: 'bandpass', f: [[0, 260], [0.5, 520], [1.1, 240]], q: 0.7, gain: 0.09, a: 0.5 });
      wood(10.85, 'G3', 0.7, -0.6);
      { let lastT = -1; for (let f = 0.06; f < 1; f += 0.06) { const t = when(10.8, 12.8, io, f); if (t - lastT >= 0.11) { step(t, 0.75, pan(H.lerp(560, 330, f))); lastT = t; } } }
      { let last = -1, lastT = -1; for (let t = 10.9; t <= 12.8 + 1e-6; t += 1 / 120) { const v = Math.round(61 + 36 * io(seg(t, 10.9, 12.8))); if (v !== last && t - lastT >= 1 / 12) { tick(t, 0.9, -0.6); last = v; lastT = t; } } }
      // the hiker reaches the lake as 97% turns red: the big hit; the ring is penned round the lake
      k.play('impact', 12.8, { gain: 0.8, pan: pan(300) });
      k.play('ding', 12.82, { f: 'D5', gain: 0.6, pan: -0.4 });
      k.noise(12.85, { dur: 0.9, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.9, 400]], q: 1.2, gain: 0.07, a: 0.08, pan: pan(300), verb: 0.3 }); // water at the shore
      pen(12.85, 13.3, 1.2, pan(300), false); // red ring round the lake (drawing since 12.6)
      // takeaway cartouche settles, then resolves
      wood(13.3, 'D3', 1.0);
      ['D4', 'A4', 'F#5'].forEach((f, i) => k.play('ding', 13.5 + i * 0.09, { f, gain: 0.36 - i * 0.06, pan: (i - 1) * 0.25 }));
    },
    explainerDuration: 15,
    explainerNote: 'The loss landscape is literally the map: survey points (examples) raise the terrain, a red hiker guesses, checks the slope and steps down a dashed switchback trail while the camera pans along it, and accuracy is lettered in a map cartouche like an elevation figure.',
    explainer(ctx, W, H_, t) {
      const C = CACHE || (CACHE = buildStatic(W, H_));
      const { pk, WL, hmax, mw, mh, trail } = C;
      const seg = (a, b) => H.clamp((t - a) / (b - a));
      const INKC = '#1E1A16', RED = '#B5352A';
      const nTrail = trail.length / 2;
      const TP = (f) => { const i = Math.min(nTrail - 1, Math.max(0, Math.round(f * (nTrail - 1)))); return [trail[i * 2], trail[i * 2 + 1]]; };
      // hiker position along the trail (fraction) over time
      const STEP1 = 0.2;
      const hikeF = t < 8.4 ? 0 : t < 9.4 ? STEP1 * H.ease.inOut(seg(8.4, 9.4)) : t < 10.8 ? STEP1 : STEP1 + (1 - STEP1) * H.ease.inOut(seg(10.8, 12.8));
      const hiker = TP(hikeF);

      // ---- camera keyframes (scale, centre) ----
      const K = [
        [0, 1, 640, 360], [6.2, 1, 640, 360], [7.0, 2.3, pk[0] - 40, pk[1] + 40], [8.3, 2.3, pk[0] - 40, pk[1] + 40],
        [9.4, 2.3, TP(STEP1)[0] + 20, TP(STEP1)[1] - 10], [10.6, 2.3, TP(STEP1)[0] + 20, TP(STEP1)[1] - 10],
        [11.6, 1.2, 600, 330], [13.0, 1, 640, 360], [15, 1, 640, 360],
      ];
      let cam = K[K.length - 1];
      for (let i = 0; i < K.length - 1; i++) if (t >= K[i][0] && t <= K[i + 1][0]) {
        const u = H.ease.inOut((t - K[i][0]) / (K[i + 1][0] - K[i][0]));
        cam = [t, H.lerp(K[i][1], K[i + 1][1], u), H.lerp(K[i][2], K[i + 1][2], u), H.lerp(K[i][3], K[i + 1][3], u)];
        break;
      }
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H_);
      ctx.save();
      ctx.translate(W / 2, H_ / 2); ctx.scale(cam[1], cam[1]); ctx.translate(-cam[2], -cam[3]);
      ctx.drawImage(C.paperL, 0, 0);

      // ---- data raises the terrain: hillshade, woods, lake and contours emerge as points are surveyed ----
      const dataP = seg(2.2, 5.8);
      if (dataP > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.85 * H.ease.inOut(dataP); ctx.drawImage(C.shadeL, MX0, MY0); ctx.restore();
        ctx.save(); ctx.globalAlpha = seg(3.6, 5.0); ctx.drawImage(C.woodL, MX0, MY0); ctx.restore();
        ctx.save(); ctx.globalAlpha = seg(4.2, 5.2); ctx.drawImage(C.waterL, MX0, MY0); ctx.restore();
      }
      const visibleL = dataP <= 0 ? -1e9 : WL + (hmax - WL + CI) * H.ease.inOut(seg(3.0, 6.0));
      ctx.lineCap = 'round';
      // contours break around their index numerals, as on the printed quad (same knockout boxes as the still)
      ctx.save();
      ctx.beginPath(); ctx.rect(MX0, MY0, mw, mh);
      for (const b of C.boxes) {
        const c = Math.cos(b.ang), s = Math.sin(b.ang), hw = b.w / 2, hh = b.h / 2;
        const P = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([u, v]) => [b.x + u * c - v * s, b.y + u * s + v * c]);
        ctx.moveTo(...P[0]); P.slice(1).forEach((p) => ctx.lineTo(...p)); ctx.closePath();
      }
      ctx.clip('evenodd');
      C.levels.forEach((L, k) => {
        if (L > visibleL) return;
        const s = C.segs[k]; if (!s.length) return;
        const idx = C.isIndex(L);
        ctx.strokeStyle = idx ? 'rgba(150,88,48,0.95)' : 'rgba(162,100,58,0.72)';
        ctx.lineWidth = (idx ? 1.45 : 0.65) / Math.sqrt(cam[1]);
        ctx.beginPath();
        for (let q = 0; q < s.length; q += 4) { ctx.moveTo(s[q], s[q + 1]); ctx.lineTo(s[q + 2], s[q + 3]); }
        ctx.stroke();
      });
      ctx.restore();
      // index contour numerals ink with their level (uphill-reading, from the still's placement)
      if (dataP > 0) {
        ctx.save(); ctx.font = '600 10px "Inter"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        C.labels.forEach((lb) => {
          const a = H.clamp((visibleL - lb.L) / (CI * 2)); if (a <= 0) return;
          ctx.fillStyle = `rgba(140,80,42,${a})`;
          ctx.save(); ctx.translate(lb.x, lb.y); ctx.rotate(lb.ang); ctx.fillText(lb.txt, 0, 0.5); ctx.restore();
        });
        ctx.restore();
      }
      // blue streams run down to the lake once it fills (drawn with the lake's own fade)
      const stA = seg(4.6, 5.4);
      if (stA > 0) {
        ctx.save(); ctx.globalAlpha = stA; ctx.strokeStyle = 'rgba(52,108,146,0.9)'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        C.streams.forEach((pts) => {
          for (let q = 1; q < pts.length; q++) {
            const f = q / pts.length;
            if (f < 0.22 && (q >> 2) % 3 === 0) continue; // intermittent near the spring
            ctx.lineWidth = (0.55 + 1.0 * f) / Math.sqrt(cam[1]);
            ctx.beginPath(); ctx.moveTo(...pts[q - 1]); ctx.lineTo(...pts[q]); ctx.stroke();
          }
        });
        ctx.restore();
      }
      if (seg(4.2, 5.2) > 0) {
        ctx.strokeStyle = `rgba(52,108,146,${0.95 * seg(4.2, 5.2)})`; ctx.lineWidth = 1.3; ctx.beginPath();
        for (let q = 0; q < C.shore.length; q += 4) { ctx.moveTo(C.shore[q], C.shore[q + 1]); ctx.lineTo(C.shore[q + 2], C.shore[q + 3]); } ctx.stroke();
        C.ws.forEach((s, k) => {
          ctx.strokeStyle = `rgba(63,127,166,${(0.75 - k * 0.1) * seg(4.4 + k * 0.1, 5.0 + k * 0.1)})`; ctx.lineWidth = 0.6; ctx.beginPath();
          for (let q = 0; q < s.length; q += 4) { ctx.moveTo(s[q], s[q + 1]); ctx.lineTo(s[q + 2], s[q + 3]); } ctx.stroke();
        });
      }

      // ---- survey points = labelled examples, plotted rapidly ----
      const NPTS = 260, pr = H.rng(515);
      const shown = Math.floor(NPTS * H.ease.in(seg(2.0, 5.4)) ** 0.7);
      const ptsAlpha = 1 - 0.85 * seg(6.0, 6.8);
      const xCol = H.rgba(H.mix('#1E1A16', '#6b5a48', seg(6.0, 6.8)), 1), xArm = 4 / Math.sqrt(cam[1]);
      ctx.font = 'italic 700 24px "Libre Baskerville"'; ctx.textAlign = 'left';
      for (let i = 0; i < NPTS; i++) {
        const x = pr.range(MX0 + 30, MX1 - 30), y = pr.range(MY0 + 30, MY1 - 30), cat = pr.chance(0.5);
        if (i >= shown) continue;
        const fresh = false;
        ctx.globalAlpha = ptsAlpha;
        ctx.strokeStyle = xCol; ctx.lineCap = 'round';
        ctx.lineWidth = 1.6 / cam[1]; ctx.beginPath(); ctx.moveTo(x - xArm, y - xArm); ctx.lineTo(x + xArm, y + xArm); ctx.moveTo(x + xArm, y - xArm); ctx.lineTo(x - xArm, y + xArm); ctx.stroke();
        if (i < 8 && x > MX0 + 150 && y > MY0 + 140 && t < 6.3) {
          ctx.globalAlpha = 1 - seg(5.8, 6.3);
          ctx.save(); ctx.strokeStyle = 'rgba(238,229,203,0.95)'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.strokeText(cat ? 'cat' : 'dog', x + 8, y - 6);
          ctx.restore(); ctx.fillStyle = cat ? '#2C6D96' : '#8E2A22'; ctx.fillText(cat ? 'cat' : 'dog', x + 8, y - 6);
        }
        ctx.globalAlpha = 1;
      }

      // ---- landscape labels land on the terrain ----
      const labA = seg(5.2, 5.8) * (1 - seg(10.6, 11.0) * 0);
      if (labA > 0) {
        ctx.save(); ctx.globalAlpha = labA; ctx.fillStyle = INKC; ctx.font = `700 ${(30 / Math.pow(cam[1], 0.7)).toFixed(1)}px "Libre Baskerville"`;
        ctx.strokeStyle = 'rgba(238,229,203,0.9)'; ctx.lineWidth = 5;
        const lab = (s, x, y) => { ctx.save(); ctx.lineJoin = 'round'; let w = 0; for (const ch of s) w += ctx.measureText(ch).width + 2.5; let cx = x - w / 2; for (const ch of s) { ctx.strokeText(ch, cx, y); cx += ctx.measureText(ch).width + 2.5; } ctx.restore(); spacedText(ctx, s, x, y, 2.5, 'center'); };
        lab('HIGH ERROR', pk[0], pk[1] - 22);
        // spot heights, in the still's small survey type
        ctx.save(); ctx.fillStyle = INKC;
        ctx.font = '400 10px "Libre Baskerville"'; ctx.textAlign = 'left';
        C.spots.forEach(([x, y, h]) => { ctx.fillText('×', x - 3, y + 3); ctx.fillText(String(Math.round(h)), x + 6, y + 4); });
        ctx.restore();
        ctx.font = 'italic 700 32px "Libre Baskerville"'; ctx.fillStyle = '#2C6D96';
        spacedText(ctx, 'Low error', 300, 410, 1.5, 'center');
        ctx.restore();
      }

      // ---- the trail: guess, check, adjust ----
      const nDrawn = Math.floor(nTrail * hikeF);
      if (nDrawn > 2) {
        ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 1.7 / Math.sqrt(cam[1]) * 1.3; ctx.setLineDash([6, 4]); ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(trail[0], trail[1]);
        for (let q = 1; q < nDrawn; q++) ctx.lineTo(trail[q * 2], trail[q * 2 + 1]);
        ctx.stroke(); ctx.restore();
      }
      const hikerA = seg(6.6, 7.0);
      const halo = (str, x, y, col) => { ctx.save(); ctx.strokeStyle = 'rgba(238,229,203,0.92)'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); ctx.restore(); ctx.fillStyle = col; ctx.fillText(str, x, y); };
      if (hikerA > 0) {
        // guess #1 at the summit
        const [gx, gy] = TP(0);
        const g1 = seg(7.0, 7.3) * (1 - seg(8.3, 8.6));
        if (g1 > 0) {
          ctx.save(); ctx.globalAlpha = g1; ctx.font = 'italic 700 13.5px "Libre Baskerville"'; ctx.textAlign = 'left';
          halo('guess: “dog?”', gx + 26, gy - 14, INKC);
          // red ✗ and a hand-drawn ring for emphasis
          const xA = seg(7.25, 7.45), xx = gx + 26 + ctx.measureText('guess: “dog?”').width + 8, xy = gy - 24;
          ctx.strokeStyle = RED; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(xx, xy); ctx.lineTo(xx + 10 * H.clamp(xA * 2), xy + 10 * H.clamp(xA * 2));
          if (xA > 0.5) { ctx.moveTo(xx + 10, xy); ctx.lineTo(xx + 10 - 10 * (xA * 2 - 1), xy + 10 * (xA * 2 - 1)); } ctx.stroke();
          const rr = seg(7.35, 7.8), r0 = H.rng(9);
          ctx.lineWidth = 1.4; ctx.beginPath();
          for (let k = 0; k <= 40 * rr; k++) { const a = -2.2 + k / 40 * 7.0, r = 20 + Math.sin(k * 0.4) * 1.2 + k * 0.08; const px = gx + Math.cos(a) * r * 1.15, py = gy + Math.sin(a) * r; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
          ctx.stroke();
          ctx.restore();
        }
        // check: slope arrow drawn on, pointing downhill along the first leg
        const ck = seg(7.6, 8.3) * (1 - seg(8.6, 8.9));
        if (ck > 0) {
          const [ax, ay] = TP(0.01), [bx, by] = TP(STEP1 * 0.92);
          const ex = H.lerp(ax, bx, ck), ey = H.lerp(ay, by, ck);
          ctx.save(); ctx.strokeStyle = RED; ctx.fillStyle = RED; ctx.lineWidth = 2; ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
          const an = Math.atan2(by - ay, bx - ax);
          ctx.beginPath(); ctx.moveTo(ex + Math.cos(an) * 6, ey + Math.sin(an) * 6); ctx.lineTo(ex + Math.cos(an + 2.5) * 7, ey + Math.sin(an + 2.5) * 7); ctx.lineTo(ex + Math.cos(an - 2.5) * 7, ey + Math.sin(an - 2.5) * 7); ctx.closePath(); ctx.fill();
          ctx.font = 'italic 700 13.5px "Libre Baskerville"'; ctx.textAlign = 'left';
          halo('check: downhill', (ax + bx) / 2 + 14, (ay + by) / 2 + 4, RED);
          ctx.restore();
        }
        // adjust label while walking
        const adj = seg(8.4, 8.7) * (1 - seg(9.7, 10.0));
        if (adj > 0) { ctx.save(); ctx.globalAlpha = adj; ctx.font = 'italic 700 13.5px "Libre Baskerville"'; ctx.textAlign = 'left'; halo('adjust: step down', hiker[0] + 12, hiker[1] + 18, INKC); ctx.restore(); }
        // guess #2: lower, better
        const g2 = seg(9.5, 9.8) * (1 - seg(10.9, 11.2));
        if (g2 > 0) {
          const [hx, hy] = TP(STEP1);
          ctx.save(); ctx.globalAlpha = g2; ctx.font = 'italic 700 13.5px "Libre Baskerville"'; ctx.textAlign = 'left';
          halo('guess: “cat”', hx + 12, hy - 12, INKC);
          ctx.strokeStyle = '#2C6D96'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          const v = seg(9.7, 9.95);
          ctx.beginPath(); ctx.moveTo(hx + 92, hy - 17); ctx.lineTo(hx + 96, hy - 12);
          if (v > 0.4) ctx.lineTo(hx + 96 + 8 * (v - 0.4) / 0.6, hy - 12 - 12 * (v - 0.4) / 0.6);
          ctx.stroke(); ctx.restore();
        }
        // hiker marker
        ctx.save(); ctx.globalAlpha = hikerA;
        ctx.fillStyle = 'rgba(238,229,203,0.95)'; ctx.beginPath(); ctx.arc(hiker[0], hiker[1], 5.5, 0, 7); ctx.fill();
        ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(hiker[0], hiker[1], 3.8, 0, 7); ctx.fill();
        ctx.restore();
      }
      // final emphasis: red ring around the lake = the low-error goal
      const ring = seg(12.6, 13.3);
      if (ring > 0) {
        ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 2; ctx.beginPath();
        for (let k = 0; k <= 60 * ring; k++) { const a = -1.4 + k / 60 * 6.6, r = 1 + Math.sin(k * 0.3) * 0.02; const px = 300 + Math.cos(a) * 165 * r, py = 400 + Math.sin(a) * 105 * r; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke(); ctx.restore();
      }

      // ---- neatline + collar (always present: it is the sheet) ----
      ctx.strokeStyle = INKC; ctx.lineWidth = 1.2; ctx.strokeRect(MX0 + 0.5, MY0 + 0.5, mw, mh);
      ctx.lineWidth = 0.6; ctx.strokeRect(MX0 - 3.5, MY0 - 3.5, mw + 8, mh + 8);
      ctx.font = '400 9px "Inter"'; ctx.fillStyle = INKC; ctx.textAlign = 'center';
      spacedText(ctx, 'THE MODEL SURVEY', 489, 16, 2, 'center');
      spacedText(ctx, 'TRAINING SERIES', 1093, 16, 2, 'center');
      const cy0 = MY1 + 10;
      ctx.textAlign = 'left'; ctx.font = '400 9px "Inter"';
      ctx.fillText('Each × is one labelled example', MX0, cy0 + 18);
      ctx.fillText('Elevation = how wrong the model is', MX0, cy0 + 31);
      ctx.fillText('Red dashes: the path of training', MX0, cy0 + 44);
      ctx.fillText('Illustrative map. Not for navigation', MX0, cy0 + 57);
      // sheet furniture from the still: graticule ticks and corner coordinates, north arrow, scale bar
      ctx.lineWidth = 1;
      for (let k = 1; k < 4; k++) {
        const x = MX0 + mw * k / 4;
        ctx.beginPath(); ctx.moveTo(x, MY0); ctx.lineTo(x, MY0 + 8); ctx.moveTo(x, MY1); ctx.lineTo(x, MY1 - 8); ctx.stroke();
      }
      for (let k = 1; k < 3; k++) {
        const y = MY0 + mh * k / 3;
        ctx.beginPath(); ctx.moveTo(MX0, y); ctx.lineTo(MX0 + 8, y); ctx.moveTo(MX1, y); ctx.lineTo(MX1 - 8, y); ctx.stroke();
      }
      ctx.textAlign = 'left'; ctx.fillText('37°52′30″  122°22′30″', MX0, MY0 - 9);
      ctx.textAlign = 'right'; ctx.fillText('122°12′30″', MX1, MY0 - 9);
      {
        const ax = 380, ay = cy0 + 64;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay - 44); ctx.stroke();
        ctx.save(); ctx.translate(ax, ay - 49); ctx.beginPath();
        for (let q = 0; q < 10; q++) { const r = q % 2 ? 2.2 : 5.5, a = -Math.PI / 2 + q * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); ctx.restore();
        const mxp = ax + Math.sin(0.24) * 40, myp = ay - Math.cos(0.24) * 40;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(mxp, myp); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mxp, myp); ctx.lineTo(mxp - 1.5, myp + 10); ctx.lineTo(mxp + 3, myp + 9); ctx.closePath(); ctx.fill();
        ctx.textAlign = 'left'; ctx.fillText('MN', mxp + 4, myp + 4); ctx.fillText('14°', ax + 5, ay - 6);
      }
      {
        const sx = 520, sy = cy0 + 39, unit = 60;
        ctx.font = '700 13px "Libre Baskerville"'; spacedText(ctx, 'SCALE 1:24 000', sx + unit * 1.5, cy0 + 21, 1.5, 'center');
        ctx.lineWidth = 0.8;
        for (let k = 0; k < 4; k++) { ctx.fillStyle = k % 2 ? INKC : PAPER; ctx.fillRect(sx - unit + k * unit / 4, sy, unit / 4, 5); }
        for (let k = 0; k < 3; k++) { ctx.fillStyle = k % 2 ? PAPER : INKC; ctx.fillRect(sx + k * unit, sy, unit, 5); }
        ctx.strokeRect(sx - unit, sy, unit * 4, 5);
        ctx.fillStyle = INKC; ctx.font = '400 9px "Inter"'; ctx.textAlign = 'center';
        ['1', '0', '1', '2', '3'].forEach((q, k) => ctx.fillText(q, sx - unit + k * unit, sy + 16));
        ctx.fillText('KILOMETERS', sx + unit * 3 + 34, sy + 5);
        ctx.font = '400 10px "Libre Baskerville"';
        spacedText(ctx, 'CONTOUR INTERVAL 40 METERS', sx + unit * 1, sy + 32, 1.2, 'center');
      }
      // ---- age: fold crease, foxing (the still's pass, so every frame shares the aged sheet) ----
      {
        ctx.save();
        const fx = 640;
        const gfold = ctx.createLinearGradient(fx - 10, 0, fx + 10, 0);
        gfold.addColorStop(0, 'rgba(255,255,255,0)'); gfold.addColorStop(0.45, 'rgba(255,255,255,0.18)');
        gfold.addColorStop(0.55, 'rgba(90,70,40,0.10)'); gfold.addColorStop(1, 'rgba(90,70,40,0)');
        ctx.fillStyle = gfold; ctx.fillRect(fx - 10, -20, 20, H_ + 40);
        ctx.globalCompositeOperation = 'multiply';
        const fr = H.rng(77);
        for (let k = 0; k < 7; k++) {
          const x = fr.range(0, W), y = fr.range(0, H_), r = fr.range(30, 140);
          const gg = ctx.createRadialGradient(x, y, 0, x, y, r);
          gg.addColorStop(0, 'rgba(180,150,100,0.10)'); gg.addColorStop(0.8, 'rgba(180,150,100,0.04)'); gg.addColorStop(1, 'rgba(180,150,100,0)');
          ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore(); // camera

      // ---- the question: a big cartouche title that docks into the collar title block ----
      const dock = H.ease.inOut(seg(1.5, 2.4));
      {
        const x = H.lerp(640, MX1, dock), y = H.lerp(350, MY1 + 40, dock), size = H.lerp(64, 28, dock);
        ctx.save();
        ctx.globalAlpha = seg(0, 0.4) * (1 - seg(1.4, 1.8));
        ctx.fillStyle = 'rgba(238,229,203,0.96)'; ctx.fillRect(170, 236, 940, 190);
        ctx.strokeStyle = INKC; ctx.lineWidth = 1.6; ctx.strokeRect(170.5, 236.5, 940, 190); ctx.lineWidth = 0.8; ctx.strokeRect(177.5, 243.5, 926, 176);
        ctx.globalAlpha = seg(0.1, 0.6);
        ctx.fillStyle = INKC; ctx.font = `700 ${size}px "Libre Baskerville"`;
        spacedText(ctx, 'HOW DOES AI LEARN?', x, y, H.lerp(5, 3, dock), dock > 0.5 ? 'right' : 'center');
        ctx.globalAlpha = seg(0.5, 0.9) * (1 - seg(1.3, 1.6));
        ctx.font = 'italic 400 28px "Libre Baskerville"';
        spacedText(ctx, 'A survey of the loss landscape', 640, 398, 1, 'center');
        ctx.globalAlpha = dock;
        ctx.font = '400 10px "Libre Baskerville"';
        spacedText(ctx, 'LOSS LANDSCAPE QUADRANGLE', MX1, MY1 + 57, 1.6, 'right');
        ctx.restore();
      }

      // ---- cartouches (screen-fixed inset boxes, printed in the map's own type) ----
      const box = (x, y, w, h) => {
        ctx.fillStyle = 'rgba(238,229,203,0.97)'; ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = INKC; ctx.lineWidth = 1.6; ctx.strokeRect(x + 0.5, y + 0.5, w, h); ctx.lineWidth = 0.7; ctx.strokeRect(x + 6.5, y + 6.5, w - 12, h - 12);
      };
      const exA = seg(2.0, 2.3) * (1 - seg(6.2, 6.6));
      if (exA > 0) {
        ctx.save(); ctx.globalAlpha = exA; box(50, 44, 420, 136);
        ctx.fillStyle = INKC; ctx.font = '700 28px "Libre Baskerville"'; spacedText(ctx, 'EXAMPLES SURVEYED', 74, 86, 1, 'left');
        const n = Math.round(1e6 * H.ease.in(seg(2.0, 5.6)) ** 0.8);
        ctx.font = '700 66px "Libre Baskerville"'; ctx.textAlign = 'left'; ctx.fillText(n.toLocaleString('en-US'), 70, 158);
        ctx.restore();
      }
      const lgA = seg(6.8, 7.1) * (1 - seg(10.8, 11.1));
      if (lgA > 0) {
        ctx.save(); ctx.globalAlpha = lgA; box(50, 44, 600, 80);
        const steps = ['GUESS', 'CHECK', 'ADJUST'];
        const active = t < 7.6 ? 0 : t < 8.4 ? 1 : t < 9.5 ? 2 : 0;
        let x = 76;
        steps.forEach((s, i) => {
          ctx.font = '700 28px "Libre Baskerville"';
          ctx.fillStyle = i === active ? RED : 'rgba(30,26,22,0.4)';
          const w = spacedText(ctx, s, x, 96, 3, 'left');
          if (i === active) { ctx.fillRect(x, 104, w, 3); }
          x += w + 16;
          if (i < 2) { ctx.fillStyle = 'rgba(30,26,22,0.6)'; ctx.font = '400 28px "Libre Baskerville"'; ctx.fillText('→', x, 96); x += 46; }
        });
        ctx.restore();
      }
      const acA = seg(10.8, 11.2);
      if (acA > 0) {
        ctx.save(); ctx.globalAlpha = acA; box(50, 44, 470, 176);
        ctx.fillStyle = INKC; ctx.font = '700 28px "Libre Baskerville"'; spacedText(ctx, 'ACCURACY', 74, 84, 2, 'left');
        const p = H.ease.inOut(seg(10.9, 12.8));
        const acc = Math.round(61 + 36 * p);
        ctx.font = '700 80px "Libre Baskerville"'; ctx.textAlign = 'left'; ctx.fillStyle = p >= 1 ? RED : INKC; ctx.fillText(acc + '%', 70, 164);
        const px0 = 300, py0 = 192, pw = 196, ph = 110;
        ctx.strokeStyle = 'rgba(30,26,22,0.4)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(px0 + pw, py0); ctx.moveTo(px0, py0); ctx.lineTo(px0, py0 - ph); ctx.stroke();
        ctx.strokeStyle = RED; ctx.lineWidth = 3; ctx.beginPath();
        for (let k = 0; k <= 40 * p; k++) { const u = k / 40, v = 1 - Math.exp(-u * 4); const xx = px0 + u * pw, yy = py0 - 8 - v * (ph - 18); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
        ctx.stroke();
        ctx.font = 'italic 400 24px "Libre Baskerville"'; ctx.fillStyle = INKC; ctx.textAlign = 'right'; ctx.fillText('rounds →', px0 + pw + 4, py0 + 23); ctx.textAlign = 'left';
        ctx.font = 'italic 400 28px "Libre Baskerville"'; ctx.fillText('from 61%', 74, 204);
        if (p >= 1) { const u = seg(12.8, 13.1); ctx.fillStyle = RED; ctx.fillRect(72, 174, 190 * u, 3.5); }
        ctx.restore();
      }
      const tk = seg(13.2, 13.7);
      if (tk > 0) {
        ctx.save(); ctx.globalAlpha = tk;
        const y = 600 + (1 - H.ease.out(tk)) * 12;
        ctx.fillStyle = 'rgba(238,229,203,0.97)'; ctx.fillRect(150, y - 58, 980, 92);
        ctx.strokeStyle = INKC; ctx.lineWidth = 1.6; ctx.strokeRect(150.5, y - 57.5, 980, 92); ctx.lineWidth = 0.7; ctx.strokeRect(157.5, y - 50.5, 966, 78);
        ctx.fillStyle = INKC; ctx.font = '700 40px "Libre Baskerville"';
        spacedText(ctx, 'MORE EXAMPLES → BETTER GUESSES', 640, y + 2, 2, 'center');
        ctx.restore();
      }

      H.vignette(ctx, W, H_, 0.18, '80,60,30');
      H.grain(ctx, W, H_, 0.035, 31 + Math.floor(t * 12));
    },
  });
}
