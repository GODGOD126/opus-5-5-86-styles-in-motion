I want an animated explainer made in the "Cathedral Glass" visual style (Painterly). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Cormorant Garamond, UnifrakturMaguntia
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=UnifrakturMaguntia&display=block">
- Expose `window.seek = (t) => { /* draw frame at time t */ }`, `window.DURATION` and `window.scoreSound`, so the animation can be rendered frame by frame to video later.

HOW TO STAY IN THE STYLE
- Reuse the reference's rendering techniques, palette, textures, lettering, line quality, arrows, labels, number treatment, transitions and timing feel. Change the story, the text and the things being drawn; do not change the medium.
- Draw every subject accurately for my topic. Don't carry over the reference's props and drawing recipes (its characters, robots, cats and dogs, rings, icons) unless they genuinely fit, and double-check that the science and facts shown in the visuals are right.
- The surface texture and finishing passes are what make the style read as the real medium (paper grain, ink pooling, misregistration, grain, glow, scanlines and so on). Copy those functions from the reference and run them on every frame at the same strength. Don't simplify or skip them to save effort.
- Every frame is a pure function of t: create all randomness from H.rng(seed) / H.makeNoise(seed) inside the draw (never Math.random), so the same t always gives the same frame. Caching static textures across frames is fine.
- It is video, often watched on a phone: at 1280x720 keep headlines >= 44px, every label or caption the story depends on >= 28px (including small annotations and the corner header), key numbers >= 64px, and frame each beat so it fills most of the screen. Keep frames fast (well under 100 ms each if you can).
- In the reference, `explainer()` is the explainer (it explains "How does AI learn?"), `draw()` is the single hero frame of the style, and `explainerSound(k)` is its sound design. Study them, but do not reuse that topic unless my content asks for it.

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
Name: Cathedral Glass
Family: Painterly
Look: A leaded Gothic window: hand-cut pieces of streaky, seedy antique glass held in thick dark came, painted grisaille details, and light blazing through into a dim stone interior with dusty rays.
Motion: Daylight sweeps slowly across the window so pieces brighten in turn, the rays drift with floating dust, and the chip in the saint's hands pulses.
How it explains: Told as a cycle of three leaded windows along a nave, the camera walking from window to window; arrows are strips of glass in lead came with glass arrowheads, labels and the counters are grisaille painted on pale banner glass, and emphasis is ruby glass rings and light flaring through the pieces.

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

