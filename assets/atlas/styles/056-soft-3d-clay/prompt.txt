I want an animated explainer made in the "Soft 3D Clay" visual style (Dimensional). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Fredoka
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=block">
- Expose `window.seek = (t) => { /* draw frame at time t */ }`, `window.DURATION` and `window.scoreSound`, so the animation can be rendered frame by frame to video later.

HOW TO STAY IN THE STYLE
- Reuse the reference's rendering techniques, palette, textures, lettering, line quality, arrows, labels, number treatment, transitions and timing feel. Change the story, the text and the things being drawn; do not change the medium.
- Draw every subject accurately for my topic. Don't carry over the reference's props and drawing recipes (its characters, robots, cats and dogs, rings, icons) unless they genuinely fit, and double-check that the science and facts shown in the visuals are right.
- The surface texture and finishing passes are what make the style read as the real medium (paper grain, ink pooling, misregistration, grain, glow, scanlines and so on). Copy those functions from the reference and run them on every frame at the same strength. Don't simplify or skip them to save effort.
- Every frame is a pure function of t: create all randomness from H.rng(seed) / H.makeNoise(seed) inside the draw (never Math.random), so the same t always gives the same frame. Caching static textures across frames is fine.
- It is video, often watched on a phone: at 1280x720 keep headlines >= 44px, every label or caption the story depends on >= 28px (including small annotations and the corner header), key numbers >= 64px, and frame each beat so it fills most of the screen. Keep frames fast (well under 100 ms each if you can).
- In the reference, `explainer()` is the explainer (it explains "How does AI learn?"), `draw()` is the single hero frame of the style. Study them, but do not reuse that topic unless my content asks for it.

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
Name: Soft 3D Clay
Family: Dimensional
Look: Dribbble-style “puffy” 3D icons: pastel matte-clay objects with chunky rounded extrusions, soft core shadows, bright bounce-light rims, glossy specular blobs and blurry contact shadows on a seamless pastel sweep.
Motion: Clay icons drop in one by one on springy squash-and-stretch with their contact shadows growing beneath them, the bulb flickers on, then the cursor flies in and taps the bubble while everything bobs at different depths.
How it explains: The camera dollies across one wide pastel set with parallax depth-of-field (cards → clay chip with weight sliders → answer bubble → clay bar chart → pull back), arrows are puffy clay tubes with blobby heads, labels are squishy pills that spring onto objects, and numbers count inside butter-yellow clay badges.

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

