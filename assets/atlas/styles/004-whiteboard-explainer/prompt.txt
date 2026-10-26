I want an animated explainer made in the "Whiteboard Explainer" visual style (Hand-Drawn). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Kalam, Permanent Marker
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Permanent+Marker&display=block">
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
Name: Whiteboard Explainer
Family: Hand-Drawn
Look: Dry-erase marker on a glossy whiteboard: streaky chisel-tip strokes with pooled edges, wobbly double-traced boxes and arrows, a ghost of the last erased lesson, and a soft ceiling-light sheen.
Motion: Each stroke draws on in sequence like a hand drawing it live, with labels written letter by letter and the sheen drifting slightly as the camera breathes.
How it explains: A marker in hand draws the diagram while the camera follows it across one big board; the felt eraser wipes the loop away (leaving ghost residue) to make room for the accuracy chart, and numbers are re-scrawled in marker.

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

REFERENCE STYLE SOURCE (styles/whiteboard.js; W/H_ are always 1280x720)
```js
// Whiteboard — dry-erase marker explainer on a glossy board.
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
  const wobble = (pts, nz, seed, amp = 1.6, freq = 0.011) => {
    const N = normals(pts); let L = 0;
    return pts.map((p, i) => {
      if (i) L += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      const o = nz.n2(L * freq + seed * 1.37, seed * 0.71) * amp + nz.n2(L * freq * 6 + seed, seed + 3.3) * amp * 0.25;
      return [p[0] + N[i][0] * o, p[1] + N[i][1] * o];
    });
  };
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, grow = 0) => {
    const n = Math.max(10, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 2.5)), out = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, a = a0 + (a1 - a0) * u, g = 1 + grow * u;
      out.push([cx + Math.cos(a) * rx * g, cy + Math.sin(a) * ry * g]);
    }
    return out;
  };
  const bez = (p0, p1, p2, p3) => {
    const out = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60, m = 1 - t;
      out.push([m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
        m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]);
    }
    return out;
  };
  const tracePath = (ctx, P) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); };

  // A dry-erase marker stroke: lighter wet center, darker pooled edges, streaky dry lines.
  const BOARD = [236, 240, 239];
  const MN = H.makeNoise(4242);
  let TIP = null; // where the marker tip currently is (during the build)
  const marker = (ctx, pts, col, w, seed, prog = 1) => {
    if (prog <= 0) return;
    if (prog < 1) { const q = pts[Math.max(1, Math.ceil(pts.length * prog)) - 1]; TIP = [q[0], q[1], col]; }
    const P = prog < 1 ? pts.slice(0, Math.max(2, Math.ceil(pts.length * prog))) : pts;
    const r = H.rng(seed), rgb = H.hex(col), N = normals(P);
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = H.rgba(rgb, 0.3); ctx.lineWidth = w; tracePath(ctx, P); ctx.stroke();
    ctx.lineCap = 'butt';
    // body ink density drifts along the stroke (wetter / drier patches)
    const CH = 10;
    for (let i = 0; i < P.length - 1; i += CH) {
      const a = 0.16 + 0.22 * (0.5 + 0.5 * MN.n2(i * 0.03 + seed * 3.1, seed * 0.37));
      ctx.strokeStyle = H.rgba(rgb, a); ctx.lineWidth = w * 0.96;
      ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]);
      for (let j = i + 1; j <= Math.min(P.length - 1, i + CH); j++) ctx.lineTo(P[j][0], P[j][1]);
      ctx.stroke();
    }
    const n = 7;
    for (let k = 0; k < n; k++) {
      const u = k / (n - 1) - 0.5, edge = Math.abs(u) * 2;
      const a = (0.08 + 0.5 * Math.pow(edge, 2.2)) * (0.65 + r() * 0.7);
      ctx.strokeStyle = H.rgba(rgb, a); ctx.lineWidth = (w / n) * 1.5;
      const off = u * w * 0.84;
      ctx.beginPath();
      P.forEach((p, i) => { const x = p[0] + N[i][0] * off, y = p[1] + N[i][1] * off; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke();
    }
    // dry streaks where the felt tip skipped
    for (let k = 0; k < 4; k++) {
      const off = (r() - 0.5) * w * 0.6;
      ctx.strokeStyle = H.rgba(BOARD, 0.14 + r() * 0.2); ctx.lineWidth = 0.6 + r() * 0.6;
      const s = Math.floor(r() * P.length * 0.4), e = Math.min(P.length, s + Math.floor(P.length * (0.3 + r() * 0.6)));
      ctx.beginPath();
      for (let i = s; i < e; i++) { const x = P[i][0] + N[i][0] * off, y = P[i][1] + N[i][1] * off; i > s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    // ink pools where the tip lands and lifts
    [P[0], prog >= 1 ? P[P.length - 1] : null].forEach((p, j) => {
      if (!p) return;
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], w * 0.62);
      g.addColorStop(0, H.rgba(rgb, j ? 0.25 : 0.42)); g.addColorStop(1, H.rgba(rgb, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], w * 0.62, 0, 7); ctx.fill();
    });
    ctx.restore();
  };

  // Marker lettering: per-glyph jitter, pale centers with darker rims.
  const mText = (ctx, str, x, y, font, col, seed, prog = 1, rot = 0) => {
    if (prog <= 0) return;
    const r = H.rng(seed), rgb = H.hex(col);
    ctx.save(); ctx.font = font; ctx.textBaseline = 'alphabetic';
    ctx.translate(x, y); ctx.rotate(rot);
    const nChars = Math.ceil(str.length * prog);
    if (prog < 1) {
      const wsofar = ctx.measureText(str.slice(0, nChars)).width;
      TIP = [x + Math.cos(rot) * wsofar, y + Math.sin(rot) * wsofar - 10, col];
    }
    let cx = 0;
    for (let i = 0; i < nChars; i++) {
      const ch = str[i], wch = ctx.measureText(ch).width;
      ctx.save(); ctx.translate(cx + wch / 2, (r() - 0.5) * 3); ctx.rotate((r() - 0.5) * 0.07);
      ctx.fillStyle = H.rgba(rgb, 0.8 + r() * 0.1); ctx.fillText(ch, -wch / 2, 0);
      ctx.strokeStyle = H.rgba(rgb, 0.7); ctx.lineWidth = 1.3; ctx.strokeText(ch, -wch / 2, 0);
      ctx.restore();
      cx += wch + (r() - 0.5) * 1.5;
    }
    ctx.restore();
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
  // Ghost residue of earlier lessons on the explainer's big board: baked once (world space, half resolution)
  // with the hero's streaky eraser-wipe mask and haze, then simply drawn under the live diagram.
  const ghostBoard = () => {
    if (XC.ghost) return XC.ghost;
    const x0 = -200, y0 = -100, w = 3600, h = 1400, s = 0.5;
    const nz = H.makeNoise(23);
    const g = H.layer(w * s, h * s), gc = g.getContext('2d');
    gc.scale(s, s); gc.translate(-x0, -y0);
    gc.strokeStyle = '#30343c'; gc.fillStyle = '#30343c'; gc.lineCap = 'round'; gc.lineJoin = 'round'; gc.lineWidth = 7;
    const wl = (pts, sd, amp = 1.8) => { tracePath(gc, wobble(seg(pts), nz, sd, amp)); gc.stroke(); };
    // A: an old quiz list (top right of the opening view)
    gc.font = '400 52px "Permanent Marker"'; gc.fillText('WEEK 6 QUIZ', 850, 118);
    gc.font = '700 34px "Kalam"';
    ['- read ch. 4', '- lab due Fri', '- bring calc!'].forEach((t, i) => gc.fillText(t, 872, 182 + i * 44));
    wl([[840, 138], [1020, 135], [1210, 132]], 1);
    // B: a pie and a wobbly line chart (bottom left of the opening view)
    gc.beginPath(); gc.arc(190, 588, 72, 0, 7); gc.stroke();
    gc.beginPath(); gc.moveTo(190, 588); gc.lineTo(190, 516); gc.moveTo(190, 588); gc.lineTo(252, 626); gc.stroke();
    wl([[300, 660], [360, 600], [420, 630], [520, 540]], 2);
    gc.font = '700 30px "Kalam"'; gc.fillText('sales / mo', 330, 694);
    // C: a formula above the example cards
    gc.font = '400 40px "Permanent Marker"'; gc.fillText('f(x) = w·x + b', 1740, 830);
    wl([[1730, 850], [1890, 846], [2030, 852]], 3, 1.4);
    // D: a little box diagram, top right of the loop view
    gc.beginPath(); gc.rect(3070, 300, 150, 80); gc.stroke();
    wl([[3010, 340], [3062, 340]], 4, 0.8);
    gc.font = '700 30px "Kalam"'; gc.fillText('step 2', 3100, 350);
    // E: homework note under the takeaway
    gc.font = '400 44px "Permanent Marker"'; gc.fillText('HW: p. 112', 2180, 1086);
    gc.beginPath(); gc.rect(2560, 1030, 200, 84); gc.stroke();
    wl([[2470, 1070], [2550, 1072]], 5, 0.8);
    gc.font = '700 30px "Kalam"'; gc.fillText('#3, #7', 2800, 1084);
    // eraser-wipe mask: the residue survives only in streaky swipe bands
    const m = H.layer(w * s, h * s), mc = m.getContext('2d'), rm = H.rng(77);
    mc.scale(s, s); mc.translate(-x0, -y0); mc.lineCap = 'round';
    for (let i = 0; i < 230; i++) {
      const y = rm.range(0, 1250), x = rm.range(-150, 3300), len = rm.range(150, 420);
      mc.strokeStyle = `rgba(0,0,0,${rm.range(0.15, 0.8)})`; mc.lineWidth = rm.range(4, 26);
      mc.beginPath(); mc.moveTo(x, y); mc.quadraticCurveTo(x + len / 2, y + rm.range(-30, 30), x + len, y + rm.range(-18, 18)); mc.stroke();
    }
    gc.setTransform(1, 0, 0, 1, 0, 0); gc.globalCompositeOperation = 'destination-in'; gc.drawImage(m, 0, 0);
    const cv = H.layer(w * s, h * s), c = cv.getContext('2d');
    c.filter = 'blur(0.5px)'; c.globalAlpha = 0.12; c.drawImage(g, 0, 0); c.globalAlpha = 1;
    // grey eraser haze smeared over each old lesson
    const rh = H.rng(78);
    c.scale(s, s); c.translate(-x0, -y0); c.lineCap = 'round'; c.filter = 'blur(3px)';
    [[1040, 180, 200, 70], [330, 600, 200, 80], [1880, 820, 160, 30], [3140, 340, 90, 40], [2470, 1070, 330, 40]].forEach(([cx, cy, rx, ry]) => {
      for (let i = 0; i < 4; i++) {
        const x = cx + rh.range(-rx, rx) * 0.6, y = cy + rh.range(-ry, ry);
        c.strokeStyle = `rgba(120,128,135,${rh.range(0.014, 0.03)})`; c.lineWidth = rh.range(30, 60);
        c.beginPath(); c.moveTo(x - 120, y); c.quadraticCurveTo(x, y + rh.range(-25, 25), x + 120, y + rh.range(-10, 10)); c.stroke();
      }
    });
    const out = { cv, x0, y0, w, h };
    let ready = true;
    try { ready = document.fonts.check('400 52px "Permanent Marker"') && document.fonts.check('700 34px "Kalam"'); } catch (e) { /* assume ready */ }
    if (ready) XC.ghost = out;
    return out;
  };
  // Streaky felt-eraser brush: a soft base wipe plus felt-fibre bands, so the residue left behind varies
  // across the swipe (clean bands next to faint ghost bands) like a real dry-erase felt.
  const FIBRES = (() => {
    const r = H.rng(313), out = [];
    for (let i = 0; i < 16; i++) out.push({ dy: (r() - 0.5) * 118, w: 5 + r() * 14, a: 0.45 + r() * 0.5 });
    return out;
  })();
  registerStyle({
    id: 'whiteboard',
    name: 'Whiteboard Explainer',
    category: 'Hand-Drawn',
    description: 'Dry-erase marker on a glossy whiteboard: streaky chisel-tip strokes with pooled edges, wobbly double-traced boxes and arrows, a ghost of the last erased lesson, and a soft ceiling-light sheen.',
    motion: 'Each stroke draws on in sequence like a hand drawing it live, with labels written letter by letter and the sheen drifting slightly as the camera breathes.',
    fonts: ['400 66px "Permanent Marker"', '700 38px "Kalam"', '400 40px "Permanent Marker"'],
    frameT: 5.9,
    duration: 6,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(11);
      const BX0 = 26, BY0 = 26, BX1 = W - 26, BY1 = 650;

      // ---------- board surface ----------
      const bg = ctx.createLinearGradient(0, 0, W, H_);
      bg.addColorStop(0, '#f6f8f7'); bg.addColorStop(0.55, '#ecefee'); bg.addColorStop(1, '#dfe4e3');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
      // faint large mottling (old cleaner residue)
      const rb = H.rng(5);
      for (let i = 0; i < 14; i++) {
        const x = rb.range(BX0, BX1), y = rb.range(BY0, BY1), rr = rb.range(80, 260);
        const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
        g.addColorStop(0, `rgba(150,160,165,${rb.range(0.015, 0.04)})`); g.addColorStop(1, 'rgba(150,160,165,0)');
        ctx.fillStyle = g; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      }

      // ---------- ghost of the previous (erased) diagram ----------
      {
        const g = H.layer(W, H_), gc = g.getContext('2d');
        gc.strokeStyle = '#30343c'; gc.fillStyle = '#30343c'; gc.lineCap = 'round'; gc.lineJoin = 'round';
        gc.lineWidth = 7;
        gc.font = '400 52px "Permanent Marker"'; gc.fillText('Q3 ROADMAP', 840, 110);
        gc.font = '700 34px "Kalam"';
        ['- ship v2 API', '- hire 2 eng', '- fix churn!!'].forEach((s, i) => gc.fillText(s, 860, 170 + i * 44));
        tracePath(gc, wobble(seg([[830, 130], [1190, 126]]), nz, 40)); gc.stroke();
        gc.beginPath(); gc.arc(190, 560, 70, 0, 7); gc.stroke();
        gc.beginPath(); gc.moveTo(190, 560); gc.lineTo(190, 490); gc.moveTo(190, 560); gc.lineTo(250, 600); gc.stroke();
        tracePath(gc, wobble(seg([[300, 620], [360, 560], [420, 590], [520, 500]]), nz, 41)); gc.stroke();
        gc.font = '700 30px "Kalam"'; gc.fillText('users / wk', 330, 640);
        gc.beginPath(); gc.rect(520, 150, 180, 90); gc.stroke();
        // eraser wipe mask: residue survives in streaky bands
        const m = H.layer(W, H_), mc = m.getContext('2d'), rm = H.rng(77);
        mc.lineCap = 'round';
        for (let i = 0; i < 70; i++) {
          const y = rm.range(40, 660), x = rm.range(20, 1100), len = rm.range(150, 420);
          mc.strokeStyle = `rgba(0,0,0,${rm.range(0.15, 0.8)})`; mc.lineWidth = rm.range(4, 26);
          mc.beginPath(); mc.moveTo(x, y); mc.quadraticCurveTo(x + len / 2, y + rm.range(-30, 30), x + len, y + rm.range(-18, 18)); mc.stroke();
        }
        gc.globalCompositeOperation = 'destination-in'; gc.drawImage(m, 0, 0);
        ctx.save(); ctx.filter = 'blur(0.7px)'; ctx.globalAlpha = 0.11; ctx.drawImage(g, 0, 0); ctx.restore();
        // eraser haze smears
        const rh = H.rng(78);
        ctx.save(); ctx.lineCap = 'round'; ctx.filter = 'blur(6px)';
        for (let i = 0; i < 9; i++) {
          const x = rh.range(700, 1180), y = rh.range(70, 260);
          ctx.strokeStyle = `rgba(120,128,135,${rh.range(0.012, 0.028)})`; ctx.lineWidth = rh.range(30, 60);
          ctx.beginPath(); ctx.moveTo(x - 120, y); ctx.quadraticCurveTo(x, y + rh.range(-25, 25), x + 120, y + rh.range(-10, 10)); ctx.stroke();
        }
        ctx.restore();
      }

      // ---------- the live diagram (drawn on over time) ----------
      const K = '#1d1f26', B = '#1f4fc2', R = '#d4262f', G = '#16884a';
      const items = [];
      let clock = 0.2;
      const add = (dur, fn) => { items.push({ t0: clock, dur, fn }); clock += dur; };
      const P = (pts, s, amp = 1.7) => wobble(seg(pts), nz, s, amp);
      const prog = (it) => H.clamp((t - it.t0) / it.dur);

      // Title + double blue underline
      add(1.0, (p) => mText(ctx, 'HOW AI LEARNS', 84, 124, '400 66px "Permanent Marker"', K, 3, p, -0.012));
      add(0.25, (p) => marker(ctx, P([[80, 150], [300, 146], [560, 141]], 1, 2.2), B, 8, 101, p));
      add(0.2, (p) => marker(ctx, P([[96, 164], [330, 159], [520, 156]], 2, 2.2), B, 7, 102, p));

      // DATA — database cylinder
      const cx = 196;
      add(0.25, (p) => marker(ctx, P(ell(cx, 272, 72, 21, -2.8, 3.62, 0.02), 3, 1.1), K, 7, 103, p));
      add(0.18, (p) => marker(ctx, P([[cx - 72, 270], [cx - 70, 412]], 4), K, 7, 104, p));
      add(0.18, (p) => marker(ctx, P([[cx + 72, 274], [cx + 71, 410]], 5), K, 7, 105, p));
      add(0.18, (p) => marker(ctx, P(ell(cx, 410, 71, 21, Math.PI, 0, 0.0).reverse(), 6, 1.0), K, 7, 106, p));
      add(0.14, (p) => marker(ctx, P(ell(cx, 320, 71, 20, Math.PI, 0).reverse(), 7, 1.0), K, 6, 107, p));
      add(0.14, (p) => marker(ctx, P(ell(cx, 366, 71, 20, Math.PI, 0).reverse(), 8, 1.0), K, 6, 108, p));
      add(0.4, (p) => mText(ctx, 'DATA', cx - 52, 478, '700 42px "Kalam"', K, 9, p));

      // arrow data -> model
      const arrow = (pts, col, w, s, headLen = 22) => {
        const L = P(pts, s, 1.5), a = L[L.length - 1], b = L[L.length - 6];
        const ang = Math.atan2(a[1] - b[1], a[0] - b[0]);
        add(0.22, (p) => marker(ctx, L, col, w, s * 7, p));
        add(0.12, (p) => marker(ctx, P([[a[0] - Math.cos(ang - 0.5) * headLen, a[1] - Math.sin(ang - 0.5) * headLen], a], s + 50, 0.6), col, w, s * 7 + 1, p));
        add(0.12, (p) => marker(ctx, P([[a[0] - Math.cos(ang + 0.5) * headLen, a[1] - Math.sin(ang + 0.5) * headLen], [a[0] + 1, a[1] + 1]], s + 51, 0.6), col, w, s * 7 + 2, p));
      };
      arrow([[292, 340], [360, 336], [418, 340]], K, 7, 10);

      // MODEL — neural net in blue
      const cols = [[490, [252, 340, 428]], [612, [222, 300, 380, 458]], [734, [290, 392]]];
      const nodes = cols.map(([x, ys]) => ys.map((y) => [x, y]));
      const rN = 21;
      const links = [];
      for (let c = 0; c < 2; c++) for (const a of nodes[c]) for (const b of nodes[c + 1]) links.push([a, b]);
      nodes.flat().forEach(([x, y], i) => {
        add(0.09, (p) => marker(ctx, P(ell(x, y, rN, rN, -1.9 + i, -1.9 + i + Math.PI * 2.15, 0.06), 400 + i, 0.8), B, 5.5, 500 + i, p));
      });
      add(0.9, (p) => {
        links.forEach(([a, b], i) => {
          const d = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d;
          const lp = H.clamp(p * links.length - i * 0.6);
          marker(ctx, P([[a[0] + ux * (rN + 3), a[1] + uy * (rN + 3)], [b[0] - ux * (rN + 3), b[1] - uy * (rN + 3)]], 200 + i, 1.0), B, 3.6, 300 + i, lp);
        });
      });
      add(0.4, (p) => mText(ctx, 'neural net', 520, 530, '700 38px "Kalam"', B, 12, p, 0.01));

      arrow([[772, 342], [830, 338], [876, 341]], K, 7, 11);

      // OUTPUT — green box, double traced
      const box = (x0, y0, x1, y1, s) => [[x0 - 6, y0 + 2], [x1 + 4, y0 - 2], [x1 + 1, y1 + 6], [x0 + 2, y1 + 1], [x0 + 1, y0 - 8]];
      add(0.45, (p) => marker(ctx, P(box(900, 278, 1150, 404), 13, 2.0), G, 7, 600, p));
      add(0.35, (p) => marker(ctx, P(box(905, 284, 1146, 398).map(([x, y]) => [x + 3, y - 2]), 14, 2.4), G, 5, 601, p));
      // cat doodle
      add(0.18, (p) => marker(ctx, P(ell(966, 350, 34, 30, -1.2, 5.3), 15, 0.8), K, 5, 602, p));
      add(0.1, (p) => marker(ctx, P([[940, 330], [944, 300], [962, 320]], 16, 0.4), K, 5, 603, p));
      add(0.1, (p) => marker(ctx, P([[972, 320], [990, 298], [994, 330]], 17, 0.4), K, 5, 604, p));
      add(0.06, (p) => { if (p > 0) { ctx.fillStyle = H.rgba(K, 0.85); ctx.beginPath(); ctx.arc(955, 346, 3.4, 0, 7); ctx.arc(978, 346, 3.4, 0, 7); ctx.fill(); } });
      add(0.12, (p) => marker(ctx, P([[960, 362], [966, 367], [972, 362]], 18, 0.3), K, 3, 605, p));
      add(0.12, (p) => { marker(ctx, P([[938, 358], [912, 354]], 19, 0.3), K, 2.6, 606, p); marker(ctx, P([[994, 358], [1020, 354]], 20, 0.3), K, 2.6, 607, p); });
      add(0.4, (p) => mText(ctx, '92%', 1030, 368, '400 40px "Permanent Marker"', G, 21, p));
      add(0.4, (p) => mText(ctx, 'prediction', 918, 252, '700 36px "Kalam"', G, 22, p, -0.02));
      // check mark
      add(0.2, (p) => marker(ctx, P([[1112, 222], [1126, 244], [1166, 182]], 23, 0.8), G, 8, 608, p));

      // feedback loop in red
      const loop = P(bez([1020, 418], [1026, 600], [770, 610], [748, 430]), 24, 2.0);
      add(0.5, (p) => marker(ctx, loop, R, 7, 700, p));
      {
        const a = loop[loop.length - 1], b = loop[loop.length - 8], ang = Math.atan2(a[1] - b[1], a[0] - b[0]);
        add(0.12, (p) => marker(ctx, P([[a[0] - Math.cos(ang - 0.55) * 24, a[1] - Math.sin(ang - 0.55) * 24], a], 25, 0.5), R, 7, 701, p));
        add(0.12, (p) => marker(ctx, P([[a[0] - Math.cos(ang + 0.55) * 24, a[1] - Math.sin(ang + 0.55) * 24], a], 26, 0.5), R, 7, 702, p));
      }
      add(0.5, (p) => mText(ctx, 'fix the error', 770, 626, '700 38px "Kalam"', R, 27, p, -0.03));
      add(0.3, (p) => mText(ctx, '& repeat!', 1050, 520, '700 34px "Kalam"', R, 28, p, -0.06));
      // a red emphasis tick next to the title
      add(0.15, (p) => marker(ctx, P([[648, 74], [651, 112]], 29, 0.6), R, 7, 703, p));
      add(0.08, (p) => { if (p > 0) { ctx.fillStyle = H.rgba(R, 0.8); ctx.beginPath(); ctx.arc(653, 128, 4.5, 0, 7); ctx.fill(); } });

      const sc = 4.1 / clock;
      TIP = null;
      items.forEach((it) => { it.t0 *= sc; it.dur *= sc; });
      items.forEach((it) => it.fn(prog(it)));

      // ---------- gloss / sheen (sits over ink too) ----------
      ctx.save();
      const sh = ctx.createLinearGradient(220 + t * 6, -60, 760 + t * 6, 760);
      sh.addColorStop(0.0, 'rgba(255,255,255,0)');
      sh.addColorStop(0.36, 'rgba(255,255,255,0)');
      sh.addColorStop(0.43, 'rgba(255,255,255,0.26)');
      sh.addColorStop(0.47, 'rgba(255,255,255,0.12)');
      sh.addColorStop(0.5, 'rgba(255,255,255,0.3)');
      sh.addColorStop(0.58, 'rgba(255,255,255,0)');
      sh.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H_);
      // ceiling light reflections
      [[380, 70, 260, 26], [930, 66, 230, 22]].forEach(([x, y, rx, ry]) => {
        ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.5, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 7); ctx.fill(); ctx.restore();
      });
      // darker falloff at bottom of board
      const fo = ctx.createLinearGradient(0, BY1 - 200, 0, BY1);
      fo.addColorStop(0, 'rgba(60,70,80,0)'); fo.addColorStop(1, 'rgba(60,70,80,0.07)');
      ctx.fillStyle = fo; ctx.fillRect(0, BY1 - 200, W, 200);
      ctx.restore();

      // ---------- the marker in hand while drawing ----------
      if (TIP) {
        const [tx, ty, col] = TIP, ang = 0.95, len = 230;
        ctx.save();
        // soft shadow cast on the board
        ctx.save(); ctx.filter = 'blur(8px)'; ctx.fillStyle = 'rgba(40,50,60,0.25)';
        ctx.translate(tx + 14, ty + 18); ctx.rotate(ang); ctx.beginPath(); ctx.roundRect(8, -14, len, 28, 12); ctx.fill(); ctx.restore();
        ctx.translate(tx, ty); ctx.rotate(ang);
        // chisel nib
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-2, -3); ctx.lineTo(16, -6); ctx.lineTo(16, 6); ctx.lineTo(-2, 2); ctx.closePath(); ctx.fill();
        // collar + barrel
        const g = ctx.createLinearGradient(0, -14, 0, 14);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, '#e4e6e8'); g.addColorStop(1, '#9ea3a8');
        ctx.fillStyle = '#c9ccd0'; ctx.beginPath(); ctx.roundRect(14, -9, 20, 18, 4); ctx.fill();
        ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(32, -14, len - 32, 28, 10); ctx.fill();
        ctx.fillStyle = col; ctx.fillRect(len - 52, -14, 40, 28);
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(40, -9, len - 100, 4);
        ctx.fillStyle = H.rgba(col, 0.85); ctx.fillRect(70, -2, 60, 5);
        ctx.restore();
      }

      // ---------- aluminium frame + tray ----------
      ctx.save();
      // inner shadow on board
      const inner = (x, y, w, h, dir) => {
        const g = dir === 'v' ? ctx.createLinearGradient(x, y, x, y + h) : ctx.createLinearGradient(x, y, x + w, y);
        g.addColorStop(0, 'rgba(40,45,55,0.16)'); g.addColorStop(1, 'rgba(40,45,55,0)');
        ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      };
      inner(BX0, BY0, BX1 - BX0, 10, 'v'); inner(BX0, BY0, 8, BY1 - BY0, 'h');
      const metal = (g) => {
        g.addColorStop(0, '#f4f5f6'); g.addColorStop(0.35, '#c6cace'); g.addColorStop(0.55, '#e7e9eb'); g.addColorStop(0.8, '#a3a8ae'); g.addColorStop(1, '#7c8187');
        return g;
      };
      ctx.fillStyle = metal(ctx.createLinearGradient(0, 0, 0, BY0)); ctx.fillRect(0, 0, W, BY0);
      ctx.fillStyle = metal(ctx.createLinearGradient(0, 0, BX0, 0)); ctx.fillRect(0, 0, BX0, BY1);
      ctx.fillStyle = metal(ctx.createLinearGradient(W, 0, BX1, 0)); ctx.fillRect(BX1, 0, W - BX1, BY1);
      ctx.strokeStyle = 'rgba(70,75,82,0.6)'; ctx.lineWidth = 1.5; ctx.strokeRect(BX0 - 0.5, BY0 - 0.5, BX1 - BX0 + 1, BY1 - BY0 + 1);
      // grey corner caps
      [[0, 1], [W, -1]].forEach(([x, sx]) => {
        ctx.save(); ctx.translate(x, 0); ctx.scale(sx, 1);
        const g = ctx.createLinearGradient(0, 0, 40, 40); g.addColorStop(0, '#6b6f75'); g.addColorStop(1, '#3d4045');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(42, 0); ctx.lineTo(42, 14); ctx.quadraticCurveTo(42, 42, 14, 42); ctx.lineTo(0, 42); ctx.closePath(); ctx.fill();
        ctx.restore();
      });
      // tray: interior well + front lip
      const tg = ctx.createLinearGradient(0, BY1, 0, 694);
      tg.addColorStop(0, '#6f747b'); tg.addColorStop(0.4, '#9ca1a7'); tg.addColorStop(1, '#c3c7cb');
      ctx.fillStyle = tg; ctx.fillRect(0, BY1, W, 694 - BY1);
      // markers lying in tray
      const mk = (x, len, body, cap, rot) => {
        ctx.save(); ctx.translate(x, 674); ctx.rotate(rot);
        const shg = ctx.createRadialGradient(len / 2, 12, 2, len / 2, 12, len / 2);
        shg.addColorStop(0, 'rgba(0,0,0,0.35)'); shg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shg; ctx.fillRect(-10, 0, len + 20, 22);
        const bg2 = ctx.createLinearGradient(0, -11, 0, 11);
        bg2.addColorStop(0, H.rgba(H.mix(body, '#ffffff', 0.35))); bg2.addColorStop(0.35, body); bg2.addColorStop(1, H.rgba(H.mix(body, '#000000', 0.5)));
        ctx.fillStyle = bg2; ctx.beginPath(); ctx.roundRect(0, -11, len * 0.72, 22, 8); ctx.fill();
        const cg = ctx.createLinearGradient(0, -12, 0, 12);
        cg.addColorStop(0, H.rgba(H.mix(cap, '#ffffff', 0.4))); cg.addColorStop(0.35, cap); cg.addColorStop(1, H.rgba(H.mix(cap, '#000000', 0.5)));
        ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(len * 0.7, -12, len * 0.3, 24, 9); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(len * 0.18, -5, len * 0.3, 7);
        ctx.fillStyle = cap; ctx.fillRect(len * 0.21, -3, len * 0.12, 3);
        ctx.restore();
      };
      mk(860, 150, '#e9eaec', '#1f4fc2', -0.02);
      mk(1040, 150, '#e9eaec', '#1d1f26', 0.015);
      // felt eraser
      ctx.save(); ctx.translate(180, 668);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(4, 10, 150, 18);
      const eg = ctx.createLinearGradient(0, -14, 0, 14); eg.addColorStop(0, '#5b6470'); eg.addColorStop(1, '#2c323a');
      ctx.fillStyle = eg; ctx.beginPath(); ctx.roundRect(0, -14, 150, 26, 5); ctx.fill();
      ctx.fillStyle = '#3e3e3e'; ctx.fillRect(4, 10, 142, 6);
      ctx.restore();
      const lg = ctx.createLinearGradient(0, 692, 0, H_);
      lg.addColorStop(0, '#f0f2f3'); lg.addColorStop(0.3, '#cfd3d7'); lg.addColorStop(0.75, '#a2a7ad'); lg.addColorStop(1, '#73787e');
      ctx.fillStyle = lg; ctx.fillRect(0, 692, W, H_ - 692);
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 692, W, 1.5);
      ctx.restore();

      H.grain(ctx, W, H_, 0.018, 9 + Math.floor(t * 12));
    },
    // >>>EXPLAINER
    explainerDuration: 15,
    explainerNote: 'A marker in hand draws the diagram while the camera follows it across one big board; the felt eraser wipes the loop away (leaving ghost residue) to make room for the accuracy chart, and numbers are re-scrawled in marker.',
    explainer(ctx, W, H_, t) {
      const nz = H.makeNoise(11);
      const COLS = { ink: '#1d1f26', acc1: '#1f4fc2', acc2: '#d4262f', acc3: '#16884a' };
      const FONT = { title: '"Permanent Marker"', label: '"Kalam"', num: '"Permanent Marker"' };
      const FW = { title: 400, label: 700, num: 400 };
      const D = [2560, 640];
      const L = {
        D, pT: 11.0, kT: 13.05,
        model: (cx, cy, adj, push, api, tt) => {
          const g = 'M';
          api.line(XE.rrect(cx - 170, cy - 152, 340, 330, 34), 'ink', 6, 2.5, 2.85, g);
          const cols = [[cx - 110, [-110, -50, 10]], [cx, [-125, -75, -25, 25]], [cx + 110, [-90, -10]]];
          const nodes = cols.map(([x, ys]) => ys.map((y) => [x, cy + y]));
          let li = 0;
          for (let c = 0; c < 2; c++) for (const a of nodes[c]) for (const b of nodes[c + 1]) {
            const d = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d;
            const P = [[a[0] + ux * 16, a[1] + uy * 16], [b[0] - ux * 16, b[1] - uy * 16]];
            api.line(P, 'acc1', 2.6, 2.95 + li * 0.012, 3.05 + li * 0.012, g);
            if ([1, 6, 9, 15].includes(li)) api.line(P, 'acc3', 6, 9.15 + li * 0.01, 9.3 + li * 0.01, g); // strengthened weights
            li++;
          }
          nodes.flat().forEach(([x, y], i) => api.line(XE.circ(x, y, 14, 14, -1.6 + i, -1.6 + i + 6.6), 'acc1', 4.5, 2.8 + i * 0.015, 2.88 + i * 0.015, g));
          // three weight knobs
          [-1, 0, 1].forEach((k, i) => {
            const x = cx + k * 92, y = cy + 98;
            api.line(XE.circ(x, y, 26, 26, -1.2, 5.2), 'ink', 4, 3.0 + i * 0.05, 3.12 + i * 0.05, g);
            if (tt > 3.15 + i * 0.05) {
              const a0 = [-2.4, -0.6, -1.9][i], a1 = [-0.7, -2.2, -0.4][i];
              const a = a0 + (a1 - a0) * adj + Math.sin(adj * Math.PI) * 0.25;
              push({ k: 'line', pts: [[x, y], [x + Math.cos(a) * 20, y + Math.sin(a) * 20]], role: adj > 0 && adj < 1 ? 'acc2' : 'ink', w: 4.5, a: -1, b: 0, inst: true, g });
            }
          });
          api.text('weights', cx, cy + 158, 30, 'label', 'ink', 3.2, 3.35, { align: 'center', g });
        },
      };
      const items = XE.story(t, L);
      const cam = XE.camAt([[0, 640, 360, 1.0], [2.0, 650, 362, 1.05], [2.8, 1830, 610, 0.95], [5.95, 1860, 620, 0.97], [6.55, 2580, 640, 0.9], [10.3, 2600, 645, 0.93],
        [10.95, 2560, 660, 0.92], [12.9, 2570, 670, 0.95], [13.6, 2560, 760, 0.88], [15, 2560, 760, 0.9]], t);
      const apply = (c) => { c.translate(W / 2, H_ / 2); c.scale(cam[2], cam[2]); c.translate(-cam[0], -cam[1]); };
      const toS = ([x, y]) => [(x - cam[0]) * cam[2] + W / 2, (y - cam[1]) * cam[2] + H_ / 2];

      // ---------- board ----------
      const bg = ctx.createLinearGradient(0, 0, W, H_);
      bg.addColorStop(0, '#f6f8f7'); bg.addColorStop(0.55, '#ecefee'); bg.addColorStop(1, '#dfe4e3');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
      ctx.save(); apply(ctx);
      { // faint residue blotches fixed to the board
        const rb = H.rng(5);
        for (let i = 0; i < 40; i++) {
          const x = rb.range(-200, 3600), y = rb.range(-200, 1400), rr = rb.range(80, 260);
          const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
          g.addColorStop(0, `rgba(150,160,165,${rb.range(0.02, 0.045)})`); g.addColorStop(1, 'rgba(150,160,165,0)');
          ctx.fillStyle = g; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
        }
      }
      { // ghosts of earlier, half-erased lessons in the empty parts of the board (cached, world space)
        const G = ghostBoard();
        ctx.drawImage(G.cv, G.x0, G.y0, G.w, G.h);
      }
      ctx.restore();

      const measure = (it, p) => {
        ctx.save(); ctx.font = `${FW[it.font]} ${it.size}px ${FONT[it.font]}`;
        const w = ctx.measureText(it.s).width, x0 = it.align === 'center' ? it.x - w / 2 : it.x;
        const w2 = ctx.measureText(it.s.slice(0, Math.ceil(it.s.length * p))).width; ctx.restore();
        return [x0 + w2, it.y - it.size * 0.35];
      };
      const drawItem = (c, it) => {
        const p = it.inst ? 1 : XE.win(t, it.a, it.b);
        if (p <= 0) return;
        const col = COLS[it.role];
        if (it.k === 'line') {
          const seed = ((it.pts[0][0] * 13 + it.pts[0][1] * 7) | 0) + 17;
          const P = wobble(seg(it.pts, 2.5), nz, seed % 97, it.inst ? 0.6 : 1.4);
          marker(c, P, col, it.w * 1.25, seed, p);
        } else if (it.k === 'dot') {
          c.fillStyle = H.rgba(col, 0.85); c.beginPath(); c.arc(it.x, it.y, it.r, 0, 7); c.fill();
        } else {
          const font = `${FW[it.font]} ${it.size}px ${FONT[it.font]}`;
          c.save(); c.font = font; const w = c.measureText(it.s).width; c.restore();
          const x0 = it.align === 'center' ? it.x - w / 2 : it.x;
          mText(c, it.s, x0, it.y, font, col, (it.s.length * 31 + (it.x | 0)) % 991, p, it.rot);
        }
      };
      // loop scene + model get erased later: keep them on their own layer
      const ERASE0 = 10.35, ERASE1 = 11.0;
      const E = H.layer(W, H_), ec = E.getContext('2d');
      ec.save(); apply(ec);
      ctx.save(); apply(ctx);
      TIP = null;
      for (const it of items) drawItem((it.g === 'C' || it.g === 'M') ? ec : ctx, it);
      ctx.restore(); ec.restore();
      // eraser: back-and-forth felt swipes over the loop region
      let eraserAt = null;
      if (t > ERASE0) {
        const u = XE.win(t, ERASE0, ERASE1), path = [];
        const x0 = 2040, x1 = 3060, y0 = 250, y1 = 1050, rows = 7;
        for (let r = 0; r <= rows; r++) { const y = y0 + (y1 - y0) * r / rows; path.push(r % 2 ? [x1, y] : [x0, y]); path.push(r % 2 ? [x0, y + 10] : [x1, y + 10]); }
        const P = seg(path, 12), n = Math.max(2, Math.ceil(P.length * u));
        const wipe = (c2, m) => {
          c2.lineCap = 'round'; c2.lineJoin = 'round';
          const sweep = (dy) => { c2.beginPath(); P.slice(0, m).forEach(([x, y], i) => (i ? c2.lineTo(x, y + dy) : c2.moveTo(x, y + dy))); c2.stroke(); };
          c2.strokeStyle = 'rgba(0,0,0,0.95)'; c2.lineWidth = 135; sweep(0);
          // felt fibres: streaky bands that lift more of the ink, leaving 0-5% ghost residue in swipe stripes
          for (const f of FIBRES) { c2.strokeStyle = `rgba(0,0,0,${f.a})`; c2.lineWidth = f.w; sweep(f.dy); }
        };
        ec.save(); apply(ec); ec.globalCompositeOperation = 'destination-out';
        if (u < 1) wipe(ec, n);
        else { // finished wipe is static: bake its mask once in world space and reuse it
          if (!XC.wipe) {
            const mx0 = 1940, my0 = 160, mw = 1200, mh = 980, s = 0.5;
            const mcv = H.layer(mw * s, mh * s), mc = mcv.getContext('2d');
            mc.scale(s, s); mc.translate(-mx0, -my0); wipe(mc, P.length);
            XC.wipe = { cv: mcv, mx0, my0, mw, mh };
          }
          const Wp = XC.wipe; ec.drawImage(Wp.cv, Wp.mx0, Wp.my0, Wp.mw, Wp.mh);
        }
        ec.restore();
        if (u < 1) eraserAt = toS(P[n - 1]);
      }
      ctx.drawImage(E, 0, 0);
      if (t > ERASE0) { // grey eraser haze left on the wiped area, building up with the passes
        if (!XC.haze) {
          const hx0 = 1960, hy0 = 200, hw = 1180, hh = 900, s = 0.5;
          const hc = H.layer(hw * s, hh * s), c = hc.getContext('2d'), rh = H.rng(79);
          c.scale(s, s); c.translate(-hx0, -hy0); c.lineCap = 'round'; c.filter = 'blur(6px)';
          for (let i = 0; i < 16; i++) {
            const x = rh.range(2150, 2950), y = rh.range(280, 1040);
            c.strokeStyle = `rgba(120,128,135,${rh.range(0.007, 0.016)})`; c.lineWidth = rh.range(40, 90);
            c.beginPath(); c.moveTo(x - 200, y); c.quadraticCurveTo(x, y + rh.range(-25, 25), x + 200, y + rh.range(-12, 12)); c.stroke();
          }
          XC.haze = { cv: hc, hx0, hy0, hw, hh };
        }
        const Z = XC.haze;
        ctx.save(); apply(ctx); ctx.globalAlpha = XE.win(t, ERASE0, ERASE1);
        ctx.drawImage(Z.cv, Z.hx0, Z.hy0, Z.hw, Z.hh); ctx.restore();
      }

      // ---------- gloss ----------
      const sh = ctx.createLinearGradient(220 - cam[0] * 0.15, -60, 760 - cam[0] * 0.15, 760);
      sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.4, 'rgba(255,255,255,0)'); sh.addColorStop(0.46, 'rgba(255,255,255,0.22)');
      sh.addColorStop(0.5, 'rgba(255,255,255,0.1)'); sh.addColorStop(0.53, 'rgba(255,255,255,0.24)'); sh.addColorStop(0.6, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H_);
      // ceiling-light reflections (a row of fixtures sliding by with parallax as the camera travels)
      {
        const off = -(cam[0] - 640) * 0.15;
        for (let i = 0; i < 4; i++) {
          const x = 380 + i * 550 + off, rx = i % 2 ? 230 : 260, ry = i % 2 ? 22 : 26, y = i % 2 ? 66 : 70;
          if (x + rx < 0 || x - rx > W) continue;
          ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
          g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.5, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 7); ctx.fill(); ctx.restore();
        }
        // darker falloff toward the bottom of the board, away from the lights
        const fo = ctx.createLinearGradient(0, H_ - 240, 0, H_);
        fo.addColorStop(0, 'rgba(60,70,80,0)'); fo.addColorStop(1, 'rgba(60,70,80,0.08)');
        ctx.fillStyle = fo; ctx.fillRect(0, H_ - 240, W, 240);
      }

      // ---------- tools ----------
      if (eraserAt) {
        const [ex, ey] = eraserAt;
        ctx.save(); ctx.translate(ex, ey); ctx.rotate(-0.08);
        ctx.save(); ctx.filter = 'blur(8px)'; ctx.fillStyle = 'rgba(30,40,50,0.3)'; ctx.fillRect(-70, -34, 160, 80); ctx.restore();
        const eg = ctx.createLinearGradient(0, -40, 0, 30); eg.addColorStop(0, '#6a7480'); eg.addColorStop(1, '#2c323a');
        ctx.fillStyle = eg; ctx.beginPath(); ctx.roundRect(-80, -42, 160, 66, 10); ctx.fill();
        ctx.fillStyle = '#3b3b3b'; ctx.fillRect(-78, 18, 156, 14);
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-70, -36, 140, 5);
        ctx.restore();
      } else {
        const tp = XE.tipOf(items, t, measure);
        if (tp) {
          const [tx, ty] = toS(tp), it = items.find((q) => !q.inst && XE.win(t, q.a, q.b) > 0 && XE.win(t, q.a, q.b) < 1 && q.k !== 'dot');
          const col = COLS[(items.filter((q) => !q.inst && q.k !== 'dot' && XE.win(t, q.a, q.b) > 0 && XE.win(t, q.a, q.b) < 1).pop() || it || { role: 'ink' }).role];
          const ang = 0.95, len = 230;
          ctx.save();
          ctx.save(); ctx.filter = 'blur(8px)'; ctx.fillStyle = 'rgba(40,50,60,0.25)'; ctx.translate(tx + 14, ty + 18); ctx.rotate(ang); ctx.beginPath(); ctx.roundRect(8, -14, len, 28, 12); ctx.fill(); ctx.restore();
          ctx.translate(tx, ty); ctx.rotate(ang);
          ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-2, -3); ctx.lineTo(16, -6); ctx.lineTo(16, 6); ctx.lineTo(-2, 2); ctx.closePath(); ctx.fill();
          const g = ctx.createLinearGradient(0, -14, 0, 14); g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, '#e4e6e8'); g.addColorStop(1, '#9ea3a8');
          ctx.fillStyle = '#c9ccd0'; ctx.beginPath(); ctx.roundRect(14, -9, 20, 18, 4); ctx.fill();
          ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(32, -14, len - 32, 28, 10); ctx.fill();
          ctx.fillStyle = col; ctx.fillRect(len - 52, -14, 40, 28);
          ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(40, -9, len - 100, 4);
          ctx.fillStyle = H.rgba(col, 0.85); ctx.fillRect(70, -2, 60, 5);
          ctx.restore();
        }
      }
      H.grain(ctx, W, H_, 0.018, 9 + (Math.floor(t * 12) % 5));
    },
    // <<<EXPLAINER
    // Sound: a dry-erase marker on a glossy board. Every draw-on gets a marker stroke of the same length
    // (pen lifts between items), the felt eraser scrubs in time with its 8 passes, counters tick on the
    // 12 fps redraw grid. Times mirror explainer()/XE.story (pT 11.0, kT 13.05, ERASE 10.35-11.0).
    explainerSound(k) {
      const pT = 11.0, kT = 13.05, ERASE0 = 10.35, ERASE1 = 11.0;
      // strokes are minor (dropped under a narrator) unless `minor` is passed false for a key moment
      const mk = (a, b, gain = 1, pan = 0, material = 'marker', minor = true) => {
        k.noise(a, { dur: 0.022, filter: 'bandpass', f: 1500, q: 1.4, gain: 0.22 * gain, a: 0.001, pan, minor }); // felt tip touching down
        k.play('stroke', a, { material, dur: b - a, gain, pan, minor });
      };
      // handwriting: one stroke per word, timed by character position like mText's progress
      const write = (s, a, b, gain = 0.9, pan = 0) => {
        const n = s.length, re = /\S+/g; let m;
        while ((m = re.exec(s))) mk(a + (b - a) * m.index / n, a + (b - a) * (m.index + m[0].length) / n, gain, pan);
      };

      k.bed('room', 0, 15, { gain: 0.5 });
      k.play('pop', 0.03, { f: 330, gain: 0.45, minor: true }); // cap off

      // 1 HOOK
      write('How does AI learn?', 0.15, 1.3, 0.95);
      mk(1.3, 1.55, 1.15, 0, 'marker', false); // blue underline, fast confident swipe

      // 2 DATA: model box, nodes, then six cards (tip jumps to each new card)
      mk(2.5, 2.8, 1.0, 0, 'marker', false); // model box: first mark in the new scene
      for (let i = 0; i < 9; i += 3) mk(2.8 + i * 0.015, 2.85 + i * 0.015, 0.7); // little node circles
      for (let i = 0; i < 6; i++) { const a = 3.0 + i * 0.17; mk(a, a + (i < 5 ? 0.15 : 0.21), 0.85, (i % 3 - 1) * 0.15); }
      mk(4.15, 4.45, 1.0); mk(4.46, 4.55, 0.9); // flow arrow + head
      k.play('paper', 4.5, { dur: 1.6, gain: 0.4, minor: true }); // example cards streaming into the model
      write('examples', 4.55, 4.8, 0.7);
      for (let f = 55; f < 63; f++) k.play('count', f / 12, { gain: 0.85, f: 3800 + (f - 55) * 180, minor: true }); // 0 -> 1,000,000
      k.play('tock', 63 / 12, { f: 620, gain: 0.45 }); // 1,000,000 lands

      // 3 GUESS -> CHECK -> ADJUST
      [[6.4, 6.53], [6.55, 6.66], [6.67, 6.79], [6.8, 6.94], [6.96, 7.02], [7.03, 7.14]].forEach(([a, b]) => mk(a, b, 0.9));
      write('Guess', 7.16, 7.29, 0.75);
      mk(7.3, 7.47, 0.9); mk(7.48, 7.53, 0.8); // speech bubble + tail
      write('dog?', 7.54, 7.75, 1.0);
      write('Check', 7.86, 8.0, 0.7);
      // the wrong guess: two hard red slashes + a low "nope"
      mk(8.0, 8.08, 1.7, 0.1, 'sharpie', false); mk(8.08, 8.15, 1.7, 0.1, 'sharpie', false);
      k.play('error', 8.0, { f: 'F3', gain: 0.6 });
      mk(8.16, 8.45, 1.1, 0, 'sharpie'); // emphasis ring
      mk(8.45, 8.79, 1.0); write('Adjust', 8.8, 9.05, 0.75);
      for (let i = 0, x = 8.97; x < 9.48; i++, x += 0.07 + i * 0.006) k.play('click', x, { f: 1100, gain: 0.55, pan: -0.15, minor: true }); // knobs ratchet
      mk(9.16, 9.45, 0.8); // green strengthened weights
      mk(9.5, 9.62, 1.1); // strike "dog?"
      write('cat', 9.62, 9.85, 1.0);
      mk(9.85, 10.05, 1.1, 0, 'marker', false); // check mark
      k.play('success', 9.98, { gain: 0.8 });

      // eraser: 8 felt passes back and forth over the loop (path lengths from the explainer's sweep)
      {
        const run = 1020, step = 800 / 7 - 10, total = 8 * run + 7 * step, sp = (ERASE1 - ERASE0) / total;
        for (let r = 0; r < 8; r++) {
          const a = ERASE0 + r * (run + step) * sp, d = run * sp, dir = r % 2 ? -1 : 1;
          for (let j = 0; j < 3; j++) k.noise(a + j * d / 3, { dur: d / 3 + 0.03, color: 'pink', filter: 'bandpass', f: 650 + j * 120, q: 0.7, gain: 0.3, a: 0.01, pan: dir * (j - 1) * 0.5 });
        }
        k.play('erase', ERASE0, { dur: ERASE1 - ERASE0, gain: 0.6 });
      }

      // 4 PROGRESS
      mk(pT, pT + 0.29, 1.0); // axes
      write('training rounds', pT + 0.3, pT + 0.44, 0.65);
      write('accuracy', pT + 0.45, pT + 0.7, 0.7);
      mk(pT + 0.7, pT + 1.7, 0.55); // the rising accuracy curve
      { // % counter: tick when the shown number changes, at most 12/s; slows by itself as it settles
        let last = -1;
        for (let f = Math.ceil((pT + 0.6) * 12); f < 153; f++) {
          const u = Math.min(1, (f / 12 - (pT + 0.6)) / 1.1), v = Math.round(61 + 36 * (1 - Math.pow(1 - u, 2.2)));
          if (v !== last) { k.play('tick', f / 12, { gain: 0.8, f: 3000 + (v - 61) * 30, pan: 0.2, minor: true }); last = v; }
        }
      }
      // 97% lands (turns green) and gets circled: the biggest hit
      k.play('impact', 153 / 12, { gain: 0.85 });
      k.play('ding', 153 / 12 + 0.01, { f: 'E6', gain: 0.55 });
      mk(pT + 1.75, pT + 2.05, 1.2, 0.2, 'sharpie', false);

      // 5 TAKEAWAY
      write('More examples → better guesses', kT, kT + 0.75, 0.9);
      k.play('success', kT + 0.75, { f: 'G5', gain: 0.7 }); // resolving landing
      mk(kT + 0.75, kT + 0.95, 1.1, 0, 'marker', false);
      k.play('click', 14.35, { f: 1300, gain: 0.9, minor: true }); // cap back on
    },
  });
}
```
