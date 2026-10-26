I want an animated explainer made in the "Holographic Foil Card" visual style (Light & Imaging). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Inter, Russo One
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Russo+One&display=block">
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
Name: Holographic Foil Card
Family: Light & Imaging
Look: A holo-rare trading card and die-cut sticker: cracked-ice foil whose rainbow diffraction shifts with angle and surface normals, embossed robot, sunburst and lettering catching specular glints, printed ink sitting on top, glitter flecks and rainbow spill on the desk.
Motion: The card is dealt in and settles onto the desk, the sticker slaps down and holo confetti scatters, then the card slowly tilts toward the light so the rainbow band and specular glints sweep across the cracked-ice foil and embossed lettering.
How it explains: Told with holo trading cards on a desk: examples are dealt as CAT/DOG cards onto a pile, arrows and answers are die-cut foil stickers slapped down with an overshoot, the model card\u2019s stat bars are its weights, scene changes are card flips to the stats side and back, and numbers are foil-embossed digits with a glint sweep for emphasis.

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

REFERENCE STYLE SOURCE (styles/holographic-foil.js; W/H_ are always 1280x720)
```js
{
  // ---------- holographic foil trading card ----------
  const hsl = (h, s, l) => {
    h = ((h % 1) + 1) % 1;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
  };

  // holo palette LUT: the clean magenta -> violet -> blue -> cyan -> mint -> gold -> peach -> pink cycle real
  // diffraction foil shows (instead of a plain HSL wheel, whose yellow-green region mixes to mud with the silver)
  const HOLO = (() => {
    const st = [[0, 255, 70, 205], [0.13, 150, 100, 255], [0.27, 70, 150, 255], [0.41, 50, 235, 255], [0.53, 110, 255, 200],
      [0.65, 255, 228, 100], [0.79, 255, 150, 90], [0.9, 255, 95, 160], [1, 255, 70, 205]];
    const lut = new Float32Array(256 * 3);
    for (let i = 0; i < 256; i++) { const u = i / 256; let k = 0; while (st[k + 1][0] < u) k++;
      const a = st[k], b = st[k + 1], f = (u - a[0]) / (b[0] - a[0]), g = f * f * (3 - 2 * f);
      for (let j = 0; j < 3; j++) lut[i * 3 + j] = (a[j + 1] + (b[j + 1] - a[j + 1]) * g) / 255; }
    return lut;
  })();
  // gradient noise whose lattice wraps every P cells, so a tile baked with it repeats with no seam
  function makePNoise(seed) {
    const r = H.rng(seed), perm = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
    const GX = [1, 0.7071, 0, -0.7071, -1, -0.7071, 0, 0.7071], GY = [0, 0.7071, 1, 0.7071, 0, -0.7071, -1, -0.7071];
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const g = (X, Y, dx, dy) => { const hh = perm[(perm[X & 255] + Y) & 255] & 7; return GX[hh] * dx + GY[hh] * dy; };
    return (x, y, P) => {
      const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
      const X0 = ((xi % P) + P) % P, Y0 = ((yi % P) + P) % P, X1 = (X0 + 1) % P, Y1 = (Y0 + 1) % P;
      const u = fade(fx), v = fade(fy);
      const a = g(X0, Y0, fx, fy) + (g(X1, Y0, fx - 1, fy) - g(X0, Y0, fx, fy)) * u;
      const b = g(X0, Y1, fx, fy - 1) + (g(X1, Y1, fx - 1, fy - 1) - g(X0, Y1, fx, fy - 1)) * u;
      return (a + (b - a) * v) * 1.1;
    };
  }

  // per-pixel foil shading. emboss: canvas (R = height). rays: optional sunburst centre within a rect.
  // o.wrap = S: bake a seamless S x S tile (periodic noise, periodic sheen band and hue, wrapped normals)
  const TAU = Math.PI * 2;
  function shadeFoil(w, h, emboss, o) {
    const nz = H.makeNoise(o.seed), R = H.rng(o.seed + 1), S = o.wrap || 0, PN = S ? makePNoise(o.seed + 7) : null;
    const E = o.Ht ? null : emboss.getContext('2d').getImageData(0, 0, w, h).data;
    const Ht = o.Ht || new Float32Array(w * h);
    if (!o.Ht) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let r1, r2;
      if (S) { r1 = 1 - Math.abs(PN(x / S * 5, y / S * 5, 5)); r2 = 1 - Math.abs(PN(x / S * 12 + 7, y / S * 12 + 3, 12)); }
      else { const gx = (x + o.ox) * 0.015, gy = (y + o.oy) * 0.015;
        // "cracked ice": ridged noise gives faceted creases
        r1 = 1 - Math.abs(nz.n2(gx, gy)); r2 = 1 - Math.abs(nz.n2(gx * 2.3 + 7, gy * 2.3 + 3)); }
      let ht = (r1 * r1 * 0.75 + r2 * r2 * 0.35) * o.crinkle;
      ht += E[(y * w + x) * 4] / 255 * o.emboss;
      if (o.rays) {
        const [rx, ry, x0, y0, x1, y1] = o.rays;
        if (x > x0 && x < x1 && y > y0 && y < y1) ht += Math.max(0, Math.sin(Math.atan2(y - ry, x - rx) * 36)) * 0.9;
      }
      Ht[y * w + x] = ht;
    }
    const c = H.layer(w, h), cx = c.getContext('2d'), img = cx.createImageData(w, h), d = img.data;
    const [lx, ly, lz] = o.L, ll = Math.hypot(lx, ly, lz), Lx = lx / ll, Ly = ly / ll, Lz = lz / ll;
    const hx0 = Lx, hy0 = Ly, hz0 = Lz + 1, hl = Math.hypot(hx0, hy0, hz0), Hx = hx0 / hl, Hy = hy0 / hl, Hz = hz0 / hl;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const xm = x > 0 ? i - 1 : S ? i + w - 1 : i, xp = x < w - 1 ? i + 1 : S ? i - w + 1 : i;
      const ym = y > 0 ? i - w : S ? i + w * (h - 1) : i, yp = y < h - 1 ? i + w : S ? i - w * (h - 1) : i;
      let nx = -(Ht[xp] - Ht[xm]) * 2.2, ny = -(Ht[yp] - Ht[ym]) * 2.2, nzz = 1;
      const nl = Math.hypot(nx, ny, nzz); nx /= nl; ny /= nl; nzz /= nl;
      const diff = 0.55 + 0.45 * Math.max(0, nx * Lx + ny * Ly + nzz * Lz);
      const spec = Math.pow(Math.max(0, nx * Hx + ny * Hy + nzz * Hz), 60);
      // broad mirror sheen band sweeping across as the card tilts; diffraction hue from position + normal + tilt
      let band, hue;
      if (S) { const u = (x + y) / S; let dd = (u - o.band) % 1; dd -= Math.round(dd); band = Math.exp(-(dd * dd) / 0.09);
        hue = o.hue + u + nx * 0.38 + ny * 0.26 + (Math.sin(TAU * (x / S + 0.3)) * Math.cos(TAU * (y / S * 2 + 0.1)) + Math.sin(TAU * (y / S + x / S * 2))) * 0.08; }
      else { const bandPos = (x * 0.62 + y * 0.78) / (w * 0.62 + h * 0.78); band = Math.exp(-Math.pow((bandPos - o.band) / 0.35, 2));
        hue = o.hue + bandPos * 1.6 + nx * 0.38 + ny * 0.26 + nz.n2(x * 0.006, y * 0.006) * 0.15; }
      const hi = (Math.floor((((hue % 1) + 1) % 1) * 256) & 255) * 3, rr = HOLO[hi], gg = HOLO[hi + 1], bb = HOLO[hi + 2];
      const rainbow = 0.45 + 0.55 * band;
      const silver = 0.35 + 0.25 * band + 0.08 * (S ? 0.5 * (Math.sin(TAU * (x / S * 3 + y / S)) + Math.cos(TAU * (y / S * 3 - x / S * 2 + 0.2))) : nz.n2(x * 0.01 + 3, y * 0.01));
      let r = (silver * (1 - rainbow * 0.75) + rr * rainbow * 0.95) * diff + spec * 1.1;
      let g = (silver * (1 - rainbow * 0.75) + gg * rainbow * 0.95) * diff + spec * 1.1;
      let b = (silver * (1 - rainbow * 0.75) + bb * rainbow * 0.95) * diff + spec * 1.15;
      // glitter flecks
      if (R() < 0.0035) { const s2 = 0.6 + 0.6 * Math.max(0, Math.sin(o.t * 4 + i)); const [fr, fg, fb] = hsl(R(), 1, 0.75); r += fr * s2; g += fg * s2; b += fb * s2; }
      const k = i * 4;
      d[k] = r * 255; d[k + 1] = g * 255; d[k + 2] = b * 255; d[k + 3] = 255;
    }
    cx.putImageData(img, 0, 0);
    return { canvas: c, Ht };
  }

  function robot(x, s) {
    // robot figure in local art-window coords, centre bottom at (0,0); s = scale
    x.save(); x.scale(s, s);
    x.beginPath();
    x.roundRect(-62, -250, 124, 100, 30);          // head
    x.moveTo(0, -250); x.lineTo(0, -282);            // antenna stem drawn separately
    x.roundRect(-76, -140, 152, 130, 26);           // body
    x.roundRect(-42, -10, 30, 22, 6); x.roundRect(12, -10, 30, 22, 6); // feet
    x.restore();
  }

  // ================= EXPLAINER: told with holo trading cards and die-cut stickers on a desk =================
  let foilTex = null, deskTex = null, raysTex = null;
  const TS = 320;
  // eight seamless cracked-ice tiles; phase k moves the sheen band and hue 1/8 of a cycle, so phase 7 -> 0 loops cleanly
  function getFoilTex() {
    if (foilTex) return foilTex;
    const blank = H.layer(TS, TS); blank.getContext('2d').fillRect(0, 0, TS, TS);
    foilTex = [];
    let Ht = null; // the relief is the same for every phase: compute it once
    for (let k = 0; k < 8; k++) { const r = shadeFoil(TS, TS, blank, { seed: 11, crinkle: 3.4, emboss: 0, hue: k / 8, band: k / 8, L: [-0.6, -0.8, 1.3], t: 0, ox: 0, oy: 0, wrap: TS, Ht });
      Ht = r.Ht; foilTex.push(r.canvas); }
    return foilTex;
  }
  // embossed sunburst relief (grey, 128 = flat) laid over the foil with 'hard-light' for the art windows, like the hero
  function getRays() {
    if (raysTex) return raysTex;
    const S = 320, c = H.layer(S, S), x = c.getContext('2d'), im = x.createImageData(S, S), d = im.data;
    const cx0 = S / 2, cy0 = S * 0.47, HG = new Float32Array((S + 2) * (S + 2));
    for (let y = -1; y <= S; y++) for (let xx = -1; xx <= S; xx++) { const r = Math.hypot(xx - cx0, y - cy0);
      HG[(y + 1) * (S + 2) + xx + 1] = Math.max(0, Math.sin(Math.atan2(y - cy0, xx - cx0) * 36)) * H.smooth(6, 40, r) + 0.0016 * r; }
    const ht = (px, py) => HG[(py + 1) * (S + 2) + px + 1];
    for (let y = 0; y < S; y++) for (let xx = 0; xx < S; xx++) {
      const nx = -(ht(xx + 1, y) - ht(xx - 1, y)) * 2.6, ny = -(ht(xx, y + 1) - ht(xx, y - 1)) * 2.6, nl = Math.hypot(nx, ny, 1);
      const lit = (nx * -0.45 + ny * -0.6 + 0.66) / nl - 0.66, k = (y * S + xx) * 4, v = H.clamp(0.5 + lit * (lit > 0 ? 1.5 : 0.8)) * 255;
      d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255;
    }
    x.putImageData(im, 0, 0); return (raysTex = c);
  }
  // the sunburst relief as a plain alpha overlay (white highlights, dark shadows) for the big cards: cheaper than hard-light
  let raysOv = null;
  function getRaysOv() {
    if (raysOv) return raysOv;
    const src = getRays(), S = src.width, c = H.layer(S, S), x = c.getContext('2d'), sd = src.getContext('2d').getImageData(0, 0, S, S).data, im = x.createImageData(S, S), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = (sd[i] - 128) / 128; if (v > 0) { d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = v * 170; } else { d[i] = 10; d[i + 1] = 12; d[i + 2] = 30; d[i + 3] = -v * 200; } }
    x.putImageData(im, 0, 0); return (raysOv = c);
  }
  // art-window textures per phase: foil tile + sunburst relief (hard-light) + translucent navy/violet ink, composited once
  const winTex = [];
  function getWin(k) {
    if (winTex[k]) return winTex[k];
    const S = TS, c = H.layer(S, S), x = c.getContext('2d');
    x.drawImage(getFoilTex()[k], 0, 0); x.globalCompositeOperation = 'hard-light'; x.globalAlpha = 0.6; x.drawImage(getRays(), 0, 0);
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    const tg = x.createLinearGradient(0, 0, 0, S); tg.addColorStop(0, 'rgba(20,30,110,0.55)'); tg.addColorStop(1, 'rgba(70,10,90,0.5)');
    x.fillStyle = tg; x.fillRect(0, 0, S, S);
    return (winTex[k] = c);
  }
  function getDesk(W, Hh) {
    if (deskTex) return deskTex;
    const c = H.layer(W, Hh), x = c.getContext('2d'), R = H.rng(5151);
    const bg = x.createRadialGradient(600, 330, 60, 640, 360, 900); bg.addColorStop(0, '#26282f'); bg.addColorStop(1, '#0a0b0f');
    x.fillStyle = bg; x.fillRect(0, 0, W, Hh);
    // faint rainbow light thrown onto the desk by the foil (as in the still)
    x.save(); x.globalCompositeOperation = 'screen'; x.filter = 'blur(40px)';
    const spill = x.createLinearGradient(820, 40, 1240, 300);
    for (let k = 0; k <= 6; k++) { const hi = (Math.floor(((0.1 + k / 7) % 1) * 256)) * 3; spill.addColorStop(k / 6, `rgba(${HOLO[hi] * 255 | 0},${HOLO[hi + 1] * 255 | 0},${HOLO[hi + 2] * 255 | 0},0.11)`); }
    x.fillStyle = spill; x.beginPath(); x.ellipse(1050, 150, 230, 70, -0.5, 0, 7); x.fill();
    x.beginPath(); x.ellipse(170, 640, 200, 50, -0.4, 0, 7); x.fill();
    x.restore();
    const im = x.getImageData(0, 0, W, Hh), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const n = (R() - 0.5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n * 1.1; }
    x.putImageData(im, 0, 0); return (deskTex = c);
  }
  function holoCat(x, cx, cy, s) {
    x.beginPath(); x.moveTo(cx - s * 0.95, cy - s * 0.1); x.lineTo(cx - s * 0.8, cy - s * 1.05); x.lineTo(cx - s * 0.35, cy - s * 0.72);
    x.quadraticCurveTo(cx, cy - s * 0.82, cx + s * 0.35, cy - s * 0.72); x.lineTo(cx + s * 0.8, cy - s * 1.05); x.lineTo(cx + s * 0.95, cy - s * 0.1);
    x.bezierCurveTo(cx + s * 1.0, cy + s * 0.75, cx - s * 1.0, cy + s * 0.75, cx - s * 0.95, cy - s * 0.1); x.closePath();
  }
  function holoDog(x, cx, cy, s) {
    x.beginPath(); x.ellipse(cx, cy, s * 0.72, s * 0.86, 0, 0, 7);
    x.moveTo(cx - s * 0.55, cy - s * 0.6); x.ellipse(cx - s * 0.82, cy - s * 0.05, s * 0.26, s * 0.62, 0.25, 0, 7);
    x.moveTo(cx + s * 1.08, cy - s * 0.05); x.ellipse(cx + s * 0.82, cy - s * 0.05, s * 0.26, s * 0.62, -0.25, 0, 7);
  }
  const patCache = new WeakMap(), faceCache = new Map();

  function holoExplainer(ctx, W, Hh, t) {
    const sm = H.smooth, E = H.ease, tex = getFoilTex();
    ctx.drawImage(getDesk(W, Hh), 0, 0);
    const INK = 'rgba(14,18,40,0.86)', INK_BIG = 'rgba(14,18,40,0.88)';
    let pats = patCache.get(ctx); if (!pats) { pats = tex.map((tc) => ctx.createPattern(tc, 'repeat')); patCache.set(ctx, pats); }
    // paint with seamless foil; the phase crossfades between neighbouring tiles so the rainbow drifts smoothly
    const foilPaint = (c, phase, paint) => {
      const p = (((phase % 1) + 1) % 1) * 8, k = Math.floor(p) % 8, f = p - Math.floor(p);
      c.fillStyle = c.strokeStyle = pats[k]; paint();
      if (f > 0.03) { const a0 = c.globalAlpha; c.globalAlpha = a0 * f; c.fillStyle = c.strokeStyle = pats[(k + 1) % 8]; paint(); c.globalAlpha = a0; }
    };
    const foilFill = (c, x, y, w, h, phase) => foilPaint(c, phase, () => c.fillRect(x, y, w, h));
    const emboss = (c, s, x, y, font, phase, align = 'center') => {
      c.font = font; c.textAlign = align; c.textBaseline = 'alphabetic';
      c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillText(s, x + 2, y + 2); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillText(s, x - 1.2, y - 1.2);
      foilPaint(c, phase, () => c.fillText(s, x, y));
    };
    // sunken art window: foil + embossed sunburst + translucent navy/violet ink, with a bevelled rim
    const artWindow = (c, x, y, w, h, r, ph) => {
      c.save(); c.beginPath(); c.roundRect(x, y, w, h, r); c.clip();
      const p = (((ph % 1) + 1) % 1) * 8, k = Math.floor(p) % 8, f = p - Math.floor(p), s = Math.max(w, h) * 1.15;
      const dx = x + w / 2 - s / 2, dy = y + h * 0.5 - s * 0.47, a0 = c.globalAlpha;
      c.drawImage(getWin(k), dx, dy, s, s); if (f > 0.03) { c.globalAlpha = a0 * f; c.drawImage(getWin((k + 1) % 8), dx, dy, s, s); c.globalAlpha = a0; }
      c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.55)'; c.beginPath(); c.roundRect(x + 1, y + 1, w + 2, h + 2, r); c.stroke();
      c.restore();
      c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.roundRect(x, y, w, h, r); c.stroke();
    };
    // printed ink frame with a knocked-out foil frame line, as on the hero card
    const inkFrame = (c, w, h, ink, ph) => {
      c.fillStyle = ink; c.fillRect(-w / 2, -h / 2, w, h);
      c.lineWidth = 4; foilPaint(c, ph + 0.15, () => { c.beginPath(); c.roundRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 9); c.stroke(); });
    };
    const shadowRect = (c, w, h, r, lift) => { for (let k = 3; k >= 1; k--) { c.fillStyle = `rgba(0,0,0,${0.16})`; c.beginPath(); c.roundRect(-w / 2 + lift * 0.5 + k * 3, -h / 2 + lift + k * 3, w, h, r + k * 2); c.fill(); } };
    // light sweeping over foil: a diagonal prismatic band (screen) with a hot white core (color-dodge, so it flares on foil, not ink)
    const glint = (c, w, h, g) => { if (g <= 0 || g >= 1) return; const x = -w / 2 + (w + 300) * g - 150;
      const gr = c.createLinearGradient(x - 120, -60, x + 120, 60);
      gr.addColorStop(0, 'rgba(255,70,205,0)'); gr.addColorStop(0.25, 'rgba(255,70,205,0.22)'); gr.addColorStop(0.4, 'rgba(70,170,255,0.3)');
      gr.addColorStop(0.5, 'rgba(255,255,255,0.42)'); gr.addColorStop(0.6, 'rgba(255,228,100,0.3)'); gr.addColorStop(0.75, 'rgba(255,150,90,0.2)'); gr.addColorStop(1, 'rgba(255,150,90,0)');
      c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = gr; c.fillRect(x - 300 - h * 0.5, -h / 2, 600 + h, h);
      const g2 = c.createLinearGradient(x - 40, -20, x + 40, 20); g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(0.5, 'rgba(255,255,255,0.5)'); g2.addColorStop(1, 'rgba(255,255,255,0)');
      c.globalCompositeOperation = 'color-dodge'; c.fillStyle = g2; c.fillRect(x - 60 - h * 0.5, -h / 2, 120 + h, h); c.restore(); };
    const faceImg = (face, w, h, k) => {
      const key = face.key + '|' + w + '|' + k; let c = faceCache.get(key); if (c) return c;
      c = H.layer(w, h); const x = c.getContext('2d'); x.translate(w / 2, h / 2); x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, 14); x.clip();
      foilFill(x, -w / 2, -h / 2, w, h, k / 8); face(x, w, h, k / 8); faceCache.set(key, c); return c;
    };
    // a card: position, size, rotation, flip (1 = face, 0 = edge-on), face painter
    const card = (cx, cy, w, h, rot, flip, phase, face, lift = 6, gl = 0) => {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
      ctx.scale(Math.max(0.02, Math.abs(flip)), 1);
      shadowRect(ctx, w, h, 14, lift);
      ctx.save(); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 14); ctx.clip();
      if (flip > 0 && face.key) { // static faces: cached per phase bucket, crossfaded like foilPaint
        const p = (((phase % 1) + 1) % 1) * 8, k = Math.floor(p) % 8, f = p - Math.floor(p);
        ctx.drawImage(faceImg(face, w, h, k), -w / 2, -h / 2);
        if (f > 0.03) { const a0 = ctx.globalAlpha; ctx.globalAlpha = a0 * f; ctx.drawImage(faceImg(face, w, h, (k + 1) % 8), -w / 2, -h / 2); ctx.globalAlpha = a0; }
      } else { foilFill(ctx, -w / 2, -h / 2, w, h, phase); }
      if (flip > 0) { if (!face.key) face(ctx, w, h, phase); } else { ctx.fillStyle = 'rgba(20,30,90,0.75)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, w * 0.32, h * 0.32, 0.5, 0, 7); ctx.stroke(); }
      glint(ctx, w, h, gl);
      // gloss varnish edge light: brighter top-left rim, darker bottom-right (card thickness)
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.roundRect(-w / 2 + 1, -h / 2 + 1, w, h, 14); ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 14); ctx.stroke();
      ctx.restore();
    };
    // die-cut sticker: white border, foil, dark ink text; slapped down with an overshoot
    const sticker = (cx, cy, w, h, rot, slap, phase, draw, shape = 'rect', tint = null) => {
      if (slap <= 0) return; const s = 1 + (1 - E.back(Math.min(1, slap))) * 0.6;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, slap * 3);
      const path = (pad) => { ctx.beginPath(); if (shape === 'circle') ctx.arc(0, 0, w / 2 + pad, 0, 7); else if (shape === 'bubble') { ctx.roundRect(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad * 2, 26 + pad); ctx.moveTo(-w * 0.3, h / 2 + pad - 2); ctx.lineTo(-w * 0.42 - pad, h / 2 + 34 + pad); ctx.lineTo(-w * 0.12, h / 2 + pad - 2); }
        else if (shape === 'arrow') { const hw = h / 2 + pad; ctx.moveTo(-w / 2 - pad, -hw * 0.55); ctx.lineTo(w / 2 - h * 0.7, -hw * 0.55); ctx.lineTo(w / 2 - h * 0.7, -hw * 1.15); ctx.lineTo(w / 2 + pad * 1.6, 0); ctx.lineTo(w / 2 - h * 0.7, hw * 1.15); ctx.lineTo(w / 2 - h * 0.7, hw * 0.55); ctx.lineTo(-w / 2 - pad, hw * 0.55); ctx.closePath(); }
        else ctx.roundRect(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad * 2, 14 + pad); };
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.save(); ctx.translate(5, 7); path(8); ctx.fill(); ctx.restore();
      // white vinyl border, lit from the top-left
      const wg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); wg.addColorStop(0, '#ffffff'); wg.addColorStop(1, '#dcd9d2');
      ctx.fillStyle = wg; path(8); ctx.fill();
      ctx.save(); path(0); ctx.clip(); foilFill(ctx, -w / 2 - 40, -h / 2 - 40, w + 80, h + 80, phase); if (tint) { ctx.fillStyle = tint; ctx.fillRect(-w, -h, w * 2, h * 2); }
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.translate(1.5, 1.5); path(0); ctx.stroke(); ctx.restore();
      draw(ctx); ctx.restore();
    };
    const inkText = (c, s, x, y, size, col = '#141838', font = 'Russo One') => { c.font = `400 ${size}px "${font}"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y); };
    // bold ✓ / ✗ drawn as strokes (the glyphs come out hairline-thin): dark emboss shadow, then white
    const mark = (c, ok) => { const path = (o) => { c.beginPath(); if (ok) { c.moveTo(-24 + o, 2 + o); c.lineTo(-7 + o, 20 + o); c.lineTo(26 + o, -20 + o); }
        else { c.moveTo(-20 + o, -20 + o); c.lineTo(20 + o, 20 + o); c.moveTo(20 + o, -20 + o); c.lineTo(-20 + o, 20 + o); } };
      c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 13; c.strokeStyle = 'rgba(0,0,0,0.45)'; path(2.5); c.stroke(); c.strokeStyle = '#fff'; path(0); c.stroke(); };
    const tilt = t * 0.11;
    const STK = 'rgba(244,240,230,0.45)';
    // foil robot figure with ink line art (visor, chest dial), centre bottom at the current origin
    const robotFig = (c, s, ph) => {
      c.save(); foilPaint(c, ph, () => { robot(c, s); c.fill(); });
      c.strokeStyle = 'rgba(12,14,34,0.95)'; c.lineWidth = 6 * s / 0.62; c.lineJoin = 'round'; robot(c, s); c.stroke();
      c.scale(s, s); c.lineWidth = 6;
      c.beginPath(); c.moveTo(0, -250); c.lineTo(0, -280); c.stroke();
      c.beginPath(); c.arc(0, -290, 11, 0, 7); foilPaint(c, ph + 0.3, () => c.fill()); c.strokeStyle = 'rgba(12,14,34,0.95)'; c.stroke();
      c.beginPath(); c.roundRect(-44, -222, 88, 44, 18); c.fillStyle = 'rgba(12,14,34,0.8)'; c.fill();
      c.beginPath(); c.arc(-20, -200, 9, 0, 7); c.arc(20, -200, 9, 0, 7); foilPaint(c, ph + 0.5, () => c.fill());
      c.beginPath(); c.arc(0, -78, 28, 0, 7); c.strokeStyle = 'rgba(12,14,34,0.9)'; c.lineWidth = 5; c.stroke();
      c.restore();
    };

    // ---------- faces ----------
    const faceTitle = (c, w, h, ph) => {
      inkFrame(c, w, h, INK, ph);
      artWindow(c, -w / 2 + 24, -h * 0.05, w - 48, h * 0.5, 10, ph + 0.35);
      c.save(); c.translate(0, h * 0.42); robotFig(c, 0.75, ph + 0.5); c.restore();
      emboss(c, 'How does', 0, -h * 0.3, '400 58px "Russo One"', ph); emboss(c, 'AI learn?', 0, -h * 0.15, '400 68px "Russo One"', ph + 0.2);
    };
    const faceExample = (kind) => faceEx[kind];
    const faceEx = {}; ['cat', 'dog'].forEach((kind) => { faceEx[kind] = (c, w, h, ph) => {
      inkFrame(c, w, h, INK, ph);
      artWindow(c, -w / 2 + 12, -h / 2 + 52, w - 24, h * 0.56, 6, ph + 0.15);
      (kind === 'cat' ? holoCat : holoDog)(c, 0, -h / 2 + 52 + h * 0.3, w * 0.24);
      foilPaint(c, ph + 0.4, () => c.fill()); c.strokeStyle = 'rgba(12,14,34,0.95)'; c.lineWidth = 4; c.stroke();
      emboss(c, kind.toUpperCase(), 0, -h / 2 + 42, `400 ${Math.round(w * 0.2)}px "Russo One"`, ph);
      c.fillStyle = 'rgba(236,232,220,0.94)'; c.beginPath(); c.roundRect(-w / 2 + 12, h * 0.2, w - 24, h * 0.24, 5); c.fill();
      inkText(c, kind === 'cat' ? 'whiskers · ears' : 'snout · floppy ears', 0, h * 0.32, Math.round(w * 0.08), '#2a2e50', 'Inter');
    }; faceEx[kind].key = kind; });
    const faceModel = (bars) => (c, w, h, ph) => {
      inkFrame(c, w, h, INK, ph);
      artWindow(c, -w / 2 + 18, -h / 2 + 70, w - 36, h * 0.42, 8, ph + 0.25);
      c.save(); c.translate(0, -h / 2 + 70 + h * 0.4); robotFig(c, 0.62, ph + 0.5); c.restore();
      emboss(c, 'MODEL', 0, -h / 2 + 56, '400 46px "Russo One"', ph);
      c.fillStyle = 'rgba(236,232,220,0.95)'; c.beginPath(); c.roundRect(-w / 2 + 18, h * 0.04, w - 36, h * 0.42, 6); c.fill();
      c.font = '800 28px "Inter"'; const lw = Math.max(...['ears', 'whiskers', 'snout'].map((lb) => c.measureText(lb).width));
      const bx0 = -w / 2 + 30 + lw + 12, bw = w / 2 - 46 - bx0;
      ['ears', 'whiskers', 'snout'].forEach((lb, i) => { const y = h * 0.1 + 20 + i * 44;
        c.font = '800 28px "Inter"'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#141838'; c.fillText(lb, -w / 2 + 30, y);
        c.fillStyle = 'rgba(20,24,56,0.15)'; c.fillRect(bx0, y - 9, bw, 18);
        foilPaint(c, ph + i * 0.2, () => c.fillRect(bx0, y - 9, bw * bars[i], 18)); c.strokeStyle = '#141838'; c.lineWidth = 1.5; c.strokeRect(bx0, y - 9, bw * bars[i], 18); });
      c.font = '800 28px "Inter"'; c.textAlign = 'center'; c.fillStyle = 'rgba(20,24,56,0.8)'; c.fillText('weights', 0, h * 0.425);
    };
    // big cards: lighter ink so the foil breathes, with the hero's sunburst embossed faintly behind the text
    const bigFace = (c, w, h, ph, rx) => {
      c.save(); c.globalAlpha = 0.24; const s = w * 1.25; c.drawImage(getRaysOv(), rx - s / 2, -s * 0.47, s, s); c.restore();
      inkFrame(c, w, h, INK_BIG, ph);
      const vg = c.createRadialGradient(rx, 0, 80, rx, 0, w * 0.75); vg.addColorStop(0, 'rgba(14,18,40,0)'); vg.addColorStop(1, 'rgba(14,18,40,0.45)');
      c.fillStyle = vg; c.fillRect(-w / 2, -h / 2, w, h);
    };
    const faceStats = (pct, lp) => (c, w, h, ph) => {
      bigFace(c, w, h, ph, -w * 0.22);
      emboss(c, 'ACCURACY', -w * 0.22, -h * 0.28, '400 52px "Russo One"', ph);
      emboss(c, pct + '%', -w * 0.22, h * 0.16, '400 170px "Russo One"', ph + 0.3);
      const bx = w * 0.05, bw = w * 0.4, by = h * 0.32;
      c.fillStyle = 'rgba(8,10,26,0.55)'; c.beginPath(); c.roundRect(bx - 16, -h * 0.4, bw + 40, h * 0.4 + by + 60, 10); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx, -h * 0.36); c.lineTo(bx, by); c.lineTo(bx + bw, by); c.stroke();
      for (let r = 0; r < 8; r++) { const a = 0.97 - 0.36 * Math.exp(-r / 2.3), g = H.clamp(lp * 8 - r), bh = (a - 0.45) / 0.55 * h * 0.62 * E.out(g);
        if (g <= 0) continue; const x0 = bx + 14 + r * bw / 8, bww = bw / 8 - 10;
        foilPaint(c, ph + r * 0.08, () => c.fillRect(x0, by - bh, bww, bh));
        c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x0, by - bh, bww, 2.5);
        c.strokeStyle = 'rgba(12,14,34,0.9)'; c.lineWidth = 2; c.strokeRect(x0, by - bh, bww, bh); }
      c.font = '800 28px "Inter"'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = 'rgba(236,232,255,0.92)'; c.fillText('training rounds →', bx + bw / 2, by + 36);
    };
    const faceEnd = (c, w, h, ph) => {
      bigFace(c, w, h, ph, 0);
      emboss(c, 'More examples', 0, -h * 0.16, '400 76px "Russo One"', ph);
      // fat foil arrow (Russo One has no '↓' glyph), embossed like the lettering
      const ay = h * 0.02 - 12, arrow = (ox, oy) => { c.beginPath(); c.moveTo(ox - 10, oy - 38); c.lineTo(ox + 10, oy - 38); c.lineTo(ox + 10, oy + 2);
        c.lineTo(ox + 28, oy + 2); c.lineTo(ox, oy + 34); c.lineTo(ox - 28, oy + 2); c.lineTo(ox - 10, oy + 2); c.closePath(); };
      arrow(2, ay + 2); c.fillStyle = 'rgba(0,0,0,0.6)'; c.fill(); arrow(-1.2, ay - 1.2); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill();
      arrow(0, ay); foilPaint(c, ph + 0.3, () => c.fill());
      emboss(c, 'better guesses', 0, h * 0.26, '400 76px "Russo One"', ph + 0.5);
    };

    // ---------- timeline ----------
    // HOOK: title card flips over, then is swept off while its question sticks to the corner
    if (t < 2.4) {
      const fl = E.out(sm(0.1, 0.6, t)), out = E.in(sm(1.75, 2.3, t));
      card(640 - out * 900, 370 - out * 400, 420, 600, -0.04 - out * 0.5 + (1 - fl) * 0.3, fl, tilt + 0.2, faceTitle, 6 + (1 - fl) * 20, sm(0.9, 1.6, t));
    }
    const header = sm(1.95, 2.2, t);
    // DATA: labelled example cards are dealt onto a pile and fed to the model card
    const sweep1 = E.in(sm(5.95, 6.3, t));
    if (t > 2.3 && t < 6.4) {
      for (let k = 0; k < 12; k++) {
        const t0 = 2.45 + k * 0.26, p = E.out(sm(t0, t0 + 0.32, t)); if (p <= 0) continue;
        const px = 330 + Math.sin(k * 2.3) * 14, py = 400 - k * 2 + Math.cos(k * 1.7) * 8;
        card(H.lerp(-200, px, p) - sweep1 * 900, H.lerp(820, py, p), 210, 294, H.lerp(-1.2, Math.sin(k * 3.1) * 0.12, p), 1, tilt + k * 0.07 + 0.1, faceExample(k % 3 === 1 ? 'dog' : 'cat'), 6 + (1 - p) * 30);
      }
      const mp = E.out(sm(2.5, 2.95, t));
      if (t < 6.0) card(H.lerp(1500, 960, mp), 360, 340, 476, 0.03, 1, tilt + 0.45, faceModel([0.3, 0.7, 0.5]), 8);
      sticker(645, 330 - sweep1 * 600, 150, 60, -0.03, sm(3.0, 3.25, t), tilt + 0.3, (c) => inkText(c, 'train', -10, 2, 30), 'arrow', STK);
      const p = sm(2.9, 5.5, t), v = p >= 1 ? 1000000 : Math.round(Math.pow(10, 6 * p));
      sticker(380 - sweep1 * 900, 615, 420, 112, -0.02, sm(2.8, 3.05, t), tilt + 0.6, (c) => { c.fillStyle = 'rgba(14,18,40,0.82)'; c.beginPath(); c.roundRect(-210, -56, 420, 112, 14); c.fill();
        emboss(c, v.toLocaleString('en-US'), -16, 22, '400 66px "Russo One"', tilt + 0.1); c.font = '800 28px "Inter"'; c.fillStyle = '#e8e4ff'; c.textAlign = 'right'; c.fillText('examples', 196, 40); });
    }
    // LOOP: guess -> check -> adjust, with stickers slapped on the desk
    const mpos = E.inOut(sm(6.0, 6.45, t)), flipB = sm(10.3, 10.75, t);
    if (t >= 6.0 && t < 10.75) {
      const adj = E.inOut(sm(8.7, 9.3, t)), bars = [H.lerp(0.3, 0.85, adj), H.lerp(0.7, 0.95, adj), H.lerp(0.5, 0.1, adj)];
      const fl = flipB < 0.5 ? 1 - flipB * 2 : 0;
      const sweep2 = E.in(sm(10.3, 10.6, t));
      const nf = sm(6.5, 6.8, t), dealt = E.out(sm(6.3, 6.5, t));
      card(H.lerp(-150, 175, dealt) - sweep2 * 600, 390, 260, 364, -0.05, nf < 0.5 ? -(1 - nf * 2) : (nf - 0.5) * 2, tilt + 0.1, faceExample('cat'), 8);
      if (fl > 0) card(H.lerp(960, 585, mpos), 375, 370, 518, 0.02, fl, tilt + 0.45, faceModel(bars), 8, sm(9.2, 9.7, t));
      sticker(352 - sweep2 * 600, 215, 150, 58, -0.04, sm(6.85, 7.05, t), tilt + 0.2, (c) => inkText(c, 'Guess', -10, 2, 30), 'arrow', STK);
      const right = t >= 9.5, sw = sweep2 * 900;
      sticker(1010 + sw, 220, 270, 120, 0.04, sm(7.2, 7.4, t), tilt + 0.35, (c) => inkText(c, 'dog?', 0, 4, 66), 'bubble', STK);
      sticker(1010 + sw, 220, 270, 120, -0.03, sm(9.5, 9.7, t), tilt + 0.55, (c) => inkText(c, 'cat', 0, 4, 66, '#0b3d1a'), 'bubble', 'rgba(60,255,120,0.28)');
      sticker(1010 + sw, 92, 160, 50, -0.02, sm(7.75, 7.95, t), tilt + 0.15, (c) => inkText(c, 'Check', 0, 2, 30), 'rect', STK);
      const shake = t > 7.65 && t < 8.0 ? Math.sin(t * 90) * 6 : 0;
      if (!right) sticker(1185 + sw + shake, 205, 100, 100, 0.1, sm(7.65, 7.8, t), tilt, (c) => mark(c, false), 'circle', 'rgba(255,30,30,0.7)');
      else sticker(1185 + sw, 205, 100, 100, 0.1, sm(9.75, 9.9, t), tilt, (c) => mark(c, true), 'circle', 'rgba(30,200,80,0.75)');
      sticker(960 + sw, 470, 220, 62, Math.PI - 0.25, sm(8.2, 8.45, t), tilt + 0.25, (c) => { c.rotate(Math.PI); inkText(c, 'Adjust', 14, 2, 30); }, 'arrow', STK);
    }
    // PROGRESS + TAKEAWAY: the model card flips over to its stats side, then flips once more for the moral
    if (t >= 10.5) {
      const fl = flipB > 0.5 ? (flipB - 0.5) * 2 : 0, fl2 = sm(12.95, 13.4, t);
      const lp = sm(10.9, 12.3, t), pct = Math.round(61 + 36 * E.out(lp));
      const f2 = fl2 < 0.5 ? 1 - fl2 * 2 : (fl2 - 0.5) * 2;
      const face = fl2 < 0.5 ? faceStats(pct, lp) : faceEnd;
      card(640, 370, 1000, 540, -0.015, fl * f2, tilt + 0.3, face, 8, fl2 < 0.5 ? sm(12.35, 12.9, t) : sm(13.6, 14.3, t));
      if (fl2 < 0.5 && t > 12.3) {
        const sp = sm(12.3, 12.9, t);
        for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, r = 150 + sp * 120, x = 420 + Math.cos(a) * r * 1.4, y = 400 + Math.sin(a) * r * 0.8, s = 12 * (1 - sp);
          ctx.fillStyle = `rgba(255,255,255,${1 - sp})`; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.25, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.25, y); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x, y + s * 0.25); ctx.lineTo(x + s, y); ctx.lineTo(x, y - s * 0.25); ctx.fill(); }
      }
    }
    // persistent header sticker
    sticker(248, 48, 456, 62, -0.02, header, tilt + 0.7, (c) => inkText(c, 'How does AI learn?', 0, 2, 44), 'rect', STK);
    H.vignette(ctx, W, Hh, 0.45);
    H.grain(ctx, W, Hh, 0.025, 77 + Math.floor(t * 30), true);
  }

  // Sound: trading cards on a desk. Cards are flicked out and land (thwip + soft card-on-desk tap), flipped (bend snap,
  // a puff of air, land), slid and swept across the desk (felt friction); die-cut stickers are peeled (a short sticky
  // crackle) and slapped down at the frame their overshoot touches the desk; foil glints get a quiet low shimmer and
  // the 97% emphasis a bigger "shing" chord. A quiet room underneath, no music.
  // All times are copied from holoExplainer() above (same deal/flip/sticker windows and E.out/E.in/E.back easing).
  // Voiceover mode (k.vo): the room drops out; dealt-card thwips/taps, counter ticks, peels and glints are minor.
  function holoSound(k) {
    const sm = H.smooth, E = H.ease, D = 15;
    const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
    // sticker scale = 1 + (1 - E.back(slap))*0.6 first reaches 1 (touches the desk) at slap = 1 - c/(c+1) ≈ 0.37
    const touch = (a, b) => a + (1 - 1.70158 / 2.70158) * (b - a);
    const thwip = (t, g = 1, pan = 0, minor = false) => k.noise(t, { dur: 0.06, filter: 'bandpass', f: [[0, 2400], [0.06, 1100]], q: 1.2, gain: 0.2 * g, a: 0.004, pan, minor });
    const tap = (t, g = 1, pan = 0, minor = false) => { k.noise(t, { dur: 0.035, filter: 'bandpass', f: 1000, q: 1, gain: 0.3 * g, a: 0.001, pan, minor }); k.tone(t, { f: [[0, 190], [0.05, 90]], dur: 0.06, gain: 0.16 * g, pan, minor }); };
    const slide = (a, d, g = 1, pan = 0, minor = false) => k.noise(a, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 900], [d, 1400]], q: 0.8, gain: 0.08 * g, a: d * 0.4, pan, minor });
    // a card flip: bend snap at a, puff of air through the turn, lands at b
    const flip = (a, b, g = 1, pan = 0, minor = false) => { k.noise(a, { dur: 0.04, filter: 'bandpass', f: 1700, q: 1.5, gain: 0.22 * g, a: 0.002, pan, minor });
      k.noise(a + 0.02, { dur: b - a, color: 'pink', filter: 'bandpass', f: [[0, 500], [(b - a) / 2, 1100], [b - a, 500]], q: 0.9, gain: 0.1 * g, a: (b - a) * 0.4, pan, minor }); tap(b, g, pan, minor); };
    // sticker: peeled off the backing just before, slapped down where it touches
    const sticker = (a, b, g = 1, pan = 0, minor = false) => { const ht = touch(a, b), r = H.rng(Math.floor(a * 1000));
      for (let i = 0; i < 4; i++) k.noise(a - 0.14 + i * 0.02 + r() * 0.01, { dur: 0.008, filter: 'bandpass', f: 1300 + r() * 900, q: 1.5, gain: 0.12 * g, a: 0.001, pan, minor: true });
      k.play('slap', ht, { gain: 0.5 * g, pan, minor }); k.noise(ht + 0.01, { dur: 0.12, color: 'brown', filter: 'lowpass', f: 600, gain: 0.12 * g, pan, minor }); return ht; };
    // foil glint sweep: a quiet low shimmer (filtered noise sweep + a soft detuned triangle dyad), no high pings
    const glint = (a, b, g = 1, pan = 0, notes = ['E4', 'B4']) => { const d = b - a;
      k.noise(a, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 800], [d * 0.5, 2000], [d, 1000]], q: 3, gain: 0.05 * g, a: d * 0.45, pan, minor: true });
      notes.forEach((n, i) => [-6, 6].forEach((det) => k.tone(a + d * 0.2, { f: n, type: 'triangle', detune: det, dur: d * 0.9, gain: 0.018 * g, a: d * 0.35, filter: 'lowpass', f2: 1600, verb: 0.3, pan: pan + (i - 0.5) * 0.3, minor: true }))); };
    const counter = (val, a, b, gap, pan, avoid = []) => { let last = -1, prev = val(a);
      for (let t = a; t <= b; t += 0.002) { const v = val(t);
        if (v !== prev && t - last >= gap && !avoid.some((x) => t > x - 0.03 && t < x + 0.1)) { k.play('tick', t, { f: 2800, gain: 0.9, pan, minor: true }); last = t; }
        prev = v; } };

    k.bed('room', 0, D, { gain: 0.6 });

    // ---- HOOK: title card flips face up (E.out(sm(0.1, 0.6)): fast start, lands ~0.45), glint 0.9–1.6
    flip(0.1, 0.45, 0.75, 0);
    glint(0.9, 1.6, 1.0, 0);
    // card swept off E.in(sm(1.75, 2.3)) — accelerating slide; header sticker 1.95–2.2
    slide(1.75, 0.55, 1.4, -0.4);
    sticker(1.95, 2.2, 1.0, -0.7);

    // ---- DATA: model card slides in E.out(sm(2.5, 2.95)), settled ~2.77
    slide(2.5, 0.3, 1.0, 0.6); tap(2.77, 0.9, 0.6);
    // twelve example cards dealt at t0 = 2.45 + k*0.26, landing ~t0 + 0.19 (E.out over 0.32)
    const lands = [];
    for (let c = 0; c < 12; c++) { const t0 = 2.45 + c * 0.26; thwip(t0, 0.7, -0.7, true); tap(t0 + 0.19, 0.6, -0.4, true); lands.push(t0, t0 + 0.19); }
    const tCount = sticker(2.8, 3.05, 0.9, -0.3);      // counter sticker
    const tTrain = sticker(3.0, 3.25, 0.8, 0.0);       // "train" arrow
    // foil digits count 10^(6p), p = sm(2.9, 5.5), lock at 1,000,000
    counter((t) => { const p = sm(2.9, 5.5, t); return p >= 1 ? 1e6 : Math.round(Math.pow(10, 6 * p)); }, 3.1, 5.45, 0.09, -0.3, [...lands, tCount, tTrain]);
    k.play('tock', 5.5, { f: 520, gain: 0.5, pan: -0.3 }); glint(5.5, 6.0, 0.6, -0.3, ['G4', 'D5']);

    // ---- 5.95–6.3 everything swept off the desk (E.in), model card slides left E.inOut(6.0–6.45)
    slide(5.95, 0.38, 1.8, -0.3); k.noise(5.98, { dur: 0.32, color: 'pink', filter: 'bandpass', f: [[0, 600], [0.32, 1800]], q: 0.7, gain: 0.12, a: 0.25, pan: -0.5 });
    slide(6.02, 0.43, 0.8, 0.3); tap(6.45, 0.6, 0.1, true);
    // cat card dealt E.out(sm(6.3, 6.5)) (lands ~6.42), flipped sm(6.5, 6.8)
    thwip(6.3, 0.9, -0.6); flip(6.5, 6.8, 0.8, -0.5);

    // ---- LOOP
    sticker(6.85, 7.05, 0.8, -0.3);                         // Guess arrow
    sticker(7.2, 7.4, 1.1, 0.5);                            // "dog?" bubble (the guess)
    // WRONG: red ✗ slapped sm(7.65, 7.8) and shaken 7.65–8.0 (sin(t*90): ~14 Hz rattle on the desk)
    const tx = sticker(7.65, 7.8, 1.6, 0.8);
    k.play('thud', tx, { f: 120, gain: 0.6, pan: 0.8 });
    k.noise(tx, { dur: 8.0 - tx, filter: 'bandpass', f: 600, q: 1.2, gain: 0.2, a: 0.01, hold: (8.0 - tx) * 0.6, pan: 0.8 });
    for (let x = tx; x < 7.98; x += 1 / 14.3) tap(x, 0.45, 0.8);
    k.tone(tx + 0.02, { f: 'Bb2', type: 'sawtooth', dur: 0.35, gain: 0.06, a: 0.01, hold: 0.2, filter: 'lowpass', f2: 600, pan: 0.8 });
    sticker(7.75, 7.95, 0.6, 0.5, true);                    // "Check"
    sticker(8.2, 8.45, 0.8, 0.4);                           // Adjust arrow
    // weights: stat bars slide to new lengths E.inOut(sm(8.7, 9.3)), then the model card glints 9.2–9.7
    k.noise(8.7, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.3, 1500], [0.6, 800]], q: 1.5, gain: 0.07, a: 0.3, pan: -0.1 });
    k.tone(8.7, { f: [[0, 220], [0.6, 330]], type: 'triangle', dur: 0.6, gain: 0.04, a: 0.3, pan: -0.1 });
    glint(9.2, 9.7, 0.7, -0.1);
    // RIGHT: "cat" bubble slapped over the old one sm(9.5, 9.7), ✓ sm(9.75, 9.9)
    sticker(9.5, 9.7, 1.1, 0.5);
    const tok = sticker(9.75, 9.9, 1.0, 0.8);
    k.play('success', tok + 0.02, { f: 'G4', gain: 0.7, pan: 0.6 });

    // ---- 10.3: everything swept right/off E.in(sm(10.3, 10.6)); model card flips to its stats side sm(10.3, 10.75)
    slide(10.3, 0.32, 1.6, 0.6);
    flip(10.32, 10.75, 1.2, 0);
    // stats: eight foil bars rise one by one (bar r starts at lp = r/8, lp = sm(10.9, 12.3)); % counts 61 -> 97
    const lp = (t) => sm(10.9, 12.3, t), bars = [];
    for (let r = 0; r < 8; r++) { const tb = when(lp, r / 8 + 1e-4, 10.9, 12.3); bars.push(tb); k.play('tock', tb, { f: 330 + r * 22, gain: 0.3, pan: 0.2 + r * 0.06, minor: true }); }
    const pct = (t) => Math.round(61 + 36 * E.out(lp(t)));
    const t97 = when(pct, 97, 10.9, 12.3);
    counter(pct, 10.92, t97 - 0.04, 0.085, -0.3, bars);
    k.play('tock', t97, { f: 560, gain: 0.55, pan: -0.3 });
    // THE HIT 12.3: foil stars burst out (12.3–12.9) and a glint sweeps the card (12.35–12.9): a big low "shing"
    k.play('thud', 12.3, { f: 90, gain: 1.1 });
    k.noise(12.3, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.25, 2300], [0.7, 900]], q: 1.6, gain: 0.22, a: 0.02, verb: 0.4 });
    ['C4', 'G4', 'C5', 'E5'].forEach((n, i) => [-8, 8].forEach((det) => k.tone(12.3, { f: n, type: 'triangle', detune: det, dur: 1.0, gain: 0.045, a: 0.01, hold: 0.15, filter: 'lowpass', f2: 2200, verb: 0.4, pan: (i - 1.5) * 0.3 })));

    // ---- 12.95–13.4: final flip to the takeaway face; glint 13.6–14.3 as the resolve
    flip(12.95, 13.4, 1.1, 0);
    ['F3', 'C4', 'A4', 'E5'].forEach((n, i) => k.tone(13.55 + i * 0.04, { f: n, type: 'triangle', dur: 1.4, gain: 0.05 - i * 0.006, a: 0.08, hold: 0.4, filter: 'lowpass', f2: 1800, verb: 0.4, pan: (i - 1.5) * 0.25 }));
    glint(13.6, 14.3, 1.1, 0, ['C4', 'G4']);
  }

  registerStyle({
    id: 'holographic-foil',
    name: 'Holographic Foil Card',
    category: 'Light & Imaging',
    description: 'A holo-rare trading card and die-cut sticker: cracked-ice foil whose rainbow diffraction shifts with angle and surface normals, embossed robot, sunburst and lettering catching specular glints, printed ink sitting on top, glitter flecks and rainbow spill on the desk.',
    motion: 'The card is dealt in and settles onto the desk, the sticker slaps down and holo confetti scatters, then the card slowly tilts toward the light so the rainbow band and specular glints sweep across the cracked-ice foil and embossed lettering.',
    fonts: ['400 54px "Russo One"', '800 15px "Inter"', '600 13px "Inter"', '400 30px "Russo One"', '800 24px "Inter"', '600 18px "Inter"'],
    frameT: 4.6,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Told with holo trading cards on a desk: examples are dealt as CAT/DOG cards onto a pile, arrows and answers are die-cut foil stickers slapped down with an overshoot, the model card\u2019s stat bars are its weights, scene changes are card flips to the stats side and back, and numbers are foil-embossed digits with a glint sweep for emphasis.',
    explainer(ctx, W, Hh, t) { holoExplainer(ctx, W, Hh, t); },
    explainerSound(k) { holoSound(k); },
    draw(ctx, W, Hh, t) {
      const R = H.rng(5150), nz = H.makeNoise(515);
      const tilt = H.lerp(-0.9, 0.984, H.ease.inOut(H.smooth(0.5, 4.2, t))) + 0.015 * Math.sin(t * 2.2) * H.smooth(4.0, 4.6, t);
      const deal = H.ease.back(H.smooth(0, 0.85, t)), land = H.smooth(0.45, 1.0, t);
      const stP = H.smooth(0.85, 1.25, t), stLand = H.ease.out(stP);

      // ---------- desk ----------
      const bg = ctx.createRadialGradient(560, 330, 60, 640, 360, 900);
      bg.addColorStop(0, '#24262e'); bg.addColorStop(1, '#0a0b0f');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, Hh);
      // fine matte texture
      const tex = ctx.getImageData(0, 0, W, Hh), td = tex.data;
      for (let i = 0; i < td.length; i += 4) { const n = (R() - 0.5) * 9; td[i] += n; td[i + 1] += n; td[i + 2] += n * 1.1; }
      ctx.putImageData(tex, 0, 0);

      // ---------- card ----------
      const CW = 420, CH = 588;
      const emb = H.layer(CW, CH), ex = emb.getContext('2d');
      ex.fillStyle = '#000'; ex.fillRect(0, 0, CW, CH);
      ex.fillStyle = '#fff'; ex.strokeStyle = '#fff';
      // raised frame ridge
      ex.lineWidth = 5; ex.beginPath(); ex.roundRect(14, 14, CW - 28, CH - 28, 14); ex.stroke();
      ex.lineWidth = 3; ex.beginPath(); ex.roundRect(26, 78, CW - 52, 280, 8); ex.stroke();
      // name lettering (embossed)
      ex.font = '400 46px "Russo One"'; ex.textBaseline = 'alphabetic'; ex.fillText('DREAMBOT', 30, 62);
      ex.font = '400 30px "Russo One"'; ex.textAlign = 'right'; ex.fillText('120', CW - 54, 60); ex.textAlign = 'left';
      // robot in art window (embossed)
      ex.save(); ex.translate(CW / 2, 350); ex.scale(0.9, 0.9);
      ex.fillStyle = 'rgb(200,200,200)'; robot(ex, 1); ex.fill();
      ex.fillStyle = '#fff'; ex.beginPath(); ex.arc(0, -290, 12, 0, 7); ex.fill();
      ex.lineWidth = 6; ex.beginPath(); ex.moveTo(0, -250); ex.lineTo(0, -282); ex.stroke();
      ex.lineCap = 'round'; ex.lineWidth = 22;
      ex.beginPath(); ex.moveTo(-76, -120); ex.quadraticCurveTo(-120, -150, -128, -200); ex.stroke(); // waving arm
      ex.beginPath(); ex.moveTo(76, -110); ex.quadraticCurveTo(112, -80, 118, -40); ex.stroke();
      ex.fillStyle = '#000'; ex.beginPath(); ex.roundRect(-44, -222, 88, 44, 18); ex.fill(); // visor recessed
      ex.fillStyle = '#fff'; ex.beginPath(); ex.arc(-20, -200, 10, 0, 7); ex.arc(20, -200, 10, 0, 7); ex.fill(); // eyes raised
      ex.fillStyle = '#000'; ex.beginPath(); ex.arc(0, -78, 30, 0, 7); ex.fill();
      ex.fillStyle = '#fff'; ex.beginPath(); // heart on chest
      ex.moveTo(0, -62); ex.bezierCurveTo(-30, -82, -18, -104, 0, -92); ex.bezierCurveTo(18, -104, 30, -82, 0, -62); ex.fill();
      ex.restore();
      // energy symbols
      [[60, 392], [84, 392]].forEach(([x, y]) => { ex.beginPath(); ex.arc(x, y, 9, 0, 7); ex.fill(); });
      const embB = H.layer(CW, CH), ebx = embB.getContext('2d'); ebx.filter = 'blur(2.2px)'; ebx.drawImage(emb, 0, 0);

      const band = 0.6365 + (tilt - 0.984) * 0.45;
      const foilCard = shadeFoil(CW, CH, embB, { seed: 11, crinkle: 3.6, emboss: 7, hue: 0.6976 + (tilt - 0.984) * 0.3, band, L: [-0.6 + tilt * 0.3, -0.8, 1.3], t, ox: 0, oy: 0, rays: [CW / 2, 200, 28, 80, CW - 28, 356] });

      // printed ink on top of the foil
      const card = H.layer(CW, CH), cc = card.getContext('2d');
      cc.drawImage(foilCard.canvas, 0, 0);
      // dark ink frame with windows (foil shows through windows and knock-out lettering)
      const ink = H.layer(CW, CH), ik = ink.getContext('2d');
      ik.fillStyle = 'rgba(14,18,40,0.86)'; ik.fillRect(0, 0, CW, CH);
      ik.globalCompositeOperation = 'destination-out';
      ik.fillStyle = '#000';
      ik.beginPath(); ik.roundRect(28, 80, CW - 56, 276, 7); ik.fill();   // art window
      ik.font = '400 46px "Russo One"'; ik.fillText('DREAMBOT', 30, 62);
      ik.font = '400 30px "Russo One"'; ik.textAlign = 'right'; ik.fillText('120', CW - 54, 60); ik.textAlign = 'left';
      ik.lineWidth = 5; ik.strokeStyle = '#000'; ik.beginPath(); ik.roundRect(14, 14, CW - 28, CH - 28, 14); ik.stroke(); // foil frame line
      [[60, 392], [84, 392]].forEach(([x, y]) => { ik.beginPath(); ik.arc(x, y, 9, 0, 7); ik.fill(); });
      ik.globalCompositeOperation = 'source-over';
      // translucent ink tint over the art window (cyan/magenta wash, foil glows through)
      const tint = H.layer(CW, CH), tk = tint.getContext('2d');
      const tg = tk.createLinearGradient(0, 80, 0, 356); tg.addColorStop(0, 'rgba(20,30,110,0.62)'); tg.addColorStop(1, 'rgba(70,10,90,0.55)');
      tk.fillStyle = tg; tk.fillRect(28, 80, CW - 56, 276);
      tk.globalCompositeOperation = 'destination-out'; tk.save(); tk.translate(CW / 2, 350); tk.scale(0.9, 0.9); tk.fillStyle = '#000'; robot(tk, 1); tk.fill();
      tk.lineCap = 'round'; tk.lineWidth = 22; tk.strokeStyle = '#000';
      tk.beginPath(); tk.moveTo(-76, -120); tk.quadraticCurveTo(-120, -150, -128, -200); tk.stroke();
      tk.beginPath(); tk.moveTo(76, -110); tk.quadraticCurveTo(112, -80, 118, -40); tk.stroke();
      tk.beginPath(); tk.arc(0, -290, 12, 0, 7); tk.fill(); tk.restore();
      ik.drawImage(tint, 0, 0);
      // robot line art in ink
      ik.save(); ik.translate(CW / 2, 350); ik.scale(0.9, 0.9); ik.strokeStyle = 'rgba(12,14,34,0.92)'; ik.lineWidth = 4; ik.lineJoin = 'round';
      robot(ik, 1); ik.stroke();
      ik.beginPath(); ik.arc(0, -290, 12, 0, 7); ik.stroke();
      ik.beginPath(); ik.roundRect(-44, -222, 88, 44, 18); ik.stroke();
      ik.fillStyle = 'rgba(12,14,34,0.55)'; ik.fill();
      ik.beginPath(); ik.arc(0, -78, 30, 0, 7); ik.stroke();
      ik.lineCap = 'round'; ik.lineWidth = 26; ik.strokeStyle = 'rgba(12,14,34,0.92)';
      ik.beginPath(); ik.moveTo(-76, -120); ik.quadraticCurveTo(-120, -150, -128, -200); ik.stroke();
      ik.beginPath(); ik.moveTo(76, -110); ik.quadraticCurveTo(112, -80, 118, -40); ik.stroke();
      ik.globalCompositeOperation = 'destination-out'; ik.lineWidth = 18;
      ik.beginPath(); ik.moveTo(-76, -120); ik.quadraticCurveTo(-120, -150, -128, -200); ik.stroke();
      ik.beginPath(); ik.moveTo(76, -110); ik.quadraticCurveTo(112, -80, 118, -40); ik.stroke();
      ik.globalCompositeOperation = 'source-over';
      ik.restore();
      // text box (cream print)
      ik.fillStyle = 'rgba(236,232,220,0.94)'; ik.beginPath(); ik.roundRect(28, 372, CW - 56, 150, 8); ik.fill();
      ik.fillStyle = 'rgba(14,18,40,0.9)';
      [[60, 392], [84, 392]].forEach(([x, y]) => { ik.beginPath(); ik.arc(x, y, 10.5, 0, 7); ik.fill(); });
      ik.fillStyle = '#e8e4ff'; [[60, 392], [84, 392]].forEach(([x, y]) => { ik.beginPath(); ik.moveTo(x - 4, y + 5); ik.lineTo(x + 1, y - 6); ik.lineTo(x + 1, y); ik.lineTo(x + 5, y - 2); ik.lineTo(x - 1, y + 7); ik.fill(); });
      ik.fillStyle = '#141838'; ik.font = '800 19px "Inter"'; ik.fillText('Neural Spark', 104, 399); ik.textAlign = 'right'; ik.fillText('90', CW - 46, 399); ik.textAlign = 'left';
      ik.fillStyle = 'rgba(20,24,56,0.25)'; ik.fillRect(46, 414, CW - 92, 1.5);
      ik.fillStyle = '#2a2e50'; ik.font = '600 13px "Inter"';
      ['Flip a coin. If heads, this robot', 'dreams up one brand-new idea and', 'adds it to your hand.'].forEach((l, k) => ik.fillText(l, 46, 440 + k * 19));
      ik.font = 'italic 600 11px "Inter"'; ik.fillStyle = 'rgba(42,46,80,0.8)';
      ik.fillText('It hums lullabies in binary.', 46, 507);
      // footer
      ik.fillStyle = 'rgba(220,222,240,0.85)'; ik.font = '600 11px "Inter"';
      ik.fillText('★ HOLO RARE', 34, CH - 34); ik.textAlign = 'right'; ik.fillText('001/150', CW - 34, CH - 34); ik.textAlign = 'left';
      cc.drawImage(ink, 0, 0);
      // gloss varnish: speculars still sparkle faintly on top of ink, plus emboss shading through ink
      const gloss = H.layer(CW, CH), gl = gloss.getContext('2d');
      const ggr = gl.createLinearGradient(0, 0, CW, CH);
      ggr.addColorStop(H.clamp(band - 0.2), 'rgba(255,255,255,0)'); ggr.addColorStop(H.clamp(band), 'rgba(255,255,255,0.13)'); ggr.addColorStop(H.clamp(band + 0.2), 'rgba(255,255,255,0)');
      gl.fillStyle = ggr; gl.fillRect(0, 0, CW, CH);
      cc.globalCompositeOperation = 'screen'; cc.drawImage(gloss, 0, 0); cc.globalCompositeOperation = 'source-over';
      // card stock edge
      cc.globalCompositeOperation = 'destination-in'; cc.fillStyle = '#000'; cc.beginPath(); cc.roundRect(0, 0, CW, CH, 18); cc.fill();
      cc.globalCompositeOperation = 'source-over';
      cc.strokeStyle = 'rgba(255,255,255,0.35)'; cc.lineWidth = 2; cc.beginPath(); cc.roundRect(1, 1, CW - 2, CH - 2, 17); cc.stroke();

      // ---------- sticker (hexagon badge) ----------
      const SW = 230;
      const hex = (x, cx0, cy0, r) => { x.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; x.lineTo(cx0 + Math.cos(a) * r, cy0 + Math.sin(a) * r); } x.closePath(); };
      const se = H.layer(SW, SW), sex = se.getContext('2d');
      sex.fillStyle = '#000'; sex.fillRect(0, 0, SW, SW);
      sex.strokeStyle = '#fff'; sex.lineWidth = 4; hex(sex, SW / 2, SW / 2, 88); sex.stroke();
      sex.fillStyle = '#fff'; sex.font = '400 78px "Russo One"'; sex.textAlign = 'center'; sex.fillText('AI', SW / 2, SW / 2 + 28);
      const seB = H.layer(SW, SW), sbx = seB.getContext('2d'); sbx.filter = 'blur(2px)'; sbx.drawImage(se, 0, 0);
      const foilS = shadeFoil(SW, SW, seB, { seed: 23, crinkle: 3.4, emboss: 9, hue: 0.1 + tilt * 0.2, band: 0.5 - tilt * 0.2, L: [-0.5, -0.9, 1.2], t, ox: 300, oy: 100 });
      { const fx = foilS.canvas.getContext('2d'); const ki = H.layer(SW, SW), kx = ki.getContext('2d');
        kx.fillStyle = 'rgba(16,14,48,0.88)'; kx.fillRect(0, 0, SW, SW); kx.globalCompositeOperation = 'destination-out';
        kx.font = '400 78px "Russo One"'; kx.textAlign = 'center'; kx.fillText('AI', SW / 2, SW / 2 + 28);
        kx.lineWidth = 6; hex(kx, SW / 2, SW / 2, 88); kx.stroke();
        kx.globalCompositeOperation = 'source-over'; kx.fillStyle = 'rgba(230,228,255,0.75)'; kx.font = '600 11px "Inter"'; kx.textAlign = 'center';
        kx.fillText('\u2605 \u2605 \u2605', SW / 2, SW / 2 + 52);
        fx.drawImage(ki, 0, 0); }
      const st = H.layer(SW + 20, SW + 20), stx = st.getContext('2d');
      stx.fillStyle = '#f4f2ee'; hex(stx, (SW + 20) / 2, (SW + 20) / 2, 108); stx.fill(); // white die-cut border
      stx.save(); hex(stx, (SW + 20) / 2, (SW + 20) / 2, 98); stx.clip(); stx.drawImage(foilS.canvas, 10, 10); stx.restore();
      stx.strokeStyle = 'rgba(0,0,0,0.12)'; stx.lineWidth = 1; hex(stx, (SW + 20) / 2, (SW + 20) / 2, 108); stx.stroke();

      // ---------- holo confetti flakes on desk ----------
      const flake = (x, y, s, a, hue) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        const [r, g, b] = hsl(hue, 0.9, 0.62);
        ctx.fillStyle = `rgb(${r * 255 | 0},${g * 255 | 0},${b * 255 | 0})`; ctx.fillRect(-s / 2, -s / 3, s, s * 0.66);
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-s / 2, -s / 3, s, s * 0.15);
        ctx.restore();
      };

      // ---------- compose ----------
      const cardX = 520 - (1 - deal) * 120, cardY = 362 + (1 - deal) * 600, cardA = -0.08 + tilt * 0.01 + (1 - deal) * 0.3;
      const sxTilt = 1 - 0.05 * (0.984 - tilt) / 1.884;
      const stX = 948, stY = 470, stA = 0.22;
      // rainbow light thrown onto the desk by the foil
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const spill = ctx.createLinearGradient(760, 120, 1180, 360);
      for (let k = 0; k <= 6; k++) { const [r, g, b] = hsl(0.55 + k / 7 + tilt * 0.1, 1, 0.5); spill.addColorStop(k / 6, `rgba(${r * 255 | 0},${g * 255 | 0},${b * 255 | 0},0.16)`); }
      ctx.fillStyle = spill; ctx.filter = 'blur(30px)';
      ctx.beginPath(); ctx.ellipse(860, 250, 170, 60, -0.9, 0, 7); ctx.fill();
      ctx.filter = 'none';
      ctx.restore();
      // shadows
      ctx.save();
      ctx.filter = 'blur(18px)'; ctx.fillStyle = 'rgba(0,0,0,0.65)';
      const lift = 1 + (1 - land) * 1.6;
      ctx.save(); ctx.translate(cardX + 18 * lift, cardY + 26 * lift); ctx.rotate(cardA); ctx.scale(sxTilt, 1); ctx.beginPath(); ctx.roundRect(-CW / 2, -CH / 2, CW, CH, 18); ctx.fill(); ctx.restore();
      if (stP > 0) { const sl = 1 + (1 - stLand) * 2.5; ctx.globalAlpha = stP; ctx.save(); ctx.translate(stX + 10 * sl, stY + 14 * sl); ctx.rotate(stA); ctx.scale(1 + (1 - stLand) * 0.3, 1 + (1 - stLand) * 0.3); hex(ctx, 0, 0, 108); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
      ctx.restore();
      for (let k = 0; k < 26; k++) {
        const x = R.range(760, 1240), y = R.range(80, 690);
        if (Math.hypot(x - stX, y - stY) < 130) continue;
        const fs = R.range(5, 12), fa = R() * 3, fh = R(), tk = 1.05 + k * 0.035, fp = H.smooth(tk - 0.4, tk, t);
        if (fp <= 0) continue;
        flake(x + (1 - fp) * 30, y - (1 - H.ease.out(fp)) * 160, fs, fa + (1 - fp) * 4, fh + tilt * 0.3);
      }
      if (stP > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, stP * 3); ctx.translate(stX, stY); ctx.rotate(stA + (1 - stLand) * -0.4); const ss = 1 + (1 - stLand) * 0.3; ctx.scale(ss, ss); ctx.drawImage(st, -(SW + 20) / 2, -(SW + 20) / 2); ctx.restore(); }
      ctx.save(); ctx.translate(cardX, cardY); ctx.rotate(cardA); ctx.scale(sxTilt, 1); ctx.drawImage(card, -CW / 2, -CH / 2); ctx.restore();

      // photo finish
      H.vignette(ctx, W, Hh, 0.45);
      H.grain(ctx, W, Hh, 0.025, 77 + Math.floor(t * 30), true);
    },
  });
}
```
