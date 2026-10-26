{
  // ---------- voxel helpers: ortho dimetric projection, face culling, vertex AO, ray-marched shadows ----------
  const ELEV = Math.PI / 6;
  let ca = Math.cos(0.62), sa = Math.sin(0.62);
  const sP = Math.sin(ELEV), cP = Math.cos(ELEV);
  const setYaw = (y) => { ca = Math.cos(y); sa = Math.sin(y); };
  const makeProj = (cx, cy, s) => (x, y, z) => [cx + (x * ca - y * sa) * s, cy + (x * sa + y * ca) * sP * s - z * cP * s];
  const depthOf = (x, y, z) => (x * sa + y * ca) * cP + z * sP;
  const K = (x, y, z) => ((z + 8) * 128 + (y + 32)) * 128 + (x + 32);
  const FACES = [
    { n: [0, 0, 1], o: [0, 0, 1], t1: [1, 0, 0], t2: [0, 1, 0], light: 1.0, tint: [1.0, 0.98, 0.93] },
    { n: [0, 1, 0], o: [0, 1, 0], t1: [1, 0, 0], t2: [0, 0, 1], light: 0.8, tint: [0.97, 0.95, 1.0] },
    { n: [1, 0, 0], o: [1, 0, 0], t1: [0, 1, 0], t2: [0, 0, 1], light: 0.64, tint: [0.92, 0.92, 1.04] },
  ];

  function buildScene(t) {
    const V = new Map();
    const set = (x, y, z, c, e) => V.set(K(x, y, z), { x, y, z, c: Array.isArray(c) ? c : H.hex(c), e: !!e });
    const del = (x, y, z) => V.delete(K(x, y, z));
    const fill = (x0, x1, y0, y1, z0, z1, c, e) => { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) set(x, y, z, c, e); };
    const nz = H.makeNoise(4), r = H.rng(8);
    // --- island ---
    const C = 15.5, R = 12.6, TOP = 10;
    for (let x = 0; x < 32; x++) for (let y = 0; y < 32; y++) {
      const ang = Math.atan2(y - C, x - C);
      const d = Math.hypot(x - C, y - C) + nz.n2(Math.cos(ang) * 1.7, Math.sin(ang) * 1.7) * 2.2;
      if (d > R) continue;
      // top height: low hill at the back
      let top = TOP + (nz.fbm2(x * 0.12, y * 0.12, 2) > 0.12 && d < R - 2 ? 1 : 0) + (Math.hypot(x - 9, y - 7) < 4 ? 1 : 0);
      for (let k = 0; ; k++) {
        const z = top - k;
        const rk = R * (1 - Math.pow(Math.max(0, k - 1) / 12.5, 1.35)) + nz.n2(x * 0.3, y * 0.3 + k) * 1.1;
        if (d > rk || z < -4) break;
        let c;
        if (k === 0) c = H.mix('#9fcb55', '#b9d65e', H.clamp(0.5 + nz.n2(x * 0.4, y * 0.4) * 0.8 + (r() - 0.5) * 0.3));
        else if (k <= 2) c = H.mix('#d08a4f', '#c27c4a', r());
        else if (k <= 5) c = (z % 3 === 0) ? H.hex('#b06a40') : H.mix('#bd7548', '#a9653e', r());
        else c = H.mix('#8d5a44', '#7a4c3d', r());
        set(x, y, z, c);
      }
    }
    // pond (front-left)
    for (let x = 6; x <= 12; x++) for (let y = 18; y <= 24; y++) {
      const d = Math.hypot((x - 9) / 3.4, (y - 21) / 3.2);
      if (d < 1) { del(x, y, TOP); del(x, y, TOP + 1); set(x, y, TOP - 1, d < 0.75 ? '#5ec7dc' : '#7fd6e3'); }
      else if (d < 1.35 && V.has(K(x, y, TOP))) set(x, y, TOP, '#f2d49a');
    }
    // path stones
    for (const [x, y] of [[15, 25], [16, 24], [17, 23], [16, 26]]) if (V.has(K(x, y, TOP))) set(x, y, TOP, '#e9dcc4');
    // --- trees ---
    const tree = (x, y, h, rad, pal, seed) => {
      const tr = H.rng(seed);
      let base = TOP + 1; while (V.has(K(x, y, base))) base++;
      fill(x, x, y, y, base, base + h, '#8a5a3b');
      const cz = base + h + rad * 0.6;
      for (let dx = -Math.ceil(rad); dx <= rad; dx++) for (let dy = -Math.ceil(rad); dy <= rad; dy++) for (let dz = -Math.ceil(rad); dz <= rad + 1; dz++) {
        const d = Math.hypot(dx, dy, dz * 0.9) + tr.range(-0.35, 0.35);
        if (d <= rad) set(x + dx, y + dy, Math.round(cz + dz), tr.pick(pal));
      }
    };
    tree(6, 10, 4, 3.4, [H.hex('#6fb04a'), H.hex('#86c35a'), H.hex('#5f9f42'), H.hex('#7dbb52')], 3);
    tree(22, 8, 3, 2.7, [H.hex('#ffad3b'), H.hex('#ff9a2e'), H.hex('#ffc14d'), H.hex('#f58a2a')], 5);
    tree(24, 20, 1, 1.6, [H.hex('#86c35a'), H.hex('#6fb04a'), H.hex('#9ccf62')], 6);
    // flowers + rocks
    const fr = H.rng(14);
    for (let i = 0; i < 26; i++) {
      const x = fr.int(4, 27), y = fr.int(4, 27);
      let z = TOP + 3; while (z > TOP - 1 && !V.has(K(x, y, z))) z--;
      const below = V.get(K(x, y, z));
      if (!below || below.c[1] < 150 || V.has(K(x, y, z + 1))) continue; // only on grass
      if (Math.abs(x - 17) < 4 && Math.abs(y - 16) < 4) continue;
      set(x, y, z + 1, fr.pick(['#ff6b6b', '#fff3d6', '#ffd23f', '#ff9ecb']));
    }
    fill(19, 20, 23, 24, TOP + 1, TOP + 1, '#b8afa6'); set(20, 24, TOP + 2, '#cfc7bf');
    fill(5, 5, 12, 13, TOP + 1, TOP + 1, '#b8afa6');
    // --- robot (front faces +y) ---
    const wave = t > 3.15 && Math.sin((t - 3.15) * 5 + 1.6) > 0 ? 1 : 0;
    const rx = 15, ry = 15;
    let rz = TOP + 1; while (V.has(K(rx + 1, ry + 1, rz))) rz++;
    const Rb = (x0, x1, y0, y1, z0, z1, c, e) => fill(rx + x0, rx + x1, ry + y0, ry + y1, rz + z0, rz + z1, c, e);
    Rb(0, 1, 0, 2, 0, 0, '#4a4458'); Rb(3, 4, 0, 2, 0, 0, '#4a4458');
    Rb(0, 1, 0, 1, 1, 2, '#b9b3ad'); Rb(3, 4, 0, 1, 1, 2, '#b9b3ad');
    Rb(-1, 5, -1, 2, 3, 7, '#f4ead8');
    Rb(-1, 5, -1, 2, 3, 3, '#e3d6c0');
    Rb(1, 3, 2, 2, 4, 6, '#ff8a3d'); Rb(2, 2, 2, 2, 5, 5, '#fff2a8', true);
    Rb(-2, -2, 0, 1, 4, 7, '#b9b3ad'); Rb(-2, -2, 0, 1, 3, 3, '#4a4458');
    if (wave) { Rb(6, 6, 0, 1, 6, 10, '#b9b3ad'); Rb(6, 6, 0, 1, 11, 11, '#4a4458'); }
    else { Rb(6, 6, 0, 1, 6, 7, '#b9b3ad'); Rb(7, 7, 0, 1, 7, 10, '#b9b3ad'); Rb(7, 7, 0, 1, 11, 11, '#4a4458'); }
    Rb(1, 3, 0, 1, 8, 8, '#8f8a86');
    Rb(-1, 5, -1, 3, 9, 13, '#f4ead8');
    Rb(-1, 5, -1, 3, 13, 13, '#ff8a3d');
    Rb(0, 4, 3, 3, 10, 12, '#2b2d42');
    Rb(1, 1, 3, 3, 11, 11, '#7ff9ff', true); Rb(3, 3, 3, 3, 11, 11, '#7ff9ff', true);
    Rb(-2, -2, 0, 1, 10, 11, '#ff8a3d'); Rb(6, 6, 0, 1, 10, 11, wave ? '#b9b3ad' : '#ff8a3d');
    Rb(2, 2, 1, 1, 14, 15, '#8f8a86'); Rb(2, 2, 1, 1, 16, 16, '#ff5a4f', true);
    return { V, set, TOP };
  }

  // opts.at(v) -> appear time; voxels drop in from above over DROP seconds. Only landed voxels occlude / cast AO.
  const DROP = 0.32;
  function drawVoxels(ctx, V0, P, s, opts = {}) {
    const t = opts.t ?? 99;
    let V = V0;
    const falling = [];
    if (opts.at) {
      V = new Map();
      for (const [k, v] of V0) {
        const a = opts.at(v);
        if (t >= a + DROP) V.set(k, v);
        else if (t > a) { const q = (t - a) / DROP; falling.push({ ...v, z: v.z + (1 - H.ease.out(q)) * 7, fall: true }); }
      }
    }
    const has = (x, y, z) => V.has(K(x, y, z));
    const L = [-0.42, -0.62, 0.66]; // toward light (back-left, high)
    const shadowed = (px, py, pz) => {
      for (let i = 1; i < 44; i++) {
        const x = px + L[0] * i * 0.5, y = py + L[1] * i * 0.5, z = pz + L[2] * i * 0.5;
        if (z > 40) return 0;
        if (has(Math.floor(x), Math.floor(y), Math.floor(z))) return 1;
      }
      return 0;
    };
    const list = [...V.values(), ...falling];
    list.sort((a, b) => depthOf(a.x, a.y, a.z) - depthOf(b.x, b.y, b.z));
    const N = 4;
    const glows = [];
    for (let v of list) {
      const v0 = v;
      if (opts.cull) { const c = P(v.x + 0.5, v.y + 0.5, v.z + 0.5); if (c[0] < -s * 2 || c[0] > opts.cull[0] + s * 2 || c[1] < -s * 2 || c[1] > opts.cull[1] + s * 2) continue; }
      for (const F of FACES) {
        v = v0;
        const fx = v.x + F.n[0], fy = v.y + F.n[1], fz = v.z + F.n[2];
        if (!v.fall && has(fx, fy, fz)) continue;
        const O = [v.x + F.o[0], v.y + F.o[1], v.z + F.o[2]];
        const p0 = P(...O), p1 = P(O[0] + F.t1[0], O[1] + F.t1[1], O[2] + F.t1[2]), p3 = P(O[0] + F.t2[0], O[1] + F.t2[1], O[2] + F.t2[2]);
        const e1 = [p1[0] - p0[0], p1[1] - p0[1]], e2 = [p3[0] - p0[0], p3[1] - p0[1]];
        if (v.e && opts.power === false) v = { ...v, e: false, c: [70, 66, 88] };
        if (v.fall) {
          const c = v.c.map((ch, i) => ch * F.light * F.tint[i]);
          const st = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
          ctx.fillStyle = st; ctx.strokeStyle = st; ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p0[0] + e1[0], p0[1] + e1[1]); ctx.lineTo(p0[0] + e1[0] + e2[0], p0[1] + e1[1] + e2[1]); ctx.lineTo(p0[0] + e2[0], p0[1] + e2[1]); ctx.closePath(); ctx.fill(); ctx.stroke();
          continue;
        }
        if (v.e) {
          const c = H.mix(v.c, [255, 255, 255], F === FACES[0] ? 0.25 : 0.05);
          const st = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
          ctx.fillStyle = st; ctx.strokeStyle = st; ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p0[0] + e1[0], p0[1] + e1[1]); ctx.lineTo(p0[0] + e1[0] + e2[0], p0[1] + e1[1] + e2[1]); ctx.lineTo(p0[0] + e2[0], p0[1] + e2[1]); ctx.closePath(); ctx.fill(); ctx.stroke();
          if (F === FACES[0] || F === FACES[1]) glows.push([p0[0] + (e1[0] + e2[0]) / 2, p0[1] + (e1[1] + e2[1]) / 2, v.c]);
          continue;
        }
        // vertex AO
        const occ = (a, b) => has(fx + a[0] + b[0], fy + a[1] + b[1], fz + a[2] + b[2]) ? 1 : 0;
        const neg = (a) => [-a[0], -a[1], -a[2]], Z = [0, 0, 0];
        const ao = [];
        for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
          const d1 = i ? F.t1 : neg(F.t1), d2 = j ? F.t2 : neg(F.t2);
          const s1 = occ(d1, Z), s2 = occ(d2, Z), cc = occ(d1, d2);
          ao.push(s1 && s2 ? 3 : s1 + s2 + cc);
        }
        // shadow
        const cx = O[0] + (F.t1[0] + F.t2[0]) / 2 + F.n[0] * 0.01, cy = O[1] + (F.t1[1] + F.t2[1]) / 2 + F.n[1] * 0.01, cz = O[2] + (F.t1[2] + F.t2[2]) / 2 + F.n[2] * 0.01;
        const facing = F.n[0] * L[0] + F.n[1] * L[1] + F.n[2] * L[2];
        const sh = facing > 0 ? shadowed(cx, cy, cz) : 0;
        let base = v.c.map((ch, i) => ch * F.light * F.tint[i]);
        if (sh) base = H.mix(base.map(ch => ch * 0.7), [96, 84, 150], 0.18);
        // underside of island gets darker with depth (bounce light falloff)
        if (opts.depthDark && v.z < 8) base = H.mix(base, [70, 50, 70], H.clamp((8 - v.z) / 16) * 0.5);
        const any = ao[0] + ao[1] + ao[2] + ao[3];
        const darkAt = (u, w) => { const a = H.lerp(H.lerp(ao[0], ao[1], u), H.lerp(ao[2], ao[3], u), w); return 1 - a * 0.13; };
        if (!any) {
          const st = `rgb(${base[0] | 0},${base[1] | 0},${base[2] | 0})`;
          ctx.fillStyle = st; ctx.strokeStyle = st; ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p0[0] + e1[0], p0[1] + e1[1]); ctx.lineTo(p0[0] + e1[0] + e2[0], p0[1] + e1[1] + e2[1]); ctx.lineTo(p0[0] + e2[0], p0[1] + e2[1]); ctx.closePath(); ctx.fill(); ctx.stroke();
        } else {
          for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) {
            const k = darkAt((a + 0.5) / N, (b + 0.5) / N);
            const c = H.mix(base.map(ch => ch * k), [80, 60, 110], (1 - k) * 0.35);
            const st = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
            const u0 = a / N, u1 = (a + 1) / N, w0 = b / N, w1 = (b + 1) / N;
            ctx.fillStyle = st; ctx.strokeStyle = st; ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p0[0] + e1[0] * u0 + e2[0] * w0, p0[1] + e1[1] * u0 + e2[1] * w0);
            ctx.lineTo(p0[0] + e1[0] * u1 + e2[0] * w0, p0[1] + e1[1] * u1 + e2[1] * w0);
            ctx.lineTo(p0[0] + e1[0] * u1 + e2[0] * w1, p0[1] + e1[1] * u1 + e2[1] * w1);
            ctx.lineTo(p0[0] + e1[0] * u0 + e2[0] * w1, p0[1] + e1[1] * u0 + e2[1] * w1);
            ctx.closePath(); ctx.fill(); ctx.stroke();
          }
        }
      }
    }
    return glows;
  }

  // ================= EXPLAINER: one long voxel island; the camera trucks along it and each zone is built from falling voxels =================
  const SPR = {
    cat: ['X...X', 'XXXXX', 'XoXoX', 'XXnXX', '.XXX.'],
    dog: ['.XXX.', 'EXXXE', 'EoXoE', 'XXnXX', '.XXX.'],
    x: ['X...X', '.X.X.', '..X..', '.X.X.', 'X...X'],
    ok: ['....X', '...X.', 'X.X..', '.X...', '.....'],
  };
  function vxBlockTag(ctx, x, y, text, o = {}) {
    ctx.save();
    ctx.font = o.font || '400 28px "Silkscreen"';
    const fsz = parseInt((ctx.font.match(/(\d+)px/) || [0, 22])[1]);
    const w = Math.ceil(ctx.measureText(text).width) + fsz * 1.3, h = o.h || Math.round(fsz * 1.8), k = o.k ?? 1, d = o.d ?? 5;
    ctx.translate(Math.round(x), Math.round(y)); ctx.scale(k, k);
    const bg = H.hex(o.bg || '#fff4e2');
    ctx.fillStyle = H.rgba(bg.map(c => c * 0.62)); ctx.beginPath(); ctx.moveTo(w / 2, -h / 2); ctx.lineTo(w / 2 + d, -h / 2 + d); ctx.lineTo(w / 2 + d, h / 2 + d); ctx.lineTo(w / 2, h / 2); ctx.fill();
    ctx.fillStyle = H.rgba(bg.map(c => c * 0.78)); ctx.beginPath(); ctx.moveTo(-w / 2, h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(w / 2 + d, h / 2 + d); ctx.lineTo(-w / 2 + d, h / 2 + d); ctx.fill();
    // soft cast shadow (front face only) so tags read as floating UI above the diorama
    ctx.save(); ctx.shadowColor = `rgba(90,50,30,${0.35 * (ctx.globalAlpha ?? 1)})`; ctx.shadowBlur = 12 * k; ctx.shadowOffsetY = 6 * k; ctx.shadowOffsetX = 2 * k;
    ctx.fillStyle = H.rgba(bg); ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
    ctx.fillStyle = H.rgba(bg); ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(-w / 2, -h / 2, w, 2); ctx.fillRect(-w / 2, -h / 2, 2, h);
    ctx.fillStyle = o.col || '#74432d'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 1);
    ctx.restore();
  }
  let VX_TEXT = null, VX_SH = null, VX_GR = null;
  function vxRaster(str) {
    if (!VX_TEXT) VX_TEXT = {};
    if (!VX_TEXT[str]) {
      const c = H.layer(200, 12), x = c.getContext('2d', { willReadFrequently: true });
      x.font = '400 8px "Silkscreen"'; x.textBaseline = 'top'; x.fillStyle = '#000'; x.fillText(str, 0, 1);
      const d = x.getImageData(0, 0, 200, 12).data, px = []; let maxX = 0;
      for (let yy = 0; yy < 12; yy++) for (let xx = 0; xx < 200; xx++) if (d[(yy * 200 + xx) * 4 + 3] > 110) { px.push([xx, yy]); maxX = Math.max(maxX, xx); }
      VX_TEXT[str] = { px, w: maxX + 1 };
    }
    return VX_TEXT[str];
  }
  function vxPixelText(ctx, str, cx, cy, ts, colTop, colBot, align = 'center', prog = 1) {
    // rasterise Silkscreen 8px and extrude each pixel as a block (oblique), like the still's title
    const T = vxRaster(str);
    const ox = align === 'center' ? cx - T.w * ts / 2 : cx, oy = cy - 5 * ts;
    const set = new Set(T.px.map(p => p[0] + ',' + p[1]));
    const dx = ts * 0.42;
    const vis = T.px.filter(p => p[0] <= T.w * prog);
    for (const [x, y] of vis) {
      const sx = ox + x * ts, sy = oy + y * ts, c = H.mix(colTop, colBot, y / 9);
      if (!set.has((x + 1) + ',' + y)) { ctx.fillStyle = H.rgba(c.map(v => v * 0.62)); ctx.beginPath(); ctx.moveTo(sx + ts, sy); ctx.lineTo(sx + ts + dx, sy + dx); ctx.lineTo(sx + ts + dx, sy + ts + dx); ctx.lineTo(sx + ts, sy + ts); ctx.fill(); }
      if (!set.has(x + ',' + (y + 1))) { ctx.fillStyle = H.rgba(c.map(v => v * 0.78)); ctx.beginPath(); ctx.moveTo(sx, sy + ts); ctx.lineTo(sx + ts, sy + ts); ctx.lineTo(sx + ts + dx, sy + ts + dx); ctx.lineTo(sx + dx, sy + ts + dx); ctx.fill(); }
    }
    for (const [x, y] of vis) {
      const sx = ox + x * ts, sy = oy + y * ts, c = H.mix(colTop, colBot, y / 9);
      ctx.fillStyle = H.rgba(c); ctx.fillRect(sx - 0.3, sy - 0.3, ts + 0.6, ts + 0.6);
      if (!set.has(x + ',' + (y - 1))) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(sx, sy, ts, Math.max(1, ts * 0.14)); }
    }
    return T.w * ts;
  }
  function vxExplainer(ctx, W, H_, t) {
    const ph = (a, b) => H.clamp((t - a) / (b - a));
    const E = (a, b) => H.ease.inOut(ph(a, b));
    const EO = (a, b) => H.ease.out(ph(a, b));
    const step = (v, n) => Math.floor(v * n) / n; // stepped timing for blocky numbers
    const hsh = (x, y, z) => { const q = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return q - Math.floor(q); };
    // ---------- camera: [t, fx, fy, fz, scale, yaw] ----------
    const KF = [[0, 33, 10, 3, 8.6, 0.48], [1.7, 33, 10, 3, 9.2, 0.52], [2.9, 15, 11, 10, 23, 0.62], [5.8, 17, 11, 10, 23, 0.6], [6.9, 38, 12, 11, 21.5, 0.7], [10.2, 38, 12, 11, 21.5, 0.66], [11.1, 55, 9, 13, 23, 0.55], [12.8, 55, 9, 13, 23, 0.58], [13.7, 33, 10, 3, 9.2, 0.62], [20, 33, 10, 3, 9.2, 0.64]];
    let k = 0; while (k < KF.length - 2 && t > KF[k + 1][0]) k++;
    const A = KF[k], B = KF[k + 1], u = H.ease.inOut(H.clamp((t - A[0]) / (B[0] - A[0])));
    const L = (i) => H.lerp(A[i], B[i], u);
    setYaw(L(5));
    const fx = L(1), fy = L(2), fz = L(3), s = L(4);
    const bob = Math.sin(t * 1.4) * 3;
    const P = (x, y, z) => [640 + ((x - fx) * ca - (y - fy) * sa) * s, 380 + bob + ((x - fx) * sa + (y - fy) * ca) * sP * s - (z - fz) * cP * s];

    // ---------- background ----------
    const bg = ctx.createLinearGradient(0, 0, 0, H_);
    bg.addColorStop(0, '#ffe6c9'); bg.addColorStop(0.6, '#fbd6b8'); bg.addColorStop(1, '#f2c3a6');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
    const g0 = ctx.createRadialGradient(640, 380, 50, 640, 380, 640);
    g0.addColorStop(0, 'rgba(255,248,236,0.85)'); g0.addColorStop(1, 'rgba(255,248,236,0)');
    ctx.fillStyle = g0; ctx.fillRect(0, 0, W, H_);

    // ---------- world ----------
    const V = new Map();
    const at = new Map(); // voxel key -> appear time
    const set = (x, y, z, c, e, a = 0) => { const kk = K(x, y, z); V.set(kk, { x, y, z, c: Array.isArray(c) ? c : H.hex(c), e: !!e }); at.set(kk, a); };
    const fill = (x0, x1, y0, y1, z0, z1, c, e, a = 0) => { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) set(x, y, z, c, e, a); };
    const nz = H.makeNoise(4), r = H.rng(8);
    const TOP = 5;
    for (let x = 0; x < 68; x++) for (let y = 0; y < 22; y++) {
      const e = Math.pow(Math.abs(x - 33.5) / 34, 6) + Math.pow(Math.abs(y - 10.5) / 11, 4) + nz.n2(x * 0.25, y * 0.25) * 0.18;
      if (e > 1) continue;
      for (let kk = 0; kk < 6; kk++) {
        if (kk > 1 && e > 1 - kk * 0.13) break;
        const z = TOP - kk;
        const c = kk === 0 ? H.mix('#9fcb55', '#b9d65e', H.clamp(0.5 + nz.n2(x * 0.4, y * 0.4) * 0.8 + (r() - 0.5) * 0.3)) : kk <= 2 ? H.mix('#d08a4f', '#c27c4a', r()) : H.mix('#a9653e', '#8d5a44', r());
        set(x, y, z, c, false, 0.05 + (kk === 0 ? 0.9 : (5 - kk) * 0.15) + hsh(x, y, z) * 0.35 + Math.abs(x - 33) * 0.006);
      }
    }
    // trees + flowers (decor)
    const tree = (x, y, h, rad, pal, a0) => {
      const tr = H.rng(x * 31 + y);
      fill(x, x, y, y, TOP + 1, TOP + h, '#8a5a3b', false, a0);
      const cz = TOP + h + rad * 0.6;
      for (let dx = -Math.ceil(rad); dx <= rad; dx++) for (let dy = -Math.ceil(rad); dy <= rad; dy++) for (let dz = -Math.ceil(rad); dz <= rad + 1; dz++) if (Math.hypot(dx, dy, dz * 0.9) + tr.range(-0.35, 0.35) <= rad) set(x + dx, y + dy, Math.round(cz + dz), tr.pick(pal), false, a0 + 0.15 + (dz + rad) * 0.03);
    };
    const GREEN = [H.hex('#6fb04a'), H.hex('#86c35a'), H.hex('#5f9f42')], AUT = [H.hex('#ffad3b'), H.hex('#ff9a2e'), H.hex('#ffc14d')];
    tree(3, 3, 3, 2.2, GREEN, 1.2); tree(24, 3, 2, 1.8, AUT, 1.3); tree(41, 2, 3, 2.0, GREEN, 1.4); tree(64, 15, 2, 1.8, AUT, 1.5); tree(2, 18, 2, 1.6, GREEN, 1.25);
    const fr = H.rng(14);
    for (let i = 0; i < 40; i++) { const x = fr.int(2, 65), y = fr.int(1, 20); if (!V.has(K(x, y, TOP)) || V.has(K(x, y, TOP + 1))) continue; if (y > 11 && y < 17 && x < 45) continue; set(x, y, TOP + 1, fr.pick(['#ff6b6b', '#fff3d6', '#ffd23f', '#ff9ecb']), false, 1.4 + fr() * 0.4); }

    // --- zone A: data (towers of example cards + conveyor into the robot) ---
    const ZA = 2.3; // zone props drop in as the camera arrives
    fill(3, 26, 13, 15, TOP + 1, TOP + 1, '#5b5468', false, ZA);
    for (let x = 3; x <= 26; x += 3) set(x, 13, TOP + 1, '#8f8a86', false, ZA); // rollers
    const towerH = Math.floor(1 + 8 * Math.pow(EO(2.7, 5.8), 1.1));
    [[5, 5, '#c9c2f2'], [11, 6, '#f2c9a0'], [17, 5, '#c9c2f2']].forEach(([x, y, c], ti) => {
      for (let z = 0; z < towerH - ti % 2; z++) fill(x, x + 3, y, y + 2, TOP + 1 + z, TOP + 1 + z, z % 2 ? '#fff4e2' : c, false, z === 0 ? ZA : 2.7 + z * 0.36 + ti * 0.05);
    });
    // cards: 7x1x7 voxel pixel-art pictures riding the belt in whole-voxel steps
    const card = (x0, kind, a0, test) => {
      const spr = SPR[kind], fur = kind === 'cat' ? H.hex('#b9b0f0') : H.hex('#e8b07a'), ear = kind === 'cat' ? fur : H.hex('#b07a4a');
      for (let cx = 0; cx < 7; cx++) for (let cz = 0; cz < 7; cz++) {
        let c = H.hex(test ? '#ffd9cf' : '#fff8ee');
        if (cx > 0 && cx < 6 && cz > 0 && cz < 6) { const ch = spr[cz - 1][cx - 1]; if (ch === 'X') c = fur; else if (ch === 'E') c = ear; else if (ch === 'o' || ch === 'n') c = H.hex('#2b2d42'); }
        set(x0 + cx, 14, TOP + 8 - cz, c, false, a0);
      }
    };
    const cardsOn = [];
    if (t > 2.6 && t < 6.6) for (let j = 0; j < 6; j++) {
      const x = Math.floor((t - 2.6) * 7.5) - j * 9 + 3;
      if (x < 3 || x > 20) continue;
      const kind = (j * 5 + 2) % 3 === 0 ? 'dog' : (j % 2 ? 'cat' : 'dog');
      card(x, kind, -1); cardsOn.push([x, kind]);
    }
    let testX = null;
    if (t > 5.9 && t < 7.0) { testX = Math.min(20, 3 + Math.floor(E(5.9, 6.9) * 17)); card(testX, 'cat', -1, true); }

    // --- zone B: the robot model + answer board ---
    const ZB = 5.95;
    const rx = 30, ry = 11, rz = TOP + 1;
    const Rb = (x0, x1, y0, y1, z0, z1, c, e) => { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) set(rx + x, ry + y, rz + z, c, e, ZB + (z + 0) * 0.045 + hsh(x, y, z) * 0.1); };
    const adjusting = t > 8.6 && t < 9.4, adjusted = t >= 9.4;
    Rb(0, 1, 0, 2, 0, 0, '#4a4458'); Rb(3, 4, 0, 2, 0, 0, '#4a4458');
    Rb(0, 1, 0, 1, 1, 2, '#b9b3ad'); Rb(3, 4, 0, 1, 1, 2, '#b9b3ad');
    Rb(-1, 5, -1, 2, 3, 7, '#f4ead8'); Rb(-1, 5, -1, 2, 3, 3, '#e3d6c0');
    // chest "weights" equaliser: three emissive bars that re-level when the model adjusts
    const eqA = [1, 3, 2], eqB = [3, 2, 3];
    const jig = adjusting ? Math.floor(t * 12) % 3 : -1;
    for (let b = 0; b < 3; b++) {
      const hb = adjusted ? eqB[b] : adjusting ? 1 + ((b + jig) % 3) : eqA[b];
      for (let z = 0; z < 3; z++) Rb(1 + b, 1 + b, 2, 2, 4 + z, 4 + z, z < hb ? (adjusting ? '#ff8a3d' : '#7ff9ff') : '#3a3650', z < hb);
    }
    Rb(-2, -2, 0, 1, 4, 7, '#b9b3ad'); Rb(-2, -2, 0, 1, 3, 3, '#4a4458');
    Rb(6, 6, 0, 1, 4, 7, '#b9b3ad'); Rb(6, 6, 0, 1, 3, 3, '#4a4458');
    Rb(1, 3, 0, 1, 8, 8, '#8f8a86');
    Rb(-1, 5, -1, 3, 9, 13, '#f4ead8'); Rb(-1, 5, -1, 3, 13, 13, '#ff8a3d');
    Rb(0, 4, 3, 3, 10, 12, '#2b2d42');
    const eyeCol = (t > 8.0 && t < 8.6 && Math.floor(t * 10) % 2) ? '#ff5a4f' : '#7ff9ff';
    Rb(1, 1, 3, 3, 11, 11, eyeCol, true); Rb(3, 3, 3, 3, 11, 11, eyeCol, true);
    Rb(-2, -2, 0, 1, 10, 11, '#ff8a3d'); Rb(6, 6, 0, 1, 10, 11, '#ff8a3d');
    Rb(2, 2, 1, 1, 14, 15, '#8f8a86'); Rb(2, 2, 1, 1, 16, 16, adjusting && Math.floor(t * 8) % 2 ? '#ffd23f' : '#ff5a4f', true);
    // answer board
    const BX0 = 39, BY = 12, BZ0 = TOP + 5;
    const wrongFlash = t > 7.4 && t < 9.4 ? (Math.floor(t * 6) % 2 === 0 || t > 8.0) : false;
    const boardCol = t >= 9.4 ? '#d8f5e6' : wrongFlash ? '#ffd2cc' : '#fff8ee';
    fill(BX0 + 4, BX0 + 5, BY, BY, TOP + 1, BZ0 - 1, '#8f8a86', false, 6.2);
    for (let x = BX0; x <= BX0 + 9; x++) for (let z = BZ0; z <= BZ0 + 5; z++) {
      const edge = x === BX0 || x === BX0 + 9 || z === BZ0 || z === BZ0 + 5;
      set(x, BY, z, edge ? '#5b5468' : boardCol, false, 6.25 + (z - BZ0) * 0.05);
    }
    // verdict sprite in voxels beside the board
    if (t > 7.4 && t < 10.7) {
      const ok = t >= 9.4, spr = ok ? SPR.ok : SPR.x, col = ok ? '#3ccf9a' : '#ff5a4f', a0 = ok ? 9.4 : 7.4;
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if (spr[j][i] === 'X') set(BX0 + 11 + i, BY, BZ0 + 5 - j, col, true, a0 + i * 0.02);
    }
    // --- zone C: voxel bar chart, one column per training round, stacked block by block ---
    const ACCS = [61, 72, 80, 86, 90, 93, 95, 97];
    fill(46, 63, 7, 10, TOP + 1, TOP + 1, '#e3d6c0', false, 10.6);
    let topBlock = null;
    ACCS.forEach((a, i) => {
      const hgt = Math.round((a - 50) / 50 * 14);
      for (let z = 0; z < hgt; z++) {
        const a0 = 10.9 + i * 0.2 + z * 0.035;
        if (t < a0) continue;
        fill(47 + i * 2, 47 + i * 2, 8, 9, TOP + 2 + z, TOP + 2 + z, i === 7 ? '#ff8a3d' : (z % 2 ? '#7fc8e8' : '#9fd8f0'), false, a0);
        topBlock = [47 + i * 2 + 0.5, 9, TOP + 3 + z, i];
      }
    });

    // ---------- soft ground shadow far below the floating island (as in the still) ----------
    {
      const sw = W >> 2, shh = H_ >> 2;
      if (!VX_SH || VX_SH.width !== sw) VX_SH = H.layer(sw, shh);
      const lc = VX_SH.getContext('2d'); lc.clearRect(0, 0, sw, shh);
      lc.save(); lc.filter = `blur(${Math.max(2, s * 0.36).toFixed(1)}px)`; lc.fillStyle = 'rgb(150,80,70)'; lc.beginPath();
      const GZ = -17; // ground plane, shifted away from the back-left light
      for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, q = P(33.5 + 4 + Math.cos(a) * 30, 10.5 + 6 + Math.sin(a) * 10, GZ); i ? lc.lineTo(q[0] / 4, q[1] / 4) : lc.moveTo(q[0] / 4, q[1] / 4); }
      lc.fill(); lc.restore();
      ctx.save(); ctx.globalAlpha = 0.26 * EO(0.3, 2.0); ctx.drawImage(VX_SH, 0, 0, W, H_); ctx.restore();
    }

    // ---------- render voxels (drop-in per voxel) ----------
    const glows = drawVoxels(ctx, V, P, s, { depthDark: true, t, at: (v) => at.get(K(v.x, v.y, v.z)), cull: [W, H_] });
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, y, c] of glows) { const rr = s * 1.3; const g = ctx.createRadialGradient(x, y, 1, x, y, rr); g.addColorStop(0, H.rgba(c, 0.5)); g.addColorStop(1, H.rgba(c, 0)); ctx.fillStyle = g; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    ctx.globalCompositeOperation = 'source-over';

    // ---------- voxel-chain arrows (little cubes along a 3D arc, stepped) ----------
    const cube = (x, y, z, sz, col) => {
      const c = H.hex(col), h = sz / 2;
      const p = (a, b, cc) => P(x + a, y + b, z + cc);
      const face = (pts, kf) => { ctx.fillStyle = H.rgba(c.map(v => v * kf)); ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill(); };
      face([p(-h, -h, h), p(h, -h, h), p(h, h, h), p(-h, h, h)], 1);
      face([p(-h, h, -h), p(h, h, -h), p(h, h, h), p(-h, h, h)], 0.8);
      face([p(h, -h, -h), p(h, h, -h), p(h, h, h), p(h, -h, h)], 0.64);
    };
    const chain = (a, b, lift, prog, col, n = 14) => {
      const pts = [];
      for (let i = 0; i <= n; i++) { const uu = i / n; pts.push([H.lerp(a[0], b[0], uu), H.lerp(a[1], b[1], uu), H.lerp(a[2], b[2], uu) + Math.sin(uu * Math.PI) * lift]); }
      const m = Math.floor(prog * n);
      const list = pts.slice(0, m + 1).map((p, i) => ({ p, i })).sort((q, w) => depthOf(...q.p) - depthOf(...w.p));
      for (const { p, i } of list) cube(p[0], p[1], p[2], i === m && prog >= 1 ? 0.9 : 0.55, col);
      return pts;
    };
    // data -> robot
    if (t > 3.3 && t < 6.6) chain([12, 14, TOP + 11], [29, 12, TOP + 12], 3.5, step(E(3.3, 4.3), 14), '#74432d');
    // loop arrows
    if (t > 6.8 && t < 10.6) {
      chain([35, 12, TOP + 13], [41, BY, BZ0 + 7], 3, step(E(6.8, 7.2), 10), '#74432d', 10);
      if (t > 8.0) chain([45, BY, BZ0 + 7], [32, 12, TOP + 18], 5, step(E(8.0, 8.6), 16), '#ff5a4f', 16);
    }
    // error packet riding the red chain
    if (t > 8.0 && t < 8.75) { const uu = step(E(8.0, 8.6), 16); const p = [H.lerp(45, 32, uu), H.lerp(BY, 12, uu), H.lerp(BZ0 + 7, TOP + 18, uu) + Math.sin(uu * Math.PI) * 5 + 0.8]; cube(p[0], p[1], p[2], 1.2, '#ff5a4f'); }

    // ---------- overlays that land on things ----------
    const planeY = (x0, y, z0) => { const o = P(x0, y, z0), ex = P(x0 + 1, y, z0), ez = P(x0, y, z0 - 1); ctx.transform(ex[0] - o[0], ex[1] - o[1], ez[0] - o[0], ez[1] - o[1], o[0], o[1]); };
    // counter tag rects (screen space) so belt tags that slide under the counter fade out instead of peeking out
    const cntRects = [];
    if (t > 2.7 && t < 6.9) {
      const p = P(12.5, 6, TOP + towerH + 3), kk2 = H.ease.back(ph(2.8, 3.1)) * (1 - ph(6.5, 6.9));
      ctx.save(); ctx.font = '400 54px "Silkscreen"'; const w1 = (ctx.measureText('1,000,000').width + 54 * 1.3) * kk2; ctx.font = '400 28px "Silkscreen"'; const w2 = (ctx.measureText('EXAMPLES').width + 28 * 1.3) * kk2; ctx.restore();
      cntRects.push([p[0] - w1 / 2 - 6, p[1] - 80 - 43 * kk2 - 6, p[0] + w1 / 2 + 14, p[1] - 80 + 43 * kk2 + 14]);
      cntRects.push([p[0] - w2 / 2 - 6, p[1] - 14 - 25 * kk2 - 6, p[0] + w2 / 2 + 12, p[1] - 14 + 25 * kk2 + 12]);
    }
    const tagVis = (x, y) => { const hw = 50, hh = 26; let v = 1; for (const [x0, y0, x1, y1] of cntRects) { const ox = Math.max(0, Math.min(x + hw, x1) - Math.max(x - hw, x0)), oy = Math.max(0, Math.min(y + hh, y1) - Math.max(y - hh, y0)); v = Math.min(v, 1 - H.clamp(ox * oy / (hw * hh * 4) * 4)); } return v; };
    for (const [x, kind] of cardsOn) { const p = P(x + 3.5, 14, TOP + 10.5); vxBlockTag(ctx, p[0], p[1] - 10, kind.toUpperCase(), { k: EO(2.6, 2.9) * H.clamp((20 - x) / 3) * tagVis(p[0], p[1] - 10), font: '400 28px "Silkscreen"', d: 4 }); }
    if (testX !== null) { const p = P(testX + 3.5, 14, TOP + 10.5); vxBlockTag(ctx, p[0], p[1] - 10, '?', { bg: '#ff8a3d', col: '#fff', d: 4 }); }
    // counter
    if (t > 2.7 && t < 6.9) {
      const cnt = Math.floor(1e6 * Math.pow(EO(2.9, 5.7), 1.6) / 1000) * 1000 + (t > 5.7 ? 0 : Math.floor(hsh(Math.floor(t * 12), 1, 1) * 999));
      const p = P(12.5, 6, TOP + towerH + 3);
      { const kk2 = H.ease.back(ph(2.8, 3.1)) * (1 - ph(6.5, 6.9)); vxBlockTag(ctx, p[0], p[1] - 80, Math.min(1e6, cnt).toLocaleString('en-US'), { k: kk2, font: '400 54px "Silkscreen"', h: 86, d: 8 }); vxBlockTag(ctx, p[0], p[1] - 14, 'EXAMPLES', { k: kk2, bg: '#74432d', col: '#fff4e2' }); }
    }
    if (t > 4.1 && t < 6.6) { const p = P(30, 12, TOP + 15); vxBlockTag(ctx, p[0], p[1], 'INTO THE MODEL', { k: H.ease.back(ph(4.1, 4.4)) * (1 - ph(6.3, 6.6)), font: '400 28px "Silkscreen"', bg: '#74432d', col: '#fff4e2', d: 4 }); }
    // board text drawn in the board's plane
    if (t > 7.0 && t < 10.9) {
      ctx.save(); planeY(BX0 + 1.3, BY + 1, BZ0 + 3.9);
      ctx.font = '400 2.7px "Silkscreen"'; ctx.fillStyle = '#2b2d42'; ctx.textBaseline = 'top';
      ctx.fillText(t >= 9.4 ? 'CAT' : 'DOG?', 0.4, 0); ctx.restore();
    }
    if (t > 6.8 && t < 10.6) {
      const fade = 1 - ph(10.3, 10.6);
      ctx.save(); ctx.globalAlpha = fade;
      const g = P(38, 12, TOP + 16.5); vxBlockTag(ctx, g[0] + 28, g[1] - 6, '1 GUESS', { k: H.ease.back(ph(6.9, 7.2)) });
      if (t > 7.4) { const c = P(BX0 + 5, BY, BZ0 + 7.5); vxBlockTag(ctx, c[0], c[1] - 14, '2 CHECK', { k: H.ease.back(ph(7.45, 7.75)) }); }
      if (t > 7.6 && t < 9.4) { const c = P(BX0 + 5, BY + 1, BZ0 - 1.2); vxBlockTag(ctx, c[0], c[1] + 10, 'ANSWER: CAT', { k: H.ease.back(ph(7.65, 7.95)), bg: '#2b2d42', col: '#fff4e2', font: '400 28px "Silkscreen"', d: 4 }); }
      if (t > 8.4) { const c = P(rx + 2, ry + 3, rz + 2); vxBlockTag(ctx, c[0] - 70, c[1], '3 ADJUST', { k: H.ease.back(ph(8.5, 8.8)), bg: '#ff8a3d', col: '#fff' }); }
      if (t > 8.1 && t < 9.3) { const c = P(37, 13, TOP + 21); vxBlockTag(ctx, c[0], c[1], 'ERROR!', { k: H.ease.back(ph(8.1, 8.3)), bg: '#ffd2cc', col: '#c2382a', font: '400 28px "Silkscreen"', d: 4 }); }
      if (t >= 9.4) { const c = P(BX0 + 13, BY, BZ0 + 7.5); vxBlockTag(ctx, c[0], c[1] - 14, 'GUESS AGAIN', { k: H.ease.back(ph(9.45, 9.75)), bg: '#3ccf9a', col: '#fff' }); }
      // emphasis: blocky bracket corners closing in on the wrong answer
      if (t > 7.4 && t < 9.4) {
        const a = P(BX0 - 0.5, BY + 1, BZ0 + 6.5), b = P(BX0 + 16.5, BY + 1, BZ0 - 0.5), pad = 26 * (1 - EO(7.4, 7.7)) + 8;
        const xs = [Math.min(a[0], b[0]) - pad, Math.max(a[0], b[0]) + pad], ys = [Math.min(a[1], b[1]) - pad, Math.max(a[1], b[1]) + pad];
        ctx.fillStyle = '#ff5a4f'; const L2 = 22, th = 6;
        if (Math.floor(t * 8) % 2 === 0 || t > 7.9) for (const X of xs) for (const Y of ys) { const sx = X === xs[0] ? 1 : -1, sy = Y === ys[0] ? 1 : -1; ctx.fillRect(sx > 0 ? X : X - L2, sy > 0 ? Y : Y - th, L2, th); ctx.fillRect(sx > 0 ? X : X - th, sy > 0 ? Y : Y - L2, th, L2); }
      }
      ctx.restore();
    }
    // accuracy counter riding the newest column
    if (t > 10.9 && topBlock) {
      const cur = Math.round(H.lerp(61, 97, step(H.ease.inOut(ph(11.0, 12.6)), 36)));
      const p = P(topBlock[0], topBlock[1], topBlock[2] + 1.5);
      // baseline label sits behind the moving accuracy tags (they float in front), nudged left to overlap less
      if (t > 11.2 && t < 13.3) { const q = P(47.5, 9, TOP + 2 + 7 + 1.2); vxBlockTag(ctx, q[0] - 30, q[1] - 14, 'ROUND 1: 61%', { k: EO(11.2, 11.5) * (1 - ph(13.0, 13.3)), font: '400 28px "Silkscreen"', d: 4 }); }
      const pop = t > 12.6 ? 1 + 0.2 * Math.sin(Math.min(1, (t - 12.6) / 0.35) * Math.PI) : 1;
      { const kk2 = H.ease.back(ph(10.95, 11.25)) * pop; vxBlockTag(ctx, p[0], p[1] - 66, `${cur}%`, { k: kk2, font: '400 60px "Silkscreen"', h: 94, bg: cur >= 97 ? '#ff8a3d' : '#fff4e2', col: cur >= 97 ? '#fff' : '#74432d', d: 8 }); vxBlockTag(ctx, p[0], p[1] - 140, 'ACCURACY', { k: kk2, bg: '#74432d', col: '#fff4e2' }); }
      if (t < 13.3) { const q = P(55, 10.5, TOP + 1); ctx.save(); ctx.globalAlpha = EO(11.0, 11.5) * (1 - ph(13.0, 13.3)); vxBlockTag(ctx, q[0] - 20, q[1] + 30, 'TRAINING ROUNDS ->', { font: '400 28px "Silkscreen"', d: 4, bg: '#74432d', col: '#fff4e2' }); ctx.restore(); }
      if (t > 12.6 && t < 13.4) { ctx.save(); ctx.globalAlpha = 1 - ph(12.6, 13.4); ctx.fillStyle = '#ff8a3d'; const rr = 40 + 60 * EO(12.6, 13.4); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.fillRect(Math.round(p[0] + Math.cos(a) * rr * 1.6 - 4), Math.round(p[1] - 24 + Math.sin(a) * rr - 4), 8, 8); } ctx.restore(); }
    }
    // ---------- hook (blocky extruded pixel title) → header ----------
    {
      const sh = E(1.4, 2.4);
      const ts = H.lerp(7.4, 3.6, sh), prog = step(EO(0.15, 0.9), 18);
      const yHook = 170;
      const tw = vxRaster('HOW DOES AI LEARN?').w * ts;
      const x = H.lerp(640 - tw / 2, 44, sh), y = H.lerp(yHook, 58, sh);
      if (sh > 0) { ctx.save(); ctx.globalAlpha = sh; const bx = x - 12, by = y - 4.6 * ts - 8, bw = tw + 26, bh = 9 * ts + 14, d = 5;
        ctx.fillStyle = '#b89a80'; ctx.fillRect(bx + d, by + d, bw, bh); ctx.fillStyle = '#fff4e2'; ctx.fillRect(bx, by, bw, bh); ctx.restore(); }
      vxPixelText(ctx, 'HOW DOES AI LEARN?', x, y, ts, H.hex('#8a5236'), H.hex('#ff7a2f'), 'left', prog);
    }
    // ---------- takeaway ----------
    if (t > 13.0) {
      const kk = H.ease.back(ph(13.0, 13.45));
      vxBlockTag(ctx, 640, 630, 'More examples → better guesses', { k: kk, font: '700 44px "Fredoka"', h: 82, d: 8 });
    }
    H.vignette(ctx, W, H_, 0.18, '120,60,40');
    // static fine grain like the still's H.grain(0.025, seed 3), cached as a light/dark speckle layer (one blit)
    if (!VX_GR || VX_GR.width !== W) {
      VX_GR = H.layer(W, H_); const gc = VX_GR.getContext('2d'), id = gc.createImageData(W, H_), d = id.data, gr = H.rng(3);
      for (let i = 0; i < d.length; i += 4) { const n = (gr() - 0.5) * 0.025 * 255; const v = n > 0 ? 255 : 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.min(255, Math.abs(n) * (n > 0 ? 5 : 1.1)); }
      gc.putImageData(id, 0, 0);
    }
    ctx.drawImage(VX_GR, 0, 0);
  }

  // ---------- sound: a toy voxel island (little blocks clattering down and clicking into place) ----------
  function vxSound(k) {
    const D = 14.5, LAND = 0.22; // a dropped voxel visibly lands ~0.22 s into its 0.32 s DROP
    const ph = (t, a, b) => H.clamp((t - a) / (b - a));
    const inv = (u) => (u < 0.5 ? Math.cbrt(u / 4) : 1 - Math.cbrt((1 - u) * 2) / 2); // inverse of H.ease.inOut
    const invO = (u) => 1 - Math.cbrt(1 - u); // inverse of H.ease.out
    const hsh = (x, y, z) => { const q = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return q - Math.floor(q); };
    const R = H.rng(4040);
    // one block clicking into place: a hollow plastic knock (short band of noise + a little body)
    const busy = []; // every block hit, so the counter ticks can stay out of their way
    const blk = (t, f, g, p = 0, minor = true) => { busy.push(t); k.noise(t, { dur: 0.026, filter: 'bandpass', f, q: 2.2, gain: 0.26 * g, a: 0.001, pan: p, minor }); k.tone(t, { f: f * 0.22, type: 'triangle', dur: 0.045, gain: 0.12 * g, pan: p, minor }); };
    // a stack of blocks thunking down together
    const chunk = (t, g, p = 0, minor) => { busy.push(t); k.play('tock', t, { f: 260, gain: 0.55 * g, pan: p, minor }); k.noise(t, { dur: 0.07, color: 'brown', filter: 'lowpass', f: 900, gain: 0.3 * g, pan: p, minor }); };
    // a shower of voxels landing: one tiny grain per landing, thinned to <= `cap` grains per second
    const shower = (times, cap, g, fLo, fHi, pan = () => 0) => {
      times.sort((a, b) => a.t - b.t); let last = -1;
      for (const v of times) if (v.t - last >= 1 / cap * (0.6 + R() * 0.8)) { k.noise(v.t, { dur: 0.016, filter: 'bandpass', f: fLo + R() * (fHi - fLo), q: 1.8, gain: 0.11 * g, a: 0.001, pan: pan(v), minor: true }); last = v.t; }
    };
    const glide = (t0, t1, g = 1) => { const d = t1 - t0; k.noise(t0, { dur: d + 0.15, color: 'pink', filter: 'bandpass', f: [[0, 230], [d * 0.5, 540], [d, 250]], q: 0.7, gain: 0.045 * g, a: d * 0.5, verb: 0.1 }); };

    k.bed('room', 0, D, { gain: 0.25 });
    k.music('pad', 0.4, D, { bpm: 104, gain: 0.28, chords: [['F3', 'A3', 'C4', 'E4'], ['D3', 'F3', 'A3', 'C4'], ['Bb3', 'D4', 'F4', 'A4'], ['C4', 'E4', 'G4', 'Bb4'], ['F3', 'A3', 'C4', 'F4']] });

    // ---- hook: the pixel title builds column by column (step(EO(0.15, 0.9), 18)) while the island rains in
    { let last = -1; for (let n = 1; n <= 18; n++) { const t = 0.15 + 0.75 * invO(n / 18); if (t - last >= 0.065) { blk(t, 1150 + (n % 3) * 90, 0.8, -0.3 + n * 0.035); last = t; } } }
    blk(0.9, 900, 1, 0.3, false); // "?" completes the title
    // island: replicate the explainer's ground voxels and their appear times, one grain per landing
    {
      const nz = H.makeNoise(4), out = [];
      for (let x = 0; x < 68; x++) for (let y = 0; y < 22; y++) {
        const e = Math.pow(Math.abs(x - 33.5) / 34, 6) + Math.pow(Math.abs(y - 10.5) / 11, 4) + nz.n2(x * 0.25, y * 0.25) * 0.18;
        if (e > 1) continue;
        for (let kk = 0; kk < 6; kk++) { if (kk > 1 && e > 1 - kk * 0.13) break; const z = 5 - kk; out.push({ t: 0.05 + (kk === 0 ? 0.9 : (5 - kk) * 0.15) + hsh(x, y, z) * 0.35 + Math.abs(x - 33) * 0.006 + LAND, x, top: kk === 0 }); }
      }
      shower(out.filter((v) => !v.top), 16, 0.9, 500, 1100, (v) => (v.x - 34) / 60); // dirt layers: duller, lower
      shower(out.filter((v) => v.top), 18, 0.8, 1100, 2000, (v) => (v.x - 34) / 60); // grass caps
    }
    glide(1.7, 2.9);

    // ---- zone A: the belt and tower bases drop in (ZA = 2.3), cards step along the belt
    chunk(2.3 + LAND, 0.9, -0.3);
    for (let t = 2.6 + 2 / 7.5; t < 6.6; t += 2 / 7.5) blk(t, 640, 0.28, -0.3); // belt advances in whole voxels (every other step)
    for (let j = 0; j < 4; j++) chunk(2.6 + j * 1.2, 0.45, -0.5, true); // a new picture card steps onto the belt
    blk(2.62, 1300, 0.6, -0.4); // CAT/DOG tags
    blk(2.82, 1000, 0.9, -0.1, false); k.play('pop', 2.84, { f: 480, gain: 0.5, minor: true }); // EXAMPLES counter tag
    // tower layers: towerH = floor(1 + 8 * EO(2.7,5.8)^1.1), layer z drops at 2.7 + z*0.36 + ti*0.05 (when the height allows)
    for (let z = 1; z < 9; z++) {
      const tH = 2.7 + 3.1 * invO(Math.pow(z / 8, 1 / 1.1));
      [0, 1, 2].forEach((ti) => { if (z >= 9 - ti % 2) return; const t = Math.max(tH, 2.7 + z * 0.36 + ti * 0.05) + LAND; if (t < 6.5 && ti !== 1) blk(t, 760 - z * 20 + ti * 40, 0.75, -0.6 + ti * 0.25); });
    }
    // chain arrow data -> robot: 14 little cubes clicked on one by one (step(E(3.3,4.3),14))
    for (let n = 1; n <= 14; n++) blk(3.3 + inv(n / 14), 900 + n * 40, n === 14 ? 1 : 0.6, -0.2 + n * 0.04);
    blk(4.12, 820, 0.9, 0.2, false); // INTO THE MODEL
    // counter: digits spin at 12 fps (random low digits), thousands follow EO(2.9,5.7): tick every other frame, thinning as it settles
    for (let f = Math.ceil(2.9 * 12); f < 5.7 * 12; f += ph(f / 12, 2.9, 5.7) < 0.6 ? 2 : 3) if (!busy.some((x) => f / 12 > x - 0.03 && f / 12 < x + 0.08)) k.play('tick', f / 12, { f: 3200, gain: 0.85, pan: -0.15, minor: true });
    // 1,000,000 lands
    k.play('stamp', 5.7, { gain: 0.35, pan: -0.15 }); k.play('ding', 5.72, { f: 'A5', gain: 0.38, pan: -0.15 });

    // ---- zone B: robot + answer board build from falling voxels (ZB = 5.95 + z*0.045 + hsh*0.1)
    glide(5.8, 6.9);
    blk(5.92, 980, 0.8, -0.4, false); // test card "?"
    { const v = []; for (let z = 0; z <= 16; z++) for (let i = 0; i < 6; i++) v.push({ t: 5.95 + z * 0.045 + R() * 0.1 + LAND, z }); shower(v, 22, 1.1, 0, 0); }
    for (let z = 0; z <= 16; z += 2) blk(5.95 + z * 0.045 + 0.05 + LAND, 600 + z * 45, 0.55, 0.1); // the robot stacking upward
    chunk(6.2 + LAND, 0.6, 0.4, true); // board post
    for (let z = 0; z < 6; z++) blk(6.25 + z * 0.05 + LAND, 820 + z * 40, 0.5, 0.45); // board rows
    // GUESS: 10-cube chain robot -> board (step(E(6.8,7.2),10)), tag, DOG? on the board
    for (let n = 1; n <= 10; n++) blk(6.8 + 0.4 * inv(n / 10), 1000 + n * 30, 0.5, 0.1 + n * 0.03);
    blk(6.93, 900, 0.8, 0.1, false); // "1 GUESS"
    k.tone(7.0, { f: 'A4', type: 'square', dur: 0.08, gain: 0.05, hold: 0.04, filter: 'lowpass', f2: 1500, pan: 0.4 }); // DOG? appears
    // CHECK: wrong. board flashes red, brackets snap in, the X drops in voxel by voxel
    k.play('error', 7.4, { f: 'A3', gain: 0.8, pan: 0.4 });
    for (let i = 0; i < 5; i++) blk(7.4 + i * 0.02 + LAND, 700 - i * 30, 0.9, 0.55, i > 0); // X sprite lands
    k.play('thud', 7.62, { f: 110, gain: 0.45, pan: 0.55 });
    blk(7.68, 880, 0.7, 0.4); // ANSWER: CAT
    // ADJUST: the red chain clicks back to the robot (16 cubes, step(E(8.0,8.6),16)), eyes flash red, tags
    for (let n = 1; n <= 16; n += (n > 4 && n < 12 ? 2 : 1)) blk(8.0 + 0.6 * inv(n / 16), 1400 - n * 35, 0.65, 0.4 - n * 0.04);
    k.tone(8.0, { f: [[0, 330], [0.6, 165]], type: 'square', dur: 0.6, gain: 0.025, a: 0.2, filter: 'lowpass', f2: 900, minor: true }); // the error packet riding the chain
    blk(8.12, 1250, 0.7, 0.2); // ERROR!
    blk(8.52, 820, 0.9, -0.2, false); // 3 ADJUST
    // chest equaliser re-levels (8.6-9.4, jiggles at 12 fps): blocky level steps
    for (let f = Math.ceil(8.6 * 12); f < 9.4 * 12; f += 2) k.tone(f / 12, { f: [330, 392, 440][(f / 2) % 3 | 0], type: 'square', dur: 0.05, gain: 0.035, a: 0.002, hold: 0.025, filter: 'lowpass', f2: 1600, pan: -0.1, minor: true });
    // CORRECT (9.4): bars settle, board turns green with CAT, the check drops in
    k.play('success', 9.4, { f: 'F5', gain: 0.42, pan: 0.4 });
    for (let i = 0; i < 5; i++) blk(9.4 + i * 0.02 + LAND, 900 + i * 60, 0.7, 0.6);
    blk(9.48, 1000, 0.7, 0.4); // GUESS AGAIN

    // ---- zone C: the chart, one column per round, stacked block by block (a0 = 10.9 + i*0.2 + z*0.035)
    glide(10.2, 11.1);
    chunk(10.6 + LAND, 0.6, 0.2, true); // chart base
    blk(10.97, 950, 0.8, 0.1, false); // ACCURACY tag
    [61, 72, 80, 86, 90, 93, 95, 97].forEach((a, i) => {
      const hg = Math.round((a - 50) / 50 * 14), t0 = 10.9 + i * 0.2 + LAND;
      for (let z = 0; z < hg; z += 3) blk(t0 + z * 0.035, 700 + z * 40, 0.45, -0.2 + i * 0.07); // column stacks up
      blk(t0 + (hg - 1) * 0.035, 900 + i * 70, 0.9, -0.2 + i * 0.07, i < 7); // top block clicks home
    });
    // 97%: the big hit. orange tag swells, a ring of square blocks bursts out
    k.play('impact', 12.6, { gain: 1.25 });
    ['F4', 'A4', 'C5', 'F5'].forEach((n, i) => k.play('ding', 12.6 + i * 0.03, { f: n, gain: 0.4 - i * 0.05, pan: (i - 1.5) * 0.25 }));
    for (let i = 0; i < 6; i++) blk(12.66 + i * 0.05, 1100 + (i % 3) * 120, 0.5, Math.cos(i) * 0.6);
    glide(12.8, 13.7, 0.9);
    // takeaway (back 13.0-13.45) lands and resolves
    chunk(13.12, 0.5, 0);
    ['C5', 'F5'].forEach((n, i) => k.play('ding', 13.32 + i * 0.09, { f: n, gain: 0.3 - i * 0.05, pan: (i - 0.5) * 0.3 }));
    k.tone(13.32, { f: 'F3', type: 'triangle', dur: 1.2, gain: 0.12, a: 0.02 });
  }

  registerStyle({
    id: 'voxel',
    name: 'Voxel Diorama',
    category: 'Dimensional',
    description: 'MagicaVoxel-style diorama: a floating voxel island with a waving robot, chunky trees and a pond — three-tone cube faces, per-vertex ambient occlusion in the creases, ray-marched soft shadows and a warm toy palette.',
    motion: 'Voxels rain down and stack layer by layer from the island’s rocky underside up to the robot’s antenna while the camera orbits; the robot’s eyes flicker on, it starts waving, and the pixel title drops in block by block.',
    duration: 5,
    fonts: ['400 8px "Silkscreen"', '400 16px "Silkscreen"', '700 22px "Fredoka"', '700 30px "Fredoka"', '600 18px "Fredoka"'],
    frameT: 4.6,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'One long voxel island the camera trucks along while each zone is rebuilt from falling voxels; arrows are chains of little cubes, cards and the ✗/✓ verdict are real voxel pixel-art, the robot’s chest equaliser re-levels as its weights adjust, and numbers tick in Silkscreen on extruded block tags.',
    explainer: vxExplainer,
    explainerSound: vxSound,
    draw(ctx, W, H_, t) {
      // ---------- background: warm studio sweep ----------
      const bg = ctx.createLinearGradient(0, 0, 0, H_);
      bg.addColorStop(0, '#ffe6c9'); bg.addColorStop(0.6, '#fbd6b8'); bg.addColorStop(1, '#f2c3a6');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
      const g0 = ctx.createRadialGradient(780, 360, 50, 780, 360, 600);
      g0.addColorStop(0, 'rgba(255,248,236,0.85)'); g0.addColorStop(1, 'rgba(255,248,236,0)');
      ctx.fillStyle = g0; ctx.fillRect(0, 0, W, H_);

      const bob = Math.sin(t * 1.4) * 5;
      const s = 18;
      const ph = (a, b) => H.clamp((t - a) / (b - a));
      setYaw(0.62 - 0.34 * (1 - H.ease.inOut(H.clamp(t / 4.3))) + Math.max(0, t - 4.3) * 0.025);
      const power = t > 2.95 && !(t > 3.05 && t < 3.12) && !(t > 3.2 && t < 3.24);
      const hsh = (v) => { const q = Math.sin(v.x * 12.9898 + v.y * 78.233 + v.z * 37.719) * 43758.5453; return q - Math.floor(q); };
      const P = makeProj(790, 318 + bob, s);
      // soft ground shadow far below the floating island
      {
        const L = H.layer(W, H_), lc = L.getContext('2d');
        lc.filter = 'blur(26px)';
        lc.fillStyle = 'rgb(150,80,70)';
        const c = P(15.5, 15.5, 0);
        lc.beginPath(); lc.ellipse(c[0] + 50, 676 - bob * 0.3, 270 - bob * 2, 46, 0, 0, 7); lc.fill();
        ctx.globalAlpha = 0.28 * H.ease.inOut(ph(0.2, 2.6)); ctx.drawImage(L, 0, 0); ctx.globalAlpha = 1;
      }

      const { V } = buildScene(t);
      const glows = drawVoxels(ctx, V, P, s, { depthDark: true, t, power, at: (v) => 0.1 + H.clamp((v.z + 4) / 31) * 2.35 + hsh(v) * 0.22 });

      // floating chunks
      const chunks = [[-3, 22, 2, 2, '#bd7548', '#9fcb55'], [30, 6, 4, 1, '#a9653e', '#9fcb55'], [30, 24, 0, 2, '#c27c4a', '#b9d65e']];
      chunks.forEach(([x, y, z, n, dirt, grass], i) => {
        const Vc = new Map();
        const dz = Math.round(Math.sin(t * 1.6 + i * 2) * 0.6);
        for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) Vc.set(K(x + a, y + b, z + dz), { x: x + a, y: y + b, z: z + dz, c: H.hex(dirt) });
        for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) Vc.set(K(x + a, y + b, z + dz + 1), { x: x + a, y: y + b, z: z + dz + 1, c: H.hex(grass) });
        if (n > 1) Vc.set(K(x, y, z + dz - 1), { x, y, z: z + dz - 1, c: H.hex(dirt) });
        drawVoxels(ctx, Vc, P, s, { t, at: (v) => 0.9 + i * 0.35 + (v.z - z) * 0.08 });
      });

      // emissive glows (eyes, chest light, antenna)
      ctx.globalCompositeOperation = 'lighter';
      for (const [x, y, c] of glows) {
        const g = ctx.createRadialGradient(x, y, 1, x, y, 26);
        g.addColorStop(0, H.rgba(c, 0.55)); g.addColorStop(1, H.rgba(c, 0));
        ctx.fillStyle = g; ctx.fillRect(x - 26, y - 26, 52, 52);
      }
      ctx.globalCompositeOperation = 'source-over';

      // ---------- voxel title: rasterize pixel font, extrude each pixel into a cube ----------
      {
        const lines = ['HELLO,', 'HUMAN!'];
        const tc = H.layer(64, 24), tx = tc.getContext('2d', { willReadFrequently: true });
        tx.font = '400 8px "Silkscreen"'; tx.textBaseline = 'top'; tx.fillStyle = '#000';
        lines.forEach((ln, i) => tx.fillText(ln, 0, i * 10));
        const d = tx.getImageData(0, 0, 64, 24).data;
        const TV = new Map();
        for (let y = 0; y < 24; y++) for (let x = 0; x < 64; x++) {
          if (d[(y * 64 + x) * 4 + 3] > 110) {
            const row = Math.floor(y / 10);
            const c = row === 0 ? H.mix('#8a5236', '#74432d', y / 10) : H.mix('#ff9a3c', '#ff7a2f', (y - 10) / 10);
            // letters stand upright: x -> world x, text row -> world z (down), depth 2 cubes along y
            for (let k = 0; k < 2; k++) TV.set(K(x, k, 24 - y), { x, y: k, z: 24 - y, c });
          }
        }
        const ts = 8.4, ox = 78, oy = 196, dx = 3.6, dy = 3.6;
        const cells = [...TV.values()].filter(v => v.y === 0).map(v => {
          const a = 2.45 + v.x * 0.016 + (v.z < 15 ? 0.3 : 0) + hsh(v) * 0.06;
          const q = ph(a, a + 0.24);
          return { ...v, q, off: (1 - H.ease.out(q)) * -26 };
        }).filter(v => v.q > 0);
        // depth extrusion (oblique): draw shadow side first, then faces
        for (const v of cells) {
          const sx = ox + v.x * ts, sy = oy + (24 - v.z) * ts + v.off;
          const c = v.c;
          // right side
          if (!TV.has(K(v.x + 1, 0, v.z))) { ctx.fillStyle = H.rgba(c.map(ch => ch * 0.62)); ctx.beginPath(); ctx.moveTo(sx + ts, sy); ctx.lineTo(sx + ts + dx, sy + dy); ctx.lineTo(sx + ts + dx, sy + ts + dy); ctx.lineTo(sx + ts, sy + ts); ctx.closePath(); ctx.fill(); }
          // bottom side
          if (!TV.has(K(v.x, 0, v.z - 1))) { ctx.fillStyle = H.rgba(c.map(ch => ch * 0.78)); ctx.beginPath(); ctx.moveTo(sx, sy + ts); ctx.lineTo(sx + ts, sy + ts); ctx.lineTo(sx + ts + dx, sy + ts + dy); ctx.lineTo(sx + dx, sy + ts + dy); ctx.closePath(); ctx.fill(); }
        }
        for (const v of cells) {
          const sx = ox + v.x * ts, sy = oy + (24 - v.z) * ts + v.off;
          // front face with AO at edges touching neighbours below/left
          const up = TV.has(K(v.x, 0, v.z + 1)), lf = TV.has(K(v.x - 1, 0, v.z));
          ctx.fillStyle = H.rgba(v.c); ctx.fillRect(sx - 0.3, sy - 0.3, ts + 0.6, ts + 0.6);
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          if (!up) ctx.fillRect(sx, sy, ts, 1.2);
          if (!lf) ctx.fillRect(sx, sy, 1.2, ts);
          ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(sx + ts - 1, sy, 1, ts);
        }
      }
      ctx.font = '600 18px "Fredoka"'; ctx.fillStyle = `rgba(120,64,40,${0.75 * H.ease.out(ph(3.3, 3.8))})`;
      ctx.fillText('Your first AI helper, block by block', 82, 420);

      H.vignette(ctx, W, H_, 0.18, '120,60,40');
      H.grain(ctx, W, H_, 0.025, 3);
    },
  });
}
