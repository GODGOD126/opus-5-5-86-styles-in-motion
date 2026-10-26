I want an animated explainer made in the "Patent Drawing" visual style (Illustration). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Cormorant Garamond, Courier Prime, Libre Baskerville
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Courier+Prime&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=block">
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
Name: Patent Drawing
Family: Illustration
Look: A 1930s US patent sheet: ruling-pen black ink line art with shade lines, parallel-line and stipple shading, section hatching, reference numerals on curved leaders, typeset header and inked signatures on yellowed paper.
Motion: Lines are inked one stroke at a time like a draughtsman at work — outlines first, then hatching, then numerals — while the FIG. 3 gear train slowly turns.
How it explains: The camera travels along one long patent sheet as FIG. 4–6 are inked stroke by stroke: ruled arrows and leader lines tie labels to parts, odometer drums count the examples and the accuracy, and an examiner's red pencil rings the wrong guess and the 97%.

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

REFERENCE STYLE SOURCE (styles/patent-drawing.js; W/H_ are always 1280x720)
```js
{
  // ---------- Vintage US patent drawing: "Thinking Machine" ----------
  let budget = Infinity, used = 0;
  const ok = () => used++ < budget;
  const drew = () => used <= budget; // was the last budgeted mark actually inked?
  const free = (fn) => { const u = used, b = budget; budget = Infinity; fn(); used = u; budget = b; }; // extras that ride along with it
  const SQ = Math.sqrt;
  const V = [1 / SQ(3), 1 / SQ(3), 1 / SQ(3)];
  const Ln = (() => { const v = [-0.5, 0.62, 0.6], m = Math.hypot(...v); return v.map((a) => a / m); })();
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  function path(ctx, pts, close) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (close) ctx.closePath();
  }
  function stroke(ctx, pts, w = 1.2, close = false, dash) {
    if (!pts.length || !ok()) return;
    path(ctx, pts, close); ctx.lineWidth = w; if (dash) ctx.setLineDash(dash); ctx.stroke(); if (dash) ctx.setLineDash([]);
  }
  function erase(ctx, pts) {
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; path(ctx, pts, true); ctx.fill(); ctx.restore();
  }
  function contours(ctx, x0, y0, w, h, cell, f, lev) {
    const nx = Math.ceil(w / cell), ny = Math.ceil(h / cell), v = new Float32Array((nx + 1) * (ny + 1));
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) v[j * (nx + 1) + i] = f(x0 + i * cell, y0 + j * cell) - lev;
    ctx.beginPath();
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = v[j * (nx + 1) + i], b = v[j * (nx + 1) + i + 1], cc = v[(j + 1) * (nx + 1) + i + 1], d = v[(j + 1) * (nx + 1) + i];
      const X = x0 + i * cell, Y = y0 + j * cell, pts = [];
      if ((a > 0) !== (b > 0)) pts.push([X + cell * a / (a - b), Y]);
      if ((b > 0) !== (cc > 0)) pts.push([X + cell, Y + cell * b / (b - cc)]);
      if ((d > 0) !== (cc > 0)) pts.push([X + cell * d / (d - cc), Y + cell]);
      if ((a > 0) !== (d > 0)) pts.push([X, Y + cell * a / (a - d)]);
      for (let k = 0; k + 1 < pts.length; k += 2) { ctx.moveTo(pts[k][0], pts[k][1]); ctx.lineTo(pts[k + 1][0], pts[k + 1][1]); }
    }
  }
  function hull(pts) {
    pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  // parallel hatch lines inside a clip polygon
  function hatch(ctx, clip, ang, gap, w = 0.8, bbox, grade) {
    if (!ok()) return;
    ctx.save(); path(ctx, clip, true); ctx.clip();
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of clip) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 2;
    const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
    ctx.beginPath();
    let o = -R;
    while (o < R) {
      const px = cx + nx * o, py = cy + ny * o;
      ctx.moveTo(px - dx * R, py - dy * R); ctx.lineTo(px + dx * R, py + dy * R);
      const u = (o + R) / (2 * R);
      o += grade ? gap / Math.max(0.15, grade(u)) : gap;
    }
    ctx.lineWidth = w; ctx.stroke(); ctx.restore();
  }
  // graded shade lining on a vertical face: lines crowd toward the shadow (right) edge, open out toward the light
  function vhatch(ctx, x0, x1, y0, y1, gmin, gmax, w = 0.55, xlo = -1e9) {
    if (!ok()) return;
    ctx.beginPath();
    for (let x = x1 - gmin * 0.5; x > x0; ) { if (x >= xlo) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); } const u = (x1 - x) / (x1 - x0); x -= gmin + (gmax - gmin) * Math.pow(u, 1.4); }
    ctx.lineWidth = w; ctx.stroke();
  }
  function stipple(ctx, clip, n, dens, r, rad = 0.75) {
    if (!ok()) return;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of clip) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    ctx.save(); path(ctx, clip, true); ctx.clip(); ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = r.range(x0, x1), y = r.range(y0, y1);
      if (r() < dens(x, y)) { const rr = rad * r.range(0.7, 1.25); ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, 6.283); }
    }
    ctx.fill(); ctx.restore();
  }
  function ring(c, axis, r, n = 64, a0 = 0, a1 = Math.PI * 2) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n, ca = Math.cos(a) * r, sa = Math.sin(a) * r;
      if (axis === 'z') out.push([c[0] + ca, c[1] + sa, c[2]]);
      else if (axis === 'y') out.push([c[0] + ca, c[1], c[2] + sa]);
      else out.push([c[0], c[1] + ca, c[2] + sa]);
    }
    return out;
  }
  const nrm = (axis, a) => axis === 'z' ? [Math.cos(a), Math.sin(a), 0] : axis === 'y' ? [Math.cos(a), 0, Math.sin(a)] : [0, Math.cos(a), Math.sin(a)];
  const add = (c, axis, h) => axis === 'z' ? [c[0], c[1], c[2] + h] : axis === 'y' ? [c[0], c[1] + h, c[2]] : [c[0] + h, c[1], c[2]];

  // solid of revolution: profile [[r,h],...]
  function lathe(ctx, P, c, axis, prof, o = {}) {
    const rings3 = prof.map(([r, h]) => ring(add(c, axis, h), axis, r, 72));
    const all = [];
    rings3.forEach((rg) => rg.forEach((p) => all.push(P(...p))));
    const sil = hull(all);
    erase(ctx, sil);
    // shading generator lines
    if (o.shade !== false) {
      for (let i = 0; i < prof.length - 1; i++) {
        if (Math.abs(prof[i][0] - prof[i + 1][0]) > Math.abs(prof[i][1] - prof[i + 1][1]) * 1.5) continue; // skip flat steps
        let ink = 0.5;
        ctx.beginPath(); let any = false;
        for (let a = -Math.PI; a < Math.PI; a += 0.01) {
          const nn = nrm(axis, a); if (dot3(nn, V) < 0.02) continue;
          const b = dot3(nn, Ln); const sh = H.clamp((0.35 - b) * 1.35);
          ink += sh * 0.01 * (o.dens || 34);
          if (ink >= 1) {
            ink -= 1; any = true;
            const ca = Math.cos(a), sa = Math.sin(a);
            const p1 = add(c, axis, prof[i][1]), p2 = add(c, axis, prof[i + 1][1]);
            const off = (pp, r) => axis === 'z' ? [pp[0] + ca * r, pp[1] + sa * r, pp[2]] : axis === 'y' ? [pp[0] + ca * r, pp[1], pp[2] + sa * r] : [pp[0], pp[1] + ca * r, pp[2] + sa * r];
            const A = P(...off(p1, prof[i][0])), B = P(...off(p2, prof[i + 1][0]));
            ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]);
          }
        }
        if (any && ok()) { ctx.lineWidth = o.hw || 0.75; ctx.stroke(); }
      }
    }
    // visible rim edges (front halves)
    rings3.forEach((rg, i) => {
      if (o.rims && !o.rims.includes(i)) return;
      const vis = [];
      let seg = [];
      for (let k = 0; k < rg.length; k++) {
        const a = Math.PI * 2 * k / 72, nn = nrm(axis, a);
        if (dot3(nn, V) > -0.02) seg.push(P(...rg[k])); else if (seg.length) { vis.push(seg); seg = []; }
      }
      if (seg.length) vis.push(seg);
      vis.forEach((s) => stroke(ctx, s, 1.05));
    });
    // visible cap (full ellipse)
    const capIdx = (axis === 'z' || axis === 'y' || axis === 'x') ? prof.length - 1 : 0;
    if (o.cap !== false) stroke(ctx, rings3[capIdx].map((p) => P(...p)), 1.1, true);
    // heavy shade line on lower-right silhouette
    stroke(ctx, sil, 1.25, true);
    const heavy = sil.filter((p) => true);
    return sil;
  }

  function box(ctx, P, x0, x1, y0, y1, z0, z1, o = {}) {
    const q = (pts) => pts.map((p) => P(...p));
    const sil = q([[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y1, z1]]);
    erase(ctx, sil);
    const right = q([[x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [x1, y0, z0]]);
    if (o.shadeRight) hatch(ctx, right, Math.PI / 2, o.shadeRight, 0.75);
    stroke(ctx, sil, 1.25, true);
    stroke(ctx, q([[x0, y1, z1], [x1, y1, z1], [x1, y0, z1]]), 1.15);
    stroke(ctx, q([[x1, y1, z1], [x1, y1, z0]]), 1.15);
    // shade lines: heavier lower-right edges
    stroke(ctx, q([[x1, y0, z1], [x1, y0, z0], [x1, y1, z0]]), 2.4);
    stroke(ctx, q([[x1, y1, z0], [x0, y1, z0]]), 1.9);
    return { sil, right, front: q([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]]), top: q([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]) };
  }

  function catmull(pts, n = 8) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push(p1.map((_, j) => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  function leader(ctx, txt, tx, ty, px, py, bend = 0.18, r) {
    if (!ok()) return;
    const mx = (tx + px) / 2, my = (ty + py) / 2, dx = px - tx, dy = py - ty;
    const cx = mx - dy * bend, cy = my + dx * bend;
    const ang = Math.atan2(ty - py, tx - px);
    const sx = tx - Math.cos(ang) * 0, sy = ty - Math.sin(ang) * 0;
    ctx.beginPath(); ctx.moveTo(sx + Math.cos(Math.atan2(cy - ty, cx - tx)) * 13, sy + Math.sin(Math.atan2(cy - ty, cx - tx)) * 11);
    ctx.quadraticCurveTo(cx, cy, px, py); ctx.lineWidth = 0.9; ctx.stroke();
    ctx.font = '400 17px "Libre Baskerville"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(txt, tx, ty + 1);
  }

  // signature-like cursive scrawl
  function scrawl(ctx, x, y, w, seed, h = 16) {
    const r = H.rng(seed); ctx.beginPath();
    let px = x, py = y; ctx.moveTo(px, py);
    const n = Math.floor(w / 9);
    for (let i = 0; i < n; i++) {
      const up = r.range(0.4, 1.0) * h * (r.chance(0.18) ? 1.7 : 1);
      const nx = x + (i + 1) * (w / n);
      ctx.bezierCurveTo(px + 4, py - up, nx - 6 + r.range(-3, 3), py - up * 0.9, nx - 2, y + r.range(-2, 3));
      if (r.chance(0.2)) ctx.bezierCurveTo(nx, y + h * 0.7, nx - 7, y + h * 0.7, nx - 3, y);
      px = nx; py = y;
    }
    ctx.stroke();
  }

  // laid/wove paper base, cached per size. H.paper's 4px cells carry a vertical fibre streak that read as a stretched
  // texture (worse under the explainer's 1.3x zoom): soften it ~30% with a light blur, keep the broad mottling.
  const PAPERS = {};
  function paperBase(w, h) {
    const key = w + 'x' + h; if (PAPERS[key]) return PAPERS[key];
    const T = H.layer(w, h), tc = T.getContext('2d'); H.paper(tc, w, h, '#ece0c0', 11, 0.045);
    const L = H.layer(w, h), c = L.getContext('2d');
    c.fillStyle = '#ece0c0'; c.fillRect(0, 0, w, h);
    c.filter = 'blur(2.6px)'; c.drawImage(T, 0, 0); c.filter = 'none';
    c.globalAlpha = 0.28; c.drawImage(T, 0, 0); c.globalAlpha = 1; // a little of the crisp tooth back
    PAPERS[key] = L; return L;
  }
  // ===== EXPLAINER HELPERS =====
  const PXW = 3840;
  let PAPERW = null, INKV = null;
  function paperWide(W, H_) {
    if (PAPERW) return PAPERW;
    const L = H.layer(PXW, H_), c = L.getContext('2d'), r = H.rng(1931);
    c.drawImage(paperBase(PXW, H_), 0, 0);
    const g = c.createLinearGradient(0, 0, 0, H_); g.addColorStop(0, 'rgba(150,100,35,0.22)'); g.addColorStop(0.3, 'rgba(150,100,35,0)'); g.addColorStop(0.7, 'rgba(150,100,35,0)'); g.addColorStop(1, 'rgba(150,100,35,0.25)');
    c.fillStyle = g; c.fillRect(0, 0, PXW, H_);
    for (let i = 0; i < 200; i++) {
      const x = r() * PXW, y = r.chance(0.6) ? (r.chance(0.5) ? r() * 110 : H_ - r() * 110) : r() * H_, rad = r.range(1.5, r.chance(0.15) ? 13 : 5);
      const fg = c.createRadialGradient(x, y, 0, x, y, rad); fg.addColorStop(0, `rgba(150,95,40,${r.range(0.18, 0.4)})`); fg.addColorStop(1, 'rgba(160,110,50,0)');
      c.fillStyle = fg; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill();
    }
    c.strokeStyle = 'rgba(120,90,40,0.16)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 361); c.lineTo(PXW, 357); c.stroke();
    [1280, 2560].forEach((x) => { c.strokeStyle = 'rgba(120,90,40,0.13)'; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 3, H_); c.stroke(); c.strokeStyle = 'rgba(255,250,230,0.3)'; c.beginPath(); c.moveTo(x + 2, 0); c.lineTo(x + 5, H_); c.stroke(); });
    PAPERW = L; return L;
  }
  const circ = (cx, cy, rx, ry = rx, n = 40, a0 = 0, a1 = Math.PI * 2) => { const o = []; for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  function partial(pts, p) { if (p >= 1) return pts; const n = Math.max(2, Math.round(pts.length * p)); return pts.slice(0, n); }
  function arrowP(c, pts, p, w = 1.3, dash) {
    if (p <= 0) return;
    stroke(c, partial(pts, p), w, false, dash);
    if (p >= 1 && ok()) { const a = pts[pts.length - 1], b = pts[pts.length - 2], an = Math.atan2(a[1] - b[1], a[0] - b[0]); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(a[0] - Math.cos(an - 0.28) * 15, a[1] - Math.sin(an - 0.28) * 15); c.lineTo(a[0] - Math.cos(an + 0.28) * 15, a[1] - Math.sin(an + 0.28) * 15); c.closePath(); c.fill(); }
  }
  const qp = (a, m, b, n = 30) => { const o = []; for (let k = 0; k <= n; k++) { const t = k / n, u = 1 - t; o.push([u * u * a[0] + 2 * u * t * m[0] + t * t * b[0], u * u * a[1] + 2 * u * t * m[1] + t * t * b[1]]); } return o; };
  function catLine(c, x, y, s) {
    stroke(c, circ(x, y, 20 * s, 17 * s), 1.2, true);
    stroke(c, [[x - 17 * s, y - 8 * s], [x - 14 * s, y - 28 * s], [x - 4 * s, y - 16 * s]], 1.2);
    stroke(c, [[x + 17 * s, y - 8 * s], [x + 14 * s, y - 28 * s], [x + 4 * s, y - 16 * s]], 1.2);
    stroke(c, circ(x - 7 * s, y - 3 * s, 2.4 * s), 1, true); stroke(c, circ(x + 7 * s, y - 3 * s, 2.4 * s), 1, true);
    [[-1, 5, 3], [1, 5, 3], [-1, 9, 11], [1, 9, 11]].forEach(([sg, dy, ey]) => stroke(c, [[x + sg * 6 * s, y + dy * s], [x + sg * 27 * s, y + ey * s]], 0.8));
    stroke(c, [[x - 3 * s, y + 4 * s], [x, y + 7 * s], [x + 3 * s, y + 4 * s]], 1);
  }
  function dogLine(c, x, y, s) {
    stroke(c, circ(x, y, 19 * s, 18 * s), 1.2, true);
    [-1, 1].forEach((sg) => { const ear = circ(x + sg * 20 * s, y, 7 * s, 15 * s); stroke(c, ear, 1.2, true); hatch(c, ear, Math.PI / 2, 2.2, 0.6); });
    stroke(c, circ(x, y + 8 * s, 9 * s, 6 * s), 1, true);
    if (ok()) { c.beginPath(); c.ellipse(x, y + 5 * s, 3.5 * s, 2.5 * s, 0, 0, 7); c.fill(); }
    stroke(c, circ(x - 7 * s, y - 5 * s, 2.2 * s), 1, true); stroke(c, circ(x + 7 * s, y - 5 * s, 2.2 * s), 1, true);
  }
  // punched example card with a drawing and its typed label
  function exCard(c, x, y, rot, isCat, lbl) {
    c.save(); c.translate(x, y); c.rotate(rot);
    const pts = [[-62, -38], [62, -38], [62, 38], [-62, 38]];
    erase(c, pts); stroke(c, pts, 1.2, true); if (drew()) free(() => stroke(c, [[63.4, -36.5], [63.4, 39.4], [-60.5, 39.4]], 1.3)); stroke(c, [[-62, -26], [-50, -38]], 0.8);
    (isCat ? catLine : dogLine)(c, -26, 2, 0.95);
    if (ok()) { c.font = '400 17px "Courier Prime"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(lbl || (isCat ? 'cat' : 'dog'), 30, 0); }
    stroke(c, [[10, 12], [50, 12]], 0.7);
    for (let k = 0; k < 6; k++) if (ok()) { c.beginPath(); c.rect(14 + k * 7, 24, 3, 6); c.fill(); }
    c.restore();
  }
  // odometer: row of digit drums
  function odo(c, x, y, str, roll = 0, rollFrom = 0) {
    let cx = x, di = -1;
    for (const ch of str) {
      if (ch === ',' || ch === '%') { if (ok()) { c.font = '700 26px "Libre Baskerville"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, cx + 7, y + (ch === ',' ? 14 : 2)); } cx += ch === ',' ? 14 : 30; continue; }
      di++; const rl = di >= rollFrom ? roll : 0;
      const b = [[cx, y - 22], [cx + 28, y - 22], [cx + 28, y + 22], [cx, y + 22]];
      erase(c, b); stroke(c, b, 1.2, true); if (drew()) free(() => stroke(c, [[cx + 29.3, y - 21], [cx + 29.3, y + 23.3], [cx + 1, y + 23.3]], 1.1));
      hatch(c, [[cx, y - 22], [cx + 28, y - 22], [cx + 28, y - 14], [cx, y - 14]], 0, 2, 0.5); hatch(c, [[cx, y + 14], [cx + 28, y + 14], [cx + 28, y + 22], [cx, y + 22]], 0, 2, 0.5);
      if (ok()) { c.save(); c.beginPath(); c.rect(cx, y - 14, 28, 28); c.clip(); c.font = '700 24px "Libre Baskerville"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, cx + 14, y + 1 - rl * 28); if (rl) c.fillText(String((+ch + 1) % 10), cx + 14, y + 29 - rl * 28); c.restore(); }
      cx += 32;
    }
    return cx;
  }
  function labelL(c, txt, tx, ty, px, py, bend = 0.15, p = 1, size = 28) {
    if (p <= 0 || !ok()) return;
    const mx = (tx + px) / 2, my = (ty + py) / 2, dx = px - tx, dy = py - ty, cx = mx - dy * bend, cy = my + dx * bend;
    const above = txt && py < ty - size * 0.5;
    const L = qp([tx + Math.sign(dx) * 6, above ? ty - size * 0.95 : ty + 10], [cx, cy], [px, py], 20);
    stroke(c, partial(L, H.clamp(p * 1.4)), 0.9);
    c.font = `italic 400 ${size}px "Libre Baskerville"`; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(txt, tx, ty);
  }
  function redPencil(ctx, pts, p, seed) {
    if (p <= 0) return; const r = H.rng(seed); const P = partial(pts, p);
    ctx.save(); ctx.strokeStyle = 'rgba(178,52,40,0.85)'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    [2.6, 1.2].forEach((w, k) => { ctx.lineWidth = w; ctx.beginPath(); P.forEach((q, i) => { const x = q[0] + r.range(-0.7, 0.7) + k * 1.2, y = q[1] + r.range(-0.7, 0.7) + k * 0.8; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); });
    ctx.restore();
  }

  // ===== END EXPLAINER HELPERS =====
  registerStyle({
    id: 'patent-drawing',
    name: 'Patent Drawing',
    category: 'Illustration',
    description: 'A 1930s US patent sheet: ruling-pen black ink line art with shade lines, parallel-line and stipple shading, section hatching, reference numerals on curved leaders, typeset header and inked signatures on yellowed paper.',
    motion: 'Lines are inked one stroke at a time like a draughtsman at work — outlines first, then hatching, then numerals — while the FIG. 3 gear train slowly turns.',
    fonts: ['400 17px "Libre Baskerville"', '700 26px "Libre Baskerville"', 'italic 400 15px "Libre Baskerville"', 'italic 400 34px "Cormorant Garamond"', '600 15px "Cormorant Garamond"'],
    frameT: 6.4,
    duration: 6.5,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      used = 0; budget = t >= 5 ? Infinity : Math.floor(Math.max(0, t - 0.25) * 158);
      const r = H.rng(1931);
      // slow documentary push-in toward FIG. 1
      const zm = 1 + 0.018 * H.ease.inOut(H.clamp(t / 6.5));
      ctx.translate(640, 360); ctx.scale(zm, zm); ctx.translate(-640, -360);
      // ---------- paper ----------
      ctx.drawImage(paperBase(W, H_), 0, 0);
      const nz = H.makeNoise(77);
      // age toning at edges
      const g = ctx.createRadialGradient(W / 2, H_ / 2, 260, W / 2, H_ / 2, 820);
      g.addColorStop(0, 'rgba(160,120,50,0)'); g.addColorStop(1, 'rgba(150,100,35,0.38)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H_);
      // tide stain bottom-left
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      for (let i = 0; i < 3; i++) {
        const sg = ctx.createRadialGradient(40, 700, 10, 40, 700, 260 - i * 50);
        sg.addColorStop(0, 'rgba(190,150,80,0.10)'); sg.addColorStop(0.92, 'rgba(180,135,60,0.12)'); sg.addColorStop(1, 'rgba(180,135,60,0)');
        ctx.fillStyle = sg; ctx.fillRect(0, 380, 320, 340);
      }
      // foxing spots
      for (let i = 0; i < 70; i++) {
        let x = r() * W, y = r() * H_;
        if (r.chance(0.6)) { if (r.chance(0.5)) x = r.chance(0.5) ? r() * 160 : W - r() * 160; else y = r.chance(0.5) ? r() * 110 : H_ - r() * 110; }
        const rad = r.range(1.5, r.chance(0.15) ? 14 : 5);
        const fg = ctx.createRadialGradient(x, y, 0, x, y, rad);
        fg.addColorStop(0, `rgba(150,95,40,${r.range(0.18, 0.4)})`); fg.addColorStop(0.6, 'rgba(160,110,50,0.12)'); fg.addColorStop(1, 'rgba(160,110,50,0)');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill();
      }
      ctx.restore();
      // fold crease
      ctx.save();
      ctx.strokeStyle = 'rgba(120,90,40,0.16)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, 361); ctx.lineTo(W, 357); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,250,230,0.35)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, 363.5); ctx.lineTo(W, 359.5); ctx.stroke();
      ctx.restore();

      // ---------- ink layer ----------
      const L = H.layer(W, H_), c = L.getContext('2d');
      c.strokeStyle = '#000'; c.fillStyle = '#000'; c.lineCap = 'round'; c.lineJoin = 'round';

      // border + header
      stroke(c, [[18, 18], [W - 18, 18], [W - 18, H_ - 18], [18, H_ - 18]], 1.6, true);
      stroke(c, [[23, 23], [W - 23, 23], [W - 23, H_ - 23], [23, H_ - 23]], 0.7, true);
      c.textBaseline = 'alphabetic';
      if (ok()) {
        c.font = '400 15px "Libre Baskerville"';
        c.textAlign = 'left'; c.fillText('Dec. 5, 1933.', 48, 52);
        c.textAlign = 'right'; c.fillText('Patent No. 1,938,412', W - 48, 52);
        c.textAlign = 'center';
        c.font = '400 15px "Libre Baskerville"'; c.fillText('E.  M.  HOLLOWAY', W / 2, 52);
        c.font = '700 19px "Libre Baskerville"';
        const title = 'THINKING  MACHINE'; c.fillText(title.split('').join(String.fromCharCode(8202)), W / 2, 78);
        c.font = 'italic 400 13px "Libre Baskerville"'; c.fillText('Filed Aug. 2, 1931', W / 2, 98);
        c.textAlign = 'right'; c.font = '400 13px "Libre Baskerville"'; c.fillText('2 Sheets-Sheet 1', W - 48, 78);
      }

      // ================= FIG. 1 : the machine (isometric) =================
      const s = 1.16, ox = 322, oy = 338, cs = Math.cos(Math.PI / 6), sn = 0.5;
      const P = (x, y, z) => [ox + (x - y) * cs * s, oy + (x + y) * sn * s - z * s];
      const q = (pts) => pts.map((p) => P(...p));
      const X1 = 230, Y1 = 130, Z1 = 150;

      // plinth
      box(c, P, -12, X1 + 12, -12, Y1 + 12, -20, 0, { shadeRight: 3.2 });
      // plinth front moulding line
      stroke(c, q([[-12, Y1 + 12, -6], [X1 + 12, Y1 + 12, -6], [X1 + 12, -12, -6]]), 0.8);
      // cabinet
      const cab = box(c, P, 0, X1, 0, Y1, 0, Z1, { shadeRight: 4.2 });
      // top lid lip
      stroke(c, q([[0, Y1, Z1 - 7], [X1, Y1, Z1 - 7], [X1, 0, Z1 - 7]]), 0.9);

      // --- front panel (y = Y1) ---
      const FY = Y1;
      stroke(c, q([[14, FY, 16], [X1 - 14, FY, 16], [X1 - 14, FY, 132], [14, FY, 132]]), 1.0, true);
      stroke(c, q([[19, FY, 21], [X1 - 19, FY, 21], [X1 - 19, FY, 127], [19, FY, 127]]), 0.7, true);
      // panel bevel shading (lower and right inner strip)
      hatch(c, q([[14, FY, 16], [X1 - 14, FY, 16], [X1 - 19, FY, 21], [19, FY, 21]]), Math.PI / 2, 2.2, 0.6);
      // dials
      const dials = [[58, 102], [115, 102], [172, 102]];
      dials.forEach(([dx, dz], i) => {
        const rim = q(ring([dx, FY + 3, dz], 'y', 19, 60));
        erase(c, rim);
        lathe(c, P, [dx, FY, dz], 'y', [[20, 0], [20, 3], [17, 3.5]], { cap: true, dens: 26 });
        stroke(c, q(ring([dx, FY + 3.6, dz], 'y', 14.5, 60)), 0.7, true);
        // ticks
        c.beginPath();
        for (let k = 0; k <= 10; k++) {
          const a = Math.PI * (1.15 + 0.07 * k * 1.0) + Math.PI * 0.02;
          const aa = Math.PI * 0.85 + k * (Math.PI * 1.3 / 10);
          const p1 = P(dx + Math.cos(aa) * 13.5, FY + 3.6, dz - Math.sin(aa) * 13.5), p2 = P(dx + Math.cos(aa) * (k % 5 ? 11.5 : 10), FY + 3.6, dz - Math.sin(aa) * (k % 5 ? 11.5 : 10));
          c.moveTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]);
        }
        if (ok()) { c.lineWidth = 0.7; c.stroke(); }
        const na = Math.PI * 0.85 + (0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 2))) * Math.PI * 1.3;
        stroke(c, [P(dx, FY + 3.8, dz), P(dx + Math.cos(na) * 12, FY + 3.8, dz - Math.sin(na) * 12)], 1.4);
        const hp = P(dx, FY + 3.8, dz); if (ok()) { c.beginPath(); c.arc(hp[0], hp[1], 2, 0, 7); c.fill(); }
      });
      // keys row
      for (let k = 0; k < 8; k++) {
        const kx = 34 + k * 23;
        lathe(c, P, [kx, FY, 66], 'y', [[6.2, 0], [6.2, 7], [7.4, 7.5], [7.4, 10]], { dens: 30 });
      }
      // tape slot
      stroke(c, q([[78, FY, 28], [152, FY, 28], [152, FY, 36], [78, FY, 36]]), 1.1, true);
      if (ok()) { path(c, q([[80, FY, 30], [150, FY, 30], [150, FY, 34], [80, FY, 34]]), true); c.fill(); }
      // screws in corners
      [[10, 8], [X1 - 10, 8], [10, Z1 - 16], [X1 - 10, Z1 - 16]].forEach(([sx, sz]) => {
        const sc = q(ring([sx, FY, sz], 'y', 3, 20)); stroke(c, sc, 0.8, true);
        stroke(c, [P(sx - 2, FY, sz - 1), P(sx + 2, FY, sz + 1)], 0.8);
      });

      // --- right face (x = X1): louvres + crank ---
      for (let k = 0; k < 6; k++) {
        const z = 18 + k * 7.5;
        const sl = q([[X1, 18, z], [X1, 62, z], [X1, 62, z + 3.6], [X1, 18, z + 3.6]]);
        erase(c, sl); if (ok()) { path(c, sl, true); c.fill(); }
      }
      // hidden shaft (dashed)
      stroke(c, [P(X1, 92, 92), P(X1 - 120, 92, 92)], 0.8, false, [6, 4]);
      lathe(c, P, [X1, 92, 92], 'x', [[17, 0], [17, 6], [11, 6], [11, 12]], { dens: 24 });
      // crank arm
      const ca0 = P(X1 + 12, 92, 92);
      const ang = -2.3 + t * 0.6;
      const ce = [X1 + 14, 92 + Math.cos(ang) * 34, 92 + Math.sin(ang) * 34];
      const pa = P(X1 + 12, 92, 92), pb = P(...ce);
      {
        const dx = pb[0] - pa[0], dy = pb[1] - pa[1], m = Math.hypot(dx, dy), nx = -dy / m * 5, ny = dx / m * 5;
        const arm = [[pa[0] + nx, pa[1] + ny], [pb[0] + nx * 0.7, pb[1] + ny * 0.7], [pb[0] - nx * 0.7, pb[1] - ny * 0.7], [pa[0] - nx, pa[1] - ny]];
        erase(c, arm); stroke(c, arm, 1.2, true);
        hatch(c, arm, Math.atan2(dy, dx), 2.2, 0.6);
      }
      lathe(c, P, [X1 + 14, ce[1], ce[2]], 'x', [[4.5, 0], [4.5, 4], [3.6, 4], [3.6, 26], [4.2, 27], [2, 30]], { dens: 40 });

      // --- top: tubes + dome ---
      const tube = (tx, ty) => {
        lathe(c, P, [tx, ty, Z1], 'z', [[12, 0], [12, 9], [9, 9]], { dens: 30 });
        const prof = [[8.5, 9], [9, 14], [9, 40]];
        for (let a = 0.2; a <= Math.PI / 2; a += 0.2) prof.push([9 * Math.cos(a), 40 + 9 * Math.sin(a)]);
        prof.push([0.01, 49]);
        lathe(c, P, [tx, ty, Z1], 'z', prof, { rims: [], cap: false, dens: 18 });
        // inner plate (seen through glass)
        stroke(c, q([[tx - 4, ty + 4, Z1 + 18], [tx - 4, ty + 4, Z1 + 36]]), 0.7);
        stroke(c, q([[tx + 4, ty - 4, Z1 + 18], [tx + 4, ty - 4, Z1 + 36]]), 0.7);
        stroke(c, q([[tx - 4, ty + 4, Z1 + 36], [tx + 4, ty - 4, Z1 + 36]]), 0.7);
        stroke(c, q([[tx, ty, Z1 + 36], [tx, ty, Z1 + 47]]), 0.6);
        // glass glint
        const g1 = P(tx - 5, ty + 6, Z1 + 38), g2 = P(tx - 5, ty + 6, Z1 + 22);
        stroke(c, [[g1[0] - 1, g1[1]], [g2[0] - 1, g2[1]]], 0.6);
      };
      tube(30, 22); tube(205, 26);

      // dome base
      const DC = [115, 65, Z1];
      lathe(c, P, DC, 'z', [[60, 0], [60, 10], [56, 10], [56, 16], [52, 16]], { dens: 30 });
      // glass dome (hemisphere)
      const prof = [];
      const JH = 38; prof.push([52, 16]);
      for (let a = 0; a <= Math.PI / 2 + 0.001; a += Math.PI / 24) prof.push([52 * Math.cos(a) + 0.01, 16 + JH + 52 * Math.sin(a)]);
      const dome = (() => {
        const all = [];
        prof.forEach(([rr, h]) => ring([DC[0], DC[1], Z1 + h], 'z', rr, 72).forEach((p) => all.push(P(...p))));
        return hull(all);
      })();
      erase(c, dome);
      // brain inside dome (side view)
      const bc = P(115, 65, Z1 + 62);
      const brx = 50 * s, bry = 33 * s;
      const brain = [];
      for (let k = 0; k < 120; k++) {
        const a = k / 120 * Math.PI * 2;
        let x = Math.cos(a), y = Math.sin(a);
        if (y > 0) y *= 0.78 - 0.18 * Math.max(0, -x) ; // flatter base, frontal tuck
        if (x > 0.2 && y > 0) y *= 0.92;
        if (y < 0) y *= 1 + 0.08 * Math.cos(a * 2 + 0.6);
        const w = 1 + 0.025 * Math.sin(a * 11) + 0.015 * Math.sin(a * 23 + 1);
        brain.push([bc[0] + x * brx * w, bc[1] + y * bry * w]);
      }
      // cerebellum (back-bottom) + stem
      const cbc = [bc[0] + brx * 0.48, bc[1] + bry * 0.62];
      const cereb = ring([cbc[0], cbc[1], 0], 'z', 1, 50).map((p3) => [cbc[0] + (p3[0] - cbc[0]) * 22 * s * 0.9, cbc[1] + (p3[1] - cbc[1]) * 12 * s * 0.9]);
      const stemTop = [bc[0] + brx * 0.18, bc[1] + bry * 0.5], stemBot = [bc[0] + brx * 0.22, P(115, 65, Z1 + 16)[1] + 4];
      // electrode stalks
      [[-0.5, 8], [0.62, 10]].forEach(([ex, ey]) => {
        const top = [bc[0] + ex * brx, bc[1] + bry * 0.55], bot = [bc[0] + ex * brx * 1.2, P(115, 65, Z1 + 16)[1] + ey];
        stroke(c, [top, bot], 1.4);
        c.beginPath(); for (let k = 0; k < 6; k++) { const yy = H.lerp(top[1] + 8, bot[1] - 5, k / 6); const xx = H.lerp(top[0], bot[0], k / 6); c.moveTo(xx - 4, yy); c.lineTo(xx + 4, yy + 2.5); }
        if (ok()) { c.lineWidth = 0.8; c.stroke(); }
      });
      {
        const st = [[stemTop[0] - 7, stemTop[1]], [stemTop[0] + 7, stemTop[1]], [stemBot[0] + 6, stemBot[1]], [stemBot[0] - 6, stemBot[1]]];
        erase(c, st); stroke(c, [st[0], st[3]], 1.2); stroke(c, [st[1], st[2]], 1.6);
        hatch(c, st, Math.PI / 2 + 0.05, 2.0, 0.55);
      }
      erase(c, cereb);
      if (ok()) {
        c.save(); path(c, cereb, true); c.clip(); c.beginPath();
        for (let k = -6; k <= 6; k++) { const yy = cbc[1] + k * 2.3; c.moveTo(cbc[0] - 30, yy + 4); c.quadraticCurveTo(cbc[0], yy - 3, cbc[0] + 30, yy + 2); }
        c.lineWidth = 0.6; c.stroke(); c.restore();
      }
      stroke(c, cereb, 1.2, true);
      erase(c, brain);
      // gyri: contour lines of a domain-warped stripe field
      if (ok()) {
        c.save(); path(c, brain, true); c.clip();
        const bn = H.makeNoise(5);
        const f = (x, y) => {
          const u = (x - bc[0]) / brx, v = (y - bc[1]) / bry;
          const rr = Math.hypot(u * 1.0, v * 1.25);
          const wx = 6 * bn.fbm2(x * 0.03, y * 0.03, 2), wy = 6 * bn.fbm2(x * 0.03 + 7, y * 0.03 + 3, 2);
          return bn.n2((x + wx) * 0.105, (y + wy) * 0.15) + 0.12 * Math.sin(u * 3);
        };
        contours(c, bc[0] - brx - 4, bc[1] - bry - 6, brx * 2 + 8, bry * 2 + 10, 1.8, f, 0.04);
        c.lineWidth = 1.15; c.stroke();
        contours(c, bc[0] - brx - 4, bc[1] - bry - 6, brx * 2 + 8, bry * 2 + 10, 1.8, f, -0.2);
        c.lineWidth = 0.6; c.stroke();
        // lateral (Sylvian) fissure + central sulcus
        c.beginPath(); c.moveTo(bc[0] - brx * 0.55, bc[1] + bry * 0.32); c.bezierCurveTo(bc[0] - brx * 0.2, bc[1] + bry * 0.05, bc[0] + brx * 0.1, bc[1] - bry * 0.02, bc[0] + brx * 0.38, bc[1] - bry * 0.12);
        c.moveTo(bc[0] - brx * 0.02, bc[1] - bry * 0.98); c.bezierCurveTo(bc[0] + brx * 0.06, bc[1] - bry * 0.5, bc[0] - brx * 0.08, bc[1] - bry * 0.3, bc[0] + brx * 0.02, bc[1] + bry * 0.05);
        c.lineWidth = 1.7; c.stroke();
        c.restore();
        stipple(c, brain, 2200, (x, y) => { const u = (x - bc[0]) / brx, v = (y - bc[1]) / bry; return H.clamp((Math.hypot(u, v) - 0.55) * 1.6) * H.clamp(0.25 + 0.6 * (u * 0.4 + v)) * 0.9; }, H.rng(9), 0.7);
      }
      stroke(c, brain, 1.5, true);
      // dome outline + glass glints
      stroke(c, dome, 1.35, true);
      {
        // glass glints: vertical strokes on the jar's left wall + arcs on the crown
        const glL = (h0, h1, aa) => { const p0 = P(115 + Math.cos(aa) * 50, 65 + Math.sin(aa) * 50, Z1 + h0), p1 = P(115 + Math.cos(aa) * 50, 65 + Math.sin(aa) * 50, Z1 + h1); return [p0, p1]; };
        [[2.2, 24, 70], [2.32, 28, 64], [2.44, 34, 60]].forEach(([aa, h0, h1]) => stroke(c, glL(h0, h1, aa), 0.8));
        const cc0 = P(115, 65, Z1 + 16 + JH);
        c.beginPath();
        for (let k = 0; k < 3; k++) { const rr = 50 * s * 1.06 - k * 5; c.moveTo(cc0[0] + Math.cos(Math.PI * 1.18) * rr, cc0[1] + Math.sin(Math.PI * 1.18) * rr); c.arc(cc0[0], cc0[1], rr, Math.PI * 1.18, Math.PI * (1.42 - k * 0.04)); }
        if (ok()) { c.lineWidth = 0.8; c.stroke(); }
        // glass edge stipple on the shadow side
        stipple(c, dome, 1800, (x, y) => H.clamp((x - (cc0[0] + 30)) / 40) * 0.35, H.rng(4), 0.6);
        // hidden far rim of base seen through glass (dashed)
        const far = []; for (let k = 0; k <= 36; k++) { const a = Math.PI * 0.75 + k / 36 * Math.PI; far.push(P(115 + Math.cos(a) * 52, 65 + Math.sin(a) * 52, Z1 + 16)); }
        stroke(c, far, 0.6, false, [4, 3]);
      }
      // top knob on dome
      lathe(c, P, [115, 65, Z1 + 16 + JH + 51], 'z', [[6, 0], [6, 5], [2.5, 5], [2.5, 11], [5, 12], [0.1, 16]], { dens: 30 });

      // cable from dome base to right tube
      {
        const p0 = P(160, 70, Z1 + 6), p1 = P(205, 38, Z1 + 4);
        c.beginPath(); c.moveTo(p0[0], p0[1]); c.bezierCurveTo(p0[0] + 30, p0[1] + 6, p1[0] - 10, p1[1] + 22, p1[0] - 2, p1[1] + 6);
        if (ok()) { c.lineWidth = 3.4; c.stroke(); c.save(); c.globalCompositeOperation = 'destination-out'; c.lineWidth = 1.4; c.stroke(); c.restore(); }
      }

      // --- punched tape ---
      {
        const cl = catmull([[130, 32], [160, 31.5], [186, 24], [204, 6], [214, -10], [226, -20], [258, -20], [282, -17], [292, -6], [286, 4], [272, 0], [272, -12]], 10);
        const xa = 88, xb = 142;
        for (let i = 0; i < cl.length - 1; i++) {
          const [y0, z0] = cl[i], [y1, z1] = cl[i + 1];
          const quad = q([[xa, y0, z0], [xb, y0, z0], [xb, y1, z1], [xa, y1, z1]]);
          const cr = (quad[1][0] - quad[0][0]) * (quad[3][1] - quad[0][1]) - (quad[1][1] - quad[0][1]) * (quad[3][0] - quad[0][0]);
          erase(c, quad.map((p, j) => [p[0] + (j < 2 ? -0.3 : 0.3), p[1]]));
          if (cr < 0) hatch(c, quad, 0.52, 2.2, 0.55); // underside
          else if (i % 2 === 0) {
            // punched holes: 5 lanes
            const tr = H.rng(100 + i);
            c.beginPath();
            for (let ln = 0; ln < 6; ln++) {
              if (ln === 2) { const pp = P(H.lerp(xa, xb, 0.42), (y0 + y1) / 2, (z0 + z1) / 2); c.moveTo(pp[0] + 0.9, pp[1]); c.arc(pp[0], pp[1], 0.9, 0, 7); continue; }
              if (tr.chance(0.5)) { const pp = P(H.lerp(xa + 6, xb - 6, ln / 5), (y0 + y1) / 2, (z0 + z1) / 2); c.moveTo(pp[0] + 2, pp[1]); c.ellipse(pp[0], pp[1], 2.1, 1.6, 0, 0, 7); }
            }
            if (ok()) c.fill();
          }
          stroke(c, [quad[0], quad[3]], 1.1); stroke(c, [quad[1], quad[2]], 1.1);
          if (i === cl.length - 2) stroke(c, [quad[2], quad[3]], 1.1);
        }
      }

      // ---- FIG.1 numerals ----
      c.fillStyle = '#000';
      const L1 = [
        ['10', P(8, Y1, 140), -62, -18, 0.15],
        ['12', P(70, 40, Z1 + 60), -82, -20, -0.15],
        ['14', [0, 0], 0, 0, 0],
        ['16', P(58, Y1 + 3, 118), -84, -6, 0.18],
        ['18', P(34, Y1 + 10, 60), -66, 26, -0.15],
        ['20', P(128, 262, -20), 66, 52, 0.15],
        ['22', P(X1 + 26, ce[1], ce[2]), 66, -30, 0.2],
        ['24', P(212, 30, Z1 + 40), 60, -42, 0.2],
        ['26', P(X1, 40, 22), 78, 44, 0.2],
        ['28', P(X1 + 12, 70, -16), 56, 60, -0.18],
      ];
      L1[2] = ['14', [bc[0] - brx * 0.35, bc[1] - bry * 0.55], -58, -92, 0.12];
      L1.forEach(([n, p, dx, dy, b]) => leader(c, n, p[0] + dx, p[1] + dy, p[0], p[1], b, r));
      // section line 2—2 through tube 24
      {
        const a = P(205, 26, Z1 + 25);
        stroke(c, [[a[0] - 30, a[1]], [a[0] - 14, a[1]]], 1.3); stroke(c, [[a[0] + 14, a[1]], [a[0] + 30, a[1]]], 1.3);
        if (ok()) {
          [[a[0] - 30, -1], [a[0] + 30, -1]].forEach(([x]) => { c.beginPath(); c.moveTo(x, a[1]); c.lineTo(x, a[1] - 9); c.stroke(); c.beginPath(); c.moveTo(x - 3, a[1] - 5); c.lineTo(x, a[1] - 10); c.lineTo(x + 3, a[1] - 5); c.fill(); });
          c.font = '400 13px "Libre Baskerville"'; c.textAlign = 'center'; c.fillText('2', a[0] - 30, a[1] + 13); c.fillText('2', a[0] + 30, a[1] + 13);
        }
      }
      if (ok()) { c.font = '700 26px "Libre Baskerville"'; c.textAlign = 'left'; c.fillText('FIG. 1.', 470, 668); }

      // ================= FIG. 2 : section of cerebral valve =================
      const cx = 872, sy = 1.0;
      const env = (y) => { // outer half width
        if (y >= 440) return 50; if (y >= 405) return H.lerp(50, 62, (440 - y) / 35);
        if (y >= 262) return 62; const u = (262 - y) / 104; return 62 * SQ(Math.max(0, 1 - u * u));
      };
      const outer = [], inner = [];
      for (let y = 440; y >= 158; y -= 3) outer.push([cx + env(y), y]);
      for (let y = 158; y <= 440; y += 3) outer.push([cx - env(y), y]);
      for (let y = 436; y >= 164; y -= 3) inner.push([cx + Math.max(0, env(y) - 4.5), y]);
      for (let y = 164; y <= 436; y += 3) inner.push([cx - Math.max(0, env(y) - 4.5), y]);
      // glass wall (section) — thin, lightly stippled
      stroke(c, outer, 1.4, true); stroke(c, inner, 0.9, true);
      // tip pip
      stroke(c, [[cx - 4, 160], [cx - 3, 148], [cx, 145], [cx + 3, 148], [cx + 4, 160]], 1.1);
      // base (bakelite) cross-hatched section
      const base = [[cx - 66, 440], [cx + 66, 440], [cx + 66, 486], [cx + 60, 494], [cx - 60, 494], [cx - 66, 486]];
      stroke(c, base, 1.4, true);
      hatch(c, base, Math.PI / 4, 6, 0.7); hatch(c, base, -Math.PI / 4, 6, 0.7);
      // pins
      [-38, -14, 14, 38].forEach((px, i) => {
        const pin = [[cx + px - 4.5, 494], [cx + px + 4.5, 494], [cx + px + 4.5, 528], [cx + px, 534], [cx + px - 4.5, 528]];
        erase(c, pin); stroke(c, pin, 1.2, true);
        hatch(c, pin, Math.PI / 4, 2.6, 0.6);
      });
      // stem press
      const press = [[cx - 30, 440], [cx + 30, 440], [cx + 16, 404], [cx + 16, 388], [cx - 16, 388], [cx - 16, 404]];
      stroke(c, press, 1.1, true);
      stipple(c, press, 900, () => 0.35, H.rng(21), 0.6);
      // lead wires
      [-38, -14, 14, 38].forEach((px, i) => {
        const tx2 = [-44, -28, 0, 44][i];
        stroke(c, [[cx + px, 494], [cx + px * 0.5, 440], [cx + tx2 * 0.25, 404], [cx + tx2, 378]], 0.9);
      });
      // micas
      [[222, 228], [372, 378]].forEach(([a, b]) => {
        const m = [[cx - 55, a], [cx + 55, a], [cx + 55, b], [cx - 55, b]];
        erase(c, m); stroke(c, m, 1.0, true);
        stipple(c, m, 500, () => 0.5, H.rng(a), 0.55);
      });
      // plate walls sectioned
      [[-48, -40], [40, 48]].forEach(([a, b]) => {
        const pl = [[cx + a, 236], [cx + b, 236], [cx + b, 364], [cx + a, 364]];
        stroke(c, pl, 1.3, true); hatch(c, pl, Math.PI / 4, 3.4, 0.7);
      });
      // plate top/bottom tabs
      stroke(c, [[cx - 44, 236], [cx - 44, 228]], 1); stroke(c, [[cx + 44, 236], [cx + 44, 228]], 1);
      stroke(c, [[cx - 44, 364], [cx - 44, 372]], 1); stroke(c, [[cx + 44, 364], [cx + 44, 372]], 1);
      // grid side rods + helix wire sections
      stroke(c, [[cx - 30, 222], [cx - 30, 378]], 0.9); stroke(c, [[cx + 30, 222], [cx + 30, 378]], 0.9);
      if (ok()) {
        c.beginPath();
        for (let y = 242; y <= 360; y += 7.5) { [cx - 26, cx + 26].forEach((x) => { c.moveTo(x + 2.2, y); c.arc(x, y, 2.2, 0, 7); }); }
        c.fill();
        // helix visible behind (thin diagonal)
        c.beginPath(); for (let y = 242; y <= 352; y += 7.5) { c.moveTo(cx - 24, y); c.lineTo(cx + 24, y + 3.7); }
        c.lineWidth = 0.4; c.setLineDash([2, 2.5]); c.stroke(); c.setLineDash([]);
      }
      // cathode
      [[-7, -3], [3, 7]].forEach(([a, b]) => { const k = [[cx + a, 230], [cx + b, 230], [cx + b, 370], [cx + a, 370]]; if (ok()) { path(c, k, true); c.fill(); } });
      stroke(c, (() => { const z = []; for (let y = 236; y <= 364; y += 8) { z.push([cx - 1.6, y]); z.push([cx + 1.6, y + 4]); } return z; })(), 0.7);
      // getter
      stroke(c, [[cx, 222], [cx, 204]], 0.9);
      const get = [[cx - 12, 196], [cx + 12, 196], [cx + 9, 204], [cx - 9, 204]]; stroke(c, get, 1.1, true); hatch(c, get, Math.PI / 4, 2.4, 0.6);
      // center line (dash-dot)
      stroke(c, [[cx, 128], [cx, 552]], 0.6, false, [16, 4, 2, 4]);
      // numerals
      [['30', cx + 112, 196, [cx + 47, 215], 0.15], ['32', cx + 112, 268, [cx + 45, 280], -0.1], ['34', cx - 112, 300, [cx - 27, 302], 0.12],
       ['36', cx - 112, 220, [cx - 5, 250], -0.15], ['38', cx + 112, 372, [cx + 52, 375], 0.1], ['40', cx + 112, 470, [cx + 54, 470], -0.12],
       ['42', cx - 96, 545, [cx - 38, 520], 0.15], ['44', cx - 82, 168, [cx - 10, 199], -0.12]]
        .forEach(([n, tx, ty, p, b]) => leader(c, n, tx, ty, p[0], p[1], b, r));
      if (ok()) { c.font = '700 26px "Libre Baskerville"'; c.textAlign = 'center'; c.fillText('FIG. 2.', cx, 590); }

      // ================= FIG. 3 : gear train =================
      const gear = (gx, gy, R, n, th, holes, spokes) => {
        const pts = [], p = Math.PI * 2 / n, Ro = R + 5.5, Rr = R - 6;
        for (let k = 0; k < n; k++) {
          const a = th + k * p;
          [[a - 0.27 * p, Rr], [a - 0.15 * p, Ro], [a + 0.15 * p, Ro], [a + 0.27 * p, Rr], [a + 0.5 * p, Rr]].forEach(([aa, rr]) => pts.push([gx + Math.cos(aa) * rr, gy + Math.sin(aa) * rr]));
        }
        erase(c, pts); stroke(c, pts, 1.3, true);
        // rim
        const rim = ring([gx, gy, 0], 'z', R - 14, 64).map((p3) => [p3[0], p3[1]]);
        stroke(c, rim, 1.0, true);
        // shading on rim (concentric lines lower-right)
        c.save(); path(c, pts, true); c.clip();
        c.beginPath(); for (let k = 1; k < 4; k++) { c.moveTo(gx + Math.cos(-0.3) * (R - 14 + k * 2.4), gy + Math.sin(-0.3) * (R - 14 + k * 2.4)); c.arc(gx, gy, R - 14 + k * 2.4, -0.3, 1.9); }
        if (ok()) { c.lineWidth = 0.6; c.stroke(); } c.restore();
        // hub
        stroke(c, ring([gx, gy, 0], 'z', 15, 40).map((p3) => [p3[0], p3[1]]), 1.1, true);
        const bore = ring([gx, gy, 0], 'z', 6.5, 30).map((p3) => [p3[0], p3[1]]);
        if (ok()) { path(c, bore, true); c.fill(); }
        // spokes / holes
        if (spokes) {
          for (let k = 0; k < spokes; k++) {
            const a = th * 1 + k * Math.PI * 2 / spokes, ca = Math.cos(a), sa = Math.sin(a), nx = -sa * 4.5, ny = ca * 4.5;
            const sp = [[gx + ca * 15 + nx, gy + sa * 15 + ny], [gx + ca * (R - 14) + nx, gy + sa * (R - 14) + ny], [gx + ca * (R - 14) - nx, gy + sa * (R - 14) - ny], [gx + ca * 15 - nx, gy + sa * 15 - ny]];
            stroke(c, [sp[0], sp[1]], 1.0); stroke(c, [sp[2], sp[3]], 1.6);
          }
          // fill openings between spokes with dark? keep open (paper)
        } else {
          for (let k = 0; k < holes; k++) {
            const a = th + k * Math.PI * 2 / holes + 0.4, hr = (R - 14 + 15) / 2;
            const hc = ring([gx + Math.cos(a) * hr, gy + Math.sin(a) * hr, 0], 'z', (R - 14 - 15) / 2 - 3, 28).map((p3) => [p3[0], p3[1]]);
            stroke(c, hc, 1.0, true);
            c.save(); path(c, hc, true); c.clip(); c.beginPath(); const hx = gx + Math.cos(a) * hr, hy = gy + Math.sin(a) * hr; c.arc(hx - 1.4, hy - 1.4, (R - 14 - 15) / 2 - 3, -2.2, -0.2); if (ok()) { c.lineWidth = 2.2; c.stroke(); } c.restore();
          }
        }
        // pitch circle dash-dot
        stroke(c, ring([gx, gy, 0], 'z', R, 90).map((p3) => [p3[0], p3[1]]), 0.5, true, [12, 3, 2, 3]);
        stroke(c, [[gx - R - 16, gy], [gx + R + 16, gy]], 0.5, false, [12, 3, 2, 3]);
        stroke(c, [[gx, gy - R - 16], [gx, gy + R + 16]], 0.5, false, [12, 3, 2, 3]);
      };
      const g1 = [1108, 228], R1 = 62, n1 = 24, R2 = 40, n2 = 16, al = 1.15;
      const g2 = [g1[0] + Math.cos(al) * (R1 + R2), g1[1] + Math.sin(al) * (R1 + R2)];
      const th1 = t * 0.35, th2 = al + Math.PI + Math.PI / n2 - (th1 - al) * n1 / n2;
      gear(g2[0], g2[1], R2, n2, th2, 4, 0);
      gear(g1[0], g1[1], R1, n1, th1, 0, 5);
      [['46', g1[0] - 98, g1[1] - 70, [g1[0] - 44, g1[1] - 44], 0.15], ['48', g2[0] + 74, g2[1] + 42, [g2[0] + 30, g2[1] + 22], -0.15], ['50', g1[0] + 94, g1[1] - 60, [g1[0] + 9, g1[1] - 9], 0.1]]
        .forEach(([n, tx, ty, p, b]) => leader(c, n, tx, ty, p[0], p[1], b, r));
      if (ok()) { c.font = '700 26px "Libre Baskerville"'; c.textAlign = 'center'; c.fillText('FIG. 3.', 1112, 428); }

      // ================= signatures =================
      if (ok()) {
        c.textAlign = 'left';
        c.font = '600 15px "Cormorant Garamond"'; c.fillText('INVENTOR.', 1012, 540);
        c.font = '600 15px "Cormorant Garamond"'; c.fillText('BY', 1012, 636);
        c.font = '600 15px "Cormorant Garamond"'; c.fillText('ATTORNEYS.', 1150, 664);
        // witnesses
        c.fillText('WITNESSES:', 54, 628);
      }

      // ---------- composite ink onto paper ----------
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.filter = 'blur(1.1px)'; ctx.globalAlpha = 0.28; ctx.drawImage(L, 0, 0);
      ctx.filter = 'none'; ctx.globalAlpha = 0.9; ctx.drawImage(L, 0, 0);
      ctx.restore();
      // re-tint ink to warm iron-black & add slight unevenness
      const img = ctx.getImageData(0, 0, W, H_), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
        if (lum < 150) {
          const p = i / 4, x = p % W, y = (p / W) | 0;
          const k = 1 - lum / 150;
          const v = 0.82 + 0.18 * (nz.n2(x * 0.03, y * 0.03) * 0.5 + 0.5);
          d[i] = H.lerp(d[i], 30, k * 0.4) + (1 - v) * 40 * k; d[i + 1] = H.lerp(d[i + 1], 24, k * 0.4) + (1 - v) * 34 * k; d[i + 2] = H.lerp(d[i + 2], 18, k * 0.4) + (1 - v) * 24 * k;
        }
      }
      ctx.putImageData(img, 0, 0);
      // hand-signed names in brown iron-gall ink (separate from the printed drawing)
      if (t > 4.7) {
        ctx.save(); ctx.fillStyle = 'rgba(52,34,20,0.9)'; ctx.strokeStyle = 'rgba(52,34,20,0.85)'; ctx.lineCap = 'round';
        // each signature is written on left-to-right (pen speed ~ 0.6 s per name)
        const sign = (txt, x, y, size, sk, flo, t0) => {
          const pr = H.clamp((t - t0) / 0.6); if (pr <= 0) return;
          ctx.save(); ctx.font = `italic 400 ${size}px "Cormorant Garamond"`;
          const w = ctx.measureText(txt).width;
          ctx.beginPath(); ctx.rect(x - 30, y - size * 1.2, (w + 60) * pr, size * 2); ctx.clip();
          ctx.save(); ctx.translate(x, y); ctx.transform(1, 0, sk, 1, 0, 0);
          ctx.fillText(txt, 0, 0); ctx.globalAlpha = 0.5; ctx.fillText(txt, 0.6, 0.3); ctx.globalAlpha = 1;
          ctx.restore();
          if (flo) { ctx.beginPath(); ctx.moveTo(x - 6, y + 9); ctx.bezierCurveTo(x + w * 0.3, y + 16, x + w * 0.8, y + 2, x + w + 8, y + 6); ctx.bezierCurveTo(x + w + 18, y + 8, x + w + 4, y + 16, x + w - 10, y + 13); ctx.lineWidth = 1.2; ctx.stroke(); }
          ctx.restore();
        };
        sign('Elias M. Holloway', 1008, 590, 36, -0.34, true, 4.7);
        sign('Pell & Garrow', 1040, 640, 24, -0.32, false, 5.2);
        sign('J. R. Whitcomb', 70, 662, 24, -0.32, true, 4.9);
        sign('Ada L. Pryor', 64, 692, 22, -0.22, false, 5.3);
        ctx.restore();
      }
      H.grain(ctx, W, H_, 0.05, 13 + Math.floor(t * 12));
    },
    // ===== EXPLAINER =====
    explainerDuration: 14.5,
    explainerNote: 'The camera travels along one long patent sheet as FIG. 4–6 are inked stroke by stroke: ruled arrows and leader lines tie labels to parts, odometer drums count the examples and the accuracy, and an examiner\'s red pencil rings the wrong guess and the 97%.',
    explainer(ctx, W, H_, t) {
      // camera along the sheet
      const K = [[0, 640, 360, 1], [6.0, 640, 360, 1], [6.8, 1280 + 690, 400, 1.3], [10.3, 1280 + 690, 400, 1.3], [11.0, 2560 + 640, 360, 1], [99, 2560 + 640, 360, 1]];
      let ki = 0; while (ki < K.length - 2 && t > K[ki + 1][0]) ki++;
      const ke = H.ease.inOut(H.clamp((t - K[ki][0]) / (K[ki + 1][0] - K[ki][0])));
      const ccx = H.lerp(K[ki][1], K[ki + 1][1], ke), ccy = H.lerp(K[ki][2], K[ki + 1][2], ke), cz = H.lerp(K[ki][3], K[ki + 1][3], ke);
      ctx.drawImage(paperWide(W, H_), ccx - W / 2 / cz, ccy - H_ / 2 / cz, W / cz, H_ / cz, 0, 0, W, H_);
      const Lr = H.layer(W, H_), c = Lr.getContext('2d');
      c.setTransform(cz, 0, 0, cz, W / 2 - ccx * cz, H_ / 2 - ccy * cz); c.strokeStyle = '#000'; c.fillStyle = '#000'; c.lineCap = 'round'; c.lineJoin = 'round';
      const fig = (t0, rate) => { used = 0; budget = t < t0 ? 0 : Math.floor((t - t0) * rate); };
      const after = (t0) => H.clamp(t - t0);
      fig(0, 1e9);
      stroke(c, [[18, 18], [PXW - 18, 18], [PXW - 18, H_ - 18], [18, H_ - 18]], 1.6, true);
      stroke(c, [[23, 23], [PXW - 23, 23], [PXW - 23, H_ - 23], [23, H_ - 23]], 0.7, true);
      c.font = '400 15px "Libre Baskerville"'; c.textBaseline = 'alphabetic';
      c.textAlign = 'left'; c.fillText('Dec. 5, 1933.', 48, 52);
      c.textAlign = 'right'; c.fillText('Patent No. 1,938,413', 1232, 52);
      [['2', 1280], ['3', 2560]].forEach(([n, x]) => { c.textAlign = 'right'; c.font = '400 13px "Libre Baskerville"'; c.fillText(`3 Sheets-Sheet ${n}`, x + 1232, 52); });
      c.textAlign = 'right'; c.font = '400 13px "Libre Baskerville"'; c.fillText('3 Sheets-Sheet 1', 1232, 78);

      // ===== BEAT 1: the question, lettered large, then set into the title slot =====
      {
        const k = H.ease.inOut(H.clamp((t - 1.35) / 0.85));
        const x = 640, y = H.lerp(350, 78, k), sc = H.lerp(1, 19 / 50, k);
        c.save(); c.translate(x, y); c.scale(sc, sc);
        c.font = '700 50px "Libre Baskerville"'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        const txt = 'HOW  DOES  AI  LEARN?', w = c.measureText(txt).width;
        c.save(); c.beginPath(); c.rect(-w / 2 - 10, -60, (w + 20) * H.clamp(t / 1.0), 90); c.clip(); c.fillText(txt, 0, 0); c.restore();
        if (k < 1) { c.lineWidth = 1.2; const pr = H.clamp((t - 0.9) / 0.4); c.beginPath(); c.moveTo(-w / 2, 16); c.lineTo(-w / 2 + w * pr, 16); c.stroke(); c.beginPath(); c.moveTo(-w / 2, 22); c.lineTo(-w / 2 + w * pr, 22); c.lineWidth = 0.6; c.stroke(); }
        c.restore();
        if (k >= 1) { c.font = '400 15px "Libre Baskerville"'; c.textAlign = 'center'; c.fillText('E.  M.  HOLLOWAY', 640, 52); c.font = 'italic 400 13px "Libre Baskerville"'; c.fillText('Filed Aug. 2, 1931', 640, 98); }
      }

      // ===== BEAT 2: FIG. 4 — the example hopper =====
      fig(2.25, 140);
      {
        // card tray (stack of examples)
        const tray = [[140, 470], [420, 470], [420, 560], [140, 560]];
        stroke(c, tray, 1.3, true);
        if (drew()) free(() => { // hero conventions: shade line on the lower/right edges, a drawer pull
          stroke(c, [[420, 470], [420, 560], [140, 560]], 2.4);
          stroke(c, circ(280, 520, 13, 9, 20, Math.PI, Math.PI * 2), 1.1); stroke(c, [[264, 520], [296, 520]], 1.1);
        });
        hatch(c, [[400, 470], [420, 470], [420, 560], [400, 560]], Math.PI / 2, 3, 0.6);
        if (drew()) free(() => vhatch(c, 366, 420, 470, 560, 2.2, 9));
        for (let k = 0; k < 7; k++) stroke(c, [[150 + k * 3, 466 - k * 9], [410 + k * 3, 466 - k * 9]], 1);
        exCard(c, 220, 404, -0.06, true); exCard(c, 340, 410, 0.05, false);
        // hopper + cabinet (front elevation)
        const hop = [[600, 220], [900, 220], [790, 340], [710, 340]];
        stroke(c, hop, 1.4, true);
        if (drew()) free(() => {
          stroke(c, [[616, 231], [884, 231]], 0.8); // the far rim seen inside the mouth
          stipple(c, [[616, 231], [884, 231], [793, 336], [707, 336]], 2600, (x, y) => H.clamp((y - 231) / 105) * 0.55 + H.clamp((x - 760) / 120) * 0.3, H.rng(43), 0.62);
          stroke(c, [[900, 220], [790, 340]], 2.4); // shade line on the lit hopper's shadow side
        });
        hatch(c, [[860, 220], [900, 220], [790, 340], [770, 340]], Math.PI / 2, 2.6, 0.6);
        const cab = [[620, 340], [880, 340], [880, 590], [620, 590]];
        stroke(c, cab, 1.4, true); stroke(c, [[880, 340], [880, 590], [620, 590]], 2.4);
        hatch(c, [[858, 340], [880, 340], [880, 590], [858, 590]], Math.PI / 2, 3, 0.6);
        if (drew()) free(() => { vhatch(c, 800, 880, 340, 418, 2.2, 11); vhatch(c, 800, 880, 482, 590, 2.2, 11); vhatch(c, 800, 880, 418, 482, 2.2, 11, 0.55, 869); });
        stroke(c, [[600, 590], [900, 590], [900, 612], [600, 612]], 1.2, true); hatch(c, [[600, 590], [900, 590], [900, 612], [600, 612]], Math.PI / 4, 4, 0.6);
        if (drew()) free(() => { hatch(c, [[600, 590], [900, 590], [900, 612], [600, 612]], -Math.PI / 4, 4, 0.5); stroke(c, [[900, 590], [900, 612], [600, 612]], 2.2); });
        // odometer window
        stroke(c, [[632, 418], [868, 418], [868, 482], [632, 482]], 1.2, true);
        if (drew()) free(() => { stroke(c, [[632, 418], [868, 418]], 2.2); stroke(c, [[632, 418], [632, 482]], 2.2); }); // a recessed window: shade on its upper/left reveal
        const e = H.ease.inOut(H.clamp((t - 2.9) / 2.7)), v = t < 2.9 ? 0 : Math.round(Math.pow(10, 6 * e)) * (e > 0.999 ? 1 : 1);
        const val = e >= 1 ? 1000000 : Math.min(999999, v);
        const s7 = String(val).padStart(7, '0'), str = s7[0] + ',' + s7.slice(1, 4) + ',' + s7.slice(4);
        odo(c, 640, 450, str, e > 0 && e < 1 ? ((t * 9) % 1) : 0, 7 - String(val).length + 1); // leading zeros and the leading digit hold still
        if (ok()) { c.font = '400 13px "Libre Baskerville"'; c.textAlign = 'center'; c.fillText('EXAMPLES', 750, 506); }
        // gears glimpsed through a port
        stroke(c, circ(750, 548, 22), 1, true); if (drew()) free(() => stroke(c, circ(750, 548, 23.2, 23.2, 20, -0.9, 0.9 + Math.PI * 0.6), 1.8)); stroke(c, circ(750, 548, 5), 1, true);
        for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + t * 2; stroke(c, [[750 + Math.cos(a) * 6, 548 + Math.sin(a) * 6], [750 + Math.cos(a) * 20, 548 + Math.sin(a) * 20]], 0.8); }
        // flow arrow
        arrowP(c, qp([300, 330], [420, 170], [610, 210]), H.clamp((t - 2.9) / 0.5), 1.4);
        if (t > 3.3 && ok()) { c.font = 'italic 400 28px "Libre Baskerville"'; c.textAlign = 'center'; c.fillText('training data', 430, 188); }
        // labels landing
        if (t > 2.9 && ok()) { c.font = '700 64px "Libre Baskerville"'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(val.toLocaleString('en-US'), 1070, 300); c.font = 'italic 400 30px "Libre Baskerville"'; c.fillText('examples', 1070, 344); stroke(c, [[915, 318], [1225, 318]], 0.8); }
        labelL(c, '', 915, 320, 868, 452, 0.15, after(3.0) * 2.5); // ties the big number to the drums
        labelL(c, 'labels', 200, 296, 240, 404, -0.2, after(3.5) * 2.5);
        if (ok()) { c.font = '700 26px "Libre Baskerville"'; c.textAlign = 'center'; c.fillText('FIG. 4.', 1060, 640); }
      }
      // cards in flight (drawn without budget, on top)
      if (t > 2.7 && t < 6.2) {
        used = 0; budget = 1e9;
        const path = qp([300, 380], [440, 120], [750, 236], 60);
        for (let k = 0; k < 5; k++) {
          const u = ((t - 2.7) * 1.3 - k * 0.2); if (u < 0 || u > 1) continue;
          const uf = u - Math.floor(u), i = Math.min(59, Math.floor(uf * 60)), p = path[i], q = path[i + 1];
          if (uf > 0.95) continue;
          exCard(c, p[0], p[1], Math.atan2(q[1] - p[1], q[0] - p[0]) * 0.4, (k + Math.floor((t - 2.7) * 1.3)) % 2 === 0);
        }
      }

      // ===== BEAT 3: FIG. 5 — guess, check, adjust =====
      const O = 1280;
      fig(6.25, 170);
      {
        const cab = [[O + 430, 290], [O + 760, 290], [O + 760, 560], [O + 430, 560]];
        stroke(c, cab, 1.4, true); stroke(c, [[O + 760, 290], [O + 760, 560], [O + 430, 560]], 2.4);
        hatch(c, [[O + 738, 290], [O + 760, 290], [O + 760, 560], [O + 738, 560]], Math.PI / 2, 3, 0.6);
        if (drew()) free(() => vhatch(c, O + 716, O + 760, 290, 560, 2.2, 10));
        stroke(c, [[O + 410, 560], [O + 780, 560], [O + 780, 584], [O + 410, 584]], 1.2, true);
        if (drew()) free(() => { const bs = [[O + 410, 560], [O + 780, 560], [O + 780, 584], [O + 410, 584]]; hatch(c, bs, Math.PI / 4, 4, 0.6); hatch(c, bs, -Math.PI / 4, 4, 0.5); stroke(c, [[O + 780, 560], [O + 780, 584], [O + 410, 584]], 2.2); });
        if (ok()) { c.font = '400 13px "Libre Baskerville"'; c.textAlign = 'center'; c.fillText('MODEL', O + 595, 318); }
        // input slot + output window
        stroke(c, [[O + 430, 380], [O + 444, 380], [O + 444, 440], [O + 430, 440]], 1.2);
        if (drew()) free(() => { stroke(c, [[O + 431, 381], [O + 443, 381]], 2.2); hatch(c, [[O + 430, 380], [O + 444, 380], [O + 444, 440], [O + 430, 440]], Math.PI / 2, 2.2, 0.5); });
        const ow = [[O + 760, 330], [O + 960, 330], [O + 960, 400], [O + 760, 400]];
        stroke(c, ow, 1.3, true);
        if (drew()) free(() => stroke(c, [[O + 960, 330], [O + 960, 400], [O + 762, 400]], 2.4)); // shade line on the viewer's lower/right edges
        // knobs (weights)
        const tq = Math.floor(t * 12) / 12;
        [0, 1, 2].forEach((i) => {
          const kx = O + 510 + i * 85, ky = 470;
          stroke(c, circ(kx, ky, 26), 1.3, true); stroke(c, circ(kx, ky, 20), 0.8, true);
          hatch(c, circ(kx, ky, 26, 26, 20, -0.4, 1.6), Math.PI / 4, 2.4, 0.5);
          if (drew()) free(() => {
            stroke(c, circ(kx, ky, 27.2, 27.2, 20, -0.5, 1.9), 2); // shade line round the knob's lower right
            const cast = circ(kx + 4, ky + 4, 27, 27, 24, -0.5, 2.1).concat(circ(kx, ky, 27, 27, 24, 2.1, -0.5));
            stipple(c, cast, 520, (x, y) => H.clamp(1.15 - Math.hypot(x - kx, y - ky) / 31) * 0.95 + 0.25, H.rng(60 + i), 0.5); // fine-dot shadow on the face
          });
          const a0 = [-2.2, -0.6, -1.5][i], a1 = [-0.9, -2.3, -0.4][i], a = a0 + (a1 - a0) * H.ease.inOut(H.clamp((tq - 8.75 - i * 0.12) / 0.5));
          stroke(c, [[kx, ky], [kx + Math.cos(a) * 19, ky + Math.sin(a) * 19]], 2.2);
          for (let k = 0; k < 9; k++) { const aa = -Math.PI + k / 8 * Math.PI; stroke(c, [[kx + Math.cos(aa) * 29, ky + Math.sin(aa) * 29], [kx + Math.cos(aa) * 34, ky + Math.sin(aa) * 34]], 0.7); }
        });
        if (ok()) { c.font = '700 26px "Libre Baskerville"'; c.textAlign = 'center'; c.fillText('FIG. 5.', O + 640, 650); }
      }
      // input card slides into the slot
      if (t > 6.5) { used = 0; budget = 1e9; const k = H.ease.out(H.clamp((t - 6.5) / 0.6)); exCard(c, O + H.lerp(170, 360, k), 410, 0, true, '?'); if (ok()) { c.font = 'italic 400 28px "Libre Baskerville"'; c.textAlign = 'center'; c.fillText('new picture', O + H.lerp(170, 360, k), 482); } }
      fig(6.25, 1e9);
      {
        // guess in the window
        const right = t > 9.35;
        if (t > 7.15) {
          c.font = '700 30px "Courier Prime"'; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.save(); c.beginPath(); c.rect(O + 762, 332, 196 * H.clamp((t - (right ? 9.35 : 7.15)) / 0.35), 66); c.clip();
          c.fillText(right ? 'cat' : 'dog?', O + 840, 366);
          c.restore();
          if (right && t > 9.65) stroke(c, [[O + 895, 364], [O + 908, 380], [O + 940, 344]], 3.2);
          c.textBaseline = 'alphabetic';
        }
        labelL(c, 'Guess', O + 880, 250, O + 860, 330, 0.2, after(7.25) * 3, 32);
        // check: reference tag vs guess
        const tag = [[O + 985, 440], [O + 1152, 440], [O + 1152, 500], [O + 985, 500], [O + 968, 470]];
        if (t > 7.5) {
          stroke(c, tag, 1.3, true); if (drew()) free(() => stroke(c, [[O + 1153.4, 441], [O + 1153.4, 501.4], [O + 986, 501.4]], 1.4));
          stroke(c, circ(O + 983, 470, 5), 1, true); c.font = '700 22px "Courier Prime"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('label: cat', O + 1071, 471); c.textBaseline = 'alphabetic';
        }
        arrowP(c, qp([O + 930, 401], [O + 932, 452], [O + 962, 466]), H.clamp((t - 7.45) / 0.3), 1.4);
        labelL(c, 'Check', O + 1110, 586, O + 1095, 502, -0.2, after(7.6) * 3, 32);
        if (t > 7.8 && !right) { const p = H.clamp((t - 7.8) / 0.25); stroke(c, partial([[O + 800, 340], [O + 920, 394]], p), 4.5); stroke(c, partial([[O + 920, 340], [O + 800, 394]], H.clamp(p * 2 - 1)), 4.5); }
        // error signal travels back to the knobs
        const fb = qp([O + 1100, 440], [O + 1080, 160], [O + 640, 200], 40).concat(qp([O + 640, 200], [O + 560, 220], [O + 560, 430], 20));
        arrowP(c, fb, H.clamp((t - 8.25) / 0.5), 1.4, [10, 6]);
        if (t > 8.4) { const pk = fb[Math.min(fb.length - 1, Math.floor(H.clamp((t - 8.25) / 0.5) * fb.length))]; c.font = 'italic 400 28px "Libre Baskerville"'; c.textAlign = 'center'; c.fillText('error signal', O + 960, 188); if (t < 8.9) { c.beginPath(); c.arc(pk[0], pk[1], 6, 0, 7); c.fill(); } }
        labelL(c, 'Adjust', O + 330, 606, O + 488, 492, 0.2, after(8.6) * 3, 32);
        // loop return arrow (adjust -> guess again)
        arrowP(c, qp([O + 700, 520], [O + 820, 540], [O + 850, 404]), H.clamp((t - 9.15) / 0.3), 1.4);
      }

      // ===== BEAT 4: FIG. 6 — accuracy over training rounds =====
      const G = 2560;
      fig(10.75, 260);
      {
        const ox = G + 180, oy = 540, gw = 640, gh = 380;
        arrowP(c, [[ox, oy + 10], [ox, oy - gh - 10]], 1); arrowP(c, [[ox - 10, oy], [ox + gw + 20, oy]], 1);
        for (let k = 1; k <= 5; k++) { stroke(c, [[ox, oy - k * gh / 5], [ox + gw, oy - k * gh / 5]], 0.5, false, [2, 5]); stroke(c, [[ox - 8, oy - k * gh / 5], [ox, oy - k * gh / 5]], 1); }
        for (let k = 1; k <= 8; k++) stroke(c, [[ox + k * gw / 8, oy], [ox + k * gw / 8, oy + 8]], 1);
        if (ok()) { c.font = '400 13px "Libre Baskerville"'; c.textAlign = 'right'; c.textBaseline = 'middle'; [50, 60, 70, 80, 90, 100].forEach((v, k) => c.fillText(v + '%', ox - 12, oy - k * gh / 5)); c.textBaseline = 'alphabetic'; c.textAlign = 'center'; c.font = '400 22px "Libre Baskerville"'; c.fillText('TRAINING  ROUNDS', ox + gw / 2, oy + 38); c.save(); c.translate(ox - 64, oy - gh / 2); c.rotate(-Math.PI / 2); c.fillText('ACCURACY', 0, 0); c.restore(); }
        if (ok()) { c.font = '700 26px "Libre Baskerville"'; c.textAlign = 'center'; c.fillText('FIG. 6.', G + 1150, 600); }
        used = 0; budget = 1e9;
        const acc = (u) => 61 + 36 * (1 - Math.pow(1 - u, 2.3)), pr = H.clamp((t - 11.0) / 1.5);
        const pts = []; for (let k = 0; k <= 60; k++) { const u = k / 60 * pr; pts.push([ox + u * gw, oy - (acc(u) - 50) / 50 * gh]); }
        if (pr > 0) {
          const area = pts.concat([[pts[pts.length - 1][0], oy], [ox, oy]]);
          hatch(c, area, Math.PI / 2, 4, 0.6); stroke(c, pts, 2.2);
          const tip = pts[pts.length - 1]; stroke(c, circ(tip[0], tip[1], 6), 1.4, true);
          for (let k = 1; k <= 8; k++) { const u = k / 8; if (u <= pr) stroke(c, circ(ox + u * gw, oy - (acc(u) - 50) / 50 * gh, 3.5), 1, true); }
          const v = Math.round(acc(pr));
          c.font = 'italic 400 36px "Libre Baskerville"'; c.textAlign = 'left'; c.fillText('Accuracy', G + 925, 214);
          c.save(); c.translate(G + 925, 300); c.scale(2.8, 2.8); odo(c, 0, 0, String(v) + '%', 0); c.restore();
          labelL(c, '', G + 930, 236, tip[0] + 6, tip[1] - 4, 0.2, 0);
        }
      }
      // ===== BEAT 5: the claim =====
      if (t > 13.0) {
        const txt = 'I claim: More examples  →  better guesses.', n = Math.floor(H.clamp((t - 13.0) / 0.7) * txt.length);
        c.font = 'italic 400 44px "Libre Baskerville"'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        const full = c.measureText(txt).width; c.textAlign = 'left'; c.fillText(txt.slice(0, n), G + 640 - full / 2, 640);
        if (t > 13.75) stroke(c, [[G + 640 - full / 2, 652], [G + 640 - full / 2 + full * H.clamp((t - 13.75) / 0.3), 652]], 1.4);
      }
      // composite ink (warm iron-black) onto the paper
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#1e1810'; c.fillRect(0, 0, W, H_);
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      ctx.filter = 'blur(1.1px)'; ctx.globalAlpha = 0.28; ctx.drawImage(Lr, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = 0.95; ctx.drawImage(Lr, 0, 0);
      ctx.restore();
      // examiner's red pencil (emphasis)
      ctx.save(); ctx.translate(W / 2 - ccx * cz, H_ / 2 - ccy * cz); ctx.scale(cz, cz);
      if (t > 7.95 && t < 9.4) redPencil(ctx, circ(O + 860, 366, 120, 52, 40, -0.6, -0.6 + Math.PI * 2.15), H.clamp((t - 7.95) / 0.35), 5);
      if (t > 8.1 && t < 9.4) { ctx.save(); ctx.fillStyle = 'rgba(178,52,40,0.85)'; ctx.font = 'italic 400 32px "Libre Baskerville"'; ctx.fillText('wrong!', O + 990, 296); ctx.restore(); }
      if (t > 12.6) redPencil(ctx, circ(G + 1060, 300, 170, 96, 40, -0.4, -0.4 + Math.PI * 2.15), H.clamp((t - 12.6) / 0.35), 6);
      if (t > 12.8) { ctx.save(); ctx.fillStyle = 'rgba(178,52,40,0.85)'; ctx.font = 'italic 400 30px "Libre Baskerville"'; ctx.fillText('97% — allowed', G + 930, 430); ctx.restore(); }
      ctx.restore();
      H.grain(ctx, W, H_, 0.05, 13 + Math.floor(t * 12));
    },
    // Sound: a quiet drafting room. Everything inked is a steel ruling pen scratching across hard paper (thin, dry,
    // no squeak); the machine's odometer drums clack; the examiner's red pencil is a softer, grainier graphite drag.
    // Camera moves along the sheet are the long sheet sliding under the lamp (a low smooth slide, no rustle).
    // All times copied from explainer() above.
    explainerSound(k) {
      // Chrome glitch: a noise buffer that starts within ~1e-8 s of a sample boundary (float error like 4.15 + 0.1 * 1 + 0.11)
      // spikes far above its gain. Put every start a quarter sample past the 48 kHz grid so none land there.
      { const k0 = k, sn = (t) => (Math.round(t * 48000) + 0.25) / 48000; k = { ...k0, play: (n, t, o) => k0.play(n, sn(t), o), tone: (t, o) => k0.tone(sn(t), o), noise: (t, o) => k0.noise(sn(t), o) }; }
      const D = 14.5;
      // screen pan for a sheet x at the camera's resting framings (FIG.4: x, FIG.5: zoom 1.3 on 1970, FIG.6: x-2560)
      const p4 = (x) => H.clamp(x / 640 - 1, -1, 1) * 0.6, p5 = (x) => H.clamp(((640 + (x - 1970) * 1.3) / 640) - 1, -1, 1) * 0.6, p6 = (x) => p4(x - 2560);
      // ruling pen: nib touches down (tiny dry tap), then a thin steel scratch for the stroke's length
      const pen = (a, d, g = 1, pan = 0, minor = true) => {
        k.noise(a, { dur: 0.018, filter: 'bandpass', f: 1900, q: 1.3, gain: 0.16 * g, a: 0.001, pan, minor });
        k.play('stroke', a, { material: 'pen', dur: d, gain: 2.7 * g, pan, minor });
        k.noise(a, { dur: d, filter: 'bandpass', f: 1200, q: 0.8, gain: 0.05 * g, a: Math.min(0.02, d / 3), hold: d * 0.6, pan, minor }); // a little body: the pen dragging on the rule
      };
      // red pencil: grainier, lower, softer than the steel pen
      const redPencil = (a, d, g = 1, pan = 0, minor = false) => k.play('stroke', a, { material: 'pencil', dur: d, gain: 0.9 * g, pan, minor });
      // odometer drum: a small, damped brass clack
      const drum = (t, g = 1, pan = 0, f = 1500) => k.withMinor(() => { k.noise(t, { dur: 0.03, filter: 'bandpass', f, q: 2.2, gain: 0.3 * g, a: 0.001, pan }); k.tone(t, { f: f * 0.2, type: 'triangle', dur: 0.04, gain: 0.07 * g, pan }); });
      // the long sheet sliding under the lamp: low, smooth, no paper crinkle
      const slide = (a, d, g = 1) => k.noise(a, { dur: d, color: 'brown', filter: 'bandpass', f: [[0, 220], [d * 0.5, 520], [d, 260]], q: 0.6, gain: 0.34 * g, a: d * 0.45, verb: 0.05 });

      k.bed('room', 0, D, { gain: 0.35 });
      k.bed('hiss', 0, D, { gain: 0.5 });

      // ---- BEAT 1: "HOW  DOES  AI  LEARN?" letters in left to right over 0..1.0 (21 chars), double rule 0.9..1.3
      [[0, 3], [5, 9], [11, 13], [15, 21]].forEach(([s, e], i) => pen(0.02 + (s / 21) * 0.98, ((e - s) / 21) * 0.98, 1.1, [-0.35, -0.12, 0.1, 0.3][i], i > 0));
      pen(0.9, 0.4, 1.3, 0, false); // ruled double underline: one long confident pull along the T-square
      pen(1.02, 0.28, 0.6, 0.05);
      slide(1.35, 0.85, 0.5); // title shrinks up into the title slot (1.35 -> 2.2)

      // ---- BEAT 2: FIG. 4 inks at 140 marks/s from 2.25 (tray + cards, then hopper, cabinet, odometer, gears ~3.05)
      pen(2.25, 0.14, 1.1, p4(280), false); // first mark of the figure
      { const xs = [280, 230, 340, 750, 750, 700, 750, 800, 750]; for (let i = 1; i < xs.length; i++) pen(2.25 + i * 0.09, 0.07, 0.75, p4(xs[i])); }
      // cards fly the arc into the hopper (5 cards, period 1/1.3 s, card k offset k*0.2/1.3); a light card flick as each drops in
      for (let c = 0; c < 5; c++) for (let n = 0; ; n++) {
        const t0 = 2.7 + (c * 0.2 + n) / 1.3, drop = t0 + 0.95 / 1.3;
        if (drop > 6.15) break;
        if ((c + n) % 2 === 0) k.noise(drop, { dur: 0.05, filter: 'bandpass', f: 1500, q: 0.8, gain: 0.11, a: 0.003, pan: p4(720), minor: true });
      }
      pen(2.9, 0.5, 0.9, p4(450)); // flow arrow arcs over to the hopper
      pen(3.0, 0.29, 0.6, p4(930)); // leader to the odometer
      pen(3.5, 0.24, 0.6, p4(220)); // 'labels' leader
      // odometer drums roll at 9 turns/s while the count runs (2.9 -> 5.6); clack per turn, softer while it barely moves
      for (let n = Math.ceil(2.9 * 9); n / 9 < 5.6 - 0.03; n++) {
        const t = n / 9, e = H.ease.inOut(H.clamp((t - 2.9) / 2.7)), sp = Math.min(1, 6 * e * (1 - e) + 0.25);
        drum(t, 0.55 + 0.45 * sp, p4(750), 1400 + e * 300);
      }
      // 1,000,000 locks in
      k.play('tock', 5.6, { f: 520, gain: 0.55, pan: p4(900) });
      k.play('thud', 5.6, { f: 110, gain: 0.22, pan: p4(900) });

      // ---- camera travels the sheet to FIG. 5 (6.0 -> 6.8)
      slide(6.0, 0.85, 1);
      // FIG. 5 inks at 170/s from 6.25 (cabinet, windows, three knobs ~6.53)
      pen(6.25, 0.12, 0.9, p5(1880));
      [1990, 1790, 1875, 1960].forEach((x, i) => pen(6.33 + i * 0.06, 0.05, 0.6, p5(x)));
      // the "?" card slides into the input slot (6.5 -> ~7.1, ease out), seats with a little click
      k.noise(6.5, { dur: 0.42, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.4, 1300]], q: 0.8, gain: 0.12, a: 0.05, pan: p5(1560), minor: true });
      k.play('tock', 6.95, { f: 900, gain: 0.3, pan: p5(1640), minor: true });
      // guess window reveals "dog?" (7.15): the readout drum flips over
      drum(7.15, 1.2, p5(2120), 1200); k.play('tock', 7.17, { f: 640, gain: 0.45, pan: p5(2120) });
      pen(7.25, 0.24, 0.55, p5(2150)); // Guess leader
      pen(7.45, 0.3, 0.7, p5(2280)); // arrow to the reference tag
      pen(7.5, 0.12, 0.6, p5(2380)); // tag outline
      pen(7.6, 0.24, 0.55, p5(2380)); // Check leader
      // WRONG: two heavy ruled strokes cross out "dog?" (7.8 -> 7.925 -> 8.05), then the examiner's red ring (7.95 -> 8.3)
      pen(7.8, 0.12, 2.0, p5(2140), false); pen(7.925, 0.12, 2.0, p5(2140), false);
      k.play('error', 7.8, { f: 'F3', gain: 0.55, pan: p5(2140) });
      redPencil(7.95, 0.35, 1.2, p5(2140));
      // error signal: a dashed line ruled back to the knobs (8.25 -> 8.75), dash by dash
      for (let i = 0; i < 6; i++) pen(8.25 + i * 0.08, 0.045, 0.6, p5([2380, 2300, 2150, 1960, 1860, 1840][i]));
      pen(8.6, 0.24, 0.55, p5(1690)); // Adjust leader
      // knobs turn (quantized to 12 fps, 8.75 + i*0.12 over 0.5 s): one detent click per moving frame
      for (let f = Math.ceil(8.76 * 12); f / 12 < 9.49; f++) k.play('click', f / 12, { f: 900 + (f % 3) * 90, gain: 0.5, pan: p5(1875 + ((f % 3) - 1) * 85), minor: true });
      pen(9.15, 0.3, 0.7, p5(2080)); // loop return arrow
      // CORRECTION: "cat" turns up in the window (9.35), check mark inked (9.65)
      drum(9.35, 1.2, p5(2120), 1200); k.play('tock', 9.36, { f: 700, gain: 0.5, pan: p5(2120) });
      pen(9.65, 0.12, 1.4, p5(2200), false);
      k.play('success', 9.66, { f: 'G5', gain: 0.6, pan: p5(2200) });

      // ---- camera travels to FIG. 6 (10.3 -> 11.0)
      slide(10.3, 0.75, 1);
      pen(10.75, 0.1, 0.9, p6(2740), false); pen(10.85, 0.12, 0.6, p6(3060)); // axes and grid (inked at 260/s)
      pen(11.0, 1.5, 0.45, p6(3060)); // the curve inks along with the hatching under it (11.0 -> 12.5)
      { // accuracy drums: one clack per new value, at most 12/s, slowing as it settles
        const acc = (u) => 61 + 36 * (1 - Math.pow(1 - u, 2.3));
        let last = 61, lastT = -1;
        for (let t = 11.0; t < 12.5; t += 1 / 120) {
          const v = Math.round(acc(H.clamp((t - 11.0) / 1.5)));
          if (v !== last && t - lastT >= 1 / 12) { drum(t, 0.9, p6(3490), 1300 + (v - 61) * 12); last = v; lastT = t; }
        }
      }
      // 97 locks in (12.5) and the examiner rings it in red (12.6 -> 12.95): the big hit
      k.play('impact', 12.5, { gain: 1.1, pan: p6(3490) });
      k.play('ding', 12.52, { f: 'E5', gain: 0.5, pan: p6(3490) });
      redPencil(12.6, 0.35, 2.2, p6(3620));

      // ---- BEAT 5: the claim letters in (13.0 -> 13.7, 43 chars), then a ruled underline (13.75 -> 14.05)
      { const txt = 'I claim: More examples  →  better guesses.', n = txt.length, re = /\S+/g; let m;
        while ((m = re.exec(txt))) pen(13.0 + 0.7 * m.index / n, Math.max(0.04, 0.7 * m[0].length / n), 0.75, (m.index / n - 0.5) * 0.6); }
      pen(13.75, 0.3, 1.2, 0, false);
      ['C5', 'G5', 'E6'].forEach((f, i) => k.play('ding', 13.78 + i * 0.08, { f, gain: 0.4 - i * 0.07, pan: (i - 1) * 0.25 })); // resolve
    },

    // ===== END EXPLAINER =====
  });
}
```
