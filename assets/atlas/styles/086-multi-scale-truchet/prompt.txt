I want an animated explainer made in the "Multi-scale Truchet" visual style (Generative & Type). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Rubik Mono One
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik+Mono+One&display=block">
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
Name: Multi-scale Truchet
Family: Generative & Type
Look: Bold two-ink multi-scale Truchet tiling of winged quarter-circle tiles whose paths flow continuously across three scales; a third ink fills only the closed regions that fall inside the letters "AI", so the word surfaces from the maze.
Motion: Big tiles are laid in a diagonal sweep, then each scale subdivides in turn (paths re-routing as detail arrives); then the accent screen is pulled across and slides into register, revealing AI.
How it explains: The model is a Truchet maze whose tiles are its weights: an input band routes to the wrong output, the error runs back along the path and two tiles quarter-turn to re-route it; scenes change by re-laying the tiles in a diagonal sweep, labels are printed blocks with misregistered accent, and the accuracy chart is built from stacked tiles.

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

REFERENCE STYLE SOURCE (styles/truchet.js; W/H_ are always 1280x720)
```js
{
  // Multi-scale Truchet (Carlson "winged" tiles): each tile = square in its fill colour, quarter-
  // annulus bands (r = s/3..2s/3) about two opposite corners, plus corner "wing" discs (r = s/3)
  // that spill over the tile edge. Child tiles invert colours, so paths stay continuous across
  // scales. The hidden message is carried by colour: closed regions are flood-labelled and those
  // lying inside the letters "AI" are printed in a third ink (with a touch of screen-print
  // misregistration).
  const TAU = Math.PI * 2;
  const C_DARK = [20, 30, 58], C_LIGHT = [242, 233, 212], C_ACC = [232, 86, 44];


  // =====================================================================================
  // EXPLAINER — the model is a Truchet maze: an input enters on the left, the path its band
  // takes decides which output it reaches. Training = flipping tiles (the weights) so the
  // path routes to the right answer. Scene changes re-lay the tiles in a diagonal sweep.
  // =====================================================================================
  const NAVY = `rgb(${C_DARK})`, CREAM = `rgb(${C_LIGHT})`, ACC = `rgb(${C_ACC})`;
  const XS = (t, a, b) => H.clamp((t - a) / (b - a));
  const EXIT = [{ L: 'T', T: 'L', R: 'B', B: 'R' }, { L: 'B', B: 'L', T: 'R', R: 'T' }];
  const MOVE = { R: [1, 0, 'L'], L: [-1, 0, 'R'], T: [0, -1, 'B'], B: [0, 1, 'T'] };
  const MID = { L: [0, 0.5], R: [1, 0.5], T: [0.5, 0], B: [0.5, 1] };
  const CORNER = { LT: [0, 0], TL: [0, 0], RB: [1, 1], BR: [1, 1], LB: [0, 1], BL: [0, 1], TR: [1, 0], RT: [1, 0] };
  const MC = 9, MR = 5, MS = 80, MX0 = 300, MY0 = 150, R_IN = 2, R_CAT = 1, R_DOG = 3;
  function trace(o, r0) {
    const segs = []; let i = 0, j = r0, e = 'L';
    for (let n = 0; n < 200; n++) {
      if (i < 0 || j < 0 || i >= MC || j >= MR) break;
      const x = EXIT[o[j * MC + i]][e]; segs.push({ i, j, a: e, b: x });
      const [di, dj, ne] = MOVE[x]; i += di; j += dj; e = ne;
    }
    const last = segs[segs.length - 1];
    return { segs, out: last.b === 'R' && last.i === MC - 1 ? last.j : -1 };
  }
  let MAZE = null; // deterministic search: a maze that routes to "dog", fixable by flipping tiles to "cat"
  function maze() {
    if (MAZE) return MAZE;
    for (let s = 1; s < 20000 && !MAZE; s++) {
      const r = H.rng(s * 7 + 3), o = new Uint8Array(MC * MR);
      for (let k = 0; k < o.length; k++) o[k] = r() < 0.5 ? 0 : 1;
      const A = trace(o, R_IN);
      if (A.out !== R_DOG || A.segs.length < 11) continue;
      const cand = A.segs.map((g) => g.j * MC + g.i);
      for (let a = 0; a < cand.length && !MAZE; a++) for (let b = a + 1; b < cand.length && !MAZE; b++) {
        if (cand[a] === cand[b]) continue;
        const o2 = o.slice(); o2[cand[a]] ^= 1; o2[cand[b]] ^= 1;
        const B = trace(o2, R_IN);
        if (B.out === R_CAT && B.segs.length >= 11) MAZE = { o, o2, A, B, flips: [cand[a], cand[b]] };
      }
    }
    return MAZE;
  }
  function tileXY(k) { return [MX0 + (k % MC) * MS, MY0 + Math.floor(k / MC) * MS]; }
  function drawTile(c, x, y, s, o, fill, band, rot = 0) {
    c.save();
    if (rot) { c.translate(x + s / 2, y + s / 2); c.rotate(rot); c.translate(-x - s / 2, -y - s / 2); }
    if (fill) { c.fillStyle = fill; c.fillRect(x, y, s, s); } // null fill: the block underneath was inked in one pass
    c.strokeStyle = band; c.lineWidth = s / 3; c.lineCap = 'butt'; c.beginPath();
    if (o === 0) { c.arc(x, y, s / 2, 0, Math.PI / 2); c.moveTo(x + s / 2, y + s); c.arc(x + s, y + s, s / 2, Math.PI, Math.PI * 1.5); }
    else { c.moveTo(x + s, y + s / 2); c.arc(x + s, y, s / 2, Math.PI / 2, Math.PI); c.moveTo(x + s / 2, y + s); c.arc(x, y + s, s / 2, -Math.PI / 2, 0); }
    c.stroke(); c.restore();
  }
  // draw the first `prog` segments of a path as an ink band (fractional last one)
  function flowPath(c, segs, prog, color, s = MS, reverse = false) {
    c.save(); c.strokeStyle = color; c.lineWidth = s / 3 + 1; c.lineCap = 'butt';
    const n = Math.min(segs.length, Math.ceil(prog));
    for (let q = 0; q < n; q++) {
      const g = segs[reverse ? segs.length - 1 - q : q], f = Math.min(1, prog - q);
      const [cx, cy] = CORNER[g.a + g.b], x = MX0 + g.i * s, y = MY0 + g.j * s;
      const ea = reverse ? g.b : g.a, eb = reverse ? g.a : g.b;
      const a0 = Math.atan2(MID[ea][1] - cy, MID[ea][0] - cx), a1r = Math.atan2(MID[eb][1] - cy, MID[eb][0] - cx);
      let d = a1r - a0; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
      c.beginPath(); c.arc(x + cx * s, y + cy * s, s / 2, a0, a0 + d * f, d < 0); c.stroke();
    }
    c.restore();
  }
  function pointOn(segs, prog, s = MS) { // position along path (prog in segments)
    const q = Math.min(segs.length - 1, Math.max(0, Math.floor(prog))), f = H.clamp(prog - q), g = segs[q];
    const [cx, cy] = CORNER[g.a + g.b];
    const a0 = Math.atan2(MID[g.a][1] - cy, MID[g.a][0] - cx), a1 = Math.atan2(MID[g.b][1] - cy, MID[g.b][0] - cx);
    let d = a1 - a0; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
    const a = a0 + d * f; return [MX0 + g.i * s + cx * s + Math.cos(a) * s / 2, MY0 + g.j * s + cy * s + Math.sin(a) * s / 2];
  }
  // printed label: navy (or accent) block, cream Rubik Mono, slight accent misregistration
  function plabel(c, text, x, y, o = {}) {
    c.save(); c.font = `400 ${o.size || 18}px "Rubik Mono One"`; c.textBaseline = 'middle';
    const w = c.measureText(text).width + (o.size || 18) * 1.2, h = (o.size || 18) * 1.9;
    const ox = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    c.fillStyle = ACC; c.fillRect(ox + 3, y - h / 2 + 3, w, h);
    c.fillStyle = o.bg || NAVY; c.fillRect(ox, y - h / 2, w, h);
    c.fillStyle = o.fg || CREAM; c.fillText(text, ox + (o.size || 18) * 0.6, y + 1);
    c.restore(); return w;
  }
  function pet(c, kind, cx, cy, s, ink, bg) {
    c.save(); c.fillStyle = ink;
    c.beginPath(); c.arc(cx, cy + s * 0.08, s * 0.3, 0, Math.PI * 2); c.fill();
    if (kind === 'cat') { for (const k of [-1, 1]) { c.beginPath(); c.moveTo(cx + k * s * 0.08, cy - s * 0.12); c.lineTo(cx + k * s * 0.3, cy - s * 0.34); c.lineTo(cx + k * s * 0.3, cy - s * 0.02); c.fill(); } }
    else { for (const k of [-1, 1]) { c.beginPath(); c.ellipse(cx + k * s * 0.3, cy + s * 0.08, s * 0.1, s * 0.22, k * 0.3, 0, Math.PI * 2); c.fill(); } c.beginPath(); c.ellipse(cx, cy + s * 0.26, s * 0.15, s * 0.11, 0, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = bg; for (const k of [-1, 1]) { c.beginPath(); c.arc(cx + k * s * 0.11, cy + s * 0.04, s * 0.045, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  function exampleTile(c, kind, x, y, s, label) {
    c.save(); c.fillStyle = ACC; c.fillRect(x + 3, y + 3, s, s); c.fillStyle = CREAM; c.fillRect(x, y, s, s);
    c.strokeStyle = NAVY; c.lineWidth = 3; c.strokeRect(x, y, s, s); pet(c, kind, x + s / 2, y + s / 2, s, NAVY, CREAM); c.restore();
    if (label) plabel(c, label, x + s / 2, y + s + 24, { size: 26, align: 'center', bg: ACC });
  }
  function arrow(c, x0, y0, x1, y1, p, lw = 5, col = NAVY) {
    if (p <= 0) return; const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p, a = Math.atan2(y1 - y0, x1 - x0), hd = lw * 3.4;
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x - Math.cos(a) * hd * 0.7, y - Math.sin(a) * hd * 0.7); c.stroke();
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(a - 0.55) * hd, y - Math.sin(a - 0.55) * hd); c.lineTo(x - Math.cos(a + 0.55) * hd, y - Math.sin(a + 0.55) * hd); c.closePath(); c.fill(); c.restore();
  }
  function paper(c, W, H_) { c.fillStyle = CREAM; c.fillRect(0, 0, W, H_); }
  // screen-print finish for the explainer's flat scenes: the still's ink-film unevenness (low-frequency
  // density mottle + fine speckle), built once and multiplied over the scene, plus the still's soft vignette.
  let INKF = null;
  function inkFilm(W, H_) {
    if (INKF && INKF.width === W && INKF.height === H_) return INKF;
    const L = H.layer(W, H_), c = L.getContext('2d'), img = c.createImageData(W, H_), d = img.data;
    const nz = H.makeNoise(17), rr = H.rng(3);
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const v = 0.99 + nz.n2(x * 0.02, y * 0.02) * 0.03 + nz.n2(x * 0.005 + 3.1, y * 0.005) * 0.01 + (rr() - 0.5) * 0.03;
      const o = (y * W + x) * 4, g = Math.round(255 * Math.min(1, v));
      d[o] = g; d[o + 1] = g; d[o + 2] = g; d[o + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    return (INKF = L);
  }
  function finish(c, W, H_) {
    c.save(); c.globalCompositeOperation = 'multiply'; c.drawImage(inkFilm(W, H_), 0, 0); c.restore();
    H.vignette(c, W, H_, 0.12);
  }
  const header = (c) => plabel(c, 'HOW DOES AI LEARN?', 24, 44, { size: 28 });
  let STILL = null;
  function still(W, H_) {
    if (!STILL) { STILL = H.layer(W, H_); const st = window.STYLES.find((s) => s.id === 'truchet'); H.render(st, STILL, 4.9); }
    return STILL;
  }

  // ---------- scenes ----------
  function sHook(c, W, H_, t) {
    const z = 1.12 - 0.1 * H.ease.out(XS(t, 0, 2.4));   // slow pull-back off the tiling
    c.save(); c.translate(W / 2, H_ / 2); c.scale(z, z); c.translate(-W / 2, -H_ / 2); c.drawImage(still(W, H_), 0, 0); c.restore();
    c.fillStyle = 'rgba(242,233,212,0.35)'; c.fillRect(0, 0, W, H_);
    const k = H.ease.inOut(XS(t, 1.7, 2.3));
    if (k < 1) {
      const pop = H.ease.back(XS(t, 0.15, 0.55));
      c.save(); c.translate(W / 2 + (24 - W / 2) * k, 360 + (44 - 360) * k); c.scale(pop * (1 - (1 - 28 / 46) * k), pop * (1 - (1 - 28 / 46) * k));
      plabel(c, 'HOW DOES AI LEARN?', 0, 0, { size: 46, align: k > 0.5 ? 'left' : 'center' }); c.restore();
    } else header(c);
  }
  function sData(c, W, H_, t) {
    paper(c, W, H_);
    // the model: a block of tiles that keep flipping as examples pour in
    const r = H.rng(55), MXb = 830, MYb = 150, S = 64;
    c.fillStyle = NAVY; c.fillRect(MXb, MYb, 6 * S, 6 * S);
    const turning = [];
    for (let k = 0; k < 36; k++) {
      const o0 = r() < 0.5 ? 0 : 1, tf = 2.8 + r() * 3.2, x = MXb + (k % 6) * S, y = MYb + Math.floor(k / 6) * S;
      const rot = t > tf ? Math.min(1, (t - tf) / 0.15) * Math.PI / 2 : 0;
      if (rot > 0 && rot < Math.PI / 2) turning.push([x, y, o0, rot]);
      else drawTile(c, x, y, S, rot >= Math.PI / 2 ? o0 ^ 1 : o0, null, CREAM, 0);
    }
    // tiles mid quarter-turn: their empty socket prints as a deeper navy
    for (const [x, y, o0, rot] of turning) {
      c.fillStyle = 'rgb(10,15,32)'; c.fillRect(x, y, S, S);
      drawTile(c, x, y, S, o0, NAVY, CREAM, rot);
    }
    plabel(c, 'MODEL', MXb + 192, MYb - 40 + (1 - H.ease.back(XS(t, 2.7, 3.0))) * -60, { size: 30, align: 'center' });
    const rows = [190, 330, 470];
    rows.forEach((y, i) => arrow(c, 30, y + 45, MXb - 12, y + 45, H.ease.out(XS(t, 2.55 + i * 0.08, 2.95 + i * 0.08)), 4));
    c.save(); c.beginPath(); c.rect(0, 0, MXb - 14, H_); c.clip();
    const rr = H.rng(9), K = 34;
    for (let k = 0; k < K; k++) {
      const kind = rr() < 0.5 ? 'cat' : 'dog', ts = 2.6 + 3.0 * Math.pow(k / K, 0.8);
      if (t < ts) continue; const x = -100 + (t - ts) * (560 + k * 18); if (x > MXb) continue;
      exampleTile(c, kind, x, rows[k % 3], 90, kind);
    }
    c.restore();
    if (t >= 2.7) {
      const p = XS(t, 2.75, 5.0), n = p >= 1 ? 1e6 : Math.floor(Math.pow(10, 6 * H.ease.inOut(p))) - 1;
      const w = plabel(c, Math.round(n).toLocaleString('en-US'), 30, 650, { size: 64 });
      plabel(c, 'EXAMPLES', 30 + w + 16, 650, { size: 28, bg: ACC });
    }
    header(c);
    finish(c, W, H_);
  }
  function sLoop(c, W, H_, t) {
    paper(c, W, H_);
    const M = maze();
    const flipK = XS(t, 8.95, 9.25), flipped = flipK >= 1;
    c.fillStyle = NAVY; c.fillRect(MX0, MY0, MC * MS, MR * MS);
    for (let k = 0; k < MC * MR; k++) {
      const [x, y] = tileXY(k), isF = M.flips.includes(k);
      const o = flipped ? M.o2[k] : M.o[k];
      if (isF && flipK > 0 && !flipped) continue;
      drawTile(c, x, y, MS, o, null, CREAM, 0);
    }
    if (flipK > 0 && !flipped) for (const k of M.flips) { // the two weights quarter-turn out of their sockets
      const [x, y] = tileXY(k), rot = H.ease.inOut(flipK) * Math.PI / 2;
      c.fillStyle = 'rgb(10,15,32)'; c.fillRect(x, y, MS, MS);
      drawTile(c, x, y, MS, M.o[k], NAVY, CREAM, rot);
    }
    c.strokeStyle = NAVY; c.lineWidth = 4; c.strokeRect(MX0, MY0, MC * MS, MR * MS);
    // input
    exampleTile(c, 'cat', 70, MY0 + R_IN * MS - 30, 140, null);
    if (t >= 8.0) { // the label's answer, stacked in two printed blocks so it stays legible beside the maze
      plabel(c, 'ANSWER:', 140, MY0 + R_IN * MS + 150, { size: 28, align: 'center', bg: ACC });
      plabel(c, 'CAT', 140, MY0 + R_IN * MS + 208, { size: 28, align: 'center', bg: ACC });
    } else plabel(c, 'NEW', 140, MY0 + R_IN * MS + 150, { size: 28, align: 'center', bg: NAVY });
    arrow(c, 220, MY0 + R_IN * MS + 40, MX0 - 4, MY0 + R_IN * MS + 40, H.ease.out(XS(t, 6.4, 6.6)), 5);
    // outputs
    const outY = (rw) => MY0 + rw * MS + MS / 2;
    arrow(c, MX0 + MC * MS + 4, outY(R_CAT), MX0 + MC * MS + 60, outY(R_CAT), H.ease.out(XS(t, 6.45, 6.65)), 4);
    arrow(c, MX0 + MC * MS + 4, outY(R_DOG), MX0 + MC * MS + 60, outY(R_DOG), H.ease.out(XS(t, 6.5, 6.7)), 4);
    const right = t >= 9.85;
    plabel(c, 'CAT', MX0 + MC * MS + 70, outY(R_CAT), { size: 28, bg: right ? ACC : NAVY });
    plabel(c, 'DOG', MX0 + MC * MS + 70, outY(R_DOG), { size: 28, bg: t >= 7.45 && t < 8.95 ? ACC : NAVY });
    // forward pass #1: the band routes to DOG
    if (t < 8.95) {
      const pr = XS(t, 6.65, 7.45) * M.A.segs.length;
      flowPath(c, M.A.segs, pr, ACC);
      if (t >= 8.45) { // error signal runs back along the wrong path
        const q = (1 - XS(t, 8.45, 8.9)) * M.A.segs.length; const [px, py] = pointOn(M.A.segs, q);
        c.fillStyle = NAVY; c.beginPath(); c.arc(px, py, 15, 0, Math.PI * 2); c.fill(); c.strokeStyle = ACC; c.lineWidth = 4; c.stroke();
      }
    } else {
      const pr = XS(t, 9.35, 9.85) * M.B.segs.length;
      flowPath(c, M.B.segs, pr, ACC);
    }
    const drop = (t0) => (1 - H.ease.back(XS(t, t0, t0 + 0.25))) * -50;
    if (t >= 7.45 && t < 9.85) plabel(c, 'DOG?', MX0 + MC * MS + 70, outY(R_DOG) + 80 + drop(7.45), { size: 28 });
    if (t >= 7.95 && t < 9.85) { // check: stamp a ring + X on the wrong output
      const k = H.ease.out(XS(t, 7.95, 8.15));
      const cx = MX0 + MC * MS + 112, cy = outY(R_DOG);
      c.save(); c.strokeStyle = ACC; c.lineWidth = 7; c.beginPath(); c.arc(cx, cy, 50, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke();
      if (k >= 1) { c.lineWidth = 9; c.beginPath(); c.moveTo(cx - 30, cy - 30); c.lineTo(cx + 30, cy + 30); c.moveTo(cx + 30, cy - 30); c.lineTo(cx - 30, cy + 30); c.stroke(); }
      c.restore();
      const wy = cy - 80 + drop(8.0) * 0.5;
      c.save(); c.font = '400 28px "Rubik Mono One"'; const ww = c.measureText('WRONG').width + 28 * 1.2; c.restore();
      c.fillStyle = CREAM; c.fillRect(cx - 43, wy - 28 * 0.95 - 3, ww + 9, 28 * 1.9 + 9); // knockout so the block prints clean
      plabel(c, 'WRONG', cx - 40, wy, { size: 28, bg: ACC });
    }
    if (t >= 8.85 && t < 9.9) { // adjust: the flipped tiles get ringed
      M.flips.forEach((k) => { const [x, y] = tileXY(k); c.save(); c.strokeStyle = ACC; c.lineWidth = 6; c.setLineDash([10, 7]); c.lineDashOffset = -t * 40; c.strokeRect(x - 5, y - 5, MS + 10, MS + 10); c.restore(); });
      const [fx, fy] = tileXY(M.flips[0]);
      plabel(c, 'ADJUST: FLIP', fx + MS / 2 + 30, fy - 30 + drop(8.9), { size: 28, align: 'center', bg: ACC });
    }
    if (right) {
      plabel(c, 'CAT ✓', MX0 + MC * MS + 70, outY(R_CAT) - 60 + drop(9.85), { size: 28, bg: ACC });
    }
    // loop strip
    const words = ['GUESS', 'CHECK', 'ADJUST'];
    const act = t < 7.45 ? -1 : t < 7.95 ? 0 : t < 8.45 ? 1 : t < 9.35 ? 2 : t < 9.95 ? 0 : Math.floor((t - 9.95) / 0.13) % 3;
    let x = MX0;
    words.forEach((w, i) => { x += plabel(c, w, x, 630, { size: 28, bg: i === act ? ACC : NAVY }) + 12; if (i < 2) { arrow(c, x, 630, x + 40, 630, 1, 5); x += 56; } });
    plabel(c, '↻ ×1M', x + 8, 630, { size: 28, bg: CREAM, fg: NAVY });
    header(c);
    finish(c, W, H_);
  }
  function sProgress(c, W, H_, t) {
    paper(c, W, H_);
    plabel(c, 'ACCURACY', 60, 200, { size: 36 });
    const p = H.ease.inOut(XS(t, 10.9, 12.3)), v = Math.round(61 + 36 * p);
    const punch = t >= 12.3 ? 1 + 0.15 * Math.exp(-(t - 12.3) * 9) : 1;
    c.save(); c.translate(60, 380); c.scale(punch, punch); c.font = '400 120px "Rubik Mono One"'; c.textBaseline = 'middle';
    c.fillStyle = ACC; c.fillText(v + '%', 5, 5); c.fillStyle = NAVY; c.fillText(v + '%', 0, 0);
    const w = c.measureText('97%').width; c.restore();
    if (t >= 12.3) { const k = H.ease.out(XS(t, 12.3, 12.6)); c.save(); c.strokeStyle = ACC; c.lineWidth = 8; c.beginPath(); c.ellipse(60 + w / 2, 380, w / 2 + 40, 105, -0.05, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke(); c.restore(); }
    // bar chart: each bar a stack of tiles laid one by one
    const x0 = 640, y0 = 600, S = 40, n = 12, r = H.rng(4);
    for (let i = 0; i < n; i++) {
      const acc = 61 + 36 * (1 - Math.exp(-i / 3.2)) / (1 - Math.exp(-(n - 1) / 3.2));
      const tiles = Math.round((acc - 45) / 52 * 11);
      let laid = 0; while (laid < tiles && t >= 10.85 + i * 0.11 + laid * 0.025) laid++;
      if (laid) { c.fillStyle = i === n - 1 && t >= 12.3 ? ACC : NAVY; c.fillRect(x0 + i * (S + 7), y0 - laid * S, S, laid * S); }
      for (let k = 0; k < laid; k++) drawTile(c, x0 + i * (S + 7), y0 - (k + 1) * S, S, r() < 0.5 ? 0 : 1, null, CREAM);
    }
    c.fillStyle = NAVY; c.fillRect(x0 - 6, y0 + 4, n * (S + 7) + 6, 4);
    plabel(c, 'TRAINING ROUNDS →', x0, y0 + 46, { size: 28 });
    header(c);
    finish(c, W, H_);
  }
  function sTake(c, W, H_, t) {
    c.drawImage(still(W, H_), 0, 0);
    const k = H.ease.back(XS(t, 13.25, 13.55));
    c.save(); c.translate(W / 2, 360); c.scale(k, k);
    plabel(c, 'MORE EXAMPLES', 0, -46, { size: 44, align: 'center' });
    plabel(c, '→ BETTER GUESSES', 0, 46, { size: 44, align: 'center', bg: ACC });
    c.restore();
  }
  function lay(W, H_, fn, t) { const L = H.layer(W, H_); fn(L.getContext('2d'), W, H_, t); return L; }
  // tiles re-laid: each 80px cell quarter-turns from the old scene to the new one in a diagonal sweep
  function relay(c, W, H_, A, B, t0, t) {
    const S = 80;
    c.fillStyle = NAVY; c.fillRect(0, 0, W, H_);
    for (let j = 0; j < 9; j++) for (let i = 0; i < 16; i++) {
      const ts = t0 + 0.32 * ((i / 16) * 0.7 + (j / 9) * 0.3), k = H.clamp((t - ts) / 0.14);
      const src = k < 0.5 ? A : B, x = i * S, y = j * S;
      c.save(); c.translate(x + S / 2, y + S / 2); c.rotate(k * Math.PI / 2); const sq = Math.abs(Math.cos(k * Math.PI)) * 0.25 + 0.75; c.scale(k > 0 && k < 1 ? sq : 1, k > 0 && k < 1 ? sq : 1);
      c.rotate(-(k < 0.5 ? 0 : 1) * Math.PI / 2 * 0); c.drawImage(src, x, y, S, S, -S / 2, -S / 2, S, S); c.restore();
    }
  }
  function explainTR(ctx, W, H_, t) {
    const scenes = [[0, sHook], [2.45, sData], [6.0, sLoop], [10.5, sProgress], [13.0, sTake]];
    let idx = 0; for (let i = 0; i < scenes.length; i++) if (t >= scenes[i][0]) idx = i;
    const t0 = scenes[idx][0];
    if (idx > 0 && t < t0 + 0.5) relay(ctx, W, H_, lay(W, H_, scenes[idx - 1][1], t0 - 0.01), lay(W, H_, scenes[idx][1], t), t0, t);
    else scenes[idx][1](ctx, W, H_, t);
    H.grain(ctx, W, H_, 0.05, 5 + Math.floor(t * 12));
  }

  registerStyle({
    id: 'truchet',
    name: 'Multi-scale Truchet',
    category: 'Generative & Type',
    description: 'Bold two-ink multi-scale Truchet tiling of winged quarter-circle tiles whose paths flow continuously across three scales; a third ink fills only the closed regions that fall inside the letters "AI", so the word surfaces from the maze.',
    motion: 'Big tiles are laid in a diagonal sweep, then each scale subdivides in turn (paths re-routing as detail arrives); then the accent screen is pulled across and slides into register, revealing AI.',
    fonts: ['400 540px "Rubik Mono One"', '400 20px "Rubik Mono One"'],
    duration: 5,
    frameT: 4.9,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'The model is a Truchet maze whose tiles are its weights: an input band routes to the wrong output, the error runs back along the path and two tiles quarter-turn to re-route it; scenes change by re-laying the tiles in a diagonal sweep, labels are printed blocks with misregistered accent, and the accuracy chart is built from stacked tiles.',
    explainer(ctx, W, H_, t) { explainTR(ctx, W, H_, t); },
    // Sound: ceramic tiles. A tile turning into place is a short scrape and a hard clack; the scene re-lay is a domino
    // run of clacks sweeping left to right with the diagonal; the ink band travelling through the maze is a marble
    // rolling through a tile run (soft rumble, a click at each tile it crosses, taken from the real maze path); printed
    // labels land with a dull block thump; the payoffs are wooden marimba notes. Timings mirror explainTR / sHook..sTake.
    explainerSound(k) {
      const D = 14.5, E = H.ease, M = maze();
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      const back = (t0, d) => when(t0, t0 + d, E.back, 1);
      // ceramic tile clack: bright hard tick + hollow body
      const clack = (t, g, p, f = 640) => { k.noise(t, { dur: 0.018, filter: 'bandpass', f: 2100, q: 2.5, gain: 0.26 * g, a: 0.001, pan: p }); k.tone(t, { f: [[0, f], [0.04, f * 0.85]], dur: 0.06, gain: 0.1 * g, a: 0.001, pan: p }); };
      const turn = (t, dur, g, p) => k.noise(t, { dur, filter: 'bandpass', f: [[0, 900], [dur, 1500]], q: 1.4, gain: 0.07 * g, a: dur * 0.6, pan: p }); // tile scraping round
      // printed label block landing
      const block = (t, g, p) => { k.tone(t, { f: [[0, 170], [0.06, 110]], dur: 0.09, gain: 0.22 * g, a: 0.002, pan: p }); k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1100, q: 1, gain: 0.1 * g, a: 0.001, pan: p }); };
      const marimba = (t, n, g, p) => { const f = k.hz(n); k.tone(t, { f, dur: 0.7, gain: 0.16 * g, a: 0.002, verb: 0.2, pan: p }); if (f * 4 < 2500) k.tone(t, { f: f * 4, dur: 0.07, gain: 0.04 * g, a: 0.001, pan: p }); k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1500, q: 1, gain: 0.05 * g, pan: p }); };
      const zip = (t, dur, p) => k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 600], [dur, 1500]], q: 1.4, gain: 0.06, a: dur * 0.5, pan: p, minor: true });
      // re-lay: cell (i,j) starts at t0 + 0.32 (0.7 i/16 + 0.3 j/9) and lands 0.14 s later -> a domino run left to right
      const relay = (t0) => {
        k.noise(t0 + 0.05, { dur: 0.45, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.45, 1300]], q: 0.8, gain: 0.09, a: 0.15 });
        k.withMinor(() => { for (let i = 0; i < 16; i += 1) { const tl = t0 + 0.14 + 0.32 * (0.7 * i / 16 + 0.15); clack(tl, 0.55 + 0.25 * ((i * 7) % 3) / 2, pan(i * 80 + 40), 560 + ((i * 5) % 4) * 40); } });
        clack(t0 + 0.47, 0.9, 0.6, 520); // last corner settles
      };
      // the band rolling through the maze: rumble + a click per tile crossed, panned with the tile
      const roll = (segs, t0, t1, rev, g = 1) => {
        const d = t1 - t0, n = segs.length;
        k.noise(t0, { dur: d, color: 'brown', filter: 'lowpass', f: 420, gain: 0.14 * g, a: 0.06, hold: d - 0.12, pan: pan(MX0 + (rev ? MC * MS : 0)) });
        k.withMinor(() => { for (let q = 1; q < n; q++) { const s = segs[rev ? n - 1 - q : q], t = t0 + (q / n) * d; k.noise(t, { dur: 0.014, filter: 'bandpass', f: 1500 + (q % 3) * 150, q: 2, gain: 0.12 * g, a: 0.001, pan: pan(MX0 + s.i * MS + MS / 2) }); k.tone(t, { f: rev ? 420 - q * 8 : 300 + q * 8, dur: 0.035, gain: 0.05 * g, pan: pan(MX0 + s.i * MS + MS / 2) }); } });
      };
      const outX = MX0 + MC * MS + 100;

      k.bed('room', 0, D, { gain: 0.3 });

      // ---- hook: title block pops (back 0.15-0.55), slides into the corner (1.7-2.3)
      block(back(0.15, 0.4), 1.2, 0); clack(back(0.15, 0.4), 0.5, 0, 500);
      k.noise(1.7, { dur: 0.6, color: 'pink', filter: 'lowpass', f: [[0, 600], [0.6, 260]], gain: 0.028, a: 0.25, minor: true });

      // ---- data: re-lay, arrows, MODEL, tiles of the model flip as examples pour in (same rng(55) draws), counter
      relay(2.45);
      [0, 1, 2].forEach((i) => zip(2.55 + i * 0.08, 0.4, -0.4 + i * 0.05));
      block(back(2.7, 0.3), 0.8, pan(1020));
      { const r = H.rng(55), flips = [];
        for (let c = 0; c < 36; c++) { r(); const tf = 2.8 + r() * 3.2; if (tf + 0.15 < 6.0) flips.push([tf, c]); }
        flips.sort((a, b) => a[0] - b[0]); let last = -1;
        flips.forEach(([tf, c]) => { if (tf - last < 0.14) return; last = tf; k.withMinor(() => clack(tf + 0.15, 0.6, pan(830 + (c % 6) * 64 + 32), 600 + (c % 4) * 30)); }); }
      { let prev = 0, last = -1; for (let t = 2.76; t <= 4.98; t += 0.002) { const s = Math.floor(E.inOut(XS(t, 2.75, 5.0)) * 30); if (s !== prev && t - last >= 1 / 8) { k.play('tock', t, { f: 380, gain: 0.3, pan: -0.6, minor: true }); last = t; } prev = s; } }
      block(5.0, 1.4, -0.5); clack(5.0, 1, -0.5, 480); // 1,000,000 set down

      // ---- loop: re-lay, arrows, band rolls to DOG, wrong, error rolls back, two tiles turn, band rolls to CAT
      relay(6.0);
      zip(6.4, 0.2, -0.4); zip(6.45, 0.2, 0.55); zip(6.5, 0.2, 0.55);
      roll(M.A.segs, 6.65, 7.45, false);
      marimba(7.45, 'G3', 0.8, pan(outX)); block(back(7.45, 0.25), 0.7, pan(outX)); // lands on DOG, DOG? tag
      k.noise(7.95, { dur: 0.2, filter: 'bandpass', f: [[0, 700], [0.2, 1200]], q: 1.2, gain: 0.07, a: 0.12, pan: pan(outX), minor: true }); // ring drawn
      block(back(8.0, 0.25), 0.8, pan(outX));
      k.play('thud', 8.15, { f: 120, gain: 0.6, pan: pan(outX) }); marimba(8.15, 'F#3', 0.8, pan(outX)); marimba(8.3, 'C3', 0.8, pan(outX)); // X: wrong
      roll(M.A.segs, 8.45, 8.9, true, 0.9); // error runs back along the path
      block(back(8.9, 0.25), 0.7, pan(MX0 + (M.flips[0] % MC) * MS));
      M.flips.forEach((f, i) => { const p = pan(MX0 + (f % MC) * MS + MS / 2); turn(8.95 + i * 0.02, 0.3, 1, p); clack(9.25 + i * 0.018, 1.1, p, 560 - i * 50); }); // adjust: flip
      roll(M.B.segs, 9.35, 9.85, false);
      block(back(9.85, 0.25), 0.8, pan(outX));
      marimba(9.85, 'C4', 1, pan(outX)); marimba(9.93, 'G4', 0.9, pan(outX)); marimba(10.01, 'C5', 0.8, pan(outX)); // CAT ✓

      // ---- progress: re-lay, tile columns stack (tk = 10.85 + i*0.11), counter, 97%
      relay(10.5);
      k.withMinor(() => { for (let i = 0; i < 12; i++) { const acc = 61 + 36 * (1 - Math.exp(-i / 3.2)) / (1 - Math.exp(-11 / 3.2)), n = Math.round((acc - 45) / 52 * 11); clack(10.85 + i * 0.11, 0.55, pan(640 + i * 47), 420 + n * 18); if (n > 4) clack(10.85 + i * 0.11 + (n - 1) * 0.025, 0.3, pan(640 + i * 47), 520 + n * 18); } });
      { let prev = 0, last = -1; for (let t = 10.91; t <= 12.28; t += 0.002) { const s = Math.floor(E.inOut(XS(t, 10.9, 12.3)) * 36), near = ((t - 10.85) % 0.11) < 0.05; if (s !== prev && !near && t - last >= 1 / 7) { k.play('tock', t, { f: 380, gain: 0.28, pan: -0.6, minor: true }); last = t; } prev = s; } }
      k.play('impact', 12.3, { gain: 1.1, pan: -0.4 });
      clack(12.3, 1.3, -0.4, 450);
      ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => marimba(12.33 + i * 0.03, n, 1.1, (i - 1.5) * 0.25)); // the 97% hit
      k.noise(12.3, { dur: 0.3, filter: 'bandpass', f: [[0, 700], [0.3, 1200]], q: 1.2, gain: 0.06, a: 0.15, pan: -0.4, minor: true }); // ring drawn

      // ---- takeaway: re-lay into the tiling, labels pop, resolving marimba
      relay(13.0);
      const tk = back(13.25, 0.3);
      block(tk, 1.2, 0);
      ['G3', 'C4', 'E4', 'G4', 'C5'].forEach((n, i) => marimba(tk + 0.06 + i * 0.07, n, 0.65 - i * 0.04, (i - 2) * 0.2));
    },
    draw(ctx, W, H_, t) {
      const r = H.rng(808);
      // ---------- letter mask ----------
      const ml = H.layer(W, H_), mc = ml.getContext('2d');
      mc.fillStyle = '#000'; mc.fillRect(0, 0, W, H_);
      mc.fillStyle = '#fff'; mc.textAlign = 'center'; mc.textBaseline = 'alphabetic';
      mc.font = '400 540px "Rubik Mono One"';
      try { mc.letterSpacing = "10px"; } catch (e) {}
      mc.textBaseline = 'middle';
      mc.fillText("AI", W / 2 + 6, 372);
      const md = mc.getImageData(0, 0, W, H_).data;
      const inMask = (x, y) => { x = x | 0; y = y | 0; if (x < 0 || y < 0 || x >= W || y >= H_) return 0; return md[(y * W + x) * 4] > 127 ? 1 : 0; };

      // ---------- quadtree of tiles ----------
      const S0 = 160, tiles = [];
      const flipPhase = 1.8; // fixed: keeps the finished tiling identical to the approved still
      function classify(x, y, s) {
        let n = 0, k = 0;
        for (let j = 0; j <= 6; j++) for (let i = 0; i <= 6; i++) { n++; k += inMask(x + (i / 6) * s, y + (j / 6) * s); }
        return k === 0 ? 0 : k === n ? 2 : 1; // 0 out, 1 edge, 2 inside
      }
      function build(x, y, s, L) {
        const c = classify(x, y, s);
        const pRand = [0.55, 0.32, 0.12][L] || 0;
        let split = false;
        if (L < 3 && c === 1) split = true;            // letter edges: refine to the smallest scale
        else if (L < 3 && c === 2) split = true;        // letter interiors: finest scale too
        else if (L < 2 && r() < pRand) split = true;
        else if (L === 2 && c === 0 && r() < 0.08) split = true;
        if (split) {
          const h = s / 2;
          build(x, y, h, L + 1); build(x + h, y, h, L + 1); build(x, y + h, h, L + 1); build(x + h, y + h, h, L + 1);
        } else {
          // orientation: seeded, with a slow wave of flips for animation
          const base = r() < 0.5 ? 0 : 1;
          const flip = Math.sin(x * 0.004 + y * 0.003 - flipPhase) > 0.985 ? 1 : 0;
          tiles.push({ x, y, s, L, o: base ^ flip });
        }
      }
      const oy = -(S0 * 5 - H_) / 2;
      for (let j = 0; j < 5; j++) for (let i = 0; i < 8; i++) build(i * S0, oy + j * S0, S0, 0);
      // balance the quadtree: neighbouring tiles may differ by at most one level, otherwise the
      // winged edge patterns can't meet (Carlson's construction relies on 1-level steps)
      const F = 20, GX = W / F, GY = Math.ceil((S0 * 5) / F);
      for (let pass = 0; pass < 6; pass++) {
        const grid = new Int8Array(GX * GY);
        for (const T of tiles) {
          const gx0 = Math.round(T.x / F), gy0 = Math.round((T.y - oy) / F), n = Math.round(T.s / F);
          for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) grid[(gy0 + j) * GX + gx0 + i] = T.L;
        }
        const at = (i, j) => (i < 0 || j < 0 || i >= GX || j >= GY ? -1 : grid[j * GX + i]);
        let changed = false;
        const next = [];
        for (const T of tiles) {
          const gx0 = Math.round(T.x / F), gy0 = Math.round((T.y - oy) / F), n = Math.round(T.s / F);
          let mx = -1;
          for (let k = 0; k < n; k++) { mx = Math.max(mx, at(gx0 - 1, gy0 + k), at(gx0 + n, gy0 + k), at(gx0 + k, gy0 - 1), at(gx0 + k, gy0 + n)); }
          if (mx > T.L + 1) {
            changed = true;
            const h = T.s / 2;
            for (const [dx, dy] of [[0, 0], [h, 0], [0, h], [h, h]]) next.push({ x: T.x + dx, y: T.y + dy, s: h, L: T.L + 1, o: r() < 0.5 ? 0 : 1 });
          } else next.push(T);
        }
        tiles.length = 0; tiles.push(...next);
        if (!changed) break;
      }
      tiles.sort((a, b) => a.L - b.L);

      // ---------- build: which scale is visible where (tiles laid on twos) ----------
      const tq = Math.floor(t * 15) / 15;
      const st0 = [0.1, 0.95, 1.55, 2.1], stD = [0.8, 0.55, 0.5, 0.5];
      const startAt = (l, ax, ay, s) => st0[l] + stD[l] * (((ax + s / 2) / W) * 0.65 + ((ay + s / 2 - oy) / 800) * 0.35);
      const hashO = (x, y, s) => (H.rng(((x + 1000) * 7919 + (y + 1000) * 104729 + s * 31) >>> 0)() < 0.5 ? 0 : 1);
      const shown = new Map();
      for (const T of tiles) {
        let pick = null;
        for (let l = T.L; l >= 0; l--) {
          const sl = S0 / (1 << l), ax = Math.floor(T.x / sl) * sl, ay = oy + Math.floor((T.y - oy) / sl) * sl;
          const st = startAt(l, ax, ay, sl);
          if (tq >= st) { pick = l === T.L ? { ...T, age: tq - st } : { x: ax, y: ay, s: sl, L: l, o: hashO(ax, ay, sl), age: tq - st }; break; }
        }
        if (pick) shown.set(pick.L + ':' + pick.x + ':' + pick.y, pick);
      }
      // hold: a few large tiles outside the word make a quarter-turn (orientation flip)
      const flips = [[0, 2], [7, 1], [6, 3], [1, 0]];
      const disp = [...shown.values()].sort((a, b) => a.L - b.L);
      for (const T of disp) {
        if (T.L !== 0) continue;
        const fi = flips.findIndex(([i, j]) => T.x === i * S0 && T.y === oy + j * S0);
        if (fi < 0) continue;
        const k = H.clamp((t - (3.55 + fi * 0.09)) / 0.2);
        T.rot = H.ease.inOut(k) * Math.PI / 2;
      }

      // ---------- draw the two-ink tiling (dark/light only) ----------
      const lay = H.layer(W, H_), lc = lay.getContext('2d');
      lc.fillStyle = `rgb(${C_LIGHT[0]},${C_LIGHT[1]},${C_LIGHT[2]})`; lc.fillRect(0, 0, W, H_); // bare paper
      const ink = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
      for (const T of disp) {
        const fill = T.L % 2 ? C_LIGHT : C_DARK, path = T.L % 2 ? C_DARK : C_LIGHT;
        const { x, y, s } = T;
        lc.save();
        const pop = T.age < 0.07 ? 0.86 : 1;   // freshly laid tile settles in (2 frames)
        if (pop !== 1 || T.rot) { lc.translate(x + s / 2, y + s / 2); if (T.rot) lc.rotate(T.rot); lc.scale(pop, pop); lc.translate(-x - s / 2, -y - s / 2); }
        lc.fillStyle = ink(fill); lc.fillRect(x, y, s, s);
        // wings
        lc.beginPath();
        [[x, y], [x + s, y], [x, y + s], [x + s, y + s]].forEach(([px, py]) => { lc.moveTo(px + s / 3, py); lc.arc(px, py, s / 3, 0, TAU); });
        lc.fill();
        // bands
        lc.strokeStyle = ink(path); lc.lineWidth = s / 3; lc.lineCap = 'butt';
        lc.beginPath();
        if (T.o === 0) { lc.arc(x, y, s / 2, 0, Math.PI / 2); lc.moveTo(x + s - s / 2, y + s); lc.arc(x + s, y + s, s / 2, Math.PI, Math.PI * 1.5); }
        else { lc.moveTo(x + s, y + s / 2); lc.arc(x + s, y, s / 2, Math.PI / 2, Math.PI); lc.moveTo(x + s / 2, y + s); lc.arc(x, y + s, s / 2, -Math.PI / 2, 0); }
        lc.stroke();
        lc.restore();
      }
      const src = lc.getImageData(0, 0, W, H_).data;

      // ---------- flood-label light regions; flag those inside the letters ----------
      const N = W * H_;
      const gv = new Float32Array(N), lab = new Int32Array(N).fill(-1);
      const dl = C_LIGHT[0] - C_DARK[0];
      for (let i = 0; i < N; i++) gv[i] = H.clamp((src[i * 4] - C_DARK[0]) / dl);
      const stack = new Int32Array(N);
      const cnt = [], inC = [];
      let nl = 0;
      for (let i = 0; i < N; i++) {
        if (lab[i] !== -1 || gv[i] < 0.5) continue;
        let sp = 0; stack[sp++] = i; lab[i] = nl; let c = 0, k = 0;
        while (sp) {
          const p = stack[--sp]; c++; k += md[p * 4] > 127 ? 1 : 0;
          const x = p % W;
          if (x > 0 && lab[p - 1] === -1 && gv[p - 1] >= 0.5) { lab[p - 1] = nl; stack[sp++] = p - 1; }
          if (x < W - 1 && lab[p + 1] === -1 && gv[p + 1] >= 0.5) { lab[p + 1] = nl; stack[sp++] = p + 1; }
          if (p >= W && lab[p - W] === -1 && gv[p - W] >= 0.5) { lab[p - W] = nl; stack[sp++] = p - W; }
          if (p < N - W && lab[p + W] === -1 && gv[p + W] >= 0.5) { lab[p + W] = nl; stack[sp++] = p + W; }
        }
        cnt.push(c); inC.push(k); nl++;
      }
      const flag = new Uint8Array(nl);
      // letters fill in over time (animation); at frameT all flagged
      const reveal = 1;
      for (let i = 0; i < nl; i++) flag[i] = inC[i] / cnt[i] > 0.5 && cnt[i] < 60000 && ((i * 2654435761) % 1000) / 1000 < reveal * 1.01 ? 1 : 0;
      // per-tile letter flag (finest tile wins): regions mostly inside the word take the
      // accent whole; long paths that cross the letter edge are cut at the tile boundary
      const fl = H.layer(W, H_), fc = fl.getContext('2d');
      fc.fillStyle = '#000'; fc.fillRect(0, 0, W, H_);
      for (const T of tiles) { fc.fillStyle = inMask(T.x + T.s / 2, T.y + T.s / 2) ? '#fff' : '#000'; fc.fillRect(T.x, T.y, T.s, T.s); }
      const fd = fc.getImageData(0, 0, W, H_).data;
      const accentAt = (p) => {
        const L0 = lab[p];
        if (L0 >= 0 && flag[L0]) return 1;
        if (L0 >= 0 && inC[L0] / cnt[L0] > 0.9) return 0;
        return fd[p * 4] > 127 ? 1 : 0;
      };
      const accentAtOld = (p) => {
        let L = lab[p];
        if (L >= 0) return flag[L];
        const x = p % W;
        if (x > 0 && lab[p - 1] >= 0) return flag[lab[p - 1]];
        if (x < W - 1 && lab[p + 1] >= 0) return flag[lab[p + 1]];
        if (p >= W && lab[p - W] >= 0) return flag[lab[p - W]];
        if (p < N - W && lab[p + W] >= 0) return flag[lab[p + W]];
        return 0;
      };

      // ---------- composite as a 3-colour screen print ----------
      const out = ctx.createImageData(W, H_), d = out.data;
      const nz = H.makeNoise(17), rr = H.rng(3);
      // accent screen: pulled left->right by the squeegee, then slides into (mis)register
      const pull = H.ease.inOut(H.clamp((t - 2.75) / 0.6));
      const xw = -40 + 1360 * pull;
      const reg = H.ease.out(H.clamp((t - 3.0) / 0.9));
      const MX = Math.round(2 + 16 * (1 - reg)), MY = Math.round(1 + 9 * (1 - reg));
      for (let y = 0; y < H_; y++) {
        for (let x = 0; x < W; x++) {
          const p = y * W + x;
          const g = gv[p];
          // accent screen is offset: look up the flag at the shifted position
          const sx = Math.min(W - 1, Math.max(0, x - MX)), sy = Math.min(H_ - 1, Math.max(0, y - MY));
          const accHere = accentAt(sy * W + sx);
          const gs = gv[sy * W + sx];
          let Lc = C_LIGHT;
          // accent ink lays where the shifted light region is flagged
          let ar = 0;
          const pulled = accHere && x < xw + (y - 360) * 0.25;
          if (pulled) ar = H.clamp(gs * 1.2);
          const ink1 = 1 + nz.n2(x * 0.02, y * 0.02) * 0.03 + (rr() - 0.5) * 0.05; // ink film unevenness
          let R = C_DARK[0] + (C_LIGHT[0] - C_DARK[0]) * g, G = C_DARK[1] + (C_LIGHT[1] - C_DARK[1]) * g, B = C_DARK[2] + (C_LIGHT[2] - C_DARK[2]) * g;
          if (ar > 0) {
            // accent printed under the dark ink: multiply-ish over light, hidden under dark
            const a = ar * (0.15 + 0.85 * g);
            R = R + (C_ACC[0] * (R / 255) * 1.04 - R) * a; G = G + (C_ACC[1] * (G / 255) * 1.04 - G) * a; B = B + (C_ACC[2] * (B / 255) * 1.04 - B) * a;
          }
          if (pulled) { // navy inside the letters warms toward the accent (accent printed under a translucent navy)
            const lift = (1 - g) * 0.3;
            R += (C_ACC[0] * 0.55 - R) * lift; G += (C_ACC[1] * 0.55 - G) * lift; B += (C_ACC[2] * 0.55 - B) * lift;
          }
          const o = p * 4;
          d[o] = R * ink1; d[o + 1] = G * ink1; d[o + 2] = B * ink1; d[o + 3] = 255;
        }
      }
      ctx.putImageData(out, 0, 0);
      H.grain(ctx, W, H_, 0.05, 5 + Math.floor(t * 12));
      H.vignette(ctx, W, H_, 0.12);
    },
  });
}
```
