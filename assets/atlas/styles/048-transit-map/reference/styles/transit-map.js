{
  // Schematic metro diagram (Beck tradition): 0/45/90 lines, rounded corners, ticks, interchange rings.
  const BG = '#F7F5EF', INK = '#1B1F3B', LW = 12, R = 26;

  const LINES = [
    { id: 'data', name: 'Data Line', color: '#0A6CB8', pts: [[90, 200], [330, 200], [430, 300], [660, 300]] },
    { id: 'train', name: 'Training Line', color: '#DC2A26', pts: [[90, 440], [520, 440], [660, 300], [760, 300], [840, 380], [1100, 380]] },
    { id: 'inf', name: 'Inference Line', color: '#00894A', pts: [[1100, 380], [1100, 480], [1040, 540], [420, 540]] },
    { id: 'fb', name: 'Feedback Loop', color: '#F39419', pts: [[680, 540], [680, 480], [350, 480], [350, 110]] },
    { id: 'safe', name: 'Safety Line', color: '#8B4A9C', pts: [[880, 110], [880, 620]] },
  ];

  // stations: [name, x, y, line(s), label side, opts]
  // side: n s e w ne nw se sw ; interchange if >1 line
  const ST = [
    ['Web Crawl', 90, 200, ['data'], 'n', { term: true }],
    ['Forums', 180, 200, ['data'], 'n'],
    ['Code Repos', 265, 200, ['data'], 'n'],
    ['Synthetic Data', 350, 220, ['data', 'fb'], 'e2', { dy: -9 }],
    ['Filtering', 470, 300, ['data'], 's'],
    ['Tokenizer', 565, 300, ['data'], 's'],
    ['Pretraining', 660, 300, ['data', 'train'], 'n', { big: true, dy: -2 }],

    ['Human Labels', 90, 440, ['train'], 's', { term: true }],
    ['Annotation', 220, 440, ['train'], 's'],
    ['Preference Data', 350, 440, ['fb', 'train'], 'nw', { dy: -4 }],
    ['Curriculum', 590, 370, ['train'], 'e'],
    ['Checkpoints', 726, 300, ['train'], 's'],
    ['Fine-Tune', 880, 380, ['train', 'safe'], 'ne', { dy: -5 }],
    ['RLHF', 1005, 380, ['train'], 'n'],
    ['Eval Suite', 1100, 380, ['train', 'inf'], 'e'],

    ['Deploy', 1100, 438, ['inf'], 'e'],
    ['API Gateway', 990, 540, ['inf'], 'n'],
    ['Guardrails', 880, 540, ['inf', 'safe'], 'se', { dy: 2 }],
    ['Agents', 780, 540, ['inf'], 's'],
    ['Chat App', 680, 540, ['inf', 'fb'], 's'],
    ['Search', 560, 540, ['inf'], 's'],
    ['Edge Devices', 420, 540, ['inf'], 's', { term: true }],

    ['Simulators', 350, 110, ['fb'], 'e', { term: true }],
    ['User Ratings', 455, 480, ['fb'], 's'],
    ['Logs', 575, 480, ['fb'], 's'],

    ['Red Team', 880, 110, ['safe'], 'e', { term: true }],
    ['Policy', 880, 220, ['safe'], 'e'],
    ['Bias Audit', 880, 462, ['safe'], 'w'],
    ['Monitoring', 880, 620, ['safe'], 'e', { term: true }],
  ];

  function roundedPath(ctx, pts, r) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) ctx.arcTo(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], r);
    const l = pts[pts.length - 1]; ctx.lineTo(l[0], l[1]);
  }
  // dense polyline of the rounded path (quadratic corners), with cumulative length
  function densePath(pts, r) {
    const out = [[pts[0][0], pts[0][1]]];
    for (let i = 1; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], [cx, cy] = pts[i + 1];
      const l1 = Math.hypot(bx - ax, by - ay), l2 = Math.hypot(cx - bx, cy - by);
      const rr = Math.min(r * 0.9, l1 / 2, l2 / 2);
      const p0 = [bx - (bx - ax) / l1 * rr, by - (by - ay) / l1 * rr], p2 = [bx + (cx - bx) / l2 * rr, by + (cy - by) / l2 * rr];
      for (let k = 0; k <= 10; k++) {
        const u = k / 10, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
        out.push([a * p0[0] + b * bx + c * p2[0], a * p0[1] + b * by + c * p2[1]]);
      }
    }
    out.push([pts[pts.length - 1][0], pts[pts.length - 1][1]]);
    // subdivide straight runs so sampling is even
    const d = [out[0]];
    for (let i = 1; i < out.length; i++) {
      const [ax, ay] = out[i - 1], [bx, by] = out[i], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 6));
      for (let k = 1; k <= n; k++) d.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n]);
    }
    const cum = [0];
    for (let i = 1; i < d.length; i++) cum.push(cum[i - 1] + Math.hypot(d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1]));
    return { p: d, cum, len: cum[cum.length - 1] };
  }
  function pointAt(dp, s) {
    s = H.clamp(s, 0, dp.len);
    let lo = 0, hi = dp.cum.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (dp.cum[m] < s) lo = m; else hi = m; }
    const f = (s - dp.cum[lo]) / ((dp.cum[hi] - dp.cum[lo]) || 1), a = dp.p[lo], b = dp.p[hi];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, Math.atan2(b[1] - a[1], b[0] - a[0])];
  }
  function distOn(dp, x, y) {
    let best = 1e9, bs = 0;
    dp.p.forEach(([px, py], i) => { const d = (px - x) ** 2 + (py - y) ** 2; if (d < best) { best = d; bs = dp.cum[i]; } });
    return bs;
  }
  function plen(pts) { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; }
  // direction of the line segment that passes through (x,y)
  function dirAt(pts, x, y) {
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
      const u = ((x - ax) * dx + (y - ay) * dy) / (L * L);
      const px = ax + u * dx, py = ay + u * dy;
      if (u >= -0.01 && u <= 1.01 && Math.hypot(px - x, py - y) < 2) return [dx / L, dy / L];
    }
    return [1, 0];
  }
  // ---- print finish: cached paper texture (low-frequency mottle of about +-4% plus sparse fibres) ----
  const TMC = {};
  const paperTex = (W, H_) => {
    const key = 'paper' + W + 'x' + H_; if (TMC[key]) return TMC[key];
    const P = H.layer(W, H_), pc = P.getContext('2d');
    const sw = Math.ceil(W / 4), sh = Math.ceil(H_ / 4), sm = H.layer(sw, sh), sc = sm.getContext('2d');
    const id = sc.createImageData(sw, sh), d = id.data, nz = H.makeNoise(4242);
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      const v = nz.fbm2(x * 0.045, y * 0.045, 4) * 0.75 + nz.fbm2(x * 0.22 + 40, y * 0.22, 2) * 0.35;
      const i = (y * sw + x) * 4, dk = v > 0; // darker mottle is a warm grey, lighter spots are white
      d[i] = dk ? 104 : 255; d[i + 1] = dk ? 90 : 255; d[i + 2] = dk ? 66 : 250; d[i + 3] = H.clamp(Math.abs(v) * (dk ? 26 : 24), 0, 255);
    }
    sc.putImageData(id, 0, 0);
    pc.imageSmoothingEnabled = true; pc.drawImage(sm, 0, 0, W, H_);
    // fibres: short, gently curved strands, mostly a shade darker, a few lighter
    const r = H.rng(7171); pc.lineCap = 'round';
    for (let k = 0; k < 420; k++) {
      const x = r.range(0, W), y = r.range(0, H_), a = r.range(0, Math.PI * 2), len = r.range(6, 22), bend = r.range(-0.6, 0.6);
      const dark = r() < 0.75; pc.strokeStyle = dark ? `rgba(90,76,52,${r.range(0.07, 0.16)})` : `rgba(255,255,250,${r.range(0.3, 0.5)})`; pc.lineWidth = r.range(0.4, 0.9);
      pc.beginPath(); pc.moveTo(x, y); pc.quadraticCurveTo(x + Math.cos(a + bend) * len * 0.5, y + Math.sin(a + bend) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len); pc.stroke();
    }
    return (TMC[key] = P);
  };
  const paperFinish = (ctx, W, H_) => ctx.drawImage(paperTex(W, H_), 0, 0, W, H_);
  // ---- amber dot-matrix departure board: a classic 5x7 LED font set onto the board's LED grid; each font dot
  // covers k x k LEDs, every lit LED is a round dot with bloom, unlit LEDs stay faintly visible ----
  const F57 = { 'A':18842895918, 'B':16694887983, 'C':15603893806, 'D':7836583207, 'E':33321092159, 'F':1108837439, 'G':32801457710, 'H':18842895921, 'I':15170932878, 'J':6753100060, 'K':18560947505, 'L':33320633377, 'M':18842572657, 'N':18850958897, 'O':15621211694, 'P':1108854319, 'Q':23946905134, 'R':18561353263, 'S':16660235326, 'T':4433514655, 'U':15621211697, 'V':4648912433, 'W':11464787505, 'X':18834663985, 'Y':4433521201, 'Z':33321787935, '0':15623448110, '1':15170932932, '2':33357578798, '3':15619854623, '4':8891181448, '5':15620127807, '6':15621129292, '7':2216829471, '8':15621113390, '9':6728664622, ',':2287992832, '%':26610901603, '→':143630464, ' ':0 };
  const ledDots = (col, P) => { // one pitch-sized tile (drawn at 4x) holding a soft round dot
    const key = 'dot' + col + P; if (TMC[key]) return TMC[key];
    const T = H.layer(P * 4, P * 4), tc = T.getContext('2d'); tc.scale(4, 4);
    const g = tc.createRadialGradient(P / 2, P / 2, 0, P / 2, P / 2, P * 0.46);
    g.addColorStop(0, col); g.addColorStop(0.78, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    tc.fillStyle = g; tc.fillRect(0, 0, P, P);
    return (TMC[key] = T);
  };
  function ledBoard(ctx, bx, by, bw, bh, a, fn, LEDP = 4) {
    if (a <= 0) return;
    const cols = Math.floor(bw / LEDP), rows = Math.floor(bh / LEDP), cell = new Uint8Array(cols * rows);
    const on = (cx, cy) => { if (cx >= 0 && cy >= 0 && cx < cols && cy < rows) cell[cy * cols + cx] = 1; };
    // writer, in LED cells: text(str, col, topRow, k [, 'center']) and box(c0, r0, c1, r1) outlines
    const led = {
      cols, rows,
      width: (str, k) => (str.length * 6 - 1) * k,
      text(str, c0, r0, k = 1, align) {
        if (align === 'center') c0 = Math.round(c0 - led.width(str, k) / 2);
        [...str].forEach((ch, i) => { const b = F57[ch] || 0, x0 = c0 + i * 6 * k;
          for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (Math.floor(b / 2 ** (r * 5 + c)) % 2) for (let v = 0; v < k; v++) for (let u = 0; u < k; u++) on(x0 + c * k + u, r0 + r * k + v); });
      },
      box(c0, r0, c1, r1) { for (let x = c0; x <= c1; x++) { on(x, r0); on(x, r1); } for (let y = r0; y <= r1; y++) { on(c0, y); on(c1, y); } },
    };
    fn(led);
    // static parts of each board (housing with unlit LEDs, glass and bezel) and its scratch canvases are cached
    const key = 'board' + bw + 'x' + bh + 'p' + LEDP; let BC = TMC[key];
    if (!BC) {
      const sF = LEDP >= 4 ? 1 : 2; // lit-LED raster: at least 4px per LED so the dots stay round
      BC = TMC[key] = { sF, m: H.layer(cols, rows), lit: H.layer(cols * LEDP * sF, rows * LEDP * sF), BL: H.layer(Math.ceil(cols * LEDP / 4) + 8, Math.ceil(rows * LEDP / 4) + 8), house: H.layer(bw, bh), glass: H.layer(bw, bh) };
      const hc = BC.house.getContext('2d'); hc.fillStyle = '#121317'; hc.fillRect(0, 0, bw, bh);
      hc.scale(0.25, 0.25); hc.fillStyle = hc.createPattern(ledDots('rgba(255,170,40,0.085)', LEDP), 'repeat'); hc.fillRect(0, 0, cols * LEDP * 4, rows * LEDP * 4);
      const gc = BC.glass.getContext('2d');
      const gl = gc.createLinearGradient(0, 0, 0, bh); gl.addColorStop(0, 'rgba(255,255,255,0.06)'); gl.addColorStop(0.35, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(0,0,0,0.12)');
      gc.fillStyle = gl; gc.fillRect(0, 0, bw, bh);
      gc.strokeStyle = '#2E313C'; gc.lineWidth = 6; gc.strokeRect(3, 3, bw - 6, bh - 6);
      gc.strokeStyle = 'rgba(255,255,255,0.08)'; gc.lineWidth = 1; gc.strokeRect(6.5, 6.5, bw - 13, bh - 13);
      BC.dotPat = BC.lit.getContext('2d').createPattern(ledDots('#fff', LEDP), 'repeat');
    }
    const mc = BC.m.getContext('2d'), id = mc.createImageData(cols, rows), d = id.data;
    for (let i = 0; i < cell.length; i++) { d[i * 4] = 255; d[i * 4 + 1] = 178; d[i * 4 + 2] = 30; d[i * 4 + 3] = cell[i] ? 255 : 0; }
    mc.putImageData(id, 0, 0);
    // 2) blow each cell up to a round LED
    const lit = BC.lit, lc = lit.getContext('2d');
    lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, lit.width, lit.height);
    lc.imageSmoothingEnabled = false; lc.drawImage(BC.m, 0, 0, lit.width, lit.height);
    lc.globalCompositeOperation = 'destination-in'; lc.fillStyle = BC.dotPat;
    lc.setTransform(BC.sF / 4, 0, 0, BC.sF / 4, 0, 0); lc.fillRect(0, 0, lit.width * 4 / BC.sF, lit.height * 4 / BC.sF);
    // bloom: blurred at quarter resolution (cheap)
    const BL = BC.BL, blc = BL.getContext('2d');
    blc.clearRect(0, 0, BL.width, BL.height); blc.filter = 'blur(1.6px)'; blc.drawImage(lit, 4, 4, cols * LEDP / 4, rows * LEDP / 4); blc.filter = 'none';
    // 3) housing, bloom, lit LEDs, glass + bezel
    const ox = bx, oy = by; // the LED grid starts at the board corner so text origins land on whole cells
    ctx.save(); ctx.globalAlpha = a;
    ctx.drawImage(BC.house, bx, by);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    ctx.drawImage(BL, ox - 16, oy - 16, BL.width * 4, BL.height * 4);
    ctx.globalAlpha = a; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(lit, ox, oy, cols * LEDP, rows * LEDP);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * 0.6; // hot LED cores so the sign reads at a glance
    ctx.drawImage(lit, ox, oy, cols * LEDP, rows * LEDP);
    ctx.globalAlpha = a; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(BC.glass, bx, by);
    ctx.restore();
  }

  const SIDE = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0], ne: [0.7071, -0.7071], nw: [-0.7071, -0.7071], se: [0.7071, 0.7071], sw: [-0.7071, 0.7071], e2: [1, 0] };

  registerStyle({
    id: 'transit-map',
    name: 'Transit Map',
    category: 'Data & Information',
    description: 'A Beck-style metro diagram of an AI pipeline: fat coloured lines locked to 0/45/90 degrees with rounded bends, line-colour station ticks, black-ringed interchanges, a river and a boxed legend, all in clean sans lettering.',
    motion: 'Title and key settle, then each line draws out from its terminus in turn with stations ticking on and interchanges popping as the line passes; once the network is complete, small trains glide along every route.',
    duration: 7,
    fonts: ['600 14px "Inter"', '800 14px "Inter"', '400 12px "Inter"', '800 30px "Inter"', 'italic 400 15px "Libre Baskerville"', '600 15px "Inter"', '800 15px "Inter"', '800 18px "Inter"', '800 44px "Inter"', '400 46px "VT323"', '800 22px "Inter"', '800 24px "Inter"', '700 20px "Inter"', '800 68px "Inter"', '400 96px "VT323"'],
    frameT: 6.8,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H_);
      paperFinish(ctx, W, H_); // paper mottle and fibres, printed over by the ink

      const seg = (a, b) => H.clamp((t - a) / (b - a));
      // ---- river: the Data Lake (washes in first) ----
      const river = [[300, 790], [430, 660], [1300, 660]];
      ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
      ctx.globalAlpha = seg(0, 0.6);
      roundedPath(ctx, river, 60); ctx.strokeStyle = '#BFDDEB'; ctx.lineWidth = 34; ctx.stroke();
      ctx.save(); ctx.font = 'italic 400 15px "Libre Baskerville"'; ctx.fillStyle = '#4B8DB0'; ctx.textAlign = 'left';
      let lx = 1030; for (const ch of 'Data Lake') { ctx.fillText(ch, lx, 665); lx += ctx.measureText(ch).width + 2.5; }
      ctx.restore();
      ctx.globalAlpha = 1;

      // ---- lines draw on in sequence, from their first terminus ----
      const TIMES = { data: [0.5, 1.7], train: [0.95, 2.45], inf: [1.7, 2.7], fb: [2.15, 3.05], safe: [2.55, 3.4] };
      const prog = {}, drawnLen = {}, DP = {};
      LINES.forEach((ln) => {
        DP[ln.id] = densePath(ln.pts, R);
        prog[ln.id] = H.ease.inOut(seg(...TIMES[ln.id]));
        drawnLen[ln.id] = prog[ln.id] * DP[ln.id].len;
      });
      ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
      LINES.forEach((ln) => {
        const dp = DP[ln.id], target = drawnLen[ln.id]; if (target <= 0) return;
        ctx.beginPath(); ctx.moveTo(dp.p[0][0], dp.p[0][1]);
        for (let i = 1; i < dp.p.length && dp.cum[i] <= target; i++) ctx.lineTo(dp.p[i][0], dp.p[i][1]);
        const e = pointAt(dp, target); ctx.lineTo(e[0], e[1]);
        ctx.strokeStyle = ln.color; ctx.globalAlpha = 0.16; ctx.lineWidth = LW + 1.6; ctx.stroke(); // ink spread into the paper
        ctx.globalAlpha = 1; ctx.lineWidth = LW; ctx.stroke();
      });

      const lineById = Object.fromEntries(LINES.map((l) => [l.id, l]));
      // a station appears when any of its lines has been drawn past it; returns 0..1 pop progress
      const stPop = (s) => {
        let best = 0;
        for (const id of s[3]) {
          const dp = DP[id], d = distOn(dp, s[1], s[2]);
          // how far (in px) the drawing head is beyond this station, mapped to a short pop
          if (drawnLen[id] > 0.5) best = Math.max(best, H.clamp((drawnLen[id] - d + 6) / 40));
          // far terminus: pop over the last moments of the line's draw
          if (d > dp.len - 2) best = Math.max(best, H.clamp((drawnLen[id] - dp.len + 3) / 3));
        }
        return best;
      };
      const pops = ST.map(stPop);
      const shown = (s) => pops[ST.indexOf(s)] > 0;

      // ---- stations: ticks + terminus bars ----
      ST.forEach((s) => {
        const [name, x, y, ids, side, o = {}] = s;
        if (ids.length > 1 || !shown(s)) return;
        const ln = lineById[ids[0]];
        const [dx, dy] = dirAt(ln.pts, x, y);
        ctx.fillStyle = ln.color; ctx.strokeStyle = ln.color; ctx.lineCap = 'butt';
        const pp = H.ease.out(pops[ST.indexOf(s)]);
        if (o.term) {
          // terminus: perpendicular bar across the line
          ctx.lineWidth = 7; ctx.beginPath();
          ctx.moveTo(x - dy * 15 * pp, y + dx * 15 * pp); ctx.lineTo(x + dy * 15 * pp, y - dx * 15 * pp); ctx.stroke();
        } else {
          // tick toward label side
          let [sx, sy] = SIDE[side];
          const nx = -dy, ny = dx, k = Math.sign(nx * sx + ny * sy) || 1;
          ctx.lineWidth = 6; ctx.beginPath();
          ctx.moveTo(x, y); ctx.lineTo(x + nx * k * (LW / 2 + 7) * pp, y + ny * k * (LW / 2 + 7) * pp); ctx.stroke();
        }
      });

      // ---- interchanges: white ring, black outline ----
      ST.forEach((s) => {
        const [name, x, y, ids, side, o = {}] = s;
        if (ids.length < 2 || !shown(s)) return;
        const rr = (o.big ? 13 : 10.5) * Math.max(0.01, H.ease.back(pops[ST.indexOf(s)]));
        ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 3.6;
        ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });

      // ---- labels ----
      ctx.textBaseline = 'middle';
      ST.forEach((s) => {
        const [name, x, y, ids, side, o = {}] = s;
        if (!shown(s)) return;
        const inter = ids.length > 1;
        ctx.font = inter || o.term ? '800 14px "Inter"' : '600 14px "Inter"';
        ctx.fillStyle = INK;
        const [sx, sy] = SIDE[side];
        const off = inter ? (o.big ? 21 : 18) : o.term ? 22 : LW / 2 + 12;
        let tx = x + sx * off, ty = y + sy * off;
        ctx.textAlign = sx > 0.1 ? 'left' : sx < -0.1 ? 'right' : 'center';
        if (side === 'n') ty -= 3; if (side === 's') ty += 3;
        if (side === 'e2') { tx += 2; }
        ty += o.dy || 0;
        ctx.globalAlpha = H.clamp(pops[ST.indexOf(s)] * 1.6 - 0.4);
        ctx.strokeStyle = BG; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.strokeText(name, tx, ty); // paper knockout halo
        ctx.fillText(name, tx, ty);
        ctx.globalAlpha = 1;
      });

      // ---- trains: once the network is complete, small cars glide along every route ----
      ctx.textBaseline = 'alphabetic';
      const ta = seg(3.5, 4.0);
      if (ta > 0) {
        const tr = H.rng(808);
        LINES.forEach((ln) => {
          const dp = DP[ln.id], nT = dp.len > 700 ? 2 : 1;
          for (let k = 0; k < nT; k++) {
            const speed = tr.range(70, 95), phase = tr.range(0, 1);
            // ping-pong along the line with gentle easing near the termini
            const cyc = (t - 3.5) * speed / dp.len + phase + k * 0.5;
            const f = cyc % 2, u = f < 1 ? f : 2 - f;
            const sPos = H.lerp(14, dp.len - 14, 0.5 - 0.5 * Math.cos(Math.PI * u));
            const [px, py, ang] = pointAt(dp, sPos);
            ctx.save(); ctx.translate(px, py); ctx.rotate(ang); ctx.globalAlpha = ta;
            ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.roundRect(-9, -3.6, 18, 7.2, 3.6); ctx.fill(); ctx.stroke();
            ctx.restore();
          }
        });
      }

      // ---- title block (top right) ----
      const tp = H.ease.out(seg(0, 0.6));
      ctx.save(); ctx.globalAlpha = tp; ctx.translate(0, (1 - tp) * -14);
      const tx0 = 990, ty0 = 40;
      ctx.fillStyle = INK; ctx.fillRect(tx0, ty0, 250, 108);
      // mark: three lines meeting at an interchange ring
      const mx = tx0 + 46, my = ty0 + 50;
      ctx.lineCap = 'butt'; ctx.lineWidth = 8;
      [['#0A6CB8', [mx - 34, my], [mx, my]], ['#DC2A26', [mx - 26, my + 30], [mx, my]], ['#00894A', [mx, my], [mx + 0, my + 38]], ['#F39419', [mx, my - 34], [mx, my]]]
        .forEach(([c, a1, b1]) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(...a1); ctx.lineTo(...b1); ctx.stroke(); });
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.arc(mx, my, 10, 0, 7); ctx.fill();
      ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(mx, my, 7, 0, 7); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
      ctx.font = '800 30px "Inter"'; ctx.fillText('AI Pipeline', tx0 + 84, ty0 + 52);
      ctx.font = '400 12px "Inter"'; ctx.fillStyle = '#C9CCE0';
      ctx.fillText('NETWORK MAP · 2026', tx0 + 84, ty0 + 76);
      ctx.restore();

      // ---- legend (bottom left) ----
      const gx = 40, gy = 512, gw = 270, gh = 168;
      ctx.save(); ctx.globalAlpha = seg(0.2, 0.6);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#fff'; ctx.fillRect(gx, gy, gw, gh);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(gx + 0.5, gy + 0.5, gw, gh);
      ctx.font = '800 14px "Inter"'; ctx.fillStyle = INK; ctx.fillText('Key to lines', gx + 16, gy + 26);
      LINES.forEach((ln, i) => {
        const yy = gy + 48 + i * 22;
        ctx.fillStyle = ln.color; ctx.fillRect(gx + 16, yy - 5, 44 * H.ease.out(seg(0.35 + i * 0.07, 0.65 + i * 0.07)), 10);
        ctx.fillStyle = INK; ctx.font = '600 14px "Inter"'; ctx.textBaseline = 'middle';
        ctx.fillText(ln.name, gx + 72, yy + 1);
      });
      // symbol key
      ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.arc(gx + 214, gy + 52, 7, 0, 7); ctx.fill(); ctx.stroke();
      ctx.font = '400 12px "Inter"'; ctx.fillStyle = INK; ctx.textAlign = 'center';
      ctx.fillText('Interchange', gx + 214, gy + 72);
      ctx.fillStyle = '#6A6D80'; ctx.fillRect(gx + 196, gy + 100, 36, 8); ctx.fillRect(gx + 211, gy + 92, 6, 9);
      ctx.fillStyle = INK; ctx.fillText('Station', gx + 214, gy + 118);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.restore();

      // footnote
      ctx.font = '400 12px "Inter"'; ctx.fillStyle = '#6A6D80'; ctx.textAlign = 'right';
      ctx.fillText('Diagram not to scale · illustrative network', W - 40, 700);

      H.grain(ctx, W, H_, 0.018, 3 + Math.floor(t * 12));
    },
    // Sound: a quiet station. Platform chimes (soft sine bells, kept low) open and resolve the journey, lines lay
    // down with a smooth low track hum, stations click onto the map as the line reaches them, the train runs on an
    // electric motor swell with bogie clacks over rail joints, and the amber board ticks its relay digits and
    // clatters as it flips to the takeaway. Geometry and times mirror explainer() below.
    explainerSound(k) {
      const D = 15;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      const seg = (t, a, b) => H.clamp((t - a) / (b - a));
      const io = H.ease.inOut;
      // the explainer's network (same points as explainer())
      const dpD = densePath([[80, 380], [900, 380]], 30);
      const dpL = densePath([[900, 380], [900, 300], [1000, 200], [1400, 200], [1500, 300], [1500, 460], [1400, 560], [1000, 560], [900, 460], [900, 381]], 40);
      const dpA = densePath([[1500, 380], [2620, 380]], 30);
      const sGuess = distOn(dpL, 1200, 200), sCheck = distOn(dpL, 1500, 380), sAdj = distOn(dpL, 1200, 560);

      // platform chime: soft sine bell with a quiet octave, nothing above ~1.6 kHz
      const chime = (t, notes, g = 1, gap = 0.32, p = 0) => notes.forEach((n, i) => {
        const f = k.hz(n);
        k.tone(t + i * gap, { f, dur: 1.4, gain: 0.2 * g, a: 0.006, verb: 0.35, pan: p });
        k.tone(t + i * gap, { f: f * 2, dur: 0.45, gain: 0.03 * g, a: 0.004, pan: p });
      });
      // a station marker clicks onto the map
      const station = (t, g = 1, p = 0) => k.withMinor(() => {
        k.noise(t, { dur: 0.02, filter: 'bandpass', f: 1500, q: 1.5, gain: 0.22 * g, a: 0.001, pan: p });
        k.tone(t, { f: [[0, 520], [0.06, 300]], dur: 0.08, gain: 0.12 * g, pan: p });
      });
      // line laying: a smooth low hum whose brightness follows the draw speed
      const lay = (t0, t1, p0, p1) => k.noise(t0, { dur: t1 - t0, color: 'brown', filter: 'bandpass', f: [[0, 180], [(t1 - t0) * 0.5, 520], [t1 - t0, 180]], q: 1.2, gain: 0.2, a: (t1 - t0) * 0.4, pan: (p0 + p1) / 2, minor: true });
      // train run from s0 to s1 (path units) with ease inOut over [t0,t1]: motor swell + bogie clacks every 90 px
      const run = (t0, t1, s0, s1, p = 0, g = 1) => {
        const d = t1 - t0;
        k.tone(t0, { f: [[0, 70], [d * 0.5, 140], [d, 70]], type: 'sawtooth', dur: d + 0.05, gain: 0.07 * g, a: d * 0.35, filter: 'lowpass', f2: 520, pan: p });
        k.noise(t0, { dur: d + 0.05, color: 'brown', filter: 'lowpass', f: 400, gain: 0.18 * g, a: d * 0.3, pan: p });
        for (let s = 90; s < Math.abs(s1 - s0); s += 90) {
          const tc = when(t0, t1, io, s / Math.abs(s1 - s0));
          k.withMinor(() => [0, 0.045].forEach((o) => { k.noise(tc + o, { dur: 0.025, filter: 'bandpass', f: 900, q: 1.4, gain: 0.22 * g, a: 0.001, pan: p }); k.tone(tc + o, { f: 95, dur: 0.05, gain: 0.12 * g, pan: p }); }));
        }
        k.noise(t1 - 0.12, { dur: 0.28, filter: 'bandpass', f: 2400, q: 0.8, gain: 0.05 * g, a: 0.1, pan: p, minor: true }); // brakes ease off
      };
      // dot-matrix board relay tick
      const relay = (t, g = 1, p = 0) => k.withMinor(() => { k.noise(t, { dur: 0.014, filter: 'bandpass', f: 2000, q: 2.2, gain: 0.2 * g, a: 0.001, pan: p }); k.tone(t, { f: 180, type: 'square', dur: 0.018, gain: 0.025 * g, filter: 'lowpass', f2: 600, pan: p }); });
      const counter = (t0, t1, steps, p) => { let last = -1, lastT = -1; for (let t = t0; t <= t1 + 1e-6; t += 1 / 120) { const v = Math.floor(io(seg(t, t0, t1)) * steps); if (v !== last && t - lastT >= 1 / 12) { relay(t, 0.8 + 0.3 * v / steps, p); last = v; lastT = t; } } };
      // camera move: a soft low air shift, no swoosh
      const glide = (t0, t1, g = 1) => k.noise(t0, { dur: t1 - t0 + 0.1, color: 'pink', filter: 'bandpass', f: [[0, 240], [(t1 - t0) * 0.5, 480], [t1 - t0 + 0.1, 220]], q: 0.7, gain: 0.08 * g, a: (t1 - t0) * 0.45 });

      k.bed('room', 0, D, { gain: 0.45 });

      // ---- title block + opening chime; title docks 1.4 -> 2.2
      chime(0.05, ['E5', 'C5'], 0.7, 0.36);
      k.noise(1.4, { dur: 0.8, filter: 'bandpass', f: [[0, 400], [0.8, 700]], q: 0.7, gain: 0.06, a: 0.3, pan: -0.4, minor: true });

      // ---- Data Line lays 0.9 -> 2.5, its stations click on as it reaches them
      lay(0.9, 2.5, -0.6, 0.4);
      station(0.95, 0.9, -0.85); // terminus bar
      [230, 450, 670].forEach((x) => station(when(0.9, 2.5, io, (x - 86) / dpD.len), 1, (x - 490) / 640 * 1.2));
      k.play('pop', when(2.1, 2.5, (u) => u, 0.15), { f: 330, gain: 0.7, pan: 0.6 }); // MODEL interchange ring opens
      relay(2.3, 1.2, -0.1); k.tone(2.3, { f: 100, dur: 0.3, gain: 0.04, a: 0.05 }); // board lights
      // examples ride the line into the model: a faint rolling rumble under the count
      k.noise(2.4, { dur: 3.9, color: 'brown', filter: 'lowpass', f: 260, gain: 0.1, a: 0.5, hold: 2.9, pan: 0.1 });
      counter(2.5, 5.8, 30, -0.1);
      k.play('tock', 5.8, { f: 420, gain: 0.45, pan: -0.1 }); // 1,000,000 settles on the board

      // ---- camera to the Training Loop; the red line lays 6.1 -> 7.0 with its stations
      glide(6.0, 6.7);
      lay(6.1, 7.0, -0.3, 0.3);
      [[sGuess, 0], [sCheck, 0.55], [sAdj, 0]].forEach(([s, p]) => station(when(6.1, 7.0, io, (s - 6) / dpL.len), 1.1, p));

      // ---- the loop journey (train positions from explainer's trainS)
      run(6.9, 7.4, 0, sGuess, -0.2);
      k.play('pop', 7.4, { f: 300, gain: 0.5, minor: true }); // "dog?" board in the loop
      // wrong guess: a low minor platform tone, the red X
      k.tone(7.45, { f: 'D4', dur: 0.5, gain: 0.2, a: 0.006, verb: 0.25 });
      k.tone(7.68, { f: 'B3', dur: 0.8, gain: 0.2, a: 0.006, verb: 0.25 });
      k.tone(7.45, { f: 'D3', type: 'triangle', dur: 1.0, gain: 0.08, a: 0.01, filter: 'lowpass', f2: 500 });
      run(8.0, 8.5, sGuess, sCheck, 0.4);
      k.play('pop', 8.5, { f: 360, gain: 0.55, pan: 0.4 }); // "Answer: cat"
      chime(8.52, ['A4'], 0.6, 0, 0.4);
      run(8.9, 9.4, sCheck, sAdj, 0.2, 1.1); // error signal heads back
      k.play('tock', 9.2, { f: 360, gain: 0.35, pan: -0.1, minor: true }); // weights panel
      [9.48, 9.58, 9.68, 9.78].forEach((t, i) => k.play('tock', t, { f: 600 + i * 30, gain: 0.3, pan: -0.15, minor: true })); // slider knobs notch along
      run(9.8, 10.2, sAdj, dpL.len + sGuess, -0.3);
      chime(10.22, ['C5', 'E5', 'G5'], 0.65, 0.12); // "cat": correct, the bright platform chime

      // ---- out along the Accuracy Line
      glide(10.5, 11.2, 1.2);
      lay(10.7, 11.6, -0.3, 0.7);
      [1760, 2040, 2320].forEach((x, i) => station(when(10.7, 11.6, io, (x - 1506) / dpA.len), 1, -0.2 + i * 0.25));
      k.play('pop', 11.6, { f: 300, gain: 0.6, pan: 0.7 }); // 97% terminus ring
      { // fast train on the accuracy line from 10.9 at 1020 px/s, held behind the line head
        const d = 0.85;
        k.tone(10.9, { f: [[0, 90], [d * 0.6, 170], [d, 110]], type: 'sawtooth', dur: d, gain: 0.06, a: 0.2, filter: 'lowpass', f2: 600, pan: 0.2 });
        for (let s = 120; s < dpA.len; s += 120) { const tc = Math.max(10.9 + s / 1020, when(10.7, 11.6, io, s / dpA.len)); k.noise(tc, { dur: 0.022, filter: 'bandpass', f: 900, q: 1.4, gain: 0.18, a: 0.001, pan: -0.4 + s / dpA.len, minor: true }); }
      }
      relay(11.0, 1.2, -0.1); // accuracy board lights
      counter(11.1, 12.6, 36, -0.1);
      // 97% held, board outlines it: the big hit
      k.play('impact', 12.6, { gain: 0.75, pan: -0.1 });
      chime(12.6, ['G4', 'D5'], 1.4, 0.0);

      // ---- camera pulls out to the whole network; the takeaway board flips
      glide(12.9, 13.6, 1.3);
      relay(13.3, 1.2);
      for (let t = 13.5, i = 0; t < 14.1; t += 1 / 22, i++) k.withMinor(() => k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1600 + (i % 4) * 200, q: 1.6, gain: 0.12 + 0.05 * ((i * 3) % 4) / 3, a: 0.001, pan: -0.6 + (t - 13.5) / 0.6 * 1.2 }));
      chime(14.12, ['C5', 'E5', 'G5', 'C6'], 0.9, 0.18); // takeaway set: the resolving platform chime
    },
    explainerDuration: 15,
    explainerNote: 'The lesson is a journey on the network: the camera rides along a Data Line into the Model interchange, round a Training Loop line (Guess, Check, Adjust stations) and out along an Accuracy Line, while an amber dot-matrix departure board counts examples and accuracy and finally flips to the takeaway.',
    explainer(ctx, W, H_, t) {
      const S = (a, b) => H.clamp((t - a) / (b - a));
      const BLUEL = '#0A6CB8', REDL = '#DC2A26', GRN = '#00894A';
      const LWX = 16; // thicker lines for video
      // ---- network geometry (world coordinates) ----
      const DATA = [[80, 380], [900, 380]];
      const LOOP = [[900, 380], [900, 300], [1000, 200], [1400, 200], [1500, 300], [1500, 460], [1400, 560], [1000, 560], [900, 460], [900, 381]];
      const ACC = [[1500, 380], [2620, 380]];
      const dpD = densePath(DATA, 30), dpL = densePath(LOOP, 40), dpA = densePath(ACC, 30);
      const sGuess = distOn(dpL, 1200, 200), sCheck = distOn(dpL, 1500, 380), sAdj = distOn(dpL, 1200, 560);

      // ---- camera: [time, scale, world x, world y] -> world point lands at screen (640, 360) ----
      const CK = [[0, 1.35, 490, 330], [6.0, 1.35, 490, 330], [6.7, 1.5, 1200, 380], [10.5, 1.5, 1200, 380], [11.2, 1.0, 2060, 440], [12.9, 1.0, 2060, 440], [13.6, 0.47, 1350, 330], [15, 0.47, 1350, 330]];
      let cs = 0.47, cx = 1350, cyw = 330;
      for (let i = 0; i < CK.length - 1; i++) if (t >= CK[i][0] && t <= CK[i + 1][0]) { const u = H.ease.inOut((t - CK[i][0]) / (CK[i + 1][0] - CK[i][0])); cs = H.lerp(CK[i][1], CK[i + 1][1], u); cx = H.lerp(CK[i][2], CK[i + 1][2], u); cyw = H.lerp(CK[i][3], CK[i + 1][3], u); break; }
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H_);
      paperFinish(ctx, W, H_); // paper mottle and fibres, printed over by the ink
      ctx.save(); ctx.translate(W / 2, H_ / 2); ctx.scale(cs, cs); ctx.translate(-cx, -cyw);

      ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
      roundedPath(ctx, [[-400, 690], [700, 690], [800, 640], [2000, 640], [2100, 700], [3200, 700]], 60);
      ctx.strokeStyle = '#BFDDEB'; ctx.lineWidth = 40; ctx.stroke();

      const drawLine = (dp, len, col) => {
        if (len <= 0) return;
        ctx.beginPath(); ctx.moveTo(dp.p[0][0], dp.p[0][1]);
        for (let i = 1; i < dp.p.length && dp.cum[i] <= len; i++) ctx.lineTo(dp.p[i][0], dp.p[i][1]);
        const e = pointAt(dp, len); ctx.lineTo(e[0], e[1]);
        ctx.strokeStyle = col; ctx.globalAlpha = 0.16; ctx.lineWidth = LWX + 1.8; ctx.stroke(); // ink spread
        ctx.globalAlpha = 1; ctx.lineWidth = LWX; ctx.stroke();
      };
      const lD = dpD.len * H.ease.inOut(S(0.9, 2.5)), lL = dpL.len * H.ease.inOut(S(6.1, 7.0)), lA = dpA.len * H.ease.inOut(S(10.7, 11.6));
      drawLine(dpD, lD, BLUEL); drawLine(dpL, lL, REDL); drawLine(dpA, lA, GRN);
      const chevrons = (dp, len, phase) => {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
        for (let s = 40 + (phase % 60); s < len - 20; s += 60) {
          const [x, y, a] = pointAt(dp, s);
          ctx.beginPath(); ctx.moveTo(x - Math.cos(a - 0.8) * 6, y - Math.sin(a - 0.8) * 6); ctx.lineTo(x, y); ctx.lineTo(x - Math.cos(a + 0.8) * 6, y - Math.sin(a + 0.8) * 6); ctx.stroke();
        }
      };
      chevrons(dpD, lD, t * 30); chevrons(dpL, lL, t * 30); chevrons(dpA, lA, t * 30);

      const tick = (x, y, nx, ny, col) => { ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + nx * (LWX / 2 + 9), y + ny * (LWX / 2 + 9)); ctx.stroke(); };
      // labels sized so they read >= 28 px on screen in their beat
      // in the final pull-back (camera scale < 1) labels counter-scale so they keep a minimum on-screen size
      const minPx = (size) => (size >= 34 ? 22 : size >= 24 ? 20 : 17);
      const label = (txt, x, y, align, bold, a = 1, size = 22) => { if (a <= 0) return; const fs = Math.max(size, minPx(size) / cs); ctx.globalAlpha = a; ctx.font = `${bold ? 800 : 600} ${fs}px "Inter"`; ctx.fillStyle = INK; ctx.textAlign = align; ctx.textBaseline = 'middle';
        ctx.strokeStyle = BG; ctx.lineWidth = fs * 0.24; ctx.lineJoin = 'round'; ctx.strokeText(txt, x, y); ctx.fillText(txt, x, y); ctx.globalAlpha = 1; }; // paper knockout halo
      const ring = (x, y, r, a = 1) => { if (a <= 0) return; const rr = r * H.ease.back(H.clamp(a)); ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 4.4; ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, rr), 0, 7); ctx.fill(); ctx.stroke(); };
      const badge = (kind, x, y, a) => { if (a <= 0) return; const k = 1.6; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(-17, -17, 34, 34, 6); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
        if (kind === 'cat') { ctx.beginPath(); ctx.moveTo(-9, -2); ctx.lineTo(-8, -11); ctx.lineTo(-3, -6); ctx.lineTo(3, -6); ctx.lineTo(8, -11); ctx.lineTo(9, -2); ctx.quadraticCurveTo(9, 9, 0, 9); ctx.quadraticCurveTo(-9, 9, -9, -2); ctx.stroke(); }
        else { ctx.beginPath(); ctx.arc(0, 1, 8, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(-9, -1, 3, 7, 0.3, 0, 7); ctx.ellipse(9, -1, 3, 7, -0.3, 0, 7); ctx.fill(); }
        ctx.restore(); };
      [[230, 'Cat Photos', 'cat'], [450, 'Dog Photos', 'dog'], [670, 'Labels', null]].forEach(([x, name, kind]) => {
        const a = H.clamp((lD - (x - 80) + 6) / 30); if (a <= 0) return;
        tick(x, 380, 0, -1, BLUEL); label(name, x, 340, 'center', true, a);
        if (kind) badge(kind, x, 280, a);
      });
      if (lD > 0) { ctx.strokeStyle = BLUEL; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(80, 360); ctx.lineTo(80, 400); ctx.stroke(); label('Training Data', 70, 424, 'left', true, S(0.9, 1.2)); }
      if (t > 2.3 && t < 6.6) {
        for (let k = 0; k < 12; k++) {
          const s = ((t - 2.3) * 170 + k * 68) % dpD.len; if (s > lD) continue;
          const [x, y] = pointAt(dpD, s);
          ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x - 13, y - 5, 26, 10, 5); ctx.fill(); ctx.stroke();
        }
      }
      ring(900, 380, 26, S(2.1, 2.5));
      label('MODEL', 866, 420, 'right', true, S(2.3, 2.7), 24);
      const lp = (s) => H.clamp((lL - s + 6) / 30);
      ring(1200, 200, 16, lp(sGuess)); label('Guess', 1200, 160, 'center', true, lp(sGuess), 24);
      ring(1500, 380, 16, lp(sCheck)); label('Check', 1518, 344, 'left', true, lp(sCheck), 24);
      ring(1200, 560, 16, lp(sAdj)); label('Adjust', 1200, 600, 'center', true, lp(sAdj), 24);

      // ---- the loop journey ----
      const trainS = (() => {
        if (t < 6.9) return -1;
        if (t < 7.4) return sGuess * H.ease.inOut(S(6.9, 7.4));
        if (t < 8.0) return sGuess;
        if (t < 8.5) return H.lerp(sGuess, sCheck, H.ease.inOut(S(8.0, 8.5)));
        if (t < 8.9) return sCheck;
        if (t < 9.4) return H.lerp(sCheck, sAdj, H.ease.inOut(S(8.9, 9.4)));
        if (t < 9.8) return sAdj;
        if (t < 10.2) return H.lerp(sAdj, dpL.len + sGuess, H.ease.inOut(S(9.8, 10.2)));
        return dpL.len + sGuess;
      })();
      const box = (x, y, txt, col, a, size = 22) => { if (a <= 0) return 0; ctx.globalAlpha = a; ctx.font = `800 ${size}px "Inter"`; const w = ctx.measureText(txt).width + 30; const h = size * 1.9; ctx.fillStyle = '#fff'; ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 9); ctx.fill(); ctx.stroke(); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, y + 1); ctx.globalAlpha = 1; return w; };
      // guess bubbles sit inside the loop, just under the Guess station
      const g1 = S(7.4, 7.6) * (1 - S(9.8, 10.0));
      if (g1 > 0) {
        const w = box(1180, 262, 'dog?', INK, g1, 24);
        ctx.globalAlpha = g1; ctx.strokeStyle = REDL; ctx.lineWidth = 5; ctx.lineCap = 'round';
        const xx = 1180 + w / 2 + 12; ctx.beginPath(); ctx.moveTo(xx, 250); ctx.lineTo(xx + 22, 272); ctx.moveTo(xx + 22, 250); ctx.lineTo(xx, 272); ctx.stroke(); ctx.globalAlpha = 1;
        for (let k = 0; k < 2; k++) { const ph = ((t - 7.5) / 0.6 + k * 0.5); if (ph < 0 || t > 8.4) continue; const f = ph % 1; ctx.strokeStyle = H.rgba(REDL, 0.7 * (1 - f)); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(1200, 200, 20 + f * 46, 0, 7); ctx.stroke(); }
      }
      const ck = S(8.5, 8.7) * (1 - S(9.8, 10.0));
      if (ck > 0) box(1340, 380, 'Answer: cat', REDL, ck, 22);
      const g2 = S(10.2, 10.35);
      if (g2 > 0) {
        const w = box(1180, 262, 'cat', GRN, g2 * (1 - S(10.9, 11.1)), 24);
        ctx.globalAlpha = g2 * (1 - S(10.9, 11.1)); ctx.strokeStyle = GRN; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const xx = 1180 + w / 2 + 12; ctx.beginPath(); ctx.moveTo(xx, 262); ctx.lineTo(xx + 9, 272); ctx.lineTo(xx + 28, 248); ctx.stroke(); ctx.globalAlpha = 1;
      }
      const adjA = S(9.2, 9.4) * (1 - S(10.4, 10.7));
      if (adjA > 0) {
        ctx.globalAlpha = adjA;
        ctx.fillStyle = INK; ctx.fillRect(1010, 400, 200, 116);
        ctx.fillStyle = '#C9CCE0'; ctx.font = '700 20px "Inter"'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('WEIGHTS', 1024, 426);
        const mv = H.ease.inOut(S(9.4, 9.8));
        [[0.2, 0.75], [0.7, 0.3], [0.4, 0.85]].forEach(([a0, a1], i) => {
          const y = 448 + i * 24; ctx.fillStyle = '#555a78'; ctx.fillRect(1024, y, 170, 5);
          ctx.fillStyle = '#F39419'; ctx.fillRect(1024 + 160 * H.lerp(a0, a1, mv), y - 6, 10, 17);
        });
        ctx.globalAlpha = 1;
      }
      if (trainS >= 0) {
        const red = t >= 8.9 && t < 9.8;
        const [x, y, a] = pointAt(dpL, trainS % dpL.len);
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        ctx.fillStyle = red ? INK : '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.roundRect(-22, -8, 44, 16, 8); ctx.fill(); ctx.stroke();
        ctx.restore();
        if (red) { ctx.save(); ctx.font = '800 22px "Inter"'; ctx.fillStyle = REDL; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('error signal', x + 30, y - 22); ctx.restore(); }
        if (t >= 6.9 && t < 7.6) { ctx.save(); ctx.globalAlpha = 1 - S(7.4, 7.6); ctx.font = '700 22px "Inter"'; ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('a new cat photo', x + 30, y + 4); ctx.restore(); }
      }
      const accS = [[1760, '61%'], [2040, '80%'], [2320, '90%'], [2620, '97%']];
      accS.forEach(([x, name], i) => {
        const a = i === 3 ? H.clamp((lA - dpA.len + 3) / 3) : H.clamp((lA - (x - 1500) + 6) / 30); if (a <= 0) return;
        if (i < 3) { tick(x, 380, 0, -1, GRN); label(name, x, 336, 'center', true, a, 30); }
        else { ring(x, 380, 24, a); label(name, x, 326, 'center', true, a, 34); }
      });
      label('Accuracy Line', 1540, 424, 'left', true, S(10.9, 11.3), 24);
      const pulse = S(12.0, 12.8);
      if (pulse > 0 && pulse < 1) for (let k = 0; k < 2; k++) { const f = (pulse * 2 + k * 0.5) % 1; ctx.strokeStyle = H.rgba(GRN, 0.7 * (1 - f)); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(2620, 380, 28 + f * 56, 0, 7); ctx.stroke(); }
      if (t > 10.9) {
        const s = Math.min(dpA.len, (t - 10.9) * 1020);
        const [x, y] = pointAt(dpA, Math.min(s, lA)); ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.roundRect(x - 22, y - 8, 44, 16, 8); ctx.fill(); ctx.stroke();
      }
      ctx.restore();

      // ---- title block: big, then docked to the corner ----
      {
        const d = H.ease.inOut(S(1.4, 2.2));
        const bw = H.lerp(860, 352, d), bh = H.lerp(200, 76, d), bx = H.lerp(210, 24, d), by = H.lerp(240, 20, d);
        ctx.globalAlpha = S(0, 0.3);
        ctx.fillStyle = INK; ctx.fillRect(bx, by, bw, bh);
        const mxp = bx + bh * 0.42, myp = by + bh / 2, k = bh / 108;
        ctx.lineCap = 'butt'; ctx.lineWidth = 8 * k;
        [[BLUEL, [mxp - 34 * k, myp], [mxp, myp]], [REDL, [mxp - 26 * k, myp + 30 * k], [mxp, myp]], [GRN, [mxp, myp], [mxp, myp + 38 * k]], ['#F39419', [mxp, myp - 34 * k], [mxp, myp]]]
          .forEach(([c, a1, b1]) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(...a1); ctx.lineTo(...b1); ctx.stroke(); });
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mxp, myp, 10 * k, 0, 7); ctx.fill();
        ctx.strokeStyle = INK; ctx.lineWidth = 3.5 * k; ctx.beginPath(); ctx.arc(mxp, myp, 7 * k, 0, 7); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.font = `800 ${H.lerp(68, 28, d)}px "Inter"`; ctx.fillText('How does AI learn?', bx + bh * 0.85, by + bh * 0.58);
        ctx.font = `400 ${H.lerp(22, 12, d)}px "Inter"`; ctx.fillStyle = '#C9CCE0'; ctx.fillText('A JOURNEY IN THREE LINES', bx + bh * 0.85, by + bh * 0.82);
        ctx.globalAlpha = 1;
      }
      // ---- departure board (amber dot-matrix): hero counter under the line ----
      const scr = (str, seed) => { const r = H.rng(seed); return str.replace(/[0-9A-Z]/g, () => '0123456789ABCDEFGHJKLMNPRSTUVWXYZ'[Math.floor(r() * 33)]); };
      const board = (bx, by, bw, bh, a, fn, P) => ledBoard(ctx, bx, by, bw, bh, a, fn, P);
      const dataB = S(2.3, 2.6) * (1 - S(6.0, 6.3));
      board(380, 470, 520, 150, dataB, (led) => { // 4px LED pitch: 130 x 37 LEDs
        led.text('EXAMPLES LOADED', 6, 5, 1);
        const n = Math.round(1e6 * H.ease.inOut(S(2.5, 5.8)) / 1000) * 1000;
        led.text(n.toLocaleString('en-US'), 6, 17, 2);
      });
      const accB = S(11.0, 11.3) * (1 - S(13.2, 13.4));
      board(390, 395, 500, 160, accB, (led) => { // 125 x 40 LEDs; the number fills the board at 3x3 LEDs per dot
        const p = H.ease.inOut(S(11.1, 12.6)), val = Math.round(61 + 36 * p) + '%';
        led.text('ACCURACY', 6, 3, 1);
        led.text(val, 6, 13, 3);
        if (t >= 12.6) led.box(3, 11, 6 + led.width(val, 3) + 2, 35);
      });
      const tkB = S(13.3, 13.6);
      board(130, 540, 1020, 130, tkB, (led) => { // finer 2.5px pitch sign: 408 x 52 LEDs
        const msg = 'MORE EXAMPLES → BETTER GUESSES';
        const flip = S(13.5, 14.1), nOk = Math.floor(msg.length * flip);
        led.text(msg.slice(0, nOk) + scr(msg.slice(nOk), Math.floor(t * 20)), 204, 19, 2, 'center');
      }, 2.5);
      H.grain(ctx, W, H_, 0.018, 3 + Math.floor(t * 12));
    },
  });
}
