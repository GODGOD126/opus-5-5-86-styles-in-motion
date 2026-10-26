I want an animated explainer made in the "Wood Type Letterpress" visual style (Print). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Abril Fatface, Anton, Bebas Neue, Rubik Mono One
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Anton&family=Bebas+Neue&family=Rubik+Mono+One&display=block">
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
Name: Wood Type Letterpress
Family: Print
Look: A two-ink wood-type broadside on cream stock: mixed display faces set block by block, each letter inked a little differently, wood grain and worn edges in the solids, ink squeezed to the rims and the whole forme bitten into the paper.
Motion: The forme is proofed block by block — rules first, then each wood letter lands with a heavy kiss of the platen, red and black alternating down the sheet — and the gears keep turning as the impression deepens.
How it explains: Every beat is a new proof: the finished sheet is lifted off the press and a fresh one is laid down, then wood type, stock cuts of a cat and a dog, and arrows set from short rule pieces lock up block by block with a kiss of the platen; counters are re-set and re-stamped six times a second, and the wrong guess gets a red rubber-stamp WRONG.

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

REFERENCE STYLE SOURCE (styles/letterpress.js; W/H_ are always 1280x720)
```js
{
  // ---------- Wood-type letterpress broadside: 2 inks, per-block wear, wood grain, deboss ----------
  const PAPER = [238, 226, 198];
  const INKS = { black: [30, 27, 26], red: [206, 58, 36] };

  // cream rag stock: cloudy formation, irregular (patchy) fibre streaks and fine tooth, slight warm/cool drift
  const paperBase = (px, W, H_) => {
    const nz = H.makeNoise(17), img = px.createImageData(W, H_), d = img.data;
    // low-frequency fields on a 4px grid (bilinear), fine streak + tooth per pixel
    const GS = 4, gw = Math.ceil(W / GS) + 2, gh = Math.ceil(H_ / GS) + 2, G = new Float32Array(gw * gh * 3);
    for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) { const x = gx * GS, y = gy * GS, j = (gy * gw + gx) * 3; G[j] = nz.fbm2(x * 0.006, y * 0.006, 4); G[j + 1] = nz.fbm2(x * 0.035, y * 0.028, 2); G[j + 2] = 0.5 + 0.5 * nz.n2(x * 0.01 + 40, y * 0.01); }
    for (let y = 0; y < H_; y++) {
      const gy = (y / GS) | 0, fy = (y % GS) / GS;
      for (let x = 0; x < W; x++) {
        const gx = (x / GS) | 0, fx = (x % GS) / GS, j00 = (gy * gw + gx) * 3, j01 = j00 + 3, j10 = j00 + gw * 3, j11 = j10 + 3;
        const bl = (c) => (G[j00 + c] * (1 - fx) + G[j01 + c] * fx) * (1 - fy) + (G[j10 + c] * (1 - fx) + G[j11 + c] * fx) * fy;
        const cl = bl(0), md = bl(1), streak = nz.n2(x * 0.16, y * 0.035) * bl(2);
        let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
        const v = 1 + cl * 0.045 + md * 0.018 + streak * 0.022 + ((h >>> 0) / 4294967296 - 0.5) * 0.035, warm = cl * 6, i = (y * W + x) * 4;
        d[i] = PAPER[0] * v + warm; d[i + 1] = PAPER[1] * v + warm * 0.4; d[i + 2] = PAPER[2] * v - warm * 0.6; d[i + 3] = 255;
      }
    }
    px.putImageData(img, 0, 0);
  };
  let HP = null; // hero paper cache

  // each glyph/ornament is a separate "block": colour encodes (id, density, grain phase)
  let nextId = 1, CT = 0;
  // timing: a block is invisible (but still consumes its random draws) until pressed, then lands with a small 'kiss'
  const stamp = (x, t0) => { x.globalAlpha = CT >= t0 ? 1 : 0; return 1 + 0.14 * (1 - H.ease.out(H.clamp((CT - t0) / 0.1))); };
  const blockStyle = (r, dens, grain) => `rgb(${(nextId++ % 250) + 1},${Math.round(dens * 255)},${grain ? Math.round(r.range(30, 255)) : 0})`;

  const setType = (x, r, text, font, cx, baseline, targetW, capH, opt = {}) => {
    const sp = opt.spacing || 0, grain = opt.grain !== false;
    x.font = `${font.split('|')[0]} 200px ${font.split('|')[1]}`;
    const capM = x.measureText('H'), cap = capM.actualBoundingBoxAscent;
    const ws = [...text].map((ch) => x.measureText(ch).width);
    const total = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    const sx = targetW / total, sy = capH / cap;
    let acc = cx - targetW / 2;
    [...text].forEach((ch, i) => {
      const w = ws[i] * sx;
      if (ch !== ' ') {
        x.save();
        const k = stamp(x, (opt.t0 ?? 0) + i * (opt.dt ?? 0));
        x.translate(acc + w / 2, baseline + r.range(-1.6, 1.6) * (opt.jit ?? 1));
        x.rotate(r.range(-0.006, 0.006) * (opt.jit ?? 1)); x.translate(0, -capH / 2); x.scale(k, k); x.translate(0, capH / 2); x.scale(sx, sy);
        x.fillStyle = blockStyle(r, r.range(0.72, 1), grain);
        x.textAlign = 'center'; x.textBaseline = 'alphabetic';
        x.fillText(ch, 0, 0);
        x.restore();
      }
      x.globalAlpha = 1;
      acc += w + sp * sx;
    });
  };

  const rule = (x, r, x0, x1, y, h, t0 = 0) => { x.fillStyle = blockStyle(r, r.range(0.85, 1), false); stamp(x, t0); x.fillRect(x0, y, x1 - x0, h); x.globalAlpha = 1; };
  const diamond = (x, r, cx, cy, s0, t0 = 0) => { x.fillStyle = blockStyle(r, r.range(0.8, 1), false); const s = s0 * stamp(x, t0); x.beginPath(); x.moveTo(cx, cy - s); x.lineTo(cx + s * 0.7, cy); x.lineTo(cx, cy + s); x.lineTo(cx - s * 0.7, cy); x.closePath(); x.fill(); x.globalAlpha = 1; };
  const star = (x, r, cx, cy, s0, t0 = 0) => { x.fillStyle = blockStyle(r, r.range(0.8, 1), false); const s = s0 * stamp(x, t0); x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? s * 0.42 : s; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); x.globalAlpha = 1; };
  const gear = (x, r, cx, cy, R0, teeth, rot, t0 = 0) => {
    x.fillStyle = blockStyle(r, r.range(0.85, 1), true);
    const R = R0 * stamp(x, t0);
    x.beginPath();
    for (let i = 0; i < teeth * 4; i++) {
      const a = rot + (i / (teeth * 4)) * Math.PI * 2, q = i % 4, rr = q === 0 || q === 1 ? R : R * 0.8;
      x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    x.closePath();
    x.moveTo(cx + R * 0.32, cy); x.arc(cx, cy, R * 0.32, 0, Math.PI * 2, true);
    x.fill('evenodd');
    // spokes cut-outs
    x.save(); x.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 4; i++) { const a = rot + i * Math.PI / 2 + Math.PI / 4; x.beginPath(); x.arc(cx + Math.cos(a) * R * 0.52, cy + Math.sin(a) * R * 0.52, R * 0.13, 0, 7); x.fill(); }
    x.restore(); x.globalAlpha = 1;
  };

  // ================= EXPLAINER: five proofs pulled off the press, one per beat =================
  const XE2 = H.ease, xcl = H.clamp, xseg = (t, a, b) => xcl((t - a) / (b - a));
  const SHEETS = [0, 2.3, 5.95, 10.45, 12.85], SWAP = 0.6;
  let LPX = null;
  const lph = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  const fmtC = (n) => Math.round(n).toLocaleString('en-US');

  // a stock cut (engraved block) of a cat or dog: black silhouette with white cuts
  const stockCut = (x, r, kind, cx, cy, s, t0) => {
    x.fillStyle = blockStyle(r, r.range(0.85, 1), true); const k = stamp(x, t0);
    x.save(); x.translate(cx, cy); x.scale(s * k / 100, s * k / 100);
    x.beginPath(); x.roundRect(-50, -50, 100, 100, 6); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.lineWidth = 5; x.strokeRect(-43, -43, 86, 86);
    x.beginPath(); x.arc(0, 4, 28, 0, 7); x.fill();
    if (kind === 'cat') { x.beginPath(); x.moveTo(-26, -6); x.lineTo(-22, -38); x.lineTo(-4, -22); x.closePath(); x.moveTo(26, -6); x.lineTo(22, -38); x.lineTo(4, -22); x.closePath(); x.fill(); }
    if (kind === 'dog') { // a proper reversed cut: long lop ears hang outside the head, all cut from the block
      for (const sg of [-1, 1]) { x.save(); x.translate(sg * 29, 8); x.rotate(-sg * 0.22); x.beginPath(); x.ellipse(0, 0, 10, 24, 0, 0, 7); x.fill(); x.restore(); }
    }
    x.globalCompositeOperation = 'source-over';
    if (kind === 'dog') { // engraved lines left standing: ear seams, muzzle outline, mouth
      x.strokeStyle = x.fillStyle; x.lineCap = 'round'; x.lineWidth = 3.2;
      for (const sg of [-1, 1]) { const c0 = sg > 0 ? 0 : Math.PI; x.beginPath(); x.arc(0, 4, 28, c0 - 0.95, c0 + 0.95); x.stroke(); }
      x.lineWidth = 2.6; x.beginPath(); x.ellipse(0, 15, 12, 9, 0, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
      x.beginPath(); x.moveTo(0, 14); x.lineTo(0, 19); x.stroke();
    }
    x.beginPath(); x.arc(-10, 0, 4, 0, 7); x.arc(10, 0, 4, 0, 7); x.fill(); x.beginPath(); x.ellipse(0, kind === 'dog' ? 11 : 12, kind === 'dog' ? 6.5 : 5, kind === 'dog' ? 4.5 : 3.5, 0, 0, 7); x.fill();
    if (kind === 'cat') { x.lineWidth = 2.5; x.strokeStyle = x.fillStyle; x.beginPath(); for (const sg of [-1, 1]) { x.moveTo(sg * 8, 16); x.lineTo(sg * 26, 13); x.moveTo(sg * 8, 20); x.lineTo(sg * 25, 23); } x.stroke(); }
    x.restore(); x.globalAlpha = 1;
  };
  // an arrow assembled from short rule pieces locked up one after another (draws on)
  const dashArrow = (x, r, P, t0, dur, n = 12, w = 7) => {
    for (let i = 0; i < n; i++) {
      const s0 = i / n, s1 = (i + 0.62) / n, a = P(s0), b = P(s1);
      x.fillStyle = blockStyle(r, r.range(0.85, 1), false); stamp(x, t0 + dur * (i / n));
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      x.save(); x.translate(a[0], a[1]); x.rotate(ang); x.fillRect(0, -w / 2, len, w); x.restore();
    }
    const e = P(1), p = P(0.97), ang = Math.atan2(e[1] - p[1], e[0] - p[0]);
    x.fillStyle = blockStyle(r, 1, false); stamp(x, t0 + dur);
    x.save(); x.translate(e[0], e[1]); x.rotate(ang); x.beginPath(); x.moveTo(w * 2.4, 0); x.lineTo(-w * 1.6, -w * 2.2); x.lineTo(-w * 1.6, w * 2.2); x.closePath(); x.fill(); x.restore();
    x.globalAlpha = 1;
  };
  const qP = (x0, y0, cx, cy, x1, y1) => (s) => [(1 - s) * (1 - s) * x0 + 2 * (1 - s) * s * cx + s * s * x1, (1 - s) * (1 - s) * y0 + 2 * (1 - s) * s * cy + s * s * y1];
  const runningHead = (b, rd, r, T0) => {
    setType(rd, r, 'HOW DOES AI LEARN?', '400|"Rubik Mono One"', 640, 56, 520, 22, { spacing: 22, grain: false, jit: 0.3, t0: T0 + 0.05 });
    rule(b, r, 58, 1222, 22, 5, T0); rule(b, r, 58, 1222, 72, 2, T0 + 0.05);
  };

  // build the forme for sheet si at time t: black into b, red into rd
  const forme = (si, b, rd, t) => {
    const r = H.rng(500 + si * 37), rc = H.rng(900 + si);
    const T0 = SHEETS[si] + (si ? SWAP * 0.6 : 0.1);
    const stepT = (a, z) => Math.floor(xcl(t, a, z) * 6) / 6; // counters re-set and re-stamped 6x a second
    if (si === 0) {
      rule(b, r, 58, 1222, 40, 8, 0.1); rule(b, r, 58, 1222, 54, 2.5, 0.15);
      setType(b, r, 'HOW DOES', '400|"Anton"', 640, 300, 900, 190, { spacing: 10, t0: 0.25, dt: 0.09 });
      setType(rd, r, 'AI LEARN?', '400|"Abril Fatface"', 640, 520, 820, 150, { spacing: 6, t0: 1.05, dt: 0.07 });
      rule(b, r, 58, 1222, 650, 2.5, 1.7); rule(b, r, 58, 1222, 660, 8, 1.72);
    }
    if (si === 1) {
      runningHead(b, rd, r, T0);
      [['cat', 160, 230], ['dog', 330, 230], ['dog', 160, 440], ['cat', 330, 440]].forEach(([kind, cx, cy], i) => {
        stockCut(b, r, kind, cx, cy, 140, T0 + 0.35 + i * 0.32);
        setType(rd, r, kind.toUpperCase(), '400|"Bebas Neue"', cx, cy + 106, 70, 30, { grain: false, spacing: 8, t0: T0 + 0.5 + i * 0.32, jit: 0.3 });
      });
      dashArrow(b, r, qP(440, 335, 560, 300, 700, 335), T0 + 1.3, 0.55);
      // examples stepping along the arrow into the model, re-set on every move (stop-motion conveyor)
      if (t > T0 + 1.9 && t < 5.7) { const ph = Math.floor((t - T0 - 1.9) * 5); [0.2, 0.5, 0.8].forEach((u, j) => { const q = qP(440, 300, 560, 265, 700, 300)(u); const kind = (ph + j) % 3 === 1 ? 'dog' : 'cat'; stockCut(b, H.rng(ph * 7 + j), kind, q[0], q[1] - 20, 60 - j * 8, 0); }); }
      gear(b, r, 900, 320, 105, 12, 0.2 + t * 0.8, T0 + 1.0); gear(b, r, 1045, 215, 50, 9, -0.1 - t * 1.6, T0 + 1.1);
      setType(rd, r, 'THE MODEL', '400|"Rubik Mono One"', 920, 480, 260, 24, { grain: false, spacing: 12, t0: T0 + 1.15, jit: 0.3 });
      const st = stepT(T0 + 1.1, 5.6), v = 1e6 * Math.pow(xseg(st, T0 + 1.1, 5.3), 2.3);
      if (t > T0 + 1.1) { const s = fmtC(v); setType(b, rc, s, '400|"Anton"', 820, 640, s.length * 42, 80, { spacing: 6, t0: st, jit: 0.5 }); }
      setType(rd, r, 'EXAMPLES', '400|"Bebas Neue"', 820, 690, 200, 32, { spacing: 10, grain: false, t0: T0 + 1.2, jit: 0.3 });
    }
    if (si === 2) {
      runningHead(b, rd, r, T0);
      const right = t > 9.15;
      stockCut(b, r, 'cat', 170, 330, 170, T0 + 0.3);
      setType(rd, r, 'NEW PICTURE', '400|"Bebas Neue"', 170, 460, 170, 30, { spacing: 6, grain: false, t0: T0 + 0.4, jit: 0.3 });
      dashArrow(b, r, qP(280, 330, 340, 300, 400, 330), T0 + 0.55, 0.3, 6);
      setType(b, r, 'GUESS', '400|"Bebas Neue"', 600, 180, 160, 40, { spacing: 8, grain: false, t0: T0 + 0.6 });
      if (!right) setType(b, r, 'DOG?', '400|"Anton"', 600, 390, 300, 150, { spacing: 8, t0: T0 + 0.85, dt: 0.06 });
      else setType(b, rc, 'CAT', '400|"Anton"', 600, 390, 260, 150, { spacing: 8, t0: 9.15, dt: 0.06 });
      dashArrow(b, r, qP(780, 330, 840, 300, 900, 330), T0 + 1.25, 0.3, 6);
      setType(b, r, 'CHECK', '400|"Bebas Neue"', 1060, 180, 160, 40, { spacing: 8, grain: false, t0: T0 + 1.35 });
      setType(rd, r, right ? 'RIGHT!' : "IT'S A CAT", '400|"Bebas Neue"', 1060, 350, right ? 200 : 250, 60, { spacing: 6, t0: right ? 9.3 : T0 + 1.5 });
      // emphasis: a rubber-stamp overprint across the wrong guess
      if (!right && t > 7.75) {
        rd.save(); rd.translate(640, 440); rd.rotate(-0.14);
        const k = 0.75 * stamp(rd, 7.75) * (1 + 0.25 * (1 - XE2.out(xseg(t, 7.75, 7.95))));
        rd.scale(k, k); rd.fillStyle = blockStyle(r, 0.85, false); rd.lineWidth = 10; rd.strokeStyle = rd.fillStyle; rd.strokeRect(-190, -62, 380, 124);
        rd.font = '400 92px "Rubik Mono One"'; rd.textAlign = 'center'; rd.textBaseline = 'middle'; rd.fillText('WRONG', 0, 6); rd.restore(); rd.globalAlpha = 1;
      }
      // ADJUST: the return path set as a curve of rule pieces, gears turning
      dashArrow(b, r, qP(1060, 420, 1000, 600, 720, 560), 8.05, 0.45, 12);
      setType(b, r, 'ADJUST', '400|"Bebas Neue"', 960, 640, 190, 46, { spacing: 8, grain: false, t0: 8.3 });
      const turn = XE2.inOut(xseg(t, 8.35, 9.0)) * 3;
      gear(b, r, 560, 545, 55, 10, 0.2 + turn, 8.25); gear(b, r, 640, 600, 32, 8, -0.3 - turn * 1.7, 8.32);
      if (right) { rd.fillStyle = blockStyle(r, 1, false); const k = stamp(rd, 9.3); rd.save(); rd.translate(1060, 260); rd.scale(k, k); rd.lineWidth = 16; rd.lineCap = 'butt'; rd.lineJoin = 'miter'; rd.strokeStyle = rd.fillStyle; rd.beginPath(); rd.moveTo(-34, 0); rd.lineTo(-10, 26); rd.lineTo(38, -32); rd.stroke(); rd.restore(); rd.globalAlpha = 1; }
    }
    if (si === 3) {
      runningHead(b, rd, r, T0);
      // bar chart built from stacked square blocks, locked up course by course
      const target = [61, 70, 78, 84, 89, 93, 95, 97];
      for (let c = 0; c < 8; c++) {
        const nb = Math.round((target[c] - 50) / 4);
        for (let j = 0; j < nb; j++) {
          const tt = T0 + 0.3 + c * 0.17 + j * 0.022, x0 = 110 + c * 64, y0 = 560 - (j + 1) * 34;
          (c >= 6 ? rd : b).fillStyle = blockStyle(r, r.range(0.85, 1), false); stamp(c >= 6 ? rd : b, tt);
          (c >= 6 ? rd : b).fillRect(x0, y0 + 3, 50, 28); (c >= 6 ? rd : b).globalAlpha = 1;
        }
      }
      rule(b, r, 96, 640, 566, 5, T0 + 0.2);
      setType(b, r, 'TRAINING ROUNDS', '400|"Bebas Neue"', 368, 610, 300, 30, { spacing: 8, grain: false, t0: T0 + 0.25 });
      setType(rd, r, 'ACCURACY', '400|"Rubik Mono One"', 960, 200, 330, 32, { spacing: 18, grain: false, t0: T0 + 0.3 });
      const st = stepT(T0 + 0.35, 12.05), v = Math.round(61 + 36 * XE2.inOut(xseg(st, T0 + 0.35, 12.05)));
      setType(b, rc, v + '%', '400|"Anton"', 960, 440, 380, 200, { spacing: 8, t0: st, jit: 0.4 });
      if (t > 12.1) { rule(rd, r, 770, 1150, 470, 10, 12.1); rule(rd, r, 770, 1150, 486, 3, 12.15); [[760, 250], [1160, 250], [760, 410], [1160, 410]].forEach(([a, c2], i) => star(rd, r, a, c2, 22, 12.2 + i * 0.06)); }
    }
    if (si === 4) {
      runningHead(b, rd, r, T0);
      setType(b, r, 'MORE EXAMPLES', '400|"Anton"', 640, 270, 1060, 150, { spacing: 8, t0: T0 + 0.1, dt: 0.025 });
      dashArrow(b, r, qP(640, 300, 640, 330, 640, 380), T0 + 0.45, 0.15, 3, 12);
      setType(rd, r, 'BETTER GUESSES', '400|"Abril Fatface"', 640, 560, 1000, 120, { spacing: 4, t0: T0 + 0.6, dt: 0.025 });
      for (let i = 0; i < 17; i++) diamond(rd, r, 640 + (i - 8) * 34, 640, i % 2 ? 5 : 8, T0 + 1.05 + Math.abs(i - 8) * 0.02);
    }
  };

  const printSheet = (W, H_, si, t) => {
    if (!LPX) {
      const pc = H.layer(W, H_), px = pc.getContext('2d'), r = H.rng(2026);
      paperBase(px, W, H_);
      for (let i = 0; i < 260; i++) { const x0 = r.range(0, W), y0 = r.range(0, H_), a = r.range(0, 6.28), l = r.range(4, 22); px.strokeStyle = `rgba(${r.chance(0.5) ? '120,95,60' : '255,250,235'},${r.range(0.1, 0.3)})`; px.lineWidth = r.range(0.4, 1.1); px.beginPath(); px.moveTo(x0, y0); px.quadraticCurveTo(x0 + Math.cos(a + 0.5) * l * 0.6, y0 + Math.sin(a + 0.5) * l * 0.6, x0 + Math.cos(a) * l, y0 + Math.sin(a) * l); px.stroke(); }
      H.vignette(px, W, H_, 0.18, '120,85,40');
      const nz = H.makeNoise(33), GW = 427, GH = 240, fld = new Float32Array(GW * GH * 3);
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { const j = (y * GW + x) * 3; fld[j] = nz.fbm2(x * 0.05, y * 0.05, 3); fld[j + 1] = nz.fbm2(x * 0.6, y * 0.6, 2); fld[j + 2] = nz.fbm2(x * 0.012, y * 0.35, 2); }
      LPX = { paper: px.getImageData(0, 0, W, H_).data, fld, GW, GH, nz };
    }
    const { paper, fld, GW, GH, nz } = LPX;
    nextId = 1; CT = t;
    const blk = H.layer(W, H_), b = blk.getContext('2d'), red = H.layer(W, H_), rd = red.getContext('2d');
    forme(si, b, rd, t);
    const redShift = H.layer(W, H_), rs = redShift.getContext('2d'); rs.translate(W / 2, H_ / 2); rs.rotate([0.0015, -0.0011, 0.0013, -0.0015, 0.0009][si]); rs.translate(-W / 2, -H_ / 2); rs.drawImage(red, 2.5, -1.5);
    const bk = b.getImageData(0, 0, W, H_).data, rk = rs.getImageData(0, 0, W, H_).data;
    const blurOf = (c, px) => { const o = H.layer(W, H_), ox = o.getContext('2d'); ox.filter = `blur(${px}px)`; ox.drawImage(c, 0, 0); return ox.getImageData(0, 0, W, H_).data; };
    const both = H.layer(W, H_), bx = both.getContext('2d'); bx.drawImage(blk, 0, 0); bx.drawImage(redShift, 0, 0);
    const bb = blurOf(both, 2.2), bkB = blurOf(blk, 1.6), rkB = blurOf(redShift, 1.6);
    const samp = (x, y, c) => fld[(((y * GH / H_) | 0) * GW + ((x * GW / W) | 0)) * 3 + c];
    const inkPass = (i, x, y, m, mB, s) => {
      const a = m[i + 3] / 255; if (a < 0.02) return 0;
      const dens0 = m[i + 1] / 255, phase = m[i + 2] / 255, broad = samp(x, y, 0), fine = samp(x, y, 1), ab = mB[i + 3] / 255;
      let cov = xcl((Math.min(a, ab * 1.15) - (0.5 + fine * 0.45 + (lph(x, y, s) - 0.5) * 0.2)) * 2.6 + 0.5);
      if (cov <= 0) return 0;
      let dens = (0.25 + dens0 * 0.85) * (0.97 + broad * 0.22) + (lph(x, y, s + 1) - 0.5) * 0.08;
      const sq = xcl((a - ab) * 3.5); // ink squeezed to the rim of the block
      if (phase > 0) { const gv = Math.sin((y + samp(x, y, 2) * 40 + phase * 30) * 0.9 + Math.sin(x * 0.01 + phase * 9) * 2.5); dens *= 1 - 0.3 * H.smooth(0.55, 1, gv * 0.5 + nz.n2(x * 0.004 + phase * 7, y * 0.22) * 0.8); }
      if (lph(x, y, s + 2) < 0.004 + Math.max(0, -broad - 0.15) * 0.35 + Math.max(0, fine - 0.3) * 0.2) dens *= 0.25;
      dens = dens * (1 - sq * 0.5) + sq * 0.5 * Math.max(dens, 1.06) + sq * 0.12;
      return cov * xcl(dens);
    };
    const out = new ImageData(W, H_), d = out.data;
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      let cr = paper[i], cg = paper[i + 1], cb = paper[i + 2];
      const gA = (y > 2 && y < H_ - 3 && x > 2 && x < W - 3) ? bb[i + 3 + (W + 1) * 8] - bb[i + 3 - (W + 1) * 8] : 0;
      // directional bite: shadowed upper-left wall, only a soft light on the lower-right (no pale all-round halo)
      const k = (1 - Math.max(gA, 0) / 255 * 0.14 - Math.min(gA, 0) / 255 * 0.04) * (1 - (bb[i + 3] / 255) * 0.05); cr *= k; cg *= k; cb *= k;
      const cR = inkPass(i, x, y, rk, rkB, 10);
      if (cR) { cr *= 1 - cR * (1 - INKS.red[0] / 255); cg *= 1 - cR * (1 - INKS.red[1] / 255); cb *= 1 - cR * (1 - INKS.red[2] / 255); }
      const cK = inkPass(i, x, y, bk, bkB, 20);
      if (cK) { cr = cr * (1 - cK) + INKS.black[0] * cK; cg = cg * (1 - cK) + INKS.black[1] * cK; cb = cb * (1 - cK) + INKS.black[2] * cK; }
      d[i] = cr; d[i + 1] = cg; d[i + 2] = cb; d[i + 3] = 255;
    }
    const c = H.layer(W, H_); c.getContext('2d').putImageData(out, 0, 0);
    return c;
  };

  const lpExplainer = (ctx, W, H_, t) => {
    let cur = 0; for (let i = 0; i < SHEETS.length; i++) if (t >= SHEETS[i]) cur = i;
    const sw = cur > 0 ? xseg(t, SHEETS[cur], SHEETS[cur] + SWAP) : 1;
    ctx.fillStyle = '#26221e'; ctx.fillRect(0, 0, W, H_); // the press bed
    // fresh sheet already on the bed, drops the last few px as it is laid down
    const drop = 1 - XE2.out(sw);
    ctx.save(); ctx.translate(W / 2, H_ / 2); ctx.scale(1 - drop * 0.03, 1 - drop * 0.03); ctx.translate(-W / 2, -H_ / 2);
    ctx.drawImage(printSheet(W, H_, cur, t), 0, 0); ctx.restore();
    if (sw < 1) {
      // the finished proof is lifted off the forme and carried away
      const u = XE2.in(sw), old = printSheet(W, H_, cur - 1, SHEETS[cur] - 0.001);
      ctx.save(); ctx.translate(W / 2 - u * 1500, H_ / 2 - u * 260); ctx.rotate(-u * 0.12); ctx.scale(1 + u * 0.04, 1 + u * 0.04);
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30 * u + 4; ctx.shadowOffsetY = 18 * u + 2;
      ctx.drawImage(old, -W / 2, -H_ / 2); ctx.restore();
    }
  };

  registerStyle({
    id: 'letterpress',
    name: 'Wood Type Letterpress',
    category: 'Print',
    description: 'A two-ink wood-type broadside on cream stock: mixed display faces set block by block, each letter inked a little differently, wood grain and worn edges in the solids, ink squeezed to the rims and the whole forme bitten into the paper.',
    motion: 'The forme is proofed block by block — rules first, then each wood letter lands with a heavy kiss of the platen, red and black alternating down the sheet — and the gears keep turning as the impression deepens.',
    fonts: ['400 200px "Anton"', '400 200px "Abril Fatface"', '400 200px "Rubik Mono One"', '400 200px "Bebas Neue"'],
    duration: 5,
    frameT: 4.8,
    readsPixels: true,
    explainerDuration: 15.5,
    explainerNote: 'Every beat is a new proof: the finished sheet is lifted off the press and a fresh one is laid down, then wood type, stock cuts of a cat and a dog, and arrows set from short rule pieces lock up block by block with a kiss of the platen; counters are re-set and re-stamped six times a second, and the wrong guess gets a red rubber-stamp WRONG.',
    explainer(ctx, W, H_, t) { lpExplainer(ctx, W, H_, t); },
    // Sound: a hand press in a print shop. Every block that locks up gets a wooden "kiss" of the platen (letters,
    // stock cuts, rules), rule-piece arrows tick together piece by piece, counters re-stamp on their 6 fps steps,
    // the bar chart rattles up in stacks of quoins, each new sheet is peeled off the forme and a fresh one laid
    // down, WRONG is a rubber stamp, and the big moments are the full weight of the press.
    // Timings mirror SHEETS / SWAP / forme() above (T0 = SHEETS[si] + SWAP*0.6, per-block t0s, stepT on sixths).
    // Voiceover mode: room bed drops; per-letter kisses, rule pieces, counter re-stamps and small labels are minor.
    explainerSound(k) {
      const D = 15.5, T0 = (si) => SHEETS[si] + (si ? SWAP * 0.6 : 0.1);
      const pan = (px) => xcl((px / 1280) * 2 - 1, -1, 1) * 0.6;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // the platen kisses a wood block: short woody thunk, heavier for big blocks
      const kiss = (t, g, p, minor) => {
        const o = { minor: !!minor };
        k.tone(t, { ...o, f: [[0, 150], [0.05, 72]], dur: 0.08, gain: 0.3 * g, pan: p });
        k.noise(t, { ...o, dur: 0.04, filter: 'bandpass', f: 650, q: 1.2, gain: 0.3 * g, a: 0.001, pan: p });
        k.noise(t, { ...o, dur: 0.01, filter: 'bandpass', f: 1800, q: 1, gain: 0.08 * g, a: 0.001, pan: p });
      };
      const word = (t0, dt, n, g, x0, x1) => { for (let i = 0; i < n; i++) kiss(t0 + i * dt, g, pan(x0 + (x1 - x0) * (i / Math.max(1, n - 1))), true); };
      // a metal rule piece dropped into the chase: tiny dry tick
      const piece = (t, g, p) => k.noise(t, { minor: true, dur: 0.015, filter: 'bandpass', f: 1500, q: 1.5, gain: 0.22 * g, a: 0.001, pan: p });
      const arrow = (t0, dur, n, p0, p1) => { for (let i = 0; i < n; i += n > 6 ? 2 : 1) piece(t0 + dur * (i / n), 0.9, p0 + (p1 - p0) * (i / n)); kiss(t0 + dur, 0.55, p1, true); };
      // proof off, fresh sheet on: tacky peel, the sheet carried away, the next one settling on the bed
      const swap = (t) => {
        k.withMinor(() => { for (let x = 0; x < 0.16; x += 0.012) k.noise(t + x, { dur: 0.006, filter: 'bandpass', f: 1700, q: 1, gain: 0.14 * (1 - x / 0.16), a: 0.001, pan: -0.2 }); });
        k.play('paper', t + 0.05, { dur: 0.45, gain: 1.1, pan: -0.4 });
        k.noise(t + 0.05, { dur: 0.45, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.45, 1100]], q: 0.7, gain: 0.14, a: 0.15, pan: -0.5 }); // air of the sheet carried off
        k.noise(t + 0.3, { dur: 0.25, color: 'pink', filter: 'lowpass', f: [[0, 900], [0.25, 300]], gain: 0.16, a: 0.03 });
        k.play('slap', t + 0.24, { gain: 0.3 }); // fresh sheet settles on the bed
      };

      k.bed('room', 0, D, { gain: 0.22 });

      // ---- sheet 1: HOOK. rules, HOW DOES (dt .09, space skipped), AI LEARN? in red (dt .07), closing rules
      kiss(0.1, 0.7, 0); kiss(0.15, 0.4, 0, true);
      [0, 1, 2, 4, 5, 6, 7].forEach((i) => kiss(0.25 + i * 0.09, 0.85, pan(190 + i * 129), true));
      [0, 1, 3, 4, 5, 6, 7, 8].forEach((i) => kiss(1.05 + i * 0.07, 0.85, pan(230 + i * 102), true));
      k.play('press', 1.7, { gain: 0.55 }); // closing rules lock the forme up

      // ---- sheet 2: DATA
      swap(SHEETS[1]);
      kiss(T0(1), 0.6, 0); // running head
      for (let i = 0; i < 4; i++) { kiss(T0(1) + 0.35 + i * 0.32, 1.0, pan(i % 2 ? 330 : 160)); kiss(T0(1) + 0.5 + i * 0.32, 0.4, pan(i % 2 ? 330 : 160), true); } // stock cuts + labels
      kiss(T0(1) + 1.0, 1.0, pan(900)); kiss(T0(1) + 1.1, 0.6, pan(1045), true); // the model's gears
      kiss(T0(1) + 1.15, 0.45, pan(920), true); // THE MODEL
      arrow(T0(1) + 1.3, 0.55, 12, pan(440), pan(700));
      // counter re-set on sixths of a second from 3.83 to 5.5; 1,000,000 first lands on the 5.333 step
      for (let n = Math.ceil((T0(1) + 1.1) * 6); n <= 33; n++) { const t = n / 6; if (Math.abs(t - 32 / 6) < 1e-6) continue; kiss(t, 0.5, pan(820), true); }
      k.play('press', 32 / 6, { gain: 0.85, pan: pan(820) }); // 1,000,000

      // ---- sheet 3: GUESS / CHECK
      swap(SHEETS[2]);
      kiss(T0(2), 0.6, 0);
      kiss(T0(2) + 0.3, 1.0, pan(170)); // cat cut
      kiss(T0(2) + 0.4, 0.4, pan(170), true); // NEW PICTURE
      arrow(T0(2) + 0.55, 0.3, 6, pan(280), pan(400));
      kiss(T0(2) + 0.6, 0.45, pan(600), true); // GUESS
      word(T0(2) + 0.85, 0.06, 4, 0.9, 480, 720); // DOG?
      arrow(T0(2) + 1.25, 0.3, 6, pan(780), pan(900));
      kiss(T0(2) + 1.35, 0.45, pan(1060), true); // CHECK
      kiss(T0(2) + 1.5, 0.6, pan(1060), true); // IT'S A CAT
      k.play('stamp', 7.75, { gain: 0.95, pan: pan(640) }); // red rubber-stamp WRONG
      k.play('error', 7.93, { f: 'E3', gain: 0.7, pan: pan(640) });
      arrow(8.05, 0.45, 12, pan(1060), pan(720));
      kiss(8.25, 0.8, pan(560)); kiss(8.32, 0.5, pan(640), true); // gears
      kiss(8.3, 0.45, pan(960), true); // ADJUST
      for (let i = 1; i <= 3; i++) k.play('tock', when(8.35, 9.0, XE2.inOut, (i - 0.5) / 3), { f: 420 + i * 20, gain: 0.32, pan: pan(600), minor: true }); // gears turn
      word(9.15, 0.06, 3, 1.0, 500, 700); // CAT re-set
      kiss(9.3, 0.7, pan(1060));
      k.play('success', 9.38, { f: 'C5', gain: 0.55, pan: pan(1060) }); // RIGHT! + tick

      // ---- sheet 4: ACCURACY
      swap(SHEETS[3]);
      kiss(T0(3), 0.6, 0);
      kiss(T0(3) + 0.2, 0.5, pan(368), true); kiss(T0(3) + 0.3, 0.45, pan(960), true); // base rule / ACCURACY
      // each bar is a stack of blocks locked up 22 ms apart: one short rattle per column
      [3, 5, 7, 9, 10, 11, 11, 12].forEach((nb, c) => { const t0 = T0(3) + 0.3 + c * 0.17, p = pan(135 + c * 64); kiss(t0, 0.6, p, true); for (let j = 1; j < nb; j += 2) piece(t0 + j * 0.022, 0.7, p); });
      for (let n = Math.ceil((T0(3) + 0.35) * 6); n <= 72; n++) kiss(n / 6, 0.45, pan(960), true); // % re-stamped on sixths
      // 97%: the red rules bite in under it, stars follow. The biggest hit: full weight of the press
      k.play('impact', 12.1, { gain: 1.1, pan: pan(960) });
      k.play('press', 12.1, { gain: 1.0, pan: pan(960) });
      [12.2, 12.26, 12.32, 12.38].forEach((t, i) => kiss(t, 0.45, pan(i % 2 ? 1160 : 760), true));

      // ---- sheet 5: TAKEAWAY
      swap(SHEETS[4]);
      kiss(T0(4), 0.6, 0);
      kiss(T0(4) + 0.1, 0.9, pan(200)); for (let i = 2; i < 13; i += 2) kiss(T0(4) + 0.1 + i * 0.025, 0.55, pan(200 + i * 75), true); // MORE EXAMPLES runs in
      arrow(T0(4) + 0.45, 0.15, 3, 0, 0);
      kiss(T0(4) + 0.6, 0.9, pan(200)); for (let i = 2; i < 14; i += 2) kiss(T0(4) + 0.6 + i * 0.025, 0.55, pan(200 + i * 68), true); // BETTER GUESSES
      k.play('press', T0(4) + 0.95, { gain: 0.6 }); // the takeaway is locked up
      ['C4', 'G4', 'C5', 'E5'].forEach((f, i) => k.play('ding', T0(4) + 1.08 + i * 0.06, { f, gain: 0.36 - i * 0.05, pan: (i - 1.5) * 0.2 }));
      for (let i = 0; i <= 8; i += 2) { const t = T0(4) + 1.05 + i * 0.02; piece(t, 0.6, -i * 0.05); piece(t, 0.6, i * 0.05); } // diamond ornaments, centre out
    },
    draw(ctx, W, H_, t) {
      nextId = 1; CT = t;
      const r = H.rng(2026);
      const press = 0.35 + 0.65 * H.ease.out(H.clamp((t - 0.2) / 3.4)); // impression strength ramps in
      const blk = H.layer(W, H_), b = blk.getContext('2d');
      const red = H.layer(W, H_), rd = red.getContext('2d');
      const L = 58, R = 1222;

      // ---- black forme ----
      rule(b, r, L, R, 28, 8, 0.12); rule(b, r, L, R, 42, 2.5, 0.18);
      setType(b, r, 'THINKING', '400|"Anton"', 640, 318, 1110, 196, { spacing: 10, t0: 0.85, dt: 0.1 });
      setType(b, r, 'LIVE DEMONSTRATION', '400|"Bebas Neue"', 640, 552, 800, 54, { spacing: 18, jit: 0.6, t0: 2.45, dt: 0.025 });
      gear(b, r, 218, 398, 48, 10, 0.2 + t * 0.3, 2.28); gear(b, r, 1062, 398, 48, 10, -0.1 - t * 0.3, 2.28);
      gear(b, r, 162, 432, 24, 8, 0.5 - t * 0.6, 2.36); gear(b, r, 1118, 432, 24, 8, 0.1 + t * 0.6, 2.36);
      rule(b, r, L, R, 666, 2.5, 3.5); rule(b, r, L, R, 676, 8, 3.44);
      // thin side rules with diamond terminals framing 'LIVE DEMONSTRATION'
      rule(b, r, L + 10, 220, 525, 2, 2.42); rule(b, r, 1060, R - 10, 525, 2, 2.42);

      // ---- red forme ----
      setType(rd, r, 'NOW SHOWING', '400|"Rubik Mono One"', 640, 98, 420, 25, { spacing: 30, grain: false, jit: 0.4, t0: 0.38, dt: 0.035 });
      star(rd, r, 392, 86, 15, 0.32); star(rd, r, 888, 86, 15, 0.76);
      setType(rd, r, 'MACHINES', '400|"Abril Fatface"', 640, 448, 680, 98, { spacing: 6, t0: 1.75, dt: 0.065 });
      for (let i = 0; i < 17; i++) diamond(rd, r, 640 + (i - 8) * 34, 590, i % 2 ? 5 : 8, 2.92 + Math.abs(i - 8) * 0.03);
      setType(rd, r, 'ADMISSION FREE', '400|"Rubik Mono One"', 640, 638, 360, 20, { spacing: 24, grain: false, jit: 0.4, t0: 3.2, dt: 0.02 });
      diamond(rd, r, 230, 525, 8, 2.5); diamond(rd, r, 1050, 525, 8, 2.5);
      rule(rd, r, L, R, 15, 4, 0.24); rule(rd, r, L, R, 689, 4, 3.56);

      // ---- paper (static: built once, the random draws are still consumed so everything after is unchanged) ----
      const fib = [], fox = [];
      for (let i = 0; i < 260; i++) fib.push([r.range(0, W), r.range(0, H_), r.range(0, 6.28), r.range(4, 22), r.chance(0.5), r.range(0.1, 0.3), r.range(0.4, 1.1)]);
      for (let i = 0; i < 14; i++) fox.push([r.range(0, W), r.range(0, H_), r.range(2, 9)]);
      if (!HP || HP.width !== W || HP.height !== H_) {
        HP = H.layer(W, H_); const pc = HP.getContext('2d');
        paperBase(pc, W, H_);
        for (const [x0, y0, a, l, dk, al, lw] of fib) {
          pc.strokeStyle = `rgba(${dk ? '120,95,60' : '255,250,235'},${al})`; pc.lineWidth = lw;
          pc.beginPath(); pc.moveTo(x0, y0); pc.quadraticCurveTo(x0 + Math.cos(a + 0.5) * l * 0.6, y0 + Math.sin(a + 0.5) * l * 0.6, x0 + Math.cos(a) * l, y0 + Math.sin(a) * l); pc.stroke();
        }
        // foxing
        for (const [x0, y0, rr] of fox) { const g = pc.createRadialGradient(x0, y0, 0, x0, y0, rr); g.addColorStop(0, 'rgba(150,100,50,0.22)'); g.addColorStop(1, 'rgba(150,100,50,0)'); pc.fillStyle = g; pc.fillRect(x0 - rr, y0 - rr, rr * 2, rr * 2); }
        H.vignette(pc, W, H_, 0.18, '120,85,40');
      }
      ctx.drawImage(HP, 0, 0);

      // ---- masks ----
      const dx = 2.5, dy = -1.5; // red forme slightly out of register
      const redShift = H.layer(W, H_), rs = redShift.getContext('2d'); rs.translate(W / 2, H_ / 2); rs.rotate(0.0015); rs.translate(-W / 2, -H_ / 2); rs.drawImage(red, dx, dy);
      const bk = b.getImageData(0, 0, W, H_).data, rk = rs.getImageData(0, 0, W, H_).data;
      const blurOf = (c, px) => { const o = H.layer(W, H_), ox = o.getContext('2d'); ox.filter = `blur(${px}px)`; ox.drawImage(c, 0, 0); return ox.getImageData(0, 0, W, H_).data; };
      const both = H.layer(W, H_), bx = both.getContext('2d'); bx.drawImage(blk, 0, 0); bx.drawImage(redShift, 0, 0);
      const bb = blurOf(both, 2.2);   // impression relief
      const bkB = blurOf(blk, 1.6), rkB = blurOf(redShift, 1.6); // for ink-squash rims

      const nz = H.makeNoise(33);
      // low-res noise fields
      const GW = 427, GH = 240, fld = new Float32Array(GW * GH * 3);
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
        const j = (y * GW + x) * 3;
        fld[j] = nz.fbm2(x * 0.05, y * 0.05, 3);                 // broad ink patchiness
        fld[j + 1] = nz.fbm2(x * 0.6, y * 0.6, 2);               // fine edge wear
        fld[j + 2] = nz.fbm2(x * 0.012, y * 0.35, 2);            // wood grain warp (stretched in x)
      }
      const samp = (x, y, c) => fld[(((y * GH / H_) | 0) * GW + ((x * GW / W) | 0)) * 3 + c];
      const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };

      const img = ctx.getImageData(0, 0, W, H_), d = img.data;
      const inkPass = (i, x, y, m, mB, ink, s, rr, gg, bl) => {
        const a = m[i + 3] / 255; if (a < 0.02) return null;
        const dens0 = m[i + 1] / 255, phase = m[i + 2] / 255;
        const broad = samp(x, y, 0), fine = samp(x, y, 1);
        // worn, slightly ragged edges
        const ab = mB[i + 3] / 255;
        const thr = 0.5 + fine * 0.45 + (hash(x, y, s) - 0.5) * 0.2;
        let cov = H.clamp((Math.min(a, ab * 1.15) - thr) * 2.6 + 0.5);
        if (cov <= 0) return null;
        let dens = (0.25 + dens0 * 0.85) * (0.97 + broad * 0.22) + (hash(x, y, s + 1) - 0.5) * 0.08;
        // ink squash: darker rim just inside the edges
        const rim = H.clamp((a - mB[i + 3] / 255) * 3.5);
        // wood grain in the big blocks
        if (phase > 0) {
          const gv = Math.sin((y + samp(x, y, 2) * 40 + phase * 30) * 0.9 + Math.sin(x * 0.01 + phase * 9) * 2.5);
          const gv2 = nz.n2(x * 0.004 + phase * 7, y * 0.22);
          dens *= 1 - 0.32 * H.smooth(0.55, 1, gv * 0.5 + gv2 * 0.8);
          // a low spot on the block that took less ink
          dens *= 1 - 0.3 * H.smooth(0.2, 0.7, broad + (phase - 0.5) * 0.6);
        }
        // pinholes / speckle
        if (hash(x, y, s + 2) < 0.004 + Math.max(0, -broad - 0.15) * 0.35 + Math.max(0, fine - 0.3) * 0.2) dens *= 0.25;
        // ink squeezed out to the rim: the edge prints solid and slightly heavier even where the face is grainy
        dens = dens * (1 - rim * 0.5) + rim * 0.5 * Math.max(dens, 1.06) + rim * 0.12;
        cov *= H.clamp(dens);
        return cov;
      };
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        let cr = d[i], cg = d[i + 1], cb = d[i + 2];
        // deboss: impressed areas shade like a shallow relief lit from top-left
        const gA = (y > 2 && y < H_ - 3 && x > 2 && x < W - 3) ? bb[i + 3 + (W + 1) * 8] - bb[i + 3 - (W + 1) * 8] : 0;
        // directional bite: shadowed upper-left wall, only a soft light on the lower-right (no pale all-round halo)
        const sh = 1 - (Math.max(gA, 0) / 255 * 0.14 + Math.min(gA, 0) / 255 * 0.04) * press;
        const inside = bb[i + 3] / 255;
        const dep = 1 - inside * 0.05 * press;
        let k = sh * dep; cr *= k; cg *= k; cb *= k;
        const cR = inkPass(i, x, y, rk, rkB, INKS.red, 10);
        if (cR) { cr = cr * (1 - cR) + cr * (INKS.red[0] / 255) * cR; cg = cg * (1 - cR) + cg * (INKS.red[1] / 255) * cR; cb = cb * (1 - cR) + cb * (INKS.red[2] / 255) * cR; }
        const cK = inkPass(i, x, y, bk, bkB, INKS.black, 20);
        if (cK) { const kk = cK; cr = cr * (1 - kk) + INKS.black[0] * kk; cg = cg * (1 - kk) + INKS.black[1] * kk; cb = cb * (1 - kk) + INKS.black[2] * kk; }
        d[i] = cr; d[i + 1] = cg; d[i + 2] = cb;
      }
      ctx.putImageData(img, 0, 0);
      // stray ink specks from dirty furniture
      for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(30,27,26,${r.range(0.2, 0.6)})`; ctx.beginPath(); ctx.arc(r.range(40, W - 40), r.range(40, H_ - 40), r.range(0.5, 1.6), 0, 7); ctx.fill(); }
      const z = 1 + 0.025 * H.ease.inOut(H.clamp((t - 3.0) / 2.0));
      if (z > 1.0001) {
        const cp = H.layer(W, H_); cp.getContext('2d').drawImage(ctx.canvas, 0, 0, W, H_);
        ctx.drawImage(cp, 640 - 640 / z, 330 - 330 / z, W / z, H_ / z, 0, 0, W, H_);
      }
    },
  });
}
```
