I want an animated explainer made in the "Voxel Diorama" visual style (Dimensional). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

MY CONTENT:
[Describe your topic, or paste your script here. If this is left as is, ask me for it before building.]


STORYBOARD FIRST: before building the animation, make a VISUAL storyboard and wait for my OK.
- One HTML page (show it as an artifact if you can) with a grid of panels, one per beat (about 6-10). Each panel is a canvas showing that beat's key frame drawn in this style: use the H library and the reference's own drawing, texture and finishing functions so the panels already look like the finished piece. Still frames only, no animation or sound yet.
- Under each panel: the beat number, its start and end time, the exact on-screen text, how it gets there from the previous panel (continuous: which elements carry over and how they move or change; or a scene change: which transition, and why the story wants one), and its key sounds.
- Below the grid, list any facts or numbers you had to assume.
When I approve it (or after my changes), build the full animation exactly as storyboarded, reusing the storyboard's drawing code.

WHAT TO BUILD
One self-contained HTML file (show it as an artifact if you can):
- A 1280x720 canvas, scaled to fit the window with letterboxing, and a small control bar: play/pause, a scrub slider, the current time, a sound on/off toggle, and loop on by default.
- A new `explainer(ctx, W, H_, t)` that tells MY CONTENT in this style. Aim for 12-30 seconds unless my content needs more; set the length in a DURATION constant.
- A `scoreSound(k)` function that schedules the sound effects with the SOUND kit below (see SOUND). Play it in sync from the player: on play call `stopSound = SOUND.live(scoreSound, currentT, { voiceover: false })`, and call `stopSound()` on pause, on seek and when the sound toggle is turned off.
- Include the H helper library and the SOUND kit below unchanged, and keep the reference's own helper functions where they are useful.
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Fredoka, Silkscreen
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Silkscreen&display=block">
- Expose `window.seek = (t) => { /* draw frame at time t */ }`, `window.DURATION` and `window.scoreSound`, so the animation can be rendered frame by frame to video later.

HOW TO STAY IN THE STYLE
- Reuse the reference's rendering techniques, palette, textures, lettering, line quality, arrows, labels, number treatment, transitions and timing feel. Change the story, the text and the things being drawn; do not change the medium.
- Draw every subject accurately for my topic. Don't carry over the reference's props and drawing recipes (its characters, robots, cats and dogs, rings, icons) unless they genuinely fit, and double-check that the science and facts shown in the visuals are right.
- The surface texture and finishing passes are what make the style read as the real medium (paper grain, ink pooling, misregistration, grain, glow, scanlines and so on). Copy those functions from the reference and run them on every frame at the same strength. Don't simplify or skip them to save effort.
- Every frame is a pure function of t: create all randomness from H.rng(seed) / H.makeNoise(seed) inside the draw (never Math.random), so the same t always gives the same frame. Caching static textures across frames is fine.
- It is video, often watched on a phone: at 1280x720 keep headlines >= 44px, every label or caption the story depends on >= 28px (including small annotations and the corner header), key numbers >= 64px, and frame each beat so it fills most of the screen. Keep frames fast (well under 100 ms each if you can).
- In the reference, `explainer()` is the explainer (it explains "How does AI learn?"), `draw()` is the single hero frame of the style. Study them, but do not reuse that topic unless my content asks for it.

STRUCTURE
- Structure it like a real explainer, not a title card: a hook that gets out of the way within ~2 s, then beats where something changes every 1-2 s; arrows that draw on to show cause and flow; labels that land on what they label; any full scene change done the medium's own way (see the reference); an emphasis move on the key moment; a short takeaway held ~1 s at the end.

FLOW BETWEEN BEATS
- Decide beat by beat what the story needs. A new beat does not automatically mean a new scene.
- When the next idea builds on the last, keep it continuous: elements that matter stay on screen and move, grow, re-arrange or transform into the next idea (a label becomes the next heading, a counter grows into a chart, the camera travels to a new part of the same scene, a shape morphs into the next one).
- When the story really moves on (a new topic, a jump in time or place, a before/after contrast, a reveal), a full scene change is the right call. Do it the medium's own way, as the reference does.
- Aim for a mix that fits the content, not a rule: avoid both a hard cut on every beat and forcing everything into one unbroken shot. The reference's own transitions show how this medium changes scene; its scene count is not a template to copy.

SOUND (no voiceover: a fuller mix)
- Sync is everything: a sound starts on the exact frame its event appears, using the same times as the picture.
- Score the events that land: things popping or stamping on, labels landing, arrows completing, scene transitions, a wrong/right moment, the key number (the biggest hit) and the takeaway landing (a resolving sound).
- Drawing makes its medium's noise while it draws (marker, chalk, pen strokes matched to the draw-on length; typing while text types; chip blips while game dialog prints). Counters tick at most ~12 times a second, slowing as they settle.
- A quiet ambience bed suited to the medium is welcome, and music only if it suits the style (k.music, gain 0.6 or less).
- Keep a hierarchy: effects in front, any bed or music clearly underneath, no more than ~3 sounds at once, and small silences so the big hits read. Medium-true palette, not generic swooshes.


