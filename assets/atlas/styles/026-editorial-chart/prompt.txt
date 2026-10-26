I want an animated explainer made in the "Artificial intelligence" visual style (Data & Information). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Caveat, Inter, Libre Baskerville
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@300;400;600;800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=block">
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
Name: Artificial intelligence
Family: Data & Information
Look: A prestige-newspaper data graphic on FT salmon: serif headline and dek, hairline grid, one claret highlight series against quiet greys, direct labels and hand-annotated callouts, small-caps source line.
Motion: Headline sets, gridlines rule across, grey context lines settle, then the claret line draws left to right with its wash filling behind it and handwritten notes inking in as the line reaches them; a slow push and a soft pulse on the end point hold the shot.
How it explains: Told as a scrolling newspaper story: the page scrolls panel to panel under a sticky serif header, hand-drawn Caveat arrows and rings carry the cause and emphasis, a waffle chart and set numerals count the data, and the accuracy line draws itself like the still.

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

REFERENCE STYLE SOURCE (styles/editorial-chart.js; W/H_ are always 1280x720)
```js
{
  // Prestige-newspaper data graphic (FT / NYT / Economist register).
  const BG = '#FFF1E5', INK = '#33302E', MUTED = '#66605C', GRID = 'rgba(51,48,46,0.16)';
  const HI = '#990F3D', GREY = '#A79E95';

  // Illustrative annual data, $bn
  const YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const SERIES = [
    { name: 'Artificial intelligence', hi: true, v: [11, 16, 24, 37, 50, 63, 58, 92, 104, 176, 262, 348, 405] },
    { name: 'Cloud infrastructure', v: [58, 66, 77, 88, 101, 116, 138, 152, 163, 171, 182, 191, 198] },
    { name: 'Cybersecurity', v: [28, 32, 36, 41, 47, 52, 60, 73, 82, 86, 92, 98, 104] },
    { name: 'Robotics', v: [19, 21, 24, 28, 31, 33, 30, 38, 44, 47, 52, 58, 63] },
    { name: 'AR/VR headsets', v: [4, 7, 11, 14, 17, 19, 24, 36, 31, 25, 22, 21, 22] },
  ];

  // quarterly interpolation with a little seeded texture so lines feel like real data
  function quarterly(v, seed, jitter) {
    const r = H.rng(seed), out = [];
    for (let i = 0; i < v.length - 1; i++) {
      const p0 = v[Math.max(0, i - 1)], p1 = v[i], p2 = v[i + 1], p3 = v[Math.min(v.length - 1, i + 2)];
      for (let q = 0; q < 4; q++) {
        const f = q / 4, f2 = f * f, f3 = f2 * f;
        // Catmull-Rom between annual points
        const base = 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (-p0 + 3 * p1 - 3 * p2 + p3) * f3);
        out.push(base + (i + q > 0 ? r.gauss() * jitter * Math.sqrt(Math.max(1, base)) : 0));
      }
    }
    out.push(v[v.length - 1]);
    return out;
  }

  function smallCaps(ctx, str, x, y, size, color, track, align) {
    // faux small caps: capitals at full size, lower-case set as smaller capitals
    ctx.fillStyle = color;
    const big = `600 ${size}px "Inter"`, sm = `600 ${Math.round(size * 0.78)}px "Inter"`;
    const parts = [];
    for (const ch of str) {
      const up = ch === ch.toUpperCase() && ch !== ch.toLowerCase();
      parts.push({ c: ch.toUpperCase(), f: up || /[0-9©]/.test(ch) ? big : sm });
    }
    let w = 0;
    for (const p of parts) { ctx.font = p.f; w += ctx.measureText(p.c).width + track; }
    let cx = align === 'right' ? x - w : x;
    ctx.textAlign = 'left';
    for (const p of parts) { ctx.font = p.f; ctx.fillText(p.c, cx, y); cx += ctx.measureText(p.c).width + track; }
  }

  // hand-drawn leader: wobbly quadratic with a small open arrowhead
  function leader(ctx, x0, y0, cx, cy, x1, y1, seed, color, prog = 1, lw = 1.25) {
    if (prog <= 0) return;
    const r = H.rng(seed);
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    let px = 0, py = 0;
    const nI = Math.max(1, Math.round(28 * prog));
    for (let i = 0; i <= nI; i++) {
      const u = i / 28, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
      const wob = Math.sin(u * Math.PI) * 0.8;
      px = a * x0 + b * cx + c * x1 + r.gauss() * 0.25 * wob;
      py = a * y0 + b * cy + c * y1 + r.gauss() * 0.25 * wob;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    if (prog < 0.97) { ctx.restore(); return; }
    // arrowhead from tangent at end
    const tx = x1 - cx, ty = y1 - cy, L = Math.hypot(tx, ty) || 1, ux = tx / L, uy = ty / L;
    const hl = 8;
    ctx.beginPath();
    ctx.moveTo(x1 - ux * hl - uy * hl * 0.55, y1 - uy * hl + ux * hl * 0.55);
    ctx.lineTo(x1 + r.gauss() * 0.2, y1);
    ctx.lineTo(x1 - ux * hl + uy * hl * 0.5, y1 - uy * hl - ux * hl * 0.5);
    ctx.stroke();
    ctx.restore();
  }

  // handwritten write-on: reveal text left to right
  function writeOn(ctx, str, x, y, p) {
    if (p <= 0) return;
    const w = ctx.measureText(str).width;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 4, y - 30, (w + 8) * H.clamp(p), 42); ctx.clip();
    ctx.fillText(str, x, y); ctx.restore();
  }
  const seg = (t, a, b) => H.clamp((t - a) / (b - a));

  // ---- explainer helpers: line icons in the graphic's hairline style ----
  function catIcon(ctx, x, y, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.6 / s; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-12, -4); ctx.lineTo(-11, -17); ctx.lineTo(-4, -10); ctx.quadraticCurveTo(0, -11.5, 4, -10); ctx.lineTo(11, -17); ctx.lineTo(12, -4);
    ctx.quadraticCurveTo(13, 11, 0, 12); ctx.quadraticCurveTo(-13, 11, -12, -4); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-5, -1, 1.6, 0, 7); ctx.arc(5, -1, 1.6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-1.5, 4); ctx.lineTo(1.5, 4); ctx.lineTo(0, 5.8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-3, 6); ctx.lineTo(-15, 4); ctx.moveTo(-3, 7.5); ctx.lineTo(-14, 9); ctx.moveTo(3, 6); ctx.lineTo(15, 4); ctx.moveTo(3, 7.5); ctx.lineTo(14, 9); ctx.stroke();
    ctx.restore();
  }
  function dogIcon(ctx, x, y, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.6 / s; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-9, -10); ctx.quadraticCurveTo(0, -15, 9, -10); ctx.quadraticCurveTo(12, 0, 8, 7); ctx.quadraticCurveTo(0, 14, -8, 7); ctx.quadraticCurveTo(-12, 0, -9, -10); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-12, -2, 4, 9, 0.35, 0, 7); ctx.ellipse(12, -2, 4, 9, -0.35, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(-4, -3, 1.6, 0, 7); ctx.arc(4, -3, 1.6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 5, 3.2, 2.3, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  // hand-drawn emphasis ring (wobbly, overshooting like a marker circle)
  function handRing(ctx, x, y, rx, ry, p, seed, col, lw = 1.8) {
    if (p <= 0) return;
    const r = H.rng(seed);
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath();
    const n = Math.max(2, Math.floor(64 * p)), a0 = -2.4;
    for (let k = 0; k <= n; k++) { const a = a0 + k / 64 * Math.PI * 2.25, w = 1 + 0.06 * Math.sin(k * 0.35) + k * 0.0012; const px = x + Math.cos(a) * rx * w, py = y + Math.sin(a) * ry * w; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke(); ctx.restore();
  }
  // a small network drawn as an editorial diagram: nodes + hairline weights
  function miniNet(ctx, x, y, w, h, weights, hot, nr = 7) {
    const cols = [3, 4, 2];
    const P = cols.map((n, c) => Array.from({ length: n }, (_, i) => [x + c * w / 2, y + (i + 0.5) * h / n]));
    let k = 0;
    for (let c = 0; c < 2; c++) for (const a of P[c]) for (const b of P[c + 1]) {
      const wt = weights[k++ % weights.length];
      // hairline-but-dark like the hero's grid: readable at video size even for near-zero weights
      ctx.strokeStyle = wt > 0 ? H.rgba(HI, Math.min(1, 0.5 + 0.7 * Math.abs(wt))) : H.rgba('#857D75', Math.min(1, 0.42 + 0.7 * Math.abs(wt)));
      ctx.lineWidth = 1.4 + 2.4 * Math.abs(wt);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    for (const col of P) for (const [px, py] of col) {
      ctx.fillStyle = BG; ctx.beginPath(); ctx.arc(px, py, nr, 0, 7); ctx.fill();
      ctx.strokeStyle = hot ? HI : INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, nr, 0, 7); ctx.stroke();
    }
    return P;
  }

  registerStyle({
    id: 'editorial-chart',
    name: 'Editorial Chart',
    category: 'Data & Information',
    description: 'A prestige-newspaper data graphic on FT salmon: serif headline and dek, hairline grid, one claret highlight series against quiet greys, direct labels and hand-annotated callouts, small-caps source line.',
    motion: 'Headline sets, gridlines rule across, grey context lines settle, then the claret line draws left to right with its wash filling behind it and handwritten notes inking in as the line reaches them; a slow push and a soft pulse on the end point hold the shot.',
    duration: 6,
    fonts: ['700 34px "Libre Baskerville"', '400 17px "Libre Baskerville"', 'italic 400 15px "Libre Baskerville"',
      '600 13px "Inter"', '400 13px "Inter"', '800 13px "Inter"', '700 22px "Caveat"', '700 92px "Libre Baskerville"', '700 46px "Libre Baskerville"', '600 28px "Inter"', '400 26px "Inter"'],
    frameT: 5.9,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      // ---- paper ----
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H_);
      // slow push-in across the shot
      ctx.save();
      const push = 1 + 0.018 * H.ease.inOut(seg(t, 1.5, 6));
      ctx.translate(W / 2, H_ * 0.55); ctx.scale(push, push); ctx.translate(-W / 2, -H_ * 0.55);

      const L = 84, R = 1080, T = 214, B = 596;
      const yMax = 450;
      const X = (yr) => L + (yr - 2014) / 12 * (R - L);
      const Y = (v) => B - v / yMax * (B - T);
      const reveal = H.ease.inOut(seg(t, 2.0, 4.0));
      const greyIn = H.ease.out(seg(t, 1.1, 2.2));

      // ---- masthead rule + kicker ----
      const ruleP = H.ease.out(seg(t, 0, 0.5));
      ctx.fillStyle = INK; ctx.fillRect(L, 40, 1116 * ruleP, 3);
      ctx.fillStyle = HI; ctx.fillRect(L, 40, 46 * H.clamp(ruleP * 4), 7);
      ctx.globalAlpha = seg(t, 0.2, 0.5);
      smallCaps(ctx, 'Artificial Intelligence', L, 76, 13, HI, 1.6);
      ctx.globalAlpha = 1;

      // ---- headline & dek: set line by line with a short rise ----
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      const setIn = (str, font, col, y, a, b) => {
        const p = H.ease.out(seg(t, a, b)); if (p <= 0) return;
        ctx.globalAlpha = p; ctx.fillStyle = col; ctx.font = font; ctx.fillText(str, L, y + (1 - p) * 10); ctx.globalAlpha = 1;
      };
      setIn('AI spending leaves the rest behind', '700 34px "Libre Baskerville"', INK, 120, 0.15, 0.75);
      setIn('Global corporate investment by technology category, $bn', '400 17px "Libre Baskerville"', MUTED, 152, 0.35, 0.9);
      setIn('Annual, 2014–2026. Figures are illustrative', '400 13px "Inter"', MUTED, 177, 0.5, 1.0);

      // ---- forecast band ----
      const fx0 = X(2025), fx1 = X(2026);
      const fb = seg(t, 1.2, 1.7);
      ctx.fillStyle = `rgba(51,48,46,${0.055 * fb})`; ctx.fillRect(fx0, T - 6, fx1 - fx0, B - T + 6);
      ctx.globalAlpha = fb;
      ctx.font = 'italic 400 13px "Libre Baskerville"'; ctx.fillStyle = MUTED; ctx.textAlign = 'center';
      ctx.fillText('Forecast', (fx0 + fx1) / 2, T + 10);
      ctx.globalAlpha = 1;

      // ---- gridlines rule across, bottom first; labels sit on the line (NYT style) ----
      ctx.textAlign = 'left'; ctx.font = '400 13px "Inter"';
      for (let v = 0; v <= 400; v += 100) {
        const k = v / 100, gp = H.ease.inOut(seg(t, 0.5 + k * 0.09, 1.05 + k * 0.09));
        if (gp <= 0) continue;
        const y = Y(v) + 0.5;
        ctx.fillStyle = v === 0 ? INK : GRID;
        ctx.fillRect(L, Math.round(y) - (v === 0 ? 0.5 : 0), (R - L + 24) * gp, v === 0 ? 1.4 : 1);
        if (v) { ctx.globalAlpha = seg(gp, 0.3, 1); ctx.fillStyle = MUTED; ctx.fillText(v === 400 ? '$400bn' : String(v), L, y - 6); ctx.globalAlpha = 1; }
      }
      // x ticks
      ctx.textAlign = 'center';
      for (let yr = 2014; yr <= 2026; yr += 1) {
        const a = seg(t, 0.75 + (yr - 2014) * 0.035, 1.05 + (yr - 2014) * 0.035); if (a <= 0) continue;
        ctx.globalAlpha = a;
        const x = Math.round(X(yr)) + 0.5;
        ctx.fillStyle = INK; ctx.fillRect(x - 0.5, B, 1, yr % 2 === 0 ? 6 : 3);
        if (yr % 2 === 0) { ctx.fillStyle = MUTED; ctx.fillText(String(yr), x, B + 24); }
        ctx.globalAlpha = 1;
      }

      // ---- grey context lines with direct labels ----
      const pts = SERIES.map((s, i) => {
        const q = quarterly(s.v, 100 + i, s.hi ? 0.18 : 0.12);
        return q.map((v, k) => [X(2014 + k / 4), Y(v)]);
      });
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      SERIES.forEach((s, i) => {
        if (s.hi) return;
        const p = pts[i];
        const gp = H.ease.inOut(seg(t, 1.0 + i * 0.1, 1.9 + i * 0.1)); if (gp <= 0) return;
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, L + (R - L) * gp + 2, H_); ctx.clip();
        ctx.strokeStyle = GREY; ctx.lineWidth = 1.8;
        ctx.beginPath(); p.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
        ctx.restore();
      });
      // label positions (nudged to avoid collisions)
      const labY = { 'Cloud infrastructure': 0, 'Cybersecurity': 0, 'Robotics': 0, 'AR/VR headsets': 0 };
      const ends = SERIES.map((s, i) => ({ s, y: pts[i][pts[i].length - 1][1] })).filter((e) => !e.s.hi).sort((a, b) => a.y - b.y);
      for (let k = 1; k < ends.length; k++) if (ends[k].y - ends[k - 1].y < 17) ends[k].y = ends[k - 1].y + 17;
      ctx.textAlign = 'left'; ctx.font = '400 13px "Inter"';
      ends.forEach((e) => {
        const last = pts[SERIES.indexOf(e.s)].slice(-1)[0];
        ctx.globalAlpha = seg(t, 2.0, 2.4);
        ctx.fillStyle = '#857D75'; ctx.fillText(e.s.name, R + 10, e.y + 4.5);
        if (Math.abs(e.y - last[1]) > 2) { ctx.strokeStyle = 'rgba(133,125,117,0.6)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(R + 2, last[1]); ctx.lineTo(R + 8, e.y); ctx.stroke(); }
        ctx.globalAlpha = 1;
      });

      // ---- highlight series: area wash + line, revealed by clip ----
      const hp = pts[0];
      const clipX = L + (R - L) * reveal;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, reveal > 0 ? clipX + 2 : 0, H_); ctx.clip();
      // area
      const g = ctx.createLinearGradient(0, T, 0, B);
      g.addColorStop(0, 'rgba(153,15,61,0.20)'); g.addColorStop(1, 'rgba(153,15,61,0.04)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(hp[0][0], B);
      hp.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(hp[hp.length - 1][0], B); ctx.closePath(); ctx.fill();
      // solid actuals, dashed forecast
      const split = hp.findIndex(([x]) => x >= fx0 - 0.1);
      ctx.strokeStyle = HI; ctx.lineWidth = 3.4;
      ctx.beginPath(); for (let k = 0; k <= split; k++) (k ? ctx.lineTo(...hp[k]) : ctx.moveTo(...hp[k])); ctx.stroke();
      ctx.setLineDash([5, 5]); ctx.lineWidth = 3;
      ctx.beginPath(); for (let k = split; k < hp.length; k++) (k > split ? ctx.lineTo(...hp[k]) : ctx.moveTo(...hp[k])); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // drawing head: a small dot riding the tip of the line while it draws
      if (reveal > 0 && reveal < 1) {
        let k = hp.findIndex(([x]) => x >= clipX); if (k < 1) k = 1;
        const [ax, ay] = hp[k - 1], [bx, by] = hp[k], f = H.clamp((clipX - ax) / (bx - ax || 1));
        ctx.fillStyle = HI; ctx.beginPath(); ctx.arc(ax + (bx - ax) * f, ay + (by - ay) * f, 4.2, 0, 7); ctx.fill();
      }
      // end marker + direct label
      const endP = hp[hp.length - 1];
      const pop = seg(t, 3.95, 4.3);
      if (pop > 0) {
        // live pulse on the latest value during the hold
        for (let k = 0; k < 2; k++) {
          const ph = ((t - 4.3) / 1.4 + k * 0.5) % 1;
          if (t > 4.3) { ctx.strokeStyle = H.rgba(HI, 0.35 * (1 - ph)); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(endP[0], endP[1], 6 + ph * 16, 0, 7); ctx.stroke(); }
        }
        const sc = H.ease.back(pop);
        ctx.fillStyle = BG; ctx.beginPath(); ctx.arc(endP[0], endP[1], 6.5 * sc, 0, 7); ctx.fill();
        ctx.strokeStyle = HI; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(endP[0], endP[1], Math.max(0.1, 5 * sc), 0, 7); ctx.stroke();
        ctx.textAlign = 'left'; ctx.globalAlpha = seg(t, 4.05, 4.45);
        ctx.font = '800 13px "Inter"'; ctx.fillStyle = HI;
        ctx.fillText('Artificial', R + 14, endP[1] - 3);
        ctx.fillText('intelligence', R + 14, endP[1] + 13);
        ctx.font = '400 13px "Inter"'; ctx.fillText('$405bn', R + 14, endP[1] + 30);
        ctx.globalAlpha = 1;
      }

      // ---- annotations: written on by hand once the line has passed ----
      const ann = (x) => H.clamp((clipX - x) / 110);
      ctx.font = '700 22px "Caveat"'; ctx.textAlign = 'left';
      // 1: chatbot moment
      let a = ann(X(2023.4));
      ctx.fillStyle = INK;
      writeOn(ctx, 'Chatbots go mainstream —', X(2018.75), Y(330), a * 3.2);
      writeOn(ctx, 'spending doubles in 18 months', X(2018.75), Y(330) + 22, a * 3.2 - 1.1);
      leader(ctx, X(2021.55), Y(330) + 34, X(2022.9), Y(292), X(2023.55) - 9, Y(222) - 4, 11, INK, seg(a, 0.68, 1));
      // 2: pandemic dip
      const dx = X(2020), dy = Y(58);
      a = ann(dx + 30);
      ctx.fillStyle = MUTED;
      writeOn(ctx, 'A brief pandemic', X(2016.9), Y(178), a * 3);
      writeOn(ctx, 'pause', X(2016.9), Y(178) + 21, a * 3 - 1);
      leader(ctx, X(2017.6), Y(178) + 30, X(2019.2), Y(118), dx - 3, dy - 11, 23, MUTED, seg(a, 0.66, 1));
      // 3: overtakes cloud
      const cxp = X(2022.95), cyp = Y(170);
      a = ann(cxp + 20);
      if (a > 0) {
        ctx.strokeStyle = MUTED; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cxp, cyp, 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * seg(a, 0, 0.35)); ctx.stroke();
      }
      ctx.fillStyle = MUTED;
      writeOn(ctx, 'AI passes cloud', X(2023.55), Y(118), (a - 0.55) * 2.6);
      leader(ctx, X(2023.5), Y(124), X(2023.05), Y(128), cxp + 3, cyp + 12, 31, MUTED, seg(a, 0.3, 0.6));

      // ---- footer: source line in small caps ----
      const fp = seg(t, 4.2, 4.7);
      ctx.fillStyle = 'rgba(51,48,46,0.35)'; ctx.fillRect(L, 648, 1116 * H.ease.out(fp), 1);
      ctx.globalAlpha = fp;
      smallCaps(ctx, 'Source: Illustrative estimates compiled for this graphic', L, 672, 12, MUTED, 1.1);
      smallCaps(ctx, 'Graphic by the Data Desk', L + 1116, 672, 12, MUTED, 1.1, 'right');
      ctx.globalAlpha = 1;
      ctx.restore();

      // paper tooth (quietly alive)
      H.grain(ctx, W, H_, 0.025, 5 + Math.floor(t * 12));
    },
    // Sound: a quiet newsroom reading an online graphic. Scrolls are mouse-wheel notches (one per 120 px of the
    // eased scroll) over a soft page glide, Caveat notes and leaders are a felt pen of matching length, numerals
    // advance with small type clicks, the 97% gets the one big hit. Times mirror explainer() below.
    explainerSound(k) {
      const D = 15;
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.6;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // felt pen note: nib touch + stroke for the write-on span
      const pen = (a, b, g = 1, p = 0, minor = true) => {
        k.noise(a, { dur: 0.018, filter: 'bandpass', f: 1600, q: 1.3, gain: 0.12 * g, a: 0.001, pan: p, minor });
        k.play('stroke', a, { material: 'pen', dur: b - a, gain: 1.5 * g, pan: p, minor });
      };
      // a small type click for counter digits (dry, mid-low, never a chirp)
      const type = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.016, filter: 'bandpass', f: 2300, q: 1.6, gain: 0.2 * g, a: 0.001, pan: p }); k.tone(t, { f: 240, dur: 0.03, gain: 0.05 * g, pan: p }); });
      // scroll: wheel notches following the eased scroll + a smooth low page glide
      const scroll = (t0, t1, dist) => {
        k.noise(t0, { dur: t1 - t0 + 0.1, color: 'pink', filter: 'bandpass', f: [[0, 260], [(t1 - t0) * 0.5, 520], [t1 - t0 + 0.1, 240]], q: 0.7, gain: 0.09, a: (t1 - t0) * 0.45 });
        for (let s = 120; s <= dist; s += 120) {
          const tn = when(t0, t1, H.ease.inOut, s / dist);
          k.withMinor(() => { k.noise(tn, { dur: 0.012, filter: 'bandpass', f: 1900, q: 2, gain: 0.22, a: 0.001, pan: 0.35 }); k.tone(tn, { f: 330, dur: 0.025, gain: 0.05, pan: 0.35 }); });
        }
      };
      // counter ticks: one per 1/24 of the eased progress, never closer than 1/12 s (slows as it settles)
      const counter = (t0, t1, ease, steps, p, f0) => {
        let last = -1, lastT = -1;
        for (let t = t0; t <= t1 + 1e-6; t += 1 / 120) {
          const v = Math.floor(ease(seg(t, t0, t1)) * steps);
          if (v !== last && t - lastT >= 1 / 12) { type(t, 0.8 + 0.3 * (v / steps), p); last = v; lastT = t; }
        }
      };

      k.bed('room', 0, D, { gain: 0.35 });

      // ---- panel 0: the rule draws, the headline sets
      k.noise(0.0, { dur: 0.5, filter: 'bandpass', f: [[0, 500], [0.5, 900]], q: 0.8, gain: 0.06, a: 0.1, pan: -0.1, minor: true }); // rule runs across
      k.play('tock', 0.42, { f: 300, gain: 0.45 }); // headline settles into place
      k.play('tock', 0.95, { f: 380, gain: 0.22, minor: true }); // dek + byline
      scroll(1.5, 2.4, 720);
      k.play('click', 2.0, { f: 900, gain: 0.8, minor: true }); // sticky header docks

      // ---- panel 1: the data
      k.play('tock', 3.15, { f: 340, gain: 0.3, pan: pan(1000), minor: true }); // the model box fades in
      pen(3.0, 3.25, 1, pan(140)); // "cat"
      pen(3.3, 3.7, 0.8, pan(200)); // cat leader
      pen(3.4, 3.6, 0.9, pan(380)); // "dog"
      pen(3.6, 4.0, 0.9, pan(600)); // dog leader + the flow leader into the model
      counter(2.6, 5.3, H.ease.inOut, 24, pan(930));
      k.play('tock', 5.3, { f: 260, gain: 0.6, pan: pan(930) }); // 1,000,000 sets
      scroll(5.9, 6.6, 720);
      k.play('click', 6.2, { f: 900, gain: 0.7, pan: 0.6, minor: true }); // header tab: The loop

      // ---- panel 2: guess, check, adjust
      k.play('tock', 6.82, { f: 320, gain: 0.3, pan: pan(170), minor: true }); // a new photo
      pen(6.9, 7.3, 0.8, pan(300)); // photo -> model
      pen(7.2, 7.5, 0.8, pan(800)); // model -> output
      pen(7.4, 7.71, 1.1, pan(950)); // "dog?"
      // the wrong guess: claret X in two quick slashes + a muted descending pair
      pen(7.68, 7.77, 2.0, pan(1110), false); // the X appears in one quick double slash
      k.tone(7.68, { f: 'D4', type: 'triangle', dur: 0.24, gain: 0.2, hold: 0.08, filter: 'lowpass', f2: 1200, pan: pan(1100) });
      k.tone(7.86, { f: 'A3', type: 'triangle', dur: 0.4, gain: 0.2, hold: 0.12, filter: 'lowpass', f2: 900, pan: pan(1100) });
      pen(7.78, 8.1, 1.1, pan(960)); // emphasis ring (drawing since 7.7)
      k.play('click', 8.08, { f: 900, gain: 0.7, pan: -0.5, minor: true }); // step: Check
      k.play('tock', 8.15, { f: 240, gain: 0.55, pan: pan(970) }); // "Answer: cat" tag sets
      pen(8.3, 9.1, 0.55, pan(800)); // error line dashes back
      pen(8.5, 9.0, 0.7, pan(900)); // "error flows back"
      k.noise(9.1, { dur: 0.03, filter: 'bandpass', f: 1300, q: 1.2, gain: 0.18, a: 0.001, pan: pan(570), minor: true }); // arrowhead dot
      k.play('click', 8.9, { f: 900, gain: 0.7, pan: -0.3, minor: true }); // step: Adjust
      for (let i = 1; i <= 6; i++) k.play('tock', when(8.9, 9.6, H.ease.inOut, i / 6), { f: 520 + i * 25, gain: 0.42, pan: pan(570), minor: true }); // weights turn
      pen(8.95, 9.4, 0.5, pan(600)); // "weights adjust"
      pen(9.7, 10.01, 1.1, pan(950)); // "cat"
      pen(10.0, 10.12, 1.3, pan(1050), false); // green tick
      k.play('success', 10.0, { f: 'G5', gain: 0.45, pan: pan(1000) }); // the correction
      pen(10.0, 10.4, 0.6, pan(950)); // "...and round it goes again"
      scroll(10.5, 11.2, 720);
      k.play('click', 10.85, { f: 900, gain: 0.7, pan: 0.6, minor: true }); // header tab: Practice

      // ---- panel 3: practice
      pen(11.2, 12.8, 0.45, pan(450)); // the accuracy line draws
      pen(11.3, 11.8, 0.6, pan(200)); // "starts at 61%"
      pen(11.6, 11.9, 0.5, pan(110)); // its leader
      counter(11.2, 12.8, H.ease.inOut, 36, pan(1060));
      k.play('impact', 12.8, { gain: 0.8, pan: pan(1060) }); // 97% lands: the big hit
      k.play('ding', 12.82, { f: 'C5', gain: 0.5, pan: pan(1060) });
      pen(12.8, 13.3, 1.3, pan(1060), false); // the ring around 97%
      // takeaway sets (ease.out: mostly there by ~13.45), then resolves
      k.noise(13.2, { dur: 0.3, filter: 'bandpass', f: [[0, 400], [0.3, 800]], q: 0.8, gain: 0.07, a: 0.08, pan: -0.6, minor: true }); // claret rule
      k.play('tock', 13.3, { f: 280, gain: 0.5 });
      ['F4', 'C5', 'A5'].forEach((f, i) => k.play('ding', 13.45 + i * 0.08, { f, gain: 0.4 - i * 0.07, pan: (i - 1) * 0.25 }));
    },
    explainerDuration: 15,
    explainerNote: 'Told as a scrolling newspaper story: the page scrolls panel to panel under a sticky serif header, hand-drawn Caveat arrows and rings carry the cause and emphasis, a waffle chart and set numerals count the data, and the accuracy line draws itself like the still.',
    explainer(ctx, W, H_, t) {
      const S = (a, b) => seg(t, a, b);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H_);
      // ---- scroll position (the transition: the page scrolls like an online graphic) ----
      const KEYS = [[0, 0], [1.5, 0], [2.4, 720], [5.9, 720], [6.6, 1440], [10.5, 1440], [11.2, 2160], [15, 2160]];
      let sy = 2160;
      for (let i = 0; i < KEYS.length - 1; i++) if (t >= KEYS[i][0] && t <= KEYS[i + 1][0]) { sy = H.lerp(KEYS[i][1], KEYS[i + 1][1], H.ease.inOut((t - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0]))); break; }
      const L = 70;
      ctx.save(); ctx.translate(0, -sy);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      const head = (n, title, T0) => {
        // each panel opens with the hero's masthead rule: 3px ink with a claret tab
        ctx.fillStyle = INK; ctx.fillRect(L, T0 + 78, 1140, 3); ctx.fillStyle = HI; ctx.fillRect(L, T0 + 78, 46, 7);
        smallCaps(ctx, n, L, T0 + 112, 22, HI, 2); ctx.fillStyle = INK; ctx.font = '700 46px "Libre Baskerville"'; ctx.fillText(title, L, T0 + 166); };

      // ===== panel 0: the hook =====
      {
        const a = H.ease.out(S(0, 0.6));
        ctx.fillStyle = INK; ctx.fillRect(L, 210, 1140 * H.ease.out(S(0, 0.5)), 4);
        ctx.fillStyle = HI; ctx.fillRect(L, 210, 60, 9);
        ctx.globalAlpha = a; smallCaps(ctx, 'Artificial Intelligence', L, 270, 24, HI, 2);
        ctx.fillStyle = INK; ctx.font = '700 92px "Libre Baskerville"'; ctx.fillText('How does AI learn?', L, 390 + (1 - a) * 14);
        ctx.globalAlpha = H.ease.out(S(0.4, 1.0));
        ctx.fillStyle = MUTED; ctx.font = '400 30px "Libre Baskerville"'; ctx.fillText('A visual guide to how machines get better by guessing', L, 452);
        smallCaps(ctx, 'By the Data Desk', L, 512, 20, MUTED, 1.4);
        ctx.globalAlpha = 1;
      }

      // ===== panel 1: the data (top at 720) =====
      {
        const T0 = 720;
        head('1. The data', 'It starts with labelled examples', T0);
        // waffle: each square = 5,000 examples; claret = cat, grey = dog
        const cols = 20, rows = 10, sq = 25, gp = 4, wx = L, wy = T0 + 260;
        const filled = Math.floor(cols * rows * H.ease.inOut(S(2.6, 5.3)));
        const wr = H.rng(31);
        let catCell = null, dogCell = null;
        for (let i = 0; i < cols * rows; i++) {
          const c = i % cols, r = Math.floor(i / cols), isCat = wr.chance(0.52);
          const x = wx + c * (sq + gp), y = wy + r * (sq + gp);
          if (i === 24) catCell = [x + sq / 2, y + sq / 2]; if (i === 47) dogCell = [x + sq / 2, y + sq / 2];
          ctx.fillStyle = i < filled ? (isCat ? H.rgba(HI, 0.85) : '#B9AFA5') : 'rgba(51,48,46,0.06)';
          ctx.fillRect(x, y, sq, sq);
        }
        // direct labels with hand-drawn leaders landing on a cat square and a dog square
        ctx.font = '700 36px "Caveat"';
        const la = S(3.0, 3.5);
        if (la > 0 && catCell) {
          catIcon(ctx, wx + 22, wy - 36, 1.15 * H.ease.back(la), HI);
          ctx.fillStyle = HI; writeOn(ctx, 'cat', wx + 50, wy - 26, la * 2);
          leader(ctx, wx + 104, wy - 32, wx + 150, wy - 30, catCell[0] + 2, catCell[1] - 9, 3, HI, S(3.3, 3.7), 2);
          dogIcon(ctx, wx + 270, wy - 36, 1.15 * H.ease.back(S(3.4, 3.8)), MUTED);
          ctx.fillStyle = MUTED; writeOn(ctx, 'dog', wx + 300, wy - 26, S(3.4, 3.8) * 2);
          leader(ctx, wx + 312, wy - 12, wx + 260, wy + 10, dogCell[0] + 5, dogCell[1] - 8, 5, MUTED, S(3.6, 4.0), 2);
        }
        // the counter: hero numeral in set type
        const n = Math.round(1e6 * H.ease.inOut(S(2.6, 5.3)));
        const nx = 800;
        ctx.fillStyle = INK; ctx.font = '700 84px "Libre Baskerville"'; ctx.fillText(n.toLocaleString('en-US'), nx - 20, T0 + 300);
        ctx.font = '400 26px "Inter"'; ctx.fillStyle = MUTED; ctx.fillText('labelled examples', nx - 16, T0 + 340);
        ctx.font = '400 28px "Inter"'; ctx.fillText('each square = 5,000', wx, wy + rows * (sq + gp) + 34);
        // the model box and the flow of examples into it
        const mx = 800, my = T0 + 400, mw = 400, mh = 220;
        const ma = S(3.0, 3.5);
        ctx.globalAlpha = ma;
        ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(mx, my, mw, mh);
        smallCaps(ctx, 'The model', mx + 14, my + 38, 26, INK, 1.6);
        miniNet(ctx, mx + 70, my + 52, 260, 156, [0.1, -0.2, 0.15, 0.05, -0.1, 0.2, 0.1, -0.05, 0.12, 0.1, -0.15, 0.08, 0.2, -0.1, 0.05, 0.1, 0.07, -0.12, 0.1, 0.02], false, 10);
        ctx.globalAlpha = 1;
        const p0 = [wx + cols * (sq + gp) + 10, wy + 210], p1 = [mx - 8, my + mh / 2], pc = [(p0[0] + p1[0]) / 2, wy + 330];
        leader(ctx, p0[0], p0[1], pc[0], pc[1], p1[0], p1[1], 7, INK, S(3.4, 4.0), 2);
        const fl = S(4.0, 6.2);
        if (fl > 0 && fl < 1) for (let k = 0; k < 6; k++) {
          const u = ((t * 0.9 + k / 6) % 1);
          const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
          const x = a * p0[0] + b * pc[0] + c * p1[0], y = a * p0[1] + b * pc[1] + c * p1[1];
          ctx.fillStyle = k % 2 ? H.rgba(HI, 0.85) : '#B9AFA5'; ctx.fillRect(x - 8, y - 8, 16, 16);
        }
      }

      // ===== panel 2: guess, check, adjust (top at 1440) =====
      {
        const T0 = 1440;
        head('2. Guess, check, adjust', 'It learns from its mistakes', T0);
        // step strip
        const steps = ['Guess', 'Check', 'Adjust'];
        const active = t < 8.1 ? 0 : t < 8.9 ? 1 : t < 9.6 ? 2 : 0;
        let sx = L;
        steps.forEach((st, i) => {
          const on = t > 6.8 && i === active;
          ctx.font = '700 34px "Libre Baskerville"'; ctx.fillStyle = on ? HI : 'rgba(51,48,46,0.35)';
          ctx.fillText(st, sx, T0 + 232); const w = ctx.measureText(st).width;
          if (on) ctx.fillRect(sx, T0 + 244, w, 3.5);
          sx += w + 22;
          if (i < 2) { ctx.fillStyle = 'rgba(51,48,46,0.45)'; ctx.fillText('→', sx, T0 + 232); sx += 58; }
        });
        // new photo card
        const ca = H.ease.out(S(6.7, 7.1));
        const cx = L, cy = T0 + 330;
        ctx.globalAlpha = ca;
        ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(cx, cy, 210, 210);
        catIcon(ctx, cx + 105, cy + 112, 3.8, INK);
        ctx.font = '400 24px "Inter"'; ctx.fillStyle = MUTED; ctx.fillText('A new photo', cx, cy + 244);
        ctx.globalAlpha = 1;
        // model
        const mx = 380, my = T0 + 320, mw = 380, mh = 240;
        const adj = H.ease.inOut(S(8.9, 9.6));
        const w0 = [0.1, -0.2, 0.15, 0.05, -0.1, 0.2, 0.1, -0.05, 0.12, 0.1, -0.15, 0.08, 0.2, -0.1, 0.05, 0.1, 0.07, -0.12, 0.1, 0.02];
        const w1 = [0.5, -0.1, 0.05, 0.6, -0.4, 0.1, 0.45, -0.3, 0.05, 0.7, -0.05, 0.3, 0.1, -0.5, 0.6, 0.05, 0.55, -0.1, 0.65, 0.1];
        const ww = w0.map((v, i) => H.lerp(v, w1[i], adj));
        ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(mx, my, mw, mh);
        smallCaps(ctx, 'The model', mx + 14, my + 38, 26, INK, 1.6);
        miniNet(ctx, mx + 60, my + 54, 260, 170, ww, t > 8.9 && t < 9.7, 10);
        leader(ctx, cx + 222, cy + 105, (cx + 222 + mx) / 2, cy + 80, mx - 8, my + mh / 2, 12, INK, S(6.9, 7.3), 2);
        // output
        const ox = 850, oy = T0 + 450;
        leader(ctx, mx + mw + 8, my + mh / 2, ox - 40, oy - 40, ox - 12, oy - 14, 14, INK, S(7.2, 7.5), 2);
        ctx.font = '700 70px "Caveat"';
        const g1 = S(7.4, 7.8) * (1 - S(9.5, 9.7));
        if (g1 > 0) {
          ctx.fillStyle = INK; writeOn(ctx, '“dog?”', ox, oy, g1 * 1.3);
          if (g1 > 0.7) { ctx.strokeStyle = HI; ctx.lineWidth = 5; ctx.lineCap = 'round'; const x = ox + 196, y = oy - 46; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 34, y + 34); ctx.moveTo(x + 34, y); ctx.lineTo(x, y + 34); ctx.stroke(); }
          handRing(ctx, ox + 112, oy - 22, 150, 56, S(7.7, 8.1), 21, HI, 3);
        }
        // check: the truth tag + the error signal flowing back
        const ck = S(8.1, 8.4) * (1 - S(9.5, 9.7));
        if (ck > 0) {
          ctx.globalAlpha = ck;
          ctx.fillStyle = HI; ctx.fillRect(ox, oy + 50, 230, 50);
          ctx.fillStyle = BG; ctx.font = '600 28px "Inter"'; ctx.fillText('Answer: cat', ox + 18, oy + 85);
          ctx.globalAlpha = 1;
          const ep = S(8.3, 9.1);
          if (ep > 0) {
            ctx.save(); ctx.strokeStyle = HI; ctx.lineWidth = 3.4; ctx.setLineDash([10, 8]); ctx.lineDashOffset = t * 50;
            ctx.beginPath();
            const n = Math.floor(40 * ep);
            for (let k = 0; k <= n; k++) { const u = k / 40, x = H.lerp(ox + 110, mx + mw / 2, u), y = H.lerp(oy - 80, my - 14, u) - Math.sin(u * Math.PI) * 50; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
            ctx.stroke(); ctx.restore();
            if (ep >= 1) { const ex = mx + mw / 2, ey = my - 14; ctx.fillStyle = HI; ctx.beginPath(); ctx.moveTo(ex, ey + 10); ctx.lineTo(ex - 9, ey - 6); ctx.lineTo(ex + 9, ey - 8); ctx.closePath(); ctx.fill(); }
            ctx.font = '700 38px "Caveat"'; ctx.fillStyle = HI; writeOn(ctx, 'error flows back', ox - 10, my - 26, S(8.5, 9.0));
          }
        }
        if (t > 8.9 && t < 9.9) { ctx.font = '700 38px "Caveat"'; ctx.fillStyle = HI; writeOn(ctx, 'weights adjust', mx + 90, my + mh + 50, S(8.95, 9.4)); }
        const g2 = S(9.7, 10.1);
        if (g2 > 0) {
          ctx.font = '700 70px "Caveat"'; ctx.fillStyle = INK; writeOn(ctx, '“cat”', ox, oy, g2 * 1.3);
          if (g2 > 0.75) { ctx.strokeStyle = '#2E7D4F'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const x = ox + 168, y = oy - 30; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 12, y + 15); ctx.lineTo(x + 40, y - 22); ctx.stroke(); }
          ctx.font = '700 36px "Caveat"'; ctx.fillStyle = MUTED; writeOn(ctx, '…and round it goes again', ox - 10, oy + 80, S(10.0, 10.4));
        }
      }

      // ===== panel 3: progress + takeaway (top at 2160) =====
      {
        const T0 = 2160;
        head('3. Practice', 'Millions of loops later, it rarely misses', T0);
        const cl = L, cr = 880, ct = T0 + 230, cb = T0 + 560;
        const Y = (v) => cb - (v - 50) / 50 * (cb - ct), X = (u) => cl + u * (cr - cl);
        ctx.font = '400 27px "Inter"';
        for (let v = 50; v <= 100; v += 10) {
          ctx.fillStyle = v === 50 ? INK : GRID; ctx.fillRect(cl, Math.round(Y(v)), cr - cl + 20, v === 50 ? 1.6 : 1);
          if (v === 100) { ctx.fillStyle = MUTED; ctx.fillText('100% accuracy', cl, Y(v) - 9); }
          // numeric ticks hang in the left margin, centred on their gridline, so the curve start never runs through "60"
          else if (v > 50) { ctx.fillStyle = MUTED; ctx.textAlign = 'right'; ctx.fillText(String(v), cl - 9, Y(v) + 9); ctx.textAlign = 'left'; }
        }
        ctx.fillStyle = MUTED; ctx.textAlign = 'right'; ctx.font = '400 28px "Inter"'; ctx.fillText('Training rounds →', cr + 20, cb + 36); ctx.textAlign = 'left';
        const acc = (u) => 61 + 36 * (1 - Math.exp(-u * 4.2)) / (1 - Math.exp(-4.2)) + Math.sin(u * 40) * 1.2 * (1 - u);
        const rp = H.ease.inOut(S(11.2, 12.8));
        const g = ctx.createLinearGradient(0, ct, 0, cb); g.addColorStop(0, 'rgba(153,15,61,0.18)'); g.addColorStop(1, 'rgba(153,15,61,0.03)');
        const N = 120, n = Math.floor(N * rp);
        if (n > 1) {
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(X(0), cb);
          for (let k = 0; k <= n; k++) ctx.lineTo(X(k / N), Y(acc(k / N))); ctx.lineTo(X(n / N), cb); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = HI; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.beginPath();
          for (let k = 0; k <= n; k++) (k ? ctx.lineTo(X(k / N), Y(acc(k / N))) : ctx.moveTo(X(0), Y(acc(0)))); ctx.stroke();
          const hx = X(n / N), hy = Y(acc(n / N));
          ctx.fillStyle = HI; ctx.beginPath(); ctx.arc(hx, hy, 7, 0, 7); ctx.fill();
        }
        ctx.font = '700 36px "Caveat"'; ctx.fillStyle = MUTED;
        writeOn(ctx, 'starts at 61%', X(0.06), Y(53.5), S(11.3, 11.8));
        leader(ctx, X(0.055), Y(56.2), X(0.02), Y(57.2), X(0.009), Y(60.4), 41, MUTED, S(11.6, 11.9), 2);
        // hero numeral at right + emphasis ring
        const big = rp >= 1 ? 97 : Math.round(61 + 36 * rp);
        ctx.globalAlpha = S(11.2, 11.5);
        ctx.fillStyle = HI; ctx.font = '700 128px "Libre Baskerville"'; ctx.fillText(big + '%', 920, T0 + 400);
        ctx.font = '400 28px "Inter"'; ctx.fillStyle = MUTED; ctx.fillText('accuracy', 928, T0 + 462);
        ctx.globalAlpha = 1;
        handRing(ctx, 1062, T0 + 354, 158, 68, S(12.8, 13.3), 77, HI, 3.4);
        // takeaway
        const tk = H.ease.out(S(13.2, 13.8));
        ctx.globalAlpha = tk;
        ctx.fillStyle = HI; ctx.fillRect(L, T0 + 610, 80 * tk, 5);
        ctx.fillStyle = INK; ctx.font = '700 50px "Libre Baskerville"'; ctx.fillText('More examples → better guesses', L, T0 + 676 + (1 - tk) * 8);
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      // ---- sticky header (docks as the headline scrolls away) ----
      const hd = S(1.7, 2.2);
      if (hd > 0) {
        ctx.save();
        // the header's paper backing turns opaque faster than its type fades in, so the scrolling byline never shows through the title
        ctx.globalAlpha = Math.min(1, hd * 2.5); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, 66);
        ctx.globalAlpha = hd;
        ctx.fillStyle = 'rgba(51,48,46,0.35)'; ctx.fillRect(0, 66, W, 1);
        ctx.fillStyle = INK; ctx.font = '700 28px "Libre Baskerville"'; ctx.textAlign = 'left'; ctx.fillText('How does AI learn?', L, 44);
        const secs = ['Data', 'The loop', 'Practice'];
        const cur = t < 6.2 ? 0 : t < 10.85 ? 1 : 2;
        let x = 1210;
        ctx.font = '600 22px "Inter"';
        for (let i = secs.length - 1; i >= 0; i--) {
          const w = ctx.measureText(secs[i]).width; x -= w;
          ctx.fillStyle = i === cur ? HI : 'rgba(51,48,46,0.42)'; ctx.fillText(secs[i], x, 42);
          if (i === cur) ctx.fillRect(x, 50, w, 3);
          x -= 30;
        }
        ctx.restore();
        // printed-graphic footer: small-caps source line pinned bottom right, as in the still
        ctx.save(); ctx.globalAlpha = hd;
        ctx.font = '600 19px "Inter"';
        smallCaps(ctx, 'Source: Illustrative', 1210, 704, 19, MUTED, 1.4, 'right');
        ctx.restore();
      }
      H.grain(ctx, W, H_, 0.025, 5 + Math.floor(t * 12));
    },
  });
}
```
