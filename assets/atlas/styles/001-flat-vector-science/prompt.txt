I want an animated explainer made in the "Flat-Vector Science" visual style (Popular Explainer Looks). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Fredoka, Nunito
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;700;900&display=block">
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
Name: Flat-Vector Science
Family: Popular Explainer Looks
Look: Flat-vector science-explainer illustration: deep navy-to-violet space gradients, chunky outline-free shapes with rich multi-stop gradients, flat crescent shadows and rim highlights, soft radial glows, sparkly star fields, banded ringed planets and cute big-eyed round characters.
Motion: Smooth eased motion with gentle overshoot: the camera pulls back through scales, planets drift with parallax, characters bob and pop in, glows pulse.
How it explains: Big smooth camera moves through scale: the model pulls back until a million examples become a spiral galaxy, a foreground planet sweeps across as the wipe, and the camera dives into the glowing brain dome to emerge at a planet whose ring is the accuracy bar; arrows are chunky dotted rounded curves, numbers are big rounded Nunito.

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

REFERENCE STYLE SOURCE (styles/flat-space.js; W/H_ are always 1280x720)
```js
{
  // ---------- Flat-vector science explainer: deep space gradients, chunky shaded balls, crescent shadows, glows ----------
  const TAU = Math.PI * 2;
  const cl = H.clamp, lerp = H.lerp;
  const seg = (t, a, b) => cl((t - a) / (b - a));
  const eo = H.ease.out, eio = H.ease.inOut;
  // gentle overshoot
  const back = (u, s = 1.5) => { if (u <= 0) return 0; if (u >= 1) return 1; return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };
  const FONT = '"Nunito", "Fredoka", sans-serif';
  const F = (w, px) => `${w} ${px}px ${FONT}`;

  const C = {
    sky0: '#090b2c', sky1: '#18134f', sky2: '#3a1a6c',
    ink: '#141846', visor: '#10164a',
    teal: ['#a4fbef', '#3ccbdc', '#1d64b0'],
    orange: ['#ffcc7a', '#ff8d3f', '#d24a2a'],
    tan: ['#ffe9be', '#ecb676', '#b4723c'],
    yellow: '#ffd23f', pink: '#ff5d8f', red: '#ff3b5c', green: '#38e08e', cyan: '#56e8ff', violet: '#8b5cff',
  };

  // ---------- timeline of the explainer (shared with explainerSound) ----------
  const TL = {
    title: 0.15, titleShrink: [1.8, 2.4], robotIn: [0.5, 1.4], robotMove: [1.9, 2.8],
    arrow: [2.55, 3.1], count: [2.8, 5.6], travel: 1.5,
    zoom: [4.55, 5.8], sweep: [5.95, 6.85],
    catIn: [6.35, 6.95], guess: 6.95, bubble: 7.15, check: 7.6, wrong: 7.75,
    err: [8.05, 8.6], adjust: 8.6, zoomIn: [8.65, 9.1], rewire: [8.75, 9.35], zoomBack: [9.45, 9.85],
    guess2: 9.6, right: 9.75, toC: [10.3, 10.8], acc: [11.0, 12.55], hit: 12.55,
    take: [13.0, 13.75], line1: 13.3, line2: 13.55, D: 15,
  };
  // creature spawn times on the data stream
  const SPAWN = (() => { const a = []; let s = 2.75, i = 0; while (s < 5.3) { a.push(s); s += Math.max(0.18, 0.38 - i * 0.03); i++; } return a; })();
  const KIND = (i) => ['cat', 'dog', 'cat', 'cat', 'dog', 'dog', 'cat', 'dog'][i % 8];

  // ---------- small helpers ----------
  function rr(x, X, Y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r);
    x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath();
  }
  function glow(x, cx, cy, r, col, a) {
    if (a <= 0 || r <= 0) return;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, H.rgba(col, a)); g.addColorStop(0.35, H.rgba(col, a * 0.4)); g.addColorStop(1, H.rgba(col, 0));
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
  }
  function spark(x, cx, cy, r, col, a) {
    if (a <= 0 || r <= 0) return;
    x.save(); x.globalAlpha *= a; x.fillStyle = col; x.beginPath();
    x.moveTo(cx, cy - r); x.quadraticCurveTo(cx, cy, cx + r, cy); x.quadraticCurveTo(cx, cy, cx, cy + r);
    x.quadraticCurveTo(cx, cy, cx - r, cy); x.quadraticCurveTo(cx, cy, cx, cy - r); x.fill(); x.restore();
  }
  // region of circle (cx,cy,r) NOT covered by the same circle shifted by (dx,dy)
  function crescent(x, cx, cy, r, dx, dy, fill) {
    x.save(); x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.clip();
    x.beginPath(); x.rect(cx - r - 2, cy - r - 2, 2 * r + 4, 2 * r + 4); x.arc(cx + dx, cy + dy, r * 1.02, 0, TAU);
    x.fillStyle = fill; x.fill('evenodd'); x.restore();
  }
  // the core flat-vector ball: multi-stop gradient, two stepped flat shadow crescents, rim highlight
  function ball(x, cx, cy, r, col, o = {}) {
    if (r <= 0.3) return;
    const la = o.la == null ? -2.25 : o.la, lx = Math.cos(la), ly = Math.sin(la);
    const g = x.createLinearGradient(cx + lx * r, cy + ly * r, cx - lx * r, cy - ly * r);
    g.addColorStop(0, col[0]); g.addColorStop(0.45, col[1]); g.addColorStop(1, H.rgba(H.mix(col[1], col[2], 0.6)));
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    if (o.inner) { x.save(); x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.clip(); o.inner(); x.restore(); }
    const sh = o.sh == null ? 0.3 : o.sh;
    crescent(x, cx, cy, r, lx * r * sh, ly * r * sh, H.rgba(col[2], o.sha == null ? 0.5 : o.sha));
    crescent(x, cx, cy, r, lx * r * sh * 2.2, ly * r * sh * 2.2, H.rgba(col[2], (o.sha == null ? 0.5 : o.sha) * 0.45));
    crescent(x, cx, cy, r, -lx * r * 0.075, -ly * r * 0.075, H.rgba(o.rim || '#ffffff', o.rima == null ? 0.42 : o.rima));
  }
  const bez = (P, u) => { const v = 1 - u; return [v * v * v * P[0][0] + 3 * v * v * u * P[1][0] + 3 * v * u * u * P[2][0] + u * u * u * P[3][0], v * v * v * P[0][1] + 3 * v * v * u * P[1][1] + 3 * v * u * u * P[2][1] + u * u * u * P[3][1]]; };
  // rounded dotted / solid arrow along a cubic, drawn on to `prog`
  function arrow(x, P, prog, col, lw, o = {}) {
    if (prog <= 0) return;
    const n = 48, a = o.a == null ? 1 : o.a;
    x.save(); x.globalAlpha *= a; x.strokeStyle = col; x.fillStyle = col; x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round';
    if (o.dots) x.setLineDash([0.01, lw * 1.9]);
    x.beginPath(); const p0 = bez(P, o.from || 0); x.moveTo(p0[0], p0[1]);
    for (let i = 1; i <= n; i++) { const u = (o.from || 0) + ((prog - (o.from || 0)) * i) / n; const p = bez(P, u); x.lineTo(p[0], p[1]); }
    x.stroke(); x.setLineDash([]);
    if (o.head !== false && prog > 0.08) {
      const e = bez(P, prog), e0 = bez(P, prog - 0.02), ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]), hs = lw * 1.5 * cl(prog * 5);
      x.translate(e[0], e[1]); x.rotate(ang); x.beginPath(); x.moveTo(hs * 1.1, 0); x.lineTo(-hs * 0.8, hs); x.lineTo(-hs * 0.8, -hs); x.closePath();
      x.lineWidth = lw * 0.7; x.fill(); x.stroke();
    }
    x.restore();
  }
  // flat text with a darker offset "long shadow"
  function text(x, s, cx, cy, px, col, o = {}) {
    x.save(); x.font = F(o.w || 900, px); x.textAlign = o.align || 'center'; x.textBaseline = 'middle';
    x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = o.shadow || 'rgba(10,8,46,0.55)'; x.fillText(s, cx + px * 0.03, cy + px * 0.07);
    x.fillStyle = col; x.fillText(s, cx, cy); x.restore();
  }
  // rounded label pill, optional pointer below
  function pill(x, cx, cy, s, px, o = {}) {
    const sc = o.s == null ? 1 : o.s, a = o.a == null ? 1 : o.a;
    if (sc <= 0.01 || a <= 0.01) return;
    x.save(); x.font = F(o.w || 900, px);
    const tw = x.measureText(s).width, w = tw + px * 1.15, h = px * 1.6;
    x.translate(cx, cy); x.scale(sc, sc); x.globalAlpha *= a;
    x.fillStyle = 'rgba(10,8,46,0.4)'; rr(x, -w / 2, -h / 2 + px * 0.2, w, h, h / 2); x.fill();
    x.fillStyle = o.bg || '#ffffff';
    if (o.ptr) { x.beginPath(); x.moveTo(-px * 0.35, h / 2 - 2); x.lineTo(0, h / 2 + px * 0.45); x.lineTo(px * 0.35, h / 2 - 2); x.fill(); }
    rr(x, -w / 2, -h / 2, w, h, h / 2); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.35)'; rr(x, -w / 2 + h * 0.25, -h / 2 + h * 0.12, w - h * 0.5, h * 0.16, h * 0.08); x.fill();
    x.fillStyle = o.fg || C.ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, 0, px * 0.06);
    x.restore();
    return w;
  }

  // ---------- sky: gradient, nebula glows, parallax stars and sparkles ----------
  let STARS = null;
  function stars() {
    if (STARS) return STARS;
    const r = H.rng(77), a = [], sp = [];
    for (let i = 0; i < 620; i++) a.push({ x: r.range(0, 1680), y: r.range(0, 1120), d: r.pick([0.15, 0.3, 0.3, 0.55, 1]), s: r.range(0.6, 2.0), ph: r.range(0, TAU), sp: r.range(0.8, 2.6), c: r.pick(['#ffffff', '#cfe4ff', '#ffe9c7', '#dccbff']) });
    for (let i = 0; i < 16; i++) sp.push({ x: r.range(0, 1680), y: r.range(0, 1120), d: r.range(0.3, 0.9), s: r.range(6, 13), ph: r.range(0, TAU) });
    STARS = { a, sp }; return STARS;
  }
  function sky(x, W, H_, t, cam = {}) {
    const px = cam.x || 0, py = cam.y || 0, lz = Math.log(cam.z || 1);
    const g = x.createLinearGradient(0, 0, W * 0.3, H_);
    g.addColorStop(0, C.sky0); g.addColorStop(0.5, C.sky1); g.addColorStop(1, C.sky2);
    x.fillStyle = g; x.fillRect(0, 0, W, H_);
    glow(x, W * 0.86, H_ * 0.12, 700, '#7b34c6', 0.34);
    glow(x, W * 0.05, H_ * 1.0, 620, '#2448b4', 0.4);
    glow(x, W * 0.45, H_ * 0.6, 520, '#4a2a9c', 0.16);
    const S = stars();
    const place = (s) => {
      const k = Math.exp(lz * s.d * 0.6);
      let sx = (((s.x - px * s.d) % 1680) + 1680) % 1680 - 200, sy = (((s.y - py * s.d) % 1120) + 1120) % 1120 - 200;
      return [(sx - 640) * k + 640, (sy - 360) * k + 360];
    };
    for (const s of S.a) {
      const [sx, sy] = place(s);
      if (sx < -4 || sx > W + 4 || sy < -4 || sy > H_ + 4) continue;
      x.globalAlpha = (0.55 + 0.45 * Math.sin(t * s.sp + s.ph)) * (0.45 + s.d * 0.55);
      x.fillStyle = s.c; x.beginPath(); x.arc(sx, sy, s.s * (0.7 + 0.35 * s.d), 0, TAU); x.fill();
    }
    x.globalAlpha = 1;
    for (const s of S.sp) {
      const [sx, sy] = place(s); const tw = 0.6 + 0.4 * Math.sin(t * 1.7 + s.ph);
      glow(x, sx, sy, s.s * 2.2, '#bfa8ff', 0.25 * tw);
      spark(x, sx, sy, s.s * tw, '#ffffff', 0.9);
    }
  }

  // ---------- planets ----------
  function ring(x, cx, cy, R, half, a = 1) {
    if (a <= 0) return;
    x.save(); x.translate(cx, cy); x.rotate(R.tilt); x.globalAlpha *= a;
    // clip to the back or front half, wide enough for the outermost band so the ring ends are never cut off
    const m = Math.max(...R.bands.map((b) => b[1])) * 1.05;
    x.beginPath(); if (half === 'back') x.rect(-R.rx * m, -R.ry * m, R.rx * m * 2, R.ry * m); else x.rect(-R.rx * m, 0, R.rx * m * 2, R.ry * m); x.clip();
    for (const [f0, f1, col, al] of R.bands) {
      x.beginPath(); x.ellipse(0, 0, R.rx * f1, R.ry * f1, 0, 0, TAU); x.ellipse(0, 0, R.rx * f0, R.ry * f0, 0, 0, TAU);
      x.fillStyle = H.rgba(col, (al == null ? 1 : al) * (half === 'back' ? 0.75 : 1)); x.fill('evenodd');
    }
    x.restore();
  }
  function bands(x, r, B, tilt) {
    x.save(); x.rotate(tilt || 0);
    for (const [v0, v1, col, a] of B) {
      x.beginPath();
      for (let i = 0; i <= 20; i++) { const u = (i / 20) * 2 - 1; x.lineTo(u * r * 1.1, (v0 + 0.13 * (1 - u * u)) * r); }
      for (let i = 20; i >= 0; i--) { const u = (i / 20) * 2 - 1; x.lineTo(u * r * 1.1, (v1 + 0.13 * (1 - u * u)) * r); }
      x.fillStyle = H.rgba(col, a == null ? 1 : a); x.fill();
    }
    x.restore();
  }
  const PL = {
    magenta: { c: ['#ffa0c4', '#de4b93', '#4e1670'], glow: '#ff5fa8', tilt: -0.18, atmo: [255, 214, 234],
      bands: [[-0.62, -0.48, '#ffc1d8', 0.55], [-0.2, -0.02, '#b5307e', 0.6], [0.06, 0.14, '#ffd0e2', 0.4], [0.36, 0.58, '#9a2775', 0.55]],
      ring: { rx: 1.75, ry: 0.5, tilt: -0.2, bands: [[1.18, 1.32, '#ffd27a', 0.95], [1.34, 1.5, '#ff9f5a', 0.9], [1.53, 1.6, '#ffe7b0', 0.8]] } },
    coral: { c: ['#ffd29a', '#ff7a4a', '#7a1f4f'], glow: '#ff8a50', tilt: 0.1, atmo: [255, 226, 190],
      bands: [[-0.7, -0.5, '#ffe2b8', 0.5], [-0.32, -0.12, '#e8553a', 0.6], [0.05, 0.22, '#ffb27a', 0.5], [0.4, 0.62, '#c43c46', 0.55]] },
    teal: { c: ['#9ff3ff', '#3a9be0', '#1d2f86'], glow: '#4fc9ff', tilt: -0.12, atmo: [190, 245, 255],
      bands: [[-0.5, -0.36, '#c6f8ff', 0.5], [-0.05, 0.1, '#2f74c9', 0.55], [0.32, 0.5, '#7fdcff', 0.4]] },
    moon: { c: ['#e8e6ff', '#a7a2d8', '#4a3f8c'], craters: true },
  };
  function planet(x, cx, cy, r, pal, o = {}) {
    if (r <= 0.5) return;
    const ra = o.ringA == null ? 1 : o.ringA;
    if (pal.glow) glow(x, cx, cy, r * 1.7, pal.glow, o.glowA == null ? 0.32 : o.glowA);
    const R = pal.ring && { rx: pal.ring.rx * r, ry: pal.ring.ry * r, tilt: pal.ring.tilt, bands: pal.ring.bands };
    if (R) ring(x, cx, cy, R, 'back', ra);
    if (o.behind) o.behind(R);
    ball(x, cx, cy, r, pal.c, {
      sh: 0.34, sha: 0.55, rima: 0.35,
      inner: () => {
        x.save(); x.translate(cx, cy);
        if (pal.bands) bands(x, r, pal.bands, pal.tilt);
        if (pal.craters) { const q = H.rng(5); for (let i = 0; i < 5; i++) { const a = q.range(0, TAU), d = q.range(0.1, 0.65) * r, cr = q.range(0.1, 0.2) * r, qx = Math.cos(a) * d, qy = Math.sin(a) * d; x.fillStyle = 'rgba(80,66,150,0.38)'; x.beginPath(); x.arc(qx, qy, cr, 0, TAU); x.fill(); crescent(x, qx, qy, cr, -cr * 0.3, -cr * 0.3, 'rgba(255,255,255,0.3)'); } }
        x.restore();
      },
    });
    const atA = o.atmo == null ? 0.7 : o.atmo;
    if (pal.atmo && atA > 0) { // thin bright atmosphere on the limb, strongest on the lit (upper-left) side
      x.save(); x.lineCap = 'round'; const ga0 = x.globalAlpha;
      const la = -2.25, ag = x.createLinearGradient(cx + Math.cos(la) * r, cy + Math.sin(la) * r, cx - Math.cos(la) * r, cy - Math.sin(la) * r);
      ag.addColorStop(0, H.rgba(pal.atmo, 1)); ag.addColorStop(0.55, H.rgba(pal.atmo, 0.5)); ag.addColorStop(1, H.rgba(pal.atmo, 0.08));
      x.strokeStyle = ag;
      for (const [lw, a] of [[r * 0.05, 0.08], [r * 0.028, 0.16], [r * 0.014, 0.3], [Math.max(2, r * 0.006), 0.6]]) { x.globalAlpha = ga0 * a * atA; x.lineWidth = lw; x.beginPath(); x.arc(cx, cy, r + lw * 0.15, 0, TAU); x.stroke(); }
      x.restore();
    }
    if (R) ring(x, cx, cy, R, 'front', ra);
    if (o.front) o.front(R);
  }

  // ---------- print finish: fine animated grain + soft static mottling (overlay), kills gradient banding ----------
  let GRAIN = null;
  function grainTex() {
    if (GRAIN) return GRAIN;
    const S = 256, tile = H.layer(S, S), tc = tile.getContext('2d'), img = tc.createImageData(S, S), d = img.data, r = H.rng(4242);
    for (let i = 0; i < d.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 92; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    tc.putImageData(img, 0, 0);
    const MW = 320, MH = 180, mot = H.layer(MW, MH), mc = mot.getContext('2d'), mi = mc.createImageData(MW, MH), md = mi.data, nz = H.makeNoise(88);
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const v = 128 + nz.fbm2(x * 0.035, y * 0.035, 4) * 70 + nz.n2(x * 0.22, y * 0.22) * 14, k = (y * MW + x) * 4; md[k] = md[k + 1] = md[k + 2] = v; md[k + 3] = 255; }
    mc.putImageData(mi, 0, 0);
    GRAIN = { tile, mot };
    return GRAIN;
  }
  function finish(x, W, H_, t) {
    const G = grainTex(), f = Math.floor(t * 24);
    x.save(); x.globalCompositeOperation = 'overlay';
    x.globalAlpha = 0.12; x.imageSmoothingEnabled = true; x.drawImage(G.mot, 0, 0, W, H_);
    const pat = x.createPattern(G.tile, 'repeat'); pat.setTransform(new DOMMatrix().translateSelf((f * 73) % 256, (f * 151) % 256));
    x.globalAlpha = 0.09; x.fillStyle = pat; x.fillRect(0, 0, W, H_);
    x.restore();
  }

  // ---------- eyes (big white, dark pupils) ----------
  function eye(x, ex, ey, er, o) {
    const look = o.look || [0, 0];
    if ((o.happy || 0) > 0.5) {
      x.save(); x.strokeStyle = '#ffffff'; x.lineWidth = er * 0.42; x.lineCap = 'round';
      x.beginPath(); x.arc(ex, ey + er * 0.35, er * 0.62, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); x.restore(); return;
    }
    const bl = 1 - 0.92 * (o.blink || 0);
    x.save(); x.translate(ex, ey); x.scale(1, bl);
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(0, 0, er, 0, TAU); x.fill();
    const pr = er * (o.worry ? 0.5 : 0.56);
    const px = look[0] * er * 0.36, py = look[1] * er * 0.36;
    x.fillStyle = '#141638'; x.beginPath(); x.arc(px, py, pr, 0, TAU); x.fill();
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(px - pr * 0.35, py - pr * 0.4, pr * 0.32, 0, TAU); x.fill();
    x.beginPath(); x.arc(px + pr * 0.35, py + pr * 0.35, pr * 0.13, 0, TAU); x.fill();
    x.restore();
  }
  const blinkAt = (t, ph) => { const u = (t + ph) % 3.3; return u < 0.14 ? Math.sin((u / 0.14) * Math.PI) : 0; };

  // ---------- the AI: a chunky round robot with a glass brain dome ----------
  const NET = (() => {
    const r = H.rng(31), L = [[-0.6, [-0.42, 0.02, 0.44]], [0, [-0.58, -0.2, 0.2, 0.58]], [0.6, [-0.4, 0.04, 0.44]]];
    const nodes = []; L.forEach(([lx, ys], li) => ys.forEach((y) => nodes.push({ x: lx, y: y - 0.05, l: li })));
    const byL = (l) => nodes.map((n, i) => [n, i]).filter(([n]) => n.l === l).map(([, i]) => i);
    const edges = [];
    const l0 = byL(0), l1 = byL(1), l2 = byL(2);
    l0.forEach((a, k) => { const tA = [l1[k], l1[k + 1]], tB = [l1[(k + 2) % 4], l1[k + 1]]; tA.forEach((b, j) => edges.push({ a, b, b2: tB[j], w: r.range(0.2, 0.5), w2: r.range(0.6, 1) })); });
    l1.forEach((a, k) => { const tA = [l2[k % 3], l2[(k + 1) % 3]], tB = [l2[(k + 2) % 3], l2[(k + 1) % 3]]; tA.forEach((b, j) => edges.push({ a, b, b2: tB[j], w: r.range(0.2, 0.5), w2: r.range(0.6, 1) })); });
    return { nodes, edges };
  })();
  function network(x, cx, cy, dr, o) {
    const rw = o.rewire || 0, br = o.bright == null ? 0.5 : o.bright, err = o.err || 0, t = o.t || 0, s = dr * 0.82;
    const P = (i) => [cx + NET.nodes[i].x * s, cy + NET.nodes[i].y * s];
    x.save(); x.lineCap = 'round';
    NET.edges.forEach((e, k) => {
      const a = P(e.a), b0 = P(e.b), b1 = P(e.b2), m = eio(cl(rw * 1.25 - (k % 6) * 0.05));
      const b = [lerp(b0[0], b1[0], m), lerp(b0[1], b1[1], m)], w = lerp(e.w, e.w2, m);
      const col = H.mix(H.mix('#7a5cff', '#ffd23f', w * (0.4 + br * 0.6)), '#ff3b5c', err);
      x.strokeStyle = H.rgba(col, 0.55 + 0.45 * w); x.lineWidth = dr * (0.025 + 0.05 * w);
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - dr * 0.08;
      x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo(mx, my, b[0], b[1]); x.stroke();
      // a little signal dot running along
      const u = (t * 0.9 + k * 0.137) % 1, v = 1 - u;
      const qx = v * v * a[0] + 2 * v * u * mx + u * u * b[0], qy = v * v * a[1] + 2 * v * u * my + u * u * b[1];
      x.fillStyle = H.rgba(err > 0.3 ? '#ffb0bf' : '#fff6c8', 0.8 * (0.4 + br * 0.6)); x.beginPath(); x.arc(qx, qy, dr * 0.035, 0, TAU); x.fill();
    });
    NET.nodes.forEach((n, i) => {
      const [nx, ny] = P(i), pulse = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.3);
      const col = H.mix(H.mix('#9b7bff', '#ffe066', br), '#ff4a66', err);
      glow(x, nx, ny, dr * (0.2 + 0.22 * br), col, 0.35 + 0.4 * br);
      x.fillStyle = H.rgba(col); x.beginPath(); x.arc(nx, ny, dr * (0.085 + 0.03 * br), 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.75)'; x.beginPath(); x.arc(nx - dr * 0.025, ny - dr * 0.025, dr * 0.035, 0, TAU); x.fill();
    });
    x.restore();
  }
  function robot(x, cx, cy, R, o = {}) {
    if (R < 1) return;
    const t = o.t || 0, red = o.red || 0, happy = o.happy || 0, worry = o.worry || 0;
    if (red > 0) glow(x, cx, cy - R * 0.4, R * 2.2, '#ff3b5c', 0.5 * red);
    // thruster flame
    const fl = 1 + 0.14 * Math.sin(t * 29) + 0.08 * Math.sin(t * 13.7);
    glow(x, cx, cy + R * 1.25, R * 0.95, '#ff9a3d', 0.4);
    x.fillStyle = '#ff8a3d'; x.beginPath(); x.moveTo(cx - R * 0.25, cy + R * 0.9);
    x.quadraticCurveTo(cx - R * 0.2, cy + R * (1.25 + 0.2 * fl), cx, cy + R * (1.35 + 0.42 * fl)); x.quadraticCurveTo(cx + R * 0.2, cy + R * (1.25 + 0.2 * fl), cx + R * 0.25, cy + R * 0.9); x.fill();
    x.fillStyle = '#ffd94a'; x.beginPath(); x.moveTo(cx - R * 0.13, cy + R * 0.92);
    x.quadraticCurveTo(cx - R * 0.1, cy + R * (1.15 + 0.1 * fl), cx, cy + R * (1.2 + 0.22 * fl)); x.quadraticCurveTo(cx + R * 0.1, cy + R * (1.15 + 0.1 * fl), cx + R * 0.13, cy + R * 0.92); x.fill();
    x.fillStyle = '#16307a'; rr(x, cx - R * 0.32, cy + R * 0.78, R * 0.64, R * 0.22, R * 0.08); x.fill();
    // arms
    for (const sd of [-1, 1]) {
      const up = (o.armUp || 0) * (sd > 0 ? 1 : 0.6), ang = sd * (0.55 + 0.12 * Math.sin(t * 2.2 + sd)) - sd * up * 1.6;
      const sx = cx + sd * R * 0.86, sy = cy + R * 0.12, ex = sx + Math.sin(ang) * R * 0.55, ey = sy + Math.cos(ang) * R * 0.55;
      x.strokeStyle = '#1d5aa6'; x.lineWidth = R * 0.24; x.lineCap = 'round'; x.beginPath(); x.moveTo(sx, sy); x.lineTo(ex, ey); x.stroke();
      ball(x, ex, ey, R * 0.17, C.teal, { sha: 0.4 });
    }
    // brain dome (glass) with the glowing network inside
    const dr = R * 0.76, dx = cx, dy = cy - R * 1.02;
    glow(x, dx, dy, dr * 2.0, red > 0.2 ? '#ff3b5c' : '#58e6ff', 0.22 + 0.25 * (o.brainGlow || 0) + 0.2 * red);
    x.save(); x.beginPath(); x.arc(dx, dy, dr, 0, TAU); x.clip();
    const dg = x.createRadialGradient(dx - dr * 0.3, dy - dr * 0.3, 0, dx, dy, dr * 1.1);
    dg.addColorStop(0, '#2a3a9c'); dg.addColorStop(0.6, '#18206a'); dg.addColorStop(1, '#0d1146');
    x.fillStyle = dg; x.fillRect(dx - dr, dy - dr, dr * 2, dr * 2);
    if (red > 0) { x.fillStyle = H.rgba('#ff3b5c', 0.3 * red); x.fillRect(dx - dr, dy - dr, dr * 2, dr * 2); }
    network(x, dx, dy - dr * 0.12, dr * 0.92, o);
    x.restore();
    crescent(x, dx, dy, dr, dr * 0.1, dr * 0.12, 'rgba(190,250,255,0.55)');
    crescent(x, dx, dy, dr, -dr * 0.22, -dr * 0.2, 'rgba(8,10,50,0.28)');
    x.save(); x.strokeStyle = 'rgba(255,255,255,0.6)'; x.lineWidth = dr * 0.09; x.lineCap = 'round';
    x.beginPath(); x.arc(dx, dy, dr * 0.74, Math.PI * 1.08, Math.PI * 1.36); x.stroke();
    x.fillStyle = 'rgba(255,255,255,0.6)'; x.beginPath(); x.arc(dx + dr * 0.74 * Math.cos(Math.PI * 1.5), dy - dr * 0.74, dr * 0.05, 0, TAU); x.fill(); x.restore();
    // collar
    x.fillStyle = '#1b4c9c'; rr(x, cx - R * 0.6, cy - R * 0.84, R * 1.2, R * 0.26, R * 0.13); x.fill();
    x.fillStyle = 'rgba(160,240,255,0.5)'; rr(x, cx - R * 0.5, cy - R * 0.81, R * 0.7, R * 0.06, R * 0.03); x.fill();
    // body
    ball(x, cx, cy, R, C.teal, { sha: 0.5 });
    // visor face
    const vw = R * 1.36, vh = R * 0.78, vx = cx - vw / 2 + R * 0.02, vy = cy - R * 0.42;
    x.fillStyle = '#0c1145'; rr(x, vx, vy + R * 0.05, vw, vh, R * 0.34); x.fill();
    const vg = x.createLinearGradient(vx, vy, vx + vw, vy + vh); vg.addColorStop(0, '#26338e'); vg.addColorStop(0.5, '#151c5c'); vg.addColorStop(1, '#0d1246');
    x.fillStyle = vg; rr(x, vx, vy, vw, vh, R * 0.34); x.fill();
    x.fillStyle = 'rgba(160,240,255,0.22)'; rr(x, vx + R * 0.16, vy + R * 0.07, vw * 0.45, R * 0.07, R * 0.035); x.fill();
    const ey = vy + vh * 0.48, er = R * 0.19, look = o.look || [0, 0];
    for (const sd of [-1, 1]) eye(x, cx + sd * R * 0.3, ey, er, { look, blink: o.blink, happy, worry: worry > 0.5 });
    // brows when worried
    if (worry > 0.02) {
      x.save(); x.globalAlpha *= cl(worry * 2); x.strokeStyle = '#9ff7ff'; x.lineWidth = R * 0.065; x.lineCap = 'round';
      for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(cx + sd * R * 0.46, ey - er * 1.05); x.lineTo(cx + sd * R * 0.16, ey - er * 1.5); x.stroke(); }
      x.restore();
    }
    // mouth
    x.save(); x.strokeStyle = '#9ff7ff'; x.lineWidth = R * 0.06; x.lineCap = 'round'; x.beginPath();
    const my = vy + vh * 0.86;
    if (worry > 0.5) { x.moveTo(cx - R * 0.12, my); x.quadraticCurveTo(cx - R * 0.06, my - R * 0.06, cx, my); x.quadraticCurveTo(cx + R * 0.06, my + R * 0.06, cx + R * 0.12, my); }
    else if (happy > 0.5) { x.arc(cx, my - R * 0.06, R * 0.12, 0.15 * Math.PI, 0.85 * Math.PI); }
    else { x.arc(cx, my - R * 0.1, R * 0.1, 0.3 * Math.PI, 0.7 * Math.PI); }
    x.stroke(); x.restore();
    // belly lights
    ['#ffd23f', '#ff5d8f', '#56e8ff'].forEach((c, i) => { const bx = cx + (i - 1) * R * 0.2, by = cy + R * 0.58; glow(x, bx, by, R * 0.12, c, 0.5); x.fillStyle = c; x.beginPath(); x.arc(bx, by, R * 0.055, 0, TAU); x.fill(); });
    // sweat drop
    if (worry > 0.3) {
      const sx = cx + R * 0.82, sy = cy - R * 0.38 + (t * 40 % (R * 0.3));
      x.save(); x.globalAlpha *= cl((worry - 0.3) * 3); x.fillStyle = '#7fe6ff';
      x.beginPath(); x.moveTo(sx, sy - R * 0.16); x.quadraticCurveTo(sx + R * 0.09, sy, sx, sy + R * 0.06); x.quadraticCurveTo(sx - R * 0.09, sy, sx, sy - R * 0.16); x.fill(); x.restore();
    }
  }

  // ---------- creatures: little cat and dog (training data) ----------
  function cat(x, cx, cy, r, o = {}) {
    if (r < 1) return;
    const t = o.t || 0;
    x.save(); x.translate(cx, cy); x.rotate(o.rot || 0);
    x.strokeStyle = C.orange[2]; x.lineWidth = r * 0.24; x.lineCap = 'round';
    x.beginPath(); x.moveTo(r * 0.6, r * 0.55); x.quadraticCurveTo(r * 1.4, r * 0.55 + Math.sin(t * 3) * r * 0.12, r * 1.18, -r * 0.2); x.stroke();
    for (const sd of [-1, 1]) {
      x.fillStyle = sd < 0 ? C.orange[1] : '#e8693a'; x.strokeStyle = x.fillStyle; x.lineWidth = r * 0.16; x.lineJoin = 'round';
      x.beginPath(); x.moveTo(sd * r * 0.82, -r * 0.3); x.lineTo(sd * r * 0.66, -r * 1.08); x.lineTo(sd * r * 0.14, -r * 0.8); x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#ff9fb4'; x.beginPath(); x.moveTo(sd * r * 0.66, -r * 0.48); x.lineTo(sd * r * 0.62, -r * 0.9); x.lineTo(sd * r * 0.32, -r * 0.74); x.closePath(); x.fill();
    }
    ball(x, 0, 0, r, C.orange, { sha: 0.45, inner: () => {
      x.fillStyle = 'rgba(200,70,40,0.55)';
      for (const k of [-1, 0, 1]) { rr(x, k * r * 0.17 - r * 0.045, -r * 0.92, r * 0.09, r * 0.3, r * 0.045); x.fill(); }
      x.fillStyle = 'rgba(255,240,220,0.9)'; x.beginPath(); x.ellipse(0, r * 0.42, r * 0.42, r * 0.3, 0, 0, TAU); x.fill();
    } });
    for (const sd of [-1, 1]) eye(x, sd * r * 0.36, -r * 0.08, r * 0.25, { look: o.look, blink: o.blink, happy: o.happy });
    x.fillStyle = '#ff6f8e'; x.beginPath(); x.moveTo(-r * 0.09, r * 0.22); x.lineTo(r * 0.09, r * 0.22); x.lineTo(0, r * 0.33); x.closePath(); x.fill();
    x.strokeStyle = '#7a2e2e'; x.lineWidth = r * 0.05; x.lineCap = 'round'; x.beginPath();
    x.arc(-r * 0.08, r * 0.36, r * 0.08, 0.1 * Math.PI, 0.9 * Math.PI); x.moveTo(r * 0.16, r * 0.36 + r * 0.025); x.arc(r * 0.08, r * 0.36, r * 0.08, 0.1 * Math.PI, 0.9 * Math.PI); x.stroke();
    x.restore();
  }
  function dog(x, cx, cy, r, o = {}) {
    if (r < 1) return;
    const t = o.t || 0;
    x.save(); x.translate(cx, cy); x.rotate(o.rot || 0);
    ball(x, 0, 0, r, C.tan, { sha: 0.45, inner: () => {
      x.fillStyle = 'rgba(150,85,40,0.55)'; x.beginPath(); x.arc(r * 0.38, -r * 0.2, r * 0.36, 0, TAU); x.fill();
      x.fillStyle = '#fff3dc'; x.beginPath(); x.ellipse(0, r * 0.36, r * 0.4, r * 0.3, 0, 0, TAU); x.fill();
    } });
    for (const sd of [-1, 1]) {
      x.save(); x.translate(sd * r * 0.86, -r * 0.18); x.rotate(sd * (0.35 + 0.08 * Math.sin(t * 4 + sd)));
      x.fillStyle = '#8b4f2c'; x.beginPath(); x.ellipse(0, r * 0.18, r * 0.27, r * 0.55, 0, 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,200,150,0.25)'; x.beginPath(); x.ellipse(-sd * r * 0.06, r * 0.05, r * 0.1, r * 0.3, 0, 0, TAU); x.fill();
      x.restore();
    }
    for (const sd of [-1, 1]) eye(x, sd * r * 0.34, -r * 0.12, r * 0.23, { look: o.look, blink: o.blink, happy: o.happy });
    x.fillStyle = '#2a1a2a'; x.beginPath(); x.ellipse(0, r * 0.22, r * 0.13, r * 0.09, 0, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.6)'; x.beginPath(); x.arc(-r * 0.04, r * 0.19, r * 0.03, 0, TAU); x.fill();
    x.fillStyle = '#ff6f8e'; rr(x, -r * 0.08, r * 0.38, r * 0.16, r * 0.17, r * 0.08); x.fill();
    x.restore();
  }
  const creature = (x, kind, cx, cy, r, o) => (kind === 'cat' ? cat : dog)(x, cx, cy, r, o);

  // speech bubble with a tail
  function bubble(x, cx, cy, w, h, tx, ty, s, col) {
    if (s <= 0.01) return;
    x.save(); x.translate(cx, cy); x.scale(s, s);
    x.fillStyle = 'rgba(10,8,46,0.4)'; rr(x, -w / 2, -h / 2 + 8, w, h, h / 2); x.fill();
    x.fillStyle = col || '#ffffff';
    x.beginPath(); x.moveTo(-w * 0.18, h * 0.3); x.lineTo((tx - cx) / s, (ty - cy) / s); x.lineTo(-w * 0.02, h * 0.42); x.fill();
    rr(x, -w / 2, -h / 2, w, h, h / 2); x.fill();
    x.restore();
  }
  function badge(x, cx, cy, r, ok, s) {
    if (s <= 0.01) return;
    x.save(); x.translate(cx, cy); x.scale(s, s);
    glow(x, 0, 0, r * 2.4, ok ? C.green : C.red, 0.45);
    ball(x, 0, 0, r, ok ? ['#9fffc8', C.green, '#178a5a'] : ['#ff9aa8', C.red, '#9c1638'], { sha: 0.4 });
    x.strokeStyle = '#ffffff'; x.lineWidth = r * 0.26; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath();
    if (ok) { x.moveTo(-r * 0.42, 0); x.lineTo(-r * 0.1, r * 0.32); x.lineTo(r * 0.45, -r * 0.3); }
    else { x.moveTo(-r * 0.34, -r * 0.34); x.lineTo(r * 0.34, r * 0.34); x.moveTo(r * 0.34, -r * 0.34); x.lineTo(-r * 0.34, r * 0.34); }
    x.stroke(); x.restore();
  }
  function flare(x, cx, cy, k, t, seed) {
    if (k <= 0) return;
    glow(x, cx, cy, 420 * (0.6 + 0.4 * k), '#ffcf5a', 0.55 * k);
    glow(x, cx, cy, 160, '#fff6d0', 0.6 * k);
    x.save(); x.translate(cx, cy); x.rotate(t * 0.25); x.globalAlpha *= 0.32 * k; x.fillStyle = '#ffe28a';
    for (let i = 0; i < 12; i++) { x.rotate(TAU / 12); x.beginPath(); x.moveTo(0, -12); x.lineTo(330 + 60 * (i % 2), 0); x.lineTo(0, 12); x.fill(); }
    x.restore();
  }
  function burst(x, cx, cy, age, seed, spread) {
    if (age < 0 || age > 1.4) return;
    const r = H.rng(seed);
    for (let i = 0; i < 18; i++) {
      const a = r.range(0, TAU), d = (spread || 300) * r.range(0.45, 1) * eo(cl(age / 0.9)), sz = r.range(7, 16) * (1 - cl(age / 1.4));
      spark(x, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, sz, r.pick(['#ffffff', '#ffe28a', '#9ff7ff', '#ffb0d0']), 1);
    }
  }

  // ---------- galaxy of examples (precomputed) ----------
  let GAL = null;
  function galaxyPts() {
    if (GAL) return GAL;
    const r = H.rng(901); GAL = [];
    for (let i = 0; i < 2600; i++) {
      const arm = i % 3, u = Math.pow(r(), 0.85), rr2 = 260 + 5300 * u;
      const ang = arm * (TAU / 3) + rr2 * 0.00075 + r.gauss() * (0.16 + 0.25 * (1 - u));
      GAL.push({ rr: rr2 * (1 + r.gauss() * 0.04), a: ang, s: r.range(1.2, 3.2), c: r.pick(['#ff9a4a', '#ffcc7a', '#ecb676', '#ffffff', '#9ff7ff', '#ff8fb8']) });
    }
    return GAL;
  }
  function galaxy(x, cx, cy, s, rot, a) {
    if (a <= 0.01) return;
    glow(x, cx, cy, 5600 * s * 0.55, '#8a5cff', 0.35 * a);
    glow(x, cx, cy, 5600 * s * 0.22, '#ffcf7a', 0.4 * a);
    x.save(); x.globalAlpha = a;
    for (const p of galaxyPts()) {
      const ang = p.a + rot, d = p.rr * s;
      if (d < 14) continue;
      const px = cx + Math.cos(ang) * d, py = cy + Math.sin(ang) * d * 0.52;
      if (px < -5 || px > 1285 || py < -5 || py > 725) continue;
      x.fillStyle = p.c; x.beginPath(); x.arc(px, py, p.s, 0, TAU); x.fill();
    }
    x.restore();
  }

  // ---------- header pill ----------
  function header(x, a) { pill(x, 186, 44, 'How does AI learn?', 28, { a, bg: 'rgba(255,255,255,0.95)' }); }

  // ================= EXPLAINER SCENES =================
  const ROBOT_A0 = [640, 470], ROBOT_A1 = [930, 400];
  const DOME_A1 = [ROBOT_A1[0], ROBOT_A1[1] - 1.02 * 100];
  const STREAM = [[-140, 230], [330, 720], [560, 60], [DOME_A1[0] - 40, DOME_A1[1] - 10]];

  function exA(x, W, H_, t) {
    const zo = eio(seg(t, TL.zoom[0], TL.zoom[1]));
    const s = Math.exp(lerp(0, Math.log(0.062), zo));
    const mv = eio(seg(t, TL.robotMove[0], TL.robotMove[1]));
    const RW = [lerp(ROBOT_A0[0], ROBOT_A1[0], mv), lerp(ROBOT_A0[1], ROBOT_A1[1], mv)];
    const Cs = [lerp(RW[0], 680, zo), lerp(RW[1], 330, zo)];
    const toS = (wx, wy) => [Cs[0] + (wx - RW[0]) * s, Cs[1] + (wy - RW[1]) * s];
    const pull = 1 + 1.8 * (1 - eo(seg(t, 0, 1.4)));
    sky(x, W, H_, t, { z: pull * Math.pow(s, 0.35), x: t * 14 + mv * 60, y: 0 });

    // background planet (mid distance, drifts)
    const bp = toS(1170 - t * 6, 690); planet(x, bp[0], bp[1], 165 * s * (0.9 + 0.1 * eo(seg(t, 0, 1.4))), PL.magenta, { glowA: 0.28 });
    const mp = toS(1110 - t * 4, 140); planet(x, mp[0], mp[1], 34 * s, PL.moon);

    // galaxy of examples
    const ga = cl((0.75 - s) / 0.5);
    galaxy(x, Cs[0], Cs[1], s, -0.5 + t * 0.22, ga);

    // stream arrow
    const ap = eio(seg(t, TL.arrow[0], TL.arrow[1]));
    const SP = STREAM.map(([a, b]) => toS(a, b));
    arrow(x, SP, ap, '#7ff0ff', Math.max(1.5, 9 * s), { dots: true, a: 0.75 * (1 - ga) });

    // creatures flowing in along the stream
    let absorb = 0;
    SPAWN.forEach((ts, i) => {
      const u = (t - ts) / TL.travel;
      if (u > 0.98 && u < 1.25) absorb = Math.max(absorb, 1 - (u - 0.98) / 0.27);
      if (u <= 0 || u >= 1) return;
      const uu = 0.2 * eio(u) + 0.8 * u, p = bez(SP, uu), kind = KIND(i);
      const bob = Math.sin(t * 3 + i) * 8 * s;
      const r = 50 * s * back(cl(u / 0.12)) * (1 - 0.85 * H.smooth(0.82, 1, u));
      creature(x, kind, p[0], p[1] + bob, r, { t: t + i, rot: Math.sin(t * 2 + i) * 0.12, look: [0.6, -0.2], blink: blinkAt(t, i * 0.7) });
      if (s > 0.45) pill(x, p[0], p[1] + bob - r - 34 * s, kind, 26, { s: back(cl((u - 0.05) / 0.12)) * s, a: 1 - H.smooth(0.72, 0.86, u), ptr: true });
    });

    // the robot (the model)
    const rin = back(seg(t, TL.robotIn[0], TL.robotIn[1]), 1.2);
    const R = 100 * (0.88 + 0.12 * mv) * s * rin;
    const rp = toS(RW[0], RW[1] + Math.sin(t * 1.8) * 9);
    const lookA = t < 2.6 ? [0, -0.2] : [-0.7, -0.4];
    robot(x, rp[0], rp[1], R, { t, look: lookA, blink: blinkAt(t, 0.3), bright: 0.35 + 0.4 * absorb + 0.3 * seg(t, 2.8, 5.6), brainGlow: absorb, rewire: 0 });
    if (absorb > 0 && s > 0.3) burst(x, rp[0] - 10 * s, rp[1] - 120 * s, 1 - absorb, Math.floor(t * 4), 70 * s);
    if (ga > 0.3) { glow(x, rp[0], rp[1], 120, '#fff2c0', 0.5 * ga); spark(x, rp[0], rp[1], 26 * ga, '#ffffff', ga); }
    // "?" thought in the hook
    const qa = seg(t, 1.25, 1.45) * (1 - seg(t, 2.2, 2.4));
    if (qa > 0) { const qs = back(seg(t, 1.25, 1.55)); x.save(); x.globalAlpha = qa; ball(x, rp[0] + R * 1.05, rp[1] - R * 1.75, 34 * qs, ['#ffffff', '#e8e4ff', '#9a8fe0'], { sha: 0.3 }); text(x, '?', rp[0] + R * 1.05, rp[1] - R * 1.75, 46 * qs, C.violet, { shadow: 'rgba(0,0,0,0)' }); x.restore(); }
    // "AI model" label lands under the robot
    const la = back(seg(t, 2.95, 3.3));
    pill(x, rp[0], rp[1] + Math.max(R * 1.95, 42), 'AI model', 28, { s: la, bg: C.yellow });
    // "1 dot = 1 example" label in the galaxy
    pill(x, 1010, 560, '1 dot = 1 example', 26, { s: back(seg(t, 5.15, 5.45)), bg: '#ffffff' });

    // counter
    if (t > TL.count[0] - 0.3) {
      const ca = seg(t, TL.count[0] - 0.3, TL.count[0]);
      const v = Math.round(1e6 * Math.pow(seg(t, TL.count[0], TL.count[1]), 2.3));
      const land = seg(t, TL.count[1], TL.count[1] + 0.35), pop = 1 + 0.2 * Math.sin(land * Math.PI) * (land > 0 ? 1 : 0);
      x.save(); x.translate(64, 650); x.scale(pop, pop); x.globalAlpha = ca;
      x.font = F(900, 78); const nw = x.measureText(v.toLocaleString('en-US')).width;
      text(x, v.toLocaleString('en-US'), 0, 0, 78, land > 0 ? C.yellow : '#ffffff', { align: 'left' });
      text(x, 'examples', nw + 18, 8, 38, '#bfe9ff', { align: 'left', w: 800 });
      x.restore();
      if (land > 0) burst(x, 220, 640, land * 1.2, 77, 200);
    }

    // title (hook) and its shrink into the header
    const tp = eio(seg(t, TL.titleShrink[0], TL.titleShrink[1]));
    if (tp < 1) {
      const words = ['How', 'does', 'AI', 'learn?'], px = 84; x.font = F(900, px);
      const sp = x.measureText(' ').width, ws = words.map((w) => x.measureText(w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * 3;
      const hx = 186, hy = 44, hs = 28 / px;
      const cx = lerp(640, hx, tp), cy = lerp(215, hy, tp), sc = lerp(1, hs, tp);
      x.save(); x.translate(cx, cy); x.scale(sc, sc);
      let wx = -tot / 2;
      words.forEach((w, i) => {
        const u = back(seg(t, TL.title + i * 0.13, TL.title + i * 0.13 + 0.4), 1.2);
        x.save(); x.translate(wx + ws[i] / 2, (1 - u) * 40); x.scale(u, u);
        text(x, w, 0, 0, px, i === 2 ? C.yellow : '#ffffff');
        x.restore(); wx += ws[i] + sp;
      });
      x.restore();
    }
    if (tp > 0.75) header(x, seg(tp, 0.75, 1));
  }

  // ---- scene B: guess -> check -> adjust ----
  const RB = [320, 470], RBR = 110, DOMEB = [RB[0], RB[1] - 1.02 * RBR];
  const CATB = [985, 450], LOOP = [652, 520], LR = 118;
  const LP = { guess: -Math.PI / 2, check: Math.PI / 6, adjust: (5 * Math.PI) / 6 };
  function loopArc(x, a0, a1, prog, col, lw, alpha) {
    if (prog <= 0) return;
    const e = a0 + (a1 - a0) * prog;
    x.save(); x.globalAlpha *= alpha; x.strokeStyle = col; x.fillStyle = col; x.lineWidth = lw; x.lineCap = 'round';
    x.setLineDash([0.01, lw * 1.9]); x.beginPath(); x.ellipse(LOOP[0], LOOP[1], LR * 1.25, LR, 0, a0, e); x.stroke(); x.setLineDash([]);
    const hx = LOOP[0] + Math.cos(e) * LR * 1.25, hy = LOOP[1] + Math.sin(e) * LR, ang = Math.atan2(Math.cos(e) * LR, -Math.sin(e) * LR * 1.25);
    x.translate(hx, hy); x.rotate(ang); const hs = lw * 1.5; x.beginPath(); x.moveTo(hs * 1.1, 0); x.lineTo(-hs * 0.8, hs); x.lineTo(-hs * 0.8, -hs); x.closePath(); x.fill();
    x.restore();
  }
  function exB(x, W, H_, t) {
    const zA = eio(seg(t, TL.zoomIn[0], TL.zoomIn[1])) - eio(seg(t, TL.zoomBack[0], TL.zoomBack[1]));
    const zC = Math.exp(Math.log(16) * H.ease.in(seg(t, TL.toC[0], TL.toC[1])));
    const z = (1 + 0.32 * zA) * zC;
    sky(x, W, H_, t, { x: 300 + t * 22, y: 40, z: z });
    x.save(); x.translate(DOMEB[0], DOMEB[1]); x.scale(z, z); x.translate(-DOMEB[0], -DOMEB[1]);
    // background planet behind the cat
    planet(x, 1180 - (t - 6) * 10, 830, 250, PL.magenta, { glowA: 0.3 });
    planet(x, 150 - (t - 6) * 5, 120, 30, PL.moon);

    const wrong = seg(t, TL.wrong, TL.wrong + 0.1) * (1 - seg(t, TL.right - 0.2, TL.right));
    const worry = cl(seg(t, TL.wrong, TL.wrong + 0.15) - seg(t, TL.guess2, TL.guess2 + 0.15));
    const happy = t > TL.right + 0.05 ? 1 : 0;
    const redPulse = Math.max(0, 1 - Math.abs(t - (TL.wrong + 0.15)) / 0.35) + 0.6 * seg(t, TL.err[0] + 0.3, TL.err[1]) * (1 - seg(t, TL.rewire[0], TL.rewire[0] + 0.4));
    const rw = eio(seg(t, TL.rewire[0], TL.rewire[1]));
    const bright = 0.35 + 0.65 * rw;

    // loop diagram: Guess -> Check -> Adjust
    const la = seg(t, 6.6, 6.9);
    const act = t < TL.check ? 'guess' : t < TL.adjust ? 'check' : t < TL.guess2 ? 'adjust' : 'guess';
    loopArc(x, LP.guess + 0.42, LP.check - 0.42, eio(seg(t, 6.7, 7.0)), '#9ff7ff', 7, la * 0.8);
    loopArc(x, LP.check + 0.42, LP.adjust - 0.42, eio(seg(t, 6.8, 7.1)), t > TL.err[0] && t < TL.right ? C.red : '#9ff7ff', 7, la * 0.8);
    loopArc(x, LP.adjust + 0.42, LP.guess + TAU - 0.42, eio(seg(t, 6.9, 7.2)), '#9ff7ff', 7, la * 0.8);
    // error pulse travelling check -> adjust -> into the brain
    const ep = seg(t, TL.err[0], TL.err[0] + 0.3);
    if (ep > 0 && ep < 1) { const a = lerp(LP.check, LP.adjust, eio(ep)); const ex = LOOP[0] + Math.cos(a) * LR * 1.25, ey = LOOP[1] + Math.sin(a) * LR; glow(x, ex, ey, 46, C.red, 0.8); x.fillStyle = '#ffd0d8'; x.beginPath(); x.arc(ex, ey, 9, 0, TAU); x.fill(); }
    const EP = [[LOOP[0] + Math.cos(LP.adjust) * LR * 1.25 - 40, LOOP[1] + Math.sin(LP.adjust) * LR - 10], [470, 520], [470, 400], [DOMEB[0] + 0.74 * RBR + 8, DOMEB[1] + 6]];
    const ea = eio(seg(t, TL.err[0] + 0.25, TL.err[1])), eaA = 1 - seg(t, TL.right, TL.right + 0.3);
    arrow(x, EP, ea, C.red, 8, { dots: true, a: eaA });
    if (ea > 0 && ea < 1) { const p = bez(EP, ea); glow(x, p[0], p[1], 40, C.red, 0.8); }
    for (const [k, lab] of [['guess', 'Guess'], ['check', 'Check'], ['adjust', 'Adjust']]) {
      const a = LP[k], px = LOOP[0] + Math.cos(a) * LR * 1.25, py = LOOP[1] + Math.sin(a) * LR;
      const on = act === k && t > TL.guess - 0.05;
      const bg = !on ? 'rgba(235,240,255,0.9)' : k === 'guess' ? (t > TL.guess2 ? C.green : C.yellow) : k === 'check' ? C.red : C.cyan;
      const sIn = back(seg(t, 6.55 + (k === 'check' ? 0.1 : k === 'adjust' ? 0.2 : 0), 6.9 + (k === 'check' ? 0.1 : k === 'adjust' ? 0.2 : 0)));
      const switchT = k === 'guess' ? (t > TL.guess2 ? TL.guess2 : TL.guess) : k === 'check' ? TL.check : TL.adjust;
      const bump = 1 + 0.18 * Math.sin(seg(t, switchT, switchT + 0.3) * Math.PI);
      if (on) glow(x, px, py, 90, bg, 0.35);
      pill(x, px, py, lab, 30, { s: sIn * (on ? bump * 1.08 : 0.92), bg, fg: on && k === 'check' ? '#ffffff' : C.ink });
    }

    // the cat (new example) floats in from the right
    const ci = eo(seg(t, TL.catIn[0], TL.catIn[1]));
    const cxp = lerp(1450, CATB[0], back(seg(t, TL.catIn[0], TL.catIn[1]), 1.1)), cyp = CATB[1] + Math.sin(t * 2.1) * 10;
    cat(x, cxp, cyp, 92, { t, rot: Math.sin(t * 1.6) * 0.08 + (1 - ci) * 0.4, look: [-0.8, -0.1], blink: blinkAt(t, 1.1), happy: t > TL.right + 0.1 ? 1 : 0 });
    // its tag: "?" until checked, then "cat" drops on
    const tagDrop = back(seg(t, TL.check, TL.check + 0.3), 2);
    if (t < TL.check + 0.05) pill(x, cxp, cyp - 155, '?', 30, { s: back(seg(t, 6.8, 7.1)) * (1 - seg(t, TL.check - 0.05, TL.check + 0.05)), bg: '#d9dcff', ptr: true });
    pill(x, cxp, cyp - 155 - (1 - tagDrop) * 60, 'cat', 34, { s: tagDrop, a: seg(t, TL.check, TL.check + 0.08), bg: C.green, ptr: true });
    if (t > TL.check) burst(x, cxp, cyp - 160, (t - TL.check) * 1.4, 12, 120);

    // the robot (model)
    const shake = wrong > 0 ? Math.sin(t * 60) * 6 * Math.max(0, 1 - (t - TL.wrong) / 0.4) : 0;
    const by = RB[1] + Math.sin(t * 1.8) * 8;
    const look = t < 6.9 ? [0.4, -0.2] : t < TL.wrong ? [1, -0.1] : t < TL.adjust ? [0.9, 0.3] : t < TL.guess2 ? [-0.2, -1] : [1, -0.2];
    robot(x, RB[0] + shake, by, RBR, { t, look, blink: blinkAt(t, 0.9), worry, happy, red: cl(redPulse) * 0.8, err: cl(redPulse) * (1 - rw), rewire: rw, bright, brainGlow: 0.5 * rw + 0.6 * Math.max(0, 1 - Math.abs(t - TL.rewire[1]) / 0.4), armUp: happy ? 1 : 0 });
    // "weights" label on the dome during the adjust
    const wl = back(seg(t, TL.adjust, TL.adjust + 0.3)) * (1 - seg(t, TL.toC[0] - 0.2, TL.toC[0]));
    pill(x, DOMEB[0] - 150, DOMEB[1] - 60, 'weights', 26, { s: wl, bg: C.cyan });
    if (wl > 0) arrow(x, [[DOMEB[0] - 150, DOMEB[1] - 36], [DOMEB[0] - 140, DOMEB[1] + 10], [DOMEB[0] - 100, DOMEB[1] + 10], [DOMEB[0] - 70, DOMEB[1] + 4]], eio(seg(t, TL.adjust + 0.1, TL.adjust + 0.4)), C.cyan, 5, { a: wl });
    if (t > TL.rewire[1] - 0.1) burst(x, DOMEB[0], DOMEB[1], (t - TL.rewire[1] + 0.1) * 1.3, 33, 120);

    // speech bubble: "dog?" then "cat"
    const b1 = back(seg(t, TL.bubble, TL.bubble + 0.3)), b2 = seg(t, TL.guess2 - 0.12, TL.guess2) , b2s = back(seg(t, TL.guess2, TL.guess2 + 0.3));
    const BX = 568 + (wrong > 0 ? Math.sin(t * 70) * 5 * Math.max(0, 1 - (t - TL.wrong) / 0.35) : 0), BY = 205;
    if (t < TL.guess2) {
      bubble(x, BX, BY, 230, 112, 420, 350, b1 * (1 - b2), wrong > 0.5 ? '#ffd9df' : '#ffffff');
      x.save(); x.translate(BX, BY); x.scale(b1 * (1 - b2), b1 * (1 - b2)); text(x, 'dog?', 0, 0, 58, wrong > 0.5 ? C.red : C.ink, { shadow: 'rgba(0,0,0,0)' }); x.restore();
      badge(x, BX + 118, BY - 52, 34, false, back(seg(t, TL.wrong, TL.wrong + 0.3), 2.2) * (1 - b2));
    } else {
      bubble(x, BX, BY, 230, 112, 420, 350, b2s, '#e3ffef');
      x.save(); x.translate(BX, BY); x.scale(b2s, b2s); text(x, 'cat', 0, 0, 58, '#12925a', { shadow: 'rgba(0,0,0,0)' }); x.restore();
      badge(x, BX + 118, BY - 52, 34, true, back(seg(t, TL.right, TL.right + 0.3), 2.2));
      burst(x, BX + 118, BY - 52, (t - TL.right) * 1.2, 21, 160);
    }
    x.restore();
    // red flash on the wrong guess
    const fl = Math.max(0, 1 - Math.abs(t - (TL.wrong + 0.1)) / 0.3);
    if (fl > 0) { const g = x.createRadialGradient(640, 360, 200, 640, 360, 760); g.addColorStop(0, 'rgba(255,59,92,0)'); g.addColorStop(1, H.rgba(C.red, 0.55 * fl)); x.fillStyle = g; x.fillRect(0, 0, W, H_); }
  }

  // ---- scene C: accuracy ring + takeaway ----
  const PC = [430, 395], PCR = 182;
  const accAt = (t) => lerp(61, 97, eio(seg(t, TL.acc[0], TL.acc[1])));
  function exC(x, W, H_, t) {
    const em = 1 + 1.3 * (1 - eo(seg(t, TL.toC[1], TL.toC[1] + 0.7)));
    const tk = eio(seg(t, TL.take[0], TL.take[1]));
    sky(x, W, H_, t, { x: 700 + t * 18, y: 80 - tk * 260, z: em });
    x.save(); x.translate(PC[0], PC[1]); x.scale(em, em); x.translate(-PC[0], -PC[1]);
    const acc = accAt(t), hitK = Math.max(0, 1 - Math.abs(t - TL.hit - 0.15) / 0.75) * (t > TL.hit ? 1 : 0);
    const pcx = lerp(PC[0], 640, tk), pcy = lerp(PC[1], 1160, tk), pr = lerp(PCR, 780, tk);
    const ringA = 1 - seg(t, TL.take[0], TL.take[0] + 0.35);
    const frac = acc / 100, a0 = Math.PI * 0.5;
    const head = a0 + frac * TAU;
    const R = { rx: 1.78 * pr, ry: 0.4 * pr, tilt: -0.16 };
    const ringBar = (half) => {
      x.save(); x.translate(pcx, pcy); x.rotate(R.tilt); x.globalAlpha *= ringA;
      x.beginPath(); if (half === 'back') x.rect(-R.rx * 1.3, -R.ry * 1.6, R.rx * 2.6, R.ry * 1.6); else x.rect(-R.rx * 1.3, 0, R.rx * 2.6, R.ry * 1.6); x.clip();
      // track
      x.beginPath(); x.ellipse(0, 0, R.rx, R.ry, 0, 0, TAU); x.ellipse(0, 0, R.rx * 0.8, R.ry * 0.8, 0, 0, TAU); x.fillStyle = half === 'back' ? 'rgba(120,110,210,0.32)' : 'rgba(150,140,240,0.4)'; x.fill('evenodd');
      // fill
      const g = x.createLinearGradient(-R.rx, 0, R.rx, 0); g.addColorStop(0, '#ff8d3f'); g.addColorStop(0.5, '#ffd23f'); g.addColorStop(1, '#fff1a8');
      x.beginPath(); x.ellipse(0, 0, R.rx * 0.98, R.ry * 0.98, 0, a0, head); x.ellipse(0, 0, R.rx * 0.82, R.ry * 0.82, 0, head, a0, true); x.closePath();
      x.fillStyle = g; x.globalAlpha *= half === 'back' ? 0.8 : 1; x.fill();
      if (hitK > 0) { x.globalAlpha = 0.55 * hitK * ringA; x.fillStyle = '#ffffff'; x.fill(); }
      x.restore();
    };
    // the head of the bar (a tiny robot riding the ring)
    const hx0 = Math.cos(head) * R.rx * 0.9, hy0 = Math.sin(head) * R.ry * 0.9;
    const hx = pcx + hx0 * Math.cos(R.tilt) - hy0 * Math.sin(R.tilt), hy = pcy + hx0 * Math.sin(R.tilt) + hy0 * Math.cos(R.tilt);
    const rider = () => { if (ringA > 0.05) { glow(x, hx, hy, 60, '#ffe066', 0.6 * ringA); x.save(); x.globalAlpha *= ringA; robot(x, hx, hy - 26, 22, { t, look: [0.5, 0], happy: t > TL.hit ? 1 : 0, bright: 1 }); x.restore(); } };
    const headBack = Math.sin(head) < 0;
    glow(x, pcx, pcy, pr * 1.8, '#4fc9ff', 0.3);
    ringBar('back'); if (headBack) rider();
    // takeaway horizon: at this scale only the polar cap is in view, so add cap latitude bands as the camera tilts up
    const pal = tk > 0 ? { ...PL.teal, bands: [...PL.teal.bands, [-0.99, -0.93, '#c6f8ff', 0.38 * tk], [-0.86, -0.79, '#2f74c9', 0.42 * tk], [-0.72, -0.68, '#7fdcff', 0.32 * tk], [-0.62, -0.54, '#2f74c9', 0.3 * tk]] } : PL.teal;
    planet(x, pcx, pcy, pr, pal, { glowA: 0, atmo: 1 });
    ringBar('front'); if (!headBack) rider();
    x.restore();

    // accuracy number + training-round bars (slide up and out for the takeaway)
    const out = seg(t, TL.take[0], TL.take[0] + 0.35), oy = -260 * eio(out);
    x.save(); x.globalAlpha = 1 - out; x.translate(0, oy);
    const inA = seg(t, TL.toC[1], TL.toC[1] + 0.3);
    flare(x, 985, 380, hitK, t);
    text(x, 'Accuracy', 985, 238, 48, '#bfe9ff', { a: inA, w: 900 });
    const pop = t > TL.hit ? 1 + 0.22 * Math.sin(seg(t, TL.hit, TL.hit + 0.35) * Math.PI) : 1;
    x.save(); x.translate(985, 372); x.scale(pop, pop); text(x, Math.round(acc) + '%', 0, 0, 150, t > TL.hit ? C.yellow : '#ffffff', { a: inA }); x.restore();
    // bars
    const nb = 10, bx0 = 850, bw = 22, gap = 7, base = 600, pr2 = seg(t, TL.acc[0], TL.acc[1]);
    for (let i = 0; i < nb; i++) {
      const u = cl(pr2 * nb - i); if (u <= 0) continue;
      const v = 61 + 36 * (1 - Math.exp(-i * 0.42)) / (1 - Math.exp(-9 * 0.42));
      const h = (v - 48) * 2.3 * back(u);
      const g = x.createLinearGradient(0, base - h, 0, base); g.addColorStop(0, '#ffe680'); g.addColorStop(1, '#ff8d3f');
      x.fillStyle = 'rgba(10,8,46,0.4)'; rr(x, bx0 + i * (bw + gap) + 3, base - h + 5, bw, h, bw / 2); x.fill();
      x.fillStyle = g; rr(x, bx0 + i * (bw + gap), base - h, bw, h, bw / 2); x.fill();
    }
    text(x, 'training rounds', 985, 632, 26, '#bfe9ff', { a: seg(t, TL.acc[0], TL.acc[0] + 0.3), w: 800 });
    text(x, 'from 61%', 985, 470, 28, '#ffb0c8', { a: seg(t, TL.toC[1], TL.toC[1] + 0.3) * (1 - seg(t, TL.hit - 0.4, TL.hit)), w: 800 });
    burst(x, 985, 372, (t - TL.hit) * 1.0, 97, 340);
    x.restore();

    // takeaway: horizon planet, characters, line
    if (t > TL.take[0] + 0.2) {
      const tb = t - TL.take[0];
      const rs = back(seg(t, 13.35, 13.75)), cs = back(seg(t, 13.5, 13.9)), ds = back(seg(t, 13.6, 14.0));
      robot(x, 640, 380 + Math.sin(t * 2) * 6 + (1 - rs) * 90, 74 * rs, { t, happy: 1, bright: 1, rewire: 1, armUp: 1 });
      cat(x, 395, 382 + Math.sin(t * 2.4) * 6 + (1 - cs) * 80, 50 * cs, { t, happy: 1, rot: -0.1 });
      dog(x, 885, 382 + Math.sin(t * 2.2 + 1) * 6 + (1 - ds) * 80, 50 * ds, { t, happy: 1, rot: 0.1 });
      const l1 = back(seg(t, TL.line1, TL.line1 + 0.4)), l2 = back(seg(t, TL.line2, TL.line2 + 0.4));
      x.save(); x.translate(640, 92); x.scale(l1, l1); text(x, 'More examples', 0, 0, 68, '#ffffff'); x.restore();
      x.save(); x.translate(640, 176); x.scale(l2, l2);
      x.font = F(900, 68); const w2 = x.measureText('better guesses').width;
      text(x, 'better guesses', 34, 0, 68, C.yellow);
      // rounded flat arrow before the line
      const ax = -w2 / 2 + 34 - 70;
      x.fillStyle = 'rgba(10,8,46,0.55)'; x.save(); x.translate(2, 5); drawArrowGlyph(x, ax, 0); x.restore();
      x.fillStyle = C.cyan; drawArrowGlyph(x, ax, 0);
      x.restore();
      if (tb > 0.5) for (let i = 0; i < 7; i++) { const q = H.rng(400 + i); spark(x, q.range(120, 1160), q.range(60, 300), q.range(8, 15) * (0.5 + 0.5 * Math.sin(t * 3 + i)), '#ffffff', seg(t, TL.line2, TL.line2 + 0.4)); }
    }
  }
  function drawArrowGlyph(x, cx, cy) {
    x.beginPath(); rr(x, cx - 42, cy - 9, 56, 18, 9); x.fill();
    x.beginPath(); x.moveTo(cx + 4, cy - 26); x.lineTo(cx + 40, cy); x.lineTo(cx + 4, cy + 26); x.closePath();
    x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = x.fillStyle; x.fill(); x.stroke();
  }

  // ================= STILL / CLIP =================
  function scene(x, W, H_, t, build) {
    const B = (a, b) => (build ? seg(t, a, b) : 1);
    const zin = build ? 1 + 1.6 * (1 - eo(seg(t, 0, 1.3))) : 1;
    sky(x, W, H_, t, { z: zin, x: t * 12 });
    // big ringed planet, lower right
    const pIn = eo(B(0.0, 1.3));
    const pcx = lerp(1500, 1070, pIn) - t * 4, pcy = lerp(820, 575, pIn);
    planet(x, pcx, pcy, 215 * (0.7 + 0.3 * pIn), PL.magenta, { glowA: 0.32 });
    planet(x, 1180 - t * 3, 120, 30 * back(B(0.6, 1.1)), PL.moon);
    planet(x, 70 + t * 2, 330, 36 * back(B(0.25, 0.8)), PL.coral, { glowA: 0.25 });

    // stream of creatures into the dome
    const RX = 640, RY = 420 + Math.sin(t * 1.8) * 8, R = 106 * back(B(0.35, 1.25), 1.2);
    const P = [[120, 760], [150, 420], [380, 250], [RX - 60, RY - 1.02 * 106 - 20]];
    arrow(x, P, eio(B(1.4, 2.1)), '#7ff0ff', 9, { dots: true, a: 0.8 });
    // data dots flowing along
    if (!build || t > 2.1) for (let i = 0; i < 6; i++) { const u = ((t * 0.32 + i / 6) % 1); const p = bez(P, u); glow(x, p[0], p[1], 18, '#9ff7ff', 0.6); x.fillStyle = '#e8fdff'; x.beginPath(); x.arc(p[0], p[1], 4, 0, TAU); x.fill(); }
    const crit = [['dog', 0.18, 46, 1.5], ['cat', 0.43, 42, 1.7], ['cat', 0.68, 34, 1.9]];
    crit.forEach(([k, u, r, at], i) => {
      const p = bez(P, u), s = back(B(at, at + 0.4)), bob = Math.sin(t * 2.4 + i * 2) * 7;
      creature(x, k, p[0] + 20, p[1] + bob, r * s, { t: t + i, rot: Math.sin(t * 1.5 + i) * 0.12, look: [0.7, -0.3], blink: blinkAt(t, i * 1.3) });
      pill(x, p[0] + 20, p[1] + bob - r - 34, k, 26, { s: back(B(at + 0.2, at + 0.5)) * (r / 46 + 0.15), ptr: true });
    });

    // the robot with its glowing brain
    const nb = build ? cl((t - 1.0) / 0.7) : 1;
    robot(x, RX, RY, R, { t, look: [-0.5, -0.5], blink: blinkAt(t, 0.4), bright: 0.3 + 0.7 * nb, brainGlow: 0.6 * nb, rewire: 0.6, armUp: 0.5 });
    pill(x, RX, RY + R * 1.95, 'AI model', 28, { s: back(B(1.8, 2.2)), bg: C.yellow });

    // guess bubble
    const bs = back(B(2.55, 2.85));
    bubble(x, 878, 228, 200, 100, 735, 330, bs, '#ffffff');
    x.save(); x.translate(878, 228); x.scale(bs, bs); text(x, 'cat!', 0, 0, 54, C.ink, { shadow: 'rgba(0,0,0,0)' }); x.restore();
    badge(x, 975, 182, 28, true, back(B(2.95, 3.25), 2.2));

    // title, top-left
    const words = [['How', '#ffffff'], ['Machines', '#ffffff'], ['Learn', C.yellow]];
    x.font = F(900, 74);
    let wx = 64;
    words.forEach(([w, c], i) => {
      const u = back(B(2.1 + i * 0.16, 2.55 + i * 0.16), 1.4), ww = x.measureText(w).width;
      const line = i < 2 ? 0 : 1, lx = i === 2 ? 64 : wx;
      x.save(); x.translate(lx + ww / 2, 112 + line * 80 + (1 - u) * 40); x.scale(u, u); text(x, w, 0, 0, 74, c); x.restore();
      if (i < 2) wx += ww + 20;
    });
    pill(x, 128, 48, 'EPISODE 7', 22, { s: back(B(2.0, 2.3)), bg: C.pink, fg: '#ffffff' });
    if (build && t > 2.95) burst(x, 975, 182, (t - 2.95) * 1.2, 5, 120);
  }

  registerStyle({
    id: 'flat-space',
    name: 'Flat-Vector Science',
    category: 'Popular Explainer Looks',
    description: 'Flat-vector science-explainer illustration: deep navy-to-violet space gradients, chunky outline-free shapes with rich multi-stop gradients, flat crescent shadows and rim highlights, soft radial glows, sparkly star fields, banded ringed planets and cute big-eyed round characters.',
    motion: 'Smooth eased motion with gentle overshoot: the camera pulls back through scales, planets drift with parallax, characters bob and pop in, glows pulse.',
    fonts: ['900 64px "Nunito"', '800 32px "Nunito"', '700 28px "Nunito"'],
    duration: 5,
    frameT: 4.6,
    readsPixels: false,
    draw(ctx, W, H_, t) { scene(ctx, W, H_, t, true); finish(ctx, W, H_, t); },

    explainerDuration: TL.D,
    explainerNote: 'Big smooth camera moves through scale: the model pulls back until a million examples become a spiral galaxy, a foreground planet sweeps across as the wipe, and the camera dives into the glowing brain dome to emerge at a planet whose ring is the accuracy bar; arrows are chunky dotted rounded curves, numbers are big rounded Nunito.',
    explainer(ctx, W, H_, t) {
      const x = ctx;
      const sw = eio(seg(t, TL.sweep[0], TL.sweep[1])), spx = lerp(W + 980, -980, sw);
      if (t < TL.sweep[0] || spx > 640) exA(x, W, H_, t);
      else if (t < TL.toC[1]) exB(x, W, H_, t);
      else exC(x, W, H_, t);
      // the foreground planet sweep (wipe)
      if (sw > 0 && sw < 1) planet(x, spx, 380 + (sw - 0.5) * 120, 880, PL.coral, { glowA: 0.4 });
      // dive into the brain: glow whiteout
      const wo = seg(t, TL.toC[0] + 0.2, TL.toC[1]) * (1 - seg(t, TL.toC[1], TL.toC[1] + 0.4));
      if (wo > 0) {
        const g = x.createRadialGradient(640, 360, 0, 640, 360, 800);
        g.addColorStop(0, H.rgba('#fff6d0', wo)); g.addColorStop(0.5, H.rgba('#8ff0ff', wo * 0.95)); g.addColorStop(1, H.rgba('#6a4cff', wo * 0.9));
        x.fillStyle = g; x.fillRect(0, 0, W, H_);
      }
      if (t > TL.titleShrink[1]) header(x, 1);
      finish(x, W, H_, t);
    },

    explainerSound(k) {
      // Soft cinematic-science palette: marimba-ish plucks (low-mid, minor), airy whooshes for scale moves,
      // a warm wonder-pad underneath, cute boops for the creatures. All times come from TL / SPAWN above.
      const D = TL.D, hz = k.hz;
      const pan = (px) => cl((px / 1280) * 2 - 1, -1, 1) * 0.6;
      // first time an eased progress over [t0,t1] reaches u
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const tt = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return tt; } return t1; };
      const backPeak = (t0, t1) => when(t0, t1, (u) => back(u), 1); // when an overshoot pop first reaches full size
      // marimba-like pluck: sine body, short 4th-partial knock, soft octave
      const pluck = (t, n, g = 1, p = 0, minor = false) => {
        const f = hz(n);
        k.tone(t, { f, dur: 0.9, gain: 0.2 * g, a: 0.003, pan: p, verb: 0.25, minor });
        k.tone(t, { f: f * 4, dur: 0.09, gain: 0.04 * g, a: 0.001, pan: p, minor });
        k.tone(t, { f: f * 2, type: 'triangle', dur: 0.32, gain: 0.045 * g, a: 0.003, pan: p, minor });
      };
      // cute soft boop: a rounded sine that bends up
      const boop = (t, f0, g = 1, p = 0, minor = true) => {
        k.tone(t, { f: [[0, f0], [0.07, f0 * 1.45], [0.16, f0 * 1.3]], dur: 0.2, gain: 0.17 * g, a: 0.008, pan: p, verb: 0.15, minor });
        k.tone(t, { f: [[0, f0 * 0.5], [0.08, f0 * 0.72]], type: 'triangle', dur: 0.14, gain: 0.06 * g, a: 0.006, pan: p, minor });
      };
      // airy whoosh: pink noise through a soft band that opens to `top` then closes
      const air = (t, dur, top, g = 1, p = 0, peak = 0.55, minor = false) =>
        k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 260], [dur * peak, top], [dur, 340]], q: 0.55, gain: 0.26 * g, a: dur * peak, pan: p, verb: 0.3, minor });
      const chord = (t, notes, g = 1, dur = 2.2) => notes.forEach((n, i) => {
        k.tone(t + i * 0.012, { f: n, type: 'triangle', dur, gain: 0.07 * g, a: 0.02, verb: 0.35, filter: 'lowpass', f2: 1800, pan: (i / (notes.length - 1) - 0.5) * 0.6 });
        k.tone(t + i * 0.012, { f: hz(n) * 1.003, dur, gain: 0.06 * g, a: 0.03, verb: 0.35 });
      });
      const shimmer = (t, notes, g = 1, p = 0) => k.withMinor(() => notes.forEach((n, i) => k.tone(t + i * 0.055, { f: n, dur: 0.7, gain: 0.07 * g, a: 0.004, verb: 0.4, pan: p + (i % 2 ? 0.25 : -0.25) })));

      // warm wonder-pad: Am7 -> Fmaj7 -> Dm7 -> Cmaj7 (resolves under the 97% and the takeaway)
      k.music('pad', 0, D, { bpm: 64, gain: 0.45, chords: [['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']] });

      // ---- 1 HOOK: the camera pulls back through the stars, the title pops word by word
      air(0, 1.4, 1500, 0.8, 0, 0.35);
      ['A3', 'C4', 'E4', 'A4'].forEach((n, i) => pluck(TL.title + i * 0.13 + 0.06, n, 0.9, (i - 1.5) * 0.2, i < 3));
      air(TL.robotIn[0], 0.9, 1100, 0.45, 0, 0.8, true); // robot flies in from far away
      boop(backPeak(TL.robotIn[0], TL.robotIn[1]), 330, 1.1, 0, false); // ...and arrives
      boop(1.3, 470, 0.8, 0.15); // "?" thought
      k.noise(TL.titleShrink[0], { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.6, 300]], q: 0.7, gain: 0.08, a: 0.2, pan: -0.3, minor: true }); // title glides to the corner

      // ---- 2 DATA: dotted stream draws, creatures boop in, the counter ticks
      const nearBoop = (tt) => SPAWN.some((ts) => Math.abs(ts + 0.05 - tt) < 0.045);
      for (let i = 1; i <= 5; i++) if (!nearBoop(when(TL.arrow[0], TL.arrow[1], eio, i / 5))) k.play('tock', when(TL.arrow[0], TL.arrow[1], eio, i / 5), { f: 520 + i * 40, gain: 0.35, pan: pan(-100 + i * 200), minor: true });
      pluck(backPeak(2.95, 3.3), 'E4', 0.9, pan(930)); // "AI model" label lands
      SPAWN.forEach((ts, i) => boop(ts + 0.05, KIND(i) === 'cat' ? 520 : 400, i < 4 ? 0.9 : 0.6, -0.55, true));
      // counter: v = 1e6 * seg^2.3 speeds up; ticks throttled under 12/s
      for (let tt = TL.count[0] + 0.12; tt < TL.count[1] - 0.04;) { const u = seg(tt, TL.count[0], TL.count[1]); if (!nearBoop(tt) && Math.abs(tt - 3.12) > 0.06) k.play('tock', tt, { f: 760 + 160 * u, gain: 0.5 + 0.15 * u, pan: -0.5, minor: true }); tt += 0.22 - 0.135 * u; }
      // zoom out to the galaxy: one long airy breath
      air(TL.zoom[0], TL.zoom[1] - TL.zoom[0] + 0.3, 1900, 1.0, 0, 0.5);
      pluck(backPeak(5.15, 5.45), 'C4', 0.8, pan(1010), true); // "1 dot = 1 example"
      // 1,000,000 lands
      pluck(TL.count[1], 'A3', 1.2, -0.4); pluck(TL.count[1] + 0.07, 'E4', 1.0, -0.3); pluck(TL.count[1] + 0.14, 'A4', 0.8, -0.2);

      // ---- transition: a giant planet sweeps past the camera
      air(TL.sweep[0], TL.sweep[1] - TL.sweep[0], 1300, 1.3, 0, 0.5);
      k.noise(TL.sweep[0] + 0.1, { dur: 0.75, color: 'brown', filter: 'lowpass', f: 260, gain: 0.32, a: 0.35, verb: 0.2 });
      k.tone(TL.sweep[0] + 0.1, { f: [[0, 70], [0.4, 58], [0.75, 46]], dur: 0.75, gain: 0.16, a: 0.3 });

      // ---- 3 GUESS -> CHECK -> ADJUST
      boop(backPeak(TL.catIn[0], TL.catIn[1]) || 6.8, 560, 0.9, pan(985)); // the cat arrives
      ['A3', 'C4', 'E4'].forEach((n, i) => pluck(6.62 + i * 0.1, n, 0.55, pan([652, 790, 515][i]), true)); // loop pills
      pluck(TL.guess, 'G4', 0.8, pan(652)); // Guess lights
      boop(backPeak(TL.bubble, TL.bubble + 0.3), 420, 1.1, pan(568), false); // "dog?"
      pluck(backPeak(TL.check, TL.check + 0.3), 'C4', 0.9, pan(985)); // "cat" tag drops on: Check
      shimmer(TL.check + 0.05, ['C5', 'E5', 'G5'], 0.6, pan(985));
      // the wrong guess: low two-note "nope" + soft thump
      k.tone(TL.wrong, { f: 'E3', type: 'triangle', dur: 0.26, gain: 0.24, hold: 0.1, filter: 'lowpass', f2: 900, pan: pan(680) });
      k.tone(TL.wrong, { f: 'E2', dur: 0.26, gain: 0.18, hold: 0.1 });
      k.tone(TL.wrong + 0.2, { f: 'C3', type: 'triangle', dur: 0.5, gain: 0.24, hold: 0.18, filter: 'lowpass', f2: 800, pan: pan(680) });
      k.tone(TL.wrong + 0.2, { f: 'C2', dur: 0.5, gain: 0.2, hold: 0.18 });
      k.play('thud', TL.wrong, { f: 95, gain: 0.3, pan: pan(680) });
      // error signal travels back to the brain (right -> left), low and soft
      k.noise(TL.err[0], { dur: TL.err[1] - TL.err[0], color: 'pink', filter: 'bandpass', f: [[0, 900], [TL.err[1] - TL.err[0], 260]], q: 1.2, gain: 0.2, a: 0.15, pan: -0.1, verb: 0.2 });
      k.tone(TL.err[0], { f: [[0, 220], [0.55, 110]], type: 'triangle', dur: 0.55, gain: 0.07, a: 0.1, filter: 'lowpass', f2: 700 });
      pluck(backPeak(TL.adjust, TL.adjust + 0.3), 'D4', 0.9, pan(170)); // Adjust + "weights"
      air(TL.zoomIn[0], 0.5, 1200, 0.5, pan(320), 0.6, true);
      // rewiring: nodes brighten one after another
      ['A3', 'C4', 'D4', 'E4', 'G4', 'A4'].forEach((n, i) => pluck(TL.rewire[0] + i * 0.1, n, 0.55, pan(320) + (i % 2 ? 0.1 : -0.1), true));
      shimmer(TL.rewire[1] - 0.05, ['E5', 'A5'], 0.5, pan(320));
      air(TL.zoomBack[0], 0.4, 1000, 0.4, 0, 0.5, true);
      boop(backPeak(TL.guess2, TL.guess2 + 0.3), 520, 1.0, pan(568), false); // "cat"
      // correct: warm rising pair + a little shimmer
      pluck(TL.right, 'C4', 1.1, pan(680)); pluck(TL.right + 0.09, 'G4', 1.0, pan(690)); pluck(TL.right + 0.18, 'C5', 0.7, pan(700));

      // ---- transition: dive into the glowing brain
      air(TL.toC[0], TL.toC[1] - TL.toC[0] + 0.1, 2200, 1.2, pan(320), 0.9);
      k.tone(TL.toC[0], { f: [[0, 110], [0.5, 330]], type: 'triangle', dur: 0.55, gain: 0.07, a: 0.45 });
      chord(TL.toC[1], ['C3', 'G3', 'E4'], 0.6, 1.4); // bloom as we emerge

      // ---- 4 ACCURACY: ring fills, number counts 61 -> 97
      for (let tt = TL.acc[0], last = 61, lastT = -1; tt < TL.acc[1]; tt += 1 / 120) {
        const v = Math.round(accAt(tt));
        if (v !== last && tt - lastT >= 1 / 11) { k.play('tock', tt, { f: 560 + (v - 61) * 9, gain: 0.5, pan: pan(985), minor: true }); last = v; lastT = tt; }
      }
      // swell into the big moment
      k.noise(TL.hit - 0.8, { dur: 0.85, color: 'pink', filter: 'bandpass', f: [[0, 250], [0.8, 1800]], q: 0.8, gain: 0.24, a: 0.78, verb: 0.3 });
      k.tone(TL.hit - 0.8, { f: [[0, 110], [0.8, 220]], type: 'triangle', dur: 0.82, gain: 0.08, a: 0.75 });
      // 97%: warm low boom + big chord + shimmer
      k.play('impact', TL.hit, { gain: 0.75 });
      chord(TL.hit, ['A2', 'E3', 'A3', 'C4', 'E4', 'B4'], 1.6, 2.4);
      shimmer(TL.hit + 0.08, ['E5', 'A5', 'C6', 'E5', 'B5'], 0.8, 0.3);

      // ---- 5 TAKEAWAY: camera tilts up to the horizon, everyone pops up, the line resolves
      air(TL.take[0], TL.take[1] - TL.take[0], 1000, 0.6, 0, 0.5, true);
      pluck(backPeak(TL.line1, TL.line1 + 0.4), 'E4', 0.8, 0);
      boop(backPeak(13.35, 13.75), 400, 0.9, 0); boop(backPeak(13.5, 13.9), 540, 0.8, pan(395)); boop(backPeak(13.6, 14.0), 440, 0.8, pan(885));
      chord(backPeak(TL.line2, TL.line2 + 0.4), ['C3', 'G3', 'C4', 'E4', 'G4', 'D5'], 1.1, 1.5);
      pluck(backPeak(TL.line2, TL.line2 + 0.4), 'C4', 1.0, 0);
    },
  });
}
```
