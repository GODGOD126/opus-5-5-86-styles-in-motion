I want an animated explainer made in the "16-Bit Pixel Odyssey" visual style (Retro Digital). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Press Start 2P
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=block">
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
Name: 16-Bit Pixel Odyssey
Family: Retro Digital
Look: A SNES-era cutscene: 320x180 hand-placed pixels blown up 4x, a strict ~40-colour palette, banded sky with checkerboard dither transitions, layered parallax and an RPG dialog box.
Motion: A SNES cutscene opening: 16-step brightness fade-in, parallax layers rise into place in whole-pixel steps, the hero walks on with a 2-frame cycle, the drone flies in, hearts pop, the window snaps open and dialog types out.
How it explains: Tells it as a SNES RPG: the question is a dialog line whose window snaps up into a quest header, a mosaic transition opens a training hall where labelled CAT/DOG cards ride a chevron conveyor into the MODEL while an EXAMPLES window counts, a wavy battle-swirl starts a turn-based fight (GUESS/CHECK/ADJUST command menu, MISS! damage pop and screen flash, red error trail, weight stat bars), and an iris wipe lands on a LEVEL UP accuracy screen.

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

REFERENCE STYLE SOURCE (styles/pixel-16bit.js; W/H_ are always 1280x720)
```js
{
  // ---------- SNES-era 16-bit pixel art: 320x180 internal buffer, scaled x4 nearest-neighbour ----------
  const LW = 320, LH = 180;
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const bay = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
  const C = (h) => H.hex(h);

  // master palette (~40 colours, like a few SNES CGRAM rows)
  const P = {
    sky: ['#140c34', '#1e1146', '#2c1658', '#43206a', '#632a78', '#8c357c', '#b8457a', '#e05c72', '#f6806a', '#ffaa6e', '#ffd28a'].map(C),
    star: C('#fff4d8'), starDim: C('#a88ac8'),
    sunHi: C('#fff6c2'), sunMid: C('#ffd27a'), sunLo: C('#ff9a5c'),
    cloud: C('#7a3478'), cloudLit: C('#e8687a'), cloudHot: C('#ffb08a'),
    mtFar: C('#6a3478'), mtFarLit: C('#b0507e'), mtNear: C('#3e1f5e'), mtNearLit: C('#7a3670'),
    bldBack: C('#2a1850'), bldBackLit: C('#4a2a6a'), bldFront: C('#170d30'), bldFrontLit: C('#38205a'),
    winY: C('#ffd27a'), winC: C('#6ef0ff'), winP: C('#ff6ab0'), winDim: C('#5a3a7a'),
    core: C('#c8fcff'), coreMid: C('#4ad8ff'), coreDeep: C('#1a78c8'),
    red: C('#ff3a4a'),
    roof: C('#0c0820'), roofTop: C('#2a1a44'), roofRim: C('#d0607a'), roofMid: C('#1a1032'),
    K: C('#0a0618'),
  };

  // hero sprite (faces right, looking at the city)
  const HERO = [
    '.....KKKK......',
    '....KHHHHK.....',
    '...KHHhHHHK....',
    '...KHHHHSSHK...',
    '...KHHHSSKSK...',
    '...KHhSSSSSK...',
    '....KHSSSSK....',
    '.....KKSSKK....',
    '....KJJJJJJK...',
    '...KJJjJJJJK...',
    '..KJJjJJJJJSK..',
    '..KJJjJJJJKSK..',
    '..KJjjJJJJKKK..',
    '...KJJJJJJK....',
    '...KcccccccK...',
    '...KPPPKPPPK...',
    '...KPPpKPPPK...',
    '...KPPpKKPPK...',
    '...KPPK.KPPK...',
    '..KBBBK.KBBBK..',
    '..KBBBBKKBBBBK.',
    '...KKKK..KKKK..',
  ];
  const HERO_WALK = HERO.slice(0, 18).concat(['..KPPK..KPPK...', '.KBBBK...KBBK..', '.KBBBBK..KBBBBK', '..KKKK....KKKK.']);
  const HERO_PAL = { K: '#0a0618', H: '#ff5a8a', h: '#b02a6a', S: '#ffc8a0', J: '#3a6ad8', j: '#22408a', c: '#ffd27a', P: '#3a2a5a', p: '#22183a', B: '#b8456a' };
  // little drone companion
  const DRONE = [
    '...KKKKK...',
    '..KWWWWWK..',
    '.KWwwwwwWK.',
    'KWwKKKKKwWK',
    'KWKEEeEEKWK',
    'KWKEeeeEKWK',
    'KwwKKKKKwwK',
    '.KwwwwwwwK.',
    '..KKKKKKK..',
    '...K...K...',
  ];
  const DRONE_PAL = { K: '#0a0618', W: '#e8eef8', w: '#9aa8c8', E: '#4ad8ff', e: '#c8fcff' };

  // ================= EXPLAINER: "How does AI learn?" as a 16-bit RPG cutscene + battle =================
  const PX_CAT = ['K.........K', 'KK.......KK', 'KOK.....KOK', 'KOOKKKKKOOK', 'KOOOOOOOOOK', 'KOOKOOOKOOK', 'KOOOOPOOOOK', 'KWOOKOKOOWK', '.KOOOOOOOK.', '..KKKKKKK..'];
  const PX_DOG = ['..KKKKKKK..', '.KTTTTTTTK.', 'KBKTTTTTKBK', 'KBKTKTKTKBK', 'KBKTTTTTKBK', 'KBKTTKTTKBK', '.KKTTTTTKK.', '..KTTPTTK..', '...KTTTK...', '....KKK....'];
  const PX_PET_PAL = { K: '#0a0618', O: '#ff9a4a', W: '#fff4d8', P: '#ff6ab0', T: '#e8c890', B: '#8a5a3a' };
  let PX_NZ = null; // explainer backdrop noise (same seed as the hero's mountains), built once
  const PX_ARROW = ['KK.....','KYK....', 'KYYK...', 'KYYYK..', 'KYYYYK.', 'KYYYK..', 'KYYK...', 'KYK....', 'KK.....'];

  function pixExplainer(ctx, W, H_, t) {
    const T = Math.floor(t * 12) / 12; // 12 fps game tick for logic
    const prog = (a, b) => H.clamp((T - a) / (b - a));
    const buf = new Uint8ClampedArray(LW * LH * 4);
    const put = (x, y, c) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= LW || y >= LH) return; const i = (y * LW + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255; };
    const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c); };
    const dput = (x, y, c1, c2, a) => put(x, y, a > bay(x, y) ? c2 : c1);
    const sprite = (rows, pal, ox, oy, flip, scale = 1) => {
      const cp = {}; for (const k in pal) cp[k] = C(pal[k]);
      rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '.') return; const xx = flip ? row.length - 1 - i : i; for (let a = 0; a < scale; a++) for (let b = 0; b < scale; b++) put(ox + xx * scale + a, oy + j * scale + b, cp[ch]); }));
    };
    const tc = H.layer(LW, 24), tx = tc.getContext('2d', { willReadFrequently: true });
    const text = (str, x, y, col, shadow, size = 8, outline = null) => {
      tx.clearRect(0, 0, LW, 24); tx.font = size + 'px "Press Start 2P"'; tx.textBaseline = 'top'; tx.fillStyle = '#fff'; tx.fillText(str, 0, 0);
      const w = Math.min(LW, Math.ceil(tx.measureText(str).width) + 2), hh = size + 4, d = tx.getImageData(0, 0, w, hh).data;
      if (outline) for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) put(x + i + ox, y + j + oy, outline);
      if (shadow) for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) put(x + i + 1, y + j + 1, shadow);
      for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) put(x + i, y + j, col);
      return w - 2;
    };
    const white = C('#f8f8ff'), gold = C('#ffd27a'), ink = C('#0a0618'), grey = C('#9aa0c8'), red = C('#ff3a4a'), green = C('#6aff8a'), cyan = C('#6ef0ff');
    const WB = ['#4060d0', '#3450bc', '#2a42a6', '#22358e', '#1a2a78', '#142064'].map(C);
    const win = (x0, y0, w, h) => { // SNES RPG window
      for (let y = y0; y < y0 + h; y++) { const f = ((y - y0) / h) * (WB.length - 1), i = Math.min(WB.length - 2, Math.floor(f)), a = H.smooth(0.7, 1, f - i); for (let x = x0; x < x0 + w; x++) { if ((x === x0 || x === x0 + w - 1) && (y === y0 || y === y0 + h - 1)) continue; dput(x, y, WB[i], WB[i + 1], a); } }
      for (let x = x0 + 1; x < x0 + w - 1; x++) { put(x, y0, white); put(x, y0 + h - 1, white); put(x, y0 + 1, grey); put(x, y0 + h - 2, grey); put(x, y0 - 1, ink); put(x, y0 + h, ink); }
      for (let y = y0 + 1; y < y0 + h - 1; y++) { put(x0, y, white); put(x0 + w - 1, y, white); put(x0 + 1, y, grey); put(x0 + w - 2, y, grey); put(x0 - 1, y, ink); put(x0 + w, y, ink); }
    };
    const bubble = (x0, y0, w, h, tailX) => { rect(x0, y0, w, h, white); for (let x = x0; x < x0 + w; x++) { put(x, y0 - 1, ink); put(x, y0 + h, ink); } for (let y = y0; y < y0 + h; y++) { put(x0 - 1, y, ink); put(x0 + w, y, ink); } for (let k = 0; k < 4; k++) { for (let i = -k; i <= 0; i++) put(tailX + i + k, y0 + h + k, k === 3 ? ink : white); put(tailX + k + 1, y0 + h + k, ink); put(tailX - 1, y0 + h + k, ink); } };
    const hand = (x, y) => sprite(['.KKKK...', 'KWWWWKKK', 'KWWWWWWK', 'KWWWWKKK', '.KKKK...'], { K: '#0a0618', W: '#f8f8ff' }, x, y);
    const fmt = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const sky = (c0, c1, hz) => { for (let y = 0; y < LH; y++) { const f = Math.pow(H.clamp(y / hz), 1.2) * 5, i = Math.min(4, Math.floor(f)); const cA = H.mix(c0, c1, i / 5).map(Math.round), cB = H.mix(c0, c1, (i + 1) / 5).map(Math.round); for (let x = 0; x < LW; x++) dput(x, y, cA, cB, H.smooth(0.6, 1, f - i)); } };
    const stars = (n, seed) => { const r = H.rng(seed); for (let s = 0; s < n; s++) { const x = r.int(0, LW - 1), y = r.int(0, 90), ph = r() * 6.28; if (Math.sin(T * 3 + ph) > -0.3) put(x, y, y < 40 ? P.star : P.starDim); } };
    const mixc = (a, b, k) => H.mix(a, b, k).map(Math.round);
    // ---- backdrop kit shared with the hero still: rim-lit fbm mountains, lit-from-below cloud streaks, striped sun, lit skyline
    const nz = PX_NZ || (PX_NZ = H.makeNoise(77));
    const mountains = (base, amp, freq, seed, scroll, col, lit, sunX, yMax = LH) => {
      const hgt = [];
      for (let x = -1; x <= LW + 1; x++) { const u = (x + scroll) * freq; hgt.push(Math.round(base - amp * (Math.abs(nz.fbm2(u, seed, 3)) * 1.6 + 0.35 * nz.n2(u * 3.1, seed + 9)))); }
      for (let x = 0; x < LW; x++) {
        const top = hgt[x + 1], facing = hgt[x + 2] < hgt[x + 1] ? 0 : 1;
        for (let y = Math.max(0, top); y < yMax; y++) { const d = y - top; if (d < 2 && (facing || Math.abs(x - sunX) < 40)) put(x, y, lit); else if (d < 5 && facing) dput(x, y, col, lit, 0.5 - d * 0.1); else put(x, y, col); }
      }
    };
    const cloud = (cx, cy, w, h, cDark = P.cloud, cLit = P.cloudLit, cHot = P.cloudHot) => {
      for (let y = cy - h; y <= cy + h; y++) for (let x = Math.round(cx - w); x <= cx + w; x++) {
        const dx = (x - cx) / w, dy = (y - cy) / h, lump = 1 + 0.25 * Math.sin(x * 0.35 + cx);
        if (dx * dx + (dy * dy) / lump > 1) continue;
        put(x, y, dy > 0.55 ? cHot : dy > 0.15 ? cLit : cDark);
      }
    };
    const sun = (sx, sy, sr) => {
      for (let y = sy - sr; y <= sy + sr; y++) {
        const ry = (y - (sy - sr)) / (2 * sr);
        if (y > sy - 4) { const k = y - (sy - 4), gap = 1 + Math.floor(k / 9); if ((k % 7) < gap) continue; }
        for (let x = sx - sr; x <= sx + sr; x++) {
          if ((x - sx) ** 2 + (y - sy) ** 2 > sr * sr) continue;
          put(x, y, ry < 0.45 ? (ry < 0.3 ? P.sunHi : (0.3 + 0.15 * bay(x, y) > ry ? P.sunHi : P.sunMid)) : (ry < 0.55 ? P.sunMid : (ry - 0.55) * 3 > bay(x, y) ? P.sunLo : P.sunMid));
        }
      }
    };
    const skyline = (seed, base, minH, maxH, col, lit, winA, scroll, winOn = 0.3) => {
      const r = H.rng(seed); let bx = -24 - Math.round(scroll);
      while (bx < LW) {
        const w = r.int(9, 18), h = r.int(minH, maxH), top = base - h, rr = H.rng(seed * 31 + w * 7 + h);
        rect(bx, top, w, h, col); rect(bx, top, w, 1, lit); for (let y = top; y < base; y++) put(bx + w - 1, y, lit);
        if (rr.chance(0.35)) { const ah = rr.int(2, 6); for (let k = 1; k <= ah; k++) put(bx + (w >> 1), top - k, col); if (Math.sin(T * 4 + w) > 0) put(bx + (w >> 1), top - ah - 1, P.red); }
        const wc = rr.pick(winA);
        for (let wy = top + 2; wy < base - 1; wy += 2) for (let wx = bx + 1; wx < bx + w - 2; wx += 2) if (rr() < winOn) put(wx, wy, wc);
        bx += w + r.int(0, 3);
      }
    };

    // ---------------- scenes ----------------
    const sceneRoof = () => {
      sky(H.hex('#140c34'), H.hex('#e05c72'), 130); stars(50, 3);
      // dusk backdrop from the hero still: striped sun on the horizon, lit cloud streaks, two rim-lit mountain layers
      sun(266, 112, 24);
      const cd = T * 2;
      cloud(((40 + cd) % 380) - 30, 36, 30, 2); cloud(((250 + cd * 1.1) % 380) - 30, 26, 22, 2); cloud(((150 + cd * 0.7) % 380) - 30, 70, 38, 2); cloud(((300 + cd * 0.9) % 380) - 30, 84, 26, 2);
      mountains(112, 26, 0.018, 3.3, T * 2, P.mtFar, P.mtFarLit, 266, 128);
      mountains(122, 16, 0.03, 8.1, T * 4, P.mtNear, P.mtNearLit, 266, 128);
      // horizon haze band where the city meets the mountains
      for (let y = 106; y < 122; y++) { const a = 0.4 * (1 - Math.abs(y - 114) / 8); for (let x = 0; x < LW; x++) if (a > bay(x, y)) { const i = (y * LW + x) * 4; put(x, y, mixc([buf[i], buf[i + 1], buf[i + 2]], P.cloudLit, 0.35)); } }
      // skyline + rooftop
      const r = H.rng(9); let bx = 0; while (bx < LW) { const w = r.int(10, 22), h = r.int(16, 50); rect(bx, 140 - h, w, h + 40, P.bldBack); rect(bx, 140 - h, w, 1, P.bldBackLit); for (let y = 140 - h; y < 128; y++) put(bx + w - 1, y, P.bldBackLit); for (let wy = 140 - h + 3; wy < 136; wy += 3) for (let wx = bx + 2; wx < bx + w - 2; wx += 2) if (r() < 0.35) put(wx, wy, r() < 0.5 ? P.winY : P.winC); bx += w + 1; }
      rect(0, 128, LW, 52, P.roof); rect(0, 128, LW, 1, P.roofRim); rect(0, 129, LW, 1, P.roofTop);
      for (let y = 130; y < LH; y++) for (let x = 0; x < LW; x++) if (((x + y) & 7) === 0 && y % 2) put(x, y, P.roofMid);
      for (let x = 0; x < LW; x++) { put(x, 119, P.K); put(x, 123, P.K); if (x % 12 === 4) for (let y = 119; y < 128; y++) put(x, y, P.K); if (x % 3 === 0) put(x, 118, P.roofRim); }
      for (let x = 113; x < 140; x++) put(x, 129, P.K); // hero contact shadow
      sprite(HERO, HERO_PAL, 112, 128 - HERO.length * 2, false, 2);
      sprite(DRONE, DRONE_PAL, 160, 58 + Math.round(Math.sin(T * 3) * 2), false, 3);
      if (T > 0.3) { const k = Math.floor(T * 6) % 3; for (let i = 0; i < 3; i++) if (i <= k) { put(196 + i * 6, 54 - i * 4, gold); put(197 + i * 6, 53 - i * 4, gold); } }
    };
    const sceneHall = () => { // training hall: data conveyor into the MODEL
      sky(H.hex('#0c0a2a'), H.hex('#3a1e6a'), 110);
      // tall hall windows looking out on the dusk city (dimmed hero backdrop, slow parallax)
      const WIN = [0, 1, 2, 3].map((i) => [10 + i * 78, 64]), WY0 = 22, WY1 = 94;
      for (let y = WY0; y < WY1; y++) { const f = Math.pow((y - WY0) / (WY1 - WY0), 1.1) * 7 + 1, i = Math.min(8, Math.floor(f)); for (let x = 0; x < LW; x++) dput(x, y, P.sky[i], P.sky[i + 1], H.smooth(0.55, 1, f - i)); }
      cloud(((60 + T * 2) % 380) - 30, 40, 30, 2); cloud(((230 + T * 1.5) % 380) - 30, 56, 36, 2);
      mountains(88, 22, 0.02, 3.3, T * 2, P.mtFar, P.mtFarLit, 300, WY1);
      mountains(93, 10, 0.034, 8.1, T * 3, P.mtNear, P.mtNearLit, 300, WY1);
      skyline(77, 96, 6, 24, P.bldBack, P.bldBackLit, [P.winY, P.winY, P.winC, P.winP], T * 4);
      // wall, window frames, mullions, sills
      const wallA = C('#1c1244'), wallB = C('#120a30'), frame = C('#2e1e5e'), frameLit = C('#6a4aa8');
      const winCol = new Uint8Array(LW); WIN.forEach(([x0, w]) => winCol.fill(1, x0, x0 + w));
      for (let y = 0; y < 110; y++) for (let x = 0; x < LW; x++) {
        const inWin = y >= WY0 && y < WY1 && winCol[x];
        if (!inWin) dput(x, y, wallA, wallB, y / 110 * 0.8 + (((x + 39) % 78) < 4 ? 0.3 : 0));
      }
      WIN.forEach(([x0, w]) => {
        for (let x = x0 - 2; x < x0 + w + 2; x++) { put(x, WY0 - 2, frameLit); put(x, WY0 - 1, frame); put(x, WY1, frameLit); put(x, WY1 + 1, frame); put(x, WY1 + 2, P.K); }
        for (let y = WY0 - 1; y < WY1; y++) { put(x0 - 1, y, frame); put(x0 + w, y, frameLit); put(x0 + (w >> 1), y, frame); put(x0 + (w >> 1) + 1, y, P.K); }
        for (let x = x0; x < x0 + w; x++) { put(x, 40, frame); put(x, 41, P.K); }
        // glass glint: two diagonal light streaks
        for (let k = 0; k < 10; k++) { if (0.45 > bay(x0 + 4 + k, WY0 + 14 - k)) put(x0 + 4 + k, WY0 + 14 - k, C('#c8a8e8')); if (0.3 > bay(x0 + 8 + k, WY0 + 16 - k)) put(x0 + 8 + k, WY0 + 16 - k, C('#a888d0')); }
      });
      // baseboard
      rect(0, 104, LW, 6, C('#0e0826')); rect(0, 104, LW, 1, frame);
      // floor: perspective grid (spacing grows toward the viewer), window light pooled on the gloss, fade into the horizon
      const fl = C('#22145a'), flLine = C('#5a3a9a'), glow = C('#4a2a8a'), pool = C('#34206e');
      for (let y = 110; y < LH; y++) {
        const dz = 48 / (y - 104), dz1 = 48 / (y + 1 - 104), hLine = Math.floor(dz) !== Math.floor(dz1), lineA = H.clamp((y - 112) / 22), hz = H.clamp(1 - (y - 110) / 16);
        const spread = 1 + (y - 110) * 0.012, poolA = (1 - (y - 110) / 40) * 0.75;
        const pools = y < 150 ? WIN.map(([x0, w]) => [160 + (x0 + w / 2 - 160) * spread, w * 0.42 * spread]) : [];
        for (let x = 0; x < LW; x++) {
          let c = hz > bay(x, y) ? glow : fl;
          if (poolA > bay(x, y) && pools.some(([cx, hw]) => Math.abs(x - cx) < hw)) c = pool;
          if (hLine && lineA > bay(x, y)) c = flLine;
          put(x, y, c);
        }
      }
      for (let k = -12; k <= 12; k++) { for (let y = 110; y < LH; y++) { const x = Math.round(160 + k * (y - 104) * 0.9); if (H.clamp((y - 108) / 18) > bay(x, y)) put(x, y, flLine); } }
      for (let x = 0; x < 236; x++) put(x, 110, P.K); // belt shadow on the floor
      // conveyor belt
      rect(0, 100, 236, 8, C('#2a2a4a')); for (let x = 0; x < 236; x++) { put(x, 100, C('#8a8ab8')); put(x, 107, P.K); if ((x + Math.floor(T * 24)) % 8 === 0) for (let y = 101; y < 107; y++) put(x, y, C('#4a4a7a')); }
      // MODEL: the drone, 3x, on a pedestal, label landing under it
      const absorb = Math.floor((T - 2.95) / 0.33) >= 0 && ((T - 2.95) % 0.33) < 0.09 && T < 5.9;
      rect(238, 108, 64, 6, C('#5a3a9a')); rect(238, 108, 64, 1, C('#a88ac8'));
      sprite(DRONE, absorb ? { K: '#0a0618', W: '#ffffff', w: '#ffffff', E: '#ffffff', e: '#ffffff' } : DRONE_PAL, 254, 70 + Math.round(Math.sin(T * 3) * 1), false, 3);
      win(244, 118, 52, 14); text('MODEL', 251, 121, white, ink);
      // training-data label + chevrons flowing along the belt
      win(54, 48, 112, 14); text('TRAINING DATA', 59, 51, gold, ink);
      for (let k = 0; k < 6; k++) { const x = ((k * 40 + Math.floor(T * 48)) % 240); if (x < 228) sprite(PX_ARROW, { K: '#0a0618', Y: '#ffd27a' }, x, 110, false); }
      // labelled example cards riding the belt (pixel-stepped)
      for (let i = 0; i < 12; i++) {
        const t0 = 2.6 + i * 0.27, k = (T - t0) / 1.1; if (k < 0 || k >= 1) continue;
        const x = Math.round(-30 + k * 268), isCat = i % 3 !== 1, y = 74;
        rect(x, y, 26, 24, white); rect(x, y, 26, 1, ink); rect(x, y + 23, 26, 1, ink); rect(x, y, 1, 24, ink); rect(x + 25, y, 1, 24, ink);
        sprite(isCat ? PX_CAT : PX_DOG, PX_PET_PAL, x + 2, y + 2, false, 2);
        rect(x, y + 25, 26, 10, isCat ? C('#ffd27a') : C('#ff6ab0')); text(isCat ? 'CAT' : 'DOG', x + 1, y + 26, ink, null);
      }
      // examples counter window
      win(8, 134, 196, 42); text('EXAMPLES SEEN', 16, 139, cyan, ink);
      text(fmt(1e6 * Math.pow(prog(2.9, 5.6), 2.2)), 16, 153, white, ink, 16);
    };
    const sceneBattle = () => {
      // backdrop
      sky(H.hex('#1a0c3a'), H.hex('#b8457a'), 100); stars(24, 5);
      // JRPG battle background: lit cloud streaks, far + near rim-lit ranges, rolling dithered hills, banded field
      cloud(((20 + T * 3) % 380) - 30, 30, 34, 2); cloud(((200 + T * 2) % 380) - 30, 58, 28, 2); cloud(((120 + T * 2.5) % 380) - 30, 74, 40, 2);
      mountains(92, 30, 0.016, 5.7, T * 1.5, P.mtFar, P.mtFarLit, 160, 120);
      mountains(102, 16, 0.028, 2.2, T * 3, P.mtNear, P.mtNearLit, 160, 120);
      const hillA = C('#2e1650'), hillB = C('#43206a'), hillLit = C('#9a4a86'), field = [C('#3e1f5e'), C('#4c2468')];
      const hTop = []; for (let x = 0; x < LW; x++) hTop.push(Math.round(106 + 4 * nz.n2((x + T * 6) * 0.025, 4.4) + 2 * Math.sin((x + T * 6) * 0.07)));
      for (let x = 0; x < LW; x++) for (let y = hTop[x]; y < 114; y++) { const d = y - hTop[x]; put(x, y, d < 1 ? hillLit : d < 3 ? (0.5 > bay(x, y) ? hillLit : hillB) : (((y + 1) >> 1) % 3 === 0 && 0.5 > bay(x, y)) ? hillB : hillA); }
      for (let y = 114; y < 136; y++) {
        const dz = 30 / (y - 100) + T * 1.2, band = Math.floor(dz) & 1, fr = dz - Math.floor(dz);
        for (let x = 0; x < LW; x++) { const c0 = field[band], c1 = field[band ^ 1]; put(x, y, fr > 0.82 && (fr - 0.82) * 5.5 > bay(x, y) ? c1 : c0); }
      }
      for (let x = 0; x < LW; x++) put(x, 114, C('#24103e'));
      const phase = T < 7.4 ? 0 : T < 8.3 ? 1 : T < 9.4 ? 2 : 0;
      // enemy: the new picture (a cat), framed; it shakes when hit
      const shake = (T > 7.45 && T < 7.8) ? (Math.floor(T * 24) % 2 ? 2 : -2) : 0;
      const ex = 40 + shake, ey = 40;
      rect(ex - 4, ey - 4, 52, 48, white); rect(ex - 5, ey - 5, 54, 1, ink); rect(ex - 5, ey + 44, 54, 1, ink); rect(ex - 5, ey - 5, 1, 50, ink); rect(ex + 48, ey - 5, 1, 50, ink);
      sprite(PX_CAT, PX_PET_PAL, ex + 2, ey + 1, false, 4);
      win(ex - 8, ey + 48, 66, 14); text('NEW PIC', ex - 3, ey + 51, white, ink);
      // party: the model (drone) with its name tag
      const dx = 228, dy = 52 + Math.round(Math.sin(T * 3) * 2);
      sprite(DRONE, DRONE_PAL, dx, dy, true, 3);
      win(dx - 4, 88, 52, 14); text('MODEL', dx + 3, 91, white, ink);
      // command window (the loop) + cursor
      win(4, 120, 96, 56);
      ['GUESS', 'CHECK', 'ADJUST'].forEach((nm, i) => text(nm, 26, 128 + i * 15, i === phase ? gold : white, ink));
      hand(10 + (Math.floor(T * 6) % 2), 129 + phase * 15);
      // weights window: three stat bars that change during ADJUST
      win(104, 120, 212, 56); text('WEIGHTS', 112, 125, cyan, ink);
      const adj = Math.floor(prog(8.6, 9.2) * 4) / 4;
      [[0.3, 0.75], [0.8, 0.45], [0.55, 0.9]].forEach(([a, b], i) => {
        const v = H.lerp(a, b, adj), y = 138 + i * 12, flashBar = adj > 0 && adj < 1 && Math.floor(T * 12) % 2 === 0;
        text('W' + (i + 1), 112, y - 1, white, ink);
        rect(136, y, 120, 6, ink); rect(137, y + 1, Math.round(118 * v), 4, flashBar ? white : H.mix(C('#4ad8ff'), C('#6aff8a'), v).map(Math.round));
      });
      // GUESS 1: "DOG?" bubble from the model
      if (T > 6.5 && T < 9.4) { bubble(dx - 76, 22, 74, 24, dx - 8); text('DOG?', dx - 71, 26, ink, null, 16); }
      // CHECK: MISS! damage pop + message
      if (T > 7.4 && T < 8.4) {
        const k = T - 7.4, by = Math.round(20 - Math.max(0, 8 - k * 40) + (k < 0.2 ? -Math.sin(k * 15) * 6 : 0));
        text('MISS!', ex + 2, ey + by - 10, red, C('#5a0814'), 16, ink);
        win(102, 100, 116, 16); text("IT'S A CAT!", 116, 104, white, ink);
      }
      // ADJUST: error travels back from the picture to the model (dotted red pixels)
      if (T > 8.3 && T < 9.4) {
        const k = prog(8.3, 8.8), x0 = ex + 50, x1 = dx - 4;
        for (let x = x0; x < x0 + (x1 - x0) * k; x += 3) { const y = Math.round(70 + Math.sin((x - x0) / (x1 - x0) * Math.PI) * -18); rect(x, y, 2, 2, red); }
        if (k > 0.3) text('ERROR', 132, 44, red, C('#5a0814'), 8, ink);
      }
      // GUESS 2: correct
      if (T > 9.5) {
        bubble(dx - 76, 22, 74, 24, dx - 8); text('CAT!', dx - 71, 26, C('#1a7a3a'), null, 16);
        if (T > 9.75) { const k = T - 9.75; text('HIT!', ex + 6, ey + Math.round(10 - Math.min(8, k * 40)), green, C('#0a4a2a'), 16, ink); }
      }
      // round counter (loop is repeated)
      text('ROUND ' + String(1 + Math.floor(Math.max(0, T - 6.2) * 2.5)).padStart(3, '0'), 232, 108, gold, ink);
    };
    const sceneLevel = () => {
      // night falls over the city: hero sky gradient with a dithered horizon glow, far ranges and a lit skyline
      sky(H.hex('#0c0a2a'), H.hex('#e05c72'), 180); stars(40, 8);
      cloud(((80 + T * 2) % 380) - 30, 136, 40, 2); cloud(((260 + T * 1.6) % 380) - 30, 128, 30, 2);
      mountains(152, 22, 0.018, 3.3, T * 2, P.mtFar, P.mtFarLit, 240);
      mountains(162, 14, 0.03, 8.1, T * 3, P.mtNear, P.mtNearLit, 240);
      skyline(404, LH, 10, 34, P.bldBack, P.bldBackLit, [P.winY, P.winY, P.winC, P.winP], T * 5, 0.35);
      for (let y = 146; y < 162; y++) { const a = 0.36 * (1 - Math.abs(y - 154) / 8); for (let x = 0; x < LW; x++) if (a > bay(x, y)) { const i = (y * LW + x) * 4; if (buf[i] + buf[i + 1] + buf[i + 2] < 260) put(x, y, mixc([buf[i], buf[i + 1], buf[i + 2]], P.cloudLit, 0.35)); } }
      win(10, 20, 300, 106);
      text('ACCURACY', 22, 32, cyan, ink);
      const p = prog(10.95, 12.4), val = Math.round(61 + 36 * H.ease.out(p));
      text(val + '%', 22, 46, white, ink, 16);
      text('61% > ' + val + '%', 22, 68, gold, ink);
      // EXP-style bar
      text('EXP', 22, 84, white, ink); rect(52, 84, 104, 8, ink); rect(53, 85, Math.round(102 * H.ease.out(p)), 6, H.mix(C('#4ad8ff'), C('#6aff8a'), p).map(Math.round));
      // bar chart of rounds (stepped growth)
      const ox = 176, oy = 112;
      for (let y = 30; y <= oy; y++) put(ox, y, white); for (let x = ox; x < ox + 124; x++) put(x, oy, white);
      text('ROUNDS', 238, 114, grey, ink);
      for (let i = 0; i < 10; i++) {
        const g = H.clamp(p * 10 - i); if (g <= 0) break;
        const h = Math.round(((97 - 36 * Math.exp(-i / 3)) / 100) * 78 * g);
        rect(ox + 4 + i * 12, oy - h, 9, h, H.mix(C('#4a2a8a'), C('#6aff8a'), i / 9).map(Math.round)); rect(ox + 4 + i * 12, oy - h, 9, 1, white);
      }
      // emphasis: LEVEL UP! + sparkles around 97%
      if (p >= 1) {
        if (Math.floor(T * 6) % 2 === 0 || T > 13.0) text('LEVEL UP!', 76, 50, gold, ink);
        for (let k = 0; k < 6; k++) { const a = k * 1.05 + T * 3, rr = 22 + (Math.floor(T * 12) % 3) * 2, sx = 44 + Math.cos(a) * rr * 1.4, sy = 52 + Math.sin(a) * rr * 0.4; put(sx, sy, white); put(sx - 1, sy, gold); put(sx + 1, sy, gold); put(sx, sy - 1, gold); put(sx, sy + 1, gold); }
      }
      // takeaway dialog with portrait
      if (T > 13.0) {
        const op = Math.floor(prog(13.0, 13.25) * 4) / 4, bh = Math.max(4, Math.round(48 * op));
        win(6, 153 - Math.round(bh / 2), 308, bh);
        if (op >= 1) {
          sprite(DRONE, DRONE_PAL, 12, 142, false, 2);
          text('MORE EXAMPLES', 42, 135, white, ink, 16); sprite(PX_ARROW, { K: '#0a0618', Y: '#ffd27a' }, 256, 138, false);
          text('BETTER GUESSES!', 42, 155, gold, ink, 16);
        }
      }
    };

    // ---------------- timeline with SNES transitions ----------------
    let scene = T < 2.3 ? sceneRoof : T < 6.2 ? sceneHall : T < 10.6 ? sceneBattle : sceneLevel;
    scene();
    // BEAT 1 dialog: question typed, then the window slides up (stepped) into the quest header
    if (T < 2.3) {
      const up = prog(1.7, 2.1), y0 = Math.round(H.lerp(128, 2, Math.floor(up * 6) / 6)), h0 = Math.round(H.lerp(48, 14, Math.floor(up * 6) / 6));
      win(6, y0, up > 0 ? Math.round(H.lerp(308, 160, Math.floor(up * 6) / 6)) : 308, h0);
      if (up === 0) {
        sprite(DRONE, DRONE_PAL, 14, 141, false, 2);
        const q1 = 'HOW DOES AI', q2 = 'LEARN?';
        text(q1.slice(0, Math.floor(prog(0.2, 0.9) * q1.length)), 44, y0 + 7, white, ink, 16);
        text(q2.slice(0, Math.floor(prog(0.9, 1.25) * q2.length)), 44, y0 + 27, gold, ink, 16);
      } else text('HOW DOES AI LEARN?', 12, y0 + 3, white, ink);
    } else { win(6, 2, 160, 14); text('HOW DOES AI LEARN?', 12, 5, white, ink); }

    // mosaic (roof -> hall), wavy battle-swirl (hall -> battle), iris (battle -> level)
    const mosaic = (n) => { if (n <= 1) return; for (let by = 0; by < LH; by += n) for (let bx = 0; bx < LW; bx += n) { const sx = Math.min(LW - 1, bx + (n >> 1)), sy = Math.min(LH - 1, by + (n >> 1)), si = (sy * LW + sx) * 4; for (let y = by; y < Math.min(LH, by + n); y++) for (let x = bx; x < Math.min(LW, bx + n); x++) { const i = (y * LW + x) * 4; buf[i] = buf[si]; buf[i + 1] = buf[si + 1]; buf[i + 2] = buf[si + 2]; } } };
    if (T >= 2.0 && T < 2.6) mosaic(Math.round(16 - Math.abs(T - 2.3) / 0.3 * 15));
    if (T >= 5.9 && T < 6.5) {
      const k = 1 - Math.abs(T - 6.2) / 0.3, src = buf.slice();
      for (let y = 0; y < LH; y++) { const off = Math.round(Math.sin(y * 0.25 + T * 30) * k * 40); for (let x = 0; x < LW; x++) { const sx = ((x + off) % LW + LW) % LW, si = (y * LW + sx) * 4, i = (y * LW + x) * 4; for (let c = 0; c < 3; c++) buf[i + c] = src[si + c] + (255 - src[si + c]) * k * 0.6; } }
    }
    if (T >= 10.3 && T < 10.9) {
      const k = Math.abs(T - 10.6) / 0.3, R = Math.round(k * 200), cx = T < 10.6 ? 244 : 160, cy = T < 10.6 ? 66 : 80;
      for (let y = 0; y < LH; y++) for (let x = 0; x < LW; x++) if ((x - cx) ** 2 + (y - cy) ** 2 > R * R) { const i = (y * LW + x) * 4; buf[i] = buf[i + 1] = buf[i + 2] = 0; }
    }
    // screen flash on the MISS (emphasis)
    if (T >= 7.4 && T < 7.5) for (let i = 0; i < buf.length; i += 4) { buf[i] = Math.min(255, buf[i] + 120); buf[i + 1] = Math.min(255, buf[i + 1] + 60); buf[i + 2] = Math.min(255, buf[i + 2] + 60); }

    const lc = H.layer(LW, LH), lx = lc.getContext('2d');
    lx.putImageData(new ImageData(buf, LW, LH), 0, 0);
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(lc, 0, 0, W, H_); ctx.restore();
  }

  // ================= EXPLAINER SOUND: SNES chip palette =================
  // The picture runs on a 12 fps game tick (T = floor(t*12)/12), so the cues below walk the same ticks and
  // re-evaluate the same expressions as pixExplainer: every sound starts on the tick its event first shows.
  // Voiceover mode (k.vo): music drops out (kit), and minor plays plus the custom chip details inside k.withMinor play
  // quieter, so the transitions, MISS!, HIT!, LEVEL UP and the takeaway cadence stay on top of the narration.
  function pixSound(k) {
    const FPS = 12, END = 14.5, V = k.vo;
    const prog = (T, a, b) => H.clamp((T - a) / (b - a));
    const sq = (t, f, dur, gain, pan) => k.tone(t, { f, type: 'square', dur, gain, a: 0.001, hold: dur * 0.6, pan });
    const tri = (t, f, dur, gain, pan) => k.tone(t, { f, type: 'triangle', dur, gain, a: 0.002, hold: dur * 0.6, pan });
    const crash = (t, dur, gain) => k.noise(t, { dur, filter: 'lowpass', f: 3200, gain, rate: 0.25, a: 0.001 }); // NES-style noise channel

    // ---- music: field theme / battle theme / level screen; each one stops for the transition that ends it
    k.music('chip', 0, 2.3, { bpm: 240 / 2.3, gain: 0.3, chords: [['C4', 'E4', 'G4', 'B4']] }); // softer under the typed question
    k.music('chip', 2.3, 5.9, { bpm: 240 / 2.3, gain: 0.5, chords: [['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4']] }); // bar = mosaic cut at 2.3
    k.music('chip', 6.2, 10.3, { bpm: 150, gain: 0.5, chords: [['A3', 'C4', 'E4', 'A4'], ['F3', 'A3', 'C4', 'F4'], ['C4', 'E4', 'G4', 'C5']] }); // bar 3 = back to GUESS at 9.4
    k.music('chip', 10.917, 12.4, { bpm: 160, gain: 0.45, chords: [['F3', 'A3', 'C4', 'E4']] });
    k.music('chip', 13.25, END, { bpm: 160, gain: 0.4, chords: [['C4', 'E4', 'G4', 'C5']] });

    // ---- per-tick state machine (mirrors pixExplainer)
    const s = { q1: 0, q2: 0, up: 0, absorb: false, absorbN: 0, cnt: 0, lastTick: -1, phase: 0, adj: 0, acc: 61, op: -1 };
    const Q1 = 'HOW DOES AI', Q2 = 'LEARN?';
    const NOTES_UP = ['C6', 'E6', 'G6', 'C7'];
    for (let f = 0; f <= END * FPS; f++) {
      const T = f / FPS;
      // beat 1: dialog types out (kit chip text blips, one per printed glyph)
      const q1 = Math.floor(prog(T, 0.2, 0.9) * Q1.length), q2 = Math.floor(prog(T, 0.9, 1.25) * Q2.length);
      if (q1 > s.q1) k.play('text', T, { n: q1 - s.q1, rate: 0.035, gain: 1.1, minor: true });
      if (q2 > s.q2) k.play('text', T, { n: q2 - s.q2, rate: 0.035, gain: 1.1, minor: true });
      s.q1 = q1; s.q2 = q2;
      // window slides up into the quest header in 6 steps
      const up = Math.floor(prog(T, 1.7, 2.1) * 6);
      if (up > s.up) k.withMinor(() => tri(T, ['G4', 'A4', 'C5', 'D5', 'E5', 'G5'][up - 1], 0.05, 0.12));
      s.up = up;
      // mosaic (2.0-2.6): one square step per tick, pitch falls as the blocks grow and rises as they shrink
      if (T >= 2.0 && T < 2.6) {
        const n = Math.round(16 - Math.abs(T - 2.3) / 0.3 * 15);
        if (n > 1) sq(T, 1500 / Math.sqrt(n), 0.075, 0.038);
      }
      // hall: the MODEL flashes as it absorbs a card -> rising chip gulp, a little higher each time
      const absorb = Math.floor((T - 2.95) / 0.33) >= 0 && ((T - 2.95) % 0.33) < 0.09 && T < 5.9;
      if (absorb && !s.absorb) { const b = 500 * Math.pow(2, s.absorbN / 12); k.tone(T, { f: [[0, b], [0.07, b * 2]], type: 'square', dur: 0.09, gain: 0.045, a: 0.001, hold: 0.05, pan: 0.5, minor: true }); s.absorbN += 2; }
      s.absorb = absorb;
      // EXAMPLES SEEN counter (accelerating): tally ticks get denser as it speeds up, coin when it lands on 1,000,000
      if (T >= 2.9 && T <= 5.6 + 1e-6) {
        const v = Math.floor(1e6 * Math.pow(prog(T, 2.9, 5.6), 2.2)), gap = T < 3.8 ? 3 : T < 4.7 ? 2 : 1;
        if (v > s.cnt && f - s.lastTick >= gap) { k.withMinor(() => sq(T, 1100 + 1300 * prog(T, 2.9, 5.6), 0.022, 0.03, -0.4)); s.lastTick = f; }
        s.cnt = v;
      } else if (T > 5.6 && s.cnt < 1e6) { k.play('coin', T, { gain: 0.9, pan: -0.3 }); s.cnt = 1e6; }
      // battle command cursor
      const phase = T < 6.2 ? -1 : T < 7.4 ? 0 : T < 8.3 ? 1 : T < 9.4 ? 2 : 0;
      if (phase !== s.phase && (phase === 2 || (phase === 0 && T > 9))) k.play('blip', T, { f: 'A5', dur: 0.04, gain: 0.9, pan: -0.5, minor: true }); // CHECK move is covered by the MISS hit
      s.phase = phase;
      // ADJUST: weight bars change in 4 stepped levels -> stat-up blips
      const adj = Math.floor(prog(T, 8.6, 9.2) * 4);
      if (adj > s.adj) k.withMinor(() => sq(T, NOTES_UP[adj - 1], adj === 4 ? 0.14 : 0.06, 0.05, 0.1));
      s.adj = adj;
      // LEVEL screen: accuracy 61 -> 97 (ease-out), one tick per tick-of-change so it slows as it settles
      if (T >= 10.95) {
        const acc = Math.round(61 + 36 * H.ease.out(prog(T, 10.95, 12.4)));
        if (acc > s.acc) k.withMinor(() => sq(T, 520 + (acc - 61) * 22, 0.03, 0.04));
        s.acc = acc;
      }
      // takeaway window opens in steps, then the text lands
      if (T >= 13.0) {
        const op = Math.floor(prog(T, 13.0, 13.25) * 4);
        if (op > s.op && op < 4) k.withMinor(() => tri(T, ['C5', 'E5', 'G5'][Math.min(2, op)], 0.05, 0.12));
        s.op = op;
      }
    }

    // ---- one-off cues (first tick where the condition is true)
    k.play('select', 0.02, { gain: 0.7, minor: true });                                  // dialog window on screen
    // wavy battle swirl 5.9-6.5 (peak 6.2): warbling square + grainy noise sweep, crash on the cut
    for (let f = Math.ceil(5.9 * FPS); f < 6.5 * FPS; f++) { const T = f / FPS, kk = 1 - Math.abs(T - 6.2) / 0.3; sq(T, 300 + kk * 900 * (f % 2 ? 1 : 1.26), 0.07, 0.045 + kk * 0.02); }
    k.noise(5.9, { dur: 0.6, filter: 'bandpass', f: [[0, 400], [0.3, 3000], [0.6, 500]], q: 1.4, gain: 0.14, rate: 0.3, a: 0.28 });
    crash(6.25, 0.3, 0.12);
    k.play('text', 79 / FPS, { n: 4, rate: 0.045, gain: 1.1, pan: 0.4 }); // T > 6.5: "DOG?" bubble from the model
    // CHECK: MISS! + screen flash + shake, then the "wrong" buzz under IT'S A CAT!
    const MISS = 89 / FPS;                                                    // T >= 7.4
    k.play('hurt', MISS, { gain: 1.4, pan: -0.4 }); crash(MISS, 0.35, 0.22);
    k.play('error', MISS + 0.3, { gain: 0.9 });
    // ADJUST: red error trail travels picture -> model (8.3-8.8), panned left to right, falling
    k.withMinor(() => { for (let f = 100; f <= 105; f++) { const T = f / FPS, kk = prog(T, 8.3, 8.8); sq(T, 880 * Math.pow(2, -kk), 0.05, 0.04, -0.5 + kk); } });
    k.withMinor(() => sq(102 / FPS, 'A2', 0.14, 0.06, 0));                                      // "ERROR" label (k > 0.3)
    // GUESS 2: "CAT!" bubble, then HIT! lands (the correction)
    k.play('text', 115 / FPS, { n: 4, rate: 0.045, gain: 1.1, pan: 0.4 }); // T > 9.5
    const HIT = 118 / FPS;                                                    // T > 9.75
    crash(HIT, 0.18, 0.16);
    ['G5', 'C6', 'E6'].forEach((n, i) => sq(HIT + i * 0.05, n, 0.06, 0.06, -0.3));
    sq(HIT + 0.15, 'G6', 0.25, 0.05, -0.3); tri(HIT, 'C4', 0.3, 0.12);
    // iris: closes on the model (square sweep down), opens on the level screen (sweep up)
    k.tone(124 / FPS, { f: [[0, 1400], [0.27, 160]], type: 'square', dur: 0.28, gain: 0.045, a: 0.002, hold: 0.2, pan: 0.4 });
    k.tone(128 / FPS, { f: [[0, 160], [0.24, 1400]], type: 'square', dur: 0.25, gain: 0.045, a: 0.002, hold: 0.18 });
    // LEVEL UP! at 97% (the biggest moment): power-up run, held major chord, sparkles
    const LVL = 149 / FPS;                                                    // p >= 1 at T >= 12.4
    k.play('powerup', LVL, { gain: 1.4 });
    ['C6', 'E6', 'G6'].forEach((n) => sq(LVL + 0.32, n, 0.6, 0.035)); tri(LVL + 0.32, 'C4', 0.6, 0.22);
    k.play('sparkle', LVL + 0.12, { n: 7, gain: 0.8 });
    // takeaway lands: resolving chip cadence (B -> C over a C bass)
    const TAKE = 159 / FPS;                                                   // window fully open at T >= 13.25
    sq(TAKE, 'B5', 0.08, 0.055); sq(TAKE + 0.08, 'C6', 0.7, 0.055); sq(TAKE + 0.08, 'G5', 0.7, 0.03); tri(TAKE, 'C4', 0.8, 0.22);
  }

  registerStyle({
    id: 'pixel-16bit',
    name: '16-Bit Pixel Odyssey',
    category: 'Retro Digital',
    description: 'A SNES-era cutscene: 320x180 hand-placed pixels blown up 4x, a strict ~40-colour palette, banded sky with checkerboard dither transitions, layered parallax and an RPG dialog box.',
    motion: 'A SNES cutscene opening: 16-step brightness fade-in, parallax layers rise into place in whole-pixel steps, the hero walks on with a 2-frame cycle, the drone flies in, hearts pop, the window snaps open and dialog types out.',
    fonts: ['8px "Press Start 2P"', '16px "Press Start 2P"'],
    duration: 6,
    frameT: 5.8,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'Tells it as a SNES RPG: the question is a dialog line whose window snaps up into a quest header, a mosaic transition opens a training hall where labelled CAT/DOG cards ride a chevron conveyor into the MODEL while an EXAMPLES window counts, a wavy battle-swirl starts a turn-based fight (GUESS/CHECK/ADJUST command menu, MISS! damage pop and screen flash, red error trail, weight stat bars), and an iris wipe lands on a LEVEL UP accuracy screen.',
    explainer(ctx, W, H_, t) { pixExplainer(ctx, W, H_, t); },
    explainerSound(k) { pixSound(k); },
    draw(ctx, W, H_, t) {
      // game timing: build/sprite logic runs on a 12 fps tick, positions snap to the 320x180 grid
      const T = Math.floor(t * 12) / 12;
      const prog = (a, b) => H.clamp((T - a) / (b - a));
      const rise = (a, b, dist) => Math.round((1 - H.ease.out(prog(a, b))) * dist);
      const buf = new Uint8ClampedArray(LW * LH * 4);
      let OY = 0; // per-layer vertical offset (layers rise into place)
      const put = (x, y, c) => {
        x |= 0; y = (y + OY) | 0;
        if (x < 0 || y < 0 || x >= LW || y >= LH) return;
        const i = (y * LW + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255;
      };
      const get = (x, y) => { y += OY; if (y < 0 || y >= LH) return [0, 0, 0]; const i = (y * LW + x) * 4; return [buf[i], buf[i + 1], buf[i + 2]]; };
      const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c); };
      // dithered blend between two palette colours (a = amount of c2)
      const dput = (x, y, c1, c2, a) => put(x, y, a > bay(x, y) ? c2 : c1);
      const sprite = (rows, pal, ox, oy, flip, scale = 1) => {
        const cp = {}; for (const k in pal) cp[k] = C(pal[k]);
        rows.forEach((row, j) => [...row].forEach((ch, i) => {
          if (ch === '.') return;
          const xx = flip ? row.length - 1 - i : i;
          for (let a = 0; a < scale; a++) for (let b = 0; b < scale; b++) put(ox + xx * scale + a, oy + j * scale + b, cp[ch]);
        }));
      };
      const r = H.rng(1601), nz = H.makeNoise(77);

      // ---------- 1. SKY: solid bands with narrow checker-dithered seams ----------
      const horizon = 118;
      for (let y = 0; y < LH; y++) {
        const f = Math.pow(H.clamp(y / horizon), 1.25) * (P.sky.length - 1);
        const i = Math.min(P.sky.length - 2, Math.floor(f)), fr = f - i;
        const a = H.smooth(0.55, 1.0, fr);
        for (let x = 0; x < LW; x++) dput(x, y, P.sky[i], P.sky[i + 1], a);
      }
      // stars (only in top bands), some twinkle with t
      for (let s = 0; s < 70; s++) {
        const x = r.int(0, LW - 1), y = r.int(0, 46), ph = r() * 6.28, big = r.chance(0.12);
        const tw = Math.sin(t * 3 + ph) > -0.2;
        if (!tw) continue;
        put(x, y, y < 24 ? P.star : P.starDim);
        if (big) { put(x - 1, y, P.starDim); put(x + 1, y, P.starDim); put(x, y - 1, P.starDim); put(x, y + 1, P.starDim); }
      }

      // ---------- 2. SETTING SUN with retro stripe cut-outs ----------
      const sx = 236, sy = 92 + rise(0, 1.8, 34), sr = 30;
      for (let y = sy - sr; y <= sy + sr; y++) {
        const ry = (y - (sy - sr)) / (2 * sr);
        // stripe gaps grow towards the bottom
        if (y > sy - 4) { const k = y - (sy - 4); const period = 7, gap = 1 + Math.floor(k / 9); if ((k % period) < gap) continue; }
        for (let x = sx - sr; x <= sx + sr; x++) {
          if ((x - sx) ** 2 + (y - sy) ** 2 > sr * sr) continue;
          const c = ry < 0.45 ? (ry < 0.3 ? P.sunHi : (0.3 + 0.15 * bay(x, y) > ry ? P.sunHi : P.sunMid)) : (ry < 0.55 ? P.sunMid : (ry - 0.55) * 3 > bay(x, y) ? P.sunLo : P.sunMid);
          put(x, y, c);
        }
      }

      // ---------- 3. CLOUD STREAKS (lit from below by the sun) ----------
      const cloud = (cx, cy, w, h) => {
        for (let y = cy - h; y <= cy + h; y++) for (let x = cx - w; x <= cx + w; x++) {
          const dx = (x - cx) / w, dy = (y - cy) / h;
          const lump = 1 + 0.25 * Math.sin(x * 0.35 + cx);
          if (dx * dx + (dy * dy) / lump > 1) continue;
          const below = dy > 0.15, rim = dy > 0.55;
          put(x, y, rim ? P.cloudHot : below ? P.cloudLit : P.cloud);
        }
      };
      const cdrift = t * 2;
      cloud(((60 + cdrift) % 380) - 30, 40, 34, 3);
      cloud(((140 + cdrift * 0.8) % 380) - 30, 54, 22, 2);
      cloud(((300 + cdrift * 1.1) % 380) - 30, 30, 26, 2);
      cloud(((210 + cdrift * 0.6) % 380) - 30, 66, 40, 2);

      // ---------- 4. MOUNTAINS (two parallax layers, rim-lit toward the sun) ----------
      const mountains = (base, amp, freq, seed, scroll, col, lit) => {
        const hgt = [];
        for (let x = -1; x <= LW; x++) {
          const u = (x + scroll) * freq;
          const v = Math.abs(nz.fbm2(u, seed, 3)) * 1.6 + 0.35 * nz.n2(u * 3.1, seed + 9);
          hgt.push(Math.round(base - amp * v));
        }
        for (let x = 0; x < LW; x++) {
          const top = hgt[x + 1], facing = hgt[x + 2] < hgt[x + 1] ? 0 : 1; // slopes rising rightwards face the sun
          for (let y = top; y < LH; y++) {
            const d = y - top;
            if (d < 2 && (facing || x > sx - 40)) put(x, y, lit);
            else if (d < 5 && facing) dput(x, y, col, lit, 0.5 - d * 0.1);
            else put(x, y, col);
          }
        }
      };
      OY = rise(0.5, 1.2, 50); mountains(108, 30, 0.018, 3.3, 0, P.mtFar, P.mtFarLit);
      OY = rise(0.7, 1.4, 50); mountains(118, 20, 0.03, 8.1, 0, P.mtNear, P.mtNearLit);
      OY = rise(1.0, 1.6, 64);

      // ---------- 5. FUTURE CITY: back row, mega-tower AI core, front row ----------
      const cityBase = 150;
      const building = (x, w, h, col, colLit, winChance, layerSeed, front) => {
        const top = cityBase - h;
        rect(x, top, w, h, col);
        for (let y = top; y < cityBase; y++) put(x + w - 1, y, colLit); // sun-side edge
        rect(x, top, w, 1, colLit);
        const rr = H.rng(layerSeed);
        if (rr.chance(0.4)) { // antenna with blinking light
          const ah = rr.int(3, 9); for (let k = 1; k <= ah; k++) put(x + (w >> 1), top - k, col);
          if (Math.sin(t * 4 + layerSeed) > 0) put(x + (w >> 1), top - ah - 1, P.red);
        }
        const wc = rr.pick([P.winY, P.winY, P.winC, P.winP]);
        const sp = front ? 3 : 2;
        for (let wy = top + 2; wy < cityBase - 2; wy += sp) for (let wx = x + 1; wx < x + w - 2; wx += 2) {
          const on = rr() < winChance && Math.sin(t * 0.7 + wx * 13.1 + wy * 7.7) > -0.85;
          if (on) put(wx, wy, wc); else if (front && rr.chance(0.3)) put(wx, wy, P.winDim);
        }
      };
      // back row
      const sc1 = 0;
      let bx = -((sc1) % 23) - 10;
      const rb = H.rng(404);
      while (bx < LW) { const w = rb.int(9, 18), h = rb.int(18, 44); building(bx, w, h, P.bldBack, P.bldBackLit, 0.35, bx * 7 + 11 + sc1 * 0, false); bx += w + rb.int(0, 3); }

      // mega-tower: the AI core (focal point)
      OY = rise(1.3, 2.0, 132);
      const coreOn = T >= 2.08 && !(T >= 2.17 && T < 2.25) && !(T >= 2.33 && T < 2.38);
      const tx = 168, tTop = 34;
      for (let y = tTop; y < cityBase; y++) {
        const k = (y - tTop) / (cityBase - tTop);
        const hw = Math.round(3 + 12 * Math.pow(k, 1.7));
        for (let x = tx - hw; x <= tx + hw; x++) {
          const edge = x >= tx + hw - 1;
          put(x, y, edge ? P.bldFrontLit : (x === tx ? P.bldBackLit : P.bldFront));
        }
        if (y > 60 && y % 4 === 0) for (let x = tx - hw + 2; x < tx + hw - 1; x += 3) if (Math.sin(x * 3.1 + y) > 0.1) put(x, y, P.winC);
      }
      for (let k = 1; k < 14; k++) put(tx, tTop - k, P.bldFrontLit);
      put(tx, tTop - 14, Math.sin(t * 5) > 0 ? P.red : P.bldFrontLit);
      // core ring + glowing orb with dithered halo
      const cy0 = 52, pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
      if (coreOn) {
      const haloR = 20 + pulse * 3;
      for (let y = cy0 - 26; y <= cy0 + 26; y++) for (let x = tx - 26; x <= tx + 26; x++) {
        const d = Math.hypot(x - tx, y - cy0);
        if (d > haloR || d < 7) continue;
        const a = d < 12 ? 0.5 : d < 16 ? 0.25 : 0.0625;
        if (a > bay(x, y)) { const c = get(x, y); put(x, y, H.mix(c, P.coreMid, 0.5).map(Math.round)); }
      }
      for (let y = cy0 - 7; y <= cy0 + 7; y++) for (let x = tx - 7; x <= tx + 7; x++) {
        const d = Math.hypot(x - tx + 1.5, y - cy0 + 1.5);
        if (Math.hypot(x - tx, y - cy0) > 7.2) continue;
        put(x, y, d < 3 ? P.core : d < 6 ? (d - 3) / 3 > bay(x, y) ? P.coreMid : P.core : P.coreMid);
      }
      for (let y = cy0 - 7; y <= cy0 + 7; y++) for (let x = tx - 7; x <= tx + 7; x++) {
        const d = Math.hypot(x - tx, y - cy0); if (d > 6.2 && d <= 7.2) put(x, y, P.coreDeep);
      }
      // orbit ring (ellipse) - back half then front half
      const ringA = t * 1.2;
      for (let s = 0; s < 220; s++) {
        const a = (s / 220) * Math.PI * 2;
        const x = tx + Math.cos(a) * 15, y = cy0 + Math.sin(a) * 4;
        const front = Math.sin(a) > 0;
        if (!front && Math.hypot(x - tx, y - cy0) < 7.2) continue;
        const lit = Math.cos(a - ringA) > 0.6;
        put(x, y, lit ? P.core : front ? P.coreMid : P.coreDeep);
      }
      } else { // unlit core shell
        for (let y = cy0 - 7; y <= cy0 + 7; y++) for (let x = tx - 7; x <= tx + 7; x++) { const d = Math.hypot(x - tx, y - cy0); if (d <= 7.2) put(x, y, d > 6.2 ? P.K : P.coreDeep); }
      }
      // front row
      OY = rise(1.6, 2.1, 44);
      const sc2 = 0;
      let fx = -(sc2 % 31) - 12;
      const rf = H.rng(808);
      while (fx < LW) {
        const w = rf.int(12, 24), h = rf.int(10, 30);
        if (Math.abs(fx + w / 2 - tx) > 22) building(fx, w, h, P.bldFront, P.bldFrontLit, 0.45, fx * 3 + 5, true);
        fx += w + rf.int(1, 4);
      }
      OY = 0;
      // street-level glow below the skyline
      const streetY = cityBase + rise(1.0, 1.6, 40);
      for (let y = streetY; y < LH; y++) for (let x = 0; x < LW; x++) dput(x, y, P.bldFront, C('#3a1e50'), 0.5 - (y - streetY) * 0.04);
      // horizon haze band where city meets mountains (atmospheric depth)
      for (let y = 112; y < 128; y++) for (let x = 0; x < LW; x++) { const a = 0.32 * (1 - Math.abs(y - 120) / 8); if (a > bay(x, y)) { const c = get(x, y); if (c[0] + c[1] + c[2] < 260) put(x, y, H.mix(c, P.cloudLit, 0.35).map(Math.round)); } }
      // flying cars with light trails
      for (let k = 0; k < (T > 2.1 ? 6 : 0); k++) {
        const lane = 74 + k * 9 + (k % 2) * 3, dir = k % 2 ? -1 : 1, sp = 18 + k * 7;
        let x = ((k * 97 + t * sp * dir) % 360 + 360) % 360 - 20;
        const y = lane;
        const head = k % 3 === 0 ? P.winP : P.winY;
        for (let q = 1; q < 10; q++) if ((10 - q) / 10 > bay(Math.round(x - dir * q), y) + 0.1) put(x - dir * q, y, q < 4 ? head : P.cloudLit);
        put(x, y, P.star); put(x + dir, y, head);
      }

      // ---------- 6. FOREGROUND ROOFTOP (fastest parallax: static frame of reference) ----------
      const roofY = 128;
      rect(0, roofY, 178, LH - roofY, P.roof);
      rect(0, roofY, 177, 1, P.roofRim);
      rect(0, roofY + 1, 177, 1, P.roofTop);
      for (let y = roofY; y < LH; y++) put(177, y, P.roofTop);
      for (let y = roofY + 2; y < LH; y++) for (let x = 0; x < 176; x++) if (((x + y) & 7) === 0 && y % 2) put(x, y, P.roofMid);
      // railing
      for (let x = 0; x < 176; x++) put(x, roofY - 9, P.K);
      for (let x = 0; x < 176; x++) if ((x % 12) === 4 || x === 175) for (let y = roofY - 9; y < roofY; y++) put(x, y, P.K);
      for (let x = 0; x < 176; x++) put(x, roofY - 5, P.K);
      for (let x = 0; x < 176; x++) if (x % 3 === 0) put(x, roofY - 10, P.roofRim);
      // rooftop HVAC unit + satellite dish (silhouettes w/ rim light)
      rect(14, roofY - 18, 26, 18, P.roof);
      rect(14, roofY - 18, 26, 1, P.roofRim);
      for (let y = roofY - 17; y < roofY; y++) put(39, y, P.roofTop);
      for (let x = 17; x < 37; x += 3) for (let y = roofY - 15; y < roofY - 4; y++) put(x, y, P.roofMid);
      // radio mast with guy wires and a blinking beacon
      for (let y = roofY - 46; y < roofY; y++) { put(56, y, P.roof); if (y % 4 === 0) { put(55, y, P.roof); put(57, y, P.roof); } }
      for (let k = 0; k < 30; k++) { put(56 - k * 0.5, roofY - 40 + k * 1.33, P.roof); put(56 + k * 0.5, roofY - 40 + k * 1.33, P.roof); }
      put(57, roofY - 46, P.roofRim);
      if (Math.sin(t * 3) > 0) { put(56, roofY - 47, P.red); put(55, roofY - 47, C('#ff8a8a')); }
      // water tank on stilts
      const TK = 66; rect(TK, roofY - 30, 18, 16, P.roof);
      for (let y = roofY - 30; y < roofY - 14; y++) { put(TK + 17, y, P.roofTop); if (y % 4 === 0) for (let x = TK; x < TK + 17; x++) put(x, y, P.roofMid); }
      for (let x = TK - 1; x < TK + 19; x++) put(x, roofY - 31, P.roofRim);
      for (let x = TK + 1; x < TK + 17; x++) { const top = roofY - 32 - Math.round(3 * Math.sin(((x - TK - 1) / 16) * Math.PI)); for (let y = top; y < roofY - 31; y++) put(x, y, P.roof); put(x, top, P.roofTop); }
      for (let y = roofY - 14; y < roofY; y++) { put(TK + 2, y, P.roof); put(TK + 15, y, P.roof); put(TK + 2 + (y - roofY + 14), y, P.roof); }

      // ---------- 7. CHARACTERS ----------
      const walkP = prog(2.2, 3.0), walking = walkP > 0 && walkP < 1;
      const heroX = Math.round(-16 + 114 * walkP), heroY = roofY - HERO.length - (walking && Math.floor(T * 8) % 2 ? 1 : 0);
      // scarf: 2-frame flap
      const flap = Math.floor(T * 6) % 2;
      const scarf = flap ? [[-1, 0], [-2, 0], [-3, 1], [-4, 1], [-5, 1], [-6, 2], [-7, 2]] : [[-1, 0], [-2, 1], [-3, 1], [-4, 0], [-5, 0], [-6, 1], [-7, 0]];
      scarf.forEach(([dx, dy], i) => { put(heroX + 5 + dx, heroY + 8 + dy, P.winP); put(heroX + 5 + dx, heroY + 9 + dy, i > 3 ? P.cloudLit : P.winP); put(heroX + 5 + dx, heroY + 10 + dy, P.K); });
      sprite(walking && Math.floor(T * 8) % 2 ? HERO_WALK : HERO, HERO_PAL, heroX, heroY, false);
      // rim light on hero's sun-facing side
      for (let j = 0; j < HERO.length; j++) { const row = HERO[j]; const last = row.search(/[^.][.]*$/); if (last > 0 && row[last - 1] && row[last - 1] !== '.' && row[last - 1] !== 'K') put(heroX + last - 1, heroY + j, C('#ffb08a')); }
      // drone bobbing
      const dY = Math.round(roofY - 40 + Math.sin(T * 3) * 2) - rise(2.5, 3.1, 30);
      const dX = 120 + rise(2.5, 3.1, 210);
      sprite(DRONE, DRONE_PAL, dX, dY, false);
      // drone thruster
      if (Math.floor(T * 10) % 2) { put(dX + 2, dY + 10, P.winC); put(dX + 8, dY + 10, P.winC); } else { put(dX + 2, dY + 11, P.coreMid); put(dX + 8, dY + 11, P.coreMid); }
      // shadow under hero
      for (let x = Math.max(0, heroX + 2); x < heroX + 13; x++) put(x, roofY + 1, P.K);

      // ---------- 8. TEXT RASTERISER (threshold so glyphs are pure pixels) ----------
      const tc = H.layer(LW, LH); const tx2 = tc.getContext('2d', { willReadFrequently: true });
      const text = (str, x, y, col, shadow, font = '8px "Press Start 2P"') => {
        tx2.clearRect(0, 0, LW, LH); tx2.font = font; tx2.textBaseline = 'top'; tx2.fillStyle = '#fff'; tx2.fillText(str, 0, 0);
        const w = Math.ceil(tx2.measureText(str).width) + 2, d = tx2.getImageData(0, 0, w, 12).data;
        for (let j = 0; j < 12; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) {
          if (shadow) put(x + i + 1, y + j + 1, shadow);
        }
        for (let j = 0; j < 12; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) put(x + i, y + j, col);
        return w;
      };

      // ---------- 9. HUD ----------
      const white = C('#f8f8ff'), gold = C('#ffd27a'), ink = C('#0a0618');
      // hearts
      const HEART = ['.KK.KK.', 'KRRKRRK', 'KRWRRRK', 'KRRRRRK', '.KRRRK.', '..KRK..', '...K...'];
      const nHearts = H.clamp(Math.floor((T - 2.9) / 0.12) + 1, 0, 4);
      for (let h = 0; h < nHearts; h++) sprite(HEART, { K: '#0a0618', R: h < 3 ? '#ff3a5a' : '#4a2a5a', W: h < 3 ? '#ffd0e0' : '#6a4a7a' }, 8 + h * 9, 7, false);
      if (T >= 2.9) {
        text('SCORE', 236, 6, white, ink);
        text(String(Math.floor(4096 * H.ease.out(prog(2.9, 3.6)) + Math.max(0, T - 3.6) * 64)).padStart(6, '0'), 236, 15, gold, ink);
      }

      // ---------- 10. DIALOG BOX (SNES RPG window) ----------
      const openP = Math.floor(prog(3.1, 3.4) * 4) / 4;
      if (openP > 0) {
      const bx0 = 6, bh = openP < 1 ? Math.max(4, Math.round(38 * openP)) : 38, by0 = 155 - (bh >> 1), bw = 308;
      const WB = ['#4060d0', '#3450bc', '#2a42a6', '#22358e', '#1a2a78', '#142064'].map(C);
      for (let y = by0; y < by0 + bh; y++) {
        const f = ((y - by0) / bh) * (WB.length - 1), i = Math.min(WB.length - 2, Math.floor(f)), a = H.smooth(0.7, 1, f - i);
        for (let x = bx0; x < bx0 + bw; x++) {
          const inCorner = (x === bx0 || x === bx0 + bw - 1) && (y === by0 || y === by0 + bh - 1);
          if (inCorner) continue;
          dput(x, y, WB[i], WB[i + 1], a);
        }
      }
      // borders: dark outer, white, grey inner
      const grey = C('#9aa0c8');
      for (let x = bx0 + 1; x < bx0 + bw - 1; x++) { put(x, by0, white); put(x, by0 + bh - 1, white); put(x, by0 + 1, grey); put(x, by0 + bh - 2, grey); put(x, by0 - 1, ink); put(x, by0 + bh, ink); }
      for (let y = by0 + 1; y < by0 + bh - 1; y++) { put(bx0, y, white); put(bx0 + bw - 1, y, white); put(bx0 + 1, y, grey); put(bx0 + bw - 2, y, grey); put(bx0 - 1, y, ink); put(bx0 + bw, y, ink); }
      put(bx0 + 1, by0 + 1, white); put(bx0 + bw - 2, by0 + 1, white); put(bx0 + 1, by0 + bh - 2, white); put(bx0 + bw - 2, by0 + bh - 2, white);
      if (openP >= 1) {
      // portrait frame with drone at 2x
      const px0 = bx0 + 6, py0 = by0 + 5;
      rect(px0, py0, 28, 28, C('#0a1040'));
      for (let i = 0; i < 28; i++) { put(px0 + i, py0, grey); put(px0 + i, py0 + 27, white); put(px0, py0 + i, grey); put(px0 + 27, py0 + i, white); }
      sprite(DRONE, DRONE_PAL, px0 + 3, py0 + 4, false, 2);
      // name + typed line
      text('NOVA', px0 + 34, by0 + 6, gold, ink);
      const line = 'THE CITY AI IS AWAKE.';
      const shown = Math.min(line.length, Math.floor(prog(3.45, 4.3) * line.length));
      text(line.slice(0, shown), px0 + 34, by0 + 20, white, ink);
      // bouncing next-arrow
      if (shown >= line.length) {
        const ay = by0 + bh - 9 + (Math.floor(t * 4) % 2);
        const ARW = ['KKKKKKK', 'KWWWWWK', '.KWWWK.', '..KWK..', '...K...'];
        sprite(ARW, { K: '#0a0618', W: '#ffd27a' }, bx0 + bw - 14, ay, false);
      }
      } // window fully open
      } // window visible

      // SNES master-brightness fade-in (16 discrete levels)
      const lvl = Math.min(15, Math.floor((T / 0.8) * 15));
      if (lvl < 15) for (let i = 0; i < buf.length; i += 4) { buf[i] = buf[i] * lvl / 15; buf[i + 1] = buf[i + 1] * lvl / 15; buf[i + 2] = buf[i + 2] * lvl / 15; }

      // ---------- 11. blit low-res buffer, scale x4 with nearest neighbour ----------
      const lc = H.layer(LW, LH), lx = lc.getContext('2d');
      lx.putImageData(new ImageData(buf, LW, LH), 0, 0);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(lc, 0, 0, W, H_);
      ctx.restore();
    },
  });
}
```
