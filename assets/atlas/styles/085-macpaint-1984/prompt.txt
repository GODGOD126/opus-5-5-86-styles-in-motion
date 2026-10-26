I want an animated explainer made in the "MacPaint 1984" visual style (Retro Digital). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Inter, Libre Baskerville, Silkscreen
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Silkscreen&display=block">
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
Name: MacPaint 1984
Family: Retro Digital
Look: Pure 1-bit black & white at the original 72-dpi grain: real Atkinson-dithered grayscale (blown-out highlights, crunchy shadows), 8x8 fill patterns, striped title bars, marching ants and bitmap type.
Motion: Built the way a 1984 user would: the dithered image scans in row by row, then pencil, line, bucket, rectangle and text tools each switch on in the palette and lay down their marks in snappy, unanimated 1-bit steps, ending on crawling marching ants.
How it explains: Explains with the 1984 desktop itself: an alert asks the question and, once OK is clicked, zoom-rects turn it into the window title; labelled Finder icons are dragged into a Model icon while the item count climbs; a Model window cycles Guess/Check/Adjust buttons with a stop alert and menu-bar beep flash, dashed error arrow and Control-Panel weight sliders; a pattern-filled chart climbs to 97% inside marching ants.

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

REFERENCE STYLE SOURCE (styles/mac-1bit.js; W/H_ are always 1280x720)
```js
{
  // ---------- 1984 Macintosh / MacPaint: 640x360 1-bit buffer, pixel-doubled to 1280x720 ----------
  const SW = 640, SH = 360;
  const PAT = [ // classic 8x8 MacPaint-style fill patterns (rows as bytes)
    [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], [0x77, 0xdd, 0x77, 0xdd, 0x77, 0xdd, 0x77, 0xdd], [0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55],
    [0x88, 0x22, 0x88, 0x22, 0x88, 0x22, 0x88, 0x22], [0x80, 0x00, 0x08, 0x00, 0x80, 0x00, 0x08, 0x00], [0x80, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00],
    [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80], [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01], [0xff, 0x80, 0x80, 0x80, 0xff, 0x08, 0x08, 0x08],
    [0x88, 0x54, 0x22, 0x45, 0x88, 0x15, 0x22, 0x51], [0xff, 0x00, 0x00, 0x00, 0xff, 0x00, 0x00, 0x00], [0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88],
    [0xff, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80], [0x81, 0x42, 0x24, 0x18, 0x18, 0x24, 0x42, 0x81], [0xf0, 0xf0, 0xf0, 0xf0, 0x0f, 0x0f, 0x0f, 0x0f],
    [0x03, 0x06, 0x0c, 0x18, 0x30, 0x60, 0xc0, 0x81], [0x80, 0x80, 0x41, 0x3e, 0x08, 0x08, 0x14, 0xe3], [0x00, 0x00, 0x88, 0x55, 0x22, 0x00, 0x00, 0x00],
    [0x10, 0x38, 0x7c, 0xfe, 0x7c, 0x38, 0x10, 0x00], [0xee, 0xbb, 0xee, 0xbb, 0xee, 0xbb, 0xee, 0xbb], [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0xcc, 0xcc, 0x33, 0x33, 0xcc, 0xcc, 0x33, 0x33], [0x08, 0x1c, 0x22, 0xc1, 0x80, 0x01, 0x02, 0x04], [0xaa, 0x00, 0xaa, 0x00, 0xaa, 0x00, 0xaa, 0x00],
    [0x11, 0x22, 0x44, 0x88, 0x11, 0x22, 0x44, 0x88], [0xc0, 0xc0, 0x0c, 0x0c, 0xc0, 0xc0, 0x0c, 0x0c], [0x7f, 0x7f, 0x7f, 0x00, 0xf7, 0xf7, 0xf7, 0x00],
    [0x44, 0xaa, 0x11, 0x11, 0x11, 0xaa, 0x44, 0x44], [0x82, 0x44, 0x39, 0x44, 0x82, 0x01, 0x01, 0x01], [0xf8, 0x74, 0x22, 0x47, 0x8f, 0x17, 0x22, 0x71],
    [0x55, 0xa0, 0x40, 0x40, 0x55, 0x0a, 0x04, 0x04], [0x20, 0x50, 0x88, 0x88, 0x88, 0x88, 0x05, 0x02], [0xbf, 0x00, 0xbf, 0xbf, 0xb0, 0xb0, 0xb0, 0xb0],
    [0x18, 0x18, 0xff, 0x18, 0x18, 0x18, 0x18, 0x18], [0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff], [0x22, 0x00, 0x88, 0x00, 0x22, 0x00, 0x88, 0x00],
  ];
  const patBit = (p, x, y) => (PAT[p][y & 7] >> (7 - (x & 7))) & 1;

  // ================= EXPLAINER: "How does AI learn?" told with Finder windows, alerts and MacPaint tools =================
  function macExplainer(ctx, W, H_, t) {
    const B = new Uint8Array(SW * SH);
    const px = (x, y, v = 1) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < SW && y < SH) B[y * SW + x] = v; };
    const inv = (x, y) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < SW && y < SH) B[y * SW + x] ^= 1; };
    const fill = (x, y, w, h, v = 1) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, v); };
    const pfill = (x, y, w, h, p) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, patBit(p, x + i, y + j)); };
    const invRect = (x, y, w, h) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) inv(x + i, y + j); };
    const hl = (x0, x1, y, v = 1) => { for (let x = x0; x <= x1; x++) px(x, y, v); };
    const vl = (x, y0, y1, v = 1) => { for (let y = y0; y <= y1; y++) px(x, y, v); };
    const box = (x, y, w, h, v = 1) => { hl(x, x + w - 1, y, v); hl(x, x + w - 1, y + h - 1, v); vl(x, y, y + h - 1, v); vl(x + w - 1, y, y + h - 1, v); };
    const line = (x0, y0, x1, y1, v = 1, dash = 0) => {
      x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0; let k = 0;
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
      for (;;) { if (!dash || ((k++ / dash) | 0) % 2 === 0) px(x0, y0, v); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
    };
    const thick = (x0, y0, x1, y1, dash = 0) => { line(x0, y0, x1, y1, 1, dash); line(x0 + 1, y0, x1 + 1, y1, 1, dash); line(x0, y0 + 1, x1, y1 + 1, 1, dash); };
    const arrow = (pts, f, dash = 0) => { // polyline drawn on to fraction f, 2px, with head
      let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      let left = L * H.clamp(f), ex = pts[0][0], ey = pts[0][1], ang = 0;
      for (let i = 1; i < pts.length && left > 0; i++) {
        const [ax, ay] = pts[i - 1], [bx, by] = pts[i], d = Math.hypot(bx - ax, by - ay), k = Math.min(1, left / d);
        ex = ax + (bx - ax) * k; ey = ay + (by - ay) * k; ang = Math.atan2(by - ay, bx - ax);
        thick(ax, ay, ex, ey, dash); left -= d;
      }
      if (f > 0.05) { for (let s = -1; s <= 1; s += 2) thick(ex, ey, ex + Math.cos(ang + Math.PI - s * 0.5) * 9, ey + Math.sin(ang + Math.PI - s * 0.5) * 9); }
    };
    const oval = (cx, cy, rx, ry, mode) => {
      for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
        const d = (x * x) / (rx * rx) + (y * y) / (ry * ry); if (d > 1.02) continue;
        const edge = (x * x) / ((rx - 1.5) * (rx - 1.5)) + (y * y) / ((ry - 1.5) * (ry - 1.5)) > 1.0;
        if (edge) px(cx + x, cy + y, 1); else if (mode !== 'line') px(cx + x, cy + y, mode === 'white' ? 0 : patBit(mode, cx + x, cy + y));
      }
    };
    const tl = H.layer(SW, 70), tx = tl.getContext('2d', { willReadFrequently: true });
    const text = (str, x, y, font = '700 13px "Inter"', v = 1, thr = 120) => {
      tx.clearRect(0, 0, SW, 70); tx.font = font; tx.textBaseline = 'top'; tx.fillStyle = '#000'; tx.fillText(str, 1, 2);
      const w = Math.ceil(tx.measureText(str).width) + 3, d = tx.getImageData(0, 0, Math.min(SW, w), 70).data, ww = Math.min(SW, w);
      for (let j = 0; j < 70; j++) for (let i = 0; i < ww; i++) if (d[(j * ww + i) * 4 + 3] > thr) px(x + i - 1, y + j - 2, v);
      return w - 3;
    };
    const tw = (str, font = '700 13px "Inter"') => { tx.font = font; return Math.ceil(tx.measureText(str).width); };
    const ctext = (str, cx, y, font) => text(str, Math.round(cx - tw(str, font) / 2), y, font);
    const ease = (a, d) => H.ease.inOut(H.clamp((t - a) / d));
    const fmt = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const BIG = '800 22px "Inter"', UI = '700 13px "Inter"', SM = '400 11px "Inter"', HUGE = '800 44px "Inter"';

    // ---------- Mac chrome ----------
    const win = (x, y, w, h, title) => {
      fill(x, y, w, h, 0); box(x, y, w, h); hl(x + 1, x + w, y + h); vl(x + w, y + 1, y + h);
      for (let yy = y + 3; yy <= y + 15; yy += 2) hl(x + 2, x + w - 3, yy);
      hl(x, x + w - 1, y + 18);
      fill(x + 8, y + 4, 13, 11, 0); box(x + 9, y + 5, 11, 10);
      const tW = tw(title); fill(Math.round(x + w / 2 - tW / 2 - 8), y + 2, tW + 16, 15, 0); text(title, Math.round(x + w / 2 - tW / 2), y + 3);
    };
    const dialog = (x, y, w, h) => { fill(x, y, w, h, 0); box(x, y, w, h); box(x + 3, y + 3, w - 6, h - 6); box(x + 4, y + 4, w - 8, h - 8); hl(x + 1, x + w, y + h); vl(x + w, y + 1, y + h); };
    const rbox = (x, y, w, h, rad = 6) => { // rounded rect outline
      hl(x + rad, x + w - rad - 1, y); hl(x + rad, x + w - rad - 1, y + h - 1); vl(x, y + rad, y + h - rad - 1); vl(x + w - 1, y + rad, y + h - rad - 1);
      for (let a = 0; a <= Math.PI / 2; a += 0.05) { const dx = Math.round((1 - Math.cos(a)) * rad), dy = Math.round((1 - Math.sin(a)) * rad); px(x + dx, y + dy); px(x + w - 1 - dx, y + dy); px(x + dx, y + h - 1 - dy); px(x + w - 1 - dx, y + h - 1 - dy); }
    };
    const button = (x, y, w, h, label, pressed, dflt) => {
      fill(x + 2, y + 2, w - 4, h - 4, 0); rbox(x, y, w, h, 7); ctext(label, x + w / 2, y + h / 2 - 7, UI);
      if (dflt) { rbox(x - 4, y - 4, w + 8, h + 8, 10); rbox(x - 3, y - 3, w + 6, h + 6, 9); rbox(x - 2, y - 2, w + 4, h + 4, 8); }
      if (pressed) invRect(x + 2, y + 2, w - 4, h - 4);
    };
    const zoom = (src, dst, k) => { const head = Math.floor(H.clamp(k) * 8); for (let i = Math.max(0, head - 3); i <= head; i++) { const f = i / 8, q = src.map((v, j) => Math.round(v + (dst[j] - v) * f)); box(q[0], q[1], q[2], q[3]); } };
    const CUR = ['#.........', '##........', '#o#.......', '#oo#......', '#ooo#.....', '#oooo#....', '#ooooo#...', '#oooooo#..', '#ooooooo#.', '#oooo#####', '#oo#o#....', '#o#.#o#...', '##..#o#...', '.....#o#..', '.....#o#..', '......##..'];
    const cursor = (x, y) => CUR.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') px(x + i, y + j, 1); else if (c === 'o') px(x + i, y + j, 0); }));
    // little 1-bit pictures
    const catPic = (cx, cy, s) => { // s ~ radius
      const ear = (dir) => { for (let k = 0; k < s * 0.8; k++) { const w2 = Math.round(k * 0.6); hl(Math.round(cx + dir * s * 0.55 - w2), Math.round(cx + dir * s * 0.55 + w2), Math.round(cy - s * 1.25 + k)); } };
      ear(-1); ear(1);
      oval(cx, cy, Math.round(s), Math.round(s * 0.85), 3);
      oval(cx - Math.round(s * 0.38), cy - Math.round(s * 0.1), Math.max(2, Math.round(s * 0.14)), Math.max(2, Math.round(s * 0.2)), 0);
      oval(cx + Math.round(s * 0.38), cy - Math.round(s * 0.1), Math.max(2, Math.round(s * 0.14)), Math.max(2, Math.round(s * 0.2)), 0);
      fill(cx - 2, cy + Math.round(s * 0.25), 5, 3, 1);
      for (const d of [-1, 1]) { line(cx + d * s * 0.3, cy + s * 0.35, cx + d * s * 1.25, cy + s * 0.2); line(cx + d * s * 0.3, cy + s * 0.45, cx + d * s * 1.2, cy + s * 0.55); }
    };
    const dogPic = (cx, cy, s) => {
      oval(cx, cy, Math.round(s * 0.85), Math.round(s), 24);
      for (const d of [-1, 1]) oval(cx + d * Math.round(s * 0.85), cy - Math.round(s * 0.1), Math.round(s * 0.3), Math.round(s * 0.65), 0);
      oval(cx - Math.round(s * 0.32), cy - Math.round(s * 0.2), Math.max(2, Math.round(s * 0.12)), Math.max(2, Math.round(s * 0.12)), 0);
      oval(cx + Math.round(s * 0.32), cy - Math.round(s * 0.2), Math.max(2, Math.round(s * 0.12)), Math.max(2, Math.round(s * 0.12)), 0);
      oval(cx, cy + Math.round(s * 0.35), Math.max(3, Math.round(s * 0.22)), Math.max(2, Math.round(s * 0.15)), 0);
    };
    const docIcon = (x, y, kind, sel) => { // 32x32 Finder document icon with a picture on it
      fill(x + 4, y, 20, 32, 0); hl(x + 4, x + 21, y); vl(x + 4, y, y + 31); hl(x + 4, x + 27, y + 31); vl(x + 27, y + 6, y + 31); line(x + 21, y, x + 27, y + 6); vl(x + 21, y, y + 6); hl(x + 21, x + 27, y + 6);
      (kind ? catPic : dogPic)(x + 16, y + 19, 6);
      if (sel) invRect(x + 4, y, 24, 32);
    };
    const brainIcon = (x, y, hi) => { // 64x56 "model" icon: a classic compact computer with a brain on screen
      fill(x + 8, y, 48, 56, 0); box(x + 8, y, 48, 56); box(x + 9, y + 1, 46, 54);
      box(x + 14, y + 6, 36, 28); pfill(x + 15, y + 7, 34, 26, hi ? 0 : 3);
      oval(x + 32, y + 20, 13, 10, 'white'); line(x + 32, y + 11, x + 32, y + 29);
      for (let k = 0; k < 3; k++) { line(x + 22 + k * 2, y + 14 + k * 4, x + 29, y + 16 + k * 4); line(x + 35, y + 16 + k * 4, x + 42 - k * 2, y + 14 + k * 4); }
      hl(x + 14, x + 26, y + 44); fill(x + 36, y + 43, 14, 3, 1);
    };
    const slider = (x, y, w, v, label) => { text(label, x - 28, y - 6, UI); hl(x, x + w, y); hl(x, x + w, y + 1); for (let k = 0; k <= 4; k++) vl(x + (k * w) / 4, y + 4, y + 7); const kx = Math.round(x + v * w); fill(kx - 6, y - 8, 12, 17, 0); box(kx - 6, y - 8, 12, 17); for (let k = 0; k < 3; k++) hl(kx - 3, kx + 3, y - 3 + k * 3); };
    const ants = (x, y, w, h) => { const ant = Math.floor(t * 8); let k = 0; const st = (xx, yy) => { px(xx, yy, ((k + ant) >> 2) & 1); k++; }; for (let i = 0; i < w; i++) st(x + i, y); for (let j = 0; j < h; j++) st(x + w, y + j); for (let i = w; i > 0; i--) st(x + i, y + h); for (let j = h; j > 0; j--) st(x, y + j); };

    // ---------- desktop + menu bar ----------
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) B[y * SW + x] = (x + y) & 1;
    fill(0, 0, SW, 19, 0); hl(0, SW - 1, 19);
    [[0, 0, 1, 1], [SW - 1, 0, -1, 1], [0, SH - 1, 1, -1], [SW - 1, SH - 1, -1, -1]].forEach(([cx, cy, dx, dy]) => { [5, 3, 2, 1, 1].forEach((n, j) => { for (let i = 0; i < n; i++) px(cx + dx * i, cy + dy * j, 1); }); });
    const LOGO = ['..###..', '.#...#.', '#..#..#', '#.#.#.#', '#..#..#', '.#...#.', '..###..', '..#.#..', '..###..', '..###..', '...#...'];
    LOGO.forEach((row, j) => [...row].forEach((c, i) => c === '#' && px(14 + i, 4 + j)));
    let mx = 36; ['File', 'Edit', 'Train', 'Model', 'Help'].forEach((m) => { mx += text(m, mx, 4, UI) + 18; });

    const MAIN = [12, 26, 616, 328];
    // ---------- BEAT 1: alert asks the question, OK click -> it becomes the window title ----------
    if (t < 1.7 && t > 0.2) {
      const dx = 60, dy = 80, dw = 520, dh = 190;
      dialog(dx, dy, dw, dh);
      // note icon: speech balloon with "?"
      oval(dx + 56, dy + 60, 32, 26, 'white'); thick(dx + 40, dy + 82, dx + 30, dy + 102); thick(dx + 30, dy + 102, dx + 58, dy + 86);
      text('?', dx + 46, dy + 38, '800 34px "Inter"');
      const q = 'How does AI learn?', qn = Math.min(q.length, Math.floor((t - 0.3) * 30));
      text(q.slice(0, Math.max(0, qn)), dx + 110, dy + 40, '800 40px "Inter"');
      if (t > 0.75) text('Click OK to find out.', dx + 112, dy + 98, UI);
      button(dx + dw - 120, dy + dh - 52, 90, 30, 'OK', t > 1.45 && t < 1.65, true);
    }
    // cursor path: wanders to OK and clicks
    let cur = null;
    if (t < 1.7) { const k = ease(0.7, 0.7); cur = [Math.round(H.lerp(600, 60 + 520 - 76, k)), Math.round(H.lerp(330, 80 + 190 - 38, k))]; }
    if (t >= 1.65 && t < 1.95) zoom([60, 80, 520, 190], MAIN, (t - 1.65) / 0.3);

    // ---------- BEAT 2: Finder window of labelled examples dragged into the Model ----------
    if (t >= 1.95) {
      win(MAIN[0], MAIN[1], MAIN[2], MAIN[3], 'How does AI learn?');
      const cx0 = MAIN[0] + 1, cy0 = MAIN[1] + 19;
      // Finder info bar, counting items
      const n = 1e6 * Math.pow(H.clamp((t - 2.5) / 3.2), 2.2);
      text(fmt(n) + ' examples', cx0 + 12, cy0 + 4, UI); text('Training Data', cx0 + MAIN[2] - 130, cy0 + 4, UI);
      hl(cx0, cx0 + MAIN[2] - 3, cy0 + 20); hl(cx0, cx0 + MAIN[2] - 3, cy0 + 22);
      // icon grid with labels landing under each icon
      const icons = [];
      for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) icons.push([cx0 + 26 + i * 64, cy0 + 40 + j * 74, (i + j * 2) % 3 !== 1]);
      const nShown = Math.floor(H.clamp((t - 2.0) / 0.6) * icons.length);
      const dragI = t > 2.9 && t < 5.9 ? Math.floor((t - 2.9) / 0.5) : -1, dk = ((t - 2.9) % 0.5) / 0.4;
      icons.forEach(([x, y, kind], k) => {
        if (k >= nShown) return;
        const sel = dragI >= 0 && (dragI * 5) % 12 === k && dk < 1;
        docIcon(x, y, kind, sel);
        const lb = kind ? 'cat' : 'dog'; const lw = tw(lb, UI);
        fill(x + 16 - lw / 2 - 2, y + 35, lw + 4, 15, sel ? 1 : 0); text(lb, Math.round(x + 16 - lw / 2), y + 36, UI, sel ? 0 : 1);
      });
      // model icon + label, arrow "training data"
      const mx2 = cx0 + 430, my2 = cy0 + 100;
      const hit = dragI >= 0 && dk > 0.95;
      brainIcon(mx2, my2, hit); ctext('Model', mx2 + 32, my2 + 62, UI);
      if (t > 2.5) { // the hero number of this beat
        text('examples seen', cx0 + 300, cy0 + 212, UI);
        text(fmt(n), cx0 + 300, cy0 + 230, '800 40px "Inter"');
      }
      if (t > 2.4) { arrow([[cx0 + 285, cy0 + 130], [mx2 - 8, my2 + 28]], ease(2.4, 0.5)); if (t > 2.8) text('training data', cx0 + 300, cy0 + 104, UI); }
      // the drag: dotted outline + cursor carrying it
      if (dragI >= 0 && dk < 1) {
        const [ix, iy] = icons[(dragI * 5) % 12], e = H.ease.inOut(H.clamp(dk));
        const ox = Math.round(H.lerp(ix + 4, mx2 + 20, e)), oy = Math.round(H.lerp(iy, my2 + 10, e) - Math.sin(e * Math.PI) * 30);
        for (let i = 0; i < 24; i += 2) { px(ox + i, oy); px(ox + i, oy + 31); } for (let j = 0; j < 32; j += 2) { px(ox, oy + j); px(ox + 23, oy + j); }
        cur = [ox + 12, oy + 14];
      }
    }

    // ---------- BEAT 3: the Model window — Guess, Check (alert + beep), Adjust (sliders) ----------
    const MW = [44, 52, 552, 290];
    if (t >= 5.9 && t < 6.2) zoom([12 + 1 + 430, 26 + 19 + 100, 64, 56], MW, (t - 5.9) / 0.3);
    if (t >= 6.2) {
      win(MW[0], MW[1], MW[2], MW[3], 'Model');
      const x0 = MW[0], y0 = MW[1] + 19;
      const phase = t < 7.4 ? 0 : t < 8.3 ? 1 : t < 9.4 ? 2 : 0;
      ['Guess', 'Check', 'Adjust'].forEach((nm, i) => { button(x0 + 110 + i * 140, y0 + 12, 88, 24, nm, i === phase); if (i < 2) arrow([[x0 + 204 + i * 140, y0 + 24], [x0 + 244 + i * 140, y0 + 24]], 1); });
      // loop-back arrow (dashed) under the buttons
      thick(x0 + 434, y0 + 40, x0 + 434, y0 + 50, 3); thick(x0 + 434, y0 + 50, x0 + 154, y0 + 50, 3); arrow([[x0 + 154, y0 + 50], [x0 + 154, y0 + 41]], 1);
      text('repeat', x0 + 268, y0 + 54, UI);
      // picture panel
      box(x0 + 22, y0 + 82, 120, 110); catPic(x0 + 82, y0 + 142, 30); ctext('new picture', x0 + 82, y0 + 198, UI);
      arrow([[x0 + 148, y0 + 136], [x0 + 196, y0 + 136]], ease(6.4, 0.3)); if (t > 6.5) text('guess', x0 + 150, y0 + 112, UI);
      // weights panel (Control-Panel sliders)
      box(x0 + 204, y0 + 76, 180, 124); text('Weights', x0 + 212, y0 + 82, UI); hl(x0 + 204, x0 + 383, y0 + 100);
      const adj = H.ease.inOut(H.clamp((t - 8.6) / 0.6));
      [[0.25, 0.6], [0.7, 0.35], [0.4, 0.8]].forEach(([a, b], i) => slider(x0 + 246, y0 + 122 + i * 26, 120, H.lerp(a, b, adj), 'w' + (i + 1)));
      arrow([[x0 + 390, y0 + 136], [x0 + 420, y0 + 136]], ease(6.9, 0.2));
      if (t > 7.0 && t < 9.4) {
        text('dog?', x0 + 428, y0 + 118, '800 30px "Inter"');
        if (t > 7.5) { thick(x0 + 424, y0 + 116, x0 + 506, y0 + 156); thick(x0 + 506, y0 + 116, x0 + 424, y0 + 156); }
      }
      if (t > 8.3) { // error travels back
        arrow([[x0 + 466, y0 + 164], [x0 + 466, y0 + 222], [x0 + 300, y0 + 222], [x0 + 300, y0 + 204]], ease(8.3, 0.5), 4);
        if (t > 8.5) text('error', x0 + 370, y0 + 228, UI);
      }
      if (t > 9.6) {
        text('cat', x0 + 430, y0 + 118, '800 30px "Inter"');
        if (t > 9.85) { const k = H.clamp((t - 9.85) / 0.25); thick(x0 + 490, y0 + 136, x0 + 490 + 8 * Math.min(1, k * 2), y0 + 136 + 10 * Math.min(1, k * 2)); if (k > 0.5) thick(x0 + 498, y0 + 146, x0 + 498 + 20 * (k - 0.5) * 2, y0 + 146 - 30 * (k - 0.5) * 2); }
      }
      // CHECK: stop alert
      if (t > 7.4 && t < 8.3) {
        const ax = 250, ay = 210, aw = 300, ah = 96;
        dialog(ax, ay, aw, ah);
        // stop icon: octagon with a hand-ish bar
        const sx = ax + 40, sy = ay + 40, R = 18; for (let a = 0; a < 8; a++) { const a0 = (a + 0.5) * Math.PI / 4, a1 = (a + 1.5) * Math.PI / 4; thick(sx + Math.cos(a0) * R, sy + Math.sin(a0) * R, sx + Math.cos(a1) * R, sy + Math.sin(a1) * R); }
        fill(sx - 9, sy - 3, 19, 7, 1);
        text('Wrong!', ax + 72, ay + 18, BIG); text("It's a cat, not a dog.", ax + 72, ay + 48, UI);
        button(ax + aw - 84, ay + ah - 34, 60, 22, 'OK', t > 8.1, true);
      }
      cur = t < 9.4 ? [x0 + 110 + phase * 140 + 60, y0 + 30] : [x0 + 170, y0 + 30];
    }

    // ---------- BEAT 4: Accuracy chart window (pattern-filled area, counting number) ----------
    const CWN = [28, 50, 584, 300];
    if (t >= 10.4 && t < 10.7) zoom(MW, CWN, (t - 10.4) / 0.3);
    if (t >= 10.7) {
      win(CWN[0], CWN[1], CWN[2], CWN[3], 'Accuracy');
      const ox = CWN[0] + 60, oy = CWN[1] + 262, aw = 330, ah = 196;
      vl(ox, oy - ah - 6, oy); hl(ox, ox + aw + 6, oy);
      for (let k = 0; k <= 4; k++) hl(ox - 5, ox, oy - (k * ah) / 4);
      text('100%', ox - 50, oy - ah - 6, UI); text('50%', ox - 42, oy - ah / 2 - 6, UI); text('training rounds →', ox + aw - 160, oy + 8, UI);
      const acc = (x) => 97 - 36 * Math.exp(-x * 4.5);
      const prog = H.clamp((t - 10.9) / 1.6);
      let lastY = oy;
      for (let x = 0; x <= aw * prog; x++) {
        const v = acc(x / aw), yy = Math.round(oy - (v / 100) * ah);
        for (let y = yy + 2; y < oy; y++) px(ox + x, y, patBit(9, ox + x, y));
        px(ox + x, yy); px(ox + x, yy + 1); lastY = yy;
      }
      const val = Math.round(61 + 36 * H.ease.out(prog));
      text('Accuracy', CWN[0] + 420, CWN[1] + 60, UI);
      const nx = CWN[0] + 420, ny = CWN[1] + 84;
      fill(nx - 4, ny - 4, 140, 60, 0); text(val + '%', nx, ny, HUGE);
      text('61% → ' + val + '%', nx, ny + 62, UI);
      if (prog >= 1) { // emphasis: marching-ants selection + oval tool ring on the last point
        ants(nx - 10, ny - 8, 136, 60);
        const k = H.clamp((t - 12.55) / 0.3); if (k > 0) oval(ox + aw, lastY, Math.round(14 * k) + 2, Math.round(14 * k) + 2, 'line');
      }
      cur = [nx + 120, ny + 70];
    }
    // ---------- BEAT 5: closing alert ----------
    if (t > 13.0) {
      const dx = 64, dy = 196, dw = 360, dh = 120;
      dialog(dx, dy, dw, dh);
      LOGO.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') fill(dx + 24 + i * 4, dy + 22 + j * 4, 4, 4, 1); }));
      const l1 = 'More examples →', l2 = 'better guesses.';
      text(l1.slice(0, Math.floor((t - 13.0) * 40)), dx + 74, dy + 24, BIG);
      if (t > 13.3) text(l2.slice(0, Math.floor((t - 13.3) * 40)), dx + 74, dy + 52, BIG);
      button(dx + dw - 96, dy + dh - 38, 68, 24, 'OK', false, true);
      cur = [dx + dw - 40, dy + dh + 20];
    }
    // system beep = menu bar flash on the wrong guess
    if (t > 7.4 && t < 7.55) invRect(0, 0, SW, 19);
    if (cur) cursor(cur[0], cur[1]);

    const lc = H.layer(SW, SH), lx = lc.getContext('2d');
    const img = lx.createImageData(SW, SH);
    for (let i = 0; i < B.length; i++) { const v = B[i] ? 0 : 255; img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
    lx.putImageData(img, 0, 0);
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(lc, 0, 0, W, H_); ctx.restore();
  }

  // ================= SOUND: a 1984 Mac on a desk. Mouse clicks and ball rumble, keyboard clicks, the floppy drive
  // chattering while the Finder works, the square-wave system beep, and the Mac's 4-voice square synth for the big hits.
  // All times copied from macExplainer above.
  function macSound(k) {
    const END = 14.5;
    const sq = (t, f, dur, gain, o) => k.tone(t, Object.assign({ f, type: 'square', dur, gain, a: 0.002, hold: dur * 0.6, filter: 'lowpass', f2: 2200 }, o));
    const tri = (t, f, dur, gain, o) => k.tone(t, Object.assign({ f, type: 'triangle', dur, gain, a: 0.003, hold: dur * 0.5 }, o));
    // mouse button: plastic micro-switch, down is a firmer clack than up
    const mclick = (t, down, pan = 0, g = 1) => {
      k.noise(t, { dur: 0.014, filter: 'bandpass', f: down ? 1700 : 2300, q: 3, gain: (down ? 0.32 : 0.2) * g, a: 0.001, pan });
      k.tone(t, { f: down ? 210 : 280, dur: 0.035, gain: (down ? 0.14 : 0.08) * g, a: 0.001, pan });
    };
    // mouse ball rolling across the desk
    const rumble = (t, dur, pan = 0) => k.noise(t, { dur, color: 'brown', filter: 'bandpass', f: 260, q: 1.2, gain: 0.09, a: dur * 0.3, hold: dur * 0.3, pan, minor: true });
    // floppy drive: motor whir + head-step clunks
    const motor = (t, dur, g = 1) => { k.tone(t, { f: 92, type: 'sawtooth', dur, gain: 0.025 * g, a: 0.08, hold: dur - 0.2, filter: 'lowpass', f2: 380, pan: 0.2, minor: true }); k.noise(t, { dur, filter: 'bandpass', f: 700, q: 2.5, gain: 0.02 * g, a: 0.08, hold: dur - 0.2, pan: 0.2, minor: true }); };
    const step = (t, g = 1) => { k.noise(t, { dur: 0.02, filter: 'bandpass', f: 950, q: 5, gain: 0.3 * g, a: 0.001, pan: 0.2, minor: true }); k.tone(t, { f: 140, dur: 0.03, gain: 0.08 * g, a: 0.001, pan: 0.2, minor: true }); };
    // zoom-rects: 8 stepped outlines -> 8 stepped low square ticks, rising
    const zoomSnd = (t, pan = 0) => { for (let i = 0; i < 8; i++) sq(t + i * 0.0375, 180 * Math.pow(2, i / 6), 0.03, 0.05, { f2: 1200, pan }); };
    // keyboard: the Mac 128 keyboard's clicky keys, one key per two typed characters (keeps it under ~15/s)
    const typeOut = (t0, len, cps, pan = 0) => { for (let i = 0; i < len; i += 2) k.play('key', t0 + i / cps, { gain: 1.0, pan, minor: true }); };

    k.bed('room', 0, END, { gain: 0.7 });
    k.bed('hiss', 0, END, { gain: 0.6 }); // the built-in CRT's faint whine/hiss

    // ---- BEAT 1: alert (0.2), typed question (0.3, 30 cps), cursor rolls to OK (0.7-1.4), click (1.45/1.65)
    sq(0.2, 'A3', 0.05, 0.06, { f2: 900 }); k.play('tock', 0.2, { f: 420, gain: 0.5 });       // the dialog snaps up
    typeOut(0.3, 18, 30, -0.1);
    rumble(0.7, 0.7, 0.3);
    mclick(1.45, true, 0.4); mclick(1.65, false, 0.4);
    zoomSnd(1.65);                                                                                // zoom-rects 1.65-1.95

    // ---- BEAT 2: Finder window (1.95), icons read off the disk (2.0-2.6, 12 icons)
    motor(1.95, 0.75);
    for (let i = 0; i < 12; i += 2) step(2.0 + (i / 12) * 0.6, 0.8);
    k.noise(2.4, { dur: 0.5, color: 'brown', filter: 'lowpass', f: [[0, 300], [0.5, 900]], gain: 0.07, a: 0.35, pan: 0.2, minor: true }); // arrow slides to the Model (2.4-2.9)
    // training: the floppy runs while examples are copied; head steps are the counter's ticks, faster as it speeds up
    motor(2.5, 3.3, 1.2);
    for (let t = 2.55; t < 5.7;) { step(t, 0.5); t += H.lerp(0.22, 0.09, (t - 2.5) / 3.2); }
    // six drags (2.9 + i*0.5): mouse down on the icon, ball rolls, drop into the Model at dk > 0.95 (+0.38)
    for (let i = 0; i < 6; i++) {
      const t = 2.9 + i * 0.5;
      mclick(t, true, -0.4, 0.8); rumble(t + 0.02, 0.34, -0.1);
      mclick(t + 0.38, false, 0.35, 0.9);
      k.tone(t + 0.38, { f: [[0, 220 * Math.pow(2, i / 12)], [0.06, 330 * Math.pow(2, i / 12)]], type: 'square', dur: 0.08, gain: 0.05, a: 0.002, hold: 0.04, filter: 'lowpass', f2: 1400, pan: 0.35, minor: true });
    }
    // counter lands on 1,000,000 (t = 5.7): drive stops with a final seek, a clean square two-note
    step(5.7, 1.1); sq(5.72, 'E5', 0.07, 0.07, { pan: -0.2 }); sq(5.8, 'A5', 0.22, 0.07, { pan: -0.2 });

    // ---- BEAT 3: zoom into the Model window (5.9-6.2), Guess clicked (6.2)
    zoomSnd(5.9, 0.3);
    mclick(6.2, true, -0.3); mclick(6.32, false, -0.3, 0.8);
    k.noise(6.4, { dur: 0.3, color: 'brown', filter: 'lowpass', f: [[0, 300], [0.3, 800]], gain: 0.05, a: 0.2, minor: true }); // guess arrow
    k.noise(6.9, { dur: 0.2, color: 'brown', filter: 'lowpass', f: [[0, 300], [0.2, 800]], gain: 0.05, a: 0.14, pan: 0.4, minor: true });
    sq(7.0, 'D4', 0.08, 0.07, { pan: 0.5 }); sq(7.09, 'G4', 0.16, 0.07, { pan: 0.5 });           // "dog?" appears: a questioning lift
    // CHECK (7.4): button + stop alert + menu-bar flash = the Mac system beep (the wrong guess)
    mclick(7.4, true, 0);
    sq(7.4, 1000, 0.17, 0.12, { f2: 3200, hold: 0.12 }); sq(7.4, 500, 0.17, 0.05, { f2: 1600, hold: 0.12 });
    sq(7.5, 'G2', 0.22, 0.1, { f2: 700, hold: 0.12, pan: 0.5 }); k.play('thud', 7.5, { f: 110, gain: 0.5, pan: 0.5 }); // X slams over "dog?"
    mclick(8.1, true, 0.3); mclick(8.28, false, 0.3, 0.8);                                         // OK on the alert
    // ADJUST (8.3): button, dashed error line draws back (8.3-8.8), 'error' label (8.5)
    mclick(8.3, true, 0.2);
    k.withMinor(() => { for (let i = 0; i < 8; i++) { const f = i / 7, e = H.ease.inOut(f); sq(8.3 + f * 0.5, 600 * Math.pow(2, -e), 0.025, 0.04, { f2: 1500, pan: 0.6 - e * 0.5 }); } });
    // weight sliders move (8.6-9.2, ease in-out): mouse drags, detent clicks where the knobs pass tick marks
    rumble(8.6, 0.6, -0.1); // slider drag
    [8.68, 8.78, 8.86, 8.93, 9.0, 9.08, 9.17].forEach((t, i) => k.play('click', t, { f: 1300 + (i % 3) * 120, gain: 1.0, pan: -0.15, minor: true }));
    // GUESS again (9.4), "cat" (9.6), check mark draws (9.85-10.1): the correction
    mclick(9.4, true, -0.3); mclick(9.52, false, -0.3, 0.8);
    sq(9.6, 'G4', 0.1, 0.07, { pan: 0.5 });
    sq(9.85, 'E5', 0.09, 0.08, { pan: 0.5 }); sq(9.95, 'A5', 0.35, 0.08, { pan: 0.5 }); tri(9.95, 'A3', 0.4, 0.14, { pan: 0.5 });

    // ---- BEAT 4: zoom to the Accuracy window (10.4-10.7), chart draws 10.9-12.5, number 61 -> 97 (ease-out)
    zoomSnd(10.4);
    motor(10.75, 1.8, 0.8);
    let last = 61, lastT = -1;
    for (let f = Math.ceil(10.9 * 60); f < 12.42 * 60; f++) { // ticks stop just before the 97% hit
      const t = f / 60, v = Math.round(61 + 36 * H.ease.out(H.clamp((t - 10.9) / 1.6)));
      if (v > last && t - lastT >= 1 / 12) { sq(t, 300 + (v - 61) * 12, 0.03, 0.045, { f2: 1600, minor: true, pan: 0.3 }); lastT = t; last = v; }
    }
    // 97% (12.5): the biggest hit. 4-voice square chord (the Mac's own synth) over a low triangle, ants start crawling
    const P = 12.5;
    ['C5', 'E5', 'G5'].forEach((n, i) => sq(P + i * 0.05, n, 0.08, 0.07, { pan: 0.3 }));
    ['C5', 'E5', 'G5', 'C6'].forEach((n) => sq(P + 0.15, n, 0.7, 0.055, { f2: 2400, hold: 0.2, pan: 0.3, verb: 0.12 }));
    tri(P + 0.15, 'C3', 0.75, 0.34, { hold: 0.2 }); // decays by ~13.0 so the closing alert reads k.play('thud', P, { f: 120, gain: 0.45 });
    k.noise(12.55, { dur: 0.3, color: 'brown', filter: 'lowpass', f: [[0, 400], [0.3, 1000]], gain: 0.05, a: 0.1, minor: true }); // oval tool ring

    // ---- BEAT 5: closing alert (13.0), takeaway typed (13.0 / 13.3 at 40 cps), lands at ~13.68
    sq(13.0, 'A3', 0.05, 0.06, { f2: 900 }); k.play('tock', 13.0, { f: 420, gain: 0.5 });
    for (let t = 13.03; t < 13.66; t += 0.08) k.play('key', t, { gain: 1.0, pan: -0.3, minor: true }); // both lines type 13.0-13.68; one key per ~3 chars
    const TAKE = 13.68;
    sq(TAKE, 'G4', 0.12, 0.045); sq(TAKE + 0.12, 'C5', 0.8, 0.045, { verb: 0.12 }); sq(TAKE + 0.12, 'E4', 0.8, 0.025); tri(TAKE + 0.12, 'C3', 0.9, 0.14);
  }

  registerStyle({
    id: 'mac-1bit',
    name: 'MacPaint 1984',
    category: 'Retro Digital',
    description: 'Pure 1-bit black & white at the original 72-dpi grain: real Atkinson-dithered grayscale (blown-out highlights, crunchy shadows), 8x8 fill patterns, striped title bars, marching ants and bitmap type.',
    motion: 'Built the way a 1984 user would: the dithered image scans in row by row, then pencil, line, bucket, rectangle and text tools each switch on in the palette and lay down their marks in snappy, unanimated 1-bit steps, ending on crawling marching ants.',
    duration: 6.2,
    fonts: ['700 13px "Inter"', '700 34px "Libre Baskerville"', '400 11px "Inter"', '8px "Silkscreen"', '800 22px "Inter"', '800 40px "Inter"'],
    frameT: 6.0,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'Explains with the 1984 desktop itself: an alert asks the question and, once OK is clicked, zoom-rects turn it into the window title; labelled Finder icons are dragged into a Model icon while the item count climbs; a Model window cycles Guess/Check/Adjust buttons with a stop alert and menu-bar beep flash, dashed error arrow and Control-Panel weight sliders; a pattern-filled chart climbs to 97% inside marching ants.',
    explainer(ctx, W, H_, t) { macExplainer(ctx, W, H_, t); },
    explainerSound(k) { macSound(k); },
    draw(ctx, W, H_, t) {
      const B = new Uint8Array(SW * SH); // 1 = black
      const px = (x, y, v = 1) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < SW && y < SH) B[y * SW + x] = v; };
      const inv = (x, y) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < SW && y < SH) B[y * SW + x] ^= 1; };
      const fill = (x, y, w, h, v = 1) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, v); };
      const pfill = (x, y, w, h, p) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, patBit(p, x + i, y + j)); };
      const hl = (x0, x1, y, v = 1) => { for (let x = x0; x <= x1; x++) px(x, y, v); };
      const vl = (x, y0, y1, v = 1) => { for (let y = y0; y <= y1; y++) px(x, y, v); };
      const box = (x, y, w, h, v = 1) => { hl(x, x + w - 1, y, v); hl(x, x + w - 1, y + h - 1, v); vl(x, y, y + h - 1, v); vl(x + w - 1, y, y + h - 1, v); };
      const line = (x0, y0, x1, y1, v = 1) => {
        x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
        const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
        for (;;) { px(x0, y0, v); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
      };
      const oval = (cx, cy, rx, ry, mode) => { // mode: 'line' | pattern index
        for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
          const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
          if (d > 1.02) continue;
          const edge = (x * x) / ((rx - 1) * (rx - 1)) + (y * y) / ((ry - 1) * (ry - 1)) > 1.0;
          if (edge) px(cx + x, cy + y, 1); else if (mode !== 'line') px(cx + x, cy + y, patBit(mode, cx + x, cy + y));
        }
      };
      // bitmap text: render with canvas, threshold alpha -> pure 1-bit glyphs
      const tl = H.layer(SW, 60), tx = tl.getContext('2d', { willReadFrequently: true });
      const text = (str, x, y, font, v = 1, thr = 120) => {
        tx.clearRect(0, 0, SW, 60); tx.font = font; tx.textBaseline = 'top'; tx.fillStyle = '#000'; tx.fillText(str, 1, 2);
        const w = Math.ceil(tx.measureText(str).width) + 3, d = tx.getImageData(0, 0, w, 60).data;
        for (let j = 0; j < 60; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > thr) px(x + i - 1, y + j - 2, v);
        return w - 3;
      };
      const r = H.rng(1984);

      // ---------- desktop: classic 50% gray ----------
      for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) B[y * SW + x] = (x + y) & 1;

      // ---------- menu bar ----------
      fill(0, 0, SW, 19, 0); hl(0, SW - 1, 19);
      // rounded screen corners
      [[0, 0, 1, 1], [SW - 1, 0, -1, 1], [0, SH - 1, 1, -1], [SW - 1, SH - 1, -1, -1]].forEach(([cx, cy, dx, dy]) => {
        const m = [5, 3, 2, 1, 1]; m.forEach((n, j) => { for (let i = 0; i < n; i++) px(cx + dx * i, cy + dy * j, 1); });
      });
      // menu logo: a tiny lightbulb
      const LOGO = ['..###..', '.#...#.', '#..#..#', '#.#.#.#', '#..#..#', '.#...#.', '..###..', '..#.#..', '..###..', '..###..', '...#...'];
      LOGO.forEach((row, j) => [...row].forEach((c, i) => c === '#' && px(14 + i, 4 + j)));
      const menus = ['File', 'Edit', 'Goodies', 'Font', 'FontSize', 'Style'];
      let mx = 36;
      const openMenu = 2;
      menus.forEach((m, i) => {
        const w = text(m, mx, 4, '700 13px "Inter"');
        if (i === openMenu && t > 3.88 && t < 3.98) { for (let y = 1; y < 19; y++) for (let x = mx - 6; x < mx + w + 6; x++) inv(x, y); }
        mx += w + 16;
      });

      // ---------- desktop icons (right) ----------
      const icon = (rows, x, y) => rows.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') px(x + i, y + j, 1); else if (c === 'o') px(x + i, y + j, 0); }));
      const DISK = [
        '##########################', '#oooo#oooooooooooo#ooooo#', '#oooo#oooooo##oooo#oooooo#', '#oooo#oooooo##oooo#oooooo#', '#oooo#oooooo##oooo#oooooo#',
        '#oooo#oooooooooooo#oooooo#', '#oooo##############oooooo#', '#ooooooooooooooooooooooooo#', '#ooo##################ooo#', '#ooo#oooooooooooooooo#ooo#',
        '#ooo#oooooooooooooooo#ooo#', '#ooo#oo############oo#ooo#', '#ooo#oooooooooooooooo#ooo#', '#ooo#oo#########ooooo#ooo#', '#ooo#oooooooooooooooo#ooo#',
        '#ooo#oo###########ooo#ooo#', '#ooo#oooooooooooooooo#ooo#', '#ooo#oooooooooooooooo#ooo#', '#ooo#oooooooooooooooo#ooo#', '##########################',
      ];
      icon(DISK, 592, 32);
      fill(584, 55, 42, 12, 0); text('AI Disk', 586, 56, '400 11px "Inter"');
      const TRASH = [
        '.......######.......', '.....##oooooo##.....', '####################', '#oooooooooooooooooo#', '####################', '.#oooooooooooooooo#.',
        '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.',
        '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.', '.#oo#ooo#ooo#ooo#o#.', '.#oooooooooooooooo#.', '..################..',
      ];
      icon(TRASH, 598, 300);
      fill(588, 320, 38, 12, 0); text('Trash', 593, 321, '400 11px "Inter"');

      // ---------- MacPaint window ----------
      const wx = 14, wy = 26, ww = 562, wh = 326;
      fill(wx, wy, ww, wh, 0); box(wx, wy, ww, wh); hl(wx + 1, wx + ww, wy + wh); vl(wx + ww, wy + 1, wy + wh); // drop shadow
      // striped title bar
      for (let y = wy + 3; y <= wy + 15; y += 2) hl(wx + 2, wx + ww - 3, y);
      hl(wx, wx + ww - 1, wy + 18);
      fill(wx + 8, wy + 4, 13, 11, 0); box(wx + 9, wy + 5, 11, 11 - 1); // close box
      const title = 'untitled';
      tx.font = '700 13px "Inter"'; const tw = Math.ceil(tx.measureText(title).width);
      fill(wx + ww / 2 - tw / 2 - 8, wy + 2, tw + 16, 15, 0);
      text(title, wx + ww / 2 - tw / 2, wy + 3, '700 13px "Inter"');

      // ---------- tool palette (2 x 9) ----------
      const tpx = wx + 8, tpy = wy + 26, cw2 = 26, ch2 = 20;
      const tools = ['select', 'lasso', 'hand', 'text', 'bucket', 'spray', 'brush', 'pencil', 'line', 'eraser', 'rect', 'frect', 'rrect', 'frrect', 'oval', 'foval', 'free', 'poly'];
      const activeTool = t < 1.85 ? 'select' : t < 2.3 ? 'pencil' : t < 3.35 ? 'line' : t < 3.5 ? 'bucket' : t < 3.95 ? 'rect' : t < 4.75 ? 'text' : 'select';
      tools.forEach((tool, k) => {
        const cx = tpx + (k % 2) * cw2, cy = tpy + Math.floor(k / 2) * ch2;
        box(cx, cy, cw2 + 1, ch2 + 1);
        const ox = cx + 5, oy = cy + 3;
        switch (tool) {
          case 'select': for (let i = 0; i < 16; i += 2) { px(ox + i, oy); px(ox + i, oy + 13); } for (let j = 0; j < 14; j += 2) { px(ox, oy + j); px(ox + 15, oy + j); } break;
          case 'lasso': for (let a = 0; a < 6.28; a += 0.05) px(ox + 8 + Math.cos(a) * 7, oy + 5 + Math.sin(a) * 4); line(ox + 4, oy + 9, ox + 3, oy + 13); line(ox + 3, oy + 13, ox + 6, oy + 12); break;
          case 'hand': box(ox + 3, oy + 6, 10, 8); for (let f = 0; f < 4; f++) vl(ox + 4 + f * 2.5, oy + 1 + (f === 0 || f === 3 ? 2 : 0), oy + 6); vl(ox + 1, oy + 5, oy + 8); break;
          case 'text': text('A', ox + 3, oy - 1, '700 13px "Inter"'); break;
          case 'bucket': line(ox + 3, oy + 6, ox + 9, oy); line(ox + 9, oy, ox + 15, oy + 6); line(ox + 15, oy + 6, ox + 9, oy + 12); line(ox + 9, oy + 12, ox + 3, oy + 6); vl(ox + 2, oy + 6, oy + 12); px(ox + 1, oy + 11); px(ox + 3, oy + 12); break;
          case 'spray': box(ox + 7, oy + 4, 7, 10); fill(ox + 9, oy + 1, 3, 3); [[2, 0], [0, 2], [3, 3], [1, 5], [4, 1]].forEach(([a, b]) => px(ox + a, oy + b)); break;
          case 'brush': line(ox + 14, oy, ox + 6, oy + 8); line(ox + 15, oy + 1, ox + 7, oy + 9); fill(ox + 2, oy + 9, 5, 4); break;
          case 'pencil': line(ox + 13, oy, ox + 2, oy + 11); line(ox + 15, oy + 2, ox + 4, oy + 13); line(ox + 13, oy, ox + 15, oy + 2); px(ox + 1, oy + 13); px(ox + 2, oy + 12); break;
          case 'line': line(ox + 1, oy + 13, ox + 15, oy); break;
          case 'eraser': line(ox + 2, oy + 8, ox + 8, oy + 2); line(ox + 8, oy + 2, ox + 15, oy + 2); line(ox + 2, oy + 8, ox + 2, oy + 13); hl(ox + 2, ox + 9, oy + 13); line(ox + 9, oy + 13, ox + 15, oy + 7); vl(ox + 15, oy + 2, oy + 7); hl(ox + 2, ox + 9, oy + 8); vl(ox + 9, oy + 8, oy + 13); line(ox + 9, oy + 8, ox + 15, oy + 2); break;
          case 'rect': box(ox + 1, oy + 2, 15, 11); break;
          case 'frect': pfill(ox + 1, oy + 2, 15, 11, 3); box(ox + 1, oy + 2, 15, 11); break;
          case 'rrect': case 'frrect': if (tool === 'frrect') pfill(ox + 2, oy + 3, 13, 9, 3); hl(ox + 3, ox + 13, oy + 2); hl(ox + 3, ox + 13, oy + 12); vl(ox + 1, oy + 4, oy + 10); vl(ox + 15, oy + 4, oy + 10); px(ox + 2, oy + 3); px(ox + 14, oy + 3); px(ox + 2, oy + 11); px(ox + 14, oy + 11); break;
          case 'oval': oval(ox + 8, oy + 7, 8, 6, 'line'); break;
          case 'foval': oval(ox + 8, oy + 7, 8, 6, 3); break;
          case 'free': for (let x = 0; x < 15; x++) px(ox + 1 + x, oy + 7 + Math.sin(x * 0.7) * 4 + (x > 10 ? 2 : 0)); break;
          case 'poly': line(ox + 1, oy + 12, ox + 5, oy + 1); line(ox + 5, oy + 1, ox + 15, oy + 5); line(ox + 15, oy + 5, ox + 10, oy + 12); line(ox + 10, oy + 12, ox + 1, oy + 12); break;
        }
        if (tool === activeTool) for (let y = cy + 1; y < cy + ch2; y++) for (let x = cx + 1; x < cx + cw2; x++) inv(x, y);
      });
      // line-width selector
      const lwy = tpy + 9 * ch2 + 10;
      box(tpx, lwy, 2 * cw2 + 1, 60);
      [1, 2, 3, 4, 6].forEach((w, i) => { const y = lwy + 6 + i * 10; fill(tpx + 8, y, 2 * cw2 - 15, w); if (i === 1) { px(tpx + 3, y); px(tpx + 4, y); px(tpx + 3, y + 1); } });

      // ---------- canvas area ----------
      const cx0 = wx + 68, cy0 = wy + 26, cwid = ww - 76, chei = 246;
      box(cx0 - 1, cy0 - 1, cwid + 2, chei + 2);

      // grayscale "digitized" render of the subject, then real Atkinson dithering
      const G = H.layer(cwid, chei), g = G.getContext('2d', { willReadFrequently: true });
      const bx = cwid * 0.73, by = 108, R = 52;
      const pulse = 0.5;
      // backdrop: wall with glow falloff, table plane
      const bg = g.createRadialGradient(bx, by, 10, bx, by, 300);
      bg.addColorStop(0, '#fff'); bg.addColorStop(0.25, '#e8e8e8'); bg.addColorStop(0.6, '#8a8a8a'); bg.addColorStop(1, '#3a3a3a');
      g.fillStyle = bg; g.fillRect(0, 0, cwid, chei);
      const tableY = 222;
      const tg = g.createLinearGradient(0, tableY, 0, chei);
      tg.addColorStop(0, '#b0b0b0'); tg.addColorStop(1, '#4a4a4a');
      g.fillStyle = tg; g.fillRect(0, tableY, cwid, chei - tableY);
      // soft contact shadow + glow pool
      const sh = g.createRadialGradient(bx, tableY + 10, 2, bx, tableY + 10, 80);
      sh.addColorStop(0, 'rgba(0,0,0,0.75)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
      g.save(); g.translate(bx, tableY + 10); g.scale(1, 0.18); g.translate(-bx, -(tableY + 10)); g.fillStyle = sh; g.fillRect(bx - 90, tableY - 400, 180, 900); g.restore();
      // glass bulb: luminous core, darker fresnel rim
      g.save();
      g.beginPath(); g.arc(bx, by, R, Math.PI * 0.72, Math.PI * 0.28 + Math.PI * 2);
      g.lineTo(bx + R * 0.34, by + R * 1.28); g.lineTo(bx - R * 0.34, by + R * 1.28); g.closePath();
      const gl = g.createRadialGradient(bx - 8, by - 6, 4, bx, by + 6, R * 1.25);
      gl.addColorStop(0, '#ffffff'); gl.addColorStop(0.35 + pulse * 0.08, '#f4f4f4'); gl.addColorStop(0.75, '#b8b8b8'); gl.addColorStop(1, '#5a5a5a');
      g.fillStyle = gl; g.fill();
      g.clip();
      // specular window reflection
      g.fillStyle = 'rgba(255,255,255,0.9)';
      g.beginPath(); g.ellipse(bx - R * 0.45, by - R * 0.45, R * 0.18, R * 0.32, -0.7, 0, 7); g.fill();
      // circuit-brain filament inside the bulb
      g.strokeStyle = '#1a1a1a'; g.lineWidth = 2.2; g.lineCap = 'round';
      const rb = H.rng(77);
      g.beginPath(); // two hemispheres
      for (const s of [-1, 1]) {
        g.moveTo(bx, by - 30);
        g.bezierCurveTo(bx + s * 30, by - 42, bx + s * 52, by - 16, bx + s * 42, by + 8);
        g.bezierCurveTo(bx + s * 40, by + 28, bx + s * 14, by + 30, bx, by + 22);
      }
      g.moveTo(bx, by - 30); g.lineTo(bx, by + 22);
      g.stroke();
      g.lineWidth = 1.6;
      for (let k = 0; k < 9; k++) { // circuit traces with pads
        const s = k % 2 ? 1 : -1, y0 = by - 22 + k * 5.5, x1 = bx + s * rb.range(14, 34), y1 = y0 + rb.range(-6, 6);
        g.beginPath(); g.moveTo(bx + s * 3, y0); g.lineTo(bx + s * 10, y0); g.lineTo(x1, y1); g.stroke();
        g.beginPath(); g.arc(x1, y1, 2.6, 0, 7); g.fillStyle = '#000'; g.fill();
      }
      // filament stems down to base
      g.lineWidth = 2; g.beginPath(); g.moveTo(bx - 6, by + 22); g.lineTo(bx - 9, by + R * 1.25); g.moveTo(bx + 6, by + 22); g.lineTo(bx + 9, by + R * 1.25); g.stroke();
      g.restore();
      // screw base: metallic cylinder with ridges
      const b0 = by + R * 1.26, bw = R * 0.74;
      for (let k = 0; k < 5; k++) {
        const y = b0 + k * 8;
        const cg = g.createLinearGradient(bx - bw / 2, 0, bx + bw / 2, 0);
        cg.addColorStop(0, '#101010'); cg.addColorStop(0.28, '#9a9a9a'); cg.addColorStop(0.4, '#e8e8e8'); cg.addColorStop(0.62, '#707070'); cg.addColorStop(1, '#0a0a0a');
        g.fillStyle = cg; g.beginPath(); g.ellipse(bx, y + 4, bw / 2 - k * 0.6, 5.5, 0, 0, 7); g.fill();
        g.fillRect(bx - bw / 2 + k * 0.6, y, bw - k * 1.2, 4.5);
      }
      g.fillStyle = '#111'; g.beginPath(); g.ellipse(bx, b0 + 42, 8, 5, 0, 0, 7); g.fill();

      // Atkinson dithering (6/8 of error diffused -> blown highlights, crunchy darks)
      const id = g.getImageData(0, 0, cwid, chei).data;
      const lum = new Float32Array(cwid * chei);
      for (let i = 0; i < lum.length; i++) lum[i] = (id[i * 4] * 0.299 + id[i * 4 + 1] * 0.587 + id[i * 4 + 2] * 0.114) / 255;
      // the "scan" builds in over time: rows below scanY are still blank
      const scanY = Math.floor(H.clamp((t - 0.45) / 1.4) * chei);
      for (let y = 0; y < chei; y++) for (let x = 0; x < cwid; x++) {
        const i = y * cwid + x, o = lum[i], n = o < 0.5 ? 0 : 1, e = (o - n) / 8;
        lum[i] = n;
        if (x + 1 < cwid) lum[i + 1] += e;
        if (x + 2 < cwid) lum[i + 2] += e;
        if (y + 1 < chei) { if (x > 0) lum[i + cwid - 1] += e; lum[i + cwid] += e; if (x + 1 < cwid) lum[i + cwid + 1] += e; }
        if (y + 2 < chei) lum[i + 2 * cwid] += e;
        px(cx0 + x, cy0 + y, y <= scanY ? (n ? 0 : 1) : 0);
      }

      // scanner head: an inverted band riding the scan line
      if (scanY < chei && t > 0.45) for (let y = scanY + 1; y < Math.min(chei, scanY + 3); y++) for (let x = 0; x < cwid; x++) inv(cx0 + x, cy0 + y);
      // crisp hand-drawn overlays (pencil + line tools) on top of the dither
      const BX = cx0 + bx, BY = cy0 + by;
      const outP = H.clamp((t - 1.9) / 0.38);
      if (outP > 0) {
        const aEnd = Math.PI * 0.72 + Math.PI * 1.56 * outP;
        for (let a = Math.PI * 0.72; a < aEnd; a += 0.004) px(BX + Math.cos(a) * R, BY + Math.sin(a) * R);
        if (outP >= 1) {
          line(BX + Math.cos(Math.PI * 0.28) * R, BY + Math.sin(Math.PI * 0.28) * R, BX + R * 0.34, BY + R * 1.28);
          line(BX + Math.cos(Math.PI * 0.72) * R, BY + Math.sin(Math.PI * 0.72) * R, BX - R * 0.34, BY + R * 1.28);
        } else { // pencil cursor at the tip
          const pxc = Math.round(BX + Math.cos(aEnd) * R), pyc = Math.round(BY + Math.sin(aEnd) * R);
          for (let q = 0; q < 12; q++) { px(pxc + q, pyc - q, 1); px(pxc + q + 2, pyc - q + 2, 1); px(pxc + q + 1, pyc - q + 1, 0); }
        }
      }
      // rays: line tool, 2px, one per click-drag
      const rayT = (t - 2.3) / 0.092, nRays = Math.floor(rayT);
      for (let k = 0; k < 11; k++) {
        if (k > nRays) break;
        const a = -Math.PI * 0.9 + k * (Math.PI * 0.85 / 10);
        const r0 = R + 14, r1full = R + 30 + (k % 2) * 12 + pulse * 4;
        const r1 = k < nRays ? r1full : r0 + (r1full - r0) * H.clamp(rayT - nRays);
        for (let s = r0; s < r1; s++) { px(BX + Math.cos(a) * s, BY + Math.sin(a) * s); px(BX + Math.cos(a) * s + 1, BY + Math.sin(a) * s); }
        if (k === nRays && t < 3.35) { // crosshair cursor mid-drag
          const chx = Math.round(BX + Math.cos(a) * r1), chy = Math.round(BY + Math.sin(a) * r1);
          for (let q = -7; q <= 7; q++) { if (Math.abs(q) > 1) { px(chx + q, chy, 1); px(chx, chy + q, 1); px(chx + q, chy - 1, 0); px(chx + q, chy + 1, 0); px(chx - 1, chy + q, 0); px(chx + 1, chy + q, 0); } }
        }
      }
      // floor: paint-bucket flood of a pattern, horizon line on top
      const flY = cy0 + tableY;
      if (t >= 3.42) { pfill(cx0, flY, cwid, cy0 + chei - flY, 24); hl(cx0, cx0 + cwid - 1, flY); }
      // patterned cast shadow (oval tool, 50% gray)
      if (t >= 3.5) oval(Math.round(BX), flY + 4, 40, 3, 2);
      // stack of books drawn with rect tool + fills
      const books = [[34, 120, 13, 8], [42, 104, 11, 6], [30, 112, 12, 21]];
      const nBooks = H.clamp(Math.floor((t - 3.55) / 0.13) + 1, 0, 3);
      let byy = flY;
      books.slice(0, nBooks).forEach(([bxl, bwd, bht, pt]) => { byy -= bht; const x0 = cx0 + bxl; fill(x0, byy, bwd, bht, 0); pfill(x0 + 6, byy + 2, bwd - 12, bht - 4, pt); box(x0, byy, bwd, bht + 1); vl(x0 + 4, byy, byy + bht); vl(x0 + bwd - 5, byy, byy + bht); });
      // title lettering in a bitmap serif, with marching-ants selection
      const ttl = 'Bright Machine';
      tx.font = '700 34px "Libre Baskerville"';
      const ttw = Math.ceil(tx.measureText(ttl).width);
      const ttx = cx0 + 16, tty = cy0 + 12;
      if (t >= 3.95) {
      fill(ttx - 6, tty - 4, ttw + 12, 58, 0);
      const nT = H.clamp(Math.floor((t - 3.98) / 0.036), 0, ttl.length);
      const sub = 'an idea, in 1-bit', nS = H.clamp(Math.floor((t - 4.5) / 0.013), 0, sub.length);
      text(ttl.slice(0, nT), ttx, tty, '700 34px "Libre Baskerville"', 1, 110);
      const ant = Math.floor(t * 8);
      const antBox = (x, y, w, h) => {
        let k = 0;
        const step = (xx, yy) => { if (((k + ant) >> 2) & 1) px(xx, yy, 1); else px(xx, yy, 0); k++; };
        for (let i = 0; i < w; i++) step(x + i, y);
        for (let j = 0; j < h; j++) step(x + w, y + j);
        for (let i = w; i > 0; i--) step(x + i, y + h);
        for (let j = h; j > 0; j--) step(x, y + j);
      };
      if (t >= 4.75) antBox(ttx - 7, tty - 5, ttw + 13, 59);
      if (nS > 0) text(sub.slice(0, nS), ttx + 3, tty + 38, '700 13px "Inter"', 1, 120);
      if (t < 4.75) { // I-beam text cursor after the last typed glyph
        tx.font = nS > 0 ? '700 13px "Inter"' : '700 34px "Libre Baskerville"';
        const ibx = ttx + Math.ceil(tx.measureText(nS > 0 ? sub.slice(0, nS) : ttl.slice(0, nT)).width) + 3, iby = nS > 0 ? tty + 38 : tty + 2, ibh = nS > 0 ? 14 : 34;
        if (Math.floor(t * 4) % 2 === 0 || nS > 0) { vl(ibx, iby, iby + ibh); px(ibx - 1, iby); px(ibx + 1, iby); px(ibx - 1, iby + ibh); px(ibx + 1, iby + ibh); }
      }
      }

      // ---------- pattern palette ----------
      const ppy = cy0 + chei + 8, ppx = cx0;
      const nCols = Math.floor(cwid / 25);
      for (let k = 0; k < nCols * 2; k++) {
        const c = k % nCols, rr2 = Math.floor(k / nCols), x = ppx + c * 25, y = ppy + rr2 * 17;
        pfill(x + 1, y + 1, 24, 16, k % PAT.length); box(x, y, 26, 18);
      }
      // current fill pattern + line sample
      box(tpx, ppy, 2 * cw2 + 1, 35); pfill(tpx + 3, ppy + 3, 2 * cw2 - 5, 29, 9); box(tpx + 3, ppy + 3, 2 * cw2 - 5, 29);

      // Finder "zoom rects": the window opens out of the disk icon
      if (t < 0.4) {
        for (let y = wy; y <= wy + wh + 1; y++) for (let x = wx; x <= wx + ww + 1; x++) B[y * SW + x] = (x + y) & 1;
        const src = [592, 32, 26, 20], dst = [wx, wy, ww, wh];
        const head = Math.floor(H.clamp(t / 0.36) * 8);
        for (let k = Math.max(0, head - 3); k <= head; k++) {
          const f = k / 8, q = src.map((v, i) => Math.round(v + (dst[i] - v) * f));
          box(q[0], q[1], q[2], q[3], 1); box(q[0] + 1, q[1] + 1, q[2] - 2, q[3] - 2, 0);
        }
      }
      // ---------- blit: 1-bit -> pixels, pixel-doubled ----------
      const lc = H.layer(SW, SH), lx = lc.getContext('2d');
      const img = lx.createImageData(SW, SH);
      for (let i = 0; i < B.length; i++) { const v = B[i] ? 0 : 255; img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
      lx.putImageData(img, 0, 0);
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(lc, 0, 0, W, H_); ctx.restore();
    },
  });
}
```
