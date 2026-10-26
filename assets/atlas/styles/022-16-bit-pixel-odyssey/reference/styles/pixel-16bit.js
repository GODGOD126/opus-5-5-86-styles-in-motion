{
  // ---------- SNES-era 16-bit pixel art: 320x180 internal buffer, scaled x4 nearest-neighbour ----------
  const LW = 320, LH = 180;
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const bay = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
  const C = (h) => H.hex(h);

  // master palette (~40 colours, like a few SNES CGRAM rows)
  const P = {
    sky: ['#140c34', '#1e1146', '#2c1658', '#43206a', '#632a78', '#8c357c', '#b8457a', '#e05c72', '#f6806a', '#ffaa6e', '#ffd28a'].map(C),
    star: C('#fff4d8'), starDim: C('#a88ac8'),
    sunHi: C('#fff6c2'), sunMid: C('#ffd27a'), sunLo: C('#ff9a5c'),
    cloud: C('#7a3478'), cloudLit: C('#e8687a'), cloudHot: C('#ffb08a'),
    mtFar: C('#6a3478'), mtFarLit: C('#b0507e'), mtNear: C('#3e1f5e'), mtNearLit: C('#7a3670'),
    bldBack: C('#2a1850'), bldBackLit: C('#4a2a6a'), bldFront: C('#170d30'), bldFrontLit: C('#38205a'),
    winY: C('#ffd27a'), winC: C('#6ef0ff'), winP: C('#ff6ab0'), winDim: C('#5a3a7a'),
    core: C('#c8fcff'), coreMid: C('#4ad8ff'), coreDeep: C('#1a78c8'),
    red: C('#ff3a4a'),
    roof: C('#0c0820'), roofTop: C('#2a1a44'), roofRim: C('#d0607a'), roofMid: C('#1a1032'),
    K: C('#0a0618'),
  };

  // hero sprite (faces right, looking at the city)
  const HERO = [
    '.....KKKK......',
    '....KHHHHK.....',
    '...KHHhHHHK....',
    '...KHHHHSSHK...',
    '...KHHHSSKSK...',
    '...KHhSSSSSK...',
    '....KHSSSSK....',
    '.....KKSSKK....',
    '....KJJJJJJK...',
    '...KJJjJJJJK...',
    '..KJJjJJJJJSK..',
    '..KJJjJJJJKSK..',
    '..KJjjJJJJKKK..',
    '...KJJJJJJK....',
    '...KcccccccK...',
    '...KPPPKPPPK...',
    '...KPPpKPPPK...',
    '...KPPpKKPPK...',
    '...KPPK.KPPK...',
    '..KBBBK.KBBBK..',
    '..KBBBBKKBBBBK.',
    '...KKKK..KKKK..',
  ];
  const HERO_WALK = HERO.slice(0, 18).concat(['..KPPK..KPPK...', '.KBBBK...KBBK..', '.KBBBBK..KBBBBK', '..KKKK....KKKK.']);
  const HERO_PAL = { K: '#0a0618', H: '#ff5a8a', h: '#b02a6a', S: '#ffc8a0', J: '#3a6ad8', j: '#22408a', c: '#ffd27a', P: '#3a2a5a', p: '#22183a', B: '#b8456a' };
  // little drone companion
  const DRONE = [
    '...KKKKK...',
    '..KWWWWWK..',
    '.KWwwwwwWK.',
    'KWwKKKKKwWK',
    'KWKEEeEEKWK',
    'KWKEeeeEKWK',
    'KwwKKKKKwwK',
    '.KwwwwwwwK.',
    '..KKKKKKK..',
    '...K...K...',
  ];
  const DRONE_PAL = { K: '#0a0618', W: '#e8eef8', w: '#9aa8c8', E: '#4ad8ff', e: '#c8fcff' };

  // ================= EXPLAINER: "How does AI learn?" as a 16-bit RPG cutscene + battle =================
  const PX_CAT = ['K.........K', 'KK.......KK', 'KOK.....KOK', 'KOOKKKKKOOK', 'KOOOOOOOOOK', 'KOOKOOOKOOK', 'KOOOOPOOOOK', 'KWOOKOKOOWK', '.KOOOOOOOK.', '..KKKKKKK..'];
  const PX_DOG = ['..KKKKKKK..', '.KTTTTTTTK.', 'KBKTTTTTKBK', 'KBKTKTKTKBK', 'KBKTTTTTKBK', 'KBKTTKTTKBK', '.KKTTTTTKK.', '..KTTPTTK..', '...KTTTK...', '....KKK....'];
  const PX_PET_PAL = { K: '#0a0618', O: '#ff9a4a', W: '#fff4d8', P: '#ff6ab0', T: '#e8c890', B: '#8a5a3a' };
  let PX_NZ = null; // explainer backdrop noise (same seed as the hero's mountains), built once
  const PX_ARROW = ['KK.....','KYK....', 'KYYK...', 'KYYYK..', 'KYYYYK.', 'KYYYK..', 'KYYK...', 'KYK....', 'KK.....'];

  function pixExplainer(ctx, W, H_, t) {
    const T = Math.floor(t * 12) / 12; // 12 fps game tick for logic
    const prog = (a, b) => H.clamp((T - a) / (b - a));
    const buf = new Uint8ClampedArray(LW * LH * 4);
    const put = (x, y, c) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= LW || y >= LH) return; const i = (y * LW + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255; };
    const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c); };
    const dput = (x, y, c1, c2, a) => put(x, y, a > bay(x, y) ? c2 : c1);
    const sprite = (rows, pal, ox, oy, flip, scale = 1) => {
      const cp = {}; for (const k in pal) cp[k] = C(pal[k]);
      rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '.') return; const xx = flip ? row.length - 1 - i : i; for (let a = 0; a < scale; a++) for (let b = 0; b < scale; b++) put(ox + xx * scale + a, oy + j * scale + b, cp[ch]); }));
    };
    const tc = H.layer(LW, 24), tx = tc.getContext('2d', { willReadFrequently: true });
    const text = (str, x, y, col, shadow, size = 8, outline = null) => {
      tx.clearRect(0, 0, LW, 24); tx.font = size + 'px "Press Start 2P"'; tx.textBaseline = 'top'; tx.fillStyle = '#fff'; tx.fillText(str, 0, 0);
      const w = Math.min(LW, Math.ceil(tx.measureText(str).width) + 2), hh = size + 4, d = tx.getImageData(0, 0, w, hh).data;
      if (outline) for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) put(x + i + ox, y + j + oy, outline);
      if (shadow) for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) put(x + i + 1, y + j + 1, shadow);
      for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) put(x + i, y + j, col);
      return w - 2;
    };
    const white = C('#f8f8ff'), gold = C('#ffd27a'), ink = C('#0a0618'), grey = C('#9aa0c8'), red = C('#ff3a4a'), green = C('#6aff8a'), cyan = C('#6ef0ff');
    const WB = ['#4060d0', '#3450bc', '#2a42a6', '#22358e', '#1a2a78', '#142064'].map(C);
    const win = (x0, y0, w, h) => { // SNES RPG window
      for (let y = y0; y < y0 + h; y++) { const f = ((y - y0) / h) * (WB.length - 1), i = Math.min(WB.length - 2, Math.floor(f)), a = H.smooth(0.7, 1, f - i); for (let x = x0; x < x0 + w; x++) { if ((x === x0 || x === x0 + w - 1) && (y === y0 || y === y0 + h - 1)) continue; dput(x, y, WB[i], WB[i + 1], a); } }
      for (let x = x0 + 1; x < x0 + w - 1; x++) { put(x, y0, white); put(x, y0 + h - 1, white); put(x, y0 + 1, grey); put(x, y0 + h - 2, grey); put(x, y0 - 1, ink); put(x, y0 + h, ink); }
      for (let y = y0 + 1; y < y0 + h - 1; y++) { put(x0, y, white); put(x0 + w - 1, y, white); put(x0 + 1, y, grey); put(x0 + w - 2, y, grey); put(x0 - 1, y, ink); put(x0 + w, y, ink); }
    };
    const bubble = (x0, y0, w, h, tailX) => { rect(x0, y0, w, h, white); for (let x = x0; x < x0 + w; x++) { put(x, y0 - 1, ink); put(x, y0 + h, ink); } for (let y = y0; y < y0 + h; y++) { put(x0 - 1, y, ink); put(x0 + w, y, ink); } for (let k = 0; k < 4; k++) { for (let i = -k; i <= 0; i++) put(tailX + i + k, y0 + h + k, k === 3 ? ink : white); put(tailX + k + 1, y0 + h + k, ink); put(tailX - 1, y0 + h + k, ink); } };
    const hand = (x, y) => sprite(['.KKKK...', 'KWWWWKKK', 'KWWWWWWK', 'KWWWWKKK', '.KKKK...'], { K: '#0a0618', W: '#f8f8ff' }, x, y);
    const fmt = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const sky = (c0, c1, hz) => { for (let y = 0; y < LH; y++) { const f = Math.pow(H.clamp(y / hz), 1.2) * 5, i = Math.min(4, Math.floor(f)); const cA = H.mix(c0, c1, i / 5).map(Math.round), cB = H.mix(c0, c1, (i + 1) / 5).map(Math.round); for (let x = 0; x < LW; x++) dput(x, y, cA, cB, H.smooth(0.6, 1, f - i)); } };
    const stars = (n, seed) => { const r = H.rng(seed); for (let s = 0; s < n; s++) { const x = r.int(0, LW - 1), y = r.int(0, 90), ph = r() * 6.28; if (Math.sin(T * 3 + ph) > -0.3) put(x, y, y < 40 ? P.star : P.starDim); } };
    const mixc = (a, b, k) => H.mix(a, b, k).map(Math.round);
    // ---- backdrop kit shared with the hero still: rim-lit fbm mountains, lit-from-below cloud streaks, striped sun, lit skyline
    const nz = PX_NZ || (PX_NZ = H.makeNoise(77));
    const mountains = (base, amp, freq, seed, scroll, col, lit, sunX, yMax = LH) => {
      const hgt = [];
      for (let x = -1; x <= LW + 1; x++) { const u = (x + scroll) * freq; hgt.push(Math.round(base - amp * (Math.abs(nz.fbm2(u, seed, 3)) * 1.6 + 0.35 * nz.n2(u * 3.1, seed + 9)))); }
      for (let x = 0; x < LW; x++) {
        const top = hgt[x + 1], facing = hgt[x + 2] < hgt[x + 1] ? 0 : 1;
        for (let y = Math.max(0, top); y < yMax; y++) { const d = y - top; if (d < 2 && (facing || Math.abs(x - sunX) < 40)) put(x, y, lit); else if (d < 5 && facing) dput(x, y, col, lit, 0.5 - d * 0.1); else put(x, y, col); }
      }
    };
    const cloud = (cx, cy, w, h, cDark = P.cloud, cLit = P.cloudLit, cHot = P.cloudHot) => {
      for (let y = cy - h; y <= cy + h; y++) for (let x = Math.round(cx - w); x <= cx + w; x++) {
        const dx = (x - cx) / w, dy = (y - cy) / h, lump = 1 + 0.25 * Math.sin(x * 0.35 + cx);
        if (dx * dx + (dy * dy) / lump > 1) continue;
        put(x, y, dy > 0.55 ? cHot : dy > 0.15 ? cLit : cDark);
      }
    };
    const sun = (sx, sy, sr) => {
      for (let y = sy - sr; y <= sy + sr; y++) {
        const ry = (y - (sy - sr)) / (2 * sr);
        if (y > sy - 4) { const k = y - (sy - 4), gap = 1 + Math.floor(k / 9); if ((k % 7) < gap) continue; }
        for (let x = sx - sr; x <= sx + sr; x++) {
          if ((x - sx) ** 2 + (y - sy) ** 2 > sr * sr) continue;
          put(x, y, ry < 0.45 ? (ry < 0.3 ? P.sunHi : (0.3 + 0.15 * bay(x, y) > ry ? P.sunHi : P.sunMid)) : (ry < 0.55 ? P.sunMid : (ry - 0.55) * 3 > bay(x, y) ? P.sunLo : P.sunMid));
        }
      }
    };
    const skyline = (seed, base, minH, maxH, col, lit, winA, scroll, winOn = 0.3) => {
      const r = H.rng(seed); let bx = -24 - Math.round(scroll);
      while (bx < LW) {
        const w = r.int(9, 18), h = r.int(minH, maxH), top = base - h, rr = H.rng(seed * 31 + w * 7 + h);
        rect(bx, top, w, h, col); rect(bx, top, w, 1, lit); for (let y = top; y < base; y++) put(bx + w - 1, y, lit);
        if (rr.chance(0.35)) { const ah = rr.int(2, 6); for (let k = 1; k <= ah; k++) put(bx + (w >> 1), top - k, col); if (Math.sin(T * 4 + w) > 0) put(bx + (w >> 1), top - ah - 1, P.red); }
        const wc = rr.pick(winA);
        for (let wy = top + 2; wy < base - 1; wy += 2) for (let wx = bx + 1; wx < bx + w - 2; wx += 2) if (rr() < winOn) put(wx, wy, wc);
        bx += w + r.int(0, 3);
      }
    };

    // ---------------- scenes ----------------
    const sceneRoof = () => {
      sky(H.hex('#140c34'), H.hex('#e05c72'), 130); stars(50, 3);
      // dusk backdrop from the hero still: striped sun on the horizon, lit cloud streaks, two rim-lit mountain layers
      sun(266, 112, 24);
      const cd = T * 2;
      cloud(((40 + cd) % 380) - 30, 36, 30, 2); cloud(((250 + cd * 1.1) % 380) - 30, 26, 22, 2); cloud(((150 + cd * 0.7) % 380) - 30, 70, 38, 2); cloud(((300 + cd * 0.9) % 380) - 30, 84, 26, 2);
      mountains(112, 26, 0.018, 3.3, T * 2, P.mtFar, P.mtFarLit, 266, 128);
      mountains(122, 16, 0.03, 8.1, T * 4, P.mtNear, P.mtNearLit, 266, 128);
      // horizon haze band where the city meets the mountains
      for (let y = 106; y < 122; y++) { const a = 0.4 * (1 - Math.abs(y - 114) / 8); for (let x = 0; x < LW; x++) if (a > bay(x, y)) { const i = (y * LW + x) * 4; put(x, y, mixc([buf[i], buf[i + 1], buf[i + 2]], P.cloudLit, 0.35)); } }
      // skyline + rooftop
      const r = H.rng(9); let bx = 0; while (bx < LW) { const w = r.int(10, 22), h = r.int(16, 50); rect(bx, 140 - h, w, h + 40, P.bldBack); rect(bx, 140 - h, w, 1, P.bldBackLit); for (let y = 140 - h; y < 128; y++) put(bx + w - 1, y, P.bldBackLit); for (let wy = 140 - h + 3; wy < 136; wy += 3) for (let wx = bx + 2; wx < bx + w - 2; wx += 2) if (r() < 0.35) put(wx, wy, r() < 0.5 ? P.winY : P.winC); bx += w + 1; }
      rect(0, 128, LW, 52, P.roof); rect(0, 128, LW, 1, P.roofRim); rect(0, 129, LW, 1, P.roofTop);
      for (let y = 130; y < LH; y++) for (let x = 0; x < LW; x++) if (((x + y) & 7) === 0 && y % 2) put(x, y, P.roofMid);
      for (let x = 0; x < LW; x++) { put(x, 119, P.K); put(x, 123, P.K); if (x % 12 === 4) for (let y = 119; y < 128; y++) put(x, y, P.K); if (x % 3 === 0) put(x, 118, P.roofRim); }
      for (let x = 113; x < 140; x++) put(x, 129, P.K); // hero contact shadow
      sprite(HERO, HERO_PAL, 112, 128 - HERO.length * 2, false, 2);
      sprite(DRONE, DRONE_PAL, 160, 58 + Math.round(Math.sin(T * 3) * 2), false, 3);
      if (T > 0.3) { const k = Math.floor(T * 6) % 3; for (let i = 0; i < 3; i++) if (i <= k) { put(196 + i * 6, 54 - i * 4, gold); put(197 + i * 6, 53 - i * 4, gold); } }
    };
    const sceneHall = () => { // training hall: data conveyor into the MODEL
      sky(H.hex('#0c0a2a'), H.hex('#3a1e6a'), 110);
      // tall hall windows looking out on the dusk city (dimmed hero backdrop, slow parallax)
      const WIN = [0, 1, 2, 3].map((i) => [10 + i * 78, 64]), WY0 = 22, WY1 = 94;
      for (let y = WY0; y < WY1; y++) { const f = Math.pow((y - WY0) / (WY1 - WY0), 1.1) * 7 + 1, i = Math.min(8, Math.floor(f)); for (let x = 0; x < LW; x++) dput(x, y, P.sky[i], P.sky[i + 1], H.smooth(0.55, 1, f - i)); }
      cloud(((60 + T * 2) % 380) - 30, 40, 30, 2); cloud(((230 + T * 1.5) % 380) - 30, 56, 36, 2);
      mountains(88, 22, 0.02, 3.3, T * 2, P.mtFar, P.mtFarLit, 300, WY1);
      mountains(93, 10, 0.034, 8.1, T * 3, P.mtNear, P.mtNearLit, 300, WY1);
      skyline(77, 96, 6, 24, P.bldBack, P.bldBackLit, [P.winY, P.winY, P.winC, P.winP], T * 4);
      // wall, window frames, mullions, sills
      const wallA = C('#1c1244'), wallB = C('#120a30'), frame = C('#2e1e5e'), frameLit = C('#6a4aa8');
      const winCol = new Uint8Array(LW); WIN.forEach(([x0, w]) => winCol.fill(1, x0, x0 + w));
      for (let y = 0; y < 110; y++) for (let x = 0; x < LW; x++) {
        const inWin = y >= WY0 && y < WY1 && winCol[x];
        if (!inWin) dput(x, y, wallA, wallB, y / 110 * 0.8 + (((x + 39) % 78) < 4 ? 0.3 : 0));
      }
      WIN.forEach(([x0, w]) => {
        for (let x = x0 - 2; x < x0 + w + 2; x++) { put(x, WY0 - 2, frameLit); put(x, WY0 - 1, frame); put(x, WY1, frameLit); put(x, WY1 + 1, frame); put(x, WY1 + 2, P.K); }
        for (let y = WY0 - 1; y < WY1; y++) { put(x0 - 1, y, frame); put(x0 + w, y, frameLit); put(x0 + (w >> 1), y, frame); put(x0 + (w >> 1) + 1, y, P.K); }
        for (let x = x0; x < x0 + w; x++) { put(x, 40, frame); put(x, 41, P.K); }
        // glass glint: two diagonal light streaks
        for (let k = 0; k < 10; k++) { if (0.45 > bay(x0 + 4 + k, WY0 + 14 - k)) put(x0 + 4 + k, WY0 + 14 - k, C('#c8a8e8')); if (0.3 > bay(x0 + 8 + k, WY0 + 16 - k)) put(x0 + 8 + k, WY0 + 16 - k, C('#a888d0')); }
      });
      // baseboard
      rect(0, 104, LW, 6, C('#0e0826')); rect(0, 104, LW, 1, frame);
      // floor: perspective grid (spacing grows toward the viewer), window light pooled on the gloss, fade into the horizon
      const fl = C('#22145a'), flLine = C('#5a3a9a'), glow = C('#4a2a8a'), pool = C('#34206e');
      for (let y = 110; y < LH; y++) {
        const dz = 48 / (y - 104), dz1 = 48 / (y + 1 - 104), hLine = Math.floor(dz) !== Math.floor(dz1), lineA = H.clamp((y - 112) / 22), hz = H.clamp(1 - (y - 110) / 16);
        const spread = 1 + (y - 110) * 0.012, poolA = (1 - (y - 110) / 40) * 0.75;
        const pools = y < 150 ? WIN.map(([x0, w]) => [160 + (x0 + w / 2 - 160) * spread, w * 0.42 * spread]) : [];
        for (let x = 0; x < LW; x++) {
          let c = hz > bay(x, y) ? glow : fl;
          if (poolA > bay(x, y) && pools.some(([cx, hw]) => Math.abs(x - cx) < hw)) c = pool;
          if (hLine && lineA > bay(x, y)) c = flLine;
          put(x, y, c);
        }
      }
      for (let k = -12; k <= 12; k++) { for (let y = 110; y < LH; y++) { const x = Math.round(160 + k * (y - 104) * 0.9); if (H.clamp((y - 108) / 18) > bay(x, y)) put(x, y, flLine); } }
      for (let x = 0; x < 236; x++) put(x, 110, P.K); // belt shadow on the floor
      // conveyor belt
      rect(0, 100, 236, 8, C('#2a2a4a')); for (let x = 0; x < 236; x++) { put(x, 100, C('#8a8ab8')); put(x, 107, P.K); if ((x + Math.floor(T * 24)) % 8 === 0) for (let y = 101; y < 107; y++) put(x, y, C('#4a4a7a')); }
      // MODEL: the drone, 3x, on a pedestal, label landing under it
      const absorb = Math.floor((T - 2.95) / 0.33) >= 0 && ((T - 2.95) % 0.33) < 0.09 && T < 5.9;
      rect(238, 108, 64, 6, C('#5a3a9a')); rect(238, 108, 64, 1, C('#a88ac8'));
      sprite(DRONE, absorb ? { K: '#0a0618', W: '#ffffff', w: '#ffffff', E: '#ffffff', e: '#ffffff' } : DRONE_PAL, 254, 70 + Math.round(Math.sin(T * 3) * 1), false, 3);
      win(244, 118, 52, 14); text('MODEL', 251, 121, white, ink);
      // training-data label + chevrons flowing along the belt
      win(54, 48, 112, 14); text('TRAINING DATA', 59, 51, gold, ink);
      for (let k = 0; k < 6; k++) { const x = ((k * 40 + Math.floor(T * 48)) % 240); if (x < 228) sprite(PX_ARROW, { K: '#0a0618', Y: '#ffd27a' }, x, 110, false); }
      // labelled example cards riding the belt (pixel-stepped)
      for (let i = 0; i < 12; i++) {
        const t0 = 2.6 + i * 0.27, k = (T - t0) / 1.1; if (k < 0 || k >= 1) continue;
        const x = Math.round(-30 + k * 268), isCat = i % 3 !== 1, y = 74;
        rect(x, y, 26, 24, white); rect(x, y, 26, 1, ink); rect(x, y + 23, 26, 1, ink); rect(x, y, 1, 24, ink); rect(x + 25, y, 1, 24, ink);
        sprite(isCat ? PX_CAT : PX_DOG, PX_PET_PAL, x + 2, y + 2, false, 2);
        rect(x, y + 25, 26, 10, isCat ? C('#ffd27a') : C('#ff6ab0')); text(isCat ? 'CAT' : 'DOG', x + 1, y + 26, ink, null);
      }
      // examples counter window
      win(8, 134, 196, 42); text('EXAMPLES SEEN', 16, 139, cyan, ink);
      text(fmt(1e6 * Math.pow(prog(2.9, 5.6), 2.2)), 16, 153, white, ink, 16);
    };
    const sceneBattle = () => {
      // backdrop
      sky(H.hex('#1a0c3a'), H.hex('#b8457a'), 100); stars(24, 5);
      // JRPG battle background: lit cloud streaks, far + near rim-lit ranges, rolling dithered hills, banded field
      cloud(((20 + T * 3) % 380) - 30, 30, 34, 2); cloud(((200 + T * 2) % 380) - 30, 58, 28, 2); cloud(((120 + T * 2.5) % 380) - 30, 74, 40, 2);
      mountains(92, 30, 0.016, 5.7, T * 1.5, P.mtFar, P.mtFarLit, 160, 120);
      mountains(102, 16, 0.028, 2.2, T * 3, P.mtNear, P.mtNearLit, 160, 120);
      const hillA = C('#2e1650'), hillB = C('#43206a'), hillLit = C('#9a4a86'), field = [C('#3e1f5e'), C('#4c2468')];
      const hTop = []; for (let x = 0; x < LW; x++) hTop.push(Math.round(106 + 4 * nz.n2((x + T * 6) * 0.025, 4.4) + 2 * Math.sin((x + T * 6) * 0.07)));
      for (let x = 0; x < LW; x++) for (let y = hTop[x]; y < 114; y++) { const d = y - hTop[x]; put(x, y, d < 1 ? hillLit : d < 3 ? (0.5 > bay(x, y) ? hillLit : hillB) : (((y + 1) >> 1) % 3 === 0 && 0.5 > bay(x, y)) ? hillB : hillA); }
      for (let y = 114; y < 136; y++) {
        const dz = 30 / (y - 100) + T * 1.2, band = Math.floor(dz) & 1, fr = dz - Math.floor(dz);
        for (let x = 0; x < LW; x++) { const c0 = field[band], c1 = field[band ^ 1]; put(x, y, fr > 0.82 && (fr - 0.82) * 5.5 > bay(x, y) ? c1 : c0); }
      }
      for (let x = 0; x < LW; x++) put(x, 114, C('#24103e'));
      const phase = T < 7.4 ? 0 : T < 8.3 ? 1 : T < 9.4 ? 2 : 0;
      // enemy: the new picture (a cat), framed; it shakes when hit
      const shake = (T > 7.45 && T < 7.8) ? (Math.floor(T * 24) % 2 ? 2 : -2) : 0;
      const ex = 40 + shake, ey = 40;
      rect(ex - 4, ey - 4, 52, 48, white); rect(ex - 5, ey - 5, 54, 1, ink); rect(ex - 5, ey + 44, 54, 1, ink); rect(ex - 5, ey - 5, 1, 50, ink); rect(ex + 48, ey - 5, 1, 50, ink);
      sprite(PX_CAT, PX_PET_PAL, ex + 2, ey + 1, false, 4);
      win(ex - 8, ey + 48, 66, 14); text('NEW PIC', ex - 3, ey + 51, white, ink);
      // party: the model (drone) with its name tag
      const dx = 228, dy = 52 + Math.round(Math.sin(T * 3) * 2);
      sprite(DRONE, DRONE_PAL, dx, dy, true, 3);
      win(dx - 4, 88, 52, 14); text('MODEL', dx + 3, 91, white, ink);
      // command window (the loop) + cursor
      win(4, 120, 96, 56);
      ['GUESS', 'CHECK', 'ADJUST'].forEach((nm, i) => text(nm, 26, 128 + i * 15, i === phase ? gold : white, ink));
      hand(10 + (Math.floor(T * 6) % 2), 129 + phase * 15);
      // weights window: three stat bars that change during ADJUST
      win(104, 120, 212, 56); text('WEIGHTS', 112, 125, cyan, ink);
      const adj = Math.floor(prog(8.6, 9.2) * 4) / 4;
      [[0.3, 0.75], [0.8, 0.45], [0.55, 0.9]].forEach(([a, b], i) => {
        const v = H.lerp(a, b, adj), y = 138 + i * 12, flashBar = adj > 0 && adj < 1 && Math.floor(T * 12) % 2 === 0;
        text('W' + (i + 1), 112, y - 1, white, ink);
        rect(136, y, 120, 6, ink); rect(137, y + 1, Math.round(118 * v), 4, flashBar ? white : H.mix(C('#4ad8ff'), C('#6aff8a'), v).map(Math.round));
      });
      // GUESS 1: "DOG?" bubble from the model
      if (T > 6.5 && T < 9.4) { bubble(dx - 76, 22, 74, 24, dx - 8); text('DOG?', dx - 71, 26, ink, null, 16); }
      // CHECK: MISS! damage pop + message
      if (T > 7.4 && T < 8.4) {
        const k = T - 7.4, by = Math.round(20 - Math.max(0, 8 - k * 40) + (k < 0.2 ? -Math.sin(k * 15) * 6 : 0));
        text('MISS!', ex + 2, ey + by - 10, red, C('#5a0814'), 16, ink);
        win(102, 100, 116, 16); text("IT'S A CAT!", 116, 104, white, ink);
      }
      // ADJUST: error travels back from the picture to the model (dotted red pixels)
      if (T > 8.3 && T < 9.4) {
        const k = prog(8.3, 8.8), x0 = ex + 50, x1 = dx - 4;
        for (let x = x0; x < x0 + (x1 - x0) * k; x += 3) { const y = Math.round(70 + Math.sin((x - x0) / (x1 - x0) * Math.PI) * -18); rect(x, y, 2, 2, red); }
        if (k > 0.3) text('ERROR', 132, 44, red, C('#5a0814'), 8, ink);
      }
      // GUESS 2: correct
      if (T > 9.5) {
        bubble(dx - 76, 22, 74, 24, dx - 8); text('CAT!', dx - 71, 26, C('#1a7a3a'), null, 16);
        if (T > 9.75) { const k = T - 9.75; text('HIT!', ex + 6, ey + Math.round(10 - Math.min(8, k * 40)), green, C('#0a4a2a'), 16, ink); }
      }
      // round counter (loop is repeated)
      text('ROUND ' + String(1 + Math.floor(Math.max(0, T - 6.2) * 2.5)).padStart(3, '0'), 232, 108, gold, ink);
    };
    const sceneLevel = () => {
      // night falls over the city: hero sky gradient with a dithered horizon glow, far ranges and a lit skyline
      sky(H.hex('#0c0a2a'), H.hex('#e05c72'), 180); stars(40, 8);
      cloud(((80 + T * 2) % 380) - 30, 136, 40, 2); cloud(((260 + T * 1.6) % 380) - 30, 128, 30, 2);
      mountains(152, 22, 0.018, 3.3, T * 2, P.mtFar, P.mtFarLit, 240);
      mountains(162, 14, 0.03, 8.1, T * 3, P.mtNear, P.mtNearLit, 240);
      skyline(404, LH, 10, 34, P.bldBack, P.bldBackLit, [P.winY, P.winY, P.winC, P.winP], T * 5, 0.35);
      for (let y = 146; y < 162; y++) { const a = 0.36 * (1 - Math.abs(y - 154) / 8); for (let x = 0; x < LW; x++) if (a > bay(x, y)) { const i = (y * LW + x) * 4; if (buf[i] + buf[i + 1] + buf[i + 2] < 260) put(x, y, mixc([buf[i], buf[i + 1], buf[i + 2]], P.cloudLit, 0.35)); } }
      win(10, 20, 300, 106);
      text('ACCURACY', 22, 32, cyan, ink);
      const p = prog(10.95, 12.4), val = Math.round(61 + 36 * H.ease.out(p));
      text(val + '%', 22, 46, white, ink, 16);
      text('61% > ' + val + '%', 22, 68, gold, ink);
      // EXP-style bar
      text('EXP', 22, 84, white, ink); rect(52, 84, 104, 8, ink); rect(53, 85, Math.round(102 * H.ease.out(p)), 6, H.mix(C('#4ad8ff'), C('#6aff8a'), p).map(Math.round));
      // bar chart of rounds (stepped growth)
      const ox = 176, oy = 112;
      for (let y = 30; y <= oy; y++) put(ox, y, white); for (let x = ox; x < ox + 124; x++) put(x, oy, white);
      text('ROUNDS', 238, 114, grey, ink);
      for (let i = 0; i < 10; i++) {
        const g = H.clamp(p * 10 - i); if (g <= 0) break;
        const h = Math.round(((97 - 36 * Math.exp(-i / 3)) / 100) * 78 * g);
        rect(ox + 4 + i * 12, oy - h, 9, h, H.mix(C('#4a2a8a'), C('#6aff8a'), i / 9).map(Math.round)); rect(ox + 4 + i * 12, oy - h, 9, 1, white);
      }
      // emphasis: LEVEL UP! + sparkles around 97%
      if (p >= 1) {
        if (Math.floor(T * 6) % 2 === 0 || T > 13.0) text('LEVEL UP!', 76, 50, gold, ink);
        for (let k = 0; k < 6; k++) { const a = k * 1.05 + T * 3, rr = 22 + (Math.floor(T * 12) % 3) * 2, sx = 44 + Math.cos(a) * rr * 1.4, sy = 52 + Math.sin(a) * rr * 0.4; put(sx, sy, white); put(sx - 1, sy, gold); put(sx + 1, sy, gold); put(sx, sy - 1, gold); put(sx, sy + 1, gold); }
      }
      // takeaway dialog with portrait
      if (T > 13.0) {
        const op = Math.floor(prog(13.0, 13.25) * 4) / 4, bh = Math.max(4, Math.round(48 * op));
        win(6, 153 - Math.round(bh / 2), 308, bh);
        if (op >= 1) {
          sprite(DRONE, DRONE_PAL, 12, 142, false, 2);
          text('MORE EXAMPLES', 42, 135, white, ink, 16); sprite(PX_ARROW, { K: '#0a0618', Y: '#ffd27a' }, 256, 138, false);
          text('BETTER GUESSES!', 42, 155, gold, ink, 16);
        }
      }
    };

    // ---------------- timeline with SNES transitions ----------------
    let scene = T < 2.3 ? sceneRoof : T < 6.2 ? sceneHall : T < 10.6 ? sceneBattle : sceneLevel;
    scene();
    // BEAT 1 dialog: question typed, then the window slides up (stepped) into the quest header
    if (T < 2.3) {
      const up = prog(1.7, 2.1), y0 = Math.round(H.lerp(128, 2, Math.floor(up * 6) / 6)), h0 = Math.round(H.lerp(48, 14, Math.floor(up * 6) / 6));
      win(6, y0, up > 0 ? Math.round(H.lerp(308, 160, Math.floor(up * 6) / 6)) : 308, h0);
      if (up === 0) {
        sprite(DRONE, DRONE_PAL, 14, 141, false, 2);
        const q1 = 'HOW DOES AI', q2 = 'LEARN?';
        text(q1.slice(0, Math.floor(prog(0.2, 0.9) * q1.length)), 44, y0 + 7, white, ink, 16);
        text(q2.slice(0, Math.floor(prog(0.9, 1.25) * q2.length)), 44, y0 + 27, gold, ink, 16);
      } else text('HOW DOES AI LEARN?', 12, y0 + 3, white, ink);
    } else { win(6, 2, 160, 14); text('HOW DOES AI LEARN?', 12, 5, white, ink); }

    // mosaic (roof -> hall), wavy battle-swirl (hall -> battle), iris (battle -> level)
    const mosaic = (n) => { if (n <= 1) return; for (let by = 0; by < LH; by += n) for (let bx = 0; bx < LW; bx += n) { const sx = Math.min(LW - 1, bx + (n >> 1)), sy = Math.min(LH - 1, by + (n >> 1)), si = (sy * LW + sx) * 4; for (let y = by; y < Math.min(LH, by + n); y++) for (let x = bx; x < Math.min(LW, bx + n); x++) { const i = (y * LW + x) * 4; buf[i] = buf[si]; buf[i + 1] = buf[si + 1]; buf[i + 2] = buf[si + 2]; } } };
    if (T >= 2.0 && T < 2.6) mosaic(Math.round(16 - Math.abs(T - 2.3) / 0.3 * 15));
    if (T >= 5.9 && T < 6.5) {
      const k = 1 - Math.abs(T - 6.2) / 0.3, src = buf.slice();
      for (let y = 0; y < LH; y++) { const off = Math.round(Math.sin(y * 0.25 + T * 30) * k * 40); for (let x = 0; x < LW; x++) { const sx = ((x + off) % LW + LW) % LW, si = (y * LW + sx) * 4, i = (y * LW + x) * 4; for (let c = 0; c < 3; c++) buf[i + c] = src[si + c] + (255 - src[si + c]) * k * 0.6; } }
    }
    if (T >= 10.3 && T < 10.9) {
      const k = Math.abs(T - 10.6) / 0.3, R = Math.round(k * 200), cx = T < 10.6 ? 244 : 160, cy = T < 10.6 ? 66 : 80;
      for (let y = 0; y < LH; y++) for (let x = 0; x < LW; x++) if ((x - cx) ** 2 + (y - cy) ** 2 > R * R) { const i = (y * LW + x) * 4; buf[i] = buf[i + 1] = buf[i + 2] = 0; }
    }
    // screen flash on the MISS (emphasis)
    if (T >= 7.4 && T < 7.5) for (let i = 0; i < buf.length; i += 4) { buf[i] = Math.min(255, buf[i] + 120); buf[i + 1] = Math.min(255, buf[i + 1] + 60); buf[i + 2] = Math.min(255, buf[i + 2] + 60); }

    const lc = H.layer(LW, LH), lx = lc.getContext('2d');
    lx.putImageData(new ImageData(buf, LW, LH), 0, 0);
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(lc, 0, 0, W, H_); ctx.restore();
  }

  // ================= EXPLAINER SOUND: SNES chip palette =================
  // The picture runs on a 12 fps game tick (T = floor(t*12)/12), so the cues below walk the same ticks and
  // re-evaluate the same expressions as pixExplainer: every sound starts on the tick its event first shows.
  // Voiceover mode (k.vo): music drops out (kit), and minor plays plus the custom chip details inside k.withMinor play
  // quieter, so the transitions, MISS!, HIT!, LEVEL UP and the takeaway cadence stay on top of the narration.
  function pixSound(k) {
    const FPS = 12, END = 14.5, V = k.vo;
    const prog = (T, a, b) => H.clamp((T - a) / (b - a));
    const sq = (t, f, dur, gain, pan) => k.tone(t, { f, type: 'square', dur, gain, a: 0.001, hold: dur * 0.6, pan });
    const tri = (t, f, dur, gain, pan) => k.tone(t, { f, type: 'triangle', dur, gain, a: 0.002, hold: dur * 0.6, pan });
    const crash = (t, dur, gain) => k.noise(t, { dur, filter: 'lowpass', f: 3200, gain, rate: 0.25, a: 0.001 }); // NES-style noise channel

    // ---- music: field theme / battle theme / level screen; each one stops for the transition that ends it
    k.music('chip', 0, 2.3, { bpm: 240 / 2.3, gain: 0.3, chords: [['C4', 'E4', 'G4', 'B4']] }); // softer under the typed question
    k.music('chip', 2.3, 5.9, { bpm: 240 / 2.3, gain: 0.5, chords: [['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4']] }); // bar = mosaic cut at 2.3
    k.music('chip', 6.2, 10.3, { bpm: 150, gain: 0.5, chords: [['A3', 'C4', 'E4', 'A4'], ['F3', 'A3', 'C4', 'F4'], ['C4', 'E4', 'G4', 'C5']] }); // bar 3 = back to GUESS at 9.4
    k.music('chip', 10.917, 12.4, { bpm: 160, gain: 0.45, chords: [['F3', 'A3', 'C4', 'E4']] });
    k.music('chip', 13.25, END, { bpm: 160, gain: 0.4, chords: [['C4', 'E4', 'G4', 'C5']] });

    // ---- per-tick state machine (mirrors pixExplainer)
    const s = { q1: 0, q2: 0, up: 0, absorb: false, absorbN: 0, cnt: 0, lastTick: -1, phase: 0, adj: 0, acc: 61, op: -1 };
    const Q1 = 'HOW DOES AI', Q2 = 'LEARN?';
    const NOTES_UP = ['C6', 'E6', 'G6', 'C7'];
    for (let f = 0; f <= END * FPS; f++) {
      const T = f / FPS;
      // beat 1: dialog types out (kit chip text blips, one per printed glyph)
      const q1 = Math.floor(prog(T, 0.2, 0.9) * Q1.length), q2 = Math.floor(prog(T, 0.9, 1.25) * Q2.length);
      if (q1 > s.q1) k.play('text', T, { n: q1 - s.q1, rate: 0.035, gain: 1.1, minor: true });
      if (q2 > s.q2) k.play('text', T, { n: q2 - s.q2, rate: 0.035, gain: 1.1, minor: true });
      s.q1 = q1; s.q2 = q2;
      // window slides up into the quest header in 6 steps
      const up = Math.floor(prog(T, 1.7, 2.1) * 6);
      if (up > s.up) k.withMinor(() => tri(T, ['G4', 'A4', 'C5', 'D5', 'E5', 'G5'][up - 1], 0.05, 0.12));
      s.up = up;
      // mosaic (2.0-2.6): one square step per tick, pitch falls as the blocks grow and rises as they shrink
      if (T >= 2.0 && T < 2.6) {
        const n = Math.round(16 - Math.abs(T - 2.3) / 0.3 * 15);
        if (n > 1) sq(T, 1500 / Math.sqrt(n), 0.075, 0.038);
      }
      // hall: the MODEL flashes as it absorbs a card -> rising chip gulp, a little higher each time
      const absorb = Math.floor((T - 2.95) / 0.33) >= 0 && ((T - 2.95) % 0.33) < 0.09 && T < 5.9;
      if (absorb && !s.absorb) { const b = 500 * Math.pow(2, s.absorbN / 12); k.tone(T, { f: [[0, b], [0.07, b * 2]], type: 'square', dur: 0.09, gain: 0.045, a: 0.001, hold: 0.05, pan: 0.5, minor: true }); s.absorbN += 2; }
      s.absorb = absorb;
      // EXAMPLES SEEN counter (accelerating): tally ticks get denser as it speeds up, coin when it lands on 1,000,000
      if (T >= 2.9 && T <= 5.6 + 1e-6) {
        const v = Math.floor(1e6 * Math.pow(prog(T, 2.9, 5.6), 2.2)), gap = T < 3.8 ? 3 : T < 4.7 ? 2 : 1;
        if (v > s.cnt && f - s.lastTick >= gap) { k.withMinor(() => sq(T, 1100 + 1300 * prog(T, 2.9, 5.6), 0.022, 0.03, -0.4)); s.lastTick = f; }
        s.cnt = v;
      } else if (T > 5.6 && s.cnt < 1e6) { k.play('coin', T, { gain: 0.9, pan: -0.3 }); s.cnt = 1e6; }
      // battle command cursor
      const phase = T < 6.2 ? -1 : T < 7.4 ? 0 : T < 8.3 ? 1 : T < 9.4 ? 2 : 0;
      if (phase !== s.phase && (phase === 2 || (phase === 0 && T > 9))) k.play('blip', T, { f: 'A5', dur: 0.04, gain: 0.9, pan: -0.5, minor: true }); // CHECK move is covered by the MISS hit
      s.phase = phase;
      // ADJUST: weight bars change in 4 stepped levels -> stat-up blips
      const adj = Math.floor(prog(T, 8.6, 9.2) * 4);
      if (adj > s.adj) k.withMinor(() => sq(T, NOTES_UP[adj - 1], adj === 4 ? 0.14 : 0.06, 0.05, 0.1));
      s.adj = adj;
      // LEVEL screen: accuracy 61 -> 97 (ease-out), one tick per tick-of-change so it slows as it settles
      if (T >= 10.95) {
        const acc = Math.round(61 + 36 * H.ease.out(prog(T, 10.95, 12.4)));
        if (acc > s.acc) k.withMinor(() => sq(T, 520 + (acc - 61) * 22, 0.03, 0.04));
        s.acc = acc;
      }
      // takeaway window opens in steps, then the text lands
      if (T >= 13.0) {
        const op = Math.floor(prog(T, 13.0, 13.25) * 4);
        if (op > s.op && op < 4) k.withMinor(() => tri(T, ['C5', 'E5', 'G5'][Math.min(2, op)], 0.05, 0.12));
        s.op = op;
      }
    }

    // ---- one-off cues (first tick where the condition is true)
    k.play('select', 0.02, { gain: 0.7, minor: true });                                  // dialog window on screen
    // wavy battle swirl 5.9-6.5 (peak 6.2): warbling square + grainy noise sweep, crash on the cut
    for (let f = Math.ceil(5.9 * FPS); f < 6.5 * FPS; f++) { const T = f / FPS, kk = 1 - Math.abs(T - 6.2) / 0.3; sq(T, 300 + kk * 900 * (f % 2 ? 1 : 1.26), 0.07, 0.045 + kk * 0.02); }
    k.noise(5.9, { dur: 0.6, filter: 'bandpass', f: [[0, 400], [0.3, 3000], [0.6, 500]], q: 1.4, gain: 0.14, rate: 0.3, a: 0.28 });
    crash(6.25, 0.3, 0.12);
    k.play('text', 79 / FPS, { n: 4, rate: 0.045, gain: 1.1, pan: 0.4 }); // T > 6.5: "DOG?" bubble from the model
    // CHECK: MISS! + screen flash + shake, then the "wrong" buzz under IT'S A CAT!
    const MISS = 89 / FPS;                                                    // T >= 7.4
    k.play('hurt', MISS, { gain: 1.4, pan: -0.4 }); crash(MISS, 0.35, 0.22);
    k.play('error', MISS + 0.3, { gain: 0.9 });
    // ADJUST: red error trail travels picture -> model (8.3-8.8), panned left to right, falling
    k.withMinor(() => { for (let f = 100; f <= 105; f++) { const T = f / FPS, kk = prog(T, 8.3, 8.8); sq(T, 880 * Math.pow(2, -kk), 0.05, 0.04, -0.5 + kk); } });
    k.withMinor(() => sq(102 / FPS, 'A2', 0.14, 0.06, 0));                                      // "ERROR" label (k > 0.3)
    // GUESS 2: "CAT!" bubble, then HIT! lands (the correction)
    k.play('text', 115 / FPS, { n: 4, rate: 0.045, gain: 1.1, pan: 0.4 }); // T > 9.5
    const HIT = 118 / FPS;                                                    // T > 9.75
    crash(HIT, 0.18, 0.16);
    ['G5', 'C6', 'E6'].forEach((n, i) => sq(HIT + i * 0.05, n, 0.06, 0.06, -0.3));
    sq(HIT + 0.15, 'G6', 0.25, 0.05, -0.3); tri(HIT, 'C4', 0.3, 0.12);
    // iris: closes on the model (square sweep down), opens on the level screen (sweep up)
    k.tone(124 / FPS, { f: [[0, 1400], [0.27, 160]], type: 'square', dur: 0.28, gain: 0.045, a: 0.002, hold: 0.2, pan: 0.4 });
    k.tone(128 / FPS, { f: [[0, 160], [0.24, 1400]], type: 'square', dur: 0.25, gain: 0.045, a: 0.002, hold: 0.18 });
    // LEVEL UP! at 97% (the biggest moment): power-up run, held major chord, sparkles
    const LVL = 149 / FPS;                                                    // p >= 1 at T >= 12.4
    k.play('powerup', LVL, { gain: 1.4 });
    ['C6', 'E6', 'G6'].forEach((n) => sq(LVL + 0.32, n, 0.6, 0.035)); tri(LVL + 0.32, 'C4', 0.6, 0.22);
    k.play('sparkle', LVL + 0.12, { n: 7, gain: 0.8 });
    // takeaway lands: resolving chip cadence (B -> C over a C bass)
    const TAKE = 159 / FPS;                                                   // window fully open at T >= 13.25
    sq(TAKE, 'B5', 0.08, 0.055); sq(TAKE + 0.08, 'C6', 0.7, 0.055); sq(TAKE + 0.08, 'G5', 0.7, 0.03); tri(TAKE, 'C4', 0.8, 0.22);
  }

  registerStyle({
    id: 'pixel-16bit',
    name: '16-Bit Pixel Odyssey',
    category: 'Retro Digital',
    description: 'A SNES-era cutscene: 320x180 hand-placed pixels blown up 4x, a strict ~40-colour palette, banded sky with checkerboard dither transitions, layered parallax and an RPG dialog box.',
    motion: 'A SNES cutscene opening: 16-step brightness fade-in, parallax layers rise into place in whole-pixel steps, the hero walks on with a 2-frame cycle, the drone flies in, hearts pop, the window snaps open and dialog types out.',
    fonts: ['8px "Press Start 2P"', '16px "Press Start 2P"'],
    duration: 6,
    frameT: 5.8,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'Tells it as a SNES RPG: the question is a dialog line whose window snaps up into a quest header, a mosaic transition opens a training hall where labelled CAT/DOG cards ride a chevron conveyor into the MODEL while an EXAMPLES window counts, a wavy battle-swirl starts a turn-based fight (GUESS/CHECK/ADJUST command menu, MISS! damage pop and screen flash, red error trail, weight stat bars), and an iris wipe lands on a LEVEL UP accuracy screen.',
    explainer(ctx, W, H_, t) { pixExplainer(ctx, W, H_, t); },
    explainerSound(k) { pixSound(k); },
    draw(ctx, W, H_, t) {
      // game timing: build/sprite logic runs on a 12 fps tick, positions snap to the 320x180 grid
      const T = Math.floor(t * 12) / 12;
      const prog = (a, b) => H.clamp((T - a) / (b - a));
      const rise = (a, b, dist) => Math.round((1 - H.ease.out(prog(a, b))) * dist);
      const buf = new Uint8ClampedArray(LW * LH * 4);
      let OY = 0; // per-layer vertical offset (layers rise into place)
      const put = (x, y, c) => {
        x |= 0; y = (y + OY) | 0;
        if (x < 0 || y < 0 || x >= LW || y >= LH) return;
        const i = (y * LW + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255;
      };
      const get = (x, y) => { y += OY; if (y < 0 || y >= LH) return [0, 0, 0]; const i = (y * LW + x) * 4; return [buf[i], buf[i + 1], buf[i + 2]]; };
      const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c); };
      // dithered blend between two palette colours (a = amount of c2)
      const dput = (x, y, c1, c2, a) => put(x, y, a > bay(x, y) ? c2 : c1);
      const sprite = (rows, pal, ox, oy, flip, scale = 1) => {
        const cp = {}; for (const k in pal) cp[k] = C(pal[k]);
        rows.forEach((row, j) => [...row].forEach((ch, i) => {
          if (ch === '.') return;
          const xx = flip ? row.length - 1 - i : i;
          for (let a = 0; a < scale; a++) for (let b = 0; b < scale; b++) put(ox + xx * scale + a, oy + j * scale + b, cp[ch]);
        }));
      };
      const r = H.rng(1601), nz = H.makeNoise(77);

      // ---------- 1. SKY: solid bands with narrow checker-dithered seams ----------
      const horizon = 118;
      for (let y = 0; y < LH; y++) {
        const f = Math.pow(H.clamp(y / horizon), 1.25) * (P.sky.length - 1);
        const i = Math.min(P.sky.length - 2, Math.floor(f)), fr = f - i;
        const a = H.smooth(0.55, 1.0, fr);
        for (let x = 0; x < LW; x++) dput(x, y, P.sky[i], P.sky[i + 1], a);
      }
      // stars (only in top bands), some twinkle with t
      for (let s = 0; s < 70; s++) {
        const x = r.int(0, LW - 1), y = r.int(0, 46), ph = r() * 6.28, big = r.chance(0.12);
        const tw = Math.sin(t * 3 + ph) > -0.2;
        if (!tw) continue;
        put(x, y, y < 24 ? P.star : P.starDim);
        if (big) { put(x - 1, y, P.starDim); put(x + 1, y, P.starDim); put(x, y - 1, P.starDim); put(x, y + 1, P.starDim); }
      }

      // ---------- 2. SETTING SUN with retro stripe cut-outs ----------
      const sx = 236, sy = 92 + rise(0, 1.8, 34), sr = 30;
      for (let y = sy - sr; y <= sy + sr; y++) {
        const ry = (y - (sy - sr)) / (2 * sr);
        // stripe gaps grow towards the bottom
        if (y > sy - 4) { const k = y - (sy - 4); const period = 7, gap = 1 + Math.floor(k / 9); if ((k % period) < gap) continue; }
        for (let x = sx - sr; x <= sx + sr; x++) {
          if ((x - sx) ** 2 + (y - sy) ** 2 > sr * sr) continue;
          const c = ry < 0.45 ? (ry < 0.3 ? P.sunHi : (0.3 + 0.15 * bay(x, y) > ry ? P.sunHi : P.sunMid)) : (ry < 0.55 ? P.sunMid : (ry - 0.55) * 3 > bay(x, y) ? P.sunLo : P.sunMid);
          put(x, y, c);
        }
      }

      // ---------- 3. CLOUD STREAKS (lit from below by the sun) ----------
      const cloud = (cx, cy, w, h) => {
        for (let y = cy - h; y <= cy + h; y++) for (let x = cx - w; x <= cx + w; x++) {
          const dx = (x - cx) / w, dy = (y - cy) / h;
          const lump = 1 + 0.25 * Math.sin(x * 0.35 + cx);
          if (dx * dx + (dy * dy) / lump > 1) continue;
          const below = dy > 0.15, rim = dy > 0.55;
          put(x, y, rim ? P.cloudHot : below ? P.cloudLit : P.cloud);
        }
      };
      const cdrift = t * 2;
      cloud(((60 + cdrift) % 380) - 30, 40, 34, 3);
      cloud(((140 + cdrift * 0.8) % 380) - 30, 54, 22, 2);
      cloud(((300 + cdrift * 1.1) % 380) - 30, 30, 26, 2);
      cloud(((210 + cdrift * 0.6) % 380) - 30, 66, 40, 2);

      // ---------- 4. MOUNTAINS (two parallax layers, rim-lit toward the sun) ----------
      const mountains = (base, amp, freq, seed, scroll, col, lit) => {
        const hgt = [];
        for (let x = -1; x <= LW; x++) {
          const u = (x + scroll) * freq;
          const v = Math.abs(nz.fbm2(u, seed, 3)) * 1.6 + 0.35 * nz.n2(u * 3.1, seed + 9);
          hgt.push(Math.round(base - amp * v));
        }
        for (let x = 0; x < LW; x++) {
          const top = hgt[x + 1], facing = hgt[x + 2] < hgt[x + 1] ? 0 : 1; // slopes rising rightwards face the sun
          for (let y = top; y < LH; y++) {
            const d = y - top;
            if (d < 2 && (facing || x > sx - 40)) put(x, y, lit);
            else if (d < 5 && facing) dput(x, y, col, lit, 0.5 - d * 0.1);
            else put(x, y, col);
          }
        }
      };
      OY = rise(0.5, 1.2, 50); mountains(108, 30, 0.018, 3.3, 0, P.mtFar, P.mtFarLit);
      OY = rise(0.7, 1.4, 50); mountains(118, 20, 0.03, 8.1, 0, P.mtNear, P.mtNearLit);
      OY = rise(1.0, 1.6, 64);

      // ---------- 5. FUTURE CITY: back row, mega-tower AI core, front row ----------
      const cityBase = 150;
      const building = (x, w, h, col, colLit, winChance, layerSeed, front) => {
        const top = cityBase - h;
        rect(x, top, w, h, col);
        for (let y = top; y < cityBase; y++) put(x + w - 1, y, colLit); // sun-side edge
        rect(x, top, w, 1, colLit);
        const rr = H.rng(layerSeed);
        if (rr.chance(0.4)) { // antenna with blinking light
          const ah = rr.int(3, 9); for (let k = 1; k <= ah; k++) put(x + (w >> 1), top - k, col);
          if (Math.sin(t * 4 + layerSeed) > 0) put(x + (w >> 1), top - ah - 1, P.red);
        }
        const wc = rr.pick([P.winY, P.winY, P.winC, P.winP]);
        const sp = front ? 3 : 2;
        for (let wy = top + 2; wy < cityBase - 2; wy += sp) for (let wx = x + 1; wx < x + w - 2; wx += 2) {
          const on = rr() < winChance && Math.sin(t * 0.7 + wx * 13.1 + wy * 7.7) > -0.85;
          if (on) put(wx, wy, wc); else if (front && rr.chance(0.3)) put(wx, wy, P.winDim);
        }
      };
      // back row
      const sc1 = 0;
      let bx = -((sc1) % 23) - 10;
      const rb = H.rng(404);
      while (bx < LW) { const w = rb.int(9, 18), h = rb.int(18, 44); building(bx, w, h, P.bldBack, P.bldBackLit, 0.35, bx * 7 + 11 + sc1 * 0, false); bx += w + rb.int(0, 3); }

      // mega-tower: the AI core (focal point)
      OY = rise(1.3, 2.0, 132);
      const coreOn = T >= 2.08 && !(T >= 2.17 && T < 2.25) && !(T >= 2.33 && T < 2.38);
      const tx = 168, tTop = 34;
      for (let y = tTop; y < cityBase; y++) {
        const k = (y - tTop) / (cityBase - tTop);
        const hw = Math.round(3 + 12 * Math.pow(k, 1.7));
        for (let x = tx - hw; x <= tx + hw; x++) {
          const edge = x >= tx + hw - 1;
          put(x, y, edge ? P.bldFrontLit : (x === tx ? P.bldBackLit : P.bldFront));
        }
        if (y > 60 && y % 4 === 0) for (let x = tx - hw + 2; x < tx + hw - 1; x += 3) if (Math.sin(x * 3.1 + y) > 0.1) put(x, y, P.winC);
      }
      for (let k = 1; k < 14; k++) put(tx, tTop - k, P.bldFrontLit);
      put(tx, tTop - 14, Math.sin(t * 5) > 0 ? P.red : P.bldFrontLit);
      // core ring + glowing orb with dithered halo
      const cy0 = 52, pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
      if (coreOn) {
      const haloR = 20 + pulse * 3;
      for (let y = cy0 - 26; y <= cy0 + 26; y++) for (let x = tx - 26; x <= tx + 26; x++) {
        const d = Math.hypot(x - tx, y - cy0);
        if (d > haloR || d < 7) continue;
        const a = d < 12 ? 0.5 : d < 16 ? 0.25 : 0.0625;
        if (a > bay(x, y)) { const c = get(x, y); put(x, y, H.mix(c, P.coreMid, 0.5).map(Math.round)); }
      }
      for (let y = cy0 - 7; y <= cy0 + 7; y++) for (let x = tx - 7; x <= tx + 7; x++) {
        const d = Math.hypot(x - tx + 1.5, y - cy0 + 1.5);
        if (Math.hypot(x - tx, y - cy0) > 7.2) continue;
        put(x, y, d < 3 ? P.core : d < 6 ? (d - 3) / 3 > bay(x, y) ? P.coreMid : P.core : P.coreMid);
      }
      for (let y = cy0 - 7; y <= cy0 + 7; y++) for (let x = tx - 7; x <= tx + 7; x++) {
        const d = Math.hypot(x - tx, y - cy0); if (d > 6.2 && d <= 7.2) put(x, y, P.coreDeep);
      }
      // orbit ring (ellipse) - back half then front half
      const ringA = t * 1.2;
      for (let s = 0; s < 220; s++) {
        const a = (s / 220) * Math.PI * 2;
        const x = tx + Math.cos(a) * 15, y = cy0 + Math.sin(a) * 4;
        const front = Math.sin(a) > 0;
        if (!front && Math.hypot(x - tx, y - cy0) < 7.2) continue;
        const lit = Math.cos(a - ringA) > 0.6;
        put(x, y, lit ? P.core : front ? P.coreMid : P.coreDeep);
      }
      } else { // unlit core shell
        for (let y = cy0 - 7; y <= cy0 + 7; y++) for (let x = tx - 7; x <= tx + 7; x++) { const d = Math.hypot(x - tx, y - cy0); if (d <= 7.2) put(x, y, d > 6.2 ? P.K : P.coreDeep); }
      }
      // front row
      OY = rise(1.6, 2.1, 44);
      const sc2 = 0;
      let fx = -(sc2 % 31) - 12;
      const rf = H.rng(808);
      while (fx < LW) {
        const w = rf.int(12, 24), h = rf.int(10, 30);
        if (Math.abs(fx + w / 2 - tx) > 22) building(fx, w, h, P.bldFront, P.bldFrontLit, 0.45, fx * 3 + 5, true);
        fx += w + rf.int(1, 4);
      }
      OY = 0;
      // street-level glow below the skyline
      const streetY = cityBase + rise(1.0, 1.6, 40);
      for (let y = streetY; y < LH; y++) for (let x = 0; x < LW; x++) dput(x, y, P.bldFront, C('#3a1e50'), 0.5 - (y - streetY) * 0.04);
      // horizon haze band where city meets mountains (atmospheric depth)
      for (let y = 112; y < 128; y++) for (let x = 0; x < LW; x++) { const a = 0.32 * (1 - Math.abs(y - 120) / 8); if (a > bay(x, y)) { const c = get(x, y); if (c[0] + c[1] + c[2] < 260) put(x, y, H.mix(c, P.cloudLit, 0.35).map(Math.round)); } }
      // flying cars with light trails
      for (let k = 0; k < (T > 2.1 ? 6 : 0); k++) {
        const lane = 74 + k * 9 + (k % 2) * 3, dir = k % 2 ? -1 : 1, sp = 18 + k * 7;
        let x = ((k * 97 + t * sp * dir) % 360 + 360) % 360 - 20;
        const y = lane;
        const head = k % 3 === 0 ? P.winP : P.winY;
        for (let q = 1; q < 10; q++) if ((10 - q) / 10 > bay(Math.round(x - dir * q), y) + 0.1) put(x - dir * q, y, q < 4 ? head : P.cloudLit);
        put(x, y, P.star); put(x + dir, y, head);
      }

      // ---------- 6. FOREGROUND ROOFTOP (fastest parallax: static frame of reference) ----------
      const roofY = 128;
      rect(0, roofY, 178, LH - roofY, P.roof);
      rect(0, roofY, 177, 1, P.roofRim);
      rect(0, roofY + 1, 177, 1, P.roofTop);
      for (let y = roofY; y < LH; y++) put(177, y, P.roofTop);
      for (let y = roofY + 2; y < LH; y++) for (let x = 0; x < 176; x++) if (((x + y) & 7) === 0 && y % 2) put(x, y, P.roofMid);
      // railing
      for (let x = 0; x < 176; x++) put(x, roofY - 9, P.K);
      for (let x = 0; x < 176; x++) if ((x % 12) === 4 || x === 175) for (let y = roofY - 9; y < roofY; y++) put(x, y, P.K);
      for (let x = 0; x < 176; x++) put(x, roofY - 5, P.K);
      for (let x = 0; x < 176; x++) if (x % 3 === 0) put(x, roofY - 10, P.roofRim);
      // rooftop HVAC unit + satellite dish (silhouettes w/ rim light)
      rect(14, roofY - 18, 26, 18, P.roof);
      rect(14, roofY - 18, 26, 1, P.roofRim);
      for (let y = roofY - 17; y < roofY; y++) put(39, y, P.roofTop);
      for (let x = 17; x < 37; x += 3) for (let y = roofY - 15; y < roofY - 4; y++) put(x, y, P.roofMid);
      // radio mast with guy wires and a blinking beacon
      for (let y = roofY - 46; y < roofY; y++) { put(56, y, P.roof); if (y % 4 === 0) { put(55, y, P.roof); put(57, y, P.roof); } }
      for (let k = 0; k < 30; k++) { put(56 - k * 0.5, roofY - 40 + k * 1.33, P.roof); put(56 + k * 0.5, roofY - 40 + k * 1.33, P.roof); }
      put(57, roofY - 46, P.roofRim);
      if (Math.sin(t * 3) > 0) { put(56, roofY - 47, P.red); put(55, roofY - 47, C('#ff8a8a')); }
      // water tank on stilts
      const TK = 66; rect(TK, roofY - 30, 18, 16, P.roof);
      for (let y = roofY - 30; y < roofY - 14; y++) { put(TK + 17, y, P.roofTop); if (y % 4 === 0) for (let x = TK; x < TK + 17; x++) put(x, y, P.roofMid); }
      for (let x = TK - 1; x < TK + 19; x++) put(x, roofY - 31, P.roofRim);
      for (let x = TK + 1; x < TK + 17; x++) { const top = roofY - 32 - Math.round(3 * Math.sin(((x - TK - 1) / 16) * Math.PI)); for (let y = top; y < roofY - 31; y++) put(x, y, P.roof); put(x, top, P.roofTop); }
      for (let y = roofY - 14; y < roofY; y++) { put(TK + 2, y, P.roof); put(TK + 15, y, P.roof); put(TK + 2 + (y - roofY + 14), y, P.roof); }

      // ---------- 7. CHARACTERS ----------
      const walkP = prog(2.2, 3.0), walking = walkP > 0 && walkP < 1;
      const heroX = Math.round(-16 + 114 * walkP), heroY = roofY - HERO.length - (walking && Math.floor(T * 8) % 2 ? 1 : 0);
      // scarf: 2-frame flap
      const flap = Math.floor(T * 6) % 2;
      const scarf = flap ? [[-1, 0], [-2, 0], [-3, 1], [-4, 1], [-5, 1], [-6, 2], [-7, 2]] : [[-1, 0], [-2, 1], [-3, 1], [-4, 0], [-5, 0], [-6, 1], [-7, 0]];
      scarf.forEach(([dx, dy], i) => { put(heroX + 5 + dx, heroY + 8 + dy, P.winP); put(heroX + 5 + dx, heroY + 9 + dy, i > 3 ? P.cloudLit : P.winP); put(heroX + 5 + dx, heroY + 10 + dy, P.K); });
      sprite(walking && Math.floor(T * 8) % 2 ? HERO_WALK : HERO, HERO_PAL, heroX, heroY, false);
      // rim light on hero's sun-facing side
      for (let j = 0; j < HERO.length; j++) { const row = HERO[j]; const last = row.search(/[^.][.]*$/); if (last > 0 && row[last - 1] && row[last - 1] !== '.' && row[last - 1] !== 'K') put(heroX + last - 1, heroY + j, C('#ffb08a')); }
      // drone bobbing
      const dY = Math.round(roofY - 40 + Math.sin(T * 3) * 2) - rise(2.5, 3.1, 30);
      const dX = 120 + rise(2.5, 3.1, 210);
      sprite(DRONE, DRONE_PAL, dX, dY, false);
      // drone thruster
      if (Math.floor(T * 10) % 2) { put(dX + 2, dY + 10, P.winC); put(dX + 8, dY + 10, P.winC); } else { put(dX + 2, dY + 11, P.coreMid); put(dX + 8, dY + 11, P.coreMid); }
      // shadow under hero
      for (let x = Math.max(0, heroX + 2); x < heroX + 13; x++) put(x, roofY + 1, P.K);

      // ---------- 8. TEXT RASTERISER (threshold so glyphs are pure pixels) ----------
      const tc = H.layer(LW, LH); const tx2 = tc.getContext('2d', { willReadFrequently: true });
      const text = (str, x, y, col, shadow, font = '8px "Press Start 2P"') => {
        tx2.clearRect(0, 0, LW, LH); tx2.font = font; tx2.textBaseline = 'top'; tx2.fillStyle = '#fff'; tx2.fillText(str, 0, 0);
        const w = Math.ceil(tx2.measureText(str).width) + 2, d = tx2.getImageData(0, 0, w, 12).data;
        for (let j = 0; j < 12; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) {
          if (shadow) put(x + i + 1, y + j + 1, shadow);
        }
        for (let j = 0; j < 12; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) put(x + i, y + j, col);
        return w;
      };

      // ---------- 9. HUD ----------
      const white = C('#f8f8ff'), gold = C('#ffd27a'), ink = C('#0a0618');
      // hearts
      const HEART = ['.KK.KK.', 'KRRKRRK', 'KRWRRRK', 'KRRRRRK', '.KRRRK.', '..KRK..', '...K...'];
      const nHearts = H.clamp(Math.floor((T - 2.9) / 0.12) + 1, 0, 4);
      for (let h = 0; h < nHearts; h++) sprite(HEART, { K: '#0a0618', R: h < 3 ? '#ff3a5a' : '#4a2a5a', W: h < 3 ? '#ffd0e0' : '#6a4a7a' }, 8 + h * 9, 7, false);
      if (T >= 2.9) {
        text('SCORE', 236, 6, white, ink);
        text(String(Math.floor(4096 * H.ease.out(prog(2.9, 3.6)) + Math.max(0, T - 3.6) * 64)).padStart(6, '0'), 236, 15, gold, ink);
      }

      // ---------- 10. DIALOG BOX (SNES RPG window) ----------
      const openP = Math.floor(prog(3.1, 3.4) * 4) / 4;
      if (openP > 0) {
      const bx0 = 6, bh = openP < 1 ? Math.max(4, Math.round(38 * openP)) : 38, by0 = 155 - (bh >> 1), bw = 308;
      const WB = ['#4060d0', '#3450bc', '#2a42a6', '#22358e', '#1a2a78', '#142064'].map(C);
      for (let y = by0; y < by0 + bh; y++) {
        const f = ((y - by0) / bh) * (WB.length - 1), i = Math.min(WB.length - 2, Math.floor(f)), a = H.smooth(0.7, 1, f - i);
        for (let x = bx0; x < bx0 + bw; x++) {
          const inCorner = (x === bx0 || x === bx0 + bw - 1) && (y === by0 || y === by0 + bh - 1);
          if (inCorner) continue;
          dput(x, y, WB[i], WB[i + 1], a);
        }
      }
      // borders: dark outer, white, grey inner
      const grey = C('#9aa0c8');
      for (let x = bx0 + 1; x < bx0 + bw - 1; x++) { put(x, by0, white); put(x, by0 + bh - 1, white); put(x, by0 + 1, grey); put(x, by0 + bh - 2, grey); put(x, by0 - 1, ink); put(x, by0 + bh, ink); }
      for (let y = by0 + 1; y < by0 + bh - 1; y++) { put(bx0, y, white); put(bx0 + bw - 1, y, white); put(bx0 + 1, y, grey); put(bx0 + bw - 2, y, grey); put(bx0 - 1, y, ink); put(bx0 + bw, y, ink); }
      put(bx0 + 1, by0 + 1, white); put(bx0 + bw - 2, by0 + 1, white); put(bx0 + 1, by0 + bh - 2, white); put(bx0 + bw - 2, by0 + bh - 2, white);
      if (openP >= 1) {
      // portrait frame with drone at 2x
      const px0 = bx0 + 6, py0 = by0 + 5;
      rect(px0, py0, 28, 28, C('#0a1040'));
      for (let i = 0; i < 28; i++) { put(px0 + i, py0, grey); put(px0 + i, py0 + 27, white); put(px0, py0 + i, grey); put(px0 + 27, py0 + i, white); }
      sprite(DRONE, DRONE_PAL, px0 + 3, py0 + 4, false, 2);
      // name + typed line
      text('NOVA', px0 + 34, by0 + 6, gold, ink);
      const line = 'THE CITY AI IS AWAKE.';
      const shown = Math.min(line.length, Math.floor(prog(3.45, 4.3) * line.length));
      text(line.slice(0, shown), px0 + 34, by0 + 20, white, ink);
      // bouncing next-arrow
      if (shown >= line.length) {
        const ay = by0 + bh - 9 + (Math.floor(t * 4) % 2);
        const ARW = ['KKKKKKK', 'KWWWWWK', '.KWWWK.', '..KWK..', '...K...'];
        sprite(ARW, { K: '#0a0618', W: '#ffd27a' }, bx0 + bw - 14, ay, false);
      }
      } // window fully open
      } // window visible

      // SNES master-brightness fade-in (16 discrete levels)
      const lvl = Math.min(15, Math.floor((T / 0.8) * 15));
      if (lvl < 15) for (let i = 0; i < buf.length; i += 4) { buf[i] = buf[i] * lvl / 15; buf[i + 1] = buf[i + 1] * lvl / 15; buf[i + 2] = buf[i + 2] * lvl / 15; }

      // ---------- 11. blit low-res buffer, scale x4 with nearest neighbour ----------
      const lc = H.layer(LW, LH), lx = lc.getContext('2d');
      lx.putImageData(new ImageData(buf, LW, LH), 0, 0);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(lc, 0, 0, W, H_);
      ctx.restore();
    },
  });
}
