I want an animated explainer made in the "Op Art Sphere" visual style (Generative & Type). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Archivo Black, Space Grotesk
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;700&display=block">
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
Name: Op Art Sphere
Family: Generative & Type
Look: Hard-edged black/ivory checkerboard that swells into a lens-like sphere and ripples at the margins — Vasarely and Riley optical vibration, flat acrylic on primed canvas.
Motion: A flat checkerboard first ripples into Riley folds, then swells into a lens-sphere that pops past its size and settles; red squares flip in cell by cell from the centre, then the field breathes and the folds drift.
How it explains: The model is the Vasarely lens: untrained its grid is melted noise, the error travels back as an optical ripple through the checkerboard and each adjustment combs the sphere toward perfect order; scenes change with a Riley fold that crushes the picture into crowded columns, labels are hard-edged black and red slabs, and the numbers are Archivo Black on ivory bands.

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

REFERENCE STYLE SOURCE (styles/op-art.js; W/H_ are always 1280x720)
```js
{
  // Op Art — Vasarely "Vega"-style warped checkerboard bulging into a sphere, with Riley-like
  // undulating rows and column compression. Rendered per-pixel with analytic anti-aliasing.
  const S = 40;            // base cell size (px)


  // =====================================================================================
  // EXPLAINER — the model is the Vasarely lens. Untrained, its grid is melted noise; every
  // correction (an error ripple travelling back through the field) combs it toward the clean
  // optical sphere. Scenes change with a Riley fold: the picture pinches into crowded columns
  // and unfolds as the next one.
  // =====================================================================================
  const OX = (t, a, b) => H.clamp((t - a) / (b - a));
  const IVc = '#f0ebdd', BKc = '#141315', RDc = '#d02622';
  let OPTEX = null;
  function opTexture(W, H_) {
    if (OPTEX) return OPTEX;
    const nz = H.makeNoise(11), r = H.rng(5), T = new Float32Array(W * H_);
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const wx = Math.sin(x * 1.9) * 0.5 + 0.5, wy = Math.sin(y * 1.9) * 0.5 + 0.5;
      const weave = ((x >> 1) + (y >> 1)) & 1 ? wx : wy;
      const brush = nz.n2(x * 0.004, y * 0.03) * 0.5 + nz.n2(x * 0.05, y * 0.002) * 0.5;
      T[y * W + x] = (weave - 0.5) * 0.04 + brush * 0.025 + (r() - 0.5) * 0.03;
    }
    return (OPTEX = T);
  }
  // the same canvas weave as a drawable overlay (white/black at |tex| alpha ~ multiply by 1+tex), for flat slabs and bands
  let OPWEAVE = null;
  function opWeave(W, H_) {
    if (OPWEAVE && OPWEAVE.width === W && OPWEAVE.height === H_) return OPWEAVE;
    const tex = opTexture(W, H_), c = H.layer(W, H_), x = c.getContext('2d'), img = x.createImageData(W, H_), d = img.data;
    for (let i = 0; i < W * H_; i++) { const v = tex[i] * 1.6, o = i * 4; d[o] = d[o + 1] = d[o + 2] = v > 0 ? 255 : 0; d[o + 3] = Math.min(255, Math.abs(v) * 255); }
    x.putImageData(img, 0, 0); return (OPWEAVE = c);
  }
  const weaveOver = (c, x, y, w, h) => { const wv = OPWEAVE; if (!wv || w <= 0 || h <= 0) return; const sx = H.clamp(Math.round(Math.abs(x)) % 600, 0, wv.width - 1), sy = H.clamp(Math.round(Math.abs(y)) % 300, 0, wv.height - 1); const sw = Math.min(w, wv.width - sx), sh = Math.min(h, wv.height - sy); c.drawImage(wv, sx, sy, sw, sh, x, y, w, h); };
  // P: {cx, cy, R, lens, fold, chaos, red, rip:{r, amp}, t}
  function opField(ctx, W, H_, P) {
    const img = ctx.createImageData(W, H_), d = img.data, tex = opTexture(W, H_);
    const GW = W + 1, GH = H_ + 1, G = new Float32Array(GW * GH), CU = new Float32Array(GW * GH), CV = new Float32Array(GW * GH);
    const PI = Math.PI, S = 40, R2 = P.R * P.R, A0 = 1 - 0.58 * P.lens, tau = P.t;
    const foldU = (x) => P.fold * (58 * Math.sin((x / W) * PI * 2.5 + 0.6 + tau * 0.25) - 9 * Math.sin((x / W) * PI * 6 + tau * 0.4));
    const ux = P.cx + foldU(P.cx);
    for (let y = 0; y < GH; y++) {
      const yy = (y - P.cy) / 360;
      for (let x = 0; x < GW; x++) {
        let u = x + foldU(x);
        let v = P.cy + (y - P.cy) * (1 + 0.42 * P.fold * yy * yy) + P.fold * 8 * Math.sin((y / H_) * PI * 2 + tau * 0.3);
        const dx = x - P.cx, dy = y - P.cy, r2 = dx * dx + dy * dy;
        if (P.rip && P.rip.amp > 0) { // error ripple: a radial ring that displaces the grid
          const dd = Math.sqrt(r2) + 1e-3, q = (dd - P.rip.r) / 38, w = P.rip.amp * Math.exp(-q * q) * Math.sin(q * 3.2);
          u += (dx / dd) * w; v += (dy / dd) * w;
        }
        if (r2 < R2) {
          const rho = Math.sqrt(r2) / P.R, k = A0 + (1 - A0) * rho * rho, blend = 1 - rho * rho;
          u = u * (1 - blend) + (ux + dx) * blend;
          u = ux + (u - ux) * k; v = P.cy + (v - P.cy) * k;
          if (P.chaos > 0) { // untrained: the lens grid is twisted and rippled (still hard-edged checks, just disordered geometry)
            const th = Math.atan2(dy, dx), fall = 1 - rho * rho;
            // smooth swirl (angle depends on radius) + a 3-fold wobble that vanishes at the centre and rim (no pinch points)
            const ang = P.chaos * (1.15 * Math.sin(Math.PI * rho) * Math.sin(tau * 0.5 + 1.1) + 1.1 * rho * fall * Math.sin(3 * th + tau * 0.9));
            const rr = P.chaos * P.R * 0.07 * Math.sin(rho * 9 - tau * 1.3) * fall * rho;
            const ou = u - ux, ov = v - P.cy, ca = Math.cos(ang), sa = Math.sin(ang), rl = Math.hypot(ou, ov) + 1e-3;
            u = ux + ou * ca - ov * sa + (ou / rl) * rr; v = P.cy + ou * sa + ov * ca + (ov / rl) * rr;
          }
        }
        const i = y * GW + x;
        G[i] = Math.sin((PI * (u - P.cx)) / S) * Math.sin((PI * (v - P.cy)) / S);
        CU[i] = Math.floor((u - P.cx) / S); CV[i] = Math.floor((v - P.cy) / S);
      }
    }
    const IV = [240, 235, 221], BK = [20, 19, 21], RD = [208, 38, 34];
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const i = y * GW + x, g = G[i];
      const gx = G[i + 1] - g, gy = G[i + GW] - g, gm = Math.sqrt(gx * gx + gy * gy) + 1e-5;
      let a = 0.5 + (g / gm) * 0.9; a = a < 0 ? 0 : a > 1 ? 1 : a;
      let L = IV;
      const dx = x - P.cx, dy = y - P.cy;
      if (dx * dx + dy * dy < R2 && P.red > 0) {
        let j = i;
        if (g <= 0) { if (G[i + 1] > 0) j = i + 1; else if (G[i + GW] > 0) j = i + GW; else if (x > 0 && G[i - 1] > 0) j = i - 1; else if (y > 0 && G[i - GW] > 0) j = i - GW; }
        const cr = Math.hypot((CU[j] + 0.5) * S, (CV[j] + 0.5) * S) / (P.R * 0.42);
        if (cr < P.red) L = RD;
      }
      const o = (y * W + x) * 4, k = 1 + tex[y * W + x];
      d[o] = (BK[0] + (L[0] - BK[0]) * a) * k; d[o + 1] = (BK[1] + (L[1] - BK[1]) * a) * k; d[o + 2] = (BK[2] + (L[2] - BK[2]) * a) * k; d[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    opWeave(W, H_);
  }
  // hard-edged label: black slab, ivory type, red keyline (or red slab)
  function oLabel(c, text, x, y, o = {}) {
    const sz = o.size || 20, f = o.big ? `400 ${sz}px "Archivo Black"` : `700 ${sz}px "Space Grotesk"`;
    c.save(); c.font = f; c.textBaseline = 'middle'; try { c.letterSpacing = o.big ? '1px' : '2px'; } catch (e) {}
    const w = c.measureText(text).width + sz * 1.1, h = sz * 1.75;
    const ox = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    c.fillStyle = o.red ? RDc : o.inv ? IVc : BKc; c.fillRect(ox, y - h / 2, w, h);
    if (!o.red) { c.fillStyle = RDc; c.fillRect(ox, y + h / 2, w, Math.max(3, sz * 0.16)); }
    weaveOver(c, ox, y - h / 2, w, h + (o.red ? 0 : Math.max(3, sz * 0.16)));
    if (o.inv) { c.strokeStyle = BKc; c.lineWidth = 3; c.strokeRect(ox, y - h / 2, w, h); }
    c.fillStyle = o.inv ? BKc : IVc;
    if (o.lead && text.startsWith('→ ')) { // hard-edged arrow in the type's own weight instead of the thin fallback glyph
      const lw0 = c.measureText('→ ').width, aw = lw0 - sz * 0.32, x0 = ox + sz * 0.55, sw = sz * 0.2;
      c.beginPath(); c.moveTo(x0, y - sw / 2); c.lineTo(x0 + aw - sz * 0.42, y - sw / 2); c.lineTo(x0 + aw - sz * 0.42, y - sz * 0.32); c.lineTo(x0 + aw, y); c.lineTo(x0 + aw - sz * 0.42, y + sz * 0.32); c.lineTo(x0 + aw - sz * 0.42, y + sw / 2); c.lineTo(x0, y + sw / 2); c.closePath(); c.fill();
      c.fillText(text.slice(2), x0 + lw0, y + 1);
    } else c.fillText(text, ox + sz * 0.55, y + 1);
    c.restore(); return w;
  }
  function oArrow(c, x0, y0, x1, y1, p, lw = 8) {
    if (p <= 0) return; const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p, a = Math.atan2(y1 - y0, x1 - x0), hd = lw * 3;
    c.save();
    for (const [col, ex] of [[IVc, 6], [RDc, 0]]) {
      c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw + ex; c.lineJoin = 'miter';
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x - Math.cos(a) * hd * 0.8, y - Math.sin(a) * hd * 0.8); c.stroke();
      c.beginPath(); c.moveTo(x + Math.cos(a) * ex * 0.6, y + Math.sin(a) * ex * 0.6); c.lineTo(x - Math.cos(a - 0.5) * (hd + ex), y - Math.sin(a - 0.5) * (hd + ex)); c.lineTo(x - Math.cos(a + 0.5) * (hd + ex), y - Math.sin(a + 0.5) * (hd + ex)); c.closePath(); c.fill();
    }
    c.restore();
  }
  function oPet(c, kind, x, y, s) {
    c.save(); c.fillStyle = IVc; c.fillRect(x, y, s, s); weaveOver(c, x, y, s, s); c.strokeStyle = BKc; c.lineWidth = Math.max(3, s * 0.035); c.strokeRect(x, y, s, s);
    const cx = x + s / 2, cy = y + s / 2; c.fillStyle = BKc;
    c.beginPath(); c.arc(cx, cy + s * 0.08, s * 0.28, 0, Math.PI * 2); c.fill();
    if (kind === 'cat') for (const k of [-1, 1]) { c.beginPath(); c.moveTo(cx + k * s * 0.06, cy - s * 0.1); c.lineTo(cx + k * s * 0.28, cy - s * 0.34); c.lineTo(cx + k * s * 0.28, cy); c.fill(); }
    else { for (const k of [-1, 1]) { c.beginPath(); c.ellipse(cx + k * s * 0.29, cy + s * 0.08, s * 0.09, s * 0.21, k * 0.3, 0, Math.PI * 2); c.fill(); } }
    c.fillStyle = IVc; for (const k of [-1, 1]) c.fillRect(cx + k * s * 0.11 - s * 0.04, cy, s * 0.08, s * 0.08);
    c.restore();
  }
  function band(c, W, y, h) { c.fillStyle = IVc; c.fillRect(0, y, W, h); weaveOver(c, 0, y, W, h); c.fillStyle = BKc; c.fillRect(0, y, W, 5); c.fillRect(0, y + h - 5, W, 5); }
  const oHeader = (c) => oLabel(c, 'HOW DOES AI LEARN?', 22, 32, { size: 28, big: true });
  const fmtN = (n) => Math.round(n).toLocaleString('en-US');

  // scene field params + overlays
  const OS = {
    hook: { P: (t) => ({ cx: 740, cy: 360, R: 268 + 6 * Math.sin(t * 2), lens: 1, fold: 1, chaos: 0, red: 1.183, t }),
      O(c, W, H_, t) {
        const k = H.ease.inOut(OX(t, 1.7, 2.3)), pop = H.ease.back(OX(t, 0.1, 0.45));
        if (k < 1) {
          c.save(); c.font = '400 52px "Archivo Black"'; try { c.letterSpacing = '1px'; } catch (e) {} const w0 = c.measureText('HOW DOES AI LEARN?').width + 57; c.restore();
          const SC = 28 / 52, sc = 1 - (1 - SC) * k, ex = 22 + (w0 * SC) / 2;
          c.save(); c.translate(640 + (ex - 640) * k, 360 + (32 - 360) * k); c.scale(pop * sc, pop * sc); oLabel(c, 'HOW DOES AI LEARN?', 0, 0, { size: 52, big: true, align: 'center' }); c.restore();
        }
        else oHeader(c);
      } },
    data: { P: (t) => ({ cx: 1010, cy: 330, R: 205, lens: 1, fold: 0.8, chaos: 1, red: 0.25 + 0.3 * OX(t, 2.5, 6), t }),
      O(c, W, H_, t) {
        oHeader(c);
        const rows = [170, 300, 430];
        rows.forEach((y, i) => oArrow(c, 30, y + 40, 770, y + 40, H.ease.out(OX(t, 2.55 + i * 0.07, 2.95 + i * 0.07)), 6));
        const rr = H.rng(9), K = 36;
        for (let k = 0; k < K; k++) {
          const kind = rr() < 0.5 ? 'cat' : 'dog', ts = 2.6 + 3.1 * Math.pow(k / K, 0.8);
          if (t < ts) continue;
          let x = -90 + (t - ts) * (520 + k * 16); const y = rows[k % 3];
          let s = 80; if (x > 760) { const q = H.clamp((x - 760) / 160); s = 80 * (1 - q); x = 760 + (x - 760) * 0.6; }
          if (s < 3) continue;
          oPet(c, kind, x, y + (80 - s) / 2, s);
          if (s > 60) oLabel(c, kind, x + s / 2, y + s + 26, { size: 28, align: 'center' });
        }
        oLabel(c, 'MODEL', 1010, 92 + (1 - H.ease.back(OX(t, 2.7, 3.0))) * -60, { size: 32, big: true, align: 'center', red: true });
        band(c, W, 600, 100);
        if (t >= 2.7) {
          const p = OX(t, 2.75, 5.0), n = p >= 1 ? 1e6 : Math.floor(Math.pow(10, 6 * H.ease.inOut(p))) - 1;
          c.save(); c.font = '400 72px "Archivo Black"'; c.textBaseline = 'middle'; c.fillStyle = BKc; c.fillText(fmtN(n), 34, 654);
          const w = c.measureText(fmtN(n)).width; c.restore();
          oLabel(c, 'EXAMPLES', 34 + w + 22, 650, { size: 30, red: true });
        }
      } },
    loop: { P: (t) => {
        const adj = H.ease.inOut(OX(t, 8.9, 9.4));
        return { cx: 640, cy: 300, R: 190, lens: 1, fold: 0.6, chaos: 0.9 - 0.55 * adj, red: 0.55 + 0.35 * adj, t,
          rip: t > 8.35 && t < 9.05 ? { r: 620 - 640 * OX(t, 8.35, 9.0), amp: 22 * Math.sin(Math.PI * OX(t, 8.35, 9.05)) } : null };
      },
      O(c, W, H_, t) {
        oHeader(c);
        oPet(c, 'cat', 60, 225, 150);
        oLabel(c, t >= 8.0 ? 'ANSWER: CAT' : 'NEW PICTURE', 135, 414, { size: 28, align: 'center', red: t >= 8.0 });
        oArrow(c, 222, 300, 436, 300, H.ease.out(OX(t, 6.4, 6.65)));
        oArrow(c, 844, 300, 940, 300, H.ease.out(OX(t, 7.05, 7.25)));
        oLabel(c, 'MODEL', 640, 76, { size: 28, big: true, align: 'center', red: true });
        const right = t >= 9.6, drop = (t0) => (1 - H.ease.back(OX(t, t0, t0 + 0.25))) * -50;
        if (t >= 7.25 && !right) {
          const s = 1 + 0.3 * Math.pow(1 - H.ease.out(OX(t, 7.25, 7.4)), 2);
          c.save(); c.translate(1090, 300); c.scale(s, s); oLabel(c, 'DOG?', 0, 0, { size: 54, big: true, align: 'center' }); c.restore();
          oLabel(c, 'GUESS', 1090, 212 + drop(7.3), { size: 28, align: 'center', inv: true });
        }
        if (t >= 7.85 && !right) {
          const k = H.ease.out(OX(t, 7.85, 8.05));
          c.save(); c.strokeStyle = RDc; c.lineWidth = 10; c.beginPath(); c.arc(1090, 300, 110, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke();
          if (k >= 1) { c.lineWidth = 14; c.beginPath(); c.moveTo(1020, 230); c.lineTo(1160, 370); c.moveTo(1160, 230); c.lineTo(1020, 370); c.stroke(); }
          c.restore();
          oLabel(c, 'CHECK: WRONG', 1090, 450 + drop(7.95), { size: 28, align: 'center', red: true });
        }
        if (t >= 8.35 && t < 9.7) oLabel(c, 'ERROR RIPPLES BACK', 885, 520 + drop(8.35), { size: 28, align: 'center' });
        if (t >= 8.85 && t < 10.4) oLabel(c, 'ADJUST: GRID SHARPENS', 460, 548 + drop(8.85), { size: 28, align: 'center', red: true });
        if (right) {
          const s = 1 + 0.3 * Math.pow(1 - H.ease.out(OX(t, 9.6, 9.75)), 2);
          c.save(); c.translate(1090, 300); c.scale(s, s); oLabel(c, 'CAT ✓', 0, 0, { size: 54, big: true, align: 'center', red: true }); c.restore();
        }
        band(c, W, 600, 100);
        const words = ['GUESS', 'CHECK', 'ADJUST'];
        const act = t < 7.25 ? -1 : t < 7.85 ? 0 : t < 8.35 ? 1 : t < 9.6 ? 2 : Math.floor((t - 9.6) / 0.15) % 3;
        let x = 34;
        words.forEach((w, i) => { x += oLabel(c, w, x, 650, { size: 28, big: true, red: i === act }) + 14; if (i < 2) { oArrow(c, x, 650, x + 50, 650, 1, 6); x += 70; } });
        c.save(); c.font = '700 28px "Space Grotesk"'; c.fillStyle = BKc; c.textBaseline = 'middle'; c.fillText('↻ ×1,000,000', x + 10, 652); c.restore();
      } },
    prog: { P: (t) => { const p = H.ease.inOut(OX(t, 10.85, 12.3)); return { cx: 950, cy: 340, R: 230, lens: 1, fold: 0.6 + 0.4 * p, chaos: 0.35 * (1 - p), red: 0.9 + 0.283 * p, t }; },
      O(c, W, H_, t) {
        oHeader(c);
        c.fillStyle = IVc; c.fillRect(30, 90, 560, 560); weaveOver(c, 30, 90, 560, 560); c.fillStyle = BKc; c.fillRect(30, 90, 560, 5); c.fillRect(30, 645, 560, 5);
        oLabel(c, 'ACCURACY', 60, 140, { size: 32, big: true });
        const p = H.ease.inOut(OX(t, 10.85, 12.3)), v = Math.round(61 + 36 * p), punch = t >= 12.3 ? 1 + 0.15 * Math.exp(-(t - 12.3) * 9) : 1;
        c.save(); c.translate(60, 290); c.scale(punch, punch); c.font = '400 150px "Archivo Black"'; c.textBaseline = 'middle'; c.fillStyle = BKc; c.fillText(v + '%', 0, 0); const w = c.measureText('97%').width; c.restore();
        if (t >= 12.3) { const k = H.ease.out(OX(t, 12.3, 12.55)); c.save(); c.strokeStyle = RDc; c.lineWidth = 9; c.beginPath(); c.ellipse(60 + w / 2, 290, w / 2 + 26, 100, 0, Math.PI, Math.PI + Math.PI * 2 * k); c.stroke(); c.restore(); }
        // stepped chart: each training round a column of checker cells
        const x0 = 70, y0 = 610, cs = 20, n = 12;
        for (let i = 0; i < n; i++) {
          const acc = 61 + 36 * (1 - Math.exp(-i / 3.2)) / (1 - Math.exp(-(n - 1) / 3.2)), m = Math.round((acc - 50) / 47 * 9);
          for (let k = 0; k < m; k++) { if (t < 10.85 + i * 0.11 + k * 0.02) break; c.fillStyle = (i + k) % 2 ? BKc : (i === n - 1 && t >= 12.3 ? RDc : '#3a383c'); c.fillRect(x0 + i * (cs + 22), y0 - (k + 1) * cs, cs + 18, cs); }
        }
        c.save(); c.font = '700 22px "Space Grotesk"'; c.fillStyle = BKc; try { c.letterSpacing = '2px'; } catch (e) {} c.fillText('TRAINING ROUNDS →', x0, y0 + 30); c.restore();
        oLabel(c, 'MODEL', 950, 76, { size: 28, big: true, align: 'center', red: true });
      } },
    take: { P: (t) => ({ cx: 740, cy: 360, R: 268 + 6 * Math.sin(t * 2), lens: 1, fold: 1, chaos: 0, red: 1.183, t }),
      O(c, W, H_, t) {
        const k = H.ease.back(OX(t, 13.25, 13.55));
        c.save(); c.translate(640, 360); c.scale(k, k);
        oLabel(c, 'MORE EXAMPLES', 0, -50, { size: 50, big: true, align: 'center' });
        oLabel(c, '→ BETTER GUESSES', 0, 52, { size: 50, big: true, align: 'center', red: true, lead: true });
        c.restore();
      } },
  };
  function opScene(c, W, H_, name, t) { opField(c, W, H_, OS[name].P(t)); OS[name].O(c, W, H_, t); }
  function explainOP(ctx, W, H_, t) {
    const seq = [[0, 'hook'], [2.45, 'data'], [6.0, 'loop'], [10.5, 'prog'], [13.0, 'take']];
    let i = 0; for (let k = 0; k < seq.length; k++) if (t >= seq[k][0]) i = k;
    const t0 = seq[i][0], D = 0.5;
    if (i > 0 && t < t0 + D) {
      // Riley fold wipe: the old picture is crushed into crowded columns at a travelling fold
      const A = H.layer(W, H_), B = H.layer(W, H_);
      opScene(A.getContext('2d'), W, H_, seq[i - 1][1], t0 - 0.01); opScene(B.getContext('2d'), W, H_, seq[i][1], t);
      const sx = -120 + (W + 240) * H.ease.inOut(OX(t, t0, t0 + D)), st = 4;
      for (let x = 0; x < W; x += st) {
        const dd = x - sx, src = sx + dd * (1 + 3.2 * Math.exp(-Math.abs(dd) / 70)), sxp = H.clamp(src, 0, W - st);
        ctx.drawImage(dd < 0 ? B : A, sxp, 0, st, H_, x, 0, st, H_);
      }
      ctx.fillStyle = BKc; ctx.fillRect(sx - 3, 0, 6, H_);
    } else opScene(ctx, W, H_, seq[i][1], t);
    H.vignette(ctx, W, H_, 0.18);
  }

  registerStyle({
    id: 'op-art',
    name: 'Op Art Sphere',
    category: 'Generative & Type',
    description: 'Hard-edged black/ivory checkerboard that swells into a lens-like sphere and ripples at the margins — Vasarely and Riley optical vibration, flat acrylic on primed canvas.',
    motion: 'A flat checkerboard first ripples into Riley folds, then swells into a lens-sphere that pops past its size and settles; red squares flip in cell by cell from the centre, then the field breathes and the folds drift.',
    fonts: ['600 13px "Space Grotesk"', '700 20px "Space Grotesk"', '400 40px "Archivo Black"'],
    duration: 5,
    frameT: 4.9,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'The model is the Vasarely lens: untrained its grid is melted noise, the error travels back as an optical ripple through the checkerboard and each adjustment combs the sphere toward perfect order; scenes change with a Riley fold that crushes the picture into crowded columns, labels are hard-edged black and red slabs, and the numbers are Archivo Black on ivory bands.',
    explainer(ctx, W, H_, t) { explainOP(ctx, W, H_, t); },
    // Sound: clean optical pulses, no hand-made noise. Hard slabs land with a short low knock, the Riley fold is a
    // ratcheting zip of crushed columns that sweeps left to right with the fold, the error ripple is a train of sine
    // pulses converging on the lens, and "grid sharpens" is two detuned sines whose beating slows into unison.
    // A quiet sine pad re-breathes every π s, the period the sphere breathes at (R = 268 + 6 sin 2t).
    // Timings mirror explainOP / OS above (seq starts, OX windows, ease curves).
    explainerSound(k) {
      const D = 14.5, E = H.ease;
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.7;
      // first time an eased progress over [t0,t1] reaches u
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // optical pulse: a clean sine blip with a faint triangle edge
      const pulse = (t, f, g, p, dur = 0.14) => { k.tone(t, { f, dur, gain: 0.2 * g, a: 0.003, pan: p }); k.tone(t, { f: k.hz(f) * 2, type: 'triangle', dur: dur * 0.5, gain: 0.04 * g, a: 0.002, pan: p }); };
      // hard-edged slab landing: short damped knock, no paper
      const slab = (t, g, p, f = 150) => { k.tone(t, { f: [[0, f], [0.07, f * 0.55]], dur: 0.12, gain: 0.32 * g, a: 0.002, pan: p }); k.noise(t, { dur: 0.025, filter: 'bandpass', f: 1400, q: 1.2, gain: 0.18 * g, a: 0.001, pan: p }); };
      // a red arrow bar extending: a short smooth rising zip
      const zip = (t, dur, p) => k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 500], [dur, 1500]], q: 1.4, gain: 0.08, a: dur * 0.5, pan: p, minor: true });
      // Riley fold wipe: sx = -120 + 1520 * inOut((t - t0) / 0.5); one column-crush click per 120 px it passes
      const fold = (t0) => {
        const sx = (t) => -120 + 1520 * E.inOut(H.clamp((t - t0) / 0.5));
        k.noise(t0, { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.25, 1100], [0.5, 350]], q: 1.1, gain: 0.14, a: 0.24 });
        k.tone(t0, { f: [[0, 70], [0.25, 110], [0.5, 60]], dur: 0.5, gain: 0.09, a: 0.22 });
        k.withMinor(() => { for (let x = 0; x <= 1280; x += 120) { const t = when(t0, t0 + 0.5, (u) => sx(t0 + u * 0.5) / 1280, x / 1280); k.noise(t, { dur: 0.018, filter: 'bandpass', f: 2200, q: 2, gain: 0.16, a: 0.001, pan: pan(x) }); k.tone(t, { f: 180, dur: 0.03, gain: 0.07, pan: pan(x) }); } });
      };
      // throttled counter: one click per step of the eased progress, at most `rate` per second
      const counter = (t0, t1, ease, steps, rate, f, p) => { let last = -1, prev = 0;
        for (let t = t0; t <= t1; t += 0.002) { const s = Math.floor(ease(H.clamp((t - t0) / (t1 - t0))) * steps); if (s !== prev && t - last >= 1 / rate) { k.noise(t, { dur: 0.016, filter: 'bandpass', f, q: 2, gain: 0.2, a: 0.001, pan: p, minor: true }); k.tone(t, { f: f * 0.1, dur: 0.025, gain: 0.05, pan: p, minor: true }); last = t; } prev = s; } };

      // ---- underneath: soft gallery room + a sine pad that breathes with the sphere (bar = π s)
      k.bed('room', 0, D, { gain: 0.15 });
      k.music('pad', 0, D, { bpm: 240 / Math.PI, gain: 0.4, chords: [['A2', 'E3', 'A3', 'C4'], ['F2', 'C3', 'A3', 'E4'], ['D3', 'A3', 'C4', 'F4'], ['A2', 'E3', 'A3', 'C4'], ['C3', 'G3', 'C4', 'E4']] });

      // ---- hook: title slab pops in (back, 0.1-0.45), shrinks into the header (1.7-2.3)
      k.tone(0.1, { f: [[0, 160], [0.2, 330]], dur: 0.22, gain: 0.1, a: 0.12, minor: true });
      const tl = when(0.1, 0.45, E.back, 1);
      slab(tl, 0.85, 0); pulse(tl, 'A3', 0.7, 0, 0.5);
      k.noise(1.7, { dur: 0.6, color: 'pink', filter: 'lowpass', f: [[0, 700], [0.6, 250]], gain: 0.03, a: 0.25, minor: true }); // soft slide to the corner

      // ---- data: fold in, three arrows, MODEL slab drops, cards swallowed by the lens, counter
      fold(2.45);
      [0, 1, 2].forEach((i) => zip(2.55 + i * 0.07, 0.35, -0.3 + i * 0.05));
      slab(when(2.7, 3.0, E.back, 1), 0.7, pan(1010), 180);
      { // card k spawns at ts = 2.6 + 3.1 (k/36)^0.8 and enters the lens (x = 760) at ts + 850/(520 + 16k)
        let last = -1; const enter = [];
        for (let c = 0; c < 36; c++) enter.push(2.6 + 3.1 * Math.pow(c / 36, 0.8) + 850 / (520 + 16 * c));
        enter.sort((a, b) => a - b).forEach((t, i) => { if (t - last < 0.16 || t > 6.0) return; last = t; k.tone(t, { f: [[0, 260 + (i % 4) * 30], [0.08, 140]], dur: 0.1, gain: 0.09, a: 0.003, pan: pan(800), minor: true }); });
      }
      // n = 10^(6 inOut(OX(t, 2.75, 5.0))) - 1: slow, fast, slow; at most 11 clicks/s
      counter(2.76, 4.98, E.inOut, 30, 11, 2600, pan(180));
      slab(5.0, 1.1, pan(200), 120); pulse(5.0, 'E3', 1, pan(200), 0.45); // 1,000,000 lands

      // ---- loop: fold in, arrows, DOG? guess, wrong, ripple back, grid sharpens, CAT ✓
      fold(6.0);
      zip(6.4, 0.25, pan(330));
      zip(7.05, 0.2, pan(890));
      slab(7.25, 0.9, pan(1090), 170); pulse(7.25, 'E4', 0.9, pan(1090), 0.25); // DOG? punches in
      k.play('tock', when(7.3, 7.55, E.back, 1), { f: 520, gain: 0.35, pan: pan(1090), minor: true }); // GUESS tag
      k.tone(7.85, { f: [[0, 220], [0.2, 440]], type: 'triangle', dur: 0.22, gain: 0.08, a: 0.15, pan: pan(1090), minor: true }); // red ring draws round
      slab(8.05, 1.1, pan(1090), 130); k.play('error', 8.05, { f: 'A3', gain: 0.8, pan: pan(1090) }); // X: wrong
      // error ripple: ring r = 620 -> -20 over 8.35-9.0, amp sin(pi u): a pulse train converging on the lens
      for (let i = 0; i < 9; i++) { const t = 8.37 + i * 0.075, u = H.clamp((t - 8.35) / 0.7), a = Math.sin(Math.PI * u);
        pulse(t, 300 + 260 * u, 0.2 + 0.4 * a, 0.45 * (1 - u), 0.1); }
      k.play('tock', when(8.85, 9.1, E.back, 1), { f: 440, gain: 0.3, pan: pan(480), minor: true }); // ADJUST tag
      // grid sharpens 8.9-9.4: beating between two sines slows to unison as the chaos combs out
      k.tone(8.9, { f: 330, dur: 0.75, gain: 0.045, a: 0.08, hold: 0.45 });
      k.tone(8.9, { f: [[0, 352], [0.5, 330.5]], dur: 0.75, gain: 0.045, a: 0.08, hold: 0.45 });
      k.tone(8.9, { f: 165, dur: 0.75, gain: 0.035, a: 0.1, hold: 0.4 });
      slab(9.6, 0.9, pan(1090), 190); k.play('success', 9.6, { f: 'E5', gain: 0.75, pan: pan(1090) }); // CAT ✓
      // the loop keeps cycling GUESS -> CHECK -> ADJUST every 0.15 s
      k.withMinor(() => { for (let i = 1; i <= 5; i++) pulse(9.6 + i * 0.15, ['G3', 'C4', 'E4'][i % 3], 0.35, pan(300), 0.09); });

      // ---- progress: fold in, checker columns stack, counter 61 -> 97, the 97% hit
      fold(10.5);
      k.withMinor(() => { for (let i = 0; i < 12; i++) { const acc = 61 + (36 * (1 - Math.exp(-i / 3.2))) / (1 - Math.exp(-11 / 3.2)); pulse(10.85 + i * 0.11, 150 + (acc - 61) * 5, 0.45, pan(70 + i * 42), 0.1); } });
      counter(10.86, 12.28, E.inOut, 36, 9, 3000, pan(160));
      k.play('impact', 12.3, { gain: 1.2, pan: pan(200) });
      ['A2', 'E3', 'A3', 'C#4'].forEach((n, i) => k.tone(12.3, { f: n, dur: 1.1, gain: 0.09 - i * 0.012, a: 0.004, verb: 0.3, pan: (i - 1.5) * 0.2 }));
      k.tone(12.3, { f: [[0, 260], [0.25, 520]], type: 'triangle', dur: 0.28, gain: 0.07, a: 0.2, pan: pan(200), minor: true }); // red ring

      // ---- takeaway: fold in, slabs pop, resolving pulse chord
      fold(13.0);
      const tk = when(13.25, 13.55, E.back, 1);
      slab(tk, 1, 0, 160);
      ['A2', 'E3', 'A3', 'C#4', 'E4'].forEach((n, i) => k.tone(tk + i * 0.04, { f: n, dur: 1.15, gain: 0.08, a: 0.01, verb: 0.35, pan: (i - 2) * 0.2 }));
    },
    draw(ctx, W, H_, t) {
      const img = ctx.createImageData(W, H_), d = img.data;
      // timeline: folds ripple in (0.2-1.6s), lens swells with overshoot (1.1-2.6s),
      // red cells flip in on twos from the centre (2.3-3.4s), then ambient breathing.
      const tau = t - 2.9;                       // ambient phase; at frameT matches the still
      const fold = H.ease.inOut(H.clamp((t - 0.05) / 1.3));
      const lensE = H.clamp((t - 1.1) / 1.5);
      const lens = lensE <= 0 ? 0 : H.ease.back(lensE);
      const tq = Math.floor(t * 15) / 15;       // on twos
      const redThr = 1.183 * H.ease.out(H.clamp((tq - 2.3) / 1.1));
      const cx = 740 + Math.sin(tau * 0.4) * 30, cy = 360;
      const R = 268 + Math.sin(tau * 0.9) * 6;
      const R2 = R * R;
      const nz = H.makeNoise(11);

      // --- field: Riley column folds outside, Vasarely lens bulge inside (grid stays continuous)
      const GW = W + 1, GH = H_ + 1;
      const G = new Float32Array(GW * GH);
      const CU = new Float32Array(GW * GH), CV = new Float32Array(GW * GH);
      const PI = Math.PI, A0 = 1 - 0.58 * lens;
      for (let y = 0; y < GH; y++) {
        for (let x = 0; x < GW; x++) {
          // Riley "Movement in Squares": columns pinch together toward two vertical folds
          let u = x + fold * (58 * Math.sin((x / W) * PI * 2.5 + 0.6 + tau * 0.25) - 9 * Math.sin((x / W) * PI * 6 + tau * 0.4));
          const yy = (y - cy) / 360; let v = cy + (y - cy) * (1 + 0.42 * fold * yy * yy) + fold * 8 * Math.sin((y / H_) * PI * 2 + tau * 0.3);
          const dx = x - cx, dy = y - cy, r2 = dx * dx + dy * dy;
          if (r2 < R2) {
            const rho = Math.sqrt(r2) / R;
            const k = A0 + (1 - A0) * rho * rho;  // f(rho)=rho*k : magnified centre, crushed rim
            // lens acts on the folded coordinates around the centre
            const ux = cx + fold * (58 * Math.sin((cx / W) * PI * 2.5 + 0.6 + tau * 0.25) - 9 * Math.sin((cx / W) * PI * 6 + tau * 0.4));
            const blend = (1 - Math.pow(rho, 2)) * H.clamp(lens * 1.5);
            u = u * (1 - blend) + (ux + dx) * blend;
            u = ux + (u - ux) * k; v = cy + (v - cy) * k;
          }
          const i = y * GW + x;
          G[i] = Math.sin((PI * (u - cx)) / S) * Math.sin((PI * (v - cy)) / S);
          CU[i] = Math.floor((u - cx) / S); CV[i] = Math.floor((v - cy) / S);
        }
      }

      // palette: ivory ground, carbon black, one signal red that floods the swelling cells
      const IV = [240, 235, 221], BK = [20, 19, 21], RD = [208, 38, 34];
      // the lens magnification of each cell -> flat, stepped tint (each square painted one colour)
      const k0 = 0.42;
      for (let y = 0; y < H_; y++) {
        for (let x = 0; x < W; x++) {
          const i = y * GW + x;
          const g = G[i];
          const gx = (G[i + 1] - g), gy = (G[i + GW] - g);
          const gm = Math.sqrt(gx * gx + gy * gy) + 1e-5;
          let a = 0.5 + (g / gm) * 0.9;
          a = a < 0 ? 0 : a > 1 ? 1 : a;
          let L = IV;
          const dx = x - cx, dy = y - cy, r2 = dx * dx + dy * dy;
          if (r2 < R2) {
            // cell centre in texture space -> its radius -> quantised tint step
            // use the neighbouring *light* cell for edge pixels so tints never fringe
            let j = i;
            if (g <= 0) { if (G[i + 1] > 0) j = i + 1; else if (G[i + GW] > 0) j = i + GW; else if (x > 0 && G[i - 1] > 0) j = i - 1; else if (y > 0 && G[i - GW] > 0) j = i - GW; }
            const ccu = (CU[j] + 0.5) * S, ccv = (CV[j] + 0.5) * S;
            const cr = Math.hypot(ccu, ccv) / (R * k0 * 1.0);
            const step = Math.max(0, Math.min(1, 1.15 - cr * 0.9));
            const q = cr < redThr ? 1 : 0;
            L = [IV[0] + (RD[0] - IV[0]) * q, IV[1] + (RD[1] - IV[1]) * q, IV[2] + (RD[2] - IV[2]) * q];
          }
          const o = (y * W + x) * 4;
          d[o] = BK[0] + (L[0] - BK[0]) * a;
          d[o + 1] = BK[1] + (L[1] - BK[1]) * a;
          d[o + 2] = BK[2] + (L[2] - BK[2]) * a;
          d[o + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);

      // --- canvas finish: linen weave + brush unevenness, multiplied lightly
      const tex = ctx.getImageData(0, 0, W, H_), td = tex.data, r = H.rng(5);
      for (let y = 0; y < H_; y++) {
        const wy = Math.sin(y * 1.9) * 0.5 + 0.5;
        for (let x = 0; x < W; x++) {
          const o = (y * W + x) * 4;
          const wx = Math.sin(x * 1.9) * 0.5 + 0.5;
          const weave = ((x >> 1) + (y >> 1)) & 1 ? wx : wy;
          const lum = (td[o] + td[o + 1] + td[o + 2]) / 765;
          const brush = nz.n2(x * 0.004, y * 0.03) * 0.5 + nz.n2(x * 0.05, y * 0.002) * 0.5;
          const k = 1 + (weave - 0.5) * 0.05 * (0.3 + lum) + brush * 0.025 + (r() - 0.5) * 0.03;
          td[o] *= k; td[o + 1] *= k; td[o + 2] *= k;
        }
      }
      ctx.putImageData(tex, 0, 0);
      H.vignette(ctx, W, H_, 0.18);
    },
  });
}
```
