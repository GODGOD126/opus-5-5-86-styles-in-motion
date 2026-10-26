{
  // =====================================================================================================
  // Illuminated Manuscript: a late-medieval Book of Hours folio. Warm vellum with mottling, follicle specks
  // and show-through; drypoint ruling and pricking; Grenze Gotisch textura in iron-gall ink with vermilion
  // rubrics; raised, burnished gold leaf on red bole that catches a moving glint; lapis, vermilion, rose and
  // malachite pigments with white-lead filigree; ivy-leaf rinceaux borders with gold bezants; drolleries.
  // =====================================================================================================
  const C = {
    vel: [234, 217, 180],
    ink: '#2b1a0f', inkWet: '#100906',
    verm: '#c63b1c', vermD: '#8c2210',
    lapis: '#233f8f', lapisD: '#14265c', lapisL: '#4d6fc2',
    rose: '#b45a6c', roseD: '#7a2c3e',
    mal: '#2f7d55', malD: '#1b4f35', malL: '#5ea67a',
    ochre: '#c8994f', ochreD: '#8e6230', cream: '#efe3c6', white: '#f8f1e2',
  };
  const TAU = Math.PI * 2;
  const cl = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const win = (t, a, b) => cl((t - a) / (b - a));
  const ez = (u) => H.ease.inOut(cl(u));
  const eo = (u) => H.ease.out(cl(u));
  const lerp = (a, b, u) => a + (b - a) * u;
  const FONT = {
    bl: (px) => `400 ${px}px "Grenze Gotisch"`, blb: (px) => `700 ${px}px "Grenze Gotisch"`,
    fell: (px) => `400 ${px}px "IM Fell English"`, felli: (px) => `italic 400 ${px}px "IM Fell English"`,
    frak: (px) => `400 ${px}px "UnifrakturMaguntia"`,
  };

  // ---------------------------------------------------------------- cached textures
  let VEL = null, GT = null, PT = null;
  function vellum() {
    if (VEL) return VEL;
    const W = 1280, Hh = 720, w = 640, h = 360;
    const sm = H.layer(w, h), sc = sm.getContext('2d'), img = sc.createImageData(w, h), d = img.data;
    const nz = H.makeNoise(41), nz2 = H.makeNoise(97);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const m = nz.fbm2(x * 0.006, y * 0.009, 4);
      const f = nz2.fbm2(x * 0.035, y * 0.06, 3);
      const ex = Math.min(x, w - x) / w, ey = Math.min(y, h - y) / h, edge = Math.pow(1 - cl(Math.min(ex * 7, ey * 6)), 2);
      const cock = Math.sin(x * 0.014 + nz.n2(x * 0.004, y * 0.005) * 3) * Math.sin(y * 0.01 + 1.3);
      const st = cl(nz2.fbm2(x * 0.005 + 9, y * 0.006, 3) * 1.8, -1, 1);
      const L = 1 + m * 0.075 + f * 0.03 + cock * 0.018 - edge * 0.13;
      const o = (y * w + x) * 4;
      d[o] = C.vel[0] * L + st * 5; d[o + 1] = C.vel[1] * L + st * 1; d[o + 2] = C.vel[2] * L - st * 9 - edge * 14; d[o + 3] = 255;
    }
    sc.putImageData(img, 0, 0);
    const c = H.layer(W, Hh), x = c.getContext('2d');
    x.imageSmoothingQuality = 'high'; x.drawImage(sm, 0, 0, W, Hh);
    const r = H.rng(5);
    for (let i = 0; i < 3200; i++) { x.fillStyle = `rgba(${95 + r() * 40 | 0},${62 + r() * 30 | 0},36,${0.04 + r() * 0.16})`; x.fillRect(r() * W, r() * Hh, 0.6 + r() * 1.3, 0.6 + r() * 1.1); }
    for (let i = 0; i < 90; i++) { // hair follicles, in little triads
      const cx = r() * W, cy = r() * Hh; x.fillStyle = 'rgba(85,58,34,0.25)';
      for (let j = 0; j < 3; j++) { x.beginPath(); x.arc(cx + r() * 4, cy + r() * 4, 0.7 + r() * 0.4, 0, TAU); x.fill(); }
    }
    for (let i = 0; i < 26; i++) { // abraded / scraped patches
      const cx = r() * W, cy = r() * Hh, rr = 20 + r() * 60, g = x.createRadialGradient(cx, cy, 0, cx, cy, rr);
      const lighter = r() < 0.5; g.addColorStop(0, lighter ? 'rgba(250,240,215,0.18)' : 'rgba(150,110,60,0.07)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
    }
    // show-through of the text on the other side of the leaf (mirrored ghost)
    x.save(); x.translate(W, 0); x.scale(-1, 1); x.filter = 'blur(1.2px)'; x.fillStyle = 'rgba(70,44,24,0.02)'; x.font = FONT.frak(30);
    const ghost = 'Domine labia mea aperies et os meum annuntiabit laudem tuam deus in adiutorium meum intende domine ad adiuvandum me festina gloria patri et filio';
    for (let i = 0; i < 13; i++) x.fillText(ghost.slice((i * 11) % 40), 150, 128 + i * 44);
    x.restore();
    VEL = c; return c;
  }
  function textures() {
    if (GT) return;
    const r = H.rng(77), nz = H.makeNoise(78);
    GT = H.layer(160, 160); let g = GT.getContext('2d');
    const im = g.createImageData(160, 160);
    for (let y = 0; y < 160; y++) for (let x = 0; x < 160; x++) {
      const v = 228 + nz.fbm2(x * 0.06, y * 0.06, 3) * 40 + (r() - 0.5) * 22, o = (y * 160 + x) * 4;
      im.data[o] = v; im.data[o + 1] = v * 0.96; im.data[o + 2] = v * 0.88; im.data[o + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    g.strokeStyle = 'rgba(110,70,25,0.45)'; g.lineWidth = 0.7;
    for (let k = 0; k < 9; k++) { let px = r() * 160, py = r() * 160, a = r() * TAU; g.beginPath(); g.moveTo(px, py); for (let i = 0; i < 12; i++) { a += (r() - 0.5) * 1.2; px += Math.cos(a) * 5; py += Math.sin(a) * 5; g.lineTo(px, py); } g.stroke(); }
    PT = H.layer(128, 128); g = PT.getContext('2d');
    const im2 = g.createImageData(128, 128);
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      const v = 236 + nz.fbm2(x * 0.09 + 5, y * 0.09, 3) * 26 + (r() < 0.06 ? -60 * r() : (r() - 0.5) * 16), o = (y * 128 + x) * 4;
      im2.data[o] = v; im2.data[o + 1] = v; im2.data[o + 2] = v; im2.data[o + 3] = 255;
    }
    g.putImageData(im2, 0, 0);
  }
  const pat = (ctx, k) => { textures(); const key = '__ill' + k; if (!ctx[key]) ctx[key] = ctx.createPattern(k === 'g' ? GT : PT, 'repeat'); return ctx[key]; };

  // ---------------------------------------------------------------- gold: one diagonal gradient per frame, with a burnish glint
  // Burnished leaf has strong specular contrast: deep brown-gold reflections next to near-white highlights.
  // The ramp is sampled along a short, irregular period so that every gilt object crosses at least one bright band.
  const GRAMP = [[0, [104, 64, 16]], [0.3, [162, 108, 32]], [0.56, [208, 154, 52]], [0.8, [238, 198, 98]], [1, [253, 230, 152]]];
  const ramp = (v) => { v = cl(v); for (let i = 1; i < GRAMP.length; i++) if (v <= GRAMP[i][0]) { const a = GRAMP[i - 1], b = GRAMP[i]; return H.mix(a[1], b[1], (v - a[0]) / (b[0] - a[0])); } return GRAMP[GRAMP.length - 1][1]; };
  const baseGold = (u) => ramp(0.52 + 0.3 * Math.sin(u * TAU * 8.6 + 0.5) + 0.16 * Math.sin(u * TAU * 21.3 + 2.1) + 0.06 * Math.sin(u * TAU * 47 + 0.7));
  const GPRE = []; for (let i = 0; i <= 56; i++) GPRE.push([i / 56, baseGold(i / 56)]);
  function setGold(ctx, p, boost) {
    const g = ctx.createLinearGradient(0, 0, 1280, 720), us = GPRE.map((q) => q[0]);
    for (const o of [-0.05, -0.032, -0.02, -0.012, -0.006, 0, 0.006, 0.012, 0.02, 0.032, 0.05]) { const u = p + o; if (u > 0 && u < 1) us.push(u); }
    us.sort((a, b) => a - b);
    for (const u of us) { const b = Math.exp(-Math.pow((u - p) / 0.015, 2)) * boost * 1.3 + Math.exp(-Math.pow((u - p) / 0.05, 2)) * boost * 0.25, m = H.mix(baseGold(u), [255, 250, 222], cl(b)); g.addColorStop(u, `rgb(${m[0] | 0},${m[1] | 0},${m[2] | 0})`); }
    ctx.__gold = g;
  }
  // bounding box of a path function (in the caller's user space), by replaying it into a tiny recorder
  function pathBox(path) {
    let m = [1, 0, 0, 1, 0, 0], x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; const st = [];
    const P = (x, y) => { const X = m[0] * x + m[2] * y + m[4], Y = m[1] * x + m[3] * y + m[5]; if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y; };
    const arcPts = (x, y, rx, ry, rot, a0, a1, ccw) => {
      let span = ccw ? -((((a0 - a1) % TAU) + TAU) % TAU) : ((((a1 - a0) % TAU) + TAU) % TAU);
      if (Math.abs(a1 - a0) >= TAU - 1e-9) span = ccw ? -TAU : TAU;
      const cr = Math.cos(rot), sr = Math.sin(rot);
      for (let i = 0; i <= 16; i++) { const a = a0 + span * i / 16, ex = Math.cos(a) * rx, ey = Math.sin(a) * ry; P(x + ex * cr - ey * sr, y + ex * sr + ey * cr); }
    };
    const R = {
      moveTo: P, lineTo: P, quadraticCurveTo(a, b, x, y) { P(a, b); P(x, y); }, bezierCurveTo(a, b, c, d, x, y) { P(a, b); P(c, d); P(x, y); },
      rect(x, y, w, h) { P(x, y); P(x + w, y + h); P(x + w, y); P(x, y + h); },
      arc(x, y, r, a0, a1, ccw) { arcPts(x, y, r, r, 0, a0, a1, ccw); }, ellipse(x, y, rx, ry, rot, a0, a1, ccw) { arcPts(x, y, rx, ry, rot, a0, a1, ccw); },
      save() { st.push(m.slice()); }, restore() { m = st.pop() || m; },
      translate(x, y) { m = [m[0], m[1], m[2], m[3], m[4] + m[0] * x + m[2] * y, m[5] + m[1] * x + m[3] * y]; },
      rotate(a) { const c = Math.cos(a), s = Math.sin(a); m = [m[0] * c + m[2] * s, m[1] * c + m[3] * s, -m[0] * s + m[2] * c, -m[1] * s + m[3] * c, m[4], m[5]]; },
      scale(sx, sy) { m = [m[0] * sx, m[1] * sx, m[2] * sy, m[3] * sy, m[4], m[5]]; },
    };
    const noop = () => {};
    path(new Proxy(R, { get: (o, k) => (k in o ? o[k] : noop), set: () => true }));
    return x1 >= x0 ? [x0, y0, x1 - x0, y1 - y0] : null;
  }
  // raised gesso under the leaf: the gilt piece is a cushion lit from the upper-left. Expects the clip set to the shape.
  function gessoDome(ctx, path, o) {
    const bb = pathBox(path); if (!bb) return;
    const [bx, by, bw, bh] = bb; if (Math.max(bw, bh) < 9) return; // tiny bosses already carry their own highlight dot
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    if (o.ring) { // an annular rim: a torus-like cushion, brightest along its crest and on the upper-left
      const [rcx, rcy, ri, ro] = o.ring, g = ctx.createRadialGradient(rcx, rcy, ri, rcx, rcy, ro);
      g.addColorStop(0, 'rgba(255,236,170,0)'); g.addColorStop(0.42, 'rgba(255,236,170,0.38)'); g.addColorStop(1, 'rgba(255,236,170,0)');
      ctx.fillStyle = g; ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
      const d = ctx.createLinearGradient(rcx - ro, rcy - ro, rcx + ro, rcy + ro);
      d.addColorStop(0, 'rgba(255,238,180,0.34)'); d.addColorStop(0.45, 'rgba(255,238,180,0)');
      ctx.fillStyle = d; ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
      ctx.globalCompositeOperation = 'multiply';
      const s2 = ctx.createLinearGradient(rcx - ro, rcy - ro, rcx + ro, rcy + ro);
      s2.addColorStop(0.55, 'rgba(255,255,255,0)'); s2.addColorStop(1, 'rgba(110,58,14,0.55)');
      ctx.fillStyle = s2; ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
    } else if (bw > bh * 2.4 || bh > bw * 2.4) { // a long bar: rounded cross-section, light on its upper/left flank
      const v = bh > bw, g = v ? ctx.createLinearGradient(bx, 0, bx + bw, 0) : ctx.createLinearGradient(0, by, 0, by + bh);
      g.addColorStop(0, 'rgba(255,236,170,0.12)'); g.addColorStop(0.3, 'rgba(255,238,175,0.5)'); g.addColorStop(0.62, 'rgba(255,236,170,0)');
      ctx.fillStyle = g; ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      ctx.globalCompositeOperation = 'multiply';
      const d = v ? ctx.createLinearGradient(bx, 0, bx + bw, 0) : ctx.createLinearGradient(0, by, 0, by + bh);
      d.addColorStop(0.6, 'rgba(255,255,255,0)'); d.addColorStop(1, 'rgba(110,58,14,0.6)');
      ctx.fillStyle = d; ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
    } else { // a domed boss
      const cx = bx + bw / 2, cy = by + bh / 2;
      ctx.translate(cx, cy); ctx.scale(bw / 2, bh / 2);
      const g = ctx.createRadialGradient(-0.38, -0.42, 0, -0.2, -0.22, 1.25);
      g.addColorStop(0, 'rgba(255,240,185,0.55)'); g.addColorStop(0.45, 'rgba(255,236,170,0.15)'); g.addColorStop(1, 'rgba(255,236,170,0)');
      ctx.fillStyle = g; ctx.fillRect(-1.1, -1.1, 2.2, 2.2);
      ctx.globalCompositeOperation = 'multiply';
      const d = ctx.createRadialGradient(-0.3, -0.34, 0.5, -0.15, -0.18, 1.45);
      d.addColorStop(0, 'rgba(255,255,255,0)'); d.addColorStop(1, 'rgba(110,58,14,0.6)');
      ctx.fillStyle = d; ctx.fillRect(-1.1, -1.1, 2.2, 2.2);
    }
    ctx.restore();
    // inner dark rim where the leaf turns down over the gesso edge
    path(ctx); ctx.globalCompositeOperation = 'source-over'; ctx.lineWidth = Math.min(3, Math.max(1.2, Math.min(bw, bh) * 0.22)); ctx.strokeStyle = 'rgba(80,40,10,0.35)'; ctx.stroke();
  }
  // raised gilding: bole and cast shadow, gold, burnish texture, gesso dome, black outline
  function gilt(ctx, path, o = {}) {
    ctx.save();
    path(ctx);
    ctx.shadowColor = 'rgba(60,28,6,0.55)'; ctx.shadowOffsetX = o.sh == null ? 1.3 : o.sh; ctx.shadowOffsetY = o.sh == null ? 1.9 : o.sh * 1.4; ctx.shadowBlur = 2;
    ctx.fillStyle = '#7c3818'; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = ctx.__gold; ctx.fill();
    ctx.save(); ctx.clip();
    if (o.tex !== false) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.45; ctx.fillStyle = pat(ctx, 'g'); ctx.fill(); ctx.restore(); }
    if (o.dome !== false) gessoDome(ctx, path, o);
    ctx.restore();
    if (o.line !== false) { path(ctx); ctx.lineWidth = o.lw || 1; ctx.strokeStyle = 'rgba(38,22,8,0.9)'; ctx.stroke(); }
    ctx.restore();
  }
  // gold lettering on raised gesso: the glyphs themselves mask a top-lit sheen, a shaded foot and a bevel
  function goldText(ctx, str, x0, y, px, lw) {
    ctx.fillStyle = ctx.__gold; ctx.fillText(str, x0, y);
    ctx.save();
    ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = 'rgba(236,168,40,0.5)'; ctx.fillText(str, x0, y); // keep it rich, not khaki
    ctx.globalCompositeOperation = 'screen';
    const sh = ctx.createLinearGradient(0, y - px * 0.78, 0, y - px * 0.18);
    sh.addColorStop(0, 'rgba(255,238,175,0.5)'); sh.addColorStop(0.45, 'rgba(255,236,170,0.12)'); sh.addColorStop(1, 'rgba(255,236,170,0)');
    ctx.fillStyle = sh; ctx.fillText(str, x0, y);
    ctx.globalCompositeOperation = 'multiply';
    const ft = ctx.createLinearGradient(0, y - px * 0.3, 0, y + px * 0.08);
    ft.addColorStop(0, 'rgba(255,255,255,0)'); ft.addColorStop(1, 'rgba(150,80,14,0.45)');
    ctx.fillStyle = ft; ctx.fillText(str, x0, y);
    const d = Math.max(0.8, px * 0.012);
    ctx.fillStyle = 'rgba(140,80,22,0.4)'; ctx.fillText(str, x0 + d, y + d);
    ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(255,238,180,0.4)'; ctx.fillText(str, x0 - d, y - d);
    ctx.restore();
    ctx.lineWidth = lw; ctx.strokeStyle = 'rgba(36,20,8,0.95)'; ctx.strokeText(str, x0, y);
  }
  // pigment: flat body colour, granulation, darker pooled edge, ink outline
  function paint(ctx, path, color, o = {}) {
    ctx.save(); path(ctx);
    ctx.fillStyle = color; ctx.fill();
    ctx.clip();
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = o.tex == null ? 0.6 : o.tex; ctx.fillStyle = pat(ctx, 'p'); ctx.fill();
    ctx.globalAlpha = 0.3; ctx.strokeStyle = 'rgba(30,15,10,1)'; ctx.lineWidth = o.edgeW || 4; ctx.stroke();
    ctx.restore();
    if (o.ink) { ctx.save(); path(ctx); ctx.lineWidth = o.lw || 1.3; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore(); }
  }
  function floodClip(ctx, x, y, r, seed = 1) {
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, rr = Math.max(0.1, r * (1 + 0.09 * Math.sin(a * 3 + seed) + 0.05 * Math.sin(a * 7 + seed * 2.3))); i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.clip();
  }
  function sectorClip(ctx, x, y, r, a0, p) { ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, a0, a0 + p * TAU); ctx.closePath(); ctx.clip(); }

  // ---------------------------------------------------------------- the scribe's writing (and where the quill nib is)
  let NIB = null, BASE = null;
  function write(ctx, str, x, y, font, color, prog, align = 'left', o = {}) {
    if (prog <= 0) return 0;
    ctx.save(); ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const w = ctx.measureText(str).width, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    const px = parseFloat(/(\d+(?:\.\d+)?)px/.exec(font)[1]);
    let rx = x0 + w;
    if (prog < 1) {
      const n = str.length * prog, k = Math.floor(n);
      const a = ctx.measureText(str.slice(0, k)).width, b = ctx.measureText(str.slice(0, k + 1)).width;
      rx = x0 + a + (b - a) * (n - k);
      ctx.beginPath(); ctx.rect(x0 - px, y - px * 1.4, rx - x0 + px, px * 2.1); ctx.clip();
      if (BASE && !o.noNib) { const m = BASE.inverse().multiply(ctx.getTransform()), q = m.transformPoint(new DOMPoint(rx, y - px * 0.28)); NIB = { x: q.x, y: q.y }; }
    }
    if (o.gold) {
      ctx.fillStyle = '#6a3014'; ctx.fillText(str, x0 + 1.6, y + 2.2);
      goldText(ctx, str, x0, y, px, o.lw || 1.3);
    } else {
      ctx.fillStyle = color; ctx.fillText(str, x0, y);
      ctx.globalAlpha = 0.22; ctx.fillStyle = '#000'; ctx.fillText(str, x0 + 0.5, y + 0.4); // ink pooling on the down-strokes
      if (prog < 1) { // the freshest letters are still wet: darker and glossier
        ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.rect(rx - px * 1.2, y - px * 1.4, px * 1.2, px * 2.1); ctx.clip();
        ctx.fillStyle = C.inkWet; ctx.fillText(str, x0, y);
      }
    }
    ctx.restore();
    return w;
  }
  // a goose-quill held by the scribe, nib on the vellum
  function quill(ctx, x, y, t) {
    const a = -0.98 + Math.sin(t * 13) * 0.04, wob = Math.sin(t * 23) * 1.5;
    const shape = (c) => {
      c.beginPath(); c.moveTo(0, 0); c.lineTo(16, -2.2); c.lineTo(70, -4.2);
      c.bezierCurveTo(130, -26, 230, -30, 330, -8); c.bezierCurveTo(250, 4, 150, 14, 70, 4.2); c.lineTo(16, 2.2); c.closePath();
    };
    ctx.save(); ctx.translate(x + wob, y);
    ctx.save(); ctx.translate(18, 26); ctx.rotate(a); ctx.fillStyle = 'rgba(60,35,15,0.16)'; shape(ctx); ctx.fill(); ctx.restore();
    ctx.rotate(a);
    const g = ctx.createLinearGradient(0, -30, 0, 14); g.addColorStop(0, '#fbf7ee'); g.addColorStop(0.6, '#e6dccb'); g.addColorStop(1, '#b9ab93');
    ctx.fillStyle = g; shape(ctx); ctx.fill(); ctx.strokeStyle = 'rgba(60,40,20,0.7)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.strokeStyle = 'rgba(120,100,80,0.45)'; ctx.lineWidth = 0.7;
    for (let i = 80; i < 320; i += 7) { ctx.beginPath(); ctx.moveTo(i, -1); ctx.lineTo(i + 16, -18 * Math.sin((i - 70) / 260 * Math.PI) - 3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i, 1); ctx.lineTo(i + 12, 9 * Math.sin((i - 70) / 260 * Math.PI) + 2); ctx.stroke(); }
    ctx.strokeStyle = '#a8916a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(320, -7); ctx.stroke();
    ctx.fillStyle = '#1a0f08'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(15, -2.3); ctx.lineTo(15, 2.3); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---------------------------------------------------------------- ivy-leaf rinceaux, bezants
  function leafPath(c, x, y, a, L) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-0.2 * L, -0.62 * L, 0.5 * L, -0.62 * L, L, 0); c.bezierCurveTo(0.5 * L, 0.62 * L, -0.2 * L, 0.62 * L, 0, 0);
    c.restore();
  }
  function bezant(ctx, x, y, r, s = 1) {
    if (s <= 0) return;
    gilt(ctx, (c) => { c.beginPath(); c.arc(x, y, r * s, 0, TAU); }, { tex: false, lw: 0.9 });
    ctx.fillStyle = 'rgba(255,250,225,0.85)'; ctx.beginPath(); ctx.arc(x - r * 0.35 * s, y - r * 0.35 * s, r * 0.28 * s, 0, TAU); ctx.fill();
  }
  function leaf(ctx, x, y, a, L, col, s = 1) {
    if (s <= 0) return;
    const p = (c) => leafPath(c, x, y, a, L * s);
    if (col === 'gold') gilt(ctx, p, { tex: false, lw: 0.9 });
    else {
      paint(ctx, p, col, { edgeW: 2.5, ink: true, lw: 0.9 });
      ctx.save(); ctx.strokeStyle = 'rgba(250,245,230,0.8)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * L * s * 0.15, y + Math.sin(a) * L * s * 0.15); ctx.lineTo(x + Math.cos(a) * L * s * 0.75, y + Math.sin(a) * L * s * 0.75); ctx.stroke(); ctx.restore();
    }
  }
  function tendril(r, x, y, ang, len, curl) {
    const pts = [[x, y]], n = Math.max(4, Math.round(len / 2.4)); let a = ang, px = x, py = y;
    for (let i = 1; i <= n; i++) { const u = i / n; a += curl * (0.015 + 0.2 * u * u); px += Math.cos(a) * 2.4 * (1 - u * 0.45); py += Math.sin(a) * 2.4 * (1 - u * 0.45); pts.push([px, py]); }
    const end = r() < 0.55 ? { k: 'b', r: 3.6 + r() * 1.4 } : { k: 'l', col: r.pick(['gold', 'gold', C.lapis, C.verm, C.mal, C.rose]), L: 11 + r() * 5 };
    end.x = px; end.y = py; end.a = a + curl * 0.6;
    return { pts, end };
  }
  const BORD = {};
  function buildBorder(seed) {
    if (BORD[seed]) return BORD[seed];
    const r = H.rng(seed), stems = [], T = [];
    const corner = []; for (let i = 0; i <= 30; i++) { const u = i / 30, a = Math.PI + u * 1.9; corner.push([60 + 30 + Math.cos(a) * 30 * (1 - u * 0.3) + u * 20, 44 + Math.sin(a) * 26 * (1 - u * 0.3) - 6]); }
    const bot = []; for (let x = 60; x <= 1205; x += 4) bot.push([x, 688 + Math.sin(x * 0.03 + 1) * 5]);
    stems.push({ pts: corner, s: 0 }, { pts: bot, s: 0.5 });
    for (let y = 70, i = 0; y < 664; y += 26, i++) {
      const left = i % 2 === 0, tilt = (r() - 0.5) * 0.9;
      const t = tendril(r, left ? 54 : 66, y, left ? Math.PI + tilt : tilt, left ? 26 + r() * 14 : 22 + r() * 12, (r() < 0.5 ? 1 : -1));
      t.s = (y - 44) / 632 * 0.5; T.push(t);
    }
    for (let x = 96, i = 0; x < 1195; x += 30, i++) {
      const up = i % 2 === 0, y = 688 + Math.sin(x * 0.03 + 1) * 5;
      const t = tendril(r, x, y, (up ? -Math.PI / 2 : Math.PI / 2) + (r() - 0.5) * 0.8, up ? 20 + r() * 8 : 12 + r() * 6, r() < 0.5 ? 1 : -1);
      t.s = 0.5 + (x - 60) / 1140 * 0.48; T.push(t);
    }
    for (let k = 0; k < 4; k++) { const t = tendril(r, 70 + k * 14, 28 + k * 3, -0.4 + k * 0.5, 22, k % 2 ? 1 : -1); t.s = 0.02; T.push(t); }
    return (BORD[seed] = { stems, T });
  }
  function polyPart(ctx, pts, p) {
    const n = Math.floor((pts.length - 1) * p); if (n < 1) return;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i <= n; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
  }
  function bar(ctx, p) {
    if (p <= 0) return;
    const y0 = 44, y1 = 44 + 632 * eo(p);
    gilt(ctx, (c) => { c.beginPath(); c.rect(53, y0, 14, y1 - y0); }, { lw: 0.9 });
    for (let y = y0 + 4, i = 0; y < y1 - 6; y += 54, i++) {
      const h = Math.min(46, y1 - 6 - y);
      paint(ctx, (c) => { c.beginPath(); c.rect(56, y, 8, h); }, i % 2 ? C.rose : C.lapis, { edgeW: 2 });
      ctx.strokeStyle = 'rgba(250,245,232,0.85)'; ctx.lineWidth = 0.8; ctx.beginPath();
      for (let k = 0; k < h - 4; k += 6) { ctx.moveTo(57.5, y + k + 2); ctx.lineTo(62.5, y + k + 5); }
      ctx.stroke();
    }
    if (p >= 1) { bezant(ctx, 60, 40, 6); bezant(ctx, 60, 680, 6); }
  }
  function border(ctx, seed, p) {
    const B = buildBorder(seed);
    bar(ctx, win(p, 0, 0.4));
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    ctx.lineWidth = 1.2; for (const s of B.stems) polyPart(ctx, s.pts, win(p, s.s, s.s + 0.45));
    ctx.lineWidth = 0.95; for (const t of B.T) polyPart(ctx, t.pts, win(p, t.s, t.s + 0.07));
    ctx.restore();
    for (const t of B.T) {
      const s = eo(win(p, t.s + 0.06, t.s + 0.11)); if (s <= 0) continue;
      const e = t.end;
      if (e.k === 'b') {
        bezant(ctx, e.x, e.y, e.r, s);
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 0.6; ctx.globalAlpha = s; // hairline whiskers
        for (let k = 0; k < 3; k++) { const a = e.a + (k - 1) * 0.7, r0 = e.r + 1.5; ctx.beginPath(); ctx.moveTo(e.x + Math.cos(a) * r0, e.y + Math.sin(a) * r0); ctx.quadraticCurveTo(e.x + Math.cos(a + 0.3) * (r0 + 5), e.y + Math.sin(a + 0.3) * (r0 + 5), e.x + Math.cos(a) * (r0 + 9), e.y + Math.sin(a) * (r0 + 9)); ctx.stroke(); }
        ctx.restore();
      } else leaf(ctx, e.x, e.y, e.a, e.L, e.col, s);
    }
  }
  // a small burst of tendrils around a point (an initial blooming into the margin)
  const SPR = {};
  function spray(ctx, x, y, p, seed, dirs) {
    if (p <= 0) return;
    const key = seed + ':' + dirs.join(',');
    if (!SPR[key]) { const r = H.rng(seed); SPR[key] = dirs.map((a, i) => tendril(r, 0, 0, a, 30 + r() * 16, i % 2 ? 1 : -1)); }
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = C.ink; ctx.lineWidth = 0.95; ctx.lineCap = 'round';
    for (const t of SPR[key]) polyPart(ctx, t.pts, win(p, 0, 0.7));
    for (const t of SPR[key]) { const s = eo(win(p, 0.6, 1)); const e = t.end; if (e.k === 'b') bezant(ctx, e.x, e.y, e.r, s); else leaf(ctx, e.x, e.y, e.a, e.L, e.col, s); }
    ctx.restore();
  }

  // ---------------------------------------------------------------- the page: vellum, ruling, pricking, border
  function pageBase(ctx, verso, ruleA, borderP, seed) {
    ctx.save(); if (verso) { ctx.translate(1280, 0); ctx.scale(-1, 1); } ctx.drawImage(vellum(), 0, 0); ctx.restore();
    if (ruleA > 0) {
      ctx.save(); ctx.globalAlpha = ruleA; ctx.strokeStyle = 'rgba(150,108,72,0.2)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = 132; y < 650; y += 44) { ctx.moveTo(108, y + 0.5); ctx.lineTo(1226, y + 0.5); }
      for (const x of [104, 110, 1224, 1230]) { ctx.moveTo(x + 0.5, 18); ctx.lineTo(x + 0.5, 664); }
      ctx.stroke();
      for (let y = 132; y < 650; y += 44) { // pricking holes in the outer margin
        ctx.fillStyle = 'rgba(70,45,25,0.55)'; ctx.beginPath(); ctx.ellipse(1254, y, 1.4, 1.1, 0.4, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,248,228,0.5)'; ctx.beginPath(); ctx.arc(1254.6, y + 1.3, 1, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
    border(ctx, seed, borderP);
  }

  // ---------------------------------------------------------------- champ initial: gold letter on parted lapis/rose ground, white filigree
  const FIL = {};
  function champ(ctx, letter, x, y, s, t, t0, seed = 3) {
    const gP = win(t, t0, t0 + 0.32), lP = win(t, t0 + 0.2, t0 + 0.5), fP = win(t, t0 + 0.32, t0 + 0.62);
    if (gP <= 0) return;
    const cx = x + s / 2, cy = y + s / 2;
    ctx.save();
    if (gP < 1) floodClip(ctx, cx, cy, s * 0.78 * eo(gP), seed);
    paint(ctx, (c) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + s, y); c.lineTo(x + s, y + s); c.closePath(); }, C.lapis, { edgeW: s * 0.03 });
    paint(ctx, (c) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + s); c.lineTo(x + s, y + s); c.closePath(); }, C.rose, { edgeW: s * 0.03 });
    ctx.restore();
    if (fP > 0) { // white-lead filigree: inset line, curls and dot triads
      if (!FIL[seed]) { const r = H.rng(seed + 100), m = []; for (let i = 0; i < 26; i++) m.push([0.1 + r() * 0.8, 0.1 + r() * 0.8, r() * TAU, r() < 0.5]); FIL[seed] = m; }
      ctx.save(); ctx.globalAlpha = fP; ctx.strokeStyle = 'rgba(252,248,236,0.9)'; ctx.fillStyle = 'rgba(252,248,236,0.9)'; ctx.lineWidth = Math.max(0.7, s * 0.006);
      ctx.strokeRect(x + s * 0.04, y + s * 0.04, s * 0.92, s * 0.92);
      for (const [u, v, a, curl] of FIL[seed]) {
        const px = x + u * s, py = y + v * s, k = s * 0.035;
        if (curl) { ctx.beginPath(); ctx.arc(px, py, k, a, a + 4.2); ctx.stroke(); }
        else for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(px + Math.cos(a + j * 2.1) * k * 0.6, py + Math.sin(a + j * 2.1) * k * 0.6, Math.max(0.8, s * 0.006), 0, TAU); ctx.fill(); }
      }
      ctx.restore();
    }
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(1, s * 0.008); ctx.strokeRect(x, y, s, s); ctx.restore();
    if (lP > 0) {
      ctx.save(); ctx.globalAlpha = lP; ctx.font = FONT.fell(s * 0.84); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      const by = y + s * 0.8;
      ctx.fillStyle = '#5e2a10'; ctx.fillText(letter, cx + s * 0.012, by + s * 0.016);
      ctx.textAlign = 'left'; const lx = cx - ctx.measureText(letter).width / 2;
      goldText(ctx, letter, lx, by, s * 0.84, Math.max(1, s * 0.007));
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------- figures: cat, dog, brazen head, hare-grotesque, snail
  const lw = (u) => Math.max(1, u * 0.022);
  const E = (c, x, y, rx, ry, a = 0) => { c.ellipse(x, y, rx, ry, a, 0, TAU); };
  const FIG = {
    cat(u) {
      return {
        fills: [
          [(c) => { c.beginPath(); c.moveTo(-0.47 * u, -0.08 * u); c.quadraticCurveTo(-0.52 * u, -0.5 * u, -0.38 * u, -0.68 * u); c.quadraticCurveTo(-0.22 * u, -0.48 * u, -0.1 * u, -0.38 * u); c.closePath(); c.moveTo(0.47 * u, -0.08 * u); c.quadraticCurveTo(0.52 * u, -0.5 * u, 0.38 * u, -0.68 * u); c.quadraticCurveTo(0.22 * u, -0.48 * u, 0.1 * u, -0.38 * u); c.closePath(); }, C.ochre],
          [(c) => { c.beginPath(); E(c, 0, 0.06 * u, 0.5 * u, 0.44 * u); }, C.ochre],
          [(c) => { c.beginPath(); c.moveTo(-0.4 * u, -0.2 * u); c.lineTo(-0.37 * u, -0.55 * u); c.lineTo(-0.2 * u, -0.38 * u); c.closePath(); c.moveTo(0.4 * u, -0.2 * u); c.lineTo(0.37 * u, -0.55 * u); c.lineTo(0.2 * u, -0.38 * u); c.closePath(); }, C.rose],
          [(c) => { c.beginPath(); E(c, -0.1 * u, 0.24 * u, 0.15 * u, 0.12 * u); E(c, 0.1 * u, 0.24 * u, 0.15 * u, 0.12 * u); }, C.cream],
          [(c) => { c.beginPath(); for (const s of [-1, 1]) { c.moveTo(s * 0.32 * u, 0); c.quadraticCurveTo(s * 0.2 * u, -0.1 * u, s * 0.08 * u, 0); c.quadraticCurveTo(s * 0.2 * u, 0.07 * u, s * 0.32 * u, 0); } }, '#a9ad3c'],
          [(c) => { c.beginPath(); c.moveTo(-0.06 * u, 0.12 * u); c.lineTo(0.06 * u, 0.12 * u); c.lineTo(0, 0.19 * u); c.closePath(); }, C.rose],
        ],
        ink(c) {
          c.fillStyle = C.ink; c.beginPath(); E(c, -0.2 * u, -0.01 * u, 0.018 * u, 0.06 * u); E(c, 0.2 * u, -0.01 * u, 0.018 * u, 0.06 * u); c.fill();
          c.beginPath();
          for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { c.moveTo(s * 0.18 * u, (0.22 + k * 0.05) * u); c.lineTo(s * (0.62 + k * 0.03) * u, (0.14 + k * 0.1) * u); }
          for (let k = -1; k <= 1; k++) { c.moveTo(k * 0.09 * u, -0.36 * u); c.lineTo(k * 0.07 * u, -0.2 * u); }
          for (const s of [-1, 1]) { c.moveTo(s * 0.48 * u, 0.02 * u); c.lineTo(s * 0.36 * u, 0.06 * u); c.moveTo(s * 0.48 * u, 0.12 * u); c.lineTo(s * 0.36 * u, 0.13 * u); }
          c.moveTo(0, 0.19 * u); c.lineTo(0, 0.26 * u); c.moveTo(-0.1 * u, 0.3 * u); c.quadraticCurveTo(-0.04 * u, 0.32 * u, 0, 0.26 * u); c.quadraticCurveTo(0.04 * u, 0.32 * u, 0.1 * u, 0.3 * u);
          c.stroke();
        },
      };
    },
    dog(u) {
      return {
        fills: [
          [(c) => { c.beginPath(); E(c, -0.42 * u, 0.08 * u, 0.14 * u, 0.36 * u, 0.25); E(c, 0.42 * u, 0.08 * u, 0.14 * u, 0.36 * u, -0.25); }, '#7b4a28'],
          [(c) => { c.beginPath(); E(c, 0, -0.06 * u, 0.38 * u, 0.4 * u); }, C.cream],
          [(c) => { c.beginPath(); E(c, 0.16 * u, -0.1 * u, 0.14 * u, 0.13 * u, 0.4); }, '#9a6236'],
          [(c) => { c.beginPath(); E(c, 0, 0.22 * u, 0.24 * u, 0.19 * u); }, '#f6eedc'],
          [(c) => { c.beginPath(); E(c, 0.02 * u, 0.36 * u, 0.06 * u, 0.06 * u); }, C.rose],
        ],
        ink(c) {
          c.fillStyle = C.ink;
          c.beginPath(); E(c, 0, 0.13 * u, 0.09 * u, 0.06 * u); c.fill();
          c.beginPath(); c.arc(-0.15 * u, -0.1 * u, 0.04 * u, 0, TAU); c.arc(0.16 * u, -0.1 * u, 0.04 * u, 0, TAU); c.fill();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(-0.16 * u, -0.115 * u, 0.012 * u, 0, TAU); c.arc(0.15 * u, -0.115 * u, 0.012 * u, 0, TAU); c.fill();
          c.beginPath(); c.moveTo(0, 0.19 * u); c.lineTo(0, 0.27 * u); c.moveTo(-0.13 * u, 0.29 * u); c.quadraticCurveTo(0, 0.36 * u, 0.13 * u, 0.29 * u);
          c.moveTo(-0.24 * u, -0.22 * u); c.lineTo(-0.08 * u, -0.2 * u); c.moveTo(0.24 * u, -0.22 * u); c.lineTo(0.08 * u, -0.2 * u);
          for (let k = 0; k < 4; k++) { c.moveTo(-0.3 * u + k * 0.02 * u, 0.06 * u + k * 0.05 * u); c.lineTo(-0.2 * u + k * 0.02 * u, 0.04 * u + k * 0.05 * u); }
          c.stroke();
        },
      };
    },
    // the model: a Brazen Head, the talking brass automaton of legend, with clockwork in its breast
    head(u, o) {
      const mo = (o.mouth || 0) * 0.07 * u, lx = (o.look || 0) * 0.03 * u, bl = o.blink || 0, ga = o.gear || 0;
      const headP = (c) => { c.beginPath(); c.moveTo(-0.36 * u, 0.02 * u); c.bezierCurveTo(-0.42 * u, -0.58 * u, 0.42 * u, -0.58 * u, 0.36 * u, 0.02 * u); c.bezierCurveTo(0.33 * u, 0.3 * u, 0.15 * u, 0.38 * u, 0, 0.38 * u); c.bezierCurveTo(-0.15 * u, 0.38 * u, -0.33 * u, 0.3 * u, -0.36 * u, 0.02 * u); };
      const gear = (gx, gy, r, n, a) => (c) => { c.beginPath(); for (let i = 0; i < n * 4; i++) { const aa = a + i * TAU / (n * 4), rr = (i % 4 < 2) ? r : r * 0.78; i ? c.lineTo(gx + Math.cos(aa) * rr, gy + Math.sin(aa) * rr) : c.moveTo(gx + Math.cos(aa) * rr, gy + Math.sin(aa) * rr); } c.closePath(); };
      return {
        fills: [
          [(c) => { c.beginPath(); c.moveTo(-0.95 * u, 1.05 * u); c.quadraticCurveTo(-0.85 * u, 0.48 * u, -0.25 * u, 0.44 * u); c.lineTo(0.25 * u, 0.44 * u); c.quadraticCurveTo(0.85 * u, 0.48 * u, 0.95 * u, 1.05 * u); c.closePath(); }, C.verm],
          [(c) => { c.beginPath(); c.rect(-0.16 * u, 0.26 * u, 0.32 * u, 0.22 * u); }, 'gold'],
          [(c) => { c.beginPath(); c.moveTo(-0.3 * u, 0.46 * u); c.quadraticCurveTo(0, 0.6 * u, 0.3 * u, 0.46 * u); c.lineTo(0.27 * u, 0.53 * u); c.quadraticCurveTo(0, 0.67 * u, -0.27 * u, 0.53 * u); c.closePath(); }, 'gold'],
          [gear(-0.2 * u, 0.8 * u, 0.15 * u, 10, ga), C.lapis],
          [gear(0.09 * u, 0.76 * u, 0.11 * u, 8, -ga * 1.36 + 0.2), C.mal],
          [(c) => { c.beginPath(); c.arc(-0.38 * u, -0.02 * u, 0.075 * u, 0, TAU); c.moveTo(0.455 * u, -0.02 * u); c.arc(0.38 * u, -0.02 * u, 0.075 * u, 0, TAU); }, 'gold'],
          [(c) => { c.beginPath(); c.rect(-0.03 * u, -0.56 * u, 0.06 * u, 0.16 * u); c.moveTo(0.065 * u, -0.6 * u); c.arc(0, -0.6 * u, 0.065 * u, 0, TAU); }, 'gold'],
          [headP, 'gold'],
          [(c) => { c.beginPath(); for (const s of [-1, 1]) { c.moveTo(s * 0.24 * u, -0.06 * u); c.quadraticCurveTo(s * 0.14 * u, -0.06 * u - 0.06 * u * (1 - bl), s * 0.05 * u, -0.06 * u); c.quadraticCurveTo(s * 0.14 * u, -0.06 * u + 0.04 * u * (1 - bl), s * 0.24 * u, -0.06 * u); } }, C.white],
          [(c) => { c.beginPath(); c.rect(-0.11 * u, 0.17 * u, 0.22 * u, 0.025 * u + mo); }, '#2a120a'],
        ],
        shade(c) { // volume on the brass: darker away from the light
          c.save(); headP(c); c.clip(); const g = c.createRadialGradient(-0.15 * u, -0.25 * u, 0.05 * u, 0, 0, 0.6 * u);
          g.addColorStop(0, 'rgba(255,250,220,0.35)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(70,35,5,0.45)'); c.fillStyle = g; c.fillRect(-u, -u, 2 * u, 2 * u); c.restore();
          c.save(); c.strokeStyle = 'rgba(250,245,232,0.85)'; c.lineWidth = Math.max(0.8, u * 0.008); c.beginPath(); // white folds on the robe
          for (const s of [-1, 1]) { c.moveTo(s * 0.5 * u, 0.55 * u); c.quadraticCurveTo(s * 0.6 * u, 0.75 * u, s * 0.58 * u, 1.0 * u); c.moveTo(s * 0.68 * u, 0.62 * u); c.quadraticCurveTo(s * 0.78 * u, 0.82 * u, s * 0.76 * u, 1.0 * u); }
          c.stroke(); c.restore();
        },
        ink(c) {
          if (bl < 0.9) { c.fillStyle = C.lapisD; c.beginPath(); c.arc(-0.145 * u + lx, -0.06 * u, 0.03 * u, 0, TAU); c.arc(0.145 * u + lx, -0.06 * u, 0.03 * u, 0, TAU); c.fill(); }
          c.beginPath();
          for (const s of [-1, 1]) { c.moveTo(s * 0.26 * u, -0.14 * u); c.quadraticCurveTo(s * 0.15 * u, -0.2 * u, s * 0.05 * u, -0.15 * u); }
          c.moveTo(-0.02 * u, -0.1 * u); c.quadraticCurveTo(-0.01 * u, 0.06 * u, 0.04 * u, 0.1 * u); c.lineTo(-0.03 * u, 0.11 * u);
          c.moveTo(-0.34 * u, -0.26 * u); c.quadraticCurveTo(0, -0.33 * u, 0.34 * u, -0.26 * u);
          for (const s of [-1, 1]) { c.moveTo(s * 0.14 * u, 0.15 * u); c.lineTo(s * 0.13 * u, 0.33 * u); }
          for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.3; c.moveTo(s * 0.38 * u, -0.02 * u); c.lineTo(s * 0.38 * u + Math.cos(a) * 0.06 * u, -0.02 * u + Math.sin(a) * 0.06 * u); }
          c.stroke();
          c.fillStyle = C.ink; for (let k = -3; k <= 3; k++) { c.beginPath(); c.arc(k * 0.09 * u, -0.29 * u + Math.abs(k) * 0.012 * u, 0.012 * u, 0, TAU); c.fill(); }
          c.beginPath(); c.arc(-0.2 * u, 0.8 * u, 0.035 * u, 0, TAU); c.arc(0.09 * u, 0.76 * u, 0.03 * u, 0, TAU); c.fill();
        },
      };
    },
    // marginal drollery: a hare-headed beast with a foliate dragon's tail, pointing
    hare(u, o) {
      const arm = o.arm == null ? 0.9 : o.arm, ear = (o.ear || 0) * 0.08;
      const rod = o.rod || 0, sx = -0.24 * u, sy = -0.76 * u, ax = sx + Math.cos(arm) * 0.5 * u, ay = sy + Math.sin(arm) * 0.5 * u, nx = -Math.sin(arm) * 0.045 * u, ny = Math.cos(arm) * 0.045 * u;
      return {
        fills: [
          [(c) => { c.beginPath(); c.moveTo(0.22 * u, -0.45 * u); c.bezierCurveTo(0.75 * u, -0.5 * u, 0.85 * u, 0.05 * u, 0.5 * u, 0.1 * u); c.bezierCurveTo(0.3 * u, 0.12 * u, 0.32 * u, -0.15 * u, 0.48 * u, -0.12 * u); c.bezierCurveTo(0.58 * u, -0.15 * u, 0.6 * u, -0.32 * u, 0.22 * u, -0.3 * u); c.closePath(); }, C.mal],
          [(c) => { c.beginPath(); E(c, 0.16 * u, -1.4 * u, 0.065 * u, 0.27 * u, 0.32 + ear); E(c, 0.27 * u, -1.34 * u, 0.06 * u, 0.24 * u, 0.62 + ear * 0.7); }, C.ochre],
          [(c) => { c.beginPath(); E(c, 0.165 * u, -1.4 * u, 0.025 * u, 0.19 * u, 0.32 + ear); }, C.rose],
          [(c) => { c.beginPath(); E(c, 0, -0.58 * u, 0.28 * u, 0.4 * u, 0.1); }, C.mal],
          [(c) => { c.beginPath(); E(c, -0.06 * u, -0.55 * u, 0.13 * u, 0.28 * u, 0.1); }, C.cream],
          [(c) => { c.beginPath(); E(c, 0.02 * u, -1.07 * u, 0.22 * u, 0.15 * u, -0.18); }, C.ochre],
          [(c) => { c.beginPath(); c.moveTo(sx + nx, sy + ny); c.lineTo(ax + nx * 0.8, ay + ny * 0.8); c.lineTo(ax - nx * 0.8, ay - ny * 0.8); c.lineTo(sx - nx, sy - ny); c.closePath(); }, C.verm],
          [(c) => { c.beginPath(); c.arc(ax, ay, 0.065 * u, 0, TAU); }, C.cream],
        ],
        ink(c) {
          c.fillStyle = C.ink; c.beginPath(); c.arc(-0.05 * u, -1.12 * u, 0.03 * u, 0, TAU); c.arc(-0.195 * u, -1.02 * u, 0.022 * u, 0, TAU); c.fill();
          c.beginPath();
          c.moveTo(-0.16 * u, -1.0 * u); c.lineTo(-0.3 * u, -1.04 * u); c.moveTo(-0.16 * u, -0.98 * u); c.lineTo(-0.29 * u, -0.95 * u); c.moveTo(-0.18 * u, -0.97 * u); c.quadraticCurveTo(-0.14 * u, -0.94 * u, -0.1 * u, -0.97 * u);
          c.moveTo(-0.12 * u, -0.22 * u); c.lineTo(-0.16 * u, 0); c.lineTo(-0.26 * u, 0.02 * u); c.moveTo(-0.16 * u, 0); c.lineTo(-0.06 * u, 0.02 * u);
          c.moveTo(0.1 * u, -0.22 * u); c.lineTo(0.12 * u, 0); c.lineTo(0.02 * u, 0.02 * u); c.moveTo(0.12 * u, 0); c.lineTo(0.22 * u, 0.02 * u);
          for (let k = 0; k < 4; k++) { c.moveTo(0.08 * u, (-0.8 + k * 0.1) * u); c.lineTo(0.2 * u, (-0.78 + k * 0.1) * u); }
          c.stroke();
          c.save(); c.lineWidth = Math.max(2, u * 0.03); c.lineCap = 'round'; c.beginPath(); c.moveTo(ax + Math.cos(arm) * 0.04 * u, ay + Math.sin(arm) * 0.04 * u); c.lineTo(ax + Math.cos(arm) * 0.17 * u, ay + Math.sin(arm) * 0.17 * u); c.stroke(); c.restore();
          if (rod > 0) { // a long pointer staff, held out at the error
            const bx = ax - Math.cos(arm) * 0.12 * u, by = ay - Math.sin(arm) * 0.12 * u, ex = ax + Math.cos(arm) * rod, ey = ay + Math.sin(arm) * rod;
            c.save(); c.lineCap = 'round'; c.lineWidth = Math.max(3, u * 0.03); c.strokeStyle = '#5a3418'; c.beginPath(); c.moveTo(bx, by); c.lineTo(ex, ey); c.stroke();
            c.lineWidth = 1; c.strokeStyle = C.ink; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + Math.cos(arm) * 12, ey + Math.sin(arm) * 12); c.stroke(); c.restore();
            bezant(c, ex, ey, 5); bezant(c, bx, by, 4);
          }
        },
        after(ctx) { leaf(ctx, 0.47 * u, -0.08 * u, 2.6, 0.24 * u, 'gold'); },
      };
    },
    snail(u, o) {
      const ant = Math.sin(o.wig || 0) * 0.06 * u;
      return {
        fills: [
          [(c) => { c.beginPath(); c.moveTo(-0.9 * u, 0); c.quadraticCurveTo(-0.95 * u, -0.38 * u, -0.7 * u, -0.42 * u); c.quadraticCurveTo(-0.55 * u, -0.2 * u, 0.6 * u, -0.06 * u); c.lineTo(0.65 * u, 0); c.closePath(); }, '#9aa98a'],
          [(c) => { c.beginPath(); c.arc(0.05 * u, -0.42 * u, 0.42 * u, 0, TAU); }, C.ochre],
        ],
        ink(c) {
          c.beginPath(); let a = 0, r = 0.36 * u; c.moveTo(0.05 * u + r, -0.42 * u); for (let i = 0; i < 60; i++) { a += 0.2; r *= 0.975; c.lineTo(0.05 * u + Math.cos(a) * r, -0.42 * u + Math.sin(a) * r); }
          c.moveTo(-0.75 * u, -0.4 * u); c.lineTo(-0.82 * u + ant, -0.72 * u); c.moveTo(-0.7 * u, -0.4 * u); c.lineTo(-0.62 * u - ant, -0.72 * u);
          c.stroke(); c.fillStyle = C.ink; c.beginPath(); c.arc(-0.82 * u + ant, -0.74 * u, 0.04 * u, 0, TAU); c.arc(-0.62 * u - ant, -0.74 * u, 0.04 * u, 0, TAU); c.fill();
        },
      };
    },
  };
  // a figure: ink underdrawing (pen goes round), then pigments flood into the outlines
  function figure(ctx, kind, cx, cy, u, inkP, colP, o = {}) {
    if (inkP <= 0 && colP <= 0) return;
    const P = FIG[kind](u, o);
    ctx.save(); ctx.translate(cx, cy);
    if (colP > 0) {
      ctx.save(); if (colP < 1) floodClip(ctx, 0, kind === 'hare' ? -0.7 * u : 0, colP * u * (kind === 'hare' ? 1.6 : 1.25), 7);
      for (const [p, col] of P.fills) col === 'gold' ? gilt(ctx, p, { line: false, sh: 0.6 }) : paint(ctx, p, col, { edgeW: Math.max(2, u * 0.04) });
      if (P.shade) P.shade(ctx);
      if (P.after) P.after(ctx);
      ctx.restore();
    }
    if (inkP > 0) {
      ctx.save(); if (inkP < 1) sectorClip(ctx, 0, kind === 'hare' ? -0.7 * u : 0, u * 2, -Math.PI / 2, inkP);
      ctx.strokeStyle = C.ink; ctx.lineWidth = lw(u); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      for (const [p] of P.fills) { p(ctx); ctx.stroke(); }
      P.ink(ctx);
      ctx.restore();
    }
    ctx.restore();
  }
  // roundel miniature: gilt ring laid round, lapis ground with white stars, figure inside
  function roundel(ctx, cx, cy, r, kind, p, o = {}) {
    if (p <= 0) return;
    const ringP = eo(win(p, 0, 0.4)), gP = win(p, 0.12, 0.45), iP = win(p, 0.25, 0.65), cP = win(p, 0.45, 0.95), ri = r * 0.86;
    if (gP > 0) {
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, ri, 0, TAU); ctx.clip();
      if (gP < 1) floodClip(ctx, cx, cy, ri * 1.2 * eo(gP), 11);
      paint(ctx, (c) => { c.beginPath(); c.arc(cx, cy, ri + 1, 0, TAU); }, o.ground || C.lapis, { edgeW: r * 0.08 });
      ctx.fillStyle = 'rgba(250,246,234,0.75)';
      const R = H.rng(Math.round(cx * 7 + cy));
      for (let i = 0; i < 16; i++) { const a = R() * TAU, d = Math.sqrt(R()) * ri * 0.92, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.arc(x + Math.cos(j * 1.57) * r * 0.035, y + Math.sin(j * 1.57) * r * 0.035, Math.max(0.7, r * 0.012), 0, TAU); ctx.fill(); } }
      figure(ctx, kind, cx, cy + (o.dy || 0) * r, r * (o.scale || 0.95), iP, cP, o);
      ctx.restore();
    }
    if (ringP > 0) {
      const a0 = -Math.PI / 2, a1 = a0 + ringP * TAU;
      gilt(ctx, (c) => { c.beginPath(); c.arc(cx, cy, r, a0, a1); c.arc(cx, cy, ri, a1, a0, true); c.closePath(); }, { lw: 1, ring: [cx, cy, ri, r] });
      if (ringP >= 1) { ctx.save(); ctx.strokeStyle = 'rgba(40,22,8,0.6)'; ctx.setLineDash([1.5, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, (r + ri) / 2, 0, TAU); ctx.stroke(); ctx.restore(); }
    }
  }

  // ---------------------------------------------------------------- penwork: arrows, rings, scroll
  const bez = (P, u) => { const v = 1 - u; return [v * v * v * P[0][0] + 3 * v * v * u * P[1][0] + 3 * v * u * u * P[2][0] + u * u * u * P[3][0], v * v * v * P[0][1] + 3 * v * v * u * P[1][1] + 3 * v * u * u * P[2][1] + u * u * u * P[3][1]]; };
  function arrowHead(ctx, x, y, a, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-s * 0.6, -s * 0.15, -s * 1.1, -s * 0.6); ctx.lineTo(-s * 0.75, 0); ctx.lineTo(-s * 1.1, s * 0.6); ctx.quadraticCurveTo(-s * 0.6, s * 0.15, 0, 0); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }
  function penBez(ctx, P, p, col, w = 3) {
    if (p <= 0) return;
    const N = 48, n = Math.max(1, Math.round(N * p)), pts = []; for (let i = 0; i <= n; i++) pts.push(bez(P, i / N * (p * N / n)));
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 0.8; // penwork cadels along the shaft
    for (let i = 3; i < pts.length - 4; i += 4) { const a = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]) + Math.PI / 2, s = (i / 4) % 2 ? 7 : -7; ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.quadraticCurveTo(pts[i][0] + Math.cos(a) * s, pts[i][1] + Math.sin(a) * s, pts[i + 2][0] + Math.cos(a) * s * 0.4, pts[i + 2][1] + Math.sin(a) * s * 0.4); ctx.stroke(); }
    ctx.restore();
    if (p >= 1) { const a = bez(P, 0.97), b = P[3]; arrowHead(ctx, b[0], b[1], Math.atan2(b[1] - a[1], b[0] - a[0]), 18, col); }
  }
  function penArc(ctx, cx, cy, R, a0, a1, p, col, w = 3) {
    if (p <= 0) return;
    const ae = a0 + (a1 - a0) * p;
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(cx, cy, R, a0, ae); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 0.8;
    for (let a = a0 + 0.12, i = 0; a < ae - 0.08; a += 0.13, i++) { const s = i % 2 ? 7 : -7; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.quadraticCurveTo(cx + Math.cos(a + 0.03) * (R + s), cy + Math.sin(a + 0.03) * (R + s), cx + Math.cos(a + 0.07) * (R + s * 0.4), cy + Math.sin(a + 0.07) * (R + s * 0.4)); ctx.stroke(); }
    ctx.restore();
    if (p >= 1) arrowHead(ctx, cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, a1 + Math.PI / 2, 18, col);
  }
  // banderole: a speech scroll with rolled ends
  function scroll(ctx, x, y, w, h, p) {
    if (p <= 0) return;
    const ww = w * eo(p), top = (u) => y + Math.sin(u * 5.5) * 4, bot = (u) => y + h + Math.sin(u * 5.5) * 4;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x, top(0)); for (let i = 1; i <= 20; i++) ctx.lineTo(x + ww * i / 20, top(ww * i / 20 / w));
    for (let i = 20; i >= 0; i--) ctx.lineTo(x + ww * i / 20, bot(ww * i / 20 / w)); ctx.closePath();
    ctx.fillStyle = '#f5ecd6'; ctx.fill(); ctx.save(); ctx.clip(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.4; ctx.fillStyle = pat(ctx, 'p'); ctx.fill();
    ctx.globalAlpha = 0.22; ctx.fillStyle = '#7a5a30'; ctx.fillRect(x, bot(0) - 10, w, 14); ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.stroke();
    for (const [ex, flip] of [[x, -1], [x + ww, 1]]) { // rolled ends
      const yy = (top(ex === x ? 0 : ww / w) + bot(ex === x ? 0 : ww / w)) / 2;
      ctx.beginPath(); ctx.ellipse(ex + flip * 6, yy, 9, h * 0.5, 0, 0, TAU); ctx.fillStyle = '#d9c9a4'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(ex + flip * 6, yy + h * 0.15, 4, h * 0.22, 0, 0, TAU); ctx.fillStyle = '#a58c62'; ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
  function cartouche(ctx, x, y, w, h, p) {
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = eo(p);
    ctx.fillStyle = 'rgba(248,238,214,0.55)'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.verm; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
    ctx.lineWidth = 1.2; ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
    ctx.restore();
    const s = eo(win(p, 0.5, 1)); for (const [bx, by] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) bezant(ctx, bx, by, 6, s);
  }
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  // =====================================================================================================
  // STILL + CLIP: "Of the Learning Machine", a folio with a historiated O (the Brazen Head reads its book)
  // =====================================================================================================
  const LATIN = [
    ['Machina discit ex exemplis multis. Primo videt mille milia imaginum, cattos et canes, et nomen cuiusque discit.', 0],
    ['Deinde novam imaginem conspicit et coniecturam facit:', 1], ['canis?', 2], ['Errat. Magister errorem ostendit, et machina rotulas suas paulum vertit. Iterum conatur:', 0], ['cattus!', 2],
    ['Sic per multas vices paulatim sapientior fit, donec fere semper recte respondeat.', 1], ['Plura exempla, meliores coniecturae.', 4],
  ];
  let WRAP = null;
  function wrapBody(ctx) {
    if (WRAP) return WRAP;
    ctx.save(); ctx.font = FONT.bl(34);
    const lines = [{ x: 488, w: 712, y: 352, items: [] }, { x: 488, w: 712, y: 396, items: [] }, { x: 488, w: 712, y: 440, items: [] }, { x: 128, w: 1072, y: 484, items: [] }, { x: 128, w: 1072, y: 528, items: [] }, { x: 128, w: 1072, y: 572, items: [] }];
    const sp = ctx.measureText(' ').width; let li = 0, cx = 0;
    for (const [txt, kind] of LATIN) {
      if (kind === 1 || kind === 4) { lines[li].items.push({ s: '¶', x: cx, w: 20, k: 3 }); cx += ctx.measureText('¶ ').width; }
      for (const word of txt.split(' ')) {
        const ww = ctx.measureText(word).width;
        if (cx + ww > lines[li].w) { li++; cx = 0; if (li >= lines.length) break; }
        lines[li].items.push({ s: word, x: cx, w: ww, k: kind === 2 || kind === 4 ? 2 : 0 }); cx += ww + sp;
      }
      if (li >= lines.length) break;
    }
    ctx.restore();
    lines.forEach((L) => { L.end = L.items.length ? L.items[L.items.length - 1].x + L.items[L.items.length - 1].w : 0; });
    return (WRAP = lines.slice(0, li + 1));
  }
  function historiatedO(ctx, x, y, s, t, T) {
    // gold leaf ground laid in squares, punched dots, lapis O with white filigree, a diapered counter with the Brazen Head
    const cx = x + s / 2, cy = y + s / 2, n = 4, q = s / n, laid = [];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const k = (i + j) / (2 * n - 2), sp = eo(win(t, T.gold + k * 0.5, T.gold + k * 0.5 + 0.18)); if (sp <= 0) continue;
      const qx = x + i * q, qy = y + j * q;
      const sq = [qx + q / 2 - q / 2 * sp - (i ? 0.6 : 0), qy + q / 2 - q / 2 * sp - (j ? 0.6 : 0), q * sp + 1.2, q * sp + 1.2];
      gilt(ctx, (c) => { c.beginPath(); c.rect(...sq); }, { line: false, sh: 0.4, dome: false });
      laid.push(sq);
    }
    if (laid.length) { // the whole ground is one raised, burnished panel: a broad sheen and a shaded lower-right edge
      ctx.save(); ctx.beginPath(); for (const r of laid) ctx.rect(...r); ctx.clip();
      ctx.globalCompositeOperation = 'screen';
      const g = ctx.createRadialGradient(x + s * 0.28, y + s * 0.24, 0, x + s * 0.4, y + s * 0.38, s * 0.85);
      g.addColorStop(0, 'rgba(255,238,178,0.45)'); g.addColorStop(0.5, 'rgba(255,236,170,0.1)'); g.addColorStop(1, 'rgba(255,236,170,0)');
      ctx.fillStyle = g; ctx.fillRect(x, y, s, s);
      ctx.globalCompositeOperation = 'multiply';
      const d = ctx.createLinearGradient(x, y, x + s, y + s);
      d.addColorStop(0.55, 'rgba(255,255,255,0)'); d.addColorStop(1, 'rgba(110,58,14,0.5)');
      ctx.fillStyle = d; ctx.fillRect(x, y, s, s);
      ctx.restore();
    }
    if (t > T.gold + 0.7) { ctx.save(); ctx.strokeStyle = 'rgba(40,22,8,0.9)'; ctx.lineWidth = 1.3; ctx.strokeRect(x, y, s, s); ctx.fillStyle = 'rgba(90,55,15,0.5)'; for (let k = 8; k < s - 4; k += 9) for (const [px, py] of [[x + k, y + 7], [x + k, y + s - 7], [x + 7, y + k], [x + s - 7, y + k]]) { ctx.beginPath(); ctx.arc(px, py, 1.3, 0, TAU); ctx.fill(); } ctx.restore(); }
    const oP = win(t, T.o, T.o + 0.6), Rx = s * 0.42, Ry = s * 0.44, rx = s * 0.29, ry = s * 0.335;
    const counter = (c) => { c.beginPath(); c.ellipse(cx + s * 0.01, cy + s * 0.005, rx, ry, 0, 0, TAU); };
    // counter: vermilion diaper with gold dots, the head inside
    const dP = win(t, T.o + 0.2, T.o + 0.8);
    if (dP > 0) {
      ctx.save(); counter(ctx); ctx.clip(); if (dP < 1) floodClip(ctx, cx, cy, ry * 1.3 * eo(dP), 5);
      paint(ctx, counter, C.verm, { edgeW: 6 });
      ctx.strokeStyle = 'rgba(120,20,8,0.7)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let k = -8; k <= 8; k++) { ctx.moveTo(cx + k * 22 - 200, cy - 200); ctx.lineTo(cx + k * 22 + 200, cy + 200); ctx.moveTo(cx + k * 22 + 200, cy - 200); ctx.lineTo(cx + k * 22 - 200, cy + 200); }
      ctx.stroke();
      for (let a = -8; a <= 8; a++) for (let b = -8; b <= 8; b++) { const px = cx + (a + b) * 11, py = cy + (b - a) * 11; if (Math.abs(px - cx) < rx && Math.abs(py - cy) < ry) bezant(ctx, px, py, 1.8); }
      ctx.restore();
    }
    ctx.save(); counter(ctx); ctx.clip();
    figure(ctx, 'head', cx, cy - s * 0.02, s * 0.27, win(t, T.head, T.head + 0.5), win(t, T.head + 0.35, T.head + 1.0), { look: Math.sin(t * 0.9) * 0.6 + 0.4, blink: win(t, 5.0, 5.06) - win(t, 5.12, 5.2), gear: t * 0.6 });
    if (t > T.head + 0.6) { // the open book on its lectern
      const bp = eo(win(t, T.head + 0.6, T.head + 1.0)), bx = cx, by = cy + s * 0.2;
      ctx.save(); ctx.globalAlpha = bp;
      for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + side * 30, by - 10, bx + side * 58, by - 4); ctx.lineTo(bx + side * 56, by + 26); ctx.quadraticCurveTo(bx + side * 30, by + 20, bx, by + 30); ctx.closePath(); ctx.fillStyle = '#f6efdd'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.lineWidth = 0.8; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(bx + side * 8, by + 5 + k * 5); ctx.lineTo(bx + side * 48, by + 3 + k * 5); ctx.strokeStyle = k === 0 ? C.verm : C.ink; ctx.stroke(); } }
      paint(ctx, (c) => { c.beginPath(); c.rect(bx - 50, by + 28, 100, 40); }, '#6b4426', { edgeW: 3, ink: true });
      ctx.restore();
    }
    ctx.restore();
    if (oP > 0) { // the O itself
      const ring = (c) => { c.beginPath(); c.ellipse(cx, cy, Rx, Ry, 0, 0, TAU); c.moveTo(cx + s * 0.01 + rx, cy + s * 0.005); c.ellipse(cx + s * 0.01, cy + s * 0.005, rx, ry, 0, TAU, 0, true); };
      ctx.save(); if (oP < 1) floodClip(ctx, cx - Rx, cy, s * 1.1 * eo(oP), 2);
      paint(ctx, ring, C.lapis, { edgeW: 8 });
      ctx.save(); ring(ctx); ctx.clip(); const g = ctx.createLinearGradient(cx - Rx, cy - Ry, cx + Rx, cy + Ry); g.addColorStop(0, 'rgba(120,150,230,0.35)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(5,10,40,0.4)'); ctx.fillStyle = g; ctx.fillRect(x, y, s, s); ctx.restore();
      ctx.restore();
      const fP = win(t, T.fil, T.fil + 0.6);
      if (fP > 0) { // white-lead tracery following the bow
        ctx.save(); ring(ctx); ctx.clip(); ctx.strokeStyle = 'rgba(250,247,238,0.9)'; ctx.fillStyle = 'rgba(250,247,238,0.9)'; ctx.lineWidth = 1.1;
        const mr = (k) => [lerp(rx, Rx, k), lerp(ry, Ry, k)];
        const [a1, b1] = mr(0.5); ctx.beginPath(); ctx.ellipse(cx + 1.5, cy, a1, b1, 0, -Math.PI / 2, -Math.PI / 2 + fP * TAU); ctx.stroke();
        for (let i = 0; i < 28 * fP; i++) { const a = -Math.PI / 2 + i / 28 * TAU, [ea, eb] = mr(0.5), px = cx + 1.5 + Math.cos(a) * ea, py = cy + Math.sin(a) * eb; ctx.beginPath(); ctx.arc(px + Math.cos(a) * 7, py + Math.sin(a) * 7, 3.5, a, a + 3.4); ctx.stroke(); ctx.beginPath(); ctx.arc(px - Math.cos(a) * 7, py - Math.sin(a) * 7, 1.4, 0, TAU); ctx.fill(); }
        ctx.restore();
      }
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ring(ctx); ctx.stroke(); ctx.restore();
    }
  }
  function lineFiller(ctx, x0, x1, y, p) {
    if (p <= 0) return; const xe = lerp(x0, x1, eo(p));
    paint(ctx, (c) => { c.beginPath(); c.rect(x0, y - 16, xe - x0, 12); }, C.lapis, { edgeW: 2, ink: true, lw: 0.9 });
    ctx.fillStyle = 'rgba(250,245,232,0.9)'; for (let x = x0 + 6; x < xe - 4; x += 10) { ctx.beginPath(); ctx.arc(x, y - 10, 1.4, 0, TAU); ctx.fill(); }
    if (p >= 1) bezant(ctx, x1 + 6, y - 10, 5);
  }
  function drawStill(ctx, t) {
    BASE = ctx.getTransform(); NIB = null;
    const sweep = win(t, 4.3, 5.4), amb = ((((t - 5.8) * 0.25 + 0.52) % 1.6) + 1.6) % 1.6 - 0.3;
    setGold(ctx, sweep > 0 && sweep < 1 ? lerp(-0.08, 1.08, sweep) : amb, sweep > 0 && sweep < 1 ? 1 : 0.55);
    pageBase(ctx, false, win(t, 0, 0.5), win(t, 0.7, 2.7), 21);
    historiatedO(ctx, 124, 104, 342, t, { gold: 0.12, o: 0.95, head: 1.3, fil: 3.7 });
    spray(ctx, 124, 104, win(t, 2.4, 3.1), 9, [-2.6, -2.0, -1.3]);
    spray(ctx, 466, 104, win(t, 2.6, 3.3), 10, [-1.0, -0.4, -1.6]);
    // title, rubricated
    write(ctx, 'f the Learning', 488, 202, FONT.blb(84), C.verm, win(t, 1.9, 2.6));
    write(ctx, 'Machine', 488, 292, FONT.blb(84), C.ink, win(t, 2.6, 3.0));
    // the text block, written line by line
    const L = wrapBody(ctx);
    L.forEach((ln, i) => {
      const a = 3.0 + i * 0.26, p = win(t, a, a + 0.26); if (p <= 0) return;
      ctx.save(); ctx.font = FONT.bl(34); const reach = ln.end * p;
      ctx.beginPath(); ctx.rect(ln.x - 30, ln.y - 40, reach + 34, 56); ctx.clip();
      for (const it of ln.items) {
        if (it.k === 3) { ctx.font = FONT.blb(34); ctx.fillStyle = (i % 2) ? C.lapis : C.verm; ctx.fillText('¶', ln.x + it.x, ln.y); ctx.font = FONT.bl(34); continue; }
        ctx.fillStyle = it.k === 2 ? C.verm : C.ink; ctx.fillText(it.s, ln.x + it.x, ln.y);
      }
      ctx.restore();
      if (p < 1) NIB = { x: ln.x + reach, y: ln.y - 9 };
    });
    const last = L[L.length - 1]; if (last) lineFiller(ctx, last.x + last.end + 16, Math.min(1196, last.x + last.end + 260), last.y, win(t, 4.6, 4.9));
    // bas-de-page: a snail confronts the hare-beast
    const snx = 880 + t * 2.2;
    figure(ctx, 'snail', snx, 680, 60, win(t, 2.2, 2.7), win(t, 2.6, 3.2), { wig: t * 3 });
    const pointing = ez(win(t, 4.3, 4.9)), arm = lerp(2.4, Math.atan2(650 - 619, snx - 50 - 1102), pointing);
    figure(ctx, 'hare', 1120, 680, 80, win(t, 2.4, 2.9), win(t, 2.8, 3.4), { arm: arm + Math.sin(t * 2) * 0.02, ear: Math.sin(t * 2.6), rod: pointing * Math.max(0, 1102 + Math.cos(arm) * 40 - (snx - 30)) });
    if (NIB) quill(ctx, NIB.x, NIB.y, t);
    H.vignette(ctx, 1280, 720, 0.28, '60,35,10');
  }

  // =====================================================================================================
  // EXPLAINER: three folios. Folio 1 the question and the bestiary of examples; the leaf turns; folio 2 the
  // wheel of Guess, Check, Adjust (the drollery points out the error, the scribe corrects it in red); the leaf
  // turns; folio 3 a gilded chart of rounds and the accuracy figure, gilt at 97%, and the rubric takeaway.
  // =====================================================================================================
  const EX = {
    D: 15,
    hookW: [0.55, 1.55], hookShrink: [2.0, 2.6],
    gridT0: 2.3, gridStep: 0.17, headR: [2.35, 3.15], model: [3.1, 3.45], arrow1: [3.7, 4.15], fly: [4.15, 5.95], count: [4.25, 5.9],
    turn1: [6.1, 6.9],
    cat2: 6.85, arrow2: [7.25, 7.5], guess: 7.45, segA: [7.4, 7.7], scroll: [7.75, 8.05], dog: [8.0, 8.25], segB: [8.25, 8.55], check: 8.45,
    point: [8.6, 8.85], strike: [8.85, 9.0], ring: [8.98, 9.3], segC: [9.25, 9.7], adjust: 9.4, drop: [9.25, 9.95], gears: [9.6, 10.15], cat: [9.75, 10.05], tick: [10.05, 10.2], segD: [10.0, 10.3],
    turn2: [10.75, 11.5],
    acc: 11.05, bar0: 11.45, barStep: 0.24, barRise: 0.26, flare: 12.91, circle: [13.0, 13.35], take: [13.35, 14.05], flourish: [14.05, 14.3],
  };
  const VALS = [61, 70, 79, 86, 92, 97];
  const HB = { s: 220, tx: 235, ty: 190, px: 100 };
  const HOOK = [{ s: 'ow does ', f: FONT.blb(100), c: C.ink }, { s: 'AI', f: FONT.fell(112), c: C.verm }, { s: ' learn?', f: FONT.blb(100), c: C.ink }];
  function writeRich(ctx, segs, x, y, prog, measureOnly) {
    let total = 0; for (const sg of segs) total += sg.s.length;
    let cx = x, before = 0;
    for (const sg of segs) {
      ctx.save(); ctx.font = sg.f; const w = ctx.measureText(sg.s).width; ctx.restore();
      if (!measureOnly) write(ctx, sg.s, cx, y, sg.f, sg.c, cl((prog * total - before) / sg.s.length));
      cx += w; before += sg.s.length;
    }
    return cx - x;
  }
  function hookBlock(ctx, t) {
    champ(ctx, 'H', 0, 0, HB.s, t, 0.0, 4);
    spray(ctx, 0, 0, win(t, 0.3, 0.95), 31, [-2.5, -1.9, -3.0]);
    spray(ctx, 0, HB.s, win(t, 0.35, 1.0), 32, [2.4, 1.9, 3.0]);
    writeRich(ctx, HOOK, HB.tx, HB.ty, win(t, EX.hookW[0], EX.hookW[1]));
  }
  function header(ctx, t) { ctx.save(); ctx.translate(120, 22); ctx.scale(0.4, 0.4); hookBlock(ctx, 99); ctx.restore(); }
  function glintAt(t, sweeps) {
    for (const [a, b, boost] of sweeps) { const u = win(t, a, b); if (u > 0 && u < 1) return [lerp(-0.1, 1.1, u), boost]; }
    return [((t * 0.2 + 0.3) % 1.7) - 0.35, 0.5];
  }
  // --- folio 1
  function folio1(ctx, t) {
    BASE = ctx.getTransform(); NIB = null;
    const [gp, gb] = glintAt(t, [[1.45, 2.25, 1.1], [5.95, 6.6, 0.8]]); setGold(ctx, gp, gb);
    pageBase(ctx, false, 1, 0.25 + 0.75 * win(t, 0, 2.2), 11);
    // the question, then it shrinks into the running title
    const bw = HB.tx + writeRich(ctx, HOOK, 0, 0, 1, true);
    const sh = ez(win(t, EX.hookShrink[0], EX.hookShrink[1]));
    ctx.save(); ctx.translate(lerp((1280 - bw) / 2, 120, sh), lerp(240, 22, sh)); const sc = lerp(1, 0.4, sh); ctx.scale(sc, sc); hookBlock(ctx, t); ctx.restore();
    // the bestiary
    const kinds = ['cat', 'dog', 'cat', 'dog', 'cat', 'dog'], GX = [188, 338, 488], GY = [242, 420];
    kinds.forEach((k, i) => {
      const cx = GX[i % 3], cy = GY[(i / 3) | 0], a = EX.gridT0 + i * EX.gridStep;
      roundel(ctx, cx, cy, 58, k, win(t, a, a + 0.55), { dy: 0.05 });
      write(ctx, k, cx, cy + 96, FONT.blb(36), C.verm, win(t, a + 0.4, a + 0.6), 'center', { noNib: true });
    });
    // the model
    const hx = 1010, hy = 298, hr = 140, flying = win(t, EX.fly[0], EX.fly[1]);
    roundel(ctx, hx, hy, hr, 'head', win(t, EX.headR[0], EX.headR[1]), { dy: -0.02, scale: 0.92, look: flying > 0 ? -1 : 0, gear: t * (flying > 0 && flying < 1 ? 3 : 0.4), blink: win(t, 3.9, 3.95) - win(t, 4.0, 4.06), mouth: 0 });
    write(ctx, 'the Model', hx, hy + hr + 56, FONT.blb(50), C.verm, win(t, EX.model[0], EX.model[1]), 'center');
    // arrow, examples flowing in
    const AP = [[560, 330], [650, 225], [770, 215], [852, 285]];
    penBez(ctx, AP, win(t, EX.arrow1[0], EX.arrow1[1]), C.verm, 3.2);
    for (let i = 0; i < 9; i++) {
      const u = (t - EX.fly[0] - i * 0.18) / 0.62; if (u <= 0 || u >= 1.25) continue;
      const v = cl(u), q = u <= 1 ? bez(AP, ez(v)) : [lerp(852, hx - 30, (u - 1) * 4), lerp(285, hy, (u - 1) * 4)], s = u <= 1 ? 1 : cl(1 - (u - 1) * 4);
      ctx.save(); ctx.globalAlpha = cl(s * 1.5); roundel(ctx, q[0], q[1] - 22, 25 * (0.6 + 0.4 * s), i % 2 ? 'dog' : 'cat', 1); ctx.restore();
    }
    // the tally of examples
    const cp = win(t, EX.count[0], EX.count[1]);
    cartouche(ctx, 560, 548, 560, 96, win(t, EX.count[0] - 0.25, EX.count[0]));
    if (cp > 0) {
      const n = cp >= 1 ? 1e6 : Math.round((Math.pow(10, 4 * ez(cp)) - 1) / (1e4 - 1) * 1e6 / 7) * 7;
      ctx.save(); ctx.font = FONT.fell(80); ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ctx.fillText(fmt(Math.min(1e6, n)), 900, 622); ctx.restore();
      write(ctx, 'examples', 916, 618, FONT.blb(42), C.verm, 1, 'left', { noNib: true });
    }
    if (NIB) quill(ctx, NIB.x, NIB.y, t);
  }
  // --- folio 2
  const F2 = { hx: 620, hy: 392, hr: 122, R: 216 };
  function f2label(ctx, word, ax, t, t0) {
    const x = F2.hx + Math.cos(ax) * F2.R, y = F2.hy + Math.sin(ax) * F2.R, s = 56;
    ctx.save(); ctx.font = FONT.blb(46); const w = s + 6 + ctx.measureText(word.slice(1)).width; ctx.restore();
    const x0 = x - w / 2;
        champ(ctx, word[0], x0, y - s / 2 - 4, s, t, t0, word.length);
    write(ctx, word.slice(1), x0 + s + 6, y + 18, FONT.blb(46), C.ink, win(t, t0 + 0.18, t0 + 0.42));
  }
  function folio2(ctx, t) {
    BASE = ctx.getTransform(); NIB = null;
    const [gp, gb] = glintAt(t, [[9.6, 10.3, 0.9]]); setGold(ctx, gp, gb);
    pageBase(ctx, true, 1, 1, 12);
    header(ctx, t);
    const { hx, hy, hr, R } = F2, D2 = Math.PI / 180;
    // compass-ruled circle, pricked at its centre, before the penwork goes over it
    ctx.save(); ctx.strokeStyle = 'rgba(140,100,66,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(hx, hy, R, 0, TAU); ctx.stroke(); ctx.restore();
    const err = win(t, EX.strike[0], EX.strike[1]) > 0;
    const adj = win(t, EX.gears[0], EX.gears[1]);
    roundel(ctx, hx, hy, hr, 'head', 1, { dy: -0.02, scale: 0.92, mouth: win(t, 7.85, 7.95) - win(t, 8.3, 8.45), look: t > EX.arrow2[0] && t < 7.9 ? -1 : t > EX.point[0] && t < 9.6 ? 0.9 : 0, gear: 0.3 + ez(adj) * 2.4, blink: win(t, 10.35, 10.4) - win(t, 10.45, 10.5) });
    // the new picture
    roundel(ctx, 200, 236, 80, 'cat', win(t, EX.cat2, EX.cat2 + 0.45), { dy: 0.05 });
    penBez(ctx, [[288, 262], [370, 250], [440, 290], [500, 336]], win(t, EX.arrow2[0], EX.arrow2[1]), C.ink, 2.6);
    // the wheel
    penArc(ctx, hx, hy, R, 174 * D2, 243 * D2, win(t, EX.segA[0], EX.segA[1]), C.ink, 3);
    penArc(ctx, hx, hy, R, -63 * D2, 8 * D2, win(t, EX.segB[0], EX.segB[1]), C.ink, 3);
    penArc(ctx, hx, hy, R, 52 * D2, 126 * D2, win(t, EX.segC[0], EX.segC[1]), C.verm, 3.4);
    f2label(ctx, 'Guess', -Math.PI / 2, t, EX.guess);
    f2label(ctx, 'Check', 30 * D2, t, EX.check);
    f2label(ctx, 'Adjust', 150 * D2, t, EX.adjust);
    // the guess, on a banderole from the head's mouth
    const sx = 862, sy = 222, sw = 230, shh = 74, scP = win(t, EX.scroll[0], EX.scroll[1]);
    if (scP > 0) { ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3; const r0x = hx + Math.cos(-0.5) * hr, r0y = hy + Math.sin(-0.5) * hr; ctx.beginPath(); ctx.moveTo(r0x, r0y); ctx.quadraticCurveTo(800, 300, lerp(r0x, sx + 14, eo(scP)), lerp(r0y, sy + shh - 4, eo(scP))); ctx.stroke(); ctx.beginPath(); ctx.moveTo(r0x, r0y + 7); ctx.quadraticCurveTo(806, 312, lerp(r0x, sx + 14, eo(scP)), lerp(r0y + 7, sy + shh + 6, eo(scP))); ctx.stroke(); ctx.restore(); }
    scroll(ctx, sx, sy, sw, shh, scP);
    write(ctx, 'dog?', sx + sw / 2, sy + 54, FONT.blb(58), C.ink, win(t, EX.dog[0], EX.dog[1]), 'center');
    // the scribe strikes it through in red, rings it, and writes the right word above
    const stP = win(t, EX.strike[0], EX.strike[1]);
    if (stP > 0) { ctx.save(); ctx.strokeStyle = C.verm; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx + 60, sy + 40); ctx.lineTo(lerp(sx + 60, sx + sw - 56, stP), sy + 40 - 6 * stP); ctx.stroke(); ctx.restore(); }
    const rgP = win(t, EX.ring[0], EX.ring[1]);
    if (rgP > 0) { ctx.save(); ctx.strokeStyle = C.verm; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(sx + sw / 2, sy + shh / 2 + 2, sw * 0.66, shh * 0.95, -0.05, -2.6, -2.6 + rgP * 6.9); ctx.stroke(); ctx.restore(); }
    write(ctx, 'cat', sx + sw / 2 - 12, sy - 22, FONT.blb(58), C.verm, win(t, EX.cat[0], EX.cat[1]), 'center');
    const tk = win(t, EX.tick[0], EX.tick[1]);
    if (tk > 0) { ctx.save(); ctx.strokeStyle = C.mal; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); const p1 = [sx + sw / 2 + 50, sy - 44], p2 = [sx + sw / 2 + 62, sy - 30], p3 = [sx + sw / 2 + 92, sy - 74]; ctx.moveTo(...p1); if (tk < 0.4) ctx.lineTo(lerp(p1[0], p2[0], tk / 0.4), lerp(p1[1], p2[1], tk / 0.4)); else { ctx.lineTo(...p2); ctx.lineTo(lerp(p2[0], p3[0], (tk - 0.4) / 0.6), lerp(p2[1], p3[1], (tk - 0.4) / 0.6)); } ctx.stroke(); ctx.restore(); }
    // the error runs back round the wheel to the clockwork
    const dp = win(t, EX.drop[0], EX.drop[1]);
    if (dp > 0 && dp < 1) {
      for (let k = 0; k < 7; k++) {
        const u = dp - k * 0.025; if (u < 0) continue;
        const pos = u < 0.75 ? (() => { const a = (40 + 110 * (u / 0.75)) * D2; return [hx + Math.cos(a) * R, hy + Math.sin(a) * R]; })() : (() => { const a = 150 * D2, v = (u - 0.75) / 0.25; return [hx + Math.cos(a) * lerp(R, hr * 0.5, v), hy + Math.sin(a) * lerp(R, hr * 0.5, v)]; })();
        ctx.fillStyle = H.rgba(C.verm, 1 - k * 0.13); ctx.beginPath(); ctx.arc(pos[0], pos[1], 9 - k, 0, TAU); ctx.fill();
        if (!k) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke(); }
      }
    }
    // the drollery in the margin, pointing out the error
    const pt = ez(win(t, EX.point[0], EX.point[1])) - ez(win(t, 10.1, 10.4)) * 0.5;
    const tgt = Math.atan2(sy + shh + 4 - (648 - 0.76 * 150), sx + sw - 70 - (1120 - 0.24 * 150)) + TAU, armA = lerp(2.6, tgt, pt), hx2 = 1120 - 0.24 * 150 + Math.cos(armA) * 75, hy2 = 648 - 0.76 * 150 + Math.sin(armA) * 75;
    const rodL = Math.max(0, Math.hypot(sx + sw - 70 - hx2, sy + shh + 4 - hy2) - 18) * eo(win(t, EX.point[0] + 0.1, EX.point[1] + 0.05)) * (1 - win(t, 10.1, 10.4));
    figure(ctx, 'hare', 1120, 648, 150, 1, 1, { arm: armA + Math.sin(t * 7) * 0.02 * pt, ear: Math.sin(t * 3), rod: rodL });
    if (NIB) quill(ctx, NIB.x, NIB.y, t);
  }
  // --- folio 3
  function folio3(ctx, t) {
    BASE = ctx.getTransform(); NIB = null;
    const [gp, gb] = glintAt(t, [[EX.flare, EX.flare + 0.6, 1.4], [EX.bar0, EX.bar0 + 1.4, 0.5]]); setGold(ctx, gp, gb);
    pageBase(ctx, false, 1, 1, 13);
    header(ctx, t);
    // the heading: a new champ initial blooms
    champ(ctx, 'A', 780, 118, 104, t, EX.acc, 8);
    spray(ctx, 780, 118, win(t, EX.acc + 0.3, EX.acc + 0.9), 33, [-2.4, -1.8, -3.0]);
    write(ctx, 'ccuracy', 892, 206, FONT.blb(76), C.ink, win(t, EX.acc + 0.25, EX.acc + 0.7));
    // the ruled chart
    const fx = 120, fy = 150, fw = 590, fh = 316, base = fy + fh - 12;
    ctx.save(); ctx.strokeStyle = C.verm; ctx.lineWidth = 3; ctx.strokeRect(fx, fy, fw, fh); ctx.lineWidth = 1.1; ctx.strokeRect(fx + 6, fy + 6, fw - 12, fh - 12);
    ctx.strokeStyle = 'rgba(140,100,66,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 4; k++) { const y = base - k * 70; ctx.moveTo(fx + 8, y); ctx.lineTo(fx + fw - 8, y); } ctx.stroke(); ctx.restore();
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI'];
    let shown = 0, tops = [];
    VALS.forEach((v, i) => {
      const bx = fx + 52 + i * 92, a = EX.bar0 + i * EX.barStep, g = eo(win(t, a, a + EX.barRise)), hgt = v / 100 * 280 * g;
      tops.push([bx + 25, base - v / 100 * 280]);
      write(ctx, romans[i], bx + 25, base + 44, FONT.blb(36), C.verm, 1, 'center', { noNib: true });
      if (g <= 0) return;
      gilt(ctx, (c) => { c.beginPath(); c.rect(bx, base - hgt, 50, hgt); }, { lw: 1.1 });
      paint(ctx, (c) => { c.beginPath(); c.rect(bx + 8, base - hgt + 8, 34, Math.max(0, hgt - 16)); }, i % 2 ? C.rose : C.lapis, { edgeW: 2 });
      ctx.fillStyle = 'rgba(250,245,232,0.85)'; for (let y = base - hgt + 18; y < base - 12; y += 16) { ctx.beginPath(); ctx.arc(bx + 25, y, 1.6, 0, TAU); ctx.fill(); }
      bezant(ctx, bx + 25, base - hgt - 8, 7, g);
      shown = i ? lerp(VALS[i - 1], v, g) : v;
    });
    write(ctx, 'rounds of training', fx + fw / 2, base + 86, FONT.felli(36), C.ink, win(t, EX.bar0, EX.bar0 + 0.5), 'center', { noNib: true });
    // the line of progress over the tops
    const lp = win(t, EX.bar0 + 1.25, EX.bar0 + 1.6);
    if (lp > 0) { ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.beginPath(); const n = (tops.length - 1) * lp; tops.forEach((q, i) => { if (i > Math.ceil(n)) return; const qq = i <= n ? [q[0], q[1] - 24] : [lerp(tops[i - 1][0], q[0], n - i + 1), lerp(tops[i - 1][1], q[1], n - i + 1) - 24]; i ? ctx.lineTo(qq[0], qq[1]) : ctx.moveTo(qq[0], qq[1]); }); ctx.stroke(); ctx.restore(); if (lp >= 1) { const q = tops[5], q0 = tops[4]; arrowHead(ctx, q[0] + 6, q[1] - 26, Math.atan2(q[1] - q0[1], q[0] - q0[0]), 16, C.ink); } }
    // the figure, which becomes gold at 97
    const fl = win(t, EX.flare, EX.flare + 0.5), nx = 1000, ny = 448;
    if (fl > 0) { // rays of glory
      ctx.save(); ctx.translate(nx, ny - 60);
      for (let k = 0; k < 24; k++) { const a = k / 24 * TAU + 0.07, r0 = 150, r1 = r0 + 70 * eo(fl) * (k % 2 ? 0.6 : 1);
        if (k % 2) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); for (let s = 0; s <= 10; s++) { const rr = lerp(r0, r1, s / 10), w = Math.sin(s * 1.6) * 3; ctx.lineTo(Math.cos(a) * rr - Math.sin(a) * w, Math.sin(a) * rr * 0.72 + Math.cos(a) * w); } ctx.stroke(); }
        else gilt(ctx, (c) => { c.beginPath(); c.moveTo(Math.cos(a - 0.05) * r0, Math.sin(a - 0.05) * r0 * 0.72); c.lineTo(Math.cos(a) * r1, Math.sin(a) * r1 * 0.72); c.lineTo(Math.cos(a + 0.05) * r0, Math.sin(a + 0.05) * r0 * 0.72); c.closePath(); }, { tex: false, lw: 0.8 }); }
      ctx.restore();
    }
    if (t > EX.bar0) {
      const txt = Math.round(shown) + '%';
      ctx.save(); ctx.font = FONT.fell(184); ctx.textAlign = 'center';
      if (fl > 0) { write(ctx, txt, nx, ny, FONT.fell(184), C.ink, 1, 'center', { gold: true, lw: 2 }); ctx.globalAlpha = 1 - eo(fl); ctx.fillStyle = C.ink; ctx.fillText(txt, nx, ny); }
      else { ctx.fillStyle = C.ink; ctx.fillText(txt, nx, ny); ctx.globalAlpha = 0.2; ctx.fillStyle = '#000'; ctx.fillText(txt, nx + 0.8, ny + 0.6); }
      ctx.restore();
    }
    const cP = win(t, EX.circle[0], EX.circle[1]);
    if (cP > 0) { ctx.save(); ctx.strokeStyle = C.verm; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(nx, ny - 60, 190, 112, -0.04, -2.2, -2.2 + cP * 6.75); ctx.stroke(); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(nx + 2, ny - 58, 202, 122, -0.03, -2.0, -2.0 + cP * 6.6); ctx.stroke(); ctx.restore(); }
    // burst of light off the burnished gold
    const bl = win(t, EX.flare, EX.flare + 0.12) * (1 - win(t, EX.flare + 0.12, EX.flare + 0.7));
    if (bl > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(nx, ny - 60, 10, nx, ny - 60, 320); g.addColorStop(0, `rgba(255,220,130,${0.5 * bl})`); g.addColorStop(1, 'rgba(255,200,100,0)'); ctx.fillStyle = g; ctx.fillRect(nx - 340, ny - 400, 680, 680); ctx.restore(); }
    // the takeaway, rubricated
    const tw = write(ctx, 'More examples → better guesses', 668, 626, FONT.blb(58), C.verm, win(t, EX.take[0], EX.take[1]), 'center');
    if (t > EX.take[0]) { ctx.save(); ctx.font = FONT.blb(62); ctx.fillStyle = C.lapis; ctx.textAlign = 'right'; ctx.globalAlpha = eo(win(t, EX.take[0], EX.take[0] + 0.15)); ctx.fillText('¶', 668 - tw / 2 - 12, 626); ctx.restore(); }
    const flo = win(t, EX.flourish[0], EX.flourish[1]);
    if (flo > 0) { ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath(); const x0 = 668 - tw / 2, x1 = x0 + tw * eo(flo); for (let x = x0; x <= x1; x += 4) { const y = 646 + Math.sin((x - x0) * 0.05) * 3; x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ctx.restore(); if (flo >= 1) bezant(ctx, 668 + tw / 2 + 14, 646, 6); }
    if (NIB) quill(ctx, NIB.x, NIB.y, t);
  }
  // --- the leaf turns: a tilted fold sweeps right to left; the lifted part flips over, showing its verso
  let LA = null, LB = null;
  function turnPage(ctx, drawOver, drawUnder, t, p) {
    if (!LA) { LA = H.layer(1280, 720); LB = H.layer(1280, 720); }
    const a = LA.getContext('2d'), b = LB.getContext('2d');
    a.setTransform(1, 0, 0, 1, 0, 0); b.setTransform(1, 0, 0, 1, 0, 0);
    drawOver(a, t); drawUnder(b, t);
    const th = 0.32, nx = Math.cos(th), ny = Math.sin(th), u = H.ease.inOut(p);
    const fxp = lerp(1280 + 380, -420, u), fyp = 360; // a point on the fold
    const half = (c, side) => { // clip to one side of the fold (side 1: right / lifted)
      const L = 3000, tx = -ny, ty = nx; c.beginPath();
      c.moveTo(fxp + tx * L, fyp + ty * L); c.lineTo(fxp - tx * L, fyp - ty * L); c.lineTo(fxp - tx * L + side * nx * L, fyp - ty * L + side * ny * L); c.lineTo(fxp + tx * L + side * nx * L, fyp + ty * L + side * ny * L); c.closePath(); c.clip();
    };
    ctx.save(); half(ctx, -1); ctx.drawImage(LA, 0, 0); ctx.restore();
    ctx.save(); half(ctx, 1); ctx.drawImage(LB, 0, 0);
    const sg = ctx.createLinearGradient(fxp, fyp, fxp + nx * 140, fyp + ny * 140); sg.addColorStop(0, 'rgba(50,28,10,0.45)'); sg.addColorStop(1, 'rgba(50,28,10,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, 1280, 720);
    ctx.restore();
    // the flap: page reflected about the fold
    const d = fxp * nx + fyp * ny, m = [1 - 2 * nx * nx, -2 * nx * ny, -2 * nx * ny, 1 - 2 * ny * ny, 2 * d * nx, 2 * d * ny];
    ctx.save(); half(ctx, -1);
    ctx.save(); ctx.transform(...m);
    ctx.shadowColor = 'rgba(40,20,5,0.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    ctx.beginPath(); ctx.rect(0, 0, 1280, 720); ctx.fillStyle = 'rgb(226,208,170)'; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.clip(); ctx.globalAlpha = 0.9; ctx.drawImage(vellum(), 0, 0); ctx.globalAlpha = 0.1; ctx.drawImage(LA, 0, 0); ctx.globalAlpha = 1;
    ctx.restore();
    const hg = ctx.createLinearGradient(fxp, fyp, fxp - nx * 260, fyp - ny * 260); hg.addColorStop(0, 'rgba(255,248,225,0.35)'); hg.addColorStop(0.15, 'rgba(255,248,225,0.12)'); hg.addColorStop(1, 'rgba(60,35,10,0.18)');
    ctx.fillStyle = hg; ctx.save(); ctx.transform(...m); ctx.beginPath(); ctx.rect(0, 0, 1280, 720); ctx.restore(); ctx.fill();
    ctx.restore();
  }
  function explainer(ctx, W, H_, t) {
    const [a1, b1] = EX.turn1, [a2, b2] = EX.turn2;
    if (t < a1) folio1(ctx, t);
    else if (t < b1) turnPage(ctx, folio1, folio2, t, win(t, a1, b1));
    else if (t < a2) folio2(ctx, t);
    else if (t < b2) turnPage(ctx, folio2, folio3, t, win(t, a2, b2));
    else folio3(ctx, t);
    H.vignette(ctx, W, H_, 0.26, '60,35,10');
  }


  // =====================================================================================================
  // SOUND: a quiet scriptorium. Quill on vellum while the scribe writes, soft burnishing for gold, the leaf
  // turning between folios, a low chant-like drone, and a warm church bell for 97% and the takeaway.
  // All times come from EX (the explainer's timeline).
  // =====================================================================================================
  function explainerSound(k) {
    const quill = (a, b, gain = 1, minor = true, pan = 0) => { // goose quill on vellum: a dry scratch with a soft body
      const d = Math.max(0.05, b - a);
      k.noise(a, { dur: 0.02, filter: 'bandpass', f: 2100, q: 1.2, gain: 0.12 * gain, a: 0.002, pan, minor }); // nib touches down
      k.play('stroke', a, { material: 'pen', dur: d, gain: 2.1 * gain, pan, minor });
      k.noise(a, { dur: d + 0.03, color: 'pink', filter: 'bandpass', f: 1500, q: 0.8, gain: 0.05 * gain, a: Math.min(0.02, d * 0.3), pan, minor });
    };
    const writeS = (str, a, b, gain = 1, minor = true, pan = 0) => { // one quill stroke per word, timed like write()
      const n = str.length, re = /\S+/g; let m;
      while ((m = re.exec(str))) quill(a + (b - a) * m.index / n, a + (b - a) * (m.index + m[0].length) / n, gain, minor, pan);
    };
    const shimmer = (t, dur, gain = 1, minor = false, pan = 0) => { // agate burnisher on gold: a soft rub with a low glow
      k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 650], [dur, 1300]], q: 1.6, gain: 0.09 * gain, a: dur * 0.4, verb: 0.3, pan, minor });
      k.tone(t, { f: 'A4', dur: dur + 0.7, gain: 0.022 * gain, a: dur * 0.5, verb: 0.4, pan, minor });
      k.tone(t + 0.05, { f: 'E5', dur: dur + 0.5, gain: 0.014 * gain, a: dur * 0.5, verb: 0.4, pan, minor });
    };
    const dab = (t, gain = 1, pan = 0) => k.play('stroke', t, { material: 'brush', dur: 0.16, gain: 1.3 * gain, pan, minor: true }); // pigment laid in
    const bell = (t, root, gain = 1) => { // church bell partials: hum, prime, tierce, quint, nominal
      const f = k.hz(root);
      [[0.5, 0.11, 3.2], [1, 0.15, 2.6], [1.2, 0.07, 1.8], [1.5, 0.05, 1.5], [2, 0.08, 1.4]].forEach(([r, g, d]) => k.tone(t, { f: f * r, dur: d, gain: g * gain, a: 0.004, verb: 0.45 }));
      k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1400, q: 1.5, gain: 0.1 * gain });
    };
    const turn = (a, b) => { // the leaf lifts, sweeps over and settles
      const d = b - a;
      k.play('paper', a, { dur: d * 0.9, gain: 0.6 });
      k.noise(a, { dur: d, color: 'pink', filter: 'lowpass', f: [[0, 350], [d * 0.6, 1100], [d, 450]], gain: 0.14, a: d * 0.5 });
      k.play('slap', b - 0.06, { gain: 0.22 });
    };

    k.bed('room', 0, EX.D, { gain: 0.45 });
    k.music('pad', 0, EX.D, { bpm: 48, gain: 0.3, chords: [['D3', 'A3', 'D4', 'F4'], ['C3', 'G3', 'C4', 'E4'], ['D3', 'A3', 'D4', 'A4']] });

    // ---- folio 1: the question
    dab(0.0, 1.1); shimmer(0.2, 0.4, 0.9);                     // H: ground floods, gold letter laid
    writeS(HOOK.map((x) => x.s).join(''), EX.hookW[0], EX.hookW[1], 1.5, false);
    shimmer(1.6, 0.5, 1.0);                                     // the burnish glint crosses the H
    k.noise(EX.hookShrink[0], { dur: 0.6, color: 'brown', filter: 'lowpass', f: 480, gain: 0.12, a: 0.25, minor: true }); // slides into the running title
    // the bestiary: each roundel is laid in, its label written
    for (let i = 0; i < 6; i++) { const a = EX.gridT0 + i * EX.gridStep; dab(a + 0.05, 0.9, -0.4 + (i % 3) * 0.1); writeS(i % 2 ? 'dog' : 'cat', a + 0.4, a + 0.6, 0.8, true, -0.3); }
    shimmer(EX.headR[0], 0.4, 0.8, true, 0.3);                  // gold ring round the Brazen Head
    writeS('the Model', EX.model[0], EX.model[1], 1.0, false, 0.3);
    quill(EX.arrow1[0], EX.arrow1[1], 1.1);
    quill(EX.count[0] - 0.25, EX.count[0], 0.8);                // cartouche ruled
    for (let i = 0; i < 9; i++) k.play('tock', EX.fly[0] + i * 0.18 + 0.62, { f: 420 + (i % 3) * 40, gain: 0.3, pan: 0.35, minor: true }); // examples drop into the head
    for (let f = Math.ceil(EX.count[0] * 10); f < EX.count[1] * 10 - 1; f++) k.play('tick', f / 10, { f: 2500, gain: 1.2, pan: 0.1, minor: true });
    k.play('tock', EX.count[1], { f: 330, gain: 0.45 }); k.play('thud', EX.count[1], { f: 110, gain: 0.2 }); // 1,000,000 lands

    turn(...EX.turn1);

    // ---- folio 2: guess, check, adjust
    dab(EX.cat2 + 0.05, 1.0, -0.5); shimmer(EX.cat2, 0.3, 0.6, true, -0.5);
    quill(EX.arrow2[0], EX.arrow2[1], 0.9, true, -0.3);
    quill(EX.segA[0], EX.segA[1], 0.9, true, -0.2);
    shimmer(EX.guess + 0.15, 0.3, 0.6, true); writeS('uess', EX.guess + 0.18, EX.guess + 0.42, 0.9);
    k.play('paper', EX.scroll[0], { dur: 0.3, gain: 0.45 });   // the banderole unrolls
    k.play('buzz', EX.dog[0] - 0.08, { f: 98, dur: 0.38, gain: 0.45 }); // the brazen head speaks
    writeS('dog?', EX.dog[0], EX.dog[1], 1.1, false, 0.4);
    quill(EX.segB[0], EX.segB[1], 0.9, true, 0.2);
    shimmer(EX.check + 0.15, 0.3, 0.6, true, 0.3); writeS('heck', EX.check + 0.18, EX.check + 0.42, 0.9, true, 0.3);
    k.noise(EX.point[0], { dur: 0.3, color: 'pink', filter: 'bandpass', f: [[0, 380], [0.3, 900]], q: 1, gain: 0.14, a: 0.12, pan: 0.6 }); // the beast swings its staff up
    k.play('tock', EX.point[1] + 0.03, { f: 520, gain: 0.4, pan: 0.5 });
    // the wrong guess: a hard red slash, a low dull "no"
    k.play('stroke', EX.strike[0], { material: 'pen', dur: EX.strike[1] - EX.strike[0], gain: 2.4, pan: 0.4 });
    k.play('thud', EX.strike[0], { f: 120, gain: 0.38 });
    k.tone(EX.strike[0], { f: 'D3', dur: 0.45, gain: 0.12, a: 0.01, filter: 'lowpass', f2: 900, type: 'triangle' });
    k.tone(EX.strike[0], { f: 'G#3', dur: 0.45, gain: 0.1, a: 0.01, filter: 'lowpass', f2: 900, type: 'triangle' });
    quill(EX.ring[0], EX.ring[1], 1.4, false, 0.4);             // ringed in red
    // the error runs back round the wheel to the clockwork
    quill(EX.segC[0], EX.segC[1], 1.0, true, 0);
    k.tone(EX.drop[0], { f: [[0, 330], [EX.drop[1] - EX.drop[0], 140]], type: 'triangle', dur: EX.drop[1] - EX.drop[0], gain: 0.07, a: 0.1, filter: 'lowpass', f2: 800 });
    shimmer(EX.adjust + 0.15, 0.3, 0.6, true, -0.3); writeS('djust', EX.adjust + 0.18, EX.adjust + 0.42, 0.9, true, -0.3);
    for (let i = 0, x = EX.gears[0]; x < EX.gears[1]; i++, x += 0.065 + i * 0.004) { k.play('click', x, { f: 900, gain: 0.45, minor: true }); if (i % 3 === 0) k.play('tock', x, { f: 260, gain: 0.25, minor: true }); }
    writeS('cat', EX.cat[0], EX.cat[1], 1.3, false, 0.4);       // the correction, in red
    quill(EX.tick[0], EX.tick[1], 1.2, false, 0.5);
    k.play('success', EX.tick[1], { f: 'D5', gain: 0.4, pan: 0.3 });

    turn(...EX.turn2);

    // ---- folio 3: the gilded chart
    shimmer(EX.acc + 0.15, 0.35, 0.8, false, 0.4); writeS('ccuracy', EX.acc + 0.25, EX.acc + 0.7, 0.9, true, 0.4);
    writeS('rounds of training', EX.bar0, EX.bar0 + 0.5, 0.6, true, -0.4);
    for (let i = 0; i < 6; i++) { const a = EX.bar0 + i * EX.barStep; shimmer(a, EX.barRise, 0.45, true, -0.4 + i * 0.08); k.play('tock', a + EX.barRise, { f: 300 + i * 45, gain: 0.35, pan: -0.4 + i * 0.08, minor: true }); }
    { let last = -1; for (let f = Math.ceil(EX.bar0 * 10); f < EX.flare * 10 - 1; f++) { // the figure counts up (throttled)
      const t = f / 10, i = Math.min(5, Math.floor((t - EX.bar0) / EX.barStep)), g = cl((t - EX.bar0 - i * EX.barStep) / EX.barRise), v = Math.round(i ? lerp(VALS[i - 1], VALS[i], g) : VALS[0]);
      if (v !== last) { k.play('tick', t, { f: 2100 + v * 4, gain: 1.2, pan: 0.4, minor: true }); last = v; } } }
    quill(EX.bar0 + 1.25, EX.bar0 + 1.6, 0.8, true, -0.3);
    // 97%: the gold flares, the biggest moment
    k.play('thud', EX.flare, { f: 85, gain: 0.75, pan: 0.3 });
    bell(EX.flare, 'D4', 1.35);
    shimmer(EX.flare, 0.6, 1.6, false, 0.3);
    quill(EX.circle[0], EX.circle[1], 1.3, false, 0.35);
    // the takeaway, rubricated, then the closing bell
    writeS('More examples → better guesses', EX.take[0], EX.take[1], 1.4, false);
    bell(EX.take[1] + 0.02, 'G3', 0.85);
    quill(EX.flourish[0], EX.flourish[1], 0.9, true);
  }

  registerStyle({
    id: 'illuminated',
    name: 'Illuminated Manuscript',
    category: 'Illustration',
    description: 'A Book of Hours folio: mottled vellum with ruling and pricking, textura in iron-gall ink with vermilion rubrics, a historiated initial on raised burnished gold, lapis, rose and malachite with white-lead filigree, ivy-leaf rinceaux with gold bezants, and drolleries in the margins.',
    motion: 'The scribe works the page: gold leaf is laid square by square and burnished to a travelling glint, pigments flood into the pen outlines, and the quill writes the text line by line.',
    fonts: ['400 31px "Grenze Gotisch"', '700 84px "Grenze Gotisch"', '400 30px "UnifrakturMaguntia"', '400 80px "IM Fell English"', 'italic 400 32px "IM Fell English"'],
    frameT: 5.8,
    duration: 6,
    readsPixels: false,
    draw(ctx, W, H_, t) { drawStill(ctx, t); },
    explainerDuration: EX.D,
    explainerNote: 'Three folios of a manuscript, the leaf turning between them: champ initials bloom in gold, the examples are bestiary roundels flowing along a penwork arrow into a Brazen Head, the learning loop is a wheel of Guess, Check and Adjust where a marginal beast points out the error and the scribe corrects it in red, and accuracy rises as gilded bars until 97% turns to burnished gold.',
    explainer,
    explainerSound,
  });
}
