{
  // ---------- ASCII demoscene: ray-marched torus -> luminance ramp in a monospace grid ----------
  const CW = 8, CH = 12;             // cell size in px
  const RAMP = ' .,-~:;=!*#$@';      // the classic donut ramp
  const FLOOR_RAMP = ' .:-=+';

  // tiny vec helpers
  const len3 = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
  const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

  // CP437-style block glyphs drawn as real VGA cells: shades are dither patterns, blocks fill the cell exactly
  // (web monospace fonts lack these glyphs and the fallback paints them as flat rectangles).
  // '▓' = solid cell with a staggered 1px hole grid; '▒' = 2px checker; '░' = sparse staggered 2px dots.
  const SHADE_TILE = {
    '▓': (i, j) => !(j % 2 === 0 && (i + j) % 4 === 0),
    '▒': (i, j) => ((i >> 1) + (j >> 1)) % 2 === 0,
    '░': (i, j) => (j >> 1) % 2 === 0 && ((i >> 1) + (j >> 2)) % 2 === 0,
  };
  // coloured shade tiles are cached per (glyph, colour); the colour set is small and fixed, so this fills once
  const shadeCache = new Map();
  const shadeTile = (ch, col) => {
    const key = ch + col; let c = shadeCache.get(key);
    if (!c) {
      if (shadeCache.size > 6000) shadeCache.clear();
      c = H.layer(CW, CH); const g = c.getContext('2d'); g.fillStyle = col;
      const f = SHADE_TILE[ch];
      for (let j = 0; j < CH; j++) for (let i = 0; i < CW; i++) if (f(i, j)) g.fillRect(i, j, 1, 1);
      shadeCache.set(key, c);
    }
    return c;
  };
  function cellGlyph(gx, ch, x, y, col) {
    if (SHADE_TILE[ch]) { gx.drawImage(shadeTile(ch, col), x, y); return true; }
    if (ch === '█') { gx.fillStyle = col; gx.fillRect(x, y, CW, CH); return true; }
    if (ch === '▄') { gx.fillStyle = col; gx.fillRect(x, y + CH / 2, CW, CH / 2); return true; }
    return false;
  }

  // ---------- shared CRT finish: wide phosphor bloom, scanlines, aperture grille (static layers cached by size) ----------
  // Scanlines (28% dark line every 3rd px row) and a 12% RGB aperture grille are both multiplicative, so they are
  // pre-combined into one cached multiply layer.
  let crtKey = '', crtMul = null, crtSmall = null;
  function crtFinish(ctx, glyphs, W, H_) {
    const key = W + 'x' + H_;
    if (crtKey !== key) {
      crtKey = key;
      crtMul = H.layer(W, H_); const g = crtMul.getContext('2d'), img = g.createImageData(W, H_), d = img.data;
      const gr = [[255, 122, 122], [122, 255, 122], [122, 122, 255]];
      for (let y = 0; y < H_; y++) {
        const sl = y % 3 === 2 ? 0.72 : 1;
        for (let x = 0; x < W; x++) {
          const c = gr[x % 3], i = (y * W + x) * 4;
          for (let k = 0; k < 3; k++) d[i + k] = 255 * sl * (1 - 0.12 * (1 - c[k] / 255));
          d[i + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
      crtSmall = H.layer(Math.ceil(W / 4), Math.ceil(H_ / 4));
    }
    // second, wider bloom (computed at quarter res, so it is cheap): bright glyphs bleed like phosphor
    const sm = crtSmall.getContext('2d'); sm.clearRect(0, 0, crtSmall.width, crtSmall.height);
    sm.filter = 'blur(3.5px)'; sm.drawImage(glyphs, 0, 0, crtSmall.width, crtSmall.height); sm.filter = 'none';
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35; ctx.drawImage(crtSmall, 0, 0, W, H_);
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 1; ctx.drawImage(crtMul, 0, 0);
    ctx.restore();
  }

  // ================= EXPLAINER: "How does AI learn?" as one long scrolling ASCII document =================
  const FIG = new Map(); // cache: string -> {w, on(x,y)}
  const figBits = (str) => {
    if (FIG.has(str)) return FIG.get(str);
    const w = str.length * 8 + 2, c = H.layer(w, 10), g = c.getContext('2d', { willReadFrequently: true });
    g.font = '8px "Press Start 2P"'; g.textBaseline = 'top'; g.fillStyle = '#fff'; g.fillText(str, 0, 1);
    const d = g.getImageData(0, 0, w, 10).data, bits = new Uint8Array(w * 10);
    for (let i = 0; i < w * 10; i++) bits[i] = d[i * 4 + 3] > 120 ? 1 : 0;
    const res = { w, on: (x, y) => x >= 0 && y >= 0 && x < w && y < 10 && bits[y * w + x] === 1 };
    if (document.fonts && document.fonts.check('8px "Press Start 2P"')) FIG.set(str, res);
    return res;
  };
  const EX_CAT = [' /\\_/\\ ', '( o.o )', ' > ^ < '];
  const EX_DOG = ['/^ ^\\  ', '(o o)__', ' \\_Y_/ '];

  function asciiExplainer(ctx, W, H_, t) {
    const cols = Math.floor(W / CW), rows = Math.floor(H_ / CH);
    const grid = new Array(cols * rows).fill(null);
    // world-space scroll (terminal scrolls one row at a time = the camera move between beats)
    const sstep = (a, b) => Math.floor(H.ease.inOut(H.clamp((t - a) / (b - a))) * 60);
    const view = sstep(1.8, 2.3) + sstep(6.0, 6.6) + sstep(10.4, 11.0);
    let OFF = view; // world row -> screen row = wr - OFF
    const set = (c, wr, ch, col, bg) => { const r = wr - OFF; c = Math.round(c); if (c >= 0 && r >= 0 && c < cols && r < rows) grid[r * cols + c] = [ch, col, bg]; };
    const put = (c, wr, s, col, bg) => [...s].forEach((ch, i) => set(c + i, wr, ch, col, bg));
    // double-width/double-height line (like a VT100 DECDHL row): occupies 2x2 cells per char
    const bigs = [];
    const put2 = (c, wr, s, col, bg) => { const r = wr - OFF; if (r < -1 || r >= rows) return; bigs.push([Math.round(c), r, s, col, bg]); };
    const ease = (a, d) => H.ease.inOut(H.clamp((t - a) / d));
    const fmt = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const blink = Math.floor(t * 3) % 2 === 0;
    const flash = (t > 7.5 && t < 7.62) || (t > 12.4 && t < 12.5) ? 25 : 0;
    // figlet text in block characters with a drop shadow
    const fig = (str, c, wr, hueTop, hueBot, reveal = 1, light = 62) => {
      const b = figBits(str), maxX = Math.floor(b.w * reveal);
      for (let y = 0; y < 10; y++) for (let x = 0; x < b.w; x++) {
        if (x > maxX) continue;
        if (b.on(x, y)) { const k = y / 8; set(c + x, wr + y, k < 0.55 ? '█' : '▓', hsl(H.lerp(hueTop, hueBot, k), 100, light + flash - k * 10)); }
        else if (b.on(x - 1, y - 1)) set(c + x, wr + y, '░', hsl(300, 80, 30));
      }
      return b.w;
    };
    const box = (c, wr, w, h, col, title, prog = 1) => {
      const perim = [];
      for (let i = 0; i < w; i++) perim.push([c + i, wr, i === 0 ? '┌' : i === w - 1 ? '┐' : '─']);
      for (let j = 1; j < h; j++) perim.push([c + w - 1, wr + j, j === h - 1 ? '┘' : '│']);
      for (let i = w - 2; i >= 0; i--) perim.push([c + i, wr + h - 1, i === 0 ? '└' : '─']);
      for (let j = h - 2; j >= 1; j--) perim.push([c, wr + j, '│']);
      const n = Math.floor(perim.length * prog);
      for (let k = 0; k < n; k++) set(perim[k][0], perim[k][1], perim[k][2], col);
      if (title && prog >= 1) put(c + 2, wr, ' ' + title + ' ', '#ffffff', hsl(185, 90, 30));
    };
    const hArrow = (c0, c1, wr, col, prog = 1, label) => {
      const end = Math.floor(c0 + (c1 - c0) * prog);
      for (let c = c0; c < end; c++) set(c, wr, '─', col);
      if (prog > 0.05) set(end, wr, '►', col);
      if (label && prog >= 1) put(Math.round((c0 + c1) / 2 - label.length / 2), wr - 1, label, col);
    };
    const pathArrow = (pts, col, prog, head) => { // pts: [[c,wr]...] axis-aligned
      const cells = [];
      for (let i = 1; i < pts.length; i++) {
        const [c0, r0] = pts[i - 1], [c1, r1] = pts[i];
        const n = Math.max(Math.abs(c1 - c0), Math.abs(r1 - r0));
        for (let k = 0; k < n; k++) cells.push([c0 + Math.sign(c1 - c0) * k, r0 + Math.sign(r1 - r0) * k, r0 === r1 ? '─' : '│']);
      }
      const n = Math.floor(cells.length * prog);
      for (let k = 0; k < n; k++) set(cells[k][0], cells[k][1], cells[k][2], col);
      if (n > 0 && n <= cells.length) { const [c, r] = cells[Math.min(n, cells.length) - 1]; set(c, r, n < cells.length ? '●' : head, col); }
    };
    const net = (c, wr, wobble, settle) => { // little network of nodes + connections inside a box
      const L = [[c + 4, [wr + 3, wr + 8, wr + 13]], [c + 18, [wr + 1, wr + 6, wr + 11, wr + 16]], [c + 32, [wr + 5, wr + 10]]];
      for (let l = 0; l < 2; l++) L[l][1].forEach((ra, i) => L[l + 1][1].forEach((rb, j) => {
        const x0 = L[l][0], x1 = L[l + 1][0], n = x1 - x0;
        const id = l * 20 + i * 4 + j;
        const strong = H.rng(id + (settle ? 99 : 0))() > 0.5;
        const hot = wobble > 0 && H.rng(id + Math.floor(t * 12))() > 0.6;
        for (let k = 1; k < n; k++) { const rr = Math.round(H.lerp(ra, rb, k / n)); set(x0 + k, rr, strong ? '·' : '.', hot ? hsl(0, 90, 60) : hsl(185, 70, strong ? 55 : 32)); }
      }));
      L.forEach(([x, rs]) => rs.forEach((rr) => { set(x, rr, 'O', hsl(48, 100, 65 + (wobble ? 15 : 0))); }));
    };
    const asciiPic = (rowsA, c, wr, col) => rowsA.forEach((s, i) => put(c, wr + i, s, col));

    // ---------- plasma backdrop (screen-space, very dim) ----------
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = c / cols, y = (r + view) / rows;
      const v = Math.sin(x * 9 + t) + Math.sin(y * 7 - t * 0.7) + Math.sin((x + y) * 6 + t * 0.5);
      const k = (v + 3) / 6; if (k < 0.5) continue;
      const u = (k - 0.5) / 0.5;
      grid[r * cols + c] = ['.·:'[Math.min(2, Math.floor(u * 3))], hsl(250 + k * 60, 66, 14 + u * 22, 0.6 + u * 0.3)];
    }

    // ---------- BEAT 1 (world rows 0-59): the question, big ----------
    fig('HOW DOES', 48, 16, 48, -20, H.clamp((t - 0.1) / 0.6));
    fig('AI LEARN?', 44, 28, 48, -20, H.clamp((t - 0.6) / 0.7));
    if (t > 1.2) put(52, 41, '> scroll down for the answer_', hsl(185, 70, 55));

    // ---------- BEAT 2 (world rows 60-119): labelled data stream into the model ----------
    {
      const B = 60;
      // model box with its network
      box(80, B + 8, 40, 22, hsl(185, 90, 50), 'MODEL', ease(1.85, 0.5));
      if (t > 2.2) net(81, B + 10, 0, false);
      // the flow arrow with its label
      hArrow(2, 78, B + 26, hsl(48, 100, 60), ease(2.0, 0.6)); if (t > 3.0) put2(14, B + 28, 'training data', hsl(48, 100, 62));
      // labelled example cards marching (cell-stepped) along the arrow into the model
      for (let i = 0; i < 7; i++) {
        const t0 = 2.5 + i * 0.5, k = (t - t0) / 1.6;
        if (k < 0 || k > 1) continue;
        const c = Math.floor(H.lerp(-20, 62, k)), isCat = i % 3 !== 1;
        box(c, B + 11, 18, 9, hsl(300, 60, 55));
        (isCat ? EX_CAT : EX_DOG).forEach((rw, j) => put2(c + 2, B + 12 + j * 2, rw, '#ffffff'));
        put2(c + 6, B + 21, isCat ? 'cat' : 'dog', '#000', isCat ? hsl(48, 100, 60) : hsl(330, 100, 65));
      }
      // counter as figlet digits, label landing on it
      if (t > 2.9) {
        const v = 1e6 * Math.pow(H.clamp((t - 3.0) / 2.6), 2.2);
        fig(fmt(v), 46, B + 36, 185, 260, 1, 60);
        put2(46, B + 47, 'examples seen ^', hsl(185, 70, 60));
      }
    }

    // ---------- BEAT 3 (world rows 120-179): GUESS -> CHECK -> ADJUST ----------
    {
      const B = 120;
      const phase = t < 7.5 ? 0 : t < 8.35 ? 1 : t < 9.4 ? 2 : 0;
      ['GUESS', 'CHECK', 'ADJUST'].forEach((nm, i) => {
        const c = 24 + i * 34, on = i === phase && t > 6.3;
        put2(c, B + 4, ' ' + nm + ' ', on ? '#000' : hsl(185, 60, 55), on ? hsl(48, 100, 60) : undefined);
        if (i < 2) put(c + nm.length * 2 + 6, B + 5, '──►', hsl(185, 60, 50));
      });
      put(106, B + 5, '─┐', hsl(185, 60, 50)); put(107, B + 6, '│', hsl(185, 60, 50)); put(107, B + 7, '│', hsl(185, 60, 50));
      put(30, B + 8, '└' + '─'.repeat(76) + '┘', hsl(185, 60, 50)); set(30, B + 7, '▲', hsl(185, 60, 50)); put2(60, B + 9, 'repeat', hsl(185, 60, 50));
      // picture
      box(1, B + 15, 18, 8, hsl(300, 60, 55)); EX_CAT.forEach((rw, j) => put2(3, B + 16 + j * 2, rw, '#ffffff')); put2(2, B + 24, 'picture', hsl(300, 50, 70));
      // model
      const wob = t > 8.6 && t < 9.4 ? 1 : 0;
      box(46, B + 12, 40, 22, hsl(185, 90, 50), 'MODEL');
      net(47, B + 14, wob, t > 9.0);
      // weights readout inside the model
      const adj = H.clamp((t - 8.6) / 0.7), wv = [[0.42, 0.57], [-1.3, -0.86], [0.77, 0.31]];
      wv.forEach(([a, b], i) => { let v = H.lerp(a, b, adj); if (adj > 0 && adj < 1) v += (H.rng(Math.floor(t * 15) + i)() - 0.5) * 0.5; put2(30 + i * 19, B + 42, 'w' + (i + 1) + '=' + (v >= 0 ? '+' : '') + v.toFixed(2), adj > 0 && adj < 1 ? hsl(0, 90, 65) : hsl(48, 80, 60)); });
      hArrow(20, 45, B + 20, hsl(48, 100, 60), ease(6.7, 0.4)); if (t > 6.9) put2(24, B + 17, 'guess', hsl(48, 100, 62));
      if (t > 7.0) hArrow(87, 98, B + 20, hsl(48, 100, 60), ease(7.0, 0.2));
      if (t > 7.1 && t < 9.4) {
        fig('dog?', 100, B + 16, t > 7.5 ? 10 : 48, -20, H.clamp((t - 7.1) / 0.3));
        if (t > 7.5) {
          for (let k = 0; k < 9; k++) { set(102 + k * 3, B + 16 + k, '╲', hsl(0, 100, 60)); set(103 + k * 3, B + 16 + k, '╲', hsl(0, 100, 60)); set(127 - k * 3, B + 16 + k, '╱', hsl(0, 100, 60)); set(128 - k * 3, B + 16 + k, '╱', hsl(0, 100, 60)); }
          if (t > 8.2 || blink) put2(98, B + 27, " X it's a cat ", '#000', hsl(0, 100, 60));
        }
      }
      if (t > 8.35) { // error travels back to the model
        pathArrow([[114, B + 29], [114, B + 38], [66, B + 38], [66, B + 34]], hsl(0, 100, 62), ease(8.35, 0.55), '▲');
        if (t > 8.6) put2(80, B + 39, 'error', hsl(0, 100, 70));
      }
      if (t > 9.75) {
        fig('cat', 100, B + 16, 120, 160, H.clamp((t - 9.75) / 0.3));
        if (t > 10.0) { const CK = ['......██', '.....██.', '██..██..', '.████...', '..██....']; CK.forEach((rw, j) => [...rw].forEach((ch, i) => { if (ch === '█') set(126 + i, B + 17 + j, '█', hsl(130, 100, 60)); })); put2(98, B + 27, ' correct! ', '#000', hsl(130, 90, 55)); }
      }
    }

    // ---------- BEAT 4 + 5 (world rows 180-239): accuracy chart, then the takeaway ----------
    {
      const B = 180;
      const ox = 10, oy = B + 32, ah = 24;
      for (let r = 0; r <= ah; r++) set(ox, oy - r, '│', hsl(185, 60, 50));
      put(ox, oy, '└' + '─'.repeat(84), hsl(185, 60, 50));
      put(ox - 6, oy - ah, '100%', hsl(185, 60, 60)); put(ox - 5, oy - ah / 2, '50%', hsl(185, 60, 60));
      put2(ox + 40, oy + 1, 'training rounds >', hsl(185, 60, 60));
      const acc = (i) => 97 - 36 * Math.exp(-i / 4);
      const nb = H.clamp((t - 11.0) / 1.4) * 16;
      for (let i = 0; i < 16; i++) {
        const g = H.clamp(nb - i); if (g <= 0) break;
        const h = Math.round((acc(i) / 100) * ah * g);
        for (let r = 1; r <= h; r++) for (let w = 0; w < 4; w++) {
          const ch = r === h ? '▄' : w === 0 ? '▓' : w === 3 ? '▒' : '█';
          set(ox + 2 + i * 5 + w, oy - r, ch, hsl(260 - i * 8, 90, 45 + r * 1.2 - (r % 2) * 6 - (w === 3 ? 8 : 0)));
        }
      }
      const val = Math.round(61 + 36 * H.ease.out(H.clamp((t - 11.0) / 1.4)));
      put2(104, B + 8, 'accuracy', hsl(185, 70, 60));
      fig(val + '%', 104, B + 11, 48, -20, 1);
      if (t > 12.4) {
        if (t > 12.9 || blink) { put(101, B + 9, '╔' + '═'.repeat(36) + '╗', hsl(0, 100, 62)); put(101, B + 22, '╚' + '═'.repeat(36) + '╝', hsl(0, 100, 62)); for (let r = B + 10; r < B + 22; r++) { set(101, r, '║', hsl(0, 100, 62)); set(138, r, '║', hsl(0, 100, 62)); } }
        pathArrow([[100, B + 15], [90, B + 15]], hsl(0, 100, 62), ease(12.4, 0.25), '◄');
        put2(104, B + 23, '61% > ' + val + '%', hsl(48, 100, 62));
      }
      if (t > 13.0) {
        fig('MORE EXAMPLES', 16, B + 38, 185, 260, H.clamp((t - 13.0) / 0.45));
        fig('>BETTER GUESSES', 16, B + 49, 48, -20, H.clamp((t - 13.35) / 0.5));
      }
    }

    // ---------- pinned header: the question lives on as a title bar ----------
    if (t > 2.1) {
      for (let r = 0; r < 4; r++) for (let c = 0; c < cols; c++) grid[r * cols + c] = null;
      for (let i = bigs.length - 1; i >= 0; i--) if (bigs[i][1] < 4) bigs.splice(i, 1);
      OFF = 0;
      const k = H.clamp((t - 2.1) / 0.3), q = ' HOW DOES AI LEARN? ';
      put(2 + q.length * 2 + 1, 2, '─'.repeat(Math.floor((cols - q.length * 2 - 22) * k)), hsl(48, 80, 45));
      const beat = t < 6.3 ? '1/4 data' : t < 10.7 ? '2/4 learn loop' : t < 13 ? '3/4 progress' : '4/4 takeaway';
      put(cols - beat.length - 3, 2, beat, hsl(185, 70, 60));
      put2(2, 1, q.slice(0, Math.ceil(q.length * k)), '#000', hsl(48, 100, 60));
    }

    // ---------- render cells: backgrounds, glyphs, glow ----------
    const glyphs = H.layer(W, H_), gx = glyphs.getContext('2d');
    ctx.fillStyle = '#05040a'; ctx.fillRect(0, 0, W, H_);
    gx.font = '600 12px "IBM Plex Mono"'; gx.textBaseline = 'top';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const g = grid[r * cols + c]; if (!g) continue;
      if (g[2]) { gx.fillStyle = g[2]; gx.fillRect(c * CW, r * CH, CW, CH); }
      if (g[0] !== ' ' && !cellGlyph(gx, g[0], c * CW, r * CH, g[1])) { gx.fillStyle = g[1]; gx.fillText(g[0], c * CW, r * CH); }
    }
    gx.font = '600 28px "IBM Plex Mono"'; gx.textBaseline = 'middle'; gx.textAlign = 'center';
    bigs.forEach(([c, r, str, col, bg]) => {
      gx.clearRect(c * CW, r * CH, str.length * 2 * CW, 2 * CH);
      if (bg) { gx.fillStyle = bg; gx.fillRect(c * CW, r * CH, str.length * 2 * CW, 2 * CH); }
      gx.fillStyle = col; [...str].forEach((ch, i) => gx.fillText(ch, (c + i * 2) * CW + CW, r * CH + CH + 1));
    });
    gx.textAlign = 'left';
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.8; ctx.filter = 'blur(6px)'; ctx.drawImage(glyphs, 0, 0); ctx.restore();
    ctx.drawImage(glyphs, 0, 0);
    crtFinish(ctx, glyphs, W, H_);
    H.vignette(ctx, W, H_, 0.55);
  }

  // ================= SOUND: a demoscene terminal. Characters print with dry little clicks, the terminal scrolls with a
  // stepped line-feed rattle and a falling SID sweep, a quiet tracker (chip) tune runs under each beat, and the big hits
  // are square-wave chord stabs with a noise-channel crash. Times copied from asciiExplainer above.
  function asciiSound(k) {
    const END = 14.5;
    const pan = (c) => H.clamp(c / 160) * 1.6 - 0.8; // 160 columns across the 1280 px screen
    const sq = (t, f, dur, gain, o) => k.tone(t, Object.assign({ f, type: 'square', dur, gain, a: 0.001, hold: dur * 0.6, filter: 'lowpass', f2: 2600 }, o));
    const tri = (t, f, dur, gain, o) => k.tone(t, Object.assign({ f, type: 'triangle', dur, gain, a: 0.002, hold: dur * 0.5 }, o));
    const crash = (t, dur, gain, p = 0) => k.noise(t, { dur, filter: 'lowpass', f: 3500, gain, rate: 0.3, a: 0.001, pan: p });
    // one printed character: a dry terminal click with a low body (no pitched chirp)
    const chr = (t, p = 0, g = 1) => { k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1500, q: 2.5, gain: 0.2 * g, a: 0.001, pan: p, minor: true }); k.tone(t, { f: 190, type: 'square', dur: 0.018, gain: 0.03 * g, a: 0.001, filter: 'lowpass', f2: 700, pan: p, minor: true }); };
    // print a stretch of text: one click per frame-ish, kept to ~14/s
    const print = (t0, dur, p = 0, g = 1) => { for (let t = t0; t < t0 + dur - 0.01; t += 1 / 14) chr(t, p, g); };
    // terminal scroll a -> b (eased, 60 rows): line-feed rattle that speeds up and slows with the ease, plus a falling sweep
    const scroll = (a, b) => {
      let row = 0;
      for (let f = Math.ceil(a * 60); f <= b * 60; f++) {
        const t = f / 60, r = Math.floor(H.ease.inOut(H.clamp((t - a) / (b - a))) * 60);
        if (r - row >= 4) { k.noise(t, { dur: 0.01, filter: 'bandpass', f: 900, q: 3, gain: 0.16, a: 0.001 }); row = r; }
      }
      k.tone(a, { f: [[0, 700], [b - a, 110]], type: 'square', dur: b - a + 0.05, gain: 0.04, a: (b - a) * 0.3, filter: 'lowpass', f2: 1600 });
      k.noise(a, { dur: b - a, color: 'pink', filter: 'bandpass', f: [[0, 1800], [b - a, 400]], q: 1.2, gain: 0.08, a: (b - a) * 0.4 });
    };

    // ---- tracker tune under each beat (drops out for the scrolls)
    const BPM = 125;
    k.music('chip', 0.1, 1.8, { bpm: BPM, gain: 0.25, chords: [['A3', 'C4', 'E4', 'A4']] });
    k.music('chip', 2.3, 6.0, { bpm: BPM, gain: 0.4, chords: [['A3', 'C4', 'E4', 'A4'], ['F3', 'A3', 'C4', 'F4']] });
    k.music('chip', 6.6, 10.4, { bpm: BPM, gain: 0.4, chords: [['D4', 'F4', 'A4', 'D5'], ['E3', 'G#3', 'B3', 'E4']] });
    k.music('chip', 11.0, END, { bpm: BPM, gain: 0.3, chords: [['C4', 'E4', 'G4', 'C5'], ['F3', 'A3', 'C4', 'F4']] });
    k.bed('hiss', 0, END, { gain: 0.8 });

    // ---- BEAT 1: figlet question prints column by column (0.1-0.7, 0.6-1.3), prompt line (1.2)
    print(0.1, 0.6, pan(70)); print(0.62, 0.68, pan(70));
    sq(1.2, 'A3', 0.05, 0.05, { pan: pan(80) }); chr(1.2, pan(80), 1.4);
    scroll(1.8, 2.3);

    // ---- BEAT 2: header pins (2.1), MODEL box draws (1.85-2.35), arrow draws (2.0-2.6)
    sq(2.1, 'E3', 0.07, 0.04, { pan: -0.5 }); sq(2.17, 'A3', 0.09, 0.035, { pan: -0.5 });     // reverse-video title bar snaps on
    print(2.35, 0.25, pan(40), 0.7);                                                          // arrow line finishes drawing
    chr(3.0, pan(30), 1.3);                                                                  // 'training data' label
    // cards reach the MODEL (k = 1 at 2.5 + i*0.5 + 1.6) while it is on screen: a rising square gulp
    [4.1, 4.6, 5.1, 5.6].forEach((t, i) => k.tone(t, { f: [[0, 330 * Math.pow(2, i / 12)], [0.07, 660 * Math.pow(2, i / 12)]], type: 'square', dur: 0.09, gain: 0.05, a: 0.001, hold: 0.05, filter: 'lowpass', f2: 2000, pan: pan(84), minor: true }));
    // counter 3.0-5.6 (pow 2.2, speeding up): noise-channel ticks, sparse to dense, capped at 12/s
    for (let t = 3.05; t < 5.55;) { k.noise(t, { dur: 0.015, filter: 'bandpass', f: 2200, q: 2, gain: 0.14, a: 0.001, pan: pan(70), minor: true }); t += H.lerp(0.25, 1 / 12, (t - 3.0) / 2.6); }
    // lands on 1,000,000 (5.6)
    ['A4', 'C5', 'E5'].forEach((n) => sq(5.6, n, 0.3, 0.032, { pan: pan(70) })); tri(5.6, 'A2', 0.3, 0.15); crash(5.6, 0.12, 0.08);
    scroll(6.0, 6.6);

    // ---- BEAT 3: GUESS lights (6.3), guess arrow (6.7-7.1), "dog?" prints (7.1-7.4)
    sq(6.3, 'D4', 0.05, 0.05, { pan: pan(30) });
    print(6.75, 0.3, pan(32), 0.7); chr(6.9, pan(28), 1.2);
    print(7.1, 0.3, pan(110));
    // CHECK (7.5): the wrong guess. screen flash, dog? turns red and is crossed out
    sq(7.5, 'A2', 0.35, 0.09, { f2: 1200, hold: 0.25, pan: pan(110) }); sq(7.5, 'A#2', 0.35, 0.07, { f2: 1200, hold: 0.25, pan: pan(110) }); // detuned buzz
    k.play('glitch', 7.5, { gain: 1.0, pan: pan(110) }); crash(7.5, 0.25, 0.18, pan(110));
    sq(7.85, 'E2', 0.25, 0.07, { f2: 900, hold: 0.15, pan: pan(100) });                     // "X it's a cat" label settles under it
    // ADJUST (8.35): button, red error path runs back to the model (8.35-8.9), 'error' label (8.6)
    sq(8.35, 'D4', 0.05, 0.05, { pan: pan(100) });
    k.tone(8.35, { f: [[0, 900], [0.55, 220]], type: 'square', dur: 0.56, gain: 0.04, a: 0.01, hold: 0.4, filter: 'lowpass', f2: 1500, pan: 0.5 });
    // weights + network jitter while adjusting (8.6-9.3, re-rolls 15x/s): low random square burble, then it settles
    k.withMinor(() => { const r = H.rng(808); for (let t = 8.6; t < 9.3; t += 1 / 15) sq(t, 110 + r() * 260, 0.05, 0.035, { f2: 900, pan: -0.2 + r() * 0.4 }); });
    sq(9.3, 'A3', 0.08, 0.05, { pan: -0.3 });
    sq(9.4, 'D4', 0.05, 0.05, { pan: pan(30) });                                              // GUESS again
    // "cat" prints (9.75-10.05), check + correct! (10.0): the correction
    print(9.75, 0.25, pan(110));
    ['D5', 'F#5', 'A5'].forEach((n, i) => sq(10.0 + i * 0.06, n, 0.08, 0.04, { pan: pan(115) })); sq(10.18, 'D6', 0.3, 0.03, { pan: pan(115) }); tri(10.0, 'D3', 0.35, 0.14);
    scroll(10.4, 11.0);

    // ---- BEAT 4: 16 bars grow one after another (11.0 + i*0.0875), the % climbs with them
    k.withMinor(() => { const notes = ['C4', 'E4', 'G4', 'C5']; for (let i = 0; i < 16; i++) sq(11.0 + i * 0.0875, k.hz(notes[i % 4]) * (i < 8 ? 1 : 2) * 0.5, 0.06, 0.04, { f2: 1800, pan: pan(12 + i * 5) }); });
    // 97% (12.4): boxed + flashed. the biggest hit: chord stab, kick, crash, and an arrow ping
    const P = 12.4;
    ['C4', 'E4', 'G4', 'C5', 'E5'].forEach((n) => sq(P, n, 0.8, 0.055, { hold: 0.3, pan: pan(118), verb: 0.15 }));
    tri(P, 'C2', 0.7, 0.32, { hold: 0.2 }); k.play('thud', P, { f: 120, gain: 0.7 }); crash(P, 0.5, 0.26, pan(118));
    // ---- BEAT 5: takeaway prints (13.0-13.45, 13.35-13.85) and lands (13.85)
    print(13.0, 0.4, pan(60)); print(13.38, 0.45, pan(60));
    const TAKE = 13.85;
    sq(TAKE, 'G4', 0.1, 0.035); ['C5', 'E5', 'G5'].forEach((n) => sq(TAKE + 0.1, n, 0.6, 0.026, { hold: 0.2, verb: 0.12 })); tri(TAKE + 0.1, 'C3', 0.7, 0.13);
  }

  registerStyle({
    id: 'ascii-render',
    name: 'ASCII Demoscene',
    category: 'Retro Digital',
    description: 'A ray-marched 3D torus rasterised into a strict monospace character grid via a luminance ramp, colour-coded like a 90s demoscene intro: box-drawn title panel, plasma backdrop, copper bars and a sine scroller.',
    motion: 'Like a demo intro booting: plasma thickens in, the spinning torus is rastered into characters top-to-bottom behind a bright scan row, the block title and nfo panel print, copper bars open and a rainbow sine-scroller glides in from the right.',
    duration: 5,
    fonts: ['600 12px "IBM Plex Mono"', '700 22px "IBM Plex Mono"', '8px "Press Start 2P"'],
    frameT: 4.7,
    readsPixels: false,
    explainerDuration: 14.5,
    explainerNote: 'One long ASCII document that the terminal scrolls through row by row: figlet block-letter question, labelled ASCII cat/dog cards stepping along a box-drawing arrow into a MODEL box, a reverse-video GUESS/CHECK/ADJUST loop with a red error path, and block-character bar charts with figlet counters.',
    explainer(ctx, W, H_, t) { asciiExplainer(ctx, W, H_, t); },
    explainerSound(k) { asciiSound(k); },
    draw(ctx, W, H_, t) {
      const cols = Math.floor(W / CW), rows = Math.floor(H_ / CH);
      const nz = H.makeNoise(31);
      ctx.fillStyle = '#05040a'; ctx.fillRect(0, 0, W, H_);

      // grid of {ch, color}
      const grid = new Array(cols * rows).fill(null);
      const set = (c, r, ch, col) => { if (c >= 0 && r >= 0 && c < cols && r < rows) grid[r * cols + c] = [ch, col]; };

      // ---------- 1. plasma backdrop (very dim) ----------
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = c / cols, y = r / rows;
        const v = Math.sin(x * 9 + t) + Math.sin(y * 7 - t * 0.7) + Math.sin((x + y) * 6 + t * 0.5) + Math.sin(Math.hypot(x - 0.5, y - 0.5) * 14 - t * 1.3);
        const k = (v + 4) / 8;
        const thr = 0.45 + (1 - Math.floor(H.clamp(t / 0.8) * 6) / 6) * 0.55;
        if (k < thr) continue;
        const ch = '.·:+'[Math.min(3, Math.floor((k - 0.45) / 0.55 * 4))];
        set(c, r, ch, hsl(250 + k * 60, 60, 14 + k * 16));
      }

      // ---------- 2. ray-marched torus + checker floor ----------
      const A = 1.12 + (t - 4.7) * 0.36, Bang = 0.36 + (t - 4.7) * 0.32;
      const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(Bang), sB = Math.sin(Bang);
      const R1 = 0.46, R2 = 1.05, FLOOR = -1.75;
      // object-space rotate (inverse rotation of the point)
      const rot = (x, y, z) => {
        // rotate around X by A, then around Z by B
        let y1 = y * cA - z * sA, z1 = y * sA + z * cA;
        let x2 = x * cB - y1 * sB, y2 = x * sB + y1 * cB;
        return [x2, y2, z1];
      };
      const sdTorus = (x, y, z) => { const [px, py, pz] = rot(x, y, z); const q = Math.hypot(px, pz) - R2; return Math.hypot(q, py) - R1; };
      const scene = (x, y, z) => Math.min(sdTorus(x, y, z), y - FLOOR);
      const camX = 0, camY = 0.75, camZ = -4.6;
      const Lx0 = Math.cos((t - 4.7) * 0.4 + 0.88) * 0.6 - 0.5, Ly0 = 0.9, Lz0 = -0.7, Ll = len3(Lx0, Ly0, Lz0);
      const Lx = Lx0 / Ll, Ly = Ly0 / Ll, Lz = Lz0 / Ll;
      // torus centred at ~ (760px, 330px)
      const cxPx = 820, cyPx = 300, scale = 430;
      const march = (ox, oy, oz, dx, dy, dz) => {
        let d = 0;
        for (let i = 0; i < 80; i++) {
          const h = scene(ox + dx * d, oy + dy * d, oz + dz * d);
          if (h < 0.002) return d;
          d += h; if (d > 22) break;
        }
        return -1;
      };
      const softShadow = (ox, oy, oz) => {
        let res = 1, d = 0.04;
        for (let i = 0; i < 40 && d < 6; i++) { const h = sdTorus(ox + Lx * d, oy + Ly * d, oz + Lz * d); if (h < 0.001) return 0; res = Math.min(res, 8 * h / d); d += h; }
        return H.clamp(res);
      };
      const c0 = Math.floor((cxPx - 560) / CW), c1 = Math.ceil((cxPx + 560) / CW);
      const r0 = Math.floor((cyPx - 300) / CH), r1 = Math.min(rows - 9, Math.ceil((cyPx + 360) / CH));
      const scanRow = Math.floor(r0 + H.clamp((t - 0.3) / 1.2) * (r1 - r0 + 1));
      for (let r = Math.max(0, r0); r < Math.min(r1, scanRow + 1); r++) for (let c = Math.max(0, c0); c < Math.min(cols, c1); c++) {
        let lumSum = 0, hits = 0, kind = 0, angSum = 0, depth = 0, specSum = 0;
        for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
          const px = (c * CW + (sx + 0.5) * CW / 2 - cxPx) / scale, py = -(r * CH + (sy + 0.5) * CH / 2 - cyPx) / scale;
          let dx = px, dy = py - 0.12, dz = 1.6; const dl = len3(dx, dy, dz); dx /= dl; dy /= dl; dz /= dl;
          const d = march(camX, camY, camZ, dx, dy, dz);
          if (d < 0) continue;
          const hx = camX + dx * d, hy = camY + dy * d, hz = camZ + dz * d;
          const isFloor = Math.abs(hy - FLOOR) < 0.004 && sdTorus(hx, hy, hz) > 0.004;
          if (isFloor) {
            const chk = ((Math.floor(hx * 1.3 + 100) + Math.floor(hz * 1.3 + 100)) & 1);
            const fog = Math.exp(-Math.max(0, d - 3.5) * 0.28);
            const shd = softShadow(hx, hy + 0.01, hz);
            lumSum += (0.1 + 0.32 * chk) * (0.2 + 0.8 * shd) * fog; kind += 0; hits++;
          } else {
            const e = 0.0015;
            let nx = sdTorus(hx + e, hy, hz) - sdTorus(hx - e, hy, hz), ny = sdTorus(hx, hy + e, hz) - sdTorus(hx, hy - e, hz), nz2 = sdTorus(hx, hy, hz + e) - sdTorus(hx, hy, hz - e);
            const nl = len3(nx, ny, nz2); nx /= nl; ny /= nl; nz2 /= nl;
            const diff = Math.max(0, nx * Lx + ny * Ly + nz2 * Lz);
            // blinn spec
            let hx2 = Lx - dx, hy2 = Ly - dy, hz2 = Lz - dz; const hl = len3(hx2, hy2, hz2); hx2 /= hl; hy2 /= hl; hz2 /= hl;
            const spec = Math.pow(Math.max(0, nx * hx2 + ny * hy2 + nz2 * hz2), 40);
            const rim = Math.pow(1 - Math.abs(nx * dx + ny * dy + nz2 * dz), 3) * 0.25;
            lumSum += H.clamp(0.12 + diff * 0.78 + spec * 0.6 + rim); kind += 1; hits++;
            specSum += spec;
            const [ox, oy, oz] = rot(hx, hy, hz); angSum += Math.atan2(oz, ox); depth += d;
          }
        }
        if (!hits) continue;
        const cover = hits / 4, lum = (lumSum / hits) * (0.55 + 0.45 * cover);
        if (kind >= 2) { // torus
          const idx = Math.max(1, Math.min(RAMP.length - 1, Math.round(lum * (RAMP.length - 1))));
          const ang = angSum / kind;
          const hue = 245 + 55 * Math.sin(ang + t * 0.6); // cyan -> violet band around the ring
          const light = 18 + lum * 62 + (specSum / kind) * 30;
          set(c, r, RAMP[idx], hsl(hue + lum * 20, 90, Math.min(96, light)));
        } else { // floor
          const idx = Math.min(FLOOR_RAMP.length - 1, Math.round(lum * 2.2 * (FLOOR_RAMP.length - 1)));
          if (idx > 0) set(c, r, FLOOR_RAMP[idx], hsl(290 + lum * 40, 85, 10 + lum * 95));
        }
      }

      // bright raster row while the torus is being scanned in
      if (scanRow <= r1) for (let c = Math.max(0, c0 + 8); c < Math.min(cols, c1 - 8); c++) if ((c + scanRow) % 2 === 0) set(c, scanRow, '▄', hsl(190, 100, 80));

      // ---------- 3. figlet-style block title + box-drawn subtitle + nfo panel ----------
      const putStr = (c, r, s, col) => [...s].forEach((ch, i) => set(c + i, r, ch, col));
      const big = 'TOKENS';
      const tl = H.layer(64, 10), tg = tl.getContext('2d', { willReadFrequently: true });
      tg.font = '8px "Press Start 2P"'; tg.textBaseline = 'top'; tg.fillStyle = '#fff'; tg.fillText(big, 0, 1);
      const td = tg.getImageData(0, 0, 64, 10).data;
      const on = (x, y) => x >= 0 && y >= 0 && x < 64 && y < 10 && td[(y * 64 + x) * 4 + 3] > 120;
      const bx = 4, by = 3;
      const reveal = Math.floor(H.clamp((t - 0.2) / 1.2) * 52);
      for (let y = 0; y < 10; y++) for (let x = 0; x < 52; x++) {
        if (x > reveal) continue;
        if (on(x, y)) {
          const k = y / 8, hue = 48 - k * 70;
          set(bx + x, by + y, k < 0.55 ? '█' : '▓', hsl((hue + 360) % 360, 100, 62 - k * 10));
        } else if (on(x - 1, y - 1)) set(bx + x, by + y, '░', hsl(300, 80, 32));
      }
      const sub = 'ALL THE WAY DOWN';
      const sw = 50, sy = by + 11;
      const frameCol = hsl(185, 90, 55);
      if (t >= 0.9) {
      putStr(bx, sy, '╔' + '═'.repeat(sw - 2) + '╗', frameCol);
      putStr(bx, sy + 1, '║' + ' '.repeat(sw - 2) + '║', frameCol);
      putStr(bx, sy + 2, '╚' + '═'.repeat(sw - 2) + '╝', frameCol);
      const typed = Math.floor(H.clamp((t - 1.0) / 1.0) * sub.length);
      const subTxt = sub.split('').join(' ');
      const shownTxt = subTxt.slice(0, typed * 2);
      putStr(bx + 2, sy + 1, '▒░', hsl(330, 100, 60)); putStr(bx + sw - 4, sy + 1, '░▒', hsl(330, 100, 60));
      putStr(bx + 9, sy + 1, shownTxt, '#ffffff');
      if (Math.floor(t * 2.5) % 2 || typed < sub.length) set(bx + 9 + shownTxt.length, sy + 1, '█', '#ffffff');
      putStr(bx + 1, sy + 3, 'a 4k intro · party release · 1996', hsl(48, 60, 40));
      }
      if (t >= 1.6) {
      const pad = (s2, n) => (s2 + ' '.repeat(n)).slice(0, n);
      const info = ['obj .......... torus', 'ramp .,-~:;=!*#$@', 'grid ....... ' + cols + 'x' + rows, 'frame ......... ' + String(Math.floor(t * 60)).padStart(4, '0'), 'shade ..... lambert+spec'];
      putStr(bx, sy + 6, '┌─[ RENDER ]' + '─'.repeat(17) + '┐', hsl(185, 90, 40));
      const infoN = Math.floor((t - 1.6) / 0.08);
      info.forEach((s2, i) => { if (i < infoN) putStr(bx, sy + 7 + i, '│ ' + pad(s2, 26) + ' │', hsl(185, 60, 52)); else if (infoN >= 0) putStr(bx, sy + 7 + i, '│' + ' '.repeat(28) + '│', hsl(185, 90, 40)); });
      putStr(bx, sy + 7 + info.length, '└' + '─'.repeat(28) + '┘', hsl(185, 90, 40));
      set(bx + 1, sy + 9 + info.length, '|/-\\'[Math.floor(t * 10) % 4], hsl(48, 100, 62)); putStr(bx + 3, sy + 9 + info.length, 'raymarching...', hsl(48, 50, 45));
      }

      // ---------- 4. copper bars behind the scroller ----------
      const scrRow = rows - 6;
      for (let k = -3; k <= 3; k++) {
        if (Math.abs(k) > (t - 2.0) / 0.07) continue;
        const rr = scrRow + k, li = 1 - Math.abs(k) / 3.6;
        for (let c = 0; c < cols; c++) {
          if (grid[rr * cols + c]) continue;
          const hue = 280 + 40 * Math.sin(t + k * 0.5);
          set(c, rr, k === 0 ? '═' : '─', hsl(hue, 90, 6 + li * 22));
        }
      }

      // ---------- 5. draw the grid ----------
      ctx.font = '600 12px "IBM Plex Mono"'; ctx.textBaseline = 'top';
      const glyphs = H.layer(W, H_), gx = glyphs.getContext('2d');
      gx.font = ctx.font; gx.textBaseline = 'top';
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const g = grid[r * cols + c]; if (!g || g[0] === ' ') continue;
        if (!cellGlyph(gx, g[0], c * CW, r * CH, g[1])) { gx.fillStyle = g[1]; gx.fillText(g[0], c * CW, r * CH); }
      }
      // phosphor-ish glow: blurred additive copy, then crisp
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.85; ctx.filter = 'blur(6px)'; ctx.drawImage(glyphs, 0, 0); ctx.restore();
      ctx.drawImage(glyphs, 0, 0);

      // ---------- 6. sine scroller (big, rainbow, per-letter) ----------
      const msg = '*** GREETINGS FROM LATENT SPACE ***  TOKENS ALL THE WAY DOWN  ***  ';
      ctx.font = '700 22px "IBM Plex Mono"';
      const sp = 16, off = (t - 2.1) * 260 - W;
      ctx.save();
      for (let i = 0; i < msg.length; i++) {
        const x = i * sp - off + 20; if (x < -20 || x > W + 20) continue;
        const ch = msg[i % msg.length]; if (ch === ' ') continue;
        const y = scrRow * CH - 6 + Math.sin(x * 0.012 + t * 3) * 18;
        const hue = (x * 0.4 + t * 120) % 360;
        ctx.fillStyle = hsl(hue, 100, 22); ctx.fillText(ch, x + 2, y + 3);
        ctx.shadowColor = hsl(hue, 100, 60); ctx.shadowBlur = 10;
        ctx.fillStyle = hsl(hue, 100, 66); ctx.fillText(ch, x, y);
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      crtFinish(ctx, glyphs, W, H_);
      H.vignette(ctx, W, H_, 0.55);
    },
  });
}
