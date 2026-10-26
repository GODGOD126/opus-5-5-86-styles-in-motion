I want an animated explainer made in the "Oscilloscope Vector Art" visual style (Retro Digital). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Inter, Space Grotesk
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Space+Grotesk:wght@400;700&display=block">
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
Name: Oscilloscope Vector Art
Family: Retro Digital
Look: Oscilloscope-music XY art on an analogue lab scope: one P31 green beam draws everything, bright where it slows at turns and dim on fast retrace lines, with bloom and halation behind an internal 8x10 graticule, framed by a moulded CRT bezel and a knobbed instrument front panel.
Motion: Power-on: the dot blooms, the timebase pulls it into a sine sweep, the X-Y button snaps in and the waveform folds into a circle that winds itself into a spinning spiral-sphere while the beam writes the vector text.
How it explains: Everything is drawn by one scope beam: transitions are the instrument's own (picture collapses to a dot and re-expands, X gain to zero then the timebase sweep, Y gain to zero back to X-Y), arrows and Hershey-style labels are beam strokes, counters are redrawn vector numerals, and the wrong guess shudders amber while the 97% flares the bloom.

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

REFERENCE STYLE SOURCE (styles/oscilloscope.js; W/H_ are always 1280x720)
```js
{
  // ================= Oscilloscope Vector Art: XY-mode beam on an analogue lab scope =================
  // One P31 beam draws everything: brightness ~ 1/beam speed (bright dwell dots at corners and turns, dim fast
  // retrace lines between figures), bloom + halation, internal 8x10 graticule, a lab instrument front panel.

  // ---------- geometry ----------
  const GX = 54, GY = 40, DIV = 80, GW = 800, GH = 640, CX = GX + GW / 2, CY = GY + GH / 2;
  const GL = { x: 28, y: 22, w: 852, h: 676, r: 58 };
  const P31 = [125, 255, 74], AMBER = [255, 170, 46], RED = [255, 84, 46];

  // ---------- Hershey-style stroke font (cap height 10 units, y down) ----------
  const arc = (cx, cy, rx, ry, a0, a1, n) => {
    n = n || Math.max(6, Math.ceil(Math.abs(a1 - a0) / 9)); const o = [];
    for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; o.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    return o;
  };
  const G = {
    A: [[[0, 10], [3.6, 0], [7.2, 10]], [[1.35, 6.4], [5.85, 6.4]]],
    B: [[[0, 10], [0, 0], [4, 0], ...arc(4, 2.5, 2.6, 2.5, -90, 90), [0, 5]], [[0, 5], [4.3, 5], ...arc(4.3, 7.5, 2.8, 2.5, -90, 90), [0, 10]]],
    C: [arc(4, 5, 4, 5, -35, -325)],
    D: [[[0, 0], [0, 10], [2.8, 10], ...arc(2.8, 5, 4.2, 5, 90, -90), [0, 0]]],
    E: [[[6.4, 0], [0, 0], [0, 10], [6.4, 10]], [[0, 5], [4.4, 5]]],
    F: [[[6.4, 0], [0, 0], [0, 10]], [[0, 5], [4.4, 5]]],
    G: [[...arc(4, 5, 4, 5, -35, -360), [4.4, 5]]],
    H: [[[0, 0], [0, 10]], [[7, 0], [7, 10]], [[0, 5], [7, 5]]],
    I: [[[0, 0], [0, 10]]],
    J: [[[5, 0], [5, 7.2], ...arc(2.5, 7.2, 2.5, 2.8, 0, 180)]],
    K: [[[0, 0], [0, 10]], [[6.8, 0], [0, 6.6]], [[2.4, 4.2], [7, 10]]],
    L: [[[0, 0], [0, 10], [6, 10]]],
    M: [[[0, 10], [0, 0], [4.2, 10], [8.4, 0], [8.4, 10]]],
    N: [[[0, 10], [0, 0], [7, 10], [7, 0]]],
    O: [arc(4, 5, 4, 5, -90, 270)],
    P: [[[0, 10], [0, 0], [4, 0], ...arc(4, 2.75, 2.8, 2.75, -90, 90), [0, 5.5]]],
    Q: [arc(4, 5, 4, 5, -90, 270), [[4.6, 7], [8.2, 10.6]]],
    R: [[[0, 10], [0, 0], [4, 0], ...arc(4, 2.75, 2.8, 2.75, -90, 90), [0, 5.5]], [[3.6, 5.5], [7, 10]]],
    S: [[...arc(3.5, 2.55, 3.4, 2.55, -25, -270), ...arc(3.5, 7.5, 3.6, 2.5, -90, 155)]],
    T: [[[0, 0], [7.2, 0]], [[3.6, 0], [3.6, 10]]],
    U: [[[0, 0], [0, 6.4], ...arc(3.5, 6.4, 3.5, 3.6, 180, 0), [7, 0]]],
    V: [[[0, 0], [3.6, 10], [7.2, 0]]],
    W: [[[0, 0], [2.4, 10], [4.8, 0], [7.2, 10], [9.6, 0]]],
    X: [[[0, 0], [7, 10]], [[7, 0], [0, 10]]],
    Y: [[[0, 0], [3.6, 5], [7.2, 0]], [[3.6, 5], [3.6, 10]]],
    Z: [[[0, 0], [7, 0], [0, 10], [7, 10]]],
    0: [arc(3.5, 5, 3.5, 5, -90, 270)],
    1: [[[1, 2], [3.4, 0], [3.4, 10]]],
    2: [[...arc(3.5, 3, 3.5, 3, -165, 15), [0, 10], [7, 10]]],
    3: [[...arc(3.4, 2.6, 3.2, 2.6, -160, 90), ...arc(3.4, 7.5, 3.6, 2.5, -90, 160)]],
    4: [[[5.4, 10], [5.4, 0], [0, 7], [7.4, 7]]],
    5: [[[6.4, 0], [1, 0], [0.5, 4.6], ...arc(3.5, 6.9, 3.5, 3.1, -140, 155)]],
    6: [[...arc(3.8, 5, 3.8, 5, -55, -270), ...arc(3.6, 7.1, 3.5, 2.9, 90, -270)]],
    7: [[[0, 0], [7, 0], [2.4, 10]]],
    8: [arc(3.5, 2.5, 3, 2.5, 90, 450), arc(3.5, 7.4, 3.5, 2.6, -90, 270)],
    9: [[...arc(3.4, 3, 3.4, 3, 0, 360), ...arc(3.2, 5, 3.6, 5, 0, 125)]],
    '?': [[...arc(3, 2.6, 3, 2.6, -165, 60), [3, 6.6], [3, 7.4]], [[3, 9.5], [3, 10]]],
    '%': [[[0, 10], [8, 0]], arc(1.6, 1.8, 1.6, 1.8, 0, 360), arc(6.4, 8.2, 1.6, 1.8, 0, 360)],
    '.': [[[0.4, 9.4], [0.4, 10]]],
    ',': [[[0.8, 9.4], [0.8, 10.2], [0, 11.8]]],
    ':': [[[0.4, 3.4], [0.4, 4]], [[0.4, 9.4], [0.4, 10]]],
    '-': [[[0, 5.5], [5, 5.5]]],
    "'": [[[0.5, 0], [0.5, 3]]],
    '/': [[[0, 10], [6, 0]]],
    '>': [[[0, 5], [9, 5]], [[5.6, 1.8], [9, 5], [5.6, 8.2]]],
    '#': [[[0, 5.8], [2.8, 9.6], [8.4, 0]]],
    '+': [[[3.5, 2], [3.5, 8]], [[0.5, 5], [6.5, 5]]],
  };
  const GWID = {}; for (const k in G) GWID[k] = Math.max(...G[k].flat().map((p) => p[0]));
  const ADV = 3.4, SPACE = 5.5;
  const textW = (str, cap) => { const u = cap / 10; let w = 0; for (const ch of str) w += ch === ' ' ? SPACE : (GWID[ch] == null ? 5 : GWID[ch] + ADV); return (w - ADV) * u; };
  const textStrokes = (str, x, y, cap) => {
    const u = cap / 10, out = []; let px = x;
    for (const ch of str) {
      if (ch === ' ') { px += SPACE * u; continue; }
      const g = G[ch]; if (!g) { px += 5 * u; continue; }
      for (const s of g) out.push(s.map(([gx, gy]) => [px + gx * u, y + gy * u]));
      px += (GWID[ch] + ADV) * u;
    }
    return out;
  };

  // ---------- beam buffer ----------
  let B = null, XF = null, GA = 1;
  const resetBeam = () => { B = { lines: [], segs: [], dots: [] }; XF = null; GA = 1; };
  const plen = (p) => { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; };
  const cutLen = (p, len) => {
    const o = [p[0]];
    for (let i = 1; i < p.length; i++) {
      const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
      if (d >= len) { const k = d ? len / d : 0; o.push([p[i - 1][0] + (p[i][0] - p[i - 1][0]) * k, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * k, p[i][2]]); return o; }
      o.push(p[i]); len -= d;
    }
    return o;
  };
  const tailOf = (p, len) => { const L = plen(p); if (L <= len) return p; const r = p.slice().reverse(); return cutLen(r, len).reverse(); };
  // emit strokes: o = { f (0..1 traced), a, col, w, timed (brightness ~ 1/speed), xf, retrace, head, dots }
  function beam(strokes, o = {}) {
    const a = (o.a == null ? 1 : o.a) * GA; if (a < 0.004) return;
    const f = o.f == null ? 1 : o.f; if (f <= 0 || !strokes.length) return;
    const col = o.col || P31, w = o.w || 2.2;
    const tf = (p) => { let q = o.xf ? o.xf(p) : p; if (XF) q = XF(q); return q.length > 2 || p[2] == null ? q : [q[0], q[1], p[2]]; };
    const lens = strokes.map(plen), total = lens.reduce((s, v) => s + v, 0);
    let left = total * f, prev = null, last = null;
    for (let k = 0; k < strokes.length && left > 0; k++) {
      let s = strokes[k]; if (s.length < 2) continue;
      if (lens[k] > left) s = cutLen(s, left);
      left -= lens[k];
      const pts = s.map(tf);
      if (o.retrace !== false && prev) B.lines.push({ pts: [prev, pts[0]], a: a * 0.09, col, w: Math.max(1, w * 0.45) });
      if (o.timed) {
        let m = 0; const n = pts.length - 1; for (let i = 1; i <= n; i++) m += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); m /= Math.max(1, n);
        const buckets = [];
        for (let i = 1; i <= n; i++) {
          const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) + 0.01;
          let fac = H.clamp(Math.pow(m / L, 0.65), 0.3, 2.2) * (pts[i][2] == null ? 1 : pts[i][2]);
          const lv = Math.max(0, Math.min(9, Math.round((fac - 0.3) / 0.21)));
          (buckets[lv] = buckets[lv] || []).push(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]);
        }
        buckets.forEach((arr, lv) => { if (arr) { const fac = 0.3 + lv * 0.21; B.segs.push({ arr, a: a * Math.min(1, fac), col, w: w * (0.75 + 0.22 * fac), hot: fac > 1.2 ? (fac - 1.2) * 0.5 * a : 0 }); } });
      } else {
        const L = lens[k] / Math.max(1, s.length - 1);
        const sp = H.clamp(1.18 - L / 520, 0.62, 1.08);
        B.lines.push({ pts, a: a * sp, col, w });
        if (o.dots !== false && pts.length < 40) {
          const dA = a * 0.55;
          B.dots.push({ x: pts[0][0], y: pts[0][1], a: dA, r: w * 0.95, col });
          B.dots.push({ x: pts[pts.length - 1][0], y: pts[pts.length - 1][1], a: dA, r: w * 0.95, col });
          for (let i = 1; i < pts.length - 1; i++) {
            const a1 = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]), a2 = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]);
            let d = Math.abs(a2 - a1); if (d > Math.PI) d = 2 * Math.PI - d;
            if (d > 0.85) B.dots.push({ x: pts[i][0], y: pts[i][1], a: dA * 1.1, r: w * 1.05, col });
          }
        }
      }
      prev = pts[pts.length - 1]; last = pts;
    }
    if (f < 1 && last && o.head !== false) {
      const tl = tailOf(last, 60);
      if (tl.length > 1) B.lines.push({ pts: tl, a: Math.min(1, a * 0.8), col, w: w * 1.5 });
      const h = last[last.length - 1];
      B.dots.push({ x: h[0], y: h[1], a: Math.min(1, a * 1.3), r: w * 2.3, col, hot: 1 });
    }
  }
  const dot = (x, y, r, a, col = P31) => { let p = [x, y]; if (XF) p = XF(p); B.dots.push({ x: p[0], y: p[1], r, a: a * GA, col, hot: 1 }); };
  const text = (str, x, y, cap, o = {}) => {
    const w = textW(str, cap), x0 = o.align === 'c' ? x - w / 2 : o.align === 'r' ? x - w : x;
    beam(textStrokes(str, x0, y, cap), Object.assign({ w: H.clamp(cap * 0.068, 2.1, 5.2) }, o));
    return w;
  };
  const curve = (fn, n) => { const o = []; for (let i = 0; i <= n; i++) o.push(fn(i / n)); return o; };
  const ring = (cx, cy, rx, ry, n = 28) => curve((u) => [cx + rx * Math.cos(u * 6.2832), cy + ry * Math.sin(u * 6.2832)], n);
  const arrowS = (x1, y1, x2, y2, hs = 15) => { const an = Math.atan2(y2 - y1, x2 - x1); return [[[x1, y1], [x2, y2]], [[x2 + Math.cos(an + 2.55) * hs, y2 + Math.sin(an + 2.55) * hs], [x2, y2], [x2 + Math.cos(an - 2.55) * hs, y2 + Math.sin(an - 2.55) * hs]]]; };
  const catmull = (P, seg = 6) => {
    const o = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < seg; k++) {
        const t = k / seg, t2 = t * t, t3 = t2 * t;
        o.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
      }
    }
    o.push(P[P.length - 1]); return o;
  };

  // ---------- beam figures (unit-size, y down) ----------
  const tx = (S, x, y, s) => S.map((st) => st.map(([px, py]) => [x + px * s, y + py * s]));
  const CAT = (() => {
    const head = [[0.82, -0.39], ...arc(0, 0.1, 1, 0.85, -35, 215, 34), [-0.86, -1.18], [-0.34, -0.69], ...arc(0, 0.1, 1, 0.85, -110, -70, 4), [0.86, -1.18], [0.82, -0.39]];
    const eyeL = arc(-0.38, -0.02, 0.17, 0.11, 0, 360, 14), eyeR = arc(0.38, -0.02, 0.17, 0.11, 0, 360, 14);
    return [head, eyeL, [[-0.38, -0.12], [-0.38, 0.08]], eyeR, [[0.38, -0.12], [0.38, 0.08]],
      [[-0.1, 0.25], [0.1, 0.25], [0, 0.37], [-0.1, 0.25]], [[0, 0.37], [0, 0.44], ...arc(-0.12, 0.44, 0.12, 0.11, 0, 165, 8)], arc(0.12, 0.44, 0.12, 0.11, 180, 15, 8),
      [[-0.36, 0.3], [-1.28, 0.14]], [[-0.36, 0.36], [-1.3, 0.38]], [[0.36, 0.3], [1.28, 0.14]], [[0.36, 0.36], [1.3, 0.38]]];
  })();
  const DOG = (() => {
    const head = arc(0, 0.05, 0.74, 0.86, -90, 270, 34);
    const earL = catmull([[-0.5, -0.66], [-0.92, -0.74], [-1.22, -0.42], [-1.2, 0.18], [-0.98, 0.5], [-0.78, 0.3], [-0.72, -0.15]]);
    const earR = earL.map(([x, y]) => [-x, y]);
    const nose = []; for (let i = 0; i <= 40; i++) { const u = i / 40, a = u * 6.2832 * 3.2, r = 1 - u * 0.75; nose.push([Math.cos(a) * 0.15 * r, 0.3 + Math.sin(a) * 0.09 * r]); }
    return [head, earL, earR, arc(-0.3, -0.14, 0.09, 0.09, 0, 360, 10), arc(0.3, -0.14, 0.09, 0.09, 0, 360, 10), arc(0, 0.42, 0.36, 0.26, 200, 340, 12), nose,
      [[0, 0.39], [0, 0.52], ...arc(-0.13, 0.52, 0.13, 0.1, 0, 165, 8)], arc(0.13, 0.52, 0.13, 0.1, 180, 15, 8), [[-0.09, 0.6], ...arc(0, 0.62, 0.09, 0.12, 180, 0, 8)]];
  })();

  // neural net wireframe: 3-4-2 nodes in 3D, rotates about Y
  const LAY = [3, 4, 2];
  function netGeo(cx, cy, w, h, rot) {
    const nodes = [];
    LAY.forEach((n, l) => { for (let k = 0; k < n; k++) {
      const x = (l - 1) * w / 2, y = (k - (n - 1) / 2) * h / 3.6, z = (k % 2 ? 1 : -1) * w * 0.12 + (l - 1) * w * 0.05;
      const xr = x * Math.cos(rot) - z * Math.sin(rot), zr = x * Math.sin(rot) + z * Math.cos(rot), p = 1 / (1 + zr / (w * 3.2));
      nodes.push({ x: cx + xr * p, y: cy + y * p, s: p, l });
    } });
    const edges = []; let base = 0;
    for (let l = 0; l < LAY.length - 1; l++) { for (let i = 0; i < LAY[l]; i++) for (let j = 0; j < LAY[l + 1]; j++) edges.push([base + i, base + LAY[l] + j, l]); base += LAY[l]; }
    return { nodes, edges };
  }
  const W0 = (() => { const r = H.rng(5); return Array.from({ length: 20 }, () => r.range(0.25, 1)); })();
  const W1 = (() => { const r = H.rng(9); return Array.from({ length: 20 }, () => r.range(0.25, 1)); })();
  // o: { f, a, wk (0..1 blend W0->W1), act[] node flash, bp(l) backprop amber per layer, nodeR }
  function net(cx, cy, w, h, rot, o = {}) {
    const g = netGeo(cx, cy, w, h, rot), f = o.f == null ? 1 : o.f, a = o.a == null ? 1 : o.a, R = o.nodeR || 12;
    g.edges.forEach(([i, j, l], e) => {
      const A = g.nodes[i], Bn = g.nodes[j], wt = H.lerp(W0[e], W1[e], o.wk || 0);
      const amb = o.bp ? o.bp(l) : 0, col = amb > 0 ? H.mix(P31, AMBER, amb) : P31;
      const dx = Bn.x - A.x, dy = Bn.y - A.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      beam([[[A.x + ux * R * A.s, A.y + uy * R * A.s], [Bn.x - ux * R * Bn.s, Bn.y - uy * R * Bn.s]]], { f: H.clamp(f * 1.6 - 0.25 - e * 0.012), a: a * (0.3 + 0.7 * wt) * (1 + amb * 0.5), col, w: 1.2 + wt * 1.5, dots: false, retrace: false });
    });
    g.nodes.forEach((n, i) => {
      const fl = o.act ? o.act(n.l) : 0;
      beam([ring(n.x, n.y, R * n.s, R * n.s, 18)], { f: H.clamp(f * 1.3 - i * 0.03), a: a * (0.9 + fl), w: 2.4, col: o.nodeCol ? o.nodeCol(n.l) : P31, dots: false });
      if (fl > 0.05) dot(n.x, n.y, R * 0.7 * n.s, Math.min(1, fl) * a);
    });
    return g;
  }

  // spiral-wound sphere (one continuous beam), e = latitude extent 0..1, returns timed points
  function sphere(cx, cy, R, spin, tilt, e, wob, n = 1500, turns = 22) {
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    return curve((s) => {
      const phi = Math.PI / 2 + (s - 0.5) * Math.PI * e, th = 6.2832 * turns * s + spin;
      const rr = 1 + wob * Math.sin(5 * th - spin * 2 + 3 * phi);
      let x = Math.sin(phi) * Math.cos(th) * rr, y = -Math.cos(phi) * rr, z = Math.sin(phi) * Math.sin(th) * rr;
      const y2 = y * ct - z * st, z2 = y * st + z * ct;
      return [cx + x * R, cy + y2 * R, 0.62 + 0.38 * (z2 + 1) / 2];
    }, n);
  }

  // ---------- cached layers ----------
  const C = {};
  const rrect = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const INK = '#22313f', BLUE = '#3d6688';
  const VD = ['5', '2', '1', '.5', '.2', '.1', '50', '20', '10', '5', '2'];
  const TD = ['X-Y', '.5', '.2', '.1', '50', '20', '10', '5', '2', '1', '.5'];
  const KA = (idx) => (-135 + idx * 27) * Math.PI / 180;
  function lbl(g, s, x, y, size = 11, align = 'center', col = INK, wt = 600) { g.font = `${wt} ${size}px "Inter"`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; if (g.letterSpacing !== undefined) g.letterSpacing = '1px'; g.fillText(s, x, y); if (g.letterSpacing !== undefined) g.letterSpacing = '0px'; }
  function scale(g, x, y, r, labels, mvFrom) {
    labels.forEach((s, i) => {
      const a = KA(i), ca = Math.sin(a), sa = -Math.cos(a);
      g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + ca * (r - 9), y + sa * (r - 9)); g.lineTo(x + ca * (r - 2), y + sa * (r - 2)); g.stroke();
      lbl(g, s, x + ca * (r + 9), y + sa * (r + 9), 10, 'center', mvFrom != null && i >= mvFrom ? BLUE : INK, 700);
    });
  }
  function buildPanel(W, H_) {
    const c = H.layer(W, H_), g = c.getContext('2d');
    // instrument panel: warm light-grey enamel
    const pg = g.createLinearGradient(0, 0, 0, H_); pg.addColorStop(0, '#cdcabf'); pg.addColorStop(1, '#b3b0a5');
    g.fillStyle = pg; g.fillRect(0, 0, W, H_);
    const r = H.rng(31);
    for (let i = 0; i < 14000; i++) { const v = r() < 0.5 ? 0 : 255; g.fillStyle = `rgba(${v},${v},${v},${0.035 + r() * 0.03})`; g.fillRect(r() * W, r() * H_, 1 + r(), 1 + r()); }
    // CRT bezel: dark moulded plastic around the glass
    g.save(); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
    rrect(g, 6, 4, 890, 712, 34); const bg = g.createLinearGradient(0, 0, 0, 720); bg.addColorStop(0, '#2e3032'); bg.addColorStop(1, '#151617'); g.fillStyle = bg; g.fill(); g.restore();
    rrect(g, 6.5, 4.5, 889, 711, 34); g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1; g.stroke();
    // stepped inner lip
    rrect(g, GL.x - 10, GL.y - 10, GL.w + 20, GL.h + 20, GL.r + 8); g.fillStyle = '#0b0c0c'; g.fill();
    rrect(g, GL.x - 10, GL.y - 10, GL.w + 20, GL.h + 20, GL.r + 8); g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 1.5; g.stroke();
    // bezel screws
    [[18, 16], [884, 16], [18, 704], [884, 704]].forEach(([x, y]) => {
      const sg = g.createRadialGradient(x - 2, y - 2, 1, x, y, 7); sg.addColorStop(0, '#d8d8d4'); sg.addColorStop(1, '#5c5c58');
      g.fillStyle = sg; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); g.strokeStyle = '#2a2a28'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - 4, y - 2); g.lineTo(x + 4, y + 2); g.stroke();
    });
    // ---- right-hand front panel
    const X0 = 902;
    g.font = '700 30px "Space Grotesk"'; g.fillStyle = INK; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('XY-2', 920, 58);
    lbl(g, 'OSCILLOGRAPH', 1012, 40, 12, 'left', INK, 800); lbl(g, 'DUAL TRACE  ·  20 MHz', 1012, 60, 10, 'left', BLUE, 600);
    g.fillStyle = BLUE; g.fillRect(916, 74, 350, 3);
    // row 1 labels
    lbl(g, 'INTENSITY', 944, 160, 9); lbl(g, 'FOCUS', 1012, 160, 9); lbl(g, 'BEAM FIND', 1080, 160, 9); lbl(g, 'POWER', 1172, 160, 9);
    // vertical section
    g.strokeStyle = BLUE; g.lineWidth = 1.6; rrect(g, 914, 184, 356, 232, 8); g.stroke();
    g.fillStyle = '#c4c1b6'; g.fillRect(1040, 176, 104, 16); lbl(g, 'VERTICAL', 1092, 184, 11, 'center', BLUE, 800);
    scale(g, 986, 296, 58, VD, 6); scale(g, 1198, 296, 58, VD, 6);
    lbl(g, 'VOLTS/DIV', 1092, 296, 10, 'center', INK, 800); lbl(g, 'mV', 1092, 316, 10, 'center', BLUE, 700);
    lbl(g, 'CH 1  ·  X', 986, 394, 11, 'center', INK, 800); lbl(g, 'CH 2  ·  Y', 1198, 394, 11, 'center', INK, 800);
    // horizontal section
    g.strokeStyle = BLUE; rrect(g, 914, 432, 356, 182, 8); g.stroke();
    g.fillStyle = '#bebbb0'; g.fillRect(1030, 424, 124, 16); lbl(g, 'HORIZONTAL', 1092, 432, 11, 'center', BLUE, 800);
    scale(g, 1004, 524, 58, TD, 4); lbl(g, 'TIME/DIV', 1004, 600, 10, 'center', INK, 800);
    lbl(g, 'MODE', 1186, 456, 10, 'center', INK, 800);
    lbl(g, 'X-Y', 1150, 482, 10, 'right', INK, 800); lbl(g, 'ALT', 1150, 522, 10, 'right', INK, 800); lbl(g, 'CHOP', 1150, 562, 10, 'right', INK, 800);
    // inputs
    lbl(g, 'CH 1 OR X', 960, 634, 9); lbl(g, 'CH 2 OR Y', 1060, 634, 9); lbl(g, 'EXT TRIG', 1160, 634, 9); lbl(g, 'CAL .5V', 1242, 634, 9);
    lbl(g, '1MΩ 20pF   400V PK MAX', 1060, 706, 8, 'center', BLUE, 600);
    [960, 1060, 1160].forEach((x) => {
      const y = 666; g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 6; g.shadowOffsetY = 3;
      g.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.5; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * 21, y + Math.sin(a) * 21); } g.closePath();
      const ng = g.createLinearGradient(x - 20, y - 20, x + 20, y + 20); ng.addColorStop(0, '#e9e9e4'); ng.addColorStop(1, '#7d7d78'); g.fillStyle = ng; g.fill(); g.restore();
      const cg = g.createRadialGradient(x - 4, y - 4, 2, x, y, 15); cg.addColorStop(0, '#f2f2ee'); cg.addColorStop(1, '#8c8c87'); g.fillStyle = cg; g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill();
      g.fillStyle = '#1c1c1b'; g.beginPath(); g.arc(x, y, 8.5, 0, 7); g.fill(); g.fillStyle = '#d8b25a'; g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill();
      g.fillStyle = '#b8b8b2'; [[-15, 0], [15, 0]].forEach(([dx]) => { g.beginPath(); g.arc(x + dx, y, 3, 0, 7); g.fill(); });
    });
    g.fillStyle = '#9a9a94'; g.beginPath(); g.arc(1242, 666, 9, 0, 7); g.fill(); g.strokeStyle = '#d8d8d0'; g.lineWidth = 3; g.beginPath(); g.arc(1242, 656, 7, Math.PI, 0); g.stroke();
    // panel edge lighting + seam between bezel and panel
    const sh = g.createLinearGradient(896, 0, 930, 0); sh.addColorStop(0, 'rgba(0,0,0,0.25)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(896, 0, 34, H_);
    return c;
  }
  function buildGlass(W, H_) {
    const c = H.layer(W, H_), g = c.getContext('2d');
    const rg = g.createRadialGradient(CX, CY, 60, CX, CY, 560); rg.addColorStop(0, '#111a14'); rg.addColorStop(0.7, '#0a100c'); rg.addColorStop(1, '#040605');
    rrect(g, GL.x, GL.y, GL.w, GL.h, GL.r); g.fillStyle = rg; g.fill();
    const r = H.rng(77);
    for (let i = 0; i < 26000; i++) { g.fillStyle = `rgba(150,190,150,${r() * 0.05})`; g.fillRect(GL.x + r() * GL.w, GL.y + r() * GL.h, 1, 1); }
    return c;
  }
  function buildGrat(W, H_) {
    const c = H.layer(W, H_), g = c.getContext('2d');
    g.strokeStyle = 'rgba(170,205,180,0.22)'; g.lineWidth = 1;
    for (let i = 0; i <= 10; i++) { g.beginPath(); g.moveTo(GX + i * DIV + 0.5, GY); g.lineTo(GX + i * DIV + 0.5, GY + GH); g.stroke(); }
    for (let j = 0; j <= 8; j++) { g.beginPath(); g.moveTo(GX, GY + j * DIV + 0.5); g.lineTo(GX + GW, GY + j * DIV + 0.5); g.stroke(); }
    g.strokeStyle = 'rgba(170,205,180,0.34)';
    for (let i = 0; i <= 50; i++) { const x = GX + i * DIV / 5 + 0.5, l = i % 5 ? 5 : 0; if (l) { g.beginPath(); g.moveTo(x, CY - l); g.lineTo(x, CY + l); g.stroke(); } }
    for (let j = 0; j <= 40; j++) { const y = GY + j * DIV / 5 + 0.5, l = j % 5 ? 5 : 0; if (l) { g.beginPath(); g.moveTo(CX - l, y); g.lineTo(CX + l, y); g.stroke(); } }
    // 0% / 10% / 90% / 100% rise-time marks
    g.setLineDash([2, 4]); g.strokeStyle = 'rgba(170,205,180,0.26)';
    [CY - 2.5 * DIV, CY + 2.5 * DIV, CY - 2 * DIV, CY + 2 * DIV].forEach((y) => { g.beginPath(); g.moveTo(GX, y + 0.5); g.lineTo(GX + GW, y + 0.5); g.stroke(); });
    g.setLineDash([]);
    g.font = '600 10px "Inter"'; g.fillStyle = 'rgba(170,205,180,0.4)'; g.textAlign = 'left'; g.textBaseline = 'middle';
    [['100', CY - 2.5 * DIV], ['90', CY - 2 * DIV], ['10', CY + 2 * DIV], ['0%', CY + 2.5 * DIV]].forEach(([s, y]) => g.fillText(s, GX + 4, y - 7));
    return c;
  }
  function buildRefl(W, H_) {
    const c = H.layer(W, H_), g = c.getContext('2d');
    rrect(g, GL.x, GL.y, GL.w, GL.h, GL.r); g.save(); g.clip();
    // curved-faceplate edge darkening
    const ed = g.createRadialGradient(CX, CY, 300, CX, CY, 600); ed.addColorStop(0, 'rgba(0,0,0,0)'); ed.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = ed; g.fillRect(0, 0, W, H_);
    // soft window reflection across the upper left of the glass
    const rf = g.createLinearGradient(GL.x, GL.y, GL.x + 520, GL.y + 380); rf.addColorStop(0, 'rgba(220,235,255,0.075)'); rf.addColorStop(0.45, 'rgba(220,235,255,0.025)'); rf.addColorStop(0.5, 'rgba(220,235,255,0)');
    g.fillStyle = rf; g.beginPath(); g.moveTo(GL.x, GL.y); g.lineTo(GL.x + 640, GL.y); g.lineTo(GL.x, GL.y + 470); g.fill();
    g.restore();
    rrect(g, GL.x + 1, GL.y + 1, GL.w - 2, GL.h - 2, GL.r); g.strokeStyle = 'rgba(200,230,210,0.10)'; g.lineWidth = 2; g.stroke();
    return c;
  }
  const get = (k, fn, W, H_) => C[k] || (C[k] = fn(W, H_));

  // ---------- dynamic panel parts ----------
  function knob(g, x, y, r, ang, skirt) {
    const sh = g.createRadialGradient(x + 3, y + 6, r * 0.6, x + 3, y + 6, r * (skirt ? 1.5 : 1.35)); sh.addColorStop(0, 'rgba(0,0,0,0.45)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sh; g.beginPath(); g.arc(x + 3, y + 6, r * (skirt ? 1.5 : 1.35), 0, 7); g.fill();
    const sx = Math.sin(ang), sy = -Math.cos(ang);
    if (skirt) {
      const kg = g.createRadialGradient(x - r * 0.4, y - r * 0.5, 2, x, y, r * 1.3); kg.addColorStop(0, '#4a4b4c'); kg.addColorStop(1, '#151515');
      g.fillStyle = kg; g.beginPath(); g.arc(x, y, r * 1.28, 0, 7); g.fill();
      g.fillStyle = '#f0efe8'; g.beginPath(); g.moveTo(x + sx * r * 1.26, y + sy * r * 1.26); g.lineTo(x + sx * r * 1.05 + sy * 4, y + sy * r * 1.05 - sx * 4); g.lineTo(x + sx * r * 1.05 - sy * 4, y + sy * r * 1.05 + sx * 4); g.fill();
    }
    const bg = g.createRadialGradient(x - r * 0.35, y - r * 0.45, 1, x, y, r); bg.addColorStop(0, '#3e3e3e'); bg.addColorStop(1, '#0c0c0c');
    g.fillStyle = bg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.13)'; g.lineWidth = 1;
    for (let i = 0; i < 40; i++) { const a = ang + i * Math.PI / 20; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86); g.lineTo(x + Math.cos(a) * r * 0.99, y + Math.sin(a) * r * 0.99); g.stroke(); }
    const cg = g.createLinearGradient(x - r, y - r, x + r * 0.6, y + r * 0.6); cg.addColorStop(0, '#f4f4f0'); cg.addColorStop(1, '#8e8e8a');
    g.fillStyle = cg; g.beginPath(); g.arc(x, y, r * 0.6, 0, 7); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.08)'; for (let k = 2; k < 8; k++) { g.beginPath(); g.arc(x, y, r * 0.075 * k, 0, 7); g.stroke(); }
    g.strokeStyle = '#fbfbf6'; g.lineWidth = Math.max(2, r * 0.08); g.lineCap = 'round';
    g.beginPath(); g.moveTo(x + sx * r * 0.62, y + sy * r * 0.62); g.lineTo(x + sx * r * 0.93, y + sy * r * 0.93); g.stroke();
    g.strokeStyle = '#2a2a2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + sx * r * 0.1, y + sy * r * 0.1); g.lineTo(x + sx * r * 0.55, y + sy * r * 0.55); g.stroke(); g.lineCap = 'butt';
  }
  function button(g, x, y, pressed) {
    g.fillStyle = 'rgba(0,0,0,0.35)'; rrect(g, x - 17, y - 9, 36, 22, 4); g.fill();
    const bg = g.createLinearGradient(0, y - 11, 0, y + 11); bg.addColorStop(0, pressed ? '#9c9a92' : '#ecebe5'); bg.addColorStop(1, pressed ? '#c9c7bf' : '#a9a79f');
    g.fillStyle = bg; rrect(g, x - 18, y - (pressed ? 9 : 11), 36, 20, 4); g.fill();
  }
  function led(g, x, y, on, col) {
    if (on) { const lg = g.createRadialGradient(x, y, 0, x, y, 16); lg.addColorStop(0, H.rgba(col, 0.9)); lg.addColorStop(0.3, H.rgba(col, 0.35)); lg.addColorStop(1, H.rgba(col, 0)); g.fillStyle = lg; g.beginPath(); g.arc(x, y, 16, 0, 7); g.fill(); }
    g.fillStyle = on ? H.rgba(H.mix(col, [255, 255, 255], 0.5), 1) : '#3b2a22'; g.beginPath(); g.arc(x, y, 4.5, 0, 7); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1; g.stroke();
  }
  function panelLive(g, st) {
    const k = st.kn;
    knob(g, 944, 128, 17, (k.inten * 270 - 135) * Math.PI / 180, false);
    knob(g, 1012, 128, 17, 0.3, false);
    button(g, 1080, 128, false);
    button(g, 1172, 128, st.power > 0);
    led(g, 1222, 128, st.power > 0.5, [255, 140, 40]);
    knob(g, 986, 296, 34, k.ch1, true);
    knob(g, 1198, 296, 34, k.ch2, true);
    knob(g, 1004, 524, 34, k.tdiv, true);
    button(g, 1186, 482, st.xy); led(g, 1232, 482, st.xy && st.power > 0.5, [120, 255, 90]);
    button(g, 1186, 522, !st.xy); led(g, 1232, 522, !st.xy && st.power > 0.5, [120, 255, 90]);
    button(g, 1186, 562, false); led(g, 1232, 562, false, [120, 255, 90]);
  }
  const snapKnob = (t, changes, idx0) => { // changes: [[time, idx]] -> angle with a quick detent snap
    let a = KA(idx0);
    for (const [tc, idx] of changes) { if (t < tc) break; const prev = a, p = H.clamp((t - tc) / 0.12); a = H.lerp(prev, KA(idx), H.ease.back(p)); }
    return a;
  };

  // ---------- frame render ----------
  const L = {};
  const lay = (k, w, h) => L[k] || (L[k] = H.layer(w, h));
  function renderFrame(ctx, W, H_, st) {
    ctx.drawImage(get('panel', buildPanel, W, H_), 0, 0);
    panelLive(ctx, st);
    // beam layer
    const bl = lay('beam', W, H_), b = bl.getContext('2d');
    b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over'; b.clearRect(0, 0, W, H_);
    b.globalCompositeOperation = 'lighter'; b.lineCap = 'round'; b.lineJoin = 'round';
    const I = st.inten;
    // phosphor core colour. Thin traces read white-green; a wide (heavily driven) trace keeps its P31 body and only
    // its centre goes white-hot, so big lettering stays phosphor green instead of flat white.
    const WH = [235, 255, 225];
    const coreOf = (col, hot, w) => H.mix(col, WH, w > 3 ? 0.36 + 0.16 * Math.min(1, hot || 0) : 0.55 + 0.25 * Math.min(1, hot || 0));
    const pathL = (it) => { b.beginPath(); it.pts.forEach((p, i) => (i ? b.lineTo(p[0], p[1]) : b.moveTo(p[0], p[1]))); };
    const pathS = (it) => { b.beginPath(); const A = it.arr; for (let i = 0; i < A.length; i += 4) { b.moveTo(A[i], A[i + 1]); b.lineTo(A[i + 2], A[i + 3]); } };
    const strokeAll = (pass) => {
      for (const it of B.lines) {
        const a = Math.min(1, it.a * I); if (a < 0.003) continue;
        b.strokeStyle = pass ? H.rgba(coreOf(it.col, 0, it.w), a) : H.rgba(it.col, a * 0.2); b.lineWidth = pass ? it.w : it.w * 3.4;
        pathL(it); b.stroke();
        if (pass && it.w > 3) { b.strokeStyle = H.rgba(H.mix(it.col, WH, 0.82), a * 0.75); b.lineWidth = it.w * 0.42; b.stroke(); }
      }
      for (const it of B.segs) {
        const a = Math.min(1, it.a * I); if (a < 0.003) continue;
        b.strokeStyle = pass ? H.rgba(coreOf(it.col, it.hot, it.w), a) : H.rgba(it.col, a * 0.2); b.lineWidth = pass ? it.w : it.w * 3.4;
        pathS(it); b.stroke();
        if (pass && it.w > 3) { b.strokeStyle = H.rgba(H.mix(it.col, WH, 0.82), a * 0.75); b.lineWidth = it.w * 0.42; b.stroke(); }
      }
    };
    strokeAll(0); strokeAll(1);
    for (const d of B.dots) {
      const a = Math.min(1, d.a * I); if (a < 0.01) continue;
      b.fillStyle = H.rgba(d.col, a * 0.28); b.beginPath(); b.arc(d.x, d.y, d.r * 2.4, 0, 7); b.fill();
      // dwell dots on wide lettering: green body with a small white-hot centre (beam head dots stay fully hot)
      if (!d.hot && d.r > 3) {
        b.fillStyle = H.rgba(coreOf(d.col, 0, d.r), a); b.beginPath(); b.arc(d.x, d.y, d.r, 0, 7); b.fill();
        b.fillStyle = H.rgba(H.mix(d.col, WH, 0.85), a * 0.8); b.beginPath(); b.arc(d.x, d.y, d.r * 0.45, 0, 7); b.fill();
      } else { b.fillStyle = H.rgba(coreOf(d.col, 1), a); b.beginPath(); b.arc(d.x, d.y, d.r, 0, 7); b.fill(); }
    }
    // bloom on small buffers
    const s1 = lay('s1', W / 2, H_ / 2), g1 = s1.getContext('2d'), s2 = lay('s2', W / 4, H_ / 4), g2 = s2.getContext('2d');
    g1.globalCompositeOperation = 'source-over'; g1.clearRect(0, 0, W / 2, H_ / 2); g1.filter = 'blur(3px)'; g1.drawImage(bl, 0, 0, W / 2, H_ / 2); g1.filter = 'none';
    g2.globalCompositeOperation = 'source-over'; g2.clearRect(0, 0, W / 4, H_ / 4); g2.filter = 'blur(5px)'; g2.drawImage(bl, 0, 0, W / 4, H_ / 4); g2.filter = 'none';
    // screen
    ctx.save(); rrect(ctx, GL.x, GL.y, GL.w, GL.h, GL.r); ctx.clip();
    ctx.drawImage(get('glass', buildGlass, W, H_), 0, 0);
    // faint phosphor ambient lift from total beam energy
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(1, 0.9 * st.bloom); ctx.drawImage(s2, 0, 0, W, H_);
    ctx.globalAlpha = Math.min(1, 0.85 * Math.sqrt(st.bloom)); ctx.drawImage(s1, 0, 0, W, H_);
    ctx.globalAlpha = 1; ctx.drawImage(bl, 0, 0);
    if (st.bloom > 1.05) { ctx.globalAlpha = Math.min(1, (st.bloom - 1) * 0.5); ctx.drawImage(s2, -8, -8, W + 16, H_ + 16); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(get('grat', buildGrat, W, H_), 0, 0);
    ctx.drawImage(get('refl', buildRefl, W, H_), 0, 0);
    ctx.restore();
    // phosphor light spilling onto the bezel lip
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28; ctx.drawImage(s2, -6, -6, W + 12, H_ + 12); ctx.restore();
    H.vignette(ctx, W, H_, 0.35);
  }
  const baseState = () => ({ power: 1, xy: true, inten: 1, bloom: 1, kn: { inten: 0.55, ch1: KA(3), ch2: KA(3), tdiv: KA(0) } });

  // ================= STILL / CLIP =================
  function drawStill(ctx, W, H_, t) {
    resetBeam();
    const st = baseState(), ph = (a, d) => H.ease.inOut(H.clamp((t - a) / d));
    st.power = t > 0.12 ? 1 : 0;
    st.xy = t >= 1.0;
    st.kn.tdiv = snapKnob(t, [[1.0, 0]], 5);
    st.kn.inten = 0.3 + 0.25 * ph(0.12, 0.5);
    const jit = H.rng(900 + Math.floor(t * 30));
    const spin = t * 0.9, R = 178, sx = CX, sy = 296;
    if (t >= 0.12) {
      // power-on: dot blooms at centre, then the timebase sweep pulls it into a line
      const dotA = ph(0.12, 0.25) * (1 - ph(0.4, 0.2));
      if (dotA > 0) dot(CX, CY, 5 + 4 * dotA, dotA);
      if (t < 1.0) {
        const fx = ph(0.35, 0.3), amp = 150 * ph(0.55, 0.45);
        beam([curve((u) => [GX + u * GW, CY - amp * Math.sin(6.2832 * (2 * u + t * 0.6))], 220)], { f: fx, w: 2.4, timed: true });
      } else if (t < 1.65) {
        // X-Y pressed: the swept sine folds into a circle
        const m = H.ease.inOut(H.clamp((t - 1.0) / 0.6));
        beam([curve((u) => {
          const tb = [GX + u * GW, CY - 150 * Math.sin(6.2832 * (2 * u + t * 0.6))];
          const xy = [sx + R * Math.cos(6.2832 * u + spin), sy - R * Math.sin(0.38) * Math.sin(6.2832 * u + spin)];
          return [H.lerp(tb[0], xy[0], m), H.lerp(tb[1], xy[1], m)];
        }, 260)], { w: 2.4, timed: true });
      } else {
        const e = H.ease.inOut(H.clamp((t - 1.65) / 1.0));
        beam([sphere(sx, sy, R, spin, 0.38, e, 0.02 * e + 0.004 * Math.sin(t * 7), 1500, 22)], { w: 2.0, timed: true, a: 0.9 });
        // orbit ring with oscilloscope-music ripples
        const rf = ph(2.2, 0.7);
        if (rf > 0) beam([curve((u) => { const th = u * 6.2832, rr = 1 + 0.006 * Math.sin(12 * th + t * 5); const x = Math.cos(th) * 300 * rr, y = Math.sin(th) * 64 * rr, c = Math.cos(-0.17), s = Math.sin(-0.17); return [sx + x * c - y * s, sy + 10 + x * s + y * c]; }, 420)], { f: rf, w: 2.0, timed: true, a: 0.85 });
      }
      // satellite: drifting 1:2 Lissajous
      const lf = ph(3.0, 0.5);
      if (lf > 0) beam([curve((u) => { const a = u * 6.2832; return [768 + 56 * Math.sin(a + t * 1.3), 128 + 46 * Math.sin(2 * a)]; }, 160)], { f: lf, w: 1.9, timed: true, a: 0.85 });
      // CRT readouts
      const rd = ph(2.9, 0.5);
      text('CH1 .5V', GX + 18, GY + 16, 14, { f: rd, a: 0.5 }); text('CH2 .5V', GX + 18, GY + 38, 14, { f: rd, a: 0.5 });
      text(t >= 1.0 ? 'X-Y' : '1MS', GX + GW - 18, GY + GH - 32, 14, { align: 'r', f: ph(0.6, 0.3), a: 0.5 });
      // title
      const T = 'THE SHAPE OF A THOUGHT', cap = Math.min(36, 740 / textW(T, 1));
      text(T, CX, 568, cap, { align: 'c', f: H.clamp((t - 2.6) / 1.15), a: 1 });
      // underline cursor
      const uf = ph(3.75, 0.4);
      if (uf > 0) beam([[[CX - 120, 622], [CX + 120, 622]]], { f: uf, w: 2.2, a: 0.75 });
    }
    st.bloom = 1 + 0.6 * Math.max(0, 1 - Math.abs(t - 0.3) / 0.25);
    st.inten = 0.92 + 0.08 * jit();
    renderFrame(ctx, W, H_, st);
  }

  // ================= EXPLAINER =================
  const EXD = 15;
  // timing constants (shared with the sound score)
  const TX = {
    title: [0.3, 1.5], shrink: [2.0, 0.55], net2: [2.5, 0.7], model2: [3.0, 0.4], conv: [2.7, 0.4], cnt: [3.0, 5.6], itemsT0: 2.75, itemsDT: 0.5, itemSpeed: 270,
    col1: 5.8, dot1: 6.1, exp1: 6.25, // collapse to dot -> expand
    cat3: 6.25, arr1: 6.85, row: 6.45, arr2: 7.1, guess: 7.3, check: 7.9, cross: 7.9, itsCat: 8.05, adjust: 8.5, back: [8.5, 8.75], bpNet: [8.75, 9.15], weights: [8.8, 9.3], loopArc: 8.9,
    guess2: 9.3, fwd: [9.3, 9.65], cat2: 9.65, tick: 9.97, check2: 10.0,
    sqX: [10.35, 10.6], sweep: [10.85, 12.75], hit: 12.75, sqY: [12.95, 13.2], take: [13.25, 14.05], liss: [14.0, 0.5],
  };
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const acc = (u) => 0.61 + 0.36 * (1 - Math.exp(-3.4 * u)) / (1 - Math.exp(-3.4));
  const fade = (t, t0, d) => (t < t0 ? 1 : Math.pow(Math.max(0, 1 - (t - t0) / d), 2));

  function exScene(t) {
    const st = baseState();
    const ph = (a, d) => H.ease.inOut(H.clamp((t - a) / d));
    const lin = (a, d) => H.clamp((t - a) / d);
    const frame = Math.floor(t * 30), jr = H.rng(3000 + frame);

    // ---- mode + transforms
    let sx = 1, sy = 1, mode = 'xy';
    if (t < TX.dot1) { sx = sy = 1 - H.ease.in(lin(TX.col1, TX.dot1 - TX.col1)); }
    else if (t < TX.exp1) { sx = sy = 0; }
    else if (t < 6.6) { sx = sy = H.ease.out(lin(TX.exp1, 0.35)); }
    if (t < 0.45) { sx = sy = Math.max(0, H.ease.out(lin(0.12, 0.33))); }
    if (t >= TX.sqX[0] && t < TX.sweep[0]) { sx = t < TX.sqX[1] ? 1 - H.ease.in(lin(TX.sqX[0], TX.sqX[1] - TX.sqX[0])) : 0; }
    if (t >= TX.sqX[1] && t < TX.sqY[1]) mode = 'tb';
    if (t >= TX.sqY[0] && t < TX.take[0]) { sy = t < TX.sqY[1] ? 1 - H.ease.in(lin(TX.sqY[0], TX.sqY[1] - TX.sqY[0])) : 0; }
    // wrong-guess tremor: the whole trace shudders as the check fails
    const shud = t > TX.check && t < TX.check + 0.6 ? (1 - (t - TX.check) / 0.6) : 0;
    XF = (p) => {
      let x = CX + (p[0] - CX) * sx, y = CY + (p[1] - CY) * sy;
      if (shud > 0) { x += shud * 7 * Math.sin(p[1] * 0.06 + t * 70); y += shud * 2 * Math.sin(p[0] * 0.05 + t * 50); }
      return [x, y, p[2]];
    };
    if (t > TX.col1 && t < TX.exp1 + 0.35) { const k2 = 1 - sx; dot(CX, CY, 3 + 5 * k2, k2); }

    // ---- BEAT 1: hook
    const hdrRe = (t0) => H.clamp((t - t0) / 0.3);
    if (t < TX.exp1) {
      const s = ph(TX.shrink[0], TX.shrink[1]), s2 = ph(TX.shrink[0] + 0.15, TX.shrink[1]);
      const capA = 66, capB = 30;
      const l1 = 'HOW DOES', l2 = 'AI LEARN?';
      const w1a = textW(l1, capA), w2a = textW(l2, capA);
      const cap = H.lerp(capA, capB, s);
      const x1 = H.lerp(CX - w1a / 2, 74, s), y1 = H.lerp(232, 56, s);
      const x2 = H.lerp(CX - w2a / 2, 74 + textW(l1 + ' ', capB), s2), y2 = H.lerp(336, 56, s2), cap2 = H.lerp(capA, capB, s2);
      const f = H.clamp((t - TX.title[0]) / (TX.title[1] - TX.title[0]));
      const f1 = H.clamp(f * 2), f2 = H.clamp(f * 2 - 1);
      text(l1, x1, y1, cap, { f: f1, w: H.lerp(4.6, 2.7, s) });
      text(l2, x2, y2, cap2, { f: f2, w: H.lerp(4.6, 2.7, s2) });
      // underline sine drawn under the question
      const uf = ph(1.4, 0.45) * (1 - s);
      if (uf > 0.01) beam([curve((u) => [CX - 250 + u * 500, 452 + 16 * Math.sin(u * 6.2832 * 4 + t * 3)], 140)], { f: ph(1.4, 0.45), a: 1 - s, w: 2.6, timed: true });
    }

    // ---- BEAT 2: data streams into the model
    if (t >= TX.net2[0] && t < TX.exp1) {
      const rot = 0.35 * Math.sin(t * 1.1);
      const absorbs = [];
      // examples: cat / dog faces with labels riding the stream
      const pick = H.rng(44);
      for (let i = 0; i < 12; i++) {
        const isCat = pick() < 0.5, t0 = TX.itemsT0 + i * TX.itemsDT;
        for (let gh = 0; gh < 3; gh++) {
          const tt = t - gh * 0.035; if (tt < t0) continue;
          const x = 30 + (tt - t0) * TX.itemSpeed * (1 + Math.max(0, tt - 4.6) * 0.5);
          if (x > 590) { if (gh === 0 && x < 640) absorbs.push(1 - (x - 590) / 50); continue; }
          GA = gh === 0 ? 1 : 0.16 / gh;
          const shrink = x > 470 ? 1 - (x - 470) / 150 : 1, y = 214 + (x > 470 ? (x - 470) * 0.25 : 0);
          beam(tx(isCat ? CAT : DOG, x, y, 40 * shrink), { w: 2.1, dots: gh === 0 });
          if (shrink > 0.6 && gh === 0) text(isCat ? 'CAT' : 'DOG', x, 278, 24, { align: 'c', a: shrink });
          GA = 1;
        }
      }
      const fl = absorbs.length ? Math.max(...absorbs) : 0;
      net(690, 238, 210, 250, rot, { f: H.clamp((t - TX.net2[0]) / TX.net2[1]), act: (l) => fl * (l === 0 ? 1 : l === 1 ? 0.6 : 0.3) });
      text('MODEL', 690, 378, 26, { align: 'c', f: H.clamp((t - TX.model2[0]) / TX.model2[1]) });
      beam(arrowS(70, 330, 545, 330, 16), { f: ph(TX.conv[0], TX.conv[1]), a: 0.8, w: 2.2 });
      // counter
      const cp = H.clamp((t - TX.cnt[0]) / (TX.cnt[1] - TX.cnt[0])), n = Math.round(1e6 * Math.pow(cp, 2.3));
      const cf = H.clamp((t - TX.cnt[0]) / 0.3);
      text(fmt(n), CX, 470, 70, { align: 'c', f: cf, w: 4.6 });
      text('EXAMPLES', CX, 566, 30, { align: 'c', f: H.clamp((t - 3.2) / 0.35) });
    }

    // ---- BEAT 3: guess -> check -> adjust
    if (t >= TX.exp1 && t < TX.sweep[0]) {
      const H3 = 'HOW DOES AI LEARN?';
      text(H3, 74, 56, 30, { w: 2.7, f: hdrRe(6.25) });
      const catF = H.clamp((t - TX.cat3) / 0.55);
      beam(tx(CAT, 158, 300, 74), { f: catF, w: 2.6 });
      const pulse1 = t > TX.fwd[0] && t < TX.fwd[1] ? (t - TX.fwd[0]) / (TX.fwd[1] - TX.fwd[0]) : -1;
      beam(arrowS(266, 300, 318, 300, 13), { f: ph(TX.arr1, 0.2), w: 2.2 });
      // net: activation flash on guesses, amber back-propagation on adjust
      const actT = (l, t0) => { const d = t - (t0 + l * 0.1); return d > 0 && d < 0.35 ? 1 - d / 0.35 : 0; };
      const bpT = (l) => { const d = t - (TX.bpNet[0] + (1 - l) * 0.18); return d > 0 && d < 0.5 ? Math.sin(Math.PI * d / 0.5) : 0; };
      const wk = ph(TX.weights[0], TX.weights[1] - TX.weights[0]);
      const jitN = t > TX.guess && t < TX.guess2 ? 1.6 : 0;
      net(432, 300, 180, 230, 0.25 * Math.sin(t * 0.9), {
        f: H.clamp((t - 6.28) / 0.5), wk, bp: bpT, nodeR: 11,
        act: (l) => Math.max(actT(l, 7.1), actT(l, 9.42)),
        nodeCol: (l) => H.mix(P31, AMBER, Math.min(1, bpT(Math.min(l, 1)) * 0.8)),
      });
      text('MODEL', 432, 444, 26, { align: 'c', f: H.clamp((t - 6.6) / 0.3) });
      beam(arrowS(532, 300, 578, 300, 13), { f: ph(TX.arr2, 0.2), w: 2.2 });
      if (pulse1 >= 0) { const p = pulse1 < 0.4 ? H.lerp(270, 320, pulse1 / 0.4) : pulse1 < 0.75 ? H.lerp(330, 530, (pulse1 - 0.4) / 0.35) : H.lerp(535, 580, (pulse1 - 0.75) / 0.25); dot(p, 300, 6, 1); }
      // wrong guess: glitching, amber-shifted trace
      const dogA = fade(t, TX.guess2 - 0.05, 0.3), wrong = H.clamp((t - TX.guess) / 0.25) * 0.85;
      if (t >= TX.guess && dogA > 0) {
        const gl = t < TX.guess2 ? 1 - 0.7 * H.clamp((t - TX.check) / 0.3) : 0, rr = H.rng(500 + frame); // detune settles once checked, so the crossed-out word stays readable
        const tears = Array.from({ length: 8 }, () => (rr() < 0.25 ? (rr() - 0.5) * 12 : 0));
        const xf = (p) => [p[0] + gl * (Math.sin(p[1] * 0.21 + t * 40) * 1.5 + tears[Math.floor(((p[1] - 270) / 70) * 8) & 7]), p[1] + gl * Math.sin(p[0] * 0.13 + t * 33) * 0.8];
        const col = H.mix(P31, AMBER, wrong);
        text('DOG?', 596, 270, 58, { f: H.clamp((t - TX.guess) / 0.4), col, xf, a: dogA, w: 4.2 });
        // ghost copy: red-shifted, offset (misconverged beam)
        text('DOG?', 598, 269, 58, { f: H.clamp((t - TX.guess) / 0.4), col: RED, xf, a: dogA * 0.15 * wrong, w: 2.5, dots: false, head: false, retrace: false });
        // CHECK: cross it out
        const xs = H.clamp((t - TX.cross) / 0.22), w4 = textW('DOG?', 58);
        if (xs > 0) beam([[[586, 258], [606 + w4, 340]], [[606 + w4, 258], [586, 340]]], { f: xs, col: RED, a: dogA, w: 3.6 });
        text("IT'S A CAT", 596 + textW('DOG?', 58) / 2, 360, 28, { align: 'c', f: H.clamp((t - TX.itsCat) / 0.35), col: AMBER, a: dogA * 0.95 });
        // error signal travels back from the guess into the net
        if (t > TX.back[0] && t < TX.back[1]) { const p = (t - TX.back[0]) / (TX.back[1] - TX.back[0]); dot(H.lerp(590, 532, p), 300, 7, 1, AMBER); }
      }
      // corrected guess, snapping clean
      if (t >= TX.cat2) {
        text('CAT', 600, 270, 58, { f: H.clamp((t - TX.cat2) / 0.3), w: 4.4 });
        const cx0 = 600 + textW('CAT', 58) + 26; beam([[[cx0, 300], [cx0 + 18, 326], [cx0 + 60, 262]]], { f: H.clamp((t - TX.tick) / 0.18), w: 4.4 });
      }
      // loop row
      const row = ['GUESS', 'CHECK', 'ADJUST'], cap = 30, gap = 18, arL = 46;
      const wds = row.map((s) => textW(s, cap)), tot = wds.reduce((a, b) => a + b, 0) + 2 * (arL + gap * 2);
      let x = CX - tot / 2; const xs = [];
      const starts = [TX.guess, TX.check, TX.adjust, TX.guess2, TX.check2];
      const stg = t < TX.check ? 0 : t < TX.adjust ? 1 : t < TX.guess2 ? 2 : t < TX.check2 ? 3 : 4, active = [0, 1, 2, 0, 1][stg];
      const rowF = H.clamp((t - TX.row) / 0.6);
      row.forEach((s, i) => {
        xs.push(x + wds[i] / 2);
        const on = t > 7.15 && i === active;
        text(s, x, 548, cap, { f: H.clamp(rowF * 3 - i), a: on ? 1 : 0.5, col: on && i > 0 && t < TX.guess2 ? H.mix(P31, AMBER, 0.6) : P31 });
        if (on) beam([[[x - 12, 536], [x + wds[i] + 12, 536], [x + wds[i] + 12, 590], [x - 12, 590], [x - 12, 536]]], { f: H.clamp((t - starts[stg]) / 0.15), a: 0.8, w: 2 });
        x += wds[i];
        if (i < 2) { beam(arrowS(x + gap, 563, x + gap + arL, 563, 11), { f: H.clamp(rowF * 3 - i - 0.5), a: 0.55 }); x += arL + gap * 2; }
      });
      // loop closes: return arc from ADJUST back to GUESS
      const la = H.clamp((t - TX.loopArc) / 0.4);
      if (la > 0) {
        const pts = curve((u) => { const x0 = xs[2], x1 = xs[0]; const xx = H.lerp(x0, x1, u); return [xx, 600 + Math.sin(u * Math.PI) * 42]; }, 30);
        beam([pts, [[xs[0] - 10, 612], [xs[0], 600], [xs[0] + 10, 612]]], { f: la, a: 0.7, w: 2.2 });
      }
    }

    // ---- BEAT 4: timebase — loss decays, accuracy climbs
    if (t >= TX.sqX[1] && t < TX.take[0]) {
      const H3 = 'HOW DOES AI LEARN?';
      if (t >= TX.sweep[0]) text(H3, 74, 56, 30, { w: 2.7, f: hdrRe(TX.sweep[0]) });
      if (t < TX.sweep[0]) { beam([[[CX, GY + 20], [CX, GY + GH - 20]]], { w: 2.4 }); }
      else {
        const u = H.clamp((t - TX.sweep[0]) / (TX.sweep[1] - TX.sweep[0])), xe = GX + u * GW;
        const ay = (v) => 450 - (acc(v) - 0.5) / 0.5 * 300;
        const nzA = H.makeNoise(17);
        const accPts = curve((v) => [GX + v * GW, ay(v) + nzA.n2(v * 40, 0.5) * 9 * (1 - v)], 160).filter((p) => p[0] <= xe + 0.1);
        const lossPts = curve((v) => [GX + v * GW, 556 - 66 * Math.exp(-3 * v) * Math.cos(6.2832 * 7 * v) - 6 * nzA.n2(v * 60, 3) * Math.exp(-2.5 * v)], 320).filter((p) => p[0] <= xe + 0.1);
        if (accPts.length > 1) beam([accPts], { w: 3, timed: true, head: false });
        if (lossPts.length > 1) beam([lossPts], { w: 2.2, timed: true, head: false, a: 0.75 });
        if (u < 1) { dot(xe, ay(u), 6, 1); dot(xe, 556 - 66 * Math.exp(-3 * u) * Math.cos(6.2832 * 7 * u), 5, 0.8); }
        text('ACCURACY', 356, 150, 26, { f: H.clamp((t - TX.sweep[0] - 0.05) / 0.3) });
        text('ERROR', 74, 446, 28, { f: H.clamp((t - TX.sweep[0] - 0.2) / 0.3), a: 0.8 });
        text('TRAINING ROUNDS >', GX + GW - 20, 634, 28, { align: 'r', f: H.clamp((t - TX.sweep[0] - 0.4) / 0.4), a: 0.7 });
        const v = Math.round(acc(u) * 100), hit = t >= TX.hit;
        text(v + '%', 74, 116, 86, { f: H.clamp((t - TX.sweep[0]) / 0.25), w: hit ? 6 : 5 });
        if (hit) {
          const k = H.clamp((t - TX.hit) / 0.2), wN = textW('97%', 86);
          beam([[[60, 104], [86 + wN, 104], [86 + wN, 216], [60, 216], [60, 104]]], { f: k, w: 2.8 });
          dot(GX + GW, ay(1), 9, 1);
        }
      }
    }

    // ---- BEAT 5: takeaway
    if (t >= TX.take[0]) {
      const f = H.clamp((t - TX.take[0]) / (TX.take[1] - TX.take[0]));
      text('MORE EXAMPLES >', CX, 216, 50, { align: 'c', f: H.clamp(f * 2), w: 3.2 });
      text('BETTER GUESSES', CX, 316, 50, { align: 'c', f: H.clamp(f * 2 - 1), w: 3.2 });
      const lf = ph(TX.liss[0], TX.liss[1]);
      if (lf > 0) beam([curve((u) => { const a = u * 6.2832; return [CX + 120 * Math.sin(3 * a + 0.5 + t * 0.4), 510 + 60 * Math.sin(2 * a)]; }, 360)], { f: lf, w: 2.2, timed: true, a: 0.9 });
    }

    // ---- panel + beam state
    st.xy = !(t >= TX.sqX[1] && t < TX.sqY[1]);
    st.kn.tdiv = snapKnob(t, [[TX.sqX[1], 6], [TX.sqY[1], 0]], 0);
    st.kn.ch1 = snapKnob(t, [[8.85, 4]], 3); st.kn.ch2 = snapKnob(t, [[9.0, 2]], 3);
    const hitE = t > TX.hit ? Math.exp(-(t - TX.hit) / 0.35) : 0;
    const snap = t > TX.tick ? Math.exp(-(t - TX.tick) / 0.2) : 0;
    st.kn.inten = 0.55 + 0.3 * hitE;
    st.bloom = 1 + 1.9 * hitE + 0.5 * snap + (sx < 0.05 && sy < 0.05 && t > 0.1 ? 0.8 : 0) + 0.4 * shud;
    st.inten = (0.93 + 0.07 * jr()) * (1 + 0.35 * hitE);
    return st;
  }

  // ================= SOUND =================
  function oscSound(k) {
    const D = EXD, T = TX;
    const px = (x) => H.clamp(x / 900) * 1.2 - 0.6;
    // the picture as sound: a beam drawing a figure = low filtered XY buzz (two detuned saws, like L/R channels)
    const draw = (t, dur, f, p = 0, g = 1, minor = true) => {
      const o = { type: 'sawtooth', dur, a: Math.min(0.05, dur * 0.25), hold: dur * 0.65, filter: 'lowpass', f2: [[0, 500], [dur, 1100]], q: 2, pan: p, minor };
      k.tone(t, Object.assign({}, o, { f, gain: 0.038 * g }));
      k.tone(t, Object.assign({}, o, { f: f * 1.5, gain: 0.019 * g, detune: 6, pan: -p }));
    };
    // relay / rotary switch: a sharp mechanical click + a little thunk
    const relay = (t, g = 1, p = 0.7) => { k.noise(t, { dur: 0.02, filter: 'bandpass', f: 2200, q: 1.5, gain: 0.35 * g, a: 0.001, pan: p }); k.noise(t + 0.03, { dur: 0.015, filter: 'bandpass', f: 1500, q: 2, gain: 0.22 * g, a: 0.001, pan: p }); k.tone(t, { f: [[0, 180], [0.05, 90]], dur: 0.07, gain: 0.18 * g, pan: p }); };
    const detent = (t, g = 1, p = 0.7) => k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1800, q: 2, gain: 0.22 * g, a: 0.001, pan: p, minor: true });
    // beam collapse: falling filtered sweep; expand: rising
    const sweepTone = (t, dur, f0, f1, g = 1) => { k.tone(t, { f: [[0, f0], [dur, f1]], type: 'sawtooth', dur, gain: 0.06 * g, a: 0.01, hold: dur * 0.6, filter: 'lowpass', f2: 900, q: 3 }); k.noise(t, { dur, color: 'brown', filter: 'lowpass', f: [[0, f0 * 4], [dur, f1 * 4]], gain: 0.12 * g, a: 0.01 }); };

    k.bed('hum', 0, D, { gain: 0.6 });
    k.bed('room', 0, D, { gain: 0.5 });
    k.noise(0, { dur: D, color: 'pink', filter: 'bandpass', f: 1400, q: 0.7, gain: 0.012, a: 0.3, hold: D - 0.6, bus: 'amb' }); // flyback / transformer hiss
    if (!k.vo) k.tone(0, { f: 'A1', type: 'triangle', dur: D, gain: 0.02, a: 0.6, hold: D - 1.2, filter: 'lowpass', f2: 300, bus: 'amb' });

    // ---- BEAT 1: power-on dot, title written by the beam
    k.tone(0.12, { f: [[0, 60], [0.3, 110]], type: 'sine', dur: 0.4, gain: 0.14, a: 0.01 }); relay(0.1, 0.55, 0.6);
    draw(T.title[0], 0.62, 'A2', 0, 1.1); draw(T.title[0] + 0.62, 0.6, 'E2', 0, 1.1);
    draw(1.4, 0.45, 'A2', 0, 0.7);                                     // the sine underline
    k.noise(T.shrink[0], { dur: 0.55, color: 'brown', filter: 'lowpass', f: [[0, 500], [0.55, 160]], gain: 0.1, a: 0.2, pan: -0.4 }); // shrink into the corner
    // ---- BEAT 2: net draws, conveyor arrow, examples stream in
    draw(T.net2[0], T.net2[1], 'D2', px(690), 0.9);
    draw(T.conv[0], T.conv[1], 'A2', px(300), 0.6);
    draw(T.model2[0], T.model2[1], 'E2', px(690), 0.6);
    k.withMinor(() => {
      for (let i = 0; i < 6; i++) { const ta = T.itemsT0 + i * T.itemsDT + (590 - 30) / T.itemSpeed; if (ta > T.col1 - 0.1) break; k.tone(ta - (ta > 4.6 ? 0.25 : 0), { f: [[0, 'A3'], [0.12, 'E3']], type: 'triangle', dur: 0.16, gain: 0.07, filter: 'lowpass', f2: 900, pan: px(600) }); }
      // counter: ticks thinning out as the number accelerates (≤12/s)
      let last = -1; for (let f = 0; f < (T.cnt[1] - T.cnt[0]) * 60; f++) { const t = T.cnt[0] + f / 60; if (t - last >= 1 / 11) { k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1300, q: 3, gain: 0.1, a: 0.001, pan: 0 }); last = t; } }
    });
    k.tone(T.cnt[1], { f: 'E3', type: 'triangle', dur: 0.4, gain: 0.09, filter: 'lowpass', f2: 1200 }); k.tone(T.cnt[1], { f: 'A3', type: 'triangle', dur: 0.4, gain: 0.07, filter: 'lowpass', f2: 1200 });
    // ---- transition 1: collapse to a dot, relay, re-expand
    sweepTone(T.col1, T.dot1 - T.col1, 220, 55, 1);
    relay(T.dot1 + 0.05, 1.2);
    sweepTone(T.exp1, 0.35, 55, 200, 0.8);
    // ---- BEAT 3
    draw(T.cat3, 0.55, 'A2', px(158), 1);
    draw(T.row, 0.6, 'E2', 0, 0.6);
    k.withMinor(() => { k.tone(T.arr1, { f: 'E3', type: 'triangle', dur: 0.15, gain: 0.06, filter: 'lowpass', f2: 900 }); k.tone(T.arr2, { f: 'A3', type: 'triangle', dur: 0.15, gain: 0.06, filter: 'lowpass', f2: 900 }); });
    // wrong guess: DOG? written by a detuned, wobbling beam + soft static burst
    k.tone(T.guess, { f: [[0, 98], [0.15, 92], [0.3, 101], [0.45, 90]], type: 'sawtooth', dur: 0.5, gain: 0.08, hold: 0.3, filter: 'lowpass', f2: 900, q: 4, pan: px(680) });
    k.tone(T.guess, { f: [[0, 104], [0.2, 96], [0.45, 107]], type: 'sawtooth', dur: 0.5, gain: 0.07, hold: 0.3, filter: 'lowpass', f2: 900, q: 4, pan: px(680) });
    k.noise(T.guess, { dur: 0.35, color: 'pink', filter: 'bandpass', f: 1200, q: 0.8, gain: 0.08, a: 0.02, pan: px(680) });
    // CHECK: the cross + shudder — dissonant low buzz and a noise hit
    k.play('buzz', T.check, { f: 73, dur: 0.45, gain: 0.7, pan: px(680) });
    k.noise(T.check, { dur: 0.3, color: 'pink', filter: 'lowpass', f: [[0, 2000], [0.3, 400]], gain: 0.16, a: 0.002, pan: px(680) });
    k.tone(T.check, { f: [[0, 'Bb2'], [0.5, 'A2']], type: 'square', dur: 0.5, gain: 0.04, hold: 0.3, filter: 'lowpass', f2: 700 });
    draw(T.itsCat, 0.35, 'G2', px(680), 0.5);
    // ADJUST: error dot runs back (falling), weights retune (knob detents + gliding tones)
    k.tone(T.back[0], { f: [[0, 330], [0.25, 165]], type: 'triangle', dur: 0.3, gain: 0.08, filter: 'lowpass', f2: 1200, pan: px(560) });
    k.tone(T.bpNet[0], { f: [[0, 110], [0.4, 147]], type: 'sawtooth', dur: 0.45, gain: 0.05, hold: 0.25, filter: 'lowpass', f2: 700, pan: px(430) });
    k.tone(T.bpNet[0] + 0.1, { f: [[0, 165], [0.4, 220]], type: 'sawtooth', dur: 0.45, gain: 0.035, hold: 0.25, filter: 'lowpass', f2: 700, pan: px(430) });
    for (let i = 0; i < 3; i++) { detent(8.85 + i * 0.04, 0.9, 0.55); detent(9.0 + i * 0.04, 0.9, 0.85); }
    draw(T.loopArc, 0.4, 'A2', 0, 0.5);
    // GUESS again: forward pulse, then CAT written clean — the correction resolves
    k.tone(T.fwd[0], { f: [[0, 'E3'], [0.3, 'A3']], type: 'triangle', dur: 0.32, gain: 0.07, filter: 'lowpass', f2: 1000, pan: px(400) });
    draw(T.cat2, 0.3, 'A2', px(680), 0.8, false);
    ['A3', 'C#4', 'E4'].forEach((n, i) => k.tone(T.tick + i * 0.03, { f: n, type: 'triangle', dur: 0.7, gain: 0.07, a: 0.004, hold: 0.1, verb: 0.2, pan: px(760) }));
    k.tone(T.tick, { f: 'A2', type: 'sine', dur: 0.6, gain: 0.12 });
    // ---- transition 2: X gain to zero (vertical line), relay to timebase
    sweepTone(T.sqX[0], T.sqX[1] - T.sqX[0], 200, 70, 0.9);
    relay(T.sqX[1], 1.2); detent(T.sqX[1] + 0.05, 1); detent(T.sqX[1] + 0.09, 1);
    // ---- BEAT 4: sweep draws both traces; tone rises with accuracy, ticks per % (≤12/s)
    const SW = T.sweep[1] - T.sweep[0];
    k.tone(T.sweep[0], { f: [[0, 82], [SW * 0.3, 98], [SW, 110]], type: 'sawtooth', dur: SW, gain: 0.04, a: 0.05, hold: SW * 0.85, filter: 'lowpass', f2: [[0, 400], [SW, 1200]], q: 2 });
    k.tone(T.sweep[0], { f: [[0, 55], [SW, 41]], type: 'triangle', dur: SW, gain: 0.06, a: 0.05, hold: SW * 0.5, filter: 'lowpass', f2: 300 }); // error trace: dying low wobble
    k.withMinor(() => { let lastV = 61, lastT = -1; for (let f = 0; f < SW * 60; f++) { const t = T.sweep[0] + f / 60, v = Math.round(acc(f / 60 / SW) * 100); if (v > lastV && t - lastT >= 1 / 12) { k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1500, q: 3, gain: 0.1, a: 0.001, pan: -0.5 }); lastV = v; lastT = t; } } });
    // 97%: beam flares — the biggest hit: deep thump + a clean, open A chord
    k.play('thud', T.hit, { f: 95, gain: 1.15 });
    ['A2', 'E3', 'A3', 'C#4', 'E4'].forEach((n, i) => k.tone(T.hit, { f: n, type: i < 2 ? 'sawtooth' : 'triangle', dur: 1.1, gain: i < 2 ? 0.065 : 0.09, a: 0.006, hold: 0.3, filter: 'lowpass', f2: 1600, verb: 0.25, pan: (i - 2) * 0.15 }));
    k.noise(T.hit, { dur: 0.6, color: 'pink', filter: 'lowpass', f: [[0, 2200], [0.6, 300]], gain: 0.17, a: 0.004, verb: 0.3 });
    // ---- transition 3: Y gain to zero, relay back to X-Y
    sweepTone(T.sqY[0], T.sqY[1] - T.sqY[0], 180, 70, 0.8);
    relay(T.sqY[1], 1.2); detent(T.sqY[1] + 0.04, 1);
    // ---- BEAT 5: takeaway written, lands on a resolved chord
    draw(T.take[0], 0.4, 'A2', 0, 0.9); draw(T.take[0] + 0.4, 0.4, 'E2', 0, 0.9);
    draw(T.liss[0], T.liss[1], 'A2', 0, 0.6);
    ['A2', 'E3', 'A3', 'E4'].forEach((n, i) => k.tone(T.take[1], { f: n, type: 'triangle', dur: 1.0, gain: 0.07, a: 0.01, hold: 0.25, verb: 0.3, pan: (i - 1.5) * 0.2 }));
    k.tone(T.take[1], { f: 'A1', type: 'sine', dur: 0.95, gain: 0.14, a: 0.01 });
  }

  registerStyle({
    id: 'oscilloscope',
    name: 'Oscilloscope Vector Art',
    category: 'Retro Digital',
    description: 'Oscilloscope-music XY art on an analogue lab scope: one P31 green beam draws everything, bright where it slows at turns and dim on fast retrace lines, with bloom and halation behind an internal 8x10 graticule, framed by a moulded CRT bezel and a knobbed instrument front panel.',
    motion: 'Power-on: the dot blooms, the timebase pulls it into a sine sweep, the X-Y button snaps in and the waveform folds into a circle that winds itself into a spinning spiral-sphere while the beam writes the vector text.',
    fonts: ['600 12px "Inter"', '700 12px "Inter"', '800 12px "Inter"', '700 30px "Space Grotesk"'],
    duration: 5,
    frameT: 4.7,
    readsPixels: false,
    explainerDuration: EXD,
    explainerNote: 'Everything is drawn by one scope beam: transitions are the instrument\'s own (picture collapses to a dot and re-expands, X gain to zero then the timebase sweep, Y gain to zero back to X-Y), arrows and Hershey-style labels are beam strokes, counters are redrawn vector numerals, and the wrong guess shudders amber while the 97% flares the bloom.',
    draw(ctx, W, H_, t) { drawStill(ctx, W, H_, t); },
    explainer(ctx, W, H_, t) { resetBeam(); const st = exScene(t); renderFrame(ctx, W, H_, st); },
    explainerSound(k) { oscSound(k); },
  });
}
```
