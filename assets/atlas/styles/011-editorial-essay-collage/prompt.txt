I want an animated explainer made in the "Editorial Essay Collage" visual style (Popular Explainer Looks). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Anton, Libre Baskerville, Oswald
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Oswald:wght@400;700&display=block">
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
Name: Editorial Essay Collage
Family: Popular Explainer Looks
Look: The editorial "animated essay" collage: warm grainy paper, archival halftone prints with torn white borders and soft shadows, newspaper clippings in serif type with a translucent yellow highlighter sweep, masking tape, flat colour blocks and big cut-out condensed headlines.
Motion: Cutouts drop and slide in on 12 fps hand-animated steps while the camera pushes smoothly through parallax layers; the highlighter sweeps left to right and a red marker rings the key detail.
How it explains: Scenes are joined by fast blurred camera whips that hide the cut, plus a new paper sheet slid up on steps; arrows are thin ink route lines and red marker, numbers are re-cut condensed numerals on paper strips, and the emphasis is the yellow highlighter sweep (plus a red marker ring and cross on the wrong guess).

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

REFERENCE STYLE SOURCE (styles/editorial-collage.js; W/H_ are always 1280x720)
```js
// Editorial Essay Collage: the editorial "animated opinion essay" look. Warm paper, archival halftone prints with torn
// edges and white borders, newspaper clippings with a yellow highlighter sweep, masking tape, flat colour blocks,
// cut-out condensed headlines, flat diagrams with thin lines and pins. 2.5D parallax camera (smooth) over cutouts
// that move on 12 fps steps; cuts hidden inside fast blurred camera whips.
{
  const TAU = Math.PI * 2;
  const KRAFT = '#c9a878';
  const PAPER = '#f0e9d9', INK = '#1a1816', RED = '#b8483a', CARD = '#f5f1e7', NEWS = '#e9e1cb';
  const C = {}; // caches (static textures and sprites; output still depends only on t)
  const NZ = () => C.nz || (C.nz = H.makeNoise(4242));
  const q12 = (t) => Math.floor(t * 12 + 1e-6) / 12;
  const gs = (v, a = 1) => { const k = Math.round(H.clamp(v) * 255); return a >= 1 ? `rgb(${k},${k},${k})` : `rgba(${k},${k},${k},${a})`; };
  const ell = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); };
  const pathPoly = (c, p) => { c.beginPath(); c.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]); c.closePath(); };
  const measure = (font, s) => { const m = C.m || (C.m = H.layer(8, 8).getContext('2d')); m.font = font; return m.measureText(s); };

  // rectangle centred on 0 -> polygon; torn sides get a ragged fibre edge, cut sides stay straight (scissor cut)
  const edgePoly = (w, h, torn, seed, amp = 5) => {
    const nz = NZ(), r = H.rng(seed);
    const cs = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => [x + (r() - 0.5) * 4, y + (r() - 0.5) * 4]);
    const out = [];
    for (let e = 0; e < 4; e++) {
      const [ax, ay] = cs[e], [bx, by] = cs[(e + 1) % 4], len = Math.hypot(bx - ax, by - ay), dx = (bx - ax) / len, dy = (by - ay) / len;
      if (!torn[e]) { out.push([ax, ay]); continue; }
      const o = seed * 0.37 + e * 11.3;
      for (let d = 0; d < len; d += 2.5) {
        const fade = Math.min(1, d / 10, (len - d) / 10);
        const off = (nz.fbm2(o + d * 0.021, o * 0.5, 4) * amp * 1.7 + (r() - 0.5) * amp * 0.3 - amp * 0.25) * fade;
        out.push([ax + dx * d + dy * off, ay + dy * d - dx * off]);
      }
    }
    return out;
  };

  const sprite = (w, h, pad, paint) => {
    const cv = H.layer(Math.ceil(w + pad * 2), Math.ceil(h + pad * 2)), c = cv.getContext('2d');
    c.translate(cv.width / 2, cv.height / 2); paint(c);
    return { cv, ox: cv.width / 2, oy: cv.height / 2, w, h };
  };
  const drawSpr = (c, s) => c.drawImage(s.cv, -s.ox, -s.oy);
  const shadowFill = (c, poly, col, sh = 1) => {
    c.save(); c.shadowColor = `rgba(40,28,15,${0.4 * sh})`; c.shadowBlur = 15 * sh; c.shadowOffsetX = 4 * sh; c.shadowOffsetY = 8 * sh;
    pathPoly(c, poly); c.fillStyle = col; c.fill(); c.restore();
    c.save(); c.shadowColor = 'rgba(40,28,15,0.25)'; c.shadowBlur = 2; c.shadowOffsetY = 1; pathPoly(c, poly); c.fillStyle = col; c.fill(); c.restore();
  };

  // ---------- paper fibre texture (white based; multiplied over paper colour and cutouts) ----------
  const fibre = () => {
    if (C.fib) return C.fib;
    const W = 2000, Hh = 1100, cv = H.layer(W, Hh), c = cv.getContext('2d'), nz = NZ(), r = H.rng(31);
    c.fillStyle = '#fff'; c.fillRect(0, 0, W, Hh);
    const lo = H.layer(250, 138), lc = lo.getContext('2d'), im = lc.createImageData(250, 138);
    for (let y = 0; y < 138; y++) for (let x = 0; x < 250; x++) {
      const v = nz.fbm2(x * 0.05, y * 0.05, 4) * 0.6 + nz.n2(x * 0.3, y * 0.3) * 0.4, k = (y * 250 + x) * 4;
      const g = 244 + v * 22; im.data[k] = g; im.data[k + 1] = g - 2; im.data[k + 2] = g - 6; im.data[k + 3] = 255;
    }
    lc.putImageData(im, 0, 0); c.imageSmoothingQuality = 'high'; c.drawImage(lo, 0, 0, W, Hh);
    c.lineCap = 'round';
    for (let i = 0; i < 2600; i++) {
      const x = r() * W, y = r() * Hh, a = r() * TAU, l = 4 + r() * 16, dark = r() < 0.55;
      c.strokeStyle = dark ? `rgba(120,100,70,${0.05 + r() * 0.08})` : `rgba(255,255,255,${0.2 + r() * 0.3})`; c.lineWidth = 0.6 + r() * 0.7;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 0.4) * l * 0.5, y + Math.sin(a + 0.4) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
    }
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(80,60,40,${0.08 + r() * 0.2})`; c.fillRect(r() * W, r() * Hh, 0.8 + r() * 1.4, 0.8 + r() * 1.2); }
    return (C.fib = cv);
  };
  const texture = (c, poly, alpha, ox = 0, oy = 0) => {
    c.save(); pathPoly(c, poly); c.clip(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = alpha; c.drawImage(fibre(), -1000 + ox, -550 + oy); c.restore();
  };
  const grainTiles = () => {
    if (C.gr) return C.gr;
    C.gr = [0, 1, 2, 3].map((s) => {
      const cv = H.layer(256, 256), c = cv.getContext('2d'), im = c.createImageData(256, 256), r = H.rng(900 + s);
      for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 150; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
      c.putImageData(im, 0, 0); return c.createPattern(cv, 'repeat');
    });
    return C.gr;
  };

  // ---------- photographs: grey scene -> soft blur, grain, contrast, coarse halftone duotone ----------
  const treat = (w, h, seed, paint, o = {}) => {
    const cell = o.cell || 4, mix = o.mix == null ? 0.38 : o.mix, con = o.con || 1.25;
    const a = H.layer(w, h), ac = a.getContext('2d'); paint(ac, w, h);
    const b = H.layer(w, h), bc = b.getContext('2d'); bc.filter = `blur(${o.blur || 1}px)`; bc.drawImage(a, 0, 0); bc.filter = 'none';
    const img = bc.getImageData(0, 0, w, h), d = img.data, r = H.rng(seed);
    const ink = [30, 27, 25], pap = [238, 231, 214], ca = Math.cos(0.785), sa = Math.sin(0.785);
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
      const k = (py * w + px) * 4, u = px / w - 0.5, v = py / h - 0.5;
      let L = d[k] / 255;
      L *= 1 - (u * u + v * v) * 1.1;
      L += (r() + r() + r() - 1.5) * 0.11;
      L = H.clamp((L - 0.5) * con + 0.5 + (o.lift || 0));
      const D = 1 - L, rx = px * ca + py * sa, ry = -px * sa + py * ca;
      const gx = (Math.floor(rx / cell) + 0.5) * cell, gy = (Math.floor(ry / cell) + 0.5) * cell;
      const dot = H.clamp(cell * 0.74 * Math.sqrt(D) - Math.hypot(rx - gx, ry - gy) + 0.6);
      const cov = dot * (1 - mix) + D * mix;
      d[k] = pap[0] + (ink[0] - pap[0]) * cov; d[k + 1] = pap[1] + (ink[1] - pap[1]) * cov; d[k + 2] = pap[2] + (ink[2] - pap[2]) * cov;
    }
    bc.putImageData(img, 0, 0);
    // dust and a hairline scratch, like an old print
    for (let i = 0; i < w * h / 2500; i++) { bc.fillStyle = r() < 0.6 ? 'rgba(245,240,228,0.8)' : 'rgba(20,18,16,0.5)'; ell(bc, r() * w, r() * h, 0.5 + r() * 1.2, 0.5 + r() * 1.0); bc.fill(); }
    bc.strokeStyle = 'rgba(245,240,228,0.45)'; bc.lineWidth = 0.8; bc.beginPath(); const sx = r() * w; bc.moveTo(sx, 0); bc.bezierCurveTo(sx + 20, h * 0.3, sx - 15, h * 0.6, sx + 10 + r() * 20, h); bc.stroke();
    return b;
  };

  const furStrokes = (c, cx, cy, rx, ry, base, n, seed) => {
    const r = H.rng(seed); c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const a = r() * TAU, rr = Math.sqrt(r()), x = cx + Math.cos(a) * rx * rr, y = cy + Math.sin(a) * ry * rr, l = 3 + r() * 6, ang = a + (r() - 0.5) * 0.8;
      c.strokeStyle = gs(base + (r() - 0.5) * 0.5, 0.18); c.lineWidth = 0.8 + r();
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(ang) * l, y + Math.sin(ang) * l); c.stroke();
    }
  };
  const room = (c, w, h, bg, seed) => {
    const r = H.rng(seed);
    let g = c.createLinearGradient(0, 0, w * 0.4, h); g.addColorStop(0, gs(bg + 0.15)); g.addColorStop(1, gs(bg - 0.22));
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    g = c.createRadialGradient(w * (0.1 + r() * 0.2), h * 0.05, 0, w * 0.2, h * 0.1, w * 0.7); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = gs(bg - 0.28); c.fillRect(0, h * (0.8 + r() * 0.06), w, h);
  };
  const catGray = (c, w, h, v) => {
    room(c, w, h, v.bg, v.seed);
    if (v.flip) { c.translate(w, 0); c.scale(-1, 1); }
    const s = Math.min(w, h) * (v.sc || 1), cx = w * (0.5 + (v.dx || 0)), cy = h * (0.46 + (v.dy || 0)), f = v.fur;
    let g = c.createRadialGradient(cx - 0.1 * s, cy + 0.3 * s, 0, cx, cy + 0.5 * s, 0.45 * s); g.addColorStop(0, gs(f + 0.18)); g.addColorStop(1, gs(f - 0.22));
    ell(c, cx + 0.04 * s, cy + 0.52 * s, 0.36 * s, 0.36 * s); c.fillStyle = g; c.fill();
    ell(c, cx, cy + 0.36 * s, 0.13 * s, 0.12 * s); c.fillStyle = gs(f + 0.3, 0.6); c.fill();
    for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(cx + sd * 0.06 * s, cy - 0.16 * s); c.lineTo(cx + sd * 0.25 * s, cy - 0.4 * s); c.lineTo(cx + sd * 0.27 * s, cy - 0.02 * s); c.closePath(); c.fillStyle = gs(f - 0.08); c.fill();
      c.beginPath(); c.moveTo(cx + sd * 0.11 * s, cy - 0.15 * s); c.lineTo(cx + sd * 0.23 * s, cy - 0.32 * s); c.lineTo(cx + sd * 0.23 * s, cy - 0.08 * s); c.closePath(); c.fillStyle = gs(f + 0.28); c.fill();
    }
    g = c.createRadialGradient(cx - 0.08 * s, cy - 0.1 * s, 0, cx, cy, 0.3 * s); g.addColorStop(0, gs(f + 0.2)); g.addColorStop(1, gs(f - 0.15));
    ell(c, cx, cy, 0.28 * s, 0.23 * s); c.fillStyle = g; c.fill();
    if (v.tabby) { c.strokeStyle = gs(f - 0.3, 0.75); c.lineWidth = 0.022 * s; c.lineCap = 'round'; for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(cx + k * 0.05 * s, cy - 0.21 * s); c.quadraticCurveTo(cx + k * 0.06 * s, cy - 0.14 * s, cx + k * 0.035 * s, cy - 0.08 * s); c.stroke(); } for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(cx + sd * (0.2 + i * 0.03) * s, cy + (0.04 + i * 0.06) * s); c.lineTo(cx + sd * (0.28) * s, cy + (0.02 + i * 0.07) * s); c.stroke(); } }
    furStrokes(c, cx, cy, 0.27 * s, 0.22 * s, f, 160, v.seed + 3);
    furStrokes(c, cx, cy + 0.5 * s, 0.34 * s, 0.32 * s, f, 160, v.seed + 4);
    for (const sd of [-1, 1]) { ell(c, cx + sd * 0.045 * s, cy + 0.1 * s, 0.065 * s, 0.05 * s); c.fillStyle = gs(f + 0.32); c.fill(); }
    c.beginPath(); c.moveTo(cx - 0.03 * s, cy + 0.045 * s); c.lineTo(cx + 0.03 * s, cy + 0.045 * s); c.lineTo(cx, cy + 0.08 * s); c.closePath(); c.fillStyle = gs(0.15); c.fill();
    for (const sd of [-1, 1]) {
      ell(c, cx + sd * 0.1 * s, cy - 0.02 * s, 0.058 * s, 0.042 * s, sd * 0.15); c.fillStyle = gs(0.86); c.fill();
      ell(c, cx + sd * 0.1 * s, cy - 0.02 * s, 0.018 * s, 0.038 * s); c.fillStyle = gs(0.03); c.fill();
      ell(c, cx + sd * 0.1 * s - 0.01 * s, cy - 0.035 * s, 0.009 * s, 0.009 * s); c.fillStyle = gs(1); c.fill();
    }
    c.strokeStyle = gs(0.97, 0.7); c.lineWidth = 1;
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(cx + sd * 0.08 * s, cy + 0.1 * s + i * 4); c.quadraticCurveTo(cx + sd * 0.25 * s, cy + 0.06 * s + i * 7, cx + sd * 0.4 * s, cy + 0.08 * s + i * 12); c.stroke(); }
  };
  const dogGray = (c, w, h, v) => {
    room(c, w, h, v.bg, v.seed);
    if (v.flip) { c.translate(w, 0); c.scale(-1, 1); }
    const s = Math.min(w, h) * (v.sc || 1), cx = w * (0.5 + (v.dx || 0)), cy = h * (0.44 + (v.dy || 0)), f = v.fur;
    let g = c.createRadialGradient(cx - 0.1 * s, cy + 0.4 * s, 0, cx, cy + 0.55 * s, 0.5 * s); g.addColorStop(0, gs(f + 0.15)); g.addColorStop(1, gs(f - 0.2));
    ell(c, cx, cy + 0.6 * s, 0.4 * s, 0.36 * s); c.fillStyle = g; c.fill();
    g = c.createRadialGradient(cx - 0.08 * s, cy - 0.12 * s, 0, cx, cy, 0.32 * s); g.addColorStop(0, gs(f + 0.2)); g.addColorStop(1, gs(f - 0.12));
    ell(c, cx, cy - 0.02 * s, 0.22 * s, 0.25 * s); c.fillStyle = g; c.fill();
    for (const sd of [-1, 1]) { ell(c, cx + sd * 0.22 * s, cy + 0.06 * s, 0.085 * s, 0.22 * s, -sd * 0.32); c.fillStyle = gs(f - 0.3); c.fill(); }
    furStrokes(c, cx, cy, 0.22 * s, 0.25 * s, f, 160, v.seed + 3);
    furStrokes(c, cx, cy + 0.6 * s, 0.38 * s, 0.32 * s, f, 160, v.seed + 4);
    ell(c, cx, cy + 0.14 * s, 0.13 * s, 0.11 * s); c.fillStyle = gs(f + 0.3); c.fill();
    ell(c, cx, cy + 0.255 * s, 0.045 * s, 0.05 * s); c.fillStyle = gs(0.5); c.fill();
    c.strokeStyle = gs(0.1); c.lineWidth = 0.012 * s; c.beginPath(); c.moveTo(cx, cy + 0.1 * s); c.lineTo(cx, cy + 0.18 * s); c.moveTo(cx - 0.08 * s, cy + 0.19 * s); c.quadraticCurveTo(cx, cy + 0.24 * s, cx + 0.08 * s, cy + 0.19 * s); c.stroke();
    ell(c, cx, cy + 0.075 * s, 0.062 * s, 0.042 * s); c.fillStyle = gs(0.05); c.fill();
    ell(c, cx - 0.018 * s, cy + 0.062 * s, 0.018 * s, 0.01 * s); c.fillStyle = gs(0.6); c.fill();
    for (const sd of [-1, 1]) {
      ell(c, cx + sd * 0.09 * s, cy - 0.12 * s, 0.03 * s, 0.018 * s); c.fillStyle = gs(f + 0.3); c.fill();
      ell(c, cx + sd * 0.09 * s, cy - 0.06 * s, 0.034 * s, 0.034 * s); c.fillStyle = gs(0.04); c.fill();
      ell(c, cx + sd * 0.09 * s - 0.01 * s, cy - 0.07 * s, 0.01 * s, 0.01 * s); c.fillStyle = gs(1); c.fill();
    }
  };
  // the archival "electronic brain" room: cabinets of tape drives receding, an operator at the console
  const OPX = 0.71, OPY = 0.52; // operator position in the photo (fraction of w,h)
  const mainframeGray = (c, w, h) => {
    const vx = w * 0.58, vy = h * 0.4;
    let g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, gs(0.3)); g.addColorStop(0.45, gs(0.55)); g.addColorStop(1, gs(0.7)); c.fillStyle = g; c.fillRect(0, 0, w, h);
    // ceiling light panels in perspective
    for (let i = 0; i < 6; i++) { const z = 1 / (1 + i * 0.55), y = vy - (vy - 10) * z, hw = w * 0.32 * z, hh = 14 * z; c.fillStyle = gs(0.95, 0.85); c.fillRect(vx - hw, y - hh, hw * 2, hh); }
    // back wall
    c.fillStyle = gs(0.62); c.fillRect(vx - w * 0.09, vy - h * 0.18, w * 0.2, h * 0.3);
    // floor with tiles and sheen
    g = c.createLinearGradient(0, vy, 0, h); g.addColorStop(0, gs(0.62)); g.addColorStop(1, gs(0.82)); c.fillStyle = g;
    c.beginPath(); c.moveTo(0, h); c.lineTo(vx - w * 0.09, vy + h * 0.12); c.lineTo(vx + w * 0.11, vy + h * 0.12); c.lineTo(w, h); c.fill();
    c.strokeStyle = gs(0.5, 0.5); c.lineWidth = 1;
    for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(vx + i * 6, vy + h * 0.12); c.lineTo(vx + i * w * 0.12, h); c.stroke(); }
    for (let i = 1; i < 7; i++) { const z = 1 / (i * 0.6), y = vy + h * 0.12 + (h - vy - h * 0.12) * (1 - z * 0.25) * (i / 7); c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    // left wall of cabinets (tape drives)
    const N = 7;
    for (let i = N - 1; i >= 0; i--) {
      const z0 = 1 / (1 + i * 0.42), z1 = 1 / (1 + (i + 1) * 0.42);
      const x0 = vx - (vx + 40) * z0, x1 = vx - (vx + 40) * z1;
      const t0 = vy - (vy - h * 0.02) * z0, b0 = vy + (h * 0.98 - vy) * z0 * 0.86, t1 = vy - (vy - h * 0.02) * z1, b1 = vy + (h * 0.98 - vy) * z1 * 0.86;
      c.beginPath(); c.moveTo(x0, t0); c.lineTo(x1, t1); c.lineTo(x1, b1); c.lineTo(x0, b0); c.closePath();
      c.fillStyle = gs(0.5 + (i % 2) * 0.06); c.fill(); c.strokeStyle = gs(0.18); c.lineWidth = 2 * z0; c.stroke();
      const mx = (x0 + x1) / 2, cw = (x0 - x1);
      for (const [fy, rr] of [[0.25, 0.22], [0.45, 0.22]]) {
        const yy = H.lerp(t0, b0, fy) * 0.5 + H.lerp(t1, b1, fy) * 0.5;
        for (const fx of [-0.22, 0.22]) {
          ell(c, mx + fx * cw, yy, cw * rr * 0.7, (b0 - t0) * 0.085); c.fillStyle = gs(0.12); c.fill();
          ell(c, mx + fx * cw, yy, cw * rr * 0.62, (b0 - t0) * 0.075); c.fillStyle = gs(0.78); c.fill();
          ell(c, mx + fx * cw, yy, cw * rr * 0.2, (b0 - t0) * 0.024); c.fillStyle = gs(0.2); c.fill();
        }
      }
      for (let k = 0; k < 6; k++) { ell(c, mx - cw * 0.3 + k * cw * 0.12, H.lerp(t0, b0, 0.7), 1.6 * z0 + 0.5, 1.6 * z0 + 0.5); c.fillStyle = gs(k % 2 ? 0.95 : 0.3); c.fill(); }
    }
    // right: console desk with blinking panel, foreground
    c.fillStyle = gs(0.22); c.beginPath(); c.moveTo(w * 0.55, h * 0.66); c.lineTo(w, h * 0.6); c.lineTo(w, h); c.lineTo(w * 0.6, h); c.closePath(); c.fill();
    c.fillStyle = gs(0.42); c.beginPath(); c.moveTo(w * 0.55, h * 0.66); c.lineTo(w, h * 0.6); c.lineTo(w, h * 0.66); c.lineTo(w * 0.56, h * 0.72); c.closePath(); c.fill();
    for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) { ell(c, w * 0.6 + i * w * 0.042, h * 0.75 + j * h * 0.04 - i * 2, 2.6, 2.6); c.fillStyle = gs((i * 7 + j * 3) % 4 ? 0.85 : 0.2); c.fill(); }
    // operator, standing at the console
    const ox = w * OPX, oy = h * OPY, s = h * 0.5;
    c.fillStyle = gs(0.12); // skirt
    c.beginPath(); c.moveTo(ox - 0.13 * s, oy + 0.15 * s); c.lineTo(ox + 0.13 * s, oy + 0.15 * s); c.lineTo(ox + 0.18 * s, oy + 0.62 * s); c.lineTo(ox - 0.17 * s, oy + 0.62 * s); c.fill();
    g = c.createLinearGradient(ox - 0.14 * s, 0, ox + 0.14 * s, 0); g.addColorStop(0, gs(0.95)); g.addColorStop(1, gs(0.62)); c.fillStyle = g; // blouse
    c.beginPath(); c.moveTo(ox - 0.12 * s, oy - 0.2 * s); c.quadraticCurveTo(ox, oy - 0.26 * s, ox + 0.12 * s, oy - 0.2 * s); c.lineTo(ox + 0.13 * s, oy + 0.17 * s); c.lineTo(ox - 0.13 * s, oy + 0.17 * s); c.fill();
    c.strokeStyle = gs(0.85); c.lineWidth = 0.06 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(ox - 0.11 * s, oy - 0.15 * s); c.lineTo(ox - 0.2 * s, oy + 0.08 * s); c.lineTo(ox - 0.3 * s, oy + 0.18 * s); c.stroke();
    ell(c, ox, oy - 0.33 * s, 0.075 * s, 0.09 * s); c.fillStyle = gs(0.72); c.fill();
    ell(c, ox + 0.015 * s, oy - 0.38 * s, 0.09 * s, 0.07 * s); c.fillStyle = gs(0.1); c.fill(); // hair
    ell(c, ox + 0.06 * s, oy - 0.3 * s, 0.04 * s, 0.07 * s); c.fill();
    for (let i = 0; i < 2; i++) { c.fillStyle = gs(0.15); c.fillRect(ox - 0.08 * s + i * 0.1 * s, oy + 0.62 * s, 0.035 * s, 0.2 * s); }
    // ceiling light falloff + floor sheen
    g = c.createRadialGradient(vx, vy - h * 0.2, 0, vx, vy, w * 0.6); g.addColorStop(0, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  };

  const pets = () => {
    if (C.pets) return C.pets;
    const specs = [
      ['cat', { bg: 0.72, fur: 0.42, tabby: true, seed: 11 }], ['dog', { bg: 0.58, fur: 0.7, seed: 12 }], ['dog', { bg: 0.8, fur: 0.35, seed: 13, flip: true, dx: 0.04 }],
      ['cat', { bg: 0.5, fur: 0.75, seed: 14, flip: true }], ['cat', { bg: 0.82, fur: 0.25, seed: 15, dx: -0.05, sc: 1.1 }], ['dog', { bg: 0.66, fur: 0.52, seed: 16, sc: 0.95 }],
    ];
    C.pets = specs.map(([k, v], i) => {
      const img = treat(132, 112, 100 + i, (c, w, h) => (k === 'cat' ? catGray : dogGray)(c, w, h, v), { cell: 3.4, blur: 0.8 });
      return { kind: k, spr: makePrint(img, 300 + i, [i % 2, (i + 1) % 2, 1, 0], 9, 6) };
    });
    return C.pets;
  };

  // ---------- cutout sprites ----------
  const makePrint = (img, seed, torn = [0, 1, 1, 0], border = 12, amp = 7) => {
    const w = img.width + border * 2, h = img.height + border * 2;
    return sprite(w, h, 34, (c) => {
      const outer = edgePoly(w, h, torn, seed, amp);
      shadowFill(c, outer, '#f8f5ee');
      texture(c, outer, 0.35, seed * 13 % 400, seed * 7 % 200);
      const inner = edgePoly(w - 7, h - 7, torn, seed, amp);
      c.save(); pathPoly(c, inner); c.clip(); c.beginPath(); c.rect(-img.width / 2, -img.height / 2, img.width, img.height); c.clip();
      c.drawImage(img, -img.width / 2, -img.height / 2); c.restore();
      c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1; c.strokeRect(-img.width / 2, -img.height / 2, img.width, img.height);
    });
  };
  const makeStrip = (text, font, o = {}) => {
    const m = measure(font, text), tw = m.width, asc = m.actualBoundingBoxAscent, desc = Math.max(1, m.actualBoundingBoxDescent);
    const px = asc / 0.72, padX = o.padX == null ? px * 0.2 : o.padX, padY = o.padY == null ? px * 0.15 : o.padY, w = tw + padX * 2, h = asc + desc + padY * 2;
    const base = -h / 2 + padY + asc;
    const spr = sprite(w, h, 30, (c) => {
      const poly = edgePoly(w, h, o.torn || [0, 0, 0, 0], o.seed || 1, o.amp || 4);
      shadowFill(c, poly, o.bg || CARD, o.sh || 1);
      texture(c, poly, o.bg === INK ? 0.12 : 0.45, (o.seed || 1) * 31 % 600, 0);
      c.fillStyle = o.fg || INK; c.font = font; c.fillText(text, -tw / 2, base);
    });
    spr.base = base; spr.tw = tw; spr.asc = asc;
    if (o.hl) {
      const i = text.indexOf(o.hl), x0 = -tw / 2 + measure(font, text.slice(0, i)).width, ww = measure(font, o.hl).width;
      spr.hl = [x0 - px * 0.07, base - asc * 0.9, ww + px * 0.14, asc * 1.0];
    }
    return spr;
  };
  const greek = (c, x, y, w, lines, lh, seed, font = '400 10px "Libre Baskerville"') => {
    const r = H.rng(seed); c.font = font; c.fillStyle = 'rgba(52,47,41,0.85)';
    for (let l = 0; l < lines; l++) {
      let cx = x + (l === 0 ? 10 : 0); const end = l === lines - 1 ? x + w * (0.3 + r() * 0.5) : x + w;
      while (cx < end - 12) {
        let s = ''; const n = 1 + Math.floor(r() * 8); for (let i = 0; i < n; i++) s += 'etaoinshrdlucmfwypvbg'[Math.floor(Math.pow(r(), 1.6) * 21)];
        const ww = c.measureText(s).width; if (cx + ww > end) break;
        c.fillText(s, cx, y + l * lh); cx += ww + 3.4;
      }
    }
  };
  // newspaper clipping: kicker, serif headline, italic deck with the key phrase (highlight rect returned), greeked columns
  const makeClipping = (o) => {
    const w = o.w, h = o.h; let hlRect = null;
    const spr = sprite(w, h, 34, (c) => {
      const poly = edgePoly(w, h, o.torn || [0, 1, 1, 1], o.seed, 5);
      shadowFill(c, poly, NEWS); texture(c, poly, 0.8, o.seed % 500, 100);
      c.save(); pathPoly(c, poly); c.clip();
      const g = c.createRadialGradient(0, 0, w * 0.3, 0, 0, w * 0.8); g.addColorStop(0, 'rgba(180,150,90,0)'); g.addColorStop(1, 'rgba(180,150,90,0.18)'); c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
      const L = -w / 2 + 22, R = w / 2 - 22; let y = -h / 2 + 30;
      c.fillStyle = INK; c.font = '400 13px "Oswald"'; c.fillText(o.kicker, L, y);
      c.fillRect(L, y + 7, R - L, 2); c.fillRect(L, y + 11, R - L, 0.8); y += 14;
      c.font = `700 ${o.headPx}px "Libre Baskerville"`;
      for (const line of o.head) { y += o.headPx * 1.18; c.fillText(line, L, y); }
      y += 14; c.font = `italic 400 ${o.deckPx}px "Libre Baskerville"`; c.fillStyle = '#2a2622';
      for (const line of o.deck) {
        y += o.deckPx * 1.4;
        const parts = line.split('|');
        let x = L; parts.forEach((p, i) => { const ww = c.measureText(p).width; if (i === 1) hlRect = [x - 4, y - o.deckPx * 0.86, ww + 8, o.deckPx * 1.12]; c.fillText(p, x, y); x += ww; });
      }
      y += 14; c.fillStyle = INK; c.fillRect(L, y, R - L, 0.8);
      const cols = o.cols || 2, gap = 14, cw = (R - L - gap * (cols - 1)) / cols;
      for (let k = 0; k < cols; k++) greek(c, L + k * (cw + gap), y + 18, cw, Math.floor((h / 2 - y - 18) / 13) + 1, 13, o.seed + k);
      c.restore();
    });
    spr.hl = hlRect; return spr;
  };
  // flat map card: land mass, thin dashed route, pin
  const makeMap = () => sprite(270, 180, 30, (c) => {
    const w = 270, h = 180, poly = edgePoly(w, h, [0, 0, 0, 0], 61, 3), nz = NZ();
    shadowFill(c, poly, '#dfe0d6'); texture(c, poly, 0.5, 300, 300);
    c.save(); pathPoly(c, poly); c.clip();
    c.beginPath();
    for (let i = 0; i <= 80; i++) { const a = i / 80 * TAU, rr = 150 + nz.fbm2(Math.cos(a) * 1.5 + 9, Math.sin(a) * 1.5, 4) * 90; const x = -30 + Math.cos(a) * rr * 1.2, y = 40 + Math.sin(a) * rr * 0.7; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.fillStyle = '#c9c3b2'; c.fill(); c.strokeStyle = 'rgba(30,28,25,0.6)'; c.lineWidth = 1; c.stroke();
    c.strokeStyle = 'rgba(30,28,25,0.25)'; c.lineWidth = 0.7; for (let i = -6; i < 7; i++) { c.beginPath(); c.moveTo(i * 40, -h); c.lineTo(i * 40 + 30, h); c.stroke(); }
    c.setLineDash([5, 4]); c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-120, 70); c.bezierCurveTo(-60, 0, -10, 40, 30, -20); c.stroke(); c.setLineDash([]);
    c.restore();
    c.fillStyle = INK; c.font = '700 17px "Oswald"'; c.fillText('ITHACA, N.Y.', 46, -18); c.font = '400 12px "Oswald"'; c.fillText('1958', 46, -2);
  });
  // map pin, drawn live (so it can drop on steps)
  const pin = (c, x, y, s = 1, col = RED) => {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = 'rgba(30,20,10,0.25)'; ell(c, 5, 2, 7, 3); c.fill();
    c.strokeStyle = '#555'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -16); c.stroke();
    ell(c, 0, -22, 8, 8); c.fillStyle = col; c.fill(); ell(c, -2.5, -24.5, 2.5, 2.5); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fill();
    c.restore();
  };
  const blurred = (spr, px) => { const cv = H.layer(spr.cv.width, spr.cv.height), c = cv.getContext('2d'); c.filter = `blur(${px}px)`; c.drawImage(spr.cv, 0, 0); return { ...spr, cv }; };

  // ---------- live marks: highlighter, tape, marker, ink arrows ----------
  // highlighter: translucent, slightly uneven band sweeping left -> right, multiplied into the paper
  const hilite = (c, rect, prog, seed) => {
    if (!rect || prog <= 0) return;
    const [x, y, w, h] = rect, nz = NZ(), L = w * H.clamp(prog), o = seed * 1.7, tilt = (H.rng(seed)() - 0.5) * h * 0.12;
    const top = [], bot = [];
    for (let d = 0; d <= L; d += 6) { top.push([x + d, y + nz.n2(o + d * 0.02, 1) * h * 0.07 + tilt * d / w]); bot.push([x + d, y + h + nz.n2(o + d * 0.02, 5) * h * 0.08 + tilt * d / w]); }
    top.push([x + L + h * 0.08, y + tilt * L / w]); bot.push([x + L - h * 0.08, y + h + tilt * L / w]);
    c.save(); c.globalCompositeOperation = 'multiply';
    c.beginPath(); c.moveTo(x - h * 0.06, y + h * 0.05); top.forEach((p) => c.lineTo(p[0], p[1])); for (let i = bot.length - 1; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]); c.closePath();
    c.fillStyle = 'rgba(255,226,38,0.84)'; c.fill(); c.clip();
    for (let k = 0; k < 4; k++) { // felt streaks along the stroke
      c.fillStyle = k % 2 ? 'rgba(235,190,20,0.22)' : 'rgba(255,240,150,0.3)';
      c.fillRect(x - 10, y + h * (0.12 + k * 0.22) + nz.n2(o + k, 3) * 3, L + 20, h * (0.05 + (k % 3) * 0.03));
    }
    c.fillStyle = 'rgba(230,180,10,0.3)'; ell(c, x + h * 0.08, y + h * 0.5, h * 0.18, h * 0.55); c.fill(); // pooled ink where the tip landed
    if (prog >= 1) { ell(c, x + L - h * 0.05, y + h * 0.5, h * 0.14, h * 0.55); c.fill(); }
    c.restore();
  };
  const tape = (c, x, y, w, h, rot, seed) => {
    const r = H.rng(seed);
    c.save(); c.translate(x, y); c.rotate(rot);
    const p = []; const n = 7;
    p.push([-w / 2, -h / 2]); p.push([w / 2, -h / 2]);
    for (let i = 1; i < n; i++) p.push([w / 2 + (i % 2 ? 3 : -2) + (r() - 0.5) * 3, -h / 2 + h * i / n]);
    p.push([w / 2, h / 2]); p.push([-w / 2, h / 2]);
    for (let i = n - 1; i > 0; i--) p.push([-w / 2 + (i % 2 ? -3 : 2) + (r() - 0.5) * 3, -h / 2 + h * i / n]);
    c.shadowColor = 'rgba(40,28,15,0.22)'; c.shadowBlur = 3; c.shadowOffsetY = 1.5;
    pathPoly(c, p); c.fillStyle = 'rgba(228,216,186,0.8)'; c.fill(); c.shadowColor = 'transparent';
    c.clip(); c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 1;
    for (let i = 0; i < 5; i++) { const yy = -h / 2 + r() * h; c.beginPath(); c.moveTo(-w / 2, yy); c.lineTo(w / 2, yy + (r() - 0.5) * 2); c.stroke(); }
    c.fillStyle = 'rgba(150,130,90,0.12)'; c.fillRect(-w / 2, -h / 2, w, 2); c.fillRect(-w / 2, h / 2 - 2, w, 2);
    c.restore();
  };
  // polyline drawn on by fraction (partial last segment)
  const partial = (c, pts, prog) => {
    const n = pts.length - 1, f = H.clamp(prog) * n, k = Math.floor(f);
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i <= Math.min(k, n); i++) c.lineTo(pts[i][0], pts[i][1]);
    if (k < n) { const a = pts[k], b = pts[k + 1], u = f - k; c.lineTo(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u); }
  };
  const marker = (c, pts, prog, col = RED, lw = 7) => {
    if (prog <= 0) return;
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = col; c.globalAlpha = 0.9; c.lineWidth = lw; partial(c, pts, prog); c.stroke();
    c.globalAlpha = 0.35; c.lineWidth = lw * 0.4; c.translate(lw * 0.18, -lw * 0.15); partial(c, pts, prog); c.stroke();
    c.restore();
  };
  const loopPts = (cx, cy, rx, ry, seed) => {
    const nz = NZ(), pts = [], a0 = -2.3 + seed % 1;
    for (let i = 0; i <= 70; i++) { const u = i / 70, a = a0 + u * TAU * 1.12, k = 1 + nz.n2(seed + u * 3, 2) * 0.06 + u * 0.07; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    return pts;
  };
  const linePts = (ax, ay, bx, by, seed, n = 10, wob = 2) => { const r = H.rng(seed), p = []; for (let i = 0; i <= n; i++) { const u = i / n; p.push([ax + (bx - ax) * u + (r() - 0.5) * wob, ay + (by - ay) * u + (r() - 0.5) * wob]); } return p; };
  const quadPts = (ax, ay, cx, cy, bx, by, n = 32) => { const p = []; for (let i = 0; i <= n; i++) { const u = i / n; p.push([(1 - u) * (1 - u) * ax + 2 * u * (1 - u) * cx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * u * (1 - u) * cy + u * u * by]); } return p; };
  const inkArrow = (c, pts, prog, lw = 2.6, col = INK, dash = null) => {
    if (prog <= 0) return;
    c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; if (dash) c.setLineDash(dash);
    partial(c, pts, prog); c.stroke(); c.setLineDash([]);
    if (prog >= 1) {
      const [x1, y1] = pts[pts.length - 1], [x0, y0] = pts[pts.length - 3], a = Math.atan2(y1 - y0, x1 - x0), L = 9 + lw * 3;
      c.fillStyle = col; c.beginPath(); c.moveTo(x1 + Math.cos(a) * 3, y1 + Math.sin(a) * 3); c.lineTo(x1 + Math.cos(a + 2.7) * L, y1 + Math.sin(a + 2.7) * L); c.lineTo(x1 + Math.cos(a - 2.7) * L, y1 + Math.sin(a - 2.7) * L); c.closePath(); c.fill();
    }
    c.restore();
  };

  // ---------- camera + stepped cutout animation ----------
  // place(): 2.5D parallax. p = depth factor (1 = main plane, <1 behind, >1 in front).
  const place = (c, cam, p, x, y, rot, s, fn) => {
    c.save(); c.translate(640, 360); const k = Math.pow(cam.z, p); c.scale(k, k); c.translate(-cam.x * p, -cam.y * p);
    c.translate(x, y); if (rot) c.rotate(rot); if (s !== 1) c.scale(s, s); fn(c); c.restore();
  };
  // cutout arrival on 12 fps steps: returns null before it lands
  const POP = {
    drop: { s: [1.16, 1.05, 0.985, 1], r: [0.05, 0.015, -0.006, 0] },
    slideL: { dx: [-300, -110, -26, 0], r: [-0.04, -0.015, 0.004, 0] }, slideR: { dx: [300, 110, 26, 0], r: [0.04, 0.015, -0.004, 0] },
    slideU: { dy: [320, 120, 28, 0], r: [0.03, 0.01, -0.003, 0] }, slideD: { dy: [-320, -120, -28, 0], r: [-0.03, -0.01, 0.003, 0] },
  };
  const arrive = (tq, a, kind = 'drop') => {
    if (tq < a - 1e-6) return null;
    const f = Math.min(3, Math.round((tq - a) * 12)), P = POP[kind];
    return { s: P.s ? P.s[f] : 1, r: P.r[f], dx: P.dx ? P.dx[f] : 0, dy: P.dy ? P.dy[f] : 0 };
  };
  const putSpr = (c, cam, p, spr, x, y, rot, s, tq, a, kind, extra) => {
    const A = arrive(tq, a, kind); if (!A) return false;
    place(c, cam, p, x + A.dx, y + A.dy, rot + A.r, s * A.s, (cc) => { drawSpr(cc, spr); if (extra) extra(cc); });
    return true;
  };
  const bgPaper = (c, cam, tint) => {
    c.save(); c.fillStyle = tint || PAPER; c.fillRect(0, 0, 1280, 720); c.restore();
    place(c, cam, 0.2, 0, 0, 0, 1, (cc) => { cc.globalCompositeOperation = 'multiply'; cc.drawImage(fibre(), -1000, -550); });
  };
  const block = (c, cam, p, x, y, w, h, rot, col, seed, torn = [0, 0, 0, 0], amp = 6) => {
    place(c, cam, p, x, y, rot, 1, (cc) => {
      const poly = edgePoly(w, h, torn, seed, amp);
      cc.save(); cc.shadowColor = 'rgba(40,28,15,0.25)'; cc.shadowBlur = 10; cc.shadowOffsetY = 4; pathPoly(cc, poly); cc.fillStyle = col; cc.fill(); cc.restore();
      texture(cc, poly, 0.55, seed * 40 % 300, 0);
    });
  };
  const finish = (c, t, vig = 0.32) => {
    const pats = grainTiles(), f = Math.floor(t * 12), r = H.rng(5000 + f);
    c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.26; c.fillStyle = pats[f % 4];
    c.translate(-r() * 256, -r() * 256); c.fillRect(0, 0, 1280 + 256, 720 + 256); c.restore();
    c.save(); c.globalCompositeOperation = 'multiply';
    const g = c.createRadialGradient(640, 360, 260, 640, 360, 820); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, `rgba(${255 - 90 * vig},${255 - 100 * vig},${255 - 120 * vig},1)`);
    c.fillStyle = g; c.fillRect(0, 0, 1280, 720); c.restore();
  };

  // ---------- shared sprites ----------
  const init = () => {
    if (C.ready) return; C.ready = true;
    fibre(); grainTiles(); pets();
    C.mainImg = treat(560, 380, 7, mainframeGray, { cell: 4.6, blur: 1.1, con: 1.3 });
    C.mainPrint = makePrint(C.mainImg, 21, [0, 1, 1, 0], 15, 9);
    C.clip = makeClipping({ w: 380, h: 470, seed: 41, kicker: 'SCIENCE  ·  JULY 8', head: ['Electronic', '‘Brain’ Teaches', 'Itself'], headPx: 34,
      deck: ['A new machine, its makers say,', '|learns from its own mistakes|'], deckPx: 19, cols: 2 });
    C.clipSmall = makeClipping({ w: 300, h: 260, seed: 43, kicker: 'THE MORNING RECORD', head: ['Can a machine', 'think?'], headPx: 26, deck: ['Experts |are not so sure|'], deckPx: 15, cols: 2, torn: [1, 1, 0, 1] });
    C.map = makeMap();
    C.fg = blurred(makeClipping({ w: 300, h: 240, seed: 47, kicker: 'CONTINUED', head: ['Learning'], headPx: 28, deck: ['…'], deckPx: 14, cols: 3, torn: [1, 1, 1, 1] }), 5);
    C.t1 = makeStrip('THE MACHINE THAT', '400 74px "Anton"', { bg: INK, fg: '#f3efe5', seed: 3 });
    C.t2 = makeStrip('TAUGHT ITSELF', '400 74px "Anton"', { seed: 4, hl: 'TAUGHT ITSELF' });
    // explainer
    C.h1 = makeStrip('HOW DOES', '400 112px "Anton"', { seed: 5 });
    C.h2 = makeStrip('AI LEARN?', '400 112px "Anton"', { seed: 6, bg: CARD, hl: 'LEARN?' });
    C.lab = {};
    for (const s of ['CAT', 'DOG']) C.lab[s] = makeStrip(s, '700 26px "Oswald"', { bg: INK, fg: '#f3efe5', seed: s.length + s.charCodeAt(0), sh: 0.6, padX: 9, padY: 6 });
    for (const s of ['GUESS', 'CHECK', 'ADJUST']) C.lab[s] = makeStrip(s, '700 30px "Oswald"', { bg: INK, fg: '#f3efe5', seed: s.charCodeAt(1), sh: 0.7, padX: 11, padY: 7 });
    C.clipSoft = blurred(C.clip, 3.2);
    C.counterBg = sprite(560, 112, 30, (c) => { const p = edgePoly(560, 112, [0, 0, 0, 0], 71, 3); shadowFill(c, p, CARD); texture(c, p, 0.45, 50, 50); });
    C.card = sprite(360, 430, 34, (c) => {
      const p = edgePoly(360, 430, [0, 0, 0, 0], 81, 3); shadowFill(c, p, CARD); texture(c, p, 0.4, 120, 60);
      c.save(); pathPoly(c, p); c.clip(); c.strokeStyle = 'rgba(70,90,110,0.13)'; c.lineWidth = 1;
      for (let x = -180; x <= 180; x += 20) { c.beginPath(); c.moveTo(x, -215); c.lineTo(x, 215); c.stroke(); }
      for (let y = -215; y <= 215; y += 20) { c.beginPath(); c.moveTo(-180, y); c.lineTo(180, y); c.stroke(); }
      c.restore();
    });
    C.modelTag = makeStrip('THE MODEL', '700 30px "Oswald"', { seed: 88, bg: '#f7f3ea', sh: 0.5, padX: 12, padY: 6 });
    C.newCat = makePrint(treat(186, 156, 77, (c, w, h) => catGray(c, w, h, { bg: 0.62, fur: 0.5, tabby: true, seed: 19, sc: 0.95 }), { cell: 3.8, blur: 0.9 }), 90, [1, 0, 1, 0], 11, 7);
    C.dogQ = makeStrip('dog?', '700 58px "Libre Baskerville"', { seed: 93, bg: NEWS, torn: [1, 0, 1, 0], amp: 5, padX: 22, padY: 16 });
    C.catA = makeStrip('cat', '700 58px "Libre Baskerville"', { seed: 95, bg: NEWS, torn: [1, 0, 1, 0], amp: 5, padX: 30, padY: 16, hl: 'cat' });
    C.accTag = makeStrip('ACCURACY', '700 40px "Oswald"', { seed: 101, bg: CARD, sh: 0.6, padX: 14, padY: 8 });
    C.numBg = sprite(380, 220, 34, (c) => { const p = edgePoly(380, 220, [1, 1, 1, 0], 103, 6); shadowFill(c, p, CARD); texture(c, p, 0.45, 200, 10); });
    C.chart = sprite(600, 430, 34, (c) => {
      const p = edgePoly(600, 430, [0, 0, 0, 0], 105, 3); shadowFill(c, p, CARD); texture(c, p, 0.45, 400, 80);
      c.save(); pathPoly(c, p); c.clip(); c.strokeStyle = 'rgba(70,90,110,0.12)'; c.lineWidth = 1;
      for (let x = -300; x <= 300; x += 20) { c.beginPath(); c.moveTo(x, -215); c.lineTo(x, 215); c.stroke(); }
      for (let y = -215; y <= 215; y += 20) { c.beginPath(); c.moveTo(-300, y); c.lineTo(300, y); c.stroke(); }
      c.restore();
    });
    C.k1 = makeStrip('MORE EXAMPLES', '400 96px "Anton"', { seed: 111 });
    C.k2 = makeStrip('BETTER GUESSES', '400 96px "Anton"', { seed: 112, hl: 'BETTER GUESSES' });
  };

  // =====================================================================================
  // STILL + CLIP: "The machine that taught itself"
  // =====================================================================================
  const S = { block: 0.1, photo: 0.35, tapeA: 0.7, tapeB: 0.8, clip: 0.95, tapeC: 1.3, map: 1.45, pin: 1.7, t1: 1.85, t2: 2.1, hl1: [2.4, 2.85], hl2: [2.95, 3.35], ring: [3.45, 3.95] };
  const drawStill = (c, t) => {
    init();
    const tq = q12(t);
    const cam = { x: -14 + t * 5, y: 4 - t * 2, z: 1.0 + 0.055 * H.ease.inOut(H.clamp(t / 5)) };
    bgPaper(c, cam);
    { const A = arrive(tq, S.block, 'slideR'); if (A) block(c, cam, 0.55, 430 + A.dx, 0, 560, 900, 0, RED, 12, [0, 0, 0, 1]); }
    // foreground-less background clipping peeking at the top left (deep layer)
    putSpr(c, cam, 0.7, C.clipSmall, -520, -250, -0.08, 0.9, tq, 0.2, 'slideD');
    const mp = C.mainPrint, mw = C.mainImg.width, mh = C.mainImg.height;
    putSpr(c, cam, 0.85, mp, -150, -50, -0.022, 1, tq, S.photo, 'drop', (cc) => {
      if (tq >= S.tapeA) tape(cc, -mp.w / 2 + 20, -mp.h / 2 + 8, 110, 32, -0.6, 1);
      if (tq >= S.tapeB) tape(cc, mp.w / 2 - 30, -mp.h / 2 + 4, 104, 30, 0.45, 2);
      const ring = H.clamp((tq - S.ring[0]) / (S.ring[1] - S.ring[0]));
      marker(cc, loopPts((OPX - 0.5) * mw, (OPY - 0.5) * mh + 10, 78, 132, 3.3), ring, RED, 6);
    });
    const cl = C.clip;
    putSpr(c, cam, 0.95, cl, 410, -78, 0.03, 0.93, tq, S.clip, 'slideR', (cc) => {
      hilite(cc, cl.hl, (t - S.hl2[0]) / (S.hl2[1] - S.hl2[0]), 9);
      if (tq >= S.tapeC) tape(cc, -20, -cl.h / 2 + 2, 120, 32, -0.08, 3);
    });
    putSpr(c, cam, 1.05, C.map, 420, 240, -0.05, 1, tq, S.map, 'drop', (cc) => { if (tq >= S.pin) { const A = arrive(tq, S.pin, 'slideD'); pin(cc, 32, -14 + A.dy * 0.12, 1.2); } tape(cc, -120, -78, 70, 24, -0.7, 4); });
    putSpr(c, cam, 1.1, C.t1, -268, 200, -0.022, 1, tq, S.t1, 'drop');
    putSpr(c, cam, 1.1, C.t2, -170, 292, 0.012, 1, tq, S.t2, 'drop', (cc) => hilite(cc, C.t2.hl, (t - S.hl1[0]) / (S.hl1[1] - S.hl1[0]), 5));
    place(c, cam, 1.6, 610, -330, 0.3, 1, (cc) => drawSpr(cc, C.fg));
    finish(c, t);
  };

  // =====================================================================================
  // EXPLAINER: "How does AI learn?" — scenes joined by blurred camera whips and a slid-in sheet
  // =====================================================================================
  const X = {
    h1: 0.25, h2: 0.5, hl0: [0.95, 1.4], tape0: 0.15, whip1: [2.05, 2.35, 2.75],
    card: 2.3, tag: 2.6, prints: [2.5, 2.68, 2.86, 3.04, 3.22, 3.4], labOff: 0.17, counter: 3.05, route: [3.3, 3.65], count: [3.35, 5.6],
    flow0: 3.75, flowGap: 0.17, flowDur: 0.55, flowN: 10, push: [5.85, 6.55],
    np: 6.5, guessLab: 6.95, guessArrow: [7.0, 7.2], dog: 7.25, checkLab: 7.65, ring: [7.75, 8.15], cross: [8.15, 8.4],
    err: [8.45, 8.6], back: [8.6, 9.0], adjLab: 8.7, adjArrow: [8.5, 8.75], tune: [9.0, 9.45], pull: 9.5, cat: 9.6, hlCat: [9.75, 10.05], tick: [9.9, 10.1],
    whip2: [10.2, 10.45, 10.85],
    chart: 10.5, acc: 10.6, num: 10.65, line: [10.9, 12.2], hl97: [12.25, 12.6],
    sheet: [12.85, 13.08], k1: 13.12, arrow: [13.25, 13.45], k2: 13.35, hlK: [13.6, 14.0], pets4: 12.85,
  };
  const D = 15;
  // network on the model card (card-local coordinates)
  const NET = (() => {
    const L = [[-115, [-70, 10, 90]], [0, [-100, -33, 33, 100]], [115, [-30, 50]]], nodes = [], edges = [], r = H.rng(808);
    L.forEach(([x, ys], li) => ys.forEach((y) => nodes.push({ x, y: y + 10, li })));
    for (const a of nodes) for (const b of nodes) if (b.li === a.li + 1) edges.push({ a, b, w0: 0.15 + r() * 0.85, w1: 0.1 + r() * 0.9 });
    return { nodes, edges };
  })();
  const KNOBS = [-100, -34, 34, 100];
  const drawNet = (c, t, tq) => {
    const back = H.clamp((tq - X.back[0]) / (X.back[1] - X.back[0])), tune = H.clamp((tq - X.tune[0]) / (X.tune[1] - X.tune[0]));
    const front = 140 - back * 280; // the error front sweeps from the output side back to the input side
    const redFade = H.clamp(1 - (tq - X.tune[1]) / 0.3);
    for (const e of NET.edges) {
      const w = H.lerp(e.w0, e.w1, tune), mx = (e.a.x + e.b.x) / 2, red = tq >= X.back[0] && mx > front ? redFade : 0;
      c.strokeStyle = red > 0 ? H.rgba(H.mix('#2a2622', RED, red), 1) : `rgba(30,27,24,${0.3 + w * 0.6})`;
      c.lineWidth = 0.8 + w * 3.6 + red * 1.2;
      c.beginPath(); c.moveTo(e.a.x, e.a.y); c.lineTo(e.b.x, e.b.y); c.stroke();
    }
    // flow flashes on the inputs as prints arrive
    let flash = 0; for (let i = 0; i < X.flowN; i++) { const end = X.flow0 + i * X.flowGap + X.flowDur; if (tq >= end - 0.01 && tq < end + 0.17) flash = 1; }
    for (const n of NET.nodes) {
      ell(c, n.x, n.y, 15, 15); c.fillStyle = CARD; c.fill(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
      const hot = (n.li === 0 && flash) || (tq >= X.back[0] && n.x > front && redFade > 0.5);
      ell(c, n.x, n.y, 7, 7); c.fillStyle = hot ? RED : INK; c.fill();
    }
    // knobs (the weights you can turn)
    c.save(); c.translate(0, 168);
    c.strokeStyle = 'rgba(30,27,24,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-150, -30); c.lineTo(150, -30); c.stroke();
    KNOBS.forEach((x, i) => {
      const a0 = -2.2 + i * 0.9, a1 = a0 + [1.4, -1.1, 0.9, -1.6][i], a = H.lerp(a0, a1, tune);
      ell(c, x, 0, 20, 20); c.fillStyle = '#d8d1c0'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
      for (let k = 0; k < 7; k++) { const b = -Math.PI * 1.25 + k * Math.PI * 1.5 / 6; c.beginPath(); c.moveTo(x + Math.cos(b) * 24, Math.sin(b) * 24); c.lineTo(x + Math.cos(b) * 28, Math.sin(b) * 28); c.lineWidth = 1.5; c.stroke(); }
      c.strokeStyle = tune > 0 && tune < 1 ? RED : INK; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + Math.cos(a) * 16, Math.sin(a) * 16); c.stroke();
    });
    c.restore();
  };

  const PR = [[-500, -40, -0.05], [-345, -62, 0.04], [-190, -34, -0.02], [-492, 168, 0.03], [-337, 152, -0.04], [-182, 176, 0.05]];
  const ROUTE = quadPts(-110, 30, 50, -60, 205, 25, 36);
  const CARDP = [400, 20, -0.012];
  const scene1 = (c, cam, t, tq) => {
    bgPaper(c, cam);
    block(c, cam, 0.5, 430, 0, 620, 900, 0, RED, 14, [0, 0, 0, 1]);
    putSpr(c, cam, 0.65, C.clipSmall, -500, 255, 0.07, 0.95, tq, 0, 'slideU');
    const mp = C.mainPrint;
    putSpr(c, cam, 0.8, mp, 345, -30, 0.035, 0.86, tq, 0, 'slideU', (cc) => {
      if (tq >= X.tape0) { tape(cc, -mp.w / 2 + 24, -mp.h / 2 + 6, 110, 32, -0.55, 6); tape(cc, mp.w / 2 - 26, -mp.h / 2 + 6, 104, 30, 0.5, 7); }
    });
    putSpr(c, cam, 1, C.h1, -300, -95, -0.025, 1, tq, X.h1, 'drop');
    putSpr(c, cam, 1, C.h2, -170, 50, 0.016, 1, tq, X.h2, 'drop', (cc) => hilite(cc, C.h2.hl, (t - X.hl0[0]) / (X.hl0[1] - X.hl0[0]), 4));
    place(c, cam, 1.5, 640, -340, 0.4, 1, (cc) => drawSpr(cc, C.fg));
  };
  // counter strip: starts short and grows to the left as digits are added (right edge fixed, numerals right-aligned at x=92)
  const counterStrip = (len) => {
    const cs = C.cnt || (C.cnt = {}); if (cs[len]) return cs[len];
    const proto = '1,000,000'.slice(-len), nw = measure('400 84px "Anton"', proto.replace(/\d/g, '0')).width;
    const w = Math.min(560, Math.round(224 + nw)), off = 280 - w / 2;
    const spr = sprite(560, 112, 30, (c) => { const p = edgePoly(w, 112, [0, 0, 0, 0], 71, 3).map(([x, y]) => [x + off, y]); shadowFill(c, p, CARD); texture(c, p, 0.45, 50, 50); });
    return (cs[len] = spr);
  };
  const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const scene2 = (c, cam, t, tq) => {
    bgPaper(c, cam);
    // background collage (deep layers): red paper peeking behind the model card, a soft out-of-focus clipping, tape
    block(c, cam, 0.45, 640, -380, 760, 300, -0.035, RED, 24, [0, 0, 1, 1], 8);
    place(c, cam, 0.4, 660, 360, 0.07, 0.8, (cc) => drawSpr(cc, C.clipSoft));
    // the data pile sits on a torn sheet of kraft paper (cut paper, not a grey rectangle)
    block(c, cam, 0.55, -380, 60, 620, 560, 0.0, KRAFT, 21, [1, 1, 1, 1], 7);
    place(c, cam, 0.55, -380, 60, 0, 1, (cc) => { tape(cc, 268, -262, 96, 28, 0.6, 25); tape(cc, 250, 268, 96, 28, -0.5, 26); });
    place(c, cam, 0.8, -800, -170, -0.06, 1, (cc) => drawSpr(cc, C.clipSmall));
    place(c, cam, 0.85, -930, 230, 0.05, 0.8, (cc) => { drawSpr(cc, C.mainPrint); tape(cc, 0, -C.mainPrint.h / 2 + 6, 110, 32, 0.05, 23); });
    // the data pile: prints land one by one, each gets its label strip
    const P = pets();
    PR.forEach(([x, y, r], i) => {
      putSpr(c, cam, 0.95, P[i].spr, x, y, r, 1, tq, X.prints[i], 'drop', (cc) => {
        if (tq >= X.prints[i] + X.labOff) { const L = C.lab[P[i].kind.toUpperCase()], A = arrive(tq, X.prints[i] + X.labOff, 'drop'); cc.save(); cc.translate(10, 70); cc.rotate(-r * 1.4 + A.r); cc.scale(A.s, A.s); drawSpr(cc, L); cc.restore(); }
        if (i === 0 && tq >= X.prints[0] + 0.1) tape(cc, 0, -70, 64, 22, 0.1, 30);
      });
    });
    // counter: re-cut numerals on a paper strip
    const cu = H.clamp((tq - X.count[0]) / (X.count[1] - X.count[0])), cv = cu >= 1 ? 1e6 : Math.round(1e6 * H.ease.inOut(cu) / 7) * 7;
    putSpr(c, cam, 1, counterStrip(fmt(cv).length), -330, -262, -0.015, 1, tq, X.counter, 'slideD', (cc) => {
      const v = cv;
      cc.fillStyle = INK; cc.font = '400 84px "Anton"'; cc.textAlign = 'right'; cc.fillText(fmt(v), 92, 30);
      cc.textAlign = 'left'; cc.font = 'italic 400 34px "Libre Baskerville"'; cc.fillText('examples', 110, 22);
    });
    // route line into the model + prints flowing along it
    place(c, cam, 1, 0, 0, 0, 1, (cc) => inkArrow(cc, ROUTE, H.clamp((tq - X.route[0]) / (X.route[1] - X.route[0])), 3, INK, [10, 7]));
    // model card with its network
    putSpr(c, cam, 1, C.card, CARDP[0], CARDP[1], CARDP[2], 1, tq, X.card, 'slideR', (cc) => {
      drawNet(cc, t, tq);
      if (tq >= X.tag) { const A = arrive(tq, X.tag, 'drop'); cc.save(); cc.translate(0, -178); cc.rotate(-0.02 + A.r); cc.scale(A.s, A.s); drawSpr(cc, C.modelTag); cc.restore(); tape(cc, -100, -190, 56, 20, -0.5, 31); tape(cc, 100, -190, 56, 20, 0.5, 32); }
    });
    for (let i = 0; i < X.flowN; i++) {
      const s0 = X.flow0 + i * X.flowGap, u = (tq - s0) / X.flowDur; if (u < 0 || u >= 1) continue;
      const k = Math.min(ROUTE.length - 1, Math.floor(u * (ROUTE.length - 1))), [x, y] = ROUTE[k];
      place(c, cam, 1.02, x, y - 6, (i % 3 - 1) * 0.08, 0.5 - u * 0.25, (cc) => drawSpr(cc, P[i % 6].spr));
    }
    // ---- the loop (camera pushed in on the model) ----
    if (tq >= X.np) { // new photo travels along the route to the input side
      const u = H.clamp((tq - X.np) / 0.34), k = Math.floor(H.ease.out(u) * (ROUTE.length - 1)), [x, y] = ROUTE[Math.min(k, ROUTE.length - 1)];
      const fx = H.lerp(x, 108, u >= 1 ? 1 : 0), fy = H.lerp(y, 40, u >= 1 ? 1 : 0);
      place(c, cam, 1.05, fx, fy, -0.04, 0.55 + 0.45 * H.ease.out(u), (cc) => drawSpr(cc, C.newCat));
    }
    const lab = (key, at, x, y, r) => { if (tq >= at) { const A = arrive(tq, at, 'drop'); place(c, cam, 1.08, x, y, r + A.r, A.s, (cc) => drawSpr(cc, C.lab[key])); } };
    place(c, cam, 1, 0, 0, 0, 1, (cc) => inkArrow(cc, linePts(526, 12, 612, 14, 5, 8, 1.5), H.clamp((tq - X.guessArrow[0]) / (X.guessArrow[1] - X.guessArrow[0])), 3.2));
    lab('GUESS', X.guessLab, 575, -62, -0.03);
    const pulled = tq >= X.pull;
    if (tq >= X.dog && !(pulled && tq >= X.pull + 2 / 12)) {
      const pd = pulled ? -60 : 0;
      putSpr(c, cam, 1.04, C.dogQ, 722, 22 + pd, 0.03, 1, tq, X.dog, 'drop', (cc) => {
        marker(cc, loopPts(-2, 2, 128, 74, 5.5), (tq - X.ring[0]) / (X.ring[1] - X.ring[0]), RED, 7);
        const cr = (tq - X.cross[0]) / (X.cross[1] - X.cross[0]);
        marker(cc, linePts(-70, -34, 72, 36, 8, 8, 3), cr * 2, RED, 8);
        marker(cc, linePts(70, -38, -66, 40, 9, 8, 3), cr * 2 - 1, RED, 8);
      });
    }
    if (tq >= X.cat) putSpr(c, cam, 1.04, C.catA, 722, 18, -0.02, 1, tq, X.cat, 'drop', (cc) => {
      hilite(cc, C.catA.hl, (t - X.hlCat[0]) / (X.hlCat[1] - X.hlCat[0]), 12);
      marker(cc, [[96, -18], [110, 0], [122, 10], [140, -30], [160, -66]], (tq - X.tick[0]) / (X.tick[1] - X.tick[0]), INK, 8);
    });
    lab('CHECK', X.checkLab, 722, 132, 0.02);
    // error signal: red dashed back from the answer into the network
    place(c, cam, 1, 0, 0, 0, 1, (cc) => {
      if (tq < X.tune[1] + 0.3) inkArrow(cc, linePts(612, 40, 520, 38, 6, 8, 1.5), H.clamp((tq - X.err[0]) / (X.err[1] - X.err[0])), 3.2, RED, [9, 6]);
      inkArrow(cc, quadPts(735, 172, 660, 270, 520, 240, 28), H.clamp((tq - X.adjArrow[0]) / (X.adjArrow[1] - X.adjArrow[0])), 3);
    });
    lab('ADJUST', X.adjLab, 420, 242, -0.015);
  };
  const ACC = (u) => 61 + 36 * (1 - Math.pow(1 - u, 2.3));
  const scene3 = (c, cam, t, tq) => {
    bgPaper(c, cam);
    // background collage: red paper and a soft clipping peeking out behind the chart, a clipping pasted on the black sheet
    block(c, cam, 0.55, 560, 330, 700, 300, 0.04, RED, 33, [1, 0, 0, 1], 8);
    place(c, cam, 0.45, 600, -350, -0.07, 0.8, (cc) => drawSpr(cc, C.clipSoft));
    block(c, cam, 0.5, -400, 0, 560, 900, 0, INK, 31, [0, 1, 0, 0]);
    place(c, cam, 0.6, -560, 310, 0.09, 0.85, (cc) => { drawSpr(cc, C.clipSmall); tape(cc, 40, -C.clipSmall.h / 2 + 4, 96, 28, -0.2, 34); });
    const u = H.clamp((tq - X.line[0]) / (X.line[1] - X.line[0]));
    putSpr(c, cam, 0.95, C.accTag, -385, -178, -0.03, 1, tq, X.acc, 'slideD');
    putSpr(c, cam, 1, C.numBg, -385, 10, 0.02, 1, tq, X.num, 'drop', (cc) => {
      const v = Math.round(ACC(u)); cc.fillStyle = INK; cc.font = '400 168px "Anton"'; cc.textAlign = 'center'; cc.fillText(v + '%', 0, 62);
      const m = measure('400 168px "Anton"', v + '%'); hilite(cc, [-m.width / 2 - 14, -50, m.width + 28, 118], (t - X.hl97[0]) / (X.hl97[1] - X.hl97[0]), 21);
      if (tq >= X.num) tape(cc, -150, -105, 80, 26, -0.4, 40);
    });
    putSpr(c, cam, 1, C.chart, 270, 18, 0.015, 1, tq, X.chart, 'slideR', (cc) => {
      const ox = -240, oy = 150, xw = 500, yh = 300, Y = (a) => oy - (a - 55) / 45 * yh;
      cc.strokeStyle = INK; cc.lineWidth = 2.5; cc.beginPath(); cc.moveTo(ox, oy - yh - 10); cc.lineTo(ox, oy); cc.lineTo(ox + xw + 10, oy); cc.stroke();
      cc.font = '400 22px "Oswald"'; cc.fillStyle = INK; cc.textAlign = 'right';
      for (const a of [60, 80, 100]) { cc.fillText(a + '%', ox - 10, Y(a) + 8); cc.strokeStyle = 'rgba(30,27,24,0.25)'; cc.lineWidth = 1; cc.beginPath(); cc.moveTo(ox, Y(a)); cc.lineTo(ox + xw, Y(a)); cc.stroke(); }
      cc.textAlign = 'left'; cc.font = '700 26px "Oswald"'; cc.fillText('TRAINING ROUNDS', ox + 10, oy + 44);
      inkArrow(cc, linePts(ox + 222, oy + 35, ox + 300, oy + 35, 3, 6, 0.5), 1, 2.6);
      const nz = NZ(), pts = []; for (let i = 0; i <= 40; i++) { const k = i / 40; pts.push([ox + 10 + k * (xw - 20), Y(ACC(k) + nz.n2(k * 9, 3) * 4 * (1 - k))]); }
      marker(cc, pts, u, RED, 5);
      for (let i = 0; i <= 40; i += 5) if (i / 40 <= u + 1e-6) { ell(cc, pts[i][0], pts[i][1], 4.5, 4.5); cc.fillStyle = INK; cc.fill(); }
      if (u > 0) { const k = Math.min(40, Math.floor(u * 40)); pin(cc, pts[k][0], pts[k][1], 1.3); }
      if (tq >= X.chart) { tape(cc, -260, -205, 90, 26, -0.6, 41); tape(cc, 270, -200, 90, 26, 0.55, 42); }
    });
  };
  const scene4 = (c, cam, t, tq) => {
    bgPaper(c, cam);
    place(c, cam, 0.45, 610, -330, 0.08, 0.8, (cc) => drawSpr(cc, C.clipSoft));
    place(c, cam, 0.5, -560, 300, -0.07, 0.95, (cc) => { drawSpr(cc, C.map); pin(cc, 32, -14, 1.2); tape(cc, 60, -86, 80, 26, 0.2, 54); });
    block(c, cam, 0.6, -20, 0, 1000, 420, -0.02, RED, 51, [1, 1, 1, 1], 7);
    const P = pets();
    putSpr(c, cam, 0.85, P[0].spr, -520, -235, -0.12, 0.95, tq, X.pets4, 'drop', (cc) => tape(cc, 0, -70, 70, 22, 0.15, 52));
    putSpr(c, cam, 0.85, P[1].spr, 530, 240, 0.1, 0.95, tq, X.pets4 + 0.08, 'drop', (cc) => tape(cc, 0, -70, 70, 22, -0.2, 53));
    putSpr(c, cam, 1, C.k1, -130, -70, -0.02, 1, tq, X.k1, 'drop');
    place(c, cam, 1, 0, 0, 0, 1, (cc) => inkArrow(cc, quadPts(205, -96, 300, -110, 330, -40, 20), H.clamp((tq - X.arrow[0]) / (X.arrow[1] - X.arrow[0])), 9, INK));
    putSpr(c, cam, 1, C.k2, 60, 70, 0.015, 1, tq, X.k2, 'drop', (cc) => hilite(cc, C.k2.hl, (t - X.hlK[0]) / (X.hlK[1] - X.hlK[0]), 31));
  };

  // camera: smooth (continuous t). Returns scene id + x,y,zoom.
  const camAt = (t) => {
    const e3 = (u) => u * u * u;
    if (t < X.whip1[1]) {
      const w = H.clamp((t - X.whip1[0]) / (X.whip1[1] - X.whip1[0]));
      return { sc: 1, x: t * 9 + 1150 * e3(w), y: 0, z: 1 + 0.04 * H.clamp(t / 2.3) };
    }
    if (t < X.whip2[1]) {
      const w = H.clamp((t - X.whip1[1]) / (X.whip1[2] - X.whip1[1])), p = H.ease.inOut(H.clamp((t - X.push[0]) / (X.push[1] - X.push[0])));
      const tail = H.clamp((t - X.whip2[0]) / (X.whip2[1] - X.whip2[0]));
      const z = H.lerp(1 + 0.025 * H.clamp((t - 2.35) / 3.5), 1.4 + 0.05 * H.clamp((t - X.push[1]) / 3.6), p);
      return { sc: 2, x: -1150 * Math.pow(1 - w, 3) + H.lerp((t - 2.35) * 12, 410 + (t - X.push[1]) * 6, p), y: H.lerp(0, 45, p) + 900 * e3(tail) / z, z };
    }
    if (t < X.sheet[1]) {
      const w = H.clamp((t - X.whip2[1]) / (X.whip2[2] - X.whip2[1])), e = H.ease.inOut(H.clamp((t - X.hl97[0] + 0.15) / 0.5));
      return { sc: 3, x: H.lerp(0, -110, e), y: -900 * Math.pow(1 - w, 3), z: 1 + 0.05 * H.clamp((t - 10.45) / 2.4) + 0.1 * e };
    }
    return { sc: 4, x: 0, y: 0, z: 1 + 0.045 * H.clamp((t - 13.1) / 1.9) };
  };
  const SCENES = [null, scene1, scene2, scene3, scene4];

  const drawExplainer = (ctx, t) => {
    init();
    const tq = q12(t), cam = camAt(t);
    // whip blur from camera speed (screen px/s), measured within the same scene
    const ca = camAt(t - 0.006), cb = camAt(t + 0.006);
    const A = ca.sc === cam.sc ? ca : cam, B = cb.sc === cam.sc ? cb : cam, dt = (A === cam || B === cam) ? 0.006 : 0.012;
    const vx = (B.x - A.x) * cam.z / dt, vy = (B.y - A.y) * cam.z / dt, sp = Math.hypot(vx, vy), blur = H.clamp((sp - 700) / 420, 0, 22);
    const L = C.L || (C.L = H.layer(1280, 720)), L2 = C.L2 || (C.L2 = H.layer(1280, 720));
    const target = blur > 0.8 ? L.getContext('2d') : ctx;
    if (target !== ctx) { target.setTransform(1, 0, 0, 1, 0, 0); target.clearRect(0, 0, 1280, 720); }
    SCENES[cam.sc](target, cam, t, tq);
    // the next sheet slides up over the chart on 12 fps steps
    if (cam.sc === 3 && tq >= X.sheet[0]) {
      const u = H.clamp((tq - X.sheet[0]) / (X.sheet[1] - X.sheet[0])), y = 780 * (1 - H.ease.out(u));
      target.save(); target.translate(0, y);
      const poly = edgePoly(1400, 800, [1, 0, 0, 0], 61, 9).map(([x, yy]) => [x + 640, yy + 400 + 6]);
      target.shadowColor = 'rgba(40,28,15,0.45)'; target.shadowBlur = 24; target.shadowOffsetY = -6; pathPoly(target, poly); target.fillStyle = PAPER; target.fill();
      target.shadowColor = 'transparent'; pathPoly(target, poly); target.clip();
      scene4(target, camAt(X.sheet[1]), t, tq);
      target.restore();
    }
    if (target !== ctx) {
      const l2 = L2.getContext('2d'); l2.setTransform(1, 0, 0, 1, 0, 0); l2.clearRect(0, 0, 1280, 720);
      l2.filter = `blur(${(blur * 0.35).toFixed(1)}px)`; l2.drawImage(L, 0, 0); l2.filter = 'none';
      const n = 7, ux = sp ? vx / sp : 1, uy = sp ? vy / sp : 0;
      ctx.save(); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, 1280, 720);
      for (let i = 0; i < n; i++) { const o = (i / (n - 1) - 0.5) * blur * 2.6; ctx.globalAlpha = 1 / (i + 1); ctx.drawImage(L2, ux * o, uy * o); }
      ctx.restore();
    }
    finish(ctx, t, 0.24);
  };

  registerStyle({
    id: 'editorial-collage',
    name: 'Editorial Essay Collage',
    category: 'Popular Explainer Looks',
    description: 'The editorial "animated essay" collage: warm grainy paper, archival halftone prints with torn white borders and soft shadows, newspaper clippings in serif type with a translucent yellow highlighter sweep, masking tape, flat colour blocks and big cut-out condensed headlines.',
    motion: 'Cutouts drop and slide in on 12 fps hand-animated steps while the camera pushes smoothly through parallax layers; the highlighter sweeps left to right and a red marker rings the key detail.',
    fonts: ['400 78px "Anton"', '700 30px "Oswald"', '400 13px "Oswald"', '700 34px "Libre Baskerville"', 'italic 400 19px "Libre Baskerville"', '400 10px "Libre Baskerville"'],
    frameT: 4.8,
    duration: 5,
    readsPixels: false,
    draw(ctx, W, H_, t) { drawStill(ctx, t); },
    explainerDuration: D,
    explainerNote: 'Scenes are joined by fast blurred camera whips that hide the cut, plus a new paper sheet slid up on steps; arrows are thin ink route lines and red marker, numbers are re-cut condensed numerals on paper strips, and the emphasis is the yellow highlighter sweep (plus a red marker ring and cross on the wrong guess).',
    explainer(ctx, W, H_, t) { drawExplainer(ctx, t); },
    explainerSound(k) {
      // all times come from X (the explainer's own timeline above); stepped cutouts land 1-3 frames after they appear
      const LAND = 1 / 12;
      // a cutout sliding across paper: smooth low noise glide, no crinkle
      const slide = (t, dur = 0.25, gain = 1, pan = 0, minor = false) => k.noise(t, { dur, color: 'pink', filter: 'lowpass', f: [[0, 420], [dur, 1100]], q: 0.7, gain: 0.2 * gain, a: dur * 0.35, pan, minor });
      // a paper cutout set down on the table: soft low thump + a dry paper tap
      const put = (t, gain = 1, pan = 0, minor = false) => {
        k.noise(t, { dur: 0.07, color: 'brown', filter: 'lowpass', f: 650, gain: 0.32 * gain, a: 0.002, pan, minor });
        k.tone(t, { f: [[0, 150], [0.07, 70]], dur: 0.09, gain: 0.1 * gain, pan, minor });
        k.noise(t + 0.004, { dur: 0.018, filter: 'bandpass', f: 1700, q: 0.9, gain: 0.07 * gain, pan, minor });
      };
      // highlighter: broad felt tip, a soft breathy swipe (no squeak) plus the sharpie surface texture underneath
      const hl = (a, b, gain = 1, pan = 0, minor = false) => {
        const d = b - a;
        k.noise(a, { dur: d + 0.05, color: 'pink', filter: 'bandpass', f: [[0, 800], [d, 1300]], q: 0.7, gain: 0.2 * gain, a: d * 0.2, hold: d * 0.6, pan, minor });
        k.play('stroke', a, { material: 'sharpie', dur: d, gain: 0.45 * gain, pan, minor });
      };
      const mark = (a, b, gain = 1, pan = 0, minor = false, material = 'marker') => {
        k.noise(a, { dur: 0.024, filter: 'bandpass', f: 1400, q: 1.2, gain: 0.24 * gain, a: 0.001, pan, minor }); // tip touching down
        k.play('stroke', a, { material, dur: b - a, gain, pan, minor });
      };
      const tear = (t, gain = 0.8, pan = 0) => { k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1500, q: 1, gain: 0.22 * gain, a: 0.001, pan, minor: true }); k.play('tape', t, { dur: 0.22, gain: gain * 1.3, pan, minor: true }); };

      k.bed('room', 0, D, { gain: 0.35 });
      k.music('pad', 0, D, { bpm: 70, gain: 0.22, chords: [['D3', 'F3', 'A3', 'C4'], ['Bb2', 'D3', 'F3', 'A3'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'Bb3', 'D4', 'F4'], ['D3', 'F3', 'A3', 'D4']] });

      // 1 HOOK: photo and clipping slide up, tape, the two headline strips drop, highlighter on LEARN?
      slide(0, 0.2, 0.5, 0.4); put(LAND * 3, 0.7, 0.4, true);
      tear(X.tape0, 0.7, 0.3); tear(X.tape0 + 0.1, 0.6, 0.55);
      put(X.h1 + LAND, 1, -0.3); put(X.h2 + LAND, 1, -0.15);
      hl(X.hl0[0], X.hl0[1], 1.1, -0.1);
      // whip: subtle camera whoosh peaking on the hidden cut
      k.play('whoosh', X.whip1[1] - 0.38, { dur: 0.72, top: 1500, gain: 0.5 });

      // 2 DATA: card slides in, prints land one by one with their labels, counter, route line, prints flowing in
      slide(X.card, 0.25, 0.7, 0.5, true); put(X.tag + LAND, 0.7, 0.4, true); tear(X.tag + 0.03, 0.6, 0.4);
      X.prints.forEach((a, i) => { const pan = -0.6 + (i % 3) * 0.2; put(a + LAND, 0.85, pan, true); put(a + X.labOff + LAND, 0.45, pan, true); });
      tear(X.prints[0] + 0.1, 0.7, -0.6);
      slide(X.counter, 0.25, 0.7, -0.3, true);
      mark(X.route[0], X.route[1], 0.6, 0, true, 'pen');
      { // counter ticks: one per visible change in the counting (stepped 12 fps), thinning as the number eases in and out
        let last = -1;
        for (let f = Math.ceil(X.count[0] * 12); f / 12 < X.count[1]; f++) {
          const u = (f / 12 - X.count[0]) / (X.count[1] - X.count[0]), b = Math.floor(H.ease.inOut(u) * 22);
          if (b !== last) { k.play('tick', f / 12, { f: 3000, gain: 1.5, pan: -0.3, minor: true }); last = b; }
        }
        k.play('tock', X.count[1], { f: 520, gain: 0.5, pan: -0.3 }); // 1,000,000 lands
      }
      for (let i = 0; i < X.flowN; i += 2) slide(X.flow0 + i * X.flowGap, X.flowDur, 0.18, -0.1 + i * 0.03, true);
      k.play('whoosh', X.push[0], { dur: X.push[1] - X.push[0], top: 900, gain: 0.25 }); // camera push onto the model

      // 3 GUESS -> CHECK -> ADJUST
      slide(X.np, 0.34, 0.8, -0.3); put(X.np + 0.34, 0.8, -0.3);
      put(X.guessLab + LAND, 0.7, 0.2, true);
      mark(X.guessArrow[0], X.guessArrow[1], 0.6, 0.2, true, 'pen');
      put(X.dog + LAND, 1.0, 0.4);
      put(X.checkLab + LAND, 0.7, 0.4, true);
      mark(X.ring[0], X.ring[1], 1.15, 0.4); // red marker ring round the wrong guess
      mark(X.cross[0], (X.cross[0] + X.cross[1]) / 2, 1.4, 0.4); mark((X.cross[0] + X.cross[1]) / 2, X.cross[1], 1.4, 0.4); // the cross
      k.play('thud', X.cross[0], { f: 95, gain: 0.45, pan: 0.3 });
      k.play('error', X.cross[0] + 0.12, { f: 'D3', gain: 0.32, pan: 0.3 });
      mark(X.err[0], X.err[1], 0.6, 0.3, true, 'pen'); // red dashed signal back
      k.noise(X.back[0], { dur: X.back[1] - X.back[0] + 0.1, color: 'pink', filter: 'bandpass', f: [[0, 1300], [X.back[1] - X.back[0], 350]], q: 1.1, gain: 0.2, a: 0.08, pan: 0.1 }); // error travelling back through the network
      mark(X.adjArrow[0], X.adjArrow[1], 0.55, 0.2, true, 'pen');
      put(X.adjLab + LAND, 0.75, -0.05, true);
      for (let f = Math.ceil(X.tune[0] * 12); f / 12 < X.tune[1]; f++) k.play('click', f / 12, { f: 850, gain: 0.45, pan: (f % 4 - 1.5) * 0.15, minor: true }); // knobs turning on steps
      slide(X.pull, 0.17, 0.7, 0.4); // the wrong answer is pulled away
      put(X.cat + LAND, 1.05, 0.4);
      hl(X.hlCat[0], X.hlCat[1], 1.0, 0.4);
      mark(X.tick[0], X.tick[1], 1.1, 0.5, false, 'sharpie');
      k.play('ding', X.tick[1], { f: 'D5', gain: 0.32, pan: 0.4 });
      k.play('whoosh', X.whip2[1] - 0.38, { dur: 0.72, top: 1300, gain: 0.5 });

      // 4 PROGRESS: chart and number land, red line draws while the % counts, 97% gets the hit and the highlighter
      slide(X.chart, 0.25, 0.6, 0.4, true); put(X.num + LAND, 0.7, -0.4, true); // number scrap drops in
      tear(X.chart + 0.05, 0.6, 0.5); tear(X.num + 0.06, 0.6, -0.5);
      mark(X.line[0], X.line[1], 0.5, 0.3, true);
      { let last = -1; for (let f = Math.ceil(X.line[0] * 12); f / 12 < X.line[1]; f++) { const v = Math.round(ACC(H.clamp((f / 12 - X.line[0]) / (X.line[1] - X.line[0])))); if (v !== last) { k.play('tick', f / 12, { f: 2800 + (v - 61) * 12, gain: 1.4, pan: -0.35, minor: true }); last = v; } } }
      k.play('impact', X.line[1], { gain: 0.7, pan: -0.2 }); // 97% lands: biggest hit
      k.play('ding', X.line[1] + 0.01, { f: 'A4', gain: 0.35, pan: -0.2 });
      hl(X.hl97[0], X.hl97[1], 1.35, -0.3);

      // 5 TAKEAWAY: a new sheet slides up over the chart, strips drop, arrow, highlighter, resolve
      slide(X.sheet[0], X.sheet[1] - X.sheet[0] + 0.05, 1.6, 0);
      put(X.sheet[1], 1.1, 0);
      put(X.k1 + LAND, 1.0, -0.2);
      mark(X.arrow[0], X.arrow[1], 0.9, 0.3, true, 'sharpie');
      put(X.k2 + LAND, 1.0, 0.1);
      hl(X.hlK[0], X.hlK[1], 1.2, 0.1);
      k.play('success', X.hlK[1] + 0.02, { f: 'D5', gain: 0.4 });
    },
  });
}
```
