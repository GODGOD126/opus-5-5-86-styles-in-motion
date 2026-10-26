I want an animated explainer made in the "International Typographic Style" visual style (Art & Design Movements). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
Name: International Typographic Style
Family: Art & Design Movements
Look: A 1960s Zürich-school concert-style poster: strict 12-column modular grid, enormous flush-left grotesk set tight, an asymmetric field of rotating concentric arc segments over a red disc, and small precise info blocks hung from the grid — red, black and white only.
Motion: Rules draw out along the grid, the red disc opens and the ring segments spin in and decelerate until they lock onto a 22.5° module; the headline rises line by line out of its baseline masks and the info blocks step in column by column, then the rings drift like a slow mechanical score.
How it explains: A Zürich-school information sequence on the same 12-column grid: the headline shrinks into a running header, pages change with a column-by-column red wipe, hairline rules with solid heads carry cause and flow, numbers count in Inter 800 and the key result gets a red block slammed behind it.

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

REFERENCE STYLE SOURCE (styles/swiss-grid.js; W/H_ are always 1280x720)
```js
{
  const fieldNoise = (w, h, seed, cell, oct, sx = 1, sy = 1) => {
    const nz = H.makeNoise(seed), gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2, g = new Float32Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) g[j * gw + i] = nz.fbm2(i * 0.35 * sx, j * 0.35 * sy, oct);
    const out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      const fy = y / cell, j = fy | 0, ty = fy - j;
      for (let x = 0; x < w; x++) {
        const fx = x / cell, i = fx | 0, tx = fx - i, k = j * gw + i;
        const a = g[k] + (g[k + 1] - g[k]) * tx, b = g[k + gw] + (g[k + gw + 1] - g[k + gw]) * tx;
        out[y * w + x] = a + (b - a) * ty;
      }
    }
    return out;
  };

  const RED = '#e2231a', BLACK = '#141414', PAPER = '#f1efe9';

  // ===================== EXPLAINER: "How does AI learn?" =====================
  // A Zürich-school information sequence: every page hangs on the same 12-column grid; pages change with a
  // column-by-column red wipe; arrows are hairline rules with solid heads; numbers are set in Inter 800.
  const EXF = {};
  const exField = (k, ...a) => { const kk = k + a[0] + 'x' + a[1]; return EXF[kk] || (EXF[kk] = fieldNoise(...a)); }; // cached per size
  // ink dropouts: fixed-seed single-pixel specks plus a few offset "hickeys" (tiny donuts of missing ink)
  const speckMask = (w, h) => {
    const key = 'speck' + w + 'x' + h; if (EXF[key]) return EXF[key];
    const m = new Float32Array(w * h), r = H.rng(12);
    for (let p = 0; p < m.length; p++) if (r() < 0.0015) m[p] = 0.5;
    const rh = H.rng(1212);
    for (let k = 0; k < 70; k++) {
      const cx = rh.range(4, w - 4), cy = rh.range(4, h - 4), ro = rh.range(1.6, 3.2);
      for (let y = Math.floor(cy - ro - 1); y <= cy + ro + 1; y++) for (let x = Math.floor(cx - ro - 1); x <= cx + ro + 1; x++) {
        const dd = Math.hypot(x - cx, y - cy), ring = Math.max(0, 1 - Math.abs(dd - ro * 0.75) / (ro * 0.4)), core = dd < ro * 0.3 ? 0.35 : 0;
        const v = Math.min(0.85, ring * 0.8 + core); if (v > m[y * w + x]) m[y * w + x] = v;
      }
    }
    return (EXF[key] = m);
  };
  const pict = (c, kind, x, y, s, col = BLACK, eye = PAPER) => { // isotype-like pictograms
    c.fillStyle = col;
    if (kind === 'cat') {
      c.beginPath(); c.moveTo(x - s * 0.3, y - s * 0.02); c.lineTo(x - s * 0.27, y - s * 0.4); c.lineTo(x - s * 0.05, y - s * 0.2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(x + s * 0.3, y - s * 0.02); c.lineTo(x + s * 0.27, y - s * 0.4); c.lineTo(x + s * 0.05, y - s * 0.2); c.closePath(); c.fill();
      c.beginPath(); c.arc(x, y + s * 0.06, s * 0.3, 0, 7); c.fill();
    } else {
      c.beginPath(); c.arc(x, y + s * 0.02, s * 0.28, 0, 7); c.fill();
      c.beginPath(); c.ellipse(x - s * 0.3, y + s * 0.04, s * 0.1, s * 0.22, 0.35, 0, 7); c.fill();
      c.beginPath(); c.ellipse(x + s * 0.3, y + s * 0.04, s * 0.1, s * 0.22, -0.35, 0, 7); c.fill();
      c.beginPath(); c.ellipse(x, y + s * 0.22, s * 0.13, s * 0.1, 0, 0, 7); c.fill();
    }
    if (s > 30) { c.fillStyle = eye; c.beginPath(); c.arc(x - s * 0.1, y + s * 0.02, s * 0.045, 0, 7); c.arc(x + s * 0.1, y + s * 0.02, s * 0.045, 0, 7); c.fill(); }
  };
  const rule = (c, x0, y0, x1, y1, p, w = 2, col = BLACK, head = true) => { // hairline arrow
    if (p <= 0) return;
    const x = H.lerp(x0, x1, p), y = H.lerp(y0, y1, p), a = Math.atan2(y1 - y0, x1 - x0);
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = w; c.lineCap = 'butt';
    const hl = 14 + w * 2.6;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x - Math.cos(a) * hl * 0.6, y - Math.sin(a) * hl * 0.6); c.stroke();
    if (head) { c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(a - 0.42) * hl, y - Math.sin(a - 0.42) * hl); c.lineTo(x - Math.cos(a + 0.42) * hl, y - Math.sin(a + 0.42) * hl); c.closePath(); c.fill(); }
  };

  const explainSwiss = (ctx, W, HH, t) => {
    const M = 48, PITCH = 100, COLW = 84, colX = (i) => M + i * PITCH, E = H.ease, cl = H.clamp;
    const S = (a, b) => cl((t - a) / (b - a), 0, 1);
    const txt = (s, x, y, size, wgt = 400, col = BLACK, ls = 0) => { c.font = `${wgt} ${size}px "Inter"`; c.letterSpacing = ls + 'px'; c.fillStyle = col; c.fillText(s, x, y); c.letterSpacing = '0px'; };
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, HH);
    const L = H.layer(W, HH), c = L.getContext('2d'); c.textBaseline = 'alphabetic';

    // page changes: column-by-column wipe, content swaps while fully covered
    const WIPES = [5.8, 10.3, 12.7], swap = (w) => w + 0.58;
    const page = t < swap(WIPES[0]) ? 0 : t < swap(WIPES[1]) ? 1 : t < swap(WIPES[2]) ? 2 : 3;

    // ---------- running header (the hook shrinks into it) ----------
    const hp = E.inOut(S(1.7, 2.4));
    {
      const fs = H.lerp(150, 28, hp), x = M - fs * 0.05, y1 = H.lerp(HH - M - 150 * 0.86, M + 22, hp), y2 = H.lerp(HH - M, M + 22, hp);
      c.font = `800 ${fs}px "Inter"`; c.letterSpacing = `${-(fs * 0.045).toFixed(1)}px`; c.fillStyle = BLACK;
      const rise = (s, d, x, yb) => { const p = E.inOut(S(d, d + 0.5)); if (p <= 0) return; c.save(); if (hp === 0) { c.beginPath(); c.rect(0, yb - fs * 0.9, W, fs * 0.98); c.clip(); } c.fillText(s, x, yb + (1 - p) * fs * 0.9); c.restore(); };
      if (hp < 1) { rise('How does', 0.15, x, y1); rise('AI learn?', 0.35, x + (c.measureText('How does ').width) * hp, y2); }
      else c.fillText('How does AI learn?', x, M + 22);
      c.letterSpacing = '0px';
      if (hp < 0.5) { c.globalAlpha = 1 - hp * 2; txt('Lecture 05', colX(0), M + 14, 13, 600); txt('Machine learning, explained', colX(2), M + 14, 13); txt('in five steps', colX(2), M + 31, 13); c.globalAlpha = 1;
        const rp = E.back(S(0.5, 1.0)); c.fillStyle = RED; c.beginPath(); c.arc(colX(9) + 42, 250, 150 * rp, 0, 7); c.fill();
        c.strokeStyle = BLACK; c.lineWidth = 8; for (let k = 0; k < 4; k++) { const a0 = k * 1.4 + t * 0.6; c.beginPath(); c.arc(colX(9) + 42, 250, 60 + k * 26, a0, a0 + 1.6 * E.out(S(0.7 + k * 0.1, 1.3))); c.stroke(); }
      }
      c.fillStyle = BLACK; c.fillRect(colX(0), M - 6, (colX(11) + COLW - colX(0)) * E.inOut(S(0, 0.7)), 3);
      if (hp >= 1) { const sec = ['01  Data', '02  Learning loop', '03  Progress', '04  Summary'][page]; c.textAlign = 'right'; txt(sec, colX(11) + COLW, M + 22, 28, 600, page === 3 ? BLACK : RED); c.textAlign = 'left'; }
    }

    // ---------- page 0: data ----------
    if (page === 0 && t > 2.3) {
      const top = 130;
      c.fillStyle = BLACK; c.fillRect(colX(0), top, (colX(5) + COLW - colX(0)) * E.out(S(2.4, 2.9)), 2);
      txt('Training data: labelled examples', colX(0), top + 32, 28, 600);
      // two large annotated examples with leader rules landing on them
      pict(c, 'cat', colX(0) + 42, top + 100, 84 * E.back(S(2.6, 2.9)));
      pict(c, 'dog', colX(2) + 42, top + 100, 84 * E.back(S(2.75, 3.05)));
      const lp1 = E.out(S(3.0, 3.3)), lp2 = E.out(S(3.15, 3.45));
      rule(c, colX(1) + 40, top + 60, colX(0) + 70, top + 78, lp1, 1.5); if (lp1 >= 1) txt('cat', colX(1) + 44, top + 68, 28, 800, RED);
      rule(c, colX(3) + 40, top + 60, colX(2) + 72, top + 80, lp2, 1.5); if (lp2 >= 1) txt('dog', colX(3) + 44, top + 68, 28, 800, RED);
      // matrix of examples filling in reading order
      const mx = colX(0), my = top + 180, cell = 36, cols = 16, rows = 8, nShow = Math.floor(cols * rows * Math.pow(S(3.2, 5.5), 0.8));
      for (let i = 0; i < nShow; i++) { const k = H.rng(i * 13 + 5)() < 0.5 ? 'cat' : 'dog'; pict(c, k, mx + (i % cols) * cell + 16, my + Math.floor(i / cols) * cell + 16, 30); }
      // flow into the model
      rule(c, colX(6) + 10, my + 120, colX(7) - 10, my + 120, E.out(S(3.4, 3.8)), 2);
      for (let k = 0; k < 4; k++) { const u = ((t * 1.6 + k / 4) % 1); if (t > 3.8) { c.fillStyle = BLACK; c.fillRect(H.lerp(colX(6) + 10, colX(7) - 24, u) - 4, my + 116, 8, 8); } }
      const ms = E.out(S(2.9, 3.4)), bx = colX(7), by = my + 20;
      c.fillStyle = BLACK; c.fillRect(bx, by, (COLW * 3 + 32) * ms, 230);
      if (ms >= 1) { // mini network knocked out of the black block
        c.strokeStyle = PAPER; c.lineWidth = 1.2; const xs = [bx + 50, bx + 142, bx + 234], ys = [[50, 115, 180], [38, 88, 140, 192], [88, 140]];
        for (let a = 0; a < 2; a++) for (const y0 of ys[a]) for (const y1 of ys[a + 1]) { c.beginPath(); c.moveTo(xs[a], by + y0); c.lineTo(xs[a + 1], by + y1); c.stroke(); }
        c.fillStyle = PAPER; ys.forEach((col, a) => col.forEach((y) => { c.beginPath(); c.arc(xs[a], by + y, 8, 0, 7); c.fill(); }));
        txt('Model', bx, by + 266, 30, 800);
      }
      // counter
      const cp = S(3.0, 5.6), n = cp < 1 ? Math.pow(cp, 3) * 1e6 : 1e6;
      if (t > 3.0) { c.font = '800 96px "Inter"'; c.letterSpacing = '-5px'; c.fillStyle = RED; c.fillText(Math.round(n).toLocaleString('en-US'), colX(7) - 6, top + 92); c.letterSpacing = '0px';
        c.fillStyle = BLACK; c.fillRect(colX(7), top, (colX(11) + COLW - colX(7)) * E.out(S(2.9, 3.3)), 2); txt('examples', colX(7), top + 142, 28, 800); txt('seen in training', colX(9), top + 142, 28, 400); }
    }

    // ---------- page 1: guess -> check -> adjust ----------
    if (page === 1) {
      const t0 = swap(WIPES[0]);
      // step bar
      const steps = ['Guess', 'Check', 'Adjust'], act = t < 7.6 ? 0 : t < 8.3 ? 1 : t < 9.3 ? 2 : Math.floor((t - 9.3) * 2.5) % 3;
      steps.forEach((s, i) => {
        const x = colX(i * 3), p = E.out(S(t0 + 0.1 + i * 0.12, t0 + 0.4 + i * 0.12)); if (p <= 0) return;
        const on = i === act;
        c.fillStyle = on ? RED : BLACK; c.fillRect(x, 130, (COLW * 3 + 32) * p, on ? 6 : 2);
        txt(`${i + 1}`, x, 176, 28, 800, on ? RED : BLACK); txt(s, x + 30, 176, 28, 800, BLACK, -1);
      });
      // loop return rule: Adjust -> back to Guess
      { const p = E.inOut(S(9.0, 9.5)), y = 196, x1 = colX(0) + 10, x0 = colX(8) + 20;
        if (p > 0) { c.strokeStyle = BLACK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y - 8); c.lineTo(x0, y); c.lineTo(H.lerp(x0, x1, p), y); c.stroke(); if (p >= 1) rule(c, x1, y, x1, y - 12, 1, 1.5); }
        if (p >= 1) txt('repeat', colX(4), y + 32, 28, 800, RED); }
      // network
      const adj = E.inOut(S(8.35, 9.2)), layers = [[0, 3], [1, 4], [2, 4], [3, 2]], LX = [colX(2) + 40, colX(4) + 20, colX(6), colX(7) + 80], cy = 440;
      const nodes = layers.map(([li, n]) => Array.from({ length: n }, (_, k) => [LX[li], cy + (k - (n - 1) / 2) * 76]));
      const r = H.rng(808);
      for (let a = 0; a < 3; a++) for (const p0 of nodes[a]) for (const p1 of nodes[a + 1]) {
        const w0 = r.range(0.4, 3.2), w1 = r.range(0.4, 4.5), w = H.lerp(w0, w1, adj);
        c.strokeStyle = adj > 0 && adj < 1 ? RED : BLACK; c.lineWidth = w; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke();
      }
      const np = E.back(S(t0 + 0.2, t0 + 0.5));
      nodes.forEach((col) => col.forEach(([x, y]) => { c.fillStyle = BLACK; c.beginPath(); c.arc(x, y, 11 * np, 0, 7); c.fill(); c.fillStyle = PAPER; c.beginPath(); c.arc(x, y, 5 * np, 0, 7); c.fill(); }));
      // forward pass pulses (guess) and the error travelling back (adjust)
      const pulse = (ts, dir, col) => { const u = S(ts, ts + 0.6); if (u <= 0 || u >= 1) return; const f = dir > 0 ? u : 1 - u, xx = H.lerp(LX[0], LX[3], f); c.fillStyle = col; for (const k of [-1, 0, 1]) { c.beginPath(); c.arc(xx, cy + k * 72 + Math.sin(f * 9 + k) * 10, 7, 0, 7); c.fill(); } };
      pulse(7.0, 1, BLACK); pulse(7.85, -1, RED); pulse(9.35, 1, BLACK);
      // input picture
      pict(c, 'cat', colX(0) + 84, cy, 130 * E.back(S(t0 + 0.15, t0 + 0.5)));
      if (S(t0 + 0.4, t0 + 0.6) > 0) txt('New picture', colX(0), cy + 108, 28, 600);
      rule(c, colX(1) + 70, cy, LX[0] - 18, cy, E.out(S(t0 + 0.4, t0 + 0.7)), 2);
      // outputs: two labelled nodes; guess, check, correct
      const oN = nodes[3];
      txt('dog', oN[0][0] + 24, oN[0][1] + 10, 28, 600); txt('cat', oN[1][0] + 24, oN[1][1] + 10, 28, 600);
      const ox = colX(9) + 40;
      if (t > 7.5 && t < 9.4) {
        txt('dog?', ox, cy - 20, 54, 800, BLACK, -2);
        const sp = E.out(S(7.75, 7.95)); // check: struck out in red + cross
        if (sp > 0) { c.fillStyle = RED; c.fillRect(ox - 6, cy - 42, 140 * sp, 7); }
        const xp = E.out(S(7.8, 8.0)); if (xp > 0) { c.save(); c.translate(ox + 175, cy - 40); c.rotate(Math.PI / 4); c.fillStyle = RED; c.fillRect(-26 * xp, -5, 52 * xp, 10); c.fillRect(-5, -26 * xp, 10, 52 * xp); c.restore(); }
        if (t > 7.95) { txt('Wrong —', ox, cy + 22, 28, 800, RED); txt('it is a cat.', ox, cy + 54, 28, 800, RED); }
        if (t > 8.35) txt('Error flows back,', ox, cy + 100, 28, 400), txt('weights adjust.', ox, cy + 132, 28, 400);
      }
      if (t >= 9.4) {
        const p = E.out(S(9.6, 9.9));
        txt('cat', ox, cy - 20, 54, 800, BLACK, -2);
        if (p > 0) { c.save(); c.translate(ox + 120, cy - 34); c.strokeStyle = BLACK; c.lineWidth = 9; c.lineCap = 'butt'; c.beginPath(); c.moveTo(-14, 0); c.lineTo(0, 14 * p); c.lineTo(30 * p, -26 * p); c.stroke(); c.restore();
          c.fillStyle = RED; c.fillRect(ox, cy - 8, 92 * p, 6); txt('Correct.', ox, cy + 34, 28, 800); }
      }
      // highlight the chosen output node
      const sel = t < 9.4 ? oN[0] : oN[1];
      if (t > 7.5) { c.strokeStyle = t < 9.4 ? RED : BLACK; c.lineWidth = 3; c.beginPath(); c.arc(sel[0], sel[1], 19, 0, 7); c.stroke(); }
    }

    // ---------- page 2: progress ----------
    if (page === 2) {
      const t0 = swap(WIPES[1]), gx = colX(0) + 40, gy = 600, gw = colX(7) + COLW - gx, gh = 380;
      c.fillStyle = BLACK; c.fillRect(gx, gy, gw * E.out(S(t0, t0 + 0.3)), 2); c.fillRect(gx, gy - gh * E.out(S(t0, t0 + 0.3)), 2, gh * E.out(S(t0, t0 + 0.3)));
      for (let k = 0; k <= 5; k++) { const v = 50 + k * 10, y = gy - (v - 50) / 50 * gh; c.fillStyle = 'rgba(20,20,20,0.18)'; c.fillRect(gx, y, gw, 1); c.textAlign = 'right'; txt(v + '%', gx - 10, y + 7, 20, 400); c.textAlign = 'left'; }
      txt('Accuracy', gx, gy - gh - 14, 28, 800); c.textAlign = 'right'; txt('Training rounds →', gx + gw, gy + 38, 28, 600); c.textAlign = 'left';
      const prog = E.inOut(S(t0 + 0.2, 12.2)), N = 40, pts = [];
      for (let i = 0; i <= N; i++) { const u = i / N, acc = 61 + 36 * (1 - Math.pow(1 - u, 2.2)) + Math.sin(i * 2.3) * 1.2 * (1 - u); pts.push([gx + u * gw, gy - (acc - 50) / 50 * gh]); }
      const m = Math.floor(prog * N);
      c.strokeStyle = RED; c.lineWidth = 5; c.lineJoin = 'round'; c.beginPath(); for (let i = 0; i <= m; i++) i ? c.lineTo(...pts[i]) : c.moveTo(...pts[i]); c.stroke();
      if (m > 0) { c.fillStyle = RED; c.beginPath(); c.arc(pts[m][0], pts[m][1], 8, 0, 7); c.fill(); }
      const acc = Math.round(H.lerp(61, 97, prog));
      const em = E.out(S(12.15, 12.35)); // emphasis: red block slams behind the final number
      if (em > 0) { c.fillStyle = RED; c.fillRect(colX(8) - 8, 236, (colX(11) + COLW - colX(8) + 16) * em, 190); }
      c.font = '800 150px "Inter"'; c.letterSpacing = '-8px'; c.fillStyle = em >= 1 ? PAPER : BLACK; c.fillText(acc + '%', colX(8), 390); c.letterSpacing = '0px';
      txt('Accuracy per round', colX(8), 222, 28, 600); txt('61% → 97%', colX(8), 470, 36, 800, BLACK, -1);
    }

    // ---------- page 3: takeaway ----------
    if (page === 3) {
      const t0 = swap(WIPES[2]);
      c.font = '800 112px "Inter"'; c.letterSpacing = '-5px'; c.fillStyle = BLACK;
      const r1 = E.inOut(S(t0, t0 + 0.4)), r2 = E.inOut(S(t0 + 0.15, t0 + 0.55));
      c.save(); c.beginPath(); c.rect(0, 190, W, 154); c.clip(); c.fillText('More examples', M - 5, 318 + (1 - r1) * 130); c.restore();
      c.save(); c.beginPath(); c.rect(0, 344, W, 150); c.clip(); c.fillText('better guesses.', M - 5 + 160, 458 + (1 - r2) * 130); c.restore();
      c.letterSpacing = '0px';
      rule(c, M + 6, 410, M + 140, 410, E.out(S(t0 + 0.3, t0 + 0.6)), 12, RED);
      c.fillStyle = BLACK; c.fillRect(colX(0), 560, (colX(11) + COLW - colX(0)) * E.out(S(t0 + 0.3, t0 + 0.8)), 2);
      if (t > t0 + 0.6) { txt('1,000,000 examples', colX(0), 598, 28, 600); txt('Guess · Check · Adjust', colX(4), 598, 28, 600); txt('61% → 97% accuracy', colX(8), 598, 28, 600, RED); }
    }

    // ---------- the column wipes ----------
    for (const w of WIPES) {
      if (t < w || t > w + 1.2) continue;
      c.fillStyle = w === WIPES[2] ? BLACK : RED;
      for (let i = 0; i < 12; i++) { const a = E.inOut(S(w + i * 0.025, w + i * 0.025 + 0.28)), b = E.inOut(S(w + 0.6 + i * 0.025, w + 0.88 + i * 0.025)); const x = i * W / 12; if (a > b) c.fillRect(x, b * HH, W / 12 + 1, (a - b) * HH); }
    }

    // ---------- offset-print finish ----------
    const img = c.getImageData(0, 0, W, HH), d = img.data, n1 = exField('n1', W, HH, 3, 3, 2), n2 = exField('n2', W, HH, 8, 60, 3), sm = speckMask(W, HH);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) { if (!d[i + 3]) continue; d[i + 3] *= Math.max(0, 1 - 0.07 * Math.max(0, n1[p] * 1.5 + n2[p]) - sm[p]); }
    c.putImageData(img, 0, 0);
    ctx.save(); ctx.globalAlpha = 0.12; ctx.filter = 'blur(1.2px)'; ctx.drawImage(L, 0, 0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0); ctx.restore();
    const pi = ctx.getImageData(0, 0, W, HH), pd = pi.data, fib = exField('fib', W, HH, 21, 2, 2, 3, 0.6), lo = exField('lo', W, HH, 22, 30, 3), rg = H.rng(99 + Math.floor(t * 12));
    for (let i = 0, p = 0; i < pd.length; i += 4, p++) { const s = 1 + fib[p] * 0.022 + lo[p] * 0.02 + (rg() - 0.5) * 0.03; pd[i] *= s; pd[i + 1] *= s; pd[i + 2] *= s; }
    ctx.putImageData(pi, 0, 0);
    H.vignette(ctx, W, HH, 0.07, '40,30,20');
  };

  registerStyle({
    id: 'swiss-grid',
    name: 'International Typographic Style',
    category: 'Art & Design Movements',
    description: 'A 1960s Zürich-school concert-style poster: strict 12-column modular grid, enormous flush-left grotesk set tight, an asymmetric field of rotating concentric arc segments over a red disc, and small precise info blocks hung from the grid — red, black and white only.',
    motion: 'Rules draw out along the grid, the red disc opens and the ring segments spin in and decelerate until they lock onto a 22.5° module; the headline rises line by line out of its baseline masks and the info blocks step in column by column, then the rings drift like a slow mechanical score.',
    fonts: ['800 180px "Inter"', '600 13px "Inter"', '400 13px "Inter"'],
    frameT: 4.6,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'A Zürich-school information sequence on the same 12-column grid: the headline shrinks into a running header, pages change with a column-by-column red wipe, hairline rules with solid heads carry cause and flow, numbers count in Inter 800 and the key result gets a red block slammed behind it.',
    explainer(ctx, W, HH, t) { explainSwiss(ctx, W, HH, t); },
    // Sound: clean and exact. Page wipes are a riffle of 12 sheets falling column by column (left to right), set type
    // lands with a dry tap, hairline rules get a faint ruling-pen draw, counters click like a fine mechanical counter,
    // and the few tonal moments (wrong, correct, 97%, takeaway) are plain soft sine chimes. Times copied from explainSwiss().
    explainerSound(k) {
      const D = 15, E = H.ease, cl = H.clamp;
      const S = (t, a, b) => cl((t - a) / (b - a), 0, 1);
      const M = 48, PITCH = 100, colX = (i) => M + i * PITCH; // grid, as in explainSwiss
      const pan = (px) => cl((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (a, b, ease, u) => { for (let i = 0; i <= 400; i++) if (ease(i / 400) >= u - 1e-6) return a + ((b - a) * i) / 400; return b; };
      const backLand = (a, b) => a + (b - a) * 0.37; // back ease first reaches full size at 37%
      const WIPES = [5.8, 10.3, 12.7], swap = (w) => w + 0.58;
      // dry tap: set type or a pictogram landing on the sheet
      const tap = (t, g, p, minor = true) => { k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1700, q: 1.2, gain: 0.3 * g, a: 0.001, pan: p, minor }); k.tone(t, { f: 190, dur: 0.05, gain: 0.12 * g, pan: p, minor }); };
      // fine mechanical counter click
      const cnt = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.018, filter: 'bandpass', f: 3000, q: 2, gain: 0.34 * g, a: 0.001, pan: p }); k.tone(t, { f: 700, type: 'triangle', dur: 0.025, gain: 0.04 * g, pan: p }); });
      // ruling pen along a hairline: faint, smooth, low
      const ruleDraw = (t, dur, g, p) => k.noise(t, { dur: dur + 0.05, color: 'pink', filter: 'bandpass', f: [[0, 800], [dur, 1200]], q: 1, gain: 0.06 * g, a: dur * 0.3, pan: p, minor: true });
      // the column wipe: 12 sheets drop one after another, left to right, landing at w + i*0.025 + 0.28
      const riffle = (w, g) => {
        k.noise(w + 0.05, { dur: 0.55, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.3, 1100], [0.55, 600]], q: 0.8, gain: 0.05 * g, a: 0.22 });
        for (let i = 0; i < 12; i++) { const ti = w + i * 0.025 + 0.28, p = (i / 11 - 0.5) * 1.4;
          k.noise(ti, { dur: 0.035, filter: 'bandpass', f: 1300 + (i % 3) * 180, q: 1, gain: 0.24 * g, a: 0.002, pan: p }); k.tone(ti, { f: 150, dur: 0.05, gain: 0.05 * g, pan: p }); }
      };
      // plain soft sine chime (kept low: no high pings)
      const chime = (t, n, g, p, minor) => { const f = k.hz(n); k.tone(t, { f, dur: 1.1, gain: 0.16 * g, a: 0.004, pan: p, verb: 0.25, minor }); k.tone(t, { f: f * 2, dur: 0.35, gain: 0.03 * g, a: 0.003, pan: p, minor }); };

      k.bed('room', 0, D, { gain: 0.3 });

      // ---- hook: header rule (0-0.7), headline rises line by line (inOut 0.15-0.65, 0.35-0.85), red disc (back 0.5-1.0)
      ruleDraw(0.0, 0.65, 1, -0.2);
      tap(when(0.15, 0.65, E.inOut, 0.97), 1.1, -0.5, false);
      tap(when(0.35, 0.85, E.inOut, 0.97), 1.1, -0.3, false);
      k.play('thud', backLand(0.5, 1.0), { f: 120, gain: 0.45, pan: pan(942) });
      tap(backLand(0.5, 1.0), 0.6, pan(942));
      // headline shrinks into the running header (1.7-2.4): a soft slide
      k.noise(1.7, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 350], [0.7, 800]], q: 0.7, gain: 0.07, a: 0.3, pan: -0.4, minor: true });

      // ---- page 0: DATA
      ruleDraw(2.4, 0.5, 1, pan(300));
      tap(backLand(2.6, 2.9), 0.9, pan(90));  // cat pictogram
      tap(backLand(2.75, 3.05), 0.9, pan(290)); // dog pictogram
      k.play('tock', when(2.9, 3.4, E.out, 0.97), { f: 330, gain: 0.5, pan: pan(900), minor: true }); // model block set
      tap(3.32, 0.8, pan(184)); tap(3.46, 0.8, pan(384)); // "cat" / "dog" labels at the leader heads
      // matrix fills in reading order: a soft tap each time a row of 16 completes (n = 128 * S(3.2,5.5)^0.8)
      const rows = []; for (let r = 1; r <= 8; r++) rows.push(3.2 + 2.3 * Math.pow(r / 8, 1.25));
      rows.forEach((t) => { if (Math.abs(t - 3.32) > 0.08 && Math.abs(t - 3.46) > 0.08) tap(t, 0.45, pan(330), true); });
      // counter n = S(3.0,5.6)^3 * 1e6: clicks speeding up, keeping clear of the row taps
      for (let t = 3.05; t < 5.52; ) { const s = S(t, 3.0, 5.6); if (![...rows, 3.32, 3.46].some((r) => t > r - 0.07 && t < r + 0.08)) cnt(t, 0.8 + 0.3 * s, pan(900)); t += 0.16 - 0.075 * s; }
      k.play('thud', 5.6, { f: 150, gain: 0.55, pan: pan(900) }); tap(5.6, 1.2, pan(900), false); // 1,000,000 set

      // ---- page wipes
      riffle(WIPES[0], 1); riffle(WIPES[0] + 0.6, 0.6); // red columns fall, then lift off the new page
      riffle(WIPES[1], 1); riffle(WIPES[1] + 0.6, 0.6);
      riffle(WIPES[2], 1); riffle(WIPES[2] + 0.6, 0.6);

      // ---- page 1: GUESS / CHECK / ADJUST (t0 = swap(5.8) = 6.38)
      const p1 = swap(WIPES[0]);
      tap(backLand(p1 + 0.15, p1 + 0.5), 0.8, pan(130)); // cat picture + nodes
      // forward pass (7.0-7.6): a quiet travelling sweep left -> right
      k.noise(7.0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 600], [0.6, 1500]], q: 1.5, gain: 0.07, a: 0.2, pan: 0.1, minor: true });
      tap(7.5, 1, pan(980), false); // "dog?" set, output node ringed
      // check (7.75-8.0): red strike, cross — the wrong guess
      k.noise(7.75, { dur: 0.12, filter: 'bandpass', f: [[0, 900], [0.12, 2200]], q: 0.8, gain: 0.18, a: 0.01, pan: pan(1060) });
      k.play('thud', 7.82, { f: 110, gain: 0.7, pan: pan(1150) });
      k.tone(7.82, { f: 'A2', type: 'triangle', dur: 0.5, gain: 0.16, a: 0.005, filter: 'lowpass', f2: 900, pan: pan(1150) });
      k.tone(7.82, { f: 'Bb2', type: 'triangle', dur: 0.5, gain: 0.14, a: 0.005, filter: 'lowpass', f2: 900, pan: pan(1150) });
      // error flows back right -> left (7.85-8.45)
      k.noise(7.9, { dur: 0.55, color: 'pink', filter: 'bandpass', f: [[0, 1400], [0.55, 500]], q: 1.5, gain: 0.08, a: 0.15, pan: -0.1, minor: true });
      // weights re-set (inOut 8.35-9.2): fine detents, at least 90 ms apart
      for (let i = 1, lt = 0; i <= 8; i++) { const t = when(8.35, 9.2, E.inOut, i / 8); if (t - lt < 0.09) continue; lt = t; cnt(t, 0.9, pan(500)); }
      ruleDraw(9.0, 0.5, 1, pan(500)); // loop return rule
      tap(9.5, 0.8, pan(450)); // "repeat"
      tap(9.4, 0.8, pan(980)); // "cat" set
      // the correction: check mark + red rule + "Correct." (9.6-9.9)
      chime(9.62, 'C5', 1, pan(1100)); chime(9.72, 'G5', 0.9, pan(1100));

      // ---- page 2: PROGRESS (t0 = swap(10.3) = 10.88)
      const p2 = swap(WIPES[1]);
      ruleDraw(p2, 0.3, 1, pan(400));
      k.play('stroke', p2 + 0.2, { material: 'pen', dur: 12.2 - p2 - 0.2, gain: 0.18, pan: pan(400), minor: true }); // red line inks along
      for (let t = p2 + 0.22, last = 61, lt = -1; t < 12.12; t += 1 / 120) {
        const v = Math.round(H.lerp(61, 97, E.inOut(S(t, p2 + 0.2, 12.2))));
        if (v !== last && t - lt >= 1 / 11) { cnt(t, 0.9, pan(1000)); last = v; lt = t; }
      }
      // 97%: the red block slams in behind the number (12.15-12.35) — the biggest hit
      const slam = when(12.15, 12.35, E.out, 0.9);
      k.play('impact', slam, { gain: 1.2, pan: pan(1000) });
      k.play('thud', slam, { f: 140, gain: 0.6, pan: pan(1000) });
      ['C4', 'G4', 'C5'].forEach((n, i) => chime(slam + 0.01, n, 0.8, pan(1000) + (i - 1) * 0.15));

      // ---- page 3: TAKEAWAY (t0 = swap(12.7) = 13.28): two lines rise in, red rule, hairline, footnotes
      const p3 = swap(WIPES[2]);
      tap(when(p3, p3 + 0.4, E.inOut, 0.97), 1, -0.3, false);
      tap(when(p3 + 0.15, p3 + 0.55, E.inOut, 0.97), 1, 0.1, false);
      ruleDraw(p3 + 0.3, 0.5, 1, 0);
      ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => chime(p3 + 0.6 + i * 0.06, n, 0.55 - i * 0.06, (i - 1.5) * 0.25)); // resolves as the footnotes set
    },
    draw(ctx, W, HH, t) {
      const M = 48, PITCH = 100, COLW = 84;
      const colX = (i) => M + i * PITCH;
      const P = (d, dur = 0.6) => H.ease.out(H.clamp((t - d) / dur, 0, 1));

      // ---------- paper ----------
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, HH);

      // ---------- art layer (all inks) ----------
      const L = H.layer(W, HH), c = L.getContext('2d');

      // red disc
      const ox = 958, oy = 262;
      c.fillStyle = RED;
      c.beginPath(); c.arc(ox, oy, 205 * P(0.2, 0.8), 0, Math.PI * 2); c.fill();

      // concentric arc segments (the "score")
      const rr = H.rng(404);
      c.strokeStyle = BLACK; c.lineCap = 'butt';
      for (let k = 0; k < 17; k++) {
        const rad = 46 + k * 19;
        const lw = H.lerp(12, 5, k / 16);
        const Q = Math.PI / 8; // angles snap to a 22.5° module at the hero frame
        const len = rr.int(2, 9) * Q;
        const spd = rr.range(-0.4, 0.4);
        // the rings spin in and decelerate onto the module (locked at t=3.2), then drift very slowly
        const settle = t < 3.2 ? -Math.pow(3.2 - t, 2) * 0.9 : (t - 3.2) * 0.05;
        const a0 = rr.int(0, 15) * Q + settle * spd * 2.2;
        const grow = P(0.4 + k * 0.06, 0.9);
        c.lineWidth = lw;
        c.beginPath(); c.arc(ox, oy, rad, a0, a0 + len * grow); c.stroke();
        if (rr() < 0.45) { // a second, shorter segment on the same ring
          const b0 = a0 + len + rr.int(1, 3) * Q;
          c.beginPath(); c.arc(ox, oy, rad, b0, b0 + rr.int(1, 3) * Q * grow); c.stroke();
        }
      }
      // one red ring segment outside the disc, bleeding off the top edge
      c.strokeStyle = RED; c.lineWidth = 6;
      { const g = P(1.3, 0.8); if (g > 0) { c.beginPath(); c.arc(ox, oy, 46 + 17 * 19, -Math.PI * 0.95 + t * 0.12, -Math.PI * 0.95 + t * 0.12 + Math.PI * 0.6 * g); c.stroke(); } }
      // centre point
      const cp = H.ease.back(H.clamp((t - 0.9) / 0.35, 0, 1));
      c.fillStyle = PAPER; c.beginPath(); c.arc(ox, oy, 14 * cp, 0, 7); c.fill();
      c.fillStyle = BLACK; c.beginPath(); c.arc(ox, oy, 6 * cp, 0, 7); c.fill();

      // ---------- headline: huge, flush left, tight ----------
      c.fillStyle = BLACK; c.textBaseline = 'alphabetic';
      c.letterSpacing = '0px';
      c.font = '800 100px "Inter"';
      const targetW = colX(7) + COLW - M; // span cols 0..7
      c.letterSpacing = '-5px';
      const w100 = c.measureText('Networks').width;
      const fs = Math.floor(100 * targetW / w100);
      c.font = `800 ${fs}px "Inter"`; c.letterSpacing = `${-(fs * 0.045).toFixed(1)}px`;
      const baseB = HH - M - 2, lead = fs * 0.84;
      // each line rises out of its own baseline mask
      const rise = (txt, d, yb) => { const p = H.ease.inOut(H.clamp((t - d) / 0.55, 0, 1)); if (p <= 0) return; c.save(); c.beginPath(); c.rect(0, yb - fs * 0.86, W, fs * 0.86 + fs * 0.06); c.clip(); c.fillText(txt, M - fs * 0.055, yb + (1 - p) * fs * 0.9); c.restore(); };
      rise('Neural', 0.95, baseB - lead);
      rise('Networks', 1.15, baseB);
      c.letterSpacing = '0px';

      // ---------- grid-hung info blocks ----------
      const small = (txt, x, y, wgt = 400, col = BLACK) => { c.font = `${wgt} 13px "Inter"`; c.fillStyle = col; c.fillText(txt, x, y); };
      const LH = 17;
      const top = M + 12;
      const blk = (d) => { const p = P(d, 0.3); c.restore(); c.save(); c.globalAlpha = p; c.translate(0, (1 - p) * 10); };
      c.save();
      c.fillStyle = BLACK; c.fillRect(colX(0), M - 2, (colX(5) + COLW - colX(0)) * H.ease.inOut(H.clamp(t / 0.6, 0, 1)), 3);
      blk(1.65);
      small('Lecture series', colX(0), top + 14, 600);
      small('Machine', colX(0), top + 14 + LH);
      small('Intelligence', colX(0), top + 14 + LH * 2);

      blk(1.77);
      small('Thursday', colX(2), top + 14, 600);
      small('14 November 2026', colX(2), top + 14 + LH);
      small('19.30 h', colX(2), top + 14 + LH * 2);

      blk(1.89);
      small('Auditorium E1', colX(4), top + 14, 600);
      small('School of Design', colX(4), top + 14 + LH);
      small('Free admission', colX(4), top + 14 + LH * 2);

      // big red issue number on grid
      blk(1.7);
      c.font = `800 64px "Inter"`; c.letterSpacing = '-3px'; c.fillStyle = RED;
      c.fillText('04', colX(0) - 3, top + 14 + LH * 2 + 72);
      c.letterSpacing = '0px';
      blk(2.05);
      small('How machines learn', colX(2), top + 14 + LH * 4 + 6, 600);
      small('to see patterns —', colX(2), top + 14 + LH * 5 + 6);
      small('weights, layers and', colX(2), top + 14 + LH * 6 + 6);
      small('the gradient descent.', colX(2), top + 14 + LH * 7 + 6);

      // bottom-right block under the arc field
      const by = HH - M - LH * 3 + 4;
      c.restore(); c.save();
      c.fillStyle = BLACK; c.fillRect(colX(9), by - 22, (colX(11) + COLW - colX(9)) * H.ease.inOut(H.clamp((t - 0.15) / 0.6, 0, 1)), 3);
      blk(2.2);
      small('Talk 04 / 12', colX(9), by, 600);
      small('Layers, signals,', colX(9), by + LH);
      small('feedback', colX(9), by + LH * 2);
      blk(2.32);
      small('Speaker', colX(11) - 16, by, 600);
      small('Dr. A. Lenz', colX(11) - 16, by + LH);
      small('Zürich', colX(11) - 16, by + LH * 2);
      // tiny vertical colophon on the right margin
      blk(2.5);
      c.save(); c.translate(W - 20, M); c.rotate(Math.PI / 2); small('Printed in Switzerland · Offset 2-colour · 128 × 90.5 cm', 0, 0, 400); c.restore();
      c.restore(); c.globalAlpha = 1;

      // ---------- offset-print finish on the ink layer ----------
      const img = c.getImageData(0, 0, W, HH), d = img.data;
      const n1 = exField('n1', W, HH, 3, 3, 2), n2 = exField('n2', W, HH, 8, 60, 3), r = H.rng(12);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        if (!d[i + 3]) continue;
        const a = 1 - 0.07 * Math.max(0, n1[p] * 1.5 + n2[p]) - (r() < 0.0015 ? 0.5 : 0);
        d[i + 3] *= a;
      }
      c.putImageData(img, 0, 0);
      // slight dot gain halo: draw the layer once blurred faint, then crisp
      ctx.save(); ctx.globalAlpha = 0.12; ctx.filter = 'blur(1.2px)'; ctx.drawImage(L, 0, 0); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0); ctx.restore();

      // paper fibre + grain
      const pi = ctx.getImageData(0, 0, W, HH), pd = pi.data, fib = exField('fib', W, HH, 21, 2, 2, 3, 0.6), lo = exField('lo', W, HH, 22, 30, 3), rg = H.rng(99);
      for (let i = 0, p = 0; i < pd.length; i += 4, p++) {
        const s = 1 + fib[p] * 0.022 + lo[p] * 0.02 + (rg() - 0.5) * 0.035;
        pd[i] *= s; pd[i + 1] *= s; pd[i + 2] *= s;
      }
      ctx.putImageData(pi, 0, 0);
      H.vignette(ctx, W, HH, 0.07, '40,30,20');
    },
  });
}
```
