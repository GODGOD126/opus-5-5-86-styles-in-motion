{
  const CREAM = '#efe3c4';

  // metallic foil fill for an alpha mask
  const foil = (W, HH, mask, seed, t) => {
    const G = H.layer(W, HH), g = G.getContext('2d');
    const lin = g.createLinearGradient(0, 0, W * 0.55, HH * 1.3);
    const stops = ['#6b4a16', '#c99a3e', '#f6e2a0', '#fff6d2', '#d6a948', '#7d5719', '#b8863a', '#f3d98c', '#fff3c8', '#c08f36', '#6e4c16'];
    stops.forEach((s, i) => lin.addColorStop(i / (stops.length - 1), s));
    g.fillStyle = lin; g.fillRect(0, 0, W, HH);
    // moving sheen band
    const sx = H.lerp(-400, W + 400, H.ease.inOut(H.clamp((t - 3.1) / 1.3, 0, 1))); // one slow glint across the finished foil
    const sh = g.createLinearGradient(sx - 220, 0, sx + 220, HH * 0.4);
    sh.addColorStop(0, 'rgba(255,248,220,0)'); sh.addColorStop(0.5, 'rgba(255,248,220,0.45)'); sh.addColorStop(1, 'rgba(255,248,220,0)');
    g.fillStyle = sh; g.fillRect(0, 0, W, HH);
    // brushed micro-texture
    const img = g.getImageData(0, 0, W, HH), d = img.data, r = H.rng(seed), nz = H.makeNoise(seed);
    const rowN = new Float32Array(HH); for (let y = 0; y < HH; y++) rowN[y] = nz.n2(0.5, y * 0.35) * 0.06;
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      const y = (p / W) | 0; const s = 1 + rowN[y] + (r() - 0.5) * 0.09;
      d[i] *= s; d[i + 1] *= s; d[i + 2] *= s;
    }
    g.putImageData(img, 0, 0);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(mask, 0, 0);
    return G;
  };

  // ===================== EXPLAINER: "How does AI learn?" =====================
  // A gilded picture-palace sequence: scenes change behind closing/opening gold elevator doors, arrows are
  // stepped deco chevron arrows, numbers roll on an odometer, the key result gets a beacon glint.
  let FOILBASE = null;
  const exGild = (ctx, W, HH, mask, sheen) => {
    if (!FOILBASE) { FOILBASE = foil(W, HH, (() => { const m = H.layer(W, HH); m.getContext('2d').fillRect(0, 0, W, HH); return m; })(), 6, -99); }
    const G = H.layer(W, HH), g = G.getContext('2d');
    g.drawImage(FOILBASE, 0, 0);
    if (sheen > -1 && sheen < 2) { const sx = H.lerp(-400, W + 400, sheen), sh = g.createLinearGradient(sx - 220, 0, sx + 220, HH * 0.4); sh.addColorStop(0, 'rgba(255,248,220,0)'); sh.addColorStop(0.5, 'rgba(255,248,220,0.5)'); sh.addColorStop(1, 'rgba(255,248,220,0)'); g.fillStyle = sh; g.fillRect(0, 0, W, HH); }
    g.globalCompositeOperation = 'destination-in'; g.drawImage(mask, 0, 0);
    const tint = (col) => { const T = H.layer(W, HH), tc = T.getContext('2d'); tc.drawImage(mask, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, W, HH); return T; };
    ctx.drawImage(tint('rgba(0,0,0,0.85)'), 1.5, 2);
    ctx.drawImage(G, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.3; ctx.drawImage(tint('#fff4cf'), -0.8, -0.8); ctx.restore();
  };
  const decoArrow = (m, x0, y0, x1, y1, p, k0 = 1) => { // shaft + stacked chevrons for a head
    if (p <= 0) return; const a = Math.atan2(y1 - y0, x1 - x0), l = Math.hypot(x1 - x0, y1 - y0) * p;
    m.save(); m.translate(x0, y0); m.rotate(a); m.fillRect(0, -2 * k0, Math.max(0, l - 18 * k0), 4 * k0);
    m.lineWidth = 3 * k0; for (let k = 0; k < 3; k++) { const x = l - k * 9 * k0; if (x < 0) continue; m.beginPath(); m.moveTo(x - 14 * k0, -12 * k0); m.lineTo(x, 0); m.lineTo(x - 14 * k0, 12 * k0); m.stroke(); }
    m.restore();
  };
  const cameo = (m, kind, x, y, r) => { // octagonal gold frame with a line-drawn animal
    m.save(); m.translate(x, y); m.lineWidth = 3;
    m.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; m.lineTo(Math.cos(a) * r, Math.sin(a) * r); } m.closePath(); m.stroke();
    m.lineWidth = 1.2; m.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; m.lineTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86); } m.closePath(); m.stroke();
    const s = r * 0.62; m.lineWidth = Math.max(1.5, r * 0.06); m.lineJoin = 'miter';
    if (kind === 'cat') {
      m.beginPath(); m.moveTo(-s * 0.55, -s * 0.05); m.lineTo(-s * 0.5, -s * 0.75); m.lineTo(-s * 0.15, -s * 0.42); m.lineTo(s * 0.15, -s * 0.42); m.lineTo(s * 0.5, -s * 0.75); m.lineTo(s * 0.55, -s * 0.05); m.quadraticCurveTo(s * 0.5, s * 0.6, 0, s * 0.62); m.quadraticCurveTo(-s * 0.5, s * 0.6, -s * 0.55, -s * 0.05); m.stroke();
      m.beginPath(); m.moveTo(-s * 0.3, -s * 0.05); m.lineTo(-s * 0.12, -s * 0.12); m.moveTo(s * 0.3, -s * 0.05); m.lineTo(s * 0.12, -s * 0.12); m.stroke();
      for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { m.beginPath(); m.moveTo(sd * s * 0.12, s * 0.22 + k * s * 0.07); m.lineTo(sd * s * 0.7, s * 0.12 + k * s * 0.12); m.stroke(); }
    } else {
      m.beginPath(); m.arc(0, s * 0.05, s * 0.5, Math.PI * 1.1, Math.PI * 1.9); m.stroke();
      m.beginPath(); m.moveTo(-s * 0.42, -s * 0.2); m.lineTo(-s * 0.72, s * 0.3); m.lineTo(-s * 0.5, s * 0.42); m.lineTo(-s * 0.4, s * 0.1); m.stroke();
      m.beginPath(); m.moveTo(s * 0.42, -s * 0.2); m.lineTo(s * 0.72, s * 0.3); m.lineTo(s * 0.5, s * 0.42); m.lineTo(s * 0.4, s * 0.1); m.stroke();
      m.beginPath(); m.moveTo(-s * 0.4, s * 0.1); m.quadraticCurveTo(-s * 0.35, s * 0.62, 0, s * 0.65); m.quadraticCurveTo(s * 0.35, s * 0.62, s * 0.4, s * 0.1); m.stroke();
      m.beginPath(); m.arc(0, s * 0.3, s * 0.12, 0, 7); m.fill();
      m.beginPath(); m.arc(-s * 0.18, -s * 0.02, s * 0.06, 0, 7); m.arc(s * 0.18, -s * 0.02, s * 0.06, 0, 7); m.fill();
    }
    m.restore();
  };
  const plaque = (ctx, txt, x, y, size, p = 1, font = 'Poiret One', col = CREAM, back = font === 'Poiret One', ls = 0.18) => { // cream lettering on a black plaque with gold rule
    if (p <= 0) return; ctx.save(); ctx.globalAlpha = p; ctx.font = `400 ${size}px "${font}"`; ctx.letterSpacing = (size * ls).toFixed(1) + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (back) { // black lacquer plaque, double gold hairline, tiny diamond studs at the ends
      const w = ctx.measureText(txt).width - size * ls, bw = w + size * 1.15, bh = size * 1.25, x0 = Math.round(x - bw / 2) + 0.5, y0 = Math.round(y - bh / 2) + 0.5;
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x0 + 1.5, y0 + 2.5, bw, bh);
      const g = ctx.createLinearGradient(0, y0, 0, y0 + bh); g.addColorStop(0, '#1a140c'); g.addColorStop(0.5, '#0d0a06'); g.addColorStop(1, '#070504'); ctx.fillStyle = g; ctx.fillRect(x0, y0, bw, bh);
      ctx.strokeStyle = '#d9ab52'; ctx.lineWidth = 1; ctx.strokeRect(x0, y0, bw, bh);
      ctx.strokeStyle = 'rgba(201,154,62,0.55)'; ctx.strokeRect(x0 + 3, y0 + 3, bw - 6, bh - 6);
      ctx.fillStyle = '#e2b860'; for (const ex of [x0, x0 + bw]) { ctx.beginPath(); ctx.moveTo(ex - 4, y0 + bh / 2); ctx.lineTo(ex, y0 + bh / 2 - 4); ctx.lineTo(ex + 4, y0 + bh / 2); ctx.lineTo(ex, y0 + bh / 2 + 4); ctx.closePath(); ctx.fill(); }
    }
    const tx = x + size * ls / 2, ty = y + 1;
    if (font === 'Poiret One') { ctx.strokeStyle = col; ctx.lineWidth = size * 0.035; ctx.lineJoin = 'round'; ctx.strokeText(txt, tx, ty); }
    ctx.fillStyle = col; ctx.fillText(txt, tx, ty); ctx.restore(); ctx.letterSpacing = '0px';
  };
  // the deco border of the hero still (stepped double frame + quarter-fan corners), built once as a mask layer
  let BORDER = null;
  const decoBorder = (W, HH) => {
    if (BORDER && BORDER.width === W && BORDER.height === HH) return BORDER;
    BORDER = H.layer(W, HH); const m = BORDER.getContext('2d'); m.fillStyle = m.strokeStyle = '#fff';
    const frame = (ins, lw) => {
      const s = 34; m.lineWidth = lw; m.beginPath();
      m.moveTo(ins + s, ins); m.lineTo(W - ins - s, ins); m.lineTo(W - ins - s, ins + s * 0.4); m.lineTo(W - ins - s * 0.4, ins + s * 0.4); m.lineTo(W - ins - s * 0.4, ins + s); m.lineTo(W - ins, ins + s);
      m.lineTo(W - ins, HH - ins - s); m.lineTo(W - ins - s * 0.4, HH - ins - s); m.lineTo(W - ins - s * 0.4, HH - ins - s * 0.4); m.lineTo(W - ins - s, HH - ins - s * 0.4); m.lineTo(W - ins - s, HH - ins);
      m.lineTo(ins + s, HH - ins); m.lineTo(ins + s, HH - ins - s * 0.4); m.lineTo(ins + s * 0.4, HH - ins - s * 0.4); m.lineTo(ins + s * 0.4, HH - ins - s); m.lineTo(ins, HH - ins - s);
      m.lineTo(ins, ins + s); m.lineTo(ins + s * 0.4, ins + s); m.lineTo(ins + s * 0.4, ins + s * 0.4); m.lineTo(ins + s, ins + s * 0.4); m.closePath(); m.stroke();
    };
    frame(20, 3); frame(30, 1.2);
    for (const [fx, fy, a0] of [[30, 30, 0], [W - 30, 30, Math.PI / 2], [W - 30, HH - 30, Math.PI], [30, HH - 30, Math.PI * 1.5]]) {
      m.lineWidth = 1.4;
      for (let k = 0; k < 3; k++) { m.beginPath(); m.arc(fx, fy, 58 + k * 12, a0 + 0.12, a0 + Math.PI / 2 - 0.12); m.stroke(); }
      for (let k = 0; k < 7; k++) { const a = a0 + 0.2 + (k / 6) * (Math.PI / 2 - 0.4); m.beginPath(); m.moveTo(fx + Math.cos(a) * 58, fy + Math.sin(a) * 58); m.lineTo(fx + Math.cos(a) * 82, fy + Math.sin(a) * 82); m.stroke(); }
      // small stepped diamond at the corner inside the fan
      const dx = fx + Math.cos(a0 + Math.PI / 4) * 40, dy = fy + Math.sin(a0 + Math.PI / 4) * 40;
      m.beginPath(); m.moveTo(dx, dy - 6); m.lineTo(dx + 6, dy); m.lineTo(dx, dy + 6); m.lineTo(dx - 6, dy); m.closePath(); m.fill();
    }
    // centre studs on the side rules
    for (const [x, y] of [[W / 2, 20], [W / 2, HH - 20], [20, HH / 2], [W - 20, HH / 2]]) { m.beginPath(); m.moveTo(x, y - 7); m.lineTo(x + 7, y); m.lineTo(x, y + 7); m.lineTo(x - 7, y); m.closePath(); m.fill(); }
    return BORDER;
  };
  const odoFrame = (m, x, y, digits, ch) => { const cw = ch * 0.62; m.lineWidth = 2.5; m.strokeRect(x - 8, y - 8, digits * (cw + 6) + 42, ch + 16); m.lineWidth = 1; m.strokeRect(x - 14, y - 14, digits * (cw + 6) + 54, ch + 28); };
  const odometer = (ctx, n, x, y, digits, ch) => { // rolling digit wheels
    const cw = ch * 0.62;
    ctx.save(); ctx.font = `400 ${ch * 0.82}px "Limelight"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let k = 0; k < digits; k++) {
      const place = digits - 1 - k, v = n / Math.pow(10, place), dgt = Math.floor(v) % 10;
      let off = place === 0 ? v % 1 : H.smooth(0.9, 1, (n % Math.pow(10, place)) / Math.pow(10, place));
      const bx = x + k * (cw + 6) + (k >= 1 ? 16 : 0) + (k >= 4 ? 16 : 0);
      if (k === 1 || k === 4) { ctx.save(); ctx.fillStyle = CREAM; ctx.font = `400 ${ch * 0.6}px "Limelight"`; ctx.textAlign = 'center'; ctx.fillText(',', bx - 11, y + ch * 0.85); ctx.restore(); }
      ctx.fillStyle = '#16120c'; ctx.fillRect(bx, y, cw, ch);
      ctx.save(); ctx.beginPath(); ctx.rect(bx, y, cw, ch); ctx.clip();
      const lead = Math.floor(n).toString().length < digits - k && dgt === 0 && off === 0;
      ctx.fillStyle = lead ? 'rgba(239,227,196,0.25)' : CREAM;
      ctx.fillText(String(dgt), bx + cw / 2, y + ch / 2 - off * ch); ctx.fillText(String((dgt + 1) % 10), bx + cw / 2, y + ch / 2 + ch - off * ch);
      ctx.restore();
      const g = ctx.createLinearGradient(0, y, 0, y + ch); g.addColorStop(0, 'rgba(0,0,0,0.6)'); g.addColorStop(0.3, 'rgba(0,0,0,0)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = g; ctx.fillRect(bx, y, cw, ch);
    }
    ctx.restore();
  };
  const gaugeMask = (m, x, y, r) => { // semicircular dial: gold arc + ticks (needle drawn in cream later)
    m.lineWidth = 2.5; m.beginPath(); m.arc(x, y, r, Math.PI, 0); m.stroke();
    for (let k = 0; k <= 8; k++) { const a = Math.PI + k / 8 * Math.PI; m.beginPath(); m.moveTo(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78); m.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); m.stroke(); }
    m.fillRect(x - r - 6, y, r * 2 + 12, 3);
  };
  // compact server ziggurat (the model) drawn into the gold mask
  const miniZig = (m, ctx, cx, base, s, ledSeed) => {
    const tiers = [[5, 40], [4, 36], [3, 32], [2, 30], [1, 28]], bay = 36 * s; let y = base; const leds = [];
    tiers.forEach(([n, h]) => {
      const w = n * bay + 10 * s, x = cx - w / 2; h *= s; y -= h;
      m.globalCompositeOperation = 'destination-out'; m.fillRect(x, y, w, h + 1); m.globalCompositeOperation = 'source-over';
      m.lineWidth = 2.5; m.strokeRect(x + 1, y + 1, w - 2, h - 2);
      for (let b = 0; b < n; b++) { const bx = x + 5 * s + b * bay; if (b) m.fillRect(bx - 1.5, y + 3, 3, h - 6); m.lineWidth = 1; for (let u = y + 8 * s; u < y + h - 4; u += 7 * s) { m.beginPath(); m.moveTo(bx + 4, u); m.lineTo(bx + bay - 10, u); m.stroke(); leds.push([bx + bay - 6, u]); } }
      m.beginPath(); m.moveTo(cx - 16 * s, y); m.lineTo(cx, y - 10 * s); m.lineTo(cx + 16 * s, y); m.closePath(); m.fill();
    });
    m.beginPath(); m.moveTo(cx - 8 * s, y - 6 * s); m.lineTo(cx, y - 60 * s); m.lineTo(cx + 8 * s, y - 6 * s); m.closePath(); m.fill();
    return { leds, top: y - 60 * s };
  };

  const explainDeco = (ctx, W, HH, t) => {
    const E = H.ease, cl = H.clamp, S = (a, b) => cl((t - a) / (b - a), 0, 1), CX = W / 2;
    const DOORS = [5.55, 10.0, 12.5], mid = (d) => d + 0.55; // closed at mid
    const scene = t < mid(DOORS[0]) ? 1 : t < mid(DOORS[1]) ? 2 : t < mid(DOORS[2]) ? 3 : 4;
    const bg = ctx.createRadialGradient(CX, 420, 40, CX, 420, 820); bg.addColorStop(0, '#221a10'); bg.addColorStop(0.5, '#0f0c08'); bg.addColorStop(1, '#050403');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, HH);
    const M = H.layer(W, HH), m = M.getContext('2d'); m.fillStyle = m.strokeStyle = '#fff';
    const Md = H.layer(W, HH), md = Md.getContext('2d'); md.fillStyle = '#fff';
    const post = []; // cream drawing after the gilding: fns(ctx)
    const step = Math.floor(t * 5);
    const ledsDraw = (leds, seed) => post.push(() => leds.forEach(([x, y], i) => { const r = H.rng(seed + i * 977 + step * 13); if (r() < 0.7) { ctx.fillStyle = r() < 0.25 ? '#ffcf8a' : CREAM; ctx.fillRect(x - 1.2, y - 1.2, 2.6, 2.6); } }));
    const rays = (x, y, open, r0 = 120) => { md.save(); const f = md.createRadialGradient(x, y, r0, x, y, 700); f.addColorStop(0, 'rgba(255,255,255,0.5)'); f.addColorStop(1, 'rgba(255,255,255,0.03)'); md.fillStyle = f; for (let i = 0; i < 36; i++) { const a0 = Math.PI + (i / 36) * Math.PI, a1 = a0 + Math.PI / 36 * 0.42, aa = Math.PI * 1.5 + (a0 - Math.PI * 1.5) * open, ab = Math.PI * 1.5 + (a1 - Math.PI * 1.5) * open; md.beginPath(); md.moveTo(x, y); md.arc(x, y, 900, aa, ab); md.closePath(); md.fill(); } md.globalCompositeOperation = 'destination-out'; md.beginPath(); md.arc(x, y, r0, 0, 7); md.fill(); md.restore(); };

    // ---------- frame border (always) ----------
    m.drawImage(decoBorder(W, HH), 0, 0);

    // ---------- hook: title, then it shrinks into the top plaque ----------
    const hp = E.inOut(S(1.7, 2.4));
    if (hp < 1) rays(CX, 470, E.inOut(S(0.0, 1.2)) * (1 - hp), 160);
    {
      const ty = H.lerp(360, 62, hp), sz = H.lerp(84, 30, hp);
      post.push(() => {
        ctx.save(); ctx.font = `400 ${sz}px "Limelight"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = (sz * 0.08).toFixed(1) + 'px';
        const title = 'HOW DOES AI LEARN?', w = ctx.measureText(title).width, x0 = CX - w / 2;
        ctx.textAlign = 'left';
        for (let i = 0; i < title.length; i++) { const a = cl((t - 0.3 - i * 0.05) / 0.15, 0, 1); if (a <= 0) continue; ctx.globalAlpha = a; ctx.fillStyle = CREAM; ctx.fillText(title[i], x0 + ctx.measureText(title.slice(0, i)).width, ty); }
        ctx.restore(); ctx.letterSpacing = '0px';
      });
      const rw = H.lerp(420, 300, hp) * E.inOut(S(0.2, 1.0));
      m.fillRect(CX - rw, ty + sz * 0.62, rw * 2, 2); m.fillRect(CX - rw, ty - sz * 0.72, rw * 2, 1.5);
      if (hp >= 1) { m.beginPath(); m.moveTo(CX - 310, 62); m.lineTo(CX - 300, 54); m.lineTo(CX - 290, 62); m.lineTo(CX - 300, 70); m.closePath(); m.fill(); m.beginPath(); m.moveTo(CX + 310, 62); m.lineTo(CX + 300, 54); m.lineTo(CX + 290, 62); m.lineTo(CX + 300, 70); m.closePath(); m.fill(); }
    }

    // ---------- scene 1: data ----------
    if (scene === 1 && t > 2.1) {
      const zx = 1010, zb = 590, zp = E.out(S(2.1, 2.7));
      rays(zx, zb, zp * 0.9, 110);
      const z = miniZig(m, ctx, zx, zb + (1 - zp) * 300, 1.3, 1); ledsDraw(z.leds, 5);
      // the gold rail and the cameos gliding along it
      m.fillRect(60, 470, 700 * E.out(S(2.4, 2.9)), 3); m.fillRect(60, 476, 700 * E.out(S(2.4, 2.9)), 1);
      decoArrow(m, 760, 470, 880, 470, E.out(S(2.9, 3.3)));
      for (let i = 0; i < 10; i++) {
        const u = (t - 2.6 - i * 0.38) * 0.55; if (u < 0 || u > 1) continue;
        const kind = H.rng(i * 5 + 2)() < 0.5 ? 'cat' : 'dog', x = H.lerp(40, 820, u), fade = 1 - cl((u - 0.85) / 0.15, 0, 1), r = 66 * fade;
        if (r < 4) continue;
        cameo(m, kind, x, 390, r);
        m.fillRect(x - 1, 456, 2, 14 * fade);
        post.push(() => plaque(ctx, kind, x, 500, 30, fade));
      }
      post.push(() => plaque(ctx, 'TRAINING DATA', 410, 560, 30, S(3.2, 3.6)));
      const cp = S(3.0, 5.3), n = cp < 1 ? Math.pow(cp, 3) * 1e6 : 1e6;
      if (t > 2.9) { odoFrame(m, 120, 150, 7, 70); post.push(() => odometer(ctx, n, 120, 150, 7, 70)); post.push(() => plaque(ctx, 'EXAMPLES', 320, 272, 30, S(3.0, 3.3))); }
    }

    // ---------- scene 2: guess -> check -> adjust ----------
    if (scene === 2) {
      const t0 = mid(DOORS[0]) + 0.2, zx = 330, zb = 560;
      rays(zx, zb, 0.85, 110);
      const z = miniZig(m, ctx, zx, zb, 1.25, 2); ledsDraw(z.leds, 9);
      // three weight gauges on the plinth
      const adj = E.inOut(S(8.4, 9.2)), vals = [[0.2, 0.75], [0.8, 0.35], [0.45, 0.9]];
      vals.forEach((_, i) => gaugeMask(m, zx - 120 + i * 120, 640, 40));
      post.push(() => vals.forEach(([a, b], i) => { const v = H.lerp(a, b, adj) + (adj > 0 && adj < 1 ? Math.sin(t * 30 + i) * 0.03 : 0), x = zx - 120 + i * 120, y = 640, A = Math.PI + v * Math.PI; ctx.strokeStyle = adj > 0 && adj < 1 ? '#ffcf8a' : CREAM; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(A) * 34, y + Math.sin(A) * 34); ctx.stroke(); ctx.fillStyle = CREAM; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); }));
      post.push(() => plaque(ctx, 'WEIGHTS', zx, 667, 30, S(t0 + 0.3, t0 + 0.6)));
      // the new picture
      const cs = E.back(S(t0 + 0.1, t0 + 0.45)); cameo(m, 'cat', 700, 330, 80 * cs);
      decoArrow(m, 610, 330, 460, 330, E.out(S(t0 + 0.4, t0 + 0.7)));
      post.push(() => plaque(ctx, 'NEW PICTURE', 700, 440, 30, S(t0 + 0.3, t0 + 0.6)));
      // guess plaque + check medallion
      if (t < 9.35) {
        post.push(() => plaque(ctx, 'dog?', 700, 175, 46, S(6.95, 7.2), 'Limelight'));
        const xp = E.back(S(7.5, 7.75));
        if (xp > 0) { m.save(); m.translate(820, 175); m.scale(xp, xp); m.lineWidth = 3; m.beginPath(); m.arc(0, 0, 26, 0, 7); m.stroke(); m.lineWidth = 5; m.beginPath(); m.moveTo(-11, -11); m.lineTo(11, 11); m.moveTo(11, -11); m.lineTo(-11, 11); m.stroke(); m.restore(); }
        const sp = S(7.55, 8.0); // emphasis: a spotlight ring sweeps round the wrong guess
        if (sp > 0) { m.lineWidth = 2; m.beginPath(); m.ellipse(745, 175, 140, 52, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * sp); m.stroke(); }
        if (t > 7.8) post.push(() => plaque(ctx, 'WRONG — IT IS A CAT', 745, 244, 28, S(7.8, 8.0), 'Poiret One', '#ffcf8a'));
      } else {
        post.push(() => plaque(ctx, 'cat', 700, 175, 46, S(9.4, 9.6), 'Limelight'));
        const cp = E.back(S(9.65, 9.85)); if (cp > 0) { m.save(); m.translate(790, 175); m.scale(cp, cp); m.lineWidth = 3; m.beginPath(); m.arc(0, 0, 26, 0, 7); m.stroke(); m.lineWidth = 5; m.beginPath(); m.moveTo(-12, 0); m.lineTo(-3, 10); m.lineTo(13, -10); m.stroke(); m.restore(); }
      }
      // error signal: a bead of light runs back along a gold line to the gauges
      const ep = S(7.9, 8.45);
      m.lineWidth = 1.5; if (t > 7.9 && t < 9.35) { m.beginPath(); m.moveTo(820, 205); m.quadraticCurveTo(820, 640, zx + 170, 640); m.stroke(); }
      if (ep > 0 && ep < 1) post.push(() => { const u = E.inOut(ep), x = (1 - u) * (1 - u) * 820 + 2 * (1 - u) * u * 820 + u * u * (zx + 170), y = (1 - u) * (1 - u) * 205 + 2 * (1 - u) * u * 640 + u * u * 640; const g = ctx.createRadialGradient(x, y, 0, x, y, 26); g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(x - 26, y - 26, 52, 52); });
      // loop medallions: Guess -> Check -> Adjust arranged on an arc, chevron arrows between
      const MED = [['GUESS', 990, 190], ['CHECK', 1150, 370], ['ADJUST', 960, 540]], act = t < 7.45 ? 0 : t < 8.3 ? 1 : t < 9.35 ? 2 : Math.floor((t - 9.35) * 3) % 3;
      MED.forEach(([s, x, y], i) => { const p = E.back(S(t0 + 0.2 + i * 0.15, t0 + 0.5 + i * 0.15)); if (p <= 0) return; m.lineWidth = i === act && t > 6.9 ? 4 : 2; m.beginPath(); m.arc(x, y, 76 * p, 0, 7); m.stroke(); m.lineWidth = 1; m.beginPath(); m.arc(x, y, 68 * p, 0, 7); m.stroke(); post.push(() => plaque(ctx, s, x, y, 28, p, 'Poiret One', i === act && t > 6.9 ? '#ffcf8a' : CREAM, false, 0.1)); });
      decoArrow(m, 1050, 245, 1105, 300, E.out(S(7.2, 7.5)));
      decoArrow(m, 1100, 440, 1030, 490, E.out(S(7.9, 8.2)));
      decoArrow(m, 935, 465, 950, 268, E.out(S(9.0, 9.3)));
    }

    // ---------- scene 3: progress gauge ----------
    if (scene === 3) {
      const t0 = mid(DOORS[1]) + 0.2, gx = CX, gy = 530, R = 320, prog = E.inOut(S(t0 + 0.2, 12.0)), acc = H.lerp(61, 97, prog);
      // sunburst gauge: rays light up to the current accuracy
      const lit = (acc - 50) / 50;
      for (let i = 0; i < 30; i++) { const u = (i + 0.5) / 30, a0 = Math.PI + u * Math.PI; if (u > lit) { m.globalAlpha = 0.18; } m.beginPath(); m.moveTo(gx + Math.cos(a0 - 0.03) * 168, gy + Math.sin(a0 - 0.03) * 168); m.lineTo(gx + Math.cos(a0 - 0.045) * R, gy + Math.sin(a0 - 0.045) * R); m.lineTo(gx + Math.cos(a0 + 0.045) * R, gy + Math.sin(a0 + 0.045) * R); m.lineTo(gx + Math.cos(a0 + 0.03) * 168, gy + Math.sin(a0 + 0.03) * 168); m.closePath(); m.fill(); m.globalAlpha = 1; }
      m.lineWidth = 3; m.beginPath(); m.arc(gx, gy, R + 14, Math.PI, 0); m.stroke(); m.lineWidth = 1.5; m.beginPath(); m.arc(gx, gy, 156, Math.PI, 0); m.stroke();
      m.fillRect(gx - R - 40, gy, (R + 40) * 2, 3);
      [50, 75, 100].forEach((v) => { const a = Math.PI + (v - 50) / 50 * Math.PI, rr = v === 75 ? R + 66 : R + 62; post.push(() => plaque(ctx, v + '%', gx + Math.cos(a) * rr, gy + Math.sin(a) * rr + (v === 75 ? 0 : -30), 28)); });
      post.push(() => { ctx.save(); ctx.font = '400 96px "Limelight"'; ctx.textAlign = 'center'; ctx.fillStyle = CREAM; ctx.fillText(Math.round(acc) + '%', gx, gy - 24); ctx.restore(); { // one lacquer plaque carrying the three caption lines
          const bw = 470, bx = Math.round(gx - bw / 2) + 0.5, by = gy + 12.5, bh = 136; ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(bx + 1.5, by + 2.5, bw, bh);
          const g = ctx.createLinearGradient(0, by, 0, by + bh); g.addColorStop(0, '#1a140c'); g.addColorStop(0.5, '#0d0a06'); g.addColorStop(1, '#070504'); ctx.fillStyle = g; ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = '#d9ab52'; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh); ctx.strokeStyle = 'rgba(201,154,62,0.55)'; ctx.strokeRect(bx + 3, by + 3, bw - 6, bh - 6);
          ctx.fillStyle = 'rgba(201,154,62,0.6)'; ctx.fillRect(gx - 90, gy + 54, 180, 1); ctx.restore(); }
        plaque(ctx, 'ACCURACY', gx, gy + 34, 28, 1, 'Poiret One', CREAM, false); plaque(ctx, '61% → 97%', gx, gy + 76, 30, S(t0 + 0.3, t0 + 0.6), 'Poiret One', CREAM, false); plaque(ctx, 'OVER TRAINING ROUNDS', gx, gy + 120, 28, S(t0 + 0.3, t0 + 0.6), 'Poiret One', CREAM, false); });
      // emphasis: beacon flash and a ring when it reaches 97%
      const fl = S(12.0, 12.4);
      if (fl > 0) { m.lineWidth = 3; m.lineWidth = 4; m.beginPath(); m.arc(gx, gy, R + 34 + fl * 10, Math.PI, Math.PI + Math.PI * Math.min(1, fl * 1.5)); m.stroke();
        post.push(() => { const g = ctx.createRadialGradient(gx, gy - 52, 0, gx, gy - 52, 260); g.addColorStop(0, `rgba(255,236,190,${0.45 * (1 - Math.abs(fl - 0.4))})`); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(gx - 260, gy - 312, 520, 520); ctx.restore(); }); }
    }

    // ---------- scene 4: takeaway plaque ----------
    if (scene === 4) {
      const t0 = mid(DOORS[2]) + 0.2;
      rays(CX, 640, E.inOut(S(t0, t0 + 0.8)), 140);
      post.push(() => { plaque(ctx, 'MORE EXAMPLES', CX, 300, 60, S(t0, t0 + 0.3), 'Limelight'); plaque(ctx, 'BETTER GUESSES', CX, 470, 60, S(t0 + 0.35, t0 + 0.65), 'Limelight'); });
      decoArrow(m, CX, 340, CX, 428, E.out(S(t0 + 0.2, t0 + 0.45)), 1.8);
      const rw = 380 * E.inOut(S(t0, t0 + 0.6)); m.fillRect(CX - rw, 528, rw * 2, 2); m.fillRect(CX - rw, 240, rw * 2, 2);
    }

    // ---------- gild ----------
    const Gd = H.layer(W, HH), gd = Gd.getContext('2d'); gd.drawImage(Md, 0, 0); gd.globalCompositeOperation = 'source-in'; gd.fillStyle = '#c08a34'; gd.fillRect(0, 0, W, HH);
    ctx.save(); ctx.globalAlpha = 0.85; ctx.drawImage(Gd, 0, 0); ctx.restore();
    const sheen = t < 6 ? (t - 3.4) / 1.3 : (t - 12.1) / 1.2;
    exGild(ctx, W, HH, M, sheen);
    post.forEach((f) => f());

    // ---------- the gold elevator doors ----------
    for (const d of DOORS) {
      const close = E.inOut(S(d, d + 0.5)), open = E.inOut(S(d + 0.65, d + 1.15)), k = close * (1 - open); if (k <= 0) continue;
      const DM = H.layer(W, HH), dm = DM.getContext('2d'); dm.fillStyle = dm.strokeStyle = '#fff';
      const wHalf = (W / 2) * k;
      ctx.fillStyle = '#0d0a06'; ctx.fillRect(0, 0, wHalf, HH); ctx.fillRect(W - wHalf, 0, wHalf, HH);
      for (const side of [-1, 1]) {
        const ex = side < 0 ? wHalf : W - wHalf; // leading edge
        const px = side < 0 ? ex - W / 2 : ex; // panel left
        dm.save(); dm.beginPath(); dm.rect(side < 0 ? 0 : W - wHalf, 0, wHalf, HH); dm.clip();
        dm.lineWidth = 3; dm.strokeRect(px + 20, 20, W / 2 - 40, HH - 40); dm.lineWidth = 1.2; dm.strokeRect(px + 32, 32, W / 2 - 64, HH - 64);
        const fx = side < 0 ? px + W / 2 - 32 : px + 32; // fan anchored at the meeting edge
        for (let i = 0; i < 9; i++) { const a = (side < 0 ? Math.PI / 2 : -Math.PI / 2) + (i + 0.5) / 9 * Math.PI; dm.beginPath(); dm.moveTo(fx, HH / 2); dm.lineTo(fx + Math.cos(a - 0.05) * 230, HH / 2 + Math.sin(a - 0.05) * 230); dm.lineTo(fx + Math.cos(a + 0.05) * 230, HH / 2 + Math.sin(a + 0.05) * 230); dm.closePath(); dm.fill(); }
        dm.lineWidth = 2; for (let k2 = 0; k2 < 3; k2++) { dm.beginPath(); dm.arc(fx, HH / 2, 250 + k2 * 16, side < 0 ? Math.PI / 2 : -Math.PI / 2, side < 0 ? Math.PI * 1.5 : Math.PI / 2); dm.stroke(); }
        for (let k2 = 0; k2 < 6; k2++) { const yy = 70 + k2 * 18; dm.beginPath(); dm.moveTo(px + W / 4 - 60, yy + 14); dm.lineTo(px + W / 4, yy); dm.lineTo(px + W / 4 + 60, yy + 14); dm.stroke(); const y2 = HH - 70 - k2 * 18; dm.beginPath(); dm.moveTo(px + W / 4 - 60, y2 - 14); dm.lineTo(px + W / 4, y2); dm.lineTo(px + W / 4 + 60, y2 - 14); dm.stroke(); }
        dm.restore();
      }
      exGild(ctx, W, HH, DM, -5);
    }
    H.grain(ctx, W, HH, 0.035, 3 + Math.floor(t * 12), true);
    H.vignette(ctx, W, HH, 0.45);
  };

  registerStyle({
    id: 'art-deco',
    name: 'Art Deco Foil',
    category: 'Art & Design Movements',
    description: 'A 1920s Art Deco poster in black lacquer and stamped gold foil: a symmetrical stepped ziggurat skyscraper built from server racks, sunburst fans radiating behind it, a stepped geometric border, and Limelight / Poiret One lettering with cream accents.',
    motion: 'Like a gilded title sequence: the stepped border inscribes itself, the server ziggurat rises floor by floor with its LEDs waking, halo arcs close symmetrically and the sunburst fans open, the spire extends and its beacon ignites, the title is foil-stamped letter by letter, then one slow glint sweeps across the gold.',
    fonts: ['400 76px "Limelight"', '400 30px "Poiret One"', '400 16px "Poiret One"'],
    frameT: 4.7,
    duration: 5,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'A gilded picture-palace sequence: scenes change behind closing and opening gold elevator doors, cameos glide on a gold rail with cream name plaques, arrows are stepped chevron arrows, numbers roll on an odometer and fill a sunburst gauge, and the key moments get a spotlight ring or a beacon glint.',
    explainer(ctx, W, HH, t) { explainDeco(ctx, W, HH, t); },
    // Sound: a gilded picture palace. Heavy brass elevator doors roll shut on their track with a deep clunk, the lift
    // chime sounds and they roll open on the next scene; the sunbursts open on soft harp glissandi, the odometer wheels
    // tick, the guess/check moments are vibraphone and a muted brass stab, and a quiet jazz-age pad sits underneath.
    // Times copied from explainDeco().
    explainerSound(k) {
      const D = 14.5, E = H.ease, cl = H.clamp;
      const S = (t, a, b) => cl((t - a) / (b - a), 0, 1);
      const pan = (px) => cl((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (a, b, ease, u) => { for (let i = 0; i <= 400; i++) if (ease(i / 400) >= u - 1e-6) return a + ((b - a) * i) / 400; return b; };
      const backLand = (a, b) => a + (b - a) * 0.37; // back ease first reaches full size at 37%
      const DOORS = [5.55, 10.0, 12.5], mid = (d) => d + 0.55;
      const HARP = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'];
      // harp pluck: soft triangle with a quick decay
      const pluck = (t, n, g, p, minor = true) => { const f = k.hz(n);
        k.tone(t, { f, type: 'triangle', dur: 0.9, gain: 0.14 * g, a: 0.002, filter: 'lowpass', f2: 2200, pan: p, verb: 0.3, minor });
        k.tone(t, { f: f * 2, dur: 0.25, gain: 0.028 * g, a: 0.002, pan: p, minor }); };
      const gliss = (t0, t1, notes, g, p) => notes.forEach((n, i) => pluck(t0 + ((t1 - t0) * i) / Math.max(1, notes.length - 1), n, g, p));
      // vibraphone: sine with a slow shimmer, low register only
      const vibe = (t, n, g, p, minor) => { const f = k.hz(n);
        k.tone(t, { f, dur: 1.4, gain: 0.13 * g, a: 0.004, pan: p, verb: 0.35, minor });
        k.tone(t, { f: f * 1.003, dur: 1.2, gain: 0.07 * g, a: 0.004, pan: p, minor });
        k.tone(t, { f: f * 4, dur: 0.12, gain: 0.015 * g, a: 0.002, pan: p, minor }); };
      // muted brass stab
      const brass = (t, notes, dur, g, p) => notes.forEach((n, i) => { for (const det of [-6, 6])
        k.tone(t, { f: n, type: 'sawtooth', detune: det, dur, gain: 0.03 * g, a: 0.015, hold: dur * 0.5, filter: 'lowpass', f2: [[0, 500], [0.05, 1600], [dur, 600]], q: 1.2, pan: p + (i - 1) * 0.15, verb: 0.3 }); });
      // odometer wheel tick
      const odo = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.02, filter: 'bandpass', f: 2400, q: 2, gain: 0.24 * g, a: 0.001, pan: p }); k.tone(t, { f: 420, type: 'triangle', dur: 0.03, gain: 0.05 * g, pan: p }); });
      // the elevator doors: roll shut on the track (inOut d..d+0.5), clunk, chime, roll open (d+0.65..d+1.15)
      const roll = (t, dur, g) => {
        k.noise(t, { dur, color: 'brown', filter: 'lowpass', f: [[0, 200], [dur * 0.5, 600], [dur, 250]], gain: 0.4 * g, a: dur * 0.4 });
        for (let x = 0.06; x < dur - 0.05; x += 0.055) k.noise(t + x, { dur: 0.03, filter: 'bandpass', f: 700, q: 3, gain: 0.06 * g * Math.sin((x / dur) * Math.PI), a: 0.002, minor: true });
      };
      const doors = (d) => {
        roll(d, 0.5, 1);
        k.play('thud', d + 0.5, { f: 85, gain: 0.45 });
        k.play('tock', d + 0.5, { f: 260, gain: 0.3 });
        k.tone(d + 0.5, { f: 340, dur: 0.5, gain: 0.04, a: 0.003, verb: 0.3 }); k.tone(d + 0.5, { f: 523, dur: 0.35, gain: 0.025, a: 0.003 });
        k.play('ding', d + 0.65, { f: 'E5', gain: 0.6 }); // the lift chime
        roll(d + 0.65, 0.5, 0.8);
      };

      k.bed('room', 0, D, { gain: 0.35 });
      k.music('pad', 0, D, { bpm: 76, gain: 0.45, chords: [['C3', 'E3', 'G3', 'B3'], ['A2', 'C3', 'E3', 'G3'], ['D3', 'F3', 'A3', 'C4'], ['G2', 'B2', 'D3', 'F3']] });

      // ---- hook: sunburst opens (inOut 0-1.2) as the title fades in letter by letter (0.3 + i*0.05)
      gliss(when(0, 1.2, E.inOut, 0.08), when(0, 1.2, E.inOut, 0.92), HARP, 0.9, 0);
      vibe(1.25, 'C4', 0.6, 0, true); vibe(1.25, 'G4', 0.5, 0, true); // title complete
      // title glides up into the top plaque (1.7-2.4): a soft slide
      k.noise(1.7, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.7, 900]], q: 0.7, gain: 0.06, a: 0.3, minor: true });

      // ---- scene 1: DATA
      k.noise(2.1, { dur: 0.6, color: 'brown', filter: 'lowpass', f: [[0, 150], [0.6, 450]], gain: 0.25, a: 0.25, pan: pan(1010), minor: true }); // ziggurat rises
      gliss(2.15, 2.6, ['G3', 'C4', 'D4', 'G4'], 0.6, pan(1010));
      k.play('thud', when(2.1, 2.7, E.out, 0.95), { f: 90, gain: 0.35, pan: pan(1010), minor: true });
      k.noise(2.4, { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 1200], [0.5, 1800]], q: 2, gain: 0.05, a: 0.1, pan: pan(400), minor: true }); // gold rail runs out
      k.play('tock', 2.9, { f: 300, gain: 0.4, pan: pan(320), minor: true }); // odometer frame set
      const chev = when(2.9, 3.3, E.out, 0.95); k.play('click', chev, { f: 900, gain: 0.8, pan: pan(880), minor: true }); // chevron arrow lands
      // cameos arrive on the rail at 2.6 + 0.38 i: a soft felt tap each
      const cams = []; for (let i = 0; 2.6 + i * 0.38 < mid(DOORS[0]) - 0.2; i++) cams.push(2.6 + i * 0.38);
      cams.forEach((tc) => k.noise(tc, { dur: 0.05, color: 'pink', filter: 'bandpass', f: 900, q: 1, gain: 0.24, a: 0.003, pan: pan(40), minor: true }));
      // odometer n = S(3.0,5.3)^3 * 1e6: wheel ticks speeding up, off the cameo taps
      for (let t = 3.08; t < 5.24; ) { const s = S(t, 3.0, 5.3); if (![...cams, chev].some((c) => t > c - 0.06 && t < c + 0.08)) odo(t, 0.7 + 0.4 * s, pan(330)); t += 0.16 - 0.075 * s; }
      k.play('tock', 5.3, { f: 280, gain: 0.6, pan: pan(330) }); vibe(5.31, 'G4', 0.8, pan(330)); // 1,000,000 locks

      // ---- the elevator doors between scenes
      DOORS.forEach(doors);

      // ---- scene 2: GUESS / CHECK / ADJUST (t0 = 6.3)
      const t0 = mid(DOORS[0]) + 0.2;
      pluck(backLand(t0 + 0.1, t0 + 0.45), 'E4', 0.8, pan(700)); // cat cameo
      [0, 1, 2].forEach((i) => pluck(backLand(t0 + 0.2 + i * 0.15, t0 + 0.5 + i * 0.15), ['G4', 'A4', 'C5'][i], 0.6, pan([990, 1150, 960][i]))); // medallions
      // the guess: "dog?" fades up (6.95-7.2) on a questioning vibe pair
      vibe(7.0, 'D4', 0.8, pan(700)); vibe(7.12, 'A4', 0.6, pan(700));
      // CHECK: the X medallion snaps on (back 7.5-7.75) — muted brass stab, wrong
      brass(backLand(7.5, 7.75), ['C3', 'Gb3', 'Bb3'], 0.45, 1.2, pan(820));
      k.play('thud', backLand(7.5, 7.75), { f: 100, gain: 0.5, pan: pan(820) });
      k.noise(7.6, { dur: 0.42, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.2, 1500], [0.42, 800]], q: 1.2, gain: 0.06, a: 0.08, pan: pan(745), minor: true }); // spotlight ring sweeps round
      // error bead runs back along the gold line (inOut 7.9-8.45): a soft falling glide
      k.tone(7.92, { f: [[0, 620], [0.5, 260]], type: 'triangle', dur: 0.55, gain: 0.05, a: 0.15, filter: 'lowpass', f2: 1200, pan: pan(600) });
      // weight gauges re-set (inOut 8.4-9.2): needle detents, at least 90 ms apart
      for (let i = 1, lt = 0; i <= 8; i++) { const t = when(8.4, 9.2, E.inOut, i / 8); if (t - lt < 0.09) continue; lt = t; odo(t, 1, pan(330)); }
      // the correction: "cat" fades up (9.4-9.6), the check medallion snaps on (back 9.65-9.85)
      pluck(9.45, 'C4', 0.6, pan(700));
      ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => vibe(backLand(9.65, 9.85) + i * 0.06, n, 0.8, pan(790)));

      // ---- scene 3: PROGRESS (t0 = 10.75): sunburst rays light one by one as accuracy rises (inOut 10.95-12.0)
      const t3 = mid(DOORS[1]) + 0.2;
      for (let i = 0, lt = 0; i < 30; i++) {
        const u = (i + 0.5) / 30, acc = 50 + 50 * u; if (acc <= 61 || acc > 97) continue;
        const t = when(t3 + 0.2, 12.0, E.inOut, (acc - 61) / 36); if (t - lt < 0.09) continue; lt = t;
        pluck(t, HARP[Math.min(9, Math.floor((i - 6) / 2.2))], 0.6, pan(640 + Math.cos(Math.PI + u * Math.PI) * 300));
        odo(t + 0.004, 0.6, pan(640));
      }
      // 97%: beacon flash and ring (12.0-12.4) — the biggest hit
      k.play('impact', 12.0, { gain: 1.7 }); k.play('thud', 12.0, { f: 70, gain: 0.7 });
      ['C3', 'G3', 'C4', 'E4', 'G4'].forEach((n, i) => vibe(12.0 + i * 0.015, n, 1.0, (i - 2) * 0.2));
      brass(12.02, ['C3', 'E3', 'G3'], 0.6, 1.0, 0);
      k.noise(12.0, { dur: 1.4, color: 'pink', filter: 'highpass', f: 5000, gain: 0.05, a: 0.25, verb: 0.4 }); // cymbal shimmer

      // ---- scene 4: TAKEAWAY (t0 = 13.25): rays open (13.25-14.05), MORE EXAMPLES, arrow, BETTER GUESSES (13.6-13.9)
      const t4 = mid(DOORS[2]) + 0.2;
      gliss(t4 + 0.05, t4 + 0.6, ['C4', 'E4', 'G4', 'C5', 'E5'], 0.7, 0);
      ['C3', 'G3', 'E4', 'B4', 'D5'].forEach((n, i) => vibe(t4 + 0.62 + i * 0.05, n, 0.75 - i * 0.07, (i - 2) * 0.2)); // resolves on BETTER GUESSES
    },
    draw(ctx, W, HH, t) {
      const CX = W / 2;
      const P = (d, dur = 0.8) => H.ease.out(H.clamp((t - d) / dur, 0, 1));

      // ---------- lacquer black ground ----------
      const bg = ctx.createRadialGradient(CX, 420, 40, CX, 420, 820);
      bg.addColorStop(0, '#221a10'); bg.addColorStop(0.5, '#0f0c08'); bg.addColorStop(1, '#050403');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, HH);

      const M = H.layer(W, HH), m = M.getContext('2d');   // full-strength gold
      const Md = H.layer(W, HH), md = Md.getContext('2d'); // dim gold (rays)
      m.fillStyle = m.strokeStyle = '#fff'; md.fillStyle = md.strokeStyle = '#fff';

      // ---------- sunburst behind the tower ----------
      const sy = 540, open = H.ease.inOut(H.clamp((t - 1.3) / 1.1, 0, 1));
      const N = 40;
      md.save(); md.beginPath(); md.rect(34, 34, W - 68, sy - 34); md.clip();
      const fall = md.createRadialGradient(CX, sy, 280, CX, sy, 760);
      fall.addColorStop(0, 'rgba(255,255,255,0.55)'); fall.addColorStop(0.6, 'rgba(255,255,255,0.22)'); fall.addColorStop(1, 'rgba(255,255,255,0.04)');
      md.fillStyle = fall;
      for (let i = 0; i < N; i++) {
        const a0 = Math.PI + (i / N) * Math.PI, a1 = a0 + (Math.PI / N) * 0.42;
        const aa = Math.PI * 1.5 + (a0 - Math.PI * 1.5) * open, ab = Math.PI * 1.5 + (a1 - Math.PI * 1.5) * open;
        md.beginPath(); md.moveTo(CX, sy); md.arc(CX, sy, 900, aa, ab); md.closePath(); md.fill();
      }
      md.restore(); md.fillStyle = '#fff';
      md.globalAlpha = 1;
      // black disc mask so rays start from a halo
      md.globalCompositeOperation = 'destination-out'; md.beginPath(); md.arc(CX, sy, 300, 0, 7); md.fill(); md.globalCompositeOperation = 'source-over';
      // concentric fan arcs (scalloped halo)
      // halo arcs inscribe from both ends and meet at the top (symmetry)
      const arcIn = (r, p) => { if (p <= 0) return; m.beginPath(); m.arc(CX, sy, r, Math.PI, Math.PI + Math.PI / 2 * p); m.stroke(); m.beginPath(); m.arc(CX, sy, r, -Math.PI / 2 * p, 0); m.stroke(); };
      m.lineWidth = 3;
      for (let k = 0; k < 4; k++) arcIn(250 + k * 18, H.ease.inOut(H.clamp((t - 1.0 - k * 0.08) / 0.8, 0, 1)));
      m.lineWidth = 1.5; arcIn(330, H.ease.inOut(H.clamp((t - 1.3) / 0.8, 0, 1)));
      // scallop fan blades in the halo (pop on in pairs from the outside in)
      for (let i = 0; i < 12; i++) {
        if (t < 1.6 + Math.min(i, 11 - i) * 0.07) continue;
        const a = Math.PI + (i + 0.5) / 12 * Math.PI;
        m.beginPath(); m.moveTo(CX + Math.cos(a) * 304, sy + Math.sin(a) * 304);
        m.lineTo(CX + Math.cos(a - 0.05) * 330, sy + Math.sin(a - 0.05) * 330); m.lineTo(CX + Math.cos(a + 0.05) * 330, sy + Math.sin(a + 0.05) * 330); m.closePath(); m.fill();
      }

      // ---------- ziggurat of server racks ----------
      const BAY = 74; const tiers = [[6 * BAY + 12, 84], [5 * BAY + 12, 78], [4 * BAY + 12, 72], [3 * BAY + 12, 68], [2 * BAY + 12, 62], [BAY + 12, 56]];
      let y = sy;
      const tierBoxes = [];
      for (const [w, h] of tiers) { tierBoxes.push([CX - w / 2, y - h, w, h]); y -= h; }
      const topY = y;
      // black body (knock out rays behind the tower)
      const body = new Path2D();
      // tiers rise floor by floor (stepped), bottom first
      const tierP = tierBoxes.map((_, ti) => H.ease.out(H.clamp((t - 0.45 - ti * 0.17) / 0.22, 0, 1)));
      tierBoxes.forEach(([x, yy, w, h], ti) => { if (tierP[ti] > 0) body.rect(x, yy + h * (1 - tierP[ti]), w, h * tierP[ti] + 1); });
      md.globalCompositeOperation = 'destination-out'; md.fill(body); md.globalCompositeOperation = 'source-over';
      m.globalCompositeOperation = 'destination-out'; m.fill(body); m.globalCompositeOperation = 'source-over';
      const leds = [];
      tierBoxes.forEach(([x, yy, w, h], ti) => {
        if (tierP[ti] <= 0) return;
        m.save(); m.beginPath(); m.rect(x - 60, yy - 30 + (h + 30) * (1 - tierP[ti]), w + 120, (h + 30) * tierP[ti] + 2); m.clip();
        m.lineWidth = 3; m.strokeRect(x + 1.5, yy + 1.5, w - 3, h - 3);
        // pilasters
        const nP = Math.round((w - 12) / BAY);
        const bayW = (w - 12) / nP;
        for (let b = 0; b < nP; b++) {
          const bx = x + 6 + b * bayW;
          // rack units
          m.lineWidth = 1.2;
          for (let u = yy + 12; u < yy + h - 6; u += 9) { m.beginPath(); m.moveTo(bx + 6, u); m.lineTo(bx + bayW - 6, u); m.stroke(); }
          if (b > 0) { m.fillRect(bx - 2, yy + 4, 4, h - 8); }
          // LEDs
          if (t > 0.75 + ti * 0.17) for (let u = yy + 16, k = 0; u < yy + h - 6; u += 9, k++) leds.push([bx + bayW - 14, u - 4, ti * 31 + b * 7 + k]);
        }
        // stepped crown on each setback
        const cw = Math.min(46, w * 0.18);
        m.beginPath(); m.moveTo(CX - cw, yy); m.lineTo(CX - cw * 0.6, yy - 8); m.lineTo(CX - cw * 0.2, yy - 8); m.lineTo(CX, yy - 16); m.lineTo(CX + cw * 0.2, yy - 8); m.lineTo(CX + cw * 0.6, yy - 8); m.lineTo(CX + cw, yy); m.closePath(); m.fill();
        // chevrons on the setback ledges
        if (ti < tiers.length - 1) {
          const nw = tiers[ti + 1][0];
          for (const side of [-1, 1]) {
            const lx = CX + side * (nw / 2 + (w - nw) / 4);
            for (let k = 0; k < 3; k++) { m.beginPath(); m.moveTo(lx - 12, yy - 2 - k * 5); m.lineTo(lx, yy - 9 - k * 5); m.lineTo(lx + 12, yy - 2 - k * 5); m.lineWidth = 1.6; m.stroke(); }
          }
        }
        m.restore();
      });
      // spire
      const spP = H.ease.out(H.clamp((t - 1.5) / 0.6, 0, 1)), spTop = topY - 14 - 66 * spP;
      m.beginPath(); m.moveTo(CX - 14, topY - 14); m.lineTo(CX, spTop); m.lineTo(CX + 14, topY - 14); m.closePath(); m.fill();
      m.lineWidth = 2; for (let k = 0; k < 4; k++) { const yy = topY - 26 - k * 14; if (yy < spTop + 6) continue; m.beginPath(); m.moveTo(CX - 10 + k * 2, yy); m.lineTo(CX + 10 - k * 2, yy); m.stroke(); }
      // beacon star
      const beacon = (0.6 + 0.4 * Math.sin(t * 3.0)) * H.clamp((t - 2.1) / 0.3, 0, 1);
      m.save(); m.translate(CX, spTop - 6); { const bs = H.ease.back(H.clamp((t - 2.0) / 0.35, 0, 1)); m.scale(bs, bs); }
      for (let i = 0; i < 8; i++) { m.rotate(Math.PI / 4); m.beginPath(); m.moveTo(0, 0); m.lineTo(2.5, -6); m.lineTo(0, -(i % 2 ? 12 : 22)); m.lineTo(-2.5, -6); m.closePath(); m.fill(); }
      m.restore();

      // ---------- geometric border frame ----------
      const frame = (ins, lw) => {
        const s = 34; m.lineWidth = lw; m.setLineDash([4400 * H.ease.inOut(H.clamp((t - (lw > 2 ? 0 : 0.15)) / 1.1, 0, 1)) + 0.01, 5000]); m.beginPath();
        m.moveTo(ins + s, ins); m.lineTo(W - ins - s, ins); m.lineTo(W - ins - s, ins + s * 0.4); m.lineTo(W - ins - s * 0.4, ins + s * 0.4); m.lineTo(W - ins - s * 0.4, ins + s); m.lineTo(W - ins, ins + s);
        m.lineTo(W - ins, HH - ins - s); m.lineTo(W - ins - s * 0.4, HH - ins - s); m.lineTo(W - ins - s * 0.4, HH - ins - s * 0.4); m.lineTo(W - ins - s, HH - ins - s * 0.4); m.lineTo(W - ins - s, HH - ins);
        m.lineTo(ins + s, HH - ins); m.lineTo(ins + s, HH - ins - s * 0.4); m.lineTo(ins + s * 0.4, HH - ins - s * 0.4); m.lineTo(ins + s * 0.4, HH - ins - s); m.lineTo(ins, HH - ins - s);
        m.lineTo(ins, ins + s); m.lineTo(ins + s * 0.4, ins + s); m.lineTo(ins + s * 0.4, ins + s * 0.4); m.lineTo(ins + s, ins + s * 0.4); m.closePath(); m.stroke();
      };
      frame(20, 3); frame(30, 1.2); m.setLineDash([]);
      // corner fans
      for (const [fx, fy, a0] of [[30, 30, 0], [W - 30, 30, Math.PI / 2], [W - 30, HH - 30, Math.PI], [30, HH - 30, Math.PI * 1.5]]) {
        const fp = H.ease.out(H.clamp((t - 0.9) / 0.5, 0, 1)); if (fp <= 0) continue;
        m.save(); m.translate(fx, fy); m.scale(fp, fp); m.translate(-fx, -fy);
        m.lineWidth = 1.4;
        for (let k = 0; k < 3; k++) { m.beginPath(); m.arc(fx, fy, 58 + k * 12, a0 + 0.12, a0 + Math.PI / 2 - 0.12); m.stroke(); }
        for (let k = 0; k < 7; k++) { const a = a0 + 0.2 + (k / 6) * (Math.PI / 2 - 0.4); m.beginPath(); m.moveTo(fx + Math.cos(a) * 58, fy + Math.sin(a) * 58); m.lineTo(fx + Math.cos(a) * 82, fy + Math.sin(a) * 82); m.stroke(); }
        m.restore();
      }
      // side pilasters: triple fluted lines, stepped capital and a fan crown (symmetric)
      for (const side of [-1, 1]) {
        const x = CX + side * 470;
        const pp = H.ease.inOut(H.clamp((t - 0.7) / 0.8, 0, 1)); // pilasters grow up from their bases
        m.save(); m.beginPath(); m.rect(x - 50, 510 - 420 * pp, 100, 420 * pp); m.clip();
        m.fillRect(x - 2, 170, 4, 330); m.fillRect(x - 12, 186, 1.5, 300); m.fillRect(x + 10.5, 186, 1.5, 300);
        m.fillRect(x - 20, 500, 40, 4); m.fillRect(x - 14, 492, 28, 4); m.fillRect(x - 20, 166, 40, 4); m.fillRect(x - 14, 174, 28, 3);
        m.lineWidth = 1.5;
        for (let k = 0; k < 3; k++) { m.beginPath(); m.arc(x, 160, 18 + k * 10, Math.PI, 0); m.stroke(); }
        for (let k = 0; k < 7; k++) { const a = Math.PI + (k + 0.5) / 7 * Math.PI; m.beginPath(); m.moveTo(x, 160); m.lineTo(x + Math.cos(a) * 38, 160 + Math.sin(a) * 38); m.stroke(); }
        m.beginPath(); m.moveTo(x, 104); m.lineTo(x + 8, 116); m.lineTo(x, 128); m.lineTo(x - 8, 116); m.closePath(); m.fill();
        // dangling beads
        for (let k = 0; k < 5; k++) { m.beginPath(); m.arc(x, 214 + k * 64, 3.2, 0, 7); m.fill(); }
        m.restore();
      }
      // ---------- title plaque ----------
      const ty = 628;
      m.font = '400 76px "Limelight"'; m.textAlign = 'center'; m.textBaseline = 'alphabetic'; m.letterSpacing = '6px';
      { // foil-stamped letter by letter
        const title = 'THE GOLDEN AGE'; m.textAlign = 'left';
        const x0 = CX + 3 - m.measureText(title).width / 2 + 3;
        for (let i = 0; i < title.length; i++) {
          const a = H.clamp((t - 2.25 - i * 0.055) / 0.12, 0, 1); if (a <= 0) continue;
          m.globalAlpha = a; m.fillText(title[i], x0 + m.measureText(title.slice(0, i)).width, ty);
        }
        m.globalAlpha = 1; m.textAlign = 'center';
      }
      // rule lines with diamonds
      const rp = H.ease.inOut(H.clamp((t - 1.9) / 0.6, 0, 1));
      m.fillRect(CX - (CX - 150) * rp, sy + 8, (W - 300) * rp, 2.5);
      if (rp >= 1) for (const x of [150, W - 150]) { m.beginPath(); m.moveTo(x, sy + 9); m.lineTo(x + (x < CX ? -10 : 10), sy + 1); m.lineTo(x + (x < CX ? -20 : 20), sy + 9); m.lineTo(x + (x < CX ? -10 : 10), sy + 17); m.closePath(); m.fill(); }

      // ---------- composite foil with bevel ----------
      const G = foil(W, HH, M, 6, t);
      
      // bevel: dark offset under, light offset over edge
      const tint = (src, col) => { const T = H.layer(W, HH), tc = T.getContext('2d'); tc.drawImage(src, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, W, HH); return T; };
      { // dim warm-gold rays (flat ink, not foil)
        const Gd = tint(Md, '#c08a34'); ctx.save(); ctx.globalAlpha = 0.85; ctx.drawImage(Gd, 0, 0); ctx.restore(); }
      ctx.drawImage(tint(M, 'rgba(0,0,0,0.85)'), 1.5, 2);
      ctx.drawImage(G, 0, 0);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.35; ctx.drawImage(tint(M, '#fff4cf'), -0.8, -0.8); ctx.drawImage(G, 0, 0); ctx.restore();

      // ---------- cream accents ----------
      ctx.fillStyle = CREAM; ctx.font = '400 30px "Poiret One"'; ctx.textAlign = 'left'; ctx.letterSpacing = '20px';
      ctx.globalAlpha = H.clamp((t - 3.05) / 0.4, 0, 1);
      const sub = 'OF COMPUTE', sw = ctx.measureText(sub).width - 20;
      ctx.fillText(sub, CX - sw / 2, ty + 46);
      ctx.letterSpacing = '0px';
      for (const s2 of [-1, 1]) {
        const x0 = CX + s2 * (sw / 2 + 26), x1 = CX + s2 * (sw / 2 + 170);
        ctx.fillRect(Math.min(x0, x1), ty + 34, Math.abs(x1 - x0), 1.5);
        ctx.beginPath(); ctx.moveTo(x1, ty + 29); ctx.lineTo(x1 + s2 * 6, ty + 35); ctx.lineTo(x1, ty + 41); ctx.lineTo(x1 - s2 * 6, ty + 35); ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // LEDs: cream with glow, twinkling
      const step = Math.floor(t * 5);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      leds.forEach(([x, yy, id]) => {
        const r = H.rng(id * 977 + step * 13);
        const on = r() < 0.72; if (!on) return;
        const warm = r() < 0.25;
        const g2 = ctx.createRadialGradient(x, yy, 0, x, yy, 7);
        g2.addColorStop(0, warm ? 'rgba(255,200,120,0.55)' : 'rgba(255,240,205,0.4)'); g2.addColorStop(1, 'rgba(255,220,160,0)');
        ctx.fillStyle = g2; ctx.fillRect(x - 7, yy - 7, 14, 14);
      });
      ctx.restore();
      leds.forEach(([x, yy, id]) => { const r = H.rng(id * 977 + step * 13); if (r() < 0.72) { ctx.fillStyle = r() < 0.25 ? '#ffcf8a' : CREAM; ctx.fillRect(x - 1.5, yy - 1.5, 3, 3); } });
      // beacon glow
      const bgl = ctx.createRadialGradient(CX, spTop - 6, 0, CX, spTop - 6, 60);
      bgl.addColorStop(0, `rgba(255,236,190,${0.55 * beacon})`); bgl.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = bgl; ctx.fillRect(CX - 60, spTop - 66, 120, 120); ctx.restore();

      // ---------- print finish: subtle lacquer grain ----------
      H.grain(ctx, W, HH, 0.035, 3 + Math.floor(t * 12), true);
      H.vignette(ctx, W, HH, 0.45);
    },
  });
}
