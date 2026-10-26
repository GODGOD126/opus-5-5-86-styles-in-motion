I want an animated explainer made in the "Hidden-Line Wireframe" visual style (Dimensional). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): IBM Plex Mono, Space Mono
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Space+Mono:wght@400;700&display=block">
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
Name: Hidden-Line Wireframe
Family: Dimensional
Look: Vector-display 3D: a perspective wire-mesh landscape with true hidden-line removal (back-to-front quads filled with the night before stroking), a wireframe moon, phosphor-cyan lines with bloom on deep navy, and HUD coordinate labels.
Motion: HUD brackets snap on, the wireframe moon traces itself, then the hidden-line mesh is scanned in row by row from the camera to the horizon behind a bright scan front; markers lock on and labels type out while the camera glides forward and the scan keeps sweeping.
How it explains: Learning is shown as descent over the hidden-line “loss landscape”: the camera flies the mesh from a data-feed HUD streaming into the wireframe-sphere model, down to an amber “model weights” marker whose error becomes a dashed downhill vector, then follows it into the glowing basin; labels are bracketed HUD tags that type on, numbers are big Space Mono readouts.

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

REFERENCE STYLE SOURCE (styles/wireframe-terrain.js; W/H_ are always 1280x720)
```js
{
  // ---------- perspective camera + hidden-line heightfield (back-to-front quads, each filled with bg then stroked) ----------
  function makeCam(pos, pitch, f, cx, cy) {
    const c = Math.cos(pitch), s = Math.sin(pitch);
    return (x, y, z) => {
      const dx = x - pos[0], dy = y - pos[1], dz = z - pos[2];
      const yc = dy * c + dz * s, zc = -dy * s + dz * c;
      return [cx + (f * dx) / zc, cy - (f * yc) / zc, zc];
    };
  }

  // ================= EXPLAINER: learning as a descent over the hidden-line "loss landscape"; the camera flies the terrain =================
  function makeCamYP(pos, yaw, pitch, f, cx, cy) {
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), c = Math.cos(pitch), s = Math.sin(pitch);
    return (x, y, z) => {
      const dx0 = x - pos[0], dy = y - pos[1], dz0 = z - pos[2];
      const dx = dx0 * cyw - dz0 * syw, dz = dx0 * syw + dz0 * cyw;
      const yc = dy * c + dz * s, zc = -dy * s + dz * c;
      return [cx + (f * dx) / zc, cy - (f * yc) / zc, zc];
    };
  }
  function wfIcon(ctx, kind, x, y, r, col) {
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineJoin = 'miter'; ctx.beginPath();
    // vector-display line art: polygonal head, ears, eyes as short strokes
    const head = [[-0.8, -0.2], [-0.55, 0.65], [0, 0.85], [0.55, 0.65], [0.8, -0.2], [0.45, -0.7], [-0.45, -0.7]];
    head.forEach((p, i) => i ? ctx.lineTo(p[0] * r, p[1] * r) : ctx.moveTo(p[0] * r, p[1] * r)); ctx.closePath();
    if (kind === 'cat') { ctx.moveTo(-0.75 * r, -0.35 * r); ctx.lineTo(-0.7 * r, -1.1 * r); ctx.lineTo(-0.3 * r, -0.7 * r); ctx.moveTo(0.75 * r, -0.35 * r); ctx.lineTo(0.7 * r, -1.1 * r); ctx.lineTo(0.3 * r, -0.7 * r); for (const sx of [-1, 1]) { ctx.moveTo(sx * 0.3 * r, 0.35 * r); ctx.lineTo(sx * 1.1 * r, 0.25 * r); } }
    else { ctx.moveTo(-0.55 * r, -0.65 * r); ctx.lineTo(-1.1 * r, -0.2 * r); ctx.lineTo(-0.85 * r, 0.5 * r); ctx.moveTo(0.55 * r, -0.65 * r); ctx.lineTo(1.1 * r, -0.2 * r); ctx.lineTo(0.85 * r, 0.5 * r); ctx.moveTo(-0.15 * r, 0.35 * r); ctx.lineTo(0.15 * r, 0.35 * r); ctx.lineTo(0, 0.5 * r); ctx.closePath(); }
    for (const sx of [-1, 1]) { ctx.moveTo(sx * 0.42 * r, -0.12 * r); ctx.lineTo(sx * 0.2 * r, -0.12 * r); }
    ctx.stroke(); ctx.restore();
  }
  function hudBox(ctx, x, y, w, h, prog = 1, accent = '#7feaff') {
    if (prog <= 0) return;
    const ww = w * prog;
    ctx.fillStyle = 'rgba(3,8,30,0.86)'; ctx.fillRect(x, y, ww, h);
    ctx.strokeStyle = H.rgba(accent, 0.45); ctx.lineWidth = 1.2; ctx.strokeRect(x + 0.5, y + 0.5, ww - 1, h - 1);
    ctx.fillStyle = accent; ctx.fillRect(x, y, 4, h);
    const c = 12; ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(x + ww - c, y); ctx.lineTo(x + ww, y); ctx.lineTo(x + ww, y + c); ctx.moveTo(x + ww, y + h - c); ctx.lineTo(x + ww, y + h); ctx.lineTo(x + ww - c, y + h); ctx.stroke();
  }
  function hudTag(ctx, x, y, text, o = {}) {
    const k = o.k ?? 1; if (k <= 0) return;
    ctx.save(); ctx.font = o.font || '600 24px "IBM Plex Mono"';
    const full = text, shown = full.slice(0, Math.ceil(full.length * Math.min(1, k * 1.4)));
    const w = ctx.measureText(full).width + 28, h = o.h || 42, col = o.col || '#7feaff';
    const bx = o.align === 'left' ? x : x - w / 2;
    ctx.fillStyle = o.bg || 'rgba(3,8,30,0.88)'; ctx.fillRect(bx, y - h / 2, w * Math.min(1, k * 2), h);
    ctx.strokeStyle = H.rgba(col, 0.8); ctx.lineWidth = 1.5; ctx.strokeRect(bx + 0.5, y - h / 2 + 0.5, w * Math.min(1, k * 2) - 1, h - 1);
    ctx.fillStyle = col; ctx.textBaseline = 'middle'; ctx.fillText(shown, bx + 14, y + 1);
    ctx.restore();
  }
  function wfArrow(ctx, pts, prog, col, w = 2.5) {
    if (prog <= 0 || pts.length < 2) return null;
    const n = pts.length - 1, m = prog * n, i0 = Math.floor(m), f = m - i0;
    const vis = pts.slice(0, i0 + 1); if (i0 < n) vis.push([H.lerp(pts[i0][0], pts[i0 + 1][0], f), H.lerp(pts[i0][1], pts[i0 + 1][1], f)]);
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.setLineDash([10, 6]);
    ctx.beginPath(); vis.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.setLineDash([]);
    const e = vis[vis.length - 1], e0 = vis[Math.max(0, vis.length - 2)], ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
    ctx.translate(e[0], e[1]); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-12, -8); ctx.moveTo(4, 0); ctx.lineTo(-12, 8); ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
    return e;
  }
  function wfExplainer(ctx, W, H_, t) {
    const ph = (a, b) => H.clamp((t - a) / (b - a));
    const E = (a, b) => H.ease.inOut(ph(a, b));
    const EO = (a, b) => H.ease.out(ph(a, b));
    const typed = (str, a, b) => str.slice(0, Math.round(str.length * ph(a, b)));
    const nz = H.makeNoise(12);
    const NAVY = [5, 10, 34], CY = '#7feaff', AMB = '#ffd36b', RED = '#ff5a6e', GRN = '#5dffb0';
    const height = (x, z) => {
      const ridge = (u, v) => 1 - Math.abs(nz.n2(u, v));
      let h = Math.pow(ridge(x * 0.04, z * 0.04), 2.2) * 11 + nz.fbm2(x * 0.08, z * 0.08, 3) * 3;
      const side = Math.pow(Math.abs(x) / 70, 1.6) * 9;
      h = h * (0.35 + H.smooth(4, 40, Math.abs(x)) * 0.9) + side;
      h += H.smooth(105, 175, z) * Math.pow(ridge(x * 0.025 + 7, z * 0.02), 1.6) * (16 + 16 * H.smooth(-60, 20, x));
      const db = Math.hypot(x - 4, z - 84);
      h -= 10 * Math.exp(-(db * db) / 160);
      return h - 2;
    };
    // the ball = current model weights, a point on the loss surface; one step downhill per training round
    const PATH = [[-34, 66], [-24, 70], [-15, 74], [-8, 78], [-2, 81], [1, 83], [3, 84], [4, 84]];
    const stepT = [8.75, 11.0, 11.3, 11.6, 11.9, 12.2, 12.5];
    let bi = 0, bf = 0;
    for (let i = 0; i < stepT.length; i++) { if (t >= stepT[i] + 0.3) bi = i + 1; else if (t > stepT[i]) { bi = i; bf = H.ease.inOut((t - stepT[i]) / 0.3); break; } else break; }
    const bp = bi < PATH.length - 1 ? [H.lerp(PATH[bi][0], PATH[bi + 1][0], bf), H.lerp(PATH[bi][1], PATH[bi + 1][1], bf)] : PATH[PATH.length - 1];
    const ball = [bp[0], height(bp[0], bp[1]) + 1.0, bp[1]];
    // camera flight: [t, x, y, z, yaw, pitch]
    const KF = [[0, 0, 22, -8, 0, 0.1], [1.8, 0, 22, -6, 0, 0.1], [2.9, 6, 24, 4, 0.12, 0.02], [5.9, 6, 24, 8, 0.14, 0.02], [7.0, -22, 21, 40, -0.08, 0.22], [10.3, -22, 21, 43, -0.06, 0.22], [11.2, -16, 40, 30, 0.02, 0.55], [12.9, -13, 40, 33, 0.05, 0.55], [13.9, -8, 50, 14, 0.04, 0.5], [20, -8, 50, 15, 0.04, 0.5]];
    let k = 0; while (k < KF.length - 2 && t > KF[k + 1][0]) k++;
    const A = KF[k], B = KF[k + 1], u = H.ease.inOut(H.clamp((t - A[0]) / (B[0] - A[0])));
    const L = (i) => H.lerp(A[i], B[i], u);
    const camPos = [L(1), L(2), L(3)], yaw = L(4), pitch = L(5);
    const cam = makeCamYP(camPos, yaw, pitch, 760, W / 2, H_ / 2);
    const HORIZON_Y = H_ / 2 - 760 * Math.tan(pitch);
    // ---------- sky ----------
    const sky = ctx.createLinearGradient(0, 0, 0, HORIZON_Y + 40);
    sky.addColorStop(0, '#02051a'); sky.addColorStop(0.75, '#081440'); sky.addColorStop(1, '#0f2160');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H_);
    { const gg = ctx.createLinearGradient(0, HORIZON_Y - 10, 0, HORIZON_Y + 120); gg.addColorStop(0, 'rgba(5,10,34,0)'); gg.addColorStop(1, 'rgba(5,10,34,1)'); ctx.fillStyle = gg; ctx.fillRect(0, HORIZON_Y - 10, W, H_); }
    const r0 = H.rng(3);
    for (let i = 0; i < 160; i++) { const x = r0() * W, y = r0() * Math.max(0, HORIZON_Y), a = r0() * 0.7; ctx.fillStyle = `rgba(190,240,255,${a})`; ctx.fillRect(x, y, 1, 1); }
    // ---------- the model: wireframe sphere in the sky (front hemisphere only) ----------
    const MOON = [W / 2 + 290 - yaw * 600, HORIZON_Y - 130 + (camPos[1] - 22) * 2, 104];
    const err = ph(7.5, 7.9) * (1 - ph(9.0, 9.4));
    {
      const [mx, my, R] = MOON, tilt = 0.42, spin = t * 0.25 + E(8.6, 9.2) * 1.2;
      const halo = ctx.createRadialGradient(mx, my, R * 0.9, mx, my, R * 2.2);
      halo.addColorStop(0, err > 0 ? `rgba(255,90,110,${0.25 * err})` : 'rgba(80,220,255,0.18)'); halo.addColorStop(1, 'rgba(80,220,255,0)');
      ctx.fillStyle = halo; ctx.fillRect(mx - R * 2.3, my - R * 2.3, R * 4.6, R * 4.6);
      ctx.fillStyle = '#040a26'; ctx.beginPath(); ctx.arc(mx, my, R, 0, 7); ctx.fill();
      const P = (lat, lon) => { const x = Math.cos(lat) * Math.cos(lon + spin), y = Math.sin(lat), z = Math.cos(lat) * Math.sin(lon + spin); return [mx + x * R, my - (y * Math.cos(tilt) - z * Math.sin(tilt)) * R, y * Math.sin(tilt) + z * Math.cos(tilt)]; };
      const lc = H.mix(H.hex('#6eebff'), H.hex(RED), err);
      const seg = (pts) => { for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; if (a[2] < 0 && b[2] < 0) continue; ctx.strokeStyle = H.rgba(lc, 0.15 + 0.6 * H.clamp((a[2] + b[2]) / 2 + 0.25)); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); } };
      for (let la = -75; la <= 75; la += 15) { const pts = []; for (let lo = 0; lo <= 360; lo += 8) pts.push(P(la * Math.PI / 180, lo * Math.PI / 180)); seg(pts); }
      for (let lo = 0; lo < 360; lo += 15) { const pts = []; for (let la = -90; la <= 90; la += 8) pts.push(P(la * Math.PI / 180, lo * Math.PI / 180)); seg(pts); }
      ctx.strokeStyle = H.rgba(H.mix(H.hex('#96f5ff'), H.hex(RED), err), 0.95); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(mx, my, R, 0, 7); ctx.stroke();
    }
    // ---------- hidden-line terrain ----------
    const STEP = 2.5, X0 = -150, X1 = 150, Z0 = -10, Z1 = 190;
    const nx = (X1 - X0) / STEP, nzr = (Z1 - Z0) / STEP;
    const PTS = [];
    for (let j = 0; j <= nzr; j++) { const row = []; for (let i = 0; i <= nx; i++) { const x = X0 + i * STEP, z = Z0 + j * STEP, y = height(x, z); row.push([...cam(x, y, z), y]); } PTS.push(row); }
    const scanZ = camPos[2] + 30 + (((t) * 26) % 150);
    // path tiles visited by the ball glow amber (the descent trail)
    // the visited route (PATH[0] .. current ball position), sampled every 0.5 units so the trail is continuous
    const route = [];
    if (t > 6.9) {
      route.push(PATH[0]);
      for (let i = 0; i < PATH.length - 1 && i <= bi; i++) {
        const a = PATH[i], b = i < bi ? PATH[i + 1] : bp, len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(len / 0.5);
        for (let q = 1; q <= n; q++) route.push([H.lerp(a[0], b[0], q / n), H.lerp(a[1], b[1], q / n)]);
      }
    }
    const trail = new Set();
    for (const [rx0, rz0] of route) trail.add(Math.round((rx0 - X0) / STEP) + ',' + Math.round((rz0 - Z0) / STEP));
    // far edge of the mesh: when the camera pitches down (final shots) the last ~45 units dissolve into haze
    const edgeK = H.smooth(0.25, 0.5, pitch), HAZE = [14, 30, 88];
    {
      let fy = 0, fn = 0, fyMax = -1e9; for (const p of PTS[nzr]) if (p[2] > 1 && p[0] > -40 && p[0] < W + 40) { fy += p[1]; fn++; fyMax = Math.max(fyMax, p[1]); }
      if (fn && edgeK > 0) {
        fy /= fn; const top = Math.min(0, fy - 260), bot = Math.min(H_, fyMax + 60), g = ctx.createLinearGradient(0, top, 0, fy + 40);
        g.addColorStop(0, `rgba(6,14,48,${edgeK})`); g.addColorStop(0.75, `rgba(12,27,80,${edgeK})`); g.addColorStop(1, `rgba(14,30,88,${edgeK})`);
        ctx.fillStyle = g; ctx.fillRect(0, top, W, bot - top);
        const gl = ctx.createLinearGradient(0, fy - 60, 0, fy + 30); gl.addColorStop(0, 'rgba(60,150,255,0)'); gl.addColorStop(0.75, `rgba(70,170,255,${0.14 * edgeK})`); gl.addColorStop(1, 'rgba(60,150,255,0)');
        ctx.fillStyle = gl; ctx.fillRect(0, fy - 60, W, 90);
      }
    }
    ctx.lineJoin = 'round';
    for (let j = nzr - 1; j >= 0; j--) {
      const zw = Z0 + j * STEP;
      const fog = H.clamp(H.smooth(45, 200, zw - camPos[2]));
      const edge = edgeK * H.smooth(Z1 - 45, Z1, zw + STEP);
      const fill = H.mix(H.mix(NAVY, HAZE, fog), HAZE, edge);
      const scan = Math.exp(-Math.pow((zw - scanZ) / 2.2, 2)) * 0.8 * (1 - edge);
      const order = []; for (let i = 0; i < nx; i++) order.push(i);
      const cx0 = camPos[0];
      order.sort((a, b) => Math.abs(X0 + (b + 0.5) * STEP - cx0) - Math.abs(X0 + (a + 0.5) * STEP - cx0));
      for (const i of order) {
        const a = PTS[j][i], b = PTS[j][i + 1], c = PTS[j + 1][i + 1], d = PTS[j + 1][i];
        if (a[2] < 1 || b[2] < 1 || c[2] < 1 || d[2] < 1) continue;
        if (Math.max(a[0], b[0], c[0], d[0]) < -20 || Math.min(a[0], b[0], c[0], d[0]) > W + 20 || Math.min(a[1], b[1], c[1], d[1]) > H_ + 20) continue;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
        const tr = trail.has(i + ',' + j);
        const fc = tr ? H.mix(fill, [120, 84, 20], 0.22) : fill;
        ctx.fillStyle = `rgb(${fc[0] | 0},${fc[1] | 0},${fc[2] | 0})`; ctx.fill();
        const hk = H.clamp((a[3] + 2) / 16);
        let col = H.mix([40, 200, 255], [210, 250, 255], hk * 0.8); if (tr) col = H.mix(col, H.hex(AMB), 0.55);
        col = H.mix(col, [255, 255, 255], scan);
        ctx.strokeStyle = H.rgba(col, H.clamp((1 - fog * 0.85) * (0.55 + hk * 0.45) + scan + (tr ? 0.1 : 0)) * (1 - edge));
        ctx.lineWidth = H.clamp(1.6 - a[2] / 90, 0.45, 1.6);
        ctx.stroke();
      }
    }
    // the descent so far as one continuous glowing amber path draped on the surface
    if (route.length > 1) {
      const pp = route.map(([x, z]) => cam(x, height(x, z) + 0.35, z)).filter((p) => p[2] > 1);
      if (pp.length > 1) {
        ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.shadowColor = AMB; ctx.shadowBlur = 12;
        ctx.strokeStyle = 'rgba(255,211,107,0.55)'; ctx.lineWidth = 6; ctx.beginPath(); pp.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
        ctx.shadowBlur = 0; ctx.strokeStyle = '#fff1c4'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.restore();
      }
    }
    // bloom
    { const Lb = H.layer(W, H_), lc = Lb.getContext('2d'); lc.filter = 'blur(6px)'; lc.drawImage(ctx.canvas, 0, 0, W, H_); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5; ctx.drawImage(Lb, 0, 0); ctx.restore(); }

    // ---------- beat 2: data feed panel streaming into the model ----------
    if (t > 2.4 && t < 6.9) {
      const pk = E(2.4, 2.8) * (1 - E(6.5, 6.9));
      const px = 70, py = 150, pw = 520, ph2 = 470;
      hudBox(ctx, px, py, pw, ph2, pk);
      if (pk > 0.9) {
        const cnt = Math.floor(1e6 * Math.pow(EO(2.9, 5.7), 1.6));
        ctx.font = '400 22px "IBM Plex Mono"'; ctx.fillStyle = 'rgba(127,234,255,0.8)'; ctx.fillText('TRAINING DATA', px + 26, py + 42);
        ctx.font = '700 68px "Space Mono"'; ctx.fillStyle = '#e8fbff'; ctx.fillText(cnt.toLocaleString('en-US'), px + 24, py + 118);
        ctx.font = '600 24px "IBM Plex Mono"'; ctx.fillStyle = CY; ctx.fillText('EXAMPLES', px + 26, py + 156);
        // scrolling feed of labelled examples
        ctx.save(); ctx.beginPath(); ctx.rect(px + 10, py + 176, pw - 20, ph2 - 186); ctx.clip();
        const scroll = (t - 2.8) * 140;
        for (let i = -1; i < 6; i++) {
          const idx = i + Math.floor(scroll / 92), y = py + 176 + i * 92 + (scroll % 92) - 92 + 92;
          for (let c = 0; c < 2; c++) {
            const kind = ((idx * 2 + c) * 7 + 3) % 5 < 2 ? 'dog' : 'cat';
            const x = px + 30 + c * 240;
            ctx.strokeStyle = 'rgba(127,234,255,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 8.5, 220, 76);
            wfIcon(ctx, kind, x + 42, y + 48, 20, '#e8fbff');
            ctx.font = '600 26px "IBM Plex Mono"'; ctx.fillStyle = kind === 'cat' ? CY : AMB; ctx.fillText(kind.toUpperCase(), x + 84, y + 56);
          }
        }
        ctx.restore();
        // data streams into the sphere: vector lines with moving packets
        for (let s2 = 0; s2 < 3; s2++) {
          const a = [px + pw, py + 230 + s2 * 90], b = [MOON[0] - MOON[2] * 0.9, MOON[1] + (s2 - 1) * 40];
          const pr = E(3.2 + s2 * 0.15, 3.9 + s2 * 0.15);
          ctx.strokeStyle = 'rgba(127,234,255,0.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(H.lerp(a[0], b[0], pr), H.lerp(a[1], b[1], pr)); ctx.stroke(); ctx.setLineDash([]);
          if (pr >= 1) for (let q = 0; q < 3; q++) { const uu = (t * 0.9 + q / 3 + s2 * 0.2) % 1; ctx.fillStyle = '#e8fbff'; ctx.shadowColor = CY; ctx.shadowBlur = 10; ctx.fillRect(H.lerp(a[0], b[0], uu) - 3, H.lerp(a[1], b[1], uu) - 3, 6, 6); ctx.shadowBlur = 0; }
        }
      }
      hudTag(ctx, MOON[0], MOON[1] + MOON[2] + 40, 'MODEL', { k: EO(3.9, 4.3) * (1 - ph(6.5, 6.9)), font: '600 28px "IBM Plex Mono"', h: 44 });
    }

    // ---------- beat 3: guess → check → adjust on the landscape ----------
    const bS = cam(...ball);
    if (t > 6.9 && bS[2] > 1 && bS[0] > 40 && bS[0] < W - 40 && bS[1] > 0 && bS[1] < H_) {
      // the ball: weights as a point on the loss surface
      const pulse = 1 + 0.2 * Math.sin(t * 6);
      ctx.save(); ctx.strokeStyle = AMB; ctx.shadowColor = AMB; ctx.shadowBlur = 16; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(bS[0], bS[1], 16 * pulse, 0, 7); ctx.stroke();
      ctx.fillStyle = AMB; ctx.beginPath(); ctx.arc(bS[0], bS[1], 5, 0, 7); ctx.fill();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.beginPath(); ctx.moveTo(bS[0] + dx * 18, bS[1] + dy * 18); ctx.lineTo(bS[0] + dx * 28, bS[1] + dy * 28); ctx.stroke(); }
      ctx.restore();
      if (t < 13.3) hudTag(ctx, bS[0] + 40, bS[1] + 38, 'MODEL WEIGHTS', { k: EO(7.0, 7.4) * (1 - ph(10.6, 11.0)), font: '600 28px "IBM Plex Mono"', h: 44, col: AMB, align: 'left' });
    }
    if (t > 6.9 && t < 10.8) {
      const fade = 1 - ph(10.4, 10.8);
      ctx.save(); ctx.globalAlpha = fade;
      // readout panel
      const rx = 760, ry = 120, rw = 450, rh = 250;
      hudBox(ctx, rx, ry, rw, rh, E(6.95, 7.3), t > 7.45 && t < 9.4 ? RED : t >= 9.4 ? GRN : CY);
      if (t > 7.25) {
        ctx.strokeStyle = 'rgba(127,234,255,0.5)'; ctx.strokeRect(rx + 24.5, ry + 70.5, 120, 120); wfIcon(ctx, 'cat', rx + 84, ry + 136, 34, '#e8fbff');
        ctx.font = '400 22px "IBM Plex Mono"'; ctx.fillStyle = 'rgba(127,234,255,0.8)'; ctx.fillText('INPUT', rx + 26, ry + 46);
        const right = t >= 9.4;
        ctx.fillText('GUESS', rx + 176, ry + 46);
        ctx.font = '700 60px "Space Mono"'; ctx.fillStyle = right ? GRN : (t > 7.45 ? RED : '#e8fbff');
        const g = right ? typed('CAT', 9.4, 9.6) : typed('DOG?', 7.25, 7.45);
        ctx.fillText(g, rx + 172, ry + 130);
        if (t > 7.45) {
          const mk = right ? EO(9.6, 9.8) : EO(7.45, 7.6);
          ctx.save(); ctx.strokeStyle = right ? GRN : RED; ctx.lineWidth = 6; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 14; ctx.beginPath();
          const cx2 = rx + 390, cy2 = ry + 112;
          if (right) { ctx.moveTo(cx2 - 22, cy2); ctx.lineTo(cx2 - 22 + 14 * mk, cy2 + 16 * mk); if (mk > 0.5) ctx.lineTo(cx2 - 8 + 30 * (mk - 0.5) * 2, cy2 + 16 - 36 * (mk - 0.5) * 2); }
          else { ctx.moveTo(cx2 - 20, cy2 - 20); ctx.lineTo(cx2 - 20 + 40 * mk, cy2 - 20 + 40 * mk); ctx.moveTo(cx2 + 20, cy2 - 20); ctx.lineTo(cx2 + 20 - 40 * mk, cy2 - 20 + 40 * mk); }
          ctx.stroke(); ctx.restore();
          ctx.font = '600 24px "IBM Plex Mono"'; ctx.fillStyle = right ? GRN : AMB;
          ctx.fillText(right ? typed('LOSS LOWER ✓', 9.6, 10.0) : typed('ANSWER: CAT', 7.6, 8.0), rx + 176, ry + 186);
          // loss meter
          const loss = right ? 0.42 : 0.91;
          ctx.fillStyle = 'rgba(127,234,255,0.15)'; ctx.fillRect(rx + 26, ry + 214, rw - 52, 12);
          ctx.fillStyle = right ? GRN : RED; ctx.fillRect(rx + 26, ry + 214, (rw - 52) * loss, 12);
        }
        // emphasis: flashing red frame around the readout on the wrong guess
        if (t > 7.45 && t < 9.4 && Math.floor(t * 8) % 2 === 0 && t < 8.2) { ctx.strokeStyle = RED; ctx.lineWidth = 4; ctx.strokeRect(rx - 8, ry - 8, rw + 16, rh + 16); }
      }
      // step labels pinned to things
      hudTag(ctx, rx + rw / 2, ry - 34, '1 GUESS', { k: EO(7.0, 7.35), font: '700 28px "Space Mono"' });
      if (t > 7.5) hudTag(ctx, rx + rw - 90, ry + rh + 34, '2 CHECK', { k: EO(7.5, 7.85), font: '700 28px "Space Mono"', col: t >= 9.4 ? GRN : RED });
      // 3 Adjust: the error becomes a gradient arrow pointing downhill; the weights step along it
      if (t > 8.0 && bS[2] > 1) {
        const pts = [];
        for (let q = 0; q <= 8; q++) { const xx = H.lerp(PATH[0][0], PATH[1][0] + 4, q / 8), zz = H.lerp(PATH[0][1], PATH[1][1] + 1.5, q / 8); const p = cam(xx, height(xx, zz) + 1.4, zz); pts.push(p); }
        const e = wfArrow(ctx, pts, E(8.0, 8.6), RED, 3);
        // keep the weights tag on top of the downhill vector (same tag as above, redrawn over the arrow)
        if (bS[0] > 40 && bS[0] < W - 40 && bS[1] > 0 && bS[1] < H_) hudTag(ctx, bS[0] + 40, bS[1] + 38, 'MODEL WEIGHTS', { k: EO(7.0, 7.4) * (1 - ph(10.6, 11.0)), font: '600 28px "IBM Plex Mono"', h: 44, col: AMB, align: 'left' });
        if (e) hudTag(ctx, e[0] + 30, e[1] - 54, '3 ADJUST', { k: EO(8.4, 8.8), font: '700 28px "Space Mono"', col: RED, align: 'left' });
        if (t < 9.3) hudTag(ctx, pts[0][0] - 40, pts[0][1] + 90, 'ERROR → DOWNHILL', { k: EO(8.1, 8.5) * (1 - ph(9.0, 9.3)), font: '600 28px "IBM Plex Mono"', h: 44, col: RED, align: 'left' });
      }
      ctx.restore();
    }

    // ---------- beat 4: repeated rounds roll the weights into the basin; accuracy climbs ----------
    const ACCS = [61, 72, 80, 86, 90, 93, 95, 97];
    if (t > 10.7) {
      const cur = Math.round(H.lerp(61, 97, H.ease.inOut(ph(11.0, 12.7))));
      const pk = E(10.7, 11.0);
      const px = 760, py = 120, pw = 450, ph2 = 300;
      if (t < 13.3) {
        ctx.save(); ctx.globalAlpha = 1 - ph(13.0, 13.3);
        hudBox(ctx, px, py, pw, ph2, pk, cur >= 97 ? GRN : CY);
        if (pk > 0.9) {
          ctx.font = '400 22px "IBM Plex Mono"'; ctx.fillStyle = 'rgba(127,234,255,0.8)'; ctx.fillText('ACCURACY', px + 26, py + 42);
          const pop = t > 12.7 ? 1 + 0.15 * Math.sin(Math.min(1, (t - 12.7) / 0.3) * Math.PI) : 1;
          ctx.save(); ctx.translate(px + 24, py + 120); ctx.scale(pop, pop);
          ctx.font = '700 80px "Space Mono"'; ctx.fillStyle = cur >= 97 ? GRN : '#e8fbff'; if (cur >= 97) { ctx.shadowColor = GRN; ctx.shadowBlur = 20; } ctx.fillText(cur + '%', 0, 0); ctx.restore();
          ctx.font = '600 22px "IBM Plex Mono"'; ctx.fillStyle = AMB; ctx.fillText(`ROUND ${Math.min(8, 1 + Math.floor(ph(11.0, 12.7) * 7.99))}`, px + 300, py + 112);
          // chart
          const gx0 = px + 30, gx1 = px + pw - 30, gy0 = py + ph2 - 26, gy1 = py + 150;
          ctx.strokeStyle = 'rgba(127,234,255,0.2)'; ctx.lineWidth = 1; for (let i = 0; i <= 3; i++) { const y = H.lerp(gy0, gy1, i / 3); ctx.beginPath(); ctx.moveTo(gx0, y); ctx.lineTo(gx1, y); ctx.stroke(); }
          const cp = H.ease.inOut(ph(11.0, 12.7)) * 7, m = Math.floor(cp), f = cp - m;
          const pts = ACCS.map((a, i) => [H.lerp(gx0, gx1, i / 7), H.lerp(gy0, gy1, (a - 55) / 45)]);
          const vis = pts.slice(0, m + 1); if (m < 7) vis.push([H.lerp(pts[m][0], pts[m + 1][0], f), H.lerp(pts[m][1], pts[m + 1][1], f)]);
          ctx.save(); ctx.strokeStyle = GRN; ctx.shadowColor = GRN; ctx.shadowBlur = 10; ctx.lineWidth = 2.5; ctx.beginPath(); vis.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.restore();
          vis.forEach((p, i) => { if (i <= m) { ctx.fillStyle = '#e8fbff'; ctx.fillRect(p[0] - 3, p[1] - 3, 6, 6); } });
        }
        if (t > 12.7) { ctx.strokeStyle = GRN; ctx.lineWidth = 3; ctx.globalAlpha *= 1 - ph(12.7, 13.3); const g2 = 10 + 30 * EO(12.7, 13.3); ctx.strokeRect(px - g2, py - g2, pw + g2 * 2, ph2 + g2 * 2); }
        ctx.restore();
      }
      // label at the basin once reached
      const gm = cam(4, height(4, 84) + 1, 84);
      if (gm[2] > 1 && t > 12.5) hudTag(ctx, gm[0], gm[1] + 60, 'LOWEST ERROR', { k: EO(12.5, 12.9) * (1 - ph(13.0, 13.2)), font: '700 28px "Space Mono"', col: GRN });
      if (bS[2] > 1 && t > 10.9 && t < 12.5) hudTag(ctx, bS[0] - 40, bS[1] - 60, 'REPEAT × MANY', { k: EO(10.9, 11.2) * (1 - ph(12.2, 12.5)), font: '600 28px "IBM Plex Mono"', h: 44, col: AMB });
    }

    // ---------- HUD frame + hook → header ----------
    ctx.strokeStyle = 'rgba(127,234,255,0.8)'; ctx.lineWidth = 1.5;
    const br = (x, y, sx, sy) => { ctx.beginPath(); ctx.moveTo(x, y + sy * 26); ctx.lineTo(x, y); ctx.lineTo(x + sx * 26, y); ctx.stroke(); };
    if (t > 0.08) { br(28, 28, 1, 1); br(W - 28, 28, -1, 1); br(28, H_ - 28, 1, -1); br(W - 28, H_ - 28, -1, -1); }
    {
      const sh = E(1.6, 2.4);
      const size = H.lerp(60, 30, sh);
      const str = 'HOW DOES AI LEARN?';
      ctx.font = `700 ${size}px "Space Mono"`;
      const w = ctx.measureText(str).width;
      const x = H.lerp(640 - w / 2, 56, sh), y = H.lerp(330, 76, sh);
      if (sh < 1) { ctx.fillStyle = `rgba(2,5,26,${0.6 * (1 - sh)})`; ctx.fillRect(0, 0, W, H_); }
      ctx.fillStyle = 'rgba(2,5,26,0.85)'; ctx.fillRect(x - 16, y - size * 0.95, w + 32, size * 1.35);
      ctx.fillStyle = '#e8fbff'; const tp = typed(str, 0.15, 1.1); ctx.fillText(tp, x, y);
      if (t < 1.6 && Math.floor(t * 4) % 2 === 0) { ctx.fillStyle = CY; ctx.fillRect(x + ctx.measureText(tp).width + 4, y - size * 0.75, size * 0.5, size * 0.85); }
      ctx.fillStyle = CY; ctx.fillRect(x, y + size * 0.3, H.lerp(120, 70, sh), 3);
    }
    if (t > 13.0) {
      const kk = EO(13.0, 13.5), str = 'MORE EXAMPLES → BETTER GUESSES';
      ctx.font = '700 40px "Space Mono"'; const w = ctx.measureText(str).width;
      hudBox(ctx, 640 - w / 2 - 30, 560, w + 60, 86, kk, GRN);
      ctx.fillStyle = '#e8fbff'; ctx.fillText(typed(str, 13.1, 13.6), 640 - w / 2, 616);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < H_; y += 3) ctx.fillRect(0, y, W, 1);
    H.vignette(ctx, W, H_, 0.45, '0,0,10');
  }

  // ---------- sound: flight-console HUD (scanner beeps, type-on chatter, a low console hum, soft flight drones) ----------
  function wfSound(k) {
    const D = 14.5;
    const ph = (t, a, b) => H.clamp((t - a) / (b - a));
    const inv = (u) => (u < 0.5 ? Math.cbrt(u / 4) : 1 - Math.cbrt((1 - u) * 2) / 2); // inverse of H.ease.inOut
    const invO = (u) => 1 - Math.cbrt(1 - u); // inverse of H.ease.out
    const busy = [];
    // scanner beep: clean sine with a whisper of square edge, kept well under 2.5 kHz
    const beep = (t, n, dur, g, p = 0, minor) => { busy.push(t); k.tone(t, { f: n, dur, gain: 0.11 * g, a: 0.003, hold: dur * 0.6, pan: p, verb: 0.15, minor }); k.tone(t, { f: n, type: 'square', dur, gain: 0.012 * g, a: 0.003, hold: dur * 0.5, filter: 'lowpass', f2: 1800, pan: p, minor }); };
    // HUD type-on chatter: one short filtered square per printed glyph, at most ~12 per second
    const typeOn = (str, a, b, p = 0, g = 1) => { const n = str.length; let last = -1; for (let i = 1; i <= n; i++) { const t = a + ((i - 0.5) / n) * (b - a); if (t - last < 1 / 12 || str[i - 1] === ' ') continue; busy.push(t); k.tone(t, { f: 'E5', type: 'square', dur: 0.022, gain: 0.035 * g, a: 0.001, hold: 0.012, filter: 'lowpass', f2: 1700, pan: p, minor: true }); last = t; } };
    // hudTag(k = EO(a,b)) prints ceil(len * min(1, 1.4k)) chars: all printed once EO reaches 1/1.4
    const tagOn = (str, a, b, p = 0) => { const tEnd = a + (b - a) * invO(1 / 1.4); typeOn(str, a, tEnd, p, 0.9); beep(a, 'A4', 0.05, 0.45, p, true); };
    // hudBox opening (E over a..b): a quick upward servo sweep that clicks shut
    const boxOpen = (a, b, p = 0, g = 1) => { k.tone(a, { f: [[0, 220], [b - a, 660]], type: 'triangle', dur: b - a + 0.02, gain: 0.05 * g, a: 0.02, pan: p, minor: true }); k.play('click', b, { f: 1500, gain: 0.5 * g, pan: p, minor: true }); busy.push(b); };
    const fly = (t0, t1, g = 1) => { const d = t1 - t0; k.noise(t0, { dur: d + 0.2, color: 'pink', filter: 'bandpass', f: [[0, 160], [d * 0.5, 380], [d, 170]], q: 0.9, gain: 0.05 * g, a: d * 0.5, verb: 0.15 }); k.tone(t0, { f: [[0, 70], [d * 0.5, 95], [d, 72]], type: 'sawtooth', dur: d + 0.2, gain: 0.012 * g, a: d * 0.5, filter: 'lowpass', f2: 300 }); };
    const counter = (a, b, val, f, g, p, minGap) => {
      let last = -1, lastV = val(a); const top = Math.abs(val(b) - val(a)) / (b - a) * 0.22;
      for (let t = a; t <= b + 1e-6; t += 1 / 120) {
        const v = val(t); if (v === lastV) continue; lastV = v;
        const speed = Math.abs(val(Math.min(b, t + 0.05)) - val(Math.max(a, t - 0.05)));
        const gap = H.clamp(minGap / Math.max(0.2, Math.min(1, speed / top)), minGap, 0.4);
        if (t - last >= gap && !busy.some((x) => t > x - 0.03 && t < x + 0.08)) { k.play('tick', t, { f, gain: g, pan: p, minor: true }); last = t; }
      }
    };

    k.bed('hum', 0, D, { gain: 0.35 }); // the console
    k.bed('hiss', 0, D, { gain: 0.6 });
    k.music('pad', 0.3, D, { bpm: 90, gain: 0.24, chords: [['D3', 'F3', 'A3', 'C4'], ['Bb2', 'D3', 'F3', 'A3'], ['G2', 'Bb2', 'D3', 'F3'], ['A2', 'C#3', 'E3', 'G3'], ['D3', 'F3', 'A3', 'D4']] });
    // the terrain scan line sweeps away from the camera every 150/26 s: a faint radar pass each cycle
    for (let t = 0.2; t < D - 0.5; t += 150 / 26) k.noise(t, { dur: 1.4, color: 'pink', filter: 'bandpass', f: [[0, 500], [1.4, 1500]], q: 6, gain: 0.03, a: 0.5, verb: 0.2, minor: true });

    // ---- hook: HUD brackets power on (0.08), the question types out (0.15-1.1), slides to the header (1.6-2.4)
    k.tone(0.06, { f: [[0, 90], [0.3, 180]], dur: 0.35, gain: 0.1, a: 0.08 }); beep(0.08, 'A4', 0.08, 0.8);
    typeOn('HOW DOES AI LEARN?', 0.15, 1.1, 0, 1.3);
    beep(1.12, 'D5', 0.1, 0.8); // prompt complete
    k.noise(1.6, { dur: 0.8, color: 'pink', filter: 'lowpass', f: [[0, 600], [0.8, 250]], gain: 0.04, a: 0.3, minor: true });
    fly(1.8, 2.9);

    // ---- beat 2: TRAINING DATA panel, feed scrolls, counter, streams into the sphere
    boxOpen(2.4, 2.8, -0.5);
    for (let t = 2.8 + 92 / 140; t < 6.5; t += 92 / 140) if (t > 3.0) { k.tone(t, { f: 'A3', type: 'square', dur: 0.03, gain: 0.02, a: 0.001, hold: 0.02, filter: 'lowpass', f2: 1200, pan: -0.5, minor: true }); busy.push(t); } // a new feed row
    [0, 1, 2].forEach((s2) => { const a = 3.2 + s2 * 0.15; k.noise(a, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.7, 1500]], q: 5, gain: 0.04, a: 0.35, pan: -0.3 + s2 * 0.1, minor: true }); beep(a + 0.7, ['F5', 'A5', 'C6'][s2], 0.05, 0.4, 0.3, true); }); // data streams link to the model
    tagOn('MODEL', 3.9, 4.3, 0.4);
    counter(2.95, 5.66, (t) => Math.floor(1e6 * Math.pow(H.ease.out(ph(t, 2.9, 5.7)), 1.6)), 2800, 1.1, -0.5, 1 / 10);
    beep(5.7, 'A5', 0.08, 0.6, -0.5); beep(5.8, 'D6', 0.14, 0.5, -0.5); // 1,000,000: confirm

    // ---- beat 3: fly down to the marker, guess, check, adjust
    k.tone(6.5, { f: [[0, 660], [0.4, 220]], type: 'triangle', dur: 0.42, gain: 0.045, a: 0.02, pan: -0.5, minor: true }); // data panel folds away
    fly(5.9, 7.0);
    beep(6.92, 'E5', 0.05, 0.7, -0.2); beep(7.02, 'E5', 0.05, 0.7, -0.2); // target lock on the weights marker
    boxOpen(6.95, 7.3, 0.2);
    tagOn('1 GUESS', 7.0, 7.35, 0.2);
    typeOn('MODEL WEIGHTS', 7.0, 7.0 + 0.4 * invO(1 / 1.4), -0.2, 0.6);
    typeOn('DOG?', 7.25, 7.45, 0.3, 1.2);
    // CHECK: wrong. X strikes, readout frame flashes red (on at 7.5, 7.75, 8.0): one alarm beep per flash
    k.play('error', 7.45, { f: 'A3', gain: 1.0, pan: 0.3 });
    [7.5, 7.75, 8.0].forEach((t, i) => beep(t, 'B4', 0.1, 0.7 - i * 0.1, 0.3, i > 0));
    tagOn('2 CHECK', 7.5, 7.85, 0.45);
    typeOn('ANSWER: CAT', 7.6, 8.0, 0.3);
    // ADJUST: the error becomes a red downhill arrow (E 8.0-8.6), the sphere spins to new weights (8.6-9.2)
    k.tone(8.0, { f: [[0, 880], [0.6, 330]], type: 'triangle', dur: 0.62, gain: 0.05, a: 0.05, hold: 0.4, pan: -0.3 });
    k.noise(8.0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 1400], [0.6, 500]], q: 4, gain: 0.04, a: 0.2, pan: -0.3, minor: true });
    tagOn('ERROR → DOWNHILL', 8.1, 8.5, -0.4);
    tagOn('3 ADJUST', 8.4, 8.8, -0.1);
    k.tone(8.6, { f: [[0, 110], [0.3, 220], [0.6, 140]], type: 'sawtooth', dur: 0.62, gain: 0.03, a: 0.2, filter: 'lowpass', f2: 700, pan: 0.4, minor: true }); // sphere servo whir
    k.tone(8.75, { f: [[0, 'D4'], [0.3, 'A3']], dur: 0.32, gain: 0.08, a: 0.01, pan: -0.3 }); // first step downhill
    // CORRECT: CAT types in green (9.4-9.6), check draws (9.6-9.8), LOSS LOWER
    typeOn('CAT', 9.4, 9.6, 0.3, 1.2);
    k.play('success', 9.62, { f: 'D5', gain: 0.5, pan: 0.3 });
    typeOn('LOSS LOWER ✓', 9.75, 10.0, 0.3, 0.7);

    // ---- beat 4: rounds roll the weights into the basin, accuracy climbs
    fly(10.3, 11.2);
    boxOpen(10.7, 11.0, 0.2);
    tagOn('REPEAT × MANY', 10.9, 11.2, -0.3);
    ['A4', 'G4', 'F4', 'E4', 'D4', 'C4'].forEach((n, i) => { const t = 11.3 + i * 0.3; beep(t, n, 0.07, 0.55, -0.3 + i * 0.08, true); }); // each training round steps the marker downhill
    counter(11.03, 12.66, (t) => Math.round(H.lerp(61, 97, H.ease.inOut(ph(t, 11.0, 12.7)))), 2600, 1.1, 0.2, 1 / 10);
    tagOn('LOWEST ERROR', 12.5, 12.9, 0);
    // 97%: the big hit. readout turns green, its frame expands
    k.play('impact', 12.7, { gain: 0.65, pan: 0.2 });
    ['D5', 'F#5', 'A5'].forEach((n, i) => beep(12.7 + i * 0.07, n, 0.5 - i * 0.08, 1.1 - i * 0.15, 0.2));
    k.tone(12.7, { f: 'D3', type: 'triangle', dur: 1.0, gain: 0.14, a: 0.01 });
    fly(12.9, 13.9, 0.8);
    // takeaway box opens (EO 13.0-13.5) and types (13.1-13.6), then resolves
    boxOpen(13.0, 13.4, 0, 0.8);
    typeOn('MORE EXAMPLES → BETTER GUESSES', 13.1, 13.6, 0, 0.9);
    beep(13.65, 'A4', 0.1, 0.6); beep(13.75, 'D5', 0.5, 0.55);
    k.tone(13.75, { f: 'D3', type: 'triangle', dur: 1.0, gain: 0.1, a: 0.02 });
  }

  registerStyle({
    id: 'wireframe-terrain',
    name: 'Hidden-Line Wireframe',
    category: 'Dimensional',
    description: 'Vector-display 3D: a perspective wire-mesh landscape with true hidden-line removal (back-to-front quads filled with the night before stroking), a wireframe moon, phosphor-cyan lines with bloom on deep navy, and HUD coordinate labels.',
    motion: 'HUD brackets snap on, the wireframe moon traces itself, then the hidden-line mesh is scanned in row by row from the camera to the horizon behind a bright scan front; markers lock on and labels type out while the camera glides forward and the scan keeps sweeping.',
    duration: 5,
    fonts: ['600 13px "IBM Plex Mono"', '400 11px "IBM Plex Mono"', '700 34px "Space Mono"', '400 14px "Space Mono"', '600 24px "IBM Plex Mono"', '400 22px "IBM Plex Mono"', '700 60px "Space Mono"'],
    frameT: 4.6,
    readsPixels: false,
    explainerDuration: 14.5,
    explainerNote: 'Learning is shown as descent over the hidden-line “loss landscape”: the camera flies the mesh from a data-feed HUD streaming into the wireframe-sphere model, down to an amber “model weights” marker whose error becomes a dashed downhill vector, then follows it into the glowing basin; labels are bracketed HUD tags that type on, numbers are big Space Mono readouts.',
    explainer: wfExplainer,
    explainerSound: wfSound,
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(12);
      const ph = (a, b) => H.clamp((t - a) / (b - a));
      const typed = (str, a, b) => str.slice(0, Math.round(str.length * ph(a, b)));
      const camZ = -3.6 + (t - 4.6) * 1.2;
      const NAVY = [5, 10, 34];
      const HORIZON_Y = 300;
      // ---------- sky ----------
      const sky = ctx.createLinearGradient(0, 0, 0, HORIZON_Y + 40);
      sky.addColorStop(0, '#02051a'); sky.addColorStop(0.75, '#081440'); sky.addColorStop(1, '#0f2160');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H_);
      const r = H.rng(3);
      for (let i = 0; i < 160; i++) {
        const x = r() * W, y = r() * HORIZON_Y, a = r() * 0.7 * (1 - y / HORIZON_Y * 0.6);
        ctx.fillStyle = `rgba(190,240,255,${a})`; ctx.fillRect(x, y, r() < 0.08 ? 2 : 1, 1);
      }
      { const gg = ctx.createLinearGradient(0, HORIZON_Y - 10, 0, HORIZON_Y + 120); gg.addColorStop(0, 'rgba(5,10,34,0)'); gg.addColorStop(1, 'rgba(5,10,34,1)'); ctx.fillStyle = gg; ctx.fillRect(0, HORIZON_Y - 10, W, H_); }
      // ---------- wireframe moon (front hemisphere only = hidden lines removed) ----------
      {
        const mx = 925, my = 215, R = 112, tilt = 0.42, spin = t * 0.15;
        const halo = ctx.createRadialGradient(mx, my, R * 0.9, mx, my, R * 2.2);
        halo.addColorStop(0, 'rgba(80,220,255,0.18)'); halo.addColorStop(1, 'rgba(80,220,255,0)');
        const mo = H.ease.inOut(ph(0.25, 1.1)), mlat = H.ease.inOut(ph(0.45, 1.4)), mlon = H.ease.inOut(ph(0.8, 1.7));
        ctx.globalAlpha = H.ease.out(ph(0.9, 1.8));
        ctx.fillStyle = halo; ctx.fillRect(mx - R * 2.3, my - R * 2.3, R * 4.6, R * 4.6);
        ctx.globalAlpha = 1;
        ctx.globalAlpha = mo; ctx.fillStyle = '#040a26'; ctx.beginPath(); ctx.arc(mx, my, R, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        const P = (lat, lon) => {
          let x = Math.cos(lat) * Math.cos(lon + spin), y = Math.sin(lat), z = Math.cos(lat) * Math.sin(lon + spin);
          const y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
          return [mx + x * R, my - y2 * R, z2];
        };
        ctx.lineWidth = 1;
        const seg = (pts, prog = 1) => {
          const nmax = Math.floor((pts.length - 1) * prog) + 1;
          for (let i = 1; i < Math.min(pts.length, nmax); i++) {
            const a = pts[i - 1], b = pts[i];
            if (a[2] < 0 && b[2] < 0) continue;
            const k = H.clamp((a[2] + b[2]) / 2 + 0.25);
            ctx.strokeStyle = `rgba(110,235,255,${0.15 + 0.6 * k})`;
            ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          }
        };
        for (let la = -75; la <= 75; la += 15) { const pts = []; for (let lo = 0; lo <= 360; lo += 6) pts.push(P(la * Math.PI / 180, lo * Math.PI / 180)); if (mlat > 0) seg(pts, mlat); }
        for (let lo = 0; lo < 360; lo += 15) { const pts = []; for (let la = -90; la <= 90; la += 6) pts.push(P(la * Math.PI / 180, lo * Math.PI / 180)); if (mlon > 0) seg(pts, mlon); }
        ctx.strokeStyle = 'rgba(150,245,255,0.95)'; ctx.lineWidth = 1.4; if (mo > 0) { ctx.beginPath(); ctx.arc(mx, my, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * mo); ctx.stroke(); }
        // orbit ring
        ctx.save(); ctx.globalAlpha = ph(1.5, 1.9); ctx.translate(mx, my); ctx.rotate(-0.25);
        ctx.strokeStyle = 'rgba(110,235,255,0.35)'; ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.ellipse(0, 0, R * 1.6, R * 0.38, 0, Math.PI * 1.02, Math.PI * 1.98 + Math.PI * 1.0); ctx.stroke(); ctx.setLineDash([]);
        const oa = t * 0.6; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(Math.cos(oa) * R * 1.6, Math.sin(oa) * R * 0.38, 2.5, 0, 7); ctx.fill();
        ctx.restore();
      }

      // ---------- terrain: "loss landscape" heightfield ----------
      const cam = makeCam([0, 22, camZ], 0.105, 760, W / 2, H_ / 2);
      const height = (x, z) => {
        const ridge = (u, v) => 1 - Math.abs(nz.n2(u, v));
        let h = Math.pow(ridge(x * 0.04, z * 0.04), 2.2) * 11 + nz.fbm2(x * 0.08, z * 0.08, 3) * 3;
        const side = Math.pow(Math.abs(x) / 70, 1.6) * 9;
        h = h * (0.35 + H.smooth(4, 40, Math.abs(x)) * 0.9) + side;
        // distant range
        h += H.smooth(105, 175, z) * Math.pow(ridge(x * 0.025 + 7, z * 0.02), 1.6) * (16 + 16 * H.smooth(-60, 20, x));
        // the "global minimum" basin
        const db = Math.hypot(x - 4, z - 84);
        h -= 10 * Math.exp(-(db * db) / 160);
        return h - 2;
      };
      const STEP = 2.5, X0 = -180, X1 = 180, Z0 = 25, Z1 = 185;
      const nx = (X1 - X0) / STEP, nzr = (Z1 - Z0) / STEP;
      const zOff = Math.floor((camZ + 6) / STEP) * STEP; // grid scrolls with camera so it never runs out
      const PTS = [];
      for (let j = 0; j <= nzr; j++) {
        const row = [];
        for (let i = 0; i <= nx; i++) {
          const x = X0 + i * STEP, z = Z0 + j * STEP + zOff;
          const y = height(x, z);
          row.push([...cam(x, y, z), y]);
        }
        PTS.push(row);
      }
      const REV0 = 0.4, REV1 = 2.3;
      const revealD = 18 + 180 * H.ease.inOut(ph(REV0, REV1));
      const building = t < REV1;
      const scanZ = building ? camZ + revealD : camZ + 40 + (((t - REV1) * 26 + 60) % 150);
      // back-to-front
      ctx.lineJoin = 'round';
      for (let j = nzr - 1; j >= 0; j--) {
        const zw = Z0 + j * STEP + zOff;
        if (zw - camZ > revealD) continue;
        const depth = PTS[j][0][2];
        const fog = H.clamp(H.smooth(45, 190, zw - zOff + 6));
        const fill = H.mix(NAVY, [14, 30, 88], fog);
        const scan = Math.exp(-Math.pow((zw - scanZ) / (building ? 3.5 : 2.2), 2)) * (building ? 1 : 0.72); // sweeping scan row, kept below clipping
        const lw = H.clamp(1.5 - depth / 90, 0.45, 1.5);
        // order cells in the row from the outside in (camera is at x=0)
        const order = [];
        for (let i = 0; i < nx; i++) order.push(i);
        order.sort((a, b) => Math.abs(X0 + (b + 0.5) * STEP) - Math.abs(X0 + (a + 0.5) * STEP));
        for (const i of order) {
          const a = PTS[j][i], b = PTS[j][i + 1], c = PTS[j + 1][i + 1], d = PTS[j + 1][i];
          if (a[2] < 1) continue;
          if (Math.max(a[0], b[0], c[0], d[0]) < -20 || Math.min(a[0], b[0], c[0], d[0]) > W + 20 || Math.min(a[1], b[1], c[1], d[1]) > H_ + 20) continue;
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
          ctx.fillStyle = `rgb(${fill[0] | 0},${fill[1] | 0},${fill[2] | 0})`; ctx.fill();
          const hk = H.clamp((a[3] + 2) / 16);
          let col = H.mix([40, 200, 255], [210, 250, 255], hk * 0.8);
          col = H.mix(col, [255, 255, 255], scan);
          const alpha = H.clamp((1 - fog * 0.85) * (0.55 + hk * 0.45) + scan, 0, 1);
          ctx.strokeStyle = H.rgba(col, alpha); ctx.lineWidth = lw + scan * 1.2;
          ctx.stroke();
        }
      }
      // horizon haze line
      const hz = ctx.createLinearGradient(0, HORIZON_Y - 60, 0, HORIZON_Y + 30);
      hz.addColorStop(0, 'rgba(40,120,255,0)'); hz.addColorStop(0.7, 'rgba(40,140,255,0.10)'); hz.addColorStop(1, 'rgba(40,120,255,0)');
      ctx.fillStyle = hz; ctx.fillRect(0, HORIZON_Y - 60, W, 90);

      // ---------- bloom: blurred copy of the frame added on top ----------
      {
        const L = H.layer(W, H_), lc = L.getContext('2d');
        lc.filter = 'blur(6px)'; lc.drawImage(ctx.canvas, 0, 0, W, H_);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.55; ctx.drawImage(L, 0, 0); ctx.restore();
      }

      // ---------- HUD ----------
      const CY = '#7feaff';
      ctx.font = '400 11px "IBM Plex Mono"'; ctx.fillStyle = CY; ctx.strokeStyle = CY;
      // global-minimum marker
      {
        const mzw = 84, mxw = 4;
        const p = cam(mxw, height(mxw, mzw), mzw);
        const lock = H.ease.out(ph(2.75, 3.15));
        const blinkOn = t > 2.75 && (t > 3.15 || Math.floor(t * 16) % 2 === 0);
        if (blinkOn) {
          const pulse = lock < 1 ? 1 + (1 - lock) * 4 : 1 + 0.25 * Math.sin(t * 4);
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = '#ffd36b';
          ctx.beginPath(); ctx.arc(p[0], p[1], 9 * pulse, 0, 7); ctx.stroke();
          ctx.beginPath(); ctx.arc(p[0], p[1], 2.5, 0, 7); ctx.fillStyle = '#ffd36b'; ctx.fill();
          const g = 14 + (1 - lock) * 30;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.beginPath(); ctx.moveTo(p[0] + dx * g, p[1] + dy * g); ctx.lineTo(p[0] + dx * (g + 8), p[1] + dy * (g + 8)); ctx.stroke(); }
        }
        const lk = H.ease.inOut(ph(3.1, 3.45));
        if (lk > 0) {
          const L1 = 79 * Math.SQRT2, L2 = 195, dd = (L1 + L2) * lk;
          ctx.beginPath(); ctx.moveTo(p[0] + 16, p[1] - 16);
          const a1 = Math.min(dd, L1) / Math.SQRT2; ctx.lineTo(p[0] + 16 + a1, p[1] - 16 - a1);
          if (dd > L1) ctx.lineTo(p[0] + 95 + (dd - L1), p[1] - 95);
          ctx.stroke();
        }
        ctx.fillStyle = '#ffd36b'; ctx.font = '600 13px "IBM Plex Mono"'; ctx.fillText(typed('GLOBAL MIN', 3.35, 3.6), p[0] + 100, p[1] - 102);
        ctx.font = '400 11px "IBM Plex Mono"'; ctx.fillStyle = 'rgba(255,211,107,0.8)';
        ctx.fillText(typed(`loss=0.0${(37 - Math.floor(t * 3) % 9)}  x=${mxw.toFixed(1)} z=${mzw.toFixed(1)}`, 3.5, 3.9), p[0] + 100, p[1] - 80);
      }
      // peak markers
      ctx.fillStyle = CY; ctx.strokeStyle = 'rgba(127,234,255,0.7)'; ctx.lineWidth = 1;
      const peak = (x0, x1, z0, z1) => { let best = [x0, z0, -1e9]; for (let x = x0; x <= x1; x += 2.5) for (let z = z0; z <= z1; z += 2.5) { const h = height(x, z); if (h > best[2]) best = [x, z, h]; } return best; };
      [[-50, -18, 70, 100, 'LOCAL MAX', 2.2], [22, 60, 92, 130, 'PEAK_B', 2.4], [50, 100, 150, 180, 'RIDGE_C', 2.6]].forEach(([x0, x1, z0, z1, name, a0]) => {
        if (t < a0) return;
        const [xw, zw] = peak(x0, x1, z0, z1);
        const p = cam(xw, height(xw, zw), zw);
        const st = H.ease.out(ph(a0, a0 + 0.25));
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], p[1] - 34 * st); ctx.stroke();
        if (Math.floor(t * 20) % 2 === 0 || t > a0 + 0.2) { ctx.beginPath(); ctx.rect(p[0] - 3, p[1] - 3, 6, 6); ctx.stroke(); }
        { // dark scrim so the tag reads over the scan row and the sphere rim
          const tn = typed(name, a0 + 0.2, a0 + 0.45); if (tn) { ctx.save(); ctx.font = '600 11px "IBM Plex Mono"'; ctx.fillStyle = 'rgba(3,8,30,0.72)'; ctx.fillRect(p[0] + 2, p[1] - 49, Math.max(ctx.measureText(name).width, 44) + 8, 30); ctx.restore(); }
        }
        ctx.font = '600 11px "IBM Plex Mono"'; ctx.fillText(typed(name, a0 + 0.2, a0 + 0.45), p[0] + 5, p[1] - 36);
        ctx.font = '400 10px "IBM Plex Mono"'; ctx.fillStyle = 'rgba(127,234,255,0.65)';
        ctx.fillText(typed(`h=${(height(xw, zw) * 0.137).toFixed(3)}`, a0 + 0.35, a0 + 0.6), p[0] + 5, p[1] - 24); ctx.fillStyle = CY;
      });
      // corner brackets
      ctx.strokeStyle = 'rgba(127,234,255,0.8)'; ctx.lineWidth = 1.5;
      const br = (x, y, sx, sy) => { ctx.beginPath(); ctx.moveTo(x, y + sy * 26); ctx.lineTo(x, y); ctx.lineTo(x + sx * 26, y); ctx.stroke(); };
      const bk = t < 0.05 ? 0 : t < 0.12 ? 1 : t < 0.17 ? 0 : 1; // power-on flicker
      if (bk) { const o = Math.round((1 - H.ease.out(ph(0.05, 0.35))) * 3) * 12; br(28 + o, 28 + o, 1, 1); br(W - 28 - o, 28 + o, -1, 1); br(28 + o, H_ - 28 - o, 1, -1); br(W - 28 - o, H_ - 28 - o, -1, -1); }
      // compass ribbon (top center)
      {
        const cx = W / 2, y = 44, heading = 12 + t * 3, cw = 220 * H.ease.inOut(ph(0.3, 0.9));
        ctx.save(); ctx.beginPath(); ctx.rect(cx - cw, y - 20, cw * 2, 40); ctx.clip();
        ctx.lineWidth = 1;
        for (let d = Math.floor(heading - 40); d <= heading + 40; d++) {
          const x = cx + (d - heading) * 5.5;
          const a = 1 - Math.abs(d - heading) / 40;
          ctx.strokeStyle = `rgba(127,234,255,${a * 0.8})`;
          const len = d % 10 === 0 ? 10 : d % 5 === 0 ? 6 : 3;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + len); ctx.stroke();
          if (d % 10 === 0) { ctx.fillStyle = `rgba(127,234,255,${a})`; ctx.font = '400 10px "IBM Plex Mono"'; ctx.textAlign = 'center'; ctx.fillText(String((d + 360) % 360).padStart(3, '0'), x, y - 6); }
        }
        ctx.restore(); ctx.textAlign = 'left';
        if (t > 0.6) ctx.fillStyle = CY; else ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.beginPath(); ctx.moveTo(cx, y + 14); ctx.lineTo(cx - 5, y + 22); ctx.lineTo(cx + 5, y + 22); ctx.closePath(); ctx.fill();
      }
      // title block (top-left) on a soft scrim
      { const sg = ctx.createRadialGradient(170, 130, 20, 170, 130, 300); sg.addColorStop(0, 'rgba(2,5,26,0.75)'); sg.addColorStop(1, 'rgba(2,5,26,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, 560, 520); }
      ctx.fillStyle = 'rgba(127,234,255,0.75)'; ctx.font = '400 14px "Space Mono"';
      ctx.fillText(typed('// SEQ 04 — OPTIMIZATION', 0.35, 0.8), 64, 86);
      ctx.fillStyle = '#e8fbff'; ctx.font = '700 34px "Space Mono"';
      const l1 = typed('THE LOSS', 0.8, 1.2), l2 = typed('LANDSCAPE', 1.2, 1.65);
      ctx.fillText(l1, 62, 128); ctx.fillText(l2, 62, 166);
      if (t > 0.8 && t < 2.6 && Math.floor(t * 4) % 2 === 0) { const onL2 = t > 1.2; const tw = ctx.measureText(onL2 ? l2 : l1).width; ctx.fillStyle = CY; ctx.fillRect(66 + tw, onL2 ? 140 : 102, 18, 30); }
      ctx.fillStyle = CY; ctx.fillRect(64, 182, 46 * H.ease.out(ph(1.6, 1.9)), 2);
      // telemetry (bottom-left)
      ctx.font = '400 11px "IBM Plex Mono"';
      const lines = [`CAM  x=+0.00  y=+22.0  z=${camZ.toFixed(2)}`, `FOV  62.4°   PITCH -6.0°`, `GRID 144×64  STEP 2.5`, `EPOCH ${String(120 + Math.floor(t * 10)).padStart(4, '0')}   LR 3e-4`];
      const pw = 262 * H.ease.out(ph(1.3, 1.6));
      if (pw > 1) {
        ctx.fillStyle = 'rgba(3,8,30,0.82)'; ctx.fillRect(52, H_ - 120, pw, 84);
        ctx.strokeStyle = 'rgba(127,234,255,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(52.5, H_ - 119.5, pw - 1, 83);
        ctx.fillStyle = CY; ctx.fillRect(52, H_ - 120, 3, 84);
        lines.forEach((l, i) => { ctx.fillStyle = i === 3 ? '#ffd36b' : 'rgba(127,234,255,0.8)'; ctx.fillText(typed(l, 1.55 + i * 0.18, 1.85 + i * 0.18), 64, H_ - 102 + i * 17); });
      }
      // axis scale (right)
      const ax = H.ease.out(ph(1.7, 2.2));
      ctx.strokeStyle = 'rgba(127,234,255,0.6)'; ctx.beginPath(); ctx.moveTo(W - 64, 640); ctx.lineTo(W - 64, 640 - 260 * ax); ctx.stroke();
      for (let i = 0; ax > 0 && i <= Math.floor(10 * ax); i++) {
        const y = 640 - i * 26; ctx.beginPath(); ctx.moveTo(W - 64, y); ctx.lineTo(W - 64 - (i % 5 === 0 ? 12 : 6), y); ctx.stroke();
        if (i % 5 === 0) { ctx.fillStyle = 'rgba(127,234,255,0.7)'; ctx.textAlign = 'right'; ctx.fillText((i * 0.1).toFixed(1), W - 82, y + 4); ctx.textAlign = 'left'; }
      }
      ctx.save(); ctx.globalAlpha = ph(2.0, 2.3); ctx.translate(W - 44, 512); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(127,234,255,0.7)'; ctx.fillText('LOSS', 0, 0); ctx.restore();
      // subtle scanlines for the vector-display feel
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      for (let y = 0; y < H_; y += 3) ctx.fillRect(0, y, W, 1);
      H.vignette(ctx, W, H_, 0.45, '0,0,10');
    },
  });
}
```
