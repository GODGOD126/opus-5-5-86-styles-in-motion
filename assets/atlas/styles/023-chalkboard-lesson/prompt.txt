I want an animated explainer made in the "Chalkboard Lesson" visual style (Hand-Drawn). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Kalam, Patrick Hand
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Patrick+Hand&display=block">
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
Name: Chalkboard Lesson
Family: Hand-Drawn
Look: Dusty chalk on a green slate: grainy, broken strokes that skip over the board tooth, colored chalk accents, cloudy eraser smears from past lessons, and a worn oak frame with a dusty chalk tray.
Motion: Chalk lines scratch on with a little dust fall, the ball hops down the curve step by step, and old eraser clouds slowly drift as the board is wiped.
How it explains: A teacher-style lesson on one long slate: a chalk stick writes and draws while the camera tracks along the board (the hook is left behind, the chart is on the next stretch of board), arrows are dusty chalk strokes, numbers are re-chalked as they count, and pink chalk rings the key moments.

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

REFERENCE STYLE SOURCE (styles/chalkboard.js; W/H_ are always 1280x720)
```js
// Chalkboard — dusty chalk lesson on green slate.
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
  const wob = (pts, nz, seed, amp = 1.5, freq = 0.012) => {
    const N = normals(pts); let L = 0;
    return pts.map((p, i) => {
      if (i) L += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      const o = nz.n2(L * freq + seed * 1.37, seed * 0.71) * amp + nz.n2(L * freq * 6 + seed, seed + 3.3) * amp * 0.25;
      return [p[0] + N[i][0] * o, p[1] + N[i][1] * o];
    });
  };
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2) => {
    const n = Math.max(10, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 2.5)), out = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return out;
  };
  const quad = (p0, p1, p2, n = 40) => {
    const out = [];
    for (let i = 0; i <= n; i++) { const t = i / n, m = 1 - t; out.push([m * m * p0[0] + 2 * m * t * p1[0] + t * t * p2[0], m * m * p0[1] + 2 * m * t * p1[1] + t * t * p2[1]]); }
    return out;
  };

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
    id: 'chalkboard',
    name: 'Chalkboard Lesson',
    category: 'Hand-Drawn',
    description: 'Dusty chalk on a green slate: grainy, broken strokes that skip over the board tooth, colored chalk accents, cloudy eraser smears from past lessons, and a worn oak frame with a dusty chalk tray.',
    motion: 'Chalk lines scratch on with a little dust fall, the ball hops down the curve step by step, and old eraser clouds slowly drift as the board is wiped.',
    fonts: ['700 66px "Kalam"', '400 40px "Kalam"', '700 44px "Patrick Hand"', '400 34px "Patrick Hand"'],
    frameT: 6.4,
    duration: 6.5,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(31);
      const F = 30, TRAY = 646;

      // ---------- slate ----------
      H.paper(ctx, W, H_, '#2c4639', 17, 0.05);
      const lit = ctx.createRadialGradient(560, 260, 100, 640, 360, 900);
      lit.addColorStop(0, 'rgba(120,150,130,0.10)'); lit.addColorStop(1, 'rgba(0,10,5,0.35)');
      ctx.fillStyle = lit; ctx.fillRect(0, 0, W, H_);

      // ghost of an older lesson + eraser smears
      {
        const g = H.layer(W, H_), gc = g.getContext('2d');
        gc.fillStyle = '#e8eee6'; gc.font = '400 40px "Kalam"';
        gc.fillText('photosynthesis', 760, 120); gc.fillText('6CO2 + 6H2O', 820, 190);
        gc.fillText('Homework p. 112', 120, 600);
        gc.strokeStyle = '#e8eee6'; gc.lineWidth = 6; gc.beginPath(); gc.arc(1060, 330, 70, 0, 7); gc.stroke();
        ctx.save(); ctx.filter = 'blur(2.5px)'; ctx.globalAlpha = 0.07; ctx.drawImage(g, 0, 0); ctx.restore();
        const rr = H.rng(12);
        const sm = H.layer(W, H_), sc = sm.getContext('2d'); sc.lineCap = 'round';
        for (let i = 0; i < 26; i++) {
          // eraser swipes: arcs and figure-eights
          const x = rr.range(80, 1200), y = rr.range(70, 600), R = rr.range(60, 170), a0 = rr.range(0, 6.28);
          sc.strokeStyle = `rgba(215,228,215,${rr.range(0.035, 0.075)})`; sc.lineWidth = rr.range(45, 80);
          sc.beginPath(); sc.ellipse(x, y, R, R * rr.range(0.3, 0.7), rr.range(-0.4, 0.4), a0, a0 + rr.range(1.5, 3.5)); sc.stroke();
        }
        for (let i = 0; i < 10; i++) {
          const x = rr.range(150, 1100), y = rr.range(90, 560);
          sc.strokeStyle = `rgba(215,228,215,${rr.range(0.03, 0.05)})`; sc.lineWidth = rr.range(50, 70);
          sc.beginPath(); sc.moveTo(x, y); sc.lineTo(x + rr.range(150, 360), y + rr.range(-20, 20)); sc.stroke();
        }
        ctx.save(); ctx.filter = 'blur(7px)'; ctx.drawImage(sm, 0, 0); ctx.restore();
        // streaky texture inside smears (felt lines)
        ctx.save(); ctx.globalAlpha = 0.5; ctx.filter = 'blur(1px)';
        const st = H.layer(W, H_), stc = st.getContext('2d');
        for (let i = 0; i < 260; i++) {
          const x = rr.range(60, 1200), y = rr.range(60, 620);
          stc.strokeStyle = `rgba(220,230,220,${rr.range(0.015, 0.04)})`; stc.lineWidth = rr.range(0.8, 2);
          stc.beginPath(); stc.moveTo(x, y); stc.quadraticCurveTo(x + 40, y + rr.range(-6, 6), x + rr.range(60, 140), y + rr.range(-8, 8)); stc.stroke();
        }
        ctx.drawImage(st, 0, 0); ctx.restore();
      }

      // ---------- chalk layer ----------
      const CL = H.layer(W, H_), c = CL.getContext('2d');
      c.lineCap = 'round'; c.lineJoin = 'round';
      const COL = { w: [240, 242, 236], y: [246, 222, 120], p: [244, 150, 175], b: [150, 205, 240] };
      // chalk stroke: several parallel sub-strokes (flat of the stick) at varying pressure
      const T = (a, b) => H.clamp((t - a) / (b - a));
      let TIP = null;
      const chalk = (pts, col, w, seed, pr = 0.85, prog = 1) => {
        if (prog <= 0) return;
        let P = pts; if (prog < 1) { P = pts.slice(0, Math.max(2, Math.ceil(pts.length * prog))); TIP = P[P.length - 1]; }
        const rr = H.rng(seed), N = normals(P), rgb = COL[col];
        const n = 4;
        for (let k = 0; k < n; k++) {
          const off = (k / (n - 1) - 0.5) * w * 0.7 + rr.range(-0.5, 0.5);
          const a = pr * rr.range(0.75, 1);
          c.lineWidth = w * rr.range(0.5, 0.72);
          for (let i = 0; i < P.length - 1; i += 6) {
            const fl = 0.7 + 0.3 * nz.n2(i * 0.04 + k, seed * 0.17);
            c.strokeStyle = H.rgba(rgb, Math.min(1, a * fl));
            c.beginPath();
            for (let j = i; j <= Math.min(P.length - 1, i + 6); j++) {
              const x = P[j][0] + N[j][0] * off, y = P[j][1] + N[j][1] * off;
              j === i ? c.moveTo(x, y) : c.lineTo(x, y);
            }
            c.stroke();
          }
        }
      };
      const L = (pts, s, amp = 1.4) => wob(seg(pts), nz, s, amp);
      const write = (str, x, y, font, col, rot, seed, a = 0.95, t0 = -1, t1 = 0) => {
        c.save(); c.font = font; c.translate(x, y); c.rotate(rot);
        const rr = H.rng(seed); let px = 0;
        const nCh = Math.ceil(str.length * T(t0, t1));
        if (nCh > 0 && nCh < str.length) { const ww = c.measureText(str.slice(0, nCh)).width; TIP = [x + Math.cos(rot) * ww - Math.sin(rot) * -14, y + Math.sin(rot) * ww - 14]; }
        let ci = 0;
        for (const ch of str) {
          if (ci++ >= nCh) { px += c.measureText(ch).width; continue; }
          const w = c.measureText(ch).width;
          c.fillStyle = H.rgba(COL[col], a * rr.range(0.8, 1));
          c.save(); c.translate(px, rr.range(-1.5, 1.5)); c.rotate(rr.range(-0.04, 0.04)); c.fillText(ch, 0, 0); c.restore();
          px += w + rr.range(-0.5, 1);
        }
        c.restore();
        return px;
      };
      const arrowHead = (P, col, w, seed, len = 18, pg = 1) => {
        if (pg <= 0) return;
        const a = P[P.length - 1], b = P[Math.max(0, P.length - 6)], ang = Math.atan2(a[1] - b[1], a[0] - b[0]);
        chalk(L([[a[0] - Math.cos(ang - 0.5) * len, a[1] - Math.sin(ang - 0.5) * len], a], seed, 0.4), col, w, seed, 0.85, H.clamp(pg * 2));
        chalk(L([[a[0] - Math.cos(ang + 0.5) * len, a[1] - Math.sin(ang + 0.5) * len], a], seed + 1, 0.4), col, w, seed + 1, 0.85, H.clamp(pg * 2 - 1));
      };

      // title
      const tw = write('Gradient Descent', 84, 108, '700 66px "Kalam"', 'w', -0.015, 1, 0.95, 0.10, 0.8);
      chalk(L([[80, 128], [84 + 516, 120]], 2, 2), 'y', 6, 2, 0.85, T(0.8, 0.95));
      write('Lesson 4', 98 + 516 + 30, 100, '400 40px "Kalam"', 'b', -0.04, 3, 0.85, 0.95, 1.10);

      // axes
      const OX = 170, OY = 590;
      const yAx = L([[OX, OY + 10], [OX + 2, 190]], 4, 1.2), xAx = L([[OX - 10, OY], [800, OY - 3]], 5, 1.2);
      chalk(yAx, 'w', 8, 4, 0.85, T(1.10, 1.26)); arrowHead(yAx, 'w', 6, 40, 18, T(1.26, 1.33));
      chalk(xAx, 'w', 8, 5, 0.85, T(1.33, 1.55)); arrowHead(xAx, 'w', 6, 42, 18, T(1.55, 1.62));
      write('loss', OX - 70, 236, '400 34px "Patrick Hand"', 'w', -1.5708, 6, 0.85, 1.62, 1.70);
      write('weight  w', 680, OY + 44, '400 34px "Patrick Hand"', 'w', 0, 7, 0.85, 1.70, 1.80);

      // loss curve: a lopsided valley
      const yOn = (x) => { const u = (x - 560) / 330; return OY - 80 - 300 * u * u * (1 - 0.15 * u); };
      const valley = []; for (let x = 246; x <= 792; x += 5) valley.push([x, yOn(x)]);
      chalk(L(valley, 8, 1.6), 'w', 10, 8, 0.95, H.ease.inOut(T(1.80, 2.30)));

      // tangent "slope" at the start point (dashed)
      const x0 = 285, y0 = yOn(x0), dydx = (yOn(x0 + 1) - yOn(x0 - 1)) / 2, ang = Math.atan(dydx);
      const tl = 150;
      const tan = L([[x0 - Math.cos(ang) * tl, y0 - Math.sin(ang) * tl], [x0 + Math.cos(ang) * tl, y0 + Math.sin(ang) * tl]], 9, 0.6);
      const tanP = T(2.30, 2.46);
      for (let i = 0; i < tan.length; i += 14) chalk(tan.slice(i, i + 8), 'b', 6, 900 + i, 0.95, H.clamp(tanP * tan.length / 8 - i / 8));
      write('slope', x0 + 40, y0 - 70, '400 34px "Patrick Hand"', 'b', -0.1, 10, 0.9, 2.46, 2.55);

      // steps: ball lands (stepped), hop arc draws to the next
      const xs = [285, 388, 458, 508, 540];
      const ST = 2.55, SD = 0.18;
      for (let i = 0; i < xs.length; i++) {
        const tb = ST + i * SD;
        if (t < tb) break;
        const x = xs[i], y = yOn(x) - 12;
        for (let k = 0; k < 3; k++) chalk(wob(ell(x, y, 11 - k * 3.5, 11 - k * 3.5, 0, 6.6), nz, 100 + i * 5 + k, 0.6), 'y', 5, 100 + i * 5 + k, 0.95, T(tb + k * 0.02, tb + k * 0.02 + 0.05));
        if (i < xs.length - 1) {
          const xa = x + 10, xb = xs[i + 1] - 6, ya = y - 12, yb = yOn(xs[i + 1]) - 26;
          const hop = quad([xa, ya], [(xa + xb) / 2, Math.min(ya, yb) - 40 + i * 5], [xb, yb], 24);
          const hp = L(hop, 120 + i, 0.6);
          chalk(hp, 'y', 5.5, 120 + i, 0.95, T(tb + 0.07, tb + 0.15));
          arrowHead(hp, 'y', 5.5, 140 + i * 2, 11, T(tb + 0.15, tb + 0.18));
        }
      }
      // minimum marker
      const mx = 560, my = yOn(560);
      chalk(L(ell(mx, my + 6, 38, 22, -2, 4.6), 11, 1.2), 'p', 7, 11, 0.85, T(3.45, 3.64));
      write('min!', mx + 34, my + 64, '700 44px "Patrick Hand"', 'p', -0.08, 12, 0.95, 3.64, 3.75);

      // update rule, boxed
      const EX = 860, EY = 300;
      write('w', EX, EY, '700 44px "Patrick Hand"', 'w', 0, 13, 0.95, 3.75, 3.79);
      const la = L([[EX + 74, EY - 15], [EX + 36, EY - 14]], 14, 0.4);
      chalk(la, 'w', 6, 14, 0.85, T(3.79, 3.86)); arrowHead(la, 'w', 6, 15, 14, T(3.86, 3.92));
      write('w − α ∇L', EX + 86, EY, '700 44px "Patrick Hand"', 'w', 0, 16, 0.95, 3.92, 4.25);
      chalk(L([[EX + 134, EY + 10], [EX + 162, EY + 9]], 17, 0.4), 'y', 4, 17, 0.85, T(4.50, 4.57));
      chalk(L([[EX - 26, EY - 64], [EX + 300, EY - 70], [EX + 306, EY + 34], [EX - 22, EY + 38], [EX - 30, EY - 60]], 18, 2.2), 'p', 7, 18, 0.85, T(4.25, 4.50));
      write('α = step size', EX + 40, EY + 98, '400 34px "Patrick Hand"', 'y', -0.03, 19, 0.95, 4.57, 4.77);
      const al = L(quad([EX + 140, EY + 64], [EX + 120, EY + 40], [EX + 146, EY + 18]), 20, 0.4);
      chalk(al, 'y', 4.00, 20, 0.85, T(4.77, 4.83)); arrowHead(al, 'y', 4.00, 21, 10, T(4.83, 4.86));
      write('repeat until flat', EX - 4, EY + 160, '400 34px "Patrick Hand"', 'w', 0.0, 22, 0.85, 4.86, 5.05);
      chalk(L([[EX - 8, EY + 174], [EX + 228, EY + 170]], 23, 1), 'w', 3, 23, 0.6, T(5.05, 5.12));
      // contour-map doodle: the same descent seen from above
      {
        const cx = 1062, cy = 562, rot = -0.18, cr = Math.cos(rot), sr = Math.sin(rot);
        const R = (pts) => pts.map(([x, y]) => [cx + (x - cx) * cr - (y - cy) * sr, cy + (x - cx) * sr + (y - cy) * cr]);
        [150, 112, 76, 42, 14].forEach((rx, i) => chalk(wob(R(ell(cx + i * 6, cy, rx, rx * 0.38, 0.3 * i, 0.3 * i + 6.5)), nz, 50 + i, 1.2), 'b', 4.5, 50 + i, 0.8, T(5.05 + i * 0.03, 5.12 + i * 0.03)));
        const zz = L(R([[cx - 150, cy - 10], [cx - 104, cy + 30], [cx - 70, cy - 22], [cx - 34, cy + 18], [cx - 6, cy - 8], [cx + 18, cy + 2]]), 60, 0.8);
        chalk(zz, 'y', 4.5, 60, 0.95, T(5.25, 5.45)); arrowHead(zz, 'y', 4.5, 61, 12, T(5.45, 5.52));
      }

      // ---------- chalk grain: only the board's high points take chalk ----------
      {
        const id = c.getImageData(0, 0, W, H_), d = id.data;
        const sm = H.layer(W / 2, H_ / 2), sx = sm.getContext('2d');
        const ns = sx.createImageData(W / 2, H_ / 2), rr = H.rng(77);
        for (let i = 0; i < ns.data.length; i += 4) { const v = rr() * 255; ns.data[i] = ns.data[i + 1] = ns.data[i + 2] = v; ns.data[i + 3] = 255; }
        sx.putImageData(ns, 0, 0);
        const big = H.layer(W, H_), bx = big.getContext('2d'); bx.drawImage(sm, 0, 0, W, H_);
        const gd = bx.getImageData(0, 0, W, H_).data, r2 = H.rng(78);
        for (let i = 0, p = 0; i < d.length; i += 4, p++) {
          const a = d[i + 3] / 255; if (!a) continue;
          const x = p % W, y = (p / W) | 0;
          const g = gd[i] / 255 * 0.55 + r2() * 0.45 + nz.n2(x * 0.05, y * 0.05) * 0.12;
          const k = H.clamp((g - (1 - a) * 0.95 - 0.08) * 3.0);
          d[i + 3] = 255 * Math.min(1, a * 1.15) * k;
        }
        c.putImageData(id, 0, 0);
      }
      // dust halo around strokes then the chalk itself
      ctx.save(); ctx.filter = 'blur(4px)'; ctx.globalAlpha = 0.22; ctx.drawImage(CL, 0, 0); ctx.restore();
      ctx.drawImage(CL, 0, 0);
      // falling dust specks under writing
      {
        const rr = H.rng(90);
        for (let i = 0; i < 500; i++) {
          const x = rr.range(60, 1220), y = rr.range(60, 630);
          ctx.fillStyle = `rgba(235,240,232,${rr.range(0.05, 0.25)})`;
          ctx.fillRect(x, y, rr.range(0.8, 1.8), rr.range(0.8, 1.8));
        }
        // slowly drifting dust motes in the air (ambient life)
        for (let i = 0; i < 70; i++) {
          const x0 = rr.range(40, 1240), sp = rr.range(8, 22), ph = rr.range(0, 700);
          const y = 40 + ((ph + t * sp) % 600), x = x0 + Math.sin(t * 0.8 + i) * 8;
          ctx.fillStyle = `rgba(240,244,236,${rr.range(0.12, 0.35)})`;
          ctx.beginPath(); ctx.arc(x, y, rr.range(0.6, 1.5), 0, 7); ctx.fill();
        }
        // puff of dust where the chalk touches
        if (TIP) {
          for (let i = 0; i < 26; i++) {
            const r3 = H.rng(Math.floor(t * 30) * 100 + i);
            ctx.fillStyle = `rgba(240,244,236,${r3.range(0.15, 0.5)})`;
            ctx.fillRect(TIP[0] + r3.range(-12, 12), TIP[1] + r3.range(0, 30), r3.range(0.8, 2), r3.range(0.8, 2));
          }
        }
      }
      H.vignette(ctx, W, H_, 0.35, '0,8,4');
      // the chalk stick in hand
      if (TIP) {
        const [tx, ty] = TIP, ang = 0.8;
        ctx.save();
        ctx.save(); ctx.filter = 'blur(6px)'; ctx.fillStyle = 'rgba(0,10,5,0.4)'; ctx.translate(tx + 16, ty + 20); ctx.rotate(ang); ctx.fillRect(4, -7, 80, 14); ctx.restore();
        ctx.translate(tx, ty); ctx.rotate(ang);
        const g2 = ctx.createLinearGradient(0, -8, 0, 8); g2.addColorStop(0, '#ffffff'); g2.addColorStop(0.45, '#ecece4'); g2.addColorStop(1, '#a9aaa2');
        ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(6, -8); ctx.lineTo(86, -8); ctx.lineTo(86, 8); ctx.lineTo(6, 8); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(86, 0, 3, 8, 0, 0, 7); ctx.fill();
        ctx.restore();
      }

      // ---------- oak frame ----------
      const wood = (x, y, w, h, horiz, seed, base = [128, 84, 46]) => {
        ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
        ctx.fillStyle = H.rgba(base); ctx.fillRect(x, y, w, h);
        const rr = H.rng(seed);
        const n = 70;
        for (let i = 0; i < n; i++) {
          const o = rr() * (horiz ? h : w), dark = rr.chance(0.6);
          ctx.strokeStyle = dark ? `rgba(60,34,14,${rr.range(0.1, 0.35)})` : `rgba(210,160,100,${rr.range(0.06, 0.18)})`;
          ctx.lineWidth = rr.range(0.6, 2.2);
          ctx.beginPath();
          const len = horiz ? w : h, fq = rr.range(0.004, 0.012), amp = rr.range(0.5, 3), ph = rr.range(0, 6);
          for (let s = 0; s <= len; s += 12) {
            const off = o + Math.sin(s * fq + ph) * amp + nz.n2(s * 0.01, i) * 2;
            const px = horiz ? x + s : x + off, py = horiz ? y + off : y + s;
            s ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          }
          ctx.stroke();
        }
        // bevel shading
        const g = horiz ? ctx.createLinearGradient(0, y, 0, y + h) : ctx.createLinearGradient(x, 0, x + w, 0);
        g.addColorStop(0, 'rgba(255,220,170,0.25)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(30,15,5,0.4)');
        ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
        ctx.restore();
      };
      wood(0, 0, W, F, true, 1);
      wood(0, 0, F, TRAY, false, 2);
      wood(W - F, 0, F, TRAY, false, 3);
      // inner shadow of frame on slate
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(F, F, W - 2 * F, 5); ctx.fillRect(F, F, 5, TRAY - F);
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(F, F + 5, W - 2 * F, 4);
      // tray: ledge top + front lip
      wood(0, TRAY, W, 30, true, 4, [150, 102, 58]);
      wood(0, TRAY + 30, W, H_ - TRAY - 30, true, 5, [110, 70, 36]);
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(F, TRAY - 6, W - 2 * F, 6);
      ctx.fillStyle = 'rgba(255,230,190,0.25)'; ctx.fillRect(0, TRAY + 30, W, 1.5);
      // chalk dust on the ledge
      {
        const rr = H.rng(55);
        const dg = ctx.createLinearGradient(0, TRAY, 0, TRAY + 30);
        dg.addColorStop(0, 'rgba(235,235,225,0.32)'); dg.addColorStop(1, 'rgba(235,235,225,0.08)');
        ctx.fillStyle = dg; ctx.fillRect(F, TRAY, W - 2 * F, 30);
        for (let i = 0; i < 1400; i++) {
          const x = rr.range(F, W - F), y = TRAY + Math.pow(rr(), 1.6) * 28;
          ctx.fillStyle = `rgba(245,245,238,${rr.range(0.1, 0.5)})`; ctx.fillRect(x, y, rr.range(0.8, 2.2), rr.range(0.8, 1.6));
        }
        for (let i = 0; i < 6; i++) {
          const x = rr.range(100, 1150);
          const g = ctx.createRadialGradient(x, TRAY + 16, 2, x, TRAY + 16, 60);
          g.addColorStop(0, 'rgba(240,240,230,0.25)'); g.addColorStop(1, 'rgba(240,240,230,0)');
          ctx.fillStyle = g; ctx.fillRect(x - 60, TRAY, 120, 30);
        }
      }
      // chalk sticks
      const stick = (x, len, col, rot) => {
        ctx.save(); ctx.translate(x, TRAY + 15); ctx.rotate(rot);
        ctx.fillStyle = 'rgba(30,15,5,0.35)'; ctx.beginPath(); ctx.ellipse(len / 2 + 3, 7, len / 2 + 2, 4, 0, 0, 7); ctx.fill();
        const g = ctx.createLinearGradient(0, -7, 0, 7);
        g.addColorStop(0, H.rgba(H.mix(col, '#ffffff', 0.5))); g.addColorStop(0.4, H.rgba(col)); g.addColorStop(1, H.rgba(H.mix(col, '#000000', 0.35)));
        ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0, -7, len, 14, 6); ctx.fill();
        ctx.fillStyle = H.rgba(H.mix(col, '#ffffff', 0.3)); ctx.beginPath(); ctx.ellipse(len - 2, 0, 3, 7, 0, 0, 7); ctx.fill();
        ctx.restore();
      };
      stick(180, 96, [242, 242, 236], -0.03);
      stick(310, 44, [246, 220, 110], 0.05);
      stick(380, 62, [242, 150, 172], -0.02);
      stick(470, 38, [150, 205, 238], 0.08);
      // felt eraser
      ctx.save(); ctx.translate(980, TRAY - 2);
      ctx.fillStyle = 'rgba(20,10,5,0.4)'; ctx.fillRect(4, 22, 170, 10);
      const eg = ctx.createLinearGradient(0, 0, 0, 22); eg.addColorStop(0, '#c48a52'); eg.addColorStop(1, '#8a5a30');
      ctx.fillStyle = eg; ctx.beginPath(); ctx.roundRect(0, 0, 170, 22, 4); ctx.fill();
      ctx.fillStyle = '#5c5c5c'; ctx.fillRect(2, 20, 166, 12);
      ctx.fillStyle = 'rgba(240,240,235,0.55)'; ctx.fillRect(2, 26, 166, 6);
      ctx.restore();

      H.grain(ctx, W, H_, 0.03, 5);
    },
    // >>>EXPLAINER
    explainerDuration: 15,
    explainerNote: 'A teacher-style lesson on one long slate: a chalk stick writes and draws while the camera tracks along the board (the hook is left behind, the chart is on the next stretch of board), arrows are dusty chalk strokes, numbers are re-chalked as they count, and pink chalk rings the key moments.',
    explainer(ctx, W, H_, t) {
      const nz = H.makeNoise(31);
      const COL = { ink: [240, 242, 236], acc1: [246, 222, 120], acc2: [244, 150, 175], acc3: [205, 250, 190] };
      const FONT = { title: '700 KPX "Kalam"', label: '400 KPX "Patrick Hand"', num: '700 KPX "Kalam"' };
      const fontOf = (it) => FONT[it.font].replace('KPX', (it.size * (it.font === 'label' ? 1.08 : 1)).toFixed(1) + 'px');
      const D = [3700, 640];
      const L = {
        D, pT: 10.95, kT: 13.05, modelName: 'the model',
        bridge: { pts: XE.cubic([3010, 760], [3120, 860], [3220, 860], [3290, 790]), a: 10.15, b: 10.6, label: 'repeat x1000', lx: 3150, ly: 785 },
        model: (cx, cy, adj, push, api, tt) => {
          const g = 'M';
          api.line(XE.rrect(cx - 165, cy - 150, 330, 325, 16), 'ink', 6, 2.5, 2.85, g);
          api.line([[cx - 60, cy - 150], [cx - 95, cy - 200], [cx + 95, cy - 200], [cx + 60, cy - 150]], 'ink', 5, 2.85, 3.0, g); // hopper
          api.text('f(x)', cx, cy - 10, 92, 'title', 'acc1', 2.95, 3.2, { align: 'center', g });
          [-1, 0, 1].forEach((k, i) => {
            const x = cx + k * 92, y = cy + 95;
            api.line(XE.circ(x, y, 27, 27, -1.2, 5.2), 'ink', 4.5, 3.05 + i * 0.05, 3.17 + i * 0.05, g);
            if (tt > 3.2 + i * 0.05) {
              const a0 = [-2.4, -0.6, -1.9][i], a1 = [-0.7, -2.2, -0.4][i], a = a0 + (a1 - a0) * adj + Math.sin(adj * Math.PI) * 0.3;
              push({ k: 'line', pts: [[x, y], [x + Math.cos(a) * 21, y + Math.sin(a) * 21]], role: adj > 0 && adj < 1 ? 'acc2' : 'ink', w: 5, a: -1, b: 0, inst: true, g });
            }
          });
          api.text('knobs', cx, cy + 160, 31, 'label', 'ink', 3.25, 3.4, { align: 'center', g });
        },
      };
      const items = XE.story(t, L);
      const cam = XE.camAt([[0, 640, 360, 1.0], [2.0, 650, 362, 1.05], [2.8, 1830, 610, 0.95], [5.95, 1860, 620, 0.97], [6.55, 2580, 640, 0.9], [10.3, 2600, 645, 0.93],
        [11.0, 3700, 690, 0.92], [12.9, 3710, 690, 0.95], [13.6, 3700, 760, 0.88], [15, 3700, 760, 0.9]], t);
      const z = cam[2];
      const apply = (c) => { c.translate(W / 2, H_ / 2); c.scale(z, z); c.translate(-cam[0], -cam[1]); };
      const toS = ([x, y]) => [(x - cam[0]) * z + W / 2, (y - cam[1]) * z + H_ / 2];

      // ---------- long slate (world texture at 1:1, built once) ----------
      // world extent: x -200..4600, y -200..1200. The low-frequency slate mottle is the half-res H.paper base,
      // everything on top of it (eraser swirls, felt streaks, ghost lesson, settled dust) is drawn at full resolution.
      if (!XC.slate) {
        const SW = 4800, SH = 1400, OX = 200, OY = 200, sl = H.layer(SW, SH), sc = sl.getContext('2d');
        // soft half-res layer: slate mottle, ghost lessons and eraser swirls (all blurred anyway)
        const base = H.layer(2400, 700), bc = base.getContext('2d'); H.paper(bc, 2400, 700, '#2c4639', 17, 0.05);
        const rr = H.rng(12);
        { // ghost text drawn unfiltered, then blurred in a single pass
          const gl = H.layer(2400, 700), gc = gl.getContext('2d'); gc.fillStyle = gc.strokeStyle = '#e8eee6'; gc.font = '400 20px "Kalam"';
          [['photosynthesis', 800, 120], ['6CO2 + 6H2O', 860, 190], ['Homework p. 112', 120, 610], ['x² + y² = r²', 2560, 250], ['Ch. 7  fractions', 1500, 1010],
            ['3/4 = 0.75', 3200, 300], ['E = mc²', 4300, 1020], ['due Friday', 4240, 260]].forEach(([s2, x, y]) => gc.fillText(s2, (x + OX) / 2, (y + OY) / 2));
          gc.lineWidth = 3; gc.beginPath(); gc.arc((1080 + OX) / 2, (330 + OY) / 2, 35, 0, 7); gc.stroke();
          gc.beginPath(); gc.moveTo((2950 + OX) / 2, (1020 + OY) / 2); gc.lineTo((3150 + OX) / 2, (1000 + OY) / 2); gc.lineTo((3060 + OX) / 2, (880 + OY) / 2); gc.closePath(); gc.stroke();
          bc.save(); bc.filter = 'blur(1.3px)'; bc.globalAlpha = 0.08; bc.drawImage(gl, 0, 0); bc.restore();
        }
        // eraser swipes: arcs and figure-eights plus straight passes, softened
        const sm = H.layer(2400, 700), smc = sm.getContext('2d'); smc.lineCap = 'round';
        for (let i = 0; i < 150; i++) {
          const x = rr.range(0, 2400), y = rr.range(0, 700), R = rr.range(30, 85), a0 = rr.range(0, 6.28);
          smc.strokeStyle = `rgba(215,228,215,${rr.range(0.035, 0.075)})`; smc.lineWidth = rr.range(20, 38);
          smc.beginPath(); smc.ellipse(x, y, R, R * rr.range(0.3, 0.7), rr.range(-0.4, 0.4), a0, a0 + rr.range(1.5, 3.5)); smc.stroke();
        }
        for (let i = 0; i < 60; i++) {
          const x = rr.range(0, 2300), y = rr.range(20, 680);
          smc.strokeStyle = `rgba(215,228,215,${rr.range(0.03, 0.05)})`; smc.lineWidth = rr.range(25, 35);
          smc.beginPath(); smc.moveTo(x, y); smc.lineTo(x + rr.range(75, 190), y + rr.range(-10, 10)); smc.stroke();
        }
        bc.filter = 'blur(3.5px)'; bc.drawImage(sm, 0, 0); bc.filter = 'none';
        sc.imageSmoothingEnabled = true; sc.drawImage(base, 0, 0, SW, SH);
        // crisp full-res felt streaks inside the smears: fine parallel lines left by the eraser
        sc.lineCap = 'round';
        for (let i = 0; i < 1700; i++) {
          const x = rr.range(0, SW), y = rr.range(0, SH);
          sc.strokeStyle = `rgba(220,230,220,${rr.range(0.01, 0.025)})`; sc.lineWidth = rr.range(0.8, 2);
          sc.beginPath(); sc.moveTo(x, y); sc.quadraticCurveTo(x + 40, y + rr.range(-6, 6), x + rr.range(60, 140), y + rr.range(-8, 8)); sc.stroke();
        }
        // settled chalk dust specks
        for (let i = 0; i < 3500; i++) {
          sc.fillStyle = `rgba(235,240,232,${rr.range(0.04, 0.2)})`;
          sc.fillRect(rr.range(0, SW), rr.range(0, SH), rr.range(0.8, 1.8), rr.range(0.8, 1.8));
        }
        XC.slate = sl;
        // fine slate tooth: a seamless 256px tile of 1-2px light/dark grain, laid over the board in world space
        const TS = 256, tile = H.layer(TS, TS), tc = tile.getContext('2d'), img = tc.createImageData(TS, TS), d = img.data, r2 = H.rng(21);
        const coarse = new Float32Array(64 * 64); for (let i = 0; i < coarse.length; i++) coarse[i] = r2() - 0.5;
        for (let y = 0, p = 0; y < TS; y++) for (let x = 0; x < TS; x++, p++) {
          const v = (r2() - 0.5) * 0.9 + coarse[((y >> 2) & 63) * 64 + ((x >> 2) & 63)] * 0.7 + coarse[((y >> 1) & 63) * 64 + ((x * 3 >> 3) & 63)] * 0.4;
          const i = p * 4, on = v > 0 ? 255 : 0; d[i] = on; d[i + 1] = on; d[i + 2] = on; d[i + 3] = Math.min(255, Math.abs(v) * 24);
        }
        tc.putImageData(img, 0, 0);
        XC.tooth = tile;
      }
      ctx.save(); apply(ctx);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(XC.slate, -200, -200, 4800, 1400);
      ctx.fillStyle = XC.toothPat || (XC.toothPat = ctx.createPattern(XC.tooth, 'repeat')); ctx.fillRect(-200, -200, 4800, 1400);
      ctx.restore();
      // classroom light: warm hot-spot upper-left of centre, darker falloff to the edges (as in the still)
      {
        const lit = ctx.createRadialGradient(560, 260, 100, 640, 360, 900);
        lit.addColorStop(0, 'rgba(120,150,130,0.10)'); lit.addColorStop(1, 'rgba(0,10,5,0.35)');
        ctx.fillStyle = lit; ctx.fillRect(0, 0, W, H_);
      }

      // ---------- chalk ----------
      const CL = H.layer(W, H_), c = CL.getContext('2d');
      c.lineCap = 'round'; c.lineJoin = 'round';
      const chalk = (P, rgb, w, seed, prog) => {
        if (prog < 1) P = P.slice(0, Math.max(2, Math.ceil(P.length * prog)));
        const rr = H.rng(seed), N = normals(P);
        for (let k = 0; k < 4; k++) {
          const off = (k / 3 - 0.5) * w * 0.7 + rr.range(-0.5, 0.5), a = 0.9 * rr.range(0.75, 1);
          c.lineWidth = w * rr.range(0.5, 0.72);
          for (let i = 0; i < P.length - 1; i += 6) {
            c.strokeStyle = H.rgba(rgb, Math.min(1, a * (0.7 + 0.3 * nz.n2(i * 0.04 + k, seed * 0.17))));
            c.beginPath();
            for (let j = i; j <= Math.min(P.length - 1, i + 6); j++) { const x = P[j][0] + N[j][0] * off, y = P[j][1] + N[j][1] * off; j === i ? c.moveTo(x, y) : c.lineTo(x, y); }
            c.stroke();
          }
        }
      };
      const measure = (it, p) => {
        c.save(); c.font = fontOf(it); const w = c.measureText(it.s).width, x0 = it.align === 'center' ? it.x - w / 2 : it.x;
        const w2 = c.measureText(it.s.slice(0, Math.ceil(it.s.length * p))).width; c.restore();
        return [x0 + w2, it.y - it.size * 0.3];
      };
      c.save(); apply(c);
      for (const it of items) {
        const p = it.inst ? 1 : XE.win(t, it.a, it.b);
        if (p <= 0) continue;
        const rgb = COL[it.role];
        if (it.k === 'line') {
          const seed = ((it.pts[0][0] * 13 + it.pts[0][1] * 7) | 0) + 3;
          chalk(wob(seg(it.pts, 2.5), nz, seed % 89, it.inst ? 0.5 : 1.3), rgb, it.w * 1.45, seed, p);
        } else if (it.k === 'dot') {
          c.fillStyle = H.rgba(rgb, 0.9); c.beginPath(); c.arc(it.x, it.y, it.r * 1.1, 0, 7); c.fill();
        } else {
          c.save(); c.font = fontOf(it);
          const wAll = c.measureText(it.s).width, x0 = it.align === 'center' ? it.x - wAll / 2 : it.x;
          c.translate(x0, it.y); c.rotate(it.rot);
          const rr = H.rng((it.s.length * 31 + (it.x | 0)) % 991), n = Math.ceil(it.s.length * p);
          let px = 0;
          for (let i = 0; i < n; i++) {
            const ch = it.s[i], w = c.measureText(ch).width;
            c.fillStyle = H.rgba(rgb, 0.95 * rr.range(0.8, 1));
            c.save(); c.translate(px, rr.range(-1.5, 1.5)); c.rotate(rr.range(-0.04, 0.04)); c.fillText(ch, 0, 0);
            if (it.font === 'num' && it.role === 'acc3') { c.fillStyle = H.rgba([228, 255, 215], 0.9); c.fillText(ch, 0.8, -0.6); } // final result: pressed harder, a second pass of chalk
            c.restore();
            px += w;
          }
          c.restore();
        }
      }
      c.restore();
      // grain anchored to the board: chalk only catches the slate's high points
      {
        const id = c.getImageData(0, 0, W, H_), d = id.data, iz = 1 / z;
        for (let i = 0, p = 0; i < d.length; i += 4, p++) {
          const a = d[i + 3] / 255; if (!a) continue;
          const x = p % W, y = (p / W) | 0;
          const wx = ((x - W / 2) * iz + cam[0]) * 1.1 | 0, wy = ((y - H_ / 2) * iz + cam[1]) * 1.1 | 0;
          let h = Math.imul(wx, 374761393) + Math.imul(wy, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); h = ((h ^ (h >>> 16)) >>> 0) / 4294967296;
          const h2 = nz.n2(wx * 0.18, wy * 0.18) * 0.5 + 0.5;
          const g = h * 0.5 + h2 * 0.5;
          d[i + 3] = 255 * Math.min(1, a * 1.15) * H.clamp((g - (1 - a) * 0.95 - 0.06) * 3.0);
        }
        c.putImageData(id, 0, 0);
      }
      ctx.save(); ctx.filter = 'blur(4px)'; ctx.globalAlpha = 0.22; ctx.drawImage(CL, 0, 0); ctx.restore();
      ctx.drawImage(CL, 0, 0);

      // ---------- chalk tray along the bottom of the board ----------
      ctx.save(); apply(ctx);
      const ty = 1110;
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-300, ty - 8, 5000, 8);
      if (!XC.tray) { // oak ledge with grain, a chalk-dust drift and specks, built once at 1:1
        const TW = 5000, TH = 90, tr = H.layer(TW, TH), tc = tr.getContext('2d'), r4 = H.rng(55);
        const tg2 = tc.createLinearGradient(0, 0, 0, TH);
        tg2.addColorStop(0, '#9a6a3c'); tg2.addColorStop(0.35, '#7a4f2a'); tg2.addColorStop(0.36, '#5e3a1c'); tg2.addColorStop(1, '#3e2510');
        tc.fillStyle = tg2; tc.fillRect(0, 0, TW, TH);
        for (let i = 0; i < 90; i++) {
          const o = r4() * TH, dark = r4.chance(0.6), fq = r4.range(0.002, 0.008), amp = r4.range(0.5, 2.5), ph = r4.range(0, 6);
          tc.strokeStyle = dark ? `rgba(50,28,10,${r4.range(0.12, 0.35)})` : `rgba(210,160,100,${r4.range(0.06, 0.16)})`; tc.lineWidth = r4.range(0.6, 2);
          tc.beginPath(); for (let x = 0; x <= TW; x += 20) { const y = o + Math.sin(x * fq + ph) * amp + nz.n2(x * 0.004, i) * 2; x ? tc.lineTo(x, y) : tc.moveTo(x, y); } tc.stroke();
        }
        tc.fillStyle = 'rgba(255,230,190,0.28)'; tc.fillRect(0, 31, TW, 1.5); // front lip highlight
        const dg = tc.createLinearGradient(0, 0, 0, 30); dg.addColorStop(0, 'rgba(235,235,225,0.34)'); dg.addColorStop(1, 'rgba(235,235,225,0.07)');
        tc.fillStyle = dg; tc.fillRect(0, 0, TW, 30);
        for (let i = 0; i < 26; i++) { const x = r4.range(0, TW), g3 = tc.createRadialGradient(x, 15, 2, x, 15, 70); g3.addColorStop(0, 'rgba(240,240,230,0.22)'); g3.addColorStop(1, 'rgba(240,240,230,0)'); tc.fillStyle = g3; tc.fillRect(x - 70, 0, 140, 30); }
        for (let i = 0; i < 5000; i++) { tc.fillStyle = `rgba(245,245,238,${r4.range(0.1, 0.5)})`; tc.fillRect(r4.range(0, TW), Math.pow(r4(), 1.6) * 28, r4.range(0.8, 2.2), r4.range(0.8, 1.6)); }
        XC.tray = tr;
      }
      ctx.drawImage(XC.tray, -300, ty);
      [[2300, 90, [242, 242, 236], -0.03], [2480, 46, [246, 220, 110], 0.05], [3400, 60, [242, 150, 172], -0.02], [3560, 40, [150, 205, 238], 0.08]].forEach(([x, len, col, rot]) => {
        ctx.save(); ctx.translate(x, ty + 11); ctx.rotate(rot);
        ctx.fillStyle = 'rgba(30,15,5,0.35)'; ctx.beginPath(); ctx.ellipse(len / 2 + 3, 8, len / 2 + 2, 4, 0, 0, 7); ctx.fill();
        const g2 = ctx.createLinearGradient(0, -8, 0, 8); g2.addColorStop(0, H.rgba(H.mix(col, '#ffffff', 0.5))); g2.addColorStop(0.4, H.rgba(col)); g2.addColorStop(1, H.rgba(H.mix(col, '#000000', 0.35)));
        ctx.fillStyle = g2; ctx.beginPath(); ctx.roundRect(0, -8, len, 16, 7); ctx.fill();
        ctx.fillStyle = H.rgba(H.mix(col, '#ffffff', 0.3)); ctx.beginPath(); ctx.ellipse(len - 2, 0, 3, 8, 0, 0, 7); ctx.fill();
        ctx.restore();
      });
      ctx.restore();

      // ---------- air dust + chalk stick ----------
      const rr = H.rng(90);
      for (let i = 0; i < 60; i++) {
        const x0 = rr.range(0, W), sp = rr.range(8, 22), ph = rr.range(0, 800);
        const y = ((ph + t * sp) % 760) - 20, x = x0 + Math.sin(t * 0.8 + i) * 8;
        ctx.fillStyle = `rgba(240,244,236,${rr.range(0.1, 0.3)})`; ctx.beginPath(); ctx.arc(x, y, rr.range(0.6, 1.4), 0, 7); ctx.fill();
      }
      H.vignette(ctx, W, H_, 0.35, '0,8,4');
      const tp = XE.tipOf(items, t, measure);
      if (tp) {
        const [tx, ty2] = toS(tp), ang = 0.8;
        for (let i = 0; i < 22; i++) {
          const r3 = H.rng(Math.floor(t * 30) * 100 + i);
          ctx.fillStyle = `rgba(240,244,236,${r3.range(0.15, 0.5)})`;
          ctx.fillRect(tx + r3.range(-12, 12), ty2 + r3.range(0, 30), r3.range(0.8, 2), r3.range(0.8, 2));
        }
        ctx.save();
        ctx.save(); ctx.filter = 'blur(6px)'; ctx.fillStyle = 'rgba(0,10,5,0.4)'; ctx.translate(tx + 16, ty2 + 20); ctx.rotate(ang); ctx.fillRect(4, -7, 80, 14); ctx.restore();
        ctx.translate(tx, ty2); ctx.rotate(ang);
        const g2 = ctx.createLinearGradient(0, -8, 0, 8); g2.addColorStop(0, '#ffffff'); g2.addColorStop(0.45, '#ecece4'); g2.addColorStop(1, '#a9aaa2');
        ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(6, -8); ctx.lineTo(86, -8); ctx.lineTo(86, 8); ctx.lineTo(6, 8); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      H.grain(ctx, W, H_, 0.03, 5 + (Math.floor(t * 12) % 4));
    },
    // <<<EXPLAINER
    // Sound: a chalk stick on a slate in a quiet classroom. Every draw-on is a dry, papery chalk drag of the same length
    // with a dull knock where the stick meets the board (the slate's low body, a touch of room); dots and re-chalked
    // numbers are chalk taps; the hard strokes (underline, red X, rings) shed a soft fall of dust. The "repeat x1000"
    // leader carries the camera along the board to the chart. Times mirror explainer()/XE.story (pT 10.95, kT 13.05,
    // bridge 10.15-10.6, model timings from explainer()).
    explainerSound(k) {
      const pT = 10.95, kT = 13.05;
      // first time XE.eio(win(t, t0, t1)) reaches u (the knob needles' eased turn)
      const when = (t0, t1, u) => { for (let i = 0; i <= 400; i++) if (XE.eio(i / 400) >= u - 1e-6) return t0 + (t1 - t0) * i / 400; return t1; };
      // the stick meets the slate: a dull knock with a little classroom air
      const knock = (t, g = 1, pan = 0, minor = true) => {
        k.tone(t, { f: [[0, 150], [0.05, 90]], dur: 0.07, gain: 0.1 * g, pan, minor, verb: 0.12 });
        k.noise(t, { dur: 0.025, filter: 'bandpass', f: 900, q: 1.2, gain: 0.15 * g, a: 0.001, pan, minor, verb: 0.12 });
      };
      // one chalk line: knock, then the drag for the whole draw-on
      const LV = 0.45; // drawing sits well under the hits
      const ch = (a, b, g = 1, pan = 0, minor = true) => {
        const d = Math.max(0.03, b - a); g *= LV;
        knock(a, g, pan, minor);
        k.play('stroke', a, { material: 'chalk', dur: d, gain: 0.95 * g, pan, minor });
      };
      // handwriting: one chalk stroke per word, timed by character position like the explainer's per-letter reveal
      const write = (s, a, b, g = 0.9, pan = 0, minor = true) => {
        const n = s.length, re = /\S+/g; let m;
        while ((m = re.exec(s))) ch(a + (b - a) * m.index / n, a + (b - a) * (m.index + m[0].length) / n, g, pan, minor);
      };
      const tap = (t, g = 1, pan = 0) => { k.noise(t, { dur: 0.02, filter: 'bandpass', f: 1500, q: 1.4, gain: 0.25 * g, a: 0.001, pan, minor: true }); k.tone(t, { f: 180, dur: 0.035, gain: 0.07 * g, pan, minor: true }); };
      // chalk dust drifting off the board after a hard stroke (soft, slow, low)
      const dust = (t, g = 1, pan = 0) => k.noise(t, { dur: 0.45, color: 'pink', filter: 'bandpass', f: 1400, q: 0.5, gain: 0.05 * g, a: 0.12, pan, minor: true });

      k.bed('room', 0, 15, { gain: 0.6 });

      // 1 HOOK
      write('How does AI learn?', 0.15, 1.3, 1.0);
      ch(1.3, 1.55, 1.3, 0, false); dust(1.5, 1); // yellow underline: one fast, hard swipe

      // 2 DATA: the f(x) machine (box, hopper, f(x), knobs), then six cards
      ch(2.5, 2.85, 1.05, 0.1, false); // machine box: first mark in the new scene
      ch(2.85, 3.0, 0.8, 0.1); // hopper
      for (let i = 0; i < 6; i++) { const a = 3.0 + i * 0.17; ch(a, a + (i < 5 ? 0.15 : 0.21), 0.85, (i % 3 - 1) * 0.15); }
      write('f(x)', 3.05, 3.2, 0.55, 0.1); // yellow f(x) inside the box, under the first cards
      ch(4.15, 4.45, 1.0); ch(4.46, 4.55, 0.85); // flow arrow + head
      write('examples', 4.55, 4.8, 0.35);
      for (let f = 55; f < 63; f++) k.play('count', f / 12, { gain: 1.5, f: 1900 + (f - 55) * 90, minor: true }); // numerals re-chalked on the 12 fps grid
      k.play('tock', 63 / 12, { f: 420, gain: 0.5 }); knock(63 / 12, 0.8, 0, false); // 1,000,000 lands

      // 3 GUESS -> CHECK -> ADJUST
      ch(6.4, 6.53, 0.9); // pink frame of the new photo
      ch(6.55, 6.7, 0.85); tap(6.7, 0.9); // cat + eyes tapped on
      write('new!', 6.67, 6.8, 0.6, 0.2);
      ch(6.8, 6.94, 0.9); ch(6.96, 7.02, 0.8); // arrow down into the model
      ch(7.02, 7.15, 0.9); // guess arrow out
      write('Guess', 7.15, 7.4, 0.6);
      ch(7.3, 7.47, 0.85); ch(7.48, 7.53, 0.75); // speech bubble + tail
      write('dog?', 7.54, 7.75, 1.0);
      write('Check', 7.86, 8.0, 0.6);
      // the wrong guess: two hard pink slashes (knock hard into the slate) + a low "nope"
      ch(8.0, 8.08, 1.8, 0.1, false); ch(8.08, 8.16, 1.8, 0.1, false); dust(8.12, 1.4, 0.1);
      k.play('error', 8.0, { f: 'F3', gain: 0.55 });
      ch(8.16, 8.45, 1.1, 0); // pink ring
      ch(8.45, 8.8, 1.0, -0.1); // long arrow back to the knobs
      write('Adjust', 8.8, 9.05, 0.6, -0.1);
      // knob needles swing (eio 8.95..9.5): a soft wooden detent every 1/7 of the turn, slowing as they settle
      for (let j = 1; j <= 7; j++) k.play('tock', when(8.95, 9.5, j / 7), { f: 640, gain: 0.3, pan: -0.15, minor: true });
      ch(9.5, 9.62, 1.1); // strike through "dog?"
      write('cat', 9.62, 9.85, 1.0);
      ch(9.85, 10.05, 1.15, 0, false); // check mark
      k.play('success', 9.98, { f: 'A5', gain: 0.6 });

      // bridge: the "repeat x1000" leader is chalked as the camera tracks along the board to the chart
      ch(10.15, 10.6, 1.5, 0.2, false); ch(10.6, 10.66, 1.0, 0.25);
      write('repeat x1000', 10.66, 10.9, 0.7, 0.3);

      // 4 PROGRESS
      ch(pT, pT + 0.3, 1.0, 0, false); // axes
      write('training rounds', pT + 0.3, pT + 0.55, 0.5);
      write('accuracy', pT + 0.45, pT + 0.7, 0.55, 0.3);
      ch(pT + 0.7, pT + 1.7, 0.45); // the rising curve
      { // % counter: a chalk tap whenever the shown number changes (12 fps grid), slowing as it settles
        // the 97% turns green when the count settles (first frame where win(...) reaches 1): that frame gets the hit
        const fG = Math.ceil((pT + 1.7) * 12 - 1e-6), tG = fG / 12;
        let last = -1;
        for (let f = Math.ceil((pT + 0.6) * 12); f < fG; f++) {
          const u = Math.min(1, (f / 12 - (pT + 0.6)) / 1.1), v = Math.round(61 + 36 * (1 - Math.pow(1 - u, 2.2)));
          if (v !== last) { k.play('tick', f / 12, { gain: 1.1, f: 1900 + (v - 61) * 20, pan: 0.25, minor: true }); last = v; }
        }
        k.play('impact', tG, { gain: 1.0, pan: 0.2 });
        k.play('ding', tG + 0.01, { f: 'D6', gain: 0.42, pan: 0.2 });
      }
      ch(pT + 1.75, pT + 2.05, 1.25, 0.25, false); dust(pT + 2.0, 1.2, 0.25); // pink ring round the 97%

      // 5 TAKEAWAY
      write('More examples → better guesses', kT, kT + 0.75, 0.9);
      k.play('success', kT + 0.75, { f: 'G5', gain: 0.7 }); // resolving landing
      ch(kT + 0.75, kT + 0.95, 1.2, 0, false); dust(kT + 0.9, 1);
    },
  });
}
```
