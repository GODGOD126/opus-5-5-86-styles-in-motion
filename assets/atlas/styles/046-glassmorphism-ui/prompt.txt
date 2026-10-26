I want an animated explainer made in the "Glassmorphism UI" visual style (Dimensional). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
Name: Glassmorphism UI
Family: Dimensional
Look: Frosted-glass UI: translucent panels that genuinely blur the vivid gradient blobs and orbs behind them, with 1px light borders, a diagonal specular sheen, fine frost grain and crisp Inter type.
Motion: Color blobs bloom up under the glass, the frosted card rises in, then the chat plays out (user bubble pops, the AI reply types itself line by line) while stat chips float in glass-over-glass and their ring and sparkline draw on; blobs keep drifting so the frost shimmers.
How it explains: The camera glides and zooms across one big frosted dashboard (data feed → network card → output chat → accuracy chart → pull back) while the live colour blobs drift behind, so every panel re-frosts as it moves; connectors are glowing gradient lines with travelling light dots, labels are glass pills, numbers count in big Inter 800.

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

REFERENCE STYLE SOURCE (styles/glassmorphism.js; W/H_ are always 1280x720)
```js
{
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  let NOISE = null;
  function noisePattern(ctx) {
    if (!NOISE) {
      NOISE = H.layer(160, 160);
      const nc = NOISE.getContext('2d'), id = nc.createImageData(160, 160), r = H.rng(99);
      for (let i = 0; i < id.data.length; i += 4) { const v = r() < 0.5 ? 0 : 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = r() * 60; }
      nc.putImageData(id, 0, 0);
    }
    return ctx.createPattern(NOISE, 'repeat');
  }
  // Frosted glass panel: shadow -> blurred backdrop (clipped) -> tint -> grain -> sheen -> 1px gradient border
  function glass(ctx, src, x, y, w, h, r, o = {}) {
    const tint = o.tint ?? 0.1;
    ctx.save();
    ctx.shadowColor = 'rgba(8,4,30,0.45)'; ctx.shadowBlur = o.shadow ?? 50; ctx.shadowOffsetY = (o.shadow ?? 50) * 0.4;
    ctx.fillStyle = 'rgba(20,10,50,1)'; rr(ctx, x, y, w, h, r); ctx.fill();
    ctx.restore();
    ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
    { const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(src, 0, 0, ctx.canvas.width, ctx.canvas.height); ctx.setTransform(M); }
    const tg = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
    tg.addColorStop(0, `rgba(255,255,255,${tint + 0.08})`); tg.addColorStop(1, `rgba(255,255,255,${tint * 0.5})`);
    ctx.fillStyle = tg; ctx.fillRect(x, y, w, h);
    { const A = ctx.globalAlpha; ctx.globalAlpha = A * 0.22; ctx.fillStyle = noisePattern(ctx); ctx.fillRect(x, y, w, h); ctx.globalAlpha = A; }
    // diagonal specular sheen
    const sg = ctx.createLinearGradient(x, y, x + w * 0.55, y + h * 0.55);
    sg.addColorStop(0, 'rgba(255,255,255,0.16)'); sg.addColorStop(0.45, 'rgba(255,255,255,0.04)'); sg.addColorStop(0.46, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = sg; ctx.fillRect(x, y, w, h);
    ctx.restore();
    // 1px light border, brighter top-left
    ctx.save();
    const bg = ctx.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, 'rgba(255,255,255,0.65)'); bg.addColorStop(0.35, 'rgba(255,255,255,0.18)'); bg.addColorStop(0.7, 'rgba(255,255,255,0.08)'); bg.addColorStop(1, 'rgba(255,255,255,0.32)');
    ctx.strokeStyle = bg; ctx.lineWidth = 1; rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.stroke();
    // inner top highlight
    const hg = ctx.createLinearGradient(x, 0, x + w, 0);
    hg.addColorStop(0, 'rgba(255,255,255,0)'); hg.addColorStop(0.3, 'rgba(255,255,255,0.55)'); hg.addColorStop(0.7, 'rgba(255,255,255,0.15)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = hg; ctx.beginPath(); ctx.moveTo(x + r, y + 1.5); ctx.lineTo(x + w - r, y + 1.5); ctx.stroke();
    ctx.restore();
  }
  function blurOf(srcCanvas, W, Hh, px) {
    const L = H.layer(W, Hh), c = L.getContext('2d');
    c.filter = `blur(${px}px) saturate(150%)`;
    c.drawImage(srcCanvas, 0, 0, W, Hh);
    return L;
  }
  function orb(ctx, x, y, r, c1, c2, c3) {
    const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.05, x, y, r);
    g.addColorStop(0, c1); g.addColorStop(0.55, c2); g.addColorStop(1, c3);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }

  // ================= EXPLAINER: the camera glides across one big frosted-glass dashboard; panels blur the live blobs behind them =================
  function petIcon(ctx, kind, x, y, r, col = '#ffffff', lw = 2) {
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    if (kind === 'cat') { ctx.moveTo(-0.8 * r, -0.1 * r); ctx.lineTo(-0.7 * r, -1.0 * r); ctx.lineTo(-0.25 * r, -0.72 * r); ctx.moveTo(0.8 * r, -0.1 * r); ctx.lineTo(0.7 * r, -1.0 * r); ctx.lineTo(0.25 * r, -0.72 * r); }
    else { ctx.moveTo(-0.62 * r, -0.62 * r); ctx.quadraticCurveTo(-1.25 * r, -0.4 * r, -0.95 * r, 0.35 * r); ctx.moveTo(0.62 * r, -0.62 * r); ctx.quadraticCurveTo(1.25 * r, -0.4 * r, 0.95 * r, 0.35 * r); }
    ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 0.8 * r, 0, 7); ctx.stroke();
    ctx.fillStyle = col;
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 0.3 * r, -0.08 * r, 0.09 * r, 0, 7); ctx.fill(); }
    ctx.beginPath(); ctx.ellipse(0, 0.25 * r, 0.12 * r, 0.08 * r, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  function chipPill(ctx, x, y, text, o = {}) {
    ctx.save(); ctx.font = o.font || '600 13px "Inter"';
    const w = ctx.measureText(text).width + (o.dot ? 40 : 26), h = o.h || 26, k = o.k ?? 1;
    ctx.globalAlpha *= Math.min(1, k * 1.5); ctx.translate(x, y); ctx.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k);
    if (o.grad) { const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, o.grad[0]); g.addColorStop(1, o.grad[1]); ctx.fillStyle = g; ctx.shadowColor = o.glow || 'rgba(255,60,200,0.4)'; ctx.shadowBlur = 16; }
    else ctx.fillStyle = o.bg || 'rgba(255,255,255,0.16)';
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1, h / 2); ctx.stroke();
    if (o.dot) { ctx.fillStyle = o.dot; ctx.beginPath(); ctx.arc(-w / 2 + 14, 0, 4, 0, 7); ctx.fill(); }
    ctx.fillStyle = o.col || '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, o.dot ? 8 : 0, 1);
    ctx.restore();
  }
  function glowLine(ctx, a, c, b, prog, col1, col2, w = 3, dots = 0, t = 0) {
    if (prog <= 0) return null;
    const q = (u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
    const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, col1); g.addColorStop(1, col2);
    ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.shadowColor = col2; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); for (let i = 1; i <= 40; i++) { const p = q(prog * i / 40); ctx.lineTo(p[0], p[1]); } ctx.stroke();
    const e = q(prog), e0 = q(Math.max(0, prog - 0.03)), ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
    ctx.translate(e[0], e[1]); ctx.rotate(ang); ctx.fillStyle = col2; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-8, -7); ctx.lineTo(-5, 0); ctx.lineTo(-8, 7); ctx.closePath(); ctx.fill();
    ctx.restore();
    for (let i = 0; i < dots; i++) { const uu = ((t * 0.7 + i / dots) % 1) * prog; const p = q(uu); ctx.fillStyle = '#ffffff'; ctx.shadowColor = col2; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(p[0], p[1], 3.2, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
    return q;
  }
  function glassExplainer(ctx, W, H_, t) {
    const ph = (a, b) => H.clamp((t - a) / (b - a));
    const E = (a, b) => H.ease.inOut(ph(a, b));
    const EO = (a, b) => H.ease.out(ph(a, b));
    const typed = (str, a, b) => str.slice(0, Math.round(str.length * ph(a, b)));
    // camera over the dashboard: [t, centreX, centreY, zoom]
    const KF = [[0, 640, 360, 1], [1.7, 640, 360, 1], [2.8, 1300, 345, 1.35], [5.8, 1302, 345, 1.37], [6.8, 2238, 330, 1.3], [10.2, 2242, 330, 1.31], [11.1, 3060, 345, 1.35], [12.8, 3062, 345, 1.37], [13.8, 1800, 330, 0.37], [20, 1800, 330, 0.37]];
    let k = 0; while (k < KF.length - 2 && t > KF[k + 1][0]) k++;
    const A = KF[k], B = KF[k + 1], u = H.ease.inOut(H.clamp((t - A[0]) / (B[0] - A[0])));
    const camX = H.lerp(A[1], B[1], u), camY = H.lerp(A[2], B[2], u), z = H.lerp(A[3], B[3], u);
    const d = (p, a) => Math.sin(t * 0.5 + p) * a;

    // ---------- background: blobs live in screen space but drift with a slow parallax of the camera ----------
    const BG = H.layer(W, H_), b = BG.getContext('2d');
    const base = b.createLinearGradient(0, 0, W, H_); base.addColorStop(0, '#0c0a24'); base.addColorStop(1, '#170f3a');
    b.fillStyle = base; b.fillRect(0, 0, W, H_);
    // blobs add light ('screen'), so overlaps go luminous instead of muddy; orange gets a hot coral mid-stop
    const blob = (x, y, r, col, a = 1) => { const hot = col === '#ff7a1a', mid = hot ? '#ff5a4a' : col, tail = hot ? '#ff2b8a' : col; const g = b.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, H.rgba(col, a)); g.addColorStop(0.5, H.rgba(mid, a * 0.55)); g.addColorStop(1, H.rgba(tail, 0)); b.fillStyle = g; b.fillRect(x - r, y - r, r * 2, r * 2); };
    const par = (wx) => 640 + (wx - camX) * 0.35 * Math.max(z, 0.6);
    const BL = [[300, 170, '#7a2bff'], [900, 600, '#2b6bff'], [1400, 220, '#ff2bd6'], [1900, 620, '#00d1ff'], [2300, 200, '#ff7a1a'], [2800, 560, '#ff2bd6'], [3300, 220, '#7a2bff'], [3700, 600, '#ff7a1a'], [-200, 600, '#00d1ff']];
    BL.forEach(([x, y, c], i) => blob(par(x) + d(i, 30), y + d(i + 2, 20), c === '#ff7a1a' ? 300 : i % 2 ? 330 : 380, c, 0.85));
    // pools of dark negative space, like the hero (base colour re-asserted in the corners)
    const pool = (x, y, r, a) => { const g = b.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(12,10,36,${a})`); g.addColorStop(0.55, `rgba(12,10,36,${a * 0.6})`); g.addColorStop(1, 'rgba(12,10,36,0)'); b.fillStyle = g; b.fillRect(x - r, y - r, r * 2, r * 2); };
    pool(0, H_, 520, 0.6); pool(W, 0, 420, 0.4);
    const orb = (x, y, r, c1, c2, c3) => { const g = b.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.05, x, y, r); g.addColorStop(0, c1); g.addColorStop(0.55, c2); g.addColorStop(1, c3); b.fillStyle = g; b.beginPath(); b.arc(x, y, r, 0, 7); b.fill(); };
    orb(par(1650) + d(5, 10), 150, 90, '#ffd2f4', '#ff4fc1', '#6a1497');
    orb(par(2700) + d(6, 10), 600, 70, '#c7f2ff', '#3aa0ff', '#1a2a8a');
    orb(par(600), 560, 60, '#ffe3b8', '#ff8a2a', '#9a2f12');
    b.strokeStyle = 'rgba(255,255,255,0.035)'; b.lineWidth = 1; b.beginPath();
    const gx = (-(camX * z) % 48 + 48) % 48;
    for (let x = gx; x <= W; x += 48 * z) { b.moveTo(x + 0.5, 0); b.lineTo(x + 0.5, H_); }
    for (let y = 0; y <= H_; y += 48 * z) { b.moveTo(0, y + 0.5); b.lineTo(W, y + 0.5); }
    b.stroke();
    // dither the smooth gradients before the blur + saturate, which otherwise bands
    b.globalAlpha = 0.05; b.fillStyle = noisePattern(b); b.fillRect(0, 0, W, H_); b.globalAlpha = 1;
    ctx.drawImage(BG, 0, 0);
    let SRC = blurOf(BG, W, H_, 26);

    ctx.save();
    ctx.translate(640, 360); ctx.scale(z, z); ctx.translate(-camX, -camY);
    const panelIn = (t0) => EO(t0, t0 + 0.6);
    const panel = (x, y, w, h, t0, title) => {
      const e = panelIn(t0); if (e <= 0) return false;
      ctx.save(); ctx.globalAlpha = e; glass(ctx, SRC, x, y + (1 - e) * 40, w, h, 28, { tint: 0.09 }); ctx.restore();
      if (title) { ctx.save(); ctx.globalAlpha = EO(t0 + 0.2, t0 + 0.6); ctx.font = '600 21px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.78)'; ctx.fillText(title, x + 28, y + 44 + (1 - e) * 40); ctx.restore(); }
      return true;
    };
    // ===== B: training data =====
    const BX = 980, BY = 150, BW = 640, BH = 430;
    if (panel(BX, BY, BW, BH, 2.2, 'TRAINING DATA')) {
      const cnt = Math.floor(1e6 * Math.pow(EO(2.9, 5.7), 1.6));
      ctx.font = '800 50px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText(cnt.toLocaleString('en-US'), BX + 26, BY + 104);
      const nw = ctx.measureText(cnt.toLocaleString('en-US')).width;
      ctx.font = '600 22px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillText('examples', BX + 36 + nw, BY + 102);
      const pr = ph(2.9, 5.7);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.roundRect(BX + 28, BY + 116, BW - 56, 6, 3); ctx.fill();
      const pg = ctx.createLinearGradient(BX + 28, 0, BX + BW - 28, 0); pg.addColorStop(0, '#7a2bff'); pg.addColorStop(1, '#ff4fc1');
      ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(BX + 28, BY + 116, (BW - 56) * Math.pow(pr, 1.6), 6, 3); ctx.fill();
      // grid of labelled example tiles that keeps refilling (scrolls upward like a live feed)
      const scroll = Math.max(0, t - 2.6) * 60;
      ctx.save(); ctx.beginPath(); ctx.roundRect(BX + 20, BY + 140, BW - 40, BH - 160, 16); ctx.clip();
      for (let i = 0; i < 16; i++) {
        const col = i % 4, row = Math.floor(i / 4);
        const tx = BX + 30 + col * 146, ty = BY + 150 + row * 128 - (scroll % 128);
        const idx = i + Math.floor(scroll / 128) * 4;
        const appear = 2.5 + (idx % 15) * 0.05 + Math.floor(idx / 15) * 0;
        const e = EO(appear, appear + 0.3); if (e <= 0) continue;
        const kind = (idx * 7 + 3) % 5 < 2 ? 'dog' : 'cat';
        ctx.save(); ctx.globalAlpha = e;
        ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.beginPath(); ctx.roundRect(tx, ty, 134, 116, 18); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(tx + 0.5, ty + 0.5, 133, 115, 18); ctx.stroke();
        petIcon(ctx, kind, tx + 67, ty + 44, 22, '#ffffff', 2.5);
        chipPill(ctx, tx + 67, ty + 92, kind, { font: '600 21px "Inter"', h: 32, bg: 'rgba(255,255,255,0.26)', dot: kind === 'cat' ? '#7ad7ff' : '#ffb35c' });
        ctx.restore();
      }
      ctx.restore();
    }
    // ===== C: model (network card) =====
    const CX = 1800, CY = 160, CW = 420, CH = 400;
    const adj = E(8.6, 9.3);
    const showC = panel(CX, CY, CW, CH, 4.2, 'MODEL');
    const NODES = [];
    for (let c = 0; c < 3; c++) for (let r = 0; r < (c === 1 ? 4 : 3); r++) NODES.push([CX + 80 + c * 130, CY + (c === 1 ? 110 : 140) + r * (c === 1 ? 70 : 85), c]);
    const wgt = (i, j) => { const a = Math.abs(Math.sin(i * 3.1 + j * 1.7)), b2 = Math.abs(Math.cos(i * 2.3 + j * 0.9)); return H.lerp(a, b2, adj); };
    const err = ph(8.0, 8.4) * (1 - ph(9.2, 9.6));
    if (showC) {
      const pulse = (c) => Math.max(0, Math.sin((t * 6) - c * 1.4)) * ((t > 6.8 && t < 7.2) || (t > 9.3 && t < 9.7) ? 1 : 0);
      for (let i = 0; i < NODES.length; i++) for (let j = 0; j < NODES.length; j++) {
        if (NODES[j][2] !== NODES[i][2] + 1) continue;
        const w = wgt(i, j);
        const col = H.mix(H.mix([122, 215, 255], [255, 79, 193], w), [255, 90, 90], err);
        ctx.strokeStyle = H.rgba(col, 0.25 + 0.65 * w); ctx.lineWidth = 0.8 + 3.2 * w;
        ctx.beginPath(); ctx.moveTo(NODES[i][0], NODES[i][1]); ctx.lineTo(NODES[j][0], NODES[j][1]); ctx.stroke();
      }
      for (const [x, y, c] of NODES) {
        const g = ctx.createRadialGradient(x - 4, y - 5, 1, x, y, 15); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, H.rgba(H.mix([255, 120, 220], [255, 230, 140], pulse(c)))); g.addColorStop(1, '#7a2bff');
        ctx.save(); ctx.shadowColor = '#ff4fc1'; ctx.shadowBlur = 12 + 14 * pulse(c); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill(); ctx.restore();
      }
      ctx.font = '600 21px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.78)'; ctx.fillText('weights', CX + CW - 112, CY + 44);
    }
    // ===== D: output chat card =====
    const DX = 2290, DY = 190, DW = 380, DH = 320;
    const wrong = t > 7.05 && t < 9.4, right = t >= 9.4;
    const shake = t > 7.4 && t < 7.8 ? Math.sin(t * 80) * 6 : 0;
    if (panel(DX + shake, DY, DW, DH, 6.5, 'OUTPUT')) {
      // test picture
      ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.beginPath(); ctx.roundRect(DX + 28 + shake, DY + 64, 120, 110, 18); ctx.fill();
      petIcon(ctx, 'cat', DX + 88 + shake, DY + 124, 28, '#ffffff', 2.5);
      if (t > 6.9 && t < 7.05) chipPill(ctx, DX + 270, DY + 110, '• • •', { bg: 'rgba(255,255,255,0.12)', font: '800 20px "Inter"', h: 34 });
      if (wrong || right) {
        const k2 = EO(right ? 9.4 : 7.05, (right ? 9.4 : 7.05) + 0.3);
        ctx.save(); ctx.globalAlpha = k2;
        const gx2 = DX + 170 + shake, gy2 = DY + 82;
        const ug = ctx.createLinearGradient(gx2, gy2, gx2 + 180, gy2 + 56);
        if (right) { ug.addColorStop(0, '#1fbf8f'); ug.addColorStop(1, '#4dffa6'); } else { ug.addColorStop(0, '#8a5bff'); ug.addColorStop(1, '#ff4fc1'); }
        ctx.fillStyle = ug; ctx.beginPath(); ctx.roundRect(gx2, gy2, 180, 60, [20, 20, 20, 4]); ctx.fill();
        ctx.font = '800 36px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText(right ? 'cat' : 'dog?', gx2 + 18, gy2 + 43);
        ctx.restore();
        // verdict badge
        const vk = H.ease.back(ph(right ? 9.45 : 7.4, (right ? 9.45 : 7.4) + 0.3));
        if (vk > 0) {
          ctx.save(); ctx.translate(gx2 + 150, gy2 + 30); ctx.scale(vk, vk);
          ctx.shadowColor = right ? '#4dffa6' : '#ff3b5c'; ctx.shadowBlur = 18; ctx.fillStyle = right ? '#4dffa6' : '#ff3b5c'; ctx.beginPath(); ctx.arc(0, 0, 17, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath();
          if (right) { ctx.moveTo(-7, 0); ctx.lineTo(-2, 6); ctx.lineTo(8, -6); } else { ctx.moveTo(-6, -6); ctx.lineTo(6, 6); ctx.moveTo(6, -6); ctx.lineTo(-6, 6); }
          ctx.stroke(); ctx.restore();
        }
      }
      if (t > 7.6 && t < 9.5) { ctx.save(); ctx.globalAlpha = EO(7.6, 7.9) * (1 - ph(9.3, 9.5)); ctx.font = '600 22px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText('Answer:', DX + 30, DY + 226); chipPill(ctx, DX + 176, DY + 219, 'cat', { dot: '#7ad7ff', font: '700 22px "Inter"', h: 36, bg: 'rgba(255,255,255,0.24)' }); ctx.restore(); }
      ctx.font = '400 16px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText(typed(right ? 'Weights updated · try #2' : wrong ? 'Prediction 1 of many' : '', right ? 9.5 : 7.1, right ? 9.9 : 7.5), DX + 30, DY + 280);
      // emphasis on the wrong guess: red glow ring
      if (wrong && t > 7.4) { ctx.save(); ctx.strokeStyle = '#ff3b5c'; ctx.shadowColor = '#ff3b5c'; ctx.shadowBlur = 20; ctx.lineWidth = 3; ctx.globalAlpha = 0.55 + 0.45 * Math.sin(t * 10); const pr = EO(7.4, 7.8); ctx.beginPath(); ctx.roundRect(DX + 160 - 10 * (1 - pr), DY + 72 - 10 * (1 - pr), 200 + 20 * (1 - pr), 80 + 20 * (1 - pr), 26); ctx.stroke(); ctx.restore(); }
    }
    // ===== E: accuracy chart =====
    const EX = 2780, EY = 150, EW = 560, EH = 430;
    const ACCS = [61, 72, 80, 86, 90, 93, 95, 97];
    if (panel(EX, EY, EW, EH, 10.4, 'ACCURACY')) {
      const cp = H.ease.inOut(ph(10.9, 12.6));
      const cur = Math.round(H.lerp(61, 97, cp));
      const big = t > 12.6 ? 1 + 0.12 * Math.sin(Math.min(1, (t - 12.6) / 0.35) * Math.PI) : 1;
      ctx.save(); ctx.translate(EX + 28, EY + 110); ctx.scale(big, big);
      const ng = ctx.createLinearGradient(0, -60, 220, 0); ng.addColorStop(0, '#ffffff'); ng.addColorStop(1, cur >= 97 ? '#4dffa6' : '#ffc6f0');
      ctx.font = '800 72px "Inter"'; ctx.fillStyle = ng; if (cur >= 97) { ctx.shadowColor = '#4dffa6'; ctx.shadowBlur = 24 * (1 - ph(13.2, 14)); } ctx.fillText(cur + '%', 0, 0); ctx.restore();
      ctx.font = '600 21px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.78)'; ctx.fillText('round 1: 61%', EX + 300, EY + 104);
      // axes + line chart
      const gx0 = EX + 40, gx1 = EX + EW - 40, gy0 = EY + EH - 50, gy1 = EY + 150;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) { const y = H.lerp(gy0, gy1, i / 4); ctx.beginPath(); ctx.moveTo(gx0, y); ctx.lineTo(gx1, y); ctx.stroke(); }
      const pts = ACCS.map((a, i) => [H.lerp(gx0, gx1, i / 7), H.lerp(gy0, gy1, (a - 50) / 50)]);
      const n = cp * 7, m = Math.floor(n), f = n - m;
      const vis = pts.slice(0, m + 1); if (m < 7) vis.push([H.lerp(pts[m][0], pts[m + 1][0], f), H.lerp(pts[m][1], pts[m + 1][1], f)]);
      if (t > 10.9) {
        const ag = ctx.createLinearGradient(0, gy1, 0, gy0); ag.addColorStop(0, 'rgba(77,255,166,0.35)'); ag.addColorStop(1, 'rgba(77,255,166,0)');
        ctx.fillStyle = ag; ctx.beginPath(); ctx.moveTo(vis[0][0], gy0); vis.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(vis[vis.length - 1][0], gy0); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.strokeStyle = '#4dffa6'; ctx.shadowColor = '#4dffa6'; ctx.shadowBlur = 12; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath(); vis.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.restore();
        vis.forEach((p, i) => { if (i <= m) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, 7); ctx.fill(); } });
        const lp = vis[vis.length - 1]; ctx.save(); ctx.shadowColor = '#4dffa6'; ctx.shadowBlur = 16; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lp[0], lp[1], 7, 0, 7); ctx.fill(); ctx.restore();
        if (t > 12.6) { ctx.save(); ctx.strokeStyle = '#4dffa6'; ctx.globalAlpha = 1 - ph(12.6, 13.4); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lp[0], lp[1], 10 + 40 * EO(12.6, 13.4), 0, 7); ctx.stroke(); ctx.restore(); }
        ctx.font = '600 18px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText('training rounds →', gx1 - 168, gy0 + 32);
        ctx.fillText('61%', gx0 - 6, pts[0][1] + 26);
      }
    }
    // ---------- connectors that draw on ----------
    if (t > 4.4) glowLine(ctx, [BX + BW - 10, BY + 230], [1720, 140], [CX + 30, CY + 150], E(4.4, 5.2), '#7a2bff', '#ff4fc1', 3, t < 7 ? 4 : 0, t);
    if (t > 4.9 && t < 7.0) chipPill(ctx, 1685, 175, 'into the model', { k: EO(4.9, 5.2) * (1 - ph(6.7, 7.0)), grad: ['#8a5bff', '#ff4fc1'], font: '700 19px "Inter"', h: 36 });
    if (t > 6.8) {
      const fade = 1 - ph(10.3, 10.7);
      ctx.save(); ctx.globalAlpha = Math.max(0.0, fade);
      glowLine(ctx, [CX + CW - 30, CY + 90], [2250, 70], [DX + 24, DY + 26], E(6.85, 7.2), '#7ad7ff', '#ffffff', 3);
      chipPill(ctx, 2250, 112, '1  Guess', { k: EO(6.95, 7.25), font: '800 22px "Inter"', h: 40, bg: 'rgba(255,255,255,0.22)' });
      if (t > 7.45) chipPill(ctx, DX + DW - 60, DY - 22, '2  Check', { k: EO(7.45, 7.75), font: '800 22px "Inter"', h: 40, bg: 'rgba(255,255,255,0.22)' });
      if (t > 8.0) {
        const q = glowLine(ctx, [DX + 120, DY + DH - 10], [2250, 590], [CX + CW - 60, CY + CH - 30], E(8.0, 8.6), '#ff7a1a', '#ff3b5c', 3.5);
        if (q && t < 8.8) { const p = q(E(8.0, 8.6)); ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = '#ff3b5c'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, 7); ctx.fill(); ctx.restore(); }
        chipPill(ctx, 2240, 562, '3  Adjust', { k: EO(8.5, 8.8), grad: ['#ff7a1a', '#ff3b5c'], glow: 'rgba(255,60,90,0.5)', font: '800 22px "Inter"', h: 40 });
        if (t < 9.4) chipPill(ctx, 2250, 510, 'error signal', { k: EO(8.1, 8.35) * (1 - ph(9.1, 9.4)), bg: 'rgba(255,59,92,0.38)', font: '700 21px "Inter"', h: 34 });
      }
      if (right) chipPill(ctx, DX + DW - 70, DY - 22, 'Guess again ✓', { k: EO(9.5, 9.8), grad: ['#1fbf8f', '#4dffa6'], glow: 'rgba(77,255,166,0.5)', font: '800 22px "Inter"', h: 40 });
      ctx.restore();
    }
    ctx.restore(); // world

    // ---------- glass over glass: hook card → header pill, takeaway (re-blur the frame) ----------
    SRC = blurOf(ctx.canvas, W, H_, 20);
    {
      const sh = E(1.5, 2.4), a = EO(0.1, 0.6);
      const w = H.lerp(760, 310, sh), h = H.lerp(190, 58, sh), x = H.lerp(640 - 380, 40, sh), y = H.lerp(250, 32, sh) + (1 - a) * 30;
      ctx.save(); ctx.globalAlpha = a; glass(ctx, SRC, x, y, w, h, H.lerp(36, 25, sh), { shadow: H.lerp(50, 20, sh), tint: 0.1 });
      const fs = H.lerp(60, 28, sh);
      ctx.font = `800 ${fs}px "Inter"`; ctx.textBaseline = 'middle';
      const tw = ctx.measureText('How does AI learn?').width;
      const hg = ctx.createLinearGradient(x, 0, x + w, 0); hg.addColorStop(0, '#ffffff'); hg.addColorStop(1, '#ffc6f0');
      ctx.fillStyle = hg; ctx.fillText('How does AI learn?', x + (w - tw) / 2, y + h / 2 + 2);
      if (sh < 0.5) { ctx.globalAlpha = a * (1 - sh * 2) * EO(0.5, 0.9); chipPill(ctx, 640, y - 24, 'NEW SERIES · AI BASICS', { font: '600 12px "Inter"', dot: '#b7f5ff' }); }
      ctx.restore();
    }
    if (t > 13.0) {
      const e = EO(13.0, 13.5);
      const w = 900, h = 100, x = 640 - w / 2, y = 572 + (1 - e) * 30;
      ctx.save(); ctx.globalAlpha = e; glass(ctx, SRC, x, y, w, h, 42, { shadow: 40, tint: 0.12 });
      ctx.font = '800 46px "Inter"'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      const hg = ctx.createLinearGradient(x, 0, x + w, 0); hg.addColorStop(0, '#ffffff'); hg.addColorStop(1, '#ffc6f0');
      ctx.fillStyle = hg; ctx.fillText('More examples → better guesses', 640, y + h / 2 + 2);
      ctx.restore();
    }
  }

  // ---------- sound: frosted-glass dashboard (soft glass taps, airy panel slides, gentle chimes, a calm pad) ----------
  function glassSound(k) {
    const D = 14.5;
    const ph = (t, a, b) => H.clamp((t - a) / (b - a));
    const inv = (u) => (u < 0.5 ? Math.cbrt(u / 4) : 1 - Math.cbrt((1 - u) * 2) / 2); // inverse of H.ease.inOut
    // camera keyframes copied from glassExplainer (KF): pan a sound to where its panel sits on screen
    const KF = [[0, 640, 360, 1], [1.7, 640, 360, 1], [2.8, 1300, 345, 1.35], [5.8, 1302, 345, 1.37], [6.8, 2238, 330, 1.3], [10.2, 2242, 330, 1.31], [11.1, 3060, 345, 1.35], [12.8, 3062, 345, 1.37], [13.8, 1800, 330, 0.37], [20, 1800, 330, 0.37]];
    const pan = (wx, t) => { let i = 0; while (i < KF.length - 2 && t > KF[i + 1][0]) i++; const A = KF[i], B = KF[i + 1], u = H.ease.inOut(H.clamp((t - A[0]) / (B[0] - A[0]))); return H.clamp(((wx - H.lerp(A[1], B[1], u)) * H.lerp(A[3], B[3], u)) / 640, -1, 1) * 0.6; };
    const busy = [];
    // glass tap: a light fingertip click on a glass pane (tiny click + a short, soft glassy ring, kept under ~2 kHz)
    const tap = (t, f, g, p = 0, minor = true) => { busy.push(t); k.play('click', t, { f: f * 1.3, gain: 0.45 * g, pan: p, minor }); k.tone(t, { f, dur: 0.16, gain: 0.07 * g, a: 0.002, pan: p, verb: 0.25, minor }); k.tone(t, { f: f * 1.5, dur: 0.08, gain: 0.025 * g, a: 0.002, pan: p, minor }); };
    // soft chime: rounded sine with an octave shimmer and room
    const chime = (t, n, g, p = 0, dur = 1.2, minor) => { const f = k.hz(n); busy.push(t); k.tone(t, { f, dur, gain: 0.1 * g, a: 0.004, pan: p, verb: 0.4, minor }); k.tone(t, { f: f * 2, dur: dur * 0.45, gain: 0.025 * g, a: 0.003, pan: p, verb: 0.4, minor }); };
    // a frosted panel glides up into place (EO over 0.6 s): an airy breath that settles with a tap
    const frost = (t0, p, g = 1) => { k.noise(t0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.35, 1500], [0.6, 1100]], q: 0.8, gain: 0.06 * g, a: 0.12, pan: p, verb: 0.2 }); tap(t0 + 0.28, 880, 0.7 * g, p); };
    // glowing connector draws on: a soft, rising shimmer that follows the eased line
    const glow = (t0, t1, f0, f1, g, p) => { const d = t1 - t0; k.noise(t0, { dur: d + 0.1, color: 'pink', filter: 'bandpass', f: [[0, f0], [d, f1]], q: 4, gain: 0.05 * g, a: d * 0.5, pan: p, verb: 0.3, minor: true }); k.tone(t0, { f: [[0, f0 / 2], [d, f1 / 2]], type: 'sine', dur: d + 0.1, gain: 0.025 * g, a: d * 0.5, pan: p, minor: true }); };
    const glide = (t0, t1, g = 1) => { const d = t1 - t0; k.noise(t0, { dur: d + 0.15, color: 'pink', filter: 'bandpass', f: [[0, 240], [d * 0.5, 560], [d, 260]], q: 0.7, gain: 0.04 * g, a: d * 0.5, verb: 0.15 }); };
    const counter = (a, b, val, f, g, p, minGap) => {
      let last = -1, lastV = val(a); const top = Math.abs(val(b) - val(a)) / (b - a) * 0.22;
      for (let t = a; t <= b + 1e-6; t += 1 / 120) {
        const v = val(t); if (v === lastV) continue; lastV = v;
        const speed = Math.abs(val(Math.min(b, t + 0.05)) - val(Math.max(a, t - 0.05)));
        const gap = H.clamp(minGap / Math.max(0.2, Math.min(1, speed / top)), minGap, 0.4);
        if (t - last >= gap && !busy.some((x) => t > x - 0.03 && t < x + 0.09)) { k.play('tick', t, { f, gain: g, pan: p, minor: true }); last = t; }
      }
    };

    k.bed('room', 0, D, { gain: 0.18 });
    k.music('pad', 0, D, { bpm: 92, gain: 0.34, chords: [['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['C4', 'E4', 'G4', 'B4'], ['G3', 'B3', 'D4', 'F#4'], ['F3', 'A3', 'C4', 'E4'], ['C4', 'E4', 'G4', 'C5']] });

    // ---- hook: the glass title card fades up (EO 0.1-0.6), its series pill (0.5-0.9), then slides to the header
    k.noise(0.05, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 600], [0.5, 1400]], q: 0.8, gain: 0.05, a: 0.3, verb: 0.3 });
    chime(0.18, 'E5', 1, 0, 1.6); chime(0.18, 'A4', 0.7, 0, 1.6);
    tap(0.6, 1100, 0.5, 0);
    k.noise(1.5, { dur: 0.9, color: 'pink', filter: 'lowpass', f: [[0, 800], [0.9, 350]], gain: 0.045, a: 0.35, minor: true }); // card glides to the corner
    glide(1.7, 2.8);

    // ---- beat 2: TRAINING DATA panel, tiles fade in, counter + progress bar
    frost(2.2, pan(1300, 2.4));
    for (let i = 0; i < 15; i += 2) tap(2.5 + i * 0.05 + 0.04, 980 + (i % 4) * 70, 0.35, pan(1010 + (i % 4) * 146, 2.6)); // tiles appear in a ripple
    counter(2.95, 5.66, (t) => Math.floor(1e6 * Math.pow(H.ease.out(ph(t, 2.9, 5.7)), 1.6)), 3000, 1.0, pan(1100, 4), 1 / 9);
    frost(4.2, pan(2010, 4.4)); // MODEL card
    glow(4.4, 5.2, 600, 1500, 1, pan(1720, 4.8)); // data -> model connector
    tap(4.95, 1050, 0.8, pan(1715, 5.0), false); // "into the model"
    chime(5.7, 'E5', 0.8, pan(1100, 5.7)); tap(5.7, 1300, 0.6, pan(1100, 5.7)); // 1,000,000 + progress bar full

    // ---- beat 3: guess, check, adjust
    glide(5.8, 6.8);
    frost(6.5, pan(2480, 6.7)); // OUTPUT card
    k.tone(6.8, { f: [[0, 330], [0.4, 660]], type: 'sine', dur: 0.42, gain: 0.04, a: 0.15, pan: pan(2010, 6.9), minor: true }); // network lights up
    glow(6.85, 7.2, 900, 1700, 0.8, pan(2250, 7.0)); // Guess line
    tap(6.92, 820, 0.4, pan(2560, 6.92)); // typing dots
    tap(7.0, 1200, 0.8, pan(2250, 7.0)); // "1 Guess"
    chime(7.06, 'G4', 0.7, pan(2550, 7.1), 0.35); // "dog?" message lands (short, so the typing reads)
    for (let i = 0; i < 6; i++) k.play('key', 7.14 + i * 0.065, { gain: 0.4, pan: pan(2400, 7.3), minor: true }); // "Prediction 1 of many" types out (7.1-7.5)
    k.play('error', 7.4, { f: 'A3', gain: 0.7, pan: pan(2600, 7.4) });
    k.tone(7.4, { f: [[0, 160], [0.2, 90]], dur: 0.3, gain: 0.18, pan: pan(2600, 7.4) }); // panel judders
    tap(7.63, 900, 0.9, pan(2400, 7.65)); // Answer: cat
    // ADJUST: the red error line draws back (E 8.0-8.6) with a hot dot riding it; weights re-balance (8.6-9.3)
    glow(8.0, 8.6, 1400, 600, 1.2, pan(2250, 8.3));
    k.tone(8.0, { f: [[0, 520], [0.6, 260]], type: 'triangle', dur: 0.62, gain: 0.045, a: 0.3, pan: pan(2250, 8.3) });
    tap(8.12, 760, 0.6, pan(2250, 8.2)); // "error signal"
    tap(8.52, 900, 0.8, pan(2240, 8.6), false); // "3 Adjust"
    k.noise(8.6, { dur: 0.75, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.4, 1300], [0.75, 900]], q: 3, gain: 0.05, a: 0.3, pan: pan(2010, 9), verb: 0.3, minor: true }); // weights shimmer as they rebalance
    // CORRECT: green "cat" (9.4), check badge (9.45), typing, Guess again
    ['C5', 'E5', 'G5'].forEach((n, i) => chime(9.4 + i * 0.07, n, 0.75 - i * 0.12, pan(2600, 9.45), 0.6));
    for (let i = 0; i < 6; i++) k.play('key', 9.55 + i * 0.065, { gain: 0.5, pan: pan(2400, 9.7), minor: true });

    // ---- beat 4: ACCURACY panel, the line chart draws point by point
    glide(10.2, 11.1);
    frost(10.4, pan(3060, 10.6));
    ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'].forEach((n, i) => chime(10.9 + 1.7 * inv((i + 1) / 7), n, 0.45, pan(2820 + (i + 1) * 69, 11 + i * 0.2), 0.7, true)); // each point lands
    k.noise(10.9, { dur: 1.7, color: 'pink', filter: 'bandpass', f: [[0, 700], [1.7, 1600]], q: 5, gain: 0.025, a: 0.8, pan: pan(3060, 11.8), minor: true }); // the glowing line drawing
    counter(10.95, 12.56, (t) => Math.round(H.lerp(61, 97, H.ease.inOut(ph(t, 10.9, 12.6)))), 2600, 0.9, pan(2900, 12), 1 / 10);
    // 97% (the biggest hit): number glows green and swells, a ring pulses off the last point
    k.play('thud', 12.6, { f: 90, gain: 0.6 });
    k.noise(12.6, { dur: 1.0, color: 'pink', filter: 'lowpass', f: [[0, 2200], [0.9, 400]], gain: 0.16, verb: 0.4 });
    ['A4', 'C5', 'E5', 'A5'].forEach((n, i) => chime(12.6 + i * 0.03, n, 1.3 - i * 0.15, (i - 1.5) * 0.25, 1.8));
    glide(12.8, 13.8, 0.9);
    // takeaway glass bar (EO 13.0-13.5) settles and resolves
    frost(12.95, 0, 0.7);
    ['E5', 'A5'].forEach((n, i) => chime(13.35 + i * 0.09, n, 0.6 - i * 0.12, (i - 0.5) * 0.3, 1.4));
    k.tone(13.35, { f: 'A2', type: 'triangle', dur: 1.2, gain: 0.12, a: 0.02 });
  }

  registerStyle({
    id: 'glassmorphism',
    name: 'Glassmorphism UI',
    category: 'Dimensional',
    description: 'Frosted-glass UI: translucent panels that genuinely blur the vivid gradient blobs and orbs behind them, with 1px light borders, a diagonal specular sheen, fine frost grain and crisp Inter type.',
    motion: 'Color blobs bloom up under the glass, the frosted card rises in, then the chat plays out (user bubble pops, the AI reply types itself line by line) while stat chips float in glass-over-glass and their ring and sparkline draw on; blobs keep drifting so the frost shimmers.',
    duration: 5,
    fonts: ['800 60px "Inter"', '700 20px "Inter"', '600 18px "Inter"', '600 15px "Inter"', '400 15px "Inter"', '400 18px "Inter"', '800 22px "Inter"', '600 12px "Inter"'],
    frameT: 4.6,
    readsPixels: false,
    explainerDuration: 14.5,
    explainerNote: 'The camera glides and zooms across one big frosted dashboard (data feed → network card → output chat → accuracy chart → pull back) while the live colour blobs drift behind, so every panel re-frosts as it moves; connectors are glowing gradient lines with travelling light dots, labels are glass pills, numbers count in big Inter 800.',
    explainer: glassExplainer,
    explainerSound: glassSound,
    draw(ctx, W, H_, t) {
      // ---------- background: vivid blobs + a few crisp orbs (so the frost has something to blur) ----------
      const BG = H.layer(W, H_), b = BG.getContext('2d');
      const base = b.createLinearGradient(0, 0, W, H_);
      base.addColorStop(0, '#0c0a24'); base.addColorStop(1, '#170f3a');
      b.fillStyle = base; b.fillRect(0, 0, W, H_);
      const blob = (x, y, r, col, a = 1) => {
        const g = b.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, H.rgba(col, a)); g.addColorStop(0.5, H.rgba(col, a * 0.55)); g.addColorStop(1, H.rgba(col, 0));
        b.fillStyle = g; b.fillRect(x - r, y - r, r * 2, r * 2);
      };
      const d = (ph, a) => Math.sin(t * 0.5 + ph) * a;
      const ph = (a, b2) => H.clamp((t - a) / (b2 - a));
      const E = (a, b2) => H.ease.out(ph(a, b2));
      const typed = (str, a, b2) => str.slice(0, Math.round(str.length * ph(a, b2)));
      const bloom = (i) => 0.35 + 0.65 * H.ease.out(ph(i * 0.12, 0.9 + i * 0.12));
      blob(930 + d(0, 30), 230 + d(1, 20), 330 * bloom(0), '#ff2bd6', 0.95 * bloom(0));
      blob(1180 + d(2, 20), 600, 300 * bloom(1), '#ff7a1a', 0.95 * bloom(1));
      blob(620, 640 + d(3, 20), 320 * bloom(2), '#2b6bff', 0.9 * bloom(2));
      blob(260 + d(4, 30), 170, 330 * bloom(3), '#7a2bff', 0.85 * bloom(3));
      blob(120, 640, 250, '#00d1ff', 0.6);
      blob(760, 380, 200, '#ff4d6d', 0.5);
      // crisp orbs
      orb(b, 1090 + d(5, 10), 170, 118, '#ffd2f4', '#ff4fc1', '#6a1497');
      orb(b, 585, 575 + d(6, 8), 86, '#c7f2ff', '#3aa0ff', '#1a2a8a');
      orb(b, 1215, 520, 46, '#ffe3b8', '#ff8a2a', '#9a2f12');
      // ring
      b.save(); b.translate(780, 120); b.rotate(-0.4);
      const rg = b.createLinearGradient(-90, 0, 90, 0); rg.addColorStop(0, '#7af0ff'); rg.addColorStop(1, '#8a5bff');
      b.strokeStyle = rg; b.lineWidth = 22; b.beginPath(); b.ellipse(0, 0, 92, 40, 0, 0, 7); b.stroke(); b.restore();
      // faint grid
      b.strokeStyle = 'rgba(255,255,255,0.035)'; b.lineWidth = 1; b.beginPath();
      for (let x = 0; x <= W; x += 48) { b.moveTo(x + 0.5, 0); b.lineTo(x + 0.5, H_); }
      for (let y = 0; y <= H_; y += 48) { b.moveTo(0, y + 0.5); b.lineTo(W, y + 0.5); }
      b.stroke();
      ctx.drawImage(BG, 0, 0);
      let SRC = blurOf(BG, W, H_, 26);

      // ---------- left: headline ----------
      ctx.save(); ctx.globalAlpha = E(0.35, 0.7);
      glass(ctx, SRC, 80 - (1 - E(0.35, 0.8)) * 20, 196, 196, 34, 17, { shadow: 16, tint: 0.08 });
      ctx.fillStyle = '#b7f5ff'; ctx.beginPath(); ctx.arc(100, 213, 4 * (0.7 + 0.3 * Math.sin(t * 4)), 0, 7); ctx.fill();
      ctx.font = '600 12px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillText('NEW  ·  AI COPILOT 2.0', 114, 217.5);
      ctx.restore();
      // headline lines rise out of a mask, staggered
      const line = (str, y, a, fill, font) => {
        const e = E(a, a + 0.55); if (e <= 0) return;
        ctx.save(); ctx.beginPath(); ctx.rect(60, y - 62, 520, 76); ctx.clip();
        ctx.globalAlpha = e; ctx.font = font; ctx.fillStyle = fill; ctx.fillText(str, 76, y + (1 - e) * 64); ctx.restore();
      };
      line('Your AI', 300, 0.5, '#ffffff', '800 60px "Inter"');
      line('copilot,', 366, 0.62, '#ffffff', '800 60px "Inter"');
      const hg = ctx.createLinearGradient(76, 0, 400, 0); hg.addColorStop(0, '#ffffff'); hg.addColorStop(1, '#ffc6f0');
      line('always on.', 432, 0.74, hg, '800 60px "Inter"');
      ctx.save(); ctx.globalAlpha = E(1.05, 1.5); ctx.font = '400 18px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.68)';
      ctx.fillText('Answers, summaries and actions —', 78, 478 + (1 - E(1.05, 1.5)) * 10); ctx.fillText('right where you work.', 78, 504 + (1 - E(1.05, 1.5)) * 10);
      ctx.restore();

      // ---------- chat card (rises in, frosted) ----------
      const ce = E(0.55, 1.25);
      const cx = 650, cy = 96 + (1 - ce) * 50, cw = 470, ch = 520;
      ctx.save(); ctx.globalAlpha = ce;
      glass(ctx, SRC, cx, cy, cw, ch, 28, { tint: 0.09 });
      ctx.restore();
      // header
      ctx.save(); ctx.globalAlpha = E(1.0, 1.35);
      orb(ctx, cx + 44, cy + 46, 20, '#ffd6f5', '#ff4fc1', '#7a1fb0');
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.8; ctx.beginPath();
      const sx = cx + 44, sy = cy + 46; ctx.moveTo(sx, sy - 8); ctx.quadraticCurveTo(sx, sy, sx + 8, sy); ctx.quadraticCurveTo(sx, sy, sx, sy + 8); ctx.quadraticCurveTo(sx, sy, sx - 8, sy); ctx.quadraticCurveTo(sx, sy, sx, sy - 8); ctx.stroke();
      ctx.font = '600 15px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText('Nova', cx + 76, cy + 42);
      ctx.fillStyle = '#4dffa6'; ctx.beginPath(); ctx.arc(cx + 80, cy + 58, 3.5, 0, 7); ctx.fill();
      ctx.font = '400 12px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText('AI assistant · online', cx + 89, cy + 62);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(cx + cw - 54 + i * 8, cy + 46, 2, 0, 7); ctx.fill(); }
      ctx.restore();
      const dl = E(1.1, 1.6);
      if (dl > 0) { ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 24, cy + 88.5); ctx.lineTo(cx + 24 + (cw - 48) * dl, cy + 88.5); ctx.stroke(); }
      // user message pops from its tail corner
      {
        const bw = 262, bx = cx + cw - 24 - bw, by = cy + 112;
        const k = H.ease.back(ph(1.45, 1.85));
        if (k > 0) {
          ctx.save(); ctx.translate(bx + bw, by + 46); ctx.scale(k, k); ctx.translate(-(bx + bw), -(by + 46)); ctx.globalAlpha = Math.min(1, ph(1.45, 1.6));
          const ug = ctx.createLinearGradient(bx, by, bx + bw, by + 46);
          ug.addColorStop(0, '#8a5bff'); ug.addColorStop(1, '#ff4fc1');
          ctx.save(); ctx.shadowColor = 'rgba(255,60,200,0.35)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
          ctx.fillStyle = ug; ctx.beginPath(); ctx.roundRect(bx, by, bw, 46, [18, 18, 4, 18]); ctx.fill(); ctx.restore();
          ctx.font = '400 15px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText("Summarize today's sales call", bx + 18, by + 28);
          ctx.restore();
          ctx.save(); ctx.globalAlpha = E(1.8, 2.1); ctx.font = '400 11px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText('9:41', cx + cw - 52, by + 64); ctx.restore();
        }
      }
      // AI reply: bubble grows from its tail corner, then types line by line
      {
        const bx = cx + 24, by = cy + 192, bw = 340, bh = 156;
        const k = H.ease.back(ph(1.95, 2.35));
        if (k > 0) {
          ctx.save(); ctx.translate(bx, by + bh); ctx.scale(k, k); ctx.translate(-bx, -(by + bh)); ctx.globalAlpha = Math.min(1, ph(1.95, 2.1));
          ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, [18, 18, 18, 4]); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(bx + 0.5, by + 0.5, bw - 1, bh - 1, [18, 18, 18, 4]); ctx.stroke();
          ctx.restore();
          ctx.font = '400 15px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText(typed('Here are the 3 key takeaways:', 2.25, 2.65), bx + 18, by + 32);
          const items = [['Budget approved for Q3', '#4dffa6'], ['Pilot starts next Monday', '#7ad7ff'], ['Security review needed', '#ffb35c']];
          items.forEach(([txt, c], i) => {
            const a0 = 2.7 + i * 0.32;
            const e = E(a0, a0 + 0.25); if (e <= 0) return;
            const yy = by + 66 + i * 34;
            ctx.save(); ctx.globalAlpha = e;
            ctx.fillStyle = H.rgba(c, 0.18); ctx.beginPath(); ctx.roundRect(bx + 18, yy - 15, 22, 22, 7); ctx.fill();
            ctx.font = '600 12px "Inter"'; ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), bx + 29, yy); ctx.textAlign = 'left';
            ctx.restore();
            ctx.font = '400 14px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.fillText(typed(txt, a0 + 0.05, a0 + 0.3), bx + 52, yy);
          });
        }
      }
      // typing indicator: Nova is "thinking" before the reply, then again after it
      {
        const bx = cx + 24;
        const before = t > 1.7 && t < 1.98, after = t > 3.75;
        if (before || after) {
          const by = before ? cy + 192 : cy + 364;
          ctx.save(); ctx.globalAlpha = before ? 1 : E(3.75, 3.95);
          ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.beginPath(); ctx.roundRect(bx, by, 64, 30, 15); ctx.fill();
          for (let i = 0; i < 3; i++) {
            const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - i * 0.9));
            ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.arc(bx + 20 + i * 12, by + 15, 3.2, 0, 7); ctx.fill();
          }
          ctx.restore();
        }
      }
      // input field
      {
        const ix = cx + 20, iy = cy + ch - 74, iw = cw - 40, ih = 52;
        ctx.save(); ctx.globalAlpha = E(1.15, 1.5);
        ctx.fillStyle = 'rgba(10,6,40,0.22)'; ctx.beginPath(); ctx.roundRect(ix, iy, iw, ih, 26); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.roundRect(ix + 0.5, iy + 0.5, iw - 1, ih - 1, 26); ctx.stroke();
        ctx.font = '400 15px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillText('Ask Nova anything…', ix + 22, iy + 31);
        if (Math.sin(t * 6) > 0) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(ix + 21, iy + 17, 1.5, 19); }
        const g = ctx.createLinearGradient(ix + iw - 46, iy, ix + iw - 6, iy + ih);
        g.addColorStop(0, '#ff7a1a'); g.addColorStop(1, '#ff2bd6');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ix + iw - 26, iy + 26, 19, 0, 7); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(ix + iw - 26, iy + 34); ctx.lineTo(ix + iw - 26, iy + 18); ctx.moveTo(ix + iw - 33, iy + 25); ctx.lineTo(ix + iw - 26, iy + 18); ctx.lineTo(ix + iw - 19, iy + 25); ctx.stroke();
        ctx.restore();
      }

      // ---------- stat chips: glass over glass (re-blur the composited frame), floating in ----------
      SRC = blurOf(ctx.canvas, W, H_, 18);
      const chip = (a0, dx, dy, fn) => {
        const e = E(a0, a0 + 0.6); if (e <= 0) return;
        ctx.save(); ctx.globalAlpha = Math.min(1, ph(a0, a0 + 0.3)); fn((1 - e) * dx, (1 - e) * dy); ctx.restore();
      };
      // chip 1: speed
      chip(2.25, -40, 0, (ox, oy) => {
        const x = 570 + ox, y = 180 + d(1, 4) + oy, w = 168, h = 64;
        glass(ctx, SRC, x, y, w, h, 18, { shadow: 34, tint: 0.12 });
        const g = ctx.createLinearGradient(x + 14, y + 14, x + 50, y + 50); g.addColorStop(0, '#ffcf5c'); g.addColorStop(1, '#ff7a1a');
        ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x + 14, y + 14, 36, 36, 11); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x + 34, y + 20); ctx.lineTo(x + 24, y + 34); ctx.lineTo(x + 31, y + 34); ctx.lineTo(x + 28, y + 44); ctx.lineTo(x + 39, y + 29); ctx.lineTo(x + 32, y + 29); ctx.closePath(); ctx.fill();
        ctx.font = '800 22px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText((2.4 * E(2.3, 3.0)).toFixed(1) + '×', x + 62, y + 34);
        ctx.font = '400 12px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText('faster replies', x + 62, y + 51);
      });
      // chip 2: accuracy ring
      chip(2.55, 40, 0, (ox, oy) => {
        const x = 1018 + ox, y = 356 + d(2, 4) + oy, w = 196, h = 76;
        glass(ctx, SRC, x, y, w, h, 20, { shadow: 34, tint: 0.12 });
        const c = [x + 40, y + 38];
        const rp = H.ease.inOut(ph(2.7, 3.6));
        ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(c[0], c[1], 21, 0, 7); ctx.stroke();
        const g = ctx.createLinearGradient(c[0] - 20, c[1] - 20, c[0] + 20, c[1] + 20); g.addColorStop(0, '#4dffa6'); g.addColorStop(1, '#00d1ff');
        if (rp > 0) { ctx.strokeStyle = g; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(c[0], c[1], 21, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.986 * rp); ctx.stroke(); }
        ctx.font = '800 22px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText((98.6 * rp).toFixed(1) + '%', x + 76, y + 40);
        ctx.font = '400 12px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText('answer accuracy', x + 76, y + 58);
      });
      // chip 3: sparkline
      chip(2.85, 0, 40, (ox, oy) => {
        const x = 556 + ox, y = 586 + d(3, 4) + oy, w = 190, h = 92;
        glass(ctx, SRC, x, y, w, h, 20, { shadow: 34, tint: 0.12 });
        ctx.font = '400 12px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText('Tokens / sec', x + 16, y + 26);
        ctx.font = '800 22px "Inter"'; ctx.fillStyle = '#fff'; ctx.fillText('12.8k', x + 16, y + 52);
        ctx.font = '600 12px "Inter"'; ctx.fillStyle = '#4dffa6'; ctx.fillText('▲ 18%', x + 82, y + 51);
        const pts = []; const sr = H.rng(4);
        for (let i = 0; i <= 12; i++) pts.push([x + 16 + i * 13.2, y + 80 - (i * 1.4 + sr() * 8 + Math.sin(i * 0.8 + t) * 2)]);
        const sp = H.ease.inOut(ph(3.0, 3.7)), n = Math.max(1, Math.round(12 * sp));
        const vis = pts.slice(0, n + 1);
        if (sp > 0) {
          const ag = ctx.createLinearGradient(0, y + 50, 0, y + 86); ag.addColorStop(0, 'rgba(77,255,166,0.35)'); ag.addColorStop(1, 'rgba(77,255,166,0)');
          ctx.fillStyle = ag; ctx.beginPath(); ctx.moveTo(vis[0][0], y + 86); vis.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(vis[vis.length - 1][0], y + 86); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#4dffa6'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.beginPath(); vis.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
          const lp = vis[vis.length - 1]; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lp[0], lp[1], 3.5, 0, 7); ctx.fill();
        }
      });
    },
  });
}
```
