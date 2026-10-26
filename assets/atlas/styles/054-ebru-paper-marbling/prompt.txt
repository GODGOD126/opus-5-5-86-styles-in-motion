I want an animated explainer made in the "Ebru Paper Marbling" visual style (Generative & Type). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Libre Baskerville
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=block">
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
Name: Ebru Paper Marbling
Family: Generative & Type
Look: Turkish ebru on laid paper: a battal stone ground of floated pigments raked into gel-git chevrons and combed, then suminagashi ring-drops pulled by a stylus into tulips — built with the exact drop and tine transforms.
Motion: Colour drops rain onto the size and bloom, shoving earlier drops into veins; the rake drags the stone into gel-git flames; ring after ring is dropped at one point; then the stylus pulls the rings into a tulip, and a wet sheen glides over the finished bath.
How it explains: The bath is the model: examples land as colour drops, a new picture is a red probe drop that the flow drags toward its guess, the error is a stylus counter-stroke and the adjustment a comb pass that puts the pattern in order; scenes change by lifting the printed sheet off the bath, labels are bookbinder paper labels and arrows are inked stylus strokes.

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

REFERENCE STYLE SOURCE (styles/paper-marbling.js; W/H_ are always 1280x720)
```js
{
  // Ebru / suminagashi marbling, simulated FORWARD with the mathematical marbling transforms
  // (Jaffer & Lu):  ink drop   p' = c + (p-c)·sqrt(1 + r²/|p-c|²)
  //                 tine line  p' = p + α·λ/(d+λ)·M        (d = distance to the stylus line)
  //                 comb       = a periodic set of tine lines with alternating direction
  // Every floated colour is a polygon; each later operation moves all earlier vertices, with
  // adaptive re-subdivision so stretched veins stay smooth. Pigment speckle is sampled in the
  // pre-comb coordinates, so it is dragged along the rake like real floated paint.
  const TAU = Math.PI * 2;
  const PAL = {
    indigo: '#1d2a5e', red: '#a6252b', ochre: '#d89c2c', teal: '#21807c', cream: '#efe3c4',
    ink: '#1b1d27', slate: '#3f5470', rose: '#cf6f5e', sky: '#7ea6c4', sand: '#d9bf86', green: '#4f6b3a',
  };

  // ---- transforms (forward) ----
  const T = {
    drop: (o) => (x, y) => { const dx = x - o.x, dy = y - o.y, d2 = dx * dx + dy * dy + 1e-9, f = Math.sqrt(1 + (o.r * o.r) / d2); return [o.x + dx * f, o.y + dy * f]; },
    tine: (o) => (x, y) => { const d = Math.abs((x - o.x) * -o.my + (y - o.y) * o.mx), z = (o.a * o.l) / (d + o.l); return [x + z * o.mx, y + z * o.my]; },
    // periodic comb: tines every S px along one axis, alternating push direction
    comb: (o) => (x, y) => { const u = o.vertical ? x : y; const dv = combShift(u, o); return o.vertical ? [x, y + dv] : [x + dv, y]; },
    wave: (o) => (x, y) => o.vertical ? [x, y + o.A * Math.sin((x / o.L) * TAU + o.ph)] : [x + o.A * Math.sin((y / o.L) * TAU + o.ph), y],
  };
  function combShift(u, o) {
    const j0 = Math.round((u - o.off) / o.S);
    let s = 0;
    for (let j = j0 - 3; j <= j0 + 3; j++) { const d = Math.abs(u - (o.off + j * o.S)); s += ((j & 1) ? -1 : 1) * (o.a * o.l) / (d + o.l); }
    return s;
  }

  function applyOp(polys, f, maxLen) {
    for (const P of polys) {
      if (P.dead) continue;
      const src = P.pts, out = [];
      const n = src.length / 2;
      const tp = new Array(n);
      for (let i = 0; i < n; i++) tp[i] = f(src[i * 2], src[i * 2 + 1]);
      const push = (ax, ay, bx, by, A, B, depth) => {
        // emits A then (recursively) the midpoints needed so that |A'B'| <= maxLen
        const ddx = B[0] - A[0], ddy = B[1] - A[1];
        if (depth < 5 && ddx * ddx + ddy * ddy > maxLen * maxLen) {
          const mx = (ax + bx) / 2, my = (ay + by) / 2, M = f(mx, my);
          push(ax, ay, mx, my, A, M, depth + 1);
          push(mx, my, bx, by, M, B, depth + 1);
        } else out.push(A[0], A[1]);
      };
      // NB: subdivision samples pre-images; we keep transformed coordinates as the new polygon
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        push(src[i * 2], src[i * 2 + 1], src[j * 2], src[j * 2 + 1], tp[i], tp[j], 0);
      }
      P.pts = out;
      // cull polygons that have left the sheet entirely
      let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
      for (let i = 0; i < out.length; i += 2) { const x = out[i], y = out[i + 1]; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; }
      if (minx > 1500 || maxx < -220 || miny > 940 || maxy < -220) P.dead = true;
    }
  }
  function circle(x, y, r) {
    const n = Math.max(48, Math.min(360, Math.round((TAU * r) / 3)));
    const pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; pts.push(x + Math.cos(a) * r, y + Math.sin(a) * r); }
    return pts;
  }


  // =====================================================================================
  // EXPLAINER — the model is the marbling bath. Examples are drops of colour landing on it
  // (ochre = cat, indigo = dog). A new picture is a red probe drop; the model's "guess" is the
  // way its current flow drags the probe. The error is a counter-stroke of the stylus, and the
  // adjustment is a comb pass that puts the pattern in order. Scenes change the marbler's way:
  // the printed sheet is lifted off the bath, revealing the next bath underneath.
  // =====================================================================================
  const PX = (t, a, b) => H.clamp((t - a) / (b - a));
  const INKB = '#2a2018', REDI = '#a6252b';
  let PM_TEX = null, PM_STILL = null, PM_SPK = null;
  function pmTexture(W, H_) {
    if (PM_TEX) return PM_TEX;
    PM_TEX = H.layer(W, H_); const c = PM_TEX.getContext('2d'), img = c.createImageData(W, H_), d = img.data;
    const nz = H.makeNoise(3), nz2 = H.makeNoise(8), cn = H.makeNoise(44), r = H.rng(9);
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const sp = nz.n2(x * 0.08, y * 0.08) * 0.5 + nz2.n2(x * 0.35, y * 0.35) * 0.5;
      const laid = (x % 3 === 0 ? -0.025 : 0) + ((x + 9) % 64 < 1.5 ? -0.03 : 0);
      const cock = cn.fbm2(x * 0.0044, y * 0.0044, 3) * 0.11 + cn.fbm2(x * 0.035 / 8 + 7, y * 0.035 / 8, 3) * 0.035; // broad cockle + the still's finer drying undulation
      const k = H.clamp(0.93 + sp * 0.07 + laid + cock + (r() - 0.5) * 0.04, 0, 1);
      const o = (y * W + x) * 4; d[o] = d[o + 1] = d[o + 2] = 255 * k; d[o + 3] = 255;
    }
    c.putImageData(img, 0, 0); return PM_TEX;
  }
  function pmStill(W, H_) {
    if (PM_STILL) return PM_STILL;
    PM_STILL = H.layer(W, H_); const st = window.STYLES.find((s) => s.id === 'paper-marbling'); H.render(st, PM_STILL, 7.9); return PM_STILL;
  }
  // pigment pooling at a floated drop's rim: the drop's own colour, darker (not a neutral ink outline)
  const RIM = {}, HALO = {};
  const rimOf = (col) => RIM[col] || (RIM[col] = H.rgba(H.hex(col).map((v) => v * 0.66), 0.72));
  const haloOf = (col) => HALO[col] || (HALO[col] = H.rgba(H.mix(col, '#fff6e2', 0.35), 0.38));
  // cockle (the hero's soft-light undulation from the wetted sheet drying), built once per size
  let PM_COCK = null;
  function pmCockle(W, H_) {
    if (PM_COCK && PM_COCK.w === W) return PM_COCK.c;
    const cn = H.makeNoise(44), sw = Math.round(W / 8), sh = Math.round(H_ / 8);
    const lay = H.layer(sw, sh), lc = lay.getContext('2d'), li = lc.createImageData(sw, sh);
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      const v = cn.fbm2(x * 0.035, y * 0.035, 3), o = (y * sw + x) * 4;
      li.data[o] = li.data[o + 1] = li.data[o + 2] = v > 0 ? 255 : 0; li.data[o + 3] = Math.min(255, Math.abs(v) * 110);
    }
    lc.putImageData(li, 0, 0); PM_COCK = { w: W, c: lay }; return lay;
  }
  // pigment granulation: fine dark/light speckle that only lives inside floated colour. Baked into one
  // repeating tile per pigment, so filling a drop with its colour already carries the granulation.
  let PM_GRAIN = null; const PM_PAT = {};
  function pmGrain() {
    if (PM_GRAIN) return PM_GRAIN;
    const S = 512; PM_GRAIN = new Float32Array(S * S);
    const nz = H.makeNoise(17), r = H.rng(23), w = (x, y, f) => nz.n2(x * f, y * f * 0.42) ; // tileable via 4-corner blend
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const fx = x / S, fy = y / S, n = (xx, yy) => w(xx, yy, 0.5) * 0.6 + nz.n2(xx * 0.09 + 40, yy * 0.05) * 0.4;
      const v = n(x, y) * (1 - fx) * (1 - fy) + n(x - S, y) * fx * (1 - fy) + n(x, y - S) * (1 - fx) * fy + n(x - S, y - S) * fx * fy;
      PM_GRAIN[y * S + x] = H.clamp(0.9 + (v * 1.6 + (r() - 0.5) * 0.5) * 0.16, 0, 1.05);
    }
    return PM_GRAIN;
  }
  function pigment(ctx, col) {
    if (PM_PAT[col]) return PM_PAT[col];
    const S = 512, g = pmGrain(), c3 = H.hex(col), cv = H.layer(S, S), c = cv.getContext('2d'), img = c.createImageData(S, S), d = img.data;
    for (let i = 0; i < S * S; i++) { const k = g[i]; d[i * 4] = Math.min(255, c3[0] * k); d[i * 4 + 1] = Math.min(255, c3[1] * k); d[i * 4 + 2] = Math.min(255, c3[2] * k); d[i * 4 + 3] = 255; }
    c.putImageData(img, 0, 0); return (PM_PAT[col] = ctx.createPattern(cv, 'repeat'));
  }
  function renderPolys(ctx, W, H_, polys, bath) {
    ctx.fillStyle = bath; ctx.fillRect(0, 0, W, H_);
    // the bare size is never flat: a broad, faint tonal drift across the bath
    const bg = ctx.createLinearGradient(0, 0, W, H_); bg.addColorStop(0, 'rgba(255,250,236,0.35)'); bg.addColorStop(0.55, 'rgba(255,250,236,0)'); bg.addColorStop(1, 'rgba(150,120,70,0.12)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
    for (const P of polys) {
      if (P.dead) continue; const p = P.pts;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.closePath();
      ctx.fillStyle = pigment(ctx, P.col); ctx.fill();
      if (P.halo) { ctx.save(); ctx.clip(); ctx.strokeStyle = haloOf(P.col); ctx.lineWidth = 6; ctx.stroke(); ctx.restore(); } // gall halo just inside a fresh drop
      ctx.strokeStyle = rimOf(P.col); ctx.lineWidth = 1; ctx.stroke();
    }
  }
  function finish(ctx, W, H_) {
    // soften like the still (floated colour never has a vector edge): a half-pixel resample of itself,
    // visually the hero's blur(0.6px) at a fraction of the cost; then laid paper, fibre and cockle (pmTexture)
    ctx.save(); ctx.globalAlpha = 0.5; ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height, 0.5, 0.5, W, H_); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(pmTexture(W, H_), 0, 0); ctx.restore();
    H.vignette(ctx, W, H_, 0.2, '40,25,10');
  }
  // bookbinder's paper label: cream, double rule, serif type
  function blabel(ctx, text, x, y, o = {}) {
    const size = o.size || 22; ctx.save();
    ctx.font = `${o.italic ? 'italic ' : ''}700 ${size}px "Libre Baskerville"`; try { ctx.letterSpacing = o.ls || '1px'; } catch (e) {}
    const w = ctx.measureText(text).width + size * 1.4, h = size * 2;
    const ox = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2;
    ctx.fillStyle = 'rgba(30,20,10,0.25)'; ctx.fillRect(ox + 3, y - h / 2 + 4, w, h);
    ctx.fillStyle = o.red ? '#f6e6d6' : '#f3ead2'; ctx.fillRect(ox, y - h / 2, w, h);
    ctx.strokeStyle = o.red ? REDI : INKB; ctx.lineWidth = 1.6; ctx.strokeRect(ox + 4, y - h / 2 + 4, w - 8, h - 8); ctx.lineWidth = 0.6; ctx.strokeRect(ox + 7, y - h / 2 + 7, w - 14, h - 14);
    ctx.fillStyle = o.red ? REDI : INKB; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(text, ox + w / 2, y + 1);
    ctx.restore(); return w;
  }
  function dropLabel(ctx, t, t0, text, x, y, o) { if (t < t0) return; const k = H.ease.out(PX(t, t0, t0 + 0.25)); ctx.save(); ctx.globalAlpha = k; blabel(ctx, text, x, y + (1 - k) * -18, o); ctx.restore(); }
  // inked brush arrow (stylus-drawn line with a tapered head)
  function inkArrow(ctx, pts, p, col = INKB, lw = 4) {
    if (p <= 0) return; let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    let left = L * p, end = pts[0], prev = pts[0]; ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && left > 0; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), q = Math.min(1, left / d); prev = pts[i - 1]; end = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * q, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * q]; ctx.lineTo(end[0], end[1]); left -= d; }
    ctx.stroke(); const a = Math.atan2(end[1] - prev[1], end[0] - prev[0]), hd = lw * 4.5;
    ctx.beginPath(); ctx.moveTo(end[0] + Math.cos(a) * lw, end[1] + Math.sin(a) * lw); ctx.lineTo(end[0] - Math.cos(a - 0.45) * hd, end[1] - Math.sin(a - 0.45) * hd); ctx.quadraticCurveTo(end[0] - Math.cos(a) * hd * 0.6, end[1] - Math.sin(a) * hd * 0.6, end[0] - Math.cos(a + 0.45) * hd, end[1] - Math.sin(a + 0.45) * hd); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  const HEAD = 28; // running head: a story label, so >= 28px
  const pmHeader = (ctx) => blabel(ctx, 'How does AI learn?', 24, 42, { size: HEAD, italic: true, align: 'left' });
  const textW = (ctx, text, size, italic) => { ctx.save(); ctx.font = `${italic ? 'italic ' : ''}700 ${size}px "Libre Baskerville"`; try { ctx.letterSpacing = '1px'; } catch (e) {} const w = ctx.measureText(text).width + size * 1.4; ctx.restore(); return w; };
  // shared battal ground (the untrained model): `n` drops, landing from time t0 over dur
  function battal(polys, t, n, t0, dur, ML, halo = false) {
    const r = H.rng(77), cols = [PAL.ochre, PAL.indigo, PAL.sand, PAL.ochre, PAL.indigo, PAL.cream, PAL.sky];
    const landed = [];
    for (let i = 0; i < n; i++) {
      const x = r.range(-40, 1320), y = r.range(-40, 760), rad = r.range(44, 84), kind = r() < 0.5 ? 'cat' : 'dog';
      const col = kind === 'cat' ? (r() < 0.75 ? PAL.ochre : PAL.sand) : (r() < 0.75 ? PAL.indigo : PAL.sky);
      const ti = t0 + dur * Math.pow(i / n, 0.85); if (t < ti) break;
      const g = H.ease.out(PX(t, ti, ti + 0.3));
      applyOp(polys, T.drop({ x, y, r: Math.max(0.5, rad * g) }), ML); polys.push({ pts: circle(x, y, Math.max(0.5, rad * g)), col, halo: halo && t - ti < 0.7 }); // gall halo only while the drop is fresh
      landed.push({ x, y, kind, ti });
    }
    return landed;
  }
  function probe(polys, x, y, ML, g = 1) {
    [PAL.red, PAL.cream, PAL.red, PAL.cream, PAL.red].forEach((col, i) => { const rad = Math.max(0.5, (i === 0 ? 40 : 19) * g); applyOp(polys, T.drop({ x, y, r: rad }), ML); polys.push({ pts: circle(x, y, rad), col, probe: true }); });
  }
  function centroid(polys) { let sx = 0, sy = 0, n = 0; for (const P of polys) if (P.probe) for (let i = 0; i < P.pts.length; i += 2) { sx += P.pts[i]; sy += P.pts[i + 1]; n++; } return [sx / n, sy / n]; }
  function flowX(polys, t) { // horizontal tine through the probe = the model's flow
    return polys;
  }

  // ---------- scenes ----------
  function mHook(ctx, W, H_, t) {
    const z = 1.08 - 0.06 * H.ease.out(PX(t, 0, 2.4));
    ctx.save(); ctx.translate(W / 2, H_ / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H_ / 2); ctx.drawImage(pmStill(W, H_), 0, 0); ctx.restore();
    const k = H.ease.inOut(PX(t, 1.75, 2.3)), pop = H.ease.back(PX(t, 0.15, 0.5));
    const hs = HEAD / 64, hcx = 24 + textW(ctx, 'How does AI learn?', HEAD, true) / 2;
    if (k < 1) { ctx.save(); ctx.translate(640 + (hcx - 640) * k, 360 + (42 - 360) * k); ctx.scale(pop * (1 - (1 - hs) * k), pop * (1 - (1 - hs) * k)); blabel(ctx, 'How does AI learn?', 0, 0, { size: 64, italic: true }); ctx.restore(); }
    else pmHeader(ctx);
  }
  function mData(ctx, W, H_, t) {
    const polys = [], ML = 4;
    const landed = battal(polys, t, 95, 2.5, 3.1, ML, true);
    renderPolys(ctx, W, H_, polys, PAL.cream); finish(ctx, W, H_);
    // the most recent drops carry their labels
    const placed = [];
    landed.slice(-3).forEach((d, i) => {
      let lx = H.clamp(d.x, 80, 1200), ly = H.clamp(d.y - 80, 200, 470);
      for (let pass = 0; pass < 3; pass++) for (const q of placed) if (Math.abs(q[0] - lx) < 60 + 50 && Math.abs(q[1] - ly) < 60) ly = q[1] - 58; // stack above a crowding label
      placed.push([lx, ly]);
      const a = H.clamp(1 - (t - d.ti - 0.5) / 0.4); if (a > 0) { ctx.save(); ctx.globalAlpha = a; blabel(ctx, d.kind, lx, ly, { size: 28 }); ctx.restore(); }
    });
    dropLabel(ctx, t, 2.9, 'the bath = the model', 960, 110, { size: 30 });
    dropLabel(ctx, t, 3.2, 'ochre = cat · indigo = dog', 1000, 650, { size: 28, italic: true });
    if (t > 2.65) {
      const p = PX(t, 2.7, 5.0), n = p >= 1 ? 1e6 : Math.floor(Math.pow(10, 6 * H.ease.inOut(p))) - 1;
      const w = blabel(ctx, Math.round(n).toLocaleString('en-US'), 40, 600, { size: 64, align: 'left' }); blabel(ctx, 'examples', 40 + w + 14, 610, { size: 30, align: 'left', italic: true });
    }
    pmHeader(ctx);
  }
  function mLoop(ctx, W, H_, t) {
    const polys = [], ML = 4;
    battal(polys, 99, 95, 0, 0.01, ML);
    const adj = PX(t, 8.95, 9.45);
    if (adj > 0) applyOp(polys, T.comb({ vertical: true, S: 90, off: 20, a: 60 * H.ease.inOut(adj), l: 22 }), ML); // adjust: the comb orders the bath
    const pg = PX(t, 6.35, 6.6); if (pg > 0) probe(polys, 640, 330, ML, H.ease.out(pg));
    const f1 = H.ease.inOut(PX(t, 6.8, 7.3)), back = H.ease.inOut(PX(t, 8.35, 8.85)), f2 = H.ease.inOut(PX(t, 9.45, 9.85));
    if (f1 > 0) applyOp(polys, T.tine({ x: 0, y: 330, mx: 1, my: 0, a: 300 * f1, l: 40 }), ML);          // guess: flow drags probe toward DOG
    if (back > 0) applyOp(polys, T.tine({ x: 0, y: 330, mx: -1, my: 0, a: 300 * back, l: 40 }), ML);    // error: counter-stroke drags it back
    if (f2 > 0) applyOp(polys, T.tine({ x: 0, y: 330, mx: -1, my: 0, a: 330 * f2, l: 40 }), ML);        // guess again: now flows to CAT
    renderPolys(ctx, W, H_, polys, PAL.cream); finish(ctx, W, H_);
    const right = t >= 9.85, [px, py] = pg > 0 ? centroid(polys) : [640, 330];
    blabel(ctx, '◀ CAT', 30, 330, { size: 36, align: 'left', red: right });
    blabel(ctx, 'DOG ▶', 1250, 330, { size: 36, align: 'right', red: t >= 7.3 && t < 8.85 });
    dropLabel(ctx, t, 6.35, t >= 8.0 ? 'answer: cat' : 'new picture', 640, 450, { size: 28, italic: true, red: t >= 8.0 });
    if (t >= 6.8 && t < 7.3) inkArrow(ctx, [[600, 250], [900, 250]], PX(t, 6.8, 7.2));
    if (t >= 7.3 && !right) dropLabel(ctx, t, 7.3, 'guess: dog?', 1010, 215, { size: 34 });
    if (t >= 7.85 && !right) { const k = H.ease.out(PX(t, 7.85, 8.05)); ctx.save(); ctx.strokeStyle = REDI; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(1150, 330, 140, 70, -0.05, -1.4, -1.4 + 6.4 * k); ctx.stroke(); ctx.restore(); dropLabel(ctx, t, 7.95, 'check: wrong ✗', 1060, 445, { size: 30, red: true }); }
    if (t >= 8.35 && t < 9.45) { inkArrow(ctx, [[960, 395], [600, 395]], PX(t, 8.35, 8.8), REDI, 6); dropLabel(ctx, t, 8.4, 'error: pull back', 700, 520, { size: 28, red: true }); }
    if (t >= 8.95 && t < 10.5) dropLabel(ctx, t, 8.95, 'adjust: comb the bath', 640, 120, { size: 32, red: true });
    if (right) dropLabel(ctx, t, 9.85, 'cat ✓', 300, 220, { size: 44, red: true });
    const words = ['guess', 'check', 'adjust'], act = t < 7.3 ? -1 : t < 7.85 ? 0 : t < 8.35 ? 1 : t < 9.45 ? 2 : Math.floor((t - 9.45) / 0.16) % 3;
    let x = 120; words.forEach((w, i) => { x += blabel(ctx, w, x, 630, { size: 32, align: 'left', red: i === act }) + 12; if (i < 2) { inkArrow(ctx, [[x, 630], [x + 52, 630]], 1, INKB, 4.5); x += 68; } });
    blabel(ctx, '↻ ×1,000,000', x + 6, 630, { size: 28, italic: true, align: 'left' });
    pmHeader(ctx);
  }
  function mProg(ctx, W, H_, t) {
    const polys = [], ML = 4;
    battal(polys, 99, 95, 0, 0.01, ML);
    const p = H.ease.inOut(PX(t, 10.85, 12.3)), rounds = Math.floor(p * 5);
    // each training round is one more, finer comb pass: chaos combs into order
    const combs = [{ vertical: true, S: 90, off: 20, a: 60, l: 22 }, { vertical: false, S: 120, off: 40, a: 28, l: 30 }, { vertical: true, S: 45, off: 10, a: 22, l: 12 }];
    for (let k = 0; k < Math.min(3, rounds); k++) applyOp(polys, T.comb(combs[k]), ML);
    const sub = H.clamp(p * 5 - rounds); if (rounds < 3) applyOp(polys, T.comb({ ...combs[rounds], a: combs[rounds].a * H.ease.inOut(sub) }), ML);
    renderPolys(ctx, W, H_, polys, PAL.cream); finish(ctx, W, H_);
    // card with accuracy + ink chart
    ctx.save(); ctx.fillStyle = 'rgba(30,20,10,0.25)'; ctx.fillRect(84, 124, 520, 470); ctx.fillStyle = '#f3ead2'; ctx.fillRect(80, 120, 520, 470);
    ctx.strokeStyle = INKB; ctx.lineWidth = 1.6; ctx.strokeRect(86, 126, 508, 458); ctx.lineWidth = 0.6; ctx.strokeRect(90, 130, 500, 450); ctx.restore();
    ctx.save(); ctx.font = 'italic 700 36px "Libre Baskerville"'; ctx.fillStyle = INKB; ctx.fillText('Accuracy', 120, 188);
    const v = Math.round(61 + 36 * p), punch = t >= 12.3 ? 1 + 0.12 * Math.exp(-(t - 12.3) * 9) : 1;
    ctx.translate(120, 320); ctx.scale(punch, punch); ctx.font = '700 120px "Libre Baskerville"'; ctx.fillText(v + '%', 0, 0); ctx.restore();
    if (t >= 12.3) { const k = H.ease.out(PX(t, 12.3, 12.55)); ctx.save(); ctx.strokeStyle = REDI; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(300, 278, 205, 85, -0.04, -2.6, -2.6 + 6.5 * k); ctx.stroke(); ctx.restore(); }
    const x0 = 130, y0 = 545, cw = 420, ch = 160, n = 6, pts = [];
    for (let i = 0; i < n; i++) { const acc = 61 + 36 * (1 - Math.exp(-i / 1.6)) / (1 - Math.exp(-(n - 1) / 1.6)); pts.push([x0 + (i / (n - 1)) * cw, y0 - ((acc - 55) / 45) * ch]); }
    ctx.save(); ctx.strokeStyle = INKB; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 - ch - 10); ctx.lineTo(x0, y0); ctx.lineTo(x0 + cw + 10, y0); ctx.stroke(); ctx.restore();
    inkArrow(ctx, pts, PX(t, 10.9, 12.3), REDI, 3.5);
    ctx.save(); ctx.font = 'italic 400 28px "Libre Baskerville"'; ctx.fillStyle = INKB; ctx.fillText('training rounds →', x0, y0 + 32); ctx.restore();
    dropLabel(ctx, t, 10.75, `comb pass ${Math.min(5, rounds + 1)}: chaos → order`, 940, 640, { size: 28, italic: true });
    pmHeader(ctx);
  }
  function mTake(ctx, W, H_, t) {
    ctx.drawImage(pmStill(W, H_), 0, 0);
    const k = H.ease.back(PX(t, 13.25, 13.6));
    ctx.save(); ctx.translate(640, 360); ctx.scale(k, k);
    blabel(ctx, 'More examples', 0, -56, { size: 56, italic: true });
    blabel(ctx, '→ better guesses', 0, 60, { size: 56, italic: true, red: true });
    ctx.restore();
  }
  function explainPM(ctx, W, H_, t) {
    const seq = [[0, mHook], [2.4, mData], [6.0, mLoop], [10.5, mProg], [13.0, mTake]];
    let i = 0; for (let k = 0; k < seq.length; k++) if (t >= seq[k][0]) i = k;
    const t0 = seq[i][0], D = 0.55;
    if (i > 0 && t < t0 + D) {
      // the printed sheet is lifted off the bath, peeling from the left edge
      seq[i][1](ctx, W, H_, t);
      const A = H.layer(W, H_); seq[i - 1][1](A.getContext('2d'), W, H_, t0 - 0.01);
      const lx = -80 + (W + 200) * H.ease.inOut(PX(t, t0, t0 + D)), curl = 90;
      ctx.save(); ctx.fillStyle = 'rgba(20,10,0,0.35)'; ctx.fillRect(lx, 0, 40, H_); ctx.restore(); // shadow of the lifted sheet
      ctx.drawImage(A, lx + curl, 0, W, H_, lx + curl, 0, W, H_);
      const g = ctx.createLinearGradient(lx, 0, lx + curl, 0); g.addColorStop(0, '#d9ccad'); g.addColorStop(0.55, '#f5ecd6'); g.addColorStop(1, '#bfae8a');
      ctx.fillStyle = g; ctx.fillRect(lx, 0, curl, H_); // the paper's back, curling up
    } else seq[i][1](ctx, W, H_, t);
  }

  registerStyle({
    id: 'paper-marbling',
    name: 'Ebru Paper Marbling',
    category: 'Generative & Type',
    description: 'Turkish ebru on laid paper: a battal stone ground of floated pigments raked into gel-git chevrons and combed, then suminagashi ring-drops pulled by a stylus into tulips — built with the exact drop and tine transforms.',
    motion: 'Colour drops rain onto the size and bloom, shoving earlier drops into veins; the rake drags the stone into gel-git flames; ring after ring is dropped at one point; then the stylus pulls the rings into a tulip, and a wet sheen glides over the finished bath.',
    fonts: ['700 22px "Libre Baskerville"', 'italic 700 22px "Libre Baskerville"', 'italic 400 15px "Libre Baskerville"'],
    duration: 8,
    frameT: 7.9,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'The bath is the model: examples land as colour drops, a new picture is a red probe drop that the flow drags toward its guess, the error is a stylus counter-stroke and the adjustment a comb pass that puts the pattern in order; scenes change by lifting the printed sheet off the bath, labels are bookbinder paper labels and arrows are inked stylus strokes.',
    explainer(ctx, W, H_, t) { explainPM(ctx, W, H_, t); },
    // Sound: the marbling bath. Colour drops land with small low water plops (pitch from drop size, pan from position,
    // throttled), the stylus and its counter-stroke are soft watery drags across the size, comb passes are a fuller
    // swish with the tines riffling through, scene changes are the wet sheet peeled off the bath, and the bookbinder
    // labels set down with a soft paper tap. A quiet pad sits under it. Timings mirror explainPM / mHook..mTake above.
    explainerSound(k) {
      const D = 14.5, E = H.ease;
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // a colour drop meeting the size: short low bubble plop (stays under ~1 kHz) with a soft body
      const plop = (t, f, g, p) => { k.tone(t, { f: [[0, f], [0.045, f * 2.1]], dur: 0.075, gain: 0.13 * g, a: 0.002, pan: p }); k.tone(t, { f: [[0, 140], [0.06, 90]], dur: 0.08, gain: 0.1 * g, pan: p }); k.noise(t, { dur: 0.03, filter: 'lowpass', f: 700, gain: 0.08 * g, a: 0.001, pan: p }); };
      // label set down on the bench
      const label = (t0, p, g = 1) => { const t = t0 + 0.06; k.withMinor(() => { k.noise(t, { dur: 0.05, filter: 'bandpass', f: 1000, q: 0.7, gain: 0.12 * g, a: 0.003, pan: p }); k.tone(t, { f: 150, dur: 0.05, gain: 0.07 * g, pan: p }); }); };
      // stylus dragged through the bath from pan a to b over dur
      const drag = (t, dur, a, b, g = 1) => {
        const steps = 6; for (let i = 0; i < steps; i++) { const u = i / steps; k.noise(t + u * dur, { dur: dur / steps + 0.08, color: 'pink', filter: 'bandpass', f: 380 + 380 * Math.sin(Math.PI * (u + 0.08)), q: 1.6, gain: 0.13 * g * Math.sin(Math.PI * (u + 0.1)), a: 0.04, pan: a + (b - a) * u }); }
        k.tone(t + dur * 0.3, { f: [[0, 220], [0.05, 420]], dur: 0.07, gain: 0.05 * g, pan: a + (b - a) * 0.3, minor: true });
        k.tone(t + dur * 0.7, { f: [[0, 260], [0.05, 500]], dur: 0.07, gain: 0.04 * g, pan: a + (b - a) * 0.7, minor: true });
      };
      // comb pass: a swish with the tines riffling through the size
      const comb = (t, dur, g = 1) => {
        k.noise(t, { dur: dur + 0.1, color: 'pink', filter: 'lowpass', f: [[0, 500], [dur * 0.5, 1100], [dur + 0.1, 400]], gain: 0.13 * g, a: dur * 0.35 });
        const r = H.rng(Math.round(t * 100)); k.withMinor(() => { for (let x = 0.03; x < dur; x += 0.045 + r() * 0.03) k.noise(t + x, { dur: 0.03, filter: 'bandpass', f: 600 + r() * 500, q: 2, gain: 0.07 * g * Math.sin(Math.PI * x / dur), a: 0.008, pan: (x / dur - 0.5) * 0.8 }); });
      };
      // wet sheet peeled off the bath, left edge first (D = 0.55, inOut)
      const peel = (t0) => {
        const r = H.rng(Math.round(t0 * 10));
        k.noise(t0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.3, 1200], [0.6, 600]], q: 0.9, gain: 0.12, a: 0.25 });
        k.withMinor(() => { for (let x = 0.04; x < 0.55; x += 0.025 + r() * 0.03) { const u = x / 0.55; k.noise(t0 + x, { dur: 0.025, filter: 'bandpass', f: 700 + r() * 800, q: 1.2, gain: 0.1 * Math.sin(Math.PI * u) + 0.02, a: 0.003, pan: -0.7 + 1.4 * E.inOut(u) }); } });
        k.noise(t0 + 0.5, { dur: 0.12, color: 'brown', filter: 'lowpass', f: 300, gain: 0.12, a: 0.01 }); // last of it lets go of the size
      };
      const busy = []; // drop times: counter clicks step around them so neither masks the other
      const counter = (t0, t1, ease, steps, rate, p) => { let last = -1, prev = 0;
        for (let t = t0; t <= t1; t += 0.002) { const s = Math.floor(ease(H.clamp((t - t0) / (t1 - t0))) * steps); if (s !== prev && t - last >= 1 / rate && !busy.some((b) => t > b - 0.02 && t < b + 0.07)) { k.play('tock', t, { f: 700, gain: 0.38, pan: p, minor: true }); last = t; } prev = s; } };

      k.bed('room', 0, D, { gain: 0.3 });
      k.music('pad', 0, D, { bpm: 64, gain: 0.35, chords: [['D3', 'A3', 'C4', 'F4'], ['G2', 'D3', 'B3', 'F4'], ['C3', 'G3', 'C4', 'E4'], ['A2', 'E3', 'A3', 'C4']] });

      // ---- hook: title label pops (back 0.15-0.5), slides to the corner (1.75-2.3)
      label(when(0.15, 0.5, E.back, 1) - 0.06, 0, 1.6);
      k.noise(1.75, { dur: 0.55, color: 'pink', filter: 'lowpass', f: [[0, 600], [0.55, 280]], gain: 0.028, a: 0.2, minor: true });

      // ---- data: peel, then 95 drops at ti = 2.5 + 3.1 (i/95)^0.85 (same seeded draws as battal), labels, counter
      peel(2.4);
      { const r = H.rng(77); let last = -1;
        for (let i = 0; i < 95; i++) {
          const x = r.range(-40, 1320); r.range(-40, 760); const rad = r.range(44, 84); r(); r();
          const ti = 2.5 + 3.1 * Math.pow(i / 95, 0.85);
          if (ti - last < (i < 4 ? 0.1 : 0.16)) continue; last = ti; busy.push(ti);
          k.withMinor(() => plop(ti, 520 - rad * 3, i < 4 ? 1.2 : 0.8, pan(x)));
        } }
      label(2.9, 0.5); label(3.2, 0.55);
      counter(2.72, 4.98, E.inOut, 30, 8, -0.6);
      label(4.94, -0.6, 1.5); k.tone(5.0, { f: 'D3', dur: 0.7, gain: 0.1, a: 0.01, verb: 0.3, pan: -0.5 }); // 1,000,000 lands

      // ---- loop: peel, probe drop, guess drag, wrong, counter-stroke, comb, guess again, cat ✓
      peel(6.0);
      plop(6.35, 300, 1.4, 0); plop(6.42, 380, 0.7, 0); plop(6.5, 420, 0.5, 0); // the red ring drops
      label(6.35, 0);
      drag(6.8, 0.5, -0.1, 0.6); // the flow pulls the probe toward DOG
      label(7.3, 0.5);
      k.play('stroke', 7.85, { material: 'brush', dur: 0.2, gain: 1.4, pan: pan(1150), minor: true }); // red ring round DOG
      label(7.95, 0.5, 1.3);
      k.play('tock', 7.97, { f: 300, gain: 0.7, pan: pan(1100) }); k.play('tock', 8.13, { f: 225, gain: 0.7, pan: pan(1100) }); // check: wrong
      k.play('thud', 7.97, { f: 100, gain: 0.45, pan: pan(1100) });
      drag(8.35, 0.5, 0.6, -0.1, 1.1); // counter-stroke pulls it back
      label(8.4, 0.1);
      label(8.95, 0);
      comb(8.95, 0.5, 0.75); // adjust: the comb orders the bath
      drag(9.45, 0.4, 0, -0.6); // now the flow pulls it to CAT
      label(9.85, -0.4, 1.3);
      ['G4', 'D5'].forEach((n, i) => k.play('ding', 9.88 + i * 0.09, { f: n, gain: 0.5, pan: -0.4 })); // cat ✓

      // ---- progress: peel, comb passes (rounds = floor(5 inOut(p))), red ink chart, counter, 97%
      peel(10.5);
      label(10.75, 0.4);
      for (let r = 0; r < 3; r++) { const a = when(10.85, 12.3, E.inOut, r / 5 + 1e-4), b = when(10.85, 12.3, E.inOut, (r + 1) / 5); comb(a, b - a, 0.6 - r * 0.12); busy.push(a + (b - a) / 2); }
      k.play('stroke', 10.9, { material: 'brush', dur: 1.4, gain: 0.35, pan: -0.4, minor: true });
      counter(10.86, 12.28, E.inOut, 36, 8, -0.5);
      k.play('impact', 12.3, { gain: 1.0, pan: -0.4 });
      plop(12.3, 180, 2.2, -0.3);
      ['D3', 'A3', 'F#4', 'A4'].forEach((n, i) => k.tone(12.32 + i * 0.03, { f: n, type: 'triangle', dur: 1.3, gain: 0.07, a: 0.01, verb: 0.35, filter: 'lowpass', f2: 1800, pan: (i - 1.5) * 0.25 })); // the 97% bloom
      k.play('stroke', 12.32, { material: 'brush', dur: 0.24, gain: 0.8, pan: -0.4, minor: true }); // red ring

      // ---- takeaway: peel back to the finished sheet, labels pop, resolve
      peel(13.0);
      const tk = when(13.25, 13.6, E.back, 1);
      label(tk - 0.06, 0, 1.6);
      ['G2', 'D3', 'B3', 'D4', 'G4'].forEach((n, i) => k.tone(tk + 0.05 + i * 0.05, { f: n, type: 'triangle', dur: 1.2, gain: 0.07, a: 0.01, verb: 0.35, filter: 'lowpass', f2: 1800, pan: (i - 2) * 0.2 }));
    },
    draw(ctx, W, H_, t) {
      const r = H.rng(2024);
      const polys = [];
      const ML = 3.2;
      const drop = (x, y, rad, col) => {
        applyOp(polys, T.drop({ x, y, r: rad }), ML);
        polys.push({ pts: circle(x, y, rad), col });
      };
      // a drop lands at time ti and blooms outward (radius eases to full) — later drops wait
      const land = (ti, x, y, rad, col, dur = 0.3) => {
        if (t < ti) return;
        const g = H.ease.out(H.clamp((t - ti) / dur));
        drop(x, y, Math.max(0.5, rad * g), col);
      };
      const P = (a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
      const op = (k, f) => { if (k > 1e-4) applyOp(polys, f, ML); };
      // 1) battal ground: rows of drops sprinkled from the brush
      const ground = ['indigo', 'sand', 'sky', 'indigo', 'cream', 'teal', 'indigo', 'slate', 'sky', 'indigo', 'sand', 'ochre'];
      for (let i = 0; i < 270; i++) {
        land(0.05 + 2.1 * Math.pow(i / 270, 0.9), r.range(-80, W + 80), r.range(-80, H_ + 80), r.range(28, 64), PAL[ground[i % ground.length]]);
      }
      // fine 'eyes' sprinkled into the stone before raking (become streaks & veins)
      for (let i = 0; i < 160; i++) land(2.15 + 0.4 * (i / 160), r.range(-40, W + 40), r.range(-40, H_ + 40), r.range(3, 11), r.chance(0.55) ? PAL.cream : r.chance(0.5) ? PAL.ochre : PAL.ink, 0.15);
      // 2) gel-git: coarse alternating rake top<->bottom, then a wave, then the fine comb (tarak)
      const ph = 0.36;
      const rake = P(2.6, 3.7), wv = P(3.2, 4.0);
      op(rake, T.comb({ vertical: true, S: 80, off: 20 + ph * 30, a: 70 * rake, l: 22 }));
      op(wv, T.wave({ vertical: false, A: 18 * wv, L: 260, ph: 0.8 + ph }));
      
      // 3) sprinkle of small dark drops (opens tiny eyes in the ground)
      for (let i = 0; i < 40; i++) land(4.0 + 0.35 * (i / 40), r.range(0, W), r.range(0, H_), r.range(4, 9), r.chance(0.5) ? PAL.cream : PAL.ink, 0.12);
      // 4) focal tulip: concentric suminagashi rings dropped at one point
      const fx = 640, fy = 250;
      const rings = ['ochre', 'red', 'cream', 'red', 'cream', 'ochre', 'cream', 'red', 'ink', 'cream', 'red', 'cream', 'teal', 'cream', 'red', 'ochre', 'cream', 'red', 'cream', 'ink', 'cream'];
      rings.forEach((c, i) => land(4.35 + i * 0.045, fx, fy, i === 0 ? 34 : 24, PAL[c], 0.12));
      // side buds
      [[330, 420], [950, 420]].forEach(([bx, by], k) => {
        ['red', 'cream', 'ochre', 'cream', 'red', 'cream', 'ink', 'cream', 'red'].forEach((c, i) => land(4.6 + k * 0.08 + i * 0.05, bx, by, i === 0 ? 20 : 15, PAL[c], 0.12));
      });
      // stem + leaves: a column of small green drops and two leaf drops
      for (let y = 470; y < 700; y += 24) land(5.2 + (y - 470) / 230 * 0.25, fx + Math.sin(y * 0.02) * 4, y, 9, PAL.green, 0.12);
      land(5.45, fx - 62, 560, 26, PAL.green, 0.2); land(5.5, fx + 62, 600, 24, PAL.green, 0.2);
      // 5) stylus: pull through each flower to form the tulip; stem and leaves pulled too
      const p0 = P(5.6, 6.4), p1 = P(5.9, 6.5), p2 = P(6.05, 6.6), p3 = P(6.3, 6.8), swl = P(6.4, 7.0);
      op(p0, T.tine({ x: fx, y: 0, mx: 0, my: 1, a: 260 * p0, l: 16 }));
      op(p1, T.tine({ x: 330, y: 0, mx: 0, my: -1, a: 120 * p1, l: 10 }));
      op(p2, T.tine({ x: 950, y: 0, mx: 0, my: -1, a: 120 * p2, l: 10 }));
      op(p3, T.tine({ x: fx - 62, y: 560, mx: -0.6, my: -0.8, a: 70 * p3, l: 12 }));
      op(p3, T.tine({ x: fx + 62, y: 600, mx: 0.6, my: -0.8, a: 70 * p3, l: 12 }));
      // a slight lateral swirl as the sheet is laid (keeps it from looking rigid)
      op(swl, T.wave({ vertical: true, A: 5 * swl, L: 420, ph: 1.7 }));

      // ---------- render ----------
      ctx.fillStyle = PAL.sand; ctx.fillRect(0, 0, W, H_);
      for (const P of polys) {
        if (P.dead) continue;
        const p = P.pts;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]);
        for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
        ctx.closePath();
        ctx.fillStyle = P.col; ctx.fill();
        // pigment concentrates at the rim of each floated drop: its own colour, darker
        ctx.strokeStyle = rimOf(P.col); ctx.lineWidth = 1; ctx.stroke();
      }

      ctx.save(); ctx.filter = 'blur(0.6px)'; ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, W, H_); ctx.restore();
      // ---------- flow-dragged pigment speckle + paper ----------
      // The rake is a vertical comb, so its inverse shift depends on x only: one combShift per column, and the
      // speckle noise is looked up from a cached pre-comb field (same formula as sampling it per pixel).
      const SPM = 260;
      if (!PM_SPK || PM_SPK.W !== W) {
        const nz = H.makeNoise(3), nz2 = H.makeNoise(8), rr = H.rng(9), RH = H_ + SPM * 2;
        const sp = new Float32Array(W * RH), lr = new Float32Array(W * H_);
        for (let y = 0; y < RH; y++) for (let x = 0; x < W; x++) { const py = y - SPM; sp[y * W + x] = (nz.n2(x * 0.08, py * 0.08) * 0.55 + nz2.n2(x * 0.35, py * 0.35) * 0.45) * 0.12; }
        for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) lr[y * W + x] = (x % 3 === 0 ? -0.025 : 0) + ((x + 9) % 64 < 1.5 ? -0.03 : 0) + (rr() - 0.5) * 0.04; // laid lines, fibre tooth
        PM_SPK = { W, sp, lr };
      }
      const img = ctx.getImageData(0, 0, W, H_), d = img.data;
      const combA = { vertical: true, S: 80, off: 20 + ph * 30, a: 70 * rake, l: 22 };
      const shiftX = new Int32Array(W);
      for (let x = 0; x < W; x++) shiftX[x] = Math.max(-SPM, Math.min(SPM, Math.round(-combShift(x, combA))));
      const { sp, lr } = PM_SPK;
      for (let y = 0; y < H_; y++) {
        for (let x = 0; x < W; x++) {
          const k = 1 + sp[(y + shiftX[x] + SPM) * W + x] + lr[y * W + x];
          const o = (y * W + x) * 4;
          d[o] *= k; d[o + 1] *= k; d[o + 2] *= k;
        }
      }
      ctx.putImageData(img, 0, 0);
      // cockle: broad soft light/dark undulation from the wetted sheet drying
      ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(pmCockle(W, H_), 0, 0, W, H_); ctx.restore();
      // wet sheen gliding across the bath once the pattern is finished
      const gs = H.clamp((t - 6.7) / 1.3);
      if (gs > 0) {
        const gx = -400 + 2100 * H.ease.inOut(gs);
        const lg = ctx.createLinearGradient(gx - 260, 0, gx + 260, 200);
        lg.addColorStop(0, 'rgba(255,250,235,0)'); lg.addColorStop(0.5, 'rgba(255,250,235,0.13)'); lg.addColorStop(1, 'rgba(255,250,235,0)');
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H_); ctx.restore();
      }
      H.vignette(ctx, W, H_, 0.2, '40,25,10');
    },
  });
}
```
