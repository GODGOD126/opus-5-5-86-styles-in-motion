{
  // ---- Windows-95-era desktop, rendered on a 640x360 buffer and nearest-neighbour upscaled 2x ----
  const C = { face: '#c0c0c0', hi: '#ffffff', lt: '#dfdfdf', sh: '#808080', dk: '#000000', navy: '#000080', teal: '#008080' };
  const BW = 640, BH = 360;

  function rect(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }

  // 2px Win95 bevel. kind: 'window' | 'button' | 'sunken' | 'pressed' | 'field'
  function bevel(c, x, y, w, h, kind) {
    let o1, o2, i1, i2; // outer TL, outer BR, inner TL, inner BR
    if (kind === 'window') [o1, o2, i1, i2] = [C.lt, C.dk, C.hi, C.sh];
    else if (kind === 'button') [o1, o2, i1, i2] = [C.hi, C.dk, C.lt, C.sh];
    else if (kind === 'pressed') [o1, o2, i1, i2] = [C.dk, C.hi, C.sh, C.lt];
    else if (kind === 'field') [o1, o2, i1, i2] = [C.sh, C.hi, C.dk, C.lt];
    else if (kind === 'thin') { rect(c, x, y, w, 1, C.sh); rect(c, x, y, 1, h, C.sh); rect(c, x, y + h - 1, w, 1, C.hi); rect(c, x + w - 1, y, 1, h, C.hi); return; }
    rect(c, x, y, w - 1, 1, o1); rect(c, x, y, 1, h - 1, o1);
    rect(c, x, y + h - 1, w, 1, o2); rect(c, x + w - 1, y, 1, h, o2);
    rect(c, x + 1, y + 1, w - 3, 1, i1); rect(c, x + 1, y + 1, 1, h - 3, i1);
    rect(c, x + 1, y + h - 2, w - 2, 1, i2); rect(c, x + w - 2, y + 1, 1, h - 2, i2);
  }

  // ---------- bitmap system font (8px caps, 6px x-height, 2px descenders), like the real 8pt UI bitmap font ----------
  // Each glyph: [firstRow, ...rows]; row 0 = cap top, row 7 = baseline row, rows 8-9 = descenders.
  const GL = {
    A: [0, '..#..', '.#.#.', '.#.#.', '#...#', '#...#', '#####', '#...#', '#...#'],
    B: [0, '####.', '#...#', '#...#', '####.', '#...#', '#...#', '#...#', '####.'],
    C: [0, '.###.', '#...#', '#....', '#....', '#....', '#....', '#...#', '.###.'],
    D: [0, '###..', '#..#.', '#...#', '#...#', '#...#', '#...#', '#..#.', '###..'],
    E: [0, '#####', '#....', '#....', '####.', '#....', '#....', '#....', '#####'],
    F: [0, '#####', '#....', '#....', '####.', '#....', '#....', '#....', '#....'],
    G: [0, '.###.', '#...#', '#....', '#....', '#..##', '#...#', '#...#', '.###.'],
    H: [0, '#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#', '#...#'],
    I: [0, '#', '#', '#', '#', '#', '#', '#', '#'],
    J: [0, '...#', '...#', '...#', '...#', '...#', '#..#', '#..#', '.##.'],
    K: [0, '#...#', '#..#.', '#.#..', '##...', '##...', '#.#..', '#..#.', '#...#'],
    L: [0, '#...', '#...', '#...', '#...', '#...', '#...', '#...', '####'],
    M: [0, '#.....#', '##...##', '#.#.#.#', '#..#..#', '#.....#', '#.....#', '#.....#', '#.....#'],
    N: [0, '#...#', '##..#', '##..#', '#.#.#', '#.#.#', '#..##', '#..##', '#...#'],
    O: [0, '.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    P: [0, '####.', '#...#', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    Q: [0, '.###.', '#...#', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
    R: [0, '####.', '#...#', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    S: [0, '.###.', '#...#', '#....', '.###.', '....#', '....#', '#...#', '.###.'],
    T: [0, '#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    U: [0, '#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    V: [0, '#...#', '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..', '..#..'],
    W: [0, '#.....#', '#.....#', '#.....#', '#..#..#', '#..#..#', '#.#.#.#', '##...##', '#.....#'],
    X: [0, '#...#', '#...#', '.#.#.', '..#..', '..#..', '.#.#.', '#...#', '#...#'],
    Y: [0, '#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..', '..#..'],
    Z: [0, '#####', '....#', '...#.', '..#..', '..#..', '.#...', '#....', '#####'],
    a: [2, '.###.', '....#', '.####', '#...#', '#...#', '.####'],
    b: [0, '#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#', '####.'],
    c: [2, '.###', '#...', '#...', '#...', '#...', '.###'],
    d: [0, '....#', '....#', '.####', '#...#', '#...#', '#...#', '#...#', '.####'],
    e: [2, '.###.', '#...#', '#####', '#....', '#...#', '.###.'],
    f: [0, '.##', '#..', '###', '#..', '#..', '#..', '#..', '#..'],
    g: [2, '.####', '#...#', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
    h: [0, '#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#', '#...#'],
    i: [0, '#', '.', '#', '#', '#', '#', '#', '#'],
    j: [0, '.#', '..', '.#', '.#', '.#', '.#', '.#', '.#', '.#', '#.'],
    k: [0, '#...', '#...', '#..#', '#.#.', '##..', '##..', '#.#.', '#..#'],
    l: [0, '#', '#', '#', '#', '#', '#', '#', '#'],
    m: [2, '###.##.', '#..#..#', '#..#..#', '#..#..#', '#..#..#', '#..#..#'],
    n: [2, '####.', '#...#', '#...#', '#...#', '#...#', '#...#'],
    o: [2, '.###.', '#...#', '#...#', '#...#', '#...#', '.###.'],
    p: [2, '####.', '#...#', '#...#', '#...#', '#...#', '####.', '#....', '#....'],
    q: [2, '.####', '#...#', '#...#', '#...#', '#...#', '.####', '....#', '....#'],
    r: [2, '#.#', '##.', '#..', '#..', '#..', '#..'],
    s: [2, '.###', '#...', '##..', '..##', '...#', '###.'],
    t: [1, '.#.', '###', '.#.', '.#.', '.#.', '.#.', '..#'],
    u: [2, '#...#', '#...#', '#...#', '#...#', '#...#', '.####'],
    v: [2, '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
    w: [2, '#.....#', '#.....#', '#..#..#', '#..#..#', '#.#.#.#', '.#...#.'],
    x: [2, '#...#', '.#.#.', '..#..', '..#..', '.#.#.', '#...#'],
    y: [2, '#...#', '#...#', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
    z: [2, '#####', '...#.', '..#..', '.#...', '#....', '#####'],
    0: [0, '.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    1: [0, '..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    2: [0, '.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
    3: [0, '.###.', '#...#', '....#', '..##.', '....#', '....#', '#...#', '.###.'],
    4: [0, '...#.', '..##.', '.#.#.', '#..#.', '#..#.', '#####', '...#.', '...#.'],
    5: [0, '#####', '#....', '#....', '####.', '....#', '....#', '#...#', '.###.'],
    6: [0, '.###.', '#...#', '#....', '####.', '#...#', '#...#', '#...#', '.###.'],
    7: [0, '#####', '....#', '...#.', '...#.', '..#..', '..#..', '.#...', '.#...'],
    8: [0, '.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '#...#', '.###.'],
    9: [0, '.###.', '#...#', '#...#', '#...#', '.####', '....#', '#...#', '.###.'],
    ' ': [0, '..'],
    '.': [7, '#'],
    ',': [6, '.#', '.#', '#.'],
    ':': [2, '#', '.', '.', '.', '.', '#'],
    "'": [0, '#', '#', '#'],
    '-': [4, '####'],
    '_': [8, '#####'],
    '>': [1, '#...', '.#..', '..#.', '...#', '..#.', '.#..', '#...'],
    '<': [1, '...#', '..#.', '.#..', '#...', '.#..', '..#.', '...#'],
    '\\': [0, '#...', '#...', '.#..', '.#..', '..#.', '..#.', '...#', '...#'],
    '/': [0, '...#', '...#', '..#.', '..#.', '.#..', '.#..', '#...', '#...'],
    '(': [0, '..#', '.#.', '#..', '#..', '#..', '#..', '#..', '#..', '.#.', '..#'],
    ')': [0, '#..', '.#.', '..#', '..#', '..#', '..#', '..#', '..#', '.#.', '#..'],
    '%': [0, '.##...#', '#..#.#.', '.##.#..', '....#..', '...#...', '..#.##.', '.#.#..#', '#...##.'],
    '!': [0, '#', '#', '#', '#', '#', '#', '.', '#'],
    '?': [0, '.###.', '#...#', '....#', '...#.', '..#..', '..#..', '.....', '..#..'],
  };
  const glyphW = (ch) => GL[ch][1].length;
  const pxSupported = (s) => { for (const ch of s) if (!GL[ch]) return false; return true; };
  // bold: 0 regular, 1 bold (double-struck, +1px tracking), 2 bold double-struck at regular tracking
  function pxWidth(s, bold) { let w = 0; for (const ch of s) w += glyphW(ch) + 1 + (bold === 1 ? 1 : 0); return Math.max(0, w - 1 + (bold === 2 ? 1 : 0)); }
  // one atlas per colour (glyphs side by side, 10px tall), drawn once and blitted per glyph
  const ATL = new Map(); let ATL_X = null;
  function atlas(col) {
    let a = ATL.get(col);
    if (a) return a;
    if (!ATL_X) { ATL_X = {}; let x = 0; for (const ch in GL) { ATL_X[ch] = x; x += glyphW(ch) + 1; } ATL_X.__w = x; }
    a = H.layer(ATL_X.__w, 10); const g = a.getContext('2d'); g.fillStyle = col;
    for (const ch in GL) {
      const [top, ...rows] = GL[ch], ox = ATL_X[ch];
      rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') g.fillRect(ox + i, top + j, 1, 1); });
    }
    ATL.set(col, a); return a;
  }
  function pxText(c, s, x, y, bold, col, align) {
    const w = pxWidth(s, bold);
    let dx = Math.round(x);
    if (align === 'center') dx = Math.round(x - w / 2);
    if (align === 'right') dx = Math.round(x - w);
    const a = atlas(col), by = Math.round(y) - 8;
    for (const ch of s) {
      const gw = glyphW(ch), sx = ATL_X[ch];
      if (ch !== ' ') { c.drawImage(a, sx, 0, gw, 10, dx, by, gw, 10); if (bold) c.drawImage(a, sx, 0, gw, 10, dx + 1, by, gw, 10); }
      dx += gw + 1 + (bold === 1 ? 1 : 0);
    }
    return w;
  }

  // Aliased bitmap-ish text: draw antialiased into a scratch canvas, threshold alpha -> hard pixels.
  let scratch = null;
  function ptext(c, s, x, y, font, col, align = 'left', thr = 120) {
    // the 9px UI faces use the bitmap system font; larger display text is Inter, hard-thresholded
    if ((font === SYS || font === SYSB || font === START) && pxSupported(s)) return pxText(c, s, x, y, font === SYS ? 0 : font === SYSB ? 1 : 2, col, align);
    if (!scratch) scratch = H.layer(320, 40);
    const sx = scratch.getContext('2d', { willReadFrequently: true });
    sx.font = font;
    const w = Math.ceil(sx.measureText(s).width) + 4, h = 40;
    if (scratch.width < w) { scratch.width = w; }
    sx.clearRect(0, 0, scratch.width, scratch.height);
    sx.font = font; sx.textBaseline = 'alphabetic'; sx.fillStyle = col; sx.fillText(s, 2, 30);
    const img = sx.getImageData(0, 0, w, h), d = img.data;
    const [r, g, b] = H.hex(col);
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > thr) { d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255; } else d[i + 3] = 0;
    }
    sx.putImageData(img, 0, 0);
    let dx = x - 2;
    if (align === 'center') dx = Math.round(x - (w - 4) / 2) - 2;
    if (align === 'right') dx = x - (w - 4) - 2;
    c.drawImage(scratch, 0, 0, w, h, Math.round(dx), Math.round(y - 30), w, h);
    return w - 4;
  }
  const F = (wt, px) => `${wt} ${px}px "Inter"`;
  const SYS = F(400, 9), SYSB = F(700, 9), START = F(800, 9.5);

  // ---------- pixel icons (32x32 unless noted) ----------
  function iconComputer(c, x, y) {
    rect(c, x + 5, y + 2, 22, 18, '#000'); rect(c, x + 6, y + 3, 20, 16, '#c8c4b4');
    rect(c, x + 8, y + 5, 16, 11, '#000'); rect(c, x + 9, y + 6, 14, 9, C.teal);
    rect(c, x + 10, y + 7, 5, 1, '#9ff'); rect(c, x + 10, y + 9, 8, 1, '#9ff'); rect(c, x + 10, y + 11, 6, 1, '#9ff');
    rect(c, x + 11, y + 20, 10, 2, '#000'); rect(c, x + 12, y + 20, 8, 1, '#a8a494');
    rect(c, x + 3, y + 22, 26, 7, '#000'); rect(c, x + 4, y + 23, 24, 5, '#c8c4b4');
    rect(c, x + 6, y + 25, 9, 1, '#000'); rect(c, x + 22, y + 25, 3, 1, '#0a0');
    rect(c, x + 4, y + 27, 24, 1, '#8a8678');
  }
  function iconBin(c, x, y) {
    rect(c, x + 8, y + 4, 16, 2, '#000'); rect(c, x + 9, y + 3, 14, 1, '#000');
    rect(c, x + 9, y + 6, 14, 22, '#000'); rect(c, x + 10, y + 6, 12, 21, '#e0e0e0');
    for (let i = 0; i < 4; i++) rect(c, x + 11 + i * 3, y + 8, 1, 18, '#808080');
    rect(c, x + 10, y + 6, 12, 1, '#fff');
    // crumpled paper peeking
    rect(c, x + 12, y + 1, 5, 3, '#fff'); rect(c, x + 12, y + 1, 5, 1, '#888');
  }
  function iconFolder(c, x, y, open) {
    rect(c, x + 3, y + 7, 11, 3, '#000'); rect(c, x + 4, y + 8, 9, 2, '#ffff80');
    rect(c, x + 3, y + 10, 26, 17, '#000'); rect(c, x + 4, y + 11, 24, 15, '#e8d050');
    rect(c, x + 4, y + 11, 24, 1, '#ffff9c'); rect(c, x + 4, y + 25, 24, 1, '#a08820');
    if (open) { rect(c, x + 8, y + 13, 18, 3, '#fff'); rect(c, x + 8, y + 13, 18, 1, '#888'); }
  }
  function iconNetwork(c, x, y) {
    // globe
    const g = [[10, 2, 12], [7, 3, 18], [6, 4, 20], [5, 5, 22], [5, 6, 22], [4, 7, 24], [4, 8, 24], [4, 9, 24], [4, 10, 24], [4, 11, 24], [5, 12, 22], [5, 13, 22], [6, 14, 20], [7, 15, 18], [10, 16, 12]];
    for (const [a, yy, w] of g) { rect(c, x + a, y + yy, w, 1, '#1060d0'); }
    const land = [[9, 4, 5], [8, 5, 7], [9, 6, 8], [10, 7, 6], [11, 8, 4], [18, 6, 5], [17, 7, 8], [18, 8, 9], [19, 9, 7], [20, 10, 5], [12, 11, 3], [12, 12, 4], [13, 13, 3]];
    for (const [a, yy, w] of land) rect(c, x + a, y + yy, w, 1, '#20a040');
    // two little computers + cable
    rect(c, x + 1, y + 19, 10, 8, '#000'); rect(c, x + 2, y + 20, 8, 5, C.teal); rect(c, x + 0, y + 27, 12, 3, '#000'); rect(c, x + 1, y + 28, 10, 1, '#c8c4b4');
    rect(c, x + 21, y + 19, 10, 8, '#000'); rect(c, x + 22, y + 20, 8, 5, C.teal); rect(c, x + 20, y + 27, 12, 3, '#000'); rect(c, x + 21, y + 28, 10, 1, '#c8c4b4');
    rect(c, x + 11, y + 28, 10, 1, '#000'); rect(c, x + 15, y + 17, 1, 11, '#000');
  }
  function iconDoc(c, x, y) {
    rect(c, x + 7, y + 2, 16, 27, '#000'); rect(c, x + 8, y + 3, 14, 25, '#fff');
    rect(c, x + 18, y + 2, 5, 5, C.teal); rect(c, x + 18, y + 3, 4, 4, '#fff'); rect(c, x + 18, y + 6, 5, 1, '#000'); rect(c, x + 22, y + 2, 1, 5, '#000');
    for (let i = 0; i < 8; i++) rect(c, x + 10, y + 9 + i * 2, i % 3 === 2 ? 7 : 10, 1, '#000080');
  }
  function iconBrainExe(c, x, y, s = 1) { // 16x16 app icon (pink brain on a window), scaled by s
    const R = (a, b, w, h, col) => rect(c, x + a * s, y + b * s, w * s, h * s, col);
    R(0, 1, 16, 14, '#000'); R(1, 2, 14, 12, '#fff'); R(1, 2, 14, 2, C.navy);
    const pts = [[4, 6, 8], [3, 7, 10], [3, 8, 10], [3, 9, 10], [4, 10, 9], [5, 11, 3], [9, 11, 3]];
    for (const [a, b, w] of pts) R(a, b, w, 1, '#ff80c0');
    R(8, 6, 1, 5, '#c0407f'); R(5, 8, 2, 1, '#c0407f'); R(10, 7, 2, 1, '#c0407f'); R(4, 6, 8, 1, '#c0407f');
  }
  function iconError(c, x, y) { // 32x32 red circle with white X
    for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) {
      const dx = i - 15.5, dy = j - 15.5, d = Math.hypot(dx, dy);
      if (d < 14.6) {
        const k = Math.abs(dx + dy) < 2.3 || Math.abs(dx - dy) < 2.3;
        rect(c, x + i, y + j, 1, 1, k && d < 9.5 ? '#fff' : '#ff0000');
      } else if (d < 15.6) rect(c, x + i, y + j, 1, 1, '#000');
      else if (d < 16.8 && dx > 0 && dy > 0) rect(c, x + i + 1, y + j + 1, 1, 1, '#808080');
    }
  }
  function flag(c, x, y) { // generic waving 4-pane flag (14x12)
    const cols = ['#ff0000', '#00c000', '#0000ff', '#ffff00'];
    for (let q = 0; q < 4; q++) {
      const ox = (q % 2) * 7, oy = (q >> 1) * 6;
      for (let i = 0; i < 6; i++) { const wob = Math.round(Math.sin((ox + i) * 0.45) * 1); rect(c, x + ox + i, y + oy + wob, 1, 5, cols[q]); }
    }
    // speed trails
    rect(c, x - 4, y + 2, 3, 1, '#000'); rect(c, x - 5, y + 5, 4, 1, '#000'); rect(c, x - 4, y + 8, 3, 1, '#000');
  }

  function cursorArrow(c, x, y) {
    const rows = ['X', 'XX', 'XOX', 'XOOX', 'XOOOX', 'XOOOOX', 'XOOOOOX', 'XOOOOOOX', 'XOOOOOOOX', 'XOOOOOOOOX', 'XOOOOOXXXXX', 'XOOXOOX', 'XOX XOOX', 'XX  XOOX', 'X    XOOX', '     XOOX', '      XX'];
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { if (r[i] === 'X') rect(c, x + i, y + j, 1, 1, '#000'); else if (r[i] === 'O') rect(c, x + i, y + j, 1, 1, '#fff'); } });
  }
  function cursorHourglass(c, x, y) {
    const rows = ['XXXXXXXXXXX', 'XOOOOOOOOOX', 'XXXXXXXXXXX', ' XOOOOOOOX', ' XOXOXOXOX', ' XOOXOXOOX', '  XOOXOOX', '   XOXOX', '    XOX', '   XOOOX', '  XOOXOOX', ' XOOOOOOOX', ' XOOXOXOOX', ' XOXOXOXOX', 'XXXXXXXXXXX', 'XOOOOOOOOOX', 'XXXXXXXXXXX'];
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { if (r[i] === 'X') rect(c, x + i, y + j, 1, 1, '#000'); else if (r[i] === 'O') rect(c, x + i, y + j, 1, 1, '#fff'); } });
  }

  // ---------- window chrome ----------
  function titleButtons(c, x, y, closeOnly) {
    const bw = 14, bh = 12;
    const drawB = (bx, glyph) => {
      rect(c, bx, y, bw, bh, C.face); bevel(c, bx, y, bw, bh, 'button');
      c.fillStyle = '#000';
      if (glyph === 'x') { for (let i = 0; i < 6; i++) { c.fillRect(bx + 4 + i, y + 3 + i, 2, 1); c.fillRect(bx + 9 - i, y + 3 + i, 2, 1); } }
      if (glyph === '_') c.fillRect(bx + 4, y + 8, 6, 2);
      if (glyph === 'o') { c.fillRect(bx + 3, y + 2, 9, 2); c.fillRect(bx + 3, y + 2, 1, 8); c.fillRect(bx + 11, y + 2, 1, 8); c.fillRect(bx + 3, y + 9, 9, 1); }
    };
    let bx = x - bw;
    drawB(bx, 'x');
    if (!closeOnly) { bx -= bw + 2; drawB(bx, 'o'); bx -= bw; drawB(bx, '_'); }
  }
  function windowFrame(c, x, y, w, h, title, active, opts = {}) {
    rect(c, x, y, w, h, C.face); bevel(c, x, y, w, h, 'window');
    const tx = x + 3, ty = y + 3, tw = w - 6, th = 16;
    rect(c, tx, ty, tw, th, active ? C.navy : C.sh); // Win95 caption bars are solid (gradients arrived with Win98)
    let lx = tx + 3;
    if (opts.icon) { opts.icon(c, tx + 2, ty + 1, 0.875); lx += 17; }
    ptext(c, title, lx, ty + 12, SYSB, active ? '#ffffff' : '#c0c0c0');
    titleButtons(c, x + w - 5, ty + 2, opts.closeOnly);
    return { x: x + 4, y: y + 4 + th + 1, w: w - 8, h: h - 8 - th - 1 };
  }
  function button(c, x, y, w, h, label, def, pressed) {
    rect(c, x, y, w, h, C.face);
    if (def) { rect(c, x, y, w, h, '#000'); rect(c, x + 1, y + 1, w - 2, h - 2, C.face); bevel(c, x + 1, y + 1, w - 2, h - 2, pressed ? 'pressed' : 'button'); }
    else bevel(c, x, y, w, h, pressed ? 'pressed' : 'button');
    ptext(c, label, x + w / 2 + (pressed ? 1 : 0), y + h / 2 + 4 + (pressed ? 1 : 0), SYS, '#000', 'center');
    if (def) { // focus rect (dotted)
      c.fillStyle = '#000';
      for (let i = x + 4; i < x + w - 4; i += 2) { c.fillRect(i, y + 4, 1, 1); c.fillRect(i, y + h - 5, 1, 1); }
      for (let j = y + 4; j < y + h - 4; j += 2) { c.fillRect(x + 4, j, 1, 1); c.fillRect(x + w - 5, j, 1, 1); }
    }
  }
  function etched(c, x, y, w) { rect(c, x, y, w, 1, C.sh); rect(c, x, y + 1, w, 1, C.hi); }

  // ---------- scene pieces ----------
  function desktopIcon(c, x, y, drawIcon, label, selected) {
    drawIcon(c, x + 14, y);
    const lines = label.split('\n');
    lines.forEach((ln, i) => {
      if (selected) {
        const w = pxWidth(ln, 0) + 4;
        rect(c, Math.round(x + 30 - w / 2), y + 33 + i * 11, w, 11, C.navy);
      }
      ptext(c, ln, x + 30, y + 42 + i * 11, SYS, '#fff', 'center');
    });
  }

  function explorerWindow(c, x, y, w, h) {
    const r = windowFrame(c, x, y, w, h, 'Neural Net', false, { icon: (cc, a, b) => iconFolderSmall(cc, a, b) });
    // menu bar
    let mx = r.x + 6;
    for (const m of ['File', 'Edit', 'View', 'Help']) { const ww = ptext(c, m, mx, r.y + 10, SYS, '#000'); rect(c, mx, r.y + 11, 5, 1, '#000'); mx += ww + 12; }
    // client area
    const cy = r.y + 15, ch = r.h - 15 - 18;
    rect(c, r.x, cy, r.w, ch, '#fff'); bevel(c, r.x, cy, r.w, ch, 'field');
    const items = [['weights.dat', iconDoc], ['tokens', iconFolder], ['brain.exe', (cc, a, b) => iconBrainExe(cc, a + 4, b + 4, 1.5)], ['dreams', iconFolder], ['memory.bak', iconDoc], ['prompts', iconFolder]];
    items.forEach(([name, ic], i) => {
      const ix = r.x + 8 + (i % 6) * 54, iy = cy + 6;
      ic(c, ix + 11, iy);
      ptext(c, name, ix + 27, iy + 42, SYS, '#000', 'center');
    });
    // status bar
    const sy = r.y + r.h - 16;
    rect(c, r.x, sy, 120, 15, C.face); bevel(c, r.x, sy, 120, 15, 'thin');
    rect(c, r.x + 122, sy, r.w - 122, 15, C.face); bevel(c, r.x + 122, sy, r.w - 122, 15, 'thin');
    ptext(c, '6 object(s)', r.x + 4, sy + 11, SYS, '#000');
    ptext(c, '1.44GB', r.x + 126, sy + 11, SYS, '#000');
  }
  function iconFolderSmall(c, x, y) {
    rect(c, x + 1, y + 2, 6, 2, '#000'); rect(c, x + 1, y + 4, 13, 9, '#000'); rect(c, x + 2, y + 5, 11, 7, '#e8d050'); rect(c, x + 2, y + 3, 4, 1, '#ffff80');
  }

  function wizardWindow(c, x, y, w, h, t, active) {
    const r = windowFrame(c, x, y, w, h, 'AI Assistant Setup Wizard', active, { closeOnly: true, icon: (cc, a, b) => iconBrainExe(cc, a, b, 0.875) });
    // left bitmap panel
    const px = r.x + 8, py = r.y + 8, pw = 116, ph = r.h - 52;
    rect(c, px - 1, py - 1, pw + 2, ph + 2, '#808080');
    // dithered navy->teal gradient (ordered 2x2 dither between bands)
    const bands = ['#000080', '#00007f', '#0000a8', '#0010c0', '#0040c0', '#0070b0', '#008080', '#10a0a0'];
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i += 1) {
      const f = (j / ph) * (bands.length - 1);
      const k = Math.floor(f), fr = f - k;
      const bay = [[0, 0.5], [0.75, 0.25]][j & 1][i & 1];
      c.fillStyle = bands[Math.min(bands.length - 1, k + (fr > bay ? 1 : 0))];
      c.fillRect(px + i, py + j, 1, 1);
    }
    // stars / sparkle pixels
    const rr = H.rng(9);
    for (let i = 0; i < 26; i++) { rect(c, px + rr.int(2, pw - 3), py + rr.int(2, ph * 0.55), 1, 1, rr.chance(0.5) ? '#ffffff' : '#80c0ff'); }
    // big monitor with a pixel brain on screen + floppy
    const mx = px + 23, my = py + 18;
    rect(c, mx, my, 70, 56, '#000'); rect(c, mx + 1, my + 1, 68, 54, '#d8d4c4'); rect(c, mx + 1, my + 53, 68, 2, '#8a8678');
    rect(c, mx + 6, my + 6, 58, 40, '#000'); rect(c, mx + 7, my + 7, 56, 38, '#000040');
    // brain pixel art on screen
    const brain = [
      '....XXXX..XXXX....',
      '..XXOOOOXXOOOOXX..',
      '.XOOOPOOOXOPOOOOX.',
      'XOOPPOOOPXOOOPOOOX',
      'XOOOOOPOOXOPOOOPOX',
      'XOPOOOOOPXOOOPOOOX',
      'XOOOPPOOOXOPOOOOOX',
      '.XOOOOOPOXOOOPPOX.',
      '..XXOOOOXXOOOOXX..',
      '....XXXX..XXOX....',
      '............XOX...',
      '.............XX...'];
    const bxo = mx + 35 - 18, byo = my + 13;
    brain.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch === '.') continue; c.fillStyle = ch === 'X' ? '#ff40a0' : ch === 'P' ? '#c03080' : '#ffa0d0'; c.fillRect(bxo + i * 2, byo + j * 2, 2, 2); } });
    // scanline on screen
    const sl = Math.floor((t * 30) % 38);
    rect(c, mx + 7, my + 7 + sl, 56, 1, 'rgba(120,200,255,0.25)');
    rect(c, mx + 26, my + 56, 18, 4, '#000'); rect(c, mx + 14, my + 60, 42, 6, '#000'); rect(c, mx + 15, my + 61, 40, 4, '#d8d4c4');
    rect(c, mx + 58, my + 49, 4, 2, '#00c000');
    // floppy disk
    const fx = px + 10, fy = py + 82;
    rect(c, fx, fy, 30, 30, '#000'); rect(c, fx + 1, fy + 1, 28, 28, '#303040');
    rect(c, fx + 7, fy + 1, 16, 10, '#c0c0c0'); rect(c, fx + 17, fy + 3, 4, 6, '#303040');
    rect(c, fx + 5, fy + 15, 20, 13, '#fff'); for (let i = 0; i < 3; i++) rect(c, fx + 7, fy + 18 + i * 3, 16, 1, '#4060c0');

    // right content
    const cx = px + pw + 14;
    ptext(c, 'Welcome to the AI', cx, r.y + 26, F(800, 15), '#000');
    ptext(c, 'Assistant Setup Wizard', cx, r.y + 44, F(800, 15), '#000');
    const body = ['This will install AI Assistant 1.0', 'on your computer. It is strongly', 'recommended that you exit all', 'other programs before continuing.'];
    body.forEach((l, i) => ptext(c, l, cx, r.y + 66 + i * 12, SYS, '#000'));
    ptext(c, 'Copying files...', cx, r.y + 128, SYS, '#000');
    const files = ['C:\\WINDOWS\\SYSTEM\\NEURONS.DLL', 'C:\\WINDOWS\\SYSTEM\\SYNAPSE.VXD', 'C:\\AI\\WEIGHTS\\LAYER_042.DAT', 'C:\\AI\\TOKENS\\VOCAB.TXT'];
    ptext(c, files[Math.floor(Math.min(t, 3.3) * 4.4) % files.length], cx, r.y + 141, SYS, '#000');
    // progress bar
    const bx = cx, by = r.y + 149, bw = r.x + r.w - 10 - cx, bh = 16;
    rect(c, bx, by, bw, bh, C.face); bevel(c, bx, by, bw, bh, 'field');
    const pct = 0.04 + 0.57 * H.clamp((t - 1.9) / 1.4); // ticks up, then freezes when the app hangs
    const blocks = Math.floor(((bw - 6) * pct) / 9);
    for (let i = 0; i < blocks; i++) rect(c, bx + 3 + i * 9, by + 3, 7, bh - 6, C.navy);
    ptext(c, Math.round(pct * 100) + '% complete', cx, r.y + 180, SYS, '#000');
    // separator + buttons
    etched(c, r.x + 6, r.y + r.h - 34, r.w - 12);
    const byb = r.y + r.h - 27;
    button(c, r.x + r.w - 234, byb, 72, 22, '< Back');
    button(c, r.x + r.w - 160, byb, 72, 22, 'Next >', true);
    button(c, r.x + r.w - 80, byb, 72, 22, 'Cancel');
    return r;
  }

  function errorDialog(c, x, y, active) {
    const w = 262, h = 116;
    const r = windowFrame(c, x, y, w, h, 'BRAIN.EXE', active, { closeOnly: true });
    iconError(c, r.x + 10, r.y + 10);
    ptext(c, 'This program has performed an', r.x + 52, r.y + 20, SYS, '#000');
    ptext(c, 'illegal operation and will be', r.x + 52, r.y + 32, SYS, '#000');
    ptext(c, 'shut down.', r.x + 52, r.y + 44, SYS, '#000');
    ptext(c, 'Reason: became self-aware.', r.x + 52, r.y + 60, SYS, '#000');
    button(c, r.x + r.w - 160, r.y + r.h - 28, 72, 22, 'Close', true);
    button(c, r.x + r.w - 82, r.y + r.h - 28, 74, 22, 'Details >>');
  }

  function taskbar(c, t, open, activeIdx) {
    const ty = BH - 24;
    rect(c, 0, ty, BW, 24, C.face); rect(c, 0, ty, BW, 1, C.lt); rect(c, 0, ty + 1, BW, 1, C.hi);
    // start
    rect(c, 2, ty + 3, 54, 19, C.face); bevel(c, 2, ty + 3, 54, 19, 'button');
    flag(c, 10, ty + 7);
    ptext(c, 'Start', 27, ty + 16, START, '#000');
    // tasks
    const all = [['Neural Net', iconFolderSmall], ['AI Assistant Setup...', (cc, a, b) => iconBrainExe(cc, a, b, 0.875)], ['BRAIN.EXE', null]];
    const tasks = all.slice(0, open).map((tk, i) => [...tk, i === activeIdx]);
    let x = 60;
    for (const [label, ic, active] of tasks) {
      const w = 130;
      if (active) {
        // pressed + dithered checker inside (classic active task look)
        rect(c, x, ty + 3, w, 19, '#fff');
        for (let j = 0; j < 19; j++) for (let i = (j & 1); i < w; i += 2) rect(c, x + i, ty + 3 + j, 1, 1, C.face);
        bevel(c, x, ty + 3, w, 19, 'pressed');
      } else { rect(c, x, ty + 3, w, 19, C.face); bevel(c, x, ty + 3, w, 19, 'button'); }
      if (ic) ic(c, x + 4, ty + 5);
      else { // tiny error icon
        for (let j = 0; j < 14; j++) for (let i = 0; i < 14; i++) { const d = Math.hypot(i - 6.5, j - 6.5); if (d < 6.4) rect(c, x + 4 + i, ty + 6 + j, 1, 1, (Math.abs(i - j) < 1.5 || Math.abs(i + j - 13) < 1.5) && d < 4 ? '#fff' : '#f00'); }
      }
      ptext(c, label, x + 22, ty + 16, active ? SYSB : SYS, '#000');
      x += w + 3;
    }
    // tray
    const trw = 76, trx = BW - trw - 3;
    rect(c, trx, ty + 3, trw, 19, C.face); bevel(c, trx, ty + 3, trw, 19, 'thin');
    // speaker icon
    rect(c, trx + 6, ty + 9, 3, 6, '#000'); rect(c, trx + 9, ty + 7, 1, 10, '#000'); rect(c, trx + 10, ty + 6, 1, 12, '#000'); rect(c, trx + 7, ty + 10, 2, 4, '#808080');
    rect(c, trx + 13, ty + 9, 1, 6, '#808080');
    const mins = 20 + Math.floor(t / 60);
    ptext(c, `4:${String(mins).padStart(2, '0')} PM`, trx + trw - 6, ty + 16, SYS, '#000', 'right');
  }

  // =====================================================================================
  // EXPLAINER: "How does AI learn?" as an "AI Trainer" app. Transitions = windows opening with outline-zoom
  // rectangles and property-sheet tab switches clicked by the cursor. Arrows are dotted pixel lines.
  // =====================================================================================
  const SPR = {
    cat: ['XX........XX', 'XOX......XOX', 'XOOX....XOOX', 'XOOOXXXXOOOX', 'XOOOOOOOOOOX', 'XOKKOOOOKKOX', 'XOKKOOOOKKOX', 'XOOOOPPOOOOX', 'XOOOOOOOOOOX', '.XOOOOOOOOX.', '..XOOOOOOX..', '...XXXXXX...'],
    dog: ['...XXXXXX...', 'XXXOOOOOOXXX', 'XBBOOOOOOBBX', 'XBBOKOOKOBBX', 'XBBOKOOKOBBX', 'XBBOOOOOOBBX', 'XBXOOOOOOXBX', '.XXOOKKOOXX.', '..XOOKKOOX..', '...XOOOOX...', '....XRRX....', '.....XX.....'],
    brain: ['....XXXX..XXXX....', '..XXOOOOXXOOOOXX..', '.XOOOPOOOXOPOOOOX.', 'XOOPPOOOPXOOOPOOOX', 'XOOOOOPOOXOPOOOPOX', 'XOPOOOOOPXOOOPOOOX', 'XOOOPPOOOXOPOOOOOX', '.XOOOOOPOXOOOPPOX.', '..XXOOOOXXOOOOXX..', '....XXXX..XXOX....', '............XOX...', '.............XX...'],
  };
  const SPRCOL = {
    cat: { X: '#000', O: '#ff9a30', K: '#000', P: '#ff6090' },
    dog: { X: '#000', O: '#e8c890', B: '#805020', K: '#000', R: '#ff4060' },
    brain: { X: '#ff40a0', O: '#ffa0d0', P: '#c03080' },
  };
  function sprite(c, name, x, y, s) {
    const cols = SPRCOL[name];
    SPR[name].forEach((row, j) => { for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch === '.') continue; c.fillStyle = cols[ch]; c.fillRect(x + i * s, y + j * s, s, s); } });
  }
  function groupBox(c, x, y, w, h, label) {
    rect(c, x, y + 4, w, 1, C.sh); rect(c, x, y + 5, w, 1, C.hi);
    rect(c, x, y + h - 2, w, 1, C.sh); rect(c, x, y + h - 1, w, 1, C.hi);
    rect(c, x, y + 4, 1, h - 5, C.sh); rect(c, x + 1, y + 5, 1, h - 6, C.hi);
    rect(c, x + w - 2, y + 4, 1, h - 5, C.sh); rect(c, x + w - 1, y + 4, 1, h - 4, C.hi);
    const lw = pxWidth(label, 0) + 6;
    rect(c, x + 8, y, lw, 10, C.face);
    ptext(c, label, x + 11, y + 8, SYS, '#000');
  }
  function dottedArrow(c, pts, prog, col) {
    let total = 0; const seg = [];
    for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(l); total += l; }
    const lim = total * H.clamp(prog);
    c.fillStyle = col;
    let acc = 0, last = pts[0], dir = [1, 0];
    for (let i = 0; i < seg.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      for (let d = 0; d < seg[i]; d += 4) {
        if (acc + d > lim) break;
        const u = d / seg[i]; const x = Math.round(ax + (bx - ax) * u), y = Math.round(ay + (by - ay) * u);
        c.fillRect(x - 1, y - 1, 2, 2); last = [x, y]; dir = [(bx - ax) / seg[i], (by - ay) / seg[i]];
      }
      acc += seg[i];
    }
    if (prog >= 1) { // pixel arrowhead
      const [ex, ey] = pts[pts.length - 1];
      for (let k = 0; k < 7; k++) {
        const bx = ex - dir[0] * k, by = ey - dir[1] * k;
        const px = -dir[1], py = dir[0];
        for (let s = -k; s <= k; s++) c.fillRect(Math.round(bx + px * s * 0.6), Math.round(by + py * s * 0.6), 1, 1);
      }
    }
  }
  function trackbar(c, x, y, w, v, label) {
    ptext(c, label, x - 18, y + 9, SYS, '#000');
    rect(c, x, y + 4, w, 4, '#fff'); bevel(c, x, y + 4, w, 4, 'field');
    for (let i = 0; i <= 10; i++) rect(c, x + 2 + Math.round(i * (w - 4) / 10), y + 18, 1, 3, '#000');
    const tx = Math.round(x + v * (w - 10));
    rect(c, tx, y - 2, 10, 17, C.face); bevel(c, tx, y - 2, 10, 17, 'button');
  }
  function okIcon(c, x, y) { // green circle with white tick, 24px
    for (let j = 0; j < 24; j++) for (let i = 0; i < 24; i++) { const d = Math.hypot(i - 11.5, j - 11.5); if (d < 11) rect(c, x + i, y + j, 1, 1, '#00a000'); else if (d < 12) rect(c, x + i, y + j, 1, 1, '#000'); }
    const tk = [[6, 12], [7, 13], [8, 14], [9, 15], [10, 16], [11, 15], [12, 14], [13, 13], [14, 12], [15, 11], [16, 10], [17, 9], [18, 8]];
    for (const [a, b] of tk) rect(c, x + a, y + b - 1, 2, 3, '#fff');
  }
  function infoIcon(c, x, y) { // white balloon with blue i
    for (let j = 0; j < 26; j++) for (let i = 0; i < 30; i++) { const d = Math.hypot((i - 15) / 15, (j - 12) / 12); if (d < 0.92) rect(c, x + i, y + j, 1, 1, '#fff'); else if (d < 1.0) rect(c, x + i, y + j, 1, 1, '#000'); }
    rect(c, x + 8, y + 22, 4, 6, '#000'); rect(c, x + 9, y + 22, 2, 4, '#fff');
    rect(c, x + 13, y + 5, 4, 3, '#0000ff'); rect(c, x + 13, y + 10, 4, 10, '#0000ff'); rect(c, x + 11, y + 10, 2, 1, '#0000ff'); rect(c, x + 11, y + 19, 8, 1, '#0000ff');
  }
  function qIcon(c, x, y) {
    for (let j = 0; j < 26; j++) for (let i = 0; i < 30; i++) { const d = Math.hypot((i - 15) / 15, (j - 12) / 12); if (d < 0.92) rect(c, x + i, y + j, 1, 1, '#fff'); else if (d < 1.0) rect(c, x + i, y + j, 1, 1, '#000'); }
    rect(c, x + 8, y + 22, 4, 6, '#000'); rect(c, x + 9, y + 22, 2, 4, '#fff');
    ptext(c, '?', x + 15, y + 19, F(800, 17), '#0000ff', 'center');
  }
  function tabs(c, x, y, labels, active, pageW, pageH) {
    // page
    rect(c, x, y + 16, pageW, pageH, C.face);
    rect(c, x, y + 16, pageW, 1, C.hi); rect(c, x, y + 16, 1, pageH, C.hi); rect(c, x + pageW - 1, y + 16, 1, pageH, C.dk); rect(c, x + pageW - 2, y + 17, 1, pageH - 1, C.sh); rect(c, x, y + 16 + pageH - 1, pageW, 1, C.dk); rect(c, x + 1, y + 16 + pageH - 2, pageW - 2, 1, C.sh);
    let tx = x;
    labels.forEach((lab, i) => {
      const w = 74, act = i === active, ty = act ? y : y + 2, th = act ? 18 : 14;
      rect(c, tx, ty, w, th, C.face);
      rect(c, tx + 1, ty, w - 2, 1, C.hi); rect(c, tx, ty + 1, 1, th - 1, C.hi); rect(c, tx + w - 1, ty + 1, 1, th - 1, C.dk); rect(c, tx + w - 2, ty + 1, 1, th - 1, C.sh);
      if (act) rect(c, tx + 1, y + 16, w - 3, 2, C.face);
      ptext(c, lab, tx + w / 2, ty + 11, act ? SYSB : SYS, '#000', 'center');
      tx += w;
    });
  }
  function taskbarEx(c, t, items, activeIdx) {
    const ty = BH - 24;
    rect(c, 0, ty, BW, 24, C.face); rect(c, 0, ty, BW, 1, C.lt); rect(c, 0, ty + 1, BW, 1, C.hi);
    rect(c, 2, ty + 3, 54, 19, C.face); bevel(c, 2, ty + 3, 54, 19, 'button'); flag(c, 10, ty + 7); ptext(c, 'Start', 27, ty + 16, START, '#000');
    let x = 60;
    items.forEach((label, i) => {
      const w = 150, act = i === activeIdx;
      if (act) { rect(c, x, ty + 3, w, 19, '#fff'); for (let j = 0; j < 19; j++) for (let k = (j & 1); k < w; k += 2) rect(c, x + k, ty + 3 + j, 1, 1, C.face); bevel(c, x, ty + 3, w, 19, 'pressed'); }
      else { rect(c, x, ty + 3, w, 19, C.face); bevel(c, x, ty + 3, w, 19, 'button'); }
      iconBrainExe(c, x + 4, ty + 5, 0.875);
      ptext(c, label, x + 22, ty + 16, act ? SYSB : SYS, '#000');
      x += w + 3;
    });
    const trw = 76, trx = BW - trw - 3;
    rect(c, trx, ty + 3, trw, 19, C.face); bevel(c, trx, ty + 3, trw, 19, 'thin');
    ptext(c, '4:21 PM', trx + trw - 6, ty + 16, SYS, '#000', 'right');
  }
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  function zoomRectEx(c, t, from, to, t0, t1) {
    if (t < t0 || t >= t1) return;
    for (let k = 0; k < 3; k++) {
      const p = H.clamp((t - t0) / (t1 - t0) - k * 0.12); if (p <= 0) continue;
      const x = Math.round(H.lerp(from[0], to[0], p)), y = Math.round(H.lerp(from[1], to[1], p)), w = Math.round(H.lerp(from[2], to[2], p)), h = Math.round(H.lerp(from[3], to[3], p));
      c.fillStyle = '#c0c0c0'; c.fillRect(x, y, w, 2); c.fillRect(x, y + h, w, 2); c.fillRect(x, y, 2, h); c.fillRect(x + w, y, 2, h + 2);
    }
  }
  function cursorPath(t, keys) { // keys: [t, x, y]
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, x0, y0] = keys[i], [t1, x1, y1] = keys[i + 1];
      if (t < t1) { const e = H.ease.inOut(H.clamp((t - t0) / (t1 - t0))); return [Math.round(H.lerp(x0, x1, e)), Math.round(H.lerp(y0, y1, e))]; }
    }
    const k = keys[keys.length - 1]; return [k[1], k[2]];
  }

  function explainW95(c, t) {
    rect(c, 0, 0, BW, BH, C.teal);
    const T_MAIN = 1.95, T_TRAIN = 5.95, T_RES = 10.35, T_DONE = 12.75;
    desktopIcon(c, 6, 6, iconComputer, 'My Computer');
    desktopIcon(c, 6, 62, iconBin, 'Recycle Bin');
    desktopIcon(c, 6, 118, iconFolder, 'Training Data');

    // ---- beat 1: the question pops up as a help dialog, then zooms into the main window's title bar ----
    const dlg = [170, 104, 300, 116];
    zoomRectEx(c, t, [4, 338, 54, 18], dlg, 0.05, 0.3);
    if (t >= 0.3 && t < 1.75) {
      const r = windowFrame(c, ...dlg, 'AI Help', true, { closeOnly: true });
      qIcon(c, r.x + 12, r.y + 12);
      ptext(c, 'How does AI learn?', r.x + 56, r.y + 32, F(800, 17), '#000');
      if (t > 0.7) ptext(c, "Let's open the AI Trainer and see.", r.x + 56, r.y + 52, SYS, '#000');
      button(c, r.x + r.w / 2 - 36, r.y + r.h - 30, 72, 22, 'OK', true, t > 1.55);
    }
    zoomRectEx(c, t, dlg, [6, 4, 628, 328], 1.75, T_MAIN);
    let open = t >= T_MAIN;
    let cur;
    if (open) {
      const done = t >= T_DONE;
      const r = windowFrame(c, 6, 4, 628, 328, 'How does AI learn? - AI Trainer', !done, { icon: (cc, a, b) => iconBrainExe(cc, a, b, 0.875) });
      const tab = t < T_TRAIN ? 0 : t < T_RES ? 1 : 2;
      tabs(c, 14, 28, ['1. Data', '2. Train', '3. Results'], tab, 612, 262);
      // status bar
      const sy = 310;
      rect(c, 10, sy, 400, 16, C.face); bevel(c, 10, sy, 400, 16, 'thin');
      rect(c, 413, sy, 217, 16, C.face); bevel(c, 413, sy, 217, 16, 'thin');
      const PX = 14, PY = 44; // page origin
      if (tab === 0) {
        const tl = t - T_MAIN;
        groupBox(c, PX + 10, PY + 10, 250, 196, 'Training data (labelled)');
        const items = [];
        for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) items.push([PX + 24 + i * 58, PY + 30 + j * 58, (i + j) % 2 ? 'dog' : 'cat']);
        items.forEach(([x, y, k], n) => {
          if (tl < 0.15 + n * 0.06) return;
          rect(c, x, y, 34, 34, '#fff'); bevel(c, x, y, 34, 34, 'field');
          sprite(c, k, x + 5, y + 5, 2);
          ptext(c, k, x + 17, y + 46, SYSB, k === 'cat' ? '#a04000' : '#604010', 'center');
        });
        groupBox(c, PX + 400, PY + 10, 200, 196, 'Model');
        const pulse = tl > 1.3 && Math.floor((tl - 1.3) / 0.16) % 2 === 0;
        sprite(c, 'brain', PX + 446, PY + 70, 6);
        if (pulse) { rect(c, PX + 440, PY + 64, 120, 1, '#ff40a0'); rect(c, PX + 440, PY + 141, 120, 1, '#ff40a0'); }
        ptext(c, 'neural network', PX + 500, PY + 166, SYS, '#000', 'center');
        // arrow draws on, then example cards fly along it (copy-dialog style)
        const ap = H.clamp((tl - 0.95) / 0.4);
        if (ap > 0) dottedArrow(c, [[PX + 268, PY + 108], [PX + 392, PY + 108]], ap, '#000080');
        if (ap >= 1) ptext(c, 'train on', PX + 330, PY + 98, SYSB, '#000080', 'center');
        if (tl > 1.3 && tl < 3.9) {
          for (let f = 0; f < 4; f++) {
            const ft = ((tl - 1.3) - f * 0.16) % 0.64; if (tl - 1.3 < f * 0.16) continue;
            const p = Math.floor((ft / 0.64) * 12) / 12; // stepped flight
            const k = Math.floor((tl - 1.3 - f * 0.16) / 0.64) * 4 + f;
            const [sx0, sy0, kind] = items[k % items.length];
            const ex = PX + 470, ey = PY + 90;
            const x = Math.round(H.lerp(sx0, ex, p)), y = Math.round(H.lerp(sy0, ey, p) - Math.sin(p * Math.PI) * 40);
            rect(c, x, y, 34, 34, '#fff'); rect(c, x, y, 34, 1, '#000'); rect(c, x, y + 33, 34, 1, '#000'); rect(c, x, y, 1, 34, '#000'); rect(c, x + 33, y, 1, 34, '#000');
            sprite(c, kind, x + 5, y + 5, 2);
            ptext(c, kind, x + 17, y + 46, SYSB, '#000080', 'center');
          }
        }
        const n = 1e6 * H.ease.inOut(H.clamp((tl - 1.3) / 2.4));
        if (tl > 1.2) {
          rect(c, PX + 262, PY + 132, 136, 62, '#fff'); bevel(c, PX + 262, PY + 132, 136, 62, 'field');
          ptext(c, fmt(n), PX + 330, PY + 163, F(800, 22), '#000080', 'center');
          ptext(c, 'examples', PX + 330, PY + 184, SYSB, '#000', 'center');
        }
        ptext(c, tl > 1.2 ? `Loading examples... ${fmt(n)} of 1,000,000` : 'Ready', 14, sy + 12, SYS, '#000');
        const pb = H.clamp((tl - 1.3) / 2.4), blocks = Math.floor((205 * pb) / 9);
        for (let i = 0; i < blocks; i++) rect(c, 418 + i * 9, sy + 3, 7, 10, C.navy);
        cur = cursorPath(t, [[T_MAIN, 330, 250], [3.5, 330, 230], [5.5, 110, 36], [5.9, 110, 36]]);
      } else if (tab === 1) {
        const tl = t - T_TRAIN;
        groupBox(c, PX + 10, PY + 10, 150, 160, 'New picture');
        rect(c, PX + 26, PY + 30, 116, 116, '#fff'); bevel(c, PX + 26, PY + 30, 116, 116, 'field');
        sprite(c, 'cat', PX + 36, PY + 40, 8);
        groupBox(c, PX + 210, PY + 10, 180, 160, 'Model');
        sprite(c, 'brain', PX + 246, PY + 26, 6);
        const adjP = H.clamp((tl - 2.6) / 0.6), stepA = Math.floor(adjP * 6) / 6;
        const ws = [[0.2, 0.7], [0.75, 0.35], [0.4, 0.9]];
        ws.forEach(([a, b], i) => trackbar(c, PX + 250, PY + 104 + i * 22, 120, H.lerp(a, b, stepA), 'w' + (i + 1)));
        if (adjP > 0 && adjP < 1) { const hl = Math.floor(tl * 10) % 2; if (hl) { rect(c, PX + 228, PY + 98, 154, 1, '#ff0000'); rect(c, PX + 228, PY + 166, 154, 1, '#ff0000'); } }
        groupBox(c, PX + 440, PY + 10, 160, 160, 'Guess');
        // arrows
        const a1 = H.clamp((tl - 0.15) / 0.3), a2 = H.clamp((tl - 0.5) / 0.3);
        if (a1 > 0) dottedArrow(c, [[PX + 164, PY + 88], [PX + 206, PY + 88]], a1, '#000080');
        if (a2 > 0) dottedArrow(c, [[PX + 394, PY + 60], [PX + 436, PY + 60]], a2, '#000080');
        const step = tl < 0.7 ? -1 : tl < 1.6 ? 0 : tl < 2.0 ? 1 : tl < 3.25 ? 2 : tl < 3.8 ? 0 : 1;
        const gx = PX + 520;
        if (tl > 0.95 && tl < 3.25) {
          ptext(c, 'dog?', gx, PY + 62, F(800, 22), '#c00000', 'center');
          if (tl > 1.6) {
            iconError(c, gx - 16, PY + 76);
            ptext(c, "Wrong - it's a cat", gx, PY + 126, SYSB, '#000', 'center');
            const bl = tl < 2.2 && Math.floor(tl * 8) % 2 === 0; // emphasis: focus box blinks
            if (bl || tl >= 2.2) { const col = '#ff0000'; rect(c, gx - 44, PY + 36, 88, 2, col); rect(c, gx - 44, PY + 70, 88, 2, col); rect(c, gx - 44, PY + 36, 2, 36, col); rect(c, gx + 42, PY + 36, 2, 36, col); }
          }
        }
        if (tl > 2.0 && tl < 3.25) { // error flows back to the weights
          const e = H.clamp((tl - 2.0) / 0.55);
          dottedArrow(c, [[PX + 520, PY + 150], [PX + 520, PY + 186], [PX + 316, PY + 186], [PX + 316, PY + 174]], e, '#ff0000');
          if (e > 0.3) ptext(c, 'error', PX + 430, PY + 182, SYSB, '#ff0000', 'center');
        }
        if (tl >= 3.4) {
          ptext(c, 'cat', gx, PY + 62, F(800, 22), '#008000', 'center');
          okIcon(c, gx - 12, PY + 80);
          ptext(c, 'Correct!', gx, PY + 126, SYSB, '#008000', 'center');
        }
        // loop diagram: Guess -> Check -> Adjust -> (back)
        const bx = [PX + 140, PX + 270, PX + 400], by = PY + 212;
        ['Guess', 'Check', 'Adjust'].forEach((lab, i) => button(c, bx[i], by, 86, 24, lab, i === step, i === step));
        dottedArrow(c, [[bx[0] + 90, by + 12], [bx[1] - 4, by + 12]], 1, '#000');
        dottedArrow(c, [[bx[1] + 90, by + 12], [bx[2] - 4, by + 12]], 1, '#000');
        dottedArrow(c, [[bx[2] + 90, by + 12], [bx[2] + 110, by + 12], [bx[2] + 110, by - 10], [bx[0] - 20, by - 10], [bx[0] - 20, by + 12], [bx[0] - 4, by + 12]], 1, '#808080');
        ptext(c, 'loop', bx[0] - 44, by + 16, SYS, '#808080', 'center');
        ptext(c, ['Training: guessing...', 'Training: checking answer...', 'Training: adjusting weights...'][Math.max(0, step)], 14, sy + 12, SYS, '#000');
        cur = cursorPath(t, [[T_TRAIN, 110, 36], [7.0, 470, 250], [9.6, 480, 250], [10.2, 186, 36], [10.4, 186, 36]]);
      } else {
        const tl = t - T_RES;
        const gx0 = PX + 40, gy0 = PY + 24, gw = 380, gh = 200;
        rect(c, gx0, gy0, gw, gh, '#fff'); bevel(c, gx0, gy0, gw, gh, 'field');
        for (let i = 1; i < 5; i++) for (let x = gx0 + 3; x < gx0 + gw - 3; x += 3) rect(c, x, gy0 + Math.round(i * gh / 5), 1, 1, '#a0a0a0');
        for (let i = 0; i <= 5; i++) ptext(c, String(50 + i * 10), gx0 - 4, gy0 + gh - Math.round(i * gh / 5) + 3, SYS, '#000', 'right');
        ptext(c, 'Accuracy %', gx0 + 6, gy0 - 4, SYSB, '#000');
        ptext(c, 'Training rounds  >', gx0 + gw / 2, gy0 + gh + 14, SYS, '#000', 'center');
        const pr = H.clamp((tl - 0.3) / 1.6), N = 20;
        const val = (i) => 61 + 36 * (1 - Math.pow(1 - i / (N - 1), 2.2)) + (i % 3 === 1 && i < N - 2 ? -1.5 : 0);
        const nShown = Math.floor(pr * (N - 1)) + 1;
        const P2 = (i) => [gx0 + 6 + Math.round(i * (gw - 12) / (N - 1)), gy0 + gh - Math.round(((val(i) - 50) / 50) * gh)];
        for (let i = 0; i < nShown - 1; i++) {
          const [x0, y0] = P2(i), [x1, y1] = P2(i + 1);
          const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
          for (let k = 0; k <= steps; k++) rect(c, Math.round(H.lerp(x0, x1, k / steps)) - 1, Math.round(H.lerp(y0, y1, k / steps)) - 1, 2, 2, '#008000');
        }
        for (let i = 0; i < nShown; i++) { const [x, y] = P2(i); rect(c, x - 2, y - 2, 5, 5, '#008000'); }
        const acc = Math.round(val(Math.min(N - 1, nShown - 1)));
        const shown = nShown >= N ? 97 : acc;
        groupBox(c, PX + 450, PY + 20, 150, 120, 'Accuracy');
        const hl = tl > 1.95;
        if (hl) { rect(c, PX + 466, PY + 50, 118, 44, C.navy); }
        ptext(c, shown + '%', PX + 525, PY + 86, F(800, 32), hl ? '#fff' : '#000', 'center');
        ptext(c, `round ${Math.min(N, nShown)} of ${N}`, PX + 525, PY + 118, SYS, '#000', 'center');
        ptext(c, 'started at 61%', PX + 525, PY + 130, SYS, '#808080', 'center');
        if (hl) { // tooltip lands on the last point
          const [x, y] = P2(N - 1);
          const tw = 80;
          rect(c, x - tw + 6, y + 14, tw, 18, '#ffffe1'); rect(c, x - tw + 6, y + 14, tw, 1, '#000'); rect(c, x - tw + 6, y + 31, tw, 1, '#000'); rect(c, x - tw + 6, y + 14, 1, 18, '#000'); rect(c, x + 5, y + 14, 1, 18, '#000');
          ptext(c, 'Best: 97%!', x - tw / 2 + 6, y + 27, SYSB, '#000', 'center');
          if (Math.floor(tl * 6) % 2) { rect(c, x - 6, y - 6, 13, 1, '#ff0000'); rect(c, x - 6, y + 6, 13, 1, '#ff0000'); rect(c, x - 6, y - 6, 1, 13, '#ff0000'); rect(c, x + 6, y - 6, 1, 13, '#ff0000'); }
        }
        ptext(c, `Training round ${Math.min(N, nShown)}...`, 14, sy + 12, SYS, '#000');
        const blocks = Math.floor((205 * pr) / 9);
        for (let i = 0; i < blocks; i++) rect(c, 418 + i * 9, sy + 3, 7, 10, C.navy);
        cur = cursorPath(t, [[T_RES, 186, 36], [11.2, 560, 200], [T_DONE, 560, 200], [13.6, 330, 238]]);
      }
      // ---- beat 5: message box ----
      if (done) {
        const mr = windowFrame(c, 150, 120, 340, 132, 'AI Trainer', true, { closeOnly: true });
        infoIcon(c, mr.x + 12, mr.y + 12);
        ptext(c, 'Training complete. The lesson:', mr.x + 56, mr.y + 22, SYS, '#000');
        ptext(c, 'More examples', mr.x + 56, mr.y + 46, F(800, 17), '#000');
        ptext(c, '-> better guesses', mr.x + 56, mr.y + 68, F(800, 17), '#000080');
        button(c, mr.x + mr.w / 2 - 36, mr.y + mr.h - 30, 72, 22, 'OK', true);
      }
      taskbarEx(c, t, ['AI Trainer'], 0);
    } else {
      cur = cursorPath(t, [[0, 400, 300], [1.2, 320, 210], [1.7, 320, 210]]);
      taskbarEx(c, t, t >= 0.3 ? ['AI Help'] : [], 0);
    }
    cursorArrow(c, cur[0], cur[1]);
  }

  // =====================================================================================
  // SOUND: a beige tower under the desk (fan + mains hum), real mouse-button clicks on every cursor click, hard-disk
  // chatter while the examples copy, slider notches, and generic system chimes (made up here, not real OS sounds).
  // All times copy explainW95: T_MAIN 1.95, T_TRAIN 5.95, T_RES 10.35, T_DONE 12.75.
  // =====================================================================================
  function w95Sound(k) {
    const END = 14.6, T_MAIN = 1.95, T_TRAIN = 5.95, T_RES = 10.35, T_DONE = 12.75;
    // mouse button: plastic snap (down) and a lighter release (up)
    const mouse = (t, pan = 0, g = 1) => {
      k.noise(t, { dur: 0.012, filter: 'bandpass', f: 2600, q: 1.6, gain: 0.32 * g, a: 0.0005, pan });
      k.tone(t, { f: [[0, 240], [0.03, 150]], dur: 0.04, gain: 0.1 * g, pan });
      k.noise(t + 0.09, { dur: 0.008, filter: 'bandpass', f: 3200, q: 1.6, gain: 0.16 * g, a: 0.0005, pan });
    };
    // a small soft UI click (buttons changing state, things landing), lower and duller than the mouse
    const soft = (t, f = 1400, g = 1, pan = 0) => k.noise(t, { dur: 0.014, filter: 'bandpass', f, q: 2, gain: 0.2 * g, a: 0.0008, pan, minor: true });
    // generic system chime: soft sine+triangle bell notes with a short tail
    const chime = (t, notes, g = 1, gap = 0.07) => notes.forEach((n, i) => {
      k.tone(t + i * gap, { f: n, dur: 1.1, gain: 0.13 * g, a: 0.004, verb: 0.3 });
      k.tone(t + i * gap, { f: k.hz(n) * 2, type: 'triangle', dur: 0.35, gain: 0.025 * g, a: 0.003, verb: 0.2 });
    });
    // outline-zoom rectangles: a short, low, smooth air sweep (no UI swoosh)
    const zoom = (t, d, up) => k.noise(t, { dur: d + 0.08, color: 'pink', filter: 'bandpass', f: up ? [[0, 300], [d, 900]] : [[0, 900], [d, 300]], q: 0.8, gain: 0.07, a: d * 0.6 });
    // hard-disk chatter: head seeks (dull thunks) and fast little read clicks
    const hdd = (t0, t1, g, seed) => {
      const r = H.rng(seed);
      k.withMinor(() => {
        for (let t = t0; t < t1; t += 0.03 + r() * 0.07) {
          if (r() < 0.22) k.noise(t, { dur: 0.03, color: 'brown', filter: 'bandpass', f: 420, q: 2, gain: 0.5 * g, a: 0.001, pan: 0.35 });
          else k.noise(t, { dur: 0.008, filter: 'bandpass', f: 1700 + r() * 900, q: 4, gain: 0.16 * g * (0.5 + r() * 0.5), a: 0.0005, pan: 0.35 });
        }
      });
    };

    // ---- the PC itself: fan + mains hum under everything
    k.bed('room', 0, END, { gain: 0.6 });
    k.bed('hum', 0, END, { gain: 0.45 });
    k.noise(0, { dur: END, color: 'pink', filter: 'bandpass', f: 520, q: 0.7, gain: 0.025, a: 0.4, hold: END - 0.8, bus: 'amb', minor: true }); // fan air (kept in VO, very low)

    // ---- beat 1: help dialog zooms out of the taskbar and chimes; cursor clicks OK; dialog zooms into the main window
    zoom(0.05, 0.25, true);
    chime(0.3, ['E5', 'B4'], 0.9, 0.11);                // question dialog appears (descending "?" chime)
    mouse(1.55, 0);                                     // OK pressed (button shows pressed at t > 1.55)
    zoom(1.75, T_MAIN - 1.75, true);
    hdd(T_MAIN, T_MAIN + 0.55, 0.9, 951);               // app loading off the disk

    // ---- tab 1: data icons pop in (12 items every 0.06 s from T_MAIN + 0.15; one click per two)
    for (let n = 0; n < 12; n += 2) soft(T_MAIN + 0.15 + n * 0.06, 1300 + n * 30, 0.9, -0.5 + n * 0.04);
    soft(T_MAIN + 1.35, 1100, 0.9, 0.1);               // "train on" arrow completes (tl 0.95..1.35)
    // copying 1,000,000 examples: disk chatter for the whole copy + one tick per progress-bar block (22 blocks, linear)
    const C0 = T_MAIN + 1.3, CL = 2.4;
    hdd(C0, C0 + CL, 1, 952);
    for (let i = 1; i <= 22; i++) k.noise(C0 + CL * (9 * i) / 205, { dur: 0.016, filter: 'bandpass', f: 2300, q: 2.5, gain: 0.13, a: 0.0006, pan: 0.6, minor: true });
    // cards dropping into the model: soft low thup on every other landing (one lands every 0.16 s from C0 + 0.64)
    for (let t = C0 + 0.64; t < T_MAIN + 3.9; t += 0.32) k.tone(t, { f: [[0, 260], [0.06, 140]], dur: 0.08, gain: 0.12, pan: 0.3, minor: true });

    // ---- tab 2: Train. cursor clicks the tab
    mouse(T_TRAIN, -0.4);
    const L = T_TRAIN;
    soft(L + 0.45, 1100, 0.8, -0.2); soft(L + 0.8, 1100, 0.8, 0.3);   // the two arrows complete
    soft(L + 0.7, 1500, 1, -0.2);                                     // Guess button goes down
    k.tone(L + 0.95, { f: [[0, 'G4'], [0.12, 'D4']], type: 'triangle', dur: 0.2, gain: 0.14, pan: 0.4 }); // "dog?" appears
    // CHECK: wrong! a generic system error: low dull two-note thunk + error box
    const WRONG = L + 1.6;
    soft(WRONG, 1500, 1, 0);
    k.play('error', WRONG, { gain: 1.0, f: 'E3', pan: 0.3 });
    k.play('thud', WRONG, { f: 110, gain: 0.45, pan: 0.3 });
    // ADJUST: error signal travels back (right -> left) along the dotted arrow
    soft(L + 2.0, 1500, 1, 0);
    k.tone(L + 2.0, { f: [[0, 520], [0.55, 240]], type: 'triangle', dur: 0.6, gain: 0.07, a: 0.05, hold: 0.4, pan: 0.5, minor: true });
    k.tone(L + 2.0, { f: [[0, 260], [0.55, 120]], type: 'triangle', dur: 0.6, gain: 0.05, a: 0.05, hold: 0.4, pan: -0.2, minor: true });
    // trackbar weights snap in 6 steps over tl 2.6..3.2: one slider notch per step
    for (let s = 1; s <= 6; s++) k.withMinor(() => k.play('tock', L + 2.6 + s * 0.1 - 1e-3, { f: 900 + s * 40, gain: 0.35, pan: -0.1 }));
    // GUESS again -> "cat" + Correct! (the correction)
    soft(L + 3.25, 1500, 1, 0);
    chime(L + 3.4, ['C5', 'E5', 'G5'], 1, 0.08);
    soft(L + 3.8, 1500, 1, 0);                          // Check button

    // ---- tab 3: Results. cursor clicks the tab, then the accuracy plot steps up one point every 1.6/19 s
    mouse(T_RES, -0.2);
    for (let i = 1; i < 20; i++) {
      const t = T_RES + 0.3 + (1.6 * i) / 19;
      k.noise(t, { dur: 0.016, filter: 'bandpass', f: 1500 + i * 45, q: 2.5, gain: 0.15 * (1 - i / 32), a: 0.0006, pan: -0.4 + i * 0.04, minor: true });
    }
    // 97% (biggest moment, tl > 1.95): generic "tada" fanfare, brassy saw through a lowpass, low thump underneath
    const BEST = T_RES + 1.95 + 1e-3;
    k.play('impact', BEST, { f: 120, gain: 0.9 });
    [['C4', 0], ['E4', 0.06], ['G4', 0.12], ['C5', 0.18]].forEach(([n, d]) => {
      k.tone(BEST + d, { f: n, type: 'sawtooth', dur: 0.95 - d, gain: 0.11, a: 0.01, hold: 0.45 - d, filter: 'lowpass', f2: [[0, 900], [0.15, 2400], [0.8, 1200]], verb: 0.3 });
      k.tone(BEST + d, { f: n, type: 'sawtooth', detune: 9, dur: 0.95 - d, gain: 0.08, a: 0.01, hold: 0.45 - d, filter: 'lowpass', f2: 1800, verb: 0.3 });
    });
    k.tone(BEST, { f: 'C3', type: 'triangle', dur: 1.1, gain: 0.28, hold: 0.45 });
    // takeaway message box: soft resolving info chime
    chime(T_DONE, ['G4', 'C5'], 1, 0.12);
    k.tone(T_DONE + 0.12, { f: 'C4', type: 'triangle', dur: 1.3, gain: 0.08, a: 0.01, verb: 0.3 });
  }

  registerStyle({
    id: 'win95',
    name: 'Win95 Desktop',
    category: 'Retro UI & Neon',
    description: 'A mid-90s beige-box desktop at 2x pixel scale: teal wallpaper, 2-pixel bevelled grey chrome, navy title bars, aliased system text and a trail of frozen error dialogs.',
    motion: 'Icons pop onto the desktop, windows open with outline-zoom rectangles, the install bar ticks in blocks then freezes, and the hung error box is dragged, smearing a stair of copies.',
    fonts: ['400 9px "Inter"', '700 9px "Inter"', '800 15px "Inter"', '800 9.5px "Inter"'],
    frameT: 6.3,
    duration: 6.5,
    readsPixels: true,
    explainerDuration: 14.6,
    explainerNote: 'An "AI Trainer" app explains it: the question dialog zooms into the title bar, beats are property-sheet tabs clicked by the cursor, dotted pixel arrows carry examples and the error signal, trackbar "weights" slide, counters live in status bars and group boxes, and the payoff is a classic message box.',
    explainer(ctx, W, H_, t) {
      const buf = H.layer(BW, BH), c = buf.getContext('2d', { willReadFrequently: true });
      c.imageSmoothingEnabled = false;
      explainW95(c, t);
      // camera: frames each beat at 3x pixels (zoom 1.5), pulls back to 2x for window/tab changes, 4x on the 97%
      const K = [[0, 320, 170, 1.5], [1.7, 320, 170, 1.5], [2.05, 320, 180, 1], [2.4, 200, 160, 1.5], [3.3, 200, 160, 1.5], [4.2, 420, 160, 1.5], [5.4, 420, 160, 1.5], [5.75, 320, 180, 1], [6.25, 240, 180, 1.5], [6.9, 240, 180, 1.5], [7.3, 440, 180, 1.5], [8.3, 440, 180, 1.5], [8.6, 360, 182, 1.5], [9.4, 360, 182, 1.5], [9.7, 440, 180, 1.5], [10.05, 320, 180, 1], [10.6, 228, 170, 1.5], [11.9, 228, 170, 1.5], [12.25, 520, 120, 2], [12.6, 520, 120, 2], [12.85, 350, 186, 1.3], [99, 350, 186, 1.3]];
      let cam = K[K.length - 1];
      for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) { const e = H.ease.inOut(H.clamp((t - K[i][0]) / (K[i + 1][0] - K[i][0]))); cam = [0, H.lerp(K[i][1], K[i + 1][1], e), H.lerp(K[i][2], K[i + 1][2], e), H.lerp(K[i][3], K[i + 1][3], e)]; break; }
      const sw = BW / cam[3], sh = BH / cam[3];
      const sx = Math.round(H.clamp(cam[1] - sw / 2, 0, BW - sw)), sy = Math.round(H.clamp(cam[2] - sh / 2, 0, BH - sh));
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buf, sx, sy, sw, sh, 0, 0, W, H_);
    },
    explainerSound(k) { w95Sound(k); },
    draw(ctx, W, H_, t) {
      const buf = H.layer(BW, BH), c = buf.getContext('2d', { willReadFrequently: true });
      c.imageSmoothingEnabled = false;
      rect(c, 0, 0, BW, BH, C.teal);

      // timeline (no easing anywhere except the outline "zoom" rectangles, like the real OS)
      const T_EXP = 1.15, T_WIZ = 1.75, T_ERR = 3.45, T_DRAG = 3.8, STEP = 0.17;
      const icons = [[6, iconComputer, 'My Computer'], [62, iconNetwork, 'Network\nNeighborhood'], [130, iconBin, 'Recycle Bin'], [186, iconFolder, 'Neural Net'], [242, iconDoc, 'README.TXT']];
      icons.forEach(([y, ic, label], i) => { if (t >= 0.25 + i * 0.13) desktopIcon(c, 6, y, ic, label, label === 'Neural Net' && t >= 0.85); });

      const zoomRect = (from, to, t0, t1) => {
        if (t < t0 || t >= t1) return;
        for (let k = 0; k < 3; k++) {
          const p = H.clamp((t - t0) / (t1 - t0) - k * 0.12); if (p <= 0) continue;
          const x = H.lerp(from[0], to[0], p), y = H.lerp(from[1], to[1], p), w = H.lerp(from[2], to[2], p), h = H.lerp(from[3], to[3], p);
          c.fillStyle = '#c0c0c0';
          c.fillRect(Math.round(x), Math.round(y), Math.round(w), 2); c.fillRect(Math.round(x), Math.round(y + h), Math.round(w), 2);
          c.fillRect(Math.round(x), Math.round(y), 2, Math.round(h)); c.fillRect(Math.round(x + w), Math.round(y), 2, Math.round(h) + 2);
        }
      };
      zoomRect([30, 200, 30, 20], [92, 6, 360, 140], 0.9, T_EXP);
      if (t >= T_EXP) explorerWindow(c, 92, 6, 360, 140);
      zoomRect([200, 60, 60, 40], [222, 34, 410, 262], T_WIZ - 0.25, T_WIZ);
      if (t >= T_WIZ) wizardWindow(c, 222, 34, 410, 262, t, t < T_ERR);

      // error dialog: pops up, then gets dragged and the hung app leaves a stair of copies
      const ex = 150, ey = 196, pos = (k) => [ex - k * 15, ey + k * 9];
      let cur = null;
      if (t >= T_ERR) {
        const STEPS = [0, 0.1, 0.28, 0.38, 0.6, 0.72]; // jerky, laggy redraws of a hung app
        let s = 0; for (let k = 1; k < STEPS.length; k++) if (t >= T_DRAG + STEPS[k - 1]) s = k;
        for (let k = 5; k > 5 - s; k--) errorDialog(c, ...pos(k), false);
        cur = pos(5 - s);
        errorDialog(c, ...cur, true);
      }

      // cursor
      if (t < T_WIZ) cursorArrow(c, Math.round(H.lerp(40, 300, H.clamp((t - 0.9) / 0.8))), Math.round(H.lerp(230, 200, H.clamp((t - 0.9) / 0.8))));
      else if (t < T_ERR) cursorHourglass(c, 470, 200);
      else if (t < T_DRAG + 0.95) {
        const p = H.clamp((t - T_ERR) / (T_DRAG - T_ERR));
        const tgt = [cur[0] + 90, cur[1] + 9];
        cursorArrow(c, Math.round(H.lerp(470, tgt[0], p)), Math.round(H.lerp(200, tgt[1], p)));
      } else {
        const p = H.ease.inOut(H.clamp((t - (T_DRAG + 1.15)) / 0.6));
        cursorArrow(c, Math.round(H.lerp(ex + 90, ex + 132, p)), Math.round(H.lerp(ey + 9, ey + 98, p)));
      }

      const open = t >= T_ERR ? 3 : t >= T_WIZ ? 2 : t >= T_EXP ? 1 : 0;
      taskbar(c, t, open, open - 1);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buf, 0, 0, W, H_);
    },
  });
}
