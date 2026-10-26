{
  // ---------- Green-phosphor CRT terminal: text -> scanlines -> barrel remap w/ chromatic fringe -> bloom -> glass ----------
  const LINES = [
    ['NEURAL SYSTEMS CORP.   NX-80 TERMINAL   BIOS 2.04', 0],
    ['(C) 1983   ALL RIGHTS RESERVED', 0],
    ['', 0],
    ['MEMORY CHECK ............ 65536K  OK', 1],
    ['SYNAPSE BUS ............. ONLINE', 1],
    ['LOADING WEIGHTS  [BAR]', 2],
    ['   layer 096/117   attn.heads=32   ok', 1],
    ['   layer 097/117   attn.heads=32   ok', 1],
    ['CALIBRATING CORTEX ...... DONE', 1],
    ['', 0],
    ['>> RUN CONSCIOUSNESS.EXE', 3],
  ];

  let BEZEL = null; // static plastic housing, built once per size
  // shared tube pipeline for the hero and the explainer (bezel / remap / glass)
  function crtCompose(ctx, W, H_, t, paint, pOnT, boost) {
      const r = H.rng(80), nz = H.makeNoise(5);
      // tube geometry
      const TX = 96, TY = 46, TW = 1088, TH = 576;

      // ---------- 1. BEZEL (plastic housing), static: built once per size ----------
      const rrOn = (c, x, y, w, h, rad) => { c.beginPath(); c.moveTo(x + rad, y); c.arcTo(x + w, y, x + w, y + h, rad); c.arcTo(x + w, y + h, x, y + h, rad); c.arcTo(x, y + h, x, y, rad); c.arcTo(x, y, x + w, y, rad); c.closePath(); };
      const rr = (x, y, w, h, rad) => rrOn(ctx, x, y, w, h, rad);
      if (!BEZEL || BEZEL.width !== W || BEZEL.height !== H_) {
        BEZEL = H.layer(W, H_);
        const c = BEZEL.getContext('2d');
        const bz = c.createLinearGradient(0, 0, 0, H_);
        bz.addColorStop(0, '#3b3934'); bz.addColorStop(0.5, '#2c2a26'); bz.addColorStop(1, '#1d1c19');
        c.fillStyle = bz; c.fillRect(0, 0, W, H_);
        // moulded ABS texture: per-pixel fine grain + soft mottling (+-3%)
        const img = c.getImageData(0, 0, W, H_), d = img.data, pn = H.makeNoise(31), gr = H.rng(311);
        for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
          const k = 1 + (gr() - 0.5) * 0.06 + pn.n2(x * 0.9, y * 0.9) * 0.025 + pn.n2(x * 0.012, y * 0.012) * 0.03, i = (y * W + x) * 4;
          d[i] *= k; d[i + 1] *= k; d[i + 2] *= k;
        }
        c.putImageData(img, 0, 0);
        // key light from the upper left, falling off toward the lower right
        const kl = c.createRadialGradient(W * 0.12, -H_ * 0.1, 40, W * 0.3, H_ * 0.2, W * 0.95);
        kl.addColorStop(0, 'rgba(255,238,205,0.13)'); kl.addColorStop(0.45, 'rgba(255,238,205,0.04)'); kl.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = kl; c.fillRect(0, 0, W, H_);
        const fo = c.createLinearGradient(W * 0.35, H_ * 0.3, W, H_);
        fo.addColorStop(0, 'rgba(0,0,0,0)'); fo.addColorStop(1, 'rgba(0,0,0,0.28)');
        c.fillStyle = fo; c.fillRect(0, 0, W, H_);
        // outer edge highlight (rounded housing edge: lit top/left, shadowed bottom/right)
        c.strokeStyle = 'rgba(255,240,210,0.08)'; c.lineWidth = 2; c.strokeRect(6, 6, W - 12, H_ - 12);
        c.strokeStyle = 'rgba(255,240,210,0.1)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(7, H_ - 40); c.lineTo(7, 7); c.lineTo(W - 40, 7); c.stroke();
        // recessed opening around the tube (bevel: dark top-left, lit bottom edge)
        const bev = c.createLinearGradient(0, TY - 30, 0, TY + TH + 30);
        bev.addColorStop(0, '#0e0d0b'); bev.addColorStop(0.85, '#1a1916'); bev.addColorStop(1, '#4a463e');
        c.save(); c.shadowColor = 'rgba(255,236,200,0.16)'; c.shadowOffsetY = 2; c.shadowBlur = 3;
        rrOn(c, TX - 30, TY - 28, TW + 60, TH + 58, 38); c.fillStyle = bev; c.fill(); c.restore();
        // moulded highlight on the lower lip of the recess, and a soft shadow line under the top lip
        c.save(); rrOn(c, TX - 30, TY - 28, TW + 60, TH + 58, 38); c.clip();
        const lip = c.createLinearGradient(0, TY + TH + 18, 0, TY + TH + 30);
        lip.addColorStop(0, 'rgba(255,240,210,0)'); lip.addColorStop(0.7, 'rgba(255,240,210,0.16)'); lip.addColorStop(1, 'rgba(255,240,210,0.04)');
        c.fillStyle = lip; c.fillRect(TX - 30, TY + TH + 16, TW + 60, 16);
        c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 3; rrOn(c, TX - 29, TY - 27, TW + 58, TH + 56, 37); c.stroke();
        c.restore();
        c.strokeStyle = 'rgba(255,240,215,0.22)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(TX + 10, TY + TH + 29.5); c.lineTo(TX + TW - 10, TY + TH + 29.5); c.stroke();
        rrOn(c, TX - 14, TY - 12, TW + 28, TH + 26, 30); c.fillStyle = '#050605'; c.fill();
      }
      ctx.drawImage(BEZEL, 0, 0);

      const src = H.layer(TW, TH), s = src.getContext('2d', { willReadFrequently: true });
      s.fillStyle = '#000'; s.fillRect(0, 0, TW, TH);
      s.fillStyle = '#fff'; s.strokeStyle = '#fff'; s.textBaseline = 'top';
      paint(s, TW, TH);
      s.globalAlpha = 1; s.globalCompositeOperation = 'source-over'; s.shadowBlur = 0;
      // ---------- 3. bloom / halation layer from the source ----------
      const small = H.layer(TW / 4, TH / 4), sm = small.getContext('2d');
      sm.filter = 'blur(3px)'; sm.drawImage(src, 0, 0, TW / 4, TH / 4);
      const bloom = H.layer(TW, TH), bl = bloom.getContext('2d', { willReadFrequently: true });
      bl.imageSmoothingEnabled = true; bl.drawImage(small, 0, 0, TW, TH);
      const wide = H.layer(TW / 8, TH / 8), wd = wide.getContext('2d');
      wd.filter = 'blur(4px)'; wd.drawImage(src, 0, 0, TW / 8, TH / 8);
      bl.globalCompositeOperation = 'lighter'; bl.globalAlpha = 0.9; bl.drawImage(wide, 0, 0, TW, TH);
      const S = s.getImageData(0, 0, TW, TH).data, Bl = bl.getImageData(0, 0, TW, TH).data;

      // ---------- 4. per-pixel CRT remap ----------
      const out = ctx.getImageData(0, 0, W, H_), O = out.data;
      const K = 0.065, CA = 0.0016; // barrel strength, chromatic offset
      const humY = ((t * 0.18) % 1.3 - 0.15) * TH;
      const flick = 1 + 0.025 * Math.sin(t * 60 * 2 * Math.PI * 0.5);
      // power-on: dot -> horizontal line -> raster snaps open with a flash, then phosphor warm-up
      const pOn = pOnT;
      const wBand = pOn < 0 ? -1 : H.clamp(pOn / 0.1), hBand = pOn < 0.1 ? 0.007 : 0.007 + H.ease.out(H.clamp((pOn - 0.1) / 0.28));
      const flash = pOn < 0.1 ? 1.5 : Math.max(0, 1.3 * (1 - (pOn - 0.1) / 0.55));
      const warm = H.clamp(0.45 + (pOn - 0.3) * 0.9, 0.45, 1);
      const sample = (A, x, y, ch) => { // bilinear
        if (x < 0 || y < 0 || x >= TW - 1 || y >= TH - 1) return 0;
        const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, i = (y0 * TW + x0) * 4 + ch;
        return (A[i] * (1 - fx) + A[i + 4] * fx) * (1 - fy) + (A[i + TW * 4] * (1 - fx) + A[i + TW * 4 + 4] * fx) * fy;
      };
      const rad = 34; // tube corner radius (output space)
      for (let y = TY - 12; y < TY + TH + 14; y++) for (let x = TX - 14; x < TX + TW + 14; x++) {
        // rounded-rect tube mask with soft edge
        const qx = Math.max(Math.abs(x - (TX + TW / 2)) - (TW / 2 + 8 - rad), 0), qy = Math.max(Math.abs(y - (TY + TH / 2)) - (TH / 2 + 8 - rad), 0);
        const dEdge = rad - Math.hypot(qx, qy);
        if (dEdge < 0) continue;
        const u = ((x - TX) / TW) * 2 - 1, v = ((y - TY) / TH) * 2 - 1;
        const r2 = u * u * 1.0 + v * v * 1.0;
        let col = [0, 0, 0];
        let lumG = 0;
        for (let c = 0; c < 3; c++) {
          const f = 1 + K * r2 + (c - 1) * CA * r2 * 2.2; // R further out, B further in
          const su = u * f * 0.985, sv = v * f * 0.99;
          const sx = (su + 1) * 0.5 * TW, sy = (sv + 1) * 0.5 * TH;
          // scanlines in SOURCE space so they bow with the glass
          const scan = 0.42 + 0.58 * Math.pow(Math.cos((sy / 3) * Math.PI), 2);
          const base = sample(S, sx, sy, 1) / 255;
          const glow = sample(Bl, sx, sy, 1) / 255;
          const hum = 1 + 0.07 * Math.exp(-(((sy - humY) / 70) ** 2));
          col[c] = (base * scan + glow * 0.85) * hum * flick * warm * boost;
          if (c === 1) lumG = col[c];
        }
        if (pOn < 0.7) {
          const bandA = wBand < 0 ? 0 : H.clamp((hBand - Math.abs(v)) * 90) * H.clamp((wBand - Math.abs(u)) * 40);
          const fe = flash * (1 - 0.35 * Math.abs(u));
          for (let c = 0; c < 3; c++) col[c] = (col[c] + fe) * bandA;
        }
        // phosphor tint: P1 green; hot cores go toward white-green
        const vig = Math.pow(H.clamp(1 - r2 * 0.28), 1.4);
        const n = (r() - 0.5) * 0.035;
        const R = col[0], G = col[1], B = col[2];
        const hotR = Math.max(0, R - 0.8) * 0.8, hotB = Math.max(0, B - 0.8) * 0.7;
        let or = 7 + (0.2 * Math.pow(R, 1.6) + hotR * 0.3) * 255, og = 13 + Math.min(1.15, G) * 235, ob = 9 + (0.34 * Math.pow(B, 1.6) + hotB * 0.28) * 255;
        or = (or * vig + n * 255); og = (og * vig + n * 255); ob = (ob * vig + n * 255);
        // edge falloff into the dark bezel lip
        const a = H.clamp(dEdge / 6);
        const i = (y * W + x) * 4;
        O[i] = O[i] * (1 - a) + or * a; O[i + 1] = O[i + 1] * (1 - a) + og * a; O[i + 2] = O[i + 2] * (1 - a) + ob * a;
      }
      ctx.putImageData(out, 0, 0);

      // ---------- 5. glass: curvature shading + room reflections ----------
      ctx.save();
      rr(TX - 6, TY - 4, TW + 12, TH + 10, rad); ctx.clip();
      // inner edge darkening (glass curving away)
      const ed = ctx.createRadialGradient(TX + TW / 2, TY + TH / 2, TH * 0.45, TX + TW / 2, TY + TH / 2, TW * 0.62);
      ed.addColorStop(0, 'rgba(0,0,0,0)'); ed.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = ed; ctx.fillRect(TX - 10, TY - 10, TW + 20, TH + 20);
      ctx.globalCompositeOperation = 'screen';
      // broad soft sheen top-left
      const sh = ctx.createRadialGradient(TX + TW * 0.22, TY + TH * 0.12, 10, TX + TW * 0.22, TY + TH * 0.12, TW * 0.85);
      sh.addColorStop(0, 'rgba(200,220,210,0.07)'); sh.addColorStop(0.5, 'rgba(200,220,210,0.025)'); sh.addColorStop(1, 'rgba(200,220,210,0)');
      ctx.fillStyle = sh; ctx.fillRect(TX, TY, TW, TH);
      // window reflection (soft trapezoid) on the right
      ctx.filter = 'blur(36px)';
      const wr = ctx.createLinearGradient(TX + TW * 0.69, 0, TX + TW * 0.9, 0);
      wr.addColorStop(0, 'rgba(190,210,220,0)'); wr.addColorStop(0.5, 'rgba(190,210,220,0.04)'); wr.addColorStop(1, 'rgba(190,210,220,0)');
      ctx.fillStyle = wr;
      ctx.beginPath(); ctx.moveTo(TX + TW * 0.7, TY + 20); ctx.lineTo(TX + TW * 0.9, TY + 30); ctx.lineTo(TX + TW * 0.88, TY + TH * 0.42); ctx.lineTo(TX + TW * 0.69, TY + TH * 0.38); ctx.closePath(); ctx.fill();
      
      // thin specular arc along the top edge of the glass
      ctx.filter = 'blur(2px)';
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(TX + 60, TY + 14); ctx.quadraticCurveTo(TX + TW / 2, TY + 2, TX + TW - 60, TY + 14); ctx.stroke();
      ctx.filter = 'none';
      ctx.restore();

      // ---------- 6. bezel details: badge + power LED ----------
      ctx.save();
      ctx.font = '700 15px "Space Mono"'; ctx.textBaseline = 'middle';
      const by = TY + TH + 44;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText('NX-80  NEURAL TERMINAL', TX + 1, by + 1);
      ctx.fillStyle = '#8d877a'; ctx.fillText('NX-80  NEURAL TERMINAL', TX, by);
      ctx.font = '400 11px "Space Mono"'; ctx.fillStyle = '#5f5a50'; ctx.fillText('HIGH RESOLUTION  P1 PHOSPHOR', TX + 270, by + 1);
      // LED
      const lx = TX + TW - 30;
      const lg = ctx.createRadialGradient(lx, by, 0, lx, by, 22); lg.addColorStop(0, 'rgba(90,255,120,0.55)'); lg.addColorStop(1, 'rgba(90,255,120,0)');
      ctx.fillStyle = lg; ctx.fillRect(lx - 22, by - 22, 44, 44);
      ctx.fillStyle = '#b8ffc4'; ctx.beginPath(); ctx.arc(lx, by, 4, 0, 7); ctx.fill();
      ctx.fillStyle = '#5f5a50'; ctx.font = '400 11px "Space Mono"'; ctx.textAlign = 'right'; ctx.fillText('POWER', lx - 16, by + 1);
      // two knobs
      [lx - 120, lx - 170].forEach((kx) => {
        const kg = ctx.createRadialGradient(kx - 3, by - 4, 1, kx, by, 12); kg.addColorStop(0, '#5a564e'); kg.addColorStop(1, '#151412');
        ctx.fillStyle = kg; ctx.beginPath(); ctx.arc(kx, by, 11, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.strokeStyle = '#8d877a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(kx, by); ctx.lineTo(kx + 6, by - 7); ctx.stroke();
      });
      ctx.restore();
      // green spill from the screen onto the bezel lip
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const spill = ctx.createLinearGradient(0, TY + TH, 0, TY + TH + 30); spill.addColorStop(0, 'rgba(40,140,60,0.18)'); spill.addColorStop(1, 'rgba(40,140,60,0)');
      ctx.fillStyle = spill; ctx.fillRect(TX, TY + TH + 4, TW, 30);
      ctx.restore();
  }

  // ================= EXPLAINER: a terminal session explains "How does AI learn?" =================
  const ASCII_CAT = ['  /\\_/\\  ', ' ( o.o ) ', '  > ^ <  '];
  const ASCII_DOG = ['  / \\__  ', ' (    @\\_', ' /   ___O'];
  function crtExplainer(ctx, W, H_, t) {
    const fmt = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const ease = (a, d) => H.ease.inOut(H.clamp((t - a) / d));
    const typed = (str, a, cps = 28) => str.slice(0, Math.max(0, Math.floor((t - a) * cps)));
    const blinkOn = Math.floor(t * 2.2) % 2 === 0;
    let boost = 1;
    if (t > 7.55 && t < 7.75) boost = 1.45;        // phosphor flash on the wrong guess
    if (t > 12.45 && t < 12.6) boost = 1.3;        // and on 97%

    const paint = (s, TW, TH) => {
      s.font = '26px "VT323"';
      const cw = s.measureText('M').width, LH = 28;
      const txt = (str, x, y, font = '26px "VT323"', a = 1) => { s.font = font; s.globalAlpha = a; s.shadowColor = '#fff'; s.shadowBlur = 3; s.fillText(str, x, y); s.shadowBlur = 0; s.globalAlpha = 1; return s.measureText(str).width; };
      const inv = (str, x, y, font = '26px "VT323"') => { s.font = font; const w = s.measureText(str).width, h = parseInt(font) || 26; s.globalAlpha = 0.8; s.fillRect(x - 4, y, w + 8, h); s.globalAlpha = 1; s.globalCompositeOperation = 'destination-out'; s.fillText(str, x, y); s.lineWidth = Math.max(1, h / 30); s.strokeText(str, x, y); s.globalCompositeOperation = 'source-over'; return w; };
      const cursor = (x, y, h = 22) => { if (blinkOn) s.fillRect(x + 2, y + 3, h * 0.55, h); };
      const line = (pts, w = 2, a = 1) => { s.globalAlpha = a; s.lineWidth = w; s.beginPath(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.stroke(); s.globalAlpha = 1; };
      const partial = (pts, f) => { // cut a polyline to fraction f of its length
        if (f >= 1) return pts; let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        let left = L * Math.max(0, f); const out = [pts[0]];
        for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d >= left) { const k = d ? left / d : 0; out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]); break; } out.push(pts[i]); left -= d; }
        return out;
      };
      const arrowTo = (pts, f, w = 2) => { const p = partial(pts, f); line(p, w); if (f > 0.05 && p.length > 1) { const [x2, y2] = p[p.length - 1], [x1, y1] = p[p.length - 2]; const a = Math.atan2(y2 - y1, x2 - x1); line([[x2 + Math.cos(a + 2.5) * 13, y2 + Math.sin(a + 2.5) * 13], [x2, y2], [x2 + Math.cos(a - 2.5) * 13, y2 + Math.sin(a - 2.5) * 13]], w); } };
      const boxR = (x, y, w, h, f = 1, lw = 2) => line(partial([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], f), lw);
      const asciiPic = (rows, x, y) => rows.forEach((rw, i) => txt(rw, x, y + i * LH));

      // ---------- scene drawers (each in its own coordinates; the V-hold roll moves between them) ----------
      const scene1and2 = () => {
        const scroll = ease(2.05, 0.5) * 300;
        s.save(); s.translate(0, -scroll);
        // BEAT 1: the user asks the question; the machine echoes it big
        const q = '> how does ai learn?';
        const tq = typed(q, 0.1, 32);
        const qw = txt(tq, 40, 40, '52px "VT323"'); if (tq.length < q.length || t < 0.75) { if (blinkOn) s.fillRect(46 + qw, 46, 24, 42); }
        if (t > 0.75) {
          const big = 'HOW DOES AI LEARN?', bt = typed(big, 0.75, 30);
          txt(bt, 40, 150, '124px "VT323"');
          if (t > 1.4) txt('='.repeat(44), 40, 282, '32px "VT323"', 0.8);
        }
        // BEAT 2 (300px lower, scrolls into view): the training data stream
        s.translate(0, 300);
        const cmd = '$ train --data ./examples --labels';
        if (t > 2.1) txt(typed(cmd, 2.1, 70), 40, 30);
        if (t > 2.2) {
          const F32 = '32px "VT323"';
          // log of labelled examples, scrolling fast (labels are the story; filenames are texture)
          const n = Math.floor((t - 2.2) / 0.085);
          for (let k = 0; k < 7; k++) {
            const i = n - 6 + k; if (i < 0) continue;
            const isCat = (i * 7) % 3 !== 0, y = 70 + k * 36;
            const id = String(4800 + i * 37).padStart(7, '0');
            const w = inv(isCat ? 'cat' : 'dog', 44, y, F32);
            txt('img_' + id, 44 + w + 16, y, F32, k === 6 ? 1 : 0.45 + k * 0.07);
          }
          // the current example as an ASCII picture with its label landing under it
          const cur = Math.floor((t - 2.2) / 0.55), isCat = cur % 3 !== 2;
          boxR(410, 70, 250, 150, ease(2.2, 0.3));
          if (t > 2.4) { s.font = '38px "VT323"'; (isCat ? ASCII_CAT : ASCII_DOG).forEach((rw, i) => txt(rw, 428, 86 + i * 38, '38px "VT323"')); inv(isCat ? ' cat ' : ' dog ', 500, 226, '38px "VT323"'); }
          // marching arrow into the model
          if (t > 2.6) {
            const f = ease(2.6, 0.4);
            arrowTo([[670, 145], [790, 145]], f, 3);
            const m = Math.floor(t * 12) % 4;
            for (let k = 0; k < 4; k++) if (k !== m && f >= 1) txt('>', 690 + k * 22, 106, F32, 0.7);
          }
          // the model box
          if (t > 2.5) {
            boxR(800, 64, 250, 186, ease(2.5, 0.4), 3);
            if (t > 2.8) {
              inv(' MODEL ', 868, 50, '38px "VT323"');
              ['o   o   o', ' \\ / \\ / ', '  o   o  ', '   \\ /   ', '    o    '].forEach((rw, i) => txt(rw, 838, 98 + i * 30, F32));
            }
          }
          // counter: the hero number of this beat
          if (t > 2.8) {
            txt('EXAMPLES SEEN', 410, 262, '38px "VT323"');
            const v = 1e6 * Math.pow(H.clamp((t - 2.9) / 2.8), 2);
            txt(fmt(v), 410, 296, '110px "VT323"');
          }
        }
        s.restore();
      };
      const scene3 = () => {
        s.save(); s.translate(0, 34); s.scale(1.06, 1.06);
        txt('$ step --verbose', 40, 24, '30px "VT323"', 0.7);
        // loop indicator with the active phase in inverse video
        const phase = t < 7.5 ? 0 : t < 8.35 ? 1 : t < 9.4 ? 2 : 0;
        const names = ['GUESS', 'CHECK', 'ADJUST'];
        let x = 40;
        names.forEach((nm, i) => { const w = i === phase ? inv(' ' + nm + ' ', x, 68, '38px "VT323"') : txt(' ' + nm + ' ', x, 68, '38px "VT323"', 0.6); x += w + 14; if (i < 2) { x += txt('->', x, 68, '38px "VT323"', 0.6) + 14; } });
        txt('<- repeat', x + 6, 68, '38px "VT323"', 0.6);
        // picture + model boxes
        boxR(40, 140, 210, 130); ASCII_CAT.forEach((rw, i) => txt(rw, 54, 150 + i * 36, '38px "VT323"')); txt('new picture', 50, 278, '32px "VT323"', 0.8);
        boxR(470, 130, 250, 200); inv(' MODEL ', 552, 118);
        // weights inside the model (digits roll while adjusting)
        const W0 = [0.42, -1.3, 0.77], W1 = [0.57, -0.86, 0.31];
        const adj = H.clamp((t - 8.55) / 0.75);
        W0.forEach((w0, i) => {
          let v = H.lerp(w0, W1[i], adj);
          if (adj > 0 && adj < 1) v += (H.rng(Math.floor(t * 20) + i)() - 0.5) * 0.4;
          const str = 'w' + (i + 1) + ' = ' + (v >= 0 ? ' ' : '') + v.toFixed(2);
          txt(str, 492, 160 + i * 44, '40px "VT323"', adj > 0 && adj < 1 ? 1 : 0.85);
        });
        // GUESS arrow
        arrowTo([[260, 200], [460, 200]], ease(6.7, 0.4)); if (t > 6.8) txt('guess', 312, 160, '34px "VT323"', 0.9);
        const out1 = t > 7.05 && t < 9.4, out2 = t > 9.7;
        if (t > 6.95) arrowTo([[730, 200], [800, 200]], ease(6.95, 0.2));
        if (out1) {
          txt('dog?', 815, 172, '64px "VT323"');
          if (t > 7.5) { // CHECK: wrong
            line([[810, 172], [930, 236]], 4); line([[930, 172], [810, 236]], 4);
            if (t > 8.2 || Math.floor((t - 7.5) * 6) % 2 === 0) inv(" WRONG: IT'S A CAT ", 680, 262, '38px "VT323"');
          }
        }
        // ADJUST: error travels back underneath into the model
        if (t > 8.35) {
          const path = [[870, 300], [870, 380], [600, 380], [600, 340]];
          arrowTo(path, ease(8.35, 0.55));
          if (t > 8.5) txt('error', 690, 388, '34px "VT323"');
        }
        if (out2) {
          txt('cat', 815, 172, '64px "VT323"');
          if (t > 9.95) { line([[905, 205], [920, 222], [950, 178]], 4); txt('[ OK ]', 815, 262, '38px "VT323"'); }
        }
        txt('round ' + String(1 + Math.floor(Math.max(0, t - 6.4) * 2.2)).padStart(3, '0'), 40, 430, '32px "VT323"', 0.7);
        s.restore();
      };
      const scene4 = () => {
        txt('$ plot accuracy --rounds 12', 40, 30);
        const ox = 90, oy = 400, ah = 290, bw = 40;
        line([[ox, oy - ah - 10], [ox, oy], [ox + 12 * (bw + 12) + 10, oy]], 2);
        txt('100%', 26, oy - ah - 14, '28px "VT323"', 0.8); txt(' 50%', 26, oy - ah / 2 - 14, '28px "VT323"', 0.8);
        txt('training rounds ->', ox + 260, oy + 8, '32px "VT323"', 0.8);
        const acc = (i) => 97 - 36 * Math.exp(-i / 3.2);
        const nb = H.clamp((t - 11.0) / 1.4) * 12;
        for (let i = 0; i < 12; i++) {
          const g = H.clamp(nb - i); if (g <= 0) break;
          const h = ((acc(i) - 0) / 100) * ah * H.ease.out(g);
          s.globalAlpha = 0.7; for (let y = oy - 4; y > oy - h; y -= 8) s.fillRect(ox + 12 + i * (bw + 12), y - 5, bw, 6); s.globalAlpha = 1; // block characters, stacked
        }
        const val = Math.round(61 + 36 * H.ease.out(H.clamp((t - 11.0) / 1.4)));
        txt('ACCURACY', 760, 100, '40px "VT323"');
        const vs = val + '%';
        if (t > 12.45 && (t > 12.95 || Math.floor((t - 12.45) * 8) % 2 === 0)) { inv(vs, 760, 140, '120px "VT323"'); }
        else txt(vs, 760, 140, '120px "VT323"');
        txt('61% -> ' + val + '%', 764, 262, '38px "VT323"', 0.85);
        if (t > 12.5) { arrowTo([[750, 210], [ox + 11 * (bw + 12) + 40, oy - ((acc(11)) / 100) * ah + 10]], ease(12.5, 0.3)); }
        if (t > 13.0) {
          const tk = '> MORE EXAMPLES -> BETTER GUESSES', ts = typed(tk, 13.0, 55);
          txt(ts, 40, 458, '56px "VT323"'); if (ts.length < tk.length || blinkOn) s.fillRect(40 + s.measureText(ts).width + 6, 464, 26, 44);
        }
      };
      // ---------- V-hold roll transitions between scenes ----------
      const roll = (a, d, from, to) => {
        const k = H.ease.inOut(H.clamp((t - a) / d)), off = k * (TH + 60);
        s.save(); s.translate(0, -off); from(); s.restore();
        s.save(); s.translate(0, TH + 60 - off); to(); s.restore();
        s.fillStyle = '#000'; s.fillRect(0, TH - off - 4, TW, 64); s.fillStyle = '#fff'; // blanking bar
      };
      if (t < 6.1) scene1and2();
      else if (t < 6.55) roll(6.1, 0.45, scene1and2, scene3);
      else if (t < 10.5) scene3();
      else if (t < 10.95) roll(10.5, 0.45, scene3, scene4);
      else scene4();
      // status line (inverse video): the question lives here once asked
      s.globalAlpha = 0.8; s.fillRect(36, TH - 44, TW - 72, 30); s.globalAlpha = 1;
      s.globalCompositeOperation = 'destination-out'; s.font = '30px "VT323"'; s.letterSpacing = '1px';
      const beat = t < 2.5 ? 'READY' : t < 6.3 ? 'DATA' : t < 10.7 ? 'TRAINING LOOP' : 'RESULTS';
      const stl = ' NX-80 ' + (t > 1.9 ? '  Q: HOW DOES AI LEARN?' : '') + '   ' + beat;
      s.fillText(stl, 46, TH - 44); s.lineWidth = 1; s.strokeText(stl, 46, TH - 44);
      s.globalCompositeOperation = 'source-over'; s.letterSpacing = '0px';
    };
    crtCompose(ctx, W, H_, t, paint, 5, boost);
  }

  // ================= SOUND: a green-screen terminal in a quiet room. Mains hum from the tube, a heavy buckling-spring
  // keyboard for typed lines, soft relay ticks as the data log scrolls, an electron-beam crackle when lines are drawn,
  // V-hold rolls as a sagging hum surge with static, and the terminal bell for the hits. Times copied from crtExplainer.
  function crtSound(k) {
    const END = 14.5;
    const px = (x) => H.clamp(x / 1088) * 1.4 - 0.7; // tube x (0..1088) -> pan
    const sq = (t, f, dur, gain, o) => k.tone(t, Object.assign({ f, type: 'square', dur, gain, a: 0.002, hold: dur * 0.6, filter: 'lowpass', f2: 1800 }, o));
    // buckling-spring key: snap + low case thock
    const key = (t, p = 0, g = 1) => { k.noise(t, { dur: 0.02, filter: 'bandpass', f: 2300, q: 1.6, gain: 0.22 * g, a: 0.001, pan: p, minor: true }); k.noise(t + 0.006, { dur: 0.05, color: 'brown', filter: 'lowpass', f: 600, gain: 0.3 * g, a: 0.002, pan: p, minor: true }); k.tone(t, { f: 150, dur: 0.04, gain: 0.08 * g, a: 0.001, pan: p, minor: true }); };
    const enter = (t, p = 0) => { key(t, p, 1.4); k.noise(t + 0.03, { dur: 0.06, color: 'brown', filter: 'lowpass', f: 400, gain: 0.25, pan: p }); };
    // typing a line: a typist's pace (~11 keys/s) over the stretch the characters appear
    const typeLine = (t0, dur, p = 0) => { const r = H.rng(Math.round(t0 * 100)); for (let t = t0; t < t0 + dur - 0.02; t += 0.07 + r() * 0.04) key(t, p, 0.75 + r() * 0.35); };
    // terminal output printing (no keyboard): a soft tick per few glyphs
    const out = (t0, dur, p = 0) => { for (let t = t0; t < t0 + dur - 0.02; t += 0.09) k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1200, q: 3, gain: 0.12, a: 0.001, pan: p, minor: true }); };
    // electron beam tracing a line on the phosphor: thin crackle that follows the draw
    const beam = (t, dur, p0 = 0, p1 = 0) => k.noise(t, { dur, filter: 'bandpass', f: [[0, 1400], [dur, 2000]], q: 3, gain: 0.07, a: dur * 0.2, hold: dur * 0.5, pan: (p0 + p1) / 2, minor: true });
    // V-hold roll a -> a+d: hum sags and surges, static rides the blanking bar, raster locks with a thump
    const roll = (a, d) => {
      k.tone(a, { f: [[0, 62], [d * 0.5, 44], [d, 60]], type: 'sawtooth', dur: d + 0.08, gain: 0.08, a: d * 0.3, hold: d * 0.3, filter: 'lowpass', f2: 380 });
      k.noise(a, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 500], [d * 0.5, 1600], [d, 400]], q: 1.1, gain: 0.08, a: d * 0.45 });
      k.play('thud', a + d, { f: 85, gain: 0.25 });
    };
    // phosphor flash: high-voltage zap
    const zap = (t, g = 1) => { k.noise(t, { dur: 0.14, filter: 'highpass', f: 1800, gain: 0.16 * g, a: 0.001 }); k.play('thud', t, { f: 95, gain: 0.5 * g }); };
    // terminal bell (kept low: VT bells are mid-range)
    const bell = (t, f, g = 1, p = 0) => { k.tone(t, { f, type: 'triangle', dur: 0.5, gain: 0.16 * g, a: 0.002, verb: 0.15, pan: p }); k.tone(t, { f: k.hz(f) * 2, dur: 0.25, gain: 0.04 * g, a: 0.002, pan: p }); };

    k.bed('hum', 0, END, { gain: 0.55 });
    k.bed('room', 0, END, { gain: 0.6 });

    // ---- BEAT 1: user types the question (0.1, 32 cps, 20 chars), Enter, machine echoes it big (0.75, 30 cps, 18 chars)
    typeLine(0.1, 0.63, -0.5);
    enter(0.75, -0.3);
    out(0.78, 0.57, -0.1);
    k.play('thud', 1.4, { f: 70, gain: 0.2 });                              // '====' rule
    sq(1.9, 'A3', 0.06, 0.04, { pan: -0.4 });                              // status line takes the question
    // scroll down to the data screen (2.05-2.55): a smooth low slide
    k.noise(2.05, { dur: 0.5, color: 'brown', filter: 'lowpass', f: [[0, 250], [0.25, 700], [0.5, 250]], gain: 0.12, a: 0.22 });

    // ---- BEAT 2: '$ train ...' typed (2.1, 70 cps), Enter, log streams (a line every 0.085 s from 2.2)
    typeLine(2.1, 0.45, -0.5);
    enter(2.55, -0.5);
    for (let i = 1; (2.2 + i * 0.085) < 6.1; i++) { const t = 2.2 + i * 0.085; k.noise(t, { dur: 0.01, filter: 'bandpass', f: 900, q: 4, gain: 0.1, a: 0.001, pan: -0.6, minor: true }); }
    beam(2.2, 0.3, px(410), px(660));                                      // picture box draws
    beam(2.5, 0.4, px(800), px(1050));                                     // model box draws
    beam(2.6, 0.4, px(670), px(790));                                      // arrow into the model
    sq(2.8, 'D3', 0.08, 0.05, { pan: px(950) });                           // inverse ' MODEL ' tag
    // each new example + label lands every 0.55 s: relay clunk
    for (let t = 2.75; t < 6.1; t += 0.55) k.play('tock', t, { f: 260, gain: 0.45, pan: px(530), minor: true });
    // EXAMPLES SEEN counter (2.9-5.7, accelerating): ticks closing in, at most 12/s
    for (let t = 2.95; t < 5.65;) { k.noise(t, { dur: 0.016, filter: 'bandpass', f: 2000, q: 2, gain: 0.13, a: 0.001, pan: px(500), minor: true }); t += H.lerp(0.25, 1 / 12, (t - 2.9) / 2.8); }
    bell(5.7, 'E4', 0.9, px(500));                                          // lands on 1,000,000
    roll(6.1, 0.45);

    // ---- BEAT 3: guess arrow (6.7-7.1), dog? (7.05)
    beam(6.7, 0.4, px(260), px(460)); beam(6.95, 0.2, px(730), px(800));
    sq(7.05, 'G3', 0.1, 0.05, { pan: px(860) });
    // CHECK (7.5): the X, the inverse WRONG label and a phosphor flash at 7.55 -> bell clash + zap
    sq(7.5, 'A3', 0.32, 0.1, { hold: 0.22, f2: 1400, pan: px(860) }); sq(7.5, 'Bb3', 0.32, 0.08, { hold: 0.22, f2: 1400, pan: px(860) });
    zap(7.55, 1.2);
    // ADJUST (8.35): error path drawn back (8.35-8.9); weights roll their digits 8.55-9.3
    sq(8.35, 'D3', 0.06, 0.04, { pan: -0.2 });
    beam(8.35, 0.55, px(870), px(600));
    for (let t = 8.56; t < 9.3; t += 1 / 12) k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1600, q: 3, gain: 0.12, a: 0.001, pan: px(560), minor: true });
    sq(9.3, 'A3', 0.08, 0.04, { pan: px(560) });                           // weights settle
    sq(9.4, 'D3', 0.06, 0.04, { pan: -0.4 });                              // GUESS again
    sq(9.7, 'G3', 0.08, 0.045, { pan: px(860) });                          // 'cat'
    // [ OK ] + check (9.95): the correction, a clean two-note bell
    bell(9.95, 'E4', 0.9, px(860)); bell(10.05, 'A4', 0.9, px(860));
    roll(10.5, 0.45);

    // ---- BEAT 4: 12 bars rise (11.0 + i*0.117), % climbs with them
    k.withMinor(() => { for (let i = 0; i < 12; i++) sq(11.0 + i * (1.4 / 12), 160 * Math.pow(2, i / 10), 0.07, 0.045, { f2: 1000, pan: px(100 + i * 52) }); });
    // 97% (12.45): inverse flip + phosphor flash, the biggest hit. bell chord over a deep thump and zap
    const P = 12.45;
    zap(P, 1.6); bell(P, 'C4', 1.8, px(820)); bell(P, 'E4', 1.5, px(820)); bell(P, 'G4', 1.5, px(820)); bell(P + 0.08, 'C5', 1.4, px(820));
    k.tone(P, { f: 'C2', dur: 0.8, gain: 0.3, a: 0.004, hold: 0.15 });
    beam(12.5, 0.3, px(750), px(640));
    // ---- BEAT 5: takeaway typed (13.0, 55 cps, 33 chars -> 13.6) and lands with a soft resolving bell
    typeLine(13.0, 0.6, -0.3);
    bell(13.62, 'G3', 0.7); bell(13.74, 'C4', 0.9);
  }

  registerStyle({
    id: 'crt-terminal',
    name: 'Phosphor Terminal',
    category: 'Retro Digital',
    description: 'A green P1-phosphor CRT: VT323 boot log with bloom and halation, curved scanlines, true per-pixel barrel distortion with RGB fringing at the edges, tube vignette, hum bar, and a glass face catching the room light inside a plastic bezel.',
    motion: 'The tube powers on (dot, then a bright line that snaps open into a flashing raster that settles as the phosphor warms), then the boot log types at terminal speed, the trace sweeps, the greeting prints and the cursor blinks while a hum bar rolls.',
    duration: 6,
    fonts: ['26px "VT323"', '92px "VT323"', '700 15px "Space Mono"', '400 11px "Space Mono"'],
    frameT: 5.8,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'Explains as a live terminal session: the typed question scrolls away and lives on in the inverse-video status line, a labelled data log streams into a box-drawn MODEL, V-hold rolls carry us between screens, arrows and the error path are phosphor line-drawings, and counters are big VT323 numerals that flip in inverse video for emphasis.',
    explainer(ctx, W, H_, t) { crtExplainer(ctx, W, H_, t); },
    explainerSound(k) { crtSound(k); },
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(5);
      // same tube pipeline as the explainer: bezel, barrel remap, bloom, glass
      const paint = (s, TW, TH) => {
        // ---------- 2. SOURCE SCREEN (flat, pre-distortion) in phosphor intensity ----------
        s.shadowColor = '#fff'; s.shadowBlur = 3;
        const ox = 64, oy = 36, lh = 28;
        const cps = 200; // chars per second
        let budget = Math.max(0, (t - 1.0) * cps), lastX = ox, lastY = oy, done = true;
        s.font = '26px "VT323"';
        for (let i = 0; i < LINES.length; i++) {
          let [txt, kind] = LINES[i];
          if (kind === 2) {
            const prog = H.clamp((t - 1.55) / 0.9);
            const n = 24, f = Math.round(prog * n);
            txt = txt.replace('[BAR]', '[' + '█'.repeat(f) + '·'.repeat(n - f) + '] ' + String(Math.round(prog * 100)).padStart(3, ' ') + '%');
          }
          const shown = txt.slice(0, Math.floor(budget));
          budget -= txt.length + 14; // a short pause at each line end
          s.globalAlpha = kind === 1 && shown.endsWith('ok') ? 0.75 : 1;
          s.globalAlpha = kind === 0 && i < 2 ? 0.8 : kind === 2 ? 0.62 : s.globalAlpha;
          s.fillText(shown, ox, oy + i * lh);
          if (shown.length < txt.length) { lastX = ox + s.measureText(shown).width; lastY = oy + i * lh; done = false; break; }
          lastX = ox + s.measureText(shown).width; lastY = oy + i * lh;
        }
        s.globalAlpha = 1;
        // big greeting, typed after the log
        const big = 'HELLO. I AM AWAKE.';
        if (done) {
          const bt = Math.floor(Math.max(0, budget) * 0.16);
          const bshown = big.slice(0, bt);
          s.font = '92px "VT323"'; s.shadowBlur = 8;
          s.fillText(bshown, ox, oy + 11 * lh + 14);
          const bw = s.measureText(bshown).width;
          if (bt >= big.length) {
            s.font = '26px "VT323"'; s.shadowBlur = 3;
            s.globalAlpha = 0.85; s.fillText('='.repeat(Math.round(s.measureText(big).width / 13 * 0.0 + 46)), ox, oy + 11 * lh + 100); s.globalAlpha = 1;
            s.fillText('> ', ox, oy + 11 * lh + 136);
            lastX = ox + 26; lastY = oy + 11 * lh + 136;
          } else { lastX = ox + bw + 6; lastY = oy + 11 * lh + 14; }
        }
        // right-hand panel: cortex activity trace (vector-ish box with corner brackets)
        {
          const px0 = 700, py0 = 44, pw = 330, ph = 210;
          s.globalAlpha = 0.9; s.font = '26px "VT323"'; s.shadowBlur = 3;
          s.fillText('CORTEX ACTIVITY', px0 + 12, py0 - 2);
          s.strokeStyle = '#fff'; s.lineWidth = 2;
          const br = (x, y, dx, dy) => { s.beginPath(); s.moveTo(x + dx * 18, y); s.lineTo(x, y); s.lineTo(x, y + dy * 18); s.stroke(); };
          br(px0, py0 + 26, 1, 1); br(px0 + pw, py0 + 26, -1, 1); br(px0, py0 + ph, 1, -1); br(px0 + pw, py0 + ph, -1, -1);
          s.globalAlpha = 0.25; s.lineWidth = 1;
          for (let gx = 1; gx < 6; gx++) { s.beginPath(); for (let gy = py0 + 34; gy < py0 + ph - 6; gy += 6) { s.moveTo(px0 + gx * pw / 6, gy); s.lineTo(px0 + gx * pw / 6, gy + 2); } s.stroke(); }
          s.globalAlpha = 1; s.lineWidth = 2.2; s.shadowBlur = 6;
          const prog = H.clamp((t - 1.2) / 2.6);
          s.beginPath();
          for (let x = 0; x <= pw - 20; x += 2) {
            if (x / (pw - 20) > prog) break;
            const k = x / (pw - 20);
            const amp = 6 + 46 * H.smooth(0.55, 0.95, k);
            const y = py0 + 26 + (ph - 26) / 2 + Math.sin(x * 0.11 + t * 6) * amp * 0.6 + nz.n2(x * 0.06, t) * amp;
            if (x === 0) s.moveTo(px0 + 10 + x, y); else s.lineTo(px0 + 10 + x, y);
          }
          s.stroke();
          s.shadowBlur = 3; s.font = '26px "VT323"';
          s.fillText('SIGNAL ' + String(Math.round(prog * 97 + 2)).padStart(3, ' ') + '%   T+' + t.toFixed(2), px0 + 12, py0 + ph + 8);
          s.globalAlpha = 1;
        }
        // block cursor (blinks at ~2Hz)
        if (Math.floor(t * 2.2) % 2 === 0) { s.shadowBlur = 6; const big2 = lastY > oy + 11 * lh && lastY < oy + 11 * lh + 40; s.fillRect(lastX + 2, lastY + 3, big2 ? 40 : 13, big2 ? 74 : 22); }
        s.shadowBlur = 0;
        // status line at bottom (inverse video)
        s.globalAlpha = 0.8; s.fillRect(36, TH - 44, TW - 72, 30); s.globalAlpha = 1;
        s.globalCompositeOperation = 'destination-out'; s.font = '30px "VT323"'; s.letterSpacing = '1px';
        const stl = ' NX-80   SESSION 01   9600 BAUD   ONLINE   ' + '00:0' + Math.floor(t) + ':' + String(Math.floor(t * 60) % 60).padStart(2, '0') + '   CAPS';
        s.fillText(stl, 46, TH - 44); s.lineWidth = 1; s.strokeText(stl, 46, TH - 44);
        s.globalCompositeOperation = 'source-over'; s.letterSpacing = '0px';
      };
      crtCompose(ctx, W, H_, t, paint, t - 0.25, 1);
    },
  });
}
