I want an animated explainer made in the "Ballpoint Notebook" visual style (Hand-Drawn). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Fredoka, Gloria Hallelujah
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Gloria+Hallelujah&display=block">
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
Name: Ballpoint Notebook
Family: Hand-Drawn
Look: A blue Bic doodle in the back of a college-ruled notebook: dense crosshatching for darks, pressure-varied lines with ink blobs where strokes start, bubble lettering with a hatched drop shadow and compulsive margin doodles.
Motion: Lines scratch on stroke by stroke, then layers of crosshatching build up the shadows pass by pass, while the margin doodles get traced over and over.
How it explains: Doodled down one long college-ruled page: the pen draws while the camera scrolls along and then down the page, headings are bubble letters with crosshatched shadows, boxes get hatched drop-shadows, a red pen marks the wrong guess, and counters are re-inked in bubble numerals.

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

REFERENCE STYLE SOURCE (styles/ballpoint-notebook.js; W/H_ are always 1280x720)
```js
// Ballpoint Notebook — blue Bic doodle on college-ruled paper.
{
  const seg = (pts, step = 2.5) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
      for (let j = 0; j < n; j++) out.push([x0 + (x1 - x0) * j / n, y0 + (y1 - y0) * j / n]);
    }
    out.push(pts[pts.length - 1]);
    return out;
  };
  const normals = (P) => P.map((p, i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    return [-dy / d, dx / d];
  });
  const wob = (pts, nz, seed, amp = 1.0, freq = 0.02) => {
    const N = normals(pts); let L = 0;
    return pts.map((p, i) => {
      if (i) L += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      const o = nz.n2(L * freq + seed * 1.37, seed * 0.71) * amp + nz.n2(L * freq * 6 + seed, seed + 3.3) * amp * 0.3;
      return [p[0] + N[i][0] * o, p[1] + N[i][1] * o];
    });
  };
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2) => {
    const n = Math.max(10, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 2.5)), out = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return out;
  };
  const bez = (p0, p1, p2, p3, n = 40) => {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, m = 1 - t;
      out.push([m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
        m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]);
    }
    return out;
  };
  const INK = [30, 46, 150];

  // >>>XE-ENGINE
  // ===================== explainer story engine (shared script: "How does AI learn?") =====================
  // Builds the diagram as timed world-space strokes/texts; each style renders them with its own medium.
  const XC = {}; // cache for static textures (output still depends only on t)
  const XE = (() => {
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const win = (t, a, b) => clamp((t - a) / (b - a));
    const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const camAt = (keys, t) => {
      if (t <= keys[0][0]) return keys[0].slice(1);
      for (let i = 0; i < keys.length - 1; i++) {
        const a = keys[i], b = keys[i + 1];
        if (t <= b[0]) {
          const u = eio((t - a[0]) / Math.max(1e-6, b[0] - a[0]));
          return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * u)];
        }
      }
      return keys[keys.length - 1].slice(1);
    };
    const circ = (x, y, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 0) => {
      n = n || Math.max(12, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 6)); const o = [];
      for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry]); }
      return o;
    };
    const quad = (p0, p1, p2, n = 30) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, m = 1 - t; o.push([m * m * p0[0] + 2 * m * t * p1[0] + t * t * p2[0], m * m * p0[1] + 2 * m * t * p1[1] + t * t * p2[1]]); } return o; };
    const cubic = (p0, p1, p2, p3, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, m = 1 - t; o.push([m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0], m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]); } return o; };
    const rrect = (x, y, w, h, r) => {
      const o = [[x + r, y], [x + w - r, y]]; o.push(...circ(x + w - r, y + r, r, r, -Math.PI / 2, 0, 5).slice(1));
      o.push([x + w, y + h - r]); o.push(...circ(x + w - r, y + h - r, r, r, 0, Math.PI / 2, 5).slice(1));
      o.push([x + r, y + h]); o.push(...circ(x + r, y + h - r, r, r, Math.PI / 2, Math.PI, 5).slice(1));
      o.push([x, y + r]); o.push(...circ(x + r, y + r, r, r, Math.PI, Math.PI * 1.5, 5).slice(1));
      o.push([x + r + 6, y - 1]); return o;
    };
    const head = (P, len = 20, spread = 0.5) => {
      const a = P[P.length - 1], b = P[Math.max(0, P.length - 4)], an = Math.atan2(a[1] - b[1], a[0] - b[0]);
      return [[a[0] - Math.cos(an - spread) * len, a[1] - Math.sin(an - spread) * len], a, [a[0] - Math.cos(an + spread) * len, a[1] - Math.sin(an + spread) * len]];
    };
    const cat = (x, y, s) => [
      circ(x, y + 0.06 * s, 0.3 * s, 0.27 * s, -1.2, 5.1),
      [[x - 0.27 * s, y - 0.02 * s], [x - 0.24 * s, y - 0.34 * s], [x - 0.07 * s, y - 0.2 * s]],
      [[x + 0.07 * s, y - 0.2 * s], [x + 0.24 * s, y - 0.34 * s], [x + 0.27 * s, y - 0.02 * s]],
      [[x - 0.03 * s, y + 0.1 * s], [x, y + 0.13 * s], [x + 0.03 * s, y + 0.1 * s]],
      [[x - 0.12 * s, y + 0.12 * s], [x - 0.36 * s, y + 0.08 * s]], [[x - 0.12 * s, y + 0.16 * s], [x - 0.35 * s, y + 0.2 * s]],
      [[x + 0.12 * s, y + 0.12 * s], [x + 0.36 * s, y + 0.08 * s]], [[x + 0.12 * s, y + 0.16 * s], [x + 0.35 * s, y + 0.2 * s]],
    ];
    const dog = (x, y, s) => [
      circ(x, y + 0.04 * s, 0.26 * s, 0.28 * s, -1.4, 4.9),
      circ(x - 0.29 * s, y + 0.04 * s, 0.09 * s, 0.2 * s, 0, 6.4),
      circ(x + 0.29 * s, y + 0.04 * s, 0.09 * s, 0.2 * s, 0, 6.4),
      circ(x, y + 0.15 * s, 0.07 * s, 0.045 * s, 0, 6.4),
      [[x - 0.08 * s, y + 0.23 * s], [x, y + 0.26 * s], [x + 0.08 * s, y + 0.23 * s]],
    ];
    const eyes = (x, y, s, dy = 0.02) => [[x - 0.1 * s, y + dy * s], [x + 0.1 * s, y + dy * s]];
    const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // L: layout options. mode: 'same' (progress drawn where the loop was) | 'below' | 'right'
    // model(cx, cy, adj, add): style supplies its model drawing; adj 0..1 = how far the knobs have been adjusted.
    const story = (t, L) => {
      const items = [];
      const line = (pts, role, w, a, b, g) => items.push({ k: 'line', pts, role, w, a, b, g });
      const text = (s, x, y, size, font, role, a, b, opt = {}) => items.push({ k: 'text', s, x, y, size, font, role, a, b, rot: opt.rot || 0, align: opt.align || 'left', g: opt.g });
      const dot = (x, y, r, role, a, g) => items.push({ k: 'dot', x, y, r, role, a, b: a + 0.05, g });
      const S = L.s || 1;
      // ---- 1 HOOK ----
      const TX = L.titleX ?? 640, TY = L.titleY ?? 350;
      text('How does AI learn?', TX, TY, 84 * S, 'title', 'ink', 0.15, 1.3, { align: 'center', rot: -0.015, g: 'A' });
      line([[TX - 330 * S, TY + 32 * S], [TX + 330 * S, TY + 24 * S]], 'acc1', 7, 1.3, 1.55, 'A');
      // ---- 2 DATA ----
      const MX = L.modelX ?? 2250, MY = L.modelY ?? 640;
      const mAdj = eio(win(t, 8.95, 9.5));
      L.model(MX, MY, mAdj, (it) => { it.g = it.g || 'M'; items.push(it); }, { line, text, dot }, t);
      text(L.modelName || 'model', MX, MY + 228, 38, 'label', 'ink', 3.15, 3.4, { align: 'center', g: 'M' });
      const CS = 118, cx0 = MX - 870, cy0 = MY - 175;
      for (let i = 0; i < 6; i++) {
        const col = i % 3, row = (i / 3) | 0, x = cx0 + col * 150 + (row ? 40 : 0), y = cy0 + row * 170, isCat = [1, 0, 1, 1, 0, 0][i];
        const a = 3.0 + i * 0.17;
        line(rrect(x - CS / 2, y - CS / 2, CS, CS, 12), 'ink', 4, a, a + 0.12, 'B');
        (isCat ? cat : dog)(x, y - 6, CS * 0.82).forEach((p) => line(p, 'ink', 3.2, a + 0.1, a + 0.22, 'B'));
        eyes(x, y - 6, CS * 0.82).forEach(([ex, ey]) => dot(ex, ey, 3.2, 'ink', a + 0.22, 'B'));
        // label tag hanging off the card
        const tx = x + 18, ty = y + CS / 2 - 4;
        line([[tx, ty], [tx + 70, ty], [tx + 84, ty + 19], [tx + 70, ty + 38], [tx, ty + 38], [tx, ty]], isCat ? 'acc1' : 'acc3', 3, a + 0.2, a + 0.3, 'B');
        text(isCat ? 'cat' : 'dog', tx + 8, ty + 30, 31, 'label', isCat ? 'acc1' : 'acc3', a + 0.28, a + 0.36, { g: 'B' });
      }
      // flow arrow into the model
      const fa = cubic([cx0 + 370, MY - 10], [cx0 + 470, MY - 60], [MX - 260, MY - 40], [MX - 165, MY - 10]);
      line(fa, 'ink', 5, 4.15, 4.45, 'B'); line(head(fa, 24), 'ink', 5, 4.45, 4.55, 'B');
      // little example cards streaming along the arrow
      if (t > 4.5 && t < 6.2) {
        for (let k = 0; k < 9; k++) {
          const u = ((t - 4.5) * 0.9 + k / 9) % 1, ix = Math.min(fa.length - 1, Math.floor(u * fa.length));
          const [px, py] = fa[ix], sz = 26 * (1 - 0.5 * u);
          if (t - 4.5 < k / 9 / 0.9) continue;
          items.push({ k: 'line', pts: rrect(px - sz / 2, py - sz / 2 - 18, sz, sz, 4), role: k % 2 ? 'acc1' : 'acc3', w: 2.5, a: -1, b: 0, g: 'F', inst: true });
        }
      }
      // counter (numerals redrawn on twos)
      if (t > 4.5) {
        const u = win(Math.floor(t * 12) / 12, 4.55, 5.25), n = u >= 1 ? 1e6 : (Math.pow(10, u * 6) - 1) / (1e6 - 1) * 1e6;
        items.push({ k: 'text', s: fmt(n), x: cx0 + 150, y: cy0 + 425, size: 76, font: 'num', role: 'ink', a: -1, b: 0, align: 'center', g: 'B', inst: true, live: true });
        text('examples', cx0 + 150, cy0 + 472, 36, 'label', 'ink', 4.55, 4.8, { align: 'center', g: 'B' });
      }
      if (L.model2At) L.model(MX, MY, mAdj, (it) => { it.g = 'M2'; if (!it.inst) { it.a += L.model2At - 2.5; it.b += L.model2At - 2.5; } items.push(it); }, { line: (p, r, w, a, b) => line(p, r, w, a + L.model2At - 2.5, b + L.model2At - 2.5, 'M2'), text: (s2, x, y, sz, f, r, a, b, o = {}) => text(s2, x, y, sz, f, r, a + L.model2At - 2.5, b + L.model2At - 2.5, { ...o, g: 'M2' }), dot }, t - (L.model2At - 2.5));
      // ---- 3 GUESS -> CHECK -> ADJUST ----
      const qx = MX, qy = MY - 300;
      line(rrect(qx - 62, qy - 62, 124, 124, 12), 'acc2', 4, 6.4, 6.55, 'C');
      cat(qx, qy - 4, 100).forEach((p) => line(p, 'ink', 3.2, 6.5, 6.7, 'C'));
      eyes(qx, qy - 4, 100).forEach(([ex, ey]) => dot(ex, ey, 3, 'ink', 6.7, 'C'));
      text('new!', qx + 72, qy - 30, 30, 'label', 'acc2', 6.65, 6.8, { g: 'C' });
      const dn = [[qx, qy + 70], [qx + 2, MY - 170]];
      line(dn, 'ink', 5, 6.8, 6.95, 'C'); line(head(dn, 18), 'ink', 5, 6.95, 7.02, 'C');
      const gA = [[MX + 175, MY - 10], [MX + 300, MY - 14], [MX + 400, MY - 8]];
      line(gA, 'ink', 5, 7.02, 7.2, 'C'); line(head(gA, 20), 'ink', 5, 7.2, 7.26, 'C');
      text('Guess', MX + 290, MY - 40, 38, 'label', 'ink', 7.15, 7.4, { align: 'center', g: 'C' });
      const BX = MX + 540, BY = MY - 10;
      line(rrect(BX - 120, BY - 55, 240, 110, 40), 'ink', 5, 7.3, 7.5, 'C');
      line([[BX - 70, BY + 52], [BX - 96, BY + 92], [BX - 40, BY + 54]], 'ink', 5, 7.48, 7.55, 'C');
      text('dog?', BX, BY + 18, 52, 'title', 'ink', 7.52, 7.75, { align: 'center', g: 'C' });
      text('Check', BX, BY - 82, 38, 'label', 'acc2', 7.85, 8.05, { align: 'center', g: 'C' });
      line([[BX + 140, BY - 40], [BX + 200, BY + 30]], 'acc2', 8, 8.0, 8.08, 'C');
      line([[BX + 200, BY - 40], [BX + 140, BY + 30]], 'acc2', 8, 8.08, 8.16, 'C');
      line(circ(BX + 4, BY + 2, 150, 82, -2.2, 4.4), 'acc2', 5, 8.15, 8.45, 'C'); // emphasis ring
      const back = cubic([BX - 60, BY + 70], [BX - 80, BY + 290], [MX + 290, MY + 300], [MX + 155, MY + 190]);
      line(back, 'acc2', 6, 8.45, 8.95, 'C'); line(head(back, 22), 'acc2', 6, 8.95, 9.02, 'C');
      text('Adjust', (BX + MX) / 2 - 10, MY + 315, 40, 'label', 'acc2', 8.8, 9.05, { align: 'center', g: 'C' });
      if (t > 8.95 && t < 9.4) { // error signal travelling back
        const u = win(t, 8.95, 9.35), p = back[Math.min(back.length - 1, Math.floor((1 - u) * (back.length - 1)))];
        items.push({ k: 'dot', x: p[0], y: p[1], r: 13, role: 'acc2', a: -1, b: 0, g: 'C', inst: true });
      }
      line([[BX - 66, BY + 4], [BX - 20, BY - 6], [BX + 24, BY + 6], [BX + 66, BY - 4]], 'ink', 5, 9.5, 9.62, 'C'); // strike
      text('cat', BX + 30, BY + 118, 52, 'title', 'acc3', 9.62, 9.85, { align: 'center', g: 'C' });
      line([[BX + 92, BY + 96], [BX + 112, BY + 122], [BX + 156, BY + 66]], 'acc3', 8, 9.85, 10.05, 'C');
      if (L.bridge) { // a connector the hand draws while the camera travels to the next part
        const B = L.bridge;
        line(B.pts, 'acc1', 5, B.a, B.b, 'D'); line(head(B.pts, 22), 'acc1', 5, B.b, B.b + 0.06, 'D');
        text(B.label, B.lx, B.ly, 40, 'label', 'acc1', B.b + 0.06, B.b + 0.3, { align: 'center', rot: B.rot || 0, g: 'D' });
      }
      // ---- 4 PROGRESS ----
      const D = L.D;
      const ox = D[0] - 380, oy = D[1] + 150, cw = 560, ch = 330;
      line([[ox, oy - ch], [ox, oy], [ox + cw, oy]], 'ink', 5, L.pT, L.pT + 0.35, 'D');
      line(head([[ox, oy], [ox, oy - ch]], 16), 'ink', 5, L.pT + 0.35, L.pT + 0.4, 'D');
      line(head([[ox, oy], [ox + cw, oy]], 16), 'ink', 5, L.pT + 0.4, L.pT + 0.45, 'D');
      text('training rounds', ox + cw / 2, oy + 48, 34, 'label', 'ink', L.pT + 0.3, L.pT + 0.55, { align: 'center', g: 'D' });
      const cpts = [];
      for (let i = 0; i <= 40; i++) {
        const u = i / 40, acc = 61 + 36 * (1 - Math.pow(1 - u, 2.2)) + (i % 3 === 1 ? -2.5 : i % 3 === 2 ? 1.5 : 0) * (1 - u);
        cpts.push([ox + 20 + u * (cw - 50), oy - (acc - 50) / 50 * ch]);
      }
      line(cpts, 'acc1', 6, L.pT + 0.5, L.pT + 1.7, 'D');
      text('accuracy', D[0] + 330, D[1] - 120, 40, 'label', 'ink', L.pT + 0.45, L.pT + 0.7, { align: 'center', g: 'D' });
      if (t > L.pT + 0.55) {
        const u = win(Math.floor(t * 12) / 12, L.pT + 0.6, L.pT + 1.7), v = 61 + 36 * (1 - Math.pow(1 - u, 2.2));
        items.push({ k: 'text', s: Math.round(v) + '%', x: D[0] + 330, y: D[1] + 10, size: 110, font: 'num', role: u >= 1 ? 'acc3' : 'ink', a: -1, b: 0, align: 'center', g: 'D', inst: true, live: true });
      }
      line(circ(D[0] + 335, D[1] - 25, 140, 90, -2.4, 4.2), 'acc2', 6, L.pT + 1.75, L.pT + 2.05, 'D');
      // ---- 5 TAKEAWAY ----
      text('More examples → better guesses', D[0], D[1] + 290, 62, 'title', 'ink', L.kT, L.kT + 0.75, { align: 'center', rot: -0.01, g: 'E' });
      line([[D[0] - 450, D[1] + 316], [D[0] + 455, D[1] + 308]], 'acc1', 6, L.kT + 0.75, L.kT + 0.95, 'E');
      return items;
    };
    // the 'tip' of whatever is currently being drawn (for the hand/tool)
    const tipOf = (items, t, measure) => {
      let tip = null;
      for (const it of items) {
        if (it.inst || it.k === 'dot') continue;
        const p = win(t, it.a, it.b);
        if (p > 0 && p < 1) {
          if (it.k === 'line') { const P = it.pts; tip = P[Math.min(P.length - 1, Math.floor(p * (P.length - 1)))]; }
          else tip = measure ? measure(it, p) : [it.x, it.y];
        }
      }
      return tip;
    };
    return { clamp, win, eio, camAt, circ, quad, cubic, rrect, head, cat, dog, story, tipOf, fmt };
  })();
  // <<<XE-ENGINE
  registerStyle({
    id: 'ballpoint-notebook',
    name: 'Ballpoint Notebook',
    category: 'Hand-Drawn',
    description: 'A blue Bic doodle in the back of a college-ruled notebook: dense crosshatching for darks, pressure-varied lines with ink blobs where strokes start, bubble lettering with a hatched drop shadow and compulsive margin doodles.',
    motion: 'Lines scratch on stroke by stroke, then layers of crosshatching build up the shadows pass by pass, while the margin doodles get traced over and over.',
    fonts: ['700 92px "Fredoka"', '400 28px "Gloria Hallelujah"'],
    frameT: 5.9,
    duration: 6,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(57);
      const MX = 168; // red margin x
      const RULE0 = 104, RS = 30;

      // ---------- paper ----------
      H.paper(ctx, W, H_, '#fbfaf5', 12, 0.012);
      const light = ctx.createLinearGradient(0, 0, W, H_);
      light.addColorStop(0, 'rgba(255,255,255,0.0)'); light.addColorStop(1, 'rgba(120,110,90,0.10)');
      ctx.fillStyle = light; ctx.fillRect(0, 0, W, H_);
      // rules
      for (let y = RULE0; y < H_; y += RS) {
        ctx.fillStyle = 'rgba(110,160,215,0.75)'; ctx.fillRect(0, y, W, 1.2);
        ctx.fillStyle = 'rgba(110,160,215,0.18)'; ctx.fillRect(0, y + 1.2, W, 0.8);
      }
      ctx.fillStyle = 'rgba(225,95,105,0.8)'; ctx.fillRect(MX, 0, 1.6, H_);
      ctx.fillStyle = 'rgba(225,95,105,0.3)'; ctx.fillRect(MX + 1.6, 0, 1, H_);

      // ---------- tone map (what the hatching reads) ----------
      const TM = H.layer(W, H_), tm = TM.getContext('2d');
      tm.fillStyle = '#000'; tm.fillRect(0, 0, W, H_);
      const gray = (v) => `rgb(${(v * 255) | 0},0,0)`;

      // rocket frame
      const RX = 760, RY = 400, RA = 0.52, SC = 0.86;
      const toW = ([x, y]) => {
        const c = Math.cos(RA), s = Math.sin(RA);
        return [RX + (x * c - y * s) * SC, RY + (x * s + y * c) * SC];
      };
      const local = (fn) => { tm.save(); tm.translate(RX, RY); tm.rotate(RA); tm.scale(SC, SC); fn(); tm.restore(); };

      // smoke clouds (world coords), back to front
      const clouds = [];
      {
        const rr = H.rng(4);
        const base = [[420, 640, 70], [330, 610, 58], [520, 668, 64], [260, 670, 54], [450, 560, 52], [600, 640, 46], [370, 690, 60], [520, 600, 40], [300, 560, 38]];
        base.forEach(([x, y, r]) => clouds.push([x + rr.range(-6, 6), y + rr.range(-6, 6), r]));
      }
      // flame direction: rocket local +y
      const fl0 = toW([0, 190]), fl1 = toW([0, 330]);
      clouds.forEach(([x, y, r]) => {
        const g = tm.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r);
        g.addColorStop(0, gray(0.0)); g.addColorStop(0.55, gray(0.22)); g.addColorStop(0.85, gray(0.55)); g.addColorStop(1, gray(0.7));
        tm.fillStyle = g; tm.beginPath(); tm.arc(x, y, r, 0, 7); tm.fill();
      });
      local(() => {
        // body
        const bg = tm.createLinearGradient(-62, 0, 62, 0);
        bg.addColorStop(0, gray(0.3)); bg.addColorStop(0.18, gray(0.06)); bg.addColorStop(0.42, gray(0.12)); bg.addColorStop(0.75, gray(0.6)); bg.addColorStop(0.93, gray(0.9)); bg.addColorStop(1, gray(0.72));
        tm.fillStyle = bg;
        tm.beginPath(); tm.moveTo(-62, -150); tm.bezierCurveTo(-62, -230, -30, -280, 0, -300); tm.bezierCurveTo(30, -280, 62, -230, 62, -150);
        tm.lineTo(60, 130); tm.lineTo(-60, 130); tm.closePath(); tm.fill();
        // painted band + nose cap
        tm.save(); tm.clip();
        const bg2 = tm.createLinearGradient(-62, 0, 62, 0);
        bg2.addColorStop(0, gray(0.65)); bg2.addColorStop(0.2, gray(0.5)); bg2.addColorStop(0.75, gray(0.85)); bg2.addColorStop(1, gray(0.95));
        tm.fillStyle = bg2; tm.fillRect(-70, -310, 140, 92); tm.fillRect(-70, 54, 140, 30);
        tm.restore();
        // fins
        tm.fillStyle = gray(0.55);
        tm.beginPath(); tm.moveTo(-60, 20); tm.quadraticCurveTo(-120, 80, -126, 186); tm.lineTo(-60, 136); tm.closePath(); tm.fill();
        tm.fillStyle = gray(0.92);
        tm.beginPath(); tm.moveTo(60, 20); tm.quadraticCurveTo(120, 80, 126, 186); tm.lineTo(60, 136); tm.closePath(); tm.fill();
        tm.fillStyle = gray(0.8); tm.fillRect(-7, 60, 14, 140);
        // nozzle
        const ng = tm.createLinearGradient(-44, 0, 44, 0); ng.addColorStop(0, gray(0.6)); ng.addColorStop(1, gray(0.97));
        tm.fillStyle = ng; tm.beginPath(); tm.moveTo(-34, 130); tm.lineTo(34, 130); tm.lineTo(46, 172); tm.lineTo(-46, 172); tm.closePath(); tm.fill();
        // window
        tm.fillStyle = gray(0.5); tm.beginPath(); tm.arc(0, -60, 34, 0, 7); tm.fill();
        tm.fillStyle = gray(0.95); tm.beginPath(); tm.arc(0, -60, 25, 0, 7); tm.fill();
        tm.fillStyle = gray(0.0); tm.beginPath(); tm.ellipse(-9, -70, 9, 5, -0.6, 0, 7); tm.fill();
        // flame: lightly hatched outer glow only
        tm.fillStyle = gray(0.0); tm.beginPath(); tm.moveTo(-40, 176); tm.quadraticCurveTo(-46, 260, 0, 350); tm.quadraticCurveTo(46, 260, 40, 176); tm.closePath(); tm.fill();
      });
      // moon
      const MXc = 1120, MYc = 150, MR = 74;
      {
        const g = tm.createRadialGradient(MXc - 30, MYc - 30, 10, MXc, MYc, MR);
        g.addColorStop(0, gray(0.05)); g.addColorStop(0.6, gray(0.3)); g.addColorStop(1, gray(0.75));
        tm.fillStyle = g; tm.beginPath(); tm.arc(MXc, MYc, MR, 0, 7); tm.fill();
        [[MXc + 22, MYc - 18, 16], [MXc - 26, MYc + 26, 12], [MXc + 30, MYc + 34, 9], [MXc - 10, MYc - 36, 7]].forEach(([x, y, r]) => {
          tm.fillStyle = gray(0.72); tm.beginPath(); tm.arc(x, y, r, 0, 7); tm.fill();
        });
      }
      const tmd = tm.getImageData(0, 0, W, H_).data;
      const tone = (x, y) => {
        x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H_) return 0;
        return tmd[(y * W + x) * 4] / 255;
      };

      // ---------- ballpoint primitives ----------
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const win = (a, b) => H.clamp((t - a) / (b - a));
      let PH = null, TIP = null;
      const seq = (t0, dt, dur) => { PH = { t0, dt, dur: dur || dt * 2, k: 0 }; };
      const bp = (pts, seed, w = 1.3, a = 0.85, blob = true) => {
        if (pts.length < 2) return;
        if (PH) {
          const k = PH.k++, gate = H.clamp((t - (PH.t0 + k * PH.dt)) / PH.dur);
          if (gate <= 0) return;
          if (gate < 1) { pts = pts.slice(0, Math.max(2, Math.ceil(pts.length * gate))); TIP = pts[pts.length - 1]; }
        }
        const n = pts.length;
        const rr = H.rng(seed);
        let skip = rr.chance(0.25) ? Math.floor(rr.range(0.2, 0.8) * n) : -1;
        for (let i = 0; i < n - 1; i += 2) {
          if (skip >= 0 && i >= skip && i < skip + 3) continue; // ink skipped
          const u = i / (n - 1);
          const pr = 0.62 + 0.38 * (0.5 + 0.5 * nz.n2(i * 0.05 + seed * 0.3, seed * 0.11));
          const taper = Math.min(1, (1 - u) * 6 + 0.35);
          ctx.strokeStyle = H.rgba(INK, a * pr * taper); ctx.lineWidth = w * (0.75 + 0.35 * pr);
          ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
          if (pts[i + 2]) ctx.lineTo(pts[i + 2][0], pts[i + 2][1]);
          ctx.stroke();
        }
        if (blob && rr.chance(0.6)) {
          ctx.fillStyle = H.rgba(INK, 0.9); ctx.beginPath(); ctx.arc(pts[0][0] + 0.3, pts[0][1], w * rr.range(1.0, 1.8), 0, 7); ctx.fill();
        }
      };
      const line = (pts, seed, w = 1.4, a = 0.9, amp = 0.8, passes = 1) => {
        for (let k = 0; k < passes; k++) bp(wob(seg(pts), nz, seed + k * 13, amp + k * 0.4), seed + k * 7, w, a);
      };

      // ---------- hatching from tone map ----------
      const hatch = (ang, sp, thr, seed, a, t0, t1, region = [0, 0, W, H_]) => {
        const rr = H.rng(seed), ca = Math.cos(ang), sa = Math.sin(ang);
        const [x0, y0, x1, y1] = region, mx = (x0 + x1) / 2, my = (y0 + y1) / 2, ext = Math.hypot(x1 - x0, y1 - y0) / 2;
        const pr = win(t0, t1); if (pr <= 0) return;
        const oMax = -ext + 2 * ext * pr;
        for (let o = -ext; o < ext; o += sp * (0.85 + rr() * 0.3)) {
          if (o > oMax) break;
          const ox = mx - sa * o, oy = my + ca * o;
          let run = [];
          const flush = () => {
            let i = 0;
            while (i < run.length - 3) {
              const len = Math.floor(rr.range(8, 24));
              const part = run.slice(i, i + len);
              if (part.length > 2) {
                const jx = rr.range(-0.8, 0.8), jy = rr.range(-0.8, 0.8);
                bp(part.map(([x, y]) => [x + jx, y + jy]), seed * 31 + i + (o | 0) * 7, rr.range(0.9, 1.25), a * rr.range(0.75, 1.1), rr.chance(0.1));
                if (pr < 1) TIP = part[part.length - 1];
              }
              i += len - Math.floor(rr.range(-1, 2));
            }
            run = [];
          };
          for (let s = -ext; s < ext; s += 2.5) {
            const x = ox + ca * s, y = oy + sa * s;
            if (x < x0 || x > x1 || y < y0 || y > y1) { flush(); continue; }
            const v = tone(x, y) + nz.n2(x * 0.03, y * 0.03) * 0.05;
            if (v > thr) run.push([x, y]); else flush();
          }
          flush();
        }
      };
      hatch(-0.85, 5.0, 0.16, 1, 0.7, 2.3, 3.1);
      hatch(0.72, 4.8, 0.4, 2, 0.7, 2.8, 3.5);
      hatch(-0.12, 4.2, 0.58, 3, 0.75, 3.2, 3.8);
      hatch(1.32, 3.8, 0.74, 4, 0.8, 3.5, 4.0);
      hatch(-0.5, 3.2, 0.84, 5, 0.85, 3.75, 4.2);
      hatch(0.25, 2.8, 0.9, 6, 0.9, 3.95, 4.35);

      // ---------- contours ----------
      const L = (pts) => pts.map(toW);
      seq(1.0, 0.04);
      // rocket outline (double-traced like a real pen doodle)
      line(L(bez([-62, -150], [-62, -230], [-30, -280], [0, -300])), 10, 1.6, 0.95, 0.6, 2);
      line(L(bez([0, -300], [30, -280], [62, -230], [62, -150])), 11, 1.6, 0.95, 0.6, 2);
      line(L([[-62, -150], [-60, 130]]), 12, 1.6, 0.95, 0.8, 2);
      line(L([[62, -150], [60, 130]]), 13, 1.7, 0.95, 0.8, 2);
      line(L(ell(0, -218, 54, 9, 0.05, Math.PI - 0.05)), 14, 1.3, 0.9, 0.4);
      line(L(ell(0, -150, 62, 11, 0.02, Math.PI - 0.02)), 15, 1.4, 0.9, 0.4);
      line(L(ell(0, 54, 61, 11, 0.02, Math.PI - 0.02)), 16, 1.3, 0.9, 0.4);
      line(L(ell(0, 84, 61, 11, 0.02, Math.PI - 0.02)), 17, 1.3, 0.9, 0.4);
      line(L(ell(0, 130, 60, 10, 0.02, Math.PI - 0.02)), 18, 1.5, 0.95, 0.4);
      line(L(ell(0, -60, 34, 34)), 19, 1.5, 0.95, 0.5, 2);
      line(L(ell(0, -60, 25, 25)), 20, 1.3, 0.9, 0.4);
      // rivets
      for (let k = -4; k <= (t > 1.6 ? 4 : -5); k++) {
        const p = toW([k * 13, -134 + Math.cos(k * 0.35) * 8]);
        ctx.fillStyle = H.rgba(INK, 0.9); ctx.beginPath(); ctx.arc(p[0], p[1], 1.6, 0, 7); ctx.fill();
      }
      line(L([[-60, 20], [-92, 52], [-118, 110], [-126, 186], [-60, 136]]), 21, 1.6, 0.95, 0.6, 2);
      line(L([[60, 20], [92, 52], [118, 110], [126, 186], [60, 136]]), 22, 1.6, 0.95, 0.6, 2);
      line(L([[-7, 62], [-7, 200], [7, 200], [7, 62]]), 23, 1.4, 0.9, 0.4);
      line(L([[-34, 132], [-46, 172], [46, 172], [34, 132]]), 24, 1.5, 0.95, 0.5, 2);
      // flame
      line(L(bez([-40, 176], [-50, 250], [-20, 300], [0, 352])), 25, 1.4, 0.9, 1.2);
      line(L(bez([0, 352], [20, 300], [50, 250], [40, 176])), 26, 1.4, 0.9, 1.2);
      line(L(bez([-22, 178], [-26, 230], [-8, 262], [0, 292])), 27, 1.2, 0.85, 1);
      line(L(bez([0, 292], [8, 262], [26, 230], [22, 178])), 28, 1.2, 0.85, 1);
      line(L([[-14, 204], [-10, 240]]), 29, 1, 0.7);
      line(L([[10, 210], [6, 236]]), 30, 1, 0.7);

      seq(2.2, 0.025);
      // clouds: draw each puff's visible arc (not hidden by puffs in front)
      clouds.forEach(([x, y, r], i) => {
        const pts = [];
        let runs = [], cur = [];
        for (let k = 0; k <= 120; k++) {
          const a = k / 120 * Math.PI * 2, rw = r * (1 + 0.035 * Math.sin(a * (5 + (i % 4)) + i * 2) + 0.05 * nz.n2(a * 1.5 + i, i * 3.1)), px = x + Math.cos(a) * rw, py = y + Math.sin(a) * rw;
          let hidden = false;
          for (let j = i + 1; j < clouds.length; j++) { const c = clouds[j]; if (Math.hypot(px - c[0], py - c[1]) < c[2] - 1) { hidden = true; break; } }
          // also hidden behind the flame
          if (!hidden) cur.push([px, py]); else if (cur.length) { runs.push(cur); cur = []; }
        }
        if (cur.length) runs.push(cur);
        runs.forEach((rn, k) => { if (rn.length > 2 && rn[0][1] < H_ + 20) line(rn, 200 + i * 10 + k, 1.4, 0.9, 1.0); });
      });

      // moon
      seq(2.6, 0.045);
      line(ell(MXc, MYc, MR, MR, -1, 5.4), 300, 1.5, 0.95, 0.8, 2);
      [[MXc + 22, MYc - 18, 16], [MXc - 26, MYc + 26, 12], [MXc + 30, MYc + 34, 9], [MXc - 10, MYc - 36, 7]].forEach(([x, y, r], i) => line(ell(x, y, r, r * 0.9, 0.3, 6.9), 310 + i, 1.2, 0.9, 0.4));
      // little flag on the moon
      line([[MXc - 40, MYc - 60], [MXc - 52, MYc - 116]], 320, 1.4, 0.95, 0.4);
      line([[MXc - 52, MYc - 116], [MXc - 18, MYc - 112], [MXc - 26, MYc - 98], [MXc - 46, MYc - 92]], 321, 1.3, 0.9, 0.5);

      // speed lines + sparkles
      seq(2.95, 0.02);
      [[-150, -70, 40], [-170, 0, 90], [-120, -190, -110], [150, -100, 0], [170, 10, 80]].forEach(([x, y0, y1], i) => line(L([[x, y0], [x, y1]]), 400 + i, 1.2, 0.85, 0.5));
      const sparkle = (x, y, s, seed) => {
        line([[x - s, y], [x + s, y]], seed, 1.2, 0.9, 0.3); line([[x, y - s], [x, y + s]], seed + 1, 1.2, 0.9, 0.3);
        line([[x - s * 0.5, y - s * 0.5], [x + s * 0.5, y + s * 0.5]], seed + 2, 1, 0.7, 0.2);
        line([[x - s * 0.5, y + s * 0.5], [x + s * 0.5, y - s * 0.5]], seed + 3, 1, 0.7, 0.2);
      };
      sparkle(960, 300, 12, 500); sparkle(1180, 330, 9, 504); sparkle(1010, 120, 8, 508); sparkle(920, 470, 7, 512); sparkle(1220, 520, 10, 516);
      [[1050, 400], [1150, 440], [880, 160], [1230, 260], [990, 560]].forEach(([x, y], i) => { if (t < 3.3 + i * 0.05) return; ctx.fillStyle = H.rgba(INK, 0.9); ctx.beginPath(); ctx.arc(x, y, 2 + (i % 2), 0, 7); ctx.fill(); });

      // ---------- margin doodles ----------
      // star traced over and over
      const star = (x, y, R, seed, passes) => {
        const pts = [];
        for (let k = 0; k <= 5; k++) { const a = -Math.PI / 2 + k * Math.PI * 4 / 5; pts.push([x + Math.cos(a) * R, y + Math.sin(a) * R]); }
        line(pts, seed, 1.4, 0.9, 1.2, passes);
      };
      const tipBefore = TIP;
      seq(0.3, 1.15, 0.35); star(118, 236, 30, 600, 5);
      seq(1.9, 1.2, 0.3); star(94, 690, 16, 610, 4);
      seq(0.6, 0.05, 0.12);
      // Necker cube with a hatched face
      {
        const x = 90, y = 410, s = 46, d = 22;
        const F = [[x, y], [x + s, y], [x + s, y + s], [x, y + s], [x, y]], B = F.map(([a, b]) => [a + d, b - d]);
        line(F, 620, 1.4, 0.9, 0.6, 2); line(B, 621, 1.4, 0.9, 0.6, 2);
        for (let k = 0; k < 4; k++) line([F[k], B[k]], 622 + k, 1.3, 0.9, 0.4);
        for (let k = 3; k < d; k += 3.2) line([[x + s + k, y - k + 2], [x + s + k, y + s - k - 2]], 630 + k * 3, 1.1, 0.8, 0.3);
      }
      // spirals
      const spiral = (x, y, R, turns, seed) => {
        const pts = [];
        for (let k = 0; k <= turns * 60; k++) { const a = k / 60 * Math.PI * 2, rad = R * k / (turns * 60); pts.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]); }
        line(pts, seed, 1.3, 0.9, 0.5);
      };
      seq(1.3, 0.1, 0.45); spiral(112, 560, 30, 4, 640);
      seq(4.4, 0.1, 0.4); spiral(1210, 650, 22, 3, 641);
      // zigzag arrow
      seq(1.85, 0.1, 0.25); line([[88, 320], [104, 304], [120, 322], [136, 306], [150, 322]], 650, 1.3, 0.9, 0.4);
      PH = null; if (tipBefore) TIP = tipBefore;
      // ---------- bubble lettering ----------
      ctx.restore();
      {
        const TX = 200, TY = 160, txt = 'TO THE MOON';
        const font = '700 92px "Fredoka"';
        const M = H.layer(W, H_), mc = M.getContext('2d');
        mc.font = font;
        const glyphs = []; { let px = 0; const rj = H.rng(71); for (const ch of txt) { glyphs.push([ch, px, rj.range(-3, 3), rj.range(-0.05, 0.05)]); px += mc.measureText(ch).width + (ch === ' ' ? -4 : 7); } }
        const gT = (i) => 0.1 + i * 0.075;
        const drawGlyphs = (c, fn, lag = 0) => glyphs.forEach(([ch, px, dy, rot], i) => { if (ch === ' ' || t < gT(i) + lag) return; c.save(); c.translate(px, dy); c.rotate(rot); fn(ch); c.restore(); });
        mc.font = font; mc.fillStyle = '#000';
        mc.save(); mc.translate(TX + 8, TY + 8); mc.rotate(-0.03); drawGlyphs(mc, (ch) => mc.fillText(ch, 0, 0)); mc.restore();
        mc.globalCompositeOperation = 'destination-out';
        mc.save(); mc.translate(TX, TY); mc.rotate(-0.03); mc.lineWidth = 3; drawGlyphs(mc, (ch) => { mc.fillText(ch, 0, 0); mc.strokeText(ch, 0, 0); }); mc.restore();
        const HL = H.layer(W, H_), hc = HL.getContext('2d'), rr = H.rng(70);
        hc.strokeStyle = H.rgba(INK, 0.85); hc.lineCap = 'round';
        for (let o = -200; o < 900; o += 3.4) {
          hc.lineWidth = rr.range(0.9, 1.4); hc.globalAlpha = rr.range(0.7, 1);
          hc.beginPath(); hc.moveTo(TX + o, TY + 20); hc.lineTo(TX + o + 110, TY - 100); hc.stroke();
        }
        hc.globalAlpha = 1; hc.globalCompositeOperation = 'destination-in'; hc.drawImage(M, 0, 0);
        { const sw = TX - 20 + 760 * win(1.0, 1.6); hc.globalCompositeOperation = 'destination-out'; hc.fillRect(sw, 0, W, H_); if (t > 1.0 && t < 1.6) TIP = [sw, TY - 10]; }
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(HL, 0, 0); ctx.restore();
        // outlines traced twice
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.font = font;
        [[0, 0, 2.0, 1.0, 0], [0.8, -0.6, 1.3, 0.85, 0.12], [-0.5, 0.4, 1.0, 0.6, 0.6]].forEach(([dx, dy, w, a, lag]) => {
          ctx.save(); ctx.translate(TX + dx, TY + dy); ctx.rotate(-0.03);
          ctx.strokeStyle = H.rgba(INK, a); ctx.lineWidth = w; ctx.lineJoin = 'round'; drawGlyphs(ctx, (ch) => ctx.strokeText(ch, 0, 0), lag); ctx.restore();
        });
        const gi = glyphs.findIndex((_, i) => t < gT(i));
        if (gi > 0 && t < gT(glyphs.length - 1) + 0.08) TIP = [TX + glyphs[gi - 1][1] + 40, TY - 20];
        ctx.restore();
      }
      // handwritten note on the rules
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      ctx.font = '400 28px "Gloria Hallelujah"'; ctx.fillStyle = H.rgba(INK, 0.88);
      { const note = 'v1.0 ships friday!!', nc = Math.ceil(note.length * win(4.2, 4.75)), part = note.slice(0, nc);
        ctx.save(); ctx.translate(890, RULE0 + RS * 17 - 6); ctx.rotate(-0.012); ctx.fillText(part, 0, 0);
        if (nc > 0 && nc < note.length) TIP = [890 + ctx.measureText(part).width, RULE0 + RS * 17 - 14];
        ctx.restore(); }
      ctx.restore();

      // ---------- hole punches (desk shows through) ----------
      [120, 360, 600].forEach((y) => {
        const x = 54, r = 17;
        ctx.save();
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
        const dg = ctx.createLinearGradient(0, y - r, 0, y + r);
        dg.addColorStop(0, '#5a3e2a'); dg.addColorStop(1, '#7a5638');
        ctx.fillStyle = dg; ctx.fillRect(x - r, y - r, r * 2, r * 2);
        // paper thickness shadow inside top-left
        ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x + 2, y + 3, r, 0, 7); ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r + 0.5, 0.2, 2.6); ctx.stroke();
        ctx.strokeStyle = 'rgba(120,110,95,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r + 1.5, 3.4, 5.9); ctx.stroke();
      });

      // ---------- the ballpoint pen while drawing ----------
      if (TIP && t < 4.85) {
        const [tx, ty] = TIP, ang = 0.85, len = 280;
        ctx.save();
        ctx.save(); ctx.filter = 'blur(6px)'; ctx.fillStyle = 'rgba(40,40,60,0.25)'; ctx.translate(tx + 18, ty + 22); ctx.rotate(ang + 0.04); ctx.beginPath(); ctx.roundRect(20, -7, len, 14, 6); ctx.fill(); ctx.restore();
        ctx.translate(tx, ty); ctx.rotate(ang);
        ctx.fillStyle = '#b8b8b0'; ctx.beginPath(); ctx.arc(0.5, 0, 1.4, 0, 7); ctx.fill();
        const cg = ctx.createLinearGradient(0, -6, 0, 6); cg.addColorStop(0, '#ffffff'); cg.addColorStop(1, '#c9c9c2');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(1.5, -1.5); ctx.lineTo(26, -6.5); ctx.lineTo(26, 6.5); ctx.lineTo(1.5, 1.5); ctx.closePath(); ctx.fill();
        const bgr = ctx.createLinearGradient(0, -8, 0, 8); bgr.addColorStop(0, 'rgba(250,252,255,0.95)'); bgr.addColorStop(0.5, 'rgba(215,222,232,0.92)'); bgr.addColorStop(1, 'rgba(160,170,185,0.95)');
        ctx.fillStyle = bgr; ctx.fillRect(26, -8, len - 50, 16);
        ctx.fillStyle = 'rgba(30,46,150,0.85)'; ctx.fillRect(30, -1.8, len - 70, 3.6);
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(30, -6, len - 60, 1.5);
        ctx.fillStyle = '#2c3fa8'; ctx.beginPath(); ctx.roundRect(len - 26, -7, 26, 14, 4); ctx.fill();
        ctx.restore();
      }
      H.grain(ctx, W, H_, 0.025, 4 + (Math.floor(t * 12) % 4));
      H.vignette(ctx, W, H_, 0.12, '60,50,40');
    },
    // >>>EXPLAINER
    explainerDuration: 15,
    explainerNote: 'Doodled down one long college-ruled page: the pen draws while the camera scrolls along and then down the page, headings are bubble letters with crosshatched shadows, boxes get hatched drop-shadows, a red pen marks the wrong guess, and counters are re-inked in bubble numerals.',
    explainer(ctx, W, H_, t) {
      const nz = H.makeNoise(57);
      const BLUE = [30, 46, 150], RED = [178, 28, 38];
      const D = [2560, 1520];
      const L = {
        D, pT: 10.95, kT: 13.05, modelName: 'robot brain',
        bridge: { pts: XE.cubic([2760, 1000], [2900, 1120], [2860, 1250], [2700, 1330]), a: 10.15, b: 10.6, label: 'repeat x1000', lx: 2960, ly: 1300 },
        model: (cx, cy, adj, push, api, tt) => {
          const g = 'M';
          api.line(XE.rrect(cx - 150, cy - 140, 300, 280, 26), 'ink', 5, 2.5, 2.8, g);
          api.line([[cx + 90, cy - 140], [cx + 96, cy - 185]], 'ink', 4, 2.8, 2.85, g);
          api.line(XE.circ(cx + 97, cy - 197, 12, 12), 'ink', 4, 2.85, 2.92, g);
          [-1, 1].forEach((s, i) => {
            api.line(XE.circ(cx + s * 62, cy - 55, 32, 32, -1.4, 5.0), 'ink', 4.5, 2.9 + i * 0.06, 2.98 + i * 0.06, g);
            api.dot(cx + s * 62 + 8, cy - 50, 9, 'ink', 3.0, g);
            api.line(XE.rrect(cx + s * 150 - (s > 0 ? 0 : 16), cy - 50, 16, 70, 5), 'ink', 4, 3.0 + i * 0.04, 3.06 + i * 0.04, g);
          });
          api.line(XE.rrect(cx - 70, cy + 6, 140, 34, 8), 'ink', 4, 3.05, 3.12, g);
          for (let k = 1; k < 6; k++) api.line([[cx - 70 + k * 23, cy + 8], [cx - 70 + k * 23, cy + 38]], 'ink', 3, 3.12 + k * 0.01, 3.14 + k * 0.01, g);
          [-1, 0, 1].forEach((k, i) => {
            const x = cx + k * 70, y = cy + 92;
            api.line(XE.circ(x, y, 22, 22, -1.2, 5.2), 'ink', 4, 3.12 + i * 0.04, 3.2 + i * 0.04, g);
            if (tt > 3.2 + i * 0.04) {
              const a0 = [-2.4, -0.6, -1.9][i], a1 = [-0.7, -2.2, -0.4][i], a = a0 + (a1 - a0) * adj + Math.sin(adj * Math.PI) * 0.3;
              push({ k: 'line', pts: [[x, y], [x + Math.cos(a) * 18, y + Math.sin(a) * 18]], role: adj > 0 && adj < 1 ? 'acc2' : 'ink', w: 5, a: -1, b: 0, inst: true, g });
            }
          });
        },
      };
      const items = XE.story(t, L);
      const cam = XE.camAt([[0, 640, 360, 1.0], [2.0, 650, 362, 1.05], [2.8, 1830, 610, 0.95], [5.95, 1860, 620, 0.97], [6.55, 2580, 640, 0.9], [10.3, 2600, 660, 0.93],
        [11.0, 2560, 1540, 0.92], [12.9, 2570, 1550, 0.95], [13.6, 2560, 1640, 0.88], [15, 2560, 1640, 0.9]], t);
      const z = cam[2];
      const apply = (c) => { c.translate(W / 2, H_ / 2); c.scale(z, z); c.translate(-cam[0], -cam[1]); };
      const toS = ([x, y]) => [(x - cam[0]) * z + W / 2, (y - cam[1]) * z + H_ / 2];
      const vx0 = cam[0] - W / 2 / z, vx1 = cam[0] + W / 2 / z, vy0 = cam[1] - H_ / 2 / z, vy1 = cam[1] + H_ / 2 / z;

      // ---------- the page ----------
      if (!XC.paper) { const pl = H.layer(1000, 600), pc = pl.getContext('2d'); H.paper(pc, 1000, 600, '#fbfaf5', 12, 0.014); XC.paper = pl; }
      if (!XC.tooth) {
        // tileable paper tooth at 1:1 world scale: horizontal fibre streaks (like H.paper's n2(x*.15, y*.04)) + per-pixel speckle
        const TS = 512, tl = H.layer(TS, TS), tc = tl.getContext('2d'), img = tc.createImageData(TS, TS), d = img.data, rr = H.rng(907);
        const vnoise = (cx, cy, seed) => { // periodic value noise, cx x cy lattice over the tile
          const L = new Float32Array(cx * cy), r2 = H.rng(seed); for (let i = 0; i < L.length; i++) L[i] = r2() * 2 - 1;
          return (x, y) => { const fx = x / TS * cx, fy = y / TS * cy, ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy;
            const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v), x0 = ix % cx, x1 = (ix + 1) % cx, y0 = iy % cy, y1 = (iy + 1) % cy;
            const a = L[y0 * cx + x0], b = L[y0 * cx + x1], c = L[y1 * cx + x0], e = L[y1 * cx + x1];
            return a + (b - a) * su + (c - a + (a - b - c + e) * su) * sv; };
        };
        const fib = vnoise(80, 20, 31), fib2 = vnoise(160, 48, 32), mot = vnoise(8, 8, 33);
        for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
          const v = fib(x, y) * 0.5 + fib2(x, y) * 0.35 + mot(x, y) * 0.12 + (rr() - 0.5) * 0.8;
          const i = (y * TS + x) * 4; // transparent warm-grey tooth over the base paper (source-over is cheap)
          d[i] = 120; d[i + 1] = 108; d[i + 2] = 88; d[i + 3] = Math.max(0, Math.min(255, (0.016 + v * 0.018) * 255));
        }
        tc.putImageData(img, 0, 0);
        // a few stray paper fibres
        tc.lineCap = 'round';
        for (let i = 0; i < 70; i++) {
          const x = rr() * TS, y = rr() * TS, a = rr.range(-0.4, 0.4) + (rr.chance(0.5) ? 0 : Math.PI / 2) * 0.2, l = rr.range(6, 22);
          tc.strokeStyle = `rgba(150,140,120,${rr.range(0.08, 0.2)})`; tc.lineWidth = rr.range(0.5, 1);
          for (const [ox, oy] of [[0, 0], [-TS, 0], [0, -TS], [-TS, -TS], [TS, 0], [0, TS]]) { tc.beginPath(); tc.moveTo(x + ox, y + oy); tc.quadraticCurveTo(x + ox + Math.cos(a) * l * 0.5 + 2, y + oy + Math.sin(a) * l * 0.5 - 1.5, x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); tc.stroke(); }
        }
        XC.tooth = tl;
      }
      ctx.save(); apply(ctx);
      ctx.drawImage(XC.paper, -300, -300, 4000, 2400);
      ctx.fillStyle = ctx.createPattern(XC.tooth, 'repeat'); ctx.fillRect(vx0 - 4, vy0 - 4, vx1 - vx0 + 8, vy1 - vy0 + 8);
      for (let y = Math.ceil((vy0 - 104) / 30) * 30 + 104; y < vy1; y += 30) {
        ctx.fillStyle = 'rgba(110,160,215,0.75)'; ctx.fillRect(vx0, y, vx1 - vx0, 1.3);
        ctx.fillStyle = 'rgba(110,160,215,0.18)'; ctx.fillRect(vx0, y + 1.3, vx1 - vx0, 0.9);
      }
      ctx.fillStyle = 'rgba(225,95,105,0.8)'; ctx.fillRect(168, -400, 1.8, 3000);
      ctx.fillStyle = 'rgba(225,95,105,0.3)'; ctx.fillRect(169.8, -400, 1, 3000);
      // hole punches: the desk shows through, with the paper's cut edge catching light (as in the still)
      [120, 360, 600, 840].forEach((y) => {
        const x = 54, r = 17;
        if (y + r < vy0 - 10 || y - r > vy1 + 10) return;
        ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
        const dg = ctx.createLinearGradient(0, y - r, 0, y + r); dg.addColorStop(0, '#5a3e2a'); dg.addColorStop(1, '#7a5638');
        ctx.fillStyle = dg; ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x + 2, y + 3, r, 0, 7); ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r + 0.5, 0.2, 2.6); ctx.stroke();
        ctx.strokeStyle = 'rgba(120,110,95,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r + 1.5, 3.4, 5.9); ctx.stroke();
      });
      ctx.restore();
      // the still's warm diagonal light falloff (screen space, under the ink)
      {
        const light = ctx.createLinearGradient(0, 0, W, H_);
        light.addColorStop(0, 'rgba(255,255,255,0.0)'); light.addColorStop(1, 'rgba(120,110,90,0.10)');
        ctx.fillStyle = light; ctx.fillRect(0, 0, W, H_);
      }

      // ---------- ballpoint ----------
      ctx.save(); apply(ctx);
      ctx.globalCompositeOperation = 'multiply'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const bpl = (pts, seed, w, a, rgb, done = true) => {
        const n = pts.length; if (n < 2) return;
        const rr = H.rng(seed);
        const skip = rr.chance(0.25) ? Math.floor(rr.range(0.2, 0.8) * n) : -1;
        for (let i = 0; i < n - 1; i += 2) {
          if (skip >= 0 && i >= skip && i < skip + 2) continue;
          // pressure: slow swell + faster wobble, so long strokes visibly fade and darken like a real Bic
          const nv = 0.5 + 0.5 * (0.75 * nz.n2(i * 0.022 + seed * 0.3, seed * 0.11) + 0.25 * Math.sin(i * 0.19 + seed * 1.7));
          const pr = 0.55 + 0.45 * nv;
          ctx.strokeStyle = H.rgba(rgb, a * pr); ctx.lineWidth = w * (0.7 + 0.42 * pr);
          ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
          if (pts[i + 2]) ctx.lineTo(pts[i + 2][0], pts[i + 2][1]);
          ctx.stroke();
        }
        // ink gloops: the ball dumps a blob where it lands, and sometimes where it lifts
        if (rr.chance(0.8)) { const r0 = w * rr.range(1.0, 1.7); ctx.fillStyle = H.rgba(rgb, 0.9); ctx.beginPath(); ctx.ellipse(pts[0][0] + 0.3, pts[0][1], r0, r0 * 0.85, rr() * 3, 0, 7); ctx.fill(); }
        if (done && rr.chance(0.4)) { const q = pts[n - 1]; ctx.fillStyle = H.rgba(rgb, 0.8); ctx.beginPath(); ctx.arc(q[0], q[1], w * 1.2 * rr.range(0.7, 1), 0, 7); ctx.fill(); }
      };
      // interior tonal hatching (the still's tone-map shading, lit from the top-left): a sparse 45deg layer over the
      // lit-to-shadow half, a cross layer on the shadow side, and a third short layer deep in the shadow corner.
      // holes: closed sub-shapes / words inside the shape are left as bare paper, the way a doodler hatches around them.
      const hatchFill = (pts, holes, p, rgb) => {
        if (p <= 0) return;
        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; pts.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
        const w = x1 - x0, h = y1 - y0, rr = H.rng(((x0 * 11 + y0 * 3) | 0) + 17);
        ctx.save();
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
        holes.forEach((hp) => { if (hp.rect) { const [hx, hy, hw, hh] = hp.rect, r = hh / 2; ctx.moveTo(hx + r, hy); ctx.arc(hx + r, hy + r, r, -Math.PI / 2, -Math.PI * 1.5, true); ctx.lineTo(hx + hw - r, hy + hh); ctx.arc(hx + hw - r, hy + r, r, Math.PI / 2, -Math.PI / 2, true); ctx.closePath(); } else { hp.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); } });
        ctx.clip('evenodd');
        // u: 0 at the lit top-left corner .. 1 at the shadow bottom-right corner (lines of constant u run at 45deg)
        const L = w + h, uAt = (x, y) => ((x - x0) + (y - y0)) / L;
        const layer = (dir, uMin, sp, al, lw, pp) => {
          if (pp <= 0) return;
          const groups = [[], [], []];
          if (dir === 0) { // 45deg strokes (constant u), revealed in u order
            for (let o = uMin * L; o < L * (uMin + (1 - uMin) * pp); o += sp * (0.85 + rr() * 0.3)) {
              const c = x0 + y0 + o; // x + y = c
              const ax = Math.max(x0 - 4, c - y1 - 4), bx = Math.min(x1 + 4, c - y0 + 4);
              if (bx - ax < 2) continue;
              let sx = ax; while (sx < bx) { const len = rr.range(26, 70), ex = Math.min(bx, sx + len), j = rr.range(-0.9, 0.9);
                groups[(rr() * 3) | 0].push([sx + j, c - sx, ex + j, c - ex]); sx = ex + rr.range(-3, 1.5); }
            }
          } else { // cross strokes at -45deg (along u), only beyond uMin, revealed from the shadow corner inward
            const cut = x0 + y0 + uMin * L; // clip half-plane x + y > cut
            for (let o = -h; o < w; o += sp * (0.85 + rr() * 0.3)) {
              // line: x - y = x0 - y0 + o
              const k = x0 - y0 + o;
              const sxa = Math.max(x0 - 4, y0 - 4 + k, (cut + k) / 2), sxb = Math.min(x1 + 4, y1 + 4 + k);
              const span = sxb - sxa; if (span < 3) continue;
              const ex = sxa + span * Math.min(1, pp * 1.3);
              let sx = sxa; while (sx < ex) { const len = rr.range(22, 60), e2 = Math.min(ex, sx + len), j = rr.range(-0.9, 0.9);
                groups[(rr() * 3) | 0].push([sx, sx - k + j, e2, e2 - k + j]); sx = e2 + rr.range(-3, 1.5); }
            }
          }
          ctx.lineWidth = lw;
          groups.forEach((g, gi) => { if (!g.length) return; ctx.strokeStyle = H.rgba(rgb, al * [0.75, 0.95, 1.15][gi]); ctx.beginPath(); g.forEach(([ax, ay, bx, by]) => { ctx.moveTo(ax, ay); ctx.lineTo(bx, by); }); ctx.stroke(); });
        };
        layer(0, 0.22, 6.0, 0.34, 1.0, XE.win(p, 0, 0.6));
        layer(1, 0.55, 6.4, 0.34, 1.0, XE.win(p, 0.35, 0.85));
        if (Math.min(w, h) > 60) { // a darker horizontal-ish layer tucked in the shadow corner of the big shapes
          const cut = x0 + y0 + 0.78 * L, pp = XE.win(p, 0.65, 1);
          if (pp > 0) {
            ctx.beginPath(); ctx.moveTo(cut - y1 + 0, y1 + 4); ctx.lineTo(x1 + 4, y1 + 4); ctx.lineTo(x1 + 4, cut - x1 - 4); ctx.closePath(); ctx.clip();
            ctx.strokeStyle = H.rgba(rgb, 0.28); ctx.lineWidth = 1.0; ctx.beginPath();
            for (let yy = y1 + 2; yy > y1 - (h * 0.6) * pp; yy -= 4.6 + rr() * 1.2) { const j = rr.range(-1, 1); ctx.moveTo(x0 + w * 0.3, yy + j); ctx.lineTo(x1 + 4, yy - 3 + j); }
            ctx.stroke();
          }
        }
        ctx.restore();
      };
      // hatched drop-shadow behind a closed shape (classic notebook doodle shading)
      const hatchShadow = (pts, dx, dy, p) => {
        if (p <= 0) return;
        ctx.save();
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy))); ctx.closePath(); ctx.clip();
        ctx.beginPath(); ctx.rect(vx0 - 50, vy0 - 50, vx1 - vx0 + 100, vy1 - vy0 + 100);
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
        ctx.clip('evenodd');
        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; pts.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
        const rr = H.rng((x0 * 7) | 0), span = (x1 - x0 + y1 - y0 + 2 * (dx + dy)) * p;
        ctx.strokeStyle = H.rgba(BLUE, 0.62); ctx.lineWidth = 1.25; ctx.beginPath();
        for (let o = 0; o < span; o += 4.4) {
          const j = rr.range(-1, 1);
          ctx.moveTo(x0 + o - (y1 - y0) - dy + j, y1 + dy + 4); ctx.lineTo(x0 + o + 4 + j, y0 - 4);
        }
        ctx.stroke();
        ctx.restore();
      };
      // bubble lettering with crosshatched shadow
      const bubble = (it, p) => {
        const font = `700 ${it.size}px "Fredoka"`;
        ctx.save(); ctx.font = font;
        const w = ctx.measureText(it.s).width + (it.s.length - 1) * it.size * 0.06, x0 = it.align === 'center' ? it.x - w / 2 : it.x;
        const n = Math.ceil(it.s.length * p);
        const pos = []; let px = 0;
        for (let i = 0; i < it.s.length; i++) { pos.push(px); px += ctx.measureText(it.s[i]).width + it.size * 0.06; }
        const rgb = it.role === 'acc2' ? RED : BLUE;
        // shadow: layer mask of offset glyphs minus glyphs, then hatch through it
        // (a layer only as big as the text's own screen box: same pixels as a full-frame layer, far less fill)
        const T = ctx.getTransform();
        const off = it.size * 0.08;
        let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
        { const cr = Math.cos(it.rot || 0), sr = Math.sin(it.rot || 0);
          [[-12, -it.size * 1.05], [w + off + 12, -it.size * 1.05], [-12, it.size * 0.4 + off], [w + off + 12, it.size * 0.4 + off]].forEach(([lx, ly]) => {
            const wx = x0 + lx * cr - ly * sr, wy = it.y + lx * sr + ly * cr, dx = T.a * wx + T.c * wy + T.e, dy = T.b * wx + T.d * wy + T.f;
            bx0 = Math.min(bx0, dx); bx1 = Math.max(bx1, dx); by0 = Math.min(by0, dy); by1 = Math.max(by1, dy); }); }
        bx0 = Math.max(0, Math.floor(bx0) - 4); by0 = Math.max(0, Math.floor(by0) - 4); bx1 = Math.min(W, Math.ceil(bx1) + 4); by1 = Math.min(H_, Math.ceil(by1) + 4);
        if (bx1 > bx0 && by1 > by0) {
          const M = H.layer(bx1 - bx0, by1 - by0), mc = M.getContext('2d');
          mc.setTransform(T.a, T.b, T.c, T.d, T.e - bx0, T.f - by0); mc.font = font; mc.fillStyle = '#000';
          mc.translate(x0, it.y); mc.rotate(it.rot);
          for (let i = 0; i < n; i++) if (it.s[i] !== ' ') mc.fillText(it.s[i], pos[i] + off, off);
          mc.globalCompositeOperation = 'destination-out'; mc.lineWidth = 3;
          for (let i = 0; i < n; i++) if (it.s[i] !== ' ') { mc.fillText(it.s[i], pos[i], 0); mc.strokeText(it.s[i], pos[i], 0); }
          mc.globalCompositeOperation = 'source-in'; mc.setTransform(1, 0, 0, 1, -bx0, -by0);
          mc.strokeStyle = H.rgba(rgb, 0.85); mc.lineWidth = 1.1;
          const oA = bx0 - (H_ - by0) * 0.9 - 6, oB = bx1 - (H_ - by1) * 0.9 + 6;
          mc.beginPath(); for (let o = -800; o < W + 800; o += 3.6) { if (o < oA || o > oB) continue; mc.moveTo(o, H_); mc.lineTo(o + H_ * 0.9, 0); } mc.stroke();
          ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(M, bx0, by0); ctx.restore();
        }
        ctx.translate(x0, it.y); ctx.rotate(it.rot); ctx.lineJoin = 'round';
        [[0, 0, 2.0, 1.0], [0.8, -0.6, 1.2, 0.8]].forEach(([dx, dy, lw, a]) => {
          ctx.strokeStyle = H.rgba(rgb, a); ctx.lineWidth = lw;
          for (let i = 0; i < n; i++) if (it.s[i] !== ' ') ctx.strokeText(it.s[i], pos[i] + dx, dy);
        });
        ctx.restore();
        return [x0 + (pos[Math.min(n, pos.length - 1)] || 0), it.y - it.size * 0.4];
      };
      const measure = (it, p) => {
        ctx.save(); ctx.font = it.font === 'label' ? `400 ${it.size}px "Gloria Hallelujah"` : `700 ${it.size}px "Fredoka"`;
        const w = ctx.measureText(it.s).width, x0 = it.align === 'center' ? it.x - w / 2 : it.x;
        const w2 = ctx.measureText(it.s.slice(0, Math.ceil(it.s.length * p))).width; ctx.restore();
        return [x0 + w2, it.y - it.size * 0.3];
      };
      const offscreen = (it) => {
        if (it.k === 'line') { let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9; for (const [x, y] of it.pts) { if (x < a0) a0 = x; if (x > a1) a1 = x; if (y < b0) b0 = y; if (y > b1) b1 = y; } return a1 < vx0 - 30 || a0 > vx1 + 30 || b1 < vy0 - 30 || b0 > vy1 + 30; }
        if (it.k === 'dot') return it.x < vx0 - 20 || it.x > vx1 + 20 || it.y < vy0 - 20 || it.y > vy1 + 20;
        const hw = it.s.length * it.size * 0.6; return it.x + hw < vx0 || it.x - hw > vx1 || it.y + it.size < vy0 || it.y - it.size > vy1;
      };
      // closed shapes in the diagram (for interior hatching and its paper holes)
      const isClosed = (it) => it.k === 'line' && !it.inst && it.pts.length > 8 && Math.hypot(it.pts[0][0] - it.pts[it.pts.length - 1][0], it.pts[0][1] - it.pts[it.pts.length - 1][1]) < 20;
      const bbox = (P) => { let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9; for (const [x, y] of P) { if (x < a0) a0 = x; if (x > a1) a1 = x; if (y < b0) b0 = y; if (y > b1) b1 = y; } return [a0, b0, a1, b1]; };
      const closedItems = items.filter((it) => isClosed(it) && it.role !== 'acc2').map((it) => ({ it, bb: bbox(it.pts) }));
      const titleTexts = items.filter((it) => it.k === 'text' && it.font === 'title' && !it.inst);
      const holesFor = (it) => {
        const [a0, b0, a1, b1] = bbox(it.pts), hs = [];
        closedItems.forEach((c) => { if (c.it !== it && c.bb[0] > a0 && c.bb[2] < a1 && c.bb[1] > b0 && c.bb[3] < b1) hs.push(c.it.pts); });
        titleTexts.forEach((tx) => {
          if (tx.x < a0 || tx.x > a1 || tx.y < b0 || tx.y > b1 + tx.size * 0.3) return;
          ctx.save(); ctx.font = `700 ${tx.size}px "Fredoka"`; const tw = ctx.measureText(tx.s).width + tx.s.length * tx.size * 0.06; ctx.restore();
          const lx = tx.align === 'center' ? tx.x - tw / 2 : tx.x;
          hs.push({ rect: [lx - 10, tx.y - tx.size * 0.85, tw + 22, tx.size * 1.15] });
        });
        return hs;
      };
      for (const it of items) {
        const p = it.inst ? 1 : XE.win(t, it.a, it.b);
        if (p <= 0 || offscreen(it)) continue;
        const rgb = it.role === 'acc2' ? RED : BLUE;
        if (it.k === 'line') {
          const seed = ((it.pts[0][0] * 13 + it.pts[0][1] * 7) | 0) + 5;
          let P = wob(seg(it.pts, 2.5), nz, seed % 83, it.inst ? 0.4 : 0.9);
          if (p < 1) P = P.slice(0, Math.max(2, Math.ceil(P.length * p)));
          const closed = it.pts.length > 8 && Math.hypot(it.pts[0][0] - it.pts[it.pts.length - 1][0], it.pts[0][1] - it.pts[it.pts.length - 1][1]) < 20;
          if (closed && it.role === 'ink' && it.w >= 4 && !it.inst) {
            const hp = XE.win(t, it.b, it.b + 0.35);
            hatchShadow(it.pts, 9, 9, hp);
            hatchFill(it.pts, holesFor(it), hp, rgb);
          }
          if (it.g === 'D' && it.role === 'acc1' && it.w === 6 && it.pts.length === 41) { // the accuracy curve: hatch the area under it as it is drawn
            const C = it.pts, n = Math.max(2, Math.ceil(C.length * p)), base = L.D[1] + 150 - 4, xe = C[n - 1][0];
            ctx.save(); ctx.beginPath(); ctx.moveTo(C[0][0], base); for (let i = 0; i < n; i++) ctx.lineTo(C[i][0], C[i][1] + 5); ctx.lineTo(xe, base); ctx.closePath(); ctx.clip();
            const rr = H.rng(4242), top = C[C.length - 1][1];
            ctx.lineWidth = 1.0;
            for (let gi = 0; gi < 3; gi++) {
              ctx.strokeStyle = H.rgba(BLUE, [0.2, 0.26, 0.32][gi]); ctx.beginPath();
              for (let o = C[0][0] - (base - top); o < xe; o += 6.4) { const j = rr.range(-0.9, 0.9); if (((o * 0.37) | 0) % 3 !== gi) continue; ctx.moveTo(o + j, base + 2); ctx.lineTo(o + j + (base - top) + 8, top - 8); }
              ctx.stroke();
            }
            ctx.restore();
          }
          bpl(P, seed, Math.max(1.5, it.w * 0.45), 0.95, rgb, p >= 1);
          if (it.w >= 5 && !it.inst) bpl(wob(seg(it.pts, 2.5), nz, (seed + 7) % 83, 1.2).slice(0, P.length), seed + 1, Math.max(1, it.w * 0.24), 0.6, rgb, false); // retraced
        } else if (it.k === 'dot') {
          ctx.fillStyle = H.rgba(rgb, 0.9); ctx.beginPath(); ctx.arc(it.x, it.y, it.r * 0.8, 0, 7); ctx.fill();
        } else if (it.font === 'label') {
          ctx.save(); ctx.font = `400 ${it.size * 1.0}px "Gloria Hallelujah"`; ctx.fillStyle = H.rgba(rgb, 0.9);
          const s = it.s.slice(0, Math.ceil(it.s.length * p)), w = ctx.measureText(it.s).width;
          ctx.translate(it.align === 'center' ? it.x - w / 2 : it.x, it.y); ctx.rotate(it.rot); ctx.fillText(s, 0, 0); ctx.restore();
        } else bubble(it, p);
      }
      ctx.restore();

      // ---------- pen ----------
      const tp = XE.tipOf(items, t, measure);
      if (tp) {
        const [tx, ty] = toS(tp), ang = 0.85, len = 280;
        ctx.save();
        ctx.save(); ctx.filter = 'blur(6px)'; ctx.fillStyle = 'rgba(40,40,60,0.25)'; ctx.translate(tx + 18, ty + 22); ctx.rotate(ang + 0.04); ctx.beginPath(); ctx.roundRect(20, -7, len, 14, 6); ctx.fill(); ctx.restore();
        ctx.translate(tx, ty); ctx.rotate(ang);
        ctx.fillStyle = '#b8b8b0'; ctx.beginPath(); ctx.arc(0.5, 0, 1.4, 0, 7); ctx.fill();
        const cg = ctx.createLinearGradient(0, -6, 0, 6); cg.addColorStop(0, '#ffffff'); cg.addColorStop(1, '#c9c9c2');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(1.5, -1.5); ctx.lineTo(26, -6.5); ctx.lineTo(26, 6.5); ctx.lineTo(1.5, 1.5); ctx.closePath(); ctx.fill();
        const bgr = ctx.createLinearGradient(0, -8, 0, 8); bgr.addColorStop(0, 'rgba(250,252,255,0.95)'); bgr.addColorStop(0.5, 'rgba(215,222,232,0.92)'); bgr.addColorStop(1, 'rgba(160,170,185,0.95)');
        ctx.fillStyle = bgr; ctx.fillRect(26, -8, len - 50, 16);
        const inkRgb = (items.filter((q) => !q.inst && q.k !== 'dot' && XE.win(t, q.a, q.b) > 0 && XE.win(t, q.a, q.b) < 1).pop() || {}).role === 'acc2' ? RED : BLUE;
        ctx.fillStyle = H.rgba(inkRgb, 0.85); ctx.fillRect(30, -1.8, len - 70, 3.6);
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(30, -6, len - 60, 1.5);
        ctx.fillStyle = H.rgba(H.mix(inkRgb, '#ffffff', 0.1)); ctx.beginPath(); ctx.roundRect(len - 26, -7, 26, 14, 4); ctx.fill();
        ctx.restore();
      }
      H.grain(ctx, W, H_, 0.022, 4 + (Math.floor(t * 12) % 4));
      H.vignette(ctx, W, H_, 0.12, '60,50,40');
    },
    // <<<EXPLAINER
    // Sound: a cheap ballpoint on a college-ruled pad. Every draw-on is a thin rolling scratch with the pad's soft body
    // under it and a tiny tick where the ball lands; the red pen (acc2 items) sits a little lower; the hatched shadows
    // that fill in behind closed shapes and bubble letters are fast back-and-forth flicks. The "repeat x1000" leader
    // carries the scroll down the page. Times mirror explainer()/XE.story (pT 10.95, kT 13.05, bridge 10.15-10.6,
    // model timings from explainer(); hatch shadows run it.b .. it.b + 0.35).
    explainerSound(k) {
      const pT = 10.95, kT = 13.05;
      const rnd = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
      // first time XE.eio(win(t, t0, t1)) reaches u (the knob needles' eased turn)
      const when = (t0, t1, u) => { for (let i = 0; i <= 400; i++) if (XE.eio(i / 400) >= u - 1e-6) return t0 + (t1 - t0) * i / 400; return t1; };
      // one ballpoint line: the ball lands (tick + a little knock through the pad), rolls and scratches, pad body under it
      const LV = 0.45; // drawing sits well under the hits
      const bp = (a, b, g = 1, pan = 0, minor = true, red = false) => {
        const d = Math.max(0.03, b - a); g *= LV;
        k.noise(a, { dur: 0.016, filter: 'bandpass', f: red ? 1700 : 2100, q: 1.8, gain: 0.34 * g, a: 0.001, pan, minor });
        k.tone(a, { f: red ? 170 : 210, dur: 0.03, gain: 0.05 * g, pan, minor });
        k.play('stroke', a, { material: 'pen', dur: d, gain: 1.5 * g, pan, minor });
        k.noise(a, { dur: d + 0.03, color: 'pink', filter: 'bandpass', f: red ? 800 : 950, q: 0.9, gain: 0.07 * g, a: 0.012, hold: d * 0.6, pan, minor });
      };
      // handwriting: one stroke per word, timed by character position like the explainer's per-letter reveal
      const write = (s, a, b, g = 0.9, pan = 0, red = false, minor = true) => {
        const n = s.length, re = /\S+/g; let m;
        while ((m = re.exec(s))) bp(a + (b - a) * m.index / n, a + (b - a) * (m.index + m[0].length) / n, g, pan, minor, red);
      };
      // doodle hatching: quick parallel flicks (shadows behind boxes and bubble letters), always minor texture
      const hatch = (a, b, g = 1, seed = 1, pan = 0) => {
        let i = 0;
        for (let x = a; x < b; x += 0.036 + rnd(seed + i) * 0.014, i++) {
          k.noise(x, { dur: 0.028, filter: 'bandpass', f: 3300 + rnd(seed + i + 40) * 700, q: 1.3, gain: 0.06 * LV * g * (1 - 0.4 * (x - a) / (b - a)), a: 0.004, pan: pan + (i % 2 ? 0.06 : -0.06), minor: true });
        }
      };
      // bubble letters: outline per word plus the crosshatched shadow filling in alongside
      const bubble = (s, a, b, g = 1, pan = 0, red = false, minor = true) => { write(s, a, b, g, pan, red, minor); hatch(a + 0.03, b, 0.8 * g, (a * 100) | 0, pan); };
      const dotTap = (t, g = 1) => k.noise(t, { dur: 0.015, filter: 'bandpass', f: 2000, q: 1.6, gain: 0.22 * g, a: 0.001, minor: true });

      k.bed('room', 0, 15, { gain: 0.45 });

      // 1 HOOK: bubble-letter title, then the underline
      bubble('How does AI learn?', 0.15, 1.3, 1.0);
      bp(1.3, 1.55, 1.25, 0, false);

      // 2 DATA: robot brain (box, antenna, eyes, ears, mouth, knobs), six cards; hatched shadows follow the boxes
      bp(2.5, 2.8, 1.05, 0.1, false); // head box: first mark in the new scene
      bp(2.8, 2.92, 0.7, 0.15); // antenna + ball
      bp(2.92, 3.04, 0.7, 0.1); dotTap(3.0, 0.8); // eyes + pupils
      bp(3.05, 3.12, 0.6, 0.1); // mouth
      for (let i = 0; i < 6; i++) { const a = 3.0 + i * 0.17; bp(a, a + (i < 5 ? 0.15 : 0.21), 0.85, (i % 3 - 1) * 0.15); }
      hatch(2.8, 4.4, 0.9, 7); // shadows behind the head box, mouth, knobs and each card in turn
      bp(4.15, 4.45, 1.0); bp(4.46, 4.55, 0.85); // flow arrow + head
      write('examples', 4.55, 4.8, 0.35);
      for (let f = 55; f < 63; f++) k.play('count', f / 12, { gain: 1.5, f: 2500 + (f - 55) * 120, minor: true }); // bubble numerals re-inked on the 12 fps grid
      k.play('tock', 63 / 12, { f: 560, gain: 0.45 }); // 1,000,000 lands

      // 3 GUESS -> CHECK -> ADJUST
      bp(6.4, 6.53, 0.9, 0, true, true); // red frame of the new photo
      bp(6.55, 6.7, 0.85); dotTap(6.7, 0.9); // cat + eyes
      write('new!', 6.67, 6.8, 0.65, 0.2, true);
      bp(6.8, 6.94, 0.9); bp(6.96, 7.02, 0.8); // arrow down into the model
      bp(7.02, 7.15, 0.9); // guess arrow out
      write('Guess', 7.15, 7.4, 0.65);
      bp(7.3, 7.47, 0.85); bp(7.48, 7.53, 0.75); // speech bubble + tail
      hatch(7.5, 7.85, 0.7, 21);
      bubble('dog?', 7.54, 7.75, 1.0);
      write('Check', 7.86, 8.0, 0.65, 0, true);
      // the wrong guess: two hard red slashes + a low "nope"
      bp(8.0, 8.08, 1.9, 0.1, false, true); bp(8.08, 8.16, 1.9, 0.1, false, true);
      k.play('error', 8.0, { f: 'F3', gain: 0.55 });
      bp(8.16, 8.45, 1.1, 0, true, true); // red ring
      bp(8.45, 8.8, 1.0, -0.1, true, true); // long arrow back to the knobs
      write('Adjust', 8.8, 9.05, 0.65, -0.1, true);
      // knob needles swing (eio 8.95..9.5): a soft detent click every 1/7 of the turn, slowing as they settle
      for (let j = 1; j <= 7; j++) k.play('click', when(8.95, 9.5, j / 7), { f: 1000, gain: 0.5, pan: -0.15, minor: true });
      bp(9.5, 9.62, 1.1); // strike through "dog?"
      bubble('cat', 9.62, 9.85, 1.0);
      bp(9.85, 10.05, 1.15, 0, false); // check mark
      k.play('success', 9.98, { f: 'A5', gain: 0.6 });

      // bridge: the "repeat x1000" leader is drawn as the camera scrolls down the page to the chart
      bp(10.15, 10.6, 1.6, 0.2, false); bp(10.6, 10.66, 1.1, 0.2);
      write('repeat x1000', 10.66, 10.9, 0.75, 0.3);

      // 4 PROGRESS
      bp(pT, pT + 0.3, 1.0, 0, false); // axes
      write('training rounds', pT + 0.3, pT + 0.55, 0.5);
      write('accuracy', pT + 0.45, pT + 0.7, 0.55, 0.3);
      bp(pT + 0.7, pT + 1.7, 0.45); // the rising curve
      { // % counter: a tick whenever the shown number changes (12 fps grid), slowing as it settles.
        // The numerals stay blue, so the hit lands on the frame 97% is first inked.
        let last = -1;
        for (let f = Math.ceil((pT + 0.6) * 12); f < 160; f++) {
          const u = Math.min(1, (f / 12 - (pT + 0.6)) / 1.1), v = Math.round(61 + 36 * (1 - Math.pow(1 - u, 2.2)));
          if (v === 97) { // 97% lands: the biggest hit
            k.play('impact', f / 12, { gain: 1.0, pan: 0.2 });
            k.play('ding', f / 12 + 0.01, { f: 'D6', gain: 0.42, pan: 0.2 });
            break;
          }
          if (v !== last) { k.play('tick', f / 12, { gain: 1.1, f: 2500 + (v - 61) * 25, pan: 0.25, minor: true }); last = v; }
        }
      }
      bp(pT + 1.75, pT + 2.05, 1.25, 0.25, false, true); // red ring round the 97%

      // 5 TAKEAWAY
      bubble('More examples → better guesses', kT, kT + 0.75, 0.9);
      k.play('success', kT + 0.75, { f: 'G5', gain: 0.7 }); // resolving landing
      bp(kT + 0.75, kT + 0.95, 1.15, 0, false);
    },
  });
}
```
