{
  // ---------- 1950s broadsheet front page on yellowed newsprint ----------
  const PAPER = [228, 214, 178];
  const INK = [30, 28, 27];
  const SYL = ['lo', 're', 'm', 'ip', 'sum', 'dol', 'or', 'sit', 'am', 'et', 'con', 'sec', 'te', 'tur', 'ad', 'pis', 'cing', 'el', 'it', 'sed', 'do', 'ei', 'us', 'mod', 'tem', 'por', 'in', 'ci', 'di', 'unt', 'ut', 'la', 'bo', 'ma', 'gna', 'ali', 'qua', 'en', 'im', 'mi', 'nim', 've', 'ni', 'quis', 'nos', 'tru', 'ex', 'er', 'ta', 'tion', 'ul', 'lam', 'co', 'nis', 'al', 'iq', 'uip', 'ea', 'com', 'mo', 'du', 'aut', 'ir', 'ure'];
  const L = 48, R = 1232, COLW = 184, GUT = 16;
  const colX = (c) => L + c * (COLW + GUT);

  const words = (r, n) => {
    const out = []; let cap = true;
    for (let i = 0; i < n; i++) {
      let w = ''; const k = r.chance(0.15) ? 1 : r.int(1, 3);
      for (let j = 0; j < k; j++) w += r.pick(SYL);
      if (r.chance(0.03)) w = String(r.int(2, 1957));
      if (cap) w = w[0].toUpperCase() + w.slice(1);
      cap = false;
      if (r.chance(0.09)) { w += '.'; cap = true; } else if (r.chance(0.07)) w += ',';
      out.push(w);
    }
    return out;
  };

  // justified greeked column text; returns y after
  const column = (x, r, cx, y0, y1, opts = {}) => {
    const lh = 12.6, wcache = {};
    x.font = '400 10.4px "Libre Baskerville"'; x.textBaseline = 'alphabetic'; x.textAlign = 'left';
    const sw = x.measureText(' ').width;
    const mw = (w) => wcache[w] ?? (wcache[w] = x.measureText(w).width);
    let y = y0 + lh, first = true, dlDone = false;
    let pool = [];
    while (y < y1) {
      if (opts.dateline && !dlDone) { dlDone = true;
        x.font = '700 10.4px "Libre Baskerville"'; const dl = opts.dateline; x.fillText(dl, cx + 10, y);
        const dw = x.measureText(dl).width; x.font = '400 10.4px "Libre Baskerville"';
        // continue same line
        let lineW = dw + 10 + sw, lw = [];
        if (pool.length < 30) pool = pool.concat(words(r, 60));
        while (pool.length && lineW + mw(pool[0]) <= COLW) { lw.push(pool.shift()); lineW += mw(lw[lw.length - 1]) + sw; }
        let xx = cx + 10 + dw + sw; const extra = (COLW - (lineW - sw)) / Math.max(1, lw.length);
        for (const w of lw) { x.fillText(w, xx, y); xx += mw(w) + sw + extra; }
        y += lh; first = false; continue;
      }
      const indent = first ? 10 : 0; first = false;
      if (pool.length < 30) pool = pool.concat(words(r, 60));
      const line = []; let lw = indent;
      while (pool.length && lw + mw(pool[0]) <= COLW) { const w = pool.shift(); line.push(w); lw += mw(w) + sw; }
      const endPara = r.chance(0.08) || (line.length && line[line.length - 1].endsWith('.') && r.chance(0.3));
      const natural = lw - sw;
      const gap = endPara ? sw : sw + (COLW - natural) / Math.max(1, line.length - 1);
      let xx = cx + indent;
      for (const w of line) { x.fillText(w, xx, y); xx += mw(w) + gap; }
      y += lh;
      if (endPara) { first = true; if (opts.subheads && r.chance(0.18) && y < y1 - 40) { x.font = '700 10.4px "Libre Baskerville"'; x.textAlign = 'center'; x.fillText(r.pick(['Calculates in Seconds', 'Tubes Glow All Night', 'Memory on Tape', 'Asks Its Own Questions']), cx + COLW / 2, y + 4); x.textAlign = 'left'; x.font = '400 10.4px "Libre Baskerville"'; y += lh + 6; } }
    }
    return y;
  };

  const rule = (x, x0, x1, y, h) => x.fillRect(x0, y, x1 - x0, h);

  // the photograph (greyscale), later screened to a coarse halftone
  const photo = (w, h, t) => {
    const c = H.layer(w, h), x = c.getContext('2d');
    let g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#262626'); g.addColorStop(0.7, '#4c4c4c'); g.addColorStop(0.72, '#8a8a8a'); g.addColorStop(1, '#b0b0b0');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    // tape cabinets
    for (let i = 0; i < 2; i++) {
      const cx = 18 + i * 118;
      g = x.createLinearGradient(cx, 0, cx + 108, 0); g.addColorStop(0, '#d8d8d8'); g.addColorStop(1, '#8c8c8c');
      x.fillStyle = g; x.fillRect(cx, 14, 108, 200);
      x.fillStyle = '#2a2a2a'; x.fillRect(cx + 10, 26, 88, 104);
      for (const ry of [54, 104]) {
        const a = t * (i ? 1.3 : -1.1) + ry;
        x.fillStyle = '#bdbdbd'; x.beginPath(); x.arc(cx + 54, ry, 23, 0, 7); x.fill();
        x.fillStyle = '#3a3a3a'; x.beginPath(); x.arc(cx + 54, ry, 15, 0, 7); x.fill();
        x.fillStyle = '#e8e8e8'; for (let k = 0; k < 3; k++) { const aa = a + k * 2.094; x.beginPath(); x.arc(cx + 54 + Math.cos(aa) * 9, ry + Math.sin(aa) * 9, 3.5, 0, 7); x.fill(); }
        x.beginPath(); x.arc(cx + 54, ry, 3, 0, 7); x.fill();
      }
      x.fillStyle = '#5a5a5a'; for (let k = 0; k < 4; k++) x.fillRect(cx + 14 + k * 22, 146, 14, 8);
      x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(cx + 108, 20, 8, 196);
    }
    // console with lamp grid
    g = x.createLinearGradient(256, 0, 400, 0); g.addColorStop(0, '#b4b4b4'); g.addColorStop(1, '#6a6a6a');
    x.fillStyle = g; x.fillRect(256, 60, 144, 150);
    x.fillStyle = '#141414'; x.fillRect(266, 72, 124, 84);
    const lr = H.rng(4 + Math.floor(t * 4));
    for (let j = 0; j < 5; j++) for (let i = 0; i < 8; i++) { x.fillStyle = lr.chance(0.55) ? '#ffffff' : '#4a4a4a'; x.beginPath(); x.arc(276 + i * 15, 84 + j * 15, 4.2, 0, 7); x.fill(); }
    x.fillStyle = '#d0d0d0'; x.fillRect(248, 196, 160, 14);
    x.fillStyle = '#2a2a2a'; x.fillRect(256, 210, 144, 34);
    // the robot (rim-lit against the dark wall)
    x.save(); x.translate(424, 6); x.scale(1.22, 1.0);
    const rx = 0;
    g = x.createLinearGradient(rx, 0, rx + 104, 0); g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, '#c8c8c8'); g.addColorStop(1, '#5a5a5a');
    x.fillStyle = 'rgba(0,0,0,0.5)'; x.beginPath(); x.ellipse(rx + 58, 246, 64, 8, 0, 0, 7); x.fill();
    x.fillStyle = g;
    x.beginPath(); x.roundRect(rx + 22, 28, 60, 52, 12); x.fill();
    x.fillRect(rx + 44, 80, 16, 10);
    x.beginPath(); x.roundRect(rx + 6, 90, 92, 98, 8); x.fill();
    x.fillRect(rx - 10, 96, 15, 76); x.fillRect(rx + 99, 96, 15, 76);
    x.beginPath(); x.arc(rx - 3, 178, 9, 0, 7); x.arc(rx + 107, 178, 9, 0, 7); x.fill();
    x.fillRect(rx + 20, 188, 24, 58); x.fillRect(rx + 60, 188, 24, 58);
    x.fillStyle = '#101010'; x.fillRect(rx + 50, 10, 4, 18); x.beginPath(); x.arc(rx + 52, 9, 6, 0, 7); x.fill();
    x.fillStyle = '#141414'; x.beginPath(); x.arc(rx + 40, 50, 10, 0, 7); x.arc(rx + 64, 50, 10, 0, 7); x.fill();
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(rx + 40, 50, 5, 0, 7); x.arc(rx + 64, 50, 5, 0, 7); x.fill();
    x.fillStyle = '#1a1a1a'; x.fillRect(rx + 36, 66, 32, 6);
    x.fillStyle = '#1e1e1e'; x.fillRect(rx + 24, 106, 56, 38);
    x.fillStyle = '#f0f0f0'; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(rx + 36 + k * 16, 125, 4.5, 0, 7); x.fill(); }
    x.fillStyle = '#2a2a2a'; x.fillRect(rx + 6, 160, 92, 4); x.fillRect(rx + 50, 188, 4, 58);
    x.restore();
    // flash falloff + grain, softened like an engraved-from-photo plate
    const v = x.createRadialGradient(w * 0.55, h * 0.4, 40, w * 0.5, h * 0.5, w * 0.7);
    v.addColorStop(0, 'rgba(255,255,255,0.12)'); v.addColorStop(1, 'rgba(0,0,0,0.4)');
    x.fillStyle = v; x.fillRect(0, 0, w, h);
    const o = H.layer(w, h), ox = o.getContext('2d'); ox.filter = 'blur(1.4px)'; ox.drawImage(c, 0, 0);
    return ox.getImageData(0, 0, w, h).data;
  };

  // lays out one side of the page into ctx x (black on transparent)
  const layout = (x, r, t, back) => {
    x.fillStyle = '#000'; x.strokeStyle = '#000';
    if (back) {
      // simpler back page: a big ad block, columns, and a headline (shows through mirrored)
      x.font = '700 54px "Oswald"'; x.textAlign = 'center'; x.fillText('CITY COUNCIL VOTES NEW BUDGET', 640, 90);
      x.globalAlpha = 0.55; x.fillRect(640, 140, 592, 300); x.globalAlpha = 1;
      x.font = '700 64px "Playfair Display"'; x.globalCompositeOperation = 'destination-out'; x.fillText('SALE', 936, 260); x.globalCompositeOperation = 'source-over';
      for (let c = 0; c < 6; c++) if (c < 3 || true) column(x, r, colX(c), c >= 3 ? 450 : 120, 720);
      return;
    }
    // top line + ears
    x.font = '400 11px "Libre Baskerville"'; x.textAlign = 'left'; x.fillText('LATE CITY EDITION', L, 34);
    x.textAlign = 'right'; x.fillText('Weather: Fair, mild today; clear tonight.', R, 34);
    x.lineWidth = 1.2;
    x.strokeRect(L, 50, 190, 70); x.strokeRect(R - 190, 50, 190, 70);
    x.font = 'italic 400 13px "Libre Baskerville"'; x.textAlign = 'center';
    x.fillText('“All the News', L + 95, 78); x.fillText('That Computes”', L + 95, 98);
    x.font = '700 11px "Libre Baskerville"'; x.fillText('TODAY’S INDEX', R - 95, 70);
    x.font = '400 10.5px "Libre Baskerville"'; x.fillText('Radio & TV . . . . 46', R - 95, 88); x.fillText('Science . . . . . . 22', R - 95, 104);
    // masthead
    x.font = '400 90px "UnifrakturMaguntia"'; x.textAlign = 'center'; x.fillText('The Daily Algorithm', 640, 118);
    // dateline rules
    rule(x, L, R, 130, 3.2); rule(x, L, R, 136, 1);
    x.font = '700 10.5px "Libre Baskerville"'; x.textAlign = 'left'; x.fillText('VOL. CVI . . . No. 36,512', L, 150);
    x.textAlign = 'center'; x.fillText('NEW YORK, THURSDAY, OCTOBER 9, 1958', 640, 150);
    x.textAlign = 'right'; x.fillText('FIVE CENTS', R, 150);
    rule(x, L, R, 157, 1); rule(x, L, R, 160, 2.6);
    // banner headline
    x.font = '700 100px "Oswald"'; x.textAlign = 'left';
    const head = 'ELECTRONIC BRAIN LEARNS TO THINK';
    const hw = x.measureText(head).width;
    x.save(); x.translate(L, 252); x.scale((R - L) / hw, 1); x.fillText(head, 0, 0); x.restore();
    rule(x, L, R, 266, 1.3);
    // column rules
    // photo frame (filled later) spans cols 0-2
    const PX = L, PY = 278, PW_ = colX(3) - GUT - L, PH_ = 262;
    x.lineWidth = 1; x.strokeRect(PX, PY, PW_, PH_);
    for (let c = 1; c < 6; c++) { const y0 = c < 3 ? PY + PH_ + 54 : 274; rule(x, colX(c) - GUT / 2 - 0.5, colX(c) - GUT / 2 + 0.5, y0, 720 - y0); }
    // caption
    x.font = '700 11px "Libre Baskerville"'; x.textAlign = 'left'; x.fillText('“ROBBIE” AT WORK:', L, PY + PH_ + 18);
    const capW = x.measureText('“ROBBIE” AT WORK:').width + 5;
    x.font = 'italic 400 11px "Libre Baskerville"';
    x.fillText('The machine and its tape memory in the laboratory', L + capW, PY + PH_ + 18);
    x.fillText('yesterday. It answered 40 questions without error.', L, PY + PH_ + 32);
    x.font = '400 9px "Libre Baskerville"'; x.textAlign = 'right'; x.fillText('The Daily Algorithm (by Staff Photographer)', PX + PW_, PY + PH_ + 46);
    for (let c = 0; c < 3; c++) column(x, r, colX(c), PY + PH_ + 52, 720);
    // lead story decks in col 3
    const dk = colX(3) + COLW / 2;
    x.textAlign = 'center';
    x.font = '700 20px "Libre Baskerville"'; ['MACHINE', 'SOLVES', 'PROBLEMS', 'UNAIDED'].forEach((s, i) => x.fillText(s, dk, 300 + i * 24));
    rule(x, dk - 30, dk + 30, 384, 1);
    x.font = 'italic 400 13px "Libre Baskerville"'; ['Scientists Report Device', 'Can ‘Learn’ From Its', 'Own Mistakes'].forEach((s, i) => x.fillText(s, dk, 404 + i * 16));
    rule(x, dk - 30, dk + 30, 446, 1);
    x.font = '400 10.5px "Libre Baskerville"'; x.fillText('By A STAFF CORRESPONDENT', dk, 464);
    column(x, r, colX(3), 470, 720, { dateline: 'CAMBRIDGE, Mass., Oct. 8—', subheads: true });
    column(x, r, colX(4), 276, 720, { subheads: true });
    // second story col 5
    const d2 = colX(5) + COLW / 2;
    x.textAlign = 'center'; x.font = '700 17px "Libre Baskerville"';
    ['ROCKET TEST', 'SET FOR DAWN'].forEach((s, i) => x.fillText(s, d2, 296 + i * 21));
    rule(x, d2 - 26, d2 + 26, 330, 1);
    x.font = 'italic 400 12px "Libre Baskerville"'; ['Launch Crews Ready at', 'Desert Range'].forEach((s, i) => x.fillText(s, d2, 348 + i * 15));
    column(x, r, colX(5), 372, 600, { dateline: 'WHITE SANDS, Oct. 8—' });
    x.font = 'italic 400 10px "Libre Baskerville"'; x.textAlign = 'center'; x.fillText('Continued on Page 31, Column 4', d2, 612);
    rule(x, colX(5), colX(5) + COLW, 622, 1);
    x.font = '700 14px "Libre Baskerville"'; x.fillText('STOCKS EDGE UP', d2, 642);
    column(x, r, colX(5), 650, 720);
    return { PX, PY, PW_, PH_ };
  };

  // ================= EXPLAINER: reading the paper — front page, then turn to the science page =================
  const NE = H.ease, ncl = H.clamp, nseg = (t, a, b) => ncl((t - a) / (b - a));
  const nhash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  let NX = null;

  const graySrc = (w, h, fn, blur = 1.1) => { const c = H.layer(w, h), x = c.getContext('2d'); fn(x); const o = H.layer(w, h), ox = o.getContext('2d'); ox.filter = `blur(${blur}px)`; ox.drawImage(c, 0, 0); return { d: ox.getImageData(0, 0, w, h).data, w, h }; };
  const catSrc = () => graySrc(200, 200, (x) => {
    let g = x.createLinearGradient(0, 0, 200, 200); g.addColorStop(0, '#4a4a4a'); g.addColorStop(1, '#1c1c1c'); x.fillStyle = g; x.fillRect(0, 0, 200, 200);
    x.fillStyle = '#d6d6d6'; x.beginPath(); x.ellipse(100, 215, 84, 52, 0, 0, 7); x.fill();
    x.fillStyle = '#f4f4f4'; x.beginPath(); x.moveTo(38, 100); x.lineTo(44, 18); x.lineTo(86, 58); x.lineTo(114, 58); x.lineTo(156, 18); x.lineTo(162, 100); x.ellipse(100, 112, 64, 58, 0, 0, Math.PI); x.closePath(); x.fill();
    x.fillStyle = '#8a8a8a'; x.beginPath(); x.moveTo(52, 44); x.lineTo(56, 76); x.lineTo(76, 64); x.closePath(); x.moveTo(148, 44); x.lineTo(144, 76); x.lineTo(124, 64); x.closePath(); x.fill();
    x.fillStyle = '#000'; x.beginPath(); x.ellipse(76, 106, 13, 15, 0, 0, 7); x.ellipse(124, 106, 13, 15, 0, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(72, 101, 4.5, 0, 7); x.arc(120, 101, 4.5, 0, 7); x.fill();
    x.fillStyle = '#222'; x.beginPath(); x.moveTo(90, 130); x.lineTo(110, 130); x.lineTo(100, 142); x.closePath(); x.fill();
    x.strokeStyle = '#555'; x.lineWidth = 2.5; x.beginPath(); for (const s of [-1, 1]) { x.moveTo(100 + s * 14, 142); x.lineTo(100 + s * 62, 134); x.moveTo(100 + s * 14, 147); x.lineTo(100 + s * 60, 152); } x.stroke();
  }, 0.8);
  const dogSrc = () => graySrc(200, 200, (x) => {
    let g = x.createLinearGradient(0, 0, 200, 200); g.addColorStop(0, '#9a9a9a'); g.addColorStop(1, '#5a5a5a'); x.fillStyle = g; x.fillRect(0, 0, 200, 200);
    g = x.createRadialGradient(85, 90, 10, 100, 110, 80); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d0d0d0');
    x.fillStyle = g; x.beginPath(); x.ellipse(100, 108, 56, 64, 0, 0, 7); x.fill();
    x.fillStyle = '#0a0a0a'; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(100 + s * 58, 112, 22, 50, s * 0.25, 0, 7); x.fill(); }
    x.fillStyle = '#dedede'; x.beginPath(); x.ellipse(100, 140, 30, 24, 0, 0, 7); x.fill();
    x.fillStyle = '#111'; x.beginPath(); x.ellipse(100, 128, 13, 9, 0, 0, 7); x.fill(); x.beginPath(); x.arc(78, 96, 8, 0, 7); x.arc(122, 96, 8, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(75, 93, 3, 0, 7); x.arc(119, 93, 3, 0, 7); x.fill();
  });
  const machineSrc = (t) => graySrc(280, 170, (x) => {
    let g = x.createLinearGradient(0, 0, 0, 170); g.addColorStop(0, '#2a2a2a'); g.addColorStop(0.78, '#4a4a4a'); g.addColorStop(0.8, '#9a9a9a'); g.addColorStop(1, '#b4b4b4'); x.fillStyle = g; x.fillRect(0, 0, 280, 170);
    for (let i = 0; i < 2; i++) {
      const cx = 10 + i * 82; g = x.createLinearGradient(cx, 0, cx + 74, 0); g.addColorStop(0, '#e0e0e0'); g.addColorStop(1, '#8a8a8a');
      x.fillStyle = g; x.fillRect(cx, 10, 74, 128); x.fillStyle = '#222'; x.fillRect(cx + 7, 18, 60, 74);
      for (const ry of [38, 72]) { const a = t * (i ? 2.1 : -1.7) + ry; x.fillStyle = '#c8c8c8'; x.beginPath(); x.arc(cx + 37, ry, 15, 0, 7); x.fill(); x.fillStyle = '#333'; x.beginPath(); x.arc(cx + 37, ry, 9, 0, 7); x.fill(); x.fillStyle = '#eee'; for (let k = 0; k < 3; k++) { const aa = a + k * 2.094; x.beginPath(); x.arc(cx + 37 + Math.cos(aa) * 6, ry + Math.sin(aa) * 6, 2.4, 0, 7); x.fill(); } }
      x.fillStyle = 'rgba(0,0,0,0.4)'; x.fillRect(cx + 74, 14, 6, 126);
    }
    g = x.createLinearGradient(178, 0, 272, 0); g.addColorStop(0, '#b0b0b0'); g.addColorStop(1, '#5c5c5c'); x.fillStyle = g; x.fillRect(178, 30, 94, 108);
    x.fillStyle = '#121212'; x.fillRect(186, 40, 78, 58);
    const lr = H.rng(4 + Math.floor(t * 4));
    for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) { x.fillStyle = lr.chance(0.5) ? '#fff' : '#444'; x.beginPath(); x.arc(196 + i * 14.5, 50 + j * 13, 3.6, 0, 7); x.fill(); }
  });
  // coarse 45° halftone of a grey source into page rect
  const halfDots = (k, src, x0, y0, dw, dh, cell = 4.6) => {
    const ca = Math.SQRT1_2, ext = Math.hypot(dw, dh);
    k.save(); k.beginPath(); k.rect(x0, y0, dw, dh); k.clip(); k.translate(x0, y0); k.fillStyle = '#000'; k.beginPath();
    for (let v = -ext; v < ext; v += cell) for (let u = -ext; u < ext; u += cell) {
      const px = (u - v) * ca, py = (u + v) * ca;
      if (px < -cell || py < -cell || px > dw + cell || py > dh + cell) continue;
      const sx = ncl(px * src.w / dw, 0, src.w - 1) | 0, sy = ncl(py * src.h / dh, 0, src.h - 1) | 0;
      const dark = 1 - ncl((src.d[(sy * src.w + sx) * 4] / 255 - 0.06) / 0.86);
      const rr = cell * 0.62 * Math.sqrt(Math.max(0, dark * 1.08 - 0.02)); if (rr < 0.3) continue;
      k.moveTo(px + rr, py); k.arc(px, py, rr, 0, Math.PI * 2);
    }
    k.fill(); k.restore(); k.lineWidth = 1; k.strokeRect(x0, y0, dw, dh);
  };
  // newspaper diagram arrow: hairline-crisp shaft, solid head, drawn on
  const npArrow = (k, p0, cp, p1, u, w = 3.5) => {
    if (u <= 0) return;
    const q = (s) => [(1 - s) * (1 - s) * p0[0] + 2 * (1 - s) * s * cp[0] + s * s * p1[0], (1 - s) * (1 - s) * p0[1] + 2 * (1 - s) * s * cp[1] + s * s * p1[1]];
    k.save(); k.lineWidth = w; k.lineCap = 'butt'; k.beginPath(); k.moveTo(p0[0], p0[1]); for (let i = 1; i <= 30 * u; i++) { const p = q(i / 30); k.lineTo(p[0], p[1]); }
    const e = q(u), b = q(Math.max(0, u - 0.04)), a = Math.atan2(e[1] - b[1], e[0] - b[0]); k.lineTo(e[0], e[1]); k.stroke();
    k.beginPath(); k.moveTo(e[0] + Math.cos(a) * 14, e[1] + Math.sin(a) * 14); k.lineTo(e[0] + Math.cos(a + 2.6) * 13, e[1] + Math.sin(a + 2.6) * 13); k.lineTo(e[0] + Math.cos(a - 2.6) * 13, e[1] + Math.sin(a - 2.6) * 13); k.closePath(); k.fill(); k.restore();
    return q;
  };
  const txt = (k, s, font, x, y, align = 'left', ls = 0) => { k.font = font; k.textAlign = align; k.textBaseline = 'alphabetic'; k.letterSpacing = ls + 'px'; k.fillText(s, x, y); k.letterSpacing = '0px'; };
  const reverseBar = (k, x0, y0, w, h, s) => { k.fillRect(x0, y0, w, h); k.save(); k.globalCompositeOperation = 'destination-out'; txt(k, s, '700 15px "Libre Baskerville"', x0 + 12, y0 + h / 2 + 5, 'left', 2); k.restore(); };

  // ---------------- the two sheets (page coords 1280 x 720) ----------------
  const frontPage = (k, t) => {
    const r = H.rng(19), S = NX;
    k.fillStyle = '#000'; k.strokeStyle = '#000';
    txt(k, 'LATE CITY EDITION', '400 11px "Libre Baskerville"', L, 34); txt(k, 'Weather: Fair, mild today; clear tonight.', '400 11px "Libre Baskerville"', R, 34, 'right');
    k.lineWidth = 1.2; k.strokeRect(L, 50, 190, 70); k.strokeRect(R - 190, 50, 190, 70);
    txt(k, '“All the News', 'italic 400 13px "Libre Baskerville"', L + 95, 78, 'center'); txt(k, 'That Computes”', 'italic 400 13px "Libre Baskerville"', L + 95, 98, 'center');
    txt(k, 'SPECIAL REPORT', '700 11px "Libre Baskerville"', R - 95, 76, 'center'); txt(k, 'Inside: Page 14', 'italic 400 12px "Libre Baskerville"', R - 95, 96, 'center');
    txt(k, 'The Daily Algorithm', '400 90px "UnifrakturMaguntia"', 640, 118, 'center');
    k.fillRect(L, 130, R - L, 3.2); k.fillRect(L, 136, R - L, 1);
    txt(k, 'VOL. CVI . . . No. 36,512', '700 10.5px "Libre Baskerville"', L, 150); txt(k, 'NEW YORK, THURSDAY, OCTOBER 9, 1958', '700 10.5px "Libre Baskerville"', 640, 150, 'center'); txt(k, 'FIVE CENTS', '700 10.5px "Libre Baskerville"', R, 150, 'right');
    k.fillRect(L, 157, R - L, 1); k.fillRect(L, 160, R - L, 2.6);
    k.font = '700 104px "Oswald"'; const hw = k.measureText('HOW DOES AI LEARN?').width;
    k.save(); k.translate(640, 262); k.scale(Math.min(1, (R - L) / hw), 1); txt(k, 'HOW DOES AI LEARN?', '700 104px "Oswald"', 0, 0, 'center'); k.restore();
    txt(k, 'Scientists Say the Machines Are Taught by Example, Not by Rules', 'italic 400 19px "Libre Baskerville"', 640, 292, 'center');
    k.fillRect(L, 304, R - L, 1.3);
    // infographic
    const BX = L, BY = 316, BW = 772, BH = 396;
    k.lineWidth = 1.5; k.strokeRect(BX, BY, BW, BH);
    reverseBar(k, BX, BY, BW, 34, 'BY THE NUMBERS: THE TRAINING PILE');
    const kinds = ['cat', 'dog', 'cat', 'cat', 'dog', 'cat', 'dog', 'dog'];
    for (let i = 0; i < 8; i++) {
      const t0 = 2.95 + i * 0.17; if (t < t0) continue;
      const cx = 72 + (i % 4) * 104, cy = 366 + ((i / 4) | 0) * 124, kind = kinds[i];
      halfDots(k, kind === 'cat' ? S.cat : S.dog, cx, cy, 92, 92, 3.3);
      txt(k, kind.toUpperCase(), '700 21px "Oswald"', cx + 46, cy + 116, 'center', 3);
    }
        const aq = npArrow(k, [500, 470], [545, 445], [592, 470], NE.out(nseg(t, 3.75, 4.1)));
    if (t > 3.9) txt(k, 'FED IN', '700 19px "Oswald"', 546, 508, 'center', 2);
    halfDots(k, machineSrc(t), 602, 380, 206, 125, 4.2);
    txt(k, 'THE MACHINE', '700 20px "Oswald"', 705, 530, 'center', 2);
    // pictures stepping along the arrow into the machine (stop-motion, re-set each move)
    if (t > 4.3 && t < 5.9) { const ph = Math.floor((t - 4.3) * 6); for (let j = 0; j < 2; j++) { const u = ((ph + j * 3) % 6) / 6; const p = [500 + u * 92, 470 - Math.sin(u * Math.PI) * 25]; k.fillStyle = '#fff'; halfDots(k, (ph + j) % 2 ? S.dog : S.cat, p[0] - 20, p[1] - 52, 40, 40, 2.8); } k.fillStyle = '#000'; }
    // counter
    k.fillRect(BX + 16, 628, BW - 32, 1);
    txt(k, 'EXAMPLES STUDIED', '700 18px "Oswald"', 340, 650, 'left', 2);
    const n = Math.round(1e6 * Math.pow(nseg(t, 3.0, 5.4), 2.3));
    if (t > 2.9) txt(k, n.toLocaleString('en-US'), '700 60px "Oswald"', 72, 704, 'left', 1);
    if (t > 5.4) txt(k, '— and counting.', 'italic 400 19px "Libre Baskerville"', 340, 690);
    // columns
    k.fillRect(840, 316, 1, 404);
    txt(k, 'MACHINE PASSES', '700 15px "Libre Baskerville"', 848 + 184 / 2, 334, 'center'); txt(k, 'MILLION-PICTURE TEST', '700 15px "Libre Baskerville"', 848 + 92, 352, 'center');
    column(k, r, 848, 362, 720, { dateline: 'CAMBRIDGE, Mass., Oct. 8—', subheads: true });
    k.fillRect(1040, 316, 1, 404);
    txt(k, 'ROCKET TEST', '700 15px "Libre Baskerville"', 1048 + 92, 334, 'center'); txt(k, 'SET FOR DAWN', '700 15px "Libre Baskerville"', 1048 + 92, 352, 'center');
    column(k, r, 1048, 362, 720, { dateline: 'WHITE SANDS, Oct. 8—' });
  };

  const insidePage = (k, t) => {
    const r = H.rng(44), S = NX;
    k.fillStyle = '#000'; k.strokeStyle = '#000';
    txt(k, '14', '700 12px "Libre Baskerville"', L, 34); txt(k, 'THE DAILY ALGORITHM, THURSDAY, OCTOBER 9, 1958', '400 11px "Libre Baskerville"', 640, 34, 'center'); txt(k, 'L+', '700 12px "Libre Baskerville"', R, 34, 'right');
    k.fillRect(L, 42, R - L, 1);
    txt(k, 'Science & Invention', 'italic 400 40px "Playfair Display"', L, 88);
    txt(k, 'A WEEKLY REPORT ON THE NEW MACHINES', '700 11px "Libre Baskerville"', R, 86, 'right', 2);
    k.fillRect(L, 100, R - L, 4); k.fillRect(L, 107, R - L, 1);
    txt(k, 'HOW THE MACHINE LEARNS', '700 46px "Oswald"', L, 160, 'left', 1);
    txt(k, 'A Step-by-Step Look Inside the Electronic Brain', 'italic 400 16px "Libre Baskerville"', R, 158, 'right');
    // diagram
    halfDots(k, S.cat, 70, 210, 200, 190, 4.0);
    txt(k, 'A NEW PICTURE', '700 21px "Oswald"', 170, 426, 'center', 2);
    npArrow(k, [282, 300], [362, 284], [446, 300], NE.out(nseg(t, 7.0, 7.35)));
    if (t > 7.1) txt(k, '1. GUESS', '700 26px "Oswald"', 362, 264, 'center', 2);
    halfDots(k, machineSrc(t), 456, 212, 280, 170, 4.6);
    txt(k, 'THE MACHINE', '700 21px "Oswald"', 596, 404, 'center', 2);
    const adj = NE.inOut(nseg(t, 9.0, 9.5));
    [-2.3, -0.7, 0.9].forEach((a0, i) => { const kx = 552 + i * 44, ky = 438, a = a0 + adj * [1.9, -1.5, 2.4][i]; k.lineWidth = 2.5; k.beginPath(); k.arc(kx, ky, 15, 0, 7); k.stroke(); k.lineWidth = 4; k.beginPath(); k.moveTo(kx, ky); k.lineTo(kx + Math.cos(a) * 13, ky + Math.sin(a) * 13); k.stroke(); });
    npArrow(k, [748, 300], [818, 284], [890, 300], NE.out(nseg(t, 7.4, 7.65)));
    if (t > 7.65) {
      k.lineWidth = 2.5; k.strokeRect(898, 236, 250, 124);
      const right = t > 9.6;
      txt(k, right ? 'cat' : 'dog?', 'italic 400 76px "Playfair Display"', 1023, 322, 'center');
      if (!right && t > 8.0) { k.save(); k.lineWidth = 9; k.translate(1148, 236); const u = NE.back(nseg(t, 8.0, 8.15)); k.scale(u, u); k.beginPath(); k.moveTo(-20, -20); k.lineTo(20, 20); k.moveTo(20, -20); k.lineTo(-20, 20); k.stroke(); k.restore(); }
      if (right) { k.save(); k.lineWidth = 9; k.lineJoin = 'miter'; k.translate(1148, 236); const u = NE.back(nseg(t, 9.6, 9.8)); k.scale(u, u); k.beginPath(); k.moveTo(-20, 0); k.lineTo(-6, 15); k.lineTo(22, -20); k.stroke(); k.restore(); }
    }
    if (t > 8.0) txt(k, '2. CHECK', '700 26px "Oswald"', 1023, 212, 'center', 2);
    if (t > 8.2 && t < 9.6) txt(k, 'Wrong — it’s a cat.', 'italic 400 28px "Libre Baskerville"', 1023, 393, 'center');
    if (t > 9.6) txt(k, 'Right, this time.', 'italic 400 28px "Libre Baskerville"', 1023, 393, 'center');
    const back = npArrow(k, [1023, 404], [880, 476], [652, 444], NE.inOut(nseg(t, 8.55, 9.0)));
    if (t > 8.75) {
      // paste-up knockout: the rule passes *behind* the label (a paper-coloured halo is cut out of the ink first)
      k.save(); k.globalCompositeOperation = 'destination-out'; k.font = '700 26px "Oswald"'; k.textAlign = 'center'; k.textBaseline = 'alphabetic'; k.letterSpacing = '2px';
      k.lineWidth = 11; k.lineJoin = 'round'; k.strokeText('3. ADJUST', 860, 446); k.letterSpacing = '0px'; k.restore();
      txt(k, '3. ADJUST', '700 26px "Oswald"', 860, 446, 'center', 2);
    }
    if (back && t > 9.8) { const u = ((t - 9.8) * 1.1) % 1, p = back(u); k.beginPath(); k.arc(p[0], p[1], 6, 0, 7); k.fill(); }
    k.fillRect(L, 456, R - L, 1.3);
    // pull quote (typeset in left to right as the reader gets there)
    const pq = NE.inOut(nseg(t, 13.0, 13.5));
    k.fillRect(L, 474, 584 * NE.out(nseg(t, 12.95, 13.2)), 3);
    if (pq > 0) { k.save(); k.beginPath(); k.rect(L, 476, 584 * pq, 120); k.clip();
      txt(k, '“More examples', 'italic 400 44px "Playfair Display"', 340, 524, 'center'); txt(k, '→ better guesses.”', 'italic 400 44px "Playfair Display"', 340, 574, 'center'); k.restore(); }
    k.fillRect(L, 592, 584 * NE.out(nseg(t, 13.3, 13.55)), 3);
    for (let c = 0; c < 3; c++) column(k, r, colX(c), 600, 720);
    k.fillRect(640, 466, 1, 254);
    // chart
    const CX0 = 652, CY0 = 466;
    txt(k, 'ACCURACY OVER TRAINING ROUNDS', '700 18px "Oswald"', CX0 + 10, CY0 + 22, 'left', 1.5);
    const X0 = 700, X1 = 1040, Y0 = 680, Y1 = 500, yv = (v) => Y0 - (v - 50) / 50 * (Y0 - Y1);
    k.lineWidth = 1; for (let v = 60; v <= 100; v += 10) { k.save(); k.setLineDash([2, 4]); k.beginPath(); k.moveTo(X0, yv(v)); k.lineTo(X1, yv(v)); k.stroke(); k.restore(); txt(k, String(v), '400 11px "Libre Baskerville"', X0 - 8, yv(v) + 4, 'right'); }
    k.lineWidth = 1.5; k.beginPath(); k.moveTo(X0, Y1 - 10); k.lineTo(X0, Y0); k.lineTo(X1, Y0); k.stroke();
    txt(k, 'TRAINING ROUNDS →', '700 14px "Oswald"', X1, Y0 + 22, 'right', 1.5);
    const prog = NE.inOut(nseg(t, 10.9, 12.3)), acc = (u) => 61 + 36 * (1 - Math.exp(-u * 3.4)) / (1 - Math.exp(-3.4)) + Math.sin(u * 37) * 1.8 * (1 - u);
    k.lineWidth = 3.5; k.lineJoin = 'round'; k.beginPath(); for (let i = 0; i <= 60 * prog; i++) { const u = i / 60; i ? k.lineTo(X0 + u * (X1 - X0), yv(acc(u))) : k.moveTo(X0, yv(acc(0))); } k.stroke();
    if (prog > 0) { const ex = X0 + prog * (X1 - X0), ey = yv(acc(prog)); k.beginPath(); k.arc(ex, ey, 5, 0, 7); k.fill(); }
    k.lineWidth = 2; k.strokeRect(1062, 520, 160, 132);
    txt(k, 'ACCURACY', '700 17px "Oswald"', 1142, 546, 'center', 2);
    if (t > 10.6) txt(k, Math.round(61 + 36 * prog) + '%', '700 66px "Oswald"', 1142, 626, 'center');
    txt(k, 'Source: the laboratory', 'italic 400 10px "Libre Baskerville"', 1222, 712, 'right');
  };

  // ---------------- camera + printing ----------------
  const CAM = [
    [0, 640, 205, 1.3], [2.2, 640, 215, 1.55], [2.9, 470, 455, 1.35], [5.5, 470, 465, 1.4], [5.85, 640, 360, 0.92],
    [6.55, 640, 360, 0.92], [7.0, 380, 318, 1.6], [7.45, 390, 318, 1.6], [7.9, 830, 318, 1.6], [10.5, 820, 322, 1.62], [11.0, 942, 530, 1.9], [12.85, 948, 532, 1.95],
    [13.3, 340, 530, 1.9], [14.5, 345, 532, 1.98], [15.2, 640, 360, 1.0],
  ];
  const camAt = (t) => {
    if (t <= CAM[0][0]) return CAM[0].slice(1);
    for (let i = 0; i < CAM.length - 1; i++) if (t < CAM[i + 1][0]) { const a = CAM[i], b = CAM[i + 1], u = NE.inOut(nseg(t, a[0], b[0])); return [H.lerp(a[1], b[1], u), H.lerp(a[2], b[2], u), H.lerp(a[3], b[3], u)]; }
    return CAM[CAM.length - 1].slice(1);
  };
  const renderSheet = (W, H_, si, t, cam) => {
    const [cx, cy, z] = cam;
    const ink = H.layer(W, H_), k = ink.getContext('2d');
    k.setTransform(z, 0, 0, z, W / 2 - cx * z, H_ / 2 - cy * z);
    (si === 0 ? frontPage : insidePage)(k, t);
    const fd = k.getImageData(0, 0, W, H_).data, bd = NX.back[si];
    const img = new ImageData(W, H_), o = img.data, { low, GW, GH } = NX;
    const iz = 1 / z;
    for (let y = 0; y < H_; y++) {
      const py = cy + (y - H_ / 2) * iz, ipy = py | 0;
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4, px = cx + (x - W / 2) * iz, ipx = px | 0;
        if (px < 0 || py < 0 || px >= 1280 || py >= 720) {
          const dd = Math.max(-px, px - 1280, -py, py - 720), sh = 1 - 0.5 * Math.exp(-dd / 10);
          const n = (nhash(x, y, 3) - 0.5) * 6; o[i] = (38 + n) * sh; o[i + 1] = (32 + n) * sh; o[i + 2] = (28 + n) * sh; o[i + 3] = 255; continue;
        }
        const li = ((py * GH / 720) | 0) * GW + ((px * GW / 1280) | 0), m = low[li * 2], f = low[li * 2 + 1], hh = nhash(ipx, ipy, 1);
        const edge = Math.min(px, 1280 - px, py * 1.3, 720 - py) / 120, age = 0.07 * (1 - ncl(edge)) + m * 0.035 + f * 0.015;
        let r = PAPER[0] * (1 - age * 0.7) + (hh - 0.5) * 12, g = PAPER[1] * (1 - age) + (hh - 0.5) * 12, b = PAPER[2] * (1 - age * 1.6) + (hh - 0.5) * 12;
        if (nhash(ipx >> 1, ipy >> 1, 4) > 0.9975) { r -= 40; g -= 40; b -= 38; }
        const bt = (bd[ipy * 1280 + ipx] / 255) * 0.075; r *= 1 - bt; g *= 1 - bt * 1.05; b *= 1 - bt * 1.1;
        const a = fd[i + 3] / 255;
        if (a > 0) {
          let cov = ncl((a - (0.5 + (nhash(ipx, ipy, 2) - 0.5) * 0.35 + f * 0.15)) * 3 + 0.5) * 0.65 + a * 0.35;
          let dens = 0.86 + m * 0.12 + (nhash(ipx, ipy, 3) - 0.5) * 0.12; if (nhash(ipx, ipy, 5) < 0.025) dens *= 0.45;
          cov *= ncl(dens); r = r * (1 - cov) + INK[0] * cov; g = g * (1 - cov) + INK[1] * cov; b = b * (1 - cov) + INK[2] * cov;
        }
        o[i] = r; o[i + 1] = g; o[i + 2] = b; o[i + 3] = 255;
      }
    }
    const c = H.layer(W, H_); c.getContext('2d').putImageData(img, 0, 0); return c;
  };
  // the reader's red grease pencil (sits on top of the print)
  const pencilRing = (ctx, cam, W, H_, cx, cy, rx, ry, u, seed) => {
    if (u <= 0) return;
    const [ccx, ccy, z] = cam, rr = H.rng(seed);
    ctx.save(); ctx.setTransform(z, 0, 0, z, W / 2 - ccx * z, H_ / 2 - ccy * z); ctx.lineCap = 'round';
    for (let pass = 0; pass < 3; pass++) {
      ctx.strokeStyle = `rgba(196,38,34,${0.55 - pass * 0.12})`; ctx.lineWidth = 3.6 - pass * 0.8; ctx.beginPath();
      const jx = rr.range(-2, 2), jy = rr.range(-2, 2);
      for (let i = 0; i <= 64 * u; i++) { const a = -2.4 + (i / 64) * Math.PI * 2.25, wob = 1 + 0.04 * Math.sin(i * 0.7 + pass); const px = cx + jx + Math.cos(a) * rx * wob, py = cy + jy + Math.sin(a) * ry * wob; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    }
    ctx.restore();
  };

  const npExplainer = (ctx, W, H_, t) => {
    if (!NX) {
      const nz = H.makeNoise(9), GW = 320, GH = 180, low = new Float32Array(GW * GH * 2);
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { low[(y * GW + x) * 2] = nz.fbm2(x * 0.03, y * 0.03, 4); low[(y * GW + x) * 2 + 1] = nz.fbm2(x * 0.125 + 50, y * 0.125, 3); }
      const back = [77, 91].map((sd) => { const c = H.layer(1280, 720), x = c.getContext('2d'); x.translate(1280, 0); x.scale(-1, 1); layout(x, H.rng(sd), 0, true); const b = H.layer(1280, 720), bx = b.getContext('2d'); bx.filter = 'blur(1.2px)'; bx.drawImage(c, 0, 0); const d = bx.getImageData(0, 0, 1280, 720).data, a = new Uint8Array(1280 * 720); for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3]; return a; });
      NX = { low, GW, GH, back, cat: catSrc(), dog: dogSrc() };
    }
    const T0 = 5.85, T1 = 6.55;
    const cam = camAt(t);
    if (t < T0) ctx.drawImage(renderSheet(W, H_, 0, t, cam), 0, 0);
    else if (t >= T1) ctx.drawImage(renderSheet(W, H_, 1, t, cam), 0, 0);
    else {
      // page turn: the front sheet swings over on its left edge, revealing the science page
      ctx.drawImage(renderSheet(W, H_, 1, t, cam), 0, 0);
      const u = NE.inOut(nseg(t, T0, T1)), c = Math.cos(Math.PI * u), z = cam[2];
      const spine = W / 2 - cam[0] * z, top = H_ / 2 - cam[1] * z, pw = 1280 * z, ph = 720 * z;
      // shadow the turning leaf throws onto the page beneath
      const sx = spine + pw * Math.max(0, c);
      const sg = ctx.createLinearGradient(sx, 0, sx + 140 * (1 - Math.abs(c)) + 10, 0); sg.addColorStop(0, 'rgba(0,0,0,0.35)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg; ctx.fillRect(sx, top, 160, ph);
      const leaf = c > 0 ? renderSheet(W, H_, 0, T0, [640, 360, 1]) : null;
      ctx.save(); ctx.translate(spine, top);
      const lift = Math.sin(Math.PI * u) * 22 * z;
      if (c > 0) { ctx.transform(c, -lift / pw * 0.6, 0, 1, 0, 0); ctx.drawImage(leaf, 0, 0, W, H_, 0, 0, pw, ph); ctx.fillStyle = `rgba(0,0,0,${0.35 * (1 - c)})`; ctx.fillRect(0, 0, pw, ph); }
      else { ctx.transform(c, lift / pw * 0.6, 0, 1, 0, 0); ctx.fillStyle = `rgb(${PAPER[0] - 20},${PAPER[1] - 22},${PAPER[2] - 26})`; ctx.fillRect(0, 0, pw, ph); }
      ctx.restore();
    }
    // reader's pencil marks (emphasis)
    if (t >= T1) {
      if (t > 8.1 && t < 9.6) pencilRing(ctx, cam, W, H_, 1023, 300, 146, 74, nseg(t, 8.1, 8.45), 3);
      if (t > 12.35) pencilRing(ctx, cam, W, H_, 1142, 590, 100, 82, nseg(t, 12.35, 12.7), 5);
      if (t > 13.55) { const [ccx, ccy, z] = cam; ctx.save(); ctx.setTransform(z, 0, 0, z, W / 2 - ccx * z, H_ / 2 - ccy * z); ctx.strokeStyle = 'rgba(196,38,34,0.6)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; const u = NE.out(nseg(t, 13.55, 13.85)); ctx.beginPath(); ctx.moveTo(150, 584); ctx.quadraticCurveTo(340, 590, 150 + 380 * u, 582 + 4 * u); ctx.stroke(); ctx.restore(); }
    } else if (t > 5.4) pencilRing(ctx, cam, W, H_, 230, 680, 175, 36, nseg(t, 5.4, 5.75), 7);
  };

  registerStyle({
    id: 'newsprint',
    name: 'Vintage Newsprint',
    category: 'Print',
    description: 'A 1950s broadsheet front page: blackletter masthead, condensed banner headline, dense justified greeked columns and a coarse halftone wire photo, printed in thin uneven ink on yellowed pulp with show-through from the reverse.',
    motion: 'The classic spinning-newspaper reveal: the page whirls up out of the dark and slaps flat to fill the frame, then the camera creeps in on the headline while the console lamps blink and the tape reels turn in the halftone photo.',
    fonts: ['400 90px "UnifrakturMaguntia"', '700 100px "Oswald"', '400 10.4px "Libre Baskerville"', '700 10.4px "Libre Baskerville"', 'italic 400 13px "Libre Baskerville"', '700 64px "Playfair Display"', 'italic 400 44px "Playfair Display"', '700 21px "Oswald"'],
    duration: 4.5,
    frameT: 4.4,
    readsPixels: true,
    explainerDuration: 15.5,
    explainerNote: 'The viewer reads the paper: the camera tracks from the banner headline down to a By-the-Numbers infographic, the page physically turns to an inside Science spread whose diagram, chart and pull quote carry the rest; arrows are crisp newspaper-diagram rules, numbers are set in Oswald, and emphasis is a reader\'s red grease-pencil ring.',
    explainer(ctx, W, H_, t) { npExplainer(ctx, W, H_, t); },
    // Sound: someone reading the morning paper. The broadsheet rustles in their hands as the eye moves on, the
    // page turn is the big paper sweep and flop, the reader's red grease pencil squeaks out the rings and the
    // underline (waxy, low), diagram rules are drawn with a dry pen, counters tick quietly, the pull quote is set
    // with a burst of linotype clatter, and the hits are soft knocks of a knuckle on the page.
    // Timings mirror CAM / frontPage / insidePage / npExplainer above (T0 5.85, T1 6.55, nseg windows).
    // Voiceover mode: room bed drops; rustles, ticks, pen rules, labels and the linotype are minor.
    explainerSound(k) {
      const D = 15.5, T0 = 5.85, T1 = 6.55;
      const pan = (px) => ncl((px / 1280) * 2 - 1, -1, 1) * 0.55;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // the reader shifts the broadsheet: a soft, darker rustle (the paper really is being handled)
      const rustle = (t, d, g) => { k.play('paper', t, { dur: d, gain: 0.22 * g, minor: true }); k.noise(t, { minor: true, dur: d, color: 'pink', filter: 'lowpass', f: 900, gain: 0.08 * g, a: d * 0.4 }); };
      // knuckle / finger on the page: a soft papery knock
      const knock = (t, g, p, minor) => { k.tone(t, { minor: !!minor, f: [[0, 160], [0.06, 85]], dur: 0.1, gain: 0.32 * g, pan: p }); k.noise(t, { minor: !!minor, dur: 0.05, color: 'pink', filter: 'bandpass', f: 700, q: 0.9, gain: 0.3 * g, a: 0.002, pan: p }); };
      const tap = (t, g, p) => k.noise(t, { minor: true, dur: 0.03, filter: 'bandpass', f: 1100, q: 1.2, gain: 0.22 * g, a: 0.001, pan: p });
      const tick = (t, g, p) => k.noise(t, { minor: true, dur: 0.018, filter: 'bandpass', f: 2000, q: 1.6, gain: 0.22 * g, a: 0.001, pan: p });
      const rulePen = (t, d, g, p) => k.play('stroke', t, { material: 'pen', dur: d, gain: g * 1.5, pan: p, minor: true });
      const grease = (t, d, g, p) => k.play('stroke', t, { material: 'chalk', dur: d, gain: g, pan: p });

      k.bed('room', 0, D, { gain: 0.24 });

      // ---- front page: the reader opens up the paper on the banner headline
      k.play('paper', 0.0, { dur: 0.5, gain: 0.55 });
      knock(0.12, 0.5, 0);
      rustle(2.2, 0.45, 1); // eye drops down to BY THE NUMBERS
      for (let i = 0; i < 8; i++) tap(2.95 + i * 0.17, 0.8, pan(72 + (i % 4) * 104 + 46)); // training pictures appear
      // counter n = 1e6 * nseg(3.0, 5.4)^2.3, ticking faster as it climbs (<= ~11/s)
      for (let t = 3.05; t < 5.36; ) { const s = nseg(t, 3.0, 5.4); tick(t, 0.75 + 0.35 * s, pan(200)); t += 0.18 - 0.09 * s; }
      rulePen(3.75, 0.3, 1.2, pan(546)); // FED IN arrow ruled
      tap(3.9, 0.6, pan(546));
      // 1,000,000 — and counting, ringed in red grease pencil
      knock(5.4, 0.75, pan(230));
      grease(5.42, 0.33, 0.9, pan(230));
      rustle(5.5, 0.3, 0.8); // the reader lifts the paper to turn it

      // ---- the page turn (5.85 -> 6.55): sheet lifts, sweeps over on its left edge and flops down
      k.play('paper', T0, { dur: T1 - T0, gain: 0.9 });
      k.noise(T0, { dur: T1 - T0 + 0.1, color: 'pink', filter: 'bandpass', f: [[0, 300], [(T1 - T0) * 0.5, 1000], [T1 - T0 + 0.1, 280]], q: 0.7, gain: 0.32, a: (T1 - T0) * 0.5 });
      k.play('slap', T1 - 0.04, { gain: 0.35, pan: -0.4 });
      knock(T1 - 0.03, 0.45, -0.4);

      // ---- inside page: GUESS / CHECK / ADJUST
      rulePen(7.0, 0.35, 1.2, pan(362));
      tap(7.1, 0.7, pan(362)); // 1. GUESS
      rulePen(7.4, 0.25, 1.1, pan(818));
      knock(7.65, 0.5, pan(1023), true); // answer box "dog?"
      // wrong: X struck, CHECK, ring in grease pencil, "Wrong — it's a cat."
      k.play('stamp', 8.0, { gain: 0.85, pan: pan(1100) });
      k.play('error', 8.14, { f: 'E3', gain: 0.65, pan: pan(1050) });
      grease(8.12, 0.33, 0.9, pan(1023));
      rulePen(8.55, 0.45, 1.2, pan(860)); // 3. ADJUST arrow back to the knobs
      tap(8.75, 0.6, pan(860));
      for (let i = 1; i <= 4; i++) k.play('tock', when(9.0, 9.5, NE.inOut, (i - 0.5) / 4), { f: 500 + i * 25, gain: 0.3, pan: pan(596), minor: true }); // knobs turned
      knock(9.6, 0.8, pan(1023)); // "cat" — Right, this time.
      k.play('success', when(9.6, 9.8, NE.back, 1), { f: 'C5', gain: 0.5, pan: pan(1100) });

      // ---- the chart
      rustle(10.45, 0.4, 0.8); // eye moves down to the chart
      knock(10.6, 0.4, pan(1142), true); // ACCURACY figure appears
      rulePen(10.95, 1.35, 0.8, pan(870)); // curve ruled along
      for (let t = 10.9, last = 61, lastT = -1; t < 12.32; t += 1 / 120) { const v = Math.round(61 + 36 * NE.inOut(nseg(t, 10.9, 12.3))); if (v !== last && t - lastT >= 0.1) { tick(t, 0.9, pan(1142)); last = v; lastT = t; } }
      // 97%: the biggest hit, then the reader rings it hard
      k.play('impact', 12.3, { gain: 1.1, pan: pan(1142) });
      knock(12.3, 1.1, pan(1142));
      grease(12.37, 0.33, 1.1, pan(1142));

      // ---- the pull quote: rule, linotype sets it left to right, rule, red underline
      rustle(12.85, 0.4, 0.8);
      rulePen(12.95, 0.25, 1.0, -0.3);
      k.play('typing', 13.0, { n: 7, rate: 0.07, gain: 0.55, minor: true });
      rulePen(13.3, 0.25, 1.0, -0.2);
      grease(13.55, 0.3, 0.9, -0.2);
      ['C4', 'G4', 'C5', 'E5'].forEach((f, i) => k.play('ding', 13.6 + i * 0.06, { f, gain: 0.34 - i * 0.05, pan: (i - 1.5) * 0.2 }));
      // the reader lowers the paper: the whole page in view
      rustle(14.5, 0.6, 1.1);
    },
    draw(ctx, W, H_, t) {
      // ---- front ink layer ----
      const ink = H.layer(W, H_), k = ink.getContext('2d');
      const geo = layout(k, H.rng(19), t, false);
      // halftone the photo into the frame (45°, coarse screen, with dot gain)
      const pw = Math.floor(geo.PW_) - 4, ph = geo.PH_ - 4, ph0 = photo(pw, ph, t);
      k.save(); k.beginPath(); k.rect(geo.PX + 2, geo.PY + 2, pw, ph); k.clip();
      k.translate(geo.PX + 2, geo.PY + 2);
      const cell = 5.2, ca = Math.cos(Math.PI / 4), sa = Math.sin(Math.PI / 4), ext = Math.hypot(pw, ph);
      k.beginPath();
      for (let v = -ext; v < ext; v += cell) for (let u = -ext; u < ext; u += cell) {
        const px = u * ca - v * sa, py = u * sa + v * ca;
        if (px < -cell || py < -cell || px > pw + cell || py > ph + cell) continue;
        const sx = Math.min(pw - 1, Math.max(0, px | 0)), sy = Math.min(ph - 1, Math.max(0, py | 0));
        const dark = 1 - H.clamp((ph0[(sy * pw + sx) * 4] / 255 - 0.08) / 0.84);
        const rr = cell * 0.62 * Math.sqrt(Math.max(0, dark * 1.08 - 0.02));
        if (rr < 0.35) continue;
        k.moveTo(px + rr, py); k.arc(px, py, rr, 0, Math.PI * 2);
      }
      k.fill(); k.restore();

      // ---- back page (mirrored, for show-through) ----
      const back = H.layer(W, H_), bk = back.getContext('2d');
      bk.translate(W, 0); bk.scale(-1, 1); layout(bk, H.rng(77), t, true);
      const bkb = H.layer(W, H_), bbx = bkb.getContext('2d'); bbx.filter = 'blur(1.2px)'; bbx.drawImage(back, 0, 0);
      const bd = bbx.getImageData(0, 0, W, H_).data;
      // ink smear: a dragged ghost of the front ink near the headline
      const sm = H.layer(W, H_), smx = sm.getContext('2d'); smx.filter = 'blur(2px)';
      for (let i = 1; i <= 6; i++) smx.drawImage(ink, i * 2.2, 0.4 * i);
      const sd = smx.getImageData(0, 0, W, H_).data;
      const fd = k.getImageData(0, 0, W, H_).data;

      // ---- paper + composite ----
      const nz = H.makeNoise(9);
      const GW = 160, GH = 90, low = new Float32Array(GW * GH * 2);
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { low[(y * GW + x) * 2] = nz.fbm2(x * 0.06, y * 0.06, 4); low[(y * GW + x) * 2 + 1] = nz.fbm2(x * 0.25 + 50, y * 0.25, 3); }
      const lowAt = (x, y, c) => { const fx = x * (GW - 1) / W, fy = y * (GH - 1) / H_, x0 = fx | 0, y0 = fy | 0, tx = fx - x0, ty = fy - y0, x1 = Math.min(GW - 1, x0 + 1), y1 = Math.min(GH - 1, y0 + 1);
        const a = low[(y0 * GW + x0) * 2 + c], b = low[(y0 * GW + x1) * 2 + c], cc = low[(y1 * GW + x0) * 2 + c], d = low[(y1 * GW + x1) * 2 + c];
        return (a * (1 - tx) + b * tx) * (1 - ty) + (cc * (1 - tx) + d * tx) * ty; };
      const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
      const img = ctx.createImageData(W, H_), o = img.data;
      const smearY0 = 200, smearY1 = 262, smearX0 = 760, smearX1 = 1010;
      const creaseY = 470;
      for (let y = 0; y < H_; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const m = lowAt(x, y, 0), f = lowAt(x, y, 1), hh = hash(x, y, 1);
          // yellowed pulp: browner at edges + blotchy, with fibre grain
          const edge = Math.min(x, W - x, y * 1.3, H_ - y) / 120;
          const age = 0.07 * (1 - H.clamp(edge)) + m * 0.035 + f * 0.015;
          let r = PAPER[0] * (1 - age * 0.7) + (hh - 0.5) * 12;
          let g = PAPER[1] * (1 - age * 1.0) + (hh - 0.5) * 12;
          let b = PAPER[2] * (1 - age * 1.6) + (hh - 0.5) * 12;
          if (hash(x >> 1, y >> 1, 4) > 0.9975) { r -= 40; g -= 40; b -= 38; } // dark pulp flecks
          // fold crease
          const cd = y - creaseY - Math.sin(x * 0.004) * 2;
          const crease = Math.exp(-cd * cd / 6) * 0.07 - Math.exp(-(cd - 3) * (cd - 3) / 8) * 0.05;
          r *= 1 - crease; g *= 1 - crease; b *= 1 - crease;
          // show-through from the reverse
          const bt = (bd[i + 3] / 255) * 0.075;
          r *= 1 - bt; g *= 1 - bt * 1.05; b *= 1 - bt * 1.1;
          // front ink: thin, uneven, absorbed into pulp
          let a = fd[i + 3] / 255;
          if (a > 0) {
            const thr = 0.5 + (hash(x, y, 2) - 0.5) * 0.35 + f * 0.15;
            let cov = H.clamp((a - thr) * 3 + 0.5) * 0.65 + a * 0.35;
            let dens = 0.86 + m * 0.12 + (hash(x, y, 3) - 0.5) * 0.12;
            if (hash(x, y, 5) < 0.025) dens *= 0.45;
            cov *= H.clamp(dens);
            r = r * (1 - cov) + INK[0] * cov; g = g * (1 - cov) + INK[1] * cov; b = b * (1 - cov) + INK[2] * cov;
          }
          // smear
          if (y > smearY0 && y < smearY1 && x > smearX0 && x < smearX1) {
            const sx = Math.sin(Math.PI * (x - smearX0) / (smearX1 - smearX0)) * Math.sin(Math.PI * (y - smearY0) / (smearY1 - smearY0));
            const s = (sd[i + 3] / 255) * 0.35 * sx;
            r *= 1 - s; g *= 1 - s; b *= 1 - s;
          }
          o[i] = r; o[i + 1] = g; o[i + 2] = b; o[i + 3] = 255;
        }
      }
      const page = H.layer(W, H_), pc = page.getContext('2d');
      pc.putImageData(img, 0, 0);
      // thumb smudge
      const g = ctx.createRadialGradient(1150, 600, 4, 1150, 600, 46); g.addColorStop(0, 'rgba(40,36,30,0.10)'); g.addColorStop(1, 'rgba(40,36,30,0)');
      pc.fillStyle = g; pc.beginPath(); pc.ellipse(1150, 600, 46, 34, 0.5, 0, 7); pc.fill();

      // ---- camera: spinning-newspaper reveal, then a slow push toward the headline ----
      const SPIN = 1.45;
      const pose = (tt) => { const e = H.ease.out(H.clamp(tt / SPIN)); return { rot: (1 - e) * -Math.PI * 4.2, sc: H.lerp(0.04, 1, e) }; };
      const push = 1 + 0.04 * H.ease.inOut(H.clamp((t - 1.5) / 3.0));
      if (t < SPIN + 0.05) {
        const bg = ctx.createRadialGradient(W / 2, H_ / 2, 50, W / 2, H_ / 2, 760);
        bg.addColorStop(0, '#2b2622'); bg.addColorStop(1, '#0b0a09');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
        const drawAt = (tt, a) => {
          const p = pose(tt);
          ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, H_ / 2); ctx.rotate(p.rot); ctx.scale(p.sc, p.sc);
          ctx.drawImage(page, -W / 2, -H_ / 2); ctx.restore();
        };
        // smeared trail of the spin (motion blur)
        for (let k = 4; k >= 1; k--) drawAt(t - k * 0.018, 0.14);
        const p = pose(t);
        ctx.save(); ctx.translate(W / 2, H_ / 2); ctx.rotate(p.rot); ctx.scale(p.sc, p.sc);
        ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40 * p.sc; ctx.shadowOffsetY = 12 * p.sc;
        ctx.drawImage(page, -W / 2, -H_ / 2); ctx.restore();
      } else {
        const fx = 640, fy = 230;
        ctx.drawImage(page, fx - fx / push, fy - fy / push, W / push, H_ / push, 0, 0, W, H_);
      }
    },
  });
}
