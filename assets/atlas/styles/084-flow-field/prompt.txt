I want an animated explainer made in the "Flow Field" visual style (Data & Information). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Space Mono
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=block">
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
Name: Flow Field
Family: Data & Information
Look: Thousands of hairline streamlines traced through a curl-noise field that parts around an unseen core; additive colour from a refined gradient builds luminous braids on dark paper.
Motion: The dark core appears first, then particles are released in a wave from left to right and trace their streamlines outward until the braids glow; in the hold the field slowly breathes while bright sparks ride the currents.
How it explains: The model is the dark core of a flow field: labelled particles spiral into it as data, the camera pushes in as a new particle is carried out the wrong exit ("dog?"), a coral counter-current carries the error back, the circulation re-combs the whole field so the next one exits "cat", and training is shown as the turbulent field combing into smooth order, all captioned in hairline Space Mono.

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

REFERENCE STYLE SOURCE (styles/flow-field.js; W/H_ are always 1280x720)
```js
{
  // Generative streamline art: particles traced through a divergence-free (curl) field.
  const PAL = ['#123A4A', '#1C6F78', '#5FB3A6', '#CDE3CF', '#F3E6C8', '#EDBB73', '#DE7A52', '#A8384E', '#5A1E44'];
  const PALRGB = PAL.map((c) => H.hex(c));
  function pal(u) {
    u = H.clamp(u) * (PAL.length - 1);
    const i = Math.min(PAL.length - 2, Math.floor(u)), f = u - i;
    return H.mix(PALRGB[i], PALRGB[i + 1], f);
  }
  const FX = {}; // cached offscreen layers (keyed by size)
  // The core: a lensing void, not a sticker. Warm halo, dark contact ring, disc lit from the upper-left
  // with an inner rim-light, then the ivory hairline rim (drawn by the caller).
  function coreBody(ctx, cx, cy, Rc, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(cx, cy, Rc * 0.9, cx, cy, Rc * 1.5);
    halo.addColorStop(0, 'rgba(255,230,190,0.07)'); halo.addColorStop(1, 'rgba(255,230,190,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, Rc * 1.5, 0, 7); ctx.fill();
    ctx.restore();
    ctx.save();
    // contact ring: the streams darken where they graze the void
    const cr = ctx.createRadialGradient(cx, cy, Rc * 0.96, cx, cy, Rc * 0.97 + 7);
    cr.addColorStop(0, 'rgba(4,4,8,0.75)'); cr.addColorStop(0.45, 'rgba(4,4,8,0.4)'); cr.addColorStop(1, 'rgba(4,4,8,0)');
    ctx.fillStyle = cr; ctx.beginPath(); ctx.arc(cx, cy, Rc * 0.97 + 7, 0, 7); ctx.fill();
    const core = ctx.createRadialGradient(cx - Rc * 0.35, cy - Rc * 0.4, 4, cx, cy, Rc);
    core.addColorStop(0, '#1A1C28'); core.addColorStop(0.6, '#0D0E15'); core.addColorStop(1, '#06070A');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(cx, cy, Rc * 0.97, 0, 7); ctx.fill();
    ctx.clip();
    // inner rim light, strongest on the upper-left edge
    const rim = ctx.createRadialGradient(cx + Rc * 0.16, cy + Rc * 0.2, Rc * 0.62, cx + Rc * 0.05, cy + Rc * 0.06, Rc * 1.04);
    rim.addColorStop(0, 'rgba(243,230,200,0)'); rim.addColorStop(0.75, 'rgba(243,230,200,0.035)'); rim.addColorStop(1, 'rgba(243,230,200,0.13)');
    ctx.globalAlpha = a; ctx.fillStyle = rim; ctx.fillRect(cx - Rc, cy - Rc, Rc * 2, Rc * 2);
    // faint cool counter-light on the lower-right edge
    const rim2 = ctx.createRadialGradient(cx - Rc * 0.2, cy - Rc * 0.22, Rc * 0.78, cx - Rc * 0.05, cy - Rc * 0.05, Rc * 1.02);
    rim2.addColorStop(0, 'rgba(95,179,166,0)'); rim2.addColorStop(1, 'rgba(95,179,166,0.06)');
    ctx.fillStyle = rim2; ctx.fillRect(cx - Rc, cy - Rc, Rc * 2, Rc * 2);
    ctx.restore();
  }

  registerStyle({
    id: 'flow-field',
    name: 'Flow Field',
    category: 'Data & Information',
    description: 'Thousands of hairline streamlines traced through a curl-noise field that parts around an unseen core; additive colour from a refined gradient builds luminous braids on dark paper.',
    motion: 'The dark core appears first, then particles are released in a wave from left to right and trace their streamlines outward until the braids glow; in the hold the field slowly breathes while bright sparks ride the currents.',
    duration: 7,
    fonts: ['400 11px "Space Mono"', '700 11px "Space Mono"', '700 34px "Space Mono"', '700 13px "Space Mono"', '400 13px "Space Mono"', '700 38px "Space Mono"', '700 30px "Space Mono"', '700 74px "Space Mono"', '700 88px "Space Mono"', '700 60px "Space Mono"', '400 24px "Space Mono"'],
    frameT: 6.8,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      // ---- dark paper ----
      const bg = ctx.createRadialGradient(W * 0.6, H_ * 0.48, 40, W * 0.55, H_ * 0.5, W * 0.75);
      bg.addColorStop(0, '#16182A'); bg.addColorStop(1, '#08090E');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);

      // ---- stream function on a grid: flow past a cylinder + curl noise ----
      const nz = H.makeNoise(23), nz2 = H.makeNoise(57);
      const G = 4, gw = Math.ceil(W / G) + 3, gh = Math.ceil(H_ / G) + 3;
      const cx = W * 0.4, cy = H_ * 0.47, Rc = 112;
      const VORT = [[cx + 240, cy + 70, 95], [cx + 420, cy - 70, -105], [cx + 610, cy + 66, 85], [cx + 780, cy - 52, -70]];
      const psi = new Float32Array(gw * gh);
      const z = t * 0.06;
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
        const x = (i - 1) * G, y = (j - 1) * G;
        const dx = x - cx, dy = y - cy, r2 = dx * dx + dy * dy, r = Math.sqrt(r2);
        const pot = (dy) * (1 - (Rc * Rc) / Math.max(r2, 1)); // potential flow around a cylinder
        const away = H.smooth(Rc * 1.05, Rc * 2.1, r);
        const n = nz.fbm3(x * 0.0026, y * 0.0026, z, 3) * 190 + nz2.n3(x * 0.006, y * 0.006, z * 2) * 26;
        let vort = 0;
        for (const [vxp, vyp, g] of VORT) {
          const ex = x - vxp, ey = y - vyp, d2 = ex * ex + ey * ey;
          vort += g * Math.log(d2 + 900) * 0.5 * Math.exp(-d2 / (2 * 150 * 150));
        }
        psi[j * gw + i] = pot * 1.0 + (n + vort) * away + (y - H_ / 2) * 0.1;
      }
      // velocity = (dpsi/dy, -dpsi/dx)
      const vx = new Float32Array(gw * gh), vy = new Float32Array(gw * gh);
      for (let j = 1; j < gh - 1; j++) for (let i = 1; i < gw - 1; i++) {
        const k = j * gw + i;
        vx[k] = (psi[k + gw] - psi[k - gw]) / (2 * G);
        vy[k] = -(psi[k + 1] - psi[k - 1]) / (2 * G);
      }
      const sample = (x, y, out) => {
        const fx = x / G + 1, fy = y / G + 1;
        const i = Math.floor(fx), j = Math.floor(fy);
        if (i < 1 || j < 1 || i >= gw - 2 || j >= gh - 2) return false;
        const u = fx - i, v = fy - j, k = j * gw + i;
        const a = (1 - u) * (1 - v), b = u * (1 - v), c = (1 - u) * v, d = u * v;
        out[0] = vx[k] * a + vx[k + 1] * b + vx[k + gw] * c + vx[k + gw + 1] * d;
        out[1] = vy[k] * a + vy[k + 1] * b + vy[k + gw] * c + vy[k + gw + 1] * d;
        out[2] = psi[k] * a + psi[k + 1] * b + psi[k + gw] * c + psi[k + gw + 1] * d;
        return true;
      };

      // ---- trace particles; bucket polylines by colour ----
      const NB = 28, buckets = Array.from({ length: NB }, () => []), allLines = [];
      const rng = H.rng(91);
      const N = 7000, STEPS = 170, STEP = 2.2;
      const v = [0, 0, 0];
      const inCore = (x, y) => (x - cx) * (x - cx) + (y - cy) * (y - cy) < Rc * Rc * 0.98;
      for (let p = 0; p < N; p++) {
        const sx = rng.range(-20, W + 20), sy = rng.range(-20, H_ + 20);
        if (inCore(sx, sy)) continue;
        // uneven seeding: braids of dense, luminous streams separated by quiet gaps
        const dens = 0.5 + 0.5 * nz.n3(sx * 0.004, sy * 0.009, 7.3);
        if (rng() > 0.18 + dens * dens * 1.4) continue;
        if (!sample(sx, sy, v)) continue;
        const birth = 0.35 + H.clamp(sx / W) * 1.5 + rng() * 0.8;
        // colour by streamline identity (psi), slightly jittered
        const u = H.clamp((v[2] + 320) / 640 + nz2.n2(sx * 0.0035, sy * 0.0035) * 0.22 + rng.gauss() * 0.02);
        const line = []; let seedPt = 0;
        for (const dir of [-1, 1]) {
          let x = sx, y = sy;
          const seg = [];
          for (let s = 0; s < STEPS; s++) {
            if (!sample(x, y, v)) break;
            let mx = v[0], my = v[1];
            const m = Math.hypot(mx, my) || 1;
            // midpoint (RK2) step, normalised so strokes are even-length
            const hx = x + dir * mx / m * STEP * 0.5, hy = y + dir * my / m * STEP * 0.5;
            if (!sample(hx, hy, v)) break;
            const m2 = Math.hypot(v[0], v[1]) || 1;
            x += dir * v[0] / m2 * STEP; y += dir * v[1] / m2 * STEP;
            if (inCore(x, y)) break;
            seg.push(x, y);
          }
          if (dir === -1) { for (let q = seg.length - 2; q >= 0; q -= 2) line.push(seg[q], seg[q + 1]); line.push(sx, sy); seedPt = line.length / 2 - 1; }
          else for (let q = 0; q < seg.length; q++) line.push(seg[q]);
        }
        if (line.length > 20) {
          const grow = H.ease.out(H.clamp((t - birth) / 1.6));
          if (grow > 0) {
            const nPts = line.length / 2, si = Math.max(0, Math.min(nPts - 1, seedPt));
            const reach = Math.ceil(grow * STEPS);
            const a = Math.max(0, si - reach), b = Math.min(nPts - 1, si + reach);
            const piece = line.slice(a * 2, b * 2 + 2);
            if (piece.length >= 4) buckets[Math.min(NB - 1, Math.floor(u * NB))].push(piece);
          }
          if (allLines.length < 170 && rng() < 0.05) allLines.push({ L: line, u, ph: rng(), sp: rng.range(60, 120) });
        }
      }

      // ---- draw: additive hairlines ----
      const lay = H.layer(W, H_), lc = lay.getContext('2d');
      lc.globalCompositeOperation = 'lighter';
      lc.lineCap = 'round'; lc.lineJoin = 'round';
      for (let b = 0; b < NB; b++) {
        const col = pal((b + 0.5) / NB);
        lc.strokeStyle = H.rgba(col, 0.1);
        lc.lineWidth = 0.7;
        lc.beginPath();
        for (const L of buckets[b]) { lc.moveTo(L[0], L[1]); for (let q = 2; q < L.length; q += 2) lc.lineTo(L[q], L[q + 1]); }
        lc.stroke();
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      // bloom: a soft, downsampled glow where streams pile up
      const sm = H.layer(W / 4, H_ / 4), sc = sm.getContext('2d');
      sc.filter = 'blur(3px)'; sc.drawImage(lay, 0, 0, W / 4, H_ / 4);
      ctx.globalAlpha = 0.55; ctx.drawImage(sm, 0, 0, W, H_);
      ctx.globalAlpha = 1; ctx.drawImage(lay, 0, 0);
      ctx.restore();

      // ---- sparks: bright heads riding the currents ----
      const sparkA = H.clamp((t - 2.6) / 1.2);
      if (sparkA > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        for (const S of allLines) {
          const nPts = S.L.length / 2, len = nPts * STEP;
          const head = ((t * S.sp + S.ph * len) % (len + 200)) / STEP; // pause off-path between passes
          if (head >= nPts) continue;
          const tail = Math.max(0, Math.floor(head) - 22), hI = Math.floor(head);
          if (hI - tail < 2) continue;
          const col = pal(S.u), g = ctx.createLinearGradient(S.L[tail * 2], S.L[tail * 2 + 1], S.L[hI * 2], S.L[hI * 2 + 1]);
          g.addColorStop(0, H.rgba(col, 0)); g.addColorStop(1, H.rgba(H.mix(col, [255, 250, 235], 0.5), 0.6 * sparkA));
          ctx.strokeStyle = g; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(S.L[tail * 2], S.L[tail * 2 + 1]);
          for (let q = tail + 1; q <= hI; q++) ctx.lineTo(S.L[q * 2], S.L[q * 2 + 1]);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ---- the core: a faint halo that defines the void ----
      const coreA = H.ease.out(H.clamp(t / 0.9));
      coreBody(ctx, cx, cy, Rc, coreA);
      ctx.strokeStyle = `rgba(243,230,200,${0.4 * coreA})`; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(cx, cy, Rc * 0.985, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * coreA); ctx.stroke();

      // ---- caption ----
      // typed on, monospaced, after the field has filled
      const typed = (str, t0, cps) => str.slice(0, Math.max(0, Math.floor((t - t0) * cps)));
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(236,228,210,0.85)'; ctx.font = '700 11px "Space Mono"';
      let x0 = 48; for (const ch of typed('LATENT FLOW', 3.0, 22)) { ctx.fillText(ch, x0, H_ - 54); x0 += ctx.measureText(ch).width + 3.2; }
      ctx.fillStyle = 'rgba(236,228,210,0.45)'; ctx.font = '400 11px "Space Mono"';
      ctx.fillText(typed('streamlines of a learned vector field', 3.5, 40), 48, H_ - 36);
      ctx.textAlign = 'right';
      ctx.globalAlpha = H.clamp((t - 4.2) / 0.4); ctx.fillText('No. 04', W - 48, H_ - 36); ctx.globalAlpha = 1;

      H.grain(ctx, W, H_, 0.035, 12 + Math.floor(t * 12));
    },
    // Sound: air, not objects. A soft pad underneath, the field itself as breath-like filtered noise that swirls
    // while the core drinks the data and goes from gusty to smooth as turbulence combs into order; the scripted
    // particles are airy swells panned along their paths; labels arrive as low soft sine notes. Times mirror explainer().
    explainerSound(k) {
      const D = 15, cxs = 1280 * 0.42;
      const io = H.ease.inOut;
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      const seg = (t, a, b) => H.clamp((t - a) / (b - a));
      // a label surfacing: a low soft sine note with a little air
      const note = (t, f, g = 1, p = 0, minor = true) => { k.tone(t, { f, dur: 0.9, gain: 0.09 * g, a: 0.03, verb: 0.35, pan: p, minor }); k.noise(t, { dur: 0.25, color: 'pink', filter: 'bandpass', f: 1200, q: 0.8, gain: 0.025 * g, a: 0.08, pan: p, minor }); };
      // airy swell carried along a path: segments panned from p0 to p1, brightest in the middle (ease inOut speed)
      const carry = (t0, t1, p0, p1, g = 1, f0 = 500, f1 = 1500) => {
        const n = 6, d = (t1 - t0) / n;
        for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, sp = 1 - Math.abs(u - 0.5) * 1.6; k.noise(t0 + i * d, { dur: d * 1.7, color: 'pink', filter: 'bandpass', f: f0 + (f1 - f0) * sp, q: 1.1, gain: 0.07 * g * (0.4 + sp), a: d * 0.7, pan: p0 + (p1 - p0) * u, verb: 0.2 }); }
      };
      // soft grain tick for counters (filtered, dry, mid-low)
      const grain = (t, g, p) => k.noise(t, { dur: 0.02, color: 'pink', filter: 'bandpass', f: 1400, q: 1.2, gain: 0.16 * g, a: 0.003, pan: p, minor: true });
      const counter = (t0, t1, steps, p) => { let last = -1, lastT = -1; for (let t = t0; t <= t1 + 1e-6; t += 1 / 120) { const v = Math.floor(io(seg(t, t0, t1)) * steps); if (v !== last && t - lastT >= 1 / 12) { grain(t, 0.7 + 0.4 * v / steps, p); last = v; lastT = t; } } };

      k.music('pad', 0, D, { bpm: 64, gain: 0.5, chords: [['D3', 'A3', 'E4', 'F#4'], ['B2', 'F#3', 'D4', 'A4'], ['G2', 'D3', 'B3', 'F#4'], ['D3', 'A3', 'F#4', 'A4']] });

      // ---- the field: gusty air the whole way, rough early, combed smooth by 12.9 (turb 180 -> 26)
      k.withMinor(() => {
        for (let t = 0, i = 0; t < D; t += 0.5, i++) {
          const turb = H.lerp(180, 26, io(seg(t, 10.8, 12.9))) / 180, grow = H.ease.out(seg(t, 0, 2.2));
          const wob = Math.sin(i * 2.3) * 0.5 + Math.sin(i * 0.9) * 0.5;
          k.noise(t, { dur: 0.95, color: 'pink', filter: 'bandpass', f: 700 + 500 * turb * (0.5 + 0.5 * wob), q: 0.5 + 1.6 * (1 - turb), gain: 0.05 * (0.35 + 0.65 * grow) * (1 + 0.6 * turb * wob), a: 0.45, pan: wob * 0.35 * turb });
        }
      });

      // ---- hook: streamlines grow in, title surfaces, then docks top-left (1.6 -> 2.4)
      k.noise(0, { dur: 2.2, color: 'pink', filter: 'bandpass', f: [[0, 300], [1.4, 1100], [2.2, 700]], q: 0.7, gain: 0.12, a: 1.2, verb: 0.3 });
      note(0.12, 'A3', 1.3, 0, false);
      k.noise(1.6, { dur: 0.8, color: 'brown', filter: 'bandpass', f: [[0, 260], [0.8, 420]], q: 0.6, gain: 0.08, a: 0.3, pan: -0.4, minor: true });

      // ---- data: the core becomes a vortex drinking labelled particles (2.4 -> 6.6)
      for (let t = 2.4, i = 0; t < 6.4; t += 0.4, i++) // swirl: air circling the core
        k.noise(t, { dur: 0.7, color: 'pink', filter: 'bandpass', f: 500 + 120 * Math.sin(i * 1.3), q: 1.4, gain: 0.06 * (1 - seg(t, 5.6, 6.6) * 0.8), a: 0.3, pan: pan(cxs) + Math.sin(i * 1.57) * 0.45, minor: true });
      note(2.85, 'D4', 1.1, pan(cxs + 140)); // "the model"
      note(2.95, 'A3', 0.9, pan(360)); // "cat"
      note(3.25, 'F#3', 0.9, pan(360)); // "dog"
      counter(2.6, 5.9, 30, -0.6);
      note(5.9, 'D3', 1.0, -0.6, false); // 1,000,000 settles
      k.noise(6.0, { dur: 0.9, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.45, 650], [0.9, 280]], q: 0.7, gain: 0.08, a: 0.4 }); // camera eases in

      // ---- loop: one particle passes over the core, out the wrong exit
      carry(6.8, 8.0, pan(0), pan(cxs + 300), 1.1);
      note(6.95, 'E4', 0.9, pan(200)); // "new photo of a cat"
      note(7.95, 'F3', 1.2, pan(900), false); // guess: "dog?"
      k.tone(8.0, { f: 'D4', dur: 0.5, gain: 0.12, a: 0.01, verb: 0.3, pan: pan(900) }); // the wrong guess: a soft falling pair
      k.tone(8.18, { f: 'Bb3', dur: 0.9, gain: 0.13, a: 0.01, verb: 0.35, pan: pan(900) });
      k.noise(8.0, { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.5, 900]], q: 1.2, gain: 0.08, a: 0.06, pan: pan(900) }); // coral ring opens
      note(8.32, 'C4', 0.8, -0.7); // check
      carry(8.4, 9.1, pan(cxs + 300), pan(cxs), 1.1, 900, 380); // error counter-current runs back
      // adjust: the circulation flips (9.0 -> 9.9), a broad slow breath that turns over
      k.noise(9.0, { dur: 1.0, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.5, 800], [1.0, 350]], q: 0.8, gain: 0.13, a: 0.45, pan: pan(cxs), verb: 0.25 });
      note(9.05, 'G3', 1.0, pan(cxs));
      carry(9.7, 10.6, pan(0), pan(cxs + 300), 1.0, 450, 1200); // particle 2 slips under the core
      ['D4', 'A4', 'F#4'].forEach((f, i) => k.tone(10.3 + i * 0.07, { f, dur: 1.4, gain: 0.11 - i * 0.015, a: 0.01, verb: 0.4, pan: pan(900) })); // "cat" ✓
      k.noise(10.5, { dur: 0.9, color: 'pink', filter: 'bandpass', f: [[0, 280], [0.45, 600], [0.9, 260]], q: 0.7, gain: 0.08, a: 0.4 }); // camera eases out

      // ---- progress: the field sorts itself; accuracy counts up
      counter(11.0, 12.9, 36, 0.8);
      // 97%: the core rim flashes, the underline draws: the big hit, a deep soft bloom
      k.play('impact', 12.9, { gain: 0.45, pan: 0.2 });
      k.tone(12.9, { f: 'D2', dur: 2.2, gain: 0.22, a: 0.02, verb: 0.4 });
      ['D4', 'A4'].forEach((f, i) => k.play('ding', 13.0 + i * 0.07, { f, gain: 0.45, pan: 0.5 - i * 0.3 }));
      k.noise(12.9, { dur: 0.4, color: 'pink', filter: 'bandpass', f: [[0, 600], [0.4, 1100]], q: 1, gain: 0.06, a: 0.1, pan: 0.85, minor: true }); // underline
      // takeaway surfaces: the resolve
      ['D3', 'A3', 'F#4', 'A4'].forEach((f, i) => k.tone(13.4 + i * 0.09, { f, dur: 1.5, gain: 0.1 - i * 0.012, a: 0.02, verb: 0.45, pan: (i - 1.5) * 0.2 }));
    },
    explainerDuration: 15,
    explainerNote: 'The model is the dark core of a flow field: labelled particles spiral into it as data, the camera pushes in as a new particle is carried out the wrong exit ("dog?"), a coral counter-current carries the error back, the circulation re-combs the whole field so the next one exits "cat", and training is shown as the turbulent field combing into smooth order, all captioned in hairline Space Mono.',
    explainer(ctx, W, H_, t) {
      const S = (a, b) => H.clamp((t - a) / (b - a));
      const cx = W * 0.42, cy = H_ * 0.48, Rc = 92;
      const TEAL = [95, 179, 166], CORAL = [222, 122, 82], IVORY = [243, 230, 200];
      // ---- field parameters over the story ----
      const swirl = 120 * (1 - S(5.6, 6.6));                                // data: the core is a vortex drinking examples
      const circ = t < 6.6 ? 0 : H.lerp(-55, 55, H.ease.inOut(S(9.0, 9.9))); // adjust: circulation flips which side wins
      const turb = H.lerp(180, 26, H.ease.inOut(S(10.8, 12.9)));            // progress: turbulence combs into order
      // ---- camera ----
      const CK = [[0, 1, cx, cy], [6.0, 1, cx, cy], [6.8, 1.18, cx + 110, cy], [10.5, 1.18, cx + 110, cy], [11.3, 1, cx, cy], [15, 1, cx, cy]];
      let cs = 1, ccx = cx, ccy = cy;
      for (let i = 0; i < CK.length - 1; i++) if (t >= CK[i][0] && t <= CK[i + 1][0]) { const u = H.ease.inOut((t - CK[i][0]) / (CK[i + 1][0] - CK[i][0])); cs = H.lerp(CK[i][1], CK[i + 1][1], u); ccx = H.lerp(CK[i][2], CK[i + 1][2], u); ccy = H.lerp(CK[i][3], CK[i + 1][3], u); break; }
      const bg = ctx.createRadialGradient(W * 0.5, H_ * 0.48, 40, W * 0.5, H_ * 0.5, W * 0.75);
      bg.addColorStop(0, '#16182A'); bg.addColorStop(1, '#08090E');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
      ctx.save(); ctx.translate(W / 2 + (cx - W / 2), H_ / 2 + (cy - H_ / 2)); ctx.scale(cs, cs); ctx.translate(-ccx, -ccy);
      // world -> screen helper for HUD-attached labels
      const toS = (x, y) => [(x - ccx) * cs + cx, (y - ccy) * cs + cy];

      // ---- stream function on a grid ----
      const nz = H.makeNoise(23), nz2 = H.makeNoise(57);
      const G = 5, gx0 = -40, gy0 = -40, gw = Math.ceil((W + 80) / G) + 2, gh = Math.ceil((H_ + 80) / G) + 2;
      const psi = new Float32Array(gw * gh);
      const z = t * 0.06;
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
        const x = gx0 + i * G, y = gy0 + j * G, dx = x - cx, dy = y - cy, r2 = dx * dx + dy * dy, r = Math.sqrt(r2);
        const pot = dy * (1 - (Rc * Rc) / Math.max(r2, 1));
        const away = H.smooth(Rc * 1.05, Rc * 2.2, r);
        const n = nz.fbm3(x * 0.0026, y * 0.0026, z, 3) * turb;
        psi[j * gw + i] = pot + n * away + (swirl + circ) * Math.log(Math.max(r, 1) / Rc);
      }
      const sample = (x, y, out) => {
        const fx = (x - gx0) / G, fy = (y - gy0) / G, i = Math.floor(fx), j = Math.floor(fy);
        if (i < 1 || j < 1 || i >= gw - 2 || j >= gh - 2) return false;
        const k = j * gw + i, u = fx - i, v = fy - j;
        const p = (kk) => psi[kk];
        const dpy = ((p(k + gw) - p(k - gw)) * (1 - u) + (p(k + gw + 1) - p(k - gw + 1)) * u) / (2 * G);
        const dpx = ((p(k + 1) - p(k - 1)) * (1 - v) + (p(k + gw + 1) - p(k + gw - 1)) * v) / (2 * G);
        out[0] = dpy; out[1] = -dpx; out[2] = p(k) * (1 - u) * (1 - v) + p(k + 1) * u * (1 - v) + p(k + gw) * (1 - u) * v + p(k + gw + 1) * u * v;
        return true;
      };
      // ---- background streamlines (grow in during the hook) ----
      const DY = new Float32Array(gw * gh), DX = new Float32Array(gw * gh);
      for (let j = 1; j < gh - 1; j++) for (let i = 1, k = j * gw + 1; i < gw - 1; i++, k++) { DY[k] = (psi[k + gw] - psi[k - gw]) / (2 * G); DX[k] = (psi[k + 1] - psi[k - 1]) / (2 * G); }
      const NB = 24, buckets = Array.from({ length: NB }, () => []), sparkLines = [];
      const rng = H.rng(91), v = [0, 0, 0];
      const grow = H.ease.out(S(0, 2.2));
      const STEPS = Math.floor(10 + 120 * grow), STEP = 2.4;
      const inCore = (x, y) => (x - cx) ** 2 + (y - cy) ** 2 < Rc * Rc * 0.97;
      for (let pI = 0; pI < 4600; pI++) {
        const sx = rng.range(-30, W + 30), sy = rng.range(-30, H_ + 30);
        // uneven seeding as in the still: dense luminous braids separated by quiet gaps
        const dens = 0.5 + 0.5 * nz.n3(sx * 0.004, sy * 0.009, 7.3);
        if (rng() > 0.1 + dens * dens * 1.45) continue;
        if (inCore(sx, sy) || !sample(sx, sy, v)) continue;
        const u = H.clamp((v[2] + 320) / 640 + nz2.n2(sx * 0.0035, sy * 0.0035) * 0.2);
        const line = [];
        for (const dir of [-1, 1]) {
          let x = sx, y = sy; const seg = [];
          for (let s = 0; s < STEPS; s++) {
            // same velocity as sample(), read from the precomputed difference grids
            const fx = (x - gx0) / G, fy = (y - gy0) / G, i = Math.floor(fx), j = Math.floor(fy);
            if (i < 1 || j < 1 || i >= gw - 2 || j >= gh - 2) break;
            const k = j * gw + i, uu = fx - i, vv = fy - j;
            const vxx = DY[k] * (1 - uu) + DY[k + 1] * uu, vyy = -(DX[k] * (1 - vv) + DX[k + gw] * vv);
            const m = Math.sqrt(vxx * vxx + vyy * vyy) || 1;
            x += dir * vxx / m * STEP; y += dir * vyy / m * STEP; if ((x - cx) * (x - cx) + (y - cy) * (y - cy) < Rc * Rc * 0.97) break; seg.push(x, y);
          }
          if (dir === -1) { for (let q = seg.length - 2; q >= 0; q -= 2) line.push(seg[q], seg[q + 1]); line.push(sx, sy); } else line.push(...seg);
        }
        if (line.length > 8) {
          buckets[Math.min(NB - 1, Math.floor(u * NB))].push(line);
          if (sparkLines.length < 90 && line.length > 60 && (pI * 7919) % 23 === 0) sparkLines.push({ L: line, u, ph: (pI * 0.6180339) % 1, sp: 60 + ((pI * 37) % 61) });
        }
      }
      // hairlines into an offscreen layer (camera applied there), then the still's bloom + sharp composite
      const order = H.ease.inOut(S(10.8, 12.9));
      if (!FX.lay || FX.lay.width !== W || FX.lay.height !== H_) { FX.lay = H.layer(W, H_); FX.sm = H.layer(W / 4, H_ / 4); }
      const lc = FX.lay.getContext('2d');
      lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, W, H_);
      lc.translate(cx, cy); lc.scale(cs, cs); lc.translate(-ccx, -ccy);
      lc.globalCompositeOperation = 'lighter'; lc.lineCap = 'butt'; lc.lineJoin = 'bevel'; lc.lineWidth = 0.7 / cs;
      for (let b = 0; b < NB; b++) {
        lc.strokeStyle = H.rgba(pal((b + 0.5) / NB), 0.12 + 0.04 * order);
        lc.beginPath(); for (const L of buckets[b]) { lc.moveTo(L[0], L[1]); for (let q = 4; q < L.length; q += 4) lc.lineTo(L[q], L[q + 1]); if (L.length % 4 === 0) lc.lineTo(L[L.length - 2], L[L.length - 1]); } lc.stroke();
      }
      ctx.save(); ctx.setTransform(ctx.getTransform().multiply(new DOMMatrix().translate(ccx, ccy).scale(1 / cs, 1 / cs).translate(-cx, -cy)));
      ctx.globalCompositeOperation = 'lighter';
      const sc = FX.sm.getContext('2d'); sc.clearRect(0, 0, W / 4, H_ / 4); sc.filter = 'blur(3px)'; sc.drawImage(FX.lay, 0, 0, W / 4, H_ / 4); sc.filter = 'none';
      ctx.globalAlpha = 0.6; ctx.drawImage(FX.sm, 0, 0, W, H_);
      ctx.globalAlpha = 1; ctx.drawImage(FX.lay, 0, 0);
      ctx.restore();
      // sparks: bright heads riding the currents (the still's shimmer, at about half density)
      const sparkA = S(1.4, 2.6) * 0.85;
      if (sparkA > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineWidth = 1.2 / cs;
        for (const Sp of sparkLines) {
          const nPts = Sp.L.length / 2, len = nPts * STEP;
          const head = ((t * Sp.sp + Sp.ph * len) % (len + 200)) / STEP;
          if (head >= nPts) continue;
          const tail = Math.max(0, Math.floor(head) - 22), hI = Math.floor(head);
          if (hI - tail < 2) continue;
          const col = pal(Sp.u), g = ctx.createLinearGradient(Sp.L[tail * 2], Sp.L[tail * 2 + 1], Sp.L[hI * 2], Sp.L[hI * 2 + 1]);
          g.addColorStop(0, H.rgba(col, 0)); g.addColorStop(1, H.rgba(H.mix(col, [255, 250, 235], 0.5), 0.6 * sparkA));
          ctx.strokeStyle = g;
          ctx.beginPath(); ctx.moveTo(Sp.L[tail * 2], Sp.L[tail * 2 + 1]);
          for (let q = tail + 1; q <= hI; q++) ctx.lineTo(Sp.L[q * 2], Sp.L[q * 2 + 1]);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ---- the core (the model) ----
      const flash = S(12.9, 13.1) * (1 - S(13.3, 14.0));
      coreBody(ctx, cx, cy, Rc, 1);
      ctx.strokeStyle = `rgba(243,230,200,${0.4 + 0.5 * flash})`; ctx.lineWidth = (0.8 + 2 * flash) / cs; ctx.beginPath(); ctx.arc(cx, cy, Rc * 0.985, 0, 7); ctx.stroke();

      // ---- particle helpers ----
      const dot = (x, y, col, r, a = 1) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4); g.addColorStop(0, H.rgba(col, 0.9 * a)); g.addColorStop(1, H.rgba(col, 0)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, 7); ctx.fill(); ctx.restore(); ctx.fillStyle = H.rgba(IVORY, a); ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, 7); ctx.fill(); };
      const trail = (P, col, a = 1) => { if (P.length < 2) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; for (let i = 1; i < P.length; i++) { ctx.strokeStyle = H.rgba(col, a * 0.8 * i / P.length); ctx.lineWidth = 1.6 / cs; ctx.beginPath(); ctx.moveTo(...P[i - 1]); ctx.lineTo(...P[i]); ctx.stroke(); } ctx.restore(); };
      // spiral into the core (data beat)
      const spiral = (r0, th0, u) => { const r = H.lerp(r0, Rc * 0.95, Math.pow(u, 0.8)), th = th0 + u * u * 2.6; return [cx + Math.cos(th) * r, cy + Math.sin(th) * r]; };
      // scripted pass over (up=+1 → dog exit) or under (up=-1 → cat exit) the core
      const pass = (up, u, y0 = cy) => {
        const s = up > 0 ? -1 : 1;
        const P = [[-30, y0], [cx - Rc - 160, y0 + s * 6], [cx - Rc * 0.9, cy + s * (Rc * 0.75)], [cx, cy + s * (Rc + 26)], [cx + Rc * 0.95, cy + s * (Rc * 0.8)], [cx + Rc + 150, cy + s * 120], [cx + Rc + 330, cy + s * 195]];
        const f = H.clamp(u) * (P.length - 1), i = Math.min(P.length - 2, Math.floor(f)), w = f - i;
        const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
        const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * w + (2 * a - 5 * b + 4 * c - d) * w * w + (-a + 3 * b - 3 * c + d) * w * w * w);
        return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])];
      };
      const hist = (fn, u, n = 12, du = 0.012) => { const P = []; for (let k = n; k >= 0; k--) P.push(fn(u - k * du)); return P; };

      // ================= DATA: labelled particles spiral into the core =================
      const dA = S(2.4, 2.8) * (1 - S(6.2, 6.6));
      let tagCat = null, tagDog = null;
      if (dA > 0) {
        const pr = H.rng(404);
        for (let k = 0; k < 70; k++) {
          const isCat = pr.chance(0.5), r0 = pr.range(560, 820), th0 = Math.PI + pr.range(-0.5, 0.5), t0 = 2.4 + pr.range(0, 3.4), dur = pr.range(1.6, 2.4);
          const u = (t - t0) / dur; if (u <= 0 || u >= 1) continue;
          const col = isCat ? TEAL : CORAL, P = hist((uu) => spiral(r0, th0, H.clamp(uu)), u, 10, 0.02);
          trail(P, col, dA); const [x, y] = P[P.length - 1]; dot(x, y, col, 2.4, dA * (1 - S(0.85, 1) * 0));
          
          if (!tagCat && isCat && u > 0.15 && u < 0.6 && y > 190 && x > 120) tagCat = [x, y];
          if (!tagDog && !isCat && u > 0.15 && u < 0.6 && y > 190 && x > 120) tagDog = [x, y];
        }
      }

      // ================= LOOP: one new particle, wrong exit, error back, re-comb, right exit =================
      const loopA = S(6.6, 6.9) * (1 - S(10.6, 11.0));
      let p1 = null, p2 = null;
      if (loopA > 0) {
        // splitter: two exits
        // particle 1 (above → dog)
        const u1 = H.ease.inOut(S(6.8, 8.0));
        if (t >= 6.8 && t < 9.9) { const P = hist((uu) => pass(1, uu), u1, 14, 0.01); trail(P, IVORY, loopA); p1 = P[P.length - 1]; dot(...p1, IVORY, 3.2, loopA); }
        // error counter-current: coral streak running back from the dog exit to the core
        const e = S(8.4, 9.1);
        if (e > 0 && t < 9.9) {
          const P = []; for (let k = 0; k <= 30; k++) { const uu = 1 - e * (k / 30) * 0.62; P.push(pass(1, uu)); }
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = H.rgba(CORAL, 0.85 * (1 - S(9.5, 9.9))); ctx.lineWidth = 3 / cs; ctx.lineCap = 'round';
          ctx.setLineDash([10 / cs, 6 / cs]); ctx.lineDashOffset = t * 60 / cs;
          ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
        }
        // particle 2 (below → cat)
        const u2 = H.ease.inOut(S(9.7, 10.6));
        if (t >= 9.7) { const P = hist((uu) => pass(-1, uu), u2, 14, 0.01); trail(P, TEAL, loopA); p2 = P[P.length - 1]; dot(...p2, TEAL, 3.2, loopA); }
      }

      // ================= PROGRESS: many particles now sort themselves correctly =================
      if (t > 10.9) {
        const pr = H.rng(808), acc = 0.61 + 0.36 * H.ease.inOut(S(11.0, 12.9));
        for (let k = 0; k < 46; k++) {
          const isCat = pr.chance(0.5), t0 = 10.9 + pr.range(0, 3.8), dur = pr.range(1.4, 2.0), y0 = cy + pr.range(-60, 60), right = pr() < acc;
          const u = (t - t0) / dur; if (u <= 0 || u >= 1) continue;
          const up = isCat ? (right ? -1 : 1) : (right ? 1 : -1);
          const P = hist((uu) => pass(up, uu, y0), u, 10, 0.012), col = isCat ? TEAL : CORAL;
          trail(P, col, 0.9); dot(...P[P.length - 1], col, 2.2, 0.9);
        }
      }
      ctx.restore(); // camera

      // ================= labels (hairline Space Mono, attached to what they label) =================
      const mono = (str, x, y, size, weight, a, align = 'left', col = 'rgba(236,228,210,0.88)') => { if (a <= 0) return; ctx.globalAlpha = a; ctx.font = `${weight} ${size}px "Space Mono"`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(str, x, y); ctx.globalAlpha = 1; };
      const lead = (x0, y0, x1, y1, a, col = 'rgba(236,228,210,0.6)') => { if (a <= 0) return; ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.beginPath(); ctx.arc(x1, y1, 2, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; };
      // hook title → docks top-left
      {
        const d = H.ease.inOut(S(1.6, 2.4));
        const x = H.lerp(W / 2, 44, d), y = H.lerp(H_ * 0.48 + 14, 56, d), sz = H.lerp(60, 30, d);
        ctx.globalAlpha = S(0.1, 0.5); ctx.font = `700 ${sz}px "Space Mono"`; ctx.fillStyle = 'rgba(236,228,210,0.95)'; ctx.textAlign = d > 0.5 ? 'left' : 'center'; ctx.textBaseline = 'alphabetic';
        if (d <= 0.5) { ctx.fillStyle = 'rgba(8,9,14,0.65)'; ctx.fillRect(W / 2 - 430, y - 70, 860, 100); ctx.fillStyle = 'rgba(236,228,210,0.95)'; }
        let w = 0; const str = 'HOW DOES AI LEARN?', tr = H.lerp(5, 3, d); for (const ch of str) w += ctx.measureText(ch).width + tr;
        let xx = d > 0.5 ? x : x - w / 2; ctx.textAlign = 'left'; for (const ch of str) { ctx.fillText(ch, xx, y); xx += ctx.measureText(ch).width + tr; }
        ctx.globalAlpha = 1;
      }
      // data labels
      const coreS = toS(cx + Rc * 0.7, cy - Rc * 0.7);
      const mA = S(2.8, 3.2) * (1 - S(10.6, 11)) * (1 - S(8.4, 8.6) + S(9.8, 10.0));
      lead(coreS[0] + 60, coreS[1] - 60, coreS[0], coreS[1], mA);
      mono('the model', coreS[0] + 64, coreS[1] - 66, 30, 700, mA);
      if (dA > 0) {
        if (tagCat) { const [x, y] = toS(...tagCat); lead(x - 34, y - 30, x, y, dA * S(2.9, 3.2)); mono('cat', x - 38, y - 34, 28, 700, dA * S(2.9, 3.2), 'right', 'rgb(95,179,166)'); }
        if (tagDog) { const [x, y] = toS(...tagDog); lead(x + 34, y + 30, x, y, dA * S(3.2, 3.5)); mono('dog', x + 38, y + 52, 28, 700, dA * S(3.2, 3.5), 'left', 'rgb(222,122,82)'); }
        const n = Math.round(1e6 * H.ease.inOut(S(2.6, 5.9)));
        mono(n.toLocaleString('en-US'), 44, H_ - 84, 74, 700, dA);
        mono('labelled examples flowing in', 48, H_ - 44, 28, 400, dA, 'left', 'rgba(236,228,210,0.7)');
      }
      // loop labels
      if (loopA > 0) {
        const steps = ['guess', 'check', 'adjust'], act = t < 8.3 ? 0 : t < 9.0 ? 1 : t < 9.8 ? 2 : 0;
        let x = 48; steps.forEach((s, i) => { ctx.font = '700 30px "Space Mono"'; const w = ctx.measureText(s).width; mono(s, x, 110, 30, 700, loopA, 'left', i === act ? 'rgba(236,228,210,0.98)' : 'rgba(236,228,210,0.35)'); if (i === act) { ctx.globalAlpha = loopA; ctx.fillStyle = 'rgba(236,228,210,0.9)'; ctx.fillRect(x, 120, w, 3); ctx.globalAlpha = 1; } x += w + 18; if (i < 2) { mono('→', x, 110, 30, 400, loopA, 'left', 'rgba(236,228,210,0.4)'); x += 48; } });
        const [ux, uy] = toS(...pass(1, 1)), [lx, ly] = toS(...pass(-1, 1));
        // exits: hairline gates with their labels
        [[ux, uy, 'dog', 'rgb(222,122,82)'], [lx, ly, 'cat', 'rgb(95,179,166)']].forEach(([x, y, s, c]) => {
          ctx.globalAlpha = loopA; ctx.strokeStyle = c; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
          mono(s, x + 20, y + 11, 32, 700, loopA, 'left', c);
        });
        if (p1 && t < 8.3) { const [x, y] = toS(...p1); mono('new photo of a cat', Math.max(x + 24, 40), y - 26, 26, 700, S(6.9, 7.2) * (1 - S(7.6, 7.8))); }
        if (t >= 7.9 && t < 9.9) {
          const a = S(7.9, 8.1) * (1 - S(9.6, 9.9));
          mono('guess: “dog?” ✗', ux - 60, uy - 34, 30, 700, a, 'left', 'rgba(236,228,210,0.98)');
          const ring = S(8.0, 8.5); ctx.globalAlpha = a * (1 - ring * 0.6); ctx.strokeStyle = 'rgba(222,122,82,0.9)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(ux, uy, 12 + 46 * ring, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
          mono('check: it was a cat', lx - 60, ly + 52, 26, 700, S(8.3, 8.6) * (1 - S(9.6, 9.9)), 'left');
          const [mx, my] = toS(cx + Rc * 1.2, cy - Rc * 1.55);
          mono('error flows back', mx, my, 28, 700, S(8.6, 8.9) * (1 - S(9.5, 9.8)), 'left', 'rgb(222,122,82)');
        }
        const [ax, ay] = toS(cx, cy + Rc + 40);
        mono('adjust: the flow re-combs', ax, ay + 30, 28, 700, S(9.0, 9.3) * (1 - S(9.9, 10.2)), 'center');
        if (t >= 10.3) mono('guess: “cat” ✓', lx - 60, ly + 52, 30, 700, S(10.3, 10.5) * loopA, 'left', 'rgb(95,179,166)');
      }
      // progress
      if (t > 10.9) {
        const a = S(11.0, 11.3), p = H.ease.inOut(S(11.0, 12.9));
        mono('accuracy', W - 48, H_ - 150, 28, 400, a, 'right', 'rgba(236,228,210,0.7)');
        mono(Math.round(61 + 36 * p) + '%', W - 48, H_ - 70, 88, 700, a, 'right');
        mono('turbulence combs into order', 48, H_ - 84, 28, 700, S(11.2, 11.6) * (1 - S(13.1, 13.4)));
        // sparkline
        ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(236,228,210,0.8)'; ctx.lineWidth = 1; ctx.beginPath();
        for (let k = 0; k <= 50 * p; k++) { const u = k / 50, vv = 1 - Math.exp(-u * 4); const x = W - 440 + u * 150, y = H_ - 96 - vv * 44; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
        // baseline, ticks and a glowing end-dot so it reads as a chart
        ctx.strokeStyle = 'rgba(236,228,210,0.28)'; ctx.beginPath(); ctx.moveTo(W - 444, H_ - 95.5); ctx.lineTo(W - 286, H_ - 95.5);
        for (let k = 0; k <= 5; k++) { const x = Math.round(W - 440 + k * 30) + 0.5; ctx.moveTo(x, H_ - 95.5); ctx.lineTo(x, H_ - 91); } ctx.stroke();
        { const vv = 1 - Math.exp(-p * 4), ex = W - 440 + p * 150, ey = H_ - 96 - vv * 44;
          const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 10); g.addColorStop(0, 'rgba(255,240,215,0.7)'); g.addColorStop(1, 'rgba(255,240,215,0)');
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, 10, 0, 7); ctx.fill(); ctx.restore();
          ctx.fillStyle = 'rgba(246,238,222,0.95)'; ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, 7); ctx.fill(); }
        ctx.globalAlpha = 1;
        const em = S(12.9, 13.3); if (em > 0) { ctx.fillStyle = 'rgba(236,228,210,0.95)'; ctx.fillRect(W - 48 - 170 * em, H_ - 56, 170 * em, 3); }
      }
      mono('MORE EXAMPLES → BETTER GUESSES', W / 2 - 40, H_ - 26, 44, 700, S(13.3, 13.8), 'center', 'rgba(236,228,210,0.98)');
      H.grain(ctx, W, H_, 0.035, 12 + Math.floor(t * 12));
    },
  });
}
```