If you are Claude Code with a shell: render an MP4 by loading the file in headless Chrome (e.g. puppeteer), calling window.seek(i/30) for each frame, capturing the canvas and piping the frames into ffmpeg. Render the effects to a WAV with `SOUND.renderOffline(window.scoreSound, DURATION, 48000, { voiceover: false })` (it returns interleaved stereo floats) and mux it in.

STYLE CARD
Name: Voxel Diorama
Family: Dimensional
Look: MagicaVoxel-style diorama: a floating voxel island with a waving robot, chunky trees and a pond — three-tone cube faces, per-vertex ambient occlusion in the creases, ray-marched soft shadows and a warm toy palette.
Motion: Voxels rain down and stack layer by layer from the island’s rocky underside up to the robot’s antenna while the camera orbits; the robot’s eyes flicker on, it starts waving, and the pixel title drops in block by block.
How it explains: One long voxel island the camera trucks along while each zone is rebuilt from falling voxels; arrows are chains of little cubes, cards and the ✗/✓ verdict are real voxel pixel-art, the robot’s chest equaliser re-levels as its weights adjust, and numbers tick in Silkscreen on extruded block tags.

H HELPER LIBRARY (lib/harness.js; the registerStyle/H.render parts are only needed by the original gallery)
```js
// Shared helpers + style registry for the style-frame explorations.
// Every style is a pure function of time: draw(ctx, W, H, t). Same t => same pixels.
(function () {
  const STYLES = (window.STYLES = window.STYLES || []);
  window.registerStyle = (s) => STYLES.push(s);

  const H = (window.H = {});

  // ---------- seeded randomness ----------
  // H.rng(seed) -> r() in [0,1). Extras: r.range(a,b), r.int(a,b), r.pick(arr), r.gauss(), r.chance(p)
  H.rng = function (seed = 1) {
    let a = typeof seed === 'string' ? hashStr(seed) : (seed >>> 0) || 1;
    const r = function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.range = (lo, hi) => lo + r() * (hi - lo);
    r.int = (lo, hi) => Math.floor(lo + r() * (hi - lo + 1));
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    r.chance = (p) => r() < p;
    r.gauss = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    return r;
  };
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  // ---------- gradient noise ----------
  // H.makeNoise(seed) -> { n2(x,y), n3(x,y,z), fbm2(x,y,oct), fbm3(x,y,z,oct) }  (outputs roughly -1..1)
  H.makeNoise = function (seed = 1) {
    const r = H.rng(seed), p = new Uint8Array(512), perm = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
    for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (a, b, t) => a + (b - a) * t;
    const g3 = (h, x, y, z) => { h &= 15; const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z; return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); };
    function n3(x, y, z) {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
      x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
      const u = fade(x), v = fade(y), w = fade(z);
      const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
      return lerp(lerp(lerp(g3(p[AA], x, y, z), g3(p[BA], x - 1, y, z), u), lerp(g3(p[AB], x, y - 1, z), g3(p[BB], x - 1, y - 1, z), u), v),
        lerp(lerp(g3(p[AA + 1], x, y, z - 1), g3(p[BA + 1], x - 1, y, z - 1), u), lerp(g3(p[AB + 1], x, y - 1, z - 1), g3(p[BB + 1], x - 1, y - 1, z - 1), u), v), w);
    }
    const n2 = (x, y) => n3(x, y, 0.5);
    const fbm3 = (x, y, z, oct = 4) => { let s = 0, a = 0.5, f = 1, norm = 0; for (let i = 0; i < oct; i++) { s += a * n3(x * f, y * f, z * f); norm += a; a *= 0.5; f *= 2; } return s / norm; };
    const fbm2 = (x, y, oct = 4) => fbm3(x, y, 0.5, oct);
    return { n2, n3, fbm2, fbm3 };
  };

  // ---------- math ----------
  H.lerp = (a, b, t) => a + (b - a) * t;
  H.clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
  H.map = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);
  H.smooth = (e0, e1, x) => { const t = H.clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
  H.ease = {
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out: (t) => 1 - Math.pow(1 - t, 3),
    in: (t) => t * t * t,
    back: (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  };

  // ---------- color ----------
  H.hex = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  H.rgba = (hexOrArr, a = 1) => { const [r, g, b] = Array.isArray(hexOrArr) ? hexOrArr : H.hex(hexOrArr); return `rgba(${r | 0},${g | 0},${b | 0},${a})`; };
  H.mix = (c1, c2, t) => { const a = Array.isArray(c1) ? c1 : H.hex(c1), b = Array.isArray(c2) ? c2 : H.hex(c2); return [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t); };

  // ---------- canvas utilities ----------
  // Offscreen canvas of the same logical size (use for layers, masks, compositing).
  H.layer = (W, H_, ) => { const c = document.createElement('canvas'); c.width = W; c.height = H_; return c; };
  // Monochrome grain / film noise over the whole canvas. amount ~ 0.03-0.15
  H.grain = function (ctx, W, Hh, amount = 0.08, seed = 7, mono = true) {
    const img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height), d = img.data, r = H.rng(seed), k = amount * 255;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * k;
      if (mono) { d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      else { d[i] += (r() - 0.5) * k; d[i + 1] += (r() - 0.5) * k; d[i + 2] += (r() - 0.5) * k; }
    }
    ctx.putImageData(img, 0, 0);
  };
  // Paper-ish texture tile: fills with base color + fibrous noise (cheap; drawn into ctx).
  H.paper = function (ctx, W, Hh, base = '#f3ecdc', seed = 3, strength = 0.06) {
    ctx.save(); ctx.fillStyle = base; ctx.fillRect(0, 0, W, Hh);
    const nz = H.makeNoise(seed), cell = 4, [br, bg, bb] = H.hex(base);
    for (let y = 0; y < Hh; y += cell) for (let x = 0; x < W; x += cell) {
      const v = nz.fbm2(x * 0.01, y * 0.01, 3) * 0.6 + nz.n2(x * 0.15, y * 0.04) * 0.4;
      const s = 1 + v * strength * 2;
      ctx.fillStyle = `rgb(${br * s | 0},${bg * s | 0},${bb * s | 0})`; ctx.fillRect(x, y, cell, cell);
    }
    ctx.restore();
  };
  // Vignette
  H.vignette = function (ctx, W, Hh, strength = 0.5, color = '0,0,0') {
    const g = ctx.createRadialGradient(W / 2, Hh / 2, Math.min(W, Hh) * 0.3, W / 2, Hh / 2, Math.hypot(W, Hh) * 0.6);
    g.addColorStop(0, `rgba(${color},0)`); g.addColorStop(1, `rgba(${color},${strength})`);
    ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh); ctx.restore();
  };

  // ---------- rendering entry ----------
  // Renders style into canvas at logical 1280x720 (canvas can be any pixel size; it is scaled).
  H.W = 1280; H.H = 720;
  H.loadFonts = async function (style) {
    const specs = style.fonts || [];
    try { const sample = 'AaZz09' + (window.FONT_SAMPLE || '');
      await Promise.all(specs.map((f) => document.fonts.load(f, sample))); await document.fonts.ready; } catch (e) { /* render anyway */ }
  };
  H.render = function (style, canvas, t) {
    const ctx = canvas.getContext('2d', { willReadFrequently: !!style.readsPixels });
    const sx = canvas.width / H.W, sy = canvas.height / H.H;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.scale(sx, sy);
    style.draw(ctx, H.W, H.H, t == null ? style.frameT || 0 : t);
    ctx.restore();
  };
})();
```

