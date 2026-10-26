{
  const TAU = Math.PI * 2;
  // 5x7 sampler alphabet
  const FONT = {
    H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    ',': ['00', '00', '00', '00', '00', '01', '10'],
    ' ': ['00', '00', '00', '00', '00', '00', '00'],
  };
  const HEART = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
  const FLOWER = ['01010', '11111', '01210', '11111', '01010'];

  // =====================================================================
  // EXPLAINER: one long sampler; the cloth slides through the hoop from
  // motif to motif. Everything is stitched cell by cell; arrows are backstitch.
  // =====================================================================
  const F7 = {
    ...FONT,
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  };
  const F3 = {
    A: ['010', '101', '111', '101', '101'], B: ['110', '101', '110', '101', '110'], C: ['011', '100', '100', '100', '011'],
    D: ['110', '101', '101', '101', '110'], E: ['111', '100', '110', '100', '111'], G: ['011', '100', '101', '101', '011'],
    H: ['101', '101', '111', '101', '101'], I: ['111', '010', '010', '010', '111'], J: ['001', '001', '001', '101', '010'],
    K: ['101', '101', '110', '101', '101'], L: ['100', '100', '100', '100', '111'], M: ['10001', '11011', '10101', '10001', '10001'],
    N: ['1001', '1101', '1011', '1001', '1001'], O: ['010', '101', '101', '101', '010'], P: ['110', '101', '110', '100', '100'],
    R: ['110', '101', '110', '101', '101'], S: ['011', '100', '010', '001', '110'], T: ['111', '010', '010', '010', '010'],
    U: ['101', '101', '101', '101', '111'], W: ['10001', '10001', '10101', '11011', '10001'], X: ['101', '101', '010', '101', '101'],
    Y: ['101', '101', '010', '010', '010'], '?': ['110', '001', '010', '000', '010'], '%': ['100', '001', '010', '100', '001'],
    ',': ['00', '00', '00', '01', '10'], ' ': ['00', '00', '00', '00', '00'], '>': ['00100', '00010', '11111', '00010', '00100'],
    0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['110', '001', '010', '100', '111'],
    3: ['110', '001', '010', '001', '110'], 4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '110', '001', '110'],
    6: ['011', '100', '110', '101', '010'], 7: ['111', '001', '010', '010', '010'], 8: ['010', '101', '010', '101', '010'], 9: ['010', '101', '011', '001', '110'],
  };
  const XPAL = { R: '#c43a46', N: '#2e3760', T: '#5fb3a9', t: '#3f8c86', Y: '#f2c14e', O: '#ef8a3c', B: '#a8673c', D: '#5e3a22', K: '#2a2433', P: '#e98aa0', p: '#c4566f', G: '#4f9a52', W: '#dfe3e8', g: '#9aa0a8' };
  const ICON = {
    cat: ['O.......O', 'OO.....OO', 'OOOOOOOOO', 'OOKOOOKOO', 'OOOOOOOOO', 'OOOOPOOOO', '.OOOOOOO.', '..OOOOO..'],
    dog: ['DD.....DD', 'DDBBBBBDD', 'DBBBBBBBD', 'DBKBBBKBD', '.BBBBBBB.', '.BBBKBBB.', '..BBBBB..', '...BBB...'],
    brain: ['...PPPPPP...', '.PPpPPPPpPP.', 'PPPPPpPPPPPP', 'PpPPPPPPpPPP', 'PPPPpPPPPPpP', 'PPpPPPPpPPPP', '.PPPPPpPPPP.', '..PPPPPPPP..', '.....pp.....', '.....pp.....'],
    check: ['.......GG', '......GG.', 'GG...GG..', '.GG.GG...', '..GGG....'],
    x: ['RR...RR', '.RR.RR.', '..RRR..', '.RR.RR.', 'RR...RR'],
  };
  const XC = {};
  const xLeg = (c, x0, y0, x1, y1, rgb, rr) => {
    const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux;
    c.lineCap = 'round'; c.strokeStyle = 'rgba(40,25,10,0.32)'; c.lineWidth = 5.8;
    c.beginPath(); c.moveTo(x0 + 0.7, y0 + 1.1); c.lineTo(x1 + 0.7, y1 + 1.1); c.stroke();
    for (let s = -1; s <= 1; s += 2) {
      const ox = nx * s * 1.25, oy = ny * s * 1.25, g = c.createLinearGradient(x0, y0, x1, y1);
      const dk = rgb.map((v) => v * 0.55), md = rgb.map((v) => Math.min(255, v * 1.08)), hi = rgb.map((v) => Math.min(255, v * 1.22 + 18));
      g.addColorStop(0, H.rgba(dk)); g.addColorStop(0.22, H.rgba(md)); g.addColorStop(0.5, H.rgba(s < 0 ? hi : md)); g.addColorStop(0.78, H.rgba(md)); g.addColorStop(1, H.rgba(dk));
      c.strokeStyle = g; c.lineWidth = 2.9; c.beginPath(); c.moveTo(x0 + ox, y0 + oy); c.lineTo(x1 + ox, y1 + oy); c.stroke();
      c.lineWidth = 0.7;
      for (let k = 2.2 + rr() * 1.5; k < len - 1.5; k += 2.3) {
        const px = x0 + ox + ux * k, py = y0 + oy + uy * k;
        c.strokeStyle = `rgba(255,255,255,${0.12 + rr() * 0.14})`; c.beginPath(); c.moveTo(px - nx * 1.3 - ux * 0.8, py - ny * 1.3 - uy * 0.8); c.lineTo(px + nx * 1.3 + ux * 0.8, py + ny * 1.3 + uy * 0.8); c.stroke();
      }
    }
  };
  const xSprite = (key, v, half) => {
    const id = key + v + (half ? 'h' : '');
    if (XC[id]) return XC[id];
    const S = 12, P = 4, cv = H.layer(S + P * 2, S + P * 2), c = cv.getContext('2d'), rr = H.rng(key.charCodeAt(0) * 31 + v * 7);
    const rgb = H.hex(XPAL[key]).map((x) => x * (0.96 + rr() * 0.08));
    xLeg(c, P + 1, P + S - 1, P + S - 1, P + 1, rgb.map((x) => x * 0.9), rr);
    if (!half) xLeg(c, P + 1, P + 1, P + S - 1, P + S - 1, rgb, rr);
    return (XC[id] = cv);
  };

  const EXPLAIN = (ctx, W, H_, t) => {
    const S = 12, HC = [640, 372], HR = 548, HW = 30;
    const seg = (a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
    // the cloth slides through the hoop (in whole-cell steps of motion blur-free px)
    const camX = 1200 * seg(1.85, 2.35) + 408 * seg(5.6, 6.2) + 1200 * seg(10.1, 10.8);
    const cam = Math.round(camX);

    // ---------- aida (per-pixel, scrolls with the cloth) ----------
    if (!XC.lut) {
      const lut = new Float32Array(S * S);
      for (let fy = 0; fy < S; fy++) for (let fx = 0; fx < S; fx++) {
        const dx = Math.min(fx + 0.5, S - fx - 0.5), dy = Math.min(fy + 0.5, S - fy - 0.5);
        const hole = Math.exp(-(dx * dx + dy * dy) / 1.9), groove = Math.exp((-dx * dx) / 0.9) * 0.5 + Math.exp((-dy * dy) / 0.9) * 0.5;
        const sx = fx < S / 2 ? 0 : 1, sy = fy < S / 2 ? 0 : 1, horiz = (sx + sy) % 2 === 0, ph = horiz ? fy : fx, along = horiz ? fx : fy;
        lut[fy * S + fx] = 1 - hole * 0.42 - groove * 0.13 + (Math.cos((ph * TAU) / 3) * 0.5 + Math.cos((along * TAU) / 6 + ph) * 0.15) * 0.06;
      }
      XC.lut = lut;
      const cn = new Float32Array(4096), r = H.rng(2024); for (let i = 0; i < 4096; i++) cn[i] = r.gauss() * 0.018; XC.cn = cn;
      const out = new Float32Array(W * H_), nz = H.makeNoise(11);
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const dist = Math.hypot(x - HC[0], y - HC[1]);
        if (dist <= HR) { out[y * W + x] = 1; continue; }
        const a = Math.atan2(y - HC[1], x - HC[0]), fold = Math.sin(a * 38 + nz.n2(x * 0.01, y * 0.01) * 4) * 0.5 + nz.n2(x * 0.006, y * 0.006) * 0.6;
        out[y * W + x] = 0.78 + fold * 0.11 - Math.min(0.14, (dist - HR) * 0.0007);
      }
      XC.shade = out;
    }
    {
      const img = ctx.createImageData(W, H_), d = img.data, lut = XC.lut, cn = XC.cn, sh = XC.shade, rn = H.rng(7 + Math.floor(t * 12));
      for (let y = 0; y < H_; y++) {
        const fy = y % S, cy = (y / S) | 0;
        for (let x = 0; x < W; x++) {
          const wx = x + cam, fx = wx % S, cx = (wx / S) | 0;
          const v = (lut[fy * S + fx] + cn[(cy * 97 + cx * 13) & 4095] + (rn() - 0.5) * 0.05) * sh[y * W + x];
          const k = (y * W + x) * 4;
          d[k] = 238 * v; d[k + 1] = 230 * v; d[k + 2] = 211 * v; d[k + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      const g = ctx.createRadialGradient(470 + t * 12, 280, 50, 640, 372, 660);
      g.addColorStop(0, 'rgba(255,250,235,0.18)'); g.addColorStop(1, 'rgba(60,40,20,0.12)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H_);
    }

    // ---------- chart: every stitch gets a time ----------
    const cells = []; // [col,row,key,time]
    const block = (pat, c0, r0, map, t0, t1, order = 'row') => {
      const list = [];
      pat.forEach((row, ry) => [...row].forEach((ch, rx) => { const k = map ? map[ch] : ch; if (k && XPAL[k]) list.push([c0 + rx, r0 + ry, k]); }));
      if (order === 'col') list.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      if (order === 'up') list.sort((a, b) => b[1] - a[1] || a[0] - b[0]);
      list.forEach((c, i) => cells.push([...c, t0 + ((t1 - t0) * i) / Math.max(1, list.length)]));
    };
    const text3 = (str, c0, r0, key, t0, t1, scale = 1) => {
      const rows = ['', '', '', '', ''].map(() => '');
      for (const ch of str) { const g = F3[ch] || F3[' ']; for (let i = 0; i < 5; i++) rows[i] += g[i].replace(/1/g, 'x').replace(/0/g, '.') + '.'; }
      const pat = scale === 1 ? rows : rows.flatMap((r) => { const rr = [...r].map((c) => c + c).join(''); return [rr, rr]; });
      block(pat, c0, r0, { x: key }, t0, t1, 'col');
      return (pat[0].length);
    };
    const text7 = (str, c0, r0, key, t0, t1) => {
      const rows = Array(7).fill('');
      for (const ch of str) { const g = F7[ch] || F7[' ']; for (let i = 0; i < 7; i++) rows[i] += g[i].replace(/1/g, 'x').replace(/0/g, '.') + '.'; }
      block(rows, c0, r0, { x: key }, t0, t1, 'col');
    };
    const iconMap = { O: 'O', K: 'K', P: 'P', p: 'p', D: 'D', B: 'B', G: 'G', R: 'R' };

    // BEAT 1: the question
    text7('HOW DOES', 30, 16, 'R', 0.1, 0.85);
    text7('AI LEARN?', 27, 26, 'N', 0.8, 1.6);
    // BEAT 2: labelled examples stack up, model on the right
    const s1 = 100;
    const counterT = Math.floor(t * 6) / 6;
    const n = Math.round(1e6 * Math.pow(H.clamp((counterT - 2.8) / 2.4), 2));
    if (t > 2.2) {
      const w = text3(n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','), s1 + 16, 8, 'Y', 0, 0);
      text3('EXAMPLES', s1 + 18 + w, 8, 'T', 2.2, 2.6);
    }
    const kinds = ['cat', 'dog', 'dog', 'cat', 'cat', 'dog'];
    kinds.forEach((k, i) => {
      const c0 = s1 + 16 + (i % 3) * 13, r0 = 19 + Math.floor(i / 3) * 16, t0 = 2.35 + i * 0.45;
      block(ICON[k], c0, r0, iconMap, t0, t0 + 0.3);
      text3(k.toUpperCase(), c0 + 1, r0 + 9, k === 'cat' ? 'O' : 'D', t0 + 0.28, t0 + 0.4);
    });
    block(ICON.brain, 172, 22, iconMap, 2.0, 2.5);
    text3('MODEL', 170, 34, 'p', 2.5, 2.7);
    // BEAT 3: guess / check / adjust
    block(ICON.cat, 155, 24, iconMap, 6.2, 6.45);
    const dialAng = Math.floor(H.clamp((t - 8.9) / 0.6) * 6) * (t < 9.6 ? 1 : 1);
    [0, 1, 2].forEach((i) => {
      const c0 = 169 + i * 7, r0 = 40;
      block(['.ggg.', 'ggggg', 'ggggg', 'ggggg', '.ggg.'], c0, r0, null, 2.6 + i * 0.05, 2.7 + i * 0.05);
      const ring = [[2, 0], [3, 0.5], [4, 2], [3, 3.5], [2, 4], [1, 3.5], [0, 2], [1, 0.5]];
      const pos = ring[((i * 3 + dialAng * (i % 2 ? 1 : 3)) % 8 + 8) % 8];
      cells.push([c0 + Math.round(pos[0]), r0 + Math.round(pos[1]), 'K', 3.05 + i * 0.05 + (t > 8.9 ? 0 : 0)]);
      cells.push([c0 + 2, r0 + 2, 'K', 3.05]);
    });
    text3('GUESS', 184, 21, 'N', 7.15, 7.35);
    const wrong = t < 9.55;
    text3(wrong ? 'DOG?' : 'CAT', 209, 25, wrong ? 'N' : 'G', wrong ? 7.4 : 9.6, wrong ? 7.65 : 9.8, 1);
    if (wrong) { block(ICON.x, 222, 13, iconMap, 7.9, 8.05); text3('CHECK', 210, 39, 'R', 8.1, 8.3); }
    else block(ICON.check, 222, 13, iconMap, 9.85, 10.0);
    if (t < 9.55) text3('ADJUST', 186, 48, 'R', 8.7, 8.9);
    // BEAT 4: bars stitched from the bottom up, accuracy restitched as it counts
    const s3 = 234, accs = [61, 72, 80, 86, 90, 93, 95, 97];
    let shown = 61;
    accs.forEach((a, i) => {
      const hgt = Math.round(a * 0.22), t0 = 10.75 + i * 0.24, key = i === 7 ? 'R' : i % 2 ? 'T' : 'Y';
      const pat = Array.from({ length: hgt }, () => 'xxxx');
      block(pat, s3 + 22 + i * 6, 36 - hgt, { x: key }, t0, t0 + 0.24, 'up');
      if (t >= t0) shown = H.lerp(i ? accs[i - 1] : 61, a, H.clamp((t - t0) / 0.24));
    });
    if (t > 10.5) {
      text3('ACCURACY', s3 + 18, 6, 'T', 10.5, 10.8);
      text3(Math.round(Math.floor(shown * 2) / 2) + '%', s3 + 56, 3, t > 12.7 ? 'R' : 'N', 0, 0, 2);
      text3('ROUNDS', s3 + 40, 38, 'g', 10.8, 11.0);
    }
    // BEAT 5: takeaway
    text3('MORE EXAMPLES >', s3 + 22, 45, 'N', 13.0, 13.5);
    text3('BETTER GUESSES', s3 + 24, 51, 'R', 13.4, 13.9);

    // ---------- draw stitches (only what the hoop shows) ----------
    const rs = H.rng(77);
    let latest = null, lt = -1;
    cells.forEach(([c, r, key, tm]) => {
      const v = (c * 7 + r * 13) % 5, jx = ((c * 31 + r * 17) % 7) / 14 - 0.25, jy = ((c * 13 + r * 29) % 7) / 14 - 0.25;
      if (t < tm) return;
      const x = c * S - cam, y = r * S;
      if (x < -20 || x > W + 20 || Math.hypot(x + 6 - HC[0], y + 6 - HC[1]) > HR - 6) return;
      const half = t - tm < 0.06;
      ctx.drawImage(xSprite(key, v, half), x - 4 + jx, y - 4 + jy);
      if (tm > lt && tm > 0) { lt = tm; latest = [x + 12, y + 12, key]; }
    });
    void rs;
    // ---------- backstitch arrows / outlines (one stitch per cell edge, revealed in order) ----------
    // two-strand floss backstitch: each stitch runs hole to hole, inset so the aida hole shows between stitches
    const BSC = XC.bsc || (XC.bsc = {});
    const bsCols = (col, metal) => BSC[col + metal] || (BSC[col + metal] = (() => {
      const rgb = H.hex(col);
      return { dk: H.rgba(H.mix(rgb, [0, 0, 0], metal ? 0.45 : 0.4)), md: H.rgba(rgb), hi: metal ? 'rgba(255,243,192,0.95)' : H.rgba(H.mix(rgb, [255, 255, 255], 0.55), 0.8), tw: metal ? 'rgba(120,80,10,0.35)' : 'rgba(0,0,0,0.22)' };
    })());
    const bsSeg = (x0, y0, x1, y1, col, metal = false) => {
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 4) return;
      const ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux, ins = 2.0;
      const ax = x0 + ux * ins, ay = y0 + uy * ins, bx = x1 - ux * ins, by = y1 - uy * ins;
      const cs = bsCols(col, metal), h = ((Math.round(x0 + cam) * 7 + Math.round(y0) * 13) % 9) / 9;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(20,10,5,0.3)'; ctx.lineWidth = 3.6;
      ctx.beginPath(); ctx.moveTo(ax + 0.8, ay + 1.3); ctx.lineTo(bx + 0.8, by + 1.3); ctx.stroke();
      // strand bodies: dark 1px edges, then the floss colour
      for (const [w, st] of [[3.1, cs.dk], [2.1, cs.md]]) {
        ctx.strokeStyle = st; ctx.lineWidth = w; ctx.beginPath();
        for (const sg of [-1, 1]) { const ox = nx * sg * 0.8, oy = ny * sg * 0.8; ctx.moveTo(ax + ox, ay + oy); ctx.lineTo(bx + ox, by + oy); }
        ctx.stroke();
      }
      // twist: the two strands wrap round each other in short diagonal ridges
      ctx.strokeStyle = cs.tw; ctx.lineWidth = 0.7; ctx.beginPath();
      for (let k = 1.6 + h * 1.6; k < len - 2 * ins - 0.8; k += 2.6) { const px = ax + ux * k, py = ay + uy * k; ctx.moveTo(px - nx * 1.3 - ux * 0.7, py - ny * 1.3 - uy * 0.7); ctx.lineTo(px + nx * 1.3 + ux * 0.7, py + ny * 1.3 + uy * 0.7); }
      ctx.stroke();
      // sheen along the lit strand (gold floss: broken twist highlights)
      ctx.strokeStyle = cs.hi; ctx.lineWidth = 0.75;
      if (metal) ctx.setLineDash([3, 4]), (ctx.lineDashOffset = -h * 7);
      ctx.beginPath(); ctx.moveTo(ax - nx * 1.0 + ux * 0.6, ay - ny * 1.0 + uy * 0.6); ctx.lineTo(bx - nx * 1.0 - ux * 0.6, by - ny * 1.0 - uy * 0.6); ctx.stroke();
      if (metal) ctx.setLineDash([]), (ctx.lineDashOffset = 0);
    };
    const bsPath = (pts, col, t0, t1) => { // pts in cell-corner units
      const steps = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n2 = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
        for (let k = 0; k < n2; k++) steps.push([ax + ((bx - ax) * k) / n2, ay + ((by - ay) * k) / n2, ax + ((bx - ax) * (k + 1)) / n2, ay + ((by - ay) * (k + 1)) / n2]);
      }
      const shown2 = Math.floor(steps.length * H.clamp((t - t0) / (t1 - t0)));
      for (let i = 0; i < shown2; i++) { const [a, b, c, d] = steps[i]; bsSeg(a * S - cam, b * S, c * S - cam, d * S, col); }
      if (shown2 > 0 && t < t1 + 0.05) { const [, , c, d] = steps[shown2 - 1]; latest = [c * S - cam, d * S, 'K']; lt = 99; }
    };
    const arrowPts = (x0, y0, x1, y1) => [[x0, y0], [x1, y1]];
    ctx.save(); ctx.beginPath(); ctx.arc(HC[0], HC[1], HR - 6, 0, TAU); ctx.clip();
    // flow arrow into the model
    bsPath(arrowPts(s1 + 53, 37, 171, 33), '#3d3548', 3.6, 4.2);
    bsPath([[168, 32], [171, 33], [169, 36]], '#3d3548', 4.2, 4.35);
    // loop arrows
    bsPath(arrowPts(165, 27, 171, 27), '#3d3548', 6.5, 6.8); bsPath([[169, 25], [171, 27], [169, 29]], '#3d3548', 6.8, 6.9);
    bsPath(arrowPts(185, 28, 203, 28), '#3d3548', 6.95, 7.2); bsPath([[201, 26], [203, 28], [201, 30]], '#3d3548', 7.2, 7.3);
    bsPath([[204, 20], [228, 20], [228, 34], [212, 34], [208, 37], [209, 34], [204, 34], [204, 20]], '#2e3760', 7.3, 7.6);
    if (wrong) {
      // emphasis: red running-stitch ring around the wrong guess
      const ringN = 30, rp = Math.floor(ringN * H.clamp((t - 7.85) / 0.45));
      for (let i = 0; i < rp; i += 2) {
        const a0 = (i / ringN) * TAU - 2, a1 = ((i + 1) / ringN) * TAU - 2;
        bsSeg(216 * S - cam + Math.cos(a0) * 215, 26 * S + Math.sin(a0) * 135, 216 * S - cam + Math.cos(a1) * 215, 26 * S + Math.sin(a1) * 135, '#c43a46');
      }
      bsPath([[204, 34], [204, 46], [190, 46]], '#c43a46', 8.35, 8.75);
      bsPath([[192, 44], [190, 46], [192, 48]], '#c43a46', 8.75, 8.85);
    }
    // chart axes
    bsPath([[s3 + 20, 12], [s3 + 20, 36], [s3 + 72, 36]], '#3d3548', 10.6, 10.9);
    if (t > 12.7) { // emphasis rays around 97%
      const k = Math.min(8, Math.floor((t - 12.7) * 24));
      for (let i = 0; i < k; i++) { const a = (i / 8) * TAU, cx = (s3 + 68) * S - cam, cy = 9 * S; const p0 = [cx + Math.cos(a) * 172, cy + Math.sin(a) * 74], p1 = [cx + Math.cos(a) * 200, cy + Math.sin(a) * 92], ns = Math.max(1, Math.round(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 11)); for (let j = 0; j < ns; j++) bsSeg(H.lerp(p0[0], p1[0], j / ns), H.lerp(p0[1], p1[1], j / ns), H.lerp(p0[0], p1[0], (j + 1) / ns), H.lerp(p0[1], p1[1], (j + 1) / ns), '#f2c14e', true); }
    }
    ctx.restore();

    // ---------- needle + floss at the newest stitch ----------
    if (latest) {
      const [lx, ly, key] = latest, nx0 = lx + 64, ny0 = ly + 30, ang = -0.5;
      ctx.lineCap = 'round';
      const fp = () => { ctx.beginPath(); ctx.moveTo(lx, ly); ctx.bezierCurveTo(lx + 36, ly + 60, nx0 + 36, ny0 + 70, nx0 + Math.cos(ang) * 64, ny0 + Math.sin(ang) * 64); };
      ctx.strokeStyle = 'rgba(30,15,5,0.25)'; ctx.lineWidth = 4; ctx.save(); ctx.translate(1.5, 3); fp(); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = XPAL[key] || '#c43a46'; ctx.lineWidth = 2.6; fp(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,235,225,0.35)'; ctx.lineWidth = 0.8; ctx.setLineDash([1.2, 2.2]); fp(); ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.translate(nx0, ny0); ctx.rotate(ang);
      ctx.fillStyle = 'rgba(30,20,10,0.3)'; ctx.beginPath(); ctx.ellipse(36, 6, 40, 3.2, 0, 0, TAU); ctx.fill();
      const ng = ctx.createLinearGradient(0, -3, 0, 3); ng.addColorStop(0, '#f4f6f8'); ng.addColorStop(0.35, '#b9c0c8'); ng.addColorStop(0.7, '#6f7780'); ng.addColorStop(1, '#a9b1ba');
      ctx.fillStyle = ng; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, -2.4); ctx.lineTo(70, -2.6); ctx.quadraticCurveTo(76, 0, 70, 2.6); ctx.lineTo(10, 2.4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e9e1cf'; ctx.beginPath(); ctx.ellipse(64, 0, 4.2, 1.1, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }

    // ---------- hoop (cached overlay) ----------
    ctx.drawImage(XC.hoop || (XC.hoop = (() => {
      const C = H.layer(W, H_), c = C.getContext('2d');
      c.save(); c.beginPath(); c.arc(HC[0], HC[1], HR, 0, TAU); c.clip();
      c.shadowColor = 'rgba(40,25,10,0.5)'; c.shadowBlur = 22; c.shadowOffsetX = 6; c.shadowOffsetY = 10;
      c.lineWidth = 40; c.strokeStyle = '#000'; c.beginPath(); c.arc(HC[0], HC[1], HR + 20, 0, TAU); c.stroke(); c.restore();
      c.save(); c.shadowColor = 'rgba(40,25,10,0.45)'; c.shadowBlur = 18; c.shadowOffsetX = 5; c.shadowOffsetY = 9;
      c.lineWidth = HW; c.strokeStyle = '#c99d66'; c.beginPath(); c.arc(HC[0], HC[1], HR + HW / 2, 0, TAU); c.stroke(); c.restore();
      const g = c.createRadialGradient(HC[0], HC[1], HR, HC[0], HC[1], HR + HW);
      [[0, '#a8794a'], [0.15, '#d9b07a'], [0.45, '#ecc994'], [0.8, '#d2a46c'], [1, '#9b6b3e']].forEach(([p, col]) => g.addColorStop(p, col));
      c.fillStyle = g; c.beginPath(); c.arc(HC[0], HC[1], HR + HW, 0, TAU); c.arc(HC[0], HC[1], HR, 0, TAU, true); c.fill('evenodd');
      const gr = H.rng(303);
      c.save(); c.beginPath(); c.arc(HC[0], HC[1], HR + HW, 0, TAU); c.arc(HC[0], HC[1], HR, 0, TAU, true); c.clip('evenodd');
      for (let i = 0; i < 70; i++) {
        const rr = HR + 2 + gr() * (HW - 4), a0 = gr() * TAU, al = gr.range(0.2, 1.4);
        c.strokeStyle = gr() < 0.7 ? `rgba(120,70,30,${gr.range(0.12, 0.3)})` : `rgba(255,235,200,${gr.range(0.15, 0.3)})`; c.lineWidth = gr.range(0.5, 1.6);
        c.beginPath(); for (let k = 0; k <= 30; k++) { const a = a0 + (al * k) / 30, w = Math.sin(a * 9 + i) * 1.2; const px = HC[0] + Math.cos(a) * (rr + w), py = HC[1] + Math.sin(a) * (rr + w); k ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
      }
      c.restore();
      c.strokeStyle = 'rgba(255,240,210,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.arc(HC[0], HC[1], HR + HW - 1, Math.PI * 0.95, Math.PI * 1.75); c.stroke();
      c.strokeStyle = 'rgba(90,55,25,0.7)'; c.lineWidth = 1.5; c.beginPath(); c.arc(HC[0], HC[1], HR + 0.5, 0, TAU); c.stroke();
      H.vignette(c, W, H_, 0.35, '50,30,10');
      return C;
    })()), 0, 0);
  };

  registerStyle({
    id: 'cross-stitch',
    name: 'Cross-Stitch Sampler',
    category: 'Paper & Craft',
    description: 'Pixel art worked as real counted cross-stitch on cream aida: every cell is an X of two-strand floss with sheen and twist, top legs all leaning the same way, dark backstitch outlines, all stretched in a wooden hoop.',
    motion: 'The design fills in stitch by stitch in chart order, the needle hopping row to row trailing its floss, while the hoop drifts gently.',
    fonts: [],
    frameT: 5.8,
    duration: 6,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'One long sampler slides through the hoop from motif to motif; everything is stitched cell by cell with the needle chasing the newest stitch, arrows and outlines are backstitch laid one hole at a time, numbers are re-stitched in a 3x5 sampler font, and the wrong guess gets a red running-stitch ring.',
    explainer(ctx, W, H_, t) { EXPLAIN(ctx, W, H_, t); },
    // Sound: a needle and floss through aida held in a wooden hoop. While anything is being stitched, the needle
    // punches through and the floss is drawn after it (one pass about every 0.1 s, never one per cell); backstitch
    // arrows are the same with a darker floss; the cloth slides through the hoop as a soft fabric drag; counters are
    // re-stitched one needle pass per change; the hoop itself is the drum for the big hits; a scissor snip ends it.
    // Windows mirror the block()/text3()/bsPath() times in EXPLAIN() above (cloth slides 1.85-2.35, 5.6-6.2, 10.1-10.8).
    explainerSound(k) {
      const seg = (t, a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
      const camX = (t) => 1200 * seg(t, 1.85, 2.35) + 408 * seg(t, 5.6, 6.2) + 1200 * seg(t, 10.1, 10.8);
      const pan = (col, t) => H.clamp(((col * 12 - camX(t)) / 1280) * 2 - 1, -1, 1) * 0.6;
      let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      // one needle pass: punch through the cloth, then the floss drawn after it
      const pass = (t, g = 1, p = 0, dark = 1, minor = true) => {
        k.noise(t, { dur: 0.02, filter: 'bandpass', f: 950 * dark, q: 1.4, gain: 0.34 * g, a: 0.001, pan: p, minor });
        k.noise(t, { dur: 0.035, color: 'brown', filter: 'lowpass', f: 420, gain: 0.24 * g, a: 0.001, pan: p, minor });
        const pd = 0.06 + rnd() * 0.03;
        k.noise(t + 0.025, { dur: pd, filter: 'bandpass', f: [[0, 1700 * dark], [pd, 1150 * dark]], q: 0.9, gain: 0.2 * g, a: pd * 0.6, pan: p, minor });
      };
      // stitching windows [t0, t1, col, gain, dark]; passes are merged across overlapping windows and thinned
      const W = [
        [0.1, 0.85, 45, 1], [0.8, 1.6, 44, 1], // HOW DOES / AI LEARN?
        [2.0, 2.5, 178, 0.9], [2.2, 2.6, 125, 0.8], [2.5, 2.7, 175, 0.8], [2.6, 2.75, 178, 0.6], // brain, EXAMPLES, MODEL, dials
        ...[0, 1, 2, 3, 4, 5].map((i) => [2.35 + i * 0.45, 2.75 + i * 0.45, 120 + (i % 3) * 13, 0.85]), // examples + labels
        [3.6, 4.35, 160, 0.9, 0.8], // backstitch flow arrow
        [6.2, 6.45, 159, 0.9], [6.5, 6.9, 168, 0.8, 0.8], [6.95, 7.3, 194, 0.8, 0.8], [7.15, 7.35, 190, 0.8], // cat, loop arrows, GUESS
        [7.3, 7.6, 216, 0.8, 0.8], [7.4, 7.65, 214, 0.9], // bubble outline, DOG?
        [8.1, 8.3, 216, 0.8], [8.35, 8.85, 198, 0.9, 0.8], [8.7, 8.9, 194, 0.8], // CHECK, red arrow, ADJUST
        [9.6, 9.8, 214, 0.9], // CAT
        [10.5, 10.8, 263, 0.8], [10.6, 10.9, 270, 0.8, 0.8], [10.8, 11.0, 280, 0.7], // ACCURACY, axes, ROUNDS
        [13.0, 13.5, 265, 1], [13.4, 13.9, 267, 1], // takeaway
      ];
      const passes = [];
      W.forEach(([a, b, col, g, dark = 1]) => { for (let t = a; t < b - 0.02; t += 0.1 + rnd() * 0.025) passes.push([t, col, g, dark]); });
      passes.sort((x, y) => x[0] - y[0]);
      let lastT = -1;
      for (const [t, col, g, dark] of passes) if (t - lastT >= 0.085) { pass(t, g * (0.85 + rnd() * 0.25), pan(col, t), dark, t > 0.15); lastT = t; }

      // cloth slides through the hoop: a soft fabric drag against the wooden ring
      const drag = (t, d, g = 1) => {
        k.noise(t, { dur: d + 0.1, color: 'pink', filter: 'bandpass', f: [[0, 380], [d * 0.5, 800], [d + 0.1, 380]], q: 0.6, gain: 0.13 * g, a: d * 0.45 });
        k.noise(t, { dur: d + 0.1, color: 'brown', filter: 'lowpass', f: 300, gain: 0.09 * g, a: d * 0.5 });
      };
      const hoop = (t, g = 1, p = 0) => { // knock on the taut cloth / wooden hoop
        k.tone(t, { f: [[0, 150], [0.12, 80]], dur: 0.2, gain: 0.35 * g, pan: p });
        k.noise(t, { dur: 0.05, filter: 'bandpass', f: 600, q: 2, gain: 0.25 * g, pan: p });
      };

      k.bed('room', 0, 15, { gain: 0.4 });
      k.music('pad', 0.2, 14.8, { bpm: 60, gain: 0.22, chords: [['F3', 'A3', 'C4', 'E4'], ['D3', 'F3', 'A3', 'C4'], ['Bb2', 'D3', 'F3', 'A3'], ['C3', 'E3', 'G3', 'Bb3']] });
      k.play('tock', 1.62, { f: 260, gain: 0.32 }); // floss pulled snug: the title is finished

      // BEAT 2
      drag(1.85, 0.5, 1);
      { // counter re-stitched on its 6 fps grid (n = 1e6 * ((floor(t*6)/6 - 2.8)/2.4)^2), 1,000,000 at 32/6 s
        for (let f = 17; f < 32; f++) pass(f / 6 + 0.002, 0.5, pan(125, f / 6), 1.25, true);
        hoop(32 / 6, 0.6, pan(125, 32 / 6));
      }

      // BEAT 3
      drag(5.6, 0.6, 0.7);
      // wrong guess (7.85): red X stitched, red running-stitch ring, a hard yank and a knock on the hoop
      k.noise(7.85, { dur: 0.16, filter: 'bandpass', f: [[0, 1800], [0.16, 900]], q: 0.8, gain: 0.3, a: 0.01, pan: 0.5 }); // floss yanked tight
      hoop(7.86, 1.3, 0.45);
      k.tone(7.88, { f: 'D3', type: 'triangle', dur: 0.16, gain: 0.2, filter: 'lowpass', f2: 700 });
      k.tone(8.04, { f: 'A2', type: 'triangle', dur: 0.32, gain: 0.22, filter: 'lowpass', f2: 600 });
      for (let i = 1; i < 6; i++) pass(7.9 + i * 0.075, 0.7, 0.5, 1.1); // X cells + ring dashes
      for (let j = 1; j <= 6; j++) k.play('tock', 8.9 + j * 0.1, { f: 380, gain: 0.3, pan: pan(176, 9.2), minor: true }); // dial pointer jumps a cell
      // correction: the green tick is stitched (9.85)
      pass(9.85, 1.1, pan(224, 9.9), 1, false);
      k.play('success', 9.86, { f: 'G5', gain: 0.6, pan: pan(224, 9.9) });
      pass(9.95, 0.7, pan(224, 10));

      // BEAT 4: bars stitched bottom-up while the % is re-stitched: one pass per shown change, at most 10/s
      drag(10.1, 0.7, 1);
      {
        const accs = [61, 72, 80, 86, 90, 93, 95, 97];
        let last = -1, lt = -1;
        for (let t = 10.76; t < 12.7; t += 1 / 120) {
          const i = Math.min(7, Math.floor((t - 10.75) / 0.24)), t0 = 10.75 + i * 0.24;
          const v = Math.round(Math.floor(H.lerp(i ? accs[i - 1] : 61, accs[i], H.clamp((t - t0) / 0.24)) * 2) / 2);
          if (v !== last && t - lt >= 0.1) { pass(t, 0.8, pan(256 + i * 6, t), 0.9 + (v - 61) * 0.006); last = v; lt = t; }
        }
      }
      // 97% (12.7): turns red and gold rays are backstitched round it: the hoop thumps like a drum (biggest hit)
      k.play('impact', 12.7, { gain: 1.2, pan: 0.35 });
      hoop(12.7, 1.2, 0.35);
      k.play('ding', 12.7, { f: 'E5', gain: 0.6, pan: 0.3 });
      for (let i = 1; i < 4; i++) pass(12.7 + i * 0.09, 0.55, 0.35, 0.8);

      // BEAT 5: takeaway stitched (passes above), the thread is snipped, and it resolves
      k.noise(13.92, { dur: 0.025, filter: 'bandpass', f: 2300, q: 2, gain: 0.3, a: 0.001, pan: 0.3 });
      k.noise(13.96, { dur: 0.035, filter: 'bandpass', f: 1800, q: 1.6, gain: 0.32, a: 0.001, pan: 0.3 });
      ['C4', 'G4', 'E5'].forEach((f, i) => k.play('ding', 14.0 + i * 0.09, { f, gain: 0.46 - i * 0.04, pan: (i - 1) * 0.25 }));
    },
    draw(ctx, W, H_, t) {
      const S = 12, COLS = Math.ceil(W / S), ROWS = Math.ceil(H_ / S);
      const r = H.rng(2024), nz = H.makeNoise(11);
      const HC = [640, 372], HR = 548, HW = 30; // hoop

      // ---------- aida cloth (per-pixel, LUT for one cell) ----------
      const lut = new Float32Array(S * S);
      for (let fy = 0; fy < S; fy++) for (let fx = 0; fx < S; fx++) {
        const dx = Math.min(fx + 0.5, S - fx - 0.5), dy = Math.min(fy + 0.5, S - fy - 0.5);
        const hole = Math.exp(-(dx * dx + dy * dy) / 1.9);
        const groove = Math.exp((-dx * dx) / 0.9) * 0.5 + Math.exp((-dy * dy) / 0.9) * 0.5;
        const sx = fx < S / 2 ? 0 : 1, sy = fy < S / 2 ? 0 : 1, horiz = (sx + sy) % 2 === 0;
        const ph = horiz ? fy : fx, along = horiz ? fx : fy;
        const stripe = Math.cos((ph * TAU) / 3) * 0.5 + Math.cos((along * TAU) / 6 + ph) * 0.15;
        lut[fy * S + fx] = 1 - hole * 0.42 - groove * 0.13 + stripe * 0.06;
      }
      const img = ctx.createImageData(W, H_), d = img.data;
      const cellN = new Float32Array(COLS * ROWS);
      for (let i = 0; i < cellN.length; i++) cellN[i] = r.gauss() * 0.018;
      const base = [238, 230, 211];
      for (let y = 0; y < H_; y++) {
        const fy = y % S, cy = (y / S) | 0;
        for (let x = 0; x < W; x++) {
          const fx = x % S, cx = (x / S) | 0;
          const dist = Math.hypot(x - HC[0], y - HC[1]);
          let v = lut[fy * S + fx] + cellN[cy * COLS + cx] + (r() - 0.5) * 0.05;
          if (dist > HR) {
            // loose fabric outside the hoop: puckered, shaded folds
            const a = Math.atan2(y - HC[1], x - HC[0]);
            const fold = Math.sin(a * 38 + nz.n2(x * 0.01, y * 0.01) * 4) * 0.5 + nz.n2(x * 0.006, y * 0.006) * 0.6;
            v *= 0.78 + fold * 0.11 - Math.min(0.14, (dist - HR) * 0.0007);
          }
          const k = (y * W + x) * 4;
          d[k] = base[0] * v; d[k + 1] = base[1] * v; d[k + 2] = base[2] * v; d[k + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      // soft light falloff on the cloth
      {
        const g = ctx.createRadialGradient(470 + t * 30, 280, 50, 640, 372, 660);
        g.addColorStop(0, 'rgba(255,250,235,0.18)'); g.addColorStop(1, 'rgba(60,40,20,0.12)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H_);
      }

      // ---------- chart (pattern grid) ----------
      const grid = new Map(); // key col,row -> colour key
      const grpOf = new Map();
      let GRP = 0;
      const put = (c, rr, k) => { grid.set(c + ',' + rr, k); grpOf.set(c + ',' + rr, GRP); };
      const PAL = {
        R: '#c43a46', r: '#8f2335', N: '#2e3760', T: '#5fb3a9', t: '#3f8c86', l: '#9fd8cc', G: '#7fd36b', Y: '#f2c14e',
        S: '#495b8f', W: '#dfe3e8', K: '#2a2433', P: '#e98aa0', O: '#ef8a3c', g: '#4f9a52',
      };
      // title
      const title = 'HELLO, WORLD';
      let tw = 0;
      for (const ch of title) tw += FONT[ch][0].length + 1;
      tw -= 1;
      let cx = Math.round(COLS / 2 - tw / 2), ty = 8;
      for (let i = 0; i < title.length; i++) {
        const gl = FONT[title[i]], col = i < 6 ? 'R' : 'N';
        gl.forEach((row, ry) => [...row].forEach((b, rx) => { if (b === '1') put(cx + rx, ty + ry, col); }));
        cx += gl[0].length + 1;
      }
      // sampler border under title (alternating diamonds)
      GRP = 1;
      for (let c = 22; c <= COLS - 23; c++) {
        const m = (c - 22) % 6;
        if (m === 0 || m === 2) put(c, 18, 'Y'); else if (m === 1) { put(c, 17, 'g'); put(c, 19, 'g'); put(c, 18, 'R'); }
      }
      // computer
      GRP = 2;
      const C0 = Math.round(COLS / 2 - 13), R0 = 22;
      const comp = new Set();
      const cput = (c, rr, k) => { put(C0 + c, R0 + rr, k); comp.add(C0 + c + ',' + (R0 + rr)); };
      for (let rr = 0; rr < 18; rr++) for (let c = 1; c < 25; c++) {
        if ((rr === 0 || rr === 17) && (c === 1 || c === 24)) continue;
        const shade = c >= 23 || rr >= 16 ? 't' : rr === 0 || c === 1 ? 'l' : 'T';
        cput(c, rr, shade);
      }
      for (let rr = 2; rr < 13; rr++) for (let c = 4; c < 21; c++) cput(c, rr, 'N');
      cput(5, 3, 'S'); cput(6, 3, 'S'); cput(5, 4, 'S');
      // friendly face on screen
      [[9, 5], [9, 6], [16, 5], [16, 6]].forEach(([c, rr]) => cput(c, rr, 'G'));
      [[8, 9], [9, 10], [10, 10], [11, 10], [12, 10], [13, 10], [14, 10], [15, 10], [16, 10], [17, 9]].forEach(([c, rr]) => cput(c, rr, 'G'));
      [[7, 8], [18, 8]].forEach(([c, rr]) => cput(c, rr, 'P'));
      cput(5, 15, 'R');
      for (let c = 14; c < 21; c++) cput(c, 15, 'K');
      for (let rr = 18; rr < 20; rr++) for (let c = 10; c < 16; c++) cput(c, rr, rr === 18 ? 't' : 'T');
      for (let rr = 20; rr < 25; rr++) for (let c = -1; c < 27; c++) {
        if ((rr === 20 || rr === 24) && (c === -1 || c === 26)) continue;
        let k = rr === 24 || c === 26 ? 't' : 'T';
        if ((rr === 21 || rr === 23) && c > 0 && c < 25 && c % 2 === 1) k = 'W';
        if (rr === 22 && c > 3 && c < 22) k = c % 2 ? 'W' : 'T';
        cput(c, rr, k);
      }
      // hearts + flowers flanking
      GRP = 3;
      const motif = (pat, c0, r0, map) => pat.forEach((row, ry) => [...row].forEach((b, rx) => { if (b !== '0') put(c0 + rx, r0 + ry, map[b]); }));
      motif(HEART, C0 - 13, R0 + 5, { 1: 'R' });
      motif(HEART, C0 + 32, R0 + 5, { 1: 'R' });
      motif(FLOWER, C0 - 12, R0 + 15, { 1: 'P', 2: 'Y' });
      motif(FLOWER, C0 + 33, R0 + 15, { 1: 'O', 2: 'Y' });
      [[C0 - 10, R0 + 20], [C0 - 10, R0 + 21], [C0 + 35, R0 + 20], [C0 + 35, R0 + 21]].forEach(([c, rr]) => put(c, rr, 'g'));
      put(C0 - 11, R0 + 21, 'g'); put(C0 + 36, R0 + 21, 'g');
      // bottom border (work in progress: last stretch unstitched)
      GRP = 4;
      const bRow = 51, bStart = 26, bEnd = COLS - 27;
      const done = t < 3.9 ? bStart - 1 : Math.floor(H.lerp(bStart, bEnd, 0.86 * H.clamp((t - 3.9) / 2.1)));
      for (let c = bStart; c <= Math.min(done, bEnd); c++) {
        const m = (c - bStart) % 6;
        if (m === 0 || m === 2) put(c, bRow, 'Y'); else if (m === 1) { put(c, bRow - 1, 'g'); put(c, bRow + 1, 'g'); put(c, bRow, 'R'); }
      }

      // ---------- stitch sprites: 2-strand floss X with sheen & twist ----------
      const PADS = 4, SP = S + PADS * 2;
      const sprites = {};
      const legPaint = (c, x0, y0, x1, y1, rgb, rr) => {
        const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux;
        // shadow
        c.lineCap = 'round';
        c.strokeStyle = 'rgba(40,25,10,0.32)'; c.lineWidth = 5.8;
        c.beginPath(); c.moveTo(x0 + 0.7, y0 + 1.1); c.lineTo(x1 + 0.7, y1 + 1.1); c.stroke();
        // two strands
        for (let s = -1; s <= 1; s += 2) {
          const ox = nx * s * 1.25, oy = ny * s * 1.25;
          const g = c.createLinearGradient(x0, y0, x1, y1);
          const dk = rgb.map((v) => v * 0.55), md = rgb.map((v) => Math.min(255, v * 1.08)), hi = rgb.map((v) => Math.min(255, v * 1.22 + 18));
          g.addColorStop(0, H.rgba(dk)); g.addColorStop(0.22, H.rgba(md)); g.addColorStop(0.5, H.rgba(s < 0 ? hi : md)); g.addColorStop(0.78, H.rgba(md)); g.addColorStop(1, H.rgba(dk));
          c.strokeStyle = g; c.lineWidth = 2.9;
          c.beginPath(); c.moveTo(x0 + ox, y0 + oy); c.lineTo(x1 + ox, y1 + oy); c.stroke();
          // twist ridges
          c.lineWidth = 0.7;
          for (let k = 2.2 + rr() * 1.5; k < len - 1.5; k += 2.3) {
            const px = x0 + ox + ux * k, py = y0 + oy + uy * k;
            c.strokeStyle = `rgba(255,255,255,${0.12 + rr() * 0.14})`;
            c.beginPath(); c.moveTo(px - nx * 1.3 - ux * 0.8, py - ny * 1.3 - uy * 0.8); c.lineTo(px + nx * 1.3 + ux * 0.8, py + ny * 1.3 + uy * 0.8); c.stroke();
            c.strokeStyle = 'rgba(0,0,0,0.12)';
            c.beginPath(); c.moveTo(px - nx * 1.0 - ux * 0.2, py - ny * 1.0 - uy * 0.2); c.lineTo(px + nx * 1.0 + ux * 1.2, py + ny * 1.0 + uy * 1.2); c.stroke();
          }
        }
      };
      const sprite = (key, v, half) => {
        const id = key + v + (half ? 'h' : '');
        if (sprites[id]) return sprites[id];
        const cv = H.layer(SP, SP), c = cv.getContext('2d'), rr = H.rng(id.charCodeAt(0) * 31 + v * 7);
        const rgb = H.hex(PAL[key]).map((x) => x * (0.96 + rr() * 0.08));
        const a = 1.0, b = S - 1.0;
        legPaint(c, PADS + a, PADS + b, PADS + b, PADS + a, rgb.map((x) => x * 0.9), rr); // under leg: / (darker)
        if (!half) legPaint(c, PADS + a, PADS + a, PADS + b, PADS + b, rgb, rr); // top leg: \  (all the same way)
        sprites[id] = cv;
        return cv;
      };
      // order by appearance (stitched in chart order: rows top->bottom)
      const keys = [...grid.keys()].map((k) => k.split(',').map(Number)).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
      // stitching schedule: Danish method - each row gets a pass of half-stitches (/) then crosses back (\)
      const WIN = [[0.15, 1.5], [1.4, 1.85], [1.75, 3.55], [3.15, 3.95]];
      const tim = new Map();
      WIN.forEach(([w0, w1], g) => {
        const cells = keys.filter(([c, rr]) => grpOf.get(c + ',' + rr) === g);
        const rows = [...new Set(cells.map((k) => k[1]))].sort((a, b) => a - b), rd = (w1 - w0) / rows.length;
        rows.forEach((row, ri) => {
          const rc = cells.filter((k) => k[1] === row).sort((a, b) => a[0] - b[0]), n = rc.length;
          rc.forEach(([c], k) => {
            const r0 = w0 + ri * rd;
            tim.set(c + ',' + row, [r0 + (k / n) * rd * 0.5, r0 + rd * 0.5 + ((n - 1 - k) / n) * rd * 0.5]);
          });
        });
      });
      const rs = H.rng(77);
      let latest = null, latestT = -1;
      keys.forEach(([c, rr]) => {
        const key = grid.get(c + ',' + rr);
        const x = c * S, y = rr * S;
        if (Math.hypot(x + S / 2 - HC[0], y + S / 2 - HC[1]) > HR - 6) return;
        const v = rs.int(0, 4), jx = rs.gauss() * 0.25, jy = rs.gauss() * 0.25;
        const tm = tim.get(c + ',' + rr) || [0, 0];
        if (t < tm[0]) return;
        const full = t >= tm[1];
        ctx.drawImage(sprite(key, v, !full), x - PADS + jx, y - PADS + jy);
        const lt = full ? tm[1] : tm[0];
        if (tim.has(c + ',' + rr) && lt >= latestT) { latestT = lt; latest = [c, rr, key, full]; }
      });

      // ---------- backstitch outline around the computer ----------
      const rb = H.rng(88);
      let bsVis = true;
      const bs = (x0, y0, x1, y1, col) => {
        const rr = rb;
        const j0 = rr.gauss() * 0.3, j1 = rr.gauss() * 0.3, j2 = rr.gauss() * 0.3, j3 = rr.gauss() * 0.3;
        if (!bsVis) return;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(20,10,5,0.35)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0 + 0.6, y0 + 1); ctx.lineTo(x1 + 0.6, y1 + 1); ctx.stroke();
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, '#1b1622'); g.addColorStop(0.5, col); g.addColorStop(1, '#1b1622');
        ctx.strokeStyle = g; ctx.lineWidth = 2.1;
        ctx.beginPath(); ctx.moveTo(x0 + j0, y0 + j1); ctx.lineTo(x1 + j2, y1 + j3); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(x0 * 0.8 + x1 * 0.2 - 0.5, y0 * 0.8 + y1 * 0.2 - 0.5); ctx.lineTo(x0 * 0.4 + x1 * 0.6 - 0.5, y0 * 0.4 + y1 * 0.6 - 0.5); ctx.stroke();
      };
      // backstitch travels around the outline after the cross stitches are done
      const ccx = (C0 + 12.5) * S, ccy = (R0 + 12) * S;
      const bsProg = (x, y, w0, w1) => { const a = (Math.atan2(y - ccy, x - ccx) + Math.PI * 1.5) % TAU; return t >= w0 + (a / TAU) * (w1 - w0); };
      comp.forEach((k) => {
        const [c, rr] = k.split(',').map(Number), x = c * S, y = rr * S;
        bsVis = bsProg(x, y, 3.45, 4.1);
        if (!comp.has(c + ',' + (rr - 1))) bs(x, y, x + S, y, '#3d3548');
        if (!comp.has(c + ',' + (rr + 1))) bs(x, y + S, x + S, y + S, '#3d3548');
        if (!comp.has(c - 1 + ',' + rr)) bs(x, y, x, y + S, '#3d3548');
        if (!comp.has(c + 1 + ',' + rr)) bs(x + S, y, x + S, y + S, '#3d3548');
      });
      // screen bezel backstitch
      {
        const x0 = (C0 + 4) * S, y0 = (R0 + 2) * S, x1 = (C0 + 21) * S, y1 = (R0 + 13) * S;
        for (let x = x0; x < x1; x += S) { bsVis = bsProg(x, y0, 3.7, 4.2); bs(x, y0, x + S, y0, '#2a2433'); bsVis = bsProg(x, y1, 3.7, 4.2); bs(x, y1, x + S, y1, '#2a2433'); }
        for (let y = y0; y < y1; y += S) { bsVis = bsProg(x0, y, 3.7, 4.2); bs(x0, y, x0, y + S, '#2a2433'); bsVis = bsProg(x1, y, 3.7, 4.2); bs(x1, y, x1, y + S, '#2a2433'); }
        bsVis = true;
      }

      // ---------- needle parked in the cloth, floss trailing to the last stitch ----------
      {
        let lx, ly, fcol = '#c43a46';
        if (done >= bStart) { lx = (Math.min(done, bEnd) + 1) * S; ly = bRow * S + S; }
        else if (latest) { lx = (latest[0] + 1) * S; ly = (latest[1] + (latest[3] ? 1 : 0)) * S; fcol = PAL[latest[2]]; }
        else { lx = 380; ly = 90; }
        const nx0 = lx + 70, ny0 = ly + 34, ang = -0.5;
        // floss from last stitch hole to the needle eye (loose, curvy)
        ctx.lineCap = 'round';
        const flossPath = () => { ctx.beginPath(); ctx.moveTo(lx, ly); ctx.bezierCurveTo(lx + 40, ly + 70, nx0 + 40, ny0 + 80, nx0 + Math.cos(ang) * 64, ny0 + Math.sin(ang) * 64); };
        ctx.strokeStyle = 'rgba(30,15,5,0.25)'; ctx.lineWidth = 4; ctx.save(); ctx.translate(1.5, 3); flossPath(); ctx.stroke(); ctx.restore();
        ctx.strokeStyle = fcol; ctx.lineWidth = 2.6; flossPath(); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,220,220,0.35)'; ctx.lineWidth = 0.8; ctx.setLineDash([1.2, 2.2]); flossPath(); ctx.stroke(); ctx.setLineDash([]);
        // needle: tip dives into cloth at nx0,ny0
        ctx.save(); ctx.translate(nx0, ny0); ctx.rotate(ang);
        ctx.fillStyle = 'rgba(30,20,10,0.3)'; ctx.beginPath(); ctx.ellipse(36, 6, 40, 3.2, 0, 0, TAU); ctx.fill();
        const ng = ctx.createLinearGradient(0, -3, 0, 3);
        ng.addColorStop(0, '#f4f6f8'); ng.addColorStop(0.35, '#b9c0c8'); ng.addColorStop(0.7, '#6f7780'); ng.addColorStop(1, '#a9b1ba');
        ctx.fillStyle = ng;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, -2.4); ctx.lineTo(70, -2.6); ctx.quadraticCurveTo(76, 0, 70, 2.6); ctx.lineTo(10, 2.4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e9e1cf'; ctx.beginPath(); ctx.ellipse(64, 0, 4.2, 1.1, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }

      // ---------- wooden hoop ----------
      {
        // inner shadow on taut cloth
        ctx.save();
        ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + 200, 0, TAU); ctx.arc(HC[0], HC[1], HR, 0, TAU, true); ctx.clip('evenodd');
        ctx.restore();
        ctx.save();
        ctx.beginPath(); ctx.arc(HC[0], HC[1], HR, 0, TAU); ctx.clip();
        ctx.shadowColor = 'rgba(40,25,10,0.5)'; ctx.shadowBlur = 22; ctx.shadowOffsetX = 6; ctx.shadowOffsetY = 10;
        ctx.lineWidth = 40; ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + 20, 0, TAU); ctx.stroke();
        ctx.restore();
        // outer cast shadow on loose fabric
        ctx.save(); ctx.shadowColor = 'rgba(40,25,10,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 9;
        ctx.lineWidth = HW; ctx.strokeStyle = '#c99d66'; ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + HW / 2, 0, TAU); ctx.stroke(); ctx.restore();
        // wood body with round profile shading
        const ring = (r0, r1, cols) => {
          const g = ctx.createRadialGradient(HC[0], HC[1], r0, HC[0], HC[1], r1);
          cols.forEach(([p, c]) => g.addColorStop(p, c));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(HC[0], HC[1], r1, 0, TAU); ctx.arc(HC[0], HC[1], r0, 0, TAU, true); ctx.fill('evenodd');
        };
        ring(HR, HR + HW, [[0, '#a8794a'], [0.15, '#d9b07a'], [0.45, '#ecc994'], [0.8, '#d2a46c'], [1, '#9b6b3e']]);
        // grain
        const gr = H.rng(303);
        ctx.save(); ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + HW, 0, TAU); ctx.arc(HC[0], HC[1], HR, 0, TAU, true); ctx.clip('evenodd');
        for (let i = 0; i < 70; i++) {
          const rr = HR + 2 + gr() * (HW - 4), a0 = gr() * TAU, al = gr.range(0.2, 1.4);
          ctx.strokeStyle = gr() < 0.7 ? `rgba(120,70,30,${gr.range(0.12, 0.3)})` : `rgba(255,235,200,${gr.range(0.15, 0.3)})`;
          ctx.lineWidth = gr.range(0.5, 1.6);
          ctx.beginPath();
          for (let k = 0; k <= 30; k++) { const a = a0 + (al * k) / 30, w = Math.sin(a * 9 + i) * 1.2; const px = HC[0] + Math.cos(a) * (rr + w), py = HC[1] + Math.sin(a) * (rr + w); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
          ctx.stroke();
        }
        ctx.restore();
        // lit top edge + inner ring sliver
        ctx.strokeStyle = 'rgba(255,240,210,0.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + HW - 1, Math.PI * 0.95, Math.PI * 1.75); ctx.stroke();
        ctx.strokeStyle = 'rgba(90,55,25,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + 0.5, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(90,55,25,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + HW * 0.42, 0, TAU); ctx.stroke();
      }
      H.vignette(ctx, W, H_, 0.35, '50,30,10');
      H.grain(ctx, W, H_, 0.02, 5 + Math.floor(t * 12));
    },
  });
}
