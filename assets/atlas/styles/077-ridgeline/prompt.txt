I want an animated explainer made in the "Ridgeline" visual style (Data & Information). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Space Mono
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=block">
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
Name: Ridgeline
Family: Data & Information
Look: Sixty stacked traces of noisy signal, each filled black so it occludes the one behind, drawn as thin white lines in a perfectly centred block with a tiny typographic caption.
Motion: Traces are plotted one after another from the top, each swept left to right like a pen recorder and occluding the ones behind; once the stack is complete the peaks ripple like a live signal and the caption types in.
How it explains: Each white trace is one training round: a recorder tape feeds labelled pulses into the empty stack, three magnified traces act out guess / check / adjust (the peak lands on "dog", a dashed target shows "cat", the peak slides over), then the camera pulls back and sixty rounds plot themselves as the noisy peaks align into one clean ridge, captioned in Space Mono.

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

REFERENCE STYLE SOURCE (styles/ridgeline.js; W/H_ are always 1280x720)
```js
{
  // Stacked ridgeline in the manner of the famous pulsar plot: occluding white traces on black.
  // ---- print finish: the original is an offset print, cream ink on rough black stock ----
  // cached per pixel size: ink-density mottle (multiply) and warm stock fibres (added light)
  const RL = {};
  const rlTex = (pw, ph) => {
    const key = pw + 'x' + ph; if (RL.key === key) return RL;
    RL.key = key; RL.half = H.layer(pw >> 1, ph >> 1); RL.quarter = H.layer(pw >> 2, ph >> 2);
    // ink mottle: cream areas print 82-100% dense, blotchy at two scales (black stays black under multiply)
    const mw = 320, mh = 180, m = H.layer(mw, mh), mx = m.getContext('2d'), mi = mx.createImageData(mw, mh), nz = H.makeNoise(4242);
    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
      const v = 0.5 + 0.5 * nz.fbm2(x * 0.045, y * 0.045, 4), f = 0.5 + 0.5 * nz.n2(x * 0.6, y * 0.6), d = 1 - 0.13 * v - 0.06 * f, i = (y * mw + x) * 4;
      mi.data[i] = 255 * d; mi.data[i + 1] = 255 * (d - 0.01); mi.data[i + 2] = 255 * (d - 0.03); mi.data[i + 3] = 255;
    }
    mx.putImageData(mi, 0, 0);
    RL.ink = H.layer(pw, ph); { const g = RL.ink.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(m, 0, 0, pw, ph); }
    // stock: a warm lift with cloudy variation plus sparse light fibres, added with 'lighter'
    const sw = 256, sh = 144, s = H.layer(sw, sh), sx = s.getContext('2d'), si = sx.createImageData(sw, sh), nz2 = H.makeNoise(515);
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      const v = 0.5 + 0.5 * nz2.fbm2(x * 0.03, y * 0.03, 4), i = (y * sw + x) * 4;
      si.data[i] = 5 + 6 * v; si.data[i + 1] = 4 + 5 * v; si.data[i + 2] = 2 + 3 * v; si.data[i + 3] = 255;
    }
    sx.putImageData(si, 0, 0);
    RL.stock = H.layer(pw, ph); const g = RL.stock.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, pw, ph); g.imageSmoothingQuality = 'high'; g.drawImage(s, 0, 0, pw, ph);
    const r = H.rng(77), k = pw / 1280; g.lineCap = 'round';
    for (let i = 0; i < 900; i++) {
      const x = r() * pw, y = r() * ph, a = r() * Math.PI * 2, l = r.range(3, 14) * k, c = r.range(8, 20) | 0;
      g.strokeStyle = `rgb(${c},${c - 2},${c - 5})`; g.lineWidth = r.range(0.4, 1) * k;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    RL.inkD = RL.ink.getContext('2d').getImageData(0, 0, pw, ph).data; RL.stockD = g.getImageData(0, 0, pw, ph).data;
    RL.ink = RL.stock = null;
    return RL;
  };
  const printFinish = (ctx, grain, seed) => {
    const cv = ctx.canvas, pw = cv.width, ph = cv.height, T = rlTex(pw, ph);
    // soft copies made by resampling (half res ~ 1px spread, quarter res ~ 2.5px halo): far cheaper than ctx.filter blur
    const hx = T.half.getContext('2d'), qx = T.quarter.getContext('2d');
    hx.imageSmoothingQuality = 'medium'; hx.drawImage(cv, 0, 0, T.half.width, T.half.height);
    qx.imageSmoothingQuality = 'medium'; qx.drawImage(T.half, 0, 0, T.quarter.width, T.quarter.height);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'medium';
    // ink spread: a soft copy of the lines added back, so the cream bleeds a hair into the stock
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.22; ctx.drawImage(T.half, 0, 0, pw, ph);
    ctx.globalAlpha = 0.07; ctx.drawImage(T.quarter, 0, 0, pw, ph);
    ctx.restore();
    // one pixel pass: ink density (multiply) + warm stock (add) + mono film/print grain (as H.grain)
    const img = ctx.getImageData(0, 0, pw, ph), d = img.data, ink = T.inkD, st = T.stockD, r = H.rng(seed), ka = grain * 255, inv = 1 / 255;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * ka;
      d[i] = d[i] * ink[i] * inv + st[i] + n; d[i + 1] = d[i + 1] * ink[i + 1] * inv + st[i + 1] + n; d[i + 2] = d[i + 2] * ink[i + 2] * inv + st[i + 2] + n;
    }
    ctx.putImageData(img, 0, 0);
  };
  registerStyle({
    id: 'ridgeline',
    name: 'Ridgeline',
    category: 'Data & Information',
    description: 'Sixty stacked traces of noisy signal, each filled black so it occludes the one behind, drawn as thin white lines in a perfectly centred block with a tiny typographic caption.',
    motion: 'Traces are plotted one after another from the top, each swept left to right like a pen recorder and occluding the ones behind; once the stack is complete the peaks ripple like a live signal and the caption types in.',
    duration: 5,
    fonts: ['400 10px "Space Mono"', '700 10px "Space Mono"', '700 34px "Space Mono"', '400 13px "Space Mono"', '700 18px "Space Mono"', '700 40px "Space Mono"', '700 56px "Space Mono"', '700 84px "Space Mono"', '400 26px "Space Mono"', '700 30px "Space Mono"'],
    frameT: 4.9,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, W, H_);

      const N = 60, BW = 380, gap = 6.6;
      const x0 = W / 2 - BW / 2, x1 = W / 2 + BW / 2;
      const blockH = gap * (N - 1);
      const yTop = H_ / 2 - blockH / 2 + 4; // optical centre (peaks rise above)
      const nz = H.makeNoise(1919), nz2 = H.makeNoise(67);
      const STEP = 1.5;
      const cxw = W / 2 - 8; // phase of the main pulse

      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      for (let i = 0; i < N; i++) {
        const r = H.rng(1000 + i);
        const base = yTop + i * gap;
        // peaks: a few gaussians clustered around the main pulse phase
        const peaks = [];
        const np = r.int(4, 7);
        for (let k = 0; k < np; k++) {
          peaks.push({
            mu: cxw + r.gauss() * 36 + Math.sin(t * 0.9 + i * 0.37 + k) * 3,
            s: r.range(4, 17),
            h: (6 + 52 * Math.pow(r(), 1.7)) * (0.75 + 0.25 * Math.sin(t * 1.3 + i * 0.5 + k * 2)),
          });
        }
        // a quieter side lobe on some lines
        if (r.chance(0.45)) peaks.push({ mu: cxw + r.range(55, 95) * (r.chance(0.5) ? 1 : -1), s: r.range(4, 9), h: r.range(4, 16) });

        const pts = [];
        for (let x = x0; x <= x1 + 0.01; x += STEP) {
          const u = (x - x0) / BW;
          const env = Math.pow(Math.sin(Math.PI * H.clamp((u - 0.2) / 0.6)), 1.6); // central window
          let a = 0;
          for (const p of peaks) { const d = (x - p.mu) / p.s; a += p.h * Math.exp(-0.5 * d * d); }
          a *= env;
          // fine noise texture: tiny everywhere, larger in the active window
          const fine = nz.n3(x * 0.32, i * 0.9, t * 0.8) * (0.9 + env * 3.2) + nz2.n3(x * 0.06, i * 0.45, t * 0.3) * env * 9;
          pts.push([x, base - Math.max(-2, a + fine)]);
        }
        // pen-recorder sweep: this trace is drawn left to right over 0.24 s
        const sweep = H.clamp((t - (0.15 + i * 0.036)) / 0.24);
        if (sweep <= 0) continue;
        const nDraw = Math.max(2, Math.ceil(pts.length * H.ease.inOut(sweep)));
        const vis = pts.slice(0, nDraw);
        const xe = vis[vis.length - 1][0];
        // occlusion: fill under the trace with black, then stroke
        ctx.beginPath();
        ctx.moveTo(vis[0][0], vis[0][1]);
        for (const p of vis) ctx.lineTo(p[0], p[1]);
        ctx.lineTo(xe, base + gap * 3); ctx.lineTo(x0, base + gap * 3); ctx.closePath();
        ctx.fillStyle = '#050505'; ctx.fill();
        ctx.beginPath();
        ctx.moveTo(vis[0][0], vis[0][1]);
        for (const p of vis) ctx.lineTo(p[0], p[1]);
        ctx.strokeStyle = '#F2F0EA'; ctx.lineWidth = 1.25; ctx.stroke();
        if (sweep < 1) {
          const [hx, hy] = vis[vis.length - 1];
          const gl = ctx.createRadialGradient(hx, hy, 0, hx, hy, 5);
          gl.addColorStop(0, 'rgba(255,255,255,0.6)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(hx, hy, 5, 0, 7); ctx.fill();
        }
      }

      // ---- tiny caption ----
      const cy = yTop + blockH + 48;
      const spaced = (str, y, track, font, col) => {
        ctx.font = font; ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        let w = 0; for (const ch of str) w += ctx.measureText(ch).width + track; w -= track;
        let x = W / 2 - w / 2; for (const ch of str) { ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + track; }
      };
      // caption fades up letter by letter (centred, so full width is reserved)
      const capA = (k, n, t0) => H.clamp((t - t0 - k * (0.5 / n)) / 0.15);
      const spacedReveal = (str, y, track, font, col, t0) => {
        ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        let w = 0; for (const ch of str) w += ctx.measureText(ch).width + track; w -= track;
        let x = W / 2 - w / 2, k = 0;
        for (const ch of str) { ctx.globalAlpha = capA(k++, str.length, t0); ctx.fillStyle = col; ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + track; }
        ctx.globalAlpha = 1;
      };
      spacedReveal('60 CONSECUTIVE FORWARD PASSES', cy, 3.2, '700 10px "Space Mono"', 'rgba(242,240,234,0.82)', 2.6);
      spacedReveal('neuron 4,096 · layer 31 · tokens 1–256', cy + 16, 1.2, '400 10px "Space Mono"', 'rgba(242,240,234,0.42)', 2.9);

      printFinish(ctx, 0.06, 8 + Math.floor(t * 12));
    },
    // Sound: a chart recorder in a quiet lab. Each trace is plotted with a stylus scratch over a low servo, and
    // the servo bends up as the pen climbs each peak, so the peaks are heard where they are drawn. Labelled pulses
    // on the tape thump past like a slow pulsar (dog low, cat higher); the sixty rounds start as a wobbling,
    // detuned drone that pulls into one clean tone on the cat pitch. Times mirror explainer() below.
    explainerSound(k) {
      const D = 15, io = H.ease.inOut, lin = (u) => u;
      const seg = (t, a, b) => H.clamp((t - a) / (b - a));
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const DOG = 196, CAT = 294; // pitch of the "dog" and "cat" positions on the answer axis (G3, D4)
      // a plotted trace: stylus scratch + servo that bends up over each peak as the pen crosses it
      const plot = (t0, t1, ease, peaks, x0, x1, g = 1, minor = false) => {
        const d = t1 - t0, base = 92, f = [[0, base]];
        peaks.slice().sort((a, b) => a.u - b.u).forEach((p) => {
          const tp = when(t0, t1, ease, p.u) - t0, w = Math.max(0.025, d * p.s * 2.2);
          f.push([Math.max(f[f.length - 1][0] + 0.005, tp - w), base], [tp, base * (1 + p.h / 45)], [tp + w, base]);
          if (p.h >= 30) k.tone(t0 + tp, { f: p.cat ? CAT : DOG, dur: 0.35, gain: 0.13 * g, a: 0.006, verb: 0.25, pan: pan(H.lerp(x0, x1, p.u)), minor }); // the peak sounds its pitch
        });
        f.push([d, base]);
        k.tone(t0, { f, type: 'triangle', dur: d + 0.04, gain: 0.035 * g, a: 0.03, hold: d - 0.06, filter: 'lowpass', f2: 700, pan: pan((x0 + x1) / 2), minor });
        k.noise(t0, { dur: d, filter: 'bandpass', f: [[0, 1500], [d * 0.5, 2100], [d, 1500]], q: 1.4, gain: 0.028 * g, a: 0.03, hold: d - 0.06, pan: pan((x0 + x1) / 2), minor: true });
      };
      // a soft low note for labels and captions
      const note = (t, f, g = 1, p = 0, minor = true) => k.tone(t, { f, dur: 0.7, gain: 0.08 * g, a: 0.01, verb: 0.3, pan: p, minor });
      // recorder digit tick
      const tick = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.014, filter: 'bandpass', f: 1800, q: 2, gain: 0.18 * g, a: 0.001, pan: p }); k.tone(t, { f: 150, dur: 0.02, gain: 0.04 * g, pan: p }); });
      const counter = (t0, t1, steps, p) => { let last = -1, lastT = -1; for (let t = t0; t <= t1 + 1e-6; t += 1 / 120) { const v = Math.floor(io(seg(t, t0, t1)) * steps); if (v !== last && t - lastT >= 1 / 12) { tick(t, 0.8 + 0.3 * v / steps, p); last = v; lastT = t; } } };
      const slide = (t0, t1, g = 1) => k.noise(t0, { dur: t1 - t0 + 0.1, color: 'brown', filter: 'bandpass', f: [[0, 220], [(t1 - t0) * 0.5, 420], [t1 - t0 + 0.1, 200]], q: 0.6, gain: 0.12 * g, a: (t1 - t0) * 0.45 });

      k.bed('room', 0, D, { gain: 0.3 });
      k.bed('hiss', 0, D, { gain: 0.8 });

      // ---- hook: one big trace sweeps 0 -> 1.4, title and caption, then the title docks (1.6 -> 2.4)
      plot(0, 1.4, io, [{ u: 0.5, s: 0.03, h: 40, cat: true }, { u: 0.44, s: 0.02, h: 18 }], 120, 1160, 1.2);
      note(0.62, 'A3', 0.9); // caption: one signal, read sixty times
      slide(1.6, 2.4, 0.7);

      // ---- data: the empty stack rules itself, the tape feeds labelled pulses in
      k.noise(2.5, { dur: 0.95, filter: 'bandpass', f: [[0, 900], [0.95, 1400]], q: 1.2, gain: 0.04, a: 0.1, pan: pan(920), minor: true }); // 60 hairlines rule across
      note(3.05, 'D3', 1.1, pan(920)); // "the model"
      k.noise(3.3, { dur: 0.6, filter: 'bandpass', f: [[0, 800], [0.6, 1300]], q: 1.4, gain: 0.04, a: 0.05, pan: pan(920), minor: true }); // arrow into the model
      { // tape pulses (same seeded set as explainer) thump as each passes the arrow at x = 920
        const pr = H.rng(77), P = []; for (let q = 0; q < 14; q++) P.push({ x0: q * 100, cat: pr.chance(0.5), h: pr.range(30, 48) });
        for (const p of P) {
          // PX = ((x0 - (t-2.5)*170) mod 1400) - 60 = 920  ->  t = 2.5 + (x0 - 980 + 1400 m) / 170
          for (let m = 0; m < 2; m++) {
            const t = 2.5 + (p.x0 - 980 + 1400 * m) / 170;
            if (t < 2.75 || t > 6.0) continue;
            const g = (p.h / 48) * (1 - seg(t, 5.8, 6.2) * 0.6);
            k.withMinor(() => { k.tone(t, { f: [[0, p.cat ? CAT : DOG], [0.09, (p.cat ? CAT : DOG) * 0.92]], dur: 0.12, gain: 0.12 * g, a: 0.004, pan: pan(920) }); k.noise(t, { dur: 0.015, filter: 'bandpass', f: 1200, q: 1.5, gain: 0.08 * g, a: 0.001, pan: pan(920) }); });
          }
        }
      }
      counter(2.8, 5.8, 30, pan(150));
      k.play('tock', 5.8, { f: 330, gain: 0.45, pan: pan(150) }); // 1,000,000

      // ---- loop: three magnified traces act out guess / check / adjust
      plot(6.6, 7.2, io, [{ u: 0.36, s: 0.03, h: 46 }, { u: 0.55, s: 0.02, h: 10 }], 260, 1060, 1.3); // guess: peak lands on dog
      // "dog?" ✗ and the scribbled ring: the wrong guess
      k.tone(7.1, { f: 'D3', type: 'triangle', dur: 0.3, gain: 0.16, hold: 0.08, filter: 'lowpass', f2: 800, pan: pan(550) });
      k.tone(7.28, { f: 'A2', type: 'triangle', dur: 0.55, gain: 0.17, hold: 0.12, filter: 'lowpass', f2: 600, pan: pan(550) });
      k.play('stroke', 7.4, { material: 'pen', dur: 0.5, gain: 2.2, pan: pan(550), minor: true }); // ring around the guess
      plot(8.1, 8.7, io, [{ u: 0.36, s: 0.03, h: 46 }, { u: 0.55, s: 0.02, h: 10 }], 260, 1060, 0.9, true); // check: same trace again
      k.tone(8.3, { f: CAT, dur: 0.9, gain: 0.07, a: 0.15, verb: 0.3, pan: pan(770) }); // dashed target fades in on cat
      note(8.35, 'F#3', 0.8, pan(840)); // "answer: cat"
      k.noise(8.6, { dur: 0.4, filter: 'bandpass', f: [[0, 900], [0.4, 1400]], q: 1.4, gain: 0.05, a: 0.04, pan: pan(660), minor: true }); // error arrow
      { // adjust: the trace sweeps 8.9 -> 9.5 while its peak shifts dog -> cat (9.0 -> 9.9); find where the pen meets it
        let tc = 9.5; for (let t = 8.9; t <= 9.5; t += 0.002) { if (io(seg(t, 8.9, 9.5)) >= H.lerp(0.36, 0.64, io(seg(t, 9.0, 9.9)))) { tc = t; break; } }
        const uc = H.lerp(0.36, 0.64, io(seg(tc, 9.0, 9.9)));
        plot(8.9, 9.5, io, [{ u: uc, s: 0.03, h: 50 }], 260, 1060, 1.0);
        // the peak slides over: a slow glide from the dog pitch up to the cat pitch
        k.tone(9.0, { f: [[0, DOG], [0.15, DOG * 1.01], [0.75, CAT * 0.99], [0.9, CAT]], dur: 1.0, gain: 0.09, a: 0.12, hold: 0.6, verb: 0.2, pan: pan(550) });
      }
      note(9.05, 'B2', 0.8, pan(660)); // "shift the weights"
      // "cat" ✓: the correction, cat pitch with its fifth
      k.tone(9.9, { f: CAT, dur: 1.2, gain: 0.14, a: 0.008, verb: 0.35, pan: pan(900) });
      k.tone(9.97, { f: CAT * 1.5, dur: 1.0, gain: 0.09, a: 0.008, verb: 0.35, pan: pan(900) });
      k.noise(10.0, { dur: 0.4, filter: 'bandpass', f: [[0, 900], [0.4, 1300]], q: 1.4, gain: 0.04, a: 0.05, pan: -0.7, minor: true }); // repeat bracket
      slide(10.6, 11.4, 1.0); // camera pulls back to the stack

      // ---- progress: 57 rounds plot in 11.3 -> 12.78; noisy peaks pull into one clean ridge
      {
        const t0 = 11.3, t1 = 12.8, d = t1 - t0;
        k.noise(t0, { dur: d, filter: 'bandpass', f: [[0, 1600], [d, 2100]], q: 1.2, gain: 0.05, a: 0.1, hold: d - 0.3, pan: 0.05, minor: true }); // the stylus racing down the stack
        // three detuned voices converge on the cat pitch as the ridges align
        [[0.78, -0.4], [1.22, 0.4], [0.93, 0]].forEach(([r, p], i) => k.tone(t0, { f: [[0, CAT * r], [d * 0.5, CAT * (1 + (r - 1) * 0.35)], [d, CAT]], dur: d + 0.2, gain: 0.05, a: 0.2, hold: d - 0.3, pan: p * 0.5, filter: 'lowpass', f2: 900 }));
        // per-round pen pulses, a few audible: every 6th round's cat peak
        for (let i = 3; i < 60; i += 6) { const tp = 11.3 + (i - 3) * 0.026 + 0.22 * 0.64; k.tone(tp, { f: CAT, dur: 0.12, gain: 0.05 + 0.05 * (i / 60), a: 0.004, pan: pan(700), minor: true }); }
        note(11.4, 'D3', 0.7, pan(250)); // "round 1"
        note(12.7, 'D3', 0.7, pan(250)); // "round 60"
        counter(11.3, 12.8, 36, pan(1050));
      }
      // 97% underlined, the bracket "one clean peak: cat", the last trace thickens: the big hit
      k.play('impact', 12.9, { gain: 0.55, pan: pan(1050) });
      k.tone(12.9, { f: CAT, dur: 2.0, gain: 0.17, a: 0.005, verb: 0.4, pan: pan(900) });
      k.tone(12.9, { f: CAT / 2, dur: 2.0, gain: 0.12, a: 0.005, verb: 0.3 });
      k.noise(12.9, { dur: 0.5, filter: 'bandpass', f: [[0, 900], [0.5, 1300]], q: 1.4, gain: 0.04, a: 0.05, pan: pan(1100), minor: true }); // underline draws
      // takeaway fades up: the resolve on cat
      ['D3', 'A3', 'D4', 'F#4'].forEach((f, i) => k.tone(13.45 + i * 0.09, { f, dur: 1.4, gain: 0.09 - i * 0.01, a: 0.015, verb: 0.4, pan: (i - 1.5) * 0.2 }));
    },
    explainerDuration: 15,
    explainerNote: 'Each white trace is one training round: a recorder tape feeds labelled pulses into the empty stack, three magnified traces act out guess / check / adjust (the peak lands on "dog", a dashed target shows "cat", the peak slides over), then the camera pulls back and sixty rounds plot themselves as the noisy peaks align into one clean ridge, captioned in Space Mono.',
    explainer(ctx, W, H_, t) {
      const S = (a, b) => H.clamp((t - a) / (b - a));
      const BGC = '#050505', FG = '#F2F0EA', DIM = 'rgba(242,240,234,0.6)';
      ctx.fillStyle = BGC; ctx.fillRect(0, 0, W, H_);
      const nz = H.makeNoise(1919), nz2 = H.makeNoise(67);
      const mono = (str, x, y, size, weight, col, track, align = 'center', a = 1) => {
        if (a <= 0) return 0; ctx.globalAlpha = a; ctx.font = `${weight} ${size}px "Space Mono"`; ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        let w = 0; for (const ch of str) w += ctx.measureText(ch).width + track; w -= track;
        let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
        for (const ch of str) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + track; }
        ctx.globalAlpha = 1; return w;
      };
      const arrow = (x0, y0, x1, y1, p, col = FG, lw = 2) => {
        if (p <= 0) return; const ex = H.lerp(x0, x1, p), ey = H.lerp(y0, y1, p);
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(ex, ey); ctx.stroke();
        if (p > 0.95) { const a = Math.atan2(y1 - y0, x1 - x0); ctx.beginPath(); ctx.moveTo(x1 - Math.cos(a - 0.45) * 12, y1 - Math.sin(a - 0.45) * 12); ctx.lineTo(x1, y1); ctx.lineTo(x1 - Math.cos(a + 0.45) * 12, y1 - Math.sin(a + 0.45) * 12); ctx.stroke(); }
      };
      const trace = (xa, xb, y, k, peaks, noiseAmt, row, sweep = 1, lw = 1.25, col = FG) => {
        if (sweep <= 0) return;
        const pts = [], BWd = xb - xa, n = Math.ceil(BWd / 1.5);
        for (let i = 0; i <= n * sweep; i++) {
          const u = i / n, x = xa + u * BWd;
          const env = Math.pow(Math.sin(Math.PI * H.clamp((u - 0.12) / 0.76)), 1.4);
          let a = 0; for (const p of peaks) { const d = (u - p.u) / p.s; a += p.h * Math.exp(-0.5 * d * d); }
          a = a * env + nz.n3(u * 380 * 0.32, row * 0.9, t * 0.8) * (0.9 + env * 3 * noiseAmt) + nz2.n3(u * 380 * 0.06, row * 0.45, t * 0.3) * env * 9 * noiseAmt;
          pts.push([x, y - Math.max(-2, a) * k]);
        }
        if (pts.length < 2) return pts;
        const xe = pts[pts.length - 1][0];
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts) ctx.lineTo(p[0], p[1]);
        ctx.lineTo(xe, y + 40 * k); ctx.lineTo(xa, y + 40 * k); ctx.closePath(); ctx.fillStyle = BGC; ctx.fill();
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts) ctx.lineTo(p[0], p[1]);
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke();
        if (sweep < 1) { const [hx, hy] = pts[pts.length - 1]; const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 7); g.addColorStop(0, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, 7, 0, 7); ctx.fill(); }
        return pts;
      };
      const U_DOG = 0.36, U_CAT = 0.64;
      // explainer stack: bigger than the still so it fills the video frame
      const N = 60, gap = 7.6, SX0 = 330, SX1 = 910, SK = 1.35, STOP = 140;
      const rowPeaks = (i) => {
        const r = H.rng(1000 + i), c = Math.pow(i / (N - 1), 0.8), pk = [];
        const np = Math.round(H.lerp(5, 0, c));
        for (let k = 0; k < np; k++) pk.push({ u: r.range(0.25, 0.75), s: r.range(0.012, 0.04), h: r.range(6, 40) * (1 - c) });
        pk.push({ u: U_DOG + r.gauss() * 0.01, s: 0.03, h: 40 * (1 - c) * r.range(0.5, 1) });
        pk.push({ u: U_CAT + r.gauss() * 0.012 * (1 - c), s: H.lerp(0.035, 0.022, c), h: H.lerp(15, 62, c) * r.range(0.85, 1.0) });
        return pk;
      };

      // ================= HOOK =================
      if (t < 2.6) {
        ctx.globalAlpha = 1 - S(2.0, 2.5);
        trace(120, 1160, 520, 3.0, [{ u: 0.5, s: 0.03, h: 40 }, { u: 0.44, s: 0.02, h: 18 }], 1, 7, H.ease.inOut(S(0, 1.4)), 2.2);
        ctx.globalAlpha = 1;
      }
      {
        const d = H.ease.inOut(S(1.6, 2.4));
        mono('HOW DOES AI LEARN?', H.lerp(W / 2, 40, d), H.lerp(250, 52, d), H.lerp(56, 24, d), 700, FG, H.lerp(8, 3, d), d > 0.5 ? 'left' : 'center', S(0.1, 0.5));
        mono('one signal, read sixty times', W / 2, 310, 26, 400, 'rgba(242,240,234,0.55)', 1.5, 'center', S(0.6, 1.0) * (1 - d));
      }

      // ================= DATA =================
      const dataA = S(2.4, 2.8) * (1 - S(6.0, 6.4));
      if (dataA > 0) {
        ctx.globalAlpha = dataA;
        const DX0 = 640, DX1 = 1200, DT = 130, DG = 6.4;   // empty stack sits right; counter left
        for (let i = 0; i < N; i++) { ctx.fillStyle = 'rgba(242,240,234,0.24)'; ctx.fillRect(DX0, DT + i * DG, (DX1 - DX0) * H.ease.out(S(2.5 + i * 0.008, 3.0 + i * 0.008)), 1); }
        mono('the model', (DX0 + DX1) / 2, DT - 22, 28, 700, FG, 2, 'center', S(3.0, 3.4));
        mono('(still empty)', (DX0 + DX1) / 2, DT + 200, 24, 400, 'rgba(242,240,234,0.4)', 1, 'center', S(3.0, 3.4));
        // tape
        const ty = 640, speed = 170;
        const pr = H.rng(77);
        const pulses = []; for (let k = 0; k < 14; k++) pulses.push({ x0: k * 100, cat: pr.chance(0.5), h: pr.range(30, 48) });
        const PX = (p) => ((p.x0 - (t - 2.5) * speed) % 1400 + 1400) % 1400 - 60;
        const pts = [];
        for (let x = 0; x <= W; x += 2) {
          let a = nz.n3(x * 0.3, 3, t * 2) * 1.2;
          for (const p of pulses) { const d = (x - PX(p)) / 6; if (Math.abs(d) < 6) a += p.h * Math.exp(-0.5 * d * d); }
          pts.push([x, ty - a]);
        }
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * H.ease.out(S(2.4, 3.0)), H_); ctx.clip();
        ctx.strokeStyle = FG; ctx.lineWidth = 1.8; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
        for (const p of pulses) { const px = PX(p); if (px < 30 || px > W - 30) continue; mono(p.cat ? 'cat' : 'dog', px, ty + 34, 24, 700, p.cat ? FG : 'rgba(242,240,234,0.55)', 1, 'center'); }
        ctx.restore();
        // hairline arrow: tape → model
        arrow(920, ty - 60, 920, DT + (N - 1) * DG + 14, S(3.3, 3.9));
        mono('examples in', 936, ty - 74, 24, 400, DIM, 1, 'left', S(3.6, 4.0));
        // hero counter
        const n = Math.round(1e6 * H.ease.inOut(S(2.8, 5.8)));
        mono(n.toLocaleString('en-US'), 40, 380, 70, 700, FG, 0, 'left');
        mono('LABELLED EXAMPLES', 44, 420, 22, 400, DIM, 3, 'left');
        ctx.globalAlpha = 1;
      }

      // ================= LOOP =================
      const LX0 = 260, LX1 = 1060, LY = [250, 410, 570], LK = 2.0;
      const morph = H.ease.inOut(S(10.6, 11.4));
      const loopA = S(6.3, 6.6);
      if (loopA > 0) {
        const ax0 = H.lerp(LX0, SX0, morph), ax1 = H.lerp(LX1, SX1, morph), ay = H.lerp(630, STOP + (N - 1) * gap + 26, morph);
        ctx.globalAlpha = loopA;
        ctx.fillStyle = 'rgba(242,240,234,0.4)'; ctx.fillRect(ax0, ay, ax1 - ax0, 1.5);
        [[U_DOG, 'dog'], [U_CAT, 'cat']].forEach(([u, s]) => { const x = H.lerp(ax0, ax1, u); ctx.fillRect(x - 0.75, ay, 1.5, 9); mono(s, x, ay + 38, H.lerp(30, 26, morph), 700, FG, 2, 'center'); });
        ctx.globalAlpha = 1;
        const rowLabel = ['guess', 'check', 'adjust'];
        const adjMove = H.ease.inOut(S(9.0, 9.9));
        const loopPeaks = [
          [{ u: U_DOG, s: 0.03, h: 46 }, { u: 0.55, s: 0.02, h: 10 }],
          [{ u: U_DOG, s: 0.03, h: 46 }, { u: 0.55, s: 0.02, h: 10 }],
          [{ u: H.lerp(U_DOG, U_CAT, adjMove), s: 0.03, h: 50 }],
        ];
        const starts = [6.6, 8.1, 8.9];
        for (let r = 0; r < 3; r++) {
          const sw = H.ease.inOut(S(starts[r], starts[r] + 0.6)); if (sw <= 0) continue;
          const xa = H.lerp(LX0, SX0, morph), xb = H.lerp(LX1, SX1, morph), y = H.lerp(LY[r], STOP + r * gap, morph), k = H.lerp(LK, SK, morph);
          trace(xa, xb, y, k, loopPeaks[r], 0.5, r, sw, H.lerp(2.2, 1.4, morph));
          mono(rowLabel[r], xa - 24, y + 8, 30, 700, r === (t < 8.1 ? 0 : t < 8.9 ? 1 : 2) ? FG : 'rgba(242,240,234,0.4)', 2, 'right', 1 - morph);
        }
        const fade = 1 - morph;
        if (fade > 0) {
          const X = (u) => H.lerp(LX0, LX1, u);
          const g = S(7.1, 7.4) * fade * (1 - S(8.0, 8.2) * 0.5);
          if (g > 0) {
            const w = mono('“dog?”', X(U_DOG), LY[0] - 120, 34, 700, FG, 2, 'center', g);
            ctx.globalAlpha = g; ctx.strokeStyle = FG; ctx.lineWidth = 3; const xx = X(U_DOG) + w / 2 + 14, xy = LY[0] - 146;
            ctx.beginPath(); ctx.moveTo(xx, xy); ctx.lineTo(xx + 22, xy + 22); ctx.moveTo(xx + 22, xy); ctx.lineTo(xx, xy + 22); ctx.stroke();
            const rp = S(7.4, 7.9); ctx.lineWidth = 2; ctx.beginPath();
            for (let q = 0; q <= 60 * rp; q++) { const a = -1.9 + q / 60 * 6.8, rr = 1 + q * 0.0015; const px = X(U_DOG) + Math.cos(a) * 54 * rr, py = LY[0] - 52 + Math.sin(a) * 66 * rr; q ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
            ctx.stroke(); ctx.globalAlpha = 1;
          }
          const c = S(8.3, 8.7) * fade;
          if (c > 0) {
            ctx.globalAlpha = c; ctx.setLineDash([6, 6]); ctx.strokeStyle = FG; ctx.lineWidth = 2; ctx.beginPath();
            for (let q = 0; q <= 80; q++) { const u = U_CAT - 0.09 + q / 80 * 0.18, d = (u - U_CAT) / 0.03; const y = LY[1] - 50 * LK * Math.exp(-0.5 * d * d); q ? ctx.lineTo(X(u), y) : ctx.moveTo(X(u), y); }
            ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
            mono('answer: cat', X(U_CAT) + 70, LY[1] - 80, 28, 700, FG, 1.5, 'left', c);
            const e = S(8.6, 9.0) * fade;
            if (e > 0) { const y = LY[1] - 46; arrow(X(U_DOG) + 34, y, X(U_CAT) - 34, y, e, FG, 2.4); mono('error', (X(U_DOG) + X(U_CAT)) / 2, y - 14, 26, 700, 'rgba(242,240,234,0.85)', 2, 'center', e); }
          }
          const ad = S(9.0, 9.3) * fade * (1 - S(9.9, 10.1));
          if (ad > 0) mono('shift the weights →', X(0.5), LY[2] + 40, 26, 400, 'rgba(242,240,234,0.85)', 1.5, 'center', ad);
          const ok = S(9.9, 10.2) * fade;
          if (ok > 0) {
            const w = mono('“cat”', X(U_CAT) + 64, LY[2] - 50, 34, 700, FG, 2, 'left', ok);
            ctx.globalAlpha = ok; ctx.strokeStyle = FG; ctx.lineWidth = 3; ctx.lineJoin = 'round'; const xx = X(U_CAT) + 64 + w + 14, xy = LY[2] - 72;
            ctx.beginPath(); ctx.moveTo(xx, xy + 10); ctx.lineTo(xx + 8, xy + 20); ctx.lineTo(xx + 26, xy - 4); ctx.stroke(); ctx.globalAlpha = 1;
          }
          const la = S(10.0, 10.4) * fade;
          if (la > 0) {
            ctx.globalAlpha = la; ctx.strokeStyle = 'rgba(242,240,234,0.7)'; ctx.lineWidth = 2;
            const lx = LX0 - 150;
            ctx.beginPath(); ctx.moveTo(lx + 20, LY[2]); ctx.lineTo(lx, LY[2]); ctx.lineTo(lx, LY[0]); ctx.lineTo(lx + 16, LY[0]); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(lx + 8, LY[0] - 7); ctx.lineTo(lx + 16, LY[0]); ctx.lineTo(lx + 8, LY[0] + 7); ctx.stroke();
            ctx.save(); ctx.translate(lx - 14, (LY[0] + LY[2]) / 2); ctx.rotate(-Math.PI / 2); mono('repeat', 0, 0, 24, 700, 'rgba(242,240,234,0.75)', 3, 'center'); ctx.restore(); ctx.globalAlpha = 1;
          }
        }
      }

      // ================= PROGRESS =================
      if (t >= 11.2) {
        for (let i = 3; i < N; i++) {
          const sw = H.clamp((t - (11.3 + (i - 3) * 0.026)) / 0.22);
          if (sw <= 0) break;
          trace(SX0, SX1, STOP + i * gap, SK, rowPeaks(i), H.lerp(1, 0.25, i / N), i, sw, i === N - 1 && t > 13.0 ? 2.6 : 1.4);
        }
        // the answer axis, redrawn over the occluding fills of the last rounds
        { const ay = STOP + (N - 1) * gap + 26; ctx.fillStyle = BGC; ctx.fillRect(SX0 - 10, ay - 2, SX1 - SX0 + 20, 48); ctx.fillStyle = 'rgba(242,240,234,0.4)'; ctx.fillRect(SX0, ay, SX1 - SX0, 1.5);
          [[U_DOG, 'dog'], [U_CAT, 'cat']].forEach(([u, s]) => { const x = H.lerp(SX0, SX1, u); ctx.fillRect(x - 0.75, ay, 1.5, 9); mono(s, x, ay + 38, 26, 700, FG, 2, 'center', 1 - 0.5 * S(13.3, 13.8)); }); }
        mono('round 1', SX0 - 16, STOP + 8, 24, 400, 'rgba(242,240,234,0.72)', 1, 'right', S(11.4, 11.7));
        mono('round 60', SX0 - 16, STOP + (N - 1) * gap + 8, 24, 400, 'rgba(242,240,234,0.72)', 1, 'right', S(12.7, 13.0));
        const p = H.ease.inOut(S(11.3, 12.8));
        mono('ACCURACY', SX1 + 34, 300, 22, 400, DIM, 3, 'left');
        mono(Math.round(61 + 36 * p) + '%', SX1 + 30, 376, 84, 700, FG, 0, 'left');
        const e = S(12.9, 13.4);
        if (e > 0) {
          ctx.fillStyle = FG; ctx.fillRect(SX1 + 34, 394, 170 * e, 3);
          ctx.globalAlpha = e; ctx.strokeStyle = FG; ctx.lineWidth = 2;
          const y = STOP + (N - 1) * gap; ctx.beginPath(); ctx.moveTo(SX1 + 12, y - 90); ctx.lineTo(SX1 + 20, y - 90); ctx.lineTo(SX1 + 20, y + 2); ctx.lineTo(SX1 + 12, y + 2); ctx.stroke();
          mono('one clean', SX1 + 34, y - 52, 24, 700, FG, 1, 'left'); mono('peak: cat', SX1 + 34, y - 22, 24, 700, FG, 1, 'left'); ctx.globalAlpha = 1;
        }
      }
      // ================= TAKEAWAY =================
      mono('MORE EXAMPLES → BETTER GUESSES', W / 2, 694, 44, 700, FG, 1, 'center', S(13.3, 13.8));

      printFinish(ctx, 0.06, 8 + Math.floor(t * 12));
    },
  });
}
```
