{
  // Prestige-newspaper data graphic (FT / NYT / Economist register).
  const BG = '#FFF1E5', INK = '#33302E', MUTED = '#66605C', GRID = 'rgba(51,48,46,0.16)';
  const HI = '#990F3D', GREY = '#A79E95';

  // Illustrative annual data, $bn
  const YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const SERIES = [
    { name: 'Artificial intelligence', hi: true, v: [11, 16, 24, 37, 50, 63, 58, 92, 104, 176, 262, 348, 405] },
    { name: 'Cloud infrastructure', v: [58, 66, 77, 88, 101, 116, 138, 152, 163, 171, 182, 191, 198] },
    { name: 'Cybersecurity', v: [28, 32, 36, 41, 47, 52, 60, 73, 82, 86, 92, 98, 104] },
    { name: 'Robotics', v: [19, 21, 24, 28, 31, 33, 30, 38, 44, 47, 52, 58, 63] },
    { name: 'AR/VR headsets', v: [4, 7, 11, 14, 17, 19, 24, 36, 31, 25, 22, 21, 22] },
  ];

  // quarterly interpolation with a little seeded texture so lines feel like real data
  function quarterly(v, seed, jitter) {
    const r = H.rng(seed), out = [];
    for (let i = 0; i < v.length - 1; i++) {
      const p0 = v[Math.max(0, i - 1)], p1 = v[i], p2 = v[i + 1], p3 = v[Math.min(v.length - 1, i + 2)];
      for (let q = 0; q < 4; q++) {
        const f = q / 4, f2 = f * f, f3 = f2 * f;
        // Catmull-Rom between annual points
        const base = 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (-p0 + 3 * p1 - 3 * p2 + p3) * f3);
        out.push(base + (i + q > 0 ? r.gauss() * jitter * Math.sqrt(Math.max(1, base)) : 0));
      }
    }
    out.push(v[v.length - 1]);
    return out;
  }

  function smallCaps(ctx, str, x, y, size, color, track, align) {
    // faux small caps: capitals at full size, lower-case set as smaller capitals
    ctx.fillStyle = color;
    const big = `600 ${size}px "Inter"`, sm = `600 ${Math.round(size * 0.78)}px "Inter"`;
    const parts = [];
    for (const ch of str) {
      const up = ch === ch.toUpperCase() && ch !== ch.toLowerCase();
      parts.push({ c: ch.toUpperCase(), f: up || /[0-9©]/.test(ch) ? big : sm });
    }
    let w = 0;
    for (const p of parts) { ctx.font = p.f; w += ctx.measureText(p.c).width + track; }
    let cx = align === 'right' ? x - w : x;
    ctx.textAlign = 'left';
    for (const p of parts) { ctx.font = p.f; ctx.fillText(p.c, cx, y); cx += ctx.measureText(p.c).width + track; }
  }

  // hand-drawn leader: wobbly quadratic with a small open arrowhead
  function leader(ctx, x0, y0, cx, cy, x1, y1, seed, color, prog = 1, lw = 1.25) {
    if (prog <= 0) return;
    const r = H.rng(seed);
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    let px = 0, py = 0;
    const nI = Math.max(1, Math.round(28 * prog));
    for (let i = 0; i <= nI; i++) {
      const u = i / 28, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
      const wob = Math.sin(u * Math.PI) * 0.8;
      px = a * x0 + b * cx + c * x1 + r.gauss() * 0.25 * wob;
      py = a * y0 + b * cy + c * y1 + r.gauss() * 0.25 * wob;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    if (prog < 0.97) { ctx.restore(); return; }
    // arrowhead from tangent at end
    const tx = x1 - cx, ty = y1 - cy, L = Math.hypot(tx, ty) || 1, ux = tx / L, uy = ty / L;
    const hl = 8;
    ctx.beginPath();
    ctx.moveTo(x1 - ux * hl - uy * hl * 0.55, y1 - uy * hl + ux * hl * 0.55);
    ctx.lineTo(x1 + r.gauss() * 0.2, y1);
    ctx.lineTo(x1 - ux * hl + uy * hl * 0.5, y1 - uy * hl - ux * hl * 0.5);
    ctx.stroke();
    ctx.restore();
  }

  // handwritten write-on: reveal text left to right
  function writeOn(ctx, str, x, y, p) {
    if (p <= 0) return;
    const w = ctx.measureText(str).width;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 4, y - 30, (w + 8) * H.clamp(p), 42); ctx.clip();
    ctx.fillText(str, x, y); ctx.restore();
  }
  const seg = (t, a, b) => H.clamp((t - a) / (b - a));

  // ---- explainer helpers: line icons in the graphic's hairline style ----
  function catIcon(ctx, x, y, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.6 / s; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-12, -4); ctx.lineTo(-11, -17); ctx.lineTo(-4, -10); ctx.quadraticCurveTo(0, -11.5, 4, -10); ctx.lineTo(11, -17); ctx.lineTo(12, -4);
    ctx.quadraticCurveTo(13, 11, 0, 12); ctx.quadraticCurveTo(-13, 11, -12, -4); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-5, -1, 1.6, 0, 7); ctx.arc(5, -1, 1.6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-1.5, 4); ctx.lineTo(1.5, 4); ctx.lineTo(0, 5.8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-3, 6); ctx.lineTo(-15, 4); ctx.moveTo(-3, 7.5); ctx.lineTo(-14, 9); ctx.moveTo(3, 6); ctx.lineTo(15, 4); ctx.moveTo(3, 7.5); ctx.lineTo(14, 9); ctx.stroke();
    ctx.restore();
  }
  function dogIcon(ctx, x, y, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.6 / s; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-9, -10); ctx.quadraticCurveTo(0, -15, 9, -10); ctx.quadraticCurveTo(12, 0, 8, 7); ctx.quadraticCurveTo(0, 14, -8, 7); ctx.quadraticCurveTo(-12, 0, -9, -10); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-12, -2, 4, 9, 0.35, 0, 7); ctx.ellipse(12, -2, 4, 9, -0.35, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(-4, -3, 1.6, 0, 7); ctx.arc(4, -3, 1.6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 5, 3.2, 2.3, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  // hand-drawn emphasis ring (wobbly, overshooting like a marker circle)
  function handRing(ctx, x, y, rx, ry, p, seed, col, lw = 1.8) {
    if (p <= 0) return;
    const r = H.rng(seed);
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath();
    const n = Math.max(2, Math.floor(64 * p)), a0 = -2.4;
    for (let k = 0; k <= n; k++) { const a = a0 + k / 64 * Math.PI * 2.25, w = 1 + 0.06 * Math.sin(k * 0.35) + k * 0.0012; const px = x + Math.cos(a) * rx * w, py = y + Math.sin(a) * ry * w; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke(); ctx.restore();
  }
  // a small network drawn as an editorial diagram: nodes + hairline weights
  function miniNet(ctx, x, y, w, h, weights, hot, nr = 7) {
    const cols = [3, 4, 2];
    const P = cols.map((n, c) => Array.from({ length: n }, (_, i) => [x + c * w / 2, y + (i + 0.5) * h / n]));
    let k = 0;
    for (let c = 0; c < 2; c++) for (const a of P[c]) for (const b of P[c + 1]) {
      const wt = weights[k++ % weights.length];
      // hairline-but-dark like the hero's grid: readable at video size even for near-zero weights
      ctx.strokeStyle = wt > 0 ? H.rgba(HI, Math.min(1, 0.5 + 0.7 * Math.abs(wt))) : H.rgba('#857D75', Math.min(1, 0.42 + 0.7 * Math.abs(wt)));
      ctx.lineWidth = 1.4 + 2.4 * Math.abs(wt);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    for (const col of P) for (const [px, py] of col) {
      ctx.fillStyle = BG; ctx.beginPath(); ctx.arc(px, py, nr, 0, 7); ctx.fill();
      ctx.strokeStyle = hot ? HI : INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, nr, 0, 7); ctx.stroke();
    }
    return P;
  }

  registerStyle({
    id: 'editorial-chart',
    name: 'Editorial Chart',
    category: 'Data & Information',
    description: 'A prestige-newspaper data graphic on FT salmon: serif headline and dek, hairline grid, one claret highlight series against quiet greys, direct labels and hand-annotated callouts, small-caps source line.',
    motion: 'Headline sets, gridlines rule across, grey context lines settle, then the claret line draws left to right with its wash filling behind it and handwritten notes inking in as the line reaches them; a slow push and a soft pulse on the end point hold the shot.',
    duration: 6,
    fonts: ['700 34px "Libre Baskerville"', '400 17px "Libre Baskerville"', 'italic 400 15px "Libre Baskerville"',
      '600 13px "Inter"', '400 13px "Inter"', '800 13px "Inter"', '700 22px "Caveat"', '700 92px "Libre Baskerville"', '700 46px "Libre Baskerville"', '600 28px "Inter"', '400 26px "Inter"'],
    frameT: 5.9,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      // ---- paper ----
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H_);
      // slow push-in across the shot
      ctx.save();
      const push = 1 + 0.018 * H.ease.inOut(seg(t, 1.5, 6));
      ctx.translate(W / 2, H_ * 0.55); ctx.scale(push, push); ctx.translate(-W / 2, -H_ * 0.55);

      const L = 84, R = 1080, T = 214, B = 596;
      const yMax = 450;
      const X = (yr) => L + (yr - 2014) / 12 * (R - L);
      const Y = (v) => B - v / yMax * (B - T);
      const reveal = H.ease.inOut(seg(t, 2.0, 4.0));
      const greyIn = H.ease.out(seg(t, 1.1, 2.2));

      // ---- masthead rule + kicker ----
      const ruleP = H.ease.out(seg(t, 0, 0.5));
      ctx.fillStyle = INK; ctx.fillRect(L, 40, 1116 * ruleP, 3);
      ctx.fillStyle = HI; ctx.fillRect(L, 40, 46 * H.clamp(ruleP * 4), 7);
      ctx.globalAlpha = seg(t, 0.2, 0.5);
      smallCaps(ctx, 'Artificial Intelligence', L, 76, 13, HI, 1.6);
      ctx.globalAlpha = 1;

      // ---- headline & dek: set line by line with a short rise ----
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      const setIn = (str, font, col, y, a, b) => {
        const p = H.ease.out(seg(t, a, b)); if (p <= 0) return;
        ctx.globalAlpha = p; ctx.fillStyle = col; ctx.font = font; ctx.fillText(str, L, y + (1 - p) * 10); ctx.globalAlpha = 1;
      };
      setIn('AI spending leaves the rest behind', '700 34px "Libre Baskerville"', INK, 120, 0.15, 0.75);
      setIn('Global corporate investment by technology category, $bn', '400 17px "Libre Baskerville"', MUTED, 152, 0.35, 0.9);
      setIn('Annual, 2014–2026. Figures are illustrative', '400 13px "Inter"', MUTED, 177, 0.5, 1.0);

      // ---- forecast band ----
      const fx0 = X(2025), fx1 = X(2026);
      const fb = seg(t, 1.2, 1.7);
      ctx.fillStyle = `rgba(51,48,46,${0.055 * fb})`; ctx.fillRect(fx0, T - 6, fx1 - fx0, B - T + 6);
      ctx.globalAlpha = fb;
      ctx.font = 'italic 400 13px "Libre Baskerville"'; ctx.fillStyle = MUTED; ctx.textAlign = 'center';
      ctx.fillText('Forecast', (fx0 + fx1) / 2, T + 10);
      ctx.globalAlpha = 1;

      // ---- gridlines rule across, bottom first; labels sit on the line (NYT style) ----
      ctx.textAlign = 'left'; ctx.font = '400 13px "Inter"';
      for (let v = 0; v <= 400; v += 100) {
        const k = v / 100, gp = H.ease.inOut(seg(t, 0.5 + k * 0.09, 1.05 + k * 0.09));
        if (gp <= 0) continue;
        const y = Y(v) + 0.5;
        ctx.fillStyle = v === 0 ? INK : GRID;
        ctx.fillRect(L, Math.round(y) - (v === 0 ? 0.5 : 0), (R - L + 24) * gp, v === 0 ? 1.4 : 1);
        if (v) { ctx.globalAlpha = seg(gp, 0.3, 1); ctx.fillStyle = MUTED; ctx.fillText(v === 400 ? '$400bn' : String(v), L, y - 6); ctx.globalAlpha = 1; }
      }
      // x ticks
      ctx.textAlign = 'center';
      for (let yr = 2014; yr <= 2026; yr += 1) {
        const a = seg(t, 0.75 + (yr - 2014) * 0.035, 1.05 + (yr - 2014) * 0.035); if (a <= 0) continue;
        ctx.globalAlpha = a;
        const x = Math.round(X(yr)) + 0.5;
        ctx.fillStyle = INK; ctx.fillRect(x - 0.5, B, 1, yr % 2 === 0 ? 6 : 3);
        if (yr % 2 === 0) { ctx.fillStyle = MUTED; ctx.fillText(String(yr), x, B + 24); }
        ctx.globalAlpha = 1;
      }

      // ---- grey context lines with direct labels ----
      const pts = SERIES.map((s, i) => {
        const q = quarterly(s.v, 100 + i, s.hi ? 0.18 : 0.12);
        return q.map((v, k) => [X(2014 + k / 4), Y(v)]);
      });
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      SERIES.forEach((s, i) => {
        if (s.hi) return;
        const p = pts[i];
        const gp = H.ease.inOut(seg(t, 1.0 + i * 0.1, 1.9 + i * 0.1)); if (gp <= 0) return;
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, L + (R - L) * gp + 2, H_); ctx.clip();
        ctx.strokeStyle = GREY; ctx.lineWidth = 1.8;
        ctx.beginPath(); p.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
        ctx.restore();
      });
      // label positions (nudged to avoid collisions)
      const labY = { 'Cloud infrastructure': 0, 'Cybersecurity': 0, 'Robotics': 0, 'AR/VR headsets': 0 };
      const ends = SERIES.map((s, i) => ({ s, y: pts[i][pts[i].length - 1][1] })).filter((e) => !e.s.hi).sort((a, b) => a.y - b.y);
      for (let k = 1; k < ends.length; k++) if (ends[k].y - ends[k - 1].y < 17) ends[k].y = ends[k - 1].y + 17;
      ctx.textAlign = 'left'; ctx.font = '400 13px "Inter"';
      ends.forEach((e) => {
        const last = pts[SERIES.indexOf(e.s)].slice(-1)[0];
        ctx.globalAlpha = seg(t, 2.0, 2.4);
        ctx.fillStyle = '#857D75'; ctx.fillText(e.s.name, R + 10, e.y + 4.5);
        if (Math.abs(e.y - last[1]) > 2) { ctx.strokeStyle = 'rgba(133,125,117,0.6)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(R + 2, last[1]); ctx.lineTo(R + 8, e.y); ctx.stroke(); }
        ctx.globalAlpha = 1;
      });

      // ---- highlight series: area wash + line, revealed by clip ----
      const hp = pts[0];
      const clipX = L + (R - L) * reveal;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, reveal > 0 ? clipX + 2 : 0, H_); ctx.clip();
      // area
      const g = ctx.createLinearGradient(0, T, 0, B);
      g.addColorStop(0, 'rgba(153,15,61,0.20)'); g.addColorStop(1, 'rgba(153,15,61,0.04)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(hp[0][0], B);
      hp.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(hp[hp.length - 1][0], B); ctx.closePath(); ctx.fill();
      // solid actuals, dashed forecast
      const split = hp.findIndex(([x]) => x >= fx0 - 0.1);
      ctx.strokeStyle = HI; ctx.lineWidth = 3.4;
      ctx.beginPath(); for (let k = 0; k <= split; k++) (k ? ctx.lineTo(...hp[k]) : ctx.moveTo(...hp[k])); ctx.stroke();
      ctx.setLineDash([5, 5]); ctx.lineWidth = 3;
      ctx.beginPath(); for (let k = split; k < hp.length; k++) (k > split ? ctx.lineTo(...hp[k]) : ctx.moveTo(...hp[k])); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // drawing head: a small dot riding the tip of the line while it draws
      if (reveal > 0 && reveal < 1) {
        let k = hp.findIndex(([x]) => x >= clipX); if (k < 1) k = 1;
        const [ax, ay] = hp[k - 1], [bx, by] = hp[k], f = H.clamp((clipX - ax) / (bx - ax || 1));
        ctx.fillStyle = HI; ctx.beginPath(); ctx.arc(ax + (bx - ax) * f, ay + (by - ay) * f, 4.2, 0, 7); ctx.fill();
      }
      // end marker + direct label
      const endP = hp[hp.length - 1];
      const pop = seg(t, 3.95, 4.3);
      if (pop > 0) {
        // live pulse on the latest value during the hold
        for (let k = 0; k < 2; k++) {
          const ph = ((t - 4.3) / 1.4 + k * 0.5) % 1;
          if (t > 4.3) { ctx.strokeStyle = H.rgba(HI, 0.35 * (1 - ph)); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(endP[0], endP[1], 6 + ph * 16, 0, 7); ctx.stroke(); }
        }
        const sc = H.ease.back(pop);
        ctx.fillStyle = BG; ctx.beginPath(); ctx.arc(endP[0], endP[1], 6.5 * sc, 0, 7); ctx.fill();
        ctx.strokeStyle = HI; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(endP[0], endP[1], Math.max(0.1, 5 * sc), 0, 7); ctx.stroke();
        ctx.textAlign = 'left'; ctx.globalAlpha = seg(t, 4.05, 4.45);
        ctx.font = '800 13px "Inter"'; ctx.fillStyle = HI;
        ctx.fillText('Artificial', R + 14, endP[1] - 3);
        ctx.fillText('intelligence', R + 14, endP[1] + 13);
        ctx.font = '400 13px "Inter"'; ctx.fillText('$405bn', R + 14, endP[1] + 30);
        ctx.globalAlpha = 1;
      }

      // ---- annotations: written on by hand once the line has passed ----
      const ann = (x) => H.clamp((clipX - x) / 110);
      ctx.font = '700 22px "Caveat"'; ctx.textAlign = 'left';
      // 1: chatbot moment
      let a = ann(X(2023.4));
      ctx.fillStyle = INK;
      writeOn(ctx, 'Chatbots go mainstream —', X(2018.75), Y(330), a * 3.2);
      writeOn(ctx, 'spending doubles in 18 months', X(2018.75), Y(330) + 22, a * 3.2 - 1.1);
      leader(ctx, X(2021.55), Y(330) + 34, X(2022.9), Y(292), X(2023.55) - 9, Y(222) - 4, 11, INK, seg(a, 0.68, 1));
      // 2: pandemic dip
      const dx = X(2020), dy = Y(58);
      a = ann(dx + 30);
      ctx.fillStyle = MUTED;
      writeOn(ctx, 'A brief pandemic', X(2016.9), Y(178), a * 3);
      writeOn(ctx, 'pause', X(2016.9), Y(178) + 21, a * 3 - 1);
      leader(ctx, X(2017.6), Y(178) + 30, X(2019.2), Y(118), dx - 3, dy - 11, 23, MUTED, seg(a, 0.66, 1));
      // 3: overtakes cloud
      const cxp = X(2022.95), cyp = Y(170);
      a = ann(cxp + 20);
      if (a > 0) {
        ctx.strokeStyle = MUTED; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cxp, cyp, 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * seg(a, 0, 0.35)); ctx.stroke();
      }
      ctx.fillStyle = MUTED;
      writeOn(ctx, 'AI passes cloud', X(2023.55), Y(118), (a - 0.55) * 2.6);
      leader(ctx, X(2023.5), Y(124), X(2023.05), Y(128), cxp + 3, cyp + 12, 31, MUTED, seg(a, 0.3, 0.6));

      // ---- footer: source line in small caps ----
      const fp = seg(t, 4.2, 4.7);
      ctx.fillStyle = 'rgba(51,48,46,0.35)'; ctx.fillRect(L, 648, 1116 * H.ease.out(fp), 1);
      ctx.globalAlpha = fp;
      smallCaps(ctx, 'Source: Illustrative estimates compiled for this graphic', L, 672, 12, MUTED, 1.1);
      smallCaps(ctx, 'Graphic by the Data Desk', L + 1116, 672, 12, MUTED, 1.1, 'right');
      ctx.globalAlpha = 1;
      ctx.restore();

      // paper tooth (quietly alive)
      H.grain(ctx, W, H_, 0.025, 5 + Math.floor(t * 12));
    },
    // Sound: a quiet newsroom reading an online graphic. Scrolls are mouse-wheel notches (one per 120 px of the
    // eased scroll) over a soft page glide, Caveat notes and leaders are a felt pen of matching length, numerals
    // advance with small type clicks, the 97% gets the one big hit. Times mirror explainer() below.
    explainerSound(k) {
      const D = 15;
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.6;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // felt pen note: nib touch + stroke for the write-on span
      const pen = (a, b, g = 1, p = 0, minor = true) => {
        k.noise(a, { dur: 0.018, filter: 'bandpass', f: 1600, q: 1.3, gain: 0.12 * g, a: 0.001, pan: p, minor });
        k.play('stroke', a, { material: 'pen', dur: b - a, gain: 1.5 * g, pan: p, minor });
      };
      // a small type click for counter digits (dry, mid-low, never a chirp)
      const type = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.016, filter: 'bandpass', f: 2300, q: 1.6, gain: 0.2 * g, a: 0.001, pan: p }); k.tone(t, { f: 240, dur: 0.03, gain: 0.05 * g, pan: p }); });
      // scroll: wheel notches following the eased scroll + a smooth low page glide
      const scroll = (t0, t1, dist) => {
        k.noise(t0, { dur: t1 - t0 + 0.1, color: 'pink', filter: 'bandpass', f: [[0, 260], [(t1 - t0) * 0.5, 520], [t1 - t0 + 0.1, 240]], q: 0.7, gain: 0.09, a: (t1 - t0) * 0.45 });
        for (let s = 120; s <= dist; s += 120) {
          const tn = when(t0, t1, H.ease.inOut, s / dist);
          k.withMinor(() => { k.noise(tn, { dur: 0.012, filter: 'bandpass', f: 1900, q: 2, gain: 0.22, a: 0.001, pan: 0.35 }); k.tone(tn, { f: 330, dur: 0.025, gain: 0.05, pan: 0.35 }); });
        }
      };
      // counter ticks: one per 1/24 of the eased progress, never closer than 1/12 s (slows as it settles)
      const counter = (t0, t1, ease, steps, p, f0) => {
        let last = -1, lastT = -1;
        for (let t = t0; t <= t1 + 1e-6; t += 1 / 120) {
          const v = Math.floor(ease(seg(t, t0, t1)) * steps);
          if (v !== last && t - lastT >= 1 / 12) { type(t, 0.8 + 0.3 * (v / steps), p); last = v; lastT = t; }
        }
      };

      k.bed('room', 0, D, { gain: 0.35 });

      // ---- panel 0: the rule draws, the headline sets
      k.noise(0.0, { dur: 0.5, filter: 'bandpass', f: [[0, 500], [0.5, 900]], q: 0.8, gain: 0.06, a: 0.1, pan: -0.1, minor: true }); // rule runs across
      k.play('tock', 0.42, { f: 300, gain: 0.45 }); // headline settles into place
      k.play('tock', 0.95, { f: 380, gain: 0.22, minor: true }); // dek + byline
      scroll(1.5, 2.4, 720);
      k.play('click', 2.0, { f: 900, gain: 0.8, minor: true }); // sticky header docks

      // ---- panel 1: the data
      k.play('tock', 3.15, { f: 340, gain: 0.3, pan: pan(1000), minor: true }); // the model box fades in
      pen(3.0, 3.25, 1, pan(140)); // "cat"
      pen(3.3, 3.7, 0.8, pan(200)); // cat leader
      pen(3.4, 3.6, 0.9, pan(380)); // "dog"
      pen(3.6, 4.0, 0.9, pan(600)); // dog leader + the flow leader into the model
      counter(2.6, 5.3, H.ease.inOut, 24, pan(930));
      k.play('tock', 5.3, { f: 260, gain: 0.6, pan: pan(930) }); // 1,000,000 sets
      scroll(5.9, 6.6, 720);
      k.play('click', 6.2, { f: 900, gain: 0.7, pan: 0.6, minor: true }); // header tab: The loop

      // ---- panel 2: guess, check, adjust
      k.play('tock', 6.82, { f: 320, gain: 0.3, pan: pan(170), minor: true }); // a new photo
      pen(6.9, 7.3, 0.8, pan(300)); // photo -> model
      pen(7.2, 7.5, 0.8, pan(800)); // model -> output
      pen(7.4, 7.71, 1.1, pan(950)); // "dog?"
      // the wrong guess: claret X in two quick slashes + a muted descending pair
      pen(7.68, 7.77, 2.0, pan(1110), false); // the X appears in one quick double slash
      k.tone(7.68, { f: 'D4', type: 'triangle', dur: 0.24, gain: 0.2, hold: 0.08, filter: 'lowpass', f2: 1200, pan: pan(1100) });
      k.tone(7.86, { f: 'A3', type: 'triangle', dur: 0.4, gain: 0.2, hold: 0.12, filter: 'lowpass', f2: 900, pan: pan(1100) });
      pen(7.78, 8.1, 1.1, pan(960)); // emphasis ring (drawing since 7.7)
      k.play('click', 8.08, { f: 900, gain: 0.7, pan: -0.5, minor: true }); // step: Check
      k.play('tock', 8.15, { f: 240, gain: 0.55, pan: pan(970) }); // "Answer: cat" tag sets
      pen(8.3, 9.1, 0.55, pan(800)); // error line dashes back
      pen(8.5, 9.0, 0.7, pan(900)); // "error flows back"
      k.noise(9.1, { dur: 0.03, filter: 'bandpass', f: 1300, q: 1.2, gain: 0.18, a: 0.001, pan: pan(570), minor: true }); // arrowhead dot
      k.play('click', 8.9, { f: 900, gain: 0.7, pan: -0.3, minor: true }); // step: Adjust
      for (let i = 1; i <= 6; i++) k.play('tock', when(8.9, 9.6, H.ease.inOut, i / 6), { f: 520 + i * 25, gain: 0.42, pan: pan(570), minor: true }); // weights turn
      pen(8.95, 9.4, 0.5, pan(600)); // "weights adjust"
      pen(9.7, 10.01, 1.1, pan(950)); // "cat"
      pen(10.0, 10.12, 1.3, pan(1050), false); // green tick
      k.play('success', 10.0, { f: 'G5', gain: 0.45, pan: pan(1000) }); // the correction
      pen(10.0, 10.4, 0.6, pan(950)); // "...and round it goes again"
      scroll(10.5, 11.2, 720);
      k.play('click', 10.85, { f: 900, gain: 0.7, pan: 0.6, minor: true }); // header tab: Practice

      // ---- panel 3: practice
      pen(11.2, 12.8, 0.45, pan(450)); // the accuracy line draws
      pen(11.3, 11.8, 0.6, pan(200)); // "starts at 61%"
      pen(11.6, 11.9, 0.5, pan(110)); // its leader
      counter(11.2, 12.8, H.ease.inOut, 36, pan(1060));
      k.play('impact', 12.8, { gain: 0.8, pan: pan(1060) }); // 97% lands: the big hit
      k.play('ding', 12.82, { f: 'C5', gain: 0.5, pan: pan(1060) });
      pen(12.8, 13.3, 1.3, pan(1060), false); // the ring around 97%
      // takeaway sets (ease.out: mostly there by ~13.45), then resolves
      k.noise(13.2, { dur: 0.3, filter: 'bandpass', f: [[0, 400], [0.3, 800]], q: 0.8, gain: 0.07, a: 0.08, pan: -0.6, minor: true }); // claret rule
      k.play('tock', 13.3, { f: 280, gain: 0.5 });
      ['F4', 'C5', 'A5'].forEach((f, i) => k.play('ding', 13.45 + i * 0.08, { f, gain: 0.4 - i * 0.07, pan: (i - 1) * 0.25 }));
    },
    explainerDuration: 15,
    explainerNote: 'Told as a scrolling newspaper story: the page scrolls panel to panel under a sticky serif header, hand-drawn Caveat arrows and rings carry the cause and emphasis, a waffle chart and set numerals count the data, and the accuracy line draws itself like the still.',
    explainer(ctx, W, H_, t) {
      const S = (a, b) => seg(t, a, b);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H_);
      // ---- scroll position (the transition: the page scrolls like an online graphic) ----
      const KEYS = [[0, 0], [1.5, 0], [2.4, 720], [5.9, 720], [6.6, 1440], [10.5, 1440], [11.2, 2160], [15, 2160]];
      let sy = 2160;
      for (let i = 0; i < KEYS.length - 1; i++) if (t >= KEYS[i][0] && t <= KEYS[i + 1][0]) { sy = H.lerp(KEYS[i][1], KEYS[i + 1][1], H.ease.inOut((t - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0]))); break; }
      const L = 70;
      ctx.save(); ctx.translate(0, -sy);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      const head = (n, title, T0) => {
        // each panel opens with the hero's masthead rule: 3px ink with a claret tab
        ctx.fillStyle = INK; ctx.fillRect(L, T0 + 78, 1140, 3); ctx.fillStyle = HI; ctx.fillRect(L, T0 + 78, 46, 7);
        smallCaps(ctx, n, L, T0 + 112, 22, HI, 2); ctx.fillStyle = INK; ctx.font = '700 46px "Libre Baskerville"'; ctx.fillText(title, L, T0 + 166); };

      // ===== panel 0: the hook =====
      {
        const a = H.ease.out(S(0, 0.6));
        ctx.fillStyle = INK; ctx.fillRect(L, 210, 1140 * H.ease.out(S(0, 0.5)), 4);
        ctx.fillStyle = HI; ctx.fillRect(L, 210, 60, 9);
        ctx.globalAlpha = a; smallCaps(ctx, 'Artificial Intelligence', L, 270, 24, HI, 2);
        ctx.fillStyle = INK; ctx.font = '700 92px "Libre Baskerville"'; ctx.fillText('How does AI learn?', L, 390 + (1 - a) * 14);
        ctx.globalAlpha = H.ease.out(S(0.4, 1.0));
        ctx.fillStyle = MUTED; ctx.font = '400 30px "Libre Baskerville"'; ctx.fillText('A visual guide to how machines get better by guessing', L, 452);
        smallCaps(ctx, 'By the Data Desk', L, 512, 20, MUTED, 1.4);
        ctx.globalAlpha = 1;
      }

      // ===== panel 1: the data (top at 720) =====
      {
        const T0 = 720;
        head('1. The data', 'It starts with labelled examples', T0);
        // waffle: each square = 5,000 examples; claret = cat, grey = dog
        const cols = 20, rows = 10, sq = 25, gp = 4, wx = L, wy = T0 + 260;
        const filled = Math.floor(cols * rows * H.ease.inOut(S(2.6, 5.3)));
        const wr = H.rng(31);
        let catCell = null, dogCell = null;
        for (let i = 0; i < cols * rows; i++) {
          const c = i % cols, r = Math.floor(i / cols), isCat = wr.chance(0.52);
          const x = wx + c * (sq + gp), y = wy + r * (sq + gp);
          if (i === 24) catCell = [x + sq / 2, y + sq / 2]; if (i === 47) dogCell = [x + sq / 2, y + sq / 2];
          ctx.fillStyle = i < filled ? (isCat ? H.rgba(HI, 0.85) : '#B9AFA5') : 'rgba(51,48,46,0.06)';
          ctx.fillRect(x, y, sq, sq);
        }
        // direct labels with hand-drawn leaders landing on a cat square and a dog square
        ctx.font = '700 36px "Caveat"';
        const la = S(3.0, 3.5);
        if (la > 0 && catCell) {
          catIcon(ctx, wx + 22, wy - 36, 1.15 * H.ease.back(la), HI);
          ctx.fillStyle = HI; writeOn(ctx, 'cat', wx + 50, wy - 26, la * 2);
          leader(ctx, wx + 104, wy - 32, wx + 150, wy - 30, catCell[0] + 2, catCell[1] - 9, 3, HI, S(3.3, 3.7), 2);
          dogIcon(ctx, wx + 270, wy - 36, 1.15 * H.ease.back(S(3.4, 3.8)), MUTED);
          ctx.fillStyle = MUTED; writeOn(ctx, 'dog', wx + 300, wy - 26, S(3.4, 3.8) * 2);
          leader(ctx, wx + 312, wy - 12, wx + 260, wy + 10, dogCell[0] + 5, dogCell[1] - 8, 5, MUTED, S(3.6, 4.0), 2);
        }
        // the counter: hero numeral in set type
        const n = Math.round(1e6 * H.ease.inOut(S(2.6, 5.3)));
        const nx = 800;
        ctx.fillStyle = INK; ctx.font = '700 84px "Libre Baskerville"'; ctx.fillText(n.toLocaleString('en-US'), nx - 20, T0 + 300);
        ctx.font = '400 26px "Inter"'; ctx.fillStyle = MUTED; ctx.fillText('labelled examples', nx - 16, T0 + 340);
        ctx.font = '400 28px "Inter"'; ctx.fillText('each square = 5,000', wx, wy + rows * (sq + gp) + 34);
        // the model box and the flow of examples into it
        const mx = 800, my = T0 + 400, mw = 400, mh = 220;
        const ma = S(3.0, 3.5);
        ctx.globalAlpha = ma;
        ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(mx, my, mw, mh);
        smallCaps(ctx, 'The model', mx + 14, my + 38, 26, INK, 1.6);
        miniNet(ctx, mx + 70, my + 52, 260, 156, [0.1, -0.2, 0.15, 0.05, -0.1, 0.2, 0.1, -0.05, 0.12, 0.1, -0.15, 0.08, 0.2, -0.1, 0.05, 0.1, 0.07, -0.12, 0.1, 0.02], false, 10);
        ctx.globalAlpha = 1;
        const p0 = [wx + cols * (sq + gp) + 10, wy + 210], p1 = [mx - 8, my + mh / 2], pc = [(p0[0] + p1[0]) / 2, wy + 330];
        leader(ctx, p0[0], p0[1], pc[0], pc[1], p1[0], p1[1], 7, INK, S(3.4, 4.0), 2);
        const fl = S(4.0, 6.2);
        if (fl > 0 && fl < 1) for (let k = 0; k < 6; k++) {
          const u = ((t * 0.9 + k / 6) % 1);
          const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
          const x = a * p0[0] + b * pc[0] + c * p1[0], y = a * p0[1] + b * pc[1] + c * p1[1];
          ctx.fillStyle = k % 2 ? H.rgba(HI, 0.85) : '#B9AFA5'; ctx.fillRect(x - 8, y - 8, 16, 16);
        }
      }

      // ===== panel 2: guess, check, adjust (top at 1440) =====
      {
        const T0 = 1440;
        head('2. Guess, check, adjust', 'It learns from its mistakes', T0);
        // step strip
        const steps = ['Guess', 'Check', 'Adjust'];
        const active = t < 8.1 ? 0 : t < 8.9 ? 1 : t < 9.6 ? 2 : 0;
        let sx = L;
        steps.forEach((st, i) => {
          const on = t > 6.8 && i === active;
          ctx.font = '700 34px "Libre Baskerville"'; ctx.fillStyle = on ? HI : 'rgba(51,48,46,0.35)';
          ctx.fillText(st, sx, T0 + 232); const w = ctx.measureText(st).width;
          if (on) ctx.fillRect(sx, T0 + 244, w, 3.5);
          sx += w + 22;
          if (i < 2) { ctx.fillStyle = 'rgba(51,48,46,0.45)'; ctx.fillText('→', sx, T0 + 232); sx += 58; }
        });
        // new photo card
        const ca = H.ease.out(S(6.7, 7.1));
        const cx = L, cy = T0 + 330;
        ctx.globalAlpha = ca;
        ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(cx, cy, 210, 210);
        catIcon(ctx, cx + 105, cy + 112, 3.8, INK);
        ctx.font = '400 24px "Inter"'; ctx.fillStyle = MUTED; ctx.fillText('A new photo', cx, cy + 244);
        ctx.globalAlpha = 1;
        // model
        const mx = 380, my = T0 + 320, mw = 380, mh = 240;
        const adj = H.ease.inOut(S(8.9, 9.6));
        const w0 = [0.1, -0.2, 0.15, 0.05, -0.1, 0.2, 0.1, -0.05, 0.12, 0.1, -0.15, 0.08, 0.2, -0.1, 0.05, 0.1, 0.07, -0.12, 0.1, 0.02];
        const w1 = [0.5, -0.1, 0.05, 0.6, -0.4, 0.1, 0.45, -0.3, 0.05, 0.7, -0.05, 0.3, 0.1, -0.5, 0.6, 0.05, 0.55, -0.1, 0.65, 0.1];
        const ww = w0.map((v, i) => H.lerp(v, w1[i], adj));
        ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(mx, my, mw, mh);
        smallCaps(ctx, 'The model', mx + 14, my + 38, 26, INK, 1.6);
        miniNet(ctx, mx + 60, my + 54, 260, 170, ww, t > 8.9 && t < 9.7, 10);
        leader(ctx, cx + 222, cy + 105, (cx + 222 + mx) / 2, cy + 80, mx - 8, my + mh / 2, 12, INK, S(6.9, 7.3), 2);
        // output
        const ox = 850, oy = T0 + 450;
        leader(ctx, mx + mw + 8, my + mh / 2, ox - 40, oy - 40, ox - 12, oy - 14, 14, INK, S(7.2, 7.5), 2);
        ctx.font = '700 70px "Caveat"';
        const g1 = S(7.4, 7.8) * (1 - S(9.5, 9.7));
        if (g1 > 0) {
          ctx.fillStyle = INK; writeOn(ctx, '“dog?”', ox, oy, g1 * 1.3);
          if (g1 > 0.7) { ctx.strokeStyle = HI; ctx.lineWidth = 5; ctx.lineCap = 'round'; const x = ox + 196, y = oy - 46; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 34, y + 34); ctx.moveTo(x + 34, y); ctx.lineTo(x, y + 34); ctx.stroke(); }
          handRing(ctx, ox + 112, oy - 22, 150, 56, S(7.7, 8.1), 21, HI, 3);
        }
        // check: the truth tag + the error signal flowing back
        const ck = S(8.1, 8.4) * (1 - S(9.5, 9.7));
        if (ck > 0) {
          ctx.globalAlpha = ck;
          ctx.fillStyle = HI; ctx.fillRect(ox, oy + 50, 230, 50);
          ctx.fillStyle = BG; ctx.font = '600 28px "Inter"'; ctx.fillText('Answer: cat', ox + 18, oy + 85);
          ctx.globalAlpha = 1;
          const ep = S(8.3, 9.1);
          if (ep > 0) {
            ctx.save(); ctx.strokeStyle = HI; ctx.lineWidth = 3.4; ctx.setLineDash([10, 8]); ctx.lineDashOffset = t * 50;
            ctx.beginPath();
            const n = Math.floor(40 * ep);
            for (let k = 0; k <= n; k++) { const u = k / 40, x = H.lerp(ox + 110, mx + mw / 2, u), y = H.lerp(oy - 80, my - 14, u) - Math.sin(u * Math.PI) * 50; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
            ctx.stroke(); ctx.restore();
            if (ep >= 1) { const ex = mx + mw / 2, ey = my - 14; ctx.fillStyle = HI; ctx.beginPath(); ctx.moveTo(ex, ey + 10); ctx.lineTo(ex - 9, ey - 6); ctx.lineTo(ex + 9, ey - 8); ctx.closePath(); ctx.fill(); }
            ctx.font = '700 38px "Caveat"'; ctx.fillStyle = HI; writeOn(ctx, 'error flows back', ox - 10, my - 26, S(8.5, 9.0));
          }
        }
        if (t > 8.9 && t < 9.9) { ctx.font = '700 38px "Caveat"'; ctx.fillStyle = HI; writeOn(ctx, 'weights adjust', mx + 90, my + mh + 50, S(8.95, 9.4)); }
        const g2 = S(9.7, 10.1);
        if (g2 > 0) {
          ctx.font = '700 70px "Caveat"'; ctx.fillStyle = INK; writeOn(ctx, '“cat”', ox, oy, g2 * 1.3);
          if (g2 > 0.75) { ctx.strokeStyle = '#2E7D4F'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const x = ox + 168, y = oy - 30; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 12, y + 15); ctx.lineTo(x + 40, y - 22); ctx.stroke(); }
          ctx.font = '700 36px "Caveat"'; ctx.fillStyle = MUTED; writeOn(ctx, '…and round it goes again', ox - 10, oy + 80, S(10.0, 10.4));
        }
      }

      // ===== panel 3: progress + takeaway (top at 2160) =====
      {
        const T0 = 2160;
        head('3. Practice', 'Millions of loops later, it rarely misses', T0);
        const cl = L, cr = 880, ct = T0 + 230, cb = T0 + 560;
        const Y = (v) => cb - (v - 50) / 50 * (cb - ct), X = (u) => cl + u * (cr - cl);
        ctx.font = '400 27px "Inter"';
        for (let v = 50; v <= 100; v += 10) {
          ctx.fillStyle = v === 50 ? INK : GRID; ctx.fillRect(cl, Math.round(Y(v)), cr - cl + 20, v === 50 ? 1.6 : 1);
          if (v === 100) { ctx.fillStyle = MUTED; ctx.fillText('100% accuracy', cl, Y(v) - 9); }
          // numeric ticks hang in the left margin, centred on their gridline, so the curve start never runs through "60"
          else if (v > 50) { ctx.fillStyle = MUTED; ctx.textAlign = 'right'; ctx.fillText(String(v), cl - 9, Y(v) + 9); ctx.textAlign = 'left'; }
        }
        ctx.fillStyle = MUTED; ctx.textAlign = 'right'; ctx.font = '400 28px "Inter"'; ctx.fillText('Training rounds →', cr + 20, cb + 36); ctx.textAlign = 'left';
        const acc = (u) => 61 + 36 * (1 - Math.exp(-u * 4.2)) / (1 - Math.exp(-4.2)) + Math.sin(u * 40) * 1.2 * (1 - u);
        const rp = H.ease.inOut(S(11.2, 12.8));
        const g = ctx.createLinearGradient(0, ct, 0, cb); g.addColorStop(0, 'rgba(153,15,61,0.18)'); g.addColorStop(1, 'rgba(153,15,61,0.03)');
        const N = 120, n = Math.floor(N * rp);
        if (n > 1) {
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(X(0), cb);
          for (let k = 0; k <= n; k++) ctx.lineTo(X(k / N), Y(acc(k / N))); ctx.lineTo(X(n / N), cb); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = HI; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.beginPath();
          for (let k = 0; k <= n; k++) (k ? ctx.lineTo(X(k / N), Y(acc(k / N))) : ctx.moveTo(X(0), Y(acc(0)))); ctx.stroke();
          const hx = X(n / N), hy = Y(acc(n / N));
          ctx.fillStyle = HI; ctx.beginPath(); ctx.arc(hx, hy, 7, 0, 7); ctx.fill();
        }
        ctx.font = '700 36px "Caveat"'; ctx.fillStyle = MUTED;
        writeOn(ctx, 'starts at 61%', X(0.06), Y(53.5), S(11.3, 11.8));
        leader(ctx, X(0.055), Y(56.2), X(0.02), Y(57.2), X(0.009), Y(60.4), 41, MUTED, S(11.6, 11.9), 2);
        // hero numeral at right + emphasis ring
        const big = rp >= 1 ? 97 : Math.round(61 + 36 * rp);
        ctx.globalAlpha = S(11.2, 11.5);
        ctx.fillStyle = HI; ctx.font = '700 128px "Libre Baskerville"'; ctx.fillText(big + '%', 920, T0 + 400);
        ctx.font = '400 28px "Inter"'; ctx.fillStyle = MUTED; ctx.fillText('accuracy', 928, T0 + 462);
        ctx.globalAlpha = 1;
        handRing(ctx, 1062, T0 + 354, 158, 68, S(12.8, 13.3), 77, HI, 3.4);
        // takeaway
        const tk = H.ease.out(S(13.2, 13.8));
        ctx.globalAlpha = tk;
        ctx.fillStyle = HI; ctx.fillRect(L, T0 + 610, 80 * tk, 5);
        ctx.fillStyle = INK; ctx.font = '700 50px "Libre Baskerville"'; ctx.fillText('More examples → better guesses', L, T0 + 676 + (1 - tk) * 8);
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      // ---- sticky header (docks as the headline scrolls away) ----
      const hd = S(1.7, 2.2);
      if (hd > 0) {
        ctx.save();
        // the header's paper backing turns opaque faster than its type fades in, so the scrolling byline never shows through the title
        ctx.globalAlpha = Math.min(1, hd * 2.5); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, 66);
        ctx.globalAlpha = hd;
        ctx.fillStyle = 'rgba(51,48,46,0.35)'; ctx.fillRect(0, 66, W, 1);
        ctx.fillStyle = INK; ctx.font = '700 28px "Libre Baskerville"'; ctx.textAlign = 'left'; ctx.fillText('How does AI learn?', L, 44);
        const secs = ['Data', 'The loop', 'Practice'];
        const cur = t < 6.2 ? 0 : t < 10.85 ? 1 : 2;
        let x = 1210;
        ctx.font = '600 22px "Inter"';
        for (let i = secs.length - 1; i >= 0; i--) {
          const w = ctx.measureText(secs[i]).width; x -= w;
          ctx.fillStyle = i === cur ? HI : 'rgba(51,48,46,0.42)'; ctx.fillText(secs[i], x, 42);
          if (i === cur) ctx.fillRect(x, 50, w, 3);
          x -= 30;
        }
        ctx.restore();
        // printed-graphic footer: small-caps source line pinned bottom right, as in the still
        ctx.save(); ctx.globalAlpha = hd;
        ctx.font = '600 19px "Inter"';
        smallCaps(ctx, 'Source: Illustrative', 1210, 704, 19, MUTED, 1.4, 'right');
        ctx.restore();
      }
      H.grain(ctx, W, H_, 0.025, 5 + Math.floor(t * 12));
    },
  });
}
