{
  // ---------- 1984 Macintosh / MacPaint: 640x360 1-bit buffer, pixel-doubled to 1280x720 ----------
  const SW = 640, SH = 360;
  const PAT = [ // classic 8x8 MacPaint-style fill patterns (rows as bytes)
    [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], [0x77, 0xdd, 0x77, 0xdd, 0x77, 0xdd, 0x77, 0xdd], [0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55],
    [0x88, 0x22, 0x88, 0x22, 0x88, 0x22, 0x88, 0x22], [0x80, 0x00, 0x08, 0x00, 0x80, 0x00, 0x08, 0x00], [0x80, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00],
    [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80], [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01], [0xff, 0x80, 0x80, 0x80, 0xff, 0x08, 0x08, 0x08],
    [0x88, 0x54, 0x22, 0x45, 0x88, 0x15, 0x22, 0x51], [0xff, 0x00, 0x00, 0x00, 0xff, 0x00, 0x00, 0x00], [0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88],
    [0xff, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80], [0x81, 0x42, 0x24, 0x18, 0x18, 0x24, 0x42, 0x81], [0xf0, 0xf0, 0xf0, 0xf0, 0x0f, 0x0f, 0x0f, 0x0f],
    [0x03, 0x06, 0x0c, 0x18, 0x30, 0x60, 0xc0, 0x81], [0x80, 0x80, 0x41, 0x3e, 0x08, 0x08, 0x14, 0xe3], [0x00, 0x00, 0x88, 0x55, 0x22, 0x00, 0x00, 0x00],
    [0x10, 0x38, 0x7c, 0xfe, 0x7c, 0x38, 0x10, 0x00], [0xee, 0xbb, 0xee, 0xbb, 0xee, 0xbb, 0xee, 0xbb], [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0xcc, 0xcc, 0x33, 0x33, 0xcc, 0xcc, 0x33, 0x33], [0x08, 0x1c, 0x22, 0xc1, 0x80, 0x01, 0x02, 0x04], [0xaa, 0x00, 0xaa, 0x00, 0xaa, 0x00, 0xaa, 0x00],
    [0x11, 0x22, 0x44, 0x88, 0x11, 0x22, 0x44, 0x88], [0xc0, 0xc0, 0x0c, 0x0c, 0xc0, 0xc0, 0x0c, 0x0c], [0x7f, 0x7f, 0x7f, 0x00, 0xf7, 0xf7, 0xf7, 0x00],
    [0x44, 0xaa, 0x11, 0x11, 0x11, 0xaa, 0x44, 0x44], [0x82, 0x44, 0x39, 0x44, 0x82, 0x01, 0x01, 0x01], [0xf8, 0x74, 0x22, 0x47, 0x8f, 0x17, 0x22, 0x71],
    [0x55, 0xa0, 0x40, 0x40, 0x55, 0x0a, 0x04, 0x04], [0x20, 0x50, 0x88, 0x88, 0x88, 0x88, 0x05, 0x02], [0xbf, 0x00, 0xbf, 0xbf, 0xb0, 0xb0, 0xb0, 0xb0],
    [0x18, 0x18, 0xff, 0x18, 0x18, 0x18, 0x18, 0x18], [0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff], [0x22, 0x00, 0x88, 0x00, 0x22, 0x00, 0x88, 0x00],
  ];
  const patBit = (p, x, y) => (PAT[p][y & 7] >> (7 - (x & 7))) & 1;

  // ================= EXPLAINER: "How does AI learn?" told with Finder windows, alerts and MacPaint tools =================
  function macExplainer(ctx, W, H_, t) {
    const B = new Uint8Array(SW * SH);
    const px = (x, y, v = 1) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < SW && y < SH) B[y * SW + x] = v; };
    const inv = (x, y) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < SW && y < SH) B[y * SW + x] ^= 1; };
    const fill = (x, y, w, h, v = 1) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, v); };
    const pfill = (x, y, w, h, p) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, patBit(p, x + i, y + j)); };
    const invRect = (x, y, w, h) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) inv(x + i, y + j); };
    const hl = (x0, x1, y, v = 1) => { for (let x = x0; x <= x1; x++) px(x, y, v); };
    const vl = (x, y0, y1, v = 1) => { for (let y = y0; y <= y1; y++) px(x, y, v); };
    const box = (x, y, w, h, v = 1) => { hl(x, x + w - 1, y, v); hl(x, x + w - 1, y + h - 1, v); vl(x, y, y + h - 1, v); vl(x + w - 1, y, y + h - 1, v); };
    const line = (x0, y0, x1, y1, v = 1, dash = 0) => {
      x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0; let k = 0;
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
      for (;;) { if (!dash || ((k++ / dash) | 0) % 2 === 0) px(x0, y0, v); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
    };
    const thick = (x0, y0, x1, y1, dash = 0) => { line(x0, y0, x1, y1, 1, dash); line(x0 + 1, y0, x1 + 1, y1, 1, dash); line(x0, y0 + 1, x1, y1 + 1, 1, dash); };
    const arrow = (pts, f, dash = 0) => { // polyline drawn on to fraction f, 2px, with head
      let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      let left = L * H.clamp(f), ex = pts[0][0], ey = pts[0][1], ang = 0;
      for (let i = 1; i < pts.length && left > 0; i++) {
        const [ax, ay] = pts[i - 1], [bx, by] = pts[i], d = Math.hypot(bx - ax, by - ay), k = Math.min(1, left / d);
        ex = ax + (bx - ax) * k; ey = ay + (by - ay) * k; ang = Math.atan2(by - ay, bx - ax);
        thick(ax, ay, ex, ey, dash); left -= d;
      }
      if (f > 0.05) { for (let s = -1; s <= 1; s += 2) thick(ex, ey, ex + Math.cos(ang + Math.PI - s * 0.5) * 9, ey + Math.sin(ang + Math.PI - s * 0.5) * 9); }
    };
    const oval = (cx, cy, rx, ry, mode) => {
      for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
        const d = (x * x) / (rx * rx) + (y * y) / (ry * ry); if (d > 1.02) continue;
        const edge = (x * x) / ((rx - 1.5) * (rx - 1.5)) + (y * y) / ((ry - 1.5) * (ry - 1.5)) > 1.0;
        if (edge) px(cx + x, cy + y, 1); else if (mode !== 'line') px(cx + x, cy + y, mode === 'white' ? 0 : patBit(mode, cx + x, cy + y));
      }
    };
    const tl = H.layer(SW, 70), tx = tl.getContext('2d', { willReadFrequently: true });
    const text = (str, x, y, font = '700 13px "Inter"', v = 1, thr = 120) => {
      tx.clearRect(0, 0, SW, 70); tx.font = font; tx.textBaseline = 'top'; tx.fillStyle = '#000'; tx.fillText(str, 1, 2);
      const w = Math.ceil(tx.measureText(str).width) + 3, d = tx.getImageData(0, 0, Math.min(SW, w), 70).data, ww = Math.min(SW, w);
      for (let j = 0; j < 70; j++) for (let i = 0; i < ww; i++) if (d[(j * ww + i) * 4 + 3] > thr) px(x + i - 1, y + j - 2, v);
      return w - 3;
    };
    const tw = (str, font = '700 13px "Inter"') => { tx.font = font; return Math.ceil(tx.measureText(str).width); };
    const ctext = (str, cx, y, font) => text(str, Math.round(cx - tw(str, font) / 2), y, font);
    const ease = (a, d) => H.ease.inOut(H.clamp((t - a) / d));
    const fmt = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const BIG = '800 22px "Inter"', UI = '700 13px "Inter"', SM = '400 11px "Inter"', HUGE = '800 44px "Inter"';

    // ---------- Mac chrome ----------
    const win = (x, y, w, h, title) => {
      fill(x, y, w, h, 0); box(x, y, w, h); hl(x + 1, x + w, y + h); vl(x + w, y + 1, y + h);
      for (let yy = y + 3; yy <= y + 15; yy += 2) hl(x + 2, x + w - 3, yy);
      hl(x, x + w - 1, y + 18);
      fill(x + 8, y + 4, 13, 11, 0); box(x + 9, y + 5, 11, 10);
      const tW = tw(title); fill(Math.round(x + w / 2 - tW / 2 - 8), y + 2, tW + 16, 15, 0); text(title, Math.round(x + w / 2 - tW / 2), y + 3);
    };
    const dialog = (x, y, w, h) => { fill(x, y, w, h, 0); box(x, y, w, h); box(x + 3, y + 3, w - 6, h - 6); box(x + 4, y + 4, w - 8, h - 8); hl(x + 1, x + w, y + h); vl(x + w, y + 1, y + h); };
    const rbox = (x, y, w, h, rad = 6) => { // rounded rect outline
      hl(x + rad, x + w - rad - 1, y); hl(x + rad, x + w - rad - 1, y + h - 1); vl(x, y + rad, y + h - rad - 1); vl(x + w - 1, y + rad, y + h - rad - 1);
      for (let a = 0; a <= Math.PI / 2; a += 0.05) { const dx = Math.round((1 - Math.cos(a)) * rad), dy = Math.round((1 - Math.sin(a)) * rad); px(x + dx, y + dy); px(x + w - 1 - dx, y + dy); px(x + dx, y + h - 1 - dy); px(x + w - 1 - dx, y + h - 1 - dy); }
    };
    const button = (x, y, w, h, label, pressed, dflt) => {
      fill(x + 2, y + 2, w - 4, h - 4, 0); rbox(x, y, w, h, 7); ctext(label, x + w / 2, y + h / 2 - 7, UI);
      if (dflt) { rbox(x - 4, y - 4, w + 8, h + 8, 10); rbox(x - 3, y - 3, w + 6, h + 6, 9); rbox(x - 2, y - 2, w + 4, h + 4, 8); }
      if (pressed) invRect(x + 2, y + 2, w - 4, h - 4);
    };
    const zoom = (src, dst, k) => { const head = Math.floor(H.clamp(k) * 8); for (let i = Math.max(0, head - 3); i <= head; i++) { const f = i / 8, q = src.map((v, j) => Math.round(v + (dst[j] - v) * f)); box(q[0], q[1], q[2], q[3]); } };
    const CUR = ['#.........', '##........', '#o#.......', '#oo#......', '#ooo#.....', '#oooo#....', '#ooooo#...', '#oooooo#..', '#ooooooo#.', '#oooo#####', '#oo#o#....', '#o#.#o#...', '##..#o#...', '.....#o#..', '.....#o#..', '......##..'];
    const cursor = (x, y) => CUR.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') px(x + i, y + j, 1); else if (c === 'o') px(x + i, y + j, 0); }));
    // little 1-bit pictures
    const catPic = (cx, cy, s) => { // s ~ radius
      const ear = (dir) => { for (let k = 0; k < s * 0.8; k++) { const w2 = Math.round(k * 0.6); hl(Math.round(cx + dir * s * 0.55 - w2), Math.round(cx + dir * s * 0.55 + w2), Math.round(cy - s * 1.25 + k)); } };
      ear(-1); ear(1);
      oval(cx, cy, Math.round(s), Math.round(s * 0.85), 3);
      oval(cx - Math.round(s * 0.38), cy - Math.round(s * 0.1), Math.max(2, Math.round(s * 0.14)), Math.max(2, Math.round(s * 0.2)), 0);
      oval(cx + Math.round(s * 0.38), cy - Math.round(s * 0.1), Math.max(2, Math.round(s * 0.14)), Math.max(2, Math.round(s * 0.2)), 0);
      fill(cx - 2, cy + Math.round(s * 0.25), 5, 3, 1);
      for (const d of [-1, 1]) { line(cx + d * s * 0.3, cy + s * 0.35, cx + d * s * 1.25, cy + s * 0.2); line(cx + d * s * 0.3, cy + s * 0.45, cx + d * s * 1.2, cy + s * 0.55); }
    };
    const dogPic = (cx, cy, s) => {
      oval(cx, cy, Math.round(s * 0.85), Math.round(s), 24);
      for (const d of [-1, 1]) oval(cx + d * Math.round(s * 0.85), cy - Math.round(s * 0.1), Math.round(s * 0.3), Math.round(s * 0.65), 0);
      oval(cx - Math.round(s * 0.32), cy - Math.round(s * 0.2), Math.max(2, Math.round(s * 0.12)), Math.max(2, Math.round(s * 0.12)), 0);
      oval(cx + Math.round(s * 0.32), cy - Math.round(s * 0.2), Math.max(2, Math.round(s * 0.12)), Math.max(2, Math.round(s * 0.12)), 0);
      oval(cx, cy + Math.round(s * 0.35), Math.max(3, Math.round(s * 0.22)), Math.max(2, Math.round(s * 0.15)), 0);
    };
    const docIcon = (x, y, kind, sel) => { // 32x32 Finder document icon with a picture on it
      fill(x + 4, y, 20, 32, 0); hl(x + 4, x + 21, y); vl(x + 4, y, y + 31); hl(x + 4, x + 27, y + 31); vl(x + 27, y + 6, y + 31); line(x + 21, y, x + 27, y + 6); vl(x + 21, y, y + 6); hl(x + 21, x + 27, y + 6);
      (kind ? catPic : dogPic)(x + 16, y + 19, 6);
      if (sel) invRect(x + 4, y, 24, 32);
    };
    const brainIcon = (x, y, hi) => { // 64x56 "model" icon: a classic compact computer with a brain on screen
      fill(x + 8, y, 48, 56, 0); box(x + 8, y, 48, 56); box(x + 9, y + 1, 46, 54);
      box(x + 14, y + 6, 36, 28); pfill(x + 15, y + 7, 34, 26, hi ? 0 : 3);
      oval(x + 32, y + 20, 13, 10, 'white'); line(x + 32, y + 11, x + 32, y + 29);
      for (let k = 0; k < 3; k++) { line(x + 22 + k * 2, y + 14 + k * 4, x + 29, y + 16 + k * 4); line(x + 35, y + 16 + k * 4, x + 42 - k * 2, y + 14 + k * 4); }
      hl(x + 14, x + 26, y + 44); fill(x + 36, y + 43, 14, 3, 1);
    };
    const slider = (x, y, w, v, label) => { text(label, x - 28, y - 6, UI); hl(x, x + w, y); hl(x, x + w, y + 1); for (let k = 0; k <= 4; k++) vl(x + (k * w) / 4, y + 4, y + 7); const kx = Math.round(x + v * w); fill(kx - 6, y - 8, 12, 17, 0); box(kx - 6, y - 8, 12, 17); for (let k = 0; k < 3; k++) hl(kx - 3, kx + 3, y - 3 + k * 3); };
    const ants = (x, y, w, h) => { const ant = Math.floor(t * 8); let k = 0; const st = (xx, yy) => { px(xx, yy, ((k + ant) >> 2) & 1); k++; }; for (let i = 0; i < w; i++) st(x + i, y); for (let j = 0; j < h; j++) st(x + w, y + j); for (let i = w; i > 0; i--) st(x + i, y + h); for (let j = h; j > 0; j--) st(x, y + j); };

    // ---------- desktop + menu bar ----------
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) B[y * SW + x] = (x + y) & 1;
    fill(0, 0, SW, 19, 0); hl(0, SW - 1, 19);
    [[0, 0, 1, 1], [SW - 1, 0, -1, 1], [0, SH - 1, 1, -1], [SW - 1, SH - 1, -1, -1]].forEach(([cx, cy, dx, dy]) => { [5, 3, 2, 1, 1].forEach((n, j) => { for (let i = 0; i < n; i++) px(cx + dx * i, cy + dy * j, 1); }); });
    const LOGO = ['..###..', '.#...#.', '#..#..#', '#.#.#.#', '#..#..#', '.#...#.', '..###..', '..#.#..', '..###..', '..###..', '...#...'];
    LOGO.forEach((row, j) => [...row].forEach((c, i) => c === '#' && px(14 + i, 4 + j)));
    let mx = 36; ['File', 'Edit', 'Train', 'Model', 'Help'].forEach((m) => { mx += text(m, mx, 4, UI) + 18; });

    const MAIN = [12, 26, 616, 328];
    // ---------- BEAT 1: alert asks the question, OK click -> it becomes the window title ----------
    if (t < 1.7 && t > 0.2) {
      const dx = 60, dy = 80, dw = 520, dh = 190;
      dialog(dx, dy, dw, dh);
      // note icon: speech balloon with "?"
      oval(dx + 56, dy + 60, 32, 26, 'white'); thick(dx + 40, dy + 82, dx + 30, dy + 102); thick(dx + 30, dy + 102, dx + 58, dy + 86);
      text('?', dx + 46, dy + 38, '800 34px "Inter"');
      const q = 'How does AI learn?', qn = Math.min(q.length, Math.floor((t - 0.3) * 30));
      text(q.slice(0, Math.max(0, qn)), dx + 110, dy + 40, '800 40px "Inter"');
      if (t > 0.75) text('Click OK to find out.', dx + 112, dy + 98, UI);
      button(dx + dw - 120, dy + dh - 52, 90, 30, 'OK', t > 1.45 && t < 1.65, true);
    }
    // cursor path: wanders to OK and clicks
    let cur = null;
    if (t < 1.7) { const k = ease(0.7, 0.7); cur = [Math.round(H.lerp(600, 60 + 520 - 76, k)), Math.round(H.lerp(330, 80 + 190 - 38, k))]; }
    if (t >= 1.65 && t < 1.95) zoom([60, 80, 520, 190], MAIN, (t - 1.65) / 0.3);

    // ---------- BEAT 2: Finder window of labelled examples dragged into the Model ----------
    if (t >= 1.95) {
      win(MAIN[0], MAIN[1], MAIN[2], MAIN[3], 'How does AI learn?');
      const cx0 = MAIN[0] + 1, cy0 = MAIN[1] + 19;
      // Finder info bar, counting items
      const n = 1e6 * Math.pow(H.clamp((t - 2.5) / 3.2), 2.2);
      text(fmt(n) + ' examples', cx0 + 12, cy0 + 4, UI); text('Training Data', cx0 + MAIN[2] - 130, cy0 + 4, UI);
      hl(cx0, cx0 + MAIN[2] - 3, cy0 + 20); hl(cx0, cx0 + MAIN[2] - 3, cy0 + 22);
      // icon grid with labels landing under each icon
      const icons = [];
      for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) icons.push([cx0 + 26 + i * 64, cy0 + 40 + j * 74, (i + j * 2) % 3 !== 1]);
      const nShown = Math.floor(H.clamp((t - 2.0) / 0.6) * icons.length);
      const dragI = t > 2.9 && t < 5.9 ? Math.floor((t - 2.9) / 0.5) : -1, dk = ((t - 2.9) % 0.5) / 0.4;
      icons.forEach(([x, y, kind], k) => {
        if (k >= nShown) return;
        const sel = dragI >= 0 && (dragI * 5) % 12 === k && dk < 1;
        docIcon(x, y, kind, sel);
        const lb = kind ? 'cat' : 'dog'; const lw = tw(lb, UI);
        fill(x + 16 - lw / 2 - 2, y + 35, lw + 4, 15, sel ? 1 : 0); text(lb, Math.round(x + 16 - lw / 2), y + 36, UI, sel ? 0 : 1);
      });
      // model icon + label, arrow "training data"
      const mx2 = cx0 + 430, my2 = cy0 + 100;
      const hit = dragI >= 0 && dk > 0.95;
      brainIcon(mx2, my2, hit); ctext('Model', mx2 + 32, my2 + 62, UI);
      if (t > 2.5) { // the hero number of this beat
        text('examples seen', cx0 + 300, cy0 + 212, UI);
        text(fmt(n), cx0 + 300, cy0 + 230, '800 40px "Inter"');
      }
      if (t > 2.4) { arrow([[cx0 + 285, cy0 + 130], [mx2 - 8, my2 + 28]], ease(2.4, 0.5)); if (t > 2.8) text('training data', cx0 + 300, cy0 + 104, UI); }
      // the drag: dotted outline + cursor carrying it
      if (dragI >= 0 && dk < 1) {
        const [ix, iy] = icons[(dragI * 5) % 12], e = H.ease.inOut(H.clamp(dk));
        const ox = Math.round(H.lerp(ix + 4, mx2 + 20, e)), oy = Math.round(H.lerp(iy, my2 + 10, e) - Math.sin(e * Math.PI) * 30);
        for (let i = 0; i < 24; i += 2) { px(ox + i, oy); px(ox + i, oy + 31); } for (let j = 0; j < 32; j += 2) { px(ox, oy + j); px(ox + 23, oy + j); }
        cur = [ox + 12, oy + 14];
      }
    }

    // ---------- BEAT 3: the Model window — Guess, Check (alert + beep), Adjust (sliders) ----------
    const MW = [44, 52, 552, 290];
    if (t >= 5.9 && t < 6.2) zoom([12 + 1 + 430, 26 + 19 + 100, 64, 56], MW, (t - 5.9) / 0.3);
    if (t >= 6.2) {
      win(MW[0], MW[1], MW[2], MW[3], 'Model');
      const x0 = MW[0], y0 = MW[1] + 19;
      const phase = t < 7.4 ? 0 : t < 8.3 ? 1 : t < 9.4 ? 2 : 0;
      ['Guess', 'Check', 'Adjust'].forEach((nm, i) => { button(x0 + 110 + i * 140, y0 + 12, 88, 24, nm, i === phase); if (i < 2) arrow([[x0 + 204 + i * 140, y0 + 24], [x0 + 244 + i * 140, y0 + 24]], 1); });
      // loop-back arrow (dashed) under the buttons
      thick(x0 + 434, y0 + 40, x0 + 434, y0 + 50, 3); thick(x0 + 434, y0 + 50, x0 + 154, y0 + 50, 3); arrow([[x0 + 154, y0 + 50], [x0 + 154, y0 + 41]], 1);
      text('repeat', x0 + 268, y0 + 54, UI);
      // picture panel
      box(x0 + 22, y0 + 82, 120, 110); catPic(x0 + 82, y0 + 142, 30); ctext('new picture', x0 + 82, y0 + 198, UI);
      arrow([[x0 + 148, y0 + 136], [x0 + 196, y0 + 136]], ease(6.4, 0.3)); if (t > 6.5) text('guess', x0 + 150, y0 + 112, UI);
      // weights panel (Control-Panel sliders)
      box(x0 + 204, y0 + 76, 180, 124); text('Weights', x0 + 212, y0 + 82, UI); hl(x0 + 204, x0 + 383, y0 + 100);
      const adj = H.ease.inOut(H.clamp((t - 8.6) / 0.6));
      [[0.25, 0.6], [0.7, 0.35], [0.4, 0.8]].forEach(([a, b], i) => slider(x0 + 246, y0 + 122 + i * 26, 120, H.lerp(a, b, adj), 'w' + (i + 1)));
      arrow([[x0 + 390, y0 + 136], [x0 + 420, y0 + 136]], ease(6.9, 0.2));
      if (t > 7.0 && t < 9.4) {
        text('dog?', x0 + 428, y0 + 118, '800 30px "Inter"');
        if (t > 7.5) { thick(x0 + 424, y0 + 116, x0 + 506, y0 + 156); thick(x0 + 506, y0 + 116, x0 + 424, y0 + 156); }
      }
      if (t > 8.3) { // error travels back
        arrow([[x0 + 466, y0 + 164], [x0 + 466, y0 + 222], [x0 + 300, y0 + 222], [x0 + 300, y0 + 204]], ease(8.3, 0.5), 4);
        if (t > 8.5) text('error', x0 + 370, y0 + 228, UI);
      }
      if (t > 9.6) {
        text('cat', x0 + 430, y0 + 118, '800 30px "Inter"');
        if (t > 9.85) { const k = H.clamp((t - 9.85) / 0.25); thick(x0 + 490, y0 + 136, x0 + 490 + 8 * Math.min(1, k * 2), y0 + 136 + 10 * Math.min(1, k * 2)); if (k > 0.5) thick(x0 + 498, y0 + 146, x0 + 498 + 20 * (k - 0.5) * 2, y0 + 146 - 30 * (k - 0.5) * 2); }
      }
      // CHECK: stop alert
      if (t > 7.4 && t < 8.3) {
        const ax = 250, ay = 210, aw = 300, ah = 96;
        dialog(ax, ay, aw, ah);
        // stop icon: octagon with a hand-ish bar
        const sx = ax + 40, sy = ay + 40, R = 18; for (let a = 0; a < 8; a++) { const a0 = (a + 0.5) * Math.PI / 4, a1 = (a + 1.5) * Math.PI / 4; thick(sx + Math.cos(a0) * R, sy + Math.sin(a0) * R, sx + Math.cos(a1) * R, sy + Math.sin(a1) * R); }
        fill(sx - 9, sy - 3, 19, 7, 1);
        text('Wrong!', ax + 72, ay + 18, BIG); text("It's a cat, not a dog.", ax + 72, ay + 48, UI);
        button(ax + aw - 84, ay + ah - 34, 60, 22, 'OK', t > 8.1, true);
      }
      cur = t < 9.4 ? [x0 + 110 + phase * 140 + 60, y0 + 30] : [x0 + 170, y0 + 30];
    }

    // ---------- BEAT 4: Accuracy chart window (pattern-filled area, counting number) ----------
    const CWN = [28, 50, 584, 300];
    if (t >= 10.4 && t < 10.7) zoom(MW, CWN, (t - 10.4) / 0.3);
    if (t >= 10.7) {
      win(CWN[0], CWN[1], CWN[2], CWN[3], 'Accuracy');
      const ox = CWN[0] + 60, oy = CWN[1] + 262, aw = 330, ah = 196;
      vl(ox, oy - ah - 6, oy); hl(ox, ox + aw + 6, oy);
      for (let k = 0; k <= 4; k++) hl(ox - 5, ox, oy - (k * ah) / 4);
      text('100%', ox - 50, oy - ah - 6, UI); text('50%', ox - 42, oy - ah / 2 - 6, UI); text('training rounds →', ox + aw - 160, oy + 8, UI);
      const acc = (x) => 97 - 36 * Math.exp(-x * 4.5);
      const prog = H.clamp((t - 10.9) / 1.6);
      let lastY = oy;
      for (let x = 0; x <= aw * prog; x++) {
        const v = acc(x / aw), yy = Math.round(oy - (v / 100) * ah);
        for (let y = yy + 2; y < oy; y++) px(ox + x, y, patBit(9, ox + x, y));
        px(ox + x, yy); px(ox + x, yy + 1); lastY = yy;
      }
      const val = Math.round(61 + 36 * H.ease.out(prog));
      text('Accuracy', CWN[0] + 420, CWN[1] + 60, UI);
      const nx = CWN[0] + 420, ny = CWN[1] + 84;
      fill(nx - 4, ny - 4, 140, 60, 0); text(val + '%', nx, ny, HUGE);
      text('61% → ' + val + '%', nx, ny + 62, UI);
      if (prog >= 1) { // emphasis: marching-ants selection + oval tool ring on the last point
        ants(nx - 10, ny - 8, 136, 60);
        const k = H.clamp((t - 12.55) / 0.3); if (k > 0) oval(ox + aw, lastY, Math.round(14 * k) + 2, Math.round(14 * k) + 2, 'line');
      }
      cur = [nx + 120, ny + 70];
    }
    // ---------- BEAT 5: closing alert ----------
    if (t > 13.0) {
      const dx = 64, dy = 196, dw = 360, dh = 120;
      dialog(dx, dy, dw, dh);
      LOGO.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') fill(dx + 24 + i * 4, dy + 22 + j * 4, 4, 4, 1); }));
      const l1 = 'More examples →', l2 = 'better guesses.';
      text(l1.slice(0, Math.floor((t - 13.0) * 40)), dx + 74, dy + 24, BIG);
      if (t > 13.3) text(l2.slice(0, Math.floor((t - 13.3) * 40)), dx + 74, dy + 52, BIG);
      button(dx + dw - 96, dy + dh - 38, 68, 24, 'OK', false, true);
      cur = [dx + dw - 40, dy + dh + 20];
    }
    // system beep = menu bar flash on the wrong guess
    if (t > 7.4 && t < 7.55) invRect(0, 0, SW, 19);
    if (cur) cursor(cur[0], cur[1]);

    const lc = H.layer(SW, SH), lx = lc.getContext('2d');
    const img = lx.createImageData(SW, SH);
    for (let i = 0; i < B.length; i++) { const v = B[i] ? 0 : 255; img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
    lx.putImageData(img, 0, 0);
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(lc, 0, 0, W, H_); ctx.restore();
  }

  // ================= SOUND: a 1984 Mac on a desk. Mouse clicks and ball rumble, keyboard clicks, the floppy drive
  // chattering while the Finder works, the square-wave system beep, and the Mac's 4-voice square synth for the big hits.
  // All times copied from macExplainer above.
  function macSound(k) {
    const END = 14.5;
    const sq = (t, f, dur, gain, o) => k.tone(t, Object.assign({ f, type: 'square', dur, gain, a: 0.002, hold: dur * 0.6, filter: 'lowpass', f2: 2200 }, o));
    const tri = (t, f, dur, gain, o) => k.tone(t, Object.assign({ f, type: 'triangle', dur, gain, a: 0.003, hold: dur * 0.5 }, o));
    // mouse button: plastic micro-switch, down is a firmer clack than up
    const mclick = (t, down, pan = 0, g = 1) => {
      k.noise(t, { dur: 0.014, filter: 'bandpass', f: down ? 1700 : 2300, q: 3, gain: (down ? 0.32 : 0.2) * g, a: 0.001, pan });
      k.tone(t, { f: down ? 210 : 280, dur: 0.035, gain: (down ? 0.14 : 0.08) * g, a: 0.001, pan });
    };
    // mouse ball rolling across the desk
    const rumble = (t, dur, pan = 0) => k.noise(t, { dur, color: 'brown', filter: 'bandpass', f: 260, q: 1.2, gain: 0.09, a: dur * 0.3, hold: dur * 0.3, pan, minor: true });
    // floppy drive: motor whir + head-step clunks
    const motor = (t, dur, g = 1) => { k.tone(t, { f: 92, type: 'sawtooth', dur, gain: 0.025 * g, a: 0.08, hold: dur - 0.2, filter: 'lowpass', f2: 380, pan: 0.2, minor: true }); k.noise(t, { dur, filter: 'bandpass', f: 700, q: 2.5, gain: 0.02 * g, a: 0.08, hold: dur - 0.2, pan: 0.2, minor: true }); };
    const step = (t, g = 1) => { k.noise(t, { dur: 0.02, filter: 'bandpass', f: 950, q: 5, gain: 0.3 * g, a: 0.001, pan: 0.2, minor: true }); k.tone(t, { f: 140, dur: 0.03, gain: 0.08 * g, a: 0.001, pan: 0.2, minor: true }); };
    // zoom-rects: 8 stepped outlines -> 8 stepped low square ticks, rising
    const zoomSnd = (t, pan = 0) => { for (let i = 0; i < 8; i++) sq(t + i * 0.0375, 180 * Math.pow(2, i / 6), 0.03, 0.05, { f2: 1200, pan }); };
    // keyboard: the Mac 128 keyboard's clicky keys, one key per two typed characters (keeps it under ~15/s)
    const typeOut = (t0, len, cps, pan = 0) => { for (let i = 0; i < len; i += 2) k.play('key', t0 + i / cps, { gain: 1.0, pan, minor: true }); };

    k.bed('room', 0, END, { gain: 0.7 });
    k.bed('hiss', 0, END, { gain: 0.6 }); // the built-in CRT's faint whine/hiss

    // ---- BEAT 1: alert (0.2), typed question (0.3, 30 cps), cursor rolls to OK (0.7-1.4), click (1.45/1.65)
    sq(0.2, 'A3', 0.05, 0.06, { f2: 900 }); k.play('tock', 0.2, { f: 420, gain: 0.5 });       // the dialog snaps up
    typeOut(0.3, 18, 30, -0.1);
    rumble(0.7, 0.7, 0.3);
    mclick(1.45, true, 0.4); mclick(1.65, false, 0.4);
    zoomSnd(1.65);                                                                                // zoom-rects 1.65-1.95

    // ---- BEAT 2: Finder window (1.95), icons read off the disk (2.0-2.6, 12 icons)
    motor(1.95, 0.75);
    for (let i = 0; i < 12; i += 2) step(2.0 + (i / 12) * 0.6, 0.8);
    k.noise(2.4, { dur: 0.5, color: 'brown', filter: 'lowpass', f: [[0, 300], [0.5, 900]], gain: 0.07, a: 0.35, pan: 0.2, minor: true }); // arrow slides to the Model (2.4-2.9)
    // training: the floppy runs while examples are copied; head steps are the counter's ticks, faster as it speeds up
    motor(2.5, 3.3, 1.2);
    for (let t = 2.55; t < 5.7;) { step(t, 0.5); t += H.lerp(0.22, 0.09, (t - 2.5) / 3.2); }
    // six drags (2.9 + i*0.5): mouse down on the icon, ball rolls, drop into the Model at dk > 0.95 (+0.38)
    for (let i = 0; i < 6; i++) {
      const t = 2.9 + i * 0.5;
      mclick(t, true, -0.4, 0.8); rumble(t + 0.02, 0.34, -0.1);
      mclick(t + 0.38, false, 0.35, 0.9);
      k.tone(t + 0.38, { f: [[0, 220 * Math.pow(2, i / 12)], [0.06, 330 * Math.pow(2, i / 12)]], type: 'square', dur: 0.08, gain: 0.05, a: 0.002, hold: 0.04, filter: 'lowpass', f2: 1400, pan: 0.35, minor: true });
    }
    // counter lands on 1,000,000 (t = 5.7): drive stops with a final seek, a clean square two-note
    step(5.7, 1.1); sq(5.72, 'E5', 0.07, 0.07, { pan: -0.2 }); sq(5.8, 'A5', 0.22, 0.07, { pan: -0.2 });

    // ---- BEAT 3: zoom into the Model window (5.9-6.2), Guess clicked (6.2)
    zoomSnd(5.9, 0.3);
    mclick(6.2, true, -0.3); mclick(6.32, false, -0.3, 0.8);
    k.noise(6.4, { dur: 0.3, color: 'brown', filter: 'lowpass', f: [[0, 300], [0.3, 800]], gain: 0.05, a: 0.2, minor: true }); // guess arrow
    k.noise(6.9, { dur: 0.2, color: 'brown', filter: 'lowpass', f: [[0, 300], [0.2, 800]], gain: 0.05, a: 0.14, pan: 0.4, minor: true });
    sq(7.0, 'D4', 0.08, 0.07, { pan: 0.5 }); sq(7.09, 'G4', 0.16, 0.07, { pan: 0.5 });           // "dog?" appears: a questioning lift
    // CHECK (7.4): button + stop alert + menu-bar flash = the Mac system beep (the wrong guess)
    mclick(7.4, true, 0);
    sq(7.4, 1000, 0.17, 0.12, { f2: 3200, hold: 0.12 }); sq(7.4, 500, 0.17, 0.05, { f2: 1600, hold: 0.12 });
    sq(7.5, 'G2', 0.22, 0.1, { f2: 700, hold: 0.12, pan: 0.5 }); k.play('thud', 7.5, { f: 110, gain: 0.5, pan: 0.5 }); // X slams over "dog?"
    mclick(8.1, true, 0.3); mclick(8.28, false, 0.3, 0.8);                                         // OK on the alert
    // ADJUST (8.3): button, dashed error line draws back (8.3-8.8), 'error' label (8.5)
    mclick(8.3, true, 0.2);
    k.withMinor(() => { for (let i = 0; i < 8; i++) { const f = i / 7, e = H.ease.inOut(f); sq(8.3 + f * 0.5, 600 * Math.pow(2, -e), 0.025, 0.04, { f2: 1500, pan: 0.6 - e * 0.5 }); } });
    // weight sliders move (8.6-9.2, ease in-out): mouse drags, detent clicks where the knobs pass tick marks
    rumble(8.6, 0.6, -0.1); // slider drag
    [8.68, 8.78, 8.86, 8.93, 9.0, 9.08, 9.17].forEach((t, i) => k.play('click', t, { f: 1300 + (i % 3) * 120, gain: 1.0, pan: -0.15, minor: true }));
    // GUESS again (9.4), "cat" (9.6), check mark draws (9.85-10.1): the correction
    mclick(9.4, true, -0.3); mclick(9.52, false, -0.3, 0.8);
    sq(9.6, 'G4', 0.1, 0.07, { pan: 0.5 });
    sq(9.85, 'E5', 0.09, 0.08, { pan: 0.5 }); sq(9.95, 'A5', 0.35, 0.08, { pan: 0.5 }); tri(9.95, 'A3', 0.4, 0.14, { pan: 0.5 });

    // ---- BEAT 4: zoom to the Accuracy window (10.4-10.7), chart draws 10.9-12.5, number 61 -> 97 (ease-out)
    zoomSnd(10.4);
    motor(10.75, 1.8, 0.8);
    let last = 61, lastT = -1;
    for (let f = Math.ceil(10.9 * 60); f < 12.42 * 60; f++) { // ticks stop just before the 97% hit
      const t = f / 60, v = Math.round(61 + 36 * H.ease.out(H.clamp((t - 10.9) / 1.6)));
      if (v > last && t - lastT >= 1 / 12) { sq(t, 300 + (v - 61) * 12, 0.03, 0.045, { f2: 1600, minor: true, pan: 0.3 }); lastT = t; last = v; }
    }
    // 97% (12.5): the biggest hit. 4-voice square chord (the Mac's own synth) over a low triangle, ants start crawling
    const P = 12.5;
    ['C5', 'E5', 'G5'].forEach((n, i) => sq(P + i * 0.05, n, 0.08, 0.07, { pan: 0.3 }));
    ['C5', 'E5', 'G5', 'C6'].forEach((n) => sq(P + 0.15, n, 0.7, 0.055, { f2: 2400, hold: 0.2, pan: 0.3, verb: 0.12 }));
    tri(P + 0.15, 'C3', 0.75, 0.34, { hold: 0.2 }); // decays by ~13.0 so the closing alert reads k.play('thud', P, { f: 120, gain: 0.45 });
    k.noise(12.55, { dur: 0.3, color: 'brown', filter: 'lowpass', f: [[0, 400], [0.3, 1000]], gain: 0.05, a: 0.1, minor: true }); // oval tool ring

    // ---- BEAT 5: closing alert (13.0), takeaway typed (13.0 / 13.3 at 40 cps), lands at ~13.68
    sq(13.0, 'A3', 0.05, 0.06, { f2: 900 }); k.play('tock', 13.0, { f: 420, gain: 0.5 });
    for (let t = 13.03; t < 13.66; t += 0.08) k.play('key', t, { gain: 1.0, pan: -0.3, minor: true }); // both lines type 13.0-13.68; one key per ~3 chars
    const TAKE = 13.68;
    sq(TAKE, 'G4', 0.12, 0.045); sq(TAKE + 0.12, 'C5', 0.8, 0.045, { verb: 0.12 }); sq(TAKE + 0.12, 'E4', 0.8, 0.025); tri(TAKE + 0.12, 'C3', 0.9, 0.14);
  }

  registerStyle({
    id: 'mac-1bit',
    name: 'MacPaint 1984',
    category: 'Retro Digital',
    description: 'Pure 1-bit black & white at the original 72-dpi grain: real Atkinson-dithered grayscale (blown-out highlights, crunchy shadows), 8x8 fill patterns, striped title bars, marching ants and bitmap type.',
    motion: 'Built the way a 1984 user would: the dithered image scans in row by row, then pencil, line, bucket, rectangle and text tools each switch on in the palette and lay down their marks in snappy, unanimated 1-bit steps, ending on crawling marching ants.',
    duration: 6.2,
    fonts: ['700 13px "Inter"', '700 34px "Libre Baskerville"', '400 11px "Inter"', '8px "Silkscreen"', '800 22px "Inter"', '800 40px "Inter"'],
    frameT: 6.0,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'Explains with the 1984 desktop itself: an alert asks the question and, once OK is clicked, zoom-rects turn it into the window title; labelled Finder icons are dragged into a Model icon while the item count climbs; a Model window cycles Guess/Check/Adjust buttons with a stop alert and menu-bar beep flash, dashed error arrow and Control-Panel weight sliders; a pattern-filled chart climbs to 97% inside marching ants.',
    explainer(ctx, W, H_, t) { macExplainer(ctx, W, H_, t); },
    explainerSound(k) { macSound(k); },
    draw(ctx, W, H_, t) {
      const B = new Uint8Array(SW * SH); // 1 = black
      const px = (x, y, v = 1) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < SW && y < SH) B[y * SW + x] = v; };
      const inv = (x, y) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < SW && y < SH) B[y * SW + x] ^= 1; };
      const fill = (x, y, w, h, v = 1) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, v); };
      const pfill = (x, y, w, h, p) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, patBit(p, x + i, y + j)); };
      const hl = (x0, x1, y, v = 1) => { for (let x = x0; x <= x1; x++) px(x, y, v); };
      const vl = (x, y0, y1, v = 1) => { for (let y = y0; y <= y1; y++) px(x, y, v); };
      const box = (x, y, w, h, v = 1) => { hl(x, x + w - 1, y, v); hl(x, x + w - 1, y + h - 1, v); vl(x, y, y + h - 1, v); vl(x + w - 1, y, y + h - 1, v); };
      const line = (x0, y0, x1, y1, v = 1) => {
        x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
        const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
        for (;;) { px(x0, y0, v); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
      };
      const oval = (cx, cy, rx, ry, mode) => { // mode: 'line' | pattern index
        for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
          const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
          if (d > 1.02) continue;
          const edge = (x * x) / ((rx - 1) * (rx - 1)) + (y * y) / ((ry - 1) * (ry - 1)) > 1.0;
          if (edge) px(cx + x, cy + y, 1); else if (mode !== 'line') px(cx + x, cy + y, patBit(mode, cx + x, cy + y));
        }
      };
      // bitmap text: render with canvas, threshold alpha -> pure 1-bit glyphs
      const tl = H.layer(SW, 60), tx = tl.getContext('2d', { willReadFrequently: true });
      const text = (str, x, y, font, v = 1, thr = 120) => {
        tx.clearRect(0, 0, SW, 60); tx.font = font; tx.textBaseline = 'top'; tx.fillStyle = '#000'; tx.fillText(str, 1, 2);
        const w = Math.ceil(tx.measureText(str).width) + 3, d = tx.getImageData(0, 0, w, 60).data;
        for (let j = 0; j < 60; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > thr) px(x + i - 1, y + j - 2, v);
        return w - 3;
      };
      const r = H.rng(1984);

      // ---------- desktop: classic 50% gray ----------
      for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) B[y * SW + x] = (x + y) & 1;

      // ---------- menu bar ----------
      fill(0, 0, SW, 19, 0); hl(0, SW - 1, 19);
      // rounded screen corners
      [[0, 0, 1, 1], [SW - 1, 0, -1, 1], [0, SH - 1, 1, -1], [SW - 1, SH - 1, -1, -1]].forEach(([cx, cy, dx, dy]) => {
        const m = [5, 3, 2, 1, 1]; m.forEach((n, j) => { for (let i = 0; i < n; i++) px(cx + dx * i, cy + dy * j, 1); });
      });
      // menu logo: a tiny lightbulb
      const LOGO = ['..###..', '.#...#.', '#..#..#', '#.#.#.#', '#..#..#', '.#...#.', '..###..', '..#.#..', '..###..', '..###..', '...#...'];
      LOGO.forEach((row, j) => [...row].forEach((c, i) => c === '#' && px(14 + i, 4 + j)));
      const menus = ['File', 'Edit', 'Goodies', 'Font', 'FontSize', 'Style'];
      let mx = 36;
      const openMenu = 2;
      menus.forEach((m, i) => {
        const w = text(m, mx, 4, '700 13px "Inter"');
        if (i === openMenu && t > 3.88 && t < 3.98) { for (let y = 1; y < 19; y++) for (let x = mx - 6; x < mx + w + 6; x++) inv(x, y); }
        mx += w + 16;
      });

      // ---------- desktop icons (right) ----------
      const icon = (rows, x, y) => rows.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') px(x + i, y + j, 1); else if (c === 'o') px(x + i, y + j, 0); }));
      const DISK = [
        '##########################', '#oooo#oooooooooooo#ooooo#', '#oooo#oooooo##oooo#oooooo#', '#oooo#oooooo##oooo#oooooo#', '#oooo#oooooo##oooo#oooooo#',
        '#oooo#oooooooooooo#oooooo#', '#oooo##############oooooo#', '#ooooooooooooooooooooooooo#', '#ooo##################ooo#', '#ooo#oooooooooooooooo#ooo#',
        '#ooo#oooooooooooooooo#ooo#', '#ooo#oo############oo#ooo#', '#ooo#oooooooooooooooo#ooo#', '#ooo#oo#########ooooo#ooo#', '#ooo#oooooooooooooooo#ooo#',
        '#ooo#oo###########ooo#ooo#', '#ooo#oooooooooooooooo#ooo#', '#ooo#oooooooooooooooo#ooo#', '#ooo#oooooooooooooooo#ooo#', '##########################',
      ];
      icon(DISK, 592, 32);
      fill(584, 55, 42, 12, 0); text('AI Disk', 586, 56, '400 11px "Inter"');
      const TRASH = [
        '.......######.......', '.....##oooooo##.....', '####################', '#oooooooooooooooooo#', '####################', '.#oooooooooooooooo#.',
        '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.',
        '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.', '.#oooooooooooooooo#.', '..################..',
      ];
      icon(TRASH, 598, 300);
      fill(588, 320, 38, 12, 0); text('Trash', 593, 321, '400 11px "Inter"');

      // ---------- MacPaint window ----------
      const wx = 14, wy = 26, ww = 562, wh = 326;
      fill(wx, wy, ww, wh, 0); box(wx, wy, ww, wh); hl(wx + 1, wx + ww, wy + wh); vl(wx + ww, wy + 1, wy + wh); // drop shadow
      // striped title bar
      for (let y = wy + 3; y <= wy + 15; y += 2) hl(wx + 2, wx + ww - 3, y);
      hl(wx, wx + ww - 1, wy + 18);
      fill(wx + 8, wy + 4, 13, 11, 0); box(wx + 9, wy + 5, 11, 11 - 1); // close box
      const title = 'untitled';
      tx.font = '700 13px "Inter"'; const tw = Math.ceil(tx.measureText(title).width);
      fill(wx + ww / 2 - tw / 2 - 8, wy + 2, tw + 16, 15, 0);
      text(title, wx + ww / 2 - tw / 2, wy + 3, '700 13px "Inter"');

      // ---------- tool palette (2 x 9) ----------
      const tpx = wx + 8, tpy = wy + 26, cw2 = 26, ch2 = 20;
      const tools = ['select', 'lasso', 'hand', 'text', 'bucket', 'spray', 'brush', 'pencil', 'line', 'eraser', 'rect', 'frect', 'rrect', 'frrect', 'oval', 'foval', 'free', 'poly'];
      const activeTool = t < 1.85 ? 'select' : t < 2.3 ? 'pencil' : t < 3.35 ? 'line' : t < 3.5 ? 'bucket' : t < 3.95 ? 'rect' : t < 4.75 ? 'text' : 'select';
      tools.forEach((tool, k) => {
        const cx = tpx + (k % 2) * cw2, cy = tpy + Math.floor(k / 2) * ch2;
        box(cx, cy, cw2 + 1, ch2 + 1);
        const ox = cx + 5, oy = cy + 3;
        switch (tool) {
          case 'select': for (let i = 0; i < 16; i += 2) { px(ox + i, oy); px(ox + i, oy + 13); } for (let j = 0; j < 14; j += 2) { px(ox, oy + j); px(ox + 15, oy + j); } break;
          case 'lasso': for (let a = 0; a < 6.28; a += 0.05) px(ox + 8 + Math.cos(a) * 7, oy + 5 + Math.sin(a) * 4); line(ox + 4, oy + 9, ox + 3, oy + 13); line(ox + 3, oy + 13, ox + 6, oy + 12); break;
          case 'hand': box(ox + 3, oy + 6, 10, 8); for (let f = 0; f < 4; f++) vl(ox + 4 + f * 2.5, oy + 1 + (f === 0 || f === 3 ? 2 : 0), oy + 6); vl(ox + 1, oy + 5, oy + 8); break;
          case 'text': text('A', ox + 3, oy - 1, '700 13px "Inter"'); break;
          case 'bucket': line(ox + 3, oy + 6, ox + 9, oy); line(ox + 9, oy, ox + 15, oy + 6); line(ox + 15, oy + 6, ox + 9, oy + 12); line(ox + 9, oy + 12, ox + 3, oy + 6); vl(ox + 2, oy + 6, oy + 12); px(ox + 1, oy + 11); px(ox + 3, oy + 12); break;
          case 'spray': box(ox + 7, oy + 4, 7, 10); fill(ox + 9, oy + 1, 3, 3); [[2, 0], [0, 2], [3, 3], [1, 5], [4, 1]].forEach(([a, b]) => px(ox + a, oy + b)); break;
          case 'brush': line(ox + 14, oy, ox + 6, oy + 8); line(ox + 15, oy + 1, ox + 7, oy + 9); fill(ox + 2, oy + 9, 5, 4); break;
          case 'pencil': line(ox + 13, oy, ox + 2, oy + 11); line(ox + 15, oy + 2, ox + 4, oy + 13); line(ox + 13, oy, ox + 15, oy + 2); px(ox + 1, oy + 13); px(ox + 2, oy + 12); break;
          case 'line': line(ox + 1, oy + 13, ox + 15, oy); break;
          case 'eraser': line(ox + 2, oy + 8, ox + 8, oy + 2); line(ox + 8, oy + 2, ox + 15, oy + 2); line(ox + 2, oy + 8, ox + 2, oy + 13); hl(ox + 2, ox + 9, oy + 13); line(ox + 9, oy + 13, ox + 15, oy + 7); vl(ox + 15, oy + 2, oy + 7); hl(ox + 2, ox + 9, oy + 8); vl(ox + 9, oy + 8, oy + 13); line(ox + 9, oy + 8, ox + 15, oy + 2); break;
          case 'rect': box(ox + 1, oy + 2, 15, 11); break;
          case 'frect': pfill(ox + 1, oy + 2, 15, 11, 3); box(ox + 1, oy + 2, 15, 11); break;
          case 'rrect': case 'frrect': if (tool === 'frrect') pfill(ox + 2, oy + 3, 13, 9, 3); hl(ox + 3, ox + 13, oy + 2); hl(ox + 3, ox + 13, oy + 12); vl(ox + 1, oy + 4, oy + 10); vl(ox + 15, oy + 4, oy + 10); px(ox + 2, oy + 3); px(ox + 14, oy + 3); px(ox + 2, oy + 11); px(ox + 14, oy + 11); break;
          case 'oval': oval(ox + 8, oy + 7, 8, 6, 'line'); break;
          case 'foval': oval(ox + 8, oy + 7, 8, 6, 3); break;
          case 'free': for (let x = 0; x < 15; x++) px(ox + 1 + x, oy + 7 + Math.sin(x * 0.7) * 4 + (x > 10 ? 2 : 0)); break;
          case 'poly': line(ox + 1, oy + 12, ox + 5, oy + 1); line(ox + 5, oy + 1, ox + 15, oy + 5); line(ox + 15, oy + 5, ox + 10, oy + 12); line(ox + 10, oy + 12, ox + 1, oy + 12); break;
        }
        if (tool === activeTool) for (let y = cy + 1; y < cy + ch2; y++) for (let x = cx + 1; x < cx + cw2; x++) inv(x, y);
      });
      // line-width selector
      const lwy = tpy + 9 * ch2 + 10;
      box(tpx, lwy, 2 * cw2 + 1, 60);
      [1, 2, 3, 4, 6].forEach((w, i) => { const y = lwy + 6 + i * 10; fill(tpx + 8, y, 2 * cw2 - 15, w); if (i === 1) { px(tpx + 3, y); px(tpx + 4, y); px(tpx + 3, y + 1); } });

      // ---------- canvas area ----------
      const cx0 = wx + 68, cy0 = wy + 26, cwid = ww - 76, chei = 246;
      box(cx0 - 1, cy0 - 1, cwid + 2, chei + 2);

      // grayscale "digitized" render of the subject, then real Atkinson dithering
      const G = H.layer(cwid, chei), g = G.getContext('2d', { willReadFrequently: true });
      const bx = cwid * 0.73, by = 108, R = 52;
      const pulse = 0.5;
      // backdrop: wall with glow falloff, table plane
      const bg = g.createRadialGradient(bx, by, 10, bx, by, 300);
      bg.addColorStop(0, '#fff'); bg.addColorStop(0.25, '#e8e8e8'); bg.addColorStop(0.6, '#8a8a8a'); bg.addColorStop(1, '#3a3a3a');
      g.fillStyle = bg; g.fillRect(0, 0, cwid, chei);
      const tableY = 222;
      const tg = g.createLinearGradient(0, tableY, 0, chei);
      tg.addColorStop(0, '#b0b0b0'); tg.addColorStop(1, '#4a4a4a');
      g.fillStyle = tg; g.fillRect(0, tableY, cwid, chei - tableY);
      // soft contact shadow + glow pool
      const sh = g.createRadialGradient(bx, tableY + 10, 2, bx, tableY + 10, 80);
      sh.addColorStop(0, 'rgba(0,0,0,0.75)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
      g.save(); g.translate(bx, tableY + 10); g.scale(1, 0.18); g.translate(-bx, -(tableY + 10)); g.fillStyle = sh; g.fillRect(bx - 90, tableY - 400, 180, 900); g.restore();
      // glass bulb: luminous core, darker fresnel rim
      g.save();
      g.beginPath(); g.arc(bx, by, R, Math.PI * 0.72, Math.PI * 0.28 + Math.PI * 2);
      g.lineTo(bx + R * 0.34, by + R * 1.28); g.lineTo(bx - R * 0.34, by + R * 1.28); g.closePath();
      const gl = g.createRadialGradient(bx - 8, by - 6, 4, bx, by + 6, R * 1.25);
      gl.addColorStop(0, '#ffffff'); gl.addColorStop(0.35 + pulse * 0.08, '#f4f4f4'); gl.addColorStop(0.75, '#b8b8b8'); gl.addColorStop(1, '#5a5a5a');
      g.fillStyle = gl; g.fill();
      g.clip();
      // specular window reflection
      g.fillStyle = 'rgba(255,255,255,0.9)';
      g.beginPath(); g.ellipse(bx - R * 0.45, by - R * 0.45, R * 0.18, R * 0.32, -0.7, 0, 7); g.fill();
      // circuit-brain filament inside the bulb
      g.strokeStyle = '#1a1a1a'; g.lineWidth = 2.2; g.lineCap = 'round';
      const rb = H.rng(77);
      g.beginPath(); // two hemispheres
      for (const s of [-1, 1]) {
        g.moveTo(bx, by - 30);
        g.bezierCurveTo(bx + s * 30, by - 42, bx + s * 52, by - 16, bx + s * 42, by + 8);
        g.bezierCurveTo(bx + s * 40, by + 28, bx + s * 14, by + 30, bx, by + 22);
      }
      g.moveTo(bx, by - 30); g.lineTo(bx, by + 22);
      g.stroke();
      g.lineWidth = 1.6;
      for (let k = 0; k < 9; k++) { // circuit traces with pads
        const s = k % 2 ? 1 : -1, y0 = by - 22 + k * 5.5, x1 = bx + s * rb.range(14, 34), y1 = y0 + rb.range(-6, 6);
        g.beginPath(); g.moveTo(bx + s * 3, y0); g.lineTo(bx + s * 10, y0); g.lineTo(x1, y1); g.stroke();
        g.beginPath(); g.arc(x1, y1, 2.6, 0, 7); g.fillStyle = '#000'; g.fill();
      }
      // filament stems down to base
      g.lineWidth = 2; g.beginPath(); g.moveTo(bx - 6, by + 22); g.lineTo(bx - 9, by + R * 1.25); g.moveTo(bx + 6, by + 22); g.lineTo(bx + 9, by + R * 1.25); g.stroke();
      g.restore();
      // screw base: metallic cylinder with ridges
      const b0 = by + R * 1.26, bw = R * 0.74;
      for (let k = 0; k < 5; k++) {
        const y = b0 + k * 8;
        const cg = g.createLinearGradient(bx - bw / 2, 0, bx + bw / 2, 0);
        cg.addColorStop(0, '#101010'); cg.addColorStop(0.28, '#9a9a9a'); cg.addColorStop(0.4, '#e8e8e8'); cg.addColorStop(0.62, '#707070'); cg.addColorStop(1, '#0a0a0a');
        g.fillStyle = cg; g.beginPath(); g.ellipse(bx, y + 4, bw / 2 - k * 0.6, 5.5, 0, 0, 7); g.fill();
        g.fillRect(bx - bw / 2 + k * 0.6, y, bw - k * 1.2, 4.5);
      }
      g.fillStyle = '#111'; g.beginPath(); g.ellipse(bx, b0 + 42, 8, 5, 0, 0, 7); g.fill();

      // Atkinson dithering (6/8 of error diffused -> blown highlights, crunchy darks)
      const id = g.getImageData(0, 0, cwid, chei).data;
      const lum = new Float32Array(cwid * chei);
      for (let i = 0; i < lum.length; i++) lum[i] = (id[i * 4] * 0.299 + id[i * 4 + 1] * 0.587 + id[i * 4 + 2] * 0.114) / 255;
      // the "scan" builds in over time: rows below scanY are still blank
      const scanY = Math.floor(H.clamp((t - 0.45) / 1.4) * chei);
      for (let y = 0; y < chei; y++) for (let x = 0; x < cwid; x++) {
        const i = y * cwid + x, o = lum[i], n = o < 0.5 ? 0 : 1, e = (o - n) / 8;
        lum[i] = n;
        if (x + 1 < cwid) lum[i + 1] += e;
        if (x + 2 < cwid) lum[i + 2] += e;
        if (y + 1 < chei) { if (x > 0) lum[i + cwid - 1] += e; lum[i + cwid] += e; if (x + 1 < cwid) lum[i + cwid + 1] += e; }
        if (y + 2 < chei) lum[i + 2 * cwid] += e;
        px(cx0 + x, cy0 + y, y <= scanY ? (n ? 0 : 1) : 0);
      }

      // scanner head: an inverted band riding the scan line
      if (scanY < chei && t > 0.45) for (let y = scanY + 1; y < Math.min(chei, scanY + 3); y++) for (let x = 0; x < cwid; x++) inv(cx0 + x, cy0 + y);
      // crisp hand-drawn overlays (pencil + line tools) on top of the dither
      const BX = cx0 + bx, BY = cy0 + by;
      const outP = H.clamp((t - 1.9) / 0.38);
      if (outP > 0) {
        const aEnd = Math.PI * 0.72 + Math.PI * 1.56 * outP;
        for (let a = Math.PI * 0.72; a < aEnd; a += 0.004) px(BX + Math.cos(a) * R, BY + Math.sin(a) * R);
        if (outP >= 1) {
          line(BX + Math.cos(Math.PI * 0.28) * R, BY + Math.sin(Math.PI * 0.28) * R, BX + R * 0.34, BY + R * 1.28);
          line(BX + Math.cos(Math.PI * 0.72) * R, BY + Math.sin(Math.PI * 0.72) * R, BX - R * 0.34, BY + R * 1.28);
        } else { // pencil cursor at the tip
          const pxc = Math.round(BX + Math.cos(aEnd) * R), pyc = Math.round(BY + Math.sin(aEnd) * R);
          for (let q = 0; q < 12; q++) { px(pxc + q, pyc - q, 1); px(pxc + q + 2, pyc - q + 2, 1); px(pxc + q + 1, pyc - q + 1, 0); }
        }
      }
      // rays: line tool, 2px, one per click-drag
      const rayT = (t - 2.3) / 0.092, nRays = Math.floor(rayT);
      for (let k = 0; k < 11; k++) {
        if (k > nRays) break;
        const a = -Math.PI * 0.9 + k * (Math.PI * 0.85 / 10);
        const r0 = R + 14, r1full = R + 30 + (k % 2) * 12 + pulse * 4;
        const r1 = k < nRays ? r1full : r0 + (r1full - r0) * H.clamp(rayT - nRays);
        for (let s = r0; s < r1; s++) { px(BX + Math.cos(a) * s, BY + Math.sin(a) * s); px(BX + Math.cos(a) * s + 1, BY + Math.sin(a) * s); }
        if (k === nRays && t < 3.35) { // crosshair cursor mid-drag
          const chx = Math.round(BX + Math.cos(a) * r1), chy = Math.round(BY + Math.sin(a) * r1);
          for (let q = -7; q <= 7; q++) { if (Math.abs(q) > 1) { px(chx + q, chy, 1); px(chx, chy + q, 1); px(chx + q, chy - 1, 0); px(chx + q, chy + 1, 0); px(chx - 1, chy + q, 0); px(chx + 1, chy + q, 0); } }
        }
      }
      // floor: paint-bucket flood of a pattern, horizon line on top
      const flY = cy0 + tableY;
      if (t >= 3.42) { pfill(cx0, flY, cwid, cy0 + chei - flY, 24); hl(cx0, cx0 + cwid - 1, flY); }
      // patterned cast shadow (oval tool, 50% gray)
      if (t >= 3.5) oval(Math.round(BX), flY + 4, 40, 3, 2);
      // stack of books drawn with rect tool + fills
      const books = [[34, 120, 13, 8], [42, 104, 11, 6], [30, 112, 12, 21]];
      const nBooks = H.clamp(Math.floor((t - 3.55) / 0.13) + 1, 0, 3);
      let byy = flY;
      books.slice(0, nBooks).forEach(([bxl, bwd, bht, pt]) => { byy -= bht; const x0 = cx0 + bxl; fill(x0, byy, bwd, bht, 0); pfill(x0 + 6, byy + 2, bwd - 12, bht - 4, pt); box(x0, byy, bwd, bht + 1); vl(x0 + 4, byy, byy + bht); vl(x0 + bwd - 5, byy, byy + bht); });
      // title lettering in a bitmap serif, with marching-ants selection
      const ttl = 'Bright Machine';
      tx.font = '700 34px "Libre Baskerville"';
      const ttw = Math.ceil(tx.measureText(ttl).width);
      const ttx = cx0 + 16, tty = cy0 + 12;
      if (t >= 3.95) {
      fill(ttx - 6, tty - 4, ttw + 12, 58, 0);
      const nT = H.clamp(Math.floor((t - 3.98) / 0.036), 0, ttl.length);
      const sub = 'an idea, in 1-bit', nS = H.clamp(Math.floor((t - 4.5) / 0.013), 0, sub.length);
      text(ttl.slice(0, nT), ttx, tty, '700 34px "Libre Baskerville"', 1, 110);
      const ant = Math.floor(t * 8);
      const antBox = (x, y, w, h) => {
        let k = 0;
        const step = (xx, yy) => { if (((k + ant) >> 2) & 1) px(xx, yy, 1); else px(xx, yy, 0); k++; };
        for (let i = 0; i < w; i++) step(x + i, y);
        for (let j = 0; j < h; j++) step(x + w, y + j);
        for (let i = w; i > 0; i--) step(x + i, y + h);
        for (let j = h; j > 0; j--) step(x, y + j);
      };
      if (t >= 4.75) antBox(ttx - 7, tty - 5, ttw + 13, 59);
      if (nS > 0) text(sub.slice(0, nS), ttx + 3, tty + 38, '700 13px "Inter"', 1, 120);
      if (t < 4.75) { // I-beam text cursor after the last typed glyph
        tx.font = nS > 0 ? '700 13px "Inter"' : '700 34px "Libre Baskerville"';
        const ibx = ttx + Math.ceil(tx.measureText(nS > 0 ? sub.slice(0, nS) : ttl.slice(0, nT)).width) + 3, iby = nS > 0 ? tty + 38 : tty + 2, ibh = nS > 0 ? 14 : 34;
        if (Math.floor(t * 4) % 2 === 0 || nS > 0) { vl(ibx, iby, iby + ibh); px(ibx - 1, iby); px(ibx + 1, iby); px(ibx - 1, iby + ibh); px(ibx + 1, iby + ibh); }
      }
      }

      // ---------- pattern palette ----------
      const ppy = cy0 + chei + 8, ppx = cx0;
      const nCols = Math.floor(cwid / 25);
      for (let k = 0; k < nCols * 2; k++) {
        const c = k % nCols, rr2 = Math.floor(k / nCols), x = ppx + c * 25, y = ppy + rr2 * 17;
        pfill(x + 1, y + 1, 24, 16, k % PAT.length); box(x, y, 26, 18);
      }
      // current fill pattern + line sample
      box(tpx, ppy, 2 * cw2 + 1, 35); pfill(tpx + 3, ppy + 3, 2 * cw2 - 5, 29, 9); box(tpx + 3, ppy + 3, 2 * cw2 - 5, 29);

      // Finder "zoom rects": the window opens out of the disk icon
      if (t < 0.4) {
        for (let y = wy; y <= wy + wh + 1; y++) for (let x = wx; x <= wx + ww + 1; x++) B[y * SW + x] = (x + y) & 1;
        const src = [592, 32, 26, 20], dst = [wx, wy, ww, wh];
        const head = Math.floor(H.clamp(t / 0.36) * 8);
        for (let k = Math.max(0, head - 3); k <= head; k++) {
          const f = k / 8, q = src.map((v, i) => Math.round(v + (dst[i] - v) * f));
          box(q[0], q[1], q[2], q[3], 1); box(q[0] + 1, q[1] + 1, q[2] - 2, q[3] - 2, 0);
        }
      }
      // ---------- blit: 1-bit -> pixels, pixel-doubled ----------
      const lc = H.layer(SW, SH), lx = lc.getContext('2d');
      const img = lx.createImageData(SW, SH);
      for (let i = 0; i < B.length; i++) { const v = B[i] ? 0 : 255; img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
      lx.putImageData(img, 0, 0);
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(lc, 0, 0, W, H_); ctx.restore();
    },
  });
}
