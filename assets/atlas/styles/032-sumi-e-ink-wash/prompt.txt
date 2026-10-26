I want an animated explainer made in the "Sumi-e Ink Wash" visual style (Painterly). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Cormorant Garamond, Noto Serif JP
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Noto+Serif+JP:wght@400;700;900&display=block">
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
Name: Sumi-e Ink Wash
Family: Painterly
Look: Monochrome Japanese ink painting on fibrous rice paper: dilute grey washes that bleed and fade into mist, a few confident loaded-brush strokes that split into dry bristle tracks, vast negative space, a vertical calligraphy column and a vermilion seal.
Motion: Mist drifts sideways across the peaks while each brush stroke is laid down in one sweep, bristles running dry as it travels; the tiny device on the ledge pulses with light.
How it explains: Told along a handscroll the camera unrolls, with mist drifting across between scenes; arrows and the chart are single loaded brush strokes that run dry, labels and numbers are ink-written in place, and vermilion strokes and seal stamps do the emphasis.

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

REFERENCE STYLE SOURCE (styles/sumi-e.js; W/H_ are always 1280x720)
```js
{
  // ---------------------------------------------------------------
  // Sumi-e — ink wash on rice paper
  // ---------------------------------------------------------------
  const INK = [22, 20, 19];

  // resample a polyline to a fixed spacing; pts = [[x,y,p], ...]
  function resample(pts, step) {
    const out = [pts[0]];
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      let tt = step - acc;
      while (tt <= d) { const u = tt / d; out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]); tt += step; }
      acc = (acc + d) % step;
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  // smooth Catmull-Rom through control points [[x,y,p]...]
  function spline(cp, n = 12) {
    const out = [];
    for (let i = 0; i < cp.length - 1; i++) {
      const p0 = cp[Math.max(0, i - 1)], p1 = cp[i], p2 = cp[i + 1], p3 = cp[Math.min(cp.length - 1, i + 2)];
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), f(p0[2], p1[2], p2[2], p3[2])]);
      }
    }
    out.push(cp[cp.length - 1]);
    return out;
  }

  // One loaded-brush stroke: a solid wet body with ragged edges, then "flying white" — the dry-brush streaks
  // where individual bristles ran out of ink — erased out of it, more and more toward the tail.
  let TMP = null;
  function brush(c, cp, o, nz) {
    const { w = 10, ink = 1, dry = 0.9, seed = 1, tone = 1, pool = 0.35, rim = 0.3, p: prog = 1 } = o;
    if (prog <= 0) return;
    const r = H.rng(seed);
    const pts = resample(spline(cp), 2);
    const N = pts.length;
    if (N < 2) return;
    const Np = prog >= 1 ? N : Math.floor(N * prog);    // the brush is still travelling: only lay what it has covered
    if (Np < 2) return;
    const nrm = pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      return [-dy / l, dx / l];
    });
    if (!TMP) TMP = H.layer(1280, 720);
    const tc = TMP.getContext('2d');
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    const m = w + 4; x0 = Math.max(0, Math.floor(x0 - m)); y0 = Math.max(0, Math.floor(y0 - m)); x1 = Math.min(1280, Math.ceil(x1 + m)); y1 = Math.min(720, Math.ceil(y1 + m));
    if (x1 <= x0 || y1 <= y0) return;
    tc.clearRect(x0, y0, x1 - x0, y1 - y0);
    const ph = r() * 100;
    const L = [], Rr = [];
    for (let i = 0; i < Np; i++) {
      const head = prog >= 1 ? 1 : Math.min(1, (Np - i) / 5);
      const p = pts[i], hw = Math.max(0.3, w * p[2] * 0.5 * head * (1 + nz.n2(ph + i * 0.06, 3.3) * 0.16));
      L.push([p[0] + nrm[i][0] * hw, p[1] + nrm[i][1] * hw]); Rr.push([p[0] - nrm[i][0] * hw, p[1] - nrm[i][1] * hw]);
    }
    tc.save();
    tc.fillStyle = `rgb(${INK})`; tc.strokeStyle = `rgb(${INK})`;
    tc.globalAlpha = Math.min(1, ink) * 0.9 * tone;
    tc.beginPath(); tc.moveTo(L[0][0], L[0][1]); for (let i = 1; i < Np; i++) tc.lineTo(L[i][0], L[i][1]);
    for (let i = Np - 1; i >= 0; i--) tc.lineTo(Rr[i][0], Rr[i][1]); tc.closePath(); tc.fill();
    if (rim > 0) { tc.globalAlpha = rim * tone; tc.lineWidth = 1.1; tc.stroke(); }
    if (pool > 0) {
      const p0 = pts[0], p1 = pts[Math.min(N - 1, 3)];
      tc.globalAlpha = pool * tone;
      tc.beginPath(); tc.ellipse((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, w * p0[2] * 0.48, w * p0[2] * 0.4, Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), 0, 7); tc.fill();
    }
    // flying white
    tc.globalCompositeOperation = 'destination-out'; tc.lineCap = 'butt'; tc.lineJoin = 'round';
    const nb = Math.max(4, Math.min(64, Math.round(w * 1.4)));
    const step = 2;
    for (let b = 0; b < nb; b++) {
      const off = ((b + r()) / nb) * 2 - 1, edge = Math.abs(off);
      const start = r() * 0.25 - (ink - 1) * 0.6, rate = dry * (0.5 + edge * edge * 1.1 + r() * 0.9);
      const lw = Math.max(0.5, (w / nb) * (0.5 + r() * 0.9));
      const ph2 = r() * 100;
      let run = null, sumA = 0;
      const flush = () => {
        if (run && run.length > 1) { tc.globalAlpha = H.clamp(sumA / run.length); tc.lineWidth = lw; tc.beginPath(); tc.moveTo(run[0][0], run[0][1]); for (let k = 1; k < run.length; k++) tc.lineTo(run[k][0], run[k][1]); tc.stroke(); }
        run = null; sumA = 0;
      };
      for (let i = 0; i < Np; i += step) {
        const s = i / N;
        const dness = start + s * rate + nz.n2(ph2 + i * 0.05, b * 0.53) * 0.4;
        if (dness < 0.5) { flush(); continue; }
        const p = pts[i], h = w * p[2] * 0.5 * off;
        const pos = [p[0] + nrm[i][0] * h, p[1] + nrm[i][1] * h];
        if (!run) run = [];
        run.push(pos); sumA += (dness - 0.5) * 3;
        if (run.length >= 8) { flush(); run = [pos]; sumA = (dness - 0.5) * 3; }
      }
      flush();
    }
    tc.restore();
    c.drawImage(TMP, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
    return [x0, y0, x1, y1];
  }

  // Kozo rice paper, shared by the still and the scroll: cloudy fibre formation (mottle), a fine pulp grain,
  // faint old sizing stains, and hair-like fibres -- the light ones kept subtle so they read as fibre, not scratches.
  function makePaper(w, h, nz, R, nFib) {
    const pw = H.layer(w, h), p = pw.getContext('2d');
    p.fillStyle = '#efe7d6'; p.fillRect(0, 0, w, h);
    const cw = Math.ceil(w / 20), ch = Math.ceil(h / 20);
    const big = H.layer(cw, ch), bx = big.getContext('2d');
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) { const v = nz.fbm2(i * 0.12, j * 0.12, 3); bx.fillStyle = v > 0 ? `rgba(255,252,242,${Math.min(1, v * 0.8)})` : `rgba(176,160,128,${Math.min(1, -v * 0.45)})`; bx.fillRect(i, j, 1, 1); }
    p.imageSmoothingEnabled = true; p.drawImage(big, 0, 0, w, h);
    // flocculation: finer clouds of denser pulp (the formation you see holding washi up to light)
    const fw = Math.ceil(w / 6), fh = Math.ceil(h / 6), fl = H.layer(fw, fh), fx = fl.getContext('2d'), fi = fx.createImageData(fw, fh), fd = fi.data;
    for (let j = 0; j < fh; j++) for (let i = 0; i < fw; i++) { const v = nz.fbm2(i * 0.11 + 40, j * 0.11 + 17, 3), k = (j * fw + i) * 4; if (v > 0) { fd[k] = 255; fd[k + 1] = 253; fd[k + 2] = 246; fd[k + 3] = Math.min(255, v * 90); } else { fd[k] = 170; fd[k + 1] = 152; fd[k + 2] = 120; fd[k + 3] = Math.min(255, -v * 40); } }
    fx.putImageData(fi, 0, 0); p.drawImage(fl, 0, 0, w, h);
    // pulp grain
    const gi = p.getImageData(0, 0, w, h), gd = gi.data, gr = H.rng(31337);
    for (let i = 0; i < gd.length; i += 4) { const v = (gr() - 0.5) * 9 + (gr() < 0.004 ? -26 * gr() : 0); gd[i] += v; gd[i + 1] += v; gd[i + 2] += v * 0.9; }
    p.putImageData(gi, 0, 0);
    p.lineCap = 'round';
    for (let i = 0; i < nFib; i++) {
      const x = R() * w, y = R() * h, len = R.range(10, 70), a = R() * Math.PI * 2, bend = R.gauss() * 0.6, dark = R.chance(0.45);
      p.strokeStyle = dark ? `rgba(150,130,100,${R.range(0.07, 0.2)})` : `rgba(255,253,246,${R.range(0.12, 0.3)})`; p.lineWidth = R.range(0.4, 1.3);
      p.beginPath(); p.moveTo(x, y); p.quadraticCurveTo(x + Math.cos(a + bend) * len * 0.5, y + Math.sin(a + bend) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len); p.stroke();
    }
    return pw;
  }
  let HERO_PAPER = null, HERO_PAPER_KEY = '';


  // =================================================================
  // EXPLAINER — "How does AI learn?" told along a handscroll: the camera unrolls it right-to-left,
  // a drift of mist passes between scenes, everything is brush-written in ink with vermilion accents.
  // =================================================================
  const SXW = 3400;
  let SXC = null;
  const lerp = (a, b, u) => a + (b - a) * u;
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ez = (u) => H.ease.inOut(cl(u));
  const win = (t, a, b) => cl((t - a) / (b - a));
  const VERM = [184, 50, 42];
  const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  function sumiCache() {
    if (SXC) return SXC;
    const C = {}, nz = H.makeNoise(808), R = H.rng(4242);
    C.nz = nz;
    // --- the scroll: rice paper with fibres, mottled, long enough to pan across ---
    const pw = makePaper(SXW, 720, nz, R, 2600);
    // --- a far landscape painted faintly along the scroll: pale graded washes of distant peaks dissolving
    // into mist, the same treatment as the still's far range, kept light so the story reads over it ---
    {
      const pk = (x, c, h, sd) => h * Math.exp(-Math.pow((x - c) / sd, 2));
      const range = (x0, x1, ridge, tone, fade, mistY, mistR, seed) => {
        const w = x1 - x0, tops = new Float32Array(w); let ymin = 720;
        for (let i = 0; i < w; i++) { tops[i] = ridge(x0 + i); ymin = Math.min(ymin, tops[i]); }
        ymin = Math.max(0, Math.floor(ymin) - 4); const h = 720 - ymin;
        const L = H.layer(w, h), lc = L.getContext('2d'), img = lc.createImageData(w, h), d = img.data;
        for (let i = 0; i < w; i++) {
          const x = x0 + i, top = tops[i], m = mistY + nz.n2(x * 0.006, seed) * mistR * 0.8, hf = H.smooth(x0, x0 + 160, x) * H.smooth(x1, x1 - 160, x);
          for (let y = Math.max(ymin, Math.floor(top)); y < 720; y++) {
            const dy = y - top;
            let al = (0.3 + 0.7 * Math.exp(-dy / fade) + 0.18 * Math.exp(-dy / 4)) * H.smooth(m + mistR, m - mistR * 0.4, y) * hf;
            al *= 0.75 + 0.5 * H.clamp(nz.fbm2(x * 0.012, y * 0.02 + seed, 3) + 0.5);
            if (dy < 2) al *= Math.max(0, dy / 2);
            if (al < 0.003 && dy > 4 && y > m) break;
            const k = ((y - ymin) * w + i) * 4; d[k] = INK[0]; d[k + 1] = INK[1]; d[k + 2] = INK[2]; d[k + 3] = Math.min(255, al * tone * 255);
          }
        }
        lc.putImageData(img, 0, 0);
        p.save(); p.globalCompositeOperation = 'multiply'; p.filter = 'blur(1.6px)'; p.drawImage(L, x0, ymin); p.restore();
      };
      const p = pw.getContext('2d');
      // low hills under the river scene and the check
      range(420, 1560, (x) => 640 - pk(x, 760, 120, 170) - pk(x, 900, 70, 90) - pk(x, 1240, 95, 160) - pk(x, 1380, 60, 70) + nz.fbm2(x * 0.016, 2.2, 4) * 26 + Math.abs(nz.n2(x * 0.05, 4)) * 10, 0.16, 70, 610, 55, 3);
      range(1820, 2300, (x) => 690 - pk(x, 2000, 120, 110) - pk(x, 2120, 80, 70) + nz.fbm2(x * 0.018, 5.5, 4) * 20, 0.14, 60, 650, 45, 7);
      // a tall far peak beside the summit of the chart
      range(3010, 3400, (x) => 620 - pk(x, 3220, 300, 120) - pk(x, 3150, 170, 60) - pk(x, 3300, 210, 50) + nz.fbm2(x * 0.016, 8.8, 4) * 30 + Math.abs(nz.n2(x * 0.05, 9)) * 14, 0.2, 130, 560, 70, 11);
    }
    C.paper = pw;
    // --- small ink sketches of a cat and a dog (a handful of brush strokes each) ---
    const sketch = (dog) => {
      const cv = H.layer(200, 200), c = cv.getContext('2d');
      const S = (cp, o) => brush(c, cp, Object.assign({ pool: 0.2 }, o), nz);
      if (dog) {
        S([[64, 70, 0.5], [100, 52, 1], [140, 72, 0.8], [146, 120, 0.7], [100, 150, 0.9], [58, 122, 0.6], [62, 76, 0.3]], { w: 9, ink: 1.05, dry: 0.9, seed: 3 });
        S([[66, 70, 1], [46, 104, 0.9], [52, 132, 0.4]], { w: 16, ink: 1.2, dry: 0.5, seed: 4 });
        S([[138, 70, 1], [158, 104, 0.9], [152, 132, 0.4]], { w: 16, ink: 1.2, dry: 0.5, seed: 5 });
        S([[96, 118, 1], [104, 120, 0.9]], { w: 12, ink: 1.4, dry: 0.1, seed: 6, pool: 0.6 });
      } else {
        S([[62, 92, 0.5], [70, 60, 0.8], [100, 56, 1], [134, 62, 0.8], [144, 100, 0.8], [124, 140, 0.9], [84, 142, 0.8], [60, 104, 0.4]], { w: 9, ink: 1.05, dry: 0.9, seed: 13 });
        S([[66, 70, 0.9], [64, 34, 0.5], [90, 58, 0.3]], { w: 8, ink: 1.1, dry: 0.8, seed: 14 });
        S([[136, 70, 0.9], [140, 34, 0.5], [112, 58, 0.3]], { w: 8, ink: 1.1, dry: 0.8, seed: 15 });
        for (const s of [-1, 1]) for (let k = 0; k < 2; k++) S([[100 + s * 18, 116 + k * 6, 0.6], [100 + s * 50, 108 + k * 12, 0.2]], { w: 2.2, ink: 1, dry: 0.6, seed: 16 + k + (s > 0 ? 2 : 0), pool: 0 });
      }
      S([[84, 98, 1], [86, 101, 0.9]], { w: 8, ink: 1.4, dry: 0.1, seed: 21, pool: 0.6 });
      S([[116, 98, 1], [118, 101, 0.9]], { w: 8, ink: 1.4, dry: 0.1, seed: 22, pool: 0.6 });
      return cv;
    };
    C.cat = sketch(false); C.dog = sketch(true);
    // --- slips of washi for the pictures: deckled torn edges, the paper's own fibres, a soft lift shadow ---
    const slip = (img, sz, seed) => {
      const pad = 12, cv = H.layer(sz + pad * 2, sz + pad * 2), c = cv.getContext('2d'), sr = H.rng(seed);
      const path = new Path2D(), cs = [[pad, pad], [pad + sz, pad], [pad + sz, pad + sz], [pad, pad + sz]], nseg = Math.round(sz / 4);
      for (let e = 0; e < 4; e++) { const [ax, ay] = cs[e], [bx2, by2] = cs[(e + 1) % 4], nx = (by2 - ay) / sz, ny = -(bx2 - ax) / sz;
        for (let k = 0; k < nseg; k++) { const u = k / nseg, j = (nz.n2(seed + e * 3.1, k * 0.35) * 1.1 + sr.gauss() * 0.35) * Math.min(1, u * 8, (1 - u) * 8 + 0.15); const x = ax + (bx2 - ax) * u + nx * j, y = ay + (by2 - ay) * u + ny * j; e === 0 && k === 0 ? path.moveTo(x, y) : path.lineTo(x, y); } }
      path.closePath();
      c.save(); c.shadowColor = 'rgba(60,50,30,0.26)'; c.shadowBlur = 7; c.shadowOffsetX = 1.5; c.shadowOffsetY = 3; c.fillStyle = 'rgb(248,244,233)'; c.fill(path); c.restore();
      c.save(); c.clip(path);
      c.globalAlpha = 0.5; c.drawImage(C.paper, 300 + sr() * 2600, sr() * 300, sz, sz, pad, pad, sz, sz); c.globalAlpha = 1;
      const vg = c.createRadialGradient(pad + sz / 2, pad + sz / 2, sz * 0.3, pad + sz / 2, pad + sz / 2, sz * 0.75); vg.addColorStop(0, 'rgba(255,255,255,0)'); vg.addColorStop(1, 'rgba(150,130,100,0.10)');
      c.fillStyle = vg; c.fillRect(0, 0, cv.width, cv.height);
      c.globalCompositeOperation = 'multiply'; c.drawImage(img, pad, pad, sz, sz);
      c.restore();
      // torn edge: the long fibres feather out lighter, with a faint grey where the slip curls up from the scroll
      c.save(); c.strokeStyle = 'rgba(255,253,246,0.7)'; c.lineWidth = 1.4; c.stroke(path);
      c.strokeStyle = 'rgba(120,104,80,0.16)'; c.lineWidth = 0.7; c.translate(0.4, 0.6); c.stroke(path); c.restore();
      c.lineCap = 'round';
      for (let k = 0; k < sz * 0.5; k++) { const e = sr() * 4 | 0, u = sr(), [ax, ay] = cs[e], [bx2, by2] = cs[(e + 1) % 4], nx = (by2 - ay) / sz, ny = -(bx2 - ax) / sz, x = ax + (bx2 - ax) * u, y = ay + (by2 - ay) * u, l = sr.range(1.5, 4.5), a = Math.atan2(ny, nx) + sr.gauss() * 0.6;
        c.strokeStyle = `rgba(250,246,236,${sr.range(0.4, 0.8)})`; c.lineWidth = sr.range(0.4, 0.8); c.beginPath(); c.moveTo(x - nx, y - ny); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
      cv.pad = pad; cv.sz = sz;
      return cv;
    };
    C.slipCat = slip(C.cat, 92, 61); C.slipDog = slip(C.dog, 92, 62); C.slipBig = slip(C.cat, 210, 63);
    // --- the river of examples: a pale ink wash laid wet between two banks (revealed as it flows).
    // Pigment pools into a darker tide-line along each bank, the current leaves lighter streaks, the wash is
    // mottled where the water sat unevenly, settles into the paper tooth, and dissolves inside the ensō.
    const rv = H.layer(1300, 400), r = rv.getContext('2d');
    const bank = (x, o) => 200 + Math.sin(x * 0.006 + 0.4) * 50 - x * 0.08 + o + nz.n2(x * 0.02, o) * 6;
    {
      const img = r.createImageData(1300, 400), d = img.data;
      for (let x = 0; x < 1300; x++) {
        const top = bank(x, -40), bot = bank(x, 60), fadeR = H.smooth(1080, 920, x);
        if (fadeR <= 0) continue;
        const y0 = Math.max(0, Math.floor(top - 8)), y1 = Math.min(400, Math.ceil(bot + 8));
        for (let y = y0; y < y1; y++) {
          const e = Math.min(y - top, bot - y);                       // distance inside the nearest bank
          let al = e < 0 ? Math.exp(e / 1.6) : 1;                      // a hair of bleed past the bank
          const ee = Math.max(0, e);
          al *= 0.075 + 0.13 * Math.exp(-ee / 4.5) + 0.05 * Math.exp(-ee / 16);   // tide-line pooled along the banks
          const flow = nz.n2(x * 0.005, y * 0.07) + 0.5 * nz.n2(x * 0.012 + 9, y * 0.16);
          al *= 0.62 + 0.55 * H.clamp(flow + 0.55);                    // lighter streaks where the current ran
          al *= 0.75 + 0.5 * H.clamp(nz.fbm2(x * 0.01 + 3, y * 0.025, 3) + 0.5);  // uneven water
          const gr = nz.n2(x * 0.45, y * 0.45);
          al *= 0.86 + 0.32 * Math.max(0, gr);                         // pigment settling into the tooth
          al *= fadeR;
          const k = (y * 1300 + x) * 4; d[k] = INK[0]; d[k + 1] = INK[1]; d[k + 2] = INK[2]; d[k + 3] = Math.min(255, al * 255);
        }
      }
      const tmp = H.layer(1300, 400); tmp.getContext('2d').putImageData(img, 0, 0);
      r.filter = 'blur(1.2px)'; r.drawImage(tmp, 0, 0); r.filter = 'none';
    }
    C.river = rv; C.bank = bank;
    // --- a seal stamp ---
    C.seal = (txt, size) => {
      const cv = H.layer(size + 8, size + 8), c = cv.getContext('2d'), sr = H.rng(txt.length * 31 + size);
      c.fillStyle = `rgb(${VERM})`; c.beginPath();
      const s = size, corners = [[4, 4], [4 + s, 4], [4 + s, 4 + s], [4, 4 + s]];
      for (let e = 0; e < 4; e++) { const [ax, ay] = corners[e], [bx2, by2] = corners[(e + 1) % 4]; for (let k = 0; k < 8; k++) { const u = k / 8, x = ax + (bx2 - ax) * u + sr.gauss() * 0.7, y = ay + (by2 - ay) * u + sr.gauss() * 0.7; e === 0 && k === 0 ? c.moveTo(x, y) : c.lineTo(x, y); } }
      c.closePath(); c.fill();
      c.globalCompositeOperation = 'destination-out'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = `600 ${Math.round(s * (txt.length > 2 ? 0.5 : 0.62))}px ${/[a-z]/i.test(txt) ? '"Cormorant Garamond"' : '"Noto Serif JP"'}`;
      c.fillText(txt, 4 + s / 2, 4 + s / 2 + 1);
      for (let k = 0; k < s * 2; k++) { c.globalAlpha = sr.range(0.3, 1); c.beginPath(); c.arc(4 + sr() * s, 4 + sr() * s, sr.range(0.3, 1.2), 0, 7); c.fill(); }
      return cv;
    };
    C.sealCat = C.seal('cat', 52); C.sealDog = C.seal('dog', 52); C.sealKnow = C.seal('知', 46);
    SXC = C;
    return C;
  }

  // ink lettering (Cormorant), written left to right, with a little bleed into the fibres
  function inkText(c, str, x, y, size, { align = 'left', reveal = 1, italic = true, col = '22,20,19', alpha = 0.92, weight = italic ? 400 : 600 } = {}) {
    if (reveal <= 0) return;
    c.save();
    c.font = `${italic ? 'italic ' : ''}${weight} ${size}px "Cormorant Garamond"`; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    const w = c.measureText(str).width, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    if (reveal < 1) { c.beginPath(); c.rect(x0 - 10, y - size * 1.2, (w + 20) * reveal, size * 1.7); c.clip(); }
    c.fillStyle = `rgba(${col},${alpha * 0.3})`; c.filter = 'blur(1.4px)'; c.fillText(str, x0, y); c.filter = 'none';
    c.fillStyle = `rgba(${col},${alpha})`; c.fillText(str, x0, y);
    c.restore();
  }

  // Ink is laid into a screen-space layer, then pressed into the paper: a soft bleed copy (the ink wicking along
  // the fibres) under the sharp stroke, both multiplied, exactly like the still's strokes(). Only the dirty box is touched.
  let INKL = null, VERL = null, SCR = null;
  const BLEED = [[1.4, 0.5], [-1.2, 1.1], [0.4, -1.5], [-0.9, -0.7], [1.6, -1.2]];
  const grow = (A, b) => (b ? (A ? [Math.min(A[0], b[0]), Math.min(A[1], b[1]), Math.max(A[2], b[2]), Math.max(A[3], b[3])] : b.slice()) : A);
  function pressInk(ctx, L, bb, col) {
    if (!bb) return;
    const x0 = Math.max(0, bb[0] - 6), y0 = Math.max(0, bb[1] - 6), x1 = Math.min(L.width, bb[2] + 6), y1 = Math.min(L.height, bb[3] + 6), w = x1 - x0, h = y1 - y0;
    if (w <= 0 || h <= 0) return;
    const lc = L.getContext('2d');
    if (col) { lc.save(); lc.globalCompositeOperation = 'source-in'; lc.fillStyle = col; lc.fillRect(x0, y0, w, h); lc.restore(); }
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    // bleed: a few faint sub-pixel offset copies (a cheap 1.5px blur -- the canvas blur filter is slow here)
    ctx.globalAlpha = 0.17; for (const [dx, dy] of BLEED) ctx.drawImage(L, x0, y0, w, h, x0 + dx, y0 + dy, w, h);
    ctx.globalAlpha = 1; ctx.drawImage(L, x0, y0, w, h, x0, y0, w, h); ctx.restore();
    lc.clearRect(x0, y0, w, h);
  }
  // chart geometry (world coordinates); shared by the wash cache and the ridge stroke
  const CX0 = 2240, CY0 = 560, CW = 780, CH = 360, CN = 24;
  function chartPts() {
    const pts = [];
    for (let i = 0; i <= CN; i++) { const acc = 61 + 36 * (1 - Math.exp(-i / 5.5)) / (1 - Math.exp(-CN / 5.5)) + (i > 0 && i < CN ? Math.sin(i * 2.7) * 1.6 : 0); pts.push([CX0 + i / CN * CW, CY0 - (acc - 50) / 50 * CH, 0.6 + 0.4 * Math.sin(i * 1.3) ** 2]); }
    return pts;
  }
  // the wash under the ridge: dense and pooled just under the stroke, mottled, settling into the tooth, dissolving
  // toward the baseline and at the right end -- an ink wash rather than a clipped gradient
  let CWASH = null;
  function chartWash(nz) {
    if (CWASH) return CWASH;
    const pts = chartPts(), sp = spline(pts, 16), wx0 = CX0 - 4, wy0 = CY0 - CH - 30, ww = CW + 40, wh = CH + 46;
    const top = new Float32Array(ww).fill(1e9);
    for (let i = 0; i < sp.length - 1; i++) { const a = sp[i], b = sp[i + 1]; for (let x = Math.ceil(a[0]); x <= b[0]; x++) { const u = (x - a[0]) / ((b[0] - a[0]) || 1), xi = x - wx0; if (xi >= 0 && xi < ww) top[xi] = a[1] + (b[1] - a[1]) * u + 3; } }
    const cv = H.layer(ww, wh), c = cv.getContext('2d'), img = c.createImageData(ww, wh), d = img.data;
    for (let xi = 0; xi < ww; xi++) {
      const x = xi + wx0, tp = top[xi]; if (tp > 1e8) continue;
      const hf = H.smooth(CX0 - 2, CX0 + 14, x) * H.smooth(CX0 + CW + 6, CX0 + CW - 50, x);
      for (let yi = Math.max(0, Math.floor(tp - wy0)); yi < wh; yi++) {
        const y = yi + wy0, dy = y - tp;
        let al = 0.05 + 0.2 * Math.exp(-dy / 75) + 0.13 * Math.exp(-dy / 5);     // wet edge pooled under the ridge
        al *= H.smooth(CY0 + 2, CY0 - 150, y) * 0.85 + 0.15 * H.smooth(CY0 + 2, CY0 - 20, y);
        al *= 0.7 + 0.6 * H.clamp(nz.fbm2(x * 0.009, y * 0.014 + 50, 3) + 0.5);
        al *= 0.84 + 0.36 * Math.max(0, nz.n2(x * 0.42 + 7, y * 0.42));
        if (dy < 1) al *= Math.max(0, dy);
        al *= hf;
        const k = (yi * ww + xi) * 4; d[k] = INK[0]; d[k + 1] = INK[1]; d[k + 2] = INK[2]; d[k + 3] = Math.min(255, al * 255);
      }
    }
    c.putImageData(img, 0, 0);
    // lighter blooms where the water sat unevenly
    c.globalCompositeOperation = 'destination-out'; const rr = H.rng(173);
    for (let k = 0; k < 14; k++) { const x = rr.range(30, ww - 60), y = rr.range(CH * 0.25, wh - 40), rx = rr.range(30, 80), ry = rr.range(10, 28);
      const g = c.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, `rgba(0,0,0,${rr.range(0.15, 0.35)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.save(); c.translate(x, y); c.scale(1, ry / rx); c.translate(-x, -y); c.fillStyle = g; c.beginPath(); c.arc(x, y, rx, 0, 7); c.fill(); c.restore(); }
    CWASH = { cv, x: wx0, y: wy0 };
    return CWASH;
  }

  function explainSumi(ctx, W, H_, t) {
    const C = sumiCache(), nz = C.nz;
    if (!INKL || INKL.width !== W || INKL.height !== H_) { INKL = H.layer(W, H_); VERL = H.layer(W, H_); SCR = H.layer(W, H_); }
    const ic = INKL.getContext('2d'), vc = VERL.getContext('2d');
    let IB = null;
    const flush = () => { pressInk(ctx, INKL, IB, null); IB = null; };
    // vermilion strokes: brushed into their own layer, tinted, pressed in with the same bleed
    // (multiply commutes, so all the vermilion of a frame is pressed in once at the end)
    let VBB = null;
    const verm = (fn) => { const VB = (cp, o) => { VBB = grow(VBB, brush(vc, cp.map(([x, y, p]) => [x - cam, y, p]), o, nz)); }; fn(VB); };
    const cam = Math.round(780 * ez((t - 6.0) / 0.95) + 1300 * ez((t - 10.45) / 0.95));
    ctx.drawImage(C.paper, cam, 0, W, H_, 0, 0, W, H_);
    const X = (x) => x - cam;
    // brush in world coordinates (the brush engine works in screen space)
    const B = (cp, o) => { const pts = cp.map(([x, y, p]) => [x - cam, y, p]); let mn = 1e9, mx = -1e9; pts.forEach((q) => { mn = Math.min(mn, q[0]); mx = Math.max(mx, q[0]); }); if (mx < -60 || mn > W + 60) return; IB = grow(IB, brush(ic, pts, o, nz)); };

    // ---------- beat 2 scenery: the river of examples flowing into the ensō (the model) ----------
    const ex0 = 1100, ey0 = 330, er = 128;            // ensō centre / radius
    if (t > 1.0) {
      const rp = win(t, 1.6, 3.0);
      if (rp > 0) {   // the wash spreads along the river with a soft wet front
        const rx0 = Math.max(0, X(-40)), rx1 = Math.min(W, X(-40) + 1300);
        if (rx1 > rx0) {
          const lc = SCR.getContext('2d'); lc.clearRect(rx0, 130, rx1 - rx0, 400); lc.drawImage(C.river, X(-40), 130);
          if (rp < 1) { lc.globalCompositeOperation = 'destination-in'; const f = X(-40) + 1400 * rp, g = lc.createLinearGradient(f - 160, 0, f, 0); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
            lc.fillStyle = g; lc.fillRect(rx0, 130, rx1 - rx0, 400); lc.globalCompositeOperation = 'source-over'; }
          ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(SCR, rx0, 130, rx1 - rx0, 400, rx0, 130, rx1 - rx0, 400); ctx.restore();
        }
      }
      const bankL = [], bankR = [];
      for (let x = -40; x <= 1010; x += 70) { bankL.push([x, 130 + C.bank(x + 40, -40), 0.5 + 0.4 * Math.sin(x * 0.01)]); bankR.push([x, 130 + C.bank(x + 40, 60), 0.6 + 0.3 * Math.cos(x * 0.012)]); }
      B(bankL, { w: 7, ink: 1.0, dry: 1.0, seed: 71, tone: 0.8, p: ez((t - 1.6) / 1.2) });
      B(bankR, { w: 9, ink: 1.1, dry: 0.9, seed: 72, tone: 0.85, p: ez((t - 1.8) / 1.2) });
    }
    // the ensō: one breath, one stroke, dry at the tail
    {
      const cp = []; for (let i = 0; i <= 28; i++) { const a = -Math.PI * 0.62 + i / 28 * Math.PI * 1.86; cp.push([ex0 + Math.cos(a) * er * (1 + 0.04 * Math.sin(i)), ey0 + Math.sin(a) * er, i < 3 ? 0.7 + i * 0.1 : 1 - i / 28 * 0.5]); }
      B(cp, { w: 26, ink: 1.3, dry: 0.5, seed: 81, p: ez((t - 1.2) / 0.9) });
      if (t > 2.4) { B([[ex0 - 70, ey0 + 150, 0.4], [ex0 - 100, ey0 + 205, 0.3]], { w: 2, ink: 1, dry: 0.5, seed: 82, pool: 0, p: win(t, 2.4, 2.6) }); inkText(ctx, 'the model', X(ex0 - 100), ey0 + 240, 34, { align: 'center', reveal: win(t, 2.5, 3.0) }); }
      // three reeds inside the circle: the model's "weights"; they swing when it adjusts
      const adj = ez((t - 8.7) / 0.7);
      for (let k = 0; k < 3; k++) {
        if (t < 2.2) break;
        const bx = ex0 - 46 + k * 46, a = -Math.PI / 2 + (k - 1) * 0.5 + adj * (k === 1 ? 0.7 : -0.55) * (k === 0 ? -1 : 1);
        B([[bx, ey0 + 52, 1], [bx + Math.cos(a) * 46, ey0 + 52 + Math.sin(a) * 46, 0.7], [bx + Math.cos(a) * 82, ey0 + 52 + Math.sin(a) * 82, 0.2]], { w: 7, ink: 1.1, dry: 1.1, seed: 90 + k + (adj > 0.5 ? 10 : 0), p: win(t, 2.2 + k * 0.15, 2.5 + k * 0.15) });
      }
      if (t > 8.6 && t < 9.7) { // a ripple of ink spreading from the circle as it adjusts
        const k = win(t, 8.6, 9.7);
        // a soft wet ring of dilute ink with a darker tide-line at its outer edge, thinning as it spreads
        const rr = er + 20 + k * 90, cx = X(ex0), fa = 1 - k, g = ctx.createRadialGradient(cx, ey0, Math.max(0, rr - 12), cx, ey0, rr + 3);
        g.addColorStop(0, 'rgba(22,20,19,0)'); g.addColorStop(0.5, `rgba(22,20,19,${0.06 * fa})`); g.addColorStop(0.8, `rgba(22,20,19,${0.3 * fa})`); g.addColorStop(0.9, `rgba(22,20,19,${0.2 * fa})`); g.addColorStop(1, 'rgba(22,20,19,0)');
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, ey0, rr + 5, 0, 7); ctx.fill(); ctx.restore();
      }
    }
    flush();
    // slips of paper float down the river, each with a vermilion seal saying what it is
    const at = (u) => { const x = lerp(-80, ex0 - 90, u); return [x, 130 + (C.bank(x + 40, -40) + C.bank(x + 40, 60)) / 2 - 6 + Math.sin(u * 9) * 6]; };
    for (let i = 0; i < 22; i++) {
      const s0 = 2.6 + i * 0.16, u = (t - s0) / 1.9;
      if (u <= 0 || u >= 1) continue;
      const [x, y] = at(u), dog = H.rng(i * 23 + 5)() < 0.5, sc = u > 0.82 ? 1 - (u - 0.82) / 0.18 * 0.9 : 1, sz = 92 * sc;
      ctx.save(); ctx.translate(X(x), y - 40); ctx.rotate(Math.sin(i * 1.7 + t) * 0.08); ctx.globalAlpha = sc;
      { const sl = dog ? C.slipDog : C.slipCat, q = sz / sl.sz, e = (sl.sz / 2 + sl.pad) * q; ctx.drawImage(sl, -e, -e, 2 * e, 2 * e); }
      if (sc > 0.6) { ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(dog ? C.sealDog : C.sealCat, sz / 2 - 30, sz / 2 - 26, 56, 56); }
      ctx.restore();
    }
    if (t > 2.9) {
      const n = t > 5.6 ? 1e6 : Math.round(1e6 * H.ease.in(win(t, 3.0, 5.6)) / 1000) * 1000;
      inkText(ctx, fmt(n), X(120), 646, 68, { italic: false, weight: 600, reveal: win(t, 2.9, 3.2) });
      ctx.save(); ctx.font = '600 68px "Cormorant Garamond"'; const nw = ctx.measureText(fmt(n)).width; ctx.restore();
      inkText(ctx, 'examples', X(120 + 16) + nw, 640, 44, { reveal: win(t, 3.0, 3.4) });
      if (t > 5.6) B([[100, 662, 0.5], [300, 668, 1], [520, 660, 0.4]], { w: 8, ink: 1, dry: 1.4, seed: 99, p: ez((t - 5.6) / 0.35) });
    }

    // ---------- beat 3: guess -> check -> adjust ----------
    const PX = 1720, PY = 250;
    if (t > 6.5) {
      const k = win(t, 6.5, 6.9);
      ctx.save(); ctx.globalAlpha = k; ctx.drawImage(C.slipBig, X(PX) - C.slipBig.pad, PY - C.slipBig.pad); ctx.restore();
      inkText(ctx, 'a new picture', X(PX + 105), PY + 250, 32, { align: 'center', reveal: win(t, 6.8, 7.2) });
    }
    const GX = 1440, GY = 140;                        // where the guess is written
    B([[ex0 + 110, ey0 - 100, 0.8], [ex0 + 170, GY + 40, 1], [GX - 20, GY - 10, 0.5]], { w: 6, ink: 1.1, dry: 1.0, seed: 111, p: ez((t - 6.8) / 0.4) });
    if (t > 7.2) { const a = Math.atan2(-50, 90); B([[GX - 20, GY - 10, 0.6], [GX - 42, GY - 26, 0.2]], { w: 5, ink: 1.1, dry: 0.8, seed: 112, pool: 0 }); B([[GX - 20, GY - 10, 0.6], [GX - 44, GY - 2, 0.2]], { w: 5, ink: 1.1, dry: 0.8, seed: 113, pool: 0 }); }
    inkText(ctx, 'Guess', X(ex0 + 70), GY + 30, 40, { reveal: win(t, 6.9, 7.3) });
    const second = t > 9.4;
    if (!second) inkText(ctx, 'dog?', X(GX + 10), GY + 30, 76, { reveal: win(t, 7.1, 7.5) });
    // check against the label on the picture
    B([[PX + 30, PY - 10, 0.7], [PX - 10, PY - 70, 1], [GX + 210, GY - 10, 0.5]], { w: 5, ink: 1.05, dry: 1.1, seed: 121, p: ez((t - 7.5) / 0.4) });
    inkText(ctx, 'Check', X(PX + 20), PY - 60, 40, { reveal: win(t, 7.6, 8.0) });
    if (t > 7.9 && !second) {
      // vermilion cross and an emphatic red ensō around the wrong answer
      const red = (cp, seed, a, b, w = 11) => verm((VB) => VB(cp, { w, ink: 1.1, dry: 0.9, seed, p: ez((t - a) / (b - a)) }));
      red([[GX + 20, GY - 40, 1], [GX + 140, GY + 40, 0.6]], 131, 7.9, 8.05);
      red([[GX + 140, GY - 40, 1], [GX + 20, GY + 40, 0.6]], 132, 8.05, 8.2);
      const ring = []; for (let i = 0; i <= 24; i++) { const a = -2.2 + i / 24 * Math.PI * 1.9; ring.push([GX + 82 + Math.cos(a) * 120, GY + 4 + Math.sin(a) * 74, 1 - i / 24 * 0.6]); }
      red(ring, 133, 8.0, 8.45, 9);
      inkText(ctx, "it's a cat", X(PX + 105), PY + 292, 36, { align: 'center', col: VERM.join(','), reveal: win(t, 8.0, 8.4) });
    }
    // the error flows back: a returning stroke, and the reeds inside the circle swing
    if (t > 8.2) {
      const cp = [[GX + 70, GY + 60, 0.9], [GX + 40, GY + 230, 1], [ex0 + 240, ey0 + 170, 0.8], [ex0 + 170, ey0 + 110, 0.6], [ex0 + 140, ey0 + 60, 0.4]];
      verm((VB) => {
        VB(cp, { w: 9, ink: 1.1, dry: 0.8, seed: 141, p: ez((t - 8.25) / 0.5) });
        if (t > 8.75) { const e = [ex0 + 140, ey0 + 60]; VB([[e[0], e[1], 0.6], [e[0] + 6, e[1] + 26, 0.2]], { w: 6, ink: 1.1, dry: 0.7, seed: 142, pool: 0 }); VB([[e[0], e[1], 0.6], [e[0] + 26, e[1] + 10, 0.2]], { w: 6, ink: 1.1, dry: 0.7, seed: 143, pool: 0 }); }
      });
      inkText(ctx, 'Adjust', X(GX - 140), GY + 250, 40, { col: VERM.join(','), reveal: win(t, 8.5, 8.9) });
    }
    if (second) {
      inkText(ctx, 'cat', X(GX + 20), GY + 30, 76, { reveal: win(t, 9.4, 9.7) });
      B([[GX + 140, GY - 4, 0.6], [GX + 156, GY + 16, 1], [GX + 200, GY - 40, 0.3]], { w: 8, ink: 1.2, dry: 0.7, seed: 151, p: ez((t - 9.7) / 0.25) });
    }

    // ---------- beat 4: progress drawn as a mountain ridge climbing over training rounds ----------
    const N = CN;
    if (t > 10.6) {
      B([[CX0, CY0 - CH, 0.4], [CX0, CY0, 0.7]], { w: 3, ink: 0.8, dry: 1.4, seed: 161, tone: 0.6, pool: 0, p: ez((t - 10.7) / 0.3) });
      B([[CX0, CY0, 0.7], [CX0 + CW + 20, CY0, 0.4]], { w: 3, ink: 0.8, dry: 1.4, seed: 162, tone: 0.6, pool: 0, p: ez((t - 10.9) / 0.4) });
      inkText(ctx, 'training rounds', X(CX0 + CW / 2), CY0 + 44, 32, { align: 'center', reveal: win(t, 11.0, 11.4) });
      const pts = chartPts();
      const pr = win(t, 11.2, 12.7);
      // pale wash below the ridge, revealed as the ridge is drawn
      if (pr > 0) {
        const cw = chartWash(nz), wx = X(cw.x), wy = cw.y, ww = cw.cv.width, wh = cw.cv.height;
        const lc = SCR.getContext('2d'), cx0 = Math.max(0, wx), cx1 = Math.min(W, wx + ww);
        if (cx1 > cx0) {
          lc.clearRect(cx0, wy, cx1 - cx0, wh); lc.drawImage(cw.cv, wx, wy);
          if (pr < 1) {   // the wash soaks in just behind the travelling brush, with a soft wet front
            const f = X(CX0) + CW * pr + 6, g = lc.createLinearGradient(f - 70, 0, f, 0); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
            lc.globalCompositeOperation = 'destination-in'; lc.fillStyle = g; lc.fillRect(cx0, wy, cx1 - cx0, wh); lc.globalCompositeOperation = 'source-over';
          }
          ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(SCR, cx0, wy, cx1 - cx0, wh, cx0, wy, cx1 - cx0, wh); ctx.restore();
        }
      }
      B(pts, { w: 10, ink: 1.25, dry: 0.6, seed: 171, p: pr });
      // the little traveller climbs the ridge with the line
      if (pr > 0) {
        const f = pr * N, i = Math.min(N - 1, Math.floor(f)), u = f - i, x = lerp(pts[i][0], pts[i + 1][0], u), y = lerp(pts[i][1], pts[i + 1][1], u);
        B([[x, y - 22, 0.8], [x - 1, y - 10, 1], [x - 2, y - 2, 1.1]], { w: 7, ink: 1.4, dry: 0.2, seed: 181, pool: 0.3 });
        B([[x + 0.5, y - 28, 1], [x + 1, y - 26, 0.9]], { w: 6, ink: 1.4, dry: 0.1, seed: 182, pool: 0.6 });
      }
      const acc = Math.round(t < 11.2 ? 61 : t > 12.7 ? 97 : lerp(61, 97, H.ease.out(pr)));
      inkText(ctx, 'Accuracy', X(CX0 + 10), CY0 - CH - 40, 48, { reveal: win(t, 10.9, 11.3) });
      inkText(ctx, acc + '%', X(CX0 + 230), CY0 - CH - 40, 72, { italic: false, weight: 600, reveal: win(t, 11.1, 11.3), col: acc >= 97 ? VERM.join(',') : '22,20,19' });
      inkText(ctx, '61%', X(CX0 - 70), pts[0][1] + 10, 30, { italic: false, weight: 600, reveal: win(t, 11.2, 11.5) });
      if (t > 12.75) {   // the seal is pressed beside the summit
        const st = win(t, 12.75, 12.9), sc = 1 + (1 - H.ease.out(st)) * 0.3;
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.92 * Math.min(1, st * 1.5);
        ctx.translate(X(CX0 + 400), CY0 - CH - 62); ctx.scale(sc, sc); ctx.drawImage(C.sealKnow, -27, -27, 54, 54); ctx.restore();
        const ring = []; for (let i = 0; i <= 20; i++) { const a = -2 + i / 20 * Math.PI * 1.9; ring.push([pts[N][0] + Math.cos(a) * 30, pts[N][1] + Math.sin(a) * 30, 1 - i / 20 * 0.6]); }
        verm((VB) => VB(ring, { w: 6, ink: 1.1, dry: 0.9, seed: 191, p: ez((t - 12.8) / 0.35) }));
      }
    }

    flush(); pressInk(ctx, VERL, VBB, `rgb(${VERM})`);
    // ---------- mist drifting across the scroll between scenes (screen space) ----------
    const mist = Math.max(Math.sin(Math.PI * win(t, 5.8, 7.2)), Math.sin(Math.PI * win(t, 10.2, 11.6)));
    if (mist > 0.01) {
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = 'blur(24px)';
      const mr = H.rng(55);
      for (let k = 0; k < 7; k++) { ctx.fillStyle = `rgba(239,231,214,${mr.range(0.45, 0.75) * mist})`; ctx.beginPath(); ctx.ellipse(mr.range(0, W) - (t * 120) % 400 + 200, mr.range(120, 620), mr.range(220, 420), mr.range(30, 70), 0, 0, 7); ctx.fill(); }
      ctx.restore();
    }

    // ---------- beat 5: takeaway ----------
    if (t > 13.2) {
      inkText(ctx, 'More examples → better guesses', 640, 680, 58, { align: 'center', reveal: ez((t - 13.2) / 0.7) });
    }
    // ---------- beat 1: hook -> corner header with a small seal ----------
    {
      const k = ez((t - 1.5) / 0.8), s = lerp(1, 0.45, k);
      ctx.save(); ctx.font = 'italic 400 104px "Cormorant Garamond"'; const tw = ctx.measureText('How does AI learn?').width; ctx.restore();
      ctx.save(); ctx.translate(lerp(640 - tw / 2, 44, k), lerp(380, 64, k)); ctx.scale(s, s);
      inkText(ctx, 'How does AI learn?', 0, 0, 104, { reveal: win(t, 0.1, 1.0) });
      if (t > 1.05) { const st = win(t, 1.05, 1.2), sc = 1 + (1 - H.ease.out(st)) * 0.3; ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = Math.min(1, st * 1.5); ctx.translate(tw + 50, -40); ctx.scale(sc, sc); ctx.drawImage(C.sealKnow, -30, -30, 60, 60); }
      ctx.restore();
    }
  }

  registerStyle({
    id: 'sumi-e',
    name: 'Sumi-e Ink Wash',
    category: 'Painterly',
    description: 'Monochrome Japanese ink painting on fibrous rice paper: dilute grey washes that bleed and fade into mist, a few confident loaded-brush strokes that split into dry bristle tracks, vast negative space, a vertical calligraphy column and a vermilion seal.',
    motion: 'Mist drifts sideways across the peaks while each brush stroke is laid down in one sweep, bristles running dry as it travels; the tiny device on the ledge pulses with light.',
    fonts: ['900 58px "Noto Serif JP"', '700 30px "Noto Serif JP"', '600 20px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"', '600 40px "Noto Serif JP"'],
    duration: 6.8,
    frameT: 6.7,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Told along a handscroll the camera unrolls, with mist drifting across between scenes; arrows and the chart are single loaded brush strokes that run dry, labels and numbers are ink-written in place, and vermilion strokes and seal stamps do the emphasis.',
    explainer(ctx, W, H_, t) { explainSumi(ctx, W, H_, t); },
    explainerSound(k) {
      // all times copied from explainSumi() above (its win()/ez() windows). Calm and sparse: ink, paper, wood, a bowl.
      const D = 15;
      const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
      // a loaded ink brush on rice paper: soft press, a wet body, and dry bristles rasping as it runs out at the tail
      const ink = (a, b, g = 1, pan = 0, minor = true) => {
        const d = b - a, r = H.rng(Math.round(a * 1000) + 7);
        k.noise(a, { dur: 0.06, color: 'brown', filter: 'lowpass', f: 600, gain: 0.3 * g, a: 0.006, pan, minor });
        k.play('stroke', a, { material: 'brush', dur: d * 0.7, gain: 1.4 * g, pan, minor });
        for (let x = d * 0.45; x < d; x += 0.03 + r() * 0.03) // dry-brush tail: sparser, a little scratchier
          k.noise(a + x, { dur: 0.035, filter: 'bandpass', f: 1500 + r() * 700, q: 0.9, gain: 0.07 * g * (0.5 + r() * 0.6), a: 0.008, pan, minor });
      };
      const write = (s, a, b, g = 0.7, pan = 0) => { const re = /\S+/g; let m;
        while ((m = re.exec(s))) ink(a + (b - a) * m.index / s.length, a + (b - a) * (m.index + m[0].length) / s.length, g, pan); };
      // soroban bead: a small, dry wooden click for the counters
      const bead = (t, g = 1, pan = 0) => k.play('tock', t, { f: 1150, gain: 0.32 * g, pan, minor: true });
      const counter = (val, a, b, pan, avoid = []) => { let last = val(a), lastT = -1;
        for (let t = a; t <= b; t += 1 / 240) { const v = val(t); if (v !== last && t - lastT >= 1 / 12 && !avoid.some((x) => t > x - 0.03 && t < x + 0.1)) { bead(t, 1, pan); lastT = t; } last = v; } };
      // singing bowl (rin): low fundamental with inharmonic partials, long ring
      const bowl = (t, f, g = 1, pan = 0) => { const h = k.hz(f);
        k.tone(t, { f: h, dur: 3.2, gain: 0.16 * g, a: 0.01, verb: 0.4, pan });
        k.tone(t, { f: h * 2.71, dur: 2.0, gain: 0.05 * g, a: 0.01, verb: 0.4, pan, detune: 4 });
        k.tone(t, { f: h * 1.003, dur: 3.0, gain: 0.08 * g, a: 0.02, pan: -pan }); };
      // mist drifting across while the scroll unrolls: a slow airy breath and the paper sliding on the table
      const mist = (a, b) => { const d = b - a;
        k.noise(a, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 300], [d * 0.5, 900], [d, 350]], q: 0.5, gain: 0.075, a: d * 0.5, verb: 0.3 });
        k.noise(a + 0.2, { dur: 0.95, color: 'brown', filter: 'lowpass', f: 500, gain: 0.12, a: 0.3, pan: 0.3 }); };
      // a drop falling into still water, kept low
      const plop = (t, g = 1, pan = 0) => { k.tone(t, { f: [[0, 260], [0.07, 470]], dur: 0.11, gain: 0.12 * g, a: 0.003, verb: 0.35, pan }); };

      k.bed('room', 0, D, { gain: 0.4 });
      k.music('pad', 0, D, { bpm: 64, gain: 0.32, chords: [['D3', 'A3', 'E4', 'G4'], ['C3', 'G3', 'D4', 'E4'], ['Bb2', 'F3', 'C4', 'D4'], ['D3', 'A3', 'D4', 'E4']] });

      // ---- 1 HOOK: title ink-written 0.1-1.0, the small seal is pressed at 1.05-1.2, header drifts to the corner 1.5-2.3
      write('How does AI learn?', 0.1, 1.0, 0.9);
      k.play('press', 1.1, { gain: 0.3 });
      k.noise(1.5, { dur: 0.8, color: 'pink', filter: 'bandpass', f: [[0, 280], [0.8, 600]], q: 0.7, gain: 0.06, a: 0.3, minor: true });

      // ---- 2 DATA: the ensō in one breath (1.2-2.1), the river banks and wash, reeds, slips floating down
      ink(1.2, 2.1, 1.3, 0.3, false);
      k.noise(1.6, { dur: 1.4, color: 'pink', filter: 'lowpass', f: [[0, 400], [1.4, 900]], gain: 0.06, a: 0.6, pan: -0.4, minor: true }); // the wash spreading
      ink(1.6, 2.8, 0.55, -0.5); ink(1.8, 3.0, 0.55, -0.3);
      // the river carries the slips: a faint trickle, and a soft plop as one sinks into the circle
      k.noise(2.6, { dur: 3.6, color: 'pink', filter: 'bandpass', f: 600, q: 0.6, gain: 0.04, a: 0.6, hold: 2.4, pan: -0.3, minor: true });
      const plops = [0, 5, 10, 15, 20].map((i) => 2.6 + i * 0.16 + 1.9 * 0.95);
      plops.forEach((t) => plop(t, 0.7, 0.2));
      // counter ink-written: n = 1e6 * ease.in(win(3.0, 5.6)), rounded to thousands; soroban beads as it climbs
      counter((t) => Math.round(1e6 * H.ease.in(win(t, 3.0, 5.6)) / 1000), 3.0, 5.58, -0.5, plops);
      k.play('tock', 5.6, { f: 640, gain: 0.6, pan: -0.5 }); // 1,000,000: beads clear with a firm clack
      ink(5.6, 5.95, 1.0, -0.4, false);                      // dry underline

      // ---- mist and scroll 5.8-7.2 (camera 6.0-6.95)
      mist(5.8, 7.2);

      // ---- 3 GUESS -> CHECK -> ADJUST
      k.noise(6.5, { dur: 0.12, color: 'brown', filter: 'lowpass', f: 900, gain: 0.12, a: 0.03, pan: 0.6, minor: true }); // the new slip laid down
      ink(6.8, 7.2, 1.0, 0.1, false);           // Guess arrow
      write('dog?', 7.1, 7.5, 0.85, 0.3);
      ink(7.5, 7.9, 0.9, 0.5, false);           // Check arrow
      // the wrong guess: two vermilion slashes, a low wooden knock
      ink(7.9, 8.05, 2.0, 0.3, false); ink(8.05, 8.2, 2.0, 0.3, false);
      k.play('thud', 7.9, { f: 105, gain: 0.55, pan: 0.3 });
      ink(8.25, 8.75, 1.4, 0.0, false);         // the error flows back
      plop(8.6, 1.1, -0.2);                      // a ripple spreads from the circle
      // reeds swing (ez over 8.7-9.4): a dry rustle of stems
      k.noise(8.7, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 1200], [0.35, 1800], [0.7, 1000]], q: 1.0, gain: 0.07, a: 0.3, pan: -0.2, minor: true });
      write('cat', 9.4, 9.7, 0.9, 0.3);
      ink(9.7, 9.95, 1.1, 0.3, false);          // check mark
      bowl(9.95, 'A4', 0.35, 0.3);               // correct: a bowl rings

      // ---- mist and scroll 10.2-11.6 (camera 10.45-11.4)
      mist(10.2, 11.6);

      // ---- 4 PROGRESS: axes 10.7-11.0 / 10.9-11.3, the ridge 11.2-12.7, the summit seal 12.75
      ink(10.7, 11.0, 0.8, -0.4); ink(10.9, 11.3, 0.8, 0);
      ink(11.2, 12.7, 0.75, 0.1);              // one long ridge stroke, running dry
      const acc = (t) => Math.round(61 + 36 * H.ease.out(win(t, 11.2, 12.7)));
      const t97 = when(acc, 97, 11.2, 12.7);
      counter(acc, 11.2, t97 - 0.06, -0.3);
      k.play('tock', t97, { f: 700, gain: 0.7, pan: -0.3 });    // 97% lands in vermilion
      // the seal is pressed beside the summit (scale settles 12.75-12.9): the biggest hit
      k.play('stamp', 12.8, { gain: 1.0, pan: 0.1 });
      k.play('impact', 12.8, { f: 80, gain: 0.8 });
      k.noise(12.8, { dur: 1.2, color: 'pink', filter: 'lowpass', f: [[0, 1400], [1.0, 250]], gain: 0.16, verb: 0.4 });
      bowl(12.82, 'D4', 1.0, 0.1);
      ink(12.8, 13.15, 1.0, 0.6);               // small vermilion ring at the summit

      // ---- 5 TAKEAWAY (13.2-13.9) and the resolve: a low bowl under the last chord
      write('More examples → better guesses', 13.2, 13.9, 1.1);
      bowl(13.95, 'D3', 0.6, 0);
      bowl(14.0, 'A3', 0.3, 0.3);
    },
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(808);
      const R = H.rng(4242);
      const drift = t * 16;
      // timeline helpers: sp = linear brush travel, ep = eased
      const sp = (a, b) => H.clamp((t - a) / (b - a));
      const ep = (a, b) => H.ease.inOut(sp(a, b));

      // ---------- 1. rice paper (static: built once per size) ----------
      if (HERO_PAPER_KEY !== W + 'x' + H_) { HERO_PAPER = makePaper(W, H_, nz, R, 900); HERO_PAPER_KEY = W + 'x' + H_; }
      ctx.drawImage(HERO_PAPER, 0, 0);

      const L = H.layer(W, H_), lx = L.getContext('2d');
      const T = H.layer(W, H_), tx = T.getContext('2d');
      // graded wash: darkest at the ridge, dissolving downward into mist; uneven water; pooled ridge edge; slight bleed.
      // prog (0..1) = the ink spreading down from the ridge into the damp paper. Works on its bounding box only.
      function ridgeWash(ridge, x0, x1, tone, fade, mistY, mistR, seed, edgeFall = true, maxX = null, prog = 1) {
        const ry = (x) => {
          let y = ridge(x);
          if (edgeFall) { if (x0 > 0) y += Math.pow(Math.max(0, (x0 + 260 - x) / 260), 2.2) * 300; y += Math.pow(Math.max(0, (x - (x1 - 260)) / 260), 2.2) * 300; }
          return y;
        };
        if (prog <= 0) return ry;
        const bx0 = Math.max(0, x0), bx1 = Math.min(W, x1);
        const tops = new Float32Array(bx1 - bx0);
        let ymin = H_;
        for (let x = bx0; x < bx1; x++) { tops[x - bx0] = ry(x); ymin = Math.min(ymin, tops[x - bx0]); }
        ymin = Math.max(0, Math.floor(ymin) - 6);
        const bw = bx1 - bx0, bh = H_ - ymin;
        const reach = 30 + prog * prog * 520;            // how far the ink has crept below the ridge
        const tn = tone * (0.45 + 0.55 * H.ease.out(prog));
        lx.clearRect(0, 0, W, H_);
        const img = lx.createImageData(bw, bh), a = img.data;
        for (let x = bx0; x < bx1; x++) {
          const top = tops[x - bx0], m = mistY + nz.n2(x * 0.007, seed) * mistR * 0.8;
          const hf = edgeFall ? (x0 > 0 ? H.smooth(x0, x0 + 200, x) : 1) * H.smooth(x1, x1 - 200, x) : (x0 > 0 ? H.smooth(x0, x0 + 40, x) : 1) * (x1 < W ? H.smooth(x1, x1 - 40, x) : 1);
          const rch = reach * (0.8 + 0.4 * (nz.n2(x * 0.02, seed + 3) + 0.5));
          for (let y = Math.max(ymin, Math.floor(top)); y < H_; y++) {
            if (maxX && x > maxX(y)) continue;
            const dy = y - top;
            let al = (0.32 + 0.68 * Math.exp(-dy / fade)) * H.smooth(m + mistR, m - mistR * 0.4, y) * hf;
            if (prog < 1) al *= H.clamp((rch - dy) / 40);
            if (dy < 1) al *= Math.max(0, dy);
            if (al < 0.004 && dy > 2 && (y > m || dy > rch)) break;
            const k = ((y - ymin) * bw + (x - bx0)) * 4; a[k] = INK[0]; a[k + 1] = INK[1]; a[k + 2] = INK[2]; a[k + 3] = al * 255;
          }
        }
        lx.putImageData(img, bx0, ymin);
        // uneven water: lighter patches
        // (soft-edged via a radial gradient instead of a blur filter: much cheaper per frame)
        lx.globalCompositeOperation = 'destination-out';
        const rr = H.rng(seed);
        const soft = lx.createRadialGradient(0, 0, 0, 0, 0, 1.35); soft.addColorStop(0, '#000'); soft.addColorStop(0.55, 'rgba(0,0,0,0.75)'); soft.addColorStop(1, 'rgba(0,0,0,0)');
        for (let k = 0; k < 16; k++) {
          const x = rr.range(x0, x1); lx.globalAlpha = rr.range(0.15, 0.45);
          const ey = ry(x) + rr.range(25, 160), erx = rr.range(30, 90), ery = rr.range(10, 40), ea = rr.range(-0.6, 0.6);
          lx.save(); lx.translate(x, ey); lx.rotate(ea); lx.scale(erx, ery); lx.fillStyle = soft; lx.beginPath(); lx.arc(0, 0, 1.35, 0, 7); lx.fill(); lx.restore();
        }
        for (let k = 0; k < 5; k++) { const x = rr.range(x0 + 60, x1 - 60), y = ry(x) + rr.range(30, 110), rad = rr.range(14, 34); lx.globalAlpha = rr.range(0.1, 0.2); lx.beginPath();
          for (let a = 0; a < 6.3; a += 0.3) { const q = rad * (0.75 + 0.35 * Math.abs(nz.n2(a * 1.3 + k * 7, seed))); a ? lx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q * 0.7) : lx.moveTo(x + q, y); } lx.closePath(); lx.fill(); }
        lx.globalCompositeOperation = 'source-over'; lx.globalAlpha = 1;
        tx.clearRect(bx0, ymin, bw, bh); tx.filter = 'blur(4px)'; tx.drawImage(L, bx0, ymin, bw, bh, bx0, ymin, bw, bh); tx.filter = 'none';
        const A = lx.getImageData(bx0, ymin, bw, bh), B = tx.getImageData(bx0, ymin, bw, bh), d = A.data, b = B.data;
        for (let i = 3; i < d.length; i += 4) {
          const rim = d[i] - b[i];
          d[i] = Math.min(255, (Math.max(d[i], b[i] * 0.9) + (rim > 0 ? rim * 0.25 : 0)) * tn);
        }
        lx.putImageData(A, bx0, ymin);
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, bx0, ymin, bw, bh, bx0, ymin, bw, bh); ctx.restore();
        return ry;
      }
      const S = H.layer(W, H_), sx = S.getContext('2d');
      function strokes(fn, bleed = true, bb = [0, 0, W, H_]) {
        const [x0, y0, x1, y1] = bb, w = x1 - x0, h = y1 - y0;
        sx.clearRect(x0, y0, w, h); fn();
        ctx.save(); ctx.globalCompositeOperation = 'multiply';
        if (bleed) { ctx.filter = 'blur(1.4px)'; ctx.globalAlpha = 0.45; ctx.drawImage(S, x0, y0, w, h, x0, y0, w, h); ctx.filter = 'none'; ctx.globalAlpha = 1; }
        ctx.drawImage(S, x0, y0, w, h, x0, y0, w, h); ctx.restore();
      }
      const pk = (x, c, h, s) => h * Math.exp(-Math.pow((x - c) / s, 2));

      // ---------- 2. far peaks: palest dilution ----------
      const far = (x) => 600 - pk(x, 820, 160, 230) - pk(x, 800, 360, 80) - pk(x, 900, 270, 46) - pk(x, 712, 210, 50) - pk(x, 985, 170, 55) - pk(x, 640, 130, 130) - pk(x, 1050, 70, 110)
        + nz.fbm2(x * 0.016, 3.1, 4) * 44 + Math.abs(nz.n2(x * 0.05, 9)) * 18 + nz.n2(x * 0.22, 4) * 2.5;
      const farY = ridgeWash(far, 420, 1150, 0.36, 130, 440, 80, 11, false, null, sp(0.1, 1.5));

      // ---------- 3. middle range, left ----------
      const mid = (x) => 640 - pk(x, 250, 110, 260) - pk(x, 170, 260, 100) - pk(x, 330, 190, 75) - pk(x, 470, 120, 110) - pk(x, 610, 50, 120) - pk(x, 30, 170, 70)
        + nz.fbm2(x * 0.018, 7.7, 4) * 26 + Math.abs(nz.n2(x * 0.06, 2)) * 10;
      const midY = ridgeWash(mid, 0, 760, 0.55, 110, 500, 60, 22, false, null, sp(0.7, 2.0));

      // hemp-fibre texture strokes (pi-ma cun) running down the slopes + broken ridge contours
      strokes(() => {
        const rr = H.rng(34);
        const contour = (fy, xa, xb, wv, ink, tone, seed, a0) => {
          const cp = []; for (let x = xa; x <= xb; x += 18) cp.push([x, fy(x) + 1.5, 0.45 + 0.55 * Math.abs(Math.sin((x - xa) / (xb - xa) * Math.PI * 1.3))]);
          brush(sx, cp, { w: wv, ink, dry: 1.2, seed, tone, pool: 0.2, p: ep(a0, a0 + 0.45) }, nz);
        };
        contour(farY, 600, 790, 5, 0.75, 0.55, 31, 1.0); contour(farY, 812, 900, 4, 0.6, 0.45, 32, 1.3); contour(farY, 905, 1000, 4, 0.6, 0.4, 35, 1.5);
        contour(midY, 60, 250, 7, 0.9, 0.7, 33, 1.6); contour(midY, 270, 420, 6, 0.85, 0.6, 36, 1.85);
        const fibres = (fy, xa, xb, n, tone, seedBase, a0, span) => {
          for (let k = 0; k < n; k++) {
            const x = rr.range(xa, xb), y0 = fy(x) + rr.range(4, 20), sl = (fy(x + 8) - fy(x - 8)) / 16;
            const dx = H.clamp(-sl * 0.6, -0.8, 0.8), len = rr.range(35, 85);
            const cp = []; for (let j = 0; j <= 4; j++) { const u = j / 4; cp.push([x + dx * len * u + Math.sin(u * 3 + k) * 7, y0 + len * u, 0.5 + Math.sin(u * Math.PI) * 0.5]); }
            brush(sx, cp, { w: rr.range(2.5, 4), ink: 0.6, dry: 1.3, seed: seedBase + k, tone, pool: 0, p: ep(a0 + span * k / n, a0 + span * k / n + 0.2) }, nz);
          }
        };
        fibres(farY, 640, 1000, 16, 0.26, 400, 1.6, 0.6);
        fibres(midY, 40, 520, 30, 0.42, 500, 2.0, 0.6);
      }, true, [0, 0, 1060, 620]);

      // ---------- 4. drifting mist (lift ink back to paper) ----------
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = 'blur(26px)';
      const mr = H.rng(55);
      for (let k = 0; k < 8; k++) {
        ctx.fillStyle = `rgba(239,231,214,${mr.range(0.3, 0.55)})`;
        ctx.beginPath(); ctx.ellipse(((mr.range(0, W) + drift * (1 + k * 0.2)) % (W + 300)) - 150, mr.range(380, 500), mr.range(160, 320), mr.range(12, 26), 0, 0, 7); ctx.fill();
      }
      ctx.restore();

      // ---------- 5. foreground cliff ----------
      const cliff = (x) => 470 - (x / 440) * 30 + Math.pow(Math.max(0, 160 - x) / 160, 2) * 30 + nz.n2(x * 0.03, 5) * 9 + Math.sin(x * 0.05) * 3;
      const face = [[436, 452], [450, 490], [432, 540], [436, 600], [470, 650], [520, 720]];
      const faceX = (y) => { for (let k = 0; k < face.length - 1; k++) if (y <= face[k + 1][1]) { const u = H.clamp((y - face[k][1]) / (face[k + 1][1] - face[k][1])); return face[k][0] + (face[k + 1][0] - face[k][0]) * u; } return 520; };
      const cliffY = ridgeWash(cliff, 0, 470, 0.62, 120, 640, 70, 66, false, faceX, sp(2.05, 3.0));
      strokes(() => {
        // the ledge: one decisive loaded stroke, splitting at the end
        const cp = []; for (let x = -10; x <= 440; x += 30) cp.push([x, cliffY(x) - 1, x < 30 ? 0.55 : 1 - (x / 440) * 0.35]);
        brush(sx, cp, { w: 16, ink: 1.25, dry: 0.75, seed: 101, p: ep(1.5, 2.0) }, nz);
        // the face dropping away into mist
        brush(sx, [[438, 452, 0.9], [452, 490, 1], [434, 540, 0.85], [438, 600, 0.6], [472, 650, 0.35]], { w: 20, ink: 1.1, dry: 1.1, seed: 102, p: ep(1.9, 2.25) }, nz);
        // side-brush dry strokes describing the rock planes
        const rr = H.rng(103);
        for (let k = 0; k < 5; k++) {
          const x = rr.range(30, 380), y = cliffY(x) + rr.range(22, 110);
          const len = rr.range(70, 130), a = rr.range(2.3, 2.7);
          const cp = []; for (let j = 0; j <= 5; j++) { const u = j / 5; cp.push([x + Math.cos(a) * len * u + Math.sin(u * 4) * 6, y + Math.sin(a) * len * u * 0.6 + u * u * 20, 0.35 + Math.sin(u * Math.PI) * 0.65]); }
          brush(sx, cp, { w: rr.range(9, 15), ink: 0.75, dry: 1.3, seed: 110 + k, tone: 0.4, pool: 0, rim: 0, p: ep(2.95 + k * 0.09, 3.2 + k * 0.09) }, nz);
        }
        // moss dots (dian) along the ledge
        for (let k = 0; k < 22; k++) {
          const x = rr.range(0, 420), y = cliffY(x) - rr.range(1, 7);
          brush(sx, [[x, y, 1], [x + rr.range(3, 6), y + rr.range(-1, 3), 0.6]], { w: rr.range(4, 8), ink: 1.3, dry: 0.3, seed: 150 + k, pool: 0.6, p: sp(3.3 + k * 0.018, 3.36 + k * 0.018) }, nz);
        }
      }, true, [0, 380, 540, 720]);

      // ---------- 6. pine ----------
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.filter = 'blur(9px)';
      ctx.fillStyle = `rgba(60,58,55,${0.14 * ep(3.9, 4.4)})`;
      [[250, 268, 110, 28], [400, 278, 70, 22], [120, 196, 80, 30]].forEach(([x, y, a, b]) => { ctx.beginPath(); ctx.ellipse(x, y, a, b, 0, 0, 7); ctx.fill(); });
      ctx.restore();
      strokes(() => {
        // trunk: one confident twisting stroke, bark scales dotted on afterwards
        const trunk = [[100, 448, 1], [120, 382, 0.95], [104, 322, 0.9], [134, 262, 0.75], [128, 196, 0.5]];
        brush(sx, trunk, { w: 17, ink: 1.05, dry: 1.25, seed: 201, p: ep(3.0, 3.4) }, nz);
        const rr = H.rng(204);
        for (let k = 0; k < 6; k++) {
          const u = 0.1 + k / 7.5, i = Math.floor(u * (trunk.length - 1)), f = u * (trunk.length - 1) - i;
          const x = trunk[i][0] + (trunk[i + 1][0] - trunk[i][0]) * f + rr.gauss() * 3, y = trunk[i][1] + (trunk[i + 1][1] - trunk[i][1]) * f;
          brush(sx, [[x - 5, y + 3, 0.5], [x, y - 1, 1], [x + 5, y + 2, 0.4]], { w: 2.4, ink: 1.1, dry: 0.6, seed: 210 + k, pool: 0, rim: 0, p: sp(3.4 + k * 0.04, 3.46 + k * 0.04) }, nz);
        }
        // reaching branch + a counter branch
        brush(sx, [[120, 300, 1], [190, 284, 0.85], [260, 296, 0.7], [340, 282, 0.5], [420, 290, 0.25]], { w: 10, ink: 1.1, dry: 1.0, seed: 205, p: ep(3.35, 3.75) }, nz);
        brush(sx, [[132, 230, 0.8], [84, 212, 0.6], [36, 220, 0.3]], { w: 8, ink: 1.0, dry: 1.2, seed: 206, p: ep(3.55, 3.8) }, nz);
        brush(sx, [[260, 296, 0.5], [300, 268, 0.35], [318, 250, 0.2]], { w: 5, ink: 1.0, dry: 1.2, seed: 207, p: ep(3.7, 3.9) }, nz);
        // needle fans
        const clusters = [[205, 280, 1], [262, 286, 1.1], [318, 248, 0.8], [350, 280, 0.95], [414, 286, 0.8], [140, 192, 1], [96, 208, 0.9], [44, 214, 0.75], [168, 244, 0.85]];
        clusters.forEach(([x, y, sc], ci) => {
          const n = 7 + (ci % 3);
          for (let k = 0; k < n; k++) {
            const a = -Math.PI * 0.88 + (Math.PI * 0.76) * (k / (n - 1)) + rr.gauss() * 0.08, len = rr.range(18, 30) * sc * (0.75 + 0.25 * Math.sin(k / (n - 1) * Math.PI));
            brush(sx, [[x, y, 0.9], [x + Math.cos(a) * len * 0.6, y + Math.sin(a) * len * 0.6, 0.6], [x + Math.cos(a) * len, y + Math.sin(a) * len, 0.15]], { w: 3, ink: 1.15, dry: 0.9, seed: 300 + ci * 20 + k, pool: 0, p: sp(3.8 + ci * 0.06 + k * 0.012, 3.87 + ci * 0.06 + k * 0.012) }, nz);
          }
        });
      }, true, [0, 150, 480, 470]);

      // ---------- 7. the figure + glowing device ----------
      const fx = 396, fy = cliffY(396) - 3;
      const pulse = (0.75 + 0.25 * Math.sin((t - 6.1) * 2.6)) * ep(4.75, 5.2);
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const gg = ctx.createRadialGradient(fx + 10, fy - 20, 0, fx + 10, fy - 20, 110);
      gg.addColorStop(0, `rgba(205,238,242,${0.95 * pulse})`); gg.addColorStop(0.22, `rgba(160,210,220,${0.35 * pulse})`); gg.addColorStop(1, 'rgba(160,210,220,0)');
      ctx.fillStyle = gg; ctx.fillRect(fx - 90, fy - 110, 200, 180); ctx.restore();
      strokes(() => {
        brush(sx, [[fx, fy - 22, 0.8], [fx - 2, fy - 10, 1], [fx - 4, fy, 1.15]], { w: 9, ink: 1.4, dry: 0.2, seed: 501, pool: 0.3, p: sp(4.45, 4.6) }, nz);
        brush(sx, [[fx + 0.5, fy - 29, 1], [fx + 1, fy - 26.5, 0.9]], { w: 6.5, ink: 1.4, dry: 0.1, seed: 502, pool: 0.6, p: sp(4.6, 4.65) }, nz);
        brush(sx, [[fx + 1, fy - 19, 0.7], [fx + 7, fy - 17, 0.5], [fx + 9.5, fy - 20, 0.4]], { w: 2.6, ink: 1.3, dry: 0.3, seed: 503, pool: 0, p: sp(4.65, 4.72) }, nz);
      }, false, [300, 380, 480, 480]);
      if (t > 4.75) { ctx.fillStyle = `rgba(220,248,252,${0.95 * ep(4.75, 4.9)})`; ctx.fillRect(fx + 8.5, fy - 23.5, 4, 3); }
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = 'blur(2.5px)';
      const beam = ep(4.9, 5.4), bgr = ctx.createLinearGradient(fx + 10, fy - 22, fx + 150, fy - 330);
      bgr.addColorStop(0, `rgba(205,238,242,${0.55 * pulse})`); bgr.addColorStop(1, 'rgba(205,238,242,0)');
      ctx.strokeStyle = bgr; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx + 10, fy - 22); ctx.lineTo(fx + 10 + 140 * beam, fy - 22 - 308 * beam); ctx.stroke();
      ctx.restore();

      // ---------- 8. birds ----------
      strokes(() => {
        [[640, 238, 1], [672, 226, 0.8], [700, 246, 0.65]].forEach(([x, y, s], k) => {
          const xx = x + (t - 6.7) * 22 + Math.sin(t * 0.8 + k) * 6, yy = y + Math.sin(t * 1.1 + k * 2) * 4, f = Math.sin(t * 7 + k * 1.7) * 3 * s;
          if (t < 1.8 + k * 0.15) return;
          brush(sx, [[xx - 9 * s, yy - 2 * s + f, 0.4], [xx - 4 * s, yy - 4 * s + f * 0.5, 0.8], [xx, yy, 1]], { w: 3, ink: 1.2, dry: 0.5, seed: 601 + k, pool: 0 }, nz);
          brush(sx, [[xx, yy, 1], [xx + 5 * s, yy - 5 * s + f * 0.5, 0.8], [xx + 11 * s, yy - 3 * s + f, 0.4]], { w: 3, ink: 1.2, dry: 0.5, seed: 611 + k, pool: 0 }, nz);
        });
      }, true, [480, 120, 1000, 320]);

      // ---------- 9. calligraphy column ----------
      const chars = ['山', 'に', '宿', 'る', '知', '恵'];
      // small offscreen layers (calligraphy strip, seal) keep the destination-out work cheap
      const CL = H.layer(160, 480), tx2 = CL.getContext('2d'); tx2.translate(-1088, -36);
      tx2.fillStyle = `rgb(${INK})`; tx2.textAlign = 'center'; tx2.textBaseline = 'middle';
      const cxT = 1168, cr2 = H.rng(707);
      chars.forEach((ch, i) => {
        tx2.save(); tx2.translate(cxT + cr2.gauss() * 2.5, 92 + i * 62); tx2.rotate(cr2.gauss() * 0.04);
        const fs = 56 + cr2.range(-3, 4), rv = H.ease.out(sp(4.3 + i * 0.12, 4.42 + i * 0.12));
        if (rv > 0) { tx2.beginPath(); tx2.rect(-40, -34, 80, 68 * rv); tx2.clip(); tx2.font = `900 ${fs}px "Noto Serif JP"`; tx2.globalAlpha = 0.92; tx2.fillText(ch, 0, 0); }
        tx2.restore();
      });
      // dry-brush streaks bitten out of the characters + bleed
      tx2.globalCompositeOperation = 'destination-out';
      for (let k = 0; k < 420; k++) {
        const x = cxT + cr2.range(-40, 40), y = cr2.range(56, 450);
        tx2.globalAlpha = cr2.range(0.25, 0.85); tx2.lineWidth = cr2.range(0.5, 1.5);
        tx2.beginPath(); tx2.moveTo(x, y); tx2.lineTo(x + cr2.range(8, 22), y + cr2.range(-3, 6)); tx2.strokeStyle = '#000'; tx2.stroke();
      }
      tx2.globalCompositeOperation = 'source-over'; tx2.globalAlpha = 1;
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.filter = 'blur(1.6px)'; ctx.globalAlpha = 0.35; ctx.drawImage(CL, 1088, 36); ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.drawImage(CL, 1088, 36); ctx.restore();

      // ---------- 10. hanko seal ----------
      const sxp = 1140, syp = 474, ss = 58;
      const SL = H.layer(90, 90), tx3 = SL.getContext('2d'); tx3.translate(-(sxp - 16), -(syp - 16));
      tx3.fillStyle = '#b8322a';
      tx3.beginPath();
      const sr = H.rng(909);
      const corners = [[sxp, syp], [sxp + ss, syp], [sxp + ss, syp + ss], [sxp, syp + ss]];
      for (let e = 0; e < 4; e++) {
        const [ax, ay] = corners[e], [bx2, by2] = corners[(e + 1) % 4];
        for (let k = 0; k < 10; k++) { const u = k / 10; const x = ax + (bx2 - ax) * u + sr.gauss() * 0.9, y = ay + (by2 - ay) * u + sr.gauss() * 0.9; e === 0 && k === 0 ? tx3.moveTo(x, y) : tx3.lineTo(x, y); }
      }
      tx3.closePath(); tx3.fill();
      // carved characters (white) — 知 光 stacked as seal script stand-in
      tx3.globalCompositeOperation = 'destination-out'; tx3.textAlign = 'center'; tx3.textBaseline = 'middle';
      tx3.font = '700 25px "Noto Serif JP"';
      tx3.fillText('知', sxp + ss * 0.5, syp + ss * 0.29); tx3.fillText('光', sxp + ss * 0.5, syp + ss * 0.73);
      tx3.lineWidth = 2.2; tx3.strokeStyle = '#000'; tx3.strokeRect(sxp + 4, syp + 4, ss - 8, ss - 8);
      // uneven stamp pressure: specks where the paper didn't take the paste
      for (let k = 0; k < 160; k++) { tx3.globalAlpha = sr.range(0.3, 1); tx3.beginPath(); tx3.arc(sxp + sr() * ss, syp + sr() * ss, sr.range(0.3, 1.4), 0, 7); tx3.fill(); }
      tx3.globalAlpha = 0.35; tx3.beginPath(); tx3.ellipse(sxp + ss * 0.8, syp + ss * 0.85, 22, 10, -0.6, 0, 7); tx3.fill();
      tx3.globalCompositeOperation = 'source-over'; tx3.globalAlpha = 1;
      const st = sp(5.15, 5.3);
      if (st > 0) {
        const sc = 1 + (1 - H.ease.out(st)) * 0.25, scx = sxp + ss / 2, scy = syp + ss / 2;
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.92 * Math.min(1, st * 1.5);
        ctx.translate(scx, scy); ctx.scale(sc, sc); ctx.translate(-scx, -scy); ctx.drawImage(SL, sxp - 16, syp - 16); ctx.restore();
      }

      // small English caption, quietly set
      ctx.save(); ctx.font = '600 20px "Cormorant Garamond"'; ctx.fillStyle = `rgba(40,36,32,${0.72 * ep(5.3, 5.7)})`; ctx.textAlign = 'right';
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '6px';
      ctx.fillText('THE QUIET MACHINE', 1214, 590); ctx.restore();

      // ---------- 11. paper absorbs the ink: fibres show through, slight bleed texture ----------
      // fibres float above the ink a little (screen of the light strands)
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round';
      const fr = H.rng(77);
      for (let i = 0; i < 260; i++) {
        const x = fr() * W, y = fr() * H_, len = fr.range(14, 60), a = fr() * 6.28;
        ctx.strokeStyle = `rgba(90,84,74,${fr.range(0.06, 0.16)})`; ctx.lineWidth = fr.range(0.5, 1.1);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a + 0.5) * len * 0.5, y + Math.sin(a + 0.5) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len); ctx.stroke();
      }
      ctx.restore();
    }
  });
}
```