REFERENCE STYLE SOURCE (styles/soft-3d.js; W/H_ are always 1280x720)
```js
{
  // ---------- soft "clay" 3D faked in 2D: extrusion + gradient face + inner shadows + rim + specular ----------
  // rounded polygon with per-vertex radius (pts: [x,y,r])
  function roundedPoly(pts) {
    const p = new Path2D();
    const n = pts.length;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const start = mid(pts[n - 1], pts[0]);
    p.moveTo(start[0], start[1]);
    for (let i = 0; i < n; i++) {
      const c = pts[i], nx = pts[(i + 1) % n];
      const m = mid(c, nx);
      p.arcTo(c[0], c[1], m[0], m[1], c[2] || 0);
    }
    p.closePath();
    return p;
  }
  // inner shadow: the casting fill is pushed far off-canvas in device space so only its shadow lands (no hairline)
  function innerShadow(ctx, path, rule, bb, color, blur, dx, dy) {
    const OFF = 5000;
    ctx.save();
    ctx.clip(path, rule);
    const p2 = new Path2D();
    const m = 400;
    p2.rect(bb[0] - m, bb[1] - m, bb[2] - bb[0] + 2 * m, bb[3] - bb[1] + 2 * m);
    p2.addPath(path);
    const M = ctx.getTransform();
    ctx.setTransform(new DOMMatrix().translate(OFF, 0).multiply(M));
    ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.shadowOffsetX = dx - OFF; ctx.shadowOffsetY = dy;
    ctx.fillStyle = '#000';
    ctx.fill(p2, 'evenodd');
    ctx.restore();
  }
  let EXT = null;
  // o: {x,y,rot,s, path, rule, bb, face:[light,mid,dark], side:[light,dark], ext:[ex,ey], spec:[x,y,rx,ry]}
  function puffy(ctx, o) {
    const rule = o.rule || 'nonzero';
    const [ex, ey] = o.ext;
    const n = Math.ceil(Math.hypot(ex, ey) * 1.5);
    const W = ctx.canvas.width, Hh = ctx.canvas.height;
    const base = ctx.getTransform();
    let lc = ctx;
    if (!o.fast) {
      if (!EXT || EXT.width !== W) EXT = H.layer(W, Hh);
      lc = EXT.getContext('2d');
      lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, W, Hh);
    } else ctx.save();
    const bounce = H.mix(o.side[0], '#ffffff', 0.35);
    for (let i = n; i >= 1; i--) {
      const k = i / n;
      lc.setTransform(base); lc.translate(o.x + ex * k, o.y + ey * k); lc.rotate(o.rot || 0); lc.scale(o.s, o.s);
      const c = k > 0.86 ? H.mix(o.side[1], bounce, (k - 0.86) / 0.14) : k < 0.25 ? H.mix(o.face[2], o.side[0], k / 0.25) : H.mix(o.side[0], o.side[1], (k - 0.25) / 0.61);
      lc.fillStyle = H.rgba(c);
      lc.fill(o.path, rule);
    }
    if (!o.fast) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'blur(1.4px)'; ctx.drawImage(EXT, 0, 0); ctx.restore(); }
    else { ctx.restore(); ctx.setTransform(base); }
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot || 0); ctx.scale(o.s, o.s);
    const bb = o.bb;
    const g = ctx.createLinearGradient(bb[0], bb[1], bb[2], bb[3]);
    g.addColorStop(0, H.rgba(o.face[0])); g.addColorStop(0.5, H.rgba(o.face[1])); g.addColorStop(1, H.rgba(o.face[2]));
    ctx.fillStyle = g; ctx.fill(o.path, rule);
    const S = o.s * Math.hypot(base.a, base.b);
    innerShadow(ctx, o.path, rule, bb, H.rgba(o.side[1], 0.5), 40 * S, -16 * S, -20 * S); // core shadow toward bottom-right
    innerShadow(ctx, o.path, rule, bb, H.rgba(o.side[0], 0.35), 14 * S, 0, 0);            // rounded falloff at every edge
    innerShadow(ctx, o.path, rule, bb, 'rgba(255,255,255,0.72)', 26 * S, 12 * S, 14 * S);  // soft top-left highlight
    if (o.spec) {
      ctx.save(); ctx.clip(o.path, rule);
      const [sx, sy, rx, ry] = o.spec;
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, rx);
      sg.addColorStop(0, 'rgba(255,255,255,0.95)'); sg.addColorStop(0.35, 'rgba(255,255,255,0.45)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.translate(sx, sy); ctx.scale(1, ry / rx); ctx.translate(-sx, -sy);
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, sy, rx, 0, 7); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  function sphere(ctx, x, y, r, light, mid, dark) {
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r * 1.05);
    g.addColorStop(0, H.rgba(light)); g.addColorStop(0.55, H.rgba(mid)); g.addColorStop(1, H.rgba(dark));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    const p = new Path2D(); p.arc(x, y, r, 0, 7);
    innerShadow(ctx, p, 'nonzero', [x - r, y - r, x + r, y + r], H.rgba(H.mix(light, '#ffffff', 0.5), 0.8), r * 0.12, -r * 0.05, -r * 0.06);
    const s = ctx.createRadialGradient(x - r * 0.38, y - r * 0.45, 0, x - r * 0.38, y - r * 0.45, r * 0.42);
    s.addColorStop(0, 'rgba(255,255,255,0.9)'); s.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = s; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  function contactShadow(ctx, x, y, w, h, alpha, blur) {
    ctx.save(); ctx.filter = `blur(${blur}px)`;
    ctx.fillStyle = `rgba(110,80,170,${alpha})`;
    ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, 0, 7); ctx.fill();
    ctx.filter = `blur(${blur * 0.4}px)`; ctx.fillStyle = `rgba(90,60,150,${alpha * 0.8})`;
    ctx.beginPath(); ctx.ellipse(x, y, w * 0.55, h * 0.45, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  // ---------- shapes (local coords) ----------
  const bubblePath = () => roundedPoly([[-170, -115, 78], [170, -115, 78], [170, 95, 70], [-40, 95, 22], [-120, 160, 12], [-100, 95, 16], [-170, 95, 60]]);
  const BUBBLE_BB = [-170, -115, 170, 160];
  function gearPath(R, teeth, holeR) {
    const pts = [];
    const r0 = R * 0.78;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2, w = (Math.PI * 2) / teeth;
      pts.push([Math.cos(a - w * 0.5) * r0, Math.sin(a - w * 0.5) * r0, R * 0.12]);
      pts.push([Math.cos(a - w * 0.2) * R, Math.sin(a - w * 0.2) * R, R * 0.1]);
      pts.push([Math.cos(a + w * 0.2) * R, Math.sin(a + w * 0.2) * R, R * 0.1]);
    }
    const p = roundedPoly(pts);
    p.moveTo(holeR, 0); p.arc(0, 0, holeR, 0, Math.PI * 2, true); p.closePath();
    return p;
  }
  const cursorPath = () => roundedPoly([[0, 0, 10], [0, 150, 12], [38, 114, 8], [64, 168, 10], [92, 154, 10], [66, 102, 8], [114, 102, 12]]);
  const CURSOR_BB = [0, 0, 114, 168];
  function bulbGlassPath(r) {
    const p = new Path2D();
    // glass: big circle flowing into a neck
    p.moveTo(-r * 0.5, r * 0.95);
    p.bezierCurveTo(-r * 0.55, r * 0.6, -r, r * 0.45, -r, -0.05 * r);
    p.arc(0, -0.05 * r, r, Math.PI, 0);
    p.bezierCurveTo(r, r * 0.45, r * 0.55, r * 0.6, r * 0.5, r * 0.95);
    p.closePath();
    return p;
  }
  function ringPath(R, r) {
    const p = new Path2D();
    p.ellipse(0, 0, R, R * 0.42, 0, 0, Math.PI * 2);
    p.moveTo(r, 0); p.ellipse(0, 0, r, r * 0.36, 0, 0, Math.PI * 2, true);
    return p;
  }

  // ================= EXPLAINER: a wide pastel set the camera dollies across (with parallax), clay props springing in =================
  const HX = (h) => H.hex(h);
  const PAL = {
    lav: { face: [HX('#e6e0ff'), HX('#b9abff'), HX('#9a88f5')], side: [HX('#8f7cf0'), HX('#5d48c2')] },
    peach: { face: [HX('#fff0e6'), HX('#ffcfb3'), HX('#ffad8a')], side: [HX('#f79d7a'), HX('#cf6b4f')] },
    mint: { face: [HX('#e6fff6'), HX('#b3eedb'), HX('#86d7bf')], side: [HX('#7fcbb3'), HX('#4f9f8a')] },
    white: { face: [HX('#ffffff'), HX('#f7f3ff'), HX('#e2d9fb')], side: [HX('#d4c8f5'), HX('#9a87de')] },
    pink: { face: [HX('#ffe3ea'), HX('#ffb1c2'), HX('#ff8fa8')], side: [HX('#f57f9b'), HX('#cc4f72')] },
    blue: { face: [HX('#e3f1ff'), HX('#b4d6ff'), HX('#8fbaf5')], side: [HX('#86b0ee'), HX('#5a7fc7')] },
    coral: { face: [HX('#ffd9d2'), HX('#ff8f7e'), HX('#f2675a')], side: [HX('#e85d4f'), HX('#b23a33')] },
    butter: { face: [HX('#fffbe0'), HX('#ffe58f'), HX('#f7c45e')], side: [HX('#f2b955'), HX('#d98f3a')] },
  };
  const pill = (w, h) => roundedPoly([[-w / 2, -h / 2, h / 2], [w / 2, -h / 2, h / 2], [w / 2, h / 2, h / 2], [-w / 2, h / 2, h / 2]]);
  const rrect = (w, h, r) => roundedPoly([[-w / 2, -h / 2, r], [w / 2, -h / 2, r], [w / 2, h / 2, r], [-w / 2, h / 2, r]]);
  function clay(ctx, path, bb, x, y, pal, o = {}) {
    puffy(ctx, { x, y, rot: o.rot || 0, s: o.s || 1, path, bb, face: pal.face, side: pal.side, ext: o.ext || [6, 11], spec: o.spec, fast: o.fast, z: o.z });
  }
  function clayPet(ctx, kind, x, y, r) {
    const fur = kind === 'cat' ? [HX('#efeaff'), HX('#c4b8ff'), HX('#9a88f5')] : [HX('#fff1e2'), HX('#ffcf9e'), HX('#e9a46a')];
    ctx.save();
    if (kind === 'cat') for (const sx of [-1, 1]) { const g = ctx.createLinearGradient(x, y - r * 1.2, x, y); g.addColorStop(0, H.rgba(fur[0])); g.addColorStop(1, H.rgba(fur[2])); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + sx * 0.88 * r, y - 0.15 * r); ctx.quadraticCurveTo(x + sx * 0.8 * r, y - 1.25 * r, x + sx * 0.6 * r, y - 1.12 * r); ctx.quadraticCurveTo(x + sx * 0.3 * r, y - 0.95 * r, x + sx * 0.1 * r, y - 0.8 * r); ctx.closePath(); ctx.fill(); }
    else for (const sx of [-1, 1]) { ctx.fillStyle = H.rgba(H.mix(fur[2], '#8a5a3b', 0.3)); ctx.beginPath(); ctx.ellipse(x + sx * 0.9 * r, y + 0.05 * r, 0.3 * r, 0.62 * r, sx * 0.35, 0, 7); ctx.fill(); }
    sphere(ctx, x, y, r, fur[0], fur[1], fur[2]);
    ctx.fillStyle = '#3b2f5c';
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + sx * 0.36 * r, y - 0.08 * r, r * 0.1, r * 0.14, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + sx * 0.36 * r - r * 0.03, y - 0.13 * r, r * 0.035, 0, 7); ctx.fill(); ctx.fillStyle = '#3b2f5c'; }
    ctx.fillStyle = 'rgba(255,120,150,0.45)'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + sx * 0.6 * r, y + 0.22 * r, r * 0.15, r * 0.09, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = kind === 'cat' ? '#ff8fa8' : '#3b2f5c'; ctx.beginPath(); ctx.ellipse(x, y + 0.2 * r, r * (kind === 'cat' ? 0.09 : 0.16), r * (kind === 'cat' ? 0.07 : 0.11), 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  function clayLabel(ctx, x, y, text, pal, o = {}) {
    const k = o.k ?? 1; if (k <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.font = o.font || '700 28px "Fredoka"';
    const fsz = parseInt((ctx.font.match(/(\d+)px/) || [0, 28])[1]);
    const w = ctx.measureText(text).width + (o.padX || fsz * 1.5), h = o.h || Math.round(fsz * 1.8);
    clay(ctx, pill(w, h), [-w / 2, -h / 2, w / 2, h / 2], 0, 0, pal, { ext: [3, 6], fast: true, z: o.z });
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const col = o.col || '#4a3a8a';
    if (col === '#fff') { ctx.fillStyle = 'rgba(70,45,170,0.32)'; ctx.fillText(text, fsz * 0.06, 2 + fsz * 0.09); } // pressed-in ink shadow, like the bubble text
    else { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillText(text, 0, 3.5); }                                 // dark text: soft lower highlight (debossed)
    ctx.fillStyle = col; ctx.fillText(text, 0, 2);
    ctx.restore();
  }
  function clayTube(ctx, a, c, b, prog, pal, w = 14) {
    if (prog <= 0) return null;
    const q = (u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
    const N = 36, pts = []; for (let i = 0; i <= N; i++) pts.push(q(prog * i / N * 0.93));
    const path = (off) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0] + off[0], p[1] + off[1]) : ctx.moveTo(p[0] + off[0], p[1] + off[1])); };
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(90,60,150,0.18)'; ctx.lineWidth = w; path([3, 7]); ctx.stroke();
    ctx.strokeStyle = H.rgba(pal.side[1]); ctx.lineWidth = w; path([0, 0]); ctx.stroke();
    ctx.strokeStyle = H.rgba(pal.face[1]); ctx.lineWidth = w * 0.72; path([-w * 0.1, -w * 0.12]); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = w * 0.2; path([-w * 0.2, -w * 0.25]); ctx.stroke();
    const e = q(prog), e0 = q(Math.max(0, prog - 0.05)), ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
    ctx.restore();
    const hp = roundedPoly([[w * 1.3, 0, w * 0.35], [-w * 0.9, -w * 1.15, w * 0.35], [-w * 0.9, w * 1.15, w * 0.35]]);
    clay(ctx, hp, [-w, -w, w, w], e[0], e[1], pal, { rot: ang, ext: [3, 6], fast: true });
    return q;
  }
  let FG_SPHERE = null;
  function fgSphere() { // the hero's blurred foreground sphere, baked once
    if (FG_SPHERE) return FG_SPHERE;
    const a = H.layer(320, 320), ac = a.getContext('2d');
    sphere(ac, 160, 160, 100, HX('#f3eeff'), HX('#d4c8ff'), HX('#a998ec'));
    const b = H.layer(320, 320), bc = b.getContext('2d');
    bc.filter = 'blur(9px)'; bc.drawImage(a, 0, 0);
    return (FG_SPHERE = b);
  }
  function softExplainer(ctx, W, H_, t) {
    const ph = (a, b) => H.clamp((t - a) / (b - a));
    const E = (a, b) => H.ease.inOut(ph(a, b));
    const EO = (a, b) => H.ease.out(ph(a, b));
    const spring = (t0, d = 0.8) => { const p = ph(t0, t0 + d); if (p <= 0) return 0; return p >= 1 ? 1 : 1 - Math.exp(-6.5 * p) * Math.cos(10 * p); };
    const INK = '#4a3a8a';
    // ---------- camera: [t, centreX, centreY, zoom] over a wide set ----------
    const KF = [[0, 640, 360, 1], [1.6, 640, 360, 1], [2.8, 980, 360, 1], [5.8, 1020, 360, 1], [6.8, 1560, 360, 1], [10.2, 1580, 360, 1], [11.1, 2560, 360, 1], [12.8, 2580, 360, 1], [13.8, 1790, 400, 0.44], [20, 1790, 400, 0.44]];
    let k = 0; while (k < KF.length - 2 && t > KF[k + 1][0]) k++;
    const A = KF[k], B = KF[k + 1], u = H.ease.inOut(H.clamp((t - A[0]) / (B[0] - A[0])));
    const camX = H.lerp(A[1], B[1], u), camY = H.lerp(A[2], B[2], u), zoom = H.lerp(A[3], B[3], u);
    const bob = (p, a) => Math.sin(t * 1.6 + p) * a;
    const FLOOR = 610;

    // ---------- seamless cyclorama (screen space) + parallax far props ----------
    const bg = ctx.createLinearGradient(0, 0, 0, H_);
    bg.addColorStop(0, '#f3ecff'); bg.addColorStop(0.5, '#e8dffb'); bg.addColorStop(0.62, '#dccff5'); bg.addColorStop(0.78, '#e6dcf9'); bg.addColorStop(1, '#efe7fe');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
    const glow = ctx.createRadialGradient(W * 0.5, H_ * 0.35, 40, W * 0.5, H_ * 0.35, 700);
    glow.addColorStop(0, 'rgba(255,250,255,0.8)'); glow.addColorStop(1, 'rgba(255,250,255,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H_);
    const world = (c, par = 1) => { c.translate(W / 2, H_ / 2); c.scale(zoom, zoom); c.translate(-camX * par, -camY); };
    {
      const far = H.layer(W, H_), fc = far.getContext('2d');
      fc.save(); world(fc, 0.6);
      const fr = H.rng(3);
      for (let i = 0; i < 16; i++) { const x = i * 260 + fr() * 120, y = 90 + fr() * 200, r = 12 + fr() * 22; const p = fr.pick([[HX('#fff6c7'), HX('#ffe08a'), HX('#f3b860')], [HX('#d8f5ec'), HX('#a6e3d2'), HX('#6cbfb0')], [HX('#f3eeff'), HX('#d4c8ff'), HX('#a998ec')], [HX('#ffe3ea'), HX('#ffb1c2'), HX('#ff8fa8')]]); sphere(fc, x, y + bob(i, 6), r, ...p); }
      fc.restore();
      ctx.save(); ctx.filter = 'blur(3px)'; ctx.drawImage(far, 0, 0); ctx.restore();
    }
    ctx.save(); world(ctx);
    const Z = zoom;
    // warm key-light glows behind each prop as it arrives (the hero's lit-bulb aura)
    const keyGlow = (x, y, r, a) => {
      a = H.clamp(a); if (a <= 0.01) return;
      const g = ctx.createRadialGradient(x, y, r * 0.06, x, y, r);
      g.addColorStop(0, `rgba(255,214,120,${0.26 * a})`); g.addColorStop(0.45, `rgba(255,222,160,${0.11 * a})`); g.addColorStop(1, 'rgba(255,230,180,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    };
    keyGlow(1330, 330, 340, spring(1.0, 0.9));
    if (t > 6.8) keyGlow(1830, 260, 320, spring(6.9, 0.7));
    if (t > 10.5) keyGlow(2650, 330, 460, spring(10.5, 0.7));

    // ================= SET 1/2: data → the model (chip) =================
    const CHIP = [1350, 360 + bob(0.3, 6)];
    // contact shadows first
    contactShadow(ctx, CHIP[0] + 10, FLOOR, 150 * spring(1.0), 22, 0.3, 18);
    // data cards travelling into the chip (beat 2) + test card (beat 3)
    const cards = [];
    if (t > 2.3 && t < 6.5) for (let j = 0; j < 9; j++) {
      const p = (t - 2.3) * 0.36 - j * 0.15; if (p < 0 || p > 1) continue;
      cards.push({ p, kind: (j * 5 + 1) % 3 === 0 ? 'dog' : (j % 2 ? 'cat' : 'dog'), j });
    }
    const cardPos = (p) => { const x = H.lerp(560, CHIP[0] - 40, p), y = 420 - Math.sin(p * Math.PI) * 170 + (p > 0.85 ? (p - 0.85) * 300 * 0 : 0); return [x, y, 1 - H.smooth(0.75, 1, p) * 0.75]; };
    // big puffy tube path showing the flow
    if (t > 2.6 && t < 6.6) clayTube(ctx, [520, 470], [900, 140], [CHIP[0] - 150, 330], E(2.6, 3.5) * (1 - ph(6.2, 6.6)), PAL.white, 18);
    // pile of examples (grows) on the floor left
    {
      const n = Math.floor(1 + 7 * Math.pow(EO(2.6, 5.8), 1.1));
      const pk0 = spring(2.6, 0.6);
      if (pk0 > 0) contactShadow(ctx, 600 + Math.min(n, 3) * 38 + (n > 3 ? 9 : 0), FLOOR + 2, (40 + Math.min(n, 3) * 34) * Math.min(1, pk0), 11, 0.3, 9);
      for (let i = 0; i < n; i++) {
        const k2 = spring(2.6 + i * 0.4, 0.6); if (k2 <= 0) continue;
        const row = Math.floor(i / 3), x = 590 + (i % 3) * 76 + row * 18, y = FLOOR - 26 - row * 50;
        ctx.save(); ctx.translate(x, y); ctx.scale(k2, k2);
        clay(ctx, rrect(70, 46, 14), [-35, -23, 35, 23], 0, 0, i % 2 ? PAL.peach : PAL.lav, { ext: [3, 7], fast: true });
        ctx.restore();
      }
    }
    for (const cd of cards) {
      const [x, y, sc] = cardPos(cd.p);
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(Math.sin(cd.j * 1.7 + t * 2) * 0.12);
      clay(ctx, rrect(96, 96, 26), [-48, -48, 48, 48], 0, 0, PAL.white, { ext: [5, 9], fast: true });
      clayPet(ctx, cd.kind, 0, 4, 28);
      if (cd.p < 0.82) clayLabel(ctx, 30, -52, cd.kind, cd.kind === 'cat' ? PAL.lav : PAL.peach, { font: '700 28px "Fredoka"', col: '#fff' });
      ctx.restore();
    }
    let testPos = null;
    if (t > 5.9 && t < 7.2) {
      const p = E(5.9, 7.0); const [x, y, sc] = cardPos(p * 0.98); testPos = [x, y];
      ctx.save(); ctx.translate(x, y); ctx.scale(sc * 1.1, sc * 1.1);
      clay(ctx, rrect(96, 96, 26), [-48, -48, 48, 48], 0, 0, PAL.pink, { ext: [5, 9], fast: true });
      clayPet(ctx, 'cat', 0, 4, 28);
      clayLabel(ctx, 34, -54, '?', PAL.coral, { font: '700 28px "Fredoka"', col: '#fff' });
      ctx.restore();
    }
    // the chip (model) with three weight sliders on its face
    const ck = spring(1.0, 0.9);
    const adj = E(8.6, 9.3);
    const SL0 = [0.2, 0.78, 0.38], SL1 = [0.66, 0.3, 0.82];
    const jitter = t > 8.6 && t < 9.3 ? Math.sin(t * 40) * 0.03 : 0;
    if (ck > 0) {
      ctx.save(); ctx.translate(CHIP[0], CHIP[1] + 110); ctx.scale(ck, ck); ctx.translate(-CHIP[0], -(CHIP[1] + 110));
      // pins
      for (let i = 0; i < 4; i++) for (const [dx, dy, w, h] of [[-118, -66 + i * 44, 34, 16], [118, -66 + i * 44, 34, 16], [-66 + i * 44, -118, 16, 34], [-66 + i * 44, 118, 16, 34]]) clay(ctx, rrect(w, h, 7), [-w / 2, -h / 2, w / 2, h / 2], CHIP[0] + dx, CHIP[1] + dy, PAL.butter, { ext: [3, 6], fast: true });
      const err = ph(8.0, 8.4) * (1 - ph(9.0, 9.4));
      clay(ctx, rrect(220, 220, 50), [-110, -110, 110, 110], CHIP[0], CHIP[1], err > 0 ? { face: PAL.lav.face.map(c => H.mix(c, HX('#ff8f7e'), err * 0.6)), side: PAL.lav.side } : PAL.lav, { ext: [10, 18], spec: [-60, -62, 60, 30] });
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.font = '700 34px "Fredoka"'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText('AI', CHIP[0] - 82, CHIP[1] - 52.5);
      ctx.fillStyle = INK; ctx.fillText('AI', CHIP[0] - 82, CHIP[1] - 54);
      ctx.font = '600 22px "Fredoka"'; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillText('weights', CHIP[0] - 30, CHIP[1] - 55);
      ctx.fillStyle = 'rgba(74,58,138,0.85)'; ctx.fillText('weights', CHIP[0] - 30, CHIP[1] - 56);
      for (let i = 0; i < 3; i++) {
        const ty = CHIP[1] - 14 + i * 42;
        ctx.fillStyle = 'rgba(70,50,160,0.28)'; ctx.beginPath(); ctx.roundRect(CHIP[0] - 76, ty - 7, 152, 14, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.roundRect(CHIP[0] - 76, ty + 4, 152, 3, 2); ctx.fill();
        const v = H.lerp(SL0[i], SL1[i], adj) + jitter * (i + 1);
        sphere(ctx, CHIP[0] - 70 + v * 140, ty, 14, err > 0 && adj < 1 && t > 8.4 ? HX('#ffe3df') : HX('#ffffff'), err > 0 && t > 8.4 ? HX('#ffb3a6') : HX('#f2ecff'), HX('#b9a8f2'));
      }
      ctx.restore();
    }
    // counter badge
    if (t > 2.7 && t < 6.9) {
      const cnt = Math.floor(1e6 * Math.pow(EO(2.9, 5.7), 1.6));
      const kb = spring(2.7) * (1 - E(6.5, 6.9));
      ctx.save(); ctx.translate(980, 98); ctx.scale(kb, kb);
      clay(ctx, pill(540, 116), [-270, -58, 270, 58], 0, 0, PAL.butter, { ext: [6, 12], spec: [-150, -28, 90, 18] });
      ctx.font = '700 68px "Fredoka"'; ctx.fillStyle = '#8a5a1f'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(cnt.toLocaleString('en-US'), 88, 4);
      ctx.font = '700 34px "Fredoka"'; ctx.textAlign = 'left'; ctx.fillText('examples', 102, 10);
      ctx.restore();
    }
    if (t > 4.0 && t < 6.6) clayLabel(ctx, CHIP[0], CHIP[1] - 175, 'the model', PAL.lav, { k: spring(4.0) * (1 - E(6.3, 6.6)), col: '#fff' });

    // ================= SET 3: guess → check → adjust =================
    const BUB = [1840, 250 + bob(1.1, 6)];
    const wrong = t > 7.0 && t < 9.4, right = t >= 9.4;
    if (t > 6.8) {
      const bk = spring(6.9, 0.7);
      const sk = t > 7.4 && t < 7.8 ? Math.sin(t * 70) * 6 : 0;
      contactShadow(ctx, BUB[0] + 10, FLOOR, 120 * bk, 18, 0.22, 16);
      ctx.save(); ctx.translate(BUB[0] + sk, BUB[1] + 100); ctx.scale(bk * 0.82, bk * 0.82); ctx.translate(-BUB[0], -(BUB[1] + 100));
      const pal = right ? PAL.mint : wrong && t > 7.4 ? PAL.peach : PAL.white;
      clay(ctx, bubblePath(), BUBBLE_BB, BUB[0], BUB[1], pal, { ext: [10, 18], spec: [-95, -78, 85, 40] });
      clayPet(ctx, right ? 'cat' : 'dog', BUB[0] - 80, BUB[1] - 8, 46);
      ctx.font = '700 64px "Fredoka"'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(70,45,170,0.25)'; ctx.fillText(right ? 'cat' : 'dog?', BUB[0] - 16, BUB[1] + 4);
      ctx.fillStyle = '#ffffff'; ctx.fillText(right ? 'cat' : 'dog?', BUB[0] - 19, BUB[1]);
      ctx.restore();
      // verdict badge (puffy ball with ✗ / ✓)
      const verdict = () => {
        const vk = right ? spring(9.45, 0.7) : spring(7.4, 0.6);
        const bx = BUB[0] + 140, by = BUB[1] - 100;
        ctx.save(); ctx.translate(bx, by); ctx.scale(vk, vk);
        sphere(ctx, 0, 0, 38, right ? HX('#d9fff0') : HX('#ffd9d2'), right ? HX('#5ee0b0') : HX('#ff7a68'), right ? HX('#2fae84') : HX('#c8403a'));
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
        if (right) { ctx.moveTo(-14, 0); ctx.lineTo(-4, 11); ctx.lineTo(16, -12); } else { ctx.moveTo(-12, -12); ctx.lineTo(12, 12); ctx.moveTo(12, -12); ctx.lineTo(-12, 12); }
        ctx.stroke(); ctx.restore();
      };
      if (t > 7.4) verdict();
      const fade = 1 - E(10.3, 10.7);
      ctx.save(); ctx.globalAlpha = fade;
      // 1 Guess tube: chip → bubble
      clayTube(ctx, [CHIP[0] + 120, CHIP[1] - 80], [1600, 120], [BUB[0] - 170, BUB[1] - 40], E(6.85, 7.25), PAL.lav, 16);
      clayLabel(ctx, 1580, 150, '1  Guess', PAL.white, { k: spring(7.0) });
      if (t > 7.45) clayLabel(ctx, BUB[0] + 30, BUB[1] - 175, '2  Check', PAL.white, { k: spring(7.45) });
      // emphasis: pulsing ring + "answer: cat"
      if (wrong && t > 7.45) {
        const pr = EO(7.45, 7.9);
        // a puffy coral clay torus (cast shadow, darker side, lit face, two highlights) instead of a flat stroke
        ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = fade * (0.78 + 0.22 * Math.sin(t * 9));
        const rr = 1.25 - 0.25 * pr, a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * pr;
        const ring = (dx, dy, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(BUB[0] + dx, BUB[1] + 10 + dy, 210 * rr, 150 * rr, -0.05, a0, a1); ctx.stroke(); };
        ring(5, 14, 'rgba(110,70,160,0.13)', 18);
        ring(0, 4, '#c8483e', 16);
        ring(0, 0, '#ff7a68', 14);
        ring(-1, -2, 'rgba(255,186,170,0.75)', 7);
        ring(-2, -3.5, 'rgba(255,255,255,0.6)', 3);
        ctx.restore();
        verdict(); // keep the ✗ ball in front of the ring
        clayLabel(ctx, BUB[0] + 10, BUB[1] + 205, 'answer: cat', PAL.lav, { k: spring(7.65), col: '#fff' });
      }
      // 3 Adjust tube: bubble → sliders (coral)
      if (t > 8.0) {
        const q = clayTube(ctx, [BUB[0] - 60, BUB[1] + 150], [1640, 640], [CHIP[0] + 100, CHIP[1] + 60], E(8.0, 8.6), PAL.coral, 16);
        if (q && t < 8.75) { const p = q(E(8.0, 8.6) * 0.93); sphere(ctx, p[0], p[1], 15, HX('#ffd9d2'), HX('#ff7a68'), HX('#c8403a')); }
        clayLabel(ctx, 1610, 600, '3  Adjust', PAL.coral, { k: spring(8.5), col: '#fff' });
        if (t < 9.4) clayLabel(ctx, 1700, 500, 'error', PAL.peach, { k: spring(8.1) * (1 - E(9.1, 9.4)), font: '700 28px "Fredoka"', col: '#c8403a' });
      }
      if (right) clayLabel(ctx, BUB[0] + 40, BUB[1] - 175, 'Guess again', PAL.mint, { k: spring(9.5), col: '#fff' });
      ctx.restore();
    }

    // ================= SET 4: progress — clay bar chart =================
    const ACCS = [61, 72, 80, 86, 90, 93, 95, 97];
    const BX = 2330, BW = 56, GAP = 22;
    if (t > 10.5) {
      const pk = spring(10.5, 0.7);
      contactShadow(ctx, BX + 320, FLOOR + 6, 380 * pk, 22, 0.25, 18);
      ctx.save(); ctx.translate(BX + 310, FLOOR - 10); ctx.scale(pk, pk);
      clay(ctx, pill(700, 40), [-350, -20, 350, 20], 0, 0, PAL.white, { ext: [5, 9], fast: true });
      ctx.restore();
      let topP = null;
      ACCS.forEach((a, i) => {
        const g = spring(10.95 + i * 0.2, 0.8); if (g <= 0) return;
        const hh = (a - 50) * 7 * g, x = BX + i * (BW + GAP) + 40, y = FLOOR - 30 - hh / 2;
        if (hh > 4) clay(ctx, rrect(BW, hh, Math.min(26, hh / 2)), [-BW / 2, -hh / 2, BW / 2, hh / 2], x, y, i === 7 ? PAL.coral : (i % 2 ? PAL.blue : PAL.mint), { ext: [5, 9], fast: true });
        topP = [x, FLOOR - 30 - hh, i];
      });
      if (topP) {
        const cur = Math.round(H.lerp(61, 97, H.ease.inOut(ph(11.0, 12.6))));
        const pop = t > 12.6 ? 1 + 0.18 * Math.sin(Math.min(1, (t - 12.6) / 0.4) * Math.PI) : 1;
        // counter-scale the readout about its base during the final pull-back so 97% stays >= 64px on screen
        const cz = Math.max(1, 0.93 / Z), ax = topP[0] - 30, ay = topP[1] - 70 + 52;
        ctx.save(); ctx.translate(ax, ay); ctx.scale(cz, cz); ctx.translate(-ax, -ay);
        clayLabel(ctx, topP[0] - 30, topP[1] - 70, `${cur}%`, cur >= 97 ? PAL.coral : PAL.butter, { k: spring(10.95) * pop, font: '700 70px "Fredoka"', h: 104, padX: 60, col: cur >= 97 ? '#fff' : '#8a5a1f' });
        clayLabel(ctx, topP[0] - 30, topP[1] - 160, 'Accuracy', PAL.lav, { k: spring(10.95) * pop, font: '700 32px "Fredoka"', col: '#fff' });
        ctx.restore();
        if (t < 13.3) clayLabel(ctx, BX + 40, FLOOR - 30 - 11 * 7 - 36, 'round 1: 61%', PAL.white, { k: spring(11.2) * (1 - E(13.0, 13.3)), font: '700 28px "Fredoka"' });
        if (t < 13.3) { ctx.save(); ctx.globalAlpha = EO(11.2, 11.6) * (1 - E(13.0, 13.3)); ctx.font = '700 28px "Fredoka"'; ctx.fillStyle = 'rgba(80,58,160,0.85)'; ctx.textAlign = 'center'; ctx.fillText('training rounds →', BX + 310, FLOOR + 44); ctx.restore(); }
        if (t > 12.6 && t < 13.6) { // confetti spheres burst
          const cr = H.rng(5), pp = EO(12.6, 13.6);
          for (let i = 0; i < 14; i++) { const a = cr() * Math.PI * 2, d = 60 + cr() * 120; const col = cr.pick([[HX('#ffe3ea'), HX('#ffb1c2'), HX('#ff8fa8')], [HX('#fff6c7'), HX('#ffe08a'), HX('#f3b860')], [HX('#d8f5ec'), HX('#a6e3d2'), HX('#6cbfb0')]]); ctx.globalAlpha = 1 - pp; sphere(ctx, topP[0] + Math.cos(a) * d * pp, topP[1] - 52 + Math.sin(a) * d * pp + pp * pp * 40, 9, ...col); }
          ctx.globalAlpha = 1;
        }
      }
    }
    ctx.restore(); // end world

    // ---------- screen-space atmosphere: soft lavender vignette + an out-of-focus foreground sphere (hero DOF) ----------
    {
      const vg = ctx.createRadialGradient(W * 0.5, H_ * 0.45, H_ * 0.45, W * 0.5, H_ * 0.45, W * 0.78);
      vg.addColorStop(0, 'rgba(120,90,200,0)'); vg.addColorStop(1, 'rgba(120,90,200,0.11)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H_);
      ctx.drawImage(fgSphere(), 1238 - (camX - 640) * 0.04 - 160, 678 + bob(4, 3) - 160);
    }

    // ---------- hook bubble → corner header pill (screen space) ----------
    {
      const inK = spring(0.1, 0.9), out = E(1.5, 2.2);
      if (out < 1) {
        const s2 = inK * (1 - out * 0.75);
        const x = H.lerp(640, 170, out), y = H.lerp(330, 60, out);
        if (out < 0.6 && inK > 0) { // the hook bubble floats over the set: warm glow + soft contact shadow under it
          const fa = 1 - H.smooth(0, 0.6, out), g = ctx.createRadialGradient(640, 320, 30, 640, 320, 380);
          g.addColorStop(0, `rgba(255,214,120,${0.22 * fa * Math.min(1, inK)})`); g.addColorStop(1, 'rgba(255,224,170,0)');
          ctx.fillStyle = g; ctx.fillRect(260, 0, 760, 700);
          contactShadow(ctx, 650, FLOOR, 170 * Math.min(1.1, inK) * (1 - out * 0.8), 22, 0.28 * fa, 18);
        }
        ctx.save(); ctx.globalAlpha = 1 - H.smooth(0.6, 1, out); ctx.translate(x, y + 100 * s2); ctx.scale(Math.max(0.001, s2) * 1.15, Math.max(0.001, s2) * 1.05); ctx.translate(0, -100);
        clay(ctx, bubblePath(), BUBBLE_BB, 0, 0, PAL.lav, { ext: [12, 22], spec: [-95, -78, 85, 40] });
        ctx.font = '700 40px "Fredoka"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(70,45,170,0.35)'; ctx.fillText('How does', 3, -24 + 4); ctx.fillText('AI learn?', 3, 24 + 4);
        ctx.fillStyle = '#ffffff'; ctx.fillText('How does', 0, -24); ctx.fillText('AI learn?', 0, 24);
        ctx.restore();
      }
      if (t > 1.9) clayLabel(ctx, 170, 58, 'How does AI learn?', PAL.lav, { k: spring(1.9, 0.7), font: '700 28px "Fredoka"', h: 54, padX: 44, col: '#fff' });
    }
    // ---------- takeaway ----------
    if (t > 13.0) {
      const kk = spring(13.0, 0.8);
      ctx.save(); ctx.translate(640, 628); ctx.scale(kk, kk);
      clay(ctx, pill(860, 100), [-430, -50, 430, 50], 0, 0, PAL.white, { ext: [7, 13], spec: [-260, -22, 140, 18] });
      ctx.font = '700 46px "Fredoka"'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('More examples → better guesses', 0, 3);
      ctx.restore();
    }
    ctx.font = '600 20px "Fredoka"'; ctx.fillStyle = `rgba(85,62,165,${0.78 * (1 - E(12.9, 13.2))})`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('AI ASSISTANTS · 101', 64, 692); // steps aside for the takeaway pill
    H.grain(ctx, W, H_, 0.018, 9 + Math.floor(t * 12));
  }

  // ---------- sound: squishy clay set (rubbery bounces as things spring on, soft puffs, gentle camera dollies) ----------
  function softSound(k) {
    const D = 14.5;
    const ph = (t, a, b) => H.clamp((t - a) / (b - a));
    const inv = (u) => (u < 0.5 ? Math.cbrt(u / 4) : 1 - Math.cbrt((1 - u) * 2) / 2); // inverse of H.ease.inOut
    const invO = (u) => 1 - Math.cbrt(1 - u); // inverse of H.ease.out
    // spring(t0, d) from softExplainer first reaches full size at p = pi/20 (overshoot peak at pi/10)
    const sp = (t0, d = 0.8) => t0 + d * (Math.PI / 20);
    // panning: world x on the set -> screen, using the camera keyframes copied from softExplainer (KF)
    const KF = [[0, 640, 360, 1], [1.6, 640, 360, 1], [2.8, 980, 360, 1], [5.8, 1020, 360, 1], [6.8, 1560, 360, 1], [10.2, 1580, 360, 1], [11.1, 2560, 360, 1], [12.8, 2580, 360, 1], [13.8, 1790, 400, 0.44], [20, 1790, 400, 0.44]];
    const pan = (wx, t) => { let i = 0; while (i < KF.length - 2 && t > KF[i + 1][0]) i++; const A = KF[i], B = KF[i + 1], u = H.ease.inOut(H.clamp((t - A[0]) / (B[0] - A[0]))); const sx = 640 + (wx - H.lerp(A[1], B[1], u)) * H.lerp(A[3], B[3], u); return H.clamp(sx / 640 - 1, -1, 1) * 0.6; };
    const busy = [];
    // squish: a soft rubbery bounce, pitch bends up as it squashes then settles with one smaller wobble
    const squish = (t, f, g, p = 0, minor) => {
      busy.push(t);
      k.tone(t, { f: [[0, f * 0.7], [0.05, f * 1.18], [0.17, f * 0.92]], dur: 0.2, gain: 0.26 * g, a: 0.006, pan: p, minor });
      k.tone(t + 0.13, { f: [[0, f * 0.95], [0.05, f * 1.06], [0.12, f]], dur: 0.13, gain: 0.08 * g, a: 0.01, pan: p, minor }); // the overshoot wobble
      k.noise(t, { dur: 0.05, color: 'pink', filter: 'lowpass', f: 900, gain: 0.18 * g, a: 0.004, pan: p, minor }); // soft contact puff
    };
    const puff = (t, g, p = 0) => busy.push(t) && k.noise(t, { dur: 0.09, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.09, 900]], q: 1, gain: 0.12 * g, a: 0.02, pan: p, minor: true });
    const dolly = (t0, t1, g = 1) => { const d = t1 - t0; k.noise(t0, { dur: d + 0.15, color: 'pink', filter: 'bandpass', f: [[0, 220], [d * 0.5, 480], [d, 240]], q: 0.7, gain: 0.045 * g, a: d * 0.5, verb: 0.1 }); };
    const counter = (a, b, val, f, g, p, minGap) => {
      let last = -1, lastV = val(a); const top = Math.abs(val(b) - val(a)) / (b - a) * 0.22;
      for (let t = a; t <= b + 1e-6; t += 1 / 120) {
        const v = val(t); if (v === lastV) continue; lastV = v;
        const speed = Math.abs(val(Math.min(b, t + 0.05)) - val(Math.max(a, t - 0.05)));
        const gap = H.clamp(minGap / Math.max(0.2, Math.min(1, speed / top)), minGap, 0.4);
        if (t - last >= gap && !busy.some((x) => t > x - 0.03 && t < x + 0.27)) { k.play('tick', t, { f, gain: g, pan: p, minor: true }); k.tone(t, { f: f / 10, dur: 0.03, gain: 0.05 * g, pan: p, minor: true }); last = t; }
      }
    };

    k.bed('room', 0, D, { gain: 0.22 });
    k.music('pad', 0.2, D, { bpm: 100, gain: 0.3, chords: [['Eb4', 'G4', 'Bb4', 'D5'], ['C4', 'Eb4', 'G4', 'Bb4'], ['Ab3', 'C4', 'Eb4', 'G4'], ['Bb3', 'D4', 'F4', 'Ab4'], ['Eb4', 'G4', 'Bb4', 'Eb5']] });

    // ---- hook: the clay speech bubble bounces on (spring 0.1, 0.9), the chip springs up behind (1.0, 0.9)
    squish(sp(0.1, 0.9), 300, 1.2, 0);
    squish(sp(1.0, 0.9), 170, 1.1, pan(1350, 1.14)); // the AI chip
    k.noise(1.5, { dur: 0.7, color: 'pink', filter: 'lowpass', f: [[0, 650], [0.7, 300]], gain: 0.05, a: 0.25, minor: true }); // bubble shrinks off to the corner
    squish(sp(1.9, 0.7), 420, 0.4, -0.7, true); // header pill
    dolly(1.6, 2.8);

    // ---- beat 2: cards puff out of the tube, the pile grows, the counter badge
    k.noise(2.6, { dur: 0.9, color: 'pink', filter: 'bandpass', f: [[0, 260], [0.9, 620]], q: 1.4, gain: 0.07, a: 0.4, pan: pan(700, 3), minor: true }); // puffy tube squeezes out (E 2.6-3.5)
    for (let j = 0; j < 9; j++) { const t = 2.3 + j * 0.15 / 0.36; if (t < 6.4) puff(t, 0.9, pan(560, t)); } // a card pops out of the tube
    for (let j = 0; j < 4; j++) { const t = 2.3 + (1 + j * 0.15) / 0.36; if (t < 6.5) k.tone(t, { f: [[0, 240], [0.1, 150]], dur: 0.14, gain: 0.1, pan: pan(1310, t), minor: true }); } // swallowed by the chip
    // examples pile: item i springs at 2.6 + 0.4i once n = floor(1 + 7 * EO(2.6,5.8)^1.1) > i
    for (let i = 0; i < 8; i++) { const tn = i === 0 ? 2.6 : 2.6 + 3.2 * invO(Math.pow(i / 7, 1 / 1.1)), t = sp(Math.max(tn, 2.6 + i * 0.4), 0.6); if (t < 6.4) squish(t, 260 + (i % 3) * 30, 0.32, pan(600 + (i % 3) * 76, t), true); }
    squish(sp(2.7), 360, 0.8, pan(980, 2.8)); // butter counter badge
    counter(2.95, 5.66, (t) => Math.floor(1e6 * Math.pow(H.ease.out(ph(t, 2.9, 5.7)), 1.6)), 2400, 0.75, pan(980, 4), 1 / 8);
    squish(sp(4.0), 380, 0.75, pan(1350, 4.1)); // "the model"
    squish(5.7, 330, 0.9, pan(980, 5.7)); k.play('ding', 5.7, { f: 'Bb5', gain: 0.35, pan: pan(980, 5.7) }); // 1,000,000 lands

    // ---- beat 3
    squish(5.95, 340, 0.8, pan(560, 5.95)); // pink test card with its "?"
    dolly(5.8, 6.8);
    k.noise(6.5, { dur: 0.4, color: 'pink', filter: 'lowpass', f: [[0, 700], [0.4, 300]], gain: 0.04, a: 0.1, minor: true }); // counter badge squashes away
    k.tone(7.0, { f: [[0, 200], [0.12, 130]], dur: 0.16, gain: 0.12, pan: pan(1310, 7.0), minor: true }); // test card swallowed
    k.noise(6.85, { dur: 0.4, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.4, 700]], q: 1.4, gain: 0.07, a: 0.2, pan: pan(1600, 7.05), minor: true }); // Guess tube squeezes over
    squish(sp(6.9, 0.7), 280, 1.1, pan(1840, 7.0)); // answer bubble "dog?" bounces up
    squish(sp(7.0), 420, 0.42, pan(1580, 7.1), true); // "1 Guess"
    // CHECK: wrong. bubble shakes, the X ball bounces on
    k.play('error', 7.42, { f: 'G3', gain: 0.8, pan: pan(1980, 7.45) });
    squish(sp(7.4, 0.6), 220, 0.8, pan(1980, 7.45));
    squish(sp(7.65), 360, 0.4, pan(1850, 7.75), true); // "answer: cat"
    // ADJUST: coral tube squeezes back to the chip, the error ball rolls along it
    k.noise(8.0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.6, 300]], q: 1.4, gain: 0.08, a: 0.3, pan: pan(1640, 8.3) });
    k.tone(8.0, { f: [[0, 300], [0.6, 180]], type: 'triangle', dur: 0.62, gain: 0.05, a: 0.25, pan: pan(1640, 8.3), minor: true });
    squish(sp(8.1), 460, 0.38, pan(1700, 8.2), true); // "error"
    squish(sp(8.5), 340, 0.8, pan(1610, 8.6)); // "3 Adjust"
    // sliders glide to new weights (E 8.6-9.3 with a jitter): three rubber knobs sliding
    [0, 1, 2].forEach((i) => k.noise(8.62 + i * 0.05, { dur: 0.62, color: 'pink', filter: 'bandpass', f: [[0, 380 + i * 60], [0.3, 640 + i * 60], [0.62, 420 + i * 60]], q: 3, gain: 0.07, a: 0.25, pan: pan(1350, 9), minor: true }));
    squish(9.3, 300, 0.5, pan(1350, 9.3), true); // knobs settle
    // CORRECT: bubble turns mint "cat", the check ball bounces on
    k.play('success', sp(9.45, 0.7), { f: 'Eb5', gain: 0.42, pan: pan(1980, 9.55) });
    squish(sp(9.45, 0.7), 300, 0.8, pan(1980, 9.55));
    squish(sp(9.5), 420, 0.38, pan(1880, 9.6), true); // "Guess again"

    // ---- beat 4: clay bars bounce up one per round
    dolly(10.2, 11.1);
    squish(sp(10.5, 0.7), 180, 0.7, pan(2640, 10.6), true); // chart base
    squish(sp(10.95), 360, 0.7, pan(2330, 11.05)); // Accuracy badge
    ['Eb3', 'F3', 'G3', 'Bb3', 'C4', 'D4', 'Eb4', 'G4'].forEach((n, i) => squish(sp(10.95 + i * 0.2), k.hz(n), i === 7 ? 0.7 : 0.45, pan(2370 + i * 78, 11 + i * 0.2), i < 7));
    counter(11.03, 12.56, (t) => Math.round(H.lerp(61, 97, H.ease.inOut(ph(t, 11.0, 12.6)))), 2200, 0.7, pan(2700, 12), 1 / 12);
    // 97%: the big hit. badge swells coral, confetti spheres burst
    k.play('impact', 12.6, { gain: 1.3, pan: pan(2950, 12.6) });
    squish(12.6, 240, 1.4, pan(2950, 12.6));
    ['Eb4', 'G4', 'Bb4', 'Eb5'].forEach((n, i) => k.play('ding', 12.62 + i * 0.03, { f: n, gain: 0.4 - i * 0.05, pan: (i - 1.5) * 0.25 }));
    for (let i = 0; i < 6; i++) k.tone(12.68 + i * 0.07, { f: [[0, 380 + i * 30], [0.06, 520 + i * 30]], dur: 0.08, gain: 0.07, pan: Math.sin(i * 2.1) * 0.6, minor: true }); // little bouncy confetti balls
    dolly(12.8, 13.8, 0.9);
    // takeaway pill springs on (13.0, 0.8) and the phrase resolves
    squish(sp(13.0), 260, 1.0, 0);
    ['Bb4', 'Eb5'].forEach((n, i) => k.play('ding', 13.32 + i * 0.09, { f: n, gain: 0.3 - i * 0.05, pan: (i - 0.5) * 0.3 }));
    k.tone(13.32, { f: 'Eb3', type: 'triangle', dur: 1.2, gain: 0.12, a: 0.02 });
  }

  registerStyle({
    id: 'soft-3d',
    name: 'Soft 3D Clay',
    category: 'Dimensional',
    description: 'Dribbble-style “puffy” 3D icons: pastel matte-clay objects with chunky rounded extrusions, soft core shadows, bright bounce-light rims, glossy specular blobs and blurry contact shadows on a seamless pastel sweep.',
    motion: 'Clay icons drop in one by one on springy squash-and-stretch with their contact shadows growing beneath them, the bulb flickers on, then the cursor flies in and taps the bubble while everything bobs at different depths.',
    duration: 5,
    fonts: ['600 38px "Fredoka"', '700 38px "Fredoka"', '600 15px "Fredoka"', '700 64px "Fredoka"', '600 18px "Fredoka"'],
    frameT: 4.6,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'The camera dollies across one wide pastel set with parallax depth-of-field (cards → clay chip with weight sliders → answer bubble → clay bar chart → pull back), arrows are puffy clay tubes with blobby heads, labels are squishy pills that spring onto objects, and numbers count inside butter-yellow clay badges.',
    explainer: softExplainer,
    explainerSound: softSound,
    draw(ctx, W, H_, t) {
      // ---------- seamless cyclorama ----------
      const bg = ctx.createLinearGradient(0, 0, 0, H_);
      bg.addColorStop(0, '#f3ecff'); bg.addColorStop(0.55, '#e6dcfa'); bg.addColorStop(0.62, '#e4d9f8'); bg.addColorStop(1, '#f1eaff');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H_);
      const glow = ctx.createRadialGradient(W * 0.48, H_ * 0.35, 40, W * 0.48, H_ * 0.35, 700);
      glow.addColorStop(0, 'rgba(255,250,255,0.8)'); glow.addColorStop(1, 'rgba(255,250,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H_);

      const bob = (ph, amp) => Math.sin(t * 1.6 + ph) * amp;
      const FLOOR = 610;
      const ph = (a, b) => H.clamp((t - a) / (b - a));
      // springy pop-in: drops in from above, overshoots, squashes and stretches, settles
      const spring = (t0) => {
        const p = ph(t0, t0 + 0.95);
        if (p <= 0) return null;
        const k = p >= 1 ? 1 : 1 - Math.exp(-6.5 * p) * Math.cos(10 * p);
        const st = p >= 1 ? 0 : Math.pow(1 - p, 2) * Math.sin(p * 13) * 0.22;
        return { k, sx: k * (1 - st), sy: k * (1 + st), dy: -(1 - H.ease.out(Math.min(1, p * 1.6))) * 70 };
      };
      const pop = (c, x, y, t0, fn) => {
        const sp = spring(t0); if (!sp) return;
        c.save(); c.translate(x, y + sp.dy); c.scale(Math.max(0.001, sp.sx), Math.max(0.001, sp.sy)); c.translate(-x, -y);
        fn(); c.restore();
      };
      const cshadow = (x, y, w, h, a, bl, t0) => { const sp = spring(t0); if (!sp) return; const k = Math.min(1.1, sp.k) * (1 + sp.dy / 200); contactShadow(ctx, x, y, w * k, h * k, a * Math.min(1, sp.k), bl); };

      // ---------- far layer (blurred for depth of field) ----------
      const far = H.layer(W, H_), fc = far.getContext('2d');
      const gy = 250 + bob(1.2, 9);
      cshadow(985, FLOOR - 90, 95, 16, 0.22, 16, 0.8);
      pop(fc, 975, gy, 0.8, () => puffy(fc, { x: 975, y: gy, rot: t * 0.35 + 0.2 - (1 - ph(0.8, 2.2)) * 1.2, s: 0.92, path: gearPath(118, 8, 40), rule: 'evenodd', bb: [-118, -118, 118, 118],
        face: [H.hex('#e3f1ff'), H.hex('#b4d6ff'), H.hex('#8fbaf5')], side: [H.hex('#86b0ee'), H.hex('#5a7fc7')], ext: [10, 20], spec: [-50, -60, 50, 30] }));
      pop(fc, 1150, 120, 1.0, () => sphere(fc, 1150, 120 + bob(2.5, 6), 22, H.hex('#fff6c7'), H.hex('#ffe08a'), H.hex('#f3b860')));
      pop(fc, 180, 110, 1.2, () => sphere(fc, 180, 110 + bob(0.4, 5), 16, H.hex('#d8f5ec'), H.hex('#a6e3d2'), H.hex('#6cbfb0')));
      ctx.save(); ctx.filter = 'blur(2.2px)'; ctx.drawImage(far, 0, 0); ctx.restore();

      // ---------- mid layer: lightbulb (left) ----------
      {
        const bx = 300, by = 262 + bob(0.6, 11), r = 92, s = 1, rot = -0.14;
        cshadow(318, FLOOR - 40, 80, 14, 0.22, 14, 0.5);
        // glow aura: the bulb "switches on" with a flicker once it has landed
        const on = t > 1.7 ? (t < 1.78 || (t > 1.86 && t < 1.92) ? 0.3 : 1) * H.ease.out(ph(1.7, 2.1)) : 0;
        const a = ctx.createRadialGradient(bx, by - 10, 20, bx, by - 10, 210);
        a.addColorStop(0, `rgba(255,236,150,${0.55 * on})`); a.addColorStop(1, 'rgba(255,236,150,0)');
        ctx.fillStyle = a; ctx.fillRect(bx - 220, by - 230, 440, 440);
        pop(ctx, bx, by + 120, 0.5, () => {
          for (let i = 2; i >= 0; i--) {
            const ox = Math.sin(rot) * -(r * 1.05 + i * 26), oy = Math.cos(rot) * (r * 1.05 + i * 26);
            const w = 54 - i * 4;
            puffy(ctx, { x: bx + ox, y: by + oy, rot, s, path: roundedPoly([[-w, -14, 14], [w, -14, 14], [w, 14, 14], [-w, 14, 14]]), bb: [-w, -14, w, 14],
              face: [H.hex('#e3fbf3'), H.hex('#b3eadb'), H.hex('#86d3c0')], side: [H.hex('#7fcbb8'), H.hex('#4f9f93')], ext: [5, 9] });
          }
          {
            const ox = Math.sin(rot) * -(r * 1.05 + 3 * 26 - 6), oy = Math.cos(rot) * (r * 1.05 + 3 * 26 - 6);
            puffy(ctx, { x: bx + ox, y: by + oy, rot, s, path: roundedPoly([[-26, -12, 12], [26, -12, 12], [12, 12, 8], [-12, 12, 8]]), bb: [-26, -12, 26, 12],
              face: [H.hex('#a39cc4'), H.hex('#7d74a8'), H.hex('#5f5689')], side: [H.hex('#5a5185'), H.hex('#3f3866')], ext: [4, 7] });
          }
          const off = 1 - on;
          puffy(ctx, { x: bx, y: by, rot, s, path: bulbGlassPath(r), bb: [-r, -r, r, r],
            face: [H.mix('#fffbe0', '#f4efe6', off * 0.6), H.mix('#ffe58f', '#e8dcc6', off * 0.6), H.mix('#f7c45e', '#cdbb9e', off * 0.6)], side: [H.mix('#f2b955', '#c4ae8c', off * 0.6), H.mix('#d98f3a', '#9c8566', off * 0.6)], ext: [8, 14], spec: [-38, -52, 40, 26] });
          ctx.save(); ctx.translate(bx, by); ctx.rotate(rot);
          ctx.strokeStyle = `rgba(232,150,60,${0.25 + 0.3 * on})`; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(-18, 70); ctx.lineTo(-18, 18); ctx.lineTo(-9, 4); ctx.lineTo(0, 18); ctx.lineTo(9, 4); ctx.lineTo(18, 18); ctx.lineTo(18, 70); ctx.stroke();
          ctx.strokeStyle = `rgba(255,255,240,${0.9 * on})`; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(-19, 68); ctx.lineTo(-19, 17); ctx.lineTo(-10, 3); ctx.lineTo(-1, 17); ctx.lineTo(8, 3); ctx.lineTo(17, 17); ctx.stroke();
          ctx.restore();
        });
      }

      // ---------- hero: chat bubble ----------
      const cbx = 640, cby = 305 + bob(0, 8);
      const tapAt = 2.6, tapT = t - tapAt;
      const tapPress = tapT > 0 ? Math.max(0, Math.sin(tapT * 2.4 * Math.PI / 2.4 * 1.0)) : 0; // 0..1 press cycles
      const squish = tapT > 0 ? Math.pow(Math.max(0, Math.sin(tapT * Math.PI * 0.8)), 6) * 0.03 : 0;
      cshadow(650, FLOOR, 170, 22, 0.3, 18, 0.15);
      pop(ctx, cbx, cby + 120, 0.15, () => {
        ctx.save(); ctx.translate(cbx, cby + 100); ctx.scale(1 + squish, 1 - squish); ctx.translate(-cbx, -(cby + 100));
        puffy(ctx, { x: cbx, y: cby, rot: -0.04, s: 1, path: bubblePath(), bb: BUBBLE_BB,
          face: [H.hex('#d9d0ff'), H.hex('#a796ff'), H.hex('#8c78f5')], side: [H.hex('#806ce8'), H.hex('#5340b8')], ext: [12, 22], spec: [-95, -78, 85, 40] });
        // text on bubble: each line bounces in
        ctx.save(); ctx.translate(cbx, cby); ctx.rotate(-0.04);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '700 38px "Fredoka"';
        [['Ask me', -26, 1.0], ['anything', 22, 1.25]].forEach(([str, y, t0]) => {
          const sp = spring(t0); if (!sp) return;
          ctx.save(); ctx.translate(0, y); ctx.scale(sp.sx, sp.sy);
          ctx.fillStyle = 'rgba(70,45,170,0.35)'; ctx.fillText(str, 3, 4);
          ctx.fillStyle = '#ffffff'; ctx.fillText(str, 0, 0);
          ctx.restore();
        });
        ctx.restore();
        ctx.restore();
      });
      // typing-dots badge
      {
        const px = cbx + 150, py = cby - 118;
        pop(ctx, px, py, 1.6, () => {
          puffy(ctx, { x: px, y: py, rot: 0.1, s: 1, path: roundedPoly([[-42, -22, 22], [42, -22, 22], [42, 22, 22], [-42, 22, 22]]), bb: [-42, -22, 42, 22],
            face: [H.hex('#ffffff'), H.hex('#f4efff'), H.hex('#ddd2fb')], side: [H.hex('#cdbff5'), H.hex('#9a87de')], ext: [5, 9] });
          for (let i = 0; i < 3; i++) {
            const jump = Math.max(0, Math.sin(t * 6 - i * 0.9)) * 5;
            sphere(ctx, px - 22 + i * 22, py + i * 2.2 - 2 - jump, 7.5, H.hex('#c8bcff'), H.hex('#9481f0'), H.hex('#6a55cf'));
          }
        });
      }

      // ---------- ring (donut) bottom-left ----------
      {
        const rx = 150, ry = 525 + bob(2.2, 4);
        cshadow(rx + 8, FLOOR - 10, 92, 14, 0.25, 12, 1.0);
        pop(ctx, rx, ry + 30, 1.0, () => puffy(ctx, { x: rx, y: ry, rot: 0.08, s: 1, path: ringPath(92, 46), rule: 'evenodd', bb: [-92, -40, 92, 40],
          face: [H.hex('#fff3d6'), H.hex('#ffd59a'), H.hex('#f6b36d')], side: [H.hex('#efa760'), H.hex('#c97a3e')], ext: [4, 16], spec: [-50, -22, 34, 12] }));
      }
      // sphere resting on floor
      cshadow(1095, FLOOR - 4, 46, 9, 0.35, 8, 1.15);
      pop(ctx, 1090, 600, 1.15, () => sphere(ctx, 1090, 560, 42, H.hex('#d8f5ec'), H.hex('#a6e3d2'), H.hex('#5fb3a3')));

      // ---------- near layer: cursor (flies in, then taps the bubble) ----------
      {
        const tap = tapPress * 10;
        const fly = H.ease.out(ph(1.35, 2.2));
        const cx = 790 - tap * 0.6 + (1 - fly) * 260, cy = 395 - tap + bob(3.1, 4) + (1 - fly) * 160;
        const rot = -0.32 + (1 - fly) * 0.5;
        if (fly > 0) {
          contactShadow(ctx, 870 + (1 - fly) * 200, FLOOR + 20, 70, 14, 0.25 * fly, 14);
          puffy(ctx, { x: cx, y: cy, rot, s: 1.08, path: cursorPath(), bb: CURSOR_BB,
            face: [H.hex('#ffe3ea'), H.hex('#ffb1c2'), H.hex('#ff8fa8')], side: [H.hex('#f57f9b'), H.hex('#cc4f72')], ext: [10, 16], spec: [26, 40, 30, 50] });
        }
      }

      // ---------- out-of-focus foreground element (drifts in from the corner) ----------
      {
        const fi = H.ease.out(ph(0.3, 1.6));
        const fg = H.layer(W, H_), gc = fg.getContext('2d');
        sphere(gc, 1238 + (1 - fi) * 160, 678 + (1 - fi) * 90 + bob(4, 3), 100, H.hex('#f3eeff'), H.hex('#d4c8ff'), H.hex('#a998ec'));
        ctx.save(); ctx.filter = 'blur(9px)'; ctx.drawImage(fg, 0, 0); ctx.restore();
      }
      // ---------- caption chip ----------
      ctx.font = '600 20px "Fredoka"'; ctx.fillStyle = `rgba(85,62,165,${0.8 * ph(1.8, 2.3)})`; ctx.textAlign = 'left';
      try { ctx.letterSpacing = '1px'; } catch (e) {}
      ctx.fillText('AI ASSISTANTS · 101', 64, 676);
      try { ctx.letterSpacing = '0px'; } catch (e) {}
      H.grain(ctx, W, H_, 0.018, 9 + Math.floor(t * 12));
    },
  });
}
```
