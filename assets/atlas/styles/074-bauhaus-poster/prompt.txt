I want an animated explainer made in the "Bauhaus Poster" visual style (Art & Design Movements). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Space Grotesk, Syne
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Syne:wght@500;800&display=block">
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
Name: Bauhaus Poster
Family: Art & Design Movements
Look: A 1920s Bauhaus exhibition poster: primary red, yellow and blue plus black on aged cream stock, a robot face built only from circles, squares, semicircles and triangles on a strict grid, with constructed geometric lettering and lithographic ink mottle.
Motion: Built like a workshop paste-up: grid rules draw out, the halo and head drop in and snap with a little overshoot, features stamp on one by one, then the constructed letters are set block by block and the type follows; in the hold the pupils swivel and the antenna waves pulse.
How it explains: Told as one long Bayer-style info-design sheet the camera tracks along and finally pulls back from, with thick bar-and-triangle arrows, tags that drop onto what they name, stamped Space Grotesk counters and a red ring drawn round the key moment.

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

REFERENCE STYLE SOURCE (styles/bauhaus.js; W/H_ are always 1280x720)
```js
{
  // ---------- print helpers (local) ----------
  const fieldNoise = (w, h, seed, cell, oct, sx = 1, sy = 1) => {
    const nz = H.makeNoise(seed), gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2, g = new Float32Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) g[j * gw + i] = nz.fbm2(i * 0.35 * sx, j * 0.35 * sy, oct);
    const out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      const fy = y / cell, j = fy | 0, ty = fy - j;
      for (let x = 0; x < w; x++) {
        const fx = x / cell, i = fx | 0, tx = fx - i, k = j * gw + i;
        const a = g[k] + (g[k + 1] - g[k]) * tx, b = g[k + gw] + (g[k + gw + 1] - g[k + gw]) * tx;
        out[y * w + x] = a + (b - a) * ty;
      }
    }
    return out;
  };
  // deterministic noise fields are cached across frames (pure: same inputs -> same arrays)
  const CACHE = {};
  const cachedField = (key, ...a) => CACHE[key] || (CACHE[key] = fieldNoise(...a));

  // mottled ink coverage: modulates alpha of a layer
  const inkify = (layer, seed, mottle, speck) => {
    const c = layer.getContext('2d'), w = layer.width, h = layer.height, img = c.getImageData(0, 0, w, h), d = img.data;
    const n1 = cachedField('ink1' + seed, w, h, seed, 5, 3), n2 = cachedField('ink2' + seed, w, h, seed + 9, 40, 3), r = H.rng(seed + 3);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      if (!d[i + 3]) { r(); continue; }
      let a = 1 - mottle * Math.max(0, n1[p] * 1.6 + n2[p] * 0.9);
      if (r() < speck * (0.4 + Math.max(0, n2[p]) * 3)) a *= 0.25;
      d[i + 3] *= H.clamp(a, 0, 1);
    }
    c.putImageData(img, 0, 0);
  };

  const C = { cream: '#ece2c9', red: '#cf3a2a', yellow: '#efb526', blue: '#1f4f9b', black: '#1c1a18' };

  // ring helper
  const ring = (c, x, y, ro, ri) => { c.beginPath(); c.arc(x, y, ro, 0, Math.PI * 2); c.arc(x, y, ri, 0, Math.PI * 2, true); c.fill(); };

  // constructed geometric lettering (Bayer-like universal alphabet)
  const letter = (c, ch, x, base, xh, sw) => {
    const R = xh / 2;
    if (ch === 'o') { ring(c, x + R, base - R, R, R - sw); return xh; }
    if (ch === 'b') { c.fillRect(x, base - xh * 1.55, sw, xh * 1.55); ring(c, x + R, base - R, R, R - sw); return xh; }
    if (ch === 'r') {
      c.fillRect(x, base - xh, sw, xh);
      c.beginPath(); c.arc(x + R, base - R, R, Math.PI, Math.PI * 1.62); c.arc(x + R, base - R, R - sw, Math.PI * 1.62, Math.PI, true); c.fill();
      return xh * 0.66;
    }
    if (ch === 't') {
      c.fillRect(x + xh * 0.18, base - xh * 1.4, sw, xh * 1.4);
      c.fillRect(x, base - xh, xh * 0.62, sw * 0.9);
      return xh * 0.62;
    }
    return xh * 0.5;
  };

  // ===================== EXPLAINER: "How does AI learn?" =====================
  // One long printed sheet of four panels; the camera tracks along it (Bayer-style info-design spread),
  // then pulls back to show the whole sheet as one diagram for the takeaway.
  let EX_PAPER = null;
  const exPaper = (W, HH) => {
    if (EX_PAPER) return EX_PAPER;
    const cv = H.layer(W, HH), x = cv.getContext('2d'), img = x.createImageData(W, HH), pd = img.data;
    const lo = cachedField('lo', W, HH, 11, 24, 4), fib = cachedField('fib', W, HH, 12, 2, 2, 3.5, 0.5), r0 = H.rng(5);
    const base = H.hex(C.cream), tan = H.hex('#c9ab78');
    for (let y = 0, p = 0; y < HH; y++) for (let xx = 0; xx < W; xx++, p++) {
      const ex = Math.min(xx, W - xx) / W, ey = Math.min(y, HH - y) / HH;
      const edge = Math.pow(1 - H.clamp(Math.min(ex * 3.2, ey * 2.2) + lo[p] * 0.15, 0, 1), 3);
      const k = 0.35 * edge + 0.12 * Math.max(0, lo[p]);
      const s = 1 + fib[p] * 0.035 + (r0() - 0.5) * 0.04, i = p * 4;
      pd[i] = (base[0] + (tan[0] - base[0]) * k) * s; pd[i + 1] = (base[1] + (tan[1] - base[1]) * k) * s; pd[i + 2] = (base[2] + (tan[2] - base[2]) * k) * s; pd[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    const rf = H.rng(77);
    for (let i = 0; i < 26; i++) {
      const px = rf.range(0, W), py = rf.range(0, HH), rr = rf.range(2, 10), g = x.createRadialGradient(px, py, 0, px, py, rr);
      g.addColorStop(0, 'rgba(140,90,40,0.22)'); g.addColorStop(1, 'rgba(140,90,40,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, rr, 0, 7); x.fill();
    }
    return (EX_PAPER = cv);
  };

  // geometric pictures: cat = yellow card, dog = blue card
  const exCard = (c, kind, x, y, s) => {
    c.save(); c.translate(x, y);
    c.fillStyle = kind === 'cat' ? C.yellow : C.blue; c.fillRect(-s / 2, -s / 2, s, s);
    if (kind === 'cat') {
      c.fillStyle = C.black;
      c.beginPath(); c.moveTo(-s * 0.3, -s * 0.06); c.lineTo(-s * 0.26, -s * 0.38); c.lineTo(-s * 0.06, -s * 0.2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(s * 0.3, -s * 0.06); c.lineTo(s * 0.26, -s * 0.38); c.lineTo(s * 0.06, -s * 0.2); c.closePath(); c.fill();
      c.beginPath(); c.arc(0, s * 0.06, s * 0.28, 0, 7); c.fill();
      c.fillStyle = C.yellow; c.beginPath(); c.arc(-s * 0.1, s * 0.02, s * 0.05, 0, 7); c.arc(s * 0.1, s * 0.02, s * 0.05, 0, 7); c.fill();
      c.fillStyle = C.red; c.beginPath(); c.moveTo(-s * 0.05, s * 0.12); c.lineTo(s * 0.05, s * 0.12); c.lineTo(0, s * 0.18); c.closePath(); c.fill();
    } else {
      c.fillStyle = C.cream; c.beginPath(); c.arc(0, s * 0.04, s * 0.27, 0, 7); c.fill();
      c.fillStyle = C.black;
      c.beginPath(); c.arc(-s * 0.27, s * 0.0, s * 0.13, -Math.PI / 2, Math.PI / 2, true); c.closePath(); c.fill();
      c.beginPath(); c.arc(s * 0.27, s * 0.0, s * 0.13, -Math.PI / 2, Math.PI / 2); c.closePath(); c.fill();
      c.beginPath(); c.arc(-s * 0.09, -s * 0.01, s * 0.04, 0, 7); c.arc(s * 0.09, -s * 0.01, s * 0.04, 0, 7); c.fill();
      c.beginPath(); c.arc(0, s * 0.12, s * 0.06, 0, 7); c.fill();
    }
    c.restore();
  };
  // label tag that lands on the thing it labels
  const exTag = (c, txt, x, y, p, size = 28, bg = C.black, fg = C.cream) => {
    if (p <= 0) return;
    c.save(); c.font = `700 ${size}px "Space Grotesk"`; c.textBaseline = 'middle';
    const w = c.measureText(txt).width + size * 0.9, h = size * 1.5, dy = -(1 - H.ease.back(p)) * 30;
    c.fillStyle = bg; c.fillRect(x - w / 2, y - h / 2 + dy, w, h);
    c.fillStyle = fg; c.textAlign = 'center'; c.fillText(txt, x, y + dy + 1);
    c.restore();
  };
  // thick Bauhaus arrow (bar + triangle), drawn on with progress p
  const exArrow = (c, x0, y0, x1, y1, p, w = 10, col = C.black) => {
    if (p <= 0) return;
    const L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0), l = L * p;
    c.save(); c.translate(x0, y0); c.rotate(a); c.fillStyle = col;
    c.fillRect(0, -w / 2, Math.max(0, l - w * 2), w);
    c.beginPath(); c.moveTo(l, 0); c.lineTo(l - w * 2.6, -w * 1.5); c.lineTo(l - w * 2.6, w * 1.5); c.closePath(); c.fill();
    c.restore();
  };
  // the model: the robot head from the poster, with three weight dials on a control bar
  const exRobot = (c, x, y, s, dials, look, mood = 0) => {
    const k = s / 300, hx = x - s / 2, hy = y - s / 2;
    c.fillStyle = C.black; c.fillRect(x - 100 * k, hy - 62 * k, 200 * k, 52 * k);
    dials.forEach((a, i) => {
      const dx = x + (i - 1) * 62 * k, dy = hy - 36 * k;
      c.fillStyle = C.cream; c.beginPath(); c.arc(dx, dy, 19 * k, 0, 7); c.fill();
      c.save(); c.translate(dx, dy); c.rotate(a); c.fillStyle = [C.red, C.blue, C.black][i]; c.fillRect(-3 * k, -17 * k, 6 * k, 17 * k); c.restore();
    });
    c.fillStyle = C.red; c.beginPath(); c.arc(hx, y, 50 * k, Math.PI / 2, Math.PI * 1.5); c.closePath(); c.fill();
    c.fillStyle = C.black; c.beginPath(); c.arc(hx + s, y, 50 * k, -Math.PI / 2, Math.PI / 2); c.closePath(); c.fill();
    c.fillStyle = C.blue; c.fillRect(hx, hy, s, s);
    c.fillStyle = C.yellow; c.beginPath(); c.arc(hx + 85 * k, hy + 105 * k, 50 * k, 0, 7); c.fill();
    c.fillStyle = mood > 0 ? C.yellow : C.red; c.fillRect(hx + s - 135 * k, hy + 55 * k, 100 * k, 100 * k);
    const dx = H.lerp(-8, 18, look) * k;
    c.fillStyle = C.black; c.beginPath(); c.arc(hx + 85 * k + dx, hy + 105 * k, 21 * k, 0, 7); c.arc(hx + s - 85 * k + dx, hy + 105 * k, 21 * k, 0, 7); c.fill();
    c.fillStyle = C.yellow; c.beginPath(); c.moveTo(x - 26 * k, hy + 150 * k); c.lineTo(x + 26 * k, hy + 150 * k); c.lineTo(x, hy + 196 * k); c.closePath(); c.fill();
    c.fillStyle = C.black; c.fillRect(x - 92 * k, hy + 220 * k, 184 * k, 46 * k);
    c.fillStyle = C.blue; for (let i = 0; i < 5; i++) c.fillRect(x - 76 * k + i * 33 * k, hy + 228 * k, 13 * k, 30 * k);
  };
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  // colour separations: every fill lands on its own plate (yellow / red / blue / black) and knocks the same shape out
  // of the other plates, exactly like a litho knockout. Cream fills knock out all plates (reversed type shows paper).
  // The plates are then printed with the per-colour misregistration offsets, overlapping slivers multiply.
  const PLATE_COLS = ['yellow', 'red', 'blue', 'black'];
  const PLATE_OF = { [C.yellow]: 0, [C.red]: 1, [C.blue]: 2, [C.black]: 3 };
  let PLATES = null;
  const plateCtx = (W, HH) => {
    if (!PLATES || PLATES[0].width !== W || PLATES[0].height !== HH) PLATES = PLATE_COLS.map(() => H.layer(W, HH));
    const cs = PLATES.map((pl) => { const x = pl.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, W, HH); return x; });
    let fill = C.black, stroke = C.black;
    const paint = (style, op) => { const k = style in PLATE_OF ? PLATE_OF[style] : style === C.cream ? -1 : 3;
      cs.forEach((x, i) => { if (i === k) op(x); else { x.globalCompositeOperation = 'destination-out'; op(x); x.globalCompositeOperation = 'source-over'; } }); };
    const DRAW = { fill: 1, fillRect: 1, fillText: 1, stroke: 2, strokeRect: 2, strokeText: 2 };
    return new Proxy({}, {
      get(_, prop) {
        if (prop === 'fillStyle') return fill; if (prop === 'strokeStyle') return stroke;
        const v = cs[0][prop];
        if (typeof v !== 'function') return v;
        if (DRAW[prop]) return (...a) => paint(DRAW[prop] === 1 ? fill : stroke, (x) => x[prop](...a));
        if (prop === 'measureText' || prop.startsWith('create') || prop.startsWith('get') || prop.startsWith('isPoint')) return (...a) => cs[0][prop](...a);
        return (...a) => { let r; cs.forEach((x) => { r = x[prop](...a); }); return r; };
      },
      set(_, prop, v) { if (prop === 'fillStyle') fill = v; else if (prop === 'strokeStyle') stroke = v; cs.forEach((x) => { x[prop] = v; }); return true; },
    });
  };

  const explainBauhaus = (ctx, W, HH, t) => {
    const E = H.ease, cl = H.clamp;
    const S = (a, b) => cl((t - a) / (b - a), 0, 1);       // segment progress
    const PW = 1280;
    // ---------- camera along the sheet ----------
    const keys = [[0, 0], [2.0, 0], [2.9, 1], [5.8, 1], [6.6, 2], [10.3, 2], [11.0, 3]];
    let pan = 0; for (let i = 0; i < keys.length - 1; i++) { const [ta, a] = keys[i], [tb, b] = keys[i + 1]; if (t >= ta) pan = t >= tb ? b : H.lerp(a, b, E.inOut((t - ta) / (tb - ta))); }
    const z = E.inOut(S(12.9, 13.7)), sc = H.lerp(1, 0.25, z), camX = pan * PW - (960 * z) / sc * (pan === 3 ? 1 : 0), oy = 150 * z;

    ctx.drawImage(exPaper(W, HH), 0, 0);
    const c = plateCtx(W, HH);
    const reg = { yellow: [2, -1], red: [-1.5, 1], blue: [1, 2], black: [0, 0] };

    c.save(); c.translate(0, oy); c.scale(sc, sc); c.translate(-camX, 0);
    const vis = (k) => (k + 1) * PW > camX && k * PW < camX + W / sc;

    // continuous base rule running the whole length of the sheet (ties the panels together)
    c.fillStyle = C.black; c.fillRect(56, HH - 70, 4 * PW - 112, 14);

    // ---------- panel 0: hook ----------
    if (vis(0)) {
      c.save();
      c.fillStyle = C.black; c.fillRect(56, 56, 14, (HH - 126) * E.out(S(0, 0.6)));
      const qs = E.back(S(0.25, 0.85));
      c.fillStyle = C.red; c.beginPath(); c.arc(980, 330, 190 * qs, 0, 7); c.fill();
      if (qs > 0) { // constructed question mark
        c.save(); c.translate(980, 330); c.scale(qs, qs); c.fillStyle = C.cream;
        c.beginPath(); c.arc(0, -55, 62, Math.PI, Math.PI * 2.5); c.arc(0, -55, 30, Math.PI * 2.5, Math.PI, true); c.closePath(); c.fill();
        c.fillRect(-16, -2, 32, 50); c.fillRect(-16, 66, 32, 32); c.restore();
      }
      c.fillStyle = C.yellow; c.fillRect(1100, 470, 120 * E.out(S(0.6, 1.0)), 40);
      c.fillStyle = C.blue; c.beginPath(); c.moveTo(800, 560); c.lineTo(800 + 90 * E.out(S(0.7, 1.1)), 560); c.lineTo(800, 470); c.closePath(); c.fill();
      c.restore();
    }
    // ---------- panel 1: data ----------
    if (vis(1)) {
      c.save(); c.translate(PW, 0);
      // conveyor rule + model head
      c.fillStyle = C.black; c.fillRect(60, 470, 800 * E.out(S(2.5, 3.2)), 12);
      const look = 0.5 + 0.5 * Math.sin(t * 2);
      exRobot(c, 1030, 330, 250, [0.3, -0.6, 1.1], look);
      exArrow(c, 760, 400, 880, 360, E.out(S(2.9, 3.3)), 9);
      // stream of labelled examples riding the conveyor into the model's mouth
      const tl = t - 2.6;
      for (let i = 0; i < 14; i++) {
        const x = 40 + (tl - i * 0.52) * 300; if (x < -60 || tl - i * 0.52 < 0) continue;
        const kind = H.rng(i * 7 + 1)() < 0.5 ? 'cat' : 'dog';
        const into = cl((x - 760) / 140, 0, 1), s = 112 * (1 - into * 0.75);
        if (into >= 1) continue;
        const cx = Math.min(x, 760) + into * 160, cy = 395 - into * 50;
        exCard(c, kind, cx, cy, s);
        exTag(c, kind, cx, cy + s / 2 + 4, cl((tl - i * 0.52) / 0.3, 0, 1) * (1 - into), 28 * (1 - into * 0.6));
      }
      // label for the stack
      exTag(c, 'training data', 330, 575, S(3.3, 3.6), 28, C.red, C.cream);
      // counter block (stamped numerals)
      const ct = S(2.9, 5.6), n = ct < 1 ? Math.pow(ct, 3) * 1e6 : 1e6;
      c.fillStyle = C.red; c.fillRect(110, 160, 420 * E.out(S(2.8, 3.1)), 120);
      if (S(2.8, 3.1) >= 1) {
        c.fillStyle = C.cream; c.font = '700 72px "Space Grotesk"'; c.textBaseline = 'alphabetic'; c.fillText(fmt(n), 130, 250);
        c.fillStyle = C.black; c.font = '700 34px "Space Grotesk"'; c.fillText('examples', 545, 250);
      }
      c.restore();
    }
    // ---------- panel 2: guess -> check -> adjust ----------
    if (vis(2)) {
      c.save(); c.translate(2 * PW, 0);
      const adj = E.inOut(S(8.4, 9.2));
      const dials = [H.lerp(0.3, -0.9, adj), H.lerp(-0.6, 0.8, adj), H.lerp(1.1, 0.2, adj)];
      const right = t > 9.5;
      exRobot(c, 300, 360, 250, dials, right ? 1 : 0.9, right ? 1 : 0);
      // new picture arrives
      const ix = H.lerp(760, 560, E.out(S(6.4, 6.9)));
      exCard(c, 'cat', ix, 330, 110);
      exArrow(c, ix - 70, 330, 450, 330, E.out(S(6.7, 7.0)), 8);
      // guess #1: "dog?" -> red X (check) + circled
      if (t < 9.3) {
        exTag(c, 'dog?', 545, 190, S(6.95, 7.2), 30);
        const xp = E.out(S(7.55, 7.75));
        if (xp > 0) { c.save(); c.translate(648, 190); c.rotate(Math.PI / 4); c.fillStyle = C.red; c.fillRect(-34 * xp, -7, 68 * xp, 14); c.fillRect(-7, -34 * xp, 14, 68 * xp); c.restore(); }
        const rp = S(7.6, 8.0); // emphasis ring drawn round the wrong guess
        if (rp > 0) { c.strokeStyle = C.red; c.lineWidth = 7; c.beginPath(); c.ellipse(585, 190, 120, 62, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rp); c.stroke(); }
      } else {
        exTag(c, 'cat', 545, 190, S(9.35, 9.6), 30, C.black, C.cream);
        const cp = E.out(S(9.6, 9.85));
        if (cp > 0) { c.save(); c.translate(618, 205); c.rotate(-Math.PI / 4); c.fillStyle = C.black; c.fillRect(-8, -36 * cp, 16, 36 * cp); c.fillRect(-8, -8, 64 * cp, 16); c.restore(); }
      }
      // the loop diagram: guess (circle) -> check (square) -> adjust (triangle)
      const G = [960, 170], K = [1150, 470], A = [770, 470];
      const node = (i, d) => E.back(S(d, d + 0.35));
      const active = t < 7.4 ? 0 : t < 8.2 ? 1 : t < 9.3 ? 2 : Math.floor((t - 9.3) * 3) % 3;
      const pulse = (i) => (i === active && t > 7.0 ? 1 + 0.08 * Math.sin(t * 10) : 1);
      let s = node(0, 6.9) * pulse(0); c.fillStyle = C.yellow; c.beginPath(); c.arc(G[0], G[1], 62 * s, 0, 7); c.fill();
      s = node(1, 7.4) * pulse(1); c.fillStyle = C.red; c.fillRect(K[0] - 58 * s, K[1] - 58 * s, 116 * s, 116 * s);
      s = node(2, 8.1) * pulse(2); c.fillStyle = C.blue; c.beginPath(); c.moveTo(A[0], A[1] - 70 * s); c.lineTo(A[0] + 66 * s, A[1] + 52 * s); c.lineTo(A[0] - 66 * s, A[1] + 52 * s); c.closePath(); c.fill();
      exTag(c, 'guess', G[0], G[1] + 2, S(7.0, 7.3), 28);
      exTag(c, 'check', K[0], K[1] + 2, S(7.5, 7.8), 28);
      exTag(c, 'adjust', A[0], A[1] + 16, S(8.2, 8.5), 28);
      exArrow(c, G[0] + 50, G[1] + 50, K[0] - 30, K[1] - 75, E.out(S(7.2, 7.5)), 9);
      exArrow(c, K[0] - 75, K[1] + 10, A[0] + 80, A[1] + 10, E.out(S(7.9, 8.2)), 9);
      exArrow(c, A[0] + 5, A[1] - 85, G[0] - 55, G[1] + 45, E.out(S(9.0, 9.3)), 9);
      // error signal: red square travels from check back to the model's dials
      const ep = S(8.0, 8.6);
      if (ep > 0 && ep < 1) { const ex = H.lerp(K[0] - 60, 300, E.inOut(ep)), ey = H.lerp(K[1] - 40, 190, E.inOut(ep)) - Math.sin(ep * Math.PI) * 120; c.fillStyle = C.red; c.fillRect(ex - 16, ey - 16, 32, 32); }
      if (ep >= 1 && t < 9.3) exTag(c, 'error', 300, 150, 1, 28, C.red, C.cream);
      // loop token keeps circling after it gets it right (the loop repeats)
      if (t > 9.4) { const u = ((t - 9.4) * 1.4) % 1, seg = Math.floor(u * 3), f = u * 3 - seg, P3 = [G, K, A], a = P3[seg], b = P3[(seg + 1) % 3]; c.fillStyle = C.black; c.beginPath(); c.arc(H.lerp(a[0], b[0], f), H.lerp(a[1], b[1], f), 12, 0, 7); c.fill(); }
      c.restore();
    }
    // ---------- panel 3: progress ----------
    if (vis(3)) {
      c.save(); c.translate(3 * PW, 0);
      const gx = 120, gy = 600, gw = 700, gh = 420;
      c.fillStyle = C.black; c.fillRect(gx, gy - gh, 10, gh); c.fillRect(gx, gy, gw, 10);
      const n = 10, prog = S(10.9, 12.3);
      for (let i = 0; i < n; i++) {
        const acc = 61 + 36 * (1 - Math.pow(1 - i / (n - 1), 2)), bp = E.out(cl(prog * n - i, 0, 1));
        const h = (acc - 40) / 60 * gh * bp;
        c.fillStyle = [C.red, C.yellow, C.blue][i % 3];
        if (i === n - 1 && t > 12.3) c.fillStyle = Math.floor(t * 6) % 2 ? C.red : C.black;
        c.fillRect(gx + 30 + i * 66, gy - h, 50, h);
      }
      exTag(c, 'training rounds →', gx + gw / 2, gy + 48, S(10.9, 11.2), 28);
      c.save(); c.translate(gx - 34, gy - gh / 2); c.rotate(-Math.PI / 2); exTag(c, 'accuracy', 0, 0, S(11.0, 11.3), 28); c.restore();
      // the counting number
      const acc = Math.round(H.lerp(61, 97, E.inOut(prog)));
      c.fillStyle = C.black; c.font = '700 150px "Space Grotesk"'; c.textBaseline = 'alphabetic';
      if (t > 10.8) c.fillText(acc + '%', 860, 330);
      c.font = '700 30px "Space Grotesk"'; if (t > 10.8) c.fillText('accuracy', 870, 380);
      c.font = '700 34px "Space Grotesk"'; if (t > 11.2) c.fillText('61% → 97%', 870, 430);
      const rp = S(12.3, 12.7); // emphasis: red ring drawn round 97%
      if (rp > 0) { c.strokeStyle = C.red; c.lineWidth = 9; c.beginPath(); c.ellipse(1005, 268, 185, 84, -0.06, -Math.PI * 0.6, -Math.PI * 0.6 + Math.PI * 2 * rp); c.stroke(); }
      c.restore();
    }
    c.restore();

    // ---------- pinned header (screen space): the hook shrinks into it ----------
    const hp = E.inOut(S(1.6, 2.4));
    const tx = H.lerp(120, 96, hp), ty = H.lerp(350, 64, hp), ts = H.lerp(1, 0.46, hp);
    c.save(); c.translate(tx, ty); c.scale(ts, ts);
    c.fillStyle = C.black; c.font = '700 96px "Space Grotesk"'; c.textBaseline = 'alphabetic';
    const title = 'how does', title2 = 'ai learn?';
    const nch = Math.floor(S(0.1, 1.0) * (title.length + title2.length + 1));
    c.fillText(title.slice(0, nch), 0, 0); c.fillText(title2.slice(0, Math.max(0, nch - title.length - 1)), 0, 100);
    c.restore();
    if (hp >= 1) { // section marker hung under the header
      const sect = t < 6.2 ? '1 data' : t < 10.6 ? '2 learn' : t < 12.9 ? '3 progress' : '';
      if (sect) { c.fillStyle = C.red; c.fillRect(96, 124, 24, 24); c.fillStyle = C.black; c.font = '700 28px "Space Grotesk"'; c.fillText(sect, 130, 146); }
    }

    // ---------- takeaway ----------
    const kp = S(13.3, 13.7);
    if (kp > 0) {
      c.save(); c.globalAlpha = 1; const dy = (1 - E.out(kp)) * 40;
      c.fillStyle = C.black; c.font = '700 60px "Space Grotesk"'; c.textBaseline = 'alphabetic';
      c.fillText('more examples', 96, 470 + dy);
      exArrow(c, 560, 450 + dy, 700, 450 + dy, E.out(S(13.5, 13.8)), 14, C.red);
      c.fillText('better guesses', 730, 470 + dy);
      c.fillStyle = C.yellow; c.fillRect(96, 500 + dy, 1090 * E.out(S(13.6, 14.0)), 16);
      c.restore();
    }

    // print it: per-colour misregistration is faked by a slight offset copy of the ink layer
    const L = H.layer(W, HH), lc = L.getContext('2d'); lc.globalCompositeOperation = 'multiply';
    PLATES.forEach((pl, i) => { const o = reg[PLATE_COLS[i]]; lc.drawImage(pl, o[0], o[1]); });
    inkify(L, 21, 0.22, 0.004);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0); ctx.restore();
    const crease = (vert) => { const g = vert ? ctx.createLinearGradient(W / 2 - 4, 0, W / 2 + 10, 0) : ctx.createLinearGradient(0, HH / 2 - 8, 0, HH / 2 + 4);
      g.addColorStop(0, 'rgba(255,250,235,0)'); g.addColorStop(0.45, 'rgba(255,250,235,0.18)'); g.addColorStop(0.55, 'rgba(70,50,30,0.14)'); g.addColorStop(1, 'rgba(70,50,30,0)'); ctx.fillStyle = g; vert ? ctx.fillRect(W / 2 - 4, 0, 14, HH) : ctx.fillRect(0, HH / 2 - 8, W, 12); };
    crease(true); crease(false);
    { // scuffs along the folds (as in the still)
      const rs = H.rng(31); ctx.fillStyle = 'rgba(245,238,220,0.5)';
      for (let i = 0; i < 260; i++) { const along = rs.range(0, 1); if (rs() < 0.5) ctx.fillRect(W / 2 + 2 + rs.gauss() * 1.2, along * HH, 1.2, rs.range(1, 4)); else ctx.fillRect(along * W, HH / 2 - 2 + rs.gauss() * 1.2, rs.range(1, 4), 1.2); } }
    H.grain(ctx, W, HH, 0.06, 9 + Math.floor(t * 12), true);
    H.vignette(ctx, W, HH, 0.18, '60,40,20');
  };

  registerStyle({
    id: 'bauhaus',
    name: 'Bauhaus Poster',
    category: 'Art & Design Movements',
    description: 'A 1920s Bauhaus exhibition poster: primary red, yellow and blue plus black on aged cream stock, a robot face built only from circles, squares, semicircles and triangles on a strict grid, with constructed geometric lettering and lithographic ink mottle.',
    motion: 'Built like a workshop paste-up: grid rules draw out, the halo and head drop in and snap with a little overshoot, features stamp on one by one, then the constructed letters are set block by block and the type follows; in the hold the pupils swivel and the antenna waves pulse.',
    fonts: ['700 22px "Space Grotesk"', '400 15px "Space Grotesk"', '800 20px "Syne"'],
    frameT: 4.6,
    duration: 5,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'Told as one long Bayer-style info-design sheet the camera tracks along and finally pulls back from, with thick bar-and-triangle arrows, tags that drop onto what they name, stamped Space Grotesk counters and a red ring drawn round the key moment.',
    explainer(ctx, W, HH, t) { explainBauhaus(ctx, W, HH, t); },
    // Sound: a workshop table. Wooden blocks set down for every shape, type sorts tapped in for letters, the big
    // sheet sliding along the drafting table between panels (with a stop clack), a numbering-machine counter and a
    // small wooden marimba for "right", the 97% and the takeaway. All times copied from explainBauhaus() above.
    explainerSound(k) {
      const D = 14.5, E = H.ease, cl = H.clamp;
      const S = (t, a, b) => cl((t - a) / (b - a), 0, 1);
      const pan = (px) => cl((px / 1280) * 2 - 1, -1, 1) * 0.7;
      // back-eased motion over [a, b] first reaches its final size at 37% of the way (then overshoots)
      const backLand = (a, b) => a + (b - a) * 0.37;
      // first time an eased progress over [a,b] reaches u
      const when = (a, b, ease, u) => { for (let i = 0; i <= 400; i++) if (ease(i / 400) >= u - 1e-6) return a + ((b - a) * i) / 400; return b; };
      // wooden block set down on the table: a knock with a little body
      const block = (t, f, g, p, minor) => { k.play('tock', t, { f, gain: 0.55 * g, pan: p, minor }); k.noise(t, { dur: 0.05, color: 'brown', filter: 'lowpass', f: 600, gain: 0.25 * g, pan: p, minor }); };
      // metal type sort tapped into the composing stick (no pitch, just a dry tap)
      const sort = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.022, filter: 'bandpass', f: 2100, q: 1.4, gain: 0.26 * g, a: 0.001, pan: p }); k.tone(t, { f: 210, dur: 0.035, gain: 0.08 * g, pan: p }); });
      // numbering machine: dry metal clack
      const numb = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.024, filter: 'bandpass', f: 2600, q: 1.6, gain: 0.3 * g, a: 0.001, pan: p }); k.tone(t, { f: 560, type: 'triangle', dur: 0.03, gain: 0.06 * g, pan: p }); });
      // the long sheet sliding along the drafting table, ending on a wooden stop
      const slide = (t, dur, g, stop) => {
        k.noise(t, { dur: dur + 0.1, color: 'pink', filter: 'bandpass', f: [[0, 260], [dur * 0.5, 620], [dur, 300]], q: 0.8, gain: 0.2 * g, a: dur * 0.45 });
        if (stop) block(t + dur, 260, 0.8 * g, 0, false);
      };
      // small wooden marimba bar: soft mallet, short ring (kept at or under ~1 kHz)
      const mar = (t, n, g, p, minor) => { const f = k.hz(n);
        k.tone(t, { f, dur: 0.75, gain: 0.2 * g, a: 0.003, pan: p, verb: 0.12, minor });
        if (f * 4 < 2400) k.tone(t, { f: f * 4, dur: 0.07, gain: 0.03 * g, a: 0.002, pan: p, minor });
        k.noise(t, { dur: 0.018, filter: 'lowpass', f: 1400, gain: 0.12 * g, pan: p, minor }); };

      k.bed('room', 0, D, { gain: 0.35 });

      // ---- panel 0: rule draws down (0-0.6), red disc snaps in (back 0.25-0.85), title is set letter by letter (0.1-1.0)
      k.noise(0.02, { dur: 0.55, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.55, 300]], q: 0.7, gain: 0.08, a: 0.05, pan: pan(63), minor: true });
      block(backLand(0.25, 0.85), 300, 1, pan(980), false);
      { const txt = 'how does ai learn?'; let last = -1;
        for (let n = 1; n <= txt.length; n++) { const t = 0.1 + (n / txt.length) * 0.9; if (txt[n - 1] === ' ' || t - last < 0.1) continue; sort(t, 1, pan(120 + (n % 9) * 45)); last = t; } }
      block(when(0.6, 1.0, E.out, 0.95), 640, 0.6, pan(1160), true); // yellow bar
      block(when(0.7, 1.1, E.out, 0.95), 520, 0.6, pan(840), true);  // blue triangle
      // title shrinks into the header (1.6-2.4): a soft card slide
      k.noise(1.6, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.7, 900]], q: 0.7, gain: 0.07, a: 0.3, pan: -0.4, minor: true });

      // ---- camera pans the sheet: 2.0-2.9, 5.8-6.6, 10.3-11.0
      slide(2.0, 0.9, 1, true);
      slide(5.8, 0.8, 1, true);
      slide(10.3, 0.7, 1, true);

      // ---- panel 1: DATA
      // cards set onto the conveyor at 2.6 + 0.52 i (x = 40 in panel)
      const cards = []; for (let i = 0; 2.6 + i * 0.52 < 5.55; i++) cards.push(2.6 + i * 0.52);
      cards.forEach((tc, i) => block(tc, 430 + (i % 2) * 70, 0.6, pan(40), true));
      block(backLand(3.3, 3.6), 560, 0.5, pan(330), true); // "training data" tag
      // counter n = S(2.9,5.6)^3 * 1e6, shown from 3.1: numbering clacks speeding up, not on top of card knocks
      for (let t = 3.15; t < 5.55; ) { const s = S(t, 2.9, 5.6); if (!cards.some((c) => t > c - 0.08 && t < c + 0.09)) numb(t, 0.7 + 0.4 * s, pan(320)); t += 0.16 - 0.075 * s; }
      k.play('stamp', 5.6, { gain: 0.7, pan: pan(320) }); // 1,000,000 lands

      // ---- panel 2: GUESS / CHECK / ADJUST
      k.noise(6.4, { dur: 0.45, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.45, 350]], q: 0.8, gain: 0.1, a: 0.08, pan: pan(660), minor: true }); // cat card slides in
      block(backLand(6.9, 7.25), 470, 0.9, pan(760), true);   // guess circle and "dog?" tag land together
      // the wrong guess: red X (7.55-7.75) — a hard block and a low clashing marimba pair
      k.play('stamp', 7.58, { gain: 0.8, pan: pan(648) });
      mar(7.6, 'E3', 1.1, pan(648)); mar(7.6, 'F3', 1.0, pan(648));
      // red ring drawn round the wrong guess (7.6-8.0): a ruling pen
      k.noise(7.62, { dur: 0.4, color: 'pink', filter: 'bandpass', f: [[0, 900], [0.2, 1400], [0.4, 900]], q: 0.9, gain: 0.07, a: 0.06, pan: pan(585), minor: true });
      // error square flies from check back to the dials (8.0-8.6), "error" tag appears on landing
      k.noise(8.0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.3, 800], [0.6, 300]], q: 1, gain: 0.12, a: 0.25, pan: pan(700) });
      block(8.6, 330, 0.9, pan(300), false);
      block(backLand(8.1, 8.45), 600, 0.6, pan(770), true); // adjust triangle
      // dials ratchet round (inOut 8.4-9.2): detents, at least 90 ms apart
      for (let i = 1, lt = 8.6; i <= 7; i++) { const t = when(8.4, 9.2, E.inOut, i / 7); if (t - lt < 0.09) continue; lt = t; k.play('click', t, { f: 1200, gain: 0.7, pan: pan(300), minor: true }); k.play('tock', t + 0.005, { f: 900 - i * 30, gain: 0.25, pan: pan(300), minor: true }); }
      block(backLand(9.35, 9.6), 650, 0.5, pan(545), true); // "cat" tag
      // the correction: check mark draws (9.6-9.85), face turns yellow — a rising wooden phrase
      mar(9.62, 'C5', 0.9, pan(618)); mar(9.72, 'G5', 0.9, pan(618)); mar(9.72, 'C4', 0.6, pan(618));

      // ---- panel 3: PROGRESS
      block(10.8, 340, 0.6, pan(1000), true); // 61% set
      // bars rise one by one at 10.9 + 0.14 i: an ascending wooden scale
      const bars = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'].map((n, i) => { const t = 10.9 + i * 0.14 + 0.02; mar(t, n, 0.32, pan(150 + i * 66), true); return t; });
      // accuracy 61 -> 97 (inOut over 10.9-12.3, changing all the way): one counter clack halfway between bar notes,
      // so bar and number alternate like an escapement; the number is still rolling at each of these
      bars.forEach((b) => { if (b + 0.07 < 12.25) numb(b + 0.07, 1.0, pan(1000)); });
      // 97%: the big hit, then the red ring is drawn round it (12.3-12.7)
      k.play('impact', 12.3, { gain: 1.2, pan: pan(1000) });
      ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => mar(12.31 + i * 0.012, n, 0.9, pan(1000) + (i - 1.5) * 0.1));
      k.noise(12.34, { dur: 0.4, color: 'pink', filter: 'bandpass', f: [[0, 900], [0.2, 1400], [0.4, 900]], q: 0.9, gain: 0.07, a: 0.06, pan: pan(1005), minor: true });

      // ---- pull back over the whole sheet (12.9-13.7), takeaway drops in (13.3-13.7), red arrow (13.5-13.8), yellow rule (13.6-14.0)
      slide(12.9, 0.8, 0.8, false);
      mar(13.48, 'G4', 0.6, -0.2, true); mar(13.48, 'D5', 0.5, 0.2, true); k.noise(13.48, { dur: 0.05, color: 'brown', filter: 'lowpass', f: 600, gain: 0.2, minor: true }); // takeaway lands
      ['C4', 'G4', 'C5', 'E5'].forEach((n, i) => mar(13.8 + i * 0.05, n, 0.8 - i * 0.08, (i - 1.5) * 0.25)); // resolves as the arrow lands
      k.noise(13.62, { dur: 0.4, color: 'pink', filter: 'bandpass', f: [[0, 350], [0.4, 650]], q: 0.8, gain: 0.08, a: 0.1, minor: true }); // yellow rule runs out
    },
    draw(ctx, W, HH, t) {
      const ease = H.ease.out, back = H.ease.back;
      const P = (d, dur = 0.7) => H.clamp((t - d) / dur, 0, 1);

      // ---------- paper ----------
      const paper = ctx.getImageData(0, 0, W, HH), pd = paper.data;
      const lo = cachedField('lo', W, HH, 11, 24, 4), fib = cachedField('fib', W, HH, 12, 2, 2, 3.5, 0.5), r0 = H.rng(5);
      const base = H.hex(C.cream), tan = H.hex('#c9ab78');
      for (let y = 0, p = 0; y < HH; y++) for (let x = 0; x < W; x++, p++) {
        const ex = Math.min(x, W - x) / W, ey = Math.min(y, HH - y) / HH;
        const edge = Math.pow(1 - H.clamp(Math.min(ex * 3.2, ey * 2.2) + lo[p] * 0.15, 0, 1), 3);
        const k = 0.35 * edge + 0.12 * Math.max(0, lo[p]);
        const s = 1 + fib[p] * 0.035 + (r0() - 0.5) * 0.04;
        const i = p * 4;
        pd[i] = (base[0] + (tan[0] - base[0]) * k) * s; pd[i + 1] = (base[1] + (tan[1] - base[1]) * k) * s; pd[i + 2] = (base[2] + (tan[2] - base[2]) * k) * s; pd[i + 3] = 255;
      }
      ctx.putImageData(paper, 0, 0);
      // foxing spots
      const rf = H.rng(77);
      for (let i = 0; i < 26; i++) {
        const x = rf.range(0, W), y = rf.range(0, HH), rr = rf.range(2, 10);
        const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
        g.addColorStop(0, 'rgba(140,90,40,0.22)'); g.addColorStop(1, 'rgba(140,90,40,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
      }

      // ---------- ink layer (knockout composition, per-colour misregistration) ----------
      const L = H.layer(W, HH), c = L.getContext('2d');
      const reg = { yellow: [2, -1], red: [-1.5, 1], blue: [1, 2], black: [0, 0] };
      const ink = (col, fn) => { c.save(); c.translate(reg[col][0], reg[col][1]); c.fillStyle = C[col]; c.strokeStyle = C[col]; fn(); c.restore(); };

      const cx = 470, cy = 360; // face centre
      // grid rules
      ink('black', () => {
        const a = ease(P(0.0, 0.8));
        c.fillRect(56, 56, 14, (HH - 112) * a);                 // left rule
        c.fillRect(56, HH - 70, (W - 112) * a, 14);            // base rule
        c.fillRect(760, 56, 6, 470 * a);                       // column divider
        c.fillRect(760, 520, 480 * a, 6);
      });
      ink('black', () => {
        // diagonal construction rule running behind the figure into the halo
        const s = ease(P(0.1, 0.9)); c.save(); c.translate(70, HH - 70); c.rotate(-Math.PI * 0.3); c.fillRect(0, -5, 640 * s, 10); c.restore();
      });
      // big yellow disc (halo)
      ink('yellow', () => { const s = back(P(0.2)); c.beginPath(); c.arc(cx + 60, cy - 50, 235 * s, 0, 7); c.fill(); });
      // red semicircle shoulders
      ink('red', () => {
        const s = ease(P(0.5)); c.beginPath(); c.arc(cx, HH - 70, 250, Math.PI, 0); c.closePath();
        c.save(); c.beginPath(); c.rect(0, HH - 70 - 250 * s, W, 250 * s + 1); c.clip();
        c.beginPath(); c.arc(cx, HH - 70, 250, Math.PI, 0); c.closePath(); c.fill(); c.restore();
      });
      // neck
      ink('black', () => { const s = ease(P(0.6)); c.fillRect(cx - 50, 520, 100, 60 * s); });
      ink('yellow', () => { if (P(0.9) > 0) { c.fillRect(cx - 50, 538, 100, 8); c.fillRect(cx - 50, 556, 100, 8); } });
      // head: blue square
      const hs = 300, hx = cx - hs / 2, hy = 220 - (1 - ease(P(0.35))) * 620;
      ink('blue', () => { c.fillRect(hx, hy, hs, hs); });
      // ears: semicircles
      ink('red', () => { const s = back(P(0.9)); c.beginPath(); c.arc(hx, hy + 150, 56 * s, Math.PI / 2, Math.PI * 1.5); c.closePath(); c.fill(); });
      ink('black', () => { const s = back(P(1.0)); c.beginPath(); c.arc(hx + hs, hy + 150, 56 * s, -Math.PI / 2, Math.PI / 2); c.closePath(); c.fill(); });
      // antenna
      ink('black', () => { const s = ease(P(1.1)); c.fillRect(cx - 6, hy - 75 * s, 12, 75 * s); });
      ink('red', () => { const s = back(P(1.4)); c.beginPath(); c.arc(cx, hy - 82, 24 * s, 0, 7); c.fill(); });
      // radio waves: concentric semicircle arcs (pulse with t)
      ink('black', () => {
        const ph = (t * 0.6) % 1;
        c.lineWidth = 9; c.lineCap = 'butt';
        for (let k = 0; k < 3; k++) {
          const rr = 44 + k * 22 + ph * 22; const al = H.clamp(P(1.6 + k * 0.15) * (k === 2 ? 1 - ph : 1), 0, 1);
          if (al <= 0) continue; c.globalAlpha = al;
          c.beginPath(); c.arc(cx, hy - 82, rr, -Math.PI * 0.95, -Math.PI * 0.62); c.stroke();
          c.beginPath(); c.arc(cx, hy - 82, rr, -Math.PI * 0.38, -Math.PI * 0.05); c.stroke();
        }
        c.globalAlpha = 1;
      });
      // eyes
      const look = Math.sin(t * 1.3) * 0.5 + 0.5; // 0..1 -> look right
      ink('yellow', () => { const s = back(P(1.2)); c.beginPath(); c.arc(hx + 85, hy + 105, 52 * s, 0, 7); c.fill(); });
      ink('red', () => { const s = back(P(1.3)); c.fillRect(hx + hs - 85 - 52 * s, hy + 105 - 52 * s, 104 * s, 104 * s); });
      ink('black', () => {
        const s = back(P(1.5)), dx = H.lerp(-8, 18, look);
        c.beginPath(); c.arc(hx + 85 + dx, hy + 105, 22 * s, 0, 7); c.fill();
        c.beginPath(); c.arc(hx + hs - 85 + dx, hy + 105, 22 * s, 0, 7); c.fill();
      });
      // nose: yellow triangle
      ink('yellow', () => { const s = back(P(1.6)); c.beginPath(); c.moveTo(cx - 28 * s, hy + 150); c.lineTo(cx + 28 * s, hy + 150); c.lineTo(cx, hy + 150 + 50 * s); c.closePath(); c.fill(); });
      // mouth grille
      ink('black', () => {
        const s = ease(P(1.7)); c.fillRect(cx - 95, hy + 222, 190 * s, 46);
      });
      ink('blue', () => { const s = P(1.9); for (let i = 0; i < 5; i++) if (s > i / 5) c.fillRect(cx - 78 + i * 34, hy + 230, 14, 30); });

      // ---------- right column: lettering ----------
      ink('black', () => {
        // constructed letters are set one by one, each dropped onto the baseline like a block of type
        let x = 790; const base = 340, xh = 90, sw = 23;
        [...'robot'].forEach((ch, i) => {
          const p = P(1.95 + i * 0.11, 0.2);
          c.save(); c.globalAlpha = p > 0 ? 1 : 0; c.translate(0, -(1 - back(p)) * 40);
          const adv = letter(c, ch, x, base, xh, sw); c.restore();
          x += adv + 12;
        });
      });
      ink('red', () => {
        const s = back(P(2.35, 0.5)); c.fillRect(792, 380, 120 * s, 120 * s);
      });
      ink('black', () => {
        c.font = '700 22px "Space Grotesk"'; c.textBaseline = 'alphabetic';
        c.globalAlpha = P(2.55, 0.25); c.fillText('a new form', 932, 404);
        c.globalAlpha = P(2.65, 0.25); c.fillText('for a new mind', 932, 430);
        c.font = '400 15px "Space Grotesk"';
        c.globalAlpha = P(2.8, 0.25); c.fillText('ausstellung · exhibition', 932, 466);
        c.globalAlpha = P(2.88, 0.25); c.fillText('09.10 — 31.12.2026', 932, 488);
        c.font = '800 20px "Syne"';
        c.globalAlpha = P(2.45, 0.25); c.fillText('nr. 4', 1170, 100);
        c.globalAlpha = 1;
      });
      ink('blue', () => { const s = ease(P(2.4, 0.5)); c.beginPath(); c.arc(1185, 175, 40 * s, Math.PI / 2, Math.PI * 1.5); c.closePath(); c.fill(); });
      ink('yellow', () => { const s = ease(P(2.5, 0.5)); c.fillRect(1190, 135, 40 * s, 80); });
      // vertical rotated label on left rule
      ink('black', () => {
        c.save(); c.translate(100, 330); c.rotate(-Math.PI / 2); c.font = '700 22px "Space Grotesk"'; c.globalAlpha = P(3.0, 0.3);
        c.fillText('maschine und mensch', 0, 0); c.restore();
      });
      ink('red', () => { c.fillRect(84, 56, 30, 30 * ease(P(3.1, 0.3))); });

      inkify(L, 21, 0.22, 0.004);
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0); ctx.restore();

      // ---------- finish: fold creases, wear, grain ----------
      const crease = (x0, y0, x1, y1, wdt) => {
        const g = ctx.createLinearGradient(x0 - (y1 - y0 ? wdt : 0), y0 - (y1 - y0 ? 0 : wdt), x0 + (y1 - y0 ? wdt : 0), y0 + (y1 - y0 ? 0 : wdt));
        g.addColorStop(0, 'rgba(255,250,235,0)'); g.addColorStop(0.45, 'rgba(255,250,235,0.18)'); g.addColorStop(0.55, 'rgba(70,50,30,0.14)'); g.addColorStop(1, 'rgba(70,50,30,0)');
        ctx.fillStyle = g;
        if (x0 === x1) ctx.fillRect(x0 - wdt, 0, wdt * 2, HH); else ctx.fillRect(0, y0 - wdt, W, wdt * 2);
      };
      crease(W / 2 + 3, 0, W / 2 + 3, HH, 7);
      crease(0, HH / 2 - 2, W, HH / 2 - 2, 6);
      // scuffs along the folds
      const rs = H.rng(31); ctx.fillStyle = 'rgba(245,238,220,0.5)';
      for (let i = 0; i < 260; i++) { const along = rs.range(0, 1); if (rs() < 0.5) ctx.fillRect(W / 2 + 2 + rs.gauss() * 1.2, along * HH, 1.2, rs.range(1, 4)); else ctx.fillRect(along * W, HH / 2 - 2 + rs.gauss() * 1.2, rs.range(1, 4), 1.2); }
      H.grain(ctx, W, HH, 0.07, 9 + Math.floor(t * 12), true);
      H.vignette(ctx, W, HH, 0.18, '60,40,20');
    },
  });
}
```
