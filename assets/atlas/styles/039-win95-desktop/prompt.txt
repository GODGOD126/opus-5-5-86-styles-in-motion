I want an animated explainer made in the "Win95 Desktop" visual style (Retro UI & Neon). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Inter
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=block">
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
Name: Win95 Desktop
Family: Retro UI & Neon
Look: A mid-90s beige-box desktop at 2x pixel scale: teal wallpaper, 2-pixel bevelled grey chrome, navy title bars, aliased system text and a trail of frozen error dialogs.
Motion: Icons pop onto the desktop, windows open with outline-zoom rectangles, the install bar ticks in blocks then freezes, and the hung error box is dragged, smearing a stair of copies.
How it explains: An "AI Trainer" app explains it: the question dialog zooms into the title bar, beats are property-sheet tabs clicked by the cursor, dotted pixel arrows carry examples and the error signal, trackbar "weights" slide, counters live in status bars and group boxes, and the payoff is a classic message box.

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

REFERENCE STYLE SOURCE (styles/win95.js; W/H_ are always 1280x720)
```js
{
  // ---- Windows-95-era desktop, rendered on a 640x360 buffer and nearest-neighbour upscaled 2x ----
  const C = { face: '#c0c0c0', hi: '#ffffff', lt: '#dfdfdf', sh: '#808080', dk: '#000000', navy: '#000080', teal: '#008080' };
  const BW = 640, BH = 360;

  function rect(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }

  // 2px Win95 bevel. kind: 'window' | 'button' | 'sunken' | 'pressed' | 'field'
  function bevel(c, x, y, w, h, kind) {
    let o1, o2, i1, i2; // outer TL, outer BR, inner TL, inner BR
    if (kind === 'window') [o1, o2, i1, i2] = [C.lt, C.dk, C.hi, C.sh];
    else if (kind === 'button') [o1, o2, i1, i2] = [C.hi, C.dk, C.lt, C.sh];
    else if (kind === 'pressed') [o1, o2, i1, i2] = [C.dk, C.hi, C.sh, C.lt];
    else if (kind === 'field') [o1, o2, i1, i2] = [C.sh, C.hi, C.dk, C.lt];
    else if (kind === 'thin') { rect(c, x, y, w, 1, C.sh); rect(c, x, y, 1, h, C.sh); rect(c, x, y + h - 1, w, 1, C.hi); rect(c, x + w - 1, y, 1, h, C.hi); return; }
    rect(c, x, y, w - 1, 1, o1); rect(c, x, y, 1, h - 1, o1);
    rect(c, x, y + h - 1, w, 1, o2); rect(c, x + w - 1, y, 1, h, o2);
    rect(c, x + 1, y + 1, w - 3, 1, i1); rect(c, x + 1, y + 1, 1, h - 3, i1);
    rect(c, x + 1, y + h - 2, w - 2, 1, i2); rect(c, x + w - 2, y + 1, 1, h - 2, i2);
  }

  // ---------- bitmap system font (8px caps, 6px x-height, 2px descenders), like the real 8pt UI bitmap font ----------
  // Each glyph: [firstRow, ...rows]; row 0 = cap top, row 7 = baseline row, rows 8-9 = descenders.
  const GL = {
    A: [0, '..#..', '.#.#.', '.#.#.', '#...#', '#...#', '#####', '#...#', '#...#'],
    B: [0, '####.', '#...#', '#...#', '####.', '#...#', '#...#', '#...#', '####.'],
    C: [0, '.###.', '#...#', '#....', '#....', '#....', '#....', '#...#', '.###.'],
    D: [0, '###..', '#..#.', '#...#', '#...#', '#...#', '#...#', '#..#.', '###..'],
    E: [0, '#####', '#....', '#....', '####.', '#....', '#....', '#....', '#####'],
    F: [0, '#####', '#....', '#....', '####.', '#....', '#....', '#....', '#....'],
    G: [0, '.###.', '#...#', '#....', '#....', '#..##', '#...#', '#...#', '.###.'],
    H: [0, '#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#', '#...#'],
    I: [0, '#', '#', '#', '#', '#', '#', '#', '#'],
    J: [0, '...#', '...#', '...#', '...#', '...#', '#..#', '#..#', '.##.'],
    K: [0, '#...#', '#..#.', '#.#..', '##...', '##...', '#.#..', '#..#.', '#...#'],
    L: [0, '#...', '#...', '#...', '#...', '#...', '#...', '#...', '####'],
    M: [0, '#.....#', '##...##', '#.#.#.#', '#..#..#', '#.....#', '#.....#', '#.....#', '#.....#'],
    N: [0, '#...#', '##..#', '##..#', '#.#.#', '#.#.#', '#..##', '#..##', '#...#'],
    O: [0, '.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    P: [0, '####.', '#...#', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    Q: [0, '.###.', '#...#', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
    R: [0, '####.', '#...#', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    S: [0, '.###.', '#...#', '#....', '.###.', '....#', '....#', '#...#', '.###.'],
    T: [0, '#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    U: [0, '#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    V: [0, '#...#', '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..', '..#..'],
    W: [0, '#.....#', '#.....#', '#.....#', '#..#..#', '#..#..#', '#.#.#.#', '##...##', '#.....#'],
    X: [0, '#...#', '#...#', '.#.#.', '..#..', '..#..', '.#.#.', '#...#', '#...#'],
    Y: [0, '#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..', '..#..'],
    Z: [0, '#####', '....#', '...#.', '..#..', '..#..', '.#...', '#....', '#####'],
    a: [2, '.###.', '....#', '.####', '#...#', '#...#', '.####'],
    b: [0, '#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#', '####.'],
    c: [2, '.###', '#...', '#...', '#...', '#...', '.###'],
    d: [0, '....#', '....#', '.####', '#...#', '#...#', '#...#', '#...#', '.####'],
    e: [2, '.###.', '#...#', '#####', '#....', '#...#', '.###.'],
    f: [0, '.##', '#..', '###', '#..', '#..', '#..', '#..', '#..'],
    g: [2, '.####', '#...#', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
    h: [0, '#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#', '#...#'],
    i: [0, '#', '.', '#', '#', '#', '#', '#', '#'],
    j: [0, '.#', '..', '.#', '.#', '.#', '.#', '.#', '.#', '.#', '#.'],
    k: [0, '#...', '#...', '#..#', '#.#.', '##..', '##..', '#.#.', '#..#'],
    l: [0, '#', '#', '#', '#', '#', '#', '#', '#'],
    m: [2, '###.##.', '#..#..#', '#..#..#', '#..#..#', '#..#..#', '#..#..#'],
    n: [2, '####.', '#...#', '#...#', '#...#', '#...#', '#...#'],
    o: [2, '.###.', '#...#', '#...#', '#...#', '#...#', '.###.'],
    p: [2, '####.', '#...#', '#...#', '#...#', '#...#', '####.', '#....', '#....'],
    q: [2, '.####', '#...#', '#...#', '#...#', '#...#', '.####', '....#', '....#'],
    r: [2, '#.#', '##.', '#..', '#..', '#..', '#..'],
    s: [2, '.###', '#...', '##..', '..##', '...#', '###.'],
    t: [1, '.#.', '###', '.#.', '.#.', '.#.', '.#.', '..#'],
    u: [2, '#...#', '#...#', '#...#', '#...#', '#...#', '.####'],
    v: [2, '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
    w: [2, '#.....#', '#.....#', '#..#..#', '#..#..#', '#.#.#.#', '.#...#.'],
    x: [2, '#...#', '.#.#.', '..#..', '..#..', '.#.#.', '#...#'],
    y: [2, '#...#', '#...#', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
    z: [2, '#####', '...#.', '..#..', '.#...', '#....', '#####'],
    0: [0, '.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    1: [0, '..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    2: [0, '.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
    3: [0, '.###.', '#...#', '....#', '..##.', '....#', '....#', '#...#', '.###.'],
    4: [0, '...#.', '..##.', '.#.#.', '#..#.', '#..#.', '#####', '...#.', '...#.'],
    5: [0, '#####', '#....', '#....', '####.', '....#', '....#', '#...#', '.###.'],
    6: [0, '.###.', '#...#', '#....', '####.', '#...#', '#...#', '#...#', '.###.'],
    7: [0, '#####', '....#', '...#.', '...#.', '..#..', '..#..', '.#...', '.#...'],
    8: [0, '.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '#...#', '.###.'],
    9: [0, '.###.', '#...#', '#...#', '#...#', '.####', '....#', '#...#', '.###.'],
    ' ': [0, '..'],
    '.': [7, '#'],
    ',': [6, '.#', '.#', '#.'],
    ':': [2, '#', '.', '.', '.', '.', '#'],
    "'": [0, '#', '#', '#'],
    '-': [4, '####'],
    '_': [8, '#####'],
    '>': [1, '#...', '.#..', '..#.', '...#', '..#.', '.#..', '#...'],
    '<': [1, '...#', '..#.', '.#..', '#...', '.#..', '..#.', '...#'],
    '\\': [0, '#...', '#...', '.#..', '.#..', '..#.', '..#.', '...#', '...#'],
    '/': [0, '...#', '...#', '..#.', '..#.', '.#..', '.#..', '#...', '#...'],
    '(': [0, '..#', '.#.', '#..', '#..', '#..', '#..', '#..', '#..', '.#.', '..#'],
    ')': [0, '#..', '.#.', '..#', '..#', '..#', '..#', '..#', '..#', '.#.', '#..'],
    '%': [0, '.##...#', '#..#.#.', '.##.#..', '....#..', '...#...', '..#.##.', '.#.#..#', '#...##.'],
    '!': [0, '#', '#', '#', '#', '#', '#', '.', '#'],
    '?': [0, '.###.', '#...#', '....#', '...#.', '..#..', '..#..', '.....', '..#..'],
  };
  const glyphW = (ch) => GL[ch][1].length;
  const pxSupported = (s) => { for (const ch of s) if (!GL[ch]) return false; return true; };
  // bold: 0 regular, 1 bold (double-struck, +1px tracking), 2 bold double-struck at regular tracking
  function pxWidth(s, bold) { let w = 0; for (const ch of s) w += glyphW(ch) + 1 + (bold === 1 ? 1 : 0); return Math.max(0, w - 1 + (bold === 2 ? 1 : 0)); }
  // one atlas per colour (glyphs side by side, 10px tall), drawn once and blitted per glyph
  const ATL = new Map(); let ATL_X = null;
  function atlas(col) {
    let a = ATL.get(col);
    if (a) return a;
    if (!ATL_X) { ATL_X = {}; let x = 0; for (const ch in GL) { ATL_X[ch] = x; x += glyphW(ch) + 1; } ATL_X.__w = x; }
    a = H.layer(ATL_X.__w, 10); const g = a.getContext('2d'); g.fillStyle = col;
    for (const ch in GL) {
      const [top, ...rows] = GL[ch], ox = ATL_X[ch];
      rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') g.fillRect(ox + i, top + j, 1, 1); });
    }
    ATL.set(col, a); return a;
  }
  function pxText(c, s, x, y, bold, col, align) {
    const w = pxWidth(s, bold);
    let dx = Math.round(x);
    if (align === 'center') dx = Math.round(x - w / 2);
    if (align === 'right') dx = Math.round(x - w);
    const a = atlas(col), by = Math.round(y) - 8;
    for (const ch of s) {
      const gw = glyphW(ch), sx = ATL_X[ch];
      if (ch !== ' ') { c.drawImage(a, sx, 0, gw, 10, dx, by, gw, 10); if (bold) c.drawImage(a, sx, 0, gw, 10, dx + 1, by, gw, 10); }
      dx += gw + 1 + (bold === 1 ? 1 : 0);
    }
    return w;
  }

  // Aliased bitmap-ish text: draw antialiased into a scratch canvas, threshold alpha -> hard pixels.
  let scratch = null;
  function ptext(c, s, x, y, font, col, align = 'left', thr = 120) {
    // the 9px UI faces use the bitmap system font; larger display text is Inter, hard-thresholded
    if ((font === SYS || font === SYSB || font === START) && pxSupported(s)) return pxText(c, s, x, y, font === SYS ? 0 : font === SYSB ? 1 : 2, col, align);
    if (!scratch) scratch = H.layer(320, 40);
    const sx = scratch.getContext('2d', { willReadFrequently: true });
    sx.font = font;
    const w = Math.ceil(sx.measureText(s).width) + 4, h = 40;
    if (scratch.width < w) { scratch.width = w; }
    sx.clearRect(0, 0, scratch.width, scratch.height);
    sx.font = font; sx.textBaseline = 'alphabetic'; sx.fillStyle = col; sx.fillText(s, 2, 30);
    const img = sx.getImageData(0, 0, w, h), d = img.data;
    const [r, g, b] = H.hex(col);
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > thr) { d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255; } else d[i + 3] = 0;
    }
    sx.putImageData(img, 0, 0);
    let dx = x - 2;
    if (align === 'center') dx = Math.round(x - (w - 4) / 2) - 2;
    if (align === 'right') dx = x - (w - 4) - 2;
    c.drawImage(scratch, 0, 0, w, h, Math.round(dx), Math.round(y - 30), w, h);
    return w - 4;
  }
  const F = (wt, px) => `${wt} ${px}px "Inter"`;
  const SYS = F(400, 9), SYSB = F(700, 9), START = F(800, 9.5);

  // ---------- pixel icons (32x32 unless noted) ----------
  function iconComputer(c, x, y) {
    rect(c, x + 5, y + 2, 22, 18, '#000'); rect(c, x + 6, y + 3, 20, 16, '#c8c4b4');
    rect(c, x + 8, y + 5, 16, 11, '#000'); rect(c, x + 9, y + 6, 14, 9, C.teal);
    rect(c, x + 10, y + 7, 5, 1, '#9ff'); rect(c, x + 10, y + 9, 8, 1, '#9ff'); rect(c, x + 10, y + 11, 6, 1, '#9ff');
    rect(c, x + 11, y + 20, 10, 2, '#000'); rect(c, x + 12, y + 20, 8, 1, '#a8a494');
    rect(c, x + 3, y + 22, 26, 7, '#000'); rect(c, x + 4, y + 23, 24, 5, '#c8c4b4');
    rect(c, x + 6, y + 25, 9, 1, '#000'); rect(c, x + 22, y + 25, 3, 1, '#0a0');
    rect(c, x + 4, y + 27, 24, 1, '#8a8678');
  }
  function iconBin(c, x, y) {
    rect(c, x + 8, y + 4, 16, 2, '#000'); rect(c, x + 9, y + 3, 14, 1, '#000');
    rect(c, x + 9, y + 6, 14, 22, '#000'); rect(c, x + 10, y + 6, 12, 21, '#e0e0e0');
    for (let i = 0; i < 4; i++) rect(c, x + 11 + i * 3, y + 8, 1, 18, '#808080');
    rect(c, x + 10, y + 6, 12, 1, '#fff');
    // crumpled paper peeking
    rect(c, x + 12, y + 1, 5, 3, '#fff'); rect(c, x + 12, y + 1, 5, 1, '#888');
  }
  function iconFolder(c, x, y, open) {
    rect(c, x + 3, y + 7, 11, 3, '#000'); rect(c, x + 4, y + 8, 9, 2, '#ffff80');
    rect(c, x + 3, y + 10, 26, 17, '#000'); rect(c, x + 4, y + 11, 24, 15, '#e8d050');
    rect(c, x + 4, y + 11, 24, 1, '#ffff9c'); rect(c, x + 4, y + 25, 24, 1, '#a08820');
    if (open) { rect(c, x + 8, y + 13, 18, 3, '#fff'); rect(c, x + 8, y + 13, 18, 1, '#888'); }
  }
  function iconNetwork(c, x, y) {
    // globe
    const g = [[10, 2, 12], [7, 3, 18], [6, 4, 20], [5, 5, 22], [5, 6, 22], [4, 7, 24], [4, 8, 24], [4, 9, 24], [4, 10, 24], [4, 11, 24], [5, 12, 22], [5, 13, 22], [6, 14, 20], [7, 15, 18], [10, 16, 12]];
    for (const [a, yy, w] of g) { rect(c, x + a, y + yy, w, 1, '#1060d0'); }
    const land = [[9, 4, 5], [8, 5, 7], [9, 6, 8], [10, 7, 6], [11, 8, 4], [18, 6, 5], [17, 7, 8], [18, 8, 9], [19, 9, 7], [20, 10, 5], [12, 11, 3], [12, 12, 4], [13, 13, 3]];
    for (const [a, yy, w] of land) rect(c, x + a, y + yy, w, 1, '#20a040');
    // two little computers + cable
    rect(c, x + 1, y + 19, 10, 8, '#000'); rect(c, x + 2, y + 20, 8, 5, C.teal); rect(c, x + 0, y + 27, 12, 3, '#000'); rect(c, x + 1, y + 28, 10, 1, '#c8c4b4');
    rect(c, x + 21, y + 19, 10, 8, '#000'); rect(c, x + 22, y + 20, 8, 5, C.teal); rect(c, x + 20, y + 27, 12, 3, '#000'); rect(c, x + 21, y + 28, 10, 1, '#c8c4b4');
    rect(c, x + 11, y + 28, 10, 1, '#000'); rect(c, x + 15, y + 17, 1, 11, '#000');
  }
  function iconDoc(c, x, y) {
    rect(c, x + 7, y + 2, 16, 27, '#000'); rect(c, x + 8, y + 3, 14, 25, '#fff');
    rect(c, x + 18, y + 2, 5, 5, C.teal); rect(c, x + 18, y + 3, 4, 4, '#fff'); rect(c, x + 18, y + 6, 5, 1, '#000'); rect(c, x + 22, y + 2, 1, 5, '#000');
    for (let i = 0; i < 8; i++) rect(c, x + 10, y + 9 + i * 2, i % 3 === 2 ? 7 : 10, 1, '#000080');
  }
  function iconBrainExe(c, x, y, s = 1) { // 16x16 app icon (pink brain on a window), scaled by s
    const R = (a, b, w, h, col) => rect(c, x + a * s, y + b * s, w * s, h * s, col);
    R(0, 1, 16, 14, '#000'); R(1, 2, 14, 12, '#fff'); R(1, 2, 14, 2, C.navy);
    const pts = [[4, 6, 8], [3, 7, 10], [3, 8, 10], [3, 9, 10], [4, 10, 9], [5, 11, 3], [9, 11, 3]];
    for (const [a, b, w] of pts) R(a, b, w, 1, '#ff80c0');
    R(8, 6, 1, 5, '#c0407f'); R(5, 8, 2, 1, '#c0407f'); R(10, 7, 2, 1, '#c0407f'); R(4, 6, 8, 1, '#c0407f');
  }
  function iconError(c, x, y) { // 32x32 red circle with white X
    for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) {
      const dx = i - 15.5, dy = j - 15.5, d = Math.hypot(dx, dy);
      if (d < 14.6) {
        const k = Math.abs(dx + dy) < 2.3 || Math.abs(dx - dy) < 2.3;
        rect(c, x + i, y + j, 1, 1, k && d < 9.5 ? '#fff' : '#ff0000');
      } else if (d < 15.6) rect(c, x + i, y + j, 1, 1, '#000');
      else if (d < 16.8 && dx > 0 && dy > 0) rect(c, x + i + 1, y + j + 1, 1, 1, '#808080');
    }
  }
  function flag(c, x, y) { // generic waving 4-pane flag (14x12)
    const cols = ['#ff0000', '#00c000', '#0000ff', '#ffff00'];
    for (let q = 0; q < 4; q++) {
      const ox = (q % 2) * 7, oy = (q >> 1) * 6;
      for (let i = 0; i < 6; i++) { const wob = Math.round(Math.sin((ox + i) * 0.45) * 1); rect(c, x + ox + i, y + oy + wob, 1, 5, cols[q]); }
    }
    // speed trails
    rect(c, x - 4, y + 2, 3, 1, '#000'); rect(c, x - 5, y + 5, 4, 1, '#000'); rect(c, x - 4, y + 8, 3, 1, '#000');
  }

  function cursorArrow(c, x, y) {
    const rows = ['X', 'XX', 'XOX', 'XOOX', 'XOOOX', 'XOOOOX', 'XOOOOOX', 'XOOOOOOX', 'XOOOOOOOX', 'XOOOOOOOOX', 'XOOOOOXXXXX', 'XOOXOOX', 'XOX XOOX', 'XX  XOOX', 'X    XOOX', '     XOOX', '      XX'];
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { if (r[i] === 'X') rect(c, x + i, y + j, 1, 1, '#000'); else if (r[i] === 'O') rect(c, x + i, y + j, 1, 1, '#fff'); } });
  }
  function cursorHourglass(c, x, y) {
    const rows = ['XXXXXXXXXXX', 'XOOOOOOOOOX', 'XXXXXXXXXXX', ' XOOOOOOOX', ' XOXOXOXOX', ' XOOXOXOOX', '  XOOXOOX', '   XOXOX', '    XOX', '   XOOOX', '  XOOXOOX', ' XOOOOOOOX', ' XOOXOXOOX', ' XOXOXOXOX', 'XXXXXXXXXXX', 'XOOOOOOOOOX', 'XXXXXXXXXXX'];
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { if (r[i] === 'X') rect(c, x + i, y + j, 1, 1, '#000'); else if (r[i] === 'O') rect(c, x + i, y + j, 1, 1, '#fff'); } });
  }

  // ---------- window chrome ----------
  function titleButtons(c, x, y, closeOnly) {
    const bw = 14, bh = 12;
    const drawB = (bx, glyph) => {
      rect(c, bx, y, bw, bh, C.face); bevel(c, bx, y, bw, bh, 'button');
      c.fillStyle = '#000';
      if (glyph === 'x') { for (let i = 0; i < 6; i++) { c.fillRect(bx + 4 + i, y + 3 + i, 2, 1); c.fillRect(bx + 9 - i, y + 3 + i, 2, 1); } }
      if (glyph === '_') c.fillRect(bx + 4, y + 8, 6, 2);
      if (glyph === 'o') { c.fillRect(bx + 3, y + 2, 9, 2); c.fillRect(bx + 3, y + 2, 1, 8); c.fillRect(bx + 11, y + 2, 1, 8); c.fillRect(bx + 3, y + 9, 9, 1); }
    };
    let bx = x - bw;
    drawB(bx, 'x');
    if (!closeOnly) { bx -= bw + 2; drawB(bx, 'o'); bx -= bw; drawB(bx, '_'); }
  }
  function windowFrame(c, x, y, w, h, title, active, opts = {}) {
    rect(c, x, y, w, h, C.face); bevel(c, x, y, w, h, 'window');
    const tx = x + 3, ty = y + 3, tw = w - 6, th = 16;
    rect(c, tx, ty, tw, th, active ? C.navy : C.sh); // Win95 caption bars are solid (gradients arrived with Win98)
    let lx = tx + 3;
    if (opts.icon) { opts.icon(c, tx + 2, ty + 1, 0.875); lx += 17; }
    ptext(c, title, lx, ty + 12, SYSB, active ? '#ffffff' : '#c0c0c0');
    titleButtons(c, x + w - 5, ty + 2, opts.closeOnly);
    return { x: x + 4, y: y + 4 + th + 1, w: w - 8, h: h - 8 - th - 1 };
  }
  function button(c, x, y, w, h, label, def, pressed) {
    rect(c, x, y, w, h, C.face);
    if (def) { rect(c, x, y, w, h, '#000'); rect(c, x + 1, y + 1, w - 2, h - 2, C.face); bevel(c, x + 1, y + 1, w - 2, h - 2, pressed ? 'pressed' : 'button'); }
    else bevel(c, x, y, w, h, pressed ? 'pressed' : 'button');
    ptext(c, label, x + w / 2 + (pressed ? 1 : 0), y + h / 2 + 4 + (pressed ? 1 : 0), SYS, '#000', 'center');
    if (def) { // focus rect (dotted)
      c.fillStyle = '#000';
      for (let i = x + 4; i < x + w - 4; i += 2) { c.fillRect(i, y + 4, 1, 1); c.fillRect(i, y + h - 5, 1, 1); }
      for (let j = y + 4; j < y + h - 4; j += 2) { c.fillRect(x + 4, j, 1, 1); c.fillRect(x + w - 5, j, 1, 1); }
    }
  }
  function etched(c, x, y, w) { rect(c, x, y, w, 1, C.sh); rect(c, x, y + 1, w, 1, C.hi); }

  // ---------- scene pieces ----------
  function desktopIcon(c, x, y, drawIcon, label, selected) {
    drawIcon(c, x + 14, y);
    const lines = label.split('\n');
    lines.forEach((ln, i) => {
      if (selected) {
        const w = pxWidth(ln, 0) + 4;
        rect(c, Math.round(x + 30 - w / 2), y + 33 + i * 11, w, 11, C.navy);
      }
      ptext(c, ln, x + 30, y + 42 + i * 11, SYS, '#fff', 'center');
    });
  }

  function explorerWindow(c, x, y, w, h) {
    const r = windowFrame(c, x, y, w, h, 'Neural Net', false, { icon: (cc, a, b) => iconFolderSmall(cc, a, b) });
    // menu bar
    let mx = r.x + 6;
    for (const m of ['File', 'Edit', 'View', 'Help']) { const ww = ptext(c, m, mx, r.y + 10, SYS, '#000'); rect(c, mx, r.y + 11, 5, 1, '#000'); mx += ww + 12; }
    // client area
    const cy = r.y + 15, ch = r.h - 15 - 18;
    rect(c, r.x, cy, r.w, ch, '#fff'); bevel(c, r.x, cy, r.w, ch, 'field');
    const items = [['weights.dat', iconDoc], ['tokens', iconFolder], ['brain.exe', (cc, a, b) => iconBrainExe(cc, a + 4, b + 4, 1.5)], ['dreams', iconFolder], ['memory.bak', iconDoc], ['prompts', iconFolder]];
    items.forEach(([name, ic], i) => {
      const ix = r.x + 8 + (i % 6) * 54, iy = cy + 6;
      ic(c, ix + 11, iy);
      ptext(c, name, ix + 27, iy + 42, SYS, '#000', 'center');
    });
    // status bar
    const sy = r.y + r.h - 16;
    rect(c, r.x, sy, 120, 15, C.face); bevel(c, r.x, sy, 120, 15, 'thin');
    rect(c, r.x + 122, sy, r.w - 122, 15, C.face); bevel(c, r.x + 122, sy, r.w - 122, 15, 'thin');
    ptext(c, '6 object(s)', r.x + 4, sy + 11, SYS, '#000');
    ptext(c, '1.44GB', r.x + 126, sy + 11, SYS, '#000');
  }
  function iconFolderSmall(c, x, y) {
    rect(c, x + 1, y + 2, 6, 2, '#000'); rect(c, x + 1, y + 4, 13, 9, '#000'); rect(c, x + 2, y + 5, 11, 7, '#e8d050'); rect(c, x + 2, y + 3, 4, 1, '#ffff80');
  }

  function wizardWindow(c, x, y, w, h, t, active) {
    const r = windowFrame(c, x, y, w, h, 'AI Assistant Setup Wizard', active, { closeOnly: true, icon: (cc, a, b) => iconBrainExe(cc, a, b, 0.875) });
    // left bitmap panel
    const px = r.x + 8, py = r.y + 8, pw = 116, ph = r.h - 52;
    rect(c, px - 1, py - 1, pw + 2, ph + 2, '#808080');
    // dithered navy->teal gradient (ordered 2x2 dither between bands)
    const bands = ['#000080', '#00007f', '#0000a8', '#0010c0', '#0040c0', '#0070b0', '#008080', '#10a0a0'];
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i += 1) {
      const f = (j / ph) * (bands.length - 1);
      const k = Math.floor(f), fr = f - k;
      const bay = [[0, 0.5], [0.75, 0.25]][j & 1][i & 1];
      c.fillStyle = bands[Math.min(bands.length - 1, k + (fr > bay ? 1 : 0))];
      c.fillRect(px + i, py + j, 1, 1);
    }
    // stars / sparkle pixels
    const rr = H.rng(9);
    for (let i = 0; i < 26; i++) { rect(c, px + rr.int(2, pw - 3), py + rr.int(2, ph * 0.55), 1, 1, rr.chance(0.5) ? '#ffffff' : '#80c0ff'); }
    // big monitor with a pixel brain on screen + floppy
    const mx = px + 23, my = py + 18;
    rect(c, mx, my, 70, 56, '#000'); rect(c, mx + 1, my + 1, 68, 54, '#d8d4c4'); rect(c, mx + 1, my + 53, 68, 2, '#8a8678');
    rect(c, mx + 6, my + 6, 58, 40, '#000'); rect(c, mx + 7, my + 7, 56, 38, '#000040');
    // brain pixel art on screen
    const brain = [
      '....XXXX..XXXX....',
      '..XXOOOOXXOOOOXX..',
      '.XOOOPOOOXOPOOOOX.',
      'XOOPPOOOPXOOOPOOOX',
      'XOOOOOPOOXOPOOOPOX',
      'XOPOOOOOPXOOOPOOOX',
      'XOOOPPOOOXOPOOOOOX',
      '.XOOOOOPOXOOOPPOX.',
      '..XXOOOOXXOOOOXX..',
      '....XXXX..XXOX....',
      '............XOX...',
      '.............XX...'];
    const bxo = mx + 35 - 18, byo = my + 13;
    brain.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch === '.') continue; c.fillStyle = ch === 'X' ? '#ff40a0' : ch === 'P' ? '#c03080' : '#ffa0d0'; c.fillRect(bxo + i * 2, byo + j * 2, 2, 2); } });
    // scanline on screen
    const sl = Math.floor((t * 30) % 38);
    rect(c, mx + 7, my + 7 + sl, 56, 1, 'rgba(120,200,255,0.25)');
    rect(c, mx + 26, my + 56, 18, 4, '#000'); rect(c, mx + 14, my + 60, 42, 6, '#000'); rect(c, mx + 15, my + 61, 40, 4, '#d8d4c4');
    rect(c, mx + 58, my + 49, 4, 2, '#00c000');
    // floppy disk
    const fx = px + 10, fy = py + 82;
    rect(c, fx, fy, 30, 30, '#000'); rect(c, fx + 1, fy + 1, 28, 28, '#303040');
    rect(c, fx + 7, fy + 1, 16, 10, '#c0c0c0'); rect(c, fx + 17, fy + 3, 4, 6, '#303040');
    rect(c, fx + 5, fy + 15, 20, 13, '#fff'); for (let i = 0; i < 3; i++) rect(c, fx + 7, fy + 18 + i * 3, 16, 1, '#4060c0');

    // right content
    const cx = px + pw + 14;
    ptext(c, 'Welcome to the AI', cx, r.y + 26, F(800, 15), '#000');
    ptext(c, 'Assistant Setup Wizard', cx, r.y + 44, F(800, 15), '#000');
    const body = ['This will install AI Assistant 1.0', 'on your computer. It is strongly', 'recommended that you exit all', 'other programs before continuing.'];
    body.forEach((l, i) => ptext(c, l, cx, r.y + 66 + i * 12, SYS, '#000'));
    ptext(c, 'Copying files...', cx, r.y + 128, SYS, '#000');
    const files = ['C:\\WINDOWS\\SYSTEM\\NEURONS.DLL', 'C:\\WINDOWS\\SYSTEM\\SYNAPSE.VXD', 'C:\\AI\\WEIGHTS\\LAYER_042.DAT', 'C:\\AI\\TOKENS\\VOCAB.TXT'];
    ptext(c, files[Math.floor(Math.min(t, 3.3) * 4.4) % files.length], cx, r.y + 141, SYS, '#000');
    // progress bar
    const bx = cx, by = r.y + 149, bw = r.x + r.w - 10 - cx, bh = 16;
    rect(c, bx, by, bw, bh, C.face); bevel(c, bx, by, bw, bh, 'field');
    const pct = 0.04 + 0.57 * H.clamp((t - 1.9) / 1.4); // ticks up, then freezes when the app hangs
    const blocks = Math.floor(((bw - 6) * pct) / 9);
    for (let i = 0; i < blocks; i++) rect(c, bx + 3 + i * 9, by + 3, 7, bh - 6, C.navy);
    ptext(c, Math.round(pct * 100) + '% complete', cx, r.y + 180, SYS, '#000');
    // separator + buttons
    etched(c, r.x + 6, r.y + r.h - 34, r.w - 12);
    const byb = r.y + r.h - 27;
    button(c, r.x + r.w - 234, byb, 72, 22, '< Back');
    button(c, r.x + r.w - 160, byb, 72, 22, 'Next >', true);
    button(c, r.x + r.w - 80, byb, 72, 22, 'Cancel');
    return r;
  }

  function errorDialog(c, x, y, active) {
    const w = 262, h = 116;
    const r = windowFrame(c, x, y, w, h, 'BRAIN.EXE', active, { closeOnly: true });
    iconError(c, r.x + 10, r.y + 10);
    ptext(c, 'This program has performed an', r.x + 52, r.y + 20, SYS, '#000');
    ptext(c, 'illegal operation and will be', r.x + 52, r.y + 32, SYS, '#000');
    ptext(c, 'shut down.', r.x + 52, r.y + 44, SYS, '#000');
    ptext(c, 'Reason: became self-aware.', r.x + 52, r.y + 60, SYS, '#000');
    button(c, r.x + r.w - 160, r.y + r.h - 28, 72, 22, 'Close', true);
    button(c, r.x + r.w - 82, r.y + r.h - 28, 74, 22, 'Details >>');
  }

  function taskbar(c, t, open, activeIdx) {
    const ty = BH - 24;
    rect(c, 0, ty, BW, 24, C.face); rect(c, 0, ty, BW, 1, C.lt); rect(c, 0, ty + 1, BW, 1, C.hi);
    // start
    rect(c, 2, ty + 3, 54, 19, C.face); bevel(c, 2, ty + 3, 54, 19, 'button');
    flag(c, 10, ty + 7);
    ptext(c, 'Start', 27, ty + 16, START, '#000');
    // tasks
    const all = [['Neural Net', iconFolderSmall], ['AI Assistant Setup...', (cc, a, b) => iconBrainExe(cc, a, b, 0.875)], ['BRAIN.EXE', null]];
    const tasks = all.slice(0, open).map((tk, i) => [...tk, i === activeIdx]);
    let x = 60;
    for (const [label, ic, active] of tasks) {
      const w = 130;
      if (active) {
        // pressed + dithered checker inside (classic active task look)
        rect(c, x, ty + 3, w, 19, '#fff');
        for (let j = 0; j < 19; j++) for (let i = (j & 1); i < w; i += 2) rect(c, x + i, ty + 3 + j, 1, 1, C.face);
        bevel(c, x, ty + 3, w, 19, 'pressed');
      } else { rect(c, x, ty + 3, w, 19, C.face); bevel(c, x, ty + 3, w, 19, 'button'); }
      if (ic) ic(c, x + 4, ty + 5);
      else { // tiny error icon
        for (let j = 0; j < 14; j++) for (let i = 0; i < 14; i++) { const d = Math.hypot(i - 6.5, j - 6.5); if (d < 6.4) rect(c, x + 4 + i, ty + 6 + j, 1, 1, (Math.abs(i - j) < 1.5 || Math.abs(i + j - 13) < 1.5) && d < 4 ? '#fff' : '#f00'); }
      }
      ptext(c, label, x + 22, ty + 16, active ? SYSB : SYS, '#000');
      x += w + 3;
    }
    // tray
    const trw = 76, trx = BW - trw - 3;
    rect(c, trx, ty + 3, trw, 19, C.face); bevel(c, trx, ty + 3, trw, 19, 'thin');
    // speaker icon
    rect(c, trx + 6, ty + 9, 3, 6, '#000'); rect(c, trx + 9, ty + 7, 1, 10, '#000'); rect(c, trx + 10, ty + 6, 1, 12, '#000'); rect(c, trx + 7, ty + 10, 2, 4, '#808080');
    rect(c, trx + 13, ty + 9, 1, 6, '#808080');
    const mins = 20 + Math.floor(t / 60);
    ptext(c, `4:${String(mins).padStart(2, '0')} PM`, trx + trw - 6, ty + 16, SYS, '#000', 'right');
  }

  // =====================================================================================
  // EXPLAINER: "How does AI learn?" as an "AI Trainer" app. Transitions = windows opening with outline-zoom
  // rectangles and property-sheet tab switches clicked by the cursor. Arrows are dotted pixel lines.
  // =====================================================================================
  const SPR = {
    cat: ['XX........XX', 'XOX......XOX', 'XOOX....XOOX', 'XOOOXXXXOOOX', 'XOOOOOOOOOOX', 'XOKKOOOOKKOX', 'XOKKOOOOKKOX', 'XOOOOPPOOOOX', 'XOOOOOOOOOOX', '.XOOOOOOOOX.', '..XOOOOOOX..', '...XXXXXX...'],
    dog: ['...XXXXXX...', 'XXXOOOOOOXXX', 'XBBOOOOOOBBX', 'XBBOKOOKOBBX', 'XBBOKOOKOBBX', 'XBBOOOOOOBBX', 'XBXOOOOOOXBX', '.XXOOKKOOXX.', '..XOOKKOOX..', '...XOOOOX...', '....XRRX....', '.....XX.....'],
    brain: ['....XXXX..XXXX....', '..XXOOOOXXOOOOXX..', '.XOOOPOOOXOPOOOOX.', 'XOOPPOOOPXOOOPOOOX', 'XOOOOOPOOXOPOOOPOX', 'XOPOOOOOPXOOOPOOOX', 'XOOOPPOOOXOPOOOOOX', '.XOOOOOPOXOOOPPOX.', '..XXOOOOXXOOOOXX..', '....XXXX..XXOX....', '............XOX...', '.............XX...'],
  };
  const SPRCOL = {
    cat: { X: '#000', O: '#ff9a30', K: '#000', P: '#ff6090' },
    dog: { X: '#000', O: '#e8c890', B: '#805020', K: '#000', R: '#ff4060' },
    brain: { X: '#ff40a0', O: '#ffa0d0', P: '#c03080' },
  };
  function sprite(c, name, x, y, s) {
    const cols = SPRCOL[name];
    SPR[name].forEach((row, j) => { for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch === '.') continue; c.fillStyle = cols[ch]; c.fillRect(x + i * s, y + j * s, s, s); } });
  }
  function groupBox(c, x, y, w, h, label) {
    rect(c, x, y + 4, w, 1, C.sh); rect(c, x, y + 5, w, 1, C.hi);
    rect(c, x, y + h - 2, w, 1, C.sh); rect(c, x, y + h - 1, w, 1, C.hi);
    rect(c, x, y + 4, 1, h - 5, C.sh); rect(c, x + 1, y + 5, 1, h - 6, C.hi);
    rect(c, x + w - 2, y + 4, 1, h - 5, C.sh); rect(c, x + w - 1, y + 4, 1, h - 4, C.hi);
    const lw = pxWidth(label, 0) + 6;
    rect(c, x + 8, y, lw, 10, C.face);
    ptext(c, label, x + 11, y + 8, SYS, '#000');
  }
  function dottedArrow(c, pts, prog, col) {
    let total = 0; const seg = [];
    for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(l); total += l; }
    const lim = total * H.clamp(prog);
    c.fillStyle = col;
    let acc = 0, last = pts[0], dir = [1, 0];
    for (let i = 0; i < seg.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      for (let d = 0; d < seg[i]; d += 4) {
        if (acc + d > lim) break;
        const u = d / seg[i]; const x = Math.round(ax + (bx - ax) * u), y = Math.round(ay + (by - ay) * u);
        c.fillRect(x - 1, y - 1, 2, 2); last = [x, y]; dir = [(bx - ax) / seg[i], (by - ay) / seg[i]];
      }
      acc += seg[i];
    }
    if (prog >= 1) { // pixel arrowhead
      const [ex, ey] = pts[pts.length - 1];
      for (let k = 0; k < 7; k++) {
        const bx = ex - dir[0] * k, by = ey - dir[1] * k;
        const px = -dir[1], py = dir[0];
        for (let s = -k; s <= k; s++) c.fillRect(Math.round(bx + px * s * 0.6), Math.round(by + py * s * 0.6), 1, 1);
      }
    }
  }
  function trackbar(c, x, y, w, v, label) {
    ptext(c, label, x - 18, y + 9, SYS, '#000');
    rect(c, x, y + 4, w, 4, '#fff'); bevel(c, x, y + 4, w, 4, 'field');
    for (let i = 0; i <= 10; i++) rect(c, x + 2 + Math.round(i * (w - 4) / 10), y + 18, 1, 3, '#000');
    const tx = Math.round(x + v * (w - 10));
    rect(c, tx, y - 2, 10, 17, C.face); bevel(c, tx, y - 2, 10, 17, 'button');
  }
  function okIcon(c, x, y) { // green circle with white tick, 24px
    for (let j = 0; j < 24; j++) for (let i = 0; i < 24; i++) { const d = Math.hypot(i - 11.5, j - 11.5); if (d < 11) rect(c, x + i, y + j, 1, 1, '#00a000'); else if (d < 12) rect(c, x + i, y + j, 1, 1, '#000'); }
    const tk = [[6, 12], [7, 13], [8, 14], [9, 15], [10, 16], [11, 15], [12, 14], [13, 13], [14, 12], [15, 11], [16, 10], [17, 9], [18, 8]];
    for (const [a, b] of tk) rect(c, x + a, y + b - 1, 2, 3, '#fff');
  }
  function infoIcon(c, x, y) { // white balloon with blue i
    for (let j = 0; j < 26; j++) for (let i = 0; i < 30; i++) { const d = Math.hypot((i - 15) / 15, (j - 12) / 12); if (d < 0.92) rect(c, x + i, y + j, 1, 1, '#fff'); else if (d < 1.0) rect(c, x + i, y + j, 1, 1, '#000'); }
    rect(c, x + 8, y + 22, 4, 6, '#000'); rect(c, x + 9, y + 22, 2, 4, '#fff');
    rect(c, x + 13, y + 5, 4, 3, '#0000ff'); rect(c, x + 13, y + 10, 4, 10, '#0000ff'); rect(c, x + 11, y + 10, 2, 1, '#0000ff'); rect(c, x + 11, y + 19, 8, 1, '#0000ff');
  }
  function qIcon(c, x, y) {
    for (let j = 0; j < 26; j++) for (let i = 0; i < 30; i++) { const d = Math.hypot((i - 15) / 15, (j - 12) / 12); if (d < 0.92) rect(c, x + i, y + j, 1, 1, '#fff'); else if (d < 1.0) rect(c, x + i, y + j, 1, 1, '#000'); }
    rect(c, x + 8, y + 22, 4, 6, '#000'); rect(c, x + 9, y + 22, 2, 4, '#fff');
    ptext(c, '?', x + 15, y + 19, F(800, 17), '#0000ff', 'center');
  }
  function tabs(c, x, y, labels, active, pageW, pageH) {
    // page
    rect(c, x, y + 16, pageW, pageH, C.face);
    rect(c, x, y + 16, pageW, 1, C.hi); rect(c, x, y + 16, 1, pageH, C.hi); rect(c, x + pageW - 1, y + 16, 1, pageH, C.dk); rect(c, x + pageW - 2, y + 17, 1, pageH - 1, C.sh); rect(c, x, y + 16 + pageH - 1, pageW, 1, C.dk); rect(c, x + 1, y + 16 + pageH - 2, pageW - 2, 1, C.sh);
    let tx = x;
    labels.forEach((lab, i) => {
      const w = 74, act = i === active, ty = act ? y : y + 2, th = act ? 18 : 14;
      rect(c, tx, ty, w, th, C.face);
      rect(c, tx + 1, ty, w - 2, 1, C.hi); rect(c, tx, ty + 1, 1, th - 1, C.hi); rect(c, tx + w - 1, ty + 1, 1, th - 1, C.dk); rect(c, tx + w - 2, ty + 1, 1, th - 1, C.sh);
      if (act) rect(c, tx + 1, y + 16, w - 3, 2, C.face);
      ptext(c, lab, tx + w / 2, ty + 11, act ? SYSB : SYS, '#000', 'center');
      tx += w;
    });
  }
  function taskbarEx(c, t, items, activeIdx) {
    const ty = BH - 24;
    rect(c, 0, ty, BW, 24, C.face); rect(c, 0, ty, BW, 1, C.lt); rect(c, 0, ty + 1, BW, 1, C.hi);
    rect(c, 2, ty + 3, 54, 19, C.face); bevel(c, 2, ty + 3, 54, 19, 'button'); flag(c, 10, ty + 7); ptext(c, 'Start', 27, ty + 16, START, '#000');
    let x = 60;
    items.forEach((label, i) => {
      const w = 150, act = i === activeIdx;
      if (act) { rect(c, x, ty + 3, w, 19, '#fff'); for (let j = 0; j < 19; j++) for (let k = (j & 1); k < w; k += 2) rect(c, x + k, ty + 3 + j, 1, 1, C.face); bevel(c, x, ty + 3, w, 19, 'pressed'); }
      else { rect(c, x, ty + 3, w, 19, C.face); bevel(c, x, ty + 3, w, 19, 'button'); }
      iconBrainExe(c, x + 4, ty + 5, 0.875);
      ptext(c, label, x + 22, ty + 16, act ? SYSB : SYS, '#000');
      x += w + 3;
    });
    const trw = 76, trx = BW - trw - 3;
    rect(c, trx, ty + 3, trw, 19, C.face); bevel(c, trx, ty + 3, trw, 19, 'thin');
    ptext(c, '4:21 PM', trx + trw - 6, ty + 16, SYS, '#000', 'right');
  }
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  function zoomRectEx(c, t, from, to, t0, t1) {
    if (t < t0 || t >= t1) return;
    for (let k = 0; k < 3; k++) {
      const p = H.clamp((t - t0) / (t1 - t0) - k * 0.12); if (p <= 0) continue;
      const x = Math.round(H.lerp(from[0], to[0], p)), y = Math.round(H.lerp(from[1], to[1], p)), w = Math.round(H.lerp(from[2], to[2], p)), h = Math.round(H.lerp(from[3], to[3], p));
      c.fillStyle = '#c0c0c0'; c.fillRect(x, y, w, 2); c.fillRect(x, y + h, w, 2); c.fillRect(x, y, 2, h); c.fillRect(x + w, y, 2, h + 2);
    }
  }
  function cursorPath(t, keys) { // keys: [t, x, y]
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, x0, y0] = keys[i], [t1, x1, y1] = keys[i + 1];
      if (t < t1) { const e = H.ease.inOut(H.clamp((t - t0) / (t1 - t0))); return [Math.round(H.lerp(x0, x1, e)), Math.round(H.lerp(y0, y1, e))]; }
    }
    const k = keys[keys.length - 1]; return [k[1], k[2]];
  }

  function explainW95(c, t) {
    rect(c, 0, 0, BW, BH, C.teal);
    const T_MAIN = 1.95, T_TRAIN = 5.95, T_RES = 10.35, T_DONE = 12.75;
    desktopIcon(c, 6, 6, iconComputer, 'My Computer');
    desktopIcon(c, 6, 62, iconBin, 'Recycle Bin');
    desktopIcon(c, 6, 118, iconFolder, 'Training Data');

    // ---- beat 1: the question pops up as a help dialog, then zooms into the main window's title bar ----
    const dlg = [170, 104, 300, 116];
    zoomRectEx(c, t, [4, 338, 54, 18], dlg, 0.05, 0.3);
    if (t >= 0.3 && t < 1.75) {
      const r = windowFrame(c, ...dlg, 'AI Help', true, { closeOnly: true });
      qIcon(c, r.x + 12, r.y + 12);
      ptext(c, 'How does AI learn?', r.x + 56, r.y + 32, F(800, 17), '#000');
      if (t > 0.7) ptext(c, "Let's open the AI Trainer and see.", r.x + 56, r.y + 52, SYS, '#000');
      button(c, r.x + r.w / 2 - 36, r.y + r.h - 30, 72, 22, 'OK', true, t > 1.55);
    }
    zoomRectEx(c, t, dlg, [6, 4, 628, 328], 1.75, T_MAIN);
    let open = t >= T_MAIN;
    let cur;
    if (open) {
      const done = t >= T_DONE;
      const r = windowFrame(c, 6, 4, 628, 328, 'How does AI learn? - AI Trainer', !done, { icon: (cc, a, b) => iconBrainExe(cc, a, b, 0.875) });
      const tab = t < T_TRAIN ? 0 : t < T_RES ? 1 : 2;
      tabs(c, 14, 28, ['1. Data', '2. Train', '3. Results'], tab, 612, 262);
      // status bar
      const sy = 310;
      rect(c, 10, sy, 400, 16, C.face); bevel(c, 10, sy, 400, 16, 'thin');
      rect(c, 413, sy, 217, 16, C.face); bevel(c, 413, sy, 217, 16, 'thin');
      const PX = 14, PY = 44; // page origin
      if (tab === 0) {
        const tl = t - T_MAIN;
        groupBox(c, PX + 10, PY + 10, 250, 196, 'Training data (labelled)');
        const items = [];
        for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) items.push([PX + 24 + i * 58, PY + 30 + j * 58, (i + j) % 2 ? 'dog' : 'cat']);
        items.forEach(([x, y, k], n) => {
          if (tl < 0.15 + n * 0.06) return;
          rect(c, x, y, 34, 34, '#fff'); bevel(c, x, y, 34, 34, 'field');
          sprite(c, k, x + 5, y + 5, 2);
          ptext(c, k, x + 17, y + 46, SYSB, k === 'cat' ? '#a04000' : '#604010', 'center');
        });
        groupBox(c, PX + 400, PY + 10, 200, 196, 'Model');
        const pulse = tl > 1.3 && Math.floor((tl - 1.3) / 0.16) % 2 === 0;
        sprite(c, 'brain', PX + 446, PY + 70, 6);
        if (pulse) { rect(c, PX + 440, PY + 64, 120, 1, '#ff40a0'); rect(c, PX + 440, PY + 141, 120, 1, '#ff40a0'); }
        ptext(c, 'neural network', PX + 500, PY + 166, SYS, '#000', 'center');
        // arrow draws on, then example cards fly along it (copy-dialog style)
        const ap = H.clamp((tl - 0.95) / 0.4);
        if (ap > 0) dottedArrow(c, [[PX + 268, PY + 108], [PX + 392, PY + 108]], ap, '#000080');
        if (ap >= 1) ptext(c, 'train on', PX + 330, PY + 98, SYSB, '#000080', 'center');
        if (tl > 1.3 && tl < 3.9) {
          for (let f = 0; f < 4; f++) {
            const ft = ((tl - 1.3) - f * 0.16) % 0.64; if (tl - 1.3 < f * 0.16) continue;
            const p = Math.floor((ft / 0.64) * 12) / 12; // stepped flight
            const k = Math.floor((tl - 1.3 - f * 0.16) / 0.64) * 4 + f;
            const [sx0, sy0, kind] = items[k % items.length];
            const ex = PX + 470, ey = PY + 90;
            const x = Math.round(H.lerp(sx0, ex, p)), y = Math.round(H.lerp(sy0, ey, p) - Math.sin(p * Math.PI) * 40);
            rect(c, x, y, 34, 34, '#fff'); rect(c, x, y, 34, 1, '#000'); rect(c, x, y + 33, 34, 1, '#000'); rect(c, x, y, 1, 34, '#000'); rect(c, x + 33, y, 1, 34, '#000');
            sprite(c, kind, x + 5, y + 5, 2);
            ptext(c, kind, x + 17, y + 46, SYSB, '#000080', 'center');
          }
        }
        const n = 1e6 * H.ease.inOut(H.clamp((tl - 1.3) / 2.4));
        if (tl > 1.2) {
          rect(c, PX + 262, PY + 132, 136, 62, '#fff'); bevel(c, PX + 262, PY + 132, 136, 62, 'field');
          ptext(c, fmt(n), PX + 330, PY + 163, F(800, 22), '#000080', 'center');
          ptext(c, 'examples', PX + 330, PY + 184, SYSB, '#000', 'center');
        }
        ptext(c, tl > 1.2 ? `Loading examples... ${fmt(n)} of 1,000,000` : 'Ready', 14, sy + 12, SYS, '#000');
        const pb = H.clamp((tl - 1.3) / 2.4), blocks = Math.floor((205 * pb) / 9);
        for (let i = 0; i < blocks; i++) rect(c, 418 + i * 9, sy + 3, 7, 10, C.navy);
        cur = cursorPath(t, [[T_MAIN, 330, 250], [3.5, 330, 230], [5.5, 110, 36], [5.9, 110, 36]]);
      } else if (tab === 1) {
        const tl = t - T_TRAIN;
        groupBox(c, PX + 10, PY + 10, 150, 160, 'New picture');
        rect(c, PX + 26, PY + 30, 116, 116, '#fff'); bevel(c, PX + 26, PY + 30, 116, 116, 'field');
        sprite(c, 'cat', PX + 36, PY + 40, 8);
        groupBox(c, PX + 210, PY + 10, 180, 160, 'Model');
        sprite(c, 'brain', PX + 246, PY + 26, 6);
        const adjP = H.clamp((tl - 2.6) / 0.6), stepA = Math.floor(adjP * 6) / 6;
        const ws = [[0.2, 0.7], [0.75, 0.35], [0.4, 0.9]];
        ws.forEach(([a, b], i) => trackbar(c, PX + 250, PY + 104 + i * 22, 120, H.lerp(a, b, stepA), 'w' + (i + 1)));
        if (adjP > 0 && adjP < 1) { const hl = Math.floor(tl * 10) % 2; if (hl) { rect(c, PX + 228, PY + 98, 154, 1, '#ff0000'); rect(c, PX + 228, PY + 166, 154, 1, '#ff0000'); } }
        groupBox(c, PX + 440, PY + 10, 160, 160, 'Guess');
        // arrows
        const a1 = H.clamp((tl - 0.15) / 0.3), a2 = H.clamp((tl - 0.5) / 0.3);
        if (a1 > 0) dottedArrow(c, [[PX + 164, PY + 88], [PX + 206, PY + 88]], a1, '#000080');
        if (a2 > 0) dottedArrow(c, [[PX + 394, PY + 60], [PX + 436, PY + 60]], a2, '#000080');
        const step = tl < 0.7 ? -1 : tl < 1.6 ? 0 : tl < 2.0 ? 1 : tl < 3.25 ? 2 : tl < 3.8 ? 0 : 1;
        const gx = PX + 520;
        if (tl > 0.95 && tl < 3.25) {
          ptext(c, 'dog?', gx, PY + 62, F(800, 22), '#c00000', 'center');
          if (tl > 1.6) {
            iconError(c, gx - 16, PY + 76);
            ptext(c, "Wrong - it's a cat", gx, PY + 126, SYSB, '#000', 'center');
            const bl = tl < 2.2 && Math.floor(tl * 8) % 2 === 0; // emphasis: focus box blinks
            if (bl || tl >= 2.2) { const col = '#ff0000'; rect(c, gx - 44, PY + 36, 88, 2, col); rect(c, gx - 44, PY + 70, 88, 2, col); rect(c, gx - 44, PY + 36, 2, 36, col); rect(c, gx + 42, PY + 36, 2, 36, col); }
          }
        }
        if (tl > 2.0 && tl < 3.25) { // error flows back to the weights
          const e = H.clamp((tl - 2.0) / 0.55);
          dottedArrow(c, [[PX + 520, PY + 150], [PX + 520, PY + 186], [PX + 316, PY + 186], [PX + 316, PY + 174]], e, '#ff0000');
          if (e > 0.3) ptext(c, 'error', PX + 430, PY + 182, SYSB, '#ff0000', 'center');
        }
        if (tl >= 3.4) {
          ptext(c, 'cat', gx, PY + 62, F(800, 22), '#008000', 'center');
          okIcon(c, gx - 12, PY + 80);
          ptext(c, 'Correct!', gx, PY + 126, SYSB, '#008000', 'center');
        }
        // loop diagram: Guess -> Check -> Adjust -> (back)
        const bx = [PX + 140, PX + 270, PX + 400], by = PY + 212;
        ['Guess', 'Check', 'Adjust'].forEach((lab, i) => button(c, bx[i], by, 86, 24, lab, i === step, i === step));
        dottedArrow(c, [[bx[0] + 90, by + 12], [bx[1] - 4, by + 12]], 1, '#000');
        dottedArrow(c, [[bx[1] + 90, by + 12], [bx[2] - 4, by + 12]], 1, '#000');
        dottedArrow(c, [[bx[2] + 90, by + 12], [bx[2] + 110, by + 12], [bx[2] + 110, by - 10], [bx[0] - 20, by - 10], [bx[0] - 20, by + 12], [bx[0] - 4, by + 12]], 1, '#808080');
        ptext(c, 'loop', bx[0] - 44, by + 16, SYS, '#808080', 'center');
        ptext(c, ['Training: guessing...', 'Training: checking answer...', 'Training: adjusting weights...'][Math.max(0, step)], 14, sy + 12, SYS, '#000');
        cur = cursorPath(t, [[T_TRAIN, 110, 36], [7.0, 470, 250], [9.6, 480, 250], [10.2, 186, 36], [10.4, 186, 36]]);
      } else {
        const tl = t - T_RES;
        const gx0 = PX + 40, gy0 = PY + 24, gw = 380, gh = 200;
        rect(c, gx0, gy0, gw, gh, '#fff'); bevel(c, gx0, gy0, gw, gh, 'field');
        for (let i = 1; i < 5; i++) for (let x = gx0 + 3; x < gx0 + gw - 3; x += 3) rect(c, x, gy0 + Math.round(i * gh / 5), 1, 1, '#a0a0a0');
        for (let i = 0; i <= 5; i++) ptext(c, String(50 + i * 10), gx0 - 4, gy0 + gh - Math.round(i * gh / 5) + 3, SYS, '#000', 'right');
        ptext(c, 'Accuracy %', gx0 + 6, gy0 - 4, SYSB, '#000');
        ptext(c, 'Training rounds  >', gx0 + gw / 2, gy0 + gh + 14, SYS, '#000', 'center');
        const pr = H.clamp((tl - 0.3) / 1.6), N = 20;
        const val = (i) => 61 + 36 * (1 - Math.pow(1 - i / (N - 1), 2.2)) + (i % 3 === 1 && i < N - 2 ? -1.5 : 0);
        const nShown = Math.floor(pr * (N - 1)) + 1;
        const P2 = (i) => [gx0 + 6 + Math.round(i * (gw - 12) / (N - 1)), gy0 + gh - Math.round(((val(i) - 50) / 50) * gh)];
        for (let i = 0; i < nShown - 1; i++) {
          const [x0, y0] = P2(i), [x1, y1] = P2(i + 1);
          const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
          for (let k = 0; k <= steps; k++) rect(c, Math.round(H.lerp(x0, x1, k / steps)) - 1, Math.round(H.lerp(y0, y1, k / steps)) - 1, 2, 2, '#008000');
        }
        for (let i = 0; i < nShown; i++) { const [x, y] = P2(i); rect(c, x - 2, y - 2, 5, 5, '#008000'); }
        const acc = Math.round(val(Math.min(N - 1, nShown - 1)));
        const shown = nShown >= N ? 97 : acc;
        groupBox(c, PX + 450, PY + 20, 150, 120, 'Accuracy');
        const hl = tl > 1.95;
        if (hl) { rect(c, PX + 466, PY + 50, 118, 44, C.navy); }
        ptext(c, shown + '%', PX + 525, PY + 86, F(800, 32), hl ? '#fff' : '#000', 'center');
        ptext(c, `round ${Math.min(N, nShown)} of ${N}`, PX + 525, PY + 118, SYS, '#000', 'center');
        ptext(c, 'started at 61%', PX + 525, PY + 130, SYS, '#808080', 'center');
        if (hl) { // tooltip lands on the last point
          const [x, y] = P2(N - 1);
          const tw = 80;
          rect(c, x - tw + 6, y + 14, tw, 18, '#ffffe1'); rect(c, x - tw + 6, y + 14, tw, 1, '#000'); rect(c, x - tw + 6, y + 31, tw, 1, '#000'); rect(c, x - tw + 6, y + 14, 1, 18, '#000'); rect(c, x + 5, y + 14, 1, 18, '#000');
          ptext(c, 'Best: 97%!', x - tw / 2 + 6, y + 27, SYSB, '#000', 'center');
          if (Math.floor(tl * 6) % 2) { rect(c, x - 6, y - 6, 13, 1, '#ff0000'); rect(c, x - 6, y + 6, 13, 1, '#ff0000'); rect(c, x - 6, y - 6, 1, 13, '#ff0000'); rect(c, x + 6, y - 6, 1, 13, '#ff0000'); }
        }
        ptext(c, `Training round ${Math.min(N, nShown)}...`, 14, sy + 12, SYS, '#000');
        const blocks = Math.floor((205 * pr) / 9);
        for (let i = 0; i < blocks; i++) rect(c, 418 + i * 9, sy + 3, 7, 10, C.navy);
        cur = cursorPath(t, [[T_RES, 186, 36], [11.2, 560, 200], [T_DONE, 560, 200], [13.6, 330, 238]]);
      }
      // ---- beat 5: message box ----
      if (done) {
        const mr = windowFrame(c, 150, 120, 340, 132, 'AI Trainer', true, { closeOnly: true });
        infoIcon(c, mr.x + 12, mr.y + 12);
        ptext(c, 'Training complete. The lesson:', mr.x + 56, mr.y + 22, SYS, '#000');
        ptext(c, 'More examples', mr.x + 56, mr.y + 46, F(800, 17), '#000');
        ptext(c, '-> better guesses', mr.x + 56, mr.y + 68, F(800, 17), '#000080');
        button(c, mr.x + mr.w / 2 - 36, mr.y + mr.h - 30, 72, 22, 'OK', true);
      }
      taskbarEx(c, t, ['AI Trainer'], 0);
    } else {
      cur = cursorPath(t, [[0, 400, 300], [1.2, 320, 210], [1.7, 320, 210]]);
      taskbarEx(c, t, t >= 0.3 ? ['AI Help'] : [], 0);
    }
    cursorArrow(c, cur[0], cur[1]);
  }

  // =====================================================================================
  // SOUND: a beige tower under the desk (fan + mains hum), real mouse-button clicks on every cursor click, hard-disk
  // chatter while the examples copy, slider notches, and generic system chimes (made up here, not real OS sounds).
  // All times copy explainW95: T_MAIN 1.95, T_TRAIN 5.95, T_RES 10.35, T_DONE 12.75.
  // =====================================================================================
  function w95Sound(k) {
    const END = 14.6, T_MAIN = 1.95, T_TRAIN = 5.95, T_RES = 10.35, T_DONE = 12.75;
    // mouse button: plastic snap (down) and a lighter release (up)
    const mouse = (t, pan = 0, g = 1) => {
      k.noise(t, { dur: 0.012, filter: 'bandpass', f: 2600, q: 1.6, gain: 0.32 * g, a: 0.0005, pan });
      k.tone(t, { f: [[0, 240], [0.03, 150]], dur: 0.04, gain: 0.1 * g, pan });
      k.noise(t + 0.09, { dur: 0.008, filter: 'bandpass', f: 3200, q: 1.6, gain: 0.16 * g, a: 0.0005, pan });
    };
    // a small soft UI click (buttons changing state, things landing), lower and duller than the mouse
    const soft = (t, f = 1400, g = 1, pan = 0) => k.noise(t, { dur: 0.014, filter: 'bandpass', f, q: 2, gain: 0.2 * g, a: 0.0008, pan, minor: true });
    // generic system chime: soft sine+triangle bell notes with a short tail
    const chime = (t, notes, g = 1, gap = 0.07) => notes.forEach((n, i) => {
      k.tone(t + i * gap, { f: n, dur: 1.1, gain: 0.13 * g, a: 0.004, verb: 0.3 });
      k.tone(t + i * gap, { f: k.hz(n) * 2, type: 'triangle', dur: 0.35, gain: 0.025 * g, a: 0.003, verb: 0.2 });
    });
    // outline-zoom rectangles: a short, low, smooth air sweep (no UI swoosh)
    const zoom = (t, d, up) => k.noise(t, { dur: d + 0.08, color: 'pink', filter: 'bandpass', f: up ? [[0, 300], [d, 900]] : [[0, 900], [d, 300]], q: 0.8, gain: 0.07, a: d * 0.6 });
    // hard-disk chatter: head seeks (dull thunks) and fast little read clicks
    const hdd = (t0, t1, g, seed) => {
      const r = H.rng(seed);
      k.withMinor(() => {
        for (let t = t0; t < t1; t += 0.03 + r() * 0.07) {
          if (r() < 0.22) k.noise(t, { dur: 0.03, color: 'brown', filter: 'bandpass', f: 420, q: 2, gain: 0.5 * g, a: 0.001, pan: 0.35 });
          else k.noise(t, { dur: 0.008, filter: 'bandpass', f: 1700 + r() * 900, q: 4, gain: 0.16 * g * (0.5 + r() * 0.5), a: 0.0005, pan: 0.35 });
        }
      });
    };

    // ---- the PC itself: fan + mains hum under everything
    k.bed('room', 0, END, { gain: 0.6 });
    k.bed('hum', 0, END, { gain: 0.45 });
    k.noise(0, { dur: END, color: 'pink', filter: 'bandpass', f: 520, q: 0.7, gain: 0.025, a: 0.4, hold: END - 0.8, bus: 'amb', minor: true }); // fan air (kept in VO, very low)

    // ---- beat 1: help dialog zooms out of the taskbar and chimes; cursor clicks OK; dialog zooms into the main window
    zoom(0.05, 0.25, true);
    chime(0.3, ['E5', 'B4'], 0.9, 0.11);                // question dialog appears (descending "?" chime)
    mouse(1.55, 0);                                     // OK pressed (button shows pressed at t > 1.55)
    zoom(1.75, T_MAIN - 1.75, true);
    hdd(T_MAIN, T_MAIN + 0.55, 0.9, 951);               // app loading off the disk

    // ---- tab 1: data icons pop in (12 items every 0.06 s from T_MAIN + 0.15; one click per two)
    for (let n = 0; n < 12; n += 2) soft(T_MAIN + 0.15 + n * 0.06, 1300 + n * 30, 0.9, -0.5 + n * 0.04);
    soft(T_MAIN + 1.35, 1100, 0.9, 0.1);               // "train on" arrow completes (tl 0.95..1.35)
    // copying 1,000,000 examples: disk chatter for the whole copy + one tick per progress-bar block (22 blocks, linear)
    const C0 = T_MAIN + 1.3, CL = 2.4;
    hdd(C0, C0 + CL, 1, 952);
    for (let i = 1; i <= 22; i++) k.noise(C0 + CL * (9 * i) / 205, { dur: 0.016, filter: 'bandpass', f: 2300, q: 2.5, gain: 0.13, a: 0.0006, pan: 0.6, minor: true });
    // cards dropping into the model: soft low thup on every other landing (one lands every 0.16 s from C0 + 0.64)
    for (let t = C0 + 0.64; t < T_MAIN + 3.9; t += 0.32) k.tone(t, { f: [[0, 260], [0.06, 140]], dur: 0.08, gain: 0.12, pan: 0.3, minor: true });

    // ---- tab 2: Train. cursor clicks the tab
    mouse(T_TRAIN, -0.4);
    const L = T_TRAIN;
    soft(L + 0.45, 1100, 0.8, -0.2); soft(L + 0.8, 1100, 0.8, 0.3);   // the two arrows complete
    soft(L + 0.7, 1500, 1, -0.2);                                     // Guess button goes down
    k.tone(L + 0.95, { f: [[0, 'G4'], [0.12, 'D4']], type: 'triangle', dur: 0.2, gain: 0.14, pan: 0.4 }); // "dog?" appears
    // CHECK: wrong! a generic system error: low dull two-note thunk + error box
    const WRONG = L + 1.6;
    soft(WRONG, 1500, 1, 0);
    k.play('error', WRONG, { gain: 1.0, f: 'E3', pan: 0.3 });
    k.play('thud', WRONG, { f: 110, gain: 0.45, pan: 0.3 });
    // ADJUST: error signal travels back (right -> left) along the dotted arrow
    soft(L + 2.0, 1500, 1, 0);
    k.tone(L + 2.0, { f: [[0, 520], [0.55, 240]], type: 'triangle', dur: 0.6, gain: 0.07, a: 0.05, hold: 0.4, pan: 0.5, minor: true });
    k.tone(L + 2.0, { f: [[0, 260], [0.55, 120]], type: 'triangle', dur: 0.6, gain: 0.05, a: 0.05, hold: 0.4, pan: -0.2, minor: true });
    // trackbar weights snap in 6 steps over tl 2.6..3.2: one slider notch per step
    for (let s = 1; s <= 6; s++) k.withMinor(() => k.play('tock', L + 2.6 + s * 0.1 - 1e-3, { f: 900 + s * 40, gain: 0.35, pan: -0.1 }));
    // GUESS again -> "cat" + Correct! (the correction)
    soft(L + 3.25, 1500, 1, 0);
    chime(L + 3.4, ['C5', 'E5', 'G5'], 1, 0.08);
    soft(L + 3.8, 1500, 1, 0);                          // Check button

    // ---- tab 3: Results. cursor clicks the tab, then the accuracy plot steps up one point every 1.6/19 s
    mouse(T_RES, -0.2);
    for (let i = 1; i < 20; i++) {
      const t = T_RES + 0.3 + (1.6 * i) / 19;
      k.noise(t, { dur: 0.016, filter: 'bandpass', f: 1500 + i * 45, q: 2.5, gain: 0.15 * (1 - i / 32), a: 0.0006, pan: -0.4 + i * 0.04, minor: true });
    }
    // 97% (biggest moment, tl > 1.95): generic "tada" fanfare, brassy saw through a lowpass, low thump underneath
    const BEST = T_RES + 1.95 + 1e-3;
    k.play('impact', BEST, { f: 120, gain: 0.9 });
    [['C4', 0], ['E4', 0.06], ['G4', 0.12], ['C5', 0.18]].forEach(([n, d]) => {
      k.tone(BEST + d, { f: n, type: 'sawtooth', dur: 0.95 - d, gain: 0.11, a: 0.01, hold: 0.45 - d, filter: 'lowpass', f2: [[0, 900], [0.15, 2400], [0.8, 1200]], verb: 0.3 });
      k.tone(BEST + d, { f: n, type: 'sawtooth', detune: 9, dur: 0.95 - d, gain: 0.08, a: 0.01, hold: 0.45 - d, filter: 'lowpass', f2: 1800, verb: 0.3 });
    });
    k.tone(BEST, { f: 'C3', type: 'triangle', dur: 1.1, gain: 0.28, hold: 0.45 });
    // takeaway message box: soft resolving info chime
    chime(T_DONE, ['G4', 'C5'], 1, 0.12);
    k.tone(T_DONE + 0.12, { f: 'C4', type: 'triangle', dur: 1.3, gain: 0.08, a: 0.01, verb: 0.3 });
  }

  registerStyle({
    id: 'win95',
    name: 'Win95 Desktop',
    category: 'Retro UI & Neon',
    description: 'A mid-90s beige-box desktop at 2x pixel scale: teal wallpaper, 2-pixel bevelled grey chrome, navy title bars, aliased system text and a trail of frozen error dialogs.',
    motion: 'Icons pop onto the desktop, windows open with outline-zoom rectangles, the install bar ticks in blocks then freezes, and the hung error box is dragged, smearing a stair of copies.',
    fonts: ['400 9px "Inter"', '700 9px "Inter"', '800 15px "Inter"', '800 9.5px "Inter"'],
    frameT: 6.3,
    duration: 6.5,
    readsPixels: true,
    explainerDuration: 14.6,
    explainerNote: 'An "AI Trainer" app explains it: the question dialog zooms into the title bar, beats are property-sheet tabs clicked by the cursor, dotted pixel arrows carry examples and the error signal, trackbar "weights" slide, counters live in status bars and group boxes, and the payoff is a classic message box.',
    explainer(ctx, W, H_, t) {
      const buf = H.layer(BW, BH), c = buf.getContext('2d', { willReadFrequently: true });
      c.imageSmoothingEnabled = false;
      explainW95(c, t);
      // camera: frames each beat at 3x pixels (zoom 1.5), pulls back to 2x for window/tab changes, 4x on the 97%
      const K = [[0, 320, 170, 1.5], [1.7, 320, 170, 1.5], [2.05, 320, 180, 1], [2.4, 200, 160, 1.5], [3.3, 200, 160, 1.5], [4.2, 420, 160, 1.5], [5.4, 420, 160, 1.5], [5.75, 320, 180, 1], [6.25, 240, 180, 1.5], [6.9, 240, 180, 1.5], [7.3, 440, 180, 1.5], [8.3, 440, 180, 1.5], [8.6, 360, 182, 1.5], [9.4, 360, 182, 1.5], [9.7, 440, 180, 1.5], [10.05, 320, 180, 1], [10.6, 228, 170, 1.5], [11.9, 228, 170, 1.5], [12.25, 520, 120, 2], [12.6, 520, 120, 2], [12.85, 350, 186, 1.3], [99, 350, 186, 1.3]];
      let cam = K[K.length - 1];
      for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) { const e = H.ease.inOut(H.clamp((t - K[i][0]) / (K[i + 1][0] - K[i][0]))); cam = [0, H.lerp(K[i][1], K[i + 1][1], e), H.lerp(K[i][2], K[i + 1][2], e), H.lerp(K[i][3], K[i + 1][3], e)]; break; }
      const sw = BW / cam[3], sh = BH / cam[3];
      const sx = Math.round(H.clamp(cam[1] - sw / 2, 0, BW - sw)), sy = Math.round(H.clamp(cam[2] - sh / 2, 0, BH - sh));
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buf, sx, sy, sw, sh, 0, 0, W, H_);
    },
    explainerSound(k) { w95Sound(k); },
    draw(ctx, W, H_, t) {
      const buf = H.layer(BW, BH), c = buf.getContext('2d', { willReadFrequently: true });
      c.imageSmoothingEnabled = false;
      rect(c, 0, 0, BW, BH, C.teal);

      // timeline (no easing anywhere except the outline "zoom" rectangles, like the real OS)
      const T_EXP = 1.15, T_WIZ = 1.75, T_ERR = 3.45, T_DRAG = 3.8, STEP = 0.17;
      const icons = [[6, iconComputer, 'My Computer'], [62, iconNetwork, 'Network\nNeighborhood'], [130, iconBin, 'Recycle Bin'], [186, iconFolder, 'Neural Net'], [242, iconDoc, 'README.TXT']];
      icons.forEach(([y, ic, label], i) => { if (t >= 0.25 + i * 0.13) desktopIcon(c, 6, y, ic, label, label === 'Neural Net' && t >= 0.85); });

      const zoomRect = (from, to, t0, t1) => {
        if (t < t0 || t >= t1) return;
        for (let k = 0; k < 3; k++) {
          const p = H.clamp((t - t0) / (t1 - t0) - k * 0.12); if (p <= 0) continue;
          const x = H.lerp(from[0], to[0], p), y = H.lerp(from[1], to[1], p), w = H.lerp(from[2], to[2], p), h = H.lerp(from[3], to[3], p);
          c.fillStyle = '#c0c0c0';
          c.fillRect(Math.round(x), Math.round(y), Math.round(w), 2); c.fillRect(Math.round(x), Math.round(y + h), Math.round(w), 2);
          c.fillRect(Math.round(x), Math.round(y), 2, Math.round(h)); c.fillRect(Math.round(x + w), Math.round(y), 2, Math.round(h) + 2);
        }
      };
      zoomRect([30, 200, 30, 20], [92, 6, 360, 140], 0.9, T_EXP);
      if (t >= T_EXP) explorerWindow(c, 92, 6, 360, 140);
      zoomRect([200, 60, 60, 40], [222, 34, 410, 262], T_WIZ - 0.25, T_WIZ);
      if (t >= T_WIZ) wizardWindow(c, 222, 34, 410, 262, t, t < T_ERR);

      // error dialog: pops up, then gets dragged and the hung app leaves a stair of copies
      const ex = 150, ey = 196, pos = (k) => [ex - k * 15, ey + k * 9];
      let cur = null;
      if (t >= T_ERR) {
        const STEPS = [0, 0.1, 0.28, 0.38, 0.6, 0.72]; // jerky, laggy redraws of a hung app
        let s = 0; for (let k = 1; k < STEPS.length; k++) if (t >= T_DRAG + STEPS[k - 1]) s = k;
        for (let k = 5; k > 5 - s; k--) errorDialog(c, ...pos(k), false);
        cur = pos(5 - s);
        errorDialog(c, ...cur, true);
      }

      // cursor
      if (t < T_WIZ) cursorArrow(c, Math.round(H.lerp(40, 300, H.clamp((t - 0.9) / 0.8))), Math.round(H.lerp(230, 200, H.clamp((t - 0.9) / 0.8))));
      else if (t < T_ERR) cursorHourglass(c, 470, 200);
      else if (t < T_DRAG + 0.95) {
        const p = H.clamp((t - T_ERR) / (T_DRAG - T_ERR));
        const tgt = [cur[0] + 90, cur[1] + 9];
        cursorArrow(c, Math.round(H.lerp(470, tgt[0], p)), Math.round(H.lerp(200, tgt[1], p)));
      } else {
        const p = H.ease.inOut(H.clamp((t - (T_DRAG + 1.15)) / 0.6));
        cursorArrow(c, Math.round(H.lerp(ex + 90, ex + 132, p)), Math.round(H.lerp(ey + 9, ey + 98, p)));
      }

      const open = t >= T_ERR ? 3 : t >= T_WIZ ? 2 : t >= T_EXP ? 1 : 0;
      taskbar(c, t, open, open - 1);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buf, 0, 0, W, H_);
    },
  });
}
```