SOUND KIT (lib/sound.js)
```js
// sound.js: a small synthesized sound kit for the style explainers. Plain Web Audio, no audio files.
// Voiceover mode: SOUND.kit(ctx, { voiceover: true }) drops beds and music, plays anything marked minor
// (play(..., { minor: true }), tone/noise { minor: true }, or scheduled inside k.withMinor(() => ...)) at about 60%
// volume instead of full, and sits all effects a little lower, so the narration stays on top while the piece still
// sounds alive. In the full mix, minor sounds play at full volume. Scores can read k.vo to branch further.
// A style adds   explainerSound(k) { k.bed('room', 0, D); k.play('pop', 1.25); ... }   and the same
// call schedules into a live AudioContext (the player) or an OfflineAudioContext (the video render).
// Times are seconds on the explainer's own clock. Randomness is seeded, so every render is identical.
(function () {
  'use strict';
  const SOUND = (window.SOUND = {});
  const TINY = 1e-4;

  // seeded random in [0,1), keyed by any string
  function rand(key) {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
    let a = h >>> 0 || 1;
    return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  // note names to Hz: 'A4' = 440, 'C#5', 'Eb3'
  const STEP = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function hz(n) {
    if (typeof n === 'number') return n;
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(n);
    const semis = STEP[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) - 4) * 12 - 9;
    return 440 * Math.pow(2, semis / 12);
  }
  SOUND.hz = hz;

  SOUND.kit = function (ctx, opts) {
    const o = opts || {};
    const VO = !!o.voiceover;
    const MINOR = 0.6; // voiceover-mode volume for minor sounds
    let inMinor = false;
    const gainOf = (p, d) => (p.gain == null ? d : p.gain) * (VO && (p.minor || inMinor) ? MINOR : 1);
    const T0 = (o.start || 0) - 0; // explainer time that maps to ctx time `base`
    const base = ctx.currentTime + (o.delay || 0);
    // Start times snap to the sample grid (+ a quarter sample): in Chrome a source started a hair off the grid can
    // spike to about twice its set level.
    const SR = ctx.sampleRate;
    const at = (t) => (Math.round((base + (t - T0)) * SR) + 0.25) / SR;

    // ---- buses: sfx, amb, music -> compressor -> master; one shared reverb send
    const master = ctx.createGain(); master.gain.value = o.master == null ? 0.9 : o.master;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 8; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.18;
    comp.connect(master); master.connect(o.dest || ctx.destination);
    const bus = {};
    for (const [name, g] of Object.entries({ sfx: VO ? 0.7 : 0.85, amb: 0.5, music: 0.45 })) { bus[name] = ctx.createGain(); bus[name].gain.value = g; bus[name].connect(comp); }

    // generated room reverb: decaying stereo noise, darker toward the tail
    const verb = ctx.createConvolver();
    {
      const secs = 1.6, n = Math.floor(secs * ctx.sampleRate), ir = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const r = rand('verb' + c), d = ir.getChannelData(c); let lp = 0;
        for (let i = 0; i < n; i++) { const u = i / n; lp += (0.6 - 0.45 * u) * ((r() * 2 - 1) - lp); d[i] = lp * Math.pow(1 - u, 3); }
      }
      verb.buffer = ir;
    }
    const verbIn = ctx.createGain(); verbIn.gain.value = 0.9; verbIn.connect(verb); verb.connect(comp);

    // seeded noise buffers: white, pink-ish and brown
    const noiseBuf = {};
    {
      const n = Math.floor(2.5 * ctx.sampleRate);
      for (const kind of ['white', 'pink', 'brown']) {
        const b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0), r = rand('noise-' + kind);
        let p0 = 0, p1 = 0, p2 = 0, br = 0;
        for (let i = 0; i < n; i++) {
          const w = r() * 2 - 1;
          if (kind === 'white') d[i] = w;
          else if (kind === 'pink') { p0 = 0.997 * p0 + 0.029 * w; p1 = 0.985 * p1 + 0.032 * w; p2 = 0.95 * p2 + 0.048 * w; d[i] = (p0 + p1 + p2 + w * 0.05) * 2.2; }
          else { br = (br + 0.02 * w) / 1.02; d[i] = br * 3.2; }
        }
        noiseBuf[kind] = b;
      }
    }

    // ---- automation helpers
    // a value or [[dt, value], ...] from the voice start; ramps are exponential (frequencies)
    function sweep(param, v, t) {
      if (!Array.isArray(v)) { param.setValueAtTime(v, t); return; }
      param.setValueAtTime(v[0][1], t + v[0][0]);
      for (let i = 1; i < v.length; i++) param.exponentialRampToValueAtTime(Math.max(v[i][1], 1), t + v[i][0]);
    }
    // amplitude: linear attack to `gain`, optional hold, exponential release to silence by `dur`
    function shape(param, t, gain, dur, a, hold) {
      a = Math.min(a == null ? 0.004 : a, dur * 0.9);
      hold = Math.min(hold || 0, dur - a);
      param.setValueAtTime(0, t);
      param.linearRampToValueAtTime(gain, t + a);
      if (hold > 0) param.setValueAtTime(gain, t + a + hold);
      param.exponentialRampToValueAtTime(TINY, t + dur);
      param.setValueAtTime(0, t + dur + 0.001);
    }
    function out(node, p) {
      const pan = ctx.createStereoPanner(); pan.pan.value = Math.max(-1, Math.min(1, p.pan || 0));
      node.connect(pan); pan.connect(bus[p.bus || 'sfx']);
      if (p.verb) { const s = ctx.createGain(); s.gain.value = p.verb; pan.connect(s); s.connect(verbIn); }
    }
    function filterNode(p, t) {
      if (!p.filter) return null;
      const f = ctx.createBiquadFilter(); f.type = p.filter; f.Q.value = p.q == null ? 1 : p.q;
      sweep(f.frequency, p.f == null ? 1000 : p.f, t);
      return f;
    }

    // ---- primitives
    // tone(t, { f, type, dur, gain, a, hold, pan, verb, bus, filter, f2 (filter freq), q, detune })
    function tone(time, p) {
      const t = at(time), dur = p.dur || 0.2;
      if (t + dur < ctx.currentTime || (time < T0 - 0.001 && dur < 1.5)) return;
      const osc = ctx.createOscillator(); osc.type = p.type || 'sine';
      sweep(osc.frequency, Array.isArray(p.f) ? p.f.map(([d, v]) => [d, hz(v)]) : hz(p.f || 440), t);
      if (p.detune) osc.detune.value = p.detune;
      const g = ctx.createGain(); shape(g.gain, t, gainOf(p, 0.3), dur, p.a, p.hold);
      let node = osc;
      if (p.filter) { const f = ctx.createBiquadFilter(); f.type = p.filter; f.Q.value = p.q == null ? 0.8 : p.q; sweep(f.frequency, p.f2 || 2000, t); osc.connect(f); node = f; }
      node.connect(g); out(g, p);
      osc.start(t); osc.stop(t + dur + 0.02);
    }
    // noise(t, { dur, color, filter, f, q, gain, a, hold, pan, verb, bus, rate })
    function noise(time, p) {
      const t = at(time), dur = p.dur || 0.2;
      if (t + dur < ctx.currentTime || (time < T0 - 0.001 && dur < 1.5)) return;
      const src = ctx.createBufferSource(); src.buffer = noiseBuf[p.color || 'white']; src.loop = true;
      if (p.rate) src.playbackRate.value = p.rate;
      const g = ctx.createGain(); shape(g.gain, t, gainOf(p, 0.3), dur, p.a, p.hold);
      const f = filterNode(p, t);
      if (f) { src.connect(f); f.connect(g); } else src.connect(g);
      out(g, p);
      const off = rand('off' + time + (p.f || ''))() * 2;
      src.start(t, off); src.stop(t + dur + 0.02);
    }

    // ---- named sounds. play(name, t, opts): opts.gain scales the whole sound, opts.pan places it.
    const S = {
      // UI / motion graphics
      pop: (t, o) => { tone(t, { f: [[0, o.f || 620], [0.07, (o.f || 620) * 0.45]], dur: 0.1, gain: 0.32 * o.g, pan: o.pan }); noise(t, { dur: 0.012, filter: 'highpass', f: 3000, gain: 0.12 * o.g, pan: o.pan }); },
      tick: (t, o) => noise(t, { dur: 0.018, filter: 'bandpass', f: o.f || 4200, q: 2.5, gain: 0.3 * o.g, pan: o.pan }),
      click: (t, o) => { tone(t, { f: o.f || 1900, type: 'square', dur: 0.02, gain: 0.08 * o.g, filter: 'lowpass', f2: 3000, pan: o.pan }); noise(t, { dur: 0.01, filter: 'highpass', f: 2500, gain: 0.15 * o.g, pan: o.pan }); },
      tock: (t, o) => { tone(t, { f: o.f || 820, dur: 0.07, gain: 0.25 * o.g, pan: o.pan }); noise(t, { dur: 0.05, filter: 'bandpass', f: o.f || 820, q: 9, gain: 0.35 * o.g, pan: o.pan }); },
      blip: (t, o) => tone(t, { f: o.f || 'E6', type: o.type || 'square', dur: o.dur || 0.07, gain: 0.07 * o.g, a: 0.002, hold: (o.dur || 0.07) * 0.6, pan: o.pan }),
      whoosh: (t, o) => { const d = o.dur || 0.45; noise(t, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 350], [d * 0.55, o.top || 2600], [d, 700]], q: 0.9, gain: 0.32 * o.g, a: d * 0.5, pan: o.pan, verb: 0.15 }); },
      swish: (t, o) => { const d = o.dur || 0.18; noise(t, { dur: d, filter: 'highpass', f: [[0, 1800], [d, 5200]], q: 0.7, gain: 0.22 * o.g, a: d * 0.35, pan: o.pan }); },
      riser: (t, o) => { const d = o.dur || 0.8; noise(t, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 300], [d, 4000]], q: 1.2, gain: 0.25 * o.g, a: d * 0.95, pan: o.pan, verb: 0.2 }); tone(t, { f: [[0, 180], [d, 720]], type: 'triangle', dur: d, gain: 0.06 * o.g, a: d * 0.9 }); },
      thud: (t, o) => { tone(t, { f: [[0, o.f || 130], [0.16, 42]], dur: 0.26, gain: 0.55 * o.g, pan: o.pan }); noise(t, { dur: 0.09, color: 'brown', filter: 'lowpass', f: 500, gain: 0.35 * o.g, pan: o.pan }); },
      impact: (t, o) => { S.thud(t, o); noise(t, { dur: 0.7, color: 'pink', filter: 'lowpass', f: [[0, 2400], [0.6, 300]], gain: 0.3 * o.g, verb: 0.35, pan: o.pan }); },
      stamp: (t, o) => { S.thud(t, { ...o, f: 160 }); noise(t, { dur: 0.05, filter: 'bandpass', f: 1300, q: 1.2, gain: 0.4 * o.g, pan: o.pan }); noise(t + 0.004, { dur: 0.012, filter: 'highpass', f: 3500, gain: 0.25 * o.g, pan: o.pan }); },
      ding: (t, o) => { const f = hz(o.f || 'E6'); tone(t, { f, dur: 1.3, gain: 0.2 * o.g, verb: 0.3, pan: o.pan }); tone(t, { f: f * 2.76, dur: 0.5, gain: 0.05 * o.g, verb: 0.3, pan: o.pan }); },
      success: (t, o) => { S.ding(t, { ...o, f: o.f || 'C6' }); S.ding(t + 0.09, { ...o, f: hz(o.f || 'C6') * 1.5, g: o.g * 0.9 }); },
      error: (t, o) => { tone(t, { f: o.f || 'A3', type: 'square', dur: 0.13, gain: 0.09 * o.g, hold: 0.08, filter: 'lowpass', f2: 1400, pan: o.pan }); tone(t + 0.15, { f: hz(o.f || 'A3') * 0.8, type: 'square', dur: 0.22, gain: 0.09 * o.g, hold: 0.14, filter: 'lowpass', f2: 1200, pan: o.pan }); },
      buzz: (t, o) => { const d = o.dur || 0.3; tone(t, { f: o.f || 110, type: 'sawtooth', dur: d, gain: 0.12 * o.g, hold: d * 0.7, filter: 'lowpass', f2: 900, pan: o.pan }); tone(t, { f: (o.f || 110) * 1.01, type: 'sawtooth', dur: d, gain: 0.1 * o.g, hold: d * 0.7, filter: 'lowpass', f2: 900, pan: o.pan }); },
      sparkle: (t, o) => { const r = rand('sparkle' + t), notes = ['C6', 'D6', 'E6', 'G6', 'A6', 'C7']; for (let i = 0; i < (o.n || 6); i++) { const ti = t + i * 0.04 + r() * 0.01, f = hz(notes[Math.floor(r() * notes.length)]), pan = r() * 1.2 - 0.6; tone(ti, { f, dur: 0.6, gain: 0.04 * o.g, a: 0.002, verb: 0.35, pan }); tone(ti, { f: f * 2.76, dur: 0.2, gain: 0.012 * o.g, a: 0.002, pan }); } },
      glitch: (t, o) => { const r = rand('glitch' + t); for (let i = 0; i < 7; i++) tone(t + i * 0.022, { f: 200 + r() * 1800, type: 'square', dur: 0.02, gain: 0.07 * o.g, a: 0.001, hold: 0.015, pan: r() * 1.4 - 0.7 }); noise(t, { dur: 0.16, filter: 'bandpass', f: 2500, q: 0.6, gain: 0.12 * o.g }); },
      shutter: (t, o) => { S.click(t, o); noise(t + 0.06, { dur: 0.04, filter: 'bandpass', f: 2200, q: 1, gain: 0.2 * o.g, pan: o.pan }); },
      count: (t, o) => S.tick(t, { ...o, f: o.f || 5200, g: o.g * 0.7 }),

      // hand-made media
      // stroke: a pen/marker/chalk/pencil stroke over `dur` seconds. material sets the surface sound.
      stroke: (t, o) => {
        const d = o.dur || 0.4, m = o.material || 'marker', r = rand('stroke' + m + t);
        const M = {
          marker: { f: 2900, q: 2.2, g: 0.16, grain: 0.05 },
          chalk: { f: 1700, q: 0.6, g: 0.22, grain: 0.028 },
          pencil: { f: 4600, q: 0.8, g: 0.16, grain: 0.04, filter: 'highpass' },
          pen: { f: 4200, q: 1.6, g: 0.08, grain: 0.06 },
          brush: { f: 900, q: 0.5, g: 0.1, grain: 0.09, color: 'pink' },
          sharpie: { f: 2400, q: 1.4, g: 0.2, grain: 0.045 },
        }[m];
        for (let x = 0; x < d; x += M.grain * (0.7 + r() * 0.6)) {
          const gd = M.grain * (0.8 + r() * 0.9);
          noise(t + x, { dur: gd, color: M.color, filter: M.filter || 'bandpass', f: M.f * (0.8 + r() * 0.4), q: M.q, gain: M.g * o.g * (0.6 + r() * 0.5), a: gd * 0.3, pan: (o.pan || 0) + (r() - 0.5) * 0.2 });
        }
      },
      // paper: picking up / slapping down / turning a sheet
      paper: (t, o) => { const d = o.dur || 0.35, r = rand('paper' + t); for (let x = 0; x < d; x += 0.025 + r() * 0.03) noise(t + x, { dur: 0.05, filter: 'bandpass', f: 1200 + r() * 2600, q: 0.9, gain: 0.12 * o.g * (1 - x / d * 0.5), pan: o.pan }); },
      slap: (t, o) => { noise(t, { dur: 0.07, filter: 'highpass', f: 900, gain: 0.45 * o.g, a: 0.001, pan: o.pan }); tone(t, { f: [[0, 180], [0.06, 70]], dur: 0.1, gain: 0.25 * o.g, pan: o.pan }); },
      tape: (t, o) => { noise(t, { dur: o.dur || 0.5, filter: 'bandpass', f: [[0, 900], [o.dur || 0.5, 2200]], q: 1.8, gain: 0.18 * o.g, a: 0.02, pan: o.pan }); },
      press: (t, o) => { S.thud(t, { ...o, f: 95, g: o.g * 0.9 }); noise(t + 0.01, { dur: 0.25, color: 'brown', filter: 'lowpass', f: 700, gain: 0.25 * o.g, pan: o.pan }); },
      roller: (t, o) => { const d = o.dur || 0.6; noise(t, { dur: d, color: 'brown', filter: 'bandpass', f: 380, q: 1.5, gain: 0.3 * o.g, a: 0.05, hold: d * 0.6, pan: o.pan }); for (let x = 0; x < d; x += 0.07) S.tock(t + x, { f: 300, g: o.g * 0.15, pan: o.pan }); },
      erase: (t, o) => { const d = o.dur || 0.6, r = rand('erase' + t); for (let x = 0; x < d; x += 0.06 + r() * 0.04) noise(t + x, { dur: 0.08, color: 'pink', filter: 'bandpass', f: 700 + r() * 500, q: 0.8, gain: 0.22 * o.g, a: 0.03, pan: (r() - 0.5) * 0.5 }); },

      // machines and screens
      key: (t, o) => { const r = rand('key' + t); noise(t, { dur: 0.025, filter: 'bandpass', f: 2600 + r() * 1200, q: 2, gain: 0.25 * o.g, a: 0.001, pan: o.pan }); tone(t, { f: 160 + r() * 40, dur: 0.04, gain: 0.12 * o.g, pan: o.pan }); },
      typing: (t, o) => { const r = rand('typing' + t), n = o.n || 8, rate = o.rate || 0.09; for (let i = 0; i < n; i++) S.key(t + i * rate * (0.75 + r() * 0.5), { g: o.g * (0.7 + r() * 0.4), pan: o.pan }); },
      typebar: (t, o) => { S.key(t, o); noise(t + 0.008, { dur: 0.03, filter: 'bandpass', f: 1100, q: 4, gain: 0.35 * o.g, pan: o.pan }); },
      bell: (t, o) => S.ding(t, { ...o, f: o.f || 'A6' }),
      boot: (t, o) => { tone(t, { f: [[0, 80], [0.35, 1600]], type: 'sine', dur: 0.5, gain: 0.08 * o.g, a: 0.3 }); S.blip(t + 0.45, { ...o, f: 'C6', dur: 0.12 }); },
      crtOn: (t, o) => { noise(t, { dur: 0.25, filter: 'highpass', f: 2000, gain: 0.2 * o.g, a: 0.001 }); tone(t, { f: 15700, dur: 1.5, gain: 0.02 * o.g, a: 0.1, hold: 1 }); S.thud(t, { ...o, f: 90, g: o.g * 0.5 }); },
      neon: (t, o) => { const d = o.dur || 0.25, r = rand('neon' + t); for (let x = 0; x < d; x += 0.035 + r() * 0.04) tone(t + x, { f: 120, type: 'sawtooth', dur: 0.03, gain: 0.3 * o.g * (0.5 + r() * 0.5), filter: 'bandpass', f2: 1200, q: 1.2, pan: o.pan }); },
      // chip (8-bit console) sounds: raw square/triangle, no filtering
      coin: (t, o) => { tone(t, { f: 'B5', type: 'square', dur: 0.07, gain: 0.07 * o.g, a: 0.001, hold: 0.06 }); tone(t + 0.07, { f: 'E6', type: 'square', dur: 0.3, gain: 0.07 * o.g, a: 0.001, hold: 0.1 }); },
      jump: (t, o) => tone(t, { f: [[0, 260], [0.16, 820]], type: 'square', dur: 0.18, gain: 0.07 * o.g, a: 0.001, hold: 0.12 }),
      hurt: (t, o) => { tone(t, { f: [[0, 600], [0.25, 90]], type: 'square', dur: 0.28, gain: 0.08 * o.g, a: 0.001, hold: 0.2 }); noise(t, { dur: 0.2, filter: 'lowpass', f: 1800, gain: 0.15 * o.g, rate: 0.25 }); },
      powerup: (t, o) => ['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'].forEach((n, i) => tone(t + i * 0.045, { f: n, type: 'square', dur: 0.06, gain: 0.06 * o.g, a: 0.001, hold: 0.05 })),
      select: (t, o) => { S.blip(t, { ...o, f: 'A5', dur: 0.04 }); S.blip(t + 0.05, { ...o, f: 'E6', dur: 0.05 }); },
      text: (t, o) => { const n = o.n || 10, rate = o.rate || 0.05; for (let i = 0; i < n; i++) tone(t + i * rate, { f: i % 2 ? 'C6' : 'G5', type: 'square', dur: 0.025, gain: 0.04 * o.g, a: 0.001, hold: 0.015 }); },
    };

    function play(name, t, opts) {
      const fn = S[name];
      if (!fn) throw new Error('unknown sound: ' + name);
      const o2 = Object.assign({}, opts); o2.g = o2.gain == null ? 1 : o2.gain;
      if (opts && opts.minor) withMinor(() => fn(t, o2)); else fn(t, o2);
    }

    // everything scheduled inside fn counts as minor (quieter in voiceover mode)
    function withMinor(fn) { const was = inMinor; inMinor = true; try { fn(); } finally { inMinor = was; } }

    // ---- beds: continuous sound under a stretch of time. bed(name, t0, t1, opts)
    function bed(name, t0, t1, p) {
      if (VO) return;
      p = p || {}; const g = p.gain == null ? 1 : p.gain, d = t1 - t0, fade = Math.min(0.4, d / 4);
      const long = (q) => Object.assign({ dur: d, a: fade, hold: d - fade * 2, bus: 'amb' }, q);
      if (name === 'room') noise(t0, long({ color: 'brown', filter: 'lowpass', f: 320, gain: 0.12 * g }));
      else if (name === 'hiss') noise(t0, long({ color: 'pink', filter: 'highpass', f: 5000, gain: 0.02 * g }));
      else if (name === 'hum') { tone(t0, long({ f: 60, gain: 0.05 * g })); tone(t0, long({ f: 120, gain: 0.025 * g })); tone(t0, long({ f: 180, type: 'triangle', gain: 0.012 * g })); }
      else if (name === 'rain') { noise(t0, long({ color: 'pink', filter: 'bandpass', f: 2500, q: 0.4, gain: 0.08 * g })); const r = rand('rain'); for (let x = 0; x < d; x += 0.04 + r() * 0.08) noise(t0 + x, { dur: 0.01, filter: 'highpass', f: 4000, gain: 0.04 * g * r(), bus: 'amb', pan: r() * 1.6 - 0.8 }); }
      else if (name === 'projector') { noise(t0, long({ color: 'pink', filter: 'highpass', f: 3000, gain: 0.03 * g })); for (let x = 0; x < d; x += 1 / 24) S.tock(t0 + x, { f: 700, g: 0.04 * g, pan: 0.3 }); }
      else if (name === 'vinyl') { noise(t0, long({ color: 'pink', filter: 'bandpass', f: 1500, q: 0.5, gain: 0.025 * g })); const r = rand('vinyl'); for (let x = 0; x < d; x += 0.08 + r() * 0.4) noise(t0 + x, { dur: 0.006, filter: 'highpass', f: 2500, gain: 0.08 * g * r(), bus: 'amb' }); }
      else throw new Error('unknown bed: ' + name);
    }

    // ---- music: optional light beds that sit under the effects. music(name, t0, t1, { bpm, chords, gain })
    // chords: list of note arrays, one per bar, cycled. e.g. [['C4','E4','G4','B4'], ['A3','C4','E4','G4']]
    function music(name, t0, t1, p) {
      if (VO) return;
      p = p || {}; const g = p.gain == null ? 1 : p.gain, bpm = p.bpm || 100, beat = 60 / bpm, bar = beat * 4;
      const chords = p.chords || [['C4', 'E4', 'G4', 'B4'], ['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'B3', 'D4', 'F4']];
      let i = 0;
      for (let t = t0; t < t1 - 0.05; t += bar, i++) {
        const ch = chords[i % chords.length], len = Math.min(bar, t1 - t);
        if (name === 'pad' || name === 'pulse') ch.forEach((n, k) => { tone(t, { f: n, type: 'triangle', dur: len + 0.3, gain: 0.035 * g, a: 0.25, hold: len - 0.3, bus: 'music', filter: 'lowpass', f2: 1400, pan: (k - 1.5) * 0.25, verb: 0.25 }); tone(t, { f: hz(n) * 1.004, type: 'sine', dur: len + 0.3, gain: 0.03 * g, a: 0.3, hold: len - 0.3, bus: 'music' }); });
        if (name === 'pulse') for (let b = 0; b < 4 && t + b * beat < t1 - 0.05; b++) {
          const tb = t + b * beat;
          tone(tb, { f: [[0, 110], [0.1, 50]], dur: 0.18, gain: (b % 2 ? 0.16 : 0.26) * g, bus: 'music' });
          noise(tb + beat / 2, { dur: 0.04, filter: 'highpass', f: 7000, gain: 0.05 * g, bus: 'music' });
          tone(tb + beat / 2, { f: hz(ch[0]) / 2, type: 'triangle', dur: beat * 0.45, gain: 0.08 * g, bus: 'music' });
        }
        if (name === 'chip') for (let s = 0; s < 8 && t + s * beat / 2 < t1 - 0.05; s++) {
          const ts = t + s * beat / 2;
          tone(ts, { f: hz(ch[0]) / 2, type: 'triangle', dur: beat * 0.45, gain: 0.12 * g, a: 0.001, hold: beat * 0.35, bus: 'music' });
          tone(ts, { f: ch[[0, 1, 2, 3, 2, 1, 2, 3][s]], type: 'square', dur: beat * 0.4, gain: 0.03 * g, a: 0.001, hold: beat * 0.25, bus: 'music' });
        }
      }
    }

    return { play, bed, music, tone, noise, withMinor, hz, vo: VO, sounds: Object.keys(S) };
  };

  // Live playback for a player: SOUND.live(scoreFn, fromT, { voiceover, master }) starts the score from explainer time
  // fromT right now and returns stop(). Call stop() on pause or seek, and SOUND.live again on play.
  SOUND.live = function (fn, fromT, opts) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    fn(SOUND.kit(ctx, Object.assign({}, opts, { start: fromT || 0, delay: 0.03 })));
    return () => { try { ctx.close(); } catch (e) {} };
  };

  // Render a style's explainerSound into an OfflineAudioContext; returns interleaved float stereo.
  SOUND.renderOffline = async function (fn, duration, sampleRate, kitOpts) {
    const sr = sampleRate || 48000, len = Math.ceil(duration * sr);
    const ctx = new OfflineAudioContext(2, len, sr);
    fn(SOUND.kit(ctx, kitOpts || {}));
    const buf = await ctx.startRendering();
    const L = buf.getChannelData(0), R = buf.getChannelData(1), inter = new Float32Array(len * 2);
    let peak = 0;
    for (let i = 0; i < len; i++) { inter[2 * i] = L[i]; inter[2 * i + 1] = R[i]; peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
    return { inter, peak, frames: len, sr };
  };
})();
```

REFERENCE STYLE SOURCE (styles/voxel.js; W/H_ are always 1280x720)
```js
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
```
