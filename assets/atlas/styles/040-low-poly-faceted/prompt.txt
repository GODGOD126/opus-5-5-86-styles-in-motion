I want an animated explainer made in the "Low-Poly Faceted" visual style (Dimensional). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Space Grotesk
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=block">
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
Name: Low-Poly Faceted
Family: Dimensional
Look: Faceted low-poly 3D: a triangulated noise terrain with flat per-face Lambert shading, atmospheric depth fog, cone trees and a faceted rocket lifting off into a dawn gradient sky.
Motion: Terrain facets flip into place from the camera out to the horizon, trees and the launch pad pop up, then the rocket ignites and lifts off on a faceted flame and smoke column while the camera dollies forward.
How it explains: A continuous camera flight through one faceted valley (overview → river of labelled example cards → floating crystal model whose facets realign → pillar chart on a plateau → pull back), with angular two-tone ribbon arrows, cut-corner tags pinned to objects and Space Grotesk counters.

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

REFERENCE STYLE SOURCE (styles/low-poly.js; W/H_ are always 1280x720)
```js
{
  // ---------- tiny 3D pipeline: perspective camera + flat-shaded, depth-sorted triangles ----------
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const scl = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

  function makeCamera(pos, pitch, f, W, Hh) {
    const ca = Math.cos(pitch), sa = Math.sin(pitch);
    return {
      pos,
      view(p) { const d = sub(p, pos); return [d[0], d[1] * ca + d[2] * sa, -d[1] * sa + d[2] * ca]; },
      proj(p) { const v = this.view(p); return [W / 2 + (f * v[0]) / v[2], Hh / 2 - (f * v[1]) / v[2], v[2]]; },
    };
  }
  // icosahedron (unit)
  const ICO = (() => {
    const t = (1 + Math.sqrt(5)) / 2;
    const v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(norm);
    const f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    return { v, f };
  })();

  // ================= EXPLAINER: a camera flight down a low-poly valley — data floats down the river into a crystal "model" =================
  function makeCamYaw(pos, yaw, pitch, f, W, Hh) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    return {
      pos,
      proj(p) {
        const dx = p[0] - pos[0], dy = p[1] - pos[1], dz = p[2] - pos[2];
        const x1 = dx * cy - dz * sy, z1 = dx * sy + dz * cy;
        const y2 = dy * cp + z1 * sp, z2 = -dy * sp + z1 * cp;
        return [W / 2 + (f * x1) / z2, Hh / 2 - (f * y2) / z2, z2];
      },
    };
  }
  function lpPetFace(c, kind, x, y, r, col, ink) {
    // faceted pet face: polygonal head split into light/dark facets
    c.save(); c.translate(x, y);
    const facet = (pts, cc) => { c.fillStyle = H.rgba(cc); c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0] * r, p[1] * r) : c.moveTo(p[0] * r, p[1] * r)); c.closePath(); c.fill(); };
    const light = H.mix(col, [255, 255, 255], 0.25), dark = H.mix(col, [60, 40, 90], 0.25);
    if (kind === 'cat') { facet([[-0.9, -0.15], [-0.7, -1.15], [-0.15, -0.7]], dark); facet([[0.9, -0.15], [0.7, -1.15], [0.15, -0.7]], col); }
    else { facet([[-0.75, -0.6], [-1.15, 0.0], [-0.85, 0.75], [-0.55, -0.1]], dark); facet([[0.75, -0.6], [1.15, 0.0], [0.85, 0.75], [0.55, -0.1]], dark); }
    const hx = [[0, -0.95], [0.82, -0.48], [0.9, 0.35], [0, 0.95], [-0.9, 0.35], [-0.82, -0.48]];
    for (let i = 0; i < 6; i++) facet([[0, 0], hx[i], hx[(i + 1) % 6]], H.mix(light, dark, i / 5));
    c.fillStyle = ink;
    for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 0.42 * r, -0.22 * r); c.lineTo(sx * 0.28 * r, -0.05 * r); c.lineTo(sx * 0.48 * r, -0.02 * r); c.closePath(); c.fill(); }
    c.beginPath(); c.moveTo(-0.14 * r, 0.22 * r); c.lineTo(0.14 * r, 0.22 * r); c.lineTo(0, 0.4 * r); c.closePath(); c.fill();
    c.restore();
  }
  // cut-corner tag (faceted label)
  function lpTag(ctx, x, y, text, o = {}) {
    ctx.save();
    ctx.font = o.font || '700 28px "Space Grotesk"';
    const fsz = parseInt((ctx.font.match(/(\d+)px/) || [0, 28])[1]);
    const w = ctx.measureText(text).width + fsz * 1.3, h = o.h || Math.round(fsz * 1.75), k = o.k ?? 1, ch = h * 0.32;
    ctx.translate(x, y); ctx.scale(k, k);
    const pts = [[-w / 2 + ch, -h / 2], [w / 2, -h / 2], [w / 2, h / 2 - ch], [w / 2 - ch, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2 + ch]];
    ctx.fillStyle = o.shadow || 'rgba(40,20,70,0.35)'; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0] + 4, p[1] + 4) : ctx.moveTo(p[0] + 4, p[1] + 4)); ctx.closePath(); ctx.fill();
    const bg = H.hex(o.bg || '#fff6f0');
    ctx.fillStyle = H.rgba(bg); ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill();
    ctx.fillStyle = H.rgba(H.mix(bg, [255, 255, 255], 0.5)); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(w / 2 - h * 0.6, 0); ctx.lineTo(-w / 2, 0); ctx.lineTo(pts[5][0], pts[5][1]); ctx.closePath(); ctx.fill();
    ctx.fillStyle = o.col || '#2a1f4f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 1);
    ctx.restore();
  }
  // faceted arrow: angular polyline ribbon, each segment split into a lit and a shaded facet
  function lpArrow(ctx, a, c, b, prog, colA, w = 12) {
    if (prog <= 0) return null;
    const q = (u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
    const N = 7, pts = []; for (let i = 0; i <= N; i++) pts.push(q(prog * i / N));
    const light = H.rgba(H.mix(colA, [255, 255, 255], 0.3)), dark = H.rgba(H.mix(colA, [40, 20, 70], 0.25));
    const end = pts.length - 1;
    for (let i = 0; i < end; i++) {
      const p0 = pts[i], p1 = pts[i + 1], dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
      const nx = -dy / L * w / 2, ny = dx / L * w / 2;
      const shrink = i === end - 1 ? 0.35 : 0;
      const p1b = [p1[0] - dx * shrink, p1[1] - dy * shrink];
      ctx.fillStyle = light; ctx.beginPath(); ctx.moveTo(p0[0] + nx, p0[1] + ny); ctx.lineTo(p1b[0] + nx, p1b[1] + ny); ctx.lineTo(p1b[0], p1b[1]); ctx.lineTo(p0[0], p0[1]); ctx.closePath(); ctx.fill();
      ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(p0[0] - nx, p0[1] - ny); ctx.lineTo(p1b[0] - nx, p1b[1] - ny); ctx.lineTo(p1b[0], p1b[1]); ctx.lineTo(p0[0], p0[1]); ctx.closePath(); ctx.fill();
    }
    const e = pts[end], e0 = pts[end - 1], ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
    ctx.save(); ctx.translate(e[0], e[1]); ctx.rotate(ang);
    ctx.fillStyle = light; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-w * 1.4, -w * 1.1); ctx.lineTo(-w * 1.4, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-w * 1.4, w * 1.1); ctx.lineTo(-w * 1.4, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
    return q;
  }
  let LP_TERRAIN = null, LP_GEM = null;
  function lpExplainer(ctx, W, H_, t) {
    const ph = (a, b) => H.clamp((t - a) / (b - a));
    const E = (a, b) => H.ease.inOut(ph(a, b));
    const EO = (a, b) => H.ease.out(ph(a, b));
    const nz = H.makeNoise(31);
    const SUN_DIR = norm([0.75, 0.55, 0.45]);
    const SUN_COL = [255, 226, 190], AMB = [104, 98, 150];
    const FOG = [236, 160, 150], FOG_HI = [180, 140, 190];
    const CORAL = [255, 112, 96], INK = '#2a1f4f';
    // ---------- camera flight keyframes: [t, x, y, z, yaw, pitch] ----------
    const KF = [[0, 0, 44, -30, 0.0, 0.3], [1.5, 0, 42, -24, 0.0, 0.3], [2.9, -4, 19, 2, 0.06, 0.25], [5.7, -4, 18, 10, 0.06, 0.24], [6.9, -6, 17, 52, 0.22, 0.13], [10.2, -6, 17, 54, 0.22, 0.13], [11.2, 18, 22, 68, 0.3, 0.19], [12.8, 18, 22, 71, 0.3, 0.19], [13.9, 4, 52, -8, 0.22, 0.4], [20, 4, 52, -6, 0.22, 0.4]];
    let k = 0; while (k < KF.length - 2 && t > KF[k + 1][0]) k++;
    const A = KF[k], B = KF[k + 1], u = H.ease.inOut(H.clamp((t - A[0]) / (B[0] - A[0])));
    const L = (i) => H.lerp(A[i], B[i], u);
    const cam = makeCamYaw([L(1), L(2), L(3)], L(4), L(5), 760, W, H_);

    // ---------- sky ----------
    const sky = ctx.createLinearGradient(0, 0, 0, H_ * 0.62);
    sky.addColorStop(0, '#1b2350'); sky.addColorStop(0.38, '#4d3f84'); sky.addColorStop(0.7, '#c06a93'); sky.addColorStop(1, '#ffb08a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H_);
    const R0 = H.rng(77);
    for (let i = 0; i < 90; i++) { const x = R0() * W, y = R0() * 160, a = (1 - y / 160) * R0() * 0.8; ctx.fillStyle = `rgba(255,240,255,${a})`; ctx.fillRect(x, y, 1, 1); }
    { // faceted sun, fixed far away in world space so it parallaxes with the camera
      const sp = cam.proj([cam.pos[0] + 30, cam.pos[1] + 12, cam.pos[2] + 400]);
      const g = ctx.createRadialGradient(sp[0], sp[1], 30, sp[0], sp[1], 320);
      g.addColorStop(0, 'rgba(255,214,160,0.5)'); g.addColorStop(1, 'rgba(255,214,160,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H_);
      for (let i = 0; i < 14; i++) {
        const a0 = (i / 14) * Math.PI * 2, a1 = ((i + 1) / 14) * Math.PI * 2;
        ctx.fillStyle = H.rgba(H.mix('#ffd49a', '#fff4d8', 0.5 + 0.5 * Math.cos(a0 - 2.3)));
        ctx.beginPath(); ctx.moveTo(sp[0], sp[1]); ctx.lineTo(sp[0] + Math.cos(a0) * 50, sp[1] + Math.sin(a0) * 50); ctx.lineTo(sp[0] + Math.cos(a1) * 50, sp[1] + Math.sin(a1) * 50); ctx.closePath(); ctx.fill();
      }
    }

    // ---------- static terrain (cached: world-space triangles + base colours) ----------
    const height = (x, z) => {
      const valley = Math.pow(Math.abs(x - 4 * Math.sin(z * 0.035)) / 55, 1.7) * 22;
      const far = H.smooth(130, 210, z) * 18;
      let h = nz.fbm2(x * 0.045, z * 0.045, 4) * 7 + valley + far - 3;
      const dc = Math.hypot(x, z - 88); h = H.lerp(3.5, h, H.smooth(8, 16, dc));            // plateau under the crystal
      const dq = Math.hypot((x - 34) / 1.8, z - 116); h = H.lerp(4.5, h, H.smooth(9, 18, dq)); // plateau for the pillars
      return h;
    };
    const WATER = -0.6;
    if (!LP_TERRAIN) {
      const tris = [];
      const CELL = 4.4, X0 = -110, X1 = 130, Z0 = -20, Z1 = 230;
      const nx = Math.round((X1 - X0) / CELL), nzc = Math.round((Z1 - Z0) / CELL);
      const jr = H.rng(5), V = [];
      for (let j = 0; j <= nzc; j++) { const row = []; for (let i = 0; i <= nx; i++) { const x = X0 + i * CELL + (i > 0 && i < nx ? jr.range(-0.38, 0.38) * CELL : 0), z = Z0 + j * CELL + (j > 0 && j < nzc ? jr.range(-0.38, 0.38) * CELL : 0); row.push([x, height(x, z), z]); } V.push(row); }
      const tc = (y, slope) => {
        let c;
        if (y < WATER + 0.6) c = [214, 196, 150];
        else if (y < 6) c = H.mix([86, 160, 112], [60, 128, 96], H.clamp(y / 6));
        else if (y < 14) c = H.mix([60, 128, 96], [110, 112, 120], H.smooth(9, 14, y));
        else if (y < 22) c = [118, 110, 128]; else c = [244, 238, 248];
        if (slope > 0.55 && y > 3 && y < 22) c = H.mix(c, [124, 112, 124], 0.6);
        return c;
      };
      for (let j = 0; j < nzc; j++) for (let i = 0; i < nx; i++) {
        const a = V[j][i], b = V[j][i + 1], c = V[j + 1][i], d = V[j + 1][i + 1];
        const faces = (i + j) % 2 ? [[a, c, b], [b, c, d]] : [[a, c, d], [a, d, b]];
        for (const f of faces) {
          if (Math.max(f[0][1], f[1][1], f[2][1]) < WATER) { tris.push({ p: f.map(p => [p[0], WATER + nz.n2(p[0] * 0.4, p[2] * 0.4) * 0.35, p[2]]), col: [96, 120, 190], water: true }); continue; }
          let n = norm(cross(sub(f[1], f[0]), sub(f[2], f[0]))); if (n[1] < 0) n = scl(n, -1);
          tris.push({ p: f, col: tc((f[0][1] + f[1][1] + f[2][1]) / 3, 1 - Math.abs(n[1])), terrain: true });
        }
      }
      const tr = H.rng(9);
      const cone = (base, r, h, col, rot) => { const vs = [add3(base, [0, h, 0])]; for (let i = 0; i < 5; i++) { const a = rot + i / 5 * Math.PI * 2; vs.push(add3(base, [Math.cos(a) * r, 0, Math.sin(a) * r])); } for (let i = 0; i < 5; i++) tris.push({ p: [vs[0], vs[1 + i], vs[1 + (i + 1) % 5]], col, center: add3(base, [0, h * 0.3, 0]) }); };
      for (let kk = 0, placed = 0; kk < 1600 && placed < 220; kk++) {
        const x = tr.range(-80, 90), z = tr.range(0, 170), y = height(x, z);
        if (y < 0.6 || y > 12) continue;
        if (Math.hypot(x, z - 88) < 15 || Math.hypot((x - 34) / 1.8, z - 116) < 17) continue;
        if (nz.fbm2(x * 0.05 + 40, z * 0.05, 2) < -0.05) continue;
        const s = tr.range(1.5, 2.4), g = H.mix([40, 110, 90], [70, 140, 100], tr()), rot = tr() * 6;
        cone([x, y - 0.2, z], s * 0.75, s * 1.6, g, rot); cone([x, y + s * 0.85, z], s * 0.55, s * 1.4, H.mix(g, [120, 180, 120], 0.25), rot + 0.6);
        placed++;
      }
      LP_TERRAIN = tris;
    }
    const tris = LP_TERRAIN.slice();
    const pushTri = (a, b, c, col, opt = {}) => tris.push({ p: [a, b, c], col, ...opt });
    const meshTris = (vs, fs, col, center, opt = {}) => { for (const [i, j, kk] of fs) pushTri(vs[i], vs[j], vs[kk], typeof col === 'function' ? col(i, j, kk) : col, { center, ...opt }); };
    const prism = (cx, y0, cz, r, h, sides, col, rot = 0) => {
      const vs = []; for (let i = 0; i < sides; i++) { const a = rot + i / sides * Math.PI * 2; vs.push([cx + Math.cos(a) * r, y0, cz + Math.sin(a) * r]); }
      for (let i = 0; i < sides; i++) { const a = rot + i / sides * Math.PI * 2; vs.push([cx + Math.cos(a) * r, y0 + h, cz + Math.sin(a) * r]); }
      const fs = []; for (let i = 0; i < sides; i++) { const j = (i + 1) % sides; fs.push([i, j, sides + j], [i, sides + j, sides + i]); }
      for (let i = 1; i < sides - 1; i++) fs.push([sides, sides + i, sides + i + 1]);
      meshTris(vs, fs, col, [cx, y0 + h / 2, cz]);
    };

    // ---------- beat 2: labelled example cards drifting down the river ----------
    const cards = [];
    if (t > 2.3 && t < 6.6) {
      for (let j = 0; j < 18; j++) {
        const z = 14 + (t - 2.3) * 12 - j * 4.6;
        if (z < 12 || z > 84) continue;
        const x = 4 * Math.sin(z * 0.035) + Math.sin(j * 2.7) * 3;
        cards.push({ x, z, y: WATER + 0.2 + Math.sin(t * 2 + j) * 0.15, kind: (j * 5 + 1) % 3 === 0 ? 'cat' : (j % 2 ? 'cat' : 'dog'), a: Math.sin(j * 1.3) * 0.25 });
      }
    }
    if (t > 5.9 && t < 7.2) { const z = H.lerp(46, 84, E(5.9, 7.1)); cards.push({ x: 4 * Math.sin(z * 0.035), z, y: WATER + 0.2, kind: 'cat', test: true, a: 0 }); }
    for (const cd of cards) {
      const w = 1.8, h = 2.4, ca = Math.cos(cd.a), sa = Math.sin(cd.a);
      const P0 = (dx, dy) => [cd.x + dx * ca, cd.y + dy, cd.z + dx * sa];
      const v = [P0(-w, 0), P0(w, 0), P0(w, h * 2), P0(-w, h * 2)];
      pushTri(v[0], v[1], v[2], cd.test ? [255, 210, 196] : [250, 246, 250], { twoSided: true, card: true });
      pushTri(v[0], v[2], v[3], cd.test ? [255, 196, 180] : [236, 230, 244], { twoSided: true, card: true });
    }
    // counter totem: a faceted stack that grows with the data
    const cnt = Math.floor(1e6 * Math.pow(EO(2.9, 5.7), 1.6));
    const stackH = 1 + 9 * Math.pow(EO(2.8, 5.8), 1.2);
    for (let i = 0; i < Math.ceil(stackH / 1.2); i++) prism(-12, 3 + i * 1.2, 40, 2.6 - (i % 2) * 0.2, Math.min(1.1, stackH - i * 1.2), 6, i % 2 ? [255, 214, 196] : [210, 220, 250], i * 0.4);

    // ---------- beat 3: the crystal model + answer sign ----------
    const adj = E(8.6, 9.4);
    const CRY = [0, 15 + Math.sin(t * 1.6) * 0.6, 88];
    const spin = t * 0.45 + adj * 1.2;
    const cr = H.rng(44);
    const errFlash = ph(8.0, 8.4) * (1 - ph(8.8, 9.2));
    {
      const r = 6.5;
      // geodesic-cut gem: each icosahedron face split in 4, midpoints pushed part-way out (crisp, gem-like facets)
      if (!LP_GEM) {
        const vs = ICO.v.map(v => v.slice()), fs = [], mid = {};
        const m = (a, b) => { const key = a < b ? a + '_' + b : b + '_' + a; if (mid[key] == null) { const p = norm(add3(vs[a], vs[b])); const k2 = 0.93; vs.push(scl(p, k2)); mid[key] = vs.length - 1; } return mid[key]; };
        for (const [a, b, c] of ICO.f) { const ab = m(a, b), bc = m(b, c), ca = m(c, a); fs.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); }
        LP_GEM = { v: vs, f: fs };
      }
      const pal = [[255, 128, 112], [110, 200, 210], [255, 200, 120], [150, 124, 240], [236, 140, 200]];
      const vs = LP_GEM.v.map((v) => { const x = v[0] * Math.cos(spin) - v[2] * Math.sin(spin), z = v[0] * Math.sin(spin) + v[2] * Math.cos(spin); return [CRY[0] + x * r, CRY[1] + v[1] * r * 1.25, CRY[2] + z * r]; });
      LP_GEM.f.forEach((f) => {
        const raw = cr.pick(pal);
        pushTri(vs[f[0]], vs[f[1]], vs[f[2]], raw, { center: CRY, crystal: true });
      });
      prism(0, 3.4, 88, 4.2, 1.2, 7, [190, 180, 220], 0.3);
    }
    const SIGN = [17, 13, 86];
    const wrong = t > 7.05 && t < 9.5, right = t >= 9.5;
    const shake = t > 7.45 && t < 7.85 ? Math.sin(t * 80) * 0.25 : 0;
    if (t > 6.6 && t < 11.0) {
      const sk = H.ease.back(ph(6.6, 7.0)) * (1 - H.ease.inOut(ph(10.4, 11.0)));
      const sx = SIGN[0] + shake, w = 6 * sk, h = 3.4 * sk;
      const v = [[sx - w, SIGN[1] - h, SIGN[2]], [sx + w, SIGN[1] - h, SIGN[2]], [sx + w, SIGN[1] + h, SIGN[2]], [sx - w, SIGN[1] + h, SIGN[2]]];
      const scr = wrong && t > 7.45 ? [255, 214, 206] : right ? [206, 244, 226] : [246, 240, 250];
      pushTri(v[0], v[1], v[2], scr, { twoSided: true, sign: true, emissive: true });
      pushTri(v[0], v[2], v[3], H.mix(scr, [255, 255, 255], 0.3), { twoSided: true, sign: true, emissive: true });
      prism(sx, 3, SIGN[2] + 0.6, 0.5, SIGN[1] - h - 3, 5, [120, 110, 150]);
      prism(sx, SIGN[1] - h - 0.6, SIGN[2] + 0.7, w + 0.6, 0.6, 4, [90, 80, 130], Math.PI / 4);
    }
    // ---------- beat 4: accuracy pillars (one per training round) ----------
    const ACCS = [61, 72, 80, 86, 90, 93, 95, 97];
    const roundT = (i) => 11.0 + i * 0.2;
    ACCS.forEach((a, i) => {
      const g = EO(roundT(i), roundT(i) + 0.4); if (g <= 0) return;
      const x = 22 + i * 3.6, z = 112 + i * 1.0;
      const n0 = tris.length;
      prism(x, 4.4, z, 1.4, (a - 50) * 0.35 * g, 5, i === 7 ? [255, 120, 100] : H.mix([150, 170, 250], [110, 225, 190], i / 7), 0.2);
      for (let q = n0; q < tris.length; q++) tris[q].pillar = true;
    });

    // ---------- shade, cull, project, sort ----------
    const out = [];
    for (const tri of tris) {
      const [a, b, c] = tri.p;
      let n = norm(cross(sub(b, a), sub(c, a)));
      const cen = scl(add3(add3(a, b), c), 1 / 3);
      if (tri.terrain || tri.water) { if (n[1] < 0) n = scl(n, -1); }
      else if (tri.center) { if (dot(n, sub(cen, tri.center)) < 0) n = scl(n, -1); }
      const toCam = sub(cam.pos, cen);
      if (tri.twoSided) { if (dot(n, toCam) < 0) n = scl(n, -1); }
      else if (dot(n, toCam) <= 0) continue;
      const pa = cam.proj(a), pb = cam.proj(b), pc = cam.proj(c);
      if (pa[2] < 0.5 || pb[2] < 0.5 || pc[2] < 0.5) continue;
      const mnx = Math.min(pa[0], pb[0], pc[0]), mxx = Math.max(pa[0], pb[0], pc[0]), mny = Math.min(pa[1], pb[1], pc[1]), mxy = Math.max(pa[1], pb[1], pc[1]);
      if (mxx < -20 || mnx > W + 20 || mxy < -20 || mny > H_ + 20) continue;
      const depth = (pa[2] + pb[2] + pc[2]) / 3;
      let col;
      if (tri.emissive) col = tri.col;
      else if (tri.crystal) {
        // cut-glass shading: coherent violet->rose ramp by facet normal (trained), lifted from a jumbled palette (untrained),
        // key + cool fill light with a hard specular glint so neighbouring facets always separate in value
        const ramp = H.mix(H.mix([92, 74, 214], [255, 128, 186], H.clamp(0.45 + 0.7 * n[1])), [96, 206, 230], H.clamp(-n[0] * 0.9) * 0.5);
        let base = H.mix(H.mix(tri.col, ramp, 0.35), ramp, adj);
        base = H.mix(base, CORAL, errFlash * 0.8);
        const lam = Math.max(0, dot(n, SUN_DIR));
        const v = norm(toCam), fill = Math.max(0, dot(n, norm([-0.55, 0.6, -0.6])));
        const rl = sub(scl(n, 2 * dot(n, SUN_DIR)), SUN_DIR), spec = Math.pow(Math.max(0, dot(rl, v)), 20) * 0.6;
        const fl2 = sub(scl(n, 2 * dot(n, norm([-0.55, 0.6, -0.6]))), norm([-0.55, 0.6, -0.6])), spec2 = Math.pow(Math.max(0, dot(fl2, v)), 24) * 0.45;
        const rim = Math.pow(1 - Math.max(0, dot(n, v)), 3) * 0.28 * (0.4 + lam);
        const kk = 0.25 + 1.0 * lam, jit = 0.92 + 0.16 * (0.5 + 0.5 * Math.sin(cen[0] * 7.1 + cen[1] * 3.7 + cen[2] * 5.3 - spin * 9));
        col = [0, 1, 2].map(i => base[i] * jit * (AMB[i] / 255 * 0.5 + SUN_COL[i] / 255 * kk * 0.75 + [176, 186, 255][i] / 255 * fill * 0.55));
        col = H.mix(col, [255, 244, 236], H.clamp(spec + spec2 + rim));
      }
      else {
        const lam = Math.max(0, dot(n, SUN_DIR));
        let kk = tri.card ? 0.6 + 0.5 * lam : tri.pillar ? 0.3 + 0.85 * lam : lam;
        if (tri.terrain && lam > 0) {
          // near-camera sliver faces (thin and long on screen) catching sun read as white streaks: damp their key light
          const e2 = Math.max((pa[0] - pb[0]) ** 2 + (pa[1] - pb[1]) ** 2, (pb[0] - pc[0]) ** 2 + (pb[1] - pc[1]) ** 2, (pc[0] - pa[0]) ** 2 + (pc[1] - pa[1]) ** 2);
          const area2 = Math.abs((pb[0] - pa[0]) * (pc[1] - pa[1]) - (pc[0] - pa[0]) * (pb[1] - pa[1]));
          if (e2 > 3600) kk *= H.lerp(0.15, 1, H.smooth(0.06, 0.2, area2 / e2));
        }
        const fillP = tri.pillar ? Math.max(0, dot(n, norm([-0.55, 0.6, -0.6]))) * 0.45 : 0;
        col = [0, 1, 2].map(i => tri.col[i] * (AMB[i] / 255 * (tri.pillar ? 0.6 : 0.85) + SUN_COL[i] / 255 * kk * 0.95 + [176, 186, 255][i] / 255 * fillP));
        if (tri.water) {
          const v = norm(toCam), rf = sub(scl(n, 2 * dot(n, v)), v);
          const spec = Math.pow(Math.max(0, dot(rf, norm([0.5, 0.2, 1]))), 12);
          col = H.mix(H.mix([120, 110, 190], [250, 170, 165], H.clamp(0.45 + n[0] * 4 + n[2] * 2)), [255, 236, 200], spec);
        }
      }
      const fogK = H.clamp(Math.pow(H.smooth(40, 260, depth), 1.15) * 0.9) * (tri.crystal || tri.sign ? 0.3 : 1);
      col = H.mix(col, H.mix(FOG, FOG_HI, H.clamp(cen[1] / 30)), fogK);
      out.push({ pa, pb, pc, depth, col, cry: tri.crystal });
    }
    out.sort((p, q) => q.depth - p.depth);
    ctx.lineJoin = 'round';
    for (const o of out) {
      const fs = `rgb(${o.col[0] | 0},${o.col[1] | 0},${o.col[2] | 0})`;
      ctx.fillStyle = fs; ctx.lineWidth = 0.9;
      ctx.strokeStyle = o.cry ? `rgb(${Math.min(255, o.col[0] * 1.18 + 14) | 0},${Math.min(255, o.col[1] * 1.18 + 14) | 0},${Math.min(255, o.col[2] * 1.18 + 14) | 0})` : fs;
      if (o.cry) ctx.lineWidth = Math.max(1, Math.min(2, 1400 / o.depth / 20));
      ctx.beginPath(); ctx.moveTo(o.pa[0], o.pa[1]); ctx.lineTo(o.pb[0], o.pb[1]); ctx.lineTo(o.pc[0], o.pc[1]); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // crystal glow
    { const p = cam.proj(CRY); if (p[2] > 1) { const r = 9 * 760 / p[2]; const g = ctx.createRadialGradient(p[0], p[1], r * 0.4, p[0], p[1], r * 1.6); g.addColorStop(0, `rgba(255,200,230,${0.25 + 0.3 * errFlash})`); g.addColorStop(1, 'rgba(255,200,230,0)'); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(p[0] - r * 2, p[1] - r * 2, r * 4, r * 4); ctx.globalCompositeOperation = 'source-over'; } }

    // ---------- overlays that land on the 3D objects ----------
    const sz = (p, wu) => wu * 760 / p[2];
    for (const cd of cards) {
      const p = cam.proj([cd.x, cd.y + 2.4, cd.z]); if (p[2] < 1) continue;
      const r = sz(p, 1.3);
      if (r > 1.5) lpPetFace(ctx, cd.kind, p[0], p[1], r, cd.kind === 'cat' ? [170, 160, 230] : [242, 180, 130], '#2a1f4f');
      const pt = cam.proj([cd.x, cd.y + 5.6, cd.z]);
      const kk = H.clamp(sz(p, 1) / 30) * (cd.test ? 1 : H.clamp((84 - cd.z) / 6));
      if (cd.test) lpTag(ctx, pt[0], pt[1], '?', { k: Math.max(0.5, kk) * EO(5.9, 6.2), bg: '#ff7060', col: '#fff' });
      else if (kk > 0.25) lpTag(ctx, pt[0], pt[1], cd.kind, { k: Math.min(1, kk) * EO(2.4, 2.8), font: '700 28px "Space Grotesk"' });
    }
    // counter tag on the totem
    if (t > 2.6 && t < 7.0) {
      const p = cam.proj([-12, 3 + stackH + 1.5, 40]);
      { const kk2 = H.ease.back(ph(2.7, 3.1)) * (1 - ph(6.6, 7.0)); lpTag(ctx, p[0], p[1] - 70, cnt.toLocaleString('en-US'), { k: kk2, font: '700 66px "Space Grotesk"', h: 96 }); lpTag(ctx, p[0], p[1] - 4, 'examples', { k: kk2, bg: '#2a1f4f', col: '#fff' }); }
    }
    // flow arrow: river of data -> crystal
    if (t > 3.2 && t < 6.6) {
      const a = cam.proj([2, 6, 30]), b = cam.proj([0, 8, 80]);
      const mid = [(a[0] + b[0]) / 2 + 60, Math.min(a[1], b[1]) - 30];
      lpArrow(ctx, a, mid, b, E(3.2, 4.2) * (1 - ph(6.2, 6.6)), [255, 246, 240], 9);
      if (t > 4.0) { const m = cam.proj([0, 14, 84]); lpTag(ctx, m[0] + 150, m[1] - 10, 'the model', { k: H.ease.back(ph(4.0, 4.3)) * (1 - ph(6.3, 6.6)), bg: '#2a1f4f', col: '#fff' }); }
    }
    // loop
    if (t > 6.7 && t < 10.7) {
      const fade = 1 - ph(10.3, 10.7);
      ctx.save(); ctx.globalAlpha = fade;
      const cp = cam.proj(CRY), sp = cam.proj(SIGN), sTop = cam.proj([SIGN[0], SIGN[1] + 3.6, SIGN[2]]);
      const crR = sz(cp, 7);
      // 1 Guess: crystal -> sign
      const ga = [cp[0] + crR * 0.8, cp[1] - crR * 0.2], gb = [sp[0] - sz(sp, 6.4), sp[1]];
      lpArrow(ctx, ga, [(ga[0] + gb[0]) / 2, Math.min(ga[1], gb[1]) - 40], gb, E(6.8, 7.15), [255, 246, 240], 10);
      if (t > 6.9) lpTag(ctx, (ga[0] + gb[0]) / 2, Math.min(ga[1], gb[1]) - 52, '1  Guess', { k: H.ease.back(ph(6.9, 7.2)) });
      // sign text + verdict
      const sw = sz(sp, 6), fs2 = Math.max(10, sz(sp, 2.2));
      if (wrong || right) {
        ctx.save(); ctx.translate(shake * 6, 0);
        lpPetFace(ctx, right ? 'cat' : 'dog', sp[0] - sw * 0.55, sp[1], sz(sp, 1.7), right ? [170, 160, 230] : [242, 180, 130], INK);
        ctx.font = `700 ${fs2}px "Space Grotesk"`; ctx.fillStyle = INK; ctx.textBaseline = 'middle'; ctx.fillText(right ? 'cat' : 'dog?', sp[0] - sw * 0.2, sp[1] + 2);
        ctx.restore();
      }
      if (t > 7.45) {
        lpTag(ctx, sTop[0], sTop[1] - 26, '2  Check', { k: H.ease.back(ph(7.45, 7.75)) });
        const bk = right ? H.ease.back(ph(9.55, 9.85)) : H.ease.back(ph(7.45, 7.7));
        const bx = sp[0] + sw * 0.82, by = sp[1] - sz(sp, 2.6);
        ctx.save(); ctx.translate(bx, by); ctx.scale(bk, bk); ctx.rotate(0.12);
        const hexR = 24; ctx.fillStyle = right ? '#3ccf9a' : '#ff5a4a';
        ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.lineTo(Math.cos(a) * hexR, Math.sin(a) * hexR); } ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.moveTo(0, 0); for (let i = 3; i <= 6; i++) { const a = i / 6 * Math.PI * 2; ctx.lineTo(Math.cos(a) * hexR, Math.sin(a) * hexR); } ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineJoin = 'miter'; ctx.beginPath();
        if (right) { ctx.moveTo(-10, 0); ctx.lineTo(-3, 8); ctx.lineTo(11, -9); } else { ctx.moveTo(-8, -8); ctx.lineTo(8, 8); ctx.moveTo(8, -8); ctx.lineTo(-8, 8); }
        ctx.stroke(); ctx.restore();
        if (!right) {
          // emphasis: faceted burst ring around the wrong answer
          const pr = EO(7.45, 7.9);
          ctx.save(); ctx.globalAlpha = fade * (0.55 + 0.45 * Math.sin(t * 12));
          ctx.strokeStyle = '#ff5a4a'; ctx.lineWidth = 4; ctx.beginPath();
          const rr = sw * 1.25;
          for (let i = 0; i <= 10 * pr; i++) { const a = i / 10 * Math.PI * 2; ctx.lineTo(sp[0] + Math.cos(a) * rr, sp[1] + Math.sin(a) * rr * 0.62); }
          ctx.stroke(); ctx.restore();
          lpTag(ctx, sp[0], sp[1] + sz(sp, 4.4), 'answer: cat', { k: H.ease.back(ph(7.65, 7.95)), bg: '#2a1f4f', col: '#fff', font: '700 28px "Space Grotesk"' });
        }
      }
      // 3 Adjust: error shard flies back, crystal facets realign
      if (t > 8.0) {
        const a = [sTop[0] - 10, sTop[1] - 8], b = [cp[0] + crR * 0.2, cp[1] - crR * 0.9];
        const q = lpArrow(ctx, a, [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 90], b, E(8.0, 8.6), [255, 90, 74], 10);
        if (q && t < 8.8) { const p = q(E(8.0, 8.6)); ctx.fillStyle = 'rgba(255,90,74,0.35)'; ctx.beginPath(); ctx.arc(p[0], p[1], 16, 0, 7); ctx.fill(); }
        lpTag(ctx, cp[0], cp[1] + crR * 1.5, '3  Adjust', { k: H.ease.back(ph(8.5, 8.8)), bg: '#ff7060', col: '#fff' });
        if (t < 9.3) lpTag(ctx, (a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 64, 'error', { k: H.ease.back(ph(8.1, 8.35)) * (1 - ph(9.0, 9.3)), bg: '#ffe0da', col: '#c2382a', font: '700 28px "Space Grotesk"' });
      }
      if (right) lpTag(ctx, sTop[0] + 20, sTop[1] - 26, 'Guess again ✓', { k: H.ease.back(ph(9.55, 9.85)), bg: '#3ccf9a', col: '#fff' });
      ctx.restore();
    }
    // accuracy tag riding the newest pillar
    if (t > 10.9) {
      const i = Math.min(7, Math.max(0, Math.floor((t - 11.0) / 0.2)));
      const cur = Math.round(H.lerp(61, 97, H.ease.inOut(ph(11.0, 12.6))));
      const x = 22 + i * 3.6, z = 112 + i * 1.0, h = (ACCS[i] - 50) * 0.35 * EO(roundT(i), roundT(i) + 0.4);
      const p = cam.proj([x, 4.4 + h + 1.5, z]);
      const pop = t > 12.6 ? 1 + 0.2 * Math.sin(Math.min(1, (t - 12.6) / 0.35) * Math.PI) : 1;
      { const kk2 = H.ease.back(ph(10.9, 11.2)) * pop; lpTag(ctx, p[0], p[1] - 66, `${cur}%`, { k: kk2, font: '700 70px "Space Grotesk"', h: 100, bg: cur >= 97 ? '#ff7060' : '#fff6f0', col: cur >= 97 ? '#fff' : INK }); lpTag(ctx, p[0], p[1] - 148, 'Accuracy', { k: kk2, bg: '#2a1f4f', col: '#fff' }); }
      const p0 = cam.proj([22, 4.4 + 11 * 0.35 + 1, 112]);
      if (t > 11.2 && t < 13.3) lpTag(ctx, p0[0], p0[1] - 24, 'round 1: 61%', { k: EO(11.2, 11.5) * (1 - ph(13.0, 13.3)), font: '700 28px "Space Grotesk"' });
      if (t > 12.6) { ctx.save(); ctx.globalAlpha = 1 - ph(12.6, 13.3); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; const rr = 110 + 70 * EO(12.6, 13.3); ctx.beginPath(); for (let k2 = 0; k2 <= 6; k2++) { const a = k2 / 6 * Math.PI * 2; ctx.lineTo(p[0] + Math.cos(a) * rr, p[1] - 80 + Math.sin(a) * rr * 0.7); } ctx.stroke(); ctx.restore(); }
      const ax = cam.proj([20, 4.6, 106]), bx = cam.proj([50, 4.6, 120]);
      if (t < 13.3) { ctx.save(); ctx.globalAlpha = EO(11.0, 11.5) * (1 - ph(13.0, 13.3)); ctx.font = '700 28px "Space Grotesk"'; ctx.fillStyle = '#fff6f0'; ctx.fillText('training rounds →', Math.min(ax[0], bx[0]) + 10, Math.max(ax[1], bx[1]) + 30); ctx.restore(); }
    }
    // ---------- hook → header ----------
    {
      const sh = E(1.4, 2.4), a = EO(0.1, 0.6);
      const size = H.lerp(66, 28, sh);
      ctx.save(); ctx.globalAlpha = a; ctx.font = `700 ${size}px "Space Grotesk"`;
      const w = ctx.measureText('How does AI learn?').width;
      const x = H.lerp(640 - w / 2, 48, sh), y = H.lerp(300, 62, sh) + (1 - a) * 24;
      if (sh > 0) { ctx.save(); ctx.globalAlpha = a * sh; ctx.translate(x - 16, y - size * 1.05); const pw = w + 32, phh = size * 1.75, c2 = 12; ctx.fillStyle = 'rgba(42,31,79,0.82)'; ctx.beginPath(); ctx.moveTo(c2, 0); ctx.lineTo(pw, 0); ctx.lineTo(pw, phh - c2); ctx.lineTo(pw - c2, phh); ctx.lineTo(0, phh); ctx.lineTo(0, c2); ctx.closePath(); ctx.fill(); ctx.restore(); }
      ctx.fillStyle = 'rgba(30,20,60,0.35)'; ctx.fillText('How does AI learn?', x + 3, y + 3);
      ctx.fillStyle = '#ffffff'; ctx.fillText('How does AI learn?', x, y);
      const uw = H.lerp(260, 120, sh), uy = y + size * 0.3;
      ctx.fillStyle = '#ff7060'; ctx.beginPath(); ctx.moveTo(x + 2, uy); ctx.lineTo(x + 2 + uw * 0.78, uy); ctx.lineTo(x + uw * 0.72, uy + size * 0.12); ctx.lineTo(x + 2, uy + size * 0.12); ctx.fill();
      ctx.fillStyle = '#ffb08a'; ctx.beginPath(); ctx.moveTo(x + 2 + uw * 0.78, uy); ctx.lineTo(x + uw, uy); ctx.lineTo(x + uw * 0.94, uy + size * 0.12); ctx.lineTo(x + uw * 0.72, uy + size * 0.12); ctx.fill();
      ctx.restore();
    }
    // ---------- takeaway ----------
    if (t > 13.0) {
      const kk = H.ease.back(ph(13.0, 13.45));
      ctx.save(); ctx.translate(640, 600); ctx.scale(kk, kk);
      lpTag(ctx, 0, 0, 'More examples → better guesses', { font: '700 46px "Space Grotesk"', h: 84 });
      ctx.restore();
    }
  }

  // ---------- sound: dusk valley flight (soft wind, river, faceted gusts, a glassy crystal model) ----------
  function lpSound(k) {
    const D = 14.5;
    const ph = (t, a, b) => H.clamp((t - a) / (b - a));
    const inv = (u) => (u < 0.5 ? Math.cbrt(u / 4) : 1 - Math.cbrt((1 - u) * 2) / 2); // inverse of H.ease.inOut
    // crystal: a struck glass facet (body + one inharmonic partial, kept below ~2.4 kHz), with room
    const glass = (t, f, g, p = 0, dur = 0.9, minor) => { const F = k.hz(f); k.tone(t, { f: F, type: 'triangle', dur, gain: 0.09 * g, a: 0.003, pan: p, verb: 0.35, minor }); k.tone(t, { f: F * 2.32, dur: dur * 0.5, gain: 0.03 * g, a: 0.002, pan: p, verb: 0.35, minor }); };
    // faceted tag: a cut-corner tag snapping on (short dry knock with a hard edge, low-mid)
    const facet = (t, f, g, p = 0, minor) => { k.play('tock', t, { f, gain: 0.45 * g, pan: p, minor }); k.noise(t, { dur: 0.02, filter: 'bandpass', f: f * 2.6, q: 3, gain: 0.18 * g, a: 0.001, pan: p, minor }); };
    // camera flight: a soft gust of air, broken into a few angled filter steps (faceted), swelling with camera speed
    const gust = (t0, t1, g = 1) => {
      const d = t1 - t0, steps = [260, 420, 610, 470, 300];
      steps.forEach((f, i) => { const s = t0 + (d * i) / steps.length, dd = (d / steps.length) * 1.9; k.noise(s, { dur: dd, color: 'pink', filter: 'bandpass', f: [[0, f], [dd, f * 1.25]], q: 1.4, gain: 0.04 * g * Math.sin(((i + 0.5) / steps.length) * Math.PI), a: dd * 0.45, verb: 0.15 }); });
    };
    const counter = (a, b, val, f, g, p, minGap, avoid = []) => {
      let last = -1, lastV = val(a);
      const top = Math.abs(val(b) - val(a)) / (b - a) * 2.2 * 0.1;
      for (let t = a; t <= b + 1e-6; t += 1 / 120) {
        const v = val(t); if (v === lastV) continue;
        const speed = Math.abs(val(Math.min(b, t + 0.05)) - val(Math.max(a, t - 0.05)));
        const gap = H.clamp(minGap / Math.max(0.2, Math.min(1, speed / top)), minGap, 0.4);
        if (t - last >= gap && !avoid.some((x) => t > x - 0.03 && t < x + 0.12)) { k.play('tick', t, { f, gain: g, pan: p, minor: true }); k.tone(t, { f: f / 9, dur: 0.03, gain: 0.05 * g, pan: p, minor: true }); last = t; }
        lastV = v;
      }
    };

    k.bed('room', 0, D, { gain: 0.2 });
    k.noise(0, { dur: D, color: 'pink', filter: 'lowpass', f: [[0, 380], [D * 0.5, 520], [D, 360]], gain: 0.03, a: 0.8, hold: D - 1.6, bus: 'amb', minor: true }); // high valley air
    k.music('pad', 0, D, { bpm: 96, gain: 0.25, chords: [['D4', 'F#4', 'A4', 'C#5'], ['B3', 'D4', 'F#4', 'A4'], ['G3', 'B3', 'D4', 'F#4'], ['A3', 'C#4', 'E4', 'G4'], ['D4', 'F#4', 'A4', 'D5']] });

    // ---- hook: question fades up (EO 0.1-0.6), shrinks into the header (1.4-2.4)
    glass(0.12, 'A4', 1.1, 0, 1.4); glass(0.12, 'D4', 0.8, 0, 1.4);
    k.noise(1.4, { dur: 1.0, color: 'pink', filter: 'lowpass', f: [[0, 650], [1.0, 280]], gain: 0.05, a: 0.4, minor: true });
    gust(1.5, 2.9); // dive down into the valley

    // ---- beat 2: river of example cards
    k.noise(2.2, { dur: 4.5, color: 'pink', filter: 'bandpass', f: 1100, q: 0.6, gain: 0.02, a: 0.5, hold: 3.4, bus: 'amb', minor: true }); // the river under the camera
    const busy = []; // card plops + totem rings, kept clear of counter ticks
    for (let j = 0; j < 13; j++) { const t = Math.max(2.3, 2.3 + (j * 4.6 - 2) / 12); if (t > 6.55) break; busy.push(t); const f = 330 + ((j * 37) % 5) * 22; k.tone(t, { f: [[0, f], [0.07, f * 0.55]], dur: 0.11, gain: 0.09, pan: (Math.sin(j * 2.7) * 3) / 12, minor: true }); k.noise(t, { dur: 0.04, filter: 'bandpass', f: 1500, q: 1.5, gain: 0.07, pan: 0, minor: true }); } // a card settles on the water
    k.play('pop', 2.44, { f: 520, gain: 0.5, minor: true }); // cat/dog tags appear on the cards
    facet(2.75, 520, 1, -0.45); // counter tag snaps onto the totem
    // totem grows one faceted stone ring at a time (ceil(stackH/1.2), stackH = 1 + 9 * EO(2.8,5.8)^1.2)
    for (let n = 2; n <= 9; n++) { const t = 2.8 + 3.0 * (1 - Math.cbrt(1 - Math.pow(((n - 1) * 1.2 - 1) / 9 + 1e-4, 1 / 1.2))); if (t < 5.8) { busy.push(t); k.play('tock', t, { f: 210 + n * 8, gain: 0.5, pan: -0.45, minor: true }); k.noise(t, { dur: 0.06, color: 'brown', filter: 'lowpass', f: 600, gain: 0.25, pan: -0.45, minor: true }); } }
    counter(2.95, 5.66, (t) => Math.floor(1e6 * Math.pow(H.ease.out(ph(t, 2.9, 5.7)), 1.6)), 3000, 1.1, -0.45, 1 / 8, busy);
    // two-tone ribbon arrow unfurls toward the crystal (E 3.2-4.2), then "the model" tag
    k.noise(3.2, { dur: 1.0, color: 'pink', filter: 'bandpass', f: [[0, 500], [1.0, 1400]], q: 1.2, gain: 0.06, a: 0.5, pan: 0.2, minor: true });
    facet(4.04, 470, 0.9, 0.35);
    // 1,000,000 lands
    facet(5.7, 600, 1.1, -0.45); glass(5.7, 'A4', 1, -0.4); glass(5.7, 'E5', 0.6, -0.4);

    // ---- beat 3: test card, the crystal guesses
    facet(5.93, 420, 0.9); // coral "?" on the test card
    gust(5.7, 6.9);
    k.play('thud', 6.62, { f: 110, gain: 0.35, pan: 0.5 }); k.noise(6.62, { dur: 0.3, color: 'brown', filter: 'lowpass', f: 500, gain: 0.12, pan: 0.5 }); // answer sign rises out of the plateau
    k.noise(6.8, { dur: 0.35, color: 'pink', filter: 'bandpass', f: [[0, 600], [0.35, 1500]], q: 1.2, gain: 0.07, a: 0.15, pan: 0.2, minor: true }); // Guess ribbon
    facet(6.93, 560, 0.9, 0.1); // "1 Guess"
    glass(7.05, 'F#4', 0.9, 0.5); // "dog?" appears on the sign
    // CHECK: wrong. sign shakes, hex X badge stamps, burst ring
    k.play('thud', 7.45, { f: 120, gain: 0.7, pan: 0.5 });
    k.play('error', 7.47, { f: 'G3', gain: 0.85, pan: 0.5 });
    // ADJUST: the error shard flies back to the crystal (E 8.0-8.6), crystal flushes coral
    k.noise(8.0, { dur: 0.6, color: 'pink', filter: 'bandpass', f: [[0, 1300], [0.6, 450]], q: 1.4, gain: 0.08, a: 0.3, pan: 0.2 });
    glass(8.6, 'C#4', 0.9, 0); k.tone(8.6, { f: 'C4', type: 'triangle', dur: 0.5, gain: 0.05, verb: 0.3 }); // shard hits: a slightly sour facet ring
    facet(8.15, 640, 0.9, 0.2, true); // "error"
    facet(8.55, 500, 0.9, 0); // "3 Adjust"
    // facets realign (E 8.6-9.4): one glassy clink per facet group turning, climbing into tune
    ['D4', 'F#4', 'A4', 'B4', 'D5', 'F#5'].forEach((n, i) => glass(8.6 + 0.8 * inv((i + 0.5) / 6), n, 0.75, (i - 2.5) * 0.15, 0.7, true));
    // CORRECT: sign reads cat (9.5), check badge + "Guess again" (9.55)
    glass(9.5, 'D5', 0.5, 0.5);
    k.play('success', 9.56, { f: 'D5', gain: 0.45, pan: 0.5 });
    k.noise(10.4, { dur: 0.6, color: 'pink', filter: 'lowpass', f: [[0, 600], [0.6, 250]], gain: 0.05, a: 0.2, pan: 0.5, minor: true }); // sign sinks away

    // ---- beat 4: pillars rise on the plateau, one per training round
    gust(10.2, 11.2);
    facet(10.93, 560, 0.8); // Accuracy tag
    ['D3', 'E3', 'F#3', 'A3', 'B3', 'D4', 'E4', 'F#4'].forEach((n, i) => {
      const t = 11.0 + i * 0.2 + 0.02, F = k.hz(n);
      k.noise(t, { dur: 0.22, color: 'brown', filter: 'bandpass', f: [[0, 250], [0.2, 600]], q: 1, gain: 0.2, a: 0.03, pan: -0.2 + i * 0.08, minor: i < 7 }); // stone grinding up
      k.tone(t, { f: [[0, F * 0.8], [0.1, F]], type: 'triangle', dur: 0.25, gain: 0.12, pan: -0.2 + i * 0.08, minor: i < 7 });
    });
    counter(11.03, 12.56, (t) => Math.round(H.lerp(61, 97, H.ease.inOut(ph(t, 11.0, 12.6)))), 2600, 0.9, 0.2, 1 / 12, [0, 1, 2, 3, 4, 5, 6, 7].map((i) => 11.02 + i * 0.2));
    // 97%: the big hit. coral tag swells, hexagonal ring expands: a full crystal chord
    k.play('impact', 12.6, { gain: 1.1 });
    ['D4', 'A4', 'D5', 'F#5'].forEach((n, i) => glass(12.6 + i * 0.03, n, 1.7 - i * 0.25, (i - 1.5) * 0.25, 1.6));
    gust(12.8, 13.9, 0.9); // pull back over the valley
    // takeaway lands (back 13.0-13.45): resolve
    facet(13.08, 470, 0.9);
    ['A4', 'D5'].forEach((n, i) => glass(13.3 + i * 0.09, n, 1, (i - 0.5) * 0.3, 1.4)); k.tone(13.3, { f: 'D3', type: 'triangle', dur: 1.2, gain: 0.12, a: 0.02 });
  }

  registerStyle({
    id: 'low-poly',
    name: 'Low-Poly Faceted',
    category: 'Dimensional',
    description: 'Faceted low-poly 3D: a triangulated noise terrain with flat per-face Lambert shading, atmospheric depth fog, cone trees and a faceted rocket lifting off into a dawn gradient sky.',
    motion: 'Terrain facets flip into place from the camera out to the horizon, trees and the launch pad pop up, then the rocket ignites and lifts off on a faceted flame and smoke column while the camera dollies forward.',
    duration: 5,
    fonts: ['700 54px "Space Grotesk"', '400 16px "Space Grotesk"', '700 24px "Space Grotesk"'],
    frameT: 4.5,
    readsPixels: false,
    explainerDuration: 14.5,
    explainerNote: 'A continuous camera flight through one faceted valley (overview → river of labelled example cards → floating crystal model whose facets realign → pillar chart on a plateau → pull back), with angular two-tone ribbon arrows, cut-corner tags pinned to objects and Space Grotesk counters.',
    explainer: lpExplainer,
    explainerSound: lpSound,
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(31);
      const R = H.rng(77);
      const SUN_DIR = norm([0.75, 0.55, 0.45]);
      const SUN_COL = [255, 226, 190], AMB = [104, 98, 150];
      const FOG = [236, 160, 150], FOG_HI = [180, 140, 190];
      const cam = makeCamera([0, 22, -18.4 + t * 0.9], 0.13, 780, W, H_);
      const ph = (a, b) => H.clamp((t - a) / (b - a));

      // ---------- sky ----------
      const sky = ctx.createLinearGradient(0, 0, 0, 300);
      sky.addColorStop(0, '#1b2350'); sky.addColorStop(0.38, '#4d3f84'); sky.addColorStop(0.7, '#c06a93'); sky.addColorStop(1, '#ffb08a');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H_);
      // stars
      for (let i = 0; i < 90; i++) {
        const x = R() * W, y = R() * 160, a = (1 - y / 160) * R() * 0.8;
        ctx.fillStyle = `rgba(255,240,255,${a})`; ctx.fillRect(x, y, R() < 0.1 ? 2 : 1, R() < 0.1 ? 2 : 1);
      }
      // low-poly sun (faceted disc) with halo
      const sunC = [560, 232 + (1 - H.ease.out(H.clamp(t / 4.5))) * 34];
      {
        const g = ctx.createRadialGradient(sunC[0], sunC[1], 30, sunC[0], sunC[1], 330);
        g.addColorStop(0, 'rgba(255,214,160,0.55)'); g.addColorStop(1, 'rgba(255,214,160,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H_);
        const n = 14, r = 62;
        for (let i = 0; i < n; i++) {
          const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
          const k = 0.5 + 0.5 * Math.cos(a0 - 2.3);
          ctx.fillStyle = H.rgba(H.mix('#ffd49a', '#fff4d8', k));
          ctx.beginPath(); ctx.moveTo(sunC[0], sunC[1]); ctx.lineTo(sunC[0] + Math.cos(a0) * r, sunC[1] + Math.sin(a0) * r); ctx.lineTo(sunC[0] + Math.cos(a1) * r, sunC[1] + Math.sin(a1) * r); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }
      // faceted clouds (2D low-poly)
      const cloud = (cx, cy, s, a, seed) => {
        const cr = H.rng(seed);
        const bumps = [[-0.75, 0.05, 0.38], [-0.3, -0.18, 0.5], [0.22, -0.28, 0.58], [0.72, -0.02, 0.4]];
        ctx.save(); ctx.beginPath(); ctx.rect(cx - s * 2, cy - s * 2, s * 4, s * 2 + s * 0.18); ctx.clip();
        for (const [bx, by, br] of bumps) {
          const ox = cx + bx * s, oy = cy + by * s, rr = br * s, n = 7, rot = cr() * 3;
          for (let i = 0; i < n; i++) {
            const a0 = rot + (i / n) * Math.PI * 2, a1 = rot + ((i + 1) / n) * Math.PI * 2;
            const lit = 0.5 - 0.5 * Math.sin((a0 + a1) / 2) ; // top facets lighter
            const c = H.mix([150, 108, 168], [255, 206, 200], H.clamp(lit * 0.9 + cr() * 0.15));
            ctx.fillStyle = H.rgba(c, a); ctx.strokeStyle = H.rgba(c, a); ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(ox, oy + rr * 0.15); ctx.lineTo(ox + Math.cos(a0) * rr, oy + Math.sin(a0) * rr); ctx.lineTo(ox + Math.cos(a1) * rr, oy + Math.sin(a1) * rr); ctx.closePath(); ctx.fill(); ctx.stroke();
          }
        }
        ctx.restore();
      };
      ctx.globalAlpha = 1;
      cloud(300 + t * 6, 268, 80, 0.9, 1); cloud(1080 - t * 4, 120, 75, 0.8, 2); cloud(900 + t * 3, 240, 48, 0.7, 3);

      // ---------- build triangle list ----------
      const tris = [];
      const pushTri = (a, b, c, col, opt = {}) => tris.push({ p: [a, b, c], col, ...opt });

      // terrain heightfield
      const PAD = [12, 58];
      const height = (x, z) => {
        const valley = Math.pow(Math.abs(x - 6 * Math.sin(z * 0.03)) / 60, 1.8) * 17;
        const far = H.smooth(90, 168, z) * 14 + Math.max(0, nz.n2(x * 0.035, 3.3)) * 26 * H.smooth(110, 168, z);
        let h = nz.fbm2(x * 0.045, z * 0.045, 4) * 9 + nz.fbm2(x * 0.11 + 10, z * 0.11, 2) * 2.5 + valley + far - 3;
        // plateau for launch pad
        const dp = Math.hypot(x - PAD[0], z - PAD[1]);
        h = H.lerp(2.2, h, H.smooth(5, 11, dp));
        return h;
      };
      const WATER = -0.6;
      const CELL = 3.6, X0 = -78, X1 = 78, Z0 = 2, Z1 = 170;
      const nx = Math.round((X1 - X0) / CELL), nzc = Math.round((Z1 - Z0) / CELL);
      const jr = H.rng(5);
      const V = [];
      for (let j = 0; j <= nzc; j++) {
        const row = [];
        for (let i = 0; i <= nx; i++) {
          const cellScale = 1 + j * 0.035; // larger cells far away
          let x = X0 + i * CELL + (i > 0 && i < nx ? jr.range(-0.38, 0.38) * CELL : 0);
          let z = Z0 + j * CELL + (j > 0 ? jr.range(-0.38, 0.38) * CELL : 0);
          void cellScale;
          row.push([x, height(x, z), z]);
        }
        V.push(row);
      }
      const terrainColor = (y, slope, z) => {
        let c;
        if (y < WATER + 0.6) c = [214, 196, 150]; // sand
        else if (y < 6) c = H.mix([86, 160, 112], [60, 128, 96], H.clamp(y / 6));
        else if (y < 14) c = H.mix([60, 128, 96], [110, 112, 120], H.smooth(9, 14, y));
        else if (y < 22) c = [118, 110, 128];
        else c = [244, 238, 248];
        if (slope > 0.55 && y > 3 && y < 22) c = H.mix(c, [124, 112, 124], 0.6);
        return c;
      };
      for (let j = 0; j < nzc; j++) for (let i = 0; i < nx; i++) {
        const a = V[j][i], b = V[j][i + 1], c = V[j + 1][i], d = V[j + 1][i + 1];
        const flip = (i + j) % 2 === 0;
        const faces = flip ? [[a, c, b], [b, c, d]] : [[a, c, d], [a, d, b]];
        for (const f of faces) {
          const my = (f[0][1] + f[1][1] + f[2][1]) / 3;
          if (Math.max(f[0][1], f[1][1], f[2][1]) < WATER) {
            const w = f.map(p => [p[0], WATER + nz.n2(p[0] * 0.4, p[2] * 0.4) * 0.35, p[2]]);
            pushTri(w[0], w[1], w[2], [96, 120, 190], { water: true });
            continue;
          }
          const n = norm(cross(sub(f[1], f[0]), sub(f[2], f[0])));
          const slope = 1 - Math.abs(n[1]);
          pushTri(f[0], f[1], f[2], terrainColor(my, slope, f[0][2]), { terrain: true });
        }
      }

      // trees: low-poly conifers (two stacked 5-sided cones)
      const meshTris = (verts, faces, col, center, opt) => {
        for (const [i, j, k] of faces) pushTri(verts[i], verts[j], verts[k], col, { center, ...opt });
      };
      const cone = (base, r, h, sides, col, rot = 0) => {
        const vs = [add3(base, [0, h, 0])];
        for (let i = 0; i < sides; i++) { const a = rot + (i / sides) * Math.PI * 2; vs.push(add3(base, [Math.cos(a) * r, 0, Math.sin(a) * r])); }
        const fs = []; for (let i = 0; i < sides; i++) fs.push([0, 1 + i, 1 + ((i + 1) % sides)]);
        meshTris(vs, fs, col, add3(base, [0, h * 0.3, 0]), { tree: true });
      };
      const tr = H.rng(9);
      let placed = 0;
      for (let k = 0; k < 900 && placed < 150; k++) {
        const x = tr.range(-60, 60), z = tr.range(10, 110);
        const y = height(x, z);
        if (y < 0.4 || y > 11) continue;
        if (Math.hypot(x - PAD[0], z - PAD[1]) < 9) continue;
        if (nz.fbm2(x * 0.05 + 40, z * 0.05, 2) < -0.05) continue; // clustered forests
        const s = tr.range(1.3, 2.1) * (1 + z / 160);
        const green = H.mix([40, 110, 90], [70, 140, 100], tr());
        const rot = tr() * 6;
        cone([x, y - 0.2, z], s * 0.75, s * 1.6, 5, green, rot);
        cone([x, y + s * 0.85, z], s * 0.55, s * 1.4, 5, H.mix(green, [120, 180, 120], 0.25), rot + 0.6);
        placed++;
      }
      // rocks
      for (let k = 0; k < 18; k++) {
        const x = tr.range(-30, 40), z = tr.range(14, 60), y = height(x, z);
        if (y < WATER + 0.2) continue;
        const r = tr.range(0.6, 1.4);
        const vs = ICO.v.map(v => [x + v[0] * r * tr.range(0.8, 1.2), y + v[1] * r * 0.6, z + v[2] * r * tr.range(0.8, 1.2)]);
        meshTris(vs, ICO.f, [140, 128, 150], [x, y, z], { tree: true });
      }

      // launch pad + tower
      const padY = 2.2;
      const boxMesh = (x0, y0, z0, x1, y1, z1, col) => {
        const v = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
        const f = [[4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]];
        meshTris(v, f, col, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], { build: 1.25 });
      };
      boxMesh(PAD[0] - 4, padY - 1, PAD[1] - 4, PAD[0] + 4, padY + 0.5, PAD[1] + 4, [180, 176, 196]);
      boxMesh(PAD[0] - 4.2, padY + 0.5, PAD[1] + 0.6, PAD[0] - 3, padY + 16, PAD[1] + 1.8, [200, 90, 80]);
      boxMesh(PAD[0] - 4.2, padY + 13, PAD[1] + 0.6, PAD[0] - 0.8, padY + 13.8, PAD[1] + 1.8, [200, 90, 80]);

      // rocket (8-sided body + nose + fins), climbing
      const tt = Math.max(0, t - 2.3);
      const climb = -3.6 + 4.0 * tt * tt;
      const ign = H.ease.out(ph(1.85, 2.3));
      const rb = [PAD[0] + climb * 0.08, padY + 4 + climb, PAD[1]];
      {
        const sides = 8, r = 1.35, hb = 8.5;
        const body = (y0, y1, rr0, rr1, col) => {
          const vs = [];
          for (let i = 0; i < sides; i++) { const a = (i / sides) * Math.PI * 2 + 0.2; vs.push(add3(rb, [Math.cos(a) * rr0, y0, Math.sin(a) * rr0])); }
          for (let i = 0; i < sides; i++) { const a = (i / sides) * Math.PI * 2 + 0.2; vs.push(add3(rb, [Math.cos(a) * rr1, y1, Math.sin(a) * rr1])); }
          const fs = []; for (let i = 0; i < sides; i++) { const j = (i + 1) % sides; fs.push([i, j, sides + j], [i, sides + j, sides + i]); }
          meshTris(vs, fs, col, add3(rb, [0, (y0 + y1) / 2, 0]), { rocket: true });
        };
        body(0, 1.6, r * 1.05, r, [255, 112, 96]);
        body(1.6, hb, r, r, [244, 240, 250]);
        body(hb, hb + 1.1, r, r * 0.92, [255, 112, 96]);
        // nose cone
        const vs = [add3(rb, [0, hb + 4.4, 0])];
        for (let i = 0; i < sides; i++) { const a = (i / sides) * Math.PI * 2 + 0.2; vs.push(add3(rb, [Math.cos(a) * r * 0.92, hb + 1.1, Math.sin(a) * r * 0.92])); }
        const fs = []; for (let i = 0; i < sides; i++) fs.push([0, 1 + i, 1 + ((i + 1) % sides)]);
        meshTris(vs, fs, [244, 240, 250], add3(rb, [0, hb + 2, 0]), { rocket: true });
        // window (small octagon facing camera) handled as two tris
        // fins (double-sided)
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2 + Math.PI / 4 + 0.2;
          const o = [Math.cos(a), 0, Math.sin(a)];
          const p0 = add3(rb, add3(scl(o, r * 0.95), [0, 3.4, 0])), p1 = add3(rb, add3(scl(o, r * 0.95), [0, -0.2, 0])), p2 = add3(rb, add3(scl(o, r + 2.2), [0, -1.4, 0]));
          pushTri(p0, p1, p2, [235, 92, 84], { twoSided: true, rocket: true });
        }
        // flame: emissive faceted cones
        const fl = (1 + Math.sin(t * 30) * 0.08) * ign * (1 + Math.sin(t * 47) * 0.05);
        const flame = (len, rr, col) => {
          const v = [add3(rb, [0, -len * fl, 0])];
          for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; v.push(add3(rb, [Math.cos(a) * rr, -0.2, Math.sin(a) * rr])); }
          for (let i = 0; i < 7; i++) pushTri(v[0], v[1 + i], v[1 + ((i + 1) % 7)], H.mix(col, [255, 255, 230], (i % 3) * 0.18), { emissive: true, center: add3(rb, [0, -len * 0.3, 0]), bias: -0.5 });
        };
        if (ign > 0.01) { flame(9, 1.25, [255, 140, 60]); flame(5.5, 0.9, [255, 220, 120]); }
      }
      // smoke trail: faceted puffs from pad up to rocket
      const pr = H.rng(21);
      const trailTop = rb[1] - 7;
      for (let k = 0; k < 26 && trailTop > padY + 2.5; k++) {
        const u = k / 25;
        const y = H.lerp(padY + 1, trailTop, u);
        const spread = (1 - u) * 4 + 0.8;
        const x = H.lerp(PAD[0], rb[0], u) + pr.range(-1, 1) * spread * 0.6;
        const z = PAD[1] + pr.range(-1, 1) * spread * 0.6 - (1 - u) * 2;
        const r = (1 - u) * 2.6 + 0.9 + pr() * 0.8 + Math.sin(t + k) * 0.12;
        const vs = ICO.v.map(v => [x + v[0] * r * pr.range(0.85, 1.15), y + v[1] * r * 0.85, z + v[2] * r * pr.range(0.85, 1.15)]);
        meshTris(vs, ICO.f, H.mix([250, 236, 240], [220, 205, 225], pr()), [x, y, z], { smoke: true });
      }
      // ground smoke billow around pad
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2 + pr() * 0.3, d = pr.range(5, 9);
        const x = PAD[0] + Math.cos(a) * d, z = PAD[1] + Math.sin(a) * d * 0.7;
        const y = Math.max(height(x, z), padY) + 1;
        const r = pr.range(1.8, 3.0) * H.ease.out(ph(1.95 + k * 0.03, 2.8 + k * 0.03));
        if (r < 0.05) continue;
        const vs = ICO.v.map(v => [x + v[0] * r, y + v[1] * r * 0.7, z + v[2] * r]);
        meshTris(vs, ICO.f, [246, 232, 238], [x, y, z], { smoke: true });
      }

      // ---------- shade, cull, project, sort ----------
      const out = [];
      for (const tri of tris) {
        const [a, b, c] = tri.p;
        let n = norm(cross(sub(b, a), sub(c, a)));
        const cen = scl(add3(add3(a, b), c), 1 / 3);
        if (tri.terrain || tri.water) { if (n[1] < 0) n = scl(n, -1); }
        else if (tri.center) { if (dot(n, sub(cen, tri.center)) < 0) n = scl(n, -1); }
        const toCam = sub(cam.pos, cen);
        if (tri.twoSided) { if (dot(n, toCam) < 0) n = scl(n, -1); }
        else if (dot(n, toCam) <= 0) continue; // back-face cull
        let pa = cam.proj(a), pb = cam.proj(b), pc = cam.proj(c);
        if (pa[2] < 0.5 || pb[2] < 0.5 || pc[2] < 0.5) continue;
        const depth = (pa[2] + pb[2] + pc[2]) / 3 + (tri.bias || 0);
        // build: facets flip in from the camera out to the horizon (scale up about their screen centroid)
        let flash = 0;
        if (!tri.smoke && !tri.emissive) {
          const jit = (Math.sin(cen[0] * 12.9898 + cen[2] * 78.233) * 43758.5453) % 1;
          let at = tri.rocket ? 1.55 : tri.build ? tri.build : 0.05 + H.clamp(depth / 175) * 1.3 + Math.abs(jit) * 0.22 + (tri.tree ? 0.35 : 0);
          const pr2 = H.ease.out(ph(at, at + 0.38));
          if (pr2 <= 0) continue;
          if (pr2 < 1) {
            const mx = (pa[0] + pb[0] + pc[0]) / 3, my = (pa[1] + pb[1] + pc[1]) / 3;
            const sq = (p) => [mx + (p[0] - mx) * pr2, my + (p[1] - my) * pr2, p[2]];
            pa = sq(pa); pb = sq(pb); pc = sq(pc); flash = (1 - pr2) * 0.7;
          }
        }
        let col;
        if (tri.emissive) col = tri.col;
        else {
          const lam = Math.max(0, dot(n, SUN_DIR));
          const k = tri.smoke ? 0.55 + 0.45 * lam : tri.rocket ? 0.3 + 0.8 * lam : lam;
          col = [0, 1, 2].map(i => tri.col[i] * (AMB[i] / 255 * 0.85 + SUN_COL[i] / 255 * k * 0.95));
          if (tri.water) {
            // facet glints of sky + sun
            const v = norm(toCam), rf = sub(scl(n, 2 * dot(n, v)), v);
            const spec = Math.pow(Math.max(0, dot(rf, norm([0.5, 0.2, 1]))), 12);
            col = H.mix(H.mix([120, 110, 190], [250, 170, 165], H.clamp(0.45 + n[0] * 4 + n[2] * 2)), [255, 236, 200], spec);
          }
          if (tri.smoke) col = H.mix(col, [255, 210, 200], 0.15);
        }
        // atmospheric fog by depth (warmer near horizon, cooler on high peaks)
        const fogK = tri.emissive ? 0 : H.clamp(Math.pow(H.smooth(30, 185, depth), 1.15) * 0.9);
        const fc = H.mix(FOG, FOG_HI, H.clamp(cen[1] / 30));
        col = H.mix(col, fc, fogK);
        if (flash) col = H.mix(col, [255, 236, 226], flash);
        out.push({ pa, pb, pc, depth, col });
      }
      out.sort((u, v) => v.depth - u.depth);
      ctx.lineJoin = 'round';
      for (const o of out) {
        const fs = `rgb(${o.col[0] | 0},${o.col[1] | 0},${o.col[2] | 0})`;
        ctx.fillStyle = fs; ctx.strokeStyle = fs; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(o.pa[0], o.pa[1]); ctx.lineTo(o.pb[0], o.pb[1]); ctx.lineTo(o.pc[0], o.pc[1]); ctx.closePath();
        ctx.fill(); ctx.stroke();
      }
      // flame glow
      {
        const p = cam.proj(add3(rb, [0, -2, 0]));
        const g = ctx.createRadialGradient(p[0], p[1], 2, p[0], p[1], 120);
        g.addColorStop(0, `rgba(255,200,120,${0.55 * ign})`); g.addColorStop(1, 'rgba(255,160,100,0)');
        ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(p[0] - 130, p[1] - 130, 260, 260); ctx.globalCompositeOperation = 'source-over';
      }

      // ---------- type ----------
      const kick = 'EPISODE 07  —  ROCKET SCIENCE';
      ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '400 16px "Space Grotesk"';
      ctx.fillText(kick.slice(0, Math.floor(kick.length * ph(1.3, 1.8))), 72, 96);
      const tp = H.ease.out(ph(1.6, 2.15));
      ctx.save(); ctx.beginPath(); ctx.rect(60, 100, 700, 64); ctx.clip();
      ctx.fillStyle = '#ffffff'; ctx.font = '700 54px "Space Grotesk"';
      ctx.fillText('Next stop: orbit', 70, 152 + (1 - tp) * 62); ctx.restore();
      const ul = H.ease.out(ph(2.0, 2.4));
      ctx.save(); ctx.beginPath(); ctx.rect(60, 165, 10 + 180 * ul, 20); ctx.clip();
      // faceted underline
      ctx.fillStyle = '#ff7060'; ctx.beginPath(); ctx.moveTo(72, 170); ctx.lineTo(200, 170); ctx.lineTo(188, 178); ctx.lineTo(72, 178); ctx.fill();
      ctx.fillStyle = '#ffb08a'; ctx.beginPath(); ctx.moveTo(200, 170); ctx.lineTo(236, 170); ctx.lineTo(224, 178); ctx.lineTo(188, 178); ctx.fill();
      ctx.restore();
    },
  });
}
```
