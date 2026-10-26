I want an animated explainer made in the "Radiograph on Lightbox" visual style (Light & Imaging). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Caveat, Courier Prime, Permanent Marker
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Courier+Prime&family=Permanent+Marker&display=block">
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
Name: Radiograph on Lightbox
Family: Light & Imaging
Look: A blue-base X-ray film clipped to a glowing viewer: additive translucent density of a robot hand — hollow-shelled bones, pivot pins, screws, tendons, battery cell and gears — with collimation borders, lead markers, an ID flash, grease-pencil notes, scratches and dust.
Motion: The viewer\u2019s fluorescent tubes stutter on one by one, the film develops from milky fog to deep blue-black top-down like it was dipped in the tank, then a grease pencil circles the loose pin and scrawls a note while the camera slowly pushes in.
How it explains: A radiologist working a lightbox: scenes change by pulling films down and slapping new ones up under the clips, arrows, circles and answers are grease pencil on the glass, the counter is typed by the ID flasher and accuracy is rewritten round by round, with masking-tape labels for the header and takeaway.

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

REFERENCE STYLE SOURCE (styles/x-ray.js; W/H_ are always 1280x720)
```js
{
  // ---------- radiograph of a robot hand on a lightbox ----------
  const dens = (a) => `rgba(255,255,255,${a})`;

  // tapered bone outline between two points (waisted shaft, flared condyles)
  function bonePath(x, x1, y1, x2, y2, w) {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, px = -uy, py = ux;
    const P = (s, o) => [x1 + ux * s + px * o, y1 + uy * s + py * o];
    const hw = w / 2, mw = w * 0.36;
    x.beginPath();
    let p = P(0, -hw); x.moveTo(...p);
    let c = P(L * 0.5, -mw), e = P(L, -hw * 0.92); x.quadraticCurveTo(...c, ...e);
    x.arc(x2, y2, hw * 0.92, Math.atan2(-py, -px), Math.atan2(py, px));
    c = P(L * 0.5, mw); e = P(0, hw); x.quadraticCurveTo(...c, ...e);
    x.arc(x1, y1, hw, Math.atan2(py, px), Math.atan2(-py, -px));
    x.closePath();
  }
  function bone(x, x1, y1, x2, y2, w) {
    bonePath(x, x1, y1, x2, y2, w);
    x.fillStyle = dens(0.11); x.fill();
    x.strokeStyle = dens(0.08); x.lineWidth = 9; x.stroke();
    x.strokeStyle = dens(0.2); x.lineWidth = 3; x.stroke();          // cortical shell
  }
  function pin(x, cx, cy, r) {
    x.fillStyle = dens(0.14); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
    x.strokeStyle = dens(0.75); x.lineWidth = 3.5; x.beginPath(); x.arc(cx, cy, r * 0.62, 0, 7); x.stroke();
    x.fillStyle = dens(0.35); x.beginPath(); x.arc(cx, cy, r * 0.22, 0, 7); x.fill();
  }
  function screw(x, cx, cy, a, len, w) {
    x.save(); x.translate(cx, cy); x.rotate(a);
    x.fillStyle = dens(0.8); x.fillRect(-w / 2, 0, w, len);
    x.fillStyle = dens(0.85); x.beginPath(); x.ellipse(0, 0, w * 0.9, w * 0.45, 0, 0, 7); x.fill();
    x.strokeStyle = dens(0.25); x.lineWidth = 1;
    for (let k = 4; k < len; k += 3) { x.beginPath(); x.moveTo(-w / 2 - 1.5, k); x.lineTo(w / 2 + 1.5, k + 1.5); x.stroke(); }
    x.restore();
  }
  function gear(x, cx, cy, r, teeth, d) {
    x.fillStyle = dens(d); x.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
      const a = i / (teeth * 2) * Math.PI * 2, rr = i % 2 ? r : r * 0.84;
      const a2 = (i + 1) / (teeth * 2) * Math.PI * 2;
      x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); x.lineTo(cx + Math.cos(a2) * rr, cy + Math.sin(a2) * rr);
    }
    x.closePath(); x.fill();
    x.fillStyle = dens(d * 0.8); x.beginPath(); x.arc(cx, cy, r * 0.25, 0, 7); x.fill();
  }

  // draws one robot hand into density ctx x (local coords: wrist at 0,0; fingers up)
  function hand(x, sil, curl, t) {
    const fingers = [
      { b: [-80, -236], a: -0.17, L: [92, 60, 46], w: 31, m: [-44, -86] },
      { b: [-18, -254], a: -0.04, L: [104, 68, 50], w: 32, m: [-12, -92] },
      { b: [44, -244], a: 0.09, L: [96, 63, 47], w: 31, m: [20, -90] },
      { b: [100, -210], a: 0.24, L: [74, 50, 40], w: 27, m: [50, -80] },
    ];
    const thumb = { b: [-108, -124], a: -0.82, L: [70, 56, 46], w: 32, m: [-56, -60] };
    const chains = [];
    const chain = (f, isThumb) => {
      let [cx, cy] = f.b, a = f.a; const pts = [[cx, cy]];
      f.L.forEach((len, i) => {
        a += (i === 0 ? 0 : curl * (isThumb ? 0.25 : 0.12)) + Math.sin(t * 1.3 + i + f.b[0]) * 0.015;
        cx += Math.sin(a) * len; cy -= Math.cos(a) * len; pts.push([cx, cy]);
      });
      return pts;
    };
    const all = fingers.map((f) => ({ f, pts: chain(f, false) }));
    const th = { f: thumb, pts: chain(thumb, true) };
    all.push(th);
    // ---- soft tissue (silicone skin glove) silhouette ----
    sil.lineCap = 'round'; sil.lineJoin = 'round'; sil.strokeStyle = '#fff'; sil.fillStyle = '#fff';
    all.forEach(({ f, pts }) => {
      sil.lineWidth = f.w * 1.6; sil.beginPath(); sil.moveTo(...f.m); pts.forEach((p) => sil.lineTo(...p)); sil.stroke();
    });
    sil.beginPath(); sil.moveTo(-120, -40); sil.quadraticCurveTo(-158, -150, -110, -246); sil.lineTo(128, -222);
    sil.quadraticCurveTo(146, -110, 112, -20); sil.quadraticCurveTo(80, 40, 70, 260); sil.lineTo(-74, 260); sil.quadraticCurveTo(-80, 40, -120, -40); sil.fill();

    // ---- forearm actuator rods ----
    bone(x, -40, 300, -34, 52, 36); bone(x, 40, 300, 34, 56, 32);
    x.fillStyle = dens(0.35); x.fillRect(-46, 120, 8, 150); x.fillRect(36, 130, 7, 140); // piston rods inside
    // ---- wrist bearing ring ----
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2; x.fillStyle = dens(0.42);
      x.beginPath(); x.arc(Math.cos(a) * 58, 26 + Math.sin(a) * 20, 6, 0, 7); x.fill();
    }
    x.strokeStyle = dens(0.28); x.lineWidth = 5; x.beginPath(); x.ellipse(0, 26, 66, 25, 0, 0, 7); x.stroke();
    x.beginPath(); x.ellipse(0, 26, 50, 16, 0, 0, 7); x.stroke();
    // ---- carpal servo block ----
    [[-62, -78, 54, 50], [-6, -86, 58, 54], [52, -76, 48, 48]].forEach(([sx, sy, sw, sh], i) => {
      x.fillStyle = dens(0.13); x.beginPath(); x.roundRect(sx, sy, sw, sh, 6); x.fill();
      x.strokeStyle = dens(0.3); x.lineWidth = 3; x.stroke();
      gear(x, sx + sw / 2, sy + sh / 2, sw * 0.32, 12, 0.32);
      x.strokeStyle = dens(0.12); x.lineWidth = 1.2;
      for (let k = 0; k < 7; k++) { x.beginPath(); x.moveTo(sx + 6, sy + 6 + k * 2); x.lineTo(sx + sw - 6, sy + 6 + k * 2); x.stroke(); }
      screw(x, sx + 6, sy + sh - 4, 0, 10, 5); screw(x, sx + sw - 6, sy + sh - 4, 0, 10, 5);
    });
    // ---- palm: battery cell + PCB ----
    x.fillStyle = dens(0.08); x.beginPath(); x.roundRect(-92, -210, 190, 112, 8); x.fill(); // PCB
    x.strokeStyle = dens(0.1); x.lineWidth = 1.2;
    for (let k = 0; k < 14; k++) { x.beginPath(); x.moveTo(-86, -200 + k * 7.5); x.lineTo(-30 + (k % 3) * 12, -200 + k * 7.5); x.lineTo(-20 + (k % 3) * 12, -190 + k * 7.5); x.stroke(); }
    x.fillStyle = dens(0.3); x.fillRect(30, -190, 44, 30); x.fillRect(-70, -136, 26, 18); x.fillRect(50, -140, 16, 22);
    x.fillStyle = dens(0.45); for (let k = 0; k < 8; k++) { x.fillRect(28 + k * 6, -194, 2, 4); x.fillRect(28 + k * 6, -160, 2, 4); }
    // battery (rolled cell: concentric layers)
    x.save(); x.translate(-6, -150); x.rotate(0.02);
    x.fillStyle = dens(0.12); x.beginPath(); x.roundRect(-22, -48, 44, 96, 10); x.fill();
    x.strokeStyle = dens(0.38); x.lineWidth = 3; x.stroke();
    x.strokeStyle = dens(0.09); x.lineWidth = 1;
    for (let k = 1; k < 6; k++) { x.beginPath(); x.roundRect(-22 + k * 3.5, -48 + k * 3, 44 - k * 7, 96 - k * 6, 8); x.stroke(); }
    x.fillStyle = dens(0.5); x.fillRect(-6, -54, 12, 6);
    x.restore();
    // ---- metacarpals ----
    all.forEach(({ f }) => bone(x, f.m[0], f.m[1], f.b[0], f.b[1], f.w * 0.92));
    // ---- phalanges + joints ----
    all.forEach(({ f, pts }) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const w = f.w * (1 - i * 0.12);
        bone(x, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w);
      }
      pts.slice(0, -1).forEach((p, i) => pin(x, p[0], p[1], f.w * (0.42 - i * 0.04)));
      // fingertip sensor pad + chip
      const tip = pts[pts.length - 1], pr = pts[pts.length - 2], a = Math.atan2(tip[1] - pr[1], tip[0] - pr[0]);
      x.save(); x.translate(tip[0], tip[1]); x.rotate(a);
      x.fillStyle = dens(0.4); x.fillRect(-16, -5, 12, 10);
      x.restore();
      // tendon cables (steel), both sides of each finger
      [-1, 1].forEach((sd) => {
        x.strokeStyle = dens(0.22); x.lineWidth = 1.4; x.beginPath();
        const o = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy); return [-dy / L * sd * f.w * 0.36, dx / L * sd * f.w * 0.36]; };
        const om = o(f.m, f.b); x.moveTo(f.m[0] + om[0], f.m[1] + om[1] + 40);
        for (let i = 0; i < pts.length - 1; i++) { const op = o(pts[i], pts[i + 1]); x.lineTo(pts[i][0] + op[0], pts[i][1] + op[1]); x.lineTo(pts[i + 1][0] + op[0] * 0.8, pts[i + 1][1] + op[1] * 0.8); }
        x.stroke();
      });
      // screws at metacarpal heads
      screw(x, f.m[0] + 4, f.m[1] - 6, Math.atan2(f.b[0] - f.m[0], -(f.b[1] - f.m[1])) + Math.PI, 18, 5);
    });
    // wiring loom from wrist into palm
    x.strokeStyle = dens(0.14); x.lineWidth = 1.3;
    for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(-12 + k * 5, 280); x.bezierCurveTo(-10 + k * 6, 120, 30 - k * 8, -30, -40 + k * 18, -100); x.stroke(); }
    return all;
  }

  // ================= EXPLAINER: a radiologist working a lightbox; films are slapped up and pulled down =================
  let exNoise = null;
  function getFilmNoise(W, Hh) {
    if (exNoise) return exNoise;
    const nz = H.makeNoise(31), R = H.rng(919), mott = new Float32Array(W * Hh), grain = new Float32Array(W * Hh);
    const LW = W / 4, LH = Hh / 4, low = new Float32Array((LW + 1) * (LH + 1));
    for (let y = 0; y <= LH; y++) for (let x = 0; x <= LW; x++) low[y * (LW + 1) + x] = nz.fbm2(x * 0.016, y * 0.016, 3) * 0.04;
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
      const fx = x / 4, fy = y / 4, ix = fx | 0, iy = fy | 0, ax = fx - ix, ay = fy - iy, j = iy * (LW + 1) + ix;
      mott[y * W + x] = (low[j] * (1 - ax) + low[j + 1] * ax) * (1 - ay) + (low[j + LW + 1] * (1 - ax) + low[j + LW + 2] * ax) * ay;
      grain[y * W + x] = (R() + R() + R() - 1.5) * 0.05;
    }
    return (exNoise = { mott, grain });
  }
  function gearR(x, cx, cy, r, teeth, d, rot) { x.save(); x.translate(cx, cy); x.rotate(rot); gear(x, 0, 0, r, teeth, d); x.restore(); }
  function catSkull(x, cx, cy, s) {
    x.fillStyle = dens(0.07); x.beginPath(); x.ellipse(cx, cy + s * 0.05, s * 1.1, s * 0.95, 0, 0, 7); x.fill();
    x.beginPath(); x.moveTo(cx - s * 1.0, cy - s * 0.3); x.lineTo(cx - s * 0.85, cy - s * 1.35); x.lineTo(cx - s * 0.3, cy - s * 0.85); x.fill();
    x.beginPath(); x.moveTo(cx + s * 1.0, cy - s * 0.3); x.lineTo(cx + s * 0.85, cy - s * 1.35); x.lineTo(cx + s * 0.3, cy - s * 0.85); x.fill();
    x.fillStyle = dens(0.12); x.strokeStyle = dens(0.24); x.lineWidth = 4;
    x.beginPath(); x.ellipse(cx, cy - s * 0.12, s * 0.82, s * 0.66, 0, 0, 7); x.fill(); x.stroke();
    x.strokeStyle = dens(0.3); x.lineWidth = 5;
    x.beginPath(); x.arc(cx - s * 0.38, cy - s * 0.05, s * 0.24, 0, 7); x.stroke(); x.beginPath(); x.arc(cx + s * 0.38, cy - s * 0.05, s * 0.24, 0, 7); x.stroke();
    x.fillStyle = dens(0.1); x.beginPath(); x.ellipse(cx, cy + s * 0.38, s * 0.36, s * 0.24, 0, 0, 7); x.fill(); x.strokeStyle = dens(0.18); x.lineWidth = 3; x.stroke();
    x.fillStyle = dens(0.45); for (let k = -3; k <= 3; k++) x.fillRect(cx + k * s * 0.08 - 2, cy + s * 0.55, 4, k === -3 || k === 3 ? 14 : 7);
    x.strokeStyle = dens(0.22); x.lineWidth = 4; x.beginPath(); x.arc(cx, cy + s * 0.35, s * 0.48, 0.3, Math.PI - 0.3); x.stroke();
  }
  function dogSkull(x, cx, cy, s) {
    x.fillStyle = dens(0.07);
    x.beginPath(); x.ellipse(cx - s * 0.2, cy, s * 0.9, s * 0.75, 0, 0, 7); x.fill();
    x.beginPath(); x.roundRect(cx, cy - s * 0.3, s * 1.25, s * 0.62, s * 0.3); x.fill();
    x.beginPath(); x.ellipse(cx - s * 0.75, cy + s * 0.2, s * 0.3, s * 0.65, 0.3, 0, 7); x.fill();
    x.fillStyle = dens(0.12); x.strokeStyle = dens(0.24); x.lineWidth = 4;
    x.beginPath(); x.ellipse(cx - s * 0.3, cy - s * 0.12, s * 0.65, s * 0.5, 0, 0, 7); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(cx + s * 0.05, cy - s * 0.32); x.lineTo(cx + s * 1.15, cy - s * 0.12); x.lineTo(cx + s * 1.15, cy + s * 0.12); x.lineTo(cx + s * 0.05, cy + s * 0.2); x.fill(); x.stroke();
    x.strokeStyle = dens(0.3); x.lineWidth = 5; x.beginPath(); x.arc(cx - s * 0.05, cy - s * 0.18, s * 0.2, 0, 7); x.stroke();
    x.fillStyle = dens(0.45); for (let k = 0; k < 8; k++) x.fillRect(cx + s * 0.15 + k * s * 0.12, cy + s * 0.14, 4, k === 6 ? 14 : 7);
    x.strokeStyle = dens(0.22); x.lineWidth = 4; x.beginPath(); x.moveTo(cx - s * 0.5, cy + s * 0.3); x.quadraticCurveTo(cx + s * 0.4, cy + s * 0.55, cx + s * 1.1, cy + s * 0.25); x.stroke();
  }
  function robotHead(x, cx, cy, s, rot, glow) {
    x.fillStyle = dens(0.06); x.strokeStyle = dens(0.28); x.lineWidth = 7;
    x.beginPath(); x.roundRect(cx - s, cy - s * 0.9, s * 2, s * 1.7, s * 0.35); x.fill(); x.stroke();
    x.strokeStyle = dens(0.12); x.lineWidth = 3; x.beginPath(); x.roundRect(cx - s * 0.88, cy - s * 0.78, s * 1.76, s * 1.46, s * 0.28); x.stroke();
    x.strokeStyle = dens(0.55); x.lineWidth = 7; x.beginPath(); x.arc(cx - s * 0.45, cy - s * 0.35, s * 0.2, 0, 7); x.stroke(); x.beginPath(); x.arc(cx + s * 0.45, cy - s * 0.35, s * 0.2, 0, 7); x.stroke();
    x.fillStyle = dens(0.18); x.beginPath(); x.arc(cx - s * 0.45, cy - s * 0.35, s * 0.1, 0, 7); x.arc(cx + s * 0.45, cy - s * 0.35, s * 0.1, 0, 7); x.fill();
    // the "learning" mechanism: three gears (weights) + chip
    gearR(x, cx - s * 0.42, cy + s * 0.25, s * 0.26, 12, 0.3, rot[0]);
    gearR(x, cx + s * 0.02, cy + s * 0.32, s * 0.2, 10, 0.3, rot[1]);
    gearR(x, cx + s * 0.42, cy + s * 0.22, s * 0.24, 11, 0.3, rot[2]);
    x.fillStyle = dens(0.25 + glow * 0.3); x.fillRect(cx - s * 0.2, cy - s * 0.72, s * 0.4, s * 0.22);
    x.fillStyle = dens(0.5); for (let k = 0; k < 6; k++) { x.fillRect(cx - s * 0.18 + k * s * 0.07, cy - s * 0.78, 3, 6); x.fillRect(cx - s * 0.18 + k * s * 0.07, cy - s * 0.48, 3, 6); }
    x.strokeStyle = dens(0.12); x.lineWidth = 1.5;
    for (let k = 0; k < 5; k++) { x.beginPath(); x.moveTo(cx - s * 0.2 + k * s * 0.1, cy - s * 0.5); x.bezierCurveTo(cx - s * 0.3 + k * s * 0.15, cy - s * 0.1, cx - s * 0.5 + k * s * 0.2, cy, cx - s * 0.42 + k * s * 0.2, cy + s * 0.1); x.stroke(); }
    screw(x, cx - s * 0.85, cy - s * 0.75, 0.3, 16, 5); screw(x, cx + s * 0.85, cy - s * 0.75, -0.3, 16, 5);
    screw(x, cx - s * 0.85, cy + s * 0.65, 2.8, 16, 5); screw(x, cx + s * 0.85, cy + s * 0.65, -2.8, 16, 5);
    bone(x, cx - s * 0.25, cy + s * 0.8, cx - s * 0.25, cy + s * 1.35, s * 0.2); bone(x, cx + s * 0.25, cy + s * 0.8, cx + s * 0.25, cy + s * 1.35, s * 0.2);
    x.strokeStyle = dens(0.4); x.lineWidth = 4; x.beginPath(); x.moveTo(cx, cy - s * 0.9); x.lineTo(cx, cy - s * 1.2); x.stroke();
    x.fillStyle = dens(0.5); x.beginPath(); x.arc(cx, cy - s * 1.25, 8, 0, 7); x.fill();
  }
  function netFilm(x, cx, cy, s, order, seedN) {
    const R = H.rng(seedN), L = [[-1, 3], [0, 4], [1, 2]], P = [];
    L.forEach(([lx, n], li) => { P.push([]); for (let k = 0; k < n; k++) P[li].push([cx + lx * s * 0.8 + (R() - 0.5) * s * 0.9 * (1 - order), cy + (k - (n - 1) / 2) * s * 0.5 + (R() - 0.5) * s * 0.9 * (1 - order)]); });
    for (let li = 0; li < 2; li++) P[li].forEach((a) => P[li + 1].forEach((b) => {
      const w = R(); if (w > 0.35 + order * 0.65) return;
      x.strokeStyle = dens(0.08 + order * 0.22 * (0.4 + w)); x.lineWidth = 1.5 + order * 2.5; x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke();
    }));
    P.flat().forEach(([px, py]) => { x.fillStyle = dens(0.2 + order * 0.4); x.beginPath(); x.arc(px, py, 6 + order * 4, 0, 7); x.fill(); });
  }

  // lead marker (as the hero's 'R PA'): a faint acrylic holder with dense lead letters inside the field
  function leadMarker(x, s, lx, ly) {
    x.save(); x.globalCompositeOperation = 'source-over'; x.font = '700 30px sans-serif';
    const w = x.measureText(s).width;
    x.fillStyle = dens(0.1); x.beginPath(); x.roundRect(lx - 7, ly - 30, w + 14, 38, 4); x.fill();
    x.fillStyle = dens(0.9); x.fillText(s, lx, ly); x.restore();
  }
  function xrayExplainer(ctx, W, Hh, t) {
    const sm = H.smooth, E = H.ease;
    const hsh = (n) => { const v = Math.sin(n * 78.233 + 1.7) * 43758.5453; return v - Math.floor(v); };
    const { mott, grain } = getFilmNoise(W, Hh);
    const Wr = H.rng(4040);
    // ---- film choreography: [enter, leave, x, y, w, h, rot, content] (films drop in from the top under the clips, get pulled down) ----
    const slide = (tin, tout) => { const a = E.out(sm(tin, tin + 0.35, t)), b = E.in(sm(tout, tout + 0.3, t)); return (1 - a) * -760 + b * 780; };
    const films = [];
    films.push({ tin: -1, tout: 1.9, x: 120, y: 46, w: 1040, h: 700, rot: -0.006, kind: 'hook' });
    for (let k = 0; k < 10; k++) films.push({ tin: 2.75 + k * 0.29, tout: 6.0, x: 70 + (k % 2) * 30 + Math.sin(k * 2.1) * 14, y: 150 + Math.cos(k * 1.7) * 18 + (k % 3) * 10, w: 330, h: 250, rot: Math.sin(k * 3.3) * 0.08, kind: k % 3 === 1 ? 'dog' : 'cat', small: k });
    const modelX = H.lerp(700, 470, E.inOut(sm(6.0, 6.5, t)));
    films.push({ tin: 2.35, tout: 10.3, x: modelX, y: 52, w: 460, h: 600, rot: 0.004, kind: 'model' });
    films.push({ tin: 6.3, tout: 10.3, x: 28, y: 170, w: 300, h: 240, rot: -0.04, kind: 'cat' });
    films.push({ tin: 10.55, tout: 99, x: 90, y: 46, w: 1100, h: 520, rot: 0.003, kind: 'rounds' });
    // ---- density + film masks ----
    const Dc = H.layer(W, Hh), dx = Dc.getContext('2d'); dx.fillStyle = '#000'; dx.fillRect(0, 0, W, Hh); dx.globalCompositeOperation = 'lighter';
    const M = H.layer(W, Hh), mx = M.getContext('2d');
    const adj = sm(8.85, 9.4, t);
    const rot = [0.3 + adj * 2.2, -0.5 - adj * 2.8, 0.1 + adj * 2.5].map((a) => Math.floor(a * 6) / 6 + (adj > 0 && adj < 1 ? 0 : 0));
    const drawn = [];
    for (const F of films) {
      const oy = slide(F.tin, F.tout);
      if (oy > 760 || oy < -740) continue;
      drawn.push({ ...F, oy });
      const cx = F.x + F.w / 2, cy = F.y + oy + F.h / 2;
      const tf = (c) => { c.save(); c.translate(cx, cy); c.rotate(F.rot); c.translate(-cx, -cy + 0); };
      // later films sit on top: mask over, density replaced under them
      // R = film, G = exposed (collimated) field; a later film replaces both channels under it
      const ins = F.w < 400 ? 16 : 26;
      tf(mx); mx.fillStyle = 'rgb(255,0,0)'; mx.fillRect(F.x, F.y + oy, F.w, F.h);
      mx.fillStyle = 'rgb(255,255,0)'; mx.fillRect(F.x + ins, F.y + oy + ins, F.w - ins * 2, F.h - ins * 2); mx.restore();
      tf(dx); dx.globalCompositeOperation = 'source-over'; dx.fillStyle = '#000'; dx.fillRect(F.x, F.y + oy, F.w, F.h); dx.globalCompositeOperation = 'lighter';
      dx.beginPath(); dx.rect(F.x, F.y + oy, F.w, F.h); dx.clip();
      const X = F.x, Y = F.y + oy;
      if (F.kind === 'hook') robotHead(dx, X + 520, Y + 400, 150, [0.2, 0.9, 1.6], 0);
      if (F.kind === 'cat') { catSkull(dx, X + F.w / 2 - 10, Y + F.h / 2 + 18, 70); leadMarker(dx, 'CAT', X + 30, Y + 52); }
      if (F.kind === 'dog') { dogSkull(dx, X + F.w / 2 - 30, Y + F.h / 2 + 16, 68); leadMarker(dx, 'DOG', X + 30, Y + 52); }
      if (F.kind === 'model') robotHead(dx, X + F.w / 2, Y + 270, 150, rot, t > 2.8 && t < 6 ? sm(2.8, 5.6, t) : 0.3);
      if (F.kind === 'rounds') {
        for (let r = 0; r < 4; r++) {
          const dev = sm(10.95 + r * 0.4, 11.3 + r * 0.4, t);
          if (dev <= 0) continue;
          dx.globalAlpha = dev; netFilm(dx, X + 150 + r * 270, Y + 200, 95, [0.05, 0.4, 0.75, 1][r], 77 + r); dx.globalAlpha = 1;
        }
      }
      dx.restore();
    }
    const Db = H.layer(W, Hh), dbx = Db.getContext('2d'); dbx.filter = 'blur(1px)'; dbx.drawImage(Dc, 0, 0);
    // halation: a wide glow round dense parts (quarter-size blur, smooth upscale), as the hero's Dwide
    const Dq = H.layer(W / 4, Hh / 4), dqx = Dq.getContext('2d'); dqx.filter = 'blur(3.5px)'; dqx.drawImage(Dc, 0, 0, W / 4, Hh / 4);
    const LW = W / 4, LH = Hh / 4, Q = dqx.getImageData(0, 0, LW, LH).data, qrow = new Float32Array(LW);
    const qix = new Int32Array(W), qax = new Float32Array(W);
    for (let x = 0; x < W; x++) { const f = Math.min(LW - 1.001, Math.max(0, (x + 0.5) / 4 - 0.5)); qix[x] = f | 0; qax[x] = f - (f | 0); }
    const D = dbx.getImageData(0, 0, W, Hh).data, md = mx.getImageData(0, 0, W, Hh).data;
    // ---- transmission through film on the lightbox ----
    const tubeOn = [0.05, 0.2, 0.32].map((t0, i) => t < t0 ? 0 : t - t0 > 0.3 ? 1 : (hsh(Math.floor(t * 30) + i * 13) > 0.5 ? 1 : 0.15));
    const img = ctx.createImageData(W, Hh), d = img.data;
    const boxRow = new Float32Array(W);
    for (let x = 0; x < W; x++) {
      let a = 0, ws = 0; [213, 640, 1067].forEach((tx, i) => { const w = Math.exp(-Math.pow((x - tx) / 330, 2)); a += w * tubeOn[i]; ws += w; });
      boxRow[x] = (0.05 + 0.95 * a / ws) * (0.86 + 0.07 * Math.cos((x - 640) / 1280 * Math.PI * 6) - 0.08 * Math.pow(Math.abs(x - 640) / 640, 3));
    }
    const Rg = H.rng(5 + Math.floor(t * 30)), gk = 0.03 * 255;   // the photo's moving grain (was a separate H.grain pass)
    for (let y = 0; y < Hh; y++) {
      const vy = 0.1 * Math.pow(Math.abs(y - 360) / 360, 2);
      { const f = Math.min(LH - 1.001, Math.max(0, (y + 0.5) / 4 - 0.5)), iy = f | 0, ay = f - iy;
        for (let q = 0; q < LW; q++) qrow[q] = (Q[(iy * LW + q) * 4] * (1 - ay) + Q[((iy + 1) * LW + q) * 4] * ay) / 255; }
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4, j = y * W + x, inF = md[i] / 255, inFd = md[i + 1] / 255;
        const Dv = D[i] / 255 + (qrow[qix[x]] * (1 - qax[x]) + qrow[qix[x] + 1] * qax[x]) * 0.14;
        const Tf = 0.045 + 0.93 * (1 - Math.exp(-3.0 * Dv)) + mott[j] * (1 - Dv) + grain[j] * (0.5 + Dv);
        const Tc = 0.64 + mott[j] + grain[j] * 0.6;          // collimated rebate: unexposed blue base + fog
        const T = 1 + (Tc + (Tf - Tc) * inFd - 1) * inF, L = (boxRow[x] - vy) * T * 255 * 1.22;
        const gn = (Rg() - 0.5) * gk;
        d[i] = L * (1 - 0.2 * inF) * 0.98 + gn; d[i + 1] = L * (1 - 0.1 * inF) + gn; d[i + 2] = L * 1.04 + gn; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    // ---- film surface: emulsion scratches, dust, edge print (seeded per film, so they travel with it) ----
    for (const F of drawn) {
      const cx = F.x + F.w / 2, cy = F.y + F.oy + F.h / 2, X = F.x, Y = F.y + F.oy, big = F.w >= 400;
      const Rf = H.rng(5100 + films.indexOf(F) * 37);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(F.rot); ctx.translate(-cx, -cy);
      ctx.beginPath(); ctx.rect(X, Y, F.w, F.h); ctx.clip();
      const ns = big ? 5 + Math.floor(Rf() * 3) : 3;
      for (let k = 0; k < ns; k++) {
        const x0 = X + Rf.range(0.08, 0.92) * F.w, y0 = Y + Rf.range(0.05, 0.8) * F.h, len = Rf.range(0.15, 0.45) * F.h, a = 1.45 + Rf.range(-0.25, 0.25);
        ctx.strokeStyle = `rgba(200,225,255,${Rf.range(0.08, 0.2)})`; ctx.lineWidth = Rf.range(0.5, 1.2);
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + Math.cos(a) * len * 0.5 + Rf.range(-8, 8), y0 + Math.sin(a) * len * 0.5, x0 + Math.cos(a) * len, y0 + Math.sin(a) * len); ctx.stroke();
      }
      const nd = big ? 40 + Math.floor(Rf() * 20) : 18;
      for (let k = 0; k < nd; k++) {
        ctx.fillStyle = `rgba(0,0,0,${Rf.range(0.2, 0.6)})`;
        ctx.beginPath(); ctx.ellipse(X + Rf() * F.w, Y + Rf() * F.h, Rf.range(0.5, 2), Rf.range(0.5, 1.5), Rf() * 3, 0, 7); ctx.fill();
      }
      for (let k = 0; k < 4; k++) {   // a few bright pinholes / emulsion pick-offs
        ctx.fillStyle = `rgba(215,232,255,${Rf.range(0.15, 0.35)})`;
        ctx.beginPath(); ctx.arc(X + Rf() * F.w, Y + Rf() * F.h, Rf.range(0.6, 1.4), 0, 7); ctx.fill();
      }
      if (F.kind === 'model' || F.kind === 'rounds') {
        ctx.fillStyle = 'rgba(30,40,60,0.55)'; ctx.font = '400 13px "Courier Prime"'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        if (F.kind === 'model') ctx.fillText('SAFETY  \u25a0  BLUE BASE  \u25a0  0713', X + 30, Y + F.h - 8);
        else { ctx.textAlign = 'right'; ctx.fillText('SAFETY  \u25a0  BLUE BASE  35x43  \u25a0  0714', X + F.w - 30, Y + F.h - 8); }
      }
      ctx.restore();
    }
    // ---- lightbox bloom: the bright box bleeds over film edges (as the hero) ----
    {
      const bright = H.layer(W / 4, Hh / 4), bx = bright.getContext('2d');
      bx.filter = 'blur(6px)'; bx.drawImage(ctx.canvas, 0, 0, W / 4, Hh / 4);
      const bb = bx.getImageData(0, 0, W / 4, Hh / 4), bd = bb.data;
      for (let i = 0; i < bd.length; i += 4) { const l = (bd[i] + bd[i + 1] + bd[i + 2]) / 765, k = H.smooth(0.6, 0.95, l); bd[i] *= k; bd[i + 1] *= k; bd[i + 2] *= k; }
      bx.putImageData(bb, 0, 0);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.55; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(bright, 0, 0, W, Hh); ctx.restore();
    }
    // ---- film edges + clips ----
    for (const F of drawn) {
      const cx = F.x + F.w / 2, cy = F.y + F.oy + F.h / 2;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(F.rot); ctx.translate(-cx, -cy);
      ctx.strokeStyle = 'rgba(20,30,50,0.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(F.x, F.y + F.oy, F.w, F.h);
      if (F.small === undefined) [F.x + F.w * 0.25, F.x + F.w * 0.75].forEach((c) => {
        const g2 = ctx.createLinearGradient(0, F.y + F.oy - 18, 0, F.y + F.oy + 22);
        g2.addColorStop(0, '#eef2f6'); g2.addColorStop(0.35, '#8e98a3'); g2.addColorStop(0.7, '#4b525b'); g2.addColorStop(1, '#b8c0c8');
        ctx.fillStyle = g2; ctx.beginPath(); ctx.roundRect(c - 30, F.y + F.oy - 18, 60, 40, 8); ctx.fill();
        ctx.fillStyle = '#2a2f36'; ctx.beginPath(); ctx.arc(c, F.y + F.oy - 2, 6, 0, 7); ctx.fill();
      });
      ctx.restore();
    }
    // ---- grease pencil (on film / glass) ----
    const WAX = 'rgba(255,232,140,0.92)', RED = 'rgba(225,40,30,0.95)', INK = 'rgba(24,22,26,0.92)', GRN = 'rgba(20,150,60,0.95)';
    const wax = (pts, prog, col = WAX, w = 3) => {
      if (prog <= 0) return; const n = Math.max(1, Math.floor((pts.length - 1) * Math.min(1, prog)));
      ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let p = 0; p < 2; p++) { ctx.lineWidth = w - p; ctx.beginPath(); ctx.moveTo(pts[0][0] + p, pts[0][1] + p * 0.5); for (let i = 1; i <= n; i++) ctx.lineTo(pts[i][0] + p + Math.sin(i * 7.1) * 0.6, pts[i][1] + p * 0.5); ctx.stroke(); }
    };
    const waxArrow = (pts, prog, col = WAX) => {
      wax(pts, prog, col);
      if (prog >= 1) { const e = pts[pts.length - 1], q = pts[pts.length - 3], a = Math.atan2(e[1] - q[1], e[0] - q[0]); wax([[e[0] + Math.cos(a + 2.6) * 18, e[1] + Math.sin(a + 2.6) * 18], e, [e[0] + Math.cos(a - 2.6) * 18, e[1] + Math.sin(a - 2.6) * 18]], 1, col); }
    };
    const qpts = (x0, y0, qx, qy, x1, y1, n = 30) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * qx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * qy + u * u * y1]; });
    const ring = (cx, cy, rx, ry, prog, col = WAX) => wax(Array.from({ length: 61 }, (_, i) => { const a = -0.8 + i / 60 * Math.PI * 2.2; return [cx + Math.cos(a) * rx * (1 + Math.sin(i * 0.7) * 0.02), cy + Math.sin(a) * ry]; }), prog, col, 3.2);
    const write = (s, x, y, size, prog, col = WAX, align = 'left', rot = -0.04) => {
      if (prog <= 0) return; ctx.save(); ctx.font = `700 ${size}px "Caveat"`; ctx.textAlign = align; const w = ctx.measureText(s).width;
      ctx.translate(x, y); ctx.rotate(rot); const x0 = align === 'center' ? -w / 2 : 0;
      ctx.beginPath(); ctx.rect(x0 - 4, -size, (w + 8) * Math.min(1, prog), size * 1.6); ctx.clip(); ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore();
    };
    const tape = (x, y, w, h, s, size, prog, rot = -0.02) => {
      if (prog <= 0) return; ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); const k = E.back(Math.min(1, prog)); ctx.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k); ctx.globalAlpha = Math.min(1, prog * 3);
      ctx.fillStyle = 'rgba(232,220,180,0.93)'; ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); for (let i = 0; i <= 10; i++) ctx.lineTo(-w / 2 + i / 10 * w, -h / 2 + (i % 2) * 2); ctx.lineTo(w / 2 + 3, h / 2); for (let i = 10; i >= 0; i--) ctx.lineTo(-w / 2 + i / 10 * w, h / 2 - (i % 2) * 2); ctx.fill();
      ctx.fillStyle = '#1b1d2a'; ctx.font = `400 ${size}px "Permanent Marker"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 2); ctx.restore();
    };
    // HOOK: the question is scrawled over a scout film, then the film is pulled
    if (t < 2.3) {
      const oy = slide(-1, 1.9);
      write('How does', 300, 150 + oy, 74, sm(0.25, 0.8, t));
      write('AI learn?', 640, 250 + oy, 118, sm(0.8, 1.55, t), WAX, 'left', -0.06);
      wax(qpts(630, 278 + oy, 820, 300 + oy, 1010, 270 + oy), sm(1.5, 1.75, t));
    }
    // header tape stays for the rest of the piece
    tape(22, 8, 400, 52, 'How does AI learn?', 30, sm(2.4, 2.6, t), -0.025);
    // DATA
    if (t > 2.6 && t < 6.4) {
      const p = sm(2.8, 5.6, t), v = p >= 1 ? 1000000 : Math.round(Math.pow(10, 6 * p));
      const mo = slide(2.35, 10.3), X = modelX;
      waxArrow(qpts(420, 300, 520, 250, X + 20, 280), sm(3.0, 3.35, t), INK);
      write('labelled films', 445, 226, 42, sm(3.2, 3.6, t), INK, 'left', -0.06);
      // the model film's ID flash: counter typed by the flasher
      ctx.fillStyle = 'rgba(205,222,240,0.95)'; ctx.fillRect(X + 30, 52 + mo + 456, 400, 136);
      ctx.fillStyle = 'rgba(10,16,30,0.92)'; ctx.font = '400 16px "Courier Prime"'; ctx.textAlign = 'left'; ctx.fillText('MODEL  ·  TRAINING SET', X + 44, 52 + mo + 478);
      ctx.font = '700 66px "Courier Prime"'; ctx.fillText(v.toLocaleString('en-US'), X + 44, 52 + mo + 538); ctx.font = '700 30px "Courier Prime"'; ctx.fillText('examples', X + 44, 52 + mo + 578);
    }
    // LOOP: guess -> check -> adjust (wax notes on the glass)
    if (t > 6.4 && t < 10.5) {
      const off = slide(6.3, 10.3), X = modelX;
      waxArrow(qpts(338, 300, 400, 280, X + 26, 270), sm(6.7, 7.0, t), INK);
      write('Guess', 340, 240, 50, sm(6.75, 7.05, t), INK, 'left', -0.08);
      waxArrow(qpts(X + 440, 250, X + 480, 230, X + 520, 250), sm(7.1, 7.3, t), INK);
      write('dog?', X + 535, 275, 84, sm(7.3, 7.65, t), INK);
      if (t > 9.5) wax([[X + 530, 248], [X + 690, 258]], sm(9.5, 9.65, t), RED, 4);
      ring(X + 610, 252, 105, 56, sm(7.8, 8.15, t), RED);
      write('✗', X + 735, 280, 80, sm(7.95, 8.05, t), RED);
      write('Check', X + 560, 160, 54, sm(8.0, 8.3, t), RED);
      waxArrow(qpts(X + 610, 330, X + 560, 520, X + 330, 360), sm(8.3, 8.85, t), RED);
      write('Adjust', X + 470, 470, 54, sm(8.7, 9.0, t), RED);
      write('cat', X + 545, 400, 84, sm(9.65, 9.95, t), INK);
      write('✓', X + 690, 400, 84, sm(9.95, 10.1, t), GRN);
      if (adj > 0 && adj < 1) write('turning…', X + 150, 610, 34, 1);
    }
    // PROGRESS: four rounds on one film; accuracy rewritten (crossed out) as it climbs
    if (t > 10.5) {
      const oy = slide(10.55, 99), Y = 46 + oy;
      const vals = [61, 79, 90, 97];
      for (let r = 0; r < 4; r++) {
        const t0 = 11.0 + r * 0.4;
        write('round ' + ['1', '10', '100', '1,000'][r], 150 + r * 270, Y + 66, 38, sm(t0 - 0.1, t0 + 0.15, t), WAX, 'center', 0);
        write(vals[r] + '%', 150 + r * 270, Y + 420 - r * 40, 64, sm(t0 + 0.15, t0 + 0.35, t), r === 3 ? 'rgba(140,255,150,0.95)' : WAX, 'center', -0.03);
      }
      const pts = vals.map((v, r) => [150 + r * 270, Y + 360 - r * 40]);
      const cpts = []; for (let r = 0; r < 3; r++) for (let k = 0; k <= 10; k++) cpts.push([pts[r][0] + (pts[r + 1][0] - pts[r][0]) * k / 10 + 40, pts[r][1] + (pts[r + 1][1] - pts[r][1]) * k / 10 - 30]);
      wax(cpts, sm(11.3, 12.6, t));
      write('Accuracy \u2197', 100, Y + 492, 48, sm(11.05, 11.3, t), WAX, 'left', 0);
      ring(960, Y + 282, 110, 70, sm(12.5, 12.85, t), RED); ring(960, Y + 284, 118, 76, sm(12.7, 13.0, t), RED);
      tape(250, 590, 780, 70, 'More examples → better guesses', 34, sm(13.05, 13.35, t), 0.01);
    }
    H.vignette(ctx, W, Hh, 0.22, '4,8,16');
  }

  // Sound: a reading room. The lightbox's fluorescent tubes tink and buzz on, then hum under everything; films are
  // stiff sheets: pulled out of the spring clips (snap + the wobbly flex of X-ray film) and slapped up under them;
  // every note is a waxy grease-pencil stroke for exactly as long as it draws; the ID flasher clacks the counter;
  // masking tape tears and presses; the radiologist's knuckle knocks the glass for WRONG and for the 97% hit.
  // All times are copied from xrayExplainer() above (same film table, slide easing, write/ring/arrow windows).
  // Voiceover mode (k.vo): beds drop out; the small films, labels, counter clacks and minor strokes play quieter.
  function xraySound(k) {
    const sm = H.smooth, E = H.ease, D = 15;
    const hsh = (n) => { const v = Math.sin(n * 78.233 + 1.7) * 43758.5453; return v - Math.floor(v); }; // = xrayExplainer hsh
    const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
    // grease pencil on film: waxy, low-mid drag in short grains (no squeaks), lasting the draw-on time
    const wax = (a, b, g = 1, pan = 0, minor = true) => { const d = b - a, r = H.rng(Math.floor(a * 1000));
      for (let x = 0; x < d; x += 0.03 + r() * 0.025) { const gd = 0.04 + r() * 0.03;
        k.noise(a + x, { dur: gd, color: 'pink', filter: 'bandpass', f: 850 + r() * 500, q: 1.1, gain: 0.2 * g * (0.6 + r() * 0.5), a: gd * 0.35, pan: pan + (r() - 0.5) * 0.15, minor }); }
      k.noise(a, { dur: d, color: 'brown', filter: 'lowpass', f: 350, gain: 0.08 * g, a: 0.02, hold: d * 0.8, pan, minor }); };
    // spring clip letting go / biting on: a short metallic snap, kept low
    const clip = (t, g = 1, pan = 0, minor = false) => { k.noise(t, { dur: 0.02, filter: 'bandpass', f: 1900, q: 4, gain: 0.3 * g, a: 0.001, pan, minor });
      k.tone(t, { f: [[0, 520], [0.05, 380]], dur: 0.06, gain: 0.05 * g, pan, minor }); };
    // stiff X-ray film flexing as it moves: a low "wub" wobble
    const flex = (t, d, g = 1, pan = 0, minor = false) => { const n = Math.max(2, Math.round(d / 0.07));
      for (let i = 0; i < n; i++) k.noise(t + i * d / n, { dur: d / n * 1.6, color: 'brown', filter: 'bandpass', f: 180 + (i % 2) * 140 + i * 15, q: 1.5, gain: 0.32 * g * (1 - i / n * 0.5), a: d / n * 0.5, pan, minor }); };
    // a film slapped up onto the glass under the clips
    const slapUp = (t, g = 1, pan = 0, clips = true, minor = false) => { k.play('slap', t, { gain: 0.55 * g, pan, minor }); flex(t, 0.16, 0.6 * g, pan, minor); if (clips) { clip(t + 0.03, 0.8 * g, pan - 0.3, minor); clip(t + 0.06, 0.7 * g, pan + 0.3, minor); } };
    // pulled down out of the clips: snap snap, then the sheet flexes away
    const pull = (t, g = 1, pan = 0, minor = false) => { clip(t, g, pan - 0.3, minor); clip(t + 0.025, g * 0.9, pan + 0.3, minor); flex(t + 0.04, 0.3, g, pan, minor); };
    // knuckle on the lightbox glass: a dull knock with a short glassy rattle
    const knock = (t, g = 1, pan = 0) => { k.play('thud', t, { f: 170, gain: 0.55 * g, pan }); k.noise(t, { dur: 0.05, filter: 'bandpass', f: 1500, q: 5, gain: 0.18 * g, a: 0.001, pan }); k.noise(t + 0.008, { dur: 0.12, filter: 'bandpass', f: 2200, q: 9, gain: 0.06 * g, pan }); };
    // the ID flasher: dry mechanical clack per change, throttled
    const flasher = (val, a, b, gap, pan, avoid = []) => { let last = -1, prev = val(a);
      for (let t = a; t <= b; t += 0.002) { const v = val(t);
        if (v !== prev && t - last >= gap && !avoid.some((x) => t > x - 0.03 && t < x + 0.19)) { k.play('typebar', t, { gain: 0.38, pan, minor: true }); last = t; }
        prev = v; } };

    // ---- beds: lightbox ballast hum + a quiet room (the tubes' own buzz is scheduled as they strike)
    k.bed('room', 0, D, { gain: 0.5 });
    k.bed('hum', 0.05, D, { gain: 0.45 });

    // ---- 0.05 / 0.2 / 0.32: three tubes stutter on (30 slots/s, lit when hsh(floor(t*30)+i*13) > 0.5), then latch
    [0.05, 0.2, 0.32].forEach((t0, i) => { const pan = [-0.6, 0, 0.6][i];
      k.noise(t0, { dur: 0.012, filter: 'bandpass', f: 1300, q: 3, gain: 0.25, a: 0.001, pan });           // starter tink (low)
      let was = false;
      for (let s = Math.floor(t0 * 30); s / 30 < t0 + 0.3; s++) { const on = hsh(s + i * 13) > 0.5, ta = Math.max(t0, s / 30);
        if (on && !was) k.tone(ta, { f: 120, type: 'sawtooth', dur: 0.035, gain: 0.05, filter: 'bandpass', f2: 1100, q: 1.5, pan });
        was = on; }
      k.tone(t0 + 0.3, { f: 120, type: 'sawtooth', dur: D - t0 - 0.3, gain: 0.0045, a: 0.05, hold: D - t0 - 1, filter: 'bandpass', f2: 900, q: 1.5, pan, bus: 'amb', minor: true });
    });

    // ---- hook: the question in grease pencil, underline, then the film is pulled at 1.9
    wax(0.25, 0.8, 0.9, -0.3, false);
    wax(0.8, 1.55, 1.1, 0.1, false);
    wax(1.5, 1.75, 0.8, 0.2);
    pull(1.9, 1.0);
    // ---- model film up at 2.35 (E.out over 0.35: settled at ~2.57); header tape 2.4–2.6 (E.back overshoot)
    slapUp(2.57, 1.0, 0.25);
    k.play('tape', 2.36, { dur: 0.12, gain: 0.7, pan: -0.6 });   // torn and stuck as it appears

    // ---- DATA: ten small films slap down at 2.75 + k*0.29 (settled +0.22); arrow 3.0–3.35, label 3.2–3.6
    for (let c = 0; c < 10; c++) slapUp(2.75 + c * 0.29 + 0.22, 0.3, -0.6, false, true);
    wax(3.0, 3.35, 0.7, -0.2);
    wax(3.36, 3.6, 0.6, -0.3);    // label (3.2–3.6), continuing after the arrow so the two don't stack
    // ID flasher counter: 10^(6p), p = sm(2.8, 5.6), locks at 1,000,000
    const smallLand = Array.from({ length: 10 }, (_, c) => 2.97 + c * 0.29);
    flasher((t) => { const p = sm(2.8, 5.6, t); return p >= 1 ? 1e6 : Math.round(Math.pow(10, 6 * p)); }, 2.82, 5.5, 0.09, 0.3, smallLand);
    k.play('typebar', 5.6, { gain: 0.8, pan: 0.3 }); k.play('thud', 5.6, { f: 140, gain: 0.35, pan: 0.3 });

    // ---- 6.0: the small films are pulled down; the model film slides left on the glass (E.inOut 6.0–6.5)
    pull(6.0, 0.9, -0.5);
    k.noise(6.05, { dur: 0.45, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.22, 900], [0.45, 450]], q: 0.8, gain: 0.08, a: 0.22, pan: 0.2 });
    slapUp(6.52, 0.8, -0.6);                                  // cat film up at 6.3 (settled ~6.52)

    // ---- LOOP
    wax(6.7, 7.0, 0.7, -0.3); wax(7.0, 7.08, 0.5, -0.3);         // Guess arrow + its label (6.75–7.05)
    wax(7.1, 7.3, 0.6, 0.3);                                      // arrow to the answer
    wax(7.3, 7.65, 1.0, 0.45, false);                             // "dog?" (the guess)
    // WRONG: red ring 7.8–8.15, ✗ slashed 7.95–8.05 with a knock on the glass, "Check" 8.0–8.3
    wax(7.8, 8.15, 1.0, 0.45, false);
    knock(7.97, 1.4, 0.55); k.noise(7.95, { dur: 0.1, color: 'pink', filter: 'bandpass', f: 900, q: 0.9, gain: 0.32, a: 0.01, pan: 0.6 });
    wax(8.16, 8.3, 0.6, 0.4);
    wax(8.3, 8.85, 0.8, 0.2, false);                              // red arrow back to the gears
    wax(8.86, 9.0, 0.5, 0.2);                                     // "Adjust" (8.7–9.0) tail
    // gears turn in steps (rot = floor(a*6)/6, adj = sm(8.85, 9.4)): one ratchet click per step of any gear
    { const steps = []; const r0 = [0.3, -0.5, 0.1], dr = [2.2, -2.8, 2.5];
      for (let g = 0; g < 3; g++) { let prev = Math.floor(r0[g] * 6); for (let t = 8.85; t <= 9.41; t += 0.002) { const v = Math.floor((r0[g] + dr[g] * sm(8.85, 9.4, t)) * 6); if (v !== prev) { steps.push(t); prev = v; } } }
      steps.sort((a, b) => a - b); let last = -1;
      for (const ts of steps) if (ts - last >= 0.07) { k.play('tock', ts, { f: 380, gain: 0.32, pan: -0.1, minor: true }); last = ts; } }
    // RIGHT: red cross-out 9.5–9.65, "cat" 9.65–9.95, green ✓ 9.95–10.1 and two taps of the pencil on the glass
    wax(9.5, 9.65, 0.8, 0.45);
    wax(9.65, 9.95, 1.0, 0.45, false);
    wax(9.95, 10.1, 1.1, 0.6, false);
    knock(10.12, 0.7, 0.55); knock(10.26, 0.9, 0.55);
    k.tone(10.14, { f: 'E4', dur: 0.6, gain: 0.07, a: 0.01, verb: 0.3, pan: 0.4 }); k.tone(10.28, { f: 'A4', dur: 0.8, gain: 0.08, a: 0.01, verb: 0.3, pan: 0.4 });

    // ---- 10.3: model + cat films pulled down; the long "rounds" film slaps up at 10.55 (settled ~10.77)
    pull(10.3, 1.0, 0);
    slapUp(10.77, 1.2, 0);

    // ---- PROGRESS: round labels (t0-0.1 .. t0+0.15) and values (t0+0.15 .. t0+0.35), t0 = 11.0 + r*0.4
    for (let r = 0; r < 4; r++) { const t0 = 11.0 + r * 0.4, pan = -0.6 + r * 0.4;
      wax(t0 - 0.1, t0 + 0.13, 0.45, pan);
      wax(t0 + 0.15, t0 + 0.35, r === 3 ? 1.0 : 0.65, pan, r !== 3); }
    wax(11.05, 11.28, 0.5, -0.6);                                  // "Accuracy ↗"
    k.noise(11.3, { dur: 1.3, color: 'pink', filter: 'bandpass', f: [[0, 700], [1.3, 1100]], q: 1, gain: 0.04, a: 0.1, hold: 1.0, pan: 0.1, minor: true }); // the long curve, faint underneath
    // THE HIT: 97% written (12.35–12.55), palm slap on the lightbox + knock, then two red rings 12.5–12.85, 12.7–13.0
    k.play('slap', 12.55, { gain: 1.1, pan: 0.4 }); knock(12.55, 1.8, 0.4); k.play('thud', 12.55, { f: 80, gain: 1.2, pan: 0.4 });
    k.noise(12.55, { dur: 0.6, color: 'brown', filter: 'lowpass', f: [[0, 900], [0.5, 200]], gain: 0.25, verb: 0.3, pan: 0.4 });
    wax(12.6, 12.85, 1.0, 0.4, false); wax(12.85, 13.0, 0.8, 0.45);

    // ---- takeaway tape 13.05–13.35 (E.back overshoot, lands ~13.25): tear, stick, press flat
    k.play('tape', 13.04, { dur: 0.2, gain: 1.5 });
    k.noise(13.24, { dur: 0.2, color: 'brown', filter: 'lowpass', f: 600, gain: 0.3, a: 0.005 });   // palm presses it flat (soft, no thump)
    k.noise(13.32, { dur: 0.35, color: 'pink', filter: 'bandpass', f: 700, q: 0.8, gain: 0.08, a: 0.1 });   // thumb smooths it
    // resolve: a soft low chord under the finished board, the lightbox hum carrying on
    ['A3', 'E4', 'A4', 'C#5'].forEach((n, i) => k.tone(13.45 + i * 0.05, { f: n, type: 'sine', dur: 1.5, gain: 0.05 - i * 0.006, a: 0.06, hold: 0.4, verb: 0.35, pan: (i - 1.5) * 0.25 }));
  }

  registerStyle({
    id: 'x-ray',
    name: 'Radiograph on Lightbox',
    category: 'Light & Imaging',
    description: 'A blue-base X-ray film clipped to a glowing viewer: additive translucent density of a robot hand — hollow-shelled bones, pivot pins, screws, tendons, battery cell and gears — with collimation borders, lead markers, an ID flash, grease-pencil notes, scratches and dust.',
    motion: 'The viewer\u2019s fluorescent tubes stutter on one by one, the film develops from milky fog to deep blue-black top-down like it was dipped in the tank, then a grease pencil circles the loose pin and scrawls a note while the camera slowly pushes in.',
    fonts: ['700 30px "Courier Prime"', '400 15px "Courier Prime"', '700 40px "Caveat"', '700 34px sans-serif', '400 30px "Permanent Marker"'],
    frameT: 4.7,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'A radiologist working a lightbox: scenes change by pulling films down and slapping new ones up under the clips, arrows, circles and answers are grease pencil on the glass, the counter is typed by the ID flasher and accuracy is rewritten round by round, with masking-tape labels for the header and takeaway.',
    explainer(ctx, W, Hh, t) { xrayExplainer(ctx, W, Hh, t); },
    explainerSound(k) { xraySound(k); },
    draw(ctx, W, Hh, t) {
      const hsh = (n) => { const v = Math.sin(n * 78.233 + 1.7) * 43758.5453; return v - Math.floor(v); };
      // three fluorescent tubes strike in turn (stutter then latch)
      const tubeX = [213, 640, 1067], tubeT = [0.15, 0.4, 0.62];
      const tubeOn = tubeT.map((t0, i) => t < t0 ? 0 : t - t0 > 0.35 ? 1 : (hsh(Math.floor(t * 30) + i * 13) > 0.5 ? 1 : 0.15));
      const hum = 1 + (hsh(Math.floor(t * 30) + 77) - 0.5) * 0.015;
      const R = H.rng(909), nz = H.makeNoise(31);
      const filmRot = -0.009, fcx = W / 2, fcy = Hh / 2 + 20;
      const filmT = (x) => { x.translate(fcx, fcy); x.rotate(filmRot); x.translate(-fcx, -fcy); };
      const film = { x: 92, y: 46, w: W - 184, h: 760 };
      const fields = [{ x: 148, y: 92, w: 610, h: 610 }, { x: 790, y: 92, w: 342, h: 610 }];

      // ---- density (x-ray attenuation) ----
      const Dc = H.layer(W, Hh), dx = Dc.getContext('2d');
      dx.fillStyle = '#000'; dx.fillRect(0, 0, W, Hh);
      const Sc = H.layer(W, Hh), sx = Sc.getContext('2d');
      dx.save(); sx.save(); filmT(dx); filmT(sx);
      dx.globalCompositeOperation = 'lighter';
      // PA view
      dx.save(); sx.save();
      dx.translate(458, 548); sx.translate(458, 548); dx.rotate(0.06); sx.rotate(0.06); dx.scale(0.88, 0.88); sx.scale(0.88, 0.88);
      const handA = hand(dx, sx, 0.15, t);
      dx.restore(); sx.restore();
      // oblique view (foreshortened, more curl)
      dx.save(); sx.save();
      dx.translate(972, 560); sx.translate(972, 560); dx.rotate(-0.1); sx.rotate(-0.1); dx.scale(0.5, 0.8); sx.scale(0.5, 0.8);
      hand(dx, sx, 0.9, t + 1);
      dx.restore(); sx.restore();
      // lead markers (lead blocks x-rays -> white)
      dx.globalCompositeOperation = 'source-over';
      dx.fillStyle = dens(0.75); dx.font = '700 34px sans-serif';
      dx.fillText('R', 176, 140); dx.fillText('R', 816, 140);
      dx.font = '700 20px sans-serif'; dx.fillText('PA', 214, 138); dx.fillText('OBL', 852, 138);
      dx.restore(); sx.restore();
      // add soft tissue
      dx.save(); dx.globalCompositeOperation = 'lighter'; dx.globalAlpha = 0.1; dx.filter = 'blur(6px)'; dx.drawImage(Sc, 0, 0); dx.restore();
      // a little scatter / unsharpness
      const Db = H.layer(W, Hh), dbx = Db.getContext('2d');
      dbx.filter = 'blur(1.1px)'; dbx.drawImage(Dc, 0, 0);
      const Dw = H.layer(W, Hh), dwx = Dw.getContext('2d');
      dwx.filter = 'blur(14px)'; dwx.drawImage(Dc, 0, 0);
      const D = dbx.getImageData(0, 0, W, Hh).data, Dwide = dwx.getImageData(0, 0, W, Hh).data;

      // ---- masks ----
      const M = H.layer(W, Hh), mx = M.getContext('2d');
      mx.save(); filmT(mx);
      mx.fillStyle = 'rgb(255,0,0)'; mx.fillRect(film.x, film.y, film.w, film.h);           // film area (R)
      mx.fillStyle = 'rgb(255,255,0)'; fields.forEach((f) => mx.fillRect(f.x, f.y, f.w, f.h)); // exposed fields (G)
      mx.restore();
      const Mb = H.layer(W, Hh), mbx = Mb.getContext('2d'); mbx.filter = 'blur(2px)'; mbx.drawImage(M, 0, 0);
      const md = mbx.getImageData(0, 0, W, Hh).data;

      // ---- film transmission on lightbox ----
      const img = ctx.createImageData(W, Hh), d = img.data;
      for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const inFilm = md[i] / 255, inField = md[i + 1] / 255;
        // lightbox: three fluorescent tubes behind diffuser
        const box = 0.86 + 0.07 * Math.cos((x - 640) / 1280 * Math.PI * 6) - 0.1 * Math.pow(Math.abs(y - 360) / 360, 2) - 0.08 * Math.pow(Math.abs(x - 640) / 640, 3);
        const Dv = D[i] / 255 + Dwide[i] / 255 * 0.12;
        const mott = nz.fbm2(x * 0.004, y * 0.004, 3) * 0.04;
        const grain = (R() + R() + R() - 1.5) * 0.05;
        // exposed field: transmission rises with object density (negative film)
        const Tf0 = 0.025 + 0.93 * (1 - Math.exp(-3.0 * Dv)) + mott * (1 - Dv) + grain * (0.5 + Dv);
        // development front sweeps top->bottom with uneven, mottled edge
        const dv = H.smooth(0, 1, (t - 0.75 - (y / Hh) * 0.95 - mott * 6) / 0.6);
        const fog = 0.4 + mott * 2 + grain * 0.4;
        const Tf = fog + (Tf0 - fog) * dv;
        const Tc = 0.64 + mott + grain * 0.6; // collimated, unexposed (blue base + fog)
        const Tfilm = Tc + (Tf - Tc) * inField;
        const T = 1 + (Tfilm - 1) * inFilm;
        const tint = inFilm > 0.01 ? [0.80, 0.90, 1.0] : [1, 1, 1];
        const L = box * T * 255 * 1.22;
        d[i] = L * (1 + (tint[0] - 1) * inFilm) * 0.98;
        d[i + 1] = L * (1 + (tint[1] - 1) * inFilm);
        d[i + 2] = L * (1 + (tint[2] - 1) * inFilm) * 1.04;
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);

      // ---- on-film overlays (in film space) ----
      ctx.save(); filmT(ctx);
      // emulsion scratches (bright) and dust (dark)
      for (let k = 0; k < 9; k++) {
        const x0 = R.range(160, 1120), y0 = R.range(100, 700), len = R.range(40, 260), a = 1.45 + R.range(-0.25, 0.25);
        ctx.strokeStyle = `rgba(200,225,255,${R.range(0.08, 0.22)})`; ctx.lineWidth = R.range(0.5, 1.2);
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + Math.cos(a) * len * 0.5 + R.range(-8, 8), y0 + Math.sin(a) * len * 0.5, x0 + Math.cos(a) * len, y0 + Math.sin(a) * len); ctx.stroke();
      }
      for (let k = 0; k < 120; k++) {
        ctx.fillStyle = `rgba(0,0,0,${R.range(0.2, 0.6)})`;
        const x0 = R.range(100, 1180), y0 = R.range(50, 715);
        ctx.beginPath(); ctx.ellipse(x0, y0, R.range(0.5, 2), R.range(0.5, 1.5), R() * 3, 0, 7); ctx.fill();
      }
      // ID flash block (photographically printed: light patch, dark type)
      const idx = 812, idy = 600, idw = 300, idh = 88;
      ctx.globalAlpha = H.smooth(2.0, 2.5, t);
      ctx.fillStyle = 'rgba(205,222,240,0.92)'; ctx.fillRect(idx, idy, idw, idh);
      ctx.fillStyle = 'rgba(10,16,30,0.9)'; ctx.font = '400 15px "Courier Prime"';
      ctx.fillText('ROBOTICS LAB  ·  RADIOLOGY', idx + 12, idy + 22);
      ctx.font = '700 30px "Courier Prime"'; ctx.fillText('UNIT-07 R HAND', idx + 12, idy + 54);
      ctx.font = '400 15px "Courier Prime"'; ctx.fillText('2026-10-09   60kV  2mAs   #4471', idx + 12, idy + 76);
      // film edge notch code + edge print
      ctx.fillStyle = 'rgba(30,40,60,0.55)'; ctx.font = '400 13px "Courier Prime"';
      ctx.fillText('SAFETY  ■  BLUE BASE  35x43  ■  0712', 140, 80);
      ctx.globalAlpha = 1;
      // grease pencil circle + note around a joint (waxy, broken stroke)
      const jp = handA[3].pts[1], jm = new DOMMatrix().translate(458, 548).rotate(0.06 * 180 / Math.PI).scale(0.88), gpt = jm.transformPoint({ x: jp[0], y: jp[1] });
      const gx = gpt.x, gy = gpt.y;
      ctx.strokeStyle = 'rgba(255,236,150,0.85)'; ctx.lineCap = 'round';
      const circP = H.smooth(2.6, 3.25, t);
      for (let p = 0; p < 3; p++) {
        ctx.lineWidth = 2.4 - p * 0.5; ctx.beginPath();
        for (let k = 0; k <= 60; k++) {
          const u = k / 60, a = -0.6 + u * Math.PI * 2.15, rr = 42 + Math.sin(u * 7) * 2 + p * 1.5;
          const px = gx + Math.cos(a) * rr * 1.1, py = gy + Math.sin(a) * rr;
          const brk = R() < 0.06;
          if (u > circP - p * 0.04) continue;
          if (k === 0 || brk) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      const wrP = H.smooth(3.3, 3.95, t);
      if (wrP > 0) {
        ctx.font = '700 40px "Caveat"'; ctx.fillStyle = 'rgba(255,236,150,0.9)';
        ctx.save(); ctx.translate(gx + 70, gy - 34); ctx.rotate(-0.08);
        ctx.beginPath(); ctx.rect(-4, -40, 4 + wrP * 180, 60); ctx.clip(); ctx.fillText('pin loose?', 0, 0); ctx.restore();
      }
      if (t > 3.95) { const ap = H.smooth(3.95, 4.1, t); ctx.beginPath(); ctx.moveTo(gx + 66, gy - 40); ctx.quadraticCurveTo(gx + 54 + (1 - ap) * 6, gy - 30, H.lerp(gx + 66, gx + 44, ap), H.lerp(gy - 40, gy - 18, ap)); ctx.lineWidth = 2; ctx.stroke(); }
      ctx.restore();

      // ---- lightbox bloom around film edges (bright box bleeds over film) ----
      const bright = H.layer(W / 4, Hh / 4), bx = bright.getContext('2d');
      bx.filter = 'blur(10px)'; bx.drawImage(ctx.canvas, 0, 0, W / 4, Hh / 4);
      const bb = bx.getImageData(0, 0, W / 4, Hh / 4), bd = bb.data;
      for (let i = 0; i < bd.length; i += 4) { const l = (bd[i] + bd[i + 1] + bd[i + 2]) / 765; const k = H.smooth(0.6, 0.95, l); bd[i] *= k; bd[i + 1] *= k; bd[i + 2] *= k; }
      bx.putImageData(bb, 0, 0);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.8; ctx.filter = 'blur(6px)';
      ctx.drawImage(bright, 0, 0, W, Hh); ctx.restore();

      // ---- spring clips holding the film ----
      const clip = (cx) => {
        const cy = 30;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(filmRot);
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.roundRect(-36, 6, 76, 46, 10); ctx.filter = 'blur(4px)'; ctx.fill(); ctx.filter = 'none';
        const mg = ctx.createLinearGradient(0, -6, 0, 44);
        mg.addColorStop(0, '#f2f5f8'); mg.addColorStop(0.25, '#9aa3ad'); mg.addColorStop(0.55, '#4b525b'); mg.addColorStop(0.8, '#c8ced5'); mg.addColorStop(1, '#6b737c');
        ctx.fillStyle = mg; ctx.beginPath(); ctx.roundRect(-34, -6, 68, 46, 9); ctx.fill();
        ctx.strokeStyle = 'rgba(20,24,30,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-28, -2, 56, 2);
        ctx.fillStyle = '#2a2f36'; ctx.beginPath(); ctx.arc(0, 10, 7, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(-2, 8, 2.5, 0, 7); ctx.fill();
        ctx.restore();
      };
      clip(330); clip(950);
      // viewer frame top edge
      const fg = ctx.createLinearGradient(0, 0, 0, 22);
      fg.addColorStop(0, '#15181d'); fg.addColorStop(1, '#3b4048');
      ctx.fillStyle = fg; ctx.fillRect(0, 0, W, 20);

      // photo-of-a-lightbox finish
      // lightbox is the only light in the room: darkness where tubes are still off
      const lg = ctx.createLinearGradient(0, 0, W, 0);
      for (let k = 0; k <= 16; k++) {
        const x = k / 16 * W; let a = 0, wsum = 0;
        tubeX.forEach((tx, i) => { const w = Math.exp(-Math.pow((x - tx) / 330, 2)); a += w * tubeOn[i]; wsum += w; });
        const lit = H.clamp(a / wsum) * hum, v = Math.min(255, 12 + 243 * lit) | 0;
        lg.addColorStop(k / 16, `rgb(${v},${v},${Math.min(255, v + 2)})`);
      }
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = lg; ctx.fillRect(0, 0, W, Hh); ctx.restore();
      // slow push-in (camera)
      const push = 1 + 0.035 * H.ease.inOut(H.clamp(t / 5));
      const cp = H.layer(W, Hh); cp.getContext('2d').drawImage(ctx.canvas, 0, 0);
      ctx.save(); ctx.translate(560, 390); ctx.scale(push, push); ctx.translate(-560, -390); ctx.drawImage(cp, 0, 0); ctx.restore();
      H.vignette(ctx, W, Hh, 0.22, '4,8,16');
      H.grain(ctx, W, Hh, 0.03, 5 + Math.floor(t * 30), true);
    },
  });
}
```
