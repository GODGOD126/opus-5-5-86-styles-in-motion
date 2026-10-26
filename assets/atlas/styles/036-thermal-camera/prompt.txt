I want an animated explainer made in the "Thermal Camera" visual style (Light & Imaging). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): IBM Plex Mono, Inter
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@300;400;600;800&display=block">
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
Name: Thermal Camera
Family: Light & Imaging
Look: A handheld IR camera frame in ironbow: soft low-res heat field, cold glasses and warm breath, hot coffee and GPU racks, edge-enhanced outlines, sensor noise and the camera’s own HUD with spot meter, box measurement and scale bar.
Motion: Camera clicks through its shutter calibration, the auto-gain settles, coffee is hot-poured and steam rises, rack bands heat up bottom to top while the spot meter glides onto the mug and the readouts tick live.
How it explains: Everything is filmed through the IR camera: scenes change with the shutter-calibration (NUC) click, heat is activity and a cold wave is the error signal, while the camera\u2019s own HUD does the explaining with spot-meter arrows, measurement-box emphasis, tag labels riding on objects and live readouts.

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

REFERENCE STYLE SOURCE (styles/thermal-camera.js; W/H_ are always 1280x720)
```js
{
  // ---------- FLIR-style thermal image ----------
  const TMIN = 16, TMAX = 72;
  const IRONBOW = [
    [0.00, [0, 0, 6]], [0.08, [16, 4, 64]], [0.20, [72, 6, 130]], [0.33, [140, 12, 140]],
    [0.46, [196, 34, 96]], [0.58, [232, 70, 40]], [0.70, [248, 120, 12]], [0.82, [252, 184, 24]],
    [0.92, [254, 232, 110]], [1.00, [255, 255, 236]],
  ];
  function buildLUT() {
    const lut = new Uint8ClampedArray(1024 * 3);
    for (let i = 0; i < 1024; i++) {
      const v = i / 1023;
      let k = 0; while (k < IRONBOW.length - 2 && v > IRONBOW[k + 1][0]) k++;
      const [a, ca] = IRONBOW[k], [b, cb] = IRONBOW[k + 1], f = H.clamp((v - a) / (b - a));
      for (let c = 0; c < 3; c++) lut[i * 3 + c] = ca[c] + (cb[c] - ca[c]) * f;
    }
    return lut;
  }
  const g = (T) => { const v = H.clamp((T - TMIN) / (TMAX - TMIN)) * 255; return `rgb(${v},${v},${v})`; };
  const ga = (T, a) => { const v = H.clamp((T - TMIN) / (TMAX - TMIN)) * 255; return `rgba(${v},${v},${v},${a})`; };

  // ================= EXPLAINER: the IR camera films a model learning; heat = activity, cold = error =================
  let exLUT = null;
  function catSil(f, cx, cy, s, T, Tf) {
    f.fillStyle = g(T);
    f.beginPath(); f.ellipse(cx, cy + s * 0.08, s * 0.95, s * 0.78, 0, 0, 7); f.fill();
    f.beginPath(); f.moveTo(cx - s * 0.9, cy - s * 0.2); f.lineTo(cx - s * 0.78, cy - s * 1.05); f.lineTo(cx - s * 0.3, cy - s * 0.62); f.fill();
    f.beginPath(); f.moveTo(cx + s * 0.9, cy - s * 0.2); f.lineTo(cx + s * 0.78, cy - s * 1.05); f.lineTo(cx + s * 0.3, cy - s * 0.62); f.fill();
    f.fillStyle = g(Tf); f.beginPath(); f.ellipse(cx - s * 0.35, cy - s * 0.05, s * 0.14, s * 0.1, 0, 0, 7); f.ellipse(cx + s * 0.35, cy - s * 0.05, s * 0.14, s * 0.1, 0, 0, 7); f.fill();
    f.beginPath(); f.ellipse(cx, cy + s * 0.25, s * 0.12, s * 0.08, 0, 0, 7); f.fill();
  }
  function dogSil(f, cx, cy, s, T, Tf) {
    f.fillStyle = g(T);
    f.beginPath(); f.ellipse(cx, cy, s * 0.7, s * 0.85, 0, 0, 7); f.fill();
    f.beginPath(); f.ellipse(cx - s * 0.78, cy - s * 0.05, s * 0.26, s * 0.6, 0.25, 0, 7); f.ellipse(cx + s * 0.78, cy - s * 0.05, s * 0.26, s * 0.6, -0.25, 0, 7); f.fill();
    f.beginPath(); f.ellipse(cx, cy + s * 0.42, s * 0.34, s * 0.26, 0, 0, 7); f.fill();
    f.fillStyle = g(Tf); f.beginPath(); f.ellipse(cx - s * 0.28, cy - s * 0.2, s * 0.11, s * 0.09, 0, 0, 7); f.ellipse(cx + s * 0.28, cy - s * 0.2, s * 0.11, s * 0.09, 0, 0, 7); f.fill();
    f.fillStyle = g(T + 6); f.beginPath(); f.ellipse(cx, cy + s * 0.32, s * 0.13, s * 0.09, 0, 0, 7); f.fill();
  }
  // static sensor layers, built once: noise, sensor canvases, slow convective mottling field, column FPN
  const MOT_PAD = 48;
  let exNz = null, exF = null, exB = null, exMot = null, exFPN = null, exEdge = null, exSoft = null, exIX = null, exAX = null;
  function exCache() {
    if (exNz) return;
    exNz = H.makeNoise(17); exLUT = buildLUT();
    exF = H.layer(640, 360); exB = H.layer(640, 360); exB.getContext('2d').filter = 'blur(3px)';
    // same temperature mottling as the still (fbm2(x*.02, y*.02 + t*.05) * 3.2), pre-sampled; t scrolls it by 2.5 px/s
    exMot = new Float32Array(640 * (360 + MOT_PAD));
    for (let y = 0; y < 360 + MOT_PAD; y++) for (let x = 0; x < 640; x++) exMot[y * 640 + x] = exNz.fbm2(x * 0.02, y * 0.02, 3) * 5.4;
    const R = H.rng(4243); exFPN = new Float32Array(4096);
    for (let x = 0; x < 4096; x++) exFPN[x] = (R() - 0.5) * 0.012 + Math.sin(x * 0.9) * 0.002;
    exEdge = new Float32Array(640 * 360); exSoft = new Float32Array(640 * 360);
  }
  function thermalExplainer(ctx, W, Hh, t) {
    exCache();
    const sm = H.smooth, E = H.ease, nz = exNz, Rn = H.rng(5000 + Math.floor(t * 30));
    const FW = 640, FH = 360, F = exF, f = F.getContext('2d');
    f.setTransform(1, 0, 0, 1, 0, 0);
    // scenes separated by the camera's shutter calibration click (NUC)
    const NUC = [[0, 0.3], [6.0, 6.22], [10.45, 10.67]];
    const inNUC = NUC.some(([a, b]) => t >= a && t < b);
    const scene = t < 6.1 ? 1 : t < 10.55 ? 2 : 3;
    const sceneStart = scene === 1 ? 0.3 : scene === 2 ? 6.22 : 10.67;
    const settle = sm(sceneStart, sceneStart + 0.6, t);
    const shakeX = nz.n2(t * 0.8, 50) * 5, shakeY = nz.n2(60, t * 0.7) * 3.5;
    f.scale(FW / W, FH / Hh); f.translate(shakeX, shakeY);
    // room: warm ceiling, cool floor
    const wg = f.createLinearGradient(0, 0, 0, Hh); wg.addColorStop(0, g(24)); wg.addColorStop(0.65, g(21.5)); wg.addColorStop(1, g(20));
    f.fillStyle = wg; f.fillRect(-20, -20, W + 40, Hh + 40);
    // ceiling light strip (warm) and the wall/floor junction with a cooler floor, as in the still's room
    f.fillStyle = g(26.5); f.fillRect(-20, -20, W + 40, 30);
    const fl = f.createLinearGradient(0, 604, 0, Hh); fl.addColorStop(0, g(21.2)); fl.addColorStop(1, g(19.6));
    f.fillStyle = fl; f.fillRect(-20, 604, W + 40, Hh - 584);
    f.fillStyle = g(22.6); f.fillRect(-20, 598, W + 40, 6);
    const hud = []; // deferred HUD drawing (needs screen coords incl. shake)
    // ---- neural net as heat: nodes = hot spots, connections = warm wires whose temperature is the weight ----
    const net = (ox, oy, sc, heat, wts, pulses, outHot) => {
      const L = [[-110, [-80, 0, 80]], [0, [-110, -37, 37, 110]], [110, [-40, 40]]];
      const P = (li, k) => [ox + L[li][0] * sc, oy + L[li][1][k] * sc];
      let ci = 0;
      for (let li = 0; li < 2; li++) for (let a = 0; a < L[li][1].length; a++) for (let b = 0; b < L[li + 1][1].length; b++) {
        const w = wts(ci++), A = P(li, a), B = P(li + 1, b);
        f.strokeStyle = g(22 + w * 20 + heat * 4); f.lineWidth = 3 + w * 6;
        f.beginPath(); f.moveTo(...A); f.lineTo(...B); f.stroke();
        for (const [lay, u0, T] of pulses) { const u = H.clamp(u0 * 1.35 - ((ci * 7) % 5) * 0.08); if (lay === li && u > 0 && u < 1) {
          const x = A[0] + (B[0] - A[0]) * u, y = A[1] + (B[1] - A[1]) * u, gr = f.createRadialGradient(x, y, 0, x, y, 16 * sc);
          gr.addColorStop(0, ga(T, 0.95)); gr.addColorStop(1, ga(T, 0)); f.fillStyle = gr; f.fillRect(x - 20 * sc, y - 20 * sc, 40 * sc, 40 * sc);
        } }
      }
      L.forEach((l, li) => l[1].forEach((_, k) => {
        const [x, y] = P(li, k), hot = li === 2 ? (outHot ? outHot(k) : 0) : 0;
        const gr = f.createRadialGradient(x, y, 0, x, y, 26 * sc);
        gr.addColorStop(0, g(32 + heat * 6 + hot * 14)); gr.addColorStop(0.55, g(29 + heat * 4 + hot * 8)); gr.addColorStop(1, ga(25, 0));
        f.fillStyle = gr; f.beginPath(); f.arc(x, y, 26 * sc, 0, 7); f.fill();
      }));
      return P;
    };
    const card = (x, y, kind, T, sc = 1) => {
      f.fillStyle = g(27); f.beginPath(); f.roundRect(x - 52 * sc, y - 46 * sc, 104 * sc, 92 * sc, 6); f.fill();
      (kind === 'cat' ? catSil : dogSil)(f, x, y + 6 * sc, 30 * sc, T, T - 5);
    };

    let header = 0;
    if (scene === 1) {
      // conveyor belt feeding labelled examples into the model
      f.fillStyle = g(23); f.fillRect(-20, 486, 860, 22);
      for (let k = 0; k < 18; k++) { f.fillStyle = g(25.5); f.fillRect(((k * 52 + t * 380) % 900) - 40, 488, 12, 18); }
      f.fillStyle = g(38); f.beginPath(); f.arc(830, 497, 20, 0, 7); f.fill(); // warm drive motor
      const fed = H.clamp((t - 2.6) / 0.32, 0, 9);
      const heat = sm(2.6, 6, t);
      // model housing (server chassis) with the net inside
      f.fillStyle = g(25 + heat * 3); f.beginPath(); f.roundRect(830, 140, 330, 330, 18); f.fill();
      f.fillStyle = g(23 + heat * 2); f.beginPath(); f.roundRect(848, 158, 294, 294, 12); f.fill();
      net(995, 305, 1.05, heat, (c) => 0.3 + 0.4 * Math.abs(Math.sin(c * 1.7)), [], null);
      // exhaust above the model grows with work
      const ex = f.createLinearGradient(0, 60, 0, 140); ex.addColorStop(0, ga(26, 0)); ex.addColorStop(1, ga(30 + heat * 6, 0.8));
      f.fillStyle = ex; f.fillRect(860, 60, 270, 80);
      for (let k = 0; k < 9; k++) {
        const sk = 2.6 + k * 0.32; if (t < sk) continue;
        const x = -60 + (t - sk) * 380; if (x > 800) continue;
        const kind = k % 3 === 1 ? 'dog' : 'cat';
        card(x, 420, kind, 41, 1.25);
        hud.push(['tag', x + shakeX, 352 + shakeY, kind]);
      }
      if (t > 2.7) hud.push(['counter', sm(2.7, 5.3, t)]);
      header = sm(1.55, 2.25, t);
    } else if (scene === 2) {
      const cin = E.out(sm(6.25, 6.7, t));
      card(-140 + cin * 360, 330, 'cat', 41, 1.8);
      // weights before / after the adjustment
      const adj = sm(8.85, 9.3, t);
      const wts = (c) => H.lerp(0.15 + 0.75 * Math.abs(Math.sin(c * 2.3)), 0.15 + 0.75 * Math.abs(Math.cos(c * 1.1 + 0.4)), adj);
      const pulses = [];
      const fw1 = sm(6.75, 7.05, t), fw2 = sm(7.05, 7.35, t);           // first guess: heat flows forward
      if (fw1 > 0 && fw1 < 1) pulses.push([0, fw1, 44]); if (fw2 > 0 && fw2 < 1) pulses.push([1, fw2, 44]);
      const bk1 = sm(8.2, 8.5, t), bk2 = sm(8.5, 8.8, t);               // error: a cold wave runs backwards
      if (bk1 > 0 && bk1 < 1) pulses.push([1, 1 - bk1, 14]); if (bk2 > 0 && bk2 < 1) pulses.push([0, 1 - bk2, 14]);
      const g1 = sm(9.35, 9.6, t), g2 = sm(9.6, 9.85, t);               // second guess
      if (g1 > 0 && g1 < 1) pulses.push([0, g1, 44]); if (g2 > 0 && g2 < 1) pulses.push([1, g2, 44]);
      const outHot = (k) => k === 1 ? sm(7.3, 7.45, t) * (1 - sm(8.2, 8.5, t)) : sm(9.8, 9.95, t);
      net(640, 330, 1.25, 0.6, wts, pulses, outHot);
      hud.push(['loop']);
      header = 1;
    } else {
      const lp = sm(10.9, 12.4, t), heat = 0.4 + lp * 0.9;
      f.fillStyle = g(25 + heat * 2); f.beginPath(); f.roundRect(110, 170, 340, 330, 18); f.fill();
      f.fillStyle = g(23 + heat * 2); f.beginPath(); f.roundRect(128, 188, 304, 294, 12); f.fill();
      net(280, 335, 1.1, heat, (c) => H.lerp(0.15 + 0.75 * Math.abs(Math.sin(c * 2.3)), 0.75 + 0.2 * Math.sin(c), lp), [], () => lp * 0.6);
      const ex = f.createLinearGradient(0, 80, 0, 170); ex.addColorStop(0, ga(26, 0)); ex.addColorStop(1, ga(30 + heat * 8, 0.85));
      f.fillStyle = ex; f.fillRect(140, 80, 280, 90);
      hud.push(['chart', lp]);
      header = 1;
    }
    // ---- optics + palette (same pipeline as the still) ----
    f.setTransform(1, 0, 0, 1, 0, 0);
    const sharp = f.getImageData(0, 0, FW, FH).data;
    const B = exB, b = B.getContext('2d'); b.clearRect(0, 0, FW, FH); b.drawImage(F, 0, 0);
    const soft8 = b.getImageData(0, 0, FW, FH).data;
    // convective mottling + emissivity variation (slowly drifting, as in the still), added in float so the
    // equalisation below cannot posterise it into 8-bit contour steps
    const soft = exSoft, mOff = t * 2.5, mRow = Math.floor(mOff) % MOT_PAD, mA = mOff - Math.floor(mOff);
    for (let y = 0; y < FH; y++) {
      const r0 = (y + mRow) * FW, r1 = r0 + FW, o = y * FW;
      for (let x = 0; x < FW; x++) {
        const v = soft8[(o + x) * 4] + exMot[r0 + x] * (1 - mA) + exMot[r1 + x] * mA;
        soft[o + x] = v < 0 ? 0 : v > 254.99 ? 254.99 : v;
      }
    }
    // MSX-style edge map from the sharp field (Sobel)
    const edge = exEdge;
    for (let y = 1; y < FH - 1; y++) {
      const o = y * FW;
      for (let x = 1; x < FW - 1; x++) {
        const a = (o - FW + x) * 4, c = (o + x) * 4, e = (o + FW + x) * 4;
        const gx = -sharp[a - 4] - 2 * sharp[c - 4] - sharp[e - 4] + sharp[a + 4] + 2 * sharp[c + 4] + sharp[e + 4];
        const gy = -sharp[a - 4] - 2 * sharp[a] - sharp[a + 4] + sharp[e - 4] + 2 * sharp[e] + sharp[e + 4];
        const mg = Math.sqrt(gx * gx + gy * gy) / 90; edge[o + x] = mg > 1 ? 1 : mg;
      }
    }
    // plateau histogram equalisation, blended with the fixed linear span the scale bar reports
    const hist = new Float32Array(256);
    for (let i = 0; i < soft.length; i++) hist[soft[i] | 0]++;
    const plateau = (FW * FH) / 70;
    let tot = 0; for (let i = 0; i < 256; i++) { hist[i] = Math.min(hist[i], plateau); tot += hist[i]; }
    const cdf = new Float32Array(257); let acc = 0;
    for (let i = 0; i < 256; i++) { acc += hist[i]; cdf[i] = acc / tot; } cdf[256] = 1;
    const img = ctx.createImageData(W, Hh), d = img.data, sx = FW / W, sy = FH / Hh;
    const lo = 19.5, hi = 47, kT = (TMAX - TMIN) / (hi - lo), kO = (TMIN - lo) / (hi - lo);
    const cont = 0.3 + 0.7 * settle;
    if (!exIX || exIX.length !== W) { exIX = new Int32Array(W); exAX = new Float32Array(W);
      for (let x = 0; x < W; x++) { const fx = H.clamp(x * sx - 0.5, 0, FW - 1.001); exIX[x] = fx | 0; exAX[x] = fx - (fx | 0); } }
    for (let y = 0; y < Hh; y++) {
      const fy = H.clamp(y * sy - 0.5, 0, FH - 1.001), iy = fy | 0, ay = fy - iy, rowN = (Rn() - 0.5) * 0.006;
      for (let x = 0; x < W; x++) {
        const ix = exIX[x], ax = exAX[x], j = iy * FW + ix;
        const v = ((soft[j] * (1 - ax) + soft[j + 1] * ax) * (1 - ay) + (soft[j + FW] * (1 - ax) + soft[j + FW + 1] * ax) * ay) / 255;
        const e = (edge[j] * (1 - ax) + edge[j + 1] * ax) * (1 - ay) + (edge[j + FW] * (1 - ax) + edge[j + FW + 1] * ax) * ay;
        const v255 = v * 255, ci = v255 | 0, cf = v255 - ci, q = cdf[ci] * (1 - cf) + cdf[ci + 1] * cf;
        let n = 0.4 * q + 0.6 * (v * kT + kO);
        n = 0.4 + (n - 0.4) * cont;
        if (inNUC) n = 0.36 + (x / W - 0.5) * 0.02;
        else n += e * 0.05 + exFPN[x];
        n += (Rn() + Rn() - 1) * 0.02 + rowN;
        const li = (n < 0 ? 0 : n > 1 ? 1 : n) * 1023 | 0, i = (y * W + x) * 4;
        d[i] = exLUT[li * 3]; d[i + 1] = exLUT[li * 3 + 1]; d[i + 2] = exLUT[li * 3 + 2]; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    H.vignette(ctx, W, Hh, 0.35, '0,0,10');

    // ---- HUD (the camera's own annotation layer does the explaining) ----
    ctx.save(); ctx.textBaseline = 'middle';
    const T_ = (s, x, y, font, align = 'left', col = '#fff') => { ctx.font = font; ctx.textAlign = align; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText(s, x + 1.5, y + 1.5); ctx.fillStyle = col; ctx.fillText(s, x, y); };
    const Ln = (pts, w = 2, col = '#fff', prog = 1) => {
      let total = 0; for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const draw = (c, lw) => { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(...pts[0]); let acc = 0;
        for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + L <= total * prog) { ctx.lineTo(...pts[i]); acc += L; } else { const u = (total * prog - acc) / L; ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u); break; } } ctx.stroke(); };
      draw('rgba(0,0,0,0.55)', w + 2); draw(col, w);
    };
    const Arw = (pts, prog, col = '#fff') => {
      if (prog <= 0) return; Ln(pts, 2.5, col, prog);
      if (prog >= 1) { const e = pts[pts.length - 1], p = pts[pts.length - 2], a = Math.atan2(e[1] - p[1], e[0] - p[0]);
        Ln([[e[0] + Math.cos(a + 2.6) * 14, e[1] + Math.sin(a + 2.6) * 14], e, [e[0] + Math.cos(a - 2.6) * 14, e[1] + Math.sin(a - 2.6) * 14]], 2.5, col); }
    };
    const curve = (x0, y0, qx, qy, x1, y1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * qx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * qy + u * u * y1]; });
    const box = (x, y, w, h, prog, col = '#fff') => Ln([[x + w / 2, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y], [x + w / 2, y]], 2, col, prog);
    const tri = (x, y, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - 9, y + 8); ctx.lineTo(x + 9, y + 8); ctx.lineTo(x, y - 8); ctx.fill(); };
    if (!inNUC) {
      // status bar
      T_('ε 0.95   IRONBOW', 1090, 34, '400 16px "Inter"', 'right');
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(1112, 25, 34, 17); ctx.fillStyle = '#fff'; ctx.fillRect(1146, 30, 3, 7); ctx.fillRect(1115, 28, 21, 11);
      T_('REC', 1176, 34, '600 16px "Inter"'); if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = '#ff3b2a'; ctx.beginPath(); ctx.arc(1166, 34, 5, 0, 7); ctx.fill(); }
      // colour scale bar
      const sg = ctx.createLinearGradient(0, 600, 0, 112); IRONBOW.forEach(([p, c]) => sg.addColorStop(p, H.rgba(c, 1)));
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(1216, 110, 26, 494); ctx.fillStyle = sg; ctx.fillRect(1218, 112, 22, 490);
      T_('47.0', 1240, 92, '600 18px "Inter"', 'right'); T_('19.5', 1240, 622, '600 18px "Inter"', 'right'); T_('°C', 1229, 646, '400 15px "Inter"', 'center');
      // the question: big annotation, then docks into the measurement table as the header
      if (t > 0.35) {
        const h = E.inOut(header), typed = 'How does AI learn?'.slice(0, Math.floor((t - 0.35) * 22));
        const fs = H.lerp(56, 28, h), x = H.lerp(640, 30, h), y = H.lerp(300, 42, h);
        if (h > 0.02) { ctx.fillStyle = `rgba(0,0,0,${0.38 * h})`; ctx.fillRect(18, 18, 340 * h, 50); }
        T_(typed, x, y, `600 ${fs}px "Inter"`, h < 0.5 ? 'center' : 'left');
        if (h < 0.05 && t > 0.6) { ctx.strokeStyle = '#fff'; Ln([[640 - 30, 360], [640 - 9, 360]]); Ln([[649, 360], [670, 360]]); Ln([[640, 330 + 10], [640, 351]]); Ln([[640, 369], [640, 390]]); }
      }
    }
    for (const it of hud) {
      if (inNUC) break;
      if (it[0] === 'tag') {
        const [, x, y, kind] = it;
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x - 42, y - 40, 84, 36);
        T_(kind, x, y - 22, '800 26px "Inter"', 'center'); Ln([[x, y - 4], [x, y + 12]], 1.5);
      } else if (it[0] === 'counter') {
        const p = it[1], v = p >= 1 ? 1000000 : Math.round(Math.pow(10, 6 * p));
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(18, 548, 560, 156);
        T_('TRAINING DATA', 34, 576, '600 24px "Inter"', 'left', 'rgba(255,255,255,0.85)');
        T_(v.toLocaleString('en-US'), 34, 642, '800 68px "Inter"'); T_('examples', 560, 660, '700 30px "Inter"', 'right');
        Arw([[560, 330], [700, 330], [820, 300]], sm(2.7, 3.1, t));
        T_('model', 995, 110, '800 30px "Inter"', 'center'); box(838, 132, 314, 346, sm(2.9, 3.4, t));
      } else if (it[0] === 'loop') {
        T_('new picture', 220, 214, '800 28px "Inter"', 'center', 'rgba(255,255,255,0.9)');
        // GUESS arrow -> answer
        Arw([[790, 330], [900, 330]], sm(7.3, 7.55, t));
        T_('Guess', 845, 296, '800 32px "Inter"', 'center');
        const ans = t < 9.85 ? 'dog?' : 'cat';
        if (t > 7.5) T_(ans, 1010, 330, '800 54px "Inter"', 'center', t < 9.85 ? '#fff' : '#7dff8a');
        // CHECK: red box flashes round the wrong answer
        if (t > 7.75 && t < 9.85) {
          const fl = t < 8.4 ? (Math.floor(t * 8) % 2 ? 1 : 0.25) : 1;
          ctx.globalAlpha = fl; box(930, 286, 160, 88, sm(7.75, 8.0, t), '#ff3b2a');
          T_('✗', 1120, 330, '800 46px "Inter"', 'center', '#ff3b2a'); ctx.globalAlpha = 1;
          T_('Check', 1010, 256, '800 32px "Inter"', 'center', '#ff8a7a');
        }
        if (t >= 9.85) { box(930, 286, 160, 88, 1, '#7dff8a'); T_('✓', 1120, 330, '800 46px "Inter"', 'center', '#7dff8a'); T_('Check', 1010, 256, '800 32px "Inter"', 'center', '#7dff8a'); }
        // ADJUST: error flows back (the cold wave), weights retune
        Arw(curve(1010, 390, 860, 560, 660, 480), sm(8.2, 8.8, t), '#8fd3ff');
        if (t > 8.5) T_('Adjust', 830, 556, '800 32px "Inter"', 'center', '#8fd3ff');
        if (t > 8.85 && t < 9.4) { tri(640, 470, '#28a8ff'); T_('weights retuned', 640, 506, '800 26px "Inter"', 'center'); }
        tri(780, 380 - 0, t > 7.4 && t < 8.6 ? '#ff2a1a' : 'rgba(0,0,0,0)');
      } else if (it[0] === 'chart') {
        const lp = it[1];
        ctx.fillStyle = 'rgba(0,0,0,0.42)'; ctx.fillRect(560, 130, 620, 380);
        T_('LINE PROFILE · accuracy per training round', 578, 154, '600 20px "Inter"', 'left', 'rgba(255,255,255,0.8)');
        Ln([[600, 180], [600, 470], [1150, 470]], 2, '#fff', sm(10.7, 10.95, t));
        T_('rounds →', 1150, 492, '700 24px "Inter"', 'right', 'rgba(255,255,255,0.85)');
        const pts = []; for (let r = 0; r <= 24; r++) { const acc = 0.97 - 0.36 * Math.exp(-r / 6) + (r > 0 && r < 24 ? Math.sin(r * 3.1) * 0.012 : 0); pts.push([610 + r * 22, 470 - (acc - 0.5) / 0.5 * 280]); }
        if (lp > 0) Ln(pts, 3, '#ffd23a', lp);
        const pct = Math.round(61 + 36 * E.out(lp));
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(18, 80, 300, 46);
        T_('Accuracy', 30, 103, '600 28px "Inter"'); T_(pct + ' %', 306, 102, '800 30px "Inter"', 'right', pct >= 97 ? '#7dff8a' : '#fff');
        ctx.fillStyle = 'rgba(8,0,18,0.7)'; ctx.fillRect(915, 210, 170, 80); // readout plate: the profile runs behind it
        T_(pct + '%', 1000, 250, '800 64px "Inter"', 'center', pct >= 97 ? '#7dff8a' : '#fff');
        if (lp >= 1) { const fl = t < 12.9 ? (Math.floor(t * 8) % 2 ? 1 : 0.3) : 1; ctx.globalAlpha = fl; box(915, 210, 170, 80, sm(12.4, 12.65, t), '#7dff8a'); ctx.globalAlpha = 1; tri(pts[24][0], pts[24][1] - 16, '#ff2a1a'); }
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(222, 129, 116, 36);
        T_('model', 280, 146, '800 30px "Inter"', 'center');
        if (t > 13.0) {
          const tp = sm(13.0, 13.3, t);
          ctx.fillStyle = `rgba(0,0,0,${0.6 * tp})`; ctx.fillRect(110, 548, 1060, 100);
          const s = 'More examples → better guesses'; T_(s.slice(0, Math.floor((t - 13.0) * 40)), 640, 598, '800 52px "Inter"', 'center');
          box(110, 548, 1060, 100, tp);
        }
      }
    }
    if (inNUC && t > 0.05) T_('NUC', W / 2, Hh / 2, '600 22px "Inter"', 'center', 'rgba(255,255,255,0.85)');
    T_(`2026-10-09  23:41:${String(7 + Math.floor(t)).padStart(2, '0')}`, 1180, 700, '600 15px "IBM Plex Mono"', 'right', 'rgba(255,255,255,0.8)');
    ctx.restore();
  }

  // Sound: we are holding the IR camera. Its electronics whisper under everything; scene changes are the shutter-flag
  // NUC calibration (solenoid clack in, clack out); the HUD speaks in soft low beeps and data ticks; heat moving through
  // the net is a warm low swell, the error is a cold falling hiss; the measurement-box alarm beeps in step with its
  // flashing; the model's fan spins up as it works. The takeaway lands as a snapshot capture + save tone.
  // All times are copied from thermalExplainer() above (same NUC table, smooth/ease windows and flash formulas).
  // Voiceover mode (k.vo): beds drop out; typing ticks, counter ticks, card thumps, HUD line draws and fan are minor.
  function thermalSound(k) {
    const sm = H.smooth, E = H.ease, D = 15;
    const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
    // shutter flag solenoid: a dry plastic clack with a tiny rattle, no ring
    const clack = (t, g = 1) => {
      k.noise(t, { dur: 0.018, filter: 'bandpass', f: 2100, q: 1.1, gain: 0.4 * g, a: 0.001 });
      k.tone(t, { f: [[0, 260], [0.035, 110]], dur: 0.05, gain: 0.26 * g });
      k.noise(t + 0.022, { dur: 0.012, filter: 'bandpass', f: 1600, q: 2, gain: 0.14 * g, a: 0.001 });
    };
    const nuc = (a, b) => { clack(a, 1); k.noise(a + 0.02, { dur: b - a - 0.02, filter: 'bandpass', f: 900, q: 3, gain: 0.03 }); clack(b, 0.8); };
    // HUD beep: soft, low, slightly square (camera piezo through a lowpass)
    const beep = (t, f = 1050, dur = 0.06, g = 1, pan = 0, minor = false) => k.tone(t, { f, type: 'square', dur, gain: 0.05 * g, a: 0.003, hold: dur * 0.7, filter: 'lowpass', f2: 1800, q: 0.7, pan, minor });
    // data tick: what a HUD annotation "sounds" like as it writes; throttled so it stays under ~12/s
    const ticks = (t0, n, rate, every, pan = 0, g = 1) => { for (let i = 0; i < n; i += every)
      k.noise(t0 + i / rate, { dur: 0.012, filter: 'bandpass', f: 1700 + (i % 3) * 120, q: 3, gain: 0.2 * g, a: 0.001, pan, minor: true }); };
    // HUD line drawing on: a faint electronic trace that rises slightly, then a beep when it completes
    const trace = (a, b, pan = 0, f0 = 420) => k.tone(a, { f: [[0, f0], [b - a, f0 * 1.35]], type: 'triangle', dur: b - a, gain: 0.03, a: 0.03, hold: (b - a) * 0.7, pan, minor: true });
    // heat flowing forward through a layer: warm, low, breathy swell
    const heat = (a, b, pan = 0) => { const d = b - a;
      k.noise(a, { dur: d + 0.1, color: 'brown', filter: 'lowpass', f: [[0, 220], [d, 700]], gain: 0.35, a: d * 0.6, pan });
      k.tone(a, { f: [[0, 90], [d, 140]], dur: d + 0.1, gain: 0.07, a: d * 0.6, pan }); };
    // cold wave running back: an airy hiss that falls
    const cold = (a, b, pan = 0) => { const d = b - a;
      k.noise(a, { dur: d + 0.08, color: 'pink', filter: 'bandpass', f: [[0, 2200], [d, 650]], q: 1.4, gain: 0.22, a: d * 0.3, pan }); };
    // a dry counter tick per change, throttled
    const counter = (val, a, b, gap, pan, avoid = []) => { let last = -1, prev = val(a);
      for (let t = a; t <= b; t += 0.002) { const v = val(t);
        if (v !== prev && t - last >= gap && !avoid.some((x) => t > x - 0.03 && t < x + 0.1)) { k.play('tick', t, { f: 2300, gain: 1.15, pan, minor: true }); last = t; }
        prev = v; } };
    // the model's cooling fan: noise band that rises with the heat (amb bus, minor, kept low)
    const fan = (a, b, f0, f1, g) => k.noise(a, { dur: b - a, color: 'pink', filter: 'bandpass', f: [[0, f0], [b - a - 0.3, f1]], q: 2.5, gain: g, a: 0.6, hold: b - a - 1.0, bus: 'amb', pan: 0.3, minor: true });

    // ---- beds: the camera's electronics, the room
    k.bed('room', 0, D, { gain: 0.45 });
    k.bed('hiss', 0, D, { gain: 0.9 });
    k.tone(0.3, { f: 165, type: 'triangle', dur: D - 0.3, gain: 0.006, a: 0.5, hold: D - 1.3, bus: 'amb', minor: true }); // faint core whine, low

    // ---- 0–0.3 opens on a NUC; 0.3–0.9 auto-gain settles (a short soft rise)
    nuc(0.0, 0.3);
    k.tone(0.32, { f: [[0, 300], [0.5, 460]], type: 'sine', dur: 0.55, gain: 0.03, a: 0.3 });
    // title types at 22 chars/s from 0.35 (18 chars); spot-meter crosshair appears at 0.6
    ticks(0.35, 18, 22, 2, 0, 0.9);
    beep(0.6, 880, 0.05, 0.8, 0, true);
    // header docks 1.55–2.25 (eased inOut): a soft smooth low slide, fastest in the middle
    k.noise(1.55, { dur: 0.7, color: 'pink', filter: 'lowpass', f: [[0, 300], [0.35, 900], [0.7, 300]], gain: 0.06, a: 0.35, pan: -0.4 });

    // ---- scene 1: conveyor runs from 0.3 (belt rumble + drive motor, right side)
    k.noise(0.3, { dur: 5.75, color: 'brown', filter: 'bandpass', f: 180, q: 1.2, gain: 0.16, a: 0.4, hold: 5.0, bus: 'amb', pan: -0.2, minor: true });
    k.tone(0.3, { f: 98, type: 'sawtooth', dur: 5.75, gain: 0.012, a: 0.4, hold: 5.0, filter: 'lowpass', f2: 400, pan: 0.5, minor: true });
    // cards drop onto the belt at 2.6 + k*0.32 (short soft tap each)
    k.withMinor(() => { for (let c = 0; c < 9; c++) { const tc = 2.6 + c * 0.32;
      k.tone(tc, { f: [[0, 150], [0.06, 70]], dur: 0.08, gain: 0.15, pan: -0.8 }); k.noise(tc, { dur: 0.03, filter: 'bandpass', f: 700, q: 1, gain: 0.14, pan: -0.8 }); } });
    // arrow draws 2.7–3.1, model box 2.9–3.4
    trace(2.7, 3.1, 0.2); beep(3.1, 940, 0.05, 0.7, 0.2, true);
    trace(2.9, 3.4, 0.5, 520); beep(3.4, 1180, 0.08, 1.0, 0.5);
    // TRAINING DATA counter 10^(6p), p = sm(2.7, 5.3); locks on 1,000,000
    counter((t) => { const p = sm(2.7, 5.3, t); return p >= 1 ? 1e6 : Math.round(Math.pow(10, 6 * p)); }, 2.72, 5.25, 0.09, -0.5, [2.92, 3.24, 3.4, 3.56, 3.88, 4.2, 4.52, 4.84, 5.16]);
    beep(5.3, 1180, 0.05, 1, -0.5); beep(5.37, 1580, 0.09, 1, -0.5);
    // the chassis heats sm(2.6, 6): its fan spins up
    fan(2.6, 6.15, 500, 1100, 0.05);

    // ---- NUC 6.0–6.22 (scene change)
    nuc(6.0, 6.22);

    // ---- scene 2: cat card slides in E.out(sm(6.25, 6.7)) — a soft smooth slide
    k.noise(6.25, { dur: 0.45, color: 'pink', filter: 'lowpass', f: [[0, 800], [0.45, 250]], gain: 0.14, a: 0.02, pan: -0.5 });
    beep(6.4, 880, 0.04, 0.6, -0.6, true);                 // "new picture" tag
    heat(6.75, 7.05, -0.1); heat(7.05, 7.35, 0.15);       // first guess: heat flows forward
    k.tone(7.3, { f: 180, dur: 0.25, gain: 0.08, a: 0.1, pan: 0.25 });   // output node glows hot (7.3–7.45)
    trace(7.3, 7.55, 0.3); beep(7.4, 740, 0.04, 0.7, 0.3, true);         // Guess arrow + hot-spot marker
    beep(7.5, 1050, 0.09, 1.1, 0.45);                                    // the answer "dog?" posts
    // WRONG: red box + ✗ flash at 8 Hz (on when floor(t*8) is odd): on at 7.875, 8.125, then steady from 8.375
    k.play('thud', 7.875, { f: 110, gain: 0.6, pan: 0.5 });
    [7.875, 8.125, 8.375].forEach((ta, i) => { beep(ta, 620, 0.1, 1.6, 0.5); beep(ta, 930, 0.1, 0.8, 0.5); });
    // error flows back as a cold wave 8.2–8.5, 8.5–8.8 (arrow 8.2–8.8), "Adjust" 8.5
    cold(8.2, 8.5, 0.25); cold(8.5, 8.8, -0.1);
    beep(8.5, 820, 0.04, 0.6, 0.0, true);
    // weights retuned 8.85–9.3: a low servo-like retune sweep under the label
    k.tone(8.85, { f: [[0, 200], [0.45, 320]], type: 'sawtooth', dur: 0.5, gain: 0.045, a: 0.05, hold: 0.35, filter: 'lowpass', f2: 700, q: 2 });
    beep(8.85, 700, 0.05, 0.8, 0, true);
    heat(9.35, 9.6, -0.1); heat(9.6, 9.85, 0.15);         // second guess
    // RIGHT: "cat", green box and ✓ at 9.85: the camera's confirm tones
    k.play('success', 9.85, { f: 'C5', gain: 0.7, pan: 0.45 });
    beep(9.85, 1050, 0.05, 0.8, 0.45);

    // ---- NUC 10.45–10.67
    nuc(10.45, 10.67);

    // ---- scene 3: axes 10.7–10.95; line profile lp = sm(10.9, 12.4) with % counting 61 -> 97
    trace(10.7, 10.95, 0.3);
    const pct = (t) => Math.round(61 + 36 * E.out(sm(10.9, 12.4, t)));
    const t97 = when(pct, 97, 10.9, 12.4);
    k.tone(10.9, { f: [[0, 260], [t97 - 10.9, 520]], type: 'triangle', dur: t97 - 10.9, gain: 0.022, a: 0.2, hold: t97 - 11.2, pan: 0.3, minor: true }); // trace rising with the line
    counter(pct, 10.92, t97 - 0.04, 0.085, 0.3);
    beep(t97, 1180, 0.06, 1, 0.3); beep(t97 + 0.07, 1580, 0.08, 0.9, 0.3);  // number turns green
    fan(10.67, 14.95, 700, 1500, 0.055);                                   // model heats with lp
    // THE HIT at 12.4: lp reaches 1, measurement box locks on 97% and flashes (on 12.4, 12.625, steady from 12.875)
    k.play('thud', 12.4, { f: 85, gain: 1.2, pan: 0.2 }); clack(12.4, 1.1);
    k.noise(12.4, { dur: 0.5, color: 'pink', filter: 'lowpass', f: [[0, 2000], [0.45, 300]], gain: 0.22, verb: 0.3 });
    [12.4, 12.625, 12.875].forEach((ta, i) => { beep(ta, 784, 0.11, 1.9 - i * 0.3, 0.3); beep(ta, 1175, 0.11, 1.1 - i * 0.2, 0.3); });

    // ---- 13.0 takeaway panel: box draws sm(13.0, 13.3), text types at 40 chars/s (30 chars, done 13.75)
    trace(13.0, 13.3, 0, 360);
    ticks(13.0, 30, 40, 3, 0, 0.9);
    // resolve: snapshot captured + saved (shutter flag, then a low two-note save tone)
    clack(13.78, 0.9); k.noise(13.84, { dur: 0.04, filter: 'bandpass', f: 1500, q: 1, gain: 0.2 }); clack(13.86, 0.5);
    k.tone(13.95, { f: 'G4', dur: 0.5, gain: 0.12, a: 0.005, verb: 0.3 });
    k.tone(14.1, { f: 'C5', dur: 0.85, gain: 0.13, a: 0.005, verb: 0.35 });
    k.tone(14.1, { f: 'E5', dur: 0.85, gain: 0.06, a: 0.01, verb: 0.35 });
  }

  registerStyle({
    id: 'thermal-camera',
    name: 'Thermal Camera',
    category: 'Light & Imaging',
    description: 'A handheld IR camera frame in ironbow: soft low-res heat field, cold glasses and warm breath, hot coffee and GPU racks, edge-enhanced outlines, sensor noise and the camera’s own HUD with spot meter, box measurement and scale bar.',
    motion: 'Camera clicks through its shutter calibration, the auto-gain settles, coffee is hot-poured and steam rises, rack bands heat up bottom to top while the spot meter glides onto the mug and the readouts tick live.',
    fonts: ['600 22px "Inter"', '400 18px "Inter"', '600 16px "IBM Plex Mono"'],
    frameT: 4.6,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Everything is filmed through the IR camera: scenes change with the shutter-calibration (NUC) click, heat is activity and a cold wave is the error signal, while the camera\u2019s own HUD does the explaining with spot-meter arrows, measurement-box emphasis, tag labels riding on objects and live readouts.',
    explainer(ctx, W, Hh, t) { thermalExplainer(ctx, W, Hh, t); },
    explainerSound(k) { thermalSound(k); },
    draw(ctx, W, Hh, t) {
      const R = H.rng(4242), nz = H.makeNoise(17);
      const Rn = H.rng(9000 + Math.floor(t * 30)); // per-frame sensor noise
      const coffee = H.ease.out(H.smooth(0.55, 1.7, t)), mugWarm = H.smooth(0.8, 2.6, t), steamOn = H.smooth(1.1, 2.4, t);
      const settle = H.smooth(0.42, 1.3, t);
      const shakeX = nz.n2(t * 0.9, 50) * 4, shakeY = nz.n2(60, t * 0.8) * 3;
      const FW = 640, FH = 360; // sensor resolution
      const F = H.layer(FW, FH), f = F.getContext('2d');
      f.scale(FW / W, FH / Hh); f.translate(shakeX, shakeY);

      // ---- room: ceiling warmer than floor ----
      const wg = f.createLinearGradient(0, 0, 0, Hh);
      wg.addColorStop(0, g(24.5)); wg.addColorStop(0.6, g(22)); wg.addColorStop(1, g(20.5));
      f.fillStyle = wg; f.fillRect(0, 0, W, Hh);
      // ceiling light fixture warm streak, radiator glow lower-left
      f.fillStyle = g(27); f.fillRect(0, 0, W, 10);
      // window (cold glass, warmer frame)
      f.fillStyle = g(19.5); f.fillRect(40, 40, 260, 300);
      const wn = f.createLinearGradient(0, 52, 0, 330);
      wn.addColorStop(0, g(11)); wn.addColorStop(1, g(13.5));
      f.fillStyle = wn; f.fillRect(54, 54, 108, 272); f.fillRect(176, 54, 110, 272);
      // reflection of the ceiling lamp in the glass (IR mirror)
      f.fillStyle = ga(17, 0.6); f.beginPath(); f.ellipse(120, 120, 24, 70, 0.2, 0, 7); f.fill();
      // radiator under window
      for (let i = 0; i < 9; i++) { f.fillStyle = g(44 - (i % 2) * 6); f.fillRect(60 + i * 26, 382, 16, 70); }
      const rh = f.createLinearGradient(0, 230, 0, 382); rh.addColorStop(0, ga(30, 0)); rh.addColorStop(1, ga(30, 0.5));
      f.fillStyle = rh; f.fillRect(50, 230, 250, 152);

      // ---- server racks (right) ----
      const racks = [[880, 70, 170], [1062, 50, 190]];
      racks.forEach(([x, y, w], ri) => {
        f.fillStyle = g(27); f.fillRect(x, y, w, 560 - y);
        f.fillStyle = g(25); f.fillRect(x, y, 10, 560 - y); f.fillRect(x + w - 10, y, 10, 560 - y);
        for (let u = y + 20, k = 0; u < 540; u += 24, k++) {
          const load = 0.5 + 0.5 * nz.n2(k * 0.7 + ri * 5, t * 0.6);
          const spin = H.smooth(0.7 + (20 - k) * 0.07 + ri * 0.15, 1.3 + (20 - k) * 0.07 + ri * 0.15, t); // servers spin up bottom->top
          const T = 27 + spin * (3 + load * 18 + (k % 5 === 2 ? 6 : 0));
          f.fillStyle = g(T); f.fillRect(x + 16, u, w - 32, 18);
          // vent perforation: hotter slots
          f.fillStyle = g(T + 5);
          for (let s = 0; s < 8; s++) f.fillRect(x + 26 + s * ((w - 50) / 8), u + 5, (w - 50) / 16, 8);
          f.fillStyle = g(T - 6); f.fillRect(x + 16, u + 18, w - 32, 6);
        }
        // warm exhaust rising above rack
        const ex = f.createLinearGradient(0, y - 60, 0, y);
        ex.addColorStop(0, ga(30, 0)); ex.addColorStop(1, ga(36, 0.7));
        f.fillStyle = ex; f.fillRect(x + 10, y - 60, w - 20, 60);
      });

      // ---- person (behind laptop) ----
      const hx = 520, hy = 200;
      // body heat halo on wall
      const halo = f.createRadialGradient(hx, hy + 140, 60, hx, hy + 140, 300);
      halo.addColorStop(0, ga(27, 0.6)); halo.addColorStop(1, ga(24, 0));
      f.fillStyle = halo; f.fillRect(hx - 320, hy - 160, 640, 520);
      // shoulders / torso (shirt ~30)
      f.fillStyle = g(28.2);
      f.beginPath(); f.moveTo(hx - 210, 560); f.bezierCurveTo(hx - 215, 380, hx - 150, 320, hx - 60, 300);
      f.lineTo(hx + 60, 300); f.bezierCurveTo(hx + 150, 320, hx + 215, 380, hx + 210, 560); f.closePath(); f.fill();
      // shirt folds cooler/warmer
      f.strokeStyle = ga(27, 0.7); f.lineWidth = 10; f.lineCap = 'round';
      f.beginPath(); f.moveTo(hx - 140, 380); f.quadraticCurveTo(hx - 120, 450, hx - 150, 520); f.stroke();
      f.beginPath(); f.moveTo(hx + 135, 370); f.quadraticCurveTo(hx + 120, 440, hx + 150, 520); f.stroke();
      // arms reaching forward to keyboard
      f.fillStyle = g(29);
      f.beginPath(); f.ellipse(hx - 190, 470, 48, 110, 0.35, 0, 7); f.fill();
      f.beginPath(); f.ellipse(hx + 190, 470, 48, 110, -0.35, 0, 7); f.fill();
      // neck
      const nk = f.createLinearGradient(hx - 40, 0, hx + 40, 0);
      nk.addColorStop(0, g(32)); nk.addColorStop(0.5, g(35)); nk.addColorStop(1, g(32));
      f.fillStyle = nk; f.fillRect(hx - 38, 250, 76, 64);
      // collar V hot skin
      f.fillStyle = g(34.5); f.beginPath(); f.moveTo(hx - 34, 300); f.lineTo(hx, 345); f.lineTo(hx + 34, 300); f.fill();
      // head: hot face, limb-darkened edges
      const hd = f.createRadialGradient(hx, hy + 10, 10, hx, hy, 82);
      hd.addColorStop(0, g(36)); hd.addColorStop(0.65, g(35)); hd.addColorStop(1, g(31.5));
      f.fillStyle = hd; f.beginPath(); f.ellipse(hx, hy, 70, 86, 0, 0, 7); f.fill();
      // ears (cooler)
      f.fillStyle = g(32); f.beginPath(); f.ellipse(hx - 70, hy + 6, 12, 22, 0, 0, 7); f.ellipse(hx + 70, hy + 6, 12, 22, 0, 0, 7); f.fill();
      // hair (insulating -> cool)
      f.fillStyle = g(27.5);
      f.beginPath(); f.moveTo(hx - 74, hy + 10); f.bezierCurveTo(hx - 90, hy - 80, hx - 20, hy - 112, hx + 30, hy - 100);
      f.bezierCurveTo(hx + 90, hy - 90, hx + 86, hy - 20, hx + 74, hy + 4);
      f.bezierCurveTo(hx + 60, hy - 40, hx + 20, hy - 58, hx - 20, hy - 54);
      f.bezierCurveTo(hx - 50, hy - 50, hx - 66, hy - 20, hx - 74, hy + 10); f.fill();
      // glasses: glass blocks LWIR -> look cold
      f.fillStyle = g(25.5);
      f.beginPath(); f.roundRect(hx - 60, hy - 12, 50, 36, 10); f.roundRect(hx + 10, hy - 12, 50, 36, 10); f.fill();
      f.strokeStyle = g(29); f.lineWidth = 4;
      f.beginPath(); f.roundRect(hx - 60, hy - 12, 50, 36, 10); f.roundRect(hx + 10, hy - 12, 50, 36, 10); f.stroke();
      f.beginPath(); f.moveTo(hx - 10, hy - 2); f.lineTo(hx + 10, hy - 2); f.stroke();
      // nose tip slightly cool, inner eye corners hottest (seen as bright dots at bridge)
      f.fillStyle = g(32.6); f.beginPath(); f.ellipse(hx, hy + 40, 11, 9, 0, 0, 7); f.fill();
      f.fillStyle = g(36.4); f.beginPath(); f.arc(hx - 7, hy + 6, 5, 0, 7); f.arc(hx + 7, hy + 6, 5, 0, 7); f.fill();
      // mouth warm line
      f.fillStyle = g(36); f.beginPath(); f.ellipse(hx, hy + 62, 16, 4, 0, 0, 7); f.fill();
      // warm breath plume
      for (let i = 0; i < 6; i++) {
        f.fillStyle = ga(31, 0.18 - i * 0.025);
        f.beginPath(); f.ellipse(hx + 6 + i * 6, hy + 82 + i * 10 + Math.sin(t * 2 + i) * 3, 14 + i * 7, 8 + i * 3, 0.3, 0, 7); f.fill();
      }

      // ---- desk ----
      const dg = f.createLinearGradient(0, 520, 0, Hh);
      dg.addColorStop(0, g(22.8)); dg.addColorStop(1, g(21.5));
      f.fillStyle = dg; f.fillRect(0, 520, W, Hh - 520);
      f.fillStyle = g(21); f.fillRect(0, 520, W, 5);
      // warm patch under laptop (conducted heat)
      const lp = f.createRadialGradient(540, 590, 20, 540, 590, 300);
      lp.addColorStop(0, ga(31, 0.85)); lp.addColorStop(1, ga(24, 0));
      f.fillStyle = lp; f.beginPath(); f.ellipse(540, 600, 320, 70, 0, 0, 7); f.fill();
      // residual handprint on desk (thermal ghost)
      const hpx = 230, hpy = 640;
      f.fillStyle = ga(26.5, 0.75);
      f.beginPath(); f.ellipse(hpx, hpy, 36, 22, -0.2, 0, 7); f.fill();
      [[-34, -26, 0.5], [-12, -36, 0.25], [10, -36, 0], [30, -28, -0.25]].forEach(([dx, dy, a]) => {
        f.beginPath(); f.ellipse(hpx + dx, hpy + dy, 7, 20, a, 0, 7); f.fill();
      });
      f.beginPath(); f.ellipse(hpx + 46, hpy + 2, 7, 18, 1.2, 0, 7); f.fill();

      // ---- laptop: lid back toward camera ----
      const lx0 = 340, lx1 = 720, ly0 = 318, ly1 = 560;
      f.fillStyle = g(25.8);
      f.beginPath(); f.moveTo(lx0 + 14, ly0); f.lineTo(lx1 - 14, ly0); f.lineTo(lx1, ly1); f.lineTo(lx0, ly1); f.closePath(); f.fill();
      // warmer toward hinge/bottom (heat from the base)
      const lg = f.createLinearGradient(0, ly0, 0, ly1);
      lg.addColorStop(0, ga(26, 0)); lg.addColorStop(0.6, ga(28, 0.35)); lg.addColorStop(1, ga(36, 0.9));
      f.fillStyle = lg; f.fill();
      // lid logo-less emblem: cooler circle (different emissivity metal)
      f.fillStyle = g(24.5); f.beginPath(); f.arc((lx0 + lx1) / 2, 420, 22, 0, 7); f.fill();
      // base / hinge: hot exhaust slot
      f.fillStyle = g(41); f.fillRect(lx0 - 6, ly1 - 4, lx1 - lx0 + 12, 14);
      f.fillStyle = g(47); f.fillRect(lx0 + 40, ly1 + 2, 120, 6);
      // exhaust plume
      const pl = f.createLinearGradient(0, ly1 + 10, 0, ly1 + 80);
      pl.addColorStop(0, ga(38, 0.7)); pl.addColorStop(1, ga(30, 0));
      f.fillStyle = pl; f.beginPath(); f.ellipse(lx0 + 100, ly1 + 30, 90, 30, 0, 0, 7); f.fill();
      // hands on keyboard visible either side of lid
      f.fillStyle = g(32.5);
      f.beginPath(); f.ellipse(lx0 - 18, 548, 34, 20, -0.3, 0, 7); f.fill();
      f.beginPath(); f.ellipse(lx1 + 18, 548, 34, 20, 0.3, 0, 7); f.fill();
      f.fillStyle = g(29.5); // fingertips cooler
      for (let i = 0; i < 4; i++) { f.beginPath(); f.arc(lx0 + 6 + i * 6, 560 + i, 6, 0, 7); f.arc(lx1 - 6 - i * 6, 560 + i, 6, 0, 7); f.fill(); }

      // ---- coffee mug ----
      const mx = 820, my = 470, mw = 92, mh = 108;
      const mg = f.createLinearGradient(mx - mw / 2, 0, mx + mw / 2, 0);
      const mT = (T) => g(23 + (T - 23) * mugWarm);
      mg.addColorStop(0, mT(44)); mg.addColorStop(0.35, mT(56)); mg.addColorStop(0.6, mT(57)); mg.addColorStop(1, mT(43));
      f.fillStyle = mg; f.fillRect(mx - mw / 2, my, mw, mh);
      f.beginPath(); f.ellipse(mx, my + mh, mw / 2, 12, 0, 0, Math.PI); f.fill();
      // handle
      f.strokeStyle = mT(46); f.lineWidth = 14;
      f.beginPath(); f.ellipse(mx + mw / 2 + 4, my + 50, 26, 32, 0, -1.3, 1.3); f.stroke();
      // liquid surface: hottest
      f.fillStyle = mT(52); f.beginPath(); f.ellipse(mx, my, mw / 2, 13, 0, 0, 7); f.fill();
      f.fillStyle = g(23 + 44 * coffee); f.beginPath(); f.ellipse(mx, my + 1, mw / 2 - 7, 9, 0, 0, 7); f.fill();
      // mug heat reflected on desk
      f.fillStyle = ga(30, 0.5 * mugWarm); f.beginPath(); f.ellipse(mx, my + mh + 14, 70, 14, 0, 0, 7); f.fill();
      // steam plume: soft rising puffs, cooling and spreading with height
      for (let k = 0; k < 110; k++) {
        const strand = k % 2, u = (k >> 1) / 55, yy = my - 6 - u * 260 + (R() - 0.5) * 14;
        const xx = mx + (strand ? 14 : -14) * (1 - u) + Math.sin(u * 5.2 + t * 1.3 + strand * 2.2) * (6 + u * 34)
          + nz.n2(u * 2.5 + strand * 4, t * 0.4) * 34 * u + (R() - 0.5) * 18 * u;
        const r = 10 + u * 30 + R() * 8;
        const dens = H.clamp(0.6 + nz.n2(u * 6 + strand * 3, t * 0.8) * 1.2, 0.1, 1) * steamOn * (1 - H.smooth((t - 1.1) * 0.9 - 0.15, (t - 1.1) * 0.9 + 0.05, u));
        const gr = f.createRadialGradient(xx, yy, 0, xx, yy, r);
        gr.addColorStop(0, ga(46 - u * 16, 0.2 * dens * (1 - u * 0.75))); gr.addColorStop(1, ga(30, 0));
        f.fillStyle = gr; f.beginPath(); f.arc(xx, yy, r, 0, 7); f.fill();
      }

      // ---- optics: blur the field (lens + low-res microbolometer) ----
      const sharpImg = f.getImageData(0, 0, FW, FH), sharp = sharpImg.data;
      // organic temperature mottling (convection, emissivity variation)
      for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
        const i = (y * FW + x) * 4, m = nz.fbm2(x * 0.02, y * 0.02 + t * 0.05, 3) * 3.2;
        sharp[i] = sharp[i + 1] = sharp[i + 2] = H.clamp(sharp[i] + m, 0, 255);
      }
      f.setTransform(1, 0, 0, 1, 0, 0); f.putImageData(sharpImg, 0, 0);
      const B = H.layer(FW, FH), b = B.getContext('2d');
      b.filter = 'blur(3.2px)'; b.drawImage(F, 0, 0);
      const soft = b.getImageData(0, 0, FW, FH).data;
      // MSX-style edge map from sharp field (Sobel)
      const edge = new Float32Array(FW * FH);
      for (let y = 1; y < FH - 1; y++) for (let x = 1; x < FW - 1; x++) {
        const p = (yy, xx) => sharp[((y + yy) * FW + x + xx) * 4];
        const gx = -p(-1, -1) - 2 * p(0, -1) - p(1, -1) + p(-1, 1) + 2 * p(0, 1) + p(1, 1);
        const gy = -p(-1, -1) - 2 * p(-1, 0) - p(-1, 1) + p(1, -1) + 2 * p(1, 0) + p(1, 1);
        edge[y * FW + x] = Math.min(1, Math.hypot(gx, gy) / 90);
      }
      // auto-range from scene (with slight pumping over time)
      let lo = 255, hi = 0;
      for (let i = 0; i < soft.length; i += 4) { const v = soft[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
      const tLo = TMIN + lo / 255 * (TMAX - TMIN), tHi = TMIN + hi / 255 * (TMAX - TMIN) + Math.sin(t * 0.7) * 0.3;

      // plateau histogram equalisation (what real IR cameras do so faces don't go dull next to a hot mug)
      const hist = new Float32Array(256);
      for (let i = 0; i < soft.length; i += 4) hist[soft[i]]++;
      const plateau = (FW * FH) / 70;
      let tot = 0; for (let i = 0; i < 256; i++) { hist[i] = Math.min(hist[i], plateau); tot += hist[i]; }
      const cdf = new Float32Array(256); let acc = 0;
      for (let i = 0; i < 256; i++) { acc += hist[i]; cdf[i] = acc / tot; }
      const eq = (v255) => { const i = Math.min(254, v255 | 0), f2 = v255 - i; return cdf[i] * (1 - f2) + cdf[i + 1] * f2; };
      // ---- palette mapping at output resolution ----
      const lut = buildLUT();
      const img = ctx.createImageData(W, Hh), d = img.data;
      const colFPN = new Float32Array(W); for (let x = 0; x < W; x++) colFPN[x] = (R() - 0.5) * 0.012 + Math.sin(x * 0.9) * 0.002;
      const sx = FW / W, sy = FH / Hh;
      for (let y = 0; y < Hh; y++) {
        const fy = H.clamp(y * sy - 0.5, 0, FH - 1.001), iy = fy | 0, ay = fy - iy;
        const rowN = (Rn() - 0.5) * 0.006;
        for (let x = 0; x < W; x++) {
          const fx = H.clamp(x * sx - 0.5, 0, FW - 1.001), ix = fx | 0, ax = fx - ix, j = iy * FW + ix;
          const v = ((soft[j * 4] * (1 - ax) + soft[j * 4 + 4] * ax) * (1 - ay) + (soft[(j + FW) * 4] * (1 - ax) + soft[(j + FW) * 4 + 4] * ax) * ay) / 255;
          const e = (edge[j] * (1 - ax) + edge[j + 1] * ax) * (1 - ay) + (edge[j + FW] * (1 - ax) + edge[j + FW + 1] * ax) * ay;
          const T = TMIN + v * (TMAX - TMIN);
          let n = 0.55 * eq(v * 255) + 0.45 * (T - tLo) / (tHi - tLo);
          n = 0.42 + (n - 0.42) * (0.25 + 0.75 * settle); // AGC settling after calibration
          n += (Rn() + Rn() - 1) * 0.022 + colFPN[x] + rowN;
          n += e * 0.035;
          if (t < 0.42) n = 0.36 + (x / W - 0.5) * 0.02 + (Rn() - 0.5) * 0.03; // shutter closed (NUC): flat field
          const li = H.clamp(n, 0, 1) * 1023 | 0;
          const i = (y * W + x) * 4;
          d[i] = lut[li * 3]; d[i + 1] = lut[li * 3 + 1]; d[i + 2] = lut[li * 3 + 2]; d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      // lens vignetting (microbolometer narcissus/ fall-off)
      H.vignette(ctx, W, Hh, 0.35, '0,0,10');

      // ---- HUD ----
      const tempAt = (x, y) => { const j = ((y * sy) | 0) * FW + ((x * sx) | 0); return TMIN + soft[j * 4] / 255 * (TMAX - TMIN); };
      ctx.save();
      ctx.textBaseline = 'middle';
      const hudText = (s, x, y, font, align = 'left', col = '#fff') => {
        ctx.font = font; ctx.textAlign = align;
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillText(s, x + 1.5, y + 1.5);
        ctx.fillStyle = col; ctx.fillText(s, x, y);
      };
      const line = (pts, w = 2) => {
        ctx.lineCap = 'butt';
        ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = w + 2; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = w; ctx.stroke();
      };
      // spot meter crosshair on the mug
      const hudOn = t >= 0.45;
      const glide = H.ease.inOut(H.smooth(1.9, 2.7, t));
      const cx = Math.round(H.lerp(640, mx + 4, glide)), cy = Math.round(H.lerp(360, my + 4, glide));
      const spotT = tempAt(cx, cy) + Math.sin(t * 3.1) * 0.1;
      if (!hudOn) { ctx.font = '600 22px "Inter"'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.textAlign = 'center'; ctx.fillText('CALIBRATING\u2026', W / 2, Hh / 2); ctx.restore(); return; }
      line([[cx - 30, cy], [cx - 9, cy]]); line([[cx + 9, cy], [cx + 30, cy]]);
      line([[cx, cy - 30], [cx, cy - 9]]); line([[cx, cy + 9], [cx, cy + 30]]);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, 2, 0, 7); ctx.stroke();
      hudText(spotT.toFixed(1) + '\u00b0', cx + 36, cy - 22, '600 20px "Inter"');
      // measurement box on GPU rack
      const bx0 = 1074, by0 = 160, bx1 = 1200, by1 = 360;
      const boxP = H.ease.out(H.smooth(2.85, 3.15, t));
      const bl = (a, b) => H.lerp(a, b, boxP), mxb = bx0 + 63, myb = by0 + 100;
      ctx.setLineDash([]);
      if (boxP > 0) line([[bl(mxb, bx0), bl(myb, by0)], [bl(mxb, bx1), bl(myb, by0)], [bl(mxb, bx1), bl(myb, by1)], [bl(mxb, bx0), bl(myb, by1)], [bl(mxb, bx0), bl(myb, by0) - 1]], 2);
      let bmax = -99, bmx = 0, bmy = 0;
      for (let y = by0; y < by1; y += 4) for (let x = bx0; x < bx1; x += 4) { const T = tempAt(x, y); if (T > bmax) { bmax = T; bmx = x; bmy = y; } }
      if (boxP >= 1) hudText('Bx1', bx0 + 4, by0 - 14, '600 16px "Inter"');
      // hot/cold markers
      const tri = (x, y, col, up) => {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.moveTo(x - 9, y + (up ? 8 : -8) + 1); ctx.lineTo(x + 10, y + (up ? 8 : -8) + 1); ctx.lineTo(x + 1, y + (up ? -8 : 8) + 1); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - 9, y + (up ? 8 : -8)); ctx.lineTo(x + 9, y + (up ? 8 : -8)); ctx.lineTo(x, y + (up ? -8 : 8)); ctx.fill();
      };
      if (boxP >= 1) tri(bmx, bmy, '#ff2a1a', true);
      tri(110, 300, '#28a8ff', false);

      // top-left measurement table
      ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.fillRect(18, 18, 238, boxP >= 1 ? 84 : 46);
      hudText('Sp1', 30, 40, '600 22px "Inter"'); hudText(spotT.toFixed(1) + ' °C', 244, 40, '600 22px "Inter"', 'right');
      if (boxP >= 1) { hudText('Bx1  Max', 30, 78, '600 22px "Inter"'); hudText(bmax.toFixed(1) + ' °C', 244, 78, '600 22px "Inter"', 'right'); }
      // top-right status: emissivity + battery
      hudText('ε 0.95   IRONBOW', 1090, 34, '400 16px "Inter"', 'right');
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(1112, 25, 34, 17); ctx.fillStyle = '#fff'; ctx.fillRect(1146, 30, 3, 7);
      ctx.fillRect(1115, 28, 21, 11);
      hudText('AUTO', 1172, 34, '600 16px "Inter"');

      // colour scale bar (right edge)
      const sbx = 1218, sbt = 112, sbb = 600;
      const sg = ctx.createLinearGradient(0, sbb, 0, sbt);
      IRONBOW.forEach(([p, c]) => sg.addColorStop(p, H.rgba(c, 1)));
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(sbx - 2, sbt - 2, 26, sbb - sbt + 4);
      ctx.fillStyle = sg; ctx.fillRect(sbx, sbt, 22, sbb - sbt);
      hudText(tHi.toFixed(1), sbx + 22, sbt - 20, '600 20px "Inter"', 'right');
      hudText(tLo.toFixed(1), sbx + 22, sbb + 22, '600 20px "Inter"', 'right');
      hudText('°C', sbx + 11, sbb + 48, '400 16px "Inter"', 'center');

      // annotation tag (on-screen label)
      ctx.fillStyle = 'rgba(0,0,0,0.42)'; ctx.fillRect(18, t >= 3.1 ? 640 : 670, 330, t >= 3.1 ? 62 : 32);
      if (t >= 3.1) hudText('GPU LOAD: ' + Math.round(98 * H.ease.out(H.smooth(3.1, 3.8, t))) + '%', 32, 662, '600 22px "Inter"');
      const hh = 23 + Math.floor(t / 60), ss = (41 * 60 + 7 + Math.floor(t)) % 3600;
      hudText(`2026-10-09  ${hh}:${String(Math.floor(ss / 60)).padStart(2, '0')}:${String(ss % 60).padStart(2, '0')}`, 32, 688, '600 16px "IBM Plex Mono"', 'left', 'rgba(255,255,255,0.85)');
      ctx.restore();
    },
  });
}
```
