I want an animated explainer made in the "Byzantine Mosaic" visual style (Illustration). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Cormorant Garamond, Libre Baskerville
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=block">
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
Name: Byzantine Mosaic
Family: Illustration
Look: A Byzantine wall mosaic built from thousands of hand-cut tesserae laid in rows that echo every contour (andamento), with mortar grout, bevelled tile edges, per-tile colour variation and a glinting gold-smalti ground.
Motion: Light rakes across the wall so individual gold smalti flash in turn; tiles could be laid row by row outward from the figure.
How it explains: Every scene is a fresh andamento-tessellated wall: tiles are laid element by element (arrows tile by tile along their length), scene changes pry the old tesserae up and re-lay the wall in a sweeping front, counters are live tesserae re-set on a grid, and gold smalti flash on the key moments.

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

REFERENCE STYLE SOURCE (styles/mosaic.js; W/H_ are always 1280x720)
```js
{
  // ---------- Byzantine tesserae mosaic with andamento ----------
  // 1) paint a flat "cartoon" into a label map  2) distance field from every contour
  // 3) tessera rows = iso-distance bands (so tiles follow the forms)  4) seeds along each band
  // 5) per-pixel constrained Voronoi (same region + same row) -> irregular tiles, grout, bevels.
  const REG = [
    // name, rgb, tile size, kind
    ['gold', [204, 162, 70], 13, 'gold'],
    ['halo', [214, 174, 80], 11, 'gold'],
    ['haloRing', [150, 38, 30], 10],
    ['haloInner', [232, 224, 204], 8],
    ['bDark', [44, 40, 42], 10],
    ['bBand', [226, 214, 190], 11],
    ['lozenge', [158, 46, 34], 9],
    ['bInner', [118, 34, 26], 9],
    ['face', [166, 180, 188], 9],
    ['faceShade', [120, 136, 150], 9],
    ['outline', [38, 36, 44], 8],
    ['eyeGlow', [64, 172, 192], 7],
    ['eyeWhite', [228, 226, 214], 7],
    ['pupil', [22, 24, 30], 6],
    ['copper', [178, 104, 56], 8],
    ['red', [172, 44, 34], 8],
    ['robe', [34, 54, 104], 10],
    ['robeLight', [64, 94, 156], 10],
    ['clavus', [206, 164, 66], 9, 'gold'],
    ['collar', [140, 48, 38], 8],
    ['neck', [128, 140, 150], 8],
    ['letters', [124, 30, 26], 9],
    ['star', [236, 232, 220], 7],
  ];
  const ID = {}; REG.forEach((r, i) => (ID[r[0]] = i));
  const key = (i) => [(i * 11 + 3) & 255, (i * 37 + 50) & 255, (i * 91 + 17) & 255];

  // all static work (cartoon, distance field, seeds, per-pixel tile ownership + bevel) is
  // deterministic, so it is computed once and reused by every frame
  let CACHE = null;
  function build(W, H_) {
      const nz = H.makeNoise(4), rnd = H.rng(331);
      // ---------- 1) cartoon / label map ----------
      const LC = H.layer(W, H_), lc = LC.getContext('2d');
      const fill = (name) => { const k = key(ID[name]); lc.fillStyle = `rgb(${k[0]},${k[1]},${k[2]})`; lc.strokeStyle = lc.fillStyle; };
      const circ = (x, y, r) => { lc.beginPath(); lc.arc(x, y, r, 0, Math.PI * 2); lc.fill(); };
      fill('bDark'); lc.fillRect(0, 0, W, H_);
      fill('bBand'); lc.fillRect(14, 14, W - 28, H_ - 28);
      fill('lozenge');
      const loz = (x, y, a) => { lc.beginPath(); lc.moveTo(x - a, y); lc.lineTo(x, y - 13); lc.lineTo(x + a, y); lc.lineTo(x, y + 13); lc.closePath(); lc.fill(); };
      for (let x = 50; x < W - 20; x += 64) { loz(x, 33, 22); loz(x, H_ - 33, 22); }
      for (let y = 97; y < H_ - 60; y += 64) { lc.beginPath(); lc.moveTo(33, y - 22); lc.lineTo(46, y); lc.lineTo(33, y + 22); lc.lineTo(20, y); lc.closePath(); lc.fill(); lc.beginPath(); lc.moveTo(W - 33, y - 22); lc.lineTo(W - 20, y); lc.lineTo(W - 33, y + 22); lc.lineTo(W - 46, y); lc.closePath(); lc.fill(); }
      fill('bInner'); lc.fillRect(52, 52, W - 104, H_ - 104);
      fill('gold'); lc.fillRect(62, 62, W - 124, H_ - 124);
      // scattered white stars in the gold field
      fill('star');
      [[200, 470], [1080, 470], [250, 600], [1030, 600]].forEach(([x, y]) => { lc.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, q = k % 2 ? 6 : 17; lc.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } lc.closePath(); lc.fill(); });
      // halo
      const HX = 640, HY = 292;
      fill('haloRing'); circ(HX, HY, 202);
      fill('haloInner'); circ(HX, HY, 190);
      fill('halo'); circ(HX, HY, 179);
      // robe / shoulders
      const robe = () => { lc.beginPath(); lc.moveTo(400, 720); lc.bezierCurveTo(400, 560, 440, 470, 560, 440); lc.lineTo(720, 440); lc.bezierCurveTo(840, 470, 880, 560, 880, 720); lc.closePath(); };
      fill('outline'); robe(); lc.lineWidth = 18; lc.stroke(); robe(); lc.fill();
      fill('robe'); lc.save(); lc.translate(640, 0); lc.scale(0.975, 1); lc.translate(-640, 6); robe(); lc.fill(); lc.restore();
      // fold highlights
      fill('robeLight'); lc.lineWidth = 16; lc.lineCap = 'round';
      [[[470, 720], [474, 620], [500, 540], [540, 480]], [[560, 720], [556, 640], [568, 570], [590, 500]], [[720, 720], [724, 640], [712, 570], [690, 500]], [[810, 720], [806, 620], [780, 540], [740, 480]]].forEach((p) => { lc.beginPath(); lc.moveTo(...p[0]); lc.bezierCurveTo(...p[1], ...p[2], ...p[3]); lc.stroke(); });
      // clavi (gold stripes)
      fill('clavus'); lc.lineWidth = 22; lc.lineCap = 'butt';
      [[[528, 720], [520, 600], [530, 520], [556, 452]], [[752, 720], [760, 600], [750, 520], [724, 452]]].forEach((p) => { lc.beginPath(); lc.moveTo(...p[0]); lc.bezierCurveTo(...p[1], ...p[2], ...p[3]); lc.stroke(); });
      // collar
      fill('collar'); lc.beginPath(); lc.ellipse(640, 440, 92, 34, 0, 0, Math.PI); lc.fill();
      // neck
      fill('outline'); lc.fillRect(602, 384, 76, 62);
      fill('neck'); lc.fillRect(610, 384, 60, 58);
      fill('outline'); lc.fillRect(610, 404, 60, 6); lc.fillRect(610, 422, 60, 6);
      // ears (bolts)
      [[536, 296], [744, 296]].forEach(([x, y]) => { fill('outline'); circ(x, y, 25); fill('copper'); circ(x, y, 18); fill('outline'); circ(x, y, 6); });
      // antenna
      fill('outline'); lc.lineWidth = 10; lc.lineCap = 'round'; lc.beginPath(); lc.moveTo(640, 190); lc.lineTo(640, 132); lc.stroke();
      fill('outline'); circ(640, 124, 22); fill('red'); circ(640, 124, 15);
      // head
      const head = (pad) => { lc.beginPath(); lc.roundRect(540 - pad, 182 - pad, 200 + pad * 2, 214 + pad * 2, 56 + pad); };
      fill('outline'); head(9); lc.fill();
      fill('face'); head(0); lc.fill();
      fill('faceShade'); lc.save(); head(0); lc.clip(); lc.beginPath(); lc.moveTo(690, 170); lc.bezierCurveTo(740, 250, 740, 330, 680, 410); lc.lineTo(760, 410); lc.lineTo(760, 170); lc.closePath(); lc.fill(); lc.restore();
      // brows
      fill('outline'); lc.lineWidth = 9; lc.lineCap = 'round';
      [[560, 236, 624, 228], [656, 228, 720, 236]].forEach(([a, b, c2, d]) => { lc.beginPath(); lc.moveTo(a, b); lc.quadraticCurveTo((a + c2) / 2, b - 16, c2, d); lc.stroke(); });
      // eyes
      [[594, 280], [686, 280]].forEach(([x, y]) => { fill('outline'); circ(x, y, 33); fill('eyeWhite'); circ(x, y, 26); fill('eyeGlow'); circ(x, y, 18); fill('pupil'); circ(x, y, 8); });
      // nose + mouth
      fill('outline'); lc.lineWidth = 9; lc.beginPath(); lc.moveTo(640, 262); lc.lineTo(640, 330); lc.lineTo(628, 336); lc.stroke();
      lc.beginPath(); lc.moveTo(606, 360); lc.quadraticCurveTo(640, 370, 674, 360); lc.stroke();
      // letters "A" "I" with abbreviation bars (icon style)
      fill('letters'); lc.font = '600 132px "Cormorant Garamond"'; lc.textAlign = 'center'; lc.textBaseline = 'alphabetic';
      lc.fillText('A', 352, 272); lc.fillText('I', 930, 272);
      lc.lineWidth = 10; lc.lineCap = 'round'; lc.beginPath(); lc.moveTo(318, 150); lc.lineTo(386, 150); lc.moveTo(906, 150); lc.lineTo(954, 150); lc.stroke();

      // resolve labels (antialiased edge pixels take a resolved neighbour)
      const lab = new Uint8Array(W * H_);
      {
        const d = lc.getImageData(0, 0, W, H_).data, map = new Map();
        REG.forEach((_, i) => { const k = key(i); map.set((k[0] << 16) | (k[1] << 8) | k[2], i); });
        for (let p = 0; p < W * H_; p++) {
          const v = map.get((d[p * 4] << 16) | (d[p * 4 + 1] << 8) | d[p * 4 + 2]);
          if (v !== undefined) lab[p] = v;
          else lab[p] = p % W ? lab[p - 1] : (p >= W ? lab[p - W] : 0);
        }
      }
      // ---------- 2) distance field (chamfer) ----------
      const D = new Float32Array(W * H_);
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const p = y * W + x, l = lab[p];
        const edge = (x < W - 1 && lab[p + 1] !== l) || (y < H_ - 1 && lab[p + W] !== l) || (x > 0 && lab[p - 1] !== l) || (y > 0 && lab[p - W] !== l);
        D[p] = edge ? 0.5 : 1e9;
      }
      const A = 1, B = 1.4142;
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const p = y * W + x; let v = D[p];
        if (x > 0) v = Math.min(v, D[p - 1] + A);
        if (y > 0) { v = Math.min(v, D[p - W] + A); if (x > 0) v = Math.min(v, D[p - W - 1] + B); if (x < W - 1) v = Math.min(v, D[p - W + 1] + B); }
        D[p] = v;
      }
      for (let y = H_ - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
        const p = y * W + x; let v = D[p];
        if (x < W - 1) v = Math.min(v, D[p + 1] + A);
        if (y < H_ - 1) { v = Math.min(v, D[p + W] + A); if (x < W - 1) v = Math.min(v, D[p + W + 1] + B); if (x > 0) v = Math.min(v, D[p + W - 1] + B); }
        D[p] = v;
      }
      // wobble the rows a little (hand-laid)
      for (let y = 0; y < H_; y += 1) for (let x = 0; x < W; x++) { const p = y * W + x; if (D[p] > 1.5) D[p] += nz.n2(x * 0.045, y * 0.045) * 1.6; }

      // row parametrisation: echo rows hug every contour; the open gold ground switches to straight
      // horizontal courses beyond two echo rows (as in real Byzantine grounds)
      const GOLD = ID.gold;
      const rowInfo = (p, x, y) => {
        const l = lab[p], s = REG[l][2], d = D[p];
        if (l === GOLD && d >= 2 * s) {
          const rv = (y + nz.n2(x * 0.012, y * 0.03) * 3) / s, row = Math.floor(rv);
          return [1000 + row, rv - row, s, d - 2 * s];
        }
        const row = Math.floor(d / s);
        return [row, d / s - row, s, 99];
      };
      // ---------- 3+4) seeds along the centre of each row band ----------
      const CS = 16, GW = Math.ceil(W / CS), GH = Math.ceil(H_ / CS);
      const grid = Array.from({ length: GW * GH }, () => []);
      const SX = [], SY = [], SL = [], SR = [], SW = [], SC = [], SG = [];
      const near = (x, y, l, row, rad) => {
        const cx = (x / CS) | 0, cy = (y / CS) | 0;
        for (let j = cy - 1; j <= cy + 1; j++) for (let i = cx - 1; i <= cx + 1; i++) {
          if (i < 0 || j < 0 || i >= GW || j >= GH) continue;
          for (const s of grid[j * GW + i]) if (SL[s] === l && SR[s] === row && (SX[s] - x) ** 2 + (SY[s] - y) ** 2 < rad * rad) return true;
        }
        return false;
      };
      const GOLDS = [[198, 154, 60], [214, 172, 76], [226, 188, 92], [186, 142, 52], [238, 204, 112], [206, 160, 64]];
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const p = y * W + x, l = lab[p];
        const [row, fr0, s] = rowInfo(p, x, y);
        if (Math.abs(fr0 - 0.5) * s > 0.6) continue;
        const rad = s * (0.82 + 0.3 * rnd());
        if (near(x, y, l, row, rad)) continue;
        const i = SX.length;
        SX.push(x); SY.push(y); SL.push(l); SR.push(row); SW.push(0.88 + 0.26 * rnd());
        const reg = REG[l]; let col;
        if (reg[3] === 'gold') { col = rnd.pick(GOLDS).slice(); if (rnd.chance(0.05)) col = [150, 112, 42]; SG.push(rnd.chance(0.14) ? rnd.range(0, 6.28) : -1); }
        else { const v = 1 + rnd.gauss() * 0.06; col = reg[1].map((c) => H.clamp(c * v + rnd.gauss() * 6, 0, 255)); SG.push(-1); }
        SC.push(col);
        grid[((y / CS) | 0) * GW + ((x / CS) | 0)].push(i);
      }

      // ---------- 5) per-pixel tile ownership, grout and bevel ----------
      const N = W * H_, OWN = new Int32Array(N), GRT = new Uint8Array(N), BR = new Float32Array(N), KK = new Float32Array(N), BED = new Float32Array(N), SIN = new Uint8Array(N);
      const Lx = -0.6, Ly = -0.8;
      for (let y = 0; y < H_; y++) {
        const cy = (y / CS) | 0;
        for (let x = 0; x < W; x++) {
          const p = y * W + x, l = lab[p], d = D[p];
          BED[p] = 0.9 + 0.08 * nz.n2(x * 0.08, y * 0.08) + 0.04 * nz.n2(x * 0.6, y * 0.6);
          SIN[p] = d < 1.7 ? 1 : 0;
          const [row, fr, s, zoneEdge] = rowInfo(p, x, y);
          const cx = (x / CS) | 0;
          let b1 = 1e9, b2 = 1e9, i1 = -1, f1 = 1e9, fi = -1;
          for (let j = cy - 1; j <= cy + 1; j++) {
            if (j < 0 || j >= GH) continue;
            for (let i = cx - 1; i <= cx + 1; i++) {
              if (i < 0 || i >= GW) continue;
              const cell = grid[j * GW + i];
              for (let k = 0; k < cell.length; k++) {
                const sd = cell[k]; if (SL[sd] !== l) continue;
                const dd = Math.sqrt((SX[sd] - x) ** 2 + (SY[sd] - y) ** 2) * SW[sd];
                if (SR[sd] === row) { if (dd < b1) { b2 = b1; b1 = dd; i1 = sd; } else if (dd < b2) b2 = dd; }
                else if (dd < f1) { f1 = dd; fi = sd; }
              }
            }
          }
          let sameRow = true;
          if (i1 < 0) { i1 = fi; b1 = f1; sameRow = false; }
          OWN[p] = i1;
          if (i1 < 0) { GRT[p] = 1; BR[p] = 0.85; continue; }
          const rowEdge = sameRow ? Math.min(fr, 1 - fr) * s : 99;
          const cellEdge = (b2 - b1) * 0.5;
          const edge = Math.min(rowEdge, cellEdge, d, zoneEdge);
          const g = 1.05 + 0.35 * nz.n2(x * 0.3, y * 0.3);
          if (edge < g) { GRT[p] = 1; BR[p] = 0.75 + 0.2 * nz.n2(x * 0.5, y * 0.5) + 0.1 * (edge / g); continue; }
          let vx = x - SX[i1], vy = y - SY[i1]; const vm = Math.hypot(vx, vy) || 1; vx /= vm; vy /= vm;
          const k = H.clamp(1 - (edge - g) / 2.6);
          let br = 1 + k * k * (vx * Lx + vy * Ly) * 0.3 - k * 0.06 + nz.n2(x * 0.7, y * 0.7) * 0.03;
          br *= 0.94 + 0.12 * ((SX[i1] * 7.13 + SY[i1] * 3.71) % 1);
          BR[p] = br; KK[p] = k;
        }
      }
      // ---------- 6) laying order: figure first, then robe, halo ring, halo, letters, gold ground outward, border last ----------
      const LT = new Float32Array(SX.length), lr = H.rng(77), HCX = 640, HCY = 300;
      const FIG = new Set(['outline', 'eyeGlow', 'eyeWhite', 'pupil', 'face', 'faceShade', 'copper', 'red', 'neck', 'collar']);
      for (let i = 0; i < SX.length; i++) {
        const nm = REG[SL[i]][0], x = SX[i], y = SY[i], dc = Math.hypot(x - HCX, y - HCY), j = lr();
        let lt;
        if (FIG.has(nm)) lt = 0.15 + Math.min(dc, 260) / 260 * 0.9 + j * 0.12;
        else if (nm === 'robe' || nm === 'robeLight' || nm === 'clavus') lt = 0.65 + Math.max(0, y - 430) / 290 * 0.75 + j * 0.15;
        else if (nm === 'haloRing' || nm === 'haloInner') lt = 1.0 + (((Math.atan2(y - HCY, x - HCX) + Math.PI / 2) / (Math.PI * 2) + 1) % 1) * 0.55 + j * 0.05;
        else if (nm === 'halo') lt = 1.35 + Math.max(0, 190 - dc) / 190 * 0.5 + j * 0.03;
        else if (nm === 'letters') lt = 1.5 + j * 0.3;
        else if (nm === 'star') lt = 1.75 + j * 0.2;
        else if (nm === 'gold') lt = 1.8 + Math.max(0, dc - 195) / 560 * 1.25 + j * 0.035 + (SR[i] % 2) * 0.03;
        else { const u = y < 60 ? x / W * 0.25 : x > W - 60 ? 0.25 + y / H_ * 0.25 : y > H_ - 60 ? 0.5 + (1 - x / W) * 0.25 : 0.75 + (1 - y / H_) * 0.25; lt = 2.8 + u * 0.6 + j * 0.08; }
        LT[i] = lt;
      }
      return { OWN, GRT, BR, KK, BED, SIN, LT, SC, SG };
  }

  // ===== EXPLAINER HELPERS =====
  // extra palette for the explainer scenes
  [['cream', [232, 222, 196], 8], ['brown', [118, 78, 48], 8], ['green', [52, 124, 66], 8], ['tan', [196, 140, 70], 8], ['ink', [40, 34, 40], 7], ['txt', [92, 20, 18], 5]].forEach((r) => { if (ID[r[0]] === undefined) { ID[r[0]] = REG.length; REG.push(r); } });
  // ---- scene tessellation: the same andamento pipeline as the still, plus per-tile lay / removal times ----
  // paint(cx, F): F(name, lay, rem = 99, kind = 0) sets the fill for either the label pass or the time pass.
  // kind: 0 solid, 1 sweep along x (+0..0.7s), 2 radial from (cx,cy) given via F.c, 3 bottom-up within element (+0..0.5s)
  const MX_SCENES = {}; let MX_BED = null;
  function mxScene(id, W, H_, paint, kinds, sceneRem = 99) {
    if (MX_SCENES[id]) return MX_SCENES[id];
    const nz = H.makeNoise(4), rnd = H.rng(331 + id.length * 7);
    const LCv = H.layer(W, H_), lc = LCv.getContext('2d'), TCv = H.layer(W, H_), tc = TCv.getContext('2d');
    const enc = (v) => Math.round(H.clamp(v / 15) * 255);
    [lc, tc].forEach((cx, pass) => {
      const F = (name, lay, rem = 15, kind = 0) => {
        let col;
        if (pass === 0) { const k = key(ID[name]); col = `rgb(${k[0]},${k[1]},${k[2]})`; }
        else col = `rgb(${enc(lay)},${enc(rem)},${kind})`;
        cx.fillStyle = col; cx.strokeStyle = col;
      };
      cx.imageSmoothingEnabled = false; paint(cx, F);
    });
    const N = W * H_, lab = new Uint8Array(N);
    { const d = lc.getImageData(0, 0, W, H_).data, map = new Map(); REG.forEach((_, i) => { const k = key(i); map.set((k[0] << 16) | (k[1] << 8) | k[2], i); });
      for (let p = 0; p < N; p++) { const v = map.get((d[p * 4] << 16) | (d[p * 4 + 1] << 8) | d[p * 4 + 2]); lab[p] = v !== undefined ? v : (p % W ? lab[p - 1] : (p >= W ? lab[p - W] : 0)); } }
    const td = tc.getImageData(0, 0, W, H_).data;
    const D = new Float32Array(N);
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) { const p = y * W + x, l = lab[p]; D[p] = ((x < W - 1 && lab[p + 1] !== l) || (y < H_ - 1 && lab[p + W] !== l) || (x > 0 && lab[p - 1] !== l) || (y > 0 && lab[p - W] !== l)) ? 0.5 : 1e9; }
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) { const p = y * W + x; let v = D[p]; if (x > 0) v = Math.min(v, D[p - 1] + 1); if (y > 0) { v = Math.min(v, D[p - W] + 1); if (x > 0) v = Math.min(v, D[p - W - 1] + 1.4142); if (x < W - 1) v = Math.min(v, D[p - W + 1] + 1.4142); } D[p] = v; }
    for (let y = H_ - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const p = y * W + x; let v = D[p]; if (x < W - 1) v = Math.min(v, D[p + 1] + 1); if (y < H_ - 1) { v = Math.min(v, D[p + W] + 1); if (x < W - 1) v = Math.min(v, D[p + W + 1] + 1.4142); if (x > 0) v = Math.min(v, D[p + W - 1] + 1.4142); } D[p] = v; }
    for (let p = 0; p < N; p++) if (D[p] > 1.5) D[p] += nz.n2((p % W) * 0.045, ((p / W) | 0) * 0.045) * 1.6;
    const GOLD = ID.gold;
    const rowInfo = (p, x, y) => { const l = lab[p], s = REG[l][2], d = D[p]; if (l === GOLD && d >= 2 * s) { const rv = (y + nz.n2(x * 0.012, y * 0.03) * 3) / s, row = Math.floor(rv); return [1000 + row, rv - row, s, d - 2 * s]; } const row = Math.floor(d / s); return [row, d / s - row, s, 99]; };
    const CS = 16, GW = Math.ceil(W / CS), GH = Math.ceil(H_ / CS), grid = Array.from({ length: GW * GH }, () => []);
    const SX = [], SY = [], SL = [], SR = [], SW = [], SC = [], SG = [], LT = [], RT = [];
    const near = (x, y, l, row, rad) => { const cx = (x / CS) | 0, cy = (y / CS) | 0; for (let j = cy - 1; j <= cy + 1; j++) for (let i = cx - 1; i <= cx + 1; i++) { if (i < 0 || j < 0 || i >= GW || j >= GH) continue; for (const s of grid[j * GW + i]) if (SL[s] === l && SR[s] === row && (SX[s] - x) ** 2 + (SY[s] - y) ** 2 < rad * rad) return true; } return false; };
    const GOLDS = [[198, 154, 60], [214, 172, 76], [226, 188, 92], [186, 142, 52], [238, 204, 112], [206, 160, 64]];
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const p = y * W + x; if (td[p * 4] === 255) continue; // never laid in this layer
      const l = lab[p], [row, fr0, s] = rowInfo(p, x, y);
      if (Math.abs(fr0 - 0.5) * s > 0.6) continue;
      const rad = s * (0.82 + 0.3 * rnd()); if (near(x, y, l, row, rad)) continue;
      const i = SX.length; SX.push(x); SY.push(y); SL.push(l); SR.push(row); SW.push(0.88 + 0.26 * rnd());
      const reg = REG[l]; let col;
      if (reg[3] === 'gold') { col = rnd.pick(GOLDS).slice(); if (rnd.chance(0.05)) col = [150, 112, 42]; SG.push(rnd.chance(0.14) ? rnd.range(0, 6.28) : -1); }
      else { const v = 1 + rnd.gauss() * 0.06; col = reg[1].map((c) => H.clamp(c * v + rnd.gauss() * 6, 0, 255)); SG.push(-1); }
      SC.push(col);
      const o = p * 4, kind = td[o + 2], lay = td[o] / 255 * 15, rem = td[o + 1] / 255 * 15;
      LT.push(lay + (kinds[kind] ? kinds[kind](x, y, l) : 0) + rnd() * 0.04); RT.push(rem >= 14.9 ? sceneRem + (x - 60) / 1160 * 0.55 : rem);
      grid[((y / CS) | 0) * GW + ((x / CS) | 0)].push(i);
    }
    const OWN = new Int32Array(N), GRT = new Uint8Array(N), BR = new Float32Array(N), KK = new Float32Array(N), SIN = new Uint8Array(N);
    const Lx = -0.6, Ly = -0.8;
    for (let y = 0; y < H_; y++) { const cy = (y / CS) | 0; for (let x = 0; x < W; x++) {
      const p = y * W + x, l = lab[p], d = D[p]; SIN[p] = d < 1.7 ? 1 : 0;
      if (td[p * 4] === 255) { OWN[p] = -1; continue; }
      const [row, fr, s, zoneEdge] = rowInfo(p, x, y), cx = (x / CS) | 0;
      let b1 = 1e9, b2 = 1e9, i1 = -1, f1 = 1e9, fi = -1;
      for (let j = cy - 1; j <= cy + 1; j++) { if (j < 0 || j >= GH) continue; for (let i = cx - 1; i <= cx + 1; i++) { if (i < 0 || i >= GW) continue; const cell = grid[j * GW + i]; for (let k = 0; k < cell.length; k++) { const sd = cell[k]; if (SL[sd] !== l) continue; const dd = Math.sqrt((SX[sd] - x) ** 2 + (SY[sd] - y) ** 2) * SW[sd]; if (SR[sd] === row) { if (dd < b1) { b2 = b1; b1 = dd; i1 = sd; } else if (dd < b2) b2 = dd; } else if (dd < f1) { f1 = dd; fi = sd; } } } }
      let sameRow = true; if (i1 < 0) { i1 = fi; b1 = f1; sameRow = false; }
      OWN[p] = i1; if (i1 < 0) { GRT[p] = 1; BR[p] = 0.85; continue; }
      const edge = Math.min(sameRow ? Math.min(fr, 1 - fr) * s : 99, (b2 - b1) * 0.5, d, zoneEdge), g = (1.05 + 0.35 * nz.n2(x * 0.3, y * 0.3)) * (s < 8 ? 0.5 + 0.5 * (s - 5) / 3 : 1);
      if (edge < g) { GRT[p] = 1; BR[p] = 0.75 + 0.2 * nz.n2(x * 0.5, y * 0.5) + 0.1 * (edge / g); continue; }
      let vx = x - SX[i1], vy = y - SY[i1]; const vm = Math.hypot(vx, vy) || 1; vx /= vm; vy /= vm;
      const k = H.clamp(1 - (edge - g) / 2.6);
      BR[p] = (1 + k * k * (vx * Lx + vy * Ly) * 0.3 - k * 0.06 + nz.n2(x * 0.7, y * 0.7) * 0.03) * (0.94 + 0.12 * ((SX[i1] * 7.13 + SY[i1] * 3.71) % 1)); KK[p] = k;
    } }
    // wet lime setting bed: cloudy putty, trowel drag marks and grains of sand aggregate
    if (!MX_BED || MX_BED.length !== N) { MX_BED = new Float32Array(N); const BED = MX_BED, br = H.rng(907);
    for (let p = 0; p < N; p++) { const x = p % W, y = (p / W) | 0, tr = nz.n2(x * 0.004 + y * 0.011, y * 0.05 - x * 0.012);
      let v = 0.88 + 0.07 * nz.n2(x * 0.06, y * 0.06) + 0.05 * nz.n2(x * 0.5, y * 0.5) + 0.04 * Math.sin(tr * 9 + y * 0.35) * (0.5 + 0.5 * nz.n2(x * 0.02, y * 0.02));
      const g = br(); if (g < 0.03) v -= 0.14 + 0.1 * br(); else if (g > 0.985) v += 0.08; BED[p] = v; } }
    const BED = MX_BED;
    return (MX_SCENES[id] = { OWN, GRT, BR, KK, SIN, BED, SC, SG, LT: Float32Array.from(LT), RT: Float32Array.from(RT) });
  }
  // composite one or more scenes (newest first) into the frame
  function mxRender(ctx, W, H_, scenes, t, sinS) {
    const img = ctx.createImageData(W, H_), out = img.data, N = W * H_, top = sinS || scenes[0];
    for (let p = 0; p < N; p++) {
      const o = p * 4; out[o + 3] = 255; let done = false;
      for (let s = 0; s < scenes.length && !done; s++) {
        const S = scenes[s], i = S.OWN[p];
        if (i < 0 || t < S.LT[i] || t >= S.RT[i]) continue;
        done = true;
        const age = t - S.LT[i], wet = age < 0.2 ? (1 - age / 0.2) * 0.15 : 0;
        if (S.GRT[p]) { const g = S.BR[p] - wet * 0.6; out[o] = 122 * g; out[o + 1] = 112 * g; out[o + 2] = 96 * g; break; }
        const c = S.SC[i]; let br = S.BR[p] + wet, add = 0;
        if (S.SG[i] >= 0) { const sp = Math.pow(Math.max(0, Math.sin(t * 1.4 + S.SG[i] + (p % W) * 0.004)), 10); add = sp * 120 * (1 - S.KK[p] * 0.5); br += 0.12; }
        out[o] = Math.min(255, c[0] * br + add); out[o + 1] = Math.min(255, c[1] * br + add * 0.92); out[o + 2] = Math.min(255, c[2] * br + add * 0.6);
      }
      if (!done) { const v = top.BED[p]; if (top.SIN[p]) { out[o] = 168 * v; out[o + 1] = 80 * v; out[o + 2] = 56 * v; } else { out[o] = 192 * v; out[o + 1] = 184 * v; out[o + 2] = 164 * v; } }
    }
    ctx.putImageData(img, 0, 0);
  }
  // live tesserae laid on a regular grid (opus tessellatum) for the changing parts: counters, pointers
  function mxGrid(ctx, x0, y0, w, h, cell, drawMask, col, seed) {
    const mw = Math.ceil(w / cell), mh = Math.ceil(h / cell), M = H.layer(mw, mh), m = M.getContext('2d');
    m.scale(1 / cell, 1 / cell); m.translate(-x0, -y0); m.fillStyle = '#fff'; m.strokeStyle = '#fff'; drawMask(m);
    const d = m.getImageData(0, 0, mw, mh).data, r = H.rng(seed), base = H.hex(col);
    for (let j = 0; j < mh; j++) for (let i = 0; i < mw; i++) {
      const a = d[(j * mw + i) * 4 + 3]; const jr = r(); if (a < 110) continue;
      const v = 0.88 + jr * 0.22, x = x0 + i * cell + 0.8 + (r() - 0.5) * 0.8, y = y0 + j * cell + 0.8 + (r() - 0.5) * 0.8, s = cell - 1.8;
      ctx.fillStyle = 'rgb(118,108,92)'; ctx.fillRect(x0 + i * cell, y0 + j * cell, cell, cell);
      ctx.fillStyle = `rgb(${base[0] * v | 0},${base[1] * v | 0},${base[2] * v | 0})`; ctx.fillRect(x, y, s, s);
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x, y, s, 1.2); ctx.fillRect(x, y, 1.2, s);
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x, y + s - 1.2, s, 1.2); ctx.fillRect(x + s - 1.2, y, 1.2, s);
    }
  }
  // the icon robot (same cartoon as the still), drawn into a scene at (cx,cy) scale s
  function mxRobot(cx, F, X, Y, s, t0) {
    cx.save(); cx.translate(X, Y); cx.scale(s, s); cx.translate(-640, -300);
    const circ = (x, y, r) => { cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2); cx.fill(); };
    F('haloRing', t0, 15, 2); circ(640, 292, 202); F('haloInner', t0, 15, 2); circ(640, 292, 190); F('halo', t0, 15, 2); circ(640, 292, 179);
    [[536, 296], [744, 296]].forEach(([x, y]) => { F('outline', t0, 15, 2); circ(x, y, 25); F('copper', t0, 15, 2); circ(x, y, 18); F('outline', t0, 15, 2); circ(x, y, 6); });
    F('outline', t0, 15, 2); cx.lineWidth = 10; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(640, 190); cx.lineTo(640, 132); cx.stroke(); circ(640, 124, 22); F('red', t0, 15, 2); circ(640, 124, 15);
    F('outline', t0, 15, 2); cx.beginPath(); cx.roundRect(531, 173, 218, 232, 65); cx.fill();
    F('face', t0, 15, 2); cx.beginPath(); cx.roundRect(540, 182, 200, 214, 56); cx.fill();
    F('faceShade', t0, 15, 2); cx.save(); cx.beginPath(); cx.roundRect(540, 182, 200, 214, 56); cx.clip(); cx.beginPath(); cx.moveTo(690, 170); cx.bezierCurveTo(740, 250, 740, 330, 680, 410); cx.lineTo(760, 410); cx.lineTo(760, 170); cx.closePath(); cx.fill(); cx.restore();
    F('outline', t0, 15, 2); cx.lineWidth = 9; [[560, 236, 624, 228], [656, 228, 720, 236]].forEach(([a, b, c2, d]) => { cx.beginPath(); cx.moveTo(a, b); cx.quadraticCurveTo((a + c2) / 2, b - 16, c2, d); cx.stroke(); });
    [[594, 280], [686, 280]].forEach(([x, y]) => { F('outline', t0, 15, 2); circ(x, y, 33); F('eyeWhite', t0, 15, 2); circ(x, y, 26); F('eyeGlow', t0, 15, 2); circ(x, y, 18); F('pupil', t0, 15, 2); circ(x, y, 8); });
    F('outline', t0, 15, 2); cx.beginPath(); cx.moveTo(606, 360); cx.quadraticCurveTo(640, 370, 674, 360); cx.stroke();
    cx.restore();
  }
  function mxFrame(cx, F, lay, rem, kind) {
    F('bDark', lay, rem, kind); cx.fillRect(0, 0, 1280, 720); F('bBand', lay, rem, kind); cx.fillRect(14, 14, 1252, 692);
    F('lozenge', lay, rem, kind); const loz = (x, y) => { cx.beginPath(); cx.moveTo(x - 22, y); cx.lineTo(x, y - 12); cx.lineTo(x + 22, y); cx.lineTo(x, y + 12); cx.closePath(); cx.fill(); };
    for (let x = 50; x < 1260; x += 64) { loz(x, 33); loz(x, 687); }
    F('bInner', lay, rem, kind); cx.fillRect(48, 48, 1184, 624); F('gold', lay, rem, kind); cx.fillRect(56, 56, 1168, 608);
  }
  // lettering for tessellation: fitted to its plaque (maxW), strokes thickened so every stem spans >= 2 tile rows,
  // and (on the gold ground) a contour of pale tesserae around the letters, as in real inscriptions
  function mxText(cx, F, txt, x, y, size, name, lay, rem = 15, kind = 0, align = 'center', maxW = 0, halo = false) {
    cx.font = `700 ${size}px "Libre Baskerville"`;
    if (maxW) { const w = cx.measureText(txt).width; if (w > maxW) { size = Math.max(30, size * maxW / w); cx.font = `700 ${size}px "Libre Baskerville"`; } }
    cx.textAlign = align; cx.textBaseline = 'middle'; cx.lineJoin = 'round'; cx.lineCap = 'round';
    if (halo) { F('cream', lay, rem, kind); cx.lineWidth = Math.max(16, size * 0.2); cx.strokeText(txt, x, y); }
    F(name === 'letters' ? 'txt' : name, lay, rem, kind); cx.lineWidth = Math.min(4.6, size * (size < 40 ? 0.045 : 0.065)); cx.strokeText(txt, x, y); cx.fillText(txt, x, y);
  }
  function mxPlaque(cx, F, x, y, w, h, lay, rem = 15, kind = 0) { F('ink', lay, rem, kind); cx.beginPath(); cx.roundRect(x - 6, y - 6, w + 12, h + 12, 14); cx.fill(); F('cream', lay, rem, kind); cx.beginPath(); cx.roundRect(x, y, w, h, 10); cx.fill(); }
  function mxArrow(cx, F, pts, w, name, lay, rem = 15, kind = 1) {
    F(name, lay, rem, kind); cx.lineWidth = w; cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.beginPath(); pts.forEach((p, i) => i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1])); cx.stroke();
    const a = pts[pts.length - 1], b = pts[pts.length - 2], an = Math.atan2(a[1] - b[1], a[0] - b[0]);
    cx.beginPath(); cx.moveTo(a[0] + Math.cos(an) * w * 1.6, a[1] + Math.sin(an) * w * 1.6); cx.lineTo(a[0] + Math.cos(an + 2.3) * w * 2, a[1] + Math.sin(an + 2.3) * w * 2); cx.lineTo(a[0] + Math.cos(an - 2.3) * w * 2, a[1] + Math.sin(an - 2.3) * w * 2); cx.closePath(); cx.fill();
  }
  const mxQ = (a, m, b, n = 24) => { const o = []; for (let k = 0; k <= n; k++) { const t = k / n, u = 1 - t; o.push([u * u * a[0] + 2 * u * t * m[0] + t * t * b[0], u * u * a[1] + 2 * u * t * m[1] + t * t * b[1]]); } return o; };
  function mxAnimal(cx, F, x, y, s, isCat, lay, rem = 15) {
    const circ = (a, b, r) => { cx.beginPath(); cx.arc(a, b, r, 0, Math.PI * 2); cx.fill(); };
    cx.save(); cx.translate(x, y); cx.scale(s, s);
    if (isCat) { F('outline', lay, rem); cx.beginPath(); cx.moveTo(-40, -6); cx.lineTo(-34, -56); cx.lineTo(-8, -34); cx.lineTo(8, -34); cx.lineTo(34, -56); cx.lineTo(40, -6); cx.arc(0, 0, 40, 0, Math.PI); cx.closePath(); cx.fill(); F('tan', lay, rem); cx.beginPath(); cx.moveTo(-32, -6); cx.lineTo(-29, -42); cx.lineTo(-8, -26); cx.lineTo(8, -26); cx.lineTo(29, -42); cx.lineTo(32, -6); cx.arc(0, 0, 32, 0, Math.PI); cx.closePath(); cx.fill(); }
    else { F('outline', lay, rem); circ(-36, 4, 20); circ(36, 4, 20); circ(0, 0, 42); F('brown', lay, rem); cx.beginPath(); cx.ellipse(-36, 8, 12, 24, 0.2, 0, 7); cx.fill(); cx.beginPath(); cx.ellipse(36, 8, 12, 24, -0.2, 0, 7); cx.fill(); F('tan', lay, rem); circ(0, 0, 34); F('cream', lay, rem); cx.beginPath(); cx.ellipse(0, 16, 16, 12, 0, 0, 7); cx.fill(); }
    F('pupil', lay, rem); circ(-13, -2, 6); circ(13, -2, 6); circ(0, isCat ? 12 : 10, 5);
    cx.restore();
  }

  // ===== END EXPLAINER HELPERS =====
  registerStyle({
    id: 'mosaic',
    name: 'Byzantine Mosaic',
    category: 'Illustration',
    description: 'A Byzantine wall mosaic built from thousands of hand-cut tesserae laid in rows that echo every contour (andamento), with mortar grout, bevelled tile edges, per-tile colour variation and a glinting gold-smalti ground.',
    motion: 'Light rakes across the wall so individual gold smalti flash in turn; tiles could be laid row by row outward from the figure.',
    fonts: ['600 120px "Cormorant Garamond"', '700 46px "Libre Baskerville"', '700 72px "Cormorant Garamond"'],
    frameT: 5.4,
    duration: 5.5,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      if (!CACHE) CACHE = build(W, H_);
      const { OWN, GRT, BR, KK, BED, SIN, LT, SC, SG } = CACHE;
      const img = ctx.createImageData(W, H_), out = img.data;
      for (let p = 0, N = W * H_; p < N; p++) {
        const i = OWN[p], o = p * 4; out[o + 3] = 255;
        if (i < 0 || t < LT[i]) {
          // bare lime setting bed with the red-ochre sinopia underdrawing
          const v = BED[p];
          if (SIN[p]) { out[o] = 168 * v; out[o + 1] = 84 * v; out[o + 2] = 58 * v; }
          else { out[o] = 206 * v; out[o + 1] = 194 * v; out[o + 2] = 170 * v; }
          continue;
        }
        const age = t - LT[i], wet = age < 0.2 ? (1 - age / 0.2) * 0.3 : 0;
        if (GRT[p]) { const g = BR[p] - wet * 0.3; out[o] = 122 * g; out[o + 1] = 112 * g; out[o + 2] = 96 * g; continue; }
        const c = SC[i], k = KK[p];
        let br = BR[p] + wet, add = 0;
        if (SG[i] >= 0) { const sp = Math.pow(Math.max(0, Math.sin(t * 1.4 + SG[i] + (p % W) * 0.004)), 10); add = sp * 120 * (1 - k * 0.5); br += 0.12; }
        out[o] = Math.min(255, c[0] * br + add); out[o + 1] = Math.min(255, c[1] * br + add * 0.92); out[o + 2] = Math.min(255, c[2] * br + add * 0.6);
      }
      ctx.putImageData(img, 0, 0);
      // raking light across the wall + vignette
      const lg = ctx.createLinearGradient(0, 0, W, H_); lg.addColorStop(0, 'rgba(255,240,200,0.10)'); lg.addColorStop(0.6, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(20,10,0,0.18)');
      ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H_);
      H.vignette(ctx, W, H_, 0.42);
      H.grain(ctx, W, H_, 0.035, 2 + Math.floor(t * 12));
    },
    // ===== EXPLAINER =====
    explainerDuration: 14.5,
    explainerNote: 'Every scene is a fresh andamento-tessellated wall: tiles are laid element by element (arrows tile by tile along their length), scene changes pry the old tesserae up and re-lay the wall in a sweeping front, counters are live tesserae re-set on a grid, and gold smalti flash on the key moments.',
    explainer(ctx, W, H_, t) {
      const cl = H.clamp, ease = H.ease.inOut;
      const kinds = [null, (x) => (x - 60) / 1160 * 0.7, (x, y) => Math.hypot(x - 980, y - 330) / 260 * 0.45, (x, y) => (720 - y) / 720 * 0.5, (x) => (x - 60) / 1160 * 0.25];
      // ---- scene 1: question, then examples -> model ----
      const S0 = () => mxScene('s0', W, H_, (cx, F) => {
        mxFrame(cx, F, 0, 15, 1);
        mxText(cx, F, 'How does', 640, 290, 112, 'letters', 0.3, 1.95, 1, 'center', 0, true); mxText(cx, F, 'AI learn?', 640, 430, 112, 'letters', 0.7, 1.95, 1, 'center', 0, true);
      }, kinds);
      const S1 = () => mxScene('s1', W, H_, (cx, F) => {
        mxFrame(cx, F, 2.0, 15, 1);
        mxPlaque(cx, F, 70, 66, 440, 70, 2.0, 15, 4); mxText(cx, F, 'How does AI learn?', 290, 101, 46, 'letters', 2.15, 15, 4, 'center', 410);
        // example cards
        for (let i = 0; i < 6; i++) {
          const x = 90 + (i % 3) * 140, y = 170 + Math.floor(i / 3) * 190, lay = 2.45 + i * 0.22, isCat = [1, 0, 1, 0, 1, 1][i];
          mxPlaque(cx, F, x, y, 124, 166, lay); mxAnimal(cx, F, x + 62, y + 66, 0.95, !!isCat, lay + 0.05); mxText(cx, F, isCat ? 'cat' : 'dog', x + 62, y + 138, 36, 'letters', lay + 0.1);
        }
        mxArrow(cx, F, mxQ([520, 300], [640, 220], [740, 300]), 18, 'red', 3.6, 15, 1);
        mxArrow(cx, F, mxQ([520, 440], [640, 470], [740, 400]), 18, 'red', 3.9, 15, 1);
        mxRobot(cx, F, 980, 330, 0.95, 2.6);
        mxPlaque(cx, F, 870, 560, 220, 70, 3.0); mxText(cx, F, 'MODEL', 980, 596, 50, 'letters', 3.1, 15, 0, 'center', 196);
        mxPlaque(cx, F, 90, 568, 700, 84, 3.2); mxText(cx, F, 'examples', 770, 610, 46, 'letters', 3.3, 15, 0, 'right');
      }, kinds, 6.0);
      // ---- scene 2: guess -> check -> adjust ----
      const S2 = () => mxScene('s2', W, H_, (cx, F) => {
        mxFrame(cx, F, 6.05, 15, 1);
        mxPlaque(cx, F, 70, 66, 440, 70, 6.1, 15, 1); mxText(cx, F, 'How does AI learn?', 290, 101, 46, 'letters', 6.2, 15, 1, 'center', 410);
        mxPlaque(cx, F, 80, 240, 190, 210, 6.4); mxAnimal(cx, F, 175, 330, 1.25, true, 6.45); mxText(cx, F, 'new picture', 175, 486, 30, 'letters', 6.6, 15, 0, 'center', 0, true);
        mxArrow(cx, F, mxQ([285, 340], [320, 300], [355, 330]), 16, 'red', 6.7, 15, 1);
        mxRobot(cx, F, 520, 350, 0.7, 6.5);
        mxText(cx, F, 'GUESS', 520, 172, 52, 'letters', 6.9, 15, 0, 'center', 0, true);
        mxPlaque(cx, F, 660, 210, 190, 90, 7.0); F('cream', 7.0, 9.3); cx.beginPath(); cx.roundRect(660, 210, 190, 90, 10); cx.fill(); mxText(cx, F, 'dog?', 755, 256, 60, 'letters', 7.05, 9.3, 0, 'center', 170);
        // ("cat" + tick live in S2b, so the label map keeps "dog?" whole under the cross)
        // wrong-guess cross
        F('ink', 7.8, 9.3, 0); cx.lineWidth = 11; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(680, 220); cx.lineTo(830, 292); cx.moveTo(830, 220); cx.lineTo(680, 292); cx.stroke();
        mxArrow(cx, F, mxQ([860, 250], [900, 200], [940, 240]), 16, 'red', 7.35, 15, 1);
        mxText(cx, F, 'CHECK', 1080, 172, 52, 'letters', 7.4, 15, 0, 'center', 0, true);
        mxPlaque(cx, F, 950, 210, 250, 120, 7.5); mxText(cx, F, 'answer:', 1075, 245, 34, 'letters', 7.55, 15, 0, 'center', 230); mxText(cx, F, 'cat', 1075, 295, 52, 'green', 7.65);
        mxArrow(cx, F, mxQ([1080, 345], [1090, 520], [860, 535]), 16, 'red', 8.2, 15, 1);
        mxText(cx, F, 'error', 1150, 450, 40, 'txt', 8.4, 15, 0, 'center', 0, true);
        [[520, 530], [650, 545], [780, 530]].forEach(([x, y], i) => { F('ink', 8.4 + i * 0.08); cx.beginPath(); cx.arc(x, y, 52, 0, 7); cx.fill(); F('cream', 8.45 + i * 0.08); cx.beginPath(); cx.arc(x, y, 44, 0, 7); cx.fill(); });
        mxText(cx, F, 'ADJUST', 650, 630, 42, 'letters', 8.6, 15, 0, 'center', 0, true);
        mxArrow(cx, F, mxQ([450, 545], [350, 540], [420, 470]), 16, 'red', 9.05, 15, 1);
      }, kinds, 10.35);
      // the corrected answer: the dog? plaque re-laid underneath with "cat" + tick (nothing else in this layer is ever laid)
      const S2b = () => mxScene('s2b', W, H_, (cx, F) => {
        F('gold', 15); cx.fillRect(0, 0, W, H_);
        F('cream', 7.0); cx.beginPath(); cx.roundRect(660, 210, 190, 90, 10); cx.fill();
        mxText(cx, F, 'cat', 735, 256, 60, 'green', 9.35); F('green', 9.5); cx.lineWidth = 12; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(790, 254); cx.lineTo(806, 272); cx.lineTo(836, 232); cx.stroke();
      }, kinds, 10.35);
      // ---- scene 3: accuracy over rounds + takeaway ----
      const accs = [61, 70, 78, 84, 89, 93, 95, 97];
      const S3 = () => mxScene('s3', W, H_, (cx, F) => {
        mxFrame(cx, F, 10.4, 15, 1);
        mxPlaque(cx, F, 70, 66, 440, 70, 10.45, 15, 1); mxText(cx, F, 'How does AI learn?', 290, 101, 46, 'letters', 10.55, 15, 1, 'center', 410);
        F('ink', 10.7); cx.fillRect(100, 576, 600, 12); cx.fillRect(100, 150, 12, 438);
        accs.forEach((a, i) => { const h = (a - 50) / 50 * 400, x = 130 + i * 70; F(i === 7 ? 'red' : 'robeLight', 10.95 + i * 0.18, 15, 3); cx.fillRect(x, 576 - h, 50, h); });
        mxText(cx, F, 'training rounds →', 400, 622, 32, 'letters', 11.0, 15, 0, 'center', 0, true);
        mxPlaque(cx, F, 770, 150, 420, 250, 10.9); mxText(cx, F, 'Accuracy', 980, 200, 50, 'letters', 11.0, 15, 0, 'center', 390);
        mxPlaque(cx, F, 770, 440, 420, 180, 13.0, 15, 4); mxText(cx, F, 'More examples →', 980, 495, 46, 'letters', 13.05, 15, 4, 'center', 390); mxText(cx, F, 'better guesses', 980, 565, 46, 'letters', 13.2, 15, 4, 'center', 390);
      }, kinds);
      const list = t < 2.8 ? [S1(), S0()] : t < 6.0 ? [S1()] : t < 10.4 ? [S2(), S2b(), S1()] : [S3(), S2(), S2b()];
      mxRender(ctx, W, H_, list, t, t < 2.8 ? list[1] : list[0]);
      // ---- live tesserae ----
      if (t > 3.3 && t < 6.2) {
        const e = ease(cl((t - 3.3) / 2.5)), v = t >= 5.8 ? 1000000 : Math.round(Math.pow(10, 1 + 5 * e));
        mxGrid(ctx, 110, 572, 470, 76, 6, (m) => { m.font = '700 66px "Libre Baskerville"'; m.textAlign = 'left'; m.textBaseline = 'middle'; m.lineWidth = 2.5; m.lineJoin = 'round'; m.strokeText(v.toLocaleString('en-US'), 118, 614); m.fillText(v.toLocaleString('en-US'), 118, 614); }, '#7c1e1a', Math.floor(t * 12));
      }
      if (t > 8.5 && t < 10.4) {
        const tq = Math.floor(t * 12) / 12;
        [[520, 530], [650, 545], [780, 530]].forEach(([x, y], i) => { const a0 = [-2.2, -0.6, -1.5][i], a1 = [-0.9, -2.3, -0.4][i], a = a0 + (a1 - a0) * ease(cl((tq - 8.7 - i * 0.12) / 0.6)); mxGrid(ctx, x - 48, y - 48, 96, 96, 6, (m) => { m.lineWidth = 12; m.lineCap = 'round'; m.beginPath(); m.moveTo(x, y); m.lineTo(x + Math.cos(a) * 38, y + Math.sin(a) * 38); m.stroke(); m.beginPath(); m.arc(x, y, 8, 0, 7); m.fill(); }, '#2a2a34', 40 + i); });
      }
      if (t > 10.9) {
        const pr = cl((t - 10.95) / 1.5), v = Math.round(61 + 36 * (1 - Math.pow(1 - pr, 2.3))), pop = t > 12.5 ? 1 + 0.15 * Math.pow(1 - cl((t - 12.5) / 0.3), 2) : 1;
        mxGrid(ctx, 790, 230, 380, 160, 7, (m) => { m.translate(980, 312); m.scale(pop, pop); m.font = '700 112px "Libre Baskerville"'; m.textAlign = 'center'; m.textBaseline = 'middle'; m.lineWidth = 4.5; m.lineJoin = 'round'; m.strokeText(v + '%', 0, 0); m.fillText(v + '%', 0, 0); }, v >= 97 ? '#1f6a34' : '#7c1e1a', 77);
      }
      // emphasis: gold flash on the wrong guess and on 97%
      const flash = (x, y, R, a) => { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, `rgba(255,220,140,${0.5 * a})`); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.fillRect(x - R, y - R, 2 * R, 2 * R); ctx.restore(); };
      flash(755, 256, 220, cl((t - 7.8) / 0.15) * (1 - cl((t - 8.3) / 0.4)));
      flash(980, 312, 300, cl((t - 12.5) / 0.15) * (1 - cl((t - 13.1) / 0.5)));
      // same raking light across the wall as the still
      const lg = ctx.createLinearGradient(0, 0, W, H_); lg.addColorStop(0, 'rgba(255,240,200,0.10)'); lg.addColorStop(0.6, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(20,10,0,0.18)');
      ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H_);
      H.vignette(ctx, W, H_, 0.42);
      H.grain(ctx, W, H_, 0.035, 2 + Math.floor(t * 12));
    },
    // Sound: a mosaicist's workshop with a little stone-room reverb. Tesserae are small stone/glass chips: laying a
    // sweeping front is a pattering cascade of dry clacks over a soft trowel smear in the mortar (panned with the
    // front); an element set all at once is a handful pressed in (a cluster + a dull thunk); prying a scene up is a
    // chisel scrape with chips clattering loose. The live counters re-set tiles with single clacks. No high pings.
    // Times from explainer()/mxScene above: lay times are stored as 8-bit values of t/15, so a lay time v really
    // starts at q(v); sweep kinds add (x-60)/1160*0.7 (kind 1), dist/260*0.45 from (980,330) (kind 2),
    // (720-y)/720*0.5 (kind 3), (x-60)/1160*0.25 (kind 4); a scene is pried up from sceneRem over (x-60)/1160*0.55.
    explainerSound(k) {
      // Chrome glitch: a noise buffer that starts within ~1e-8 s of a sample boundary (float error like 4.15 + 0.1 * 1 + 0.11)
      // spikes far above its gain. Put every start a quarter sample past the 48 kHz grid so none land there.
      { const k0 = k, sn = (t) => (Math.round(t * 48000) + 0.25) / 48000; k = { ...k0, play: (n, t, o) => k0.play(n, sn(t), o), tone: (t, o) => k0.tone(sn(t), o), noise: (t, o) => k0.noise(sn(t), o) }; }
      const D = 14.5, q = (v) => Math.round(v / 15 * 255) / 255 * 15, s1 = (x) => (x - 60) / 1160 * 0.7, s4 = (x) => (x - 60) / 1160 * 0.25;
      const pan = (x) => H.clamp(x / 640 - 1, -1, 1) * 0.6;
      let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      // one stone chip clacking into place
      const clack = (t, g, p, f) => { k.noise(t, { dur: 0.014, filter: 'bandpass', f, q: 2.5, gain: 0.32 * g, a: 0.0008, pan: p }); k.noise(t, { dur: 0.022, filter: 'bandpass', f: f * 0.38, q: 3, gain: 0.24 * g, a: 0.001, pan: p }); };
      // a sweeping front of tiles laid over [t0, t0+d] from x0 to x1: n clacks + trowel smear in the mortar
      const lay = (t0, d, x0, x1, n, g = 1, minor = true) => {
        const run = () => {
        for (let i = 0; i < n; i++) { const u = (i + rnd() * 0.8) / n; clack(t0 + d * u, g * (0.55 + 0.5 * rnd()), pan(x0 + (x1 - x0) * u), 1500 + rnd() * 1300); }
        k.noise(t0, { dur: d + 0.05, color: 'pink', filter: 'bandpass', f: 480, q: 0.8, gain: 0.07 * g, a: Math.min(0.08, d * 0.3), hold: d * 0.5, pan: pan((x0 + x1) / 2) });
        };
        if (minor) k.withMinor(run); else run(); // key moments stay full in voiceover mode
      };
      // an element pressed in all at once: a handful of chips + a dull thunk
      const set = (t, x, g = 1, minor = true) => {
        const run = () => { for (let i = 0; i < 4; i++) clack(t + i * 0.009 + rnd() * 0.006, g * (0.6 + 0.4 * rnd()), pan(x) + (rnd() - 0.5) * 0.2, 1500 + rnd() * 1100); k.tone(t, { f: [[0, 190], [0.05, 110]], dur: 0.07, gain: 0.12 * g, pan: pan(x) }); };
        if (minor) k.withMinor(run); else run();
      };
      // a scene pried up left to right: chisel scrape + loose chips
      const pry = (t0, d) => {
        k.noise(t0, { dur: d, filter: 'bandpass', f: [[0, 900], [d, 1400]], q: 1.6, gain: 0.12, a: 0.06, hold: d * 0.5, pan: 0 });
        for (let i = 0; i < 10; i++) { const u = (i + rnd()) / 10; clack(t0 + d * u, 0.5 + 0.3 * rnd(), pan(60 + 1160 * u), 1300 + rnd() * 900); }
      };

      k.bed('room', 0, D, { gain: 0.4 });

      // ---- scene 0: the gold field is laid L -> R (0 -> 0.7), then the two lines of letters
      lay(0, 0.7, 60, 1220, 26, 0.9, false);
      lay(q(0.3) + s1(400), s1(880) - s1(400), 400, 880, 10, 1.1); // "How does"
      lay(q(0.7) + s1(430), s1(850) - s1(430), 430, 850, 10, 1.2, false); // "AI learn?"
      // the letters are prised out at once (1.94), then scene 1 is laid over it L -> R (2.0 -> 2.7)
      k.noise(q(1.95), { dur: 0.12, filter: 'bandpass', f: 1100, q: 1.4, gain: 0.14 }); set(q(1.95), 640, 0.9, false);
      lay(q(2.0), 0.7, 60, 1220, 22, 0.8);
      lay(q(2.0), 0.1, 70, 510, 3, 0.7); lay(q(2.15) + 0.02, 0.07, 150, 430, 3, 0.6); // header plaque + text
      // six example cards pressed in (2.45 + i*0.22), their animals (+0.05) and labels (+0.1)
      for (let i = 0; i < 6; i++) { const x = 152 + (i % 3) * 140; set(q(2.45 + i * 0.22), x, 0.9); set(q(2.5 + i * 0.22) + 0.01, x, 0.5); }
      lay(q(2.6), 0.42, 900, 1060, 9, 0.8); // the robot radiates out from its centre
      set(q(3.0), 980, 0.8); set(q(3.1), 980, 0.6); set(q(3.2), 440, 0.8); set(q(3.3), 700, 0.6); // MODEL + examples plaques
      lay(q(3.6) + s1(520), s1(740) - s1(520), 520, 740, 5, 0.9); lay(q(3.9) + s1(520), s1(740) - s1(520), 520, 740, 5, 0.9); // red arrows
      // live counter 10 -> 1,000,000 (3.3 -> 5.8): one clack per tile re-set while it runs, faster mid-count
      for (let t = 3.36; t < 5.75;) { const e = H.clamp((t - 3.3) / 2.5), sp = Math.min(1, 6 * e * (1 - e)); clack(t, 0.5 + 0.35 * sp, pan(340), 1700 + e * 500); t += 1 / (4 + 8 * sp); }
      set(5.8, 340, 1.4, false); k.play('thud', 5.8, { f: 130, gain: 0.35, pan: pan(340) }); // 1,000,000 set

      // ---- scene 1 pried up (6.0 -> 6.55) while scene 2's field is laid (6.06 -> 6.76)
      pry(6.0, 0.55);
      lay(q(6.05), 0.7, 60, 1220, 20, 0.7);
      lay(q(6.1) + 0.002, 0.27, 70, 510, 5, 0.6); // header
      set(q(6.4), 175, 0.9); set(q(6.45), 175, 0.6); set(q(6.6), 175, 0.5); // new picture
      lay(q(6.7) + s1(285), 0.05, 285, 355, 3, 0.8); // arrow
      lay(q(6.5) + 0.62, 0.35, 420, 620, 8, 0.7); // the robot (radiates from far right, so it fills in late)
      set(q(6.9), 520, 0.7); set(q(7.0), 755, 0.9); set(q(7.05), 755, 0.8); // GUESS, plaque, "dog?"
      set(q(7.4), 1080, 0.7); set(q(7.5), 1075, 0.8); set(q(7.55), 1075, 0.5); set(q(7.65), 1075, 0.7); // CHECK, answer: cat
      // WRONG: the dark cross is set over "dog?" with a gold flash (7.77)
      set(q(7.8), 755, 1.6, false);
      k.play('thud', q(7.8), { f: 100, gain: 0.55, pan: pan(755) });
      k.play('error', q(7.8), { f: 'E3', gain: 0.45, pan: pan(755) });
      k.noise(7.8, { dur: 0.5, color: 'pink', filter: 'bandpass', f: 1100, q: 4, gain: 0.05, a: 0.1, verb: 0.4, pan: pan(755), minor: true }); // the gold glints
      lay(q(7.35) + s1(860), s1(940) - s1(860), 860, 940, 3, 0.7); // CHECK arrow finishes just after
      lay(q(8.2) + s1(860), s1(1090) - s1(860), 860, 1090, 6, 0.8); // error arrow back
      set(q(8.4), 1150, 0.5); // 'error'
      [8.4, 8.48, 8.56].forEach((t0, i) => set(q(t0), [520, 650, 780][i], 0.75)); set(q(8.6), 650, 0.6); // dials + ADJUST
      // dial needles turn on twos (8.7 + i*0.12, 0.6 s each): one clack per moving frame
      for (let f = Math.floor(8.7 * 12) + 1; f / 12 < 9.45; f++) clack(f / 12, 0.6, pan([520, 650, 780][f % 3]), 1300 + (f % 3) * 200);
      lay(q(9.05) + s1(350), 0.06, 350, 450, 3, 0.8); // arrow back to the guess
      // CORRECTION: "dog?" and the cross prised out (9.29), "cat" set (9.35), green tick (9.53)
      k.noise(q(9.3), { dur: 0.1, filter: 'bandpass', f: 1100, q: 1.4, gain: 0.12, pan: pan(755) });
      set(q(9.35), 735, 1.1, false); set(q(9.5), 813, 1.1, false);
      k.play('success', q(9.5), { f: 'G4', gain: 0.6, pan: pan(780) });

      // ---- scene 2 pried up (10.35 -> 10.9), scene 3 laid (10.41 -> 11.11)
      pry(10.35, 0.55);
      lay(q(10.4), 0.7, 60, 1220, 20, 0.7);
      set(q(10.7), 150, 0.8); set(q(10.9), 980, 0.8); set(q(11.0), 980, 0.5); // axes, Accuracy plaque + label
      // eight bars rise bottom-up (q(10.95 + 0.18i) + 0.1 .. + h/720*0.5)
      [61, 70, 78, 84, 89, 93, 95, 97].forEach((a, i) => { const h = (a - 50) / 50 * 400; lay(q(10.95 + i * 0.18) + 0.1, h / 720 * 0.5, 155 + i * 70, 155 + i * 70, 3 + Math.round(h / 120), i === 7 ? 1.1 : 0.8); });
      { let last = 61, lastT = -1; // accuracy tiles re-set per new value, <= 12/s (reaches 97 near 12.22)
        for (let t = 10.95; t < 12.45; t += 1 / 120) { const v = Math.round(61 + 36 * (1 - Math.pow(1 - H.clamp((t - 10.95) / 1.5), 2.3))); if (v !== last && t - lastT >= 1 / 12) { clack(t, 0.7, pan(980), 1500 + (v - 61) * 15); last = v; lastT = t; } } }
      // 97% pops with a gold flash (12.5): the big hit
      k.play('impact', 12.5, { gain: 1.05, pan: pan(980) });
      set(12.5, 980, 1.6, false);
      k.play('ding', 12.52, { f: 'C5', gain: 0.45, pan: pan(980) }); k.play('ding', 12.52, { f: 'G4', gain: 0.35, pan: pan(980) });
      // takeaway plaque + two lines laid (13.15 -> 13.4), resolves
      lay(q(13.0) + s4(764), s4(1196) - s4(764), 764, 1196, 6, 0.8);
      lay(q(13.05) + 0.16, 0.07, 800, 1160, 4, 0.8); lay(q(13.2) + 0.16, 0.07, 800, 1160, 4, 0.9, false);
      ['C4', 'G4', 'E5'].forEach((f, i) => k.play('ding', 13.42 + i * 0.1, { f, gain: 0.55 - i * 0.05, pan: pan(980) + (i - 1) * 0.2 }));
    },

    // ===== END EXPLAINER =====
  });
}
```
