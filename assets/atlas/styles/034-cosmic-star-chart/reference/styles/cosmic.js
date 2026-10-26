{
  // =====================================================================================
  // Cosmic Star Chart: deep-space illustration (nebulae, lit planets, comets, spiky stars)
  // crossed with an engraved celestial atlas overlay (hairline gold / pale-cyan chart work).
  // =====================================================================================
  const TAU = Math.PI * 2;
  const GOLD = [230, 198, 128], GOLDB = [255, 226, 168], CYAN = [160, 226, 236], RED = [255, 86, 74];
  const CREAM = [248, 240, 224], WHITE = [255, 255, 255];
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const CORM = '"Cormorant Garamond"', SYNE = '"Syne"', BASK = '"Libre Baskerville"';
  const LV = (() => { const v = [0.74, -0.46, 0.48], n = Math.hypot(v[0], v[1], v[2]); return v.map((a) => a / n); })();
  const C = {}; // cached textures (built once, output still depends only on t)
  const wrap = (v, m) => ((v % m) + m) % m;
  const sm = (a, b, x) => H.smooth(a, b, x);
  const bump = (a, b, c, d, x) => sm(a, b, x) * (1 - sm(c, d, x));

  // ---------------------------------------------------------------- glow sprites
  function glow(c) {
    const key = 'g' + c.join(',');
    if (C[key]) return C[key];
    const cv = H.layer(128, 128), x = cv.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, rgba(c, 1)); g.addColorStop(0.07, rgba(c, 0.85)); g.addColorStop(0.2, rgba(c, 0.28));
    g.addColorStop(0.45, rgba(c, 0.07)); g.addColorStop(1, rgba(c, 0));
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return (C[key] = cv);
  }

  // ---------------------------------------------------------------- nebula (layered fbm, cached)
  // 640x450 texture standing for a 1920x1350 sky (drawn 3x up: nebulae are soft anyway)
  function nebula() {
    if (C.neb) return C.neb;
    const w = 640, h = 450, cv = H.layer(w, h), x = cv.getContext('2d'), img = x.createImageData(w, h), d = img.data;
    const nz = H.makeNoise(7713);
    const P = { teal: [20, 150, 165], violet: [98, 50, 178], rose: [222, 70, 124], gold: [242, 182, 96] };
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const bx = i / w, by = j / h, u = bx * 3.2, v = by * 2.25;
      const qx = nz.fbm3(u, v, 0.1, 3), qy = nz.fbm3(u + 5.2, v + 1.3, 0.1, 3);
      const n = nz.fbm3(u + 1.5 * qx, v + 1.5 * qy, 1.7, 5) * 0.5 + 0.5;
      const n2 = nz.fbm3(u * 1.25 + 3 + 1.3 * qy, v * 1.25 - 2 + 1.3 * qx, 4.4, 5) * 0.5 + 0.5;
      // the nebula lives in a winding diagonal river across the sky
      const dist = by - (0.84 - 0.62 * bx) - 0.07 * Math.sin(bx * 6.5 + 1);
      const band = Math.exp(-(dist * dist) / (2 * 0.17 * 0.17));
      const m = 0.12 + 0.88 * band;
      const A = sm(0.44, 0.8, n) * m, B = sm(0.47, 0.82, n2) * m * (0.4 + 0.6 * sm(0.2, 0.7, bx + 0.2 * qx));
      const hueA = H.clamp(nz.fbm3(u * 0.5 + 9, v * 0.5, 3.3, 3) * 1.2 + 0.5 + (bx - 0.45) * 0.8);
      let r = P.violet[0] + (P.rose[0] - P.violet[0]) * hueA, g = P.violet[1] + (P.rose[1] - P.violet[1]) * hueA, b = P.violet[2] + (P.rose[2] - P.violet[2]) * hueA;
      const inner = 0.55 + 0.75 * sm(0.5, 0.9, n); // brighter where the gas is thickest: reads as lit from within
      let R_ = r * A * inner, G_ = g * A * inner, B_ = b * A * inner;
      R_ += P.teal[0] * B * 0.95; G_ += P.teal[1] * B * 0.95; B_ += P.teal[2] * B * 0.95;
      const gold = sm(0.62, 0.88, n) * sm(0.35, 0.75, hueA) * band;
      R_ += P.gold[0] * gold * 0.9; G_ += P.gold[1] * gold * 0.9; B_ += P.gold[2] * gold * 0.9;
      R_ *= 1.3; G_ *= 1.3; B_ *= 1.3;
      // soft diffuse glow of the whole river
      R_ += 40 * band * 0.35; G_ += 22 * band * 0.35; B_ += 70 * band * 0.35;
      // dark dust lanes cut through the glow
      const dl = nz.fbm3(u * 2.1 + 4 + qx, v * 2.1 + qy, 5.1, 5) * 0.5 + 0.5;
      const dust = sm(0.53, 0.7, dl) * (0.25 + 0.75 * band) * 0.85;
      R_ *= 1 - dust; G_ *= 1 - dust; B_ *= 1 - dust;
      const k = (j * w + i) * 4;
      const br = 3 + 6 * by, bg = 4 + 4 * by, bb = 11 + 14 * (1 - Math.abs(by - 0.5));
      d[k] = Math.min(255, br + R_); d[k + 1] = Math.min(255, bg + G_); d[k + 2] = Math.min(255, bb + B_); d[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return (C.neb = cv);
  }

  // ---------------------------------------------------------------- distant galaxy smear
  function galaxy() {
    if (C.gal) return C.gal;
    const w = 300, h = 300, cv = H.layer(w, h), x = cv.getContext('2d'), img = x.createImageData(w, h), d = img.data, nz = H.makeNoise(91);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const u = (i - w / 2) / (w / 2), v = (j - h / 2) / (h / 2), r = Math.hypot(u, v);
      if (r > 1) continue;
      const th = Math.atan2(v, u), arm = 0.5 + 0.5 * Math.cos(2 * th - 7.5 * Math.log(r + 0.06));
      const n = nz.fbm2(u * 5, v * 5, 4) * 0.5 + 0.5;
      const disk = Math.exp(-r * 4.5), core = Math.exp(-r * r * 70);
      const I = disk * (0.25 + 0.75 * Math.pow(arm, 2.2)) * (0.5 + 0.9 * n) * (1 - sm(0.8, 1, r)) + core * 1.4;
      const s = H.clamp(r * 2.2), k = (j * w + i) * 4;
      d[k] = 255 - 90 * s; d[k + 1] = 232 - 40 * s; d[k + 2] = 196 + 59 * s; d[k + 3] = H.clamp(I) * 255;
    }
    x.putImageData(img, 0, 0);
    return (C.gal = cv);
  }

  // ---------------------------------------------------------------- star fields
  const BW = 1700, BH = 1300, FW = 1500, FH = 1150;
  function starData() {
    if (C.stars) return C.stars;
    const r = H.rng(4401), tints = [[255, 246, 232], [212, 228, 255], [255, 226, 186], [200, 240, 246], [255, 212, 222]];
    const mid = [], near = [];
    for (let i = 0; i < 620; i++) mid.push({ x: r() * BW, y: r() * BH, m: Math.pow(r(), 3), c: r.pick(tints), ph: r() * TAU, w: 0.8 + r() * 3 });
    for (let i = 0; i < 60; i++) near.push({ x: r() * BW, y: r() * BH, m: 0.25 + 0.75 * Math.pow(r(), 2), c: r.pick(tints), ph: r() * TAU, w: 0.6 + r() * 2 });
    // far stars baked once, denser along the nebula river (a milky band)
    const far = H.layer(FW, FH), fx = far.getContext('2d');
    for (let i = 0; i < 5200; i++) {
      const x = r() * FW, y = r() * FH, bx = x / FW, by = y / FH;
      const dist = by - (0.84 - 0.62 * bx);
      if (r() > 0.25 + 0.75 * Math.exp(-(dist * dist) / 0.03)) continue;
      const m = Math.pow(r(), 2.5), c = r.pick(tints);
      fx.fillStyle = rgba(c, 0.15 + m * 0.7); const s = 0.5 + m * 1.1; fx.fillRect(x, y, s, s);
    }
    return (C.stars = { mid, near, far });
  }

  // cam: { x, y (scene px), z (zoom), warp (0..1), bright, nx, ny (nebula framing offsets) }
  function sky(ctx, W, Hh, t, cam) {
    ctx.fillStyle = '#03040b'; ctx.fillRect(0, 0, W, Hh);
    const neb = nebula(), S = starData(), warp = cam.warp || 0, br = cam.bright == null ? 1 : cam.bright;
    const cx = W / 2, cy = Hh / 2;
    // nebula layer (slowest parallax), with a zoom-blur smear during warp
    const nzm = 1 + (cam.z - 1) * 0.22;
    const drawNeb = (zz, a) => {
      ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, cy); ctx.scale(zz, zz);
      ctx.translate(-960 - cam.x * 0.12 + (cam.nx || 0), -675 - cam.y * 0.12 + (cam.ny || 0));
      ctx.imageSmoothingQuality = 'high'; ctx.drawImage(neb, 0, 0, 1920, 1350);
      const g = galaxy(), gp = cam.gal || [920, 525, 1.5]; ctx.translate(gp[0], gp[1]); ctx.rotate(-0.38); ctx.scale(gp[2], gp[2] * 0.28);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * 0.75; ctx.drawImage(g, -150, -150, 300, 300);
      ctx.restore();
    };
    drawNeb(nzm, br);
    if (warp > 0.01) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 1; i <= 4; i++) drawNeb(nzm * (1 + warp * 0.07 * i), 0.18 * warp * br);
      ctx.restore();
    }
    // far stars
    const fz = 1 + (cam.z - 1) * 0.15;
    ctx.save(); ctx.globalAlpha = br; ctx.translate(cx, cy); ctx.scale(fz, fz);
    ctx.drawImage(S.far, -FW / 2 - cam.x * 0.05, -FH / 2 - cam.y * 0.05); ctx.restore();
    // mid stars: twinkle, streak in warp
    const zs = 1 + (cam.z - 1) * 0.5;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const s of S.mid) {
      let px = wrap(s.x - cam.x * 0.3, BW) - (BW - W) / 2, py = wrap(s.y - cam.y * 0.3, BH) - (BH - Hh) / 2;
      px = cx + (px - cx) * zs; py = cy + (py - cy) * zs;
      if (px < -60 || py < -60 || px > W + 60 || py > Hh + 60) continue;
      const tw = 0.62 + 0.38 * Math.sin(t * s.w + s.ph), a = (0.22 + 0.78 * s.m) * tw * br, sz = 0.7 + s.m * 1.7;
      if (warp > 0.02) {
        const k = warp * (0.18 + 0.5 * s.m);
        ctx.strokeStyle = rgba(s.c, Math.min(1, a * (1 + warp))); ctx.lineWidth = sz;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (px - cx) * k, py + (py - cy) * k); ctx.stroke();
      } else { ctx.fillStyle = rgba(s.c, a); ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz); }
    }
    // near bright stars with soft glow (fastest parallax)
    const zn = 1 + (cam.z - 1) * 1.0;
    for (const s of S.near) {
      let px = wrap(s.x - cam.x * 0.6, BW) - (BW - W) / 2, py = wrap(s.y - cam.y * 0.6, BH) - (BH - Hh) / 2;
      px = cx + (px - cx) * zn; py = cy + (py - cy) * zn;
      if (px < -80 || py < -80 || px > W + 80 || py > Hh + 80) continue;
      const tw = 0.7 + 0.3 * Math.sin(t * s.w * 1.7 + s.ph), a = s.m * tw * br, sz = 6 + s.m * 20;
      if (warp > 0.02) {
        const k = warp * 0.9;
        ctx.strokeStyle = rgba(s.c, Math.min(1, a)); ctx.lineWidth = 1 + s.m * 2;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (px - cx) * k, py + (py - cy) * k); ctx.stroke();
      }
      ctx.globalAlpha = a; ctx.drawImage(glow(s.c), px - sz / 2, py - sz / 2, sz, sz);
      ctx.globalAlpha = 1; ctx.fillStyle = rgba(WHITE, Math.min(1, a * 1.2)); ctx.fillRect(px - 0.8, py - 0.8, 1.6, 1.6);
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- bright star with diffraction spikes
  function spikeStar(ctx, x, y, s, a, tint = [255, 236, 206], rot = 0.0) { const GA = ctx.globalAlpha;
    if (a <= 0.003) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x, y);
    ctx.globalAlpha = GA * a * 0.55; ctx.drawImage(glow(tint), -s * 4, -s * 4, s * 8, s * 8);
    ctx.globalAlpha = GA * a * 0.5; ctx.drawImage(glow([150, 200, 255]), -s * 1.8, -s * 1.8, s * 3.6, s * 3.6);
    ctx.globalAlpha = GA * a; ctx.drawImage(glow(WHITE), -s, -s, s * 2, s * 2);
    ctx.globalAlpha = GA * 1; ctx.rotate(rot);
    for (let k = 0; k < 8; k++) {
      const main = k % 2 === 0, len = s * (main ? 9 : 3.4), wd = s * (main ? 0.1 : 0.06);
      ctx.save(); ctx.rotate(k * TAU / 8);
      const gr = ctx.createLinearGradient(0, 0, len, 0);
      gr.addColorStop(0, rgba(WHITE, a * (main ? 0.95 : 0.55))); gr.addColorStop(0.2, rgba(tint, a * (main ? 0.45 : 0.22)));
      gr.addColorStop(0.6, rgba([170, 200, 255], a * (main ? 0.12 : 0.05))); gr.addColorStop(1, rgba(tint, 0));
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(0, -wd); ctx.lineTo(len, 0); ctx.lineTo(0, wd); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = GA * a * 0.14; ctx.strokeStyle = rgba([190, 220, 255], 1); ctx.lineWidth = s * 0.22;
    ctx.beginPath(); ctx.arc(0, 0, s * 2.4, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  // ---------------------------------------------------------------- ringed gas giant (per-pixel lit, cached)
  const PR = 190, PTILT = 0.3, PINC = 0.27, PR0 = 1.34 * PR, PR1 = 1.96 * PR;
  function planetSprite() {
    if (C.planet) return C.planet;
    const R = PR, cT = Math.cos(PTILT), sT = Math.sin(PTILT), inc = PINC, si = Math.sqrt(1 - inc * inc);
    const Ex = [cT, sT, 0], Ez = [-sT * inc, cT * inc, si], Nn = [sT * si, -cT * si, inc];
    const rx = PR1, ry = PR1 * inc;
    const hw = Math.ceil(Math.max(R * 1.2, Math.sqrt((rx * cT) ** 2 + (ry * sT) ** 2)) + 6);
    const hh = Math.ceil(Math.max(R * 1.2, Math.sqrt((rx * sT) ** 2 + (ry * cT) ** 2)) + 6);
    const w = hw * 2, h = hh * 2, cv = H.layer(w, h), x = cv.getContext('2d'), img = x.createImageData(w, h), d = img.data;
    const nz = H.makeNoise(2207);
    const ringD = (rr) => {
      const u = (rr - PR0) / (PR1 - PR0); if (u < 0 || u > 1) return 0;
      let v = 0.6 + 0.17 * Math.sin(u * 47) + 0.12 * Math.sin(u * 131 + 1.3) + 0.08 * Math.sin(u * 289 + 0.4);
      if (u < 0.24) v *= 0.45 + u * 1.2;
      v *= 1 - 0.93 * (sm(0.6, 0.62, u) * (1 - sm(0.66, 0.68, u)));
      v *= sm(0, 0.03, u) * (1 - sm(0.95, 1, u));
      return H.clamp(v);
    };
    const ringC = (rr) => { const u = H.clamp((rr - PR0) / (PR1 - PR0)); return u < 0.5 ? H.mix([170, 160, 160], [242, 224, 186], u * 2) : H.mix([242, 224, 186], [200, 168, 130], (u - 0.5) * 2); };
    const pal = [[240, 224, 194], [222, 178, 112], [184, 110, 72], [236, 210, 164], [160, 116, 142], [208, 152, 98], [244, 232, 206], [150, 160, 170]];
    const band = (v) => { const n = pal.length, f = wrap(v, n), i = Math.floor(f), fr = f - i, s = fr * fr * (3 - 2 * fr), a = pal[i], b = pal[(i + 1) % n]; return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s]; };
    const L = LV, L2n = Math.hypot(L[0], L[1]);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const sx = i - hw + 0.5, sy = j - hh + 0.5, r2 = sx * sx + sy * sy, rd = Math.sqrt(r2);
      const lx = sx * cT + sy * sT, ly = -sx * sT + sy * cT, rz = ly / inc, rr = Math.hypot(lx, rz);
      let ra = 0, rc = null, front = rz > 0;
      if (rr > PR0 && rr < PR1) {
        ra = ringD(rr) * 0.94;
        if (ra > 0) {
          const Px = sx, Py = sy, Pz = rz * si, b = Px * L[0] + Py * L[1] + Pz * L[2], c = Px * Px + Py * Py + Pz * Pz - R * R;
          const lit = b < 0 && b * b > c ? 0.1 : 1;
          const cc = ringC(rr), gr = 0.9 + 0.1 * nz.n2(rr * 0.9, 3.3);
          rc = [cc[0] * lit * gr, cc[1] * lit * gr, cc[2] * lit * gr];
        }
      }
      let oR = 0, oG = 0, oB = 0, oA = 0; // premultiplied
      if (ra > 0 && !front && rd > R - 0.5) { oR = rc[0] * ra; oG = rc[1] * ra; oB = rc[2] * ra; oA = ra; }
      if (rd < R + 0.5) {
        const nx = sx / R, ny = sy / R, nzz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        const lat = Math.asin(H.clamp(nx * Nn[0] + ny * Nn[1] + nzz * Nn[2], -1, 1));
        const lon = Math.atan2(nx * Ez[0] + ny * Ez[1] + nzz * Ez[2], nx * Ex[0] + ny * Ex[1]);
        const turb = nz.fbm3(Math.cos(lon) * 1.8, Math.sin(lon) * 1.8, lat * 11, 5);
        let col = band(lat * 6.2 + turb * 0.75 + 0.03 * nz.n3(lon * 9, lat * 60, 2));
        const fine = 1 + 0.07 * Math.sin(lat * 48 + turb * 4); col = [col[0] * fine, col[1] * fine, col[2] * fine];
        const pole = sm(0.75, 1.25, Math.abs(lat));
        col = H.mix(col, [118, 132, 160], pole * 0.7);
        // great storm oval
        const de = Math.pow((wrap(lon - 0.55 + Math.PI, TAU) - Math.PI) * Math.cos(lat) / 0.2, 2) + Math.pow((lat + 0.38) / 0.075, 2);
        if (de < 1.8) { const s = 1 - sm(0.6, 1.0, de), rim = bump(0.7, 1.0, 1.1, 1.6, de); col = H.mix(col, [196, 92, 60], s * 0.85); col = H.mix(col, [250, 236, 210], rim * 0.5); }
        const dl = nx * L[0] + ny * L[1] + nzz * L[2];
        const day = sm(-0.1, 0.32, dl) * (0.3 + 0.7 * Math.pow(Math.max(dl, 0), 0.7));
        let lr = col[0] * day, lg = col[1] * day, lb = col[2] * day;
        const term = bump(-0.1, 0.05, 0.08, 0.3, dl) * 0.25; lr += 120 * term; lg += 40 * term; // warm terminator
        lr += 10; lg += 7; lb += 22; // violet nebula fill on the night side
        const limb = 0.55 + 0.45 * Math.pow(nzz, 0.6); lr *= limb; lg *= limb; lb *= limb;
        // shadow of the rings on the cloud tops
        const Pz = nzz * R, ln = L[0] * Nn[0] + L[1] * Nn[1] + L[2] * Nn[2], pn = sx * Nn[0] + sy * Nn[1] + Pz * Nn[2];
        const s2 = -pn / ln;
        if (s2 > 0) { const Qx = sx + L[0] * s2, Qy = sy + L[1] * s2, Qz = Pz + L[2] * s2, qx = Qx * Ex[0] + Qy * Ex[1], qz = Qx * Ez[0] + Qy * Ez[1] + Qz * Ez[2]; const sd = ringD(Math.hypot(qx, qz)) * 0.8; lr *= 1 - sd; lg *= 1 - sd; lb *= 1 - sd; }
        // atmospheric rim scattering
        const rim = Math.pow(1 - nzz, 2.6) * sm(-0.35, 0.5, dl);
        lr += 110 * rim; lg += 190 * rim; lb += 240 * rim;
        const ea = H.clamp(R - rd + 0.5);
        oR = Math.min(255, lr) * ea + oR * (1 - ea); oG = Math.min(255, lg) * ea + oG * (1 - ea); oB = Math.min(255, lb) * ea + oB * (1 - ea); oA = ea + oA * (1 - ea);
      }
      if (rd > R - 1 && rd < R * 1.2) { // halo
        const dr = Math.max(0, rd - R), face = sm(-0.5, 0.8, (sx * L[0] + sy * L[1]) / (rd * L2n));
        const g = Math.exp(-dr / (0.03 * R)) * (0.12 + 0.88 * face) * 0.9;
        oR += 100 * g; oG += 185 * g; oB += 245 * g; oA = Math.min(1, oA + g * 0.9);
      }
      if (ra > 0 && front) { oR = rc[0] * ra + oR * (1 - ra); oG = rc[1] * ra + oG * (1 - ra); oB = rc[2] * ra + oB * (1 - ra); oA = ra + oA * (1 - ra); }
      const k = (j * w + i) * 4;
      if (oA > 0.001) { d[k] = Math.min(255, oR / oA); d[k + 1] = Math.min(255, oG / oA); d[k + 2] = Math.min(255, oB / oA); d[k + 3] = oA * 255; }
    }
    x.putImageData(img, 0, 0);
    return (C.planet = { cv, hw, hh });
  }
  function drawPlanet(ctx, x, y, R, a = 1) { const GA = ctx.globalAlpha;
    const P = planetSprite(), s = R / PR;
    ctx.save(); ctx.globalAlpha = GA * a; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(P.cv, x - P.hw * s, y - P.hh * s, P.cv.width * s, P.cv.height * s); ctx.restore();
  }

  // ---------------------------------------------------------------- cratered moons
  function moonSprite(seed, base) {
    const key = 'moon' + seed;
    if (C[key]) return C[key];
    const R = 40, w = R * 2 + 4, cv = H.layer(w, w), x = cv.getContext('2d'), img = x.createImageData(w, w), d = img.data;
    const r = H.rng(seed), nz = H.makeNoise(seed), cr = [];
    for (let i = 0; i < 16; i++) { const a = r() * TAU, b = Math.acos(r() * 2 - 1); cr.push({ v: [Math.sin(b) * Math.cos(a), Math.sin(b) * Math.sin(a), Math.cos(b)], r: 0.08 + Math.pow(r(), 2) * 0.32 }); }
    for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) {
      const nx = (i - w / 2 + 0.5) / R, ny = (j - w / 2 + 0.5) / R, q = nx * nx + ny * ny;
      if (q > 1.03) continue;
      const nzz = Math.sqrt(Math.max(0, 1 - q));
      let alb = 0.82 + 0.18 * nz.fbm3(nx * 3, ny * 3, nzz * 3, 4);
      for (const c of cr) {
        const dd = Math.acos(H.clamp(nx * c.v[0] + ny * c.v[1] + nzz * c.v[2], -1, 1)) / c.r;
        if (dd < 1) alb *= 0.78 + 0.12 * dd; else if (dd < 1.25) alb *= 1 + 0.16 * (1 - (dd - 1) / 0.25);
      }
      const dl = nx * LV[0] + ny * LV[1] + nzz * LV[2];
      const lit = sm(-0.04, 0.22, dl) * (0.25 + 0.75 * Math.max(0, dl)) + 0.035;
      const rim = Math.pow(1 - nzz, 3) * sm(-0.2, 0.5, dl) * 0.35;
      const k = (j * w + i) * 4, ea = H.clamp((1 - Math.sqrt(q)) * R + 0.5);
      d[k] = Math.min(255, base[0] * alb * lit + 120 * rim); d[k + 1] = Math.min(255, base[1] * alb * lit + 190 * rim); d[k + 2] = Math.min(255, base[2] * alb * lit + 240 * rim); d[k + 3] = ea * 255;
    }
    x.putImageData(img, 0, 0);
    return (C[key] = cv);
  }
  function drawMoon(ctx, x, y, r, seed, base, a = 1) { const GA = ctx.globalAlpha;
    const m = moonSprite(seed, base), s = r / 40;
    ctx.save(); ctx.globalAlpha = GA * a; ctx.drawImage(m, x - m.width / 2 * s, y - m.height / 2 * s, m.width * s, m.height * s); ctx.restore();
  }

  // ---------------------------------------------------------------- comet
  // pts: positions from the head backwards along the path. dir: unit vector for the straight ion tail.
  function comet(ctx, pts, a, sc = 1, dir = null) { const GA = ctx.globalAlpha;
    if (a <= 0.003 || pts.length < 2) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
    const n = pts.length;
    // dust tail: a broad curved fan of strands, widening and fading away from the head
    const nrm = pts.map((p, i) => { const q = pts[Math.min(n - 1, i + 1)], o = pts[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
    for (const [off, w, al, c] of [[0, 34, 0.03, [255, 196, 150]], [0.5, 22, 0.04, [255, 210, 170]], [1, 14, 0.05, [255, 220, 190]], [0, 10, 0.1, [255, 232, 204]], [0.3, 3, 0.22, CREAM], [0.8, 2, 0.12, CREAM]]) {
      for (let i = 0; i < n - 1; i++) {
        const f = i / (n - 1), f2 = (i + 1) / (n - 1), fa = Math.pow(1 - f, 1.4), o1 = off * f * f * 46 * sc, o2 = off * f2 * f2 * 46 * sc;
        ctx.strokeStyle = rgba(c, al * fa * a); ctx.lineWidth = w * sc * (0.3 + 1.6 * f);
        ctx.beginPath(); ctx.moveTo(pts[i][0] + nrm[i][0] * o1, pts[i][1] + nrm[i][1] * o1); ctx.lineTo(pts[i + 1][0] + nrm[i + 1][0] * o2, pts[i + 1][1] + nrm[i + 1][1] * o2); ctx.stroke();
      }
    }
    const [hx, hy] = pts[0];
    if (dir) {
      const len = 230 * sc, ex = hx + dir[0] * len, ey = hy + dir[1] * len;
      for (const [w, al] of [[7, 0.12], [1.6, 0.5]]) {
        const g = ctx.createLinearGradient(hx, hy, ex, ey); g.addColorStop(0, rgba([140, 210, 255], al * a)); g.addColorStop(1, rgba([90, 140, 255], 0));
        ctx.strokeStyle = g; ctx.lineWidth = w * sc; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
      }
    }
    ctx.globalAlpha = GA * a * 0.7; ctx.drawImage(glow([170, 230, 255]), hx - 55 * sc, hy - 55 * sc, 110 * sc, 110 * sc);
    ctx.globalAlpha = GA * a * 0.5; ctx.drawImage(glow([200, 255, 240]), hx - 22 * sc, hy - 22 * sc, 44 * sc, 44 * sc);
    ctx.globalAlpha = GA * a; ctx.drawImage(glow(WHITE), hx - 12 * sc, hy - 12 * sc, 24 * sc, 24 * sc);
    ctx.restore();
  }

  // ---------------------------------------------------------------- chart line work
  const ellPt = (cx, cy, rx, ry, rot, a) => { const c = Math.cos(rot), s = Math.sin(rot), x = rx * Math.cos(a), y = ry * Math.sin(a); return [cx + x * c - y * s, cy + x * s + y * c]; };
  function chevron(ctx, x, y, ang, sz, c, a, lw = 1.4) {
    ctx.save(); ctx.strokeStyle = rgba(c, a); ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x + Math.cos(ang + 2.6) * sz, y + Math.sin(ang + 2.6) * sz); ctx.lineTo(x, y); ctx.lineTo(x + Math.cos(ang - 2.6) * sz, y + Math.sin(ang - 2.6) * sz); ctx.stroke(); ctx.restore();
  }
  // dotted orbit ellipse with small open arrowheads; draws on with prog; occl hides the far half behind a disk
  function orbit(ctx, o) {
    const { cx, cy, rx, ry, rot = 0, a0 = 0, sweep = TAU, prog = 1, c = GOLD, a = 0.8, gap = 7, r = 1.25, arrows = 3, dir = 1, occl = null, crawl = 0 } = o;
    if (prog <= 0 || a <= 0) return;
    const per = Math.PI * (rx + ry) * sweep / TAU, n = Math.max(40, Math.ceil(per / 2));
    ctx.save(); ctx.fillStyle = rgba(c, a);
    let acc = wrap(crawl, gap), last = null;
    for (let k = 0; k <= n * prog; k++) {
      const th = a0 + dir * sweep * k / n, p = ellPt(cx, cy, rx, ry, rot, th);
      if (last) acc += Math.hypot(p[0] - last[0], p[1] - last[1]);
      last = p;
      if (acc >= gap) {
        acc -= gap;
        if (occl && Math.sin(th) < 0 && Math.hypot(p[0] - occl[0], p[1] - occl[1]) < occl[2]) continue;
        ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fill();
      }
    }
    for (let m = 0; m < arrows; m++) {
      const f = (m + 0.5) / arrows; if (f > prog) continue;
      const th = a0 + dir * sweep * f, p = ellPt(cx, cy, rx, ry, rot, th), q = ellPt(cx, cy, rx, ry, rot, th + dir * 0.01);
      if (occl && Math.sin(th) < 0 && Math.hypot(p[0] - occl[0], p[1] - occl[1]) < occl[2]) continue;
      chevron(ctx, p[0], p[1], Math.atan2(q[1] - p[1], q[0] - p[0]), 7, c, a);
    }
    ctx.restore();
  }
  // fine solid chart line (optionally dotted) drawn on from (x0,y0) to (x1,y1), quadratic via (qx,qy)
  function chartLine(ctx, x0, y0, x1, y1, o = {}) {
    const { prog = 1, c = GOLD, a = 0.9, lw = 1.3, q = null, arrow = true, dotted = false, glowA = 0 } = o;
    if (prog <= 0 || a <= 0) return null;
    const P = (u) => q ? [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * q[0] + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * q[1] + u * u * y1] : [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u];
    const n = 48, end = Math.max(1, Math.ceil(n * prog));
    ctx.save(); ctx.lineCap = 'round';
    const path = () => { ctx.beginPath(); for (let i = 0; i <= end; i++) { const p = P(Math.min(prog, i / n)); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } };
    if (glowA > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(c, glowA * a); ctx.lineWidth = lw * 6; path(); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
    ctx.strokeStyle = rgba(c, a); ctx.lineWidth = lw; if (dotted) ctx.setLineDash([1.5, 6]);
    path(); ctx.stroke(); ctx.setLineDash([]);
    const p1 = P(prog), p0 = P(Math.max(0, prog - 0.02));
    if (arrow) chevron(ctx, p1[0], p1[1], Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), 9, c, a, lw + 0.2);
    ctx.restore();
    return p1;
  }
  // graduated degree ring (astrolabe scale)
  function degreeRing(ctx, cx, cy, r, prog, c, a, from = 0, numerals = true) {
    if (prog <= 0 || a <= 0) return;
    ctx.save(); ctx.strokeStyle = rgba(c, a); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, r, from, from + TAU * prog); ctx.stroke();
    const ga = ctx.globalAlpha; ctx.beginPath(); ctx.arc(cx, cy, r + 5, from, from + TAU * prog); ctx.globalAlpha = ga * 0.5; ctx.stroke(); ctx.globalAlpha = ga;
    ctx.beginPath();
    for (let dg = 0; dg < 360 * prog; dg += 2) {
      const an = from + dg * Math.PI / 180, l = dg % 30 === 0 ? 13 : dg % 10 === 0 ? 8 : 4;
      ctx.moveTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); ctx.lineTo(cx + Math.cos(an) * (r - l), cy + Math.sin(an) * (r - l));
    }
    ctx.stroke();
    if (numerals) {
      ctx.fillStyle = rgba(c, a * 0.9); ctx.font = `600 14px ${CORM}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let dg = 0; dg < 360 * prog; dg += 30) { const an = from + dg * Math.PI / 180; ctx.fillText(dg + '°', cx + Math.cos(an) * (r + 17), cy + Math.sin(an) * (r + 17)); }
    }
    ctx.restore();
  }
  function marker(ctx, x, y, r, c, a, lw = 1.2) {
    if (a <= 0) return;
    ctx.save(); ctx.strokeStyle = rgba(c, a); ctx.fillStyle = rgba(c, a); ctx.lineWidth = lw;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill();
    ctx.beginPath();
    for (let k = 0; k < 4; k++) { const an = k * Math.PI / 2; ctx.moveTo(x + Math.cos(an) * (r + 3), y + Math.sin(an) * (r + 3)); ctx.lineTo(x + Math.cos(an) * (r + 9), y + Math.sin(an) * (r + 9)); }
    ctx.stroke(); ctx.restore();
  }
  function label(ctx, txt, x, y, o = {}) {
    const size = o.size || 26, caps = !o.italic && !o.font && o.caps !== false;
    if ((o.a ?? 1) <= 0) return;
    ctx.save();
    ctx.font = o.font || (o.italic ? `italic 400 ${size}px ${BASK}` : `600 ${size}px ${CORM}`);
    ctx.letterSpacing = caps ? (size * (o.track ?? 0.16)).toFixed(1) + 'px' : (o.track ? (size * o.track).toFixed(1) + 'px' : '0px');
    ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic';
    ctx.globalAlpha *= o.a ?? 1;
    const s = caps ? txt.toUpperCase() : txt;
    ctx.shadowColor = 'rgba(2,3,14,0.95)'; ctx.shadowBlur = o.halo ?? 14;
    ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(2,3,14,0.6)'; ctx.lineWidth = Math.max(3, size * 0.16); ctx.strokeText(s, x, y);
    ctx.fillStyle = rgba(o.color || GOLD, 1); ctx.fillText(s, x, y);
    ctx.shadowBlur = 0; ctx.fillText(s, x, y);
    ctx.restore();
  }
  // a labelled chart star (small glow + crisp core)
  function chartStar(ctx, x, y, m, c, a) { const GA = ctx.globalAlpha;
    if (a <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = GA * a;
    const s = 10 + m * 26; ctx.drawImage(glow(c), x - s / 2, y - s / 2, s, s);
    ctx.fillStyle = rgba(WHITE, a); ctx.beginPath(); ctx.arc(x, y, 1.2 + m * 1.8, 0, TAU); ctx.fill(); ctx.restore();
  }
  // constellation figures for the examples: cat (pointed ears) and dog (floppy ears)
  const GLYPH = {
    cat: { p: [[-0.72, -1], [-0.28, -0.42], [0.28, -0.42], [0.72, -1], [0.9, -0.15], [0.72, 0.45], [0, 0.82], [-0.72, 0.45], [-0.9, -0.15], [-0.33, 0.02], [0.33, 0.02], [0, 0.36]],
      l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 0], [9, 11], [11, 10]] },
    dog: { p: [[-0.45, -0.85], [0.45, -0.85], [1.0, -0.55], [0.95, 0.35], [0.45, 0.25], [0.32, 0.75], [0, 0.9], [-0.32, 0.75], [-0.45, 0.25], [-0.95, 0.35], [-1.0, -0.55], [-0.3, -0.12], [0.3, -0.12]],
      l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 0], [8, 4]] },
  };
  function glyph(ctx, type, x, y, s, c, a, prog = 1) {
    if (a <= 0) return;
    const G = GLYPH[type], P = G.p.map(([u, v]) => [x + u * s, y + v * s]);
    ctx.save(); ctx.strokeStyle = rgba(c, a * 0.85); ctx.lineWidth = 1.3; ctx.lineCap = 'round';
    const nl = G.l.length, upto = prog * nl;
    for (let i = 0; i < nl && i < upto; i++) {
      const [A, B] = G.l[i], pa = P[A], pb = P[B], f = Math.min(1, upto - i), dx = pb[0] - pa[0], dy = pb[1] - pa[1], L = Math.hypot(dx, dy), g = Math.min(5, L * 0.2);
      ctx.beginPath(); ctx.moveTo(pa[0] + dx / L * g, pa[1] + dy / L * g); ctx.lineTo(pa[0] + dx / L * (g + (L - 2 * g) * f), pa[1] + dy / L * (g + (L - 2 * g) * f)); ctx.stroke();
    }
    ctx.restore();
    P.forEach((p, i) => { if (i / P.length <= prog + 0.05) chartStar(ctx, p[0], p[1], i >= 9 ? 0.15 : 0.32, c, a); });
  }
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  // ================================================================= STILL + CLIP
  // b = build progress per element (all 1 on the finished still)
  function stillScene(ctx, W, Hh, t, B) {
    const camz = 1 + 0.1 * (1 - H.ease.out(B.cam));
    sky(ctx, W, Hh, t, { x: t * 6, y: 0, z: camz, bright: B.sky, nx: -40, ny: 40 });
    const PX = 740, PY = 450, R = 186;
    // the light source: a bright star with diffraction spikes
    spikeStar(ctx, 1150, 112, 16 * (0.6 + 0.4 * B.star), B.star, [255, 232, 196], 0.12);
    // planet + moons on their orbits
    const om = [{ rx: 452, ry: 124, rot: PTILT, w: 0.11, ph: 0.26, r: 21, seed: 31, base: [214, 206, 196] },
      { rx: 330, ry: 214, rot: -0.62, w: -0.16, ph: -0.27, r: 15, seed: 47, base: [226, 190, 160] }];
    ctx.save(); ctx.translate(PX, PY); ctx.scale(camz, camz); ctx.translate(-PX, -PY);
    const mpos = om.map((o) => { const th = o.ph + t * o.w; return { p: ellPt(PX, PY, o.rx, o.ry, o.rot, th), back: Math.sin(th) < 0, o }; });
    mpos.filter((m) => m.back).forEach((m) => drawMoon(ctx, m.p[0], m.p[1], m.o.r * 0.92, m.o.seed, m.o.base, B.planet));
    drawPlanet(ctx, PX, PY, R, B.planet);
    mpos.filter((m) => !m.back).forEach((m) => drawMoon(ctx, m.p[0], m.p[1], m.o.r, m.o.seed, m.o.base, B.planet));
    // chart overlay
    const ca = 0.85;
    degreeRing(ctx, PX, PY, 505, B.ring, GOLD, 0.62, -Math.PI * 0.95, true);
    om.forEach((o, i) => orbit(ctx, { cx: PX, cy: PY, rx: o.rx, ry: o.ry, rot: o.rot, prog: B.orbits, c: i ? CYAN : GOLD, a: ca * 0.8, arrows: 4, crawl: t * 9, occl: [PX, PY, R] }));
    mpos.forEach((m, i) => marker(ctx, m.p[0], m.p[1], m.o.r + 9, i ? CYAN : GOLD, 0.8 * B.labels));
    ctx.restore();
    // comet streaking toward the planet
    const cs = H.ease.out(B.comet), path = (u) => [-260 + 570 * u, 200 + 100 * u - 50 * Math.sin(u * Math.PI)];
    const pts = []; for (let i = 0; i < 30; i++) { const u = cs - i * 0.03; if (u < -0.6) break; pts.push(path(u)); }
    comet(ctx, pts, B.comet > 0 ? 1 : 0, 1.3, [-0.966, 0.257]);
    // constellation of examples, bottom left
    const cA = B.const;
    const cst = [[92, 520, 'cat'], [204, 606, 'dog'], [318, 534, 'cat']];
    ctx.save();
    for (let i = 0; i < cst.length - 1; i++) chartLine(ctx, cst[i][0], cst[i][1], cst[i + 1][0], cst[i + 1][1], { prog: H.clamp(cA * 3 - i), c: GOLD, a: 0.45, lw: 1, arrow: false, dotted: true });
    ctx.restore();
    cst.forEach(([x, y, ty], i) => { const p = H.clamp(cA * 3 - i * 0.7); glyph(ctx, ty, x, y, 26, i % 2 ? CYAN : GOLD, p, p); label(ctx, ty, x, y + 60, { italic: true, size: 22, color: CREAM, align: 'center', a: p }); });
    label(ctx, 'Training data', 60, 462, { size: 20, a: sm(0.6, 1, cA), color: GOLD });
    // labels with leader lines
    const la = B.labels;
    chartLine(ctx, PX + 150, PY - 70, 1000, 372, { prog: la, c: GOLD, a: 0.8, arrow: false });
    marker(ctx, PX + 150, PY - 70, 6, GOLD, la);
    label(ctx, 'The model', 1010, 380, { size: 26, a: sm(0.4, 1, la) });
    label(ctx, 'a planet', 1012, 408, { italic: true, size: 19, color: CREAM, a: sm(0.5, 1, la) });
    const wp = ellPt(PX, PY, 452, 124, PTILT, 2.0);
    marker(ctx, wp[0], wp[1], 5, CYAN, la);
    chartLine(ctx, wp[0], wp[1], wp[0] - 14, wp[1] + 108, { prog: la, c: CYAN, a: 0.8, arrow: false });
    label(ctx, 'Weights', wp[0] - 24, wp[1] + 134, { size: 24, color: CYAN, a: sm(0.4, 1, la) });
    label(ctx, 'its orbiting moons', wp[0] - 22, wp[1] + 160, { italic: true, size: 18, color: CREAM, a: sm(0.5, 1, la) });
    // title cartouche
    const ta = B.title;
    label(ctx, 'Chart I · the learning machine', 72, 92, { size: 18, a: sm(0, 0.4, ta), track: 0.22 });
    ctx.save(); ctx.globalAlpha = sm(0.15, 0.7, ta);
    ctx.font = `800 64px ${SYNE}`; ctx.fillStyle = rgba(CREAM, 1); ctx.shadowColor = 'rgba(2,3,14,0.9)'; ctx.shadowBlur = 18;
    ctx.letterSpacing = (8 * (1 - H.ease.out(sm(0.15, 0.8, ta)))).toFixed(1) + 'px';
    ctx.fillText('A Mind in Orbit', 68, 160); ctx.restore();
    ctx.save(); ctx.strokeStyle = rgba(GOLD, 0.8); ctx.lineWidth = 1; const ul = 470 * sm(0.3, 1, ta);
    ctx.beginPath(); ctx.moveTo(72, 182); ctx.lineTo(72 + ul, 182); for (let x = 0; x <= ul; x += 10) { ctx.moveTo(72 + x, 182); ctx.lineTo(72 + x, 182 + (x % 50 === 0 ? 8 : 4)); } ctx.stroke(); ctx.restore();
    H.vignette(ctx, W, Hh, 0.6, '1,2,8');
  }

  // ================================================================= EXPLAINER
  // Timing table shared by explainer() and explainerSound()
  const X = {
    D: 15,
    hookIn: [0.15, 0.95], shrink: [1.5, 2.3], ruleIn: [0.5, 1.25],
    push: [0, 2.9],
    model: 2.65, weights: 3.2,
    comets: Array.from({ length: 8 }, (_, i) => ({ t0: 2.5 + i * 0.3, dur: 1.1, type: 'cddccdcd'[i] === 'c' ? 'cat' : 'dog', y0: [180, 450, 300, 520, 140, 380, 250, 470][i] })),
    count: [2.6, 5.65],
    warp: [5.85, 6.25, 6.7],
    exIn: [6.45, 7.0], stars: 6.75,
    guess: [7.05, 7.5], check: 7.95, truth: 8.15, back: [8.3, 8.85], adjust: [8.9, 9.55], guess2: [9.6, 9.95],
    pan: [10.45, 11.15],
    pts0: 11.05, ptsDt: 0.12, hit: 12.55,
    take: [13.15, 13.45, 13.75],
  };
  const PA = { x: 900, y: 400, R: 140 };
  const PB = { x: 300, y: 432, R: 104 };
  const DOG = [1000, 282], CAT = [1000, 566], EXP = [176, 238];
  const ACC = Array.from({ length: 13 }, (_, i) => i === 12 ? 97 : 61 + 36 * (1 - Math.exp(-i / 3.0)) / (1 - Math.exp(-12 / 3.0)) + [0, -1.5, 1.2, -0.8, 1.4, -1.1, 0.6, -0.7, 0.5, -0.4, 0.3, -0.2, 0][i]);
  const cometPath = (c) => {
    const ex = PA.x - PA.R * 0.94, ey = PA.y + (c.y0 - 330) * 0.28;
    const q = [380, c.y0 + (ey - c.y0) * 0.15 - 40];
    return (u) => [(1 - u) * (1 - u) * -90 + 2 * (1 - u) * u * q[0] + u * u * ex, (1 - u) * (1 - u) * c.y0 + 2 * (1 - u) * u * q[1] + u * u * ey];
  };
  const cometU = (c, t) => { const u = (t - c.t0) / c.dur; return u < 0 ? -1 : u * (0.55 + 0.45 * u); };

  function sceneA(ctx, t) { const GA = ctx.globalAlpha;
    const E = H.ease;
    // moons (weights) on orbits around the model planet
    const om = [{ rx: 318, ry: 86, rot: PTILT, w: 0.32, ph: 0.6, r: 16, seed: 31, base: [214, 206, 196] },
      { rx: 236, ry: 150, rot: -0.62, w: -0.42, ph: 2.4, r: 12, seed: 47, base: [226, 190, 160] }];
    const mp = om.map((o) => { const th = o.ph + t * o.w; return { p: ellPt(PA.x, PA.y, o.rx, o.ry, o.rot, th), back: Math.sin(th) < 0, o }; });
    mp.filter((m) => m.back).forEach((m) => drawMoon(ctx, m.p[0], m.p[1], m.o.r * 0.9, m.o.seed, m.o.base));
    drawPlanet(ctx, PA.x, PA.y, PA.R);
    // arrival flashes on the planet's limb
    for (const c of X.comets) {
      const ta = c.t0 + c.dur, fa = bump(ta - 0.02, ta + 0.03, ta + 0.1, ta + 0.55, t);
      if (fa > 0) { const P = cometPath(c)(1); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = GA * fa; ctx.drawImage(glow([170, 230, 255]), P[0] - 60, P[1] - 60, 120, 120); ctx.restore(); marker(ctx, P[0], P[1], 6 + 26 * sm(ta, ta + 0.55, t), CYAN, fa * 0.9); }
    }
    mp.filter((m) => !m.back).forEach((m) => drawMoon(ctx, m.p[0], m.p[1], m.o.r, m.o.seed, m.o.base));
    // chart overlay
    degreeRing(ctx, PA.x, PA.y, 372, E.inOut(sm(0.6, 2.4, t)), GOLD, 0.38, -Math.PI / 2, true);
    om.forEach((o, i) => orbit(ctx, { cx: PA.x, cy: PA.y, rx: o.rx, ry: o.ry, rot: o.rot, prog: E.inOut(sm(1.0 + i * 0.3, 2.2 + i * 0.3, t)), c: i ? CYAN : GOLD, a: 0.75, arrows: 4, crawl: t * 10, occl: [PA.x, PA.y, PA.R] }));
    // labels
    const ml = sm(X.model, X.model + 0.35, t);
    const m0 = [PA.x + 70, PA.y - 122];
    chartLine(ctx, m0[0], m0[1], 976, 150, { prog: E.out(sm(X.model - 0.15, X.model + 0.2, t)), arrow: false, a: 0.85 });
    marker(ctx, m0[0], m0[1], 6, GOLD, ml);
    label(ctx, 'The model', 988, 148, { size: 36, a: ml });
    label(ctx, 'a planet', 990, 188, { italic: true, size: 30, color: CREAM, a: sm(X.model + 0.2, X.model + 0.5, t) });
    const wl = sm(X.weights, X.weights + 0.35, t), wp = ellPt(PA.x, PA.y, om[0].rx, om[0].ry, om[0].rot, 0.5);
    if (wl > 0) {
      chartLine(ctx, wp[0], wp[1] + 8, wp[0] - 40, 612, { prog: E.out(sm(X.weights - 0.15, X.weights + 0.2, t)), c: CYAN, arrow: false, a: 0.8 });
      marker(ctx, wp[0], wp[1], 7, CYAN, wl * 0.9);
      label(ctx, 'Weights', wp[0] - 110, 640, { size: 36, color: CYAN, a: wl });
      label(ctx, 'its moons', wp[0] - 108, 678, { italic: true, size: 30, color: CREAM, a: sm(X.weights + 0.2, X.weights + 0.5, t) });
    }
    // comets of training data: each head is a constellation figure with its label
    for (const c of X.comets) {
      const u = cometU(c, t); if (u < -0.05 || u > 1.05) continue;
      const P = cometPath(c), head = P(Math.min(1, u));
      const pa = (1 - sm(0.97, 1.04, u)) * sm(-0.05, 0.05, u);
      // faint dotted path ahead of the comet
      ctx.save(); ctx.fillStyle = rgba(GOLD, 0.45 * pa); for (let s = Math.max(0, u); s < 1; s += 0.025) { const p = P(s); ctx.beginPath(); ctx.arc(p[0], p[1], 1.1, 0, TAU); ctx.fill(); } ctx.restore();
      if (u < 0.92) { const p = P(Math.max(u + 0.05, 0.5)), p2 = P(Math.max(u + 0.06, 0.51)); chevron(ctx, p[0], p[1], Math.atan2(p2[1] - p[1], p2[0] - p[0]), 7, GOLD, 0.6 * pa); }
      const pts = []; for (let i = 0; i < 22; i++) pts.push(P(Math.min(1, u) - i * 0.022));
      const vx = head[0] - pts[1][0], vy = head[1] - pts[1][1], vl = Math.hypot(vx, vy) || 1;
      const ion = [-vx / vl * 0.94 - vy / vl * 0.34, -vy / vl * 0.94 + vx / vl * 0.34 - 0.1];
      comet(ctx, pts, pa, 0.75, ion);
      const gs = 40 * (1 - 0.35 * sm(0.75, 1, u));
      glyph(ctx, c.type, head[0], head[1] - 64, gs, c.type === 'cat' ? GOLDB : CYAN, pa);
      label(ctx, c.type, head[0], head[1] + 44, { italic: true, size: 36, color: CREAM, align: 'center', a: pa * (1 - sm(0.8, 0.95, u)) });
    }
  }

  function counterA(ctx, t) { const GA = ctx.globalAlpha;
    const a = sm(X.count[0] - 0.1, X.count[0] + 0.3, t);
    if (a <= 0) return;
    const p = H.ease.inOut(sm(X.count[0], X.count[1], t)), v = p >= 1 ? 1e6 : Math.round(Math.pow(10, 6 * p));
    label(ctx, 'Training data', 72, 540, { size: 34, a });
    ctx.save(); ctx.globalAlpha = GA * a; ctx.font = `800 72px ${SYNE}`; ctx.fillStyle = rgba(CREAM, 1); ctx.shadowColor = 'rgba(2,3,14,0.9)'; ctx.shadowBlur = 16;
    const s = fmt(v); ctx.fillText(s, 66, 634); const w = ctx.measureText(s).width; ctx.restore();
    label(ctx, 'examples', 66 + w + 16, 632, { italic: true, size: 34, color: GOLD, a });
    // fine magnitude scale under the number (log ticks 10^0..10^6)
    ctx.save(); ctx.strokeStyle = rgba(GOLD, 0.7 * a); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(72, 660); ctx.lineTo(560, 660);
    for (let k = 0; k <= 60; k++) { const x = 72 + k * 488 / 60; ctx.moveTo(x, 660); ctx.lineTo(x, 660 + (k % 10 === 0 ? 10 : 4)); }
    ctx.stroke(); const x = 72 + 488 * p; ctx.fillStyle = rgba(GOLDB, a); ctx.beginPath(); ctx.moveTo(x, 656); ctx.lineTo(x - 5, 648); ctx.lineTo(x + 5, 648); ctx.fill(); ctx.restore();
  }

  function sceneB(ctx, t) { const GA = ctx.globalAlpha;
    const E = H.ease;
    const adj = E.inOut(sm(X.adjust[0], X.adjust[1], t));
    const rot0 = 0.34, rot1 = -0.12, rot = rot0 + (rot1 - rot0) * adj;
    const om = [{ rx: 236, ry: 76, rot, w: 0.34, ph: 0.4, r: 14, seed: 31, base: [214, 206, 196] }, { rx: 236, ry: 76, rot, w: 0.34, ph: 0.4 + Math.PI, r: 10, seed: 59, base: [200, 214, 222] },
      { rx: 168, ry: 118, rot: -0.7, w: -0.45, ph: 2.0, r: 10, seed: 47, base: [226, 190, 160] }];
    const mp = om.map((o) => { const th = o.ph + t * o.w + adj * 1.1 * (o.rot === rot ? 1 : 0); return { p: ellPt(PB.x, PB.y, o.rx, o.ry, o.rot, th), back: Math.sin(th) < 0, o }; });
    mp.filter((m) => m.back).forEach((m) => drawMoon(ctx, m.p[0], m.p[1], m.o.r * 0.9, m.o.seed, m.o.base));
    drawPlanet(ctx, PB.x, PB.y, PB.R);
    mp.filter((m) => !m.back).forEach((m) => drawMoon(ctx, m.p[0], m.p[1], m.o.r, m.o.seed, m.o.base));
    // ghost of the old orbit once it has been adjusted
    if (adj > 0) orbit(ctx, { cx: PB.x, cy: PB.y, rx: 236, ry: 76, rot: rot0, c: RED, a: 0.35 * adj, arrows: 0, gap: 9, r: 1, occl: [PB.x, PB.y, PB.R] });
    orbit(ctx, { cx: PB.x, cy: PB.y, rx: 236, ry: 76, rot, c: adj > 0 ? GOLDB : GOLD, a: 0.85, arrows: 4, crawl: t * 10, occl: [PB.x, PB.y, PB.R], r: 1.25 + adj * 0.4 * (1 - sm(9.6, 10.2, t)) });
    orbit(ctx, { cx: PB.x, cy: PB.y, rx: 168, ry: 118, rot: -0.7, c: CYAN, a: 0.6, arrows: 3, crawl: t * 10, occl: [PB.x, PB.y, PB.R] });
    // the target stars
    const sa = sm(X.stars, X.stars + 0.3, t);
    for (const [P, nm] of [[DOG, 'dog'], [CAT, 'cat']]) {
      spikeStar(ctx, P[0], P[1], 7, sa * 0.9, nm === 'dog' ? [200, 220, 255] : [255, 226, 180], 0.2);
    }
    // the new example arrives as a comet and parks top-left
    const eu = E.out(sm(X.exIn[0], X.exIn[1], t)), ep = [EXP[0] - 260 * (1 - eu), EXP[1] - 150 * (1 - eu)];
    if (t > X.exIn[0]) {
      const pts = []; for (let i = 0; i < 16; i++) { const uu = Math.max(0, eu - i * 0.06); pts.push([EXP[0] - 260 * (1 - uu) - i * 4 * (1 - eu), EXP[1] - 150 * (1 - uu) - i * 2.3 * (1 - eu)]); }
      comet(ctx, pts, 1 - 0.75 * sm(X.exIn[1], X.exIn[1] + 0.4, t), 0.8, null);
      glyph(ctx, 'cat', ep[0], ep[1], 60, GOLDB, sm(X.exIn[0], X.exIn[0] + 0.2, t));
      label(ctx, 'New example', 92, EXP[1] - 82, { size: 32, a: sm(X.exIn[1] - 0.1, X.exIn[1] + 0.2, t) });
      chartLine(ctx, EXP[0] + 30, EXP[1] + 62, PB.x - 70, PB.y - 92, { prog: E.out(sm(X.exIn[1], X.guess[0], t)), q: [EXP[0] + 90, EXP[1] + 110], a: 0.7, c: GOLD });
    }
    // labels on stars
    label(ctx, 'dog', DOG[0] + 38, DOG[1] + 14, { italic: true, size: 42, color: CREAM, a: sa * (1 - sm(X.guess[1] - 0.1, X.guess[1], t)) });
    label(ctx, 'cat', CAT[0] + 38, CAT[1] + 14, { italic: true, size: 42, color: CREAM, a: sa * (1 - sm(X.guess2[1] - 0.1, X.guess2[1], t)) });
    // GUESS: a beam from the model to the "dog" star
    const o0 = [PB.x + PB.R * 0.92, PB.y - 40];
    const g1 = E.inOut(sm(X.guess[0], X.guess[1], t)), wrong = sm(X.check, X.check + 0.12, t);
    const bc = H.mix(CYAN, RED, wrong);
    const fade1 = 1 - 0.55 * sm(X.guess2[0], X.guess2[0] + 0.3, t);
    if (g1 > 0) {
      const tip = chartLine(ctx, o0[0], o0[1], DOG[0] - 22, DOG[1] + 6, { prog: g1, c: bc, a: 0.95 * fade1, lw: 1.6, glowA: 0.18 });
      if (g1 < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow(CYAN), tip[0] - 20, tip[1] - 20, 40, 40); ctx.restore(); }
      label(ctx, 'Guess', 600, 404, { size: 36, color: H.mix(CYAN, CREAM, 0.3), a: sm(X.guess[0] + 0.15, X.guess[0] + 0.45, t) * fade1 });
      const dq = sm(X.guess[1] - 0.05, X.guess[1] + 0.15, t);
      label(ctx, 'dog?', DOG[0] + 38, DOG[1] + 14, { italic: true, size: 44, color: H.mix(CREAM, RED, wrong), a: dq });
    }
    // CHECK: red ring marker + cross, line turns red
    if (t > X.check) {
      const k = sm(X.check, X.check + 0.25, t), pulse = 1 + 0.5 * Math.exp(-(t - X.check) * 5);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = GA * 0.6 * Math.exp(-(t - X.check) * 3); ctx.drawImage(glow(RED), DOG[0] - 90, DOG[1] - 90, 180, 180); ctx.restore();
      marker(ctx, DOG[0], DOG[1], 28 * pulse, RED, k, 1.8);
      ctx.save(); ctx.strokeStyle = rgba(RED, k); ctx.lineWidth = 2.4; ctx.lineCap = 'round'; const cx = DOG[0] + 160, cy = DOG[1] - 2, s = 13 * k;
      ctx.beginPath(); ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s); ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s); ctx.stroke(); ctx.restore();
      label(ctx, 'Check', DOG[0] + 40, DOG[1] - 48, { size: 36, color: RED, a: sm(X.check + 0.05, X.check + 0.3, t) });
      label(ctx, 'it’s a cat', EXP[0] + 78, EXP[1] + 14, { italic: true, size: 32, color: GOLDB, a: sm(X.truth, X.truth + 0.25, t) });
    }
    // error signal travels back to the model along a curved return path
    const bk = sm(X.back[0], X.back[1], t);
    if (bk > 0) {
      const tip = chartLine(ctx, DOG[0] - 10, DOG[1] - 30, PB.x + 20, PB.y - PB.R - 14, { prog: E.inOut(bk), q: [700, 70], c: RED, a: 0.8 * fade1, dotted: true, lw: 1.8 });
      if (bk < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow(RED), tip[0] - 26, tip[1] - 26, 52, 52); ctx.restore(); }
      label(ctx, 'error', 676, 146, { italic: true, size: 34, color: RED, align: 'center', a: sm(X.back[0] + 0.2, X.back[0] + 0.45, t) * fade1 });
    }
    // ADJUST: the weights' orbit swings to a new tilt; curved arrow shows the turn
    const al = sm(X.adjust[0], X.adjust[0] + 0.3, t);
    const ae = ellPt(PB.x, PB.y, 236, 76, rot, 0.0);
    if (al > 0) {
      ctx.save(); ctx.strokeStyle = rgba(GOLDB, al); ctx.lineWidth = 1.6; ctx.beginPath();
      ctx.arc(PB.x, PB.y, 262, rot0 - 0.02, rot0 + (rot - rot0) - 0.02, true); ctx.stroke(); ctx.restore();
      const aa = rot - 0.02; chevron(ctx, PB.x + Math.cos(aa) * 262, PB.y + Math.sin(aa) * 262, aa - Math.PI / 2, 9, GOLDB, al, 1.8);
      label(ctx, 'Adjust', 400, 636, { size: 38, a: al, color: GOLDB });
      label(ctx, 'tilt the weights', 402, 674, { italic: true, size: 30, color: CREAM, a: sm(X.adjust[0] + 0.2, X.adjust[0] + 0.5, t) });
    }
    label(ctx, 'Weights', ae[0] + 30, ae[1] + 12, { size: 32, color: CYAN, a: sm(6.9, 7.2, t) * (1 - al) });
    // GUESS AGAIN: beam re-aimed to the "cat" star
    const g2 = E.inOut(sm(X.guess2[0], X.guess2[1], t));
    if (g2 > 0) {
      const o1 = [PB.x + PB.R * 0.9, PB.y + 10];
      const tip = chartLine(ctx, o1[0], o1[1], CAT[0] - 22, CAT[1] - 4, { prog: g2, c: GOLDB, a: 0.95, lw: 1.8, glowA: 0.22 });
      if (g2 < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow(GOLDB), tip[0] - 22, tip[1] - 22, 44, 44); ctx.restore(); }
      const ok = sm(X.guess2[1], X.guess2[1] + 0.2, t);
      if (ok > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = GA * 0.7 * Math.exp(-(t - X.guess2[1]) * 2.5); ctx.drawImage(glow(GOLDB), CAT[0] - 110, CAT[1] - 110, 220, 220); ctx.restore();
        marker(ctx, CAT[0], CAT[1], 28 * (1 + 0.4 * Math.exp(-(t - X.guess2[1]) * 5)), GOLDB, ok, 1.8);
        label(ctx, 'cat', CAT[0] + 40, CAT[1] + 14, { italic: true, size: 44, color: GOLDB, a: ok });
        ctx.save(); ctx.strokeStyle = rgba(GOLDB, ok); ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const cx = CAT[0] + 152, cy = CAT[1] - 2;
        ctx.beginPath(); ctx.moveTo(cx - 12, cy); ctx.lineTo(cx - 3, cy + 10 * ok); ctx.lineTo(cx - 3 + 18 * ok, cy - 14 * ok); ctx.stroke(); ctx.restore();
        label(ctx, 'Guess again', 960, 640, { size: 34, color: GOLDB, a: ok, align: 'right' });
      }
    }
  }

  function sceneC(ctx, t) { const GA = ctx.globalAlpha;
    const E = H.ease, x0 = 112, x1 = 742, yT = 150, yB = 600;
    const ya = (v) => yB - (v - 50) / 50 * (yB - yT);
    // atlas grid: curved meridians and parallels (conic projection feel)
    const ga = sm(10.5, 11.1, t);
    ctx.save(); ctx.strokeStyle = rgba(CYAN, 0.16 * ga); ctx.lineWidth = 1;
    for (let k = 0; k <= 6; k++) { const x = x0 + k * (x1 - x0) / 6; ctx.beginPath(); ctx.moveTo(x, yB); ctx.quadraticCurveTo(x + (x - 427) * 0.06, (yT + yB) / 2, x + (x - 427) * 0.1, yT); ctx.stroke(); }
    for (let v = 50; v <= 100; v += 10) { const y = ya(v); ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo(427, y - 22, x1 + 20, y); ctx.stroke(); }
    ctx.restore();
    // graduated axes
    ctx.save(); ctx.strokeStyle = rgba(GOLD, 0.85 * ga); ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(x0, yT - 10); ctx.lineTo(x0, yB); ctx.lineTo(x1 + 30, yB);
    for (let v = 50; v <= 100; v++) { const y = ya(v), l = v % 10 === 0 ? 14 : v % 5 === 0 ? 8 : 4; ctx.moveTo(x0, y); ctx.lineTo(x0 - l, y); }
    for (let k = 0; k <= 60; k++) { const x = x0 + k * (x1 - x0) / 60; ctx.moveTo(x, yB); ctx.lineTo(x, yB + (k % 10 === 0 ? 12 : 4)); }
    ctx.stroke(); ctx.restore();
    for (let v = 50; v <= 100; v += 10) label(ctx, v + '%', x0 - 20, ya(v) + 7, { size: 24, align: 'right', a: ga * 0.9, track: 0.02, color: GOLD });
    label(ctx, 'Training rounds', x0 + 4, yB + 50, { size: 34, a: ga });
    chevron(ctx, x1 + 30, yB, 0, 9, GOLD, ga);
    // the constellation forms, one star per round
    const pts = ACC.map((v, i) => [x0 + 34 + i * (x1 - x0 - 60) / 12, ya(v)]);
    ctx.save(); ctx.strokeStyle = rgba(GOLDB, 0.8); ctx.lineWidth = 1.3; ctx.lineCap = 'round';
    for (let i = 1; i < pts.length; i++) {
      const f = sm(X.pts0 + i * X.ptsDt - 0.1, X.pts0 + i * X.ptsDt, t); if (f <= 0) continue;
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], L = Math.hypot(bx - ax, by - ay), dx = (bx - ax) / L, dy = (by - ay) / L, g = 7;
      ctx.beginPath(); ctx.moveTo(ax + dx * g, ay + dy * g); ctx.lineTo(ax + dx * (g + (L - 2 * g) * f), ay + dy * (g + (L - 2 * g) * f)); ctx.stroke();
    }
    ctx.restore();
    pts.forEach((p, i) => { const a = sm(X.pts0 + i * X.ptsDt - 0.03, X.pts0 + i * X.ptsDt + 0.05, t); chartStar(ctx, p[0], p[1], 0.2 + 0.6 * i / 12, i === 0 ? CYAN : GOLDB, a); });
    // dotted best-fit arc behind the stars
    const fitA = sm(12.0, 12.5, t);
    if (fitA > 0) { ctx.save(); ctx.setLineDash([1.5, 6]); ctx.strokeStyle = rgba(CYAN, 0.5 * fitA); ctx.lineWidth = 1.2; ctx.beginPath(); pts.forEach((p, i) => { const y = ya(61 + 36 * (1 - Math.exp(-i / 3.0)) / (1 - Math.exp(-12 / 3.0))); i ? ctx.lineTo(p[0], y) : ctx.moveTo(p[0], y); }); ctx.stroke(); ctx.restore(); }
    // first point marker
    marker(ctx, pts[0][0], pts[0][1], 12, CYAN, sm(X.pts0, X.pts0 + 0.2, t));
    label(ctx, '61%', pts[0][0] + 22, pts[0][1] + 40, { size: 32, color: CYAN, a: sm(X.pts0, X.pts0 + 0.2, t), track: 0.04 });
    // stellar flare at 97%
    const hit = t - X.hit, last = pts[12];
    if (hit > -0.05) {
      const fl = hit < 0 ? 0 : Math.exp(-hit * 1.6) * 0.8 + 0.35;
      spikeStar(ctx, last[0], last[1], 9 + 16 * Math.exp(-hit * 2.2) * sm(-0.05, 0.05, hit), H.clamp(fl), [255, 228, 180], 0.0);
      marker(ctx, last[0], last[1], 22 + 30 * (1 - Math.exp(-Math.max(0, hit) * 4)), GOLDB, sm(0, 0.15, hit) * (0.5 + 0.5 * Math.exp(-hit * 2)), 1.6);
      if (hit > 0) { ctx.save(); ctx.strokeStyle = rgba(GOLDB, 0.6 * Math.exp(-hit * 2.5)); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(last[0], last[1], 30 + hit * 260, 0, TAU); ctx.stroke(); ctx.restore(); }
    }
    // the number
    const fi = H.clamp((t - X.pts0) / X.ptsDt, 0, 12), i0 = Math.floor(fi), v = i0 >= 12 ? 97 : ACC[i0] + (ACC[i0 + 1] - ACC[i0]) * (fi - i0);
    const na = sm(10.95, 11.25, t);
    label(ctx, 'Accuracy', 826, 262, { size: 40, a: na });
    ctx.save(); ctx.globalAlpha = GA * na; ctx.font = `800 116px ${SYNE}`; ctx.shadowColor = 'rgba(2,3,14,0.9)'; ctx.shadowBlur = 20;
    const fl2 = hit > 0 ? Math.exp(-hit * 2) : 0;
    ctx.fillStyle = rgba(H.mix(CREAM, GOLDB, sm(-0.1, 0.1, hit) * 0.85 + 0), 1); ctx.fillText(Math.round(v) + '%', 822, 404);
    if (fl2 > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.shadowBlur = 40; ctx.shadowColor = rgba(GOLDB, fl2); ctx.fillStyle = rgba(GOLDB, 0.35 * fl2); ctx.fillText(Math.round(v) + '%', 822, 404); }
    ctx.restore();
    const ra = sm(X.hit, X.hit + 0.3, t);
    label(ctx, 'from 61%', 830, 474, { italic: true, size: 34, color: CYAN, a: Math.max(sm(11.3, 11.6, t) * 0.8, ra) });
    ctx.save(); ctx.strokeStyle = rgba(GOLD, 0.7 * na); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(830, 290); ctx.lineTo(1190, 290); for (let x = 0; x <= 360; x += 12) { ctx.moveTo(830 + x, 290); ctx.lineTo(830 + x, 290 + (x % 60 === 0 ? 8 : 4)); } ctx.stroke(); ctx.restore();
  }

  function takeaway(ctx, W, t) {
    const [a, b, c] = X.take, E = H.ease;
    const ra = sm(a, a + 0.3, t);
    if (ra <= 0) return;
    const cx = W / 2, y1 = 300, y2 = 520;
    label(ctx, 'The takeaway', cx, 190, { size: 32, align: 'center', a: ra, track: 0.3 });
    ctx.save(); ctx.strokeStyle = rgba(GOLD, 0.8 * ra); ctx.lineWidth = 1; const hw = 150 * E.out(ra);
    ctx.beginPath(); ctx.moveTo(cx - 140 - hw, 178); ctx.lineTo(cx - 140, 178); ctx.moveTo(cx + 140, 178); ctx.lineTo(cx + 140 + hw, 178); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.font = `800 64px ${SYNE}`; ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(2,3,14,0.95)'; ctx.shadowBlur = 20;
    ctx.globalAlpha = ra; ctx.fillStyle = rgba(CREAM, 1); ctx.fillText('More examples', cx, y1 - 14 * (1 - E.out(sm(a, a + 0.35, t))));
    ctx.globalAlpha = sm(c, c + 0.3, t); ctx.fillStyle = rgba(GOLDB, 1); ctx.fillText('better guesses', cx, y2 - 14 * (1 - E.out(sm(c, c + 0.35, t))));
    const w2 = ctx.measureText('better guesses').width;
    ctx.restore();
    // the arrow is a dotted orbit arc with an arrowhead, swinging down from line one to line two
    const ap = E.inOut(sm(b, c, t));
    chartLine(ctx, cx, y1 + 34, cx, y2 - 70, { prog: ap, q: [cx + 90, (y1 + y2) / 2 - 20], c: GOLDB, a: 1, lw: 2, dotted: true });
    marker(ctx, cx, y1 + 34, 5, GOLD, sm(b - 0.1, b, t));
    // degree scale underline
    ctx.save(); ctx.strokeStyle = rgba(GOLD, 0.75 * sm(c, c + 0.4, t)); ctx.lineWidth = 1; const ul = w2 * E.out(sm(c, c + 0.5, t)), x0 = cx - w2 / 2;
    ctx.beginPath(); ctx.moveTo(x0, y2 + 26); ctx.lineTo(x0 + ul, y2 + 26); for (let x = 0; x <= ul; x += 9) { ctx.moveTo(x0 + x, y2 + 26); ctx.lineTo(x0 + x, y2 + 26 + (x % 45 === 0 ? 9 : 4)); } ctx.stroke(); ctx.restore();
  }

  function explainer(ctx, W, Hh, t) {
    const E = H.ease;
    const [w0, wm, w1] = X.warp;
    const warpIn = sm(w0, wm, t), warpOut = sm(wm, w1, t);
    const warp = t < wm ? E.in(warpIn) : 1 - E.out(warpOut);
    const pan = E.inOut(sm(X.pan[0], X.pan[1], t));
    const zA = H.lerp(0.62, 1, E.inOut(sm(X.push[0], X.push[1], t))) + 0.05 * sm(X.push[1], w0, t);
    const camZ = t < wm ? zA + 0.6 * warpIn : 1 + 0.6 * (1 - E.out(warpOut)) + 0.03 * sm(w1, X.pan[0], t);
    const tk = sm(X.take[0] - 0.1, X.take[0] + 0.45, t);
    sky(ctx, W, Hh, t, { x: t * 8, y: -720 * pan, z: camZ - 0.08 * E.inOut(tk), warp, bright: 0.35 + 0.65 * sm(0, 0.8, t), nx: 60, ny: 30, gal: [1440, 350, 1.0] });

    // ---- scene A: the model planet + data comets
    if (t < wm + 0.05) {
      ctx.save();
      ctx.globalAlpha = 1 - warpIn;
      ctx.translate(W / 2, Hh / 2); ctx.scale(zA, zA); ctx.translate(-W / 2, -Hh / 2);
      const ws = 1 + 3.2 * E.in(warpIn); ctx.translate(PA.x, PA.y); ctx.scale(ws, ws); ctx.translate(-PA.x, -PA.y);
      sceneA(ctx, t);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = 1 - sm(w0, w0 + 0.25, t); counterA(ctx, t); ctx.restore();
    }
    // ---- scene B: guess / check / adjust
    if (t > wm - 0.05 && t < X.pan[1] + 0.05) {
      ctx.save();
      ctx.globalAlpha = sm(wm - 0.05, wm + 0.3, t);
      ctx.translate(0, 720 * pan);
      const sb = 0.55 + 0.45 * E.out(sm(wm - 0.05, w1 + 0.05, t));
      ctx.translate(W / 2, Hh / 2); ctx.scale(sb, sb); ctx.translate(-W / 2, -Hh / 2);
      const punch = 0.05 * E.inOut(sm(X.check - 0.05, X.check + 0.3, t)) * (1 - E.inOut(sm(X.back[0], X.adjust[0], t)));
      ctx.translate(DOG[0], DOG[1]); ctx.scale(1 + punch, 1 + punch); ctx.translate(-DOG[0], -DOG[1]);
      sceneB(ctx, t);
      ctx.restore();
    }
    // ---- scene C: the accuracy constellation (above scene B; camera tilts up), then the takeaway
    const rec = E.inOut(tk);
    if (t > X.pan[0] - 0.05) {
      if (tk < 1) {
      ctx.save();
      ctx.translate(0, -720 * (1 - pan));
      ctx.globalAlpha = 1 - rec;
      ctx.translate(W / 2, 330); ctx.scale(1 - 0.1 * rec, 1 - 0.1 * rec); ctx.translate(-W / 2, -330 - 50 * rec);
      sceneC(ctx, t);
      ctx.restore();
      }
      if (tk > 0) { ctx.save(); const g = ctx.createRadialGradient(W / 2, 360, 40, W / 2, 360, 520); g.addColorStop(0, rgba([3, 4, 12], 0.6 * rec)); g.addColorStop(1, rgba([3, 4, 12], 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh); ctx.restore(); }
      takeaway(ctx, W, t);
    }
    // ---- header: hook title shrinks into the corner
    {
      const sh = E.inOut(sm(X.shrink[0], X.shrink[1], t));
      ctx.save(); ctx.font = `800 70px ${SYNE}`; const s = 'How does AI learn?', tw = ctx.measureText(s).width;
      const bx = W / 2 - tw / 2, by = 250, sx = 40, sy = 62, sc = 1 + (36 / 70 - 1) * sh;
      const x = bx + (sx - bx) * sh, y = by + (sy - by) * sh;
      ctx.translate(x, y); ctx.scale(sc, sc);
      const n = s.length, rev = sm(X.hookIn[0], X.hookIn[1], t) * n;
      ctx.shadowColor = 'rgba(2,3,14,0.95)'; ctx.shadowBlur = 20; ctx.fillStyle = rgba(CREAM, 1);
      let cx = 0;
      for (let i = 0; i < n; i++) { const ch = s[i], cw = ctx.measureText(ch).width, a = H.clamp(rev - i); if (a > 0) { ctx.globalAlpha = a; ctx.fillText(ch, cx, -10 * (1 - a)); } cx += cw; }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      // fine graduated rule + subtitle under the big title (fades as it shrinks)
      const rp = E.out(sm(X.ruleIn[0], X.ruleIn[1], t)), ra = 1 - sm(X.shrink[0], X.shrink[0] + 0.4, t);
      ctx.strokeStyle = rgba(GOLD, 0.85 * ra); ctx.lineWidth = 1.2 / sc; ctx.beginPath(); ctx.moveTo(0, 28); ctx.lineTo(tw * rp, 28);
      for (let k = 0; k <= tw * rp; k += 12) { ctx.moveTo(k, 28); ctx.lineTo(k, 28 + (k % 60 === 0 ? 12 : 5)); } ctx.stroke();
      ctx.restore();
      label(ctx, 'a star chart of machine learning', W / 2, by - 84, { italic: true, size: 30, color: GOLD, align: 'center', a: sm(0.8, 1.2, t) * (1 - sm(X.shrink[0], X.shrink[0] + 0.3, t)) });
      if (sh > 0.9) { ctx.save(); ctx.strokeStyle = rgba(GOLD, 0.6 * sm(0.9, 1, sh)); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(40, 78); ctx.lineTo(40 + tw * 36 / 70, 78); ctx.stroke(); ctx.restore(); }
    }
    // ---- warp flash
    const fl = Math.exp(-Math.pow((t - wm) / 0.09, 2));
    if (fl > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(W / 2, Hh / 2, 0, W / 2, Hh / 2, 700); g.addColorStop(0, rgba([210, 235, 255], 0.75 * fl)); g.addColorStop(0.5, rgba([120, 90, 220], 0.3 * fl)); g.addColorStop(1, rgba([40, 20, 80], 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh); ctx.restore(); }
    H.vignette(ctx, W, Hh, 0.55, '1,2,8');
  }

  // ================================================================= SOUND
  function explainerSound(k) {
    const D = X.D, E = H.ease;
    // deep space pad: detuned low sines/triangles with slow swells, lowpassed
    const pad = (t, notes, dur, g = 1, o = {}) => notes.forEach((n, i) => {
      for (const det of [-6, 6]) k.tone(t, { f: n, type: i ? 'triangle' : 'sine', detune: det, dur, gain: 0.05 * g, a: o.a || dur * 0.4, hold: dur * 0.3, filter: 'lowpass', f2: o.cut || 900, q: 0.5, pan: (i - (notes.length - 1) / 2) * 0.35, verb: 0.5, minor: o.minor });
    });
    // soft low radar ping (sine + quiet fifth, long reverb tail, all under 1.5 kHz)
    const ping = (t, f = 880, g = 1, pan = 0, minor = true) => {
      k.tone(t, { f, dur: 0.9, gain: 0.12 * g, a: 0.004, verb: 0.6, pan, minor });
      k.tone(t, { f: k.hz(f) * 1.5, dur: 0.35, gain: 0.03 * g, a: 0.004, verb: 0.5, pan, minor });
    };
    // airy comet whoosh: pink noise band sweeping low -> mid -> low
    const airy = (t, dur, g = 1, pan = 0, top = 1300) => k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 220], [dur * 0.6, top], [dur, 380]], q: 0.7, gain: 0.13 * g, a: dur * 0.6, verb: 0.35, pan, minor: true });
    // throttled counter ticks: soft low tock under 1.5 kHz
    const counter = (val, a, b, gap, f, g = 1) => { let last = -1, prev = val(a); for (let t = a; t <= b; t += 0.002) { const v = val(t); if (v !== prev && t - last >= gap) { k.noise(t, { dur: 0.02, filter: 'bandpass', f, q: 4, gain: 0.22 * g, a: 0.001, pan: -0.35, minor: true }); k.tone(t, { f: f * 0.5, dur: 0.05, gain: 0.04 * g, pan: -0.35, minor: true }); last = t; } prev = v; } };

    // ---- bed: sub drone + slow evolving pad (dropped in voiceover mode via music/bed... pads are tones, mark minor)
    k.bed('room', 0, D, { gain: 0.5 });
    k.withMinor(() => {
      k.tone(0, { f: 'A1', dur: X.warp[0] + 0.3, gain: 0.07, a: 1.5, hold: X.warp[0] - 1.8, filter: 'lowpass', f2: 300, bus: 'amb' });
      pad(0.0, ['A2', 'E3', 'B3'], 3.2, 0.9, { a: 1.6 });
      pad(2.8, ['F2', 'C3', 'A3', 'E4'], 3.4, 0.8, { a: 1.2 });
      k.tone(X.warp[2], { f: 'D2', dur: X.pan[0] - X.warp[2] + 0.5, gain: 0.06, a: 0.8, hold: 2.6, filter: 'lowpass', f2: 300, bus: 'amb' });
      pad(6.7, ['D3', 'A3', 'E4'], 1.4, 0.65, { a: 0.6 });
      k.tone(X.pan[0], { f: 'C2', dur: D - X.pan[0], gain: 0.06, a: 1.0, hold: 2.5, filter: 'lowpass', f2: 300, bus: 'amb' });
    });

    // ---- hook: title letters reveal; graduated rule draws; title slides to the corner
    k.noise(0.1, { dur: 1.1, color: 'pink', filter: 'bandpass', f: [[0, 200], [1.1, 700]], q: 0.8, gain: 0.08, a: 0.8, verb: 0.4 });
    ping(0.95, 'A4', 0.9, 0);
    k.noise(X.shrink[0], { dur: 0.8, color: 'pink', filter: 'lowpass', f: [[0, 260], [0.45, 700], [0.8, 260]], gain: 0.12, a: 0.35, minor: true });

    // ---- degree ring + orbits draw on (0.6-2.5): faint scanning sweep
    k.noise(0.6, { dur: 1.8, color: 'pink', filter: 'bandpass', f: [[0, 400], [1.8, 900]], q: 3, gain: 0.04, a: 0.9, minor: true });

    // ---- labels land: radar pings
    ping(X.model, 'E5', 1.7, 0.5, false);
    ping(X.weights, 'B4', 0.9, 0.4);

    // ---- comets stream in: airy whoosh on approach, soft ping on arrival at the planet
    X.comets.forEach((c, i) => {
      airy(c.t0 + 0.1, c.dur * 0.9, 0.9, -0.6 + 0.1 * (i % 4));
      ping(c.t0 + c.dur, ['A4', 'C5', 'E5', 'A4', 'G4', 'E5', 'C5', 'A5'][i], 0.55, 0.35);
    });
    // examples counter 10^(6p): ticks, throttled, then a lock ping
    counter((t) => Math.round(Math.pow(10, 6 * E.inOut(sm(X.count[0], X.count[1], t)))), X.count[0], X.count[1] - 0.02, 0.1, 1100, 0.8);
    ping(X.count[1], 'A4', 1.1, -0.4, false);

    // ---- warp: deep sub rumble + rising airy streak, a soft bloom at the midpoint
    const [w0, wm, w1] = X.warp;
    k.tone(w0 - 0.1, { f: [[0, 55], [wm - w0, 34], [w1 - w0 + 0.4, 28]], dur: w1 - w0 + 0.6, gain: 0.42, a: wm - w0, hold: 0.05 });
    k.noise(w0, { dur: w1 - w0 + 0.3, color: 'brown', filter: 'lowpass', f: [[0, 120], [wm - w0, 600], [w1 - w0 + 0.3, 90]], gain: 0.4, a: wm - w0 });
    k.noise(w0, { dur: w1 - w0, color: 'pink', filter: 'bandpass', f: [[0, 300], [wm - w0, 1600], [w1 - w0, 300]], q: 0.8, gain: 0.12, a: wm - w0 - 0.05, verb: 0.4 });
    k.tone(wm, { f: 'A2', dur: 1.2, gain: 0.08, a: 0.01, verb: 0.6 });

    // ---- scene B
    airy(X.exIn[0], X.exIn[1] - X.exIn[0] + 0.15, 1, -0.6);                  // new example comet arrives
    ping(X.exIn[1], 'C5', 0.8, -0.6);
    ping(X.stars, 'E4', 0.6, 0.5); ping(X.stars + 0.06, 'G4', 0.5, 0.6);       // two target stars appear
    // guess beam: a soft rising glide while the line draws
    k.tone(X.guess[0], { f: [[0, 'A3'], [X.guess[1] - X.guess[0], 'E4']], type: 'sine', dur: X.guess[1] - X.guess[0] + 0.1, gain: 0.06, a: 0.2, filter: 'lowpass', f2: 1200, verb: 0.3, pan: 0.2, minor: true });
    ping(X.guess[1], 'E5', 0.8, 0.5, false);                                   // "dog?" lands
    // CHECK: wrong. Low dissonant swell (minor second + tritone, detuned saws, dark lowpass)
    ['Bb2', 'B2', 'F3'].forEach((n, i) => k.tone(X.check, { f: n, type: 'sawtooth', detune: (i - 1) * 9, dur: 1.1, gain: 0.07, a: 0.05, hold: 0.4, filter: 'lowpass', f2: [[0, 300], [0.15, 900], [1.1, 300]], q: 1, pan: 0.5, verb: 0.4 }));
    k.tone(X.check, { f: [[0, 90], [0.4, 60]], dur: 0.6, gain: 0.3, a: 0.01 });
    // error signal travels back: a falling dark glide + red pulse
    k.tone(X.back[0], { f: [[0, 'E4'], [X.back[1] - X.back[0], 'A2']], type: 'triangle', dur: X.back[1] - X.back[0] + 0.1, gain: 0.07, a: 0.15, filter: 'lowpass', f2: 900, pan: -0.2, verb: 0.3 });
    ping(X.back[1], 'A3', 0.8, -0.5);
    // ADJUST: the orbit swings; a slow low whoosh and a settling ping
    k.noise(X.adjust[0], { dur: X.adjust[1] - X.adjust[0] + 0.2, color: 'pink', filter: 'bandpass', f: [[0, 250], [0.4, 800], [0.85, 300]], q: 1.2, gain: 0.12, a: 0.35, pan: -0.4, verb: 0.3 });
    k.tone(X.adjust[0], { f: [[0, 'D3'], [0.65, 'A3']], type: 'triangle', dur: 0.75, gain: 0.05, a: 0.3, filter: 'lowpass', f2: 900, verb: 0.3, pan: -0.4, minor: true });
    ping(X.adjust[1], 'D5', 0.7, -0.4);
    // guess again -> "cat" correct: warm consonant swell
    k.tone(X.guess2[0], { f: [[0, 'A3'], [X.guess2[1] - X.guess2[0], 'E4']], dur: X.guess2[1] - X.guess2[0] + 0.1, gain: 0.06, a: 0.2, filter: 'lowpass', f2: 1200, verb: 0.3, pan: 0.2, minor: true });
    pad(X.guess2[1], ['D3', 'A3', 'F#4', 'A4'], 1.5, 1.6, { a: 0.06, cut: 1400 });
    ping(X.guess2[1], 'A5', 0.9, 0.5, false);

    // ---- tilt-up pan to the accuracy chart: smooth low air
    k.noise(X.pan[0], { dur: X.pan[1] - X.pan[0] + 0.2, color: 'pink', filter: 'bandpass', f: [[0, 200], [0.4, 700], [0.85, 220]], q: 0.8, gain: 0.14, a: 0.35, verb: 0.3 });
    // constellation stars appear one per round: soft pings rising in pitch
    const scale = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6'];
    for (let i = 0; i < 13; i++) ping(X.pts0 + i * X.ptsDt, scale[i] === 'C6' ? 'A5' : scale[i] === 'D6' ? 'C6' : scale[i], 0.6, -0.3 + i * 0.05);
    // big low bloom with shimmer at 97%
    k.tone(X.hit, { f: 'C2', dur: 2.6, gain: 0.32, a: 0.03, hold: 0.4, verb: 0.4 });
    k.tone(X.hit, { f: [[0, 70], [0.3, 45]], dur: 0.6, gain: 0.35, a: 0.005 });
    pad(X.hit, ['C3', 'G3', 'E4', 'B4'], 2.2, 2.0, { a: 0.04, cut: 1600 });
    k.noise(X.hit, { dur: 1.6, color: 'pink', filter: 'bandpass', f: [[0, 2200], [1.6, 900]], q: 2, gain: 0.07, a: 0.1, verb: 0.6 });
    ['E5', 'G5', 'B5', 'C6', 'E6'].forEach((n, i) => k.tone(X.hit + 0.08 + i * 0.07, { f: n, dur: 1.4, gain: 0.025, a: 0.05, verb: 0.6, pan: -0.5 + i * 0.25 }));

    // ---- takeaway: recede, then a resolving warm pad as the line lands
    k.noise(X.take[0] - 0.1, { dur: 0.7, color: 'pink', filter: 'lowpass', f: [[0, 240], [0.4, 600], [0.7, 240]], gain: 0.1, a: 0.3, minor: true });
    k.tone(X.take[1], { f: [[0, 'C4'], [0.3, 'G4']], dur: 0.4, gain: 0.04, a: 0.15, filter: 'lowpass', f2: 1200, verb: 0.3, minor: true });
    pad(X.take[2], ['F2', 'C3', 'A3', 'E4'], D - X.take[2], 1.4, { a: 0.25, cut: 1200 });
    ping(X.take[2], 'C5', 1.0, 0, false); ping(X.take[2] + 0.12, 'G5', 0.6, 0.3, false);
  }

  registerStyle({
    id: 'cosmic',
    name: 'Cosmic Star Chart',
    category: 'Cosmic & Psychedelic',
    description: 'Deep-space illustration crossed with an engraved celestial atlas: fbm nebulae in teal, violet, rose and gold, a lit ringed gas giant with cratered moons, comets and a diffraction-spiked star, overlaid with hairline gold and pale-cyan chart work (dotted orbits with arrowheads, degree rings, ring markers, small-caps serif labels).',
    motion: 'The sky fades up star by star while the camera drifts in, the key star flares, the planet lights up, then the chart engraves itself over it: degree ring sweeping round, orbits dotting on, markers and labels landing, a comet streaking past.',
    fonts: [`600 26px ${CORM}`, `italic 400 26px ${CORM}`, `800 64px ${SYNE}`, `italic 400 26px ${BASK}`, `400 26px ${BASK}`],
    frameT: 5.8,
    duration: 6,
    readsPixels: false,
    draw(ctx, W, Hh, t) {
      const B = {
        sky: sm(0, 1.0, t), cam: sm(0, 6, t), star: sm(0.4, 1.2, t), planet: sm(0.8, 1.8, t),
        ring: H.ease.inOut(sm(1.5, 3.2, t)), orbits: H.ease.inOut(sm(1.8, 3.3, t)), labels: sm(2.8, 3.6, t),
        comet: sm(2.0, 5.2, t), const: sm(3.0, 4.4, t), title: sm(3.3, 4.6, t),
      };
      stillScene(ctx, W, Hh, t, B);
    },
    explainerDuration: X.D,
    explainerNote: 'Told as one celestial chart overlaid on deep space: the model is a ringed planet whose moons are its weights, cat/dog examples arrive as constellation-headed comets, a warp streak changes scene, the guess is a chart beam to a labelled star that turns red with a red ring marker, the weights’ orbit visibly tilts, the camera tilts up to an atlas chart where the accuracy constellation forms and flares at 97%; numbers are big Syne figures over graduated sextant scales.',
    explainer,
    explainerSound,
  });
}
