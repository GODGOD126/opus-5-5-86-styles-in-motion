I want an animated explainer made in the "Napkin Sketch" visual style (Hand-Drawn). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Permanent Marker
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=block">
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
Name: Napkin Sketch
Family: Hand-Drawn
Look: A back-of-the-napkin startup pitch in black Sharpie: ink feathering into soft tissue fibers, an embossed napkin border, quarter-fold creases and crumples, a coffee ring, all lying on a warm wooden cafe table.
Motion: The marker scrawls each box and arrow in quick confident strokes while ink slowly feathers outward; the napkin breathes slightly as if just set down.
How it explains: A cafe-table pitch: the camera starts tight on the scrawled question then pulls back to the napkin; when a napkin is full a fresh one is slapped down on top of the pile (with a red Sharpie for the wrong guess and the 97%), arrows and numbers are fast Sharpie scrawls that feather into the tissue.

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

REFERENCE STYLE SOURCE (styles/napkin-sketch.js; W/H_ are always 1280x720)
```js
// Napkin Sketch — Sharpie startup idea on a crumpled cafe napkin.
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
  const wob = (pts, nz, seed, amp = 1.6, freq = 0.012) => {
    const N = normals(pts); let L = 0;
    return pts.map((p, i) => {
      if (i) L += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      const o = nz.n2(L * freq + seed * 1.37, seed * 0.71) * amp + nz.n2(L * freq * 6 + seed, seed + 3.3) * amp * 0.3;
      return [p[0] + N[i][0] * o, p[1] + N[i][1] * o];
    });
  };
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2) => {
    const n = Math.max(10, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 2.5)), out = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return out;
  };
  const quad = (p0, p1, p2, n = 40) => {
    const out = [];
    for (let i = 0; i <= n; i++) { const t = i / n, m = 1 - t; out.push([m * m * p0[0] + 2 * m * t * p1[0] + t * t * p2[0], m * m * p0[1] + 2 * m * t * p1[1] + t * t * p2[1]]); }
    return out;
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
  registerStyle({
    id: 'napkin-sketch',
    name: 'Napkin Sketch',
    category: 'Hand-Drawn',
    description: 'A back-of-the-napkin startup pitch in black Sharpie: ink feathering into soft tissue fibers, an embossed napkin border, quarter-fold creases and crumples, a coffee ring, all lying on a warm wooden cafe table.',
    motion: 'The marker scrawls each box and arrow in quick confident strokes while ink slowly feathers outward; the napkin breathes slightly as if just set down.',
    fonts: ['400 54px "Permanent Marker"', '400 30px "Permanent Marker"', '400 26px "Permanent Marker"'],
    frameT: 5.9,
    duration: 6,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(64);

      // ---------- wooden table (half-res, per pixel) ----------
      {
        const w2 = W / 2, h2 = H_ / 2, wl = H.layer(w2, h2), wc = wl.getContext('2d');
        const id = wc.createImageData(w2, h2), d = id.data, rr = H.rng(3);
        const PL = 92; // plank height (half-res)
        const tints = [0, 1, 2, 3, 4, 5].map(() => [rr.range(-12, 12), rr.range(-0.4, 0.4)]);
        for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) {
          const pi = Math.floor((y + 20) / PL), py = (y + 20) % PL;
          const [tint, ph] = tints[pi % tints.length];
          const warp = nz.fbm2(x * 0.0025 + pi * 7, py * 0.012 + pi, 3) * 5.5;
          const ring = Math.sin((py * 0.07 + warp + ph * 3) * Math.PI * 2);
          const fine = nz.n2(x * 0.012 + pi * 5, y * 0.55) * 0.6 + nz.n2(x * 0.05, y * 1.3) * 0.25;
          let v = 0.5 + 0.16 * Math.sign(ring) * Math.pow(Math.abs(ring), 0.4) + 0.14 * fine + nz.n2(x * 0.004, y * 0.02 + pi) * 0.12;
          const r0 = 118 + tint, g0 = 74 + tint * 0.6, b0 = 42 + tint * 0.3;
          let r = r0 * (0.75 + 0.5 * v), g = g0 * (0.75 + 0.5 * v), b = b0 * (0.78 + 0.45 * v);
          if (py < 2 || py > PL - 2) { r *= 0.35; g *= 0.3; b *= 0.3; }
          const i = (y * w2 + x) * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
        }
        wc.putImageData(id, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.drawImage(wl, 0, 0, W, H_);
        // varnish sheen from a window
        const sh = ctx.createLinearGradient(0, 0, W, H_);
        sh.addColorStop(0, 'rgba(255,230,190,0.16)'); sh.addColorStop(0.4, 'rgba(255,230,190,0.02)'); sh.addColorStop(1, 'rgba(20,8,0,0.25)');
        ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H_);
      }

      // ---------- napkin geometry ----------
      const NW = 600, NH = 576, NCX = 548, NCY = 368, NR = -0.06;
      const toCanvas = (u, v) => {
        const x = u - NW / 2, y = v - NH / 2, c = Math.cos(NR), s = Math.sin(NR);
        return [NCX + x * c - y * s, NCY + x * s + y * c];
      };
      const toLocal = (X, Y) => {
        const x = X - NCX, y = Y - NCY, c = Math.cos(-NR), s = Math.sin(-NR);
        return [x * c - y * s + NW / 2, x * s + y * c + NH / 2];
      };
      const setLocal = (c) => { c.translate(NCX, NCY); c.rotate(NR); c.translate(-NW / 2, -NH / 2); };
      // deckled outline
      const outline = [];
      {
        const edge = (x0, y0, x1, y1, s) => {
          const n = 60;
          for (let i = 0; i < n; i++) {
            const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u;
            const o = nz.n2(u * 9 + s, s) * 2.2 + nz.n2(u * 60, s + 1) * 0.8;
            const nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny);
            outline.push([x + nx / l * o, y + ny / l * o]);
          }
        };
        edge(4, 0, NW - 2, 6, 1); edge(NW, 4, NW - 6, NH - 2, 2); edge(NW - 4, NH, 2, NH - 4, 3); edge(0, NH - 2, 6, 6, 4);
      }
      const napPath = (c) => { c.beginPath(); outline.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };

      // shadow on the table
      ctx.save(); ctx.filter = 'blur(10px)'; ctx.translate(7, 10); setLocal(ctx); napPath(ctx);
      ctx.fillStyle = 'rgba(25,10,0,0.55)'; ctx.fill(); ctx.restore();

      // napkin body layer
      const NL = H.layer(W, H_), nc = NL.getContext('2d');
      nc.save(); setLocal(nc); napPath(nc); nc.fillStyle = '#f6f5f0'; nc.fill(); nc.restore();
      // tissue fiber texture
      {
        const rr = H.rng(21);
        nc.save(); setLocal(nc); napPath(nc); nc.clip();
        for (let i = 0; i < 2600; i++) {
          const x = rr.range(0, NW), y = rr.range(0, NH), a = rr.range(0, 6.28), l = rr.range(3, 10);
          nc.strokeStyle = rr.chance(0.5) ? 'rgba(180,175,165,0.08)' : 'rgba(255,255,255,0.35)';
          nc.lineWidth = 0.7; nc.beginPath(); nc.moveTo(x, y); nc.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); nc.stroke();
        }
        nc.restore();
      }

      // ---------- emboss pattern ----------
      {
        const EM = H.layer(W, H_), ec = EM.getContext('2d');
        ec.save(); setLocal(ec); ec.strokeStyle = '#000'; ec.fillStyle = '#000'; ec.lineWidth = 2;
        const inset = (k) => { ec.beginPath(); ec.roundRect(k, k, NW - 2 * k, NH - 2 * k, 6); ec.stroke(); };
        inset(16); inset(52); ec.lineWidth = 1.2; inset(20);
        const ring = (x, y) => {
          ec.lineWidth = 1.6;
          for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; ec.beginPath(); ec.ellipse(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 5, 3, a, 0, 7); ec.stroke(); }
          ec.beginPath(); ec.arc(x, y, 1.6, 0, 7); ec.fill();
        };
        const step = 34;
        for (let x = 34 + step; x < NW - 34 - 10; x += step) { ring(x, 34); ring(x, NH - 34); }
        for (let y = 34 + step; y < NH - 34 - 10; y += step) { ring(34, y); ring(NW - 34, y); }
        [[34, 34], [NW - 34, 34], [34, NH - 34], [NW - 34, NH - 34]].forEach(([x, y]) => { ec.lineWidth = 1.6; ec.beginPath(); ec.arc(x, y, 9, 0, 7); ec.stroke(); ring(x, y); });
        // fine quilted dot grid in the field
        for (let y = 70; y < NH - 60; y += 16) for (let x = 70 + ((y / 16) % 2) * 8; x < NW - 60; x += 16) { ec.beginPath(); ec.arc(x, y, 0.9, 0, 7); ec.fill(); }
        ec.restore();
        const tint = (col, dx, dy, a) => {
          const tl = H.layer(W, H_), tc = tl.getContext('2d');
          tc.drawImage(EM, dx, dy); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, W, H_);
          nc.save(); nc.globalAlpha = a; nc.drawImage(tl, 0, 0); nc.restore();
        };
        tint('#8f8a80', 1.1, 1.3, 0.35);
        tint('#ffffff', -1, -1.1, 0.9);
        nc.save(); nc.globalCompositeOperation = 'source-atop'; nc.globalAlpha = 0.05; nc.drawImage(EM, 0, 0); nc.restore();
      }

      // ---------- coffee ring stain ----------
      {
        const RL = H.layer(W, H_), rc = RL.getContext('2d');
        rc.save(); setLocal(rc);
        const ring = (cx, cy, R, a) => {
          for (let k = 0; k < 3; k++) {
            const r = R + k * 1.4;
            const g = rc.createRadialGradient(cx, cy, r - 16, cx, cy, r + 2);
            g.addColorStop(0, 'rgba(150,95,45,0)'); g.addColorStop(0.7, `rgba(150,95,45,${a * 0.25})`);
            g.addColorStop(0.92, `rgba(120,70,30,${a})`); g.addColorStop(1, 'rgba(120,70,30,0)');
            rc.fillStyle = g; rc.beginPath(); rc.arc(cx + k * 0.8, cy - k * 0.6, r + 2, 0, 7); rc.fill();
          }
          const g2 = rc.createRadialGradient(cx, cy, 0, cx, cy, R);
          g2.addColorStop(0, `rgba(170,120,60,${a * 0.07})`); g2.addColorStop(1, `rgba(170,120,60,${a * 0.12})`);
          rc.fillStyle = g2; rc.beginPath(); rc.arc(cx, cy, R - 2, 0, 7); rc.fill();
        };
        ring(488, 128, 60, 0.55);
        ring(512, 146, 59, 0.22);
        rc.restore();
        // partial: fade part of the ring away (cup was tilted)
        rc.globalCompositeOperation = 'destination-in';
        const [cxw, cyw] = toCanvas(488, 128);
        const cg = rc.createConicGradient(0.6, cxw, cyw);
        cg.addColorStop(0, 'rgba(0,0,0,1)'); cg.addColorStop(0.55, 'rgba(0,0,0,1)'); cg.addColorStop(0.72, 'rgba(0,0,0,0.15)'); cg.addColorStop(0.86, 'rgba(0,0,0,0.6)'); cg.addColorStop(1, 'rgba(0,0,0,1)');
        rc.fillStyle = cg; rc.fillRect(0, 0, W, H_);
        nc.save(); nc.globalCompositeOperation = 'multiply'; nc.drawImage(RL, 0, 0); nc.restore();
      }

      // ---------- Sharpie ink ----------
      const IL = H.layer(W, H_), ic = IL.getContext('2d');
      ic.save(); setLocal(ic);
      ic.lineCap = 'round'; ic.lineJoin = 'round'; ic.strokeStyle = 'rgb(22,20,28)'; ic.fillStyle = 'rgb(22,20,28)';
      // stroke clock: quick, confident Sharpie strokes one after another
      let clock = 0.25, TIP = null;
      const slot = (dur) => { const a = clock; clock += dur; return H.clamp((t - a) / dur); };
      const ink = (pts, w = 5, s = 1, amp = 1.4) => {
        const P = wob(seg(pts), nz, s, amp);
        let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
        const pr = slot(Math.max(0.05, L / 1900) + 0.025);
        if (pr <= 0) return P;
        const Q = pr < 1 ? P.slice(0, Math.max(2, Math.ceil(P.length * pr))) : P;
        if (pr < 1) TIP = Q[Q.length - 1];
        ic.lineWidth = w; ic.beginPath(); Q.forEach(([x, y], i) => (i ? ic.lineTo(x, y) : ic.moveTo(x, y))); ic.stroke();
        return P;
      };
      const arrow = (pts, s, w = 5, hl = 18) => {
        const P = ink(pts, w, s);
        const a = P[P.length - 1], b = P[Math.max(0, P.length - 8)], an = Math.atan2(a[1] - b[1], a[0] - b[0]);
        ink([[a[0] - Math.cos(an - 0.55) * hl, a[1] - Math.sin(an - 0.55) * hl], a, [a[0] - Math.cos(an + 0.55) * hl, a[1] - Math.sin(an + 0.55) * hl]], w, s + 100, 0.5);
      };
      const txt = (str, x, y, size, rot, s) => {
        ic.save(); ic.font = `400 ${size}px "Permanent Marker"`; ic.translate(x, y); ic.rotate(rot);
        const rr = H.rng(s); let px = 0;
        const pr = slot(str.length * 0.034), nCh = Math.ceil(str.length * pr);
        if (pr > 0 && pr < 1) { const ww = ic.measureText(str.slice(0, nCh)).width; TIP = [x + ww * Math.cos(rot), y + ww * Math.sin(rot) - size * 0.3]; }
        let ci = 0;
        for (const ch of str) { const w = ic.measureText(ch).width; if (ci++ >= nCh) { px += w; continue; } ic.save(); ic.translate(px, rr.range(-1.5, 1.5)); ic.rotate(rr.range(-0.05, 0.05)); ic.fillText(ch, 0, 0); ic.restore(); px += w + rr.range(-1, 1.5); }
        ic.restore(); return px;
      };
      // title
      const tw = txt('THE BIG IDEA', 78, 128, 54, -0.03, 1);
      ink([[74, 146], [80 + tw * 0.55, 140], [78 + tw, 134]], 4.5, 2, 1.8);
      ink([[96, 160], [80 + tw * 0.6, 154], [70 + tw, 150]], 4, 3, 1.8);
      // stick person + speech bubble
      ink(ell(112, 236, 22, 24, -1.6, 4.75), 5, 4, 0.8);
      ink([[112, 262], [110, 330]], 5, 5); ink([[80, 290], [112, 282], [146, 292]], 5, 6); ink([[86, 378], [110, 330], [138, 376]], 5, 7);
      ink([[160, 200], [168, 178], [196, 166], [280, 168], [300, 188], [296, 218], [270, 232], [196, 234], [182, 252], [178, 230], [162, 222], [158, 202]], 4.5, 8, 0.8);
      txt('ugh!!', 190, 214, 30, -0.04, 9);
      // arrow to AI box
      arrow([[300, 260], [336, 262], [362, 258]], 10);
      // robot head box
      ink([[372, 210], [470, 206], [474, 304], [368, 308], [372, 202]], 5, 11, 1.2);
      ink([[420, 206], [422, 180]], 4.5, 12); ink(ell(422, 172, 8, 8), 4, 13, 0.3);
      ink(ell(400, 244, 9, 9), 4.5, 14, 0.3); ink(ell(444, 242, 9, 9), 4.5, 15, 0.3);
      ink([[396, 278], [410, 284], [430, 284], [448, 276]], 4.5, 16, 0.6);
      txt('AI', 398, 342, 30, 0.02, 17);
      // arrow down into the chart
      arrow(quad([480, 300], [540, 320], [520, 372]), 18, 5, 16);
      // hockey-stick chart
      ink([[268, 384], [266, 522], [520, 520]], 4.5, 19, 1);
      const hs = quad([278, 508], [430, 506], [505, 392], 30);
      arrow(hs, 20, 5.5, 18);
      txt('$$$', 400, 420, 30, -0.1, 21);
      ink(ell(432, 410, 50, 28, -2.5, 3.9), 4, 22, 1.4);
      txt('users', 298, 552, 26, 0, 23);
      // notes bottom-left with a scribbled-out word
      txt('MVP in', 74, 452, 26, -0.04, 24);
      const ww = txt('3', 186, 446, 26, -0.04, 25);
      { const rz = H.rng(5), P = []; for (let k = 0; k < 13; k++) P.push([178 + (k % 2) * 28 + rz.range(-4, 4), 420 + k * 2.4 + rz.range(-3, 3)]); ink(P, 3.5, 26, 0.6); }
      txt('2 wks?', 74, 490, 26, -0.04, 27);
      ic.restore();
      const BUILD_END = clock;

      // feathering: fiber-shaped bleed + soft halo + sharp core
      {
        const FB = H.layer(W, H_), fc = FB.getContext('2d'), rr = H.rng(44);
        fc.strokeStyle = '#000'; fc.lineWidth = 0.9;
        for (let i = 0; i < 42000; i++) {
          const x = rr.range(80, 900), y = rr.range(40, 690), a = rr.range(0, 6.28), l = rr.range(1.5, 5);
          fc.beginPath(); fc.moveTo(x, y); fc.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); fc.stroke();
        }
        const BL = H.layer(W, H_), bc = BL.getContext('2d');
        const soak = H.smooth(0.3, BUILD_END + 1.2, t); // ink keeps wicking into the fibres
        bc.filter = `blur(${(1.2 + 2.2 * soak).toFixed(2)}px)`; bc.drawImage(IL, 0, 0); bc.drawImage(IL, 0, 0); bc.filter = 'none';
        bc.globalCompositeOperation = 'destination-in'; bc.drawImage(FB, 0, 0);
        nc.save(); nc.globalAlpha = 0.2 + 0.3 * soak; nc.drawImage(BL, 0, 0); nc.restore();
        nc.save(); nc.filter = 'blur(2.2px)'; nc.globalAlpha = 0.85; nc.drawImage(IL, 0, 0); nc.restore();
        // core: slightly uneven absorption
        const CO = H.layer(W, H_), co = CO.getContext('2d');
        co.drawImage(IL, 0, 0);
        co.globalCompositeOperation = 'destination-out';
        const r2 = H.rng(45);
        for (let i = 0; i < 9000; i++) { co.fillStyle = `rgba(0,0,0,${r2.range(0.05, 0.3)})`; co.fillRect(r2.range(60, 920), r2.range(30, 700), r2.range(1, 3), r2.range(1, 3)); }
        nc.save(); nc.globalAlpha = 0.92; nc.drawImage(CO, 0, 0); nc.restore();
      }

      // ---------- crumple + fold lighting ----------
      {
        const s = 2, gw = Math.ceil(W / s), gh = Math.ceil(H_ / s);
        const hf = new Float32Array(gw * gh);
        const creases = [];
        { const rr = H.rng(9); for (let i = 0; i < 7; i++) creases.push([rr.range(0, NW), rr.range(0, NH), rr.range(0, Math.PI), rr.range(2, 5) * (rr.chance(0.5) ? 1 : -1), rr.range(80, 260)]); }
        for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
          const [u, v] = toLocal(x * s, y * s);
          if (u < -10 || v < -10 || u > NW + 10 || v > NH + 10) continue;
          let h = nz.fbm2(u * 0.009 + 3, v * 0.009, 4) * 11;
          const r1 = 1 - Math.abs(nz.n2(u * 0.018 + 9, v * 0.018)), r2 = 1 - Math.abs(nz.n2(u * 0.042 + 5, v * 0.042 + 2));
          h += r1 * r1 * 4.5 + r2 * r2 * 1.2;
          const du = Math.abs(u - NW / 2 - 4), dv = Math.abs(v - NH / 2 + 6);
          h += 8 * Math.max(0, 1 - du / 22);        // vertical fold: ridge
          h -= 7 * Math.max(0, 1 - dv / 20);        // horizontal fold: valley
          for (const [cx, cy, a, amp, len] of creases) {
            const dx = u - cx, dy = v - cy, along = dx * Math.cos(a) + dy * Math.sin(a), across = -dx * Math.sin(a) + dy * Math.cos(a);
            const fall = Math.max(0, 1 - Math.abs(along) / len);
            h += amp * 0.6 * fall * Math.max(0, 1 - Math.abs(across) / 14);
          }
          // edges curl up a little
          const ed = Math.min(u, v, NW - u, NH - v);
          h += 6 * Math.max(0, 1 - ed / 40);
          hf[y * gw + x] = h;
        }
        const SL = H.layer(gw, gh), sc = SL.getContext('2d'), sid = sc.createImageData(gw, gh), sd = sid.data;
        const HLt = H.layer(gw, gh), hc = HLt.getContext('2d'), hid = hc.createImageData(gw, gh), hd = hid.data;
        const Lx = -0.55, Ly = -0.6, Lz = 0.58;
        for (let y = 1; y < gh - 1; y++) for (let x = 1; x < gw - 1; x++) {
          const i = y * gw + x;
          const gx = (hf[i + 1] - hf[i - 1]) / (2 * s), gy = (hf[i + gw] - hf[i - gw]) / (2 * s);
          const nl = Math.hypot(gx, gy, 1), nxv = -gx / nl, nyv = -gy / nl, nzv = 1 / nl;
          const lam = nxv * Lx + nyv * Ly + nzv * Lz, flat = Lz;
          const dlt = (lam - flat) * 1.35;
          const j = i * 4;
          if (dlt < 0) { sd[j] = 70; sd[j + 1] = 64; sd[j + 2] = 58; sd[j + 3] = Math.min(255, -dlt * 255); }
          else { hd[j] = 255; hd[j + 1] = 255; hd[j + 2] = 252; hd[j + 3] = Math.min(255, dlt * 200); }
        }
        sc.putImageData(sid, 0, 0); hc.putImageData(hid, 0, 0);
        nc.save(); nc.globalCompositeOperation = 'source-atop'; nc.imageSmoothingEnabled = true;
        nc.drawImage(SL, 0, 0, W, H_); nc.globalAlpha = 0.6; nc.drawImage(HLt, 0, 0, W, H_); nc.restore();
      }
      // overall soft falloff on the napkin + crisp edge
      nc.save(); nc.globalCompositeOperation = 'source-atop';
      const fo = nc.createRadialGradient(480, 260, 120, 560, 380, 520);
      fo.addColorStop(0, 'rgba(255,255,255,0)'); fo.addColorStop(1, 'rgba(90,80,70,0.16)');
      nc.fillStyle = fo; nc.fillRect(0, 0, W, H_); nc.restore();
      ctx.drawImage(NL, 0, 0);
      ctx.save(); setLocal(ctx); napPath(ctx); ctx.strokeStyle = 'rgba(120,110,95,0.35)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();

      // ---------- coffee cup on saucer (top right) ----------
      {
        const cx = 1128, cy = 150;
        ctx.save(); ctx.filter = 'blur(14px)'; ctx.fillStyle = 'rgba(20,8,0,0.55)';
        ctx.beginPath(); ctx.arc(cx + 18, cy + 22, 156, 0, 7); ctx.fill(); ctx.restore();
        const sg = ctx.createRadialGradient(cx - 50, cy - 60, 20, cx, cy, 160);
        sg.addColorStop(0, '#ffffff'); sg.addColorStop(0.7, '#ebe9e4'); sg.addColorStop(1, '#bfbab2');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, 158, 0, 7); ctx.fill();
        const wellG = ctx.createRadialGradient(cx + 20, cy + 20, 60, cx, cy, 110);
        wellG.addColorStop(0, 'rgba(0,0,0,0)'); wellG.addColorStop(0.9, 'rgba(120,110,100,0.18)'); wellG.addColorStop(1, 'rgba(255,255,255,0.4)');
        ctx.fillStyle = wellG; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, 7); ctx.fill();
        // handle
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(2.35);
        ctx.fillStyle = 'rgba(40,20,5,0.3)'; ctx.beginPath(); ctx.roundRect(86, -8, 52, 26, 12); ctx.fill();
        const hg = ctx.createLinearGradient(0, -14, 0, 14); hg.addColorStop(0, '#ffffff'); hg.addColorStop(1, '#c9c4bb');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.roundRect(80, -14, 52, 26, 12); ctx.fill();
        ctx.restore();
        // cup shadow + body
        ctx.save(); ctx.filter = 'blur(6px)'; ctx.fillStyle = 'rgba(60,40,20,0.35)'; ctx.beginPath(); ctx.arc(cx + 10, cy + 12, 92, 0, 7); ctx.fill(); ctx.restore();
        const cg = ctx.createRadialGradient(cx - 40, cy - 40, 10, cx, cy, 92);
        cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.8, '#efece6'); cg.addColorStop(1, '#c6c0b6');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, 90, 0, 7); ctx.fill();
        // coffee
        const cf = ctx.createRadialGradient(cx - 10, cy - 10, 5, cx, cy, 76);
        cf.addColorStop(0, '#6b3e1e'); cf.addColorStop(0.75, '#4a2810'); cf.addColorStop(0.92, '#9a6a3c'); cf.addColorStop(1, '#3a1e0a');
        ctx.fillStyle = cf; ctx.beginPath(); ctx.arc(cx, cy, 76, 0, 7); ctx.fill();
        // latte heart
        ctx.save(); ctx.translate(cx + 4, cy + 4); ctx.rotate(0.4);
        ctx.fillStyle = 'rgba(232,206,170,0.92)';
        ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-46, 0, -34, -38, 0, -16); ctx.bezierCurveTo(34, -38, 46, 0, 0, 30); ctx.fill();
        ctx.strokeStyle = 'rgba(120,70,30,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, 36); ctx.stroke();
        ctx.restore();
        // rim highlight + inner shadow
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 82, 3.4, 5.2); ctx.stroke();
        ctx.strokeStyle = 'rgba(60,30,10,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx + 2, cy + 2, 74, 0, 7); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(cx - 30, cy - 36, 16, 6, -0.7, 0, 7); ctx.fill();
      }

      // ---------- steam curling off the coffee (ambient) ----------
      {
        const SL = H.layer(W, H_), sc = SL.getContext('2d');
        sc.lineCap = 'round';
        for (let k = 0; k < 5; k++) {
          const ph = k * 1.3, life = ((t * 0.35 + k / 5) % 1);
          const bx = 1095 + k * 14, by = 200 - life * 150;
          sc.strokeStyle = `rgba(255,250,240,${0.65 * Math.sin(life * Math.PI)})`; sc.lineWidth = 10 + life * 18;
          sc.beginPath();
          for (let j = 0; j <= 12; j++) {
            const u = j / 12, y = by + 40 - u * 110, x = bx + Math.sin(u * 4 + t * 1.6 + ph) * (10 + 26 * u);
            j ? sc.lineTo(x, y) : sc.moveTo(x, y);
          }
          sc.stroke();
        }
        ctx.save(); ctx.filter = 'blur(9px)'; ctx.drawImage(SL, 0, 0); ctx.restore();
      }

      // ---------- the marker: in hand while drawing, then set down on the table ----------
      const hTIP = TIP && t < BUILD_END ? (() => { const [u, v] = TIP; return toCanvas(u, v); })() : null;
      if (hTIP) {
        const [tx, ty] = hTIP, ang = 0.9;
        ctx.save();
        ctx.save(); ctx.filter = 'blur(8px)'; ctx.fillStyle = 'rgba(20,8,0,0.35)'; ctx.translate(tx + 24, ty + 30); ctx.rotate(ang); ctx.beginPath(); ctx.roundRect(10, -14, 300, 28, 12); ctx.fill(); ctx.restore();
        ctx.translate(tx, ty); ctx.rotate(ang);
        ctx.fillStyle = '#111114'; ctx.beginPath(); ctx.ellipse(5, 0, 7, 4, 0, 0, 7); ctx.fill();
        const ng = ctx.createLinearGradient(0, -10, 0, 10); ng.addColorStop(0, '#d8d8de'); ng.addColorStop(1, '#6a6a72');
        ctx.fillStyle = ng; ctx.beginPath(); ctx.moveTo(8, -4); ctx.lineTo(30, -11); ctx.lineTo(30, 11); ctx.lineTo(8, 4); ctx.closePath(); ctx.fill();
        const bg = ctx.createLinearGradient(0, -15, 0, 15); bg.addColorStop(0, '#5a5a62'); bg.addColorStop(0.3, '#2a2a30'); bg.addColorStop(1, '#0c0c10');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(28, -15, 190, 30, 12); ctx.fill();
        ctx.fillStyle = '#9c9ca4'; ctx.fillRect(150, -15, 14, 30);
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(210, -17, 96, 34, 14); ctx.fill(); // cap posted on the back
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(36, -10, 170, 2.5);
        ctx.restore();
      }
      if (t >= BUILD_END) {
        const drop = H.ease.out(H.clamp((t - BUILD_END) / 0.3));
        ctx.save(); ctx.translate(1010 + (1 - drop) * -60, 560 + (1 - drop) * -50); ctx.rotate(-0.62 + (1 - drop) * 0.5);
        ctx.scale(1 + (1 - drop) * 0.08, 1 + (1 - drop) * 0.08);
        ctx.save(); ctx.filter = 'blur(6px)'; ctx.fillStyle = 'rgba(20,8,0,0.5)'; ctx.beginPath(); ctx.roundRect(8, 4, 270, 34, 16); ctx.fill(); ctx.restore();
        const bg = ctx.createLinearGradient(0, -16, 0, 16);
        bg.addColorStop(0, '#5a5a62'); bg.addColorStop(0.3, '#2a2a30'); bg.addColorStop(1, '#0c0c10');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(0, -15, 180, 30, 13); ctx.fill();
        ctx.fillStyle = '#9c9ca4'; ctx.fillRect(110, -15, 14, 30);
        const cg = ctx.createLinearGradient(0, -17, 0, 17);
        cg.addColorStop(0, '#606068'); cg.addColorStop(0.3, '#26262c'); cg.addColorStop(1, '#09090c');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(176, -17, 100, 34, 14); ctx.fill();
        ctx.fillStyle = '#18181c'; ctx.beginPath(); ctx.roundRect(190, -24, 76, 10, 4); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(14, -10, 150, 2.5); ctx.fillRect(186, -11, 80, 2.5);
        ctx.restore();
      }

      H.grain(ctx, W, H_, 0.03, 8 + (Math.floor(t * 12) % 4));
      H.vignette(ctx, W, H_, 0.35, '25,10,0');
    },
    // >>>EXPLAINER
    explainerDuration: 15,
    explainerNote: 'A cafe-table pitch: the camera starts tight on the scrawled question then pulls back to the napkin; when a napkin is full a fresh one is slapped down on top of the pile (with a red Sharpie for the wrong guess and the 97%), arrows and numbers are fast Sharpie scrawls that feather into the tissue.',
    explainer(ctx, W, H_, t) {
      const nz = H.makeNoise(64);
      const D = [2560, 650];
      const SLIDE = [[-1, -0.5, 0], [5.55, 5.95, 1], [10.25, 10.65, 2]]; // napkin k lands at [1]
      const L = {
        D, pT: 10.85, kT: 13.05, modelName: 'the model', titleX: 1880, titleY: 300, model2At: 6.0,
        model: (cx, cy, adj, push, api, tt) => {
          const g = 'M';
          api.line(XE.rrect(cx - 150, cy - 135, 300, 290, 24), 'ink', 6, 2.5, 2.68, g);
          api.line([[cx + 70, cy - 135], [cx + 74, cy - 180]], 'ink', 5, 2.68, 2.72, g);
          api.line(XE.circ(cx + 75, cy - 192, 12, 12), 'ink', 5, 2.72, 2.76, g);
          api.line(XE.circ(cx - 55, cy - 50, 22, 22), 'ink', 5, 2.76, 2.81, g);
          api.line(XE.circ(cx + 55, cy - 50, 22, 22), 'ink', 5, 2.81, 2.86, g);
          api.line([[cx - 50, cy + 10], [cx - 18, cy + 30], [cx + 18, cy + 30], [cx + 50, cy + 10]], 'ink', 5, 2.86, 2.9, g);
          api.text('AI', cx - 22, cy - 82, 40, 'title', 'ink', 2.9, 2.96, { g });
          [-1, 0, 1].forEach((k, i) => {
            const x = cx + k * 80, y = cy + 92;
            api.line(XE.circ(x, y, 24, 24, -1.2, 5.2), 'ink', 4.5, 2.95 + i * 0.03, 3.0 + i * 0.03, g);
            if (tt > 3.0 + i * 0.03) {
              const a0 = [-2.4, -0.6, -1.9][i], a1 = [-0.7, -2.2, -0.4][i], a = a0 + (a1 - a0) * adj + Math.sin(adj * Math.PI) * 0.3;
              push({ k: 'line', pts: [[x, y], [x + Math.cos(a) * 19, y + Math.sin(a) * 19]], role: adj > 0 && adj < 1 ? 'acc2' : 'ink', w: 5, a: -1, b: 0, inst: true, g });
            }
          });
        },
      };
      const items = XE.story(t, L);
      const cam = XE.camAt([[0, 1880, 300, 1.45], [1.9, 1880, 305, 1.5], [2.75, 1880, 600, 0.84], [5.45, 1890, 605, 0.86], [6.1, 2550, 620, 0.86], [10.2, 2555, 625, 0.88],
        [10.8, 2560, 690, 0.9], [12.9, 2565, 695, 0.93], [13.6, 2560, 690, 0.88], [15, 2560, 690, 0.89]], t);
      const z = cam[2];
      const apply = (c) => { c.translate(W / 2, H_ / 2); c.scale(z, z); c.translate(-cam[0], -cam[1]); };
      const toS = ([x, y]) => [(x - cam[0]) * z + W / 2, (y - cam[1]) * z + H_ / 2];

      // ---------- cached textures: wood table, napkin body, napkin crumple shading ----------
      if (!XC.wood) {
        const w2 = 1300, h2 = 760, wl = H.layer(w2, h2), wc = wl.getContext('2d'), id = wc.createImageData(w2, h2), d = id.data, rr = H.rng(3);
        const PL = 92, tints = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(() => [rr.range(-12, 12), rr.range(-0.4, 0.4)]);
        for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) {
          const pi = Math.floor((y + 20) / PL), py = (y + 20) % PL, [tint, ph] = tints[pi % tints.length];
          const warp = nz.fbm2(x * 0.0025 + pi * 7, py * 0.012 + pi, 3) * 5.5, ring = Math.sin((py * 0.07 + warp + ph * 3) * Math.PI * 2);
          const fine = nz.n2(x * 0.012 + pi * 5, y * 0.55) * 0.6 + nz.n2(x * 0.05, y * 1.3) * 0.25;
          const v = 0.5 + 0.16 * Math.sign(ring) * Math.pow(Math.abs(ring), 0.4) + 0.14 * fine + nz.n2(x * 0.004, y * 0.02 + pi) * 0.12;
          let r = (118 + tint) * (0.75 + 0.5 * v), gg = (74 + tint * 0.6) * (0.75 + 0.5 * v), b = (42 + tint * 0.3) * (0.78 + 0.45 * v);
          if (py < 2 || py > PL - 2) { r *= 0.35; gg *= 0.3; b *= 0.3; }
          const i = (y * w2 + x) * 4; d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255;
        }
        wc.putImageData(id, 0, 0); XC.wood = wl;
        // napkin body (with embossed border + fibres) and its crumple shading, 1100x760
        const NW = 1100, NH = 760, nb = H.layer(NW, NH), nc = nb.getContext('2d');
        const out = []; const edge = (x0, y0, x1, y1, s) => { for (let i = 0; i < 60; i++) { const u = i / 60, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u, o = nz.n2(u * 9 + s, s) * 2.5; const nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny); out.push([x + nx / l * o, y + ny / l * o]); } };
        edge(4, 3, NW - 3, 6, 1); edge(NW - 3, 4, NW - 6, NH - 3, 2); edge(NW - 4, NH - 3, 3, NH - 4, 3); edge(3, NH - 3, 6, 6, 4);
        const path = (c) => { c.beginPath(); out.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
        path(nc); nc.fillStyle = '#f6f5f0'; nc.fill(); nc.save(); nc.clip();
        const r2 = H.rng(21);
        for (let i = 0; i < 3500; i++) { const x = r2.range(0, NW), y = r2.range(0, NH), a = r2.range(0, 6.28), l = r2.range(3, 10); nc.strokeStyle = r2.chance(0.5) ? 'rgba(180,175,165,0.08)' : 'rgba(255,255,255,0.35)'; nc.lineWidth = 0.7; nc.beginPath(); nc.moveTo(x, y); nc.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); nc.stroke(); }
        const EM = H.layer(NW, NH), ec = EM.getContext('2d'); ec.strokeStyle = '#000'; ec.fillStyle = '#000';
        const inset = (k, lw) => { ec.lineWidth = lw; ec.beginPath(); ec.roundRect(k, k, NW - 2 * k, NH - 2 * k, 6); ec.stroke(); };
        inset(18, 2); inset(56, 2); inset(22, 1.2);
        const ring = (x, y) => { ec.lineWidth = 1.6; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; ec.beginPath(); ec.ellipse(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 5, 3, a, 0, 7); ec.stroke(); } };
        for (let x = 74; x < NW - 40; x += 36) { ring(x, 37); ring(x, NH - 37); }
        for (let y = 74; y < NH - 40; y += 36) { ring(37, y); ring(NW - 37, y); }
        const tintL = (col, dx, dy, a) => { const tl = H.layer(NW, NH), tc = tl.getContext('2d'); tc.drawImage(EM, dx, dy); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, NW, NH); nc.globalAlpha = a; nc.drawImage(tl, 0, 0); nc.globalAlpha = 1; };
        tintL('#8f8a80', 1.1, 1.3, 0.35); tintL('#ffffff', -1, -1.1, 0.9);
        nc.restore();
        XC.napkin = nb;
        // crumple shading (multiply) + highlights, half-res
        const gw = NW / 2, gh = NH / 2, hf = new Float32Array(gw * gh);
        for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
          const u = x * 2, v = y * 2;
          let h = nz.fbm2(u * 0.009 + 3, v * 0.009, 4) * 11;
          const q1 = 1 - Math.abs(nz.n2(u * 0.018 + 9, v * 0.018)), q2 = 1 - Math.abs(nz.n2(u * 0.042 + 5, v * 0.042 + 2));
          h += q1 * q1 * 4.5 + q2 * q2 * 0.6 + 8 * Math.max(0, 1 - Math.abs(u - NW / 2) / 22) - 7 * Math.max(0, 1 - Math.abs(v - NH / 2) / 20);
          h += 6 * Math.max(0, 1 - Math.min(u, v, NW - u, NH - v) / 40);
          hf[y * gw + x] = h;
        }
        // shadows (multiplied, warm grey like the hero) and tissue highlights (laid on top) as separate layers
        const SL = H.layer(gw, gh), sc = SL.getContext('2d'), sid = sc.createImageData(gw, gh), sd = sid.data;
        const HLl = H.layer(gw, gh), hlc = HLl.getContext('2d'), hid = hlc.createImageData(gw, gh), hd = hid.data;
        for (let y = 1; y < gh - 1; y++) for (let x = 1; x < gw - 1; x++) {
          const i = y * gw + x, gx = (hf[i + 1] - hf[i - 1]) / 4, gy = (hf[i + gw] - hf[i - gw]) / 4, nl = Math.hypot(gx, gy, 1);
          const lam = (-gx * -0.55 + -gy * -0.6 + 0.58) / nl, dl = (lam - 0.58) * 1.35, j = i * 4;
          if (dl < 0) { sd[j] = 118; sd[j + 1] = 108; sd[j + 2] = 96; sd[j + 3] = Math.min(255, -dl * 255); } else { hd[j] = 255; hd[j + 1] = 255; hd[j + 2] = 251; hd[j + 3] = Math.min(255, dl * 200); }
        }
        sc.putImageData(sid, 0, 0); hlc.putImageData(hid, 0, 0);
        const up = (src) => { const o = H.layer(NW, NH), oc = o.getContext('2d'); oc.imageSmoothingEnabled = true; oc.drawImage(src, 0, 0, NW, NH); oc.globalCompositeOperation = 'destination-in'; oc.drawImage(nb, 0, 0); return o; };
        XC.crumple = up(SL); XC.crumpleHL = up(HLl);
        // tissue fibre mask (ink wicks along these) and an absorption speckle mask, both in napkin space
        const FB = H.layer(NW, NH), fbc = FB.getContext('2d'), r3 = H.rng(44);
        fbc.strokeStyle = '#000'; fbc.lineWidth = 0.9; fbc.beginPath();
        for (let i = 0; i < 52000; i++) { const x = r3.range(0, NW), y = r3.range(0, NH), a = r3.range(0, 6.28), l = r3.range(1.5, 5); fbc.moveTo(x, y); fbc.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); }
        fbc.stroke(); XC.fibre = FB;
        const SP = H.layer(NW, NH), spc = SP.getContext('2d'), r4 = H.rng(45);
        for (let i = 0; i < 14000; i++) { spc.fillStyle = `rgba(0,0,0,${r4.range(0.05, 0.3).toFixed(3)})`; spc.fillRect(r4.range(0, NW), r4.range(0, NH), r4.range(1, 3), r4.range(1, 3)); }
        XC.speck = SP;
        // coffee-ring stain sprite (the hero's ring(): a double ring, one side faded where the cup tilted)
        const RS = 300, RL = H.layer(RS, RS), rc = RL.getContext('2d');
        const ringS = (cx, cy, R, a) => {
          for (let k = 0; k < 3; k++) {
            const r = R + k * 1.6, g = rc.createRadialGradient(cx, cy, r - 18, cx, cy, r + 2);
            g.addColorStop(0, 'rgba(150,95,45,0)'); g.addColorStop(0.7, `rgba(150,95,45,${a * 0.25})`);
            g.addColorStop(0.92, `rgba(120,70,30,${a})`); g.addColorStop(1, 'rgba(120,70,30,0)');
            rc.fillStyle = g; rc.beginPath(); rc.arc(cx + k * 0.9, cy - k * 0.7, r + 2, 0, 7); rc.fill();
          }
          const g2 = rc.createRadialGradient(cx, cy, 0, cx, cy, R);
          g2.addColorStop(0, `rgba(170,120,60,${a * 0.07})`); g2.addColorStop(1, `rgba(170,120,60,${a * 0.12})`);
          rc.fillStyle = g2; rc.beginPath(); rc.arc(cx, cy, R - 2, 0, 7); rc.fill();
        };
        ringS(140, 140, 74, 0.55); ringS(168, 162, 73, 0.22);
        rc.globalCompositeOperation = 'destination-in';
        const cgR = rc.createConicGradient(0.6, 140, 140);
        cgR.addColorStop(0, 'rgba(0,0,0,1)'); cgR.addColorStop(0.55, 'rgba(0,0,0,1)'); cgR.addColorStop(0.72, 'rgba(0,0,0,0.15)'); cgR.addColorStop(0.86, 'rgba(0,0,0,0.6)'); cgR.addColorStop(1, 'rgba(0,0,0,1)');
        rc.fillStyle = cgR; rc.fillRect(0, 0, RS, RS);
        XC.ring = RL;
      }

      // ---------- table ----------
      ctx.save(); apply(ctx);
      ctx.imageSmoothingEnabled = true; ctx.drawImage(XC.wood, 700, -150, 2600, 1520);
      ctx.restore();
      const vig = ctx.createLinearGradient(0, 0, W, H_); vig.addColorStop(0, 'rgba(255,230,190,0.12)'); vig.addColorStop(1, 'rgba(20,8,0,0.22)');
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H_);

      // ---------- napkins, slapped down one on top of the other ----------
      const NAP = [[1880, 600, 1320, 840, -0.02], [2550, 620, 1100, 800, 0.035], [2560, 690, 1090, 690, -0.03]];
      const GRP = [['A', 'B', 'M', 'F'], ['C', 'M2'], ['D', 'E']];
      const font = (it) => `400 ${it.size * (it.font === 'label' ? 1.1 : it.font === 'num' ? 1.0 : 0.92)}px "Permanent Marker"`;
      const measure = (it, p) => {
        ctx.save(); ctx.font = font(it); const w = ctx.measureText(it.s).width, x0 = it.align === 'center' ? it.x - w / 2 : it.x;
        const w2 = ctx.measureText(it.s.slice(0, Math.ceil(it.s.length * p))).width; ctx.restore(); return [x0 + w2, it.y - it.size * 0.3];
      };
      for (let k = 0; k < 3; k++) {
        const [s0, s1] = SLIDE[k];
        if (t < s0) break;
        const u = XE.clamp((t - s0) / (s1 - s0)), e = u >= 1 ? 1 : 1 - Math.pow(1 - u, 3) * Math.cos(u * 4.5);
        const [ncx, ncy, nw, nh, nr] = NAP[k];
        const ox = (1 - e) * 1100, oy = (1 - e) * -700, orot = (1 - e) * 0.6, lift = (1 - XE.clamp(u * 1.1)) * 1;
        ctx.save(); apply(ctx);
        ctx.translate(ncx + ox, ncy + oy); ctx.rotate(nr + orot);
        // shadow: big and soft while in the air, tight once it lands
        ctx.save(); ctx.filter = `blur(${(8 + lift * 30).toFixed(1)}px)`; ctx.fillStyle = `rgba(25,10,0,${(0.5 - lift * 0.25).toFixed(2)})`;
        ctx.fillRect(-nw / 2 + 8 + lift * 60, -nh / 2 + 12 + lift * 70, nw, nh); ctx.restore();
        ctx.drawImage(XC.napkin, -nw / 2, -nh / 2, nw, nh);
        // a coffee ring where the cup was set down on this napkin (world offsets from the napkin centre, clipped to it)
        const RG = [[-565, -325, 0.9], [350, -230, 2.4], [-500, -300, -0.7]][k];
        ctx.save(); ctx.beginPath(); ctx.rect(-nw / 2 + 4, -nh / 2 + 4, nw - 8, nh - 8); ctx.clip();
        ctx.translate(RG[0], RG[1]); ctx.rotate(RG[2]); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(XC.ring, -140, -140);
        ctx.restore();
        ctx.restore();
        if (u >= 1) {
          // ink for this napkin (Sharpie, feathering)
          const IL = H.layer(W, H_), ic = IL.getContext('2d');
          ic.save(); apply(ic); ic.lineCap = 'round'; ic.lineJoin = 'round';
          for (const it of items) {
            if (!GRP[k].includes(it.g)) continue;
            const p = it.inst ? 1 : XE.win(t, it.a, it.b);
            if (p <= 0) continue;
            const col = it.role === 'acc2' ? 'rgb(196,28,36)' : 'rgb(22,20,28)';
            ic.strokeStyle = col; ic.fillStyle = col;
            if (it.k === 'line') {
              const seed = ((it.pts[0][0] * 13 + it.pts[0][1] * 7) | 0) + 3;
              let P = wob(seg(it.pts, 2.5), nz, seed % 79, it.inst ? 0.5 : 1.5);
              if (p < 1) P = P.slice(0, Math.max(2, Math.ceil(P.length * p)));
              ic.lineWidth = Math.max(4, it.w * 1.05); ic.beginPath(); P.forEach(([x, y], i) => (i ? ic.lineTo(x, y) : ic.moveTo(x, y))); ic.stroke();
            } else if (it.k === 'dot') { ic.beginPath(); ic.arc(it.x, it.y, it.r, 0, 7); ic.fill(); }
            else {
              ic.save(); ic.font = font(it); const w = ic.measureText(it.s).width;
              ic.translate(it.align === 'center' ? it.x - w / 2 : it.x, it.y); ic.rotate(it.rot);
              const rr = H.rng((it.s.length * 31 + (it.x | 0)) % 991), n = Math.ceil(it.s.length * p); let px = 0;
              for (let i = 0; i < n; i++) { const cw = ic.measureText(it.s[i]).width; ic.save(); ic.translate(px, rr.range(-1.5, 1.5)); ic.rotate(rr.range(-0.05, 0.05)); ic.fillText(it.s[i], 0, 0); ic.restore(); px += cw; }
              ic.restore();
            }
          }
          ic.restore();
          // clip ink to the napkin, feather it, then let the crumples shade it
          ic.save(); ic.globalCompositeOperation = 'destination-in'; apply(ic); ic.translate(ncx, ncy); ic.rotate(nr); ic.drawImage(XC.napkin, -nw / 2, -nh / 2, nw, nh); ic.restore();
          // the hero's feathering: a soft halo, a fibre-shaped bleed wicking out along the tissue, then the core
          // with slightly uneven absorption (speckle knocked out of it)
          const toNap = (c) => { apply(c); c.translate(ncx, ncy); c.rotate(nr); };
          // blur at half resolution (cheap, and the upscale softens it further), reusing cached scratch layers
          const hw = W >> 1, hh = H_ >> 1;
          if (!XC.bl || XC.bl.width !== hw) { XC.bl = H.layer(hw, hh); XC.fb = H.layer(W, H_); }
          const BL = XC.bl, bc = BL.getContext('2d'), FBL = XC.fb, fc = FBL.getContext('2d');
          bc.clearRect(0, 0, hw, hh); bc.filter = `blur(${(1.5 * Math.sqrt(z)).toFixed(2)}px)`; bc.drawImage(IL, 0, 0, hw, hh); bc.filter = 'none';
          bc.drawImage(BL, 0, 0); // doubled, so the bleed has some body
          ctx.save(); ctx.imageSmoothingEnabled = true; ctx.globalAlpha = 0.38; ctx.drawImage(BL, 0, 0, W, H_); ctx.restore();
          fc.clearRect(0, 0, W, H_); fc.imageSmoothingEnabled = true; fc.drawImage(BL, 0, 0, W, H_);
          fc.save(); fc.globalCompositeOperation = 'destination-in'; toNap(fc); fc.drawImage(XC.fibre, -nw / 2, -nh / 2, nw, nh); fc.restore();
          ctx.save(); ctx.globalAlpha = 0.75; ctx.drawImage(FBL, 0, 0); ctx.restore();
          ic.save(); ic.globalCompositeOperation = 'destination-out'; toNap(ic); ic.drawImage(XC.speck, -nw / 2, -nh / 2, nw, nh); ic.restore();
          ctx.save(); ctx.globalAlpha = 0.94; ctx.drawImage(IL, 0, 0); ctx.restore();
        }
        ctx.save(); apply(ctx); ctx.translate(ncx + ox, ncy + oy); ctx.rotate(nr + orot);
        ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5; ctx.drawImage(XC.crumple, -nw / 2, -nh / 2, nw, nh);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.5; ctx.drawImage(XC.crumpleHL, -nw / 2, -nh / 2, nw, nh);
        ctx.restore();
      }

      // ---------- coffee cup + steam (on the table, top right) ----------
      {
        const [cx, cy] = toS([3170, 160]), s = z;
        ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
        ctx.save(); ctx.filter = 'blur(14px)'; ctx.fillStyle = 'rgba(20,8,0,0.5)'; ctx.beginPath(); ctx.arc(18, 22, 156, 0, 7); ctx.fill(); ctx.restore();
        const sg = ctx.createRadialGradient(-50, -60, 20, 0, 0, 160); sg.addColorStop(0, '#ffffff'); sg.addColorStop(0.7, '#ebe9e4'); sg.addColorStop(1, '#bfbab2');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, 158, 0, 7); ctx.fill();
        const cg = ctx.createRadialGradient(-40, -40, 10, 0, 0, 92); cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.8, '#efece6'); cg.addColorStop(1, '#c6c0b6');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill();
        const cf = ctx.createRadialGradient(-10, -10, 5, 0, 0, 76); cf.addColorStop(0, '#6b3e1e'); cf.addColorStop(0.75, '#4a2810'); cf.addColorStop(0.92, '#9a6a3c'); cf.addColorStop(1, '#3a1e0a');
        ctx.fillStyle = cf; ctx.beginPath(); ctx.arc(0, 0, 76, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(232,206,170,0.92)'; ctx.rotate(0.4); ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-46, 0, -34, -38, 0, -16); ctx.bezierCurveTo(34, -38, 46, 0, 0, 30); ctx.fill();
        ctx.restore();
        ctx.save(); ctx.filter = 'blur(9px)'; ctx.lineCap = 'round';
        for (let k = 0; k < 5; k++) {
          const life = (t * 0.35 + k / 5) % 1; ctx.strokeStyle = `rgba(255,250,240,${0.6 * Math.sin(life * Math.PI)})`; ctx.lineWidth = (10 + life * 18) * z;
          ctx.beginPath();
          for (let j = 0; j <= 12; j++) { const v = j / 12, y = cy + (40 - life * 150 - v * 110) * z, x = cx + (-30 + k * 14 + Math.sin(v * 4 + t * 1.6 + k * 1.3) * (10 + 26 * v)) * z; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.stroke();
        }
        ctx.restore();
      }

      // ---------- the Sharpie in hand ----------
      const tp = XE.tipOf(items, t, measure);
      if (tp) {
        const [tx, ty] = toS(tp), ang = 0.9;
        const red = (items.filter((q) => !q.inst && q.k !== 'dot' && XE.win(t, q.a, q.b) > 0 && XE.win(t, q.a, q.b) < 1).pop() || {}).role === 'acc2';
        ctx.save();
        ctx.save(); ctx.filter = 'blur(8px)'; ctx.fillStyle = 'rgba(20,8,0,0.35)'; ctx.translate(tx + 24, ty + 30); ctx.rotate(ang); ctx.beginPath(); ctx.roundRect(10, -14, 300, 28, 12); ctx.fill(); ctx.restore();
        ctx.translate(tx, ty); ctx.rotate(ang);
        ctx.fillStyle = red ? '#9a1018' : '#111114'; ctx.beginPath(); ctx.ellipse(5, 0, 7, 4, 0, 0, 7); ctx.fill();
        const ng = ctx.createLinearGradient(0, -10, 0, 10); ng.addColorStop(0, '#d8d8de'); ng.addColorStop(1, '#6a6a72');
        ctx.fillStyle = ng; ctx.beginPath(); ctx.moveTo(8, -4); ctx.lineTo(30, -11); ctx.lineTo(30, 11); ctx.lineTo(8, 4); ctx.closePath(); ctx.fill();
        const bg = ctx.createLinearGradient(0, -15, 0, 15);
        if (red) { bg.addColorStop(0, '#e05058'); bg.addColorStop(0.3, '#b8202a'); bg.addColorStop(1, '#5a0a10'); } else { bg.addColorStop(0, '#5a5a62'); bg.addColorStop(0.3, '#2a2a30'); bg.addColorStop(1, '#0c0c10'); }
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(28, -15, 190, 30, 12); ctx.fill();
        ctx.fillStyle = '#9c9ca4'; ctx.fillRect(150, -15, 14, 30);
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(210, -17, 96, 34, 14); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(36, -10, 170, 2.5);
        ctx.restore();
      }
      H.grain(ctx, W, H_, 0.025, 8 + (Math.floor(t * 12) % 4));
      H.vignette(ctx, W, H_, 0.3, '25,10,0');
    },
    // <<<EXPLAINER
    // Sound: a Sharpie on a paper napkin on a wooden cafe table. Every draw-on is a soft, fibrous felt-tip drag with the
    // table's dull body under it (the tip presses the tissue onto wood); the red Sharpie (acc2 items) is the same pen a
    // little brighter; a fresh napkin is slapped down on the pile for each new part (SLIDE windows: it whips in through
    // the air, lands flat with a soft tissue slap, and settles). Quiet room under it, a distant cup now and then.
    // Times mirror explainer()/XE.story (pT 10.85, kT 13.05, model2At 6.0, SLIDE, model timings from explainer()).
    explainerSound(k) {
      const pT = 10.85, kT = 13.05, M2 = 6.0 - 2.5; // the model is drawn again on napkin 2, shifted by model2At - 2.5
      const SLIDE = [[5.55, 5.95], [10.25, 10.65]];
      // first time XE.eio(win(t, t0, t1)) reaches u (the knob needles' eased turn)
      const when = (t0, t1, u) => { for (let i = 0; i <= 400; i++) if (XE.eio(i / 400) >= u - 1e-6) return t0 + (t1 - t0) * i / 400; return t1; };
      // one Sharpie line: felt tip lands (soft press into tissue over wood), fibrous drag for the draw-on, table body under it
      const LV = 0.45; // drawing sits well under the hits
      const sh = (a, b, g = 1, pan = 0, minor = true, red = false) => {
        const d = Math.max(0.03, b - a); g *= LV;
        k.noise(a, { dur: 0.03, filter: 'bandpass', f: 700, q: 1, gain: 0.16 * g, a: 0.002, pan, minor });
        k.tone(a, { f: 120, dur: 0.05, gain: 0.07 * g, pan, minor });
        k.play('stroke', a, { material: 'sharpie', dur: d, gain: (red ? 0.5 : 0.42) * g, pan, minor });
        k.noise(a, { dur: d + 0.04, color: 'pink', filter: 'lowpass', f: 520, gain: 0.07 * g, a: 0.015, hold: d * 0.6, pan, minor });
      };
      // scrawled words: one stroke per word, timed by character position like the explainer's per-letter reveal
      const write = (s, a, b, g = 0.9, pan = 0, red = false, minor = true) => {
        const n = s.length, re = /\S+/g; let m;
        while ((m = re.exec(s))) sh(a + (b - a) * m.index / n, a + (b - a) * (m.index + m[0].length) / n, g, pan, minor, red);
      };
      const dab = (t, g = 1) => k.noise(t, { dur: 0.025, filter: 'bandpass', f: 900, q: 1.2, gain: 0.22 * g, a: 0.002, minor: true }); // a felt-tip dot
      // a fresh napkin: whips in from the top right, first reaches its spot at u = pi/9 of the eased slide
      // (e = 1 - (1-u)^3 cos 4.5u), slaps down flat, shadow tightens as it settles by the end of the window
      const napkin = (s0, s1) => {
        const land = s0 + (s1 - s0) * Math.PI / 9;
        k.noise(s0, { dur: land - s0 + 0.03, color: 'pink', filter: 'bandpass', f: [[0, 260], [land - s0, 800]], q: 0.7, gain: 0.2, a: (land - s0) * 0.8, pan: 0.5 }); // air under the sheet
        k.play('slap', land, { gain: 0.7, pan: 0.1 });
        k.play('thud', land, { f: 85, gain: 0.4, pan: 0.1 }); // the pile on the table
        k.play('paper', land + 0.01, { dur: 0.16, gain: 0.35, pan: 0.1 }); // tissue crinkles as it lands
        k.noise(land + 0.12, { dur: s1 - land, color: 'pink', filter: 'bandpass', f: 1100, q: 0.6, gain: 0.04, a: 0.08, pan: 0.1, minor: true }); // settling
      };
      const clink = (t, f, pan) => { k.tone(t, { f, dur: 0.5, gain: 0.025, verb: 0.6, pan, minor: true }); k.tone(t, { f: f * 2.41, dur: 0.2, gain: 0.008, verb: 0.6, pan, minor: true }); };

      k.bed('room', 0, 15, { gain: 0.7 });
      clink(1.8, 1560, -0.7); clink(14.45, 1720, 0.75); // a cup set down somewhere across the cafe

      // 1 HOOK (tight on the napkin)
      k.play('pop', 0.03, { f: 300, gain: 0.45, minor: true }); // cap off
      write('How does AI learn?', 0.15, 1.3, 1.0);
      sh(1.3, 1.55, 1.25, 0, false); // underline: a fast confident swipe

      // 2 DATA: robot (box, antenna, eyes, smile, "AI", knobs), then six cards
      sh(2.5, 2.68, 1.05, 0.1, false); // robot head: first mark in the new scene
      sh(2.68, 2.76, 0.7, 0.15); sh(2.76, 2.86, 0.7, 0.1); sh(2.86, 2.9, 0.6, 0.1); // antenna, eyes, smile
      write('AI', 2.9, 2.96, 0.6, 0.05);
      for (let i = 0; i < 6; i++) { const a = 3.0 + i * 0.17; sh(a, a + (i < 5 ? 0.15 : 0.21), 0.85, (i % 3 - 1) * 0.15); }
      sh(4.15, 4.45, 1.0); sh(4.46, 4.55, 0.85); // flow arrow + head
      write('examples', 4.55, 4.8, 0.35);
      for (let f = 55; f < 63; f++) k.play('count', f / 12, { gain: 1.5, f: 2000 + (f - 55) * 100, minor: true }); // numbers re-scrawled on the 12 fps grid
      k.play('tock', 63 / 12, { f: 470, gain: 0.45 }); // 1,000,000 lands

      // napkin 2 slaps down
      napkin(SLIDE[0][0], SLIDE[0][1]);

      // 3 GUESS -> CHECK -> ADJUST (the robot is redrawn on the new napkin while the new photo goes up)
      sh(2.5 + M2, 2.68 + M2, 0.95, 0.1, false); sh(2.68 + M2, 2.9 + M2, 0.6, 0.1); // robot again: head, then face
      sh(6.4, 6.53, 0.9, 0, true, true); // red frame of the new photo
      sh(6.55, 6.7, 0.85); dab(6.7, 0.9); // cat + eyes
      write('new!', 6.67, 6.8, 0.6, 0.2, true);
      sh(6.8, 6.94, 0.9); sh(6.96, 7.02, 0.8); // arrow down into the model
      sh(7.02, 7.15, 0.9); // guess arrow out
      write('Guess', 7.15, 7.4, 0.6);
      sh(7.3, 7.47, 0.85); sh(7.48, 7.53, 0.75); // speech bubble + tail
      write('dog?', 7.54, 7.75, 1.0);
      write('Check', 7.86, 8.0, 0.6, 0, true);
      // the wrong guess: two hard red slashes + a low "nope"
      sh(8.0, 8.08, 1.8, 0.1, false, true); sh(8.08, 8.16, 1.8, 0.1, false, true);
      k.play('error', 8.0, { f: 'F3', gain: 0.55 });
      sh(8.16, 8.45, 1.1, 0, true, true); // red ring
      sh(8.45, 8.8, 1.0, -0.1, true, true); // long arrow back to the knobs
      write('Adjust', 8.8, 9.05, 0.6, -0.1, true);
      // knob needles swing (eio 8.95..9.5): a soft detent click every 1/7 of the turn, slowing as they settle
      for (let j = 1; j <= 7; j++) k.play('click', when(8.95, 9.5, j / 7), { f: 950, gain: 0.5, pan: -0.15, minor: true });
      sh(9.5, 9.62, 1.1); // strike through "dog?"
      write('cat', 9.62, 9.85, 1.0);
      sh(9.85, 10.05, 1.15, 0, false); // check mark
      k.play('success', 9.98, { f: 'A5', gain: 0.6 });

      // napkin 3 slaps down
      napkin(SLIDE[1][0], SLIDE[1][1]);

      // 4 PROGRESS
      sh(pT, pT + 0.3, 1.0, 0, false); // axes
      write('training rounds', pT + 0.3, pT + 0.55, 0.5);
      write('accuracy', pT + 0.45, pT + 0.7, 0.55, 0.3);
      sh(pT + 0.7, pT + 1.7, 0.3); // the rising curve
      { // % counter: a tick whenever the shown number changes (12 fps grid), slowing as it settles.
        // The numbers stay black, so the hit lands on the frame 97% is first scrawled.
        let last = -1;
        for (let f = Math.ceil((pT + 0.6) * 12); f < 160; f++) {
          const u = Math.min(1, (f / 12 - (pT + 0.6)) / 1.1), v = Math.round(61 + 36 * (1 - Math.pow(1 - u, 2.2)));
          if (v === 97) { // 97% lands: the biggest hit
            k.play('impact', f / 12, { gain: 1.2, pan: 0.2 });
            k.play('ding', f / 12 + 0.01, { f: 'D6', gain: 0.42, pan: 0.2 });
            break;
          }
          if (v !== last) { k.play('tick', f / 12, { gain: 1.5, f: 3200 + (v - 61) * 22, pan: 0.25, minor: true }); last = v; }
        }
      }
      sh(pT + 1.75, pT + 2.05, 1.25, 0.25, false, true); // red ring round the 97%

      // 5 TAKEAWAY
      write('More examples → better guesses', kT, kT + 0.75, 0.9);
      k.play('success', kT + 0.75, { f: 'G5', gain: 0.7 }); // resolving landing
      sh(kT + 0.75, kT + 0.95, 1.15, 0, false);
      k.play('click', kT + 1.15, { f: 700, gain: 1.0, minor: true }); // cap back on
    },
  });
}
```
