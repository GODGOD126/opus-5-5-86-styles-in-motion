I want an animated explainer made in the "Isometric Pastel" visual style (Dimensional). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Inter
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=block">
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
Name: Isometric Pastel
Family: Dimensional
Look: Clean vector isometric illustration: true 30° projection, flat three-tone face shading, soft pastel palette with a single coral accent, tiny people for scale and long soft shadows on a floating tile.
Motion: The floating tile rises into frame, buildings, tanks and racks pop up one by one on springy overshoot, then LEDs blink, fans spin, data cubes stream up and tiny workers stroll during a slow camera push.
How it explains: One long isometric factory floor (data shelves → conveyor → glass-top neural machine → monitor → bar chart) that the camera glides along beat to beat, with white label tags pinned to objects, curved dashed connectors, a counting billboard and an accuracy tag riding the newest bar.

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

REFERENCE STYLE SOURCE (styles/isometric.js; W/H_ are always 1280x720)
```js
{
  // ---------- isometric helpers ----------
  const C30 = Math.cos(Math.PI / 6);
  const makeIso = (ox, oy, s) => (x, y, z = 0) => [ox + (x - y) * C30 * s, oy + (x + y) * 0.5 * s - z * s];
  const SHADE_DARK = [92, 88, 150];
  const shade = (base, k = 1) => ({
    top: H.rgba(H.mix(base, '#ffffff', 0.42 * k)),
    left: H.rgba(H.mix(base, '#ffffff', 0.08)),
    right: H.rgba(H.mix(base, SHADE_DARK, 0.28 * k)),
    edge: H.rgba(H.mix(base, '#ffffff', 0.75), 0.9),
  });
  function poly(ctx, pts, fill) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  }
  function box(ctx, P, x, y, z, w, d, h, c, edges = true) {
    const px = P(x, y, 0)[1] - P(x, y, 1)[1], hp = h * px;   // pixels per unit, face height in px
    // ambient-occlusion contact strip where a box stands on the floor (faces drawn next cover its inner half)
    if (Math.abs(z) < 0.01 && hp > 6) {
      const a = P(x, y + d, 0), b = P(x + w, y + d, 0), e = P(x + w, y, 0);
      ctx.save(); ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
      for (const [lw, al] of [[Math.min(12, px * 0.3), 0.07], [Math.min(6, px * 0.15), 0.1], [Math.min(3, px * 0.07), 0.14]]) {
        ctx.strokeStyle = `rgba(60,50,110,${al})`; ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(e[0], e[1]); ctx.stroke();
      }
      ctx.restore();
    }
    poly(ctx, [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], c.right);
    poly(ctx, [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], c.left);
    // tonal falloff on the side faces: a touch lighter at the top edge, darker toward the floor
    if (hp > 10) {
      const t0 = P(x + w, y + d, z + h), b0 = P(x + w, y + d, z);
      const g = ctx.createLinearGradient(0, t0[1], 0, b0[1]);
      g.addColorStop(0, 'rgba(255,255,255,0.13)'); g.addColorStop(0.4, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(60,50,110,0.10)');
      ctx.beginPath();
      const f1 = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], f2 = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];
      for (const f of [f1, f2]) { ctx.moveTo(f[0][0], f[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(f[i][0], f[i][1]); ctx.closePath(); }
      ctx.fillStyle = g; ctx.fill();
    }
    poly(ctx, [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], c.top);
    if (edges) {
      ctx.strokeStyle = c.edge; ctx.lineWidth = 1; ctx.lineJoin = 'round';
      ctx.beginPath();
      const a = P(x, y + d, z + h), b = P(x + w, y + d, z + h), e = P(x + w, y, z + h), f = P(x + w, y + d, z);
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(e[0], e[1]);
      ctx.moveTo(b[0], b[1]); ctx.lineTo(f[0], f[1]);
      ctx.stroke();
    }
  }
  // convex hull (monotone chain) of 2D world points
  function hull(pts) {
    pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  function cylinder(ctx, P, s, cx, cy, z, r, h, base) {
    const b = P(cx, cy, z), tp = P(cx, cy, z + h);
    const rx = 1.2247 * r * s, ry = 0.7071 * r * s;
    const g = ctx.createLinearGradient(b[0] - rx, 0, b[0] + rx, 0);
    g.addColorStop(0, H.rgba(H.mix(base, '#ffffff', 0.15)));
    g.addColorStop(0.35, H.rgba(H.mix(base, '#ffffff', 0.3)));
    g.addColorStop(0.55, H.rgba(base));
    g.addColorStop(1, H.rgba(H.mix(base, SHADE_DARK, 0.32)));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(b[0], b[1], rx, ry, 0, 0, Math.PI); ctx.lineTo(tp[0] - rx, tp[1]);
    ctx.ellipse(tp[0], tp[1], rx, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
    ctx.fillStyle = H.rgba(H.mix(base, '#ffffff', 0.5));
    ctx.beginPath(); ctx.ellipse(tp[0], tp[1], rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    return { b, tp, rx, ry };
  }

  // ================= EXPLAINER: "How does AI learn?" as one long isometric factory the camera travels along =================
  function petFace(c, kind, x, y, r, col, ink) {
    c.save(); c.translate(x, y);
    c.fillStyle = col;
    if (kind === 'cat') {
      for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 0.85 * r, -0.2 * r); c.lineTo(sx * 0.62 * r, -1.15 * r); c.lineTo(sx * 0.12 * r, -0.78 * r); c.closePath(); c.fill(); }
    } else {
      c.fillStyle = H.rgba(H.mix(col, ink, 0.35));
      for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 0.88 * r, 0.05 * r, 0.32 * r, 0.62 * r, sx * 0.35, 0, 7); c.fill(); }
      c.fillStyle = col;
    }
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
    c.fillStyle = ink;
    for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 0.36 * r, -0.12 * r, r * 0.12, 0, 7); c.fill(); }
    if (kind === 'cat') {
      c.beginPath(); c.moveTo(-0.1 * r, 0.18 * r); c.lineTo(0.1 * r, 0.18 * r); c.lineTo(0, 0.3 * r); c.closePath(); c.fill();
      c.strokeStyle = ink; c.lineWidth = Math.max(0.6, r * 0.05);
      c.beginPath(); for (const sx of [-1, 1]) for (const dy of [0.22, 0.36]) { c.moveTo(sx * 0.3 * r, dy * r); c.lineTo(sx * 0.85 * r, (dy - 0.06) * r); } c.stroke();
    } else {
      c.beginPath(); c.ellipse(0, 0.32 * r, 0.2 * r, 0.14 * r, 0, 0, 7); c.fill();
    }
    c.restore();
  }
  const wallX = (ctx, p) => ctx.transform(C30, 0.5, 0, 1, p[0], p[1]);        // plane facing +y (lower-left), px units
  const floorX = (ctx, p) => ctx.transform(C30, 0.5, -C30, 0.5, p[0], p[1]);  // floor plane, px units
  function tag(ctx, x, y, text, o = {}) {
    ctx.save();
    ctx.font = o.font || '600 13px "Inter"';
    const fsz = parseInt((ctx.font.match(/(\d+)px/) || [0, 14])[1]);
    const w = ctx.measureText(text).width + (o.icon ? fsz * 2.4 : fsz * 1.4), h = o.h || Math.round(fsz * 1.75);
    const k = o.k ?? 1;
    ctx.translate(x, y); ctx.scale(k, k);
    ctx.shadowColor = 'rgba(80,70,140,0.2)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
    ctx.fillStyle = o.bg || '#ffffff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
    ctx.shadowColor = 'transparent';
    if (o.icon) { ctx.fillStyle = o.iconCol || '#ff6b5b'; ctx.beginPath(); ctx.arc(-w / 2 + fsz * 0.9, 0, fsz * 0.3, 0, 7); ctx.fill(); }
    ctx.fillStyle = o.col || '#2d3058'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, o.icon ? fsz * 0.5 : 0, 1);
    ctx.restore();
  }
  function numberTag(ctx, x, y, num, label, o = {}) {
    const k = o.k ?? 1; if (k <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.font = '800 66px "Inter"'; const nw = ctx.measureText(num).width;
    ctx.font = '600 24px "Inter"'; const lw = ctx.measureText(label).width;
    const w = Math.max(nw, lw) + 56, h = 118;
    ctx.shadowColor = 'rgba(80,70,140,0.25)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 6;
    ctx.fillStyle = o.bg || '#ffffff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = o.sub || '#7b7aa3'; ctx.fillText(label, 0, -h / 2 + 34);
    ctx.font = '800 66px "Inter"'; ctx.fillStyle = o.col || '#2d3058'; ctx.fillText(num, 0, h / 2 - 18);
    ctx.restore();
  }
  function arrow(ctx, pts, prog, col, dash, w = 2) {
    // pts: quadratic [a, ctrl, b] in screen space, drawn on up to prog
    if (prog <= 0) return;
    const [a, c, b] = pts;
    const q = (u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); const n = 30; for (let i = 1; i <= n; i++) { const p = q(prog * i / n); ctx.lineTo(p[0], p[1]); } ctx.stroke();
    ctx.setLineDash([]);
    const e = q(prog), e0 = q(Math.max(0, prog - 0.04)), ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
    ctx.fillStyle = col; ctx.translate(e[0], e[1]); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-7, -5.5); ctx.lineTo(-7, 5.5); ctx.closePath(); ctx.fill();
    ctx.restore();
    return q;
  }
  function isoExplainer(ctx, W, H_, t) {
    const ph = (a, b) => H.clamp((t - a) / (b - a));
    const E = (a, b) => H.ease.inOut(ph(a, b));
    const EO = (a, b) => H.ease.out(ph(a, b));
    const ACC = '#ff6b5b', MINT = '#3ccf9a', INK = '#2d3058';
    // ---------- camera keyframes: [t, fx, fy, scale] ----------
    const KF = [[0, 11, 4, 0.5, 24], [1.6, 11, 4, 0.5, 26], [2.8, 4.6, 3.4, 2.0, 46], [5.9, 5.6, 3.6, 1.9, 46], [6.9, 15.3, 5.0, 1.8, 54], [10.3, 15.3, 5.0, 1.8, 54], [11.1, 22.9, 3.6, 2.9, 68], [12.9, 22.9, 3.6, 2.9, 68], [13.8, 13, 4, 0.8, 27], [20, 13, 4, 0.8, 27]];
    let k = 0; while (k < KF.length - 2 && t > KF[k + 1][0]) k++;
    const [t0, fx0, fy0, fz0, s0] = KF[k], [t1, fx1, fy1, fz1, s1] = KF[k + 1];
    const u = H.ease.inOut(H.clamp((t - t0) / (t1 - t0)));
    const fx = H.lerp(fx0, fx1, u), fy = H.lerp(fy0, fy1, u), fz = H.lerp(fz0, fz1, u), s = H.lerp(s0, s1, u);
    const bob = Math.sin(t * 1.2) * 3;
    const P = (x, y, z = 0) => [640 + ((x - fx) - (y - fy)) * C30 * s, 390 + bob + ((x - fx) + (y - fy)) * 0.5 * s - (z - fz) * s];
    const LX = 26, LY = 8, TH = 0.9;

    // ---------- background ----------
    const bg = ctx.createLinearGradient(0, 0, W, H_);
    bg.addColorStop(0, '#f6efe8'); bg.addColorStop(0.55, '#efeaf4'); bg.addColorStop(1, '#e4e3f3');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
    ctx.fillStyle = 'rgba(120,110,170,0.10)';
    for (let y = 18; y < H_; y += 28) for (let x = 18 + ((y / 28) % 2) * 14; x < W; x += 28) ctx.fillRect(x, y, 2, 2);
    { const glow = ctx.createRadialGradient(660, 380, 40, 660, 380, 620); glow.addColorStop(0, 'rgba(255,255,255,0.7)'); glow.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H_); }
    // long soft shadow of the slab
    {
      const L = H.layer(W, H_), lc = L.getContext('2d');
      lc.filter = `blur(${Math.round(s * 0.5)}px)`;
      const G = (x, y) => { const p = P(x + 2.2, y, -TH); return [p[0], p[1] + s * 3.2]; };
      poly(lc, [G(0, 0), G(LX, 0), G(LX, LY), G(0, LY)], 'rgb(90,80,150)');
      ctx.globalAlpha = 0.14; ctx.drawImage(L, 0, 0); ctx.globalAlpha = 1;
    }
    // slab
    box(ctx, P, 0.3, 0.3, -TH - 0.6, LX - 0.6, LY - 0.6, 0.6, shade('#b9addf'), false);
    box(ctx, P, 0, 0, -TH, LX, LY, TH, shade('#cfc6ea'), false);
    poly(ctx, [P(0, 0), P(LX, 0), P(LX, LY), P(0, LY)], '#fbf8f3');
    ctx.strokeStyle = 'rgba(170,160,205,0.2)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 1; i < LX; i++) { const a = P(i, 0), b = P(i, LY); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    for (let i = 1; i < LY; i++) { const a = P(0, i), b = P(LX, i); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    ctx.stroke();
    // zone tints + painted floor labels
    poly(ctx, [P(0.3, 0.3), P(9.6, 0.3), P(9.6, 3.6), P(0.3, 3.6)], 'rgba(255,214,196,0.35)');
    poly(ctx, [P(19.2, 0.6), P(25.7, 0.6), P(25.7, 6.6), P(19.2, 6.6)], 'rgba(205,240,224,0.45)');
    const floorText = (x, y, str, a = 1, size = 22) => { const o = P(x, y); ctx.save(); floorX(ctx, o); ctx.scale(s / 35, s / 35); ctx.globalAlpha = a; ctx.font = `800 ${size}px "Inter"`; ctx.fillStyle = 'rgba(150,140,200,0.55)'; ctx.fillText(str, 0, 0); ctx.restore(); };
    floorText(0.9, 7.6, 'TRAINING DATA', 1, 20);
    floorText(19.6, 7.4, 'TRAINING ROUNDS →', EO(10.6, 11.4), 20);
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); { const a = P(0, LY), b = P(LX, LY), c = P(LX, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); } ctx.stroke();

    // ---------- scene objects (painter-sorted) ----------
    const objs = [], shadows = [];
    const add = (key, fn) => objs.push({ key, fn });
    const R = H.rng(31);
    // data stacks at the back: grow while the counter runs
    const cnt = Math.floor(1e6 * Math.pow(EO(2.8, 5.7), 1.6));
    const grow = 0.25 + 2.2 * Math.pow(EO(2.6, 5.8), 1.2);
    [[1.0, 1.0], [3.2, 1.0], [5.4, 1.0], [7.6, 1.0]].forEach(([x, y], i) => {
      const h = Math.max(0.15, grow * (0.8 + 0.25 * Math.sin(i * 2.3)));
      shadows.push([x, y, 1.3, 1.6, h]);
      add(x + 0.65 + y + 0.8, () => {
        const n = Math.max(1, Math.round(h / 0.16));
        for (let j = 0; j < n; j++) box(ctx, P, x + Math.sin(j * 1.7 + i) * 0.04, y, j * 0.16, 1.3, 1.6, 0.14, shade(j % 2 ? '#ffffff' : (i % 2 ? '#ffd9cf' : '#dbe3f6')), false);
        // top card shows a pet face in the floor plane
        const o = P(x + 0.65, y + 0.8, n * 0.16);
        ctx.save(); floorX(ctx, o); ctx.scale(s / 40, s / 40); petFace(ctx, i % 2 ? 'dog' : 'cat', 0, 0, 13, i % 2 ? '#f2c39a' : '#c8cde6', INK); ctx.restore();
      });
    });
    // billboard counter over the data zone
    add(4.4 + 0.4, () => {
      for (const x of [1.4, 7.6]) box(ctx, P, x, 0.35, 0, 0.18, 0.18, 3.0, shade('#d8d4ea'), false);
      box(ctx, P, 1.0, 0.25, 3.0, 7.2, 0.25, 1.15, shade('#ffffff'));
      const o = P(1.0, 0.5, 4.15);
      ctx.save(); wallX(ctx, o); ctx.scale(s / 40, s / 40);
      ctx.font = '800 32px "Inter"'; ctx.fillStyle = INK; ctx.fillText('DATASET', 60, 36);
      ctx.restore();
    });
    // conveyor belt (segmented for correct depth)
    for (let i = 0; i < 10; i++) {
      add(i + 0.5 + 5.5, () => {
        box(ctx, P, i, 5.0, 0, 1, 1.0, 0.4, shade('#8e97c9'), false);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
        const off = ((t * 2.2) % 0.5);
        for (let k2 = 0; k2 < 2; k2++) { const xx = i + k2 * 0.5 + off; if (xx > i + 1) continue; const a = P(xx, 5.0, 0.4), b = P(xx, 6.0, 0.4); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      });
    }
    // example cards riding the belt (beat 2) + the single test card (beat 3)
    const cards = [];
    if (t > 2.4 && t < 6.6) {
      for (let j = 0; j < 9; j++) {
        const x = (t - 2.4) * 2.6 - j * 2.6 + 0.3;
        if (x < 0.2 || x > 9.4) continue;
        cards.push({ x, kind: (j * 7 + 3) % 3 === 0 ? 'dog' : ((j * 5) % 2 ? 'cat' : 'dog'), lab: true });
      }
    }
    if (t > 5.9 && t < 7.4) cards.push({ x: H.lerp(0.4, 9.6, E(5.9, 7.3)), kind: 'cat', test: true });
    for (const cd of cards) {
      add(cd.x + 0.5 + 5.5 + 0.6, () => {
        const y = 5.45;
        box(ctx, P, cd.x, y, 0.4, 1.0, 0.1, 1.0, shade(cd.test ? '#ffd9cf' : '#ffffff'), false);
        const o = P(cd.x + 0.5, y + 0.1, 0.9);
        ctx.save(); wallX(ctx, o); ctx.scale(s / 40, s / 40);
        petFace(ctx, cd.kind, 0, 0, 12, cd.kind === 'cat' ? '#b9c2ea' : '#f2c39a', INK);
        ctx.restore();
      });
    }
    // the model: a machine with a glass-top neural net and three tuning dials
    const adj = E(8.6, 9.3);
    const nodes = [];
    for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) nodes.push([10.8 + c * 1.2, 3.9 + r * 1.25, c]);
    shadows.push([10, 3.2, 4, 3.8, 2.6]);
    add(12 + 5.1, () => {
      box(ctx, P, 10, 3.2, 0, 4, 3.8, 2.6, shade('#aab6e8'));
      // intake slot on the front
      poly(ctx, [P(10.25, 7, 0.45), P(10.95, 7, 0.45), P(10.95, 7, 1.5), P(10.25, 7, 1.5)], '#4a5488');
      // dials on the +y face
      const err = ph(7.4, 8.6) * (1 - ph(9.3, 9.8));
      for (let d = 0; d < 3; d++) {
        const o = P(11.6 + d * 0.85, 7, 1.15);
        ctx.save(); wallX(ctx, o); ctx.scale(s / 40, s / 40);
        ctx.fillStyle = '#eef1fa'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fill();
        ctx.strokeStyle = err > 0 ? H.rgba(ACC, 0.4 + 0.6 * err) : '#8e9bd0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.stroke();
        const ang = -0.9 + d * 0.7 + adj * (d === 1 ? -1.6 : 1.1) + Math.sin(t * 9) * 0.15 * (adj > 0 && adj < 1 ? 1 : 0);
        ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * 10, Math.sin(ang) * 10); ctx.stroke();
        ctx.restore();
      }
      // net on top (glass panel)
      poly(ctx, [P(10.3, 3.5, 2.61), P(13.7, 3.5, 2.61), P(13.7, 6.7, 2.61), P(10.3, 6.7, 2.61)], 'rgba(230,236,255,0.9)');
      const wts = (i, j) => { const a = Math.abs(Math.sin(i * 3.1 + j * 1.7)), b = Math.abs(Math.cos(i * 2.3 + j * 0.9)); return H.lerp(a, b, adj); };
      const pulse = ph(6.9, 7.4) * (1 - ph(7.4, 7.6)) + ph(9.3, 9.6) * (1 - ph(9.6, 9.9));
      for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
        if (nodes[j][2] !== nodes[i][2] + 1) continue;
        const a = P(nodes[i][0], nodes[i][1], 2.62), b = P(nodes[j][0], nodes[j][1], 2.62);
        const w = wts(i, j), errCol = H.mix([142, 155, 208], H.hex(ACC), ph(8.0, 8.6) * (1 - ph(9.0, 9.4)));
        ctx.strokeStyle = H.rgba(errCol, 0.35 + 0.6 * w); ctx.lineWidth = 0.6 + 2.6 * w * (s / 40);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      for (const [x, y, c] of nodes) {
        const p = P(x, y, 2.62), rr = 0.17 * s;
        const lit = pulse > 0 ? Math.max(0, Math.sin((t * 6) - c * 1.2)) * pulse : 0;
        ctx.fillStyle = H.rgba(H.mix('#7d8fd6', '#ffe28a', lit)); ctx.beginPath(); ctx.ellipse(p[0], p[1], rr, rr * 0.7, 0, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(p[0] - rr * 0.3, p[1] - rr * 0.25, rr * 0.35, rr * 0.22, 0, 0, 7); ctx.fill();
      }
    });
    // output monitor
    const shake = (t > 7.4 && t < 7.8) ? Math.sin(t * 90) * 0.06 : 0;
    shadows.push([15.3, 4.4, 3.2, 0.6, 3.2]);
    add(16.9 + 4.8, () => {
      box(ctx, P, 16.6, 4.5, 0, 0.4, 0.4, 1.0, shade('#d8d4ea'), false);
      box(ctx, P, 15.2 + shake, 4.4, 1.0, 3.4, 0.5, 2.3, shade('#4a5488'));
      const sx0 = 15.4 + shake, sx1 = 18.4 + shake;
      const wrong = t > 7.05 && t < 9.4, right = t >= 9.4;
      const scr = wrong && t > 7.4 ? '#ffe3df' : right ? '#dcf7ec' : '#eef1fa';
      poly(ctx, [P(sx0, 4.9, 1.2), P(sx1, 4.9, 1.2), P(sx1, 4.9, 3.1), P(sx0, 4.9, 3.1)], scr);
      { // glass: inner shade along the bezel + a diagonal sheen band
        const a0 = P(sx0, 4.9, 3.1), a1 = P(sx1, 4.9, 1.2);
        const ig = ctx.createLinearGradient(0, a0[1], 0, P(sx0, 4.9, 1.2)[1]); ig.addColorStop(0, 'rgba(60,50,110,0.10)'); ig.addColorStop(0.18, 'rgba(60,50,110,0)'); ig.addColorStop(1, 'rgba(255,255,255,0.12)');
        poly(ctx, [P(sx0, 4.9, 1.2), P(sx1, 4.9, 1.2), P(sx1, 4.9, 3.1), P(sx0, 4.9, 3.1)], ig);
        const sg = ctx.createLinearGradient(a0[0], a0[1], a1[0], a1[1]);
        sg.addColorStop(0.32, 'rgba(255,255,255,0)'); sg.addColorStop(0.4, 'rgba(255,255,255,0.32)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.08)'); sg.addColorStop(0.56, 'rgba(255,255,255,0)');
        poly(ctx, [P(sx0, 4.9, 1.2), P(sx1, 4.9, 1.2), P(sx1, 4.9, 3.1), P(sx0, 4.9, 3.1)], sg);
      }
      const o = P(sx0, 4.9, 3.1);
      ctx.save(); wallX(ctx, o); ctx.scale(s / 40, s / 40);
      const SW = 3 * 40, SH = 1.9 * 40;
      if (t > 6.9 && t < 7.05) { ctx.fillStyle = '#9aa6d6'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(SW / 2 - 14 + i * 14, SH / 2, 4, 0, 7); ctx.fill(); } }
      if (wrong || right) {
        petFace(ctx, right ? 'cat' : 'dog', 26, SH / 2, 15, right ? '#b9c2ea' : '#f2c39a', INK);
        ctx.font = '800 30px "Inter"'; ctx.fillStyle = INK; ctx.fillText(right ? 'cat' : 'dog?', 46, SH / 2 + 11);
      }
      ctx.restore();
    });
    // accuracy chart: one bar per training round
    const ACCS = [61, 72, 80, 86, 90, 93, 95, 97];
    const roundT = (i) => 10.9 + i * 0.22;
    ACCS.forEach((a, i) => {
      const x = 19.7 + i * 0.72, y = 3.4, hh = (a - 50) / 50 * 4.4 * EO(roundT(i), roundT(i) + 0.35);
      if (hh <= 0.01) return;
      shadows.push([x, y, 0.5, 0.6, hh]);
      add(x + 0.25 + y + 0.3, () => box(ctx, P, x, y, 0, 0.5, 0.6, hh, shade(i === 7 ? '#ff8a7a' : H.mix('#aab6e8', '#8fd9bd', i / 7))));
    });
    add(19.4 + 2, () => box(ctx, P, 19.4, 2.9, 0, 6.2, 0.3, 0.2, shade('#d8d4ea'), false));
    // decorative trees
    for (const [tx, ty] of [[0.7, 7.3], [25.3, 0.8], [25.2, 7.2], [9.3, 0.7]]) {
      shadows.push([tx - 0.3, ty - 0.3, 0.6, 0.6, 1.8]);
      add(tx + ty, () => {
        const b = P(tx, ty), top = P(tx, ty, 1.4); const rr = 0.6 * s;
        ctx.strokeStyle = '#b79a8a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(top[0], top[1] + 4); ctx.stroke();
        ctx.fillStyle = '#7fc8a8'; ctx.beginPath(); ctx.arc(top[0], top[1] - rr * 0.3, rr, 0, 7); ctx.fill();
        ctx.fillStyle = '#a3dcc0'; ctx.beginPath(); ctx.arc(top[0] - rr * 0.22, top[1] - rr * 0.5, rr * 0.72, 0, 7); ctx.fill();
      });
    }
    // shadows (one layer)
    {
      const L = H.layer(W, H_), lc = L.getContext('2d');
      for (const [x, y, w, d, h] of shadows) {
        const base = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
        poly(lc, hull(base.concat(base.map(p => [p[0] + 1.1 * h, p[1] + 0.12 * h]))).map(p => P(p[0], p[1])), '#000');
      }
      lc.globalCompositeOperation = 'destination-in'; poly(lc, [P(0, 0), P(LX, 0), P(LX, LY), P(0, LY)], '#000');
      lc.globalCompositeOperation = 'source-in'; lc.fillStyle = 'rgb(110,96,170)'; lc.fillRect(0, 0, W, H_);
      ctx.globalAlpha = 0.16; ctx.drawImage(L, 0, 0); ctx.globalAlpha = 1;
    }
    objs.sort((a, b) => a.key - b.key);
    for (const o of objs) { ctx.save(); o.fn(); ctx.restore(); }

    // ---------- screen-space annotation layer: tags that land on things, connectors ----------
    // beat 2: label tags riding on each card
    for (const cd of cards) {
      if (cd.test) {
        const p = P(cd.x + 0.5, 5.5, 1.75);
        tag(ctx, p[0], p[1] - 14, '?', { k: EO(5.9, 6.2), font: '800 26px "Inter"', bg: ACC, col: '#fff' });
        continue;
      }
      const p = P(cd.x + 0.5, 5.5, 1.75);
      const k = EO(2.4 + 0.0, 2.8) * H.clamp((cd.x - 0.2) * 3) * H.clamp((9.4 - cd.x) * 3);
      if (k > 0.05) tag(ctx, p[0], p[1] - 16, cd.kind, { k, font: '700 24px "Inter"', icon: true, iconCol: cd.kind === 'cat' ? '#7f8fd8' : '#f2a46b' });
    }
    if (t > 2.6 && t < 6.4) { const b = P(4.6, 0.4, 4.4); numberTag(ctx, b[0], b[1] - 70, cnt.toLocaleString('en-US'), 'examples', { k: H.ease.back(ph(2.6, 2.95)) * (1 - E(6.0, 6.4)) }); }
    // flow arrow: data -> model
    {
      const a = P(1.2, 6.6, 2.2), b = P(10.2, 6.6, 2.0);
      arrow(ctx, [a, [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 0.9 * s], b], E(3.0, 3.9) * (1 - ph(6.2, 6.5)), 'rgba(74,84,136,0.75)', [6, 6], 2);
      if (t > 3.6 && t < 6.4) { const m = P(9.3, 7.0, 3.2); tag(ctx, m[0], m[1] - 0.6 * s, 'into the model', { k: EO(3.6, 3.9), font: '700 24px "Inter"', bg: '#4a5488', col: '#fff' }); }
    }
    // beat 3 loop: Guess -> Check -> Adjust
    if (t > 6.6 && t < 10.6) {
      const fade = 1 - ph(10.3, 10.6);
      ctx.save(); ctx.globalAlpha = fade;
      const mTop = P(12.6, 5.6, 2.75), scrL = P(15.4, 4.9, 2.7), scrTop = P(16.9, 4.7, 3.4), mBack = P(12.4, 5.2, 2.9);
      // Guess
      arrow(ctx, [mTop, [(mTop[0] + scrL[0]) / 2, Math.min(mTop[1], scrL[1]) - 1.4 * s], scrL], E(6.8, 7.15), INK, null, 2.5);
      if (t > 6.85) { const g = [(mTop[0] + scrL[0]) / 2, Math.min(mTop[1], scrL[1]) - 0.75 * s]; tag(ctx, g[0], g[1] - 14, '1  Guess', { k: H.ease.back(ph(6.85, 7.15)), font: '800 26px "Inter"' }); }
      // Check: emphasis ring on the wrong answer
      if (t > 7.4) {
        tag(ctx, scrTop[0] + 0.4 * s, scrTop[1] - 0.6 * s, '2  Check', { k: H.ease.back(ph(7.45, 7.75)), font: '800 26px "Inter"' });
        if (t < 9.4) {
          const c = P(16.9, 4.9, 2.15), pr = EO(7.45, 7.9);
          ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.globalAlpha = fade * (0.6 + 0.4 * Math.sin(t * 10));
          ctx.beginPath(); ctx.ellipse(c[0], c[1], 1.95 * s * (1.4 - 0.4 * pr), 1.25 * s * (1.4 - 0.4 * pr), -0.05, 0, Math.PI * 2 * pr); ctx.stroke(); ctx.restore();
          if (t < 7.6) { ctx.fillStyle = `rgba(255,107,91,${0.25 * (1 - ph(7.4, 7.6))})`; ctx.fillRect(0, 0, W, H_); }
        }
      }
      // Adjust: error signal travels back
      if (t > 8.0) {
        const q = arrow(ctx, [scrTop, [(scrTop[0] + mBack[0]) / 2, scrTop[1] - 2.2 * s], mBack], E(8.0, 8.6), ACC, [7, 5], 2.5);
        if (q && t < 8.9) { const p2 = q(E(8.0, 8.6)); ctx.fillStyle = 'rgba(255,107,91,0.3)'; ctx.beginPath(); ctx.arc(p2[0], p2[1], 10, 0, 7); ctx.fill(); }
        const dl = P(12.45, 7.0, 0.4);
        tag(ctx, dl[0], dl[1] + 0.55 * s, '3  Adjust', { k: H.ease.back(ph(8.5, 8.8)), font: '800 26px "Inter"', bg: ACC, col: '#fff' });
        const lt = P(14.0, 3.2, 4.4);
        tag(ctx, lt[0], lt[1], 'error!', { k: H.ease.back(ph(8.1, 8.35)) * (1 - ph(9.2, 9.4)), font: '700 22px "Inter"', bg: '#ffe3df', col: ACC });
      }
      // truth label under the screen + verdict badge stamped on the screen corner
      if (t > 7.5 && t < 9.4) { const c = P(16.9, 4.9, 0.85); tag(ctx, c[0], c[1] + 16, "answer: cat", { k: H.ease.back(ph(7.6, 7.9)), font: '700 26px "Inter"', bg: INK, col: '#fff' }); }
      if (t > 7.4) {
        const right = t >= 9.4, b = P(18.5 + shake, 4.9, 3.25);
        const kk = right ? H.ease.back(ph(9.45, 9.75)) : H.ease.back(ph(7.4, 7.65));
        ctx.save(); ctx.translate(b[0], b[1]); ctx.scale(kk, kk);
        ctx.fillStyle = right ? MINT : ACC; ctx.beginPath(); ctx.arc(0, 0, 19, 0, 7); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
        if (right) { ctx.moveTo(-8, 0); ctx.lineTo(-2, 7); ctx.lineTo(9, -7); } else { ctx.moveTo(-7, -7); ctx.lineTo(7, 7); ctx.moveTo(7, -7); ctx.lineTo(-7, 7); }
        ctx.stroke(); ctx.restore();
      }
      if (t > 9.4) { const c = P(16.9, 4.7, 3.4); tag(ctx, c[0] + 0.4 * s, c[1] - 0.6 * s, 'Guess again ✓', { k: H.ease.back(ph(9.45, 9.75)), font: '800 26px "Inter"', bg: MINT, col: '#fff' }); }
      ctx.restore();
    }
    // beat 4: counting accuracy tag that rides the newest bar
    if (t > 10.8) {
      const i = Math.min(7, Math.max(0, Math.floor((t - 10.9) / 0.22)));
      const cur = Math.round(H.lerp(61, 97, H.ease.inOut(ph(10.9, 12.6))));
      const x = 19.7 + i * 0.72 + 0.25, hh = (ACCS[i] - 50) / 50 * 4.4;
      const p = P(x, 3.7, hh + 0.2);
      const pop = t > 12.6 ? 1 + 0.18 * Math.sin(Math.min(1, (t - 12.6) / 0.35) * Math.PI) : 1;
      ctx.strokeStyle = 'rgba(74,84,136,0.6)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], p[1] - 42); ctx.stroke();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(p[0], p[1], 3.5, 0, 7); ctx.fill();
      numberTag(ctx, p[0], p[1] - 100, `${cur}%`, 'Accuracy', { k: H.ease.back(ph(10.85, 11.15)) * pop, bg: cur >= 97 ? ACC : '#ffffff', col: cur >= 97 ? '#fff' : INK, sub: cur >= 97 ? 'rgba(255,255,255,0.85)' : '#7b7aa3' });
      if (t > 12.6) { // sparkle emphasis
        ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 2; ctx.globalAlpha = 1 - ph(12.6, 13.2);
        const rr2 = 80 + 60 * EO(12.6, 13.2); ctx.beginPath(); ctx.arc(p[0], p[1] - 100, rr2, 0, 7); ctx.stroke(); ctx.restore();
      }
      const p0 = P(19.95, 3.7, (61 - 50) / 50 * 4.4 + 0.15);
      if (t < 13.4 && t > 11.0) tag(ctx, p0[0] - 40, p0[1] - 68, 'round 1: 61%', { k: EO(10.9, 11.2) * (1 - ph(13.0, 13.4)), font: '700 22px "Inter"', col: '#7b7aa3' });
    }

    // ---------- hook: big question that shrinks into the corner header ----------
    {
      const sh = E(1.5, 2.4);
      const a = EO(0.15, 0.7);
      const size = H.lerp(66, 30, sh);
      ctx.save(); ctx.globalAlpha = a;
      if (sh < 1) { ctx.fillStyle = `rgba(251,248,243,${0.7 * (1 - sh)})`; ctx.fillRect(0, 0, W, H_); }
      ctx.font = `800 ${size}px "Inter"`; ctx.fillStyle = INK;
      const w = ctx.measureText('How does AI learn?').width;
      const x = H.lerp(640 - w / 2, 48, sh), y = H.lerp(330, 62, sh) + (1 - a) * 20;
      if (sh > 0) { ctx.save(); ctx.globalAlpha = a * sh; ctx.shadowColor = 'rgba(80,70,140,0.18)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(x - 18, y - size * 1.6, w + 36, size * 2.1, 14); ctx.fill(); ctx.restore(); ctx.fillStyle = INK; }
      ctx.fillText('How does AI learn?', x, y);
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.roundRect(x + 2, y - size * 1.32, H.lerp(40, 22, sh), H.lerp(7, 4, sh), 3); ctx.fill();
      ctx.restore();
    }
    // ---------- takeaway ----------
    if (t > 13.0) {
      const k2 = H.ease.back(ph(13.0, 13.5));
      ctx.save(); ctx.translate(640, 640 + (1 - EO(13.0, 13.4)) * 40); ctx.scale(k2, k2);
      ctx.font = '800 44px "Inter"';
      const str = 'More examples → better guesses', w = ctx.measureText(str).width + 80;
      ctx.shadowColor = 'rgba(80,70,140,0.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-w / 2, -44, w, 88, 44); ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(-w / 2 + 30, 0, 7, 0, 7); ctx.fill();
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, 12, 1);
      ctx.restore();
    }
  }

  // ---------- sound: a tidy toy factory (wooden-block pops, a soft belt motor, gentle camera glides) ----------
  function isoSound(k) {
    const D = 14.5;
    const ph = (t, a, b) => H.clamp((t - a) / (b - a));
    const inv = (u) => (u < 0.5 ? Math.cbrt(u / 4) : 1 - Math.cbrt((1 - u) * 2) / 2); // inverse of H.ease.inOut
    // camera keyframes copied from isoExplainer (KF), used to pan sounds to where their object sits on screen
    const KF = [[0, 11, 4, 0.5, 24], [1.6, 11, 4, 0.5, 26], [2.8, 4.6, 3.4, 2.0, 46], [5.9, 5.6, 3.6, 1.9, 46], [6.9, 15.3, 5.0, 1.8, 54], [10.3, 15.3, 5.0, 1.8, 54], [11.1, 22.9, 3.6, 2.9, 68], [12.9, 22.9, 3.6, 2.9, 68], [13.8, 13, 4, 0.8, 27], [20, 13, 4, 0.8, 27]];
    const pan = (x, y, t) => {
      let i = 0; while (i < KF.length - 2 && t > KF[i + 1][0]) i++;
      const [t0, fx0, fy0, , s0] = KF[i], [t1, fx1, fy1, , s1] = KF[i + 1], u = H.ease.inOut(H.clamp((t - t0) / (t1 - t0)));
      const sx = 640 + ((x - H.lerp(fx0, fx1, u)) - (y - H.lerp(fy0, fy1, u))) * C30 * H.lerp(s0, s1, u);
      return H.clamp(sx / 640 - 1, -1, 1) * 0.6;
    };
    // toy pop: a little lacquered-wood block snapping into place (body tock + soft pop), never squeaky
    const toy = (t, f, g, p, minor) => { const o = { pan: p, minor }; k.play('pop', t, { ...o, f, gain: 0.8 * g }); k.play('tock', t + 0.004, { ...o, f: f * 0.9, gain: 0.35 * g }); };
    // camera glide: a low, smooth air movement that swells with the eased camera speed (no swoosh)
    const glide = (t0, t1, g = 1) => { const d = t1 - t0; k.noise(t0, { dur: d + 0.15, color: 'pink', filter: 'bandpass', f: [[0, 220], [d * 0.5, 520], [d, 240]], q: 0.7, gain: 0.045 * g, a: d * 0.5, verb: 0.1 }); };
    // counter ticks: one per visible change, at most ~12/s, spaced by how fast the value is moving
    const counter = (a, b, val, f, g, p, minGap = 1 / 12, avoid = []) => {
      let last = -1, lastV = val(a);
      for (let t = a; t <= b + 1e-6; t += 1 / 120) {
        const v = val(t); if (v === lastV) continue;
        const speed = Math.abs(val(Math.min(b, t + 0.05)) - val(Math.max(a, t - 0.05)));
        const top = Math.abs(val(b) - val(a)) * 0.1 / (b - a) * 2.2; // roughly the peak change per 0.1 s
        const gap = H.clamp(minGap / Math.max(0.2, Math.min(1, speed / top)), minGap, 0.4);
        if (t - last >= gap && !avoid.some((x) => Math.abs(x - t) < 0.07)) { k.play('tick', t, { f, gain: g, pan: p, minor: true }); k.tone(t, { f: f / 8, dur: 0.03, gain: 0.05 * g, pan: p, minor: true }); last = t; }
        lastV = v;
      }
    };

    k.bed('room', 0, D, { gain: 0.25 });
    k.music('pad', 0, D, { bpm: 100, gain: 0.32, chords: [['C4', 'E4', 'G4', 'B4'], ['F3', 'A3', 'C4', 'E4'], ['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'B3', 'D4', 'F4'], ['C4', 'E4', 'G4', 'C5']] });

    // ---- hook: the question fades up (EO 0.15-0.7), then slides small into the corner header (1.5-2.4)
    toy(0.2, 520, 0.7, 0);
    k.noise(1.5, { dur: 0.9, color: 'pink', filter: 'lowpass', f: [[0, 700], [0.9, 300]], gain: 0.06, a: 0.35, minor: true });
    glide(1.6, 2.8); // camera dives onto the training-data shelves

    // ---- beat 2: data. belt motor + slat ticks while the cards ride, cards clack onto the belt once a second
    k.tone(2.4, { f: 72, type: 'sawtooth', dur: 4.3, gain: 0.025, a: 0.3, hold: 3.6, filter: 'lowpass', f2: 260, minor: true }); // belt motor
    for (let t = 2.4 + (0.5 - ((2.4 * 2.2) % 0.5)) / 2.2; t < 6.5; t += 0.5 / 2.2) if (t > 2.9 && (t - 2.36) % 1 > 0.1) k.play('tock', t, { f: 330, gain: 0.22, pan: pan(5, 5.5, t), minor: true }); // a belt slat passes
    for (let j = 0; j < 5; j++) { const t = Math.max(2.4, 2.4 + j - 0.1 / 2.6); if (t < 6.5) toy(t, 430, 0.55, pan(0.6, 5.5, t), true); } // card lands on the belt
    k.play('pop', 2.45, { f: 560, gain: 0.5, pan: pan(1, 5.5, 2.45), minor: true }); // cat/dog tags pop on
    toy(2.66, 600, 0.9, pan(4.6, 0.4, 2.66)); // examples counter pops up over the billboard
    counter(2.85, 5.66, (t) => Math.floor(1e6 * Math.pow(H.ease.out(ph(t, 2.8, 5.7)), 1.6)), 3400, 0.9, pan(4.6, 0.4, 4), 1 / 8);
    // dashed flow arrow draws (E 3.0-3.9): soft dabs, then the "into the model" tag
    for (let i = 1; i <= 5; i++) { const u = i / 5, t = 3.0 + 0.9 * inv(u); k.noise(t, { dur: 0.025, filter: 'bandpass', f: 1800, q: 1.4, gain: 0.12, a: 0.002, pan: pan(1.2 + 9 * u, 6.6, t), minor: true }); }
    toy(3.63, 470, 0.8, pan(9.3, 7, 3.63));
    // 1,000,000 lands (EO reaches 1 at 5.7)
    toy(5.7, 640, 1.1, pan(4.6, 0.4, 5.7));
    k.play('ding', 5.7, { f: 'G5', gain: 0.45, pan: pan(4.6, 0.4, 5.7) });

    // ---- beat 3: test card -> guess -> check -> adjust
    toy(5.93, 380, 0.9, pan(0.9, 5.5, 5.93)); // coral "?" on the test card
    glide(5.9, 6.9);
    k.play('tock', 7.3, { f: 300, gain: 0.35, pan: pan(10.25, 7, 7.3), minor: true }); // test card slides into the intake slot
    k.play('swish', 6.8, { dur: 0.32, gain: 0.25, pan: pan(14, 5, 6.95), minor: true }); // Guess arrow arcs over
    toy(6.9, 560, 0.85, pan(14, 5, 6.9)); // "1 Guess" tag
    k.tone(7.05, { f: 'E4', type: 'triangle', dur: 0.18, gain: 0.12, pan: pan(16.9, 4.9, 7.05) }); // "dog?" pops on the monitor
    // CHECK: wrong. red flash, monitor shakes, X badge stamps
    k.play('thud', 7.4, { f: 120, gain: 0.7, pan: pan(16.9, 4.9, 7.4) });
    k.play('error', 7.42, { f: 'A3', gain: 0.85, pan: pan(16.9, 4.9, 7.4) });
    toy(7.64, 440, 0.75, pan(16.9, 4.9, 7.64)); // "answer: cat"
    // ADJUST: error signal travels back along the dashed arc (E 8.0-8.6), then "error!" and "3 Adjust"
    k.tone(8.0, { f: [[0, 520], [0.6, 260]], type: 'triangle', dur: 0.6, gain: 0.06, a: 0.25, pan: pan(14.6, 5, 8.3), minor: true });
    k.noise(8.0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 900], [0.6, 500]], q: 1.2, gain: 0.07, a: 0.3, pan: pan(14.6, 5, 8.3), minor: true });
    toy(8.15, 680, 0.6, pan(14, 3.2, 8.15), true); // "error!"
    toy(8.55, 500, 0.85, pan(12.45, 7, 8.55)); // "3 Adjust"
    // dials turn (E 8.6-9.3, with a wobble): even ratchet clicks across the turn
    for (let i = 0; i < 5; i++) { k.play('click', 8.66 + i * 0.145, { f: 1100 + (i % 3) * 120, gain: 0.7, pan: pan(12.4, 7, 9), minor: true }); }
    // CORRECT: screen turns to cat (9.4), check badge + "Guess again" pop
    k.tone(9.4, { f: 'C5', type: 'triangle', dur: 0.15, gain: 0.1, pan: pan(16.9, 4.9, 9.4) });
    k.play('success', 9.46, { f: 'C5', gain: 0.8, pan: pan(18.3, 4.9, 9.46) });
    toy(9.48, 620, 0.7, pan(17.3, 4.7, 9.48), true);

    // ---- beat 4: the camera glides to the chart, bars pop up one round at a time (61 -> 97)
    glide(10.3, 11.1);
    ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'].forEach((n, i) => { const t = 10.9 + i * 0.22 + 0.03; k.tone(t, { f: [[0, k.hz(n)], [0.08, k.hz(n) * 0.75]], dur: 0.12, gain: 0.16, pan: pan(19.7 + i * 0.72, 3.4, t), minor: i < 7 }); k.play('tock', t, { f: k.hz(n) * 0.8, gain: 0.22, pan: pan(19.7 + i * 0.72, 3.4, t), minor: true }); });
    counter(10.92, 12.56, (t) => Math.round(H.lerp(61, 97, H.ease.inOut(ph(t, 10.9, 12.6)))), 2900, 0.7, pan(23, 3.7, 12), 1 / 12, [0, 1, 2, 3, 4, 5, 6, 7].map((i) => 10.93 + i * 0.22));
    // 97% (the biggest hit): coral flip, the tag swells, a ring expands
    k.play('impact', 12.6, { gain: 0.75, pan: pan(25, 3.7, 12.6) });
    ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => k.play('ding', 12.6 + i * 0.03, { f: n, gain: 0.42 - i * 0.05, pan: (i - 1.5) * 0.2 }));
    k.noise(12.62, { dur: 0.6, filter: 'bandpass', f: [[0, 1200], [0.6, 2400]], q: 2, gain: 0.04, a: 0.05, verb: 0.3, minor: true }); // ring shimmer
    glide(12.9, 13.8, 0.9); // pull back out to the whole floor
    // takeaway pill bounces in (back 13.0-13.5) and resolves
    toy(13.08, 470, 0.9, 0);
    ['G4', 'C5', 'E5'].forEach((n, i) => k.play('ding', 13.3 + i * 0.08, { f: n, gain: 0.35 - i * 0.06, pan: (i - 1) * 0.25 }));
    k.tone(13.3, { f: 'C3', type: 'triangle', dur: 1.2, gain: 0.12, a: 0.02 });
  }

  registerStyle({
    id: 'isometric',
    name: 'Isometric Pastel',
    category: 'Dimensional',
    description: 'Clean vector isometric illustration: true 30° projection, flat three-tone face shading, soft pastel palette with a single coral accent, tiny people for scale and long soft shadows on a floating tile.',
    motion: 'The floating tile rises into frame, buildings, tanks and racks pop up one by one on springy overshoot, then LEDs blink, fans spin, data cubes stream up and tiny workers stroll during a slow camera push.',
    duration: 5,
    fonts: ['800 46px "Inter"', '400 18px "Inter"', '600 13px "Inter"', '800 20px "Inter"'],
    frameT: 4.6,
    readsPixels: false,
    explainerDuration: 14.5,
    explainerNote: 'One long isometric factory floor (data shelves → conveyor → glass-top neural machine → monitor → bar chart) that the camera glides along beat to beat, with white label tags pinned to objects, curved dashed connectors, a counting billboard and an accuracy tag riding the newest bar.',
    explainer: isoExplainer,
    explainerSound: isoSound,
    draw(ctx, W, H_, t) {
      const R = H.rng(11);
      const s = 35;
      const bob = Math.sin(t * 1.2) * 4;
      const ph = (a, b) => H.clamp((t - a) / (b - a));
      const rise = H.ease.out(ph(0, 1.1));
      const P = makeIso(745, 118 + bob + (1 - rise) * 110, s);
      const TILE = 12, TH = 0.9;

      // ---------- background ----------
      const bg = ctx.createLinearGradient(0, 0, W, H_);
      bg.addColorStop(0, '#f6efe8'); bg.addColorStop(0.55, '#efeaf4'); bg.addColorStop(1, '#e4e3f3');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
      // faint dot grid
      ctx.fillStyle = 'rgba(120,110,170,0.10)';
      for (let y = 18; y < H_; y += 28) for (let x = 18 + ((y / 28) % 2) * 14; x < W; x += 28) ctx.fillRect(x, y, 2, 2);
      // soft glow behind tile
      const glow = ctx.createRadialGradient(745, 380, 40, 745, 380, 560);
      glow.addColorStop(0, 'rgba(255,255,255,0.75)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H_);
      // slow camera push on the world (title stays put)
      ctx.save();
      { const z = 0.955 + 0.045 * H.ease.inOut(H.clamp(t / 5)); ctx.translate(745, 380); ctx.scale(z, z); ctx.translate(-745, -380); }
      ctx.globalAlpha = ph(0, 0.45);

      // ground shadow of floating tile (long, soft, to the lower right)
      {
        const L = H.layer(W, H_), lc = L.getContext('2d');
        const G = makeIso(745 + 60, 118 + 130 - bob * 0.6, s);
        lc.filter = 'blur(16px)';
        poly(lc, [G(0, 0, -TH), G(TILE, 0, -TH), G(TILE + 3, TILE, -TH), G(3, TILE, -TH)].map(p => p), 'rgba(90,80,150,1)');
        ctx.globalAlpha = 0.16 * rise; ctx.drawImage(L, 0, 0); ctx.globalAlpha = ph(0, 0.45);
      }

      // ---------- floating tile slab ----------
      const slab = shade('#cfc6ea');
      // under-layer (soil) slightly inset
      box(ctx, P, 0.35, 0.35, -TH - 0.7, TILE - 0.7, TILE - 0.7, 0.7, shade('#b9addf'), false);
      box(ctx, P, 0, 0, -TH, TILE, TILE, TH, slab, false);
      // floor top
      poly(ctx, [P(0, 0, 0), P(TILE, 0, 0), P(TILE, TILE, 0), P(0, TILE, 0)], '#fbf8f3');
      // paving grid
      ctx.strokeStyle = 'rgba(170,160,205,0.22)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 1; i < TILE; i++) {
        let a = P(i, 0, 0), b = P(i, TILE, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        a = P(0, i, 0); b = P(TILE, i, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      }
      ctx.stroke();
      // grass patch (left corner)
      poly(ctx, [P(0.3, 7.3, 0), P(2.9, 7.3, 0), P(2.9, 11.7, 0), P(0.3, 11.7, 0)], '#d5efe1');
      poly(ctx, [P(9.4, 9.2, 0), P(11.7, 9.2, 0), P(11.7, 11.7, 0), P(9.4, 11.7, 0)], '#d5efe1');
      // walkway stripes
      ctx.strokeStyle = 'rgba(255,200,120,0.9)'; ctx.lineWidth = 2; ctx.setLineDash([7, 7]);
      ctx.beginPath(); { const a = P(3.2, 7.55, 0), b = P(9.0, 7.55, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      { const a = P(3.2, 11.3, 0), b = P(9.0, 11.3, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      ctx.stroke(); ctx.setLineDash([]);
      // painted floor marking "DC-01"
      {
        const o = P(8.9, 7.0, 0);
        ctx.save(); ctx.transform(C30, 0.5, -C30, 0.5, o[0], o[1]);
        ctx.font = '800 30px "Inter"'; ctx.fillStyle = 'rgba(160,150,205,0.45)'; ctx.fillText('DC-01', 0, 0);
        ctx.restore();
      }
      // slab front edge highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); { const a = P(0, TILE, 0), b = P(TILE, TILE, 0), c = P(TILE, 0, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); } ctx.stroke();

      ctx.globalAlpha = 1;
      // ---------- scene objects ----------
      const objs = [];
      const shadowBoxes = []; // [x,y,w,d,h]
      const add = (key, fn, at, base) => objs.push({ key, fn, at, base });

      // main data hall (back)
      const hall = { x: 0.7, y: 0.7, w: 5.2, d: 3.6, h: 3.0 };
      shadowBoxes.push([hall.x, hall.y, hall.w, hall.d, hall.h, 0.75]);
      add(hall.x + hall.w / 2 + hall.y + hall.d / 2, () => {
        const c = shade('#dbe3f6');
        box(ctx, P, hall.x, hall.y, 0, hall.w, hall.d, hall.h, c);
        // window band on left (front) face
        const y = hall.y + hall.d;
        for (let i = 0; i < 6; i++) {
          const x0 = hall.x + 0.3 + i * 0.8;
          poly(ctx, [P(x0, y, 1.1), P(x0 + 0.6, y, 1.1), P(x0 + 0.6, y, 2.4), P(x0, y, 2.4)], '#a9b8e6');
          poly(ctx, [P(x0, y, 1.9), P(x0 + 0.25, y, 2.4), P(x0 + 0.4, y, 2.4), P(x0 + 0.08, y, 1.75)], 'rgba(255,255,255,0.55)');
        }
        // door
        poly(ctx, [P(hall.x + 4.75, y, 0), P(hall.x + 5.05, y, 0), P(hall.x + 5.05, y, 0.9), P(hall.x + 4.75, y, 0.9)], '#8e9bd0');
        // vents on right face
        const x = hall.x + hall.w;
        for (let i = 0; i < 4; i++) {
          const y0 = hall.y + 0.35 + i * 0.8;
          for (let k = 0; k < 4; k++) {
            const zz = 1.0 + k * 0.32;
            poly(ctx, [P(x, y0, zz), P(x, y0 + 0.55, zz), P(x, y0 + 0.55, zz + 0.12), P(x, y0, zz + 0.12)], 'rgba(110,105,170,0.35)');
          }
        }
        // signage strip
        poly(ctx, [P(hall.x + 0.3, y, 2.55), P(hall.x + 2.6, y, 2.55), P(hall.x + 2.6, y, 2.82), P(hall.x + 0.3, y, 2.82)], '#ff6b5b');
        // roof units: AC fans
        for (let i = 0; i < 3; i++) {
          const fx = hall.x + 0.5 + i * 1.6, fy = hall.y + 0.5;
          box(ctx, P, fx, fy, hall.h, 1.2, 1.2, 0.35, shade('#eef1fa'));
          const cpt = P(fx + 0.6, fy + 0.6, hall.h + 0.35);
          ctx.fillStyle = '#9aa6d6'; ctx.beginPath(); ctx.ellipse(cpt[0], cpt[1], 0.45 * 1.2247 * s * 0.85, 0.45 * 0.7071 * s * 0.85, 0, 0, 7); ctx.fill();
          ctx.save(); ctx.translate(cpt[0], cpt[1]); ctx.scale(1, 0.577);
          ctx.rotate(t * 6 + i);
          ctx.fillStyle = '#eef1fa';
          for (let b = 0; b < 3; b++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.ellipse(5, 0, 7, 2.6, 0, 0, 7); ctx.fill(); }
          ctx.restore();
        }
        // solar panels on roof front
        for (let i = 0; i < 4; i++) {
          const px = hall.x + 0.4 + i * 1.2, py = hall.y + 2.1;
          poly(ctx, [P(px, py, hall.h + 0.1), P(px + 1.0, py, hall.h + 0.1), P(px + 1.0, py + 1.1, hall.h + 0.45), P(px, py + 1.1, hall.h + 0.45)], '#7d8fd6');
          ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 0.8; ctx.beginPath();
          for (let k = 1; k < 3; k++) { const a = P(px + k / 3, py, hall.h + 0.1), b = P(px + k / 3, py + 1.1, hall.h + 0.45); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
          const a = P(px, py + 0.55, hall.h + 0.275), b = P(px + 1, py + 0.55, hall.h + 0.275); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
          ctx.stroke();
        }
      }, 0.75, P(hall.x + hall.w / 2, hall.y + hall.d / 2, 0));

      // cooling tanks (right corner)
      const tanks = [[9.2, 1.6, 0.85, 2.7], [10.6, 3.4, 0.75, 2.2]];
      for (const [cx, cy, r, h] of tanks) {
        shadowBoxes.push([cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6, h, 1.0 + (cx - 9.2) * 0.12]);
        add(cx + cy, () => {
          const base = H.hex('#bfe7da');
          const c = cylinder(ctx, P, s, cx, cy, 0, r, h, base);
          // bands
          ctx.strokeStyle = 'rgba(90,150,140,0.35)'; ctx.lineWidth = 1.5;
          for (const zz of [0.5, h - 0.5]) { const p = P(cx, cy, zz); ctx.beginPath(); ctx.ellipse(p[0], p[1], c.rx, c.ry, 0, 0, Math.PI); ctx.stroke(); }
          // top rim + vent
          ctx.fillStyle = H.rgba(H.mix(base, '#5a8f86', 0.35)); ctx.beginPath(); ctx.ellipse(c.tp[0], c.tp[1], c.rx * 0.45, c.ry * 0.45, 0, 0, 7); ctx.fill();
          // ladder
          ctx.strokeStyle = 'rgba(80,120,120,0.5)'; ctx.lineWidth = 1;
          const lx = c.b[0] - c.rx * 0.35;
          ctx.beginPath(); ctx.moveTo(lx, c.b[1] + c.ry * 0.93); ctx.lineTo(lx, c.tp[1] + c.ry * 0.93);
          ctx.moveTo(lx + 6, c.b[1] + c.ry * 0.9); ctx.lineTo(lx + 6, c.tp[1] + c.ry * 0.9);
          for (let yy = c.tp[1] + c.ry + 4; yy < c.b[1] + c.ry; yy += 6) { ctx.moveTo(lx, yy); ctx.lineTo(lx + 6, yy); }
          ctx.stroke();
        }, 1.0 + (cx - 9.2) * 0.12, P(cx, cy, 0));
      }
      // pipes: from tanks to hall (drawn at depth just after hall, before racks)
      add(5.5, () => {
        const pipe = (pts, col, wpx) => {
          const sp = pts.map(p => P(...p));
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.strokeStyle = H.rgba(H.mix(col, SHADE_DARK, 0.3)); ctx.lineWidth = wpx;
          ctx.beginPath(); sp.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
          ctx.strokeStyle = H.rgba(col); ctx.lineWidth = wpx * 0.6;
          ctx.beginPath(); sp.forEach((p, i) => i ? ctx.lineTo(p[0], p[1] - wpx * 0.15) : ctx.moveTo(p[0], p[1] - wpx * 0.15)); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.2;
          ctx.beginPath(); sp.forEach((p, i) => i ? ctx.lineTo(p[0], p[1] - wpx * 0.3) : ctx.moveTo(p[0], p[1] - wpx * 0.3)); ctx.stroke();
          // flanges
          for (let i = 1; i < sp.length - 1; i++) { ctx.fillStyle = H.rgba(H.mix(col, SHADE_DARK, 0.15)); ctx.beginPath(); ctx.arc(sp[i][0], sp[i][1], wpx * 0.62, 0, 7); ctx.fill(); }
        };
        pipe([[8.4, 1.4, 1.6], [6.6, 1.4, 1.6], [6.6, 1.4, 1.6], [hall.x + hall.w, 1.4, 1.6]], H.hex('#c8d2f0'), 9);
        pipe([[9.9, 3.4, 1.0], [7.2, 3.4, 1.0], [7.2, 3.4, 1.0], [hall.x + hall.w, 3.4, 1.0]], H.hex('#ffd2c4'), 7);
        // pipe supports
        for (const xx of [6.9, 7.8]) box(ctx, P, xx, 1.25, 0, 0.18, 0.3, 1.45, shade('#d8d4ea'), false);
      }, 1.45, P(7.5, 2.4, 1.3));

      // server racks (two rows, open-air cutaway)
      const racks = [];
      const rowY = [5.4, 8.1];
      for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
        const accent = r === 0 && i === 2;
        racks.push({ x: 3.4 + i * 1.3, y: rowY[r], w: 1.05, d: 0.95, h: accent ? 2.5 : 2.15, accent, id: r * 4 + i });
      }
      for (const rk of racks) {
        shadowBoxes.push([rk.x, rk.y, rk.w, rk.d, rk.h, 1.15 + rk.id * 0.08]);
        add(rk.x + rk.w / 2 + rk.y + rk.d / 2, () => {
          const base = rk.accent ? '#ff8a7a' : '#aab6e8';
          const c = shade(base);
          box(ctx, P, rk.x, rk.y, 0, rk.w, rk.d, rk.h, c);
          // front panel inset on left face (facing viewer)
          const y = rk.y + rk.d;
          const fx0 = rk.x + 0.1, fx1 = rk.x + rk.w - 0.1;
          poly(ctx, [P(fx0, y, 0.12), P(fx1, y, 0.12), P(fx1, y, rk.h - 0.12), P(fx0, y, rk.h - 0.12)], rk.accent ? '#7a3a52' : '#4a5488');
          const units = rk.accent ? 7 : 6;
          const uh = (rk.h - 0.3) / units;
          const lr = H.rng(100 + rk.id);
          for (let u = 0; u < units; u++) {
            const z0 = 0.17 + u * uh;
            poly(ctx, [P(fx0 + 0.05, y, z0), P(fx1 - 0.05, y, z0), P(fx1 - 0.05, y, z0 + uh * 0.72), P(fx0 + 0.05, y, z0 + uh * 0.72)], rk.accent ? '#93465f' : '#5d68a0');
            // slats
            ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.8; ctx.beginPath();
            for (let k = 0; k < 4; k++) { const a = P(fx0 + 0.33 + k * 0.1, y, z0 + 0.06), b = P(fx0 + 0.33 + k * 0.1, y, z0 + uh * 0.66); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
            ctx.stroke();
            // LEDs
            for (let k = 0; k < 2; k++) {
              const ph = lr() * 10, rate = lr.range(2, 6);
              const on = Math.sin(t * rate + ph) > -0.2;
              const lp = P(fx0 + 0.13 + k * 0.1, y, z0 + uh * 0.36);
              const col = rk.accent ? '#ffe28a' : (lr() < 0.2 ? '#ffb38a' : '#8ff0c8');
              if (on) {
                ctx.fillStyle = H.rgba(col, 0.35); ctx.beginPath(); ctx.arc(lp[0], lp[1], 3.6, 0, 7); ctx.fill();
                ctx.fillStyle = col;
              } else ctx.fillStyle = 'rgba(30,30,60,0.6)';
              ctx.beginPath(); ctx.arc(lp[0], lp[1], 1.5, 0, 7); ctx.fill();
            }
          }
          // top label strip on the right face
          poly(ctx, [P(rk.x + rk.w, rk.y + 0.15, rk.h - 0.35), P(rk.x + rk.w, rk.y + rk.d - 0.15, rk.h - 0.35), P(rk.x + rk.w, rk.y + rk.d - 0.15, rk.h - 0.2), P(rk.x + rk.w, rk.y + 0.15, rk.h - 0.2)], 'rgba(255,255,255,0.35)');
          if (rk.accent) {
            // glow halo on top
            const tp = P(rk.x + rk.w / 2, rk.y + rk.d / 2, rk.h);
            const g = ctx.createRadialGradient(tp[0], tp[1], 2, tp[0], tp[1], 60);
            g.addColorStop(0, 'rgba(255,120,100,0.35)'); g.addColorStop(1, 'rgba(255,120,100,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(tp[0], tp[1], 60, 0, 7); ctx.fill();
          }
        }, 1.15 + rk.id * 0.08, P(rk.x + rk.w / 2, rk.y + rk.d / 2, 0));
      }
      // overhead cable tray along each row (drawn right after the row, before the next row)
      for (let r = 0; r < 2; r++) {
        const ry = rowY[r] + 0.3, z = 2.62, x0 = 3.25, x1 = 8.6;
        const lastKey = racks[r * 4 + 3].x + 0.53 + rowY[r] + 0.48;
        add(lastKey + 0.01, () => {
          box(ctx, P, x0, ry, z, x1 - x0, 0.35, 0.1, shade('#d9d6ee'));
          // cables lying in the tray
          const cols = ['#4a5488', '#ff6b5b', '#7fc8a8'];
          cols.forEach((c, k) => {
            const a = P(x0 + 0.05, ry + 0.09 + k * 0.09, z + 0.12), b = P(x1 - 0.05, ry + 0.09 + k * 0.09, z + 0.12);
            ctx.strokeStyle = c; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          });
          // drops into racks
          for (let i = 0; i < 4; i++) {
            const rk = racks[r * 4 + i];
            const a = P(rk.x + 0.5, ry + 0.2, z), b = P(rk.x + 0.5, ry + 0.2, rk.h);
            ctx.strokeStyle = i === 2 && r === 0 ? '#ff6b5b' : '#4a5488'; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.bezierCurveTo(a[0] + 3, a[1] + 4, b[0] - 3, b[1] - 4, b[0], b[1]); ctx.stroke();
          }
        }, 1.95 + r * 0.12, P(5.9, ry, 2.62));
      }
      // ground cable run from rack row to hall (a channel on the floor)
      add(4.0, () => {
        ctx.strokeStyle = '#6b74ad'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        for (let k = 0; k < 3; k++) {
          const pts = [P(3.0 + k * 0.15, 5.9, 0.02), P(3.0 + k * 0.15, 4.3 + 0.0, 0.02)];
          ctx.strokeStyle = k === 1 ? '#ff6b5b' : '#6b74ad';
          ctx.beginPath(); ctx.moveTo(...pts[0]); ctx.lineTo(...pts[1]); ctx.stroke();
        }
      }, 1.9, P(3.1, 5.1, 0));

      // trees
      const trees = [[1.0, 8.2, 1.0], [1.9, 9.6, 1.25], [0.9, 10.9, 0.85], [10.0, 10.4, 1.05], [11.1, 11.0, 0.8], [7.4, 0.9, 0.0]];
      for (const [tx, ty, sc] of trees) {
        if (!sc) continue;
        shadowBoxes.push([tx - 0.3 * sc, ty - 0.3 * sc, 0.6 * sc, 0.6 * sc, 2.0 * sc, 0.95 + (tx + ty) * 0.035]);
        add(tx + ty, () => {
          const b = P(tx, ty, 0), top = P(tx, ty, 1.5 * sc);
          ctx.strokeStyle = '#b79a8a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(top[0], top[1] + 4); ctx.stroke();
          const sway = Math.sin(t * 1.5 + tx) * 1.2;
          const rr = 0.62 * sc * s;
          const cxp = top[0] + sway, cyp = top[1] - rr * 0.3;
          ctx.fillStyle = '#7fc8a8'; ctx.beginPath(); ctx.arc(cxp, cyp, rr, 0, 7); ctx.fill();
          ctx.fillStyle = '#a3dcc0'; ctx.beginPath(); ctx.arc(cxp - rr * 0.22, cyp - rr * 0.2, rr * 0.72, 0, 7); ctx.fill();
          ctx.fillStyle = '#c4ecd6'; ctx.beginPath(); ctx.arc(cxp - rr * 0.4, cyp - rr * 0.42, rr * 0.25, 0, 7); ctx.fill();
          // shading crescent
          ctx.save(); ctx.beginPath(); ctx.arc(cxp, cyp, rr, 0, 7); ctx.clip();
          ctx.fillStyle = 'rgba(80,120,140,0.18)'; ctx.beginPath(); ctx.arc(cxp - rr * 0.6, cyp - rr * 0.6, rr * 1.35, 0, 7); ctx.arc(cxp, cyp, rr * 2, 0, 7, true); ctx.fill('evenodd');
          ctx.restore();
        }, 0.95 + (tx + ty) * 0.035, P(tx, ty, 0));
      }
      // bench + lamp post
      add(2.6 + 7.9, () => { box(ctx, P, 2.3, 7.7, 0, 0.35, 1.0, 0.35, shade('#e7d6c9')); }, 1.5, P(2.5, 8.2, 0));

      // people
      const person = (x, y, shirt, face, carry) => {
        const p = P(x, y, 0);
        const hh = 0.95 * s;
        ctx.fillStyle = 'rgba(80,70,140,0.18)'; ctx.beginPath(); ctx.ellipse(p[0] + 4, p[1] + 1, 6, 2.5, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#4a4f78'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p[0] - 2, p[1]); ctx.lineTo(p[0] - 1.5, p[1] - hh * 0.42); ctx.moveTo(p[0] + 2, p[1] - 1); ctx.lineTo(p[0] + 1.5, p[1] - hh * 0.42); ctx.stroke();
        ctx.fillStyle = shirt;
        ctx.beginPath(); ctx.roundRect(p[0] - 4.5, p[1] - hh * 0.8, 9, hh * 0.42, 3.5); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(p[0] - 4.5, p[1] - hh * 0.78, 3, hh * 0.36);
        ctx.fillStyle = '#f1c6a8'; ctx.beginPath(); ctx.arc(p[0], p[1] - hh * 0.9, 3.8, 0, 7); ctx.fill();
        ctx.fillStyle = face; ctx.beginPath(); ctx.arc(p[0] + 0.6, p[1] - hh * 0.93, 3.9, Math.PI * 1.05, Math.PI * 2.05); ctx.fill();
        if (carry) { ctx.fillStyle = '#e9ecf8'; ctx.save(); ctx.translate(p[0] + 5, p[1] - hh * 0.6); ctx.transform(1, -0.5, 0, 1, 0, 0); ctx.fillRect(0, 0, 8, 5); ctx.fillStyle = '#ff6b5b'; ctx.fillRect(1, 1, 6, 3); ctx.restore(); }
      };
      const walk = H.clamp((t - 2.7) * 0.32);
      add(7.0 + 7.3, () => person(6.6, 7.2, '#ff6b5b', '#3d3550', true), 2.25, P(6.6, 7.2, 0));
      add(3.0 + 7.4, () => person(3.0, 7.6, '#7f8fd8', '#6b4a3a', false), 2.4, P(3.0, 7.6, 0));
      add(9.6 + 5.1, () => person(9.6, 5.1, '#9fd8c2', '#2f2a40', false), 2.55, P(9.6, 5.1, 0));
      add(4.2 + 10.9 + walk * 3, () => person(4.2 + walk * 3, 10.9, '#f5b78f', '#3d3550', false), 2.7, P(4.2 + walk * 3, 10.9, 0));

      // rising data cubes from the GPU rack
      const acc = racks[2];
      add(99, () => {
        for (let i = 0; i < 6; i++) {
          const ph = (Math.max(0, t - 2.4) * 0.45 + i / 6) % 1;
          if (t < 2.4 + i * 0.37) continue;
          const z = acc.h + 0.3 + ph * 3.2;
          const ox = acc.x + acc.w / 2 - 0.15 + Math.sin(i * 2.1) * 0.35, oy = acc.y + acc.d / 2 - 0.15 + Math.cos(i * 1.7) * 0.35;
          const a = Math.sin(ph * Math.PI);
          ctx.globalAlpha = a;
          const sz = 0.26 * (1 - ph * 0.4);
          box(ctx, P, ox, oy, z, sz, sz, sz, shade(i % 2 ? '#ff8a7a' : '#ffc2b4'), false);
          ctx.globalAlpha = 1;
        }
      });

      // ---------- shadows on floor (single layer, no doubled overlaps) ----------
      {
        const L = H.layer(W, H_), lc = L.getContext('2d');
        const sv = [1.15, 0.12];
        lc.fillStyle = '#000';
        for (const [x, y, w, d, h0, at] of shadowBoxes) {
          const kk = H.ease.out(ph(at, at + 0.5)); if (kk <= 0) continue;
          const h = h0 * kk;
          const base = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
          const pts = base.concat(base.map(p => [p[0] + sv[0] * h, p[1] + sv[1] * h]));
          const hl = hull(pts).map(p => P(p[0], p[1], 0));
          poly(lc, hl, '#000');
        }
        lc.globalCompositeOperation = 'destination-in';
        poly(lc, [P(0, 0, 0), P(TILE, 0, 0), P(TILE, TILE, 0), P(0, TILE, 0)], '#000');
        lc.globalCompositeOperation = 'source-in';
        lc.fillStyle = 'rgb(110,96,170)'; lc.fillRect(0, 0, W, H_);
        ctx.globalAlpha = 0.17; ctx.drawImage(L, 0, 0); ctx.globalAlpha = 1;
      }

      // ---------- painter's sort + draw ----------
      objs.sort((a, b) => a.key - b.key);
      for (const o of objs) {
        const k = o.at == null ? 1 : H.ease.back(ph(o.at, o.at + 0.5));
        if (k <= 0.001) continue;
        ctx.save();
        if (k !== 1 && o.base) { ctx.translate(o.base[0], o.base[1]); ctx.scale(k, k); ctx.translate(-o.base[0], -o.base[1]); }
        o.fn(); ctx.restore();
      }

      // small floating debris cubes under the island
      for (const [x, y, z, sz] of [[6.5, 13.4, -2.9, 0.45], [12.6, 12.0, -3.2, 0.35], [13.2, 6.5, -2.4, 0.42]]) {
        box(ctx, P, x, y, z + Math.sin(t + x) * 0.15 - (1 - rise) * 2, sz, sz, sz, shade('#cfc6ea'), false);
      }

      // ---------- satellite mini-tile (lower left) with data link ----------
      {
        const b2 = Math.sin(t * 1.2 + 1.3) * 5;
        const mt = H.ease.back(ph(1.3, 1.95));
        const Q = makeIso(250, 452 + b2 + (1 - mt) * 140, 35);
        ctx.save(); ctx.globalAlpha = ph(1.3, 1.6);
        // its soft shadow
        const L = H.layer(W, H_), lc = L.getContext('2d');
        const G = makeIso(250 + 30, 452 + 70, 35);
        lc.filter = 'blur(12px)';
        poly(lc, [G(0, 0, 0), G(3, 0, 0), G(4, 3, 0), G(1, 3, 0)], 'rgb(90,80,150)');
        ctx.globalAlpha = 0.14 * ph(1.3, 1.9); ctx.drawImage(L, 0, 0); ctx.globalAlpha = ph(1.3, 1.6);
        box(ctx, Q, 0.15, 0.15, -1.2, 2.7, 2.7, 0.5, shade('#b9addf'), false);
        box(ctx, Q, 0, 0, -0.7, 3, 3, 0.7, shade('#cfc6ea'), false);
        poly(ctx, [Q(0, 0, 0), Q(3, 0, 0), Q(3, 3, 0), Q(0, 3, 0)], '#fbf8f3');
        ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); { const a = Q(0, 3, 0), b = Q(3, 3, 0), c = Q(3, 0, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); } ctx.stroke();
        // shadow of dish base
        poly(ctx, [Q(1.0, 1.0, 0), Q(2.6, 1.1, 0), Q(2.6, 2.0, 0), Q(1.0, 2.0, 0)], 'rgba(110,96,170,0.16)');
        box(ctx, Q, 1.0, 1.0, 0, 1.0, 1.0, 0.55, shade('#dbe3f6'));
        { const tb = Q(2.4, 0.55, 0), tt = Q(2.4, 0.55, 0.9); const rr = 11;
          poly(ctx, [Q(2.25, 0.4, 0), Q(2.95, 0.45, 0), Q(2.95, 0.75, 0), Q(2.25, 0.7, 0)], 'rgba(110,96,170,0.14)');
          ctx.strokeStyle = '#b79a8a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(tb[0], tb[1]); ctx.lineTo(tt[0], tt[1]); ctx.stroke();
          ctx.fillStyle = '#7fc8a8'; ctx.beginPath(); ctx.arc(tt[0], tt[1] - 4, rr, 0, 7); ctx.fill();
          ctx.fillStyle = '#a3dcc0'; ctx.beginPath(); ctx.arc(tt[0] - 2.5, tt[1] - 6.5, rr * 0.72, 0, 7); ctx.fill(); }
        const pole = Q(1.5, 1.5, 0.55), poleTop = Q(1.5, 1.5, 1.4);
        ctx.strokeStyle = '#8e9bd0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(pole[0], pole[1]); ctx.lineTo(poleTop[0], poleTop[1]); ctx.stroke();
        // dish (tilted toward the main island)
        ctx.save(); ctx.translate(poleTop[0] + 4, poleTop[1] - 8); ctx.rotate(0.6);
        const dg = ctx.createLinearGradient(-30, -30, 30, 30);
        dg.addColorStop(0, '#ffffff'); dg.addColorStop(1, '#c9cfee');
        ctx.fillStyle = '#a9b3e0'; ctx.beginPath(); ctx.ellipse(2, 3, 34, 15, 0, 0, 7); ctx.fill();
        ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(0, 0, 34, 15, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(140,150,200,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, 20, 8.5, 0, 0, 7); ctx.stroke();
        ctx.strokeStyle = '#8e9bd0'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-20, 4); ctx.lineTo(0, -26); ctx.lineTo(20, 4); ctx.stroke();
        ctx.fillStyle = '#ff6b5b'; ctx.beginPath(); ctx.arc(0, -27, 3.5, 0, 7); ctx.fill();
        ctx.restore();
        // dashed data arc to the hall roof
        const from = [poleTop[0] + 4 + Math.sin(0.6) * 27, poleTop[1] - 8 - Math.cos(0.6) * 27];
        const to = P(3.3, 5.75, 2.75);
        const cx = (from[0] + to[0]) / 2 - 50, cy = (from[1] + to[1]) / 2 - 110;
        ctx.restore();
        const arcP = H.ease.inOut(ph(2.1, 2.9));
        const qb = (u) => [(1 - u) * (1 - u) * from[0] + 2 * u * (1 - u) * cx + u * u * to[0], (1 - u) * (1 - u) * from[1] + 2 * u * (1 - u) * cy + u * u * to[1]];
        ctx.strokeStyle = 'rgba(255,107,91,0.7)'; ctx.lineWidth = 1.6; ctx.setLineDash([4, 6]); ctx.lineDashOffset = -t * 30;
        ctx.beginPath(); ctx.moveTo(from[0], from[1]); for (let k = 1; k <= 40; k++) { const q = qb(arcP * k / 40); ctx.lineTo(q[0], q[1]); } if (arcP > 0) ctx.stroke(); ctx.setLineDash([]);
        for (let i = 0; i < 3; i++) {
          if (t < 2.9 + i * 0.5) continue;
          const u = ((t - 2.9 - i * 0.5) * 0.3 + i / 3) % 1;
          const x = (1 - u) * (1 - u) * from[0] + 2 * u * (1 - u) * cx + u * u * to[0];
          const y = (1 - u) * (1 - u) * from[1] + 2 * u * (1 - u) * cy + u * u * to[1];
          ctx.fillStyle = 'rgba(255,107,91,0.25)'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill();
          ctx.fillStyle = '#ff6b5b'; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
        }
      }

      // ---------- label tag ----------
      {
        const anchor = P(acc.x + acc.w / 2, acc.y + acc.d / 2, acc.h + 0.1);
        const tx = anchor[0] + 120, ty = anchor[1] - 150;
        const lp = H.ease.out(ph(2.75, 3.15)), tp = H.ease.back(ph(3.05, 3.45));
        ctx.save(); if (lp <= 0) ctx.globalAlpha = 0;
        ctx.strokeStyle = '#4a4f78'; ctx.lineWidth = 1.3;
        const l1 = anchor[1] - (ty + 30), l2 = tx - 4 - anchor[0], dl = (l1 + l2) * lp;
        ctx.beginPath(); ctx.moveTo(anchor[0], anchor[1]); ctx.lineTo(anchor[0], anchor[1] - Math.min(dl, l1)); if (dl > l1) ctx.lineTo(anchor[0] + (dl - l1), ty + 30); ctx.stroke();
        ctx.fillStyle = '#4a4f78'; ctx.beginPath(); ctx.arc(anchor[0], anchor[1], 3.5, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(anchor[0], anchor[1], 1.5, 0, 7); ctx.fill();
        ctx.font = '600 13px "Inter"';
        const label = 'GPU CLUSTER', sub = '1.2 PFLOPS · 74°F';
        const wbox = Math.max(ctx.measureText(label).width, 0) + 54;
        ctx.globalAlpha = tp > 0 ? Math.min(1, ph(3.05, 3.25)) : 0;
        ctx.translate(tx, ty + 31); ctx.scale(Math.max(0.001, tp), Math.max(0.001, tp)); ctx.translate(-tx, -(ty + 31));
        ctx.save(); ctx.shadowColor = 'rgba(80,70,140,0.18)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(tx, ty + 6, wbox + 40, 50, 12); ctx.fill(); ctx.restore();
        ctx.fillStyle = '#ff6b5b'; ctx.beginPath(); ctx.roundRect(tx + 12, ty + 18, 26, 26, 7); ctx.fill();
        // tiny chip glyph
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.strokeRect(tx + 19, ty + 25, 12, 12);
        ctx.beginPath(); for (let k = 0; k < 3; k++) { ctx.moveTo(tx + 22 + k * 3, ty + 22); ctx.lineTo(tx + 22 + k * 3, ty + 25); ctx.moveTo(tx + 22 + k * 3, ty + 37); ctx.lineTo(tx + 22 + k * 3, ty + 40); } ctx.stroke();
        ctx.fillStyle = '#2d3058'; ctx.fillText(label, tx + 48, ty + 29);
        ctx.font = '400 12px "Inter"'; ctx.fillStyle = '#8a88ad'; ctx.fillText(sub, tx + 48, ty + 46);
        ctx.restore();
      }
      ctx.restore(); // end camera push

      // ---------- title ----------
      const bw = 34 * H.ease.out(ph(0.25, 0.7));
      if (bw > 0.5) { ctx.fillStyle = '#ff6b5b'; ctx.beginPath(); ctx.roundRect(72, 92, bw, 6, 3); ctx.fill(); }
      const t1 = H.ease.out(ph(0.4, 0.95)), t2 = H.ease.out(ph(0.65, 1.2));
      ctx.save(); ctx.globalAlpha = t1; ctx.font = '800 46px "Inter"'; ctx.fillStyle = '#2d3058';
      ctx.fillText('Where AI lives', 70, 152 + (1 - t1) * 18); ctx.restore();
      ctx.save(); ctx.globalAlpha = t2; ctx.font = '400 18px "Inter"'; ctx.fillStyle = '#7b7aa3';
      ctx.fillText('Inside a modern data center', 72, 186 + (1 - t2) * 12); ctx.restore();
    },
  });
}
```
