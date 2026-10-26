I want an animated explainer made in the "Pointillist Afternoon" visual style (Painterly). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Playfair Display
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,800;1,400&display=block">
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
Name: Pointillist Afternoon
Family: Painterly
Look: Neo-Impressionist divisionism: every form is built from small dabs of unmixed pigment — complementary hues side by side that blend optically — with the canvas weave peeking between the dots and a dotted painted border.
Motion: Dots shimmer as individual dabs re-pick their hue each frame while the overall colour holds, like light vibrating on the water; the sailboat drifts and the parasol sways.
How it explains: Every frame re-dabs one fixed field of pure-pigment dots against the current scene, so moving things shimmer as dots re-pick their hue; scene changes are the canvas being re-dabbed in a diagonal sweep, and lettering, arrows, counters and the emphasis rings are all fine dabs.

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

REFERENCE STYLE SOURCE (styles/pointillism.js; W/H_ are always 1280x720)
```js
{
  // ---------------------------------------------------------------
  // Pointillism — pure-hue dabs that mix in the eye, on a woven canvas
  // ---------------------------------------------------------------
  const PIG = [
    [250, 246, 230], // lead white
    [248, 216, 64],  // lemon yellow
    [240, 150, 46],  // orange
    [214, 66, 44],   // vermilion
    [232, 138, 156], // rose
    [126, 82, 168],  // violet
    [44, 62, 168],   // ultramarine
    [74, 146, 214],  // cerulean
    [36, 148, 96],   // emerald
    [158, 196, 62],  // yellow-green
    [28, 84, 66],    // viridian deep
    [204, 150, 72],  // ochre
    [36, 34, 92],    // deep ultramarine (no black on the palette)
  ];
  const css = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  // Seurat's vibration: each pigment's complement (index into PIG), laid in beside it now and then
  //            white lemon orange verm. rose violet ultra cerul. emer. y-grn viri. ochre deep
  const COMP = [0,    5,    7,     8,    9,   1,     2,    2,     4,   5,    3,   6,    11];


  // =================================================================
  // EXPLAINER — "How does AI learn?" in divisionist dots. Every frame re-dabs a fixed field of dots against
  // a colour study of the current scene; scene changes are the painter re-dabbing the canvas in a diagonal
  // sweep (dots pop to their new hue behind the front). Lettering, arrows and numbers are fine dabs.
  // =================================================================
  let PXC = null;
  const clP = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ezP = (u) => H.ease.inOut(clP(u));
  const wP = (t, a, b) => clP((t - a) / (b - a));
  const lerpP = (a, b, u) => a + (b - a) * u;
  const PAL_INK = [6, 6, 6, 6, 12, 12, 5, 6, 3], PAL_RED = [3, 3, 3, 2, 4, 3], PAL_GREEN = [8, 8, 10, 10, 6, 9], PAL_GOLD = [1, 1, 2, 0, 11];
  function pxCache(W, H_) {
    if (PXC) return PXC;
    const C = { glyph: new Map() };
    const tex = H.layer(W, H_), tc = tex.getContext('2d');
    tc.fillStyle = 'rgb(232,222,198)'; tc.fillRect(0, 0, W, H_);
    tc.globalAlpha = 0.16; tc.fillStyle = 'rgb(150,130,100)'; for (let y = 0; y < H_; y += 3) tc.fillRect(0, y, W, 1);
    tc.globalAlpha = 0.1; for (let x = 0; x < W; x += 3) tc.fillRect(x, 0, 1, H_);
    C.tex = tex;
    // brush touches: larger oval dabs laid along a slow flow field (the painter's hand), not random round dots
    const rp = H.rng(2025), nzf = H.makeNoise(2026), sp = 5.6, pos = [];
    for (let y = 6; y < H_ - 4; y += sp * 0.87) for (let x = 6; x < W - 4; x += sp) {
      const px = x + rp.range(-1.6, 1.6) + ((y / sp) & 1) * sp * 0.5, py = y + rp.range(-1.4, 1.4);
      pos.push(px, py, rp.range(2.6, 3.4), -0.6 + 0.5 * nzf.n2(px * 0.004, py * 0.004) + rp.range(-0.18, 0.18), rp());
    }
    C.pos = new Float32Array(pos); C.n = pos.length / 5;
    C.study = H.layer(W, H_); C.study2 = H.layer(W, H_);
    // the painted border of dots (hero step 5), baked once: darker complementary dabs travelling round the frame
    C.border = H.layer(W, H_); { const bc = C.border.getContext('2d'), br = H.rng(66), bl = PIG.map(() => []);
      for (let k = 0; k < 2600; k++) {
        const side = br.int(0, 3), along = br(), depth = br.range(2, 16);
        const x = side === 0 || side === 1 ? along * W : side === 2 ? depth : W - depth, y = side === 0 ? depth : side === 1 ? H_ - depth : along * H_;
        bl[br.pick([6, 6, 12, 5, 2, 3, 6, 12])].push([x, y, br.range(2, 2.8), br() * 3]);
      }
      bc.shadowColor = 'rgba(52,38,74,0.42)'; bc.shadowOffsetX = 1.2; bc.shadowOffsetY = 1.6; batchFill(bc, bl); }
    PXC = C;
    return C;
  }
  // fine-dab glyphs, cached per (char,size)
  function glyph(ch, size) {
    const C = PXC, key = ch + '|' + size;
    let g = C.glyph.get(key);
    if (g) return g;
    const font = `800 italic ${size}px "Playfair Display"`, m = H.layer(4, 4).getContext('2d'); m.font = font;
    const adv = m.measureText(ch).width, w = Math.ceil(adv + size * 0.5), h = Math.ceil(size * 1.4);
    const cv = H.layer(w, h), c = cv.getContext('2d'); c.font = font; c.fillStyle = '#000'; c.fillText(ch, size * 0.15, size * 1.05);
    const d = c.getImageData(0, 0, w, h).data, r = H.rng(ch.charCodeAt(0) * 131 + size), st = Math.max(1.35, size / 30), dots = [];
    for (let y = 0; y < h; y += st) for (let x = 0; x < w; x += st) {
      const xx = x + r.range(-0.5, 0.5), yy = y + r.range(-0.5, 0.5), k = ((yy | 0) * w + (xx | 0)) * 4 + 3;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h && d[k] > 110) dots.push([xx - size * 0.15, yy - size * 1.05, st * r.range(0.72, 0.92), r(), r()]);
    }
    g = { adv, dots };
    C.glyph.set(key, g);
    return g;
  }
  function batchFill(ctx, lists, ratio = 0.8) {
    lists.forEach((list, p) => {
      if (!list.length) return;
      ctx.fillStyle = `rgb(${PIG[p][0]},${PIG[p][1]},${PIG[p][2]})`;
      // fill in chunks: one huge multi-subpath path rasterises far slower than many modest ones
      for (let s = 0; s < list.length; s += 600) {
        ctx.beginPath();
        for (let i = s, e = Math.min(list.length, s + 600); i < e; i++) { const [x, y, rr, a] = list[i]; ctx.moveTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); ctx.ellipse(x, y, rr, rr * ratio, a, 0, 6.2832); }
        ctx.fill();
      }
    });
  }
  const textW = (str, size) => { let w = 0; for (const ch of str) w += glyph(ch, size).adv; return w; };
  // lettering dabbed in fine dots; reveal sweeps left to right, each dot popping on in turn
  function dotText(ctx, str, x, y, size, { align = 'left', reveal = 1, pal = PAL_INK, scale = 1 } = {}) {
    if (reveal <= 0) return;
    const lists = PIG.map(() => []), tw = textW(str, size);
    let cx = align === 'center' ? -tw / 2 : align === 'right' ? -tw : 0;
    const n = [...str].length;
    [...str].forEach((ch, i) => {
      const g = glyph(ch, size), lr = clP(reveal * (n + 2) - i);
      if (lr > 0) for (const [dx, dy, rr, q, q2] of g.dots) if (q < lr) lists[pal[(q2 * pal.length) | 0]].push([x + (cx + dx) * scale, y + dy * scale, rr * scale, q * 3]);
      cx += g.adv;
    });
    batchFill(ctx, lists);
  }
  // dotted arrow / line, dabbed along the path as it is drawn on
  function dotPath(ctx, pts, prog, width, pal, seed, head = true) {
    if (prog <= 0) return;
    const lists = PIG.map(() => []), r = H.rng(seed);
    let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
    const upto = L * clP(prog);
    let acc = 0, ang = 0, ex = pts[0][0], ey = pts[0][1];
    for (let i = 1; i < pts.length && acc < upto; i++) {
      const a = pts[i - 1], b = pts[i], l = seg[i - 1]; ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      for (let s = 0; s < l && acc + s < upto; s += 2.4) {
        const u = s / l, x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u; ex = x; ey = y;
        for (let k = 0; k < Math.max(1, Math.round(width / 2.4)); k++) { const o = (k + 0.5 - width / 4.8) * 2.4 + r.range(-0.7, 0.7); lists[pal[(r() * pal.length) | 0]].push([x - Math.sin(ang) * o, y + Math.cos(ang) * o, r.range(1.1, 1.5), r() * 3]); }
      }
      acc += l;
    }
    if (head && prog >= 1) for (const sgn of [-1, 1]) for (let s = 0; s < width * 3.2; s += 2.2) { const a = ang + Math.PI + sgn * 0.55; for (let k = 0; k < 2; k++) lists[pal[(r() * pal.length) | 0]].push([ex + Math.cos(a) * s + r.range(-0.8, 0.8), ey + Math.sin(a) * s + r.range(-0.8, 0.8), r.range(1.1, 1.5), r() * 3]); }
    batchFill(ctx, lists);
  }
  const bezP = (p0, p1, p2, p3, n = 30) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, a = 1 - u; o.push([a * a * a * p0[0] + 3 * a * a * u * p1[0] + 3 * a * u * u * p2[0] + u * u * u * p3[0], a * a * a * p0[1] + 3 * a * a * u * p1[1] + 3 * a * u * u * p2[1] + u * u * u * p3[1]]); } return o; };
  const ringP = (cx, cy, rx, ry, a0 = -0.6, turns = 1.08, n = 50) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI * 2 * turns; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const fmtP = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // ----- the colour studies (what the dots are trying to mix to) -----
  function studyScene(u, sc, t, W, H_) {
    const lg = (y0, y1, stops) => { const g = u.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
    u.fillStyle = lg(0, 300, [[0, 'rgb(86,142,214)'], [0.6, 'rgb(158,190,226)'], [1, 'rgb(238,214,184)']]); u.fillRect(0, 0, W, 300);
    u.fillStyle = 'rgb(130,152,148)'; u.beginPath(); u.moveTo(0, 310); for (let x = 0; x <= W; x += 20) u.lineTo(x, 286 - 16 * Math.abs(Math.sin(x * 0.021)) - 8 * Math.sin(x * 0.007)); u.lineTo(W, 310); u.fill();
    u.fillStyle = lg(300, 390, [[0, 'rgb(150,186,214)'], [1, 'rgb(70,124,184)']]); u.fillRect(0, 300, W, 90);
    // warm haze where sky meets the far bank, sun glints on the water (light from the left)
    u.fillStyle = lg(230, 330, [[0, 'rgba(250,214,170,0)'], [0.55, 'rgba(250,214,170,0.2)'], [1, 'rgba(250,214,170,0)']]); u.fillRect(0, 230, W, 100);
    u.fillStyle = 'rgba(252,238,196,0.7)'; for (let k = 0; k < 7; k++) u.fillRect(120 + Math.sin(k * 2.3) * 50, 318 + k * 10, 170 - k * 14, 3);
    u.fillStyle = lg(380, 720, [[0, 'rgb(164,200,82)'], [0.55, 'rgb(124,174,64)'], [0.8, 'rgb(70,132,80)'], [1, 'rgb(40,92,96)']]); u.fillRect(0, 386, W, 340);
    { const g = u.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(250,226,140,0.28)'); g.addColorStop(0.5, 'rgba(250,226,140,0)'); g.addColorStop(1, 'rgba(60,70,150,0.16)'); u.fillStyle = g; u.fillRect(0, 386, W, 340); }
    // violet cast shadow, thrown down-right (light from the upper left), soft-edged
    const shadow = (fn) => { u.save(); u.filter = 'blur(10px)'; u.fillStyle = 'rgba(96,70,150,0.55)'; fn(); u.restore(); };
    // labels sit on feathered pale-peach grounds so the dots thin out at the edges (no sticker boxes)
    const ribbon = (x, y, w, h) => { u.save(); u.shadowColor = 'rgb(250,230,212)'; u.shadowBlur = 14; u.fillStyle = 'rgb(250,232,214)'; u.beginPath(); u.roundRect(x + 4, y + 4, Math.max(0, w - 8), h - 8, 14); u.fill(); u.restore(); };
    const orb = (x, y, r, flash, spin) => {
      shadow(() => { u.beginPath(); u.ellipse(x + r * 0.55, y + r + 92, r * 0.95, 20, 0, 0, 7); u.fill(); });
      u.fillStyle = 'rgb(70,56,110)'; u.fillRect(x - 18, y + r - 6, 36, 90); u.beginPath(); u.ellipse(x, y + r + 86, 60, 14, 0, 0, 7); u.fill();
      const g = u.createRadialGradient(x - r * 0.2, y - r * 0.2, 4, x, y, r * (1 + flash * 0.25)); g.addColorStop(0, flash > 0.2 ? 'rgb(255,250,226)' : 'rgb(252,232,140)'); g.addColorStop(0.55, 'rgb(242,168,66)'); g.addColorStop(1, 'rgb(150,70,120)');
      u.fillStyle = g; u.beginPath(); u.arc(x, y, r * (1 + flash * 0.12), 0, 7); u.fill();
      u.strokeStyle = 'rgb(40,36,96)'; u.lineWidth = 7; u.lineCap = 'round';
      for (let k = 0; k < 3; k++) { const a = -2.4 + k * 1.0 + spin * (k === 1 ? -0.9 : 0.8); u.beginPath(); u.moveTo(x - 46 + k * 46, y + 30); u.lineTo(x - 46 + k * 46 + Math.cos(a) * 30, y + 30 + Math.sin(a) * 30); u.stroke(); u.beginPath(); u.arc(x - 46 + k * 46, y + 30, 18, 0, 7); u.lineWidth = 3; u.stroke(); u.lineWidth = 7; }
    };
    const card = (x, y, s, dog) => {
      u.fillStyle = 'rgba(96,70,150,0.5)'; u.fillRect(x - s / 2 + s * 0.09, y - s / 2 + s * 0.11, s, s);
      u.fillStyle = 'rgb(248,242,224)'; u.fillRect(x - s / 2, y - s / 2, s, s);
      if (dog) { u.fillStyle = 'rgb(150,96,60)'; u.beginPath(); u.ellipse(x, y + s * 0.04, s * 0.28, s * 0.27, 0, 0, 7); u.fill(); u.fillStyle = 'rgb(90,56,40)'; for (const k of [-1, 1]) { u.beginPath(); u.ellipse(x + k * s * 0.3, y + s * 0.06, s * 0.09, s * 0.2, k * 0.3, 0, 7); u.fill(); } }
      else { u.fillStyle = 'rgb(236,130,50)'; u.beginPath(); [[-0.32, 0], [-0.3, -0.36], [-0.1, -0.2], [0.1, -0.2], [0.3, -0.36], [0.32, 0], [0.22, 0.24], [0, 0.32], [-0.22, 0.24]].forEach(([a, b], i) => (i ? u.lineTo(x + a * s, y + b * s) : u.moveTo(x + a * s, y + b * s))); u.fill(); }
      u.fillStyle = 'rgb(30,30,80)'; u.beginPath(); u.arc(x - s * 0.1, y, s * 0.04, 0, 7); u.arc(x + s * 0.1, y, s * 0.04, 0, 7); u.fill();
    };
    if (t > 1.9) ribbon(18, 14, 500 * clP((t - 1.9) / 0.3), 76);
    if (sc === 1) {
      // sandy path to the model
      u.strokeStyle = 'rgb(226,200,150)'; u.lineWidth = 34; u.lineCap = 'round'; u.beginPath(); u.moveTo(-30, 540); u.bezierCurveTo(300, 580, 600, 470, 960, 400); u.stroke();
      if (t > 1.0) orb(1080, 300, 100 * H.ease.back(wP(t, 1.0, 1.6)), 0, 0);
      if (t > 2.4) ribbon(1000, 548, 162, 52);
      for (const c of P_cards(t)) card(c.x, c.y, c.s, c.dog);
      if (t > 2.9) ribbon(46, 600, 720, 104);
    }
    if (sc === 2) {
      const flash = Math.sin(Math.PI * wP(t, 8.6, 9.6)), spin = ezP((t - 8.7) / 0.6);
      orb(290, 370, 135, flash, spin); ribbon(205, 618, 172, 54);
      card(1060, 250, 220, false); if (t > 6.8) ribbon(960, 376, 200, 52);
      u.fillStyle = 'rgb(248,242,224)'; u.beginPath(); u.ellipse(660, 196, 196, 104, 0, 0, 7); u.fill(); u.beginPath(); u.moveTo(540, 260); u.lineTo(500, 330); u.lineTo(600, 280); u.fill();
      if (t > 6.9) ribbon(330, 112, 140, 54); if (t > 7.6) ribbon(830, 72, 140, 54); if (t > 8.45) ribbon(722, 560, 166, 56);
      if (t > 7.95 && t < 9.4) ribbon(950, 430, 220, 54);
    }
    if (sc === 3) {
      const pr = wP(t, 11.2, 12.7), N = 24, pts = P_chart();
      const lx = lerpP(160, 980, pr), area = () => { u.beginPath(); u.moveTo(160, 560); for (let i = 0; i <= N * pr; i++) u.lineTo(pts[i][0], pts[i][1]); u.lineTo(lx, 560); u.closePath(); };
      if (pr > 0) shadow(() => { u.translate(16, 14); area(); u.fill(); });
      u.fillStyle = lg(170, 560, [[0, 'rgb(254,228,96)'], [0.6, 'rgb(246,172,64)'], [0.88, 'rgb(232,130,70)'], [1, 'rgb(140,100,178)']]); area(); u.fill();
      ribbon(170, 98, 560, 76); ribbon(400, 584, 340, 50);
      if (t > 12.7) { const k = Math.sin(Math.PI * wP(t, 12.7, 13.4)); const g = u.createRadialGradient(980, pts[N][1], 2, 980, pts[N][1], 120); g.addColorStop(0, `rgba(255,246,190,${k})`); g.addColorStop(1, 'rgba(255,246,190,0)'); u.fillStyle = g; u.fillRect(840, 40, 280, 300); }
      if (t > 13.15) ribbon(110, 628, 1060, 84);
    }
  }
  function P_cards(t) {
    const out = [];
    for (let i = 0; i < 24; i++) {
      const s0 = 2.5 + i * 0.15, v = (t - s0) / 1.5;
      if (v <= 0 || v >= 1) continue;
      const a = 1 - v, x = a * a * a * -30 + 3 * a * a * v * 300 + 3 * a * v * v * 600 + v * v * v * 980, y = a * a * a * 540 + 3 * a * a * v * 580 + 3 * a * v * v * 470 + v * v * v * 330;
      out.push({ x, y: y - 64, s: v > 0.8 ? 92 * (1 - (v - 0.8) / 0.2 * 0.9) : 92, dog: (i % 2 === 1) !== (i % 5 === 0) });
    }
    return out;
  }
  function P_chart() { const N = 24, pts = []; for (let i = 0; i <= N; i++) { const acc = 61 + 36 * (1 - Math.exp(-i / 5.5)) / (1 - Math.exp(-N / 5.5)) + (i > 0 && i < N ? Math.sin(i * 2.7) * 1.6 : 0); pts.push([160 + i / N * 820, 560 - (acc - 50) / 50 * 380]); } return pts; }

  // ----- the fine-dab layer for each scene (text, arrows, numbers, emphasis) -----
  function overlayScene(ctx, sc, t) {
    if (sc === 1) {
      if (t > 2.4) dotText(ctx, 'the model', 1081, 584, 32, { align: 'center', reveal: wP(t, 2.4, 2.9) });
      dotPath(ctx, bezP([140, 450], [400, 500], [640, 400], [950, 320]), wP(t, 2.3, 2.9), 5, PAL_INK, 11);
      for (const c of P_cards(t)) if (c.s > 60) dotText(ctx, c.dog ? 'dog' : 'cat', c.x, c.y + c.s / 2 + 30, 28, { align: 'center', pal: c.dog ? PAL_INK : PAL_RED });
      if (t > 2.9) {
        const n = t > 5.6 ? 1e6 : Math.round(1e6 * H.ease.in(wP(t, 3.0, 5.6)) / 1000) * 1000;
        dotText(ctx, fmtP(n), 70, 676, 66, { reveal: wP(t, 2.9, 3.3) });
        dotText(ctx, 'examples', 84 + textW(fmtP(n), 66), 672, 44, { reveal: wP(t, 3.0, 3.4) });
        if (t > 5.6) dotPath(ctx, [[70, 692], [400, 696], [720, 690]], wP(t, 5.6, 5.95), 5, PAL_RED, 12, false);
      }
    }
    if (sc === 2) {
      const second = t > 9.4;
      dotText(ctx, 'the model', 291, 656, 34, { align: 'center' });
      dotText(ctx, 'new picture', 1060, 413, 32, { align: 'center', reveal: wP(t, 6.8, 7.2) });
      dotPath(ctx, bezP([395, 270], [420, 210], [440, 200], [470, 196]), wP(t, 6.9, 7.2), 6, PAL_INK, 21);
      dotText(ctx, 'Guess', 400, 150, 38, { align: 'center', reveal: wP(t, 6.9, 7.3) });
      if (!second) dotText(ctx, 'dog?', 660, 226, 88, { align: 'center', reveal: wP(t, 7.1, 7.5), pal: PAL_INK });
      dotPath(ctx, bezP([945, 230], [910, 190], [890, 180], [860, 178]), wP(t, 7.5, 7.8), 6, PAL_INK, 22);
      dotText(ctx, 'Check', 900, 110, 38, { align: 'center', reveal: wP(t, 7.6, 8.0) });
      if (t > 7.9 && !second) {
        dotPath(ctx, [[570, 136], [750, 250]], wP(t, 7.9, 8.05), 12, PAL_RED, 23, false);
        dotPath(ctx, [[750, 136], [570, 250]], wP(t, 8.05, 8.2), 12, PAL_RED, 24, false);
        dotPath(ctx, ringP(660, 196, 214, 120), wP(t, 8.0, 8.45), 7, PAL_RED, 25, false);
        dotText(ctx, "it's a cat!", 1060, 469, 34, { align: 'center', reveal: wP(t, 8.0, 8.4), pal: PAL_RED });
      }
      dotPath(ctx, bezP([700, 318], [780, 600], [520, 600], [440, 440]), wP(t, 8.25, 8.8), 7, PAL_RED, 26);
      dotText(ctx, 'Adjust', 805, 600, 38, { align: 'center', reveal: wP(t, 8.5, 8.9), pal: PAL_RED });
      if (second) {
        dotText(ctx, 'cat', 640, 226, 88, { align: 'center', reveal: wP(t, 9.4, 9.7), pal: PAL_INK });
        dotPath(ctx, [[730, 196], [752, 226], [806, 150]], wP(t, 9.7, 9.95), 11, PAL_GREEN, 27, false);
      }
    }
    if (sc === 3) {
      const pts = P_chart(), pr = wP(t, 11.2, 12.7);
      dotPath(ctx, [[160, 170], [160, 560], [1010, 560]], wP(t, 10.9, 11.3), 4, PAL_INK, 31, false);
      dotText(ctx, 'training rounds', 570, 620, 34, { align: 'center', reveal: wP(t, 11.0, 11.4) });
      dotPath(ctx, pts, pr, 6, PAL_INK, 32, false);
      const acc = Math.round(t < 11.2 ? 61 : t > 12.7 ? 97 : lerpP(61, 97, H.ease.out(pr)));
      dotText(ctx, 'Accuracy', 186, 154, 48, { reveal: wP(t, 10.9, 11.3) });
      dotText(ctx, acc + '%', 470, 160, 68, { reveal: wP(t, 11.1, 11.3), pal: acc >= 97 ? PAL_RED : PAL_INK });
      dotText(ctx, '61%', 92, pts[0][1] + 10, 32, { reveal: wP(t, 11.2, 11.5) });
      if (t > 12.7) { dotPath(ctx, ringP(536, 138, 112, 58), wP(t, 12.7, 13.1), 6, PAL_RED, 33, false); dotPath(ctx, ringP(pts[24][0], pts[24][1], 26, 26, 0, 1.05, 30), wP(t, 12.9, 13.2), 5, PAL_RED, 34, false); }
      if (t > 13.15) dotText(ctx, 'More examples → better guesses', 640, 688, 54, { align: 'center', reveal: ezP((t - 13.15) / 0.8) });
    }
  }

  function explainPointillism(ctx, W, H_, t) {
    const C = pxCache(W, H_);
    ctx.drawImage(C.tex, 0, 0);
    // which scene(s): the canvas is re-dabbed in a diagonal sweep between scenes
    const wipes = [[5.95, 6.75], [10.35, 11.15]];
    let sc = t < 6.35 ? 1 : t < 10.75 ? 2 : 3, sweep = null;
    wipes.forEach(([a, b], i) => { if (t > a && t < b) sweep = { from: i + 1, to: i + 2, front: lerpP(-120, 1620, ezP((t - a) / (b - a))) }; });
    const study = (cv, s, tt) => { const u = cv.getContext('2d'); studyScene(u, s, tt, W, H_); return u.getImageData(0, 0, W, H_).data; };
    const TA = study(C.study, sweep ? sweep.from : sc, sweep ? Math.min(t, sweep.from === 1 ? 6.3 : 10.7) : t);
    const TB = sweep ? study(C.study2, sweep.to, Math.max(t, sweep.to === 2 ? 6.4 : 10.8)) : null;
    // greedy optical mixing per cell
    const CELL = 8, cw = Math.ceil(W / CELL), ch = Math.ceil(H_ / CELL), acc = new Float32Array(cw * ch * 3), cnt = new Uint16Array(cw * ch);
    const lists = PIG.map(() => []), sh = H.rng(7000 + Math.floor(t * 6)), P = C.pos;
    for (let i = 0; i < C.n; i++) {
      const x = P[i * 5], y = P[i * 5 + 1], q = P[i * 5 + 4];
      let rr = P[i * 5 + 2], T = TA;
      if (sweep) { const d = sweep.front - (x + y * 0.35); if (d > 0) { T = TB; if (d < 90) rr *= H.ease.back(clP(d / 90)); } else if (d > -50) rr *= 1 - 0.5 * clP((d + 50) / 50); }
      const o = ((y | 0) * W + (x | 0)) * 4, ci = ((y / CELL) | 0) * cw + ((x / CELL) | 0), n = cnt[ci], k = ci * 3;
      const w0 = T[o] * (n + 1) - acc[k], w1 = T[o + 1] * (n + 1) - acc[k + 1], w2 = T[o + 2] * (n + 1) - acc[k + 2];
      const dark = T[o] + T[o + 1] + T[o + 2] < 330;   // in shadow, reach for ultramarine/violet, not a darker same-hue
      let best = 0, bd = 1e12, second = 0, sd = 1e12;
      for (let p = 0; p < PIG.length; p++) { const Q = PIG[p]; let dd = (Q[0] - w0) ** 2 + (Q[1] - w1) ** 2 * 1.2 + (Q[2] - w2) ** 2 + ((q * 977 + p * 0.37) % 1) * 2600; if (dark && (p === 5 || p === 6 || p === 12)) dd *= 0.78; if (dd < bd) { second = best; sd = bd; best = p; bd = dd; } else if (dd < sd) { second = p; sd = dd; } }
      const qq = (q * 7919) % 1;
      let pick = qq < 0.16 ? second : qq > 0.93 && COMP[best] !== best ? COMP[best] : best;
      acc[k] += PIG[pick][0]; acc[k + 1] += PIG[pick][1]; acc[k + 2] += PIG[pick][2]; cnt[ci]++;
      if (sh() < 0.05) pick = pick === best ? second : best;
      lists[pick].push([x, y, rr, P[i * 5 + 3]]);
    }
    // paint on canvas: every dab throws a hard little shadow onto the weave down-right (light from the upper left)
    ctx.save(); ctx.shadowColor = 'rgba(52,38,74,0.42)'; ctx.shadowOffsetX = 1.2; ctx.shadowOffsetY = 1.6;
    batchFill(ctx, lists, 0.6);
    ctx.restore();
    ctx.drawImage(C.border, 0, 0);
    // fine dabs: the explanation itself (split along the sweep front during a change)
    const clipSide = (ahead) => { ctx.beginPath(); const f = sweep.front; if (ahead) { ctx.moveTo(f, 0); ctx.lineTo(W + 400, 0); ctx.lineTo(W + 400, H_); ctx.lineTo(f - H_ * 0.35, H_); } else { ctx.moveTo(-400, 0); ctx.lineTo(f, 0); ctx.lineTo(f - H_ * 0.35, H_); ctx.lineTo(-400, H_); } ctx.closePath(); ctx.clip(); };
    if (sweep) {
      ctx.save(); clipSide(true); overlayScene(ctx, sweep.from, sweep.from === 1 ? 6.3 : 10.7); ctx.restore();
      ctx.save(); clipSide(false); overlayScene(ctx, sweep.to, Math.max(t, sweep.to === 2 ? 6.4 : 10.8)); ctx.restore();
    } else overlayScene(ctx, sc, t);
    // hook -> header
    {
      const k = ezP((t - 1.5) / 0.6);
      if (k < 1) { const s = lerpP(1, 44 / 84, k), tw = textW('How does AI learn?', 84); dotText(ctx, 'How does AI learn?', lerpP(640 - tw / 2, 36, k), lerpP(190, 66, k), 84, { reveal: wP(t, 0.1, 1.2), scale: s }); }
      else dotText(ctx, 'How does AI learn?', 36, 66, 44);
    }
    ctx.strokeStyle = 'rgba(40,40,90,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(19.5, 19.5, W - 39, H_ - 39);
  }

  registerStyle({
    id: 'pointillism',
    name: 'Pointillist Afternoon',
    category: 'Painterly',
    description: 'Neo-Impressionist divisionism: every form is built from small dabs of unmixed pigment — complementary hues side by side that blend optically — with the canvas weave peeking between the dots and a dotted painted border.',
    motion: 'Dots shimmer as individual dabs re-pick their hue each frame while the overall colour holds, like light vibrating on the water; the sailboat drifts and the parasol sways.',
    fonts: ['800 italic 50px "Playfair Display"'],
    duration: 5.5,
    frameT: 5.4,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Every frame re-dabs one fixed field of pure-pigment dots against the current scene, so moving things shimmer as dots re-pick their hue; scene changes are the canvas being re-dabbed in a diagonal sweep, and lettering, arrows, counters and the emphasis rings are all fine dabs.',
    explainer(ctx, W, H_, t) { explainPointillism(ctx, W, H_, t); },
    explainerSound(k) {
      // all times copied from explainPointillism()/overlayScene()/studyScene() above (their wP() windows)
      const D = 15, px = (x) => H.clamp(x / 1280 * 2 - 1, -1, 1) * 0.7;
      const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
      // one dab: a round brush tip tapped onto canvas. a soft muted tap with a little body, nothing bright.
      const dab = (t, g = 1, pan = 0, f = 1000, minor = true) => {
        k.noise(t, { dur: 0.018, filter: 'bandpass', f, q: 1.4, gain: 0.28 * g, a: 0.002, pan, minor });
        k.noise(t, { dur: 0.025, color: 'brown', filter: 'lowpass', f: 450, gain: 0.2 * g, a: 0.002, pan, minor });
      };
      // dabbing a line of dots on: a patter of taps at `rate` per second, panned along the path
      const patter = (a, b, rate, g = 1, p0 = 0, p1 = p0, minor = true) => {
        const d = b - a, r = H.rng(Math.round(a * 1009) + 5);
        for (let x = 0; x < d; x += (0.6 + r() * 0.8) / rate) dab(a + x, g * (0.55 + r() * 0.5), p0 + (p1 - p0) * x / d, 750 + r() * 650, minor);
      };
      // the whole canvas re-dabbed in a diagonal sweep: a dense wave of taps travelling left to right, over a soft swell
      const redab = (a, b) => { const d = b - a;
        patter(a, b, 34, 0.85, -0.8, 0.8, false);
        k.noise(a, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 350], [d * 0.5, 900], [d, 500]], q: 0.7, gain: 0.09, a: d * 0.45, verb: 0.2 }); };
      const counter = (val, a, b, pan) => { let last = val(a), lastT = -1;
        for (let t = a; t <= b; t += 1 / 240) { const v = val(t); if (v !== last && t - lastT >= 1 / 12) { dab(t, 1.1, pan, 900); lastT = t; } last = v; } };

      k.bed('room', 0, D, { gain: 0.4 });
      // a sunny afternoon pad (Gmaj7, Em7, Cmaj7, D6; 3.75 s bars)
      k.music('pad', 0, D, { bpm: 64, gain: 0.3, chords: [['G2', 'D3', 'F#3', 'B3'], ['E2', 'B2', 'D3', 'G3'], ['C3', 'E3', 'G3', 'B3'], ['D3', 'F#3', 'A3', 'B3']] });

      // ---- 1 HOOK: title dabbed in 0.1-1.2, shrinks to the header 1.5-2.1, ribbon 1.9-2.2
      patter(0.1, 1.2, 16, 1.0, -0.5, 0.5, false);
      k.play('tock', 1.0, { f: 260, gain: 0.35, pan: px(1080) }); // the model's orb blooms in (ease.back 1.0-1.6)
      k.noise(1.0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.4, 800], [0.6, 500]], q: 0.8, gain: 0.08, a: 0.25, pan: px(1080), verb: 0.25 });
      k.noise(1.5, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.6, 650]], q: 0.7, gain: 0.06, a: 0.2, minor: true }); // title slides to the corner
      patter(1.9, 2.2, 12, 0.6, -0.9, -0.3);

      // ---- 2 DATA: dotted arrow 2.3-2.9, 'the model' 2.4-2.9, counter 2.9-3.4
      patter(2.3, 2.9, 14, 0.9, px(140), px(950), false);
      patter(2.45, 2.9, 8, 0.5, px(1080));
      patter(2.9, 3.35, 12, 0.8, -0.7, -0.3);
      // counter: n = 1e6 * ease.in(wP(3.0, 5.6)), rounded to thousands; one firm dab per change, at most 12/s
      counter((t) => Math.round(1e6 * H.ease.in(wP(t, 3.0, 5.6)) / 1000), 3.4, 5.58, -0.6);
      k.play('tock', 5.6, { f: 420, gain: 0.55, pan: -0.6 }); // 1,000,000 lands
      patter(5.6, 5.95, 16, 1.0, -0.8, 0.0, false);              // red dotted underline

      // ---- re-dab sweep 5.95-6.75
      redab(5.95, 6.75);

      // ---- 3 GUESS -> CHECK -> ADJUST
      patter(6.85, 7.2, 14, 0.9, px(395), px(470), false);    // guess arrow (+ 'Guess', 'new picture')
      patter(7.2, 7.5, 12, 0.9, px(600), px(720));            // 'dog?'
      patter(7.5, 7.85, 14, 0.9, px(945), px(860), false);    // check arrow (+ 'Check')
      // the wrong guess: two heavy red dotted slashes hammered on, a low "nope" under them
      patter(7.9, 8.05, 30, 1.6, px(570), px(750), false); patter(8.05, 8.2, 30, 1.6, px(750), px(570), false);
      k.play('thud', 7.9, { f: 115, gain: 0.45, pan: px(660) });
      k.tone(7.92, { f: 'A3', type: 'triangle', dur: 0.2, gain: 0.17, a: 0.01, hold: 0.07, verb: 0.2, pan: px(660) });
      k.tone(8.1, { f: 'F#3', type: 'triangle', dur: 0.38, gain: 0.17, a: 0.01, hold: 0.12, verb: 0.2, pan: px(660) });
      patter(8.2, 8.45, 12, 0.7, px(800), px(560));           // the red ring closes
      patter(8.45, 8.8, 14, 1.0, px(600), px(440), false);    // adjust arrow back to the model
      // the orb flashes and its dials turn (8.6-9.6 / ezP over 8.7-9.3): a soft warm swell and three detents
      k.noise(8.6, { dur: 1.0, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.5, 800], [1.0, 380]], q: 0.8, gain: 0.08, a: 0.45, pan: px(290), verb: 0.3, minor: true });
      const sp = (t) => ezP((t - 8.7) / 0.6);
      for (let s = 1; s <= 3; s++) k.play('tock', when((t) => sp(t) * 4, s, 8.7, 9.3), { f: 600 + s * 30, gain: 0.5, pan: px(290), minor: true });
      patter(9.4, 9.7, 12, 1.0, px(600), px(700));             // 'cat'
      patter(9.7, 9.95, 22, 1.1, px(730), px(806), false);    // green check
      k.play('success', 9.95, { f: 'G5', gain: 0.45, pan: px(770) });

      // ---- re-dab sweep 10.35-11.15
      redab(10.35, 11.15);

      // ---- 4 PROGRESS: axes and labels 10.9-11.4, dotted line 11.2-12.7
      patter(11.15, 12.7, 10, 0.55, px(160), px(980));
      const acc = (t) => Math.round(61 + 36 * H.ease.out(wP(t, 11.2, 12.7)));
      const t97 = when(acc, 97, 11.2, 12.7);
      counter(acc, 11.25, t97 - 0.05, px(470));
      // 97% lands, re-dabbed in red: the biggest hit
      k.play('impact', t97, { gain: 0.85, pan: px(470) });
      patter(t97, t97 + 0.18, 40, 1.6, px(420), px(560), false);
      k.play('ding', t97 + 0.02, { f: 'D5', gain: 0.5 });
      ['G4', 'B4'].forEach((f, i) => k.tone(t97 + 0.05 + i * 0.03, { f, dur: 1.3, gain: 0.07, verb: 0.3, pan: (i - 0.5) * 0.5 }));
      patter(12.7, 13.1, 18, 1.1, px(430), px(650), false);   // red ring around 97%, while the summit glows
      k.noise(12.7, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.35, 1000], [0.7, 500]], q: 0.8, gain: 0.07, a: 0.3, pan: px(980), verb: 0.3 });
      patter(12.95, 13.2, 14, 0.7, px(980));                  // small ring on the summit

      // ---- 5 TAKEAWAY (13.15-13.95), then the resolve
      patter(13.15, 13.95, 18, 1.1, -0.7, 0.7, false);
      k.play('ding', 14.0, { f: 'G4', gain: 0.45 });
      ['B4', 'D5', 'G5'].forEach((f, i) => k.tone(14.06 + i * 0.06, { f, dur: 1.2, gain: 0.065 - i * 0.008, verb: 0.3, pan: (i - 1) * 0.3 }));
    },
    draw(ctx, W, H_, t) {
      // ---------- 1. the scene as a soft colour study (sampled, never shown) ----------
      const U = H.layer(W, H_), u = U.getContext('2d');
      const lg = (y0, y1, stops) => { const g = u.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
      u.fillStyle = lg(0, 290, [[0, 'rgb(104,150,214)'], [0.55, 'rgb(170,196,226)'], [1, 'rgb(240,214,186)']]); u.fillRect(0, 0, W, 300);
      const sg = u.createRadialGradient(980, 200, 10, 980, 200, 380); sg.addColorStop(0, 'rgba(255,236,190,0.9)'); sg.addColorStop(1, 'rgba(255,236,190,0)'); u.fillStyle = sg; u.fillRect(0, 0, W, 300);
      // far bank: hazy trees + a low data-centre with mast
      u.fillStyle = 'rgb(126,150,146)'; u.beginPath(); u.moveTo(0, 300);
      for (let x = 0; x <= W; x += 20) u.lineTo(x, 270 - 18 * Math.abs(Math.sin(x * 0.021)) - 10 * Math.sin(x * 0.007)); u.lineTo(W, 300); u.fill();
      u.fillStyle = 'rgb(150,128,186)'; u.fillRect(450, 226, 200, 62); u.fillRect(510, 204, 70, 24);
      u.fillStyle = 'rgb(120,104,170)'; u.fillRect(650, 248, 100, 40); u.fillStyle = 'rgb(214,170,150)'; u.fillRect(450, 222, 200, 6); u.fillRect(650, 244, 100, 5);
      u.fillStyle = 'rgb(96,84,150)'; u.fillRect(593, 130, 6, 100); u.fillRect(582, 154, 28, 4); u.fillRect(586, 176, 20, 3);
      u.fillStyle = 'rgb(235,100,70)'; u.fillRect(590, 124, 12, 10);
      u.fillStyle = 'rgb(246,190,110)'; for (let x = 462; x < 640; x += 16) { u.fillRect(x, 240, 9, 7); u.fillRect(x, 260, 9, 7); }
      // river
      u.fillStyle = lg(288, 430, [[0, 'rgb(150,186,214)'], [1, 'rgb(64,118,180)']]); u.fillRect(0, 288, W, 150);
      u.fillStyle = 'rgba(250,236,200,0.75)'; for (let k = 0; k < 9; k++) u.fillRect(880 + Math.sin(k * 2.1) * 60, 300 + k * 12, 150 - k * 8, 3);
      // sailboat (drifts with t)
      const bx = 760 + t * 12;
      u.fillStyle = 'rgb(250,246,232)'; u.beginPath(); u.moveTo(bx, 250); u.lineTo(bx + 4, 340); u.lineTo(bx + 58, 334); u.closePath(); u.fill();
      u.fillStyle = 'rgb(236,232,214)'; u.beginPath(); u.moveTo(bx - 4, 270); u.lineTo(bx - 4, 338); u.lineTo(bx - 40, 336); u.closePath(); u.fill();
      u.fillStyle = 'rgb(150,60,50)'; u.beginPath(); u.moveTo(bx - 50, 340); u.lineTo(bx + 66, 338); u.lineTo(bx + 52, 352); u.lineTo(bx - 40, 352); u.fill();
      u.fillStyle = 'rgba(80,70,120,0.5)'; u.fillRect(bx - 44, 354, 100, 10);
      // near bank: sunlit grass
      u.fillStyle = lg(420, 720, [[0, 'rgb(150,190,76)'], [1, 'rgb(118,170,60)']]);
      u.beginPath(); u.moveTo(0, 440); u.bezierCurveTo(300, 418, 700, 432, 1280, 412); u.lineTo(1280, 720); u.lineTo(0, 720); u.fill();
      // tree shadow pooled across the grass (cool)
      u.fillStyle = 'rgb(42,96,86)'; u.beginPath(); u.moveTo(0, 470); u.bezierCurveTo(260, 470, 520, 520, 740, 560); u.bezierCurveTo(800, 600, 760, 720, 620, 720); u.lineTo(0, 720); u.fill();
      u.fillStyle = 'rgb(62,120,86)'; u.beginPath(); u.ellipse(420, 600, 160, 30, 0, 0, 7); u.fill();
      // tree: slender trunk + clumped canopy, lit warm on the right, cool in shadow
      u.fillStyle = 'rgb(86,66,60)'; u.beginPath(); u.moveTo(158, 600); u.bezierCurveTo(172, 460, 150, 300, 186, 110); u.lineTo(202, 110); u.bezierCurveTo(176, 300, 198, 460, 190, 604); u.fill();
      u.fillStyle = 'rgb(206,150,90)'; u.fillRect(187, 300, 5, 280);
      u.strokeStyle = 'rgb(70,60,60)'; u.lineWidth = 7; u.beginPath(); u.moveTo(186, 200); u.quadraticCurveTo(260, 150, 330, 140); u.stroke(); u.beginPath(); u.moveTo(182, 240); u.quadraticCurveTo(110, 200, 60, 196); u.stroke();
      const cr = H.rng(44);
      for (let k = 0; k < 26; k++) {
        const x = cr.range(10, 420), y = cr.range(-10, 200 - Math.abs(x - 200) * 0.25), rx = cr.range(40, 80), ry = cr.range(22, 40);
        const lit = H.clamp((x - 120) / 300) * (1 - y / 260);
        const c = H.mix([24, 60, 56], [126, 172, 64], lit * cr.range(0.6, 1));
        u.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; u.beginPath(); u.ellipse(x, y, rx, ry, cr.range(-0.3, 0.3), 0, 7); u.fill();
      }
      // seated figure in profile with a laptop (sits in the sun at the shadow's edge)
      const fx = 780, fy = 600;
      u.save(); u.translate(fx, fy); u.scale(1.35, 1.35); u.translate(-fx, -fy);
      // halo of complementary warmth around the cool screen glow
      { const g = u.createRadialGradient(fx + 78, fy - 64, 4, fx + 78, fy - 64, 60); g.addColorStop(0, 'rgba(250,190,110,0.85)'); g.addColorStop(1, 'rgba(250,190,110,0)'); u.fillStyle = g; u.fillRect(fx, fy - 140, 160, 150); }
      u.fillStyle = 'rgb(46,44,88)';
      u.beginPath(); u.moveTo(fx - 30, fy); u.lineTo(fx - 24, fy - 86); u.quadraticCurveTo(fx - 4, fy - 102, fx + 12, fy - 84); u.lineTo(fx + 20, fy - 40); u.lineTo(fx + 70, fy - 34); u.lineTo(fx + 76, fy); u.closePath(); u.fill();
      u.fillStyle = 'rgb(228,176,146)'; u.beginPath(); u.arc(fx - 6, fy - 112, 15, 0, 7); u.fill();
      u.fillStyle = 'rgb(60,44,40)'; u.beginPath(); u.ellipse(fx - 10, fy - 120, 17, 9, -0.2, 0, 7); u.fill();
      u.fillStyle = 'rgb(220,96,70)'; u.fillRect(fx - 30, fy - 94, 40, 6);
      u.fillStyle = 'rgb(170,170,186)'; u.beginPath(); u.moveTo(fx + 14, fy - 46); u.lineTo(fx + 68, fy - 44); u.lineTo(fx + 68, fy - 38); u.lineTo(fx + 14, fy - 40); u.fill();
      u.fillStyle = 'rgb(214,240,252)'; u.beginPath(); u.moveTo(fx + 62, fy - 44); u.lineTo(fx + 84, fy - 92); u.lineTo(fx + 94, fy - 88); u.lineTo(fx + 72, fy - 42); u.fill();
      u.fillStyle = 'rgb(28,70,70)'; u.beginPath(); u.ellipse(fx + 20, fy + 6, 80, 10, 0, 0, 7); u.fill();
      u.restore();
      // standing figure with parasol (right)
      const sx = 1080, sy = 640, sway = Math.sin(t * 1.2) * 0.05;
      u.fillStyle = 'rgb(58,48,96)'; u.beginPath(); u.moveTo(sx - 18, sy - 150); u.lineTo(sx + 14, sy - 150); u.quadraticCurveTo(sx + 26, sy - 60, sx + 60, sy); u.lineTo(sx - 30, sy); u.quadraticCurveTo(sx - 26, sy - 80, sx - 18, sy - 150); u.fill();
      u.fillStyle = 'rgb(226,170,140)'; u.beginPath(); u.arc(sx - 2, sy - 166, 13, 0, 7); u.fill();
      u.fillStyle = 'rgb(40,34,70)'; u.beginPath(); u.ellipse(sx - 2, sy - 178, 20, 6, 0, 0, 7); u.fill();
      u.save(); u.translate(sx + 6, sy - 140); u.rotate(-0.25 + sway);
      u.strokeStyle = 'rgb(60,40,40)'; u.lineWidth = 3; u.beginPath(); u.moveTo(0, 0); u.lineTo(0, -70); u.stroke();
      u.fillStyle = 'rgb(222,84,64)'; u.beginPath(); u.moveTo(-66, -60); u.quadraticCurveTo(0, -116, 66, -60); u.quadraticCurveTo(0, -70, -66, -60); u.fill();
      u.restore();
      u.fillStyle = 'rgb(30,72,70)'; u.beginPath(); u.ellipse(sx + 50, sy + 4, 90, 9, 0, 0, 7); u.fill();
      // title in the sky
      u.fillStyle = 'rgb(38,40,112)'; u.font = '800 italic 50px "Playfair Display"'; u.textBaseline = 'alphabetic';
      // (lettering is NOT in the colour study: it is dabbed on top later with a finer brush)
      const TM = H.layer(W, H_), tm = TM.getContext('2d');
      tm.fillStyle = '#000'; tm.font = '800 italic 50px "Playfair Display"'; tm.fillText('A Sunday with the Machine', 540, 96);
      const textMask = tm.getImageData(0, 0, W, H_).data;
      u.filter = 'blur(2px)'; u.drawImage(U, 0, 0); u.filter = 'none';
      const T = u.getImageData(0, 0, W, H_).data;

      // ---------- 2. canvas ----------
      ctx.fillStyle = 'rgb(232,222,198)'; ctx.fillRect(0, 0, W, H_);
      ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = 'rgb(150,130,100)';
      for (let y = 0; y < H_; y += 3) ctx.fillRect(0, y, W, 1);
      ctx.globalAlpha = 0.1; for (let x = 0; x < W; x += 3) ctx.fillRect(x, 0, 1, H_);
      ctx.restore();

      // ---------- 3. dabs: greedy optical mixing per cell ----------
      const D = H.layer(W, H_), dx = D.getContext('2d');
      const CELL = 8, cw = Math.ceil(W / CELL), ch = Math.ceil(H_ / CELL);
      const acc = new Float32Array(cw * ch * 3), cnt = new Uint16Array(cw * ch);
      const r = H.rng(2025);                       // the colour decisions are stable...
      const sh = H.rng(7000 + Math.floor(t * 6));   // ...but a few dabs flick to their runner-up hue: the shimmer
      const live = H.clamp((t - 3.3) / 0.6);
      const rp = H.rng(2025);                      // positions stay put
      const dots = [];
      // directional brush touches: oval dabs laid along a slow flow field (the hand's rhythm), slightly larger than before
      const sp = 4.3, nzf = H.makeNoise(2026);
      for (let y = 22; y < H_ - 20; y += sp * 0.87) for (let x = 22; x < W - 20; x += sp) { const px = x + rp.range(-1.6, 1.6) + ((y / sp) & 1) * sp * 0.5, py = y + rp.range(-1.4, 1.4), rr = rp.range(2.05, 2.7); rp();
        dots.push([px, py, rr, -0.6 + 0.5 * nzf.n2(px * 0.004, py * 0.004) + nzf.n2(px * 0.3, py * 0.3) * 0.18]); }
      // each dab gets its moment: the painter works down from the sky, dabbing all over each band
      dots.forEach((d) => { d.push(0.12 + 2.7 * (0.45 * rp() + 0.55 * (d[1] / H_))); });
      dots.sort((a, b) => a[4] - b[4]);
      function choose(tc, ci, temp) {
        const n = cnt[ci], k = ci * 3;
        const want = [0, 1, 2].map((c) => tc[c] * (n + 1) - acc[k + c]);
        let best = 0, bd = 1e12, second = 0, sd = 1e12;
        const dark = tc[0] + tc[1] + tc[2] < 330;   // shadows reach for ultramarine/violet rather than a darker same hue
        for (let p = 0; p < PIG.length; p++) {
          const P = PIG[p];
          let d = (P[0] - want[0]) ** 2 + (P[1] - want[1]) ** 2 * 1.2 + (P[2] - want[2]) ** 2 + r() * temp;
          if (dark && (p === 5 || p === 6 || p === 12)) d *= 0.78;
          if (d < bd) { second = best; sd = bd; best = p; bd = d; } else if (d < sd) { second = p; sd = d; }
        }
        const rq = r(), pick = rq < 0.16 ? second : rq > 0.93 && COMP[best] !== best ? COMP[best] : best;   // ~7% complements: the vibration
        acc[k] += PIG[pick][0]; acc[k + 1] += PIG[pick][1]; acc[k + 2] += PIG[pick][2]; cnt[ci]++;
        return live > 0 && sh() < 0.07 * live ? (pick === best ? second : best) : pick;
      }
      const batches = PIG.map(() => []);
      const flush = () => {
        batches.forEach((list, p) => {
          if (!list.length) return;
          dx.fillStyle = css(PIG[p]); dx.beginPath();
          for (const [x, y, rr, a] of list) { dx.moveTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); dx.ellipse(x, y, rr, rr * (rr > 1.7 ? 0.62 : 0.78), a, 0, 6.2832); }
          dx.fill(); list.length = 0;
        });
      };
      dots.forEach((d0, i) => {
        if (d0[4] > t) return;
        const pop = H.ease.back(H.clamp((t - d0[4]) / 0.09));
        const d = pop >= 1 ? d0 : [d0[0], d0[1], d0[2] * pop, d0[3]];
        const [x, y] = d, xi = Math.min(W - 1, x | 0), yi = Math.min(H_ - 1, y | 0), o = (yi * W + xi) * 4;
        const tc = [T[o], T[o + 1], T[o + 2]];
        const ci = Math.min(ch - 1, (y / CELL) | 0) * cw + Math.min(cw - 1, (x / CELL) | 0);
        batches[choose(tc, ci, 2600)].push(d);
        if (i % 9000 === 8999) flush();
      });
      flush();
      // finer dabs for the lettering and the figures' faces: keeps edges crisp
      const fine = [];
      for (let y = 40; y < 115; y += 1.7) for (let x = 500; x < 1220; x += 1.8) {
        const xi = (x + rp.range(-0.8, 0.8)) | 0, yi = (y + rp.range(-0.8, 0.8)) | 0;
        const fr = rp.range(1.2, 1.55), fa = rp() * 3, fb = 2.85 + (x - 500) / 720 * 0.55 + rp() * 0.08;
        if (textMask[(yi * W + xi) * 4 + 3] > 120 && t >= fb) fine.push([xi + 0.5, yi + 0.5, fr * H.ease.out(H.clamp((t - fb) / 0.08)), fa]);
      }
      fine.forEach((d) => { const q = H.rng((d[0] * 31 + d[1] * 7919) | 0); const pick = q() < 0.55 ? 6 : q() < 0.7 ? 12 : q() < 0.6 ? 5 : 3; batches[pick].push(d); });
      flush();

      // ---------- 4. dab relief: each dab catches light on its upper-left rim ----------
      ctx.drawImage(D, 0, 0);
      const img = ctx.getImageData(0, 0, W, H_), d = img.data, a = dx.getImageData(0, 0, W, H_).data;
      for (let y = 1; y < H_ - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = (y * W + x) * 4;
        const g = (a[i + 3 - 4 - W * 4] - a[i + 3 + 4 + W * 4]);
        if (g === 0) continue;
        const f = 1 + (g < 0 ? 0.2 : -0.17) * Math.abs(g) / 255;   // lit upper-left rim, shadowed lower-right rim
        d[i] *= f; d[i + 1] *= f; d[i + 2] *= f;
      }
      ctx.putImageData(img, 0, 0);

      // ---------- 5. painted border of dots (complementary, darker) ----------
      const br = H.rng(66);
      const border = PIG.map(() => []);
      for (let k = 0; k < 2600; k++) {
        const side = br.int(0, 3), along = br();
        let x, y; const depth = br.range(2, 16);
        if (side === 0) { x = along * W; y = depth; } else if (side === 1) { x = along * W; y = H_ - depth; } else if (side === 2) { x = depth; y = along * H_; } else { x = W - depth; y = along * H_; }
        const p = br.pick([6, 6, 12, 5, 2, 3, 6, 12]), rr = br.range(2, 2.8), an = br() * 3;
        // the border is dabbed on last, travelling clockwise round the frame
        const pos = side === 0 ? along * 0.25 : side === 3 ? 0.25 + along * 0.25 : side === 1 ? 0.5 + (1 - along) * 0.25 : 0.75 + (1 - along) * 0.25;
        const bb = 3.2 + pos * 0.8;
        if (t >= bb) border[p].push([x, y, rr * H.ease.out(H.clamp((t - bb) / 0.08)), an]);
      }
      border.forEach((list, p) => { if (!list.length) return; ctx.fillStyle = css(PIG[p]); ctx.beginPath(); for (const [x, y, rr, an] of list) { ctx.moveTo(x + rr, y); ctx.ellipse(x, y, rr, rr * 0.8, an, 0, 6.2832); } ctx.fill(); });
      ctx.strokeStyle = `rgba(40,40,90,${0.35 * H.clamp((t - 3.9) / 0.3)})`; ctx.lineWidth = 1; ctx.strokeRect(19.5, 19.5, W - 39, H_ - 39);
    }
  });
}
```