REFERENCE STYLE SOURCE (styles/stained-glass.js; W/H_ are always 1280x720)
```js
{
  // ---------------------------------------------------------------
  // Stained glass — hand-cut pieces in lead came, light pouring through
  // ---------------------------------------------------------------
  // region id -> [base colour, subdivision: 0 = whole region, 1 = coarse cut, 2 = fine cut, palette for per-piece picks]
  const REG = {
    1: { c: [28, 52, 150], sub: 1, alt: [[34, 70, 168], [22, 40, 120], [40, 60, 160]] },            // field: cobalt
    2: { c: [168, 26, 40], sub: 2, alt: [[168, 26, 40], [214, 160, 40], [168, 26, 40], [30, 110, 90]] }, // border
    4: { c: [232, 176, 52], sub: 1, alt: [[236, 184, 60], [224, 150, 40], [244, 204, 90]] },         // halo gold
    5: { c: [178, 30, 46], sub: 0, alt: [[178, 30, 46], [150, 20, 50], [196, 52, 50]] },             // halo petals ruby
    6: { c: [196, 210, 222], sub: 0 },                                                              // head: pale white glass
    7: { c: [70, 226, 236], sub: 0 },                                                               // eyes
    8: { c: [104, 44, 138], sub: 1, alt: [[104, 44, 138], [124, 56, 150], [86, 36, 120]] },          // robe: purple
    9: { c: [30, 128, 88], sub: 1, alt: [[30, 128, 88], [40, 146, 96], [24, 104, 80]] },            // inner robe: green
    10: { c: [176, 188, 204], sub: 0 },                                                             // hands
    11: { c: [255, 214, 96], sub: 0 },                                                              // the chip
    12: { c: [236, 214, 150], sub: 0 },                                                             // banner
    13: { c: [190, 206, 150], sub: 1, alt: [[196, 214, 150], [222, 204, 140], [170, 200, 170], [214, 190, 120]] }, // lancet quarries
    14: { c: [186, 34, 40], sub: 0 },                                                               // rondels
    15: { c: [240, 196, 70], sub: 0 },                                                              // stars in the field
    16: { c: [44, 70, 104], sub: 0 },                                                               // face plate
    17: { c: [60, 170, 200], sub: 2, alt: [[60, 170, 200], [40, 140, 190], [90, 190, 210]] },       // chip pins / circuit ring
  };


  // =================================================================
  // EXPLAINER — "How does AI learn?" told as a cycle of three windows along a nave, the way glaziers told
  // stories: the camera walks from window to window. Arrows are strips of glass in lead came, labels are
  // grisaille painted on pale banner glass, numbers are repainted on their banner, emphasis is light flaring.
  // =================================================================
  const SGW = 1120, SGH = 660, SGTOP = 30, SGX = [80, 1480, 2880], SG_WORLD = 4200;
  let SGC = null;
  const clS = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ezS = (u) => H.ease.inOut(clS(u));
  const wS = (t, a, b) => clS((t - a) / (b - a));
  const lerpS = (a, b, u) => a + (b - a) * u;
  const cssS = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const LEAD = 'rgb(20,16,14)';
  const GOLD = [240, 190, 64], RUBY = [176, 28, 44], CREAMG = [238, 220, 166], WHITEG = [214, 226, 236], GREENG = [40, 150, 96], AMBER = [236, 140, 50], BROWNG = [150, 92, 50];
  const archP = (c, x0, y0, w, h, inset = 0) => {
    const a = x0 + inset, b = x0 + w - inset, top = y0 + inset, bot = y0 + h - inset * 0.4, spring = y0 + 150, cx = x0 + w / 2;
    c.beginPath(); c.moveTo(a, bot); c.lineTo(a, spring); c.quadraticCurveTo(a, top + 12, cx, top); c.quadraticCurveTo(b, top + 12, b, spring); c.lineTo(b, bot); c.closePath();
  };

  // one window's background glass: Voronoi-cut field + finer border, lead where pieces meet, streaky seedy glass
  function makeWindow(field, seed) {
    const w = SGW, h = SGH, M = H.layer(w, h), m = M.getContext('2d');
    m.fillStyle = 'rgb(2,0,0)'; archP(m, 0, 0, w, h, 0); m.fill();
    m.fillStyle = 'rgb(1,0,0)'; archP(m, 0, 0, w, h, 26); m.fill();
    const reg = m.getImageData(0, 0, w, h).data;
    const nz = H.makeNoise(seed), r = H.rng(seed);
    const cells = (cs, rs) => { const gw = Math.ceil(w / cs) + 1, gh = Math.ceil(h / cs) + 1, p = new Float32Array(gw * gh * 2); for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { p[(j * gw + i) * 2] = (i + 0.15 + rs() * 0.7) * cs; p[(j * gw + i) * 2 + 1] = (j + 0.15 + rs() * 0.7) * cs; } return { cs, gw, gh, p }; };
    const F = cells(58, H.rng(seed + 1)), B = cells(22, H.rng(seed + 2));
    const piece = new Int32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, rg = reg[i * 4]; if (!rg) continue;
      const S = rg === 1 ? F : B, gx = (x / S.cs) | 0, gy = (y / S.cs) | 0; let best = 1e9, bi = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const ix = gx + dx, iy = gy + dy; if (ix < 0 || iy < 0 || ix >= S.gw || iy >= S.gh) continue; const k = iy * S.gw + ix, px = S.p[k * 2] - x, py = S.p[k * 2 + 1] - y, d = px * px + py * py; if (d < best) { best = d; bi = k; } }
      piece[i] = rg * 100000 + bi + 1;
    }
    const LD = H.layer(w, h), ld = LD.getContext('2d'), li = ld.createImageData(w, h);
    for (let y = 0; y < h - 1; y++) for (let x = 0; x < w - 1; x++) { const i = y * w + x; if (piece[i] !== piece[i + 1] || piece[i] !== piece[i + w]) li.data[i * 4 + 3] = 255; }
    ld.putImageData(li, 0, 0);
    const blurOf = (px) => { const c = H.layer(w, h), x = c.getContext('2d'); x.filter = `blur(${px}px)`; x.drawImage(LD, 0, 0); return x.getImageData(0, 0, w, h).data; };
    const lead = blurOf(2.4), prox = blurOf(8);
    const out = H.layer(w, h), oc = out.getContext('2d'), img = oc.createImageData(w, h), d = img.data, cache = new Map();
    const border = [[168, 26, 40], [214, 160, 40], [168, 26, 40], [30, 110, 90]];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, o = i * 4, p = piece[i]; if (!p) continue;
      let pc = cache.get(p);
      if (!pc) { const q = H.rng(p * 7 + seed), base = p >= 200000 ? q.pick(border) : q.pick(field), v = 0.84 + q() * 0.28; pc = [base[0] * v, base[1] * v, base[2] * v, q() * 6.28]; cache.set(p, pc); }
      const sa = pc[3], u = x * Math.cos(sa) + y * Math.sin(sa), vv = -x * Math.sin(sa) + y * Math.cos(sa);
      const lum = (0.9 + nz.n2(u * 0.012, vv * 0.09 + (p % 997)) * 0.3) * (1 - prox[o + 3] / 255 * 0.4) * (0.95 + 0.15 * (1 - y / h));
      let R = pc[0] * lum, G = pc[1] * lum, Bc = pc[2] * lum;
      const lv = clS((lead[o + 3] / 255 - 0.07) / 0.14);
      if (lv > 0) {
        // rounded came: its upper-left shoulder catches the light from the room
        const gl = (lead[o + 3 + 4] || 0) - (lead[o + 3 - 4] || 0) + (lead[o + 3 + w * 4] || 0) - (lead[o + 3 - w * 4] || 0);
        const sh = 16 + lead[o + 3] / 255 * 12 + Math.max(0, -gl) * 0.22;
        R = R * (1 - lv) + (sh + 4) * lv; G = G * (1 - lv) + (sh + 1) * lv; Bc = Bc * (1 - lv) + (sh - 3) * lv;
      }
      d[o] = R; d[o + 1] = G; d[o + 2] = Bc; d[o + 3] = 255;
    }
    oc.putImageData(img, 0, 0);
    // seeds (bubbles)
    for (let k = 0; k < 500; k++) { const x = r() * w, y = r() * h; if (!piece[(y | 0) * w + (x | 0)]) continue; oc.fillStyle = 'rgba(255,255,240,0.3)'; oc.beginPath(); oc.ellipse(x, y, r.range(0.8, 2.4), r.range(0.6, 1.6), 0.3, 0, 7); oc.fill(); }
    // the window's stone reveal
    oc.lineJoin = 'round'; oc.strokeStyle = 'rgb(20,16,14)'; oc.lineWidth = 8; archP(oc, 0, 0, w, h, 2); oc.stroke();
    return out;
  }
  function sgCache() {
    if (SGC) return SGC;
    const C = {};
    // nave wall: ashlar courses, dim, warm
    const wall = H.layer(SG_WORLD, 720), wc = wall.getContext('2d'), r = H.rng(5);
    wc.fillStyle = 'rgb(46,38,32)'; wc.fillRect(0, 0, SG_WORLD, 720);
    for (let row = 0; row * 64 < 720; row++) for (let x = -((row & 1) * 90); x < SG_WORLD; x += 180) { const v = 0.8 + r() * 0.4; wc.fillStyle = `rgb(${62 * v | 0},${52 * v | 0},${44 * v | 0})`; wc.fillRect(x + 3, row * 64 + 3, 174, 58); }
    const sp = H.layer(Math.ceil(SG_WORLD / 6), 120), sx = sp.getContext('2d');
    for (let y = 0; y < 120; y++) for (let x = 0; x < sp.width; x++) { sx.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,240,220'},${r() * 0.12})`; sx.fillRect(x, y, 1, 1); }
    wc.drawImage(sp, 0, 0, SG_WORLD, 720);
    // stone reveals + warm spill of light around each window
    SGX.forEach((x0) => {
      const g = wc.createRadialGradient(x0 + SGW / 2, 360, 200, x0 + SGW / 2, 360, 900); g.addColorStop(0, 'rgba(255,200,140,0.22)'); g.addColorStop(1, 'rgba(255,200,140,0)'); wc.fillStyle = g; wc.fillRect(x0 - 400, 0, SGW + 800, 720);
      wc.lineJoin = 'round'; wc.strokeStyle = 'rgb(118,102,86)'; wc.lineWidth = 30; archP(wc, x0, SGTOP, SGW, SGH, -12); wc.stroke();
      wc.strokeStyle = 'rgba(220,190,150,0.25)'; wc.lineWidth = 8; archP(wc, x0 - 6, SGTOP - 6, SGW, SGH, -16); wc.stroke();
    });
    C.wall = wall;
    C.win = [makeWindow([[34, 70, 168], [22, 40, 120], [40, 60, 160], [30, 54, 140]], 11), makeWindow([[60, 40, 140], [44, 34, 120], [76, 50, 156], [36, 52, 140]], 12), makeWindow([[20, 90, 120], [24, 70, 130], [30, 100, 110], [26, 60, 120]], 13)];
    // antique glass texture for dynamically placed glass, in world space so it travels with the pieces:
    // per-pixel sheet-thickness variation (long, nearly horizontal low-frequency streaks, +/-12%) plus seed bubbles
    {
      const hw = SG_WORLD >> 1, hh = 360, half = H.layer(hw, hh), hc = half.getContext('2d'), im = hc.createImageData(hw, hh), q = im.data, tn = H.makeNoise(17);
      for (let y = 0; y < hh; y++) for (let x = 0; x < hw; x++) {
        const o = (y * hw + x) * 4, X = x * 2, Y = y * 2;
        const v = tn.n2(X * 0.012 + Y * 0.0015, Y * 0.09) * 0.7 + tn.n2(X * 0.0035 + 40, Y * 0.022 + 9) * 0.45;
        const dv = Math.max(-0.2, Math.min(0.2, v * 0.17));
        if (dv > 0) { q[o] = 255; q[o + 1] = 248; q[o + 2] = 228; q[o + 3] = dv * 255; } else { q[o] = 8; q[o + 1] = 6; q[o + 2] = 22; q[o + 3] = -dv * 255; }
      }
      hc.putImageData(im, 0, 0);
      const st = H.layer(SG_WORLD, 720), s2 = st.getContext('2d'), nr = H.rng(17);
      s2.imageSmoothingEnabled = true; s2.drawImage(half, 0, 0, SG_WORLD, 720);
      for (let k = 0; k < 2000; k++) {
        const x = nr() * SG_WORLD, y = nr() * 720, rr = nr() < 0.88 ? nr.range(0.6, 1.6) : nr.range(1.8, 2.6);
        s2.strokeStyle = 'rgba(10,6,20,0.38)'; s2.lineWidth = 0.8; s2.beginPath(); s2.ellipse(x, y, rr * 1.35, rr, 0.08, 0, 7); s2.stroke();
        s2.fillStyle = 'rgba(255,252,236,0.55)'; s2.beginPath(); s2.arc(x - rr * 0.25, y - rr * 0.25, rr * 0.5, 0, 7); s2.fill();
      }
      C.streak = st;
    }
    C.dyn = H.layer(1280, 720); C.small = H.layer(160, 90);
    SGC = C;
    return C;
  }

  function explainStained(ctx, W, H_, t) {
    const C = sgCache();
    const cam = Math.round(1400 * ezS((t - 6.0) / 0.95) + 1400 * ezS((t - 10.4) / 0.95));
    ctx.drawImage(C.wall, cam, 0, W, H_, 0, 0, W, H_);
    SGX.forEach((x0, i) => { const sx = x0 - cam; if (sx > W || sx + SGW < 0) return; ctx.drawImage(C.win[i], sx, SGTOP); });
    // the first window is lit as the sun reaches it
    if (t < 1.4) { ctx.save(); ctx.fillStyle = `rgba(8,6,10,${0.85 * (1 - ezS((t - 0.1) / 1.2))})`; archP(ctx, SGX[0] - cam, SGTOP, SGW, SGH, 0); ctx.fill(); ctx.restore(); }

    // ---------- dynamic glass ----------
    const D = C.dyn, d = D.getContext('2d');
    d.setTransform(1, 0, 0, 1, 0, 0); d.clearRect(0, 0, W, H_); d.translate(-cam, 0);
    d.lineJoin = 'round'; d.lineCap = 'round';
    // grisaille: lettering painted straight onto the glass, so later pieces (a ruby cross) can sit over it
    const drawT = (q) => {
      if (q.reveal <= 0) return;
      d.save(); d.font = `${q.font} ${q.size}px "Cormorant Garamond"`; d.textAlign = 'left';
      const tw = d.measureText(q.str).width, x0 = q.align === 'center' ? q.x - tw / 2 : q.align === 'right' ? q.x - tw : q.x;
      if (q.reveal < 1) { d.beginPath(); d.rect(x0 - 6, q.y - q.size, (tw + 12) * q.reveal, q.size * 1.4); d.clip(); }
      // fired grisaille: a soft matt halo, then the trace line, then a crisp darker outline
      const ink = q.ink.map((v) => v * 0.62);
      d.fillStyle = cssS(ink, 0.22); d.fillText(q.str, x0 + 1.5, q.y + 1.8);
      d.fillStyle = cssS(ink, 1); d.fillText(q.str, x0, q.y);
      d.lineJoin = 'round'; d.lineWidth = Math.max(1, q.size * 0.028); d.strokeStyle = cssS(ink.map((v) => v * 0.6), 0.4); d.strokeText(q.str, x0, q.y); d.restore();
    };
    // a cut piece: glass fill, darkening towards the came like the background panes (light glows in its middle),
    // then the lead came with a soft highlight on its upper-left shoulder so it reads as rounded metal
    const pc = (fill, col, k = 1, leadW = 7) => {
      d.fillStyle = cssS(H.mix([10, 8, 14], col, k)); fill(); d.fill();
      d.save(); d.clip(); d.shadowColor = 'rgba(14,6,18,0.62)'; d.shadowBlur = 22; d.lineWidth = 6; d.strokeStyle = LEAD; d.stroke(); d.restore();
      d.lineWidth = leadW; d.strokeStyle = LEAD; d.stroke();
      d.save(); d.translate(-leadW * 0.16, -leadW * 0.16); d.lineWidth = 1.5; d.strokeStyle = 'rgba(255,240,220,0.1)'; d.stroke(); d.restore();
    };
    const rect = (x, y, w, h, col, k = 1, rad = 6) => pc(() => { d.beginPath(); d.roundRect(x, y, w, h, rad); }, col, k);
    const banner = (x, y, w, h, str, size, { k = 1, col = CREAMG, ink = [58, 34, 22], font = '600', reveal = 1, align = 'center' } = {}) => {
      if (k <= 0) return; rect(x, y, w, h, col, k, 8);
      if (str && reveal > 0) drawT({ str, x: align === 'center' ? x + w / 2 : x + 22, y: y + h / 2 + size * 0.34, size, ink, font, reveal, align });
    };
    // a strip of glass in came, cut into short pieces, drawn on along its path, with a glass arrowhead
    const strip = (pts, prog, w, col, head = true) => {
      if (prog <= 0) return;
      const n = Math.max(2, Math.ceil(pts.length * clS(prog)));
      const P = pts.slice(0, n);
      d.beginPath(); P.forEach(([x, y], i) => (i ? d.lineTo(x, y) : d.moveTo(x, y)));
      d.lineWidth = w + 9; d.strokeStyle = LEAD; d.stroke();
      d.save(); d.translate(-1.4, -1.4); d.lineWidth = w + 5; d.strokeStyle = 'rgba(255,240,220,0.13)'; d.stroke(); d.restore();
      d.lineWidth = w; d.strokeStyle = cssS(col.map((v) => v * 0.72)); d.stroke();
      d.lineWidth = w * 0.72; d.strokeStyle = cssS(col.map((v) => v * 0.88)); d.stroke(); d.lineWidth = w * 0.4; d.strokeStyle = cssS(col); d.stroke();
      d.lineWidth = 4; d.strokeStyle = LEAD;
      for (let i = 4; i < n - 1; i += 5) { const [ax, ay] = P[i - 1], [bx, by] = P[i + 1], a = Math.atan2(by - ay, bx - ax), [x, y] = P[i]; d.beginPath(); d.moveTo(x - Math.sin(a) * w * 0.6, y + Math.cos(a) * w * 0.6); d.lineTo(x + Math.sin(a) * w * 0.6, y - Math.cos(a) * w * 0.6); d.stroke(); }
      if (head && prog >= 1) { const [ax, ay] = pts[pts.length - 3], [bx, by] = pts[pts.length - 1], a = Math.atan2(by - ay, bx - ax); pc(() => { d.beginPath(); d.moveTo(bx + Math.cos(a) * w * 1.6, by + Math.sin(a) * w * 1.6); d.lineTo(bx + Math.cos(a + 2.3) * w * 1.9, by + Math.sin(a + 2.3) * w * 1.9); d.lineTo(bx + Math.cos(a - 2.3) * w * 1.9, by + Math.sin(a - 2.3) * w * 1.9); d.closePath(); }, col); }
    };
    const bez = (p0, p1, p2, p3, n = 30) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, a = 1 - u; o.push([a * a * a * p0[0] + 3 * a * a * u * p1[0] + 3 * a * u * u * p2[0] + u * u * u * p3[0], a * a * a * p0[1] + 3 * a * a * u * p1[1] + 3 * a * u * u * p2[1] + u * u * u * p3[1]]); } return o; };
    const ring = (cx, cy, rx, ry, n = 48) => { const o = []; for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + i / n * Math.PI * 2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
    // the model: a small rose window with a gold chip at its heart; three white spokes are its weights
    const rose = (cx, cy, R, k, spin, flare) => {
      if (k <= 0) return;
      for (let i = 0; i < 12; i++) { const a0 = i / 12 * Math.PI * 2, a1 = a0 + Math.PI / 6; pc(() => { d.beginPath(); d.arc(cx, cy, R, a0, a1); d.arc(cx, cy, R * 0.66, a1, a0, true); d.closePath(); }, H.mix(i % 2 ? RUBY : GOLD, [255, 250, 230], flare * 0.6), k); }
      pc(() => { d.beginPath(); d.arc(cx, cy, R * 0.66, 0, 7); }, H.mix([40, 120, 190], [220, 240, 255], flare * 0.5), k);
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * 2.094 + spin; pc(() => { d.beginPath(); d.moveTo(cx + Math.cos(a - 0.12) * R * 0.3, cy + Math.sin(a - 0.12) * R * 0.3); d.lineTo(cx + Math.cos(a) * R * 0.62, cy + Math.sin(a) * R * 0.62); d.lineTo(cx + Math.cos(a + 0.12) * R * 0.3, cy + Math.sin(a + 0.12) * R * 0.3); d.closePath(); }, WHITEG, k, 5); }
      rect(cx - R * 0.24, cy - R * 0.24, R * 0.48, R * 0.48, H.mix(GOLD, [255, 250, 220], flare), k, 4);
    };
    const animal = (x, y, s, dog, k = 1) => {
      rect(x - s / 2, y - s / 2, s, s, [200, 214, 222], k, 4);
      if (dog) { pc(() => { d.beginPath(); d.ellipse(x, y + s * 0.04, s * 0.28, s * 0.27, 0, 0, 7); }, BROWNG, k, 5); for (const q of [-1, 1]) pc(() => { d.beginPath(); d.ellipse(x + q * s * 0.3, y + s * 0.06, s * 0.09, s * 0.2, q * 0.3, 0, 7); }, [96, 58, 34], k, 5); }
      else pc(() => { d.beginPath(); [[-0.32, 0], [-0.3, -0.36], [-0.1, -0.2], [0.1, -0.2], [0.3, -0.36], [0.32, 0], [0.22, 0.24], [0, 0.32], [-0.22, 0.24]].forEach(([a, b], i) => (i ? d.lineTo(x + a * s, y + b * s) : d.moveTo(x + a * s, y + b * s))); d.closePath(); }, AMBER, k, 5);
      d.fillStyle = LEAD; d.beginPath(); d.arc(x - s * 0.1, y, s * 0.045, 0, 7); d.arc(x + s * 0.1, y, s * 0.045, 0, 7); d.fill();
    };
    const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const glows = [];

    // ===== window 1: the data =====
    {
      const X = SGX[0];
      rose(X + 880, 300, 150, ezS((t - 1.2) / 0.6), 0, 0);
      banner(X + 780, 470, 200, 56, 'the model', 34, { k: ezS((t - 2.3) / 0.3), reveal: wS(t, 2.4, 2.8) });
      // rail + flow arrow
      strip(bez([X + 60, 420], [X + 300, 470], [X + 500, 340], [X + 700, 320]), wS(t, 2.2, 2.8), 16, GOLD);
      banner(X + 130, 150, 380, 56, 'labelled examples', 32, { k: ezS((t - 2.6) / 0.3), reveal: wS(t, 2.7, 3.1) });
      for (let i = 0; i < 17; i++) {
        const s0 = 2.6 + i * 0.2, v = (t - s0) / 1.4; if (v <= 0 || v >= 1) continue;
        const a = 1 - v, x = a * a * a * 40 + 3 * a * a * v * 300 + 3 * a * v * v * 520 + v * v * v * 760, y = a * a * a * 330 + 3 * a * a * v * 370 + 3 * a * v * v * 250 + v * v * v * 270;
        const s = v > 0.8 ? 86 * (1 - (v - 0.8) / 0.2 * 0.9) : 86, dog = (i % 2 === 1) !== (i % 5 === 0);
        animal(X + x, y, s, dog);
        if (s > 64) banner(X + x - 40, y + s / 2 + 6, 80, 36, dog ? 'dog' : 'cat', 28, { col: dog ? [222, 196, 150] : [250, 214, 150] });
      }
      if (t > 2.9) {
        const n = t > 5.6 ? 1e6 : Math.round(1e6 * H.ease.in(wS(t, 3.0, 5.6)) / 1000) * 1000;
        banner(X + 60, 540, 640, 96, '', 0, { k: ezS((t - 2.9) / 0.3) });
        drawT({ str: fmt(n), x: X + 90, y: 612, size: 68, ink: [58, 34, 22], font: '700', reveal: wS(t, 3.0, 3.3), align: 'left' });
        drawT({ str: 'examples', x: X + 440, y: 606, size: 40, ink: [58, 34, 22], font: '600', reveal: wS(t, 3.1, 3.4), align: 'left' });
        if (t > 5.6) strip([[X + 90, 626], [X + 420, 626]].flatMap(([x, y], i, A) => i ? Array.from({ length: 12 }, (_, k) => [lerpS(A[0][0], x, (k + 1) / 12), y]) : [[x, y]]), wS(t, 5.6, 5.9), 8, RUBY, false);
      }
      if (t > 2.6 && t < 6.2) glows.push([X + 880, 300, 220, 0.25 + 0.1 * Math.sin(t * 4)]);
    }
    // ===== window 2: guess -> check -> adjust =====
    {
      const X = SGX[1], second = t > 9.4, flare = Math.sin(Math.PI * wS(t, 8.6, 9.6)), spin = ezS((t - 8.7) / 0.6) * 1.2;
      rose(X + 240, 370, 150, 1, spin, flare);
      banner(X + 140, 540, 200, 56, 'the model', 34);
      animal(X + 920, 300, 210, false, ezS((t - 6.6) / 0.4));
      banner(X + 820, 420, 200, 52, 'new picture', 32, { k: ezS((t - 6.8) / 0.3), reveal: wS(t, 6.9, 7.2) });
      // the guess banner
      banner(X + 420, 100, 320, 120, '', 0, { k: ezS((t - 7.0) / 0.3) });
      if (!second && t > 7.1) drawT({ str: 'dog?', x: X + 580, y: 186, size: 84, ink: [58, 34, 22], font: '700', reveal: wS(t, 7.1, 7.5), align: 'center' });
      strip(bez([X + 340, 250], [X + 360, 170], [X + 380, 160], [X + 412, 160]), wS(t, 6.9, 7.2), 14, GOLD);
      banner(X + 200, 100, 150, 52, 'Guess', 34, { k: ezS((t - 6.95) / 0.3), reveal: wS(t, 7.0, 7.3) });
      strip(bez([X + 820, 220], [X + 800, 170], [X + 780, 160], [X + 748, 160]), wS(t, 7.5, 7.8), 14, WHITEG);
      banner(X + 820, 110, 150, 52, 'Check', 34, { k: ezS((t - 7.55) / 0.3), reveal: wS(t, 7.6, 7.9) });
      if (t > 7.9 && !second) {
        strip([[X + 470, 110], [X + 690, 210]].flatMap((p, i, A) => i ? Array.from({ length: 10 }, (_, k) => [lerpS(A[0][0], p[0], (k + 1) / 10), lerpS(A[0][1], p[1], (k + 1) / 10)]) : [p]), wS(t, 7.9, 8.05), 16, RUBY, false);
        strip([[X + 690, 110], [X + 470, 210]].flatMap((p, i, A) => i ? Array.from({ length: 10 }, (_, k) => [lerpS(A[0][0], p[0], (k + 1) / 10), lerpS(A[0][1], p[1], (k + 1) / 10)]) : [p]), wS(t, 8.05, 8.2), 16, RUBY, false);
        strip(ring(X + 580, 160, 200, 92), wS(t, 8.0, 8.45), 12, RUBY, false);
        banner(X + 810, 486, 220, 52, "it's a cat!", 34, { k: ezS((t - 8.0) / 0.25), reveal: wS(t, 8.05, 8.4), col: [244, 200, 196], ink: [130, 20, 30] });
        glows.push([X + 580, 160, 260, 0.35 * Math.sin(Math.PI * wS(t, 7.9, 8.8))]);
      }
      strip(bez([X + 600, 230], [X + 660, 560], [X + 460, 560], [X + 390, 430]), wS(t, 8.25, 8.8), 16, RUBY);
      banner(X + 560, 560, 170, 54, 'Adjust', 36, { k: ezS((t - 8.45) / 0.3), reveal: wS(t, 8.5, 8.85), col: [244, 200, 196], ink: [130, 20, 30] });
      if (second) {
        drawT({ str: 'cat', x: X + 560, y: 186, size: 84, ink: [58, 34, 22], font: '700', reveal: wS(t, 9.4, 9.7), align: 'center' });
        strip([[X + 640, 160], [X + 660, 186], [X + 674, 176], [X + 690, 150], [X + 712, 120]], wS(t, 9.7, 9.95), 16, GREENG, false);
      }
      if (flare > 0) glows.push([X + 240, 370, 300, 0.6 * flare]);
    }
    // ===== window 3: progress =====
    {
      const X = SGX[2], N = 10, pr = wS(t, 11.2, 12.7);
      d.lineWidth = 12; d.strokeStyle = LEAD; d.beginPath(); d.moveTo(X + 100, 520); d.lineTo(X + 1020, 520); d.stroke();
      for (let i = 0; i < N; i++) {
        const acc = 61 + 36 * (1 - Math.exp(-i / 2.6)) / (1 - Math.exp(-(N - 1) / 2.6)), hh = (acc - 40) * 5.4 * ezS((t - 11.2 - i * 0.15) / 0.35);
        if (hh < 2) continue;
        const bx = X + 130 + i * 86, col = i === N - 1 ? GOLD : i % 2 ? [40, 150, 190] : [60, 120, 200];
        pc(() => { d.beginPath(); d.moveTo(bx, 520); d.lineTo(bx, 520 - hh + 26); d.quadraticCurveTo(bx, 520 - hh, bx + 30, 520 - hh); d.quadraticCurveTo(bx + 60, 520 - hh, bx + 60, 520 - hh + 26); d.lineTo(bx + 60, 520); d.closePath(); }, col);
        d.lineWidth = 4; d.strokeStyle = LEAD; for (let y = 520 - 44; y > 520 - hh + 30; y -= 44) { d.beginPath(); d.moveTo(bx, y); d.lineTo(bx + 60, y - 8); d.stroke(); }
      }
      const acc = Math.round(t < 11.2 ? 61 : t > 12.7 ? 97 : lerpS(61, 97, H.ease.out(pr)));
      banner(X + 520, 90, 480, 110, '', 0, { k: ezS((t - 10.95) / 0.3) });
      drawT({ str: 'Accuracy', x: X + 550, y: 160, size: 44, ink: [58, 34, 22], font: '600', reveal: wS(t, 11.0, 11.3), align: 'left' });
      drawT({ str: acc + '%', x: X + 980, y: 172, size: 80, ink: acc >= 97 ? [140, 20, 30] : [58, 34, 22], font: '700', reveal: wS(t, 11.1, 11.3), align: 'right' });
      banner(X + 100, 300, 120, 50, '61%', 32, { k: ezS((t - 11.3) / 0.3), reveal: wS(t, 11.35, 11.6) });
      banner(X + 120, 534, 330, 52, 'training rounds →', 32, { k: ezS((t - 11.0) / 0.3), reveal: wS(t, 11.1, 11.5) });
      if (t > 12.7) { strip(ring(X + 905, 146, 112, 66), wS(t, 12.7, 13.1), 12, GOLD, false); glows.push([X + 1004, 200, 260, 0.55 * Math.sin(Math.PI * wS(t, 12.7, 13.7))], [X + 880, 140, 260, 0.4 * Math.sin(Math.PI * wS(t, 12.75, 13.6))]); }
    }
    // texture the dynamic glass, then composite
    d.setTransform(1, 0, 0, 1, 0, 0); d.globalCompositeOperation = 'source-atop'; d.drawImage(C.streak, cam, 0, W, H_, 0, 0, W, H_); d.globalCompositeOperation = 'source-over';
    ctx.drawImage(D, 0, 0);
    // light: cheap bloom through the glass + flares + rays + dust
    const sm = C.small.getContext('2d'); sm.clearRect(0, 0, 160, 90); sm.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, 160, 90);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.35; ctx.imageSmoothingEnabled = true; ctx.drawImage(C.small, 0, 0, W, H_);
    ctx.globalAlpha = 1;
    for (const [x, y, rr, a] of glows) { if (a <= 0) continue; const g = ctx.createRadialGradient(x - cam, y, 4, x - cam, y, rr); g.addColorStop(0, `rgba(255,236,180,${a})`); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = g; ctx.fillRect(x - cam - rr, y - rr, rr * 2, rr * 2); }
    [[300, [255, 214, 140]], [520, [150, 170, 255]], [760, [255, 190, 150]]].forEach(([sx, c], k) => {
      const dr = Math.sin(t * 0.5 + k) * 20 - cam * 0.08; const g = ctx.createLinearGradient(sx + dr, 0, sx + dr + 400, 720); g.addColorStop(0, H.rgba(c, 0.1)); g.addColorStop(1, H.rgba(c, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx + dr - 40, 0); ctx.lineTo(sx + dr + 60, 0); ctx.lineTo(sx + dr + 520, 720); ctx.lineTo(sx + dr + 320, 720); ctx.closePath(); ctx.fill();
    });
    const dr = H.rng(3);
    for (let k = 0; k < 90; k++) { const x = dr() * W + Math.sin(t * 0.5 + k) * 8, y = ((dr() * 720 - t * 10 * (0.5 + dr())) % 720 + 720) % 720; ctx.fillStyle = `rgba(255,240,210,${dr.range(0.15, 0.45)})`; ctx.beginPath(); ctx.arc(x, y, dr.range(0.6, 1.6), 0, 7); ctx.fill(); }
    ctx.restore();
    H.vignette(ctx, W, H_, 0.45, '10,6,4');

    // ---------- screen-space banners: hook -> header; takeaway ----------
    const sbanner = (x, y, w, h, str, size, font, reveal = 1) => {
      ctx.save(); ctx.lineJoin = 'round';
      ctx.fillStyle = cssS(CREAMG); ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill();
      ctx.save(); ctx.clip(); ctx.drawImage(C.streak, x, y, w, h, x, y, w, h); ctx.shadowColor = 'rgba(14,6,18,0.55)'; ctx.shadowBlur = 22; ctx.lineWidth = 6; ctx.strokeStyle = LEAD; ctx.stroke(); ctx.restore();
      ctx.lineWidth = 9; ctx.strokeStyle = LEAD; ctx.stroke();
      ctx.save(); ctx.translate(-1.5, -1.5); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,240,220,0.16)'; ctx.stroke(); ctx.restore();
      ctx.restore();
      ctx.save(); ctx.font = font; const tw = ctx.measureText(str).width, x0 = x + w / 2 - tw / 2;
      if (reveal < 1) { ctx.beginPath(); ctx.rect(x0 - 6, y, (tw + 12) * reveal, h); ctx.clip(); }
      ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(38,20,12,0.22)'; ctx.fillText(str, x0 + 1.5, y + h / 2 + size * 0.04 + 1.8);
      ctx.fillStyle = 'rgb(38,20,12)'; ctx.fillText(str, x0, y + h / 2 + size * 0.04);
      ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(1, size * 0.024); ctx.strokeStyle = 'rgba(20,10,6,0.4)'; ctx.strokeText(str, x0, y + h / 2 + size * 0.04); ctx.restore();
    };
    {
      const k = ezS((t - 1.5) / 0.7), s = lerpS(1, 0.5, k);
      const w = 820 * s, h = 150 * s, x = lerpS(640 - 410, 18, k), y = lerpS(260, 14, k);
      sbanner(x, y, w, h, 'How does AI learn?', 92 * s, `400 ${92 * s}px "UnifrakturMaguntia"`, wS(t, 0.2, 1.2));
    }
    if (t > 13.15) sbanner(140, 610, 1000, 92, 'More examples → better guesses', 52, '600 52px "Cormorant Garamond"', ezS((t - 13.2) / 0.7));
  }

  registerStyle({
    id: 'stained-glass',
    name: 'Cathedral Glass',
    category: 'Painterly',
    description: 'A leaded Gothic window: hand-cut pieces of streaky, seedy antique glass held in thick dark came, painted grisaille details, and light blazing through into a dim stone interior with dusty rays.',
    motion: 'Daylight sweeps slowly across the window so pieces brighten in turn, the rays drift with floating dust, and the chip in the saint\'s hands pulses.',
    fonts: ['400 38px "UnifrakturMaguntia"', '600 40px "Cormorant Garamond"'],
    duration: 5.5,
    frameT: 5.4,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Told as a cycle of three leaded windows along a nave, the camera walking from window to window; arrows are strips of glass in lead came with glass arrowheads, labels and the counters are grisaille painted on pale banner glass, and emphasis is ruby glass rings and light flaring through the pieces.',
    explainer(ctx, W, H_, t) { explainStained(ctx, W, H_, t); },
    explainerSound(k) {
      // all times copied from explainStained() above (its wS()/ezS() windows). Glass, lead, stone and light, kept low.
      const D = 15;
      const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
      const SC = ['D4', 'E4', 'F4', 'G4', 'A4', 'C5', 'D5']; // D dorian-ish; glass fundamentals stay under ~600 Hz
      // a piece of glass set into its lead came: a soft dull lead tap and a short, low glassy ring
      const piece = (t, f, g = 1, pan = 0, minor = true) => { const h = k.hz(f);
        k.noise(t, { dur: 0.03, color: 'brown', filter: 'lowpass', f: 600, gain: 0.16 * g, a: 0.002, pan, minor });
        k.tone(t, { f: h, dur: 0.55, gain: 0.09 * g, a: 0.002, verb: 0.35, pan, minor });
        k.tone(t, { f: h * 2.32, dur: 0.22, gain: 0.03 * g, a: 0.002, verb: 0.35, pan, minor }); };
      // a glass strip leaded along a path: one piece per lead division, stepping up the scale, panned along
      const strip = (a, b, n, i0, g = 1, p0 = 0, p1 = p0, minor = true) => { for (let i = 0; i < n; i++) piece(a + (b - a) * i / n, SC[(i0 + i) % SC.length], g * (i ? 0.75 : 1), p0 + (p1 - p0) * i / Math.max(1, n - 1), minor); };
      // grisaille painted onto glass with a soft sable brush
      const paint = (a, b, g = 0.6, pan = 0) => k.play('stroke', a, { material: 'brush', dur: b - a, gain: g, pan, minor: true });
      // a pale banner pane slid into place
      const pane = (t, g = 1, pan = 0) => { k.noise(t, { dur: 0.25, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.25, 700]], q: 1.2, gain: 0.07 * g, a: 0.1, pan, minor: true }); piece(t + 0.25, 'A3', 0.8 * g, pan); };
      // light flaring through the glass: a slow glass-harmonica swell
      const light = (t, dur, notes, g = 1, pan = 0, minor = false) => notes.forEach((n, i) => {
        k.tone(t + i * 0.05, { f: n, dur, gain: 0.05 * g, a: dur * 0.35, verb: 0.5, pan: pan + (i - (notes.length - 1) / 2) * 0.25, minor });
        k.tone(t + i * 0.05, { f: k.hz(n) * 1.004, dur: dur * 0.9, gain: 0.03 * g, a: dur * 0.4, pan: -pan, minor }); });
      // footsteps on the nave's stone floor while the camera walks to the next window
      const step = (t, pan) => { k.play('thud', t, { f: 75, gain: 0.25, pan });
        k.noise(t, { dur: 0.1, color: 'brown', filter: 'lowpass', f: 350, gain: 0.22, a: 0.004, pan, verb: 0.6 });
        k.noise(t + 0.03, { dur: 0.06, color: 'pink', filter: 'bandpass', f: 900, q: 1, gain: 0.05, pan }); };
      const walk = (a, b) => { for (let i = 0; i < 3; i++) step(a + 0.1 + i * (b - a - 0.2) / 2, i % 2 ? 0.25 : -0.25); light(a, b - a + 0.4, ['D3', 'A3'], 0.6, 0, true); };
      // the counters: a fingertip tick on the glass, small and dull
      const tickG = (t, pan) => k.play('tock', t, { f: 1250, gain: 0.42, pan, minor: true });
      const counter = (val, a, b, gap, pan, avoid = []) => { let last = val(a), lastT = -1;
        for (let t = a; t <= b; t += 1 / 240) { const v = val(t); if (v !== last && t - lastT >= gap && !avoid.some((x) => t > x - 0.03 && t < x + 0.08)) { tickG(t, pan); lastT = t; } last = v; } };

      // ---- the nave: a big stone room and a soft organ-like pad (Dm, C, Bb, F; 3.75 s bars)
      k.bed('room', 0, D, { gain: 0.65 });
      k.music('pad', 0, D, { bpm: 64, gain: 0.32, chords: [['D3', 'A3', 'D4', 'F4'], ['C3', 'G3', 'C4', 'E4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['F3', 'A3', 'C4', 'F4']] });

      // ---- 1 HOOK: the sun reaches the first window (0.1-1.3), the title is painted on its banner 0.2-1.2
      light(0.1, 1.6, ['D3', 'A3', 'D4'], 1.0, -0.2);
      paint(0.2, 1.2, 0.8);
      k.noise(1.5, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.7, 600]], q: 0.7, gain: 0.06, a: 0.25, minor: true }); // banner slides to the corner

      // ---- 2 DATA: the rose window fills in (1.2-1.8), the gold strip 2.2-2.8, banners
      [0, 1, 2, 3].forEach((i) => piece(1.22 + i * 0.12, SC[[0, 2, 4, 6][i]], 0.9, 0.5 + i * 0.05, i > 0));
      light(1.2, 1.2, ['F4'], 0.6, 0.5, true);
      strip(2.2, 2.8, 6, 0, 1.0, -0.8, 0.0, false);
      pane(2.3, 0.8, 0.5);               // 'the model' banner (ezS 2.3-2.6)
      pane(2.6, 0.8, -0.4);              // 'labelled examples' banner
      paint(2.7, 3.1, 0.5, -0.4);
      pane(2.9, 1.0, -0.4);              // the counter banner
      // counter: n = 1e6 * ease.in(wS(3.0, 5.6)), rounded to thousands
      counter((t) => Math.round(1e6 * H.ease.in(wS(t, 3.0, 5.6)) / 1000), 3.3, 5.58, 1 / 12, -0.5);
      piece(5.6, 'D4', 1.5, -0.5, false); // 1,000,000 lands
      strip(5.6, 5.9, 4, 2, 0.8, -0.7, -0.2); // ruby underline

      // ---- walk to window 2 (camera 6.0-6.95)
      walk(6.0, 6.95);

      // ---- 3 GUESS -> CHECK -> ADJUST
      piece(6.62, 'G3', 1.2, 0.6, false);  // the cat panel is leaded in (ezS 6.6-7.0)
      strip(6.9, 7.2, 4, 0, 0.9, -0.4, -0.2, false); // guess strip
      pane(6.97, 0.7, -0.1);               // guess banner
      paint(7.1, 7.5, 0.7, 0.0);           // 'dog?'
      strip(7.5, 7.8, 4, 2, 0.9, 0.5, 0.3, false); // check strip
      // the wrong guess: two ruby strips hard-set across it, a low clashing glass knock, light flares red (7.9-8.8)
      piece(7.9, 'Eb3', 1.4, 0.0, false); piece(8.05, 'D3', 1.4, 0.0, false);
      k.play('thud', 7.9, { f: 100, gain: 0.35 });
      k.tone(7.9, { f: 'D3', type: 'triangle', dur: 0.8, gain: 0.12, a: 0.01, verb: 0.4 });
      k.tone(7.9, { f: 'Eb3', type: 'triangle', dur: 0.8, gain: 0.1, a: 0.01, verb: 0.4 });
      strip(8.2, 8.45, 3, 4, 0.6, 0.2, -0.2);      // the ruby ring closes
      strip(8.25, 8.8, 5, 4, 1.0, 0.0, -0.6, false); // adjust strip runs back to the rose
      // the rose flares and its spokes turn (8.6-9.6 / ezS over 8.7-9.3)
      light(8.6, 1.2, ['D4', 'A4'], 0.9, -0.6);
      const sp = (t) => ezS((t - 8.7) / 0.6);
      [0.2, 0.5, 0.8].forEach((v) => k.play('tock', when(sp, v, 8.7, 9.3), { f: 700, gain: 0.35, pan: -0.6, minor: true }));
      paint(9.4, 9.7, 0.8, 0.0);              // 'cat'
      strip(9.7, 9.95, 3, 2, 1.0, 0.1, 0.3, false); // green check
      k.play('ding', 9.97, { f: 'A4', gain: 0.45, pan: 0.2 });
      k.tone(10.0, { f: 'D5', dur: 1.2, gain: 0.05, verb: 0.4, pan: 0.3 });

      // ---- walk to window 3 (camera 10.4-11.35)
      walk(10.4, 11.35);

      // ---- 4 PROGRESS: accuracy banner 10.95, ten glass lancets rising from 11.2 + i*0.15, the % repainted
      pane(10.95, 0.8, 0.3);
      const bars = Array.from({ length: 10 }, (_, i) => 11.2 + i * 0.15 + 0.12);  // a lancet is leaded once it has risen a little
      bars.forEach((t, i) => piece(t, SC[i % SC.length], 0.55, -0.7 + i * 0.12));
      const acc = (t) => Math.round(61 + 36 * H.ease.out(wS(t, 11.2, 12.7)));
      const t97 = when(acc, 97, 11.2, 12.7);
      counter(acc, 11.25, t97 - 0.05, 1 / 8, 0.5, bars);
      tickG(t97, 0.5); piece(t97, 'A3', 1.2, 0.5);   // 97% repainted in ruby
      // the gold ring is leaded round 97% and light flares through the last lancet and the banner: the biggest hit
      k.play('impact', 12.7, { gain: 0.75, pan: 0.4 });
      piece(12.7, 'D4', 2.2, 0.4, false);
      k.play('ding', 12.72, { f: 'D4', gain: 0.8, pan: 0.3 });
      light(12.7, 1.6, ['D3', 'A3', 'F4', 'A4'], 1.4, 0.4);
      strip(12.85, 13.1, 3, 4, 0.6, 0.5, 0.3);

      // ---- 5 TAKEAWAY: the banner set in at 13.15, painted 13.2-13.9, then a resolving glass chord
      piece(13.15, 'A3', 0.9, 0);     // the takeaway banner appears at once (no fade)
      paint(13.2, 13.9, 0.9, 0);
      k.play('ding', 13.95, { f: 'F4', gain: 0.5 });
      light(13.95, 1.0, ['D3', 'A3', 'D4', 'F4'], 1.0, 0);
    },
    draw(ctx, W, H_, t) {
      const cx = 640, x0 = 372, x1 = 908, spring = 360, R = 340;
      // two-centred pointed arch: each side is an arc centred on the springing line inside the opposite half
      const pointed = (c, a, b, r, top, bottom) => {
        const mid = (a + b) / 2, CL = a + r, CR = b - r;
        c.beginPath(); c.moveTo(a, bottom); c.lineTo(a, top);
        c.arc(CL, top, r, Math.PI, Math.PI + Math.acos((CL - mid) / r), false);
        c.arc(CR, top, r, Math.PI * 2 - Math.acos((mid - CR) / r), Math.PI * 2, false);
        c.lineTo(b, bottom); c.closePath();
      };
      const archPath = (c, inset = 0) => pointed(c, x0 + inset, x1 - inset, R - inset, spring, 700 - inset * 0.3);
      const lancet = (c, lx, w, top, bottom) => pointed(c, lx, lx + w, w * 0.9, top, bottom);

      // ---------- 1. design: region map ----------
      const M = H.layer(W, H_), m = M.getContext('2d');
      const id = (n) => `rgb(${n},0,0)`;
      m.fillStyle = id(0); m.fillRect(0, 0, W, H_);
      m.fillStyle = id(2); archPath(m, 0); m.fill();
      m.fillStyle = id(1); archPath(m, 22); m.fill();
      // side lancets
      [[140, 120], [1020, 120]].forEach(([lx, w]) => { m.fillStyle = id(2); lancet(m, lx, w, 250, 640); m.fill(); m.fillStyle = id(13); lancet(m, lx + 14, w - 28, 256, 626); m.fill(); });
      [[200, 420], [1080, 420], [200, 260], [1080, 260]].forEach(([x, y]) => { m.fillStyle = id(14); m.beginPath(); m.arc(x, y, 26, 0, 7); m.fill(); });
      // stars in the field
      const sr = H.rng(17);
      for (let k = 0; k < 26; k++) {
        const x = sr.range(400, 880), y = sr.range(90, 640), s = sr.range(7, 11);
        if (Math.hypot(x - cx, y - 250) < 175 || (Math.abs(x - cx) < 150 && y > 330)) continue;
        m.fillStyle = id(15); m.beginPath(); m.moveTo(x, y - s); m.lineTo(x + s * 0.6, y); m.lineTo(x, y + s); m.lineTo(x - s * 0.6, y); m.fill();
      }
      // halo: rose of petals around a gold ring, ring of circuit pins
      const hy = 246;
      m.fillStyle = id(17); m.beginPath(); m.arc(cx, hy, 168, 0, 7); m.fill();
      m.fillStyle = id(4); m.beginPath(); m.arc(cx, hy, 150, 0, 7); m.fill();
      for (let k = 0; k < 16; k++) {
        const a = k / 16 * Math.PI * 2, a2 = a + Math.PI / 16;
        m.fillStyle = id(5); m.beginPath(); m.moveTo(cx + Math.cos(a) * 92, hy + Math.sin(a) * 92);
        m.quadraticCurveTo(cx + Math.cos(a2) * 150, hy + Math.sin(a2) * 150, cx + Math.cos(a + Math.PI / 8) * 92, hy + Math.sin(a + Math.PI / 8) * 92);
        m.quadraticCurveTo(cx + Math.cos(a2) * 112, hy + Math.sin(a2) * 112, cx + Math.cos(a) * 92, hy + Math.sin(a) * 92); m.fill();
      }
      // robe (behind the head), inner robe, sleeves
      m.fillStyle = id(8); m.beginPath(); m.moveTo(cx - 70, 352); m.quadraticCurveTo(cx - 150, 400, cx - 176, 640); m.lineTo(cx + 176, 640); m.quadraticCurveTo(cx + 150, 400, cx + 70, 352); m.closePath(); m.fill();
      m.fillStyle = id(9); m.beginPath(); m.moveTo(cx - 34, 360); m.lineTo(cx - 64, 640); m.lineTo(cx + 64, 640); m.lineTo(cx + 34, 360); m.closePath(); m.fill();
      m.fillStyle = id(8); m.beginPath(); m.moveTo(cx - 120, 420); m.quadraticCurveTo(cx - 60, 500, cx - 6, 470); m.lineTo(cx - 6, 512); m.quadraticCurveTo(cx - 80, 540, cx - 132, 480); m.fill();
      m.beginPath(); m.moveTo(cx + 120, 420); m.quadraticCurveTo(cx + 60, 500, cx + 6, 470); m.lineTo(cx + 6, 512); m.quadraticCurveTo(cx + 80, 540, cx + 132, 480); m.fill();
      // hands cradling the chip
      m.fillStyle = id(10); m.beginPath(); m.ellipse(cx - 30, 488, 24, 18, 0.3, 0, 7); m.fill(); m.beginPath(); m.ellipse(cx + 30, 488, 24, 18, -0.3, 0, 7); m.fill();
      m.fillStyle = id(11); m.fillRect(cx - 26, 438, 52, 52);
      m.fillStyle = id(17); for (let k = 0; k < 4; k++) { m.fillRect(cx - 22 + k * 13, 428, 6, 10); m.fillRect(cx - 22 + k * 13, 490, 6, 10); }
      // head: rounded square with face plate and eyes, antenna
      m.fillStyle = id(6); m.beginPath(); m.roundRect(cx - 60, 196, 120, 120, 26); m.fill();
      m.fillRect(cx - 24, 312, 48, 30);
      m.fillStyle = id(16); m.beginPath(); m.roundRect(cx - 44, 226, 88, 62, 14); m.fill();
      m.fillStyle = id(7); m.beginPath(); m.arc(cx - 20, 254, 11, 0, 7); m.fill(); m.beginPath(); m.arc(cx + 20, 254, 11, 0, 7); m.fill();
      m.fillStyle = id(6); m.fillRect(cx - 4, 160, 8, 38); m.beginPath(); m.arc(cx, 156, 12, 0, 7); m.fill();
      // banner
      m.fillStyle = id(12); m.beginPath(); m.moveTo(cx - 230, 600); m.quadraticCurveTo(cx, 576, cx + 230, 600); m.lineTo(cx + 236, 664); m.quadraticCurveTo(cx, 640, cx - 236, 664); m.closePath(); m.fill();
      const MAP = m.getImageData(0, 0, W, H_).data;
      const reg = new Uint8Array(W * H_);
      for (let i = 0; i < reg.length; i++) { const v = MAP[i * 4]; reg[i] = REG[v] || v === 0 ? v : 0; }

      // ---------- 2. cut the glass: jittered Voronoi inside each region ----------
      const grids = { 1: 40, 2: 22 };
      const seedsFor = {};
      for (const [k, cs] of Object.entries(grids)) {
        const r = H.rng(100 + +k), gw = Math.ceil(W / cs), gh = Math.ceil(H_ / cs), pts = new Float32Array(gw * gh * 2);
        for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { pts[(j * gw + i) * 2] = (i + 0.15 + r() * 0.7) * cs; pts[(j * gw + i) * 2 + 1] = (j + 0.15 + r() * 0.7) * cs; }
        seedsFor[k] = { cs, gw, gh, pts };
      }
      const piece = new Int32Array(W * H_);
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x, rg = reg[i];
        if (!rg) { piece[i] = 0; continue; }
        const sub = REG[rg].sub;
        if (!sub) { piece[i] = rg * 100000; continue; }
        const S = seedsFor[sub], gx = (x / S.cs) | 0, gy = (y / S.cs) | 0;
        let best = 1e9, bi = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const ix = gx + dx, iy = gy + dy; if (ix < 0 || iy < 0 || ix >= S.gw || iy >= S.gh) continue;
          const k = iy * S.gw + ix, px = S.pts[k * 2] - x, py = S.pts[k * 2 + 1] - y, d = px * px + py * py;
          if (d < best) { best = d; bi = k; }
        }
        piece[i] = rg * 100000 + bi + 1;
      }
      // the lead: wherever neighbouring pixels belong to different pieces
      const LD = H.layer(W, H_), ld = LD.getContext('2d');
      const limg = ld.createImageData(W, H_), la = limg.data;
      for (let y = 0; y < H_ - 1; y++) for (let x = 0; x < W - 1; x++) {
        const i = y * W + x, p = piece[i];
        if (p !== piece[i + 1] || p !== piece[i + W]) la[i * 4 + 3] = 255;
      }
      ld.putImageData(limg, 0, 0);
      const L1 = H.layer(W, H_), l1 = L1.getContext('2d'); l1.filter = 'blur(2.2px)'; l1.drawImage(LD, 0, 0); l1.filter = 'none';
      const L2 = H.layer(W, H_), l2 = L2.getContext('2d'); l2.filter = 'blur(7px)'; l2.drawImage(LD, 0, 0); l2.filter = 'none';
      const lead = l1.getImageData(0, 0, W, H_).data, prox = l2.getImageData(0, 0, W, H_).data;

      // ---------- 3. stone interior ----------
      const nz = H.makeNoise(8);
      const img = ctx.createImageData(W, H_), d = img.data;
      const gr = H.rng(5);
      // daylight sweeping across the window
      const sweep = 0.5 + 0.5 * Math.sin(t * 0.9 - 2.4);
      // the window lights up piece by piece, spreading out from the chip in the saint's hands
      const winL = H.smooth(0.3, 3.0, t);
      // per-piece glass colour
      const pcache = new Map();
      const pieceCol = (p, rg, x, y) => {
        let c = pcache.get(p); if (c) return c;
        // whole-region pieces (and their stray anti-aliased pixels) light from the region's own centre
        const AT = { 5: [640, 300], 6: [640, 256], 7: [640, 254], 10: [640, 488], 11: [640, 464], 12: [640, 620], 14: [200, 340], 15: [640, 330], 16: [640, 256] };
        if (AT[rg]) { x = AT[rg][0]; y = AT[rg][1]; }
        const rb = H.rng(p * 3 + 1), birth = 0.3 + 2.3 * Math.min(1, Math.hypot(x - cx, y - 464) / 620) + rb() * 0.35;
        const k = H.clamp((t - birth) / 0.3), on = k * k * (3 - 2 * k) * (1 + 0.25 * Math.sin(k * Math.PI));   // a little flare as it catches
        const r = H.rng(p * 7 + 13), def = REG[rg];
        const base = def.alt ? r.pick(def.alt) : def.c;
        const v = 0.86 + r() * 0.26;
        c = [base[0] * v + r.gauss() * 8, base[1] * v + r.gauss() * 8, base[2] * v + r.gauss() * 8, r() * 6.28, 0.4 + r() * 0.8, on];
        pcache.set(p, c); return c;
      };
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x, o = i * 4, rg = reg[i];
        let r, g, b;
        if (!rg) {
          // ashlar masonry, warmly lit by the window's glow
          const row = Math.floor(y / 72), off = (row & 1) * 95 + (row % 3) * 37, bxp = (x + off) % 190, byp = y % 72;
          const mortar = bxp < 3 || byp < 3 ? 0.5 : (bxp < 6 || byp < 6 ? 1.12 : 1);
          const tex = 0.85 + nz.fbm2(x * 0.02, y * 0.02, 3) * 0.25 + (gr() - 0.5) * 0.08;
          const glow = Math.max(0.12, 1 - Math.hypot((x - cx) / 620, (y - 330) / 520));
          const k = tex * mortar * (0.18 + glow * 0.42 * (0.2 + 0.8 * winL));
          r = 120 * k; g = 104 * k; b = 92 * k;
        } else {
          const p = piece[i], pc = pieceCol(p, rg, x, y);
          // streaky, seedy antique glass: thickness varies within each sheet
          const sa = pc[3], u = x * Math.cos(sa) + y * Math.sin(sa), v = -x * Math.sin(sa) + y * Math.cos(sa);
          const streak = nz.n2(u * 0.012, v * 0.09 + p) * 0.6 + nz.n2(x * 0.05, y * 0.05) * 0.25;
          const pr = prox[o + 3] / 255, white = rg === 6 || rg === 10;
          // pale white glass shows its streaks and thickness more (and must not blow out to flat white)
          let lum = (white ? 0.84 + streak * 0.5 : 0.92 + streak * 0.32) * (1 - pr * (white ? 0.5 : 0.42)) * (0.92 + 0.16 * pc[4]);
          // light passes stronger through the upper window and in a slow diagonal sweep
          lum *= 0.88 + 0.22 * (1 - y / H_) + 0.14 * Math.exp(-Math.pow((x + y * 0.6 - (300 + sweep * 900)) / 260, 2));
          const on = pc[5];
          r = pc[0] * lum; g = pc[1] * lum; b = pc[2] * lum;
          // hot core where light is strongest
          const hot = Math.max(0, lum - 1.05) * (white ? 70 : 180); r += hot; g += hot; b += hot * 0.8;
          // unlit glass: almost black, just a hint of its colour in the dim nave
          const dim = 0.07 + 0.93 * on; r = r * dim + 14 * (1 - on); g = g * dim + 15 * (1 - on); b = b * dim + 20 * (1 - on);
        }
        // lead came: dark, rounded, catching a little light on its upper-left shoulder
        const la_ = lead[o + 3] / 255;
        // hand-drawn came swells and thins a little along its length
        const lv = la_ > 0.02 ? H.clamp((la_ - 0.07 - (Math.sin(x * 0.031 + y * 0.017) + Math.sin(y * 0.029 - x * 0.013)) * 0.018) / 0.14) : 0;
        if (lv > 0 && (rg || reg[Math.min(reg.length - 1, i + 3)] || reg[Math.max(0, i - 3)])) {
          const gx = (lead[o + 3 + 4] || 0) - (lead[o + 3 - 4] || 0), gy = (lead[o + 3 + W * 4] || 0) - (lead[o + 3 - W * 4] || 0);
          const sh = 14 + Math.max(0, -(gx + gy)) * 0.5 + la_ * 12;
          r = r * (1 - lv) + (sh + 6) * lv; g = g * (1 - lv) + (sh + 4) * lv; b = b * (1 - lv) + sh * lv;
        }
        d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);

      // ---------- stone reveal: chamfered mouldings framing each opening ----------
      ctx.save();
      const reveal = (fn, wdt) => {
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(112,98,84,0.96)'; ctx.lineWidth = wdt; fn(); ctx.stroke();
        ctx.strokeStyle = 'rgba(214,180,140,0.22)'; ctx.lineWidth = wdt * 0.3; ctx.save(); ctx.translate(-wdt * 0.18, -wdt * 0.18); fn(); ctx.stroke(); ctx.restore();
        ctx.strokeStyle = 'rgba(30,22,18,0.7)'; ctx.lineWidth = 3; fn(); ctx.stroke();
      };
      ctx.globalAlpha = 0.35 + 0.65 * winL;
      reveal(() => archPath(ctx, -12), 22);
      reveal(() => lancet(ctx, 128, 144, 250, 652), 18);
      reveal(() => lancet(ctx, 1008, 144, 250, 652), 18);
      ctx.fillStyle = 'rgb(120,104,88)'; ctx.fillRect(330, 700, 620, 20); ctx.fillStyle = 'rgba(230,200,160,0.35)'; ctx.fillRect(330, 700, 620, 4);
      ctx.restore();

      // ---------- 4. seeds & bubbles in the glass ----------
      const br = H.rng(91);
      ctx.save();
      for (let k = 0; k < 900; k++) {
        const x = br() * W, y = br() * H_, i = (y | 0) * W + (x | 0);
        if (!reg[i] || lead[i * 4 + 3] > 20) continue;
        const rr = br() < 0.85 ? br.range(0.6, 1.4) : br.range(1.8, 3.2);
        ctx.fillStyle = 'rgba(255,255,240,0.35)'; ctx.beginPath(); ctx.ellipse(x, y, rr * 1.3, rr, 0.3, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,20,0.25)'; ctx.lineWidth = 0.6; ctx.stroke();
      }
      ctx.restore();

      // ---------- 5. grisaille: paint fired onto the glass ----------
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const gris = (a) => `rgba(52,34,26,${a})`;
      // robe folds: soft smear shading, the way glass painters matted it on
      ctx.save(); ctx.filter = 'blur(5px)'; ctx.strokeStyle = gris(0.3); ctx.lineWidth = 12;
      [[-120, 450, -146, 600], [-80, 480, -96, 600], [86, 480, 100, 600], [124, 450, 148, 600]].forEach(([a, b, c2, e]) => { ctx.beginPath(); ctx.moveTo(cx + a, b); ctx.quadraticCurveTo(cx + (a + c2) / 2 + 10, (b + e) / 2, cx + c2, e); ctx.stroke(); });
      ctx.restore();
      ctx.strokeStyle = gris(0.5); ctx.lineWidth = 2.2;
      [[-112, 470, -128, 560], [112, 470, 128, 560]].forEach(([a, b, c2, e]) => { ctx.beginPath(); ctx.moveTo(cx + a, b); ctx.quadraticCurveTo(cx + (a + c2) / 2 + 6, (b + e) / 2, cx + c2, e); ctx.stroke(); });
      // face plate: mouth grille, eye pupils
      ctx.lineWidth = 2.4; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(cx - 18 + k * 9, 272); ctx.lineTo(cx - 18 + k * 9, 282); ctx.stroke(); }
      ctx.fillStyle = gris(0.6); ctx.beginPath(); ctx.arc(cx - 20, 254, 4, 0, 7); ctx.arc(cx + 20, 254, 4, 0, 7); ctx.fill();
      // head shading + rivets: a soft matt badgered toward the edges of the white glass, darker on the shadow side
      ctx.save(); ctx.beginPath(); ctx.roundRect(cx - 60, 196, 120, 120, 26); ctx.clip();
      const hm = ctx.createRadialGradient(cx - 16, 236, 18, cx - 4, 252, 98); hm.addColorStop(0, gris(0)); hm.addColorStop(0.55, gris(0.08)); hm.addColorStop(1, gris(0.42));
      ctx.fillStyle = hm; ctx.fillRect(cx - 60, 196, 120, 120);
      ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.roundRect(cx - 44, 226, 88, 62, 14); ctx.clip();
      const fm = ctx.createLinearGradient(0, 226, 0, 288); fm.addColorStop(0, gris(0)); fm.addColorStop(1, gris(0.35));
      ctx.fillStyle = fm; ctx.fillRect(cx - 44, 226, 88, 62); ctx.restore();
      ctx.fillStyle = gris(0.25); ctx.beginPath(); ctx.roundRect(cx + 30, 200, 26, 112, 18); ctx.fill();
      ctx.fillStyle = gris(0.55); [[-48, 208], [48, 208], [-48, 304], [48, 304]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(cx + a, b, 3, 0, 7); ctx.fill(); });
      // chip die + traces
      ctx.strokeStyle = gris(0.6); ctx.lineWidth = 2; ctx.strokeRect(cx - 14, 450, 28, 28);
      ctx.lineWidth = 1.6; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(cx - 14, 456 + k * 8); ctx.lineTo(cx - 24, 456 + k * 8); ctx.moveTo(cx + 14, 456 + k * 8); ctx.lineTo(cx + 24, 456 + k * 8); ctx.stroke(); }
      // halo: fine radiating hatching on the gold ring
      ctx.strokeStyle = gris(0.28); ctx.lineWidth = 1.2;
      for (let k = 0; k < 72; k++) { const a = k / 72 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 128, hy + Math.sin(a) * 128); ctx.lineTo(cx + Math.cos(a) * 146, hy + Math.sin(a) * 146); ctx.stroke(); }
      // lancet quarries: little painted fleurons
      ctx.strokeStyle = gris(0.35); ctx.lineWidth = 1.4;
      for (let y = 300; y < 620; y += 40) [200, 1080].forEach((x) => { if (Math.abs(y - 420) < 40) return; ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y); ctx.moveTo(x, y - 7); ctx.lineTo(x, y + 7); ctx.stroke(); });
      // banner text
      ctx.fillStyle = gris(0.92); ctx.font = '400 38px "UnifrakturMaguntia"'; ctx.textAlign = 'center';
      ctx.save(); ctx.translate(cx, 636); ctx.rotate(0); ctx.fillText('In Silico Veritas', 0, 0); ctx.restore();
      ctx.restore();

      // ---------- 6. light: bloom, chip pulse, rays, dust ----------
      const glass = H.layer(W, H_), gx_ = glass.getContext('2d');
      gx_.filter = 'blur(16px)'; gx_.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, W, H_); gx_.filter = 'none';
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.45; ctx.drawImage(glass, 0, 0); ctx.restore();
      const pulse = (0.6 + 0.4 * Math.sin(t * 3)) * H.smooth(0.15, 0.6, t);
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const cg = ctx.createRadialGradient(cx, 464, 4, cx, 464, 90); cg.addColorStop(0, `rgba(255,236,170,${0.75 * pulse})`); cg.addColorStop(1, 'rgba(255,200,100,0)');
      ctx.fillStyle = cg; ctx.fillRect(cx - 100, 370, 200, 200);
      // shafts of light falling from the window into the dusty nave
      const rays = [[470, 0.12, [255, 214, 140]], [560, 0.15, [150, 170, 255]], [640, 0.16, [255, 200, 120]], [730, 0.13, [255, 150, 160]], [830, 0.12, [190, 255, 200]]];
      const rayL = H.smooth(2.3, 3.6, t);
      ctx.filter = 'blur(6px)'; ctx.globalAlpha = rayL;
      rays.forEach(([sx, a, c], k) => {
        const drift = Math.sin(t * 0.4 + k) * 14;
        const g = ctx.createLinearGradient(sx, 200, sx + 520, 760);
        g.addColorStop(0, H.rgba(c, a * 1.6)); g.addColorStop(0.6, H.rgba(c, a * 0.6)); g.addColorStop(1, H.rgba(c, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx - 30, 200); ctx.lineTo(sx + 40, 200); ctx.lineTo(sx + 600 + drift, 760); ctx.lineTo(sx + 430 + drift, 760); ctx.closePath(); ctx.fill();
      });
      ctx.filter = 'none';
      const dr = H.rng(3);
      for (let k = 0; k < 140; k++) {
        const x = dr.range(560, 1280) + Math.sin(t * 0.5 + k) * 8, y = (dr.range(200, 720) - t * 6 * (0.5 + dr())) % 720;
        ctx.fillStyle = `rgba(255,240,210,${dr.range(0.15, 0.5) * rayL})`; ctx.beginPath(); ctx.arc(x, y < 200 ? y + 520 : y, dr.range(0.6, 1.6), 0, 7); ctx.fill();
      }
      ctx.restore();
      H.vignette(ctx, W, H_, 0.55, '10,6,4');
      H.grain(ctx, W, H_, 0.035, 12);
    }
  });
}
```
