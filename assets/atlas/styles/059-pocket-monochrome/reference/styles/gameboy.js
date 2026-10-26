{
  // ---------- DMG handheld: 160x144 four-shade LCD, LCD pixel grid + drop shadows + ghosting, inside the bezel ----------
  const LW = 160, LH = 144;
  const SHADES = ['#a4ba30', '#7f9c22', '#3e6a2c', '#14381a'].map((h) => H.hex(h)); // lightest pulled toward DMG olive

  const HERO_A = [
    '.....33333......',
    '....3222223.....',
    '...322222223....',
    '...3333333333...',
    '...31100003.....',
    '...31000303.....',
    '...31000003.....',
    '....300003......',
    '....3333333.....',
    '...322222223....',
    '..32222222223...',
    '..30322222303...',
    '...333333333....',
    '...3223.3223....',
    '...3223.3223....',
    '..33333.33333...',
  ];
  const HERO_B = HERO_A.slice(0, 13).concat(['...3223..3223...', '..3223....3223..', '.33333....33333.']);
  const BOT = [
    '.......3........',
    '......303.......',
    '.......3........',
    '..33333333333...',
    '.3000000000003..',
    '.3033333333303..',
    '.3033033033303..',
    '.3033033033303..',
    '.3033300033303..',
    '.3033333333303..',
    '.3000000000003..',
    '..33333333333...',
    '....3211123.....',
    '...321111123....',
    '....3333333.....',
    '................',
  ];
  const TREE = [
    '.....333333.....',
    '...3311111133...',
    '..311001111113..',
    '.31100111111213.',
    '.31101111112213.',
    '3111111111122213',
    '3111111111222213',
    '3121111112222223',
    '3122111122222223',
    '.31222222222223.',
    '.33222222222233.',
    '..333222222333..',
    '....33322333....',
    '......3223......',
    '......3223......',
    '.....332233.....',
  ];

  // shared LCD + case pipeline (used by both draw and the explainer)
  const BX = 212, BY = 18, BW = 856, BH = 690, SC = 4;
  const SX = BX + (BW - LW * SC) / 2 + 20, SY = BY + 70;
  const bezPath = (ctx, inset) => { // bezel (grey-violet) with the big bottom-right radius
    const x = BX + inset, y = BY + inset, w = BW - inset * 2, h = BH - inset * 2, r1 = 22 - inset * 0.5, r2 = 120 - inset;
    ctx.beginPath(); ctx.moveTo(x + r1, y); ctx.lineTo(x + w - r1, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r1);
    ctx.lineTo(x + w, y + h - r2); ctx.quadraticCurveTo(x + w, y + h, x + w - r2, y + h); ctx.lineTo(x + r1, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r1);
    ctx.lineTo(x, y + r1); ctx.quadraticCurveTo(x, y, x + r1, y); ctx.closePath();
  };
  // static case + bezel + label + LED + LCD recess, built once per canvas size
  let CASE = null;
  function caseLayer(W, H_) {
    if (CASE && CASE.w === W && CASE.h === H_) return CASE.cv;
    const cv = H.layer(W, H_), ctx = cv.getContext('2d');
    // off-white ABS: diagonal light, low-frequency unevenness and a fine moulded stipple
    const img = ctx.createImageData(W, H_), d = img.data, nz = H.makeNoise(9), rr = H.rng(31);
    const c0 = H.hex('#dcd8d0'), c1 = H.hex('#b9b4aa');
    for (let y = 0, p = 0; y < H_; y++) for (let x = 0; x < W; x++, p++) {
      const g = H.clamp((x / W) * 0.55 + (y / H_) * 0.45), lo = nz.fbm2(x * 0.004, y * 0.004, 3) * 0.035;
      const st = (rr() - 0.5) * 0.035 + nz.n2(x * 0.6, y * 0.6) * 0.02;
      const m = 1 + lo + st, i = p * 4;
      d[i] = (c0[0] + (c1[0] - c0[0]) * g) * m; d[i + 1] = (c0[1] + (c1[1] - c0[1]) * g) * m; d[i + 2] = (c0[2] + (c1[2] - c0[2]) * g) * m; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    for (let i = 0; i < 7000; i++) { const r0 = H.rng(i); const x = r0() * W, y = r0() * H_; ctx.fillStyle = `rgba(${r0() < 0.5 ? '255,255,255' : '60,50,40'},0.06)`; ctx.fillRect(x, y, 2, 2); }
    // soft top-left key light on the flanks, falling to shade bottom-right
    const kl = ctx.createRadialGradient(60, 40, 0, 60, 40, 900); kl.addColorStop(0, 'rgba(255,252,245,0.22)'); kl.addColorStop(1, 'rgba(255,252,245,0)');
    ctx.fillStyle = kl; ctx.fillRect(0, 0, W, H_);
    const sh = ctx.createLinearGradient(W * 0.5, H_ * 0.4, W, H_); sh.addColorStop(0, 'rgba(70,60,50,0)'); sh.addColorStop(1, 'rgba(70,60,50,0.14)');
    ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H_);
    // bezel: cast shadow onto the case, then the grey-violet face
    ctx.save(); ctx.shadowColor = 'rgba(60,50,40,0.35)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3; bezPath(ctx, 0); ctx.fillStyle = '#6f6d7f'; ctx.fill(); ctx.restore();
    const bg2 = ctx.createLinearGradient(0, BY, 0, BY + 700); bg2.addColorStop(0, '#7b798c'); bg2.addColorStop(1, '#5e5c6e');
    bezPath(ctx, 3); ctx.fillStyle = bg2; ctx.fill();
    // matte print texture + top-left light / bottom-right shade on the bezel face
    ctx.save(); bezPath(ctx, 3); ctx.clip();
    const bl = ctx.createLinearGradient(BX, BY, BX + BW, BY + BH); bl.addColorStop(0, 'rgba(255,255,255,0.07)'); bl.addColorStop(0.5, 'rgba(255,255,255,0)'); bl.addColorStop(1, 'rgba(10,8,20,0.12)');
    ctx.fillStyle = bl; ctx.fillRect(BX, BY, BW, BH);
    const r2 = H.rng(77);
    for (let i = 0; i < 9000; i++) { ctx.fillStyle = r2() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,10,0.07)'; ctx.fillRect(BX + r2() * BW, BY + r2() * BH, 1, 1); }
    ctx.restore();
    // moulded edge: lit along the top/left, shaded along the bottom/right
    const eg = ctx.createLinearGradient(BX, BY, BX + BW * 0.6, BY + BH); eg.addColorStop(0, 'rgba(255,255,255,0.28)'); eg.addColorStop(0.55, 'rgba(255,255,255,0.05)'); eg.addColorStop(1, 'rgba(20,15,35,0.35)');
    ctx.save(); bezPath(ctx, 1); ctx.strokeStyle = eg; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    ctx.save(); bezPath(ctx, 3); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    // label lines + DOT MATRIX text
    const ly = BY + 40;
    ctx.fillStyle = '#7a1f52'; ctx.fillRect(BX + 34, ly - 6, 200, 3); ctx.fillRect(BX + BW - 34 - 200, ly - 6, 200, 3);
    ctx.fillStyle = '#26276a'; ctx.fillRect(BX + 34, ly + 1, 200, 3); ctx.fillRect(BX + BW - 34 - 200, ly + 1, 200, 3);
    ctx.font = 'italic 700 13px "Inter"'; ctx.fillStyle = '#c9c7d6'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('DOT MATRIX WITH NEURAL SOUND', BX + BW / 2, ly - 1);
    // battery LED
    const ledX = BX + 52, ledY = BY + 250;
    const lg = ctx.createRadialGradient(ledX, ledY, 0, ledX, ledY, 18); lg.addColorStop(0, 'rgba(255,60,60,0.7)'); lg.addColorStop(1, 'rgba(255,60,60,0)');
    ctx.fillStyle = lg; ctx.fillRect(ledX - 18, ledY - 18, 36, 36);
    ctx.fillStyle = '#ff5050'; ctx.beginPath(); ctx.arc(ledX, ledY, 5, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(ledX - 1.5, ledY - 1.5, 1.6, 0, 7); ctx.fill();
    ctx.font = '600 11px "Inter"'; ctx.fillStyle = '#c9c7d6'; ctx.fillText('BATTERY', ledX, ledY + 22);
    // LCD recess: dark well with a 1px deeper lip, lit lower/right rim where the bezel steps down
    const rx = SX - 6, ry = SY - 6, rw = LW * SC + 12, rh = LH * SC + 12;
    ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(rx, ry + rh, rw + 1, 1); ctx.fillRect(rx + rw, ry, 1, rh + 1);
    ctx.fillStyle = 'rgba(20,18,30,0.35)'; ctx.fillRect(rx - 1, ry - 1, rw + 1, 1); ctx.fillRect(rx - 1, ry - 1, 1, rh + 1);
    ctx.fillStyle = '#3d3c48'; ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeStyle = '#2a2933'; ctx.lineWidth = 1; ctx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rh - 1);
    CASE = { w: W, h: H_, cv };
    return cv;
  }

  function gbCompose(ctx, W, H_, t, renderWorld) {
      // ghosting: blend current frame with two previous frames (slow LCD response)
      const F0 = renderWorld(t), F1 = renderWorld(t - 0.1), F2 = renderWorld(t - 0.2);
      const ink = new Float32Array(LW * LH);
      for (let i = 0; i < ink.length; i++) { const a = F0[i], b = Math.max(a, F1[i]), c = Math.max(a, F2[i]); ink[i] = a * 0.7 + b * 0.2 + c * 0.1; }

      // ---------- case + bezel (cached) ----------
      ctx.drawImage(caseLayer(W, H_), 0, 0);

      // ---------- LCD panel ----------
      const PW = LW * SC, PH = LH * SC;
      const img = ctx.createImageData(PW, PH), D = img.data;
      const paper = H.hex('#a9bd3a'), sh = H.hex('#8ea424').map((q) => q * 0.55);
      // per-cell colours: the cell itself and the gap around it (mostly backing colour, picks a bit of the pixel)
      const N = LW * LH, cr = new Float32Array(N), cg = new Float32Array(N), cb = new Float32Array(N);
      for (let k = 0; k < N; k++) { const v = ink[k], i = Math.min(2, Math.floor(v)), f = v - i, A = SHADES[i], B = SHADES[i + 1]; cr[k] = A[0] + (B[0] - A[0]) * f; cg[k] = A[1] + (B[1] - A[1]) * f; cb[k] = A[2] + (B[2] - A[2]) * f; }
      // backlight-less falloff + diagonal reflective sheen (+3% top-left -> -3% bottom-right), separable
      const colT = new Float32Array(PW), rowT = new Float32Array(PH);
      for (let x = 0; x < PW; x++) colT[x] = -0.08 * ((x / PW - 0.5) ** 2 * 4) - 0.03 * (x / PW);
      for (let y = 0; y < PH; y++) rowT[y] = 1.03 - 0.08 * ((y / PH - 0.5) ** 2 * 4) - 0.03 * (y / PH);
      for (let y = 0; y < PH; y++) {
        const ly2 = (y / SC) | 0, cy = y % SC, syp = y - 2, sy2 = syp >= 0 ? ((syp / SC) | 0) * LW : -1;
        for (let x = 0; x < PW; x++) {
          const lx = (x / SC) | 0, k = ly2 * LW + lx, v = ink[k];
          let r = cr[k], g = cg[k], b = cb[k];
          if (x % SC === SC - 1 || cy === SC - 1) { r = paper[0] + (r - paper[0]) * 0.45; g = paper[1] + (g - paper[1]) * 0.45; b = paper[2] + (b - paper[2]) * 0.45; }
          // drop shadow of the liquid-crystal layer onto the reflective backing (offset down-right ~2 px)
          const sxp = x - 2;
          if (sxp >= 0 && sy2 >= 0) { const vs = ink[sy2 + ((sxp / SC) | 0)]; if (vs > v) { const m = Math.min(0.3, (vs - v) * 0.11); r += (sh[0] - r) * m; g += (sh[1] - g) * m; b += (sh[2] - b) * m; } }
          const f = colT[x] + rowT[y], i = (y * PW + x) * 4;
          D[i] = r * f; D[i + 1] = g * f; D[i + 2] = b * f; D[i + 3] = 255;
        }
      }
      ctx.putImageData(img, SX, SY);
      // inner shadow (panel sits below the glass) + glass sheen
      ctx.save();
      const ish = ctx.createLinearGradient(0, SY, 0, SY + 26); ish.addColorStop(0, 'rgba(20,30,10,0.35)'); ish.addColorStop(1, 'rgba(20,30,10,0)');
      ctx.fillStyle = ish; ctx.fillRect(SX, SY, PW, 26);
      const ish2 = ctx.createLinearGradient(SX, 0, SX + 20, 0); ish2.addColorStop(0, 'rgba(20,30,10,0.3)'); ish2.addColorStop(1, 'rgba(20,30,10,0)');
      ctx.fillStyle = ish2; ctx.fillRect(SX, SY, 20, PH);
      // glare across the cover, kept inside the bezel
      bezPath(ctx, 3); ctx.clip();
      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath(); ctx.moveTo(BX + 120, BY); ctx.lineTo(BX + 420, BY); ctx.lineTo(BX + 120, BY + 520); ctx.lineTo(BX - 40, BY + 520); ctx.closePath();
      const gl = ctx.createLinearGradient(BX, BY, BX + 300, BY + 300); gl.addColorStop(0, 'rgba(255,255,255,0.10)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gl; ctx.fill();
      ctx.restore();
  }

  // ================= EXPLAINER: "How does AI learn?" as a handheld monster-battle RPG =================
  const GB_CAT = ['3.........3', '33.......33', '313.....313', '31133333113', '31111111113', '31131113113', '31111211113', '30113131103', '.311111113.', '..3333333..'];
  const GB_DOG = ['..3333333..', '.300000003.', '32300000323', '32303030323', '32300000323', '32300300323', '.330000033.', '..3001003..', '...30003...', '....333....'];
  const GB_ARW = ['3....', '33...', '323..', '3223.', '323..', '33...', '3....'];
  function gbExplainer(ctx, W, H_, t) {
    const tlx = H.layer(LW, 24).getContext('2d', { willReadFrequently: true });
    const renderWorld = (tt) => {
      const S = new Uint8Array(LW * LH);
      const tq = Math.floor(tt * 60) / 60;
      const pr = (a, b) => H.clamp((tq - a) / (b - a));
      const put = (x, y, v) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < LW && y < LH) S[y * LW + x] = v; };
      const rect = (x, y, w, h, v) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, v); };
      const spr = (rows, ox, oy, flip, sc = 1) => rows.forEach((row, j) => [...row].forEach((c, i) => { if (c >= '0' && c <= '3') for (let a = 0; a < sc; a++) for (let b = 0; b < sc; b++) put(ox + (flip ? row.length - 1 - i : i) * sc + a, oy + j * sc + b, +c); }));
      const stamp = (str, x, y, v = 3, size = 8) => {
        tlx.clearRect(0, 0, LW, 24); tlx.font = size + 'px "Press Start 2P"'; tlx.textBaseline = 'top'; tlx.fillStyle = '#000'; tlx.fillText(str, 0, 0);
        const hh = size + 2, d = tlx.getImageData(0, 0, LW, hh).data;
        for (let j = 0; j < hh; j++) for (let i = 0; i < LW; i++) if (d[(j * LW + i) * 4 + 3] > 110) put(x + i, y + j, v);
      };
      const tbox = (x, y, w, h) => { rect(x, y, w, h, 0); rect(x, y, w, 1, 3); rect(x, y + h - 1, w, 1, 3); rect(x, y, 1, h, 3); rect(x + w - 1, y, 1, h, 3); rect(x + 2, y + 2, w - 4, 1, 3); rect(x + 2, y + h - 3, w - 4, 1, 3); rect(x + 2, y + 2, 1, h - 4, 3); rect(x + w - 3, y + 2, 1, h - 4, 3); };
      const typed = (str, a, cps = 30) => str.slice(0, Math.max(0, Math.floor((tq - a) * cps)));
      const fmt = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const remap = (m) => { for (let i = 0; i < S.length; i++) S[i] = m[S[i]]; };
      const grass = () => { for (let y = 0; y < LH; y++) for (let x = 0; x < LW; x++) { const h = ((x * 73856093) ^ (y * 19349663)) >>> 0; S[y * LW + x] = (h % 29 === 0) ? 2 : (h % 13 === 0 ? 0 : 1); } };
      const header = () => { tbox(0, 0, LW, 16); stamp('HOW DOES AI LEARN?', 8, 4); };

      if (tq < 2.35) { // ---------- BEAT 1: the question as a text box, which then becomes the header ----------
        grass();
        rect(56, 40, 48, 40, 0); for (let x = 56; x < 104; x++) { put(x, 40, 3); put(x, 79, 3); } // a little clearing
        spr(BOT, 64, 44 + Math.round(Math.sin(tq * 4) * 2), false, 2);
        const up = Math.floor(pr(1.55, 1.95) * 4) / 4; // window layer slides up in 8-px steps
        const by = Math.round(H.lerp(98, 0, up) / 8) * 8, bh = up > 0 ? 16 : 46;
        tbox(0, by, LW, up >= 1 ? 16 : bh);
        if (up === 0) { stamp(typed('HOW DOES', 0.2, 20), 8, by + 8, 3, 16); stamp(typed('AI LEARN?', 0.6, 20), 8, by + 26, 3, 16); }
        else stamp('HOW DOES AI LEARN?', 8, by + 4);
        // door-style palette fade to white into the next scene
        const fo = [[0, 1, 2, 3], [0, 0, 1, 2], [0, 0, 0, 1], [0, 0, 0, 0]];
        remap(fo[H.clamp(Math.floor((tq - 2.1) / 0.06) + 1, 0, 3)]);
        return S;
      }
      if (tq < 6.5) { // ---------- BEAT 2: labelled cards walk the arrow path into CHIP (the model) ----------
        rect(0, 0, LW, LH, 0);
        for (let y = 20; y < 100; y++) for (let x = 0; x < LW; x++) if ((x + y) % 4 === 0 && y % 2 === 0) put(x, y, 1); // floor tiles
        // arrow-tile path
        for (let x = 0; x < 112; x += 8) spr(GB_ARW, x + ((Math.floor(tq * 8)) % 8 < 4 ? 0 : 1), 80, false);
        rect(0, 89, 116, 1, 2);
        stamp('TRAINING DATA', 4, 91, 3);
        // the model: CHIP at 2x on a pad, label landing under it
        rect(112, 74, 44, 6, 2); rect(112, 74, 44, 1, 3);
        const gulp = Math.floor((tq - 2.95) / 0.4) >= 0 && ((tq - 2.95) % 0.4) < 0.07 && tq < 6.0;
        spr(BOT, 118, 40 + (gulp ? -2 : 0), true, 2);
        tbox(112, 20, 46, 16); stamp('MODEL', 115, 24);
        // cards
        for (let i = 0; i < 9; i++) {
          const k = (tq - (2.55 + i * 0.4)) / 1.8; if (k < 0 || k >= 1) continue;
          const x = Math.round(-28 + k * 150), isCat = i % 3 !== 1;
          tbox(x, 44, 28, 22); spr(isCat ? GB_CAT : GB_DOG, x + 9, 50, false);
          rect(x, 66, 28, 11, 3); stamp(isCat ? 'CAT' : 'DOG', x + 2, 68, 0);
        }
        // counter text box
        tbox(0, 100, LW, 44); stamp('EXAMPLES SEEN', 8, 106); stamp(fmt(1e6 * Math.pow(pr(2.8, 5.8), 2.2)), 8, 120, 3, 16);
        header();
        const fi = [[0, 0, 0, 0], [0, 0, 0, 1], [0, 0, 1, 2], [0, 1, 2, 3]];
        remap(fi[H.clamp(Math.floor((tq - 2.35) / 0.06), 0, 3)]);
        // battle intro: flashes, then striped wipe
        if (tq > 6.0 && tq < 6.25 && Math.floor((tq - 6.0) / 0.05) % 2 === 0) remap([3, 2, 1, 0]);
        if (tq >= 6.25) { const k = pr(6.25, 6.5); for (let y = 0; y < LH; y++) { const w = Math.round(k * LW); if (Math.floor(y / 4) % 2) rect(0, y, w, 1, 3); else rect(LW - w, y, w, 1, 3); } }
        return S;
      }
      if (tq < 10.55) { // ---------- BEAT 3: battle — GUESS / CHECK / ADJUST ----------
        rect(0, 0, LW, LH, 0);
        const phase = tq < 7.4 ? 0 : tq < 8.3 ? 1 : tq < 9.4 ? 2 : 0;
        const shake = tq > 7.4 && tq < 7.7 ? (Math.floor(tq * 30) % 2 ? 2 : -2) : 0;
        // enemy: the picture (a cat) on its platform + name box
        for (let x = -24; x <= 24; x++) { const y = Math.round(Math.sqrt(Math.max(0, 1 - (x / 24) ** 2)) * 5); put(118 + x, 48 + y, 2); put(118 + x, 48 - y, 2); }
        if (!(tq > 7.4 && tq < 7.8 && Math.floor(tq * 15) % 2)) spr(GB_CAT, 107 + shake, 26, false, 2);
        tbox(4, 20, 70, 16); stamp('NEW PIC', 10, 24);
        // player: CHIP (the model) + weights panel
        for (let x = -28; x <= 28; x++) { const y = Math.round(Math.sqrt(Math.max(0, 1 - (x / 28) ** 2)) * 5); put(34 + x, 96 + y, 2); put(34 + x, 96 - y, 2); }
        spr(BOT, 18, 66 + Math.round(Math.sin(tq * 4)), false, 2);
        tbox(70, 56, 90, 48); stamp('MODEL', 76, 60);
        const adj = Math.floor(pr(8.55, 9.15) * 4) / 4;
        [[0.3, 0.8], [0.85, 0.45], [0.5, 0.95]].forEach(([a, b], i) => { const v = H.lerp(a, b, adj), y = 72 + i * 10; stamp('W' + (i + 1), 76, y - 1, 3); rect(94, y, 60, 4, 3); rect(95, y + 1, Math.round(58 * v), 2, adj > 0 && adj < 1 && Math.floor(tq * 15) % 2 ? 1 : 0); });
        // error trail: dotted line from the picture back to the model
        if (tq > 8.3 && tq < 9.4) { const k = pr(8.3, 8.75); for (let s2 = 0; s2 < k; s2 += 0.04) { const x = Math.round(H.lerp(104, 50, s2)), y = Math.round(H.lerp(44, 66, s2) - Math.sin(s2 * Math.PI) * 14); rect(x, y, 2, 2, 3); } }
        // message box + command menu
        tbox(0, 104, 98, 40); tbox(96, 104, 64, 40);
        ['GUESS', 'CHECK', 'ADJST'].forEach((nm, i) => stamp(nm, 110, 110 + i * 11));
        if (Math.floor(tq * 4) % 2 === 0 || true) spr(['3...', '33..', '333.', '33..', '3...'], 102, 111 + phase * 11, false);
        let m1 = '', m2 = '';
        if (tq < 7.4) { m1 = 'CHIP SAYS'; m2 = typed('DOG?', 6.75, 12); }
        else if (tq < 8.3) { m1 = 'WRONG!'; m2 = "IT'S A CAT"; }
        else if (tq < 9.4) { m1 = 'ERROR!'; m2 = 'ADJUSTING'; }
        else { m1 = 'CHIP SAYS'; m2 = typed('CAT!', 9.55, 12); }
        stamp(m1, 6, 110); const big = m2 === 'DOG?' || m2 === 'CAT!' || m2.length < 4; stamp(m2, 6, big ? 122 : 126, 3, big ? 16 : 8);
        if (tq > 9.9) { spr(['......33', '.....33.', '33..33..', '.3333...', '..33....'], 76, 126, false, 2); }
        header();
        if (tq > 7.4 && tq < 7.48) remap([3, 2, 1, 0]); // hit flash
        const fo = [[0, 1, 2, 3], [0, 0, 1, 2], [0, 0, 0, 1], [0, 0, 0, 0]];
        if (tq > 10.3) remap(fo[H.clamp(Math.floor((tq - 10.3) / 0.06) + 1, 0, 3)]);
        if (tq < 6.65) { const k = 1 - pr(6.5, 6.65); for (let y = 0; y < LH; y++) { const w = Math.round(k * LW); if (Math.floor(y / 4) % 2) rect(0, y, w, 1, 3); else rect(LW - w, y, w, 1, 3); } }
        return S;
      }
      // ---------- BEAT 4 + 5: level-up stats screen, then the takeaway ----------
      rect(0, 0, LW, LH, 0);
      const p = pr(10.8, 11.9), val = Math.round(61 + 36 * H.ease.out(p));
      tbox(0, 18, LW, 86);
      stamp('ACCURACY', 8, 26);
      const box97 = p >= 1 && (Math.floor(tq * 6) % 2 === 0 || tq > 12.9);
      if (box97) rect(6, 38, 66, 22, 3);
      stamp(val + '%', 8, 41, box97 ? 0 : 3, 16);
      stamp('61%>' + val + '%', 8, 64);
      stamp('EXP', 8, 78); rect(36, 78, 36, 7, 3); rect(37, 79, Math.round(34 * H.ease.out(p)), 5, 1);
      if (p >= 1) stamp('LEVEL UP!', 8, 90);
      // bar chart of rounds
      for (let y = 30; y <= 96; y++) put(84, y, 3); for (let x = 84; x < 154; x++) put(x, 96, 3);
      for (let i = 0; i < 8; i++) { const g = H.clamp(p * 8 - i); if (g <= 0) break; const h = Math.round(((97 - 36 * Math.exp(-i / 2.5)) / 100) * 60 * g); rect(88 + i * 8, 96 - h, 6, h, i === 7 && p >= 1 ? 3 : 2); }
      if (p >= 1) for (let k = 0; k < 4; k++) { const a = k * 1.57 + tq * 4, x = Math.round(150 + Math.cos(a) * 6), y = Math.round(34 + Math.sin(a) * 6); put(x, y, 3); put(x + 1, y, 2); }
      tbox(0, 104, LW, 40); stamp('TRAINING', 8, 112); stamp('ROUNDS: ' + String(Math.round(H.ease.out(p) * 500)), 8, 126);
      if (tq > 13.0) { // takeaway: full-screen ending card, one big word per line
        tbox(0, 16, LW, 128);
        stamp(typed('MORE', 13.0, 30), 48, 26, 3, 16); stamp(typed('EXAMPLES', 13.1, 30), 16, 46, 3, 16);
        if (tq > 13.35) spr(['3333333', '.32223.', '..323..', '...3...'], 76, 68, false, 2);
        stamp(typed('BETTER', 13.4, 30), 32, 84, 3, 16); stamp(typed('GUESSES!', 13.55, 30), 16, 104, 3, 16);
      }
      header();
      const fi = [[0, 0, 0, 0], [0, 0, 0, 1], [0, 0, 1, 2], [0, 1, 2, 3]];
      remap(fi[H.clamp(Math.floor((tq - 10.55) / 0.06), 0, 3)]);
      return S;
    };
    gbCompose(ctx, W, H_, t, renderWorld);
  }

  // ================= SOUND: the handheld's own 4 channels. Two square pulses for text blips, menus and jingles, the
  // wave channel for bass, and the crunchy noise channel for hits, doors and the battle intro. Mono-ish (small pans),
  // like the one tiny speaker. Times copied from gbExplainer (it runs on a 60 fps clock: tq = floor(t*60)/60).
  function gbSound(k) {
    const END = 14.5;
    const pu = (t, f, dur, gain, pan = 0, minor) => k.tone(t, { f, type: 'square', dur, gain, a: 0.001, hold: dur * 0.65, pan, minor });
    const wv = (t, f, dur, gain, pan = 0) => k.tone(t, { f, type: 'triangle', dur, gain, a: 0.002, hold: dur * 0.6, pan });
    const nz = (t, dur, gain, o) => k.noise(t, Object.assign({ dur, filter: 'lowpass', f: 3000, gain, rate: 0.22, a: 0.001 }, o)); // LFSR-ish crunch
    // dialog text: one low blip per printed letter
    const text = (t0, n, cps, pan = 0) => { for (let i = 0; i < n; i++) pu(t0 + i / cps, i % 2 ? 'A4' : 'D5', 0.03, 0.045, pan, true); };
    // door / palette fade: falling noise + pulse step down (out), rising (in)
    const door = (t, out) => { nz(t, 0.2, 0.12, { f: out ? [[0, 3000], [0.2, 600]] : [[0, 600], [0.2, 3000]] }); pu(t, out ? 'C5' : 'G4', 0.06, 0.05); pu(t + 0.06, out ? 'G4' : 'C5', 0.08, 0.05); };

    // ---- music: overworld while the data walks in, battle theme for the loop, light theme on the stats screen
    k.music('chip', 2.53, 6.0, { bpm: 132, gain: 0.4, chords: [['G3', 'B3', 'D4', 'G4'], ['E3', 'G3', 'B3', 'E4']] });
    k.music('chip', 6.65, 10.3, { bpm: 168, gain: 0.45, chords: [['E3', 'G3', 'B3', 'E4'], ['C3', 'E3', 'G3', 'C4'], ['D3', 'F#3', 'A3', 'D4']] });
    k.music('chip', 10.73, 11.85, { bpm: 132, gain: 0.3, chords: [['C4', 'E4', 'G4', 'C5']] });
    k.music('chip', 12.9, END, { bpm: 132, gain: 0.3, chords: [['F3', 'A3', 'C4', 'F4'], ['C4', 'E4', 'G4', 'C5']] });

    // ---- BEAT 1: question prints (0.2: 8 chars at 20 cps; 0.6: 9 chars), window steps up into the header (1.65-1.95)
    text(0.2, 8, 20, -0.1); text(0.6, 9, 20, -0.1);
    ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => pu(1.65 + i * 0.1, n, 0.05, 0.05, 0, true));
    door(2.1, true);                                                                          // fade to white 2.1-2.28
    door(2.35, false);                                                                        // fade in 2.35-2.53

    // ---- BEAT 2: CHIP gulps every 0.4 s from 2.95 (2-px hop), counter 2.8-5.8, lands on 1,000,000
    for (let i = 0; i < 8; i++) { const t = 2.95 + i * 0.4, b = 330 * Math.pow(2, i / 12); k.tone(t, { f: [[0, b], [0.06, b * 1.5]], type: 'square', dur: 0.07, gain: 0.04, a: 0.001, hold: 0.04, pan: 0.3, minor: true }); }
    for (let t = 2.85; t < 5.75;) { nz(t, 0.02, 0.07, { f: 6000, rate: 0.5, pan: -0.2, minor: true }); t += H.lerp(0.25, 1 / 12, (t - 2.8) / 3.0); }
    pu(5.8, 'G5', 0.08, 0.05); pu(5.88, 'C6', 0.2, 0.05); wv(5.8, 'C4', 0.28, 0.1);                 // item-get blip
    // battle intro: 5 inverted flashes (6.0-6.25, every 0.05) then stripes wipe (6.25-6.65)
    for (let i = 0; i < 5; i++) { pu(6.0 + i * 0.05, i % 2 ? 'E5' : 'B5', 0.04, 0.05); }
    for (let i = 0; i < 8; i++) pu(6.25 + i * 0.05, 200 * Math.pow(2, i / 4), 0.045, 0.045);   // stripes sweep up
    nz(6.25, 0.4, 0.1, { f: [[0, 800], [0.4, 4000]], a: 0.2 });

    // ---- BEAT 3: "CHIP SAYS DOG?" (6.75, 12 cps)
    text(6.75, 4, 12, 0.1);
    // CHECK (7.4): cursor, hit flash, shake and the cat blinking -> damage crunch + low falling pulse
    pu(7.4, 'A4', 0.03, 0.05, 0.2, true);
    nz(7.4, 0.35, 0.34, { f: [[0, 4000], [0.3, 700]] });
    k.tone(7.4, { f: [[0, 700], [0.28, 110]], type: 'square', dur: 0.3, gain: 0.1, a: 0.001, hold: 0.22, pan: 0.3 }); wv(7.4, 'E2', 0.3, 0.2);
    pu(7.75, 'D3', 0.14, 0.07); pu(7.9, 'A2', 0.25, 0.07);                                     // "WRONG! IT'S A CAT" buzzer
    // ADJUST (8.3): cursor, dotted error trail 8.3-8.75, weight bars step in 4 levels (8.7, 8.85, 9.0, 9.15)
    pu(8.3, 'A4', 0.03, 0.05, 0.2, true);
    k.withMinor(() => { for (let i = 0; i < 6; i++) { const f = i / 5; pu(8.3 + f * 0.45, 900 * Math.pow(2, -f * 1.2), 0.04, 0.04, 0.4 - f * 0.6); } });
    ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => pu(8.7 + i * 0.15, n, i === 3 ? 0.14 : 0.06, 0.05, 0.2, true));
    // GUESS again (9.4), "CAT!" (9.55, 12 cps), check sprite (9.9): the correction
    pu(9.4, 'A4', 0.03, 0.05, 0.2, true);
    text(9.55, 4, 12, 0.1);
    ['C5', 'E5', 'G5'].forEach((n, i) => pu(9.9 + i * 0.06, n, 0.06, 0.05, -0.2)); pu(10.08, 'C6', 0.25, 0.045, -0.2); wv(9.9, 'C3', 0.35, 0.11);
    door(10.3, true); door(10.55, false);

    // ---- BEAT 4: EXP bar fills 10.8-11.9 (ease-out): the classic rising EXP-gain sweep, % ticks slowing as it settles
    k.tone(10.8, { f: [[0, 300], [0.4, 900], [1.1, 1250]], type: 'square', dur: 1.1, gain: 0.035, a: 0.01, hold: 1.0, pan: -0.2 });
    { let last = 61, lastT = -1; for (let f = Math.ceil(10.8 * 60); f < 11.88 * 60; f++) { const t = f / 60, v = Math.round(61 + 36 * H.ease.out(H.clamp((t - 10.8) / 1.1))); if (v > last && t - lastT >= 1 / 12) { nz(t, 0.02, 0.07, { f: 6000, rate: 0.5, minor: true }); last = v; lastT = t; } } }
    // 97% + LEVEL UP! (11.9): the biggest hit. level-up fanfare on both pulses over the wave bass, noise crash
    const L = 11.9;
    nz(L, 0.3, 0.16, { f: [[0, 5000], [0.3, 1500]] });
    [['C5', 0.1], ['C5', 0.1], ['C5', 0.1], ['G5', 0.55]].forEach(([n, d], i) => { const t = L + [0, 0.11, 0.22, 0.33][i]; pu(t, n, d, 0.085); pu(t, k.hz(n) * 0.75, d, 0.05); });
    wv(L, 'C3', 0.3, 0.28); wv(L + 0.33, 'G3', 0.55, 0.28);
    ['E6', 'G6', 'C6', 'E6', 'G6', 'C6'].forEach((n, i) => pu(L + 0.4 + i * 0.07, n, 0.04, 0.02, 0.5, true)); // sparkles orbiting
    // ---- BEAT 5: takeaway card types (MORE 13.0, EXAMPLES 13.1, BETTER 13.4, GUESSES! 13.55, all 30 cps), lands 13.82
    k.withMinor(() => { for (let t = 13.0; t < 13.8; t += 1 / 15) pu(t, Math.round((t - 13) * 15) % 2 ? 'A4' : 'D5', 0.03, 0.045); });
    pu(13.35, 'G4', 0.05, 0.04);                                                             // the down-arrow lands
    const TAKE = 13.82;
    pu(TAKE, 'B4', 0.1, 0.04); pu(TAKE + 0.1, 'C5', 0.6, 0.04); pu(TAKE + 0.1, 'G4', 0.6, 0.022); wv(TAKE, 'C3', 0.75, 0.12);
  }

  registerStyle({
    id: 'gameboy',
    name: 'Pocket Monochrome',
    category: 'Retro Digital',
    description: 'An original DMG handheld frame: 160x144 pixels in exactly four pea-soup greens, a visible LCD pixel grid with each pixel casting a faint shadow on the reflective backing, motion ghosting, and the purple-grey bezel with its striped DOT MATRIX label.',
    motion: 'A handheld boot: the logo scrolls down one LCD pixel per frame and smears, the palette steps to white, the overworld steps back in through the 4 shades, the hero walks on 1 px per frame with a 2-frame cycle, and the window pops up and prints text.',
    duration: 6.2,
    fonts: ['8px "Press Start 2P"', '16px "Press Start 2P"', 'italic 700 13px "Inter"', '600 11px "Inter"', '800 30px "Inter"'],
    frameT: 6.0,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'Explains as a handheld monster-battle RPG in four LCD shades: the question text box slides up the window layer into a header, palette fades act as door transitions, labelled cards march an arrow-tile path into CHIP the model, a flash-and-stripes battle intro starts a GUESS/CHECK/ADJUST fight (hit flash, dotted error trail, weight bars), and a LEVEL UP stats screen counts accuracy to an inverted 97%.',
    explainer(ctx, W, H_, t) { gbExplainer(ctx, W, H_, t); },
    explainerSound(k) { gbSound(k); },
    draw(ctx, W, H_, t) {
      // ---------- LCD world renderer: returns shade indices (0..3) at time tt ----------
      const textLayer = H.layer(LW, 16), tlx = textLayer.getContext('2d', { willReadFrequently: true });
      const renderWorld = (tt) => {
        const S = new Uint8Array(LW * LH);
        const put = (x, y, v) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < LW && y < LH) S[y * LW + x] = v; };
        const rect = (x, y, w, h, v) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, v); };
        const spr = (rows, ox, oy, flip) => rows.forEach((row, j) => [...row].forEach((c, i) => { if (c >= '0' && c <= '3') put(ox + (flip ? 15 - i : i), oy + j, +c); }));
        const tq = Math.floor(tt * 60) / 60; // 60 Hz game tick
        const stamp = (str, x, y, v) => {
          tlx.clearRect(0, 0, LW, 16); tlx.font = '8px "Press Start 2P"'; tlx.textBaseline = 'top'; tlx.fillStyle = '#000'; tlx.fillText(str, 0, 0);
          const d = tlx.getImageData(0, 0, LW, 10).data;
          for (let j = 0; j < 10; j++) for (let i = 0; i < LW; i++) if (d[(j * LW + i) * 4 + 3] > 110) put(x + i, y + j, v);
        };
        const remap = (m) => { for (let i = 0; i < S.length; i++) S[i] = m[S[i]]; };
        // ---------- boot sequence ----------
        if (tt < 2.0) {
          if (tt >= 0.15) {
            const ly = Math.min(60, -10 + Math.floor((tq - 0.15) * 66));
            stamp('POCKET AI', 44, ly, 3);
            if (ly >= 60) { rect(44, ly + 11, 72, 1, 2); stamp('\u00ae', 119, ly - 5, 2); }
          }
          const fadeOut = [[0, 1, 2, 3], [0, 0, 1, 2], [0, 0, 0, 1], [0, 0, 0, 0]];
          remap(fadeOut[H.clamp(Math.floor((tt - 1.75) / 0.07) + 1, 0, 3)]);
          return S;
        }
        const rnd = H.rng(144);
        // grass base with sparse tufts
        for (let y = 0; y < LH; y++) for (let x = 0; x < LW; x++) {
          const h = ((x * 73856093) ^ (y * 19349663)) >>> 0;
          put(x, y, (h % 29 === 0) ? 2 : (h % 13 === 0 ? 0 : 1));
        }
        for (let k = 0; k < 46; k++) { const x = rnd.int(0, LW - 3), y = rnd.int(0, 96); put(x, y, 2); put(x + 2, y, 2); put(x + 1, y - 1, 2); }
        // dirt path (from lab door down/left), with pebble dither
        const pathCells = [];
        for (let y = 50; y < 96; y++) for (let x = 84; x < 100; x++) pathCells.push([x, y]);
        for (let y = 66; y < 82; y++) for (let x = 20; x < 100; x++) pathCells.push([x, y]);
        pathCells.forEach(([x, y]) => put(x, y, ((x * 7 + y * 13) % 17 === 0) ? 1 : 0));
        // path edge lines
        for (let x = 20; x < 84; x++) { put(x, 65, 2); put(x, 82, 2); }
        for (let y = 50; y < 66; y++) { put(83, y, 2); put(100, y, 2); }
        for (let y = 82; y < 96; y++) { put(83, y, 2); put(100, y, 2); }
        // pond with animated wave glints
        for (let y = 40; y < 64; y++) for (let x = 4; x < 64; x++) {
          const dx = (x - 33) / 27, dy = (y - 52) / 10;
          if (dx * dx + dy * dy > 1) continue;
          const edge = dx * dx + dy * dy > 0.82;
          let v = edge ? 3 : 2;
          if (!edge && ((x + Math.floor(tt * 4) * 2 + (y % 4) * 5) % 12 < 4) && y % 3 === 1) v = 1; if (!edge && ((x + Math.floor(tt * 4) * 2) % 24 === 0) && y % 3 === 1) v = 0;
          put(x, y, v);
        }
        // tall grass patch (right)
        for (let ty = 0; ty < 3; ty++) for (let tx = 0; tx < 4; tx++) {
          const ox = 112 + tx * 8, oy = 66 + ty * 8;
          const sway = Math.floor(tt * 3 + tx + ty) % 2;
          [[1, 6], [2, 3], [3, 6], [5, 6], [6, 2 + sway], [7, 6]].forEach(([a, b]) => { for (let q = b; q < 8; q++) put(ox + a, oy + q, q === b ? 3 : 2); });
        }
        // flowers
        [[10, 88], [22, 92], [48, 87], [70, 44], [106, 50], [146, 58], [62, 92], [140, 92], [34, 86], [6, 70]].forEach(([x, y], i) => {
          const bloom = (Math.floor(tt * 2) + i) % 2;
          put(x, y - 1, 0); put(x - 1, y, 0); put(x + 1, y, 0); put(x, y + 1, 0); put(x, y, bloom ? 3 : 2);
        });
        // lab building (with roof dish = "AI lab")
        const lx = 70, ly = 14, lw = 46, lh = 36;
        rect(lx, ly + 10, lw, lh - 10, 0);
        for (let y = ly; y < ly + 12; y++) { const inset = Math.max(0, 11 - (y - ly)) >> 2; rect(lx - 2 + inset, y, lw + 4 - inset * 2, 1, (y - ly) % 3 === 0 ? 3 : 2); }
        rect(lx - 3, ly + 12, lw + 6, 1, 3);
        for (let y = ly + 12; y < ly + lh; y++) { put(lx, y, 3); put(lx + lw - 1, y, 3); }
        rect(lx, ly + lh - 1, lw, 1, 3);
        for (let y = ly + 16; y < ly + lh - 1; y += 4) for (let x = lx + 1; x < lx + lw - 1; x++) if ((x + y) % 7 === 0) put(x, y, 1);
        // windows
        [[lx + 5, ly + 17], [lx + 31, ly + 17]].forEach(([wx, wy]) => { rect(wx, wy, 10, 8, 3); rect(wx + 1, wy + 1, 8, 6, 2); put(wx + 2, wy + 2, 0); put(wx + 3, wy + 2, 0); put(wx + 2, wy + 3, 0); rect(wx + 5, wy, 1, 8, 3); });
        // door
        rect(lx + 18, ly + 22, 10, 14, 3); rect(lx + 19, ly + 23, 8, 12, 2); put(lx + 25, ly + 29, 0);
        // sign above door: chip glyph
        rect(lx + 17, ly + 14, 12, 6, 3); rect(lx + 18, ly + 15, 10, 4, 0); rect(lx + 21, ly + 16, 4, 2, 3);
        for (let k = 0; k < 3; k++) { put(lx + 20 + k * 2, ly + 14, 0); put(lx + 20 + k * 2, ly + 19, 0); }
        // dish on roof
        const dx0 = lx + 36, dy0 = ly - 6;
        for (let a = 0; a < 10; a++) { put(dx0 + a, dy0 + Math.round(((a - 4.5) ** 2) / 6), 3); }
        rect(dx0 + 4, dy0 + 3, 2, 6, 3);
        const blink = Math.floor(tt * 3) % 2; put(dx0 + 4, dy0 - 2, blink ? 3 : 1); put(dx0 + 5, dy0 - 2, blink ? 3 : 1);
        // signal arcs from dish
        if (blink) for (let a = -0.9; a < 0.9; a += 0.08) { put(dx0 + 4 + Math.sin(a) * 6, dy0 - 3 - Math.cos(a) * 5, 2); }
        // fence
        for (let x = 2; x < 66; x++) { put(x, 32, 3); put(x, 36, 3); }
        for (let x = 2; x < 66; x += 6) { rect(x, 30, 2, 9, 3); put(x, 30, 2); }
        // trees: border top + left
        for (let x = -8; x < LW; x += 16) if (x < 60 || x > 120) spr(TREE, x, -6, false);
        spr(TREE, 0, 12, false); spr(TREE, 16, 10, true); spr(TREE, 142, 14, false); spr(TREE, 144, 36, true);
        spr(TREE, 124, 30, false);
        // signpost
        rect(126, 50, 12, 8, 3); rect(127, 51, 10, 6, 0); for (let x = 128; x < 136; x += 2) put(x, 53, 2); for (let x = 129; x < 135; x += 2) put(x, 55, 2); rect(131, 58, 2, 5, 3);
        // hero walking right along the path + robot hovering
        const walkD = H.clamp((tq - 2.3) * 60, 0, 80), walking = walkD > 0 && walkD < 80;
        const walkX = -16 + Math.floor(walkD);
        const frame = walking ? Math.floor(tq * 8) % 2 : 1;
        // shadows
        for (let i = 3; i < 13; i++) put(walkX + i, 82, 2);
        spr(frame ? HERO_A : HERO_B, Math.round(walkX), 66 + (frame ? 0 : -1), false);
        const bx = 84, by = 58 + Math.round(Math.sin(tq * 4) * 2.5);
        for (let i = 4; i < 11; i++) put(bx + i, 80, (i % 2) ? 2 : 1);
        spr(BOT, bx, by, true);
        // heart emote over the robot
        const HEART = ['.33.33.', '3003003', '3000003', '.30003.', '..303..', '...3...'];
        if (tt >= 3.7 && Math.floor(tt * 2) % 2 === 0) HEART.forEach((row, j2) => [...row].forEach((c, i2) => { if (c !== '.') put(bx + 4 + i2, by - 8 + j2, +c); }));

        // ---------- text box ----------
        const tby = 98;
        const fadeIn = [[0, 0, 0, 0], [0, 0, 0, 1], [0, 0, 1, 2], [0, 1, 2, 3]];
        if (tt < 3.75) { remap(fadeIn[H.clamp(Math.floor((tt - 2.0) / 0.08), 0, 3)]); return S; }
        rect(0, tby, LW, LH - tby, 0);
        rect(0, tby, LW, 1, 3); rect(0, LH - 1, LW, 1, 3); rect(0, tby, 1, LH - tby, 3); rect(LW - 1, tby, 1, LH - tby, 3);
        rect(2, tby + 2, LW - 4, 1, 3); rect(2, LH - 3, LW - 4, 1, 3); rect(2, tby + 2, 1, LH - tby - 4, 3); rect(LW - 3, tby + 2, 1, LH - tby - 4, 3);
        // corner pips
        [[3, tby + 3], [LW - 4, tby + 3], [3, LH - 4], [LW - 4, LH - 4]].forEach(([x, y]) => put(x, y, 2));
        const lines = ['MEET CHIP,', 'YOUR AI PAL!'];
        const total = lines.join('').length;
        let budget = Math.floor(Math.max(0, tt - 3.8) * 30);
        const text = (str, x, y) => {
          tlx.clearRect(0, 0, LW, 16); tlx.font = '8px "Press Start 2P"'; tlx.textBaseline = 'top'; tlx.fillStyle = '#000'; tlx.fillText(str, 0, 0);
          const d = tlx.getImageData(0, 0, LW, 10).data;
          for (let j = 0; j < 10; j++) for (let i = 0; i < LW; i++) if (d[(j * LW + i) * 4 + 3] > 110) put(x + i, y + j, 3);
        };
        lines.forEach((ln, i) => { const s = ln.slice(0, Math.max(0, budget)); budget -= ln.length; text(s, 10, tby + 12 + i * 16); });
        if (budget >= 0 && Math.floor(tt * 2.5) % 2 === 0) { const ax = LW - 14, ay = LH - 12; rect(ax, ay, 7, 1, 3); rect(ax + 1, ay + 1, 5, 1, 3); rect(ax + 2, ay + 2, 3, 1, 3); put(ax + 3, ay + 3, 3); }
        return S;
      };

      gbCompose(ctx, W, H_, t, renderWorld);
    },
  });
}
