{
  const COLS = 40, ROWS = 25;
  const PAL = { k: '#000000', r: '#ff0000', g: '#00ff00', y: '#ffff00', b: '#0000ff', m: '#ff00ff', c: '#00ffff', w: '#ffffff' };
  const PKEYS = Object.keys(PAL);
  const PRGB = PKEYS.map((k) => H.hex(PAL[k]));

  function newGrid() {
    const g = [];
    for (let r = 0; r < ROWS; r++) { const row = []; for (let c = 0; c < COLS; c++) row.push({ ch: ' ', fg: 'w', bg: 'k', mos: 0, dh: 0 }); g.push(row); }
    return g;
  }
  // put text: string, starting col, fg/bg; dh = 1 means double height (occupies row and row+1)
  function put(g, row, col, str, fg = 'w', bg = null, dh = 0) {
    for (let i = 0; i < str.length && col + i < COLS; i++) {
      const cell = g[row][col + i];
      cell.ch = str[i]; cell.fg = fg; cell.mos = 0; cell.dh = dh; if (bg) cell.bg = bg;
      if (dh && row + 1 < ROWS) { const b = g[row + 1][col + i]; b.ch = ' '; b.dh = 2; b.mos = 0; if (bg) b.bg = bg; }
    }
  }
  function band(g, row, c0, c1, bg) { for (let c = c0; c <= c1; c++) g[row][c].bg = bg; }

  // Rasterize a canvas drawing into sextant mosaic cells with one foreground colour per cell (like the real thing).
  function mosaic(g, col0, row0, cols, rows, bg, drawFn) {
    const S = 4, sw = cols * 2, sh = rows * 3;
    const L = H.layer(sw * S, sh * S), c = L.getContext('2d', { willReadFrequently: true });
    c.scale(S, S); drawFn(c, sw, sh);
    const d = c.getImageData(0, 0, sw * S, sh * S).data;
    // per-subpixel: dominant palette index (or -1)
    const sub = new Int8Array(sw * sh).fill(-1);
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      const counts = new Array(8).fill(0); let cov = 0;
      for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
        const p = ((y * S + j) * sw * S + (x * S + i)) * 4;
        if (d[p + 3] < 128) continue;
        cov++;
        let best = 0, bd = 1e9;
        for (let k = 0; k < 8; k++) { const q = PRGB[k]; const dd = (q[0] - d[p]) ** 2 + (q[1] - d[p + 1]) ** 2 + (q[2] - d[p + 2]) ** 2; if (dd < bd) { bd = dd; best = k; } }
        counts[best]++;
      }
      if (cov >= S * S * 0.5) { let m = 0; for (let k = 1; k < 8; k++) if (counts[k] > counts[m]) m = k; sub[y * sw + x] = m; }
    }
    for (let r = 0; r < rows; r++) for (let cc = 0; cc < cols; cc++) {
      const counts = new Array(8).fill(0);
      for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) { const v = sub[(r * 3 + j) * sw + cc * 2 + i]; if (v >= 0 && PKEYS[v] !== bg) counts[v]++; }
      let m = -1, mc = 0; for (let k = 0; k < 8; k++) if (counts[k] > mc) { mc = counts[k]; m = k; }
      const cell = g[row0 + r][col0 + cc];
      cell.bg = bg; cell.ch = ' '; cell.dh = 0;
      if (m < 0) { cell.mos = 0; continue; }
      let bits = 0;
      for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) if (sub[(r * 3 + j) * sw + cc * 2 + i] === m) bits |= 1 << (j * 2 + i);
      cell.mos = bits; cell.fg = PKEYS[m];
    }
  }

  function buildPage(t) {
    const g = newGrid();
    // Row 0 header
    const sec = (45 + Math.floor(t)) % 60, mn = 23 + Math.floor((45 + t) / 60);
    const searching = t < 0.9 ? (Math.floor(t * 24) * 37 % 899 + 100).toString(16).toUpperCase().slice(-3) : '100';
    put(g, 0, 0, 'P100', 'w');
    put(g, 0, 6, 'AITEXT ' + searching, t < 0.9 ? 'g' : 'w');
    put(g, 0, 18, 'Thu 09 Oct', 'w');
    put(g, 0, 31, `10:${String(mn).padStart(2, '0')}/${String(sec).padStart(2, '0')}`, 'y');

    // Rows 1-3: blue band with mosaic masthead
    for (let r = 1; r <= 3; r++) band(g, r, 0, 39, 'b');
    mosaic(g, 1, 1, 28, 3, 'b', (c) => {
      const GL = {
        A: ['..XXXX..', '.XXXXXX.', 'XX....XX', 'XX....XX', 'XXXXXXXX', 'XXXXXXXX', 'XX....XX', 'XX....XX', 'XX....XX'],
        I: ['XX', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
        N: ['XX....XX', 'XXX...XX', 'XXXX..XX', 'XXXX..XX', 'XX.XX.XX', 'XX..XXXX', 'XX..XXXX', 'XX...XXX', 'XX....XX'],
        E: ['XXXXXXX', 'XXXXXXX', 'XX.....', 'XX.....', 'XXXXXX.', 'XXXXXX.', 'XX.....', 'XXXXXXX', 'XXXXXXX'],
        W: ['XX......XX', 'XX......XX', 'XX......XX', 'XX..XX..XX', 'XX..XX..XX', 'XX.XXXX.XX', 'XXXX..XXXX', 'XXX....XXX', 'XX......XX'],
        S: ['.XXXXXX', 'XXXXXXX', 'XX.....', 'XXXXXX.', '.XXXXXX', '.....XX', '.....XX', 'XXXXXXX', 'XXXXXX.'],
      };
      let x = 0;
      for (const ch of 'AI NEWS') {
        if (ch === ' ') { x += 4; continue; }
        const gl = GL[ch];
        c.fillStyle = PAL.y;
        gl.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === 'X') c.fillRect(x + i, j, 1, 1); });
        x += gl[0].length + 2;
      }
    });
    // red box on the right of the masthead
    for (let r = 1; r <= 3; r++) band(g, r, 30, 39, 'r');
    put(g, 1, 31, 'TOP', 'w', 'r', 0);
    put(g, 2, 31, 'STORIES', 'y', 'r', 1);

    // Double-height headline
    put(g, 5, 1, 'AI LEARNS TO DREAM', 'y', null, 1);
    // body (cyan / white)
    const body = ['Researchers say the new', 'model now writes poems,', 'plans holidays and', 'tells jokes nobody', 'laughs at.'];
    body.forEach((l, i) => put(g, 8 + i, 1, l, i < 2 ? 'w' : 'w'));
    put(g, 14, 1, 'Experts urge calm', 'c');
    put(g, 14, 21, '102', 'w');

    // robot illustration (mosaic) on the right
    mosaic(g, 25, 5, 14, 12, 'k', (c) => {
      const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
      // antenna
      R(13, 2, 2, 5, PAL.w); c.fillStyle = PAL.r; c.beginPath(); c.arc(14, 2.2, 2.2, 0, 7); c.fill();
      // head
      c.fillStyle = PAL.w; c.beginPath(); c.roundRect(4, 7, 20, 16, 3); c.fill();
      // ears
      R(1, 11, 3, 7, PAL.m); R(24, 11, 3, 7, PAL.m);
      // eyes
      R(8, 11, 4, 4, PAL.c); R(16, 11, 4, 4, PAL.c);
      // mouth
      R(8, 18, 12, 2, PAL.r);
      // neck
      R(11, 23, 6, 3, PAL.c);
      // body
      c.fillStyle = PAL.g; c.beginPath(); c.roundRect(2, 26, 24, 10, 3); c.fill();
      R(10, 28, 8, 5, PAL.y);
    });

    // robot eyes use the teletext Flash attribute
    for (let r = 8; r <= 9; r++) for (let cc = 25; cc < 39; cc++) if (g[r][cc].mos && g[r][cc].fg === 'c') g[r][cc].flash = true;

    // Index list with page numbers
    const idx = [['Chip demand soars', '104'], ['Robots join union', '105'], ['Cloud forecast', '106'], ['Quiz: human or bot?', '107']];
    idx.forEach(([a, n], i) => { put(g, 17 + i, 1, a, 'c'); put(g, 17 + i, 21, n, 'w'); });
    // little mosaic bar chart (growth) at right, bars separated by a spacing column
    const bars = [3, 5, 4, 7, 9];
    const bc = ['g', 'g', 'y', 'g', 'y'];
    bars.forEach((hgt, i) => {
      const grow = H.clamp((t - 2.0) * 1.5 - i * 0.14, 0, 1);
      const hh = Math.round(hgt * grow * 1.1);
      for (let k = 0; k < 12; k++) {
        const row = 20 - Math.floor(k / 3), j = 2 - (k % 3);
        if (k < hh) for (let cc = 0; cc < 1; cc++) {
          const cell = g[row][27 + i * 2]; cell.fg = bc[i]; cell.mos |= 3 << (j * 2); cell.ch = ' ';
        }
      }
    });
    put(g, 21, 26, 'GPU INDEX', 'w');

    // Ticker band
    band(g, 22, 0, 39, 'c');
    if (Math.floor(t * 1.5) % 3 !== 2) put(g, 22, 1, 'LATEST', 'r', 'c');
    const tick = '  Talking toaster seeks agent  *  Chatbot passes driving test  *  ';
    const off = Math.floor(t * 6) % tick.length;
    const vis = (tick + tick).substr(off, 31);
    put(g, 22, 8, vis, 'b', 'c');

    // Fastext row
    put(g, 24, 0, 'Headlines', 'r'); put(g, 24, 11, 'Sport', 'g'); put(g, 24, 19, 'Weather', 'y'); put(g, 24, 29, 'AI Index', 'c');
    return g;
  }

  // =====================================================================================
  // EXPLAINER: "How does AI learn?" told as a run of teletext pages (P100 -> P104).
  // Transition = real page change: header searches in green while the old page stays, then the new page
  // overwrites it top-down two rows at a time.
  // =====================================================================================

  // =====================================================================================
  // Shared rendering: SAA5050-style rounded glyphs (cached bitmaps) and the CRT presentation.
  // =====================================================================================
  const TTC = { key: '', glyph: new Map(), mask: null, face: null, scratch: {} };
  const ttCache = (W, H_) => { const k = W + 'x' + H_; if (TTC.key !== k) { TTC.key = k; TTC.glyph = new Map(); TTC.mask = null; TTC.face = null; TTC.scratch = {}; } };
  const scratch = (name, W, H_) => { let L = TTC.scratch[name]; if (!L) L = TTC.scratch[name] = H.layer(W, H_); const c = L.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.clearRect(0, 0, W, H_); return L; };
  // glyph metrics (same fit as before: the VT323 'H' fills 80% of the cell width and 74% of the row height)
  const ttMetrics = (cw, rh) => {
    if (TTC.met) { const m = TTC.met; if (m.cw === cw && m.rh === rh) return m; }
    const c = H.layer(8, 8).getContext('2d'); c.font = '400 33px "VT323"';
    const mH = c.measureText('H'), gw = mH.actualBoundingBoxRight + mH.actualBoundingBoxLeft;
    const sx = (cw * 0.8) / gw;
    return (TTC.met = { cw, rh, sx, gx0: cw * 0.09 + mH.actualBoundingBoxLeft * sx, sy: (rh * 0.74) / mH.actualBoundingBoxAscent });
  };
  // One glyph rasterised once at 2x, blurred and re-thresholded: the even, rounded strokes of the SAA5050's
  // character-rounding instead of the font's lumpy pixel steps. Coloured copies are cached too.
  function glyphImg(ch, fg, dh, dw, cw, rh) {
    const key = ch + '|' + fg + '|' + dh + '|' + dw; let gI = TTC.glyph.get(key); if (gI) return gI;
    const mkey = ch + '|' + dh + '|' + dw; let mI = TTC.glyph.get(mkey);
    if (!mI) {
      const { sx, sy, gx0 } = ttMetrics(cw, rh), SC = 2, wc = dw ? 2 : 1, hc = dh ? 2 : 1;
      const px = Math.ceil(cw * 0.35), py = Math.ceil(rh * 0.55), bw = Math.ceil(cw * wc + px * 2), bh = Math.ceil(rh * hc + py * 2);
      const A = H.layer(bw * SC, bh * SC), a = A.getContext('2d');
      a.scale(SC, SC); a.translate(px + gx0 * wc, py + rh * (dh ? 1.6 : 0.8)); a.scale(sx * wc, sy * hc);
      a.font = '400 33px "VT323"'; a.textBaseline = 'alphabetic'; a.fillStyle = '#fff';
      a.fillText(ch, 0, 0); a.fillText(ch, 1.1 / sx, 0);
      const B = H.layer(bw * SC, bh * SC), b = B.getContext('2d', { willReadFrequently: true });
      b.filter = 'blur(2.4px)'; b.drawImage(A, 0, 0); b.filter = 'none';
      const id = b.getImageData(0, 0, B.width, B.height), d = id.data;
      for (let i = 0; i < d.length; i += 4) { const v = H.clamp((d[i + 3] / 255 - 0.27) / 0.22, 0, 1); d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = Math.round(v * v * (3 - 2 * v) * 255); }
      b.putImageData(id, 0, 0);
      mI = { img: B, px, py, bw, bh }; TTC.glyph.set(mkey, mI);
    }
    const C = H.layer(mI.img.width, mI.img.height), cc = C.getContext('2d');
    cc.drawImage(mI.img, 0, 0); cc.globalCompositeOperation = 'source-in'; cc.fillStyle = PAL[fg]; cc.fillRect(0, 0, C.width, C.height);
    gI = { img: C, px: mI.px, py: mI.py, bw: mI.bw, bh: mI.bh }; TTC.glyph.set(key, gI); return gI;
  }
  function drawGlyph(c, cell, x, y, cw, rh) {
    const gI = glyphImg(cell.ch, cell.fg, cell.dh === 1 ? 1 : 0, cell.dw ? 1 : 0, cw, rh);
    c.drawImage(gI.img, x - gI.px, y - gI.py, gI.bw, gI.bh);
  }
  // Static screen overlays, cached per size:
  //  - shade: one multiply layer = phosphor shadow mask (aperture-grille RGB triads with staggered slot breaks)
  //    x scanlines x vignette x the curved tube's inner edge shadow and darker corners
  //  - glass: a faint diagonal reflection and dome highlight on the tube face
  const rrPath = (f, x, y, w, h, r) => { f.moveTo(x + r, y); f.arcTo(x + w, y, x + w, y + h, r); f.arcTo(x + w, y + h, x, y + h, r); f.arcTo(x, y + h, x, y, r); f.arcTo(x, y, x + w, y, r); f.closePath(); };
  const screenOverlays = (W, H_) => {
    if (TTC.face) return TTC.face;
    const SH = H.layer(W, H_), f = SH.getContext('2d');
    f.fillStyle = '#fff'; f.fillRect(0, 0, W, H_);
    const T = H.layer(6, 6), tc = T.getContext('2d');
    const cols = ['#ff7a7a', '#7aff7a', '#7a7aff'];
    for (let x = 0; x < 6; x++) { tc.fillStyle = cols[x % 3]; tc.fillRect(x, 0, 1, 6); }
    tc.fillStyle = 'rgba(0,0,0,0.35)'; tc.fillRect(0, 2, 3, 1); tc.fillRect(3, 5, 3, 1);
    f.save(); f.globalCompositeOperation = 'multiply'; f.globalAlpha = 0.22; f.fillStyle = f.createPattern(T, 'repeat'); f.fillRect(0, 0, W, H_); f.restore();
    f.fillStyle = 'rgba(0,0,0,0.28)'; for (let y = 0; y < H_; y += 3) f.fillRect(0, y + 2, W, 1);
    H.vignette(f, W, H_, 0.42);
    f.save(); f.beginPath(); f.rect(-200, -200, W + 400, H_ + 400); rrPath(f, 10, 8, W - 20, H_ - 16, 54);
    f.shadowColor = 'rgba(0,0,0,0.85)'; f.shadowBlur = 36; f.fillStyle = '#000'; f.fill('evenodd'); f.restore();
    f.beginPath(); f.rect(-10, -10, W + 20, H_ + 20); rrPath(f, 3, 2, W - 6, H_ - 4, 60); f.fillStyle = '#000'; f.fill('evenodd');
    const GL = H.layer(W, H_), g = GL.getContext('2d');
    const gl = g.createLinearGradient(W * 0.05, 0, W * 0.42, H_ * 0.75);
    gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.42, 'rgba(225,235,255,0.045)'); gl.addColorStop(0.55, 'rgba(225,235,255,0.012)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gl; g.beginPath(); rrPath(g, 10, 8, W - 20, H_ - 16, 54); g.fill();
    const dome = g.createRadialGradient(W * 0.3, H_ * 0.18, 0, W * 0.3, H_ * 0.18, W * 0.45);
    dome.addColorStop(0, 'rgba(210,225,255,0.035)'); dome.addColorStop(1, 'rgba(210,225,255,0)');
    g.fillStyle = dome; g.beginPath(); rrPath(g, 10, 8, W - 20, H_ - 16, 54); g.fill();
    return (TTC.face = { shade: SH, glass: GL });
  };
  // CRT presentation of a rendered page layer L (shared by the still and every explainer page)
  function crtPresent(ctx, W, H_, L, t) {
    const MX = 30, MY = 16, PW = W - MX * 2, PH = H_ - MY * 2; // overscan margin
    const OV = screenOverlays(W, H_);
    // soft-focus picture
    const S = scratch('S', W, H_), sc = S.getContext('2d');
    sc.fillStyle = '#000'; sc.fillRect(0, 0, W, H_);
    sc.filter = 'blur(0.6px)'; sc.drawImage(L, MX, MY, PW, PH); sc.filter = 'none';
    // red gun lands off-convergence: lift the red channel out and put it back 1.4px to the right
    // (real red/cyan colour fringes instead of the old white ghost)
    const Rg = scratch('R', W, H_), rc = Rg.getContext('2d');
    rc.drawImage(S, 0, 0); rc.globalCompositeOperation = 'multiply'; rc.fillStyle = '#ff0000'; rc.fillRect(0, 0, W, H_);
    ctx.drawImage(S, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.drawImage(Rg, 0, 0);
    ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(Rg, 1.4, 0);
    // tube glass: blacks sit slightly above #000
    ctx.fillStyle = 'rgb(9,10,12)'; ctx.fillRect(0, 0, W, H_);
    ctx.restore();
    // phosphor bloom
    const B = scratch('bloom', W / 4, H_ / 4), bc = B.getContext('2d');
    bc.filter = 'blur(3px)'; bc.drawImage(L, MX / 4, MY / 4, PW / 4, PH / 4); bc.filter = 'none';
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.5; ctx.drawImage(B, 0, 0, W, H_); ctx.restore();
    // shadow mask, scanlines, vignette and the tube's edge shadow in one multiply
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(OV.shade, 0, 0); ctx.restore();
    // slow CRT refresh roll
    const ry = ((t * 0.35) % 1) * (H_ + 200) - 100;
    const rg = ctx.createLinearGradient(0, ry - 100, 0, ry + 100);
    rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(0.5, 'rgba(255,255,255,0.035)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, ry - 100, W, 200);
    ctx.drawImage(OV.glass, 0, 0);
    H.grain(ctx, W, H_, 0.035, 5 + Math.floor(t * 25), true);
  }

  function renderTT(ctx, W, H_, g, t) {
    ttCache(W, H_);
    const cw = W / COLS, rh = H_ / ROWS;
    const X = (c) => Math.round(c * cw), Y = (r) => Math.round(r * rh);
    const L = scratch('page', W, H_), c = L.getContext('2d');
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H_);
    const flashOff = Math.floor(t * 3) % 3 === 2;
    for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
      const cell = g[r][col];
      const x0 = X(col), x1 = X(col + 1), y0 = Y(r), y1 = Y(r + 1);
      c.fillStyle = PAL[cell.bg]; c.fillRect(x0, y0, x1 - x0, y1 - y0);
      if (cell.mos && !(cell.flash && flashOff)) {
        c.fillStyle = PAL[cell.fg];
        for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) {
          if (!(cell.mos & (1 << (j * 2 + i)))) continue;
          const sx0 = Math.round(x0 + (i * (x1 - x0)) / 2), sx1 = Math.round(x0 + ((i + 1) * (x1 - x0)) / 2);
          const sy0 = Math.round(r * rh + (j * rh) / 3), sy1 = Math.round(r * rh + ((j + 1) * rh) / 3);
          c.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
        }
      }
    }
    for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
      const cell = g[r][col];
      if (cell.mos || cell.ch === ' ' || cell.dh === 2 || (cell.flash && flashOff)) continue;
      drawGlyph(c, cell, X(col), Y(r), cw, rh);
    }
    crtPresent(ctx, W, H_, L, t);
  }

  // double-size (Level 2.5 style): each character spans 2 columns x 2 rows
  function put2(g, row, col, str, fg = 'w', bg = null) {
    for (let i = 0; i < str.length && col + i * 2 + 1 < COLS; i++) {
      const c0 = col + i * 2;
      for (const [r, c, k] of [[row, c0, 1], [row, c0 + 1, 2], [row + 1, c0, 2], [row + 1, c0 + 1, 2]]) {
        const cell = g[r][c]; cell.mos = 0; if (bg) cell.bg = bg;
        if (k === 1) { cell.ch = str[i]; cell.fg = fg; cell.dh = 1; cell.dw = 1; } else { cell.ch = ' '; cell.dh = 2; cell.dw = 0; }
      }
    }
  }
  const putC = (g, row, str, fg, bg, dh) => put(g, row, Math.max(0, Math.floor((COLS - str.length) / 2)), str, fg, bg, dh);
  const flashCells = (g, r0, r1, c0, c1) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) g[r][c].flash = true; };
  const fmtN = (n) => Math.round(n).toLocaleString('en-US');
  // mosaic pictures (drawn in sub-pixel units: 2 per cell across, 3 per cell down)
  const catPic = (col) => (c, w, h) => {
    c.fillStyle = PAL[col];
    c.beginPath(); c.moveTo(w * 0.14, h * 0.05); c.lineTo(w * 0.42, h * 0.32); c.lineTo(w * 0.1, h * 0.45); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(w * 0.86, h * 0.05); c.lineTo(w * 0.58, h * 0.32); c.lineTo(w * 0.9, h * 0.45); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(w * 0.5, h * 0.58, w * 0.42, h * 0.4, 0, 0, 7); c.fill();
    c.fillStyle = '#000'; c.fillRect(w * 0.27, h * 0.48, w * 0.13, h * 0.14); c.fillRect(w * 0.6, h * 0.48, w * 0.13, h * 0.14);
    c.fillStyle = PAL.r; c.fillRect(w * 0.43, h * 0.68, w * 0.14, h * 0.1);
  };
  const dogPic = (col) => (c, w, h) => {
    c.fillStyle = PAL[col];
    c.beginPath(); c.ellipse(w * 0.5, h * 0.5, w * 0.32, h * 0.44, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(w * 0.14, h * 0.46, w * 0.12, h * 0.34, 0.25, 0, 7); c.fill();
    c.beginPath(); c.ellipse(w * 0.86, h * 0.46, w * 0.12, h * 0.34, -0.25, 0, 7); c.fill();
    c.fillStyle = '#000'; c.fillRect(w * 0.33, h * 0.36, w * 0.11, h * 0.13); c.fillRect(w * 0.56, h * 0.36, w * 0.11, h * 0.13);
    c.fillRect(w * 0.42, h * 0.62, w * 0.16, h * 0.13);
  };
  const robotPic = (c) => {
    const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
    R(11, 0, 2, 4, PAL.w); c.fillStyle = PAL.r; c.beginPath(); c.arc(12, 1.2, 1.8, 0, 7); c.fill();
    c.fillStyle = PAL.w; c.beginPath(); c.roundRect(3, 4, 18, 14, 3); c.fill();
    R(0, 8, 3, 6, PAL.m); R(21, 8, 3, 6, PAL.m);
    R(6, 7, 4, 4, PAL.c); R(14, 7, 4, 4, PAL.c);
    R(7, 13, 10, 2, PAL.r);
  };
  const arrowPic = (col, len, dir = 1) => (c, w, h) => { // horizontal arrow; len 0..1 draws on from the tail
    c.fillStyle = PAL[col];
    const L = w * len;
    if (dir > 0) { c.fillRect(0, h * 0.34, Math.max(0, L - h * 0.6), h * 0.32); if (len > 0.6) { c.beginPath(); c.moveTo(L - h * 0.9, 0); c.lineTo(L, h / 2); c.lineTo(L - h * 0.9, h); c.closePath(); c.fill(); } }
    else { c.fillRect(w - L + h * 0.6, h * 0.34, Math.max(0, L - h * 0.6), h * 0.32); if (len > 0.6) { c.beginPath(); c.moveTo(w - L + h * 0.9, 0); c.lineTo(w - L, h / 2); c.lineTo(w - L + h * 0.9, h); c.closePath(); c.fill(); } }
  };
  const tickPic = (c, w, h) => { c.strokeStyle = PAL.g; c.lineWidth = 2.4; c.lineCap = 'square'; c.beginPath(); c.moveTo(w * 0.1, h * 0.55); c.lineTo(w * 0.4, h * 0.85); c.lineTo(w * 0.9, h * 0.12); c.stroke(); };
  const crossPic = (c, w, h) => { c.strokeStyle = PAL.r; c.lineWidth = 2.6; c.beginPath(); c.moveTo(w * 0.12, h * 0.1); c.lineTo(w * 0.88, h * 0.9); c.moveTo(w * 0.88, h * 0.1); c.lineTo(w * 0.12, h * 0.9); c.stroke(); };

  function exHeader(g, num, t, searching) {
    const sec = (12 + Math.floor(t)) % 60;
    put(g, 0, 0, 'P' + num, 'w');
    const roll = searching ? (Math.floor(t * 24) * 37 % 899 + 100).toString(16).toUpperCase().slice(-3) : num;
    put(g, 0, 6, 'AITEXT ' + roll, searching ? 'g' : 'w');
    put(g, 0, 18, 'Thu 09 Oct', 'w');
    put(g, 0, 31, `10:24/${String(sec).padStart(2, '0')}`, 'y');
  }
  function stepBand(g, step) {
    band(g, 1, 0, 39, 'b');
    put(g, 1, 1, 'HOW DOES AI LEARN?', 'y', 'b');
    put(g, 1, 30, 'STEP ' + step + '/4', 'c', 'b');
  }

  // ---- pages (tl = time since this page was requested) ----
  function page100(g, tl) {
    for (let r = 1; r <= 3; r++) band(g, r, 0, 39, 'b');
    put(g, 2, 2, 'AITEXT  SCIENCE EXPLAINED', 'w', 'b');
    put(g, 6, 3, 'HOW DOES', 'y', null, 1);
    put(g, 9, 3, 'AI LEARN?', 'y', null, 1);
    put(g, 13, 3, 'A guide in four', 'c');
    put(g, 14, 3, 'short pages.', 'c');
    mosaic(g, 26, 5, 12, 12, 'k', (c, w, h) => {
      c.fillStyle = PAL.m; c.lineWidth = 6; c.strokeStyle = PAL.m; c.lineCap = 'butt';
      c.beginPath(); c.arc(w / 2, h * 0.3, w * 0.28, Math.PI * 1.05, Math.PI * 2.25); c.stroke();
      c.fillRect(w / 2 - 3, h * 0.42, 6, h * 0.22); c.fillRect(w / 2 - 3, h * 0.78, 6, h * 0.14);
    });
    flashCells(g, 15, 16, 26, 37);
    put(g, 20, 3, 'Page through: 101 102 103 104', 'w');
    put(g, 24, 0, 'Next page', 'r'); put(g, 24, 13, 'Index', 'g'); put(g, 24, 22, 'Quiz', 'y'); put(g, 24, 31, 'Science', 'c');
  }
  function page101(g, tl) {
    stepBand(g, 1);
    put(g, 3, 1, 'TRAINING DATA', 'c', null, 1);
    put(g, 3, 24, 'LABELLED', 'w', null, 1);
    // four labelled examples appear one by one
    const ex = [[1, 6, 'cat', 'y'], [9, 6, 'dog', 'w'], [1, 13, 'dog', 'w'], [9, 13, 'cat', 'y']];
    ex.forEach(([c0, r0, lab, col], i) => {
      if (tl < 0.25 + i * 0.22) return;
      mosaic(g, c0, r0, 6, 5, 'k', (lab === 'cat' ? catPic : dogPic)(col));
      put(g, r0 + 5, c0 + 1, ' ' + lab + ' ', 'b', lab === 'cat' ? 'y' : 'c'); // label tag under its picture
    });
    // arrow draws on, then examples stream along it into the model
    const al = H.clamp((tl - 1.0) / 0.5);
    if (al > 0) mosaic(g, 16, 10, 10, 3, 'k', arrowPic('w', Math.ceil(al * 10) / 10));
    put(g, 9, 16, 'feed in', 'w');
    mosaic(g, 27, 6, 12, 7, 'k', robotPic);
    put(g, 13, 29, 'THE MODEL', 'g');
    if (tl > 1.5) {
      const ph = ((tl - 1.5) / 0.45) % 1, k = Math.floor((tl - 1.5) / 0.45);
      const col = 16 + Math.floor(ph * 8);
      mosaic(g, col, 14, 3, 2, 'k', (k % 2 ? dogPic : catPic)(k % 2 ? 'w' : 'y'));
      put(g, 16, col, k % 2 ? 'dog' : 'cat', k % 2 ? 'w' : 'y');
    }
    // counter
    const n = 1e6 * H.ease.inOut(H.clamp((tl - 1.4) / 2.0));
    if (tl > 1.3) { put2(g, 20, 0, fmtN(n).padStart(9, ' '), 'y'); put(g, 20, 19, ' EXAMPLES', 'w', null, 1); }
    if (tl > 1.3) put(g, 23, 1, 'Every picture comes with its answer.', 'c');
    put(g, 24, 0, 'Back', 'r'); put(g, 24, 13, 'Index', 'g'); put(g, 24, 22, 'Next', 'y'); put(g, 24, 31, 'Science', 'c');
  }
  function page102(g, tl) {
    stepBand(g, 2);
    // the loop strip at the bottom: GUESS -> CHECK -> ADJUST, return arrow
    const step = tl < 0.5 ? -1 : tl < 1.7 ? 0 : tl < 2.5 ? 1 : tl < 3.6 ? 2 : tl < 4.1 ? 0 : 1;
    const boxes = [['GUESS', 'y', 2], ['CHECK', 'c', 15], ['ADJUST', 'm', 28]];
    boxes.forEach(([lab, col, c0], i) => {
      const act = i === step;
      band(g, 20, c0, c0 + 9, act ? col : 'k'); band(g, 21, c0, c0 + 9, act ? col : 'k');
      put(g, 20, c0 + 1, lab, act ? 'b' : col, act ? col : 'k', 1);
    });
    put(g, 20, 12, '>', 'w', null, 1); put(g, 20, 25, '>', 'w', null, 1);
    mosaic(g, 3, 22, 32, 1, 'k', (c, w, h) => { c.fillStyle = PAL.w; c.fillRect(1, 0, 2, 2); c.fillRect(1, 1, w - 4, 1.2); c.fillRect(w - 3, 0, 2, 2); c.beginPath(); c.moveTo(0, 0); c.lineTo(4, 0); c.lineTo(2, -2); c.fill(); });
    put(g, 23, 12, 'repeat, repeat, repeat', 'w');
    // new picture -> model
    mosaic(g, 1, 4, 8, 6, 'k', catPic('y'));
    put(g, 10, 1, 'NEW PIC', 'c');
    const a1 = H.clamp((tl - 0.3) / 0.4);
    if (a1 > 0) mosaic(g, 9, 6, 5, 2, 'k', arrowPic('w', a1));
    mosaic(g, 14, 4, 12, 7, 'k', robotPic);
    // weights: three mosaic sliders under the robot whose knobs step when adjusting
    const adj = H.clamp((tl - 2.8) / 0.7);
    const knobs = [[0.2, 0.75], [0.7, 0.3], [0.45, 0.85]];
    put(g, 11, 14, 'weights', 'm');
    knobs.forEach(([a, b], i) => {
      const v = H.lerp(a, b, Math.floor(adj * 5) / 5);
      mosaic(g, 14, 12 + i, 12, 1, 'k', (c, w, h) => { c.fillStyle = PAL.b; c.fillRect(0, 1, w, 1); c.fillStyle = adj > 0 && adj < 1 ? PAL.y : PAL.m; c.fillRect(Math.round(v * (w - 3)), 0, 3, 3); });
    });
    // guess area
    const a2 = H.clamp((tl - 0.9) / 0.3);
    if (a2 > 0) mosaic(g, 26, 6, 3, 2, 'k', arrowPic('w', a2));
    if (tl > 1.1 && tl < 3.6) {
      put(g, 4, 30, 'DOG?', 'r', null, 1);
      if (tl > 1.7) { mosaic(g, 35, 4, 4, 3, 'k', crossPic); flashCells(g, 4, 6, 35, 38); band(g, 4, 29, 34, 'w'); band(g, 5, 29, 34, 'w'); }
      if (tl > 1.9) { put(g, 8, 29, 'NO - IT IS', 'c'); put(g, 9, 29, 'A CAT', 'c'); }
    }
    if (tl > 2.5 && tl < 3.6) {
      // error signal travels back from the guess to the weights (right to left), a block per step
      const e = H.clamp((tl - 2.5) / 0.5);
      mosaic(g, 26, 14, 13, 2, 'k', arrowPic('r', Math.ceil(e * 8) / 8, -1));
      put(g, 16, 30, 'error', 'r');
    }
    if (tl >= 3.6) {
      put(g, 4, 30, 'CAT', 'g', null, 1);
      mosaic(g, 35, 4, 4, 3, 'k', tickPic);
      put(g, 8, 29, 'CORRECT!', 'g');
    }
  }
  function page103(g, tl) {
    stepBand(g, 3);
    put(g, 3, 1, 'ACCURACY', 'w', null, 1);
    const pc = Math.round(H.lerp(61, 97, H.ease.inOut(H.clamp((tl - 0.9) / 1.2))));
    const done = tl > 2.15;
    put2(g, 3, 11, ' ' + pc + '% ', done ? 'b' : 'y', done ? 'y' : null);
    if (done) flashCells(g, 3, 4, 11, 20);
    put(g, 3, 23, 'after', 'c'); put(g, 4, 23, 'each round', 'c');
    // bar chart: one bar per training round, stepped in
    const nb = Math.min(12, Math.floor(H.clamp((tl - 0.85) / 1.3) * 12) + (tl > 0.85 ? 1 : 0));
    for (let i = 0; i < nb; i++) {
      const v = H.lerp(61, 97, 1 - Math.pow(1 - i / 11, 2));
      const hh = Math.round(((v - 50) / 50) * 36); // sub-rows (12 rows * 3)
      for (let k = 0; k < hh; k++) {
        const row = 18 - Math.floor(k / 3), j = 2 - (k % 3);
        const cell = g[row][3 + i * 2]; cell.fg = i === nb - 1 ? 'y' : 'g'; cell.mos |= 3 << (j * 2); cell.ch = ' ';
      }
    }
    mosaic(g, 2, 19, 25, 1, 'k', (c, w) => { c.fillStyle = PAL.w; c.fillRect(0, 0, w, 1.2); });
    put(g, 20, 3, 'TRAINING ROUNDS  >>>', 'c');
    if (tl > 0.9) { put(g, 16, 28, '61% at', 'w'); put(g, 17, 28, 'round 1', 'w'); }
    if (done) { put(g, 12, 28, '97% at', 'y'); put(g, 13, 28, 'round 12', 'y'); }
  }
  function page104(g, tl) {
    stepBand(g, 4);
    putC(g, 5, 'THE TAKEAWAY', 'c');
    put(g, 8, 3, 'MORE EXAMPLES', 'w', null, 1);
    mosaic(g, 18, 10, 6, 3, 'k', (c, w, h) => { c.fillStyle = PAL.y; c.fillRect(w * 0.42, 0, w * 0.16, h * 0.55); c.beginPath(); c.moveTo(0, h * 0.45); c.lineTo(w, h * 0.45); c.lineTo(w / 2, h); c.fill(); });
    put(g, 14, 13, 'BETTER GUESSES', 'y', null, 1);
    // rising staircase of blocks
    for (let i = 0; i < 6; i++) { if (tl < 0.4 + i * 0.08) continue; for (let k = 0; k <= i; k++) for (let cc = 0; cc < 4; cc++) { const cell = g[22 - k][3 + i * 6 + cc]; cell.mos = 63; cell.fg = i === 5 ? 'y' : 'g'; } }
    put(g, 24, 0, 'Index', 'r'); put(g, 24, 13, 'Quiz', 'g'); put(g, 24, 22, 'Again', 'y'); put(g, 24, 31, 'Science', 'c');
  }
  const EX_PAGES = [[0, '100', page100], [1.85, '101', page101], [5.55, '102', page102], [10.3, '103', page103], [12.75, '104', page104]];
  function buildEx(i, t) {
    const g = newGrid();
    const [t0, num, fn] = EX_PAGES[i];
    fn(g, t - t0);
    exHeader(g, num, t, false);
    return g;
  }

  // ---- SOUND: a TV set showing teletext. Mains hum + room, a soft library-music pad (like the pages-from-teletext
  // filler music), a remote-control button press on every page request, a quiet seek chatter while the green header
  // counter rolls, a "found" bleep, then a fast stepped data wipe as rows land two at a time. Everything on the page is
  // a soft lowpassed square bleep (a small TV speaker). Times copy EX_PAGES / SEARCH = 0.35 / 22 row-pairs per second.
  function ttSound(k) {
    const END = 14.8, SEARCH = 0.35;
    const P = EX_PAGES.map((p) => p[0]); // [0, 1.85, 5.55, 10.3, 12.75]
    const bleep = (t, f, d = 0.07, g = 1, pan = 0, minor = false) => k.tone(t, { f, type: 'square', dur: d, gain: 0.075 * g, a: 0.002, hold: d * 0.6, filter: 'lowpass', f2: 1800, pan, minor });
    const remote = (t) => { k.noise(t, { dur: 0.02, filter: 'bandpass', f: 1400, q: 1.5, gain: 0.32, a: 0.001 }); k.tone(t, { f: [[0, 190], [0.03, 120]], dur: 0.045, gain: 0.18 }); };
    // row-pair wipe: one soft data click per two rows landing, top to bottom (pitch steps down the page)
    const wipe = (t0) => { for (let i = 0; i < 12; i++) k.noise(t0 + i / 22, { dur: 0.03, filter: 'bandpass', f: 2000 - i * 90, q: 2.5, gain: 0.16 * (1 - i / 20), a: 0.002 }); k.noise(t0, { dur: 0.56, color: 'pink', filter: 'bandpass', f: [[0, 1600], [0.55, 700]], q: 1, gain: 0.035, a: 0.05, hold: 0.4 }); };
    const page = (t0, first) => {
      remote(t0);
      for (let i = 0; i < 4; i++) bleep(t0 + 0.04 + i * 0.075, [330, 294, 370, 262][i], 0.03, 0.55, -0.3, true); // header counter seeks
      bleep(t0 + SEARCH, first ? 'A5' : 'E5', 0.09, 1.3);                                                          // page found
      wipe(t0 + SEARCH);
    };
    const counter = (t0, t1, fn, step, play) => { let last = -1, lastV = fn(t0); for (let t = t0; t <= t1 + 1e-6; t += 1 / 120) { const v = fn(t); if (v - lastV >= step && t - last >= 1 / 12) { play(t, v); last = t; lastV = v; } } };

    // ---- bed + music
    k.bed('hum', 0, END, { gain: 0.4 });
    k.bed('room', 0, END, { gain: 0.3 });
    k.music('pad', 0.4, END, { bpm: 96, gain: 0.32, chords: [['C4', 'E4', 'G4', 'B4'], ['A3', 'C4', 'E4', 'G4'], ['D4', 'F4', 'A4', 'C5'], ['G3', 'B3', 'D4', 'F4']] });

    // ---- P100: title page
    page(P[0], true);
    // ---- P101: training data
    page(P[1]);
    const L1 = P[1];
    bleep(L1 + 0.69, 'C5', 0.06, 0.8, -0.5, true); bleep(L1 + 0.91, 'E5', 0.06, 0.8, -0.3, true);   // last two example pictures appear
    for (let s = 2; s <= 10; s += 2) bleep(L1 + 1.0 + (s / 10) * 0.5 - 0.05, 262 + s * 25, 0.04, 0.6, 0, true); // arrow steps on (10 steps / 0.5 s)
    for (let t = L1 + 1.5; t < P[2] - 0.05; t += 0.45) bleep(t, 'G4', 0.05, 0.6, 0.2, true);       // a picture streams out along the arrow
    counter(L1 + 1.4, L1 + 3.4, (t) => H.ease.inOut(H.clamp((t - L1 - 1.4) / 2.0)), 1 / 30, (t) => bleep(t, 220, 0.025, 0.7, -0.4, true)); // 0 -> 1,000,000
    bleep(L1 + 3.4, 'C5', 0.06, 1, -0.4); bleep(L1 + 3.46, 'G5', 0.12, 1, -0.4);                  // counter lands on 1,000,000

    // ---- P102: guess / check / adjust
    page(P[2]);
    const L2 = P[2];
    bleep(L2 + 1.1, 'A4', 0.08, 1, 0.5); bleep(L2 + 1.18, 'D5', 0.12, 1, 0.5);                    // DOG? (rising, a question)
    // CHECK (tl 1.7): wrong. cross + flash + white band: harsh low two-note buzz
    const WRONG = L2 + 1.7;
    k.tone(WRONG, { f: 'Bb2', type: 'square', dur: 0.16, gain: 0.09, hold: 0.12, filter: 'lowpass', f2: 1300, pan: 0.5 });
    k.tone(WRONG + 0.17, { f: 'E2', type: 'square', dur: 0.32, gain: 0.1, hold: 0.24, filter: 'lowpass', f2: 1100, pan: 0.5 });
    k.play('thud', WRONG, { f: 100, gain: 0.45, pan: 0.5 });
    bleep(L2 + 1.9, 'C5', 0.04, 0.6, 0.5, true);                                                     // "NO - IT IS A CAT"
    // ADJUST (tl 2.5): error arrow steps back right -> left (8 steps over 0.5 s, one bleep per two)
    for (let s = 1; s <= 8; s += 2) bleep(L2 + 2.5 + (s / 8) * 0.5 - 0.06, 523 - s * 35, 0.05, 0.9, 0.6 - s * 0.12);
    for (let s = 1; s <= 5; s++) bleep(L2 + 2.8 + (s / 5) * 0.7 - 0.14, [196, 220, 247, 262, 294][s - 1], 0.05, 0.8, -0.1, true); // weight knobs step (5 levels)
    // GUESS again -> CAT / CORRECT (tl 3.6)
    ['C5', 'E5', 'G5'].forEach((n, i) => bleep(L2 + 3.6 + i * 0.07, n, i === 2 ? 0.25 : 0.07, 1.1, 0.5));
    bleep(L2 + 4.1, 'E4', 0.04, 0.6, 0, true);                                                       // CHECK band moves on

    // ---- P103: accuracy bars step in (one bar per 1.3/12 s from tl 0.85), then 97% flashes (tl 2.15)
    page(P[3]);
    const L3 = P[3];
    for (let i = 1; i < 12; i++) bleep(L3 + 0.85 + (i * 1.3) / 12, 262 * Math.pow(2, (i * 12 / 11) / 12), 0.04, 0.75, -0.5 + i * 0.05, true);
    const BEST = L3 + 2.15 + 1e-3;
    k.play('impact', BEST, { f: 110, gain: 0.8 });
    ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => { bleep(BEST + i * 0.06, n, 0.09, 1.3, -0.2); });
    ['C5', 'E5', 'G5'].forEach((n) => k.tone(BEST + 0.24, { f: n, type: 'square', dur: 0.8, gain: 0.045, a: 0.003, hold: 0.45, filter: 'lowpass', f2: 2000, verb: 0.2 }));
    k.tone(BEST + 0.24, { f: 'C3', type: 'triangle', dur: 0.9, gain: 0.2, hold: 0.4 });
    bleep(13.0, 'G4', 0.05, 0.5, 0, true);                                                            // 97% flashes back on (Flash attribute) just as P104 is being searched

    // ---- P104: takeaway. BETTER GUESSES lands as the wipe passes row 14 (tl 0.67), staircase completes at tl 0.9
    page(P[4]);
    const L4 = P[4];
    const TAKE = L4 + 0.35 + 7 / 22;
    bleep(TAKE, 'B4', 0.08, 0.8); bleep(TAKE + 0.09, 'C5', 0.5, 0.8); bleep(TAKE + 0.09, 'G4', 0.5, 0.5);
    k.tone(TAKE + 0.09, { f: 'C3', type: 'triangle', dur: 1.2, gain: 0.14, hold: 0.3 });
    // (the staircase of blocks is revealed by the wipe itself, rows 17-22 at tl 0.76-0.85, so the wipe clicks cover it)
  }

  registerStyle({
    id: 'teletext',
    name: 'Teletext Page',
    category: 'Retro UI & Neon',
    description: 'A broadcast teletext page: strict 40x25 character grid, eight saturated colours, 2x3 sextant mosaic graphics with one colour per cell, double-height headlines and Fastext links, seen through a CRT.',
    motion: 'Only the header shows while the page counter rolls in green, then the page lands top-down two rows at a time; mosaic bars step up a sub-block at a time, LATEST and the robot eyes flash, the ticker hops whole characters and the clock ticks.',
    fonts: ['400 33px "VT323"', '900 11.2px "Archivo Black"'],
    frameT: 4.8,
    duration: 5,
    readsPixels: true,
    explainerDuration: 14.8,
    explainerNote: 'Each beat is a new teletext page (P100-P104): the header searches in green while the old page lingers, then the new page overwrites it two rows at a time; arrows, pictures and bar charts are sextant mosaics, numbers count in double-height digits and the key moments use the Flash attribute.',
    explainer(ctx, W, H_, t) {
      let i = 0; for (let k = 0; k < EX_PAGES.length; k++) if (t >= EX_PAGES[k][0]) i = k;
      const tl = t - EX_PAGES[i][0], SEARCH = 0.35;
      const gn = buildEx(i, t), go = i > 0 ? buildEx(i - 1, t) : newGrid();
      let g;
      if (tl < SEARCH) { g = go; exHeader(g, EX_PAGES[i][1], t, true); }
      else {
        const rows = 2 * Math.floor((tl - SEARCH) * 22) + 2;
        g = gn.map((row, r) => (r === 0 || r < rows ? row : go[r]));
      }
      renderTT(ctx, W, H_, g, t);
    },
    explainerSound(k) { ttSound(k); },
    draw(ctx, W, H_, t) {
      const g = buildPage(t);
      const cw = W / COLS, rh = H_ / ROWS;
      const X = (c) => Math.round(c * cw), Y = (r) => Math.round(r * rh);
      ttCache(W, H_);
      const L = scratch('page', W, H_), c = L.getContext('2d');
      c.fillStyle = '#000'; c.fillRect(0, 0, W, H_);
      // reveal rows progressively at the start (page "arriving")
      const rowsShown = t < 0.9 ? 1 : Math.min(ROWS, 2 * Math.floor((t - 0.9) * 22) + 2); // rows land two per field
      for (let r = 0; r < ROWS; r++) {
        if (r >= rowsShown && r !== 0) continue;
        for (let col = 0; col < COLS; col++) {
          const cell = g[r][col];
          const x0 = X(col), x1 = X(col + 1), y0 = Y(r), y1 = Y(r + 1);
          c.fillStyle = PAL[cell.bg]; c.fillRect(x0, y0, x1 - x0, y1 - y0);
          if (cell.mos && !(cell.flash && Math.floor(t * 1.5) % 3 === 2)) {
            c.fillStyle = PAL[cell.fg];
            for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) {
              if (!(cell.mos & (1 << (j * 2 + i)))) continue;
              const sx0 = Math.round(x0 + (i * (x1 - x0)) / 2), sx1 = Math.round(x0 + ((i + 1) * (x1 - x0)) / 2);
              const sy0 = Math.round(r * rh + (j * rh) / 3), sy1 = Math.round(r * rh + ((j + 1) * rh) / 3);
              c.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
            }
          }
        }
      }
      // text pass (after backgrounds so double-height glyphs spill into the row below)
      for (let r = 0; r < ROWS; r++) {
        if (r >= rowsShown && r !== 0) continue;
        for (let col = 0; col < COLS; col++) {
          const cell = g[r][col];
          if (cell.mos || cell.ch === ' ' || cell.dh === 2) continue;
          drawGlyph(c, cell, X(col), Y(r), cw, rh); // cached rounded glyph (hero cells never use double width)
        }
      }

      // ---- CRT presentation: soft focus, gun misconvergence, shadow mask, bloom, scanlines, curved glass ----
      crtPresent(ctx, W, H_, L, t);
    },
  });
}
