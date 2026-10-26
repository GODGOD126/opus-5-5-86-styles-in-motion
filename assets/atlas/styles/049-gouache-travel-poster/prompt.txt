I want an animated explainer made in the "Gouache Travel Poster" visual style (Painterly). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Bebas Neue, Oswald
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;700&display=block">
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
Name: Gouache Travel Poster
Family: Painterly
Look: Mid-century travel poster hand-painted in gouache: six flat, opaque, matte colours stacked in receding layers, dry-brush streaks where the paint thins at each edge, and a bold hand-lettered block.
Motion: Layers slide in parallax like stacked paper cut-outs, the sun rises behind the ridges, steam puffs bob from the cooling towers and server windows blink on in rows.
How it explains: A run of hand-painted posters: each scene change is a fresh coat of cream swept across the board before the next poster is painted flat colour by flat colour; arrows are flat poster arrow shapes, numbers are repainted in the lettering band, and an orange starburst stamps the key moments.

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

REFERENCE STYLE SOURCE (styles/gouache-poster.js; W/H_ are always 1280x720)
```js
{
  // ---------------------------------------------------------------
  // Gouache travel poster — flat opaque matte shapes, dry-brush edges
  // ---------------------------------------------------------------
  const PAL = {
    navy: [30, 52, 66], teal: [47, 127, 131], orange: [224, 97, 43],
    mustard: [242, 180, 64], cream: [243, 231, 204], rose: [234, 165, 138],
  };
  const tint = (c, k) => H.mix(c, PAL.cream, k);

  // anisotropic value noise field (0..1): long cells along the brush direction, short across it
  function field(W, H_, cx, cy, seed) {
    const r = H.rng(seed);
    const gw = Math.ceil(W / cx) + 2, gh = Math.ceil(H_ / cy) + 2, g = new Float32Array(gw * gh);
    for (let i = 0; i < g.length; i++) g[i] = r();
    const out = new Float32Array(W * H_);
    for (let y = 0; y < H_; y++) {
      const fy = y / cy, iy = fy | 0, ty = fy - iy, sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < W; x++) {
        const fx = x / cx, ix = fx | 0, tx = fx - ix, sx = tx * tx * (3 - 2 * tx);
        const a = g[iy * gw + ix], b = g[iy * gw + ix + 1], c = g[(iy + 1) * gw + ix], d = g[(iy + 1) * gw + ix + 1];
        out[y * W + x] = a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
      }
    }
    return out;
  }


  // =================================================================
  // EXPLAINER — "How does AI learn?" as a run of hand-painted posters. Scene changes are a fresh coat of
  // cream gouache swept across the board, then the next poster is painted over it, flat colour by flat colour.
  // =================================================================
  let GXC = null;
  function gpCache(W, H_) {
    if (GXC && GXC.W === W && GXC.H === H_) return GXC;
    GXC = { W, H: H_, hS: field(W, H_, 46, 2.2, 11), hS2: field(W, H_, 120, 6, 12), vS: field(W, H_, 2.4, 40, 13), grain: null, SP: {}, BG: {} };
    // static matte board grain (added to every frame)
    const g = new Float32Array(W * H_), pr = H.rng(4), nz = H.makeNoise(5);
    for (let i = 0; i < W * H_; i++) { const x = i % W, y = (i / W) | 0; g[i] = (pr() - 0.5) * 9 + (GXC.hS2[i] - 0.5) * 4 + nz.n2(x * 0.5, y * 0.5) * 3; }
    GXC.grain = g;
    // texture is split from edges: a mostly isotropic field raggeds the edges, broad brush bands (not 2px streaks)
    // carry the body tone, and a slow lumpy field gives the chalky bloom of dried matte gouache
    GXC.eF = field(W, H_, 7, 5, 14);
    GXC.bH = field(W, H_, 90, 9, 15); GXC.bV = field(W, H_, 9, 90, 16);
    const ch = field(W, H_, 26, 22, 17), cm = new Float32Array(W * H_);
    for (let i = 0; i < cm.length; i++) { const u = H.clamp((ch[i] - 0.6) / 0.25); cm[i] = 1 + 0.03 * u * u * (3 - 2 * u); }
    GXC.chalk = cm;
    GXC.S = H.layer(W, H_); GXC.B = H.layer(W, H_);
    GXC.S.getContext('2d', { willReadFrequently: true }); GXC.B.getContext('2d', { willReadFrequently: true }); // CPU-backed: cheap readback
    return GXC;
  }

  // paint(): one opaque colour, one pass of the brush. Mask -> blurred mask -> ragged coverage, then a matte body
  // with broad stroke bands, a slightly darker dried ridge just inside the edge and chalky bloom.
  // dir: 'h' / 'v' brushing, 'd' diagonal (sheared) brushing for slopes. key: cache a finished (p = 1) static pass.
  function makePainter(buf, W, H_, Cx, defEdge, defRag) {
    const { hS, hS2, vS, eF, bH, bV, chalk, SP } = Cx, sx = Cx.S.getContext('2d'), bx = Cx.B.getContext('2d');
    return function paint(col, bb, drawFn, { edge = defEdge, rag = defRag, dir = 'h', tex = 0.07, p = 1, key = null } = {}) {
      if (p <= 0) return;
      if (key && p >= 1 && SP[key]) {
        const { idx, cv, cov } = SP[key];
        for (let j = 0, n = idx.length; j < n; j++) { const o = idx[j] * 4, c = cov[j], q = j * 3; buf[o] += (cv[q] - buf[o]) * c; buf[o + 1] += (cv[q + 1] - buf[o + 1]) * c; buf[o + 2] += (cv[q + 2] - buf[o + 2]) * c; }
        return;
      }
      const rec = key && p >= 1 ? { idx: [], cv: [], cov: [] } : null;
      let [x0, y0, x1, y1] = bb;
      x0 = Math.max(0, Math.floor(x0 - edge * 2)); y0 = Math.max(0, Math.floor(y0 - edge * 2));
      x1 = Math.min(W, Math.ceil(x1 + edge * 2)); y1 = Math.min(H_, Math.ceil(y1 + edge * 2));
      const w = x1 - x0, h = y1 - y0; if (w <= 0 || h <= 0) return;
      sx.clearRect(x0, y0, w, h); sx.save(); sx.fillStyle = '#fff'; sx.strokeStyle = '#fff'; drawFn(sx); sx.restore();
      bx.clearRect(x0, y0, w, h); bx.filter = `blur(${edge}px)`; bx.drawImage(Cx.S, x0, y0, w, h, x0, y0, w, h); bx.filter = 'none';
      const A = bx.getImageData(x0, y0, w, h).data, F = dir === 'v' ? vS : hS, BD = dir === 'v' ? bV : bH, diag = dir === 'd';
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const k = (y * w + x) * 4, b = A[k + 3] / 255;
        if (b < 0.02) continue;
        const gi = (y + y0) * W + (x + x0);
        const si = diag ? ((y + y0 + (((x + x0) * 0.42) | 0)) % H_) * W + (x + x0) : gi; // sheared lookup = diagonal strokes
        const n = F[si];
        const thr = Math.min(0.88, 0.5 + ((eF[gi] - 0.5) * 0.65 + (n - 0.5) * 0.35) * rag * 0.7);
        let cov = (b - thr) / 0.08 + 0.5; cov = cov < 0 ? 0 : cov > 1 ? 1 : cov;
        if (cov <= 0) continue;
        if (p < 1) {
          // the brush is mid-sweep: left->right for horizontal brushing, bottom->top for vertical; ragged dry front
          const sw = dir === 'v' ? 1 - y / h : x / w, front = p * 1.15 - sw + (n - 0.5) * 0.1;
          if (front <= 0) continue;
          cov *= Math.min(1, front / 0.035);
        }
        let v = 1 + (hS2[gi] - 0.5) * tex * 0.65 + (BD[si] - 0.5) * tex * 0.5 + (n - 0.5) * tex * 0.25;
        const rim = b - thr; if (rim < 0.3) v *= 1 - 0.06 * (1 - rim / 0.3); // paint piles up a touch at the edge
        v *= chalk[gi];
        const o = gi * 4, r0 = col[0] * v, g0 = col[1] * v, b0 = col[2] * v;
        buf[o] += (r0 - buf[o]) * cov; buf[o + 1] += (g0 - buf[o + 1]) * cov; buf[o + 2] += (b0 - buf[o + 2]) * cov;
        if (rec) { rec.idx.push(gi); rec.cv.push(r0, g0, b0); rec.cov.push(cov); }
      }
      if (rec) SP[key] = { idx: Int32Array.from(rec.idx), cv: Float32Array.from(rec.cv), cov: Float32Array.from(rec.cov) };
    };
  }

  function explainGouache(ctx, W, H_, t) {
    const { navy, teal, orange, mustard, cream, rose } = PAL;
    const Cx = gpCache(W, H_), { grain } = Cx;
    const buf = new Uint8ClampedArray(W * H_ * 4);
    for (let i = 0; i < buf.length; i += 4) { buf[i] = cream[0]; buf[i + 1] = cream[1]; buf[i + 2] = cream[2]; buf[i + 3] = 255; }
    const paint = makePainter(buf, W, H_, Cx, 2.5, 0.8);
    const G = (a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
    const poly = (c, pts) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); };
    const txt = (c, s, x, y, size, align = 'left', font = 'Bebas Neue', sp = 3) => { c.font = `400 ${size}px "${font}"`; c.textAlign = align; c.textBaseline = 'alphabetic'; if (c.letterSpacing !== undefined) c.letterSpacing = sp + 'px'; c.fillText(s, x, y); };
    const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // flat poster animals
    const head = (c, x, y, s, dog) => {
      if (dog) { c.beginPath(); c.ellipse(x, y, s * 0.36, s * 0.34, 0, 0, 7); c.fill(); }
      else poly(c, [[x - s * 0.4, y - s * 0.05], [x - s * 0.38, y - s * 0.46], [x - s * 0.14, y - s * 0.26], [x + s * 0.14, y - s * 0.26], [x + s * 0.38, y - s * 0.46], [x + s * 0.4, y - s * 0.05], [x + s * 0.3, y + s * 0.26], [x, y + s * 0.36], [x - s * 0.3, y + s * 0.26]]);
    };
    const ears = (c, x, y, s) => { for (const k of [-1, 1]) { c.beginPath(); c.ellipse(x + k * s * 0.36, y + s * 0.02, s * 0.11, s * 0.24, k * 0.3, 0, 7); c.fill(); } };
    const eyes = (c, x, y, s) => { c.beginPath(); c.arc(x - s * 0.13, y - s * 0.02, s * 0.05, 0, 7); c.arc(x + s * 0.13, y - s * 0.02, s * 0.05, 0, 7); c.fill(); poly(c, [[x - s * 0.06, y + s * 0.12], [x + s * 0.06, y + s * 0.12], [x, y + s * 0.19]]); };
    // a whole labelled card, painted colour by colour (each colour is one brush pass)
    // key: cache each finished pass (only for a card set that no longer moves)
    function cards(list, bb, p = 1, key = null) {
      const K = (i) => (key ? key + i : null);
      paint(cream, bb, (c) => list.forEach(({ x, y, s }) => c.fillRect(x - s / 2, y - s / 2, s, s)), { edge: 1.4, rag: 0.5, p, key: K(1) });
      paint(orange, bb, (c) => list.forEach(({ x, y, s, dog }) => { if (!dog) head(c, x, y + s * 0.04, s * 0.8, false); }), { edge: 1, rag: 0.4, p, key: K(2) });
      paint(H.mix(rose, navy, 0.25), bb, (c) => list.forEach(({ x, y, s, dog }) => { if (dog) head(c, x, y, s * 0.8, true); }), { edge: 1, rag: 0.4, p, key: K(3) });
      paint(H.mix(orange, navy, 0.55), bb, (c) => list.forEach(({ x, y, s, dog }) => { if (dog) ears(c, x, y, s * 0.8); }), { edge: 1, rag: 0.4, p, key: K(4) });
      paint(navy, bb, (c) => list.forEach(({ x, y, s, dog, tag }) => { eyes(c, x, y + s * 0.02, s * 0.8); if (tag !== false && s > 80) c.fillRect(x - s * 0.36, y + s * 0.5, s * 0.72, s * 0.3); }), { edge: 0.8, rag: 0.3, p, key: K(5) });
      paint(cream, bb, (c) => list.forEach(({ x, y, s, dog, tag }) => { if (tag !== false && s > 80) txt(c, dog ? 'DOG' : 'CAT', x, y + s * 0.74, Math.max(24, Math.round(s * 0.27)), 'center', 'Bebas Neue', 2); }), { edge: 0.6, rag: 0.2, p, key: K(6) });
    }
    // the learning machine (retro factory), with three gauges = its weights
    function machine(x, y, s, p0, gauges, key = null, gStatic = false) {
      const K = (i) => (key ? key + i : null);
      const P = (a) => G(p0 + a, p0 + a + 0.35);
      const bb = [x - 20, y - 260 * s, x + 330 * s, y + 10];
      paint(teal, bb, (c) => { c.fillRect(x, y - 200 * s, 300 * s, 200 * s); poly(c, [[x - 10, y - 200 * s], [x + 150 * s, y - 250 * s], [x + 310 * s, y - 200 * s]]); }, { dir: 'v', p: P(0), key: K('a') });
      paint(H.mix(teal, navy, 0.5), bb, (c) => { c.fillRect(x + 220 * s, y - 200 * s, 80 * s, 200 * s); c.fillRect(x + 236 * s, y - 300 * s, 34 * s, 80 * s); }, { dir: 'v', p: P(0.15), key: K('b') });
      paint(cream, bb, (c) => { for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x + (50 + k * 64) * s, y - 120 * s, 26 * s, 0, 7); c.fill(); } c.fillRect(x + 6 * s, y - 72 * s, 208 * s, 36 * s); }, { edge: 1.2, rag: 0.4, p: P(0.3), key: K('c') });
      paint(navy, bb, (c) => {
        for (let k = 0; k < 3; k++) { const a = gauges[k], gx = x + (50 + k * 64) * s, gy = y - 120 * s; c.save(); c.translate(gx, gy); c.rotate(a); c.fillRect(-2.5 * s, -22 * s, 5 * s, 24 * s); c.restore(); c.beginPath(); c.arc(gx, gy, 4 * s, 0, 7); c.fill(); }
        txt(c, 'LEARNING MACHINE', x + 110 * s, y - 45 * s, Math.max(24, Math.round(22 * s)), 'center', 'Oswald', 1);
      }, { edge: 0.8, rag: 0.3, p: P(0.45), key: gStatic ? K('d' + gauges.map((a) => a.toFixed(3)).join()) : null });
      paint(orange, bb, (c) => { c.fillRect(x + 236 * s, y - 306 * s, 34 * s, 14 * s); }, { edge: 0.8, rag: 0.3, p: P(0.5), key: K('e') });
    }
    const navyBand = () => paint(navy, [0, 560, W, H_], (c) => c.fillRect(0, 572, W, H_ - 572), { p: G(0.2, 0.7), key: 'band' });
    const bandText = (s, a, size = 96, key = null) => paint(cream, [30, 570, W - 30, 715], (c) => txt(c, s, 52, 680, size), { edge: 1.2, rag: 0.6, p: G(a, a + 0.45), key });

    const scene = t < 6.35 ? 1 : t < 10.85 ? 2 : 3;
    // ======== scene backgrounds (sky + ground), re-painted for each new poster ========
    const bgStart = scene === 1 ? 0 : scene === 2 ? 6.35 : 10.85;
    const skyCol = scene === 1 ? tint(teal, 0.55) : scene === 2 ? tint(rose, 0.35) : tint(mustard, 0.55);
    // once every background pass of the current poster is finished, the painted board is the same on every frame:
    // it is kept as a snapshot instead of being repainted
    const bgP = [G(bgStart, bgStart + 0.45), G(bgStart + 0.1, bgStart + 0.5), G(bgStart + 0.15, bgStart + 0.55), G(bgStart + 0.2, bgStart + 0.6), G(0.2, 0.7)];
    const bgKey = 's' + scene, bgDone = bgP.every((v) => v >= 1);
    if (bgDone && Cx.BG[bgKey]) buf.set(Cx.BG[bgKey]);
    else {
      paint(skyCol, [0, 0, W, scene === 3 ? 572 : 470], (c) => c.fillRect(0, 0, W, scene === 3 ? 566 : 470), { edge: 4, p: bgP[0] });
      // tonal depth like the still's sky bands and receding ranges (two extra values per poster)
      const ridge = (c, y, amp, ph) => { c.beginPath(); c.moveTo(0, 480); for (let x = 0; x <= W; x += 40) c.lineTo(x, y + Math.sin(x * 0.006 + ph) * amp + Math.sin(x * 0.017 + ph * 2) * amp * 0.35); c.lineTo(W, 480); c.closePath(); c.fill(); };
      if (scene === 1) {
        paint(tint(teal, 0.68), [0, 250, W, 470], (c) => c.fillRect(0, 262, W, 208), { edge: 4, rag: 1, p: bgP[1] });
        paint(tint(teal, 0.42), [0, 330, W, 480], (c) => ridge(c, 392, 26, 0.4), { edge: 3, rag: 1, dir: 'd', p: bgP[2] });
      } else if (scene === 2) {
        paint(tint(rose, 0.58), [0, 250, W, 470], (c) => c.fillRect(0, 268, W, 202), { edge: 4, rag: 1, p: bgP[1] });
        paint(tint(teal, 0.48), [0, 360, W, 480], (c) => ridge(c, 424, 18, 2.1), { edge: 3, rag: 1, dir: 'd', p: bgP[2] });
      } else {
        paint(tint(mustard, 0.36), [0, 0, W, 170], (c) => c.fillRect(0, 0, W, 150), { edge: 4, rag: 1, p: bgP[1] });
        paint(tint(mustard, 0.74), [0, 380, W, 572], (c) => c.fillRect(0, 398, W, 168), { edge: 4, rag: 1, p: bgP[2] });
      }
      if (scene !== 3) paint(scene === 1 ? H.mix(teal, navy, 0.25) : tint(teal, 0.25), [0, 420, W, 572], (c) => { c.beginPath(); c.moveTo(0, 470); c.bezierCurveTo(400, 440, 900, 480, 1280, 450); c.lineTo(1280, 572); c.lineTo(0, 572); c.fill(); }, { edge: 3, p: bgP[3] });
      navyBand();
      if (bgDone) Cx.BG[bgKey] = buf.slice();
    }

    if (scene === 1) {
      // ---- the machine and its conveyor of labelled examples ----
      machine(900, 470, 1.05, 0.9, [-0.9, 0.2, 1.0], 'm1', true);
      paint(mustard, [0, 440, 900, 500], (c) => { c.fillRect(0, 448, 900, 22); }, { p: G(1.6, 2.1), key: 'belt' });
      paint(navy, [0, 440, 900, 520], (c) => { const off = (t * 60) % 40; for (let x = -40 + off; x < 900; x += 40) c.fillRect(x, 452, 16, 14); for (let x = 30; x < 900; x += 110) { c.beginPath(); c.arc(x, 482, 12, 0, 7); c.fill(); } }, { edge: 1, rag: 0.4, p: G(1.9, 2.3) });
      // hopper on the machine's side
      paint(orange, [790, 330, 910, 470], (c) => poly(c, [[800, 360], [898, 360], [884, 450], [856, 450]]), { dir: 'v', p: G(2.0, 2.3), key: 'hopper' });
      const list = [];
      for (let i = 0; i < 20; i++) { const s0 = 2.4 + i * 0.18, u = (t - s0) / 1.4; if (u <= 0 || u >= 1) continue; const x = -60 + u * 940, lift = x > 800 ? (x - 800) * 0.9 : 0; list.push({ x: Math.min(x, 860), y: 390 - lift, s: x > 800 ? 96 * (1 - (x - 800) / 140) : 96, dog: (i % 2 === 1) !== (i % 5 === 0) }); }
      if (list.length) cards(list, [-120, 260, 960, 470]);
      // counter in the band
      if (t > 2.6) { const n = t > 5.6 ? 1e6 : Math.round(1e6 * H.ease.in(H.clamp((t - 2.7) / 2.9)) / 1000) * 1000; bandText(fmt(n) + ' EXAMPLES', 2.6, 96, n >= 1e6 ? 'bt1' : null); }
      // a flat poster arrow pointing into the hopper with its label
      paint(cream, [380, 200, 860, 330], (c) => { c.fillRect(420, 250, 330, 34); poly(c, [[750, 228], [810, 267], [750, 306]]); }, { p: G(2.6, 3.0), key: 'arr1' });
      paint(navy, [380, 200, 860, 330], (c) => txt(c, 'LABELLED EXAMPLES', 432, 279, 30, 'left', 'Oswald', 2), { edge: 0.7, rag: 0.3, p: G(2.9, 3.2), key: 'arr1t' });
      if (t > 5.6) paint(orange, [30, 570, 900, 700], (c) => c.fillRect(52, 690, 700, 6), { p: G(5.6, 5.9), key: 'ul1' });
    }
    if (scene === 2) {
      const ga = [-0.9, 0.2, 1.0].map((a, k) => a + G(8.6, 9.2) * [0.9, -0.8, -1.3][k]);
      machine(120, 500, 1.15, 6.6, ga, 'm2', t < 8.6 || t > 9.2);
      // the new picture drops in at the top of the board
      cards([{ x: 270, y: 120 + (1 - G(6.9, 7.2)) * -140, s: 110, dog: false, tag: false }], [190, 20, 360, 200], 1, t >= 7.2 ? 'np' : null);
      paint(navy, [340, 80, 700, 170], (c) => txt(c, 'NEW PICTURE', 350, 132, 34, 'left', 'Oswald', 2), { edge: 0.7, rag: 0.3, p: G(7.0, 7.3), key: 'npt' });
      paint(mustard, [250, 170, 300, 215], (c) => poly(c, [[262, 178], [278, 178], [278, 196], [288, 196], [270, 214], [252, 196], [262, 196]]), { dir: 'v', p: G(7.15, 7.35), key: 'npa' });
      // GUESS: output ticket
      const second = t > 9.4;
      paint(mustard, [470, 300, 820, 380], (c) => { c.fillRect(480, 318, 240, 40); poly(c, [[720, 300], [790, 338], [720, 376]]); }, { p: G(7.1, 7.4), key: 'gt' });
      paint(navy, [470, 300, 820, 380], (c) => txt(c, 'GUESS', 500, 350, 34, 'left', 'Oswald', 2), { edge: 0.7, rag: 0.3, p: G(7.2, 7.5), key: 'gtt' });
      paint(cream, [800, 240, 1180, 440], (c) => c.fillRect(820, 260, 320, 160), { edge: 2, p: G(7.3, 7.6), key: 'card2' });
      paint(second ? teal : H.mix(rose, navy, 0.62), [800, 240, 1180, 440], (c) => txt(c, second ? 'CAT' : 'DOG?', 980, 380, 120, 'center'), { edge: 1, rag: 0.5, p: second ? G(9.4, 9.7) : G(7.4, 7.7), key: second ? 'ansC' : 'ansD' });
      // CHECK: wrong! an orange starburst stamp and a big cross
      if (t > 7.9 && !second) {
        const k = G(7.9, 8.05);
        paint(orange, [760, 180, 1220, 500], (c) => { c.beginPath(); for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r = (i % 2 ? 150 : 210) * (0.6 + 0.4 * k); c.lineTo(980 + Math.cos(a) * r * 1.15, 340 + Math.sin(a) * r * 0.8); } c.closePath(); c.fill(); }, { edge: 1.5, rag: 0.5, p: k, key: k >= 1 ? 'burst2' : null });
        paint(cream, [800, 240, 1180, 440], (c) => c.fillRect(820, 260, 320, 160), { edge: 2, key: 'card2' });
        paint(H.mix(rose, navy, 0.62), [800, 240, 1180, 440], (c) => txt(c, 'DOG?', 980, 380, 120, 'center'), { edge: 1, rag: 0.5, key: 'ansD' });
        paint(navy, [800, 240, 1180, 440], (c) => { c.save(); c.translate(980, 340); for (const a of [0.7, -0.7]) { c.save(); c.rotate(a); c.fillRect(-120, -11, 240, 22); c.restore(); } c.restore(); }, { edge: 1, rag: 0.4, p: G(8.0, 8.2), key: 'x2' });
        paint(cream, [800, 150, 1170, 240], (c) => c.fillRect(812, 172, 336, 56), { edge: 1.5, p: G(8.05, 8.25), key: 'cks' });
        paint(navy, [800, 150, 1170, 240], (c) => txt(c, "CHECK: IT'S A CAT", 980, 216, 46, 'center', 'Bebas Neue', 3), { edge: 0.8, rag: 0.3, p: G(8.15, 8.45), key: 'ckt' });
      }
      // ADJUST: a flat arrow loops back under the ticket into the machine
      paint(rose, [380, 420, 1180, 560], (c) => { c.beginPath(); c.moveTo(1000, 430); c.lineTo(1000, 520); c.lineTo(480, 520); c.lineTo(480, 470); c.lineTo(450, 470); c.lineTo(500, 425); c.lineTo(550, 470); c.lineTo(520, 470); c.lineTo(520, 490); c.lineTo(960, 490); c.lineTo(960, 430); c.closePath(); c.fill(); }, { dir: 'h', p: G(8.3, 8.7), key: 'adj' });
      paint(navy, [560, 480, 960, 540], (c) => txt(c, 'ADJUST', 640, 514, 30, 'left', 'Oswald', 2), { edge: 0.7, rag: 0.3, p: G(8.6, 8.8), key: 'adjt' });
      if (second) paint(teal, [1120, 240, 1260, 420], (c) => { c.lineWidth = 22; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(1150, 330); c.lineTo(1180, 370); c.lineTo(1240, 270); c.stroke(); }, { edge: 1, rag: 0.4, p: G(9.7, 9.95), key: 'tick' });
      bandText('GUESS · CHECK · ADJUST', 6.8, 96, 'bt2');
    }
    if (scene === 3) {
      // a flat bar chart climbing over training rounds
      const N = 10, x0 = 110, base = 510, bw = 64, gap = 22; // chart sits 10px higher so the axis label clears the band
      paint(navy, [100, 120, 1200, 530], (c) => { c.fillRect(110, 514, 1020, 8); }, { p: G(11.0, 11.3), key: 'axis' });
      const pr = H.clamp((t - 11.2) / 1.6);
      for (let i = 0; i < N; i++) {
        const acc = 61 + 36 * (1 - Math.exp(-i / 2.6)) / (1 - Math.exp(-(N - 1) / 2.6)), h = (acc - 45) * 6;
        const a = 11.2 + i * 0.15;
        paint(i === N - 1 ? orange : H.mix(teal, cream, 0.15 * (N - i) / N), [x0 + i * (bw + gap) - 6, base - h - 6, x0 + i * (bw + gap) + bw + 6, base + 6], (c) => c.fillRect(x0 + i * (bw + gap), base - h, bw, h), { dir: 'v', p: G(a, a + 0.3), key: 'bar' + i });
      }
      paint(navy, [100, 524, 1200, 572], (c) => txt(c, 'TRAINING ROUNDS →', 140, 553, 30, 'left', 'Oswald', 2), { edge: 0.7, rag: 0.3, p: G(11.2, 11.5), key: 'tr' });
      const acc = Math.round(t < 11.2 ? 61 : t > 12.8 ? 97 : 61 + 36 * H.ease.out(pr));
      if (t > 12.8) { const k = G(12.8, 12.95); paint(orange, [960, 40, 1260, 300], (c) => { c.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = (i % 2 ? 80 : 118) * (0.5 + 0.5 * k); c.lineTo(1115 + Math.cos(a) * r, 170 + Math.sin(a) * r); } c.closePath(); c.fill(); }, { edge: 1.5, rag: 0.5, p: k, key: k >= 1 ? 'burst3' : null }); }
      paint(navy, [900, 80, 1260, 260], (c) => txt(c, acc + '%', 1115, 212, 110, 'center'), { edge: 1, rag: 0.4, p: G(11.1, 11.3), key: acc === 97 ? 'acc97' : null });
      paint(navy, [100, 300, 200, 420], (c) => txt(c, '61%', 142, 390, 34, 'center'), { edge: 0.7, rag: 0.3, p: G(11.3, 11.5), key: 'l61' });
      if (t < 13.15) bandText('ACCURACY ' + acc + '%', 11.0);
      else bandText('MORE EXAMPLES → BETTER GUESSES', 13.15, 84, 'bt3');
    }
    // ======== the medium's scene change: a fresh coat of cream swept across the board ========
    for (const [a, b] of [[5.9, 6.35], [10.4, 10.85]]) {
      if (t > a && t < b + 0.01) paint(cream, [0, 0, W, 572], (c) => c.fillRect(0, 0, W, 566), { edge: 6, rag: 1.4, p: G(a, b) });
    }
    // ======== hook -> header tab ========
    {
      const mc = H.layer(4, 4).getContext('2d'); mc.font = '400 140px "Bebas Neue"'; if (mc.letterSpacing !== undefined) mc.letterSpacing = '6px';
      const tw = mc.measureText('HOW DOES AI LEARN?').width;
      const k = G(1.5, 2.2), s = 1 - 0.68 * k, x = (640 - tw / 2) + (40 - (640 - tw / 2)) * k, y = 330 + (64 - 330) * k;
      if (k > 0.3) paint(navy, [20, 20, 520, 110], (c) => c.fillRect(22, 22, 470, 62), { p: G(1.9, 2.3), key: 'tab' });
      paint(k > 0.6 ? cream : navy, [0, 0, W, 470], (c) => { c.translate(x, y); c.scale(s, s); txt(c, 'HOW DOES AI LEARN?', 0, 0, 140, 'left', 'Bebas Neue', 6); }, { edge: 1.2, rag: 0.6, p: G(0.3, 0.9), key: k >= 1 ? 'title' : null });
    }
    // poster border + grain
    paint(cream, [0, 0, W, H_], (c) => { c.beginPath(); c.rect(0, 0, W, H_); c.moveTo(20, 20); c.lineTo(20, H_ - 20); c.lineTo(W - 20, H_ - 20); c.lineTo(W - 20, 20); c.closePath(); c.fill('evenodd'); c.fillRect(20, 560, W - 40, 9); }, { edge: 2, rag: 0.9, key: 'border' });
    for (let i = 0, p = 0; i < W * H_; i++, p += 4) { const g = grain[i]; buf[p] += g; buf[p + 1] += g; buf[p + 2] += g * 0.92; }
    ctx.putImageData(new ImageData(buf, W, H_), 0, 0);
  }

  registerStyle({
    id: 'gouache-poster',
    name: 'Gouache Travel Poster',
    category: 'Painterly',
    description: 'Mid-century travel poster hand-painted in gouache: six flat, opaque, matte colours stacked in receding layers, dry-brush streaks where the paint thins at each edge, and a bold hand-lettered block.',
    motion: 'Layers slide in parallax like stacked paper cut-outs, the sun rises behind the ridges, steam puffs bob from the cooling towers and server windows blink on in rows.',
    fonts: ['400 132px "Bebas Neue"', '700 24px "Oswald"', '400 18px "Oswald"'],
    duration: 6,
    frameT: 5.9,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'A run of hand-painted posters: each scene change is a fresh coat of cream swept across the board before the next poster is painted flat colour by flat colour; arrows are flat poster arrow shapes, numbers are repainted in the lettering band, and an orange starburst stamps the key moments.',
    explainer(ctx, W, H_, t) { explainGouache(ctx, W, H_, t); },
    explainerSound(k) {
      // all times copied from explainGouache() above (its G(a, b) paint windows)
      const D = 15, px = (x) => H.clamp(x / 1280 * 2 - 1, -1, 1) * 0.7;
      const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
      // a flat brush loaded with opaque gouache pulled across hardboard: a creamy drag with a bristle grain,
      // panned along the stroke (p0 -> p1), with a soft knock as the ferrule touches the board
      const flat = (a, b, g = 1, p0 = 0, p1 = p0, minor = true) => {
        const d = b - a, r = H.rng(Math.round(a * 997) + 3);
        k.noise(a, { dur: 0.04, color: 'brown', filter: 'lowpass', f: 450, gain: 0.2 * g, a: 0.004, pan: p0, minor });
        for (let x = 0; x < d; x += 0.035 + r() * 0.02) {
          const u = x / d, gd = 0.06 + r() * 0.03;
          k.noise(a + x, { dur: gd, color: 'pink', filter: 'bandpass', f: 650 + r() * 350, q: 0.7, gain: 0.13 * g * (0.65 + r() * 0.5) * (1 - 0.35 * u), a: gd * 0.35, pan: p0 + (p1 - p0) * u, minor });
        }
        k.play('stroke', a, { material: 'brush', dur: d, gain: 0.9 * g, pan: (p0 + p1) / 2, minor });
      };
      // the scene change: a wide house-painter's brush sweeps a fresh coat of cream across the whole board, left to right
      const coat = (a, b) => { flat(a, b, 2.0, -0.7, 0.7, false); k.noise(a, { dur: b - a + 0.1, color: 'brown', filter: 'lowpass', f: 300, gain: 0.14, a: 0.05, hold: (b - a) * 0.5 }); };
      // repainted number in the band: a quick dab of the lettering brush
      const dab = (t, g = 1, pan = 0) => { k.withMinor(() => { k.noise(t, { dur: 0.04, color: 'pink', filter: 'bandpass', f: 950, q: 1.0, gain: 0.3 * g, a: 0.004, pan }); k.tone(t, { f: 170, dur: 0.05, gain: 0.08 * g, pan }); }); };
      const counter = (val, a, b, gap, pan, avoid = []) => { let last = val(a), lastT = -1;
        for (let t = a; t <= b; t += 1 / 240) { const v = val(t); if (v !== last && t - lastT >= gap && !avoid.some((x) => t > x - 0.03 && t < x + 0.07)) { dab(t, 1, pan); lastT = t; } last = v; } };

      k.bed('room', 0, D, { gain: 0.45 });
      // a light mid-century pad (C6, Am7, Fmaj7, G6; 3.75 s bars) under the paint
      k.music('pad', 0, D, { bpm: 64, gain: 0.3, chords: [['C3', 'E3', 'G3', 'A3'], ['A2', 'E3', 'G3', 'C4'], ['F2', 'C3', 'E3', 'A3'], ['G2', 'D3', 'E3', 'B3']] });

      // ---- 1 HOOK: sky, ground and band painted 0-0.7, title lettered 0.3-0.9, then it shrinks to the tab 1.5-2.2
      flat(0.0, 0.3, 0.7, -0.6, 0.2);   // sky (0-0.45), quieter, the title takes over at 0.3
      flat(0.3, 0.9, 1.2, -0.5, 0.5, false);
      k.noise(1.5, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 320], [0.7, 650]], q: 0.7, gain: 0.07, a: 0.25, minor: true }); // soft slide
      flat(1.9, 2.3, 0.7, -0.9, -0.3);                       // navy header tab

      // ---- 2 DATA: the machine painted colour by colour from 0.9, conveyor 1.6-2.3, hopper 2.0-2.3
      flat(0.9, 1.25, 0.9, px(900), px(1200), false);         // teal body
      flat(1.2, 1.55, 0.7, px(950), px(1100));                // gauges
      flat(1.6, 2.1, 0.8, px(0), px(900));                    // mustard conveyor
      // the belt runs under the cards (2.4 -> ~5.9): a soft low rumble
      k.noise(2.3, { dur: 3.6, color: 'brown', filter: 'bandpass', f: 220, q: 1.2, gain: 0.12, a: 0.4, hold: 2.9, pan: -0.2, minor: true });
      flat(2.6, 3.0, 0.9, px(420), px(810), false);           // cream poster arrow
      flat(2.6, 3.05, 0.6, -0.8, 0.2);                        // counter lettered in the band
      // counter: n = 1e6 * ease.in((t - 2.7) / 2.9), rounded to thousands
      counter((t) => Math.round(1e6 * H.ease.in(H.clamp((t - 2.7) / 2.9)) / 1000), 3.05, 5.58, 1 / 12, -0.5);
      k.play('tock', 5.6, { f: 300, gain: 0.7, pan: -0.5 });  // 1,000,000 lands
      flat(5.6, 5.9, 1.0, -0.8, 0.3, false);                  // orange underline

      // ---- fresh coat 5.9-6.35
      coat(5.9, 6.35);

      // ---- 3 GUESS -> CHECK -> ADJUST
      flat(6.6, 6.95, 0.8, px(120), px(420));                 // machine repainted at the left
      flat(6.9, 7.25, 0.6, px(150), px(300));
      k.play('slap', 7.2, { gain: 0.3, pan: px(270), minor: true }); // new picture drops in
      flat(7.1, 7.4, 1.0, px(480), px(790), false);           // GUESS ticket arrow
      flat(7.4, 7.7, 0.9, px(860), px(1100));                 // DOG?
      // the wrong guess: an orange starburst splats on, the navy cross is brushed across it
      k.play('slap', 7.9, { gain: 0.55, pan: px(980) });
      k.play('thud', 7.9, { f: 120, gain: 0.4, pan: px(980) });
      k.tone(7.92, { f: 'A3', type: 'triangle', dur: 0.2, gain: 0.18, a: 0.01, hold: 0.07, pan: px(980) });
      k.tone(8.1, { f: 'F3', type: 'triangle', dur: 0.36, gain: 0.18, a: 0.01, hold: 0.12, pan: px(980) });
      flat(8.0, 8.1, 1.4, px(860), px(1100), false); flat(8.1, 8.2, 1.4, px(1100), px(860), false);
      flat(8.3, 8.7, 1.1, px(1000), px(480), false);          // rose ADJUST arrow loops back
      // gauges turn G(8.6, 9.2): a few mechanical detents
      const G2 = (t) => H.ease.inOut(H.clamp((t - 8.6) / 0.6));
      for (let s = 1; s <= 3; s++) k.play('tock', when((t) => G2(t) * 4, s, 8.6, 9.2), { f: 520 + s * 30, gain: 0.45, pan: px(250), minor: true });
      flat(9.4, 9.7, 1.0, px(860), px(1100));                 // CAT
      flat(9.7, 9.95, 1.1, px(1150), px(1240), false);        // teal tick
      k.play('success', 9.95, { f: 'G5', gain: 0.5, pan: px(1180) });

      // ---- fresh coat 10.4-10.85
      coat(10.4, 10.85);

      // ---- 4 PROGRESS: mustard sky 10.85, axis 11.0-11.3, ten bars painted upward from 11.2 + i*0.15
      flat(10.85, 11.3, 0.7, -0.6, 0.6);
      for (let i = 0; i < 10; i++) {
        const a = 11.2 + i * 0.15, p = px(110 + i * 86 + 32);
        k.withMinor(() => k.noise(a, { dur: 0.25, color: 'pink', filter: 'bandpass', f: [[0, 420 + i * 25], [0.25, 800 + i * 40]], q: 0.8, gain: 0.16, a: 0.03, pan: p }));
        k.play('tock', a, { f: 260 + i * 12, gain: 0.36, pan: p, minor: true });
      }
      // % counter: 61 + 36 * ease.out((t - 11.2) / 1.6); soft dabs, sparser than the bars
      const acc = (t) => Math.round(61 + 36 * H.ease.out(H.clamp((t - 11.2) / 1.6)));
      const t97 = when(acc, 97, 11.2, 12.8);
      counter(acc, 11.25, t97 - 0.05, 1 / 7, px(1115), Array.from({ length: 10 }, (_, i) => 11.2 + i * 0.15));
      k.play('tock', t97, { f: 380, gain: 0.55, pan: px(1115) });   // 97% painted
      // the orange starburst splats behind 97% (12.8-12.95): the biggest hit
      k.play('impact', 12.8, { gain: 0.9, pan: px(1115) });
      k.play('slap', 12.8, { gain: 0.9, pan: px(1115) });
      k.play('ding', 12.83, { f: 'E5', gain: 0.5, pan: 0.3 });
      ['C5', 'G5'].forEach((f, i) => k.tone(12.83 + 0.03 * (i + 1), { f, dur: 1.2, gain: 0.07, verb: 0.3, pan: 0.15 + i * 0.3 }));

      // ---- 5 TAKEAWAY: band repainted 13.15-13.6, then a resolving chord
      flat(13.15, 13.6, 1.2, -0.7, 0.7, false);
      k.play('ding', 13.65, { f: 'C5', gain: 0.45 });
      ['E5', 'G5', 'C6'].forEach((f, i) => k.tone(13.7 + i * 0.05, { f, dur: 1.2, gain: 0.06, verb: 0.3, pan: (i - 1) * 0.3 }));
    },
    draw(ctx, W, H_, t) {
      const { navy, teal, orange, mustard, cream, rose } = PAL;
      const Cx = gpCache(W, H_);   // brushing fields + board grain, built once (same seeds as before)
      // the board starts with the artist's pencil layout, which the opaque paint then buries
      const PB = H.layer(W, H_), pb = PB.getContext('2d');
      pb.fillStyle = `rgb(${cream})`; pb.fillRect(0, 0, W, H_);
      pb.strokeStyle = 'rgba(90,80,70,0.38)'; pb.lineWidth = 1; pb.lineCap = 'round';
      const pl = (pts) => { pb.beginPath(); pts.forEach(([x, y], i) => (i ? pb.lineTo(x, y) : pb.moveTo(x, y))); pb.stroke(); };
      pl([[0, 300], [90, 262], [170, 296], [300, 220], [380, 270], [470, 236], [560, 288], [660, 250], [720, 276], [980, 214], [1080, 268], [1160, 236], [1280, 280]]);
      pl([[0, 352], [120, 318], [230, 350], [340, 300], [450, 344], [560, 330], [700, 352], [780, 318], [900, 346], [1040, 306], [1150, 340], [1280, 322]]);
      pl([[0, 392], [1280, 392]]); pl([[440, 452], [1280, 452]]); pl([[0, 160], [1280, 160]]); pl([[0, 250], [1280, 250]]);
      pb.beginPath(); pb.arc(860, 234, 112, 0, 7); pb.stroke();
      pb.strokeRect(470, 360, 760, 92); pb.strokeRect(36, 586, 840, 104); pb.strokeRect(930, 600, 300, 90);
      pl([[160, 560], [150, 420], [176, 250]]); pb.beginPath(); pb.ellipse(200, 160, 180, 50, 0, Math.PI, 0); pb.stroke();
      pl([[0, 470], [300, 470], [600, 540], [900, 520], [1280, 504]]);
      const buf = pb.getImageData(0, 0, W, H_).data;
      const paint = makePainter(buf, W, H_, Cx, 3, 0.9);
      const polyPath = (c, pts) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); };
      const rise = H.ease.inOut(H.clamp((t - 0.8) / 4.2));
      const G = (a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));

      // ---------- sky: three flat bands ----------
      paint(rose, [0, 0, W, 170], (c) => c.fillRect(0, 0, W, 160), { edge: 4, rag: 0.8, p: G(0, 0.55) });
      paint(tint(rose, 0.45), [0, 140, W, 260], (c) => c.fillRect(0, 158, W, 92), { edge: 4, rag: 0.8, p: G(0.25, 0.75) });
      paint(tint(mustard, 0.5), [0, 230, W, 420], (c) => c.fillRect(0, 248, W, 170), { edge: 4, rag: 0.8, p: G(0.45, 0.95) });

      // ---------- sun ----------
      const sunY = 300 - rise * 66, sunX = 860;
      paint(orange, [sunX - 130, sunY - 130, sunX + 130, sunY + 130], (c) => { c.beginPath(); c.arc(sunX, sunY, 112, 0, 7); c.fill(); }, { edge: 2.5, rag: 0.8, p: G(0.9, 1.2) });
      // retro sunset bars cut back in with the sky colour
      paint(tint(mustard, 0.5), [sunX - 130, sunY - 10, sunX + 130, sunY + 130], (c) => {
        for (let k = 0; k < 4; k++) c.fillRect(sunX - 120, sunY + 4 + k * 17, 240, 3 + k * 2.2);
      }, { edge: 1.2, rag: 0.5, p: G(1.15, 1.3) });

      // ---------- birds ----------
      paint(navy, [480, 120, 640, 200], (c) => {
        c.lineWidth = 4; c.lineCap = 'round';
        [[520, 160, 1], [570, 140, 0.8], [600, 172, 0.65]].forEach(([x, y, s]) => {
          const yy = y + Math.sin(t * 2 + x) * 3; x += (t - 5.9) * 26;
          c.beginPath(); c.moveTo(x - 16 * s, yy - 4 * s); c.quadraticCurveTo(x - 6 * s, yy - 10 * s, x, yy); c.quadraticCurveTo(x + 6 * s, yy - 10 * s, x + 16 * s, yy - 4 * s); c.stroke();
        });
      }, { edge: 1, rag: 0.5, p: G(1.0, 1.1) });

      // ---------- far range + snow caps ----------
      const farPts = [[0, 300]];
      const farPeaks = [[0, 300], [90, 262], [170, 296], [300, 220], [380, 270], [470, 236], [560, 288], [660, 250], [720, 276], [980, 214], [1080, 268], [1160, 236], [1280, 280]];
      farPeaks.forEach((p) => farPts.push(p)); farPts.push([1280, 420], [0, 420]);
      paint(tint(teal, 0.5), [0, 200, W, 430], (c) => polyPath(c, farPts), { edge: 3, rag: 1, dir: 'd', p: G(1.0, 1.5) });
      paint(cream, [0, 200, W, 300], (c) => {
        [[300, 220], [470, 236], [980, 214], [1160, 236]].forEach(([x, y]) => {
          polyPath(c, [[x, y], [x + 34, y + 20], [x + 20, y + 16], [x + 8, y + 26], [x - 6, y + 17], [x - 20, y + 25], [x - 32, y + 19]]);
        });
      }, { edge: 1.5, rag: 0.6, p: G(1.45, 1.6) });
      // shadow planes on the far range
      paint(tint(teal, 0.3), [0, 200, W, 430], (c) => {
        for (let k = 1; k < farPeaks.length - 1; k++) {
          const [x, y] = farPeaks[k], [nx, ny] = farPeaks[k + 1];
          if (y < farPeaks[k - 1][1] && y < ny) polyPath(c, [[x, y + 6], [nx, ny], [nx - 10, 420], [x + 14, 420]]);
        }
      }, { edge: 2, rag: 1, p: G(1.55, 1.75) });

      // ---------- mid range ----------
      const mid = [[0, 352], [120, 318], [230, 350], [340, 300], [450, 344], [560, 330], [700, 352], [780, 318], [900, 346], [1040, 306], [1150, 340], [1280, 322], [1280, 440], [0, 440]];
      paint(teal, [0, 290, W, 450], (c) => polyPath(c, mid), { edge: 3, rag: 1, dir: 'd', p: G(1.6, 2.0) });
      paint(H.mix(teal, navy, 0.35), [0, 290, W, 450], (c) => {
        for (let k = 1; k < mid.length - 3; k++) {
          const [x, y] = mid[k], [nx, ny] = mid[k + 1];
          if (y < mid[k - 1][1] && y < ny) polyPath(c, [[x, y], [nx, ny], [nx + 10, 440], [x + 40, 440]]);
        }
      }, { edge: 2, rag: 1, p: G(1.95, 2.15) });

      // ---------- lake with broken sun reflection ----------
      paint(tint(teal, 0.25), [0, 380, W, 480], (c) => c.fillRect(0, 392, W, 80), { edge: 3, rag: 1.1, p: G(2.0, 2.35) });
      paint(mustard, [600, 380, 1120, 480], (c) => {
        const rr = H.rng(77);
        for (let k = 0; k < 9; k++) {
          const y = 398 + k * 8, half = (130 - k * 11) * (0.7 + rr() * 0.4), cx = sunX + rr.gauss() * 10 + Math.sin(t * 1.5 + k) * 6;
          c.fillRect(cx - half, y, half * 2 * (0.3 + rr() * 0.3), 3.5); c.fillRect(cx + half * 0.2, y, half * 0.8, 3.5);
        }
      }, { edge: 1, rag: 0.6, p: G(2.3, 2.5) });

      // ---------- data-centre city on the far shore ----------
      const city = [];
      const cr = H.rng(901);
      let bx0 = 470;
      while (bx0 < 1230) {
        const w = cr.range(46, 96), h = cr.range(40, 120) * (1 - Math.abs(bx0 - 860) / 900), d = cr.range(14, 24);
        city.push({ x: bx0, w, h, d, base: 452 + cr.range(-4, 6) });
        bx0 += w + cr.range(6, 30);
      }
      // shadowed sides (rose) first, lit fronts (cream), roofs (orange)
      paint(H.mix(rose, orange, 0.25), [460, 280, 1260, 470], (c) => city.forEach((b) => polyPath(c, [[b.x + b.w, b.base - b.h], [b.x + b.w + b.d, b.base - b.h - 8], [b.x + b.w + b.d, b.base - 6], [b.x + b.w, b.base]])), { edge: 1.6, rag: 0.8, dir: 'v', p: G(2.4, 2.7) });
      paint(cream, [460, 280, 1260, 470], (c) => city.forEach((b) => c.fillRect(b.x, b.base - b.h, b.w, b.h)), { edge: 1.6, rag: 0.8, dir: 'v', p: G(2.55, 2.85) });
      paint(orange, [460, 280, 1260, 470], (c) => city.forEach((b) => polyPath(c, [[b.x, b.base - b.h], [b.x + b.w, b.base - b.h], [b.x + b.w + b.d, b.base - b.h - 8], [b.x + b.d, b.base - b.h - 8]])), { edge: 1.2, rag: 0.6, p: G(2.8, 2.95) });
      // server windows: rows of slits; some glowing
      paint(navy, [460, 280, 1260, 470], (c) => city.forEach((b) => {
        for (let y = b.base - b.h + 12; y < b.base - 10; y += 12) for (let x = b.x + 8; x < b.x + b.w - 10; x += 10) c.fillRect(x, y, 6, 4);
      }), { edge: 0.8, rag: 0.5, p: G(2.95, 3.1) });
      paint(mustard, [460, 280, 1260, 470], (c) => {
        const wr = H.rng(902);
        city.forEach((b) => {
          for (let y = b.base - b.h + 12; y < b.base - 10; y += 12) for (let x = b.x + 8; x < b.x + b.w - 10; x += 10) {
            const on = wr() < (0.22 + 0.25 * (0.5 + 0.5 * Math.sin(Math.floor(t * 4) * 1.7 + x * 0.3 + y))) * H.clamp((t - 3.1 - (b.base - y) / 300) / 0.1);
            if (on) c.fillRect(x, y, 6, 4);
          }
        });
      }, { edge: 0.7, rag: 0.4, p: G(3.1, 3.2) });
      // cooling towers + steam
      const towers = [[648, 452, 36, 70], [724, 452, 30, 58]];
      paint(cream, [580, 330, 780, 460], (c) => towers.forEach(([x, y, r, h]) => {
        c.beginPath(); c.moveTo(x - r, y); c.quadraticCurveTo(x - r * 0.45, y - h * 0.55, x - r * 0.62, y - h); c.lineTo(x + r * 0.62, y - h); c.quadraticCurveTo(x + r * 0.45, y - h * 0.55, x + r, y); c.closePath(); c.fill();
      }), { edge: 1.5, rag: 0.7, dir: 'v', p: G(2.6, 2.85) });
      paint(H.mix(rose, orange, 0.25), [580, 330, 780, 460], (c) => towers.forEach(([x, y, r, h]) => {
        c.beginPath(); c.moveTo(x + r * 0.15, y); c.quadraticCurveTo(x + r * 0.2, y - h * 0.55, x + r * 0.2, y - h); c.lineTo(x + r * 0.62, y - h); c.quadraticCurveTo(x + r * 0.45, y - h * 0.55, x + r, y); c.closePath(); c.fill();
      }), { edge: 1.5, rag: 0.7, dir: 'v', p: G(2.8, 2.95) });
      paint(tint(rose, 0.75), [540, 160, 860, 400], (c) => towers.forEach(([x, y, r, h], k) => {
        for (let j = 0; j < 4; j++) {
          const ph = (t * 0.5 + j / 4) % 1, yy = y - h - 10 - ph * 120, rr = r * (0.35 + ph * 0.6), xx = x - 6 + ph * 70;
          c.beginPath(); c.arc(xx, yy, rr, 0, 7); c.arc(xx + rr * 0.8, yy + rr * 0.2, rr * 0.7, 0, 7); c.fill();
        }
      }), { edge: 2, rag: 0.6, p: G(3.0, 3.25) });
      // radio mast with beacon
      paint(navy, [1000, 230, 1060, 460], (c) => {
        c.lineWidth = 3; c.beginPath(); c.moveTo(1018, 452); c.lineTo(1030, 260); c.lineTo(1042, 452); c.stroke();
        for (let y = 280; y < 452; y += 22) { const u = (y - 260) / 192; c.beginPath(); c.moveTo(1030 - u * 12, y); c.lineTo(1030 + u * 12, y + 22); c.stroke(); }
        c.fillRect(1029, 244, 2, 18);
      }, { edge: 0.8, rag: 0.4, p: G(3.0, 3.2) });
      paint(orange, [1020, 230, 1040, 260], (c) => { c.beginPath(); c.arc(1030, 244, 4 + Math.sin(t * 4) * 1.2, 0, 7); c.fill(); }, { edge: 0.6, rag: 0.3, p: G(3.2, 3.25) });
      // shore line
      paint(H.mix(teal, navy, 0.5), [440, 440, W, 470], (c) => c.fillRect(440, 451, W - 440, 9), { edge: 1.5, rag: 0.8, p: G(2.35, 2.5) });

      // ---------- near hills (navy) with the road into the city ----------
      paint(H.mix(navy, teal, 0.35), [0, 400, W, 560], (c) => { c.beginPath(); c.moveTo(0, 430); c.bezierCurveTo(260, 400, 520, 470, 760, 482); c.bezierCurveTo(940, 492, 1120, 466, 1280, 474); c.lineTo(1280, 560); c.lineTo(0, 560); c.closePath(); c.fill(); }, { edge: 3, rag: 1, p: G(2.1, 2.4) });
      paint(navy, [0, 450, W, 560], (c) => { c.beginPath(); c.moveTo(0, 470); c.bezierCurveTo(300, 470, 600, 540, 900, 520); c.bezierCurveTo(1060, 510, 1180, 500, 1280, 504); c.lineTo(1280, 560); c.lineTo(0, 560); c.closePath(); c.fill(); }, { edge: 3, rag: 1, p: G(2.3, 2.6) });
      // road narrowing into the city (painted as one tapered ribbon)
      paint(tint(mustard, 0.2), [300, 440, 1000, 560], (c) => {
        const P = (u) => { const a = 1 - u; return [a * a * a * 360 + 3 * a * a * u * 540 + 3 * a * u * u * 560 + u * u * u * 840, a * a * a * 562 + 3 * a * a * u * 516 + 3 * a * u * u * 490 + u * u * u * 470]; };
        const L = [], R = [];
        for (let i = 0; i <= 30; i++) { const u = i / 30, [x, y] = P(u), w = 26 * Math.pow(1 - u, 1.6) + 1.5; L.push([x - w * 0.2, y - w * 0.5]); R.push([x + w * 0.2, y + w * 0.5]); }
        polyPath(c, L.concat(R.reverse()));
      }, { edge: 1.5, rag: 0.6, p: G(2.6, 2.8) });
      // two travellers taking in the view
      const fig = (c, x, y, s) => { c.beginPath(); c.arc(x, y - 44 * s, 7 * s, 0, 7); c.fill(); polyPath(c, [[x - 9 * s, y - 34 * s], [x + 9 * s, y - 34 * s], [x + 13 * s, y - 4 * s], [x - 13 * s, y - 4 * s]]); c.fillRect(x - 7 * s, y - 6 * s, 5 * s, 8 * s); c.fillRect(x + 2 * s, y - 6 * s, 5 * s, 8 * s); };
      paint(orange, [240, 420, 330, 520], (c) => fig(c, 262, 506, 1.1), { edge: 1, rag: 0.4, dir: 'v', p: G(3.2, 3.35) });
      paint(cream, [270, 420, 340, 520], (c) => { fig(c, 296, 508, 1.0); }, { edge: 1, rag: 0.4, dir: 'v', p: G(3.25, 3.4) });
      paint(mustard, [240, 420, 340, 520], (c) => { c.fillRect(272, 482, 14, 12); c.lineWidth = 3; c.beginPath(); c.moveTo(304, 474); c.lineTo(330, 452); c.stroke(); }, { edge: 0.8, rag: 0.4, p: G(3.35, 3.45) });

      // ---------- foreground umbrella pine ----------
      paint(navy, [0, 200, 420, 560], (c) => {
        c.beginPath(); c.moveTo(150, 560); c.bezierCurveTo(160, 440, 120, 360, 170, 250); c.lineTo(186, 254); c.bezierCurveTo(146, 360, 190, 450, 184, 560); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(166, 300); c.quadraticCurveTo(220, 250, 280, 214); c.lineTo(284, 224); c.quadraticCurveTo(226, 262, 176, 312); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(168, 270); c.quadraticCurveTo(120, 220, 70, 196); c.lineTo(66, 206); c.quadraticCurveTo(116, 232, 162, 282); c.closePath(); c.fill();
      }, { edge: 1.8, rag: 0.6, dir: 'v', p: G(2.5, 2.8) });
      paint(navy, [0, 40, 420, 240], (c) => {
        [[180, 170, 150, 46], [300, 196, 110, 34], [70, 190, 90, 30], [240, 120, 110, 36]].forEach(([x, y, a, b]) => {
          c.beginPath(); c.ellipse(x, y, a, b, 0, Math.PI, 0); c.bezierCurveTo(x + a, y + b * 0.4, x - a, y + b * 0.4, x - a, y); c.fill();
        });
      }, { edge: 2.5, rag: 0.8, dir: 'h', p: G(2.75, 3.0) });
      paint(teal, [0, 60, 420, 220], (c) => {
        [[180, 148, 120, 22], [300, 180, 84, 16], [74, 176, 64, 14], [240, 100, 84, 18]].forEach(([x, y, a, b]) => { c.beginPath(); c.ellipse(x - 6, y, a, b, 0, Math.PI, 0); c.closePath(); c.fill(); });
      }, { edge: 2, rag: 1, p: G(2.95, 3.1) });

      // ---------- lettering band ----------
      paint(navy, [0, 560, W, H_], (c) => c.fillRect(0, 572, W, H_ - 572), { edge: 2.5, rag: 0.9, p: G(3.3, 3.6) });
      paint(cream, [40, 570, 900, 715], (c) => {
        c.font = '400 132px "Bebas Neue"'; c.textBaseline = 'alphabetic';
        if (c.letterSpacing !== undefined) c.letterSpacing = '4px';
        c.fillText('VISIT THE CLOUD', 52, 692);
      }, { edge: 1.4, rag: 0.7, p: G(3.6, 4.1) });
      paint(mustard, [880, 590, W, 700], (c) => {
        c.font = '700 24px "Oswald"'; c.textAlign = 'right';
        if (c.letterSpacing !== undefined) c.letterSpacing = '5px';
        c.fillText('DATA VALLEY LINE', 1230, 630);
        c.fillRect(940, 646, 290, 4);
        c.font = '400 18px "Oswald"'; if (c.letterSpacing !== undefined) c.letterSpacing = '4px';
        c.fillText('EXPRESS SERVICE NIGHTLY', 1230, 680);
      }, { edge: 1, rag: 0.5, p: G(4.0, 4.3) });
      paint(orange, [880, 590, W, 700], (c) => { c.beginPath(); c.arc(926, 648, 9, 0, 7); c.fill(); }, { edge: 0.8, rag: 0.4, p: G(4.25, 4.35) });

      // ---------- poster border (cream, hand-trimmed) ----------
      paint(cream, [0, 0, W, H_], (c) => {
        c.beginPath(); c.rect(0, 0, W, H_);
        c.moveTo(20, 20); c.lineTo(20, H_ - 20); c.lineTo(W - 20, H_ - 20); c.lineTo(W - 20, 20); c.closePath();
        c.fill('evenodd');
        c.fillRect(20, 560, W - 40, 9);
      }, { edge: 2, rag: 0.9, key: 'border' });

      // ---------- board texture, matte grain ----------
      const grain = Cx.grain;
      for (let i = 0, p = 0; i < W * H_; i++, p += 4) { const g = grain[i]; buf[p] += g; buf[p + 1] += g; buf[p + 2] += g * 0.92; }
      // slow push-in on the finished poster (the border stays put: it is the poster's edge)
      const OUT = H.layer(W, H_); OUT.getContext('2d').putImageData(new ImageData(buf, W, H_), 0, 0);
      const z = 1 + 0.035 * H.ease.inOut(H.clamp(t / 6));
      ctx.drawImage(OUT, 0, 0);
      ctx.save(); ctx.beginPath(); ctx.rect(22, 22, W - 44, 536); ctx.clip();
      ctx.translate(640, 300); ctx.scale(z, z); ctx.translate(-640, -300); ctx.drawImage(OUT, 0, 0); ctx.restore();
    }
  });
}
```
