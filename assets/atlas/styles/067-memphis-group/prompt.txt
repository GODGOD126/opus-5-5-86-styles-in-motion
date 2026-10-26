I want an animated explainer made in the "Memphis Group" visual style (Art & Design Movements). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Fredoka, Rubik Mono One
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Rubik+Mono+One&display=block">
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
Name: Memphis Group
Family: Art & Design Movements
Look: Early-80s Memphis Milano maximalism: pastel grounds clashing with bold primaries, thick black outlines and hard offset shadows, squiggles, zigzags, dot grids, terrazzo chips and confetti triangles, all orbiting a chunky tilted chat-bubble headline.
Motion: Cut-out cel timing on twos: the mint wedge slides in, shapes pop on one by one with springy overshoot, squiggles and zigzags draw themselves, the chat bubble squash-and-stretches in, the words pop on the beat, confetti bursts out and the sticker slaps on; then everything bobs off-beat and the typing dots bounce.
How it explains: Memphis cut-out animation on twos: examples hop into a funnel-topped totem computer, scenes change with a striped polka-dot band that swipes across, arrows are fat outlined shapes with hard shadows, counters are stickers that pop on each tick, and the key moments get a spinning starburst.

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

REFERENCE STYLE SOURCE (styles/memphis.js; W/H_ are always 1280x720)
```js
{
  const K = '#151515';
  const PAL = { pink: '#f9c3d2', mint: '#a9e5d0', lilac: '#cbb8f4', butter: '#fff0a6', cream: '#fff8ec', magenta: '#ff4f9b', blue: '#2b62ff', yellow: '#ffd02e', teal: '#00b2a0', red: '#ff5a3c' };

  // filled + outlined + hard drop shadow
  const solid = (c, path, fill, sh = 10, lw = 5) => {
    c.save(); c.translate(sh, sh); c.fillStyle = K; c.fill(path); c.restore();
    c.fillStyle = fill; c.fill(path); c.lineWidth = lw; c.strokeStyle = K; c.lineJoin = 'round'; c.stroke(path);
  };
  const squigglePath = (x, y, len, amp, waves, ang, ph = 0, frac = 1) => {
    const p = new Path2D(), ca = Math.cos(ang), sa = Math.sin(ang);
    for (let i = 0; i <= Math.round(80 * frac); i++) {
      const u = i / 80, lx = u * len, ly = Math.sin(u * waves * Math.PI * 2 + ph) * amp;
      const X = x + lx * ca - ly * sa, Y = y + lx * sa + ly * ca;
      i ? p.lineTo(X, Y) : p.moveTo(X, Y);
    }
    return p;
  };
  const zigzagPath = (x, y, len, amp, n, ang, frac = 1) => {
    const p = new Path2D(), ca = Math.cos(ang), sa = Math.sin(ang), f = frac * n;
    for (let i = 0; i <= Math.ceil(f); i++) { const ii = Math.min(i, f), i0 = Math.floor(ii), fr = ii - i0, ya = i0 % 2 ? -amp : amp, yb = (i0 + 1) % 2 ? -amp : amp; const lx = (ii / n) * len, ly = ya + (yb - ya) * fr; const X = x + lx * ca - ly * sa, Y = y + lx * sa + ly * ca; i ? p.lineTo(X, Y) : p.moveTo(X, Y); }
    return p;
  };
  const strokeOutlined = (c, path, col, w, ow = 4, sh = 8) => {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.save(); c.translate(sh, sh); c.strokeStyle = K; c.lineWidth = w + ow * 2; c.stroke(path); c.restore();
    c.strokeStyle = K; c.lineWidth = w + ow * 2; c.stroke(path);
    c.strokeStyle = col; c.lineWidth = w; c.stroke(path);
  };
  const terrazzo = (c, path, seed, base = PAL.cream) => {
    c.save(); c.clip(path); c.fillStyle = base; c.fillRect(0, 0, 1280, 720);
    const r = H.rng(seed), cols = [PAL.magenta, PAL.blue, PAL.yellow, PAL.teal, K, PAL.pink, PAL.lilac, PAL.red];
    const bb = { x0: 0, y0: 0, x1: 1280, y1: 720 };
    for (let i = 0; i < 2400; i++) {
      const x = r.range(bb.x0, bb.x1), y = r.range(bb.y0, bb.y1);
      if (!c.isPointInPath(path, x, y)) continue;
      const s = r.range(3, 11) * (r() < 0.08 ? 2 : 1), n = r.int(3, 6), a0 = r.range(0, 7);
      c.fillStyle = r.pick(cols); c.beginPath();
      for (let k = 0; k < n; k++) { const a = a0 + (k / n) * Math.PI * 2 + r.range(-0.3, 0.3), rr = s * r.range(0.5, 1); k ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      c.closePath(); c.fill();
    }
    c.restore();
  };

  // ===================== EXPLAINER: "How does AI learn?" =====================
  // Memphis cut-out animation on twos: scenes change with a striped band that swipes across, arrows are fat
  // outlined shapes, counters are stickers that pop, emphasis is a spiky starburst.
  const roundRect = (x, y, w, h, r) => { const p = new Path2D(); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p; };
  const bubble = (w, h, tail) => { // tail: [x, y] of the tip relative to centre
    const p = new Path2D(), r = 34, x = -w / 2, y = -h / 2;
    p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r);
    if (tail) { p.lineTo(tail[0] + 40, y + h); p.lineTo(tail[0], tail[1]); p.lineTo(tail[0] - 10, y + h); }
    p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p;
  };
  const burst = (n, r0, r1) => { const p = new Path2D(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? r0 : r1; i ? p.lineTo(Math.cos(a) * r, Math.sin(a) * r) : p.moveTo(Math.cos(a) * r, Math.sin(a) * r); } p.closePath(); return p; };
  const fatArrow = (c, x0, y0, x1, y1, p, col, w = 22) => { // outlined chunky arrow with hard shadow
    if (p <= 0) return; const a = Math.atan2(y1 - y0, x1 - x0), l = Math.hypot(x1 - x0, y1 - y0) * p, hw = w * 1.3, hl = w * 1.6;
    const path = new Path2D(); path.moveTo(0, -w / 2); path.lineTo(Math.max(0, l - hl), -w / 2); path.lineTo(Math.max(0, l - hl), -hw); path.lineTo(l, 0); path.lineTo(Math.max(0, l - hl), hw); path.lineTo(Math.max(0, l - hl), w / 2); path.lineTo(0, w / 2); path.closePath();
    c.save(); c.translate(x0, y0); c.rotate(a); solid(c, path, col, 6, 4); c.restore();
  };
  const face = (c, kind, x, y, s) => { // chunky sticker card with a cat or dog face
    const card = roundRect(x - s / 2, y - s / 2, s, s, s * 0.14); solid(c, card, PAL.cream, 6, 4);
    c.lineWidth = 3.5; c.strokeStyle = K;
    if (kind === 'cat') {
      const p = new Path2D(); p.moveTo(x - s * 0.3, y + s * 0.02); p.lineTo(x - s * 0.28, y - s * 0.34); p.lineTo(x - s * 0.08, y - s * 0.18); p.lineTo(x + s * 0.08, y - s * 0.18); p.lineTo(x + s * 0.28, y - s * 0.34); p.lineTo(x + s * 0.3, y + s * 0.02); p.arc(x, y + s * 0.04, s * 0.3, 0, Math.PI); p.closePath();
      c.fillStyle = PAL.yellow; c.fill(p); c.stroke(p);
      c.fillStyle = K; c.beginPath(); c.arc(x - s * 0.1, y + s * 0.02, s * 0.04, 0, 7); c.arc(x + s * 0.1, y + s * 0.02, s * 0.04, 0, 7); c.fill();
      c.fillStyle = PAL.magenta; c.beginPath(); c.moveTo(x - s * 0.05, y + s * 0.1); c.lineTo(x + s * 0.05, y + s * 0.1); c.lineTo(x, y + s * 0.16); c.closePath(); c.fill();
    } else {
      c.fillStyle = PAL.blue; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(x + sd * s * 0.28, y + s * 0.02, s * 0.1, s * 0.2, sd * -0.3, 0, 7); c.fill(); c.stroke(); }
      c.fillStyle = PAL.pink; c.beginPath(); c.arc(x, y + s * 0.02, s * 0.25, 0, 7); c.fill(); c.stroke();
      c.fillStyle = K; c.beginPath(); c.arc(x - s * 0.09, y - s * 0.02, s * 0.035, 0, 7); c.arc(x + s * 0.09, y - s * 0.02, s * 0.035, 0, 7); c.fill();
      c.beginPath(); c.ellipse(x, y + s * 0.1, s * 0.06, s * 0.045, 0, 0, 7); c.fill();
    }
  };
  const tag = (c, txt, x, y, col, size = 22, rot = 0, halo = 0) => { c.save(); c.translate(x, y); c.rotate(rot); c.font = `700 ${size}px "Fredoka"`; const w = c.measureText(txt).width + size; if (halo) { const hp = roundRect(-w / 2 - halo, -size * 0.75 - halo, w + halo * 2, size * 1.5 + halo * 2, size * 0.75 + halo); solid(c, hp, PAL.cream, 6, 3); } const p = roundRect(-w / 2, -size * 0.75, w, size * 1.5, size * 0.75); solid(c, p, col, 4, 3); c.fillStyle = K; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 1); c.restore(); };
  const chunky = (c, txt, x, y, size, col, ls = -4) => { c.save(); c.font = `400 ${size}px "Rubik Mono One"`; c.letterSpacing = ls + 'px'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.fillStyle = K; c.fillText(txt, x + size * 0.07, y + size * 0.07); c.lineWidth = Math.max(4, size * 0.09); c.strokeStyle = K; c.strokeText(txt, x, y); c.fillStyle = col; c.fillText(txt, x, y); c.restore(); c.letterSpacing = '0px'; };
  const machine = (c, x, y, knobs, look, mood) => { // the model: a Memphis totem-computer with a funnel and three knobs
    // feet
    for (const sd of [-1, 1]) { const f = new Path2D(); f.arc(x + sd * 60, y + 140, 34, Math.PI, 0); f.closePath(); solid(c, f, PAL.blue, 6, 4); }
    const body = roundRect(x - 115, y - 120, 230, 260, 26); solid(c, body, PAL.lilac, 12, 5);
    c.save(); c.clip(body); c.fillStyle = 'rgba(21,21,21,0.5)'; for (let i = -10; i < 10; i++) { c.beginPath(); c.arc(x - 100 + (i % 5) * 50, y + 80 + Math.floor(i / 5) * 18, 3, 0, 7); c.fill(); } c.restore();
    const scr = roundRect(x - 85, y - 92, 170, 110, 18); solid(c, scr, PAL.cream, 0, 4);
    const dx = (look - 0.5) * 16;
    c.fillStyle = K; c.beginPath(); c.arc(x - 34 + dx, y - 42, 12, 0, 7); c.arc(x + 34 + dx, y - 42, 12, 0, 7); c.fill();
    c.lineWidth = 5; c.strokeStyle = K; c.lineCap = 'round'; c.beginPath(); if (mood > 0) c.arc(x + dx * 0.5, y - 20, 22, 0.2, Math.PI - 0.2); else if (mood < 0) c.arc(x + dx * 0.5, y + 2, 20, Math.PI + 0.3, -0.3); else { c.moveTo(x - 18, y - 6); c.lineTo(x + 18, y - 6); } c.stroke();
    // knobs on the belly
    knobs.forEach((a, i) => { const kx = x - 62 + i * 62, ky = y + 50; const kp = new Path2D(); kp.arc(kx, ky, 20, 0, Math.PI * 2); solid(c, kp, [PAL.magenta, PAL.teal, PAL.yellow][i], 4, 4); c.save(); c.translate(kx, ky); c.rotate(a); c.fillStyle = K; c.fillRect(-3, -18, 6, 16); c.restore(); });
    // funnel on top
    const fn = new Path2D(); fn.moveTo(x - 80, y - 210); fn.lineTo(x + 80, y - 210); fn.lineTo(x + 26, y - 122); fn.lineTo(x - 26, y - 122); fn.closePath();
    solid(c, fn, PAL.yellow, 8, 5); c.save(); c.clip(fn); c.fillStyle = K; for (let i = -6; i < 6; i++) c.fillRect(x + i * 24, y - 220, 9, 110); c.restore(); c.lineWidth = 5; c.strokeStyle = K; c.stroke(fn);
  };

  // static per-scene ground: pastel split, bacterio dashes at hero strength, and a decor layer (terrazzo quarter-disc,
  // dot-grid card, confetti, a squiggle) kept to corners and edges that no story element uses. Built once per scene.
  const GROUNDS = {};
  const confetti = (c, r, spots) => spots.forEach(([x, y], i) => {
    const s = r.range(10, 17), kind = i % 4, col = [PAL.magenta, PAL.blue, PAL.yellow, PAL.teal, PAL.red, K][(i * 5 + 1) % 6];
    c.save(); c.translate(x, y); c.rotate(r.range(0, 7)); const p = new Path2D();
    if (kind <= 1) { p.moveTo(0, -s); p.lineTo(s * 0.9, s * 0.6); p.lineTo(-s * 0.9, s * 0.6); p.closePath(); c.fillStyle = col; c.fill(p); c.lineWidth = 3; c.strokeStyle = K; c.stroke(p); }
    else if (kind === 2) { c.fillStyle = col; c.fillRect(-s * 0.9, -3.5, s * 1.8, 7); }
    else { c.beginPath(); c.arc(0, 0, s * 0.45, 0, 7); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.strokeStyle = K; c.stroke(); }
    c.restore();
  });
  const dotCard = (c, x, y, w, h, col, rot = 0) => { c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); const p = new Path2D(); p.rect(-w / 2, -h / 2, w, h); solid(c, p, col, 8, 4); c.save(); c.clip(p); c.fillStyle = K; for (let yy = -h / 2 + 14; yy < h / 2 - 6; yy += 16) for (let xx = -w / 2 + 14; xx < w / 2 - 6; xx += 16) { c.beginPath(); c.arc(xx, yy, 3, 0, 7); c.fill(); } c.restore(); c.restore(); };
  const quarter = (c, cx, cy, R, a0, seed) => { const p = new Path2D(); p.moveTo(cx, cy); p.arc(cx, cy, R, a0, a0 + Math.PI / 2); p.closePath(); c.save(); c.translate(10, 10); c.fillStyle = K; c.fill(p); c.restore(); terrazzo(c, p, seed); c.lineWidth = 5; c.strokeStyle = K; c.stroke(p); };
  const gridCard = (c, x, y, w, h, col, rot) => { c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); const p = new Path2D(); p.rect(-w / 2, -h / 2, w, h); solid(c, p, col, 8, 4); c.save(); c.clip(p); c.strokeStyle = 'rgba(21,21,21,0.5)'; c.lineWidth = 2; for (let xx = -w / 2; xx < w / 2; xx += 24) { c.beginPath(); c.moveTo(xx, -h / 2); c.lineTo(xx, h / 2); c.stroke(); } for (let yy = -h / 2; yy < h / 2; yy += 24) { c.beginPath(); c.moveTo(-w / 2, yy); c.lineTo(w / 2, yy); c.stroke(); } c.restore(); c.lineWidth = 4; c.strokeStyle = K; c.stroke(p); c.restore(); };
  function sceneGround(scene, grounds, W, HH) {
    const key = scene + ':' + W + 'x' + HH;
    if (GROUNDS[key]) return GROUNDS[key];
    const L = H.layer(W, HH), c = L.getContext('2d');
    c.fillStyle = grounds[0]; c.fillRect(0, 0, W, HH);
    c.fillStyle = grounds[1]; c.beginPath(); c.moveTo(860, 0); c.lineTo(W, 0); c.lineTo(W, HH); c.lineTo(600, HH); c.closePath(); c.fill();
    const rb = H.rng(3 + scene); c.fillStyle = 'rgba(21,21,21,0.55)';
    for (let i = 0; i < 260; i++) { const x = rb.range(0, W), y = rb.range(0, HH), a = rb.range(0, Math.PI); c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.ellipse(0, 0, rb.range(3, 7), 1.6, 0, 0, 7); c.fill(); c.restore(); }
    const r = H.rng(40 + scene);
    c.lineCap = 'round'; c.lineJoin = 'round';
    if (scene === 1) {
      quarter(c, 0, HH, 165, -Math.PI / 2, 21);
      dotCard(c, 1010, 638, 240, 62, PAL.butter, -0.02);
      strokeOutlined(c, squigglePath(430, 688, 230, 9, 3.5, -0.03), PAL.blue, 8, 3, 5);
      confetti(c, r, [[40, 170], [78, 300], [36, 430], [1240, 40], [1150, 70], [1250, 150], [470, 40], [600, 640], [1260, 400]]);
    } else if (scene === 2) {
      quarter(c, W, HH, 165, Math.PI, 22);
      dotCard(c, 1132, 22, 128, 84, PAL.pink, 0.04);
      strokeOutlined(c, squigglePath(620, 690, 240, 10, 3, -0.04), PAL.magenta, 8, 3, 5);
      c.strokeStyle = K; c.lineWidth = 6; c.stroke(zigzagPath(48, 200, 300, 10, 9, Math.PI / 2));
      confetti(c, r, [[40, 640], [110, 690], [380, 670], [900, 640], [880, 40], [1060, 40], [1250, 210], [1240, 300], [440, 40]]);
    } else if (scene === 3) {
      quarter(c, W, HH, 150, Math.PI, 23);
      gridCard(c, 430, 30, 230, 96, PAL.butter, -0.03);
      strokeOutlined(c, squigglePath(30, 680, 210, 9, 3, -0.03), PAL.teal, 8, 3, 5);
      confetti(c, r, [[720, 50], [780, 120], [1250, 60], [1180, 40], [40, 200], [60, 330], [850, 690], [700, 690]]);
    } else {
      quarter(c, W, 0, 160, Math.PI / 2, 24);
      dotCard(c, 560, 652, 240, 50, PAL.mint, 0.02);
      c.strokeStyle = K; c.lineWidth = 6; c.stroke(squigglePath(52, 190, 300, 12, 3, Math.PI / 2));
      confetti(c, r, [[860, 40], [960, 90], [1210, 260], [1240, 380], [1210, 520], [40, 60 + 560], [470, 690], [1240, 660], [760, 40]]);
    }
    GROUNDS[key] = L; return L;
  }

  const explainMemphis = (ctx, W, HH, t) => {
    const c = ctx, E = H.ease, cl = H.clamp;
    const tq = Math.floor(t * 12) / 12; // on twos
    const S = (a, b) => cl((tq - a) / (b - a), 0, 1);
    const pop = (d, x, y, dur = 0.25) => { const s = E.back(S(d, d + dur)); if (s <= 0) return false; c.save(); c.translate(x, y); c.scale(s, s); c.translate(-x, -y); return true; };
    const bob = (ph, a = 5) => Math.sin(tq * 2.4 + ph) * a;
    const BANDS = [5.4, 9.8, 12.35], swap = (b) => b + 0.42;
    const scene = tq < swap(BANDS[0]) ? 1 : tq < swap(BANDS[1]) ? 2 : tq < swap(BANDS[2]) ? 3 : 4;
    const grounds = { 1: [PAL.pink, PAL.mint], 2: [PAL.butter, PAL.lilac], 3: [PAL.mint, PAL.pink], 4: [PAL.lilac, PAL.butter] }[scene];
    c.drawImage(sceneGround(scene, grounds, W, HH), 0, 0);
    const MX = 300, MY = 430; // machine position in scenes 1-2

    // ---------- hook: big bubble, then it shrinks into a corner sticker ----------
    const hp = E.inOut(S(1.7, 2.3));
    {
      const bp = S(0.1, 0.45); const x = H.lerp(640, 200, hp), y = H.lerp(340, 80, hp), sc = H.lerp(1, 0.42, hp), rot = H.lerp(-0.05, -0.06, hp);
      if (bp > 0 && hp < 1) {
        c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc * E.back(bp), sc * E.back(bp));
        solid(c, bubble(820, 300, hp < 0.5 ? [-200, 230] : null), PAL.yellow, 16, 6);
        if (tq >= 0.45) chunky(c, 'HOW DOES', 0, -50, 84, PAL.magenta);
        if (tq >= 0.6) chunky(c, 'AI LEARN?', 0, 60, 84, PAL.blue);
        c.restore();
      }
      if (hp < 1) { strokeOutlined(c, squigglePath(80, 620, 260, 16, 3, -0.1, tq * 3, S(0.3, 0.9)), PAL.teal, 12, 4, 6); if (pop(0.5, 1120, 150)) { c.translate(1120, 150); c.rotate(tq); solid(c, burst(12, 50, 80), PAL.magenta, 8, 4); c.restore(); } }
    }

    // ---------- scene 1: data dropped into the funnel ----------
    if (scene === 1 && tq > 2.0) {
      if (pop(2.0, MX, MY, 0.3)) { machine(c, MX, MY + bob(0, 3), [0.4, -0.8, 1.2], 0.5 + 0.5 * Math.sin(tq * 3), 1); c.restore(); }
      if (tq > 2.3) tag(c, 'MODEL', MX, MY + 200, PAL.butter, 28, -0.05);
      // examples hop in from the right along arcs into the funnel
      for (let i = 0; i < 12; i++) {
        const u = (tq - 2.5 - i * 0.28) / 1.1; if (u < 0 || u > 1) continue;
        const kind = H.rng(i * 9 + 4)() < 0.5 ? 'cat' : 'dog', sx = 1180 - (i % 3) * 120, sy = 560 - (i % 2) * 90;
        const x = H.lerp(sx, MX, u), y = H.lerp(sy, MY - 230, u) - Math.sin(u * Math.PI) * 260, s = 92 * (1 - E.in(cl((u - 0.75) / 0.25, 0, 1)));
        if (s < 8) continue;
        c.save(); c.translate(x, y); c.rotate((1 - u) * (i % 2 ? 0.4 : -0.4)); face(c, kind, 0, 0, s); if (s > 60) tag(c, kind, 0, s * 0.58, kind === 'cat' ? PAL.yellow : PAL.mint, 28); c.restore();
      }
      fatArrow(c, 1000, 250, 520, 200, E.out(S(2.7, 3.1)), PAL.magenta, 20);
      if (tq > 3.0) tag(c, 'TRAINING DATA', 800, 160, PAL.cream, 28, -0.08, 9);
      // counter sticker pops every time it ticks
      const cp = S(3.0, 5.2), n = cp < 1 ? Math.pow(cp, 3) * 1e6 : 1e6, beat = 1 + 0.06 * (Math.floor(tq * 12) % 2);
      if (pop(2.9, 960, 520, 0.3)) {
        c.translate(960, 520); c.rotate(0.05); c.scale(beat, beat);
        const st = roundRect(-250, -70, 500, 140, 30); solid(c, st, PAL.cream, 10, 5);
        chunky(c, Math.round(n).toLocaleString('en-US'), 0, -12, 64, PAL.red, -6);
        c.font = '700 30px "Fredoka"'; c.fillStyle = K; c.textAlign = 'center'; c.fillText('EXAMPLES', 0, 50);
        c.restore();
      }
    }

    // ---------- scene 2: guess -> check -> adjust ----------
    if (scene === 2) {
      const t0 = swap(BANDS[0]), adj = E.inOut(S(8.3, 9.0)), right = tq >= 9.3;
      const knobs = [H.lerp(0.4, -1.2, adj), H.lerp(-0.8, 0.9, adj), H.lerp(1.2, 0.1, adj)];
      machine(c, MX, MY + bob(0, 3), knobs, right ? 0.9 : 0.8, tq < 7.4 ? 0 : right ? 1 : -1);
      // new picture
      if (pop(t0 + 0.1, 560, 470, 0.3)) { face(c, 'cat', 560, 470, 130); c.restore(); }
      if (tq > t0 + 0.35) tag(c, 'NEW PICTURE', 560, 570, PAL.cream, 24, 0.04);
      // speech bubble with the guess
      const bx = 600, by = 200;
      const say = (txt, col, d) => { const s = E.back(S(d, d + 0.25)); if (s <= 0) return false; c.save(); c.translate(bx, by); c.scale(s, s); solid(c, bubble(300, 130, [-110, 110]), PAL.cream, 8, 5); chunky(c, txt, 0, 4, 60, col); c.restore(); return true; };
      if (!right && say('DOG?', PAL.blue, 6.7)) {
        if (tq >= 7.4) { // CHECK: starburst + squiggly cross
          c.save(); c.translate(bx + 200, by - 40); c.rotate(tq * 0.8); solid(c, burst(10, 44, 70), PAL.red, 6, 4); c.restore();
          c.save(); c.translate(bx + 200, by - 40); c.lineCap = 'round'; c.strokeStyle = PAL.cream; c.lineWidth = 12; c.beginPath(); c.moveTo(-22, -22); c.lineTo(22, 22); c.moveTo(22, -22); c.lineTo(-22, 22); c.stroke(); c.restore();
          tag(c, 'NOPE, IT’S A CAT!', bx + 20, by - 102, PAL.red, 26, -0.04);
        }
      }
      if (right && say('CAT!', PAL.magenta, 9.3)) {
        if (tq >= 9.6) { c.save(); c.translate(bx + 190, by - 40); solid(c, burst(10, 44, 66), PAL.teal, 6, 4); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = K; c.lineWidth = 11; c.beginPath(); c.moveTo(-22, 2); c.lineTo(-6, 18); c.lineTo(24, -18); c.stroke(); c.restore(); }
      }
      // ADJUST: a zigzag bolt runs back from the check to the knobs
      if (tq >= 7.8 && tq < 9.3) { strokeOutlined(c, zigzagPath(bx + 190, by + 10, 480, 18, 10, 2.45, S(7.8, 8.2)), PAL.yellow, 11, 4, 6); if (tq > 8.2) tag(c, 'ERROR!', 520, 380, PAL.yellow, 26, 0.1); }
      // the loop on the right: three patterned shapes chased by chunky arrows
      const L = [['GUESS', 1000, 170, 'circle', PAL.magenta], ['CHECK', 1160, 400, 'tri', PAL.teal], ['ADJUST', 900, 470, 'square', PAL.blue]], act = tq < 7.4 ? 0 : tq < 8.2 ? 1 : tq < 9.3 ? 2 : Math.floor((tq - 9.3) * 3) % 3;
      L.forEach(([s, x, y, sh, col], i) => {
        if (!pop(t0 + 0.2 + i * 0.12, x, y, 0.25)) return;
        const k = i === act && tq > 6.7 ? 1.12 + 0.04 * Math.sin(tq * 12) : 1; c.translate(x, y); c.scale(k, k); c.translate(-x, -y);
        const p = new Path2D(); if (sh === 'circle') p.arc(x, y, 62, 0, 7); else if (sh === 'tri') { p.moveTo(x, y - 70); p.lineTo(x + 70, y + 52); p.lineTo(x - 70, y + 52); p.closePath(); } else p.rect(x - 60, y - 55, 120, 110);
        solid(c, p, col, 8, 5);
        c.save(); c.clip(p); c.fillStyle = 'rgba(21,21,21,0.35)'; for (let a = -4; a < 5; a++) for (let b = -4; b < 5; b++) { c.beginPath(); c.arc(x + a * 18, y + b * 18, 2.6, 0, 7); c.fill(); } c.restore();
        tag(c, s, x, y + (sh === 'tri' ? 24 : 4), PAL.cream, 24); c.restore();
      });
      fatArrow(c, 1050, 225, 1120, 320, E.out(S(7.1, 7.35)), PAL.yellow, 18);
      fatArrow(c, 1090, 450, 975, 470, E.out(S(7.9, 8.15)), PAL.yellow, 18);
      fatArrow(c, 880, 400, 945, 240, E.out(S(9.0, 9.25)), PAL.yellow, 18);
    }

    // ---------- scene 3: progress ----------
    if (scene === 3) {
      const t0 = swap(BANDS[1]), prog = E.inOut(S(t0 + 0.2, 11.9)), base = 600, x0 = 110;
      const ax = new Path2D(); ax.rect(x0 - 10, base, 700, 12); solid(c, ax, K, 0, 0);
      for (let i = 0; i < 8; i++) {
        const acc = 61 + 36 * (1 - Math.pow(1 - i / 7, 2)), bp = E.back(cl(prog * 8 - i, 0, 1)), h = (acc - 40) * 7 * bp; if (h <= 1) continue;
        const p = new Path2D(); p.rect(x0 + 10 + i * 84, base - h, 62, h); solid(c, p, [PAL.magenta, PAL.blue, PAL.yellow, PAL.teal][i % 4], 7, 4);
        c.save(); c.clip(p); if (i % 2) { c.fillStyle = 'rgba(21,21,21,0.5)'; for (let y = base - h; y < base; y += 16) c.fillRect(x0 + 10 + i * 84, y, 62, 6); } else { c.fillStyle = PAL.cream; for (let y = base - h + 8; y < base; y += 18) for (let x = 0; x < 3; x++) { c.beginPath(); c.arc(x0 + 22 + i * 84 + x * 19, y, 3.5, 0, 7); c.fill(); } } c.restore();
      }
      if (tq > t0 + 0.2) tag(c, 'TRAINING ROUNDS →', 440, 655, PAL.cream, 26);
      // emphasis burst + confetti behind the number
      const em = S(11.9, 12.1);
      if (em > 0) { c.save(); c.translate(1010, 330); c.rotate(tq * 0.6); c.scale(E.back(em), E.back(em)); solid(c, burst(16, 150, 215), PAL.yellow, 12, 5); c.restore();
        const rc = H.rng(5); for (let i = 0; i < 18; i++) { const a = rc.range(0, 7), d = 200 + rc.range(0, 120) * em; c.save(); c.translate(1010 + Math.cos(a) * d, 330 + Math.sin(a) * d); c.rotate(a + tq * 3); c.fillStyle = rc.pick([PAL.magenta, PAL.blue, PAL.teal, K]); c.beginPath(); c.moveTo(0, -12); c.lineTo(11, 8); c.lineTo(-11, 8); c.closePath(); c.fill(); c.restore(); } }
      if (pop(t0 + 0.1, 1010, 330, 0.3)) { chunky(c, Math.round(H.lerp(61, 97, prog)) + '%', 1010, 330, 120, PAL.magenta, -10); c.restore(); }
      if (tq > t0 + 0.3) tag(c, 'ACCURACY', 1010, 200, PAL.cream, 26, -0.05);
      if (tq > t0 + 0.5) tag(c, '61% → 97%', 1010, 450, PAL.mint, 24, 0.04);
    }

    // ---------- scene 4: takeaway ----------
    if (scene === 4) {
      const t0 = swap(BANDS[2]);
      if (pop(t0 + 0.05, 640, 360, 0.3)) {
        c.translate(640, 360); c.rotate(-0.04 + Math.sin(tq * 2.4) * 0.01);
        solid(c, bubble(1000, 360, [-300, 250]), PAL.yellow, 16, 6);
        chunky(c, 'MORE EXAMPLES', 0, -70, 68, PAL.blue, -6);
        if (tq >= t0 + 0.35) chunky(c, 'BETTER GUESSES!', 0, 80, 68, PAL.magenta, -6);
        c.restore();
      }
      fatArrow(c, 640, 330, 640, 380, E.out(S(t0 + 0.2, t0 + 0.4)), PAL.teal, 16);
      strokeOutlined(c, squigglePath(120, 640, 280, 16, 3, -0.08, tq * 3, S(t0 + 0.3, t0 + 0.8)), PAL.magenta, 12, 4, 6);
      strokeOutlined(c, zigzagPath(900, 640, 260, 16, 9, -0.05, S(t0 + 0.4, t0 + 0.9)), PAL.teal, 11, 4, 6);
    }

    // ---------- corner sticker header (after the hook) ----------

    // ---------- striped band swipe between scenes ----------
    for (const b of BANDS) {
      const u = S(b, b + 0.85); if (u <= 0 || u >= 1) continue;
      const x = H.lerp(-2300, W + 900, u);
      c.save(); c.translate(x, HH / 2); c.rotate(-0.35);
      const band = new Path2D(); band.rect(0, -1400, 1700, 2800);
      c.save(); c.translate(14, 14); c.fillStyle = K; c.fill(band); c.restore();
      c.save(); c.clip(band); const cols = [PAL.magenta, PAL.yellow, PAL.blue, PAL.mint, PAL.red];
      for (let i = 0; i < 20; i++) { c.fillStyle = cols[i % cols.length]; c.fillRect(i * 85, -1400, 86, 2800); c.fillStyle = K; for (let y = -1400; y < 1400; y += 40) { c.beginPath(); c.arc(i * 85 + 42, y + (i % 2) * 20, 5, 0, 7); c.fill(); } }
      c.restore(); c.lineWidth = 6; c.strokeStyle = K; c.stroke(band); c.restore();
    }
    // header sticker stays on top
    if (hp >= 1) { c.save(); c.translate(200, 80); c.rotate(-0.06); c.scale(0.42, 0.42); solid(c, bubble(820, 300, null), PAL.yellow, 16, 6); chunky(c, 'HOW DOES', 0, -50, 84, PAL.magenta); chunky(c, 'AI LEARN?', 0, 60, 84, PAL.blue); c.restore(); }
    H.grain(ctx, W, HH, 0.05, 6 + Math.floor(t * 12), true);
  };

  registerStyle({
    id: 'memphis',
    name: 'Memphis Group',
    category: 'Art & Design Movements',
    description: 'Early-80s Memphis Milano maximalism: pastel grounds clashing with bold primaries, thick black outlines and hard offset shadows, squiggles, zigzags, dot grids, terrazzo chips and confetti triangles, all orbiting a chunky tilted chat-bubble headline.',
    motion: 'Cut-out cel timing on twos: the mint wedge slides in, shapes pop on one by one with springy overshoot, squiggles and zigzags draw themselves, the chat bubble squash-and-stretches in, the words pop on the beat, confetti bursts out and the sticker slaps on; then everything bobs off-beat and the typing dots bounce.',
    fonts: ['400 92px "Rubik Mono One"', '700 26px "Fredoka"'],
    frameT: 4.1,
    duration: 4.5,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'Memphis cut-out animation on twos: examples hop into a funnel-topped totem computer, scenes change with a striped polka-dot band that swipes across, arrows are fat outlined shapes with hard shadows, counters are stickers that pop on each tick, and the key moments get a spinning starburst.',
    explainer(ctx, W, HH, t) { explainMemphis(ctx, W, HH, t); },
    // Sound: a playful 80s cut-out cartoon. Stickers and shapes land with rubbery pops, things hop on springy boings,
    // the striped band swipes across as a fluttering zip, labels get bright synth stabs, the wrong guess is a sad
    // "wah-wah" and the zigzag a buzzy zap, under a light synth-pop pulse. Times copied from explainMemphis(); it
    // animates on twos at 12 fps, so q(x) is the first frame at which its quantised clock reaches x.
    explainerSound(k) {
      const D = 14.5, E = H.ease, cl = H.clamp;
      const q = (x) => Math.ceil(x * 12 - 1e-6) / 12;
      const land = (d, dur) => q(d + dur * 0.37); // back-eased pop(d, dur) first reaches full size at 37%
      const pan = (px) => cl((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (a, b, ease, u) => { for (let i = 0; i <= 400; i++) if (ease(i / 400) >= u - 1e-6) return q(a + ((b - a) * i) / 400); return q(b); };
      const BANDS = [5.4, 9.8, 12.35], swap = (b) => b + 0.42, MX_ = 300; // MX_: the machine's x in scenes 1-2
      // rubbery sticker pop (kept low)
      const pop = (t, f, g, p, minor = true) => k.play('pop', t, { f, gain: g, pan: p, minor });
      // springy boing: quick upward bend that sags back
      const boing = (t, f, g, p, minor = true) => { k.tone(t, { f: [[0, f], [0.04, f * 2.4], [0.3, f * 1.3]], type: 'triangle', dur: 0.32, gain: 0.12 * g, a: 0.003, pan: p, minor }); k.tone(t, { f: [[0, f * 2], [0.05, f * 3.5], [0.2, f * 2.2]], dur: 0.2, gain: 0.03 * g, pan: p, minor }); };
      // bright 80s synth stab (detuned saws through a closing filter)
      const stab = (t, notes, g, p, minor) => notes.forEach((n, i) => { for (const det of [-10, 10])
        k.tone(t, { f: n, type: 'sawtooth', detune: det, dur: 0.28, gain: 0.03 * g, a: 0.004, hold: 0.05, filter: 'lowpass', f2: [[0, 2600], [0.25, 700]], q: 2, pan: p + (i - 1) * 0.15, verb: 0.2, minor }); });
      // the striped band: a fluttering zip as ~20 stripes rush past, left to right
      const zip = (b) => {
        const d = 0.85;
        k.tone(b + 0.1, { f: [[0, 160], [d - 0.15, 520]], type: 'sawtooth', dur: d - 0.1, gain: 0.04, a: 0.25, filter: 'lowpass', f2: 1200, q: 3 });
        for (let x = 0.08; x < d - 0.05; x += 1 / 28) { const e = Math.sin((x / d) * Math.PI);
          k.noise(b + x, { dur: 0.025, filter: 'bandpass', f: 800 + e * 700, q: 1.5, gain: 0.16 * e, a: 0.002, pan: (x / d - 0.5) * 1.4 }); }
      };
      // a cartoon hand clap
      const clap = (t, g, p) => [0, 0.012, 0.022].forEach((o) => k.noise(t + o, { dur: 0.05, filter: 'bandpass', f: 1300, q: 1.1, gain: 0.22 * g, a: 0.001, pan: p }));

      k.music('pulse', 0, D, { bpm: 112, gain: 0.3, chords: [['C4', 'E4', 'G4', 'B4'], ['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'B3', 'D4', 'F4']] });

      // ---- hook: bubble pops up (back 0.1-0.45), HOW DOES (0.5), AI LEARN? + starburst (0.667), squiggle draws (0.3-0.9)
      pop(land(0.1, 0.35), 360, 1.1, 0, false); boing(land(0.1, 0.35), 120, 0.8, 0, false);
      stab(q(0.45), ['E4', 'G4', 'C5'], 0.9, -0.1, true);
      stab(q(0.6), ['G4', 'C5', 'E5'], 1.1, 0.1, false); pop(q(0.6), 480, 0.8, pan(1120));
      k.tone(0.32, { f: [[0, 140], [0.3, 220], [0.6, 170]], type: 'triangle', dur: 0.6, gain: 0.05, a: 0.1, filter: 'lowpass', f2: 900, pan: pan(200), minor: true }); // squiggle wiggles on
      // bubble shrinks into the corner sticker (1.7-2.3): soft slide
      k.noise(q(1.7), { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.6, 350]], q: 0.8, gain: 0.07, a: 0.2, pan: -0.4, minor: true });

      // ---- scene 1: DATA hops into the funnel
      boing(land(2.0, 0.3), 90, 0.7, pan(MX_), false); k.play('thud', land(2.0, 0.3), { f: 120, gain: 0.2, pan: pan(MX_) });
      pop(q(2.3 + 1e-3), 420, 0.6, pan(MX_)); // MODEL tag
      const hops = []; for (let i = 0; 2.5 + i * 0.28 < 5.3; i++) hops.push(q(2.5 + i * 0.28));
      hops.forEach((t, i) => boing(t, 150 + (i % 3) * 25, 0.55, pan(1180 - (i % 3) * 120)));
      k.play('slap', when(2.7, 3.1, E.out, 0.95), { gain: 0.4, pan: pan(600), minor: true }); // fat arrow lands
      pop(q(3.0 + 1e-3), 520, 0.8, pan(880)); // TRAINING DATA tag + counter sticker
      // counter sticker swells on every other frame (6/s) while n = S(3.0,5.2)^3 * 1e6 ticks over
      for (let f = Math.ceil(3.1 * 12); f / 12 < 5.2; f++) { const t = f / 12; if (f % 2 !== 1 || hops.some((h) => Math.abs(t - h) < 0.04)) continue;
        pop(t, 640, 0.42, pan(960)); k.play('tick', t, { f: 2200, gain: 0.5, pan: pan(960), minor: true }); }
      stab(q(5.2), ['C4', 'E4', 'G4', 'C5'], 1.2, pan(960)); pop(q(5.2), 300, 1, pan(960), false); // 1,000,000

      // ---- the striped band swipes: 5.4, 9.8, 12.35
      BANDS.forEach(zip);

      // ---- scene 2: GUESS / CHECK / ADJUST (t0 = 5.82)
      const t0 = swap(BANDS[0]);
      pop(land(t0 + 0.1, 0.3), 380, 0.9, pan(560)); // new picture
      [0, 1, 2].forEach((i) => pop(land(t0 + 0.2 + i * 0.12, 0.25), [440, 520, 600][i], 0.6, pan([1000, 1160, 900][i]))); // loop shapes
      // the guess: DOG? bubble (back 6.7-6.95) with a questioning two-note blip
      pop(land(6.7, 0.25), 340, 0.9, pan(600), false);
      k.tone(land(6.7, 0.25) + 0.05, { f: 'D4', type: 'square', dur: 0.1, gain: 0.05, a: 0.003, hold: 0.06, filter: 'lowpass', f2: 1400, pan: pan(600) });
      k.tone(land(6.7, 0.25) + 0.16, { f: 'A4', type: 'square', dur: 0.14, gain: 0.05, a: 0.003, hold: 0.08, filter: 'lowpass', f2: 1400, pan: pan(600) });
      k.play('slap', when(7.1, 7.35, E.out, 0.95), { gain: 0.3, pan: pan(1090), minor: true });
      // CHECK (7.417): starburst + cross + NOPE — a sad wah-wah
      const ck = q(7.4);
      pop(ck, 260, 1.1, pan(800), false); k.play('thud', ck, { f: 110, gain: 0.4, pan: pan(800) });
      [['G3', 'F#3'], ['F#3', 'E3']].forEach(([a, b], i) => k.tone(ck + 0.05 + i * 0.24, { f: [[0, a], [0.2, b]], type: 'sawtooth', dur: i ? 0.45 : 0.22, gain: 0.12, a: 0.02, hold: 0.12, filter: 'lowpass', f2: [[0, 500], [0.1, 1300], [0.22, 500]], q: 3, pan: pan(800) }));
      // ADJUST: the zigzag bolt zaps back to the knobs (7.8-8.2), ERROR! tag (8.25)
      for (let x = 0; x < 0.4; x += 0.04) k.tone(q(7.8) + x, { f: 70 + (x * 37 % 1) * 60, type: 'sawtooth', dur: 0.035, gain: 0.07, a: 0.002, filter: 'bandpass', f2: 1500, q: 1.5, pan: pan(700 - x * 600) });
      pop(q(8.2 + 1e-3), 420, 0.7, pan(520));
      // knobs twist (inOut 8.3-9.0): ratchet clicks at least 90 ms apart
      for (let i = 1, lt = 0; i <= 8; i++) { const t = when(8.3, 9.0, E.inOut, i / 8); if (t - lt < 0.09) continue; lt = t; k.play('click', t, { f: 1100, gain: 0.6, pan: pan(MX_), minor: true }); k.play('tock', t + 0.004, { f: 500 + i * 20, gain: 0.25, pan: pan(MX_), minor: true }); }
      k.play('slap', when(9.0, 9.25, E.out, 0.95), { gain: 0.3, pan: pan(910), minor: true });
      // the correction: CAT! bubble (9.417), teal starburst + tick (9.667) — a bouncy major arpeggio
      pop(land(9.3, 0.25), 420, 0.9, pan(600));
      ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => k.tone(q(9.6) + i * 0.06, { f: n, type: 'triangle', dur: 0.35, gain: 0.13, a: 0.003, pan: pan(790), verb: 0.2 }));
      pop(q(9.6), 500, 0.9, pan(790), false);

      // ---- scene 3: PROGRESS (t0 = 10.22): number pops (10.5), bars spring up one by one as prog = inOut(S(10.42,11.9)) passes i/8
      const t3 = swap(BANDS[1]);
      pop(land(t3 + 0.1, 0.3), 330, 0.9, pan(1010), false);
      const bars = []; for (let i = 0; i < 8; i++) { const t = when(t3 + 0.2, 11.9, E.inOut, i / 8 + 0.02); if (bars.length && t - bars[bars.length - 1] < 0.09) continue; bars.push(t); boing(t, 110 + i * 14, 0.6, pan(150 + i * 84)); }
      for (let f = Math.ceil(10.5 * 12), last = 61; f / 12 < 11.9; f++) { const t = f / 12, v = Math.round(H.lerp(61, 97, E.inOut(cl((t - t3 - 0.2) / (11.9 - t3 - 0.2), 0, 1))));
        if (v !== last && !bars.some((b) => Math.abs(t - b) < 0.04)) { pop(t, 680, 0.38, pan(1010)); k.play('tick', t, { f: 2200, gain: 0.5, pan: pan(1010), minor: true }); last = v; } }
      // 97%: yellow starburst springs out with confetti (12.0) — the biggest hit
      const big = land(11.9, 0.2);
      k.play('impact', big, { gain: 1.7, pan: pan(1010) }); k.play('thud', big, { f: 70, gain: 0.6 });
      stab(big, ['C4', 'E4', 'G4', 'C5'], 1.6, pan(1010));
      clap(big, 1, pan(1010)); boing(big, 80, 1.2, pan(1010), false);
      for (let i = 0; i < 6; i++) pop(big + 0.3 + i * 0.08, 280 + (i * 97) % 300, 0.6, (i % 2 ? 0.4 : -0.4) + pan(1010) * 0.5); // confetti flies out

      // ---- scene 4: TAKEAWAY (t0 = 12.77): bubble pops (13.0), arrow, BETTER GUESSES! (13.167), squiggle + zigzag draw on
      const t4 = swap(BANDS[2]);
      pop(land(t4 + 0.05, 0.3), 340, 1.0, 0, false); boing(land(t4 + 0.05, 0.3), 110, 0.7, 0);
      k.tone(q(t4 + 0.3), { f: [[0, 150], [0.5, 230]], type: 'triangle', dur: 0.5, gain: 0.04, a: 0.1, filter: 'lowpass', f2: 900, pan: -0.5, minor: true });
      stab(q(t4 + 0.35), ['F4', 'A4', 'C5'], 0.8, 0.1, true);
      ['C4', 'G4', 'C5', 'E5'].forEach((n, i) => k.tone(q(t4 + 0.35) + 0.25 + i * 0.07, { f: n, type: 'triangle', dur: 0.8, gain: 0.12 - i * 0.015, a: 0.003, pan: (i - 1.5) * 0.25, verb: 0.3 })); // resolves
      clap(q(t4 + 0.35) + 0.25, 0.6, 0);
    },
    draw(ctx, W, HH, t) {
      const c = ctx;
      // cel-style timing: all motion is held for two frames (12 fps steps) like 80s cut-out animation
      const tq = Math.floor(t * 12) / 12;
      const bob = (ph, a = 6) => Math.sin(tq * 2.1 + ph) * a;
      const P = (d, dur = 0.5) => H.clamp((tq - d) / dur, 0, 1);
      const pop = (d, x, y, dur = 0.25) => { const s = H.ease.back(P(d, dur)); if (s <= 0) return false; c.save(); c.translate(x, y); c.scale(s, s); c.translate(-x, -y); return true; };

      // ---------- ground: pastel split (mint wedge slides in) ----------
      c.fillStyle = PAL.pink; c.fillRect(0, 0, W, HH);
      { const off = (1 - H.ease.out(P(0, 0.33))) * 760;
        c.fillStyle = PAL.mint; c.beginPath(); c.moveTo(820 + off, 0); c.lineTo(W + off, 0); c.lineTo(W + off, HH); c.lineTo(560 + off, HH); c.closePath(); c.fill(); }
      // fine black dash texture on the pink (classic Memphis "bacterio"-lite), sprinkled on
      const rb = H.rng(3), nb = Math.floor(260 * P(0.15, 0.4));
      c.fillStyle = 'rgba(21,21,21,0.55)';
      for (let i = 0; i < 260; i++) {
        const x = rb.range(0, 760), y = rb.range(0, HH); const a = rb.range(0, Math.PI), l = rb.range(3, 7);
        if (i >= nb) continue;
        c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.ellipse(0, 0, l, 1.6, 0, 0, 7); c.fill(); c.restore();
      }

      // ---------- background shapes, popping in one by one ----------
      // terrazzo semicircle dropping from the top-left
      { const dy = -(1 - H.ease.back(P(0.25, 0.3))) * 230;
        const semi = new Path2D(); semi.arc(210, -10 + bob(0.3, 4) + dy, 190, 0, Math.PI); semi.closePath();
        c.save(); c.translate(10, 10); c.fillStyle = K; c.fill(semi); c.restore();
        terrazzo(c, semi, 11); c.lineWidth = 5; c.strokeStyle = K; c.stroke(semi); }

      // dot grid panel (top right)
      if (pop(0.42, 1065, 139)) {
        c.translate(0, bob(1.2, 3));
        const dg = new Path2D(); dg.rect(930, 54, 270, 170);
        solid(c, dg, PAL.butter, 10);
        c.fillStyle = K; for (let y = 70; y < 220; y += 18) for (let x = 946; x < 1196; x += 18) { c.beginPath(); c.arc(x, y, 3.4, 0, 7); c.fill(); }
        c.restore();
      }

      // big blue circle bottom-left with stripes inside half
      if (pop(0.58, 190, 560)) {
        const bc = new Path2D(); bc.arc(190, 560 + bob(2.0, 5), 122, 0, Math.PI * 2);
        solid(c, bc, PAL.blue, 12);
        c.save(); c.clip(bc); c.fillStyle = PAL.cream; for (let x = 60; x < 330; x += 22) c.fillRect(x, 560, 11, 200); c.restore();
        c.lineWidth = 5; c.strokeStyle = K; c.stroke(bc);
        c.restore();
      }

      // teal triangle bottom-right
      if (pop(0.72, 1090, 560)) {
        c.translate(1090, 560); c.rotate(-0.2 + Math.sin(tq * 1.3) * 0.05);
        const tri = new Path2D(); tri.moveTo(0, -120); tri.lineTo(115, 85); tri.lineTo(-115, 85); tri.closePath();
        solid(c, tri, PAL.teal, 12);
        c.save(); c.clip(tri); c.fillStyle = K; for (let k = -6; k < 8; k++) { c.beginPath(); c.arc(k * 26, 40, 4, 0, 7); c.fill(); c.beginPath(); c.arc(k * 26 + 13, 64, 4, 0, 7); c.fill(); } c.restore();
        c.restore();
      }

      // lilac slab tilted behind bubble (unfolds sideways)
      { const sx = H.ease.back(P(0.88, 0.25));
        if (sx > 0) {
          c.save(); c.translate(660, 360); c.rotate(0.09); c.scale(sx, 1);
          const slab = new Path2D(); slab.rect(-360, -150, 700, 300);
          solid(c, slab, PAL.lilac, 0);
          c.save(); c.clip(slab); c.strokeStyle = 'rgba(21,21,21,0.5)'; c.lineWidth = 2;
          for (let x = -360; x < 360; x += 30) { c.beginPath(); c.moveTo(x, -150); c.lineTo(x, 150); c.stroke(); }
          for (let y = -150; y < 150; y += 30) { c.beginPath(); c.moveTo(-360, y); c.lineTo(360, y); c.stroke(); }
          c.restore(); c.lineWidth = 5; c.strokeStyle = K; c.stroke(slab);
          c.restore();
        } }

      // squiggles + zigzags draw themselves on
      const dr = (d) => H.ease.inOut(P(d, 0.4));
      if (dr(1.0) > 0) strokeOutlined(c, squigglePath(400, 92, 300, 18, 3.5, -0.08, tq * 3, dr(1.0)), PAL.yellow, 14, 4, 7);
      if (dr(1.1) > 0) strokeOutlined(c, zigzagPath(940, 290, 230, 18, 9, 0.12, dr(1.1)), PAL.magenta, 13, 4, 7);
      c.lineCap = 'round'; c.strokeStyle = K; c.lineWidth = 7;
      if (dr(1.2) > 0) c.stroke(squigglePath(610, 668, 200, 12, 4, -0.08, -tq * 3, dr(1.2)));
      if (dr(1.05) > 0) c.stroke(squigglePath(70, 250, 140, 12, 2.5, 1.35, tq * 2.5, dr(1.05)));
      if (dr(1.25) > 0) strokeOutlined(c, zigzagPath(330, 640, 160, 14, 7, -0.05, dr(1.25)), PAL.blue, 10, 3.5, 6);

      // confetti: bursts out of the bubble, then tumbles in place
      const rc = H.rng(77);
      const keep = (x, y) => !(x > 250 && x < 1060 && y > 170 && y < 560);
      const cols = [PAL.magenta, PAL.blue, PAL.yellow, PAL.teal, PAL.red, K];
      let placed = 0;
      for (let i = 0; i < 200 && placed < 34; i++) {
        const x = rc.range(40, W - 40), y = rc.range(30, HH - 30); if (!keep(x, y)) continue;
        if (Math.hypot(x - 190, y - 560) < 150 || (x > 910 && x < 1220 && y > 40 && y < 240) || Math.hypot(x - 210, y) < 210 || Math.hypot(x - 1090, y - 570) < 150) continue;
        placed++;
        const s = rc.range(10, 18), kind = rc.int(0, 3), col = rc.pick(cols), rot = rc.range(0, 7) + tq * rc.range(-1.5, 1.5), dl = rc.range(0, 0.15);
        const fp = H.ease.out(P(1.4 + dl, 0.4)); if (fp <= 0) continue;
        const px = H.lerp(640, x, fp), py = H.lerp(350, y, fp) - Math.sin(fp * Math.PI) * 60;
        c.save(); c.translate(px, py + bob(i, 3)); c.rotate(rot + (1 - fp) * 6);
        const p = new Path2D();
        if (kind <= 1) { p.moveTo(0, -s); p.lineTo(s * 0.9, s * 0.6); p.lineTo(-s * 0.9, s * 0.6); p.closePath(); c.fillStyle = col; c.fill(p); c.lineWidth = 3; c.strokeStyle = K; c.stroke(p); }
        else if (kind === 2) { c.fillStyle = col; c.fillRect(-s * 0.9, -3.5, s * 1.8, 7); }
        else { c.beginPath(); c.arc(0, 0, s * 0.45, 0, 7); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.strokeStyle = K; c.stroke(); }
        c.restore();
      }

      // ---------- hero: chunky chat bubble headline (squash & stretch pop) ----------
      const bp = P(1.3, 0.4);
      if (bp > 0) {
        const e = H.ease.back(bp), breathe = bp >= 1 ? Math.sin(tq * 2.4) * 0.012 : 0;
        const sxB = bp < 1 ? e * (1 + 0.25 * Math.sin(bp * Math.PI)) : 1 + breathe, syB = bp < 1 ? e * (1 - 0.18 * Math.sin(bp * Math.PI)) : 1 - breathe;
        c.save(); c.translate(640, 350); c.rotate(-0.06); c.scale(sxB, syB);
        const bw = 640, bh = 250, rr = 46;
        const bub = new Path2D();
        bub.moveTo(-bw / 2 + rr, -bh / 2); bub.lineTo(bw / 2 - rr, -bh / 2); bub.quadraticCurveTo(bw / 2, -bh / 2, bw / 2, -bh / 2 + rr);
        bub.lineTo(bw / 2, bh / 2 - rr); bub.quadraticCurveTo(bw / 2, bh / 2, bw / 2 - rr, bh / 2);
        bub.lineTo(-150, bh / 2); bub.lineTo(-230, bh / 2 + 80); bub.lineTo(-215, bh / 2);
        bub.lineTo(-bw / 2 + rr, bh / 2); bub.quadraticCurveTo(-bw / 2, bh / 2, -bw / 2, bh / 2 - rr);
        bub.lineTo(-bw / 2, -bh / 2 + rr); bub.quadraticCurveTo(-bw / 2, -bh / 2, -bw / 2 + rr, -bh / 2); bub.closePath();
        solid(c, bub, PAL.yellow, 16, 6);
        // headline: chunky with hard shadow, each word pops on its own beat
        c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.font = '400 92px "Rubik Mono One"'; c.letterSpacing = '-7px';
        const line = (txt, a, b, d, e2) => {
          let x = 0, y = a, col = b; if (e2) { x = a; y = b; col = d; }
          c.lineJoin = 'round';
          c.fillStyle = K; c.fillText(txt, x + 7, y + 7);
          c.lineWidth = 8; c.strokeStyle = K; c.strokeText(txt, x, y);
          c.fillStyle = col; c.fillText(txt, x, y);
        };
        if (pop(1.6, 0, -40, 0.2)) { line('HELLO', -12, PAL.magenta); c.restore(); }
        { const wH = c.measureText('HUMAN').width, wX = c.measureText('!').width * 0.45, x0 = -(wH + wX) / 2;
          if (pop(1.75, 0, 60, 0.2)) { c.textAlign = 'left'; line('HUMAN', x0, 88, PAL.blue, true); c.restore(); }
          const bx = x0 + wH - c.measureText('!').width * 0.32;
          if (pop(1.92, bx + 30, 50, 0.2)) { c.textAlign = 'left'; c.translate(bx, 0); c.rotate(0.12); line('!', 0, 88, PAL.magenta, true); c.restore(); }
          c.textAlign = 'center'; }
        c.letterSpacing = '0px';
        // typing dots badge
        if (pop(2.05, 250, -118, 0.2)) {
          c.translate(250, -118); c.rotate(0.1);
          const bd = new Path2D(); bd.ellipse(0, 0, 62, 30, 0, 0, Math.PI * 2);
          solid(c, bd, PAL.cream, 6, 4);
          for (let k = 0; k < 3; k++) { const up = Math.max(0, Math.sin(tq * 6 - k * 0.9)) * 6; c.fillStyle = [PAL.magenta, PAL.teal, PAL.blue][k]; c.beginPath(); c.arc(-24 + k * 24, -up, 8, 0, 7); c.fill(); c.lineWidth = 3; c.strokeStyle = K; c.stroke(); }
          c.restore();
        }
        c.restore();
      }

      // small caption sticker slapped on last
      { const sp = P(2.2, 0.2);
        if (sp > 0) {
          const k = H.ease.out(sp);
          c.save(); c.translate(860, 548); c.rotate(-0.04 - (1 - k) * 0.35); c.scale(1.35 - 0.35 * k, 1.35 - 0.35 * k);
          const st = new Path2D(); st.rect(-120, -24, 240, 48);
          solid(c, st, PAL.cream, 7 * k, 4);
          c.fillStyle = K; c.font = '700 26px "Fredoka"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('your new AI pal', 0, 1);
          c.restore();
        } }

      // ---------- print finish ----------
      H.grain(ctx, W, HH, 0.05, 6 + Math.floor(t * 12), true);
    },
  });
}
```
