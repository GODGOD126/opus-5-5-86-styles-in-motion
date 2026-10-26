I want an animated explainer made in the "Phosphor Terminal" visual style (Retro Digital). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Space Mono, VT323
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=VT323&display=block">
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
Name: Phosphor Terminal
Family: Retro Digital
Look: A green P1-phosphor CRT: VT323 boot log with bloom and halation, curved scanlines, true per-pixel barrel distortion with RGB fringing at the edges, tube vignette, hum bar, and a glass face catching the room light inside a plastic bezel.
Motion: The tube powers on (dot, then a bright line that snaps open into a flashing raster that settles as the phosphor warms), then the boot log types at terminal speed, the trace sweeps, the greeting prints and the cursor blinks while a hum bar rolls.
How it explains: Explains as a live terminal session: the typed question scrolls away and lives on in the inverse-video status line, a labelled data log streams into a box-drawn MODEL, V-hold rolls carry us between screens, arrows and the error path are phosphor line-drawings, and counters are big VT323 numerals that flip in inverse video for emphasis.

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

REFERENCE STYLE SOURCE (styles/crt-terminal.js; W/H_ are always 1280x720)
```js
{
  // ---------- Green-phosphor CRT terminal: text -> scanlines -> barrel remap w/ chromatic fringe -> bloom -> glass ----------
  const LINES = [
    ['NEURAL SYSTEMS CORP.   NX-80 TERMINAL   BIOS 2.04', 0],
    ['(C) 1983   ALL RIGHTS RESERVED', 0],
    ['', 0],
    ['MEMORY CHECK ............ 65536K  OK', 1],
    ['SYNAPSE BUS ............. ONLINE', 1],
    ['LOADING WEIGHTS  [BAR]', 2],
    ['   layer 096/117   attn.heads=32   ok', 1],
    ['   layer 097/117   attn.heads=32   ok', 1],
    ['CALIBRATING CORTEX ...... DONE', 1],
    ['', 0],
    ['>> RUN CONSCIOUSNESS.EXE', 3],
  ];

  let BEZEL = null; // static plastic housing, built once per size
  // shared tube pipeline for the hero and the explainer (bezel / remap / glass)
  function crtCompose(ctx, W, H_, t, paint, pOnT, boost) {
      const r = H.rng(80), nz = H.makeNoise(5);
      // tube geometry
      const TX = 96, TY = 46, TW = 1088, TH = 576;

      // ---------- 1. BEZEL (plastic housing), static: built once per size ----------
      const rrOn = (c, x, y, w, h, rad) => { c.beginPath(); c.moveTo(x + rad, y); c.arcTo(x + w, y, x + w, y + h, rad); c.arcTo(x + w, y + h, x, y + h, rad); c.arcTo(x, y + h, x, y, rad); c.arcTo(x, y, x + w, y, rad); c.closePath(); };
      const rr = (x, y, w, h, rad) => rrOn(ctx, x, y, w, h, rad);
      if (!BEZEL || BEZEL.width !== W || BEZEL.height !== H_) {
        BEZEL = H.layer(W, H_);
        const c = BEZEL.getContext('2d');
        const bz = c.createLinearGradient(0, 0, 0, H_);
        bz.addColorStop(0, '#3b3934'); bz.addColorStop(0.5, '#2c2a26'); bz.addColorStop(1, '#1d1c19');
        c.fillStyle = bz; c.fillRect(0, 0, W, H_);
        // moulded ABS texture: per-pixel fine grain + soft mottling (+-3%)
        const img = c.getImageData(0, 0, W, H_), d = img.data, pn = H.makeNoise(31), gr = H.rng(311);
        for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
          const k = 1 + (gr() - 0.5) * 0.06 + pn.n2(x * 0.9, y * 0.9) * 0.025 + pn.n2(x * 0.012, y * 0.012) * 0.03, i = (y * W + x) * 4;
          d[i] *= k; d[i + 1] *= k; d[i + 2] *= k;
        }
        c.putImageData(img, 0, 0);
        // key light from the upper left, falling off toward the lower right
        const kl = c.createRadialGradient(W * 0.12, -H_ * 0.1, 40, W * 0.3, H_ * 0.2, W * 0.95);
        kl.addColorStop(0, 'rgba(255,238,205,0.13)'); kl.addColorStop(0.45, 'rgba(255,238,205,0.04)'); kl.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = kl; c.fillRect(0, 0, W, H_);
        const fo = c.createLinearGradient(W * 0.35, H_ * 0.3, W, H_);
        fo.addColorStop(0, 'rgba(0,0,0,0)'); fo.addColorStop(1, 'rgba(0,0,0,0.28)');
        c.fillStyle = fo; c.fillRect(0, 0, W, H_);
        // outer edge highlight (rounded housing edge: lit top/left, shadowed bottom/right)
        c.strokeStyle = 'rgba(255,240,210,0.08)'; c.lineWidth = 2; c.strokeRect(6, 6, W - 12, H_ - 12);
        c.strokeStyle = 'rgba(255,240,210,0.1)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(7, H_ - 40); c.lineTo(7, 7); c.lineTo(W - 40, 7); c.stroke();
        // recessed opening around the tube (bevel: dark top-left, lit bottom edge)
        const bev = c.createLinearGradient(0, TY - 30, 0, TY + TH + 30);
        bev.addColorStop(0, '#0e0d0b'); bev.addColorStop(0.85, '#1a1916'); bev.addColorStop(1, '#4a463e');
        c.save(); c.shadowColor = 'rgba(255,236,200,0.16)'; c.shadowOffsetY = 2; c.shadowBlur = 3;
        rrOn(c, TX - 30, TY - 28, TW + 60, TH + 58, 38); c.fillStyle = bev; c.fill(); c.restore();
        // moulded highlight on the lower lip of the recess, and a soft shadow line under the top lip
        c.save(); rrOn(c, TX - 30, TY - 28, TW + 60, TH + 58, 38); c.clip();
        const lip = c.createLinearGradient(0, TY + TH + 18, 0, TY + TH + 30);
        lip.addColorStop(0, 'rgba(255,240,210,0)'); lip.addColorStop(0.7, 'rgba(255,240,210,0.16)'); lip.addColorStop(1, 'rgba(255,240,210,0.04)');
        c.fillStyle = lip; c.fillRect(TX - 30, TY + TH + 16, TW + 60, 16);
        c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 3; rrOn(c, TX - 29, TY - 27, TW + 58, TH + 56, 37); c.stroke();
        c.restore();
        c.strokeStyle = 'rgba(255,240,215,0.22)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(TX + 10, TY + TH + 29.5); c.lineTo(TX + TW - 10, TY + TH + 29.5); c.stroke();
        rrOn(c, TX - 14, TY - 12, TW + 28, TH + 26, 30); c.fillStyle = '#050605'; c.fill();
      }
      ctx.drawImage(BEZEL, 0, 0);

      const src = H.layer(TW, TH), s = src.getContext('2d', { willReadFrequently: true });
      s.fillStyle = '#000'; s.fillRect(0, 0, TW, TH);
      s.fillStyle = '#fff'; s.strokeStyle = '#fff'; s.textBaseline = 'top';
      paint(s, TW, TH);
      s.globalAlpha = 1; s.globalCompositeOperation = 'source-over'; s.shadowBlur = 0;
      // ---------- 3. bloom / halation layer from the source ----------
      const small = H.layer(TW / 4, TH / 4), sm = small.getContext('2d');
      sm.filter = 'blur(3px)'; sm.drawImage(src, 0, 0, TW / 4, TH / 4);
      const bloom = H.layer(TW, TH), bl = bloom.getContext('2d', { willReadFrequently: true });
      bl.imageSmoothingEnabled = true; bl.drawImage(small, 0, 0, TW, TH);
      const wide = H.layer(TW / 8, TH / 8), wd = wide.getContext('2d');
      wd.filter = 'blur(4px)'; wd.drawImage(src, 0, 0, TW / 8, TH / 8);
      bl.globalCompositeOperation = 'lighter'; bl.globalAlpha = 0.9; bl.drawImage(wide, 0, 0, TW, TH);
      const S = s.getImageData(0, 0, TW, TH).data, Bl = bl.getImageData(0, 0, TW, TH).data;

      // ---------- 4. per-pixel CRT remap ----------
      const out = ctx.getImageData(0, 0, W, H_), O = out.data;
      const K = 0.065, CA = 0.0016; // barrel strength, chromatic offset
      const humY = ((t * 0.18) % 1.3 - 0.15) * TH;
      const flick = 1 + 0.025 * Math.sin(t * 60 * 2 * Math.PI * 0.5);
      // power-on: dot -> horizontal line -> raster snaps open with a flash, then phosphor warm-up
      const pOn = pOnT;
      const wBand = pOn < 0 ? -1 : H.clamp(pOn / 0.1), hBand = pOn < 0.1 ? 0.007 : 0.007 + H.ease.out(H.clamp((pOn - 0.1) / 0.28));
      const flash = pOn < 0.1 ? 1.5 : Math.max(0, 1.3 * (1 - (pOn - 0.1) / 0.55));
      const warm = H.clamp(0.45 + (pOn - 0.3) * 0.9, 0.45, 1);
      const sample = (A, x, y, ch) => { // bilinear
        if (x < 0 || y < 0 || x >= TW - 1 || y >= TH - 1) return 0;
        const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, i = (y0 * TW + x0) * 4 + ch;
        return (A[i] * (1 - fx) + A[i + 4] * fx) * (1 - fy) + (A[i + TW * 4] * (1 - fx) + A[i + TW * 4 + 4] * fx) * fy;
      };
      const rad = 34; // tube corner radius (output space)
      for (let y = TY - 12; y < TY + TH + 14; y++) for (let x = TX - 14; x < TX + TW + 14; x++) {
        // rounded-rect tube mask with soft edge
        const qx = Math.max(Math.abs(x - (TX + TW / 2)) - (TW / 2 + 8 - rad), 0), qy = Math.max(Math.abs(y - (TY + TH / 2)) - (TH / 2 + 8 - rad), 0);
        const dEdge = rad - Math.hypot(qx, qy);
        if (dEdge < 0) continue;
        const u = ((x - TX) / TW) * 2 - 1, v = ((y - TY) / TH) * 2 - 1;
        const r2 = u * u * 1.0 + v * v * 1.0;
        let col = [0, 0, 0];
        let lumG = 0;
        for (let c = 0; c < 3; c++) {
          const f = 1 + K * r2 + (c - 1) * CA * r2 * 2.2; // R further out, B further in
          const su = u * f * 0.985, sv = v * f * 0.99;
          const sx = (su + 1) * 0.5 * TW, sy = (sv + 1) * 0.5 * TH;
          // scanlines in SOURCE space so they bow with the glass
          const scan = 0.42 + 0.58 * Math.pow(Math.cos((sy / 3) * Math.PI), 2);
          const base = sample(S, sx, sy, 1) / 255;
          const glow = sample(Bl, sx, sy, 1) / 255;
          const hum = 1 + 0.07 * Math.exp(-(((sy - humY) / 70) ** 2));
          col[c] = (base * scan + glow * 0.85) * hum * flick * warm * boost;
          if (c === 1) lumG = col[c];
        }
        if (pOn < 0.7) {
          const bandA = wBand < 0 ? 0 : H.clamp((hBand - Math.abs(v)) * 90) * H.clamp((wBand - Math.abs(u)) * 40);
          const fe = flash * (1 - 0.35 * Math.abs(u));
          for (let c = 0; c < 3; c++) col[c] = (col[c] + fe) * bandA;
        }
        // phosphor tint: P1 green; hot cores go toward white-green
        const vig = Math.pow(H.clamp(1 - r2 * 0.28), 1.4);
        const n = (r() - 0.5) * 0.035;
        const R = col[0], G = col[1], B = col[2];
        const hotR = Math.max(0, R - 0.8) * 0.8, hotB = Math.max(0, B - 0.8) * 0.7;
        let or = 7 + (0.2 * Math.pow(R, 1.6) + hotR * 0.3) * 255, og = 13 + Math.min(1.15, G) * 235, ob = 9 + (0.34 * Math.pow(B, 1.6) + hotB * 0.28) * 255;
        or = (or * vig + n * 255); og = (og * vig + n * 255); ob = (ob * vig + n * 255);
        // edge falloff into the dark bezel lip
        const a = H.clamp(dEdge / 6);
        const i = (y * W + x) * 4;
        O[i] = O[i] * (1 - a) + or * a; O[i + 1] = O[i + 1] * (1 - a) + og * a; O[i + 2] = O[i + 2] * (1 - a) + ob * a;
      }
      ctx.putImageData(out, 0, 0);

      // ---------- 5. glass: curvature shading + room reflections ----------
      ctx.save();
      rr(TX - 6, TY - 4, TW + 12, TH + 10, rad); ctx.clip();
      // inner edge darkening (glass curving away)
      const ed = ctx.createRadialGradient(TX + TW / 2, TY + TH / 2, TH * 0.45, TX + TW / 2, TY + TH / 2, TW * 0.62);
      ed.addColorStop(0, 'rgba(0,0,0,0)'); ed.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = ed; ctx.fillRect(TX - 10, TY - 10, TW + 20, TH + 20);
      ctx.globalCompositeOperation = 'screen';
      // broad soft sheen top-left
      const sh = ctx.createRadialGradient(TX + TW * 0.22, TY + TH * 0.12, 10, TX + TW * 0.22, TY + TH * 0.12, TW * 0.85);
      sh.addColorStop(0, 'rgba(200,220,210,0.07)'); sh.addColorStop(0.5, 'rgba(200,220,210,0.025)'); sh.addColorStop(1, 'rgba(200,220,210,0)');
      ctx.fillStyle = sh; ctx.fillRect(TX, TY, TW, TH);
      // window reflection (soft trapezoid) on the right
      ctx.filter = 'blur(36px)';
      const wr = ctx.createLinearGradient(TX + TW * 0.69, 0, TX + TW * 0.9, 0);
      wr.addColorStop(0, 'rgba(190,210,220,0)'); wr.addColorStop(0.5, 'rgba(190,210,220,0.04)'); wr.addColorStop(1, 'rgba(190,210,220,0)');
      ctx.fillStyle = wr;
      ctx.beginPath(); ctx.moveTo(TX + TW * 0.7, TY + 20); ctx.lineTo(TX + TW * 0.9, TY + 30); ctx.lineTo(TX + TW * 0.88, TY + TH * 0.42); ctx.lineTo(TX + TW * 0.69, TY + TH * 0.38); ctx.closePath(); ctx.fill();
      
      // thin specular arc along the top edge of the glass
      ctx.filter = 'blur(2px)';
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(TX + 60, TY + 14); ctx.quadraticCurveTo(TX + TW / 2, TY + 2, TX + TW - 60, TY + 14); ctx.stroke();
      ctx.filter = 'none';
      ctx.restore();

      // ---------- 6. bezel details: badge + power LED ----------
      ctx.save();
      ctx.font = '700 15px "Space Mono"'; ctx.textBaseline = 'middle';
      const by = TY + TH + 44;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText('NX-80  NEURAL TERMINAL', TX + 1, by + 1);
      ctx.fillStyle = '#8d877a'; ctx.fillText('NX-80  NEURAL TERMINAL', TX, by);
      ctx.font = '400 11px "Space Mono"'; ctx.fillStyle = '#5f5a50'; ctx.fillText('HIGH RESOLUTION  P1 PHOSPHOR', TX + 270, by + 1);
      // LED
      const lx = TX + TW - 30;
      const lg = ctx.createRadialGradient(lx, by, 0, lx, by, 22); lg.addColorStop(0, 'rgba(90,255,120,0.55)'); lg.addColorStop(1, 'rgba(90,255,120,0)');
      ctx.fillStyle = lg; ctx.fillRect(lx - 22, by - 22, 44, 44);
      ctx.fillStyle = '#b8ffc4'; ctx.beginPath(); ctx.arc(lx, by, 4, 0, 7); ctx.fill();
      ctx.fillStyle = '#5f5a50'; ctx.font = '400 11px "Space Mono"'; ctx.textAlign = 'right'; ctx.fillText('POWER', lx - 16, by + 1);
      // two knobs
      [lx - 120, lx - 170].forEach((kx) => {
        const kg = ctx.createRadialGradient(kx - 3, by - 4, 1, kx, by, 12); kg.addColorStop(0, '#5a564e'); kg.addColorStop(1, '#151412');
        ctx.fillStyle = kg; ctx.beginPath(); ctx.arc(kx, by, 11, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.strokeStyle = '#8d877a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(kx, by); ctx.lineTo(kx + 6, by - 7); ctx.stroke();
      });
      ctx.restore();
      // green spill from the screen onto the bezel lip
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const spill = ctx.createLinearGradient(0, TY + TH, 0, TY + TH + 30); spill.addColorStop(0, 'rgba(40,140,60,0.18)'); spill.addColorStop(1, 'rgba(40,140,60,0)');
      ctx.fillStyle = spill; ctx.fillRect(TX, TY + TH + 4, TW, 30);
      ctx.restore();
  }

  // ================= EXPLAINER: a terminal session explains "How does AI learn?" =================
  const ASCII_CAT = ['  /\\_/\\  ', ' ( o.o ) ', '  > ^ <  '];
  const ASCII_DOG = ['  / \\__  ', ' (    @\\_', ' /   ___O'];
  function crtExplainer(ctx, W, H_, t) {
    const fmt = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const ease = (a, d) => H.ease.inOut(H.clamp((t - a) / d));
    const typed = (str, a, cps = 28) => str.slice(0, Math.max(0, Math.floor((t - a) * cps)));
    const blinkOn = Math.floor(t * 2.2) % 2 === 0;
    let boost = 1;
    if (t > 7.55 && t < 7.75) boost = 1.45;        // phosphor flash on the wrong guess
    if (t > 12.45 && t < 12.6) boost = 1.3;        // and on 97%

    const paint = (s, TW, TH) => {
      s.font = '26px "VT323"';
      const cw = s.measureText('M').width, LH = 28;
      const txt = (str, x, y, font = '26px "VT323"', a = 1) => { s.font = font; s.globalAlpha = a; s.shadowColor = '#fff'; s.shadowBlur = 3; s.fillText(str, x, y); s.shadowBlur = 0; s.globalAlpha = 1; return s.measureText(str).width; };
      const inv = (str, x, y, font = '26px "VT323"') => { s.font = font; const w = s.measureText(str).width, h = parseInt(font) || 26; s.globalAlpha = 0.8; s.fillRect(x - 4, y, w + 8, h); s.globalAlpha = 1; s.globalCompositeOperation = 'destination-out'; s.fillText(str, x, y); s.lineWidth = Math.max(1, h / 30); s.strokeText(str, x, y); s.globalCompositeOperation = 'source-over'; return w; };
      const cursor = (x, y, h = 22) => { if (blinkOn) s.fillRect(x + 2, y + 3, h * 0.55, h); };
      const line = (pts, w = 2, a = 1) => { s.globalAlpha = a; s.lineWidth = w; s.beginPath(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.stroke(); s.globalAlpha = 1; };
      const partial = (pts, f) => { // cut a polyline to fraction f of its length
        if (f >= 1) return pts; let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        let left = L * Math.max(0, f); const out = [pts[0]];
        for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d >= left) { const k = d ? left / d : 0; out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]); break; } out.push(pts[i]); left -= d; }
        return out;
      };
      const arrowTo = (pts, f, w = 2) => { const p = partial(pts, f); line(p, w); if (f > 0.05 && p.length > 1) { const [x2, y2] = p[p.length - 1], [x1, y1] = p[p.length - 2]; const a = Math.atan2(y2 - y1, x2 - x1); line([[x2 + Math.cos(a + 2.5) * 13, y2 + Math.sin(a + 2.5) * 13], [x2, y2], [x2 + Math.cos(a - 2.5) * 13, y2 + Math.sin(a - 2.5) * 13]], w); } };
      const boxR = (x, y, w, h, f = 1, lw = 2) => line(partial([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], f), lw);
      const asciiPic = (rows, x, y) => rows.forEach((rw, i) => txt(rw, x, y + i * LH));

      // ---------- scene drawers (each in its own coordinates; the V-hold roll moves between them) ----------
      const scene1and2 = () => {
        const scroll = ease(2.05, 0.5) * 300;
        s.save(); s.translate(0, -scroll);
        // BEAT 1: the user asks the question; the machine echoes it big
        const q = '> how does ai learn?';
        const tq = typed(q, 0.1, 32);
        const qw = txt(tq, 40, 40, '52px "VT323"'); if (tq.length < q.length || t < 0.75) { if (blinkOn) s.fillRect(46 + qw, 46, 24, 42); }
        if (t > 0.75) {
          const big = 'HOW DOES AI LEARN?', bt = typed(big, 0.75, 30);
          txt(bt, 40, 150, '124px "VT323"');
          if (t > 1.4) txt('='.repeat(44), 40, 282, '32px "VT323"', 0.8);
        }
        // BEAT 2 (300px lower, scrolls into view): the training data stream
        s.translate(0, 300);
        const cmd = '$ train --data ./examples --labels';
        if (t > 2.1) txt(typed(cmd, 2.1, 70), 40, 30);
        if (t > 2.2) {
          const F32 = '32px "VT323"';
          // log of labelled examples, scrolling fast (labels are the story; filenames are texture)
          const n = Math.floor((t - 2.2) / 0.085);
          for (let k = 0; k < 7; k++) {
            const i = n - 6 + k; if (i < 0) continue;
            const isCat = (i * 7) % 3 !== 0, y = 70 + k * 36;
            const id = String(4800 + i * 37).padStart(7, '0');
            const w = inv(isCat ? 'cat' : 'dog', 44, y, F32);
            txt('img_' + id, 44 + w + 16, y, F32, k === 6 ? 1 : 0.45 + k * 0.07);
          }
          // the current example as an ASCII picture with its label landing under it
          const cur = Math.floor((t - 2.2) / 0.55), isCat = cur % 3 !== 2;
          boxR(410, 70, 250, 150, ease(2.2, 0.3));
          if (t > 2.4) { s.font = '38px "VT323"'; (isCat ? ASCII_CAT : ASCII_DOG).forEach((rw, i) => txt(rw, 428, 86 + i * 38, '38px "VT323"')); inv(isCat ? ' cat ' : ' dog ', 500, 226, '38px "VT323"'); }
          // marching arrow into the model
          if (t > 2.6) {
            const f = ease(2.6, 0.4);
            arrowTo([[670, 145], [790, 145]], f, 3);
            const m = Math.floor(t * 12) % 4;
            for (let k = 0; k < 4; k++) if (k !== m && f >= 1) txt('>', 690 + k * 22, 106, F32, 0.7);
          }
          // the model box
          if (t > 2.5) {
            boxR(800, 64, 250, 186, ease(2.5, 0.4), 3);
            if (t > 2.8) {
              inv(' MODEL ', 868, 50, '38px "VT323"');
              ['o   o   o', ' \\ / \\ / ', '  o   o  ', '   \\ /   ', '    o    '].forEach((rw, i) => txt(rw, 838, 98 + i * 30, F32));
            }
          }
          // counter: the hero number of this beat
          if (t > 2.8) {
            txt('EXAMPLES SEEN', 410, 262, '38px "VT323"');
            const v = 1e6 * Math.pow(H.clamp((t - 2.9) / 2.8), 2);
            txt(fmt(v), 410, 296, '110px "VT323"');
          }
        }
        s.restore();
      };
      const scene3 = () => {
        s.save(); s.translate(0, 34); s.scale(1.06, 1.06);
        txt('$ step --verbose', 40, 24, '30px "VT323"', 0.7);
        // loop indicator with the active phase in inverse video
        const phase = t < 7.5 ? 0 : t < 8.35 ? 1 : t < 9.4 ? 2 : 0;
        const names = ['GUESS', 'CHECK', 'ADJUST'];
        let x = 40;
        names.forEach((nm, i) => { const w = i === phase ? inv(' ' + nm + ' ', x, 68, '38px "VT323"') : txt(' ' + nm + ' ', x, 68, '38px "VT323"', 0.6); x += w + 14; if (i < 2) { x += txt('->', x, 68, '38px "VT323"', 0.6) + 14; } });
        txt('<- repeat', x + 6, 68, '38px "VT323"', 0.6);
        // picture + model boxes
        boxR(40, 140, 210, 130); ASCII_CAT.forEach((rw, i) => txt(rw, 54, 150 + i * 36, '38px "VT323"')); txt('new picture', 50, 278, '32px "VT323"', 0.8);
        boxR(470, 130, 250, 200); inv(' MODEL ', 552, 118);
        // weights inside the model (digits roll while adjusting)
        const W0 = [0.42, -1.3, 0.77], W1 = [0.57, -0.86, 0.31];
        const adj = H.clamp((t - 8.55) / 0.75);
        W0.forEach((w0, i) => {
          let v = H.lerp(w0, W1[i], adj);
          if (adj > 0 && adj < 1) v += (H.rng(Math.floor(t * 20) + i)() - 0.5) * 0.4;
          const str = 'w' + (i + 1) + ' = ' + (v >= 0 ? ' ' : '') + v.toFixed(2);
          txt(str, 492, 160 + i * 44, '40px "VT323"', adj > 0 && adj < 1 ? 1 : 0.85);
        });
        // GUESS arrow
        arrowTo([[260, 200], [460, 200]], ease(6.7, 0.4)); if (t > 6.8) txt('guess', 312, 160, '34px "VT323"', 0.9);
        const out1 = t > 7.05 && t < 9.4, out2 = t > 9.7;
        if (t > 6.95) arrowTo([[730, 200], [800, 200]], ease(6.95, 0.2));
        if (out1) {
          txt('dog?', 815, 172, '64px "VT323"');
          if (t > 7.5) { // CHECK: wrong
            line([[810, 172], [930, 236]], 4); line([[930, 172], [810, 236]], 4);
            if (t > 8.2 || Math.floor((t - 7.5) * 6) % 2 === 0) inv(" WRONG: IT'S A CAT ", 680, 262, '38px "VT323"');
          }
        }
        // ADJUST: error travels back underneath into the model
        if (t > 8.35) {
          const path = [[870, 300], [870, 380], [600, 380], [600, 340]];
          arrowTo(path, ease(8.35, 0.55));
          if (t > 8.5) txt('error', 690, 388, '34px "VT323"');
        }
        if (out2) {
          txt('cat', 815, 172, '64px "VT323"');
          if (t > 9.95) { line([[905, 205], [920, 222], [950, 178]], 4); txt('[ OK ]', 815, 262, '38px "VT323"'); }
        }
        txt('round ' + String(1 + Math.floor(Math.max(0, t - 6.4) * 2.2)).padStart(3, '0'), 40, 430, '32px "VT323"', 0.7);
        s.restore();
      };
      const scene4 = () => {
        txt('$ plot accuracy --rounds 12', 40, 30);
        const ox = 90, oy = 400, ah = 290, bw = 40;
        line([[ox, oy - ah - 10], [ox, oy], [ox + 12 * (bw + 12) + 10, oy]], 2);
        txt('100%', 26, oy - ah - 14, '28px "VT323"', 0.8); txt(' 50%', 26, oy - ah / 2 - 14, '28px "VT323"', 0.8);
        txt('training rounds ->', ox + 260, oy + 8, '32px "VT323"', 0.8);
        const acc = (i) => 97 - 36 * Math.exp(-i / 3.2);
        const nb = H.clamp((t - 11.0) / 1.4) * 12;
        for (let i = 0; i < 12; i++) {
          const g = H.clamp(nb - i); if (g <= 0) break;
          const h = ((acc(i) - 0) / 100) * ah * H.ease.out(g);
          s.globalAlpha = 0.7; for (let y = oy - 4; y > oy - h; y -= 8) s.fillRect(ox + 12 + i * (bw + 12), y - 5, bw, 6); s.globalAlpha = 1; // block characters, stacked
        }
        const val = Math.round(61 + 36 * H.ease.out(H.clamp((t - 11.0) / 1.4)));
        txt('ACCURACY', 760, 100, '40px "VT323"');
        const vs = val + '%';
        if (t > 12.45 && (t > 12.95 || Math.floor((t - 12.45) * 8) % 2 === 0)) { inv(vs, 760, 140, '120px "VT323"'); }
        else txt(vs, 760, 140, '120px "VT323"');
        txt('61% -> ' + val + '%', 764, 262, '38px "VT323"', 0.85);
        if (t > 12.5) { arrowTo([[750, 210], [ox + 11 * (bw + 12) + 40, oy - ((acc(11)) / 100) * ah + 10]], ease(12.5, 0.3)); }
        if (t > 13.0) {
          const tk = '> MORE EXAMPLES -> BETTER GUESSES', ts = typed(tk, 13.0, 55);
          txt(ts, 40, 458, '56px "VT323"'); if (ts.length < tk.length || blinkOn) s.fillRect(40 + s.measureText(ts).width + 6, 464, 26, 44);
        }
      };
      // ---------- V-hold roll transitions between scenes ----------
      const roll = (a, d, from, to) => {
        const k = H.ease.inOut(H.clamp((t - a) / d)), off = k * (TH + 60);
        s.save(); s.translate(0, -off); from(); s.restore();
        s.save(); s.translate(0, TH + 60 - off); to(); s.restore();
        s.fillStyle = '#000'; s.fillRect(0, TH - off - 4, TW, 64); s.fillStyle = '#fff'; // blanking bar
      };
      if (t < 6.1) scene1and2();
      else if (t < 6.55) roll(6.1, 0.45, scene1and2, scene3);
      else if (t < 10.5) scene3();
      else if (t < 10.95) roll(10.5, 0.45, scene3, scene4);
      else scene4();
      // status line (inverse video): the question lives here once asked
      s.globalAlpha = 0.8; s.fillRect(36, TH - 44, TW - 72, 30); s.globalAlpha = 1;
      s.globalCompositeOperation = 'destination-out'; s.font = '30px "VT323"'; s.letterSpacing = '1px';
      const beat = t < 2.5 ? 'READY' : t < 6.3 ? 'DATA' : t < 10.7 ? 'TRAINING LOOP' : 'RESULTS';
      const stl = ' NX-80 ' + (t > 1.9 ? '  Q: HOW DOES AI LEARN?' : '') + '   ' + beat;
      s.fillText(stl, 46, TH - 44); s.lineWidth = 1; s.strokeText(stl, 46, TH - 44);
      s.globalCompositeOperation = 'source-over'; s.letterSpacing = '0px';
    };
    crtCompose(ctx, W, H_, t, paint, 5, boost);
  }

  // ================= SOUND: a green-screen terminal in a quiet room. Mains hum from the tube, a heavy buckling-spring
  // keyboard for typed lines, soft relay ticks as the data log scrolls, an electron-beam crackle when lines are drawn,
  // V-hold rolls as a sagging hum surge with static, and the terminal bell for the hits. Times copied from crtExplainer.
  function crtSound(k) {
    const END = 14.5;
    const px = (x) => H.clamp(x / 1088) * 1.4 - 0.7; // tube x (0..1088) -> pan
    const sq = (t, f, dur, gain, o) => k.tone(t, Object.assign({ f, type: 'square', dur, gain, a: 0.002, hold: dur * 0.6, filter: 'lowpass', f2: 1800 }, o));
    // buckling-spring key: snap + low case thock
    const key = (t, p = 0, g = 1) => { k.noise(t, { dur: 0.02, filter: 'bandpass', f: 2300, q: 1.6, gain: 0.22 * g, a: 0.001, pan: p, minor: true }); k.noise(t + 0.006, { dur: 0.05, color: 'brown', filter: 'lowpass', f: 600, gain: 0.3 * g, a: 0.002, pan: p, minor: true }); k.tone(t, { f: 150, dur: 0.04, gain: 0.08 * g, a: 0.001, pan: p, minor: true }); };
    const enter = (t, p = 0) => { key(t, p, 1.4); k.noise(t + 0.03, { dur: 0.06, color: 'brown', filter: 'lowpass', f: 400, gain: 0.25, pan: p }); };
    // typing a line: a typist's pace (~11 keys/s) over the stretch the characters appear
    const typeLine = (t0, dur, p = 0) => { const r = H.rng(Math.round(t0 * 100)); for (let t = t0; t < t0 + dur - 0.02; t += 0.07 + r() * 0.04) key(t, p, 0.75 + r() * 0.35); };
    // terminal output printing (no keyboard): a soft tick per few glyphs
    const out = (t0, dur, p = 0) => { for (let t = t0; t < t0 + dur - 0.02; t += 0.09) k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1200, q: 3, gain: 0.12, a: 0.001, pan: p, minor: true }); };
    // electron beam tracing a line on the phosphor: thin crackle that follows the draw
    const beam = (t, dur, p0 = 0, p1 = 0) => k.noise(t, { dur, filter: 'bandpass', f: [[0, 1400], [dur, 2000]], q: 3, gain: 0.07, a: dur * 0.2, hold: dur * 0.5, pan: (p0 + p1) / 2, minor: true });
    // V-hold roll a -> a+d: hum sags and surges, static rides the blanking bar, raster locks with a thump
    const roll = (a, d) => {
      k.tone(a, { f: [[0, 62], [d * 0.5, 44], [d, 60]], type: 'sawtooth', dur: d + 0.08, gain: 0.08, a: d * 0.3, hold: d * 0.3, filter: 'lowpass', f2: 380 });
      k.noise(a, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 500], [d * 0.5, 1600], [d, 400]], q: 1.1, gain: 0.08, a: d * 0.45 });
      k.play('thud', a + d, { f: 85, gain: 0.25 });
    };
    // phosphor flash: high-voltage zap
    const zap = (t, g = 1) => { k.noise(t, { dur: 0.14, filter: 'highpass', f: 1800, gain: 0.16 * g, a: 0.001 }); k.play('thud', t, { f: 95, gain: 0.5 * g }); };
    // terminal bell (kept low: VT bells are mid-range)
    const bell = (t, f, g = 1, p = 0) => { k.tone(t, { f, type: 'triangle', dur: 0.5, gain: 0.16 * g, a: 0.002, verb: 0.15, pan: p }); k.tone(t, { f: k.hz(f) * 2, dur: 0.25, gain: 0.04 * g, a: 0.002, pan: p }); };

    k.bed('hum', 0, END, { gain: 0.55 });
    k.bed('room', 0, END, { gain: 0.6 });

    // ---- BEAT 1: user types the question (0.1, 32 cps, 20 chars), Enter, machine echoes it big (0.75, 30 cps, 18 chars)
    typeLine(0.1, 0.63, -0.5);
    enter(0.75, -0.3);
    out(0.78, 0.57, -0.1);
    k.play('thud', 1.4, { f: 70, gain: 0.2 });                              // '====' rule
    sq(1.9, 'A3', 0.06, 0.04, { pan: -0.4 });                              // status line takes the question
    // scroll down to the data screen (2.05-2.55): a smooth low slide
    k.noise(2.05, { dur: 0.5, color: 'brown', filter: 'lowpass', f: [[0, 250], [0.25, 700], [0.5, 250]], gain: 0.12, a: 0.22 });

    // ---- BEAT 2: '$ train ...' typed (2.1, 70 cps), Enter, log streams (a line every 0.085 s from 2.2)
    typeLine(2.1, 0.45, -0.5);
    enter(2.55, -0.5);
    for (let i = 1; (2.2 + i * 0.085) < 6.1; i++) { const t = 2.2 + i * 0.085; k.noise(t, { dur: 0.01, filter: 'bandpass', f: 900, q: 4, gain: 0.1, a: 0.001, pan: -0.6, minor: true }); }
    beam(2.2, 0.3, px(410), px(660));                                      // picture box draws
    beam(2.5, 0.4, px(800), px(1050));                                     // model box draws
    beam(2.6, 0.4, px(670), px(790));                                      // arrow into the model
    sq(2.8, 'D3', 0.08, 0.05, { pan: px(950) });                           // inverse ' MODEL ' tag
    // each new example + label lands every 0.55 s: relay clunk
    for (let t = 2.75; t < 6.1; t += 0.55) k.play('tock', t, { f: 260, gain: 0.45, pan: px(530), minor: true });
    // EXAMPLES SEEN counter (2.9-5.7, accelerating): ticks closing in, at most 12/s
    for (let t = 2.95; t < 5.65;) { k.noise(t, { dur: 0.016, filter: 'bandpass', f: 2000, q: 2, gain: 0.13, a: 0.001, pan: px(500), minor: true }); t += H.lerp(0.25, 1 / 12, (t - 2.9) / 2.8); }
    bell(5.7, 'E4', 0.9, px(500));                                          // lands on 1,000,000
    roll(6.1, 0.45);

    // ---- BEAT 3: guess arrow (6.7-7.1), dog? (7.05)
    beam(6.7, 0.4, px(260), px(460)); beam(6.95, 0.2, px(730), px(800));
    sq(7.05, 'G3', 0.1, 0.05, { pan: px(860) });
    // CHECK (7.5): the X, the inverse WRONG label and a phosphor flash at 7.55 -> bell clash + zap
    sq(7.5, 'A3', 0.32, 0.1, { hold: 0.22, f2: 1400, pan: px(860) }); sq(7.5, 'Bb3', 0.32, 0.08, { hold: 0.22, f2: 1400, pan: px(860) });
    zap(7.55, 1.2);
    // ADJUST (8.35): error path drawn back (8.35-8.9); weights roll their digits 8.55-9.3
    sq(8.35, 'D3', 0.06, 0.04, { pan: -0.2 });
    beam(8.35, 0.55, px(870), px(600));
    for (let t = 8.56; t < 9.3; t += 1 / 12) k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1600, q: 3, gain: 0.12, a: 0.001, pan: px(560), minor: true });
    sq(9.3, 'A3', 0.08, 0.04, { pan: px(560) });                           // weights settle
    sq(9.4, 'D3', 0.06, 0.04, { pan: -0.4 });                              // GUESS again
    sq(9.7, 'G3', 0.08, 0.045, { pan: px(860) });                          // 'cat'
    // [ OK ] + check (9.95): the correction, a clean two-note bell
    bell(9.95, 'E4', 0.9, px(860)); bell(10.05, 'A4', 0.9, px(860));
    roll(10.5, 0.45);

    // ---- BEAT 4: 12 bars rise (11.0 + i*0.117), % climbs with them
    k.withMinor(() => { for (let i = 0; i < 12; i++) sq(11.0 + i * (1.4 / 12), 160 * Math.pow(2, i / 10), 0.07, 0.045, { f2: 1000, pan: px(100 + i * 52) }); });
    // 97% (12.45): inverse flip + phosphor flash, the biggest hit. bell chord over a deep thump and zap
    const P = 12.45;
    zap(P, 1.6); bell(P, 'C4', 1.8, px(820)); bell(P, 'E4', 1.5, px(820)); bell(P, 'G4', 1.5, px(820)); bell(P + 0.08, 'C5', 1.4, px(820));
    k.tone(P, { f: 'C2', dur: 0.8, gain: 0.3, a: 0.004, hold: 0.15 });
    beam(12.5, 0.3, px(750), px(640));
    // ---- BEAT 5: takeaway typed (13.0, 55 cps, 33 chars -> 13.6) and lands with a soft resolving bell
    typeLine(13.0, 0.6, -0.3);
    bell(13.62, 'G3', 0.7); bell(13.74, 'C4', 0.9);
  }

  registerStyle({
    id: 'crt-terminal',
    name: 'Phosphor Terminal',
    category: 'Retro Digital',
    description: 'A green P1-phosphor CRT: VT323 boot log with bloom and halation, curved scanlines, true per-pixel barrel distortion with RGB fringing at the edges, tube vignette, hum bar, and a glass face catching the room light inside a plastic bezel.',
    motion: 'The tube powers on (dot, then a bright line that snaps open into a flashing raster that settles as the phosphor warms), then the boot log types at terminal speed, the trace sweeps, the greeting prints and the cursor blinks while a hum bar rolls.',
    duration: 6,
    fonts: ['26px "VT323"', '92px "VT323"', '700 15px "Space Mono"', '400 11px "Space Mono"'],
    frameT: 5.8,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'Explains as a live terminal session: the typed question scrolls away and lives on in the inverse-video status line, a labelled data log streams into a box-drawn MODEL, V-hold rolls carry us between screens, arrows and the error path are phosphor line-drawings, and counters are big VT323 numerals that flip in inverse video for emphasis.',
    explainer(ctx, W, H_, t) { crtExplainer(ctx, W, H_, t); },
    explainerSound(k) { crtSound(k); },
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(5);
      // same tube pipeline as the explainer: bezel, barrel remap, bloom, glass
      const paint = (s, TW, TH) => {
        // ---------- 2. SOURCE SCREEN (flat, pre-distortion) in phosphor intensity ----------
        s.shadowColor = '#fff'; s.shadowBlur = 3;
        const ox = 64, oy = 36, lh = 28;
        const cps = 200; // chars per second
        let budget = Math.max(0, (t - 1.0) * cps), lastX = ox, lastY = oy, done = true;
        s.font = '26px "VT323"';
        for (let i = 0; i < LINES.length; i++) {
          let [txt, kind] = LINES[i];
          if (kind === 2) {
            const prog = H.clamp((t - 1.55) / 0.9);
            const n = 24, f = Math.round(prog * n);
            txt = txt.replace('[BAR]', '[' + '█'.repeat(f) + '·'.repeat(n - f) + '] ' + String(Math.round(prog * 100)).padStart(3, ' ') + '%');
          }
          const shown = txt.slice(0, Math.floor(budget));
          budget -= txt.length + 14; // a short pause at each line end
          s.globalAlpha = kind === 1 && shown.endsWith('ok') ? 0.75 : 1;
          s.globalAlpha = kind === 0 && i < 2 ? 0.8 : kind === 2 ? 0.62 : s.globalAlpha;
          s.fillText(shown, ox, oy + i * lh);
          if (shown.length < txt.length) { lastX = ox + s.measureText(shown).width; lastY = oy + i * lh; done = false; break; }
          lastX = ox + s.measureText(shown).width; lastY = oy + i * lh;
        }
        s.globalAlpha = 1;
        // big greeting, typed after the log
        const big = 'HELLO. I AM AWAKE.';
        if (done) {
          const bt = Math.floor(Math.max(0, budget) * 0.16);
          const bshown = big.slice(0, bt);
          s.font = '92px "VT323"'; s.shadowBlur = 8;
          s.fillText(bshown, ox, oy + 11 * lh + 14);
          const bw = s.measureText(bshown).width;
          if (bt >= big.length) {
            s.font = '26px "VT323"'; s.shadowBlur = 3;
            s.globalAlpha = 0.85; s.fillText('='.repeat(Math.round(s.measureText(big).width / 13 * 0.0 + 46)), ox, oy + 11 * lh + 100); s.globalAlpha = 1;
            s.fillText('> ', ox, oy + 11 * lh + 136);
            lastX = ox + 26; lastY = oy + 11 * lh + 136;
          } else { lastX = ox + bw + 6; lastY = oy + 11 * lh + 14; }
        }
        // right-hand panel: cortex activity trace (vector-ish box with corner brackets)
        {
          const px0 = 700, py0 = 44, pw = 330, ph = 210;
          s.globalAlpha = 0.9; s.font = '26px "VT323"'; s.shadowBlur = 3;
          s.fillText('CORTEX ACTIVITY', px0 + 12, py0 - 2);
          s.strokeStyle = '#fff'; s.lineWidth = 2;
          const br = (x, y, dx, dy) => { s.beginPath(); s.moveTo(x + dx * 18, y); s.lineTo(x, y); s.lineTo(x, y + dy * 18); s.stroke(); };
          br(px0, py0 + 26, 1, 1); br(px0 + pw, py0 + 26, -1, 1); br(px0, py0 + ph, 1, -1); br(px0 + pw, py0 + ph, -1, -1);
          s.globalAlpha = 0.25; s.lineWidth = 1;
          for (let gx = 1; gx < 6; gx++) { s.beginPath(); for (let gy = py0 + 34; gy < py0 + ph - 6; gy += 6) { s.moveTo(px0 + gx * pw / 6, gy); s.lineTo(px0 + gx * pw / 6, gy + 2); } s.stroke(); }
          s.globalAlpha = 1; s.lineWidth = 2.2; s.shadowBlur = 6;
          const prog = H.clamp((t - 1.2) / 2.6);
          s.beginPath();
          for (let x = 0; x <= pw - 20; x += 2) {
            if (x / (pw - 20) > prog) break;
            const k = x / (pw - 20);
            const amp = 6 + 46 * H.smooth(0.55, 0.95, k);
            const y = py0 + 26 + (ph - 26) / 2 + Math.sin(x * 0.11 + t * 6) * amp * 0.6 + nz.n2(x * 0.06, t) * amp;
            if (x === 0) s.moveTo(px0 + 10 + x, y); else s.lineTo(px0 + 10 + x, y);
          }
          s.stroke();
          s.shadowBlur = 3; s.font = '26px "VT323"';
          s.fillText('SIGNAL ' + String(Math.round(prog * 97 + 2)).padStart(3, ' ') + '%   T+' + t.toFixed(2), px0 + 12, py0 + ph + 8);
          s.globalAlpha = 1;
        }
        // block cursor (blinks at ~2Hz)
        if (Math.floor(t * 2.2) % 2 === 0) { s.shadowBlur = 6; const big2 = lastY > oy + 11 * lh && lastY < oy + 11 * lh + 40; s.fillRect(lastX + 2, lastY + 3, big2 ? 40 : 13, big2 ? 74 : 22); }
        s.shadowBlur = 0;
        // status line at bottom (inverse video)
        s.globalAlpha = 0.8; s.fillRect(36, TH - 44, TW - 72, 30); s.globalAlpha = 1;
        s.globalCompositeOperation = 'destination-out'; s.font = '30px "VT323"'; s.letterSpacing = '1px';
        const stl = ' NX-80   SESSION 01   9600 BAUD   ONLINE   ' + '00:0' + Math.floor(t) + ':' + String(Math.floor(t * 60) % 60).padStart(2, '0') + '   CAPS';
        s.fillText(stl, 46, TH - 44); s.lineWidth = 1; s.strokeText(stl, 46, TH - 44);
        s.globalCompositeOperation = 'source-over'; s.letterSpacing = '0px';
      };
      crtCompose(ctx, W, H_, t, paint, t - 0.25, 1);
    },
  });
}
```
