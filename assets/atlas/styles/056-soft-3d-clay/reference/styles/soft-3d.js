{
  // ---------- soft "clay" 3D faked in 2D: extrusion + gradient face + inner shadows + rim + specular ----------
  // rounded polygon with per-vertex radius (pts: [x,y,r])
  function roundedPoly(pts) {
    const p = new Path2D();
    const n = pts.length;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const start = mid(pts[n - 1], pts[0]);
    p.moveTo(start[0], start[1]);
    for (let i = 0; i < n; i++) {
      const c = pts[i], nx = pts[(i + 1) % n];
      const m = mid(c, nx);
      p.arcTo(c[0], c[1], m[0], m[1], c[2] || 0);
    }
    p.closePath();
    return p;
  }
  // inner shadow: the casting fill is pushed far off-canvas in device space so only its shadow lands (no hairline)
  function innerShadow(ctx, path, rule, bb, color, blur, dx, dy) {
    const OFF = 5000;
    ctx.save();
    ctx.clip(path, rule);
    const p2 = new Path2D();
    const m = 400;
    p2.rect(bb[0] - m, bb[1] - m, bb[2] - bb[0] + 2 * m, bb[3] - bb[1] + 2 * m);
    p2.addPath(path);
    const M = ctx.getTransform();
    ctx.setTransform(new DOMMatrix().translate(OFF, 0).multiply(M));
    ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.shadowOffsetX = dx - OFF; ctx.shadowOffsetY = dy;
    ctx.fillStyle = '#000';
    ctx.fill(p2, 'evenodd');
    ctx.restore();
  }
  let EXT = null;
  // o: {x,y,rot,s, path, rule, bb, face:[light,mid,dark], side:[light,dark], ext:[ex,ey], spec:[x,y,rx,ry]}
  function puffy(ctx, o) {
    const rule = o.rule || 'nonzero';
    const [ex, ey] = o.ext;
    const n = Math.ceil(Math.hypot(ex, ey) * 1.5);
    const W = ctx.canvas.width, Hh = ctx.canvas.height;
    const base = ctx.getTransform();
    let lc = ctx;
    if (!o.fast) {
      if (!EXT || EXT.width !== W) EXT = H.layer(W, Hh);
      lc = EXT.getContext('2d');
      lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, W, Hh);
    } else ctx.save();
    const bounce = H.mix(o.side[0], '#ffffff', 0.35);
    for (let i = n; i >= 1; i--) {
      const k = i / n;
      lc.setTransform(base); lc.translate(o.x + ex * k, o.y + ey * k); lc.rotate(o.rot || 0); lc.scale(o.s, o.s);
      const c = k > 0.86 ? H.mix(o.side[1], bounce, (k - 0.86) / 0.14) : k < 0.25 ? H.mix(o.face[2], o.side[0], k / 0.25) : H.mix(o.side[0], o.side[1], (k - 0.25) / 0.61);
      lc.fillStyle = H.rgba(c);
      lc.fill(o.path, rule);
    }
    if (!o.fast) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'blur(1.4px)'; ctx.drawImage(EXT, 0, 0); ctx.restore(); }
    else { ctx.restore(); ctx.setTransform(base); }
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot || 0); ctx.scale(o.s, o.s);
    const bb = o.bb;
    const g = ctx.createLinearGradient(bb[0], bb[1], bb[2], bb[3]);
    g.addColorStop(0, H.rgba(o.face[0])); g.addColorStop(0.5, H.rgba(o.face[1])); g.addColorStop(1, H.rgba(o.face[2]));
    ctx.fillStyle = g; ctx.fill(o.path, rule);
    const S = o.s * Math.hypot(base.a, base.b);
    innerShadow(ctx, o.path, rule, bb, H.rgba(o.side[1], 0.5), 40 * S, -16 * S, -20 * S); // core shadow toward bottom-right
    innerShadow(ctx, o.path, rule, bb, H.rgba(o.side[0], 0.35), 14 * S, 0, 0);            // rounded falloff at every edge
    innerShadow(ctx, o.path, rule, bb, 'rgba(255,255,255,0.72)', 26 * S, 12 * S, 14 * S);  // soft top-left highlight
    if (o.spec) {
      ctx.save(); ctx.clip(o.path, rule);
      const [sx, sy, rx, ry] = o.spec;
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, rx);
      sg.addColorStop(0, 'rgba(255,255,255,0.95)'); sg.addColorStop(0.35, 'rgba(255,255,255,0.45)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.translate(sx, sy); ctx.scale(1, ry / rx); ctx.translate(-sx, -sy);
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, sy, rx, 0, 7); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  function sphere(ctx, x, y, r, light, mid, dark) {
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r * 1.05);
    g.addColorStop(0, H.rgba(light)); g.addColorStop(0.55, H.rgba(mid)); g.addColorStop(1, H.rgba(dark));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    const p = new Path2D(); p.arc(x, y, r, 0, 7);
    innerShadow(ctx, p, 'nonzero', [x - r, y - r, x + r, y + r], H.rgba(H.mix(light, '#ffffff', 0.5), 0.8), r * 0.12, -r * 0.05, -r * 0.06);
    const s = ctx.createRadialGradient(x - r * 0.38, y - r * 0.45, 0, x - r * 0.38, y - r * 0.45, r * 0.42);
    s.addColorStop(0, 'rgba(255,255,255,0.9)'); s.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = s; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  function contactShadow(ctx, x, y, w, h, alpha, blur) {
    ctx.save(); ctx.filter = `blur(${blur}px)`;
    ctx.fillStyle = `rgba(110,80,170,${alpha})`;
    ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, 0, 7); ctx.fill();
    ctx.filter = `blur(${blur * 0.4}px)`; ctx.fillStyle = `rgba(90,60,150,${alpha * 0.8})`;
    ctx.beginPath(); ctx.ellipse(x, y, w * 0.55, h * 0.45, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  // ---------- shapes (local coords) ----------
  const bubblePath = () => roundedPoly([[-170, -115, 78], [170, -115, 78], [170, 95, 70], [-40, 95, 22], [-120, 160, 12], [-100, 95, 16], [-170, 95, 60]]);
  const BUBBLE_BB = [-170, -115, 170, 160];
  function gearPath(R, teeth, holeR) {
    const pts = [];
    const r0 = R * 0.78;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2, w = (Math.PI * 2) / teeth;
      pts.push([Math.cos(a - w * 0.5) * r0, Math.sin(a - w * 0.5) * r0, R * 0.12]);
      pts.push([Math.cos(a - w * 0.2) * R, Math.sin(a - w * 0.2) * R, R * 0.1]);
      pts.push([Math.cos(a + w * 0.2) * R, Math.sin(a + w * 0.2) * R, R * 0.1]);
    }
    const p = roundedPoly(pts);
    p.moveTo(holeR, 0); p.arc(0, 0, holeR, 0, Math.PI * 2, true); p.closePath();
    return p;
  }
  const cursorPath = () => roundedPoly([[0, 0, 10], [0, 150, 12], [38, 114, 8], [64, 168, 10], [92, 154, 10], [66, 102, 8], [114, 102, 12]]);
  const CURSOR_BB = [0, 0, 114, 168];
  function bulbGlassPath(r) {
    const p = new Path2D();
    // glass: big circle flowing into a neck
    p.moveTo(-r * 0.5, r * 0.95);
    p.bezierCurveTo(-r * 0.55, r * 0.6, -r, r * 0.45, -r, -0.05 * r);
    p.arc(0, -0.05 * r, r, Math.PI, 0);
    p.bezierCurveTo(r, r * 0.45, r * 0.55, r * 0.6, r * 0.5, r * 0.95);
    p.closePath();
    return p;
  }
  function ringPath(R, r) {
    const p = new Path2D();
    p.ellipse(0, 0, R, R * 0.42, 0, 0, Math.PI * 2);
    p.moveTo(r, 0); p.ellipse(0, 0, r, r * 0.36, 0, 0, Math.PI * 2, true);
    return p;
  }

  // ================= EXPLAINER: a wide pastel set the camera dollies across (with parallax), clay props springing in =================
  const HX = (h) => H.hex(h);
  const PAL = {
    lav: { face: [HX('#e6e0ff'), HX('#b9abff'), HX('#9a88f5')], side: [HX('#8f7cf0'), HX('#5d48c2')] },
    peach: { face: [HX('#fff0e6'), HX('#ffcfb3'), HX('#ffad8a')], side: [HX('#f79d7a'), HX('#cf6b4f')] },
    mint: { face: [HX('#e6fff6'), HX('#b3eedb'), HX('#86d7bf')], side: [HX('#7fcbb3'), HX('#4f9f8a')] },
    white: { face: [HX('#ffffff'), HX('#f7f3ff'), HX('#e2d9fb')], side: [HX('#d4c8f5'), HX('#9a87de')] },
    pink: { face: [HX('#ffe3ea'), HX('#ffb1c2'), HX('#ff8fa8')], side: [HX('#f57f9b'), HX('#cc4f72')] },
    blue: { face: [HX('#e3f1ff'), HX('#b4d6ff'), HX('#8fbaf5')], side: [HX('#86b0ee'), HX('#5a7fc7')] },
    coral: { face: [HX('#ffd9d2'), HX('#ff8f7e'), HX('#f2675a')], side: [HX('#e85d4f'), HX('#b23a33')] },
    butter: { face: [HX('#fffbe0'), HX('#ffe58f'), HX('#f7c45e')], side: [HX('#f2b955'), HX('#d98f3a')] },
  };
  const pill = (w, h) => roundedPoly([[-w / 2, -h / 2, h / 2], [w / 2, -h / 2, h / 2], [w / 2, h / 2, h / 2], [-w / 2, h / 2, h / 2]]);
  const rrect = (w, h, r) => roundedPoly([[-w / 2, -h / 2, r], [w / 2, -h / 2, r], [w / 2, h / 2, r], [-w / 2, h / 2, r]]);
  function clay(ctx, path, bb, x, y, pal, o = {}) {
    puffy(ctx, { x, y, rot: o.rot || 0, s: o.s || 1, path, bb, face: pal.face, side: pal.side, ext: o.ext || [6, 11], spec: o.spec, fast: o.fast, z: o.z });
  }
  function clayPet(ctx, kind, x, y, r) {
    const fur = kind === 'cat' ? [HX('#efeaff'), HX('#c4b8ff'), HX('#9a88f5')] : [HX('#fff1e2'), HX('#ffcf9e'), HX('#e9a46a')];
    ctx.save();
    if (kind === 'cat') for (const sx of [-1, 1]) { const g = ctx.createLinearGradient(x, y - r * 1.2, x, y); g.addColorStop(0, H.rgba(fur[0])); g.addColorStop(1, H.rgba(fur[2])); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + sx * 0.88 * r, y - 0.15 * r); ctx.quadraticCurveTo(x + sx * 0.8 * r, y - 1.25 * r, x + sx * 0.6 * r, y - 1.12 * r); ctx.quadraticCurveTo(x + sx * 0.3 * r, y - 0.95 * r, x + sx * 0.1 * r, y - 0.8 * r); ctx.closePath(); ctx.fill(); }
    else for (const sx of [-1, 1]) { ctx.fillStyle = H.rgba(H.mix(fur[2], '#8a5a3b', 0.3)); ctx.beginPath(); ctx.ellipse(x + sx * 0.9 * r, y + 0.05 * r, 0.3 * r, 0.62 * r, sx * 0.35, 0, 7); ctx.fill(); }
    sphere(ctx, x, y, r, fur[0], fur[1], fur[2]);
    ctx.fillStyle = '#3b2f5c';
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + sx * 0.36 * r, y - 0.08 * r, r * 0.1, r * 0.14, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + sx * 0.36 * r - r * 0.03, y - 0.13 * r, r * 0.035, 0, 7); ctx.fill(); ctx.fillStyle = '#3b2f5c'; }
    ctx.fillStyle = 'rgba(255,120,150,0.45)'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + sx * 0.6 * r, y + 0.22 * r, r * 0.15, r * 0.09, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = kind === 'cat' ? '#ff8fa8' : '#3b2f5c'; ctx.beginPath(); ctx.ellipse(x, y + 0.2 * r, r * (kind === 'cat' ? 0.09 : 0.16), r * (kind === 'cat' ? 0.07 : 0.11), 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  function clayLabel(ctx, x, y, text, pal, o = {}) {
    const k = o.k ?? 1; if (k <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.font = o.font || '700 28px "Fredoka"';
    const fsz = parseInt((ctx.font.match(/(\d+)px/) || [0, 28])[1]);
    const w = ctx.measureText(text).width + (o.padX || fsz * 1.5), h = o.h || Math.round(fsz * 1.8);
    clay(ctx, pill(w, h), [-w / 2, -h / 2, w / 2, h / 2], 0, 0, pal, { ext: [3, 6], fast: true, z: o.z });
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const col = o.col || '#4a3a8a';
    if (col === '#fff') { ctx.fillStyle = 'rgba(70,45,170,0.32)'; ctx.fillText(text, fsz * 0.06, 2 + fsz * 0.09); } // pressed-in ink shadow, like the bubble text
    else { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillText(text, 0, 3.5); }                                 // dark text: soft lower highlight (debossed)
    ctx.fillStyle = col; ctx.fillText(text, 0, 2);
    ctx.restore();
  }
  function clayTube(ctx, a, c, b, prog, pal, w = 14) {
    if (prog <= 0) return null;
    const q = (u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
    const N = 36, pts = []; for (let i = 0; i <= N; i++) pts.push(q(prog * i / N * 0.93));
    const path = (off) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0] + off[0], p[1] + off[1]) : ctx.moveTo(p[0] + off[0], p[1] + off[1])); };
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(90,60,150,0.18)'; ctx.lineWidth = w; path([3, 7]); ctx.stroke();
    ctx.strokeStyle = H.rgba(pal.side[1]); ctx.lineWidth = w; path([0, 0]); ctx.stroke();
    ctx.strokeStyle = H.rgba(pal.face[1]); ctx.lineWidth = w * 0.72; path([-w * 0.1, -w * 0.12]); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = w * 0.2; path([-w * 0.2, -w * 0.25]); ctx.stroke();
    const e = q(prog), e0 = q(Math.max(0, prog - 0.05)), ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
    ctx.restore();
    const hp = roundedPoly([[w * 1.3, 0, w * 0.35], [-w * 0.9, -w * 1.15, w * 0.35], [-w * 0.9, w * 1.15, w * 0.35]]);
    clay(ctx, hp, [-w, -w, w, w], e[0], e[1], pal, { rot: ang, ext: [3, 6], fast: true });
    return q;
  }
  let FG_SPHERE = null;
  function fgSphere() { // the hero's blurred foreground sphere, baked once
    if (FG_SPHERE) return FG_SPHERE;
    const a = H.layer(320, 320), ac = a.getContext('2d');
    sphere(ac, 160, 160, 100, HX('#f3eeff'), HX('#d4c8ff'), HX('#a998ec'));
    const b = H.layer(320, 320), bc = b.getContext('2d');
    bc.filter = 'blur(9px)'; bc.drawImage(a, 0, 0);
    return (FG_SPHERE = b);
  }
  function softExplainer(ctx, W, H_, t) {
    const ph = (a, b) => H.clamp((t - a) / (b - a));
    const E = (a, b) => H.ease.inOut(ph(a, b));
    const EO = (a, b) => H.ease.out(ph(a, b));
    const spring = (t0, d = 0.8) => { const p = ph(t0, t0 + d); if (p <= 0) return 0; return p >= 1 ? 1 : 1 - Math.exp(-6.5 * p) * Math.cos(10 * p); };
    const INK = '#4a3a8a';
    // ---------- camera: [t, centreX, centreY, zoom] over a wide set ----------
    const KF = [[0, 640, 360, 1], [1.6, 640, 360, 1], [2.8, 980, 360, 1], [5.8, 1020, 360, 1], [6.8, 1560, 360, 1], [10.2, 1580, 360, 1], [11.1, 2560, 360, 1], [12.8, 2580, 360, 1], [13.8, 1790, 400, 0.44], [20, 1790, 400, 0.44]];
    let k = 0; while (k < KF.length - 2 && t > KF[k + 1][0]) k++;
    const A = KF[k], B = KF[k + 1], u = H.ease.inOut(H.clamp((t - A[0]) / (B[0] - A[0])));
    const camX = H.lerp(A[1], B[1], u), camY = H.lerp(A[2], B[2], u), zoom = H.lerp(A[3], B[3], u);
    const bob = (p, a) => Math.sin(t * 1.6 + p) * a;
    const FLOOR = 610;

    // ---------- seamless cyclorama (screen space) + parallax far props ----------
    const bg = ctx.createLinearGradient(0, 0, 0, H_);
    bg.addColorStop(0, '#f3ecff'); bg.addColorStop(0.5, '#e8dffb'); bg.addColorStop(0.62, '#dccff5'); bg.addColorStop(0.78, '#e6dcf9'); bg.addColorStop(1, '#efe7fe');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
    const glow = ctx.createRadialGradient(W * 0.5, H_ * 0.35, 40, W * 0.5, H_ * 0.35, 700);
    glow.addColorStop(0, 'rgba(255,250,255,0.8)'); glow.addColorStop(1, 'rgba(255,250,255,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H_);
    const world = (c, par = 1) => { c.translate(W / 2, H_ / 2); c.scale(zoom, zoom); c.translate(-camX * par, -camY); };
    {
      const far = H.layer(W, H_), fc = far.getContext('2d');
      fc.save(); world(fc, 0.6);
      const fr = H.rng(3);
      for (let i = 0; i < 16; i++) { const x = i * 260 + fr() * 120, y = 90 + fr() * 200, r = 12 + fr() * 22; const p = fr.pick([[HX('#fff6c7'), HX('#ffe08a'), HX('#f3b860')], [HX('#d8f5ec'), HX('#a6e3d2'), HX('#6cbfb0')], [HX('#f3eeff'), HX('#d4c8ff'), HX('#a998ec')], [HX('#ffe3ea'), HX('#ffb1c2'), HX('#ff8fa8')]]); sphere(fc, x, y + bob(i, 6), r, ...p); }
      fc.restore();
      ctx.save(); ctx.filter = 'blur(3px)'; ctx.drawImage(far, 0, 0); ctx.restore();
    }
    ctx.save(); world(ctx);
    const Z = zoom;
    // warm key-light glows behind each prop as it arrives (the hero's lit-bulb aura)
    const keyGlow = (x, y, r, a) => {
      a = H.clamp(a); if (a <= 0.01) return;
      const g = ctx.createRadialGradient(x, y, r * 0.06, x, y, r);
      g.addColorStop(0, `rgba(255,214,120,${0.26 * a})`); g.addColorStop(0.45, `rgba(255,222,160,${0.11 * a})`); g.addColorStop(1, 'rgba(255,230,180,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    };
    keyGlow(1330, 330, 340, spring(1.0, 0.9));
    if (t > 6.8) keyGlow(1830, 260, 320, spring(6.9, 0.7));
    if (t > 10.5) keyGlow(2650, 330, 460, spring(10.5, 0.7));

    // ================= SET 1/2: data → the model (chip) =================
    const CHIP = [1350, 360 + bob(0.3, 6)];
    // contact shadows first
    contactShadow(ctx, CHIP[0] + 10, FLOOR, 150 * spring(1.0), 22, 0.3, 18);
    // data cards travelling into the chip (beat 2) + test card (beat 3)
    const cards = [];
    if (t > 2.3 && t < 6.5) for (let j = 0; j < 9; j++) {
      const p = (t - 2.3) * 0.36 - j * 0.15; if (p < 0 || p > 1) continue;
      cards.push({ p, kind: (j * 5 + 1) % 3 === 0 ? 'dog' : (j % 2 ? 'cat' : 'dog'), j });
    }
    const cardPos = (p) => { const x = H.lerp(560, CHIP[0] - 40, p), y = 420 - Math.sin(p * Math.PI) * 170 + (p > 0.85 ? (p - 0.85) * 300 * 0 : 0); return [x, y, 1 - H.smooth(0.75, 1, p) * 0.75]; };
    // big puffy tube path showing the flow
    if (t > 2.6 && t < 6.6) clayTube(ctx, [520, 470], [900, 140], [CHIP[0] - 150, 330], E(2.6, 3.5) * (1 - ph(6.2, 6.6)), PAL.white, 18);
    // pile of examples (grows) on the floor left
    {
      const n = Math.floor(1 + 7 * Math.pow(EO(2.6, 5.8), 1.1));
      const pk0 = spring(2.6, 0.6);
      if (pk0 > 0) contactShadow(ctx, 600 + Math.min(n, 3) * 38 + (n > 3 ? 9 : 0), FLOOR + 2, (40 + Math.min(n, 3) * 34) * Math.min(1, pk0), 11, 0.3, 9);
      for (let i = 0; i < n; i++) {
        const k2 = spring(2.6 + i * 0.4, 0.6); if (k2 <= 0) continue;
        const row = Math.floor(i / 3), x = 590 + (i % 3) * 76 + row * 18, y = FLOOR - 26 - row * 50;
        ctx.save(); ctx.translate(x, y); ctx.scale(k2, k2);
        clay(ctx, rrect(70, 46, 14), [-35, -23, 35, 23], 0, 0, i % 2 ? PAL.peach : PAL.lav, { ext: [3, 7], fast: true });
        ctx.restore();
      }
    }
    for (const cd of cards) {
      const [x, y, sc] = cardPos(cd.p);
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(Math.sin(cd.j * 1.7 + t * 2) * 0.12);
      clay(ctx, rrect(96, 96, 26), [-48, -48, 48, 48], 0, 0, PAL.white, { ext: [5, 9], fast: true });
      clayPet(ctx, cd.kind, 0, 4, 28);
      if (cd.p < 0.82) clayLabel(ctx, 30, -52, cd.kind, cd.kind === 'cat' ? PAL.lav : PAL.peach, { font: '700 28px "Fredoka"', col: '#fff' });
      ctx.restore();
    }
    let testPos = null;
    if (t > 5.9 && t < 7.2) {
      const p = E(5.9, 7.0); const [x, y, sc] = cardPos(p * 0.98); testPos = [x, y];
      ctx.save(); ctx.translate(x, y); ctx.scale(sc * 1.1, sc * 1.1);
      clay(ctx, rrect(96, 96, 26), [-48, -48, 48, 48], 0, 0, PAL.pink, { ext: [5, 9], fast: true });
      clayPet(ctx, 'cat', 0, 4, 28);
      clayLabel(ctx, 34, -54, '?', PAL.coral, { font: '700 28px "Fredoka"', col: '#fff' });
      ctx.restore();
    }
    // the chip (model) with three weight sliders on its face
    const ck = spring(1.0, 0.9);
    const adj = E(8.6, 9.3);
    const SL0 = [0.2, 0.78, 0.38], SL1 = [0.66, 0.3, 0.82];
    const jitter = t > 8.6 && t < 9.3 ? Math.sin(t * 40) * 0.03 : 0;
    if (ck > 0) {
      ctx.save(); ctx.translate(CHIP[0], CHIP[1] + 110); ctx.scale(ck, ck); ctx.translate(-CHIP[0], -(CHIP[1] + 110));
      // pins
      for (let i = 0; i < 4; i++) for (const [dx, dy, w, h] of [[-118, -66 + i * 44, 34, 16], [118, -66 + i * 44, 34, 16], [-66 + i * 44, -118, 16, 34], [-66 + i * 44, 118, 16, 34]]) clay(ctx, rrect(w, h, 7), [-w / 2, -h / 2, w / 2, h / 2], CHIP[0] + dx, CHIP[1] + dy, PAL.butter, { ext: [3, 6], fast: true });
      const err = ph(8.0, 8.4) * (1 - ph(9.0, 9.4));
      clay(ctx, rrect(220, 220, 50), [-110, -110, 110, 110], CHIP[0], CHIP[1], err > 0 ? { face: PAL.lav.face.map(c => H.mix(c, HX('#ff8f7e'), err * 0.6)), side: PAL.lav.side } : PAL.lav, { ext: [10, 18], spec: [-60, -62, 60, 30] });
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.font = '700 34px "Fredoka"'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText('AI', CHIP[0] - 82, CHIP[1] - 52.5);
      ctx.fillStyle = INK; ctx.fillText('AI', CHIP[0] - 82, CHIP[1] - 54);
      ctx.font = '600 22px "Fredoka"'; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillText('weights', CHIP[0] - 30, CHIP[1] - 55);
      ctx.fillStyle = 'rgba(74,58,138,0.85)'; ctx.fillText('weights', CHIP[0] - 30, CHIP[1] - 56);
      for (let i = 0; i < 3; i++) {
        const ty = CHIP[1] - 14 + i * 42;
        ctx.fillStyle = 'rgba(70,50,160,0.28)'; ctx.beginPath(); ctx.roundRect(CHIP[0] - 76, ty - 7, 152, 14, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.roundRect(CHIP[0] - 76, ty + 4, 152, 3, 2); ctx.fill();
        const v = H.lerp(SL0[i], SL1[i], adj) + jitter * (i + 1);
        sphere(ctx, CHIP[0] - 70 + v * 140, ty, 14, err > 0 && adj < 1 && t > 8.4 ? HX('#ffe3df') : HX('#ffffff'), err > 0 && t > 8.4 ? HX('#ffb3a6') : HX('#f2ecff'), HX('#b9a8f2'));
      }
      ctx.restore();
    }
    // counter badge
    if (t > 2.7 && t < 6.9) {
      const cnt = Math.floor(1e6 * Math.pow(EO(2.9, 5.7), 1.6));
      const kb = spring(2.7) * (1 - E(6.5, 6.9));
      ctx.save(); ctx.translate(980, 98); ctx.scale(kb, kb);
      clay(ctx, pill(540, 116), [-270, -58, 270, 58], 0, 0, PAL.butter, { ext: [6, 12], spec: [-150, -28, 90, 18] });
      ctx.font = '700 68px "Fredoka"'; ctx.fillStyle = '#8a5a1f'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(cnt.toLocaleString('en-US'), 88, 4);
      ctx.font = '700 34px "Fredoka"'; ctx.textAlign = 'left'; ctx.fillText('examples', 102, 10);
      ctx.restore();
    }
    if (t > 4.0 && t < 6.6) clayLabel(ctx, CHIP[0], CHIP[1] - 175, 'the model', PAL.lav, { k: spring(4.0) * (1 - E(6.3, 6.6)), col: '#fff' });

    // ================= SET 3: guess → check → adjust =================
    const BUB = [1840, 250 + bob(1.1, 6)];
    const wrong = t > 7.0 && t < 9.4, right = t >= 9.4;
    if (t > 6.8) {
      const bk = spring(6.9, 0.7);
      const sk = t > 7.4 && t < 7.8 ? Math.sin(t * 70) * 6 : 0;
      contactShadow(ctx, BUB[0] + 10, FLOOR, 120 * bk, 18, 0.22, 16);
      ctx.save(); ctx.translate(BUB[0] + sk, BUB[1] + 100); ctx.scale(bk * 0.82, bk * 0.82); ctx.translate(-BUB[0], -(BUB[1] + 100));
      const pal = right ? PAL.mint : wrong && t > 7.4 ? PAL.peach : PAL.white;
      clay(ctx, bubblePath(), BUBBLE_BB, BUB[0], BUB[1], pal, { ext: [10, 18], spec: [-95, -78, 85, 40] });
      clayPet(ctx, right ? 'cat' : 'dog', BUB[0] - 80, BUB[1] - 8, 46);
      ctx.font = '700 64px "Fredoka"'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(70,45,170,0.25)'; ctx.fillText(right ? 'cat' : 'dog?', BUB[0] - 16, BUB[1] + 4);
      ctx.fillStyle = '#ffffff'; ctx.fillText(right ? 'cat' : 'dog?', BUB[0] - 19, BUB[1]);
      ctx.restore();
      // verdict badge (puffy ball with ✗ / ✓)
      const verdict = () => {
        const vk = right ? spring(9.45, 0.7) : spring(7.4, 0.6);
        const bx = BUB[0] + 140, by = BUB[1] - 100;
        ctx.save(); ctx.translate(bx, by); ctx.scale(vk, vk);
        sphere(ctx, 0, 0, 38, right ? HX('#d9fff0') : HX('#ffd9d2'), right ? HX('#5ee0b0') : HX('#ff7a68'), right ? HX('#2fae84') : HX('#c8403a'));
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
        if (right) { ctx.moveTo(-14, 0); ctx.lineTo(-4, 11); ctx.lineTo(16, -12); } else { ctx.moveTo(-12, -12); ctx.lineTo(12, 12); ctx.moveTo(12, -12); ctx.lineTo(-12, 12); }
        ctx.stroke(); ctx.restore();
      };
      if (t > 7.4) verdict();
      const fade = 1 - E(10.3, 10.7);
      ctx.save(); ctx.globalAlpha = fade;
      // 1 Guess tube: chip → bubble
      clayTube(ctx, [CHIP[0] + 120, CHIP[1] - 80], [1600, 120], [BUB[0] - 170, BUB[1] - 40], E(6.85, 7.25), PAL.lav, 16);
      clayLabel(ctx, 1580, 150, '1  Guess', PAL.white, { k: spring(7.0) });
      if (t > 7.45) clayLabel(ctx, BUB[0] + 30, BUB[1] - 175, '2  Check', PAL.white, { k: spring(7.45) });
      // emphasis: pulsing ring + "answer: cat"
      if (wrong && t > 7.45) {
        const pr = EO(7.45, 7.9);
        // a puffy coral clay torus (cast shadow, darker side, lit face, two highlights) instead of a flat stroke
        ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = fade * (0.78 + 0.22 * Math.sin(t * 9));
        const rr = 1.25 - 0.25 * pr, a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * pr;
        const ring = (dx, dy, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(BUB[0] + dx, BUB[1] + 10 + dy, 210 * rr, 150 * rr, -0.05, a0, a1); ctx.stroke(); };
        ring(5, 14, 'rgba(110,70,160,0.13)', 18);
        ring(0, 4, '#c8483e', 16);
        ring(0, 0, '#ff7a68', 14);
        ring(-1, -2, 'rgba(255,186,170,0.75)', 7);
        ring(-2, -3.5, 'rgba(255,255,255,0.6)', 3);
        ctx.restore();
        verdict(); // keep the ✗ ball in front of the ring
        clayLabel(ctx, BUB[0] + 10, BUB[1] + 205, 'answer: cat', PAL.lav, { k: spring(7.65), col: '#fff' });
      }
      // 3 Adjust tube: bubble → sliders (coral)
      if (t > 8.0) {
        const q = clayTube(ctx, [BUB[0] - 60, BUB[1] + 150], [1640, 640], [CHIP[0] + 100, CHIP[1] + 60], E(8.0, 8.6), PAL.coral, 16);
        if (q && t < 8.75) { const p = q(E(8.0, 8.6) * 0.93); sphere(ctx, p[0], p[1], 15, HX('#ffd9d2'), HX('#ff7a68'), HX('#c8403a')); }
        clayLabel(ctx, 1610, 600, '3  Adjust', PAL.coral, { k: spring(8.5), col: '#fff' });
        if (t < 9.4) clayLabel(ctx, 1700, 500, 'error', PAL.peach, { k: spring(8.1) * (1 - E(9.1, 9.4)), font: '700 28px "Fredoka"', col: '#c8403a' });
      }
      if (right) clayLabel(ctx, BUB[0] + 40, BUB[1] - 175, 'Guess again', PAL.mint, { k: spring(9.5), col: '#fff' });
      ctx.restore();
    }

    // ================= SET 4: progress — clay bar chart =================
    const ACCS = [61, 72, 80, 86, 90, 93, 95, 97];
    const BX = 2330, BW = 56, GAP = 22;
    if (t > 10.5) {
      const pk = spring(10.5, 0.7);
      contactShadow(ctx, BX + 320, FLOOR + 6, 380 * pk, 22, 0.25, 18);
      ctx.save(); ctx.translate(BX + 310, FLOOR - 10); ctx.scale(pk, pk);
      clay(ctx, pill(700, 40), [-350, -20, 350, 20], 0, 0, PAL.white, { ext: [5, 9], fast: true });
      ctx.restore();
      let topP = null;
      ACCS.forEach((a, i) => {
        const g = spring(10.95 + i * 0.2, 0.8); if (g <= 0) return;
        const hh = (a - 50) * 7 * g, x = BX + i * (BW + GAP) + 40, y = FLOOR - 30 - hh / 2;
        if (hh > 4) clay(ctx, rrect(BW, hh, Math.min(26, hh / 2)), [-BW / 2, -hh / 2, BW / 2, hh / 2], x, y, i === 7 ? PAL.coral : (i % 2 ? PAL.blue : PAL.mint), { ext: [5, 9], fast: true });
        topP = [x, FLOOR - 30 - hh, i];
      });
      if (topP) {
        const cur = Math.round(H.lerp(61, 97, H.ease.inOut(ph(11.0, 12.6))));
        const pop = t > 12.6 ? 1 + 0.18 * Math.sin(Math.min(1, (t - 12.6) / 0.4) * Math.PI) : 1;
        // counter-scale the readout about its base during the final pull-back so 97% stays >= 64px on screen
        const cz = Math.max(1, 0.93 / Z), ax = topP[0] - 30, ay = topP[1] - 70 + 52;
        ctx.save(); ctx.translate(ax, ay); ctx.scale(cz, cz); ctx.translate(-ax, -ay);
        clayLabel(ctx, topP[0] - 30, topP[1] - 70, `${cur}%`, cur >= 97 ? PAL.coral : PAL.butter, { k: spring(10.95) * pop, font: '700 70px "Fredoka"', h: 104, padX: 60, col: cur >= 97 ? '#fff' : '#8a5a1f' });
        clayLabel(ctx, topP[0] - 30, topP[1] - 160, 'Accuracy', PAL.lav, { k: spring(10.95) * pop, font: '700 32px "Fredoka"', col: '#fff' });
        ctx.restore();
        if (t < 13.3) clayLabel(ctx, BX + 40, FLOOR - 30 - 11 * 7 - 36, 'round 1: 61%', PAL.white, { k: spring(11.2) * (1 - E(13.0, 13.3)), font: '700 28px "Fredoka"' });
        if (t < 13.3) { ctx.save(); ctx.globalAlpha = EO(11.2, 11.6) * (1 - E(13.0, 13.3)); ctx.font = '700 28px "Fredoka"'; ctx.fillStyle = 'rgba(80,58,160,0.85)'; ctx.textAlign = 'center'; ctx.fillText('training rounds →', BX + 310, FLOOR + 44); ctx.restore(); }
        if (t > 12.6 && t < 13.6) { // confetti spheres burst
          const cr = H.rng(5), pp = EO(12.6, 13.6);
          for (let i = 0; i < 14; i++) { const a = cr() * Math.PI * 2, d = 60 + cr() * 120; const col = cr.pick([[HX('#ffe3ea'), HX('#ffb1c2'), HX('#ff8fa8')], [HX('#fff6c7'), HX('#ffe08a'), HX('#f3b860')], [HX('#d8f5ec'), HX('#a6e3d2'), HX('#6cbfb0')]]); ctx.globalAlpha = 1 - pp; sphere(ctx, topP[0] + Math.cos(a) * d * pp, topP[1] - 52 + Math.sin(a) * d * pp + pp * pp * 40, 9, ...col); }
          ctx.globalAlpha = 1;
        }
      }
    }
    ctx.restore(); // end world

    // ---------- screen-space atmosphere: soft lavender vignette + an out-of-focus foreground sphere (hero DOF) ----------
    {
      const vg = ctx.createRadialGradient(W * 0.5, H_ * 0.45, H_ * 0.45, W * 0.5, H_ * 0.45, W * 0.78);
      vg.addColorStop(0, 'rgba(120,90,200,0)'); vg.addColorStop(1, 'rgba(120,90,200,0.11)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H_);
      ctx.drawImage(fgSphere(), 1238 - (camX - 640) * 0.04 - 160, 678 + bob(4, 3) - 160);
    }

    // ---------- hook bubble → corner header pill (screen space) ----------
    {
      const inK = spring(0.1, 0.9), out = E(1.5, 2.2);
      if (out < 1) {
        const s2 = inK * (1 - out * 0.75);
        const x = H.lerp(640, 170, out), y = H.lerp(330, 60, out);
        if (out < 0.6 && inK > 0) { // the hook bubble floats over the set: warm glow + soft contact shadow under it
          const fa = 1 - H.smooth(0, 0.6, out), g = ctx.createRadialGradient(640, 320, 30, 640, 320, 380);
          g.addColorStop(0, `rgba(255,214,120,${0.22 * fa * Math.min(1, inK)})`); g.addColorStop(1, 'rgba(255,224,170,0)');
          ctx.fillStyle = g; ctx.fillRect(260, 0, 760, 700);
          contactShadow(ctx, 650, FLOOR, 170 * Math.min(1.1, inK) * (1 - out * 0.8), 22, 0.28 * fa, 18);
        }
        ctx.save(); ctx.globalAlpha = 1 - H.smooth(0.6, 1, out); ctx.translate(x, y + 100 * s2); ctx.scale(Math.max(0.001, s2) * 1.15, Math.max(0.001, s2) * 1.05); ctx.translate(0, -100);
        clay(ctx, bubblePath(), BUBBLE_BB, 0, 0, PAL.lav, { ext: [12, 22], spec: [-95, -78, 85, 40] });
        ctx.font = '700 40px "Fredoka"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(70,45,170,0.35)'; ctx.fillText('How does', 3, -24 + 4); ctx.fillText('AI learn?', 3, 24 + 4);
        ctx.fillStyle = '#ffffff'; ctx.fillText('How does', 0, -24); ctx.fillText('AI learn?', 0, 24);
        ctx.restore();
      }
      if (t > 1.9) clayLabel(ctx, 170, 58, 'How does AI learn?', PAL.lav, { k: spring(1.9, 0.7), font: '700 28px "Fredoka"', h: 54, padX: 44, col: '#fff' });
    }
    // ---------- takeaway ----------
    if (t > 13.0) {
      const kk = spring(13.0, 0.8);
      ctx.save(); ctx.translate(640, 628); ctx.scale(kk, kk);
      clay(ctx, pill(860, 100), [-430, -50, 430, 50], 0, 0, PAL.white, { ext: [7, 13], spec: [-260, -22, 140, 18] });
      ctx.font = '700 46px "Fredoka"'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('More examples → better guesses', 0, 3);
      ctx.restore();
    }
    ctx.font = '600 20px "Fredoka"'; ctx.fillStyle = `rgba(85,62,165,${0.78 * (1 - E(12.9, 13.2))})`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('AI ASSISTANTS · 101', 64, 692); // steps aside for the takeaway pill
    H.grain(ctx, W, H_, 0.018, 9 + Math.floor(t * 12));
  }

  // ---------- sound: squishy clay set (rubbery bounces as things spring on, soft puffs, gentle camera dollies) ----------
  function softSound(k) {
    const D = 14.5;
    const ph = (t, a, b) => H.clamp((t - a) / (b - a));
    const inv = (u) => (u < 0.5 ? Math.cbrt(u / 4) : 1 - Math.cbrt((1 - u) * 2) / 2); // inverse of H.ease.inOut
    const invO = (u) => 1 - Math.cbrt(1 - u); // inverse of H.ease.out
    // spring(t0, d) from softExplainer first reaches full size at p = pi/20 (overshoot peak at pi/10)
    const sp = (t0, d = 0.8) => t0 + d * (Math.PI / 20);
    // panning: world x on the set -> screen, using the camera keyframes copied from softExplainer (KF)
    const KF = [[0, 640, 360, 1], [1.6, 640, 360, 1], [2.8, 980, 360, 1], [5.8, 1020, 360, 1], [6.8, 1560, 360, 1], [10.2, 1580, 360, 1], [11.1, 2560, 360, 1], [12.8, 2580, 360, 1], [13.8, 1790, 400, 0.44], [20, 1790, 400, 0.44]];
    const pan = (wx, t) => { let i = 0; while (i < KF.length - 2 && t > KF[i + 1][0]) i++; const A = KF[i], B = KF[i + 1], u = H.ease.inOut(H.clamp((t - A[0]) / (B[0] - A[0]))); const sx = 640 + (wx - H.lerp(A[1], B[1], u)) * H.lerp(A[3], B[3], u); return H.clamp(sx / 640 - 1, -1, 1) * 0.6; };
    const busy = [];
    // squish: a soft rubbery bounce, pitch bends up as it squashes then settles with one smaller wobble
    const squish = (t, f, g, p = 0, minor) => {
      busy.push(t);
      k.tone(t, { f: [[0, f * 0.7], [0.05, f * 1.18], [0.17, f * 0.92]], dur: 0.2, gain: 0.26 * g, a: 0.006, pan: p, minor });
      k.tone(t + 0.13, { f: [[0, f * 0.95], [0.05, f * 1.06], [0.12, f]], dur: 0.13, gain: 0.08 * g, a: 0.01, pan: p, minor }); // the overshoot wobble
      k.noise(t, { dur: 0.05, color: 'pink', filter: 'lowpass', f: 900, gain: 0.18 * g, a: 0.004, pan: p, minor }); // soft contact puff
    };
    const puff = (t, g, p = 0) => busy.push(t) && k.noise(t, { dur: 0.09, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.09, 900]], q: 1, gain: 0.12 * g, a: 0.02, pan: p, minor: true });
    const dolly = (t0, t1, g = 1) => { const d = t1 - t0; k.noise(t0, { dur: d + 0.15, color: 'pink', filter: 'bandpass', f: [[0, 220], [d * 0.5, 480], [d, 240]], q: 0.7, gain: 0.045 * g, a: d * 0.5, verb: 0.1 }); };
    const counter = (a, b, val, f, g, p, minGap) => {
      let last = -1, lastV = val(a); const top = Math.abs(val(b) - val(a)) / (b - a) * 0.22;
      for (let t = a; t <= b + 1e-6; t += 1 / 120) {
        const v = val(t); if (v === lastV) continue; lastV = v;
        const speed = Math.abs(val(Math.min(b, t + 0.05)) - val(Math.max(a, t - 0.05)));
        const gap = H.clamp(minGap / Math.max(0.2, Math.min(1, speed / top)), minGap, 0.4);
        if (t - last >= gap && !busy.some((x) => t > x - 0.03 && t < x + 0.27)) { k.play('tick', t, { f, gain: g, pan: p, minor: true }); k.tone(t, { f: f / 10, dur: 0.03, gain: 0.05 * g, pan: p, minor: true }); last = t; }
      }
    };

    k.bed('room', 0, D, { gain: 0.22 });
    k.music('pad', 0.2, D, { bpm: 100, gain: 0.3, chords: [['Eb4', 'G4', 'Bb4', 'D5'], ['C4', 'Eb4', 'G4', 'Bb4'], ['Ab3', 'C4', 'Eb4', 'G4'], ['Bb3', 'D4', 'F4', 'Ab4'], ['Eb4', 'G4', 'Bb4', 'Eb5']] });

    // ---- hook: the clay speech bubble bounces on (spring 0.1, 0.9), the chip springs up behind (1.0, 0.9)
    squish(sp(0.1, 0.9), 300, 1.2, 0);
    squish(sp(1.0, 0.9), 170, 1.1, pan(1350, 1.14)); // the AI chip
    k.noise(1.5, { dur: 0.7, color: 'pink', filter: 'lowpass', f: [[0, 650], [0.7, 300]], gain: 0.05, a: 0.25, minor: true }); // bubble shrinks off to the corner
    squish(sp(1.9, 0.7), 420, 0.4, -0.7, true); // header pill
    dolly(1.6, 2.8);

    // ---- beat 2: cards puff out of the tube, the pile grows, the counter badge
    k.noise(2.6, { dur: 0.9, color: 'pink', filter: 'bandpass', f: [[0, 260], [0.9, 620]], q: 1.4, gain: 0.07, a: 0.4, pan: pan(700, 3), minor: true }); // puffy tube squeezes out (E 2.6-3.5)
    for (let j = 0; j < 9; j++) { const t = 2.3 + j * 0.15 / 0.36; if (t < 6.4) puff(t, 0.9, pan(560, t)); } // a card pops out of the tube
    for (let j = 0; j < 4; j++) { const t = 2.3 + (1 + j * 0.15) / 0.36; if (t < 6.5) k.tone(t, { f: [[0, 240], [0.1, 150]], dur: 0.14, gain: 0.1, pan: pan(1310, t), minor: true }); } // swallowed by the chip
    // examples pile: item i springs at 2.6 + 0.4i once n = floor(1 + 7 * EO(2.6,5.8)^1.1) > i
    for (let i = 0; i < 8; i++) { const tn = i === 0 ? 2.6 : 2.6 + 3.2 * invO(Math.pow(i / 7, 1 / 1.1)), t = sp(Math.max(tn, 2.6 + i * 0.4), 0.6); if (t < 6.4) squish(t, 260 + (i % 3) * 30, 0.32, pan(600 + (i % 3) * 76, t), true); }
    squish(sp(2.7), 360, 0.8, pan(980, 2.8)); // butter counter badge
    counter(2.95, 5.66, (t) => Math.floor(1e6 * Math.pow(H.ease.out(ph(t, 2.9, 5.7)), 1.6)), 2400, 0.75, pan(980, 4), 1 / 8);
    squish(sp(4.0), 380, 0.75, pan(1350, 4.1)); // "the model"
    squish(5.7, 330, 0.9, pan(980, 5.7)); k.play('ding', 5.7, { f: 'Bb5', gain: 0.35, pan: pan(980, 5.7) }); // 1,000,000 lands

    // ---- beat 3
    squish(5.95, 340, 0.8, pan(560, 5.95)); // pink test card with its "?"
    dolly(5.8, 6.8);
    k.noise(6.5, { dur: 0.4, color: 'pink', filter: 'lowpass', f: [[0, 700], [0.4, 300]], gain: 0.04, a: 0.1, minor: true }); // counter badge squashes away
    k.tone(7.0, { f: [[0, 200], [0.12, 130]], dur: 0.16, gain: 0.12, pan: pan(1310, 7.0), minor: true }); // test card swallowed
    k.noise(6.85, { dur: 0.4, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.4, 700]], q: 1.4, gain: 0.07, a: 0.2, pan: pan(1600, 7.05), minor: true }); // Guess tube squeezes over
    squish(sp(6.9, 0.7), 280, 1.1, pan(1840, 7.0)); // answer bubble "dog?" bounces up
    squish(sp(7.0), 420, 0.42, pan(1580, 7.1), true); // "1 Guess"
    // CHECK: wrong. bubble shakes, the X ball bounces on
    k.play('error', 7.42, { f: 'G3', gain: 0.8, pan: pan(1980, 7.45) });
    squish(sp(7.4, 0.6), 220, 0.8, pan(1980, 7.45));
    squish(sp(7.65), 360, 0.4, pan(1850, 7.75), true); // "answer: cat"
    // ADJUST: coral tube squeezes back to the chip, the error ball rolls along it
    k.noise(8.0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.6, 300]], q: 1.4, gain: 0.08, a: 0.3, pan: pan(1640, 8.3) });
    k.tone(8.0, { f: [[0, 300], [0.6, 180]], type: 'triangle', dur: 0.62, gain: 0.05, a: 0.25, pan: pan(1640, 8.3), minor: true });
    squish(sp(8.1), 460, 0.38, pan(1700, 8.2), true); // "error"
    squish(sp(8.5), 340, 0.8, pan(1610, 8.6)); // "3 Adjust"
    // sliders glide to new weights (E 8.6-9.3 with a jitter): three rubber knobs sliding
    [0, 1, 2].forEach((i) => k.noise(8.62 + i * 0.05, { dur: 0.62, color: 'pink', filter: 'bandpass', f: [[0, 380 + i * 60], [0.3, 640 + i * 60], [0.62, 420 + i * 60]], q: 3, gain: 0.07, a: 0.25, pan: pan(1350, 9), minor: true }));
    squish(9.3, 300, 0.5, pan(1350, 9.3), true); // knobs settle
    // CORRECT: bubble turns mint "cat", the check ball bounces on
    k.play('success', sp(9.45, 0.7), { f: 'Eb5', gain: 0.42, pan: pan(1980, 9.55) });
    squish(sp(9.45, 0.7), 300, 0.8, pan(1980, 9.55));
    squish(sp(9.5), 420, 0.38, pan(1880, 9.6), true); // "Guess again"

    // ---- beat 4: clay bars bounce up one per round
    dolly(10.2, 11.1);
    squish(sp(10.5, 0.7), 180, 0.7, pan(2640, 10.6), true); // chart base
    squish(sp(10.95), 360, 0.7, pan(2330, 11.05)); // Accuracy badge
    ['Eb3', 'F3', 'G3', 'Bb3', 'C4', 'D4', 'Eb4', 'G4'].forEach((n, i) => squish(sp(10.95 + i * 0.2), k.hz(n), i === 7 ? 0.7 : 0.45, pan(2370 + i * 78, 11 + i * 0.2), i < 7));
    counter(11.03, 12.56, (t) => Math.round(H.lerp(61, 97, H.ease.inOut(ph(t, 11.0, 12.6)))), 2200, 0.7, pan(2700, 12), 1 / 12);
    // 97%: the big hit. badge swells coral, confetti spheres burst
    k.play('impact', 12.6, { gain: 1.3, pan: pan(2950, 12.6) });
    squish(12.6, 240, 1.4, pan(2950, 12.6));
    ['Eb4', 'G4', 'Bb4', 'Eb5'].forEach((n, i) => k.play('ding', 12.62 + i * 0.03, { f: n, gain: 0.4 - i * 0.05, pan: (i - 1.5) * 0.25 }));
    for (let i = 0; i < 6; i++) k.tone(12.68 + i * 0.07, { f: [[0, 380 + i * 30], [0.06, 520 + i * 30]], dur: 0.08, gain: 0.07, pan: Math.sin(i * 2.1) * 0.6, minor: true }); // little bouncy confetti balls
    dolly(12.8, 13.8, 0.9);
    // takeaway pill springs on (13.0, 0.8) and the phrase resolves
    squish(sp(13.0), 260, 1.0, 0);
    ['Bb4', 'Eb5'].forEach((n, i) => k.play('ding', 13.32 + i * 0.09, { f: n, gain: 0.3 - i * 0.05, pan: (i - 0.5) * 0.3 }));
    k.tone(13.32, { f: 'Eb3', type: 'triangle', dur: 1.2, gain: 0.12, a: 0.02 });
  }

  registerStyle({
    id: 'soft-3d',
    name: 'Soft 3D Clay',
    category: 'Dimensional',
    description: 'Dribbble-style “puffy” 3D icons: pastel matte-clay objects with chunky rounded extrusions, soft core shadows, bright bounce-light rims, glossy specular blobs and blurry contact shadows on a seamless pastel sweep.',
    motion: 'Clay icons drop in one by one on springy squash-and-stretch with their contact shadows growing beneath them, the bulb flickers on, then the cursor flies in and taps the bubble while everything bobs at different depths.',
    duration: 5,
    fonts: ['600 38px "Fredoka"', '700 38px "Fredoka"', '600 15px "Fredoka"', '700 64px "Fredoka"', '600 18px "Fredoka"'],
    frameT: 4.6,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'The camera dollies across one wide pastel set with parallax depth-of-field (cards → clay chip with weight sliders → answer bubble → clay bar chart → pull back), arrows are puffy clay tubes with blobby heads, labels are squishy pills that spring onto objects, and numbers count inside butter-yellow clay badges.',
    explainer: softExplainer,
    explainerSound: softSound,
    draw(ctx, W, H_, t) {
      // ---------- seamless cyclorama ----------
      const bg = ctx.createLinearGradient(0, 0, 0, H_);
      bg.addColorStop(0, '#f3ecff'); bg.addColorStop(0.55, '#e6dcfa'); bg.addColorStop(0.62, '#e4d9f8'); bg.addColorStop(1, '#f1eaff');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
      const glow = ctx.createRadialGradient(W * 0.48, H_ * 0.35, 40, W * 0.48, H_ * 0.35, 700);
      glow.addColorStop(0, 'rgba(255,250,255,0.8)'); glow.addColorStop(1, 'rgba(255,250,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H_);

      const bob = (ph, amp) => Math.sin(t * 1.6 + ph) * amp;
      const FLOOR = 610;
      const ph = (a, b) => H.clamp((t - a) / (b - a));
      // springy pop-in: drops in from above, overshoots, squashes and stretches, settles
      const spring = (t0) => {
        const p = ph(t0, t0 + 0.95);
        if (p <= 0) return null;
        const k = p >= 1 ? 1 : 1 - Math.exp(-6.5 * p) * Math.cos(10 * p);
        const st = p >= 1 ? 0 : Math.pow(1 - p, 2) * Math.sin(p * 13) * 0.22;
        return { k, sx: k * (1 - st), sy: k * (1 + st), dy: -(1 - H.ease.out(Math.min(1, p * 1.6))) * 70 };
      };
      const pop = (c, x, y, t0, fn) => {
        const sp = spring(t0); if (!sp) return;
        c.save(); c.translate(x, y + sp.dy); c.scale(Math.max(0.001, sp.sx), Math.max(0.001, sp.sy)); c.translate(-x, -y);
        fn(); c.restore();
      };
      const cshadow = (x, y, w, h, a, bl, t0) => { const sp = spring(t0); if (!sp) return; const k = Math.min(1.1, sp.k) * (1 + sp.dy / 200); contactShadow(ctx, x, y, w * k, h * k, a * Math.min(1, sp.k), bl); };

      // ---------- far layer (blurred for depth of field) ----------
      const far = H.layer(W, H_), fc = far.getContext('2d');
      const gy = 250 + bob(1.2, 9);
      cshadow(985, FLOOR - 90, 95, 16, 0.22, 16, 0.8);
      pop(fc, 975, gy, 0.8, () => puffy(fc, { x: 975, y: gy, rot: t * 0.35 + 0.2 - (1 - ph(0.8, 2.2)) * 1.2, s: 0.92, path: gearPath(118, 8, 40), rule: 'evenodd', bb: [-118, -118, 118, 118],
        face: [H.hex('#e3f1ff'), H.hex('#b4d6ff'), H.hex('#8fbaf5')], side: [H.hex('#86b0ee'), H.hex('#5a7fc7')], ext: [10, 20], spec: [-50, -60, 50, 30] }));
      pop(fc, 1150, 120, 1.0, () => sphere(fc, 1150, 120 + bob(2.5, 6), 22, H.hex('#fff6c7'), H.hex('#ffe08a'), H.hex('#f3b860')));
      pop(fc, 180, 110, 1.2, () => sphere(fc, 180, 110 + bob(0.4, 5), 16, H.hex('#d8f5ec'), H.hex('#a6e3d2'), H.hex('#6cbfb0')));
      ctx.save(); ctx.filter = 'blur(2.2px)'; ctx.drawImage(far, 0, 0); ctx.restore();

      // ---------- mid layer: lightbulb (left) ----------
      {
        const bx = 300, by = 262 + bob(0.6, 11), r = 92, s = 1, rot = -0.14;
        cshadow(318, FLOOR - 40, 80, 14, 0.22, 14, 0.5);
        // glow aura: the bulb "switches on" with a flicker once it has landed
        const on = t > 1.7 ? (t < 1.78 || (t > 1.86 && t < 1.92) ? 0.3 : 1) * H.ease.out(ph(1.7, 2.1)) : 0;
        const a = ctx.createRadialGradient(bx, by - 10, 20, bx, by - 10, 210);
        a.addColorStop(0, `rgba(255,236,150,${0.55 * on})`); a.addColorStop(1, 'rgba(255,236,150,0)');
        ctx.fillStyle = a; ctx.fillRect(bx - 220, by - 230, 440, 440);
        pop(ctx, bx, by + 120, 0.5, () => {
          for (let i = 2; i >= 0; i--) {
            const ox = Math.sin(rot) * -(r * 1.05 + i * 26), oy = Math.cos(rot) * (r * 1.05 + i * 26);
            const w = 54 - i * 4;
            puffy(ctx, { x: bx + ox, y: by + oy, rot, s, path: roundedPoly([[-w, -14, 14], [w, -14, 14], [w, 14, 14], [-w, 14, 14]]), bb: [-w, -14, w, 14],
              face: [H.hex('#e3fbf3'), H.hex('#b3eadb'), H.hex('#86d3c0')], side: [H.hex('#7fcbb8'), H.hex('#4f9f93')], ext: [5, 9] });
          }
          {
            const ox = Math.sin(rot) * -(r * 1.05 + 3 * 26 - 6), oy = Math.cos(rot) * (r * 1.05 + 3 * 26 - 6);
            puffy(ctx, { x: bx + ox, y: by + oy, rot, s, path: roundedPoly([[-26, -12, 12], [26, -12, 12], [12, 12, 8], [-12, 12, 8]]), bb: [-26, -12, 26, 12],
              face: [H.hex('#a39cc4'), H.hex('#7d74a8'), H.hex('#5f5689')], side: [H.hex('#5a5185'), H.hex('#3f3866')], ext: [4, 7] });
          }
          const off = 1 - on;
          puffy(ctx, { x: bx, y: by, rot, s, path: bulbGlassPath(r), bb: [-r, -r, r, r],
            face: [H.mix('#fffbe0', '#f4efe6', off * 0.6), H.mix('#ffe58f', '#e8dcc6', off * 0.6), H.mix('#f7c45e', '#cdbb9e', off * 0.6)], side: [H.mix('#f2b955', '#c4ae8c', off * 0.6), H.mix('#d98f3a', '#9c8566', off * 0.6)], ext: [8, 14], spec: [-38, -52, 40, 26] });
          ctx.save(); ctx.translate(bx, by); ctx.rotate(rot);
          ctx.strokeStyle = `rgba(232,150,60,${0.25 + 0.3 * on})`; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(-18, 70); ctx.lineTo(-18, 18); ctx.lineTo(-9, 4); ctx.lineTo(0, 18); ctx.lineTo(9, 4); ctx.lineTo(18, 18); ctx.lineTo(18, 70); ctx.stroke();
          ctx.strokeStyle = `rgba(255,255,240,${0.9 * on})`; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(-19, 68); ctx.lineTo(-19, 17); ctx.lineTo(-10, 3); ctx.lineTo(-1, 17); ctx.lineTo(8, 3); ctx.lineTo(17, 17); ctx.stroke();
          ctx.restore();
        });
      }

      // ---------- hero: chat bubble ----------
      const cbx = 640, cby = 305 + bob(0, 8);
      const tapAt = 2.6, tapT = t - tapAt;
      const tapPress = tapT > 0 ? Math.max(0, Math.sin(tapT * 2.4 * Math.PI / 2.4 * 1.0)) : 0; // 0..1 press cycles
      const squish = tapT > 0 ? Math.pow(Math.max(0, Math.sin(tapT * Math.PI * 0.8)), 6) * 0.03 : 0;
      cshadow(650, FLOOR, 170, 22, 0.3, 18, 0.15);
      pop(ctx, cbx, cby + 120, 0.15, () => {
        ctx.save(); ctx.translate(cbx, cby + 100); ctx.scale(1 + squish, 1 - squish); ctx.translate(-cbx, -(cby + 100));
        puffy(ctx, { x: cbx, y: cby, rot: -0.04, s: 1, path: bubblePath(), bb: BUBBLE_BB,
          face: [H.hex('#d9d0ff'), H.hex('#a796ff'), H.hex('#8c78f5')], side: [H.hex('#806ce8'), H.hex('#5340b8')], ext: [12, 22], spec: [-95, -78, 85, 40] });
        // text on bubble: each line bounces in
        ctx.save(); ctx.translate(cbx, cby); ctx.rotate(-0.04);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '700 38px "Fredoka"';
        [['Ask me', -26, 1.0], ['anything', 22, 1.25]].forEach(([str, y, t0]) => {
          const sp = spring(t0); if (!sp) return;
          ctx.save(); ctx.translate(0, y); ctx.scale(sp.sx, sp.sy);
          ctx.fillStyle = 'rgba(70,45,170,0.35)'; ctx.fillText(str, 3, 4);
          ctx.fillStyle = '#ffffff'; ctx.fillText(str, 0, 0);
          ctx.restore();
        });
        ctx.restore();
        ctx.restore();
      });
      // typing-dots badge
      {
        const px = cbx + 150, py = cby - 118;
        pop(ctx, px, py, 1.6, () => {
          puffy(ctx, { x: px, y: py, rot: 0.1, s: 1, path: roundedPoly([[-42, -22, 22], [42, -22, 22], [42, 22, 22], [-42, 22, 22]]), bb: [-42, -22, 42, 22],
            face: [H.hex('#ffffff'), H.hex('#f4efff'), H.hex('#ddd2fb')], side: [H.hex('#cdbff5'), H.hex('#9a87de')], ext: [5, 9] });
          for (let i = 0; i < 3; i++) {
            const jump = Math.max(0, Math.sin(t * 6 - i * 0.9)) * 5;
            sphere(ctx, px - 22 + i * 22, py + i * 2.2 - 2 - jump, 7.5, H.hex('#c8bcff'), H.hex('#9481f0'), H.hex('#6a55cf'));
          }
        });
      }

      // ---------- ring (donut) bottom-left ----------
      {
        const rx = 150, ry = 525 + bob(2.2, 4);
        cshadow(rx + 8, FLOOR - 10, 92, 14, 0.25, 12, 1.0);
        pop(ctx, rx, ry + 30, 1.0, () => puffy(ctx, { x: rx, y: ry, rot: 0.08, s: 1, path: ringPath(92, 46), rule: 'evenodd', bb: [-92, -40, 92, 40],
          face: [H.hex('#fff3d6'), H.hex('#ffd59a'), H.hex('#f6b36d')], side: [H.hex('#efa760'), H.hex('#c97a3e')], ext: [4, 16], spec: [-50, -22, 34, 12] }));
      }
      // sphere resting on floor
      cshadow(1095, FLOOR - 4, 46, 9, 0.35, 8, 1.15);
      pop(ctx, 1090, 600, 1.15, () => sphere(ctx, 1090, 560, 42, H.hex('#d8f5ec'), H.hex('#a6e3d2'), H.hex('#5fb3a3')));

      // ---------- near layer: cursor (flies in, then taps the bubble) ----------
      {
        const tap = tapPress * 10;
        const fly = H.ease.out(ph(1.35, 2.2));
        const cx = 790 - tap * 0.6 + (1 - fly) * 260, cy = 395 - tap + bob(3.1, 4) + (1 - fly) * 160;
        const rot = -0.32 + (1 - fly) * 0.5;
        if (fly > 0) {
          contactShadow(ctx, 870 + (1 - fly) * 200, FLOOR + 20, 70, 14, 0.25 * fly, 14);
          puffy(ctx, { x: cx, y: cy, rot, s: 1.08, path: cursorPath(), bb: CURSOR_BB,
            face: [H.hex('#ffe3ea'), H.hex('#ffb1c2'), H.hex('#ff8fa8')], side: [H.hex('#f57f9b'), H.hex('#cc4f72')], ext: [10, 16], spec: [26, 40, 30, 50] });
        }
      }

      // ---------- out-of-focus foreground element (drifts in from the corner) ----------
      {
        const fi = H.ease.out(ph(0.3, 1.6));
        const fg = H.layer(W, H_), gc = fg.getContext('2d');
        sphere(gc, 1238 + (1 - fi) * 160, 678 + (1 - fi) * 90 + bob(4, 3), 100, H.hex('#f3eeff'), H.hex('#d4c8ff'), H.hex('#a998ec'));
        ctx.save(); ctx.filter = 'blur(9px)'; ctx.drawImage(fg, 0, 0); ctx.restore();
      }
      // ---------- caption chip ----------
      ctx.font = '600 20px "Fredoka"'; ctx.fillStyle = `rgba(85,62,165,${0.8 * ph(1.8, 2.3)})`; ctx.textAlign = 'left';
      try { ctx.letterSpacing = '1px'; } catch (e) {}
      ctx.fillText('AI ASSISTANTS · 101', 64, 676);
      try { ctx.letterSpacing = '0px'; } catch (e) {}
      H.grain(ctx, W, H_, 0.018, 9 + Math.floor(t * 12));
    },
  });
}
