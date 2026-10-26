I want an animated explainer made in the "Linocut Relief Print" visual style (Print). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Archivo Black, Caveat, Kalam
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Caveat:wght@400;700&family=Kalam:wght@400;700&display=block">
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
Name: Linocut Relief Print
Family: Print
Look: A hand-carved two-colour relief print: tapering white gouge strokes cut from dense black, parallel carving for tone, a red reduction layer, salty uneven ink on cream rice paper, signed and numbered in pencil.
Motion: The proof is pulled twice — the red sheet peels back diagonally, then the black key — then the edition number, title and signature are pencilled in while a raking glint slides across the wet ink and the camera eases in.
How it explains: Each beat is a newly carved block pulled as a fresh proof that peels back over the last one; arrows are gouged channels (the error path printed red), counters are carved numerals re-cut on twos, and emphasis is the printmaker's own pencil circle and margin note.

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

REFERENCE STYLE SOURCE (styles/linocut.js; W/H_ are always 1280x720)
```js
{
  // ---------- Two-colour linocut (reduction red + black key) on rice paper ----------
  const PAPER = [240, 232, 212];
  const RED = [196, 58, 38];
  const INKK = [26, 23, 22];
  const BX0 = 250, BY0 = 30, BX1 = 1030, BY1 = 578; // block
  const CX = 640, CY = 232, R = 126;               // bulb

  // tapered stroke along a parametric path P(s) -> [x,y]
  const tapered = (x, P, w, prof, N = 14) => {
    const L = [], Rr = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N, a = P(Math.max(0, s - 0.01)), b = P(Math.min(1, s + 0.01)), p = P(s);
      let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const ww = (w * prof(s)) / 2;
      L.push([p[0] - dy * ww, p[1] + dx * ww]); Rr.push([p[0] + dy * ww, p[1] - dx * ww]);
    }
    x.beginPath(); x.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < L.length; i++) x.lineTo(L[i][0], L[i][1]);
    for (let i = Rr.length - 1; i >= 0; i--) x.lineTo(Rr[i][0], Rr[i][1]);
    x.closePath(); x.fill();
  };
  const lens = (s) => Math.pow(Math.sin(Math.PI * s), 0.6);
  const tail = (s) => Math.min(1, s * 7) * Math.pow(1 - s, 0.9);
  const quad = (x0, y0, cx, cy, x1, y1) => (s) => [(1 - s) * (1 - s) * x0 + 2 * (1 - s) * s * cx + s * s * x1, (1 - s) * (1 - s) * y0 + 2 * (1 - s) * s * cy + s * s * y1];
  const line = (x0, y0, x1, y1, bend) => { const nx = -(y1 - y0), ny = x1 - x0; return quad(x0, y0, (x0 + x1) / 2 + nx * bend, (y0 + y1) / 2 + ny * bend, x1, y1); };

  const bulbPath = (x) => {
    x.beginPath();
    x.arc(CX, CY, R, Math.PI * 0.72, Math.PI * 0.28 + Math.PI * 2, false);
    x.bezierCurveTo(CX + 78, CY + 128, CX + 54, CY + 140, CX + 52, CY + 168);
    x.lineTo(CX - 52, CY + 168);
    x.bezierCurveTo(CX - 54, CY + 140, CX - 78, CY + 128, CX + R * Math.cos(Math.PI * 0.72), CY + R * Math.sin(Math.PI * 0.72));
    x.closePath();
  };
  const hillF = (xx) => 446 + Math.pow((xx - 610) / 230, 2) * 34;
  const hillB = (xx) => 418 + Math.pow((xx - 930) / 140, 2) * 26;
  const leaf = (x, x0, y0, x1, y1, bend) => {
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, nx = -(y1 - y0), ny = x1 - x0;
    x.beginPath(); x.moveTo(x0, y0);
    x.quadraticCurveTo(mx + nx * bend, my + ny * bend, x1, y1);
    x.quadraticCurveTo(mx - nx * bend * 0.45, my - ny * bend * 0.45, x0, y0); x.closePath();
  };

  const lowField = (W, H_, seed, gw, gh, f) => {
    const nz = H.makeNoise(seed), s = H.layer(gw, gh), sx = s.getContext('2d'), im = sx.createImageData(gw, gh);
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      const i = (y * gw + x) * 4;
      im.data[i] = 128 + 127 * H.clamp(nz.fbm2(x * f, y * f, 3) * 1.7, -1, 1);
      im.data[i + 1] = 128 + 127 * H.clamp(nz.fbm2(x * f * 2.3 + 17, y * f * 0.6, 2) * 1.7, -1, 1);
      im.data[i + 2] = 128 + 127 * H.clamp(nz.n2(x * f * 3 + 5, y * f * 3 + 9) * 1.4, -1, 1);
      im.data[i + 3] = 255;
    }
    sx.putImageData(im, 0, 0);
    const b = H.layer(W, H_), bx = b.getContext('2d'); bx.imageSmoothingQuality = 'high'; bx.drawImage(s, 0, 0, W, H_);
    return bx.getImageData(0, 0, W, H_).data;
  };

  // ================= EXPLAINER: a run of proofs, each pulled from a newly carved block =================
  const LE = H.ease, lcl = H.clamp, lseg = (t, a, b) => lcl((t - a) / (b - a));
  const KX0 = 64, KY0 = 34, KX1 = 1216, KY1 = 586;            // block area
  const PULL = [0, 2.25, 5.85, 10.35, 12.95], PEEL = 0.8;     // a new proof is pulled at each time
  let LX_CACHE = null;
  const lhash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };

  // carving vocabulary
  const carveText = (k, s, font, x, y, align = 'center', ls = 4, jitSeed = 1) => {
    const r = H.rng(jitSeed); k.font = font; k.textBaseline = 'middle'; k.letterSpacing = ls + 'px';
    const tw = k.measureText(s).width; let cx = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x;
    k.textAlign = 'left';
    for (const ch of s) { const cw = k.measureText(ch).width; k.save(); k.translate(cx, y + r.range(-1.5, 1.5)); k.rotate(r.range(-0.03, 0.03)); k.fillText(ch, 0, 0); k.restore(); cx += cw; }
    k.letterSpacing = '0px';
  };
  const gougeArrow = (k, P, u, w) => { // tapered carved stroke along P with a carved head, drawn up to u
    if (u <= 0) return;
    const Q = (s) => P(s * u);
    tapered(k, Q, w, (s) => Math.min(1, s * 8) * (0.7 + 0.3 * s), 22);
    const e = P(u), b = P(Math.max(0, u - 0.03)), a = Math.atan2(e[1] - b[1], e[0] - b[0]), hs = w * 2.4;
    k.beginPath(); k.moveTo(e[0] + Math.cos(a) * hs, e[1] + Math.sin(a) * hs); k.lineTo(e[0] + Math.cos(a + 2.4) * hs, e[1] + Math.sin(a + 2.4) * hs); k.lineTo(e[0] + Math.cos(a - 2.4) * hs, e[1] + Math.sin(a - 2.4) * hs); k.closePath(); k.fill();
  };
  const raysAround = (k, cx, cy, r0, r1, n, seed, w = 16) => { const r = H.rng(seed); for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + r.range(-0.03, 0.03); const long = i % 2 === 0; tapered(k, line(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * (long ? r1 : r0 + (r1 - r0) * 0.5), cy + Math.sin(a) * (long ? r1 : r0 + (r1 - r0) * 0.5), r.range(-0.02, 0.02)), long ? w : w * 0.55, lens); } };
  const chips = (k, n, seed, avoid) => { const r = H.rng(seed); for (let i = 0; i < n; i++) { const x0 = r.range(KX0 + 24, KX1 - 24), y0 = r.range(KY0 + 24, KY1 - 24); if (avoid && avoid(x0, y0)) continue; const a = r.range(-0.5, 0.5), l = r.range(5, 12); tapered(k, line(x0, y0, x0 + Math.cos(a) * l, y0 + Math.sin(a) * l, 0.15), r.range(2, 4), lens, 4); } };
  // hand-cut gouge chatter for open black fields, placed where a cutter actually leaves it: echo nicks radiating
  // just outside a carved shape (ring) and short clearing cuts along the inside of the block border (edge)
  const nick = (k, x, y, a, l, w, r) => tapered(k, line(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, r.range(-0.06, 0.06)), w, lens, 6);
  const chatterRing = (k, cx, cy, r0, r1, n, seed, avoid) => {
    const r = H.rng(seed);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, rr = r0 + r() * r() * (r1 - r0), x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr, l = r.range(12, 30) * (1 - (rr - r0) / (r1 - r0) * 0.5);
      if (avoid && (avoid(x, y) || avoid(x + Math.cos(a) * l, y + Math.sin(a) * l))) continue;
      nick(k, x, y, a + r.range(-0.08, 0.08), l, r.range(3, 6), r);
      if (r.chance(0.45)) nick(k, x + Math.cos(a + 1.57) * 9, y + Math.sin(a + 1.57) * 9, a + r.range(-0.1, 0.1), l * r.range(0.5, 0.85), r.range(2.5, 4.5), r);
    }
  };
  const chatterEdge = (k, n, seed, avoid) => {
    const r = H.rng(seed), x0 = KX0 + 20, y0 = KY0 + 20, x1 = KX1 - 20, y1 = KY1 - 20;
    for (let i = 0; i < n; i++) {
      const side = Math.floor(r() * 4), u = r();
      const [x, y, a] = side === 0 ? [H.lerp(x0, x1, u), y0, Math.PI / 2] : side === 1 ? [H.lerp(x0, x1, u), y1, -Math.PI / 2] : side === 2 ? [x0, H.lerp(y0, y1, u), 0] : [x1, H.lerp(y0, y1, u), Math.PI];
      const l = r.range(10, 26), aa = a + r.range(-0.35, 0.35);
      if (avoid && (avoid(x, y) || avoid(x + Math.cos(aa) * l, y + Math.sin(aa) * l))) continue;
      nick(k, x, y, aa, l, r.range(3, 5.5), r);
    }
  };
  // carved animal tile: paper square with the animal left standing in black lines, red label strip
  const tile = (k, rd, cx, cy, s, kind, label) => {
    const h = s / 2;
    k.globalCompositeOperation = 'destination-out'; k.fillRect(cx - h, cy - h, s, s * 1.25); k.globalCompositeOperation = 'source-over';
    k.fillStyle = '#000'; k.strokeStyle = '#000'; k.lineWidth = Math.max(3, s * 0.05); k.lineCap = 'round'; k.lineJoin = 'round';
    k.beginPath(); k.arc(cx, cy, s * 0.28, 0, 7); k.stroke();
    if (kind === 'cat') { k.beginPath(); k.moveTo(cx - s * 0.24, cy - s * 0.12); k.lineTo(cx - s * 0.22, cy - s * 0.4); k.lineTo(cx - s * 0.05, cy - s * 0.26); k.moveTo(cx + s * 0.24, cy - s * 0.12); k.lineTo(cx + s * 0.22, cy - s * 0.4); k.lineTo(cx + s * 0.05, cy - s * 0.26); k.stroke(); k.beginPath(); for (const sg of [-1, 1]) { k.moveTo(cx + sg * s * 0.08, cy + s * 0.08); k.lineTo(cx + sg * s * 0.4, cy + s * 0.05); k.moveTo(cx + sg * s * 0.08, cy + s * 0.12); k.lineTo(cx + sg * s * 0.38, cy + s * 0.16); } k.stroke(); }
    else { for (const sg of [-1, 1]) { k.beginPath(); k.ellipse(cx + sg * s * 0.28, cy, s * 0.08, s * 0.18, sg * 0.4, 0, 7); k.fill(); } k.beginPath(); k.ellipse(cx, cy + s * 0.1, s * 0.06, s * 0.045, 0, 0, 7); k.fill(); }
    k.beginPath(); k.arc(cx - s * 0.1, cy - s * 0.04, s * 0.035, 0, 7); k.arc(cx + s * 0.1, cy - s * 0.04, s * 0.035, 0, 7); k.fill();
    // label strip: the black is cleared, so it prints as clean vermilion with the letters cut from the red block
    rd.fillRect(cx - h, cy + h, s, s * 0.25);
    if (label) { rd.globalCompositeOperation = 'destination-out'; carveText(rd, label, `400 ${Math.round(s * (label === '?' ? 0.21 : 0.17))}px "Archivo Black"`, cx, cy + h + s * 0.125, 'center', 2, s | 0); rd.globalCompositeOperation = 'source-over'; }
  };
  // the model: a carved head-sized ring with a neuron web inside, plus three dials
  const brain = (k, rd, cx, cy, r, dials, glow) => {
    k.globalCompositeOperation = 'destination-out';
    k.lineWidth = 9; k.beginPath(); k.arc(cx, cy, r, 0, 7); k.stroke();
    const nodes = [[-0.5, -0.35], [0.1, -0.55], [0.55, -0.2], [-0.15, 0.0], [0.4, 0.3], [-0.55, 0.25], [0.05, 0.5]];
    k.lineWidth = 5; k.beginPath();
    [[0, 1], [1, 2], [0, 3], [1, 3], [2, 4], [3, 4], [3, 5], [5, 6], [4, 6], [2, 3]].forEach(([a, b]) => { k.moveTo(cx + nodes[a][0] * r, cy + nodes[a][1] * r); k.lineTo(cx + nodes[b][0] * r, cy + nodes[b][1] * r); });
    k.stroke();
    nodes.forEach(([a, b]) => { k.beginPath(); k.arc(cx + a * r, cy + b * r, r * 0.08, 0, 7); k.fill(); });
    k.globalCompositeOperation = 'source-over';
    rd.beginPath(); rd.arc(cx, cy, r - 6, 0, 7); rd.fill();
    if (dials) dials.forEach((a, i) => {
      const dx = cx + (i - 1) * r * 0.62, dy = cy + r + 52;
      k.globalCompositeOperation = 'destination-out'; k.beginPath(); k.arc(dx, dy, 30, 0, 7); k.fill(); k.globalCompositeOperation = 'source-over';
      k.lineWidth = 8; k.lineCap = 'round'; k.beginPath(); k.moveTo(dx, dy); k.lineTo(dx + Math.cos(a) * 24, dy + Math.sin(a) * 24); k.stroke();
      k.lineWidth = 3; k.beginPath(); k.arc(dx, dy, 26, 0, 7); k.stroke();
    });
    if (glow) { k.globalCompositeOperation = 'destination-out'; raysAround(k, cx, cy, r + 14, r + 70, 30, 9, 8); k.globalCompositeOperation = 'source-over'; }
  };

  // draw scene si's two blocks (black key into k, red into rd) at time t
  const scene = (si, k, rd, t) => {
    const st = Math.floor(t * 12) / 12; // stop-motion: each re-pull on twos
    k.fillStyle = '#000'; rd.fillStyle = '#000'; k.strokeStyle = '#000';
    // block
    k.fillRect(KX0, KY0, KX1 - KX0, KY1 - KY0);
    k.globalCompositeOperation = 'destination-out'; k.lineWidth = 4; k.strokeRect(KX0 + 14, KY0 + 14, KX1 - KX0 - 28, KY1 - KY0 - 28); k.globalCompositeOperation = 'source-over';
    const out = () => { k.globalCompositeOperation = 'destination-out'; k.fillStyle = '#000'; }, inn = () => { k.globalCompositeOperation = 'source-over'; k.fillStyle = '#000'; };
    // reduction band: black cleared inside a rim (kept off the carved border), red block fills it; band(y0[, y1])
    const band = (y0, y1 = KY1 - 18) => {
      k.fillRect(KX0 + 18, y0, KX1 - KX0 - 36, y1 - y0);
      out(); k.fillRect(KX0 + 24, y0 + 6, KX1 - KX0 - 48, y1 - y0 - 12); inn();
      rd.fillRect(KX0 + 24, y0 + 6, KX1 - KX0 - 48, y1 - y0 - 12);
    };
    // letters cut from the red block: paper-coloured type on the vermilion band
    const redText = (str, font, x, y, ls, seed) => { rd.globalCompositeOperation = 'destination-out'; carveText(rd, str, font, x, y, 'center', ls, seed); rd.globalCompositeOperation = 'source-over'; rd.fillStyle = '#000'; };
    if (si === 0) {
      rd.beginPath(); rd.arc(640, 270, 230, 0, 7); rd.fill();
      out(); raysAround(k, 640, 270, 175, 640, 44, 3, 18); chips(k, 120, 5, (x, y) => Math.hypot(x - 640, y - 270) < 300 || y > 470);
      k.beginPath(); k.arc(640, 270, 160, 0, 7); k.fill(); inn();
      k.font = '400 270px "Archivo Black"'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('?', 646, 290);
      band(480);
      redText('HOW DOES AI LEARN?', '400 58px "Archivo Black"', 640, 532, 8, 11);
    }
    if (si === 1) {
      brain(k, rd, 960, 250, 150, null, false);
      out(); carveText(k, 'MODEL', '400 32px "Archivo Black"', 960, 440, 'center', 8, 4); inn();
      out(); gougeArrow(k, quad(150, 360, 470, 120, 790, 250), LE.out(lseg(st, 2.9, 3.4)), 12); inn();
      // tiles ride the arrow into the model, re-cut each frame
      for (let j = 0; j < 9; j++) {
        const t0 = 3.0 + j * 0.34, u = lseg(st, t0, t0 + 1.3); if (u <= 0 || u >= 1) continue;
        const q = quad(150, 330, 470, 90, 820, 230)(u), kind = j % 3 === 1 ? 'dog' : 'cat';
        tile(k, rd, q[0], q[1] - 40, 150 * (1 - u * 0.45), kind, kind.toUpperCase());
      }
      chips(k, 60, 6, (x, y) => y > 440 || Math.hypot(x - 960, y - 260) < 230);
      out(); chatterRing(k, 960, 250, 168, 232, 70, 61, (x, y) => y > 405 || x > KX1 - 30 || (x < 840 && y < 320)); chatterEdge(k, 34, 62, (x, y) => y > 460 || (x < 360 && y < 120)); inn();
      // counter band
      band(476);
      const n = Math.round(1e6 * Math.pow(lseg(st, 3.1, 5.4), 2.3));
      redText(n.toLocaleString('en-US') + ' EXAMPLES', '400 64px "Archivo Black"', 640, 530, 4, 13);
    }
    if (si === 2) {
      const right = st >= 9.05;
      tile(k, rd, 200, 230, 190, 'cat', '?');
      const adj = LE.inOut(lseg(st, 8.3, 8.9));
      brain(k, rd, 600, 230, 140, [-2.2 + adj * 1.9, -0.6 - adj * 1.4, 0.8 + adj * 2.3], right);
      out();
      gougeArrow(k, line(310, 230, 440, 230, -0.15), LE.out(lseg(st, 6.45, 6.8)), 12);
      if (st > 6.6) carveText(k, 'GUESS', '400 30px "Archivo Black"', 375, 140, 'center', 6, 21);
      gougeArrow(k, line(760, 230, 860, 200, -0.1), LE.out(lseg(st, 6.85, 7.1)), 12);
      // answer card
      if (st > 7.0) { k.fillRect(880, 120, 280, 170); }
      inn();
      if (st > 7.0) {
        k.font = '400 80px "Archivo Black"'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText(right ? 'cat' : 'dog?', 1020, 205);
        if (!right && st > 7.45) { const u = LE.out(lseg(st, 7.45, 7.6)); rd.save(); rd.translate(1130, 135); rd.scale(u, u); rd.lineWidth = 22; rd.lineCap = 'round'; rd.strokeStyle = '#000'; rd.beginPath(); rd.moveTo(-36, -36); rd.lineTo(36, 36); rd.moveTo(36, -36); rd.lineTo(-36, 36); rd.stroke(); rd.restore(); }
        if (right) { const u = LE.back(lseg(st, 9.05, 9.3)); rd.save(); rd.translate(1130, 135); rd.scale(u, u); rd.lineWidth = 22; rd.lineCap = 'round'; rd.lineJoin = 'round'; rd.strokeStyle = '#000'; rd.beginPath(); rd.moveTo(-34, 0); rd.lineTo(-10, 26); rd.lineTo(36, -30); rd.stroke(); rd.restore(); }
      }
      out();
      if (st > 7.45) carveText(k, 'CHECK', '400 30px "Archivo Black"', 1020, 330, 'center', 6, 22);
      // error travels back: carved return channel, printed red
      const ra = LE.inOut(lseg(st, 7.9, 8.4));
      const back = quad(1020, 380, 900, 520, 720, 440);
      gougeArrow(k, back, ra, 22);
      if (st > 8.1) carveText(k, 'ADJUST', '400 30px "Archivo Black"', 930, 545, 'center', 6, 23);
      chips(k, 70, 7, (x, y) => (x > 860 && y < 360) || (x < 330 && y < 400) || Math.hypot(x - 600, y - 280) < 260 || y > 380);
      chatterRing(k, 600, 230, 158, 215, 60, 71, (x, y) => y > 395 || Math.abs(y - 230) < 34 || (y < 165 && x < 470) || x > 860);
      chatterEdge(k, 40, 72, (x, y) => (x > 860 && y < 300) || (x < 310 && y < 380) || (x > 820 && x < 1040 && y > 515) || (x > 280 && x < 470 && y < 165));
      inn();
      if (ra > 0) { rd.save(); rd.lineWidth = 30; rd.lineCap = 'round'; rd.beginPath(); for (let i = 0; i <= 20 * ra; i++) { const q = back(i / 20); i ? rd.lineTo(q[0], q[1]) : rd.moveTo(q[0], q[1]); } rd.stroke(); rd.restore(); }
      // keep the loop alive: the knob turns again on each cycle
    }
    if (si === 3) {
      const X0 = 150, Y0 = 470, CW = 560, CHh = 360;
      const prog = LE.inOut(lseg(st, 10.9, 12.3));
      const acc = (u) => 61 + 36 * (1 - Math.exp(-u * 3.2)) / (1 - Math.exp(-3.2));
      const yv = (v) => Y0 - ((v - 50) / 50) * CHh;
      // red fill under the curve (red block), hatch carved over it in the black block
      out(); k.beginPath(); k.moveTo(X0, Y0); for (let i = 0; i <= 60 * prog; i++) { const u = i / 60; k.lineTo(X0 + u * CW, yv(acc(u))); } k.lineTo(X0 + prog * CW, Y0); k.closePath(); k.fill(); inn();
      rd.beginPath(); rd.moveTo(X0, Y0); for (let i = 0; i <= 60 * prog; i++) { const u = i / 60; rd.lineTo(X0 + u * CW, yv(acc(u))); } rd.lineTo(X0 + prog * CW, Y0); rd.closePath(); rd.fill();
      k.save(); k.beginPath(); k.moveTo(X0, Y0); for (let i = 0; i <= 60 * prog; i++) { const u = i / 60; k.lineTo(X0 + u * CW, yv(acc(u))); } k.lineTo(X0 + prog * CW, Y0); k.closePath(); k.clip();
      for (let j = 0; j < 30; j++) { k.fillRect(X0, yv(acc(1)) + j * 13, CW, 4.5 + j * 0.12); }
      k.restore();
      out();
      k.lineWidth = 6; k.beginPath(); k.moveTo(X0, Y0 - CHh - 10); k.lineTo(X0, Y0); k.lineTo(X0 + CW + 20, Y0); k.stroke();
      if (prog > 0) tapered(k, (s) => { const u = s * prog; return [X0 + u * CW, yv(acc(u)) - 4]; }, 12, (s) => Math.min(1, s * 10), 40);
      carveText(k, 'TRAINING ROUNDS', '400 26px "Archivo Black"', X0 + CW / 2, Y0 + 32, 'center', 4, 31);
      carveText(k, 'ACCURACY', '400 34px "Archivo Black"', 950, 130, 'center', 10, 32);
      const v = Math.round(61 + 36 * prog);
      carveText(k, v + '%', '400 190px "Archivo Black"', 950, 290, 'center', -4, 33);
      if (st > 12.3) raysAround(k, 950, 290, 210, 330, 26, 11, 9);
      chatterEdge(k, 46, 81, (x, y) => (x > 140 && x < 740 && y > 470 && y < 530) || (x > 700 && y < 140) || x > 720);
      { const uh = 22 * LE.out(lseg(st, 12.3, 12.5)); if (uh > 0) k.fillRect(800, 390, 300, uh); } // clear the black so the underline prints vermilion
      inn();
      rd.fillRect(800, 390, 300, 22 * LE.out(lseg(st, 12.3, 12.5)));
    }
    if (si === 4) {
      out(); raysAround(k, 640, 300, 60, 760, 48, 41, 18); inn();
      k.fillRect(KX0 + 18, 140, KX1 - KX0 - 36, 120);
      rd.fillRect(560, 250, 160, 110);
      band(350, 470);
      out();
      k.lineWidth = 4; k.strokeRect(KX0 + 40, 154, KX1 - KX0 - 80, 92);
      carveText(k, 'MORE EXAMPLES', '400 78px "Archivo Black"', 640, 202, 'center', 4, 41);
      gougeArrow(k, line(640, 262, 640, 330, 0), LE.out(lseg(st, 13.5, 13.8)), 18);
      inn();
      redText('BETTER GUESSES', '400 78px "Archivo Black"', 640, 412, 4, 42);
    }
  };

  const linoExplainer = (ctx, W, H_, t) => {
    if (!LX_CACHE) {
      const paper = H.layer(W, H_), px = paper.getContext('2d'), r = H.rng(12);
      px.fillStyle = `rgb(${PAPER})`; px.fillRect(0, 0, W, H_); px.lineCap = 'round';
      for (let i = 0; i < 520; i++) {
        const x0 = r.range(-40, W + 40), y0 = r.range(-40, H_ + 40), a = r.range(0, Math.PI * 2), l = r.range(30, 170);
        px.strokeStyle = r.chance(0.65) ? `rgba(255,252,240,${r.range(0.25, 0.6)})` : `rgba(150,128,90,${r.range(0.08, 0.2)})`; px.lineWidth = r.range(0.5, 1.6);
        px.beginPath(); px.moveTo(x0, y0); px.bezierCurveTo(x0 + Math.cos(a) * l * 0.3 + r.range(-15, 15), y0 + Math.sin(a) * l * 0.3 + r.range(-15, 15), x0 + Math.cos(a) * l * 0.7 + r.range(-15, 15), y0 + Math.sin(a) * l * 0.7 + r.range(-15, 15), x0 + Math.cos(a) * l, y0 + Math.sin(a) * l); px.stroke();
      }
      LX_CACHE = { paper: px.getImageData(0, 0, W, H_).data, f1: lowField(W, H_, 31, 160, 90, 0.09), f2: lowField(W, H_, 57, 426, 240, 0.35) };
    }
    const { paper, f1, f2 } = LX_CACHE;
    let cur = 0; for (let i = 0; i < PULL.length; i++) if (t >= PULL[i]) cur = i;
    const peeling = t < PULL[cur] + PEEL, prev = cur - 1;
    const front = peeling ? LE.inOut(lseg(t, PULL[cur], PULL[cur] + PEEL)) * 1900 - 150 : 1e9;
    const masks = (si) => {
      if (si < 0) return null;
      const kc = H.layer(W, H_), k = kc.getContext('2d'), rc = H.layer(W, H_), rd = rc.getContext('2d');
      scene(si, k, rd, t);
      rd.globalCompositeOperation = 'destination-out'; rd.fillRect(0, 0, W, KY0 + 16); rd.fillRect(0, KY1 - 16, W, H_); rd.fillRect(0, 0, KX0 + 16, H_); rd.fillRect(KX1 - 16, 0, W, H_);
      const blur = (c, dx, dy, b) => { const o = H.layer(W, H_), ox = o.getContext('2d'); ox.filter = `blur(${b}px)`; ox.drawImage(c, dx, dy); return ox.getImageData(0, 0, W, H_).data; };
      return { km: blur(kc, 0, 0, 1.1), rm: blur(rc, 3, -2, 1.3) };
    };
    const A = masks(cur), B = peeling ? masks(prev) : null;
    // pencil: running title in the margin, proof numbers, and correction circles for emphasis
    const pc = H.layer(W, H_), p = pc.getContext('2d'); p.fillStyle = '#000'; p.strokeStyle = '#000';
    const write = (t0, dur, x0, w, fn) => { const u = lseg(t, t0, t0 + dur); if (u <= 0) return; p.save(); p.beginPath(); p.rect(x0 - 6, 0, (w + 12) * u, H_); p.clip(); fn(); p.restore(); };
    write(1.2, 0.8, KX0 + 6, 330, () => { p.font = '400 34px "Caveat"'; p.textAlign = 'left'; p.fillText('How does AI learn?', KX0 + 6, 632); });
    p.font = '400 24px "Kalam"'; p.textAlign = 'right';
    write(PULL[cur] + 0.5, 0.25, KX1 - 120, 120, () => { p.fillText(`proof ${cur + 1}/5`, KX1 - 6, 630); });
    const circ = (cx, cy, rx, ry, u) => { if (u <= 0) return; p.lineWidth = 5; p.beginPath(); for (let i = 0; i <= 50 * u; i++) { const a = -2.4 + (i / 50) * 7.2; const px = cx + Math.cos(a) * rx * (1 + 0.05 * Math.sin(i)), py = cy + Math.sin(a) * ry; i ? p.lineTo(px, py) : p.moveTo(px, py); } p.stroke(); };
    if (cur === 2 && t < 9.05) { circ(1020, 205, 175, 95, lseg(t, 7.55, 7.95)); if (t > 7.9) { p.font = '400 30px "Caveat"'; p.textAlign = 'left'; p.fillText("wrong — it's a cat", 640, 632); } }
    if (cur === 3) { circ(950, 290, 230, 140, lseg(t, 12.35, 12.75)); }
    if (cur === 1) write(5.2, 0.45, 640, 230, () => { p.font = '400 30px "Caveat"'; p.textAlign = 'left'; p.fillText('labelled examples', 640, 632); });
    if (cur === 4) write(14.0, 0.7, 760, 300, () => { p.font = '400 36px "Caveat"'; p.textAlign = 'left'; p.fillText('M. Okonkwo', 860, 634); });
    const pm = p.getImageData(0, 0, W, H_).data;

    const img = ctx.createImageData(W, H_), d = img.data;
    const step = Math.floor(t * 12);
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      let cr = paper[i], cg = paper[i + 1], cb = paper[i + 2];
      const tooth = (f2[i] - 128) / 128, broad = (f1[i] - 128) / 128, streak = (f1[i + 1] - 128) / 128, fine = (f2[i + 2] - 128) / 128;
      const hh = lhash(x, y, 1);
      const pg = 1 + (hh - 0.5) * 0.05 + tooth * 0.015 + streak * 0.018 + broad * 0.012;
      cr *= pg; cg *= pg; cb *= pg;
      const u = x * 0.85 + y * 0.55;
      const M = u < front ? A : B;
      let inkC = 0;
      if (peeling && x > KX0 - 12 && x < KX1 + 12 && y > KY0 - 12 && y < KY1 + 12) { const q = (u - front - 14) / 22; const sh = 1 - 0.14 * Math.exp(-q * q); cr *= sh; cg *= sh; cb *= sh; }
      if (M) {
        const ra = M.rm[i + 3] / 255;
        if (ra > 0.02) {
          let cov = lcl((ra - (0.5 + fine * 0.22)) * 4 + 0.5);
          let dens = 0.8 + broad * 0.14 + (lhash(x, y, 2 + step) - 0.5) * 0.18;
          if (tooth + (lhash(x >> 1, y >> 1, 3) - 0.5) * 0.9 > 0.62) dens *= 0.25;
          cov *= lcl(dens);
          cr = cr * (1 - cov) + (cr * RED[0] / 255) * cov; cg = cg * (1 - cov) + (cg * RED[1] / 255) * cov; cb = cb * (1 - cov) + (cb * RED[2] / 255) * cov;
          inkC = cov * 0.55;
        }
        const ka = M.km[i + 3] / 255;
        if (ka > 0.02) {
          let cov = lcl((ka - (0.5 + fine * 0.25 + (hh - 0.5) * 0.12)) * 4.5 + 0.5);
          let dens = 0.95 + broad * 0.06 + streak * 0.04 + (lhash(x, y, 4 + step) - 0.5) * 0.08;
          const salt = tooth * 0.75 + (lhash(x >> 1, y, 5) - 0.5) * 0.7 + Math.max(0, broad) * 0.35;
          if (salt > 0.7) dens *= 0.15; else if (salt > 0.55) dens *= 0.7;
          cov *= lcl(dens);
          cr = cr * (1 - cov) + INKK[0] * cov; cg = cg * (1 - cov) + INKK[1] * cov; cb = cb * (1 - cov) + INKK[2] * cov;
          if (cov > inkC) inkC = cov;
        }
      }
      const pa = pm[i + 3] / 255;
      if (pa > 0.02) { // graphite: warm grey on paper; over ink only a faint silvery sheen
        const g = pa * (0.45 + 0.45 * hh) * (tooth > 0.2 ? 0.6 : 1) * (1 - 0.68 * inkC);
        const gr = 78 + 52 * inkC, gg = 72 + 54 * inkC, gb = 66 + 56 * inkC;
        cr = cr * (1 - g) + gr * g; cg = cg * (1 - g) + gg * g; cb = cb * (1 - g) + gb * g; }
      d[i] = cr; d[i + 1] = cg; d[i + 2] = cb; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    H.vignette(ctx, W, H_, 0.12, '90,70,40');
  };

  registerStyle({
    id: 'linocut',
    name: 'Linocut Relief Print',
    category: 'Print',
    description: 'A hand-carved two-colour relief print: tapering white gouge strokes cut from dense black, parallel carving for tone, a red reduction layer, salty uneven ink on cream rice paper, signed and numbered in pencil.',
    motion: 'The proof is pulled twice — the red sheet peels back diagonally, then the black key — then the edition number, title and signature are pencilled in while a raking glint slides across the wet ink and the camera eases in.',
    fonts: ['400 44px "Archivo Black"', '400 24px "Kalam"', '400 36px "Caveat"'],
    duration: 5.5,
    frameT: 5.3,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Each beat is a newly carved block pulled as a fresh proof that peels back over the last one; arrows are gouged channels (the error path printed red), counters are carved numerals re-cut on twos, and emphasis is the printmaker\'s own pencil circle and margin note.',
    explainer(ctx, W, H_, t) { linoExplainer(ctx, W, H_, t); },
    // Sound: a printmaker's bench. Every scene change is a proof peeled off a freshly inked block (tacky crackle
    // under the sheet lifting), gouged arrows and channels are the scrape of a V-gouge through lino, carved
    // numerals tick like small chisel nicks, the pencil scratches out notes and the signature, and the hits are
    // the wooden thump of the press. Timings mirror PULL / PEEL / scene() / linoExplainer above. scene() runs on
    // twos (st = floor(t*12)/12), so on-screen events are snapped to the next 1/12 s step with q()/qq().
    // Voiceover mode: room bed drops; tile nicks, counter nicks, pencil and tack crackle are minor.
    explainerSound(k) {
      const D = 15;
      const q = (t) => Math.ceil(t * 12 - 1e-6) / 12;   // first step with st >= t
      const qq = (t) => Math.floor(t * 12 + 1e-6) / 12 + 1 / 12; // first step with st > t
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.6;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      const rnd = H.rng(808);
      // V-gouge scraping through lino: dense crunchy grains + a low body, a tiny chip flick at the end
      const gouge = (t, d, g, p, minor) => {
        const run = () => {
          for (let x = 0; x < d; x += 0.016 + rnd() * 0.012) k.noise(t + x, { dur: 0.03, filter: 'bandpass', f: 1000 + rnd() * 700, q: 1.3, gain: 0.2 * g * (0.6 + rnd() * 0.5), a: 0.004, pan: p });
          k.noise(t, { dur: d, color: 'brown', filter: 'lowpass', f: 420, gain: 0.22 * g, a: Math.min(0.05, d * 0.2), hold: d * 0.6, pan: p });
          k.noise(t + d, { dur: 0.025, filter: 'bandpass', f: 1900, q: 1.5, gain: 0.18 * g, a: 0.001, pan: p }); // chip flicks off
        };
        if (minor) k.withMinor(run); else run();
      };
      // a carved letter / numeral nick: short dry knock, low
      const nick = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1300 + rnd() * 300, q: 1.6, gain: 0.3 * g, a: 0.001, pan: p }); k.tone(t, { f: 190, dur: 0.04, gain: 0.08 * g, pan: p }); });
      // pulling a proof: the press lets go, the sheet peels back off tacky ink over PEEL seconds
      const peel = (t0, first) => {
        if (!first) k.play('press', t0, { gain: 0.3 });
        k.play('paper', t0 + 0.14, { dur: PEEL - 0.16, gain: 0.7 }); // sheet lifts as the peel gathers speed
        k.noise(t0, { dur: PEEL, color: 'pink', filter: 'bandpass', f: [[0, 400], [PEEL * 0.6, 900], [PEEL, 500]], q: 0.8, gain: 0.12, a: PEEL * 0.4 });
        k.withMinor(() => { for (let x = 0.03; x < PEEL; x += 0.008 + rnd() * 0.02) { const env = Math.sin(Math.PI * x / PEEL); k.noise(t0 + x, { dur: 0.006, filter: 'bandpass', f: 1500 + rnd() * 900, q: 1, gain: 0.22 * env * (0.4 + rnd() * 0.6), a: 0.001, pan: (rnd() - 0.5) * 0.6 }); } });
      };
      const pencil = (t, d, g, p) => k.play('stroke', t, { material: 'pencil', dur: d, gain: g, pan: p, minor: true });

      k.bed('room', 0, D, { gain: 0.22 });

      // ---- proof 1: HOOK
      k.play('press', 0.0, { gain: 0.4 });
      peel(PULL[0], true);
      pencil(PULL[0] + 0.5, 0.25, 0.6, 0.6); // "proof 1/5"
      pencil(1.2, 0.8, 0.7, -0.5); // running title pencilled in the margin

      // ---- proof 2: DATA
      peel(PULL[1]);
      pencil(PULL[1] + 0.5, 0.25, 0.6, 0.6);
      gouge(qq(2.9), 0.5, 1, pan(470)); // channel gouged toward the model
      for (let j = 0; j < 9; j++) nick(qq(3.0 + j * 0.34), 0.8, pan(150)); // each tile cut in
      // counter n = 1e6 * lseg(st, 3.1, 5.4)^2.3, re-cut on twos: nicks speeding up, <= ~11/s
      for (let t = q(3.17); t < 5.36; ) { const s = lseg(t, 3.1, 5.4); nick(t, 0.6 + 0.3 * s, pan(640)); t = q(t + 0.19 - 0.1 * s); }
      k.play('press', q(5.4), { gain: 0.75, pan: pan(640) }); // 1,000,000 EXAMPLES
      k.noise(q(5.4), { dur: 0.05, filter: 'bandpass', f: 1200, q: 1, gain: 0.3, a: 0.001, pan: pan(640) });
      pencil(5.2, 0.45, 0.6, 0.1); // "labelled examples"

      // ---- proof 3: GUESS / CHECK / ADJUST
      peel(PULL[2]);
      pencil(PULL[2] + 0.5, 0.25, 0.6, 0.6);
      gouge(qq(6.45), 0.35, 0.9, pan(375));
      nick(qq(6.6), 0.9, pan(375)); // GUESS
      gouge(qq(6.85), 0.25, 0.7, pan(810));
      k.play('tock', qq(7.0), { f: 360, gain: 0.5, pan: pan(1020) }); // answer card "dog?"
      // wrong: the red X prints, then a low muted two-note
      k.play('stamp', qq(7.45), { gain: 0.8, pan: pan(1130) });
      k.play('error', qq(7.45) + 0.12, { f: 'E3', gain: 0.75, pan: pan(1100) });
      pencil(7.55, 0.4, 0.75, pan(1020)); // pencil circle round the wrong answer
      pencil(7.95, 0.3, 0.5, 0); // margin note
      gouge(qq(7.9), 0.5, 1.2, pan(870)); // wide return channel, printed red
      nick(qq(8.1), 0.8, pan(930)); // ADJUST
      for (let i = 1; i <= 5; i++) k.play('tock', q(when(8.3, 8.9, LE.inOut, i / 5)), { f: 520 + i * 25, gain: 0.35, pan: pan(600), minor: true }); // dials turn
      // correction: the tick prints and the model's rays are cut out
      k.play('tock', q(9.05), { f: 300, gain: 0.5, pan: pan(1130) });
      k.play('success', when(9.05, 9.3, LE.back, 1), { f: 'C5', gain: 0.45, pan: pan(1000) });

      // ---- proof 4: ACCURACY
      peel(PULL[3]);
      pencil(PULL[3] + 0.5, 0.25, 0.6, 0.6);
      gouge(q(10.9), 1.4, 0.45, pan(430), true); // the curve is carved along as it climbs
      for (let t = q(10.92), last = 61, lastT = -1; t < 12.32; t += 1 / 12) { const v = Math.round(61 + 36 * LE.inOut(lseg(t, 10.9, 12.3))); if (v !== last && t - lastT >= 0.1) { nick(t, 0.9, pan(950)); last = v; lastT = t; } }
      // 97%: the rays cut and the red bar prints. Biggest hit: the press comes down hard
      k.play('impact', qq(12.3), { gain: 1.2, pan: pan(950) });
      k.play('press', qq(12.3), { gain: 0.9, pan: pan(950) });
      pencil(12.35, 0.4, 0.8, pan(950)); // pencil circle

      // ---- proof 5: TAKEAWAY
      peel(PULL[4]);
      pencil(PULL[4] + 0.5, 0.25, 0.6, 0.6);
      gouge(qq(13.5), 0.3, 0.8, 0); // arrow gouged down
      ['C4', 'G4', 'C5', 'E5'].forEach((f, i) => k.play('ding', 13.8 + i * 0.06, { f, gain: 0.36 - i * 0.05, pan: (i - 1.5) * 0.2 }));
      pencil(14.0, 0.7, 1.2, 0.35); // signed M. Okonkwo
    },
    draw(ctx, W, H_, t) {
      const rng = H.rng(12);
      const spin = (t - 5.3) * 0.01;

      // ================= BLACK KEY BLOCK =================
      const kc = H.layer(W, H_), k = kc.getContext('2d');
      const nzE = H.makeNoise(4);
      // block with slightly wavy, rounded edges
      k.fillStyle = '#000'; k.beginPath();
      const edge = (u, v) => nzE.n2(u * 0.03, v * 0.03) * 2.2;
      for (let x = BX0; x <= BX1; x += 10) k.lineTo(x, BY0 + edge(x, 0));
      for (let y = BY0; y <= BY1; y += 10) k.lineTo(BX1 + edge(0, y), y);
      for (let x = BX1; x >= BX0; x -= 10) k.lineTo(x, BY1 + edge(x, 9));
      for (let y = BY1; y >= BY0; y -= 10) k.lineTo(BX0 + edge(9, y), y);
      k.closePath(); k.fill();

      const carve = () => { k.globalCompositeOperation = 'destination-out'; };
      const ink = () => { k.globalCompositeOperation = 'source-over'; };
      k.fillStyle = '#000';

      // inner border line carved
      carve(); k.strokeStyle = '#000'; k.lineWidth = 4;
      k.beginPath(); k.rect(BX0 + 15, BY0 + 15, BX1 - BX0 - 30, BY1 - BY0 - 30); k.stroke();

      // sky rays: alternating long lens gouges and short flicks
      k.save(); k.beginPath(); k.rect(BX0 + 19, BY0 + 19, BX1 - BX0 - 38, BY1 - BY0 - 38); k.clip();
      const NR = 46;
      for (let i = 0; i < NR; i++) {
        const a = (i / NR) * Math.PI * 2 + spin + rng.range(-0.02, 0.02);
        const long = i % 2 === 0;
        const r0 = long ? rng.range(168, 180) : rng.range(205, 230);
        const r1 = long ? rng.range(560, 640) : rng.range(300, 380);
        const w = long ? rng.range(15, 21) : rng.range(8, 12);
        const bend = rng.range(-0.02, 0.02);
        tapered(k, line(CX + Math.cos(a) * r0, CY + Math.sin(a) * r0, CX + Math.cos(a) * r1, CY + Math.sin(a) * r1, bend), w, long ? (s) => Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.15)), 0.5) * (1 - s * 0.35) : lens);
        if (long && rng.chance(0.4)) { const rr = rng.range(300, 460), aa = a + rng.range(-0.04, 0.04); tapered(k, line(CX + Math.cos(aa) * rr, CY + Math.sin(aa) * rr, CX + Math.cos(aa) * (rr + 26), CY + Math.sin(aa) * (rr + 26), 0.05), 3, lens, 5); }
      }
      // halo: ring of short gouge dashes hugging the bulb
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2 + spin * 2, r0 = 142 + (i % 2) * 6;
        tapered(k, line(CX + Math.cos(a) * r0, CY + Math.sin(a) * r0, CX + Math.cos(a + 0.05) * (r0 + 14), CY + Math.sin(a + 0.05) * (r0 + 14), 0.1), 6, lens, 6);
      }
      // scattered carving chips in the far sky
      for (let i = 0; i < 140; i++) {
        const x0 = rng.range(BX0 + 24, BX1 - 24), y0 = rng.range(BY0 + 24, 420);
        if (Math.hypot(x0 - CX, y0 - CY) < 300) continue;
        const a = rng.range(-0.5, 0.5) + (rng.chance(0.5) ? 0 : Math.PI / 2), l = rng.range(5, 13);
        tapered(k, line(x0, y0, x0 + Math.cos(a) * l, y0 + Math.sin(a) * l, 0.15), rng.range(2, 4), lens, 4);
      }
      // carved stars
      for (const [sx, sy, ss] of [[330, 92, 14], [960, 110, 12], [905, 330, 9], [372, 300, 10], [470, 70, 7], [1000, 230, 8]]) {
        for (let j = 0; j < 4; j++) { const a = j * Math.PI / 4; tapered(k, line(sx - Math.cos(a) * ss, sy - Math.sin(a) * ss, sx + Math.cos(a) * ss, sy + Math.sin(a) * ss, 0), j % 2 ? 3 : 5, lens, 6); }
      }
      k.restore();

      // bulb glass carved out
      bulbPath(k); k.fill();
      ink();
      // contour hatching (left standing) on the shadow side of the glass
      k.save(); bulbPath(k); k.clip();
      for (let j = 0; j < 7; j++) {
        const rr = R - 6 - j * 11, a0 = -0.95 + j * 0.06, a1 = 1.3 - j * 0.05;
        tapered(k, (s) => { const a = a0 + (a1 - a0) * s; return [CX + 6 + Math.cos(a) * rr, CY + Math.sin(a) * rr]; }, 9 - j * 1.1, lens, 20);
      }
      // a few on the lower-left
      for (let j = 0; j < 3; j++) {
        const rr = R - 8 - j * 12;
        tapered(k, (s) => { const a = 2.0 + s * 0.9; return [CX + Math.cos(a) * rr, CY + Math.sin(a) * rr]; }, 5 - j, lens, 12);
      }
      k.restore();
      // glass outline left standing as a strong black rim (slightly uneven)
      k.lineWidth = 7; k.strokeStyle = '#000'; bulbPath(k); k.stroke();
      // filament + supports
      k.lineWidth = 5; k.lineJoin = 'round'; k.lineCap = 'round';
      k.beginPath(); k.moveTo(CX - 22, CY + 168); k.lineTo(CX - 26, CY + 60); k.lineTo(CX - 34, CY + 10);
      k.moveTo(CX + 22, CY + 168); k.lineTo(CX + 26, CY + 60); k.lineTo(CX + 34, CY + 10); k.stroke();
      k.lineWidth = 4.5; k.beginPath(); k.moveTo(CX - 34, CY + 10);
      for (let i = 1; i <= 8; i++) k.lineTo(CX - 34 + i * 8.5, CY + 10 + (i % 2 ? -16 : 0));
      k.stroke();

      // screw base: black, with carved thread gouges + highlight
      k.beginPath(); k.moveTo(CX - 54, CY + 166); k.lineTo(CX + 54, CY + 166); k.lineTo(CX + 50, CY + 222); k.lineTo(CX - 50, CY + 222); k.closePath(); k.fill();
      carve();
      for (let j = 0; j < 4; j++) {
        const y = CY + 178 + j * 12;
        tapered(k, quad(CX - 50, y + 2, CX, y - 6, CX + 48, y + 4), 6, tail, 12);
      }
      tapered(k, line(CX - 38, CY + 172, CX - 36, CY + 218, 0), 7, lens, 8);
      ink();

      // ground: two hills with parallel contour carving
      const groundPath = (f, y1) => { k.beginPath(); k.moveTo(BX0 + 19, y1); for (let x = BX0 + 19; x <= BX1 - 19; x += 8) k.lineTo(x, Math.min(f(x), y1)); k.lineTo(BX1 - 19, y1); k.closePath(); };
      groundPath(hillB, 520); k.fill();
      groundPath(hillF, 520); k.fill();
      carve();
      // back hill lines (denser carving = lighter)
      k.save(); groundPath(hillB, 520); k.clip();
      for (let j = 0; j < 9; j++) {
        const off = 12 + j * 9;
        tapered(k, (s) => { const x = 700 + s * 340; return [x, hillB(x) + off + Math.sin(x * 0.03 + j) * 1.5]; }, 5.5 - j * 0.25, tail, 24);
      }
      k.restore();
      // front hill: sparser lines, starting from the light (left)
      k.save(); groundPath(hillF, 520); k.clip();
      for (let j = 0; j < 6; j++) {
        const off = 14 + j * 13, xs = BX0 + 10 + j * 22, xe = 860 - j * 40;
        tapered(k, (s) => { const x = xs + s * (xe - xs); return [x, hillF(x) + off + Math.sin(x * 0.025 + j * 2) * 2]; }, 7 - j * 0.6, tail, 26);
      }
      // grass flicks along the crest
      for (let i = 0; i < 40; i++) {
        const x0 = BX0 + 30 + i * 18 + rng.range(-5, 5), y0 = hillF(x0) + 5;
        if (Math.abs(x0 - CX) < 70) continue;
        tapered(k, line(x0, y0 + 8, x0 + rng.range(-4, 6), y0 - 1, 0.1), 3.5, tail, 5);
      }
      k.restore();
      // re-cut the bulb base contact into the hill + sprouting leaves
      ink();
      const leaves = [[CX - 26, 452, CX - 190, 368, -0.3], [CX + 26, 452, CX + 186, 380, 0.28]];
      carve(); for (const [a, b, c, d, e] of leaves) { leaf(k, a, b, c, d, e); k.fill(); }
      ink();
      for (const [a, b, c, d, e] of leaves) {
        k.save(); leaf(k, a, b, c, d, e); k.clip();
        const mid = quad(a, b, (a + c) / 2 - (d - b) * e * 0.25, (b + d) / 2 + (c - a) * e * 0.25, c, d);
        tapered(k, mid, 6, tail, 16);
        for (let j = 1; j <= 5; j++) {
          const s0 = j / 6.5, [px, py] = mid(s0), [qx, qy] = mid(s0 + 0.14);
          const nx = -(d - b), ny = c - a, nl = Math.hypot(nx, ny);
          for (const sg of [1, -1]) tapered(k, line(px, py, qx + (nx / nl) * 34 * sg, qy + (ny / nl) * 34 * sg, 0.08 * sg), 3.2, tail, 6);
        }
        k.restore();
        k.lineWidth = 4; leaf(k, a, b, c, d, e); k.stroke();
      }
      k.lineWidth = 6; k.beginPath(); k.moveTo(CX, CY + 222); k.lineTo(CX, 460); k.stroke();

      // title band, letters carved out
      k.fillRect(BX0 + 19, 512, BX1 - BX0 - 38, BY1 - 19 - 512);
      carve();
      k.font = '400 40px "Archivo Black"'; k.letterSpacing = '9px'; k.textAlign = 'center'; k.textBaseline = 'middle';
      const word = 'LET IDEAS GROW';
      // hand-cut letters: each glyph slightly rotated / shifted
      let tw = k.measureText(word).width, cx0 = CX - tw / 2;
      for (const ch of word) {
        const cw = k.measureText(ch).width;
        k.save(); k.translate(cx0 + cw / 2, 543 + rng.range(-1.5, 1.5)); k.rotate(rng.range(-0.025, 0.025)); k.fillText(ch, 0, 0); k.restore();
        cx0 += cw;
      }
      k.letterSpacing = '0px';
      tapered(k, line(BX0 + 40, 543, BX0 + 120, 543, 0), 6, lens); tapered(k, line(BX1 - 120, 543, BX1 - 40, 543, 0), 6, lens);
      ink();

      // ================= RED REDUCTION BLOCK =================
      const rc = H.layer(W, H_), r = rc.getContext('2d');
      r.fillStyle = '#000'; r.beginPath();
      for (let i = 0; i <= 90; i++) { const a = (i / 90) * Math.PI * 2, rr = 268 + nzE.n2(Math.cos(a) * 2, Math.sin(a) * 2) * 14; r.lineTo(CX + Math.cos(a) * rr, CY + Math.sin(a) * rr); }
      r.closePath(); r.fill();
      r.fillRect(BX0 + 19, 512, BX1 - BX0 - 38, BY1 - 19 - 512);
      // white-hot centre carved from the red
      r.globalCompositeOperation = 'destination-out';
      r.beginPath(); r.ellipse(CX - 6, CY - 4, 66, 74, 0, 0, Math.PI * 2); r.fill();
      for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2 - 0.1; tapered(r, line(CX + Math.cos(a) * 60, CY + Math.sin(a) * 66, CX + Math.cos(a) * 98, CY + Math.sin(a) * 104, 0), 9, tail, 6); }
      r.globalCompositeOperation = 'source-over';
      // ground hills get no red
      r.globalCompositeOperation = 'destination-out';
      r.beginPath(); r.moveTo(BX0, 512); for (let x = BX0; x <= BX1; x += 8) r.lineTo(x, Math.min(hillF(x), hillB(x), 512) + 3); r.lineTo(BX1, 512); r.closePath(); r.fill();
      r.fillRect(0, 0, W, BY0 + 15); r.fillRect(0, 0, BX0 + 15, H_); r.fillRect(BX1 - 15, 0, W, H_);
      r.globalCompositeOperation = 'source-over';

      // ================= PENCIL =================
      const pc = H.layer(W, H_), p = pc.getContext('2d');
      p.fillStyle = '#000'; p.textBaseline = 'alphabetic';
      // written left-to-right, one inscription after another
      const write = (t0, dur, x0, x1, fn) => { const u = H.clamp((t - t0) / dur); if (u <= 0) return; p.save(); p.beginPath(); p.rect(x0 - 4, 590, (x1 - x0 + 8) * u, 70); p.clip(); fn(); p.restore(); };
      p.font = '400 24px "Kalam"';
      write(3.0, 0.35, BX0 + 8, BX0 + 60, () => { p.font = '400 24px "Kalam"'; p.textAlign = 'left'; p.fillText('3/20', BX0 + 8, 630); });
      write(3.45, 0.55, CX - 62, CX + 62, () => { p.font = '400 24px "Kalam"'; p.textAlign = 'center'; p.fillText('Bright Idea', CX, 630); });
      write(4.05, 0.75, BX1 - 230, BX1 - 4, () => {
        p.font = '400 36px "Caveat"'; p.textAlign = 'right'; p.fillText('M. Okonkwo  2026', BX1 - 6, 632);
        p.lineWidth = 1.4; p.beginPath(); p.moveTo(BX1 - 196, 640); p.quadraticCurveTo(BX1 - 120, 646, BX1 - 20, 636); p.stroke();
      });

      // ================= PRINT (per-pixel) =================
      // soften masks a hair so ink edges can be roughened by threshold noise
      const blurMask = (c) => { const b = H.layer(W, H_), bx = b.getContext('2d'); bx.filter = 'blur(1.1px)'; bx.drawImage(c, 0, 0); return bx.getImageData(0, 0, W, H_).data; };
      const km = blurMask(kc);
      const rcs = H.layer(W, H_), rcx = rcs.getContext('2d'); rcx.filter = 'blur(1.3px)'; rcx.drawImage(rc, 3, -2); // red slightly out of register
      const rm = rcx.getImageData(0, 0, W, H_).data;
      const pm = p.getImageData(0, 0, W, H_).data;
      const f1 = lowField(W, H_, 31, 160, 90, 0.09);   // broad ink density
      const f2 = lowField(W, H_, 57, 426, 240, 0.35);  // salt / paper tooth

      // paper base + rice-paper fibres drawn first
      ctx.fillStyle = `rgb(${PAPER})`; ctx.fillRect(0, 0, W, H_);
      ctx.lineCap = 'round';
      for (let i = 0; i < 520; i++) {
        const x0 = rng.range(-40, W + 40), y0 = rng.range(-40, H_ + 40), a = rng.range(0, Math.PI * 2), l = rng.range(30, 170);
        ctx.strokeStyle = rng.chance(0.65) ? `rgba(255,252,240,${rng.range(0.25, 0.6)})` : `rgba(150,128,90,${rng.range(0.08, 0.2)})`;
        ctx.lineWidth = rng.range(0.5, 1.6);
        ctx.beginPath(); ctx.moveTo(x0, y0);
        ctx.bezierCurveTo(x0 + Math.cos(a) * l * 0.3 + rng.range(-15, 15), y0 + Math.sin(a) * l * 0.3 + rng.range(-15, 15), x0 + Math.cos(a) * l * 0.7 + rng.range(-15, 15), y0 + Math.sin(a) * l * 0.7 + rng.range(-15, 15), x0 + Math.cos(a) * l, y0 + Math.sin(a) * l);
        ctx.stroke();
      }
      // faint plate-mark impression around the block
      if (t > 1.1) {
      ctx.strokeStyle = 'rgba(120,100,70,0.10)'; ctx.lineWidth = 2; ctx.strokeRect(BX0 - 3, BY0 - 3, BX1 - BX0 + 6, BY1 - BY0 + 6);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(BX0 - 5, BY0 - 5, BX1 - BX0 + 10, BY1 - BY0 + 10);
      }

      const img = ctx.getImageData(0, 0, W, H_), d = img.data;
      const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
      // proof pulls: each sheet peels back along a diagonal front
      const pullR = H.ease.inOut(H.clamp((t - 0.2) / 1.0)) * 1700 - 120;
      const pullK = H.ease.inOut(H.clamp((t - 1.35) / 1.3)) * 1700 - 120;
      const gpos = H.lerp(-300, 1900, H.clamp((t - 2.9) / 2.4));
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        let cr = d[i], cg = d[i + 1], cb = d[i + 2];
        const tooth = (f2[i] - 128) / 128, broad = (f1[i] - 128) / 128, streak = (f1[i + 1] - 128) / 128, fine = (f2[i + 2] - 128) / 128;
        const hh = hash(x, y, 1);
        // paper grain
        const pg = 1 + (hh - 0.5) * 0.05 + tooth * 0.015 + streak * 0.018 + broad * 0.012;
        cr *= pg; cg *= pg; cb *= pg;
        // red
        const u = x * 0.85 + y * 0.55;
        // shadow of the lifting sheet just ahead of the peel front
        const front = pullK > -100 && pullK < 1560 ? pullK : (pullR > -100 && pullR < 1560 ? pullR : -1e9);
        if (u > front - 10 && u < front + 60 && x > BX0 - 12 && x < BX1 + 12 && y > BY0 - 12 && y < BY1 + 12) { const q = (u - front - 14) / 22; const sh = 1 - 0.13 * Math.exp(-q * q); cr *= sh; cg *= sh; cb *= sh; }
        const ra = u < pullR ? rm[i + 3] / 255 : 0;
        if (ra > 0.02) {
          const thr = 0.5 + fine * 0.22;
          let cov = H.clamp((ra - thr) * 4 + 0.5);
          let dens = 0.8 + broad * 0.14 + (hash(x, y, 2) - 0.5) * 0.18;
          if (tooth + (hash(x >> 1, y >> 1, 3) - 0.5) * 0.9 > 0.62) dens *= 0.25;
          cov *= H.clamp(dens);
          cr = cr * (1 - cov) + (cr * RED[0] / 255) * cov; cg = cg * (1 - cov) + (cg * RED[1] / 255) * cov; cb = cb * (1 - cov) + (cb * RED[2] / 255) * cov;
        }
        // black key
        const ka = u < pullK ? km[i + 3] / 255 : 0;
        if (ka > 0.02) {
          const thr = 0.5 + fine * 0.25 + (hh - 0.5) * 0.12;
          let cov = H.clamp((ka - thr) * 4.5 + 0.5);
          let dens = 0.95 + broad * 0.06 + streak * 0.04 + (hash(x, y, 4) - 0.5) * 0.08;
          // salt: paper tooth showing through dense black
          const salt = tooth * 0.75 + (hash(x >> 1, y, 5) - 0.5) * 0.7 + Math.max(0, broad) * 0.35;
          if (salt > 0.7) dens *= 0.15; else if (salt > 0.55) dens *= 0.7;
          cov *= H.clamp(dens);
          const gd = (x * 0.8 + y * 0.6 - gpos) / 70, gl = Math.exp(-gd * gd) * 26 * (0.6 + 0.4 * tooth);
          cr = cr * (1 - cov) + (INKK[0] + gl) * cov; cg = cg * (1 - cov) + (INKK[1] + gl) * cov; cb = cb * (1 - cov) + (INKK[2] + gl * 1.05) * cov;
        }
        // pencil graphite (grainy, sits on the tooth)
        const pa = pm[i + 3] / 255;
        if (pa > 0.02) {
          const g = pa * (0.25 + 0.5 * hh) * (tooth > 0.2 ? 0.55 : 1);
          cr = cr * (1 - g) + 78 * g; cg = cg * (1 - g) + 78 * g; cb = cb * (1 - g) + 84 * g;
        }
        d[i] = cr; d[i + 1] = cg; d[i + 2] = cb;
      }
      ctx.putImageData(img, 0, 0);
      H.vignette(ctx, W, H_, 0.12, '90,70,40');
      const z = 1 + 0.035 * H.ease.inOut(H.clamp((t - 2.6) / 2.9));
      if (z > 1.0001) {
        const cp = H.layer(W, H_); cp.getContext('2d').drawImage(ctx.canvas, 0, 0, W, H_);
        const fx = 640, fy = 330;
        ctx.drawImage(cp, fx - fx / z, fy - fy / z, W / z, H_ / z, 0, 0, W, H_);
      }
    },
  });
}
```
